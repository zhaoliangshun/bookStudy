// =============================================================
// 前端工程化教程 - 第 2 批章节（构建与打包篇 5 章）
// -------------------------------------------------------------
// 覆盖前端构建的核心工具：Webpack 深度、Vite 现代方案、Babel 转译、
// CSS 工程化、构建性能优化。是工程化的核心能力篇章。
// =============================================================

export const chapters = [
  {
    id: "fe-eng-webpack",
    group: "构建与打包",
    icon: "📦",
    title: "Webpack 深入：Loader、Plugin 与打包原理",
    content: `

# Webpack 深入：Loader、Plugin 与打包原理

## 一、Webpack 是什么

### 1.1 一句话定义

Webpack 是一个**静态模块打包器**（static module bundler）。它把一切文件（JS、CSS、图片、字体）都视为模块，从入口出发递归构建依赖图，最后打包成浏览器能运行的产物。

### 1.2 Webpack 解决的核心问题

1. **模块打包**：把几百个 ESM/CommonJS 文件合成几个文件，减少请求
2. **加载非 JS 文件**：通过 Loader 让 JS 能 import CSS、图片
3. **代码转换**：Babel、TypeScript、Sass 在打包时一并处理
4. **代码拆分**：把代码拆成多个 chunk，按需加载
5. **Tree Shaking**：删除没用到的代码
6. **HMR**：开发时改代码不刷新页面就生效

---

## 二、Webpack 的核心概念

### 2.1 五个核心配置项

\`\`\`js
// webpack.config.js
const path = require('path');

module.exports = {
  // 1. 入口：从哪个文件开始构建依赖图
  entry: './src/index.js',

  // 2. 输出：打包成什么文件、放哪
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true, // 构建前清空 dist
  },

  // 3. Loader：处理非 JS 文件
  module: {
    rules: [
      {
        test: /\\.css$/,           // 匹配 .css 文件
        use: ['style-loader', 'css-loader'], // 从右往左执行
      },
      {
        test: /\\.(png|jpg|gif)$/,
        type: 'asset/resource',    // Webpack 5 内置资源处理
      },
    ],
  },

  // 4. Plugin：扩展构建流程
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' }),
  ],

  // 5. 模式：development / production
  mode: 'development',
};
\`\`\`

### 2.2 入口（Entry）

入口可以单个、多个、或带依赖：

\`\`\`js
module.exports = {
  entry: {
    // 多入口：每个生成一个 chunk
    app: './src/app.js',
    admin: './src/admin.js',
    // 提取公共依赖
    vendor: ['react', 'react-dom'],
  },
};
\`\`\`

### 2.3 输出（Output）的占位符

\`\`\`js
output: {
  filename: '[name].[contenthash:8].js',  // app.a3f5b2c1.js
  chunkFilename: '[name].[contenthash:8].chunk.js',
  assetModuleFilename: 'assets/[hash][ext][query]',
}
\`\`\`

| 占位符 | 含义 | 示例 |
|--------|------|------|
| \`[name]\` | chunk 名称 | \`app\` |
| \`[hash]\` | 整个构建的 hash | \`a3f5b2c1d4e6\` |
| \`[contenthash]\` | 文件内容 hash | \`a3f5b2c1\` |
| \`[chunkhash]\` | chunk 内容 hash | \`b7c8d9e0\` |
| \`[ext]\` | 文件扩展名 | \`.png\` |

**重要**：用 \`[contenthash]\` 而不是 \`[hash]\`，因为后者任何一个文件改了所有文件名都变，缓存全失效。

---

## 三、Loader：处理非 JS 文件

### 3.1 Loader 的本质

Loader 是一个「输入字符串、输出字符串」的函数。Webpack 遇到非 JS 文件时，按规则链式调用 Loader 把它转成 JS：

\`\`\`js
// 一个最简单的 loader
module.exports = function (source) {
  // source 是文件内容字符串
  return source.replace(/console\\.log\\(.*?\\);?/g, '');
};
\`\`\`

### 3.2 常用 Loader

| Loader | 作用 |
|--------|------|
| \`babel-loader\` | 用 Babel 转译 JS |
| \`ts-loader\` / \`babel-loader\` | 处理 TypeScript |
| \`css-loader\` | 解析 CSS 的 \`@import\` 和 \`url()\` |
| \`style-loader\` | 把 CSS 注入 \`<style>\` 标签 |
| \`postcss-loader\` | PostCSS 处理（autoprefixer 等）|
| \`sass-loader\` | 编译 Sass/SCSS |
| \`file-loader\` / \`asset/resource\` | 处理图片/字体文件 |
| \`url-loader\` / \`asset/inline\` | 小文件转 base64 |
| \`raw-loader\` / \`asset/source\` | 文件内容作为字符串导入 |
| \`csv-loader\` | 导入 CSV 为数组 |

### 3.3 Loader 的执行顺序

\`\`\`js
use: ['style-loader', 'css-loader', 'sass-loader'];
\`\`\`

**从右往左执行**：

1. \`sass-loader\` 把 SCSS 编译成 CSS
2. \`css-loader\` 处理 CSS 的 \`@import\` 和 \`url()\`，把 CSS 转成 JS 模块
3. \`style-loader\` 把 CSS 字符串插入 \`<style>\` 标签

记住口诀：**「右到左、底到顶」**。

### 3.4 CSS 处理的完整链路

\`\`\`js
module.exports = {
  module: {
    rules: [
      {
        test: /\\.scss$/,
        use: [
          'style-loader',                              // 3. 注入 <style>
          'css-loader',                                // 2. 处理 @import
          {                                            // 1.5 PostCSS
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['autoprefixer', 'cssnano'],
              },
            },
          },
          'sass-loader',                               // 1. SCSS → CSS
        ],
      },
    ],
  },
};
\`\`\`

### 3.5 生产环境：用 MiniCssExtractPlugin

开发用 \`style-loader\`（CSS 注入 \`<style>\`，HMR 快），生产用 \`MiniCssExtractPlugin\` 把 CSS 抽成独立文件：

\`\`\`js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\\.css$/,
        use: [
          MiniCssExtractPlugin.loader,  // 替代 style-loader
          'css-loader',
          'postcss-loader',
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
  ],
};
\`\`\`

---

## 四、Plugin：扩展构建流程

### 4.1 Plugin 与 Loader 的区别

- **Loader**：处理单个文件的内容转换（输入 → 输出）
- **Plugin**：参与整个构建流程，能做任何事（打包前/后、文件操作、注入代码）

### 4.2 Plugin 的本质

Plugin 是一个带 \`apply\` 方法的类，注册到 Webpack 的生命周期钩子：

\`\`\`js
class MyPlugin {
  apply(compiler) {
    // 注册到 compilation 钩子
    compiler.hooks.compilation.tap('MyPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: 'MyPlugin', stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS },
        (assets) => {
          // 修改产物
          assets['version.txt'] = new Source('1.0.0');
        }
      );
    });
  }
}
module.exports = MyPlugin;
\`\`\`

### 4.3 常用 Plugin

| Plugin | 作用 |
|--------|------|
| \`HtmlWebpackPlugin\` | 自动生成 HTML 并注入打包后的 JS/CSS |
| \`MiniCssExtractPlugin\` | 把 CSS 抽成独立文件 |
| \`DefinePlugin\` | 注入全局变量（如 \`process.env.NODE_ENV\`）|
| \`CleanWebpackPlugin\` | 构建前清空输出目录 |
| \`CopyWebpackPlugin\` | 拷贝静态文件到产物 |
| \`ProvidePlugin\` | 自动加载模块（如 jQuery 全局可用）|
| \`BundleAnalyzerPlugin\` | 可视化分析打包体积 |
| \`TerserPlugin\` | 压缩 JS |
| \`HotModuleReplacementPlugin\` | HMR 热更新 |

### 4.4 HtmlWebpackPlugin 自动注入

\`\`\`js
new HtmlWebpackPlugin({
  template: './src/index.html',  // 模板
  filename: 'index.html',         // 输出文件名
  inject: 'body',                 // 注入位置
  minify: {                       // 压缩 HTML
    collapseWhitespace: true,
    removeComments: true,
  },
});
\`\`\`

构建后会自动在 HTML 里加上 \`<script src="app.a3f5b2c1.js"></script>\`。

### 4.5 DefinePlugin 注入环境变量

\`\`\`js
new DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify('production'),
  'process.env.API_URL': JSON.stringify('https://api.example.com'),
  __DEV__: 'false',
});
\`\`\`

代码里写 \`process.env.NODE_ENV\` 会被替换成字符串字面量，使压缩器能删除 \`if (process.env.NODE_ENV !== 'production')\` 这类死代码。

---

## 五、Webpack 的构建流程

理解 Webpack 的运行机制，对调试配置问题很重要：

\`\`\`
┌──────────────────────────────────────────────────────────┐
│  1. 初始化：读取 webpack.config.js，合并默认配置           │
├──────────────────────────────────────────────────────────┤
│  2. 编译：从 entry 出发，调用 Loader 转换文件              │
│     递归找依赖 → 构建「模块依赖图」(Module Graph)         │
├──────────────────────────────────────────────────────────┤
│  3. 分块：根据规则把模块图拆成多个 Chunk                  │
│     （entry chunk / async chunk / split chunk）          │
├──────────────────────────────────────────────────────────┤
│  4. 输出：把每个 Chunk 转成文件，写入 output.path         │
│     Plugin 在各阶段介入修改产物                          │
└──────────────────────────────────────────────────────────┘
\`\`\`

### 5.1 模块依赖图

Webpack 从入口开始，遇到 \`import\`/\`require\` 就递归解析依赖，最终形成一张完整的图：

\`\`\`
index.js
  ├── utils.js
  │   └── lodash (node_modules)
  ├── styles.css
  │   └── background.png
  └── components/
      ├── Header.jsx
      └── Footer.jsx
\`\`\`

### 5.2 Chunk 的类型

| 类型 | 触发方式 |
|------|----------|
| Entry chunk | \`entry\` 配置的入口 |
| Async chunk | \`import()\` 动态导入 |
| Common chunk | \`splitChunks\` 拆出的公共模块 |
| Runtime chunk | Webpack 运行时（\`runtimeChunk\`）|

---

## 六、代码拆分（Code Splitting）

### 6.1 为什么要拆分

如果所有代码打包成一个 5MB 的 \`app.js\`，用户首次访问要等很久。拆分后：

- 首屏只加载 200KB
- 路由跳转时按需加载对应代码
- 公共依赖单独成 chunk，多页共享缓存

### 6.2 三种拆分方式

**1. 多入口**（最简单）

\`\`\`js
entry: { app: './app.js', admin: './admin.js' }
\`\`\`

**2. 动态 import()**

\`\`\`js
// 路由懒加载
const Dashboard = React.lazy(() => import('./Dashboard'));
\`\`\`

**3. splitChunks 自动拆分**

\`\`\`js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 把 node_modules 单独拆成 vendor chunk
        vendor: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        // 拆出被多个 chunk 共用的模块
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: -10,
        },
      },
    },
  },
};
\`\`\`

### 6.3 runtimeChunk 分离

\`\`\`js
optimization: {
  runtimeChunk: 'single',  // 把 webpack runtime 拆成单独文件
}
\`\`\`

Webpack 的运行时代码（模块加载器）会变，单独拆出避免影响业务代码缓存。

---

## 七、Tree Shaking：删除无用代码

### 7.1 原理

Tree Shaking 基于 ESM 的静态分析，删除「导入但未使用」的导出：

\`\`\`js
// math.js
export function add(a, b) { return a + b; }
export function multiply(a, b) { return a * b; }  // 这个不会被删除

// main.js
import { add } from './math';   // 只用了 add
console.log(add(1, 2));
\`\`\`

打包后 \`multiply\` 会被删掉，减小体积。

### 7.2 触发条件

1. 必须用 ESM（\`import\`/\`export\`），不能用 CommonJS
2. \`package.json\` 设 \`"sideEffects": false\`（标记包没有副作用）
3. \`mode: 'production'\`（生产模式自动启用）

\`\`\`json
{
  "name": "my-lib",
  "sideEffects": false,
  "sideEffects": ["*.css", "*.scss"]
}
\`\`\`

CSS 文件有副作用（导入就有样式效果），需要保留。

### 7.3 副作用

「副作用」指模块导入时会执行一些操作（如修改全局变量、注册全局事件）。Tree Shaking 不能删除有副作用的模块：

\`\`\`js
// 有副作用：导入就执行
window.myGlobal = 'hello';
export const unused = 'never used';
// ↑ 即使没用 unused，整个文件也不会被删（因为有副作用）
\`\`\`

\`sideEffects: false\` 是向打包器声明「我没副作用，大胆删」。

---

## 八、开发 vs 生产配置

### 8.1 通用配置抽离

\`\`\`bash
webpack/
├── common.js       # 通用配置
├── dev.js          # 开发配置
└── prod.js         # 生产配置
\`\`\`

\`\`\`js
// webpack.common.js
const { merge } = require('webpack-merge');
module.exports = {
  entry: './src/index.js',
  // ...通用配置
};

// webpack.dev.js
const { merge } = require('webpack-merge');
const common = require('./common');
module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  devServer: { hot: true, port: 3000 },
});

// webpack.prod.js
const { merge } = require('webpack-merge');
const common = require('./common');
module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: { minimize: true },
});
\`\`\`

\`\`\`json
{
  "scripts": {
    "dev": "webpack serve --config webpack/dev.js",
    "build": "webpack --config webpack/prod.js"
  }
}
\`\`\`

### 8.2 devtool 选择

| devtool | 速度 | 质量 | 适用 |
|---------|------|------|------|
| \`eval\` | 最快 | 一般 | 开发首选 |
| \`eval-cheap-module-source-map\` | 快 | 较好 | 开发推荐 |
| \`source-map\` | 慢 | 最好 | 生产 |
| \`hidden-source-map\` | 慢 | 最好 | 生产（不上传 source map）|
| \`none\` | - | 无 | 不需要 |

---

## 九、Webpack 5 的新特性

### 9.1 资源模块（Asset Modules）

不再需要 \`file-loader\` / \`url-loader\`：

\`\`\`js
module: {
  rules: [
    {
      test: /\\.(png|jpg)$/,
      type: 'asset',            // 自动选择：小图 inline，大图文件
      parser: { dataUrlCondition: { maxSize: 8 * 1024 } },
    },
    {
      test: /\\.svg$/,
      type: 'asset/source',     // 作为字符串导入
    },
  ],
}
\`\`\`

### 9.2 模块联邦（Module Federation）

多个独立构建的应用能共享模块，是微前端的一种实现：

\`\`\`js
// app-a 的 webpack 配置（暴露模块）
new ModuleFederationPlugin({
  name: 'appA',
  filename: 'remoteEntry.js',
  exposes: {
    './Button': './src/components/Button',
  },
  shared: ['react', 'react-dom'],
});

// app-b 的 webpack 配置（消费模块）
new ModuleFederationPlugin({
  name: 'appB',
  remotes: {
    appA: 'appA@http://localhost:3001/remoteEntry.js',
  },
});
\`\`\`

\`\`\`js
// app-b 里直接 import app-a 的 Button
import Button from 'appA/Button';
\`\`\`

### 9.3 缓存

\`\`\`js
module.exports = {
  cache: {
    type: 'filesystem',   // 文件系统缓存
    buildDependencies: {
      config: [__filename],
    },
  },
};
\`\`\`

二次构建速度提升 50% 以上。

---

## 十、小结

Webpack 是前端工程化的核心工具，关键点：

1. **五个核心**：entry、output、module、plugins、mode
2. **Loader 处理文件**：从右到左链式调用
3. **Plugin 扩展流程**：通过 hooks 介入构建各阶段
4. **代码拆分**：多入口 / import() / splitChunks
5. **Tree Shaking**：依赖 ESM + \`sideEffects: false\`
6. **缓存友好**：用 \`[contenthash]\` 让未改动的 chunk 文件名不变
7. **环境分离**：\`webpack-merge\` 合并 common + dev/prod

Webpack 配置复杂但能力强大。下一章看 Vite——它用完全不同的思路解决了同样的痛点，且开发体验远超 Webpack。
`,
  },
  {
    id: "fe-eng-vite",
    group: "构建与打包",
    icon: "⚡",
    title: "Vite 现代方案：ESM 原生加载与极速 HMR",
    content: `

# Vite 现代方案：ESM 原生加载与极速 HMR

## 一、Vite 是什么

### 1.1 一句话定义

Vite 是 Evan You（Vue 作者）开发的下一代前端构建工具，开发时利用浏览器原生 ESM 实现按需编译，生产时用 Rollup 打包。

### 1.2 Vite 与 Webpack 的根本区别

**Webpack 的开发模式**：

\`\`\`
启动 → 扫描所有模块 → 打包成 bundle → 启动 dev server
       ↑↑↑ 这一步很慢，项目越大越慢
\`\`\`

**Vite 的开发模式**：

\`\`\`
启动 dev server（瞬间完成）
↓
浏览器请求 /src/main.ts → Vite 实时编译这个文件 → 返回
浏览器发现 import → 再请求依赖文件 → Vite 再编译
       ↑↑↑ 按需编译，启动速度与项目规模无关
\`\`\`

实测对比：一个 1000 模块的项目，Webpack 启动 30 秒，Vite 启动 300 毫秒。

---

## 二、Vite 的工作原理

### 2.1 开发模式：基于 ESM 的按需编译

Vite 启动一个中间件服务器，拦截浏览器请求：

1. 浏览器请求 \`/index.html\`
2. Vite 返回 HTML，里面的 \`<script src="/src/main.ts" type="module">\`
3. 浏览器原生支持 \`type="module"\`，请求 \`/src/main.ts\`
4. Vite 收到请求，把 TS 编译成 JS，并把 \`import\` 路径重写

\`\`\`js
// 源码 src/main.ts
import { add } from './math';
import React from 'react';

// Vite 编译后返回浏览器的内容
import { add } from '/src/math.ts';           // 改成绝对路径
import React from '/node_modules/.vite/react.js';  // 改成预构建路径
\`\`\`

5. 浏览器再请求 \`/src/math.ts\`、\`/node_modules/.vite/react.js\`，递归这个过程

### 2.2 依赖预构建（Pre-bundling）

\`node_modules\` 里的包有的用 CommonJS、有的有几百个内部模块。Vite 启动时用 esbuild 把它们预构建成单个 ESM 文件：

\`\`\`
node_modules/lodash-es/
└── 几百个内部模块
       ↓ esbuild 预构建
node_modules/.vite/lodash-es.js
└── 一个文件（合并所有内部模块）
\`\`\`

**为什么用 esbuild**：esbuild 用 Go 写，比 Webpack/Babel 快 10-100 倍。预构建几千个依赖只要几百毫秒。

### 2.3 生产模式：用 Rollup 打包

开发用浏览器原生 ESM，但生产环境不能这样（请求太多、没有 tree shaking、没有压缩）。Vite 生产模式用 Rollup：

\`\`\`bash
vite build  # 内部用 Rollup 打包
\`\`\`

Rollup 输出比 Webpack 更干净、tree shaking 更彻底，适合库和应用打包。

---

## 三、Vite 配置

### 3.1 最小配置

\`\`\`js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
\`\`\`

开箱即用：默认支持 JS/TS/JSX/TSX、CSS、静态资源、HMR。

### 3.2 常用配置

\`\`\`js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 3000,
    open: true,                    // 启动时自动开浏览器
    proxy: {                       // 代理后端 API
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {            // 手动拆分
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },

  css: {
    modules: {                     // CSS Modules 配置
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      scss: { additionalData: \`@import "@/styles/vars.scss";\` },
    },
  },
});
\`\`\`

### 3.3 环境变量

Vite 把 \`.env\` 文件里的 \`VITE_\` 前缀变量暴露到 \`import.meta.env\`：

\`\`\`bash
# .env
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=我的应用
\`\`\`

\`\`\`js
// 代码里访问
fetch(import.meta.env.VITE_API_URL);
document.title = import.meta.env.VITE_APP_TITLE;
\`\`\`

\`\`\`js
// 模式判断
if (import.meta.env.DEV) console.log('开发模式');
if (import.meta.env.PROD) console.log('生产模式');
\`\`\`

### 3.4 多环境 .env

\`\`\`bash
.env                # 通用
.env.local          # 本地（不进 git）
.env.development    # vite dev 时加载
.env.production     # vite build 时加载
.env.staging        # vite build --mode staging 时加载
\`\`\`

---

## 四、Vite 的 HMR（热更新）

### 4.1 Vite HMR 的速度

Vite 的 HMR 是「精确更新」——只重新编译改动的文件，并通知浏览器替换对应模块。改动后到屏幕更新通常 < 100ms，与项目规模无关。

对比 Webpack：改动一个文件要重新打包整个 chunk，项目越大越慢。

### 4.2 HMR API

框架插件（如 @vitejs/plugin-react）自动处理了组件级 HMR。手写模块时可以用 \`import.meta.hot\` 接受更新：

\`\`\`js
// counter.js
export let count = 0;
export function increment() { count++; render(); }

// 接受自身更新，不刷新页面
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 用新模块替换旧的状态
    count = newModule.count;
  });
}
\`\`\`

### 4.3 React/Vue 自动 HMR

装上 \`@vitejs/plugin-react\` 后，React 组件自动支持 HMR：改 JSX 不丢 state，组件「原地替换」。

\`\`\`js
// vite.config.js
import react from '@vitejs/plugin-react';

export default {
  plugins: [react()],  // 自动 Fast Refresh
};
\`\`\`

---

## 五、Vite 插件

### 5.1 插件的本质

Vite 插件就是 Rollup 插件的超集，加了一些 Vite 特有的钩子：

\`\`\`js
// 一个最小 Vite 插件
function myPlugin() {
  return {
    name: 'my-plugin',
    // Rollup 钩子
    transform(code, id) {
      if (id.endsWith('.md')) {
        return \`export default \${JSON.stringify(code)}\`;  // md 文件作为字符串导入
      }
    },
    // Vite 专属钩子
    configureServer(server) {
      // 自定义 dev server 中间件
      server.middlewares.use('/api/health', (req, res) => {
        res.end('ok');
      });
    },
  };
}
\`\`\`

### 5.2 常用插件

| 插件 | 作用 |
|------|------|
| \`@vitejs/plugin-react\` | React 支持（含 Fast Refresh）|
| \`@vitejs/plugin-vue\` | Vue 支持 |
| \`@vitejs/plugin-legacy\` | 兼容老浏览器（自动注入 polyfill）|
| \`unplugin-auto-import\` | 自动导入 API（如 React hooks）|
| \`unplugin-vue-components\` | 自动导入组件 |
| \`vite-plugin-svg-icons\` | SVG 雪碧图 |
| \`vite-plugin-pwa\` | PWA 支持 |

### 5.3 unplugin：通用插件规范

\`unplugin\` 是一个跨构建工具的插件规范，写一次插件能在 Webpack/Vite/Rollup/ esbuild 都用：

\`\`\`js
import AutoImport from 'unplugin-auto-import/vite';

export default {
  plugins: [
    AutoImport({
      imports: ['react', 'react-router-dom'],  // 自动导入这些库的 API
      dts: 'src/auto-imports.d.ts',            // 生成类型声明
    }),
  ],
};
\`\`\`

代码里直接用 \`useState\` 不用 import，编译时自动注入。

---

## 六、Vite 的代码拆分

### 6.1 自动拆分

Vite 默认会自动拆分：

- 每个 \`import()\` 拆成一个 chunk
- \`node_modules\` 的依赖拆到 vendor chunk

### 6.2 手动拆分

\`\`\`js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        ui: ['antd', '@radix-ui/react-dialog'],
        utils: ['lodash-es', 'dayjs'],
      },
    },
  },
}
\`\`\`

### 6.3 函数式拆分（更灵活）

\`\`\`js
manualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('react')) return 'react-vendor';
    if (id.includes('antd')) return 'antd-vendor';
    return 'vendor';
  }
}
\`\`\`

---

## 七、Vite vs Webpack 对比

| 维度 | Vite | Webpack |
|------|------|---------|
| 启动速度 | 极快（< 1s）| 慢（项目越大越慢）|
| HMR 速度 | < 100ms | 几百 ms ~ 几秒 |
| 配置复杂度 | 简单 | 复杂 |
| 生态成熟度 | 快速增长 | 最成熟 |
| 生产打包 | Rollup | Webpack 自身 |
| CSS 处理 | 内置 | 需配 loader |
| 老浏览器兼容 | 需 plugin-legacy | 完善支持 |
| Module Federation | 实验性 | 成熟 |
| 大型项目构建 | 慢（Rollup 单线程）| 慢（但可缓存）|

**选择建议**：

- **新项目首选 Vite**：开发体验最佳，生态已足够成熟
- **老项目迁移**：评估改造成本，Vite 配置兼容 Webpack 概念但语法不同
- **大型企业级项目**：考虑 Rspack（Webpack 兼容 + Rust 速度）

---

## 八、Vite 进阶技巧

### 8.1 SSR（服务端渲染）

Vite 原生支持 SSR，无需额外配置：

\`\`\`js
// server.js
import { createServer } from 'vite';

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
});

const app = express();
app.use(vite.middlewares);  // 用 Vite 中间件处理资源

app.get('*', async (req, res) => {
  const template = await vite.transformIndexHtml(req.url, '<div id="root"></div>');
  const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');
  const html = await render(req.url);
  res.send(template.replace('<div id="root"></div>', html));
});
\`\`\`

### 8.2 库模式（Library Mode）

开发组件库时，用 Vite 打包成库：

\`\`\`js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyLib',
      fileName: (format) => \`my-lib.\${format}.js\`,
    },
    rollupOptions: {
      external: ['react'],  // peer dependency 不打包
    },
  },
});
\`\`\`

输出 \`my-lib.es.js\`、\`my-lib.umd.js\` 两种格式，供不同环境使用。

### 8.3 多页应用

\`\`\`js
build: {
  rollupOptions: {
    input: {
      main: resolve(__dirname, 'index.html'),
      about: resolve(__dirname, 'about/index.html'),
      blog: resolve(__dirname, 'blog/index.html'),
    },
  },
}
\`\`\`

### 8.4 Glob Import

批量导入文件：

\`\`\`js
// 一次性导入 components 下所有组件
const modules = import.meta.glob('./components/*.jsx');
// 返回 { './components/Button.jsx': () => import('./components/Button.jsx'), ... }

// 立即加载
for (const path in modules) {
  modules[path]().then((mod) => {
    // 注册组件
  });
}
\`\`\`

---

## 九、常见问题

### 9.1 CJS 包在 Vite 里报错

部分老包用 CommonJS 导出，Vite 需要预构建转换。如果报错：

\`\`\`js
// vite.config.js
optimizeDeps: {
  include: ['some-cjs-package'],  // 强制预构建
}
\`\`\`

### 9.2 生产构建慢

Vite 生产用 Rollup，单线程，大项目可能比 Webpack 慢。解决方案：

- 升级到 Vite 5+（用 Rollup 4）
- 用 \`vite-plugin-turbo-chunk\` 优化拆分
- 评估迁移到 Rspack

### 9.3 浏览器兼容

默认 Vite 假设浏览器支持原生 ESM。要兼容老浏览器：

\`\`\`js
import legacy from '@vitejs/plugin-legacy';

export default {
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],  // browserslist
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
  ],
};
\`\`\`

会生成两份产物，老浏览器加载 \`legacy.js\`（带 polyfill）。

---

## 十、小结

Vite 是现代前端构建的事实标准，关键点：

1. **开发模式用原生 ESM**：启动快、HMR 快、与项目规模无关
2. **生产用 Rollup**：tree shaking 彻底、产物干净
3. **依赖预构建**：esbuild 把 node_modules 转 ESM
4. **配置简单**：开箱即用，常用功能零配置
5. **插件生态**：用 unplugin 写一次跨工具通用
6. **环境变量**：\`VITE_\` 前缀，\`import.meta.env\` 访问
7. **新项目首选 Vite**：开发体验远超 Webpack

下一章看 Babel——它是 Webpack/Vite 背后做 JS 代码转译的核心引擎。
`,
  },
  {
    id: "fe-eng-babel",
    group: "构建与打包",
    icon: "🧬",
    title: "Babel 与代码转译：AST 与 Polyfill",
    content: `

# Babel 与代码转译：AST 与 Polyfill

## 一、Babel 是什么

### 1.1 一句话定义

Babel 是一个 JavaScript 编译器。它把新版 JS（ES2024、JSX、TypeScript）转译成能在老浏览器运行的 ES5/ES6 代码。

### 1.2 Babel 解决的核心问题

1. **语法转译**：箭头函数 → 普通函数、可选链 → 三元表达式
2. **JSX 转换**：\`<div />\` → \`React.createElement('div')\`
3. **TypeScript 剥离**：去掉类型注解，输出纯 JS
4. **Polyfill 注入**：补充老浏览器缺失的 API（如 \`Promise\`、\`Array.flat\`）

---

## 二、AST：Babel 的工作基础

### 2.1 什么是 AST

AST（Abstract Syntax Tree，抽象语法树）是源码的树形结构表示。Babel 把源码解析成 AST，修改 AST，再生成新代码。

\`\`\`js
// 源码
const x = 1 + 2;

// 对应 AST（简化）
{
  type: 'Program',
  body: [{
    type: 'VariableDeclaration',
    kind: 'const',
    declarations: [{
      type: 'VariableDeclarator',
      id: { type: 'Identifier', name: 'x' },
      init: {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'NumericLiteral', value: 1 },
        right: { type: 'NumericLiteral', value: 2 },
      }
    }]
  }]
}
\`\`\`

### 2.2 Babel 的三步工作流程

\`\`\`
源码 → [Parse 解析] → AST → [Transform 转换] → 新 AST → [Generate 生成] → 目标代码
\`\`\`

1. **Parse**：用 \`@babel/parser\` 把源码解析成 AST
2. **Transform**：用 \`@babel/traverse\` 遍历 AST，插件修改节点
3. **Generate**：用 \`@babel/generator\` 把 AST 重新生成代码

### 2.3 用 AST 做点事

不用 Babel 配置，直接用底层 API：

\`\`\`js
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

const code = 'const x = 1 + 2;';
const ast = parse(code);

// 遍历并修改 AST
traverse(ast, {
  // 遇到 BinaryExpression 节点
  BinaryExpression(path) {
    const { left, right, operator } = path.node;
    if (operator === '+' && left.type === 'NumericLiteral' && right.type === 'NumericLiteral') {
      // 把 1 + 2 替换成 3（常量折叠）
      path.replaceWith({ type: 'NumericLiteral', value: left.value + right.value });
    }
  }
});

const output = generate(ast).code;
console.log(output); // const x = 3;
\`\`\`

---

## 三、Babel 配置

### 3.1 配置文件

\`\`\`js
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: '> 0.25%, not dead' }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-proposal-class-properties',
  ],
};
\`\`\`

### 3.2 Preset vs Plugin

- **Plugin**：单个转换功能（如转译箭头函数）
- **Preset**：一组 Plugin 的集合（如 preset-env 包含所有 ES2015+ 转译）

执行顺序：**Plugin 先于 Preset，Plugin 从前到后，Preset 从后到前**。

### 3.3 @babel/preset-env 详解

\`preset-env\` 是最常用的 preset，按目标浏览器决定转译哪些特性：

\`\`\`js
['@babel/preset-env', {
  targets: '> 0.25%, not dead',  // 浏览器市场份额 > 0.25% 且未停止维护
  // 或具体版本
  // targets: { chrome: '60', firefox: '60', safari: '12' },

  useBuiltIns: 'usage',   // 按需注入 polyfill（推荐）
  corejs: 3,               // 用 core-js 3 作为 polyfill 源

  modules: false,          // 不转 ESM 为 CJS（让 Webpack 做 tree shaking）
}]
\`\`\`

\`useBuiltIns\` 三个值：

- \`false\`：不自动注入 polyfill，需要在入口手动 \`import 'core-js'\`
- \`entry\`：在入口一次性引入目标浏览器需要的所有 polyfill
- \`usage\`：**按需注入**，代码里用到什么 API 才注入对应的 polyfill（最省体积）

---

## 四、Polyfill vs 语法转译

### 4.1 两类问题的区分

**语法转译**：新**语法** → 老**语法**

- 箭头函数 → function
- 模板字符串 → 字符串拼接
- 解构 → 普通赋值
- 类 → function + prototype

这些 Babel 能直接转换，不需要 polyfill。

**Polyfill**：新**API** → 老**API 模拟**

- \`Promise\` → 用 setTimeout 模拟
- \`Array.prototype.flat\` → 用 reduce 模拟
- \`Object.assign\` → 用 for...in 模拟
- \`String.padStart\` → 手动补齐

这些是**运行时**的，Babel 不能「编译时」转换，只能引入 polyfill 库。

### 4.2 core-js

\`core-js\` 是最标准的 polyfill 库：

\`\`\`js
// 全量引入（不推荐，体积大）
import 'core-js';

// 按特性引入
import 'core-js/stable/promise';
import 'core-js/stable/array/flat';

// 配合 preset-env useBuiltIns: 'usage'，自动按需引入
\`\`\`

### 4.3 regenerator-runtime

\`async/await\` 和 \`generator\` 需要运行时支持，Babel 把它们转成 \`regeneratorRuntime\` 调用：

\`\`\`js
// 源码
async function fetch() { await delay(100); }

// Babel 转译后
function fetch() {
  return regeneratorRuntime.async(function fetch$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0: _context.next = 2; return regeneratorRuntime.awrap(delay(100));
      case 2:
      case 'end': return _context.stop();
    }
  }, null, this);
}
\`\`\`

所以入口要 \`import 'regenerator-runtime/runtime'\`，或 preset-env 自动处理。

---

## 五、JSX 转换

### 5.1 classic vs automatic runtime

\`\`\`js
// JSX 源码
const el = <div className="x">Hello</div>;
\`\`\`

**Classic runtime**（React 16 及之前）：

\`\`\`js
const el = React.createElement('div', { className: 'x' }, 'Hello');
// ↑ 每个 JSX 文件必须 import React
\`\`\`

**Automatic runtime**（React 17+，推荐）：

\`\`\`js
import { jsx as _jsx } from 'react/jsx-runtime';
const el = _jsx('div', { className: 'x', children: 'Hello' });
// ↑ 不需要 import React
\`\`\`

### 5.2 配置

\`\`\`js
['@babel/preset-react', {
  runtime: 'automatic',  // 推荐
  // development: true,  // 开发模式（保留 __source 等调试信息）
}]
\`\`\`

新版 \`@babel/preset-react\` 默认就是 automatic，不用显式配置。

---

## 六、TypeScript 转译

### 6.1 Babel vs tsc

Babel 处理 TypeScript 是**只剥类型，不检查类型**：

\`\`\`ts
// 源码
const add = (a: number, b: number): number => a + b;

// Babel 输出（类型被去掉）
const add = (a, b) => a + b;
\`\`\`

特点：

- **快**：不做类型检查，只解析+剥类型
- **不报类型错误**：要类型检查得单独跑 \`tsc --noEmit\`

### 6.2 推荐工作流

- **转译**：用 Babel（或 SWC）剥类型，速度快
- **类型检查**：单独跑 \`tsc --noEmit\`，在 CI 或编辑器里做

\`\`\`json
{
  "scripts": {
    "build": "babel src --out-dir dist",
    "typecheck": "tsc --noEmit"
  }
}
\`\`\`

### 6.3 注意事项

Babel 转译 TypeScript 有几个**限制**：

- 不支持 \`enum\` 的某些用法（推荐用联合类型替代）
- 不支持 \`namespace\`
- 类型导入不会自动 inline（需要 \`isolatedModules\`）

\`\`\`json
// tsconfig.json
{
  "compilerOptions": {
    "isolatedModules": true,  // 让 TS 与 Babel 兼容
    "verbatimModuleSyntax": true  // 显式区分 type import
  }
}
\`\`\`

\`\`\`ts
// 显式 type import，Babel 知道要整段删除
import type { User } from './types';

// 既是值又是类型的，不能用 type import
import { User } from './User';  // User 是个 class
\`\`\`

---

## 七、Babel 插件开发

### 7.1 一个最小的插件

把所有 \`console.log\` 替换成 \`console.warn\`：

\`\`\`js
// babel-plugin-console-to-warn.js
module.exports = function ({ types: t }) {
  return {
    visitor: {
      CallExpression(path) {
        const { callee } = path.node;
        // 匹配 console.log(...)
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.object, { name: 'console' }) &&
          t.isIdentifier(callee.property, { name: 'log' })
        ) {
          // 把 log 改成 warn
          callee.property.name = 'warn';
        }
      },
    },
  };
};
\`\`\`

\`\`\`js
// 使用
module.exports = {
  plugins: ['./babel-plugin-console-to-warn.js'],
};
\`\`\`

### 7.2 实战：删除生产环境的 console.log

\`\`\`js
module.exports = function ({ types: t }) {
  return {
    visitor: {
      CallExpression(path) {
        const { callee } = path.node;
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.object, { name: 'console' }) &&
          ['log', 'debug', 'info'].includes(callee.property.name)
        ) {
          // 直接删除整个调用语句
          path.parentPath.remove();
        }
      },
    },
  };
};
\`\`\`

只在生产构建时启用，能减小体积并避免日志泄露。

---

## 八、SWC 与 Babel 的对比

### 8.1 SWC 是什么

SWC（Speedy Web Compiler）是用 Rust 写的 Babel 替代品，速度是 Babel 的 20-70 倍。

### 8.2 速度对比

| 任务 | Babel | SWC |
|------|-------|-----|
| 转译 1MB JS | 800ms | 30ms |
| 转译 1000 个文件 | 10s | 0.5s |

### 8.3 用法

\`\`\`js
// .swcrc
{
  "jsc": {
    "parser": {
      "syntax": "ecmascript",
      "jsx": true
    },
    "target": "es2015"
  }
}
\`\`\`

在 Next.js 里默认用 SWC，Vite 也可以用 \`@vitejs/plugin-react-swc\` 替代 Babel：

\`\`\`js
import react from '@vitejs/plugin-react-swc';

export default {
  plugins: [react()],  // 用 SWC 替代 Babel
};
\`\`\`

### 8.4 何时用 Babel vs SWC

| 场景 | 推荐 |
|------|------|
| 新项目（Next.js、Vite）| SWC |
| 老项目用 Babel | 保持 Babel，迁移成本高 |
| 自定义 Babel 插件多 | Babel（SWC 插件生态还弱）|
| 极致构建速度 | SWC |

---

## 九、PostCSS：CSS 的 Babel

### 9.1 类比

PostCSS 之于 CSS，就像 Babel 之于 JS：

- Babel：JS 源码 → AST → 转换 → 新 JS
- PostCSS：CSS 源码 → AST → 转换 → 新 CSS

### 9.2 常用 PostCSS 插件

| 插件 | 作用 |
|------|------|
| \`autoprefixer\` | 自动加浏览器前缀（\`-webkit-\`、\`-moz-\`）|
| \`postcss-preset-env\` | 用未来 CSS 语法（如嵌套）|
| \`cssnano\` | 压缩 CSS |
| \`postcss-nested\` | 支持嵌套语法 |
| \`postcss-import\` | 处理 \`@import\` |
| \`tailwindcss/nesting\` | Tailwind 配套嵌套 |

### 9.3 配置

\`\`\`js
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),                // 加前缀
    require('postcss-preset-env')({         // 用未来 CSS
      stage: 2,
    }),
    require('cssnano')({                    // 生产压缩
      preset: 'default',
    }),
  ],
};
\`\`\`

\`\`\`css
/* 源码 */
.btn {
  color: white;
  &::hover { color: black; }  /* 嵌套语法 */
}

/* PostCSS 输出 */
.btn { color: white; }
.btn:hover { color: black; }
\`\`\`

---

## 十、小结

Babel 是前端转译的核心引擎，关键点：

1. **三步流程**：Parse → Transform → Generate，基于 AST
2. **Preset 是 Plugin 集合**：preset-env 按目标浏览器决定转译
3. **语法 vs Polyfill**：语法 Babel 直接转，API 需要 polyfill
4. **useBuiltIns: 'usage'**：按需注入 polyfill，体积最小
5. **JSX automatic runtime**：React 17+ 推荐，不用 import React
6. **TS 转译不检查类型**：单独跑 \`tsc --noEmit\` 做检查
7. **SWC 替代 Babel**：Rust 写的，速度快 20 倍
8. **PostCSS 是 CSS 的 Babel**：autoprefixer 等插件

下一章看 CSS 工程化——CSS Modules、Sass、Tailwind、CSS-in-JS 的选型与实践。
`,
  },
  {
    id: "fe-eng-css-eng",
    group: "构建与打包",
    icon: "🎨",
    title: "CSS 工程化：从 Sass 到 Tailwind 的演进",
    content: `

# CSS 工程化：从 Sass 到 Tailwind 的演进

## 一、CSS 工程化的痛点

### 1.1 原生 CSS 的三大问题

1. **全局污染**：所有样式都在全局作用域，命名冲突频发
2. **样式难以复用**：没有变量、函数、混入，逻辑难抽象
3. **样式与结构脱节**：CSS 文件与组件文件分离，改一个组件要在多个文件跳

### 1.2 CSS 工程化的目标

- **作用域隔离**：组件样式不互相影响
- **复用能力**：变量、mixin、函数
- **与组件结合**：组件即样式单元
- **按需加载**：用到的样式才打包

---

## 二、Sass/Less：预处理器

### 2.1 解决什么问题

Sass（SCSS）和 Less 提供了 CSS 没有的能力：

- 变量
- 嵌套
- 混入（mixin）
- 继承（extend）
- 函数和运算
- 模块化 \`@import\`/\`@use\`

### 2.2 SCSS 语法示例

\`\`\`scss
// 变量
$primary: #2563eb;
$radius: 8px;

// 嵌套
.card {
  background: white;
  border-radius: $radius;

  &__title {        // 等价 .card__title
    font-size: 18px;
  }

  &:hover {         // 等价 .card:hover
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

// mixin 复用代码块
@mixin button($bg, $color: white) {
  background: $bg;
  color: $color;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary { @include button($primary); }
.btn-danger { @include button(#dc2626); }

// 循环
@for $i from 1 through 12 {
  .col-#{$i} { width: percentage($i / 12); }
}

// 函数
@function rem($px) {
  @return $px / 16px * 1rem;
}
.text { font-size: rem(20px); }
\`\`\`

### 2.3 @use vs @import

老版本 Sass 用 \`@import\`，新版本推荐 \`@use\`：

\`\`\`scss
// _variables.scss
$primary: #2563eb;

// main.scss
@use 'variables' as v;  // 命名空间
.btn { background: v.$primary; }

// @import 的问题：
// 1. 全局污染（变量全局可见）
// 2. 每次导入都重新编译
// 3. 无法追踪依赖关系
\`\`\`

---

## 三、CSS Modules：原生 CSS + 作用域隔离

### 3.1 解决什么问题

Sass 解决了「能力不足」但没解决「全局污染」。CSS Modules 用构建工具自动给类名加 hash，实现局部作用域。

\`\`\`css
/* Button.module.css */
.btn { background: blue; }
.active { background: red; }
\`\`\`

构建后类名被改写：

\`\`\`html
<button class="Button_btn__a3f5 Button_active__b7c8">Click</button>
\`\`\`

### 3.2 用法

\`\`\`jsx
import styles from './Button.module.css';

function Button({ active }) {
  return (
    <button className={\`\${styles.btn} \${active ? styles.active : ''}\`}>
      Click
    </button>
  );
}
\`\`\`

\`styles\` 是一个对象，键是原始类名，值是带 hash 的类名。

### 3.3 全局样式例外

某些情况下需要全局类（如第三方库需要）：

\`\`\`css
:global(.ant-btn) {
  border-radius: 0;
}
\`\`\`

### 3.4 composes 组合类

\`\`\`css
/* base.module.css */
.btn { padding: 8px 16px; border-radius: 4px; }

/* Button.module.css */
.btn {
  composes: btn from './base.module.css';  /* 继承 base.btn */
  background: blue;
}
\`\`\`

### 3.5 优缺点

**优点**：

- 写原生 CSS，无额外语法学习
- 自动作用域隔离，无命名冲突
- 编译时分析，tree shaking 自然支持

**缺点**：

- 没有变量、mixin（需要配合 Sass/PostCSS）
- 类名引用是对象访问，写起来稍长

---

## 四、CSS-in-JS：把样式写进 JS

### 4.1 解决什么问题

CSS Modules 解决了作用域，但样式与组件仍是分离的。CSS-in-JS 把样式直接写在组件内，享受 JS 的全部能力。

### 4.2 Styled Components 示例

\`\`\`jsx
import styled from 'styled-components';

const Button = styled.button\`
  background: \${props => props.primary ? '#2563eb' : '#64748b'};
  color: white;
  padding: 8px 16px;
  border-radius: 4px;

  &:hover {
    background: \${props => props.primary ? '#1d4ed8' : '#475569'};
  }
\`;

function App() {
  return (
    <>
      <Button>普通按钮</Button>
      <Button primary>主要按钮</Button>
    </>
  );
}
\`\`\`

### 4.3 Emotion 示例

\`\`\`jsx
import { css } from '@emotion/react';

const style = css\`
  background: blue;
  &:hover { background: darkblue; }
\`;

function Button() {
  return <button css={style}>Click</button>;
}
\`\`\`

### 4.4 优缺点

**优点**：

- 样式与组件同文件，方便维护
- 用 JS 写样式，可读 props、动态计算
- 自动作用域隔离
- SSR 支持（styled-components 等）

**缺点**：

- 运行时开销（生成类名、插入 DOM）
- 包体积增加
- 不能用 CSS 调试工具直接定位
- 学习曲线

### 4.5 Linaria：零运行时 CSS-in-JS

\`\`\`jsx
import { styled } from '@linaria/react';

const Button = styled.button\`
  background: blue;
  &:hover { background: darkblue; }
\`;
\`\`\`

构建时把样式抽成静态 CSS 文件，运行时零开销。结合了 CSS Modules 的性能 + CSS-in-JS 的体验。

---

## 五、Tailwind CSS：原子化 CSS

### 5.1 完全不同的思路

传统 CSS 写法：

\`\`\`css
.card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
\`\`\`

\`\`\`html
<div class="card">...</div>
\`\`\`

Tailwind 写法：

\`\`\`html
<div class="bg-white rounded-lg p-4 shadow-md">...</div>
\`\`\`

不用起类名，直接用原子类组合。

### 5.2 为什么这样写

1. **不用纠结命名**：不用想 \`.card\` 还是 \`.panel\`
2. **不写 CSS 文件**：HTML 里直接搞定
3. **样式即结构**：看 HTML 就知道长什么样
4. **体积小**：构建时 purge 未用的类，最终 CSS 极小
5. **一致设计**：内置设计系统（spacing、color、typography），统一视觉

### 5.3 配置

\`\`\`js
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
};
\`\`\`

### 5.4 响应式

\`\`\`html
<!-- 默认（手机）单列，md（平板）双列，lg（桌面）三列 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  ...
</div>
\`\`\`

### 5.5 状态变体

\`\`\`html
<button class="bg-blue-500 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50">
  Click
</button>
\`\`\`

### 5.6 Tailwind 的争议

**反对者观点**：

- HTML 里类太长，可读性差
- 学习曲线（要记一堆类名）
- 与组件抽象理念冲突

**支持者观点**：

- 不用切换 HTML/CSS 文件
- 不用想类名
- 删组件时不会留下无用 CSS
- 设计约束强，不易出乱七八糟的样式

**实践建议**：小型项目和团队新手多 → 不推荐；中大型项目 + 团队接受度高 → 推荐。

### 5.7 Tailwind + 组件抽象

把长 class 抽成组件：

\`\`\`jsx
function Button({ variant = 'primary', children, ...props }) {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-700 text-white',
    danger: 'bg-red-500 hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-gray-100',
  };
  return (
    <button
      className={\`px-4 py-2 rounded \${variants[variant]}\`}
      {...props}
    >
      {children}
    </button>
  );
}
\`\`\`

---

## 六、CSS 工程化的选型决策

### 6.1 对比表

| 方案 | 作用域隔离 | 学习成本 | 动态样式 | 包体积 | SSR | 性能 |
|------|-----------|----------|----------|--------|-----|------|
| 原生 CSS | ❌ | 低 | ❌ | 小 | ✅ | 最好 |
| Sass/Less | ❌ | 中 | ❌ | 中 | ✅ | 好 |
| CSS Modules | ✅ | 低 | ❌ | 小 | ✅ | 好 |
| CSS-in-JS (运行时) | ✅ | 中 | ✅ | 中 | 部分 | 较差 |
| CSS-in-JS (零运行时) | ✅ | 中 | 部分 | 小 | ✅ | 好 |
| Tailwind | ✅（原子类）| 高 | ❌ | 极小 | ✅ | 最好 |

### 6.2 选型建议

- **新项目，团队接受度高** → Tailwind + 组件抽象
- **新项目，团队保守** → CSS Modules + Sass
- **重度动态主题** → CSS-in-JS（Emotion / styled-components）
- **极致性能** → Tailwind 或 Linaria（零运行时）
- **库/组件库** → CSS Modules 或 Tailwind（用户容易覆盖）

### 6.3 不要混用太多

一个项目里不要同时用 Sass + CSS Modules + CSS-in-JS + Tailwind，团队会精神分裂。选一个主方案，必要时局部用另一个。

---

## 七、实用技巧

### 7.1 CSS 变量（自定义属性）

不用 Sass 也能用变量：

\`\`\`css
:root {
  --primary: #2563eb;
  --radius: 8px;
}

.btn {
  background: var(--primary);
  border-radius: var(--radius);
}

/* JS 动态修改 */
document.documentElement.style.setProperty('--primary', '#dc2626');
\`\`\`

优势：

- 浏览器原生支持，无构建步骤
- 运行时可改（不像 Sass 变量是编译时常量）
- 支持继承、级联

### 7.2 主题切换

\`\`\`css
:root {
  --bg: white;
  --text: #1e293b;
}

[data-theme='dark'] {
  --bg: #1e293b;
  --text: #e2e8f0;
}

body { background: var(--bg); color: var(--text); }
\`\`\`

\`\`\`js
// 切换主题
document.documentElement.dataset.theme = 'dark';
\`\`\`

### 7.3 容器查询（Container Queries）

不用再依赖视口宽度做响应式：

\`\`\`css
.card {
  container-type: inline-size;
}

.card__title {
  font-size: 1rem;
}

@container (min-width: 400px) {
  .card__title {
    font-size: 1.5rem;
  }
}
\`\`\`

组件自身宽度变化时切换样式，比媒体查询更精确。

---

## 八、小结

CSS 工程化方案的演进脉络：

1. **Sass/Less**：补全 CSS 能力（变量、嵌套、mixin）
2. **CSS Modules**：解决作用域隔离（hash 类名）
3. **CSS-in-JS**：样式与组件深度结合（运行时/零运行时）
4. **Tailwind**：原子化 + 设计系统约束

选型核心是**团队偏好**与**项目场景**，没有绝对最优。新项目优先考虑 Tailwind 或 CSS Modules，避免复杂的 CSS-in-JS 运行时开销。

下一章看构建性能优化——打包体积、加载速度、运行性能的实战优化。
`,
  },
  {
    id: "fe-eng-perf",
    group: "构建与打包",
    icon: "🚀",
    title: "构建性能优化：体积、加载与运行时",
    content: `

# 构建性能优化：体积、加载与运行时

## 一、性能优化的三个维度

前端性能优化要分清是优化「什么」：

| 维度 | 关注点 | 衡量指标 |
|------|--------|----------|
| 构建性能 | 构建快不快 | 启动时间、HMR 时间、build 时间 |
| 加载性能 | 用户看到内容快不快 | FCP、LCP、TTI |
| 运行性能 | 页面交互流畅不流畅 | INP、CLS、FPS |

三者经常冲突（如多打包一份 polyfill 提升兼容性，但增大体积），要权衡。

---

## 二、构建性能优化

### 2.1 优化构建速度

**1. 用更快的工具**

- Webpack → Vite（开发体验质变）
- Babel → SWC（转译速度 20 倍）
- Webpack → Rspack（Webpack 配置兼容 + Rust 速度）

**2. 缓存**

\`\`\`js
// Webpack 5 文件系统缓存
module.exports = {
  cache: { type: 'filesystem' },
};

// Vite 依赖预构建缓存（自动）
// 修改 vite.config.js 时强制重新预构建
\`\`\`

**3. 缩小处理范围**

\`\`\`js
// Webpack：排除 node_modules
module: {
  rules: [{
    test: /\\.js$/,
    exclude: /node_modules/,  // 不处理 node_modules
    use: 'babel-loader',
  }],
},

// resolve.alias：减少解析路径
resolve: { alias: { '@': path.resolve('src') } },
\`\`\`

**4. 并行处理**

\`\`\`js
// thread-loader（Webpack）
module.exports = {
  module: {
    rules: [{
      test: /\\.js$/,
      use: ['thread-loader', 'babel-loader'],
    }],
  },
};
\`\`\`

### 2.2 优化构建体积

**1. Tree Shaking**（前一章详述）

**2. 压缩**

\`\`\`js
// Webpack 5 默认用 TerserPlugin
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      parallel: true,
      terserOptions: { compress: { drop_console: true } },
    })],
  },
};

// CSS 压缩
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
module.exports = {
  optimization: {
    minimizer: [\`...\`, new CssMinimizerPlugin()],
  },
};
\`\`\`

**3. 按需加载**

- 路由懒加载：\`React.lazy(() => import('./Page'))\`
- 组件懒加载：\`const Editor = lazy(() => import('./Editor'))\`
- 第三方库按需引入：\`import { debounce } from 'lodash-es'\`

**4. 替换大依赖**

| 替换前 | 替换后 | 体积节省 |
|--------|--------|----------|
| \`moment\` | \`dayjs\` | 67KB → 2KB |
| \`lodash\` | \`lodash-es\` + tree shaking | 70KB → 用多少省多少 |
| \`axios\` | \`fetch\` | 30KB → 0 |
| \`jquery\` | 原生 DOM | 90KB → 0 |

### 2.3 构建分析

\`\`\`bash
# Webpack Bundle Analyzer
npx webpack-bundle-analyzer dist/stats.json

# Vite
npx vite-bundle-visualizer

# source-map-explorer
npx source-map-explorer dist/*.js
\`\`\`

可视化看到每个模块占用体积，针对性优化。

---

## 三、加载性能优化

### 3.1 资源加载策略

**1. 关键资源 preload**

\`\`\`html
<head>
  <!-- 提前加载关键 CSS/字体 -->
  <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/css/critical.css" as="style">
</head>
\`\`\`

**2. 非关键资源 prefetch**

\`\`\`html
<!-- 浏览器空闲时预取下一页资源 -->
<link rel="prefetch" href="/js/next-page.chunk.js">

<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//cdn.example.com">

<!-- 预连接（DNS + TCP + TLS）-->
<link rel="preconnect" href="//cdn.example.com" crossorigin>
\`\`\`

**3. async / defer 加载脚本**

\`\`\`html
<!-- 阻塞解析 -->
<script src="a.js"></script>

<!-- 异步下载，下载完立即执行（可能中断解析）-->
<script src="b.js" async></script>

<!-- 异步下载，解析完才执行（推荐）-->
<script src="c.js" defer></script>
\`\`\`

### 3.2 代码拆分 + 按需加载

\`\`\`jsx
// 路由级拆分
import { lazy, Suspense } from 'react';
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
\`\`\`

### 3.3 图片优化

**1. 用现代格式**

\`\`\`html
<picture>
  <source srcset="/img/hero.avif" type="image/avif">
  <source srcset="/img/hero.webp" type="image/webp">
  <img src="/img/hero.jpg" alt="hero">
</picture>
\`\`\`

AVIF/WebP 比 JPEG 小 30-50%，画质相同。

**2. 响应式图片**

\`\`\`html
<img
  src="/img/hero-800.jpg"
  srcset="/img/hero-400.jpg 400w, /img/hero-800.jpg 800w, /img/hero-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="hero"
>
\`\`\`

浏览器按屏幕尺寸选合适的图，移动端不浪费流量加载桌面大图。

**3. 懒加载**

\`\`\`html
<!-- 原生懒加载（Chrome 76+）-->
<img src="/img/photo.jpg" loading="lazy" alt="...">

<!-- IntersectionObserver 实现 -->
<img data-src="/img/photo.jpg" class="lazy" alt="...">
<script>
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});
document.querySelectorAll('.lazy').forEach(img => observer.observe(img));
</script>
\`\`\`

### 3.4 HTTP 缓存

**强缓存**（Cache-Control）：

\`\`\`http
Cache-Control: max-age=31536000, immutable
\`\`\`

\`immutable\` 告诉浏览器文件永不变化，连条件请求都不发。配合 \`[contenthash]\` 文件名，改了文件名就失效。

**协商缓存**（ETag / Last-Modified）：

\`\`\`http
ETag: "abc123"
Last-Modified: Wed, 21 Oct 2025 07:28:00 GMT
\`\`\`

下次请求带 \`If-None-Match\` / \`If-Modified-Since\`，服务器返回 304 表示用缓存。

**最佳实践**：

- HTML：\`no-cache\`（每次都协商，保证拿到最新入口）
- JS/CSS/图片：\`max-age=31536000, immutable\`（一年强缓存）
- 文件名带 \`[contenthash]\`：内容变了文件名变，自动失效

---

## 四、运行时性能优化

### 4.1 React 渲染优化

**1. React.memo 避免子组件重渲染**

\`\`\`jsx
const ExpensiveItem = React.memo(({ item }) => {
  return <div>{/* 复杂渲染 */}</div>;
});

function List({ items }) {
  return items.map(item => <ExpensiveItem key={item.id} item={item} />);
}
\`\`\`

**2. useMemo / useCallback 缓存**

\`\`\`jsx
function Parent({ data }) {
  // 缓存计算结果
  const processed = useMemo(() => heavyProcess(data), [data]);

  // 缓存函数引用，避免子组件因 props 变化重渲染
  const handleClick = useCallback((id) => {
    console.log(id);
  }, []);

  return <Child data={processed} onClick={handleClick} />;
}
\`\`\`

**3. 列表虚拟化**

\`\`\`jsx
import { useVirtual } from 'react-virtual';

function BigList({ items }) {
  const parentRef = useRef();
  const rowVirtualizer = useVirtual({
    size: items.length,
    parentRef,
    estimateSize: () => 50,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
      <div style={{ height: rowVirtualizer.totalSize }}>
        {rowVirtualizer.virtualItems.map(vItem => (
          <div
            key={vItem.index}
            style={{ position: 'absolute', top: vItem.start, height: vItem.size }}
          >
            {items[vItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
\`\`\`

10000 条数据只渲染可见的 20 条，性能大幅提升。

### 4.2 防抖与节流

\`\`\`js
// 防抖：触发后等 N ms 才执行，期间再触发则重新计时
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// 节流：N ms 内只执行一次
function throttle(fn, delay) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn(...args);
    }
  };
}

// 用法
input.addEventListener('input', debounce(search, 300));
window.addEventListener('scroll', throttle(onScroll, 100));
\`\`\`

### 4.3 Web Worker

CPU 密集任务放主线程会卡 UI。Web Worker 在独立线程跑：

\`\`\`js
// main.js
const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
worker.postMessage({ data: bigArray });
worker.onmessage = (e) => console.log('结果:', e.data);

// worker.js
self.onmessage = (e) => {
  const result = heavyCompute(e.data.data);
  self.postMessage(result);
};
\`\`\`

Vite/Webpack 都支持 \`new Worker(new URL(...))\` 语法，自动打包成独立 chunk。

### 4.4 requestIdleCallback

\`\`\`js
// 把非紧急任务放到浏览器空闲时执行
function processLowPriorityTask(deadline) {
  while (deadline.timeRemaining() > 0 && tasks.length) {
    const task = tasks.shift();
    task();
  }
  if (tasks.length) {
    requestIdleCallback(processLowPriorityTask);
  }
}
requestIdleCallback(processLowPriorityTask);
\`\`\`

---

## 五、Core Web Vitals

Google 的核心 Web 指标，影响搜索排名：

### 5.1 LCP（Largest Contentful Paint）

最大内容渲染时间，目标 < 2.5 秒。

优化手段：

- 优化服务器响应（TTFB）
- 优先加载 LCP 元素（图片、文字块）
- 用 \`preload\` 提前加载 LCP 资源
- 避免渲染阻塞的 CSS/JS

### 5.2 CLS（Cumulative Layout Shift）

累积布局偏移，目标 < 0.1。

常见原因：

- 图片没设尺寸，加载后撑开布局
- 字体加载导致文字跳动
- 动态插入内容（广告、弹窗）

\`\`\`html
<!-- 图片设宽高，预留空间 -->
<img src="..." width="800" height="600" alt="...">

<!-- 字体加载时用 fallback -->
font-display: swap;
\`\`\`

### 5.3 INP（Interaction to Next Paint）

交互到下次绘制，目标 < 200ms（2024 年取代 FID）。

优化手段：

- 长任务拆分（\`setTimeout\` / \`scheduler.yield\`）
- 减少主线程阻塞
- Web Worker 处理重计算

### 5.4 测量工具

- **Lighthouse**：Chrome DevTools 自带，跑一次审计
- **web-vitals 库**：收集真实用户数据
- **Chrome UX Report**：真实用户性能数据

\`\`\`js
import { onLCP, onCLS, onINP } from 'web-vitals';

onLCP(console.log);
onCLS(console.log);
onINP(console.log);

// 上报到监控服务
onLCP(metric => fetch('/api/vitals', { method: 'POST', body: JSON.stringify(metric) }));
\`\`\`

---

## 六、性能预算

### 6.1 设定预算

\`\`\`json
// .bundlewatch.json
{
  "files": [
    { "path": "dist/main.*.js", "maxSize": "150 KB" },
    { "path": "dist/vendor.*.js", "maxSize": "200 KB" },
    { "path": "dist/main.*.css", "maxSize": "30 KB" }
  ]
}
\`\`\`

CI 中检查，超过预算的 PR 直接拒绝：

\`\`\`bash
npx bundlewatch
\`\`\`

### 6.2 Performance Budget 配置

\`\`\`js
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 单个 chunk 不超过 250KB
        experimentalMinChunkSize: 250 * 1024,
      },
    },
  },
});
\`\`\`

---

## 七、小结

性能优化是工程化的「上层应用」，关键点：

1. **三个维度分清**：构建 / 加载 / 运行，别混淆
2. **构建优化**：用更快工具（Vite/SWC/Rspack）+ 缓存 + 缩小范围
3. **加载优化**：preload/prefetch + 代码拆分 + 图片优化 + HTTP 缓存
4. **运行优化**：React.memo/useMemo + 虚拟列表 + Web Worker + 防抖节流
5. **Core Web Vitals**：LCP/CLS/INP 是 SEO 关键
6. **性能预算**：CI 卡阈值，防止性能退化
7. **测量驱动优化**：先量化、后优化，避免无谓改写

构建与打包篇到此结束。下一章开始质量与现代化篇，看 ESLint 如何统一代码风格。
`,
  },
];
