// =============================================================
// Vue 源码构建教程（vuesrc）第三批章节
// -------------------------------------------------------------
// 本文件包含以下章节（第 11-15 章）：
//   11. vs-template-to-render — 模板编译概览：从 HTML 到 render 函数
//   12. vs-ast-parse          — Parse：解析模板生成 AST
//   13. vs-transform-ast      — Transform：转换 AST 节点
//   14. vs-vnode-h-function   — h 函数与 VNode：虚拟 DOM 的创建
//   15. vs-patch-mount        — 挂载与 patch：初次渲染
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
//   - Node.js 环境中运行
//   - 没有浏览器 DOM，所以 demo 用纯 JS 对象模拟 DOM 节点
//   - 用 console.log 输出结果
// =============================================================

export const chapters = [
  // =========================================================
  // 第十一章：模板编译概览：从 HTML 到 render 函数
  // =========================================================
  {
    id: "vs-template-to-render",
    group: "第二部分 模板编译",
    icon: "📝",
    title: "模板编译概览：从 HTML 到 render 函数",
    content: `

# 模板编译概览：从 HTML 到 render 函数

## 一、为什么需要模板编译

### 1.1 从一个生活类比说起：翻译官

想象你是一家跨国公司的老板，你只会说中文，但你的工程师团队只会写英文蓝图。你手里有一张中文写的需求清单（模板），工程师只看得懂英文蓝图（render 函数）。怎么办？

你需要一位**翻译官**，他能做两件事：
1. 看懂你的中文需求（解析模板）
2. 把中文需求改写成工程师能直接执行的英文蓝图（生成 render 函数）

Vue 的模板编译器就是这个翻译官。你写的 \`.vue\` 文件里的 \`<template>\` 部分，浏览器是看不懂的——浏览器只认识 HTML 和 JavaScript。模板编译器的工作，就是把你看懂的模板语法，翻译成浏览器能直接执行的 JavaScript 函数（render 函数）。

### 1.2 模板 vs render 函数：两种描述 UI 的方式

Vue 允许你用两种方式描述 UI：

\`\`\`html
<!-- 方式一：模板（声明式，更直观） -->
<template>
  <div class="greeting">
    <h1>{{ title }}</h1>
    <p v-if="show">Hello, {{ name }}</p>
  </div>
</template>
\`\`\`

\`\`\`js
// 方式二：render 函数（命令式，更灵活）
function render() {
  return h('div', { class: 'greeting' }, [
    h('h1', null, this.title),
    this.show ? h('p', null, \`Hello, \${this.name}\`) : null
  ]);
}
\`\`\`

两种方式最终都会变成 render 函数。区别在于：
- **模板**：写起来像 HTML，上手快，但灵活性受限
- **render 函数**：写起来像 JS，灵活度高，但学习成本高

Vue 选择「模板优先」，但底层一律走 render 函数。所以编译器就是「模板 → render 函数」的桥梁。

### 1.3 为什么不直接运行模板

有人会问：为什么不直接把模板字符串拿去渲染，非得先编译成函数？

因为**字符串解析很慢**。如果每次渲染都重新解析模板，性能会非常差。编译器的作用是把「解析」这件事提前到构建时（或首次运行时）做一次，之后每次渲染都直接调用已经编译好的 render 函数，速度极快。

这就像翻译官把你的中文需求翻译成英文蓝图后，工程师就不用每次都等你重新口述了，直接看蓝图干活。

---

## 二、模板编译的三步流水线

### 2.1 三步法概览

Vue 的模板编译严格遵循三步：

\`\`\`
模板字符串
    │
    ▼  ① parse（解析）
   AST  ────────────── 抽象语法树
    │
    ▼  ② transform（转换）
   转换后的 AST ────── 带 codegen 信息的 AST
    │
    ▼  ③ generate（生成）
   render 函数代码字符串
\`\`\`

这三步对应编译原理里的经典流程：**词法/语法分析 → 语义分析 → 代码生成**。Vue 把它简化成了三个清晰的阶段。

### 2.2 第一步：parse —— 把字符串变成树

parse 的输入是一段字符串：

\`\`\`
"<div id='app'><h1>{{ title }}</h1><p>Hello</p></div>"
\`\`\`

输出是一棵 AST（抽象语法树）：

\`\`\`js
{
  type: 'Element',
  tag: 'div',
  props: [{ name: 'id', value: 'app' }],
  children: [
    {
      type: 'Element',
      tag: 'h1',
      children: [{ type: 'Interpolation', content: 'title' }]
    },
    {
      type: 'Element',
      tag: 'p',
      children: [{ type: 'Text', content: 'Hello' }]
    }
  ]
}
\`\`\`

为什么是树？因为 HTML 本身就是嵌套结构——标签里有标签。树形结构能完美表达这种父子关系。

### 2.3 第二步：transform —— 给 AST 加料

parse 出来的 AST 只是「原文翻译」，还没准备好生成代码。transform 阶段会给每个节点添加「codegen 信息」（代码生成所需的信息）：

- 标记节点的 patchFlag（动态绑定标记，告诉运行时这个节点的哪些部分会变）
- 生成 codegenNode（描述如何生成代码的中间结构）
- 处理指令（v-if、v-for 等转换成特定的代码结构）

这就像翻译官在英文蓝图上加了「施工备注」：哪里要预留接口、哪里要用特殊工艺。

### 2.4 第三步：generate —— 拼出代码字符串

generate 把转换后的 AST 拼成一段 JavaScript 代码字符串：

\`\`\`js
"function render(_ctx) { return _createElement('div', { id: 'app' }, [
  _createElement('h1', null, _toDisplayString(_ctx.title)),
  _createElement('p', null, 'Hello')
]) }"
\`\`\`

这段字符串最终会被 \`new Function()\` 转成真正的函数。至此，模板就变成了可执行的 render 函数。

---

## 三、AST 是什么：语法树的形象理解

### 3.1 抽象语法树的生活类比

AST（Abstract Syntax Tree）听起来很高深，其实就是把一段文本按语法规则拆解成的树形结构。

类比：**句法分析**。看这句话「小明吃了苹果」，你能拆出：
- 主语：小明
- 谓语：吃了
- 宾语：苹果

这就是把这句子「parse」成了语法树。HTML 模板的 parse 也一样，只是语法规则换成「标签、属性、文本」。

### 3.2 模板 AST 的节点类型

Vue 的模板 AST 主要有三种节点：

| 类型 | 含义 | 示例 |
|------|------|------|
| Element | HTML 标签节点 | \`<div>\`、\`<p>\` |
| Text | 纯文本节点 | \`Hello\` |
| Interpolation | 插值表达式 | \`{{ name }}\` |

每种节点有自己的字段。Element 有 \`tag\` 和 \`props\`，Text 有 \`content\`，Interpolation 有 \`content\`（表达式）。

### 3.3 为什么用树而不是数组

因为 HTML 是嵌套的。\`<div>\` 里可以有 \`<p>\`，\`<p>\` 里可以有 \`<span>\`。数组表达不了嵌套，树可以。看这棵树就懂了：

\`\`\`
div
├── h1
│   └── {{ title }}   （插值）
└── p
    └── Hello         （文本）
\`\`\`

父子关系清晰，兄弟关系（h1 和 p）也清晰。

---

## 四、编译器在 Vue 中的位置

### 4.1 Vue 的三大模块

Vue 3 的核心拆成了三块：

\`\`\`
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  @vue/compiler  │ → │  @vue/runtime  │ → │  真实 DOM     │
│  (编译器)        │     │  (运行时)       │     │  (浏览器)     │
└─────────────┘     └──────────────┘     └─────────────┘
   模板 → render       render → VNode      VNode → DOM
\`\`\`

- **编译器**：把模板编译成 render 函数（本批章节的重点）
- **运行时**：执行 render 函数生成 VNode，再 diff、patch（第 14、15 章涉及）
- **DOM**：最终产物

### 4.2 编译时机：构建时 vs 运行时

Vue 的编译可以发生在两个时机：

1. **构建时编译**（推荐）：用 \`vue-loader\` 或 \`vite-plugin-vue\` 在打包时就把模板编译成 render 函数，产物里根本没有模板字符串，体积小、运行快。
2. **运行时编译**（兜底）：如果直接用 \`vue.global.js\`（包含编译器的完整版），浏览器里现编译。慢，但灵活。

生产环境一律用构建时编译，运行时编译主要用于 demo 和动态模板。

---

## 五、本章 demo 思路

下面我们要手写一个**最简版 parse**，体验「模板字符串 → AST」这一步。完整的三步流水线会在后面章节展开。

demo 目标：
1. 输入一段简单模板：\`<div id="app">Hello</div>\`
2. 输出一棵 AST，包含根节点 div、属性 id、子文本节点 Hello
3. 用 console.log 打印 AST 结构

这是编译器的「第一行代码」，理解了它，你就迈进了编译器的大门。

## 六、本章小结

- 模板编译是「翻译官」，把模板字符串翻译成 render 函数
- 三步流水线：parse（解析）→ transform（转换）→ generate（生成）
- AST 是模板的树形表示，节点类型有 Element、Text、Interpolation
- 编译可以发生在构建时（推荐）或运行时（兜底）
- 编译器只负责生成 render 函数，真正渲染由运行时完成

下一章我们会深入 parse，实现一个能处理多层嵌套的完整解析器。
`,
    code: `// ============================================================
// 第十一章 demo：最简版 parse —— 把简单模板转成 AST
// ============================================================
// 目标：输入 '<div id="app">Hello</div>'
//       输出一棵 AST（抽象语法树）
// 注意：这是最简版，只支持单层标签 + 文本，不支持嵌套和插值
//       完整版在下一章实现

// ------------------------------------------------------------
// AST 节点的工厂函数：统一创建节点，避免手写对象字面量漏字段
// ------------------------------------------------------------
// 就像翻译官有标准的「翻译模板」，每个节点都按固定格式生成
function createNode(type, fields = {}) {
  // 所有节点共有的字段
  const node = { type };
  // 根据 type 添加特有字段
  if (type === 'Element') {
    // Element 节点：标签名、属性数组、子节点数组
    node.tag = fields.tag || '';           // 标签名，如 'div'
    node.props = fields.props || [];       // 属性数组，如 [{ name: 'id', value: 'app' }]
    node.children = fields.children || []; // 子节点数组
  } else if (type === 'Text') {
    // Text 节点：纯文本内容
    node.content = fields.content || '';   // 文本内容，如 'Hello'
  } else if (type === 'Interpolation') {
    // Interpolation 节点：插值表达式 {{ xxx }}
    node.content = fields.content || '';   // 表达式内容，如 'name'
  }
  return node;
}

// ------------------------------------------------------------
// 最简版 parse：解析 '<div id="app">Hello</div>' 这种单层模板
// ------------------------------------------------------------
// 思路：用正则把模板切成「开始标签 / 文本 / 结束标签」三段
// 然后分别处理，组装成一棵 AST
function parseSimple(template) {
  console.log('输入模板:', template);
  console.log('-----------------------------------');

  // 第 1 步：用正则匹配「开始标签 + 属性 + 文本 + 结束标签」
  // 正则解释：
  //   <(\\w+)           —— 匹配 < 后面的标签名，捕获到 group 1
  //   ([^>]*)           —— 匹配标签内除 > 外的所有字符（属性部分），group 2
  //   >                 —— 匹配 >
  //   ([\\s\\S]*?)      —— 非贪婪匹配任意字符（文本内容），group 3
  //   <\\/\\1>          —— 匹配 </标签名>，\\1 引用 group 1
  const match = template.match(/^<(\\w+)([^>]*)>([\\s\\S]*?)<\\/\\1>$/);

  if (!match) {
    // 没匹配上，说明模板格式不对（可能是嵌套或自闭合，本版本不支持）
    console.log('⚠️ 模板格式不支持（需要 <tag>...</tag> 形式）');
    return null;
  }

  // 第 2 步：拆出三段
  const tag = match[1];      // 标签名，如 'div'
  const propsStr = match[2]; // 属性字符串，如 ' id="app"'
  const textContent = match[3]; // 文本内容，如 'Hello'

  console.log('解析结果：');
  console.log('  标签名:', tag);
  console.log('  属性串:', JSON.stringify(propsStr));
  console.log('  文本内容:', JSON.stringify(textContent));

  // 第 3 步：解析属性字符串，提取出属性键值对
  // 形如 ' id="app" class="box"' → [{ name: 'id', value: 'app' }, ...]
  const props = [];
  // 用正则全局匹配所有 key="value" 形式
  const propRegex = /(\\w+)\\s*=\\s*"([^"]*)"/g;
  let propMatch;
  while ((propMatch = propRegex.exec(propsStr)) !== null) {
    props.push({
      name: propMatch[1],  // 属性名，如 'id'
      value: propMatch[2]  // 属性值，如 'app'
    });
  }
  console.log('  解析出的属性:', JSON.stringify(props));

  // 第 4 步：构造子节点
  // 本版本只处理文本，如果文本是空的就不加子节点
  const children = [];
  if (textContent.trim()) {
    // 把文本内容做成 Text 节点
    children.push(createNode('Text', { content: textContent.trim() }));
  }

  // 第 5 步：组装成 AST 树
  const ast = createNode('Element', {
    tag: tag,
    props: props,
    children: children
  });

  console.log('-----------------------------------');
  console.log('生成的 AST:');
  console.log(JSON.stringify(ast, null, 2));

  return ast;
}

// ============================================================
// 实战：解析几个模板，看看 AST 长什么样
// ============================================================

console.log('========== 测试 1：带属性的简单模板 ==========');
parseSimple('<div id="app">Hello</div>');

console.log('\\n');
console.log('========== 测试 2：带多个属性 ==========');
parseSimple('<p class="text" data-x="1">Vue</p>');

console.log('\\n');
console.log('========== 测试 3：纯文本无属性 ==========');
parseSimple('<span>hi</span>');

console.log('\\n');
console.log('💡 本版本限制：');
console.log('   1. 只支持单层标签（不能 <div><p></p></div>）');
console.log('   2. 不支持插值 {{ }}');
console.log('   3. 不支持自闭合标签 <img />');
console.log('   这些会在下一章的完整 parser 中实现');
`
  },

  // =========================================================
  // 第十二章：Parse：解析模板生成 AST
  // =========================================================
  {
    id: "vs-ast-parse",
    group: "第二部分 模板编译",
    icon: "🌳",
    title: "Parse：解析模板生成 AST",
    content: `

# Parse：解析模板生成 AST

## 一、从最简版到完整版：差在哪里

### 1.1 上一章的局限

上一章我们写的 parse 只能处理 \`<div id="app">Hello</div>\` 这种单层模板。它有三个硬伤：

1. **不支持嵌套**：\`<div><p>hi</p></div>\` 会失败
2. **不支持插值**：\`{{ name }}\` 会被当成普通文本
3. **不支持自闭合**：\`<img />\` 会失败

真实的 Vue 模板里这三样是家常便饭。所以本章我们要写一个「能打」的 parser。

### 1.2 完整 parser 的难点

写一个能处理嵌套的 parser，难点在于**如何维护父子关系**。看这个模板：

\`\`\`html
<div>
  <p>
    <span>hi</span>
  </p>
  <b>ok</b>
</div>
\`\`\`

它的 AST 应该是：

\`\`\`
div
├── p
│   └── span
│       └── "hi"
└── b
    └── "ok"
\`\`\`

难点在于：遇到 \`<div>\` 时，你不知道它有几个孩子、嵌套多深，必须**边解析边维护一个「当前父节点」的指针**。这就引出了「递归下降」的思路。

---

## 二、词法分析：扫描字符串识别 token

### 2.1 什么是 token

parser 的第一步是「词法分析」：把字符串切成一个个有意义的片段，称为 token。

类比：**读书断句**。你读「小明吃苹果」时，大脑会自动切成「小明 / 吃 / 苹果」。词法分析就是把字符串切成「开始标签 / 属性 / 文本 / 结束标签」等 token。

对于 \`<div id="app">Hello</div>\`，token 序列是：

\`\`\`
1. <div id="app">   （开始标签）
2. Hello            （文本）
3. </div>           （结束标签）
\`\`\`

### 2.2 用游标扫描

实现词法分析常用「游标法」：维护一个指针 \`i\`，从 0 开始扫描字符串，根据当前字符决定要识别什么 token：

- 遇到 \`<\`：可能是开始标签或结束标签
- 遇到 \`{\`\`{\`：可能是插值
- 其他：是文本

游标每次前进一段，识别出一个 token，再继续。

### 2.3 关键正则

Vue 的 parser 用了大量正则来匹配标签、属性、插值。我们这里简化为三个核心正则：

\`\`\`js
// 开始标签：<div> 或 <div id="app"> 或 <br/>
const START_TAG = /^<([a-zA-Z][\\w-]*)([^>]*)>/;
// 结束标签：</div>
const END_TAG = /^<\\/([a-zA-Z][\\w-]*)>/;
// 插值：{{ xxx }}
const INTERP = /^\\{\\{\\s*([\\s\\S]*?)\\s*\\}\\}/;
\`\`\`

---

## 三、递归下降解析：构建树形 AST

### 3.1 什么是递归下降

「递归下降」是经典的语法解析方法：**每个语法结构用一个函数处理，函数内部递归调用自己来处理嵌套结构**。

类比：**剥洋葱**。你从外层剥起，剥到一层发现里面还有一层，就继续剥，直到没有为止。parse 一个标签时，发现它里面有子标签，就递归调用 parse 去处理子标签。

### 3.2 用栈维护父子关系

实现递归下降有两种方式：
1. **真正的递归函数**（优雅，但深嵌套可能栈溢出）
2. **显式栈**（迭代，性能更好）

Vue 实际用的是「栈」的思路：维护一个「祖先栈」，遇到开始标签就 push，遇到结束标签就 pop，新节点总是挂到栈顶节点的 children 上。

\`\`\`
解析 <div><p>hi</p></div> 的栈变化：

1. 遇到 <div>  → push div  ，栈：[div]           ，div 是根
2. 遇到 <p>    → push p    ，栈：[div, p]        ，p 挂到 div.children
3. 遇到 "hi"   → 挂到 p.children
4. 遇到 </p>   → pop p     ，栈：[div]
5. 遇到 </div> → pop div   ，栈：[]
\`\`\`

栈顶永远是「当前正在填充 children 的节点」。这个技巧让嵌套结构变得很简单。

### 3.3 兄弟关系怎么维护

兄弟关系其实不用刻意维护——因为它们会被依次 push 到同一个父节点的 children 数组里，天然就是兄弟。看：

\`\`\`
<div><p>1</p><p>2</p></div>
\`\`\`

两个 \`<p>\` 都会被挂到 div 的 children 上，children 数组里就是 \`[p1, p2]\`，这就是兄弟。

---

## 四、AST 节点类型详解

### 4.1 Element 节点

\`\`\`js
{
  type: 'Element',
  tag: 'div',                              // 标签名
  props: [{ name: 'id', value: 'app' }],   // 属性数组
  children: [...]                          // 子节点数组
}
\`\`\`

Element 是最常见的节点。它有标签名、属性、子节点三要素。

### 4.2 Text 节点

\`\`\`js
{
  type: 'Text',
  content: 'Hello'      // 文本内容
}
\`\`\`

纯文本节点，最简单。注意：连续的空白会被合并成一个 Text 节点（Vue 会做空白优化，我们这里简化处理）。

### 4.3 Interpolation 节点

\`\`\`js
{
  type: 'Interpolation',
  content: 'name'       // 表达式字符串
}
\`\`\`

插值就是 \`{{ }}\` 包裹的部分。\`{{ name }}\` 会被解析成 Interpolation 节点，content 是 \`'name'\`（去掉花括号和空白）。

### 4.4 节点类型的判断

为什么用字符串 \`'Element'\` 而不是数字常量？因为字符串更直观，调试时 console.log 出来一眼就懂。真实 Vue 用的是数字枚举（性能更好），教学版用字符串。

---

## 五、完整 parser 的实现思路

### 5.1 主循环

parser 的主循环长这样：

\`\`\`js
function parse(template) {
  let i = 0;              // 游标
  const stack = [];       // 祖先栈
  const root = { children: [] }; // 虚拟根节点
  stack.push(root);

  while (i < template.length) {
    // 看当前字符是什么，决定走哪个分支
    if (template[i] === '<') {
      // 可能是开始标签或结束标签
    } else if (template[i] === '{') {
      // 可能是插值
    } else {
      // 文本
    }
  }
  return root.children[0]; // 返回真正的根节点
}
\`\`\`

### 5.2 处理开始标签

遇到 \`<\` 且后面不是 \`/\`，就是开始标签。用正则匹配出标签名和属性，创建 Element 节点，挂到栈顶节点的 children 上，再 push 进栈（成为新的「当前父节点」）。

### 5.3 处理结束标签

遇到 \`</\`，就是结束标签。匹配出标签名，pop 栈顶（栈顶应该就是这个标签）。这里可以做校验：如果 pop 出来的节点 tag 不匹配，说明模板有错（比如 \`<div></p>\`）。

### 5.4 处理文本

既不是 \`<\` 也不是 \`{\` 开头，就是文本。扫描到下一个 \`<\` 或 \`{\` 为止，把这段文本做成 Text 节点，挂到栈顶节点的 children 上。

### 5.5 处理插值

遇到 \`{{\`，就是插值。匹配到 \`}}\` 为止，把中间的表达式做成 Interpolation 节点，挂到栈顶节点的 children 上。

---

## 六、错误处理与边界情况

### 6.1 标签不闭合

\`<div><p></div>\` 这种是错的（\`<p>\` 没闭合）。真实 Vue 会报警告，我们这里简化：pop 时校验 tag 是否匹配，不匹配就抛错。

### 6.2 自闭合标签

\`<img />\` 这种是自闭合，没有结束标签。检测到 \`/>\` 或已知 void 标签（如 img、br、input），直接创建节点但不 push 进栈。

### 6.3 空白处理

模板里的换行和缩进会产生大量空白文本节点。Vue 会做优化：删除节点间的空白，保留标签内的有意义空白。我们这里简化为 trim 后过滤空文本。

---

## 七、本章 demo 思路

下面我们实现一个**完整版 parser**，能处理：
- 多层嵌套标签
- 插值 \`{{ }}\`
- 属性（含无值属性如 \`disabled\`）
- 文本节点
- 基本的错误检测

输入一个多层嵌套模板，输出完整的 AST 树，用 console.log 打印出来。

## 八、本章小结

- 词法分析用游标扫描字符串，识别出 token（开始标签、结束标签、文本、插值）
- 递归下降用「祖先栈」维护父子关系，栈顶永远是当前父节点
- 兄弟关系天然由同一个 children 数组表达
- 三种节点类型：Element、Text、Interpolation
- 错误处理：标签不闭合、自闭合、空白优化

至此你已经能写一个像样的 HTML parser 了。下一章我们给 AST 做 transform，为代码生成做准备。
`,
    code: `// ============================================================
// 第十二章 demo：完整版 parser —— 解析多层嵌套模板生成 AST
// ============================================================
// 目标：输入 '<div id="app"><h1>{{ title }}</h1><p>Hello</p></div>'
//       输出完整的 AST 树
// 支持：多层嵌套、插值 {{ }}、属性、文本、自闭合标签

// ------------------------------------------------------------
// 工具：创建 AST 节点
// ------------------------------------------------------------
function createNode(type, fields = {}) {
  const node = { type };
  if (type === 'Element') {
    // Element 节点：标签名、属性、子节点
    node.tag = fields.tag || '';
    node.props = fields.props || [];
    node.children = fields.children || [];
  } else if (type === 'Text') {
    // Text 节点：纯文本
    node.content = fields.content || '';
  } else if (type === 'Interpolation') {
    // Interpolation 节点：插值表达式
    node.content = fields.content || '';
  }
  return node;
}

// ------------------------------------------------------------
// 核心正则：用于识别各种 token
// ------------------------------------------------------------
// 开始标签：<div> 或 <div id="app"> 或 <img /> 或 <br/>
// group 1 = 标签名，group 2 = 属性串（含可能的 /，支持无空格的自闭合）
const START_TAG_RE = /^<([a-zA-Z][\\w-]*)([^>]*)>/;
// 结束标签：</div>
const END_TAG_RE = /^<\\/([a-zA-Z][\\w-]*)>/;
// 插值：{{ xxx }}
const INTERP_RE = /^\\{\\{\\s*([\\s\\S]*?)\\s*\\}\\}/;
// 属性：id="app" 或 disabled（无值）
const ATTR_RE = /([a-zA-Z-][\\w-]*)(?:\\s*=\\s*"([^"]*)")?/g;

// ------------------------------------------------------------
// 解析属性字符串，返回属性数组
// ------------------------------------------------------------
// 输入：' id="app" class="box" disabled'
// 输出：[{ name: 'id', value: 'app' }, { name: 'class', value: 'box' }, { name: 'disabled', value: null }]
function parseProps(propsStr) {
  const props = [];
  // 用正则全局匹配所有属性
  let m;
  // 重置正则的 lastIndex（因为用了 g 标志）
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(propsStr)) !== null) {
    props.push({
      name: m[1],              // 属性名
      value: m[2] !== undefined ? m[2] : null  // 属性值，无值属性为 null
    });
  }
  return props;
}

// ------------------------------------------------------------
// 完整版 parser：把模板字符串解析成 AST
// ------------------------------------------------------------
function parse(template) {
  console.log('输入模板:', template);
  console.log('长度:', template.length, '字符');
  console.log('-----------------------------------');

  let i = 0;                       // 游标，从 0 开始扫描
  const stack = [];                // 祖先栈，栈顶是「当前父节点」
  const root = createNode('Element', { tag: 'ROOT' }); // 虚拟根节点
  stack.push(root);                // 根节点入栈，作为初始父节点

  // 是否自闭合标签（遇到 /> 或 void 标签）
  const isSelfClosing = (propsStr) => propsStr.trim().endsWith('/');

  // 主循环：游标未到末尾就继续
  while (i < template.length) {
    // 跳过空白字符（但不在文本中间跳）
    if (/\\s/.test(template[i])) {
      i++;
      continue;
    }

    // 情况 1：遇到 <，可能是开始标签或结束标签
    if (template[i] === '<') {
      // 先看是不是结束标签 </
      if (template[i + 1] === '/') {
        // 结束标签：用 END_TAG_RE 匹配
        const rest = template.slice(i);
        const m = rest.match(END_TAG_RE);
        if (!m) {
          throw new Error(\`位置 \${i}：无效的结束标签\`);
        }
        const tag = m[1];          // 结束的标签名
        const fullMatch = m[0];    // 完整匹配的字符串
        // 校验：栈顶节点的 tag 应该与结束标签一致
        const top = stack[stack.length - 1];
        if (top.tag !== tag) {
          throw new Error(\`标签不匹配：期望 </\${top.tag}>，但遇到 </\${tag}>\`);
        }
        // pop 栈顶，回到父节点
        stack.pop();
        i += fullMatch.length;     // 游标前进
        continue;
      }

      // 开始标签：用 START_TAG_RE 匹配
      const rest = template.slice(i);
      const m = rest.match(START_TAG_RE);
      if (!m) {
        throw new Error(\`位置 \${i}：无效的标签\`);
      }
      const tag = m[1];            // 标签名
      const propsStr = m[2] || ''; // 属性字符串
      const fullMatch = m[0];      // 完整匹配

      // 解析属性
      const props = parseProps(propsStr);
      // 创建 Element 节点
      const node = createNode('Element', { tag, props });
      // 挂到栈顶节点（当前父节点）的 children 上
      stack[stack.length - 1].children.push(node);

      // 判断是否自闭合（属性串以 / 结尾，或本身是 void 标签）
      if (isSelfClosing(propsStr)) {
        // 自闭合标签：不 push 进栈，没有子节点
        // 什么都不做，节点已经挂上去了
      } else {
        // 普通标签：push 进栈，成为新的「当前父节点」
        stack.push(node);
      }
      i += fullMatch.length;       // 游标前进
      continue;
    }

    // 情况 2：遇到 {{，是插值
    if (template[i] === '{' && template[i + 1] === '{') {
      const rest = template.slice(i);
      const m = rest.match(INTERP_RE);
      if (!m) {
        throw new Error(\`位置 \${i}：无效的插值语法\`);
      }
      const expr = m[1];           // 表达式内容
      const fullMatch = m[0];
      // 创建 Interpolation 节点
      const node = createNode('Interpolation', { content: expr });
      // 挂到栈顶节点的 children 上
      stack[stack.length - 1].children.push(node);
      i += fullMatch.length;
      continue;
    }

    // 情况 3：其他字符，是文本
    // 扫描到下一个 < 或 {{ 为止
    let j = i;
    while (j < template.length && template[j] !== '<' && !(template[j] === '{' && template[j + 1] === '{')) {
      j++;
    }
    const text = template.slice(i, j).trim();
    if (text) {
      // 有意义的文本才创建节点（过滤纯空白）
      const node = createNode('Text', { content: text });
      stack[stack.length - 1].children.push(node);
    }
    i = j;                         // 游标跳到 < 或 { 处
  }

  // 校验：栈里应该只剩虚拟根节点
  if (stack.length !== 1) {
    throw new Error('模板不完整，有未闭合的标签: ' + stack.slice(1).map(n => n.tag).join(', '));
  }

  // 返回虚拟根节点的第一个孩子（真正的根节点）
  const ast = root.children[0];
  console.log('✅ 解析成功！');
  console.log('-----------------------------------');
  console.log('生成的 AST:');
  console.log(JSON.stringify(ast, null, 2));
  return ast;
}

// ============================================================
// 实战：解析多层嵌套模板
// ============================================================

console.log('========== 测试 1：多层嵌套 + 插值 + 属性 ==========');
const ast1 = parse('<div id="app"><h1>{{ title }}</h1><p class="text">Hello Vue</p></div>');

console.log('\\n');
console.log('========== 测试 2：更深的嵌套 ==========');
const ast2 = parse('<ul><li><span>{{ item }}</span></li><li>普通文本</li></ul>');

console.log('\\n');
console.log('========== 测试 3：自闭合标签 ==========');
const ast3 = parse('<div><img src="a.png" /><br/><p>end</p></div>');

console.log('\\n');
console.log('💡 总结：');
console.log('   parser 用游标 + 栈 实现递归下降解析');
console.log('   栈顶永远是当前父节点，新节点挂到栈顶的 children 上');
console.log('   三种节点类型：Element、Text、Interpolation');
`
  },

  // =========================================================
  // 第十三章：Transform：转换 AST 节点
  // =========================================================
  {
    id: "vs-transform-ast",
    group: "第二部分 模板编译",
    icon: "🔧",
    title: "Transform：转换 AST 节点",
    content: `

# Transform：转换 AST 节点

## 一、transform 到底做什么

### 1.1 从一道面试题说起

面试官问：「Vue 的模板编译为什么需要 transform 阶段？parse 完直接 generate 不行吗？」

答案是：**parse 出来的 AST 只是「原文翻译」，还缺很多代码生成需要的信息**。

举个例子，模板 \`<div>{{ name }}</div>\` parse 出来的 AST 是：

\`\`\`js
{ type: 'Element', tag: 'div', children: [
  { type: 'Interpolation', content: 'name' }
]}
\`\`\`

但生成代码时，我们需要知道：
- 这个 div 有没有动态绑定？（决定要不要加 patchFlag）
- 这个插值要不要包一层 \`_toDisplayString\`？（运行时辅助函数）
- 这个节点的 codegen 应该长什么样？

这些信息 parse 阶段不提供，要靠 transform 来「加料」。

### 1.2 生活类比：工厂流水线

把编译器想象成一条流水线：

\`\`\`
原材料 → [parse] → 半成品 → [transform] → 精加工件 → [generate] → 成品
\`\`\`

- **parse**：把矿石（模板字符串）炼成铁锭（AST），但铁锭还不能直接用
- **transform**：把铁锭锻造成零件（带 codegen 信息的 AST），标注好加工参数
- **generate**：把零件组装成产品（render 函数代码）

transform 就是「锻造 + 标注」这一步。

---

## 二、nodeTransforms：插件化的转换

### 2.1 为什么用插件化

Vue 的 transform 设计成「插件化」：把不同的转换逻辑拆成一个个小函数，称为 nodeTransforms。这样：

- 每个插件只关心一件事，代码清晰
- 可以按需启用/禁用插件（比如 SSR 模式不需要某些插件）
- 第三方可以扩展自己的 transform 插件

类比：**瑞士军刀**。每把刀只做一件事，但组合起来能应付各种场景。

### 2.2 nodeTransforms 的工作方式

每个 transform 插件是一个函数，签名大致是：

\`\`\`js
function transformXxx(node, context) {
  // 进入节点时执行
  return () => {
    // 离开节点时执行（后置处理）
  };
}
\`\`\`

transform 会做一次深度优先遍历（DFS），对每个节点：
1. **进入时**：依次调用所有插件的「进入逻辑」
2. **递归处理子节点**
3. **离开时**：倒序调用所有插件的「离开逻辑」

为什么离开时要倒序？因为「后进入的插件」应该「先完成它的后置处理」，类似栈的后进先出。

### 2.3 transformContext：转换的上下文

transform 过程中维护一个 context 对象，记录：

- \`nodeTransforms\`：当前启用的转换插件数组
- \`parent\`：当前节点的父节点
- \`childIndex\`：当前节点在父节点 children 中的索引
- \`helpers\`：需要从运行时引入的辅助函数（如 \`_toDisplayString\`）

context 让插件能访问到「我在哪、我的父亲是谁、我需要哪些 helpers」等信息。

---

## 三、关键转换之一：插值节点的转换

### 3.1 原始的 Interpolation 节点

parse 出来的插值节点：

\`\`\`js
{ type: 'Interpolation', content: { type: 'SimpleExpression', content: 'name' } }
\`\`\`

### 3.2 转换后

transform 会给它加一个 codegenNode 字段，描述如何生成代码：

\`\`\`js
{
  type: 'Interpolation',
  content: {...},
  codegenNode: {
    type: 'CallExpression',
    callee: '_toDisplayString',   // 调用运行时的辅助函数
    arguments: [                  // 参数是表达式本身
      { type: 'SimpleExpression', content: 'name', isStatic: false }
    ]
  }
}
\`\`\`

codegenNode 告诉 generate：这个插值在代码里要写成 \`_toDisplayString(_ctx.name)\`。

### 3.3 为什么要包 _toDisplayString

因为 \`{{ name }}\` 里的 name 可能是任意类型——字符串、数字、对象、数组。直接渲染会出问题（比如对象会显示成 \`[object Object]\`）。\`_toDisplayString\` 会把各种类型安全地转成字符串。

---

## 四、关键转换之二：元素节点的 patchFlag

### 4.1 什么是 patchFlag

patchFlag 是一个数字标记，告诉运行时「这个节点的哪些部分是动态的」。比如：

\`\`\`html
<div class="static" :id="dynamicId">{{ text }}</div>
\`\`\`

这个 div 有两处动态：\`:id\` 绑定和 \`{{ text }}\` 插值。transform 会算出一个 patchFlag，标记「动态 props」和「动态子节点」。

### 4.2 patchFlag 的值

Vue 定义了一组 patchFlag 常量：

\`\`\`js
const PatchFlags = {
  TEXT: 1,          // 动态文本子节点
  CLASS: 2,         // 动态 class
  STYLE: 4,         // 动态 style
  PROPS: 8,         // 动态非 class/style 的 props
  FULL_PROPS: 16,   // 有动态 key，props 需要全量 diff
  HYDRATE_EVENTS: 32,
  STABLE_FRAGMENT: 64,
  KEYED_FRAGMENT: 128,
  UNKEYED_FRAGMENT: 256,
  NEED_PATCH: 512,
  DYNAMIC_SLOTS: 1024,
  HOISTED: -1,
  BAIL: -2
};
\`\`\`

这些值是 2 的幂（除了特殊值），可以用位运算组合。比如 \`TEXT | CLASS\` = 3，表示「既有动态文本又有动态 class」。

### 4.3 patchFlag 的价值

有了 patchFlag，运行时 diff 时可以**只对比动态部分**，跳过静态部分。这是 Vue 3 编译时优化的核心——**把运行时的工作提前到编译时**。

类比：**快递单上的标签**。标签写明「易碎品，朝上放置」，快递员就不用每个包裹都检查一遍，按标签处理即可。patchFlag 就是节点的「快递标签」。

---

## 五、codegenNode：代码生成的中间表示

### 5.1 为什么需要 codegenNode

generate 阶段要把 AST 拼成代码字符串。如果直接基于 parse 的 AST 拼，会很混乱——因为原始 AST 是为「描述模板结构」设计的，不是为「生成代码」设计的。

所以 transform 给每个节点生成一个 codegenNode，它是「代码生成专用」的中间表示，描述「这个节点在代码里应该长什么样」。

### 5.2 codegenNode 的结构

以 \`<div :id="x">\` 为例，转换后元素节点的 codegenNode 可能是：

\`\`\`js
{
  type: 'VNodeCall',
  tag: '"div"',                   // 标签字符串字面量
  props: {                        // props 是一个对象表达式
    type: 'ObjectExpression',
    properties: [
      { key: 'id', value: { type: 'SimpleExpression', content: '_ctx.x', isStatic: false } }
    ]
  },
  children: [...],                // 子节点的 codegen
  patchFlag: 8                    // PROPS 动态
}
\`\`\`

generate 时看到这个结构，就能拼出：

\`\`\`js
_createVNode("div", { id: _ctx.x }, ..., 8 /* PROPS */)
\`\`\`

### 5.3 中间表示的好处

中间表示（IR）是编译器的经典设计。它解耦了「前端」（parse + transform）和「后端」（generate）：前端只关心怎么生成 IR，后端只关心怎么把 IR 翻译成目标代码。两边可以独立演化。

---

## 六、transform 的遍历策略

### 6.1 深度优先遍历

transform 用 DFS 遍历 AST：先处理当前节点的「进入逻辑」，再递归处理子节点，最后处理「离开逻辑」。

\`\`\`
进入 div
  进入 h1
    离开 h1
  进入 p
    离开 p
离开 div
\`\`\`

### 6.2 为什么在「离开时」生成 codegenNode

很多 codegenNode 的信息需要等子节点都处理完才能确定。比如 patchFlag，要等子节点的动态性都分析完，才能汇总算出当前节点的 patchFlag。所以「汇总类」的工作都在离开时做。

### 6.3 helpers 的收集

transform 过程中，如果某个节点需要运行时辅助函数（比如插值需要 \`_toDisplayString\`），就把这个函数名加到 context.helpers 集合里。generate 时会根据这个集合生成 import 语句。

---

## 七、本章 demo 思路

下面我们实现一个**简化版 transform**，演示：

1. 遍历 AST（DFS）
2. 给 Interpolation 节点生成 codegenNode（包 \`_toDisplayString\`）
3. 给 Element 节点生成 codegenNode（VNodeCall 结构）
4. 收集 helpers
5. 算出简单的 patchFlag

输入是上一章 parse 出来的 AST，输出是带 codegenNode 的转换后 AST。

## 八、本章小结

- transform 的职责：给 parse 出来的 AST 加「codegen 信息」
- 插件化设计：nodeTransforms，每个插件专注一件事
- DFS 遍历：进入时做前置处理，离开时做后置处理（生成 codegenNode）
- patchFlag：标记节点的动态部分，让运行时 diff 更高效
- codegenNode：代码生成的中间表示，解耦前端和后端
- helpers：运行时辅助函数的收集，用于生成 import

下一章我们暂时离开编译器，进入虚拟 DOM 的世界——学习 h 函数和 VNode 的创建。transform 和 generate 的完整闭环会在后续章节闭合。
`,
    code: `// ============================================================
// 第十三章 demo：简化版 transform —— 给 AST 加 codegen 信息
// ============================================================
// 目标：输入 parse 出来的 AST，输出带 codegenNode 的转换后 AST
// 演示：DFS 遍历、插值转换、元素转换、helpers 收集、patchFlag 计算

// ------------------------------------------------------------
// PatchFlag 常量（简化版，只保留几个常用的）
// ------------------------------------------------------------
const PatchFlags = {
  TEXT: 1,         // 动态文本子节点
  CLASS: 2,        // 动态 class
  STYLE: 4,        // 动态 style
  PROPS: 8,        // 动态 props（非 class/style）
  FULL_PROPS: 16   // 有动态 key，全量 diff
};

// ------------------------------------------------------------
// 创建 transform 上下文（context）
// ------------------------------------------------------------
// context 在遍历过程中传递，记录当前状态和收集的信息
function createTransformContext() {
  return {
    nodeTransforms: [
      transformElement,        // 处理 Element 节点
      transformInterpolation   // 处理 Interpolation 节点
    ],
    helpers: new Set(),        // 收集需要的运行时辅助函数
    parent: null,              // 当前父节点
    childIndex: 0              // 当前节点在父节点中的索引
  };
}

// ------------------------------------------------------------
// 辅助：记录 helper（运行时辅助函数）
// ------------------------------------------------------------
function useHelper(context, name) {
  context.helpers.add(name);
}

// ------------------------------------------------------------
// 插件 1：转换 Interpolation 节点
// ------------------------------------------------------------
// 把 {{ name }} 转换成 _toDisplayString(_ctx.name) 的 codegenNode
function transformInterpolation(node, context) {
  if (node.type !== 'Interpolation') return;

  // 进入时：标记需要 _toDisplayString 辅助函数
  useHelper(context, '_toDisplayString');

  // 离开时：生成 codegenNode
  return () => {
    node.codegenNode = {
      type: 'CallExpression',          // 这是一个函数调用
      callee: '_toDisplayString',      // 调用 _toDisplayString
      arguments: [                     // 参数：表达式本身
        {
          type: 'SimpleExpression',
          content: '_ctx.' + node.content,  // 加上 _ctx. 前缀
          isStatic: false              // 不是静态字符串
        }
      ]
    };
    console.log(\`  [transform] 插值 '\${node.content}' → _toDisplayString(_ctx.\${node.content})\`);
  };
}

// ------------------------------------------------------------
// 插件 2：转换 Element 节点
// ------------------------------------------------------------
// 给 Element 节点生成 VNodeCall 形式的 codegenNode
function transformElement(node, context) {
  if (node.type !== 'Element') return;

  // 进入时：标记需要 _createVNode 辅助函数
  useHelper(context, '_createVNode');

  // 离开时：生成 codegenNode（此时子节点都已转换完毕）
  return () => {
    // 计算这个节点的 patchFlag
    // 简化版：如果子节点里有 Interpolation，就标记 TEXT
    // 如果 props 里有 :开头的动态绑定，就标记 PROPS
    let patchFlag = 0;
    let hasDynamicText = false;
    let hasDynamicProps = false;

    // 检查子节点是否有动态内容
    for (const child of node.children) {
      if (child.type === 'Interpolation') {
        hasDynamicText = true;
      }
    }

    // 检查 props 是否有动态绑定（简化：以 : 开头的属性名视为动态）
    const dynamicProps = [];
    for (const prop of node.props) {
      if (prop.name.startsWith(':')) {
        hasDynamicProps = true;
        dynamicProps.push(prop.name.slice(1));  // 去掉 : 前缀
      }
    }

    // 用位运算组合 patchFlag
    if (hasDynamicText) patchFlag |= PatchFlags.TEXT;
    if (hasDynamicProps) patchFlag |= PatchFlags.PROPS;

    // 构造 props 的 codegen（简化版）
    let propsCodegen = null;
    if (node.props.length > 0) {
      propsCodegen = {
        type: 'ObjectExpression',
        properties: node.props.map(p => ({
          key: p.name.startsWith(':') ? p.name.slice(1) : p.name,
          value: p.name.startsWith(':')
            ? { type: 'SimpleExpression', content: '_ctx.' + p.value, isStatic: false }
            : { type: 'SimpleExpression', content: '"' + p.value + '"', isStatic: true }
        }))
      };
    }

    // 构造 children 的 codegen（简化：直接引用子节点的 codegenNode）
    const childrenCodegen = node.children.map(c => c.codegenNode || c.content).filter(Boolean);

    // 组装 VNodeCall
    node.codegenNode = {
      type: 'VNodeCall',
      tag: '"' + node.tag + '"',       // 标签字面量
      props: propsCodegen,             // props 表达式
      children: childrenCodegen,       // 子节点的 codegen
      patchFlag: patchFlag,            // patchFlag
      dynamicProps: dynamicProps.length > 0 ? dynamicProps : null
    };

    console.log(\`  [transform] 元素 <\${node.tag}> patchFlag = \${patchFlag}（\${patchFlag === 0 ? '静态' : '动态'}）\`);
  };
}

// ------------------------------------------------------------
// 核心：遍历 AST，对每个节点应用 transforms
// ------------------------------------------------------------
function traverse(node, context) {
  // 记录进入时的父节点，遍历完恢复
  const parent = context.parent;
  context.parent = node;

  // 进入阶段：依次调用所有插件，收集它们的「离开函数」
  const exitFns = [];
  for (const transform of context.nodeTransforms) {
    const exitFn = transform(node, context);
    if (exitFn) exitFns.push(exitFn);
  }

  // 递归处理子节点
  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      context.childIndex = i;
      traverse(node.children[i], context);
    }
  }

  // 离开阶段：倒序调用所有插件的「离开函数」
  // 倒序是为了让后注册的插件先完成它的后置处理（类似栈的 LIFO）
  for (let i = exitFns.length - 1; i >= 0; i--) {
    exitFns[i]();
  }

  // 恢复父节点
  context.parent = parent;
}

// ------------------------------------------------------------
// transform 入口
// ------------------------------------------------------------
function transform(ast) {
  console.log('输入的原始 AST:');
  console.log(JSON.stringify(ast, null, 2));
  console.log('-----------------------------------');
  console.log('开始 transform...');

  const context = createTransformContext();
  traverse(ast, context);

  console.log('-----------------------------------');
  console.log('✅ transform 完成！');
  console.log('收集到的 helpers:', Array.from(context.helpers));
  console.log('-----------------------------------');
  console.log('转换后的 AST（含 codegenNode）:');
  console.log(JSON.stringify(ast, null, 2));

  return { ast, helpers: context.helpers };
}

// ============================================================
// 实战：用一个手工构造的 AST 来演示 transform
// ============================================================
// 这个 AST 相当于 parse('<div id="app" :class="cls"><h1>{{ title }}</h1><p>Hello</p></div>')

const ast = {
  type: 'Element',
  tag: 'div',
  props: [
    { name: 'id', value: 'app' },
    { name: ':class', value: 'cls' }
  ],
  children: [
    {
      type: 'Element',
      tag: 'h1',
      props: [],
      children: [
        { type: 'Interpolation', content: 'title' }
      ]
    },
    {
      type: 'Element',
      tag: 'p',
      props: [],
      children: [
        { type: 'Text', content: 'Hello' }
      ]
    }
  ]
};

transform(ast);

console.log('\\n');
console.log('💡 总结：');
console.log('   transform 给每个节点加了 codegenNode，描述如何生成代码');
console.log('   patchFlag 标记动态部分，让运行时 diff 更高效');
console.log('   helpers 收集运行时辅助函数，供 generate 生成 import');
`
  },

  // =========================================================
  // 第十四章：h 函数与 VNode：虚拟 DOM 的创建
  // =========================================================
  {
    id: "vs-vnode-h-function",
    group: "第三部分 虚拟 DOM",
    icon: "🔨",
    title: "h 函数与 VNode：虚拟 DOM 的创建",
    content: `

# h 函数与 VNode：虚拟 DOM 的创建

## 一、什么是虚拟 DOM

### 1.1 从真实 DOM 说起

浏览器里的每个 HTML 元素都是一个 DOM 对象，它有几百个属性和方法：

\`\`\`js
const div = document.createElement('div');
console.log(Object.keys(div).length); // 上百个属性
\`\`\`

真实 DOM 很「重」——创建一个 div 要分配大量内存，修改属性要触发重排重绘。如果每次状态变化都直接操作真实 DOM，性能会很差。

### 1.2 虚拟 DOM 的思路

虚拟 DOM（Virtual DOM，简称 VDOM）的思路是：**用一个轻量的 JS 对象来描述真实 DOM，先在 JS 层面算出变化，再一次性应用到真实 DOM**。

\`\`\`js
// 一个 VNode（虚拟节点）长这样
{
  type: 'div',
  props: { class: 'box' },
  children: [{ type: 'p', children: ['hi'] }]
}
\`\`\`

它只有几个字段，比真实 DOM 轻量得多。我们可以创建成千上万个 VNode 而不卡顿。

### 1.3 生活类比：建筑图纸

把真实 DOM 想象成「建好的房子」，虚拟 DOM 就是「建筑图纸」：

- 改房子要拆墙砌砖，成本高（操作真实 DOM 慢）
- 改图纸只是擦几条线画几条线，成本低（操作 VNode 快）
- 算好新图纸和旧图纸的差别，再最小化地改房子（diff + patch）

虚拟 DOM 的本质就是「先用图纸算，再按图纸改」。

---

## 二、VNode 的数据结构

### 2.1 Vue 3 的 VNode 字段

Vue 3 的 VNode 比简化版丰富很多，核心字段有：

\`\`\`js
{
  type,          // 节点类型：字符串（如 'div'）、组件对象、符号（如 Fragment）
  props,         // 属性对象：class、style、事件、动态 props 等
  children,      // 子节点：数组、字符串、null
  key,           // 节点的 key，用于 diff 时的复用判断
  ref,           // 模板引用
  shapeFlag,     // 形状标记：用位运算标记节点类型（元素/组件/文本/数组...）
  patchFlag,     // 补丁标记：标记动态部分（来自编译时 transform）
  dynamicProps,  // 动态属性名列表
  el             // 对应的真实 DOM（挂载后填充）
}
\`\`\`

### 2.2 shapeFlag：形状标记

shapeFlag 用位运算标记节点的「形状」——是元素、组件、文本、还是数组等。

\`\`\`js
const ShapeFlags = {
  ELEMENT: 1,                  // 普通元素
  FUNCTIONAL_COMPONENT: 1 << 1,// 函数式组件
  STATEFUL_COMPONENT: 1 << 2,  // 有状态组件
  TEXT_CHILDREN: 1 << 3,       // 子节点是文本
  ARRAY_CHILDREN: 1 << 4,      // 子节点是数组
  SLOTS_CHILDREN: 1 << 5       // 子节点是插槽
};
\`\`\`

为什么用位运算？因为一个节点可能同时满足多个形状——比如「元素」+「子节点是数组」，用 \`ELEMENT | ARRAY_CHILDREN\` 一次表达。判断时用 \`shapeFlag & ELEMENT\`，O(1) 复杂度。

类比：**快递单上的勾选框**。一个包裹可以同时勾「易碎」「加急」「保价」，用位标记比用多个布尔字段紧凑。

### 2.3 type 字段的含义

type 字段决定节点是什么：

| type 的值 | 含义 | 示例 |
|-----------|------|------|
| 字符串 | 原生 HTML 元素 | \`'div'\`、\`'p'\` |
| 对象 | 有状态组件 | \`{ setup() {...} }\` |
| 函数 | 函数式组件 | \`() => h('div')\` |
| 符号 | 特殊节点 | \`Fragment\`、\`Teleport\`、\`Suspense\` |

### 2.4 为什么需要 key

key 是 VNode 的「身份证」，用于 diff 时判断「这个节点能不能复用」。看这个例子：

\`\`\`html
<!-- 列表 A -->
<li key="a">A</li>
<li key="b">B</li>

<!-- 列表 B（插入了一个 C 在最前）-->
<li key="c">C</li>
<li key="a">A</li>
<li key="b">B</li>
\`\`\`

有 key 时，diff 算法知道 a 还是 a、b 还是 b，只是位置变了，会移动它们而不是重建。没 key 时，只能按顺序逐个对比，a 会被改成 C、b 被改成 A，最后新建一个 B——浪费且可能出错。

---

## 三、h 函数：创建 VNode 的工厂

### 3.1 h 函数的签名

Vue 的 \`h\` 函数（hyperscript 的缩写，意为「生成 HTML 的脚本」）是创建 VNode 的工厂函数。签名：

\`\`\`js
function h(type, props?, children?)
\`\`\`

三个参数：
- \`type\`：必填，节点类型
- \`props\`：可选，属性对象（含 class、style、事件等）
- \`children\`：可选，子节点

### 3.2 参数的多种形式

h 函数支持多种调用形式，非常灵活：

\`\`\`js
// 形式 1：只有 type
h('div')

// 形式 2：type + children（跳过 props）
h('div', 'Hello')

// 形式 3：type + props + children
h('div', { class: 'box' }, 'Hello')

// 形式 4：children 是数组
h('div', null, [h('p', 'a'), h('p', 'b')])

// 形式 5：props 里含事件
h('button', { onClick: handler }, 'Click')
\`\`\`

### 3.3 为什么 h 这么灵活

因为 Vue 想让用户写起来舒服。如果严格固定三参数，简单场景要写一堆 \`null\`：

\`\`\`js
// 严格三参数版本（啰嗦）
h('div', null, 'Hello')
h('br', null, null)
\`\`\`

h 函数内部做参数归一化：检测第二个参数是 props 还是 children，自动调整。这是 API 设计上的「用户友好」。

---

## 四、h 函数的实现要点

### 4.1 参数归一化

h 函数的第一步是判断「第二个参数是 props 还是 children」：

\`\`\`js
function h(type, propsOrChildren, children) {
  // 如果第二个参数是字符串/数字/数组，说明它其实是 children
  if (typeof propsOrChildren === 'string' || Array.isArray(propsOrChildren)) {
    children = propsOrChildren;
    props = {};
  } else {
    props = propsOrChildren || {};
  }
  // ...
}
\`\`\`

### 4.2 children 的处理

children 有几种情况：

1. **字符串/数字**：文本子节点
2. **数组**：多个子节点
3. **单个 VNode 对象**：一个子节点
4. **null/undefined**：无子节点

每种情况处理方式不同。文本要包装，数组要遍历，单个对象直接用。

### 4.3 shapeFlag 的计算

根据 type 和 children 的类型，算出 shapeFlag：

\`\`\`js
let shapeFlag = 0;
if (typeof type === 'string') {
  shapeFlag |= ShapeFlags.ELEMENT;
} else if (typeof type === 'object') {
  shapeFlag |= ShapeFlags.STATEFUL_COMPONENT;
}
// 根据 children 调整
if (typeof children === 'string') {
  shapeFlag |= ShapeFlags.TEXT_CHILDREN;
} else if (Array.isArray(children)) {
  shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
}
\`\`\`

---

## 五、VNode 树的构建

### 5.1 嵌套调用 h

VNode 树通过嵌套调用 h 构建：

\`\`\`js
const vnode = h('div', { class: 'app' }, [
  h('h1', null, 'Title'),
  h('p', null, 'Content'),
  h('ul', null, [
    h('li', null, 'Item 1'),
    h('li', null, 'Item 2')
  ])
]);
\`\`\`

这棵 VNode 树和模板 \`<div class="app"><h1>Title</h1>...</div>\` 是等价的。事实上，模板编译后的 render 函数就是一连串 h 调用。

### 5.2 VNode 树的结构

上面的代码生成的 VNode 树：

\`\`\`
div (class=app)
├── h1
│   └── "Title"
├── p
│   └── "Content"
└── ul
    ├── li
    │   └── "Item 1"
    └── li
        └── "Item 2"
\`\`\`

### 5.3 为什么用树而不是扁平结构

因为 UI 本身就是嵌套的。树形结构和真实 DOM 一一对应，方便递归处理（挂载、更新、卸载都是递归的）。

---

## 六、VNode 的设计哲学

### 6.1 描述而非执行

VNode 是「描述性」的——它只描述「UI 应该长什么样」，不描述「怎么变成 DOM」。变成 DOM 是渲染器的工作。这种分离让 VNode 可以跨平台：浏览器渲染成 DOM，移动端渲染成原生组件，SSR 渲染成 HTML 字符串。

### 6.2 不可变性

VNode 在概念上是不可变的（虽然 Vue 实现里有些字段会被修改）。每次状态变化，都生成一棵新的 VNode 树，然后和旧树 diff。这让状态追踪和调试变得简单。

### 6.3 编译时优化

Vue 3 的 VNode 设计和编译器深度配合：编译器在 transform 阶段算出 patchFlag 和 dynamicProps，标记在 VNode 上。运行时 diff 时就只关注这些动态部分，跳过静态部分。这是「编译时优化运行时」的经典思路。

---

## 七、本章 demo 思路

下面我们实现一个**完整的 h 函数**，支持：
- 多种参数形式（type / type+children / type+props+children）
- 各种 children 情况（文本、数组、单个 VNode）
- shapeFlag 的计算
- 嵌套构建多层级 VNode 树

然后用它构建一棵多层级 VNode 树，打印出来观察结构。

## 八、本章小结

- 虚拟 DOM 是用轻量 JS 对象描述真实 DOM 的方案
- VNode 核心字段：type、props、children、key、shapeFlag、patchFlag
- shapeFlag 用位运算标记节点形状，紧凑高效
- h 函数是创建 VNode 的工厂，支持多种参数形式
- 参数归一化让 API 用户友好
- VNode 是描述性的、跨平台的，配合编译时优化实现高性能 diff

下一章我们让 VNode 变成真实 DOM——实现 mount 和 patch 的初次渲染逻辑。
`,
    code: `// ============================================================
// 第十四章 demo：实现 h 函数并构建多层级 VNode 树
// ============================================================
// 目标：实现一个完整的 h 函数，支持多种参数形式和 children 情况
//       用它构建一棵多层级 VNode 树并打印结构

// ------------------------------------------------------------
// ShapeFlags 常量：用位运算标记节点的「形状」
// ------------------------------------------------------------
// 类比：快递单上的勾选框，一个节点可以同时勾多个形状
const ShapeFlags = {
  ELEMENT: 1,                   // 普通元素，如 'div'、'p'
  FUNCTIONAL_COMPONENT: 1 << 1, // 函数式组件
  STATEFUL_COMPONENT: 1 << 2,   // 有状态组件（对象）
  TEXT_CHILDREN: 1 << 3,        // 子节点是文本
  ARRAY_CHILDREN: 1 << 4,       // 子节点是数组
  SLOTS_CHILDREN: 1 << 5        // 子节点是插槽
};

// ------------------------------------------------------------
// 创建 VNode 的核心函数
// ------------------------------------------------------------
// 这是 h 函数的内部实现，参数已经归一化好
function createVNode(type, props, children) {
  // 默认值处理：props 没传就用空对象
  props = props || {};

  // 从 props 里提取 key（key 不算普通 prop）
  const key = props.key != null ? String(props.key) : null;
  // 从 props 里提取 ref
  const ref = props.ref != null ? props.ref : null;

  // 第 1 步：根据 type 算出初始 shapeFlag
  let shapeFlag = 0;
  if (typeof type === 'string') {
    // 字符串 → 普通元素
    shapeFlag |= ShapeFlags.ELEMENT;
  } else if (typeof type === 'object') {
    // 对象 → 有状态组件
    shapeFlag |= ShapeFlags.STATEFUL_COMPONENT;
  } else if (typeof type === 'function') {
    // 函数 → 函数式组件
    shapeFlag |= ShapeFlags.FUNCTIONAL_COMPONENT;
  }

  // 第 2 步：构造基础 VNode 对象
  const vnode = {
    type,              // 节点类型
    props,             // 属性对象
    key,               // 节点 key
    ref,               // 模板引用
    children,          // 子节点（待归一化）
    shapeFlag,         // 形状标记（待补充）
    patchFlag: 0,      // 补丁标记（编译时填充，这里默认 0）
    el: null           // 对应的真实 DOM（挂载后填充）
  };

  // 第 3 步：归一化 children，并更新 shapeFlag
  normalizeChildren(vnode, children);

  return vnode;
}

// ------------------------------------------------------------
// 归一化 children：处理各种 children 情况
// ------------------------------------------------------------
function normalizeChildren(vnode, children) {
  let type = 0;
  if (children == null) {
    // 无子节点
    type = 0;
  } else if (Array.isArray(children)) {
    // 数组子节点
    type = ShapeFlags.ARRAY_CHILDREN;
    // 递归归一化数组里的每个元素：字符串/数字要包装成文本 VNode
    vnode.children = children.map(c => {
      if (typeof c === 'string' || typeof c === 'number') {
        // 文本子节点：包装成特殊的文本 VNode
        return createTextVNode(String(c));
      }
      return c; // 已经是 VNode，直接用
    });
  } else if (typeof children === 'string' || typeof children === 'number') {
    // 文本子节点
    type = ShapeFlags.TEXT_CHILDREN;
    vnode.children = String(children);
  } else if (typeof children === 'object') {
    // 单个 VNode 对象作为子节点
    // 这种情况当作只有一个孩子的数组处理
    type = ShapeFlags.ARRAY_CHILDREN;
    vnode.children = [children];
  }
  // 把 children 的形状信息合并进 shapeFlag
  vnode.shapeFlag |= type;
}

// ------------------------------------------------------------
// 创建文本 VNode
// ------------------------------------------------------------
// 文本节点没有 props、没有 children，只有一个 content
function createTextVNode(text) {
  return {
    type: Symbol('Text'),    // 用符号标记文本节点
    props: {},
    key: null,
    ref: null,
    children: text,          // 文本内容放在 children 里
    shapeFlag: 0,            // 文本节点没有形状标记
    patchFlag: 0,
    el: null
  };
}

// ------------------------------------------------------------
// h 函数：对外的工厂函数，支持多种参数形式
// ------------------------------------------------------------
// 签名：h(type, props?, children?)
// 灵活性体现在：第二个参数可以是 props，也可以是 children
function h(type, propsOrChildren, children) {
  const l = arguments.length;

  if (l === 1) {
    // 只有 type：h('div')
    return createVNode(type, {}, null);
  } else if (l === 2) {
    // 两个参数：判断第二个是 props 还是 children
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      // 是对象但不是数组 → 当作 props
      // 但要排除已经是 VNode 的情况（单个 VNode 作为子节点）
      if (isVNode(propsOrChildren)) {
        return createVNode(type, {}, [propsOrChildren]);
      }
      return createVNode(type, propsOrChildren, null);
    } else {
      // 是字符串、数字、数组 → 当作 children
      return createVNode(type, {}, propsOrChildren);
    }
  } else {
    // 三个参数：标准的 type + props + children
    // 但 children 可能是单个 VNode，要包装成数组
    if (isVNode(children)) {
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
  }
}

// ------------------------------------------------------------
// 辅助：判断是否为对象
// ------------------------------------------------------------
function isObject(val) {
  return val !== null && typeof val === 'object';
}

// ------------------------------------------------------------
// 辅助：判断是否为 VNode
// ------------------------------------------------------------
// 简化判断：有 type 字段且不是字符串的算 VNode
function isVNode(val) {
  return isObject(val) && 'type' in val && 'shapeFlag' in val;
}

// ============================================================
// 实战 1：用 h 构建一棵多层级 VNode 树
// ============================================================
console.log('========== 构建 VNode 树 ==========');
console.log('对应模板: <div class="app" id="root"><h1>标题</h1><p>内容</p><ul><li>项目1</li><li>项目2</li></ul></div>');
console.log('');

const vnode = h(
  'div',
  { class: 'app', id: 'root', key: 'rootKey' },
  [
    h('h1', null, '标题'),
    h('p', { style: 'color:red' }, '内容'),
    h('ul', null, [
      h('li', { key: 1 }, '项目1'),
      h('li', { key: 2 }, '项目2')
    ])
  ]
);

console.log('生成的 VNode 树:');
console.log(JSON.stringify(vnode, (k, v) => (typeof v === 'symbol' ? v.description : v), 2));

// ============================================================
// 实战 2：打印 VNode 树的可视化结构
// ============================================================
console.log('\\n========== VNode 树可视化 ==========');

function printVNodeTree(vnode, prefix = '', isLast = true) {
  if (!vnode) return;
  // 当前节点的连接符
  const connector = isLast ? '└── ' : '├── ';
  // 节点描述
  let desc;
  if (typeof vnode.type === 'string') {
    desc = '<' + vnode.type + '>';
    if (vnode.props.class) desc += ' .' + vnode.props.class;
    if (vnode.props.id) desc += ' #' + vnode.props.id;
    if (vnode.key) desc += ' [key=' + vnode.key + ']';
  } else if (typeof vnode.type === 'symbol') {
    desc = '"' + vnode.children + '"';
  } else {
    desc = '[Component]';
  }
  // 补丁和形状信息
  const flags = [];
  if (vnode.shapeFlag & ShapeFlags.ELEMENT) flags.push('ELEMENT');
  if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) flags.push('TEXT_CHILDREN');
  if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) flags.push('ARRAY_CHILDREN');

  console.log(prefix + connector + desc + (flags.length ? ' (' + flags.join('|') + ')' : ''));

  // 递归打印子节点
  const childPrefix = prefix + (isLast ? '    ' : '│   ');
  if (Array.isArray(vnode.children)) {
    vnode.children.forEach((child, i) => {
      printVNodeTree(child, childPrefix, i === vnode.children.length - 1);
    });
  } else if (typeof vnode.children === 'string' && typeof vnode.type === 'string') {
    console.log(childPrefix + (vnode.children ? '└── "' + vnode.children + '"' : '└── (空)'));
  }
}

printVNodeTree(vnode);

// ============================================================
// 实战 3：测试各种参数形式
// ============================================================
console.log('\\n========== 测试参数形式 ==========');

console.log('形式1 h("div"):');
console.log(JSON.stringify(h('div'), null, 0));

console.log('\\n形式2 h("div", "Hello"):');
console.log(JSON.stringify(h('div', 'Hello'), null, 0));

console.log('\\n形式3 h("div", {class:"x"}, "Hello"):');
console.log(JSON.stringify(h('div', { class: 'x' }, 'Hello'), null, 0));

console.log('\\n形式4 h("div", [h("p","a"), h("p","b")]):');
console.log(JSON.stringify(h('div', [h('p', 'a'), h('p', 'b')]), (k, v) => (typeof v === 'symbol' ? v.description : v), 0));

console.log('\\n💡 总结：');
console.log('   h 函数支持多种参数形式，内部做参数归一化');
console.log('   shapeFlag 用位运算标记节点形状，紧凑高效');
console.log('   文本子节点会被包装成文本 VNode');
console.log('   VNode 树通过嵌套调用 h 构建，与模板一一对应');
`
  },

  // =========================================================
  // 第十五章：挂载与 patch：初次渲染
  // =========================================================
  {
    id: "vs-patch-mount",
    group: "第三部分 虚拟 DOM",
    icon: "🎨",
    title: "挂载与 patch：初次渲染",
    content: `

# 挂载与 patch：初次渲染

## 一、从 VNode 到真实 DOM

### 1.1 我们到了哪一步

到目前为止，我们有了：
- VNode：用 JS 对象描述的 UI（上一章）
- h 函数：创建 VNode 的工厂（上一章）

但 VNode 还只是「图纸」，没有变成「房子」。这一章我们实现**渲染器**（renderer），把 VNode 变成真实 DOM。

### 1.2 渲染器的两个核心函数

渲染器有两个核心函数：

- **mount**：把 VNode 挂载成真实 DOM（初次渲染，没有旧 VNode）
- **patch**：根据新旧 VNode 决定是「挂载新的」还是「更新现有的」或「卸载」

\`\`\`
patch(n1, n2, container)
  │
  │  n1 = 旧 VNode，n2 = 新 VNode，container = 容器
  │
  ├── n1 == null && n2 != null → mount(n2, container)    挂载
  ├── n1 != null && n2 == null → unmount(n1)             卸载
  └── n1 != null && n2 != null → 更新（diff 后 patch）    更新
\`\`\`

本章聚焦在**初次渲染**——也就是 mount 这条路径。

### 1.3 生活类比：建筑图纸变现

继续用建筑图纸的类比：
- **mount**：拿一张图纸，从零开始建房子（VNode → DOM）
- **patch（更新）**：拿新旧两张图纸对比，按差异改房子（diff + 改动）
- **unmount**：拆除房子（移除 DOM）

本章我们只学「从零建房子」。

---

## 二、mount 函数的实现

### 2.1 mount 的整体流程

mount 一个 VNode 的流程：

\`\`\`
1. 根据 type 创建真实 DOM 元素
2. 设置属性（props）
3. 处理 children（递归 mount 子节点）
4. 把 DOM 元素插入容器
\`\`\`

### 2.2 第一步：创建 DOM 元素

根据 VNode 的 type 创建对应的 DOM 元素：

\`\`\`js
function mount(vnode, container) {
  let el;
  const { type, shapeFlag } = vnode;

  if (shapeFlag & ShapeFlags.ELEMENT) {
    // 普通元素：用 createElement 创建
    el = document.createElement(type);
  } else if (typeof type === 'symbol') {
    // 文本节点：用 createTextNode
    el = document.createTextNode(vnode.children);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    // 组件：挂载组件（本章先简化）
    mountComponent(vnode, container);
    return;
  }

  vnode.el = el;  // 把真实 DOM 存到 VNode 上，后续更新会用
  // ... 设置 props 和 children
}
\`\`\`

注意：真实 DOM 创建后要存到 \`vnode.el\` 上。这是 patch 阶段的关键——更新时要从旧 VNode 拿到旧 DOM。

### 2.3 第二步：设置属性

属性设置有几种情况要分别处理：

\`\`\`js
function patchProps(el, key, value) {
  if (key === 'class') {
    el.className = value;          // class 单独处理（可以是数组/对象）
  } else if (key === 'style') {
    if (typeof value === 'object') {
      for (const k in value) {
        el.style[k] = value[k];    // style 对象逐个设置
      }
    } else {
      el.style.cssText = value;    // style 字符串直接赋
    }
  } else if (key.startsWith('on')) {
    // 事件：onXxx → addEventListener
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, value);
  } else {
    // 普通属性：用 setAttribute
    el.setAttribute(key, value);
  }
}
\`\`\`

为什么 class 和 style 要单独处理？因为 Vue 里 class 可以是数组 \`[ 'a', 'b' ]\` 或对象 \`{ a: true, b: false }\`，style 也类似。直接 setAttribute 不行，要标准化成字符串。

### 2.4 第三步：处理 children

children 有两种主要形态：

\`\`\`js
function mountChildren(vnode, container) {
  const { shapeFlag, children } = vnode;

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // 文本子节点：直接设 textContent
    container.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // 数组子节点：遍历递归 mount
    for (const child of children) {
      mount(child, container);
    }
  }
}
\`\`\`

文本子节点很简单，直接 textContent。数组子节点要递归——每个子节点都走一遍 mount 流程。

### 2.5 第四步：插入容器

最后把创建好的 DOM 元素插入到容器里：

\`\`\`js
container.appendChild(el);
\`\`\`

至此一个 VNode 就变成了真实 DOM 挂在页面上了。

---

## 三、patch 函数：决定走哪条路

### 3.1 patch 的三分支

patch 是渲染器的总入口，根据新旧 VNode 的情况决定走哪条路：

\`\`\`js
function patch(n1, n2, container) {
  if (n1 == null) {
    // 没有旧 VNode → 挂载
    mount(n2, container);
  } else if (n2 == null) {
    // 没有新 VNode → 卸载
    unmount(n1);
  } else {
    // 都有 → 更新（需要 diff，下一批章节讲）
    if (!isSameType(n1, n2)) {
      // 类型不同，直接卸载旧的挂载新的
      unmount(n1);
      mount(n2, container);
    } else {
      // 类型相同，更新现有节点
      patchElement(n1, n2);
    }
  }
}
\`\`\`

### 3.2 patch 的设计哲学

patch 的设计哲学是「分层决策」：
- 最外层决定「挂载/卸载/更新」大方向
- 内层再决定「这个节点的具体变化」

这种分层让代码清晰，每层只关心自己的事。本章我们只实现「挂载」分支，其他分支留到下一批。

### 3.3 isSameType 的判断

怎么判断两个 VNode 是「同一类型」？看 type 和 key：

\`\`\`js
function isSameType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
\`\`\`

type 相同（都是 div 或都是同一个组件）+ key 相同，才算同一节点，可以走更新路径。否则直接卸载重建。

---

## 四、处理不同元素类型

### 4.1 普通元素

最常见的 \`<div>\`、\`<p>\` 等，用 \`document.createElement\` 创建。属性、事件、子节点都按上面的流程处理。

### 4.2 文本节点

文本节点没有标签，用 \`document.createTextNode\` 创建。文本节点没有 props、没有子节点，是最简单的节点。

### 4.3 组件（简化版）

组件的 mount 比较复杂，涉及：
1. 执行 setup 函数（拿到响应式状态）
2. 执行 render 函数（生成子 VNode）
3. 递归 mount 子 VNode

本章我们简化处理：组件只调用它的 render 方法拿到子 VNode，然后递归 mount。完整的组件挂载会在后续章节展开。

\`\`\`js
function mountComponent(vnode, container) {
  const instance = {
    vnode,
    type: vnode.type,
    setupState: null
  };
  vnode.component = instance;

  // 简化：直接调用 render 拿到子 VNode
  const render = vnode.type.render;
  const subTree = render.call(instance);
  // 递归 mount 子树
  mount(subTree, container);
  vnode.el = subTree.el;
}
\`\`\`

---

## 五、属性和事件的处理细节

### 5.1 事件的特殊处理

事件不能直接 setAttribute，要用 addEventListener：

\`\`\`js
if (key.startsWith('on')) {
  const event = key.slice(2).toLowerCase();  // onClick → click
  el.addEventListener(event, value);
}
\`\`\`

更新阶段还要先 removeEventListener 旧的，再 add 新的。本章只做初次挂载，不涉及移除。

### 5.2 class 的标准化

Vue 允许 class 是字符串、数组、对象：

\`\`\`js
// 字符串
<div class="a b">

// 数组
<div :class="['a', 'b']">

// 对象
<div :class="{ a: true, b: false }">
\`\`\`

mount 时要把这些形式标准化成字符串：

\`\`\`js
function normalizeClass(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map(normalizeClass).filter(Boolean).join(' ');
  }
  if (typeof value === 'object') {
    return Object.keys(value).filter(k => value[k]).join(' ');
  }
  return '';
}
\`\`\`

### 5.3 style 的标准化

style 同样可以是字符串或对象：

\`\`\`js
// 字符串
<div style="color:red">

// 对象
<div :style="{ color: 'red', fontSize: '14px' }">
\`\`\`

对象形式要转成 cssText：

\`\`\`js
function normalizeStyle(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return Object.keys(value).map(k => \`\${k.replace(/([A-Z])/g, '-\$1').toLowerCase()}:\${value[k]}\`).join(';');
  }
  return '';
}
\`\`\`

注意驼峰转连字符：\`fontSize\` → \`font-size\`。

---

## 六、渲染器的整体结构

### 6.1 渲染器的模块化

真实的 Vue 渲染器是「跨平台」的——浏览器、SSR、原生都共用一套逻辑，只是「节点操作」不同。设计上：

\`\`\`js
function createRenderer(options) {
  // options 封装了平台相关的操作
  const { createElement, insert, setElementText, patchProp } = options;

  function mount(vnode, container) { /* ... */ }
  function patch(n1, n2, container) { /* ... */ }

  return { mount, patch };
}
\`\`\`

浏览器平台传入 DOM 操作：

\`\`\`js
const renderer = createRenderer({
  createElement: tag => document.createElement(tag),
  insert: (el, parent) => parent.appendChild(el),
  setElementText: (el, text) => el.textContent = text,
  patchProp: (el, key, value) => { /* ... */ }
});
\`\`\`

这种设计让渲染器逻辑和平台解耦，是 Vue 3 的重要改进。

### 6.2 Node.js 环境的模拟

本章 demo 在 Node.js 里跑，没有真实 DOM。我们用一个「模拟 DOM」工厂来演示 mount 流程：

\`\`\`js
function createMockElement(tag) {
  return {
    tagName: tag,
    attributes: {},
    style: {},
    children: [],
    textContent: '',
    appendChild(child) { this.children.push(child); },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(event, handler) {
      this.attributes['on' + event] = '[handler]';
    }
  };
}
\`\`\`

这样能在 Node.js 里看到 mount 的完整流程，输出模拟的 DOM 树。

---

## 七、本章 demo 思路

下面我们实现：
1. 一个**模拟 DOM 环境**（Node.js 没有真实 DOM）
2. **mount 函数**：把 VNode 挂载成模拟 DOM
3. **patch 函数**：实现初次渲染分支（n1 == null → mount）
4. 处理元素、文本、属性、事件、class、style、children

输入一棵 VNode 树，输出对应的模拟 DOM 树，用 console.log 打印。

## 八、本章小结

- 渲染器的两个核心函数：mount（挂载）和 patch（更新/卸载决策）
- patch 根据新旧 VNode 决定走 mount / unmount / 更新三条路
- mount 流程：创建元素 → 设置属性 → 处理 children → 插入容器
- 属性处理要区分 class、style、事件、普通属性
- 组件挂载涉及 setup 和 render，本章简化处理
- 渲染器通过 createRenderer 实现跨平台，节点操作被抽象为 options

至此你已经能从 VNode 生成真实 DOM 了。下一批章节我们会实现完整的 diff 算法，让更新也能高效进行——届时 patch 的三条路都会打通。
`,
    code: `// ============================================================
// 第十五章 demo：实现 mount 和 patch 的初次渲染逻辑
// ============================================================
// 目标：输入一棵 VNode 树，输出对应的模拟 DOM 树
// 由于 Node.js 没有真实 DOM，我们用 JS 对象模拟 DOM 节点

// ------------------------------------------------------------
// ShapeFlags 常量（沿用上一章的定义）
// ------------------------------------------------------------
const ShapeFlags = {
  ELEMENT: 1,
  FUNCTIONAL_COMPONENT: 1 << 1,
  STATEFUL_COMPONENT: 1 << 2,
  TEXT_CHILDREN: 1 << 3,
  ARRAY_CHILDREN: 1 << 4,
  SLOTS_CHILDREN: 1 << 5
};

// ------------------------------------------------------------
// 第一部分：模拟 DOM 环境
// ------------------------------------------------------------
// Node.js 没有 document，我们造一个「假 DOM」
// 真实浏览器里这些操作对应 document.createElement 等
function createMockElement(tag) {
  return {
    tagName: tag.toUpperCase(),      // DOM 的 tagName 是大写
    attributes: {},                  // 属性集合
    style: {},                       // 样式集合
    children: [],                    // 子节点集合
    textContent: '',                 // 文本内容（文本节点用）
    // 模拟 appendChild
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    // 模拟 setAttribute
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    // 模拟 addEventListener（这里只记录有事件，不真正监听）
    addEventListener(event, handler) {
      this.attributes['on' + event] = '[event:' + (handler.name || 'anonymous') + ']';
    },
    // 模拟 removeChild（卸载时用，本章不演示卸载）
    removeChild(child) {
      const i = this.children.indexOf(child);
      if (i >= 0) this.children.splice(i, 1);
    }
  };
}

// 创建文本节点
function createMockTextNode(text) {
  return {
    tagName: '#text',
    textContent: String(text),
    children: [],
    attributes: {},
    style: {}
  };
}

// ------------------------------------------------------------
// 第二部分：工具函数 —— 标准化 class 和 style
// ------------------------------------------------------------
// Vue 允许 class 是字符串、数组、对象，这里统一转成字符串
function normalizeClass(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    // 数组：递归处理每个元素，过滤空值，用空格连接
    return value.map(normalizeClass).filter(Boolean).join(' ');
  }
  if (value && typeof value === 'object') {
    // 对象：值为 truthy 的 key 保留
    return Object.keys(value).filter(k => value[k]).join(' ');
  }
  return '';
}

// 标准化 style：对象/字符串都转成字符串
function normalizeStyle(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    // 对象：把 { color: 'red', fontSize: '14px' } 转成 "color:red;font-size:14px"
    return Object.keys(value).map(k => {
      // 驼峰转连字符：fontSize → font-size
      const cssKey = k.replace(/([A-Z])/g, '-\$1').toLowerCase();
      return cssKey + ':' + value[k];
    }).join(';');
  }
  return '';
}

// ------------------------------------------------------------
// 第三部分：设置单个属性
// ------------------------------------------------------------
// 根据属性名决定怎么设置：class、style、事件、普通属性
function patchProp(el, key, value) {
  if (key === 'class') {
    // class：标准化后设到 className
    const cls = normalizeClass(value);
    if (cls) el.attributes['class'] = cls;
  } else if (key === 'style') {
    // style：标准化后逐条设置
    const styleStr = normalizeStyle(value);
    if (typeof value === 'object' && value) {
      // 对象形式：逐个设置到 style 对象
      for (const k in value) {
        const cssKey = k.replace(/([A-Z])/g, '-\$1').toLowerCase();
        el.style[cssKey] = value[k];
      }
    } else if (styleStr) {
      // 字符串形式：直接记下
      el.attributes['style'] = styleStr;
    }
  } else if (key.startsWith('on') && typeof value === 'function') {
    // 事件：onXxx → addEventListener(xxx)
    // 比如 onClick → click
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, value);
  } else if (key === 'key' || key === 'ref') {
    // key 和 ref 是 Vue 内部用的，不渲染到 DOM
    // 跳过
  } else {
    // 普通属性：用 setAttribute
    el.setAttribute(key, value);
  }
}

// ------------------------------------------------------------
// 第四部分：mount —— 把 VNode 挂载成真实（模拟）DOM
// ------------------------------------------------------------
function mount(vnode, container) {
  const { type, shapeFlag, props, children } = vnode;
  let el;

  // 第 1 步：根据节点类型创建对应的 DOM 元素
  if (shapeFlag & ShapeFlags.ELEMENT) {
    // 普通元素：<div>、<p> 等
    el = createMockElement(type);
  } else if (typeof type === 'symbol') {
    // 文本节点：type 是 Symbol('Text')
    el = createMockTextNode(children);
    vnode.el = el;
    container.appendChild(el);
    return;  // 文本节点没有 props 和 children，直接返回
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    // 组件：调用 mountComponent
    mountComponent(vnode, container);
    return;
  } else {
    // 未知类型，跳过
    return;
  }

  // 把真实 DOM 存到 VNode 上（更新时会用）
  vnode.el = el;

  // 第 2 步：设置属性
  if (props) {
    for (const key in props) {
      if (key === 'key' || key === 'ref') continue;  // 内部属性跳过
      patchProp(el, key, props[key]);
    }
  }

  // 第 3 步：处理 children
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // 文本子节点：直接设 textContent
    if (children != null) {
      el.textContent = String(children);
      // 同时创建一个文本子节点，便于可视化
      el.children.push(createMockTextNode(children));
    }
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // 数组子节点：遍历递归 mount
    for (const child of children) {
      if (child == null) continue;
      mount(child, el);
    }
  }

  // 第 4 步：把当前元素插入容器
  container.appendChild(el);
}

// ------------------------------------------------------------
// 第五部分：mountComponent —— 挂载组件（简化版）
// ------------------------------------------------------------
// 真实 Vue 会执行 setup、处理生命周期等，这里只做核心：
// 调用 render 拿到子 VNode，递归 mount
function mountComponent(vnode, container) {
  const component = vnode.type;
  // 创建组件实例
  const instance = {
    vnode,
    type: component,
    props: vnode.props || {},
    setupState: {}
  };
  vnode.component = instance;

  // 简化：直接调用 render 函数
  // 真实 Vue 会先执行 setup() 拿到响应式状态，再调用 render
  if (component.render) {
    const subTree = component.render.call(instance);
    // 递归 mount 子树
    mount(subTree, container);
    // 组件的 el 指向子树的根 el
    vnode.el = subTree.el;
  }
}

// ------------------------------------------------------------
// 第六部分：patch —— 渲染器总入口
// ------------------------------------------------------------
// 根据新旧 VNode 决定走 mount / unmount / 更新
function patch(n1, n2, container) {
  if (n1 == null) {
    // 没有旧 VNode → 挂载（初次渲染走这条）
    if (n2 != null) {
      mount(n2, container);
    }
  } else if (n2 == null) {
    // 没有新 VNode → 卸载（本章不实现）
    console.log('[patch] 卸载旧节点（本章未实现）');
  } else {
    // 都有 → 更新（需要 diff，下一批章节实现）
    if (!isSameType(n1, n2)) {
      // 类型不同：卸载旧的，挂载新的
      console.log('[patch] 类型不同，卸载旧的挂载新的');
      // unmount(n1); // 简化：不真正卸载
      mount(n2, container);
    } else {
      // 类型相同：更新（本章未实现 diff）
      console.log('[patch] 类型相同，更新（diff 算法下一批实现）');
    }
  }
}

// 判断两个 VNode 是否同类型（type 和 key 都相同）
function isSameType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}

// ------------------------------------------------------------
// 第七部分：渲染入口 render
// ------------------------------------------------------------
function render(vnode, container) {
  // 初次渲染：旧 VNode 为 null
  patch(null, vnode, container);
}

// ============================================================
// 实战 1：构建 VNode 树并 mount 成模拟 DOM
// ============================================================

// 先造一个简化版 h 函数（复用上一章思路）
function h(type, props, children) {
  if (arguments.length === 2) {
    if (typeof props === 'string' || Array.isArray(props)) {
      children = props;
      props = {};
    }
  }
  props = props || {};
  let shapeFlag = 0;
  if (typeof type === 'string') {
    shapeFlag |= ShapeFlags.ELEMENT;
  } else if (typeof type === 'object') {
    shapeFlag |= ShapeFlags.STATEFUL_COMPONENT;
  }
  const vnode = { type, props, key: props.key || null, children, shapeFlag, el: null };
  // 归一化 children
  if (children == null) {
    // 无子节点
  } else if (Array.isArray(children)) {
    shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    vnode.children = children.map(c => {
      if (typeof c === 'string' || typeof c === 'number') {
        return { type: Symbol('Text'), props: {}, key: null, children: String(c), shapeFlag: 0, el: null };
      }
      return c;
    });
    vnode.shapeFlag = shapeFlag;
  } else if (typeof children === 'string') {
    shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    vnode.children = children;
    vnode.shapeFlag = shapeFlag;
  }
  return vnode;
}

console.log('========== 初次渲染：mount VNode 树 ==========');
console.log('对应模板: <div class="app" id="root"><h1 onClick=handler>标题</h1><p style="color:red">内容</p><ul><li>项目1</li><li>项目2</li></ul></div>');
console.log('');

// 构造 VNode 树
const vnode = h('div', { class: 'app', id: 'root' }, [
  h('h1', { onClick: function handler() { return 'clicked'; } }, '标题'),
  h('p', { style: { color: 'red', fontSize: '14px' } }, '内容'),
  h('ul', null, [
    h('li', null, '项目1'),
    h('li', null, '项目2')
  ])
]);

// 创建容器（模拟 document.getElementById('root')）
const container = {
  tagName: '#root',
  attributes: {},
  style: {},
  children: [],
  appendChild(child) { this.children.push(child); }
};

// 执行初次渲染
console.log('开始 mount...');
render(vnode, container);
console.log('mount 完成！');
console.log('-----------------------------------');

// 打印生成的模拟 DOM 树
function printDomTree(node, prefix = '', isLast = true) {
  if (!node) return;
  const connector = isLast ? '└── ' : '├── ';
  let desc = '<' + node.tagName + '>';
  if (node.attributes && Object.keys(node.attributes).length > 0) {
    desc += ' ' + Object.keys(node.attributes).map(k => k + '="' + node.attributes[k] + '"').join(' ');
  }
  if (node.style && Object.keys(node.style).length > 0) {
    desc += ' [style: ' + Object.keys(node.style).map(k => k + ':' + node.style[k]).join(';') + ']';
  }
  if (node.textContent && node.tagName === '#text') {
    desc = '"' + node.textContent + '"';
  }
  console.log(prefix + connector + desc);
  const childPrefix = prefix + (isLast ? '    ' : '│   ');
  if (node.children && node.children.length > 0) {
    node.children.forEach((child, i) => {
      printDomTree(child, childPrefix, i === node.children.length - 1);
    });
  }
}

console.log('生成的模拟 DOM 树:');
printDomTree(container.children[0]);

// ============================================================
// 实战 2：测试 patch 的不同分支
// ============================================================
console.log('\\n========== 测试 patch 分支 ==========');

console.log('\\n--- 分支 1：n1=null, n2!=null → mount ---');
const c2 = { tagName: '#root2', attributes: {}, style: {}, children: [], appendChild(c) { this.children.push(c); } };
patch(null, h('span', null, '新节点'), c2);
printDomTree(c2.children[0]);

console.log('\\n--- 分支 2：n1!=null, n2=null → unmount ---');
patch(vnode, null, container);
console.log('  (卸载逻辑本章未实现，仅打印日志)');

console.log('\\n--- 分支 3：n1!=null, n2!=null, 同类型 → 更新 ---');
const newVnode = h('div', { class: 'app2' }, '新内容');
patch(vnode, newVnode, container);
console.log('  (diff 更新下一批章节实现)');

console.log('\\n--- 分支 4：n1!=null, n2!=null, 不同类型 → 卸载旧的挂载新的 ---');
const diffTypeVnode = h('section', null, '不同类型');
patch(vnode, diffTypeVnode, container);
console.log('  (类型不同，走 mount 新节点)');

console.log('\\n💡 总结：');
console.log('   mount 流程：创建元素 → 设置属性 → 处理 children → 插入容器');
console.log('   patch 三分支：n1=null→mount, n2=null→unmount, 都有→更新');
console.log('   属性处理区分 class、style、事件、普通属性');
console.log('   文本节点和元素节点走不同路径');
console.log('   渲染器通过模拟 DOM 在 Node.js 里也能演示');
`
  }
];
