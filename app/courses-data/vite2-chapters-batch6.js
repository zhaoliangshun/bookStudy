// =============================================================
// Vite 大全集（终极版）—— 第6批章节
// 第七部分 构建优化 + 第八部分 插件系统（共 7 章）
// -------------------------------------------------------------
// 本批包含 7 章：
//   vite2-ch34 : 第三十四章 chunk 命名与 hash
//   vite2-ch35 : 第三十五章 Rollup 配置进阶
//   vite2-ch36 : 第三十六章 资源内联与 assetsInlineLimit
//   vite2-ch37 : 第三十七章 manifest 与 PWA
//   vite2-ch38 : 第三十八章 插件机制与钩子
//   vite2-ch39 : 第三十九章 enforce 与 apply
//   vite2-ch40 : 第四十章 虚拟模块 virtual modules
// =============================================================

export const chapters = [
  // =========================================================
  // 第三十四章：chunk 命名与 hash
  // =========================================================
  {
    id: "vite2-ch34",
    group: "第七部分 构建优化",
    icon: "🏷️",
    title: "第三十四章 chunk 命名与 hash",
    content: `## 概述

构建产物长什么样、文件名怎么定、hash 怎么算，这些直接影响**缓存策略**和**线上稳定性**。本章讲透 \`build.rollupOptions.output\` 里和命名相关的所有配置。

---

## 默认产物结构

\`vite build\` 后的产物大致如下：

\`\`\`
dist/
├── index.html
├── assets/
│   ├── index-a1b2c3d4.js        # 入口 JS
│   ├── index-b5c6d7e8.css       # 入口 CSS
│   ├── vendor-f9a0b1c2.js       # 分包 chunk
│   ├── about-d3e4f5a6.js        # 懒加载 chunk
│   └── logo-g7h8i9j0.png        # 静态资源
\`\`\`

文件名里的 \`a1b2c3d4\` 就是 **hash 指纹**。它的作用是：文件内容变了 → hash 变 → 浏览器重新下载；内容没变 → hash 不变 → 走缓存。这是前端缓存优化的基石。

---

## 三大命名配置

在 \`vite.config.js\` 里通过 \`build.rollupOptions.output\` 控制：

\`\`\`js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 1. 入口文件命名
        entryFileNames: 'assets/[name].[hash].js',
        // 2. 分包 chunk 命名
        chunkFileNames: 'assets/[name].[hash].js',
        // 3. 静态资源命名（图片、字体等）
        assetFileNames: 'assets/[name].[hash].[ext]',
      }
    }
  }
})
\`\`\`

| 配置项 | 控制对象 | 默认值 |
|--------|----------|--------|
| \`entryFileNames\` | 入口 JS（\`main.js\` 编译后的产物）| \`'[name]-[hash].js'\` |
| \`chunkFileNames\` | 分包/懒加载 chunk | \`'[name]-[hash].js'\` |
| \`assetFileNames\` | 静态资源（图片、字体、CSS 等）| \`'[name].[hash].[ext]'\` |

---

## 占位符详解

命名字符串里的 \`[xxx]\` 是 Rollup 提供的占位符：

| 占位符 | 含义 | 示例 |
|--------|------|------|
| \`[name]\` | 文件名（不含扩展名）| \`main\` |
| \`[hash]\` | 基于整个产物内容的 hash | \`a1b2c3d4\` |
| \`[hash:8]\` | 限制 hash 长度为 8 位 | \`a1b2c3d4\` |
| \`[ext]\` | 扩展名（仅资源用）| \`png\` |
| \`[extname]\` | 含点的扩展名 | \`.png\` |

### \`[hash]\` vs \`[contenthash]\`

- \`[hash]\`：Rollup 内置占位符，基于整个构建产物算出
- \`[contenthash]\`：Webpack 风格的写法，Vite 不直接支持，但可用插件实现

实际项目中 \`[hash]\` 就够用了，**只要内容变 hash 就变**。

### hash 长度

默认 hash 是 8 位（Vite 5+）。可以更短省字节，也可以更长防碰撞：

\`\`\`js
output: {
  entryFileNames: 'assets/[name].[hash:6].js',  // 6 位
  chunkFileNames: 'assets/[name].[hash:10].js', // 10 位
}
\`\`\`

> 8 位十六进制 = 4 字节 = 42 亿种组合，对绝大多数项目足够。

---

## 去掉 hash（不推荐）

调试时想去掉 hash 看真实文件名：

\`\`\`js
output: {
  entryFileNames: 'assets/[name].js',
  chunkFileNames: 'assets/[name].js',
  assetFileNames: 'assets/[name].[ext]',
}
\`\`\`

**生产环境不要这样**：没有 hash 浏览器无法判断文件是否更新，只能禁用缓存或加版本号查询参数。

---

## 分目录输出

按文件类型分目录，便于 CDN 配置缓存策略：

\`\`\`js
output: {
  entryFileNames: 'js/[name].[hash].js',
  chunkFileNames: 'js/chunks/[name].[hash].js',
  assetFileNames: (assetInfo) => {
    if (assetInfo.name.endsWith('.css')) {
      return 'css/[name].[hash].[ext]'
    }
    if (/\\.(png|jpe?g|svg|gif|webp)$/.test(assetInfo.name)) {
      return 'images/[name].[hash].[ext]'
    }
    if (/\\.(woff2?|ttf|eot)$/.test(assetInfo.name)) {
      return 'fonts/[name].[hash].[ext]'
    }
    return 'assets/[name].[hash].[ext]'
  }
}
\`\`\`

产物结构：

\`\`\`
dist/
├── js/index.a1b2c3d4.js
├── js/chunks/vendor.b5c6d7e8.js
├── css/index.f9a0b1c2.css
├── images/logo.g7h8i9j0.png
└── fonts/icon.h1k2l3m4.woff2
\`\`\`

---

## named hashing（命名 hash）

Rollup 默认使用基于内容的 hash。如果你想用"基于模块名"的 hash（开发体验更好），可以这样：

\`\`\`js
output: {
  hashCharacters: 'base36',  // 默认 base64，可选 'base36' | 'base64' | 'base64url'
  // 也可以用 named hashes（需要插件配合）
}
\`\`\`

> 实际项目中保持默认即可，**hash 算法是 Rollup 内部决定的，不需要你操心**。

---

## 实战：稳定 vendor chunk 命名

配合 \`manualChunks\` 分包，让 vendor 文件名稳定：

\`\`\`js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom'],
        'vendor-utils': ['lodash-es', 'dayjs'],
      },
      chunkFileNames: 'assets/[name].[hash].js',
    }
  }
}
\`\`\`

产物里会出现 \`vendor-react.xxxx.js\`、\`vendor-utils.xxxx.js\`，名字清晰，hash 仅在依赖升级时变化。

---

## 下一章

命名和 hash 搞定了，下一章深入 **Rollup 配置进阶**，看看 \`input\`、\`external\`、\`treeshake\` 这些核心选项怎么用。`,
    code: `// 演示：chunk 命名规则与 hash 计算
// 模拟 Rollup 输出文件名的生成过程

const crypto = require('crypto');

// 模拟三个产物文件的内容
const files = {
  'main': '入口代码：import React from "react"; ...',
  'vendor-react': 'React+ReactDOM 编译后的代码',
  'about': '懒加载的 about 页面代码',
  'logo.png': Buffer.from('假装是图片二进制'),
};

// 计算 hash（模拟 Rollup 的 [hash] 占位符）
function computeHash(content, length = 8) {
  return crypto.createHash('sha256')
    .update(typeof content === 'string' ? content : content)
    .digest('hex')
    .slice(0, length);
}

// 应用命名模板
const nameTemplates = {
  entry: 'assets/[name].[hash].js',
  chunk: 'assets/[name].[hash].js',
  asset: 'assets/[name].[hash].[ext]',
};

console.log('📦 构建产物文件名：');
console.log('=====================================');

// 入口
console.log('entryFileNames:', nameTemplates.entry
  .replace('[name]', 'main')
  .replace('[hash]', computeHash(files['main'])));

// chunk
console.log('chunkFileNames:', nameTemplates.chunk
  .replace('[name]', 'vendor-react')
  .replace('[hash]', computeHash(files['vendor-react'])));

// 资源
const assetName = 'logo';
const assetExt = 'png';
console.log('assetFileNames:', nameTemplates.asset
  .replace('[name]', assetName)
  .replace('[hash]', computeHash(files['logo.png']))
  .replace('[ext]', assetExt));

console.log('\\n💡 内容不变 → hash 不变 → 浏览器走缓存');
console.log('💡 内容变化 → hash 变化 → 浏览器重新下载');`,
  },

  // =========================================================
  // 第三十五章：Rollup 配置进阶
  // =========================================================
  {
    id: "vite2-ch35",
    group: "第七部分 构建优化",
    icon: "🎛️",
    title: "第三十五章 Rollup 配置进阶",
    content: `## 概述

Vite 生产构建走的是 **Rollup**。理解 Rollup 的核心选项，才能做**多入口打包**、**外部依赖**、**精细 treeshake** 等高级场景。

---

## Vite 与 Rollup 的关系

\`\`\`
vite build
   │
   ├── 1. 解析 vite.config.js
   ├── 2. 调用所有插件的 configResolved
   ├── 3. 把 build.rollupOptions 合并到内部 Rollup 配置
   ├── 4. 在 Rollup 钩子里塞入 Vite 自己的插件（处理 CSS、资源、HMR 客户端等）
   ├── 5. 调用 Rollup 进行打包
   └── 6. 用 esbuild 压缩输出
\`\`\`

**关键**：\`build.rollupOptions\` 里的所有字段都和原生 Rollup 一致，可以直接查 Rollup 官方文档。

---

## build.rollupOptions 全景

\`\`\`js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      // 1. 入口配置
      input: 'src/main.ts',                // 单入口
      // input: { main: 'src/main.ts', admin: 'src/admin.ts' },  // 多入口

      // 2. 外部依赖（不打包进去）
      external: ['react', 'react-dom'],

      // 3. 输出配置
      output: {
        format: 'es',                       // esm / cjs / umd / iife
        dir: 'dist',                        // 输出目录
        entryFileNames: '[name].[hash].js',
        chunkFileNames: '[name].[hash].js',
        assetFileNames: '[name].[hash].[ext]',
        // 分包
        manualChunks: {
          vendor: ['react', 'react-dom']
        },
        // 是否保留导出签名
        preserveEntrySignatures: 'strict',  // strict | allow-extension | false
      },

      // 4. treeshake 配置
      treeshake: {
        moduleSideEffects: false,           // 假设模块无副作用
        propertyReadSideEffects: false,     // 假设读属性无副作用
      },

      // 5. 钩子（很少直接用，插件里更常用）
      plugins: [],
    }
  }
})
\`\`\`

---

## input：单入口与多入口

### 单入口（默认）

\`\`\`js
input: 'src/main.ts'
\`\`\`

产物：\`dist/assets/main.[hash].js\`

### 多入口

适合多页应用（MPA）或同时打包多个独立入口：

\`\`\`js
input: {
  main: 'src/main.ts',
  admin: 'src/admin.ts',
  mobile: 'src/mobile.ts',
}
\`\`\`

产物：

\`\`\`
dist/assets/main.[hash].js
dist/assets/admin.[hash].js
dist/assets/mobile.[hash].js
\`\`\`

**配合 \`index.html\`**：Vite 支持多个 \`index.html\` 入口，放在根目录或子目录即可。

---

## output.format：模块格式

| 格式 | 说明 | 使用场景 |
|------|------|----------|
| \`'es'\` | ESM（默认）| 现代浏览器、Node 12+ |
| \`'cjs'\` | CommonJS | Node 旧环境、库的 CommonJS 版本 |
| \`'umd'\` | 通用模块 | 同时支持 AMD/CMD/global |
| \`'iife'\` | 立即执行函数 | 直接 \`<script>\` 引入 |
| \`'system'\` | SystemJS | 老旧的 SystemJS 环境 |

构建 npm 库时常用：

\`\`\`js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'MyLib',
      formats: ['es', 'cjs', 'umd'],  // 同时输出三种格式
    },
    rollupOptions: {
      external: ['react'],  // React 不打包
    }
  }
})
\`\`\`

---

## external：外部依赖

声明某些依赖**不打包进产物**，运行时再从外部加载：

\`\`\`js
external: ['react', 'react-dom', 'lodash']
\`\`\`

适用场景：

1. **库开发**：把 peerDependencies（如 react）声明为 external
2. **CDN 加载**：大依赖走 CDN，减小产物体积
3. **多包共享**：monorepo 里多个包共享同一份依赖

配合 CDN：

\`\`\`html
<!-- index.html 里 -->
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>
\`\`\`

\`\`\`js
// vite.config.js
external: ['react', 'react-dom']
output: {
  globals: {
    react: 'React',           // 告诉 Rollup react 对应全局的 React
    'react-dom': 'ReactDOM',
  }
}
\`\`\`

---

## treeshake：摇树优化

删除未使用的代码。Rollup 的 treeshake 是业界最强之一。

\`\`\`js
treeshake: {
  // 模块是否有副作用
  // false = 假设无副作用，未使用的导出会被删
  // true  = 假设有副作用，未使用的导出保留
  moduleSideEffects: false,

  // 读取属性是否有副作用
  propertyReadSideEffects: false,

  // try-catch 是否有副作用
  tryCatchDeoptimization: false,
}
\`\`\`

**配合 \`package.json\` 的 \`sideEffects\` 字段**：

\`\`\`json
{
  "sideEffects": false        // 整个包无副作用
}
\`\`\`

或精确指定：

\`\`\`json
{
  "sideEffects": ["*.css", "./src/polyfill.js"]
}
\`\`\`

---

## preserveEntrySignatures：保留入口签名

控制入口文件的 \`export\` 是否原样保留：

| 值 | 行为 |
|----|------|
| \`'strict'\` | 严格保留所有导出（默认） |
| \`'allow-extension'\` | 允许添加额外导出 |
| \`false\` | 不保留，可以合并、改名 |

库开发时设为 \`'strict'\` 保证 API 稳定；应用开发可以设为 \`false\` 让 Rollup 更激进地优化。

---

## output.dir 与 output.file

- \`output.dir\`：输出目录（多文件用）
- \`output.file\`：单个输出文件（覆盖 \`dir\`）

Vite 默认用 \`output.dir = 'dist'\`。一般不用改。

---

## 实战：库的多格式输出

\`\`\`js
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyLib',
      fileName: (format) => \`my-lib.\${format}.js\`,
      formats: ['es', 'cjs', 'umd'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        preserveEntrySignatures: 'strict',
      }
    }
  }
})
\`\`\`

产物：

\`\`\`
dist/my-lib.es.js
dist/my-lib.cjs.js
dist/my-lib.umd.js
\`\`\`

---

## 下一章

Rollup 配置搞定了，下一章看 **资源内联与 assetsInlineLimit**——小图片该不该内联成 base64。`,
    code: `// 演示：Rollup 配置解析与多入口产物模拟
console.log('🎛️ Rollup 配置进阶演示');
console.log('=====================================');

// 模拟一个 vite.config.js 的 build.rollupOptions
const rollupOptions = {
  input: {
    main: 'src/main.ts',
    admin: 'src/admin.ts',
    mobile: 'src/mobile.ts'
  },
  external: ['react', 'react-dom'],
  output: {
    format: 'es',
    dir: 'dist',
    entryFileNames: '[name].[hash].js',
    chunkFileNames: '[name].[hash].js',
    assetFileNames: '[name].[hash].[ext]',
    manualChunks: {
      vendor: ['react', 'react-dom']
    },
    preserveEntrySignatures: 'strict'
  },
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false
  }
};

// 打印配置
console.log('\\n📌 入口配置 (input):');
Object.entries(rollupOptions.input).forEach(([name, path]) => {
  console.log(\`   \${name.padEnd(10)} → \${path}\`);
});

console.log('\\n📌 外部依赖 (external):');
console.log('  ', rollupOptions.external.join(', '));

console.log('\\n📌 输出配置 (output):');
console.log(\`   format       : \${rollupOptions.output.format}\`);
console.log(\`   dir          : \${rollupOptions.output.dir}\`);
console.log(\`   entryFileNames: \${rollupOptions.output.entryFileNames}\`);
console.log(\`   preserveEntrySignatures: \${rollupOptions.output.preserveEntrySignatures}\`);

console.log('\\n📌 分包 (manualChunks):');
Object.entries(rollupOptions.output.manualChunks).forEach(([name, mods]) => {
  console.log(\`   \${name}: [\${mods.join(', ')}]\`);
});

console.log('\\n📦 模拟产物结构:');
console.log('   dist/main.[hash].js');
console.log('   dist/admin.[hash].js');
console.log('   dist/mobile.[hash].js');
console.log('   dist/vendor.[hash].js (来自 manualChunks)');
console.log('\\n💡 external 的 react/react-dom 不会被打包进产物');`,
  },

  // =========================================================
  // 第三十六章：资源内联与 assetsInlineLimit
  // =========================================================
  {
    id: "vite2-ch36",
    group: "第七部分 构建优化",
    icon: "📦",
    title: "第三十六章 资源内联与 assetsInlineLimit",
    content: `## 概述

小图片、小字体、小 SVG 该不该单独发请求？Vite 默认会把小于 4KB 的资源**内联成 base64**直接塞进 JS/CSS。本章讲清楚内联的边界、利弊和强制控制。

---

## 默认行为：assetsInlineLimit

\`vite.config.js\` 里：

\`\`\`js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    assetsInlineLimit: 4096,   // 默认 4096 字节 = 4KB
  }
})
\`\`\`

**规则**：

- 资源体积 < \`assetsInlineLimit\` → 内联成 base64 data URL
- 资源体积 ≥ \`assetsInlineLimit\` → 输出为独立文件，加 hash 指纹

### 内联后的样子

\`\`\`js
// 源码
import logo from './logo.png'

// 内联后（< 4KB）
const logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...'

// 不内联（>= 4KB）
const logo = '/assets/logo.a1b2c3d4.png'
\`\`\`

---

## 内联的利与弊

### ✅ 优点

1. **减少 HTTP 请求数**：少一个文件 = 少一次往返
2. **避免额外请求延迟**：图片随 JS 一起到，立即渲染
3. **小图特别划算**：1KB 的图标发请求，光 HTTP 头就比内容大

### ❌ 缺点

1. **base64 比原文件大 33%**：3 字节变 4 字节
2. **无法被浏览器缓存**：图片和 JS 绑死，改一个字所有图片都失效
3. **不能懒加载**：随 JS 一起加载，不滚动到也加载
4. **增大 JS 体积**：影响首屏解析时间

---

## 调整阈值

### 完全不内联（适合大图片为主的项目）

\`\`\`js
build: {
  assetsInlineLimit: 0,   // 0 = 全部输出为文件
}
\`\`\`

### 提高阈值（适合图标多的小项目）

\`\`\`js
build: {
  assetsInlineLimit: 8192,   // 8KB 以下都内联
}
\`\`\`

---

## 强制内联：?inline

不管文件多大，强制内联：

\`\`\`js
import logo from './logo.png?inline'
// logo = 'data:image/png;base64,...'
\`\`\`

适用场景：

- 图片必须随 JS 一起到（首屏关键图标）
- 不想因为一张图多发请求

---

## 强制不内联：?url

不管文件多小，强制输出为独立文件：

\`\`\`js
import logo from './logo.png?url'
// logo = '/assets/logo.a1b2c3d4.png'
\`\`\`

适用场景：

- 图片需要独立缓存
- 图片需要懒加载
- 在 CSS 里用 \`url()\` 引用

---

## SVG 内联：?raw

SVG 比较特殊，它本质是 XML 文本，可以**作为字符串**内联（不是 base64）：

\`\`\`js
import svgString from './icon.svg?raw'
// svgString = '<svg xmlns="http://www.w3.org/2000/svg">...</svg>'

document.body.innerHTML = svgString
\`\`\`

好处：

1. SVG 文本比 base64 小（不增 33%）
2. 可以用 CSS 直接控制 SVG 颜色（\`currentColor\`）
3. 可以用 JS 修改 SVG 内部节点

---

## SVG 作为 React 组件

配合插件（如 \`vite-plugin-svgr\`）可以把 SVG 直接当组件用：

\`\`\`tsx
import Logo from './logo.svg?react'

function App() {
  return <Logo width={32} height={32} />
}
\`\`\`

\`\`\`js
// vite.config.js
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [svgr()],
})
\`\`\`

---

## 字体内联

字体文件通常较大，不建议内联。但 Web Font 小图标库（如 4KB 以下的 woff2）可以内联：

\`\`\`js
build: {
  assetsInlineLimit: 4096,   // 4KB 以下字体内联
}
\`\`\`

大字体走 CDN，配合 \`font-display: swap\` 防止 FOIT（字体加载时不可见）：

\`\`\`css
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/my-font.woff2') format('woff2');
  font-display: swap;   // 先用系统字体，加载完再换
}
\`\`\`

---

## CSS 里的资源内联

CSS 里的 \`url()\` 也会被处理：

\`\`\`css
/* 源码 */
.icon {
  background: url('./icon.png');
}

/* 小图内联后 */
.icon {
  background: url('data:image/png;base64,iVBORw0KGgo...');
}

/* 大图不内联 */
.banner {
  background: url('/assets/banner.a1b2c3d4.png');
}
\`\`\`

---

## 实战：混合策略

\`\`\`js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    assetsInlineLimit: 4096,   // 默认 4KB
  }
})
\`\`\`

\`\`\`js
// src/main.js

// 1. 小图：自动内联
import smallIcon from './icon-small.png'   // < 4KB → base64

// 2. 大图：自动不内联
import bigBanner from './banner-big.png'    // > 4KB → 独立文件

// 3. 强制内联：即使大也内联
import mustInline from './must-inline.png?inline'

// 4. 强制不内联：即使小也不内联
import mustFile from './must-file.png?url'

// 5. SVG 作为字符串
import svgStr from './icon.svg?raw'
\`\`\`

---

## 下一章

资源内联搞定了，下一章学 **manifest 与 PWA**——让构建产物可被追踪，让应用可离线使用。`,
    code: `// 演示：assetsInlineLimit 内联判断逻辑
console.log('📦 资源内联演示');
console.log('=====================================');

// 模拟 assetsInlineLimit 配置
const ASSETS_INLINE_LIMIT = 4096;  // 4KB

// 模拟项目里的资源
const assets = [
  { name: 'icon-tiny.png', size: 1200, type: 'png' },
  { name: 'icon-small.png', size: 3500, type: 'png' },
  { name: 'logo.png', size: 5200, type: 'png' },
  { name: 'banner.jpg', size: 102400, type: 'jpg' },
  { name: 'icon.svg', size: 800, type: 'svg' },
  { name: 'font.woff2', size: 18000, type: 'woff2' },
];

// 模拟查询参数
const queryOverrides = {
  'icon-tiny.png': '?url',       // 强制不内联
  'banner.jpg': '?inline',      // 强制内联
};

// 模拟 Vite 的内联决策
function decideInline(asset) {
  const query = queryOverrides[asset.name];
  if (query === '?inline') return { inline: true, reason: '强制 ?inline' };
  if (query === '?url') return { inline: false, reason: '强制 ?url' };

  if (asset.size < ASSETS_INLINE_LIMIT) {
    return { inline: true, reason: \`小于 \${ASSETS_INLINE_LIMIT}B\` };
  }
  return { inline: false, reason: \`大于等于 \${ASSETS_INLINE_LIMIT}B\` };
}

console.log(\`\\n阈值: assetsInlineLimit = \${ASSETS_INLINE_LIMIT} B (4KB)\\n\`);
console.log('资源名'.padEnd(20) + '大小'.padStart(8) + '  ' + '决策'.padEnd(20) + '原因');
console.log('─'.repeat(70));

assets.forEach(asset => {
  const sizeKB = (asset.size / 1024).toFixed(1) + 'KB';
  const decision = decideInline(asset);
  const action = decision.inline ? '✅ 内联 base64' : '📦 独立文件';
  console.log(
    asset.name.padEnd(20) +
    sizeKB.padStart(8) +
    '  ' +
    action.padEnd(20) +
    decision.reason
  );
});

console.log('\\n💡 base64 比原文件大 33%，小图内联划算，大图反而拖累');`,
  },

  // =========================================================
  // 第三十七章：manifest 与 PWA
  // =========================================================
  {
    id: "vite2-ch37",
    group: "第七部分 构建优化",
    icon: "📱",
    title: "第三十七章 manifest 与 PWA",
    content: `## 概述

构建产物里文件名带 hash，部署后怎么知道哪个文件对应哪个入口？\`build.manifest\` 给你一份"文件名映射表"。再进一步，配合 PWA + Service Worker，能让你的网页**离线可用**、**可安装到桌面**。

---

## build.manifest

开启后，Vite 会生成一个 \`manifest.json\`，记录所有产物的真实路径：

\`\`\`js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    manifest: true,           // 输出 dist/manifest.json
    // manifest: 'manifest.json',  // 自定义文件名
  }
})
\`\`\`

### manifest.json 结构

\`\`\`json
{
  "main.js": {
    "file": "assets/main.a1b2c3d4.js",
    "src": "main.js",
    "isEntry": true,
    "css": ["assets/index.b5c6d7e8.css"],
    "assets": ["assets/logo.f9a0b1c2.png"],
    "imports": ["vendor.c3d4e5f6.js"],
    "dynamicImports": ["about.d7e8f9a0.js"]
  },
  "about.js": {
    "file": "assets/about.d7e8f9a0.js",
    "src": "about.js",
    "isDynamicEntry": true
  }
}
\`\`\`

### 用途

1. **SSR/SSG**：服务端拿到 manifest 知道该 preload 哪些文件
2. **后端模板**：PHP/Rails/Go 模板根据 manifest 注入正确的 \`<script src>\`
3. **CDN 预热**：部署前预加载所有资源
4. **版本追踪**：知道每次构建产物的对应关系

---

## SSR 场景下使用 manifest

\`\`\`js
// server.js
import fs from 'fs'
import path from 'path'

const manifest = JSON.parse(
  fs.readFileSync(path.resolve('dist/manifest.json'), 'utf-8')
)

function renderPage() {
  const entry = manifest['main.js']
  const scripts = entry.imports
    .map(id => \`<link rel="modulepreload" href="/\${manifest[id].file}">\`)
    .join('\\n')

  return \`
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="/\${entry.css[0]}">
        \${scripts}
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="/\${entry.file}"></script>
      </body>
    </html>
  \`
}
\`\`\`

---

## PWA 基础

**PWA**（Progressive Web App）= 用 Web 技术做的"像原生 App"的应用。三大特征：

1. **可安装**：用户可把网页"装"到桌面/主屏，像 App 一样启动
2. **可离线**：Service Worker 缓存资源，断网也能用
3. **能推送**：支持推送通知（iOS 16.4+ 也支持了）

### Web App Manifest

一个 \`manifest.json\`（不是 Vite 那个），描述应用信息：

\`\`\`json
{
  "name": "我的待办",
  "short_name": "待办",
  "description": "极简待办应用",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#409eff",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
\`\`\`

\`\`\`html
<!-- index.html 里 -->
<link rel="manifest" href="/manifest.webmanifest">
\`\`\`

---

## Service Worker

PWA 离线的核心。是一段运行在浏览器后台的 JS，能拦截请求、缓存响应：

\`\`\`js
// public/sw.js
const CACHE_NAME = 'my-app-v1'
const PRECACHE = ['/', '/index.html', '/offline.html']

// 安装时预缓存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  )
})

// 拦截请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((res) => {
        // 缓存新请求
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, res.clone())
          return res
        })
      }).catch(() => caches.match('/offline.html'))
    })
  )
})
\`\`\`

### 缓存策略

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| Cache First | 优先缓存，无则网络 | 静态资源 |
| Network First | 优先网络，无则缓存 | API 数据 |
| Stale While Revalidate | 立即返回缓存，后台更新 | 图片、字体 |
| Network Only | 仅网络 | 实时数据 |
| Cache Only | 仅缓存 | 离线页面 |

---

## vite-plugin-pwa

手写 Service Worker 太麻烦，社区有 \`vite-plugin-pwa\` 一键搞定：

\`\`\`bash
npm install -D vite-plugin-pwa
\`\`\`

\`\`\`js
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',   // 自动更新
      manifest: {
        name: '我的待办',
        short_name: '待办',
        theme_color: '#409eff',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        // 预缓存所有构建产物
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // 运行时缓存 API
        runtimeCaching: [
          {
            urlPattern: /^https:\\/\\/api\\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 }
            }
          }
        ]
      }
    })
  ]
})
\`\`\`

构建后自动生成：

- \`dist/sw.js\`：Service Worker
- \`dist/workbox-xxx.js\`：Workbox 运行时
- \`dist/manifest.webmanifest\`：PWA manifest
- \`dist/registerSW.js\`：注册脚本

---

## 离线支持实战

### 1. 安装插件

\`\`\`bash
npm install -D vite-plugin-pwa
\`\`\`

### 2. 配置（见上面）

### 3. 在入口注册 SW

\`\`\`js
// src/main.ts
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // 有新版本，提示用户刷新
    if (confirm('发现新版本，是否更新？')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('应用已可离线使用')
  }
})
\`\`\`

### 4. 测试

\`\`\`bash
npm run build
npm run preview
\`\`\`

打开浏览器 DevTools → Application → Service Workers，看到已注册。然后断网刷新，应用依然可用。

---

## 开发期注意事项

- **dev 模式下 SW 行为不一样**：vite-plugin-pwa 默认只在 build 时生成 SW
- **HTTPS 要求**：SW 只在 HTTPS 或 \`localhost\` 下工作
- **更新策略**：用户首次访问拿旧版本，下次访问才更新（除非用 \`skipWaiting\`）

---

## 下一章

PWA 让应用能离线，下一章进入**第八部分 插件系统**——理解 Vite 插件机制与钩子，开始写自己的插件。`,
    code: `// 演示：manifest 解析与 Service Worker 缓存策略模拟
console.log('📱 Manifest 与 PWA 演示');
console.log('=====================================');

// 模拟 build.manifest 输出
const manifest = {
  'main.js': {
    file: 'assets/main.a1b2c3d4.js',
    src: 'main.js',
    isEntry: true,
    css: ['assets/index.b5c6d7e8.css'],
    imports: ['vendor.c3d4e5f6.js'],
    dynamicImports: ['about.d7e8f9a0.js']
  },
  'vendor.c3d4e5f6.js': {
    file: 'assets/vendor.c3d4e5f6.js',
    isDynamicEntry: false
  },
  'about.d7e8f9a0.js': {
    file: 'assets/about.d7e8f9a0.js',
    isDynamicEntry: true
  }
};

console.log('\\n📌 build.manifest 内容：');
Object.entries(manifest).forEach(([key, value]) => {
  console.log(\`  "\${key}":\`);
  console.log(\`    file: \${value.file}\`);
  if (value.isEntry) console.log('    isEntry: true');
  if (value.css) console.log(\`    css: [\${value.css.join(', ')}]\`);
  if (value.imports) console.log(\`    imports: [\${value.imports.join(', ')}]\`);
  if (value.dynamicImports) console.log(\`    dynamicImports: [\${value.dynamicImports.join(', ')}]\`);
});

// 模拟 Service Worker 缓存策略
console.log('\\n📌 Service Worker 缓存策略：');
const strategies = [
  { name: 'Cache First', use: '静态资源（JS/CSS/图片）' },
  { name: 'Network First', use: 'API 数据（要最新）' },
  { name: 'Stale While Revalidate', use: '字体、不常变的图片' },
  { name: 'Network Only', use: '实时数据（股票、消息）' },
  { name: 'Cache Only', use: '离线 fallback 页面' }
];

strategies.forEach(s => {
  console.log(\`  \${s.name.padEnd(25)} ← \${s.use}\`);
});

// 模拟 fetch 拦截
console.log('\\n📌 模拟 fetch 拦截：');
const cache = new Map();
const requests = [
  { url: '/assets/main.a1b2c3d4.js', type: 'static' },
  { url: '/api/todos', type: 'api' },
  { url: '/offline.html', type: 'fallback' }
];

requests.forEach(req => {
  const cached = cache.has(req.url);
  let strategy, action;
  if (req.type === 'static') {
    strategy = 'Cache First';
    action = cached ? '命中缓存 ✅' : '缓存未命中 → 网络 → 写入缓存';
    cache.set(req.url, '内容...');
  } else if (req.type === 'api') {
    strategy = 'Network First';
    action = '先请求网络 → 失败则用缓存';
  } else {
    strategy = 'Cache Only';
    action = '仅从缓存读';
  }
  console.log(\`  \${req.url.padEnd(35)} [策略: \${strategy}] \${action}\`);
});

console.log('\\n💡 vite-plugin-pwa 用 Workbox 自动处理这些细节');`,
  },

  // =========================================================
  // 第三十八章：插件机制与钩子
  // =========================================================
  {
    id: "vite2-ch38",
    group: "第八部分 插件系统",
    icon: "🔌",
    title: "第三十八章 插件机制与钩子",
    content: `## 概述

Vite 插件 = **Rollup 插件接口 + Vite 独有扩展**。学会插件机制，就能做：自定义文件处理、注入代码、修改配置、扩展 dev server。

---

## 插件的基本结构

一个 Vite 插件就是一个返回对象的函数：

\`\`\`js
// vite.config.js
import { defineConfig } from 'vite'

function myPlugin() {
  return {
    name: 'vite-plugin-my',   // 必填，唯一标识

    // 各种钩子...
    resolveId(source, importer) { /* ... */ },
    load(id) { /* ... */ },
    transform(code, id) { /* ... */ },
  }
}

export default defineConfig({
  plugins: [myPlugin()]
})
\`\`\`

**关键点**：

1. \`name\` 必填，用于调试和错误信息
2. 插件是一个**函数**，返回带钩子的对象（也可以直接是对象）
3. 函数可以接收 options：\`myPlugin({ option1: true })\`

---

## 钩子分类

Vite 插件钩子分两大类：

| 类别 | 来源 | 在哪些阶段跑 |
|------|------|--------------|
| **Rollup 兼容钩子** | Rollup 原生 | dev + build 都跑 |
| **Vite 独有钩子** | Vite 扩展 | 仅 dev 或仅 build |

---

## Rollup 兼容钩子

### 1. resolveId(source, importer)

**解析模块路径**。返回绝对路径或外部标识。

\`\`\`js
{
  name: 'my-plugin',
  resolveId(source, importer) {
    if (source === 'virtual:fancy') {
      return '\\0virtual:fancy'   // \\0 是虚拟模块约定，详见下章
    }
    return null   // 返回 null 让其他插件处理
  }
}
\`\`\`

### 2. load(id)

**加载模块内容**。返回源代码字符串。

\`\`\`js
{
  name: 'my-plugin',
  load(id) {
    if (id === '\\0virtual:fancy') {
      return 'export default "Hello from virtual module!"'
    }
    return null
  }
}
\`\`\`

### 3. transform(code, id)

**转换模块代码**。返回新代码（可异步）。

\`\`\`js
{
  name: 'my-plugin',
  async transform(code, id) {
    if (id.endsWith('.md')) {
      const html = await markdownToHtml(code)
      return \`export default \${JSON.stringify(html)}\`
    }
    return null
  }
}
\`\`\`

### 其他常用 Rollup 钩子

| 钩子 | 作用 |
|------|------|
| \`options(options)\` | 修改 Rollup 配置（最早执行）|
| \`buildStart(options)\` | 构建开始 |
| \`buildEnd(error?)\` | 构建结束 |
| \`closeBundle()\` | 所有文件写入完成 |
| \`renderChunk(code, chunk)\` | 转换 chunk 代码 |
| \`generateBundle(options, bundle)\` | 产物生成前 |

---

## Vite 独有钩子

### 1. config(config, env)

**修改 Vite 配置**。返回的对象会被合并到配置里。

\`\`\`js
{
  name: 'my-plugin',
  config(config, { command, mode }) {
    return {
      define: {
        __APP_VERSION__: JSON.stringify('1.0.0')
      }
    }
  }
}
\`\`\`

### 2. configResolved(resolvedConfig)

**拿到最终配置**。用于读取已合并的配置做后续操作。

\`\`\`js
{
  name: 'my-plugin',
  configResolved(config) {
    console.log('最终 outDir:', config.build.outDir)
  }
}
\`\`\`

### 3. configureServer(server)

**配置 dev server**。可以加中间件、修改响应。

\`\`\`js
{
  name: 'my-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/hello') {
        res.end(JSON.stringify({ msg: 'hi' }))
        return
      }
      next()
    })
  }
}
\`\`\`

### 4. configurePreviewServer(server)

同上，但用于 \`vite preview\`。

### 5. transformIndexHtml(html, ctx)

**转换 index.html**。可以注入 \`<script>\`、\`<link>\` 等。

\`\`\`js
{
  name: 'my-plugin',
  transformIndexHtml(html) {
    return html.replace(
      '</head>',
      '<script>console.log("injected!")</script></head>'
    )
  }
}
\`\`\`

也支持返回数组：

\`\`\`js
transformIndexHtml() {
  return [
    { tag: 'script', attrs: { src: '/inject.js' }, injectTo: 'head' }
  ]
}
\`\`\`

### 6. handleHotUpdate(ctx)

**自定义 HMR 行为**。

\`\`\`js
{
  name: 'my-plugin',
  handleHotUpdate({ file, server }) {
    if (file.endsWith('.md')) {
      console.log('Markdown changed:', file)
      server.ws.send({ type: 'full-reload' })
    }
  }
}
\`\`\`

---

## 钩子执行顺序

理解顺序对调试至关重要：

\`\`\`
1. config               ← 修改配置
2. configResolved       ← 拿到最终配置
3. options              ← Rollup 配置
4. configureServer      ← dev server 初始化（仅 dev）
5. buildStart           ← 构建开始

  ┌─ 每个模块 ─────────────────┐
  │ 6. resolveId              │
  │ 7. load                   │
  │ 8. transform              │
  └───────────────────────────┘

9. transformIndexHtml   ← 处理 HTML
10. renderChunk         ← 转换 chunk
11. generateBundle      ← 产物生成前
12. buildEnd            ← 构建结束
13. closeBundle         ← 文件写入完成
\`\`\`

**HMR 单独的钩子**：\`handleHotUpdate\` 在文件变更时触发。

---

## 完整插件示例：文件头注释

给所有 JS 文件加一个文件头注释：

\`\`\`js
function addFileHeaderPlugin() {
  return {
    name: 'add-file-header',
    enforce: 'pre',   // 在其他插件之前执行
    transform(code, id) {
      if (!id.endsWith('.js') && !id.endsWith('.ts')) return null
      return \`/**\\n * Generated by Vite\\n * File: \${id}\\n */\\n\${code}\`
    }
  }
}
\`\`\`

---

## 异步钩子

所有钩子都可以是 async：

\`\`\`js
{
  name: 'my-plugin',
  async transform(code, id) {
    if (id.endsWith('.svg')) {
      const optimized = await svgoOptimize(code)
      return \`export default \${JSON.stringify(optimized)}\`
    }
  }
}
\`\`\`

---

## 插件配置对象形式

插件也可以直接是对象（不一定是函数）：

\`\`\`js
const myPlugin = {
  name: 'my-plugin',
  transform(code, id) {
    // ...
  }
}

export default defineConfig({
  plugins: [myPlugin]
})
\`\`\`

函数形式的好处：可以接收 options、可以根据命令返回不同插件。

---

## 下一章

钩子机制理解了，下一章学 **enforce 与 apply**——精确控制插件顺序，避免插件冲突。`,
    code: `// 演示：Vite 插件结构与钩子调用顺序
console.log('🔌 Vite 插件机制演示');
console.log('=====================================');

// 模拟一个 Vite 插件
function createDemoPlugin() {
  const callLog = [];
  return {
    name: 'demo-plugin',
    // === Vite 独有钩子 ===
    config(config) {
      callLog.push('config');
      return { define: { __APP_VERSION__: '"1.0.0"' } };
    },
    configResolved(resolved) {
      callLog.push('configResolved');
    },
    configureServer(server) {
      callLog.push('configureServer');
    },
    transformIndexHtml(html) {
      callLog.push('transformIndexHtml');
      return html + '<!-- injected -->';
    },
    // === Rollup 兼容钩子 ===
    resolveId(source) {
      callLog.push('resolveId(' + source + ')');
      return null;
    },
    load(id) {
      callLog.push('load(' + id + ')');
      return null;
    },
    transform(code, id) {
      callLog.push('transform(' + id + ')');
      return null;
    },
    buildStart() {
      callLog.push('buildStart');
    },
    buildEnd() {
      callLog.push('buildEnd');
    },
    // 暴露日志用于查看
    _log: callLog
  };
}

// 创建并"执行"插件
const plugin = createDemoPlugin();

// 模拟 Vite 调用插件钩子的过程
console.log('\\n📌 模拟插件钩子调用：\\n');
plugin.config({});
plugin.configResolved({});
plugin.configureServer({});
plugin.buildStart();

// 模拟处理一个模块
const moduleId = '/src/main.js';
plugin.resolveId(moduleId);
plugin.load(moduleId);
plugin.transform('console.log(1)', moduleId);

plugin.transformIndexHtml('<html></html>');
plugin.buildEnd();

// 打印调用顺序
console.log('钩子调用顺序：');
plugin._log.forEach((name, i) => {
  console.log(\`  \${(i + 1).toString().padStart(2)}. \${name}\`);
});

console.log('\\n💡 顺序：config → configResolved → configureServer → buildStart');
console.log('   → resolveId → load → transform → transformIndexHtml → buildEnd');
console.log('\\n💡 Vite 独有钩子（前 4 个 + transformIndexHtml）');
console.log('💡 Rollup 兼容钩子（resolveId/load/transform/buildStart/buildEnd）');`,
  },

  // =========================================================
  // 第三十九章：enforce 与 apply
  // =========================================================
  {
    id: "vite2-ch39",
    group: "第八部分 插件系统",
    icon: "⏱️",
    title: "第三十九章 enforce 与 apply",
    content: `## 概述

一个项目可能有十几个插件，谁先跑谁后跑？只在 dev 跑还是只在 build 跑？\`enforce\` 和 \`apply\` 两个属性解决这两个问题。

---

## enforce：插件执行顺序

控制插件在 Vite 内部流水线中的位置。三个值：

| 值 | 时机 | 典型用途 |
|----|------|----------|
| \`'pre'\` | 在 Vite 核心插件**之前** | 拦截/转换源码，比如 ESLint、自定义解析 |
| 不设（默认）| 在 Vite 核心插件**之后** | 大多数业务插件 |
| \`'post'\` | 在所有插件**之后** | 最终修改，比如压缩、最终转换 |

### 执行顺序示意

\`\`\`
用户插件 (enforce: 'pre')
   ↓
Vite 核心插件（react/vue/css/...）
   ↓
用户插件 (默认，无 enforce)
   ↓
Vite 内部后处理
   ↓
用户插件 (enforce: 'post')
\`\`\`

### 示例

\`\`\`js
function prePlugin() {
  return {
    name: 'pre-plugin',
    enforce: 'pre',
    transform(code, id) {
      console.log('pre 插件先跑:', id)
      return null   // 不修改，让其他插件继续处理
    }
  }
}

function postPlugin() {
  return {
    name: 'post-plugin',
    enforce: 'post',
    transform(code, id) {
      console.log('post 插件最后跑:', id)
      return null
    }
  }
}

function normalPlugin() {
  return {
    name: 'normal-plugin',
    // 没有 enforce，默认在中间跑
    transform(code, id) {
      console.log('normal 插件中间跑:', id)
      return null
    }
  }
}

export default defineConfig({
  plugins: [
    normalPlugin(),   // 顺序无所谓，按 enforce 决定
    postPlugin(),
    prePlugin(),
  ]
})
\`\`\`

执行顺序永远是：\`prePlugin → normalPlugin → postPlugin\`，**与 plugins 数组里的顺序无关**。

---

## apply：插件作用阶段

控制插件**只在 dev 或只在 build** 时生效。两个值：

| 值 | 时机 |
|----|------|
| \`'serve'\` | 仅 dev（\`vite\` / \`vite preview\`）|
| \`'build'\` | 仅 build（\`vite build\`）|

### 示例

\`\`\`js
function devOnlyPlugin() {
  return {
    name: 'dev-only',
    apply: 'serve',    // 只在 dev 时跑
    configureServer(server) {
      server.middlewares.use('/mock-api', mockMiddleware)
    }
  }
}

function buildOnlyPlugin() {
  return {
    name: 'build-only',
    apply: 'build',    // 只在 build 时跑
    generateBundle(opts, bundle) {
      // 给产物加版本号
    }
  }
}

export default defineConfig({
  plugins: [
    devOnlyPlugin(),
    buildOnlyPlugin(),
  ]
})
\`\`\`

### apply 也支持函数

更灵活的条件判断：

\`\`\`js
function conditionalPlugin() {
  return {
    name: 'conditional',
    apply: ({ command, mode, isSsrBuild }) => {
      // 仅在 build 模式且 mode 为 production 时生效
      return command === 'build' && mode === 'production'
    },
    // ...
  }
}
\`\`\`

### apply 也支持数组

\`\`\`js
apply: ['build', 'serve']   // 等同于不设
\`\`\`

---

## enforce 与 apply 的区别

容易混淆，记一句话：**enforce 管"顺序"，apply 管"阶段"**。

| 维度 | enforce | apply |
|------|---------|-------|
| 控制什么 | 在流水线中的**位置** | 在哪个**命令**下生效 |
| 取值 | \`'pre'\` / \`'post'\` / 默认 | \`'serve'\` / \`'build'\` / 函数 |
| 影响 dev/build | 都影响 | 二选一 |
| 默认行为 | 跑在 Vite 核心之后 | dev + build 都跑 |

可以同时使用：

\`\`\`js
{
  name: 'my-plugin',
  enforce: 'pre',
  apply: 'build',
  // 在 build 阶段，比所有核心插件先跑
}
\`\`\`

---

## 常见插件顺序问题

### 问题 1：自定义 loader 被 Vite 抢先

你想自定义处理 \`.txt\` 文件，但 Vite 把它当静态资源处理了。

**解决**：\`enforce: 'pre'\` 抢在 Vite 资源插件之前：

\`\`\`js
function txtLoaderPlugin() {
  return {
    name: 'txt-loader',
    enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('.txt')) {
        return \`export default \${JSON.stringify(code)}\`
      }
      return null
    }
  }
}
\`\`\`

### 问题 2：mock 插件在生产环境报错

mock 中间件不需要进生产，但插件没限制。

**解决**：\`apply: 'serve'\`：

\`\`\`js
function mockPlugin() {
  return {
    name: 'mock',
    apply: 'serve',   // 仅 dev
    configureServer(server) {
      server.middlewares.use('/api', mockMiddleware)
    }
  }
}
\`\`\`

### 问题 3：压缩插件太早跑

某个压缩插件需要在所有 transform 完成后再跑。

**解决**：\`enforce: 'post'\`：

\`\`\`js
function minifyPlugin() {
  return {
    name: 'minify',
    enforce: 'post',
    renderChunk(code) {
      return minify(code)
    }
  }
}
\`\`\`

---

## 实战：区分环境的 mock 插件

\`\`\`js
function mockPlugin({ enable = true } = {}) {
  return {
    name: 'vite-plugin-mock',
    enforce: 'pre',
    apply: 'serve',   // 仅 dev
    configureServer(server) {
      if (!enable) return
      server.middlewares.use('/api/user', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ name: 'mock-user', age: 18 }))
      })
    }
  }
}

export default defineConfig(({ command, mode }) => ({
  plugins: [
    react(),
    mockPlugin({ enable: mode === 'development' })  // 只在开发模式启用
  ]
}))
\`\`\`

---

## 调试插件顺序

想知道实际插件顺序？开发期可以打印：

\`\`\`js
function debugPlugins() {
  return {
    name: 'debug-plugins',
    configResolved(config) {
      console.log('当前插件顺序：')
      config.plugins.forEach((p, i) => {
        console.log(\`  \${i + 1}. \${p.name} (enforce: \${p.enforce || 'normal'}, apply: \${p.apply || 'both'})\`)
      })
    }
  }
}
\`\`\`

加到 \`plugins\` 数组最前面即可。

---

## 下一章

enforce 和 apply 搞定了，下一章学 **虚拟模块 virtual modules**——用 \`\\0\` 前缀和 \`resolveId\`/\`load\` 创造"凭空"的模块。`,
    code: `// 演示：enforce 与 apply 控制插件顺序
console.log('⏱️ enforce 与 apply 演示');
console.log('=====================================');

// 模拟三个插件
function makePlugin(name, enforce, apply) {
  return {
    name,
    enforce,
    apply,
    _log: [],
    transform(code, id) {
      this._log.push(\`transform(\${id})\`);
      return null;
    }
  };
}

const plugins = [
  makePlugin('normal-plugin', undefined, undefined),
  makePlugin('post-plugin', 'post', undefined),
  makePlugin('pre-plugin', 'pre', undefined),
  makePlugin('dev-only', undefined, 'serve'),
  makePlugin('build-only', undefined, 'build'),
];

// 模拟 Vite 排序逻辑
function sortPlugins(plugins) {
  const pre = plugins.filter(p => p.enforce === 'pre');
  const normal = plugins.filter(p => !p.enforce);
  const post = plugins.filter(p => p.enforce === 'post');
  return [...pre, ...normal, ...post];
}

console.log('\\n📌 plugins 数组原始顺序：');
plugins.forEach((p, i) => {
  console.log(\`  \${i + 1}. \${p.name} (enforce: \${p.enforce || '默认'})\`);
});

const sorted = sortPlugins(plugins);
console.log('\\n📌 按 enforce 排序后执行顺序：');
sorted.forEach((p, i) => {
  console.log(\`  \${i + 1}. \${p.name}\`);
});

// 模拟 apply 过滤
console.log('\\n📌 apply 控制插件作用阶段：');
const commands = ['serve', 'build'];
commands.forEach(cmd => {
  console.log(\`\\n  ▶ 命令: vite \${cmd === 'serve' ? '(dev)' : 'build'}\`);
  plugins.forEach(p => {
    let active;
    if (!p.apply) active = true;
    else if (typeof p.apply === 'string') active = (p.apply === cmd);
    else active = p.apply({ command: cmd });
    console.log(\`    \${p.name.padEnd(18)} → \${active ? '✅ 生效' : '❌ 跳过'}\`);
  });
});

console.log('\\n💡 enforce 管顺序：pre → normal → post');
console.log('💡 apply 管阶段：serve = dev, build = build');
console.log('💡 两者可同时用：{ enforce: "pre", apply: "build" }');`,
  },

  // =========================================================
  // 第四十章：虚拟模块 virtual modules
  // =========================================================
  {
    id: "vite2-ch40",
    group: "第八部分 插件系统",
    icon: "🌌",
    title: "第四十章 虚拟模块 virtual modules",
    content: `## 概述

虚拟模块（virtual modules）= **凭空造出来的模块**，不在文件系统里。可以让代码 \`import\` 一个不存在的"虚拟"路径，由插件动态返回内容。这是 Vite/Rollup 插件最强大的能力之一。

---

## 什么时候用虚拟模块

- **动态生成代码**：根据配置、文件列表生成入口
- **统一接口**：把不同来源的数据封装成模块
- **隐藏实现**：插件内部模块不暴露真实路径
- **跨文件聚合**：自动导入某个目录下所有文件

---

## \\0 前缀约定

Rollup 规定：虚拟模块的 ID **以 \`\\0\` 开头**。

\`\`\`js
// resolveId 返回的路径
return '\\0virtual:my-module'
\`\`\`

**为什么用 \`\\0\`**：

1. \`\\0\` 不能出现在文件路径里，避免和真实文件冲突
2. Rollup 内部识别 \`\\0\` 开头的模块为虚拟模块，**不做路径解析**
3. 阻止其他插件再去 resolve 这个 ID

**用户代码里怎么 import**：

\`\`\`js
// 用户代码（不带 \\0）
import data from 'virtual:my-module'

// 插件内部（带 \\0）
const RESOLVED_ID = '\\0virtual:my-module'
\`\`\`

---

## 基本实现：resolveId + load

虚拟模块靠两个钩子配合：

\`\`\`js
const VIRTUAL_ID = 'virtual:my-module'
const RESOLVED_ID = '\\0' + VIRTUAL_ID

function myPlugin() {
  return {
    name: 'vite-plugin-virtual',

    // 1. 解析：把 'virtual:xxx' 转成 '\\0virtual:xxx'
    resolveId(source) {
      if (source === VIRTUAL_ID) {
        return RESOLVED_ID
      }
      return null
    },

    // 2. 加载：返回虚拟模块的内容
    load(id) {
      if (id === RESOLVED_ID) {
        return \`export const msg = "Hello from virtual module!"
export const time = \${Date.now()}\`
      }
      return null
    }
  }
}
\`\`\`

使用：

\`\`\`js
// src/main.js
import { msg, time } from 'virtual:my-module'
console.log(msg)        // Hello from virtual module!
console.log(time)       // 1700000000000
\`\`\`

---

## TypeScript 类型声明

为了让 TS 不报错，需要声明模块类型：

\`\`\`ts
// src/vite-env.d.ts
declare module 'virtual:my-module' {
  export const msg: string
  export const time: number
}
\`\`\`

---

## 进阶：动态内容虚拟模块

虚拟模块的内容可以根据文件系统、环境变量等动态生成：

\`\`\`js
import fs from 'fs'
import path from 'path'

function pagesPlugin() {
  const VIRTUAL_ID = 'virtual:pages'
  const RESOLVED_ID = '\\0' + VIRTUAL_ID

  return {
    name: 'vite-plugin-pages',
    resolveId(source) {
      if (source === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id) {
      if (id !== RESOLVED_ID) return null

      // 扫描 src/pages 目录下的所有 .vue 文件
      const pagesDir = path.resolve('src/pages')
      const files = fs.readdirSync(pagesDir)
        .filter(f => f.endsWith('.vue'))

      // 生成导入语句和路由配置
      const imports = files.map((f, i) => {
        const name = f.replace(/\\.vue$/, '')
        return \`import Page\${i} from '/src/pages/\${f}'\`
      }).join('\\n')

      const routes = files.map((f, i) => {
        const name = f.replace(/\\.vue$/, '')
        return \`{ path: '/\${name}', component: Page\${i} }\`
      }).join(',')

      return \`\${imports}
export const routes = [\${routes}]
\`
    }
  }
}
\`\`\`

使用：

\`\`\`ts
import { routes } from 'virtual:pages'
// routes = [{ path: '/home', component: ... }, { path: '/about', component: ... }]
\`\`\`

---

## 实战：Markdown 渲染插件

把 \`.md\` 文件当作组件用：

\`\`\`js
import MarkdownIt from 'markdown-it'
const md = new MarkdownIt()

function markdownPlugin() {
  return {
    name: 'vite-plugin-markdown',
    transform(code, id) {
      if (!id.endsWith('.md')) return null

      // 把 Markdown 编译成 HTML
      const html = md.render(code)
      // 返回 ESM 模块
      return \`export default \${JSON.stringify(html)}\`
    }
  }
}
\`\`\`

\`\`\`js
// 使用
import content from './readme.md'
document.getElementById('content').innerHTML = content
\`\`\`

---

## 实战：glob 自动导入

自动导入某个目录下所有模块，不用一个个 \`import\`：

\`\`\`js
function globPlugin() {
  const VIRTUAL_ID = 'virtual:glob'
  const RESOLVED_ID = '\\0' + VIRTUAL_ID

  return {
    name: 'vite-plugin-glob',
    resolveId(source) {
      if (source === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id) {
      if (id !== RESOLVED_ID) return null

      const components = {
        './Button.vue': null,
        './Input.vue': null,
        './Modal.vue': null,
      }

      const imports = Object.keys(components)
        .map((p, i) => \`import C\${i} from '\${p}'\`)
        .join('\\n')

      const map = Object.keys(components)
        .map((p, i) => \`'\${p.replace(/\\.vue$/, '').replace('./', '')}': C\${i}\`)
        .join(',')

      return \`\${imports}
export default { \${map} }\`
    }
  }
}
\`\`\`

\`\`\`js
import components from 'virtual:glob'
// components = { Button: ..., Input: ..., Modal: ... }
\`\`\`

---

## 实战：动态配置注入

根据构建时环境生成配置模块：

\`\`\`js
function configPlugin() {
  const VIRTUAL_ID = 'virtual:config'
  const RESOLVED_ID = '\\0' + VIRTUAL_ID

  return {
    name: 'vite-plugin-config',
    resolveId(source) {
      if (source === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id) {
      if (id !== RESOLVED_ID) return null

      // 读取构建时的环境变量
      const config = {
        apiBaseUrl: process.env.VITE_API_URL || '/api',
        version: JSON.parse(process.env.npm_package_version || '"0.0.0"'),
        buildTime: new Date().toISOString()
      }

      return \`export const config = \${JSON.stringify(config, null, 2)}\`
    }
  }
}
\`\`\`

\`\`\`ts
import { config } from 'virtual:config'
console.log(config.apiBaseUrl, config.version, config.buildTime)
\`\`\`

---

## 已有的虚拟模块实践

| 模块 | 来源 | 用途 |
|------|------|------|
| \`virtual:pwa-register\` | vite-plugin-pwa | 注册 Service Worker |
| \`virtual:svg-icons/register\` | vite-plugin-svg-icons | 注册 SVG 图标 |
| \`virtual:env\` | Vite 内置 | 环境变量（内部）|
| \`\@env\` | Vite 内置 | 环境变量（兼容）|
| \`virtual:uno.css\` | unocss | 动态 CSS |

---

## 调试虚拟模块

想知道虚拟模块生成了什么代码？开发期临时加日志：

\`\`\`js
load(id) {
  if (id === RESOLVED_ID) {
    const code = generateCode()
    console.log('虚拟模块代码：', code)
    return code
  }
}
\`\`\`

或者在浏览器 DevTools 的 Network 里，找 \`@id/__x00__virtual:xxx\` 这样的请求查看返回内容。

---

## 注意事项

1. **必须返回 \`null\`**：钩子不处理时返回 \`null\`，让其他插件继续处理
2. **避免循环依赖**：虚拟模块里 import 真实文件，要小心循环
3. **dev/build 一致**：虚拟模块在 dev 和 build 下都要能跑，注意路径解析差异
4. **类型声明**：给 \`virtual:xxx\` 加 TS 声明，否则编辑器报错

---

## 下一章

虚拟模块掌握了，下一章继续 **第八部分 插件系统**，学习如何写一个完整的插件并发布到 npm。`,
    code: `// 演示：虚拟模块的实现与使用
console.log('🌌 虚拟模块演示');
console.log('=====================================');

// 模拟一个虚拟模块插件
function createVirtualConfigPlugin() {
  const VIRTUAL_ID = 'virtual:config';
  const RESOLVED_ID = '\\0' + VIRTUAL_ID;   // 关键：\0 前缀

  return {
    name: 'vite-plugin-virtual-config',

    // 模拟 resolveId 钩子
    resolveId(source) {
      if (source === VIRTUAL_ID) {
        console.log(\`[resolveId] \${source} → \${RESOLVED_ID}\`);
        return RESOLVED_ID;
      }
      return null;
    },

    // 模拟 load 钩子
    load(id) {
      if (id === RESOLVED_ID) {
        console.log(\`[load] 生成虚拟模块内容\`);
        const config = {
          apiBaseUrl: '/api',
          version: '1.2.0',
          buildTime: new Date().toISOString()
        };
        // 生成 ESM 代码
        const code = \`export const config = \${JSON.stringify(config, null, 2)}\`;
        console.log('[load] 生成的代码：');
        console.log(code.split('\\n').map(l => '  ' + l).join('\\n'));
        return code;
      }
      return null;
    }
  };
}

// 模拟一个虚拟模块工厂：聚合组件
function createGlobPlugin() {
  const VIRTUAL_ID = 'virtual:components';
  const RESOLVED_ID = '\\0' + VIRTUAL_ID;

  return {
    name: 'vite-plugin-glob',
    resolveId(source) {
      if (source === VIRTUAL_ID) {
        console.log(\`\\n[resolveId] \${source} → \${RESOLVED_ID}\`);
        return RESOLVED_ID;
      }
      return null;
    },
    load(id) {
      if (id !== RESOLVED_ID) return null;

      const files = ['./Button.vue', './Input.vue', './Modal.vue'];
      const imports = files.map((f, i) => \`import C\${i} from '\${f}'\`).join('\\n');
      const entries = files.map((f, i) => {
        const name = f.replace('./', '').replace('.vue', '');
        return \`'\${name}': C\${i}\`;
      }).join(', ');
      const code = \`\${imports}\\nexport default { \${entries} }\`;

      console.log('[load] 生成的代码：');
      console.log(code.split('\\n').map(l => '  ' + l).join('\\n'));
      return code;
    }
  };
}

// 运行演示
const plugin1 = createVirtualConfigPlugin();
plugin1.resolveId('virtual:config');
plugin1.load('\\0virtual:config');

const plugin2 = createGlobPlugin();
plugin2.resolveId('virtual:components');
plugin2.load('\\0virtual:components');

console.log('\\n=====================================');
console.log('💡 \\0 前缀让 Rollup 知道这是虚拟模块');
console.log('💡 resolveId 把用户路径转成 \\0 路径');
console.log('💡 load 返回虚拟模块的代码字符串');`,
  },
];
