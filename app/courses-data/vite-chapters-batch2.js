// =============================================================
// Vite 实战教程 —— 第二批章节（资源与环境 + 工程进阶，共 7 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   资源与环境：
//     8.  vite-assets    — 静态资源处理
//     9.  vite-env       — 环境变量 .env
//     10. vite-hmr       — HMR 热更新
//   工程进阶：
//     11. vite-plugins   — 常用插件
//     12. vite-build-opt — 构建优化
//     13. vite-base      — base 路径与子目录部署
//     14. vite-deploy    — 部署上线
//
// 与 batch1 一致：content 放可复制的实战配置，code 放可在
// Node 中独立运行的演示脚本。聚焦日常开发最常用的知识点。
// =============================================================

export const chapters = [
  // =========================================================
  // 第八章：静态资源处理
  // =========================================================
  {
    id: "vite-assets",
    group: "资源与环境",
    icon: "🖼️",
    title: "静态资源处理",
    content: `## 三种资源放法

Vite 项目里静态资源（图片、字体等）有两种放置方式，行为不同：

### 1. 放 src 里 —— 会被构建处理

\`\`\`
src/
├── assets/
│   └── logo.png      ← 这里
└── main.js
\`\`\`

在 JS / CSS 里 import 引用：

\`\`\`js
import logo from './assets/logo.png'

// logo 是一个字符串：构建后的 URL（如 /assets/logo-a1b2c3d4.png）
const img = document.createElement('img')
img.src = logo
\`\`\`

\`\`\`css
/* CSS 里用 url() 引用 */
.logo {
  background: url('./assets/logo.png');
}
\`\`\`

**特点**：会经过 Vite 处理——加 hash、小文件转 base64 内联、tree-shaking 去掉没用到的。

### 2. 放 public 里 —— 原样复制

\`\`\`
public/
└── favicon.ico       ← 这里
\`\`\`

\`public/\` 下的文件**开发时直接通过根路径访问**，构建时**原样复制**到 \`dist/\`（不改名、不加 hash）：

\`\`\`js
// 引用时写绝对路径（注意开头没有 public）
const url = '/favicon.ico'
\`\`\`

\`\`\`html
<!-- index.html 里直接引用 -->
<link rel="icon" href="/favicon.ico">
\`\`\`

**特点**：不经过构建处理，名字不变。适合 favicon、robots.txt、第三方脚本这类"必须保持固定文件名"的文件。

> 坑：\`public/\` 里的文件**不能用 import 引入**，只能用字符串路径 \`'/xxx.png'\`。否则 Vite 会把它当普通字符串，不处理。

---

## 小图自动转 base64

小于 \`4kb\` 的资源，Vite 默认转成 base64 内联到 JS/CSS 里，减少 HTTP 请求：

\`\`\`js
// vite.config.js
export default defineConfig({
  build: {
    assetsInlineLimit: 4096,   // 4kb，小于此值转 base64（默认就是 4096）
    // 想全部内联：设成一个很大的数
    // 想全部外链：设成 0
  },
})
\`\`\`

---

## 运行时动态路径：new URL

如果图片路径是动态拼出来的（比如根据数据切换图标），直接 \`import\` 不行（构建时不知道路径）。用 \`new URL\`：

\`\`\`js
// ✅ 正确：Vite 能识别这种写法并正确处理
const imgUrl = new URL('./assets/icon-' + name + '.png', import.meta.url).href

// ❌ 错误：动态拼接的字符串，Vite 静态分析不出来，构建后路径会失效
const imgUrl = './assets/icon-' + name + '.png'
\`\`\`

\`new URL(..., import.meta.url)\` 是 Vite 官方支持的动态资源写法，构建时会正确处理成带 hash 的路径。

---

## 字体文件

字体和图片一样，放 src 里 import，或放 public 里用路径引用：

\`\`\`css
/* 放 src/assets/fonts/ */
@font-face {
  font-family: 'MyFont';
  src: url('./assets/fonts/my-font.woff2') format('woff2');
}
\`\`\`

\`\`\`css
/* 放 public/fonts/ */
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/my-font.woff2') format('woff2');
}
\`\`\`

> 一句话总结：**要 hash / 要被 tree-shake → 放 src import；要固定文件名 / 要直接 URL 访问 → 放 public。**`,
    code: `// 演示：assetsInlineLimit 决定资源是"内联 base64"还是"外链文件"
// ---------------------------------------------------
// Vite 构建时，会根据文件大小决定：
//   小于阈值 → 转成 base64 字符串内联（省一次请求，但增大 JS 体积）
//   大于阈值 → 单独输出文件，用 URL 引用

const assetsInlineLimit = 4096;  // 默认 4kb

const files = [
  { name: 'icon.png', size: 1200 },     // 1.2kb，小图
  { name: 'photo.jpg', size: 256000 },  // 256kb，大图
  { name: 'dot.gif', size: 800 },       // 0.8kb，极小
  { name: 'bg.webp', size: 5200 },      // 5.2kb，略超阈值
];

console.log("assetsInlineLimit =", assetsInlineLimit, "字节\\n");
files.forEach((f) => {
  const inline = f.size <= assetsInlineLimit;
  const base64Len = Math.ceil(f.size * 4 / 3);  // base64 比原数据大约 4/3
  console.log(\`\${f.name} (\${f.size} 字节)\`);
  console.log(\`  → \${inline ? '内联为 base64（约 ' + base64Len + ' 字符，省 1 个请求）' : '输出为独立文件 /assets/' + f.name + '-[hash]'}\`);
});

console.log("\\n💡 小图内联：减少 HTTP 请求，但让 JS/CSS 略变大");
console.log("💡 大图外链：保持资源独立，可被浏览器缓存");`,
  },

  // =========================================================
  // 第九章：环境变量 .env
  // =========================================================
  {
    id: "vite-env",
    group: "资源与环境",
    icon: "🔐",
    title: "环境变量 .env",
    content: `## 环境变量文件

Vite 用 \`dotenv\` 读取项目根目录下的 \`.env\` 文件，按"模式"加载不同文件：

\`\`\`
.env                # 所有环境都加载
.env.local          # 所有环境加载，但被 git 忽略（放本地密钥）
.env.development    # npm run dev 时加载
.env.production     # npm run build 时加载
\`\`\`

加载优先级：\`.env.development\` > \`.env\`（具体的覆盖通用的）。

## 命名规则：必须 VITE_ 开头

**只有 \`VITE_\` 开头的变量才会暴露给前端代码**。这是为了防止误把数据库密码等敏感信息打包进前端（前端代码人人可见，不安全）。

\`\`\`bash
# .env
VITE_APP_TITLE=我的应用
VITE_API_BASE=/api

# ❌ 这个不会暴露给前端（没有 VITE_ 前缀）
DB_PASSWORD=secret123
\`\`\`

## 在代码里读取

\`\`\`js
// 通过 import.meta.env 读取
console.log(import.meta.env.VITE_APP_TITLE)   // "我的应用"
console.log(import.meta.env.VITE_API_BASE)    // "/api"

// 几个内置变量
console.log(import.meta.env.MODE)       // 'development' 或 'production'
console.log(import.meta.env.DEV)        // true（dev 模式）
console.log(import.meta.env.PROD)       // true（build 模式）
console.log(import.meta.env.BASE_URL)   // '/' 部署基础路径
\`\`\`

## 实战：按环境切换 API 地址

\`\`\`bash
# .env.development（开发）
VITE_API_BASE=http://localhost:8080/api

# .env.production（生产）
VITE_API_BASE=https://api.example.com/api
\`\`\`

\`\`\`js
// 代码里不用关心当前是什么环境，直接用变量
const apiBase = import.meta.env.VITE_API_BASE
fetch(apiBase + '/user')
\`\`\`

\`npm run dev\` 自动用 development 的地址，\`npm run build\` 自动用 production 的地址。完美。

## TypeScript 类型提示

默认 \`import.meta.env.VITE_XXX\` 没有类型提示。在 \`src/vite-env.d.ts\` 里声明：

\`\`\`ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
\`\`\`

之后输入 \`import.meta.env.\` 就能自动补全、有类型检查。

---

## 安全红线

再强调一次：**前端代码里的变量会被打包进产物，任何人都看得到**。所以：

- ✅ 放：API 地址、应用名、公开的 CDN 地址、功能开关
- ❌ 不放：数据库密码、第三方 API 密钥、JWT secret

需要保密的 key 应该放在**后端**，前端调后端接口由后端代为请求。`,
    code: `// 演示：环境变量加载与过滤逻辑
// ---------------------------------------------------
// 模拟 Vite 读取 .env 文件、过滤 VITE_ 前缀、注入 import.meta.env 的过程。

// 模拟 .env.development 文件内容
const envFile = \`
VITE_APP_TITLE=我的应用
VITE_API_BASE=http://localhost:8080/api
DB_PASSWORD=secret123
NODE_ENV=development
\`;

// 1. 解析 .env 文件为键值对
function parseEnv(content) {
  const env = {};
  content.trim().split('\\n').forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;       // 跳过空行和注释
    const idx = line.indexOf('=');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    env[key] = value;
  });
  return env;
}

const parsed = parseEnv(envFile);

// 2. Vite 只暴露 VITE_ 开头的变量给前端
const exposedToClient = {};
for (const [key, value] of Object.entries(parsed)) {
  if (key.startsWith('VITE_')) {
    exposedToClient[key] = value;
  }
}

console.log("解析到的全部变量：", parsed);
console.log("\\n暴露给前端 (import.meta.env)：", exposedToClient);

console.log("\\n⚠️  DB_PASSWORD 没有暴露 → 防止敏感信息被打包进前端代码");
console.log("✅ 前端只能拿到 VITE_ 前缀的变量，这是 Vite 的安全设计");`,
  },

  // =========================================================
  // 第十章：HMR 热更新
  // =========================================================
  {
    id: "vite-hmr",
    group: "资源与环境",
    icon: "🔥",
    title: "HMR 热更新",
    content: `## HMR 是什么

**HMR**（Hot Module Replacement，热模块替换）：改代码后，浏览器**不刷新整个页面**，只替换改动的那部分模块，并且**保留当前页面状态**。

举个直观例子：你在调试一个表单，已经填了一堆数据。如果整页刷新，数据全没了；HMR 只换改动的组件，表单数据还在。

## Vite 的 HMR 默认就很好用

- 改 CSS：样式瞬间更新，不丢任何状态
- 改 React/Vue 组件：组件热替换（需要框架插件支持，\`@vitejs/plugin-react\` 已内置）
- 改普通 JS 模块：会触发整页刷新（除非你写了 HMR API）

## 手动控制 HMR：import.meta.hot

普通模块默认整页刷新。如果你的模块支持"局部更新"，用 \`import.meta.hot\` API 告诉 Vite 怎么热替换：

\`\`\`js
// counter.js
export let count = 0

if (import.meta.hot) {
  // 接收自身更新，不刷新页面
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // 用新模块的 count 替换当前值
      count = newModule.count
      console.log('counter 热更新了，新值：', count)
    }
  })
}
\`\`\`

\`import.meta.hot\` 只在开发环境存在，生产构建时会被自动移除，不用担心影响体积。

### 保存状态

热替换时如果想保留一些状态（比如定时器、WebSocket 连接），用 \`dispose\` 清理旧的、\`data\` 传递数据：

\`\`\`js
if (import.meta.hot) {
  // 模块被替换前调用：清理副作用（定时器、监听等）
  import.meta.hot.dispose(() => {
    clearInterval(timer)
  })

  // 在新旧模块间传递数据
  import.meta.hot.data.count = count
}
\`\`\`

---

## HMR 不生效的常见原因

1. **改的是 .env 文件**：环境变量改动需要**重启 dev server**，不触发 HMR。
2. **改的是 vite.config.js**：配置文件改动也要**重启**。
3. **改的是 node_modules 里的依赖**：依赖改动通常要重启，或删 \`node_modules/.vite\` 缓存目录重试。
4. **循环依赖**：模块互相 import 形成环，HMR 可能失效。尽量打破循环。
5. **CSS 用了 @import 链路很深**：偶尔会整页刷新，属于已知边界情况。

### 清除依赖缓存

依赖预构建有时会出问题（比如刚升级了某依赖但没生效），手动清缓存：

\`\`\`bash
# 删除 node_modules/.vite 缓存目录
rm -rf node_modules/.vite

# 重启 dev server
npm run dev
\`\`\`

或启动时加 \`--force\`：

\`\`\`bash
vite --force   # 强制重新预构建依赖
\`\`\`

> 日常开发 99% 的场景 HMR 都是自动的，不用写 \`import.meta.hot\`。只有写库、写需要保留状态的复杂模块时才需要手动控制。`,
    code: `// 演示：HMR 模块替换与状态保留机制
// ---------------------------------------------------
// 模拟 Vite HMR 的工作流程：检测到文件变化 → 通知浏览器 →
// 执行 accept 回调替换模块 → 保留可传递的状态。

// 模拟"当前运行的模块"状态
let currentModule = { count: 0, render: () => '页面显示：0' };

// 模拟 Vite 注入的 hot API
function createHot() {
  const callbacks = [];
  const disposed = [];
  return {
    data: {},   // 跨模块传递的数据
    accept(cb) { callbacks.push(cb); },
    dispose(cb) { disposed.push(cb); },
    // 模拟"文件改动 → 触发热更新"
    triggerUpdate(newModule) {
      // 1. 先执行 dispose（清理旧模块的副作用）
      disposed.forEach((cb) => cb());
      // 2. 传递 data（保留状态）
      newModule.count = this.data.count ?? newModule.count;
      // 3. 执行 accept 回调（用新模块替换旧的）
      callbacks.forEach((cb) => cb(newModule));
      currentModule = newModule;
    },
  };
}

const hot = createHot();

// 用户模块注册 HMR
if (hot) {
  hot.dispose(() => console.log('🧹 清理旧模块的定时器/监听'));
  hot.accept((newMod) => {
    console.log('✅ 接收到新模块，热替换完成');
  });
}

// 模拟用户操作让 count 增长
currentModule.count = 42;
hot.data.count = currentModule.count;   // 保存状态
console.log('改动前：', currentModule.render());

// 模拟开发者修改了源文件 → Vite 推送新模块
const newModule = { count: 0, render: () => '页面显示：42（新渲染逻辑）' };
console.log('\\n--- 开发者修改了 counter.js，触发 HMR ---');
hot.triggerUpdate(newModule);

console.log('\\n改动后：', currentModule.render());
console.log('💡 count=42 被保留了（通过 hot.data），页面没刷新，只换了渲染逻辑');`,
  },

  // =========================================================
  // 第十一章：常用插件
  // =========================================================
  {
    id: "vite-plugins",
    group: "工程进阶",
    icon: "🧩",
    title: "常用插件",
    content: `## 插件怎么用

插件放在 \`plugins\` 数组里：

\`\`\`js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import autoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    react(),
    autoImport({ imports: ['react'] }),   // 自动导入 React API
  ],
})
\`\`\`

## 实战高频插件

### 1. 框架插件（必装）

\`\`\`bash
# React
npm i -D @vitejs/plugin-react
# Vue
npm i -D @vitejs/plugin-vue
\`\`\`

提供 JSX/Vue SFC 编译、组件级 HMR。

### 2. 自动导入：unplugin-auto-import

省去手写 \`import { useState } from 'react'\`：

\`\`\`bash
npm i -D unplugin-auto-import
\`\`\`

\`\`\`js
import autoImport from 'unplugin-auto-import/vite'

plugins: [
  autoImport({
    imports: ['react', 'vue'],   // 这些库的 API 自动可用
  }),
]
\`\`\`

\`\`\`js
// 不用写 import，直接用 useState
const [count, setCount] = useState(0)
\`\`\`

配套 \`unplugin-vue-components\` / \`unplugin-react-components\` 还能自动导入组件。

### 3. 路径别名增强：vite-plugin-pages

根据文件目录自动生成路由（React Router / Vue Router），省去手写路由表。

### 4. Mock 数据：vite-plugin-mock

开发阶段没有后端时，本地 mock 接口：

\`\`\`js
import { viteMockServe } from 'vite-plugin-mock'

plugins: [
  viteMockServe({
    mockPath: 'mock',   // mock 文件目录
  }),
]
\`\`\`

\`\`\`js
// mock/user.js
export default [{
  url: '/api/user',
  response: () => ({ name: '张三', id: 1 }),
}]
\`\`\`

### 5. 打包分析：rollup-plugin-visualizer

\`\`\`bash
npm i -D rollup-plugin-visualizer
\`\`\`

\`\`\`js
import { visualizer } from 'rollup-plugin-visualizer'

plugins: [
  visualizer({ open: true }),   // build 后自动打开体积分析图
]
\`\`\`

构建完会生成一个可视化的体积占比图，一眼看出哪个依赖最占体积。

### 6. 压缩：vite-plugin-compression

\`\`\`js
import viteCompression from 'vite-plugin-compression'

plugins: [
  viteCompression({
    algorithm: 'gzip',     // 生成 .gz 文件
    threshold: 10240,      // 大于 10kb 才压缩
  }),
]
\`\`\`

输出 \`.gz\` 文件，配合 Nginx \`gzip_static\` 直接返回预压缩文件，省去服务器实时压缩的开销。

---

## 找插件

- [awesome-vite](https://github.com/vitejs/awesome-vite) 官方推荐列表
- npm 搜 \`vite-plugin-\` 或 \`unplugin-\` 前缀
- Rollup 插件大多也能直接用（Vite 兼容 Rollup 插件接口）

> 选插件原则：优先选 \`unplugin-\` 开头的——它们是通用插件，同时兼容 Vite/Webpack/Rollup，迁移成本低。`,
    code: `// 演示：Vite 插件的 Hook 机制（rollup 插件接口）
// ---------------------------------------------------
// Vite 插件本质是一组"钩子函数"，在构建的不同阶段被调用。
// 这里模拟插件系统的调度，展示插件如何介入构建流程。

// 模拟两个插件
const reactPlugin = {
  name: 'vite:react',
  transform(code, id) {
    if (id.endsWith('.jsx')) {
      console.log('  [react] 编译 JSX:', id);
      return code + '\\n/* compiled by react plugin */';
    }
    return null;
  },
};

const autoImportPlugin = {
  name: 'unplugin-auto-import',
  transform(code, id) {
    if (id.endsWith('.jsx') && code.includes('useState')) {
      console.log('  [auto-import] 注入 import { useState }');
      return "import { useState } from 'react';\\n" + code;
    }
    return null;
  },
};

// 模拟 Vite 调度插件链
function runPipeline(plugins, code, id) {
  let current = code;
  for (const plugin of plugins) {
    if (plugin.transform) {
      const result = plugin.transform(current, id);
      if (result != null) current = result;   // 返回新内容则替换
    }
  }
  return current;
}

const source = 'const [n, setN] = useState(0)';
console.log('原始代码:', source, '\\n');

console.log('构建 App.jsx：');
const final = runPipeline([reactPlugin, autoImportPlugin], source, 'App.jsx');
console.log('\\n最终输出:\\n' + final);
console.log('\\n💡 插件按顺序依次处理，前一个的输出是后一个的输入');`,
  },

  // =========================================================
  // 第十二章：构建优化
  // =========================================================
  {
    id: "vite-build-opt",
    group: "工程进阶",
    icon: "🎯",
    title: "构建优化",
    content: `## 1. 手动分包：manualChunks

默认 Vite 把所有第三方依赖打成一个 \`vendor\` 大包。想精细拆分（比如把 react 单独拆出来，利用浏览器缓存）：

\`\`\`js
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // react 全家桶单独成包（很少变，能长期缓存）
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI 库单独成包
          'ui-vendor': ['antd', '@ant-design/icons'],
          // 工具库
          'utils-vendor': ['lodash-es', 'dayjs'],
        },
      },
    },
  },
})
\`\`\`

效果：react 这类"万年不变"的依赖独立成一个文件，用户第二次访问直接走缓存，只下载业务代码。

### 函数式分包（更灵活）

\`\`\`js
manualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('react')) return 'react-vendor'
    if (id.includes('antd')) return 'ui-vendor'
    return 'vendor'   // 其他第三方
  }
  // 不 return → 业务代码打到主 chunk
}
\`\`\`

## 2. 关闭 sourcemap（生产）

sourcemap 会暴露源码，且增大体积。生产环境默认关闭，确认别误开：

\`\`\`js
build: {
  sourcemap: false,   // 生产关闭；需要调试再开
}
\`\`\`

## 3. 调整 chunk 大小警告阈值

构建时看到 "chunk size exceeds 500 kB" 警告很烦？可以调阈值或直接分包：

\`\`\`js
build: {
  chunkSizeWarningLimit: 1000,   // 提高到 1000kb 才警告
}
\`\`\`

## 4. 资源内联阈值

小图转 base64 的阈值（见第八章）：

\`\`\`js
build: {
  assetsInlineLimit: 4096,   // 4kb 以下内联，按需调整
}
\`\`\`

## 5. 压缩

Vite 生产默认用 esbuild 压缩 JS（比 terser 快很多）。想用 terser（压缩率略好）：

\`\`\`js
build: {
  minify: 'terser',        // 'esbuild'(默认) | 'terser' | false
  terserOptions: {
    compress: { drop_console: true },   // 删掉 console.log
  },
}
\`\`\`

## 6. CSS 代码分割

\`\`\`js
build: {
  cssCodeSplit: true,   // 默认 true：按 chunk 拆分 CSS
}
\`\`\`

---

## 分析打包体积

装 \`rollup-plugin-visualizer\`（见上一章），build 后看占比图，针对性地：

- 某依赖太大 → 找轻量替代（moment → dayjs，lodash → lodash-es 按需引入）
- 某页面代码多 → 用动态 import 路由懒加载

\`\`\`js
// 路由懒加载：用到时才加载，减小首屏体积
const About = lazy(() => import('./pages/About'))
\`\`\`

> 优化口诀：**先看图找大头 → 大依赖换轻量 → 业务代码做懒加载 → 不变的依赖拆出来缓存**。`,
    code: `// 演示：manualChunks 分包逻辑
// ---------------------------------------------------
// 模拟 Vite 构建时，根据 manualChunks 配置把模块分到不同 chunk。

const manualChunks = {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'ui-vendor': ['antd', '@ant-design/icons'],
  'utils-vendor': ['lodash-es', 'dayjs'],
};

// 模拟项目里 import 的所有模块（简化）
const modules = [
  { id: 'react', path: 'node_modules/react/index.js' },
  { id: 'react-dom', path: 'node_modules/react-dom/index.js' },
  { id: 'antd', path: 'node_modules/antd/es/index.js' },
  { id: 'dayjs', path: 'node_modules/dayjs/dayjs.min.js' },
  { id: 'App', path: 'src/App.jsx' },
  { id: 'Home', path: 'src/pages/Home.jsx' },
  { id: 'lodash-es', path: 'node_modules/lodash-es/lodash.js' },
];

// 分包函数
function assignChunk(modulePath) {
  for (const [chunkName, deps] of Object.entries(manualChunks)) {
    if (deps.some((dep) => modulePath.includes('node_modules/' + dep))) {
      return chunkName;
    }
  }
  if (modulePath.includes('node_modules')) return 'vendor';
  return 'main';   // 业务代码
}

console.log("模块分包结果：\\n");
const chunks = {};
modules.forEach((m) => {
  const chunk = assignChunk(m.path);
  if (!chunks[chunk]) chunks[chunk] = [];
  chunks[chunk].push(m.id);
});

Object.entries(chunks).forEach(([chunk, ids]) => {
  console.log(\`📦 \${chunk}.js\`);
  ids.forEach((id) => console.log(\`     - \${id}\`));
});

console.log("\\n💡 react-vendor 几乎不变 → 浏览器长期缓存，只更新 main.js");
console.log("💡 业务代码(main)独立 → 改业务只让 main 失效，vendor 走缓存");`,
  },

  // =========================================================
  // 第十三章：base 路径与子目录部署
  // =========================================================
  {
    id: "vite-base",
    group: "工程进阶",
    icon: "📍",
    title: "base 路径与子目录部署",
    content: `## base 是什么

\`base\` 决定所有静态资源的**公共路径前缀**。默认 \`'/'\`，即资源都从根路径加载。

\`\`\`js
// vite.config.js
export default defineConfig({
  base: '/',   // 默认：部署到域名根目录
})
\`\`\`

构建后 \`index.html\` 里的引用是：

\`\`\`html
<script type="module" src="/assets/index-a1b2c3d4.js"></script>
\`\`\`

## 什么时候要改 base

### 场景 1：部署到子路径

比如部署到 \`https://example.com/blog/\`（不是根目录）：

\`\`\`js
export default defineConfig({
  base: '/blog/',
})
\`\`\`

构建后引用变成：

\`\`\`html
<script type="module" src="/blog/assets/index-a1b2c3d4.js"></script>
\`\`\`

**注意**：base 必须以 \`/\` 开头、以 \`/\` 结尾（如 \`'/blog/'\`），否则路径会拼错。

### 场景 2：用相对路径（部署位置不确定）

\`\`\`js
export default defineConfig({
  base: './',   // 相对路径，放哪都能跑
})
\`\`\`

\`\`\`html
<!-- 引用变成相对路径 -->
<script type="module" src="./assets/index-a1b2c3d4.js"></script>
\`\`\`

适合：做出来的静态包要给别人随便放、electron 内嵌、本地直接打开 \`index.html\` 等。

> 限制：相对路径 + 路由用 HTML5 history 模式（非 hash）会出问题，刷新子路由找不到资源。这种情况要么用 hash 路由，要么固定 base。

### 场景 3：CDN 加速

静态资源传到 CDN，HTML 还在自己服务器：

\`\`\`js
export default defineConfig({
  base: 'https://cdn.example.com/myapp/',
})
\`\`\`

\`\`\`html
<script src="https://cdn.example.com/myapp/assets/index-a1b2c3d4.js">
\`\`\`

---

## 代码里读 base

\`\`\`js
// 运行时拿到当前 base
console.log(import.meta.env.BASE_URL)   // '/' 或 '/blog/' 等
\`\`\`

配路由 basename、拼接动态资源路径时用得上：

\`\`\`js
// React Router 的 basename 要和 base 一致
<BrowserRouter basename={import.meta.env.BASE_URL}>
\`\`\`

---

## 常见坑

1. **改了 base 忘改路由 basename**：路由跳转 URL 对不上，刷新 404。
2. **base 没加结尾 \`/\`**：\`'/blog'\` 会导致路径拼接成 \`/blogassets/...\`，全 404。
3. **public 里的资源**：\`public/\` 下的文件引用路径要手动加 base 前缀，或用 \`import.meta.env.BASE_URL\` 拼接。`,
    code: `// 演示：base 配置如何影响资源引用路径
// ---------------------------------------------------
// 同一份构建产物，base 不同，index.html 里的资源路径就不同。

const buildAssets = {
  'js': 'assets/index-a1b2c3d4.js',
  'css': 'assets/index-e5f6g7h8.css',
};

// 模拟 Vite 根据base 给资源路径加前缀
function applyBase(base, assetPath) {
  // base 以 / 结尾，assetPath 不以 / 开头，直接拼接
  return base + assetPath;
}

const configs = [
  { base: '/', desc: '部署到根目录' },
  { base: '/blog/', desc: '部署到 /blog/ 子目录' },
  { base: './', desc: '相对路径（随便放）' },
  { base: 'https://cdn.example.com/app/', desc: 'CDN 加速' },
];

configs.forEach(({ base, desc }) => {
  console.log(\`base: '\${base}'   （\${desc}）\`);
  console.log(\`  <script src="\${applyBase(base, buildAssets.js)}">\`);
  console.log(\`  <link   href="\${applyBase(base, buildAssets.css)}">\`);
  console.log('');
});

console.log("💡 base 必须以 / 结尾（相对路径 ./ 除外），否则路径会拼错");
console.log("💡 代码里用 import.meta.env.BASE_URL 运行时获取当前 base");`,
  },

  // =========================================================
  // 第十四章：部署上线
  // =========================================================
  {
    id: "vite-deploy",
    group: "工程进阶",
    icon: "🚀",
    title: "部署上线",
    content: `## 部署的本质

\`vite build\` 产出的是 \`dist/\` 下的**纯静态文件**（HTML/CSS/JS/图片）。部署 = 把 \`dist/\` 传到一个能托管静态文件的服务器。没有 Node 运行时、没有 SSR 的话，随便一个静态服务器就行。

## 1. 静态托管平台（最快）

Vercel / Netlify / Cloudflare Pages / GitHub Pages：连接 Git 仓库，自动构建部署。

**Vercel** 配置：
- Framework Preset: Vite
- Build Command: \`npm run build\`
- Output Directory: \`dist\`

push 代码即自动部署，还自带 CDN 和 HTTPS。

**GitHub Pages** 注意 base：如果项目名不是 \`username.github.io\`，要部署到 \`username.github.io/repo-name/\`，必须设：

\`\`\`js
base: '/repo-name/'
\`\`\`

## 2. Nginx（自建服务器最常用）

\`\`\`nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/my-app/dist;     # 指向 dist 目录
    index index.html;

    # SPA 关键：所有路由都回退到 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存（带 hash 的文件名可长期缓存）
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
\`\`\`

### 为什么 SPA 要 try_files 回退？

React/Vue 用 HTML5 history 路由，用户访问 \`/about\` 刷新时，服务器会找 \`/about\` 这个文件——不存在！所以要让所有路径都返回 \`index.html\`，由前端路由接管。

### 开启 gzip 预压缩

如果构建时用 \`vite-plugin-compression\` 生成了 \`.gz\` 文件：

\`\`\`nginx
gzip_static on;    # 优先返回预压缩的 .gz 文件
\`\`\`

## 3. Docker

\`\`\`dockerfile
# 构建阶段
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段：用 nginx 托管静态文件
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
\`\`\`

多阶段构建：最终镜像只有 nginx + 静态文件，体积小、不含源码。

## 4. Node 托管（简单内网场景）

不想装 Nginx，用 Node 起个静态服务：

\`\`\`js
import express from 'express'
const app = express()
app.use(express.static('dist'))
app.get('*', (req, res) => res.sendFile('index.html'))
app.listen(3000)
\`\`\`

> 生产推荐：**Vercel/Netlify（省心）或 Nginx（可控）**。Node 托管只适合内网小工具。

---

## 部署检查清单

- [ ] \`base\` 配置和部署路径一致（子目录部署尤其注意）
- [ ] API 地址用环境变量按环境切换（开发/生产）
- [ ] 路由模式 + 服务器回退配置正确（SPA 刷新不 404）
- [ ] 生产关闭 sourcemap（除非需要错误监控）
- [ ] 静态资源配了长缓存（带 hash 文件名 + Cache-Control）
- [ ] 开启 gzip/brotli 压缩`,
    code: `// 演示：用 Node 起一个 SPA 静态服务器（含路由回退）
// ---------------------------------------------------
// 这是部署的"最小可用"版本：托管 dist/，所有路由回退到 index.html。
// 生产建议用 Nginx，但这个脚本能帮你理解 SPA 部署的核心逻辑。

const http = require('http');
const fs = require('fs');
const path = require('path');

// 模拟 dist 目录里的文件
const distFiles = {
  '/index.html': '<html><body><div id="app">SPA 应用</div><script src="/assets/app.js"></script></body></html>',
  '/assets/app.js': 'console.log("应用启动");',
  '/favicon.ico': '',
};

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  console.log('请求:', urlPath);

  // 1. 静态资源：直接返回
  if (distFiles[urlPath]) {
    const ext = path.extname(urlPath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(distFiles[urlPath]);
    return;
  }

  // 2. SPA 路由回退：找不到的路径都返回 index.html
  //    前端路由接管，比如 /about /user/123 都交给 React Router 处理
  console.log('  → 文件不存在，回退到 index.html（SPA 路由接管）');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(distFiles['/index.html']);
});

server.listen(3000, () => {
  console.log('静态服务器跑在 http://localhost:3000\\n');

  // 模拟各种请求
  const paths = ['/', '/assets/app.js', '/about', '/user/123'];
  let i = 0;
  const next = () => {
    if (i >= paths.length) { server.close(); return; }
    http.get('http://localhost:3000' + paths[i], (res) => {
      console.log('  状态码:', res.statusCode, '\\n');
      i++;
      next();
    });
  };
  next();
});

console.log("\\n💡 /about、/user/123 这些前端路由路径，服务器返回 index.html，");
console.log("   浏览器加载后再由前端路由渲染对应页面（这就是 SPA 的回退机制）");`,
  },
];
