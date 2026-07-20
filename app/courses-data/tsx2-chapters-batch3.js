// =============================================================
// TypeScript + React 从入门到精通大全 —— 第三批章节
// -------------------------------------------------------------
// 覆盖：第三部分 React 组件基础
// 包含 5 个章节：ch11 ~ ch15
//
// 主题：JSX、函数组件、文件组织、条件渲染、列表渲染与 key
// 运行环境：React 18（沙箱注入 react / react-dom）
// =============================================================

const chapters = [
  // ============================================================
  // 第十一章：React 入门与 JSX
  // ============================================================
  {
    id: "tsx2-ch11",
    group: "第三部分 React 组件基础",
    icon: "⚛️",
    title: "第十一章 React 入门与 JSX",
    content: `# 第十一章 React 入门与 JSX

React 是由 Facebook（现 Meta）于 2013 年开源的 JavaScript 库，专门用于构建用户界面。它的核心理念是**用组件的方式组织 UI、用单向数据流管理状态、用声明式的写法替代命令式的 DOM 操作**。本章是 React 旅程的起点：我们先理解 React 是什么、为什么用它，再掌握 JSX 语法。

## 11.1 React 是什么

### 11.1.1 一句话定义

**React 是一个用于构建用户界面的 JS 库**——它不提供完整的"框架"，只负责"把数据渲染成视图"这一件事。路由、状态管理、HTTP 请求这些周边能力由社区库或框架（Next.js、Remix）补齐。

### 11.1.2 三个核心特点

1. **声明式（Declarative）**：你只描述"UI 应该长什么样"，React 自己处理 DOM 更新。
2. **组件化（Component-Based）**：UI 由独立可复用的组件组合而成。
3. **一次学习，多端使用**：React Native（移动端）、React 3D（Three.js 绑定）、React PDF 等都基于同一套理念。

### 11.1.3 为什么是 React

React 不是第一个 JS 框架，但它**重新定义了前端的开发范式**。下表对比几种主流方案：

| 框架/库 | 范式 | 数据流 | 学习曲线 | 生态 |
| --- | --- | --- | --- | --- |
| React | 声明式 + 组件化 | 单向 | 中 | 极大 |
| Vue | 声明式 + 组件化 | 双向（可选） | 低 | 大 |
| Angular | 全家桶 | 双向 | 高 | 大 |
| Svelte | 编译时 | 单向 | 低 | 中 |

React 最大的优势是**生态**：Next.js、Remix、React Native、TanStack Query、Zustand、Redux……几乎每个细分领域都有事实标准。

## 11.2 JSX：JS 里写 HTML

JSX 是 React 的"标志性语法"——让你在 JS 里直接写类似 HTML 的代码。它**不是 HTML**，是 JS 的语法扩展，最终会被编译成 \`React.createElement\` 调用。

### 11.2.1 第一个 JSX

\`\`\`tsx
// JSX 看起来像 HTML
const element = <h1>Hello, React!</h1>;

// 实际编译成（JSX 转换后）：
// const element = React.createElement("h1", null, "Hello, React!");
\`\`\`

### 11.2.2 JSX 里的表达式

在 JSX 里用 \`{}\` 嵌入任何 JS 表达式：

\`\`\`tsx
// 变量
const name = "张三";
const greeting = <h1>你好，{name}</h1>;

// 表达式
const age = 30;
const info = <p>年龄：{age + 1}岁，明年{age + 1}岁</p>;

// 函数调用
function format(d: Date) {
  return d.toLocaleDateString();
}
const today = <p>今天是 {format(new Date())}</p>;

// 三元
const isLogged = true;
const message = <p>{isLogged ? "欢迎回来" : "请登录"}</p>;
\`\`\`

### 11.2.3 JSX 里的属性

\`\`\`tsx
// 大部分属性和 HTML 一样
const link = <a href="https://react.dev" target="_blank">React 官网</a>;

// class 用 className（因为 class 是 JS 关键字）
const div = <div className="container">内容</div>;

// style 接受对象
const style = { color: "red", fontSize: 20 };
const p = <p style={style}>红色文字</p>;

// 布尔属性可以省略值（用大括号）
const button = <button disabled>不可点</button>;
const input = <input type="text" required />;
\`\`\`

**JSX 属性名规则**：
- 驼峰命名：\`className\` / \`tabIndex\` / \`onClick\` / \`htmlFor\`
- 字符串属性：\`href="..."\`
- JS 表达式属性：\`onClick={fn}\` / \`style={obj}\`

### 11.2.4 JSX 必须有根元素

每个 JSX 表达式**只能有一个根元素**：

\`\`\`tsx
// ❌ 错误：多个根元素
const bad = (
  <h1>标题</h1>
  <p>内容</p>
);

// ✓ 用 Fragment 包裹
const good = (
  <>
    <h1>标题</h1>
    <p>内容</p>
  </>
);

// Fragment 短语法
// Fragment 长语法（需要 key 时用）
const items = [
  <Fragment key="a">A</Fragment>,
  <Fragment key="b">B</Fragment>,
];
\`\`\`

## 11.3 createElement vs JSX

JSX 是语法糖，理解它底下的 \`createElement\` 能帮你深入理解 React。

\`\`\`tsx
// JSX 写法
const el = <div className="box" id="main">你好</div>;

// 等价于 createElement
import { createElement } from "react";
const el2 = createElement(
  "div",
  { className: "box", id: "main" },
  "你好"
);

// createElement(type, props, ...children)
// type: 标签名（字符串）或组件（函数/class）
// props: 属性对象
// children: 子节点（字符串或 createElement 返回值）
\`\`\`

## 11.4 条件渲染的四种方式

### 11.4.1 if/else 在 JSX 外

\`\`\`tsx
function Greeting({ loggedIn }: { loggedIn: boolean }) {
  // 在 JSX 之外用 if
  if (loggedIn) {
    return <h1>欢迎回来</h1>;
  }
  return <h1>请登录</h1>;
}
\`\`\`

### 11.4.2 三元运算符

\`\`\`tsx
function Status({ online }: { online: boolean }) {
  return <p>{online ? "在线" : "离线"}</p>;
}
\`\`\`

### 11.4.3 短路与（\`&&\`）

\`\`\`tsx
function Notice({ count }: { count: number }) {
  // count > 0 时显示，否则不显示
  return (
    <div>
      {count > 0 && <span>你有 {count} 条新消息</span>}
    </div>
  );
}
\`\`\`

**注意**：不要用 \`&&\` 渲染 0 或空字符串——它们会被渲染到 DOM。

### 11.4.4 IIFE

\`\`\`tsx
function Complex({ items, loading, error }: any) {
  return (
    <div>
      {(() => {
        if (loading) return <p>加载中</p>;
        if (error) return <p>出错了：{error.message}</p>;
        return <ul>{items.map((it: any) => <li key={it.id}>{it.name}</li>)}</ul>;
      })()}
    </div>
  );
}
\`\`\`

## 11.5 列表渲染

\`\`\`tsx
const fruits = ["苹果", "香蕉", "橙子"];

// 用 map 把数组转成 JSX 数组
const list = (
  <ul>
    {fruits.map((fruit, index) => (
      <li key={index}>{fruit}</li>
    ))}
  </ul>
);
\`\`\`

**\`key\` 的作用**：帮助 React 识别哪些元素变了、新增了、删除了。**不要用 index 当 key**（除非列表永远不会重新排序）——详细原因见第十五章。

## 11.6 JSX 的本质

### 11.6.1 JSX 是"对象"

JSX 表达式求值后是 React 元素，**本质是一个普通 JS 对象**：

\`\`\`tsx
const el = <h1 className="x">hi</h1>;

// el 的结构（简化）：
// {
//   type: "h1",
//   props: { className: "x", children: "hi" },
//   key: null,
//   ref: null,
//   ...
// }
console.log(typeof el); // "object"
\`\`\`

**这就是为什么可以把 JSX 当作"普通值"**——赋值给变量、传参、从函数返回。

### 11.6.2 JSX 不会自动转义 HTML

JSX 内的子节点是**字符串字面量时会被转义**，但用 \`{}\` 嵌入的值是直接渲染：

\`\`\`tsx
const userInput = "<script>alert('xss')</script>";

// 安全：作为字符串渲染，特殊字符转义
const safe = <p>{userInput}</p>;
// 实际显示：&lt;script&gt;alert('xss')&lt;/script&gt;

// 危险：用 dangerouslySetInnerHTML 才会被解析
const dangerous = <p dangerouslySetInnerHTML={{ __html: userInput }} />;
\`\`\`

**永远不要把用户输入直接传给 \`dangerouslySetInnerHTML\`**——它是 XSS 攻击的入口。

## 11.7 React 18 起步

\`\`\`tsx
// 入口文件：index.tsx
import { createRoot } from "react-dom/client";
import { App } from "./App";

// 取挂载点
const container = document.getElementById("root");
if (!container) throw new Error("Root not found");

// React 18 新的 createRoot API
const root = createRoot(container);
root.render(<App />);
\`\`\`

## 11.8 综合 Demo：Hello React

\`\`\`tsx
// 第十一章综合 demo：Hello React 全景
// 演示：JSX、createElement、表达式、条件渲染、列表

import { createElement, Fragment } from "react";
import { createRoot } from "react-dom/client";

// 1. 简单 JSX
const title = <h1 className="title">你好，React！</h1>;

// 2. JSX 里嵌入表达式
const name = "张三";
const age = 25;
const now = new Date();
const greeting = (
  <div>
    <h2>欢迎，{name}！</h2>
    <p>你今年 {age} 岁，明年 {age + 1} 岁</p>
    <p>当前时间：{now.toLocaleString("zh-CN")}</p>
  </div>
);

// 3. 等价的 createElement 写法（理解 JSX 编译结果）
const titleCE = createElement("h1", { className: "title" }, "你好，React（createElement 版）！");
const greetingCE = createElement(
  "div",
  null,
  createElement("h2", null, "欢迎，", name, "！"),
  createElement("p", null, "你今年 ", age, " 岁"),
);

// 4. 条件渲染
function Status({ online, count }: { online: boolean; count: number }) {
  return (
    <div>
      {/* if 写法：在 JSX 外决定渲染什么 */}
      <p>状态：{online ? "🟢 在线" : "⚫ 离线"}</p>

      {/* && 短路：条件成立才渲染 */}
      {count > 0 && <p>你有 {count} 条未读消息</p>}

      {/* 0/空字符串问题：count 是 0 时 && 会渲染 "0" */}
      {count > 0 && <p>你有 {count} 条待办</p>}
    </div>
  );
}

// 5. 列表渲染
const fruits = [
  { id: 1, name: "苹果", color: "红" },
  { id: 2, name: "香蕉", color: "黄" },
  { id: 3, name: "葡萄", color: "紫" },
];

function FruitList({ items }: { items: typeof fruits }) {
  return (
    <ul>
      {items.map(fruit => (
        <li key={fruit.id}>
          {fruit.name}（{fruit.color}）
        </li>
      ))}
    </ul>
  );
}

// 6. 综合组件
function App() {
  // 模拟状态
  const online = true;
  const messageCount = 3;

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>第十一章 Demo</h1>
      {title}
      <hr />
      {greeting}
      <hr />
      <Status online={online} count={messageCount} />
      <hr />
      <h3>水果清单</h3>
      <FruitList items={fruits} />
    </div>
  );
}

// 7. 渲染到页面
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
  console.log("React 已挂载");
}

// 8. Fragment 演示
function ListFragment({ items }: { items: string[] }) {
  return (
    <Fragment>
      <h4>Fragment 列表</h4>
      {items.map((it, i) => <span key={i}> {it} </span>)}
    </Fragment>
  );
}

// 在沙箱里我们用一个内部 div 模拟挂载点
// 真实项目里用 createRoot(document.getElementById("root")!)
// 这里为了演示打印输出
console.log("title 类型：", typeof title); // "object"
console.log("title 元素：", title);
console.log("createElement 版：", titleCE);

// 9. 模拟输出
const listItems = ["苹果", "香蕉", "橙子"];
console.log("ListFragment 渲染：");
for (const item of listItems) {
  console.log(" - " + item);
}
\`\`\`

## 小结

- React 是一个声明式、组件化的 JS 库，专门负责 UI 渲染。
- JSX 是 JS 的语法扩展，最终被编译成 \`React.createElement\` 调用。
- JSX 表达式本质上是一个**普通对象**，所以可以赋值、传参、返回。
- 条件渲染四种方式：if/else、三元、\`&&\` 短路、IIFE。
- 列表用 \`map\` 渲染，**每个 item 必须有 \`key\`**。
- React 18 用 \`createRoot\` 替代 \`ReactDOM.render\`。
- JSX 不会自动转义 \`{}\` 嵌入的字符串；**不要乱用 \`dangerouslySetInnerHTML\`**。
- JSX 属性名是驼峰式（\`className\` / \`onClick\` / \`htmlFor\`）。
`,
  },

  // ============================================================
  // 第十二章：函数组件基础
  // ============================================================
  {
    id: "tsx2-ch12",
    group: "第三部分 React 组件基础",
    icon: "🧩",
    title: "第十二章 函数组件基础",
    content: `# 第十二章 函数组件基础

React 组件有两种形态：**class 组件**和**函数组件**。React 16.8 引入 Hooks 之后，函数组件成为主流写法——它更简洁、更易理解、且功能已经完全覆盖 class 组件。本章我们学习函数组件的语法、命名约定、组合方式。

## 12.1 函数组件的本质

函数组件就是**一个返回 JSX 的普通 JS 函数**：

\`\`\`tsx
// 接受 props，返回 JSX
function Welcome(props: { name: string }): any {
  return <h1>你好，{props.name}</h1>;
}

// 使用
// <Welcome name="张三" />
\`\`\`

就这么简单。没有 class、没有 \`this\`、没有生命周期方法（Hooks 替代）。

## 12.2 箭头函数 vs function 声明

两种写法等价：

\`\`\`tsx
// 1. function 声明
function Welcome1({ name }: { name: string }) {
  return <h1>你好，{name}</h1>;
}

// 2. const + 箭头函数
const Welcome2 = ({ name }: { name: string }) => {
  return <h1>你好，{name}</h1>;
};

// 3. 隐式返回（单个表达式时）
const Welcome3 = ({ name }: { name: string }) => <h1>你好，{name}</h1>;
\`\`\`

**实践选择**：
- 简单展示组件：用 const + 箭头
- 复杂业务组件：用 function 声明（更容易调试，函数有名字）

## 12.3 组件命名约定

### 12.3.1 必须首字母大写

React 区分"组件"和"原生 HTML"靠的是**首字母大写**：

\`\`\`tsx
// 小写：被当作 HTML 标签
const a = <div />;     // ✓ 真实 div
const b = <myComponent />; // ❌ 浏览器找 <mycomponent> 标签

// 大写：被当作 React 组件
const c = <MyComponent />; // ✓ 调用 MyComponent 函数
\`\`\`

### 12.3.2 文件命名

- **PascalCase**：\`Welcome.tsx\` / \`UserCard.tsx\`（推荐）
- **kebab-case**：\`welcome.tsx\` / \`user-card.tsx\`（少数项目用）

**约定**：
- 组件文件用 PascalCase
- 文件名与默认导出组件同名

## 12.4 组件的 props 参数

函数组件**第一个参数是 props 对象**：

\`\`\`tsx
// 解构 props（推荐）
function Welcome({ name, age }: { name: string; age: number }) {
  return (
    <div>
      <h1>你好，{name}</h1>
      <p>你 {age} 岁</p>
    </div>
  );
}

// 不解构（少见）
function Welcome2(props: { name: string; age: number }) {
  return <h1>你好，{props.name}</h1>;
}
\`\`\`

## 12.5 单根 vs 多根

### 12.5.1 单根（必须）

JSX 表达式只能有一个根节点，所以函数组件 return 的 JSX 也必须有一个根：

\`\`\`tsx
// ❌ 错误：多根
function Bad() {
  return (
    <h1>标题</h1>
    <p>内容</p>
  );
}

// ✓ 用 Fragment
function Good() {
  return (
    <>
      <h1>标题</h1>
      <p>内容</p>
    </>
  );
}
\`\`\`

### 12.5.2 不需要真实 DOM 包裹

如果你不想加多余 DOM，用 \`<>...</>\` 或 \`<Fragment>\`：

\`\`\`tsx
import { Fragment } from "react";

function List({ items }: { items: string[] }) {
  return (
    <Fragment>
      {items.map((it, i) => <span key={i}>{it}</span>)}
    </Fragment>
  );
}
\`\`\`

Fragment 不会创建额外 DOM 节点。

## 12.6 组件组合：父与子

组件的核心思想是**组合**——把大 UI 拆成小组件，再组合成完整应用：

\`\`\`tsx
// 原子组件：Avatar
function Avatar({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="avatar" />;
}

// 分子组件：UserInfo
function UserInfo({ user }: { user: { name: string; avatar: string; bio: string } }) {
  return (
    <div className="user-info">
      <Avatar src={user.avatar} alt={user.name} />
      <div>
        <h3>{user.name}</h3>
        <p>{user.bio}</p>
      </div>
    </div>
  );
}

// 大组件：UserList
function UserList({ users }: { users: any[] }) {
  return (
    <div>
      {users.map(u => (
        <UserInfo key={u.id} user={u} />
      ))}
    </div>
  );
}
\`\`\`

这种"自顶向下拆分 + 自底向上组合"是 React 项目的基本结构模式。

## 12.7 父传子：props 是单向数据流

React 的数据流是**单向的**——父组件通过 props 把数据传给子组件，子组件不能直接改 props。

\`\`\`tsx
// 父组件
function Parent() {
  const userName = "张三";
  // 把 userName 通过 name prop 传给子组件
  return <Child name={userName} />;
}

// 子组件：只读 props
function Child({ name }: { name: string }) {
  // 不能改 name，因为它是从父组件"传"过来的
  // name = "李四";  // ❌
  return <p>你好，{name}</p>;
}
\`\`\`

**为什么要单向**：让数据流可预测、易调试。"父组件是数据的唯一来源"——这个原则在大型项目里非常重要。

## 12.8 纯函数组件

**函数组件应该是"纯函数"**——给定相同 props，返回相同 JSX：

\`\`\`tsx
// 纯：props 决定输出
function Greeting({ name }: { name: string }) {
  return <h1>你好，{name}</h1>;
}

// 不纯：在组件里读外部变量
let externalName = "张三";
function Greeting2({ name }: { name: string }) {
  return <h1>你好，{externalName + name}</h1>;
  // 即使 props 一样，externalName 变了输出就变
}
\`\`\`

**实践**：把所有"变量来源"通过 props 传进来，让组件可以独立测试、独立复用。

## 12.9 组件的大小与拆分

### 12.9.1 拆得太细 vs 太粗

| 粒度 | 优 | 劣 |
| --- | --- | --- |
| 太粗（一切塞一起） | 简单 | 难复用、难维护 |
| 太细（每个 div 拆组件） | 极致复用 | 文件爆炸、props 繁琐 |

### 12.9.2 经验法则

- **能复用的拆**：\`Avatar\`、\`Button\`、\`Modal\` 这种会被多次用
- **逻辑独立的拆**：\`UserHeader\` / \`UserBody\` 这种内部有独立状态
- **过长的拆**：一个组件超过 200 行就考虑拆
- **别为"以后可能用"拆**：YAGNI（You Aren't Gonna Need It）

## 12.10 综合 Demo：可复用的卡片组件

\`\`\`tsx
// 第十二章综合 demo：可复用 Card 组件家族
// 演示：函数组件、props、组合、纯函数

import { createRoot } from "react-dom/client";

// 1. 原子组件：Badge
function Badge({ count }: { count: number }) {
  // count > 0 才显示
  if (count <= 0) return null;
  return <span className="badge">{count > 99 ? "99+" : count}</span>;
}

// 2. 原子组件：Avatar
function Avatar({ src, alt, size = 40 }: { src: string; alt: string; size?: number }) {
  return (
    <img
      src={src}
      alt={alt}
      className="avatar"
      style={{ width: size, height: size, borderRadius: "50%" }}
    />
  );
}

// 3. 分子组件：CardHeader
function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="card-header">
      <h3 style={{ margin: 0 }}>{title}</h3>
      {subtitle && <p style={{ margin: 0, color: "#666" }}>{subtitle}</p>}
    </div>
  );
}

// 4. 通用容器：Card
function Card({ children }: { children: any }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
        margin: 8,
        maxWidth: 360,
      }}
    >
      {children}
    </div>
  );
}

// 5. 业务组件：UserCard
function UserCard({ user, unreadCount }: { user: { name: string; avatar: string; bio: string }; unreadCount: number }) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar src={user.avatar} alt={user.name} size={48} />
        <div style={{ flex: 1 }}>
          <CardHeader title={user.name} subtitle={user.bio} />
        </div>
        <Badge count={unreadCount} />
      </div>
    </Card>
  );
}

// 6. 业务组件：ArticleCard
function ArticleCard({ article }: { article: { title: string; excerpt: string; cover: string } }) {
  return (
    <Card>
      <img src={article.cover} alt="" style={{ width: "100%", borderRadius: 4 }} />
      <CardHeader title={article.title} subtitle={article.excerpt} />
    </Card>
  );
}

// 7. 父组件：Dashboard
function Dashboard() {
  // 模拟数据
  const user = { name: "张三", avatar: "https://i.pravatar.cc/100", bio: "前端工程师" };
  const article = {
    title: "如何学习 TypeScript",
    excerpt: "一份给初学者的入门指南",
    cover: "https://picsum.photos/300/150",
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>仪表盘</h1>

      <UserCard user={user} unreadCount={5} />
      <ArticleCard article={article} />
    </div>
  );
}

// 8. 渲染
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<Dashboard />);
  console.log("Dashboard 已渲染");
}

// 9. 调试：打印组件树结构
function describeComponent(name: string, props: any) {
  console.log(\`组件 \${name}：props=\`, props);
}

describeComponent("Avatar", { src: "...", alt: "张三" });
describeComponent("UserCard", { user: { name: "张三" }, unreadCount: 5 });

// 10. 测试纯函数组件
// 给相同 props 应该返回相同 JSX（结构上）
function expectSameOutput() {
  const u = { name: "张三", avatar: "x", bio: "前端" };
  // 实际测试中用 React Testing Library 或快照测试
  console.log("相同 props 应当渲染相同结构");
}

expectSameOutput();
\`\`\`

## 小结

- 函数组件就是一个返回 JSX 的普通函数，React 16.8 之后成为主流。
- 组件名必须**首字母大写**，文件名通常用 PascalCase。
- 第一个参数是 props 对象，**推荐解构**而不是 props.xxx 访问。
- JSX 必须有根节点，用 \`<>...</>\` 或 \`<Fragment>\` 避免多余 DOM。
- **数据流是单向的**——父→子通过 props 传递，子不能直接改 props。
- 组件应该是纯函数：相同 props 产生相同输出。
- 组件组合是"自顶向下拆，自底向上拼"的过程。
- 拆分粒度：能复用的拆、逻辑独立的拆、别为"将来用"拆。
`,
  },

  // ============================================================
  // 第十三章：组件文件组织
  // ============================================================
  {
    id: "tsx2-ch13",
    group: "第三部分 React 组件基础",
    icon: "📁",
    title: "第十三章 组件文件组织",
    content: `# 第十三章 组件文件组织

随着项目长大，组件文件怎么组织、怎么导出、怎么命名就成了大问题。本章我们学习 React 项目的常见文件结构、默认/具名导出的取舍、index 重新导出的用法，以及工程化的命名约定。

## 13.1 一个文件一个组件

**最基本的原则**：一个 \`.tsx\` 文件只导出一个组件。

\`\`\`tsx
// UserCard.tsx
export function UserCard({ user }: { user: User }) {
  return <div>...</div>;
}
\`\`\`

**为什么**：

- 文件名 = 组件名 → 容易查找
- 方便删除/移动（不会误删其他组件）
- 编辑器导航友好（Cmd+Click 直接跳到文件）

## 13.2 默认导出 vs 具名导出

### 13.2.1 默认导出

\`\`\`tsx
// UserCard.tsx
export default function UserCard() {
  return <div>...</div>;
}
\`\`\`

### 13.2.2 具名导出

\`\`\`tsx
// UserCard.tsx
export function UserCard() {
  return <div>...</div>;
}
\`\`\`

### 13.2.3 对比

| 维度 | \`export default\` | \`export\` |
| --- | --- | --- |
| 一个文件多个组件 | 只能 1 个 | 任意多个 |
| 导入时改名 | 可以 | 必须用原名（或 \`as\`） |
| 重构时 | IDE 自动改名会更准 | 改名会改导入 |
| 静态分析 | 稍弱 | 强 |

**实践**：
- **Next.js、Create React App 推荐具名导出**（与文件同名，便于静态分析）
- **Vue 生态倾向默认导出**（一个 SFC 对应一个组件）
- **TypeScript + React 项目**：推荐**具名导出 + 文件同主组件名**

## 13.3 文件夹结构

### 13.3.1 按类型分（初学者常用）

\`\`\`
src/
  components/
    Button.tsx
    Card.tsx
    Modal.tsx
  pages/
    Home.tsx
    About.tsx
  hooks/
    useAuth.ts
  utils/
    format.ts
\`\`\`

**问题**：组件一多 \`components/\` 变成大杂烩。

### 13.3.2 按特性分（推荐）

\`\`\`
src/
  features/
    user/
      UserCard.tsx
      UserList.tsx
      useUser.ts
      userApi.ts
      types.ts
    auth/
      LoginForm.tsx
      useAuth.ts
  components/        # 跨特性的通用组件
    Button.tsx
    Card.tsx
  pages/             # 路由对应的页面
    Home.tsx
  hooks/             # 通用 hooks
    useDebounce.ts
  utils/             # 通用工具
    format.ts
\`\`\`

每个特性目录自成一派，删除一个特性 = 删除一个目录，**没有副作用**。

### 13.3.3 实际项目结构示例

\`\`\`
my-app/
  src/
    app/                  # 路由或 App 根
      layout.tsx
      page.tsx
    features/
      cart/
        CartItem.tsx
        CartList.tsx
        useCart.ts
        cartApi.ts
        types.ts
        index.ts          # 重新导出
      checkout/
        CheckoutForm.tsx
        ...
    components/           # 通用 UI
      Button/
        Button.tsx
        Button.module.css
        index.ts
      Modal/
        ...
    hooks/                # 通用 hooks
      useLocalStorage.ts
      useDebounce.ts
    lib/                  # 工具库
      api.ts
      format.ts
    types/                # 全局类型
      user.ts
      api.ts
\`\`\`

## 13.4 index.ts 重新导出

\`\`\`tsx
// features/cart/index.ts
export { CartItem } from "./CartItem";
export { CartList } from "./CartList";
export { useCart } from "./useCart";
export type { CartItem as CartItemType } from "./types";
\`\`\`

**好处**：
- 外部导入时一层搞定：\`import { CartItem, useCart } from "@/features/cart"\`
- 内部重构时可以挪动文件而不影响外部
- 集中控制 API 暴露（哪些 export 出去由 index 决定）

## 13.5 组件命名

### 13.5.1 PascalCase

\`\`\`tsx
// ✓
UserCard
ArticleList
LoginForm
Modal
Button

// ❌
userCard       // 像普通变量
user-card      // 像 CSS 类
USER_CARD      // 像常量
\`\`\`

### 13.5.2 后缀约定

- **\`Page\`**：页面级组件 \`HomePage\`、\`LoginPage\`
- **\`Form\`**：表单 \`LoginForm\`、\`SignupForm\`
- **\`List\`**：列表 \`UserList\`、\`ArticleList\`
- **\`Item\`**：列表项 \`UserItem\`、\`ArticleItem\`
- **\`Modal\` / \`Dialog\`**：弹窗
- **\`View\`**：视图 \`DashboardView\`
- **\`Provider\`**：Context Provider \`ThemeProvider\`
- **\`Layout\`**：布局 \`AdminLayout\`

## 13.6 同一文件多个组件

大多数情况应该避免，但**有些辅助组件**和主组件强绑定，可以放一起：

\`\`\`tsx
// UserCard.tsx
// 主组件
export function UserCard({ user }: { user: User }) {
  return (
    <div className="card">
      <UserCardHeader user={user} />
      <UserCardBody user={user} />
    </div>
  );
}

// 私有辅助组件（不导出）
function UserCardHeader({ user }: { user: User }) {
  return <h3>{user.name}</h3>;
}

function UserCardBody({ user }: { user: User }) {
  return <p>{user.bio}</p>;
}
\`\`\`

**好处**：把"内部用的小组件"和"主组件"放一起，外部 import 不到（更安全），删除主组件时一起删。

## 13.7 类型文件组织

### 13.7.1 内联在组件文件

\`\`\`tsx
// Button.tsx
export interface ButtonProps {
  variant: "primary" | "secondary";
  onClick: () => void;
}

export function Button({ variant, onClick }: ButtonProps) {
  return <button onClick={onClick}>{variant}</button>;
}
\`\`\`

适合**只在一个地方用**的类型。

### 13.7.2 单独的 types.ts

\`\`\`tsx
// features/cart/types.ts
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
\`\`\`

适合**跨多个文件共享**的类型。

## 13.8 综合 Demo：完整组件目录

\`\`\`tsx
// 第十三章综合 demo：完整组件目录结构
// 演示：按特性分文件 + 重新导出 + 命名约定

import { createRoot } from "react-dom/client";

// ===== 文件 1: types.ts =====
// types.ts
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  avatar: string;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  cover: string;
  authorId: string;
  publishedAt: number;
}

// ===== 文件 2: UserCard.tsx =====
// UserCard.tsx
function UserCard({ user, onClick }: { user: User; onClick?: (u: User) => void }) {
  return (
    <div
      onClick={() => onClick?.(user)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 8,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <img
        src={user.avatar}
        alt={user.name}
        style={{ width: 40, height: 40, borderRadius: "50%" }}
      />
      <div>
        <div style={{ fontWeight: 600 }}>{user.name}</div>
        <div style={{ fontSize: 12, color: "#888" }}>{user.email}</div>
      </div>
      {user.role === "admin" && <span style={{ marginLeft: "auto", color: "gold" }}>★</span>}
    </div>
  );
}

// ===== 文件 3: ArticleCard.tsx =====
// ArticleCard.tsx
function ArticleCard({ article, author }: { article: Article; author: User }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
      <img src={article.cover} alt="" style={{ width: "100%", height: 150, objectFit: "cover" }} />
      <div style={{ padding: 12 }}>
        <h3 style={{ margin: "0 0 4px" }}>{article.title}</h3>
        <p style={{ margin: 0, color: "#666", fontSize: 14 }}>{article.excerpt}</p>
        <div style={{ marginTop: 8, fontSize: 12, color: "#999" }}>
          {author.name} · {new Date(article.publishedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

// ===== 文件 4: useUser.ts =====
// useUser.ts - 模拟一个 hook
function useUser(id: string) {
  // 真实项目里会从 API 拿
  return {
    id,
    name: "张三",
    email: "zhangsan@example.com",
    role: "member" as const,
    avatar: "https://i.pravatar.cc/100",
  };
}

// ===== 文件 5: features/user/index.ts =====
// 集中重新导出
const userFeature = {
  UserCard,
  ArticleCard,
  useUser,
};

// 外部使用：import { UserCard } from "@/features/user";

// ===== 文件 6: pages/Dashboard.tsx =====
// Dashboard.tsx - 页面级组件
function Dashboard() {
  const currentUser = useUser("u1");
  const users: User[] = [
    currentUser,
    { id: "u2", name: "李四", email: "lisi@x.com", role: "admin", avatar: "https://i.pravatar.cc/101" },
    { id: "u3", name: "王五", email: "wangwu@x.com", role: "member", avatar: "https://i.pravatar.cc/102" },
  ];

  const articles: Article[] = [
    {
      id: "a1",
      title: "TypeScript 入门",
      excerpt: "从零开始学习 TS",
      cover: "https://picsum.photos/300/150?1",
      authorId: "u1",
      publishedAt: Date.now() - 86400000,
    },
    {
      id: "a2",
      title: "React 18 新特性",
      excerpt: "并发渲染与 Suspense",
      cover: "https://picsum.photos/300/150?2",
      authorId: "u2",
      publishedAt: Date.now() - 3600000,
    },
  ];

  function findAuthor(id: string) {
    return users.find(u => u.id === id)!;
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1>仪表盘</h1>

      <section>
        <h2>用户列表</h2>
        {users.map(u => (
          <UserCard
            key={u.id}
            user={u}
            onClick={user => console.log("点击用户", user.name)}
          />
        ))}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>文章列表</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {articles.map(a => (
            <ArticleCard key={a.id} article={a} author={findAuthor(a.authorId)} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ===== 文件 7: index.tsx (入口) =====
// 渲染应用
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<Dashboard />);
  console.log("应用已挂载");
}

// 演示：打印当前结构
console.log("特性目录：", Object.keys(userFeature));
console.log("页面：Dashboard");
console.log("组件数：", users.length);
\`\`\`

## 小结

- 一个文件一个组件是基本原则，便于维护。
- **TypeScript + React 项目推荐具名导出**，与文件名同名。
- 文件夹按"特性"组织比按"类型"更易扩展。
- **index.ts 集中重新导出**是模块化的关键技巧。
- 组件命名用 PascalCase，常见后缀：\`Page\` / \`Form\` / \`List\` / \`Item\` / \`Modal\` / \`Provider\`。
- 内部辅助组件和主组件放同一文件，不导出以避免外部依赖。
- 类型文件：单文件用 inline，跨文件用 \`types.ts\`。
- 完整的项目结构：\`features/\` + \`components/\` + \`hooks/\` + \`lib/\` + \`types/\`。
`,
  },

  // ============================================================
  // 第十四章：条件渲染
  // ============================================================
  {
    id: "tsx2-ch14",
    group: "第三部分 React 组件基础",
    icon: "❓",
    title: "第十四章 条件渲染",
    content: `# 第十四章 条件渲染

实际应用里，UI 经常要根据状态变化显示不同内容——登录态切换、空态/有数据态切换、错误状态、loading 状态。本章系统讲条件渲染的所有方式，重点是"如何让条件渲染既正确又易读"。

## 14.1 四种基本方式回顾

\`\`\`tsx
// 1. if/else 在 JSX 外
function A({ ok }: { ok: boolean }) {
  if (ok) return <p>✓</p>;
  return <p>✗</p>;
}

// 2. 三元
function B({ ok }: { ok: boolean }) {
  return <p>{ok ? "✓" : "✗"}</p>;
}

// 3. 短路与
function C({ msg }: { msg: string | null }) {
  return <div>{msg && <span>{msg}</span>}</div>;
}

// 4. 立即执行函数（IIFE）
function D({ state }: { state: "a" | "b" | "c" }) {
  return (
    <div>
      {(() => {
        switch (state) {
          case "a": return <p>状态 A</p>;
          case "b": return <p>状态 B</p>;
          case "c": return <p>状态 C</p>;
        }
      })()}
    </div>
  );
}
\`\`\`

## 14.2 选择哪种方式

| 场景 | 推荐 | 原因 |
| --- | --- | --- |
| 整段组件替换 | if/else 在 JSX 外 | 早 return 更清晰 |
| 简单二选一 | 三元 | 一行表达 |
| 条件显示某段 | \`&&\` | 简洁 |
| 多分支复杂逻辑 | 拆子组件 / switch | 维护性好 |
| 多条件嵌套 | 状态机 | 避免 if 地狱 |

## 14.3 早 return 模式

当某个条件让组件什么都不渲染或渲染错误页，**早 return** 优于嵌套三元：

\`\`\`tsx
// ❌ 嵌套三元
function UserProfile({ user, error }: any) {
  return error
    ? <p>出错了</p>
    : user
      ? <div>欢迎，{user.name}</div>
      : <p>加载中</p>;
}

// ✓ 早 return
function UserProfile2({ user, error }: any) {
  if (error) return <p>出错了</p>;
  if (!user) return <p>加载中</p>;
  return <div>欢迎，{user.name}</div>;
}
\`\`\`

**好处**：每行只读一个条件，没有视觉复杂度累积。

## 14.4 \`&&\` 的陷阱

### 14.4.1 渲染 0 和空字符串

\`\`\`tsx
function Count({ value }: { value: number }) {
  // value 是 0 时，&& 会渲染 "0"
  return <p>{value && <span>共 {value} 条</span>}</p>;
  // 当 value = 0，结果是 <p>0</p>
}
\`\`\`

**修复**：用 \`value > 0 &&\`，或者用三元。

### 14.4.2 常见解决

\`\`\`tsx
// 把"假值"显式排除
function Count({ value }: { value: number }) {
  return <p>{value > 0 && <span>共 {value} 条</span>}</p>;
}

// 或者用三元
function Count2({ value }: { value: number }) {
  return <p>{value > 0 ? <span>共 {value} 条</span> : null}</p>;
}
\`\`\`

## 14.5 多条件组合

### 14.5.1 多个 \`&&\` 链

\`\`\`tsx
function Toolbar({ canEdit, canDelete, isAdmin }: any) {
  return (
    <div>
      {canEdit && <button>编辑</button>}
      {canDelete && <button>删除</button>}
      {isAdmin && <button>管理</button>}
    </div>
  );
}
\`\`\`

当条件变多（5+），考虑用对象映射：

### 14.5.2 配置对象 + 单个三元

\`\`\`tsx
const BUTTONS = {
  edit: { label: "编辑", color: "blue" },
  delete: { label: "删除", color: "red" },
  admin: { label: "管理", color: "green" },
} as const;

type BtnKey = keyof typeof BUTTONS;

function Toolbar2({ visible }: { visible: BtnKey[] }) {
  return (
    <div>
      {Object.entries(BUTTONS).map(([key, btn]) => {
        if (!visible.includes(key as BtnKey)) return null;
        return (
          <button key={key} style={{ color: btn.color }}>
            {btn.label}
          </button>
        );
      })}
    </div>
  );
}

Toolbar2({ visible: ["edit", "admin"] });
\`\`\`

### 14.5.3 状态机模式

当条件组合非常复杂（10+ 个），用"状态机"：

\`\`\`tsx
type State = "loading" | "empty" | "error" | "success";
type Data = { state: State; items?: any[]; error?: string };

function DataView({ data }: { data: Data }) {
  switch (data.state) {
    case "loading":
      return <Spinner />;
    case "empty":
      return <EmptyState />;
    case "error":
      return <ErrorView message={data.error!} />;
    case "success":
      return <ListView items={data.items!} />;
  }
}
\`\`\`

**好处**：所有可能的状态都被穷尽，少一个就编译失败。

## 14.6 拆子组件降低复杂度

当一个组件的 if 嵌套超过 3 层，就该拆了：

\`\`\`tsx
// 之前：嵌套地狱
function Profile({ user, posts, isLoading, error }: any) {
  if (isLoading) return <Spinner />;
  if (error) return <ErrorView message={error} />;
  return (
    <div>
      {user
        ? <UserInfo user={user} />
        : <p>用户不存在</p>}
      {posts.length > 0
        ? <PostList posts={posts} />
        : <p>暂无文章</p>}
    </div>
  );
}

// 之后：拆开
function Profile2({ user, posts, isLoading, error }: any) {
  if (isLoading) return <Spinner />;
  if (error) return <ErrorView message={error} />;
  return (
    <div>
      <UserSection user={user} />
      <PostsSection posts={posts} />
    </div>
  );
}

function UserSection({ user }: any) {
  if (!user) return <p>用户不存在</p>;
  return <UserInfo user={user} />;
}

function PostsSection({ posts }: any) {
  if (posts.length === 0) return <p>暂无文章</p>;
  return <PostList posts={posts} />;
}
\`\`\`

## 14.7 常见反模式

### 14.7.1 在 JSX 里写 if

\`\`\`tsx
// ❌ 错误
function Bad({ ok }: { ok: boolean }) {
  return (
    <div>
      {if (ok) <p>✓</p>}  // 语法错误
    </div>
  );
}
\`\`\`

### 14.7.2 用函数嵌套

\`\`\`tsx
// ❌ 不推荐
function Nested({ a, b, c, d }: any) {
  return (
    <div>
      {a ? (b ? <X /> : <Y />) : (c ? <Z /> : <W />)}
    </div>
  );
}

// ✓ 用早 return
function Clean({ a, b, c, d }: any) {
  if (a && b) return <X />;
  if (a) return <Y />;
  if (c) return <Z />;
  return <W />;
}
\`\`\`

### 14.7.3 把业务逻辑写在 JSX 里

\`\`\`tsx
// ❌
function Bad({ user }: any) {
  return (
    <div>
      {user && user.age >= 18 && user.verified && !user.banned && <p>可访问</p>}
    </div>
  );
}

// ✓ 抽函数
function Good({ user }: any) {
  const canAccess = user && user.age >= 18 && user.verified && !user.banned;
  return <div>{canAccess && <p>可访问</p>}</div>;
}
\`\`\`

## 14.8 综合 Demo：完整的加载/空/错/有数据视图

\`\`\`tsx
// 第十四章综合 demo：完整数据视图
// 演示：条件渲染的所有模式

import { createRoot } from "react-dom/client";

// 1. 类型定义
interface User { id: string; name: string }
type DataState<T> =
  | { state: "loading" }
  | { state: "error"; error: string }
  | { state: "empty" }
  | { state: "success"; data: T[] };

// 2. 子组件
function Spinner() {
  return <div style={{ padding: 20, textAlign: "center" }}>⏳ 加载中...</div>;
}

function ErrorView({ message }: { message: string }) {
  return <div style={{ padding: 20, color: "red" }}>❌ {message}</div>;
}

function EmptyState({ msg = "暂无数据" }: { msg?: string }) {
  return <div style={{ padding: 20, color: "#999" }}>📭 {msg}</div>;
}

function ListView<T>({ items, render }: { items: T[]; render: (item: T) => any }) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>{render(item)}</li>
      ))}
    </ul>
  );
}

// 3. 主组件：状态机 switch
function DataView({ state }: { state: DataState<User> }) {
  // 早 return 模式：每种状态独立处理
  if (state.state === "loading") return <Spinner />;
  if (state.state === "error") return <ErrorView message={state.error} />;
  if (state.state === "empty") return <EmptyState />;

  // state 在这里被收窄为 success
  return (
    <ListView
      items={state.data}
      render={u => \`\${u.id}: \${u.name}\`}
    />
  );
}

// 4. 更复杂的用户卡片（多条件）
function UserCard({ user, currentUser }: { user: User; currentUser: User | null }) {
  // 早 return
  if (!user) return <EmptyState msg="用户不存在" />;

  const isMe = currentUser?.id === user.id;
  const canEdit = isMe;

  return (
    <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
      <h3>{user.name}</h3>
      {isMe && <span style={{ color: "blue", fontSize: 12 }}>（我自己）</span>}
      <div style={{ marginTop: 8 }}>
        {canEdit && <button>编辑资料</button>}
        {!canEdit && <button>关注</button>}
      </div>
    </div>
  );
}

// 5. 工具栏：根据权限显示按钮
type Permission = "view" | "edit" | "delete" | "admin";

const BUTTON_CONFIG = {
  view: { label: "查看", color: "#888" },
  edit: { label: "编辑", color: "blue" },
  delete: { label: "删除", color: "red" },
  admin: { label: "管理", color: "green" },
} as const;

function Toolbar({ permissions }: { permissions: Permission[] }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {Object.entries(BUTTON_CONFIG).map(([key, cfg]) => {
        if (!permissions.includes(key as Permission)) return null;
        return (
          <button
            key={key}
            style={{ color: cfg.color, padding: "4px 12px" }}
          >
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

// 6. 仪表盘：把所有组件组合
function Dashboard() {
  // 模拟四种状态
  const stateLoading: DataState<User> = { state: "loading" };
  const stateError: DataState<User> = { state: "error", error: "网络异常" };
  const stateEmpty: DataState<User> = { state: "empty" };
  const stateSuccess: DataState<User> = {
    state: "success",
    data: [
      { id: "u1", name: "张三" },
      { id: "u2", name: "李四" },
    ],
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h1>条件渲染演示</h1>

      <h2>1. 加载状态</h2>
      <DataView state={stateLoading} />

      <h2>2. 错误状态</h2>
      <DataView state={stateError} />

      <h2>3. 空状态</h2>
      <DataView state={stateEmpty} />

      <h2>4. 成功状态</h2>
      <DataView state={stateSuccess} />

      <h2>5. 用户卡片</h2>
      <UserCard user={{ id: "u1", name: "张三" }} currentUser={{ id: "u1", name: "张三" }} />
      <UserCard user={{ id: "u2", name: "李四" }} currentUser={{ id: "u1", name: "张三" }} />

      <h2>6. 工具栏（按权限）</h2>
      <Toolbar permissions={["view", "edit"]} />
      <Toolbar permissions={["view", "delete", "admin"]} />
    </div>
  );
}

// 7. 渲染
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<Dashboard />);
  console.log("条件渲染演示已挂载");
}
\`\`\`

## 小结

- 四种基本方式：if/else、三元、\`&&\`、IIFE。
- 早 return 优于嵌套三元，可读性大幅提升。
- \`&&\` 的陷阱：值为 0 或 "" 时会渲染自身，**用 \`count > 0 &&\` 替代 \`count &&\`**。
- 多条件时用配置对象 + 数组循环，避免一堆 \`&&\` 链。
- **复杂状态用状态机**：\`type State = ... | ... | ...\`，switch 处理所有分支。
- 嵌套超过 3 层就拆子组件。
- 不要在 JSX 里写业务逻辑，提到外面用变量。
- \`if\` 不能直接写在 JSX 里，必须用 IIFE 或早 return。
`,
  },

  // ============================================================
  // 第十五章：列表渲染与 key
  // ============================================================
  {
    id: "tsx2-ch15",
    group: "第三部分 React 组件基础",
    icon: "📋",
    title: "第十五章 列表渲染与 key",
    content: `# 第十五章 列表渲染与 key

列表渲染是 React 最高频的场景——几乎每个页面都有列表。**\`key\`** 是列表渲染里最重要的概念。本章从基础 map 出发，详细讲 key 的作用、选择策略、index 当 key 的坑，以及嵌套列表。

## 15.1 基本列表渲染

\`\`\`tsx
const fruits = ["苹果", "香蕉", "橙子"];

function FruitList() {
  return (
    <ul>
      {fruits.map((fruit, index) => (
        <li key={index}>{fruit}</li>
      ))}
    </ul>
  );
}
\`\`\`

**必须给每个列表项一个 \`key\`**——否则 React 会在控制台报警告。

## 15.2 key 的作用

### 15.2.1 什么是 key

\`key\` 是 React 用来**识别"哪些元素变了、新增了、删除了"**的特殊 prop。它不会出现在 props 里，**只在 React 内部用**。

### 15.2.2 没 key 会怎样

\`\`\`tsx
// 没 key：React 报警告
const list1 = items.map(item => <li>{item.name}</li>);
// 警告：Each child in a list should have a unique "key" prop

// 有 key：正常
const list2 = items.map(item => <li key={item.id}>{item.name}</li>);
\`\`\`

### 15.2.3 key 在 React 内部的作用

假设列表从 \`[A, B, C]\` 变成 \`[A, C, D]\`：

- **没有 key**：React 只能按位置判断，认为 \`A→A, B→C, C→D\`，**修改了三个元素**
- **有正确 key**：React 按 key 判断，认为 \`A不变, C不变, D新增, B删除\`，**效率最高**

## 15.3 怎么选 key

### 15.3.1 最佳：稳定且唯一的 ID

\`\`\`tsx
// 数据来自后端，通常有 id
{users.map(u => <UserCard key={u.id} user={u} />)}
\`\`\`

**这是最佳选择**——ID 永远不变，能精确定位每个元素。

### 15.3.2 次佳：组合键

如果数据没有 ID，用"能区分彼此"的字段组合：

\`\`\`tsx
{items.map(item => (
  <Item key={\`\${item.category}-\${item.name}\`} item={item} />
))}
\`\`\`

### 15.3.3 不要用 index

\`\`\`tsx
// ❌ 反面：index 当 key
{items.map((item, index) => <Item key={index} item={item} />)}
\`\`\`

**为什么 index 当 key 不好**？看下面这个例子。

#### 反例：插入新元素到头部

\`\`\`tsx
// 初始：[{id:1, name:"A"}, {id:2, name:"B"}]
// 渲染：<li key=0>A</li> <li key=1>B</li>

// 插入新元素到头部：[{id:0, name:"X"}, {id:1, name:"A"}, {id:2, name:"B"}]
// 用 index 当 key：<li key=0>X</li> <li key=1>A</li> <li key=2>B</li>
// 看起来 key 都是 0,1,2，但实际 React 以为是：
//   原来 key=0 的 A 变成了 X
//   原来 key=1 的 B 变成了 A
//   新增 key=2 的 B
// 三个元素全部"修改"，浪费性能，且可能引发状态错乱

// 用 id 当 key：
//   原来 key=1 的 A 不变
//   原来 key=2 的 B 不变
//   新增 key=0 的 X
// 只有新增，效率最高
\`\`\`

**更严重的副作用**：如果列表项里有"受控输入"（input），用 index 当 key 会让输入状态错位——A 的输入会跑到 B 那里。

#### index 当 key 的合法场景

唯一能用 index 的场景：**列表永远只追加或删除末尾，不重排，不插入中间**。

\`\`\`tsx
// 日志流：只在末尾追加，可以 index
const logs = [...]; // 只 push，不 splice
{logs.map((log, i) => <LogLine key={i} log={log} />)}
\`\`\`

## 15.4 嵌套列表

\`\`\`tsx
interface Group {
  id: string;
  name: string;
  items: { id: string; name: string }[];
}

function GroupList({ groups }: { groups: Group[] }) {
  return (
    <div>
      {groups.map(group => (
        // 外层 key：组 ID
        <section key={group.id}>
          <h2>{group.name}</h2>
          <ul>
            {group.items.map(item => (
              // 内层 key：item ID
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
\`\`\`

**内外层都需要 key**，且 key 在兄弟节点间唯一即可，不需要全局唯一。

## 15.5 列表 + 条件渲染

\`\`\`tsx
function UserList({ users, showRole }: { users: User[]; showRole: boolean }) {
  return (
    <ul>
      {users.map(u => (
        <li key={u.id}>
          {u.name}
          {showRole && <span>（{u.role}）</span>}
        </li>
      ))}
    </ul>
  );
}
\`\`\`

## 15.6 列表 + filter

\`\`\`tsx
function AdminList({ users }: { users: User[] }) {
  return (
    <ul>
      {users
        .filter(u => u.role === "admin")
        .map(u => (
          <li key={u.id}>{u.name}</li>
        ))}
    </ul>
  );
}
\`\`\`

**注意**：filter 之后 key 还是基于原始数据 ID——不要基于"过滤后的 index"。

## 15.7 性能：React.Fragment + key

如果列表项用 Fragment 包裹多个元素，仍需要 key：

\`\`\`tsx
import { Fragment } from "react";

function TableRows({ items }: { items: any[] }) {
  return items.map(item => (
    // 短语法 <> 不能加 key，必须用 Fragment 长语法
    <Fragment key={item.id}>
      <td>{item.name}</td>
      <td>{item.price}</td>
    </Fragment>
  ));
}
\`\`\`

## 15.8 key 必须是稳定的

**key 在每次渲染之间不能变**。否则 React 会丢失状态。

\`\`\`tsx
// ❌ 错误：key 每次渲染都不同
{items.map((item, i) => (
  <Input key={Math.random()} defaultValue={item.value} />
))}
// 每次重渲染都会"换"一个新元素，input 内部状态会丢失

// ❌ 错误：拼接不稳定
{items.map(item => <Input key={item.id + "_v1"} defaultValue={item.value} />)}
// 如果 _v1 变化，所有 input 都会重建
\`\`\`

## 15.9 列表的 key 提取工具

\`\`\`tsx
// 工具：从对象数组提取 key
function keyBy<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key]);
}

// 工具：把数组转成 { [id]: item } 字典
function indexBy<T extends { id: string | number }>(items: T[]): Record<string, T> {
  const result: Record<string, T> = {};
  for (const item of items) {
    result[String(item.id)] = item;
  }
  return result;
}
\`\`\`

## 15.10 综合 Demo：可排序的待办列表

\`\`\`tsx
// 第十五章综合 demo：可排序的待办列表
// 演示：列表渲染、key 选择、嵌套列表、过滤

import { Fragment, useState } from "react"; // 沙箱会忽略 useState，演示先用
import { createRoot } from "react-dom/client";

// 1. 数据
interface Todo {
  id: string;
  title: string;
  done: boolean;
  category: string;
}

const initialTodos: Todo[] = [
  { id: "1", title: "学 TypeScript", done: true, category: "学习" },
  { id: "2", title: "学 React", done: false, category: "学习" },
  { id: "3", title: "买苹果", done: false, category: "生活" },
  { id: "4", title: "买牛奶", done: false, category: "生活" },
  { id: "5", title: "锻炼身体", done: true, category: "健康" },
];

// 2. 单个待办项
function TodoItem({ todo, onToggle, onDelete }: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        padding: 8,
        borderBottom: "1px solid #eee",
      }}
    >
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
      />
      <span
        style={{
          flex: 1,
          marginLeft: 8,
          textDecoration: todo.done ? "line-through" : "none",
          color: todo.done ? "#999" : "#000",
        }}
      >
        {todo.title}
      </span>
      <span style={{ fontSize: 12, color: "#888" }}>{todo.category}</span>
      <button
        onClick={() => onDelete(todo.id)}
        style={{ marginLeft: 8, color: "red" }}
      >
        删除
      </button>
    </li>
  );
}

// 3. 分组列表（嵌套渲染）
function GroupedTodoList({ todos }: { todos: Todo[] }) {
  // 按 category 分组
  const groups = new Map<string, Todo[]>();
  for (const todo of todos) {
    if (!groups.has(todo.category)) groups.set(todo.category, []);
    groups.get(todo.category)!.push(todo);
  }

  return (
    <div>
      {Array.from(groups.entries()).map(([category, items]) => (
        // 外层 key：category
        <section key={category} style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 8 }}>{category}（{items.length}）</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {items.map(todo => (
              // 内层 key：todo.id（用 ID 而非 index）
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={id => console.log("toggle", id)}
                onDelete={id => console.log("delete", id)}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

// 4. 过滤功能
function FilterableList({ todos }: { todos: Todo[] }) {
  // 这里用普通变量代替 useState，仅作演示
  // 真实项目里应该用 useState
  let currentFilter: "all" | "done" | "todo" = "all";
  const [filter, setFilter] = useState<typeof currentFilter>("all");

  const filtered = todos.filter(t => {
    if (filter === "done") return t.done;
    if (filter === "todo") return !t.done;
    return true;
  });

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setFilter("all")} disabled={filter === "all"}>全部</button>
        <button onClick={() => setFilter("todo")} disabled={filter === "todo"} style={{ marginLeft: 8 }}>未完成</button>
        <button onClick={() => setFilter("done")} disabled={filter === "done"} style={{ marginLeft: 8 }}>已完成</button>
      </div>
      {/* 即使过滤后，key 仍是 todo.id，不是 index */}
      {filtered.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={id => console.log("toggle", id)}
          onDelete={id => console.log("delete", id)}
        />
      ))}
    </div>
  );
}

// 5. Fragment + key 演示
function TableDemo({ items }: { items: Todo[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left" }}>标题</th>
          <th style={{ textAlign: "left" }}>分类</th>
          <th style={{ textAlign: "left" }}>状态</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          // 用 Fragment 长语法加 key
          <Fragment key={item.id}>
            <tr>
              <td>{item.title}</td>
              <td>{item.category}</td>
              <td>{item.done ? "✓" : "—"}</td>
            </tr>
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}

// 6. 演示 index 当 key 的问题
function BadKeyDemo() {
  // 初始数组：A, B, C
  // 在头部插入 X 后：X, A, B, C
  // index 当 key 时：key=0 的元素从 A 变成 X
  //                  key=1 的元素从 B 变成 A
  //                  key=2 的元素从 C 变成 B
  //                  key=3 新增 C
  // 所有元素都"修改"，且 state 错位

  const initial = ["A", "B", "C"];
  console.log("初始：", initial.map((s, i) => \`[\${i}]=\${s}\`));

  const afterInsert = ["X", "A", "B", "C"];
  console.log("插入后：", afterInsert.map((s, i) => \`[\${i}]=\${s}\`));

  // 用 ID 当 key
  const withIds = [
    { id: "a", value: "A" },
    { id: "b", value: "B" },
    { id: "c", value: "C" },
  ];
  console.log("用 ID 当 key 后，插入 X 不影响 A、B、C 的对应关系");
}

// 7. 主应用
function App() {
  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h1>列表渲染演示</h1>

      <h2>1. 分组列表（嵌套 key）</h2>
      <GroupedTodoList todos={initialTodos} />

      <h2>2. 可过滤列表</h2>
      <FilterableList todos={initialTodos} />

      <h2>3. 表格（Fragment + key）</h2>
      <TableDemo items={initialTodos} />

      <h2>4. Key 演示</h2>
      <BadKeyDemo />
    </div>
  );
}

// 8. 渲染
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
  console.log("列表演示已挂载");
}
\`\`\`

## 小结

- 列表渲染用 \`array.map\`，**每个 item 必须有 key**。
- **key 的作用**：帮助 React 高效识别元素的增删改。
- **最佳 key**：稳定且唯一的 ID（通常是后端给的 id）。
- **不要用 index 当 key**，除非列表永远只追加/删除末尾。
- index 当 key 在"插入中间/重排"时会引发状态错位、性能浪费。
- 嵌套列表内外层都需要 key，**key 在兄弟节点间唯一即可**。
- \`<>...</>\` 短语法不能加 key，列表项用 Fragment 必须用 \`<Fragment key={...}>\`。
- key 必须在多次渲染间保持稳定，不能用 \`Math.random()\`。
- filter/sort 后 key 仍基于原始数据 ID，不要用过滤后的 index。
`,
  },
];

export { chapters };
