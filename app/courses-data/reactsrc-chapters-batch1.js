// =============================================================
// React 源码构建教程 —— 第一批章节（开篇 + JSX 与虚拟 DOM，共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. rs-what-is-react   — React 到底是什么：声明式 UI 的本质
//   2. rs-project-setup   — 从零开始：搭建 Mini React 项目
//   3. rs-jsx-secret      — JSX 背后的秘密：Babel 转译原理
//   4. rs-create-element  — 手写 createElement：创建虚拟 DOM
//   5. rs-vdom-structure  — 虚拟 DOM 的数据结构：树形组织
//
// 每个章节对象的结构：
//   id      : 唯一标识（rs- 前缀代表 react source）
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
//   - 没有浏览器 DOM，所以 demo 用纯 JS 对象模拟 DOM 节点
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：React 到底是什么：声明式 UI 的本质
  // =========================================================
  {
    id: "rs-what-is-react",
    group: "开篇：React 的核心本质",
    icon: "🎯",
    title: "React 到底是什么：声明式 UI 的本质",
    content: `
# React 到底是什么：声明式 UI 的本质

## 一、先破除一个常见误解

很多初学者第一次接触 React 时，会本能地把它和 Vue、Angular 放在一起，统称为"前端三大框架"。但如果你去翻 React 的官方文档，第一句话就写得很清楚——**"React is a JavaScript library for building user interfaces."**（React 是一个用于构建用户界面的 JavaScript 库）。

注意那个词：**library（库）**，不是 framework（框架）。

库和框架的区别是什么？用一个生活类比：**库像是一个工具箱，你挑里面的工具来用，主动权在你；框架像是一栋已经搭好骨架的房子，你只能在指定位置填砖加瓦，主动权在框架。** 你调用库的代码，框架的代码调用你。React 只关心"把数据渲染成视图"这一件事，路由、状态管理、数据获取、构建工具，它都不管，全交给生态。

这一点非常重要，因为它直接决定了我们阅读 React 源码的视角——我们不是在看一个包罗万象的巨型框架，而是在看一个**专注做好一件事**的精巧库。这件事就是：**用声明式的方式描述 UI，并高效地把它渲染出来。**

## 二、声明式 vs 命令式：点餐与做菜

理解 React 的第一把钥匙，是搞清楚"声明式"和"命令式"的差别。

### 2.1 生活类比：在餐厅点餐

想象你去餐厅吃饭，有两种方式吃到一道菜：

**命令式（自己进厨房做）**：
1. 走到冰箱前，打开门，拿出一颗西红柿
2. 走到水槽，洗西红柿
3. 拿刀，切西红柿
4. 打开灶台，调大火
5. 倒油，等油热
6. 放西红柿，翻炒
7. 加盐，出锅
8. 端到桌上

每一步你都在**告诉厨师"怎么做"**，关注的是过程。

**声明式（直接点餐）**：
- "服务员，来一份西红柿炒鸡蛋。"

你只**告诉服务员"要什么"**，至于怎么做、谁来做、用几个西红柿，你完全不关心。后厨自己搞定。

### 2.2 对应到编程

把这个类比搬到写代码上，差别就一目了然了。假设我们要用原生 JS 把页面上一个数字从 0 变成 1，**命令式**写法长这样：

\`\`\`js
// 命令式：一步步告诉浏览器怎么做
const counterEl = document.getElementById('counter'); // 第一步：找到元素
counterEl.textContent = '1';                          // 第二步：修改文本
counterEl.style.color = 'red';                        // 第三步：改颜色
\`\`\`

你必须精确地描述：先找谁、改什么、怎么改。每一步都是对浏览器的"指令"。

而**声明式**写法（React 风格）是这样的：

\`\`\`jsx
// 声明式：只描述"UI 应该长什么样"，不描述"怎么改"
function Counter({ count }) {
  return <div style={{ color: count > 0 ? 'red' : 'black' }}>{count}</div>;
}
// 数据变了，React 自己去算怎么改 DOM
\`\`\`

你只描述"count 等于 1 的时候，UI 应该长这样"，**至于怎么把 DOM 从旧样子改成新样子，React 自己算**。这就是声明式的核心——**你描述结果，框架处理过程**。

### 2.3 声明式为什么更值得选

| 维度 | 命令式 | 声明式 |
|------|--------|--------|
| 关注点 | 怎么做（过程） | 是什么（结果） |
| 代码量 | 多，每步都要写 | 少，只写最终状态 |
| 易错性 | 高，容易漏步骤或顺序错 | 低，框架保证一致性 |
| 可维护性 | 差，状态多了会乱 | 好，UI 是数据的函数 |
| 性能调优 | 手动优化，难 | 框架帮忙做 diff 优化 |

声明式最大的好处是**可预测性**：UI 永远是当前数据的映射，数据相同，UI 必然相同。这就像你点同样的菜，餐厅不管换了哪个厨师，端上来的"西红柿炒鸡蛋"都应该是那个样子。而命令式代码里，同样的最终状态可能由完全不同的操作序列达成，调试时你会疯狂追问"到底是谁、在哪一步、把 DOM 改错了"。

## 三、React 的三大核心思想

React 之所以能把声明式 UI 做好，靠的是三根支柱。理解了它们，你就理解了 React 源码的整个骨架。

### 3.1 虚拟 DOM（Virtual DOM）

真实 DOM 是个"重型"对象——一个普通的 \`<div>\` 在浏览器里有上百个属性和方法。直接操作真实 DOM 很慢，因为每次操作都可能触发重排重绘。

React 的做法是：**在内存里维护一棵轻量的"假 DOM 树"**（就是普通的 JS 对象），数据变了先改这棵假树，然后 React 把新旧两棵假树做对比（diff），算出"真实 DOM 最少需要改哪些地方"，最后只把那几处改动应用到真实 DOM 上。

类比一下：**虚拟 DOM 像是建筑设计师画的图纸，真实 DOM 是盖好的楼。** 改图纸比拆楼重建便宜得多。设计师在图纸上反复修改方案，最后只把"必须改"的几面墙让施工队去动，这样成本最低。

### 3.2 组件化（Componentization）

React 把 UI 拆成一个个独立、可复用的"组件"。一个组件就是一个返回 UI 描述的函数。

\`\`\`jsx
// 一个 Button 组件：输入 props，输出 UI 描述
function Button({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>;
}
\`\`\`

组件化的好处和"乐高积木"一样：**用少量基础零件，组合出复杂结构**。一个页面可能由几十个组件拼成，但每个组件自己都很简单。组件之间通过 props（属性）传递数据，像函数参数一样清晰。

### 3.3 单向数据流（Unidirectional Data Flow）

在 React 里，数据永远从父组件流向子组件（通过 props），子组件不能反向修改父组件的数据。如果子组件要触发变化，它只能调用父组件传下来的回调函数，由父组件更新状态，再让新数据流回来。

这就像**公司的指挥链**：上级给下级下指令（props 往下传），下级不能直接改上级的决策，只能汇报（调用回调），上级根据汇报做新决策再下传。这种单向性让数据流向永远清晰可追，避免了双向绑定那种"谁都能改谁"的混乱。

| 特性 | 双向绑定（早期 Vue/MVVM） | 单向数据流（React） |
|------|--------------------------|---------------------|
| 数据流向 | 双向，互相影响 | 单向，父→子 |
| 调试难度 | 高，变化来源多 | 低，来源唯一 |
| 适合场景 | 简单表单 | 复杂应用 |
| 状态追溯 | 难 | 容易 |

## 四、React 源码的整体结构

React 的源码并不是一个单一的包，而是拆成了多个职责清晰的 package。我们在后续章节会陆续手写其中几个核心模块，所以先从宏观上认识一下这张"地图"。

### 4.1 核心 packages 一览

| 包名 | 职责 | 类比 |
|------|------|------|
| \`react\` | 对外 API 入口，提供 createElement、Component、Hooks 等 | 餐厅的菜单 |
| \`react-reconciler\` | 协调器，做 diff、划分更新优先级、决定哪些要改 | 后厨的主厨，决定怎么做 |
| \`react-dom\` | 把虚拟 DOM 渲染成浏览器真实 DOM 的渲染器 | 把菜端上桌的服务员 |
| \`scheduler\` | 调度器，决定什么时候执行更新任务 | 餐厅的排号系统 |
| \`shared\` | 公共工具和常量 | 后厨的公共调料区 |

### 4.2 它们怎么协作

一次更新的流程大致是：

1. 你调用 \`setState\` 或 \`useState\` 的 setter，触发更新。
2. \`react-reconciler\` 接管，开始对新旧虚拟 DOM 做 diff。
3. \`scheduler\` 负责把 diff 任务切片，避免长时间占用主线程卡顿。
4. diff 完成后，\`react-reconciler\` 把"需要做的改动"告诉 \`react-dom\`。
5. \`react-dom\` 调用真实的 DOM API，把改动落到页面上。

本教程我们会**从零手写**这套机制的最小版本：自己实现 createElement、自己写 render、自己做 diff。走完之后，再看 React 源码你会觉得"原来如此"，而不是"天书"。

## 五、本章小结

- React 是**库**不是框架，只管"数据→视图"这一件事。
- React 是**声明式**的：你描述 UI 应该长什么样，React 负责把它落地。
- 三大支柱：**虚拟 DOM**（轻量假树做 diff）、**组件化**（乐高式拼装）、**单向数据流**（数据流向清晰）。
- 源码分多个 package，核心是 \`react\` / \`react-reconciler\` / \`react-dom\` / \`scheduler\`。

下一章我们会动手搭起 Mini React 的项目骨架，并写第一个能跑的"渲染函数"。
`,
    code: `// ============================================================
// 第一章代码演示：命令式 vs 声明式 —— 用计数器对比两种范式
// ============================================================
// 由于运行环境是 Node.js（没有真实 DOM），我们用一个"模拟 DOM"
// 对象来演示两种范式的差别。核心是逻辑对比，不是真实 DOM 操作。

// ---- 先造一个极简的"模拟 DOM"环境 ----
// 用一个普通 JS 对象模拟一个 DOM 节点
function createMockDOM(tag, text) {
  return {
    tag: tag,                 // 标签名，如 'div'
    text: text,               // 文本内容
    style: {},                // 样式对象
    setText(t) { this.text = t; },          // 模拟 textContent 赋值
    setStyle(k, v) { this.style[k] = v; },  // 模拟 style.xxx = yyy
  };
}

// ============================================================
// 方式一：命令式 —— 一步步告诉机器"怎么做"
// ============================================================
// 命令式的特点是：你必须精确描述每一个操作步骤
function imperativeCounter() {
  console.log('--- 命令式计数器 ---');
  // 第 1 步：创建 DOM 节点
  const el = createMockDOM('div', '0');
  // 第 2 步：手动把文本改成 1
  el.setText('1');
  // 第 3 步：手动改颜色
  el.setStyle('color', 'red');
  console.log('当前显示:', el.text, '颜色:', el.style.color);

  // 第 4 步：再加 1，又要手动改
  el.setText('2');
  el.setStyle('color', 'red');
  console.log('当前显示:', el.text, '颜色:', el.style.color);

  // 问题：每次状态变化，你都要重复写"找节点→改文本→改样式"
  // 状态一多，代码就会变成一堆机械操作，极易遗漏步骤
}

// ============================================================
// 方式二：声明式 —— 只描述"UI 应该长什么样"
// ============================================================
// 声明式的特点是：你写一个函数，输入状态，输出 UI 描述
// 至于怎么把旧 UI 改成新 UI，交给"渲染器"去算
function declarativeCounter() {
  console.log('--- 声明式计数器 ---');

  // 1. 写一个"组件函数"：输入 count，输出 UI 的描述对象
  function Counter(count) {
    return {
      tag: 'div',
      text: String(count),
      style: { color: count > 0 ? 'red' : 'black' }
    };
  }

  // 2. 写一个极简的"渲染器"：把新描述应用到模拟 DOM 上
  function render(vdom, el) {
    el.tag = vdom.tag;
    el.setText(vdom.text);
    for (const k in vdom.style) {
      el.setStyle(k, vdom.style[k]);
    }
  }

  // 3. 状态变化时，只要重新调用 Counter，渲染器自动同步
  const el = createMockDOM('div', '');
  let count = 0;

  count = 1;
  render(Counter(count), el);   // 只描述"count=1 时 UI 长这样"
  console.log('当前显示:', el.text, '颜色:', el.style.color);

  count = 2;
  render(Counter(count), el);   // 只描述"count=2 时 UI 长这样"
  console.log('当前显示:', el.text, '颜色:', el.style.color);

  count = 0;
  render(Counter(count), el);   // 回到 0，颜色自动变黑
  console.log('当前显示:', el.text, '颜色:', el.style.color);
}

// ============================================================
// 运行两种方式，对比输出
// ============================================================
imperativeCounter();
console.log('');
declarativeCounter();

console.log('');
console.log('💡 对比结论：');
console.log('   命令式：每次变化都要手写 3 步操作，容易漏');
console.log('   声明式：只写"状态→UI"的映射，渲染器自动同步');
console.log('   这就是 React 的核心思想：UI = f(state)');
`
  },

  // =========================================================
  // 第二章：从零开始：搭建 Mini React 项目
  // =========================================================
  {
    id: "rs-project-setup",
    group: "开篇：React 的核心本质",
    icon: "🏗️",
    title: "从零开始：搭建 Mini React 项目",
    content: `
# 从零开始：搭建 Mini React 项目

## 一、为什么要从零构建 Mini React

你可能会问：React 都已经开源了，直接看源码不就行了？为什么要自己从零搭一个"迷你版"？

### 1.1 看源码的三大障碍

直接啃 React 源码，你会撞上三堵墙：

**第一堵墙：体量太大。** React 仓库有十几万行代码，光 \`react-reconciler\` 一个包就有上千个文件。你打开一个函数，跳进去发现它调用了另一个函数，再跳进去又跳进去……很快就迷路了。就像你第一次进一座大城市的地铁网，看不到全貌，只能在换乘通道里转圈。

**第二堵墙：优化太多。** 真实的 React 源码里塞满了为性能、兼容性、Fiber 架构、并发模式服务的代码。一个 \`createElement\` 看似简单，源码里却为了 dev 警告、key 校验、Symbol 标记做了一大堆额外操作。这些"装饰"会遮住核心逻辑，让你以为"原来这么复杂"，其实核心只有几行。

**第三堵墙：抽象太深。** React 源码用了大量设计模式——单例、工厂、调度队列、链表树。没有上下文直接读，等于没戴眼镜看视力表——全是糊的。

### 1.2 手写 Mini React 是怎么破墙的

从零构建一个"只保留核心逻辑"的 Mini React，相当于**把地铁网简化成一条直线**：起点是"数据"，终点是"DOM"，中间只有几个关键站。每站你都亲手搭建，明白它为什么存在、解决什么问题。等这条主线跑通了，你再回头看真实源码，会发现那些复杂的东西都是在主线上加的"支线"，你已经有了一张地图，不会被支线带跑。

打个比方：**学开车，先在空场上练油门刹车方向盘，而不是直接上早高峰的高架桥。** 空场就是 Mini React，高架桥就是真实源码。先掌握核心，再应对复杂。

### 1.3 我们的目标

本教程结束时，你会拥有一个能做这些事的 Mini React：

- 解析 JSX，生成虚拟 DOM
- 把虚拟 DOM 渲染成真实 DOM（用 Node.js 模拟）
- 实现 Fiber 架构的雏形，支持任务切片
- 实现 Reconciler，做新旧虚拟 DOM 的 diff
- 实现 Function Component 和 Hooks（useState、useEffect）

听起来很多？别怕，我们一章一章来，每章只前进一小步。

## 二、Mini React 的文件结构规划

真实 React 拆成了几十个 package，我们的 Mini React 也会按职责拆分，但只保留最核心的几个文件。规划如下：

\`\`\`
mini-react/
├── core/
│   ├── createElement.js    // 创建虚拟 DOM 节点
│   ├── render.js           // 把虚拟 DOM 渲染成"真实 DOM"
│   ├── reconciler.js       // diff 算法，决定如何更新
│   └── hooks.js            // useState、useEffect 等
├── shared/
│   └── utils.js            // 公共工具函数
├── examples/
│   └── demo.js             // 各种演示
└── index.js                // 统一入口
\`\`\`

| 文件 | 对应真实 React 的包 | 职责 |
|------|---------------------|------|
| \`createElement.js\` | \`react\` | 提供 \`createElement\`，生成虚拟 DOM |
| \`render.js\` | \`react-dom\` | 把虚拟 DOM 转成宿主节点 |
| \`reconciler.js\` | \`react-reconciler\` | diff、调度更新 |
| \`hooks.js\` | \`react\` | 函数组件的状态钩子 |
| \`utils.js\` | \`shared\` | 类型判断、扁平化等工具 |

本教程前 5 章我们聚焦在最前面的两块：**createElement**（第 3、4 章）和**虚拟 DOM 结构**（第 5 章），render 留到下一批章节。

## 三、搭建最小项目：一个能跑的 Hello World

在动手写复杂逻辑前，先让"最小闭环"跑起来——这是工程上的好习惯：**先让骨架跑通，再往里填肉**。

### 3.1 最小闭环需要什么

一个能跑的 Hello World，至少需要三样东西：

1. **一个描述 UI 的数据结构**（虚拟 DOM 节点）
2. **一个把这个数据结构变成"真实节点"的函数**（render）
3. **一个宿主环境**（浏览器是真实 DOM，我们这里用模拟对象）

### 3.2 虚拟 DOM 节点的最小形态

一个虚拟 DOM 节点最少需要三个字段：

\`\`\`js
{
  type: 'div',        // 节点类型：字符串=原生标签，函数=组件
  props: { },         // 属性：class、style、事件等
  children: [ ]       // 子节点：数组，元素可以是 vdom 或字符串
}
\`\`\`

为什么是这三个？因为它们刚好对应 DOM 节点的三要素：**是什么标签、有什么属性、里面装什么**。少了任何一个都没法描述一个完整的 UI 节点。

### 3.3 render 函数的最小形态

\`\`\`js
function render(vdom, container) {
  // 1. 根据 type 创建真实节点
  // 2. 根据 props 设置属性
  // 3. 根据 children 递归处理子节点
}
\`\`\`

这个函数后面会越来越复杂（要处理 diff、删除、移动），但骨架永远是这三步。

## 四、本章的 demo：用纯 JS 实现最简版"创建 DOM 并渲染"

下面的代码演示了我们这一章的目标：用最少的代码跑通"虚拟 DOM → 真实节点"这条链路。我们会：

1. 定义一个 \`createElement\` 函数，生成虚拟 DOM
2. 定义一个 \`render\` 函数，把虚拟 DOM 转成模拟 DOM 对象
3. 用它们渲染出一个"Hello World"

注意：真实 React 里 \`render\` 会操作浏览器 DOM，我们这里因为是在 Node.js 里跑，用一个简单的 JS 对象模拟"DOM 节点"。**重点是数据流转的逻辑，不是真实的 DOM API。**

## 五、本章小结

- 直接啃 React 源码会撞上"体量、优化、抽象"三堵墙。
- 从零搭 Mini React = 在空场练车，先掌握核心再应对复杂。
- 项目按职责拆分：\`createElement\` / \`render\` / \`reconciler\` / \`hooks\`。
- 最小闭环 = 虚拟 DOM 数据结构 + render 函数 + 宿主环境。

下一章我们正式进入第一部分——**JSX 与虚拟 DOM**，从 JSX 的转译原理开始，看清"标签语法"是怎么变成"JS 对象"的。
`,
    code: `// ============================================================
// 第二章代码演示：最小闭环 —— 用纯 JS 实现创建 DOM 并渲染
// ============================================================
// 目标：跑通 虚拟DOM -> 真实节点 这条链路
// 由于 Node.js 没有真实 DOM，我们用 JS 对象模拟"DOM 节点"

// ------------------------------------------------------------
// 第 1 步：定义 createElement —— 生成虚拟 DOM 节点
// ------------------------------------------------------------
// 这是后续章节的主角，这里先写一个最简版
// 参数：type 标签名，props 属性对象，...children 子节点（rest 参数）
function createElement(type, props, ...children) {
  return {
    type: type,                  // 节点类型，如 'div'、'h1'
    props: props || {},          // 属性对象，没有就给空对象
    children: children.flat()    // 子节点数组，flat 把嵌套数组拍平
  };
}

// ------------------------------------------------------------
// 第 2 步：定义一个"模拟 DOM"工厂
// ------------------------------------------------------------
// 真实 DOM 有几百个属性，我们只保留演示需要的几个
function createDOMElement(tag) {
  return {
    tagName: tag.toUpperCase(),  // DOM 节点的 tagName 是大写
    attributes: {},              // 属性集合
    children: [],                // 子节点集合
    textContent: '',             // 文本内容
    // 模拟 appendChild
    appendChild(child) {
      this.children.push(child);
    },
    // 模拟 setAttribute
    setAttribute(name, value) {
      this.attributes[name] = value;
    }
  };
}

// ------------------------------------------------------------
// 第 3 步：定义 render —— 把虚拟 DOM 转成"真实 DOM"
// ------------------------------------------------------------
// 参数：vdom 虚拟DOM，container 容器节点
function render(vdom, container) {
  // 3.1 如果是字符串或数字，说明是文本节点
  if (typeof vdom === 'string' || typeof vdom === 'number') {
    container.textContent = String(vdom);
    return;
  }

  // 3.2 根据 type 创建对应的真实节点
  const dom = createDOMElement(vdom.type);

  // 3.3 遍历 props，设置属性
  for (const key in vdom.props) {
    dom.setAttribute(key, vdom.props[key]);
  }

  // 3.4 遍历 children，递归渲染后挂到当前节点下
  // 注意：render(child, dom) 内部会把 child 挂到 dom 上（见 3.5），
  //       所以这里对对象子节点不能再重复 appendChild，否则会重复
  for (const child of vdom.children) {
    if (child == null) continue;       // 跳过 null/undefined
    if (typeof child === 'object') {
      // 对象=子虚拟DOM，递归调用，render 内部会把它 append 到 dom
      render(child, dom);
    } else {
      // 字符串/数字=文本节点，直接造一个文本节点挂上去
      const textNode = { tagName: '#text', textContent: String(child) };
      dom.appendChild(textNode);
    }
  }

  // 3.5 把当前节点挂到容器上
  container.appendChild(dom);
  return dom;
}

// ============================================================
// 实战：用上面这套玩具，渲染一个 Hello World
// ============================================================

// 4.1 用 createElement 描述 UI
const vdom = createElement(
  'div',
  { id: 'app', class: 'container' },
  createElement('h1', null, 'Hello, Mini React!'),
  createElement('p', null, '这是我手写的第一个虚拟 DOM')
);

// 4.2 准备一个"容器"（模拟 document.getElementById('root')）
const root = {
  tagName: 'ROOT',
  attributes: {},
  children: [],
  appendChild(child) { this.children.push(child); }
};

// 4.3 渲染
render(vdom, root);

// 4.4 打印结果，看看生成了什么
console.log('========== 渲染结果 ==========');
console.log(JSON.stringify(root, null, 2));

console.log('');
console.log('💡 关键观察：');
console.log('   1. createElement 产出的是普通 JS 对象（虚拟 DOM）');
console.log('   2. render 把虚拟 DOM 翻译成了模拟 DOM 节点');
console.log('   3. 整个过程没有任何"标签语法"，全是 JS 函数调用');
console.log('   4. 这就是 React 的底层真相：UI = JS 对象树');
`
  },

  // =========================================================
  // 第三章：JSX 背后的秘密：Babel 转译原理
  // =========================================================
  {
    id: "rs-jsx-secret",
    group: "第一部分 JSX 与虚拟 DOM",
    icon: "🔧",
    title: "JSX 背后的秘密：Babel 转译原理",
    content: `
# JSX 背后的秘密：Babel 转译原理

## 一、JSX 不是合法的 JavaScript

你写过这样的代码吗？

\`\`\`jsx
const element = <h1 className="title">Hello</h1>;
\`\`\`

看起来像是"HTML 写在 JS 里"，很方便。但如果你把这段代码原封不动地丢给 Node.js 执行，它会立刻报错：

\`\`\`
SyntaxError: Unexpected token '<'
\`\`\`

为什么？因为 **JSX 根本不是合法的 JavaScript 语法**。浏览器和 Node.js 都不认识 \`<h1>\` 这种写法。那 React 项目里为什么能写？因为有一个叫 **Babel** 的工具，在代码运行之前，偷偷把 JSX 翻译成了合法的 JS。

理解这一点非常重要：**你在 .jsx 文件里写的标签语法，和最终运行的 JS 代码，是两套东西。** 中间隔着一层翻译。这层翻译就是 Babel 在做的事。

### 1.1 生活类比：翻译官

想象你去法国餐厅点餐，菜单是法文，你只会中文。你没法直接对服务员说法文，但餐厅配了一位**翻译官**：你用中文说"我要一份牛排"，翻译官把它翻成法文传给服务员。你写的 JSX 就是"中文"，浏览器认识的 JS 是"法文"，Babel 就是那位翻译官。

### 1.2 为什么不直接让浏览器支持 JSX

有人会问：干嘛不直接让浏览器原生支持 JSX，省去翻译这步？原因有几个：

- **JSX 不是标准**：浏览器只认 ECMAScript 标准，JSX 是 React 团队自己发明的语法糖，标准委员会不会为某一个库加语法。
- **翻译带来灵活性**：通过 Babel，我们可以控制 JSX 编译成什么。默认是 \`React.createElement\`，新版 React 也可以编译成 \`jsx\` 运行时函数，甚至自定义。
- **性能**：提前编译好，比运行时解析标签更快。

## 二、JSX → React.createElement 的转换规则

Babel 翻译 JSX 有一套固定规则。掌握这套规则，你就拿到了"看穿 JSX"的能力——任何 JSX 写出来，你都能脑补出它编译后的 JS 长什么样。

### 2.1 基本规则

| JSX 写法 | 编译后 |
|----------|--------|
| \`<h1>Hello</h1>\` | \`React.createElement('h1', null, 'Hello')\` |
| \`<div id="x">A</div>\` | \`React.createElement('div', { id: 'x' }, 'A')\` |
| \`<Comp name="y" />\` | \`React.createElement(Comp, { name: 'y' })\` |
| \`<div>{expr}</div>\` | \`React.createElement('div', null, expr)\` |
| \`<ul><li>1</li><li>2</li></ul>\` | \`React.createElement('ul', null, React.createElement('li', null, '1'), React.createElement('li', null, '2'))\` |

可以看出规则非常机械：

1. 标签名 → \`createElement\` 的第一个参数（字符串或组件函数）
2. 属性 → 第二个参数（对象，没有属性就是 \`null\`）
3. 子节点 → 第三及之后的参数（每个子节点一个参数）
4. \`{表达式}\` 中的表达式原样作为子节点参数

### 2.2 关键细节：标签名的小写与大写

JSX 有个看似奇怪但很重要的规则：**小写标签名当作字符串，大写标签名当作变量**。

\`\`\`jsx
<div></div>       // -> createElement('div', ...)   字符串 'div'
<MyComp></MyComp> // -> createElement(MyComp, ...)  变量 MyComp
\`\`\`

为什么？因为 React 要区分"原生 HTML 标签"和"自定义组件"。原生标签是固定的那几十个（div、span、h1...），用小写；用户自己写的组件用大写开头，避免和原生标签重名冲突。这就像**法语里的专有名词首字母大写**，是个约定。

### 2.3 子节点是表达式的情况

\`\`\`jsx
const name = 'Tom';
const el = <p>Hello, {name}!</p>;
\`\`\`

编译后：

\`\`\`js
const el = React.createElement('p', null, 'Hello, ', name, '!');
\`\`\`

注意：文本"Hello, "和"!"会各自成为独立的参数，中间的 \`{name}\` 直接作为表达式参数。Babel 会把一段混合的文本和表达式拆成多个子节点。

## 三、@babel/standalone 在线转译

真实项目里 Babel 通过构建工具（Vite、Webpack）集成，平时你看不到它干活。但有一个包叫 \`@babel/standalone\` 可以在浏览器或 Node 里直接调用，非常适合学习。

### 3.1 用法示例

\`\`\`js
const Babel = require('@babel/standalone');
const code = 'const el = <h1 id="t">Hi</h1>;';
const out = Babel.transform(code, { presets: ['react'] });
console.log(out.code);
// 输出: const el = React.createElement("h1", { id: "t" }, "Hi");
\`\`\`

你会看到 \`<h1 id="t">Hi</h1>\` 被翻译成了 \`React.createElement("h1", { id: "t" }, "Hi")\`。这就是 Babel 在背后做的事。

> 注意：本教程的运行沙箱里没有 \`@babel/standalone\`，所以我们不能直接调它。但理解它的输出形态很重要——下一节我们自己手写一个简化版的"JSX 翻译器"，模拟 Babel 干的事。

## 四、手动模拟 Babel 的转译逻辑

Babel 真实的 JSX 转译用到了 AST（抽象语法树）解析，非常复杂。我们这里写一个**极简版**：用正则和字符串处理，把简单的 JSX 字符串翻译成 \`createElement\` 调用字符串。

### 4.1 我们要处理的最简情况

只支持：

- \`<tag attr="val">children</tag>\`
- \`<tag>{expr}</tag>\`
- 自闭合 \`<tag />\`

不支持嵌套标签（要支持嵌套需要完整的词法分析，超出本章范围）。

### 4.2 转换思路

1. 用正则匹配出标签名、属性、子节点。
2. 把属性字符串拼成对象字面量。
3. 把子节点拼成参数。
4. 套上 \`createElement(...)\` 的调用形式。

### 4.3 这个简化版的局限

真实 Babel 用 AST 是因为正则无法可靠处理嵌套结构、转义、注释等情况。我们的版本只用来**演示翻译的核心思路**，让你直观感受到"JSX 就是 createElement 调用的语法糖"。真实项目里永远用 Babel，不要手写。

## 五、本章小结

- JSX 不是合法 JS，必须由 Babel 翻译后才能运行。
- 翻译规则：标签名→第 1 参，属性→第 2 参，子节点→第 3+ 参。
- 小写标签名→字符串，大写标签名→变量（区分原生标签和组件）。
- \`@babel/standalone\` 可以在运行时做转译，适合学习观察。
- 手写转译器只是为了理解原理，生产环境用 Babel 的 AST 方案。

下一章我们会正式手写 \`createElement\` 函数，把它产出的"虚拟 DOM 对象"彻底看清楚。
`,
    code: `// ============================================================
// 第三章代码演示：手写一个简化版 JSX 翻译器
// ============================================================
// 目标：把简单的 JSX 字符串翻译成 createElement 调用字符串
// 说明：真实 Babel 用 AST 解析，这里用正则演示核心思路

// ------------------------------------------------------------
// 第 1 步：定义一个 parseJSX 函数，把单个 JSX 字符串转成调用串
// ------------------------------------------------------------
// 只支持单层标签（不支持嵌套），用于演示翻译思路
function parseJSX(jsx) {
  // 正则：匹配 <tag attr="val">children</tag> 或 <tag attr="val" />
  // 分组说明：
  //   1: 自闭合标记（如果有 / 表示自闭合）
  //   2: 标签名
  //   3: 属性字符串（可能为空）
  //   4: 闭包标记（如果有 / 表示自闭合，没有则是开标签）
  //   5: 子节点内容（如果不是自闭合）
  //   6: 闭合标签名
  const selfClosingRe = /^<([A-Za-z][\\w]*)([^>]*?)\\/>$/;
  const openCloseRe = /^<([A-Za-z][\\w]*)([^>]*?)>([\\s\\S]*)<\\/([A-Za-z][\\w]*)>$/;

  // 1.1 先试自闭合：<tag ... />
  let m = jsx.match(selfClosingRe);
  if (m) {
    const tag = m[1];           // 标签名
    const attrsStr = m[2];      // 属性字符串
    const propsObj = parseAttrs(attrsStr);
    // 自闭合没有子节点
    return \`createElement('\${tag}', \${propsObj})\`;
  }

  // 1.2 再试开闭合一对：<tag ...>children</tag>
  m = jsx.match(openCloseRe);
  if (m) {
    const tag = m[1];
    const attrsStr = m[2];
    const childrenStr = m[3];
    const closeTag = m[4];
    if (tag !== closeTag) {
      throw new Error('开闭标签不匹配: ' + tag + ' vs ' + closeTag);
    }
    const propsObj = parseAttrs(attrsStr);
    const childrenArg = parseChildren(childrenStr);
    return \`createElement('\${tag}', \${propsObj}\${childrenArg ? ', ' + childrenArg : ''})\`;
  }

  throw new Error('无法识别的 JSX: ' + jsx);
}

// ------------------------------------------------------------
// 第 2 步：解析属性字符串 -> 对象字面量字符串
// ------------------------------------------------------------
// 输入: ' id="x" class="box"'
// 输出: '{ id: "x", class: "box" }'
function parseAttrs(attrsStr) {
  const attrs = [];
  // 匹配 key="value" 形式
  const re = /([A-Za-z][\\w-]*)\\s*=\\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(attrsStr)) !== null) {
    attrs.push(m[1] + ': "' + m[2] + '"');
  }
  if (attrs.length === 0) return 'null';
  return '{ ' + attrs.join(', ') + ' }';
}

// ------------------------------------------------------------
// 第 3 步：解析子节点字符串 -> 参数列表字符串
// ------------------------------------------------------------
// 处理两种情况：
//   1. 纯文本: "Hello"  -> '"Hello"'
//   2. 表达式: {name}   -> 'name'
function parseChildren(childrenStr) {
  const trimmed = childrenStr.trim();
  if (!trimmed) return '';

  // 用正则切分出文本片段和 {expr} 片段
  const parts = [];
  const re = /\\{([^}]*)\\}|([^{}]+)/g;
  let m;
  while ((m = re.exec(trimmed)) !== null) {
    if (m[1] !== undefined) {
      // {expr} 形式：表达式原样作为参数
      parts.push(m[1].trim());
    } else if (m[2] !== undefined) {
      // 纯文本：包成字符串
      parts.push('"' + m[2].trim() + '"');
    }
  }
  return parts.join(', ');
}

// ------------------------------------------------------------
// 第 4 步：定义 createElement（占位，下一章真正实现）
// ------------------------------------------------------------
// 这里先给个最简实现，让翻译出来的代码能实际跑
function createElement(type, props, ...children) {
  return {
    type: type,
    props: props || {},
    children: children.flat().filter(c => c != null && c !== '')
  };
}

// ============================================================
// 实战：把几段 JSX 字符串翻译成 createElement 调用并执行
// ============================================================

const cases = [
  '<h1 id="title">Hello</h1>',
  '<button class="btn" disabled="true">Click Me</button>',
  '<img src="logo.png" alt="logo" />',
  '<p>Hello, {name}!</p>'
];

console.log('========== JSX 翻译结果 ==========');
const name = 'Tom';
for (const jsx of cases) {
  const compiled = parseJSX(jsx);
  console.log('JSX :', jsx);
  console.log('编译后:', compiled);
  // 用 eval 执行编译后的字符串（演示用，生产环境千万别这么干）
  const vdom = eval(compiled);   // eslint-disable-line
  console.log('运行结果:', JSON.stringify(vdom));
  console.log('');
}

console.log('💡 关键观察：');
console.log('   1. 每段 JSX 都被翻译成了 createElement 调用');
console.log('   2. 属性被收集成了对象，作为第 2 个参数');
console.log('   3. 子节点（包括文本和表达式）成为第 3+ 个参数');
console.log('   4. 真实 Babel 做的事和这里一样，只是用 AST 更严谨');
`
  },

  // =========================================================
  // 第四章：手写 createElement：创建虚拟 DOM
  // =========================================================
  {
    id: "rs-create-element",
    group: "第一部分 JSX 与虚拟 DOM",
    icon: "🔨",
    title: "手写 createElement：创建虚拟 DOM",
    content: `
# 手写 createElement：创建虚拟 DOM

## 一、createElement 的参数和返回值

上一章我们看到 Babel 把 JSX 翻译成一连串 \`createElement\` 调用。这一章我们就来亲手实现这个函数。

### 1.1 函数签名

\`\`\`js
function createElement(type, config, ...children) { ... }
\`\`\`

三个参数：

| 参数 | 含义 | 例子 |
|------|------|------|
| \`type\` | 节点类型 | 字符串 \`'div'\` 或组件函数 \`Counter\` |
| \`config\` | 属性对象 | \`{ id: 'x', className: 'box' }\` |
| \`...children\` | 子节点（rest 参数） | 字符串、数字、vdom、数组、null 都可能 |

> React 源码里第二个参数叫 \`config\` 而不是 \`props\`，是因为源码会从 \`config\` 里"抽走"几个特殊字段（\`key\`、\`ref\`、\`__source\` 等），把剩下的才组装成 \`props\`。我们简化版直接叫 \`props\`。

### 1.2 返回值：虚拟 DOM 节点

\`\`\`js
{
  type: 'div',
  props: { id: 'x', children: [...] },
  // 简化版还额外挂一个 children 字段方便操作
}
\`\`\`

真实 React 把 \`children\` 也当作 \`props\` 的一个字段（\`props.children\`），不单独挂。但我们教程里为了可读性，会同时保留一个独立的 \`children\` 字段。下一章会讨论这种结构上的取舍。

## 二、虚拟 DOM 的数据结构

### 2.1 最小结构

\`\`\`js
{
  type: 'div',
  props: { id: 'app' },
  children: [
    'Hello',                       // 文本子节点
    createElement('span', null)    // 元素子节点
  ]
}
\`\`\`

### 2.2 为什么是这个结构

回忆一下 DOM 节点三要素：**标签、属性、子节点**。虚拟 DOM 的三个字段正好一一对应：

| 虚拟 DOM 字段 | 对应 DOM 概念 | 类比 |
|---------------|---------------|------|
| \`type\` | tagName | 房间的门牌（卧室/厨房） |
| \`props\` | attributes | 房间的装修（墙色、家具） |
| \`children\` | childNodes | 房间里的小房间或物品 |

**为什么要设计成普通 JS 对象？** 两个原因：

1. **轻量**：真实 DOM 节点有几百个属性，虚拟 DOM 只有 3 个字段，创建/对比/修改都极快。
2. **可控**：JS 对象我们可以任意加工、序列化、传输、缓存。真实 DOM 不行。

## 三、处理 children 的各种情况

这是 \`createElement\` 里最繁琐的部分。子节点可以是五花八门的类型：

### 3.1 子节点的可能类型

| 子节点形式 | 类型 | 处理方式 |
|-----------|------|---------|
| \`'Hello'\` | 字符串 | 当文本节点，保留原样 |
| \`42\` | 数字 | 转成字符串当文本节点 |
| \`false\` / \`null\` / \`undefined\` | 假值 | 跳过不渲染 |
| \`true\` | 布尔 | 跳过（React 的约定） |
| \`[a, b]\` | 数组 | 拍平后逐个处理 |
| \`createElement(...)\` | vdom 对象 | 直接作为子节点 |
| \`<Comp />\` 编译后 | vdom 对象 | 同上 |

### 3.2 几个关键决策

**为什么数字要转字符串？** 因为 DOM 的 textContent 接收字符串，数字会被自动转，但虚拟 DOM 里我们提前转好，避免渲染时再判断。

**为什么 false/null/undefined 要跳过？** 因为 React 支持 \`{condition && <Comp />}\` 这种写法——条件为假时返回 false，UI 里不应该出现任何东西。

**为什么数组要拍平？** 因为 JSX 里可以写 \`{[1,2,3].map(n => <li>{n}</li>)}\`，子节点会是一个数组，里面又装着 vdom。我们用 \`flat()\` 把嵌套结构拍平成一维，方便后续遍历。

### 3.3 真实 React 的额外处理

源码里 \`createElement\` 还会做这些事（我们简化版不做）：

- 抽离 \`key\` 和 \`ref\`，不放进 \`props\`
- 给 \`props.children\` 赋值
- 在 dev 模式校验 key 重复、 defaultProps 应用
- 用 \`Symbol(react.element)\` 标记 \`$$typeof\`，防 XSS

## 四、处理 props 的合并

\`config\` 里的属性需要做一点处理才能变成 \`props\`：

### 4.1 处理流程

1. 如果 \`config\` 是 null/undefined，初始化为空对象 \`{}\`
2. 浅拷贝 \`config\` 的所有字段到 \`props\`（避免外部修改影响内部）
3. 把处理好的 \`children\` 挂到 \`props.children\` 上

### 4.2 为什么浅拷贝

如果直接用 \`props = config\`，外部代码修改 \`config\` 会影响虚拟 DOM 的稳定性。浅拷贝一层就够，因为 props 的值大多是基本类型或对象引用，深层拷贝既慢又没必要。

## 五、完整实现与可视化

下面的代码会实现一个功能相对完整的 \`createElement\`，并用它构建一棵稍复杂的虚拟 DOM 树，最后打印出来观察结构。

我们会用 \`Object.defineProperty\` 给返回对象加一个 \`$$typeof\` 标记，模拟真实 React 防止 XSS 的设计——虽然这里只是教学示意。

## 六、本章小结

- \`createElement(type, props, ...children)\` 是 JSX 编译后的运行时入口。
- 返回的虚拟 DOM 是普通 JS 对象，含 \`type\` / \`props\` / \`children\`。
- 子节点处理是重点：要支持字符串、数字、数组、null、vdom。
- \`props\` 要浅拷贝，并把 \`children\` 挂到 \`props.children\` 上。

下一章我们会把这棵虚拟 DOM 树画出来，并讨论它的树形结构为什么这么设计。
`,
    code: `// ============================================================
// 第四章代码演示：手写 createElement，构建虚拟 DOM
// ============================================================
// 目标：实现一个功能相对完整的 createElement，处理各种 children

// ------------------------------------------------------------
// 第 1 步：定义 vdom 节点的类型标记
// ------------------------------------------------------------
// 真实 React 用 Symbol(react.element) 标记虚拟 DOM，防止 XSS 注入
// 这里用 Symbol 模拟同样的效果
const REACT_ELEMENT_TYPE = Symbol.for('react.element');

// ------------------------------------------------------------
// 第 2 步：实现 createElement
// ------------------------------------------------------------
// 参数：type 节点类型，config 属性对象，...children 子节点（rest）
function createElement(type, config, ...children) {
  // 2.1 处理 props：浅拷贝 config，避免外部修改影响 vdom
  const props = {};
  if (config != null) {
    // 真实 React 会在这里抽走 key、ref，简化版我们保留所有字段
    for (const key in config) {
      if (Object.prototype.hasOwnProperty.call(config, key)) {
        props[key] = config[key];
      }
    }
  }

  // 2.2 处理 children：把各种形态统一成一个一维数组
  // flat(Infinity) 把任意深度的嵌套数组都拍平
  const processedChildren = children
    .flat(Infinity)
    .filter(child => {
      // 过滤掉 null、undefined、false、true
      // React 约定：这些值不渲染任何节点
      return child !== null &&
             child !== undefined &&
             child !== false &&
             child !== true;
    })
    .map(child => {
      // 数字子节点转成字符串（模拟 textContent 行为）
      if (typeof child === 'number') {
        return String(child);
      }
      // 字符串和 vdom 对象原样保留
      return child;
    });

  // 2.3 把 children 挂到 props.children 上（真实 React 的做法）
  if (processedChildren.length > 0) {
    props.children = processedChildren.length === 1
      ? processedChildren[0]    // 单个子节点：直接挂对象（不包数组）
      : processedChildren;      // 多个子节点：挂数组
  }

  // 2.4 返回虚拟 DOM 节点
  return {
    $$typeof: REACT_ELEMENT_TYPE,   // 类型标记，防 XSS
    type: type,                      // 节点类型
    props: props,                    // 属性对象（含 children）
    // 简化版额外保留一个独立的 children 字段，方便教程演示
    // 真实 React 不保留，只放在 props.children
    children: processedChildren
  };
}

// ------------------------------------------------------------
// 第 3 步：测试各种子节点情况
// ------------------------------------------------------------
console.log('========== 测试 1：纯文本子节点 ==========');
const v1 = createElement('h1', null, 'Hello');
console.log(JSON.stringify(v1, null, 2));

console.log('========== 测试 2：带属性的子节点 ==========');
const v2 = createElement('div', { id: 'box', className: 'card' }, 'Content');
console.log(JSON.stringify(v2, null, 2));

console.log('========== 测试 3：多个子节点（含数字） ==========');
const v3 = createElement('ul', null,
  createElement('li', null, '第一项'),
  createElement('li', null, '第二项'),
  42   // 数字子节点，会被转成字符串 "42"
);
console.log(JSON.stringify(v3, null, 2));

console.log('========== 测试 4：包含 null/false/数组 ==========');
const show = false;
const v4 = createElement('div', null,
  '开始',
  show && createElement('span', null, '隐藏内容'),  // false → 被过滤
  null,                                              // null → 被过滤
  [1, 2, 3].map(n => createElement('span', null, n)) // 数组 → 被拍平
);
console.log(JSON.stringify(v4, null, 2));

console.log('========== 测试 5：嵌套结构 ==========');
const v5 = createElement('section', { id: 'main' },
  createElement('header', null,
    createElement('h1', null, '标题'),
    createElement('p', null, '副标题')
  ),
  createElement('main', null,
    createElement('p', null, '正文内容')
  )
);
console.log(JSON.stringify(v5, null, 2));

console.log('==============================================');
console.log('💡 关键观察：');
console.log('   1. 所有 vdom 都是普通 JS 对象');
console.log('   2. $$typeof 标记区分了"虚拟DOM"和普通对象');
console.log('   3. children 被拍平成一维数组');
console.log('   4. null/false/true 都被过滤掉了');
console.log('   5. 数字子节点被转成了字符串');
`
  },

  // =========================================================
  // 第五章：虚拟 DOM 的数据结构：树形组织
  // =========================================================
  {
    id: "rs-vdom-structure",
    group: "第一部分 JSX 与虚拟 DOM",
    icon: "🌲",
    title: "虚拟 DOM 的数据结构：树形组织",
    content: `
# 虚拟 DOM 的数据结构：树形组织

## 一、为什么虚拟 DOM 用树形结构

你看完前几章可能有个疑问：为什么虚拟 DOM 非得是"树"？为什么不是图、不是链表、不是扁平数组？

答案其实很简单：**因为 UI 本身就是树形的。**

### 1.1 UI 的天然树形结构

打开任何一个网页，按 F12 看 Elements 面板，你会看到一棵树：

\`\`\`
html
└── body
    ├── header
    │   ├── h1
    │   └── nav
    │       ├── a
    │       └── a
    ├── main
    │   └── section
    │       ├── p
    │       └── p
    └── footer
        └── p
\`\`\`

DOM 是树，文件系统是树，公司组织架构是树，家族谱是树。**只要一个东西有"包含/嵌套"关系，它天然就是树。** UI 的组件之间正是"父包含子"的关系，所以用树来描述再合适不过。

### 1.2 树形结构的优势

| 优势 | 说明 |
|------|------|
| 直观映射 | UI 嵌套关系一一对应，无歧义 |
| 递归友好 | 树的遍历天然用递归，代码简洁 |
| 局部更新 | 改动一个子树不影响其他子树，diff 高效 |
| 路径清晰 | 从根到任意节点路径唯一，定位方便 |

### 1.3 为什么不用其他结构

- **图**：UI 没有"循环依赖"，用图是过度设计。
- **链表**：链表是线性的，表达不了"一个节点有多个子节点"。
- **扁平数组**：要表达嵌套关系必须额外存"父指针"，不如树自然。

## 二、虚拟 DOM vs 真实 DOM 对比

虚拟 DOM 长得像真实 DOM，但本质完全不同。

### 2.1 字段对比

| 维度 | 真实 DOM | 虚拟 DOM |
|------|----------|----------|
| 创建方式 | \`document.createElement\` | \`createElement\`（JS 函数） |
| 字段数量 | 几百个 | 3~5 个 |
| 内存占用 | 大（一个 div 几 KB） | 小（一个对象几十字节） |
| 操作成本 | 高（触发重排重绘） | 低（只是改 JS 对象） |
| 可序列化 | 不行 | 可以（JSON.stringify） |
| 可缓存 | 不行 | 可以（存起来复用） |
| 跨平台 | 仅浏览器 | 任意（可渲染到 native、SSR） |

### 2.2 跨平台是关键优势

真实 DOM 强绑定浏览器，你在 Node.js、React Native、SSR 里都没法用。虚拟 DOM 是纯 JS 对象，**它可以渲染到任何目标环境**——浏览器 DOM、原生控件、字符串、终端 ASCII。这正是 React Native 能跨平台的基础：同一棵虚拟 DOM 树，换一个渲染器就变成另一种 UI。

类比一下：**虚拟 DOM 像是建筑图纸，真实 DOM 是盖好的房子。** 同一份图纸，可以盖木屋、盖砖房、盖钢架房，只要换"施工队"（渲染器）就行。

## 三、children 的扁平化处理

### 3.1 为什么需要扁平化

JSX 里可以写这种代码：

\`\`\`jsx
<ul>
  {items.map(item => <li key={item.id}>{item.name}</li>)}
</ul>
\`\`\`

\`map\` 返回的是一个**数组**，所以 \`children\` 里会嵌套一个数组：

\`\`\`js
{
  type: 'ul',
  children: [
    [vdomLi1, vdomLi2, vdomLi3]
  ]
}
\`\`\`

这种嵌套结构对后续遍历很不友好——你每次访问 children 都要先判断"这是数组还是单个对象"。所以 \`createElement\` 里要做扁平化（\`flat()\`），把嵌套数组拍平成一维：

\`\`\`js
{
  type: 'ul',
  children: [vdomLi1, vdomLi2, vdomLi3]
}
\`\`\`

### 3.2 扁平化的注意事项

- 只对数组拍平，不影响字符串、数字、vdom 对象。
- \`flat(Infinity)\` 会递归拍平所有层级，安全但稍慢；真实 React 用自定义递归控制深度。
- 拍平后要保持子节点的原始顺序，不能乱序。

### 3.3 为什么 React 还要保留 key

拍平后，React 在 diff 时面对的是一个一维数组。如果你在数组中间插入一个元素，React 没法知道"这是新插入的"还是"原来的元素移动了"，只能按位置逐个对比，导致大量误判和重渲染。

\`key\` 属性就是来解决这个的——它给每个子节点一个稳定身份，让 React 能识别"这个 li 还是原来那个 li，只是位置变了"，从而只移动不重建。这也是为什么 React 文档反复强调：**列表的 key 要稳定、唯一，不要用数组下标。**

## 四、实现 printVDOM 函数可视化虚拟 DOM 树

虚拟 DOM 是嵌套对象，直接 \`console.log\` 看起来很乱。我们写一个 \`printVDOM\` 函数，用缩进的方式把它打印成"目录树"的样子，方便观察结构。

### 4.1 设计思路

类似 Linux 的 \`tree\` 命令：

\`\`\`
div#app
├── h1 "Hello"
├── p "World"
└── ul
    ├── li "1"
    └── li "2"
\`\`\`

实现要点：

1. 递归遍历虚拟 DOM 树。
2. 当前节点显示为 \`type#id.class\` 的形式。
3. 文本子节点直接显示内容。
4. 用 \`├──\` / \`└──\` / \`│\` 等字符画表示层级关系。

### 4.2 节点标签的生成规则

| 节点类型 | 显示形式 |
|---------|---------|
| \`{ type: 'div', props: { id: 'x' } }\` | \`div#x\` |
| \`{ type: 'div', props: { className: 'box' } }\` | \`div.box\` |
| \`{ type: 'div', props: { id: 'x', className: 'box' } }\` | \`div#x.box\` |
| 字符串 \`'Hello'\` | \`"Hello"\` |
| 函数组件 \`{ type: Counter }\` | \`<Counter>\` |

## 五、本章的 demo：构建多层级虚拟 DOM 并可视化

下面的代码会：

1. 复用上一章的 \`createElement\`。
2. 实现 \`printVDOM\` 函数。
3. 构建一棵 3~4 层深的虚拟 DOM 树。
4. 用 \`printVDOM\` 把它打印成树状图。

这是本批章节的"收尾 demo"——从无到有造出虚拟 DOM 并看清它的全貌。下一批章节我们会进入 \`render\` 和 \`reconciler\`，让这棵树真正"动起来"。

## 六、本批章节总结

到这里，第一批 5 章就结束了。我们走完了这条主线：

1. **第 1 章**：建立认知——React 是声明式 UI 库，三大支柱是什么。
2. **第 2 章**：搭好骨架——Mini React 项目结构、最小闭环跑通。
3. **第 3 章**：看清入口——JSX 经 Babel 翻译成 createElement 调用。
4. **第 4 章**：手写核心——实现 createElement，处理各种 children。
5. **第 5 章**：理解结构——虚拟 DOM 是树，可视化它的全貌。

你现在拥有了一个能产出虚拟 DOM 的 Mini React 雏形。下一批章节我们会让它"会渲染、会更新、会 diff"，逐步逼近真实 React 的能力。
`,
    code: `// ============================================================
// 第五章代码演示：构建多层级虚拟 DOM 并可视化打印
// ============================================================
// 目标：复用 createElement，实现 printVDOM，画出一棵 vdom 树

// ------------------------------------------------------------
// 第 1 步：复用上一章的 createElement
// ------------------------------------------------------------
const REACT_ELEMENT_TYPE = Symbol.for('react.element');

function createElement(type, config, ...children) {
  // 浅拷贝 config 到 props
  const props = {};
  if (config != null) {
    for (const key in config) {
      if (Object.prototype.hasOwnProperty.call(config, key)) {
        props[key] = config[key];
      }
    }
  }

  // 处理 children：拍平、过滤假值、数字转字符串
  const processedChildren = children
    .flat(Infinity)
    .filter(c => c !== null && c !== undefined && c !== false && c !== true)
    .map(c => typeof c === 'number' ? String(c) : c);

  // 挂到 props.children
  if (processedChildren.length > 0) {
    props.children = processedChildren.length === 1
      ? processedChildren[0]
      : processedChildren;
  }

  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    props: props,
    children: processedChildren
  };
}

// ------------------------------------------------------------
// 第 2 步：实现 printVDOM —— 把 vdom 打印成树状图
// ------------------------------------------------------------
// 参数：vdom 虚拟DOM，prefix 当前行的前缀（用于缩进），
//       isLast 当前节点是否是父节点的最后一个子节点
function printVDOM(vdom, prefix = '', isLast = true) {
  // 2.1 处理文本节点（字符串）
  if (typeof vdom === 'string') {
    // 文本节点：显示为 "内容"
    const text = vdom.length > 20 ? vdom.slice(0, 20) + '...' : vdom;
    console.log(prefix + (isLast ? '└── ' : '├── ') + '"' + text + '"');
    return;
  }

  // 2.2 处理 vdom 对象
  // 生成节点标签：type#id.className
  let label = '';
  if (typeof vdom.type === 'function') {
    // 函数组件：<ComponentName>
    label = '<' + (vdom.type.name || 'Anonymous') + '>';
  } else {
    // 原生标签：div#id.className
    label = vdom.type;
    if (vdom.props.id) label += '#' + vdom.props.id;
    if (vdom.props.className) label += '.' + vdom.props.className;
  }

  // 2.3 打印当前节点
  console.log(prefix + (isLast ? '└── ' : '├── ') + label);

  // 2.4 递归打印子节点
  const kids = vdom.children || [];
  // 计算下一层的前缀：如果当前是最后一个子节点，用空格，否则用竖线
  const childPrefix = prefix + (isLast ? '    ' : '│   ');
  for (let i = 0; i < kids.length; i++) {
    printVDOM(kids[i], childPrefix, i === kids.length - 1);
  }
}

// ------------------------------------------------------------
// 第 3 步：构建一棵多层级虚拟 DOM 树
// ------------------------------------------------------------
// 模拟一个博客文章页面的结构
const pageVDOM = createElement('div', { id: 'app', className: 'container' },
  // header 区域
  createElement('header', { id: 'header' },
    createElement('h1', null, '我的博客'),
    createElement('nav', null,
      createElement('a', { className: 'link' }, '首页'),
      createElement('a', { className: 'link' }, '归档'),
      createElement('a', { className: 'link' }, '关于')
    )
  ),
  // main 区域
  createElement('main', null,
    createElement('article', { id: 'post-1', className: 'post' },
      createElement('h2', null, '手写 React 第一章'),
      createElement('p', null, 'React 是一个声明式 UI 库...'),
      createElement('ul', null,
        createElement('li', null, '虚拟 DOM'),
        createElement('li', null, '组件化'),
        createElement('li', null, '单向数据流')
      )
    ),
    createElement('article', { id: 'post-2', className: 'post' },
      createElement('h2', null, '手写 React 第二章'),
      createElement('p', null, '从零搭建 Mini React 项目')
    )
  ),
  // footer 区域
  createElement('footer', null,
    createElement('p', null, '© 2026 我的博客')
  )
);

// ------------------------------------------------------------
// 第 4 步：可视化打印
// ------------------------------------------------------------
console.log('========== 虚拟 DOM 树可视化 ==========');
console.log('root');
printVDOM(pageVDOM, '', true);

// ------------------------------------------------------------
// 第 5 步：再构建一个函数组件的例子，观察 <Component> 标签
// ------------------------------------------------------------
// 定义一个函数组件（返回 vdom 的函数）
function Welcome(props) {
  return createElement('div', { className: 'welcome' },
    createElement('h2', null, '欢迎，' + props.name),
    createElement('p', null, '这是函数组件渲染的内容')
  );
}

// 用函数组件创建 vdom（type 是函数本身）
const compVDOM = createElement('div', { id: 'root' },
  createElement(Welcome, { name: 'Tom' }),
  createElement(Welcome, { name: 'Jerry' })
);

console.log('');
console.log('========== 函数组件的虚拟 DOM ==========');
console.log('root');
printVDOM(compVDOM, '', true);

console.log('');
console.log('==============================================');
console.log('💡 关键观察：');
console.log('   1. 虚拟 DOM 是一棵树，type/props/children 三件套');
console.log('   2. 原生标签显示为 div#id.className');
console.log('   3. 函数组件显示为 <ComponentName>');
console.log('   4. 文本节点显示为 "内容"');
console.log('   5. 这棵树就是后续 render 和 diff 的输入');
console.log('   6. 下一批章节我们让它真正"动起来"');
`
  }
];
