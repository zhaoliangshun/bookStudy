// =============================================================
// TypeScript + React 全栈精通 - Batch 5: React 基础与组件
// -------------------------------------------------------------
// 章节范围（共 8 章）：
//   27. tspro-jsx                 JSX 语法详解
//   28. tspro-virtual-dom         元素渲染与 Virtual DOM
//   29. tspro-component-basics    组件与 Props 入门
//   30. tspro-props-types         Props 类型定义全解（TS）
//   31. tspro-state-usestate      State 与 useState
//   32. tspro-events              事件处理
//   33. tspro-conditional-render  条件渲染
//   34. tspro-list-keys           列表与 Keys
//
// 代码运行环境：ts.transpileModule + jsx: ReactJSX + target ES2020
// 沙箱注入 react / react/jsx-runtime 的 mock，可写 JSX 语法
// =============================================================

export const chapters = [
  // =========================================================
  // 第二十七章：JSX 语法详解
  // =========================================================
  {
    id: "tspro-jsx",
    group: "五、React 基础与组件",
    icon: "🎨",
    title: "JSX 语法详解",
    content: `# 第二十七章：JSX 语法详解

## 27.1 为什么需要 JSX

写 React 之前，前端渲染 UI 有两种主流方式：

1. **命令式操作 DOM**：\`document.createElement('div')\` 一行行拼，代码冗长、可读性差
2. **模板字符串拼 HTML**：\`'<div>' + name + '</div>'\`，拼接多了容易出 XSS、转义混乱

JSX 给出了第三种思路：**在 JS 里直接写类似 HTML 的标签语法**，让 UI 结构一目了然。

\`\`\`tsx
// 没有 JSX：用 React.createElement 拼
const el = React.createElement('div', { className: 'card' },
  React.createElement('h1', null, 'Hello'),
  React.createElement('p', null, 'World')
);

// 有 JSX：直观清晰
const el2 = (
  <div className="card">
    <h1>Hello</h1>
    <p>World</p>
  </div>
);
\`\`\`

两种写法**完全等价**——JSX 只是 \`React.createElement\` 的语法糖，编译后就是上面那种函数调用。

## 27.2 JSX 是什么

JSX = JavaScript + XML，是 JavaScript 的**语法扩展**。它不是合法的 JS（浏览器不认识 \`<div>\`），必须经过编译器（TypeScript / Babel）转成普通 JS 才能运行。

**核心规则**：

- 标签名小写 = HTML 标签：\`<div>\`、\`<span>\`
- 标签名大写 = React 组件：\`<Button>\`、\`<UserCard>\`
- 单标签必须闭合：\`<input />\`、\`<img />\`
- 属性名用驼峰：\`className\`（不是 class）、\`htmlFor\`（不是 for）、\`onClick\`（不是 onclick）

\`\`\`tsx
// class 是 JS 保留字，所以用 className
<div className="container" id="app">
  <label htmlFor="email">邮箱</label>
  <input id="email" type="text" disabled={true} />
  <button onClick={handleClick}>提交</button>
</div>
\`\`\`

## 27.3 JSX 编译成什么

JSX 经过 TypeScript 编译（\`jsx: react-jsx\` 模式）后变成 \`react/jsx-runtime\` 里的 \`_jsx()\` 调用：

\`\`\`tsx
// 源码（JSX）
const el = <div className="box">Hello</div>;

// 编译后（react-jsx 模式，React 17+）
import { jsx as _jsx } from "react/jsx-runtime";
const el = _jsx("div", { className: "box", children: "Hello" });

// 老版本（react 模式，React 16 及以前）
const el = React.createElement("div", { className: "box" }, "Hello");
\`\`\`

三种 JSX 编译模式对比：

| 模式 | 产物 | 适用 |
| --- | --- | --- |
| \`react\` | \`React.createElement(...)\` | React 16 及以前，需手动 import React |
| \`react-jsx\` | \`_jsx(...)\` 自动引入 | React 17+，推荐 |
| \`preserve\` | 保留 JSX 原样 | 交给 Babel/其它工具二次处理 |

React 17+ 用 \`react-jsx\`，**不需要在每个文件写 \`import React\`**。

## 27.4 JSX 表达式 \`{}\`

JSX 里用 \`{}\` 包裹任意 JS 表达式，结果会被渲染出来：

\`\`\`tsx
const name = 'Alice';
const age = 25;
const user = { name: 'Bob' };

const el = (
  <div>
    <p>姓名：{name}</p>
    <p>年龄：{age + 1}</p>
    <p>对象属性：{user.name}</p>
    <p>三元：{age >= 18 ? '成年' : '未成年'}</p>
    <p>方法调用：{name.toUpperCase()}</p>
    <p>数组：{[1, 2, 3].join('-')}</p>
  </div>
);
\`\`\`

**注意**：\`{}\) 里不能放语句（\`if\`、\`for\`、\`switch\`），只能放表达式。需要分支用三元，需要循环用 \`map\`。

\`\`\`tsx
// ❌ 错：if 是语句
const el = <div>{if (ok) { return 'yes' }}</div>;

// ✅ 对：用三元
const el2 = <div>{ok ? 'yes' : 'no'}</div>;
\`\`\`

## 27.5 条件渲染

JSX 里有三种常见条件渲染写法：

\`\`\`tsx
function Greeting({ isLogin, user }) {
  return (
    <div>
      {/* 1. 三元：二选一 */}
      {isLogin ? <p>欢迎，{user}</p> : <p>请登录</p>}

      {/* 2. && 短路：满足才显示 */}
      {isLogin && <button>退出</button>}

      {/* 3. || 短路：前面为空用后面 */}
      {user || '游客'}
    </div>
  );
}
\`\`\`

**坑**：\`&&\` 左边如果是数字 0，会渲染出 \`0\`：

\`\`\`tsx
const count = 0;
const el = <div>{count && <span>有数据</span>}</div>;  // 渲染出 "0"！
// 修复：转成布尔
const el2 = <div>{count > 0 && <span>有数据</span>}</div>;
\`\`\`

## 27.6 列表渲染

用 \`map\` 把数组转成 JSX 数组：

\`\`\`tsx
const fruits = ['苹果', '香蕉', '橘子'];

const el = (
  <ul>
    {fruits.map((fruit, index) => (
      <li key={fruit}>{fruit}</li>
    ))}
  </ul>
);
\`\`\`

**关键点**：

- 每个列表项必须有 \`key\` 属性（下一章详讲）
- \`key\` 要用稳定唯一的值（如 id），尽量避免用 index
- \`map\` 返回的是 JSX 数组，React 会逐个渲染

## 27.7 JSX 注释

JSX 里写注释用 \`{/* */}\`：

\`\`\`tsx
const el = (
  <div>
    {/* 这是 JSX 注释，不会渲染到页面 */}
    <p>正文</p>
    {/*
      多行注释
      也用这种方式
    */}
  </div>
);
\`\`\`

注意：在标签属性中间也可以写注释：

\`\`\`tsx
<div
  className="box"
  // id="app"  ← 这种 // 注释在属性间也可以
  onClick={handler}
>
  内容
</div>
\`\`\`

## 27.8 Fragment \`<></>\`

JSX 要求**最外层只能有一个根元素**。不想多套一层 \`<div>\` 时用 Fragment：

\`\`\`tsx
// ❌ 错：两个根元素
const el = (
  <h1>标题</h1>
  <p>正文</p>
);

// ✅ 方案 1：套个 div（会多一个 DOM 节点）
const el2 = (
  <div>
    <h1>标题</h1>
    <p>正文</p>
  </div>
);

// ✅ 方案 2：Fragment（不产生多余 DOM 节点）
const el3 = (
  <>
    <h1>标题</h1>
    <p>正文</p>
  </>
);

// ✅ 方案 3：显式 React.Fragment（可以传 key）
const el4 = (
  <React.Fragment key="item-1">
    <h1>标题</h1>
    <p>正文</p>
  </React.Fragment>
);
\`\`\`

空标签 \`<>\` 是 \`<React.Fragment>\` 的简写，但简写形式不能传属性。\`map\` 里需要 \`key\` 时必须用完整形式。

## 27.9 JSX 的本质：对象

JSX 编译后得到的是一个**普通 JS 对象**（React 元素），不是 DOM 节点：

\`\`\`tsx
const el = <div className="box">Hello</div>;
// el 大致长这样：
// {
//   $$typeof: Symbol(react.element),
//   type: 'div',
//   props: { className: 'box', children: 'Hello' },
//   key: null,
//   ref: null,
// }
\`\`\`

React 拿到这个对象后，再决定怎么渲染（Web 上变成 DOM，React Native 上变成原生组件）。**React 元素是不可变的**——你创建后不能改它的 props，要更新 UI 只能创建一个新元素（下一章详讲）。

## 27.10 实际项目中的 JSX 习惯

1. **多行 JSX 用括号包裹**：避免 ASI（自动分号插入）把 return 后面的 JSX 当成单独语句
2. **组件文件后缀 .tsx**：让 TS 编译器识别 JSX
3. **优先用 Fragment 而非多余 div**：保持 DOM 结构干净，避免破坏 CSS 选择器
4. **复杂表达式抽成变量**：JSX 里 \`{}\` 太长会影响可读性

\`\`\`tsx
// 推荐：把复杂逻辑抽出来
function UserList({ users }) {
  const sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name));
  const visibleUsers = sortedUsers.filter(u => !u.deleted);

  return (
    <ul>
      {visibleUsers.map(u => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
\`\`\`

## 27.11 小结

- JSX 是 \`React.createElement\` 的语法糖，编译后是普通 JS 函数调用
- React 17+ 用 \`react-jsx\` 模式，不用 \`import React\`
- \`{}\` 里放表达式（不能放语句），三元和 \`map\` 是常用模式
- 列表渲染必须给 \`key\`，条件渲染注意 \`0\` 的陷阱
- 多根用 Fragment \`<></>\`，需要 \`key\` 时用 \`<React.Fragment>\`
- JSX 编译后是普通对象（React 元素），不是 DOM
`,
    code: `// =============================================================
// 第 27 章 demo：JSX 语法详解
// 沙箱支持 JSX 转译（jsx: ReactJSX），但 mock 的 _jsx 返回 null
// 这里用自定义 h() 函数模拟 React.createElement，输出元素树结构
// 注释里展示等价 JSX 写法
// =============================================================

// ---- 自定义 createElement：返回元素对象 ----
// 等价于 React.createElement(type, props, ...children)
function h(type, props, ...children) {
  return {
    type: type,                                // 标签名或组件函数
    props: props || {},                        // 属性对象
    children: children.flat().filter(Boolean), // 子节点（扁平化、过滤 false）
  };
}

// ---- 把元素树渲染成可读字符串 ----
function stringify(el, depth = 0) {
  if (el == null || typeof el !== 'object') return String(el);
  const indent = '  '.repeat(depth);
  const props = Object.keys(el.props)
    .map(k => k + '=' + JSON.stringify(el.props[k]))
    .join(' ');
  if (el.children.length === 0) {
    return indent + '<' + el.type + (props ? ' ' + props : '') + ' />';
  }
  const inner = el.children
    .map(c => typeof c === 'object' ? stringify(c, depth + 1) : indent + '  ' + String(c))
    .join('\\n');
  return indent + '<' + el.type + (props ? ' ' + props : '') + '>\\n' + inner + '\\n' + indent + '</' + el.type + '>';
}

// ---- 1. 基础 JSX 等价写法 ----
// JSX: <div className="box">Hello</div>
const el1 = h('div', { className: 'box' }, 'Hello');
console.log('=== 1. 基础元素 ===');
console.log(stringify(el1));

// ---- 2. 嵌套结构 ----
// JSX:
// <section className="card">
//   <h1>标题</h1>
//   <p>正文内容</p>
// </section>
const el2 = h('section', { className: 'card' },
  h('h1', null, '标题'),
  h('p', null, '正文内容')
);
console.log('\\n=== 2. 嵌套结构 ===');
console.log(stringify(el2));

// ---- 3. {} 表达式：动态值 ----
const name = 'Alice';
const age = 25;
// JSX: <p>姓名：{name}，年龄：{age + 1}</p>
const el3 = h('p', null, '姓名：' + name + '，年龄：' + (age + 1));
console.log('\\n=== 3. 表达式插值 ===');
console.log(stringify(el3));

// ---- 4. 条件渲染：三元与 && ----
const isLogin = true;
const user = 'Bob';
// JSX: {isLogin ? <p>欢迎，{user}</p> : <p>请登录</p>}
const el4 = h('div', null,
  isLogin ? h('p', null, '欢迎，' + user) : h('p', null, '请登录'),
  isLogin && h('button', { onClick: 'logout' }, '退出')
);
console.log('\\n=== 4. 条件渲染 ===');
console.log(stringify(el4));

// ---- 5. 列表渲染：map ----
const fruits = ['苹果', '香蕉', '橘子'];
// JSX: {fruits.map(f => <li key={f}>{f}</li>)}
const el5 = h('ul', null,
  ...fruits.map(f => h('li', { key: f }, f))
);
console.log('\\n=== 5. 列表渲染 ===');
console.log(stringify(el5));

// ---- 6. Fragment：多根不套多余 div ----
// 等价 React.Fragment
function Fragment(props) {
  return { type: 'Fragment', props: {}, children: props.children };
}
// JSX:
// <>
//   <h1>标题</h1>
//   <p>正文</p>
// </>
const el6 = Fragment({ children: [h('h1', null, '标题'), h('p', null, '正文')] });
console.log('\\n=== 6. Fragment ===');
console.log(stringify(el6));

// ---- 7. 组件作为 type ----
// 大写开头的标签是组件
function Button(props) {
  return h('button', { className: 'btn ' + (props.variant || '') }, props.label);
}
// JSX: <Button variant="primary" label="提交" />
const el7 = h(Button, { variant: 'primary', label: '提交' });
console.log('\\n=== 7. 组件元素 ===');
console.log('type 是函数：', typeof el7.type === 'function' ? '✓' : '✗');
console.log('props:', JSON.stringify(el7.props));

// ---- 8. 演示 JSX 编译产物 ----
// 真实 react-jsx 模式下：<div id="x">hi</div> 编译为：
//   _jsx("div", { id: "x", children: "hi" })
console.log('\\n=== 8. JSX 编译产物 ===');
console.log('源码：<div id="x">hi</div>');
console.log('编译：_jsx("div", { id: "x", children: "hi" })');

// ---- 关键要点总结 ----
console.log('\\n=== JSX 核心要点 ===');
console.log('1. JSX 是 React.createElement 的语法糖');
console.log('2. React 17+ 用 react-jsx 模式，不用 import React');
console.log('3. {} 里只能放表达式，不能放语句');
console.log('4. 条件渲染：三元 / && / ||，注意 0 的陷阱');
console.log('5. 列表渲染：map + key（稳定唯一值）');
console.log('6. 多根用 Fragment <></>，需要 key 用 <React.Fragment>');
console.log('7. JSX 编译后是普通对象（React 元素），不是 DOM');
`,
  },

  // =========================================================
  // 第二十八章：元素渲染与 Virtual DOM
  // =========================================================
  {
    id: "tspro-virtual-dom",
    group: "五、React 基础与组件",
    icon: "🌳",
    title: "元素渲染与 Virtual DOM",
    content: `# 第二十八章：元素渲染与 Virtual DOM

## 28.1 为什么需要 Virtual DOM

直接操作 DOM 有三个痛点：

1. **DOM 操作昂贵**：一次 \`appendChild\` 可能触发重排重绘，性能远不如操作普通 JS 对象
2. **命令式代码难维护**：手动增删节点、设置属性、绑定事件，代码量随业务复杂度爆炸
3. **跨平台困难**：DOM 是浏览器专属，写到 App 里要重写一套渲染逻辑

Virtual DOM（虚拟 DOM）的思路：**用普通 JS 对象描述 UI 结构，先在内存里比对差异，再一次性更新真实 DOM**。

\`\`\`tsx
// 真实 DOM 节点
const div = document.createElement('div');
div.className = 'box';
div.appendChild(document.createTextNode('Hello'));

// 虚拟 DOM（普通对象）
const vdom = {
  type: 'div',
  props: { className: 'box' },
  children: ['Hello'],
};
\`\`\`

## 28.2 React 元素的本质

React 元素（ReactElement）是**不可变的普通对象**，描述某一时刻 UI 的样子：

\`\`\`tsx
const el = <div className="box">Hello</div>;

// el 实际长这样（简化）
{
  $$typeof: Symbol(react.element),
  type: 'div',
  props: { className: 'box', children: 'Hello' },
  key: null,
  ref: null,
}
\`\`\`

**关键特性：不可变（immutable）**。一旦创建，不能修改它的 \`type\`、\`props\`、\`children\`。要更新 UI，**只能创建一个新的元素对象**。

\`\`\`tsx
// ❌ 错：不能直接改
el.props.className = 'new-box';

// ✅ 对：创建新元素
const newEl = <div className="new-box">Hello</div>;
\`\`\`

这跟函数式编程的"数据不可变"理念一致——让状态变化可预测、可追溯。

## 28.3 Virtual DOM 是什么

Virtual DOM 是一棵**用 JS 对象模拟的 DOM 树**。React 用它作为真实 DOM 的"草稿"：

1. 首次渲染：根据 React 元素创建 Virtual DOM 树 → 一次性渲染成真实 DOM
2. 状态更新：生成新的 Virtual DOM 树 → 跟旧树对比 → 只更新差异部分到真实 DOM

\`\`\`tsx
// 这棵 Virtual DOM 树
const vdom = {
  type: 'div',
  props: { className: 'app' },
  children: [
    { type: 'h1', props: {}, children: ['Hello'] },
    { type: 'p', props: {}, children: ['World'] },
  ],
};

// 对应真实 DOM
// <div class="app">
//   <h1>Hello</h1>
//   <p>World</p>
// </div>
\`\`\`

Virtual DOM 的好处：

| 优势 | 说明 |
| --- | --- |
| 性能 | 内存比对，最小化 DOM 操作 |
| 跨平台 | 同一棵树可渲染到 Web / Native / SSR |
| 声明式 | 描述"UI 应该是什么样"，不写"怎么改" |
| 调试 | 元素树可序列化、可快照 |

## 28.4 Diff 算法（Reconciliation）

状态更新后，React 拿新树和旧树对比，决定怎么改真实 DOM。这个过程叫 **Reconciliation（协调）**，核心算法是 Diff。

**朴素 Diff 复杂度是 O(n³)**（两棵树的所有节点两两对比），React 用三个假设把它压到 O(n)：

1. **不同类型的元素，直接销毁重建**
   - \`<div>\` 变 \`<span>\`：销毁 div 及其子树，新建 span
   - \`<Button>\` 变 \`<Input>\`：销毁 Button，新建 Input
2. **同类型 DOM 元素，只更新变化的属性**
   - \`<div className="a">\` 变 \`<div className="b">\`：只改 className
3. **同类型组件元素，更新 props 后重新渲染**
   - \`<Button size="sm">\` 变 \`<Button size="lg">\`：更新 size，重新调用 Button 函数

\`\`\`tsx
// 场景 1：类型变了，整棵子树重建
// 旧
<div className="card"><h1>Title</h1></div>
// 新
<section className="card"><h1>Title</h1></section>
// 结果：div 和 section 都重建（即使内容一样）

// 场景 2：同类型，只改属性
// 旧
<div className="a" id="x"></div>
// 新
<div className="b" id="x"></div>
// 结果：只执行 div.className = 'b'，不重建节点

// 场景 3：列表项顺序变了，靠 key 复用
// 旧
<li key="a">A</li><li key="b">B</li>
// 新
<li key="b">B</li><li key="a">A</li>
// 结果：移动节点，不销毁重建
\`\`\`

## 28.5 为什么 React 性能好

React 性能好的核心不是"Virtual DOM 比直接操作 DOM 快"——**直接操作 DOM 永远是最快的**。React 的优势在于：

1. **最小化 DOM 操作**：开发者写声明式代码，React 自动算出最小变更集，避免无意义的重排
2. **批量更新**：多次 setState 会被合并成一次渲染
3. **避免手动优化的心智负担**：不用人为担心"这次操作会不会触发重排"

但 Virtual DOM 也有代价——**比对本身要花时间**。对于极高性能场景（如动画、表格滚动），可以用 \`shouldComponentUpdate\`、\`React.memo\`、\`useMemo\` 跳过比对。

## 28.6 key 的作用

\`key\` 是 React 识别列表项身份的特殊属性。**Diff 时 React 用 key 判断"这个节点是不是原来那个节点"**。

\`\`\`tsx
// 列表渲染必须给 key
{users.map(u => (
  <UserCard key={u.id} user={u} />
))}
\`\`\`

**没有 key 会发生什么**：

\`\`\`tsx
// 旧列表
<li>A</li><li>B</li><li>C</li>

// 新列表（在头部插入 X）
<li>X</li><li>A</li><li>B</li><li>C</li>
\`\`\`

如果没 key，React 按**位置**对比：

- 位置 0：A 变 X → 改文本
- 位置 1：B 变 A → 改文本
- 位置 2：C 变 B → 改文本
- 位置 3：（空）变 C → 新建

结果是 4 次更新 + 1 次新建，**性能最差**。

如果有 key：

\`\`\`tsx
<li key="a">A</li><li key="b">B</li><li key="c">C</li>
// 变成
<li key="x">X</li><li key="a">A</li><li key="b">B</li><li key="c">C</li>
\`\`\`

React 按 key 对比：A、B、C 都还在，只是位置移动了；X 是新增。**只需要 1 次新建 + 移动节点**，性能最优。

更严重的是 **state 错乱**：如果列表项是有状态的组件（如输入框），用 index 作 key，删除第一项后，第二项的 state 会"串"到第一项上。

## 28.7 实际项目中的性能优化

1. **列表必须有稳定的 key**：用业务 id，不要用 index
2. **避免在渲染里创建新对象/函数**：会触发不必要的子组件更新
3. **重渲染优化**：\`React.memo\` + \`useMemo\` + \`useCallback\`
4. **大列表虚拟化**：用 \`react-window\` / \`react-virtual\` 只渲染可见区域

\`\`\`tsx
// ❌ 每次渲染都创建新 onClick，子组件 memo 失效
function Parent() {
  return <Child onClick={() => doSomething()} />;
}

// ✅ 用 useCallback 缓存
function Parent() {
  const handleClick = useCallback(() => doSomething(), []);
  return <Child onClick={handleClick} />;
}
\`\`\`

## 28.8 小结

- React 元素是**不可变对象**，更新 UI 只能创建新元素
- Virtual DOM 是 JS 对象模拟的 DOM 树，作为真实 DOM 的"草稿"
- Diff 算法靠三个假设压到 O(n)：类型变就重建、同类型改属性、列表靠 key 复用
- \`key\` 是列表项的"身份证"，影响性能和 state 正确性
- React 性能好的本质是**最小化 DOM 操作 + 批量更新**，不是 Virtual DOM 本身比 DOM 快
`,
    code: `// =============================================================
// 第 28 章 demo：元素渲染与 Virtual DOM
// 用普通 JS 对象模拟 React 元素树，演示 diff 过程和 key 的作用
// =============================================================

// ---- 1. 创建 React 元素（模拟 React.createElement） ----
function createElement(type, props, ...children) {
  return {
    $$typeof: 'Symbol(react.element)',       // 元素标识
    type: type,                              // 标签名或组件函数
    props: props || {},                      // 属性
    children: children.flat().filter(c => c !== null && c !== false && c !== undefined),
  };
}

// ---- 2. 把元素树渲染成可读字符串 ----
function render(el, depth = 0) {
  if (el == null || typeof el !== 'object') return '  '.repeat(depth) + String(el);
  const indent = '  '.repeat(depth);
  const propStr = Object.keys(el.props).map(k => k + '=' + el.props[k]).join(' ');
  if (el.children.length === 0) return indent + '<' + el.type + (propStr ? ' ' + propStr : '') + ' />';
  const inner = el.children.map(c => render(c, depth + 1)).join('\\n');
  return indent + '<' + el.type + (propStr ? ' ' + propStr : '') + '>\\n' + inner + '\\n' + indent + '</' + el.type + '>';
}

// ---- 3. 创建一棵 Virtual DOM 树 ----
const oldTree = createElement('div', { className: 'app' },
  createElement('h1', null, '标题'),
  createElement('ul', null,
    createElement('li', { key: 'a' }, 'A'),
    createElement('li', { key: 'b' }, 'B'),
    createElement('li', { key: 'c' }, 'C')
  )
);
console.log('=== 1. Virtual DOM 树结构 ===');
console.log(render(oldTree));

// ---- 4. 演示 Diff 算法：三种情况 ----

// 情况 A：类型变了 → 销毁重建
const treeA_new = createElement('section', { className: 'app' },
  createElement('h1', null, '标题'),
  createElement('ul', null,
    createElement('li', { key: 'a' }, 'A'),
    createElement('li', { key: 'b' }, 'B'),
    createElement('li', { key: 'c' }, 'C')
  )
);
console.log('\\n=== 2. Diff 情况 A：div → section（类型变，整树重建） ===');
console.log('旧 type:', oldTree.type, '→ 新 type:', treeA_new.type);
console.log('React 行为：销毁旧 div 子树，新建 section 子树');

// 情况 B：同类型，只改属性
const treeB_new = createElement('div', { className: 'app-dark' },
  createElement('h1', null, '标题'),
  createElement('ul', null,
    createElement('li', { key: 'a' }, 'A'),
    createElement('li', { key: 'b' }, 'B'),
    createElement('li', { key: 'c' }, 'C')
  )
);
console.log('\\n=== 3. Diff 情况 B：className 变化（同类型，只改属性） ===');
console.log('旧 className:', oldTree.props.className, '→ 新:', treeB_new.props.className);
console.log('React 行为：只执行 dom.className = "app-dark"，不重建节点');

// 情况 C：列表顺序变化 + key 复用
const treeC_new = createElement('div', { className: 'app' },
  createElement('h1', null, '标题'),
  createElement('ul', null,
    createElement('li', { key: 'x' }, 'X'),  // 新增
    createElement('li', { key: 'a' }, 'A'),
    createElement('li', { key: 'b' }, 'B'),
    createElement('li', { key: 'c' }, 'C')
  )
);
console.log('\\n=== 4. Diff 情况 C：头部插入新项 X（key 复用） ===');
console.log('React 行为：复用 A/B/C，新增 X，性能最优');

// ---- 5. 演示没有 key 的性能问题 ----
console.log('\\n=== 5. 没有key时按位置对比（性能最差） ===');
console.log('旧：[A, B, C]');
console.log('新：[X, A, B, C]');
console.log('位置 0: A→X 改文本');
console.log('位置 1: B→A 改文本');
console.log('位置 2: C→B 改文本');
console.log('位置 3: 空→C 新建');
console.log('总计：3 次更新 + 1 次新建');

console.log('\\n=== 6. 有 key 时按身份对比（性能最优） ===');
console.log('旧：[key=a:A, key=b:B, key=c:C]');
console.log('新：[key=x:X, key=a:A, key=b:B, key=c:C]');
console.log('A/B/C 复用（只移动），X 新增');
console.log('总计：1 次新建 + 节点移动');

// ---- 6. 简单 diff 实现：对比两棵树 ----
function diff(oldNode, newNode, patches = []) {
  if (!oldNode && newNode) {
    patches.push({ type: 'INSERT', node: newNode });
  } else if (oldNode && !newNode) {
    patches.push({ type: 'REMOVE', node: oldNode });
  } else if (typeof oldNode !== 'object' || typeof newNode !== 'object') {
    if (oldNode !== newNode) {
      patches.push({ type: 'TEXT', old: oldNode, new: newNode });
    }
  } else if (oldNode.type !== newNode.type) {
    patches.push({ type: 'REPLACE', old: oldNode, new: newNode });
  } else {
    // 同类型：对比 props
    const oldProps = oldNode.props || {};
    const newProps = newNode.props || {};
    for (const k of Object.keys(newProps)) {
      if (oldProps[k] !== newProps[k]) {
        patches.push({ type: 'PROPS', key: k, value: newProps[k] });
      }
    }
    // 对比 children
    const max = Math.max(oldNode.children.length, newNode.children.length);
    for (let i = 0; i < max; i++) {
      diff(oldNode.children[i], newNode.children[i], patches);
    }
  }
  return patches;
}

const tree1 = createElement('div', { className: 'a' }, createElement('span', null, 'hi'));
const tree2 = createElement('div', { className: 'b' }, createElement('span', null, 'hi'));
console.log('\\n=== 7. 简单 diff 实现 ===');
console.log('旧树 props:', JSON.stringify(tree1.props));
console.log('新树 props:', JSON.stringify(tree2.props));
const patches = diff(tree1, tree2);
console.log('diff 结果:', JSON.stringify(patches, null, 2));

// ---- 关键要点总结 ----
console.log('\\n=== Virtual DOM 核心要点 ===');
console.log('1. React 元素是不可变对象，更新只能创建新元素');
console.log('2. Virtual DOM 是 JS 对象模拟的 DOM 树');
console.log('3. Diff 三假设：类型变重建 / 同类型改属性 / 列表靠 key 复用');
console.log('4. key 影响性能和 state 正确性，必须用稳定唯一值');
console.log('5. React 性能好 = 最小化 DOM 操作 + 批量更新');
`,
  },

  // =========================================================
  // 第二十九章：组件与 Props 入门
  // =========================================================
  {
    id: "tspro-component-basics",
    group: "五、React 基础与组件",
    icon: "🧩",
    title: "组件与 Props 入门",
    content: `# 第二十九章：组件与 Props 入门

## 29.1 为什么需要组件

一个页面有成百上千个 UI 元素，全堆在一个文件里无法维护。**组件（Component）** 是 React 拆分 UI 的基本单位——把页面切成独立、可复用的小块，每块管自己的渲染逻辑。

\`\`\`tsx
// 没有组件：所有 UI 挤在一起
function Page() {
  return (
    <div>
      <div className="header"><h1>标题</h1><nav>导航</nav></div>
      <div className="main"><p>内容</p></div>
      <div className="footer"><p>底部</p></div>
    </div>
  );
}

// 有组件：分而治之
function Page() {
  return (
    <div>
      <Header />
      <Main />
      <Footer />
    </div>
  );
}
\`\`\`

组件的核心价值：

1. **复用**：写一次，多处用
2. **隔离**：每个组件管自己的状态和样式，互不影响
3. **组合**：小组件拼成大组件，像乐高积木
4. **维护**：聚焦单一职责，改一个不影响别的

## 29.2 函数组件 vs 类组件

React 有两种组件写法：

\`\`\`tsx
// 1. 函数组件（现代推荐）
function Welcome(props: { name: string }) {
  return <h1>Hello, {props.name}</h1>;
}

// 2. 类组件（老写法，新代码不要用）
class Welcome extends React.Component<{ name: string }> {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
\`\`\`

**对比**：

| 维度 | 函数组件 | 类组件 |
| --- | --- | --- |
| 写法 | 函数返回 JSX | class + render 方法 |
| 状态 | useState / useReducer | this.state + setState |
| 生命周期 | useEffect / useLayoutEffect | componentDidMount 等 |
| this | 没有 | 有，容易绑定出错 |
| 性能 | 略快（少一层实例） | 略慢 |
| 推荐 | ✅ 现代主流 | ⚠️ 维护老项目用 |

React 16.8（2019 年）推出 Hooks 后，**函数组件能做类组件能做的所有事**，新项目一律用函数组件。类组件保留是为了兼容老代码。

## 29.3 Props 的概念

**Props（properties）** 是组件的输入参数，从父组件传进来。组件根据 props 渲染不同内容：

\`\`\`tsx
// 子组件：接收 props
function Greeting(props: { name: string; age: number }) {
  return <p>你好，{props.name}，你 {props.age} 岁了</p>;
}

// 父组件：传 props
function App() {
  return (
    <div>
      <Greeting name="张三" age={30} />
      <Greeting name="李四" age={25} />
    </div>
  );
}
\`\`\`

**Props 是单向数据流**：父 → 子，子不能改父传来的 props。要改只能让父组件改自己的 state，新的 props 流下来触发子组件重新渲染。

\`\`\`
父组件 (state)
   │  props 向下流
   ▼
子组件 (props)
   │  通过回调通知父组件
   ▼
父组件改 state → 触发子组件重新渲染
\`\`\`

## 29.4 Props 是只读的

**绝对不能在组件里修改 props**。这是 React 的铁律：

\`\`\`tsx
function Bad(props: { count: number }) {
  props.count = props.count + 1;  // ❌ 直接报错或警告
  return <p>{props.count}</p>;
}

function Good(props: { count: number }) {
  const newCount = props.count + 1;  // ✅ 拷贝一份用
  return <p>{newCount}</p>;
}
\`\`\`

为什么？因为 props 是父组件 state 的"快照"，改了会让数据流不可预测。需要"变"的数据，用 state（下一章讲）。

\`\`\`tsx
// 想让 count 能变：把数据放到父组件的 state 里
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <Display count={count} />
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
\`\`\`

## 29.5 Props 解构与默认值

**解构**让代码更简洁：

\`\`\`tsx
// 不解构：到处 props.xxx
function User(props: { name: string; age: number; email: string }) {
  return <p>{props.name} - {props.age} - {props.email}</p>;
}

// 解构（推荐）
function User({ name, age, email }: { name: string; age: number; email: string }) {
  return <p>{name} - {age} - {email}</p>;
}
\`\`\`

**默认值**有两种写法：

\`\`\`tsx
// 1. 解构默认值（推荐）
function Button({ type = 'button', disabled = false }: {
  type?: string;
  disabled?: boolean;
}) {
  return <button type={type} disabled={disabled}>Click</button>;
}

// 2. 参数默认值
function Button(props: { type?: string }) {
  const { type = 'button' } = props;
  return <button type={type}>Click</button>;
}
\`\`\`

调用时不传或传 \`undefined\`，会用默认值；传 \`null\` 不会用默认值（\`null\` 是显式赋值）。

## 29.6 children

\`children\` 是一个特殊 prop，表示组件标签之间的内容：

\`\`\`tsx
function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h2>{props.title}</h2>
      <div className="card-body">{props.children}</div>
    </div>
  );
}

// 使用：标签之间的内容会作为 children 传进去
<Card title="用户信息">
  <p>姓名：张三</p>
  <p>年龄：30</p>
</Card>
\`\`\`

children 让组件变成"容器"，可以嵌套任意内容。这是组合模式的基础：

\`\`\`tsx
// 一个 Modal 组件，里面塞什么由调用方决定
<Modal open={true}>
  <Form />
</Modal>

<Modal open={true}>
  <img src="preview.png" />
</Modal>
\`\`\`

children 可以是：

- 字符串、数字
- React 元素（\`<div />\`）
- 数组（多个元素）
- 函数（渲染属性模式）
- undefined / null（不渲染）

## 29.7 实际项目中的组件设计

1. **单一职责**：一个组件只做一件事，复杂逻辑拆成多个组件
2. **props 接口稳定**：避免频繁改动 props 结构，影响调用方
3. **合理拆分粒度**：太粗难复用，太细增加心智负担
4. **组合优于继承**：React 不推荐组件继承，用组合拼接

\`\`\`tsx
// ✅ 组合：用 children 把 UI 拼起来
function Layout({ header, sidebar, children }) {
  return (
    <div>
      <header>{header}</header>
      <main>
        <aside>{sidebar}</aside>
        <section>{children}</section>
      </main>
    </div>
  );
}

// 调用方决定每块塞什么
<Layout
  header={<TopNav />}
  sidebar={<Menu />}
>
  <Dashboard />
</Layout>
\`\`\`

## 29.8 小结

- 组件是 React 拆分 UI 的基本单位，函数组件是现代主流
- Props 是组件输入参数，**单向流动、只读不可变**
- 解构 + 默认值让 props 使用更简洁
- \`children\` 是特殊 prop，让组件成为容器
- 组合优于继承，用 children 拼接 UI 而非 class 继承
`,
    code: `// =============================================================
// 第 29 章 demo：组件与 Props 入门
// 用普通函数模拟 React 组件，演示 props 流转和 children 机制
// =============================================================

// ---- 自定义元素创建函数（模拟 React.createElement） ----
function h(type, props, ...children) {
  return {
    type: type,
    props: props || {},
    children: children.flat().filter(c => c !== null && c !== false && c !== undefined),
  };
}

// ---- 1. 函数组件：接收 props，返回元素 ----
// 等价于：function Welcome(props) { return <h1>Hello, {props.name}</h1>; }
function Welcome(props) {
  return h('h1', { className: 'greeting' }, 'Hello, ' + props.name);
}

// 调用：父组件传 props
const el1 = h(Welcome, { name: '张三' });
console.log('=== 1. 函数组件 + props ===');
console.log('props:', JSON.stringify(el1.props));

// "渲染"组件：调用函数得到元素
// 真实 React 会把 children 合并进 props 传给组件
function render(el) {
  if (el == null || typeof el !== 'object') return el;
  if (typeof el.type === 'function') {
    const propsWithChildren = { ...el.props, children: el.children };  // 把 children 放进 props
    const instance = el.type(propsWithChildren);  // 调用组件函数
    return render(instance);              // 递归渲染返回的元素
  }
  // DOM 元素：递归渲染子节点
  return { ...el, children: el.children.map(c => render(c)) };
}
console.log('渲染结果:', JSON.stringify(render(el1)));

// ---- 2. props 解构与默认值 ----
// 等价于：function Button({ type = 'button', disabled = false, label }) { ... }
function Button(props) {
  const { type = 'button', disabled = false, label } = props;  // 解构 + 默认值
  return h('button', { type: type, disabled: disabled }, label);
}

console.log('\\n=== 2. props 默认值 ===');
const btn1 = render(h(Button, { label: '提交' }));
console.log('不传 type/disabled:', JSON.stringify(btn1.props));
const btn2 = render(h(Button, { label: '保存', type: 'submit', disabled: true }));
console.log('显式传值:', JSON.stringify(btn2.props));

// ---- 3. props 是只读的：模拟"不可变"约束 ----
function tryMutateProps(props) {
  // ❌ 真实 React 里这样做会报警告
  // props.count = props.count + 1;
  // ✅ 正确：拷贝使用
  const newCount = props.count + 1;
  return h('p', null, 'count=' + props.count + ', newCount=' + newCount);
}
console.log('\\n=== 3. props 只读 ===');
console.log('渲染:', JSON.stringify(render(h(tryMutateProps, { count: 5 }))));

// ---- 4. children：组件标签之间的内容 ----
// 等价于：
// function Card({ title, children }) {
//   return <div><h2>{title}</h2><div>{children}</div></div>;
// }
function Card(props) {
  const { title, children } = props;
  return h('div', { className: 'card' },
    h('h2', null, title),
    h('div', { className: 'card-body' }, ...children)
  );
}

// 调用：标签之间的内容作为 children 传入
const cardEl = h(Card, { title: '用户信息' },
  h('p', null, '姓名：张三'),
  h('p', null, '年龄：30')
);
console.log('\\n=== 4. children 机制 ===');
const cardInstance = render(cardEl);
console.log('Card 内部 children 数量:', cardInstance.children.length);
console.log('子元素 1:', JSON.stringify(cardInstance.children[0]));
console.log('子元素 2:', JSON.stringify(cardInstance.children[1]));

// ---- 5. 单向数据流：父 → 子 → 孙 ----
function GrandChild(props) {
  return h('span', null, '收到：' + props.message);
}
function Child(props) {
  return h('div', null, h(GrandChild, { message: props.message }));
}
function Parent() {
  const msg = '来自父组件';  // 父组件的"state"
  return h('section', null, h(Child, { message: msg }));
}
console.log('\\n=== 5. 单向数据流（父→子→孙） ===');
const tree = render(h(Parent, {}));
console.log('最终渲染树:', JSON.stringify(tree, null, 2));

// ---- 6. 组合模式：用 children 拼接 ----
function Layout(props) {
  return h('div', null,
    h('header', null, ...props.header),
    h('main', null, ...props.children),
    h('footer', null, ...props.footer)
  );
}
const layout = render(h(Layout, {
  header: [h('h1', null, '顶部导航')],
  footer: [h('p', null, '底部信息')],
}, h('p', null, '主内容')));
console.log('\\n=== 6. 组合模式 ===');
console.log('Layout 子节点数:', layout.children.length);
console.log('header:', JSON.stringify(layout.children[0]));
console.log('main:', JSON.stringify(layout.children[1]));
console.log('footer:', JSON.stringify(layout.children[2]));

// ---- 7. 类组件 vs 函数组件（演示等价性） ----
// 函数组件
function FuncCounter(props) {
  return h('div', null, 'Count: ' + props.count);
}
// 类组件模拟（用 class 语法）
class ClassCounter {
  constructor(props) { this.props = props; }
  render() { return h('div', null, 'Count: ' + this.props.count); }
}
console.log('\\n=== 7. 函数组件 vs 类组件 ===');
const fEl = render(h(FuncCounter, { count: 10 }));
const cInst = new ClassCounter({ count: 10 });
const cEl = cInst.render();
console.log('函数组件输出:', JSON.stringify(fEl));
console.log('类组件输出  :', JSON.stringify(cEl));
console.log('两者等价：', JSON.stringify(fEl) === JSON.stringify(cEl) ? '✓' : '✗');

// ---- 关键要点总结 ----
console.log('\\n=== 组件与 Props 核心要点 ===');
console.log('1. 函数组件是现代主流，类组件仅维护老项目用');
console.log('2. Props 是父组件传给子组件的输入，单向流动');
console.log('3. Props 只读不可变，要变用 state');
console.log('4. 解构 + 默认值让 props 更易用');
console.log('5. children 是特殊 prop，让组件成为容器');
console.log('6. 组合优于继承，用 children 拼接 UI');
`,
  },

  // =========================================================
  // 第三十章：Props 类型定义全解
  // =========================================================
  {
    id: "tspro-props-types",
    group: "五、React 基础与组件",
    icon: "📜",
    title: "Props 类型定义全解（TS）",
    content: `# 第三十章：Props 类型定义全解（TS）

## 30.1 为什么 Props 类型很重要

没有类型的 props 是一场灾难：调用方不知道要传什么、传错了运行时才报错、组件改名后调用方不知道。TypeScript 给 props 加上**类型契约**，编译期就拦截错误。

\`\`\`tsx
// 纯 JS：调用方根本不知道要传什么
function UserCard(props) {
  return <div>{props.name} - {props.age}</div>;
}
<UserCard name={123} age="twenty" />  // 运行时显示异常

// TS：props 是契约
type UserCardProps = { name: string; age: number };
function UserCard({ name, age }: UserCardProps) {
  return <div>{name} - {age}</div>;
}
<UserCard name={123} age="twenty" />  // ❌ 编译期报错
\`\`\`

## 30.2 type vs interface 定义 Props

两种写法都可以，区别很小：

\`\`\`tsx
// 1. type 别名（推荐用于 Props）
type ButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

// 2. interface
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button(props: ButtonProps) { /* ... */ }
\`\`\`

**选择建议**：

| 维度 | type | interface |
| --- | --- | --- |
| 写法 | 对象字面量 | 接口声明 |
| 联合类型 | ✅ 支持 | ❌ 不支持 |
| 扩展 | \`type A = B & C\` | \`interface A extends B\` |
| 同名合并 | ❌ 报错 | ✅ 自动合并 |
| 推荐 | React Props 首选 | 库 API / 类类型 |

React Props 推荐 \`type\`，因为更灵活（支持联合、交叉）、更简洁。

## 30.3 可选属性与默认值

\`?\` 标记可选属性：

\`\`\`tsx
type InputProps = {
  value: string;          // 必填
  placeholder?: string;   // 可选
  disabled?: boolean;     // 可选
};

function Input({ value, placeholder, disabled }: InputProps) {
  return <input value={value} placeholder={placeholder} disabled={disabled} />;
}

// 调用：可不传可选属性
<Input value="hello" />
<Input value="hello" placeholder="输入..." disabled={true} />
\`\`\`

**可选 vs 默认值**：

\`\`\`tsx
// 可选 + 默认值
type ButtonProps = {
  type?: 'button' | 'submit' | 'reset';  // 可选
  disabled?: boolean;                     // 可选
};

function Button({ type = 'button', disabled = false }: ButtonProps) {
  // type 默认 'button'，disabled 默认 false
  return <button type={type} disabled={disabled} />;
}
\`\`\`

注意：**有默认值的属性在类型里仍标记为可选**，因为调用方可以不传。

## 30.4 字面量联合类型

限制属性只能取特定值：

\`\`\`tsx
type ButtonProps = {
  variant: 'primary' | 'secondary' | 'danger';  // 三选一
  size: 'sm' | 'md' | 'lg';                     // 三选一
};

function Button({ variant, size }: ButtonProps) { /* ... */ }

<Button variant="primary" size="md" />      // ✅
<Button variant="primary" size="medium" />  // ❌ 'medium' 不在联合里
<Button variant="info" size="md" />         // ❌ 'info' 不在联合里
\`\`\`

字面量联合让组件 API **自描述**——IDE 自动提示可选值，写错立即报错。

## 30.5 函数 prop 类型

事件回调是常见的函数 prop：

\`\`\`tsx
type CounterProps = {
  onClick: () => void;                    // 无参无返回
  onChange: (value: string) => void;      // 带参
  onValidate: (value: string) => boolean; // 带返回值
  async onSubmit: () => Promise<void>;    // 异步函数（语法上要写成 onSubmit 类型）
};

// 完整写法
type CounterProps = {
  onSubmit: () => Promise<void>;
};

function Counter({ onSubmit }: CounterProps) {
  return <button onClick={onSubmit}>提交</button>;
}
\`\`\`

**事件处理函数**类型有专门类型（下一章详讲）：

\`\`\`tsx
import { MouseEvent, ChangeEvent } from 'react';

type InputProps = {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
};
\`\`\`

## 30.6 children 类型

\`children\` 的类型有几种选择：

\`\`\`tsx
import { ReactNode, ReactElement, ReactChild } from 'react';

// 1. ReactNode：最宽松，可以是任意可渲染内容
type CardProps = { children: ReactNode };
// ReactNode = string | number | boolean | null | undefined | ReactElement | ReactElement[]

// 2. ReactElement：只能是 React 元素（<div />）
type BoxProps = { children: ReactElement };
// ❌ <Box>hello</Box>  报错，hello 是 string 不是 ReactElement
// ✅ <Box><span>hi</span></Box>

// 3. ReactChild：string | number | ReactElement
type ItemProps = { children: ReactChild };

// 4. JSX.Element（等价 ReactElement）
type WrapperProps = { children: JSX.Element };
\`\`\`

**推荐用 \`ReactNode\`**，最宽松，能容纳所有可渲染内容。

\`\`\`tsx
import { ReactNode } from 'react';

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
}

// children 可以是任意内容
<Card title="A">字符串</Card>
<Card title="B"><p>元素</p></Card>
<Card title="C">{[<p key="1">1</p>, <p key="2">2</p>]}</Card>
<Card title="D">{null}</Card>
\`\`\`

## 30.7 React.ReactNode 与 React.ReactElement

\`\`\`tsx
import type { ReactNode, ReactElement, ReactFragment } from 'react';
\`ReactNode\` 与 \`ReactElement\` 的关系：

| 类型 | 范围 | 用途 |
| --- | --- | --- |
| \`ReactElement\` | 仅 React 元素（\`<div />\`） | 严格要求子节点是元素 |
| \`ReactNode\` | 元素 + 字符串 + 数字 + null + 数组 | 一般 children 类型 |
| \`JSX.Element\` | 等价 \`ReactElement\` | 老写法，新代码用 ReactElement |

\`\`\`tsx
function Divider({ children }: { children: ReactElement }) {
  return <div>{children}</div>;
}

// ✅ 合法
<Divider><span>hi</span></Divider>

// ❌ 报错
<Divider>hi</Divider>
<Divider>{null}</Divider>
\`\`\`

## 30.8 React.CSSProperties

样式对象的类型用 \`React.CSSProperties\`：

\`\`\`tsx
import { CSSProperties } from 'react';

type BoxProps = {
  style: CSSProperties;
  className?: string;
};

function Box({ style, className }: BoxProps) {
  return <div style={style} className={className} />;
}

<Box style={{ color: 'red', fontSize: 14, padding: '8px' }} />
\`\`\`

\`CSSProperties\` 限制样式属性名和值都合法：

\`\`\`tsx
const style: CSSProperties = {
  color: 'red',           // ✅
  fontSize: 14,           // ✅ number 自动加 px
  // fontsize: 14,        // ❌ 应该是 fontSize（驼峰）
  // color: 'reddd',      // ❌ 不是合法颜色值
  display: 'flex',        // ✅
  // display: 'flexx',    // ❌ 不是合法 display 值
};
\`\`\`

## 30.9 完整示例：一个真实组件的 Props

\`\`\`tsx
import { ReactNode, CSSProperties, MouseEvent } from 'react';

type ModalProps = {
  open: boolean;                                  // 是否显示
  title: string;                                  // 标题
  children: ReactNode;                            // 内容
  footer?: ReactNode;                             // 底部内容
  onClose: () => void;                            // 关闭回调
  onConfirm?: () => void;                         // 确认回调（可选）
  variant?: 'default' | 'warning' | 'danger';     // 样式变体
  width?: number | string;                        // 宽度
  style?: CSSProperties;                          // 自定义样式
  closeOnOverlayClick?: boolean;                  // 点击遮罩是否关闭
};

function Modal({
  open, title, children, footer,
  onClose, onConfirm,
  variant = 'default',
  width = 400,
  style,
  closeOnOverlayClick = true,
}: ModalProps) {
  if (!open) return null;
  return (
    <div className={'modal-overlay modal-' + variant} style={{ width, ...style }}>
      <div className="modal-header">
        <h2>{title}</h2>
        <button onClick={onClose}>×</button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  );
}
\`\`\`

## 30.10 小结

- \`type\` 和 \`interface\` 都能定义 Props，React 推荐 \`type\`
- 可选属性用 \`?\`，有默认值的属性仍标为可选
- 字面量联合（\`'a' | 'b'\`）让组件 API 自描述、防传错
- 函数 prop 写明参数和返回值类型，事件处理用专门的事件类型
- \`children\` 推荐 \`ReactNode\`，最宽松
- 样式用 \`React.CSSProperties\`，自动校验属性名和值
`,
    code: `// =============================================================
// 第 30 章 demo：Props 类型定义全解
// 沙箱支持 TS 类型注解，演示多种 Props 类型用法
// =============================================================

// ---- 1. type vs interface：定义 Props ----
type ButtonProps1 = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

interface ButtonProps2 {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

// 用 type 定义的 Props
const btn1: ButtonProps1 = {
  label: '提交',
  onClick: () => console.log('clicked'),
  disabled: false,
};
console.log('=== 1. type 定义 Props ===');
console.log('ButtonProps1:', JSON.stringify({ label: btn1.label, disabled: btn1.disabled }));

// ---- 2. 可选属性 + 默认值 ----
type InputProps = {
  value: string;
  placeholder?: string;       // 可选
  disabled?: boolean;         // 可选
  maxLength?: number;         // 可选
};

function createInput(props: InputProps) {
  // 解构 + 默认值
  const { value, placeholder = '请输入', disabled = false, maxLength = 100 } = props;
  return { value, placeholder, disabled, maxLength };
}

console.log('\\n=== 2. 可选 + 默认值 ===');
console.log('只传必填:', JSON.stringify(createInput({ value: 'hello' })));
console.log('全传:', JSON.stringify(createInput({
  value: 'hi', placeholder: '输入名字', disabled: true, maxLength: 50,
})));

// ---- 3. 字面量联合类型 ----
type AlertProps = {
  variant: 'info' | 'success' | 'warning' | 'danger';  // 四选一
  size: 'sm' | 'md' | 'lg';
};

function createAlert(props: AlertProps) {
  return { class: 'alert-' + props.variant + ' alert-' + props.size };
}

console.log('\\n=== 3. 字面量联合 ===');
console.log('primary/md:', JSON.stringify(createAlert({ variant: 'info', size: 'md' })));
console.log('danger/lg :', JSON.stringify(createAlert({ variant: 'danger', size: 'lg' })));

// ---- 4. 函数 prop 类型 ----
type EventHandler = {
  onClick: () => void;                          // 无参无返回
  onChange: (value: string) => void;            // 带参
  onValidate: (value: string) => boolean;       // 带返回值
  onSubmit: () => Promise<void>;                // 异步
};

const handlers: EventHandler = {
  onClick: () => console.log('  clicked'),
  onChange: (v) => console.log('  changed:', v),
  onValidate: (v) => v.length > 0,
  onSubmit: async () => { console.log('  submitting...'); },
};

console.log('\\n=== 4. 函数 prop 类型 ===');
handlers.onClick();
handlers.onChange('hello');
console.log('  validate(""):', handlers.onValidate(''));
console.log('  validate("x"):', handlers.onValidate('x'));

// ---- 5. children 类型：ReactNode 模拟 ----
// ReactNode = string | number | boolean | null | undefined | ReactElement | ReactElement[]
type ReactNode = string | number | boolean | null | undefined | { type: string; props: any };

function renderChildren(children: ReactNode): string {
  if (children == null || typeof children === 'boolean') return '';  // 不渲染
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (typeof children === 'object' && children !== null) {
    return '<' + children.type + '>';  // 简化
  }
  return '';
}

console.log('\\n=== 5. children 类型（ReactNode） ===');
console.log('string:', renderChildren('hello'));
console.log('number:', renderChildren(42));
console.log('null  :', renderChildren(null));
console.log('false :', renderChildren(false));
console.log('element:', renderChildren({ type: 'span', props: {} }));

// ---- 6. React.CSSProperties 模拟 ----
type CSSProperties = {
  color?: string;
  fontSize?: number | string;
  margin?: number | string;
  padding?: number | string;
  display?: 'block' | 'inline' | 'flex' | 'grid';
};

const style1: CSSProperties = {
  color: 'red',
  fontSize: 14,        // number 自动加 px
  padding: '8px',
  display: 'flex',
};
console.log('\\n=== 6. CSSProperties ===');
console.log('合法样式:', JSON.stringify(style1));

// ---- 7. 完整组件 Props 示例 ----
type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  variant?: 'default' | 'warning' | 'danger';
  width?: number | string;
  closeOnOverlayClick?: boolean;
};

function Modal(props: ModalProps) {
  const {
    open, title, children, footer,
    onClose, onConfirm,
    variant = 'default',
    width = 400,
    closeOnOverlayClick = true,
  } = props;

  if (!open) return { type: 'null', props: {} };
  return {
    type: 'div',
    props: {
      className: 'modal modal-' + variant,
      style: { width: typeof width === 'number' ? width + 'px' : width },
      children: [
        { type: 'h2', props: { children: title } },
        { type: 'div', props: { children: children } },
        footer ? { type: 'div', props: { children: footer } } : null,
      ],
      onClose: onClose,
      onConfirm: onConfirm,
      closeOnOverlayClick: closeOnOverlayClick,
    },
  };
}

console.log('\\n=== 7. 完整 Modal 组件 ===');
const modal = Modal({
  open: true,
  title: '确认删除？',
  children: '此操作不可恢复',
  onClose: () => console.log('close'),
  onConfirm: () => console.log('confirm'),
  variant: 'danger',
  width: 500,
});
console.log('Modal 结构:', JSON.stringify(modal, null, 2));

// ---- 8. 类型守卫：基于 variant 收窄 ----
type ButtonProps3 =
  | { variant: 'link'; href: string; label: string }       // 链接按钮
  | { variant: 'button'; onClick: () => void; label: string };  // 普通按钮

function renderButton(props: ButtonProps3) {
  if (props.variant === 'link') {
    // 这里 props 类型收窄为 { variant: 'link'; href: string; label: string }
    return '<a href="' + props.href + '">' + props.label + '</a>';
  } else {
    // 这里 props 类型收窄为 { variant: 'button'; onClick: () => void; label: string }
    return '<button onclick="handler">' + props.label + '</button>';
  }
}

console.log('\\n=== 8. 可辨识联合 + 类型收窄 ===');
console.log(renderButton({ variant: 'link', href: '/home', label: '首页' }));
console.log(renderButton({ variant: 'button', onClick: () => {}, label: '提交' }));

// ---- 关键要点总结 ----
console.log('\\n=== Props 类型核心要点 ===');
console.log('1. type 与 interface 都可定义 Props，推荐 type');
console.log('2. 可选用 ?，有默认值的属性仍标为可选');
console.log('3. 字面量联合让 API 自描述：variant: "primary" | "danger"');
console.log('4. 函数 prop 写明参数和返回值类型');
console.log('5. children 推荐 ReactNode，最宽松');
console.log('6. 样式用 React.CSSProperties，自动校验');
console.log('7. 可辨识联合 + 类型守卫实现多形态组件');
`,
  },

  // =========================================================
  // 第三十一章：State 与 useState
  // =========================================================
  {
    id: "tspro-state-usestate",
    group: "五、React 基础与组件",
    icon: "📊",
    title: "State 与 useState",
    content: `# 第三十一章：State 与 useState

## 31.1 为什么需要 State

Props 是父组件传进来的"外部输入"，**只读不可变**。但组件内部有些数据需要自己管、能变化，比如：

- 计数器的数字
- 输入框的文字
- 弹窗的开关
- 选项卡的当前选中

这种"组件内部、可变、变化要触发重新渲染"的数据，就是 **state**。

\`\`\`tsx
import { useState } from 'react';

function Counter() {
  // 声明一个 state：count 是当前值，setCount 是更新函数
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>当前：{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
\`\`\`

**Props vs State**：

| 维度 | Props | State |
| --- | --- | --- |
| 来源 | 父组件传入 | 组件内部创建 |
| 可变性 | 只读 | 可变（通过 setter） |
| 触发渲染 | 父组件改了就渲染 | setter 调用就渲染 |
| 作用域 | 跨组件共享 | 组件内部私有 |

## 31.2 useState 用法

\`\`\`tsx
const [state, setState] = useState(initialValue);
\`\`\`

- \`initialValue\`：初始值（任意类型）
- \`state\`：当前值
- \`setState\`：更新函数，传新值触发重新渲染

\`\`\`tsx
// 数字
const [count, setCount] = useState(0);

// 字符串
const [name, setName] = useState('Alice');

// 布尔
const [open, setOpen] = useState(false);

// 对象
const [user, setUser] = useState({ name: 'Bob', age: 25 });

// 数组
const [list, setList] = useState([1, 2, 3]);

// null（后续会赋值）
const [data, setData] = useState(null);
\`\`\`

**多个 state 用多个 useState**，不要塞一个对象（除非相关性强）：

\`\`\`tsx
// ✅ 推荐：独立 state
const [name, setName] = useState('');
const [age, setAge] = useState(0);
const [email, setEmail] = useState('');

// ⚠️ 也可以合并，但更新时要展开
const [form, setForm] = useState({ name: '', age: 0, email: '' });
setForm({ ...form, name: 'Alice' });  // 必须展开旧值
\`\`\`

## 31.3 State 更新是异步的

\`\`\`tsx\` 调用后，state **不会立即变化**，而是被加入更新队列，下次渲染时才生效：

\`\`\`tsx
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    console.log(count);  // 还是旧值 0！
    setCount(count + 1);
    console.log(count);  // 还是 0
  };

  return <button onClick={handleClick}>{count}</button>;
}
\`\`\`

React 这样设计是为了**批量更新**——多次 setState 合并成一次渲染，提升性能。

**坑：连续调用同一个 setState 会被合并**：

\`\`\`tsx
const handleClick = () => {
  setCount(count + 1);  // 期望变成 1
  setCount(count + 1);  // 期望变成 2
  setCount(count + 1);  // 期望变成 3
  // 实际结果：count 只变成 1（三次都基于同一个旧值 0）
};
\`\`\`

## 31.4 函数式更新

要基于前一个 state 计算新 state，用**函数式更新**：

\`\`\`tsx
const handleClick = () => {
  setCount(prev => prev + 1);  // prev 是最新的 state
  setCount(prev => prev + 1);
  setCount(prev => prev + 1);
  // 结果：count 变成 3（每次基于最新值）
};
\`\`\`

\`setCount(prev => prev + 1)\` 里的函数接收最新 state，返回新 state。React 会按顺序处理队列里的更新函数。

**何时用函数式更新**：

- 新 state 依赖旧 state 时
- 连续多次更新同一个 state 时
- 在异步回调（setTimeout、Promise.then）里更新时

\`\`\`tsx
// ❌ 闭包陷阱：拿到的是旧的 count
useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1);  // count 永远是 0
  }, 1000);
  return () => clearInterval(timer);
}, []);

// ✅ 用函数式更新
useEffect(() => {
  const timer = setInterval(() => {
    setCount(prev => prev + 1);  // 始终基于最新值
  }, 1000);
  return () => clearInterval(timer);
}, []);
\`\`\`

## 31.5 对象/数组更新：必须返回新对象

React 用 **Object.is** 判断 state 是否变化。直接修改对象/数组的属性，引用没变，React 不会触发渲染：

\`\`\`tsx
const [user, setUser] = useState({ name: 'Alice', age: 25 });

// ❌ 错：直接改属性，引用没变，不触发渲染
user.age = 26;
setUser(user);

// ✅ 对：返回新对象
setUser({ ...user, age: 26 });

// ✅ 或用 Object.assign
setUser(Object.assign({}, user, { age: 26 }));
\`\`\`

**数组同理**：

\`\`\`tsx
const [list, setList] = useState([1, 2, 3]);

// ❌ 错：push 修改原数组，引用没变
list.push(4);
setList(list);

// ✅ 对：返回新数组
setList([...list, 4]);              // 添加
setList(list.filter(x => x !== 2)); // 删除
setList(list.map(x => x * 2));      // 修改
\`\`\`

**不可变更新（immutable update）**的核心：永远不修改原数据，而是创建新数据。这让 React 能高效比对变化。

\`\`\`tsx
// 嵌套对象更新（推荐用 immer 库简化）
const [state, setState] = useState({
  user: { name: 'Alice', address: { city: 'Beijing' } },
});

// ❌ 错：直接改嵌套属性
state.user.address.city = 'Shanghai';

// ✅ 对：浅拷贝每一层
setState({
  ...state,
  user: {
    ...state.user,
    address: { ...state.user.address, city: 'Shanghai' },
  },
});
\`\`\`

## 31.6 闭包陷阱

函数组件每次渲染都会**重新创建函数**，这些函数捕获的是**当次渲染时的 state 值**。如果回调被延迟执行（定时器、事件监听），它会拿到旧的 state：

\`\`\`tsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count);  // 永远是 0（闭包捕获了初始渲染的 count）
      setCount(count + 1); // 永远设置成 1
    }, 1000);
    return () => clearInterval(timer);
  }, []);  // 空依赖，effect 只执行一次

  return <p>{count}</p>;
}
\`\`\`

**三种解决方案**：

\`\`\`tsx
// 方案 1：函数式更新（最简单）
setCount(prev => prev + 1);

// 方案 2：把 count 加入依赖（effect 会重新执行，定时器重建）
useEffect(() => {
  const timer = setInterval(() => setCount(count + 1), 1000);
  return () => clearInterval(timer);
}, [count]);

// 方案 3：用 ref 保存最新值
const countRef = useRef(count);
countRef.current = count;
useEffect(() => {
  const timer = setInterval(() => setCount(countRef.current + 1), 1000);
  return () => clearInterval(timer);
}, []);
\`\`\`

## 31.7 Lazy Initialization（惰性初始化）

如果初始值需要复杂计算，用函数形式避免每次渲染都重算：

\`\`\`tsx
// ❌ 错：每次渲染都执行 expensiveCompute（即使结果被丢弃）
const [data, setData] = useState(expensiveCompute());

// ✅ 对：惰性初始化，只在首次渲染时执行
const [data, setData] = useState(() => expensiveCompute());
\`\`\`

\`useState\` 接收函数时，**只在首次渲染时调用一次**，后续渲染忽略。

\`\`\`tsx
// 从 localStorage 读初始值（只读一次）
const [token, setToken] = useState(() => {
  return localStorage.getItem('token') || '';
});

// 大数据初始化
const [matrix, setMatrix] = useState(() => {
  return Array.from({ length: 1000 }, () => new Array(1000).fill(0));
});
\`\`\`

## 31.8 实际项目中的 State 设计

1. **state 最小化**：能从其他 state 推导的，不要单独存
2. **state 拆分粒度**：相关数据合并，不相关数据分开
3. **状态提升**：多个组件共享的 state，提升到最近公共父组件
4. **复杂状态用 useReducer**：状态转换逻辑复杂时，比 useState 更清晰

\`\`\`tsx
// ❌ 反例：firstName 和 lastName 能推导出 fullName，不要存
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [fullName, setFullName] = useState('');  // 多余！

// ✅ 正例：只存基础数据，fullName 计算得出
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const fullName = firstName + ' ' + lastName;
\`\`\`

## 31.9 小结

- state 是组件内部可变数据，变化触发重新渲染
- \`useState\` 返回 \`[值, 更新函数]\`，更新是异步的、批量的
- 新 state 依赖旧 state 时用**函数式更新**：\`setCount(prev => prev + 1)\`
- 对象/数组更新必须**返回新引用**，否则不触发渲染
- 闭包陷阱：延迟回调拿到旧 state，用函数式更新或 ref 解决
- 复杂初始值用**惰性初始化**：\`useState(() => init())\`
`,
    code: `// =============================================================
// 第 31 章 demo：State 与 useState
// 模拟 useState 实现，演示各种使用场景
// =============================================================

// ---- 1. 模拟 useState 实现（简化版） ----
// React 真实用 Hook 链表，这里用闭包变量模拟
function createUseState() {
  let stateValue;                              // 保存 state
  let isFirstCall = true;                      // 是否首次渲染

  function useState(initialValue) {
    if (isFirstCall) {
      // 首次：用 initialValue 初始化
      stateValue = typeof initialValue === 'function'
        ? initialValue()                       // 惰性初始化
        : initialValue;
      isFirstCall = false;
    }
    // 返回 [当前值, 更新函数]
    const setter = (newVal) => {
      stateValue = typeof newVal === 'function'
        ? newVal(stateValue)                   // 函数式更新
        : newVal;
      console.log('  [setState] 内部 state 已更新为:', stateValue);
    };
    return [stateValue, setter];
  }

  // 重置（模拟重新挂载）
  function reset() { isFirstCall = true; stateValue = undefined; }
  return { useState, reset };
}

// ---- 2. 基础用法：数字 state ----
console.log('=== 1. 基础 useState ===');
const { useState: us1, reset: r1 } = createUseState();

function Counter_render() {
  const [count, setCount] = us1(0);  // 初始值 0
  console.log('  渲染时 count =', count);
  return { count, setCount };
}

let counter = Counter_render();                // 首次渲染
counter.setCount(5);                           // 更新
counter = Counter_render();                    // 重新渲染
console.log('  重新渲染后 count =', counter.count);

// ---- 3. 异步更新演示：连续 setState 合并 ----
console.log('\\n=== 2. 连续 setState 的坑 ===');
r1();
const { useState: us2 } = createUseState();
const [c, setC] = us2(0);

// ❌ 直接用旧值，三次都基于 0
setC(c + 1);  // 0 + 1 = 1
setC(c + 1);  // 0 + 1 = 1（c 还是 0）
setC(c + 1);  // 0 + 1 = 1
console.log('  直接用旧值：', '最终是 1（三次都基于 c=0）');

// ✅ 函数式更新
r1();
const [c2, setC2] = us2(0);
setC2(prev => prev + 1);  // 0 + 1 = 1
setC2(prev => prev + 1);  // 1 + 1 = 2
setC2(prev => prev + 1);  // 2 + 1 = 3
console.log('  函数式更新：', '最终是 3（每次基于最新值）');

// ---- 4. 对象 state：必须返回新对象 ----
console.log('\\n=== 3. 对象 state 不可变更新 ===');
r1();
const { useState: us3 } = createUseState();
const [user, setUser] = us3({ name: 'Alice', age: 25 });

// ❌ 直接改属性（引用没变，React 不触发渲染）
const badUser = user;
badUser.age = 26;
console.log('  直接改：user === badUser?', user === badUser, '（引用没变，不触发渲染）');

// ✅ 返回新对象
const goodUser = { ...user, age: 26 };
console.log('  浅拷贝：user === goodUser?', user === goodUser, '（引用变了，触发渲染）');
setUser({ ...user, age: 27 });
console.log('  setUser 后：', JSON.stringify(user));

// ---- 5. 数组 state：不可变操作 ----
console.log('\\n=== 4. 数组 state 不可变操作 ===');
r1();
const { useState: us4 } = createUseState();
const [list, setList] = us4([1, 2, 3]);

// 添加：[...list, item]
setList([...list, 4]);
console.log('  添加 4:', JSON.stringify(list));

// 删除：filter
setList(list.filter(x => x !== 2));
console.log('  删除 2:', JSON.stringify(list));

// 修改：map
setList(list.map(x => x === 3 ? 30 : x));
console.log('  3→30:', JSON.stringify(list));

// ---- 6. 嵌套对象更新 ----
console.log('\\n=== 5. 嵌套对象更新 ===');
r1();
const { useState: us5 } = createUseState();
const [state, setState] = us5({
  user: { name: 'Alice', address: { city: 'Beijing' } },
});

// ❌ 错：直接改嵌套
// state.user.address.city = 'Shanghai';

// ✅ 对：浅拷贝每一层
setState({
  ...state,
  user: {
    ...state.user,
    address: { ...state.user.address, city: 'Shanghai' },
  },
});
console.log('  更新后:', JSON.stringify(state));

// ---- 7. 惰性初始化 ----
console.log('\\n=== 6. 惰性初始化 ===');
r1();
let computeCount = 0;
function expensiveCompute() {
  computeCount++;
  console.log('  [expensiveCompute 被调用]');
  return { data: [1, 2, 3, 4, 5] };
}

// ✅ 传函数：只首次渲染时执行一次
const { useState: us6 } = createUseState();
const [data1] = us6(expensiveCompute);         // 传函数引用，不立即调用
console.log('  首次渲染后 computeCount =', computeCount);
const [data2] = us6(expensiveCompute);         // 第二次渲染，不执行
console.log('  二次渲染后 computeCount =', computeCount);

// ---- 8. 闭包陷阱模拟 ----
console.log('\\n=== 7. 闭包陷阱 ===');
r1();
const { useState: us7 } = createUseState();
const [count7, setCount7] = us7(0);

// 模拟 setInterval 回调（捕获了首次渲染的 count=0）
function setupBadTimer() {
  const captured = count7;  // 闭包捕获
  setTimeout(() => {
    console.log('  ❌ 闭包里的 count =', captured, '（永远是 0）');
    setCount7(captured + 1);  // 永远设置成 1
  }, 10);
}
setupBadTimer();

// ✅ 用函数式更新避免闭包陷阱
function setupGoodTimer() {
  setTimeout(() => {
    setCount7(prev => {
      console.log('  ✅ 函数式更新 prev =', prev);
      return prev + 1;
    });
  }, 20);
}
setupGoodTimer();

// ---- 关键要点总结 ----
setTimeout(() => {
  console.log('\\n=== State 与 useState 核心要点 ===');
  console.log('1. state 是组件内部可变数据，变化触发重新渲染');
  console.log('2. setState 是异步的、批量的，不会立即更新');
  console.log('3. 新 state 依赖旧 state 时用函数式更新：setX(prev => prev + 1)');
  console.log('4. 对象/数组更新必须返回新引用（不可变更新）');
  console.log('5. 闭包陷阱：延迟回调拿到旧值，用函数式更新或 ref 解决');
  console.log('6. 复杂初始值用惰性初始化：useState(() => init())');
}, 50);
`,
  },

  // =========================================================
  // 第三十二章：事件处理
  // =========================================================
  {
    id: "tspro-events",
    group: "五、React 基础与组件",
    icon: "⚡",
    title: "事件处理",
    content: `# 第三十二章：事件处理

## 32.1 为什么 React 要包装事件

原生 DOM 事件有几个痛点：

1. **浏览器兼容性**：IE 与标准浏览器事件 API 不一致
2. **内存泄漏**：手动 \`addEventListener\` 容易忘记 \`removeEventListener\`
3. **事件冒泡控制混乱**：\`e.stopPropagation\` 在不同浏览器行为有差异
4. **性能**：每个元素绑一个监听器，列表多了内存占用大

React 给出了 **SyntheticEvent（合成事件）**：包装原生事件，统一 API，并在根节点用**事件委托**统一处理。

\`\`\`tsx
// 原生 DOM
const btn = document.querySelector('button');
btn.addEventListener('click', (e) => { /* e 是原生 MouseEvent */ });

// React
<button onClick={(e) => { /* e 是 SyntheticEvent */ }}>点击</button>
\`\`\`

## 32.2 React 事件 vs DOM 事件

| 维度 | 原生 DOM | React |
| --- | --- | --- |
| 绑定方式 | \`addEventListener\` | JSX 属性 \`onClick\` |
| 事件名 | 全小写 \`click\` | 驼峰 \`onClick\` |
| 事件对象 | 原生 Event | SyntheticEvent（包装） |
| this 指向 | 元素 / 视绑定方式 | 视组件类型（函数组件无此问题） |
| 委托 | 手动 | 自动（根节点委托） |
| 解绑 | 手动 \`removeEventListener\` | 自动（组件卸载时清理） |

\`\`\`tsx
// 原生：onclick 全小写，函数引用
<button onclick="handleClick()">点击</button>

// React：onClick 驼峰，传函数引用（不调用）
<button onClick={handleClick}>点击</button>
<button onClick={() => handleClick()}>点击</button>
\`\`\`

**注意**：\`onClick={handleClick}\` 传函数引用，不要写 \`onClick={handleClick()}\`（这样会立即执行）。

## 32.3 事件类型

React 为每种事件提供了对应的类型：

\`\`\`tsx
import {
  MouseEvent,
  ChangeEvent,
  KeyboardEvent,
  FormEvent,
  FocusEvent,
  DragEvent,
  ClipboardEvent,
  WheelEvent,
  AnimationEvent,
  TransitionEvent,
} from 'react';
\`\`\`

**常用事件类型**：

| 事件 | 类型 | 触发场景 |
| --- | --- | --- |
| \`onClick\` | \`MouseEvent<HTMLButtonElement>\` | 点击 |
| \`onChange\` | \`ChangeEvent<HTMLInputElement>\` | 输入框变化 |
| \`onKeyDown\` | \`KeyboardEvent<HTMLInputElement>\` | 按键按下 |
| \`onSubmit\` | \`FormEvent<HTMLFormElement>\` | 表单提交 |
| \`onFocus\` | \`FocusEvent<HTMLInputElement>\` | 获得焦点 |
| \`onBlur\` | \`FocusEvent<HTMLInputElement>\` | 失去焦点 |
| \`onMouseEnter\` | \`MouseEvent<HTMLDivElement>\` | 鼠标进入 |
| \`onScroll\` | \`UIEvent<HTMLDivElement>\` | 滚动 |

## 32.4 事件处理函数的泛型参数

事件类型都带泛型，泛型参数是**触发事件的元素类型**：

\`\`\`tsx
function handleClick(e: MouseEvent<HTMLButtonElement>) {
  // e.currentTarget 类型是 HTMLButtonElement
  console.log(e.currentTarget.tagName);  // "BUTTON"
}

function handleChange(e: ChangeEvent<HTMLInputElement>) {
  // e.target 类型是 HTMLInputElement
  console.log(e.target.value);  // 输入框的值
}

function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();  // 阻止表单默认提交
  // e.currentTarget 是 HTMLFormElement
}

<button onClick={handleClick}>Click</button>
<input onChange={handleChange} />
<form onSubmit={handleSubmit} />
\`\`\`

泛型参数的作用：让 \`e.currentTarget\` 和 \`e.target\` 有准确的类型，能访问特定属性（如 \`HTMLInputElement.value\`）。

\`\`\`tsx
// 没有泛型：e.currentTarget 是泛型 Element，访问 value 报错
function bad(e: React.SyntheticEvent) {
  // e.currentTarget.value;  // ❌ Element 没有 value 属性
}

// 有泛型：e.currentTarget 是 HTMLInputElement，有 value
function good(e: ChangeEvent<HTMLInputElement>) {
  console.log(e.currentTarget.value);  // ✅
}
\`\`\`

## 32.5 e.currentTarget vs e.target

两个容易混淆的属性：

- **e.target**：触发事件的**真实元素**（可能是子元素）
- **e.currentTarget**：**绑定事件监听器的元素**（永远是当前组件）

\`\`\`tsx
function Box() {
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    console.log('target:', e.target);         // 可能是 button 或 span
    console.log('currentTarget:', e.currentTarget);  // 永远是 div
  };

  return (
    <div onClick={handleClick}>
      <button>按钮</button>
      <span>文字</span>
    </div>
  );
}

// 点击 button：target=button, currentTarget=div
// 点击 span：target=span, currentTarget=div
// 点击 div 空白处：target=div, currentTarget=div
\`\`\`

**事件冒泡**：点击子元素，事件会冒泡到父元素。父元素的 \`onClick\` 也会触发，此时 \`e.target\` 是子元素，\`e.currentTarget\` 是父元素。

\`\`\`tsx
function Parent() {
  return (
    <div onClick={() => console.log('父元素被点击')}>
      <button onClick={(e) => {
        e.stopPropagation();  // 阻止冒泡，父元素 onClick 不会触发
        console.log('按钮被点击');
      }}>
        点击
      </button>
    </div>
  );
}
\`\`\`

## 32.6 阻止默认行为

\`e.preventDefault()\` 阻止浏览器默认行为：

\`\`\`tsx
function Form() {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();  // 阻止表单默认提交（避免页面刷新）
    console.log('表单提交');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" />
      <button type="submit">提交</button>
    </form>
  );
}

// 其他常见场景
<a href="/external" onClick={(e) => {
  e.preventDefault();  // 阻止链接跳转
  // 自定义跳转逻辑
}}>外链</a>

<input
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault();  // 阻止回车换行
      submit();
    }
  }}
/>
\`\`\`

**preventDefault vs stopPropagation**：

| 方法 | 作用 |
| --- | --- |
| \`e.preventDefault()\` | 阻止默认行为（如表单提交、链接跳转） |
| \`e.stopPropagation()\` | 阻止事件冒泡（父元素监听器不触发） |
| \`e.stopImmediatePropagation()\` | 阻止冒泡 + 同元素其他监听器也不触发 |

## 32.7 事件处理函数的几种写法

\`\`\`tsx
function Counter() {
  const [count, setCount] = useState(0);

  // 1. 内联箭头函数（简单场景）
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={(e) => setCount(count + 1)}>+1</button>
    </div>
  );
}

// 2. 组件内定义函数（需要复用或逻辑复杂）
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    setCount(count + 1);
    console.log(e.currentTarget.tagName);
  };

  return <button onClick={handleClick}>+1</button>;
}

// 3. 提取到组件外（纯函数，不依赖组件 state）
const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
  console.log('clicked', e.currentTarget);
};

function Button() {
  return <button onClick={handleClick}>Click</button>;
}
\`\`\`

## 32.8 实际项目中的事件处理

1. **事件类型用泛型**：\`MouseEvent<HTMLButtonElement>\` 比 \`any\` 安全
2. **复用的事件处理函数提到组件外**：避免每次渲染重建
3. **表单用 onSubmit 而非 button onClick**：支持回车提交
4. **列表点击用 data 属性传值**：避免闭包陷阱

\`\`\`tsx
// ❌ 每个列表项都创建新函数
{list.map(item => (
  <li key={item.id} onClick={() => handleClick(item.id)}>{item.name}</li>
))}

// ✅ 用 data-* 属性，统一一个处理函数
const handleListClick = (e: MouseEvent<HTMLUListElement>) => {
  const target = (e.target as HTMLElement).closest('li');
  if (!target) return;
  const id = target.dataset.id;
  handleClick(id);
};

<ul onClick={handleListClick}>
  {list.map(item => (
    <li key={item.id} data-id={item.id}>{item.name}</li>
  ))}
</ul>
\`\`\`

## 32.9 小结

- React 事件是 SyntheticEvent，包装原生事件统一 API
- 事件名用驼峰（\`onClick\`），传函数引用（\`onClick={fn}\`，不是 \`onClick={fn()}\`）
- 事件类型带泛型：\`MouseEvent<HTMLButtonElement>\` 让 \`currentTarget\` 有准确类型
- \`e.target\` 是真实触发元素，\`e.currentTarget\` 是绑定监听器的元素
- \`e.preventDefault()\` 阻止默认行为，\`e.stopPropagation()\` 阻止冒泡
- 复用函数提到组件外，列表用事件委托减少函数创建
`,
    code: `// =============================================================
// 第 32 章 demo：事件处理
// 模拟 5 种事件类型，演示 currentTarget vs target、阻止默认行为
// =============================================================

// ---- 1. 模拟事件对象 ----
// 真实 React: e 是 SyntheticEvent，包装原生事件
function createEvent(type, currentTarget, target, extra = {}) {
  return {
    type: type,                                  // 事件类型
    currentTarget: currentTarget,                // 绑定监听器的元素
    target: target,                              // 真实触发元素
    preventDefault() { console.log('  [preventDefault] 阻止默认行为'); },
    stopPropagation() { console.log('  [stopPropagation] 阻止冒泡'); },
    ...extra,                                    // 其他属性（如 value, key）
  };
}

// ---- 2. 模拟 5 种事件类型 ----
console.log('=== 1. 五种事件类型 ===');

// MouseEvent：鼠标点击
function handleClick(e) {
  console.log('  [MouseEvent]');
  console.log('    type:', e.type);
  console.log('    currentTarget.tagName:', e.currentTarget.tagName);
  console.log('    target.tagName:', e.target.tagName);
  console.log('    clientX:', e.clientX, 'clientY:', e.clientY);
}
const clickEvent = createEvent('click',
  { tagName: 'BUTTON' },
  { tagName: 'BUTTON' },
  { clientX: 100, clientY: 200 }
);
handleClick(clickEvent);

// ChangeEvent：输入框变化
function handleChange(e) {
  console.log('  [ChangeEvent]');
  console.log('    target.value:', e.target.value);
  console.log('    currentTarget.value:', e.currentTarget.value);
}
const changeEvent = createEvent('change',
  { tagName: 'INPUT', value: 'hello' },
  { tagName: 'INPUT', value: 'hello' }
);
handleChange(changeEvent);

// KeyboardEvent：按键
function handleKeyDown(e) {
  console.log('  [KeyboardEvent]');
  console.log('    key:', e.key);
  console.log('    code:', e.code);
  console.log('    ctrlKey:', e.ctrlKey);
}
const keyEvent = createEvent('keydown',
  { tagName: 'INPUT' },
  { tagName: 'INPUT' },
  { key: 'Enter', code: 'Enter', ctrlKey: false }
);
handleKeyDown(keyEvent);

// FormEvent：表单提交
function handleSubmit(e) {
  console.log('  [FormEvent]');
  e.preventDefault();  // 阻止表单默认提交
}
const submitEvent = createEvent('submit',
  { tagName: 'FORM' },
  { tagName: 'FORM' }
);
handleSubmit(submitEvent);

// FocusEvent：焦点
function handleFocus(e) {
  console.log('  [FocusEvent]');
  console.log('    target:', e.target.tagName);
}
const focusEvent = createEvent('focus',
  { tagName: 'INPUT' },
  { tagName: 'INPUT' }
);
handleFocus(focusEvent);

// ---- 3. currentTarget vs target ----
console.log('\\n=== 2. currentTarget vs target ===');

// 模拟事件冒泡：点击子元素，事件冒泡到父元素
function setupEventBubbling() {
  const parent = { tagName: 'DIV', children: [] };
  const button = { tagName: 'BUTTON', textContent: 'Click', parent: parent };
  const span = { tagName: 'SPAN', textContent: 'Hi', parent: parent };
  parent.children = [button, span];

  // 父元素监听 click（事件委托）
  parent.onClick = function(e) {
    console.log('  父元素 currentTarget:', e.currentTarget.tagName);
    console.log('  父元素 target      :', e.target.tagName);
    console.log('  → currentTarget 永远是绑监听器的元素');
    console.log('  → target 是真实触发的元素');
  };

  return { parent, button, span };
}

const { parent, button, span } = setupEventBubbling();

// 模拟点击 button
console.log('点击 button:');
const event1 = createEvent('click', parent, button);
parent.onClick(event1);

// 模拟点击 span
console.log('\\n点击 span:');
const event2 = createEvent('click', parent, span);
parent.onClick(event2);

// ---- 4. 阻止冒泡演示 ----
console.log('\\n=== 3. 阻止冒泡 ===');

function setupStopPropagation() {
  const parent2 = { tagName: 'DIV' };
  parent2.onClick = function(e) {
    console.log('  父元素 onClick 触发');
  };

  const button2 = { tagName: 'BUTTON', parent: parent2 };
  button2.onClick = function(e) {
    e.stopPropagation();  // 阻止冒泡
    console.log('  按钮 onClick 触发（已阻止冒泡）');
  };

  return { parent2, button2 };
}

const { parent2, button2 } = setupStopPropagation();

// 模拟点击 button，触发 button.onClick 后不冒泡到 parent
console.log('点击 button（带 stopPropagation）:');
button2.onClick(createEvent('click', button2, button2));
// 父元素 onClick 不会触发

// ---- 5. 事件委托：列表统一处理 ----
console.log('\\n=== 4. 事件委托（列表） ===');

function setupListDelegation() {
  const items = [
    { id: '1', name: '苹果' },
    { id: '2', name: '香蕉' },
    { id: '3', name: '橘子' },
  ];

  // ul 绑定一个 onClick，所有 li 的点击都冒泡到这里
  const ul = { tagName: 'UL', children: items.map(i => ({ ...i, tagName: 'LI', dataset: { id: i.id } })) };

  ul.onClick = function(e) {
    // 找到点击的 li（可能是 li 的子元素）
    const target = e.target;
    if (target.tagName === 'LI') {
      const id = target.dataset.id;
      const item = items.find(i => i.id === id);
      console.log('  点击了:', item.name, '(id=' + id + ')');
    }
  };

  return { ul, items };
}

const { ul, items } = setupListDelegation();
console.log('点击第 1 项:');
ul.onClick(createEvent('click', ul, { tagName: 'LI', dataset: { id: '1' } }));
console.log('点击第 2 项:');
ul.onClick(createEvent('click', ul, { tagName: 'LI', dataset: { id: '2' } }));

// ---- 6. TS 事件类型示例（用类型注解） ----
console.log('\\n=== 5. TypeScript 事件类型示例 ===');

// 模拟泛型参数：MouseEvent<HTMLButtonElement>
type MouseEvent<T> = {
  type: 'click';
  currentTarget: T;
  target: HTMLElement;
  preventDefault: () => void;
  stopPropagation: () => void;
};

type HTMLButtonElement = { tagName: 'BUTTON'; disabled: boolean };
type HTMLInputElement = { tagName: 'INPUT'; value: string };

// 泛型让 currentTarget 有准确类型
const btnHandler = (e: MouseEvent<HTMLButtonElement>) => {
  // e.currentTarget.disabled 可访问（HTMLButtonElement 有 disabled）
  console.log('  btnHandler: currentTarget.disabled =', e.currentTarget.disabled);
};

const inputHandler = (e: MouseEvent<HTMLInputElement>) => {
  // e.currentTarget.value 可访问
  console.log('  inputHandler: currentTarget.value =', e.currentTarget.value);
};

btnHandler({
  type: 'click',
  currentTarget: { tagName: 'BUTTON', disabled: false },
  target: { tagName: 'BUTTON' },
  preventDefault: () => {},
  stopPropagation: () => {},
});

// ---- 关键要点总结 ----
console.log('\\n=== 事件处理核心要点 ===');
console.log('1. React 事件是 SyntheticEvent，包装原生事件');
console.log('2. 事件名驼峰：onClick / onChange / onKeyDown / onSubmit');
console.log('3. 事件类型带泛型：MouseEvent<HTMLButtonElement>');
console.log('4. e.target 真实触发元素，e.currentTarget 绑监听器的元素');
console.log('5. preventDefault 阻止默认行为，stopPropagation 阻止冒泡');
console.log('6. 列表用事件委托：父元素绑一个 onClick，data-* 传值');
`,
  },

  // =========================================================
  // 第三十三章：条件渲染
  // =========================================================
  {
    id: "tspro-conditional-render",
    group: "五、React 基础与组件",
    icon: "🔀",
    title: "条件渲染",
    content: `# 第三十三章：条件渲染

## 33.1 为什么需要条件渲染

UI 经常需要根据状态显示不同内容：

- 用户登录显示头像，未登录显示登录按钮
- 数据加载中显示 spinner，加载完显示内容
- 弹窗 open 时显示，closed 时不显示
- 角色是 admin 显示管理菜单，普通用户隐藏

这种"根据条件决定渲染什么"的需求，就是**条件渲染**。

\`\`\`tsx
function Greeting({ isLogin, user }) {
  if (isLogin) {
    return <p>欢迎，{user.name}</p>;
  } else {
    return <p>请登录</p>;
  }
}
\`\`\`

## 33.2 三元表达式：二选一

最常用的条件渲染方式：

\`\`\`tsx
function Greeting({ isLogin }) {
  return (
    <div>
      {isLogin ? <p>欢迎回来</p> : <p>请登录</p>}
    </div>
  );
}
\`\`\`

**嵌套三元慎用**——可读性差：

\`\`\`tsx
// ❌ 嵌套三元，难读
{status === 'loading'
  ? <Spinner />
  : status === 'error'
    ? <Error />
    : status === 'success'
      ? <Data />
      : <Empty />}

// ✅ 用 if/else 或 switch 提取函数
function renderContent() {
  if (status === 'loading') return <Spinner />;
  if (status === 'error') return <Error />;
  if (status === 'success') return <Data />;
  return <Empty />;
}
\`\`\`

## 33.3 && 与 || 短路

\`\`\`tsx\` 适合"满足条件才显示"：

\`\`\`tsx
function Menu({ isAdmin, messages }) {
  return (
    <div>
      {isAdmin && <AdminButton />}
      {messages.length > 0 && <Badge count={messages.length} />}
    </div>
  );
}
\`\`\`

**坑：&& 左边是 0 会渲染出 "0"**：

\`\`\`tsx
const count = 0;
return <div>{count && <span>有数据</span>}</div>;  // 渲染出 "0"！

// 原因：0 是 falsy，但 0 本身会被渲染成字符串 "0"
// 修复：转成布尔
return <div>{count > 0 && <span>有数据</span>}</div>;  // false 不渲染
return <div>{!!count && <span>有数据</span>}</div>;    // 显式转布尔
return <div>{Boolean(count) && <span>有数据</span>}</div>;
\`\`\`

\`||\` 适合"前面为空用后面"：

\`\`\`tsx
function User({ name }) {
  return <p>{name || '匿名用户'}</p>;  // name 为空字符串/undefined/null 时显示"匿名用户"
}
\`\`\`

## 33.4 null / undefined / false 不渲染

JSX 里 \`null\`、\`undefined\`、\`false\`、\`true\` 都**不会渲染任何东西**：

\`\`\`tsx
function Empty() {
  return (
    <div>
      {null}        {/* 不渲染 */}
      {undefined}   {/* 不渲染 */}
      {false}       {/* 不渲染 */}
      {true}        {/* 不渲染 */}
      {<span>hi</span>}  {/* 渲染 */}
    </div>
  );
}
\`\`\`

注意：\`0\` 和 \`空字符串 ''\` **会被渲染**：

\`\`\`tsx
<div>{0}</div>      {/* 渲染出 "0" */}
<div>{''}</div>     {/* 渲染出空（但 DOM 节点存在） */}
\`\`\`

利用"null 不渲染"特性，让组件返回 null 表示"不显示"：

\`\`\`tsx
function Modal({ open, children }) {
  if (!open) return null;  // open 为 false 时返回 null，不渲染任何 DOM
  return <div className="modal">{children}</div>;
}
\`\`\`

## 33.5 组件返回 null

组件可以返回 \`null\` 表示"什么都不渲染"：

\`\`\`tsx
function Warning({ show, message }) {
  if (!show) return null;
  return <div className="warning">{message}</div>;
}

// 调用方不用判断
function App() {
  return (
    <div>
      <Warning show={false} message="错误" />  {/* 不渲染任何 DOM */}
      <p>正文</p>
    </div>
  );
}
\`\`\`

这种模式比"用 CSS 隐藏"更彻底——DOM 里完全没有这个节点。

## 33.6 IIFE 渲染

需要在 JSX 里写复杂逻辑（多分支、循环）时，用**立即执行函数**（IIFE）：

\`\`\`tsx
function Content({ status }) {
  return (
    <div>
      {(() => {
        if (status === 'loading') return <Spinner />;
        if (status === 'error') return <Error />;
        if (status === 'success') return <Data />;
        return <Empty />;
      })()}
    </div>
  );
}
\`\`\`

但**更推荐把逻辑抽到组件外**：

\`\`\`tsx
function renderContent(status) {
  if (status === 'loading') return <Spinner />;
  if (status === 'error') return <Error />;
  if (status === 'success') return <Data />;
  return <Empty />;
}

function Content({ status }) {
  return <div>{renderContent(status)}</div>;
}
\`\`\`

## 33.7 可辨识联合 + 条件渲染

多个分支用可辨识联合让类型自动收窄：

\`\`\`tsx
type Status =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'error'; error: Error }
  | { state: 'success'; data: User[] };

function Content({ status }: { status: Status }) {
  switch (status.state) {
    case 'idle':
      return <p>等待操作</p>;
    case 'loading':
      return <Spinner />;
    case 'error':
      // 这里 status 自动收窄为 { state: 'error'; error: Error }
      return <p>错误：{status.error.message}</p>;
    case 'success':
      // 这里 status 自动收窄为 { state: 'success'; data: User[] }
      return <ul>{status.data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
  }
}
\`\`\`

TS 会检查 switch 是否覆盖所有分支，漏一个就报错。这是处理"多状态"最安全的方式。

## 33.8 显示控制：hidden vs display:none vs null

三种"隐藏元素"的方式：

| 方式 | DOM | state | 性能 | 适用 |
| --- | --- | --- | --- | --- |
| \`return null\` | 节点移除 | 重置 | 重建开销 | 彻底不渲染 |
| \`display: none\` | 节点存在 | 保留 | 切换快 | 频繁切换、保留 state |
| CSS class hidden | 节点存在 | 保留 | 切换快 | 简单显隐 |

\`\`\`tsx
// 1. return null：DOM 里没这个节点
function Modal({ open }) {
  if (!open) return null;
  return <div className="modal">...</div>;
}

// 2. display: none：节点在，只是不显示
function Modal({ open }) {
  return <div className="modal" style={{ display: open ? 'block' : 'none' }}>...</div>;
}

// 3. 用 hidden 属性
function Modal({ open }) {
  return <div className="modal" hidden={!open}>...</div>;
}
\`\`\`

**选择建议**：

- 频繁切换（如 Tab 切换）：\`display: none\`，保留 state 避免重建
- 一次性显隐（如弹窗）：\`return null\`，DOM 干净
- 表单字段：尽量 \`display: none\`，避免用户输入丢失

\`\`\`tsx
// Tab 切换：用 display:none 保留每个 Tab 的 state
function Tabs({ active, tabs }) {
  return (
    <div>
      {tabs.map(tab => (
        <div key={tab.id} style={{ display: active === tab.id ? 'block' : 'none' }}>
          <TabContent id={tab.id} />
        </div>
      ))}
    </div>
  );
}
\`\`\`

## 33.9 实际项目中的条件渲染

1. **简单二选一用三元**：\`{ok ? <A /> : <B />}\`
2. **多分支用 if/else 或 switch 提取函数**：避免嵌套三元
3. **可辨识联合保证分支完整**：TS 检查覆盖
4. **频繁切换用 display:none**：保留 state
5. **列表条件过滤提前算好**：不在 JSX 里写复杂过滤

\`\`\`tsx
// ✅ 提前过滤
function UserList({ users, showDeleted }) {
  const visibleUsers = showDeleted
    ? users
    : users.filter(u => !u.deleted);

  return (
    <ul>
      {visibleUsers.length > 0
        ? visibleUsers.map(u => <UserItem key={u.id} user={u} />)
        : <Empty />}
    </ul>
  );
}
\`\`\`

## 33.10 小结

- 三元 \`cond ? <A /> : <B />\` 适合二选一
- \`&&\` 适合"满足才显示"，注意 0 的陷阱
- \`null\` / \`undefined\` / \`false\` 不渲染，\`0\` 和 \`''\` 会渲染
- 组件返回 \`null\` 表示"不显示"
- 多分支用 if/else 提取函数，避免嵌套三元
- 可辨识联合让 TS 检查分支覆盖
- 频繁切换用 \`display: none\`，一次性显隐用 \`return null\`
`,
    code: `// =============================================================
// 第 33 章 demo：条件渲染
// 演示各种条件渲染模式：三元、&&、null、IIFE、可辨识联合
// =============================================================

// ---- 自定义元素创建函数 ----
function h(type, props, ...children) {
  return { type, props: props || {}, children: children.flat().filter(c => c !== null && c !== false && c !== undefined) };
}

// ---- 1. 三元表达式：二选一 ----
console.log('=== 1. 三元表达式 ===');
function Greeting1(props) {
  // 等价 JSX: {isLogin ? <p>欢迎</p> : <p>请登录</p>}
  return h('div', null,
    props.isLogin ? h('p', null, '欢迎回来') : h('p', null, '请登录')
  );
}
console.log('登录时:', JSON.stringify(Greeting1({ isLogin: true }).children));
console.log('未登录:', JSON.stringify(Greeting1({ isLogin: false }).children));

// ---- 2. && 短路：满足才显示 ----
console.log('\\n=== 2. && 短路 ===');
function Menu1(props) {
  // 等价 JSX: {isAdmin && <AdminButton />}
  return h('div', null,
    props.isAdmin && h('button', null, '管理'),
    props.messages > 0 && h('span', null, '消息(' + props.messages + ')')
  );
}
console.log('管理员+有消息:', JSON.stringify(Menu1({ isAdmin: true, messages: 3 }).children));
console.log('普通用户+无消息:', JSON.stringify(Menu1({ isAdmin: false, messages: 0 }).children));

// ---- 3. && 的 0 陷阱 ----
console.log('\\n=== 3. && 的 0 陷阱 ===');
const count = 0;
// ❌ 错：0 会被渲染成 "0"
const bad = h('div', null, count && h('span', null, '有数据'));
console.log('错误写法 children:', JSON.stringify(bad.children), '（0 被渲染）');
// ✅ 对：转成布尔
const good = h('div', null, count > 0 && h('span', null, '有数据'));
console.log('正确写法 children:', JSON.stringify(good.children), '（false 不渲染）');

// ---- 4. null / undefined / false 不渲染 ----
console.log('\\n=== 4. 不渲染的值 ===');
function Empty1() {
  return h('div', null,
    null,           // 不渲染
    undefined,      // 不渲染
    false,          // 不渲染
    true,           // 不渲染（但有些版本会渲染 true）
    0,              // ⚠️ 会渲染成 "0"
    '',             // ⚠️ 空字符串会被渲染
    h('span', null, 'hi')  // 渲染
  );
}
const emptyResult = Empty1();
console.log('最终 children 数量:', emptyResult.children.length);
console.log('children:', JSON.stringify(emptyResult.children));

// ---- 5. 组件返回 null ----
console.log('\\n=== 5. 组件返回 null ===');
function Modal1(props) {
  if (!props.open) return null;  // open=false 返回 null
  return h('div', { className: 'modal' }, props.children);
}
console.log('open=false:', JSON.stringify(Modal1({ open: false, children: '内容' })));
console.log('open=true :', JSON.stringify(Modal1({ open: true, children: '内容' })));

// ---- 6. IIFE 渲染 ----
console.log('\\n=== 6. IIFE 渲染 ===');
function Content1(props) {
  // 等价 JSX: {(() => { if (...) return <A/>; ... })()}
  const result = (function() {
    if (props.status === 'loading') return h('div', null, '加载中...');
    if (props.status === 'error') return h('div', null, '出错了');
    if (props.status === 'success') return h('div', null, '成功');
    return h('div', null, '空');
  })();
  return h('div', null, result);
}
console.log('loading:', JSON.stringify(Content1({ status: 'loading' }).children));
console.log('error  :', JSON.stringify(Content1({ status: 'error' }).children));
console.log('success:', JSON.stringify(Content1({ status: 'success' }).children));
console.log('idle   :', JSON.stringify(Content1({ status: 'idle' }).children));

// ---- 7. 提取函数（推荐替代 IIFE） ----
console.log('\\n=== 7. 提取函数 ===');
function renderContent(status) {
  if (status === 'loading') return h('div', null, 'Spinner');
  if (status === 'error') return h('div', null, 'Error');
  if (status === 'success') return h('div', null, 'Data');
  return h('div', null, 'Empty');
}
function Content2(props) {
  return h('div', null, renderContent(props.status));
}
console.log('loading:', JSON.stringify(Content2({ status: 'loading' }).children));
console.log('success:', JSON.stringify(Content2({ status: 'success' }).children));

// ---- 8. 可辨识联合 + switch ----
console.log('\\n=== 8. 可辨识联合 + switch ===');
// type Status =
//   | { state: 'idle' }
//   | { state: 'loading' }
//   | { state: 'error'; error: string }
//   | { state: 'success'; data: string[] };
function Content3(status) {
  switch (status.state) {
    case 'idle':
      return h('p', null, '等待操作');
    case 'loading':
      return h('p', null, '加载中...');
    case 'error':
      // 这里 status 自动收窄为 { state: 'error'; error: string }
      return h('p', null, '错误：' + status.error);
    case 'success':
      // 这里 status 自动收窄为 { state: 'success'; data: string[] }
      return h('ul', null, ...status.data.map(d => h('li', { key: d }, d)));
  }
}
console.log('idle   :', JSON.stringify(Content3({ state: 'idle' })));
console.log('loading:', JSON.stringify(Content3({ state: 'loading' })));
console.log('error  :', JSON.stringify(Content3({ state: 'error', error: '网络错误' })));
console.log('success:', JSON.stringify(Content3({ state: 'success', data: ['A', 'B'] })));

// ---- 9. 显示控制：return null vs display:none ----
console.log('\\n=== 9. 显示控制对比 ===');

// 方式 1：return null（DOM 不存在）
function Modal2(props) {
  if (!props.open) return null;
  return h('div', { className: 'modal' }, 'Modal');
}
console.log('return null - open=false:', JSON.stringify(Modal2({ open: false })));

// 方式 2：display:none（DOM 存在，只是隐藏）
function Modal3(props) {
  return h('div', {
    className: 'modal',
    style: { display: props.open ? 'block' : 'none' },
  }, 'Modal');
}
const modal3Closed = Modal3({ open: false });
console.log('display:none - open=false:', JSON.stringify(modal3Closed.props.style));

// 方式 3：hidden 属性
function Modal4(props) {
  return h('div', { className: 'modal', hidden: !props.open }, 'Modal');
}
console.log('hidden 属性 - open=false:', JSON.stringify(Modal4({ open: false }).props.hidden));

// ---- 10. 频繁切换用 display:none（保留 state） ----
console.log('\\n=== 10. Tab 切换用 display:none ===');
function Tabs(props) {
  const { active, tabs } = props;
  return h('div', null,
    ...tabs.map(tab =>
      h('div', {
        key: tab.id,
        style: { display: active === tab.id ? 'block' : 'none' },
      }, 'Tab ' + tab.id + ' 内容')
    )
  );
}
const tabsResult = Tabs({
  active: 'b',
  tabs: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
});
console.log('Tab 切换结果:');
tabsResult.children.forEach(c => {
  console.log('  ', c.props.style.display, '-', c.children[0]);
});

// ---- 关键要点总结 ----
console.log('\\n=== 条件渲染核心要点 ===');
console.log('1. 三元 cond ? <A/> : <B/> 适合二选一');
console.log('2. && 适合"满足才显示"，注意 0 的陷阱');
console.log('3. null/undefined/false 不渲染，0 和 空字符串会渲染');
console.log('4. 组件返回 null 表示"不显示"');
console.log('5. 多分支用 if/else 提取函数，避免嵌套三元');
console.log('6. 可辨识联合 + switch 让 TS 检查分支覆盖');
console.log('7. 频繁切换用 display:none，一次性显隐用 return null');
`,
  },

  // =========================================================
  // 第三十四章：列表与 Keys
  // =========================================================
  {
    id: "tspro-list-keys",
    group: "五、React 基础与组件",
    icon: "🔑",
    title: "列表与 Keys",
    content: `# 第三十四章：列表与 Keys

## 34.1 为什么列表渲染需要 key

React 用 Diff 算法对比新旧 Virtual DOM。列表渲染时，项的**顺序会变化**（插入、删除、排序），React 需要知道"哪个项还是原来那个项"——这就是 \`key\` 的作用。

\`\`\`tsx
// 列表渲染标准写法
function UserList({ users }) {
  return (
    <ul>
      {users.map(u => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
\`\`\`

**没有 key 会报警告**：

\`\`\`tsx
// ❌ 缺少 key，控制台警告
{users.map(u => <li>{u.name}</li>)}
// Warning: Each child in a list should have a unique "key" prop.
\`\`\`

## 34.2 map 渲染列表

\`map\` 是 React 渲染列表的标准方式，把数组转成 JSX 数组：

\`\`\`tsx
const numbers = [1, 2, 3, 4, 5];

// 1. 数字列表
const listItems = numbers.map(n => <li key={n}>{n}</li>);
// <ul>{listItems}</ul>

// 2. 对象列表
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
];
const userItems = users.map(u => (
  <li key={u.id}>
    <span>{u.name}</span>
    <button onClick={() => deleteUser(u.id)}>删除</button>
  </li>
));

// 3. 嵌套列表
const categories = [
  { id: 'fruit', items: [{ id: 1, name: '苹果' }, { id: 2, name: '香蕉' }] },
  { id: 'meat', items: [{ id: 3, name: '牛肉' }, { id: 4, name: '猪肉' }] },
];
const nestedList = categories.map(cat => (
  <div key={cat.id}>
    <h3>{cat.id}</h3>
    <ul>
      {cat.items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  </div>
));
\`\`\`

**关键点**：

- \`map\` 返回 JSX 数组，React 自动展开渲染
- 每个列表元素必须有 \`key\`
- 嵌套列表每层都要 \`key\`

## 34.3 为什么不能用 index 作 key

\`index\` 是 React 的"最后手段"，**能不用就不用**。原因：

### 场景 1：列表顺序变化

\`\`\`tsx
// 旧列表
<li key={0}>A</li>  // key=index 0
<li key={1}>B</li>  // key=index 1
<li key={2}>C</li>  // key=index 2

// 在头部插入 X
<li key={0}>X</li>  // key=0：原来是 A，现在变 X
<li key={1}>A</li>  // key=1：原来是 B，现在变 A
<li key={2}>B</li>  // key=2：原来是 C，现在变 B
<li key={3}>C</li>  // key=3：新建
\`\`\`

React 按 key 对比，发现每个位置的"内容"都变了，**4 次更新 + 1 次新建**。

如果用业务 id：

\`\`\`tsx
// 旧
<li key="a">A</li>
<li key="b">B</li>
<li key="c">C</li>

// 新
<li key="x">X</li>
<li key="a">A</li>
<li key="b">B</li>
<li key="c">C</li>
\`\`\`

React 发现 a/b/c 都还在，只是位置移动；x 是新增。**1 次新建 + 移动节点**，性能最优。

### 场景 2：组件状态错乱（更严重）

\`\`\`tsx
// 一个有输入框的列表项
function TodoItem({ todo }) {
  const [text, setText] = useState('');
  return (
    <li>
      <span>{todo.title}</span>
      <input value={text} onChange={e => setText(e.target.value)} />
    </li>
  );
}

function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo, index) => (
        <TodoItem key={index} todo={todo} />  // ❌ 用 index
      ))}
    </ul>
  );
}
\`\`\`

**问题场景**：

1. 三个 todo：A、B、C，每个输入框都填了文字
2. 删除第一个 A
3. 列表变成 B、C，但用 index 作 key：
   - 位置 0：原来 A 的组件（带输入框文字）现在显示 B
   - 位置 1：原来 B 的组件（带输入框文字）现在显示 C
   - 位置 2：销毁
4. 结果：**B 显示了 A 输入框的文字，C 显示了 B 的文字**——状态错乱

用业务 id 作 key 就没问题：每个组件实例跟着自己的 id 走，删除 A 后 B/C 的 state 保留。

### 什么时候可以用 index

- 列表**纯展示**，没有内部 state
- 列表**不会重新排序、过滤、插入**
- 没有其他可用 id 时

\`\`\`tsx
// ✅ 静态列表可以用 index
const staticList = ['首页', '关于', '联系'];
{staticList.map((item, i) => <li key={i}>{item}</li>)}

// ❌ 动态列表不能用 index
{todos.map((todo, i) => <TodoItem key={i} todo={todo} />)}
\`\`\`

## 34.4 key 的选择策略

**好 key 的标准**：

1. **唯一**：列表内不重复
2. **稳定**：同一项的 key 不随时间变化
3. **可预测**：能从数据里直接拿到

\`\`\`tsx
// ✅ 用业务 id
{users.map(u => <UserCard key={u.id} user={u} />)}

// ✅ 用复合 key（多个字段组合）
{messages.map(m => <Message key={m.from + '-' + m.to} msg={m} />)}

// ✅ 用 url / hash
{articles.map(a => <Article key={a.url} article={a} />)}

// ❌ 用 Math.random()
{users.map(u => <UserCard key={Math.random()} user={u} />)}  // 每次渲染都变
// ❌ 用 Date.now()
{users.map(u => <UserCard key={Date.now() + u.id} user={u} />)}
\`\`\`

**没有 id 怎么办**：

\`\`\`tsx
// 1. 用某些稳定字段组合
{points.map(p => <Point key={p.x + '-' + p.y} point={p} />)}

// 2. 数据来自后端，让后端加 id
// 3. 前端生成一次性 id（如 nanoid），创建后保存
import { nanoid } from 'nanoid';
const todos = [{ id: nanoid(), title: '吃饭' }, ...];

// 4. 最后才用 index（仅静态列表）
{items.map((item, i) => <Item key={i} item={item} />)}
\`\`\`

## 34.5 不要在渲染中改变 key

\`key\` 一旦确定，**后续渲染必须一致**。在渲染时动态生成 key 会导致 React 认为是"新元素"，触发不必要的销毁重建：

\`\`\`tsx
// ❌ 错：每次渲染 key 都变
{users.map(u => <UserCard key={u.id + '-' + Math.random()} user={u} />)}

// ❌ 错：用 index + 字符串前缀（前缀变化时 key 变）
{users.map((u, i) => <UserCard key={'item-' + i} user={u} />)}

// ✅ 对：稳定的 key
{users.map(u => <UserCard key={u.id} user={u} />)}
\`\`\`

## 34.6 key 与组件状态的关系

**key 变化 = 组件销毁重建**。这个特性可以用来"重置组件状态"：

\`\`\`tsx
// 切换用户时，重置表单
function UserProfile({ userId }) {
  return (
    <Form key={userId} initialValues={...} />
  );
}
// userId 变化时，Form 组件被销毁并重建，state 重置
\`\`\`

\`\`\`tsx
// 强制重新挂载
function Editor({ resetKey }) {
  return <ComplexForm key={resetKey} />;
}
// 父组件改 resetKey 就能让 ComplexForm 重置
\`\`\`

**反模式**：用 key 强制刷新整个列表

\`\`\`tsx
// ❌ 滥用 key 重置
function List({ refreshKey }) {
  return (
    <ul key={refreshKey}>  // 整个 ul 销毁重建，性能差
      {items.map(...)}
    </ul>
  );
}
\`\`\`

## 34.7 用 key 实现"移动而非重建"

Diff 算法靠 key 复用节点。**只要 key 一致，React 会尽量移动而非销毁重建**：

\`\`\`tsx
// 排序前
{users.map(u => <UserCard key={u.id} user={u} />)}
// 渲染：[Alice, Bob, Charlie]

// 排序后
{[...users].reverse().map(u => <UserCard key={u.id} user={u} />)}
// 渲染：[Charlie, Bob, Alice]
// React 行为：移动 DOM 节点，不销毁重建（state 保留）
\`\`\`

这是 React 性能优化的关键——**列表项的 state（如表单输入、滚动位置）能跨排序保留**。

## 34.8 实际项目中的列表渲染

1. **永远给 key**：用业务 id，避免 index
2. **列表项组件化**：每项抽成独立组件，便于优化（\`React.memo\`）
3. **大数据量用虚拟列表**：\`react-window\` / \`react-virtual\`
4. **key 不要拼接随机值**：保持稳定

\`\`\`tsx
// ✅ 列表项组件化
const UserCard = React.memo(function UserCard({ user }) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

function UserList({ users }) {
  return (
    <div>
      {users.map(u => <UserCard key={u.id} user={u} />)}
    </div>
  );
}
\`\`\`

\`\`\`tsx
// ✅ 大列表虚拟化
import { FixedSizeList } from 'react-window';

function BigList({ items }) {
  return (
    <FixedSizeList height={600} itemCount={items.length} itemSize={50}>
      {({ index, style }) => (
        <div style={style}>
          <Item data={items[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
\`\`\`

## 34.9 小结

- 列表渲染用 \`map\`，每项必须给 \`key\`
- key 让 React 识别"项的身份"，影响性能和 state 正确性
- **不要用 index 作 key**（除非纯静态、不增删改排序的列表）
- key 要唯一、稳定、可预测，首选业务 id
- key 变化 = 组件销毁重建，可用来重置 state
- 大列表用虚拟列表（\`react-window\`）只渲染可见区域
`,
    code: `// =============================================================
// 第 34 章 demo：列表与 Keys
// 演示 map 渲染列表、key 的作用、错误用法 vs 正确用法
// =============================================================

// ---- 自定义元素创建函数 ----
function h(type, props, ...children) {
  return { type, props: props || {}, children: children.flat().filter(c => c !== null && c !== false && c !== undefined) };
}

// ---- 1. map 渲染列表基础 ----
console.log('=== 1. map 渲染列表 ===');
const fruits = ['苹果', '香蕉', '橘子'];
// 等价 JSX: {fruits.map(f => <li key={f}>{f}</li>)}
const fruitList = h('ul', null,
  ...fruits.map(f => h('li', { key: f }, f))
);
console.log('列表 children 数量:', fruitList.children.length);
fruitList.children.forEach(c => console.log('  key=' + c.props.key + ', text=' + c.children[0]));

// ---- 2. 对象列表 ----
console.log('\\n=== 2. 对象列表 ===');
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
];
// 等价 JSX: {users.map(u => <li key={u.id}>{u.name}</li>)}
const userList = h('ul', null,
  ...users.map(u => h('li', { key: u.id }, u.name))
);
console.log('用户列表:');
userList.children.forEach(c => console.log('  key=' + c.props.key + ', name=' + c.children[0]));

// ---- 3. 嵌套列表 ----
console.log('\\n=== 3. 嵌套列表 ===');
const categories = [
  { id: 'fruit', items: [{ id: 1, name: '苹果' }, { id: 2, name: '香蕉' }] },
  { id: 'meat', items: [{ id: 3, name: '牛肉' }, { id: 4, name: '猪肉' }] },
];
const nestedList = h('div', null,
  ...categories.map(cat => h('div', { key: cat.id },
    h('h3', null, cat.id),
    h('ul', null, ...cat.items.map(item => h('li', { key: item.id }, item.name)))
  ))
);
console.log('嵌套列表结构:');
nestedList.children.forEach(cat => {
  console.log('  分类 key=' + cat.props.key + ':');
  const ul = cat.children.find(c => c.type === 'ul');
  ul.children.forEach(li => console.log('    子项 key=' + li.props.key + ', name=' + li.children[0]));
});

// ---- 4. key 的重要性：模拟 diff 过程 ----
console.log('\\n=== 4. 用 index 作 key 的问题 ===');

// 旧列表
const oldList = [
  { id: 'a', text: 'A' },
  { id: 'b', text: 'B' },
  { id: 'c', text: 'C' },
];

// 新列表（头部插入 X）
const newList = [
  { id: 'x', text: 'X' },
  { id: 'a', text: 'A' },
  { id: 'b', text: 'B' },
  { id: 'c', text: 'C' },
];

// 用 index 作 key 的 diff：按位置对比
console.log('用 index 作 key:');
console.log('  位置 0: 旧 A → 新 X（改文本）');
console.log('  位置 1: 旧 B → 新 A（改文本）');
console.log('  位置 2: 旧 C → 新 B（改文本）');
console.log('  位置 3: 空   → 新 C（新建）');
console.log('  → 3 次更新 + 1 次新建，性能最差');

// 用业务 id 作 key 的 diff：按身份对比
console.log('\\n用业务 id 作 key:');
console.log('  key=a: 复用（仅移动位置）');
console.log('  key=b: 复用（仅移动位置）');
console.log('  key=c: 复用（仅移动位置）');
console.log('  key=x: 新增');
console.log('  → 1 次新建 + 节点移动，性能最优');

// ---- 5. key 与组件状态：模拟状态错乱 ----
console.log('\\n=== 5. index 作 key 导致状态错乱 ===');

// 模拟有内部 state 的列表项组件
function createTodoItem(id, title) {
  let inputText = '';  // 模拟组件内部 state
  return {
    id: id,
    title: title,
    setInput: (v) => { inputText = v; },
    getInput: () => inputText,
    render: function() { return 'todo(' + id + '):' + title + ' [输入:' + inputText + ']'; },
  };
}

// 用 index 作 key：删除第一项后，组件实例按位置复用
console.log('用 index 作 key，删除第一项 A:');
const itemsByKey_index = [
  createTodoItem('a', 'A'),
  createTodoItem('b', 'B'),
  createTodoItem('c', 'C'),
];
// 用户在三个输入框分别输入了 "AA"、"BB"、"CC"
itemsByKey_index[0].setInput('AA');
itemsByKey_index[1].setInput('BB');
itemsByKey_index[2].setInput('CC');
console.log('  删除前:');
itemsByKey_index.forEach((item, i) => console.log('    位置' + i + ':', item.render()));

// 删除第一项 A：B/C 上移，按 index 复用导致 state 错乱
const afterDelete_index = itemsByKey_index.slice(1);  // 移除第一个
console.log('  删除后（按 index 复用，state 错乱）:');
afterDelete_index.forEach((item, i) => console.log('    位置' + i + ':', item.render()));
console.log('  ❌ 位置0 显示 B 但输入框还是 "AA"，位置1 显示 C 但输入框还是 "BB"');

// 用 id 作 key：每个实例跟着 id 走
console.log('\\n用 id 作 key，删除第一项 A:');
const itemsByKey_id = [
  createTodoItem('a', 'A'),
  createTodoItem('b', 'B'),
  createTodoItem('c', 'C'),
];
itemsByKey_id[0].setInput('AA');
itemsByKey_id[1].setInput('BB');
itemsByKey_id[2].setInput('CC');
console.log('  删除前:');
itemsByKey_id.forEach(item => console.log('    key=' + item.id + ':', item.render()));

// 删除第一项 A：B/C 的组件实例保留（state 跟着 id 走）
const afterDelete_id = itemsByKey_id.filter(item => item.id !== 'a');
console.log('  删除后（按 id 复用，state 正确）:');
afterDelete_id.forEach(item => console.log('    key=' + item.id + ':', item.render()));
console.log('  ✅ B 的输入还是 "BB"，C 的输入还是 "CC"，状态正确');

// ---- 6. key 选择策略对比 ----
console.log('\\n=== 6. key 选择策略对比 ===');
const samples = [
  { desc: '业务 id',         key: 'u.id',          good: true },
  { desc: '复合 key',        key: 'm.from + "-" + m.to', good: true },
  { desc: 'url',             key: 'a.url',         good: true },
  { desc: 'Math.random()',   key: 'Math.random()', good: false },
  { desc: 'Date.now()',      key: 'Date.now()',    good: false },
  { desc: 'index（动态列表）', key: 'index',         good: false },
  { desc: 'index（静态列表）', key: 'index',         good: true },
];
samples.forEach(s => {
  console.log('  ' + (s.good ? '✅' : '❌') + ' ' + s.desc + '：key=' + s.key);
});

// ---- 7. key 变化 = 组件销毁重建 ----
console.log('\\n=== 7. key 变化触发组件重建 ===');

// 模拟组件实例跟踪
const instances = {};
function createForm(userId) {
  const instanceId = 'form-' + userId;
  if (!instances[instanceId]) {
    instances[instanceId] = { userId: userId, state: '新建' };
    console.log('  [新建] Form 实例，userId=' + userId);
  } else {
    instances[instanceId].state = '复用';
    console.log('  [复用] Form 实例，userId=' + userId);
  }
  return instances[instanceId];
}

console.log('切换 userId 从 1 → 2 → 1:');
createForm(1);  // 新建 form-1
createForm(2);  // 新建 form-2（key 变了，重建）
createForm(1);  // 复用 form-1（key 回到 1，但之前的实例已被销毁）

// ---- 8. 列表项组件化 + memo 优化 ----
console.log('\\n=== 8. 列表项组件化 ===');

// 模拟 React.memo
function memoize(component) {
  let lastProps = null;
  let lastResult = null;
  return function(props) {
    // 简单浅比较
    const same = lastProps && Object.keys(props).every(k => props[k] === lastProps[k]);
    if (same) {
      console.log('  [memo 命中] 跳过渲染');
      return lastResult;
    }
    lastProps = props;
    lastResult = component(props);
    return lastResult;
  };
}

const UserCard = memoize(function(props) {
  return { type: 'div', props: { className: 'card' }, children: [props.user.name] };
});

console.log('渲染 UserCard（相同 props）:');
console.log('  第一次:', JSON.stringify(UserCard({ user: { name: 'Alice' } })));
console.log('  第二次:', JSON.stringify(UserCard({ user: { name: 'Alice' } })));

// ---- 关键要点总结 ----
console.log('\\n=== 列表与 Keys 核心要点 ===');
console.log('1. 列表渲染用 map，每项必须给 key');
console.log('2. key 让 React 识别项的身份，影响性能和 state 正确性');
console.log('3. 不要用 index 作 key（除非纯静态列表）');
console.log('4. key 要唯一、稳定、可预测，首选业务 id');
console.log('5. key 变化 = 组件销毁重建，可用来重置 state');
console.log('6. 列表项组件化 + React.memo 优化重渲染');
console.log('7. 大列表用虚拟列表（react-window）只渲染可见区域');
`,
  },
];
