// =============================================================
// React 源码构建教程 - 第 2 批章节（第 6-10 章）
// -------------------------------------------------------------
// 主题：第二部分 渲染与调和
// 覆盖内容：
//   第 6 章 初版 render：把虚拟 DOM 变成真实 DOM
//   第 7 章 完整 render：属性、事件、子节点处理
//   第 8 章 初识调和：什么是 Reconciliation
//   第 9 章 Diff 算法：同层比较的三大策略
//   第 10 章 Key 的作用：列表 Diff 的关键
//
// 所有 demo 均可在 Node.js 环境直接用 node 运行，
// 通过 console.log 模拟 DOM 输出与 diff 操作日志。
// 重点突出「为什么这样设计」与「生活类比」，
// 代码注释极其详细，是本教程的核心要求。
// =============================================================

export const chapters = [
  // ===========================================================
  // 第 6 章：初版 render：把虚拟 DOM 变成真实 DOM
  // ===========================================================
  {
    id: "rs-render-v1",
    group: "第二部分 渲染与调和",
    icon: "🎨",
    title: "初版 render：把虚拟 DOM 变成真实 DOM",
    content: `
# 第 6 章 初版 render：把虚拟 DOM 变成真实 DOM

## 一、开篇：从「设计图」到「实物」

在前面的章节里，我们花了大量篇幅讨论「虚拟 DOM」——它本质上是 JavaScript 对象，是 React 内部对界面的**描述**。但用户最终看到的是浏览器里真实的 DOM 节点：可以点击的按钮、可以滚动的列表、可以输入的文本框。

这一章我们要解决的核心问题是：**如何把一个虚拟 DOM 对象，转换成真实的 DOM 节点？**

### 1.1 生活类比：装修设计图与施工

想象你是一位装修设计师：

| 角色 | 对应 React 概念 |
|------|----------------|
| 设计图（CAD 文件） | 虚拟 DOM（vdom） |
| 工人按图施工 | render 函数 |
| 最终装修好的房子 | 真实 DOM |
| 设计图里写「主卧」 | vdom 的 \`type: "h1"\` |
| 设计图里写「刷蓝色」 | vdom 的 \`props: { className: "blue" }\` |
| 设计图里写「里面有床、衣柜」 | vdom 的 \`children\` |

设计图本身不能住人，必须由工人「按图施工」把它变成真实房子。同样，虚拟 DOM 不能直接显示，必须由 \`render\` 函数「按描述创建」真实 DOM 节点。

### 1.2 render 函数的职责

\`render\` 函数的核心职责可以用一句话概括：

> **输入一个虚拟 DOM 树，输出一个真实 DOM 节点（及其子节点）。**

签名大致是：

\`\`\`js
function render(vdom, container) {
  // 把 vdom 转成真实 DOM，挂载到 container 下
}
\`\`\`

- 第一个参数 \`vdom\`：要渲染的虚拟 DOM（可能是对象、字符串、数字）。
- 第二个参数 \`container\`：真实 DOM 容器，渲染结果会被追加到它下面。

这是 React 最早期的 \`render\` 形态，理解它就理解了 React 渲染的「原点」。

## 二、虚拟 DOM 的结构回顾

在写 \`render\` 之前，先明确我们要处理的 vdom 长什么样。最常见的两种形态：

### 2.1 元素节点

\`\`\`js
// 一个 <h1 title="hello">Hello</h1> 对应的 vdom
{
  type: "h1",              // 标签名，字符串表示原生 DOM 元素
  props: {
    title: "hello",        // 属性
    children: "Hello"      // 子节点：这里是一个文本
  }
}
\`\`\`

### 2.2 文本节点

\`\`\`js
// 文本节点直接用字符串或数字表示
"Hello"
123
\`\`\`

为什么文本节点要用原始值而不是对象？因为文本是最常见的子节点，用原始值可以少写一层嵌套， JSX 编译出来的代码也更简洁（\`<h1>Hi</h1>\` 编译成 \`{ type: "h1", props: { children: "Hi" } }\`）。

### 2.3 嵌套结构

\`\`\`js
// <div id="app"><h1>Hello</h1><p>World</p></div>
{
  type: "div",
  props: {
    id: "app",
    children: [
      { type: "h1", props: { children: "Hello" } },
      { type: "p",  props: { children: "World" } }
    ]
  }
}
\`\`\`

注意 \`children\` 可以是单个值（字符串、对象）也可以是数组。\`render\` 必须同时处理这两种情况。

## 三、递归创建 DOM 节点

\`render\` 最自然的实现方式就是**递归**：处理一个节点时，先创建它自己，再递归处理它的所有子节点。

### 3.1 为什么要递归？

因为虚拟 DOM 是一棵**树**，树的结构天然适合递归处理。想象快递分拣中心：

- 收到一个大包裹（根 vdom）
- 拆开发现里面是若干小包裹（children）
- 每个小包裹再拆开，可能还有更小的包裹
- 直到拆到最里面是「一件实物」（文本节点），就停止

这就是深度优先的递归遍历。

### 3.2 render 的骨架

\`\`\`js
function render(vdom, container) {
  // 1. 创建当前节点
  const dom = createDom(vdom);
  // 2. 挂到容器下
  container.appendChild(dom);
}

function createDom(vdom) {
  // 文本节点
  if (typeof vdom === "string" || typeof vdom === "number") {
    return document.createTextNode(vdom);
  }
  // 元素节点
  const { type, props } = vdom;
  const dom = document.createElement(type);
  // 递归处理 children
  const children = props.children;
  if (children) {
    [].concat(children).forEach(child => render(child, dom));
  }
  return dom;
}
\`\`\`

注意 \`[].concat(children)\` 这个小技巧：

- 如果 \`children\` 是单个值（字符串/对象），\`concat\` 会把它包成数组。
- 如果 \`children\` 本来就是数组，\`concat\` 不会嵌套，保持原样。

这样统一了「单个 child」和「多个 child」的处理路径，避免写两套逻辑。

## 四、处理文本节点

文本节点是最底层的叶子，处理方式最简单——直接调用 \`createTextNode\`。

### 4.1 为什么要单独处理文本？

因为文本节点不能用 \`createElement\` 创建，它们是 \`TextNode\` 类型，没有标签名、没有属性。如果硬要走元素节点的路径，会报错。

### 4.2 字符串和数字都算文本

\`\`\`js
if (typeof vdom === "string" || typeof vdom === "number") {
  return document.createTextNode(String(vdom));
}
\`\`\`

注意 \`String(vdom)\` 的转换：数字 \`123\` 会被转成字符串 \`"123"\`，因为 DOM 文本节点只能是字符串。这是为了避免 \`createTextNode(123)\` 在某些浏览器里出现意外行为。

## 五、处理子节点递归

子节点的处理是 \`render\` 里最容易出错的环节，因为 \`children\` 的形态多种多样：

| 形态 | 示例 |
|------|------|
| 单个字符串 | \`children: "Hello"\` |
| 单个数字 | \`children: 42\` |
| 单个 vdom 对象 | \`children: { type: "span", ... }\` |
| 数组（混合） | \`children: ["Hello", { type: "br" }, 123]\` |
| undefined / null | \`children: undefined\`（不渲染） |
| 布尔值 | \`children: false\`（React 默认不渲染） |

### 5.1 过滤无效子节点

React 默认 \`false\`、\`null\`、\`undefined\` 都不渲染（但 \`0\` 会渲染，这是常见踩坑点）。所以我们要在递归前过滤：

\`\`\`js
const children = [].concat(props.children).filter(c =>
  c !== null && c !== undefined && c !== false && c !== true
);
\`\`\`

### 5.2 为什么 0 会被渲染？

因为 \`0\` 是有意义的数字（比如商品数量、价格）。如果把 \`0\` 也过滤掉，\`<div>数量：{count}</div>\` 在 \`count=0\` 时就什么都不显示，这显然不对。这是 React 经过深思熟虑后的设计取舍。

## 六、完整 demo：实现 render 并模拟 DOM

由于浏览器才有真实的 \`document\` API，我们在 Node.js 里需要先造一个**模拟 DOM**，让 demo 能跑起来并输出可观察的结果。

模拟 DOM 的思路：

- 用普通 JS 对象表示 DOM 节点。
- 实现 \`createElement\`、\`createTextNode\`、\`appendChild\` 三个方法。
- 提供 \`toString\` 把模拟 DOM 转成可读的 HTML 字符串。

这样既能验证 \`render\` 的逻辑正确性，又能直观看到渲染结果。

## 七、本章小结

- \`render\` 的职责是「vdom → dom」，本质是按描述创建真实节点。
- 用递归处理树形结构是最自然的方式。
- 文本节点用原始值表示，需单独走 \`createTextNode\` 路径。
- \`children\` 要兼容单值和数组两种形态，用 \`[].concat\` 统一。
- \`false / null / undefined\` 不渲染，但 \`0\` 要渲染——这是 React 的设计取舍。

下一章我们给 \`render\` 加上属性、事件、style 的完整处理，让它接近 React 真实实现。
`,
    code: `// ============================================
// 第 6 章 demo：初版 render 函数 + 模拟 DOM
// 运行方式：node reactsrc-ch6.js
// 本 demo 在 Node.js 中模拟浏览器 DOM，
// 实现 React 最朴素的 render：vdom -> dom
// ============================================

// ------------------------------------------------------------
// 第一部分：模拟浏览器 DOM
// ------------------------------------------------------------
// 浏览器里有全局对象 document，提供 createElement 等方法。
// Node.js 里没有 document，所以我们自己造一个"假的"，
// 只要实现 render 需要用到的方法即可。
// ------------------------------------------------------------

// 模拟 document 对象，挂载我们要用的工厂方法
const document = {
  // 创建一个"元素节点"（对应 <div>、<h1> 这种）
  // tagName 是标签名，比如 "div"
  createElement(tagName) {
    return {
      nodeType: 1,             // 1 表示元素节点（DOM 规范）
      tagName: tagName.toLowerCase(), // 标签名统一小写，和浏览器一致
      props: {},               // 存放属性（id、className 等）
      children: [],            // 存放子节点
      // 把子节点追加到 children 数组末尾（模拟 DOM appendChild）
      appendChild(node) {
        this.children.push(node);
      },
      // 转成 HTML 字符串，方便 console.log 观察
      toString() {
        // 子节点递归拼接（每个子节点也有自己的 toString）
        const inner = this.children.map(c => c.toString()).join("");
        // 用 <tag ...>...</tag> 的形式输出
        const attrs = Object.keys(this.props)
          .filter(k => k !== "children") // children 不是 HTML 属性
          .map(k => \` \${k}="\${this.props[k]}"\`) // 拼成 key="value"
          .join("");
        return \`<\${this.tagName}\${attrs}>\${inner}</\${this.tagName}>\`;
      }
    };
  },
  // 创建一个"文本节点"（对应一段文字）
  // text 是文本内容
  createTextNode(text) {
    return {
      nodeType: 3,             // 3 表示文本节点
      text: String(text),      // 文本统一转字符串
      toString() {
        return this.text;      // 文本节点直接输出文字
      }
    };
  }
};

// ------------------------------------------------------------
// 第二部分：render 函数本体
// ------------------------------------------------------------

/**
 * render：把虚拟 DOM 渲染到真实容器下
 * @param {object|string|number} vdom - 虚拟 DOM
 * @param {object} container - 真实 DOM 容器（要有 appendChild 方法）
 */
function render(vdom, container) {
  // 第一步：把 vdom 转成一个真实的 DOM 节点
  // 这一步是核心，内部会递归处理子节点
  const dom = createDom(vdom);
  // 第二步：把创建好的 DOM 挂到容器下
  // appendChild 是 DOM API，把节点追加到子节点列表末尾
  container.appendChild(dom);
}

/**
 * createDom：把单个 vdom 转成真实 DOM 节点
 * 这里会处理两种情况：文本节点 / 元素节点
 */
function createDom(vdom) {
  // 情况一：文本节点（字符串或数字）
  // 注意要先判断文本，因为字符串没有 .type 属性
  if (typeof vdom === "string" || typeof vdom === "number") {
    // 文本节点直接调用 createTextNode
    // 数字要转成字符串，因为 DOM 文本只能是字符串
    return document.createTextNode(vdom);
  }

  // 情况二：元素节点（对象）
  // 解构出 type（标签名）和 props（属性对象）
  const { type, props } = vdom;

  // 用 document.createElement 创建对应标签的真实节点
  const dom = document.createElement(type);

  // 把 props 暂存到 dom 上（本章先不处理属性细节，下一章再细化）
  // 这里只做最简单的赋值，让 toString 能展示出来
  for (const key in props) {
    if (key !== "children" && props[key] != null) {
      dom.props[key] = props[key];
    }
  }

  // 取出 children，准备递归
  const children = props.children;

  // 只有 children 非空时才递归
  if (children != null) {
    // [].concat(children) 是个小技巧：
    //   - children 是单个值时，会被包成 [children]
    //   - children 是数组时，concat 不会嵌套，保持原样
    // 这样统一了"单个 child"和"多个 child"两种情况
    const childList = [].concat(children);

    // 过滤掉不渲染的值：null / undefined / false / true
    // 注意 0 不被过滤，因为 0 是有意义的数字（如数量）
    const validChildren = childList.filter(
      c => c !== null && c !== undefined && c !== false && c !== true
    );

    // 递归调用 render 处理每个子节点
    // 此时 dom 作为"新的容器"，子节点会被挂到它下面
    validChildren.forEach(child => render(child, dom));
  }

  // 返回创建好的 DOM 节点，供上层使用
  return dom;
}

// ------------------------------------------------------------
// 第三部分：构建虚拟 DOM 并渲染
// ------------------------------------------------------------

// 构建一个稍微复杂点的虚拟 DOM 树
// 对应的 HTML 大致是：
// <div id="app" className="container">
//   <h1>Hello React</h1>
//   <p>This is a paragraph.</p>
//   <ul>
//     <li>Apple</li>
//     <li>Banana</li>
//   </ul>
// </div>
const vdom = {
  type: "div",
  props: {
    id: "app",
    className: "container",
    children: [
      // 第一个子节点：标题
      {
        type: "h1",
        props: { children: "Hello React" }
      },
      // 第二个子节点：段落
      {
        type: "p",
        props: { children: "This is a paragraph." }
      },
      // 第三个子节点：无序列表，里面又有子节点
      {
        type: "ul",
        props: {
          children: [
            { type: "li", props: { children: "Apple" } },
            { type: "li", props: { children: "Banana" } }
          ]
        }
      }
    ]
  }
};

// 模拟一个根容器（对应页面上的 #root）
const root = {
  tagName: "#root",
  children: [],
  appendChild(node) {
    this.children.push(node);
  },
  toString() {
    return this.children.map(c => c.toString()).join("");
  }
};

// 执行渲染
render(vdom, root);

// 打印结果，观察 render 是否正确生成了 DOM 树
console.log("===== 第 6 章 demo：render 渲染结果 =====");
console.log(root.toString());
console.log("");

// 再来一个测试：包含文本、数字、false、null 的混合子节点
const mixedVdom = {
  type: "div",
  props: {
    children: [
      "价格：",      // 字符串 → 渲染
      99,            // 数字 → 渲染
      false,         // 布尔 false → 不渲染
      null,          // null → 不渲染
      { type: "span", props: { children: " 元" } } // 对象 → 渲染
    ]
  }
};

const root2 = {
  children: [],
  appendChild(n) { this.children.push(n); },
  toString() { return this.children.map(c => c.toString()).join(""); }
};

render(mixedVdom, root2);
console.log("===== 混合子节点渲染结果 =====");
console.log(root2.toString());
console.log("（注意：false 和 null 被过滤掉了，但数字 99 被保留了）");
`
  },

  // ===========================================================
  // 第 7 章：完整 render：属性、事件、子节点处理
  // ===========================================================
  {
    id: "rs-render-full",
    group: "第二部分 渲染与调和",
    icon: "🛠️",
    title: "完整 render：属性、事件、子节点处理",
    content: `
# 第 7 章 完整 render：属性、事件、子节点处理

## 一、开篇：上一章的 render 还缺什么

第 6 章我们实现的 \`render\` 已经能创建 DOM 树了，但有一个明显的缺陷——**属性几乎是直接塞进去的**，没有区分类型。真实场景里，属性有好几种截然不同的处理方式：

- \`className\` 要映射到 DOM 的 \`className\` 属性
- \`onClick\` / \`onChange\` 这类要绑定事件监听器
- \`style\` 是个对象，要转成 CSS 字符串或逐条设置
- \`data-*\` / \`aria-*\` 要用 \`setAttribute\`
- \`htmlFor\` 要映射到 \`for\` 属性（因为 \`for\` 是 JS 保留字）

这一章我们就把这些「属性分支」逐个补全，让 \`render\` 接近 React 真实实现。

### 1.1 生活类比：装修时的「分门别类施工」

想象装修工人拿到设计图后，不会所有东西都用同一把锤子搞定：

| 设计图条目 | 工人动作 |
|----------|---------|
| 「墙刷蓝色」 | 拿刷子刷漆 |
| 「装电灯」 | 接电线 |
| 「贴瓷砖」 | 上水泥 |
| 「装开关」 | 走电路 |

不同条目对应不同工艺。属性处理也一样：\`className\` 一种处理方式，\`onClick\` 另一种，\`style\` 又一种。

## 二、属性的分类

React 把 \`props\` 里的 key 大致分成几类：

| 类别 | 示例 | 处理方式 |
|------|------|---------|
| 事件属性 | \`onClick\`、\`onChange\`、\`onMouseOver\` | \`addEventListener\` |
| style | \`style: { color: 'red' }\` | 遍历对象，逐条设置 \`el.style[k] = v\` |
| className | \`className: 'btn'\` | 直接 \`el.className = v\` |
| htmlFor | \`htmlFor: 'name'\` | 映射到 \`el.htmlFor\`（即 HTML 的 \`for\`） |
| 自定义属性 | \`data-id\`、\`aria-label\` | \`setAttribute\` |
| 普通属性 | \`id\`、\`src\`、\`href\`、\`value\` | 直接 \`el[key] = v\` 或 \`setAttribute\` |

### 2.1 为什么要区分事件属性？

因为事件不能简单赋值。如果写 \`el.onClick = fn\`，后写的会覆盖前面的，只能绑一个；而 \`addEventListener\` 可以绑多个。

React 实际上用了**合成事件**系统（在自己顶层统一监听），但本章我们先实现最朴素的 \`addEventListener\`，理解原理。

### 2.2 为什么 style 是对象？

JSX 里写 \`style={{ color: 'red' }}\` 比 \`style="color:red"\` 更易于动态拼接：

\`\`\`js
// 动态计算样式，用对象很自然
<div style={{ color: isError ? 'red' : 'green', fontSize: 14 + 'px' }} />
\`\`\`

所以 React 收到的 \`style\` 是对象，需要遍历它的 key 设置到 \`el.style\` 上。

## 三、处理事件属性

事件属性的特征是**以 \`on\` 开头，且后面跟大写字母**（驼峰命名）。

\`\`\`js
function isEvent(key) {
  return key.startsWith("on") && key.length > 2 && key[2] === key[2].toUpperCase();
}
\`\`\`

为什么不能简单用 \`key.startsWith("on")\`？因为可能有自定义属性叫 \`online\` 之类，会被误判。加一个「第三个字符是大写」的判断更稳妥。

转换规则：

\`\`\`js
// onClick -> click
const eventName = key.slice(2).toLowerCase();
dom.addEventListener(eventName, props[key]);
\`\`\`

## 四、处理 style 对象

\`\`\`js
function setStyle(dom, styleObj) {
  for (const k in styleObj) {
    // 数字自动加 px（除了少数无单位属性）
    let value = styleObj[k];
    if (typeof value === "number" && !UNITLESS_PROPS.has(k)) {
      value = value + "px";
    }
    dom.style[k] = value;
  }
}
\`\`\`

注意 **无单位属性**：\`lineHeight\`、\`opacity\`、\`fontWeight\`、\`zIndex\` 这些用数字时不应该加 \`px\`。React 维护了一个白名单（\`isUnitlessNumber\`），本章 demo 里我们简化处理。

### 4.1 为什么要加 px？

因为 CSS 里大部分尺寸属性（\`width\`、\`fontSize\`、\`margin\`）必须带单位。写 \`fontSize: 14\` 时如果直接赋值 \`el.style.fontSize = 14\`，浏览器会忽略（无效值）。React 自动补 \`px\` 是为了少写代码。

## 五、处理 className 和 htmlFor

\`\`\`js
// className：React 用 className 代替 class（因为 class 是 JS 保留字）
if (key === "className") {
  dom.className = value;
}
// htmlFor：同理，htmlFor 对应 HTML 的 for 属性
else if (key === "htmlFor") {
  dom.htmlFor = value;
}
\`\`\`

这是 React 历史遗留的命名映射，理解它就理解了为什么 JSX 写 \`className\` 而不是 \`class\`。

## 六、处理普通属性

\`\`\`js
// data-* 和 aria-* 用 setAttribute
if (key.startsWith("data-") || key.startsWith("aria-")) {
  dom.setAttribute(key, value);
} else {
  // 其他普通属性直接赋值（id、src、href、value 等）
  dom[key] = value;
}
\`\`\`

\`setAttribute\` 和直接赋值的区别：

| 方式 | 特点 |
|------|------|
| \`el[key] = v\` | 直接改 DOM 属性，同步到 attribute，性能好 |
| \`el.setAttribute(k, v)\` | 改 HTML attribute，再同步到 property，触发 attribute change |

React 默认用 property 赋值（更快），自定义属性（\`data-*\`、\`aria-*\`）才用 \`setAttribute\`。

## 七、子节点数组的完整处理

第 6 章我们用 \`[].concat\` 兼容了单值和数组，本章再加一层**规范化**：

\`\`\`js
function normalizeChildren(children) {
  // null/undefined 视为空数组
  if (children == null) return [];
  // 数组就保持
  if (Array.isArray(children)) return children;
  // 单值包成数组
  return [children];
}
\`\`\`

然后再过滤掉 \`false / true / null / undefined\`。

### 7.1 嵌套数组的扁平化

JSX 里用 \`map\` 渲染列表时，children 可能是数组的数组：

\`\`\`js
<div>
  {[1, 2].map(n => <span>{n}</span>)}
  {[3, 4].map(n => <span>{n}</span>)}
</div>
// children 实际是 [ [span1, span2], [span3, span4] ]
\`\`\`

React 会递归扁平化。我们可以用 \`flat(Infinity)\` 或递归实现。本章 demo 里会处理这种情况。

## 八、完整 demo：增强版 render

本章 demo 把上述所有分支整合起来，实现一个完整版的 \`render\`，并用模拟 DOM 演示属性、事件、style 的设置过程。

## 九、本章小结

- 属性要按类别分支处理：事件、style、className、htmlFor、普通属性、自定义属性。
- 事件用 \`addEventListener\`，避免覆盖。
- style 是对象，要逐条设置，数字默认加 \`px\`（白名单除外）。
- \`className\` / \`htmlFor\` 是 React 的命名映射（避开 JS 保留字）。
- 子节点要规范化（单值→数组、嵌套→扁平），再过滤无效值。
- React 实际实现更复杂（合成事件、属性 diff、ref 处理等），但本章抓住了核心骨架。

下一章我们正式进入**调和（Reconciliation）**的世界——当数据更新时，怎么用最小的代价更新 DOM。
`,
    code: `// ============================================
// 第 7 章 demo：完整版 render（属性、事件、style、子节点）
// 运行方式：node reactsrc-ch7.js
// 本 demo 在 Node.js 中模拟 DOM，演示：
//   - className / htmlFor / id 等普通属性
//   - onClick 等事件属性（addEventListener）
//   - style 对象（含数字自动加 px）
//   - 嵌套数组的子节点扁平化
// ============================================

// ------------------------------------------------------------
// 第一部分：模拟 DOM（比第 6 章更完整）
// ------------------------------------------------------------
const eventLog = []; // 记录所有注册的事件，方便观察

const document = {
  // 创建元素节点
  createElement(tagName) {
    return {
      nodeType: 1,
      tagName: tagName.toLowerCase(),
      _props: {},     // 内部属性存储
      _listeners: {}, // 事件监听器存储：{ click: [fn1, fn2], ... }
      style: {},      // 样式对象
      children: [],
      // 简化版属性 setter：支持 className、htmlFor、id 等
      setAttribute(key, value) {
        this._props[key] = value;
      },
      // 注册事件监听器
      addEventListener(eventName, handler) {
        if (!this._listeners[eventName]) {
          this._listeners[eventName] = [];
        }
        this._listeners[eventName].push(handler);
        // 记录到全局日志，便于 console.log 观察
        eventLog.push(\`[\${this.tagName}] 注册事件 '\${eventName}'\`);
      },
      // 模拟触发事件（用于验证事件确实被绑上了）
      dispatchEvent(eventName, event) {
        const handlers = this._listeners[eventName] || [];
        handlers.forEach(fn => fn(event));
      },
      appendChild(node) {
        this.children.push(node);
      },
      // 转成 HTML 字符串（含属性、style、事件信息）
      toString() {
        const inner = this.children.map(c => c.toString()).join("");
        // 拼接所有属性
        const attrStr = Object.keys(this._props)
          .map(k => \` \${k}="\${this._props[k]}"\`)
          .join("");
        // 拼接 style
        const styleStr = Object.keys(this.style)
          .map(k => \`\${hyphenate(k)}:\${this.style[k]}\`)
          .join(";");
        const stylePart = styleStr ? \` style="\${styleStr}"\` : "";
        // 事件标记（仅用于演示，真实 DOM 不会在 HTML 里显示事件）
        const eventNames = Object.keys(this._listeners);
        const eventPart = eventNames.length
          ? \` [events: \${eventNames.join(",")}]\`
          : "";
        return \`<\${this.tagName}\${attrStr}\${stylePart}\${eventPart}>\${inner}</\${this.tagName}>\`;
      }
    };
  },
  // 创建文本节点
  createTextNode(text) {
    return {
      nodeType: 3,
      text: String(text),
      toString() { return this.text; }
    };
  }
};

// 把驼峰属性名转成 CSS 短横线形式：fontSize -> font-size
function hyphenate(str) {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}

// ------------------------------------------------------------
// 第二部分：完整版 render
// ------------------------------------------------------------

// 无单位属性白名单：这些属性用数字时不加 px
const UNITLESS_PROPS = new Set([
  "animationIterationCount",
  "borderImageOutset",
  "borderImageSlice",
  "borderImageWidth",
  "boxFlex",
  "boxFlexGroup",
  "boxOrdinalGroup",
  "columnCount",
  "flex",
  "flexGrow",
  "flexPositive",
  "flexShrink",
  "flexNegative",
  "flexOrder",
  "gridRow",
  "gridColumn",
  "fontWeight",
  "lineClamp",
  "lineHeight",
  "opacity",
  "order",
  "orphans",
  "tabSize",
  "widows",
  "zIndex",
  "zoom",
  "fillOpacity",
  "strokeOpacity",
  "strokeWidth"
]);

// 判断是否是事件属性：on 开头 + 第三个字符是大写
// 例如 onClick -> true；online -> false
function isEvent(key) {
  return (
    key.startsWith("on") &&
    key.length > 2 &&
    key[2] === key[2].toUpperCase()
  );
}

// 判断是否是自定义属性（data-* / aria-*）
function isCustomAttribute(key) {
  return key.startsWith("data-") || key.startsWith("aria-");
}

// 设置单个属性到 DOM 节点上
function setAttribute(dom, key, value) {
  // 分支一：事件属性 onClick -> addEventListener('click', fn)
  if (isEvent(key)) {
    // 截取 on 后面的部分并转小写：onClick -> click
    const eventName = key.slice(2).toLowerCase();
    dom.addEventListener(eventName, value);
    return;
  }
  // 分支二：style 对象
  if (key === "style") {
    // 遍历 style 对象的每个 key
    for (const styleKey in value) {
      let styleValue = value[styleKey];
      // 数字自动加 px（白名单属性除外）
      if (
        typeof styleValue === "number" &&
        !UNITLESS_PROPS.has(styleKey)
      ) {
        styleValue = styleValue + "px";
      }
      dom.style[styleKey] = styleValue;
    }
    return;
  }
  // 分支三：className（React 用 className 代替 class）
  if (key === "className") {
    dom._props["class"] = value; // HTML 里实际是 class
    dom.className = value;       // 同时设置 property
    return;
  }
  // 分支四：htmlFor（React 用 htmlFor 代替 for）
  if (key === "htmlFor") {
    dom._props["for"] = value;
    return;
  }
  // 分支五：自定义属性用 setAttribute
  if (isCustomAttribute(key)) {
    dom.setAttribute(key, value);
    return;
  }
  // 分支六：普通属性（id、src、href、value 等）
  // React 默认走 property 赋值，本章简化为同时写 props
  dom._props[key] = value;
}

// 规范化 children：把各种形态统一成"一维数组"
function normalizeChildren(children) {
  // null / undefined -> 空数组
  if (children == null) return [];
  // 已经是数组 -> 递归扁平化（处理数组嵌套数组）
  if (Array.isArray(children)) {
    return children.flat(Infinity);
  }
  // 单值 -> 包成数组
  return [children];
}

// 过滤掉不渲染的值
function isValidChild(c) {
  return c !== null && c !== undefined && c !== false && c !== true;
}

// 把单个 vdom 转成真实 DOM
function createDom(vdom) {
  // 文本节点
  if (typeof vdom === "string" || typeof vdom === "number") {
    return document.createTextNode(vdom);
  }
  // 元素节点
  const { type, props } = vdom;
  const dom = document.createElement(type);

  // 遍历所有 props，分别处理
  for (const key in props) {
    // children 单独处理，不走 setAttribute
    if (key === "children") continue;
    const value = props[key];
    // 跳过 null/undefined 的属性值
    if (value == null) continue;
    setAttribute(dom, key, value);
  }

  // 处理子节点
  const rawChildren = props.children;
  const childList = normalizeChildren(rawChildren).filter(isValidChild);
  childList.forEach(child => render(child, dom));

  return dom;
}

// render 主函数
function render(vdom, container) {
  const dom = createDom(vdom);
  container.appendChild(dom);
}

// ------------------------------------------------------------
// 第三部分：构建一个带属性、事件、style 的 vdom 并渲染
// ------------------------------------------------------------

// 模拟一个点击事件处理器
function handleClick(event) {
  console.log("  [handleClick 被调用] event =", event);
}

// vdom：一个带 className、style、onClick 的按钮
const buttonVdom = {
  type: "button",
  props: {
    id: "submit-btn",
    className: "btn primary",
    // style 是对象：fontSize 数字会自动加 px，opacity 数字不加
    style: {
      color: "white",
      background: "blue",
      fontSize: 14,      // -> 14px
      opacity: 0.8,      // -> 0.8（无单位）
      lineHeight: 1.5    // -> 1.5（无单位）
    },
    onClick: handleClick,
    onMouseOver: () => {},  // 第二个事件
    "data-testid": "submit",  // 自定义属性
    "aria-label": "提交按钮",
    children: "提交"
  }
};

const root = {
  children: [],
  appendChild(n) { this.children.push(n); },
  toString() { return this.children.map(c => c.toString()).join(""); }
};

render(buttonVdom, root);

console.log("===== 第 7 章 demo：完整 render 渲染结果 =====");
console.log(root.toString());
console.log("");
console.log("===== 事件注册日志 =====");
eventLog.forEach(log => console.log(log));
console.log("");

// 触发一次点击事件，验证监听器真的被绑上了
console.log("===== 模拟触发 click 事件 =====");
// 从 root.children 取出渲染好的 button DOM
const buttonDom = root.children[0];
buttonDom.dispatchEvent("click", { type: "click", target: "button" });
console.log("");

// 第二个例子：嵌套数组的子节点
const listVdom = {
  type: "ul",
  props: {
    children: [
      // 第一组：map 出来的数组
      [{ type: "li", props: { children: "A" } },
       { type: "li", props: { children: "B" } }],
      // 第二组：map 出来的数组
      [{ type: "li", props: { children: "C" } },
       { type: "li", props: { children: "D" } }]
    ]
  }
};

const root2 = {
  children: [],
  appendChild(n) { this.children.push(n); },
  toString() { return this.children.map(c => c.toString()).join(""); }
};
render(listVdom, root2);
console.log("===== 嵌套数组子节点渲染结果 =====");
console.log(root2.toString());
console.log("（注意：嵌套数组被扁平化成 4 个 <li>）");
`
  },

  // ===========================================================
  // 第 8 章：初识调和：什么是 Reconciliation
  // ===========================================================
  {
    id: "rs-reconciliation-intro",
    group: "第二部分 渲染与调和",
    icon: "🔄",
    title: "初识调和：什么是 Reconciliation",
    content: `
# 第 8 章 初识调和：什么是 Reconciliation

## 一、开篇：为什么需要「调和」

前面两章我们实现了 \`render\`，它能把一棵虚拟 DOM 一次性变成真实 DOM。但真实应用是动态的——用户点击、数据返回、定时器触发，都会让界面**变化**。

这就引出一个核心问题：**当虚拟 DOM 变了，怎么更新真实 DOM？**

最简单的办法是「推倒重来」：每次更新都把旧的 DOM 全删掉，用新 vdom 重新 \`render\` 一遍。但这有两个致命问题：

1. **性能差**：DOM 操作是浏览器里最慢的环节之一，全量重建开销巨大。
2. **状态丢失**：输入框里的文字、滚动条位置、焦点元素，全都会丢失。

所以 React 选择了另一条路——**调和（Reconciliation）**：用尽可能少的 DOM 操作，把旧 DOM 更新到新状态。

### 1.1 生活类比：装修翻新 vs 推倒重建

想象你重新装修一套房子：

| 方案 | 做法 | 代价 |
|------|------|------|
| 推倒重建 | 把房子拆成平地，从地基开始重盖 | 极慢、极贵 |
| 翻新（调和） | 评估每面墙、每件家具：能保留就保留，坏的就修，多的就拆 | 快、省钱 |

调和就是「翻新」：先比较新旧两份设计图，找出差异，再针对性地修补。

## 二、全量替换 vs 增量更新

我们用一组对比来直观感受两者的差距。

### 2.1 场景：一个 1000 项的列表，只改第 3 项的文字

**全量替换方案**：

1. 删掉整个 \`<ul>\` 和所有 1000 个 \`<li>\`
2. 创建新的 \`<ul>\` 和 1000 个 \`<li>\`
3. 总共约 **2001 次 DOM 操作**

**增量更新方案**：

1. 比较 1000 个 \`<li>\`，发现只有第 3 个变了
2. 只更新第 3 个 \`<li>\` 的文本
3. 总共 **1 次 DOM 操作**

差距是 2000 倍。这就是调和的价值。

### 2.2 全量替换的另一个坑：状态丢失

\`\`\`js
// 一个输入框，用户已经输入了 "hello"
<input value="hello" />

// 数据更新，重新 render
<input value="" />  // 全量替换后，用户输入消失，焦点也丢了
\`\`\`

调和则会发现「这是同一个 \`<input>\`，只是 value 变了」，只更新 \`value\` 属性，保留 DOM 节点本身，焦点和光标位置都不丢。

## 三、调和的输入输出

调和过程的签名可以抽象成：

\`\`\`
输入：
  - current（旧 fiber 树，对应已渲染的 DOM）
  - workInProgress（新 vdom 树，对应下次要显示的样子）
输出：
  - 一组 DOM 操作（插入、删除、更新）
  - 更新后的 fiber 树
\`\`\`

注意这里出现了 **fiber**——它是 React 16+ 的内部数据结构。本章先不深入 fiber，把它当成「带额外信息的 vdom」即可。

### 3.1 调和的核心步骤

1. **比较**：递归对比新旧两棵树，找出差异。
2. **标记**：把差异标记成 effect（副作用），比如「这个节点要插入」「这个属性要更新」。
3. **提交**：遍历所有 effect，真正执行 DOM 操作。

第 9、10 章我们会深入第 1 步——**Diff 算法**，它是调和的核心。

## 四、调和的关键约束

React 的调和并不是「最优解」（最优解是树编辑距离，复杂度 O(n³)），而是基于**三个启发式假设**做出的一组近似策略：

1. **不同类型的节点，直接替换整棵子树**——不复用、不深比。
2. **同类型的节点，复用 DOM 节点，只更新属性**——不重建。
3. **子节点用 key 标识身份**——便于列表里的移动、插入、删除。

这三个假设把复杂度从 O(n³) 降到 O(n)。这是 React 性能的关键基石。

### 4.1 为什么不追求最优解？

因为最优解（树编辑距离）需要把两棵树两两比较，节点数一多就完全跑不动。React 的假设牺牲了少量「理论最优」换来「工程可用」，是非常聪明的取舍。

| 方案 | 复杂度 | 实际可用 |
|------|-------|---------|
| 树编辑距离（最优） | O(n³) | ❌ 1000 节点要 10 亿次运算 |
| React 的启发式 Diff | O(n) | ✅ 1000 节点只要 1000 次运算 |

## 五、调和的触发时机

什么时候会触发调和？大致有这几类：

| 触发源 | 示例 |
|--------|------|
| \`setState\` / \`useState\` 的 setter | 用户点击按钮后 \`setCount(c => c+1)\` |
| 父组件重新渲染导致子组件更新 | 父组件 state 变了，子组件 props 跟着变 |
| \`forceUpdate\` | 强制刷新（class 组件） |
| Context 变化 | \`Provider\` 的 value 变了，所有消费者更新 |
| 外部触发 | \`ReactDOM.createRoot(...).render(...)\` 的首次渲染 |

每次触发后，React 都会：

1. 重新执行组件函数，生成新的 vdom。
2. 把新 vdom 和旧 fiber 树做调和。
3. 提交 effect 到真实 DOM。

## 六、调和 vs 渲染：概念区分

初学者经常混淆这两个词，这里明确一下：

| 概念 | 含义 |
|------|------|
| 渲染（Render） | 执行组件函数，生成 vdom 的过程 |
| 调和（Reconciliation） | 比较新旧 vdom，决定要怎么更新 DOM 的过程 |
| 提交（Commit） | 真正执行 DOM 操作的过程 |

一次更新会经历：**渲染 → 调和 → 提交**。其中调和是「思考」阶段，提交是「动手」阶段。

### 6.1 React 18+ 的双重渲染

注意：React 18 在并发模式下，渲染阶段可能会被中断和重做（这就是 fiber 的「可中断渲染」），但**提交阶段是同步的**——DOM 操作一旦开始就不能打断。这点我们后续讲 fiber 时会展开。

## 七、完整 demo：对比全量重建 vs 增量更新

本章 demo 模拟两种更新策略，统计它们各自的「DOM 操作次数」，直观感受调和的收益：

- 全量重建：每次更新都重新创建所有节点。
- 增量更新：只更新变化的部分。

## 八、本章小结

- 调和的目标是「用最少的 DOM 操作完成更新」。
- 全量重建会丢状态、性能差，调和能复用 DOM、保留状态。
- 调和基于三个假设，把复杂度从 O(n³) 降到 O(n)。
- 一次更新 = 渲染（生成 vdom）+ 调和（比较）+ 提交（执行 DOM 操作）。
- React 18+ 的渲染阶段可中断，提交阶段不可中断。

下一章我们正式进入 Diff 算法，看 React 怎么具体比较两棵树。
`,
    code: `// ============================================
// 第 8 章 demo：全量重建 vs 增量更新 的操作次数对比
// 运行方式：node reactsrc-ch8.js
// 本 demo 模拟两种更新策略：
//   1. 全量重建：每次都重新创建所有 DOM 节点
//   2. 增量更新：只更新发生变化的节点
// 并统计各自的 DOM 操作次数，直观感受调和的价值
// ============================================

// ------------------------------------------------------------
// 第一部分：模拟 DOM + 操作计数器
// ------------------------------------------------------------
let opCount = 0; // 全局计数器，记录 DOM 操作次数
function resetCount() { opCount = 0; }
function logOp(msg) { opCount++; }

// 创建一个"假"的 DOM 节点（仅记录操作次数，不真的渲染）
function makeNode(tagName) {
  logOp(\`createElement(\${tagName})\`);
  return {
    tagName,
    text: null,
    children: [],
    setProperty(key, value) { logOp(\`setProperty(\${key})\`); },
    setText(t) { this.text = t; logOp(\`setText(\${t})\`); },
    appendChild(c) { this.children.push(c); logOp(\`appendChild\`); },
    removeChild(c) {
      const i = this.children.indexOf(c);
      if (i >= 0) this.children.splice(i, 1);
      logOp(\`removeChild\`);
    }
  };
}

function makeTextNode(text) {
  logOp(\`createTextNode(\${text})\`);
  return { text, setText(t) { this.text = t; logOp(\`setText(\${t})\`); } };
}

// ------------------------------------------------------------
// 第二部分：全量重建策略
// ------------------------------------------------------------
// 思路：每次更新都把旧 DOM 全部删除，用新 vdom 重新构建
// 优点：实现简单
// 缺点：DOM 操作次数极高，状态丢失
// ------------------------------------------------------------

// 把 vdom 全量渲染成 DOM（递归创建）
function renderFull(vdom) {
  // 文本节点
  if (typeof vdom === "string" || typeof vdom === "number") {
    return makeTextNode(String(vdom));
  }
  // 元素节点
  const dom = makeNode(vdom.type);
  // 设置属性
  if (vdom.props) {
    for (const k in vdom.props) {
      if (k !== "children" && vdom.props[k] != null) {
        dom.setProperty(k, vdom.props[k]);
      }
    }
    // 递归处理 children
    const kids = [].concat(vdom.props.children || []).filter(
      c => c !== null && c !== undefined && c !== false && c !== true
    );
    kids.forEach(c => dom.appendChild(renderFull(c)));
  }
  return dom;
}

// 全量更新：销毁旧 DOM 树，用新 vdom 重建
function updateFull(oldRoot, newVdom) {
  // 模拟"销毁旧树"的操作（递归删除）
  function destroy(node) {
    if (node.children) node.children.forEach(destroy);
    logOp(\`destroy(\${node.tagName || "text"})\`);
  }
  if (oldRoot) destroy(oldRoot);
  // 重建
  return renderFull(newVdom);
}

// ------------------------------------------------------------
// 第三部分：增量更新策略（简化版调和）
// ------------------------------------------------------------
// 思路：复用旧 DOM 节点，只更新差异部分
// 这里实现最基础的版本：
//   - 类型相同 -> 复用，更新属性和文本
//   - 类型不同 -> 替换
//   - children 同位置比较（暂不处理 key）
// ------------------------------------------------------------

function updateIncremental(oldDom, newVdom) {
  // 情况一：新 vdom 是文本
  if (typeof newVdom === "string" || typeof newVdom === "number") {
    // 旧节点也是文本 -> 只更新文字（1 次操作）
    if (oldDom && oldDom.text !== undefined && oldDom.tagName === undefined) {
      if (oldDom.text !== String(newVdom)) {
        oldDom.setText(String(newVdom));
      }
      return oldDom;
    }
    // 旧节点不是文本 -> 替换为文本节点
    return makeTextNode(String(newVdom));
  }

  // 情况二：新 vdom 是元素
  // 旧节点类型不同（标签变了，或旧的是文本）-> 替换
  if (!oldDom || oldDom.tagName !== newVdom.type) {
    return renderFull(newVdom);
  }

  // 类型相同 -> 复用 oldDom，更新属性
  const newProps = newVdom.props || {};
  for (const k in newProps) {
    if (k === "children") continue;
    // 简化：只要属性存在就更新一次（真实 React 会 diff 属性值）
    if (newProps[k] != null) {
      oldDom.setProperty(k, newProps[k]);
    }
  }

  // 处理 children：同位置一一对应更新
  const newKids = [].concat(newProps.children || []).filter(
    c => c !== null && c !== undefined && c !== false && c !== true
  );
  const oldKids = oldDom.children || [];

  // 复用已有子节点
  for (let i = 0; i < newKids.length; i++) {
    if (i < oldKids.length) {
      // 位置上有旧节点 -> 增量更新它
      updateIncremental(oldKids[i], newKids[i]);
    } else {
      // 位置上没旧节点 -> 新增
      const newNode = renderFull(newKids[i]);
      oldDom.appendChild(newNode);
    }
  }
  // 多余的旧子节点删除
  for (let i = newKids.length; i < oldKids.length; i++) {
    oldDom.removeChild(oldKids[i]);
  }

  return oldDom;
}

// ------------------------------------------------------------
// 第四部分：跑对比实验
// ------------------------------------------------------------

// 初始 vdom：3 项列表
const v1 = {
  type: "ul",
  props: {
    children: [
      { type: "li", props: { children: "Apple" } },
      { type: "li", props: { children: "Banana" } },
      { type: "li", props: { children: "Cherry" } }
    ]
  }
};

// 更新后 vdom：只改了第 2 项的文字（Banana -> Blueberry）
const v2 = {
  type: "ul",
  props: {
    children: [
      { type: "li", props: { children: "Apple" } },
      { type: "li", props: { children: "Blueberry" } },
      { type: "li", props: { children: "Cherry" } }
    ]
  }
};

console.log("===== 第 8 章 demo：全量重建 vs 增量更新 =====");
console.log("场景：3 项列表，只把第 2 项 Banana 改成 Blueberry");
console.log("");

// 实验 1：全量重建
resetCount();
let rootA = renderFull(v1);
const countA1 = opCount;
resetCount();
rootA = updateFull(rootA, v2);
const countA2 = opCount;
console.log("【全量重建】");
console.log("  首次渲染 DOM 操作次数：", countA1);
console.log("  更新时 DOM 操作次数：", countA2);
console.log("  （销毁旧树 + 重建新树，操作量很大）");
console.log("");

// 实验 2：增量更新
resetCount();
let rootB = renderFull(v1);
const countB1 = opCount;
resetCount();
rootB = updateIncremental(rootB, v2);
const countB2 = opCount;
console.log("【增量更新】");
console.log("  首次渲染 DOM 操作次数：", countB1);
console.log("  更新时 DOM 操作次数：", countB2);
console.log("  （只更新第 2 项的文本，其他节点复用）");
console.log("");

// 实验 3：放大到 100 项列表
const bigV1 = {
  type: "ul",
  props: {
    children: Array.from({ length: 100 }, (_, i) => ({
      type: "li",
      props: { children: \`item-\${i}\` }
    }))
  }
};
const bigV2 = {
  type: "ul",
  props: {
    children: Array.from({ length: 100 }, (_, i) => ({
      type: "li",
      props: { children: i === 50 ? "CHANGED" : \`item-\${i}\` }
    }))
  }
};

console.log("===== 放大实验：100 项列表，只改第 50 项 =====");
resetCount();
let rootC = renderFull(bigV1);
resetCount();
rootC = updateFull(rootC, bigV2);
console.log("【全量重建】更新操作次数：", opCount);

resetCount();
let rootD = renderFull(bigV1);
resetCount();
rootD = updateIncremental(rootD, bigV2);
console.log("【增量更新】更新操作次数：", opCount);
console.log("");
console.log("结论：列表越大，增量更新的优势越明显。");
console.log("全量重建的次数随节点数线性增长，增量更新只与「变化数」相关。");
`
  },

  // ===========================================================
  // 第 9 章：Diff 算法：同层比较的三大策略
  // ===========================================================
  {
    id: "rs-diff-algorithm",
    group: "第二部分 渲染与调和",
    icon: "⚡",
    title: "Diff 算法：同层比较的三大策略",
    content: `
# 第 9 章 Diff 算法：同层比较的三大策略

## 一、开篇：Diff 是调和的核心

第 8 章我们讲到调和分三步：比较 → 标记 → 提交。其中「比较」这一步就是 **Diff 算法**——它决定了 React 怎么找出新旧两棵树的差异。

Diff 是 React 性能的「心脏」。理解了它，你就理解了为什么 React 能在大规模界面上保持流畅。

### 1.1 生活类比：快递分拣的「同层比对」

想象快递分拣中心：

- 两个传送带分别送来「昨天的包裹清单」和「今天的包裹清单」。
- 分拣员不会把所有包裹倒在一起重新排序，而是**按楼层分组**：
  - 先比对 1 楼的清单（同层比较）
  - 再比对 2 楼的清单
  - 楼层对不上（比如 1 楼变成 2 楼）就直接整组退回重发
  - 同楼层内，按包裹上的「编号」（key）匹配

这就是 React Diff 的思路：**同层比较 + key 匹配**。

## 二、Diff 的三个假设

React Diff 基于三个核心假设，把树比较从 O(n³) 降到 O(n)：

| 假设 | 内容 | 原因 |
|------|------|------|
| 假设一 | **不同类型的元素，产出不同的树** | \`<div>\` 和 \`<span>\` 渲染结果差异太大，没必要细比 |
| 假设二 | **同类型元素，复用节点，只更新属性** | \`<div id="a">\` 变 \`<div id="b">\`，DOM 节点本身没变 |
| 假设三 | **子节点用 key 标识身份** | 列表里同位置可能换了内容，靠 key 判断是不是「同一个」 |

### 2.1 假设一的体现

\`\`\`js
// 旧 vdom
{ type: "div", props: { children: "Hello" } }
// 新 vdom
{ type: "span", props: { children: "Hello" } }
\`\`\`

虽然 children 都是 "Hello"，但 React 看到 \`div\` → \`span\`，会**直接销毁旧 div 及其子树，新建 span 及其子树**，不做深层复用。

为什么这么激进？因为不同标签的 DOM 行为差异大（\`<table>\` 有特殊结构、\`<input>\` 有内部状态），细比反而容易出错。

### 2.2 假设二的体现

\`\`\`js
// 旧 vdom
{ type: "div", props: { id: "a", className: "red", children: "Hi" } }
// 新 vdom
{ type: "div", props: { id: "a", className: "blue", children: "Hi" } }
\`\`\`

\`type\` 相同，React **复用同一个 DOM 节点**，只把 \`className\` 从 \`red\` 改成 \`blue\`。其他没变的属性（id、children）不动。

### 2.3 假设三的体现

这一条专门处理**列表**，下一章会详细讲。这里先记住：列表 Diff 时，key 是判断「同一个节点」的依据。

## 三、节点类型不同：直接替换整棵子树

这是最简单的分支。Diff 函数入口先判断新旧节点的类型：

\`\`\`js
function diff(oldVdom, newVdom) {
  // 类型不同（标签不同，或一边是文本一边是元素）
  if (typeof oldVdom !== typeof newVdom || oldVdom.type !== newVdom.type) {
    // 标记为「替换」：删除旧节点，插入新节点
    return [{ op: "replace", oldVdom, newVdom }];
  }
  // 类型相同 -> 走「更新」分支
  // ...
}
\`\`\`

### 3.1 替换的代价

替换意味着：

1. 销毁旧节点及其所有子节点（递归卸载组件、解绑事件、清理 ref）。
2. 创建新节点及其所有子节点。
3. 把新节点插到原来旧节点的位置。

如果只是 \`div\` → \`span\` 这种小改动，看起来浪费，但 React 认为「不值得为罕见情况优化」。

## 四、类型相同：复用 DOM，更新属性

类型相同时，Diff 会做两件事：

1. **属性 Diff**：比较新旧 props，找出需要更新的属性。
2. **子节点 Diff**：递归比较 children。

### 4.1 属性 Diff

\`\`\`js
function diffProps(oldProps, newProps) {
  const patches = [];
  // 找新增/修改的属性
  for (const key in newProps) {
    if (key === "children") continue;
    if (oldProps[key] !== newProps[key]) {
      patches.push({ op: "updateProp", key, value: newProps[key] });
    }
  }
  // 找删除的属性
  for (const key in oldProps) {
    if (key === "children") continue;
    if (!(key in newProps)) {
      patches.push({ op: "removeProp", key });
    }
  }
  return patches;
}
\`\`\`

注意：属性 Diff 是**浅比较**，只比较值是否相等。对于对象类型的属性（\`style\`、\`onClick\`），React 默认用引用比较——所以每次 render 传新的 \`style\` 对象都会触发更新。

### 4.2 子节点 Diff

这是 Diff 里最复杂的部分，因为涉及到列表的增删改和移动。React 把它分成两种模式：

- **没 key**：按位置一一对应比较（同位置旧节点和新节点比）。
- **有 key**：用 key 匹配，处理插入、删除、移动。

本章先讲没 key 的情况，下一章专门讲有 key 的列表 Diff。

## 五、子节点 Diff：三种情况（无 key）

无 key 时，React 把新旧 children 按位置一一配对：

\`\`\`
旧：[A, B, C]
新：[A, B', D]
位置 0：A vs A -> 更新（如果内容变了）
位置 1：B vs B' -> 更新（B' 替换 B 的内容）
位置 2：C vs D -> 类型相同就更新，不同就替换
\`\`\`

\`\`\`js
function diffChildren(oldKids, newKids) {
  const patches = [];
  const max = Math.max(oldKids.length, newKids.length);
  for (let i = 0; i < max; i++) {
    if (i >= oldKids.length) {
      // 旧没有，新有 -> 插入
      patches.push({ op: "insert", newVdom: newKids[i], index: i });
    } else if (i >= newKids.length) {
      // 旧有，新没有 -> 删除
      patches.push({ op: "remove", oldVdom: oldKids[i], index: i });
    } else {
      // 都有 -> 递归 diff
      patches.push({ op: "update", oldVdom: oldKids[i], newVdom: newKids[i], index: i });
    }
  }
  return patches;
}
\`\`\`

### 5.1 无 key 的局限

考虑这个场景：

\`\`\`
旧：[A, B, C]
新：[C, A, B]   // 把 C 移到了最前面
\`\`\`

无 key 的 Diff 会按位置比较：

- 位置 0：A vs C -> 更新（把 A 改成 C 的内容）
- 位置 1：B vs A -> 更新（把 B 改成 A 的内容）
- 位置 2：C vs B -> 更新（把 C 改成 B 的内容）

结果：3 次更新操作，且 C 的内部状态（比如组件 state）被丢失——因为它被「改造」成了 A、B 的样子，而不是真的「移动」。

这正是 React 警告「列表要加 key」的原因。下一章详细展开。

## 六、Diff 的输出：操作日志

Diff 本身**不修改 DOM**，它只产出一份「操作清单」（patches），后续提交阶段才真正执行。这种分离让 React 能：

- 在渲染阶段反复 diff（可中断）。
- 一次性提交所有 DOM 操作（批量优化）。

### 6.1 操作类型

| op | 含义 |
|----|------|
| \`replace\` | 替换节点（类型不同） |
| \`update\` | 更新节点（类型相同，复用） |
| \`updateProp\` | 更新属性 |
| \`removeProp\` | 删除属性 |
| \`insert\` | 插入子节点 |
| \`remove\` | 删除子节点 |
| \`move\` | 移动子节点（有 key 时） |

## 七、完整 demo：实现 diff 函数并输出操作日志

本章 demo 实现一个简化版 diff，对比新旧 vdom 树，输出每一步的操作日志。你可以清楚地看到「类型不同 → 替换」「类型相同 → 更新属性」的分支。

## 八、本章小结

- Diff 基于三个假设：类型不同直接替换、类型相同复用更新、子节点用 key 标识。
- 类型不同 → 销毁旧子树、新建新子树（最激进）。
- 类型相同 → 复用 DOM，diff 属性 + diff 子节点。
- 子节点无 key 时按位置一一比较，处理插入、删除、更新三种情况。
- Diff 只产出操作清单，不直接动 DOM，提交阶段才执行。

下一章我们进入列表 Diff 的关键——key 的作用。
`,
    code: `// ============================================
// 第 9 章 demo：实现 diff 函数，输出操作日志
// 运行方式：node reactsrc-ch9.js
// 本 demo 实现 React Diff 的核心逻辑：
//   - 类型不同 -> 替换
//   - 类型相同 -> 复用 + diff 属性 + diff 子节点
//   - 子节点按位置比较（无 key 模式）
// 并把所有 diff 操作记录到日志，便于观察
// ============================================

// ------------------------------------------------------------
// 第一部分：diff 入口
// ------------------------------------------------------------

// 操作日志，收集所有 diff 产生的 patch
const patches = [];

// 添加一条操作日志，带层级缩进便于阅读
function addPatch(depth, op, detail) {
  const indent = "  ".repeat(depth);
  patches.push(\`\${indent}[\${op}] \${detail}\`);
}

// diff 主函数
// oldVdom / newVdom：新旧虚拟 DOM
// depth：当前递归深度（仅用于日志缩进）
function diff(oldVdom, newVdom, depth = 0) {
  // 情况一：新节点是文本（字符串或数字）
  if (typeof newVdom === "string" || typeof newVdom === "number") {
    // 旧节点也是文本 -> 看内容是否变了
    if (typeof oldVdom === "string" || typeof oldVdom === "number") {
      if (String(oldVdom) !== String(newVdom)) {
        addPatch(depth, "updateText", \`"\${oldVdom}" -> "\${newVdom}"\`);
      } else {
        addPatch(depth, "skip", "文本相同，跳过");
      }
      return;
    }
    // 旧节点是元素 -> 替换为文本
    addPatch(depth, "replace", \`元素 -> 文本 "\${newVdom}"\`);
    return;
  }

  // 情况二：新节点是元素
  // 旧节点是文本或类型不同 -> 替换整棵子树
  if (
    typeof oldVdom !== "object" ||
    oldVdom === null ||
    oldVdom.type !== newVdom.type
  ) {
    addPatch(
      depth,
      "replace",
      \`\${describeType(oldVdom)} -> \${newVdom.type}\`
    );
    // 替换时不深入比较子树（整棵重建）
    return;
  }

  // 情况三：类型相同 -> 复用 DOM，diff 属性 + diff 子节点
  addPatch(depth, "update", \`<\${newVdom.type}>\`);

  // diff 属性
  diffProps(oldVdom.props || {}, newVdom.props || {}, depth + 1);

  // diff 子节点
  const oldKids = normalize(oldVdom.props && oldVdom.props.children);
  const newKids = normalize(newVdom.props && newVdom.props.children);
  diffChildren(oldKids, newKids, depth + 1);
}

// 描述节点类型（用于日志）
function describeType(vdom) {
  if (vdom == null) return "null";
  if (typeof vdom === "string") return \`文本("\${vdom}")\`;
  if (typeof vdom === "number") return \`数字(\${vdom})\`;
  return vdom.type;
}

// 规范化 children：统一成一维数组
function normalize(children) {
  if (children == null) return [];
  if (Array.isArray(children)) return children.flat(Infinity);
  return [children];
}

// ------------------------------------------------------------
// 第二部分：属性 diff
// ------------------------------------------------------------

function diffProps(oldProps, newProps, depth) {
  // 找新增 / 修改的属性
  for (const key in newProps) {
    if (key === "children") continue;
    const oldVal = oldProps[key];
    const newVal = newProps[key];
    if (oldVal !== newVal) {
      if (!(key in oldProps)) {
        addPatch(depth, "addProp", \`\${key}=\${formatVal(newVal)}\`);
      } else {
        addPatch(depth, "updateProp", \`\${key}: \${formatVal(oldVal)} -> \${formatVal(newVal)}\`);
      }
    }
  }
  // 找删除的属性
  for (const key in oldProps) {
    if (key === "children") continue;
    if (!(key in newProps)) {
      addPatch(depth, "removeProp", key);
    }
  }
}

// 格式化属性值（避免对象打印成 [object Object]）
function formatVal(v) {
  if (typeof v === "string") return \`"\${v}"\`;
  if (typeof v === "function") return "[fn]";
  if (v && typeof v === "object") return JSON.stringify(v);
  return String(v);
}

// ------------------------------------------------------------
// 第三部分：子节点 diff（无 key 模式）
// ------------------------------------------------------------

function diffChildren(oldKids, newKids, depth) {
  const max = Math.max(oldKids.length, newKids.length);
  for (let i = 0; i < max; i++) {
    if (i >= oldKids.length) {
      // 旧没有 -> 插入
      addPatch(depth, "insert", \`位置 \${i}: \${describeType(newKids[i])}\`);
    } else if (i >= newKids.length) {
      // 新没有 -> 删除
      addPatch(depth, "remove", \`位置 \${i}: \${describeType(oldKids[i])}\`);
    } else {
      // 都有 -> 递归 diff
      diff(oldKids[i], newKids[i], depth);
    }
  }
}

// ------------------------------------------------------------
// 第四部分：跑几个 diff 场景
// ------------------------------------------------------------

console.log("===== 第 9 章 demo：Diff 算法操作日志 =====");
console.log("");

// 场景 1：类型相同，属性变化
console.log("【场景 1】同类型 <div>，className 改变：");
const s1Old = { type: "div", props: { className: "red", id: "box", children: "Hi" } };
const s1New = { type: "div", props: { className: "blue", id: "box", children: "Hi" } };
patches.length = 0;
diff(s1Old, s1New);
patches.forEach(p => console.log(p));
console.log("");

// 场景 2：类型不同，整棵替换
console.log("【场景 2】类型从 <div> 变 <span>：");
const s2Old = { type: "div", props: { children: "Hello" } };
const s2New = { type: "span", props: { children: "Hello" } };
patches.length = 0;
diff(s2Old, s2New);
patches.forEach(p => console.log(p));
console.log("（注意：类型不同直接替换，不深入比较）");
console.log("");

// 场景 3：子节点增删
console.log("【场景 3】子节点列表变化（新增第 3 项）：");
const s3Old = {
  type: "ul",
  props: {
    children: [
      { type: "li", props: { children: "A" } },
      { type: "li", props: { children: "B" } }
    ]
  }
};
const s3New = {
  type: "ul",
  props: {
    children: [
      { type: "li", props: { children: "A" } },
      { type: "li", props: { children: "B" } },
      { type: "li", props: { children: "C" } }
    ]
  }
};
patches.length = 0;
diff(s3Old, s3New);
patches.forEach(p => console.log(p));
console.log("");

// 场景 4：无 key 时「移动」被识别为「更新」
console.log("【场景 4】无 key，把 [A,B,C] 重排成 [C,A,B]：");
const s4Old = {
  type: "ul",
  props: {
    children: [
      { type: "li", props: { children: "A" } },
      { type: "li", props: { children: "B" } },
      { type: "li", props: { children: "C" } }
    ]
  }
};
const s4New = {
  type: "ul",
  props: {
    children: [
      { type: "li", props: { children: "C" } },
      { type: "li", props: { children: "A" } },
      { type: "li", props: { children: "B" } }
    ]
  }
};
patches.length = 0;
diff(s4Old, s4New);
patches.forEach(p => console.log(p));
console.log("（注意：3 个位置全部触发 updateText，无法识别「移动」）");
console.log("这就是无 key 的局限——下一章用 key 解决。");
console.log("");

// 场景 5：属性新增和删除同时发生
console.log("【场景 5】属性同时新增和删除：");
const s5Old = { type: "input", props: { value: "x", disabled: true } };
const s5New = { type: "input", props: { value: "x", placeholder: "输入" } };
patches.length = 0;
diff(s5Old, s5New);
patches.forEach(p => console.log(p));
console.log("（注意：disabled 被删除，placeholder 被新增）");
`
  },

  // ===========================================================
  // 第 10 章：Key 的作用：列表 Diff 的关键
  // ===========================================================
  {
    id: "rs-key-importance",
    group: "第二部分 渲染与调和",
    icon: "🔑",
    title: "Key 的作用：列表 Diff 的关键",
    content: `
# 第 10 章 Key 的作用：列表 Diff 的关键

## 一、开篇：列表 Diff 的难题

第 9 章我们看到，无 key 时把 \`[A, B, C]\` 重排成 \`[C, A, B]\` 会触发 3 次更新——明明只是「移动」，React 却当成「3 次内容修改」处理。

更严重的是：**无 key 时，节点身份会错乱**。位置 0 上的旧节点 A，被改造成 C 的样子，A 原本的内部状态（组件 state、input 值、动画进度）会丢失或错位。

这就是 key 登场的舞台。

### 1.1 生活类比：酒店房卡

想象一家酒店，房间号是固定的（位置 0、1、2），但住客会变：

| 模式 | 做法 | 问题 |
|------|------|------|
| 无 key（按房间号认人） | 101 房昨天住张三，今天住李四，分拣员以为「张三变成了李四」 | 张三的行李（state）被当成李四的 |
| 有 key（按身份证认人） | 张三的身份证号是 A，李四是 B。今天 101 房住 B，说明李四来了；张三可能搬到 102 了 | 行李跟着身份证走，不会错 |

key 就是节点的「身份证号」，让 React 能跨位置认出「同一个节点」。

## 二、为什么列表需要 key

考虑一个待办列表：

\`\`\`jsx
function TodoList({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li>
          <input type="checkbox" />
          <span>{item.text}</span>
          <button>删除</button>
        </li>
      ))}
    </ul>
  );
}
\`\`\`

用户在第一项的 input 里勾选了「已完成」，然后往列表最前面插入一条新待办。如果用 index 做 key：

\`\`\`
旧列表：[A, B, C]    // 用户勾选了 A
新列表：[D, A, B, C]  // 在最前面插入 D
\`\`\`

无 key（或用 index 作 key）时：

- 位置 0：旧 A → 新 D，React 把 A 改造成 D 的样子，**A 的勾选状态被 D 继承**！
- 位置 1：旧 B → 新 A，B 被改造成 A。
- 位置 2：旧 C → 新 B。
- 位置 3：（新增）C。

结果：勾选状态错位——明明勾的是 A，现在显示在 D 上。这是 React 列表最经典的 bug。

有 key 时：

- key=A 的节点还是 A，只是位置从 0 移到 1，状态保留。
- D 是新 key，直接插入位置 0。
- 结果完全正确。

## 三、用 index 做 key 的问题

\`key={index}\` 是最常见的反模式。它只在「列表永远只从末尾追加、不会重排、不会中间插入删除」时才安全。

### 3.1 index 做 key 的具体危害

| 场景 | 危害 |
|------|------|
| 列表头部插入新项 | 所有项的 index 错位，状态跟着错位 |
| 列表中间删除项 | 后面所有项 index 减 1，状态串位 |
| 列表排序 | 完全错乱 |
| 表单类组件 | input 值、选中状态、校验错误信息全部错位 |

### 3.2 什么时候 index 做 key 勉强可以？

- 列表是静态的，不会增删重排。
- 列表项没有内部状态（纯展示）。
- 列表项的 key 不可获得（罕见）。

即使如此，也建议用业务 ID，养成习惯。

## 四、key 在 Diff 算法中的匹配逻辑

有 key 时，React 的列表 Diff 大致这样：

1. 第一轮：从头遍历，同位置 + 同 key 的节点直接复用，更新属性。
2. 第二轮：如果位置对不上 key，把剩余旧节点放进一个 Map（key → 节点）。
3. 第三轮：遍历剩余新节点，从 Map 里按 key 找能复用的旧节点，找到就「移动」，找不到就「新建」。
4. 最后：Map 里剩下的旧节点全部删除。

### 4.1 简化版匹配过程

\`\`\`
旧：[A(0), B(1), C(2)]   // 括号里是 key
新：[C(0), A(1), B(2)]   // 注意：这里 key 标识身份，位置变了

第一轮：位置 0 旧 key=A vs 新 key=C，不匹配，停止。
建 Map：{ A: 节点A, B: 节点B, C: 节点C }
遍历新节点：
  C -> 在 Map 里找到，复用，标记为「移动到位置 0」
  A -> 在 Map 里找到，复用，标记为「移动到位置 1」
  B -> 在 Map 里找到，复用，标记为「移动到位置 2」
Map 已空，无删除。
最终操作：3 次移动（无更新、无新建、无删除）
\`\`\`

对比无 key 的 3 次更新——有 key 时虽然也要 3 次移动，但**节点身份没变，状态保留**。这才是关键。

## 五、没有 key 时的退化策略

如果开发者没写 key，React 会**警告**并退化到「按位置比较」的模式（即第 9 章的无 key Diff）。

\`\`\`
Warning: Each child in a list should have a unique "key" prop.
\`\`\`

这个警告在开发环境会打印，提醒你加上 key。生产环境不打印，但行为一样（退化到位置比较）。

### 5.1 为什么不强制报错？

因为有些简单列表确实不需要 key（纯展示、无状态）。React 选择「警告 + 退化」而非「报错」，是为了开发体验。

## 六、key 的正确选择

| 选择 | 是否推荐 | 说明 |
|------|---------|------|
| 业务 ID（\`item.id\`） | ✅ 推荐 | 最稳定，唯一标识 |
| 数据库主键 | ✅ 推荐 | 同上 |
| UUID | ✅ 推荐 | 适合前端生成的临时数据 |
| 数组 index | ⚠️ 谨慎 | 只在列表稳定时可用 |
| Math.random() | ❌ 禁止 | 每次 render 都变，等于没 key |
| Date.now() | ❌ 禁止 | 同上 |

### 6.1 key 要满足的条件

1. **稳定**：同一条数据的 key 在不同 render 里要一致。
2. **唯一**：同一列表内不能有重复 key（React 会警告）。
3. **可预测**：不要用随机值，否则每次都重建。

### 6.2 一个常见误区：key 全局唯一吗？

不需要。**key 只需要在兄弟节点间唯一**，不同列表可以用相同的 key。

\`\`\`jsx
// 这样完全合法：两个列表都用 "a"、"b" 作 key
<ul>{list1.map(i => <li key={i.id}>...</li>)}</ul>
<ol>{list2.map(i => <li key={i.id}>...</li>)}</ol>
\`\`\`

## 七、完整 demo：有 key vs 无 key 的 diff 对比

本章 demo 同时实现两种列表 Diff：

- \`diffChildrenNoKey\`：按位置比较（第 9 章逻辑）。
- \`diffChildrenWithKey\`：用 key 匹配，识别移动。

输出两种模式下的操作日志，直观看到 key 的价值。

## 八、本章小结

- key 是节点的「身份证号」，让 React 跨位置认出同一个节点。
- 用 index 做 key 在列表增删重排时会错位，丢失状态。
- key 要满足：稳定、唯一（兄弟间）、可预测。
- 有 key 的 Diff：第一轮同位置匹配 → 第二轮 Map 匹配 → 标记移动/新建/删除。
- 无 key 退化为按位置比较，无法识别移动，状态易错乱。
- key 不需要全局唯一，只需兄弟间唯一。

至此，第二部分「渲染与调和」的核心就讲完了。下一部分我们会进入 **Fiber 架构**，看 React 怎么把渲染做成「可中断、可恢复」的。
`,
    code: `// ============================================
// 第 10 章 demo：有 key vs 无 key 的列表 diff 对比
// 运行方式：node reactsrc-ch10.js
// 本 demo 实现两种列表 Diff：
//   1. 无 key：按位置一一比较（第 9 章逻辑）
//   2. 有 key：用 key 匹配，识别「移动」
// 并打印操作日志，直观对比两者的差异
// ============================================

// ------------------------------------------------------------
// 第一部分：通用工具
// ------------------------------------------------------------

// 操作日志
const patches = [];
function addPatch(mode, op, detail) {
  patches.push({ mode, op, detail });
}
function clearPatches() { patches.length = 0; }

// 规范化 children
function normalize(children) {
  if (children == null) return [];
  if (Array.isArray(children)) return children.flat(Infinity);
  return [children];
}

// 描述节点（带 key 信息）
function describe(vdom) {
  if (vdom == null) return "null";
  if (typeof vdom === "string") return \`"\${vdom}"\`;
  if (typeof vdom === "number") return String(vdom);
  // 提取 key（如果有）
  const key = vdom.props && vdom.props.key;
  const text = vdom.props && vdom.props.children;
  if (typeof text === "string") {
    return key != null ? \`<\${vdom.type} key=\${key}>\${text}</\${vdom.type}>\` : \`<\${vdom.type}>\${text}</\${vdom.type}>\`;
  }
  return key != null ? \`<\${vdom.type} key=\${key}>\` : \`<\${vdom.type}>\`;
}

// ------------------------------------------------------------
// 第二部分：无 key 的列表 diff（按位置比较）
// ------------------------------------------------------------

function diffChildrenNoKey(oldKids, newKids) {
  const max = Math.max(oldKids.length, newKids.length);
  for (let i = 0; i < max; i++) {
    if (i >= oldKids.length) {
      // 新增
      addPatch("no-key", "insert", \`位置 \${i}: \${describe(newKids[i])}\`);
    } else if (i >= newKids.length) {
      // 删除
      addPatch("no-key", "remove", \`位置 \${i}: \${describe(oldKids[i])}\`);
    } else {
      // 同位置比较：可能触发 updateText（内容变了）
      const oldText = oldKids[i].props && oldKids[i].props.children;
      const newText = newKids[i].props && newKids[i].props.children;
      if (oldText !== newText) {
        addPatch(
          "no-key",
          "updateText",
          \`位置 \${i}: "\${oldText}" -> "\${newText}"\`
        );
      } else {
        addPatch("no-key", "skip", \`位置 \${i}: 内容相同\`);
      }
    }
  }
}

// ------------------------------------------------------------
// 第三部分：有 key 的列表 diff
// ------------------------------------------------------------

function diffChildrenWithKey(oldKids, newKids) {
  // 第一轮：从头同位置 + 同 key 匹配
  let i = 0;
  while (i < oldKids.length && i < newKids.length) {
    const oldKey = oldKids[i].props && oldKids[i].props.key;
    const newKey = newKids[i].props && newKids[i].props.key;
    if (oldKey === newKey) {
      // key 相同 -> 复用，更新内容
      const oldText = oldKids[i].props.children;
      const newText = newKids[i].props.children;
      if (oldText !== newText) {
        addPatch("with-key", "updateText", \`位置 \${i} key=\${oldKey}: "\${oldText}" -> "\${newText}"\`);
      } else {
        addPatch("with-key", "skip", \`位置 \${i} key=\${oldKey}: 内容相同\`);
      }
      i++;
    } else {
      // key 不同 -> 跳出第一轮
      break;
    }
  }

  // 第二轮：把剩余旧节点放进 Map（key -> 节点）
  const oldMap = new Map();
  for (let j = i; j < oldKids.length; j++) {
    const key = oldKids[j].props && oldKids[j].props.key;
    if (key != null) {
      oldMap.set(key, { vdom: oldKids[j], oldIndex: j });
    }
  }

  // 第三轮：遍历剩余新节点
  const usedKeys = new Set();
  for (let j = i; j < newKids.length; j++) {
    const newKey = newKids[j].props && newKids[j].props.key;
    if (newKey != null && oldMap.has(newKey)) {
      // 在 Map 里找到 -> 复用，标记为「移动」
      const oldEntry = oldMap.get(newKey);
      usedKeys.add(newKey);
      const oldText = oldEntry.vdom.props.children;
      const newText = newKids[j].props.children;
      let detail = \`key=\${newKey}: 位置 \${oldEntry.oldIndex} -> \${j}\`;
      if (oldText !== newText) {
        detail += \`（同时更新内容 "\${oldText}" -> "\${newText}"）\`;
      }
      addPatch("with-key", "move", detail);
    } else {
      // Map 里没有 -> 新建
      addPatch("with-key", "insert", \`位置 \${j}: \${describe(newKids[j])}\`);
    }
  }

  // 第四轮：Map 里没用到的旧节点 -> 删除
  for (const [key, entry] of oldMap) {
    if (!usedKeys.has(key)) {
      addPatch("with-key", "remove", \`位置 \${entry.oldIndex}: key=\${key}\`);
    }
  }
}

// ------------------------------------------------------------
// 第四部分：跑对比实验
// ------------------------------------------------------------

// 场景：把 [A, B, C] 重排成 [C, A, B]
// 用 key 标识身份：A->"a", B->"b", C->"c"
function makeList(letters) {
  return letters.map(letter => ({
    type: "li",
    props: { key: letter.toLowerCase(), children: letter }
  }));
}

const oldList = makeList(["A", "B", "C"]);
const newList = makeList(["C", "A", "B"]);

console.log("===== 第 10 章 demo：有 key vs 无 key 的列表 diff =====");
console.log("");
console.log("场景：把 [A, B, C] 重排成 [C, A, B]");
console.log("");

// 实验 1：无 key
clearPatches();
// 无 key 模式下，我们去掉 key 属性参与比较（仍用位置匹配）
diffChildrenNoKey(oldList, newList);
console.log("【无 key 模式】（按位置比较）");
patches.filter(p => p.mode === "no-key").forEach(p => {
  console.log("  [" + p.op + "] " + p.detail);
});
console.log("  => 结果：3 个位置都触发 updateText，无法识别「移动」");
console.log("     节点身份错乱：位置 0 的 A 被改造成 C，A 的状态丢失");
console.log("");

// 实验 2：有 key
clearPatches();
diffChildrenWithKey(oldList, newList);
console.log("【有 key 模式】（按 key 匹配）");
patches.filter(p => p.mode === "with-key").forEach(p => {
  console.log("  [" + p.op + "] " + p.detail);
});
console.log("  => 结果：3 次 move，节点身份保留，状态不丢");
console.log("");

// 场景 2：头部插入新项
console.log("===== 场景 2：[A, B, C] 头部插入 D -> [D, A, B, C] =====");
const oldList2 = makeList(["A", "B", "C"]);
const newList2 = [
  { type: "li", props: { key: "d", children: "D" } },
  ...makeList(["A", "B", "C"])
];

clearPatches();
diffChildrenNoKey(oldList2, newList2);
console.log("【无 key 模式】");
patches.filter(p => p.mode === "no-key").forEach(p => {
  console.log("  [" + p.op + "] " + p.detail);
});
console.log("  => 结果：3 次 updateText + 1 次 insert，状态全部错位");
console.log("");

clearPatches();
diffChildrenWithKey(oldList2, newList2);
console.log("【有 key 模式】");
patches.filter(p => p.mode === "with-key").forEach(p => {
  console.log("  [" + p.op + "] " + p.detail);
});
console.log("  => 结果：3 次 move + 1 次 insert，状态全部保留");
console.log("");

// 场景 3：中间删除
console.log("===== 场景 3：[A, B, C, D] 删除 B -> [A, C, D] =====");
const oldList3 = makeList(["A", "B", "C", "D"]);
const newList3 = makeList(["A", "C", "D"]);

clearPatches();
diffChildrenNoKey(oldList3, newList3);
console.log("【无 key 模式】");
patches.filter(p => p.mode === "no-key").forEach(p => {
  console.log("  [" + p.op + "] " + p.detail);
});
console.log("  => 结果：2 次 updateText + 1 次 remove，C 和 D 的状态错位");
console.log("");

clearPatches();
diffChildrenWithKey(oldList3, newList3);
console.log("【有 key 模式】");
patches.filter(p => p.mode === "with-key").forEach(p => {
  console.log("  [" + p.op + "] " + p.detail);
});
console.log("  => 结果：1 次 remove + 2 次 move，C 和 D 的状态保留");
console.log("");

// 总结
console.log("===== 总结 =====");
console.log("1. 无 key 时，React 按位置比较，无法识别「移动」");
console.log("   增删改都会导致位置错位，组件 state/input 值跟着错乱");
console.log("2. 有 key 时，React 用 key 匹配，能识别「移动」");
console.log("   节点身份稳定，状态完整保留");
console.log("3. key 要满足：稳定、兄弟间唯一、可预测");
console.log("   推荐：业务 ID；禁止：Math.random() / Date.now()");
`
  }
];
