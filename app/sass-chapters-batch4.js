// =============================================================
// Sass 交互式教程 - 第 4 批章节（实战案例）
// -------------------------------------------------------------
// 本文件包含以下 4 章（group 统一为「实战案例」）：
//   1. sass-button-system  🔘 按钮系统实战
//   2. sass-card-layout    💳 卡片与网格布局实战
//   3. sass-form-styling   📝 表单样式实战
//   4. sass-design-system  🎯 设计系统构建
//
// 约定：
//   - content 为 Markdown 讲解，代码块用 ```scss 标注
//   - code 为纯 SCSS 代码，由服务端 sass 包编译为 CSS 后在 iframe 预览
//   - 插值统一使用 #{$var}，避免出现 ${ 字面量
//   - 前端预览模板会自动追加通用 demo HTML（含 .sass-demo 容器）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：按钮系统实战
  // =========================================================
  {
    id: "sass-button-system",
    group: "实战案例",
    icon: "🔘",
    title: "按钮系统实战",
    content: `## 按钮系统实战

按钮是任何 Web 应用中出现频率最高的交互元素之一。一个成熟的项目往往需要十几种甚至几十种按钮：主按钮、次按钮、危险按钮、成功按钮，又有大、中、小三种尺寸，还有圆角、圆形、方块等不同形状，再加上 hover、active、focus、disabled、loading 等多种状态。如果每一种组合都手写一遍 CSS，不仅代码量爆炸，后续修改主题色时更是灾难。

本章将带你用 Sass 构建一套**真正可扩展的按钮系统**。我们会从设计令牌（Design Token）出发，借助 \`Map\`、\`@each\`、\`@mixin\`、\`@extend\`、占位符选择器等 Sass 核心特性，实现「写一次配置，自动生成全部变体」的架构。学完之后，你新增一个颜色变体只需要在 Map 里加一行，新增一个尺寸也只需要加一行——这就是 Sass 在工程化场景下的真正价值。

### 为什么需要一套按钮系统

#### 手写 CSS 的痛点

假设你的项目需要 6 种颜色变体 × 3 种尺寸 = 18 种按钮组合。如果手写 CSS，你可能会这样写：

\`\`\`scss
.btn-primary-md { background: #3498db; padding: 8px 16px; font-size: 14px; }
.btn-primary-sm { background: #3498db; padding: 4px 10px; font-size: 12px; }
.btn-primary-lg { background: #3498db; padding: 12px 22px; font-size: 16px; }
.btn-success-md { background: #27ae60; padding: 8px 16px; font-size: 14px; }
// ... 还有 14 行
\`\`\`

这种写法的问题：

1. **重复严重**：尺寸规则在每种颜色下重复一遍，颜色规则在每个尺寸下重复一遍。
2. **难以维护**：设计师说「把所有按钮的圆角从 5px 改成 6px」，你需要在 18 个地方修改。
3. **容易遗漏**：新增一个颜色后，很容易忘记同步生成某些尺寸。
4. **状态难统一**：hover、active、disabled 等状态的样式散落各处，难以保证一致性。

#### 数据驱动的思路

Sass 的 \`Map\` + \`@each\` 组合让我们可以用「数据驱动」的方式生成样式：把可变的配置抽成 Map，把不变的逻辑写成 mixin，然后用 \`@each\` 循环批量产出选择器。这把「N × M 种组合」的复杂度降到了「N + M 条配置」。

| 维度 | 手写 CSS | Sass 系统 |
| --- | --- | --- |
| 新增颜色 | 改 N 处 | Map 加 1 行 |
| 新增尺寸 | 改 N 处 | Map 加 1 行 |
| 修改圆角 | 改 N × M 处 | 改 1 个变量 |
| 保证一致性 | 靠人工检查 | 由架构保证 |
| 产物体积 | 大量重复 | 自动去重 |

### 整体架构设计

在动手之前，先规划好按钮系统的分层架构。良好的分层是可扩展性的基础：

\`\`\`
┌─────────────────────────────────────────────┐
│ 第 1 层：设计令牌（Design Tokens）            │
│   $button-colors / $button-sizes 等变量        │
├─────────────────────────────────────────────┤
│ 第 2 层：基础抽象（Placeholders & Mixins）    │
│   %btn-base / @mixin button-variant / @mixin  │
│   button-size                                  │
├─────────────────────────────────────────────┤
│ 第 3 层：具体类生成（@each 批量产出）         │
│   .btn / .btn--primary / .btn--sm ...          │
├─────────────────────────────────────────────┤
│ 第 4 层：扩展变体（形状 / 状态 / 组合）       │
│   .btn--rounded / .btn--loading / .btn-group   │
└─────────────────────────────────────────────┘
\`\`\`

- **第 1 层**只放「值」，不放逻辑，方便设计师与开发者对齐。
- **第 2 层**封装「规则」，是可复用的能力单元，不直接产出选择器。
- **第 3 层**把规则绑定到具体的 BEM 类名上。
- **第 4 层**处理那些不适合用循环生成的特殊变体。

这种分层的好处是：每一层都可以独立变化。比如你想给按钮加一个「玻璃拟态」效果，只需要在第 2 层加一个 mixin，而不必动第 3 层的类名结构。

### 第 1 层：设计令牌

#### 颜色 Map

把所有颜色变体收进一个 Map，键名是变体名，键值是对应的主色：

\`\`\`scss
$button-colors: (
  primary:   #3498db,
  secondary: #6c757d,
  success:   #27ae60,
  danger:    #e74c3c,
  warning:   #f39c12,
  info:      #17a2b8,
);
\`\`\`

为什么不直接用一组独立变量（如 \`$color-primary\`、\`$color-success\`）？因为 Map 可以被 \`@each\` 遍历，这是「批量生成」的前提。独立变量只能逐个引用，无法循环。

#### 尺寸 Map（嵌套 Map）

尺寸比颜色更复杂，因为它包含四个子属性：纵向内边距、横向内边距、字号、圆角。Sass 的 Map 支持嵌套，正好用来描述这种结构：

\`\`\`scss
$button-sizes: (
  sm: (padding-y: 4px,  padding-x: 10px, font-size: 12px, radius: 3px),
  md: (padding-y: 8px,  padding-x: 16px, font-size: 14px, radius: 5px),
  lg: (padding-y: 12px, padding-x: 22px, font-size: 16px, radius: 7px),
);
\`\`\`

取值时用 \`map.get($button-sizes, md)\` 拿到内层 Map，再 \`map.get($inner, padding-y)\` 取具体值。这种「Map 套 Map」的结构在表达多维度配置时非常清晰。

> 提示：在 Dart Sass 中，\`map.get\` 来自内置模块 \`sass:map\`，需要先 \`@use "sass:map";\`。不要再用旧的全局 \`map-get()\` 函数，它在未来版本中会被移除。

#### 其他令牌

除颜色和尺寸外，还有一些全局性的小令牌，单独放成变量即可：

\`\`\`scss
$btn-font-family: inherit;
$btn-font-size: 14px;
$btn-line-height: 1.5;
$btn-border-width: 1px;
$btn-border-style: solid;
$btn-cursor: pointer;
$btn-transition: all 0.18s ease;
\`\`\`

这些令牌之所以没有进 Map，是因为它们只有「一个值」，没有「多个变体」需要遍历。把单值配置也塞进 Map 反而增加取值成本。**判断是否该用 Map 的标准是：是否需要被 @each 遍历。**

### 第 2 层：基础抽象

#### 占位符 %btn-base

占位符选择器（\`%\`）是 Sass 中专门用于「被继承」的规则。它和 class 的区别在于：占位符本身不会出现在编译产物里，只有被 \`@extend\` 时才会展开。这避免了「.btn-base」这种只为复用而存在的中间类污染 HTML。

\`\`\`scss
%btn-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: $btn-font-family;
  font-weight: 500;
  line-height: $btn-line-height;
  text-decoration: none;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: $btn-border-width $btn-border-style transparent;
  cursor: $btn-cursor;
  transition: $btn-transition;
}
\`\`\`

注意几个关键点：

- \`display: inline-flex\` 让按钮内部的图标和文字可以自然对齐，\`gap\` 控制间距。
- \`white-space: nowrap\` 防止按钮文字在窄屏下被折行。
- \`user-select: none\` 避免用户双击按钮时选中文字，体验更接近原生控件。
- \`border\` 初始设为 transparent，后续变体只改 \`border-color\`，避免边框宽度跳动引起布局抖动。

#### @mixin button-variant：变体规则

变体 mixin 负责「颜色相关的一切」：背景、边框、文字色，以及 hover、active、focus 三个交互状态。

\`\`\`scss
@use "sass:color";

@mixin button-variant($color) {
  background: $color;
  border-color: $color;
  color: #fff;

  &:hover {
    background: color.adjust($color, $lightness: 8%);
    border-color: color.adjust($color, $lightness: 8%);
  }
  &:active {
    background: color.adjust($color, $lightness: -6%);
    border-color: color.adjust($color, $lightness: -6%);
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.4), 0 0 0 5px $color;
  }
}
\`\`\`

这里用 \`color.adjust($color, $lightness: 8%)\` 来生成 hover 态的浅色版本。它比传统的 \`lighten($color, 8%)\` 更推荐，因为 \`lighten\` / \`darken\` 在 Dart Sass 1.79+ 已被标记为弃用（仍可用，但会输出警告）。\`color.adjust\` 显式指定调整的通道（\`$lightness\`），语义更清晰，未来也不会被移除。

hover 用 +8% 变亮，active 用 -6% 变暗，形成「按下变深」的物理直觉。focus 则用一个双层 \`box-shadow\` 模拟焦点环：内层白色描边拉开与按钮的距离，外层用主题色形成可见的焦点轮廓。

#### @mixin button-size：尺寸规则

尺寸 mixin 接收四个参数，分别对应内边距、字号、圆角：

\`\`\`scss
@mixin button-size($padding-y, $padding-x, $font-size, $radius) {
  padding: $padding-y $padding-x;
  font-size: $font-size;
  border-radius: $radius;
}
\`\`\`

把「变体逻辑」和「尺寸逻辑」拆成两个独立 mixin，是因为它们是**正交的两个维度**。一个按钮的颜色不依赖它的尺寸，反之亦然。分开之后，任意颜色可以搭配任意尺寸，组合自由度由架构天然保证。

### 第 3 层：批量生成具体类

#### 基础按钮 .btn

基础按钮类聚合了占位符、默认尺寸（md）和默认变体（primary）：

\`\`\`scss
.sass-demo .btn {
  @extend %btn-base;

  $md: map.get($button-sizes, md);
  @include button-size(
    map.get($md, padding-y),
    map.get($md, padding-x),
    map.get($md, font-size),
    map.get($md, radius)
  );

  @include button-variant(map.get($button-colors, primary));
}
\`\`\`

这样 \`class="btn"\` 就是一个可用的主按钮，开箱即用。

#### @each 生成颜色变体

这是整套系统最核心的一行循环：

\`\`\`scss
@each $name, $color in $button-colors {
  .sass-demo .btn--#{$name} {
    @include button-variant($color);
  }
}
\`\`\`

\`@each\` 会遍历 Map 的每一对键值，\`$name\` 是键（如 \`primary\`），\`$color\` 是值（如 \`#3498db\`）。插值 \`#{$name}\` 把变量名拼进选择器，于是自动生成 \`.btn--primary\`、\`.btn--success\` 等 6 个类。

注意插值语法是 \`#{$name}\` 而不是 \`\${name}\`——后者是 JavaScript 的模板字符串语法，在 SCSS 中无效，并且如果出现在本文件的 code 字段里还会被 JS 模板字符串误解析，所以务必只用 \`#{}\`。

#### @each 生成尺寸变体

尺寸变体用同样的模式生成：

\`\`\`scss
@each $name, $size in $button-sizes {
  .sass-demo .btn--#{$name} {
    @include button-size(
      map.get($size, padding-y),
      map.get($size, padding-x),
      map.get($size, font-size),
      map.get($size, radius)
    );
  }
}
\`\`\`

这里生成的类名是 \`.btn--sm\`、\`.btn--md\`、\`.btn--lg\`。注意它和颜色变体的命名冲突问题：\`.btn--md\`（尺寸）和 \`.btn--primary\`（颜色）用了相同的 \`--\` 前缀。在实际项目里更常见的做法是用不同前缀区分维度，例如 \`.btn--primary\`（颜色）+ \`.btn-sm\`（尺寸单连字符）。本教程为了 BEM 命名的一致性统一用 \`--\`，使用时组合即可：\`class="btn btn--primary btn--lg"\`。

### 第 4 层：形状、状态与组合

#### 形状变体

形状是独立于颜色和尺寸的第三维度，直接用修饰符类覆盖圆角：

\`\`\`scss
.sass-demo .btn--rounded { border-radius: 999px; }
.sass-demo .btn--circle  { border-radius: 50%; width: 44px; height: 44px; padding: 0; }
.sass-demo .btn--square  { border-radius: 0; }
\`\`\`

- \`rounded\` 用一个极大的圆角值实现胶囊形。
- \`circle\` 把按钮变成正圆形，固定宽高并把内边距清零——这是图标按钮的常用形状。
- \`square\` 直角按钮，常用于数据表格里的操作按钮。

#### 状态：disabled / block

\`\`\`scss
.sass-demo .btn--disabled,
.sass-demo .btn[disabled] {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
  box-shadow: none;
}
\`\`\`

用 \`pointer-events: none\` 彻底禁用鼠标交互，比单纯改光标更彻底——连 hover 态都不会触发。同时降低透明度给出视觉反馈。\`box-shadow: none\` 确保禁用态不显示焦点环。

\`btn--block\` 让按钮撑满父容器宽度，常用于移动端登录页的主操作：

\`\`\`scss
.sass-demo .btn--block {
  display: flex;
  width: 100%;
}
\`\`\`

#### 按钮组 .btn-group

按钮组把多个按钮连成一排，关键是处理首尾的圆角和相邻按钮的边框重叠：

\`\`\`scss
.sass-demo .btn-group {
  display: inline-flex;
  .btn {
    border-radius: 0;
    &:first-child { border-radius: 5px 0 0 5px; }
    &:last-child  { border-radius: 0 5px 5px 0; }
    + .btn { margin-left: -1px; }
  }
}
\`\`\`

\`+ .btn { margin-left: -1px; }\` 用负外边距让相邻按钮的边框重叠，避免出现「双边框」的视觉问题。这是处理相邻元素边框重叠的经典技巧。

#### 图标按钮 .btn--icon

\`\`\`scss
.sass-demo .btn--icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border-radius: 50%;
}
\`\`\`

图标按钮固定为正方形并圆形化，内部用 flex 居中图标。\`padding: 0\` 覆盖了尺寸 mixin 设置的内边距，因为图标的尺寸由宽高控制而非内边距。

#### 加载状态 .btn--loading

加载态是最考验细节的状态：要隐藏文字、显示一个旋转的 spinner，并且禁止重复点击。

\`\`\`scss
.sass-demo .btn--loading {
  position: relative;
  color: transparent !important;
  pointer-events: none;
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 16px;
    height: 16px;
    margin: -8px 0 0 -8px;
    border: 2px solid rgba(255, 255, 255, 0.5);
    border-top-color: #fff;
    border-radius: 50%;
    animation: btn-spin 0.7s linear infinite;
  }
}

@keyframes btn-spin {
  to { transform: rotate(360deg); }
}
\`\`\`

技巧解析：

1. \`color: transparent\` 让按钮文字变透明——文字还在，布局不塌陷，spinner 能精确居中。
2. \`::after\` 伪元素作为 spinner，\`margin: -8px 0 0 -8px\` 配合 \`top/left: 50%\` 实现绝对居中。
3. spinner 用「半透明圆环 + 实色顶部」的经典做法：\`border\` 整圈半透明，\`border-top-color\` 单独设为白色，旋转时就有「转圈」的视觉。
4. \`pointer-events: none\` 防止加载中重复提交。

#### 轮廓按钮 .btn--outline-*

轮廓按钮是实心按钮的反相版本：背景透明、边框和文字用主题色。它用一个独立的 mixin 配合 \`@each\` 生成：

\`\`\`scss
@mixin button-outline($color) {
  background: transparent;
  color: $color;
  border-color: $color;
  &:hover {
    background: $color;
    color: #fff;
  }
}

@each $name, $color in $button-colors {
  .sass-demo .btn--outline-#{$name} {
    @extend %btn-base;
    // ... 应用默认尺寸 + button-outline
    @include button-outline($color);
  }
}
\`\`\`

hover 时背景填充、文字变白，形成「悬停反相」的交互效果。注意这里 \`@extend %btn-base\` 让轮廓按钮复用了基础布局规则——占位符的价值再次体现。

### BEM 命名与可扩展架构

#### BEM 在按钮系统中的应用

本章采用 BEM（Block Element Modifier）命名约定：

- **Block（块）**：\`.btn\`，独立的组件。
- **Modifier（修饰符）**：\`.btn--primary\`、\`.btn--lg\`、\`.btn--rounded\`，表示变体或状态。

BEM 的好处是「类名即契约」：看到 \`.btn--primary\` 就知道它是按钮的一个变体，不会和别的组件冲突。双连字符 \`--\` 是修饰符的标志，单连字符 \`-\` 用于单词分隔（如 \`btn-group\`）。

#### 为什么用 @extend + 占位符

如果用普通的 class 作为基础类（如 \`.btn-base\`），它会被编译进最终 CSS，导致 HTML 里出现 \`.btn-base\` 这种「只为复用」的类。占位符 \`%btn-base\` 不会出现在产物里，只在被 \`@extend\` 时展开，保持了产物干净。

但 \`@extend\` 也有代价：它会改变选择器的组合方式（生成 \`.a, .b, .c\` 形式的选择器组），在大型项目里可能导致选择器爆炸。对于按钮这种「变体明确、数量可控」的场景，\`@extend\` 是合适的；对于高度动态的场景，更推荐 \`@include\` mixin。

### 实战要点与常见坑

#### 坑 1：插值语法混淆

SCSS 插值是 \`#{$var}\`，绝不能写成 \`\${var}\`。前者是 Sass 语法，后者是 JS 语法。在本教程的代码字段中尤其要小心，因为 code 是写在 JS 模板字符串里的，\`\${var}\` 会被 JS 当成插值解析而报错或产生意外结果。

#### 坑 2：lighten/darken 弃用

\`lighten($c, 8%)\` 在 Dart Sass 1.79+ 会输出弃用警告。推荐改用：

\`\`\`scss
@use "sass:color";
color.adjust($c, $lightness: 8%);   // 变亮
color.adjust($c, $lightness: -6%);  // 变暗
\`\`\`

如果只是想「按比例混合到黑/白」，\`scale-color($c, $lightness: 20%)\` 也是不弃用的替代方案。

#### 坑 3：@extend 不能跨媒体查询

\`@extend\` 不能把规则延伸到 \`@media\` 块之外。如果你的占位符定义在全局，而 \`@extend\` 写在 \`@media\` 内部，会报错。解决方案：把响应式逻辑写在 mixin 里，用 \`@include\` 而非 \`@extend\`。

#### 坑 4：Map 取值用 map.get

旧写法 \`map-get($map, key)\` 仍可用但已不推荐。现代写法：

\`\`\`scss
@use "sass:map";
$value: map.get($map, key);
\`\`\`

嵌套 Map 取值可以链式：\`map.get(map.get($sizes, md), padding-y)\`。

#### 坑 5：按钮在表单中的默认样式

\`<button>\` 元素有浏览器默认样式（背景、边框、内边距）。基础类 \`.btn\` 必须显式覆盖这些属性，否则在不同浏览器下表现不一致。本章的 \`%btn-base\` 已经通过 \`border\`、\`background\`（在 variant 中）、\`padding\`（在 size 中）覆盖了关键属性。

### 可扩展性演示

假设设计师现在要求新增一个「紫色品牌按钮」和「超小尺寸 xs」。在这套架构下，改动量极小：

\`\`\`scss
// 新增颜色：Map 加一行
$button-colors: (
  // ... 原有颜色
  brand: #8e44ad,
);

// 新增尺寸：Map 加一行
$button-sizes: (
  xs: (padding-y: 2px, padding-x: 6px, font-size: 11px, radius: 2px),
  // ... 原有尺寸
);
\`\`\`

两个 \`@each\` 循环会自动生成 \`.btn--brand\` 和 \`.btn--xs\`，包括 hover、active、focus 等全部状态。无需手写任何新规则。这就是数据驱动架构的威力——**新增配置的边际成本趋近于零**。


### 按钮的可访问性（A11Y）深入

按钮不仅是视觉元素，更是语义化的交互控件。一个可访问的按钮应当让键盘用户、屏幕阅读器用户都能正常使用。Sass 负责视觉呈现，HTML 语义与 ARIA 属性负责可访问性，两者必须紧密配合，缺一不可。

#### 优先使用语义化 button 元素

最常见的错误是用 div 配合 onclick 模拟按钮。这会带来一堆可访问性问题：不可键盘聚焦、不可用回车或空格键触发、屏幕阅读器不识别为按钮、无法被「查找可操作元素」的工具发现。正确做法是使用原生 button 元素，它天生支持键盘交互和辅助技术。

    <!-- 错误：div 模拟按钮 -->
    <div class="btn" onclick="submit()">提交</div>

    <!-- 正确：语义化 button -->
    <button class="btn" type="submit">提交</button>

type 属性很关键：表单内的提交按钮用 submit，普通按钮用 button（避免误触发表单提交），重置按钮用 reset。不写 type 的 button 默认是 submit，这是很多 bug 的来源——在非表单场景务必显式写 type="button"。

#### 焦点可见性

本章按钮在 focus 时用 box-shadow 显示焦点环，这对键盘用户至关重要。千万不要为了所谓美观去掉焦点环又不提供替代，那等于把键盘用户拒之门外。如果用 outline: none，必须提供等效的视觉焦点反馈。

可以用 focus-visible 区分键盘聚焦与鼠标聚焦，只在键盘聚焦时显示焦点环，鼠标点击时不显示，兼顾美观与可访问性：

    .btn:focus { outline: none; }
    .btn:focus-visible {
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.4);
    }

focus-visible 是现代浏览器支持的伪类，键盘 Tab 时触发，鼠标点击时不触发，是处理焦点环的最佳实践。它让你既能给键盘用户清晰的焦点反馈，又不打扰鼠标用户的视觉体验。

#### 禁用态的语义

视觉禁用（降透明度 + pointer-events: none）只是第一步。语义禁用需要 disabled 属性：

    <button class="btn" disabled>不可用</button>

disabled 会让按钮不可聚焦、不可触发，屏幕阅读器会读出「不可用」。如果用 aria-disabled="true" 替代 disabled，按钮仍可聚焦（便于辅助技术读取其信息），但需要在 JS 里拦截点击。两种方式各有适用场景：纯展示性禁用用 disabled，需要被辅助技术聚焦读取的用 aria-disabled。

#### 颜色对比度

按钮文字与背景的对比度应满足 WCAG AA 标准：正常文字至少 4.5:1，大号文字至少 3:1。深色背景配白字通常达标，但浅色变体（如 outline 按钮用主题色文字配白底）要核对对比度。可用浏览器开发者工具的对比度检查器验证。

| 按钮类型 | 背景 | 文字 | 对比度关注点 |
| --- | --- | --- | --- |
| 实心 primary | #3498db | #fff | 通常达标 |
| outline primary | 透明 | #3498db | 白底下需至少 4.5:1 |
| 禁用态 | 原色 | #fff | 降透明度后可能不达标，但禁用态可放宽 |

### 按钮的 type 与表单提交

button 元素在 form 内默认 type 为 submit，点击会触发表单提交。如果按钮只触发 JS 逻辑（如打开弹窗、切换状态），必须写 type="button"，否则在表单里点击会导致页面意外刷新，丢掉用户已填的数据。

    <form>
      <input name="q">
      <button class="btn btn--primary">搜索</button>
      <button class="btn" type="button" onclick="openCalendar()">日历</button>
    </form>

这是一个极易被忽视的坑：在 form 内放了一个「不提交」的按钮却忘了写 type，结果每次点击都刷新页面。养成习惯——只要按钮不是用来提交表单，就写 type="button"。

### 性能与产物体积考量

@each 生成的类数量取决于生成策略。本章采用「分离生成」：颜色类和尺寸类各自循环，HTML 用多类组合（btn btn--primary btn--lg）。这样 6 颜色 + 3 尺寸只生成 9 个类，产物最小。

| 生成策略 | 类数量 | 产物体积 | HTML 用法 |
| --- | --- | --- | --- |
| 分离生成（各自循环） | N + M | 小 | 多类组合 |
| 组合生成（嵌套循环） | N × M | 大 | 单类 btn--primary-lg |

分离生成更优：产物小、组合灵活。这也是本章采用它的原因。gzip 后按钮系统的 SCSS 产物通常不到 2KB，完全可接受。真正影响体积的是 @extend 可能产生的选择器组——本章用占位符配合适度 @extend，选择器组可控。

另一个性能点是过渡属性。transition 不要写 all，只过渡需要的属性（如 background-color、box-shadow、transform）。all 会让所有属性都参与过渡计算，包括 padding、color，既浪费性能又可能出现意外动画。本章的 $btn-transition 设为 all 仅为示例简洁，生产环境建议细化为具体属性。

### 按钮文案与交互规范

按钮文案应简洁明确，用动词开头，让用户一眼知道点击后会发生什么。模糊的文案（如「确定」「操作」）会让用户犹豫，增加出错概率。

| 场景 | 推荐 | 不推荐 |
| --- | --- | --- |
| 提交表单 | 保存 / 提交 | 确定 |
| 删除操作 | 删除 | 删除该条记录数据 |
| 取消 | 取消 | 返回上一页 |
| 危险操作 | 删除账号 | 操作 |

危险按钮（danger 变体）配合二次确认（弹窗或「长按确认」），避免误操作。加载中的按钮显示 spinner 并禁用（本章的 btn--loading 已实现），防止重复提交。提交成功后可短暂显示「成功」状态再恢复，给用户明确反馈。

### 与设计稿对齐

实际项目中，设计师交付的按钮规范往往包含一整套 token（颜色、尺寸、间距、圆角、阴影）。本章的 $button-colors 和 $button-sizes 就是这些 token 的代码化。建议把 token 维护成单独的 _tokens.scss 文件，设计师改稿时只改这个文件，组件文件不动。这种「token 与组件分离」的架构让设计稿到代码的映射清晰可追溯，也方便设计师与开发者协作。

更进一步，可以用 Style Dictionary 这类工具从一份 JSON 配置同时生成 SCSS、iOS、Android 多端 token，保证多端设计语言一致。Sass 在其中扮演 Web 端的消费者角色。


### 按钮的过渡与动画细节

按钮的交互反馈很大程度上依赖过渡（transition）与动画（animation）。一个手感「高级」的按钮，往往在过渡的时长、缓动函数、属性选择上都有讲究。

#### 过渡时长的选择

过渡时长影响用户对响应速度的感知。太快（小于 100ms）会让反馈显得「生硬」，像没过渡；太慢（大于 400ms）会让交互显得「迟滞」。按钮的 hover/active 过渡建议在 150ms 到 250ms 之间，这个区间既能被感知为「顺滑」，又不会拖沓。

    .btn { transition: background-color 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease; }

注意不同属性可以用不同时长：颜色和阴影用 180ms，位移用 120ms（更短，让「按下」的反馈更即时）。这种细粒度控制比统一写 transition: all 0.18s 效果更精致。

#### 缓动函数

ease 是默认值，但它其实是一个特定的贝塞尔曲线。对于按钮，ease-out（开始快、结束慢）更适合 hover 态——元素「迅速响应然后稳定下来」，符合用户预期。而 active 态用 ease-in（开始慢、结束快）能模拟「按下去」的物理感。

    .btn:hover  { transition: all 0.2s ease-out; }
    .btn:active { transition: transform 0.1s ease-in; }

进阶可以用 cubic-bezier 自定义曲线，如 cubic-bezier(0.34, 1.56, 0.64, 1) 带轻微回弹，让按钮 hover 时有「弹起」的感觉。但回弹动画要克制，幅度过大会显得廉价。

#### 按下位移效果

active 态加一个微小的 translateY，能强化「按下」的触觉反馈：

    .btn:active { transform: translateY(1px); }

仅 1px 的位移就足以让用户感受到「按钮被按下」，比单纯改颜色更立体。如果是浮动操作按钮（FAB），可以配合 box-shadow 收缩来模拟「贴近地面」的效果：

    .fab:active {
      transform: translateY(1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);  /* 阴影变浅 */
    }

#### 波纹效果

Material Design 的波纹（ripple）效果用纯 CSS 难以完美实现（需要点击位置），通常配合 JS。但可以用伪元素做一个简化版：hover 时从中心扩散一个半透明圆。

    .btn { position: relative; overflow: hidden; }
    .btn::before {
      content: "";
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0.3);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .btn:active::before { opacity: 1; transition: opacity 0s; }

这个简化版在按下时整体泛白一下，虽然不如真正的波纹精准，但实现简单、无 JS 依赖，适合大多数场景。

### 按钮在不同框架中的适配

这套 Sass 按钮系统是框架无关的——它只产出 CSS 类。在 React、Vue、Angular 中都能直接使用。

#### React 中使用

    function Button({ variant, size, children, ...props }) {
      const cls = ['btn'];
      if (variant) cls.push('btn--' + variant);
      if (size) cls.push('btn--' + size);
      return <button className={cls.join(' ')} {...props}>{children}</button>;
    }

用 classnames 库更简洁：className={classNames('btn', 'btn--' + variant, 'btn--' + size)}。注意变体名要和 Sass Map 的键名一致（primary/success/danger 等），否则类不生效。也可以在组件内用计算属性预先拼好类名字符串，再传给 className。

#### Vue 中使用

    <template>
      <button :class="buttonClass">
        <slot />
      </button>
    </template>
    <script setup>
    const props = defineProps(['variant', 'size']);
    const buttonClass = computed(() => {
      const arr = ['btn'];
      if (props.variant) arr.push('btn--' + props.variant);
      if (props.size) arr.push('btn--' + props.size);
      return arr;
    });
    </script>

Vue 的数组语法天然适合组合 BEM 类名，配合 computed 计算属性可以动态生成类名列表。如果用 Vue 3 的 script setup，把变体和尺寸作为 props 传入，computed 内拼好类名数组绑定到 :class 即可。注意变体名同样要和 Sass Map 的键名对齐。

#### 与 CSS-in-JS 的取舍

如果项目用 styled-components 或 emotion，可能会质疑「为什么还要用 Sass」。答案是：Sass 适合「设计系统级」的样式资产，它在框架之外、可被任何技术栈消费；CSS-in-JS 适合「组件级」的动态样式。两者并非互斥——可以用 Sass 生成设计系统的底层类（如 btn、grid、spacing 工具类），用 CSS-in-JS 处理组件内的动态样式（如根据 props 变化的特殊布局）。这种分层让样式资产更可复用。

### 按钮的测试要点

按钮作为高频交互元素，测试应覆盖：

1. 视觉测试：每种变体 × 尺寸的组合截图对比，确保样式不漂移。
2. 交互测试：hover/active/focus 态都正确触发，disabled 不可点击。
3. 键盘测试：Tab 可聚焦，Enter/Space 可触发，焦点环可见。
4. 可访问性测试：屏幕阅读器读出「按钮」+ 文案，aria-label/disabled 正确。
5. 响应式测试：窄屏下按钮不溢出、不折行（除非是 block 按钮）。

自动化可用 Playwright 做截图回归，用 axe-core 做无障碍扫描。这些测试能在设计系统迭代时及时发现问题，避免「改了一个 token，十个组件崩了」。
### 本章小结

- 用 \`Map\` 描述「需要遍历的多值配置」，用普通变量描述「单值配置」。
- 用 \`%placeholder\` + \`@extend\` 封装共享布局，用 \`@mixin\` 封装可参数化的规则。
- 用 \`@each\` 把 Map 与 mixin 桥接，批量产出选择器，实现 N+M 配置生成 N×M 组合。
- 颜色变体用 \`color.adjust\`（而非弃用的 \`lighten\`）派生 hover/active 态。
- 形状、状态、按钮组、加载态等特殊变体在第 4 层单独处理，保持架构清晰。
- BEM 命名让类名成为自解释的契约，\`#{}\` 插值是 Sass 的正确写法。

下一章我们用同样的思路构建卡片与响应式网格系统，进一步体会 Sass 在布局场景下的表达力。
`,
    code: `// ============================================================
// 按钮系统实战 —— 用 Sass 构建可扩展的按钮组件库
// ============================================================

@use "sass:color";
@use "sass:map";

// ---------- 1. 设计令牌（按钮专用变量） ----------
$btn-font-family: inherit;
$btn-font-size: 14px;
$btn-line-height: 1.5;
$btn-border-width: 1px;
$btn-border-style: solid;
$btn-cursor: pointer;
$btn-transition: all 0.18s ease;

// ---------- 2. 颜色 Map（变体来源） ----------
$button-colors: (
  primary:   #3498db,
  secondary: #6c757d,
  success:   #27ae60,
  danger:    #e74c3c,
  warning:   #f39c12,
  info:      #17a2b8,
);

// ---------- 3. 尺寸 Map（嵌套结构） ----------
$button-sizes: (
  sm: (padding-y: 4px,  padding-x: 10px, font-size: 12px, radius: 3px),
  md: (padding-y: 8px,  padding-x: 16px, font-size: 14px, radius: 5px),
  lg: (padding-y: 12px, padding-x: 22px, font-size: 16px, radius: 7px),
);

// ---------- 4. 占位符：基础按钮布局 ----------
%btn-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: $btn-font-family;
  font-weight: 500;
  line-height: $btn-line-height;
  text-decoration: none;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: $btn-border-width $btn-border-style transparent;
  cursor: $btn-cursor;
  transition: $btn-transition;
}

// ---------- 5. Mixin：颜色变体规则 ----------
@mixin button-variant($color) {
  background: $color;
  border-color: $color;
  color: #fff;
  &:hover {
    background: color.adjust($color, $lightness: 8%);
    border-color: color.adjust($color, $lightness: 8%);
  }
  &:active {
    background: color.adjust($color, $lightness: -6%);
    border-color: color.adjust($color, $lightness: -6%);
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.4), 0 0 0 5px $color;
  }
}

// ---------- 6. Mixin：尺寸规则 ----------
@mixin button-size($padding-y, $padding-x, $font-size, $radius) {
  padding: $padding-y $padding-x;
  font-size: $font-size;
  border-radius: $radius;
}

// ---------- 7. 基础按钮 .btn ----------
.sass-demo .btn {
  @extend %btn-base;
  $md: map.get($button-sizes, md);
  @include button-size(
    map.get($md, padding-y),
    map.get($md, padding-x),
    map.get($md, font-size),
    map.get($md, radius)
  );
  @include button-variant(map.get($button-colors, primary));
}

// ---------- 8. 批量生成颜色变体 ----------
@each $name, $color in $button-colors {
  .sass-demo .btn--#{$name} {
    @include button-variant($color);
  }
}

// ---------- 9. 批量生成尺寸变体 ----------
@each $name, $size in $button-sizes {
  .sass-demo .btn--#{$name} {
    @include button-size(
      map.get($size, padding-y),
      map.get($size, padding-x),
      map.get($size, font-size),
      map.get($size, radius)
    );
  }
}

// ---------- 10. 形状变体 ----------
.sass-demo .btn--rounded { border-radius: 999px; }
.sass-demo .btn--circle  { border-radius: 50%; width: 44px; height: 44px; padding: 0; }
.sass-demo .btn--square  { border-radius: 0; }

// ---------- 11. 状态变体 ----------
.sass-demo .btn--disabled,
.sass-demo .btn[disabled] {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
  box-shadow: none;
}

.sass-demo .btn--block {
  display: flex;
  width: 100%;
}

// ---------- 12. 按钮组 ----------
.sass-demo .btn-group {
  display: inline-flex;
  .btn {
    border-radius: 0;
    &:first-child { border-radius: 5px 0 0 5px; }
    &:last-child  { border-radius: 0 5px 5px 0; }
    + .btn { margin-left: -1px; }
  }
}

// ---------- 13. 图标按钮 ----------
.sass-demo .btn--icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border-radius: 50%;
}

// ---------- 14. 加载状态 ----------
.sass-demo .btn--loading {
  position: relative;
  color: transparent;
  pointer-events: none;
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 16px;
    height: 16px;
    margin: -8px 0 0 -8px;
    border: 2px solid rgba(255, 255, 255, 0.5);
    border-top-color: #fff;
    border-radius: 50%;
    animation: btn-spin 0.7s linear infinite;
  }
}

@keyframes btn-spin {
  to { transform: rotate(360deg); }
}

// ---------- 15. 轮廓按钮变体 ----------
@mixin button-outline($color) {
  background: transparent;
  color: $color;
  border-color: $color;
  &:hover {
    background: $color;
    color: #fff;
  }
}

@each $name, $color in $button-colors {
  .sass-demo .btn--outline-#{$name} {
    @extend %btn-base;
    $md: map.get($button-sizes, md);
    @include button-size(
      map.get($md, padding-y),
      map.get($md, padding-x),
      map.get($md, font-size),
      map.get($md, radius)
    );
    @include button-outline($color);
  }
}
`,
  },

  // =========================================================
  // 第二章：卡片与网格布局实战
  // =========================================================
  {
    id: "sass-card-layout",
    group: "实战案例",
    icon: "💳",
    title: "卡片与网格布局实战",
    content: `## 卡片与网格布局实战

卡片（Card）是现代 UI 中最常见的内容容器：商品展示、文章列表、用户资料、价格方案，几乎都以卡片形式呈现。而卡片又几乎总是以「网格」的方式成片出现——电商首页的商品墙、博客的文章流、后台的统计面板。所以「卡片」和「网格」天生是一对，本章把它们放在一起讲。

我们会用 Sass 构建一套完整的卡片体系：基础卡片（header / body / footer 三段式）、媒体卡片（带图片裁剪）、文章卡片、价格卡片，再用 \`grid-template-columns\` + 媒体查询搭建响应式网格。最后加上悬停动效、阴影层级、内容溢出处理和骨架屏（skeleton），覆盖真实业务里的高频需求。

### 卡片组件的设计思路

#### 三段式结构

一张内容卡片通常可以拆成三个区域：

\`\`\`
┌──────────────────────────┐
│  Header（标题 / 操作）     │
├──────────────────────────┤
│                          │
│  Body（正文 / 媒体）       │
│                          │
├──────────────────────────┤
│  Footer（按钮 / 链接）     │
└──────────────────────────┘
\`\`\`

不是每张卡片都有三段，但把它们设计成**可选的组合块**比写成一整块更灵活：媒体卡片只有 body + media，价格卡片用 header + body + footer。BEM 命名下，\`.card\` 是块，\`.card__header\` / \`.card__body\` / \`.card__footer\` 是元素，\`.card--article\` / \`.card--price\` 是修饰符。

#### 为什么不直接用 Utility-first

有人会问：「这些不都能用 Tailwind 的工具类拼出来吗？」确实可以，但当你需要在 50 个页面里保持卡片样式完全一致、并且能一键切换主题时，组件化的 Sass 方案更可控：变体集中在一个文件里，改一处全站生效。Utility-first 适合快速原型，组件化 Sass 适合长期维护的设计系统。两者并不冲突，实际项目里常常组合使用。

### 阴影层级系统

卡片视觉上的「浮起」感主要来自阴影。一套好的阴影系统应该有 2~3 个层级，对应不同的高度语义：

\`\`\`scss
$shadows: (
  sm: 0 1px 3px rgba(0,0,0,0.08),
  md: 0 4px 12px rgba(0,0,0,0.10),
  lg: 0 12px 32px rgba(0,0,0,0.14),
);
\`\`\`

把阴影收进 Map 有两个好处：一是统一了全站的「高度语言」，二是可以用 \`@each\` 生成 \`.card--shadow-sm\` / \`.card--shadow-md\` / \`.card--shadow-lg\` 修饰符，按需叠加。

阴影的几个设计原则：

- **层级越高的卡片阴影越重**：默认态用 sm，悬停时升到 lg，模拟「被拿起来」的感觉。
- **阴影颜色用半透明黑而非纯黑**：\`rgba(0,0,0,0.08)\` 比 \`#ccc\` 更自然，能适应不同背景。
- **Y 轴偏移大于模糊半径的一半**：让阴影看起来像光从上方照下来的投影，而非光晕。
- **避免阴影过重**：移动端和浅色背景上，过重的阴影会显得「脏」。0.08~0.14 的透明度是比较安全的区间。

### 基础卡片实现

#### 卡片容器

\`\`\`scss
.sass-demo .card {
  background: #ffffff;
  border: 1px solid #e6e8eb;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: map.get($shadows, sm);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
\`\`\`

\`overflow: hidden\` 是关键：它让卡片内部的图片、媒体在圆角处被裁剪，不会「溢出」破坏圆角。代价是卡片内部不能有需要溢出的元素（如绝对定位的下拉菜单），这种场景下需要在内部元素上单独设 \`overflow: visible\`。

\`transition\` 同时过渡 \`transform\` 和 \`box-shadow\`，为后面的悬停动效做准备。注意只过渡需要的属性，不要写 \`transition: all\`——那会让所有属性变化都参与过渡，性能差且容易出现意外动画。

#### 三段式区块

\`\`\`scss
.sass-demo .card__header {
  padding: 16px;
  border-bottom: 1px solid #eef0f2;
  font-weight: 600;
  font-size: 15px;
}
.sass-demo .card__body {
  padding: 16px;
  font-size: 14px;
  color: #444;
  line-height: 1.6;
}
.sass-demo .card__footer {
  padding: 16px;
  border-top: 1px solid #eef0f2;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
\`\`\`

header 和 footer 用细边框（\`#eef0f2\`）与 body 分隔，比用背景色更轻量。footer 默认右对齐并带 \`gap\`，因为卡片底部的按钮组通常靠右排列。

### 媒体卡片与图片裁剪

#### object-fit 裁剪

卡片顶部的封面图往往尺寸不一，但展示时需要统一比例。传统做法用 \`background-image\` + \`background-size: cover\`，但这样图片就不是真正的 \`<img>\`，不利于无障碍和 SEO。\`object-fit: cover\` 解决了这个问题：

\`\`\`scss
.sass-demo .card__media {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: #f0f2f5;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}
\`\`\`

\`object-fit: cover\` 让图片像 \`background-size: cover\` 一样填充容器并裁剪超出部分，但保持图片的语义化。容器固定高度（160px）保证多张卡片对齐。\`background: #f0f2f5\` 给图片加载前的容器一个占位底色，避免白闪。

> 兼容性：\`object-fit\` 在所有现代浏览器都支持，IE 不支持。如果需要兼容 IE，要么回退到 \`background-image\` 方案，要么用 polyfill。

### 文章卡片与价格卡片变体

#### 文章卡片

文章卡片在 body 内部有更细的层级：标题、元信息、摘要。用 BEM 的元素命名：

\`\`\`scss
.sass-demo .card--article {
  .card__title  { font-size: 16px; font-weight: 700; margin: 0 0 6px; color: #1a1a1a; }
  .card__meta   { font-size: 12px; color: #999; margin-bottom: 8px; }
  .card__excerpt { color: #555; font-size: 13px; }
}
\`\`\`

注意嵌套规则：\`.card--article .card__title\` 只在文章卡片修饰符下生效，不影响普通卡片的 body。这是 BEM 修饰符的典型用法——修饰符内部可以覆盖元素的样式。

#### 价格卡片

价格卡片有几个特殊元素：大号价格数字、货币符号、计价周期、功能列表。其中「货币符号小、数字大」用 inline 元素的字号和垂直对齐实现：

\`\`\`scss
.sass-demo .card--price {
  text-align: center;
  .card__price {
    font-size: 32px;
    font-weight: 800;
    color: #27ae60;
    .currency { font-size: 16px; vertical-align: top; }
    .period   { font-size: 13px; color: #888; font-weight: 400; }
  }
}
\`\`\`

\`.currency\` 用 \`vertical-align: top\` 让「¥」贴在数字顶部，模拟常见的价格排版。功能列表用 \`list-style: none\` 去掉项目符号，每项之间用虚线分隔：

\`\`\`scss
.sass-demo .card__feature {
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
  li {
    padding: 4px 0;
    font-size: 13px;
    color: #555;
    border-bottom: 1px dashed #eee;
  }
}
\`\`\`

\`.card--featured\` 是「推荐方案」的高亮变体，单独定义在顶层（不要嵌套进 \`.card--price\`，否则生成的选择器会变成后代选择器而失效）：

\`\`\`scss
.sass-demo .card--featured {
  border-color: #27ae60;
  box-shadow: map.get($shadows, md);
}
\`\`\`

### 内容溢出处理：多行截断

文章摘要经常需要「最多显示 3 行，超出省略号」。单行截断用 \`text-overflow: ellipsis\` 即可，多行截断要借助 \`-webkit-line-clamp\`：

\`\`\`scss
.sass-demo .card__body--clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
\`\`\`

虽然带 \`-webkit-\` 前缀，但目前所有主流浏览器（含 Firefox、Edge）都已支持。三个属性必须同时出现：\`display: -webkit-box\` 把元素变成可分行容器，\`-webkit-box-orient: vertical\` 设为垂直排列，\`-webkit-line-clamp: 3\` 限制行数。

### 响应式网格

#### grid-template-columns

现代响应式网格首选 CSS Grid。\`grid-template-columns\` 定义列模板，\`repeat(N, 1fr)\` 表示 N 列等宽。关键是如何在不同屏幕宽度下切换列数——用媒体查询分层：

\`\`\`scss
.sass-demo .grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(1, 1fr);
}

.sass-demo .grid--4 { grid-template-columns: repeat(2, 1fr); }

@media (min-width: 600px) {
  .sass-demo .grid--4 { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 900px) {
  .sass-demo .grid--4 { grid-template-columns: repeat(4, 1fr); }
}
\`\`\`

「移动优先」的写法：基础规则是窄屏（1 列），媒体查询逐级放大到 2、3、4 列。这样默认就适配了手机，大屏再增强。

#### auto-fill + minmax：自适应网格

如果不想写死列数，而是「每列至少 220px，能放几列放几列」，用 \`auto-fill\` + \`minmax\`：

\`\`\`scss
.sass-demo .card-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}
\`\`\`

\`minmax(220px, 1fr)\` 表示每列最小 220px、最大平分剩余空间。\`auto-fill\` 让浏览器自动计算能放下多少列。这种写法不需要任何媒体查询就能自适应——容器变宽就多一列，变窄就少一列。它是响应式卡片墙最优雅的方案。

| 方案 | 列数控制 | 媒体查询 | 适用场景 |
| --- | --- | --- | --- |
| 固定列数 + 断点 | 设计师指定 | 需要 | 严格对齐的栅格 |
| auto-fill + minmax | 容器自适应 | 不需要 | 灵活卡片墙 |

### 悬停动效

卡片悬停时「上浮 + 阴影加深」是最经典的交互反馈：

\`\`\`scss
.sass-demo .card--hover {
  &:hover {
    transform: translateY(-4px);
    box-shadow: map.get($shadows, lg);
  }
}
\`\`\`

\`translateY(-4px)\` 上移 4px，配合阴影从 sm 升到 lg，营造「被拿起来」的立体感。注意 \`transform\` 不会触发重排（只触发合成层），性能远优于改 \`top\` / \`margin\`，是动效首选属性。

为了让动效自然，容器上已经设了 \`transition: transform 0.25s ease, box-shadow 0.25s ease\`。时长 0.25s 是体感上「快速但不突兀」的甜蜜点。

> 触屏适配：触屏设备没有 hover 概念，\`:hover\` 在触屏上会「粘住」（点击后保持 hover 态直到点别处）。如果需要严谨处理，可以用 \`@media (hover: hover)\` 包裹悬停规则，只对支持 hover 的设备生效。

### 骨架屏（Skeleton）

数据加载时显示骨架屏，比空白或转圈体验更好。骨架屏的本质是「用灰色色块占位，模拟内容布局，再做一个微妙的呼吸动画」：

\`\`\`scss
.sass-demo .skeleton {
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%);
  background-size: 400% 100%;
  border-radius: 6px;
  animation: skeleton-loading 1.4s ease infinite;
}

@keyframes skeleton-loading {
  0%   { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}
\`\`\`

原理：用一个三段渐变背景（深灰 → 浅灰 → 深灰），把背景尺寸放大到 400%，再用 \`background-position\` 做横向位移动画，就形成「光斑从右往左扫过」的呼吸效果。\`background-size: 400%\` 是关键，它让渐变只占背景的 1/4，位移时才有可见的扫光。

骨架屏按用途分几种尺寸：标题（高 18px、宽 60%）、文本行（高 12px、满宽）、头像（圆形 40px）、媒体块（高 140px）。它们共用 \`.skeleton\` 的动画，只是尺寸不同：

\`\`\`scss
.sass-demo .skeleton--text   { height: 12px; margin: 6px 0; }
.sass-demo .skeleton--title  { height: 18px; width: 60%; margin-bottom: 10px; }
.sass-demo .skeleton--avatar { width: 40px; height: 40px; border-radius: 50%; }
.sass-demo .skeleton--media  { height: 140px; }
\`\`\`

### BEM 结构回顾

本章用到的 BEM 元素与修饰符汇总：

| 类名 | 角色 | 说明 |
| --- | --- | --- |
| \`.card\` | Block | 卡片容器 |
| \`.card__header\` / \`.card__body\` / \`.card__footer\` | Element | 三段式区块 |
| \`.card__media\` | Element | 媒体区（图片） |
| \`.card__title\` / \`.card__meta\` / \`.card__excerpt\` | Element | 文章卡片内部 |
| \`.card__price\` / \`.card__feature\` | Element | 价格卡片内部 |
| \`.card--article\` / \`.card--price\` | Modifier | 卡片类型变体 |
| \`.card--hover\` / \`.card--featured\` | Modifier | 行为/视觉变体 |
| \`.card--shadow-sm/md/lg\` | Modifier | 阴影层级 |
| \`.card__body--clamp\` | Element Modifier | 元素级变体（多行截断） |

可以看出，BEM 把「这个类是干什么的」编码进了类名，读类名就能理解结构，无需来回翻 HTML。

### 实战要点与常见坑

#### 坑 1：圆角被内部图片破坏

如果 \`.card\` 设了圆角但内部 \`.card__media img\` 是直角，图片会盖住圆角。解决：给 \`.card\` 加 \`overflow: hidden\`，或给图片也设对应圆角（仅顶部）。本章用 \`overflow: hidden\`，最简单。

#### 坑 2：嵌套修饰符选择器失效

容易写错的写法：

\`\`\`scss
.sass-demo .card--price {
  .card--featured { ... } // 生成 .card--price .card--featured，这是后代选择器，错误！
}
\`\`\`

\`.card--featured\` 是与 \`.card--price\` 平级的修饰符，应该写在顶层，或用 \`&--featured\` 拼接（但这里两者是不同维度，不应用 \`&\` 拼接）。本章把 \`.card--featured\` 单独写在顶层。

#### 坑 3：grid gap 与 margin 叠加

如果卡片本身有 \`margin\`，又给 grid 设了 \`gap\`，间距会叠加变大。grid 布局下，子元素的 \`margin\` 不会被 \`gap\` 折叠。建议：grid 容器用 \`gap\` 控制间距，子元素不要再用 \`margin\` 撑间距。

#### 坑 4：object-fit 不生效

\`object-fit\` 只对**替换元素**（img、video、iframe 等）生效，并且要求元素有明确的宽高。如果你给一个 \`<div>\` 设 \`object-fit\`，不会有任何效果。同时 \`<img>\` 必须设 \`display: block\` 消除底部基线间隙。

#### 坑 5：骨架屏动画性能

\`background-position\` 动画会触发重绘，大量骨架屏同时动画可能掉帧。优化方向：限制同时动画的骨架屏数量，或改用 \`transform\`（但骨架屏的扫光效果用 transform 较难实现）。在移动端建议适当降低骨架屏数量。

### 可扩展性演示

新增一种「统计卡片」变体，只需要加一个修饰符：

\`\`\`scss
.sass-demo .card--stat {
  text-align: center;
  .card__value { font-size: 28px; font-weight: 800; color: #3498db; }
  .card__label { font-size: 12px; color: #999; margin-top: 4px; }
}
\`\`\`

它自动继承 \`.card\` 的容器样式（圆角、阴影、边框），只需补充自己特有的元素。这正是 BEM + Sass 修饰符模式的扩展性所在。


### 卡片的可访问性与语义

卡片虽然视觉上是一个「块」，但内部的标题、图片、链接都关乎语义和无障碍。正确的语义让屏幕阅读器用户能理解卡片结构，也让 SEO 爬虫更好地索引内容。

#### 标题层级

卡片标题应当用 h2/h3 等标题元素，而非 div + 大字号。标题元素构成页面的「大纲」，辅助技术可据此导航。一张卡片通常有一个主标题（h3）和若干次级文本。

    <article class="card card--article">
      <h3 class="card__title">文章标题</h3>
      <p class="card__meta">作者 · 日期</p>
      <p class="card__excerpt">摘要内容…</p>
    </article>

#### 图片的 alt 文本

卡片封面图如果是内容性图片（如文章配图、商品图），必须有描述性 alt；如果是装饰性图片，用空 alt（alt=""）让屏幕阅读器跳过。

    <img src="cover.jpg" alt="文章封面：城市夜景">
    <img src="decor.svg" alt="">

#### 整卡可点击

电商商品卡常需要「点卡片任意位置都跳详情页」。可访问的实现是用一个覆盖整个卡片的链接（stretched link 模式），而非给整个 div 绑 onclick：

    <article class="card card--hover">
      <div class="card__media"><img src="p.jpg" alt="商品"></div>
      <div class="card__body">
        <h3 class="card__title">商品名</h3>
        <a class="card__link" href="/p/1">查看详情</a>
      </div>
    </article>

    .card { position: relative; }
    .card__link::after {
      position: absolute;
      inset: 0;
      content: "";
    }

stretched link 用一个绝对定位的伪元素铺满卡片，点击任意位置都触发链接。注意此时卡片内的其他可交互元素（如「收藏」按钮）需要更高的 z-index 或 position: relative 才能脱离链接覆盖。

### 卡片与列表的语义选择

成片的卡片该用 ul/li 还是 div？答案是：如果卡片是一个「列表项」（如商品列表、文章流），用 ul > li 包裹更语义化，屏幕阅读器会读出「列表，共 N 项」。

    <ul class="card-grid">
      <li><article class="card">…</article></li>
      <li><article class="card">…</article></li>
    </ul>

如果是单独展示的一张卡片（如仪表盘的统计卡），用 div 或 section 即可。article 元素适合「可独立分发的内容」（文章、博客帖子），不适合商品卡这类强依赖上下文的内容。

### 卡片墙的性能优化

当卡片数量很多（几十上百），一次性渲染全部会拖慢首屏。常见优化手段：

| 手段 | 说明 | 适用场景 |
| --- | --- | --- |
| 图片懒加载 | 滚动到可视区再加载图片 | 所有带图卡片墙 |
| 分页/无限滚动 | 每次只渲染一页 | 列表型卡片墙 |
| 虚拟滚动 | 只渲染可视区 + 缓冲区，DOM 数量恒定 | 超长列表（千级） |
| 骨架屏 | 加载时显示占位，避免布局抖动 | 所有异步加载 |

图片懒加载最简单：给 img 加 loading="lazy"，浏览器自动处理，无需 JS。本章的骨架屏样式（skeleton）配合数据加载，能给用户「内容正在来」的感知，比白屏或转圈体验好得多。

虚拟滚动是重型方案，适用于聊天记录、大数据表格等千级以上列表。它的原理是只渲染可视区域内的卡片，滚动时动态替换，DOM 数量恒定（通常几十个），性能远优于全量渲染。React 的 react-window、Vue 的 vue-virtual-scroller 都是成熟实现。

### 不同业务场景的卡片设计

不同业务的卡片侧重不同，BEM 修饰符让它们共享基础结构、各自扩展：

#### 电商商品卡

强调图片、价格、操作按钮。价格突出（大号、红色），「加入购物车」按钮显眼。常有「促销角标」（badge）贴在图片角落。

    .card--product {
      .card__badge {
        position: absolute; top: 8px; left: 8px;
        background: #e74c3c; color: #fff;
        padding: 2px 8px; border-radius: 4px; font-size: 12px;
      }
      .card__price { color: #e74c3c; font-weight: 700; font-size: 18px; }
      .card__price-old { color: #999; text-decoration: line-through; font-size: 13px; }
    }

#### 博客文章卡

强调标题、摘要、作者/时间。图片可有可无，文字信息更密集。摘要多行截断（本章的 card__body--clamp）很常用。

#### 后台统计卡

数字为主，配标签和趋势。数字大而醒目，趋势用颜色（涨绿跌红）+ 箭头。这类卡片通常无图、信息密度高、网格紧密排列。

    .card--stat {
      text-align: center;
      .card__value { font-size: 28px; font-weight: 800; }
      .card__trend { font-size: 12px; }
      .card__trend--up { color: #27ae60; }
      .card__trend--down { color: #e74c3c; }
    }

### 卡片的选中与激活状态

后台管理界面常有「选中卡片」的需求（如多选操作）。用一个 is-selected 状态类配合边框/阴影高亮：

    .card.is-selected {
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.3);
    }

状态类用 is- 前缀（如 is-selected、is-active、is-loading）是常见约定，区别于 BEM 的 -- 修饰符。-- 表示「变体」（固有的类型），is- 表示「状态」（动态变化）。这种区分让类名的意图更清晰。

### 响应式策略深入

除了本章介绍的 auto-fill + minmax 和断点切换两种网格，还有几个响应式细节值得注意：

1. 卡片最小宽度要考虑内容。如果卡片内有长标题或价格，220px 可能太窄导致内容拥挤，应实测调整 minmax 的最小值。
2. 移动端单列时，卡片间距可适当缩小（gap 从 16px 降到 12px），让一屏多看一张。
3. 大屏（如 4K）不要让网格无限铺开，给容器设 max-width，避免一行卡片过多难以扫视。本章的 card-grid 可在外层包一个 max-width: 1400px 的容器。
4. 图片在不同屏宽下加载不同尺寸（srcset / sizes），节省移动端流量。

    <img src="p-800.jpg"
         srcset="p-400.jpg 400w, p-800.jpg 800w, p-1200.jpg 1200w"
         sizes="(max-width: 600px) 100vw, 300px"
         alt="商品">

srcset 让浏览器根据屏幕宽度和密度选择最合适的图片，移动端加载小图、高清屏加载大图，兼顾体验与流量。

### 阴影与层级的设计哲学

阴影不仅是视觉装饰，更是「层级语言」。一致的阴影系统让用户潜意识里理解界面的层次：默认卡片微微浮起（sm），悬停时「拿起来」（lg），弹窗/抽屉浮在最上层（更大阴影 + 遮罩）。

本章的 sm/md/lg 三档阴影对应「静止」「交互中」「浮层」三个层级。扩展时，弹窗类可以用更深的阴影（如 0 20px 60px rgba(0,0,0,0.2)），与卡片阴影拉开差距，强化层级感知。但切忌阴影档位过多——3 到 4 档足够，太多反而混乱。

### 卡片设计的常见反模式

1. 阴影过重：浅色背景上深阴影显得「脏」，且让界面压抑。保持阴影透明度在 0.06~0.14。
2. 圆角不一致：卡片圆角和内部图片圆角不匹配，视觉割裂。用 overflow: hidden 统一裁剪。
3. 信息过载：一张卡片塞太多内容（标题+副标题+标签+评分+价格+按钮+进度…），反而让用户抓不住重点。每张卡片聚焦 1~2 个核心信息。
4. 悬停动效过度：上浮 + 缩放 + 旋转 + 发光全加上，眼花缭乱。一个克制的动效（如本章的 translateY）足够。
5. 忽略加载态：数据未到时卡片空白或塌陷，布局跳动。务必用骨架屏占位。


### 卡片网格的高级布局

除了本章用的 auto-fill + minmax 等宽网格，还有几种卡片布局值得了解。

#### Masonry（瀑布流）布局

Pinterest 风格的瀑布流让不等高的卡片紧凑排列，无纵向空隙。CSS 原生的 masonry 布局仍在实验中（grid-template-rows: masonry），目前需用 JS 库（如 masonry.js）或多列 columns 模拟：

    .card-grid--masonry {
      column-count: 3;
      column-gap: 16px;
    }
    .card-grid--masonry > * {
      break-inside: avoid;
      margin-bottom: 16px;
    }

columns 方案的缺点是卡片按列排列（先填满第一列再第二列），而非按行排列，阅读顺序可能不符预期。如果阅读顺序重要，用 JS 计算位置更可控。

#### 不等宽网格

有时需要「特色卡片」占两列，普通卡片占一列。用 grid-column 跨列：

    .card--featured { grid-column: span 2; }

配合 auto-fill 网格，特色卡片自动占据双倍宽度，适合「头条文章」这类需要突出的内容。注意在小屏下要把 span 2 改回 span 1，避免一张卡片撑满整行。

#### 横向滚动卡片

移动端常见「横向卡片轮播」，用 overflow-x: auto + flex 实现：

    .card-scroll {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding-bottom: 8px;
    }
    .card-scroll > .card {
      flex: 0 0 240px;
      scroll-snap-align: start;
    }

scroll-snap 让滑动结束时自动对齐到卡片边缘，体验接近原生 App。flex: 0 0 240px 固定卡片宽度，防止压缩。横向滚动卡片适合「推荐商品」「相关文章」等横向浏览场景。

### 卡片的内容密度与留白

卡片内部的留白（padding）影响信息密度感知。留白多显得「高级」但信息少，留白少信息密集但可能拥挤。本章的 card__body 用 16px padding 是平衡值。

| 场景 | 推荐 padding | 信息密度 |
| --- | --- | --- |
| 商品卡（紧凑） | 12px | 高 |
| 文章卡（舒适） | 16-20px | 中 |
| 统计卡（突出数字） | 24px | 低但聚焦 |

标题与正文之间、正文与操作区之间也要有间距层级。一般遵循「8px 基准」：相关元素间距 8px，区块间距 16px，大区块间距 24px。这种节奏让卡片内部层次清晰。

    .card__title    { margin-bottom: 8px; }
    .card__excerpt  { margin-bottom: 16px; }
    .card__actions  { margin-top: 16px; }

### 卡片与容器宽度的适配

卡片在不同容器中宽度不同，内容布局应随之调整。用 container query（容器查询）让卡片根据自身宽度而非视口宽度响应：

    .card { container-type: inline-size; }
    .card__body { display: block; }
    @container (min-width: 400px) {
      .card__body { display: flex; gap: 12px; }
    }

容器查询让「同一张卡片在侧边栏窄、在主区域宽」自动切换布局，比媒体查询更精准。目前主流浏览器已支持 container query，是响应式组件的未来方向。

### 卡片的微交互

除了 hover 上浮，卡片还可以有更细腻的微交互：

1. 图片缩放：hover 时卡片内图片轻微放大（scale 1.05），用 overflow: hidden 裁剪。

    .card__media { overflow: hidden; }
    .card__media img { transition: transform 0.4s; }
    .card:hover .card__media img { transform: scale(1.05); }

2. 阴影渐变：hover 时阴影从浅到深渐变，而非瞬切。本章已用 transition 实现。

3. 内容上推：hover 时操作区从底部滑入。

    .card__actions {
      transform: translateY(100%);
      transition: transform 0.3s;
    }
    .card:hover .card__actions { transform: translateY(0); }

这种「hover 才显示操作」的交互节省空间，但要注意触摸设备没有 hover，操作区应始终可见或提供替代触发方式。

### 卡片与主题适配

卡片在亮/暗主题下的表现需要单独考虑。暗色主题下，白色卡片背景变深（如 #1f1f1f），阴影需要调整——深色背景上阴影不明显，改用更浅的边框来区分层级：

    [data-theme="dark"] .card {
      background: #1f1f1f;
      border: 1px solid #333;
      box-shadow: none;
    }

用 Sass 的主题 Map 配合 CSS 变量可以统一管理（参考第四章）。注意暗色主题下图片如果有白底，会显得突兀，可用 mix-blend-mode 或调整图片背景色。

### 卡片组件的可组合性

好的卡片组件应当「可组合」——内部各部分（media、body、actions）可以自由增减，不破坏整体。用 BEM 的元素命名保证各部分独立：

    <article class="card">
      <div class="card__media">…</div>      <!-- 可选 -->
      <div class="card__body">
        <h3 class="card__title">…</h3>       <!-- 可选 -->
        <p class="card__excerpt">…</p>       <!-- 可选 -->
      </div>
      <div class="card__actions">…</div>     <!-- 可选 -->
    </article>

这种结构让一张卡片可以只有标题（极简），也可以有图+标题+摘要+操作（完整），样式都自洽。Sass 在 .card 下统一定义各元素的样式，缺哪个不影响其余。这种「积木式」组合是组件化设计的核心。
### 本章小结

- 卡片用三段式（header / body / footer）设计，按需组合，BEM 命名保证结构清晰。
- 阴影收进 Map，分 sm / md / lg 三个层级，用 \`@each\` 生成修饰符。
- 媒体图片用 \`object-fit: cover\` 裁剪，保持语义化且自适应。
- 文章摘要多行截断用 \`-webkit-line-clamp\`，三件套缺一不可。
- 响应式网格优先 \`auto-fill + minmax\`，无需媒体查询即可自适应；需要严格栅格时再用断点切换列数。
- 悬停动效用 \`transform: translateY\`，不触发重排，性能好。
- 骨架屏用三段渐变 + \`background-position\` 位移动画，按用途区分尺寸。
- 修饰符写顶层，避免嵌套成后代选择器。

下一章我们进入表单样式的世界，处理输入框、自定义控件、状态反馈等更细致的交互场景。
`,
    code: `// ============================================================
// 卡片与网格布局实战
// ============================================================

@use "sass:color";
@use "sass:map";

// ---------- 1. 设计令牌 ----------
$card-radius: 10px;
$card-padding: 16px;
$card-bg: #ffffff;
$card-border: 1px solid #e6e8eb;

$shadows: (
  sm: 0 1px 3px rgba(0, 0, 0, 0.08),
  md: 0 4px 12px rgba(0, 0, 0, 0.10),
  lg: 0 12px 32px rgba(0, 0, 0, 0.14),
);

// ---------- 2. 基础卡片 ----------
.sass-demo .card {
  background: $card-bg;
  border: $card-border;
  border-radius: $card-radius;
  overflow: hidden;
  box-shadow: map.get($shadows, sm);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.sass-demo .card__header {
  padding: $card-padding;
  border-bottom: 1px solid #eef0f2;
  font-weight: 600;
  font-size: 15px;
}

.sass-demo .card__body {
  padding: $card-padding;
  font-size: 14px;
  color: #444;
  line-height: 1.6;
}

.sass-demo .card__footer {
  padding: $card-padding;
  border-top: 1px solid #eef0f2;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

// ---------- 3. 阴影层级变体 ----------
@each $name, $shadow in $shadows {
  .sass-demo .card--shadow-#{$name} {
    box-shadow: $shadow;
  }
}

// ---------- 4. 悬停动效 ----------
.sass-demo .card--hover {
  &:hover {
    transform: translateY(-4px);
    box-shadow: map.get($shadows, lg);
  }
}

// ---------- 5. 媒体卡片：图片裁剪 ----------
.sass-demo .card__media {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: #f0f2f5;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

// ---------- 6. 文章卡片 ----------
.sass-demo .card--article {
  .card__title {
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 6px;
    color: #1a1a1a;
  }
  .card__meta {
    font-size: 12px;
    color: #999;
    margin-bottom: 8px;
  }
  .card__excerpt {
    color: #555;
    font-size: 13px;
  }
}

// ---------- 7. 价格卡片 ----------
.sass-demo .card--price {
  text-align: center;
  .card__price {
    font-size: 32px;
    font-weight: 800;
    color: #27ae60;
    margin: 8px 0;
    .currency { font-size: 16px; vertical-align: top; }
    .period   { font-size: 13px; color: #888; font-weight: 400; }
  }
  .card__feature {
    list-style: none;
    padding: 0;
    margin: 0 0 12px;
    li {
      padding: 4px 0;
      font-size: 13px;
      color: #555;
      border-bottom: 1px dashed #eee;
    }
  }
}

// 推荐方案高亮（写在顶层，避免嵌套成后代选择器）
.sass-demo .card--featured {
  border-color: #27ae60;
  box-shadow: map.get($shadows, md);
}

// ---------- 8. 内容溢出：多行截断 ----------
.sass-demo .card__body--clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// ---------- 9. 响应式网格（固定列数 + 断点） ----------
.sass-demo .grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(1, 1fr);
}

.sass-demo .grid--2 { grid-template-columns: repeat(1, 1fr); }
.sass-demo .grid--3 { grid-template-columns: repeat(1, 1fr); }
.sass-demo .grid--4 { grid-template-columns: repeat(2, 1fr); }

@media (min-width: 600px) {
  .sass-demo .grid--2 { grid-template-columns: repeat(2, 1fr); }
  .sass-demo .grid--3 { grid-template-columns: repeat(2, 1fr); }
  .sass-demo .grid--4 { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 900px) {
  .sass-demo .grid--3 { grid-template-columns: repeat(3, 1fr); }
  .sass-demo .grid--4 { grid-template-columns: repeat(4, 1fr); }
}

// ---------- 10. 自适应网格（auto-fill + minmax） ----------
.sass-demo .card-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

// ---------- 11. 骨架屏 ----------
.sass-demo .skeleton {
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%);
  background-size: 400% 100%;
  border-radius: 6px;
  animation: skeleton-loading 1.4s ease infinite;
}

.sass-demo .skeleton--text   { height: 12px; margin: 6px 0; }
.sass-demo .skeleton--title  { height: 18px; width: 60%; margin-bottom: 10px; }
.sass-demo .skeleton--avatar { width: 40px; height: 40px; border-radius: 50%; }
.sass-demo .skeleton--media  { height: 140px; }

@keyframes skeleton-loading {
  0%   { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

// ---------- 12. 统计卡片变体 ----------
.sass-demo .card--stat {
  text-align: center;
  .card__value { font-size: 28px; font-weight: 800; color: #3498db; }
  .card__label { font-size: 12px; color: #999; margin-top: 4px; }
}
`,
  },

  // =========================================================
  // 第三章：表单样式实战
  // =========================================================
  {
    id: "sass-form-styling",
    group: "实战案例",
    icon: "📝",
    title: "表单样式实战",
    content: `## 表单样式实战

表单是用户与系统交互的核心入口：注册、登录、下单、搜索、设置，处处都是表单。但原生表单控件（input、select、checkbox、radio）的默认样式在不同浏览器下差异巨大，且大多「很丑」。用 CSS/Sass 统一表单样式，是前端工程化的基本功。

本章我们用 Sass 构建一套完整的表单样式体系：文本输入框（text/email/password）的统一外观与聚焦态、错误/成功状态的视觉反馈、用 \`appearance: none\` 彻底自定义复选框与单选框、自定义下拉箭头、文本域、开关 toggle、表单布局（堆叠/行内）、浮动 label、占位符样式，以及用 Sass 变量集中管理表单令牌。学完之后你能应对 90% 的表单样式需求。

### 表单样式的核心难点

#### 浏览器默认样式不一致

同样的 \`<input type="text">\`，Chrome、Firefox、Safari 的内边距、边框、字号、聚焦轮廓都不一样。直接用原生样式会让产品在不同浏览器下「看起来像不同的网站」。所以表单样式的第一步永远是「抹平默认样式」——用 \`appearance: none\` 关闭浏览器自带外观，再用自己的样式接管。

#### 状态维度多

一个输入框的状态远比按钮复杂：

- **默认态**：未聚焦、未输入。
- **聚焦态**：用户正在输入，需要清晰的视觉焦点。
- **填写态**：已有内容。
- **错误态**：校验失败，红色边框 + 错误提示。
- **成功态**：校验通过，绿色边框 + 成功提示。
- **禁用态**：不可编辑，灰化。
- **只读态**：不可编辑但可选中复制。

每种状态都要有清晰的视觉区分，并且状态之间不能冲突（比如错误态聚焦时不能丢失焦点环）。

#### 控件类型多样

text/password/email 输入框、textarea、select、checkbox、radio、range、file、color……每种控件的样式方法都不一样。checkbox / radio 必须用 \`appearance: none\` 才能完全自定义；select 的下拉箭头需要用背景图替换；file input 几乎无法用 CSS 完全控制。本章覆盖最常用的几种。

### 表单令牌集中管理

把所有表单相关的颜色、圆角、过渡时间抽成变量，集中放在文件顶部。这样做的好处是：换主题色时只改一处，全站表单跟着变。

\`\`\`scss
$form-radius: 6px;
$form-border-color: #d0d5dd;
$form-bg: #fff;
$form-text: #333;
$form-focus-color: #3498db;
$form-error-color: #e74c3c;
$form-success-color: #27ae60;
$form-disabled-bg: #f0f2f5;
$form-label-color: #555;
$form-placeholder-color: #98a2b3;
$form-transition: border-color 0.18s ease, box-shadow 0.18s ease;
\`\`\`

注意 \`$form-transition\` 只过渡 \`border-color\` 和 \`box-shadow\` 两个属性，不写 \`all\`。聚焦时边框变色 + 焦点环渐入，这两个属性过渡就够了。\`all\` 会让 padding、color 等也参与过渡，反而出现意外动画。

### 文本输入框

#### 基础样式 .form-control

\`\`\`scss
.sass-demo .form-control {
  width: 100%;
  padding: 9px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: $form-text;
  background: $form-bg;
  border: 1px solid $form-border-color;
  border-radius: $form-radius;
  transition: $form-transition;
  appearance: none;
  -webkit-appearance: none;

  &::placeholder { color: $form-placeholder-color; }

  &:focus {
    outline: none;
    border-color: $form-focus-color;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
  }

  &:disabled {
    background: $form-disabled-bg;
    color: #aaa;
    cursor: not-allowed;
  }
}
\`\`\`

逐项解析：

- \`appearance: none\` + \`-webkit-appearance: none\`：关闭浏览器默认外观，为后续完全自定义铺路（虽然对 text input 影响不大，但加上更保险）。两个属性都写是因为 iOS Safari 仍需 \`-webkit-\` 前缀。
- \`width: 100%\`：表单控件默认不撑满容器，需要显式设置。
- \`outline: none\` + \`box-shadow\` 焦点环：移除浏览器默认的黑色 outline，换成主题色的柔和焦点环。\`0 0 0 3px rgba(...)\` 是「内填充式」焦点环，不会撑大元素尺寸（比 \`outline\` 更可控）。
- \`&::placeholder\`：占位符颜色单独控制，比正文浅，提示「这里该填什么」。
- \`&:disabled\`：灰化背景 + 禁用光标，明确告知「不可编辑」。

> 无障碍提醒：移除默认 \`outline\` 后必须提供等效的焦点视觉反馈，否则键盘用户无法定位当前控件。这里的 \`box-shadow\` 焦点环就承担了这个职责。

#### password 与 email

\`type="password"\` 和 \`type="email"\` 在样式上和 text 几乎一致，复用 \`.form-control\` 即可。需要注意的差异：

- password：输入内容显示为圆点，部分浏览器（如 Edge）会在控件右侧自动加一个「显示密码」的眼睛图标，可能撑乱布局。可以用 \`::-ms-reveal { display: none; }\` 隐藏。
- email：移动端键盘会显示 \`@\` 和 \`.com\` 快捷键，这是浏览器行为，无需 CSS 处理。

### 文本域 textarea

\`\`\`scss
.sass-demo .form-control--textarea {
  min-height: 90px;
  resize: vertical;
}
\`\`\`

\`min-height\` 保证最小可视区域；\`resize: vertical\` 只允许纵向拖拽调整高度，禁止横向拖拽（横向拖拽会撑破布局）。如果想完全禁止调整，用 \`resize: none\`，但要确保高度足够，否则长文本无法查看。

### 错误与成功状态

校验反馈是表单体验的关键。错误态用红边框 + 红色焦点环 + 红色提示文字，成功态对应绿色：

\`\`\`scss
.sass-demo .form-control--error {
  border-color: $form-error-color;
  &:focus {
    border-color: $form-error-color;
    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.15);
  }
}

.sass-demo .form-feedback {
  font-size: 12px;
  margin-top: 4px;
  &--error   { color: $form-error-color; }
  &--success { color: $form-success-color; }
}
\`\`\`

注意错误态的 \`&:focus\` 显式覆盖了基础样式的蓝色焦点环，确保「错误 + 聚焦」时仍是红色焦点环，而不是变回蓝色。状态优先级要通过显式覆盖保证，不能依赖 CSS 顺序。

提示文字用单独的 \`.form-feedback\` 元素，不写进输入框，是因为提示可能较长，且需要单独控制颜色和字号。

### 标签与表单组

\`\`\`scss
.sass-demo .form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: $form-label-color;
}

.sass-demo .form-group {
  margin-bottom: 16px;
}
\`\`\`

\`display: block\` 让 label 独占一行（堆叠布局默认）。\`.form-group\` 是「label + 控件 + 提示」的组合单元，用统一的下间距分隔各组。把间距放在 group 上而非每个元素上，便于整体调整。

### 表单布局：堆叠与行内

#### 堆叠布局 .form--stacked

最经典的布局：label 在上、控件在下，每组纵向排列：

\`\`\`scss
.sass-demo .form--stacked .form-group {
  display: flex;
  flex-direction: column;
}
\`\`\`

\`flex-direction: column\` 让 label 和控件垂直堆叠。其实不写这条规则，块级元素默认也是堆叠的——这里显式写是为了和行内布局形成对称，并且方便后续在 group 内部加对齐控制。

#### 行内布局 .form--inline

搜索框、筛选条这类场景，label 和控件横向排列：

\`\`\`scss
.sass-demo .form--inline {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  .form-group { margin-bottom: 0; flex: 1 1 180px; }
  .form-label { margin-bottom: 0; margin-right: 8px; }
}
\`\`\`

关键点：

- \`align-items: flex-end\`：所有控件底部对齐，让不同高度的控件（带 label 的和不带 label 的）在一条线上。
- \`flex: 1 1 180px\`：每个 group 最小 180px，剩余空间按比例分配，空间不够时换行。
- group 的 \`margin-bottom\` 清零（由父级 \`gap\` 控制间距），label 的 \`margin-bottom\` 也清零，改为 \`margin-right\` 横向分隔。

### 自定义复选框与单选框

原生 checkbox / radio 的样式几乎无法用 CSS 修改。要自定义，必须用 \`appearance: none\` 关闭默认外观，然后用伪元素 \`::after\` 画自定义图形。

#### 复选框

\`\`\`scss
.sass-demo .check {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border: 1px solid $form-border-color;
    border-radius: 4px;
    background: #fff;
    position: relative;
    transition: $form-transition;
    &:checked {
      background: $form-focus-color;
      border-color: $form-focus-color;
      &::after {
        content: "";
        position: absolute;
        left: 5px;
        top: 1px;
        width: 5px;
        height: 10px;
        border: solid #fff;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
  }
}
\`\`\`

原理：

1. \`appearance: none\` 让 checkbox 变成一个「空白方块」，完全由我们控制外观。
2. 设定 18×18 的方块，加边框和圆角，作为未选中态。
3. \`:checked\` 时背景变主题色，\`::after\` 伪元素画一个白色对勾——对勾是用一个有边框的小矩形旋转 45° 实现的（\`border-width: 0 2px 2px 0\` 只保留右边和下边，旋转后形成「L」形对勾）。

#### 单选框

单选框的圆形外观复用复选框结构，只是把圆角改成 50%，并把对勾换成实心圆点：

\`\`\`scss
input[type="radio"] {
  border-radius: 50%;
  &:checked::after {
    width: 8px;
    height: 8px;
    border: none;
    background: #fff;
    border-radius: 50%;
    left: 4px;
    top: 4px;
    transform: none;
  }
}
\`\`\`

把 radio 的规则和 checkbox 写在一起，利用选择器并列复用大部分属性，只覆盖差异（圆角、对勾→圆点）。

> 无障碍：自定义 checkbox/radio 必须保留 \`&:focus\` 焦点环（本章代码已加），否则键盘用户无法看到当前焦点在哪个选项上。

### 自定义下拉选择 select

select 的默认下拉箭头无法用 \`border\` 等修改，但可以用 \`appearance: none\` 去掉默认箭头，再用 \`background-image\` 画一个自定义箭头：

\`\`\`scss
.sass-demo .form-control--select {
  appearance: none;
  -webkit-appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #888 50%),
                    linear-gradient(135deg, #888 50%, transparent 50%);
  background-position: calc(100% - 16px) 50%, calc(100% - 11px) 50%;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
  padding-right: 32px;
}
\`\`\`

箭头是用两个 \`linear-gradient\` 拼出来的「V」形：第一个 gradient 画右上半边，第二个画右下半边，两个三角形拼成向下的箭头。\`background-position\` 用 \`calc(100% - 16px)\` 把箭头固定在右侧 16px 处。\`padding-right: 32px\` 给箭头留出空间，避免文字盖住箭头。

这种「纯 CSS 画箭头」的好处是不需要额外图片资源，且能随主题色调整（改 gradient 的颜色即可）。

### 开关 toggle

toggle 是 checkbox 的「开关」变体，常见于设置页。它的结构是「隐藏的真实 checkbox + 模拟轨道 + 模拟滑块」：

\`\`\`scss
.sass-demo .toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  input { display: none; }
  &__track {
    position: absolute;
    inset: 0;
    background: #ccc;
    border-radius: 999px;
    transition: background 0.2s ease;
  }
  &__thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    transition: transform 0.2s ease;
  }
  input:checked + .toggle__track { background: $form-success-color; }
  input:checked + .toggle__track + .toggle__thumb { transform: translateX(20px); }
}
\`\`\`

要点：

- 真实 \`<input>\` 用 \`display: none\` 隐藏（保留可聚焦与表单提交能力）。
- \`.toggle__track\` 是轨道，\`inset: 0\` 撑满父级（\`inset\` 是 \`top/right/bottom/left\` 的简写）。
- \`.toggle__thumb\` 是滑块，绝对定位在左侧。
- \`:checked\` 时：轨道变绿（\`input:checked + .toggle__track\`），滑块右移 20px（\`+ .toggle__track + .toggle__thumb\` 兄弟选择器链）。

这里用相邻兄弟选择器 \`+\` 而非后代选择器，是因为 input、track、thumb 是平级兄弟元素。HTML 结构必须是 \`<input><track/><thumb/>\` 的顺序。

### 浮动 label（Floating Label）

浮动 label 是一种节省纵向空间的交互：label 默认显示在输入框内（像占位符），输入框聚焦或有内容时，label「浮」到顶部变小。Material Design 的经典效果。

\`\`\`scss
.sass-demo .float-field {
  position: relative;
  .form-control {
    padding-top: 16px;
    padding-bottom: 4px;
  }
  .form-label {
    position: absolute;
    left: 12px;
    top: 10px;
    color: $form-placeholder-color;
    font-size: 14px;
    pointer-events: none;
    transition: all 0.18s ease;
  }
  .form-control:focus + .form-label,
  .form-control:not(:placeholder-shown) + .form-label {
    top: 4px;
    font-size: 11px;
    color: $form-focus-color;
  }
}
\`\`\`

核心是两个选择器：

1. \`.form-control:focus + .form-label\`：聚焦时 label 上浮。
2. \`.form-control:not(:placeholder-shown) + .form-label\`：**有内容时** label 保持上浮。

第二个选择器是关键技巧：它依赖「输入框有内容时占位符不显示」这一行为。为了让这个技巧生效，输入框必须有一个占位符（哪怕是一个空格 \`placeholder=" "\`）。如果没占位符，\`:placeholder-shown\` 永远为真，label 永远不会因「有内容」而上浮。

\`pointer-events: none\` 让 label 不拦截鼠标点击，点击 label 区域时焦点直接落到输入框。

### 表单验证图标

校验通过/失败时在输入框右侧显示一个图标（✓ / ✕），用伪元素实现：

\`\`\`scss
.sass-demo .form-icon {
  position: relative;
  &.is-valid::after,
  &.is-invalid::after {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
  }
  &.is-valid::after   { content: "✓"; color: $form-success-color; }
  &.is-invalid::after { content: "✕"; color: $form-error-color; }
  .form-control { padding-right: 32px; }
}
\`\`\`

\`.form-control\` 加 \`padding-right: 32px\` 给图标留位，避免文字盖住图标。\`is-valid\` / \`is-invalid\` 是状态类，由 JS 在校验后动态添加。

### 实战要点与常见坑

#### 坑 1：appearance: none 的前缀

iOS Safari 仍需要 \`-webkit-appearance: none\`。只写 \`appearance: none\` 在 iOS 上原生控件样式不会被完全清除。两个都写最保险。

#### 坑 2：focus 焦点环被边框覆盖

\`box-shadow\` 焦点环画在边框外侧，但如果父容器有 \`overflow: hidden\`，外侧的焦点环会被裁掉。解决：不要在表单容器上设 \`overflow: hidden\`，或改用 \`outline\`（\`outline\` 不受 overflow 影响，但圆角控制较弱）。

#### 坑 3：浮动 label 的占位符依赖

\`:not(:placeholder-shown)\` 依赖占位符存在。如果输入框没设 \`placeholder\`，这个选择器永远匹配不到，label 永远不浮起。务必加 \`placeholder=" "\`（一个空格）作为最小占位。

#### 坑 4：select 的 option 无法自定义样式

\`appearance: none\` 只能自定义 select 的「闭合态」外观，下拉出来的 \`<option>\` 列表仍是浏览器原生样式，CSS 几乎无法控制。如果需要完全自定义下拉列表，得用 JS 重建（用 div 模拟），这是另一个话题。

#### 坑 5：checkbox/radio 的焦点

自定义后容易忘记加 \`:focus\` 焦点环，导致键盘用户无法定位。务必保留：

\`\`\`scss
&:focus { box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15); }
\`\`\`

#### 坑 6：禁用态的可点击区域

\`disabled\` 的输入框默认不可聚焦也不可点击，但自定义的 \`.check\` 容器如果绑定了点击事件，可能仍可触发。建议在禁用时给容器也加 \`cursor: not-allowed\` 并用 \`pointer-events: none\` 彻底禁用。

### 可扩展性演示

新增一个「搜索框」变体——带左侧搜索图标的输入框。复用 \`.form-control\`，只需补充修饰符：

\`\`\`scss
.sass-demo .form-control--search {
  padding-left: 36px;
  background-image: url("data:image/svg+xml,..."); // 搜索图标
  background-repeat: no-repeat;
  background-position: 12px 50%;
}
\`\`\`

它自动继承 \`.form-control\` 的边框、聚焦态、禁用态，只需补一个图标位。这正是把基础样式与变体分离的好处。


### 表单的无障碍深入

表单是用户输入的入口，无障碍做得不好会直接挡住部分用户。除了视觉样式，ARIA 属性和语义结构同样重要。

#### aria-invalid 与 aria-describedby

校验失败时，除了红色边框，还要用 aria-invalid="true" 告诉辅助技术「这个字段有错误」，并用 aria-describedby 把错误提示关联到输入框，屏幕阅读器就能读出错误内容。

    <div class="form-group">
      <label class="form-label" for="email">邮箱</label>
      <input id="email" class="form-control form-control--error"
             aria-invalid="true" aria-describedby="email-err">
      <p class="form-feedback form-feedback--error" id="email-err">
        请输入有效的邮箱地址
      </p>
    </div>

aria-describedby 的值是提示元素的 id，建立关联后，屏幕阅读器在读输入框时会接着读提示。这让视障用户知道错在哪、怎么改。

#### fieldset 与 legend 分组

一组相关的单选/复选（如「性别」「兴趣爱好」）应当用 fieldset 包裹，legend 作为组标题。这比用 div + 文本更有语义，屏幕阅读器会读出「分组：性别，含 2 个单选项」。

    <fieldset class="form-fieldset">
      <legend class="form-legend">性别</legend>
      <label class="check"><input type="radio" name="gender"> 男</label>
      <label class="check"><input type="radio" name="gender"> 女</label>
    </fieldset>

    .form-fieldset { border: none; padding: 0; margin: 0 0 16px; }
    .form-legend { padding: 0; margin-bottom: 8px; font-size: 13px; font-weight: 500; }

#### label 的 for 关联

每个输入框都应有 label，且 label 的 for 指向 input 的 id。点击 label 文字能让 input 获得焦点，这对小屏和辅助技术都很友好。本章的浮动 label 用 label 元素配合 + 兄弟选择器，保持了语义。

### 表单交互细节

好的表单不止样式好看，交互细节也体贴。

#### 输入限制与格式

用 maxlength 限制字符数，inputmode 提示移动端键盘类型（如 inputmode="numeric" 弹数字键盘），pattern 做轻量格式校验。

    <input type="tel" inputmode="numeric" maxlength="11" pattern="[0-9]*">

这些原生属性减少了对 JS 校验的依赖，体验也更一致。

#### 自动聚焦与回车提交

首屏表单的第一个输入框可 autofocus，让用户打开就能输入。表单内按回车默认触发 submit 按钮，但若按钮是 type="button" 则不会——这点要和交互设计对齐。

#### 输入清除按钮

搜索框常带一个「清除」按钮（×），点击清空内容。可用伪元素或一个绝对定位的按钮实现：

    .form-control--search {
      padding-right: 36px;
    }
    .form-control--search + .clear-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none; border: none; cursor: pointer;
      color: #999;
    }

清除按钮仅在输入框有内容时显示（用 JS 控制），避免无意义的空状态。

### 移动端表单适配

移动端表单有几个特殊考量：

1. 字号至少 16px：iOS Safari 在字号小于 16px 时会自动放大页面（为可读性），导致布局错乱。输入框 font-size 设为 16px 或以上可避免。
2. 触控目标至少 44×44px：Apple HIG 建议。复选框/单选框自定义后，点击区域不能只限于 18×18 的方块，应让 label 可点击范围更大（本章的 .check 用 label 包裹，点击文字也能切换）。
3. 避免悬停交互：移动端没有 hover，错误提示、tooltip 等不能依赖 hover 触发。
4. 键盘类型：type="email"、type="tel"、type="number" 会唤起对应键盘，减少用户切换。
5. 自动填充：浏览器自动填充会改变输入框背景色（尤其 Safari），可用 -webkit-autofill 处理：

    input:-webkit-autofill {
      -webkit-box-shadow: 0 0 0 1000px #fff inset;
      -webkit-text-fill-color: #333;
    }

### 校验时机与反馈

校验什么时候触发影响体验：

| 时机 | 优点 | 缺点 |
| --- | --- | --- |
| 提交时校验 | 不打扰输入 | 用户填完才发现错，返工多 |
| 失焦时校验 | 及时反馈 | 用户中途切走会看到错误 |
| 输入时校验 | 最及时 | 过于频繁，可能误报 |
| 失焦校验 + 输入时纠正 | 平衡 | 实现稍复杂 |

推荐「失焦时校验首次，之后输入时实时纠正」——首次失焦告诉用户对错，之后边输入边纠正，体验最佳。视觉上用本章的 form-control--error/success 配合 form-feedback 提示，颜色 + 文字双重反馈。

### 表单设计规范

1. 一列布局优于多列：一列从上到下填写，视线流动顺畅；多列容易漏填。
2. 主次按钮区分：提交按钮用 primary 实心，取消按钮用 outline 或纯文本，避免两个一样醒目。
3. 必填标记：用 * 或「必填」文字标记必填项，红色 * 是惯例。
4. 合理默认值：能预填的尽量预填（如根据定位预填城市），减少用户输入。
5. 分步表单：长表单拆成多步（注册分 2~3 步），每步少填几个，降低心理负担。
6. 即时帮助：复杂字段旁放说明（tooltip 或问号图标），但别让帮助文字喧宾夺主。

### 表单令牌的主题化

本章把表单颜色抽成 $form-* 变量。要支持暗色模式，可把这些变量改为 CSS 自定义属性，配合 Sass Map 输出（参考第四章设计系统的主题方案）。表单在暗色模式下：背景变深、边框变浅、占位符颜色调亮，焦点环颜色保持主题色但透明度调整。


### 表单布局进阶

本章的表单是纵向单列布局，适合大多数场景。但有些场景需要更复杂的布局。

#### 行内表单

登录栏、搜索栏常用行内布局，label 和 input 在同一行：

    .form--inline {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .form--inline .form-group {
      margin-bottom: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

行内表单要注意窄屏下回退为纵向，避免挤压：

    @media (max-width: 600px) {
      .form--inline { flex-direction: column; align-items: stretch; }
    }

#### 网格表单

复杂表单（如地址填写）可用 CSS Grid 让字段对齐：

    .form--grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form--grid .form-group--full { grid-column: span 2; }

「省」「市」各占一列，「详细地址」占满两列。网格表单比浮动布局更可控，字段天然对齐。窄屏下改为单列：

    @media (max-width: 600px) {
      .form--grid { grid-template-columns: 1fr; }
      .form--grid .form-group--full { grid-column: auto; }
    }

#### 分组与分步

长表单可用 fieldset 把相关字段分组，配合 legend 标注组名。更进一步可做「分步表单」——每步只显示一组字段，用 JS 控制步骤切换。视觉上用进度条提示当前进度，让用户知道还剩几步。分步表单降低心理负担，注册、结算等流程常用。

### 表单的国际化考量

国际化（i18n）场景下，表单有几个注意点：

1. 文本长度差异：德语比中文长 30% 左右，label 和按钮要留足空间，避免折行或截断。
2. 地址格式差异：美国是「街道-城市-州-邮编」，中国是「省-市-区-详细地址-邮编」，日本地址从大到小（邮编-都道府县-市-町）。地址表单应根据地区动态调整字段顺序和结构。
3. 姓名顺序：西方「名-姓」，东亚「姓-名」。姓名字段别假设顺序。
4. 电话号码格式：不同国家区号、长度不同，用 type="tel" + 国际区号选择器。
5. 文字方向：阿拉伯语、希伯来语从右到左（RTL），表单布局要镜像。用 CSS 的 dir="rtl" + 逻辑属性（margin-inline-start 等）适配。

Sass 在国际化中的角色主要是提供「方向无关」的样式工具。用逻辑属性（padding-inline、margin-block）替代物理属性（padding-left、margin-top），样式自动适配 LTR/RTL：

    .form-control { padding-inline: 12px; }  /* 自动适配方向 */

### 表单与后端交互的状态

表单不只是静态样式，还涉及多种交互状态，每种状态都应有对应的视觉反馈：

| 状态 | 触发 | 视觉表现 |
| --- | --- | --- |
| 默认 | 初始 | 普通边框 |
| 聚焦 | 点击/Tab | 焦点环 |
| 输入中 | 正在打字 | 可选：边框微亮 |
| 校验中 | 提交后异步校验 | spinner + 边框变灰 |
| 校验通过 | 校验完成 | 绿色边框 + 勾号 |
| 校验失败 | 校验完成 | 红色边框 + 错误提示 |
| 禁用 | 不可编辑 | 灰色 + 不可聚焦 |
| 只读 | 可看不可改 | 浅灰背景 + 默认光标 |

「校验中」状态容易被忽略，但异步校验（如检查用户名是否被注册）时，给用户「正在检查」的反馈很重要，避免用户以为卡住而重复提交。可以用一个小的 spinner 图标放在 input 右侧。

### 表单的只读与禁用区分

只读（readonly）和禁用（disabled）语义不同：readonly 的值会提交到后端，disabled 的值不会提交。视觉上也要区分：

    .form-control[readonly] {
      background: #f5f5f5;
      color: #666;
      cursor: default;
    }
    .form-control[disabled] {
      background: #eee;
      color: #aaa;
      cursor: not-allowed;
    }

readonly 用浅灰背景表示「可看不可改」，disabled 用更深的灰表示「完全不可用」。这种区分让用户理解字段的状态差异。

### 表单的默认值与占位符

placeholder 是「示例文本」，不能替代 label。label 描述字段含义，placeholder 给出格式提示。两者分工不同：

    <label for="phone">手机号</label>
    <input id="phone" placeholder="请输入 11 位手机号">

不要用 placeholder 代替 label（如直接 placeholder="手机号"）——输入内容后 placeholder 消失，用户会忘记字段是什么。浮动 label（本章实现）是兼顾两者的方案：未输入时 label 作占位，输入后 label 上浮变小。

### 表单的错误汇总与字段级提示

错误提示有两种策略：

1. 字段级：错误信息紧贴对应字段（本章的 form-feedback）。优点是定位精准，缺点是长表单可能多个错误分散，用户要滚动查看。
2. 汇总级：表单顶部列出所有错误，可点击跳转到对应字段。适合错误较多的场景。

最佳实践是两者结合：顶部汇总（告知「有 N 处错误」）+ 字段级提示（具体错在哪）。视觉上用 alert 组件做汇总，form-feedback 做字段级，颜色和图标保持一致。

### 表单的保存与恢复

长表单（如简历填写）用户可能中途离开，应支持「草稿保存」。前端可用 localStorage 定期存草稿，下次进入提示「恢复上次未完成的内容」。提交成功后清除草稿。这种细节大幅提升用户体验，避免「填了半小时结果误关页面」的悲剧。
### 本章小结

- 用 \`appearance: none\`（+ \`-webkit-\` 前缀）抹平浏览器默认外观，是自定义表单控件的前提。
- 把颜色、圆角、过渡抽成变量集中管理，换主题只改一处。
- 聚焦态用 \`box-shadow\` 焦点环替代默认 \`outline\`，既要美观又要保证无障碍可见性。
- 错误/成功状态显式覆盖焦点环颜色，保证状态优先级。
- 自定义 checkbox / radio：\`appearance: none\` + 伪元素 \`::after\` 画对勾/圆点。
- 自定义 select 箭头：\`appearance: none\` + 双 \`linear-gradient\` 拼 V 形。
- toggle 用「隐藏 input + track + thumb」结构，靠兄弟选择器联动。
- 浮动 label 依赖 \`:not(:placeholder-shown)\`，输入框必须有空格占位符。
- 布局分堆叠与行内，用 flex + gap 控制，间距统一管理。

下一章我们把视野放大到「设计系统」层面，用 Sass 构建一整套令牌、工具类、主题与基础组件库。
`,
    code: `// ============================================================
// 表单样式实战
// ============================================================

@use "sass:color";
@use "sass:map";

// ---------- 1. 表单令牌 ----------
$form-radius: 6px;
$form-border-color: #d0d5dd;
$form-bg: #fff;
$form-text: #333;
$form-focus-color: #3498db;
$form-error-color: #e74c3c;
$form-success-color: #27ae60;
$form-disabled-bg: #f0f2f5;
$form-label-color: #555;
$form-placeholder-color: #98a2b3;
$form-transition: border-color 0.18s ease, box-shadow 0.18s ease;

// ---------- 2. 输入框基础 ----------
.sass-demo .form-control {
  width: 100%;
  padding: 9px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: $form-text;
  background: $form-bg;
  border: 1px solid $form-border-color;
  border-radius: $form-radius;
  transition: $form-transition;
  appearance: none;
  -webkit-appearance: none;

  &::placeholder { color: $form-placeholder-color; }

  &:focus {
    outline: none;
    border-color: $form-focus-color;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
  }

  &:disabled {
    background: $form-disabled-bg;
    color: #aaa;
    cursor: not-allowed;
  }
}

// ---------- 3. 文本域 ----------
.sass-demo .form-control--textarea {
  min-height: 90px;
  resize: vertical;
}

// ---------- 4. 错误 / 成功状态 ----------
.sass-demo .form-control--error {
  border-color: $form-error-color;
  &:focus {
    border-color: $form-error-color;
    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.15);
  }
}

.sass-demo .form-control--success {
  border-color: $form-success-color;
  &:focus {
    border-color: $form-success-color;
    box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.15);
  }
}

.sass-demo .form-feedback {
  font-size: 12px;
  margin-top: 4px;
  &--error   { color: $form-error-color; }
  &--success { color: $form-success-color; }
}

// ---------- 5. 标签与表单组 ----------
.sass-demo .form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: $form-label-color;
}

.sass-demo .form-group {
  margin-bottom: 16px;
}

// ---------- 6. 堆叠 / 行内布局 ----------
.sass-demo .form--stacked .form-group {
  display: flex;
  flex-direction: column;
}

.sass-demo .form--inline {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  .form-group { margin-bottom: 0; flex: 1 1 180px; }
  .form-label { margin-bottom: 0; margin-right: 8px; }
}

// ---------- 7. 复选框 / 单选框（自定义） ----------
.sass-demo .check {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  input[type="checkbox"],
  input[type="radio"] {
    appearance: none;
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border: 1px solid $form-border-color;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    position: relative;
    transition: $form-transition;
    &:checked {
      background: $form-focus-color;
      border-color: $form-focus-color;
      &::after {
        content: "";
        position: absolute;
        left: 5px;
        top: 1px;
        width: 5px;
        height: 10px;
        border: solid #fff;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
    &:focus { box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15); }
  }
  input[type="radio"] {
    border-radius: 50%;
    &:checked::after {
      width: 8px;
      height: 8px;
      border: none;
      background: #fff;
      border-radius: 50%;
      left: 4px;
      top: 4px;
      transform: none;
    }
  }
}

// ---------- 8. 下拉选择 ----------
.sass-demo .form-control--select {
  appearance: none;
  -webkit-appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #888 50%),
                    linear-gradient(135deg, #888 50%, transparent 50%);
  background-position: calc(100% - 16px) 50%, calc(100% - 11px) 50%;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
  padding-right: 32px;
}

// ---------- 9. 开关 toggle ----------
.sass-demo .toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  input { display: none; }
  &__track {
    position: absolute;
    inset: 0;
    background: #ccc;
    border-radius: 999px;
    transition: background 0.2s ease;
  }
  &__thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease;
  }
  input:checked + .toggle__track { background: $form-success-color; }
  input:checked + .toggle__track + .toggle__thumb { transform: translateX(20px); }
}

// ---------- 10. 浮动 label ----------
.sass-demo .float-field {
  position: relative;
  .form-control {
    padding-top: 16px;
    padding-bottom: 4px;
  }
  .form-label {
    position: absolute;
    left: 12px;
    top: 10px;
    color: $form-placeholder-color;
    font-size: 14px;
    pointer-events: none;
    transition: all 0.18s ease;
  }
  .form-control:focus + .form-label,
  .form-control:not(:placeholder-shown) + .form-label {
    top: 4px;
    font-size: 11px;
    color: $form-focus-color;
  }
}

// ---------- 11. 表单验证图标 ----------
.sass-demo .form-icon {
  position: relative;
  &.is-valid::after,
  &.is-invalid::after {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
  }
  &.is-valid::after   { content: "✓"; color: $form-success-color; }
  &.is-invalid::after { content: "✕"; color: $form-error-color; }
  .form-control { padding-right: 32px; }
}

// ---------- 12. 搜索框变体 ----------
.sass-demo .form-control--search {
  padding-left: 36px;
  background-image: linear-gradient(45deg, #888 50%, transparent 50%),
                    linear-gradient(135deg, transparent 50%, #888 50%);
  background-position: 10px 50%, 14px 50%;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
}
`,
  },

  // =========================================================
  // 第四章：设计系统构建
  // =========================================================
  {
    id: "sass-design-system",
    group: "实战案例",
    icon: "🎯",
    title: "设计系统构建",
    content: `## 设计系统构建

前面三章我们分别构建了按钮、卡片、表单。但真实项目里，这些组件必须共享同一套「设计语言」——同样的间距、颜色、圆角、阴影、字号、断点。否则按钮的圆角是 5px、卡片的圆角是 10px、输入框的圆角是 6px，全站看起来就「碎」了。

**设计系统（Design System）** 就是把这套共享的设计语言抽象成「设计令牌（Design Token）」，再用令牌驱动工具类和组件的生成。本章我们用 Sass 构建一个迷你但完整的设计系统：令牌定义、工具类自动生成（间距 / 文本 / flex / 圆角 / 阴影）、亮暗主题切换、基础组件库（badge / alert / tag / avatar / tooltip）、排版系统、响应式断点体系，以及可维护性考量。

### 什么是设计令牌

设计令牌是「设计决策的具象化」。设计师说「主色是蓝色」「间距以 8 为基准」，这些决策在代码里就变成一个个命名的变量：\`$color-primary\`、\`$spacing-base: 8px\`。令牌的价值在于**单一真相源**：任何地方要用主色，都引用同一个令牌；改主色时，只改令牌一处，全站联动。

令牌通常按类型分组：

| 类型 | 示例 | 作用 |
| --- | --- | --- |
| 颜色 | primary / success / gray-50 | 品牌色、语义色、灰阶 |
| 间距 | base 8px | 内外边距的基准单位 |
| 字号 | xs / sm / base / lg | 排版尺寸阶梯 |
| 字重 | normal / medium / bold | 字重阶梯 |
| 行高 | tight / base / relaxed | 行高阶梯 |
| 圆角 | sm / md / lg / full | 圆角层级 |
| 阴影 | sm / md / lg | 阴影层级 |
| 层级 | dropdown / modal / toast | z-index 语义化 |
| 时长 | fast / base / slow | 动画时长 |
| 断点 | sm / md / lg | 响应式断点 |

### 第 1 步：定义令牌

#### 颜色令牌

颜色是最重要的令牌。用 Map 组织，键名是语义名而非色相名（用 \`primary\` 而非 \`blue\`，因为主色可能换成绿色）：

\`\`\`scss
$ds-colors: (
  primary:  #3498db,
  success:  #27ae60,
  warning:  #f39c12,
  danger:   #e74c3c,
  info:     #17a2b8,
  gray-50:  #f9fafb,
  gray-100: #f3f4f6,
  gray-400: #9ca3af,
  gray-700: #374151,
  gray-900: #111827,
);
\`\`\`

灰阶用数字编号（50/100/400/700/900）而不是 light/dark，因为灰阶往往有 5~10 个层级，数字编号更清晰，也方便插值。

#### 间距令牌：8px 基准

间距系统通常以一个基准值（8px）的倍数组织：4(sm)、8、12、16、24、32、48……这样全站间距都是「和谐的倍数关系」，视觉上有韵律感。

\`\`\`scss
$ds-spacing-base: 8px;
\`\`\`

只定义基准值，具体的 \`mt-4\`（margin-top: 32px）通过 \`$ds-spacing-base * 4\` 计算。这样改基准值（比如改成 4px）时，所有间距等比缩放。

#### 其他令牌

\`\`\`scss
$ds-radius:      (sm: 4px, md: 8px, lg: 16px, full: 9999px);
$ds-font-size:   (xs: 12px, sm: 13px, base: 14px, md: 16px, lg: 18px, xl: 20px, 2xl: 24px, 3xl: 30px);
$ds-font-weight: (normal: 400, medium: 500, semibold: 600, bold: 700);
$ds-line-height: (tight: 1.25, base: 1.5, relaxed: 1.75);
$ds-shadow: (
  sm: 0 1px 2px rgba(0,0,0,0.06),
  md: 0 4px 10px rgba(0,0,0,0.08),
  lg: 0 10px 24px rgba(0,0,0,0.12),
);
$ds-z-index:     (dropdown: 100, sticky: 200, modal: 1000, toast: 1100);
$ds-duration:    (fast: 0.12s, base: 0.2s, slow: 0.4s);
$ds-breakpoints: (sm: 600px, md: 900px, lg: 1200px);
\`\`\`

z-index 用语义化命名而非魔法数字：写 \`z-index: map.get($ds-z-index, modal)\` 比 \`z-index: 1000\` 可读得多，也避免了「这个 1000 和那个 1000 是不是一回事」的混乱。

### 第 2 步：亮暗主题切换

#### 为什么用 CSS 变量而非 Sass 变量

Sass 变量在编译期就固定了，无法在运行时切换。要实现「用户点一下切换暗色模式」，必须用 CSS 自定义属性（CSS 变量），它在运行时生效。Sass 变量负责「定义主题的值」，CSS 变量负责「运行时承载这些值」——两者配合是最好的方案。

#### 用 Sass Map 生成 CSS 变量

把亮色和暗色两套主题分别定义成 Map，再用 \`@each\` 把它们输出成 CSS 变量：

\`\`\`scss
$ds-themes: (
  light: (bg: #ffffff, text: #1a1a1a, surface: #f5f6f8, border: #e5e7eb),
  dark:  (bg: #111418, text: #e8eaed, surface: #1c1f24, border: #2a2e35),
);

.sass-demo {
  @each $key, $val in map.get($ds-themes, light) {
    --ds-bg-#{$key}: #{$val};
  }
  &.dark {
    @each $key, $val in map.get($ds-themes, dark) {
      --ds-bg-#{$key}: #{$val};
    }
  }
}
\`\`\`

\`map.get($ds-themes, light)\` 取出亮色 Map，遍历后生成 \`--ds-bg-bg\`、\`--ds-bg-text\`、\`--ds-bg-surface\`、\`--ds-bg-border\` 四个变量。\`.dark\` 修饰符下重新输出同名变量，覆盖亮色值。组件里用 \`var(--ds-bg-text)\` 引用，切换 \`.dark\` 类时自动变色。

这种「Sass Map → CSS 变量」的模式兼具两者优点：Sass 端可以集中维护主题数据（甚至从 JSON 导入），CSS 端可以运行时切换。

#### 消费主题变量

\`\`\`scss
.sass-demo .ds-surface {
  background: var(--ds-bg-surface);
  color: var(--ds-bg-text);
  border: 1px solid var(--ds-bg-border);
  padding: $ds-spacing-base * 2;
  border-radius: map.get($ds-radius, md);
}
\`\`\`

颜色用 \`var()\`（运行时切换），尺寸用 Sass 变量（编译时固定，因为尺寸不需要随主题变）。这种分工要牢记：**需要运行时变化的用 CSS 变量，编译时固定的用 Sass 变量。**

### 第 3 步：间距工具类生成

Tailwind 风格的间距工具类（\`.mt-4\`、\`.px-2\`）是设计系统的招牌。用 \`@each\` + 计算批量生成：

\`\`\`scss
@each $i in 0, 1, 2, 3, 4, 5, 6 {
  $size: $ds-spacing-base * $i;
  .sass-demo .mt-#{$i} { margin-top: $size; }
  .sass-demo .mb-#{$i} { margin-bottom: $size; }
  .sass-demo .mx-#{$i} { margin-left: $size; margin-right: $size; }
  .sass-demo .my-#{$i} { margin-top: $size; margin-bottom: $size; }
  .sass-demo .px-#{$i} { padding-left: $size; padding-right: $size; }
  .sass-demo .py-#{$i} { padding-top: $size; padding-bottom: $size; }
  // ... pt / pb / ml / mr
}
\`\`\`

\`@each $i in 0, 1, 2, 3, 4, 5, 6\` 遍历数字列表，\`$size: $ds-spacing-base * $i\` 计算实际像素值。一次循环生成 7 档 × 多个方向的所有工具类。要新增一档（比如 \`mt-8\`），只需在列表里加个 \`8\`。

为什么 0 也要生成？因为 \`.mt-0\`（重置上边距）是非常高频的需求，在覆盖默认间距时必不可少。

> 产物体积：7 档 × 10 个方向 = 70 个类，未压缩约 2KB。设计系统的工具类体积是可接受的——它们会被大量复用，gzip 后实际传输体积很小。

### 第 4 步：文本与 flex 工具类

#### 文本工具类

\`\`\`scss
@each $name, $size in $ds-font-size {
  .sass-demo .text-#{$name} { font-size: $size; }
}
@each $name, $weight in $ds-font-weight {
  .sass-demo .font-#{$name} { font-weight: $weight; }
}
.sass-demo .text-center { text-align: center; }
.sass-demo .text-left   { text-align: left; }
.sass-demo .text-right  { text-align: right; }
@each $name, $color in $ds-colors {
  .sass-demo .text-c-#{$name} { color: $color; }
  .sass-demo .bg-#{$name}      { background: $color; }
}
\`\`\`

字号、字重、对齐、文本色、背景色都用循环生成。注意文本色用 \`text-c-\` 前缀避免和字号 \`text-\` 冲突（\`text-sm\` 是字号，\`text-c-primary\` 是颜色）。

#### flex 工具类

\`\`\`scss
.sass-demo .flex          { display: flex; }
.sass-demo .flex-col      { flex-direction: column; }
.sass-demo .items-center  { align-items: center; }
.sass-demo .justify-between { justify-content: space-between; }
.sass-demo .gap-2 { gap: 8px; }
.sass-demo .gap-4 { gap: 16px; }
\`\`\`

flex 工具类不用循环（组合不多，手写更清晰）。\`gap\` 工具类复用间距基准：\`gap-2 = 8px\`、\`gap-4 = 16px\`。

#### 圆角与阴影工具类

\`\`\`scss
@each $name, $r in $ds-radius {
  .sass-demo .radius-#{$name} { border-radius: $r; }
}
@each $name, $sh in $ds-shadow {
  .sass-demo .shadow-#{$name} { box-shadow: $sh; }
}
\`\`\`

圆角和阴影都从令牌 Map 生成，保证全站层级一致。

### 第 5 步：排版系统

标题层级用令牌驱动，保证字号、字重、行高一致：

\`\`\`scss
.sass-demo .h1, .sass-demo .h2, .sass-demo .h3, .sass-demo .h4 {
  margin: 0 0 8px;
  font-weight: map.get($ds-font-weight, bold);
  line-height: map.get($ds-line-height, tight);
  color: var(--ds-bg-text);
}
.sass-demo .h1 { font-size: map.get($ds-font-size, 3xl); }
.sass-demo .h2 { font-size: map.get($ds-font-size, 2xl); }
.sass-demo .h3 { font-size: map.get($ds-font-size, xl); }
.sass-demo .h4 { font-size: map.get($ds-font-size, lg); }
\`\`\`

注意标题颜色用 \`var(--ds-bg-text)\`，这样暗色模式下标题自动变浅色。字号/字重/行高用 Sass 令牌，因为它们不随主题变。

### 第 6 步：基础组件库

设计系统的组件层建立在令牌之上。这里展示几个最基础的小组件。

#### badge 徽章

badge 用浅底深字的配色——背景是主色的浅化版，文字是主色的深化版，靠 \`color.adjust\` 自动派生：

\`\`\`scss
@each $name, $color in $ds-colors {
  .sass-demo .badge--#{$name} {
    display: inline-block;
    padding: 2px 8px;
    font-size: map.get($ds-font-size, xs);
    font-weight: map.get($ds-font-weight, medium);
    border-radius: map.get($ds-radius, full);
    background: color.adjust($color, $lightness: 35%);
    color: color.adjust($color, $lightness: -25%);
  }
}
\`\`\`

\`color.adjust($color, $lightness: 35%)\` 把颜色变浅 35% 作为背景，\`$lightness: -25%\` 变深 25% 作为文字。这样每种颜色自动生成可读的浅底深字配色，无需为每个颜色手调。圆角用 \`full\`（9999px）做成胶囊形。

#### alert 提示框

alert 比 badge 多一个左侧色条，强调语义：

\`\`\`scss
@each $name, $color in $ds-colors {
  .sass-demo .alert--#{$name} {
    padding: 10px 14px;
    border-radius: map.get($ds-radius, md);
    border-left: 4px solid $color;
    background: color.adjust($color, $lightness: 38%);
    color: color.adjust($color, $lightness: -30%);
    font-size: map.get($ds-font-size, sm);
    margin-bottom: 8px;
  }
}
\`\`\`

\`border-left: 4px solid $color\` 是色条，背景仍是浅化版。alert 的 padding、圆角、字号都引用令牌，与 badge 保持视觉一致。

#### tag 标签

tag 用中性灰，比 badge 更低调：

\`\`\`scss
.sass-demo .tag {
  display: inline-block;
  padding: 4px 10px;
  font-size: map.get($ds-font-size, xs);
  background: map.get($ds-colors, gray-100);
  color: map.get($ds-colors, gray-700);
  border-radius: map.get($ds-radius, sm);
  margin-right: 4px;
}
\`\`\`

#### avatar 头像

avatar 有尺寸变体（sm / 默认 / lg），并支持图片：

\`\`\`scss
.sass-demo .avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: map.get($ds-colors, primary);
  color: #fff;
  font-weight: map.get($ds-font-weight, bold);
  overflow: hidden;
  &--sm { width: 28px; height: 28px; font-size: 12px; }
  &--lg { width: 56px; height: 56px; font-size: 20px; }
  img { width: 100%; height: 100%; object-fit: cover; }
}
\`\`\`

\`overflow: hidden\` + \`img { object-fit: cover }\` 让头像图片自动裁剪成圆形。

#### tooltip 提示

tooltip 用纯 CSS 实现：\`::after\` 伪元素读取 \`data-tip\` 属性作为内容，hover 时显示。

\`\`\`scss
.sass-demo .tooltip {
  position: relative;
  display: inline-block;
  &::after {
    content: attr(data-tip);
    position: absolute;
    bottom: 130%;
    left: 50%;
    transform: translateX(-50%);
    background: map.get($ds-colors, gray-900);
    color: #fff;
    padding: 4px 8px;
    font-size: map.get($ds-font-size, xs);
    border-radius: map.get($ds-radius, sm);
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity map.get($ds-duration, base);
  }
  &:hover::after { opacity: 1; }
}
\`\`\`

\`content: attr(data-tip)\` 从 HTML 的 \`data-tip\` 属性取值，无需 JS。\`opacity: 0\` + \`pointer-events: none\` 默认隐藏且不拦截鼠标，hover 时 \`opacity: 1\` 渐显。过渡时长引用 \`$ds-duration\` 令牌。

### 第 7 步：响应式断点体系

把断点也收进令牌 Map，并用 mixin 封装媒体查询，避免到处写 \`@media (min-width: 600px)\` 这种魔法数字：

\`\`\`scss
@mixin ds-up($bp) {
  @media (min-width: map.get($ds-breakpoints, $bp)) {
    @content;
  }
}

.sass-demo .ds-grid {
  display: grid;
  gap: $ds-spacing-base * 2;
  grid-template-columns: 1fr;
  @include ds-up(sm) { grid-template-columns: repeat(2, 1fr); }
  @include ds-up(md) { grid-template-columns: repeat(3, 1fr); }
  @include ds-up(lg) { grid-template-columns: repeat(4, 1fr); }
}
\`\`\`

\`@include ds-up(sm) { ... }\` 比 \`@media (min-width: 600px) { ... }\` 可读得多，且断点集中管理。改断点值时只改 Map 一处，所有用了 \`ds-up\` 的地方联动。

\`@content\` 让 mixin 可以接收一段样式块，这是 Sass mixin 的「内容块」机制，非常适合封装媒体查询。

### 可维护性与扩展性

#### 单一真相源

整套系统的核心价值：**每个设计决策只有一个定义点**。

- 主色：只在 \`$ds-colors\` 的 \`primary\` 定义一次。
- 8px 间距：只在 \`$ds-spacing-base\` 定义一次。
- 断点：只在 \`$ds-breakpoints\` 定义一次。

任何地方需要这些值，都引用令牌，绝不硬编码。这样改一处全站联动，且不会出现「两个看似一样的蓝色其实是不同色值」的漂移。

#### 工具类 vs 组件类

设计系统通常同时提供「工具类」和「组件类」两层：

- **工具类**（\`.mt-4\`、\`.flex\`）：原子化，灵活组合，适合一次性布局调整。
- **组件类**（\`.btn\`、\`.card\`）：语义化，封装完整组件，适合复用。

两者不是二选一。日常开发优先用组件类保证一致性，遇到组件类覆盖不到的细节再用工具类微调。但要警惕「工具类堆砌出组件」——那会让 HTML 臃肿且难维护，此时应该抽成一个新的组件类。

#### 命名规范

| 前缀 | 含义 | 示例 |
| --- | --- | --- |
| \`ds-\` | 设计系统内部命名空间 | \`.ds-grid\` / \`.ds-container\` |
| \`text-\` | 字号 | \`.text-sm\` |
| \`text-c-\` | 文本色 | \`.text-c-primary\` |
| \`bg-\` | 背景 | \`.bg-success\` |
| \`mt/mb/mx/my\` | 外边距 | \`.mt-4\` |
| \`pt/pb/px/py\` | 内边距 | \`.px-2\` |
| \`radius-\` | 圆角 | \`.radius-md\` |
| \`shadow-\` | 阴影 | \`.shadow-lg\` |
| \`font-\` | 字重 | \`.font-bold\` |

用命名空间（\`ds-\`）避免和业务代码冲突。工具类前缀和 Tailwind 对齐，降低团队学习成本。

### 实战要点与常见坑

#### 坑 1：CSS 变量的作用域

CSS 变量遵循 DOM 层叠：在 \`.sass-demo\` 上定义的变量，只有 \`.sass-demo\` 及其后代能访问。如果某个组件在 \`.sass-demo\` 之外，\`var(--ds-bg-text)\` 会失效。解决：把主题变量定义在 \`::root\` 或更高层容器上。本教程为了预览隔离定义在 \`.sass-demo\`，实际项目应在 \`::root\`。

#### 坑 2：color.adjust 越界

\`color.adjust($color, $lightness: 35%)\` 在颜色已经很浅时会超出 100%，Sass 会自动 clamp 到 100%（白色）。这不会报错，但可能导致浅色背景下文字对比度不足。对于 badge/alert 这类「浅底深字」场景，更稳妥的做法是用 \`color.mix($color, white, 20%)\`（20% 主色 + 80% 白）混出浅底，可控性更强。

#### 坑 3：工具类优先级

工具类是单类选择器（\`.mt-4\`），优先级低。如果组件类（如 \`.card__body\`）也设了 margin，工具类可能被覆盖。这是 Tailwind 等工具类框架也面临的问题。解决：要么组件类不设可被工具类覆盖的属性，要么接受「工具类只在不冲突时生效」。

#### 坑 4：@each 生成类的体积

7 档间距 × 10 方向 = 70 个类，加上文本、flex、圆角、阴影等，工具类总量可能上千。未压缩体积可观，但 gzip 后通常 < 10KB。如果产物体积敏感，可以只生成实际用到的档位（用 PurgeCSS / sass 的条件编译裁剪）。

#### 坑 5：暗色模式的图片

暗色模式下，浅色背景的图片会刺眼。可以用 \`filter: brightness(0.9)\` 在暗色模式略微降低图片亮度。但这属于细节优化，非设计系统核心。

#### 坑 6：断点 mixin 的 @content

\`@mixin ds-up($bp) { @media (...) { @content; } }\` 里 \`@content\` 接收的是 mixin 调用时大括号内的样式块。注意 \`@content\` 只能在 mixin 内部使用，且每个 mixin 调用只能有一个内容块。

### 可扩展性演示

#### 新增一个颜色

设计师要加一个「品牌紫」。只需在 \`$ds-colors\` 加一行：

\`\`\`scss
$ds-colors: (
  // ... 原有颜色
  brand: #8e44ad,
);
\`\`\`

所有循环（\`text-c-brand\`、\`bg-brand\`、\`badge--brand\`、\`alert--brand\`）自动生成，包括浅底深字的派生配色。零手写。

#### 新增一个圆角档位

\`\`\`scss
$ds-radius: (sm: 4px, md: 8px, lg: 16px, xl: 24px, full: 9999px);
\`\`\`

\`radius-xl\` 自动可用。

这就是设计系统的扩展性：**令牌即配置，循环即生成**。新增一个维度值的边际成本接近零。


### 设计令牌的分层

成熟的设计系统会把令牌分三层，而非一股脑平铺：

| 层级 | 含义 | 示例 |
| --- | --- | --- |
| 全局令牌（Global） | 原始设计值，最底层 | blue-500: #3498db; gray-100: #f3f4f6 |
| 别名令牌（Alias） | 语义化的引用，指向全局 | primary: blue-500; border-default: gray-100 |
| 组件令牌（Component） | 组件专用，指向别名 | button-bg-primary: primary; input-border: border-default |

分层的好处是解耦：改全局令牌（如换品牌色 blue-500），所有别名和组件令牌自动联动；改别名（如 primary 从 blue-500 换成 green-500），只影响语义「主色」相关的，不影响其他蓝色用法。这种「引用链」让设计系统既灵活又可控。

本章为简洁把令牌压成一层（$ds-colors 直接放语义名）。生产系统建议拆成三层，用 Sass 变量互相引用：

    $blue-500: #3498db;
    $gray-100: #f3f4f6;
    $primary: $blue-500;
    $border-default: $gray-100;
    $button-bg-primary: $primary;

### 设计系统的治理与版本化

设计系统是一个「产品」，需要持续维护和版本治理。

#### 语义化版本

设计系统应遵循语义化版本（SemVer）：破坏性变更（删类、改 token 含义）升主版本，新增能力（加令牌、加组件）升次版本，修复升补丁版本。消费方可以根据版本号判断升级风险。

#### 变更日志

每次发版记录变更：新增了什么、修改了什么、废弃了什么、破坏了什么。废弃（deprecate）而非直接删除——先标记废弃、给迁移指引，下一个大版本才删除，给消费方迁移时间。本章用 color.adjust 替代弃用的 lighten 就是这种「先废弃再迁移」的体现。

#### 单一仓库 vs 多仓库

小型系统可放在业务仓库里；中大型系统建议独立仓库（独立 npm 包），业务方按版本依赖。独立仓库让设计系统的发版节奏不被业务绑架，也方便多业务线共享。

### 与设计工具（Figma）的协同

设计系统的代码令牌应与设计稿令牌一一对应。Figma 的 Variables/Styles 功能可以定义颜色、间距、字号等令牌，与代码端的 $ds-colors、$ds-spacing-base 同名同值。通过 Design Tokens 格式（W3C 标准）或插件（如 Tokens Studio），可在 Figma 与代码间双向同步令牌。

协同流程：设计师在 Figma 改令牌 → 导出 JSON → 工具转成 SCSS → 开发拉取更新。反之，开发新增令牌也要同步回 Figma。保持两端一致是设计系统落地的关键，否则「设计稿一套、代码一套」的漂移会让系统名存实亡。

### 设计系统的落地流程

从零构建设计系统的推荐步骤：

1. 盘点现状：收集现有页面的颜色、间距、字号，统计重复与冲突。这步能说服团队「我们需要统一」。
2. 定义令牌：基于盘点结果 + 设计师输入，确定核心令牌（主色、灰阶、间距基准、字号阶梯）。先少后多，够用即止。
3. 生成工具类：用 @each 批量产出间距、文本、flex 等工具类（本章第 3~6 步）。
4. 抽组件：把高频组件（按钮、卡片、表单、badge）用令牌重写，替换散落的手写样式。
5. 主题化：加亮/暗主题（本章第 2 步的 CSS 变量方案）。
6. 文档：每个令牌、工具类、组件都写示例和用法。文档让系统可发现、可学习。
7. 推广与治理：建立贡献流程，新组件/令牌的评审机制，避免系统被随意污染。

### 文档与可发现性

设计系统没有文档等于不存在。每个组件应有：长什么样（可视化示例）、怎么用（HTML 代码）、有哪些变体（修饰符列表）、何时用（适用场景）、何时不用（反模式）。工具类应有查询表（如间距表、字号表）。文档站可用 Storybook、Astro、Vitepress 等搭建，关键是要让团队能快速查到「我要的 spacing 是哪个类」。

### 测试与一致性保障

设计系统的样式也需测试：

1. 视觉回归测试：用 Playwright/Storybook + Chromatic 截图对比，防止改动引入视觉差异。
2. 令牌使用扫描：lint 规则禁止代码里硬编码颜色/间距，强制用令牌或工具类。Stylelint 可配 custom-property / SCSS 变量白名单。
3. 对比度检查：自动化检查文本与背景对比度是否达标。
4. 产物体积监控：CI 跟踪 CSS 产物大小，异常增长报警。

这些保障让设计系统在迭代中不腐化，长期保持一致性。

### 扩展性的边界

设计系统追求「配置即生成」，但也要警惕过度抽象。并非所有样式都值得抽成令牌和循环——只出现一次的值硬编码无妨，三个以上重复才考虑抽象。「三次法则」（Rule of Three）是好的判断标准：第三次重复时再抽象，避免过早抽象带来的复杂度。

本章的 @each 批量生成适合「维度明确、组合有限」的场景（颜色、尺寸、间距档位）。对于高度动态、组合爆炸的场景，循环生成的产物可能臃肿，此时应回到「按需引用」或用 CSS-in-JS 的运行时方案。工具选型永远要看场景，没有银弹。


### 设计系统的度量与健康度

设计系统需要可度量的指标来判断健康度，避免「感觉不错」的主观判断。

#### 令牌覆盖率

衡量代码中「使用令牌 vs 硬编码」的比例。理想情况下，颜色、间距、字号应 100% 来自令牌。可用 Stylelint 自定义规则扫描：

    /* stylelint 配置：禁止硬编码颜色 */
    "color-no-hex": true,
    "declaration-property-value-allowed-list": {
      "/.*/": "/^(var\\(--|\\$)[\\s\\S]+$/"
    }

覆盖率低于 80% 说明系统推广不足或令牌不够用，需要补令牌或推动迁移。

#### 组件复用率

统计项目中「使用设计系统组件 vs 自写样式」的比例。复用率高说明系统实用；低说明组件不够用或不好用，需要补组件或改进 API。

#### 产物体积

跟踪 CSS 产物大小变化。如果一次改动让产物增长超过 10%，需审查是否引入了不必要的样式。 gzip 后的设计系统核心 CSS（令牌 + 工具类 + 基础组件）通常在 20-40KB，超出这个范围可能存在冗余。

#### 这些指标的意义

度量不是为了考核，而是为了发现系统的问题。覆盖率低 → 推广或补令牌；复用率低 → 改进组件；体积大 → 清理冗余。没有度量的设计系统会慢慢腐化，最终被业务方抛弃。

### 设计系统的团队协作

设计系统不是一个人的工作，需要设计、开发、产品多方协作。

#### 角色分工

| 角色 | 职责 |
| --- | --- |
| 设计师 | 定义视觉语言、令牌、组件规范 |
| 前端 | 实现令牌与组件、维护代码 |
| 产品 | 提出需求、验证可用性 |
| 设计系统负责人 | 协调各方、把控一致性 |

中大型团队应有专职的设计系统团队（哪怕只有 1-2 人），否则系统会在业务压力下被牺牲。小型团队可由资深前端兼管，但要预留维护时间。

#### 贡献流程

业务方遇到系统不够用时，应通过「贡献流程」补充，而非自己 hack。流程：

1. 提需求：在系统仓库提 issue，说明场景和需要的令牌/组件。
2. 评审：设计系统团队评估是否符合系统规范、是否有通用性。
3. 实现：由系统团队或贡献者实现，通过 PR 合入。
4. 发版：随版本发布，通知所有消费方。

这个流程保证系统的演进有序，避免被业务需求带偏。贡献者可以是任何业务开发，系统团队负责把关。

#### 与业务方的沟通

设计系统要「好卖」才能落地。沟通技巧：

1. 用数据说话：统一后开发效率提升 X%、bug 减少 Y%、视觉一致性提升。
2. 降低迁移成本：提供迁移指南、codemod 脚本、兼容期，别让业务方一次性重写。
3. 快速响应：业务方提的问题及时回复，建立信任。一个「提了问题三个月没人理」的系统不会被采用。

### 设计系统的演进策略

设计系统会随产品演进，需要策略性更新。

#### 向后兼容

破坏性变更（删类、改 token 含义）是消费方的噩梦。策略：

1. 新增优先于修改：需要新能力时，加新令牌/新类，而非改旧的。
2. 废弃先于删除：标记废弃 → 提供替代 → 等一个版本周期 → 删除。
3. 大版本承载破坏性变更：v2.0 集中处理累积的破坏性变更，配详细迁移指南。

#### 渐进迁移

大规模迁移不要「大爆炸」式重写。策略：

1. 双跑：新旧系统共存，新页面用新系统，老页面逐步迁移。
2. codemod：用 AST 工具自动替换类名/令牌，减少人工。
3. 灰度：先在一个业务线试点，验证无问题后推广。

#### 版本策略

设计系统的版本号应遵循 SemVer：

- 主版本（2.0）：破坏性变更。
- 次版本（1.5）：新增令牌/组件，向后兼容。
- 补丁版本（1.5.1）：bug 修复。

消费方在 package.json 用 ^1.5.0 自动获取补丁和次版本，用 ~1.5.0 只获取补丁。破坏性变更需手动升级主版本，给消费方控制权。

### 工具类与组件类的边界

设计系统同时提供工具类（utility class，如 .mt-4、.text-center）和组件类（component class，如 .btn、.card）。两者边界要清晰，避免混淆。

#### 工具类的定位

工具类是「原子能力」，单一职责，可自由组合。适合「一次性布局调整」，如「这个 div 加个上边距」。工具类不应包含业务语义，只表达「做什么」（加边距、居中、变红），不表达「为什么」。

#### 组件类的定位

组件类是「封装好的整体」，内部结构固定。适合「复用的 UI 单元」，如按钮、卡片、表单。组件类封装了「怎么做」（BEM 结构、状态、变体），使用者只需关心「用哪个变体」。

#### 何时用哪个

| 场景 | 用工具类 | 用组件类 |
| --- | --- | --- |
| 一次性布局（.mt-4 .text-center） | ✓ | |
| 复用 UI 单元（按钮、卡片） | | ✓ |
| 组件内微调 | ✓（少量） | |
| 全新交互模式 | | ✓（新建组件） |

原则：能用组件类就用组件类（保证一致性），组件类不够用时用工具类补充（灵活），避免「全工具类拼组件」（失去封装，难以维护）。

### 设计系统的反模式

几个常见的设计系统反模式，引以为戒：

1. 过度抽象：把所有样式都抽成令牌和循环，简单的东西变复杂。只抽象重复 3 次以上的。
2. 工具类爆炸：生成上万种工具类组合，产物臃肿。按需生成或 purge 未使用的。
3. 组件耦合业务：组件类里写业务逻辑（如 .btn--submit-form），失去通用性。组件应只关注 UI。
4. 令牌过细：每个像素都设令牌（spacing-1 到 spacing-100），选择困难。用 8px 基准 + 少量档位。
5. 文档滞后：代码改了文档没更新，文档变成「谎言」。文档与代码同仓库，CI 校验示例可运行。
6. 强制一刀切：不允许任何例外，业务方被迫 hack。保留 escape hatch（如 .raw 类重置），在规范与灵活间平衡。

设计系统是工具不是教条，最终目标是提升效率和一致性，而非制造约束。一个让业务方「想用、好用」的系统才是成功的系统。
### 本章小结

- 设计令牌是设计决策的单一真相源，按类型分组（颜色 / 间距 / 字号 / 圆角 / 阴影 / 层级 / 时长 / 断点）。
- 间距以 8px 为基准，工具类通过 \`$base * $i\` 计算生成，全站间距和谐。
- 主题切换用「Sass Map 定义 → @each 输出 CSS 变量 → 组件用 var() 消费」模式，兼具编译期集中管理和运行时切换。
- 需要运行时变化的用 CSS 变量，编译时固定的用 Sass 变量。
- 工具类（间距 / 文本 / flex / 圆角 / 阴影）用 \`@each\` 批量生成，一次配置产出全套。
- 组件层（badge / alert / tag / avatar / tooltip）建立在令牌之上，浅底深字配色用 \`color.adjust\` 自动派生。
- 响应式断点用 mixin + \`@content\` 封装，\`@include ds-up(sm)\` 替代裸 \`@media\`。
- 命名空间（\`ds-\`）+ 与 Tailwind 对齐的工具类前缀，降低冲突和学习成本。
- 扩展性核心：令牌即配置，循环即生成，新增维度值的边际成本趋近于零。

至此，第四章也是本批教程的最后一章结束。四章连起来，你已经能用 Sass 从按钮、卡片、表单一路构建到完整的设计系统，覆盖了真实项目里最常见的工程化场景。
`,
    code: `// ============================================================
// 设计系统构建 —— 令牌、工具类、主题与组件库
// ============================================================

@use "sass:color";
@use "sass:map";

// ---------- 1. 设计令牌（Sass Map） ----------
$ds-colors: (
  primary:  #3498db,
  success:  #27ae60,
  warning:  #f39c12,
  danger:   #e74c3c,
  info:     #17a2b8,
  gray-50:  #f9fafb,
  gray-100: #f3f4f6,
  gray-400: #9ca3af,
  gray-700: #374151,
  gray-900: #111827,
);

$ds-spacing-base: 8px;
$ds-radius:      (sm: 4px, md: 8px, lg: 16px, full: 9999px);
$ds-font-size:   (xs: 12px, sm: 13px, base: 14px, md: 16px, lg: 18px, xl: 20px, 2xl: 24px, 3xl: 30px);
$ds-font-weight: (normal: 400, medium: 500, semibold: 600, bold: 700);
$ds-line-height: (tight: 1.25, base: 1.5, relaxed: 1.75);
$ds-shadow: (
  sm: 0 1px 2px rgba(0, 0, 0, 0.06),
  md: 0 4px 10px rgba(0, 0, 0, 0.08),
  lg: 0 10px 24px rgba(0, 0, 0, 0.12),
);
$ds-z-index:     (dropdown: 100, sticky: 200, modal: 1000, toast: 1100);
$ds-duration:    (fast: 0.12s, base: 0.2s, slow: 0.4s);
$ds-breakpoints: (sm: 600px, md: 900px, lg: 1200px);

// ---------- 2. 主题：Sass Map 输出为 CSS 变量 ----------
$ds-themes: (
  light: (bg: #ffffff, text: #1a1a1a, surface: #f5f6f8, border: #e5e7eb),
  dark:  (bg: #111418, text: #e8eaed, surface: #1c1f24, border: #2a2e35),
);

.sass-demo {
  @each $key, $val in map.get($ds-themes, light) {
    --ds-bg-#{$key}: #{$val};
  }
  &.dark {
    @each $key, $val in map.get($ds-themes, dark) {
      --ds-bg-#{$key}: #{$val};
    }
  }
}

.sass-demo .ds-surface {
  background: var(--ds-bg-surface);
  color: var(--ds-bg-text);
  border: 1px solid var(--ds-bg-border);
  padding: $ds-spacing-base * 2;
  border-radius: map.get($ds-radius, md);
}

// ---------- 3. 间距工具类 ----------
@each $i in 0, 1, 2, 3, 4, 5, 6 {
  $size: $ds-spacing-base * $i;
  .sass-demo .mt-#{$i} { margin-top: $size; }
  .sass-demo .mb-#{$i} { margin-bottom: $size; }
  .sass-demo .ml-#{$i} { margin-left: $size; }
  .sass-demo .mr-#{$i} { margin-right: $size; }
  .sass-demo .mx-#{$i} { margin-left: $size; margin-right: $size; }
  .sass-demo .my-#{$i} { margin-top: $size; margin-bottom: $size; }
  .sass-demo .pt-#{$i} { padding-top: $size; }
  .sass-demo .pb-#{$i} { padding-bottom: $size; }
  .sass-demo .px-#{$i} { padding-left: $size; padding-right: $size; }
  .sass-demo .py-#{$i} { padding-top: $size; padding-bottom: $size; }
}

// ---------- 4. 文本工具类 ----------
@each $name, $size in $ds-font-size {
  .sass-demo .text-#{$name} { font-size: $size; }
}
@each $name, $weight in $ds-font-weight {
  .sass-demo .font-#{$name} { font-weight: $weight; }
}
.sass-demo .text-center { text-align: center; }
.sass-demo .text-left   { text-align: left; }
.sass-demo .text-right  { text-align: right; }
@each $name, $color in $ds-colors {
  .sass-demo .text-c-#{$name} { color: $color; }
  .sass-demo .bg-#{$name}      { background: $color; }
}

// ---------- 5. flex 工具类 ----------
.sass-demo .flex          { display: flex; }
.sass-demo .inline-flex   { display: inline-flex; }
.sass-demo .flex-col      { flex-direction: column; }
.sass-demo .items-center    { align-items: center; }
.sass-demo .items-start     { align-items: flex-start; }
.sass-demo .items-end       { align-items: flex-end; }
.sass-demo .justify-center  { justify-content: center; }
.sass-demo .justify-between { justify-content: space-between; }
.sass-demo .justify-end     { justify-content: flex-end; }
.sass-demo .gap-2 { gap: 8px; }
.sass-demo .gap-4 { gap: 16px; }

// ---------- 6. 圆角 / 阴影工具类 ----------
@each $name, $r in $ds-radius {
  .sass-demo .radius-#{$name} { border-radius: $r; }
}
@each $name, $sh in $ds-shadow {
  .sass-demo .shadow-#{$name} { box-shadow: $sh; }
}

// ---------- 7. 排版系统：标题层级 ----------
.sass-demo .h1, .sass-demo .h2, .sass-demo .h3, .sass-demo .h4 {
  margin: 0 0 8px;
  font-weight: map.get($ds-font-weight, bold);
  line-height: map.get($ds-line-height, tight);
  color: var(--ds-bg-text);
}
.sass-demo .h1 { font-size: map.get($ds-font-size, 3xl); }
.sass-demo .h2 { font-size: map.get($ds-font-size, 2xl); }
.sass-demo .h3 { font-size: map.get($ds-font-size, xl); }
.sass-demo .h4 { font-size: map.get($ds-font-size, lg); }

// ---------- 8. 组件库：badge ----------
@each $name, $color in $ds-colors {
  .sass-demo .badge--#{$name} {
    display: inline-block;
    padding: 2px 8px;
    font-size: map.get($ds-font-size, xs);
    font-weight: map.get($ds-font-weight, medium);
    border-radius: map.get($ds-radius, full);
    background: color.adjust($color, $lightness: 35%);
    color: color.adjust($color, $lightness: -25%);
  }
}

// ---------- 9. 组件库：alert ----------
@each $name, $color in $ds-colors {
  .sass-demo .alert--#{$name} {
    padding: 10px 14px;
    border-radius: map.get($ds-radius, md);
    border-left: 4px solid $color;
    background: color.adjust($color, $lightness: 38%);
    color: color.adjust($color, $lightness: -30%);
    font-size: map.get($ds-font-size, sm);
    margin-bottom: 8px;
  }
}

// ---------- 10. 组件库：tag ----------
.sass-demo .tag {
  display: inline-block;
  padding: 4px 10px;
  font-size: map.get($ds-font-size, xs);
  background: map.get($ds-colors, gray-100);
  color: map.get($ds-colors, gray-700);
  border-radius: map.get($ds-radius, sm);
  margin-right: 4px;
}

// ---------- 11. 组件库：avatar ----------
.sass-demo .avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: map.get($ds-colors, primary);
  color: #fff;
  font-weight: map.get($ds-font-weight, bold);
  overflow: hidden;
  &--sm { width: 28px; height: 28px; font-size: 12px; }
  &--lg { width: 56px; height: 56px; font-size: 20px; }
  img { width: 100%; height: 100%; object-fit: cover; }
}

// ---------- 12. 组件库：tooltip ----------
.sass-demo .tooltip {
  position: relative;
  display: inline-block;
  &::after {
    content: attr(data-tip);
    position: absolute;
    bottom: 130%;
    left: 50%;
    transform: translateX(-50%);
    background: map.get($ds-colors, gray-900);
    color: #fff;
    padding: 4px 8px;
    font-size: map.get($ds-font-size, xs);
    border-radius: map.get($ds-radius, sm);
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity map.get($ds-duration, base);
  }
  &:hover::after { opacity: 1; }
}

// ---------- 13. 响应式断点 mixin ----------
@mixin ds-up($bp) {
  @media (min-width: map.get($ds-breakpoints, $bp)) {
    @content;
  }
}

.sass-demo .ds-grid {
  display: grid;
  gap: $ds-spacing-base * 2;
  grid-template-columns: 1fr;
  @include ds-up(sm) { grid-template-columns: repeat(2, 1fr); }
  @include ds-up(md) { grid-template-columns: repeat(3, 1fr); }
  @include ds-up(lg) { grid-template-columns: repeat(4, 1fr); }
}

// ---------- 14. 容器 ----------
.sass-demo .ds-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $ds-spacing-base * 2;
}
`,
  },
];
