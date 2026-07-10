// =============================================================
// Vue 源码构建教程（vuesrc）—— 第一批章节（开篇 + 响应式系统，共 5 章）
// -------------------------------------------------------------
// 主题：从零开始一步步构建 Vue 核心源代码，最终完成一个 Mini Vue
// 面向：想深入理解 Vue 底层原理的开发者
//
// 本文件包含以下章节：
//   1. vs-what-is-vue       — Vue 到底是什么：渐进式框架的本质
//   2. vs-project-setup     — 从零开始：搭建 Mini Vue 项目
//   3. vs-reactivity-intro  — 响应式原理：数据驱动的基石
//   4. vs-reactive-function — 手写 reactive：Proxy 代理对象
//   5. vs-effect-track      — 依赖收集：effect 与 track
//
// 每个章节对象的结构：
//   id      : 唯一标识（vs- 前缀代表 vue source）
//   group   : 分组名
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解
//   code    : 可直接用 node 运行的 JS 示例代码，用 console.log 输出
//
// 代码运行环境约束：
//   - Node.js vm 沙箱中运行，5 秒超时
//   - 仅可 require: fs, path, os, url, crypto, util, events, stream,
//     buffer, querystring, string_decoder, zlib, assert, timers
//   - 全局可用: console, process, Buffer, setTimeout, URL, Promise 等
//   - 没有浏览器 DOM，所以 demo 用纯 JS 对象模拟视图节点
//
// 转义约定（非常重要）：
//   - code 字段中所有反引号必须转义为 \`
//   - code 字段中所有 ${} 必须转义为 \${}
//   - content 字段中的代码块用三个反引号（\`\`\`）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：Vue 到底是什么：渐进式框架的本质
  // =========================================================
  {
    id: "vs-what-is-vue",
    group: "开篇：Vue 的核心本质",
    icon: "🎯",
    title: "Vue 到底是什么：渐进式框架的本质",
    content: `
# Vue 到底是什么：渐进式框架的本质

## 一、从一个最常见的误解说起

很多开发者第一次接触 Vue 时，会把它简单地理解成"一个让写页面更快的工具"——双花括号 \`{{ }}\` 能把变量渲染到页面上，\`v-on\` 能绑定事件，\`v-model\` 能做双向绑定，用起来比 jQuery 爽多了。这种理解没错，但太浅。它把 Vue 当成了一个"语法糖集合"，而忽略了 Vue 真正的设计哲学。

Vue 官方文档对自己的定位只有一句话：**"The Progressive Framework"**（渐进式框架）。注意两个关键词：**Progressive（渐进式）** 和 **Framework（框架）**。这两个词合在一起，才是 Vue 区别于 React、Angular 的根本特征。本章我们要把这两个词彻底讲透，因为后续所有源码的设计动机，都源于这两个词。

先说为什么 Vue 是"框架"而不是"库"。上一段我们对比过：库是你调用它的代码，主动权在你；框架是它调用你的代码，主动权在框架。Vue 明显属于后者——你写的是一个配置对象（Options API）或一组组合函数（Composition API），真正调度执行的是 Vue 的运行时：它决定什么时候创建响应式数据、什么时候编译模板、什么时候挂载到 DOM、什么时候触发更新。你写的是"零件"，Vue 提供的是"流水线"。

## 二、渐进式：自助餐式的能力取用

### 2.1 生活类比：自助餐与套餐

理解"渐进式"最好的方式，是想象两种餐厅。

**套餐制餐厅（全有或全无）**：你走进去，服务员端上来一套固定搭配——前菜、主菜、甜点、饮料，一样不能少。你哪怕只想吃个主菜，也得为前菜和甜点买单。这种模式的好处是省心，坏处是不灵活。Angular 就是典型的"套餐制框架"——它内置了路由、表单、HTTP、依赖注入、国际化、动画……你要么全用，要么别用，中间状态很痛苦。

**自助餐餐厅（按需取用）**：你走进去，面前是一排档口：凉菜档、热菜档、海鲜档、甜点档、饮品档。你可以只端一盘炒饭坐下来吃，也可以每样都来一点，还可以先吃凉菜再决定要不要上海鲜。能力都在那里，但取不取、取多少、什么顺序取，完全由你决定。**Vue 就是这种自助餐式的框架**——这就是"渐进式"的含义。

### 2.2 Vue 的六个能力档口

Vue 把自己的能力拆成了若干个"档口"，你可以按需取用：

| 层级 | 你取用的能力 | 典型场景 | 你不需要的部分 |
| --- | --- | --- | --- |
| L1 | 仅用核心视图层（响应式 + 模板） | 一个简单的交互页面 | 路由、状态管理、构建工具 |
| L2 | 核心 + 组件系统 | 多页面、可复用组件 | 路由、状态管理 |
| L3 | 核心 + 组件 + Vue Router | 单页应用（SPA） | 全局状态管理 |
| L4 | 核心 + 组件 + Router + Pinia | 复杂单页应用 | SSR |
| L5 | 上述全部 + Vite 构建工具 | 工程化项目 | SSR |
| L6 | 上述全部 + Nuxt SSR | 服务端渲染、SEO 优化 | 无 |

重点在最后一列——**"你不需要的部分"**。在 Vue 里，如果你不需要路由，就完全不引入 Vue Router，项目的体积和复杂度不会因此增加一分。这就是渐进式的核心价值：**能力的增加是可选的、叠加的，而不是绑定的、全量的**。

这一点和 React 形成鲜明对比。React 本身只是个视图库（library），它确实也"渐进"——但它的渐进是把能力外包给生态（React Router、Redux、Zustand、Next.js……），每个能力都由不同团队维护，风格不一、质量参差。Vue 的渐进是"官方提供全套档口"，每个档口都是 Vue 团队自己做的，风格统一、文档一致、版本同步。这是 Vue 的设计取舍：**用官方的统一性，换取生态的多样性**。

### 2.3 渐进式在源码结构上的体现

"渐进式"不只是营销话术，它直接反映在 Vue 的源码包结构上。Vue 3 的源码被拆成了若干个独立可发布的包：

\`\`\`text
@vue/reactivity    响应式系统（可脱离 Vue 单独使用）
@vue/compiler-core 编译核心（平台无关）
@vue/compiler-dom  浏览器平台编译
@vue/compiler-sfc  单文件组件编译
@vue/runtime-core  运行时核心（平台无关）
@vue/runtime-dom   浏览器运行时
@vue/shared        工具函数
vue                整合包（把上面打包成完整 Vue）
\`\`\`

注意第一条：\`@vue/reactivity\` 可以脱离 Vue 单独使用。这意味着你可以在一个纯 Node.js 项目里，用 \`npm install @vue/reactivity\` 装上响应式系统，用它来监听数据变化，完全不碰任何 DOM 和模板。这就是渐进式在源码层面的承诺——响应式能力是一个独立档口，不绑定其他任何东西。

本教程的后续章节，正是从这个最独立的档口（响应式系统）开始构建的。

## 三、Vue 的三大核心系统

Vue 内部有三大核心系统，理解它们的分工，就理解了 Vue 运行的主线。我们用"一家餐厅的后厨"来类比。

### 3.1 响应式系统（Reactivity System）—— 食材管理员

**职责**：跟踪数据的变化，并在数据变化时通知相关方。

**类比**：餐厅后厨的食材管理员。他负责盯着冷库里的食材（数据），一旦发现西红柿（某个属性）被取用或被补充，就立刻通知正在做这道菜的厨师（副作用）。管理员不关心菜怎么做，也不关心菜端给谁，他只负责"食材变了 → 通知相关厨师"。

**源码位置**：\`@vue/reactivity\` 包。核心 API 是 \`reactive\`、\`ref\`、\`effect\`、\`computed\`。

### 3.2 模板编译系统（Compiler System）—— 菜谱翻译员

**职责**：把开发者写的模板（HTML + 指令）翻译成可执行的渲染函数。

**类比**：餐厅里的菜谱翻译员。主厨用中文写了一份菜谱（模板），但后厨的执行系统只看得懂标准化的操作指令（渲染函数）。翻译员把"西红柿炒蛋"翻译成"取鸡蛋2个→打散→取西红柿1个→切块→热油→先炒蛋→再下西红柿→翻炒→出锅"这样的步骤序列。翻译只在开张前做一次（编译时），之后后厨就照着翻译好的指令重复执行。

**源码位置**：\`@vue/compiler-core\` + \`@vue/compiler-dom\`。核心是 \`compile\` 函数，输入模板字符串，输出渲染函数。

### 3.3 虚拟 DOM 与渲染系统（Virtual DOM & Renderer）—— 执行厨师

**职责**：根据渲染函数描述的虚拟节点树，创建/更新/删除真实 DOM。

**类比**：后厨真正动手做菜的厨师。他拿到翻译员给的标准化操作指令（渲染函数返回的虚拟节点树），照着指令把真实的菜（真实 DOM）做出来。如果指令变了（数据更新导致渲染函数重新执行），他会对比新旧两份指令的差异，只改动需要改动的步骤（patch/diff），而不是把整道菜倒掉重做。

**源码位置**：\`@vue/runtime-core\` + \`@vue/runtime-dom\`。核心是 \`h\` 函数（创建虚拟节点）、\`patch\` 函数（diff 并更新 DOM）。

### 3.4 三大系统的协作流程

把三者串起来，Vue 的一次完整运行是这样的：

\`\`\`text
  数据 (data)                  模板 (template)
     │                              │
     ▼                              ▼
  响应式系统                   模板编译系统
  (reactive)                  (compile)
     │                              │
     │  跟踪 data 变化               │  翻译成渲染函数 render()
     │                              │
     └──────────┬───────────────────┘
                │
                ▼
          effect(() => render())
         （当 data 变化时自动触发）
                │
                ▼
          渲染函数返回虚拟节点树 VNode
                │
                ▼
          虚拟 DOM 系统 (patch)
          对比新旧 VNode，更新真实 DOM
                │
                ▼
            用户看到的视图
\`\`\`

这条主线是本教程的"地图"。我们会沿着"响应式 → 编译 → 渲染"的顺序，逐个构建这三大系统，最后把它们拼成一个能跑的 Mini Vue。

## 四、Vue 2 vs Vue 3：一次脱胎换骨的架构升级

如果你用过 Vue 2，可能会好奇 Vue 3 到底改了什么。这不是简单的版本迭代，而是一次从架构到 API 的全面重构。理解这次升级的动机，能帮你明白 Vue 3 源码为什么是今天这个样子。

### 4.1 API 风格：Options API vs Composition API

**Vue 2 的 Options API**：你写一个组件，就是写一个包含 \`data\`、\`methods\`、\`computed\`、\`watch\` 等选项的对象。

\`\`\`js
// Vue 2 的 Options API
export default {
  data() {
    return { count: 0, name: 'Vue' }
  },
  methods: {
    increment() { this.count++ }
  },
  computed: {
    double() { return this.count * 2 }
  }
}
\`\`\`

**问题**：当一个组件逻辑变复杂（比如有计数逻辑 + 用户逻辑 + 请求逻辑），相关代码被强行拆散到 \`methods\`、\`computed\`、\`watch\` 三个选项里。你要理解"计数"这一件事，得在三个地方跳来跳去读，逻辑复用只能靠 mixin，而 mixin 有命名冲突、来源不清晰等老毛病。

**Vue 3 的 Composition API**：你按"逻辑关注点"组织代码，用 \`setup\` 函数把相关逻辑聚到一起。

\`\`\`js
// Vue 3 的 Composition API
import { ref, computed } from 'vue'
export default {
  setup() {
    // 计数逻辑聚在一起
    const count = ref(0)
    const double = computed(() => count.value * 2)
    function increment() { count.value++ }
    return { count, double, increment }
  }
}
\`\`\`

**优势**：相关逻辑聚拢，可提取成独立的"组合函数"（composable），复用清爽、类型推断友好。

### 4.2 响应式实现：Object.defineProperty vs Proxy

这是 Vue 3 最底层的升级，也是本教程第 3-5 章的核心主题。

| 维度 | Vue 2 (defineProperty) | Vue 3 (Proxy) |
| --- | --- | --- |
| 拦截范围 | 只能拦截已存在的属性 | 拦截整个对象的所有操作 |
| 新增属性 | 无法检测，需 \`Vue.set\` | 自动响应 |
| 删除属性 | 无法检测，需 \`Vue.delete\` | 自动响应 |
| 数组索引修改 | 无法检测 | 自动响应 |
| 数组 length 修改 | 无法检测 | 自动响应 |
| Map/Set 支持 | 不支持 | 原生支持 |
| 嵌套对象 | 初始化时深度遍历 | 懒代理，访问时才代理 |
| 性能 | 初始化开销大 | 初始化快，访问时按需代理 |

这张表的每一行，都是 Vue 2 用户踩过的坑。Vue 3 用 Proxy 一次性解决了所有这些限制——这也是为什么我们要花三章篇幅手写响应式系统。

### 4.3 架构：整体对象 vs 模块化包

- **Vue 2**：一个整体的对象，所有功能挂在一个 \`Vue\` 构造函数上，无法单独使用某一部分。
- **Vue 3**：拆成多个独立包（见 2.3 节），响应式系统可单独使用，编译器和运行时可按需组合，支持自定义渲染器（渲染到 canvas、WebGL、终端）。

### 4.4 其他重要变化

- **Tree-shaking**：Vue 3 全部用 ES Module 写，没用到的 API 不会打进最终包，体积更小。
- **TypeScript 重写**：Vue 2 是 Flow，Vue 3 全部 TS，类型定义更完善。
- **多根节点（Fragment）**：Vue 2 模板只能有一个根节点，Vue 3 可以多个。
- **Teleport / Suspense**：新增传送门和异步组件挂起能力。

## 五、Vue 源码整体结构概览

最后，我们鸟瞰一下 Vue 3 源码的目录结构，建立全局认知。本教程后续每一章，都会落在这个结构的某个位置。

\`\`\`text
packages/
├── reactivity/          响应式系统（第 3-8 章手写）
│   ├── src/
│   │   ├── reactive.ts      reactive() 函数
│   │   ├── ref.ts           ref() 函数
│   │   ├── effect.ts        effect / track / trigger
│   │   ├── computed.ts      computed 计算属性
│   │   ├── baseHandlers.ts  Proxy 拦截器
│   │   └── dep.ts           依赖管理
├── compiler-core/       编译核心（第 9-14 章手写）
│   ├── src/
│   │   ├── parse.ts         模板 → AST
│   │   ├── transform.ts     AST 转换
│   │   └── codegen.ts       AST → 渲染函数代码
├── compiler-dom/        浏览器平台编译
├── runtime-core/        运行时核心（第 15-20 章手写）
│   ├── src/
│   │   ├── vnode.ts         虚拟节点
│   │   ├── renderer.ts      patch / diff / 挂载
│   │   ├── component.ts     组件实例
│   │   └── apiCreateApp.ts  createApp
├── runtime-dom/         浏览器运行时（DOM 操作）
├── shared/              共享工具函数
└── vue/                 整合包（打包出完整的 Vue）
\`\`\`

**本教程的构建顺序**：先 \`reactivity\`（响应式），再 \`compiler-core\`（编译），最后 \`runtime-core\`（运行时）。这个顺序不是随意的——响应式系统是另外两者的基础（编译产出的渲染函数要包在 effect 里，运行时的更新触发依赖响应式系统）。从最底层、最独立的模块开始，逐步往上搭，每一层都能独立验证，这是构建复杂系统最稳妥的路径。

## 六、本章小结

- **Vue 是渐进式框架**：能力按需取用、叠加增强，不绑定、不全量。
- **三大核心系统**：响应式系统（跟踪数据变化）、模板编译（模板转渲染函数）、虚拟 DOM（渲染并更新视图）。
- **Vue 3 相比 Vue 2**：Composition API 替代 Options API、Proxy 替代 defineProperty、整体对象拆成模块化包。
- **源码结构**：\`reactivity\` / \`compiler-core\` / \`runtime-core\` 三大独立包，本教程按此顺序逐个构建。

下一章，我们会搭建起 Mini Vue 的项目骨架，并用纯 JS 实现一个最简版的"数据变化 → 自动更新"，让你先从手感上体会响应式的魔法，再在后面的章节里一步步揭开它的实现原理。
`,
    code: `
// =============================================================
// 第1章示例代码：用 Vue 的设计思路实现最简单的"数据 → 视图同步"
// -------------------------------------------------------------
// 本 demo 不依赖任何框架，用纯 JS 模拟 Vue 响应式的核心思路：
//   1. 有一份数据 (data)
//   2. 有一个"视图函数" (render)，它读取数据并产出"视图字符串"
//   3. 当数据变化时，视图函数自动重新执行，输出新视图
//
// 这里用最朴素的方式：用一个全局变量记录"当前正在执行的视图函数"，
// 数据的 setter 触发时，重新执行这个函数。
// 这正是 Vue 响应式系统的最小雏形，后续章节会把它逐步完善。
// =============================================================

// ---- 第一步：定义一个全局变量，记录"当前正在运行的副作用函数" ----
// Vue 内部叫它 activeEffect，这里先叫 currentEffect 更直观
// 生活类比：监控室里"当前正在录像的摄像头"，数据变化时就知道通知谁
let currentEffect = null;

// ---- 第二步：定义 effect 函数：把一个函数注册为"副作用" ----
// 作用：执行 fn，并在执行期间把 fn 记录为 currentEffect
// 这样 fn 内部如果访问了响应式数据，数据就知道"当前有人在用我"
function effect(fn) {
  // 把 fn 设为当前副作用
  currentEffect = fn;
  // 立即执行一次 fn —— 这次执行会触发数据的 get，从而建立依赖
  fn();
  // 执行完毕，清空 currentEffect，避免后续无关的访问被误记录
  currentEffect = null;
}

// ---- 第三步：定义一个最简的"响应式数据" ----
// 用一个普通对象 + 自定义 getter/setter 来模拟
// 真实 Vue 3 用 Proxy，这里为了第一章的直观先用最朴素的方式
function defineReactive(obj, key, val) {
  // deps 记录"有哪些副作用函数依赖了这个属性"
  // 生活类比：每个属性都有一个"订阅者名单"
  const deps = new Set();

  // 用 Object.defineProperty 拦截 obj 的 key 属性
  Object.defineProperty(obj, key, {
    // getter：读取时触发
    get() {
      // 如果当前有正在执行的副作用函数，把它加入订阅名单
      if (currentEffect) {
        deps.add(currentEffect);
        console.log(\`  [收集] 属性 "\${key}" 收集到一个副作用\`);
      }
      return val; // 返回真实值
    },
    // setter：赋值时触发
    set(newVal) {
      if (newVal === val) return; // 值没变就跳过
      val = newVal; // 更新值
      console.log(\`  [通知] 属性 "\${key}" 变为 "\${newVal}"，通知所有副作用\`);
      // 遍历订阅名单，逐个重新执行
      deps.forEach((fn) => fn());
    },
  });
}

// ---- 第四步：模拟一个"视图渲染函数" ----
// 真实 Vue 里这是渲染函数 render()，这里简化成返回一个字符串
// 它读取 state.message，所以会自动建立依赖
function render() {
  // 模拟渲染：把数据拼成一段"视图文本"
  const view = \`<div>\${state.message} (字数: \${state.message.length})</div>\`;
  console.log("  视图更新:", view);
}

// ---- 第五步：创建响应式状态 ----
const state = {};
defineReactive(state, "message", "Hello Vue");

console.log("=== 第一次：建立依赖（初始渲染）===");
// 用 effect 包装 render，会立即执行一次，并建立 message → render 的依赖
effect(render);

console.log("\\n=== 第二次：修改数据，观察自动更新 ===");
// 修改数据，setter 会触发，自动重新执行 render
state.message = "Hello Mini Vue";

console.log("\\n=== 第三次：再次修改数据 ===");
state.message = "我学会了 Vue 响应式原理";

console.log("\\n=== 验证：直接读取数据不会触发更新 ===");
// 只读不写，不会触发副作用（getter 只是收集依赖，不会执行）
const temp = state.message;
console.log("  读取了数据:", temp, "，但没有触发视图更新（只读不触发）");

// =============================================================
// 预期输出：
// === 第一次：建立依赖（初始渲染）===
//   [收集] 属性 "message" 收集到一个副作用
//   视图更新: <div>Hello Vue (字数: 9)</div>
//
// === 第二次：修改数据，观察自动更新 ===
//   [通知] 属性 "message" 变为 "Hello Mini Vue"，通知所有副作用
//   视图更新: <div>Hello Mini Vue (字数: 14)</div>
//
// === 第三次：再次修改数据 ===
//   [通知] 属性 "message" 变为 "我学会了 Vue 响应式原理"，通知所有副作用
//   视图更新: <div>我学会了 Vue 响应式原理 (字数: 13)</div>
//
// === 验证：直接读取数据不会触发更新 ===
//   读取了数据: 我学会了 Vue 响应式原理 ，但没有触发视图更新（只读不触发）
// =============================================================
`
  },

  // =========================================================
  // 第二章：从零开始：搭建 Mini Vue 项目
  // =========================================================
  {
    id: "vs-project-setup",
    group: "开篇：Vue 的核心本质",
    icon: "🏗️",
    title: "从零开始：搭建 Mini Vue 项目",
    content: `
# 从零开始：搭建 Mini Vue 项目

## 一、为什么要从零构建

看到这一章标题，你可能会问：**"我天天用 Vue 写业务，为什么还要从零写一遍？"** 这是个好问题，值得认真回答。

### 1.1 使用工具 vs 理解工具

生活类比：**你会开车，不代表你懂发动机**。绝大多数开发者用 Vue，就像司机开车——知道踩油门能加速、打方向盘能转弯就够了，不需要懂燃油怎么雾化、活塞怎么运动。这种"使用者视角"对于完成业务需求完全够用。

但当你遇到下面这些场景时，"使用者视角"就不够了：

- **性能调优**：为什么列表加了 \`:key\` 就快了？为什么 \`v-if\` 和 \`v-show\` 在不同场景下性能差异巨大？不理解虚拟 DOM 的 diff 过程，就只能死记结论。
- **诡异 Bug**：修改了数组的某个索引，视图没更新；给对象加了新属性，视图没反应；computed 偶尔不触发……不理解响应式原理，这些 bug 就是玄学。
- **技术选型**：Vue 适合这个场景吗？为什么？和 React 比到底差在哪？不理解内部机制，选型就只能是"大家都用"。
- **二次开发**：想给 Vue 加个自定义指令、写个渲染器（比如渲染到小程序、canvas）、做一个状态管理库……这些都需要你深入到源码层面。

**从零构建，就是为了把"使用者"变成"理解者"**。读完本教程，你不会变成 Vue 团队成员，但你会拥有"读得懂 Vue 源码、改得动 Vue 行为、讲得清 Vue 原理"的能力。

### 1.2 读书 vs 造轮子

很多人理解原理的方式是"读源码"——打开 \`node_modules/vue\`，从 \`createApp\` 开始一行行读。这种方式的问题在于：**你读到的是结果，不是过程**。真实源码里有大量边界处理、性能优化、平台适配、历史包袱，这些"噪音"会淹没核心逻辑。你读 \`reactive.ts\` 可能要读 800 行，其中 600 行在处理各种特殊情况，核心的 Proxy 拦截逻辑只有 100 行，但你很难把它们分开。

**造轮子的价值在于"按需揭示"**。本教程的每一章，都只引入解决当前问题必需的代码，把真实源码里的边界处理暂时搁置。我们先写一个 30 行的 \`reactive\` 理解核心，再逐步加细节，最后逼近真实源码。这种"由简入繁"的路径，比直接读 800 行源码高效得多。

### 1.3 学完能达到什么程度

- 手写一个 \`reactive\`、\`ref\`、\`effect\`、\`computed\`，行为与 \`@vue/reactivity\` 基本一致。
- 手写一个模板编译器，能把 \`<div>{{ msg }}</div>\` 编译成渲染函数。
- 手写一个虚拟 DOM 渲染器，能挂载、diff、更新真实 DOM（用 JS 对象模拟）。
- 把三者拼成一个 Mini Vue，能跑一个响应式的 hello world。

## 二、Mini Vue 的模块规划

我们要构建的 Mini Vue，结构上对应真实 Vue 3 的三大包，但每个都做了大幅简化。

### 2.1 三大模块的职责划分

\`\`\`text
┌─────────────────────────────────────────────┐
│              Mini Vue 整体架构                │
├─────────────────────────────────────────────┤
│                                             │
│  模块一：reactivity（响应式）                │
│  ├─ reactive(obj)   把对象变成响应式代理     │
│  ├─ ref(val)        把基本类型变成响应式     │
│  ├─ effect(fn)      声明副作用，建立依赖     │
│  ├─ track()         收集依赖（在 get 中）    │
│  ├─ trigger()       触发依赖（在 set 中）    │
│  └─ computed(getter) 计算属性                │
│                                             │
│  模块二：compiler（编译器）                  │
│  ├─ parse(template) 模板字符串 → AST         │
│  ├─ transform(ast)  AST 转换（处理指令）     │
│  └─ codegen(ast)    AST → 渲染函数代码       │
│                                             │
│  模块三：runtime（运行时）                   │
│  ├─ h(tag, props, children) 创建虚拟节点     │
│  ├─ patch(n1, n2, container) 挂载/更新DOM    │
│  ├─ mountElement(vnode, container) 首次挂载  │
│  └─ createApp(component).mount(el) 应用入口  │
│                                             │
└─────────────────────────────────────────────┘
\`\`\`

### 2.2 模块间的依赖关系

三个模块不是平行的，有明确的依赖方向：

\`\`\`text
  reactivity  ◄────  runtime  ◄────  compiler
  （最底层）        （中间层）        （最上层）
\`\`\`

- **reactivity 不依赖任何人**：它可以单独使用，这也是真实 Vue 的设计。
- **runtime 依赖 reactivity**：渲染函数要包在 \`effect\` 里，更新才自动触发。
- **compiler 依赖 runtime**：编译的产物是"调用 \`h\` 创建虚拟节点"的渲染函数，\`h\` 来自 runtime。

所以我们的构建顺序是：**reactivity → runtime → compiler**。但本批次（第 3-5 章）只聚焦 reactivity 的前半部分。

### 2.3 本教程的章节地图

| 批次 | 章节 | 主题 | 对应模块 |
| --- | --- | --- | --- |
| 第一批 | 1-5 | 开篇 + 响应式基础 | reactivity（reactive/effect/track） |
| 第二批 | 6-10 | 响应式进阶 | reactivity（ref/computed/依赖清理） |
| 第三批 | 11-15 | 模板编译 | compiler（parse/transform/codegen） |
| 第四批 | 16-20 | 虚拟 DOM 与渲染 | runtime（vnode/patch/mount） |
| 第五批 | 21-25 | 组件系统 + 整合 | 三模块拼装成完整 Mini Vue |

## 三、最终目标展示

在开始写第一行响应式代码前，先让你看看我们这趟旅程的终点长什么样。下面是我们最终要实现的 Mini Vue 的使用方式：

\`\`\`js
import { createApp, h, reactive } from './mini-vue'

// 定义一个组件
const App = {
  setup() {
    const state = reactive({ count: 0 })
    function increment() { state.count++ }
    return { state, increment }
  },
  render() {
    return h('div', { class: 'app' }, [
      h('h1', null, \`count: \${this.state.count}\`),
      h('button', { onClick: this.increment }, '点我+1')
    ])
  }
}

// 挂载
createApp(App).mount('#app')

// 点击按钮时，state.count 变化 → render 自动重新执行 → 视图自动更新
\`\`\`

这段代码和真实 Vue 3 的写法几乎一致。区别只在于：真实 Vue 有 3 万行代码处理各种细节，我们的 Mini Vue 用 1000 行实现核心机制。**少了的是细节，没少的是原理**。

## 四、本章的 demo：最简版"数据变化 → 自动更新"

为了让你先有手感，本章的 demo 实现一个最朴素的响应式雏形。它还不是真正的 \`reactive\`（那在第 4 章用 Proxy 实现），而是用更底层的方式让你看清"数据变化触发函数"的本质机制。

### 4.1 响应式的三个核心问题

任何响应式系统都要回答三个问题：

1. **怎么知道数据被读了？** → 需要"读拦截"（getter）
2. **怎么知道数据被写了？** → 需要"写拦截"（setter）
3. **数据变化时通知谁？** → 需要"依赖记录"（谁在读的时候被记下，变化时就通知谁）

本章 demo 用最直白的方式回答这三个问题。请仔细看代码注释，每个细节后续都会展开。

### 4.2 一个关键认知：副作用（effect）

在写代码前，先理解一个核心概念：**effect（副作用）**。

"副作用"这个词听起来很学术，其实很好懂。在函数式编程里，**一个函数如果除了返回值，还对外部世界产生了影响（修改全局变量、写文件、更新 DOM），就说他有副作用**。\`render\` 函数就是典型的副作用——它读取数据，然后把结果写到 DOM 上。

Vue 的响应式系统，本质上就是**自动管理副作用**的机制：你用 \`effect(render)\` 声明"render 是个需要随数据更新的副作用"，之后数据一变，Vue 自动帮你重新执行 render。你不用手动调用，不用手动维护"哪个数据对应哪个更新函数"。

生活类比：**effect 像是给一个函数装了"监控摄像头"**。摄像头开着的时候（effect 执行期间），这个函数碰过的每样东西（响应式数据）都会被记录下来。之后这些东西一旦被动，摄像头就自动报警，让这个函数重新跑一遍。

## 五、Mini Vue 的代码组织

在真实项目里，我们会把代码拆成多个文件：

\`\`\`text
mini-vue/
├── src/
│   ├── reactivity/
│   │   ├── effect.js       effect / track / trigger
│   │   ├── reactive.js     reactive / readonly
│   │   ├── ref.js          ref
│   │   └── computed.js     computed
│   ├── compiler/
│   │   ├── parse.js        模板解析
│   │   ├── transform.js    AST 转换
│   │   └── codegen.js      代码生成
│   ├── runtime/
│   │   ├── vnode.js        虚拟节点
│   │   ├── renderer.js     渲染器
│   │   └── apiCreateApp.js createApp
│   └── index.js            统一导出
└── package.json
\`\`\`

但本教程运行在 Node 沙箱里，每个 demo 都是单个 JS 文件，所以我们不会真的建多文件项目。每个章节的 \`code\` 字段都是一个自包含的 demo，你只需要关注逻辑本身。等到第五批次整合时，我们才把所有模块拼到一起。

## 六、学习本教程的方法建议

### 6.1 三遍法

- **第一遍：读 content**，理解每个概念"是什么、为什么"。
- **第二遍：跑 code**，把 demo 在 Node 里跑一遍，观察输出，改几个值看结果变化。
- **第三遍：默写**，关掉教程，凭记忆把核心函数重写一遍，写不出来的地方就是没懂透的。

### 6.2 不要纠结边界

本教程的代码是"教学版"，刻意省略了大量边界处理（比如循环引用、Symbol key、冻结对象等）。真实 Vue 源码里这些处理占了 60% 的代码量，但它们会干扰你理解核心。**先理解主干，再补边界**，这是学习复杂系统的正确节奏。

### 6.3 多问"为什么这样设计"

每段代码都问问自己：为什么 Vue 团队这么设计？有没有别的方案？这个方案的好处是什么？比如 \`reactive\` 为什么用 Proxy 不用 getter/setter？\`effect\` 为什么用全局变量而不是参数传递？这些"为什么"的答案，才是本教程真正想教给你的东西。

## 七、本章小结

- **为什么从零构建**：把"使用者"变成"理解者"，解决性能调优、诡异 Bug、技术选型、二次开发的认知瓶颈。
- **三大模块**：reactivity（响应式）、compiler（编译）、runtime（运行时），依赖方向是 reactivity ← runtime ← compiler。
- **构建顺序**：从最底层的 reactivity 开始，逐层往上。
- **最终目标**：一个能用 \`createApp\` 挂载、响应式更新、组件化的 Mini Vue。

下一章，我们正式进入响应式系统的第一课：搞清楚"响应式"到底是什么，并对比 Vue 2 的 \`Object.defineProperty\` 和 Vue 3 的 \`Proxy\` 两种实现方案的差异。
`,
    code: `
// =============================================================
// 第2章示例代码：用纯 JS 实现最简版"数据变化 → 自动更新"
// -------------------------------------------------------------
// 本章 demo 实现一个最朴素的响应式雏形，回答三个核心问题：
//   1. 怎么知道数据被读了？  → getter 拦截
//   2. 怎么知道数据被写了？  → setter 拦截
//   3. 数据变化时通知谁？    → 依赖记录 + 通知
//
// 注意：这只是"雏形"，用 Object.defineProperty 实现。
// 真正的 reactive 函数会在第 4 章用 Proxy 重写。
// =============================================================

// ---- 全局变量：当前正在执行的副作用函数 ----
// 为什么用全局变量？因为数据被读时，它不知道"谁在读我"，
// 只能靠一个全局位置去拿"当前正在跑的函数"。
// 生活类比：监控室的"当前在录像的摄像头编号"指示灯
let activeEffect = null;

// ---- effect 函数：声明一个副作用 ----
// 传入一个函数 fn，effect 会：
//   1. 把 fn 设为 activeEffect
//   2. 执行 fn（这次执行中 fn 读到的数据会自动记录"fn 依赖我"）
//   3. 执行完恢复 activeEffect 为之前的值（支持嵌套）
function effect(fn) {
  // 保存之前的 activeEffect，支持 effect 嵌套
  const prev = activeEffect;
  // 设置当前副作用
  activeEffect = fn;
  // 执行 fn，触发其内部的 get 拦截，建立依赖
  fn();
  // 恢复之前的 activeEffect
  activeEffect = prev;
}

// ---- 依赖容器：存储"属性 → 副作用集合"的映射 ----
// 结构：{ 对象 → { 属性 → Set<effect> } }
// 生活类比：图书馆的索引——先按书架（对象）找，再按书名（属性）找，
// 拿到的是所有借阅这本书的读者名单（effect 集合）
const targetMap = new WeakMap();

// ---- track 函数：在 get 时收集依赖 ----
// 参数：target（原对象）、key（属性名）
// 作用：把当前 activeEffect 记录到"target 的 key 属性"的依赖集合里
function track(target, key) {
  // 如果没有正在执行的副作用，说明是普通读取，不需要收集
  if (!activeEffect) return;

  // 第一级：从 WeakMap 里找 target 对应的依赖表
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    // 没有就新建一个 Map，并存入 WeakMap
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  // 第二级：从 depsMap 里找 key 对应的依赖集合
  let dep = depsMap.get(key);
  if (!dep) {
    // 没有就新建一个 Set（Set 自动去重）
    dep = new Set();
    depsMap.set(key, dep);
  }

  // 第三级：把当前副作用加入集合
  dep.add(activeEffect);
  console.log(\`  [track] \${key} 收集到副作用，当前依赖数: \${dep.size}\`);
}

// ---- trigger 函数：在 set 时触发依赖 ----
// 参数：target（原对象）、key（属性名）
// 作用：找到 target 的 key 属性的所有副作用，逐个执行
function trigger(target, key) {
  // 第一级：找 target 的依赖表
  const depsMap = targetMap.get(target);
  if (!depsMap) return; // 没人依赖这个对象

  // 第二级：找 key 的依赖集合
  const dep = depsMap.get(key);
  if (!dep) return; // 没人依赖这个属性

  // 第三级：遍历执行所有副作用
  console.log(\`  [trigger] \${key} 变化，触发 \${dep.size} 个副作用\`);
  dep.forEach((fn) => fn());
}

// ---- reactive 函数（雏形版）：把对象变成响应式 ----
// 这里用 Object.defineProperty 实现，第 4 章会用 Proxy 重写
function reactive(target) {
  // 遍历对象的所有 key
  Object.keys(target).forEach((key) => {
    let value = target[key]; // 保存当前值，闭包持有
    Object.defineProperty(target, key, {
      // 拦截读：收集依赖 + 返回值
      get() {
        track(target, key);
        return value;
      },
      // 拦截写：更新值 + 触发依赖
      set(newVal) {
        if (newVal === value) return; // 值没变，跳过
        value = newVal;
        trigger(target, key);
      },
    });
  });
  return target;
}

// =============================================================
// 下面用这个雏形版响应式系统跑一个完整 demo
// =============================================================

console.log("=== 步骤1：创建响应式状态 ===");
const state = reactive({
  count: 0,
  name: "Mini Vue",
});
console.log("初始状态:", { count: state.count, name: state.name });

console.log("\\n=== 步骤2：注册一个副作用（模拟视图渲染）===");
// 这个函数读取了 state.count 和 state.name，所以会建立两个依赖
effect(() => {
  console.log(\`  [视图] 计数器: \${state.count}，名称: \${state.name}\`);
});

console.log("\\n=== 步骤3：修改数据，观察自动触发 ===");
state.count = 1;
state.name = "Mini Vue 2.0";

console.log("\\n=== 步骤4：注册第二个副作用，观察多依赖 ===");
effect(() => {
  console.log(\`  [仅关注count] count 的两倍是 \${state.count * 2}\`);
});

console.log("\\n=== 步骤5：再次修改 count，两个副作用都应触发 ===");
state.count = 5;

console.log("\\n=== 步骤6：验证：修改 name 只触发第一个副作用 ===");
state.name = "Mini Vue 3.0";

// =============================================================
// 预期输出（关键行）：
// === 步骤1：创建响应式状态 ===
//   [track] count 收集到副作用，当前依赖数: 1   （读取时触发）
//   初始状态: { count: 0, name: 'Mini Vue' }
// === 步骤2：注册一个副作用（模拟视图渲染）===
//   [track] count 收集到副作用，当前依赖数: 1
//   [track] name 收集到副作用，当前依赖数: 1
//   [视图] 计数器: 0，名称: Mini Vue
// === 步骤3：修改数据，观察自动触发 ===
//   [trigger] count 变化，触发 1 个副作用
//   [视图] 计数器: 1，名称: Mini Vue
//   [trigger] name 变化，触发 1 个副作用
//   [视图] 计数器: 1，名称: Mini Vue 2.0
// === 步骤4：注册第二个副作用，观察多依赖 ===
//   [track] count 收集到副作用，当前依赖数: 2   （count 现在有2个依赖）
//   [仅关注count] count 的两倍是 2
// === 步骤5：再次修改 count，两个副作用都应触发 ===
//   [trigger] count 变化，触发 2 个副作用
//   [视图] 计数器: 5，名称: Mini Vue 2.0
//   [仅关注count] count 的两倍是 10
// === 步骤6：验证：修改 name 只触发第一个副作用 ===
//   [trigger] name 变化，触发 1 个副作用
//   [视图] 计数器: 5，名称: Mini Vue 3.0
// =============================================================
`
  },

  // =========================================================
  // 第三章：响应式原理：数据驱动的基石
  // =========================================================
  {
    id: "vs-reactivity-intro",
    group: "第一部分 响应式系统",
    icon: "📡",
    title: "响应式原理：数据驱动的基石",
    content: `
# 响应式原理：数据驱动的基石

## 一、什么是响应式

"响应式"（Reactive）这个词在前端圈被用滥了，但它的本义其实非常具体。我们从一个最简单的对比说起。

### 1.1 命令式 vs 响应式：擦桌子

假设你有个任务：**"桌子脏了就擦干净"**。有两种实现思路：

**命令式（Imperative）**：你站在桌前，每隔 1 秒低头看一次，发现脏了就拿抹布擦。你要主动检查、主动判断、主动执行。代码里这叫轮询：

\`\`\`js
// 命令式：手动检查并更新
setInterval(() => {
  if (table.isDirty) {
    table.clean();
  }
}, 1000);
\`\`\`

**响应式（Reactive）**：你在桌上装了个传感器，桌子一脏，传感器自动响铃，你听到铃声就去擦。你不用主动检查，脏这个事件会"推"给你。代码里这叫订阅/监听：

\`\`\`js
// 响应式：数据变化自动触发
table.onDirty(() => {
  table.clean();
});
\`\`\`

看出差别了吗？**命令式是你去找数据，响应式是数据来找你**。响应式的核心特征是：**数据变化时，依赖这个数据的逻辑自动执行，不需要手动调用**。

### 1.2 声明式：响应式的"用户界面"

响应式是一种机制（数据变化自动触发），声明式是一种风格（说"要什么"而不是"怎么做"）。Vue 把两者结合：你用声明式的方式写模板（描述视图长什么样），Vue 用响应式机制保证数据变了视图自动更新。

生活类比：**响应式是后厨的"食材变动通知"机制，声明式是主厨写的"菜谱"**。主厨只写菜谱（声明：这道菜要这样），不关心食材什么时候到、谁去通知谁——通知机制（响应式）由食材管理员负责。主厨声明了"要什么"，机制保证"自动实现"。

### 1.3 响应式在前端的典型场景

| 场景 | 数据 | 副作用（自动触发的逻辑） |
| --- | --- | --- |
| 视图更新 | state.count | 重新渲染 DOM |
| 计算属性 | state.firstName, state.lastName | 重新计算 fullName |
| 侦听器 | state.query | 发起搜索请求 |
| 本地存储同步 | state.settings | 写入 localStorage |
| 调试日志 | state 任意属性 | 打印变化日志 |

每一行都是"数据变了，某件事自动发生"。这就是响应式的价值——**把"数据 → 副作用"的绑定自动化，开发者只需声明关系，不用手动维护同步**。

## 二、Vue 2 的方案：Object.defineProperty

### 2.1 基本原理

Vue 2 用 \`Object.defineProperty\` 给对象的每个属性加装 getter/setter，从而拦截读写操作。

\`\`\`js
function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    get() {
      // 收集依赖：记录"谁在读我"
      track(obj, key);
      return val;
    },
    set(newVal) {
      // 触发依赖：通知"我变了"
      if (newVal !== val) {
        val = newVal;
        trigger(obj, key);
      }
    }
  });
}
\`\`\`

这套机制在 Vue 2 时代工作得很好，但它有几个绕不开的硬伤。

### 2.2 局限一：无法检测新增属性

\`defineProperty\` 只能拦截**已存在**的属性。给对象加个新属性，新属性没有 getter/setter，修改它不会触发更新。

\`\`\`js
const vm = new Vue({ data: { user: { name: '张三' } } })
vm.user.age = 18      // ❌ 视图不更新，age 没有被拦截
Vue.set(vm.user, 'age', 18)  // ✅ 必须用 Vue.set 才行
\`\`\`

这是 Vue 2 用户最常踩的坑之一。根本原因：\`defineProperty\` 是"按属性"拦截的，加新属性时没人给它装 getter/setter。

### 2.3 局限二：无法检测删除属性

同理，\`delete obj.key\` 不会触发 setter（setter 是设置值，不是删除），视图也不更新。

\`\`\`js
delete vm.user.name    // ❌ 视图不更新
Vue.delete(vm.user, 'name')  // ✅ 必须用 Vue.delete
\`\`\`

### 2.4 局限三：无法监听数组索引和 length

\`\`\`js
const vm = new Vue({ data: { list: ['a', 'b', 'c'] } })
vm.list[0] = 'x'      // ❌ 视图不更新
vm.list.length = 0    // ❌ 视图不更新
vm.list.push('d')     // ✅ 这个能更新，因为 Vue 2 重写了 push 等 7 个方法
\`\`\`

Vue 2 的解决办法是" hack "：重写数组的 \`push\`、\`pop\`、\`shift\`、\`unshift\`、\`splice\`、\`sort\`、\`reverse\` 这 7 个会改变数组的原型方法，在方法内部手动触发更新。但直接改索引、改 length 还是没辙。

### 2.5 局限四：初始化时深度遍历

Vue 2 在初始化 data 时，会**递归遍历**整个对象，给每一层每个属性都装 getter/setter。如果数据很大（比如一个 10000 项的数组，每项都是嵌套对象），初始化会卡顿。

\`\`\`js
// Vue 2：初始化时一次性深度遍历
data: {
  bigList: [/* 10000 个嵌套对象 */]
}
// 这一刻，10000 个对象的所有属性都被 defineProperty 了，可能卡几百毫秒
\`\`\`

### 2.6 局限总结

| 问题 | 原因 | Vue 2 的临时方案 |
| --- | --- | --- |
| 新增属性不响应 | defineProperty 只拦已有属性 | \`Vue.set\` / \`this.$set\` |
| 删除属性不响应 | delete 不触发 setter | \`Vue.delete\` / \`this.$delete\` |
| 数组索引改不响应 | 同上 | 重写 7 个数组方法 |
| length 改不响应 | 同上 | 无，只能用 splice |
| 深度初始化慢 | 必须递归遍历 | 无，只能尽量减小 data |
| Map/Set 不支持 | defineProperty 不适合 | 无，Vue 2 根本不支持 |

这些"临时方案"在 Vue 2 时代是必要的妥协，但它们让 API 变得啰嗦（要记 \`Vue.set\`、\`Vue.delete\`），也让原理变得不统一（数组和对象走两套逻辑）。Vue 3 决定从根上解决——换掉 \`defineProperty\`，改用 \`Proxy\`。

## 三、Vue 3 的方案：Proxy

### 3.1 Proxy 是什么

\`Proxy\` 是 ES6 引入的元编程能力，它可以为**整个对象**包一层代理，拦截对这个对象的所有操作（不仅仅是已有属性的读写）。

\`\`\`js
const raw = { name: '张三' };
const proxy = new Proxy(raw, {
  get(target, key, receiver) {
    console.log('读取了', key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    console.log('设置了', key, '=', value);
    return Reflect.set(target, key, value, receiver);
  }
});

proxy.name       // 打印"读取了 name"，返回"张三"
proxy.age = 18   // 打印"设置了 age = 18"（新增属性也被拦截！）
delete proxy.name // 如果配了 deleteProperty，也能拦截
\`\`\`

注意第二条：\`proxy.age = 18\` 是给一个**原本不存在**的属性赋值，Proxy 也拦截到了！这正是 \`defineProperty\` 做不到的。

### 3.2 Proxy 解决了 defineProperty 的所有局限

| 局限 | defineProperty | Proxy |
| --- | --- | --- |
| 新增属性 | ❌ 无法检测 | ✅ set 拦截器自动捕获 |
| 删除属性 | ❌ 无法检测 | ✅ deleteProperty 拦截器 |
| 数组索引 | ❌ 无法检测 | ✅ set 拦截器捕获 |
| 数组 length | ❌ 无法检测 | ✅ set 拦截器捕获 |
| Map/Set | ❌ 不支持 | ✅ 原生支持（配合自定义 handler） |
| 初始化遍历 | ❌ 必须递归 | ✅ 懒代理，访问时才代理子对象 |

最后一条特别重要——Vue 3 的 \`reactive\` 是"懒代理"：初始化时只代理最外层对象，当某个属性被访问且它的值也是对象时，才递归地把这个子对象也代理掉。这样大数据的初始化开销就被摊到了访问时，不再阻塞首屏。

### 3.3 Proxy 的代价

Proxy 不是完美的，它有两个代价：

1. **不支持 IE**：Proxy 是 ES6 特性，无法 polyfill（因为它改变的是语言底层行为）。Vue 3 因此放弃了 IE 支持。在 2026 年的今天，这已经不是问题。
2. **多一层访问开销**：每次读写都要经过代理层，比直接访问略慢。但这个开销很小（纳秒级），而且换来的是更统一、更强大的拦截能力，整体是赚的。

### 3.4 Reflect 的角色

你可能在上面注意到 \`Reflect.get\` / \`Reflect.set\`。为什么要用 \`Reflect\`，不直接写 \`target[key]\` 和 \`target[key] = value\`？

生活类比：**Reflect 像是"标准操作手册"**。你可以手动拧螺丝（\`target[key]\`），也可以用螺丝刀按标准拧（\`Reflect.get\`）。手动拧大多数时候没问题，但遇到特殊情况（比如属性有 getter 且涉及继承）可能拧歪；用螺丝刀则保证每次都按规范拧紧。

具体到代码，\`Reflect\` 有三个好处：

1. **正确处理 \`this\` 指向**：\`Reflect.get(target, key, receiver)\` 的第三个参数 \`receiver\` 保证当 target 的属性是 getter 时，getter 内部的 \`this\` 指向代理对象（这样 getter 里读其他属性时也会被拦截）。直接 \`target[key]\` 做不到。
2. **返回值更规范**：\`Reflect.set\` 返回布尔值表示成功与否，便于在拦截器里判断。
3. **代码更对称**：get/set/delete 都有对应的 Reflect 方法，风格统一。

\`\`\`js
// 不推荐：直接操作 target
get(target, key) {
  track(target, key);
  return target[key];  // 如果 key 是 getter，this 会指向 target，绕过代理
}

// 推荐：用 Reflect
get(target, key, receiver) {
  track(target, key);
  return Reflect.get(target, key, receiver);  // this 正确指向 receiver（代理对象）
}
\`\`\`

第 4 章手写 \`reactive\` 时，我们会用 \`Reflect\` 配合 \`Proxy\`。

## 四、命令式 vs 响应式 vs 声明式：一张图理清

这三个词经常被混用，但它们其实处在不同维度：

\`\`\`text
维度一：怎么描述逻辑
  命令式  ──>  声明式
  （描述"怎么做"）  （描述"要什么"）
  for循环遍历       filter/map
  手动操作DOM       模板/JSX

维度二：怎么触发更新
  手动调用  ──>  响应式自动触发
  data=x; update()   data=x; 视图自动更新
\`\`\`

Vue 的选择是：**声明式 + 响应式**。你用模板声明视图长什么样（声明式），Vue 用响应式机制保证数据变了视图自动更新（响应式）。这两者结合，就是"数据驱动"——你只管维护数据，视图是数据的函数，数据变视图自动变。

## 五、响应式系统的核心要素

在动手写 \`reactive\` 之前，我们要先理清响应式系统由哪些部分组成。不管用 \`defineProperty\` 还是 \`Proxy\`，下面四个要素都缺一不可：

### 5.1 拦截器（Interceptor）

拦截对响应式数据的读写操作。\`Proxy\` 的 handler 就是拦截器，它有 \`get\`、\`set\`、\`deleteProperty\`、\`has\`、\`ownKeys\` 等钩子。

### 5.2 副作用（Effect）

一段依赖响应式数据的逻辑。最典型的是渲染函数，也可以是 computed、watch、任意用户逻辑。用 \`effect(fn)\` 注册后，fn 会在数据变化时自动重新执行。

### 5.3 依赖收集（Track）

在 get 拦截时，记录"当前 activeEffect 依赖了这个属性"。建立"属性 → effect 集合"的映射。

### 5.4 派发更新（Trigger）

在 set 拦截时，找到依赖这个属性的所有 effect，逐个重新执行。

\`\`\`text
读取数据 ──get拦截──> track ──记录──> 属性 → [effect1, effect2]
                                                 │
修改数据 ──set拦截──> trigger ──查找──> 属性 → [effect1, effect2]
                                                 │
                                          逐个重新执行
\`\`\`

第 4 章手写 \`reactive\`（拦截器），第 5 章手写 \`effect\` + \`track\` + \`trigger\`（副作用、收集、触发）。两者合起来，就是一个能用的响应式系统。

## 六、本章小结

- **响应式**：数据变化时，依赖数据的逻辑自动执行。核心是"数据来找你"，不是"你去找数据"。
- **Vue 2 的 defineProperty**：按属性拦截，无法检测新增/删除属性、数组索引、length，初始化需深度遍历。
- **Vue 3 的 Proxy**：按对象拦截，覆盖所有操作，懒代理提升初始化性能，原生支持 Map/Set。
- **Reflect**：保证默认行为正确执行，尤其正确处理 \`this\` 指向。
- **四大核心要素**：拦截器、副作用、依赖收集、派发更新。

下一章，我们正式手写 \`reactive\` 函数，用 Proxy + Reflect 把一个普通对象变成响应式代理对象。
`,
    code: `
// =============================================================
// 第3章示例代码：用 Object.defineProperty 和 Proxy 分别实现响应式转换
// -------------------------------------------------------------
// 本 demo 对比两种方案，让你亲眼看到 Proxy 相比 defineProperty 的优势：
//   方案A：Object.defineProperty —— 拦不住新增属性、删除属性
//   方案B：Proxy —— 全面拦截，新增/删除都能响应
//
// 两种方案都实现：读取时打印日志，修改时打印日志
// =============================================================

console.log("========== 方案A：Object.defineProperty ==========\\n");

// ---- 方案A：用 defineProperty 实现响应式 ----
function defineReactiveA(obj) {
  // 记录所有操作日志，方便观察
  const logs = [];

  // 遍历对象"当前已有"的 key，逐个拦截
  Object.keys(obj).forEach((key) => {
    let value = obj[key]; // 闭包保存当前值

    Object.defineProperty(obj, key, {
      get() {
        logs.push(\`读取 \${key}\`);
        return value;
      },
      set(newVal) {
        logs.push(\`设置 \${key} = \${newVal}\`);
        value = newVal;
      },
      // 注意：defineProperty 默认 configurable 可设为 true
      // 但删除属性时，setter 不会被调用 —— 这是局限之二
      configurable: true,
      enumerable: true,
    });
  });

  return { obj, logs };
}

// 测试方案A
const resultA = defineReactiveA({ name: "张三", age: 20 });
const objA = resultA.obj;
const logsA = resultA.logs;

console.log("1. 读取已有属性 name:");
const n = objA.name; // 触发 get
console.log("   结果:", n, "| 日志:", logsA.slice(-1));

console.log("\\n2. 修改已有属性 age:");
objA.age = 21; // 触发 set
console.log("   日志:", logsA.slice(-1));

console.log("\\n3. ❌ 新增属性 gender（观察是否能拦截）:");
objA.gender = "男"; // 不触发 set！
console.log("   日志:", logsA.slice(-1), "← 没有新增日志，说明拦截不到");

console.log("\\n4. ❌ 删除属性 name（观察是否能拦截）:");
delete objA.name; // 不触发 set！
console.log("   日志:", logsA.slice(-1), "← 没有删除日志，说明拦截不到");

console.log("\\n5. ❌ 数组场景：修改索引和 length");
const arrA = [1, 2, 3];
defineReactiveA(arrA);
arrA[0] = 99; // 不触发 set
console.log("   arrA[0]=99 后，日志没有新增，拦截不到索引修改");

// ============================================================
console.log("\\n\\n========== 方案B：Proxy ==========\\n");

// ---- 方案B：用 Proxy 实现响应式 ----
function reactiveB(target) {
  const logs = [];

  const proxy = new Proxy(target, {
    // 拦截读取
    get(t, key, receiver) {
      logs.push(\`读取 \${String(key)}\`);
      // 用 Reflect 保证默认行为正确，receiver 保证 this 指向代理对象
      return Reflect.get(t, key, receiver);
    },
    // 拦截赋值（包括新增属性！）
    set(t, key, value, receiver) {
      const hadKey = key in t; // 判断是新增还是修改
      const result = Reflect.set(t, key, value, receiver);
      if (hadKey) {
        logs.push(\`修改 \${String(key)} = \${value}\`);
      } else {
        logs.push(\`✅ 新增 \${String(key)} = \${value}\`);
      }
      return result; // set 必须返回布尔值
    },
    // 拦截删除
    deleteProperty(t, key) {
      const result = Reflect.deleteProperty(t, key);
      logs.push(\`✅ 删除 \${String(key)}\`);
      return result;
    },
  });

  return { proxy, logs };
}

// 测试方案B
const resultB = reactiveB({ name: "李四", age: 25 });
const objB = resultB.proxy;
const logsB = resultB.logs;

console.log("1. 读取已有属性 name:");
const m = objB.name; // 触发 get
console.log("   结果:", m, "| 日志:", logsB.slice(-1));

console.log("\\n2. 修改已有属性 age:");
objB.age = 26; // 触发 set
console.log("   日志:", logsB.slice(-1));

console.log("\\n3. ✅ 新增属性 gender（Proxy 能拦截！）:");
objB.gender = "女"; // 触发 set，且识别为新增
console.log("   日志:", logsB.slice(-1), "← 成功拦截新增属性");

console.log("\\n4. ✅ 删除属性 name（Proxy 能拦截！）:");
delete objB.name; // 触发 deleteProperty
console.log("   日志:", logsB.slice(-1), "← 成功拦截删除属性");

console.log("\\n5. ✅ 数组场景：修改索引和 length");
const resultArrB = reactiveB([10, 20, 30]);
const arrB = resultArrB.proxy;
const logsArrB = resultArrB.logs;
arrB[0] = 99; // 触发 set
console.log("   arrB[0]=99:", logsArrB.slice(-1), "← 成功拦截索引修改");
arrB.push(40); // push 会触发多次 set（改索引 + 改 length）
console.log("   arrB.push(40) 触发多次拦截:", logsArrB.slice(-3));
arrB.length = 0; // 触发 set
console.log("   arrB.length=0:", logsArrB.slice(-1), "← 成功拦截 length 修改");

// ============================================================
console.log("\\n\\n========== 对比总结 ==========");
console.log("| 能力                | defineProperty | Proxy |");
console.log("|---------------------|:--------------:|:-----:|");
console.log("| 拦截已有属性读写    |       ✅       |  ✅   |");
console.log("| 拦截新增属性        |       ❌       |  ✅   |");
console.log("| 拦截删除属性        |       ❌       |  ✅   |");
console.log("| 拦截数组索引修改    |       ❌       |  ✅   |");
console.log("| 拦截数组 length     |       ❌       |  ✅   |");
console.log("| 懒代理（按需深度）   |       ❌       |  ✅   |");
console.log("| 支持 Map/Set        |       ❌       |  ✅   |");

// =============================================================
// 结论：Proxy 在所有维度上都优于 defineProperty。
// 这就是 Vue 3 选择 Proxy 的根本原因。
// 下一章我们会基于 Proxy 手写完整的 reactive 函数。
// =============================================================
`
  },

  // =========================================================
  // 第四章：手写 reactive：Proxy 代理对象
  // =========================================================
  {
    id: "vs-reactive-function",
    group: "第一部分 响应式系统",
    icon: "⚡",
    title: "手写 reactive：Proxy 代理对象",
    content: `
# 手写 reactive：Proxy 代理对象

## 一、reactive 函数的职责

在动手写之前，先想清楚 \`reactive\` 这个函数到底要做什么。一句话概括：

> **reactive 接收一个普通对象，返回这个对象的响应式代理。此后对该代理的读写会被拦截，从而支持依赖收集和派发更新。**

拆开来看，它要做四件事：

1. **类型校验**：只处理对象（数组也是对象），原始值（number、string）不处理（那是 \`ref\` 的职责）。
2. **缓存检查**：同一个对象多次调用 \`reactive\`，应返回同一个代理，避免重复包装。
3. **创建代理**：用 \`new Proxy\` 包一层 handler，handler 里实现 get/set/deleteProperty 等拦截。
4. **嵌套处理**：当属性的值也是对象时，要把它也变成响应式（懒代理：访问时才转）。

本章我们逐步实现这四点，最终得到一个行为接近真实 Vue 3 的 \`reactive\` 函数。

## 二、最小可用版：只拦截 get 和 set

先不管缓存和嵌套，写一个最小版本，让你看清核心结构。

\`\`\`js
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      // 收集依赖（第5章实现）
      // track(target, key)
      console.log('get', key);
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      // 触发更新（第5章实现）
      // trigger(target, key)
      console.log('set', key, value);
      return Reflect.set(target, key, value, receiver);
    }
  });
}
\`\`\`

这个 10 行的函数已经能拦截读写了。但还差得远——它没有处理嵌套对象、没有缓存、没有 delete。我们逐个补上。

## 三、handler 的三个核心拦截器

真实 Vue 3 的 \`reactive\` handler 实现了七八个拦截器，但核心是这三个：\`get\`、\`set\`、\`deleteProperty\`。我们一个一个讲。

### 3.1 get 拦截器：读取时收集依赖

\`\`\`js
get(target, key, receiver) {
  // 1. 收集依赖（第5章详细讲）
  track(target, key);

  // 2. 取出真实值
  const result = Reflect.get(target, key, receiver);

  // 3. 如果值是对象，递归把它也变成响应式（懒代理）
  if (isObject(result)) {
    return reactive(result);
  }

  // 4. 返回结果
  return result;
}
\`\`\`

**第 3 点是关键**：懒代理。注意我们不是在 \`reactive\` 初始化时递归遍历整个对象，而是在 get 时才判断"取出来的值是不是对象"，是的话才转成响应式。这样大数据的深层属性只有在被访问时才付出代理开销，没访问的属性零成本。

生活类比：**defineProperty 是"装修时把每个房间都装上监控"，Proxy 懒代理是"只有你走进某个房间，才给它装监控"**。前者装修慢，后者装修快但走哪装哪。

\`isObject\` 的实现很简单：

\`\`\`js
function isObject(val) {
  return val !== null && typeof val === 'object';
}
\`\`\`

### 3.2 set 拦截器：修改时触发更新

\`\`\`js
set(target, key, value, receiver) {
  // 1. 记录旧值（某些场景需要，比如 trigger 时判断是否真变了）
  const oldValue = target[key];

  // 2. 判断是新增还是修改
  const hadKey = isArray(target) && isIntegerKey(key)
    ? Number(key) < target.length
    : hasOwn(target, key);

  // 3. 执行真正的赋值
  const result = Reflect.set(target, key, value, receiver);

  // 4. 只在值真正变化时触发更新（避免无意义的重复触发）
  // 注意：要先判断 hadKey，区分"新增"和"修改"两种 trigger 逻辑
  if (!hadKey) {
    // 新增属性 → trigger ADD
    trigger(target, 'add', key, value);
  } else if (hasChanged(value, oldValue)) {
    // 修改属性且值变了 → trigger SET
    trigger(target, 'set', key, value, oldValue);
  }

  return result;
}
\`\`\`

这里有两个细节：

- **为什么区分新增和修改？** 因为某些场景（比如 watch）需要知道是新增还是修改，trigger 的行为略有不同。真实 Vue 3 在 trigger 里会区分 \`TriggerOpTypes.ADD\` 和 \`TriggerOpTypes.SET\`。
- **为什么判断 \`hasChanged\`？** 如果值没变（\`oldValue === value\`），触发更新是浪费。但要注意 NaN !== NaN 的特殊情况，所以 \`hasChanged\` 写成 \`(value !== oldValue) && (value === value || oldValue === oldValue)\`。

### 3.3 deleteProperty 拦截器：删除时触发更新

\`\`\`js
deleteProperty(target, key) {
  // 1. 判断 key 是否存在
  const hadKey = hasOwn(target, key);
  const oldValue = target[key];

  // 2. 执行真正的删除
  const result = Reflect.deleteProperty(target, key);

  // 3. 只有删除成功且 key 原本存在时才触发
  if (hadKey && result) {
    trigger(target, 'delete', key);
  }

  return result;
}
\`\`\`

这个拦截器让 \`delete obj.key\` 也能触发响应式更新，这是 \`defineProperty\` 做不到的。

## 四、Reflect 的作用：正确处理 this 指向

第 3 章提过 \`Reflect\`，这里再用一个具体例子说明为什么必须用它。

假设有这样一个对象，它的属性是 getter，getter 内部又读了另一个属性：

\`\`\`js
const raw = {
  _name: '张三',
  get name() {
    return this._name;  // 注意 this
  }
};
\`\`\`

如果用 \`target[key]\` 直接读：

\`\`\`js
const proxy = new Proxy(raw, {
  get(target, key) {
    return target[key];  // ❌ this 指向 target（原始对象）
  }
});
proxy.name  // 返回 '张三'，但这次 get 只拦截了一次（name）
            // _name 的读取没被拦截，因为 this 是 raw 不是 proxy
\`\`\`

如果用 \`Reflect.get(target, key, receiver)\`：

\`\`\`js
const proxy = new Proxy(raw, {
  get(target, key, receiver) {
    return Reflect.get(target, key, receiver);  // ✅ this 指向 receiver（proxy）
  }
});
proxy.name  // 返回 '张三'，这次 get 拦截了两次（name 和 _name）
            // 因为 getter 里的 this._name，this 是 proxy，会再次触发 get 拦截
\`\`\`

**这就是 Reflect 的核心价值：保证 getter/setter 内部的 this 指向代理对象，从而使所有属性访问都经过拦截**。如果不传 \`receiver\`，嵌套的 getter 会绕过代理，导致依赖收集不全、更新不触发。

## 五、嵌套对象的懒代理

这一节详细讲"懒代理"的实现，这是 Vue 3 性能优于 Vue 2 的关键之一。

### 5.1 什么是懒代理

\`\`\`js
const state = reactive({
  user: {
    name: '张三',
    address: {
      city: '北京'
    }
  }
});

// 这一刻，只有最外层对象被 Proxy 包装
// state.user 和 state.user.address 还是原始对象（没被代理）

state.user.name  // 访问 state.user 时，get 拦截器发现 user 是对象，
                 // 于是 reactive(user) 把它转成代理再返回
                 // 接着访问代理的 .name，又触发一次 get

state.user.address.city  // 同理，address 也是访问时才被代理
\`\`\`

**懒代理的好处**：

1. 初始化快：\`reactive\` 只包一层，不递归。
2. 按需付费：没访问的深层属性永远不被代理，零成本。
3. 适合大数据：10000 项的数组，初始化只代理数组本身，访问某一项时才代理那一项。

### 5.2 实现要点

在 get 拦截器里加一段：

\`\`\`js
get(target, key, receiver) {
  track(target, key);
  const result = Reflect.get(target, key, receiver);
  if (isObject(result)) {
    return reactive(result);  // 递归代理
  }
  return result;
}
\`\`\`

注意 \`reactive(result)\` 内部有缓存（下一节），所以同一个子对象不会重复代理。

### 5.3 一个容易踩的坑

如果直接 \`return reactive(result)\` 而不缓存，每次访问 \`state.user\` 都会创建一个新的 Proxy，导致 \`state.user === state.user\` 为 \`false\`，引发各种问题（比如 ===  判断失效、依赖收集混乱）。所以缓存机制是必须的。

## 六、缓存机制：避免重复包装

\`reactive\` 的缓存要解决两个问题：

1. **同一个原始对象多次 \`reactive\`，返回同一个代理**。
2. **同一个代理再 \`reactive\`，返回它自己**（避免代理的代理）。

Vue 3 用两个 \`WeakMap\` 实现缓存：

\`\`\`js
// 原始对象 → 代理对象
const reactiveMap = new WeakMap();

// 代理对象 → 原始对象（标记用，判断"已是代理"）
const rawMap = new WeakMap();

function reactive(target) {
  // 如果不是对象，直接返回（reactive 只处理对象）
  if (!isObject(target)) return target;

  // 如果 target 已经是某个代理（即 rawMap 里有它），直接返回
  if (rawMap.has(target)) {
    return target;
  }

  // 如果 target 已经被代理过（即 reactiveMap 里有它），返回缓存的代理
  const existingProxy = reactiveMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }

  // 否则创建新代理
  const proxy = new Proxy(target, handlers);

  // 建立双向缓存
  reactiveMap.set(target, proxy);  // 原始 → 代理
  rawMap.set(proxy, target);       // 代理 → 原始

  return proxy;
}
\`\`\`

**为什么用 WeakMap 而不是 Map？** WeakMap 的 key 是弱引用，当原始对象被销毁（没有其他引用）时，对应的缓存条目会被自动 GC，不会内存泄漏。Map 会强引用 key，导致对象无法回收。

## 七、辅助函数

在写完整版之前，先把要用到的辅助函数列出来。这些小函数在真实 Vue 源码的 \`@vue/shared\` 包里：

\`\`\`js
// 判断是否是对象（reactive 只处理对象）
function isObject(val) {
  return val !== null && typeof val === 'object';
}

// 判断是否是数组
function isArray(val) {
  return Array.isArray(val);
}

// 判断 key 是否是数组的整数索引（如 '0', '1'）
function isIntegerKey(key) {
  return typeof key === 'string' &&
    key !== 'NaN' &&
    key[0] !== '-' &&
    '' + parseInt(key, 10) === key;
}

// 判断对象是否有某属性（Own，不含原型链）
function hasOwn(target, key) {
  return Object.prototype.hasOwnProperty.call(target, key);
}

// 判断两个值是否不同（处理 NaN 的特殊情况）
function hasChanged(value, oldValue) {
  // NaN !== NaN 为 true，但 NaN 是"没变"，所以单独处理
  return !Object.is(value, oldValue);
}
\`\`\`

\`hasChanged\` 用 \`Object.is\` 而不是 \`===\`，因为 \`Object.is(NaN, NaN)\` 是 \`true\`（正确），而 \`NaN === NaN\` 是 \`false\`（会导致 NaN 被误判为"变了"）。

## 八、完整版 reactive

把上面所有零件组装起来，得到完整版 \`reactive\`：

\`\`\`js
function reactive(target) {
  if (!isObject(target)) return target;
  if (rawMap.has(target)) return target;
  const existing = reactiveMap.get(target);
  if (existing) return existing;

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      // 特殊 key：__v_isReactive 标记，用于判断"是否是响应式对象"
      if (key === '__v_isReactive') return true;

      track(target, key);
      const result = Reflect.get(target, key, receiver);
      if (isObject(result)) {
        return reactive(result);
      }
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const hadKey = isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key);
      const result = Reflect.set(target, key, value, receiver);
      if (!hadKey) {
        trigger(target, 'add', key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, 'set', key, value, oldValue);
      }
      return result;
    },
    deleteProperty(target, key) {
      const hadKey = hasOwn(target, key);
      const result = Reflect.deleteProperty(target, key);
      if (hadKey && result) {
        trigger(target, 'delete', key);
      }
      return result;
    }
  });

  reactiveMap.set(target, proxy);
  rawMap.set(proxy, target);
  return proxy;
}
\`\`\`

注意 get 里有一段 \`if (key === '__v_isReactive') return true\` ——这是 Vue 的约定，响应式对象上读这个 key 返回 true，用于外部判断 \`isReactive(obj)\`。真实 Vue 的 \`isReactive\` 就是读这个标记。

## 九、本章小结

- **reactive 的四件事**：类型校验、缓存检查、创建代理、嵌套懒代理。
- **三个核心拦截器**：get（收集依赖 + 懒代理子对象）、set（区分新增/修改 + 触发更新）、deleteProperty（触发删除更新）。
- **Reflect 的作用**：正确处理 this 指向，保证 getter/setter 内部的属性访问也经过代理。
- **懒代理**：访问时才代理子对象，初始化快、按需付费。
- **缓存机制**：两个 WeakMap，避免重复包装和代理的代理。

本章的 \`reactive\` 还不能真正响应——因为我们只写了拦截器骨架，\`track\` 和 \`trigger\` 是空函数。下一章实现 \`effect\` + \`track\` + \`trigger\`，让 \`reactive\` 真正"活"起来。
`,
    code: `
// =============================================================
// 第4章示例代码：实现 reactive 函数并演示代理拦截
// -------------------------------------------------------------
// 本章完整实现 reactive 函数，包括：
//   1. 类型校验（只处理对象）
//   2. 缓存机制（避免重复包装）
//   3. Proxy handler（get/set/deleteProperty）
//   4. 懒代理（嵌套对象访问时才代理）
//   5. Reflect 正确处理 this
//
// 注意：本章的 track/trigger 还是空壳，下一章才真正实现。
// 所以这个版本能"拦截"但还不能"响应"（不会自动触发副作用）。
// =============================================================

// ---- 辅助函数 ----
// 判断是否是对象（reactive 只处理对象，原始值交给 ref）
function isObject(val) {
  return val !== null && typeof val === "object";
}

// 判断是否是数组
function isArray(val) {
  return Array.isArray(val);
}

// 判断 key 是否是数组的整数索引（'0', '1', '2'...）
// 用于 set 时区分"数组索引修改"和"对象属性修改"
function isIntegerKey(key) {
  return (
    typeof key === "string" &&
    key !== "NaN" &&
    key[0] !== "-" &&
    "" + parseInt(key, 10) === key
  );
}

// 判断对象自身是否有某属性（不含原型链）
function hasOwn(target, key) {
  return Object.prototype.hasOwnProperty.call(target, key);
}

// 判断两个值是否真的不同（用 Object.is 处理 NaN）
function hasChanged(value, oldValue) {
  // Object.is(NaN, NaN) === true，避免 NaN 被误判为"变了"
  return !Object.is(value, oldValue);
}

// ---- 缓存容器 ----
// 原始对象 → 代理对象：避免同一个对象被重复代理
const reactiveMap = new WeakMap();
// 代理对象 → 原始对象：标记"已是代理"，避免代理的代理
const rawMap = new WeakMap();

// ---- 占位的 track / trigger（下一章实现真实逻辑）----
function track(target, key) {
  // 这里先留空，下一章实现依赖收集
  // console.log(\`  [track] \${String(key)}\`);
}
function trigger(target, type, key, newVal, oldVal) {
  // 这里先留空，下一章实现派发更新
  // console.log(\`  [trigger] \${type} \${String(key)}\`);
}

// =============================================================
// 核心函数：reactive
// =============================================================
function reactive(target) {
  // 1. 类型校验：不是对象直接返回（原始值用 ref）
  if (!isObject(target)) {
    console.log("  [reactive] 非对象，直接返回:", target);
    return target;
  }

  // 2. 如果 target 已经是代理（rawMap 里有它），直接返回它自己
  // 避免对代理再套一层代理
  if (rawMap.has(target)) {
    console.log("  [reactive] 已是代理，直接返回");
    return target;
  }

  // 3. 如果 target 已经被代理过（reactiveMap 里有缓存），返回缓存
  if (reactiveMap.has(target)) {
    console.log("  [reactive] 命中缓存，返回已存在的代理");
    return reactiveMap.get(target);
  }

  // 4. 创建代理
  console.log("  [reactive] 创建新代理");
  const proxy = new Proxy(target, {
    // ---- get 拦截器 ----
    get(target, key, receiver) {
      // 特殊标记：读 __v_isReactive 返回 true，用于 isReactive 判断
      if (key === "__v_isReactive") return true;

      // 收集依赖（占位）
      track(target, key);

      // 用 Reflect 取值，receiver 保证 getter 内部的 this 指向 proxy
      const result = Reflect.get(target, key, receiver);

      // 懒代理：如果取出的值是对象，递归转成响应式
      // 这一步是"访问时才代理"，不是初始化时全量遍历
      if (isObject(result)) {
        return reactive(result);
      }
      return result;
    },

    // ---- set 拦截器 ----
    set(target, key, value, receiver) {
      // 记录旧值
      const oldValue = target[key];

      // 判断是新增还是修改
      // 数组：索引 < length 算修改，否则新增
      // 对象：hasOwn 算修改，否则新增
      const hadKey =
        isArray(target) && isIntegerKey(key)
          ? Number(key) < target.length
          : hasOwn(target, key);

      // 执行真正的赋值
      const result = Reflect.set(target, key, value, receiver);

      // 只在真正变化时触发
      if (!hadKey) {
        console.log(\`  [set] 新增属性 \${String(key)} = \${value}\`);
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        console.log(\`  [set] 修改属性 \${String(key)}: \${oldValue} -> \${value}\`);
        trigger(target, "set", key, value, oldValue);
      }
      // 值没变就不触发，避免无意义的更新

      return result; // set 必须返回布尔值
    },

    // ---- deleteProperty 拦截器 ----
    deleteProperty(target, key) {
      const hadKey = hasOwn(target, key);
      const result = Reflect.deleteProperty(target, key);
      if (hadKey && result) {
        console.log(\`  [delete] 删除属性 \${String(key)}\`);
        trigger(target, "delete", key);
      }
      return result;
    },
  });

  // 5. 建立双向缓存
  reactiveMap.set(target, proxy);
  rawMap.set(proxy, target);

  return proxy;
}

// ---- 工具函数：判断是否是响应式对象 ----
function isReactive(value) {
  // 读 __v_isReactive 标记，触发 get 拦截
  return !!(value && value.__v_isReactive);
}

// =============================================================
// 测试 demo
// =============================================================

console.log("=== 测试1：基本读写拦截 ===");
const state = reactive({ name: "张三", age: 20 });
console.log("读取 name:", state.name);
console.log("修改 age:");
state.age = 21;
console.log("新增 gender:");
state.gender = "男";
console.log("删除 name:");
delete state.name;

console.log("\\n=== 测试2：缓存机制 ===");
const raw = { x: 1 };
const p1 = reactive(raw);
const p2 = reactive(raw); // 同一个 raw，应返回 p1
console.log("p1 === p2:", p1 === p2, "← 应为 true（缓存命中）");
const p3 = reactive(p1); // 对代理再 reactive，应返回它自己
console.log("p1 === p3:", p1 === p3, "← 应为 true（已是代理）");

console.log("\\n=== 测试3：嵌套对象懒代理 ===");
const state2 = reactive({
  user: { name: "李四", addr: { city: "北京" } },
});
console.log("访问 state2.user.name（首次访问子对象，触发懒代理）:");
const userName = state2.user.name;
console.log("  结果:", userName);
console.log("再次访问 state2.user（已缓存）:");
const userAgain = state2.user;
console.log("  state2.user === state2.user:", state2.user === userAgain, "← 应为 true");

console.log("\\n=== 测试4：isReactive 判断 ===");
console.log("isReactive(state):", isReactive(state), "← 应为 true");
console.log("isReactive({a:1}):", isReactive({ a: 1 }), "← 应为 false");
console.log("isReactive(state2.user):", isReactive(state2.user), "← 应为 true（懒代理后）");

console.log("\\n=== 测试5：数组拦截 ===");
const arr = reactive([1, 2, 3]);
console.log("修改 arr[0]:");
arr[0] = 99;
console.log("push 一个元素:");
arr.push(4);
console.log("修改 length:");
arr.length = 2;
console.log("最终数组:", Array.from(arr));

console.log("\\n=== 测试6：值未变化时不触发 ===");
const state3 = reactive({ count: 5 });
console.log("设置 count = 5（值没变，应无日志）:");
state3.count = 5;
console.log("  ↑ 没有触发 set，因为 hasChanged 返回 false");
console.log("设置 count = 6（值变了，应触发）:");
state3.count = 6;

// =============================================================
// 预期输出（关键部分）：
// === 测试1：基本读写拦截 ===
//   [reactive] 创建新代理
//   读取 name: 张三
//   [set] 修改属性 age: 20 -> 21
//   [set] 新增属性 gender = 男
//   [delete] 删除属性 name
// === 测试2：缓存机制 ===
//   [reactive] 创建新代理
//   [reactive] 命中缓存，返回已存在的代理
//   p1 === p2: true
//   [reactive] 已是代理，直接返回
//   p1 === p3: true
// === 测试3：嵌套对象懒代理 ===
//   访问 state2.user.name（首次访问子对象，触发懒代理）:
//   [reactive] 创建新代理
//   结果: 李四
// === 测试5：数组拦截 ===
//   [set] 修改属性 0: 1 -> 99
//   [set] 新增属性 3 = 4
//   [set] 修改属性 length: 4 -> 2
// =============================================================
`
  },

  // =========================================================
  // 第五章：依赖收集：effect 与 track
  // =========================================================
  {
    id: "vs-effect-track",
    group: "第一部分 响应式系统",
    icon: "🎯",
    title: "依赖收集：effect 与 track",
    content: `
# 依赖收集：effect 与 track

## 一、上一章的遗留问题

第 4 章我们写好了 \`reactive\` 函数，它能拦截读写，但还不能"响应"——因为 \`track\` 和 \`trigger\` 都是空函数。本章我们把这两个函数填上，再配上 \`effect\` 函数，让响应式系统真正跑起来。

到本章结束，你将拥有一个能用的响应式系统：声明一个 effect，effect 里读响应式数据，数据变了 effect 自动重新执行。这就是 Vue 响应式的最小闭环。

## 二、effect 函数：声明副作用

### 2.1 effect 是什么

\`effect\` 是响应式系统的"入口 API"。你把一个函数 \`fn\` 传给它，它会做两件事：

1. **立即执行一次 fn**：让 fn 内部对响应式数据的读取触发 get 拦截，从而建立"fn 依赖哪些数据"的映射。
2. **记录 fn**：之后这些数据变化时，自动重新执行 fn。

用伪代码表示：

\`\`\`js
function effect(fn) {
  // 1. 把 fn 标记为"当前正在执行的副作用"
  activeEffect = fn;
  // 2. 执行 fn，触发其内部的 get，从而 track
  fn();
  // 3. 清理 activeEffect
  activeEffect = null;
}
\`\`\`

### 2.2 为什么用全局变量 activeEffect

这是响应式系统最反直觉的设计之一。数据被读时，\`track\` 需要知道"是谁在读我"，但 \`get\` 拦截器拿不到这个信息——它只知道"某个 key 被读了"。怎么把"读的人"传进去？

一个自然的想法是给 \`track\` 加参数：\`track(target, key, whoIsReading)\`。但 \`get\` 拦截器不知道 \`whoIsReading\` 是谁。除非用全局变量传递。

Vue 的解法就是全局变量 \`activeEffect\`：

- \`effect(fn)\` 执行时，把 \`fn\` 赋给 \`activeEffect\`。
- \`fn\` 执行过程中读响应式数据，触发 \`get\` → \`track\`，\`track\` 从 \`activeEffect\` 拿到当前副作用。

生活类比：**activeEffect 像是医院的"当前主刀医生"指示牌**。手术中（effect 执行中），指示牌亮着主刀医生的名字。任何器械调用（get/track）都看指示牌知道"谁在用"。手术结束，指示牌清空。

### 2.3 effect 的进阶细节

真实 Vue 的 \`effect\` 还支持：

- **懒执行**：\`effect(fn, { lazy: true })\` 不立即执行 fn，由调用方决定何时跑（computed 用到）。
- **调度器**：\`effect(fn, { scheduler: cb })\` 数据变化时不直接跑 fn，而是跑 cb（让 cb 决定何时跑 fn，比如用 queueJob 批量更新）。
- **返回 runner**：\`effect\` 返回一个函数，手动调用它也能重新执行 fn。
- **嵌套**：effect 内部可以再开 effect，靠栈式管理 activeEffect。

本章先实现最基础版（立即执行 + 全局 activeEffect），后续章节再加这些细节。

### 2.4 嵌套 effect 的处理

最简单的 \`activeEffect\` 在嵌套时会出问题：

\`\`\`js
effect(() => {        // outer
  state.a;
  effect(() => {      // inner
    state.b;
  });
  state.c;  // ❌ 此时 activeEffect 是 inner！state.c 会被错误记到 inner
});
\`\`\`

解法是**用栈保存**：进入 effect 时把当前 activeEffect 压栈，执行完再弹栈恢复。

\`\`\`js
function effect(fn) {
  const prev = activeEffect;  // 保存外层
  activeEffect = fn;
  fn();
  activeEffect = prev;        // 恢复外层
}
\`\`\`

真实 Vue 用更精细的 \`effectScope\` 机制，但核心思路一致：保存-设置-恢复。

## 三、track：在 get 中收集依赖

### 3.1 track 的职责

\`track(target, key)\` 在 get 拦截器里被调用，它要做的事是：**把当前 activeEffect 记录到"target 的 key 属性"的依赖集合里**。

如果没有 activeEffect（普通读取，不在任何 effect 内），直接返回，不收集。

### 3.2 三级依赖存储结构

这是 Vue 响应式系统最精巧的设计之一。依赖关系存储成一个三级结构：

\`\`\`text
WeakMap<原始对象, Map<属性名, Set<effect>>>
         │              │          │
         │              │          └─ 哪些 effect 依赖了这个属性
         │              └─ 这个对象的哪个属性
         └─ 哪个对象
\`\`\`

为什么是三级？

- **第一级 WeakMap**：key 是原始对象，弱引用，对象销毁时自动 GC。
- **第二级 Map**：key 是属性名，因为一个对象有多个属性，每个属性各自的依赖。
- **第三级 Set**：存 effect 集合，自动去重（同一个 effect 多次读同一属性只记一次）。

生活类比：**图书馆的借阅索引**。

- 第一级 WeakMap：按"书架"（对象）索引。
- 第二级 Map：每个书架上按"书名"（属性名）索引。
- 第三级 Set：每本书的借阅名单（effect 集合），同一人借多次只记一次。

\`\`\`text
targetMap (WeakMap)
├── rawObj1 (对象) → depsMap (Map)
│                    ├── 'name' → dep (Set) [effect1, effect2]
│                    └── 'age'  → dep (Set) [effect1]
└── rawObj2 (对象) → depsMap (Map)
                      └── 'count' → dep (Set) [effect3]
\`\`\`

### 3.3 track 的实现

\`\`\`js
const targetMap = new WeakMap();  // 全局依赖表

function track(target, key) {
  // 没有 activeEffect，说明不在 effect 内，不收集
  if (!activeEffect) return;

  // 第一级：找 target 对应的 depsMap
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  // 第二级：找 key 对应的 dep
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  // 第三级：把 activeEffect 加入 dep
  dep.add(activeEffect);
}
\`\`\`

注意每一级都是"找不到就新建"，这是懒初始化——只有真正有依赖时才建表，省内存。

### 3.4 为什么不用二维结构

有人会问：为什么不直接用 \`Map<"\${target}-\${key}", Set<effect>>\` 这种二维结构？两个原因：

1. **GC 友好**：WeakMap 的 key 是对象弱引用，对象销毁时整个条目自动消失。二维 Map 的 key 是字符串，对象销毁后字符串还在，无法 GC，内存泄漏。
2. **target 作为 key 更自然**：target 是对象，用 WeakMap 以对象为 key，查起来直接。拼字符串需要给每个对象分配唯一 id，麻烦。

## 四、trigger：在 set 中派发更新

### 4.1 trigger 的职责

\`trigger(target, type, key)\` 在 set/deleteProperty 拦截器里调用，它要做的事是：**找到 target 的 key 属性的所有 effect，逐个执行**。

### 4.2 trigger 的实现

\`\`\`js
function trigger(target, type, key) {
  // 第一级：找 target 的 depsMap
  const depsMap = targetMap.get(target);
  if (!depsMap) return;  // 没人依赖这个对象

  // 第二级：找 key 的 dep
  const dep = depsMap.get(key);
  if (dep) {
    // 第三级：执行所有 effect
    // 注意：要复制一份再遍历，避免执行时 effect 内又修改 dep 导致死循环
    [...dep].forEach(effect => effect());
  }
}
\`\`\`

### 4.3 为什么要复制再遍历

这是个隐蔽的坑。如果直接 \`dep.forEach(effect => effect())\`，而某个 effect 内部又读了这个属性（重新 track）或写了这个属性（重新 trigger），就可能：

- 死循环：effect 里 \`state.count++\`，trigger 触发 effect，effect 又 trigger……
- Set 迭代时被修改：JS 规定 Set 迭代时如果被增删，行为是"已访问的不变，未访问的按当前状态"，可能导致漏执行或多执行。

复制一份再遍历就避免了这些问题：\`[...dep].forEach(...)\`。

### 4.4 type 参数的用途

真实 Vue 的 trigger 还会根据 \`type\` 处理特殊情况：

- **ADD（新增属性）**：要触发依赖"迭代"的 effect（比如 \`Object.keys\`、\`for...in\` 这种遍历操作）。
- **DELETE（删除属性）**：同上。
- **SET（修改属性）**：只触发依赖这个 key 的 effect。

本章简化处理，所有 type 都触发依赖 key 的 effect。后续章节再细化。

## 五、把 reactive、effect、track、trigger 拼起来

现在我们把第 4 章的 \`reactive\` 和本章的 \`effect/track/trigger\` 拼成一个完整响应式系统：

\`\`\`js
// 全局变量
let activeEffect = null;
const targetMap = new WeakMap();

// effect：声明副作用
function effect(fn) {
  const prev = activeEffect;
  activeEffect = fn;
  fn();
  activeEffect = prev;
}

// track：收集依赖
function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) { depsMap = new Map(); targetMap.set(target, depsMap); }
  let dep = depsMap.get(key);
  if (!dep) { dep = new Set(); depsMap.set(key, dep); }
  dep.add(activeEffect);
}

// trigger：派发更新
function trigger(target, type, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (dep) [...dep].forEach(effect => effect());
}

// reactive：第4章的版本，track/trigger 现在是真实实现
function reactive(target) {
  if (!isObject(target)) return target;
  // ...（同第4章）
  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      if (key === '__v_isReactive') return true;
      track(target, key);
      const result = Reflect.get(target, key, receiver);
      if (isObject(result)) return reactive(result);
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (hasChanged(value, oldValue)) trigger(target, 'set', key, value);
      return result;
    }
  });
  return proxy;
}
\`\`\`

拼好后，下面这段代码就能真正"响应"了：

\`\`\`js
const state = reactive({ count: 0 });

effect(() => {
  console.log('count 是', state.count);  // 读 count，建立依赖
});

state.count = 1;  // 打印 "count 是 1"
state.count = 2;  // 打印 "count 是 2"
\`\`\`

\`effect\` 注册时立即执行一次，建立 \`count → effect\` 的依赖；之后每次 \`state.count = x\` 触发 set → trigger，重新执行 effect。**这就是响应式的完整闭环**。

## 六、一个进阶例子：computed 的雏形

虽然 \`computed\` 要到后续章节才正式实现，但有了 \`effect + track + trigger\`，你已经能理解它的核心原理了。computed 本质是"带缓存的 effect"：

\`\`\`js
function computed(getter) {
  let value;          // 缓存值
  let dirty = true;   // 是否需要重算
  // 用 effect 包装 getter，但 lazy 不立即执行
  // getter 依赖的数据变化时，标记 dirty = true
  effect(() => {
    value = getter();
    dirty = false;
  });
  return {
    get value() {
      if (dirty) {
        value = getter();
        dirty = false;
      }
      return value;
    }
  };
}
\`\`\`

核心思路：getter 被包在 effect 里，它依赖的数据变化时 effect 重新执行，标记 dirty。外部读 \`.value\` 时，dirty 就重算，否则返回缓存。这个模式叫"懒求值 + 脏标记"。后续章节会完整实现，这里只是让你感受 effect 的扩展能力。

## 七、依赖收集的完整流程图

把本章所有机制串起来，一次完整的依赖收集和更新触发是这样的：

\`\`\`text
注册阶段：
  effect(fn)
    ├─ activeEffect = fn
    ├─ fn() 执行
    │    └─ 读 state.count
    │         └─ Proxy get 拦截
    │              └─ track(state, 'count')
    │                   └─ targetMap[state]['count'].add(fn)
    └─ activeEffect = null

触发阶段：
  state.count = 1
    └─ Proxy set 拦截
         └─ trigger(state, 'set', 'count')
              └─ 找到 targetMap[state]['count'] = [fn]
                   └─ fn() 重新执行
\`\`\`

理解这张图，你就理解了 Vue 响应式系统的全部核心。后续所有进阶（ref、computed、watch、依赖清理、调度器）都是在这个骨架上加肉。

## 八、常见疑问

### 8.1 为什么 effect 里读数据能自动建立依赖？

因为读数据会触发 Proxy 的 get 拦截，get 里调用了 track。track 从全局 activeEffect 拿到当前副作用，记进依赖表。这条链路是：读 → get 拦截 → track → 记录 activeEffect。所以"读"这个动作本身就是建立依赖的契机。

### 8.2 如果 effect 里读了多个属性，会建立多个依赖吗？

会。effect 里读 N 个属性，就触发 N 次 track，建立 N 条依赖。任何一条对应的数据变化，effect 都会重新执行。比如：

\`\`\`js
effect(() => {
  console.log(state.a + state.b);  // 读 a 和 b，建立两条依赖
});
state.a = 1;  // 触发 effect
state.b = 2;  // 也触发 effect
\`\`\`

### 8.3 如果 effect 里条件性地读数据呢？

\`\`\`js
effect(() => {
  if (state.show) {
    console.log(state.text);  // 只有 show 为 true 才读 text
  }
});
\`\`\`

这种情况下，依赖是**动态**的：show 为 true 时，依赖 { show, text }；show 为 false 时，只依赖 { show }。每次 effect 重新执行，依赖都会重新收集（旧的会被清理，这是后续章节的"依赖清理"）。这正是响应式的灵活性——依赖关系跟着执行路径走，不是静态固定的。

### 8.4 同一个属性被多个 effect 依赖怎么办？

没问题，三级结构的第三级是 Set，自动容纳多个 effect。trigger 时遍历 Set，所有依赖的 effect 都执行。

## 九、本章小结

- **effect**：声明副作用，立即执行一次建立依赖，之后数据变化自动重新执行。
- **activeEffect**：全局变量，传递"当前正在执行的副作用"，是 track 能知道"谁在读"的关键。
- **track**：在 get 中把 activeEffect 记入依赖表。
- **trigger**：在 set 中找到依赖表的 effect 集合，逐个执行。
- **三级存储**：WeakMap（对象）→ Map（属性）→ Set（effect），兼顾 GC、查询、去重。
- **完整闭环**：effect 注册 → track 收集 → 数据变化 → trigger 派发 → effect 重新执行。

到本章为止，我们拥有了一个能用的响应式系统。下一批章节会继续完善它：\`ref\` 处理原始值、\`computed\` 实现计算属性、依赖清理避免过期依赖、调度器实现批量更新。响应式系统的精妙才刚刚展开。
`,
    code: `
// =============================================================
// 第5章示例代码：实现 effect 和 track，演示数据变化自动触发副作用
// -------------------------------------------------------------
// 本章实现响应式系统的核心闭环：
//   1. effect(fn)     —— 声明副作用，立即执行 fn 建立依赖
//   2. track(target, key) —— 在 get 中收集依赖
//   3. trigger(target, key) —— 在 set 中派发更新
//   4. 三级依赖存储 WeakMap → Map → Set
//
// 配合第4章的 reactive，组成一个能真正响应的响应式系统。
// =============================================================

// ---- 辅助函数（同第4章）----
function isObject(val) {
  return val !== null && typeof val === "object";
}
function hasChanged(value, oldValue) {
  return !Object.is(value, oldValue);
}

// =============================================================
// 核心：响应式系统的三大支柱
// =============================================================

// ---- 全局变量：当前正在执行的副作用 ----
// 这是 track 能知道"谁在读数据"的关键
// 生活类比：医院手术室的"当前主刀医生"指示牌
let activeEffect = null;

// ---- 三级依赖存储 ----
// 结构：WeakMap<原始对象, Map<属性名, Set<effect>>>
//   第一级 WeakMap：按对象索引，弱引用，对象销毁时自动 GC
//   第二级 Map：按属性名索引，一个对象有多个属性
//   第三级 Set：存 effect 集合，自动去重
// 生活类比：图书馆索引——书架(对象) → 书名(属性) → 借阅名单(effect)
const targetMap = new WeakMap();

// ---- effect 函数：声明副作用 ----
// 传入 fn，立即执行一次建立依赖，之后数据变化自动重新执行
function effect(fn) {
  // 保存外层 activeEffect（支持嵌套 effect）
  const prev = activeEffect;
  // 设置当前副作用
  activeEffect = fn;
  // 立即执行 fn，触发其内部的 get → track，建立依赖
  fn();
  // 恢复外层 activeEffect
  activeEffect = prev;
}

// ---- track 函数：在 get 中收集依赖 ----
// 把当前 activeEffect 记录到 target 的 key 属性的依赖集合里
function track(target, key) {
  // 没有 activeEffect 说明不在 effect 内，是普通读取，不收集
  if (!activeEffect) return;

  // 第一级：从 WeakMap 找 target 的依赖表
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  // 第二级：从 depsMap 找 key 的依赖集合
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  // 第三级：把当前副作用加入集合（Set 自动去重）
  dep.add(activeEffect);
}

// ---- trigger 函数：在 set 中派发更新 ----
// 找到 target 的 key 属性的所有 effect，逐个执行
function trigger(target, type, key) {
  // 第一级：找 target 的依赖表
  const depsMap = targetMap.get(target);
  if (!depsMap) return; // 没人依赖这个对象

  // 第二级：找 key 的依赖集合
  const dep = depsMap.get(key);
  if (!dep) return; // 没人依赖这个属性

  // 第三级：遍历执行所有 effect
  // 关键：复制一份再遍历！
  // 因为 effect 执行时可能又读/写数据，修改 dep，导致迭代异常或死循环
  const effects = [...dep];
  effects.forEach((fn) => fn());
}

// =============================================================
// reactive 函数：第4章版本，现在 track/trigger 是真实实现
// =============================================================
function reactive(target) {
  if (!isObject(target)) return target;

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      if (key === "__v_isReactive") return true;
      // 收集依赖
      track(target, key);
      // Reflect 保证 this 指向正确
      const result = Reflect.get(target, key, receiver);
      // 懒代理：子对象访问时才转响应式
      if (isObject(result)) {
        return reactive(result);
      }
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      // 只在值真变了时触发
      if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value);
      }
      return result;
    },
    deleteProperty(target, key) {
      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      const result = Reflect.deleteProperty(target, key);
      if (hadKey && result) {
        trigger(target, "delete", key);
      }
      return result;
    },
  });

  return proxy;
}

// =============================================================
// 下面跑一个完整的 demo，验证响应式闭环
// =============================================================

console.log("=== 测试1：基础响应式 ===");
const state = reactive({ count: 0 });

// 注册一个副作用（模拟视图渲染）
effect(() => {
  console.log(\`  视图: count = \${state.count}\`);
});

console.log("修改 count = 1:");
state.count = 1;
console.log("修改 count = 2:");
state.count = 2;

console.log("\\n=== 测试2：一个 effect 依赖多个属性 ===");
effect(() => {
  // 这个 effect 读了 firstName 和 lastName，建立了两条依赖
  console.log(\`  全名: \${state.firstName || ""}\${state.lastName || ""}\`);
});

console.log("设置 firstName:");
state.firstName = "张";
console.log("设置 lastName:");
state.lastName = "三";

console.log("\\n=== 测试3：多个 effect 依赖同一属性 ===");
const state2 = reactive({ value: 10 });

effect(() => {
  console.log(\`  effectA: value 的两倍 = \${state2.value * 2}\`);
});
effect(() => {
  console.log(\`  effectB: value 的平方 = \${state2.value * state2.value}\`);
});

console.log("修改 value = 5（两个 effect 都应触发）:");
state2.value = 5;

console.log("\\n=== 测试4：条件性依赖（动态依赖的局限）===");
const state3 = reactive({ show: true, text: "你好" });

effect(() => {
  // 当 show 为 true 时，会读 show 和 text，建立两条依赖
  // 当 show 为 false 时，只读 show，理应只依赖 show
  if (state3.show) {
    console.log(\`  显示: \${state3.text}\`);
  } else {
    console.log("  隐藏");
  }
});

console.log("修改 text（show=true，应触发）:");
state3.text = "世界";
console.log("设置 show=false（应触发）:");
state3.show = false;
console.log("再修改 text（show=false）:");
state3.text = "不应触发";
console.log("  ↑ 注意：text 仍然触发了 effect（打印了'隐藏'）！");
console.log("  这是因为当前实现还没有'依赖清理'机制，");
console.log("  旧的 text 依赖仍留在依赖表里。后续章节会实现 cleanup 解决此问题。");

console.log("\\n=== 测试5：嵌套对象响应式 ===");
const state4 = reactive({
  user: { name: "李四", age: 25 },
});

effect(() => {
  // 读 state4.user.name 会触发懒代理 user，然后 track name
  console.log(\`  用户: \${state4.user.name}, \${state4.user.age}岁\`);
});

console.log("修改 user.name:");
state4.user.name = "王五";
console.log("修改 user.age:");
state4.user.age = 26;

console.log("\\n=== 测试6：数组响应式 ===");
const list = reactive([1, 2, 3]);

effect(() => {
  // 读 list 的 join，会触发对 join 方法 + 各索引的读取
  console.log(\`  列表: \${list.join(", ")}\`);
});

console.log("push 一个元素:");
list.push(4);
console.log("修改索引:");
list[0] = 99;
console.log("pop 一个元素:");
list.pop();

console.log("\\n=== 测试7：删除属性响应 ===");
const state5 = reactive({ a: 1, b: 2 });

effect(() => {
  console.log(\`  state5.a = \${state5.a}\`);
});

console.log("删除 a:");
delete state5.a;
console.log("  ↑ 删除后再次读取，a 是 undefined");

// =============================================================
// 预期输出（关键部分）：
// === 测试1：基础响应式 ===
//   视图: count = 0        （effect 立即执行一次）
//   修改 count = 1:
//   视图: count = 1        （数据变化自动触发）
//   修改 count = 2:
//   视图: count = 2
// === 测试2：一个 effect 依赖多个属性 ===
//   全名:                  （初始都为 undefined）
//   设置 firstName:
//   全名: 张
//   设置 lastName:
//   全名: 张三
// === 测试3：多个 effect 依赖同一属性 ===
//   effectA: value 的两倍 = 20
//   effectB: value 的平方 = 100
//   修改 value = 5（两个 effect 都应触发）:
//   effectA: value 的两倍 = 10
//   effectB: value 的平方 = 25
// === 测试4：条件性依赖（动态依赖的局限）===
//   显示: 你好
//   修改 text（show=true，应触发）:
//   显示: 世界
//   设置 show=false（应触发）:
//   隐藏
//   再修改 text（show=false）:
//   隐藏                          ← 仍触发！因为没有依赖清理
//   ↑ 注意：text 仍然触发了 effect
// =============================================================
`
  }
];
