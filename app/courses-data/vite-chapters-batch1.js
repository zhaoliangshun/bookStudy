// =============================================================
// Vite 实战教程 —— 第一批章节（快速上手 + 配置基础，共 7 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   快速上手：
//     1. vite-intro      — Vite 是什么 & 为什么快
//     2. vite-create     — 创建第一个项目
//     3. vite-dev-build  — dev / build / preview 三件套
//   配置基础：
//     4. vite-config     — vite.config.js 基础结构
//     5. vite-alias      — 路径别名 @
//     6. vite-server     — 端口、自动打开、CORS
//     7. vite-proxy      — 开发代理解决跨域
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
  // 第一章：Vite 是什么 & 为什么快
  // =========================================================
  {
    id: "vite-intro",
    group: "快速上手",
    icon: "⚡",
    title: "Vite 是什么 & 为什么快",
    content: `## 一句话理解 Vite

**Vite**（发音 /viːt/，类似"维特"）是 Vue 作者尤雨溪在 2020 年开源的**下一代前端构建工具**。它的核心卖点只有两个字：**快**。

一个典型的 Vite 项目，开发服务器**毫秒级启动**，改一行代码**瞬间热更新**，不用等 Webpack 那漫长的编译进度条。

> **定位**：Vite 是开发阶段的开发服务器（dev server）+ 生产阶段的打包器（bundler，基于 Rollup）的**一体化工具链**。你可以把它理解为"比 Webpack 快得多的替代品"。

---

## 为什么 Vite 这么快？

这是理解 Vite 的关键，也是面试常考点。原因有两个阶段：

### 1. 开发阶段：利用浏览器原生 ES Module

传统工具（Webpack、Rollup）在启动开发服务器时，会**先把所有模块打包成一个 bundle**，再交给浏览器。项目越大，打包越慢。

Vite 完全不同。它启动时**不打包**，而是直接启动服务器。当浏览器请求某个文件时，Vite 才**按需编译**这一个文件，然后返回。浏览器原生支持 ES Module（\`<script type="module">\`），所以可以直接加载：

\`\`\`html
<!-- 浏览器看到这个，会发起对 /src/main.js 的请求 -->
<script type="module" src="/src/main.js"></script>
\`\`\`

如果 \`main.js\` 里 \`import\` 了 \`./App.vue\`，浏览器再发一个请求要 \`App.vue\`，Vite 即时编译返回。**用到哪个文件才编译哪个文件**，所以项目再大，启动时间都几乎不变。

### 2. 生产阶段：用 Rollup 打包

生产环境不能用一堆零散的 ESM 请求（HTTP 请求数太多、旧浏览器不支持），所以 Vite 在 \`vite build\` 时切换成 **Rollup** 进行打包，输出优化过的静态资源（tree-shaking、压缩、分包都靠 Rollup）。

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

现在 Vite 已经是**新项目的默认选择**，Vue 官方脚手架、Nuxt、SvelteKit、Remix（部分）、Astro 都内置或基于 Vite。

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
  // 第二章：创建第一个项目
  // =========================================================
  {
    id: "vite-create",
    group: "快速上手",
    icon: "🚀",
    title: "创建第一个项目",
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

如果不想一步步选，可以直接带参数：

\`\`\`bash
# 模板名格式：框架-语言，例如 react-ts、vue、vanilla-ts
npm create vite@latest my-app -- --template react-ts
\`\`\``,
    code: `// 演示：解析 npm create vite 生成的典型 package.json
// ---------------------------------------------------
// 创建项目后，package.json 里会有这三个核心脚本，
// 这是 Vite 项目的"三件套"，记住它们就够日常用了。

const packageJson = {
  "name": "my-app",
  "scripts": {
    "dev": "vite",              // 启动开发服务器（最常用）
    "build": "vite build",      // 打包构建生产版本
    "preview": "vite preview"   // 本地预览构建产物
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
};

console.log("项目脚本一览：");
Object.entries(packageJson.scripts).forEach(([name, cmd]) => {
  console.log(\`  npm run \${name}  →  \${cmd}\`);
});

console.log("\\n💡 记住：dev 开发、build 打包、preview 预览，三个命令走天下");
console.log("💡 vite 和框架插件（如 @vitejs/plugin-react）在 devDependencies");`,
  },

  // =========================================================
  // 第三章：dev / build / preview 三件套
  // =========================================================
  {
    id: "vite-dev-build",
    group: "快速上手",
    icon: "📦",
    title: "dev / build / preview 三件套",
    content: `## 1. npm run dev —— 开发服务器

启动后默认在 \`http://localhost:5173\`（端口被占用会自动换）。

\`\`\`bash
npm run dev
\`\`\`

它做的事情：
- 启动一个开发服务器，**不打包**
- 用 esbuild 预构建依赖（首次稍慢，之后秒启）
- 支持 **HMR 热更新**：改代码浏览器自动刷新且**保留页面状态**

常用选项（临时覆盖，不改配置文件）：

\`\`\`bash
# 指定端口
vite --port 3000
# 启动后自动打开浏览器
vite --open
# 指定 host（局域网访问）
vite --host
\`\`\`

## 2. npm run build —— 生产打包

\`\`\`bash
npm run build
\`\`\`

把项目打包到 \`dist/\` 目录，输出的是经过 **Rollup** 优化的静态资源：tree-shaking 去除无用代码、代码压缩、CSS 提取、资源哈希命名等。

\`\`\`
dist/
├── index.html
├── assets/
│   ├── index-a1b2c3d4.js    ← 带 hash，用于缓存失效
│   └── index-e5f6g7h8.css
└── ...
\`\`\`

## 3. npm run preview —— 预览构建产物

\`\`\`bash
npm run preview
\`\`\`

启动一个本地静态服务器来跑 \`dist/\` 里的打包结果。**用途**：上线前先在本地验证打包后的页面是否正常（很多人 build 完直接部署，结果路径错了一片空白，preview 能提前发现）。

> 注意：preview 只是本地预览工具，**不要**拿它当生产服务器用。

---

## 一个完整流程

\`\`\`bash
npm run dev       # 1. 写代码时用：边写边热更新
npm run build     # 2. 写完打包：生成 dist/
npm run preview   # 3. 上线前验证：本地跑一下打包结果
# 验证 OK → 把 dist/ 部署到服务器
\`\`\`

这就是 Vite 日常开发的完整闭环，足够覆盖 90% 的场景。`,
    code: `// 演示：模拟 build 输出目录结构与文件 hash 命名
// ---------------------------------------------------
// vite build 会给文件名加 hash（基于内容），内容变了 hash 就变，
// 这样浏览器缓存能安全地长期生效（文件名变 = 新文件 = 重新下载）。

const dist = {
  "index.html": '<script type="module" src="/assets/index-a1b2c3d4.js">',
  "assets/index-a1b2c3d4.js": "压缩后的 JS（内容 hash = a1b2c3d4）",
  "assets/index-e5f6g7h8.css": "提取出的 CSS（内容 hash = e5f6g7h8）",
  "assets/logo-9i0j1k2l.png": "静态资源（小图可能被转成 base64 内联）",
};

console.log("dist/ 目录结构：");
Object.entries(dist).forEach(([path, desc]) => {
  console.log(\`  \${path}\\n     └─ \${desc}\`);
});

// 演示 hash 命名对缓存的意义
const oldHash = "a1b2c3d4";
const newHash = "b2c3d4e5";   // 内容改了，hash 变了
console.log("\\n修改代码前 JS 文件名: index-" + oldHash + ".js");
console.log("修改代码后 JS 文件名: index-" + newHash + ".js");
console.log("→ 文件名变了，浏览器会重新下载新版本，不会用旧缓存");`,
  },

  // =========================================================
  // 第四章：vite.config.js 基础结构
  // =========================================================
  {
    id: "vite-config",
    group: "配置基础",
    icon: "⚙️",
    title: "vite.config.js 基础结构",
    content: `## 配置文件在哪、叫什么

项目根目录下创建 \`vite.config.js\`（或 \`.ts\` / \`.mjs\`），Vite 启动时会自动读取。

## 最小配置

什么都不写也能跑（Vite 有合理默认值）。但通常至少要配**框架插件**：

\`\`\`js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
\`\`\`

### 为什么用 defineConfig？

\`defineConfig\` 本身不做任何事，只是给你提供**TypeScript 智能提示**。它让编辑器知道配置对象的类型，输入 \`server.\` 时能自动补全所有选项。

### 命令行参数 vs 配置文件

上一章的 \`vite --port 3000\` 是临时参数。如果要永久生效，写进配置：

\`\`\`js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,        // 永久用 3000 端口
    open: true,        // 启动自动开浏览器
  },
})
\`\`\`

---

## 常用配置项一览

\`\`\`js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 1. 插件：框架支持、自动导入等
  plugins: [react()],

  // 2. 开发服务器
  server: {
    port: 3000,
    open: true,
    proxy: { /* 跨域代理，见第七章 */ },
  },

  // 3. 路径别名
  resolve: {
    alias: { '@': '/src' },
  },

  // 4. 构建选项
  build: {
    outDir: 'dist',       // 输出目录
    sourcemap: false,     // 是否生成 sourcemap
  },

  // 5. 基础路径（部署到子路径时用，见第十三章）
  base: '/',
})
\`\`\`

后续章节会逐个展开这些配置。本章你只需要记住：**配置文件叫 \`vite.config.js\`，用 \`defineConfig\` 包裹，plugins 放插件，server 管开发服务器**。`,
    code: `// 演示：defineConfig 的本质与配置合并逻辑
// ---------------------------------------------------
// defineConfig 不是魔法，它就是一个返回原参数的恒等函数，
// 真正的作用是给 TS 提供类型推断。这里模拟它的行为。

// 模拟 Vite 的 defineConfig
function defineConfig(config) {
  return config;   // 原样返回，仅用于类型提示
}

// 用户的配置
const myConfig = defineConfig({
  plugins: ['react()'],
  server: { port: 3000, open: true },
  resolve: { alias: { '@': '/src' } },
  build: { outDir: 'dist' },
});

// Vite 内部会把用户配置与默认值合并
const defaults = {
  plugins: [],
  server: { port: 5173, open: false, host: 'localhost' },
  resolve: { alias: {} },
  build: { outDir: 'dist', sourcemap: false },
};

const merged = {
  ...defaults,
  ...myConfig,
  server: { ...defaults.server, ...myConfig.server },
  resolve: { ...defaults.resolve, ...myConfig.resolve },
  build: { ...defaults.build, ...myConfig.build },
};

console.log("最终生效的配置（用户配置覆盖默认值）：");
console.log(JSON.stringify(merged, null, 2));
console.log("\\n💡 用户配了 port:3000 → 覆盖默认 5173");
console.log("💡 用户没配 host → 保留默认 localhost");`,
  },

  // =========================================================
  // 第五章：路径别名 @
  // =========================================================
  {
    id: "vite-alias",
    group: "配置基础",
    icon: "🔗",
    title: "路径别名 @",
    content: `## 痛点：相对路径地狱

项目一深，import 就变成这样：

\`\`\`js
import Button from '../../../components/Button'
import { formatDate } from '../../../utils/date'
\`\`\`

数 \`..\` 数到眼花，文件一移动全得改。

## 解决：配置 @ 别名

\`\`\`js
// vite.config.js
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      // @ 指向 src 目录
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // 还可以加更多别名
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
    },
  },
})
\`\`\`

配置后，上面那两行就能写成：

\`\`\`js
import Button from '@/components/Button'
import { formatDate } from '@/utils/date'
\`\`\`

清爽、不怕文件移动。

### 为什么用 fileURLToPath + import.meta.url？

因为 \`vite.config.js\` 是 ESM，没有 \`__dirname\`。\`import.meta.url\` 拿到当前配置文件的 URL，再用 \`fileURLToPath\` 转成绝对路径。如果用 CommonJS（\`.cjs\` 配置），可以直接用 \`__dirname\`：

\`\`\`js
// vite.config.cjs
const path = require('node:path')
module.exports = {
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
}
\`\`\`

---

## 别名解析顺序

Vite 会**按定义顺序**匹配别名。第一个匹配上的就用，后面的不再管。所以更具体的别名要放前面：

\`\`\`js
resolve: {
  alias: {
    '@components': '/src/components',  // 先匹配具体的
    '@': '/src',                       // 再匹配通用的
  },
}
\`\`\`

> 如果顺序反过来，\`@components/Button\` 会先被 \`@\` 匹配成 \`/src/components/Button\`……虽然结果碰巧一样，但依赖了"巧合"，不规范。

---

## TS 项目还要配 tsconfig

别名只配 Vite 不够，**TypeScript 不认识 \`@\`**，会报红。要在 \`tsconfig.json\` 里同步配置：

\`\`\`json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"]
    }
  }
}
\`\`\`

这样编辑器跳转、类型检查、Vite 运行三者一致。`,
    code: `// 演示：别名解析过程
// ---------------------------------------------------
// 配置 alias 后，Vite 在解析 import 时会把别名替换成真实路径。
// 这里模拟这个"别名 → 绝对路径"的替换逻辑。

const aliasConfig = {
  '@components': '/Users/me/project/src/components',
  '@utils': '/Users/me/project/src/utils',
  '@': '/Users/me/project/src',
};

// 模拟 Vite 的别名解析
function resolveAlias(importPath) {
  for (const [alias, realPath] of Object.entries(aliasConfig)) {
    // 精确匹配 或 前缀匹配（alias/xxx）
    if (importPath === alias || importPath.startsWith(alias + '/')) {
      return importPath.replace(alias, realPath);
    }
  }
  return importPath;  // 没命中别名，原样返回
}

// 测试一组 import 语句
const imports = [
  '@/components/Button',
  '@/utils/date',
  '@/styles/global.css',
  '@components/Header',
  'react',              // 第三方包，不命中别名
];

console.log("别名解析结果：\\n");
imports.forEach((imp) => {
  const resolved = resolveAlias(imp);
  const hit = resolved !== imp;
  console.log(\`\${imp}\`);
  console.log(\`  → \${resolved}\${hit ? '' : '  (无别名，按 node_modules 解析)'}\\n\`);
});

console.log("💡 注意：@components 会先于 @ 被匹配，这是定义顺序决定的");`,
  },

  // =========================================================
  // 第六章：端口、自动打开、CORS
  // =========================================================
  {
    id: "vite-server",
    group: "配置基础",
    icon: "🌐",
    title: "端口、自动打开、CORS",
    content: `## server 配置全家桶

\`\`\`js
// vite.config.js
export default defineConfig({
  server: {
    host: '0.0.0.0',  // 监听所有网卡（局域网/手机可访问）
    port: 3000,        // 固定端口
    open: true,        // 启动后自动打开浏览器
    cors: true,        // 允许跨域（默认就是 true）
    strictPort: true,  // 端口被占就直接报错，不自动换
  },
})
\`\`\`

### 各选项实战说明

**port**：默认 5173。被占用时 Vite 会自动找下一个可用端口（5174、5175…）。

**strictPort**：如果你必须用 3000 端口（比如后端白名单只认 3000），设 \`strictPort: true\`，端口被占就直接报错退出，避免"我以为在 3000，其实在 3001"的混乱。

**host**：默认只监听 \`localhost\`。设成 \`'0.0.0.0'\` 后，同一局域网的手机/同事电脑能通过你的 IP 访问，方便真机调试。

\`\`\`bash
# 启动后终端会显示：
  ➜  Local:    http://localhost:3000/
  ➜  Network:  http://192.168.1.100:3000/   ← 手机连这个
\`\`\`

**open**：启动自动开浏览器。个人喜好，团队 CI 里别开。

**cors**：开发服务器默认允许跨域（方便调后端 API）。一般不用动。

---

## HTTPS 开发

调微信支付、地理位置等需要 HTTPS 的功能时，开发服务器也得是 https：

\`\`\`bash
npm i -D @vitejs/plugin-basic-ssl
\`\`\`

\`\`\`js
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [basicSsl()],
  server: { https: true },
})
\`\`\`

启动后是 \`https://localhost:3000\`（浏览器会提示证书不受信任，点继续即可）。

---

## 端口被占怎么办

不想配 strictPort，临时换端口：

\`\`\`bash
vite --port 8080
\`\`\`

或直接杀掉占用进程（macOS）：

\`\`\`bash
lsof -i :5173        # 查谁占了 5173
kill -9 <PID>        # 杀掉它
\`\`\``,
    code: `// 演示：端口选择逻辑（strictPort 的作用）
// ---------------------------------------------------
// 模拟 Vite 启动时找可用端口的过程，对比 strictPort 开关的效果。

function findPort(configuredPort, strictPort, occupiedPorts) {
  if (!occupiedPorts.includes(configuredPort)) {
    return { port: configuredPort, ok: true };
  }
  // 配置的端口被占了
  if (strictPort) {
    return { port: null, ok: false, error: "端口被占且 strictPort=true，启动失败" };
  }
  // strictPort=false：自动往上找可用端口
  let p = configuredPort + 1;
  while (occupiedPorts.includes(p)) p++;
  return { port: p, ok: true, autoChanged: true };
}

// 场景：3000 端口被占用
const occupied = [3000, 3001];

console.log("=== 场景 A：strictPort = false（默认）===");
const a = findPort(3000, false, occupied);
console.log(\`配置端口 3000，被占用 → 自动改用 \${a.port}（\${a.autoChanged ? '自动切换' : '原端口'}）\`);

console.log("\\n=== 场景 B：strictPort = true ===");
const b = findPort(3000, true, occupied);
console.log(\`配置端口 3000，被占用 → \${b.ok ? '用 ' + b.port : b.error}\`);

console.log("\\n💡 strictPort=true 适合：后端只认固定端口，不能乱换的场景");`,
  },

  // =========================================================
  // 第七章：开发代理解决跨域
  // =========================================================
  {
    id: "vite-proxy",
    group: "配置基础",
    icon: "🔀",
    title: "开发代理解决跨域",
    content: `## 跨域问题怎么来的

开发时前端在 \`localhost:5173\`，后端 API 在 \`localhost:8080\`，端口不同 = 不同源 = **浏览器拦截**（CORS 策略）。报错类似：

\`\`\`
Access to fetch at 'http://localhost:8080/api/user' from origin
'http://localhost:5173' has been blocked by CORS policy
\`\`\`

## Vite 代理：开发阶段最简单的解法

让请求"看起来"是发给自己的。前端请求 \`/api/user\`（同源，不触发跨域），Vite 服务器**转发**给后端 \`http://localhost:8080\`。

\`\`\`js
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      // 所有以 /api 开头的请求都转发到后端
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,   // 修改请求头里的 Host 为 target
      },
    },
  },
})
\`\`\`

前端代码照常写：

\`\`\`js
// 前端：请求同源的 /api/user，不跨域
fetch('/api/user')
// Vite 把它转发成 http://localhost:8080/api/user
\`\`\`

### changeOrigin 是干嘛的？

后端服务器可能根据 \`Host\` 头做虚拟主机区分。不加 \`changeOrigin\`，转发的请求 \`Host\` 还是 \`localhost:5173\`，后端可能不认。加了之后 \`Host\` 改成 \`localhost:8080\`，后端就正常响应了。

### 路径重写 rewrite

如果后端接口没有 \`/api\` 前缀，前端写 \`/api/user\` 转发时要**去掉 /api**：

\`\`\`js
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\\/api/, ''),
    // /api/user  →  /user
  },
}
\`\`\`

### 多个后端服务

\`\`\`js
proxy: {
  '/api':   { target: 'http://localhost:8080', changeOrigin: true },  // 主后端
  '/ws':    { target: 'ws://localhost:3001', ws: true },              // WebSocket
  '/upload':{ target: 'http://oss.example.com', changeOrigin: true }, // 文件服务
}
\`\`\`

### 过滤：只代理特定请求

用函数精确控制哪些请求走代理：

\`\`\`js
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    bypass(req) {
      // 只代理 /api/realtime 开头的，其他 /api 走 mock
      if (!req.url.startsWith('/api/realtime')) return false  // 不代理
    },
  },
}
\`\`\`

---

## 重要提醒

代理**只在开发阶段有效**（dev server 提供）。生产环境部署后没有 Vite，跨域要用 **Nginx 反向代理**或后端配置 **CORS 响应头**解决。这是新人最常踩的坑：开发好好的，上线就跨域。

> 记住口诀：**开发用 Vite proxy，生产用 Nginx 反代**。`,
    code: `// 演示：HTTP 代理转发的工作原理
// ---------------------------------------------------
// 用 Node 内置 http 模块搭一个最小代理，直观看到
// "前端请求 /api → 代理转发到后端" 的全过程。

const http = require('http');

// 1. 模拟后端服务器（真实后端在 8080）
const backend = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ user: '张三', id: 1, from: 'backend:8080' }));
});

// 2. 模拟 Vite 代理服务器（前端请求它，它转发给后端）
const proxy = http.createServer((req, res) => {
  if (req.url.startsWith('/api')) {
    console.log('代理收到请求:', req.url, '→ 转发到后端');
    // 真实 Vite 代理底层就是用 http-proxy 做这种转发
    const proxyReq = http.request(
      { hostname: 'localhost', port: 8080, path: req.url, method: req.method },
      (proxyRes) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        proxyRes.pipe(res);   // 把后端响应原样回给前端
      }
    );
    proxyReq.end();
  } else {
    res.writeHead(404);
    res.end('非 /api 请求不代理');
  }
});

// 启动两个服务器并模拟一次前端请求
backend.listen(8080, () => {
  proxy.listen(5173, () => {
    console.log('后端跑在 :8080，Vite 代理跑在 :5173\\n');

    // 模拟前端请求 /api/user（实际是同源请求 5173）
    http.get('http://localhost:5173/api/user', (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        console.log('前端拿到响应:', data);
        console.log('\\n✅ 前端请求的是 5173（同源，不跨域），代理转发到 8080');
        backend.close();
        proxy.close();
      });
    });
  });
});`,
  },
];
