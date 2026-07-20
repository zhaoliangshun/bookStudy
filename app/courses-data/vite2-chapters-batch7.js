// =============================================================
// Vite 大全集（终极版）—— 第7批章节
// 第八部分 插件系统 + 第九部分 框架集成（共 7 章）
// -------------------------------------------------------------
// 本批包含 7 章：
//   vite2-ch41 : 第四十一章 transformIndexHtml
//   vite2-ch42 : 第四十二章 自定义 HMR API
//   vite2-ch43 : 第四十三章 插件调试与发布
//   vite2-ch44 : 第四十四章 React 集成
//   vite2-ch45 : 第四十五章 Vue 集成
//   vite2-ch46 : 第四十六章 Svelte/Solid 集成
//   vite2-ch47 : 第四十七章 Vanilla TS 与 Lit
// =============================================================

export const chapters = [
  // =========================================================
  // 第四十一章：transformIndexHtml
  // =========================================================
  {
    id: "vite2-ch41",
    group: "第八部分 插件系统",
    icon: "📝",
    title: "第四十一章 transformIndexHtml",
    content: `## 概述

\`transformIndexHtml\` 是 Vite 专门处理 **HTML 入口**的钩子。它能在 \`index.html\` 里注入 \`<script>\`、\`<link>\`，修改 \`<title>\`、\`<meta>\`，是 SEO 优化、注入分析脚本、按环境切换 HTML 的核心入口。

> 一句话：**所有"想改 index.html"的需求，都用这个钩子**。

---

## 钩子签名

\`\`\`js
function myPlugin() {
  return {
    name: 'vite-plugin-html-inject',

    // 方式一：返回字符串（整体替换）
    transformIndexHtml(html) {
      return html.replace('<title>Vite</title>', '<title>我的应用</title>')
    }
  }
}
\`\`\`

更强大的写法是**返回数组**，描述要在哪里插入什么：

\`\`\`js
transformIndexHtml() {
  return [
    {
      tag: 'script',
      attrs: { src: 'https://analytics.example.com/track.js' },
      injectTo: 'head'           // 插入到 <head> 末尾
    },
    {
      tag: 'meta',
      attrs: { name: 'description', content: 'SEO 描述' },
      injectTo: 'head-prepend'   // 插入到 <head> 开头
    }
  ]
}
\`\`\`

---

## injectTo 取值

| 值 | 注入位置 |
|------|----------|
| \`'head'\` | \`<head>\` 末尾 |
| \`'head-prepend'\` | \`<head>\` 开头 |
| \`'body'\` | \`<body>\` 末尾 |
| \`'body-prepend'\` | \`<body>\` 开头 |

---

## enforce：控制执行时机

\`transformIndexHtml\` 支持 \`enforce\`：

\`\`\`js
{
  name: 'my-plugin',
  enforce: 'pre',   // 在 Vite 内置 HTML 处理之前
  transformIndexHtml(html) { /* ... */ }
}
\`\`\`

- \`'pre'\`：在 Vite 注入 module script 之前
- \`'post'\`（默认）：之后

想**抢先**修改原始 HTML（比如改 title 模板），用 \`pre\`；想在**最终** HTML 上加东西（比如分析脚本），用默认 \`post\`。

---

## apply：限定阶段

\`apply\` 控制插件在哪个命令生效：

\`\`\`js
{
  name: 'my-plugin',
  apply: 'build',   // 只在 vite build 时生效
  transformIndexHtml(html) { /* ... */ }
}
\`\`\`

| 值 | 生效场景 |
|------|----------|
| \`'serve'\` | \`vite\`（开发）|
| \`'build'\` | \`vite build\`（构建）|
| 不设 | 都生效 |

比如"只在生产环境注入 GA 统计脚本"：

\`\`\`js
function gaPlugin() {
  return {
    name: 'vite-plugin-ga',
    apply: 'build',
    transformIndexHtml() {
      return [{
        tag: 'script',
        attrs: { async: true, src: 'https://www.google-analytics.com/gtag/js?id=G-XXX' },
        injectTo: 'head'
      }]
    }
  }
}
\`\`\`

---

## order 属性

返回数组时，每条可加 \`order\` 控制多条注入之间的顺序：

\`\`\`js
return [
  { tag: 'meta', attrs: { charset: 'UTF-8' }, injectTo: 'head', order: 'pre' },
  { tag: 'script', attrs: { src: '/track.js' }, injectTo: 'body', order: 'post' }
]
\`\`\`

---

## 实战：注入 EJS 模板变量

很多项目想在 HTML 里用环境变量：

\`\`\`js
function htmlEnvPlugin() {
  return {
    name: 'html-env',
    transformIndexHtml(html) {
      return html
        .replace(/\\{\\{TITLE\\}\\}/g, process.env.VITE_APP_TITLE || '默认标题')
        .replace(/\\{\\{VERSION\\}\\}/g, process.env.npm_package_version)
    }
  }
}
\`\`\`

HTML 里写：

\`\`\`html
<title>{{TITLE}}</title>
<meta name="version" content="{{VERSION}}" />
\`\`\`

---

## ctx 参数

\`transformIndexHtml(html, ctx)\` 的 \`ctx\` 包含：

- \`path\`：当前 HTML 路径
- \`bundle\`：构建产物（仅 \`apply: 'build'\` 时有）
- \`server\`：dev server 实例（仅 \`apply: 'serve'\` 时有）

\`\`\`js
transformIndexHtml(html, ctx) {
  if (ctx.bundle) {
    const jsFiles = Object.values(ctx.bundle).filter(c => c.type === 'chunk')
    console.log('打包产物:', jsFiles.map(c => c.fileName))
  }
  return html
}
\`\`\`

---

## 典型应用场景

1. **SEO 优化**：注入 \`description\`、\`og:\` 系列 meta
2. **分析脚本**：注入 GA、百度统计
3. **CDN 预连接**：注入 \`<link rel="preconnect">\`
4. **环境切换**：dev 用测试域名，prod 用线上域名
5. **SSR 占位**：注入服务端渲染的初始 HTML

---

## 下一章

HTML 能改了，下一章深入**自定义 HMR API**——让非框架代码也能享受热更新。`,
    code: `// 演示：模拟 transformIndexHtml 的注入逻辑
// -----------------------------------------------
var html = [
  '<!DOCTYPE html>',
  '<html>',
  '<head><title>原始</title></head>',
  '<body><div id="app"></div></body>',
  '</html>'
].join('\\n');

// 模拟 transformIndexHtml 返回数组的形式
var injections = [
  { tag: 'meta', attrs: { name: 'description', content: 'SEO 描述' }, injectTo: 'head-prepend' },
  { tag: 'link', attrs: { rel: 'preconnect', href: 'https://cdn.example.com' }, injectTo: 'head' },
  { tag: 'script', attrs: { src: 'https://analytics.example.com/gtag.js' }, injectTo: 'head' }
];

function buildTag(item) {
  var attrs = Object.keys(item.attrs).map(function(k) {
    return ' ' + k + '="' + item.attrs[k] + '"';
  }).join('');
  return '<' + item.tag + attrs + '></' + item.tag + '>';
}

function inject(html, item) {
  var tag = buildTag(item);
  if (item.injectTo === 'head-prepend') {
    return html.replace('<head>', '<head>' + tag);
  }
  if (item.injectTo === 'head') {
    return html.replace('</head>', tag + '</head>');
  }
  return html;
}

var result = html;
injections.forEach(function(item) { result = inject(result, item); });

console.log('📝 注入后的 HTML:');
console.log(result);

console.log('\\n💡 transformIndexHtml 返回数组即可注入任意标签');
console.log("💡 配合 apply: 'build' 可只在生产环境注入分析脚本");`,
  },

  // =========================================================
  // 第四十二章：自定义 HMR API
  // =========================================================
  {
    id: "vite2-ch42",
    group: "第八部分 插件系统",
    icon: "🔥",
    title: "第四十二章 自定义 HMR API",
    content: `## 概述

Vite 的 HMR（Hot Module Replacement，热模块替换）默认对框架代码（Vue SFC、React 组件）自动生效。但如果你写的是**自定义模块**（比如一个 Canvas 渲染器、一个 WebSocket 客户端），就需要用 \`import.meta.hot\` API 手动接入 HMR。

> 一句话：\`import.meta.hot\` 让你的代码"知道怎么热更新自己"。

---

## import.meta.hot.accept

最核心的 API。**接受当前模块（或某依赖）的更新**：

\`\`\`js
import { render } from './render.js'

// 当前模块依赖 render.js，render.js 变了就重新执行回调
import.meta.hot.accept('./render.js', (newMod) => {
  // newMod 是更新后的模块对象
  newMod.render()
})
\`\`\`

接受**自身**更新：

\`\`\`js
import './style.css'

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('当前模块已热更新')
  })
}
\`\`\`

注意 \`import.meta.hot\` 只在 dev 模式存在，build 后是 \`undefined\`，所以要用 \`if (import.meta.hot)\` 守卫。

---

## import.meta.hot.dispose

模块被**替换或销毁**时清理副作用：

\`\`\`js
const timer = setInterval(() => console.log('tick'), 1000)

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearInterval(timer)   // 清理定时器，避免泄漏
  })
}
\`\`\`

**典型场景**：
- 清除 setInterval / setTimeout
- 关闭 WebSocket 连接
- 移除事件监听
- 销毁 DOM 节点

---

## import.meta.hot.data

跨模块实例共享数据。每次热更新创建新模块实例，\`data\` 在新旧实例间传递：

\`\`\`js
if (import.meta.hot) {
  // 第一次加载时初始化
  if (!import.meta.hot.data.state) {
    import.meta.hot.data.state = { count: 0 }
  }
  
  const state = import.meta.hot.data.state
  
  import.meta.hot.dispose(() => {
    // 保存状态供下次实例使用
    import.meta.hot.data.state = state
  })
}
\`\`\`

**用途**：保留计数器状态、表单输入、滚动位置等"热更新前的状态"。

---

## import.meta.hot.prune

模块被**完全移除**（不再被引用）时调用：

\`\`\`js
if (import.meta.hot) {
  import.meta.hot.prune(() => {
    console.log('模块被删除，做最终清理')
  })
}
\`\`\`

区别于 \`dispose\`：\`dispose\` 是"更新前清理"，\`prune\` 是"文件被删/不再引用时的彻底清理"。

---

## HMR 边界

HMR 沿着 **import 图**向上冒泡，直到遇到一个模块**调用了 \`accept\`**——这就是"HMR 边界"。边界模块负责处理更新，**不再向上冒泡**。

\`\`\`
main.js
  └─ app.js
      └─ component.js   ← 这里改了
\`\`\`

- \`component.js\` 改了 → 看 \`app.js\` 有没有 \`accept('./component.js')\`
- 没有 → 继续向上看 \`main.js\`
- 都没有 → **整页刷新**（fallback）

框架插件（如 \`@vitejs/plugin-react\`）已经替你 \`accept\` 了组件模块，所以 JSX 改了能秒级热更新。

---

## 自定义模块的 HMR 完整示例

写一个带状态的热更新计数器：

\`\`\`js
let count = 0

export function getCount() { return count }
export function increment() { count++; render() }

function render() {
  document.getElementById('app').textContent = 'count: ' + count
}

render()

if (import.meta.hot) {
  // 热更新时保留 count 状态
  if (import.meta.hot.data.count !== undefined) {
    count = import.meta.hot.data.count
  }
  
  import.meta.hot.dispose(() => {
    import.meta.hot.data.count = count
  })
  
  import.meta.hot.accept()
}
\`\`\`

---

## 热更新通信原理

\`\`\`
浏览器                       Vite Dev Server
  │                                │
  │  WebSocket (长连接)             │
  │ <─────────────────────────────│
  │                                │
  │ 1. 改文件 → watcher 监听到     │
  │ 2. 服务器找出受影响模块       │
  │ 3. 通过 WS 推送：              │
  │    { type: 'update',           │
  │      updates: [{ path, ... }] }│
  │ <─────────────────────────────│
  │ 4. 浏览器 fetch 新模块代码     │
  │ 5. 执行 accept 回调            │
\`\`\`

**关键**：Vite 通过 WebSocket 通知浏览器，浏览器再发普通 HTTP 请求拿新模块代码。\`import.meta.hot\` 是 Vite 注入的全局对象，封装了这套通信。

---

## 自定义事件

\`import.meta.hot.on(event, cb)\` 监听 Vite 自定义事件：

\`\`\`js
import.meta.hot.on('vite:beforeUpdate', (payload) => {
  console.log('即将更新:', payload)
})

import.meta.hot.on('vite:error', (err) => {
  console.error('编译错误:', err)
})
\`\`\`

常用事件：\`vite:beforeUpdate\`、\`vite:afterUpdate\`、\`vite:beforeFullReload\`、\`vite:error\`。

---

## 下一章

HMR API 会用了，下一章学习**插件调试与发布**——把你的插件打成 npm 包发出去。`,
    code: `// 演示：模拟 import.meta.hot 的工作机制
// -----------------------------------------------
var hotData = {};     // 模拟 import.meta.hot.data
var acceptCb = null;
var disposeCb = null;

// 模拟 import.meta.hot 对象
var importMetaHot = {
  data: hotData,
  accept: function(cb) { acceptCb = cb; },
  dispose: function(cb) { disposeCb = cb; },
  on: function(event, cb) { console.log('  [监听事件]', event); }
};

// 模拟一个带 HMR 的模块
function defineModule() {
  var count = hotData.count !== undefined ? hotData.count : 0;
  
  console.log('  模块加载，当前 count =', count);
  
  importMetaHot.dispose(function() {
    console.log('  💾 dispose: 保存 count 到 hot.data');
    hotData.count = count;
  });
  
  importMetaHot.accept(function() {
    console.log('  ✅ accept: 模块已热更新');
  });
  
  return {
    increment: function() { count++; console.log('  count++ =>', count); }
  };
}

// 第一次加载
console.log('🔥 第一次加载模块:');
var mod = defineModule();
mod.increment();

// 模拟热更新：先 dispose 旧模块，再重新加载
console.log('\\n🔥 触发热更新:');
if (disposeCb) disposeCb();
console.log('  --- 模块重新加载 ---');
mod = defineModule();

console.log('\\n💡 accept/dispose/data 三件套是 HMR 的核心');
console.log('💡 dispose 保存状态，新实例从 data 读取，实现无刷新更新');`,
  },

  // =========================================================
  // 第四十三章：插件调试与发布
  // =========================================================
  {
    id: "vite2-ch43",
    group: "第八部分 插件系统",
    icon: "📦",
    title: "第四十三章 插件调试与发布",
    content: `## 概述

写完插件后，**调试**和**发布**是两道坎。本章讲透：怎么调试插件执行流程、怎么打日志、怎么写测试，最后怎么发到 npm 让别人用。

> 一句话：**调试靠 inspect + 日志，发布靠 package.json + npm publish**。

---

## 调试方法一：console.log

最朴素也最有效。在钩子里打日志：

\`\`\`js
function myPlugin() {
  return {
    name: 'my-plugin',
    resolveId(source, importer) {
      console.log('[my-plugin] resolveId:', source, 'from', importer)
      return null
    },
    transform(code, id) {
      console.log('[my-plugin] transform:', id)
      return null
    }
  }
}
\`\`\`

配合 \`debug\` 库更优雅：

\`\`\`js
import debug from 'debug'
const log = debug('my-plugin')

// 用 DEBUG=my-plugin npm run dev 开启日志
log('transform:', id)
\`\`\`

---

## 调试方法二：vite-plugin-inspect

\`vite-plugin-inspect\` 是 Vite 官方提供的插件调试工具，**可视化插件执行流程**：

\`\`\`bash
npm i -D vite-plugin-inspect
\`\`\`

\`\`\`js
import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [
    inspect(),   // 放在 plugins 数组最后
    // 你的其他插件
  ]
})
\`\`\`

启动 dev 后访问 \`http://localhost:5173/__inspect/\`，能看到：

- 每个模块经过哪些插件的哪个钩子
- 转换前后的代码对比
- 插件执行耗时

---

## 调试方法三：Vite 的 --debug 标志

Vite 内置 debug 日志：

\`\`\`bash
# 看所有插件活动
vite --debug plugin

# 看特定钩子
vite --debug transform
vite --debug resolve

# 看完整加载流程
DEBUG=vite:* npm run dev
\`\`\`

---

## 错误处理

插件出错会中断构建。用 \`this.error\` 优雅报错：

\`\`\`js
function myPlugin() {
  return {
    name: 'my-plugin',
    transform(code, id) {
      if (id.endsWith('.md') && code.includes('TODO')) {
        // 抛错但不会让 Vite 崩溃
        this.error(new Error('文档里不允许 TODO: ' + id))
      }
      if (code.includes('@deprecated')) {
        // 警告，不中断
        this.warn('发现 @deprecated 标记: ' + id)
      }
      return null
    }
  }
}
\`\`\`

- \`this.error(msg)\`：报错并停止当前钩子链
- \`this.warn(msg)\`：警告但继续

---

## 插件测试

用 Vitest 测试插件：

\`\`\`ts
import { describe, it, expect } from 'vitest'
import { build } from 'vite'
import myPlugin from '../src'

describe('my-plugin', () => {
  it('应该在 transform 中注入代码', async () => {
    const result = await build({
      plugins: [myPlugin()],
      build: { write: false, rollupOptions: { input: 'test/fixtures/basic.js' } }
    })
    
    const output = result.output[0]
    expect(output.code).toContain('注入的标记')
  })
})
\`\`\`

**关键**：用真实 \`build()\` 跑一遍，最接近线上行为。

---

## npm 发布前准备

### 1. package.json 关键字段

\`\`\`json
{
  "name": "vite-plugin-xxx",
  "version": "1.0.0",
  "description": "一句话说明插件用途",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "keywords": ["vite", "vite-plugin"],
  "peerDependencies": {
    "vite": "^5.0.0"
  }
}
\`\`\`

**关键点**：
- \`peerDependencies\` 里放 \`vite\`（用户项目里已有）
- \`files\` 只发布 \`dist/\`，别发源码
- \`exports\` 提供 ESM + CJS 双格式

### 2. README 必备内容

\`\`\`md
# vite-plugin-xxx

一句话介绍。

## 安装

\`\\\`\\\`\\\`bash
npm i -D vite-plugin-xxx
\\\`\\\`\\\`

## 用法

\\\`\\\`\\\`js
import xxx from 'vite-plugin-xxx'

export default defineConfig({
  plugins: [xxx()]
})
\\\`\\\`\\\`

## 选项

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| foo | boolean | false | ... |
\`\`\`

---

## 构建插件

插件本身也要打包，推荐 \`tsup\`：

\`\`\`bash
npm i -D tsup typescript
\`\`\`

\`\`\`ts
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true
})
\`\`\`

\`\`\`json
{ "scripts": { "build": "tsup" } }
\`\`\`

---

## 发布流程

\`\`\`bash
# 1. 登录 npm
npm login

# 2. 确认包名没被占用
npm view vite-plugin-xxx

# 3. 构建并测试
npm run build
npm pack        # 打包看看产物对不对

# 4. 发布
npm publish

# 5. 发补丁版本
npm version patch && npm publish
npm version minor && npm publish   # 小版本
npm version major && npm publish   # 大版本
\`\`\`

---

## 版本管理

遵循 **SemVer**（语义化版本）：\`major.minor.patch\`

- \`patch\`：修 bug（不破坏兼容）
- \`minor\`：加功能（向下兼容）
- \`major\`：破坏性改动

用 Changesets 管理多包发布：

\`\`\`bash
npx changeset       # 记录变更
npx changeset version  # 更新版本号
npx changeset publish  # 发布
\`\`\`

---

## 下一章

插件能写能发了，下一章进入**第九部分 框架集成**，从最热门的 React 开始。`,
    code: `// 演示：模拟插件的调试与发布流程
// -----------------------------------------------

// 1. 模拟一个带调试日志的插件
function createPlugin(options) {
  options = options || {};
  var debug = options.debug || false;
  
  return {
    name: 'vite-plugin-demo',
    resolveId: function(source, importer) {
      if (debug) console.log('  [debug] resolveId:', source);
      return null;
    },
    transform: function(code, id) {
      if (debug) console.log('  [debug] transform:', id);
      // 模拟注入代码
      if (id.endsWith('.js')) {
        return code + '\\n// injected by vite-plugin-demo';
      }
      return null;
    }
  };
}

// 2. 模拟运行插件
console.log('🔍 插件调试演示 (debug=false):');
var plugin1 = createPlugin({ debug: false });
plugin1.resolveId('./app.js', '/main.js');
plugin1.transform('var a = 1;', '/src/app.js');
console.log('  (无日志输出，因为 debug 关闭)');

console.log('\\n🔍 插件调试演示 (debug=true):');
var plugin2 = createPlugin({ debug: true });
plugin2.resolveId('./app.js', '/main.js');
var result = plugin2.transform('var a = 1;', '/src/app.js');
console.log('  transform 结果:', result);

// 3. 模拟发布前检查
console.log('\\n📦 发布前检查清单:');
var checklist = [
  'package.json 有 name/version/main/exports',
  'peerDependencies 声明了 vite',
  'files 字段只发布 dist/',
  'README 包含安装/用法/选项',
  'npm run build 产出 dist/',
  'npm pack 检查产物内容',
  'npm login 已登录',
  '版本号遵循 SemVer'
];
checklist.forEach(function(item, i) {
  console.log('  ' + (i + 1) + '. [✓] ' + item);
});

console.log('\\n💡 vite-plugin-inspect 可视化插件执行流程');
console.log('💡 this.error/this.warn 优雅处理插件错误');`,
  },

  // =========================================================
  // 第四十四章：React 集成
  // =========================================================
  {
    id: "vite2-ch44",
    group: "第九部分 框架集成",
    icon: "⚛️",
    title: "第四十四章 React 集成",
    content: `## 概述

React 是 Vite 支持最好的框架之一。通过 \`@vitejs/plugin-react\` 或 \`@vitejs/plugin-react-swc\`，Vite 能做到 **Fast Refresh 秒级热更新**、**JSX 自动转换**、**自动注入 React DevTools**。

> 一句话：**Vite + React 是新项目的默认组合**。

---

## 创建 React 项目

\`\`\`bash
# 用 Vite 脚手架（推荐）
npm create vite@latest my-react-app -- --template react-ts

# 或用 CRA 的替代品（也基于 Vite）
# 已经逐渐被弃用，推荐直接用 Vite
\`\`\`

生成的项目结构：

\`\`\`
my-react-app/
├── src/
│   ├── App.tsx
│   ├── main.tsx          # 入口，挂载到 #root
│   └── App.css
├── index.html
├── vite.config.ts
└── tsconfig.json
\`\`\`

---

## @vitejs/plugin-react

最常用的 React 插件，基于 **Babel**：

\`\`\`bash
npm i -D @vitejs/plugin-react
\`\`\`

\`\`\`ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})
\`\`\`

### 配置选项

\`\`\`ts
react({
  // 是否在 dev 模式注入 React DevTools
  devTools: true,
  
  // Fast Refresh 配置
  fastRefresh: true,
  
  // 是否启用自动 JSX 运行时（react 17+）
  jsxAutomatic: true,
  
  // 自定义 Babel 插件
  babel: {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }]
    ]
  }
})
\`\`\`

---

## React Fast Refresh

**Fast Refresh** 是 React 官方的热更新方案，替代了老的 Hot Reloader：

- **保留组件状态**：改代码不丢 useState
- **错误恢复**：语法错误不崩页，改对后自动恢复
- **即时反馈**：保存到看到效果 < 100ms

工作原理：

\`\`\`
1. 改动 Foo.tsx
2. plugin-react 把组件用 react-refresh 包装
3. Vite HMR 推送到浏览器
4. react-refresh 接收，替换组件定义
5. React 重新渲染该组件，保留 hooks 状态
\`\`\`

---

## @vitejs/plugin-react-swc

基于 **SWC**（Rust 写的编译器，比 Babel 快 10-20 倍）：

\`\`\`bash
npm i -D @vitejs/plugin-react-swc
\`\`\`

\`\`\`ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()]
})
\`\`\`

### Babel vs SWC 对比

| 维度 | @vitejs/plugin-react (Babel) | @vitejs/plugin-react-swc |
|------|------------------------------|---------------------------|
| 速度 | 慢（JS 实现）| 快（Rust 实现）|
| 兼容性 | 极好，支持所有 Babel 插件 | 大部分支持，少数 Babel 插件不行 |
| 生态 | 老 | 新，正在普及 |
| 适用 | 老项目、需要特殊 Babel 插件 | 新项目、追求速度 |

**建议**：新项目用 \`react-swc\`，速度明显快；老项目继续用 Babel 版本。

---

## JSX 自动导入（jsxAutomatic）

React 17+ 后不需要在每个文件顶部写 \`import React\`：

\`\`\`tsx
// 老写法：必须 import React
import React from 'react'
function App() { return <div /> }

// 新写法（jsxAutomatic）：不用 import React
function App() { return <div /> }
\`\`\`

\`@vitejs/plugin-react\` 默认开启（\`jsxAutomatic: true\`）。原理是自动注入：

\`\`\`js
// 编译后（看不到的）
import { jsx as _jsx } from 'react/jsx-runtime'
_jsx('div', {})
\`\`\`

---

## React 18 新特性

Vite + React 18 默认启用：

\`\`\`tsx
// main.tsx
import { createRoot } from 'react-dom/client'   // 注意是 /client
import App from './App'

createRoot(document.getElementById('root')!).render(
  // StrictMode 会在 dev 下双调用，便于发现副作用
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
\`\`\`

**React 18 关键特性**：
- **Concurrent Rendering**：并发渲染
- **Automatic Batching**：自动批处理 setState
- **Suspense for Data Fetching**：数据加载态
- **useTransition / useDeferredValue**：非阻塞更新

---

## 环境变量

Vite 内置环境变量前缀 \`VITE_\`：

\`\`\`bash
# .env
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=我的应用
\`\`\`

\`\`\`tsx
// 代码里用
const api = import.meta.env.VITE_API_URL
document.title = import.meta.env.VITE_APP_TITLE
\`\`\`

注意：\`import.meta.env\` 在 build 时**静态替换**，所以只能用字面量 key，不能动态拼：

\`\`\`ts
// ❌ 不行
import.meta.env['VITE_' + 'KEY']

// ✅ 可以
import.meta.env.VITE_KEY
\`\`\`

---

## 代理配置实战

React 项目对接后端 API，跨域问题用 dev server proxy 解决：

\`\`\`ts
export default defineConfig({
  server: {
    proxy: {
      // /api/* 转发到后端
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 重写路径：/api/users → /users
        rewrite: (path) => path.replace(/^\\/api/, '')
      },
      // WebSocket 代理
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true
      }
    }
  }
})
\`\`\`

前端代码：

\`\`\`ts
// 直接请求 /api，会被代理转发
fetch('/api/users')
  .then(r => r.json())
\`\`\`

---

## 常用 React 生态库

| 库 | 用途 |
|------|------|
| \`react-router-dom\` | 路由 |
| \`@tanstack/react-query\` | 数据请求/缓存 |
| \`zustand\` | 轻量状态管理 |
| \`redux-toolkit\` | 重型状态管理 |
| \`@tanstack/react-table\` | 表格 |
| \`framer-motion\` | 动画 |

---

## 下一章

React 学完了，下一章看 Vite 怎么和它的"亲爹" Vue 集成。`,
    code: `// 演示：模拟 React 项目配置与 Fast Refresh 机制
// -----------------------------------------------

// 1. 模拟 vite.config.ts
var viteConfig = {
  plugins: ['@vitejs/plugin-react-swc'],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  envPrefix: 'VITE_'
};

console.log('⚛️ React 项目 Vite 配置:');
console.log('   插件:', viteConfig.plugins);
console.log('   端口:', viteConfig.server.port);
console.log('   代理:', JSON.stringify(viteConfig.server.proxy));

// 2. 模拟 Fast Refresh 工作流
console.log('\\n🔥 Fast Refresh 工作流:');
var steps = [
  '1. 用户保存 Foo.tsx',
  '2. Vite watcher 检测到文件变化',
  '3. plugin-react-swc 用 SWC 编译组件',
  '4. 包装成 react-refresh 兼容格式',
  '5. WebSocket 推送到浏览器',
  '6. react-refresh 替换组件定义',
  '7. React 重新渲染，保留 useState 状态'
];
steps.forEach(function(s) { console.log('  ' + s); });

// 3. Babel vs SWC 速度对比（模拟数据）
console.log('\\n⚡ Babel vs SWC 编译速度对比:');
var benchmarks = [
  { file: 'App.tsx (50 行)', babel: 45, swc: 3 },
  { file: 'Big.tsx (500 行)', babel: 380, swc: 28 },
  { file: 'Huge.tsx (2000 行)', babel: 1500, swc: 110 }
];
benchmarks.forEach(function(b) {
  var speedup = (b.babel / b.swc).toFixed(1);
  console.log('  ' + b.file.padEnd(20) + ' Babel=' + b.babel + 'ms  SWC=' + b.swc + 'ms  快 ' + speedup + 'x');
});

console.log('\\n💡 新项目推荐 react-swc，速度优势明显');
console.log('💡 老项目继续用 Babel 版，兼容性更好');`,
  },

  // =========================================================
  // 第四十五章：Vue 集成
  // =========================================================
  {
    id: "vite2-ch45",
    group: "第九部分 框架集成",
    icon: "💚",
    title: "第四十五章 Vue 集成",
    content: `## 概述

Vite 是 Vue 作者尤雨溪的作品，**Vue + Vite 是亲儿子级别的支持**。通过 \`@vitejs/plugin-vue\` 处理 SFC（单文件组件），\`@vitejs/plugin-vue-jsx\` 处理 JSX，开箱即用。

> 一句话：**Vue 3 官方推荐用 Vite，不再用 Vue CLI**。

---

## 创建 Vue 项目

\`\`\`bash
# 用 Vite 脚手架
npm create vite@latest my-vue-app -- --template vue-ts

# 或用 Vue 官方的 create-vue（功能更全，含 Router/Pinia/ESLint）
npm create vue@latest my-vue-app
\`\`\`

\`create-vue\` 会问你要不要装 Router、Pinia、Vitest、ESLint、Prettier 等。

---

## @vitejs/plugin-vue

处理 \`.vue\` 文件：

\`\`\`bash
npm i -D @vitejs/plugin-vue
\`\`\`

\`\`\`ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()]
})
\`\`\`

### 配置选项

\`\`\`ts
vue({
  // 是否开启 sourceMap
  sourceMap: true,
  
  // 处理 <template> 的选项
  template: {
    // 编译选项
    compilerOptions: {
      // 自定义元素（不视为组件）
      isCustomElement: (tag) => tag.startsWith('my-')
    }
  }
})
\`\`\`

---

## Vue SFC 支持

Vite 解析 \`.vue\` 文件里的 \`<template>\`、\`<script>\`、\`<style>\` 三段：

\`\`\`vue
<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>

<style scoped>
button { color: red; }
</style>
\`\`\`

**dev 阶段**：Vite 把 SFC 拆成 template / script / style 三个独立请求，按需编译，HMR 精确到段落（改 CSS 不重渲染组件）。

**build 阶段**：Rollup 把它们打包进最终 JS/CSS。

---

## @vitejs/plugin-vue-jsx

如果你想在 Vue 里写 JSX（不是模板）：

\`\`\`bash
npm i -D @vitejs/plugin-vue-jsx
\`\`\`

\`\`\`ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()]
})
\`\`\`

然后就能写 \`.tsx\` 或 \`.jsx\` 文件用 JSX：

\`\`\`tsx
// Foo.tsx
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    return () => <div class="foo">Hello JSX</div>
  }
})
\`\`\`

---

## Vue 3 Composition API

Vite + Vue 3 完整支持 \`<script setup>\` 语法糖：

\`\`\`vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// 直接定义，不用 return
const count = ref(0)
const double = computed(() => count.value * 2)

onMounted(() => console.log('mounted'))
</script>
\`\`\`

---

## defineOptions

Vue 3.3+ 引入 \`defineOptions\`，在 \`<script setup>\` 里声明组件选项：

\`\`\`vue
<script setup>
defineOptions({
  name: 'MyButton',
  inheritAttrs: false
})
</script>
\`\`\`

---

## reactivityTransform（已废弃）

> ⚠️ Vue 3.4 起 \`reactivityTransform\` 已**移除**，下面的写法仅作历史参考。

\`\`\`vue
<!-- 老写法（reactivityTransform）-->
<script setup>
let count = $ref(0)   // 不用 .value
function inc() { count++ }
</script>
\`\`\`

**Vue 3.4+ 推荐用** \`props destructure\` \`defineModel\` 等新 API 替代。

---

## Vue Router 集成

\`\`\`bash
npm i vue-router@4
\`\`\`

\`\`\`ts
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('../views/Home.vue') },
    { path: '/about', component: () => import('../views/About.vue') }
  ]
})

export default router
\`\`\`

\`\`\`ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
\`\`\`

**懒加载**：\`() => import('...')\` 会被 Vite/Rollup 自动拆成单独 chunk，按需加载。

---

## Pinia 集成

Vue 官方推荐的状态管理库（替代 Vuex）：

\`\`\`bash
npm i pinia
\`\`\`

\`\`\`ts
// stores/counter.ts
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: { double: (state) => state.count * 2 },
  actions: {
    increment() { this.count++ }
  }
})
\`\`\`

\`\`\`ts
// main.ts
import { createPinia } from 'pinia'
createApp(App).use(createPinia()).mount('#app')
\`\`\`

\`\`\`vue
<script setup>
import { useCounterStore } from '@/stores/counter'
const counter = useCounterStore()
</script>

<template>
  <button @click="counter.increment()">{{ counter.count }}</button>
</template>
\`\`\`

---

## Vue + Vite 项目结构（推荐）

\`\`\`
src/
├── components/         # 通用组件
├── views/              # 页面级组件（路由用）
├── stores/             # Pinia stores
├── router/             # 路由配置
├── composables/        # 组合式函数（useXxx）
├── api/                # 接口请求
├── assets/             # 静态资源
├── App.vue
└── main.ts
\`\`\`

---

## 下一章

Vue 学完了，下一章看更轻量的两个框架：Svelte 和 Solid。`,
    code: `// 演示：模拟 Vue SFC 解析与 Vue 项目配置
// -----------------------------------------------

// 1. 模拟一个 .vue 文件的解析结果
var sfc = {
  descriptor: {
    filename: 'App.vue',
    template: {
      content: '<div>{{ count }}</div>',
      lang: 'html'
    },
    script: {
      content: 'import { ref } from "vue"; const count = ref(0);',
      lang: 'ts',
      setup: true
    },
    styles: [
      { content: '.foo { color: red; }', scoped: true, lang: 'css' }
    ]
  }
};

console.log('💚 Vue SFC 解析结果:');
console.log('  文件:', sfc.descriptor.filename);
console.log('  script lang:', sfc.descriptor.script.lang, '(setup=' + sfc.descriptor.script.setup + ')');
console.log('  template lang:', sfc.descriptor.template.lang);
console.log('  styles 数量:', sfc.descriptor.styles.length, '(scoped=' + sfc.descriptor.styles[0].scoped + ')');

// 2. 模拟 Vue 项目 Vite 配置
console.log('\\n⚙️ Vue 项目 Vite 配置:');
var config = {
  plugins: ['@vitejs/plugin-vue', '@vitejs/plugin-vue-jsx'],
  features: ['HMR 精确到 SFC 段落', '按需编译', '<script setup> 完整支持']
};
console.log('  插件:', config.plugins);
config.features.forEach(function(f) { console.log('  特性:', f); });

// 3. 模拟 Vue Router 懒加载路由
console.log('\\n🛣️ Vue Router 路由表:');
var routes = [
  { path: '/', name: 'Home', chunk: 'Home.[hash].js' },
  { path: '/about', name: 'About', chunk: 'About.[hash].js' },
  { path: '/user/:id', name: 'User', chunk: 'User.[hash].js' }
];
routes.forEach(function(r) {
  console.log('  ' + r.path.padEnd(15) + ' → ' + r.chunk + ' (懒加载)');
});

console.log('\\n💡 Vue 3 + Vite 是官方推荐组合');
console.log('💡 create-vue 一键生成含 Router/Pinia/ESLint 的完整项目');`,
  },

  // =========================================================
  // 第四十六章：Svelte/Solid 集成
  // =========================================================
  {
    id: "vite2-ch46",
    group: "第九部分 框架集成",
    icon: "🎯",
    title: "第四十六章 Svelte/Solid 集成",
    content: `## 概述

Svelte 和 Solid 是两个**无虚拟 DOM** 的前端框架，体积极小、性能极强。Vite 对它们都有官方支持。本章讲怎么用 Vite 跑这两个框架，以及它们和 React/Vue 的差异。

> 一句话：**Svelte/Solid 适合"小而美"项目，React/Vue 适合"大而全"项目**。

---

## Svelte + @sveltejs/vite-plugin-svelte

### 创建项目

\`\`\`bash
# Vite 模板
npm create vite@latest my-svelte-app -- --template svelte-ts

# 或用 SvelteKit（功能更全，含路由/SSR）
npm create svelte@latest my-app
\`\`\`

### 配置

\`\`\`ts
// vite.config.ts
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()]
})
\`\`\`

### Svelte 组件写法

\`\`\`svelte
<!-- Counter.svelte -->
<script lang="ts">
  let count = 0
  function inc() { count++ }
</script>

<button on:click={inc}>
  count: {count}
</button>

<style>
  button { color: red; }
</style>
\`\`\`

**特点**：
- 编译时优化（不是运行时框架），最终代码量极小
- 没有 \`useState\`、\`ref\` 这类 API，直接赋值就是响应式
- 单文件组件，CSS 默认 scoped

---

## @sveltejs/vite-plugin-svelte 选项

\`\`\`ts
svelte({
  // 热更新配置
  hot: true,
  
  // 编译选项
  compilerOptions: {
    // 是否生成 immutable 优化代码
    immutable: true
  },
  
  // 预处理（支持 TypeScript / SCSS 等）
  preprocess: [
    // 用 vitePreprocess 支持各种 CSS/TS 预处理
    vitePreprocess()
  ]
})
\`\`\`

---

## SvelteKit 简介

\`SvelteKit\` 是 Svelte 的全栈框架（类似 Next.js 之于 React）：

\`\`\`bash
npm create svelte@latest my-app
# 选择：Skeleton / Demo / Library
# 选择：JavaScript / TypeScript
# 选择：是否用 ESLint/Prettier/Playwright/Vitest
\`\`\`

**SvelteKit 特性**：
- **文件路由**：\`src/routes/+page.svelte\` 自动映射 URL
- **SSR / SSG**：服务端渲染、静态生成
- **API Routes**：\`+server.ts\` 写后端接口
- **适配器**：部署到 Vercel / Netlify / Node / 静态托管

| 文件 | 作用 |
|------|------|
| \`src/routes/+page.svelte\` | 页面组件 |
| \`src/routes/+page.ts\` | 页面数据加载（load）|
| \`src/routes/+layout.svelte\` | 布局组件 |
| \`src/routes/+server.ts\` | API 接口 |
| \`src/routes/+error.svelte\` | 错误页 |

---

## Solid + vite-plugin-solid

### 创建项目

\`\`\`bash
# 用 degit 拉模板（Solid 没有官方 create）
npx degit solidjs/templates/ts my-solid-app
cd my-solid-app && npm i

# 或用 Vite 模板
npm create vite@latest my-solid-app -- --template solid
\`\`\`

### 配置

\`\`\`ts
// vite.config.ts
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  // Solid 用 JSX，需要指定 babel preset
  resolve: {
    conditions: ['development', 'browser']
  }
})
\`\`\`

### Solid 组件写法

\`\`\`tsx
// Counter.tsx
import { createSignal } from 'solid-js'

export function Counter() {
  const [count, setCount] = createSignal(0)
  
  return (
    <button onClick={() => setCount(count() + 1)}>
      count: {count()}
    </button>
  )
}
\`\`\`

---

## Solid 特性

- **细粒度响应式**：基于 Signal，不是组件级 diff
- **JSX 编译**：编译成真正的 DOM 操作，不创建虚拟 DOM
- **API 像 React**：\`createSignal\` 对应 \`useState\`，迁移成本低
- **性能极强**：JS Framework Benchmark 长期第一

| 特性 | React | Solid |
|------|-------|-------|
| 响应式 | 组件级 | 细粒度（Signal）|
| 虚拟 DOM | 有 | 无 |
| 状态更新 | 触发组件重渲染 | 只更新依赖处 |
| 语法 | JSX | JSX（相似）|
| 包体积 | ~45kb | ~7kb |

---

## 框架选择建议

| 场景 | 推荐 | 理由 |
|------|------|------|
| 大型团队项目 | React / Vue | 生态成熟、招聘容易 |
| 个人项目 / 作品集 | Svelte / Solid | 体积小、写起来爽 |
| 全栈应用 | Next.js / Nuxt / SvelteKit | 内置 SSR/路由 |
| 高性能场景 | Solid | 性能天花板最高 |
| 内容站 / 博客 | Astro | 默认零 JS，按需 hydrate |
| 库开发 | Vanilla TS | 不绑定框架 |
| 设计系统 | Lit | 标准 Web Components |

---

## Svelte vs Solid 共同点

- 都没有虚拟 DOM
- 都用编译时优化
- 都默认支持 TypeScript
- 体积都比 React 小

## Svelte vs Solid 差异

| 维度 | Svelte | Solid |
|------|--------|-------|
| 语法 | 自己的模板语法 | JSX |
| 响应式 | 编译时检测赋值 | 显式 Signal |
| 全栈方案 | SvelteKit（成熟）| Solid Start（发展中）|
| 学习曲线 | 简单 | 和 React 像，门槛低 |
| 生态 | 大（社区强）| 小（年轻）|

---

## 下一章

主流框架都讲完了，下一章看最"原教旨"的方案——原生 TS 和 Web Components（Lit）。`,
    code: `// 演示：对比 Svelte / Solid / React 的写法与体积
// -----------------------------------------------

console.log('🎯 框架对比：Svelte vs Solid vs React');
console.log('=====================================');

// 1. 同一个计数器组件，三个框架的写法
var counterSamples = {
  svelte: [
    '<script>let count = 0</script>',
    '<button on:click={() => count++}>',
    '  count: {count}',
    '</button>'
  ],
  solid: [
    'function Counter() {',
    '  const [count, setCount] = createSignal(0);',
    '  return <button onClick={() => setCount(count() + 1)}>',
    '    count: {count()}',
    '  </button>;',
    '}'
  ],
  react: [
    'function Counter() {',
    '  const [count, setCount] = useState(0);',
    '  return <button onClick={() => setCount(count + 1)}>',
    '    count: {count}',
    '  </button>;',
    '}'
  ]
};

Object.keys(counterSamples).forEach(function(fw) {
  console.log('\\n[' + fw + '] 写法:');
  counterSamples[fw].forEach(function(line) {
    console.log('  ' + line);
  });
});

// 2. 体积对比（gzip 后约值）
console.log('\\n📦 框架运行时体积对比 (gzip):');
var sizes = [
  { name: 'Svelte', size: '~3kb', note: '编译时框架，运行时极小' },
  { name: 'Solid', size: '~7kb', note: '细粒度响应式' },
  { name: 'Vue 3', size: '~34kb', note: '完整运行时' },
  { name: 'React + ReactDOM', size: '~45kb', note: '需配 ReactDOM' }
];
sizes.forEach(function(s) {
  console.log('  ' + s.name.padEnd(20) + s.size.padEnd(8) + s.note);
});

// 3. 性能基准（JS Framework Benchmark，分数越低越好）
console.log('\\n⚡ 性能基准 (分数越低越快):');
var benchmarks = [
  { name: 'Solid', score: 1.0, note: '基准' },
  { name: 'Svelte', score: 1.1, note: '接近 Solid' },
  { name: 'Vue 3', score: 1.5, note: '虚拟 DOM 优化好' },
  { name: 'React 18', score: 1.9, note: '虚拟 DOM' }
];
benchmarks.forEach(function(b) {
  console.log('  ' + b.name.padEnd(15) + ' ' + b.score.toFixed(1) + 'x  ' + b.note);
});

console.log('\\n💡 Svelte/Solid 体积小、性能强，适合轻量项目');
console.log('💡 React/Vue 生态成熟，适合团队大型项目');`,
  },

  // =========================================================
  // 第四十七章：Vanilla TS 与 Lit
  // =========================================================
  {
    id: "vite2-ch47",
    group: "第九部分 框架集成",
    icon: "🧩",
    title: "第四十七章 Vanilla TS 与 Lit",
    content: `## 概述

不是所有项目都需要 React/Vue。**Vanilla TypeScript**（纯 TS，无框架）适合写库、工具；**Lit** 让你用标准 Web Components 写组件，跨框架复用。Vite 对两者都开箱即用。

> 一句话：**写库用 Vanilla TS，写跨框架组件用 Lit**。

---

## Vanilla TypeScript 项目

### 创建

\`\`\`bash
npm create vite@latest my-lib -- --template vanilla-ts
\`\`\`

### 项目结构

\`\`\`
my-lib/
├── src/
│   ├── main.ts        # 入口
│   └── utils.ts
├── index.html         # 仅 dev 用，演示页面
├── tsconfig.json
└── vite.config.ts
\`\`\`

### 配置（库模式）

\`\`\`ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'MyLib',          // UMD 模式全局变量名
      formats: ['es', 'umd'], // 输出 ESM + UMD
      fileName: (format) => 'my-lib.' + format + '.js'
    },
    rollupOptions: {
      // 把 react/vue 等声明为外部依赖，不打包进库
      external: ['react'],
      output: {
        globals: { react: 'React' }
      }
    }
  }
})
\`\`\`

构建后产出：

\`\`\`
dist/
├── my-lib.es.js     # ESM（给打包工具用）
└── my-lib.umd.js    # UMD（给 <script> 直接引入）
\`\`\`

---

## Vanilla TS 写法

不依赖任何框架，纯 TS：

\`\`\`ts
// src/main.ts
export function greet(name: string): string {
  return 'Hello, ' + name + '!'
}

// 操作 DOM
export function mount(el: HTMLElement) {
  el.innerHTML = '<h1>' + greet('World') + '</h1>'
}
\`\`\`

\`\`\`ts
// 用法（在浏览器里）
import { mount } from 'my-lib'
mount(document.getElementById('app')!)
\`\`\`

---

## Lit 简介

\`Lit\` 是 Google 出品的库，让你用**标准 Web Components** 写组件：

\`\`\`bash
npm create vite@latest my-lit-app -- --template lit-ts
cd my-lit-app && npm i
\`\`\`

\`\`\`ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  // Lit 模板开箱即用，无需额外插件
  // Vite 已内置 TS + 装饰器支持
})
\`\`\`

> Vite 的 \`lit-ts\` 模板已经配好了 \`tsconfig\` 的 \`experimentalDecorators\`，直接写就行。

---

## Lit 元素开发

\`\`\`ts
// src/my-button.ts
import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('my-button')
export class MyButton extends LitElement {
  // 响应式属性
  @property({ type: String })
  label = 'Click me'

  @property({ type: Boolean })
  disabled = false

  // Shadow DOM 样式（隔离）
  static styles = css\`
    button {
      background: #409eff;
      color: white;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.5;
    }
  \`

  render() {
    return html\`
      <button ?disabled=\${this.disabled} @click=\${this._onClick}>
        \${this.label}
      </button>
    \`
  }

  private _onClick() {
    this.dispatchEvent(new CustomEvent('my-click', {
      bubbles: true,
      composed: true
    }))
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-button': MyButton
  }
}
\`\`\`

---

## Web Components 三要素

### 1. Custom Elements（自定义元素）

\`\`\`ts
class MyElement extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<h1>Hello</h1>'
  }
}

// 注册自定义元素
customElements.define('my-element', MyElement)
\`\`\`

\`\`\`html
<!-- 使用 -->
<my-element></my-element>
\`\`\`

### 2. Shadow DOM（影子 DOM）

样式和 DOM 隔离：

\`\`\`ts
class MyEl extends HTMLElement {
  constructor() {
    super()
    // 开启 Shadow DOM
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.innerHTML = \`
      <style>
        /* 不会影响外部 */
        p { color: red; }
      </style>
      <p>Shadow content</p>
    \`
  }
}
\`\`\`

\`\`\`ts
// Lit 默认开启 Shadow DOM
class MyLit extends LitElement {
  // this.shadowRoot 已自动创建
}
\`\`\`

### 3. HTML Templates（模板）

\`\`\`html
<template id="my-tmpl">
  <style>p { color: red; }</style>
  <p>模板内容</p>
</template>

<script>
  const tmpl = document.getElementById('my-tmpl')
  document.body.appendChild(tmpl.content.cloneNode(true))
</script>
\`\`\`

---

## CSS 自定义属性（穿透 Shadow DOM）

Shadow DOM 默认隔离样式，但 CSS 变量能穿透：

\`\`\`ts
// Lit 组件
static styles = css\`
  button {
    background: var(--my-button-bg, #409eff);   /* 默认值 */
    color: var(--my-button-color, white);
  }
\`
\`\`\`

外部使用：

\`\`\`html
<style>
  /* 覆盖组件内部样式（通过 CSS 变量穿透 Shadow DOM）*/
  my-button {
    --my-button-bg: red;
    --my-button-color: yellow;
  }
</style>

<my-button></my-button>
\`\`\`

---

## Shadow DOM 的样式隔离

**好处**：
- 组件样式不会泄漏到外部
- 外部样式不会污染组件
- CSS 选择器简单，不怕冲突

**代价**：
- 外部样式进不来（除 CSS 变量）
- \`::part()\` 才能从外部选内部节点

\`\`\`ts
// 组件暴露 part
render() {
  return html\`<div part="container">...</div>\`
}
\`\`\`

\`\`\`css
/* 外部样式 */
my-button::part(container) {
  border: 1px solid red;
}
\`\`\`

---

## Lit vs 框架对比

| 维度 | Lit | React/Vue |
|------|------|-----------|
| 标准 | Web Components（W3C）| 框架私有 |
| 跨框架 | ✅ 任意框架用 | ❌ 绑定框架 |
| 体积 | ~5kb | ~40kb+ |
| 学习曲线 | 中（需懂 WC）| 低 |
| 生态 | 小 | 大 |
| 适用 | 组件库 / 设计系统 | 业务应用 |

---

## 跨框架复用示例

Lit 组件能在 React/Vue/原生里用：

\`\`\`tsx
// React 里用 Lit 组件（无需适配）
import './my-button.ts'

function App() {
  return <my-button label="React 按钮" />
}
\`\`\`

\`\`\`vue
<!-- Vue 里用同一个 Lit 组件 -->
<script setup>
import './my-button.ts'
</script>
<template>
  <my-button label="Vue 按钮" />
</template>
\`\`\`

**这就是 Lit 的核心价值**：写一次，到处用。

---

## 第九部分结语

到这里，**Vite + 主流框架**的集成讲完了。回顾：

- React：\`@vitejs/plugin-react\` 或 \`react-swc\`
- Vue：\`@vitejs/plugin-vue\` + \`vue-jsx\`
- Svelte：\`@sveltejs/vite-plugin-svelte\`
- Solid：\`vite-plugin-solid\`
- Lit：开箱即用
- Vanilla TS：开箱即用

下一部分我们进入**第十部分 工程化**，讲 ESLint、Prettier、TypeScript、Tailwind、Vitest、Docker 等让团队协作更顺的配置。`,
    code: `// 演示：模拟 Web Components 的注册与使用
// -----------------------------------------------

// 1. 模拟自定义元素注册
var customElementsRegistry = {};

function defineCustomElement(tagName, constructor) {
  customElementsRegistry[tagName] = constructor;
  console.log('✅ 注册自定义元素: <' + tagName + '>');
}

// 2. 模拟一个 Lit 风格的组件类
function createMyButton() {
  return {
    properties: { label: 'Click me', disabled: false },
    styles: ['button { background: var(--btn-bg, #409eff); }'],
    render: function() {
      return '<button>' + this.properties.label + '</button>';
    },
    // 通过 CSS 变量穿透 Shadow DOM
    setTheme: function(bg) {
      this.style.setProperty('--btn-bg', bg);
    }
  };
}

// 注册
defineCustomElement('my-button', createMyButton);
defineCustomElement('my-input', function() {
  return { properties: { value: '' }, render: function() { return '<input>'; } };
});

// 3. 模拟使用
console.log('\\n📦 已注册的自定义元素:');
Object.keys(customElementsRegistry).forEach(function(tag) {
  console.log('  <' + tag + '>');
});

// 4. 模拟创建组件实例
console.log('\\n🛠️ 创建 <my-button> 实例:');
var btn = customElementsRegistry['my-button']();
console.log('  默认 label:', btn.properties.label);
console.log('  默认 disabled:', btn.properties.disabled);
console.log('  render 输出:', btn.render());

// 5. 模拟 CSS 变量穿透 Shadow DOM
console.log('\\n🎨 CSS 变量穿透 Shadow DOM:');
console.log('  组件内部:', btn.styles[0]);
console.log('  外部覆盖:', 'my-button { --btn-bg: red; }');
btn.setTheme('red');
console.log('  → 组件背景变红，但内部样式不污染外部');

// 6. 跨框架复用
console.log('\\n🌐 跨框架复用:');
var frameworks = ['React', 'Vue', 'Svelte', 'Vanilla TS'];
frameworks.forEach(function(fw) {
  console.log('  ' + fw + ': <my-button label="' + fw + ' button"></my-button>');
});

console.log('\\n💡 Lit 组件基于 W3C 标准，可在任意框架中复用');
console.log('💡 Shadow DOM 隔离样式，CSS 变量穿透');`,
  },
];
