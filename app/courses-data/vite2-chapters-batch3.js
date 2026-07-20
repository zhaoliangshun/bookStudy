// =============================================================
// Vite 大全集（终极版）—— 第3批章节
// 第三部分 配置详解 + 第四部分 静态资源（共 6 章）
// -------------------------------------------------------------
// 本批包含 6 章：
//   vite2-ch14 : 第十四章 server 配置详解
//   vite2-ch15 : 第十五章 build 配置详解
//   vite2-ch16 : 第十六章 css 配置详解
//   vite2-ch17 : 第十七章 define 与环境变量注入
//   vite2-ch18 : 第十八章 worker 配置
//   vite2-ch19 : 第十九章 CSS/SCSS/Less 处理
// =============================================================

export const chapters = [
  // =========================================================
  // 第十四章：server 配置详解
  // =========================================================
  {
    id: "vite2-ch14",
    group: "第三部分 配置详解",
    icon: "🖥️",
    title: "第十四章 server 配置详解",
    content: `## 第十四章　server 配置详解

\`server\` 选项控制开发服务器（\`vite\` 命令启动的那个）的所有行为。配好这一节，开发体验会顺很多。本章把常用字段一次讲清楚。

| 字段 | 一句话作用 |
|------|-----------|
| \`host\` / \`port\` | 监听地址与端口 |
| \`open\` | 启动时自动打开浏览器 |
| \`https\` | 启用 HTTPS |
| \`proxy\` | 反向代理（最常用）|
| \`cors\` / \`headers\` | 跨域与自定义响应头 |
| \`hmr\` | 热更新行为 |
| \`watch\` | 文件监听 |
| \`middlewareMode\` | 嵌入到其他 Node 服务器 |

---

## 一、host 与 port

\`\`\`js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',   // 监听所有网卡，手机/同事可访问
    port: 3000,        // 端口号
    strictPort: true,  // 端口被占用直接报错（不自动 +1）
  }
})
\`\`\`

| 字段 | 默认值 | 说明 |
|------|--------|------|
| \`host\` | \`'localhost'\` | 监听地址。设为 \`0.0.0.0\` 或 \`true\` 暴露到局域网 |
| \`port\` | \`5173\` | 端口号 |
| \`strictPort\` | \`false\` | \`true\` 时端口占用不自动切换 |

命令行等价：\`vite --host --port 3000\`。

---

## 二、open（自动打开浏览器）

\`\`\`js
server: {
  open: true,                  // 启动时打开浏览器
  open: '/index.html',         // 打开指定路径
  open: 'http://example.com'   // 打开指定 URL
}
\`\`\`

命令行：\`vite --open\`。

---

## 三、https

开发环境启用 HTTPS，用于调用摄像头、地理定位、Service Worker 等需要安全上下文的 API。

\`\`\`js
server: {
  https: true   // 用 Vite 自带证书（浏览器会"不安全"警告）
}
\`\`\`

使用自己的证书：

\`\`\`js
import fs from 'fs'

server: {
  https: {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  }
}
\`\`\`

> 推荐插件 \`vite-plugin-mkcert\`，自动生成受信任证书，浏览器无警告。

---

## 四、proxy（反向代理，最常用）

开发时前端在 5173、后端在 8080，跨域怎么破？\`proxy\` 把指定路径转发到后端，浏览器看到的就是同源请求。

\`\`\`js
server: {
  proxy: {
    // 标准写法
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,    // 修改 Host 头到 target
      rewrite: (path) => path.replace(/^\\/api/, '')
    },
    // WebSocket
    '/ws': {
      target: 'ws://localhost:8080',
      ws: true
    },
    // 简写：直接转发（target + changeOrigin 默认开）
    '/static': 'http://localhost:8080'
  }
}
\`\`\`

效果：请求 \`/api/users\` → \`http://localhost:8080/users\`（去掉 /api 前缀）。

**rewrite 进阶**：

\`\`\`js
rewrite: (path) => path.replace('/api', '/v1')   // /api/users → /v1/users
\`\`\`

---

## 五、cors 与 headers

\`\`\`js
server: {
  cors: true,   // 允许跨域（默认就开）

  headers: {
    'X-Custom-Header': 'dev-env'
  }
}
\`\`\`

\`headers\` 给所有响应加自定义头，常用于模拟后端行为。

---

## 六、hmr（热更新）

\`\`\`js
server: {
  hmr: {
    protocol: 'ws',     // 默认 ws，HTTPS 用 wss
    host: 'localhost',
    port: 5174,         // 单独 HMR 端口
    overlay: false      // 关闭错误覆盖层
  }
}

// 完全禁用 HMR
server: { hmr: false }
\`\`\`

调试 HMR 不稳定时可关闭 \`overlay\`；用 nginx 反代时可单独指定 HMR 端口。

---

## 七、watch（文件监听）

\`\`\`js
server: {
  watch: {
    ignored: ['**/node_modules/**', '**/dist/**']
    // 监听 node_modules 里的某个包（默认不监听）
  }
}
\`\`\`

底层是 \`chokidar\`，所有 chokidar 选项都支持。改了 \`node_modules/xxx\` 的代码不生效？检查这里。

---

## 八、middlewareMode（中间件模式）

把 Vite 嵌入到现有的 Node 服务器（Express / Connect）里，不单独启动 HTTP 服务。

\`\`\`js
// vite.config.js
server: { middlewareMode: true }

// server.js
import express from 'express'
import { createServer } from 'vite'

const app = express()
const vite = await createServer({ server: { middlewareMode: true } })
app.use(vite.middlewares)
app.listen(3000)
\`\`\`

适用于 SSR、嵌入式场景。

---

## 九、完整配置示例

\`\`\`js
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: p => p.replace(/^\\/api/, '')
      }
    },
    hmr: { overlay: false },
    watch: { ignored: '**/dist/**' }
  }
})
\`\`\`

---

## 下一章

\`server\` 配置搞定后，下一章看 \`build\` 配置——打包输出怎么控制。`,
    code: `// 演示：模拟一个完整的 server 配置对象并测试 proxy rewrite
const serverConfig = {
  host: '0.0.0.0',
  port: 3000,
  strictPort: true,
  open: true,
  cors: true,
  https: false,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\\/api/, '')
    },
    '/ws': {
      target: 'ws://localhost:8080',
      ws: true
    }
  },
  hmr: { overlay: false },
  watch: { ignored: ['**/node_modules/**', '**/dist/**'] }
}

console.log("🖥️  server 配置概览")
console.log("=====================================")
console.log("监听地址:", serverConfig.host)
console.log("端口:", serverConfig.port, "| strictPort:", serverConfig.strictPort)
console.log("自动打开浏览器:", serverConfig.open)
console.log("HTTPS:", serverConfig.https)

console.log("\\n🔄 代理规则:")
for (const [key, val] of Object.entries(serverConfig.proxy)) {
  console.log("  " + key + " → " + val.target + " (ws: " + !!val.ws + ")")
}

// 模拟 rewrite
console.log("\\n📝 测试 /api/users 重写:")
const rewritten = serverConfig.proxy['/api'].rewrite('/api/users')
console.log("  /api/users  → " + rewritten)

console.log("\\n💡 host 0.0.0.0 + strictPort: true 是开发常用组合")`
  },

  // =========================================================
  // 第十五章：build 配置详解
  // =========================================================
  {
    id: "vite2-ch15",
    group: "第三部分 配置详解",
    icon: "📦",
    title: "第十五章 build 配置详解",
    content: `## 第十五章　build 配置详解

\`build\` 选项控制 \`vite build\` 的产物——输出到哪、压缩成什么样、怎么分包、生成不生成 sourcemap。生产环境能否上线、首屏快不快，主要看这里。

| 字段 | 一句话作用 |
|------|-----------|
| \`target\` | 构建目标（兼容到哪些浏览器）|
| \`outDir\` | 输出目录 |
| \`assetsDir\` | 静态资源子目录 |
| \`assetsInlineLimit\` | 小于该体积的资源内联 base64 |
| \`cssCodeSplit\` | CSS 是否拆分 |
| \`sourcemap\` | 生成 sourcemap |
| \`minify\` | 压缩方式 |
| \`rollupOptions\` | Rollup 原生配置（最强大）|
| \`chunkSizeWarningLimit\` | chunk 体积警告阈值 |
| \`emptyOutDir\` | 构建前清空输出目录 |

---

## 一、target（构建目标）

\`\`\`js
build: {
  target: 'es2020',     // 默认 'modules'（兼容原生 ESM 的浏览器）
  target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']
}
\`\`\`

值可以是字符串或字符串数组。设低一点兼容老浏览器，但产物会变大（要注入 polyfill）。

---

## 二、outDir 与 assetsDir

\`\`\`js
build: {
  outDir: 'dist',       // 输出目录（默认 dist）
  assetsDir: 'assets',  // 静态资源子目录（默认 assets）
}
\`\`\`

构建后结构：

\`\`\`
dist/
├── index.html
└── assets/
    ├── index-a1b2c3d4.css
    ├── index-e5f6g7h8.js
    └── logo-i9j0k1l2.png
\`\`\`

\`outDir\` 设为 \`build\` 适合部署到某些静态托管（如 GitHub Pages 默认目录）。

---

## 三、assetsInlineLimit（资源内联阈值）

\`\`\`js
build: {
  assetsInlineLimit: 4096   // 默认 4KB
}
\`\`\`

小于该体积的资源会被转成 base64 内联到 JS/CSS 里，省一次 HTTP 请求；大于的会作为单独文件输出。

| 值 | 行为 |
|----|------|
| \`4096\`（默认）| 4KB 以下内联 |
| \`0\` | 全部作为独立文件（不内联）|
| \`100000\` | 几乎全部内联（适合小项目）|

> 经验：图标库、小 SVG 内联合适；大图别内联，base64 比原文件大 33%。

---

## 四、cssCodeSplit（CSS 拆分）

\`\`\`js
build: {
  cssCodeSplit: true   // 默认 true
}
\`\`\`

- \`true\`：每个 async chunk 的 CSS 单独输出文件，懒加载时才请求
- \`false\`：所有 CSS 合并成一个文件

单页应用保持默认；纯静态官网可设 \`false\` 减少请求数。

---

## 五、sourcemap

\`\`\`js
build: {
  sourcemap: true,       // 生成 .map 文件
  sourcemap: 'inline',   // 内联到产物里（不出 .map 文件）
  sourcemap: 'hidden'    // 生成 .map 但产物不引用（用于错误监控平台）
}
\`\`\`

生产环境推荐 \`'hidden'\`——上传到 Sentry 等平台，又不暴露给用户。

---

## 六、minify（压缩）

\`\`\`js
build: {
  minify: 'esbuild',   // 默认，速度快
  minify: 'terser',    // 压缩率更高，需装 terser
  minify: false        // 不压缩
}
\`\`\`

| 方案 | 速度 | 压缩率 | 备注 |
|------|------|--------|------|
| \`esbuild\` | 极快 | 略低 | 默认 |
| \`terser\` | 慢 | 更高 | 需 \`npm i terser\` |
| \`false\` | — | — | 调试用 |

可用 \`terserOptions\` / \`esbuildOptions\` 进一步配置。

---

## 七、rollupOptions（Rollup 原生配置）

\`build\` 里最强大的字段，所有 Rollup 选项都可用。最常见的是**手动分包**：

\`\`\`js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        // 把 react 系列单独打成 vendor chunk
        vendor: ['react', 'react-dom'],
        // 工具库单独成 chunk
        utils: ['lodash-es', 'dayjs']
      },
      // 自定义文件名
      chunkFileNames: 'js/[name]-[hash].js',
      entryFileNames: 'js/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash].[ext]'
    },
    // 多入口
    input: {
      main: 'index.html',
      admin: 'admin.html'
    }
  }
}
\`\`\`

分包的好处：vendor 几乎不变，浏览器缓存命中率极高。

---

## 八、chunkSizeWarningLimit

\`\`\`js
build: {
  chunkSizeWarningLimit: 500   // 默认 500KB
}
\`\`\`

某个 chunk 超过这个体积，Vite 会警告 "chunk size exceeds limit"。设大一点消除噪音，但更该做的是优化分包。

---

## 九、emptyOutDir

\`\`\`js
build: {
  emptyOutDir: true   // 默认 true（在项目根目录内时）
}
\`\`\`

- \`true\`：构建前清空 \`outDir\`
- \`false\`：保留旧文件（增量发布场景）

如果 \`outDir\` 在项目根目录外，Vite 默认不清空（防止误删），需显式设 \`true\`。

---

## 十、完整配置示例

\`\`\`js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: 'hidden',
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
})
\`\`\`

---

## 下一章

\`build\` 搞定后，下一章看 \`css\` 配置——CSS Modules、预处理器、PostCSS 怎么配。`,
    code: `// 演示：模拟 build 配置并预估产物体积
const buildConfig = {
  target: 'es2020',
  outDir: 'dist',
  assetsDir: 'assets',
  assetsInlineLimit: 4096,
  cssCodeSplit: true,
  sourcemap: 'hidden',
  minify: 'esbuild',
  chunkSizeWarningLimit: 1000,
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        utils: ['lodash-es', 'dayjs']
      }
    }
  }
}

console.log("📦 build 配置概览")
console.log("=====================================")
console.log("目标:", buildConfig.target)
console.log("输出目录:", buildConfig.outDir + "/" + buildConfig.assetsDir + "/")
console.log("资源内联阈值:", buildConfig.assetsInlineLimit + "B")
console.log("CSS 拆分:", buildConfig.cssCodeSplit)
console.log("sourcemap:", buildConfig.sourcemap)
console.log("压缩器:", buildConfig.minify)
console.log("chunk 警告阈值:", buildConfig.chunkSizeWarningLimit + "KB")

console.log("\\n📂 分包策略:")
for (const [chunk, deps] of Object.entries(buildConfig.rollupOptions.output.manualChunks)) {
  console.log("  " + chunk + ".js ← " + deps.join(", "))
}

// 模拟一个产物体积报告
console.log("\\n📊 产物体积预估:")
const output = [
  { file: "dist/index.html", size: 0.46 },
  { file: "dist/assets/vendor-xxxx.js", size: 142.3 },
  { file: "dist/assets/utils-yyyy.js", size: 35.2 },
  { file: "dist/assets/index-zzzz.js", size: 28.5 },
  { file: "dist/assets/index-aaaa.css", size: 12.4 }
]
output.forEach(f => {
  const flag = f.size > buildConfig.chunkSizeWarningLimit ? "⚠️" : "✅"
  console.log("  " + flag + " " + f.file.padEnd(35) + f.size + " KB")
})`
  },

  // =========================================================
  // 第十六章：css 配置详解
  // =========================================================
  {
    id: "vite2-ch16",
    group: "第三部分 配置详解",
    icon: "🎨",
    title: "第十六章 css 配置详解",
    content: `## 第十六章　css 配置详解

\`css\` 选项统一管理 Vite 的 CSS 处理行为：CSS Modules、预处理器（SCSS/Less/Stylus）、PostCSS、sourcemap。

| 字段 | 一句话作用 |
|------|-----------|
| \`modules\` | CSS Modules 行为 |
| \`preprocessorOptions\` | 传给预处理器的选项 |
| \`postcss\` | PostCSS 配置 |
| \`devSourcemap\` | 开发阶段是否生成 sourcemap |
| \`transformer\` | 切换 CSS 转换器（Lightning CSS）|

---

## 一、CSS Modules 用法

**CSS Modules** 把 CSS 类名局部化，避免全局污染。文件名约定为 \`xxx.module.css\`。

\`\`\`css
/* Button.module.css */
.btn { padding: 8px 16px; }
.primary { background: #409eff; color: white; }
\`\`\`

\`\`\`tsx
import styles from './Button.module.css'

function Button() {
  return <button className={\`\${styles.btn} \${styles.primary}\`}>点击</button>
}
\`\`\`

编译后类名变成 \`Button_btn_1a2b3\` 这种 hash 形式，不会和别人冲突。

### modules 配置

\`\`\`js
css: {
  modules: {
    // 类名生成规则
    generateScopedName: '[name]__[local]__[hash:base64:5]',
    // 类名风格：camelCase / camelCaseOnly / dashes / dashesOnly
    localsConvention: 'camelCase',
    // 全局行为：pure（默认）/ local / global
    mode: 'local'
  }
}
\`\`\`

| 选项 | 常用值 | 说明 |
|------|--------|------|
| \`localsConvention\` | \`'camelCase'\` | 同时支持 \`styles.btnPrimary\` 和 \`styles['btn-primary']\` |
| \`localsConvention\` | \`'camelCaseOnly'\` | 只支持驼峰 |
| \`generateScopedName\` | 自定义模板 | 生产环境默认短 hash |

> 配 \`camelCase\` 后，\`.btn-primary\` 可以用 \`styles.btnPrimary\` 访问，写起来舒服。

---

## 二、preprocessorOptions（预处理器）

Vite 内置支持 SCSS/Sass/Less/Stylus，**装好对应包就能用**，无需配置 loader。

\`\`\`bash
npm i -D sass     # SCSS/Sass
npm i -D less     # Less
npm i -D stylus   # Stylus
\`\`\`

### 传给预处理器的选项

\`\`\`js
css: {
  preprocessorOptions: {
    scss: {
      additionalData: \`$primary: #409eff; $radius: 4px;\`,  // 全局注入变量
    },
    less: {
      // 修改 Less 变量
      modifyVars: {
        'primary-color': '#409eff'
      },
      javascriptEnabled: true   // Less 内联 JS（Ant Design 必需）
    },
    stylus: {
      // Stylus 没有 additionalData，用 import 注入
      imports: ['./src/styles/vars.styl']
    }
  }
}
\`\`\`

### SCSS 全局变量示例

\`\`\`scss
/* src/styles/vars.scss */
$primary: #409eff;
$radius: 4px;
\`\`\`

配 \`additionalData\` 后，所有 SCSS 文件都能用 \`$primary\`，无需手动 \`@import\`。

> 注意：\`additionalData\` 是字符串，会自动加在每个 SCSS 文件**最前面**。

---

## 三、postcss（PostCSS 配置）

PostCSS 是 CSS 的 Babel——用插件转换 CSS。最常用的是 \`autoprefixer\`（自动加浏览器前缀）。

### 方式 1：在 vite.config.js 里配

\`\`\`js
css: {
  postcss: {
    plugins: [
      require('autoprefixer'),
      require('cssnano')({ preset: 'default' })  // 压缩
    ]
  }
}
\`\`\`

### 方式 2：单独的 postcss.config.js（推荐）

\`\`\`js
// postcss.config.js
module.exports = {
  plugins: {
    autoprefixer: {},
    'postcss-preset-env': { stage: 2 }
  }
}
\`\`\`

Vite 会自动读取根目录的 \`postcss.config.js\`，无需在 vite.config.js 里重复配置。

> Tailwind CSS、autoprefixer 都是 PostCSS 插件，所以**配 Tailwind 就是配 PostCSS**。

---

## 四、devSourcemap（开发 sourcemap）

\`\`\`js
css: {
  devSourcemap: true   // 开发时生成 CSS sourcemap（默认 false）
}
\`\`\`

开了之后，浏览器 DevTools 里能看到样式来自哪个 SCSS/Less 源文件的具体行，调试体验大幅提升。

---

## 五、transformer（Lightning CSS）

Vite 5.4+ 支持用 **Lightning CSS** 替代 PostCSS，速度更快（Rust 写的）：

\`\`\`js
css: {
  transformer: 'lightningcss',
  lightningcss: {
    targets: { chrome: 110, firefox: 110 }
  }
}
\`\`\`

注意：切到 Lightning CSS 后，部分 PostCSS 插件（如 Tailwind v3）不兼容，需用 Tailwind v4+。

---

## 六、完整配置示例

\`\`\`js
import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]__[hash:base64:5]'
    },
    preprocessorOptions: {
      scss: {
        additionalData: \`$primary: #409eff; $radius: 4px;\`
      },
      less: {
        javascriptEnabled: true
      }
    },
    devSourcemap: true
  }
})
\`\`\`

---

## 下一章

CSS 处理清楚了，下一章看 \`define\` 和环境变量注入——怎么把后端配置、版本号、API 地址塞到前端代码里。`,
    code: `// 演示：模拟 CSS Modules 类名生成
const cssModulesConfig = {
  generateScopedName: '[name]__[local]__[hash:base64:5]',
  localsConvention: 'camelCase',
  mode: 'local'
}

console.log("🎨 css 配置概览")
console.log("=====================================")
console.log("类名模板:", cssModulesConfig.generateScopedName)
console.log("类名风格:", cssModulesConfig.localsConvention)
console.log("模块模式:", cssModulesConfig.mode)

// 模拟类名生成（简化版）
function generateScopedName(template, fileName, localName) {
  const hash = Math.random().toString(36).slice(2, 7)
  return template
    .replace('[name]', fileName)
    .replace('[local]', localName)
    .replace('[hash:base64:5]', hash)
}

console.log("\\n🏷️  类名生成示例:")
const samples = [
  { file: 'Button', local: 'btn-primary' },
  { file: 'Card', local: 'title' },
  { file: 'Form', local: 'input' }
]
samples.forEach(({ file, local }) => {
  const scoped = generateScopedName(cssModulesConfig.generateScopedName, file, local)
  console.log("  ." + local.padEnd(15) + " → ." + scoped)

  // 模拟 camelCase 转换
  if (cssModulesConfig.localsConvention === 'camelCase') {
    const camel = local.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    console.log("    JS 访问: styles." + camel)
  }
})

console.log("\\n💡 camelCase 让 .btn-primary 可以用 styles.btnPrimary 访问")`
  },

  // =========================================================
  // 第十七章：define 与环境变量注入
  // =========================================================
  {
    id: "vite2-ch17",
    group: "第三部分 配置详解",
    icon: "🔧",
    title: "第十七章 define 与环境变量注入",
    content: `## 第十七章　define 与环境变量注入

前端代码跑在浏览器，但很多信息（API 地址、版本号、构建时间）在构建时才知道。Vite 提供两套机制把它们塞进前端代码：\`define\`（手动定义）和 \`import.meta.env\`（环境变量文件）。

---

## 一、define：全局常量替换

\`define\` 在**构建时**做文本替换——把代码里的某个标识符替换成指定值。

\`\`\`js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('1.2.3'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __DEV__: process.env.NODE_ENV === 'development'
  }
})
\`\`\`

业务代码里直接用：

\`\`\`js
console.log('版本:', __APP_VERSION__)        // 输出 1.2.3
console.log('构建时间:', __BUILD_TIME__)
if (__DEV__) {
  console.log('开发环境')
}
\`\`\`

**关键点**：字符串值必须用 \`JSON.stringify()\` 包一层，否则替换后会变成裸标识符（\`1.2.3\` 是合法的，但 \`hello\` 会被当成变量名）。

### TypeScript 支持

\`vite-env.d.ts\` 里声明类型：

\`\`\`ts
declare const __APP_VERSION__: string
declare const __BUILD_TIME__: string
declare const __DEV__: boolean
\`\`\`

---

## 二、import.meta.env：环境变量对象

Vite 把环境变量挂到 \`import.meta.env\` 上，业务代码直接读取：

\`\`\`js
console.log(import.meta.env.MODE)        // 'development' / 'production'
console.log(import.meta.env.BASE_URL)    // '/' 部署基础路径
console.log(import.meta.env.PROD)        // boolean
console.log(import.meta.env.DEV)         // boolean
console.log(import.meta.env.SSR)         // boolean
\`\`\`

### 内置变量

| 变量 | 值 | 说明 |
|------|----|------|
| \`MODE\` | \`'development'\` / \`'production'\` / 自定义 | 当前模式 |
| \`BASE_URL\` | 默认 \`'/'\` | 部署基础路径（\`base\` 配置）|
| \`PROD\` | boolean | 是否生产环境 |
| \`DEV\` | boolean | 是否开发环境 |
| \`SSR\` | boolean | 是否 SSR 构建 |

---

## 三、VITE_ 前缀：自定义环境变量

只有以 \`VITE_\` 开头的变量才会暴露给前端。在项目根目录创建 \`.env\` 文件：

\`\`\`bash
# .env
VITE_APP_TITLE=我的应用
VITE_API_BASE=/api

# .env.development（开发环境）
VITE_API_BASE=http://localhost:8080/api

# .env.production（生产环境）
VITE_API_BASE=https://api.example.com
\`\`\`

业务代码读取：

\`\`\`js
fetch(import.meta.env.VITE_API_BASE + '/users')
document.title = import.meta.env.VITE_APP_TITLE
\`\`\`

### .env 文件加载规则

| 文件 | 加载时机 |
|------|----------|
| \`.env\` | 所有模式都加载 |
| \`.env.local\` | 所有模式，被 git 忽略 |
| \`.env.[mode]\` | 指定模式（如 \`.env.staging\`）|
| \`.env.[mode].local\` | 指定模式，被 git 忽略 |

优先级：\`*.local\` > \`*.[mode]\` > \`*\`。

### 配合 mode 使用

\`\`\`bash
# 用 staging 模式构建
vite build --mode staging
\`\`\`

Vite 会依次加载：\`.env\` → \`.env.staging\` → \`.env.local\` → \`.env.staging.local\`。

---

## 四、envPrefix：自定义前缀

如果不想用 \`VITE_\` 前缀，可以改：

\`\`\`js
// vite.config.js
export default defineConfig({
  envPrefix: ['VITE_', 'APP_']   // 字符串或数组
})
\`\`\`

\`\`\`bash
# .env
APP_API_BASE=https://api.example.com
\`\`\`

\`\`\`js
import.meta.env.APP_API_BASE
\`\`\`

> 注意：改前缀是全项目行为，建议保留 \`VITE_\` 兼容生态。

---

## 五、HTML 环境变量替换

Vite 还能在 \`index.html\` 里用环境变量。HTML 里用 \`%\` 包裹：

\`\`\`html
<!DOCTYPE html>
<html>
  <head>
    <title>%VITE_APP_TITLE%</title>
  </head>
  <body>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
\`\`\`

构建时 \`%VITE_APP_TITLE%\` 会被替换成对应值。

### 条件 HTML

配合插件 \`vite-plugin-html\` 可实现更复杂的 HTML 处理（如注入脚本、按环境切换 meta）。

---

## 六、define vs import.meta.env 对比

| 维度 | \`define\` | \`import.meta.env\` |
|------|-----------|---------------------|
| 来源 | vite.config.js | \`.env\` 文件 |
| 替换方式 | 全文本替换 | 对象属性访问 |
| 适合 | 构建时计算的值（版本号、时间）| 可配置的环境差异（API 地址）|
| 类型 | 需手动声明 | \`vite-env.d.ts\` 已声明 |

**经验**：能用 \`.env\` 就用 \`.env\`，更灵活；只有 \`define\` 能做的事（比如根据 \`process.env\` 动态计算）才用 \`define\`。

---

## 七、安全提醒

\`\`\`js
// ❌ 危险：私钥会被打进前端！
// .env
API_SECRET=sk-xxxxxx       // 没有 VITE_ 前缀

// vite.config.js
define: {
  SECRET: JSON.stringify(process.env.API_SECRET)
}
\`\`\`

**记住**：所有进入前端的变量，用户都能在浏览器看到。后端密钥绝对不能塞 \`define\` 或 \`VITE_\` 变量。

---

## 下一章

变量注入搞定后，下一章看 \`worker\` 配置——Web Worker、Shared Worker 怎么在 Vite 里用。`,
    code: `// 演示：模拟 define 与 import.meta.env 的行为
const defineConfig = {
  __APP_VERSION__: JSON.stringify('1.2.3'),
  __BUILD_TIME__: JSON.stringify('2026-07-19T10:00:00Z'),
  __DEV__: false
}

// 模拟 import.meta.env
const importMetaEnv = {
  MODE: 'production',
  BASE_URL: '/',
  PROD: true,
  DEV: false,
  SSR: false,
  VITE_APP_TITLE: '我的应用',
  VITE_API_BASE: 'https://api.example.com'
}

console.log("🔧 define 全局常量")
console.log("=====================================")
console.log("__APP_VERSION__:", defineConfig.__APP_VERSION__)
console.log("__BUILD_TIME__:", defineConfig.__BUILD_TIME__)
console.log("__DEV__:", defineConfig.__DEV__)

console.log("\\n🌐 import.meta.env")
console.log("=====================================")
console.log("MODE:", importMetaEnv.MODE)
console.log("BASE_URL:", importMetaEnv.BASE_URL)
console.log("PROD / DEV:", importMetaEnv.PROD, "/", importMetaEnv.DEV)
console.log("VITE_APP_TITLE:", importMetaEnv.VITE_APP_TITLE)
console.log("VITE_API_BASE:", importMetaEnv.VITE_API_BASE)

// 模拟 .env 文件加载优先级
console.log("\\n📁 .env 文件加载优先级（高 → 低）:")
const envFiles = [
  '.env.staging.local  (最高，git 忽略)',
  '.env.staging        (模式专属)',
  '.env.local          (git 忽略)',
  '.env                (基础，最低)'
]
envFiles.forEach((f, i) => console.log("  " + (i + 1) + ". " + f))

console.log("\\n💡 字符串值用 JSON.stringify() 包一层")`
  },

  // =========================================================
  // 第十八章：worker 配置
  // =========================================================
  {
    id: "vite2-ch18",
    group: "第三部分 配置详解",
    icon: "👷",
    title: "第十八章 worker 配置",
    content: `## 第十八章　worker 配置

Web Worker 让 JS 跑在后台线程，不阻塞 UI。Vite 对 Worker 有一流支持——直接 \`new Worker()\` 就能创建，构建时自动处理打包、压缩、文件命名。

| 字段 | 一句话作用 |
|------|-----------|
| \`worker.format\` | Worker 输出格式（iife / es）|
| \`worker.plugins\` | Worker 内部用的 Vite 插件 |
| \`worker.rollupOptions\` | Rollup 原生配置 |

---

## 一、new Worker() 基本用法

\`\`\`js
// src/workers/heavy.js
self.onmessage = (e) => {
  const result = doHeavyCalc(e.data)
  self.postMessage(result)
}

function doHeavyCalc(n) {
  let sum = 0
  for (let i = 0; i < n; i++) sum += Math.sqrt(i)
  return sum
}
\`\`\`

主线程使用：

\`\`\`js
// src/main.js
const worker = new Worker(new URL('./workers/heavy.js', import.meta.url), {
  type: 'module'   // 关键：用 ESM 模式
})

worker.onmessage = (e) => {
  console.log('结果:', e.data)
}

worker.postMessage(10000000)   // 把大任务交给 worker
\`\`\`

**关键点**：\`new URL('./workers/heavy.js', import.meta.url)\` 是 Vite 识别 Worker 的标准写法，构建时会自动处理。

---

## 二、worker.format（输出格式）

\`\`\`js
// vite.config.js
export default defineConfig({
  worker: {
    format: 'es'   // 默认 'iife'
  }
})
\`\`\`

| 格式 | 适用 | 说明 |
|------|------|------|
| \`'iife'\` | 默认 | 立即执行函数，兼容老浏览器 |
| \`'es'\` | 现代 | ESM 格式，支持 \`import\`，需浏览器支持 |

如果 Worker 内部要 \`import\` 其他模块，必须用 \`'es'\`。

---

## 三、worker.plugins（Worker 专用插件）

主线程的插件不会自动应用到 Worker，需在 \`worker.plugins\` 里单独配置。

\`\`\`js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  worker: {
    format: 'es',
    plugins: [react()]   // Worker 里要用 JSX 就配这里
  }
})
\`\`\`

典型场景：Worker 里写 React（OffscreenCanvas + React）、用 Babel 转换。

---

## 四、Shared Worker

\`SharedWorker\` 可被多个浏览器 tab 共享，适合做全局消息总线、长连接复用。

\`\`\`js
// src/workers/shared.js
const connections = []

self.onconnect = (e) => {
  const port = e.ports[0]
  connections.push(port)
  port.onmessage = (ev) => {
    // 广播给所有连接
    connections.forEach(p => p.postMessage(ev.data))
  }
  port.start()
}
\`\`\`

主线程：

\`\`\`js
const worker = new SharedWorker(
  new URL('./workers/shared.js', import.meta.url),
  { type: 'module' }
)

worker.port.onmessage = (e) => console.log('收到:', e.data)
worker.port.postMessage('hello from tab')
\`\`\`

---

## 五、worker 文件命名

构建时 Worker 文件默认输出到 \`assets/worker-[hash].js\`。可通过 \`rollupOptions\` 自定义：

\`\`\`js
worker: {
  rollupOptions: {
    output: {
      entryFileNames: 'workers/[name]-[hash].js',
      chunkFileNames: 'workers/[name]-[hash].js'
    }
  }
}
\`\`\`

---

## 六、完整配置示例

\`\`\`js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  worker: {
    format: 'es',
    plugins: [react()],
    rollupOptions: {
      output: {
        entryFileNames: 'workers/[name]-[hash].js'
      }
    }
  }
})
\`\`\`

---

## 七、调试技巧

1. **Chrome DevTools** → Sources → Threads 可看到所有 Worker 线程
2. Worker 里 \`console.log\` 会输出到主控制台，但堆栈是 Worker 自己的
3. 用 \`devtools: 'inline'\` 选项让 Worker 支持断点（实验特性）

---

## 八、什么时候该用 Worker

| 场景 | 用 Worker？ |
|------|------------|
| 大数据计算（加密、图像处理）| ✅ 必用 |
| 复杂 JSON 解析（10MB+）| ✅ 推荐 |
| 后台轮询/WebSocket 长连接 | ✅ SharedWorker 合适 |
| 普通业务逻辑 | ❌ 别用，开销不值 |
| 操作 DOM | ❌ Worker 不能访问 DOM |

> 经验：超过 100ms 的同步计算就该考虑 Worker。

---

## 下一章

Worker 配置清楚后，下一章看 CSS/SCSS/Less 的具体处理流程——从 \`import\` 到产物。`,
    code: `// 演示：模拟 Worker 通信流程（在主线程模拟）
console.log("👷 Worker 通信流程演示")
console.log("=====================================")

// 模拟一个 Worker 的内部逻辑
function createFakeWorker(workerCode) {
  const messageQueue = []
  let onmessageHandler = null

  return {
    postMessage(data) {
      console.log("主线程 → Worker: " + JSON.stringify(data))
      // 模拟 Worker 内部处理
      const result = workerCode(data)
      setTimeout(() => {
        console.log("Worker → 主线程: " + JSON.stringify(result))
        if (onmessageHandler) onmessageHandler({ data: result })
      }, 100)
    },
    set onmessage(fn) { onmessageHandler = fn },
    terminate() { console.log("Worker 已终止") }
  }
}

// 创建一个"重计算" Worker
const worker = createFakeWorker((n) => {
  let sum = 0
  for (let i = 0; i < n; i++) sum += Math.sqrt(i)
  return { input: n, result: sum.toFixed(2) }
})

// 主线程接收消息
worker.onmessage = (e) => {
  console.log("✅ 收到结果，input=" + e.data.input + ", result=" + e.data.result)
  worker.terminate()
}

console.log("\\n主线程发起计算任务（不阻塞 UI）:")
worker.postMessage(100000)

console.log("\\n💡 Worker 适合：大计算、长连接、不能阻塞 UI 的场景")
console.log("💡 Vite 用 new URL('./x.js', import.meta.url) 识别 Worker")`
  },

  // =========================================================
  // 第十九章：CSS/SCSS/Less 处理
  // =========================================================
  {
    id: "vite2-ch19",
    group: "第四部分 静态资源",
    icon: "💅",
    title: "第十九章 CSS/SCSS/Less 处理",
    content: `## 第十九章　CSS/SCSS/Less 处理

本章是「第四部分 静态资源」的第一章，专门讲 CSS 系列文件的处理流程。从最基础的 \`import './x.css'\` 到 Sass/Less/Stylus 集成，再到 PostCSS、autoprefixer、Tailwind，一次讲完。

---

## 一、CSS import 基础

Vite 让 JS 直接 \`import\` CSS，构建时自动处理。

\`\`\`js
// src/main.js
import './index.css'              // 全局样式，副作用导入
import styles from './App.module.css'  // CSS Modules
\`\`\`

- **开发时**：CSS 被注入到 \`<style>\` 标签，HMR 即时生效
- **构建时**：CSS 被提取成单独文件，\`<link>\` 引入

### JS 中读取 CSS 内容

\`\`\`js
import cssText from './style.css?inline'   // 加 ?inline 查询参数
console.log(cssText)   // 拿到 CSS 字符串
\`\`\`

\`?inline\` 适用于需要操作 CSS 字符串的场景（如 Shadow DOM 注入）。

---

## 二、@import 处理

CSS 内部的 \`@import\` 会被 Vite 处理：

\`\`\`css
/* src/index.css */
@import './reset.css';
@import './variables.css';

body { font-size: 14px; }
\`\`\`

构建时 \`@import\` 会被合并到主 CSS 里（不再发出额外请求）。

### 注意 Sass 的 @import

\`\`\`scss
/* SCSS 的 @import 是编译时合并 */
@import 'variables';
@import 'mixins';
\`\`\`

Sass 团队推荐用 \`@use\` 替代 \`@import\`（作用域更清晰）：

\`\`\`scss
@use 'variables' as *;   // 引入并展开
@use 'mixins' as m;      // 引入并起别名
\`\`\`

---

## 三、Sass/SCSS 集成

### 安装

\`\`\`bash
npm i -D sass        # 现代 API（Dart Sass）
npm i -D sass-embedded   # 更快的嵌入式版本（推荐）
\`\`\`

### 使用

\`\`\`scss
/* src/styles/vars.scss */
$primary: #409eff;
$radius: 4px;

@mixin button($bg) {
  padding: 8px 16px;
  background: $bg;
  border-radius: $radius;
}
\`\`\`

\`\`\`scss
/* src/App.scss */
@use './styles/vars' as *;

.btn { @include button($primary); }
\`\`\`

\`\`\`tsx
import './App.scss'
\`\`\`

### 全局变量注入

避免每个文件都 \`@use\`，用 \`additionalData\` 自动注入：

\`\`\`js
// vite.config.js
css: {
  preprocessorOptions: {
    scss: {
      additionalData: \`@use '@/styles/vars' as *;\`
    }
  }
}
\`\`\`

之后所有 SCSS 文件都能直接用 \`$primary\`。

---

## 四、Less 集成

\`\`\`bash
npm i -D less
\`\`\`

\`\`\`less
/* src/styles/theme.less */
@primary: #409eff;
@radius: 4px;

.button(@bg) {
  padding: 8px 16px;
  background: @bg;
  border-radius: @radius;
}
\`\`\`

\`\`\`less
/* src/App.less */
@import './styles/theme';

.btn { .button(@primary); }
\`\`\`

### 修改 Less 变量（Ant Design 必备）

\`\`\`js
css: {
  preprocessorOptions: {
    less: {
      modifyVars: { 'primary-color': '#409eff' },
      javascriptEnabled: true   // Ant Design Less 文件需要
    }
  }
}
\`\`\`

---

## 五、Stylus 集成

\`\`\`bash
npm i -D stylus
\`\`\`

\`\`\`stylus
/* src/styles/theme.styl */
primary = #409eff
radius = 4px

button(bg)
  padding 8px 16px
  background bg
  border-radius radius
\`\`\`

\`\`\`stylus
/* src/App.styl */
@import './styles/theme'

.btn
  button(primary)
\`\`\`

\`\`\`js
css: {
  preprocessorOptions: {
    stylus: {
      imports: ['./src/styles/theme.styl']
    }
  }
}
\`\`\`

---

## 六、PostCSS

PostCSS 用插件转换 CSS，是 Vite CSS 处理的底层。Vite 自动读取根目录的 \`postcss.config.js\`。

\`\`\`js
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),                    // 自动加前缀
    require('postcss-preset-env')({ stage: 2 }) // 未来 CSS 语法
  ]
}
\`\`\`

> \`postcss-preset-env\` 已经包含 \`autoprefixer\`，二选一即可。

---

## 七、autoprefixer

自动给 CSS 加浏览器前缀，无需手写 \`-webkit-\`、\`-moz-\`：

\`\`\`css
/* 你写的 */
.btn {
  user-select: none;
  backdrop-filter: blur(10px);
}

/* 编译后 */
.btn {
  -webkit-user-select: none;
  user-select: none;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}
\`\`\`

### 配置目标浏览器

\`\`\`json
// package.json
{
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead"
  ]
}
\`\`\`

或 \`.browserslistrc\` 文件。autoprefixer 根据这个决定加哪些前缀。

---

## 八、Tailwind CSS 集成基础

Tailwind 是原子化 CSS 框架，本身是 PostCSS 插件。

### Tailwind v3（经典）

\`\`\`bash
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
\`\`\`

\`\`\`js
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: []
}
\`\`\`

\`\`\`css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
\`\`\`

\`\`\`js
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
\`\`\`

业务代码：

\`\`\`tsx
<button className="px-4 py-2 bg-blue-500 text-white rounded">
  按钮
</button>
\`\`\`

### Tailwind v4（新一代）

v4 用 \`@tailwindcss/vite\` 插件，不再走 PostCSS：

\`\`\`bash
npm i -D tailwindcss @tailwindcss/vite
\`\`\`

\`\`\`js
// vite.config.js
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [tailwindcss()]
})
\`\`\`

\`\`\`css
/* src/index.css */
@import "tailwindcss";
\`\`\`

v4 性能更好（Rust 写的），推荐新项目用。

---

## 九、CSS 处理流程总结

\`\`\`
源文件 (.css/.scss/.less/.styl)
   ↓ 预处理器编译（Sass/Less/Stylus）
   ↓ PostCSS（autoprefixer 等）
   ↓ CSS Modules 转换（如果是 .module.css）
   ↓ 合并 @import
   ↓ 开发：注入 <style>；构建：提取成 .css 文件
最终产物
\`\`\`

---

## 下一章

CSS 系列处理完了，下一章看其他静态资源——图片、字体、SVG、JSON 怎么在 Vite 里用。`,
    code: `// 演示：模拟 Vite 的 CSS 处理流程
console.log("💅 Vite CSS 处理流程")
console.log("=====================================")

// 模拟一个 SCSS 源文件
const scssSource = \`
@use './vars' as *;
.btn {
  @include button($primary);
  &:hover { opacity: 0.8; }
}
\`

// 模拟处理流水线
const pipeline = [
  {
    name: "Sass 编译",
    input: scssSource,
    output: ".btn { padding: 8px 16px; background: #409eff; border-radius: 4px; }\\n.btn:hover { opacity: 0.8; }"
  },
  {
    name: "PostCSS (autoprefixer)",
    input: ".btn { user-select: none; }",
    output: ".btn { -webkit-user-select: none; user-select: none; }"
  },
  {
    name: "CSS Modules",
    input: ".btn { color: red; }",
    output: ".Button_btn_1a2b3 { color: red; }"
  },
  {
    name: "压缩 (cssnano)",
    input: ".btn { color: red; }",
    output: ".btn{color:red}"
  }
]

pipeline.forEach((stage, i) => {
  console.log("\\n[" + (i + 1) + "] " + stage.name)
  console.log("  输入: " + stage.input.trim().replace(/\\n/g, " ").slice(0, 60))
  console.log("  输出: " + stage.output.trim().slice(0, 60))
})

console.log("\\n=====================================")
console.log("📦 最终产物（生产环境）:")
console.log("  dist/assets/index-a1b2c3d4.css")
console.log("  ↳ 所有 CSS 合并、压缩、加 hash")
console.log("\\n💡 开发时 CSS 注入 <style>，构建时提取成文件")`
  },
];
