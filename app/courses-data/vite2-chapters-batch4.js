// =============================================================
// Vite 大全集（终极版）—— 第4批章节
// 第四部分 静态资源 + 第五部分 环境与变量（共 7 章）
// -------------------------------------------------------------
// 本批包含 7 章：
//   vite2-ch20 : 第二十章 图片与静态资源
//   vite2-ch21 : 第二十一章 字体处理
//   vite2-ch22 : 第二十二章 JSON 与静态数据
//   vite2-ch23 : 第二十三章 Web Worker
//   vite2-ch24 : 第二十四章 .env 文件详解
//   vite2-ch25 : 第二十五章 import.meta.env API
//   vite2-ch26 : 第二十六章 模式 mode 与多环境
// =============================================================

export const chapters = [
  // =========================================================
  // 第二十章：图片与静态资源
  // =========================================================
  {
    id: "vite2-ch20",
    group: "第四部分 静态资源",
    icon: "🖼️",
    title: "第二十章 图片与静态资源",
    content: `## 第二十章　图片与静态资源

Vite 对静态资源（图片、字体、文本等）有一套统一的处理机制：开发时按需返回，构建时自动加 hash、内联小文件、压缩大文件。本章讲清楚每个细节。

### 一、import 静态资源

在 Vite 里，直接 \`import\` 一张图片会得到它的**最终 URL**：

\`\`\`js
import logoUrl from './assets/logo.png'
// logoUrl 在开发时是 /src/assets/logo.png
// 构建后是 /assets/logo-[hash].png

const img = new Image()
img.src = logoUrl
document.body.appendChild(img)
\`\`\`

在 JSX / Vue 模板里写法一样：

\`\`\`tsx
import logo from './assets/logo.png'
function App() {
  return <img src={logo} alt="logo" />
}
\`\`\`

### 二、public/ vs src/assets/

| 目录 | 处理方式 | 引用方式 | 适用场景 |
|------|----------|----------|----------|
| \`public/\` | 原样复制到 \`dist/\` 根目录 | 绝对路径 \`/foo.png\` | favicon、robots.txt、不需要 hash 的文件 |
| \`src/assets/\` | 编译、hash、内联 | \`import\` 引入 | 业务图片、需要 hash 指纹的资源 |

\`\`\`html
<!-- public/ 里的文件，直接用绝对路径 -->
<img src="/vite.svg" />
<link rel="icon" href="/favicon.ico" />
\`\`\`

\`\`\`js
// src/assets/ 里的文件，import 引入
import logo from '@/assets/logo.png'
\`\`\`

**经验法则**：需要 hash、可能改动的资源放 \`src/assets/\`；几乎不变的放 \`public/\`。

### 三、assetsInlineLimit（4KB 内联 base64）

Vite 默认把**小于 4KB** 的静态资源内联成 base64 Data URL，直接嵌进 JS/CSS，**省一次 HTTP 请求**。

\`\`\`js
// vite.config.js
export default defineConfig({
  build: {
    assetsInlineLimit: 4096  // 默认 4096 字节 = 4KB
  }
})
\`\`\`

| 文件大小 | 处理方式 |
|----------|----------|
| < 4KB（默认）| 内联为 base64 Data URL |
| ≥ 4KB | 输出为独立文件，文件名加 hash |

调整建议：
- **图片**：4KB 合适，再大内联反而增加 JS 体积
- **SVG**：可以调高（比如 10KB），SVG 通常很小且适合内联
- **字体**：通常调小（比如 0），字体文件大，不适合内联

\`\`\`js
build: {
  assetsInlineLimit: (file) => {
    if (file.endsWith('.svg')) return 1024 * 10  // SVG 10KB 内才内联
    if (file.endsWith('.woff2')) return 0          // 字体永不内联
    return 4096                                    // 其他用默认
  }
}
\`\`\`

### 四、?url 后缀：显式拿 URL

默认 \`import\` 图片得到的就是 URL。但有些场景下你想**显式**要 URL（比如 \`import\` 一个 JS 文件却只想拿它构建后的地址）：

\`\`\`js
import workerUrl from './worker.js?url'
// workerUrl 是 worker.js 构建后的 URL，不执行它

const worker = new Worker(workerUrl)
\`\`\`

\`\`\`js
import pngUrl from './logo.png?url'  // 显式要 URL（不内联）
\`\`\`

### 五、?raw 后缀：拿到原始字符串

需要把文件**内容**作为字符串引入（比如读 markdown、shader 代码）：

\`\`\`js
import mdContent from './README.md?raw'
// mdContent 是 README.md 的完整字符串

import vertexShader from './shader.vert?raw'
gl.shaderSource(shader, vertexShader)
\`\`\`

### 六、?worker 后缀：直接引入 Web Worker

\`\`\`js
import MyWorker from './worker.js?worker'
const worker = new MyWorker()
worker.postMessage({ task: 'compute' })
\`\`\`

下一章会专门讲 Web Worker，这里先记住 \`?worker\` 后缀。

还有 \`?worker&inline\`，把 worker 内联成 base64，构建后是单文件：

\`\`\`js
import MyWorker from './worker.js?worker&inline'
\`\`\`

### 七、SVG 处理

SVG 有三种用法：

**1. 当图片用**

\`\`\`js
import logo from './logo.svg'
const img = <img src={logo} />
\`\`\`

**2. 内联到 HTML（推荐，SVG 本来就适合内联）**

用 \`vite-plugin-svgr\` 插件，把 SVG 转成 React 组件：

\`\`\`bash
npm i -D vite-plugin-svgr
\`\`\`

\`\`\`js
// vite.config.js
import svgr from 'vite-plugin-svgr'
export default defineConfig({
  plugins: [react(), svgr()]
})
\`\`\`

\`\`\`tsx
import Logo from './logo.svg?react'  // 注意 ?react 后缀
function App() {
  return <Logo width={120} fill="#42b883" />
}
\`\`\`

**3. ?raw 拿字符串**

\`\`\`js
import svgStr from './logo.svg?raw'
document.body.innerHTML = svgStr
\`\`\`

### 八、图片压缩

Vite 默认**不压缩**图片，需要插件：

**方案 1：vite-plugin-imagemin**（构建时压缩）

\`\`\`bash
npm i -D vite-plugin-imagemin
\`\`\`

\`\`\`js
import { vitePluginImageMin } from 'vite-plugin-image-min'
export default defineConfig({
  plugins: [
    vitePluginImageMin({
      png: { quality: 0.8 },
      jpeg: { quality: 80 },
      webp: { quality: 75 }
    })
  ]
})
\`\`\`

**方案 2：unplugin-imagemin**（更新维护）

\`\`\`bash
npm i -D unplugin-imagemin
\`\`\`

**方案 3：用 WebP 格式**

提前把图片转成 WebP，体积能砍 30-50%：

\`\`\`html
<picture>
  <source srcset="/logo.webp" type="image/webp" />
  <img src="/logo.png" alt="logo" />
</picture>
\`\`\`

### 九、assetsDir 配置

构建后资源默认放在 \`dist/assets/\`，可以改：

\`\`\`js
build: {
  assetsDir: 'static'  // 改成 dist/static/
}
\`\`\`

### 十、publicDir 配置

\`public/\` 目录路径也能改：

\`\`\`js
publicDir: 'public'  // 默认
publicDir: 'static'  // 改成 static/
publicDir: false     // 禁用 public 目录
\`\`\`

---

### 下一章

图片和静态资源讲完了。下一章学习**字体处理**——本地字体、Google Fonts、字体子集化。`,
    code: `// 演示：模拟 Vite 对静态资源的处理逻辑
console.log("🖼️ Vite 静态资源处理演示");
console.log("=====================================");

// 模拟一个 4KB 内联阈值的判断
const assetsInlineLimit = 4096;

// 模拟项目里的几个静态资源
const assets = [
  { file: 'logo.svg', size: 1200, type: 'svg' },
  { file: 'banner.png', size: 5800, type: 'png' },
  { file: 'icon-16.png', size: 800, type: 'png' },
  { file: 'big-bg.jpg', size: 102400, type: 'jpeg' },
  { file: 'font.woff2', size: 28000, type: 'font' }
];

console.log("\\n按 assetsInlineLimit =", assetsInlineLimit, "处理：");
console.log("-------------------------------------");
assets.forEach(({ file, size }) => {
  const kb = (size / 1024).toFixed(2);
  if (size < assetsInlineLimit) {
    console.log(\`📥 内联 base64  \${file.padEnd(18)} (\${kb} KB)\`);
  } else {
    const hash = Math.random().toString(36).slice(2, 10);
    console.log(\`📦 独立文件      \${file.padEnd(18)} → \${file.replace('.', '-\${hash}.')} (\${kb} KB)\`);
  }
});

console.log("\\n--- 后缀用法 ---");
console.log("?url      → 显式拿资源 URL（不执行/不内联）");
console.log("?raw      → 拿到文件内容的字符串");
console.log("?worker   → 当 Web Worker 引入");
console.log("?worker&inline → worker 内联成 base64");

console.log("\\n--- 目录选择 ---");
console.log("public/      → 原样复制，绝对路径引用，适合 favicon/robots.txt");
console.log("src/assets/  → 编译/hash/内联，import 引入，适合业务图片");

console.log("\\n✅ 记住：4KB 是内联阈值，可通过 build.assetsInlineLimit 调整");`,
  },

  // =========================================================
  // 第二十一章：字体处理
  // =========================================================
  {
    id: "vite2-ch21",
    group: "第四部分 静态资源",
    icon: "🔤",
    title: "第二十一章 字体处理",
    content: `## 第二十一章　字体处理

字体是前端性能和体验的关键一环。Vite 处理字体的方式跟图片类似——\`import\` 拿 URL，构建后加 hash。但字体还有更多讲究：格式选择、预加载、子集化、闪屏问题。

### 一、@font-face 基础

\`\`\`css
/* 在全局 CSS 里定义字体 */
@font-face {
  font-family: 'MyFont';
  src: url('./fonts/MyFont.woff2') format('woff2'),
       url('./fonts/MyFont.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;  /* 关键：避免字体加载时白屏 */
}

body {
  font-family: 'MyFont', sans-serif;
}
\`\`\`

**\`font-display\` 取值**：

| 值 | 行为 | 适用场景 |
|------|------|----------|
| \`auto\` | 浏览器决定（通常像 block）| 默认 |
| \`block\` | 短暂隐藏文字（最多 3s），等字体加载 | 字体是核心体验时 |
| \`swap\` | 立即用回退字体，字体加载完替换（推荐）| 大多数网站 |
| \`fallback\` | 100ms 隐藏，3s 内替换，之后不再换 | 折中 |
| \`optional\` | 100ms 隐藏，网络好就换，否则不换 | 弱网用户体验优先 |

**推荐 \`swap\`**：用户先看到回退字体（不白屏），字体加载完平滑替换。

### 二、本地字体 import

跟图片一样，\`import\` 字体文件得到 URL：

\`\`\`css
/* src/fonts.css */
@font-face {
  font-family: 'MyFont';
  src: url('./fonts/MyFont.woff2') format('woff2');
  font-display: swap;
}
\`\`\`

\`\`\`js
// src/main.js
import './fonts.css'  // 引入字体定义
\`\`\`

构建后 Vite 会把字体文件复制到 \`dist/assets/\`，加 hash 指纹。

### 三、字体格式选择

| 格式 | 压缩率 | 兼容性 | 优先级 |
|------|--------|--------|--------|
| \`woff2\` | 最好（比 ttf 小 30%）| Chrome 36+/Firefox 39+/Safari 12+ | **首选** |
| \`woff\` | 较好 | IE9+/所有现代浏览器 | 备选 |
| \`ttf\` | 无压缩 | 全平台 | 不推荐 |
| \`eot\` | 仅 IE | IE only | 已淘汰 |
| \`svg\` | 已废弃 | - | 不用 |

**结论**：只提供 \`woff2\` 一个格式就够了，95%+ 浏览器支持。需要兼容老 Safari（<12）才加 \`woff\`。

\`\`\`css
@font-face {
  font-family: 'MyFont';
  src: url('./MyFont.woff2') format('woff2');
  /* 现代项目只写这一行 */
}
\`\`\`

### 四、Google Fonts 接入

**方案 1：HTML link 引入（最简单）**

\`\`\`html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap"
  rel="stylesheet"
/>
\`\`\`

**注意**：
- \`preconnect\` 提前建立连接，加快字体加载
- 国内访问 Google Fonts 较慢，可换镜像：\`fonts.googleapis.cn\` 或 \`fonts.font.im\`

**方案 2：CSS @import**

\`\`\`css
/* 不推荐：@import 阻塞渲染 */
@import url('https://fonts.googleapis.com/css2?family=Inter&display=swap');
\`\`\`

**方案 3：自托管（推荐，性能最好）**

把字体文件下载到本地，用 \`@font-face\` 自托管，避免第三方请求：

\`\`\`css
@font-face {
  font-family: 'Inter';
  src: url('./fonts/Inter-Variable.woff2') format('woff2');
  font-weight: 100 900;  /* 可变字体范围 */
  font-display: swap;
}
\`\`\`

工具：[google-webfonts-helper](https://gwfh.mranftl.com) 可下载指定 Google 字体。

### 五、字体预加载

字体文件通常较大，首屏渲染前就开始加载：

\`\`\`html
<!-- index.html -->
<link rel="preload" href="/fonts/MyFont.woff2" as="font" type="font/woff2" crossorigin />
\`\`\`

**关键**：\`crossorigin\` 必须加，否则字体会被加载两次（preload 一次，@font-face 一次）。

### 六、字体子集化（subset）

完整字体文件可能几百 KB，但你的网站可能只用了其中几十个字。**子集化**就是把用到的字提取出来，大幅减小体积。

**场景**：中文字体动辄 5-10MB，子集化后可能只有几十 KB。

**工具 1：fonttools / pyftsubset**

\`\`\`bash
# 安装
pip install fonttools brotli

# 子集化（提取指定字符）
pyftsubset NotoSansSC.ttf \\
  --text-file=chars.txt \\
  --output-file=NotoSansSC-subset.woff2 \\
  --flavor=woff2 \\
  --layout-features='*'
\`\`\`

**工具 2：fontmin（Node）**

\`\`\`bash
npm i -g fontmin
fontmin -t "你好世界前端开发" -s ./input.ttf -d ./output
\`\`\`

**工具 3：vite-plugin-fonts**（开发时自动子集）

\`\`\`bash
npm i -D vite-plugin-fonts
\`\`\`

\`\`\`js
import { VitePluginFonts } from 'vite-plugin-fonts'
export default defineConfig({
  plugins: [
    VitePluginFonts({
      google: { families: ['Inter:400,600,800'] }
    })
  ]
})
\`\`\`

### 七、动态子集化（按需加载）

\`\`\`js
// 根据页面内容动态生成子集字体
async function loadFontSubset(text) {
  const res = await fetch(\`/api/font?text=\${encodeURIComponent(text)}\`)
  const buf = await res.arrayBuffer()
  const fontFace = new FontFace('MyFont', buf)
  await fontFace.load()
  document.fonts.add(fontFace)
}
\`\`\`

适合博客、文章页：每篇文章只加载用到的字。

### 八、iconfont（图标字体）

[iconfont.cn](https://www.iconfont.cn) 是阿里的图标字体平台。

**用法 1：Unicode 引用**

\`\`\`html
<link rel="stylesheet" href="//at.alicdn.com/t/font_xxx.css" />
<i class="iconfont">&#xe600;</i>
\`\`\`

**用法 2：Font class（推荐）**

\`\`\`html
<i class="iconfont icon-home"></i>
\`\`\`

**用法 3：Symbol（最推荐，支持多色）**

\`\`\`html
<svg class="icon" aria-hidden="true">
  <use xlink:href="#icon-home"></use>
</svg>
\`\`\`

**自托管 iconfont**：把下载的 CSS/JS/字体文件放到 \`src/assets/iconfont/\`，\`import './assets/iconfont/iconfont.css'\` 即可。

### 九、可变字体（Variable Font）

可变字体一个文件包含多种字重：

\`\`\`css
@font-face {
  font-family: 'Inter';
  src: url('./Inter-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;  /* 范围 */
}

.text {
  font-family: 'Inter';
  font-weight: 550;  /* 任意值 */
}
\`\`\`

好处：只加载一个文件，可任意字重，体积比多个静态字体小。

---

### 下一章

字体讲完了。下一章学习 **JSON 与静态数据**——如何 import JSON、YAML、CSV 等数据文件。`,
    code: `// 演示：模拟 Vite 字体加载策略
console.log("🔤 Vite 字体处理演示");
console.log("=====================================");

// 模拟 @font-face 配置
const fontFace = {
  fontFamily: 'MyFont',
  src: [
    { url: './MyFont.woff2', format: 'woff2' },
    { url: './MyFont.woff', format: 'woff' }
  ],
  fontDisplay: 'swap'
};

console.log("\\n--- @font-face 配置 ---");
console.log("font-family:", fontFace.fontFamily);
console.log("font-display:", fontFace.fontDisplay, "← 推荐 swap，避免白屏");
fontFace.src.forEach(s => {
  console.log(\`  src: url(\${s.url}) format(\${s.format})\`);
});

// 模拟字体格式选择
console.log("\\n--- 字体格式优先级 ---");
const formats = [
  { name: 'woff2', size: '28 KB', support: '95%+', priority: 1 },
  { name: 'woff',  size: '40 KB', support: '99%+', priority: 2 },
  { name: 'ttf',   size: '60 KB', support: '99%+', priority: 3 },
  { name: 'eot',   size: '40 KB', support: 'IE only', priority: '已淘汰' }
];
formats.sort((a, b) => a.priority - b.priority).forEach(f => {
  console.log(\`  优先级 \${f.priority}  \${f.name.padEnd(8)} 大小 \${f.size.padEnd(8)} 兼容 \${f.support}\`);
});

// 模拟子集化效果
console.log("\\n--- 字体子集化效果 ---");
const before = { name: 'NotoSansSC.ttf', size: 8200000, desc: '完整中文字体' };
const after = { name: 'NotoSansSC-subset.woff2', size: 45000, desc: '仅 100 字子集' };
console.log(\`  子集化前: \${before.name} (\${(before.size/1024/1024).toFixed(2)} MB) - \${before.desc}\`);
console.log(\`  子集化后: \${after.name} (\${(after.size/1024).toFixed(2)} KB)  - \${after.desc}\`);
console.log(\`  体积减少: \${((1 - after.size/before.size) * 100).toFixed(1)}%\`);

console.log("\\n--- font-display 行为 ---");
console.log("  block     → 最多隐藏 3s，加载后替换");
console.log("  swap      → 立即显示回退字体，加载后替换（推荐）");
console.log("  fallback  → 100ms 隐藏，3s 内替换");
console.log("  optional  → 100ms 隐藏，弱网不替换");

console.log("\\n✅ 现代 Web 项目：自托管 woff2 + font-display:swap + 预加载");`,
  },

  // =========================================================
  // 第二十二章：JSON 与静态数据
  // =========================================================
  {
    id: "vite2-ch22",
    group: "第四部分 静态资源",
    icon: "📄",
    title: "第二十二章 JSON 与静态数据",
    content: `## 第二十二章　JSON 与静态数据

Vite 原生支持 JSON 文件 \`import\`，不需要任何插件。此外通过插件还能加载 YAML、TOML、CSV 等格式。本章讲清楚静态数据怎么用。

### 一、JSON 默认导入

\`\`\`json
// src/data/user.json
{
  "name": "张三",
  "age": 28,
  "skills": ["JavaScript", "Vite", "React"]
}
\`\`\`

\`\`\`js
// 默认导入整个对象
import user from './data/user.json'

console.log(user.name)        // 张三
console.log(user.skills[0])   // JavaScript
\`\`\`

Vite 内置处理 JSON，无需配置。

### 二、JSON 具名导入（按属性）

Vite 支持直接解构 JSON 的属性：

\`\`\`js
import { name, age } from './data/user.json'

console.log(name)  // 张三
console.log(age)   // 28
\`\`\`

**注意**：具名导入会被 tree-shaking，构建时只打包用到的字段。

### 三、JSON 字符串转义

JSON 里的特殊字符需要转义：

\`\`\`json
{
  "desc": "He said \\"hello\\"\\nnew line",
  "path": "C:\\\\Users\\\\admin",
  "html": "<div class=\\"box\\"></div>"
}
\`\`\`

| 字符 | 转义 |
|------|------|
| \`"\` | \`\\"\` |
| \`\\\` | \`\\\\\` |
| \`/\\\` | \`\\/\`（可选）|
| 换行 | \`\\n\` |
| Tab | \`\\t\` |
| \`\\uXXXX\` | Unicode 转义 |

**JSON 不允许注释**。如果想要注释，用 \`json5\` 或 \`jsonc\`（VS Code 支持）。

### 四、动态 JSON 加载

需要按需加载 JSON 时用动态 \`import()\`：

\`\`\`js
// 按需加载某个语言的翻译
async function loadI18n(lang) {
  const data = await import(\`./locales/\${lang}.json\`)
  return data.default
}

const en = await loadI18n('en')
const zh = await loadI18n('zh')
\`\`\`

构建后每个 JSON 会拆成独立 chunk，按需加载。

### 五、JSON Schema 校验

大型 JSON 数据建议配 schema 校验，避免类型错误：

\`\`\`ts
// types/user.ts
export interface User {
  name: string
  age: number
  skills: string[]
}

// 用断言
import userRaw from './data/user.json'
const user = userRaw as User
\`\`\`

或用 \`zod\` 运行时校验：

\`\`\`ts
import { z } from 'zod'
import userRaw from './data/user.json'

const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
  skills: z.array(z.string())
})

const user = UserSchema.parse(userRaw)  // 校验失败会抛错
\`\`\`

### 六、YAML 加载

YAML 比 JSON 更适合写配置（支持注释、更简洁）：

\`\`\`yaml
# src/data/config.yaml
site:
  name: 我的网站
  url: https://example.com
features:
  - login
  - search
  - darkMode
\`\`\`

需要 \`@rollup/plugin-yaml\`：

\`\`\`bash
npm i -D @rollup/plugin-yaml
\`\`\`

\`\`\`js
// vite.config.js
import yaml from '@rollup/plugin-yaml'

export default defineConfig({
  plugins: [yaml()]
})
\`\`\`

\`\`\`js
import config from './data/config.yaml'
console.log(config.site.name)  // 我的网站
\`\`\`

### 七、TOML 加载

TOML 是 Rust 生态常用的配置格式：

\`\`\`toml
# src/data/config.toml
title = "My App"

[database]
host = "localhost"
port = 5432
\`\`\`

需要 \`@ltd/j-toml\` 或 \`vite-plugin-toml\`：

\`\`\`bash
npm i -D vite-plugin-toml
\`\`\`

\`\`\`js
import toml from 'vite-plugin-toml'
export default defineConfig({
  plugins: [toml()]
})
\`\`\`

\`\`\`js
import config from './data/config.toml'
console.log(config.title)  // My App
\`\`\`

### 八、CSV 加载

CSV 是表格数据，需要 \`vite-plugin-csv\`：

\`\`\`bash
npm i -D vite-plugin-csv
\`\`\`

\`\`\`js
import csv from 'vite-plugin-csv'
export default defineConfig({
  plugins: [csv({ loadedAs: 'array' })]
})
\`\`\`

\`\`\`csv
# src/data/products.csv
id,name,price
1,iPhone,5999
2,iPad,3999
\`\`\`

\`\`\`js
import products from './data/products.csv'
// 默认是数组：[{ id: '1', name: 'iPhone', price: '5999' }, ...]
\`\`\`

### 九、Markdown 加载

\`\`\`bash
npm i -D vite-plugin-md
\`\`\`

\`\`\`js
import md from 'vite-plugin-md'
export default defineConfig({
  plugins: [md()]
})
\`\`\`

\`\`\`js
// 直接当 React 组件用
import Content from './post.md'
function App() {
  return <Content />
}

// 或者 ?raw 拿字符串
import mdStr from './post.md?raw'
\`\`\`

### 十、数据加载最佳实践

**小数据**（<100KB）：直接 \`import\`，会被打包进 JS。

**中等数据**（100KB-1MB）：放 \`public/\`，用 \`fetch\` 加载。

\`\`\`js
const res = await fetch('/data/cities.json')
const cities = await res.json()
\`\`\`

**大数据**（>1MB）：动态 \`import()\` 拆 chunk，或用 Web Worker 处理。

\`\`\`js
// 按需加载 + 缓存
let cache = null
async function getBigData() {
  if (cache) return cache
  const mod = await import('./data/big.json')
  cache = mod.default
  return cache
}
\`\`\`

---

### 下一章

数据加载讲完了。下一章学习 **Web Worker**——把耗时任务丢到后台线程执行。`,
    code: `// 演示：JSON 数据加载的不同方式
console.log("📄 静态数据加载演示");
console.log("=====================================");

// 模拟一个 JSON 文件内容
const userJson = {
  name: "张三",
  age: 28,
  skills: ["JavaScript", "Vite", "React"],
  meta: { lastLogin: "2026-07-19" }
};

// 1. 默认导入（整对象）
console.log("\\n1️⃣ 默认导入整个对象:");
console.log("   user =", JSON.stringify(userJson, null, 2));

// 2. 具名导入（被 tree-shaking）
console.log("\\n2️⃣ 具名导入（只取用到的字段）:");
const { name, age } = userJson;
console.log("   name =", name, " age =", age);
console.log("   构建时只会打包 name/age，其他字段被 tree-shake 掉");

// 3. 动态加载（按需）
console.log("\\n3️⃣ 动态 import() 按需加载:");
const loadedChunks = new Set();
async function loadLang(lang) {
  if (loadedChunks.has(lang)) {
    console.log(\`   缓存命中: \${lang}\`);
    return { hello: "cached" };
  }
  console.log(\`   加载 chunk: \${lang}.json\`);
  loadedChunks.add(lang);
  return { hello: lang === 'zh' ? "你好" : "Hello" };
}
await loadLang('zh');
await loadLang('zh');  // 第二次走缓存

// 4. 数据格式对比
console.log("\\n4️⃣ 不同数据格式对比:");
const formats = [
  { fmt: 'JSON', plugin: 'Vite 内置',  desc: '默认支持，无注释' },
  { fmt: 'YAML', plugin: '@rollup/plugin-yaml', desc: '支持注释，配置友好' },
  { fmt: 'TOML', plugin: 'vite-plugin-toml',    desc: 'Rust 生态常用' },
  { fmt: 'CSV',  plugin: 'vite-plugin-csv',     desc: '表格数据' },
  { fmt: 'MD',   plugin: 'vite-plugin-md',      desc: '可转 React 组件' }
];
formats.forEach(f => {
  console.log(\`   \${f.fmt.padEnd(6)} | \${f.plugin.padEnd(22)} | \${f.desc}\`);
});

// 5. JSON 转义示例
console.log("\\n5️⃣ JSON 特殊字符转义:");
const rawStr = 'He said "hello" and C:\\\\Users\\\\admin';
const escaped = JSON.stringify(rawStr);
console.log("   原始:", rawStr);
console.log("   转义:", escaped);

console.log("\\n✅ Vite 原生支持 JSON，其他格式需要对应插件");`,
  },

  // =========================================================
  // 第二十三章：Web Worker
  // =========================================================
  {
    id: "vite2-ch23",
    group: "第四部分 静态资源",
    icon: "👷",
    title: "第二十三章 Web Worker",
    content: `## 第二十三章　Web Worker

JavaScript 是单线程的，一个耗时报表计算可能卡死整个页面。Web Worker 让你把任务丢到**后台线程**执行，主线程继续响应用户操作。Vite 对 Worker 有一等公民的支持。

### 一、为什么需要 Web Worker

**问题场景**：
- 解压一个大 ZIP 文件（2 秒）
- 计算 10 万条数据的统计（3 秒）
- 复杂图像处理

如果放主线程做，期间页面**完全卡死**——按钮点不动、滚动无效、动画停顿。

**Web Worker 方案**：把这些任务丢到 Worker 线程，主线程继续流畅。

### 二、Vite 创建 Worker 的标准写法

Vite 推荐用 \`new URL\` + \`import.meta.url\` 的方式：

\`\`\`js
// src/main.js
const worker = new Worker(
  new URL('./worker.js', import.meta.url),
  { type: 'module' }   // 用 ESM 模式的 Worker
)

worker.postMessage({ data: [1, 2, 3, 4, 5] })

worker.onmessage = (e) => {
  console.log('Worker 返回:', e.data)  // 15
}
\`\`\`

\`\`\`js
// src/worker.js
self.onmessage = (e) => {
  const { data } = e
  const sum = data.reduce((a, b) => a + b, 0)
  self.postMessage(sum)
}
\`\`\`

**关键点**：
- \`new URL('./worker.js', import.meta.url)\` 是 Vite 识别 Worker 的语法
- \`{ type: 'module' }\` 让 Worker 支持 \`import\` / \`export\`
- 构建时 Vite 会自动把 worker 拆成独立 chunk

### 三、?worker 后缀（更简洁）

\`\`\`js
import MyWorker from './worker.js?worker'

const worker = new MyWorker()
worker.postMessage({ task: 'compute' })
\`\`\`

\`?worker\` 后缀让 import 直接返回 Worker 构造器，更直观。

### 四、?worker&inline（内联）

\`\`\`js
import MyWorker from './worker.js?worker&inline'
\`\`\`

把 worker 代码内联成 base64 字符串，构建后是**单文件**，没有独立 chunk。适合：
- 部署到严格环境（不允许额外文件）
- Worker 很小，不值得单独 chunk

### 五、Worker 通信详解

**主线程 → Worker**：

\`\`\`js
worker.postMessage({ type: 'compute', payload: data })

// 用 Transferable 转移所有权（零拷贝，性能好）
const buffer = new ArrayBuffer(1024 * 1024)
worker.postMessage({ buffer }, [buffer])  // 注意第二个参数
\`\`\`

**Worker → 主线程**：

\`\`\`js
self.postMessage({ result })

// 也支持 Transferable
self.postMessage({ buffer }, [buffer])
\`\`\`

**双向通信（Promise 封装）**：

\`\`\`js
// 封装一个 Promise 化的 Worker
function createPromiseWorker(worker) {
  const pending = new Map()
  let id = 0
  worker.onmessage = (e) => {
    const { id, result, error } = e.data
    const { resolve, reject } = pending.get(id)
    pending.delete(id)
    error ? reject(error) : resolve(result)
  }
  return {
    send(payload) {
      const currentId = ++id
      return new Promise((resolve, reject) => {
        pending.set(currentId, { resolve, reject })
        worker.postMessage({ id: currentId, payload })
      })
    }
  }
}

const pw = createPromiseWorker(new Worker(new URL('./worker.js', import.meta.url), { type: 'module' }))
const result = await pw.send({ data: [1, 2, 3] })
\`\`\`

### 六、Transferable Objects（零拷贝传输）

大数据传输时，\`postMessage\` 默认会**克隆**数据，开销大。用 Transferable 可以**转移所有权**，零拷贝：

\`\`\`js
// 主线程
const arrayBuffer = new ArrayBuffer(8 * 1024 * 1024)  // 8MB
worker.postMessage({ buf: arrayBuffer }, [arrayBuffer])
// 注意：转移后，主线程的 arrayBuffer 不能再访问
\`\`\`

支持的 Transferable 类型：
- \`ArrayBuffer\`
- \`MessagePort\`
- \`ImageBitmap\`
- \`OffscreenCanvas\`
- \`ReadableStream\` / \`WritableStream\`

### 七、Worker 中使用 import

设置 \`type: 'module'\` 后，Worker 内可以正常 \`import\`：

\`\`\`js
// worker.js
import { heavy } from './utils.js'
import _ from 'lodash-es'  // 第三方库也行

self.onmessage = (e) => {
  const result = heavy(e.data)
  self.postMessage(result)
}
\`\`\`

Vite 会自动处理依赖打包。

### 八、SharedWorker（多标签共享）

普通 Worker 每个标签页独立一份。SharedWorker 可以**多标签共享**同一个 Worker：

\`\`\`js
// 主线程
const worker = new SharedWorker(
  new URL('./shared-worker.js', import.meta.url),
  { type: 'module' }
)
worker.port.onmessage = (e) => console.log(e.data)
worker.port.postMessage({ hello: 'shared' })
\`\`\`

\`\`\`js
// shared-worker.js
const ports = new Set()
self.onconnect = (e) => {
  const port = e.ports[0]
  ports.add(port)
  port.onmessage = (ev) => {
    ports.forEach(p => p.postMessage(ev.data))  // 广播给所有标签
  }
  port.start()
}
\`\`\`

适用场景：跨标签同步状态（如登录、通知）。注意 SharedWorker 调试比较麻烦，浏览器兼容性也稍差。

### 九、worker.format 配置

Vite 默认把 Worker 打包成 ESM 格式。如果想打包成 IIFE（兼容老浏览器），改配置：

\`\`\`js
// vite.config.js
export default defineConfig({
  worker: {
    format: 'es',    // 默认，现代浏览器
    format: 'iife',  // 兼容老浏览器，单文件
    plugins: () => [/* 给 worker 用的插件 */],
    rollupOptions: { /* worker 专用 rollup 配置 */ }
  }
})
\`\`\`

### 十、典型场景示例

**1. 大数据计算**

\`\`\`js
// worker.js - 统计 10 万条数据
self.onmessage = (e) => {
  const data = e.data  // Float32Array
  let sum = 0, max = -Infinity
  for (let i = 0; i < data.length; i++) {
    sum += data[i]
    if (data[i] > max) max = data[i]
  }
  self.postMessage({ sum, max, avg: sum / data.length })
}
\`\`\`

**2. 文件处理（zip/parse）**

\`\`\`js
import Worker from './zip-worker.js?worker'
const worker = new Worker()
const file = input.files[0]
worker.postMessage({ file }, [])  // File 对象自动序列化
\`\`\`

**3. 图像处理**

\`\`\`js
// 用 OffscreenCanvas 在 Worker 里画图
const canvas = mainCanvas.transferControlToOffscreen()
worker.postMessage({ canvas }, [canvas])
\`\`\`

---

### 下一章

Worker 讲完了，我们进入**第五部分 环境与变量**。下一章学习 \`.env\` 文件——把 API 地址、密钥等配置从代码里分离出来。`,
    code: `// 演示：模拟 Web Worker 的通信流程（在 Node 里跑）
console.log("👷 Web Worker 通信演示");
console.log("=====================================");

// 模拟主线程
console.log("\\n[主线程] 创建 Worker...");
console.log("[主线程] 实际写法: new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })");

// 模拟 Worker 线程（用事件机制模拟）
const workerSim = {
  onmessage: null,
  postMessage(data) {
    console.log("[Worker] 收到消息:", JSON.stringify(data));
    // 模拟在 Worker 里执行计算
    setTimeout(() => {
      const result = doHeavyWork(data.payload);
      console.log("[Worker] 计算完成:", result);
      this.onmessage && this.onmessage({ data: { id: data.id, result } });
    }, 100);
  }
};

// 主线程接收 Worker 消息
workerSim.onmessage = (e) => {
  console.log("[主线程] 收到结果:", JSON.stringify(e.data));
};

// 模拟一个耗时计算函数（在 Worker 里执行）
function doHeavyWork(arr) {
  console.log("[Worker] 开始计算，数组长度:", arr.length);
  const sum = arr.reduce((a, b) => a + b, 0);
  const max = Math.max(...arr);
  const avg = sum / arr.length;
  return { sum, max, avg: avg.toFixed(2) };
}

// 主线程发送任务
console.log("\\n[主线程] 发送任务给 Worker...");
workerSim.postMessage({
  id: 1,
  payload: Array.from({ length: 1000 }, (_, i) => i + 1)
});

// 等待异步完成
setTimeout(() => {
  console.log("\\n--- Worker 引入方式 ---");
  console.log("1. new Worker(new URL('./worker.js', import.meta.url), {type:'module'})");
  console.log("2. import MyWorker from './worker.js?worker'");
  console.log("3. import MyWorker from './worker.js?worker&inline'  (内联)");
  console.log("4. new SharedWorker(...)  (多标签共享)");

  console.log("\\n--- 通信要点 ---");
  console.log("• postMessage 默认克隆数据");
  console.log("• Transferable Objects 零拷贝传输（ArrayBuffer 等）");
  console.log("• type:'module' 让 Worker 支持 import");
  console.log("\\n✅ Worker 适合：大数据计算、文件解析、图像处理");
}, 200);`,
  },

  // =========================================================
  // 第二十四章：.env 文件详解
  // =========================================================
  {
    id: "vite2-ch24",
    group: "第五部分 环境与变量",
    icon: "🔐",
    title: "第二十四章 .env 文件详解",
    content: `## 第二十四章　.env 文件详解

项目里总有配置需要从代码里分离出来：API 地址、功能开关、第三方密钥。Vite 用 \`.env\` 文件管理这些，跟 Next.js / Vue CLI 的机制类似但有自己的规则。

### 一、为什么用 .env

**反例（硬编码）**：

\`\`\`js
// ❌ 不要这样写
const API_BASE = 'https://api.example.com'
fetch(\`\${API_BASE}/users\`)
\`\`\`

问题：
1. 改地址要改代码、重新构建
2. 不同环境（dev/staging/prod）需要不同地址
3. 密钥泄露到代码仓库

**正例（用 .env）**：

\`\`\`bash
# .env
VITE_API_BASE=https://api.example.com
\`\`\`

\`\`\`js
fetch(\`\${import.meta.env.VITE_API_BASE}/users\`)
\`\`\`

### 二、.env 文件命名规则

Vite 按以下顺序识别 \`.env\` 文件（项目根目录）：

| 文件 | 作用 | 何时加载 |
|------|------|----------|
| \`.env\` | 所有环境通用的默认值 | 总是 |
| \`.env.local\` | 本地覆盖，不提交到 Git | 总是（被 .gitignore）|
| \`.env.[mode]\` | 特定模式的配置 | 仅该模式 |
| \`.env.[mode].local\` | 特定模式的本地覆盖 | 仅该模式（不提交）|

例如有这些文件：

\`\`\`
.env                  # 通用配置
.env.local            # 本地覆盖（个人开发用）
.env.development      # dev 模式专用
.env.development.local
.env.production       # build 模式专用
.env.staging          # 自定义 staging 模式
\`\`\`

### 三、加载优先级

模式越具体优先级越高。比如 \`vite build\`（production 模式）加载顺序：

\`\`\`
.env                          # 优先级最低
.env.local
.env.production
.env.production.local         # 优先级最高
\`\`\`

**高优先级覆盖低优先级**。同名变量以最具体的文件为准。

### 四、VITE_ 前缀规则

**这是 Vite 的核心规则**：只有以 \`VITE_\` 开头的变量才会暴露给客户端代码。

\`\`\`bash
# .env
VITE_API_BASE=https://api.example.com   # ✅ 暴露给前端
SECRET_KEY=abc123                       # ❌ 不暴露，只在 Node（vite.config）里能用
DB_PASSWORD=xxx                         # ❌ 不暴露
\`\`\`

\`\`\`js
import.meta.env.VITE_API_BASE  // 'https://api.example.com'
import.meta.env.SECRET_KEY     // undefined
\`\`\`

**为什么这样设计**：防止敏感信息（数据库密码、API Secret）意外泄露到前端 bundle。

### 五、修改前缀（不推荐）

\`\`\`js
// vite.config.js
export default defineConfig({
  envPrefix: 'APP_'   // 改成 APP_ 开头才暴露
})
\`\`\`

不推荐改，团队协作时 \`VITE_\` 是共识。

### 六、环境变量使用

\`\`\`bash
# .env.development
VITE_API_BASE=http://localhost:3000
VITE_ENABLE_MOCK=true
\`\`\`

\`\`\`bash
# .env.production
VITE_API_BASE=https://api.example.com
VITE_ENABLE_MOCK=false
\`\`\`

\`\`\`js
// 代码里
const apiBase = import.meta.env.VITE_API_BASE
const enableMock = import.meta.env.VITE_ENABLE_MOCK === 'true'

// 注意：.env 里所有值都是字符串！
// VITE_ENABLE_MOCK=true  → 'true'（字符串），不是 boolean
\`\`\`

### 七、类型声明（vite-env.d.ts）

为了让 TypeScript 认识自定义变量，在 \`src/vite-env.d.ts\` 里声明：

\`\`\`ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string
  readonly VITE_ENABLE_MOCK: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
\`\`\`

之后 \`import.meta.env.VITE_API_BASE\` 会有类型提示。

### 八、加载 .env 的时机

Vite 在启动 \`dev\`/\`build\` 时就加载 \`.env\`，**早于** \`vite.config.js\` 执行。所以可以在 \`vite.config.js\` 里通过 \`loadEnv\` 拿到：

\`\`\`js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  console.log(env.VITE_API_BASE)  // 能拿到
  console.log(env.DB_PASSWORD)    // 也能拿到（包括非 VITE_ 前缀的）

  return {
    // 用 env 拼配置
    define: {
      __APP_VERSION__: JSON.stringify(env.npm_package_version)
    }
  }
})
\`\`\`

\`loadEnv(mode, root, prefix)\`：
- \`mode\`：当前模式
- \`root\`：项目根目录
- \`prefix\`：要加载的前缀，空字符串 \`''\` 表示全部

### 九、安全注意事项

**❌ 不要在前端用到的 .env 里放敏感信息**

\`\`\`bash
# .env
VITE_API_KEY=sk_live_xxx   # ❌ 这个会被打进前端 bundle！
\`\`\`

\`VITE_\` 开头的变量会被构建工具**直接替换成字面量**写进 JS，任何人 F12 都能看到。

**✅ 正确做法**：敏感信息走后端代理

\`\`\`
# .env （仅后端用）
DATABASE_URL=xxx           # 服务器端用，前端访问不到
STRIPE_SECRET=xxx          # 服务器端用

# VITE_ 开头的只能是"前端可以公开"的配置
VITE_API_BASE=/api         # 前端调 /api，后端转发到真实 API
VITE_APP_TITLE=My App      # 公开的标题
\`\`\`

\`\`\`js
// 前端
fetch('/api/users')  // → Vite proxy 转发到真实 API
\`\`\`

### 十、.env 文件示例

\`\`\`bash
# .env
VITE_APP_TITLE=我的应用
VITE_APP_VERSION=$npm_package_version   # 可以引用 package.json 的字段

# .env.development
VITE_API_BASE=http://localhost:3000
VITE_ENABLE_DEVTOOLS=true

# .env.production
VITE_API_BASE=https://api.example.com
VITE_ENABLE_DEVTOOLS=false

# .env.staging （自定义模式）
VITE_API_BASE=https://staging-api.example.com

# .env.local （个人覆盖，不提交）
VITE_API_BASE=http://192.168.1.100:3000  # 我本机 IP
\`\`\`

### 十一、.gitignore 配置

\`\`\`
# .gitignore
.env.local
.env.*.local

# .env、.env.development、.env.production 可以提交（团队共享）
\`\`\`

**最佳实践**：
- \`.env\`、\`.env.production\` 等共享配置：**提交**到 Git
- \`.env.local\`、\`.env.*.local\` 个人配置：**不提交**
- 敏感信息：**绝不**放 \`.env\`，走后端

---

### 下一章

\`.env\` 文件讲完了。下一章深入 \`import.meta.env\` API——拿到这些环境变量后怎么用。`,
    code: `// 演示：模拟 Vite 加载 .env 的过程
console.log("🔐 .env 文件加载演示");
console.log("=====================================");

// 模拟各 .env 文件内容
const envFiles = {
  '.env': {
    VITE_APP_TITLE: 'My App',
    VITE_API_BASE: 'https://default.api.com',
    SECRET_KEY: 'should-not-leak'
  },
  '.env.local': {
    VITE_API_BASE: 'http://localhost:3000'  // 本地覆盖
  },
  '.env.production': {
    VITE_API_BASE: 'https://api.example.com',
    VITE_ENABLE_DEVTOOLS: 'false'
  }
};

// 模拟 Vite 的加载顺序（production 模式）
const mode = 'production';
const loadOrder = ['.env', '.env.local', \`.env.\${mode}\`, \`.env.\${mode}.local\`];

console.log(\`\\n模式: \${mode}\`);
console.log("加载顺序（后覆盖前）:");
const merged = {};
loadOrder.forEach(file => {
  if (envFiles[file]) {
    console.log(\`  ✓ 加载 \${file}\`);
    Object.assign(merged, envFiles[file]);
  } else {
    console.log(\`  · 跳过 \${file}（不存在）\`);
  }
});

console.log("\\n最终合并结果:");
Object.entries(merged).forEach(([k, v]) => console.log(\`  \${k} = \${v}\`));

// 应用 VITE_ 前缀规则
console.log("\\n--- VITE_ 前缀规则 ---");
const exposed = {};
for (const [k, v] of Object.entries(merged)) {
  if (k.startsWith('VITE_')) {
    exposed[k] = v;
    console.log(\`  ✅ 暴露 \${k} = \${v}\`);
  } else {
    console.log(\`  🔒 隐藏 \${k} = *** （非 VITE_ 前缀）\`);
  }
}

// 模拟前端访问
console.log("\\n--- 前端 import.meta.env 访问 ---");
console.log(\`  import.meta.env.VITE_API_BASE = \${exposed.VITE_API_BASE || 'undefined'}\`);
console.log(\`  import.meta.env.VITE_APP_TITLE = \${exposed.VITE_APP_TITLE}\`);
console.log(\`  import.meta.env.SECRET_KEY = \${exposed.SECRET_KEY || 'undefined'} ← 前端拿不到\`);

// 安全提示
console.log("\\n--- 安全提醒 ---");
console.log("  ✗ VITE_API_KEY=sk_xxx     → 会被打进 bundle，任何人可见");
console.log("  ✓ 敏感信息走后端代理      → 前端只调 /api，后端转发");
console.log("\\n✅ 规则：VITE_ 开头 = 可以公开；其他 = 仅服务端可见");`,
  },

  // =========================================================
  // 第二十五章：import.meta.env API
  // =========================================================
  {
    id: "vite2-ch25",
    group: "第五部分 环境与变量",
    icon: "🌐",
    title: "第二十五章 import.meta.env API",
    content: `## 第二十五章　import.meta.env API

\`import.meta.env\` 是 Vite 注入到前端代码里的**全局对象**，包含内置环境变量和你在 \`.env\` 文件里定义的 \`VITE_\` 变量。本章逐一讲清楚每个字段。

### 一、import.meta.env 是什么

\`import.meta\` 是 ESM 标准里的元数据对象，\`import.meta.env\` 是 Vite 扩展的字段。**构建时**会被静态替换成具体值。

\`\`\`js
console.log(import.meta.env)
// 开发时输出：
// {
//   MODE: 'development',
//   BASE_URL: '/',
//   DEV: true,
//   PROD: false,
//   SSR: false,
//   VITE_API_BASE: 'http://localhost:3000'  // 自定义变量
// }
\`\`\`

**注意**：是**构建时替换**，不是运行时读取。所以你看到的 \`import.meta.env.VITE_API_BASE\` 在构建后的 JS 里是字面量 \`'http://localhost:3000'\`。

### 二、内置变量一览

| 变量 | 类型 | 含义 |
|------|------|------|
| \`import.meta.env.MODE\` | \`string\` | 当前模式（development / production / 自定义）|
| \`import.meta.env.BASE_URL\` | \`string\` | 部署基础路径（\`base\` 配置，默认 \`'/'\`）|
| \`import.meta.env.PROD\` | \`boolean\` | 是否生产环境（\`mode === 'production'\`）|
| \`import.meta.env.DEV\` | \`boolean\` | 是否开发环境（\`!PROD\`）|
| \`import.meta.env.SSR\` | \`boolean\` | 是否 SSR 构建 |

### 三、MODE：当前模式

\`\`\`bash
vite             # MODE = 'development'
vite build       # MODE = 'production'
vite --mode test # MODE = 'test'
\`\`\`

\`\`\`js
if (import.meta.env.MODE === 'development') {
  console.log('开发模式，启用 devtools')
}

if (import.meta.env.MODE === 'staging') {
  console.log('预发布环境')
}
\`\`\`

### 四、BASE_URL：部署基础路径

跟 \`vite.config.js\` 里的 \`base\` 配置对应：

\`\`\`js
// vite.config.js
export default defineConfig({
  base: '/my-app/'   // 部署到 /my-app/ 路径下
})
\`\`\`

\`\`\`js
// 代码里
console.log(import.meta.env.BASE_URL)  // '/my-app/'

// 拼接资源路径
const img = new Image()
img.src = \`\${import.meta.env.BASE_URL}logo.png\`
// → '/my-app/logo.png'
\`\`\`

**典型场景**：部署到 GitHub Pages / CDN 子路径，所有资源 URL 都要带前缀。

### 五、DEV / PROD：环境判断

\`\`\`js
if (import.meta.env.DEV) {
  console.log('开发环境，启用 mock')
  setupMock()
}

if (import.meta.env.PROD) {
  // 上报错误到 Sentry
  Sentry.init({ dsn: 'xxx' })
}
\`\`\`

**注意**：\`DEV\` 和 \`PROD\` 是互斥的，\`DEV === !PROD\`。

### 六、SSR：是否服务端渲染

\`\`\`js
if (import.meta.env.SSR) {
  // 服务端渲染时执行的代码
  // 比如：用 node 的 fs 读文件
} else {
  // 浏览器端执行的代码
}
\`\`\`

仅在 SSR 项目（Nuxt / Vite SSR）里有意义。普通 SPA 项目里 \`SSR\` 永远是 \`false\`。

### 七、自定义 VITE_XXX 变量

\`\`\`bash
# .env
VITE_API_BASE=https://api.example.com
VITE_APP_TITLE=我的应用
VITE_ENABLE_MOCK=true
\`\`\`

\`\`\`js
console.log(import.meta.env.VITE_API_BASE)    // 'https://api.example.com'
console.log(import.meta.env.VITE_APP_TITLE)   // '我的应用'
console.log(import.meta.env.VITE_ENABLE_MOCK) // 'true'（字符串！）
\`\`\`

**坑点**：\`.env\` 里所有值都是字符串。

\`\`\`bash
VITE_PORT=3000          # import.meta.env.VITE_PORT === '3000'（字符串）
VITE_ENABLE_MOCK=true   # === 'true'（字符串），不是 boolean
VITE_LIST=[1,2,3]       # === '[1,2,3]'（字符串），不是数组
\`\`\`

需要自己转换：

\`\`\`js
const port = Number(import.meta.env.VITE_PORT)
const enableMock = import.meta.env.VITE_ENABLE_MOCK === 'true'
const list = JSON.parse(import.meta.env.VITE_LIST)
\`\`\`

### 八、类型声明（vite-env.d.ts）

默认情况下，\`import.meta.env.VITE_XXX\` 是 \`any\` 类型。要加类型：

\`\`\`ts
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 内置变量（vite/client 已经声明，不用重复）
  readonly MODE: string
  readonly BASE_URL: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean

  // 自定义变量
  readonly VITE_API_BASE: string
  readonly VITE_APP_TITLE: string
  readonly VITE_ENABLE_MOCK: string
  readonly VITE_PORT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
\`\`\`

声明后，VS Code 会有自动补全和类型检查。

### 九、define 配置（注入全局常量）

如果你想在代码里用全局常量（不通过 \`.env\`），用 \`define\`：

\`\`\`js
// vite.config.js
import pkg from './package.json'

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
})
\`\`\`

\`\`\`js
// 代码里直接用
console.log(__APP_VERSION__)  // '1.2.3'
console.log(__BUILD_TIME__)   // '2026-07-19T...'
\`\`\`

**注意**：值必须 \`JSON.stringify\`，因为这是文本替换。

### 十、运行时 vs 构建时

| 方式 | 时机 | 例子 |
|------|------|------|
| \`import.meta.env.XXX\` | 构建时静态替换 | VITE_ 变量 |
| \`define\` | 构建时静态替换 | 自定义全局常量 |
| \`process.env.XXX\` | **运行时**读取（仅 SSR）| Node 环境 |
| \`window.__XXX__\` | 运行时 | HTML 注入的全局变量 |

**前端 bundle 里没有 \`process.env\`**，除非用 \`define: { 'process.env.XXX': JSON.stringify(value) }\` 显式映射。

### 十一、HTML 里用环境变量

Vite 支持在 \`index.html\` 里用环境变量：

\`\`\`html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>%VITE_APP_TITLE%</title>
  </head>
  <body>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
\`\`\`

构建时 \`%VITE_APP_TITLE%\` 会被替换成 \`.env\` 里的值。

### 十二、动态访问的坑

**❌ 不能用动态键**：

\`\`\`js
const key = 'VITE_API_BASE'
console.log(import.meta.env[key])  // ❌ undefined（构建时替换不了）
\`\`\`

**✅ 必须静态访问**：

\`\`\`js
console.log(import.meta.env.VITE_API_BASE)  // ✅
\`\`\`

因为 Vite 是**构建时静态替换**，动态访问它没法分析。

---

### 下一章

\`import.meta.env\` 讲完了。下一章学习**模式 mode 与多环境**——如何用模式管理 dev/staging/prod 等多套环境。`,
    code: `// 演示：模拟 import.meta.env 的内容（不同模式下）
console.log("🌐 import.meta.env API 演示");
console.log("=====================================");

// 模拟 development 模式下的 import.meta.env
const devEnv = {
  MODE: 'development',
  BASE_URL: '/',
  DEV: true,
  PROD: false,
  SSR: false,
  VITE_API_BASE: 'http://localhost:3000',
  VITE_APP_TITLE: 'My App (Dev)',
  VITE_ENABLE_MOCK: 'true'
};

// 模拟 production 模式下的 import.meta.env
const prodEnv = {
  MODE: 'production',
  BASE_URL: '/my-app/',
  DEV: false,
  PROD: true,
  SSR: false,
  VITE_API_BASE: 'https://api.example.com',
  VITE_APP_TITLE: 'My App',
  VITE_ENABLE_MOCK: 'false'
};

function printEnv(label, env) {
  console.log(\`\\n--- \${label} ---\`);
  console.log("import.meta.env = {");
  Object.entries(env).forEach(([k, v]) => {
    const type = typeof v;
    console.log(\`  \${k.padEnd(20)} : \${type.padEnd(8)} = \${JSON.stringify(v)}\`);
  });
  console.log("}");
}

printEnv("development 模式 (npm run dev)", devEnv);
printEnv("production 模式 (npm run build)", prodEnv);

// 内置变量说明
console.log("\\n=====================================");
console.log("内置变量说明:");
console.log("  MODE     : 当前模式字符串（development/production/自定义）");
console.log("  BASE_URL : 部署基础路径（base 配置）");
console.log("  DEV      : 是否开发环境（!PROD）");
console.log("  PROD     : 是否生产环境（mode === 'production'）");
console.log("  SSR      : 是否 SSR 构建");

// 字符串陷阱
console.log("\\n--- ⚠️ 字符串陷阱 ---");
console.log(\`VITE_ENABLE_MOCK = \${devEnv.VITE_ENABLE_MOCK}\`);
console.log(\`typeof = \${typeof devEnv.VITE_ENABLE_MOCK} ← 是字符串，不是 boolean\`);
console.log("转换方式:");
console.log(\`  const enableMock = import.meta.env.VITE_ENABLE_MOCK === 'true'\`);

// 静态访问提醒
console.log("\\n--- ⚠️ 必须静态访问 ---");
console.log("  ✅ import.meta.env.VITE_API_BASE");
console.log("  ❌ import.meta.env[key]  （动态访问，构建时替换不了）");

console.log("\\n✅ import.meta.env 是构建时静态替换，不是运行时读取");`,
  },

  // =========================================================
  // 第二十六章：模式 mode 与多环境
  // =========================================================
  {
    id: "vite2-ch26",
    group: "第五部分 环境与变量",
    icon: "🎯",
    title: "第二十六章 模式 mode 与多环境",
    content: `## 第二十六章　模式 mode 与多环境

\`mode\` 是 Vite 管理多环境的核心概念。开发用 development，上线用 production，预发布可以用自定义的 staging。本章讲清楚 mode 的方方面面。

### 一、什么是 mode

\`mode\` 是一个字符串，标识当前构建的"环境"。Vite 内置两个模式：

| 命令 | 默认 mode |
|------|-----------|
| \`vite\` | \`development\` |
| \`vite build\` | \`production\` |

可以自定义：

\`\`\`bash
vite --mode staging         # dev server 用 staging 模式
vite build --mode staging   # 构建用 staging 模式
vite build --mode analyze   # 用于打包分析
\`\`\`

mode 决定了：
1. 加载哪个 \`.env.[mode]\` 文件
2. \`import.meta.env.MODE\` 的值
3. \`DEV\` / \`PROD\` 的判断（\`PROD = mode === 'production'\`）

### 二、内置两个模式

**development 模式**（\`npm run dev\`）：

\`\`\`js
import.meta.env.MODE  // 'development'
import.meta.env.DEV   // true
import.meta.env.PROD  // false
\`\`\`

加载 \`.env\` / \`.env.local\` / \`.env.development\` / \`.env.development.local\`。

**production 模式**（\`npm run build\`）：

\`\`\`js
import.meta.env.MODE  // 'production'
import.meta.env.DEV   // false
import.meta.env.PROD  // true
\`\`\`

加载 \`.env\` / \`.env.local\` / \`.env.production\` / \`.env.production.local\`。

### 三、--mode 参数

\`\`\`bash
# 用自定义模式启动 dev server
vite --mode staging

# 用自定义模式构建
vite build --mode staging
\`\`\`

加载 \`.env\` / \`.env.local\` / \`.env.staging\` / \`.env.staging.local\`。

注意：自定义模式（如 staging）的 \`PROD\` 是 \`false\`，除非 mode 等于 \`'production'\`。如果想让 staging 也是生产构建，需要在 \`vite.config.js\` 里手动处理。

### 四、.env.staging 示例

\`\`\`bash
# .env.staging
VITE_API_BASE=https://staging-api.example.com
VITE_APP_TITLE=My App (Staging)
VITE_ENABLE_MOCK=false
\`\`\`

\`\`\`bash
# .env.production
VITE_API_BASE=https://api.example.com
VITE_APP_TITLE=My App
\`\`\`

### 五、package.json scripts 配置多环境

\`\`\`json
{
  "scripts": {
    "dev": "vite",
    "dev:staging": "vite --mode staging",
    "build": "vite build",
    "build:staging": "vite build --mode staging",
    "build:prod": "vite build --mode production",
    "preview": "vite preview"
  }
}
\`\`\`

使用：

\`\`\`bash
npm run dev             # 本地开发
npm run dev:staging     # 连接预发布 API 调试
npm run build:staging   # 构建预发布版本
npm run build:prod      # 构建生产版本
\`\`\`

### 六、条件配置（基于 mode）

\`vite.config.js\` 可以根据 mode 返回不同配置：

\`\`\`js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [react()],

    // 不同环境不同 base
    base: mode === 'production' ? '/my-app/' : '/',

    // 不同环境不同 API 代理
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE,
          changeOrigin: true
        }
      }
    },

    // 生产构建才启用 sourcemap
    build: {
      sourcemap: mode === 'production'
    },

    // 预发布环境注入标记
    define: {
      __IS_STAGING__: JSON.stringify(mode === 'staging')
    }
  }
})
\`\`\`

### 七、command vs mode

\`defineConfig\` 的函数参数有两个：

\`\`\`js
export default defineConfig(({ command, mode }) => {
  // command: 'serve' (dev/preview) | 'build' (vite build)
  // mode: 'development' | 'production' | 自定义

  if (command === 'serve') {
    // dev server 时
  } else {
    // build 时
  }
})
\`\`\`

| | command | mode |
|------|---------|------|
| \`vite\` | \`'serve'\` | \`'development'\` |
| \`vite build\` | \`'build'\` | \`'production'\` |
| \`vite preview\` | \`'serve'\` | \`'production'\` |
| \`vite --mode staging\` | \`'serve'\` | \`'staging'\` |
| \`vite build --mode staging\` | \`'build'\` | \`'staging'\` |

### 八、process.env vs import.meta.env

这是新手最容易混淆的点。

| | \`process.env\` | \`import.meta.env\` |
|------|----------------|---------------------|
| 来源 | Node.js 内置 | Vite 注入 |
| 可用范围 | 仅 Node 端（vite.config.js、SSR）| 前端代码 |
| 内容 | 系统环境变量 + \`.env\` 里的非 VITE_ 变量 | \`.env\` 里的 VITE_ 变量 + 内置变量 |
| 时机 | 运行时 | 构建时静态替换 |

**前端代码里 \`process.env\` 是 undefined**，除非显式 \`define\`：

\`\`\`js
// vite.config.js
export default defineConfig({
  define: {
    'process.env.CUSTOM': JSON.stringify('hello')
  }
})
\`\`\`

\`\`\`js
// 前端代码
console.log(process.env.CUSTOM)  // 'hello'（被 define 替换）
\`\`\`

### 九、多环境构建脚本实战

\`\`\`json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "build:staging": "vite build --mode staging",
    "build:prod": "vite build --mode production",
    "build:analyze": "vite build --mode analyze",
    "preview": "vite preview",
    "preview:staging": "vite preview --mode staging"
  }
}
\`\`\`

配合 \`.env.[mode]\` 文件：

\`\`\`
.env                    # 通用
.env.development        # 开发
.env.staging            # 预发布
.env.production         # 生产
.env.analyze            # 分析专用（开启 sourcemap 等）
\`\`\`

### 十、CI/CD 多环境构建

GitHub Actions 示例：

\`\`\`yaml
# .github/workflows/deploy.yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci

      - name: Build Staging
        if: github.ref == 'refs/heads/staging'
        run: npm run build:staging

      - name: Build Production
        if: github.ref == 'refs/heads/main'
        run: npm run build:prod
\`\`\`

### 十一、mode 命名建议

- \`development\`：本地开发
- \`production\`：正式生产
- \`staging\` / \`preprod\`：预发布
- \`test\`：测试（用于 e2e/单元测试）
- \`analyze\`：打包分析
- \`preview\`：预览演示

**不要**用 \`dev\` / \`prod\`（跟 \`development\` / \`production\` 容易混淆）。

### 十二、根据 mode 切换 API 实现

\`\`\`ts
// src/api/index.ts
const API_BASE = import.meta.env.VITE_API_BASE

export async function request(path: string, options?: RequestInit) {
  const res = await fetch(\`\${API_BASE}\${path}\`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Mode': import.meta.env.MODE,  // 让后端知道前端是什么环境
      ...options?.headers
    }
  })
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
  return res.json()
}
\`\`\`

---

### 下一章

环境与变量部分讲完了！我们进入**第六部分 服务器配置**，下一章学习 \`server\` 配置——端口、代理、HTTPS、CORS 等。`,
    code: `// 演示：mode 与多环境的实际效果
console.log("🎯 Vite 模式 mode 演示");
console.log("=====================================");

// 模拟不同 mode 下的环境配置
const modes = {
  development: {
    desc: "npm run dev",
    command: 'serve',
    PROD: false,
    DEV: true,
    envLoaded: ['.env', '.env.local', '.env.development', '.env.development.local'],
    apiBase: 'http://localhost:3000',
    sourcemap: false
  },
  production: {
    desc: "npm run build",
    command: 'build',
    PROD: true,
    DEV: false,
    envLoaded: ['.env', '.env.local', '.env.production', '.env.production.local'],
    apiBase: 'https://api.example.com',
    sourcemap: true
  },
  staging: {
    desc: "npm run build:staging",
    command: 'build',
    PROD: false,
    DEV: false,
    envLoaded: ['.env', '.env.local', '.env.staging', '.env.staging.local'],
    apiBase: 'https://staging-api.example.com',
    sourcemap: true
  },
  analyze: {
    desc: "npm run build:analyze",
    command: 'build',
    PROD: false,
    DEV: false,
    envLoaded: ['.env', '.env.local', '.env.analyze'],
    apiBase: 'https://api.example.com',
    sourcemap: true
  }
};

// 打印每个模式的信息
Object.entries(modes).forEach(([name, info]) => {
  console.log(\`\\n--- mode = '\${name}' (\${info.desc}) ---\`);
  console.log(\`  command   : \${info.command}\`);
  console.log(\`  PROD      : \${info.PROD}\`);
  console.log(\`  DEV       : \${info.DEV}\`);
  console.log(\`  API_BASE  : \${info.apiBase}\`);
  console.log(\`  sourcemap : \${info.sourcemap}\`);
  console.log(\`  加载 .env : \${info.envLoaded.join(', ')}\`);
});

// package.json scripts 示例
console.log("\\n=====================================");
console.log("推荐的 package.json scripts:");
const scripts = {
  "dev": "vite",
  "dev:staging": "vite --mode staging",
  "build": "vite build",
  "build:staging": "vite build --mode staging",
  "build:prod": "vite build --mode production",
  "build:analyze": "vite build --mode analyze"
};
Object.entries(scripts).forEach(([k, v]) => {
  console.log(\`  \${k.padEnd(20)} : \${v}\`);
});

// process.env vs import.meta.env 对比
console.log("\\n=====================================");
console.log("process.env vs import.meta.env:");
console.log("  process.env     → 仅 Node 端（vite.config.js / SSR）");
console.log("  import.meta.env → 前端代码（构建时静态替换）");
console.log("  前端代码访问 process.env 是 undefined（除非用 define）");

console.log("\\n✅ 多环境管理：mode + .env.[mode] + 条件配置");`,
  },
];
