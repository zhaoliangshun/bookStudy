// =============================================================
// Sass 交互式教程 —— 第一批章节（基础，共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. sass-intro       — Sass 简介
//   2. sass-variables   — 变量 Variables
//   3. sass-nesting     — 嵌套 Nesting
//   4. sass-partials    — 分片与 @use / @forward
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（统一为「基础」）
//   content : Markdown 格式的详细讲解（文字量大，含大量示例与对比）
//   code    : 可编辑的纯 SCSS 代码，会被服务端 sass 包编译成 CSS
//
// 预览机制说明：
//   - 用户在编辑器里写的是纯 SCSS 代码（不是 CSS、不是 HTML）
//   - 前端用 node 端的 sass 包（Dart Sass）把 SCSS 编译成 CSS
//   - 编译出的 CSS 注入到预览 iframe，iframe 内部会渲染一组通用 demo HTML
//     （按钮、卡片、列表、网格、徽章、警告框等通用元素）
//   - 因此 code 字段只需写纯 SCSS，通过类名/选择器去样式化通用 demo 元素
//   - 所有注释和讲解使用简体中文
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：Sass 简介
  // =========================================================
  {
    id: "sass-intro",
    group: "基础",
    icon: "🎨",
    title: "Sass 简介",
    content: `## 什么是 Sass？

**Sass**（发音为 /sæs/，与英文单词 "sass" 同音）的全称是 **Syntactically Awesome Style Sheets**，中文可译为"语法上超赞的样式表"。它是目前世界上**最成熟、最稳定、生态最丰富**的 CSS 预处理器（CSS Preprocessor），诞生于 2006 年，至今仍是前端工程化样式方案的重要基石。

Sass 在原生 CSS 的基础上，扩展出了一套**类编程语言的特性**：

- **变量（Variables）**：用 \`$color\` 存储颜色、尺寸、字体等值，一处定义、处处复用。
- **嵌套（Nesting）**：让选择器按 HTML 层级嵌套书写，告别重复敲父选择器。
- **混入（Mixin）**：把一组样式封装成可复用的"代码片段"，还能传参。
- **继承（Extend / Inheritance）**：让一个选择器继承另一个选择器的所有样式。
- **函数（Functions）**：自定义运算逻辑，比如根据色板算出对比色。
- **流程控制**：\`@if\` / \`@for\` / \`@each\` / \`@while\`，让样式具备条件与循环能力。
- **模块化（@use / @forward）**：把样式拆成多个文件，按需引入、命名空间隔离。
- **内置模块**：\`sass:math\`、\`sass:color\`、\`sass:map\`、\`sass:list\`、\`sass:string\` 等提供大量工具函数。

写完之后，Sass 会把这些"增强版样式"**编译**成浏览器认识的纯 CSS。一句话概括：

> **Sass 是 CSS 的超集 + 编程能力扩展，让你像写程序一样写样式，最后再翻译成标准 CSS。**

值得注意的是，Sass 是 CSS 的**超集**（superset）：任何合法的 CSS 都是合法的 SCSS。这意味着你可以把一个现成的 \`.css\` 文件直接改名为 \`.scss\`，它照样能被 Sass 编译——然后你逐步引入变量、嵌套等特性，迁移成本几乎为零。

---

## Sass 的诞生与历史

了解 Sass 的历史，能帮你理解它为什么是今天这个样子。

- **2006 年**：Sass 由 Ruby 社区的 **Hampton Catlin** 创建，最初用 Ruby 实现，语法受 Haml 影响，强调"缩进即结构"，不使用花括号和分号。这就是最早的 **indented syntax**（缩进语法），文件后缀 \`.sass\`。
- **2007 年**：**Natalie Weizenbaum** 加入并持续维护。为了让习惯写 CSS 的人更容易上手，社区推出了 **SCSS 语法**（Sassy CSS），文件后缀 \`.scss\`，保留花括号和分号，是 CSS 的严格超集。从此 Sass 有两套语法并存。
- **2010 年代**：Sass 在 Ruby on Rails 生态爆火，随后被前端工程化全面采用。LibSass（C/C++ 实现）一度流行，但功能落后于主分支。
- **2019 年**：官方宣布 **弃用 LibSass**，主推 **Dart Sass**（用 Dart 语言重写的实现），它是唯一持续迭代、功能最完整的实现。
- **至今**：Dart Sass 是事实标准，npm 上的 \`sass\` 包即 Dart Sass。本教程所有语法均基于 **Dart Sass 1.x**。

> 💡 重要结论：今天说"Sass"，默认指 **Dart Sass**；说"SCSS"，默认指花括号语法（\`.scss\`）。本教程统一使用 SCSS 语法，因为它更接近 CSS、迁移成本最低、生态最广。

---

## Sass vs SCSS：两种语法对比

Sass 同时支持两套语法，这是新手最容易混淆的地方。

### 1. 缩进语法（Indented Syntax，\`.sass\`）

不使用花括号 \`{}\` 和分号 \`;\`，**靠缩进表达层级**，类似 Python / Pug：

\`\`\`sass
// 文件：style.sass
$primary: #3498db

.button
  background: $primary
  color: white
  padding: 10px 16px
  border-radius: 6px

  &:hover
    opacity: 0.85
\`\`\`

### 2. SCSS 语法（\`.scss\`）

使用花括号和分号，是 CSS 的严格超集：

\`\`\`scss
// 文件：style.scss
$primary: #3498db;

.button {
  background: $primary;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;

  &:hover {
    opacity: 0.85;
  }
}
\`\`\`

### 两种语法详细对比

| 维度 | SCSS（\`.scss\`） | 缩进语法（\`.sass\`） |
| --- | --- | --- |
| **花括号** | 使用 \`{}\` | 不使用，靠缩进 |
| **分号** | 使用 \`;\` | 不使用 |
| **与 CSS 关系** | 严格超集，CSS 直接可用 | 不是超集，CSS 不能直接粘进来 |
| **迁移成本** | 几乎为零（改后缀即可） | 较高（需重写格式） |
| **可读性** | 接近 CSS，团队接受度高 | 简洁紧凑，但需要适应缩进 |
| **行内注释** | 支持 \`//\` 和 \`/* */\` | 支持 \`//\` 和 \`/* */\` |
| **市场份额** | 绝对主流（>95%） | 小众，少数老项目在用 |
| **混入/控制指令** | 完全相同 | 完全相同 |
| **互相转换** | \`sass-convert\` 工具可互转 | 同上 |

> ✅ **本教程统一采用 SCSS 语法**。原因：与 CSS 兼容、生态工具（VSCode 高亮、Prettier）支持最好、团队协作最顺畅。后续提到"Sass"一般指语言/工具，提到代码示例则用 SCSS 写法。

两者只是"写法"不同，**功能完全等价**，编译产物是同一份 CSS。同一个项目里甚至可以混用 \`.scss\` 和 \`.sass\` 文件（通过 \`@use\` 互相引入），但实践中不推荐混用以免风格混乱。

---

## Sass vs Less vs Stylus：三大预处理器横评

CSS 预处理器在 2010 年代形成三足鼎立：**Sass、Less、Stylus**。理解它们的差异，能让你明白为什么 Sass 最终胜出。

### 一句话定位

- **Sass**：功能最全、生态最大、社区最活跃，工程化首选。
- **Less**：基于 JavaScript（Node），语法接近 CSS，Bootstrap 3 曾使用，现逐步式微。
- **Stylus**：语法最自由（括号、分号、冒号都可省）， expressive 但小众，维护缓慢。

### 核心特性对比

| 特性 | Sass (SCSS) | Less | Stylus |
| --- | --- | --- | --- |
| **实现语言** | Dart (官方) | JavaScript (Node) | JavaScript (Node) |
| **变量符号** | \`$\` | \`@\` | \`$\` 或无符号 |
| **嵌套** | ✅ 支持 | ✅ 支持 | ✅ 支持 |
| **混入** | ✅ \`@mixin\` + \`@include\` | ✅ 类即 mixin | ✅ 函数即 mixin |
| **继承** | ✅ \`@extend\` | ✅ \`:extend()\` | ✅ \`@extend\` |
| **循环** | ✅ \`@for/@each/@while\` | ✅ 较弱 | ✅ 强大 |
| **条件** | ✅ \`@if\` | ✅ \`when\` 守卫 | ✅ \`if/else\` |
| **函数** | ✅ 自定义 + 内置模块 | ✅ 较少 | ✅ 丰富 |
| **Map 类型** | ✅ 原生支持 | ⚠️ 用对象模拟 | ✅ 支持 |
| **模块化** | ✅ \`@use/@forward\` | ⚠️ \`@import\`（全局污染） | ⚠️ \`require\` |
| **浏览器端编译** | ⚠️ 不推荐 | ✅ less.js 可在浏览器 | ✅ 可在浏览器 |
| **大厂背书** | Apple/Microsoft/Stripe 等 | Bootstrap（旧） | 较少 |
| **活跃度（2025）** | 🟢 高 | 🟡 中 | 🔴 低 |
| **未来** | 持续迭代 | 维护为主 | 近乎停滞 |

### 变量语法直观对比

\`\`\`scss
// Sass
$primary: #3498db;
.button { background: $primary; }
\`\`\`

\`\`\`less
// Less
@primary: #3498db;
.button { background: @primary; }
\`\`\`

\`\`\`stylus
// Stylus
primary = #3498db
.button
  background primary
\`\`\`

### 为什么今天选 Sass？

1. **功能最完整**：Map、模块系统、内置函数库都是三者中最强的。
2. **生态最大**：几乎所有 CSS 框架（Bootstrap 5+、Bulma、Foundation）、UI 库的样式层都用 Sass。
3. **官方实现统一**：Dart Sass 是唯一主线，避免分裂（Less/Stylus 多实现混乱）。
4. **与现代构建工具深度集成**：Webpack/Vite/Next.js/Nuxt 都有一等公民支持。
5. **未来可期**：Sass 团队与 CSS 标准紧密互动，新特性（嵌套、CSS 变量）出现时会主动引导用户迁移到原生方案。

> 📌 **结论**：新项目无脑选 Sass（SCSS 语法）。已有 Less/Stylus 项目按需维护，但新功能建议逐步迁移到 Sass 或直接拥抱原生 CSS 新特性。

---

## CSS 的痛点：为什么需要预处理器？

要理解 Sass 的价值，先要理解原生 CSS 在大型项目里的痛点。

### 痛点 1：值无法复用，只能复制粘贴

CSS 没有变量（CSS 自定义属性是后来才有的，且有限制）。一个主题色 \`#3498db\` 可能在几十个地方重复出现：

\`\`\`css
.header { background: #3498db; }
.btn-primary { background: #3498db; }
.link { color: #3498db; }
.badge { background: #3498db; }
/* ... 还有 50 处 ... */
\`\`\`

某天设计师说"主色改成 \`#2c7be0\`"，你要全局搜索替换 50 处，漏一个就是 bug。

### 痛点 2：选择器冗长，父子关系重复书写

\`\`\`css
.nav { ... }
.nav li { ... }
.nav li a { ... }
.nav li a:hover { ... }
.nav li a.active { ... }
\`\`\`

\`.nav li a\` 这串前缀写了一遍又一遍，既枯燥又易错。

### 痛点 3：没有函数和运算

想做"主题色 + 10% 亮度""容器宽度减去两侧 padding"这类运算，CSS 早期完全做不到（\`calc()\` 后来才支持，且能力有限）。只能手动算好硬编码。

### 痛点 4：样式难以组织和拆分

CSS 的 \`@import\` 性能差（每个 import 一个 HTTP 请求），大型项目难以把样式按模块拆分。只能堆在几个巨型 \`.css\` 文件里，几千行难维护。

### 痛点 5：缺乏条件与循环逻辑

写一套"5 种颜色的按钮"，CSS 要手动复制 5 份几乎相同的代码，改一处要改 5 处。

### 痛点 6：主题切换困难

深色模式、多品牌换肤，纯 CSS 实现非常繁琐，往往要靠大量类名覆盖，选择器容易打架。

### 痛点 7：浏览器兼容性处理繁琐

加前缀、降级写法全靠手写或依赖外部工具（Autoprefixer），CSS 本身没有抽象能力。

---

## Sass 的核心优势

针对上面的痛点，Sass 逐一给出了解决方案。

### 优势 1：变量，值复用

\`\`\`scss
$primary: #3498db;

.header { background: $primary; }
.btn-primary { background: $primary; }
.link { color: $primary; }
\`\`\`

改色只改一处。还可以用函数生成衍生色：

\`\`\`scss
@use "sass:color";
$primary: #3498db;
$primary-dark: color.adjust($primary, $lightness: -10%);
$primary-light: color.adjust($primary, $lightness: 15%);
\`\`\`

### 优势 2：嵌套，告别冗长前缀

\`\`\`scss
.nav {
  li {
    a {
      &:hover { color: $primary; }
      &.active { font-weight: bold; }
    }
  }
}
\`\`\`

结构一目了然，对应 HTML 层级。

### 优势 3：混入（Mixin），可复用、可传参

\`\`\`scss
@mixin button($bg, $color: white) {
  background: $bg;
  color: $color;
  padding: 8px 16px;
  border-radius: 4px;
  &:hover { opacity: 0.85; }
}

.btn-primary { @include button(#3498db); }
.btn-danger  { @include button(#e74c3c); }
.btn-success { @include button(#27ae60); }
\`\`\`

### 优势 4：继承（@extend），共享样式

\`\`\`scss
%card-base {
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.card-info  { @extend %card-base; background: #e8f4fd; }
.card-warn  { @extend %card-base; background: #fff4e8; }
\`\`\`

### 优势 5：函数与运算

\`\`\`scss
@use "sass:math";
$container: 1200px;
$gutter: 24px;
$col: math.div($container - 11 * $gutter, 12); // 12 栅格单列宽
\`\`\`

### 优势 6：循环批量生成

\`\`\`scss
$colors: (primary #3498db, success #27ae60, danger #e74c3c);
@each $name, $color in $colors {
  .text-#{$name} { color: $color; }
  .bg-#{$name}   { background: $color; }
}
\`\`\`

### 优势 7：模块化拆分

\`\`\`scss
// _variables.scss / _mixins.scss / _buttons.scss 各司其职
@use "variables" as v;
@use "mixins" as m;
@use "buttons";
\`\`\`

### 优势 8：流程控制

\`\`\`scss
@mixin theme($mode) {
  @if $mode == dark {
    background: #1a1a1a; color: #eee;
  } @else {
    background: #fff; color: #333;
  }
}
\`\`\`

---

## 安装 Sass

Dart Sass 是官方推荐实现。安装方式多样。

### 方式 1：项目本地安装（推荐）

\`\`\`bash
npm install --save-dev sass
\`\`\`

安装后可用 \`npx sass\` 调用。本地安装可锁定版本，团队一致，CI 可复现，是工程化首选。

### 方式 2：全局安装（便于随手编译）

\`\`\`bash
npm install -g sass
sass --version
\`\`\`

### 方式 3：Homebrew（macOS）

\`\`\`bash
brew install sass/sass/sass
\`\`\`

### 方式 4：独立可执行包

从 [Sass 官方 GitHub Release](https://github.com/sass/dart-sass/releases) 下载对应平台的单文件可执行包，无需 Node 环境。

### 方式 5：框架自带集成

- **Next.js**：直接安装 \`sass\` 即可，Next 自动用 SCSS 编译 \`*.module.scss\` / \`globals.scss\`。
- **Vue CLI / Vite**：装 \`sass\`（或 \`sass-embedded\`），\`<style lang="scss">\` 自动生效。
- **Angular**：\`ng add\` 时选 SCSS 即配置好。
- **Webpack**：\`sass-loader\` + \`sass\`。

### 验证安装

\`\`\`bash
sass --version
# 输出类似：1.101.0 compiled with dart2js 3.x
\`\`\`

### Dart Sass vs sass-embedded

npm 上有两个相关包：

- \`sass\`：纯 JS 编译（dart2js），无需原生编译，跨平台，速度中等。**默认选这个**。
- \`sass-embedded\`：Dart AOT 原生编译，速度更快（快 2~5 倍），但安装时需要下载平台二进制。大型项目可考虑。

> ✅ 教程和大多数项目用 \`sass\` 即可，本教程的预览服务端用的也是 \`sass\` 包。

---

## 编译方式详解

写完 SCSS，要变成 CSS 才能上浏览器。编译方式有以下几种。

### 方式 1：命令行单次编译

\`\`\`bash
sass input.scss output.css
\`\`\`

把 \`input.scss\` 编译成 \`output.css\`。

### 方式 2：命令行监听（watch）

\`\`\`bash
sass --watch input.scss:output.css
# 或监听整个目录
sass --watch src/scss:dist/css
\`\`\`

文件改动自动重新编译，开发时最常用。

### 方式 3：压缩输出

\`\`\`bash
sass --style=compressed input.scss output.min.css
\`\`\`

四种 \`--style\`：

- \`expanded\`（默认友好）：每个属性一行，缩进清晰。
- \`nested\`：嵌套缩进，反映选择器层级（旧默认）。
- \`compact\`：每条规则压成一行。
- \`compressed\`：全部压一行，去掉注释空白，生产用。

### 方式 4：生成 source map

\`\`\`bash
sass --source-map input.scss output.css
\`\`\`

生成 \`output.css.map\`，浏览器开发者工具能把压缩/编译后的 CSS 行映射回 SCSS 源码。

### 方式 5：构建工具集成

**Webpack（sass-loader）**：

\`\`\`js
module.exports = {
  module: {
    rules: [{ test: /\\.scss$/, use: ["style-loader", "css-loader", "sass-loader"] }],
  },
};
\`\`\`

**Vite**：装 \`sass\` 后直接 \`import './style.scss'\` 即可，零配置。

**Next.js**：装 \`sass\`，写 \`app/globals.scss\` 或 \`*.module.scss\`，自动编译。

### 方式 6：Node API（本教程预览使用）

\`\`\`js
const sass = require("sass");
const result = sass.compileString(scssCode, { style: "expanded" });
console.log(result.css); // 编译后的 CSS 字符串
\`\`\`

或异步：

\`\`\`js
sass.compileStringAsync(code).then(r => console.log(r.css));
\`\`\`

本教程的"运行预览"按钮就是把编辑器里的 SCSS 用 \`compileString\` 编译成 CSS，再注入 iframe。

### 方式 7：编辑器插件

VSCode 装 **Live Sass Compiler** 插件，保存自动编译，适合静态小项目。

---

## 编译流程原理

了解 Sass 把 SCSS 变成 CSS 的内部流程，能帮你理解报错信息和高阶用法。

### 阶段 1：词法与语法分析（Parsing）

Sass 把 SCSS 源码字符串解析成**抽象语法树（AST）**。这一步会捕获语法错误（括号不匹配、未闭合字符串等）。错误信息会精确到行号列号，例如：

\`\`\`
Error: expected "{".
  ╷
3 │ .button
  │         ^
  ╵
  input.scss 3:9  root stylesheet
\`\`\`

### 阶段 2：求值（Evaluation）

Sass 遍历 AST，按顺序**执行**每条规则：

1. 解析变量赋值（\`$x: ...\`），存入作用域。
2. 解析 \`@use\`/\`@forward\`，加载并求值被引入的模块。
3. 求值 \`@mixin\`/\`@function\` 定义（暂不展开）。
4. 遇到普通样式规则，把变量、插值、函数调用替换成实际值，生成 CSS 节点。
5. 遇到 \`@include\`/\`@extend\`/\`@if\`/\`@each\` 等指令，展开执行。
6. 最终累积出一棵"已求值的 CSS 树"。

注意：Sass 是**声明式 + 顺序求值**的，变量值取决于**它在使用点之前最后一次被赋值**的值，这点和 CSS 自定义属性（运行时级联）截然不同。

### 阶段 3：序列化（Serialization）

把求值后的 CSS 树按选定 \`style\` 格式序列化成 CSS 字符串，并可选生成 source map。

### 阶段 4：输出

返回 CSS 字符串（API）或写入文件（CLI），供浏览器加载。

> 🔑 **关键洞察**：Sass 编译发生在**构建期**（build time），产物是静态 CSS。这意味着：① 运行时没有 Sass 开销；② 但运行时也不能再改变 Sass 变量（CSS 自定义属性才能运行时改）。

---

## source map 详解

**source map**（源映射）是一个 \`.map\` 文件，记录"编译后 CSS 的每一行"对应"SCSS 源码的哪一行"。

### 作用

浏览器开发者工具打开"查看元素"时，能看到样式来自 \`_buttons.scss:42\` 而不是 \`style.css:1\`，极大方便调试。

### 生成方式

\`\`\`bash
sass --source-map src/scss/app.scss dist/css/app.css
\`\`\`

生成的 \`app.css\` 末尾会有一行：

\`\`\`css
/*# sourceMappingURL=app.css.map */
\`\`\`

### 内联 source map

\`\`\`bash
sass --embed-sources src/scss/app.scss dist/css/app.css
\`\`\`

把 map 内联进 CSS 注释，单文件分发，开发常用。

> ⚠️ 生产环境通常**不**输出 source map（避免暴露源码结构），或输出但不公开。本教程预览不开 source map（iframe 调试用浏览器原生即可）。

---

## Sass 在现代前端中的定位

随着原生 CSS 进化（嵌套、自定义属性、\`@layer\`、容器查询），有人问"Sass 是不是要被淘汰了"。答案是：**部分功能被原生 CSS 取代，但 Sass 整体仍是大型项目的样式工程化利器**。

### Sass 仍然不可替代的能力

1. **Mixin / Function**：原生 CSS 没有"带逻辑的复用单元"，\`@property\` 只能定义单个属性。Sass 的 Mixin 能封装一组带条件的样式 + 运算。
2. **流程控制**：\`@for\`/\`@each\` 批量生成工具类（如 \`w-1\` ~ \`w-100\`），原生 CSS 做不到。
3. **模块系统**：\`@use\` 的命名空间隔离比 CSS \`@import\`/层叠更可控。
4. **构建期常量折叠**：Sass 变量在构建期算定，产物更小、运行时零成本。
5. **生态**：大量 UI 库样式层基于 Sass。

### 原生 CSS 已经能做的（可逐步迁移）

- **变量** → CSS 自定义属性（运行时可改、可继承）。
- **嵌套** → 原生 CSS Nesting（Chrome 112+、Safari 16.5+、Firefox 117+）。
- **数学运算** → \`calc()\` / \`min()\` / \`max()\` / \`clamp()\`。
- **部分颜色函数** → \`color-mix()\`、\`oklch()\`、相对颜色 \`rgb(from ...)\`。

### 最佳实践：两者结合

- **设计令牌（颜色/间距/字号）**：优先用 CSS 自定义属性（\`:root { --color-primary: ... }\`），便于运行时主题切换。
- **样式逻辑（Mixin/循环/函数）**：继续用 Sass，编译期生成。
- **批量工具类**：用 Sass \`@each\` 生成，引用 CSS 变量。

---

## CSS 变量 vs Sass 变量

这是高频面试题，务必厘清。

| 维度 | Sass 变量（\`$x\`） | CSS 自定义属性（\`--x\`） |
| --- | --- | --- |
| **求值时机** | 构建期（编译时） | 运行时（浏览器渲染时） |
| **能否运行时修改** | ❌ 不能，编译后是固定值 | ✅ 能，JS 可 \`style.setProperty\` 改 |
| **作用域** | 词法作用域（块级 + 全局） | DOM 级联作用域（按元素继承） |
| **类型** | 强类型（数字/颜色/列表/Map…） | 字符串（使用时再解析） |
| **默认值** | \`!default\` | \`var(--x, fallback)\` |
| **可参与运算** | ✅ 类型化运算 + 内置函数 | ⚠️ 需 \`calc()\`，类型有限 |
| **浏览器兼容** | 编译成 CSS，无兼容问题 | 现代浏览器全支持（IE 不支持） |
| **适合场景** | 静态主题、批量生成、构建期常量 | 动态主题、运行时换肤、组件 props |
| **体积** | 编译展开，可能增大 CSS | 一处定义，引用即可 |

### 组合使用示例

\`\`\`scss
// Sass 变量定义"调色板"（构建期常量）
$palettes: (
  blue: #3498db,
  green: #27ae60,
  red: #e74c3c,
);

:root {
  // 把 Sass 变量"导出"为 CSS 变量，运行时可改
  @each $name, $color in $palettes {
    --color-#{$name}: #{$color};
  }
}

.button {
  // 引用 CSS 变量，便于运行时换肤
  background: var(--color-blue);
}
\`\`\`

> 🎯 **记忆口诀**：Sass 变量像"编译期常量"，CSS 变量像"运行时配置"。需要换肤用 CSS 变量，需要批量生成用 Sass 变量，两者不冲突。

---

## 浏览器兼容性

Sass 本身的兼容性 = **零兼容问题**，因为它编译成纯 CSS，浏览器加载的是普通 CSS，IE6 都能跑。

需要关注的是：

1. **你写的 CSS 属性**的浏览器支持（如 \`gap\` 在 flex 里 IE 不支持），这和 Sass 无关。
2. **CSS 自定义属性**：IE 全系不支持，老项目慎用。
3. **原生 CSS 嵌套**：较新浏览器才支持，老项目用 Sass 嵌套更稳（编译成普通后代选择器）。

### 配合 Autoprefixer

Sass 不负责加厂商前缀。生产链路通常是：

\`\`\`
SCSS → sass 编译 → CSS → PostCSS/Autoprefixer → 加前缀的 CSS → 压缩
\`\`\`

所以别在 Sass 里手写 \`-webkit-\`、\`-moz-\`，交给 Autoprefixer。

---

## 何时该用 / 不该用 Sass？

### 该用

- 中大型项目，样式量 > 500 行。
- 多主题、多品牌、深色模式需求。
- 需要批量生成相似样式（栅格、间距工具类、多色按钮）。
- 团队协作，需要模块化拆分样式文件。
- 需要可复用的样式"组件"（Mixin/Extend）。

### 不该用

- 一个几百行的静态单页，纯 CSS 更直接。
- 团队完全不会 Sass 且项目周期极紧（学习成本）。
- 只为"用变量"——直接用 CSS 自定义属性就够，不必引入构建链。
- 追求运行时动态主题——CSS 自定义属性 + JS 更合适。

---

## 第一个示例解读

本章节的可编辑代码演示了一个"微型主题"：定义了主色/圆角/阴影变量、一个 \`@mixin card\` 卡片混入、嵌套的按钮与列表样式，并通过 \`@each\` 批量生成 3 种状态色徽章。编译后会给预览区的 \`.sass-demo\` 容器内的按钮、卡片、列表、徽章上色。

关键点：

- \`$primary\` / \`$radius\` / \`$shadow\` 是变量，改一处全局生效。
- \`@mixin card\` 封装卡片样式，\`@include card\` 复用。
- \`.btn\` 内嵌套 \`&:hover\`、\`&-primary\`、\`&-danger\`，展示 \`&\` 的用法（下一章详讲）。
- \`@each\` 遍历 Map 生成 \`.badge-success\` / \`.badge-warn\` / \`.badge-error\`。

### 动手试试

1. 把 \`$primary\` 改成 \`#e74c3c\`，观察所有用它的元素变色。
2. 把 \`$radius\` 改成 \`24px\`，看圆角变化。
3. 在 \`$themes\` Map 里加一个 \`info #3498db\`，看是否多出一个 \`.badge-info\`。
4. 把 \`@include card\` 的参数换成别的颜色。

修改后点"运行"，服务端会用 Dart Sass 重新编译并刷新预览。`,
    code: `// ============================================================
// 第一章演示：用 SCSS 定义一个"微型主题"
// 涵盖：变量 / 嵌套 / @mixin 混入 / @each 循环生成
// 样式化预览区 .sass-demo 容器内的按钮、卡片、列表、徽章
// ============================================================

// ---- 1. 变量：主题色、圆角、阴影、间距 ----
$primary: #3498db;
$primary-dark: #2980b9;
$radius: 8px;
$shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
$gap: 16px;
$font-stack: -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;

// ---- 2. 混入：可复用、可传参的"卡片"样式 ----
@mixin card($bg: #ffffff) {
  background: $bg;
  border-radius: $radius;
  padding: $gap;
  box-shadow: $shadow;
  font-family: $font-stack;
}

// ---- 3. 主容器：限定字体与底色 ----
.sass-demo {
  font-family: $font-stack;
  color: #2c3e50;
  padding: 24px;
  background: #f7f9fc;
  border-radius: 12px;

  // 标题
  h2 {
    margin: 0 0 12px;
    font-size: 20px;
    color: $primary;
  }

  // ---- 4. 卡片：通过 @include 复用混入 ----
  .card {
    @include card(#ffffff);
    margin-bottom: $gap;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .card-body {
      font-size: 14px;
      line-height: 1.6;
      color: #5a6478;
    }
  }

  // ---- 5. 按钮：嵌套 + & 父选择器 ----
  .btn {
    display: inline-block;
    padding: 8px 16px;
    border: none;
    border-radius: $radius;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    margin-right: 8px;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.85;
    }

    // & 拼接后缀，生成 .btn-primary / .btn-danger
    &-primary {
      background: $primary;
    }

    &-danger {
      background: #e74c3c;
    }

    &-outline {
      background: transparent;
      color: $primary;
      border: 1px solid $primary;

      &:hover {
        background: $primary;
        color: #fff;
        opacity: 1;
      }
    }
  }

  // ---- 6. 列表：嵌套子元素 ----
  .list {
    list-style: none;
    margin: 0;
    padding: 0;

    .list-item {
      padding: 10px 12px;
      border-bottom: 1px solid #eef0f4;
      font-size: 14px;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: #f0f4ff;
      }
    }
  }

  // ---- 7. @each 循环：批量生成徽章 ----
  $themes: (
    success #27ae60 #e8f7ee,
    warn #f39c12 #fff6e6,
    error #e74c3c #fdecea,
  );

  @each $name, $color, $bg in $themes {
    .badge-#{$name} {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      color: $color;
      background: $bg;
      margin-right: 6px;
    }
  }

  // ---- 8. 段落补充样式 ----
  p {
    margin: 8px 0;
    line-height: 1.6;
  }
}
`,
  },

  // =========================================================
  // 第二章：变量 Variables
  // =========================================================
  {
    id: "sass-variables",
    group: "基础",
    icon: "📦",
    title: "变量 Variables",
    content: `## 变量：Sass 的基石

变量是 Sass 最基础也最常用的特性。用一个 \`$\` 开头的名字存储一个值，之后在任意处引用，实现"一处定义、处处复用、改一处全改"。这是 Sass 解决"CSS 值只能复制粘贴"痛点的核心武器。

### 最简单的变量

\`\`\`scss
$primary: #3498db;
$radius: 8px;
$gap: 16px;

.button {
  background: $primary;
  border-radius: $radius;
  padding: $gap;
}
\`\`\`

编译后：

\`\`\`css
.button {
  background: #3498db;
  border-radius: 8px;
  padding: 16px;
}
\`\`\`

变量名在编译后**完全消失**，被替换成它代表的值。所以变量不会增加产物体积（和 CSS 自定义属性不同）。

### 命名规则

- 以 \`$\` 开头，后跟标识符。
- 可包含字母、数字、\`-\`、\`_\`。
- 大小写敏感：\`$color\` 和 \`$Color\` 是不同变量。
- 不能以数字开头。
- 约定：\`-\` 和 \`_\` 等价（\`$font-size\` 与 \`$font_size\` 视为同一变量），但**实践中统一用 \`-\`**。

\`\`\`scss
$primary-color: #3498db;   // ✅ 推荐 kebab-case
$primaryColor: #3498db;    // ⚠️ 也可，但不推荐
$1color: #fff;             // ❌ 非法，不能数字开头
\`\`\`

---

## 变量的作用域

Sass 变量有**词法作用域**（lexical scoping），类似大多数编程语言。

### 全局变量

在任何花括号外定义的变量是全局的，全文件可用：

\`\`\`scss
$global: #333; // 全局
.a { color: $global; }
.b { color: $global; }
\`\`\`

### 局部变量

在花括号内定义的变量是局部的，只在该块及其子块可见：

\`\`\`scss
$color: red;

.box {
  $color: blue; // 局部变量，只在 .box 内生效
  color: $color; // blue
}

.other {
  color: $color; // red（外面的 $color 没被改）
}
\`\`\`

> ⚠️ 注意：在 .box 内写 \`$color: blue\` 时，Sass 会**新建一个局部变量**覆盖外层同名变量，**不会**修改外层的全局 \`$color\`。这是 Sass 的"遮蔽（shadowing）"行为，类似 JS 的 \`let\`。

### 内层可访问外层

\`\`\`scss
$base: 10px;
.outer {
  $local: 20px;
  .inner {
    padding: $base + $local; // 30px，内层能读外层
  }
}
// 这里访问 $local 会报错，因为它只在 .outer 内可见
\`\`\`

---

## !default：默认值

\`!default\` 标志的含义是：**"如果这个变量还没被赋值（或值为 null），就用这个值；否则保持原值。"** 类似 JS 的 \`x = x || defaultValue\`。

\`\`\`scss
$primary: #3498db;        // 已赋值
$primary: #ff0000 !default; // 因为已有值，这行不生效

$secondary: #27ae60 !default; // 之前没赋值，生效

.a { color: $primary; }   // #3498db
.b { color: $secondary; } // #27ae60
\`\`\`

### 用途：让样式库可被配置

这是 \`!default\` 最重要的应用场景。一个可复用的样式库这样写：

\`\`\`scss
// _button.scss（库）
$btn-bg: #3498db !default;
$btn-radius: 4px !default;

.btn {
  background: $btn-bg;
  border-radius: $btn-radius;
}
\`\`\`

使用者可以在引入库**之前**覆盖默认值：

\`\`\`scss
// app.scss
$btn-bg: #e74c3c;    // 覆盖库的默认值
$btn-radius: 12px;
@use "button";        // 库内部用 !default，不会覆盖你的值
\`\`\`

> 🎯 \`!default\` 是编写可配置 Sass 库的关键。配合 \`@use ... with\`（见第四章）威力最大。

### null 与 !default

值为 \`null\` 的变量被视为"未赋值"，\`!default\` 会生效：

\`\`\`scss
$x: null;
$x: #fff !default; // 生效，因为 null 算未赋值
\`\`\`

---

## !global：强制全局

在局部作用域里，用 \`!global\` 可以**修改全局变量**（而非创建局部遮蔽）。

\`\`\`scss
$counter: 0;

@for $i from 1 through 3 {
  // @for 内部赋值默认是局部的，需 !global 才能改外层
}

.box {
  $counter: 1 !global; // 把全局 $counter 改成 1
}

.other { content: $counter; } // 1
\`\`\`

> ⚠️ 滥用 \`!global\` 会让变量流向难以追踪，破坏可维护性。**尽量少用**，只在确实需要"跨作用域累计"时用。现代 Sass 推荐用 \`@use\` 模块系统替代全局变量共享。

---

## 变量的数据类型

Sass 变量是**强类型**的，每种类型有对应的运算与函数。共有 8 种类型。

### 1. 数字（Number）

\`\`\`scss
$gap: 16px;        // 带单位
$line: 1.6;        // 无单位
$cols: 12;         // 整数
\`\`\`

运算：

\`\`\`scss
@use "sass:math";
$half: math.div($gap, 2); // 8px（用 math.div，不要用 / 它已被弃用为除法）
$total: $gap + 4px;       // 20px
\`\`\`

> ⚠️ Sass 1.33+ 起 \`/\` 作为除法被弃用（会警告），用 \`math.div($a, $b)\` 替代。

### 2. 字符串（String）

两种字符串：

- **带引号**：\`"Hello"\`、\`'PingFang'\`
- **不带引号**：\`sans-serif\`、\`bold\`（CSS 标识符）

\`\`\`scss
$font: "Helvetica", Arial, sans-serif; // 这是列表
$name: "btn-primary"; // 带引号
$weight: bold;        // 不带引号
\`\`\`

字符串函数：\`str-length\`、\`str-slice\`、\`to-upper-case\` 等（\`sass:string\` 模块）。

### 3. 布尔（Boolean）

\`\`\`scss
$rounded: true;
$outlined: false;

@if $rounded { border-radius: 8px; }
\`\`\`

### 4. 颜色（Color）

\`\`\`scss
$primary: #3498db;
$danger: rgb(231, 76, 60);
$success: hsl(140, 50%, 45%);
\`\`\`

颜色函数（\`sass:color\` 模块）：

\`\`\`scss
@use "sass:color";
$hover: color.adjust($primary, $lightness: -10%);   // 加深
$tint: color.adjust($primary, $lightness: 20%);     // 提亮
$alpha: color.adjust($primary, $alpha: -0.3);       // 半透明
$mix: color.mix($primary, #fff, 25%);               // 混色
\`\`\`

> ⚠️ 旧的 \`lighten()\` / \`darken()\` 已弃用，用 \`color.adjust(..., $lightness: ...)\`。

### 5. 列表（List）

有序集合，类似数组：

\`\`\`scss
$breakpoints: 576px 768px 992px 1200px;       // 空格分隔
$padding: 10px 20px;                           // 两值
$font-stack: "Helvetica", Arial, sans-serif;   // 逗号分隔
$single: (16px,);                              // 单元素列表需逗号
\`\`\`

访问：

\`\`\`scss
@use "sass:list";
$first: list.nth($breakpoints, 1); // 576px（索引从 1 开始）
$len: list.length($breakpoints);   // 4
\`\`\`

### 6. Map（映射 / 字典）

键值对集合，是组织"主题色板""断点表"的利器：

\`\`\`scss
$colors: (
  primary: #3498db,
  success: #27ae60,
  danger: #e74c3c,
  text: #2c3e50,
);

$breakpoints: (
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
);
\`\`\`

访问与遍历：

\`\`\`scss
@use "sass:map";
$primary: map.get($colors, primary); // #3498db

@each $name, $value in $colors {
  .text-#{$name} { color: $value; }
}
\`\`\`

### 7. null（空值）

表示"没有值"：

\`\`\`scss
$optional: null;

@if $optional == null { /* ... */ }
\`\`\`

null 变量在编译时**不会输出对应属性**：

\`\`\`scss
.box {
  margin: null; // 这一行不会被输出到 CSS
  padding: 10px;
}
\`\`\`

利用这点可以写"条件属性"：

\`\`\`scss
@mixin border($color: null) {
  border: 1px solid $color; // $color 为 null 时整条不输出
}
.a { @include border; }       // 不输出 border
.b { @include border(red); }  // 输出 border: 1px solid red
\`\`\`

### 8. 函数引用（Function Reference）

用 \`meta.get-function\` 可以把函数本身作为值传递（旧的全局 \`get-function\`/\`call\` 已弃用，统一用 \`sass:meta\` 模块）：

\`\`\`scss
@use "sass:color";
@use "sass:meta";
@function lighten10($c) { @return color.adjust($c, $lightness: 10%); }

$fn: meta.get-function("lighten10");
.result { background: meta.call($fn, #3498db); }
\`\`\`

这种用法较少见，主要在高阶抽象里。

### 类型判断函数

\`\`\`scss
$type: type-of($primary); // "color"
@if type-of($gap) == number { /* ... */ }
\`\`\`

---

## 变量插值 #{} 

有时候变量不能直接写，需要"插值"进字符串或选择器里。用 \`#{$var}\` 语法。

### 用在选择器/属性名/字符串里

\`\`\`scss
$name: "primary";
$prop: margin;

.btn-#{$name} {            // 选择器插值 → .btn-primary
  #{$prop}-top: 10px;       // 属性名插值 → margin-top
  content: "btn-#{$name}";  // 字符串插值 → "btn-primary"
}
\`\`\`

### 用在 @each 批量生成

\`\`\`scss
$sizes: small 12px, medium 16px, large 20px;
@each $name, $size in $sizes {
  .text-#{$name} { font-size: $size; }
}
// 生成 .text-small / .text-medium / .text-large
\`\`\`

### 用在 media 查询

\`\`\`scss
$bp-md: 768px;
@media (min-width: #{$bp-md}) { /* ... */ }
\`\`\`

> 💡 普通属性值里直接写 \`$var\` 即可，**不需要** \`#{}\`。插值主要用在选择器、属性名、字符串、\`@media\`、\`@supports\` 等"需要被解析成标识符"的位置。

### 插值的坑：颜色被引号包裹

\`\`\`scss
$color: #3498db;
.a { background: "#{$color}"; } // ❌ "background: "#3498db"" 非法
.a { background: $color; }       // ✅ 正确
\`\`\`

插值会把任意值转成字符串，颜色、数字插值后丢失类型，慎用。

---

## 变量 vs CSS 自定义属性（再对比）

第一章已对比过，这里聚焦"实战选型"。

### 什么时候用 Sass 变量

- 构建期就能定的常量（栅格列数、间距刻度）。
- 需要参与运算和函数（\`color.adjust\`、\`math.div\`）。
- 需要在 \`@each\`/\`@for\` 里循环生成。
- 不需要在运行时被 JS 修改。

### 什么时候用 CSS 自定义属性

- 运行时换肤、深色模式切换。
- 需要按 DOM 层级继承不同值。
- 需要被 JS 动态读写。

### 组合最佳实践

\`\`\`scss
// Sass 变量定义"设计令牌源"
$palette: (blue: #3498db, green: #27ae60);

:root {
  // 导出为 CSS 变量，运行时可改
  @each $name, $color in $palette {
    --color-#{$name}: #{$color};
  }
}

.btn {
  // 引用 CSS 变量，便于运行时换肤
  background: var(--color-blue, #3498db);
}
\`\`\`

---

## 颜色变量实战

颜色是变量用得最多的场景。一套好的颜色体系能极大提升一致性。

### 定义主题色板

\`\`\`scss
$colors: (
  primary: #3498db,
  primary-dark: #2980b9,
  primary-light: #5dade2,
  success: #27ae60,
  warn: #f39c12,
  danger: #e74c3c,
  text: #2c3e50,
  text-light: #7f8c8d,
  bg: #ffffff,
  bg-alt: #f7f9fc,
  border: #e5e8ec,
);
\`\`\`

### 衍生色用函数生成

\`\`\`scss
@use "sass:color";
@use "sass:map";

$base: map.get($colors, primary);
$hover: color.adjust($base, $lightness: -8%);
$active: color.adjust($base, $lightness: -15%);
$disabled: color.adjust($base, $alpha: -0.5);
\`\`\`

### 批量生成工具类

\`\`\`scss
@each $name, $color in $colors {
  .text-#{$name} { color: $color; }
  .bg-#{$name}   { background: $color; }
  .border-#{$name} { border: 1px solid $color; }
}
\`\`\`

---

## 主题色定义规范

一个成熟的主题色规范通常包含：

1. **主色（primary）**：品牌主色，用于关键按钮、链接、强调。
2. **主色衍生（dark / light）**：用于 hover/active/disabled。
3. **语义色（success/warn/danger/info）**：状态反馈。
4. **中性色（text/text-light/bg/border）**：文字、背景、边框。
5. **灰阶（gray-50 ~ gray-900）**：精细灰阶。

### 命名约定

- 用语义而非具体色值命名：\`$color-primary\` 而非 \`$color-blue\`（万一哪天品牌色换绿了，名字还是 primary）。
- 一致前缀：\`color-\`、\`spacing-\`、\`font-\`、\`radius-\`。
- 衍生色加后缀：\`-dark\`/\`-light\`/\`-hover\`/\`-active\`。

### 推荐结构

\`\`\`scss
// 设计令牌
$color-primary: #3498db;
$color-success: #27ae60;
$color-danger: #e74c3c;

// 文本
$color-text: #2c3e50;
$color-text-muted: #7f8c8d;

// 背景
$color-bg: #ffffff;
$color-bg-alt: #f7f9fc;

// 边框
$color-border: #e5e8ec;

// 间距刻度
$spacing-1: 4px;
$spacing-2: 8px;
$spacing-3: 12px;
$spacing-4: 16px;
$spacing-6: 24px;
$spacing-8: 32px;

// 圆角
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 12px;
$radius-full: 9999px;

// 字号
$font-xs: 12px;
$font-sm: 14px;
$font-base: 16px;
$font-lg: 18px;
$font-xl: 20px;
\`\`\`

---

## 命名约定进阶

### BEM 友好的变量命名

\`\`\`scss
$button__bg: $color-primary;
$button__bg--hover: $color-primary-dark;
$button__text: #fff;
$button__radius: $radius-md;
\`\`\`

### 间距刻度（4 的倍数）

\`\`\`scss
$space-0: 0;
$space-1: 4px;   // 0.25rem
$space-2: 8px;   // 0.5rem
$space-3: 12px;  // 0.75rem
$space-4: 16px;  // 1rem
$space-6: 24px;  // 1.5rem
$space-8: 32px;  // 2rem
\`\`\`

### 断点

\`\`\`scss
$bp-sm: 576px;
$bp-md: 768px;
$bp-lg: 992px;
$bp-xl: 1200px;
$bp-xxl: 1400px;
\`\`\`

### 字号

\`\`\`scss
$fs-xs: 12px;
$fs-sm: 14px;
$fs-base: 16px;
$fs-lg: 18px;
$fs-xl: 20px;
$fs-2xl: 24px;
$fs-3xl: 30px;
\`\`\`

### 层级（z-index）

\`\`\`scss
$z-base: 1;
$z-dropdown: 1000;
$z-sticky: 1020;
$z-modal: 1050;
$z-toast: 1080;
\`\`\`

> 📌 用语义化数字避免"魔法值"：\`z-index: $z-modal\` 比 \`z-index: 1050\` 可读得多。

---

## 变量作用域与 @use 的关系

第四章会详讲，这里先建立直觉：使用 \`@use\` 后，变量的"全局"范围被限制在**单个模块文件**内，跨文件需显式导入。这是 Sass 模块系统相对旧 \`@import\` 的核心改进——避免全局命名空间污染。

\`\`\`scss
// _variables.scss
$primary: #3498db;

// app.scss
@use "variables" as v;
.btn { background: v.$primary; } // 通过命名空间 v 访问
\`\`\`

---

## 常见变量陷阱

### 陷阱 1：循环引用

\`\`\`scss
$a: $b;
$b: $a; // ❌ 循环依赖，编译报错
\`\`\`

### 陷阱 2：顺序依赖

\`\`\`scss
.box { color: $x; } // 此时 $x 还没定义 → 报错
$x: red;
\`\`\`

变量必须**先定义后使用**（按求值顺序）。

### 陷阱 3：插值丢失类型

\`\`\`scss
$n: 10px;
.a { width: #{$n} + 5; } // ❌ "10px5" 字符串拼接
.a { width: $n + 5px; }  // ✅ 15px 数值运算
\`\`\`

### 陷阱 4：用 / 做除法

\`\`\`scss
$w: 100px / 4; // ⚠️ 弃用警告
$w: math.div(100px, 4); // ✅ 推荐
\`\`\`

---

## 本章代码说明

本章可编辑代码演示了变量的完整用法：

- 定义了 8 种类型的变量（数字、字符串、布尔、颜色、列表、Map、null、函数引用）。
- 用 \`!default\` 设置默认主题色，并演示覆盖。
- 用 \`!global\` 在块内修改全局计数器。
- 用 \`#{}\` 插值批量生成 \`.text-*\` / \`.bg-*\` 工具类。
- 用 \`color.adjust\` 生成 hover/active 衍生色。
- 用 Map 组织主题色板并遍历。

### 动手试试

1. 把 \`$theme: blue !default\` 改成 \`$theme: green !default\`，看主色变化。
2. 在 \`$palette\` Map 里加 \`teal: #1abc9c\`，看是否多出对应工具类。
3. 把 \`$radius-base\` 改成 \`20px\`，观察所有用它的地方。
4. 试着在 \`.counter-demo\` 里把 \`!global\` 去掉，看计数是否还累加。`,
    code: `// ============================================================
// 第二章演示：变量的完整用法
// 涵盖：8 种类型 / 作用域 / !default / !global / 插值 / Map 遍历
// 样式化预览区 .sass-demo 容器内的按钮、卡片、徽章、网格
// ============================================================

@use "sass:color";
@use "sass:math";
@use "sass:map";
@use "sass:meta";

// ---- 1. 主题配置（!default 让外部可覆盖）----
$theme: blue !default;            // 可被外部覆盖
$radius-base: 8px !default;
$gap: 16px !default;

// ---- 2. 八种数据类型演示 ----
$number: 16px;                    // 数字
$string: "PingFang SC";          // 字符串（带引号）
$identifier: sans-serif;         // 字符串（不带引号 / 标识符）
$boolean: true;                  // 布尔
$color: #3498db;                 // 颜色
$list: 576px 768px 992px;        // 列表
$null-var: null;                 // null
// 函数引用见文末 call() 示例

// ---- 3. 主题色板（Map）----
$palette: (
  primary: #3498db,
  success: #27ae60,
  warn: #f39c12,
  danger: #e74c3c,
  text: #2c3e50,
  muted: #7f8c8d,
  bg: #ffffff,
  border: #e5e8ec,
);

// 根据主题选择主色（演示 @if 流程 + 变量）
$primary: map.get($palette, primary);
@if $theme == green {
  $primary: #27ae60;
} @else if $theme == red {
  $primary: #e74c3c;
}

// 衍生色（color 函数）
$primary-hover: color.adjust($primary, $lightness: -8%);
$primary-active: color.adjust($primary, $lightness: -15%);
$primary-light: color.adjust($primary, $lightness: 30%);

// ---- 4. !global 全局累加演示 ----
$counter: 0;
.counter-demo {
  // 模拟累加：每写一次 +1（演示 !global 跨作用域修改）
  $counter: $counter + 1 !global;
  $counter: $counter + 1 !global;
  $counter: $counter + 1 !global;
  &::after {
    content: "全局计数器 = #{$counter}";
    display: block;
    font-size: 12px;
    color: map.get($palette, muted);
    margin-top: 4px;
  }
}

// ---- 5. 主容器 ----
.sass-demo {
  padding: 24px;
  background: #f7f9fc;
  border-radius: 12px;
  font-family: $string, $identifier;
  color: map.get($palette, text);

  h2 {
    margin: 0 0 12px;
    font-size: 20px;
    color: $primary;
  }

  // ---- 6. 插值批量生成工具类：.text-* / .bg-* ----
  @each $name, $value in $palette {
    .text-#{$name} { color: $value; }
    .bg-#{$name}   { background: $value; }
  }

  // ---- 7. 按钮：用衍生色演示 hover/active ----
  .btn {
    display: inline-block;
    padding: 8px 16px;
    border: none;
    border-radius: $radius-base;
    background: $primary;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    margin-right: 8px;
    transition: background 0.2s;

    &:hover { background: $primary-hover; }
    &:active { background: $primary-active; }

    &-light {
      background: $primary-light;
      color: $primary;
    }
  }

  // ---- 8. 卡片：null 控制可选属性 ----
  @mixin panel($border-color: null) {
    background: map.get($palette, bg);
    border-radius: $radius-base;
    padding: $gap;
    border: 1px solid $border-color; // null 时不输出此行
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .card {
    @include panel; // 不带边框（border-color 为 null）
    margin-bottom: $gap;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .card-body {
      font-size: 14px;
      line-height: 1.6;
      color: map.get($palette, muted);
    }
  }

  .card-bordered {
    @include panel(map.get($palette, border));
  }

  // ---- 9. 徽章：列表 + @each 双层遍历 ----
  $badges: (success #27ae60, warn #f39c12, danger #e74c3c);
  @each $name, $color in $badges {
    .badge-#{$name} {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      color: $color;
      background: color.adjust($color, $lightness: 35%);
      margin-right: 6px;
    }
  }

  // ---- 10. 函数引用 + meta.call() ----
  @function double($n) {
    @return $n * 2;
  }
  $fn: meta.get-function("double");
  .fn-demo {
    padding: meta.call($fn, 8px); // 16px
    background: #fff8e1;
    border-radius: $radius-base;
    font-size: 13px;
  }

  // ---- 11. 网格：math.div + 列表断点 ----
  .grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $gap;
    margin-top: $gap;
  }
  .grid-item {
    background: #fff;
    border-radius: $radius-base;
    padding: math.div($gap, 2);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    font-size: 13px;
    text-align: center;
  }
}
`,
  },

  // =========================================================
  // 第三章：嵌套 Nesting
  // =========================================================
  {
    id: "sass-nesting",
    group: "基础",
    icon: "🪆",
    title: "嵌套 Nesting",
    content: `## 嵌套：让选择器贴合 HTML 结构

嵌套（Nesting）是 Sass 第二大常用特性。它让你**按 HTML 层级**把选择器一层层写进去，避免重复敲父选择器，结构也更清晰。

### 不用嵌套（纯 CSS）

\`\`\`css
.nav { background: #333; }
.nav ul { list-style: none; margin: 0; padding: 0; }
.nav ul li { display: inline-block; }
.nav ul li a { color: #fff; text-decoration: none; padding: 8px 12px; }
.nav ul li a:hover { color: #3498db; }
.nav ul li a.active { color: #3498db; font-weight: bold; }
\`\`\`

\`.nav ul li a\` 这串前缀写了 4 遍。

### 用嵌套（SCSS）

\`\`\`scss
.nav {
  background: #333;

  ul {
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      display: inline-block;

      a {
        color: #fff;
        text-decoration: none;
        padding: 8px 12px;

        &:hover { color: #3498db; }
        &.active { color: #3498db; font-weight: bold; }
      }
    }
  }
}
\`\`\`

编译后**完全等价**于上面的纯 CSS。结构一目了然，对应 HTML 的层级。

---

## 嵌套的编译规则

Sass 嵌套编译时，会把**内层选择器**和**外层选择器**用**后代选择器（空格）**拼接：

\`\`\`scss
.parent {
  .child { ... }
}
// → .parent .child { ... }
\`\`\`

多层嵌套层层拼接：

\`\`\`scss
.a {
  .b {
    .c { ... }
  }
}
// → .a .b .c { ... }
\`\`\`

> 🔑 这是"后代选择器"拼接。如果想要"复合选择器"（如 \`.a.b\` 或 \`.a:hover\`），就要用 \`&\`。

---

## & 父选择器引用

\`&\` 是嵌套里最重要的符号，代表**外层选择器的完整字符串**。它让你在嵌套内引用父选择器，拼接出复合选择器。

### 用法 1：伪类 / 伪元素

\`\`\`scss
.btn {
  background: #3498db;
  &:hover { background: #2980b9; }     // .btn:hover
  &:focus { outline: 2px solid #3498db; } // .btn:focus
  &::before { content: "★"; }            // .btn::before
}
\`\`\`

编译：

\`\`\`css
.btn { background: #3498db; }
.btn:hover { background: #2980b9; }
.btn:focus { outline: 2px solid #3498db; }
.btn::before { content: "★"; }
\`\`\`

### 用法 2：修饰符类（&.modifier）

\`\`\`scss
.btn {
  background: #3498db;
  &.active { background: #2980b9; }    // .btn.active
  &.disabled { opacity: 0.5; }         // .btn.disabled
}
\`\`\`

注意 \`&.active\` 生成 \`.btn.active\`（同一元素同时有 btn 和 active 两个类），而非 \`.btn .active\`（后代）。

### 用法 3：后缀拼接（&-suffix）

\`&\` 后直接接字符串，会拼成新类名：

\`\`\`scss
.btn {
  background: #3498db;
  &-primary { background: #3498db; }   // .btn-primary
  &-danger  { background: #e74c3c; }   // .btn-danger
  &-success { background: #27ae60; }   // .btn-success
}
\`\`\`

这是 BEM 命名（\`.btn\`、\`.btn--primary\`）的常用写法。但要注意：\`&-\` 拼接依赖父选择器字面量，如果父选择器是复合的（如 \`.a .b\`），拼接会很奇怪（见陷阱节）。

### 用法 4：& 在选择器中间

\`&\` 不一定在开头，可以出现在选择器任意位置：

\`\`\`scss
.sidebar {
  // 反向选择：.sidebar 被包含在 .dark 里
  .dark & { background: #1a1a1a; }  // → .dark .sidebar
}
\`\`\`

编译：

\`\`\`css
.dark .sidebar { background: #1a1a1a; }
\`\`\`

这个技巧常用于"父级容器不同状态时改变本组件样式"。

### 用法 5：& 重复出现

\`\`\`scss
.btn {
  & + & { margin-left: 8px; } // → .btn + .btn（相邻两个按钮间距）
}
\`\`\`

### 用法 6：& 用于精确选择复合上下文

\`\`\`scss
.card {
  // 仅当 .card 同时有 .highlight 类
  &.highlight { border-color: gold; }
  // 仅当 .card 在 .grid 内
  .grid & { margin-bottom: 0; }
}
\`\`\`

---

## & 拼接后缀的详细规则

\`&-suffix\` 是最易出错的地方，仔细看。

### 简单父选择器

\`\`\`scss
.btn {
  &-primary { ... } // .btn-primary ✅
}
\`\`\`

### 复合父选择器（伪类）

\`\`\`scss
.btn {
  &:hover {
    &-text { ... } // .btn:hover-text ⚠️ 这是个合法但奇怪的类名
  }
}
\`\`\`

### 多元素父选择器（后代）

\`\`\`scss
.nav .item {
  &-active { ... } // .nav .item-active ⚠️ 只有最后一个被拼接
}
\`\`\`

这里 \`&\` = \`.nav .item\`，\`&-active\` = \`.nav .item-active\`（不是 \`.nav .item .item-active\`）。容易踩坑，**避免在后代选择器上下文用后缀拼接**。

### & 与 BEM

\`\`\`scss
.card {
  &__title { ... }   // .card__title
  &__body  { ... }   // .card__body
  &--flat { ... }    // .card--flat

  &__title {
    &--lg { ... }    // .card__title--lg
  }
}
\`\`\`

---

## 嵌套层级建议：不超过 3 层

嵌套虽好，**过深则有害**。规则：**嵌套层级尽量不超过 3 层**。

### 过深嵌套的问题

\`\`\`scss
// ❌ 反面教材：5 层嵌套
.header {
  .nav {
    .menu {
      .item {
        .link {
          color: #3498db;
        }
      }
    }
  }
}
\`\`\`

编译出：

\`\`\`css
.header .nav .menu .item .link { color: #3498db; }
\`\`\`

问题：

1. **选择器过长**：5 层后代选择器，浏览器匹配开销大（虽然现代浏览器优化后影响小，但仍是反模式）。
2. **特异性过高**：5 类选择器特异性 = (0,5,0)，难以被覆盖，后续维护要靠更长的选择器或 \`!important\`，陷入军备竞赛。
3. **强耦合 HTML 结构**：HTML 层级一变，样式全崩。
4. **可读性下降**：缩进过深，难以一眼看清。

### 重构建议

\`\`\`scss
// ✅ 扁平化：直接用 BEM 类名
.header {
  .nav-link { color: #3498db; }
  .nav-link:hover { color: #2980b9; }
}
\`\`\`

或：

\`\`\`scss
.nav-link {
  color: #3498db;
  &:hover { color: #2980b9; }
}
\`\`\`

> 📏 **经验法则**：如果你写嵌套时需要滚屏才能看到底，说明它太深了。超过 3 层就该考虑用更具体的类名扁平化。

---

## @at-root：跳出嵌套

有时候你在嵌套内，但想生成的选择器**不希望**带上父级前缀。用 \`@at-root\` 跳出嵌套上下文。

### 基本用法

\`\`\`scss
.card {
  background: #fff;
  border-radius: 8px;

  // 想生成 .card-title，但不想被 .card 嵌套影响？其实直接 &__title 就行
  // @at-root 真正有用的场景是 media 查询和复杂选择器

  @at-root .card-wrapper {
    display: flex;
  }
}
\`\`\`

编译：

\`\`\`css
.card { background: #fff; border-radius: 8px; }
.card-wrapper { display: flex; } /* 不带 .card 前缀 */
\`\`\`

### @at-root 与 media 查询（最常用）

最常见的 \`@at-root\` 场景是把 \`@media\` 拉到顶层，避免它嵌在父选择器里：

\`\`\`scss
.card {
  width: 100%;

  @at-root (with: media) {
    @media (min-width: 768px) {
      width: 50%;
    }
  }
}
\`\`\`

或更简洁的现代写法：

\`\`\`scss
.card {
  width: 100%;

  @media (min-width: 768px) {
    width: 50%;
  }
}
\`\`\`

> 💡 现代 Sass 中 \`@media\` 即使嵌套也会被提升到顶层（CSS 规范允许 media 嵌套，等价于提升），所以 \`@at-root (with: media)\` 用得少了。但 \`@supports\`、\`@keyframes\` 等仍可能需要它。

### @at-root 配合 &

\`\`\`scss
.card {
  &__title { ... }

  // 在嵌套内定义一个完全独立的选择器
  @at-root .card-variants {
    .variant-a { ... }
    .variant-b { ... }
  }
}
\`\`\`

---

## 嵌套与 BEM 命名

BEM（Block Element Modifier）是流行的 CSS 命名方法论：\`block__element--modifier\`。Sass 嵌套 + \`&\` 是写 BEM 的绝佳组合。

### BEM 结构

- **Block**：独立的组件，如 \`.card\`。
- **Element**：组件的子部分，如 \`.card__title\`、\`.card__body\`。
- **Modifier**：组件的变体或状态，如 \`.card--flat\`、\`.card__title--lg\`。

### 用嵌套写 BEM

\`\`\`scss
.card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;

  &__title {
    font-size: 18px;
    font-weight: bold;

    &--lg { font-size: 24px; }   // .card__title--lg
    &--sm { font-size: 14px; }   // .card__title--sm
  }

  &__body {
    font-size: 14px;
    color: #555;
  }

  &--flat {
    box-shadow: none;
    border: 1px solid #eee;
  }

  &--highlighted {
    border-color: gold;
  }
}
\`\`\`

编译出干净的 BEM 类名，无过深嵌套，特异性都是 (0,1,0) 或 (0,2,0)，易覆盖、易维护。

### BEM + @each 批量生成 Modifier

\`\`\`scss
$colors: (primary #3498db, success #27ae60, danger #e74c3c);

.btn {
  @each $name, $color in $colors {
    &--#{$name} {
      background: $color;
      &:hover { background: color.adjust($color, $lightness: -10%); }
    }
  }
}
// 生成 .btn--primary / .btn--success / .btn--danger
\`\`\`

---

## 嵌套陷阱

### 陷阱 1：过度嵌套（见上文）

3 层以上就要警惕。

### 陷阱 2：复制 HTML 结构

不要机械地把 HTML 每一层都嵌套进 SCSS：

\`\`\`scss
// ❌ 反面：HTML 有几层就嵌几层
body {
  header {
    nav {
      ul {
        li {
          a { color: #3498db; }
        }
      }
    }
  }
}
\`\`\`

应该给关键元素加类名，扁平化：

\`\`\`scss
// ✅
.nav-link { color: #3498db; }
\`\`\`

### 陷阱 3：& 后缀拼接在复合上下文

\`\`\`scss
// ❌
.nav .item {
  &-active { ... } // 生成 .nav .item-active，不是你想要的 .nav .item.active
}
\`\`\`

想要 \`.nav .item.active\`，应该：

\`\`\`scss
.nav .item {
  &.active { ... } // ✅ .nav .item.active
}
\`\`\`

### 陷阱 4：嵌套媒体查询误以为作用域隔离

\`\`\`scss
.card {
  width: 100%;

  @media (min-width: 768px) {
    width: 50%;
    .title { font-size: 24px; } // 这是在 media 内，编译为 @media { .card .title {...} }
  }
}
\`\`\`

这里 \`.title\` 仍带 \`.card\` 前缀，且只在 media 内生效。理解清楚再写。

### 陷阱 5：嵌套顺序影响覆盖

\`\`\`scss
.btn {
  color: white;
  &.primary { color: blue; }
  &:hover { color: red; } // hover 在 .primary 之后，特异性相同，会覆盖 .primary 的 color
}
\`\`\`

\`.btn.primary:hover\` 时颜色是 red 还是 blue？取决于源码顺序和组合。需要时用更具体选择器：

\`\`\`scss
&.primary:hover { color: darkblue; }
\`\`\`

---

## 嵌套生成的 CSS 对比

理解嵌套"编译成什么 CSS"是掌握嵌套的关键。看几个对比。

### 例 1：基本嵌套

\`\`\`scss
.card {
  .title { font-size: 18px; }
}
\`\`\`
\`\`\`css
.card .title { font-size: 18px; }
\`\`\`

### 例 2：& 伪类

\`\`\`scss
.card {
  &:hover { box-shadow: 0 4px 12px #000; }
}
\`\`\`
\`\`\`css
.card:hover { box-shadow: 0 4px 12px #000; }
\`\`\`

### 例 3：&.modifier

\`\`\`scss
.card {
  &.flat { box-shadow: none; }
}
\`\`\`
\`\`\`css
.card.flat { box-shadow: none; }
\`\`\`

### 例 4：&-suffix

\`\`\`scss
.card {
  &-title { font-size: 18px; }
}
\`\`\`
\`\`\`css
.card-title { font-size: 18px; }
\`\`\`

### 例 5：& 在中间

\`\`\`scss
.card {
  .dark & { background: #333; }
}
\`\`\`
\`\`\`css
.dark .card { background: #333; }
\`\`\`

### 例 6：& + &

\`\`\`scss
.btn {
  & + & { margin-left: 8px; }
}
\`\`\`
\`\`\`css
.btn + .btn { margin-left: 8px; }
\`\`\`

### 例 7：组合

\`\`\`scss
.nav {
  ul {
    li {
      a {
        &:hover, &.active { color: #3498db; }
      }
    }
  }
}
\`\`\`
\`\`\`css
.nav ul li a:hover,
.nav ul li a.active { color: #3498db; }
\`\`\`

---

## 嵌套与属性嵌套

除了选择器嵌套，Sass 还支持**属性嵌套**：把同前缀的属性用 \`:\` 嵌套。

\`\`\`scss
.card {
  border: {
    width: 1px;
    style: solid;
    color: #eee;
    radius: 8px;
  }
  margin: {
    top: 16px;
    bottom: 16px;
  }
  font: {
    family: sans-serif;
    size: 14px;
    weight: 400;
  }
}
\`\`\`

编译：

\`\`\`css
.card {
  border-width: 1px;
  border-style: solid;
  border-color: #eee;
  border-radius: 8px;
  margin-top: 16px;
  margin-bottom: 16px;
  font-family: sans-serif;
  font-size: 14px;
  font-weight: 400;
}
\`\`\`

> 💡 属性嵌套是"语法糖"，对可读性有一定帮助，但也让属性分布不直观。团队按需取舍，用得不多。

---

## 嵌套与选择器特异性

嵌套会增加生成 CSS 的特异性。理解这点对调试覆盖问题很重要。

- \`.btn\` 特异性 (0,1,0)
- \`.btn .icon\` 特异性 (0,2,0)
- \`.btn .icon i\` 特异性 (0,2,1)

嵌套越深，特异性越高，越难被覆盖。这也是"不超过 3 层"的另一层原因。

### 用 @at-root 降低特异性

\`\`\`scss
.card {
  @at-root .card-title {
    // 这里生成的 .card-title 特异性只有 (0,1,0)，易覆盖
    font-size: 18px;
  }
}
\`\`\`

---

## 嵌套的最佳实践总结

1. **层级 ≤ 3**：超过就扁平化。
2. **优先用类名而非 HTML 标签**：嵌套 \`.nav .link\` 而非 \`nav ul li a\`。
3. **\`&\` 用于伪类、修饰符、后缀**，但避免在复合上下文用后缀。
4. **BEM + 嵌套**是黄金组合，特异性低、结构清晰。
5. **媒体查询可嵌套**，但心里清楚它会被提升到顶层。
6. **不机械复制 HTML**：嵌套反映"逻辑包含"而非"DOM 字面层级"。
7. **定期看编译产物**：嵌套太深的征兆就是产物里出现超长选择器。

---

## 本章代码说明

本章可编辑代码演示了嵌套的完整用法：

- 导航 \`.nav\` 嵌套 \`ul\`/\`li\`/\`a\`，展示基本嵌套。
- \`.btn\` 用 \`&:hover\`/\`&.active\`/\`&-primary\`/\`&-danger\` 演示 \`&\` 各种用法。
- \`.card\` 用 BEM 命名（\`&__title\`/\`&__body\`/\`&--flat\`）展示 BEM + 嵌套。
- \`@each\` + \`&--#{$name}\` 批量生成按钮 modifier。
- \`@at-root\` 演示跳出嵌套。
- 一个"反面教材"\`.over-nested\` 展示过深嵌套的产物，供对比。

### 动手试试

1. 在 \`.btn\` 里加一个 \`&-success\`，看生成的 \`.btn-success\`。
2. 把 \`.over-nested\` 的层数减少到 2 层，对比编译产物长度。
3. 修改 \`@each\` 的颜色 Map，加一个 \`info\`，看是否多出 \`.btn--info\`。
4. 试着把 \`&__title\` 改成 \`__title\`（去掉 &），看编译产物有什么不同（会变成 \`.card __title\` 后代选择器，错的）。`,
    code: `// ============================================================
// 第三章演示：嵌套的完整用法
// 涵盖：选择器嵌套 / & 各种用法 / BEM / @at-root / 批量 modifier
// 样式化预览区 .sass-demo 容器内的导航、按钮、卡片、列表
// ============================================================

@use "sass:color";

// ---- 设计变量 ----
$primary: #3498db;
$primary-dark: #2980b9;
$radius: 8px;
$gap: 16px;

// 颜色 Map，配合 @each 批量生成 modifier
$btn-colors: (
  primary: #3498db,
  success: #27ae60,
  warn: #f39c12,
  danger: #e74c3c,
);

.sass-demo {
  padding: 24px;
  background: #f7f9fc;
  border-radius: 12px;
  font-family: -apple-system, "PingFang SC", sans-serif;
  color: #2c3e50;

  h2 {
    margin: 0 0 12px;
    font-size: 20px;
    color: $primary;
  }

  // ---- 1. 基本嵌套：导航 ----
  .nav {
    background: #2c3e50;
    border-radius: $radius;
    padding: 0 $gap;

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;

      li {
        margin-right: 4px;

        a {
          display: block;
          padding: 10px 14px;
          color: #cfd8e3;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;

          // & 父选择器：伪类
          &:hover {
            color: #fff;
          }

          // &.modifier：复合选择器
          &.active {
            color: #fff;
            font-weight: 600;
            border-bottom: 2px solid $primary;
          }
        }
      }
    }
  }

  // ---- 2. & 的多种用法：按钮 ----
  .btn {
    display: inline-block;
    padding: 8px 16px;
    border: none;
    border-radius: $radius;
    background: $primary;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    margin: 4px 4px 4px 0;
    transition: background 0.2s, transform 0.1s;

    // &:hover 伪类
    &:hover {
      background: $primary-dark;
    }

    // &:active 伪类
    &:active {
      transform: translateY(1px);
    }

    // &:focus 伪类
    &:focus {
      outline: 2px solid color.adjust($primary, $lightness: 20%);
      outline-offset: 2px;
    }

    // &.modifier 复合类
    &.active {
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    // &-suffix 后缀拼接：生成 .btn-primary / .btn-danger
    &-outline {
      background: transparent;
      color: $primary;
      border: 1px solid $primary;

      &:hover {
        background: $primary;
        color: #fff;
      }
    }

    // & + & 相邻兄弟
    & + & {
      margin-left: 8px;
    }
  }

  // ---- 3. @each + & 批量生成 modifier（BEM 风格）----
  @each $name, $c in $btn-colors {
    .btn--#{$name} {
      background: $c;

      &:hover {
        background: color.adjust($c, $lightness: -8%);
      }

      &:active {
        background: color.adjust($c, $lightness: -15%);
      }
    }
  }

  // ---- 4. BEM 命名 + 嵌套 ----
  .card {
    background: #fff;
    border-radius: $radius;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    margin-bottom: $gap;
    overflow: hidden;

    // Block 内嵌套 Element：用 & 拼接 __title / __body
    &__header {
      padding: $gap;
      background: $primary;
      color: #fff;
    }

    &__title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    &__body {
      padding: $gap;
      font-size: 14px;
      line-height: 1.6;
      color: #5a6478;
    }

    &__footer {
      padding: $gap;
      border-top: 1px solid #eef0f4;
      display: flex;
      justify-content: flex-end;
    }

    // Modifier：&--flat / &--highlighted
    &--flat {
      box-shadow: none;
      border: 1px solid #e5e8ec;
    }

    &--highlighted {
      border: 2px solid color.adjust($primary, $lightness: 10%);
    }
  }

  // ---- 5. @at-root 跳出嵌套 ----
  .panel {
    padding: $gap;
    background: #fff;
    border-radius: $radius;

    &__title {
      font-weight: 600;
      margin-bottom: 8px;
    }

    // 用 @at-root 在嵌套内定义一个不带 .panel 前缀的独立选择器
    @at-root .panel-cta {
      display: inline-block;
      margin-top: 8px;
      padding: 6px 12px;
      background: $primary;
      color: #fff;
      border-radius: $radius;
      font-size: 13px;

      &:hover {
        background: $primary-dark;
      }
    }
  }

  // ---- 6. 反面教材：过深嵌套（不要学）----
  // 编译产物会是一长串后代选择器，特异性高、难覆盖
  .over-nested {
    .level1 {
      .level2 {
        .level3 {
          padding: 8px;
          color: $primary;
          font-size: 13px;
        }
      }
    }
  }

  // ---- 7. 属性嵌套演示 ----
  .prop-nested {
    border: {
      width: 1px;
      style: solid;
      color: #e5e8ec;
      radius: $radius;
    }
    margin: {
      top: 8px;
      bottom: 8px;
    }
    padding: $gap;
    background: #fff;
  }

  // ---- 8. 媒体查询嵌套 ----
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr;
    gap: $gap;

    @media (min-width: 768px) {
      grid-template-columns: 1fr 1fr;
    }

    .grid-item {
      background: #fff;
      border-radius: $radius;
      padding: $gap;
      font-size: 13px;
    }
  }
}
`,
  },

  // =========================================================
  // 第四章：分片与 @use / @forward
  // =========================================================
  {
    id: "sass-partials",
    group: "基础",
    icon: "📁",
    title: "分片与 @use / @forward",
    content: `## 分片：把样式拆成模块

随着项目变大，把所有样式堆在一个 \`.scss\` 文件里不可维护。Sass 提供**分片（partial）**机制，让你把样式按职责拆成多个小文件，再组合引入。

### _partial.scss 命名约定

Sass 规定：**以 \`_\` 开头的 \`.scss\` 文件是"分片"**，不会被单独编译成 CSS，只能被其他文件 \`@use\` / \`@forward\` 引入。

\`\`\`
styles/
├── app.scss              ← 入口文件（无 _，会被编译）
├── _variables.scss       ← 分片：变量
├── _mixins.scss          ← 分片：混入
├── _functions.scss       ← 分片：函数
├── _buttons.scss         ← 分片：按钮样式
├── _card.scss            ← 分片：卡片样式
└── _index.scss           ← 分片：索引（聚合）
\`\`\`

为什么用 \`_\` 前缀？

1. **告诉 Sass 不要单独编译它**：\`_variables.scss\` 不会生成 \`_variables.css\`。
2. **视觉上标识"这是模块零件"**：一眼看出哪些是入口、哪些是分片。
3. **避免产物污染**：只编译入口，分片通过入口聚合输出。

### 引用时省略 _ 和扩展名

\`\`\`scss
@use "variables";    // 实际是 _variables.scss
@use "mixins" as m;  // _mixins.scss，别名 m
\`\`\`

Sass 会自动找 \`_variables.scss\`、\`_variables.sass\`、\`variables.scss\` 等。

---

## @import：旧语法及其问题

\`@import\` 是 Sass 早期的引入语法，**已被官方弃用（deprecated）**，新项目不要用，老项目要迁移。

### 旧语法示例

\`\`\`scss
// _variables.scss
$primary: #3498db;

// app.scss
@import "variables";
.btn { background: $primary; } // 直接用，无命名空间
\`\`\`

### @import 的核心问题

1. **全局命名空间污染**：所有 \`@import\` 进来的变量、mixin、函数都变成**全局**的，跨文件可能重名冲突，且来源难追溯。
2. **每次 @import 都重新加载求值**：如果 A 和 B 都 import 了 C，C 被求值两次，CSS 输出可能重复，性能也差。
3. **无法控制可见性**：被 import 的文件里所有顶层成员都暴露，没法只导出一部分。
4. **难以追踪依赖**：变量从哪来？要全项目搜索。
5. **与现代模块化理念相悖**：没有显式导入绑定。

### 官方态度

Sass 团队明确**弃用 \`@import\`**，未来版本会移除。新代码一律用 \`@use\` / \`@forward\`。迁移命令：

\`\`\`bash
sass-migrator module --migrate-deps ./app.scss
\`\`\`

> ⚠️ 看到 \`@import\` 要警惕：要么是老代码，要么是过时教程。本教程不教授 \`@import\` 写法，只讲 \`@use\`。

---

## @use：新语法（命名空间隔离）

\`@use\` 是 Sass 模块系统的核心。它**加载一个文件一次**，并将其成员（变量、mixin、函数）通过**命名空间**暴露给使用者。

### 基本用法

\`\`\`scss
// _variables.scss
$primary: #3498db;
$radius: 8px;

// _mixins.scss
@mixin card($bg) {
  background: $bg;
  border-radius: 8px;
}

// app.scss
@use "variables";       // 默认命名空间是文件名（去 _ 去扩展名）
@use "mixins";

.btn {
  background: variables.$primary;     // 用 命名空间.变量名 访问
  border-radius: variables.$radius;
  @include mixins.card(#fff);          // 用 命名空间.mixin名 调用
}
\`\`\`

### 三大改进

1. **命名空间隔离**：\`variables.$primary\` 一看就知道来自 variables 模块，不会和别的同名变量冲突。
2. **只加载一次**：即使多个文件 \`@use\` 同一个模块，该模块也只求值一次，CSS 不重复。
3. **显式绑定**：依赖关系清晰，从哪来一目了然。

### 默认命名空间规则

\`\`\`scss
@use "variables";        // 命名空间：variables
@use "components/button"; // 命名空间：button（取最后一段）
@use "utils/math-helpers"; // 命名空间：math-helpers
\`\`\`

---

## @use 的 as 别名

命名空间太长或想简化，用 \`as\` 起别名：

\`\`\`scss
@use "variables" as v;       // 命名空间改为 v
@use "mixins" as m;
@use "components/button" as btn;

.btn {
  background: v.$primary;    // 用别名访问
  @include m.card(#fff);
}
\`\`\`

### as * ：无命名空间（不推荐）

\`\`\`scss
@use "variables" as *;  // 不加命名空间，所有成员直接可用
.btn { background: $primary; }
\`\`\`

> ⚠️ \`as *\` 退化为类似 \`@import\` 的全局污染，失去命名空间优势，**不推荐**，除非极简脚本。

---

## @use 的 with：配置默认值

\`with\` 用于在引入时**覆盖被引模块的 \`!default\` 变量**。这是配置主题色的标准做法。

### 被引模块用 !default 定义默认

\`\`\`scss
// _theme.scss
$primary: #3498db !default;
$radius: 8px !default;

.btn {
  background: $primary;
  border-radius: $radius;
}
\`\`\`

### 使用者用 with 覆盖

\`\`\`scss
// app.scss
@use "theme" with (
  $primary: #e74c3c,   // 覆盖为红色主题
  $radius: 12px
);
\`\`\`

\`with\` 里的值会**优先于**模块内的 \`!default\`。如果模块内变量没加 \`!default\`，\`with\` 覆盖会报错（不能强制覆盖非默认值）。

### 用途：可配置的样式库

\`\`\`scss
// my-ui-library/_config.scss
$color-primary: #3498db !default;
$color-danger: #e74c3c !default;
$font-base: 16px !default;

// 项目里
@use "my-ui-library/config" with (
  $color-primary: #6c5ce7,
  $font-base: 15px
);
\`\`\`

> 🎯 \`@use ... with\` + \`!default\` 是 Sass 实现可配置主题的标准模式，相当于库的"配置入口"。

---

## @forward：转发模块

\`@forward\` 用于**把一个模块的成员再转发出去**，自己不使用。常用于构建"聚合入口"（barrel file）。

### 基本用法

\`\`\`scss
// _index.scss（聚合入口）
@forward "variables";
@forward "mixins";
@forward "functions";
@forward "buttons";
\`\`\`

使用者只需引入一个文件：

\`\`\`scss
// app.scss
@use "my-library" as lib;
.btn { background: lib.$primary; }
\`\`\`

\`lib.$primary\` 实际来自 \`_variables.scss\`，但通过 \`_index.scss\` 转发聚合，使用者无感知。

### @forward 的 as：转发时改名

\`\`\`scss
// _index.scss
@forward "variables" as var-*; // 转发的变量加 var- 前缀
\`\`\`

使用者访问 \`lib.var-primary\`（原 \`$primary\` 被转发为 \`$var-primary\`）。用于避免多个子模块间命名冲突。

### @forward hide / show：控制可见性

\`\`\`scss
// _index.scss
@forward "mixins" hide card;       // 转发 mixins，但不暴露 card mixin
@forward "variables" show $primary; // 只暴露 $primary，其余隐藏
\`\`\`

用于构建"公开 API"：内部模块有很多成员，只通过 \`@forward show\` 暴露一部分给外部。

### @use vs @forward 区别

| 维度 | \`@use\` | \`@forward\` |
| --- | --- | --- |
| **目的** | 引入并**使用**模块成员 | **转发**成员给下游 |
| **本文件能否用** | ✅ 能用 | ❌ 不能用（只是转发） |
| **命名空间** | 当前文件获得命名空间 | 不创建命名空间，成员"穿透" |
| **典型场景** | 在组件里用变量/mixin | 在 \`_index.scss\` 聚合多个模块 |

> 🔑 记忆：\`@use\` = "我要用"；\`@forward\` = "我帮你转交"。

---

## 内置模块：sass:math / color / map / list / string

除了自定义模块，Sass 还提供**内置模块**，用 \`@use "sass:xxx"\` 引入（注意 \`sass:\` 前缀）。

\`\`\`scss
@use "sass:math";
@use "sass:color";
@use "sass:map";
@use "sass:list";
@use "sass:string";
@use "sass:meta";

$w: math.div(100, 3);            // 除法
$light: color.adjust(#3498db, $lightness: 20%); // 提亮
$val: map.get((a: 1, b: 2), a);   // 取 Map 值
$first: list.nth(1 2 3, 1);       // 取列表第 1 项
$upper: string.to-upper-case("abc"); // 转大写
$type: meta.type-of($w);          // 类型判断
\`\`\`

> ⚠️ 旧的全局函数（\`lighten()\`、\`map-get()\`、\`nth()\` 等）已被弃用，统一用模块函数。本教程代码全部用模块形式。

---

## 模块化组织项目结构

一个成熟 Sass 项目的典型结构：

\`\`\`
styles/
├── app.scss                 ← 唯一入口
├── abstracts/               ← 抽象层（不产出 CSS）
│   ├── _variables.scss      ← 设计令牌
│   ├── _functions.scss      ← 自定义函数
│   ├── _mixins.scss         ← 混入
│   └── _index.scss          ← @forward 聚合
├── base/                    ← 基础层
│   ├── _reset.scss          ← 重置/normalize
│   ├── _typography.scss     ← 排版
│   └── _index.scss
├── components/              ← 组件层
│   ├── _buttons.scss
│   ├── _cards.scss
│   ├── _forms.scss
│   └── _index.scss
├── layout/                  ← 布局层
│   ├── _grid.scss
│   ├── _header.scss
│   └── _index.scss
├── pages/                   ← 页面层
│   ├── _home.scss
│   └── _index.scss
└── themes/                  ← 主题层
    ├── _dark.scss
    └── _index.scss
\`\`\`

### 入口文件 app.scss

\`\`\`scss
@use "abstracts" as abs;     // 抽象层（变量/函数/mixin）
@use "base";                  // 基础重置与排版
@use "layout";                // 布局
@use "components";            // 组件
@use "pages";                 // 页面特定
@use "themes";                // 主题
\`\`\`

### 抽象层 _index.scss（@forward 聚合）

\`\`\`scss
// abstracts/_index.scss
@forward "variables";
@forward "functions";
@forward "mixins";
\`\`\`

组件文件按需引入抽象层：

\`\`\`scss
// components/_buttons.scss
@use "../abstracts" as abs;

.btn {
  background: abs.$primary;
  @include abs.card(abs.$radius);
}
\`\`\`

---

## _variables.scss / _mixins.scss / _functions.scss 拆分实践

### _variables.scss：只放"纯值"

\`\`\`scss
// _variables.scss
// ---- 颜色 ----
$color-primary: #3498db;
$color-success: #27ae60;
$color-danger: #e74c3c;

// ---- 间距 ----
$spacing-1: 4px;
$spacing-2: 8px;
$spacing-4: 16px;

// ---- 圆角 ----
$radius-sm: 4px;
$radius-md: 8px;

// ---- 字体 ----
$font-base: 16px;
$font-family: -apple-system, sans-serif;

// ---- 断点 ----
$bp-md: 768px;
$bp-lg: 992px;
\`\`\`

### _functions.scss：放"计算逻辑"

\`\`\`scss
// _functions.scss
@use "sass:math";
@use "sass:map";
@use "variables" as v;

@function spacing($n) {
  @return map.get((
    1: v.$spacing-1,
    2: v.$spacing-2,
    4: v.$spacing-4,
  ), $n);
}

@function rem($px) {
  @return math.div($px, 16px) * 1rem;
}
\`\`\`

### _mixins.scss：放"可复用样式片段"

\`\`\`scss
// _mixins.scss
@use "sass:color";
@use "variables" as v;

@mixin button($bg) {
  background: $bg;
  color: #fff;
  padding: v.$spacing-2 v.$spacing-4;
  border-radius: v.$radius-md;
  &:hover { background: color.adjust($bg, $lightness: -8%); }
}

@mixin breakpoint($bp) {
  @if $bp == md { @media (min-width: v.$bp-md) { @content; } }
  @else if $bp == lg { @media (min-width: v.$bp-lg) { @content; } }
}
\`\`\`

### 三者关系

- **variables**：被 functions 和 mixins 引入。
- **functions**：被 mixins 或组件引入，用于计算。
- **mixins**：被组件引入，输出样式。

依赖方向单向：variables ← functions ← mixins ← components，避免循环。

---

## @use vs @import 对比

| 维度 | \`@use\` | \`@import\`（已弃用） |
| --- | --- | --- |
| **命名空间** | ✅ 有，隔离干净 | ❌ 全局污染 |
| **加载次数** | 1 次（缓存） | 每次 import 都重新求值 |
| **CSS 重复** | 无 | 可能重复 |
| **可见性控制** | ✅ 私有成员（\`-\` 开头）不暴露 | ❌ 全暴露 |
| **配置默认值** | ✅ \`with\` | ❌ 靠书写顺序 |
| **官方支持** | ✅ 推荐 | ❌ 弃用，将移除 |
| **成员来源可追溯** | ✅ 命名空间一目了然 | ❌ 全局难追踪 |
| **学习成本** | 略高（要理解命名空间） | 低（像 CSS import） |

### 私有成员约定

\`@use\` 模块里以 \`-\` 或 \`_\` 开头的成员**不会**被导出：

\`\`\`scss
// _helpers.scss
$-internal: #333;   // 私有，外部 @use 拿不到
@function -helper() { @return ...; }  // 私有

$public: #fff;      // 公开
@function public-fn() { @return -helper(); } // 公开，内部可调私有
\`\`\`

这是 \`@use\` 相对 \`@import\` 的重要能力：**封装**。

---

## 索引文件 _index.scss

每个目录放一个 \`_index.scss\`，用 \`@forward\` 聚合目录内所有分片。这样使用者只需引入目录名：

\`\`\`scss
// components/_index.scss
@forward "buttons";
@forward "cards";
@forward "forms";

// app.scss
@use "components";  // 自动加载 _index.scss，等于引入了 buttons/cards/forms
\`\`\`

> 💡 Sass 在 \`@use "components"\` 时会自动找 \`components/_index.scss\`，类似 Node 找 \`index.js\`。这让"目录即模块"成为可能。

---

## 嵌套 @use

模块之间也可以互相 \`@use\`。Sass 保证每个模块**只被求值一次**，循环依赖会报错。

\`\`\`scss
// _a.scss
@use "b" as b;
$from-b: b.$value;

// _b.scss
@use "a" as a;  // ❌ 循环依赖，编译报错
\`\`\`

### 解决循环依赖

把共享的部分抽到第三个模块：

\`\`\`scss
// _shared.scss
$value: 1;

// _a.scss
@use "shared" as s;

// _b.scss
@use "shared" as s;
\`\`\`

a 和 b 都依赖 shared，但彼此不依赖，无循环。

---

## @use 的注意事项

### 1. @use 必须在文件顶部

\`\`\`scss
.btn { color: red; }
@use "variables";  // ❌ 报错，@use 必须在所有规则之前
\`\`\`

### 2. 同一文件只能 @use 一次

\`\`\`scss
@use "variables";
@use "variables";  // ❌ 重复加载报错（其实只生效第一个，但写法违规）
\`\`\`

### 3. CSS 规则也会被引入

\`@use\` 一个含 CSS 规则的模块，那些 CSS 也会出现在最终产物里（且只出现一次）：

\`\`\`scss
// _reset.scss
* { margin: 0; padding: 0; box-sizing: border-box; }

// app.scss
@use "reset";  // 产出的 CSS 包含 * { margin:0 ... }
\`\`\`

### 4. 跨模块 @extend 较少见

\`@extend\` 跨 \`@use\` 模块比较复杂，现代实践更倾向用 \`@mixin\` 替代 \`@extend\`。

---

## 实战：搭建一个最小模块化结构

假设我们要做一个按钮库，目录：

\`\`\`
btn-lib/
├── _index.scss        ← 公开 API
├── _variables.scss    ← 默认配置（!default）
├── _mixins.scss       ← 按钮 mixin
└── _button.scss       ← 按钮样式
\`\`\`

### _variables.scss

\`\`\`scss
$btn-bg: #3498db !default;
$btn-radius: 8px !default;
$btn-color: #fff !default;
\`\`\`

### _mixins.scss

\`\`\`scss
@use "sass:color";
@use "variables" as v;

@mixin btn-style($bg: v.$btn-bg) {
  background: $bg;
  color: v.$btn-color;
  border-radius: v.$btn-radius;
  &:hover { background: color.adjust($bg, $lightness: -8%); }
}
\`\`\`

### _button.scss

\`\`\`scss
@use "mixins" as m;

.btn { @include m.btn-style; }
.btn-danger { @include m.btn-style(#e74c3c); }
\`\`\`

### _index.scss（公开 API）

\`\`\`scss
@forward "variables";  // 让使用者能用 with 配置
@forward "button";     // 输出按钮 CSS
// 注意：mixins 是内部实现，可以不 forward，保持私有
\`\`\`

### 使用者

\`\`\`scss
@use "btn-lib" with (
  $btn-bg: #27ae60,    // 改成绿色主题
  $btn-radius: 12px
);
\`\`\`

这就是一个完整的可配置、模块化、封装良好的 Sass 库。

---

## 本章代码说明

由于预览只编译**单个 SCSS 字符串**，无法真正拆分多文件。所以本章代码用以下方式演示模块化：

- 用 \`@use "sass:math"\` / \`@use "sass:color"\` / \`@use "sass:map"\` 演示内置模块（真实可编译）。
- 在注释里展示 \`@use "./variables"\` / \`@forward\` / \`with\` 的写法。
- 在单文件内**模拟**"variables / functions / mixins / components"分区，用注释标明"以下内容通常在 _variables.scss 中"。
- 实际的样式化逻辑用模块函数（\`math.div\`、\`color.adjust\`、\`map.get\`）实现，演示模块化思维。

### 动手试试

1. 修改顶部"模拟 variables 区"的颜色，观察全组件变色。
2. 把 \`math.div($gap, 2)\` 改成 \`$gap / 2\`，看 Sass 是否报除法弃用警告。
3. 在"模拟 functions 区"加一个 \`@function\`，在组件里调用它。
4. 把 \`map.get($config, radius)\` 改成不同的键名，看是否能取出值。

> 📌 真实多文件项目里，把代码里的"模拟分区"拆成对应 \`.scss\` 文件，用 \`@use\`/\`@forward\` 连接即可。`,
    code: `// ============================================================
// 第四章演示：分片与 @use / @forward
// 由于预览编译单文件，这里用"分区注释 + 内置模块"模拟多文件模块化
// 真实项目里把每个"分区"拆成 _xxx.scss，用 @use / @forward 连接
// 样式化预览区 .sass-demo 容器内的按钮、卡片、网格、徽章
// ============================================================

// ---- 引入内置模块（真实可编译）----
@use "sass:math";
@use "sass:color";
@use "sass:map";

// ============================================================
// ▼ 模拟 _variables.scss（真实项目里这是独立文件）
//    使用者可通过 @use "variables" with (...) 覆盖这些 !default 值
// ============================================================
$primary: #3498db !default;
$primary-dark: color.adjust($primary, $lightness: -10%) !default;
$success: #27ae60 !default;
$warn: #f39c12 !default;
$danger: #e74c3c !default;

$radius-sm: 4px !default;
$radius-md: 8px !default;
$radius-lg: 12px !default;

$gap: 16px !default;
$gap-sm: 8px !default;

$text: #2c3e50 !default;
$muted: #7f8c8d !default;
$border: #e5e8ec !default;
$bg: #ffffff !default;
$bg-alt: #f7f9fc !default;

// 设计令牌 Map（演示 Map 模块）
$config: (
  radius: $radius-md,
  gap: $gap,
  columns: 3,
);

// ============================================================
// ▼ 模拟 _functions.scss
//    真实项目：@use "variables" as v; @use "sass:math";
// ============================================================

// 把 px 转成 rem（演示函数 + math.div）
@function rem($px) {
  @return math.div($px, 16px) * 1rem;
}

// 从 $config Map 取值（演示 map.get）
@function cfg($key) {
  @return map.get($config, $key);
}

// 计算栅格单列宽（演示函数组合）
@function col-width($container, $cols, $gutter) {
  @return math.div($container - ($cols - 1) * $gutter, $cols);
}

// 预计算一个示例值，供 .calc-demo 展示（Sass 变量须先定义后使用）
$col-width-demo: col-width(960px, 3, 16px);

// ============================================================
// ▼ 模拟 _mixins.scss
//    真实项目：@use "variables" as v; @use "functions" as f;
// ============================================================

// 卡片基础样式 mixin（可传参）
@mixin card($bg: $bg) {
  background: $bg;
  border-radius: cfg(radius);
  padding: cfg(gap);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

// 按钮 mixin：根据背景色自动算 hover
@mixin button($bg: $primary) {
  display: inline-block;
  padding: 8px 16px;
  border: none;
  border-radius: cfg(radius);
  background: $bg;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: color.adjust($bg, $lightness: -8%);
  }

  &:active {
    background: color.adjust($bg, $lightness: -15%);
  }
}

// 响应式断点 mixin（演示 @content）
@mixin breakpoint($bp) {
  @if $bp == md {
    @media (min-width: 768px) { @content; }
  } @else if $bp == lg {
    @media (min-width: 992px) { @content; }
  }
}

// ============================================================
// ▼ 模拟 _components/_buttons.scss（真实组件层）
//    真实项目：@use "../abstracts" as abs; 然后 @include abs.button(...)
// ============================================================

// ============================================================
// ▼ 模拟 app.scss（入口，组合输出 CSS）
// ============================================================

.sass-demo {
  padding: 24px;
  background: $bg-alt;
  border-radius: $radius-lg;
  font-family: -apple-system, "PingFang SC", sans-serif;
  color: $text;

  h2 {
    margin: 0 0 12px;
    font-size: 20px;
    color: $primary;
  }

  // ---- 按钮：用 @include button mixin ----
  .btn-primary { @include button($primary); }
  .btn-success { @include button($success); }
  .btn-warn    { @include button($warn); }
  .btn-danger  { @include button($danger); }

  // 按钮组：相邻按钮间距（演示 & + &）
  .btn-group {
    .btn-primary,
    .btn-success,
    .btn-warn,
    .btn-danger {
      margin-right: 8px;
    }
  }

  // ---- 卡片：用 @include card mixin ----
  .card {
    @include card;
    margin-bottom: $gap;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: $gap-sm;
      color: $text;
    }

    .card-body {
      font-size: rem(14px); // 用自定义 rem() 函数
      line-height: 1.6;
      color: $muted;
    }

    .card-footer {
      margin-top: $gap-sm;
      padding-top: $gap-sm;
      border-top: 1px solid $border;
      display: flex;
      justify-content: flex-end;
    }
  }

  // ---- 网格：用 col-width() 函数 + math.div ----
  .grid {
    display: grid;
    grid-template-columns: repeat(cfg(columns), 1fr);
    gap: cfg(gap);
    margin-bottom: $gap;
  }

  .grid-item {
    background: $bg;
    border: 1px solid $border;
    border-radius: $radius-md;
    padding: $gap-sm;
    font-size: 13px;
    text-align: center;

    &:hover {
      border-color: $primary;
      box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
    }
  }

  // ---- 徽章：@each 批量生成，颜色用 color.adjust 算浅底 ----
  $badges: (
    success: $success,
    warn: $warn,
    danger: $danger,
  );

  @each $name, $c in $badges {
    .badge-#{$name} {
      display: inline-block;
      padding: 2px 8px;
      border-radius: $radius-sm;
      font-size: 12px;
      color: $c;
      background: color.adjust($c, $lightness: 35%);
      margin-right: 6px;
    }
  }

  // ---- 警告框：用 breakpoint mixin 演示 @content ----
  .alert {
    padding: $gap-sm $gap;
    border-radius: $radius-md;
    margin-bottom: $gap-sm;
    font-size: 14px;

    // 默认全宽
    width: 100%;

    // 中屏及以上变窄并居右
    @include breakpoint(md) {
      width: 60%;
      margin-left: auto;
    }

    &.alert-info {
      background: color.adjust($primary, $lightness: 35%);
      color: $primary-dark;
    }

    &.alert-danger {
      background: color.adjust($danger, $lightness: 35%);
      color: $danger;
    }
  }

  // ---- 列表 ----
  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    background: $bg;
    border-radius: $radius-md;
    overflow: hidden;
    border: 1px solid $border;

    .list-item {
      padding: 10px $gap;
      font-size: 14px;
      border-bottom: 1px solid $border;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: color.adjust($primary, $lightness: 38%);
      }
    }
  }

  // ---- 演示 col-width 函数的计算结果（写在 content 里展示）----
  .calc-demo {
    padding: $gap-sm $gap;
    background: #fff8e1;
    border-radius: $radius-md;
    font-size: 13px;
    margin-top: $gap-sm;

    &::after {
      content: "3 列栅格，容器 960px，间距 16px → 单列宽约 #{$col-width-demo}";
    }
  }
}
`,
  },
];
