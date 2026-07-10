// =============================================================
// Sass 交互式教程 - 第 2 批章节（核心功能）
// -------------------------------------------------------------
// 本文件包含以下章节（group 统一为「核心功能」）：
//   1. sass-mixins     — 混入 Mixins       (icon: 🧩)
//   2. sass-functions  — 内置函数          (icon: ƒ)
//   3. sass-control    — 控制指令          (icon: 🔀)
//   4. sass-extend     — 继承 @extend      (icon: 🔗)
//
// 约定说明：
//   - content 字段为 Markdown 讲解，文字量大、demo 多，所有讲解用简体中文
//   - code 字段为纯 SCSS 代码，由服务端 sass 包编译为 CSS 后在 iframe 预览
//   - 预览模板会自动追加通用 demo HTML（含 .sass-demo 容器及 .btn / .card /
//     .list / .grid / .form 等元素），SCSS 通过类名/选择器去样式化它们
//   - code 中 Sass 插值统一使用 #{} 语法，不出现 ${ 字符序列
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：混入 Mixins
  // =========================================================
  {
    id: "sass-mixins",
    group: "核心功能",
    icon: "🧩",
    title: "混入 Mixins",
    content: `# 混入 Mixins

混入（Mixin）是 Sass 中**最强大、最常用**的代码复用机制之一。如果说变量让你复用「单个值」，那么混入让你复用「一整段样式声明」。你可以把混入理解为一个**样式片段的函数**：定义一次，到处调用，还可以接收参数、动态生成不同的样式。

本章将从最基础的定义与调用讲起，逐步深入到参数体系、\`@content\` 内容块、实战混入集合，最后讨论混入与函数、继承的关系与取舍。读完本章，你应当能够熟练地用混入消除项目里 80% 的重复样式代码。

---

## 一、为什么需要混入

### 1.1 重复代码的痛点

在实际项目里，下面这种「几乎一样但又有点不一样」的代码随处可见：

\`\`\`scss
.btn-primary {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 6px;
  background: #3498db;
  color: #fff;
  transition: background 0.2s;
}
.btn-success {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 6px;
  background: #27ae60;
  color: #fff;
  transition: background 0.2s;
}
.btn-danger {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 6px;
  background: #e74c3c;
  color: #fff;
  transition: background 0.2s;
}
\`\`\`

上面三段代码只有 \`background\` 不同，其余 5 行声明完全重复。如果某天设计师说「按钮圆角改成 8px」，你需要改 3 个地方；如果按钮有 20 种颜色，你要改 20 个地方。这就是**重复代码带来的维护地狱**。

### 1.2 混入如何解决

混入让你把「公共部分」抽象成一个可命名、可传参的片段：

\`\`\`scss
@mixin button-base($bg) {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 6px;
  background: $bg;
  color: #fff;
  transition: background 0.2s;
}

.btn-primary  { @include button-base(#3498db); }
.btn-success  { @include button-base(#27ae60); }
.btn-danger   { @include button-base(#e74c3c); }
\`\`\`

现在圆角改 8px 只需要改混入里的一行。**变化点被参数化，不变点被封装**——这正是混入的核心价值。

### 1.3 混入 vs 变量 vs 继承

| 复用方式 | 复用什么 | 能否带参数 | 典型场景 |
| --- | --- | --- | --- |
| 变量 \`$var\` | 单个值 | 否 | 颜色、尺寸、字体 |
| 混入 \`@mixin\` | 一段声明 | 是 | 按钮样式、清除浮动、媒体查询 |
| 继承 \`@extend\` | 一组选择器的规则 | 否 | 共享基础样式、占位符 |
| 函数 \`@function\` | 计算并返回一个值 | 是 | 颜色运算、尺寸换算 |

理解这张表，你就能在合适的场景选择合适的工具。

---

## 二、定义与调用：@mixin 与 @include

### 2.1 最简单的混入

定义混入用 \`@mixin 名称 { ... }\`，调用用 \`@include 名称;\`：

\`\`\`scss
// 定义：把一段居中布局打包
@mixin center-flex {
  display: flex;
  align-items: center;
  justify-content: center;
}

// 调用
.hero {
  @include center-flex;
  height: 200px;
  background: #eee;
}
\`\`\`

编译结果：

\`\`\`css
.hero {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: #eee;
}
\`\`\`

可以看到，\`@include\` 就像「把混入的内容原样粘贴到这里」。混入本身**不会输出任何 CSS**，只有被 \`@include\` 时才会生成样式。

### 2.2 混入命名规范

混入名可以使用连字符（\`kebab-case\`）或下划线（\`snake_case\`），Sass 把 \`-\` 和 \`_\` 视为等价（\`center-flex\` 和 \`center_flex\` 是同一个混入）。社区惯例推荐用连字符：

\`\`\`scss
@mixin clearfix { ... }      // ✅ 推荐
@mixin clear-fix { ... }     // 与上面等价，但不推荐混用
@mixin clearFix { ... }      // 驼峰也可，但与社区风格不一致
\`\`\`

> 提示：\`-\` 与 \`_\` 等价是历史遗留特性，为了兼容早期 Sass 用户。新代码请保持一种风格，不要故意利用这个特性制造歧义。

### 2.3 混入可以包含任何内容

混入体内不仅能写属性声明，还能写嵌套规则、\`&\` 父选择器、控制指令、甚至 \`@media\`：

\`\`\`scss
@mixin hover-darken($bg) {
  background: $bg;
  transition: background 0.2s;

  &:hover {
    background: darken($bg, 10%);
  }

  &:active {
    transform: translateY(1px);
  }
}

.btn {
  @include hover-darken(#3498db);
}
\`\`\`

这种「带交互状态的混入」在实际项目中极其常见。

---

## 三、参数体系

参数是混入区别于「简单复制粘贴」的关键。Sass 的参数系统非常灵活，下面逐一讲解。

### 3.1 位置参数

最普通的参数，按位置传递：

\`\`\`scss
@mixin size($width, $height) {
  width: $width;
  height: $height;
}

.box    { @include size(100px, 50px); }   // width:100px; height:50px;
.square { @include size(80px, 80px); }
\`\`\`

调用时参数个数必须与定义一致，否则会报错。

### 3.2 默认参数

可以给参数设定默认值，调用时若不传则使用默认值：

\`\`\`scss
@mixin size($width, $height: $width) {
  width: $width;
  height: $height;
}

.a { @include size(100px); }       // 只传一个，height 默认等于 width → 100x100
.b { @include size(100px, 50px); } // 100x50
\`\`\`

上面的 \`$height: $width\` 是一个常用技巧：**默认参数可以引用前面的参数**。这样 \`size(100px)\` 就能生成正方形，非常优雅。

### 3.3 关键字参数

调用时可以按名称传参，顺序无所谓：

\`\`\`scss
@mixin button-base($bg, $color: #fff, $radius: 6px, $padding: 10px 20px) {
  background: $bg;
  color: $color;
  border-radius: $radius;
  padding: $padding;
}

// 只想改圆角，其他用默认
.btn-pill { @include button-base(#3498db, $radius: 20px); }

// 只想改内边距
.btn-wide { @include button-base(#3498db, $padding: 8px 32px); }
\`\`\`

关键字参数在参数较多时尤其有用——你不必记住第几个参数是什么，可读性也更好。

### 3.4 参数类型

Sass 是动态类型，参数可以是任意类型的值：数字、字符串、颜色、布尔、列表、Map、null。

\`\`\`scss
@mixin fancy-border($width: 1px, $style: solid, $color: #333) {
  border: $width $style $color;
}

@mixin debug($value) {
  content: inspect($value) + " (类型: " + type-of($value) + ")";
}

.a { @include fancy-border(2px, dashed, red); }
.b { @include debug(42); }              // 数字
.c { @include debug("hello"); }         // 字符串
.d { @include debug(#fff); }            // 颜色
.e { @include debug(true); }            // 布尔
.f { @include debug((a: 1, b: 2)); }    // Map
\`\`\`

> 注意：\`inspect()\` 函数可以把任意值转成可读字符串，常用于调试混入参数。

### 3.5 参数列表 arglist（可变参数）

当不确定要传多少个参数时，用 \`...\` 声明可变参数：

\`\`\`scss
@mixin box-shadow($shadows...) {
  box-shadow: $shadows;
}

.a { @include box-shadow(0 1px 2px rgba(0,0,0,.1)); }
.b { @include box-shadow(0 1px 2px rgba(0,0,0,.1), 0 4px 8px rgba(0,0,0,.15)); }
.c { @include box-shadow(0 1px 2px rgba(0,0,0,.1), 0 4px 8px rgba(0,0,0,.15), 0 10px 20px rgba(0,0,0,.2)); }
\`\`\`

\`$shadows\` 在混入内部是一个 **list（列表）**，包含所有传入的值。这正是 \`box-shadow\`、\`transition\`、\`background-image\` 等可叠加属性的理想写法。

#### 反向展开：把列表展开成多个参数

\`...\` 还可以反向使用——把一个列表展开成多个参数：

\`\`\`scss
@mixin paint($c1, $c2, $c3) {
  color: $c1;
  background: $c2;
  border-color: $c3;
}

$colors: red green blue;
.box { @include paint($colors...); }   // 等价于 paint(red, green, blue)
\`\`\`

这个技巧在「把 Map 或列表的值批量传给混入」时非常方便。

### 3.6 布尔参数控制开关

布尔参数常用来当「开关」，控制混入走不同分支：

\`\`\`scss
@mixin card($elevated: false) {
  background: #fff;
  border-radius: 8px;
  padding: 16px;

  @if $elevated {
    box-shadow: 0 4px 12px rgba(0,0,0,.15);
  } @else {
    border: 1px solid #eee;
    box-shadow: 0 1px 2px rgba(0,0,0,.06);
  }
}

.card-flat  { @include card; }                  // 默认扁平
.card-up    { @include card($elevated: true); } // 抬升阴影
\`\`\`

布尔开关让一个混入覆盖多种变体，避免拆分出无数个小混入。

---

## 四、@content 内容块

\`@content\` 让调用者向混入内部「塞入」一段自定义样式，这是混入最灵活的特性。

### 4.1 基本用法

\`\`\`scss
@mixin breakpoint($width) {
  @media (min-width: $width) {
    @content;   // 调用者传入的内容会被插入到这里
  }
}

.sidebar {
  width: 100%;

  @include breakpoint(768px) {
    width: 250px;
    float: left;
  };
}
\`\`\`

编译结果：

\`\`\`css
.sidebar {
  width: 100%;
}
@media (min-width: 768px) {
  .sidebar {
    width: 250px;
    float: left;
  }
}
\`\`\`

\`@content\` 让混入可以充当「包装器」：混入负责打开 \`@media\` / \`@supports\` / 嵌套上下文，调用者负责填充具体样式。这是构建响应式框架的标准手法。

### 4.2 @content 与参数配合

混入可以同时有参数和 \`@content\`：

\`\`\`scss
@mixin hover-lift($distance: 3px) {
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-$distance);
    @content;
  }
}

.card {
  @include hover-lift(5px) {
    box-shadow: 0 10px 20px rgba(0,0,0,.2);
  };
}
\`\`\`

这里 \`$distance\` 控制抬起高度，\`@content\` 让调用者额外定制 hover 时的阴影。

### 4.3 @content 的参数（高级）

Dart Sass 支持 \`@content\` 传递参数（Sass 3.3+）：

\`\`\`scss
@mixin each-breakpoint($breakpoints) {
  @each $name, $value in $breakpoints {
    @media (min-width: $value) {
      @content($name);
    }
  }
}

@include each-breakpoint((small: 576px, medium: 768px, large: 992px)) using ($name) {
  .col-#{$name} {
    content: "I am #{$name}";
  }
}
\`\`\`

\`using ($name)\` 接收混入通过 \`@content($name)\` 传出的值。这个特性用得较少，但在生成复杂响应式栅格时很有用。

### 4.4 @content 的常见误区

- **\`@content\` 只能出现一次**：一个混入里写多个 \`@content\` 不会报错，但内容会被重复插入多次，通常不是你想要的。
- **\`@content\` 内的作用域**：传入的内容块在**定义它的位置**求值，而不是在混入内部。这意味着内容块里能访问调用处的作用域变量，但访问不到混入内部的局部变量。
- **没有 \`@content\` 的混入被传入内容**：会报错。反之，定义了 \`@content\` 但调用时没传内容，\`@content\` 处什么都不会输出。

---

## 五、混入 vs 函数

初学者常混淆混入与函数。区别其实很简单：

| 特性 | \`@mixin\` | \`@function\` |
| --- | --- | --- |
| 输出 | 一段 CSS 声明 | 一个值 |
| 调用方式 | \`@include name()\` | \`name()\`（用在表达式里） |
| 副作用 | 生成样式 | 无，纯计算 |
| 典型用途 | 按钮样式、清除浮动 | 颜色运算、像素转 rem |

**口诀**：要输出样式 → 混入；要算出一个值 → 函数。

\`\`\`scss
// 函数：算出一个值
@function rem($px) {
  @return ($px / 16px) * 1rem;
}

// 混入：输出一段样式
@mixin font-size($px) {
  font-size: rem($px);   // 调用函数
  line-height: $px * 1.5;
}

h1 { @include font-size(32px); }   // font-size: 2rem; line-height: 48px;
\`\`\`

两者经常配合使用：函数做计算，混入做输出。

---

## 六、实战混入集合

下面是一组在真实项目里高频使用的混入，建议直接收藏进你的工具库。

### 6.1 清除浮动 clearfix

\`\`\`scss
@mixin clearfix {
  &::after {
    content: "";
    display: table;
    clear: both;
  }
}

.row { @include clearfix; }
\`\`\`

虽然 Flex/Grid 时代浮动用得少了，但兼容老代码时仍需要它。

### 6.2 响应式媒体查询

\`\`\`scss
$breakpoints: (
  small: 576px,
  medium: 768px,
  large: 992px,
  xlarge: 1200px,
);

@mixin respond-to($name) {
  @if map-has-key($breakpoints, $name) {
    @media (min-width: map-get($breakpoints, $name)) {
      @content;
    }
  } @else {
    @warn "未知断点: #{$name}";
  }
}

.grid {
  display: block;

  @include respond-to(medium) {
    display: flex;
  };
}
\`\`\`

\`@warn\` 会在编译时输出警告，帮你发现拼写错误的断点名。

### 6.3 浏览器前缀

\`\`\`scss
@mixin prefix($property, $value, $prefixes: webkit moz ms o) {
  @each $prefix in $prefixes {
    -#{$prefix}-#{$property}: $value;
  }
  #{$property}: $value;
}

.box { @include prefix(transform, rotate(5deg)); }
\`\`\`

现代项目通常用 Autoprefixer 自动处理前缀，但在不能引入构建链的小项目里，这个混入依然实用。

### 6.4 文本隐藏（image replacement）

\`\`\`scss
@mixin hide-text {
  text-indent: 101%;
  white-space: nowrap;
  overflow: hidden;
}

.logo {
  background: url(logo.png);
  @include hide-text;
}
\`\`\`

### 6.5 三角形

用纯 CSS 边框画三角形：

\`\`\`scss
@mixin triangle($direction, $size, $color) {
  width: 0;
  height: 0;

  @if $direction == up {
    border-left: $size solid transparent;
    border-right: $size solid transparent;
    border-bottom: $size solid $color;
  } @else if $direction == down {
    border-left: $size solid transparent;
    border-right: $size solid transparent;
    border-top: $size solid $color;
  } @else if $direction == left {
    border-top: $size solid transparent;
    border-bottom: $size solid transparent;
    border-right: $size solid $color;
  } @else if $direction == right {
    border-top: $size solid transparent;
    border-bottom: $size solid transparent;
    border-left: $size solid $color;
  }
}

.tooltip::after { @include triangle(up, 8px, #333); }
\`\`\`

### 6.6 渐变（带降级）

\`\`\`scss
@mixin linear-gradient($from, $to, $angle: 90deg) {
  background: $from; /* 不支持渐变的浏览器降级为纯色 */
  background: linear-gradient($angle, $from, $to);
}

.banner { @include linear-gradient(#667eea, #764ba2); }
\`\`\`

### 6.7 文本截断

\`\`\`scss
@mixin text-truncate($lines: 1) {
  @if $lines == 1 {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.title    { @include text-truncate; }       // 单行截断
.summary  { @include text-truncate(3); }    // 多行截断
\`\`\`

### 6.8 绝对定位居中

\`\`\`scss
@mixin absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.modal { @include absolute-center; }
\`\`\`

---

## 七、混入的复用性与组织

### 7.1 把混入放进单独文件

大型项目应把混入集中管理，按主题拆分：

\`\`\`scss
// _mixins/_buttons.scss
@mixin button-base { ... }

// _mixins/_layout.scss
@mixin clearfix { ... }
@mixin absolute-center { ... }

// _mixins/_responsive.scss
@mixin respond-to($name) { ... }
\`\`\`

然后在入口文件用 \`@use\` 引入：

\`\`\`scss
@use "mixins/buttons" as *;
@use "mixins/layout" as *;
\`\`\`

\`as *\` 把混入导入当前命名空间，可以直接用 \`@include button-base\`。

### 7.2 混入的粒度

好的混入应该**职责单一、命名清晰**。一个混入做一件事，复杂样式通过组合多个混入实现：

\`\`\`scss
.card {
  @include card-surface;   // 背景与阴影
  @include card-spacing;   // 内外边距
  @include card-hover;     // 悬浮交互
}
\`\`\`

而不是写一个超大混入 \`@include card-everything\`。粒度小的混入复用性更高。

---

## 八、混入与 @extend 的对比

混入和继承都能复用样式，但机制完全不同。

### 8.1 输出方式不同

\`\`\`scss
// 混入：复制声明
@mixin message { padding: 10px; border: 1px solid; }
.error   { @include message; background: #fdd; }
.success { @include message; background: #dfd; }

// 继承：合并选择器
.message { padding: 10px; border: 1px solid; }
.error   { @extend .message; background: #fdd; }
.success { @extend .message; background: #dfd; }
\`\`\`

编译对比：

\`\`\`css
/* 混入：声明被复制到每个选择器 */
.error   { padding: 10px; border: 1px solid; background: #fdd; }
.success { padding: 10px; border: 1px solid; background: #dfd; }

/* 继承：选择器被合并成一组 */
.error, .success { padding: 10px; border: 1px solid; }
.error   { background: #fdd; }
.success { background: #dfd; }
\`\`\`

### 8.2 性能与膨胀

- **混入**：每次 \`@include\` 都复制一份声明。调用 100 次 → 100 份重复声明 → CSS 体积变大。
- **继承**：把选择器合并到一组，声明只输出一次。CSS 更紧凑。

但继承有它的代价：选择器链可能变得很长，且不能跨 \`@media\`。一般来说：

| 场景 | 推荐方式 |
| --- | --- |
| 需要参数化、有变体 | 混入 |
| 静态共享基础样式 | 继承（或占位符） |
| 跨媒体查询复用 | 混入（继承做不到） |
| 关心 CSS 体积 | 继承（但要注意选择器膨胀） |

### 8.3 占位符选择器 %placeholder

占位符是「只用于继承、自身不输出」的特殊选择器，结合了混入的封装性和继承的紧凑性：

\`\`\`scss
%message-base {
  padding: 10px;
  border: 1px solid;
}

.error   { @extend %message-base; background: #fdd; }
.success { @extend %message-base; background: #dfd; }
\`\`\`

\`%message-base\` 本身不会出现在最终 CSS 里，只有继承它的 \`.error\` / \`.success\` 会出现，且声明只输出一次。这是「静态共享样式」的最佳实践。

> 何时用占位符、何时用混入的经验法则：**如果样式需要参数或条件分支，用混入；如果只是固定的一组声明被多处共享，用占位符。**

---

## 九、混入的进阶技巧

### 9.1 用 Map 传一组配置

当参数过多时，用 Map 传参更清晰：

\`\`\`scss
@mixin button($opts) {
  $bg:      map-get($opts, bg, #3498db);
  $color:   map-get($opts, color, #fff);
  $radius:  map-get($opts, radius, 6px);
  $size:    map-get($opts, size, md);

  $padding: if($size == sm, 6px 12px, if($size == lg, 12px 28px, 10px 20px));

  background: $bg;
  color: $color;
  border-radius: $radius;
  padding: $padding;
}

.btn { @include button((bg: #e74c3c, size: lg, radius: 20px)); }
\`\`\`

> 注意：\`map-get\` 在新版 Sass 中第三参可作为默认值（部分版本支持），保险起见用 \`if(map-has-key(...), ..., default)\` 处理。

### 9.2 混入内部用 @if 做参数校验

\`\`\`scss
@mixin font-size($px) {
  @if not unitless($px) and unit($px) != px {
    @error "font-size 只接受 px 或纯数字，收到: #{$px}";
  }
  font-size: $px;
}
\`\`\`

\`@error\` 会在编译时抛出致命错误，强制开发者修正参数。比 \`@warn\` 更严格。

### 9.3 混入递归（慎用）

混入可以递归调用自身，配合 \`@if\` 终止条件：

\`\`\`scss
@mixin nested-padding($level) {
  @if $level > 0 {
    padding-left: $level * 10px;
    @include nested-padding($level - 1);
  }
}
\`\`\`

实际很少用到，了解即可。递归深度过大可能导致编译变慢。

---

## 十、常见陷阱与最佳实践

### 10.1 陷阱：滥用混入导致 CSS 膨胀

\`\`\`scss
// ❌ 反模式：把整个 reset 塞进混入到处 include
@mixin reset {
  margin: 0; padding: 0; box-sizing: border-box;
  /* ... 50 行 reset ... */
}
.a { @include reset; }
.b { @include reset; }
.c { @include reset; }   // 50 行 reset 被复制 3 次！
\`\`\`

reset 这种全局样式应该直接写在通用选择器里，而不是混入。

### 10.2 陷阱：混入参数过多

\`\`\`scss
// ❌ 9 个参数，调用时谁也记不住顺序
@mixin card($bg, $color, $radius, $padding, $shadow, $border, $font, $size, $weight) { ... }
\`\`\`

参数超过 4 个就该考虑用 Map 或拆分混入。

### 10.3 陷阱：混入里写死选择器

\`\`\`scss
// ❌ 混入绑死了 .button，复用性差
@mixin button {
  .button { color: red; }
}
\`\`\`

混入应该输出声明，而不是输出特定选择器。需要选择器上下文时，让调用者提供（通过 \`@content\` 或 \`&\`）。

### 10.4 最佳实践清单

1. **命名表意**：\`clearfix\`、\`absolute-center\` 比 \`util1\`、\`helper\` 好。
2. **给参数默认值**：让最常见的用法零参数就能调用。
3. **优先关键字参数**：参数多时调用处写 \`$radius: 8px\`，可读性强。
4. **职责单一**：一个混入做一件事，复杂样式靠组合。
5. **用 @warn / @error 暴露误用**：让混入在错误调用时尽早报错。
6. **集中管理**：混入放 \`_mixins/\` 目录，用 \`@use\` 引入。
7. **静态共享用占位符**：避免混入复制造成的体积膨胀。

---

## 十一、本章小结

- **混入**用 \`@mixin\` 定义、\`@include\` 调用，是复用「一段声明」的核心机制。
- 参数体系包括**位置参数、默认参数、关键字参数、可变参数（arglist）**，覆盖几乎所有传参需求。
- **\`@content\`** 让调用者向混入内注入自定义样式，是构建媒体查询包装器的关键。
- **混入输出样式，函数返回值**，两者常配合使用。
- 实战混入有 **clearfix、媒体查询、前缀、三角形、渐变、文本截断** 等经典模式。
- 与继承相比，混入**支持参数、可跨媒体查询**，但会复制声明；静态共享样式更适合用**占位符 %placeholder**。
- 滥用混入会造成 **CSS 膨胀**，应控制粒度、给默认值、用 \`@error\` 防误用。

掌握混入后，你已经能消除项目里大部分重复样式。下一章我们将学习 Sass 丰富的**内置函数**，它们能让混入如虎添翼——比如根据一个主色自动派生出一整套配色方案。

下面是本章的可运行示例代码，它把上述混入应用到通用的 demo 元素上（按钮、卡片、列表、网格、表单）。编译后你能在预览区看到这些混入的实际效果。
`,
    code: `// ============================================================
// 第 1 章演示代码：混入 Mixins
// 这里把本章讲到的混入集中应用到 .sass-demo 通用元素上
// ============================================================

// ---------- 1. 基础混入：定义与调用 ----------
@mixin center-flex {
  display: flex;
  align-items: center;
  justify-content: center;
}

// ---------- 2. 带默认参数的混入 ----------
@mixin button-base($bg: #3498db, $color: #ffffff, $radius: 6px) {
  display: inline-block;
  padding: 10px 20px;
  border: 1px solid transparent;
  border-radius: $radius;
  background-color: $bg;
  color: $color;
  font-size: 14px;
  line-height: 1.4;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;

  &:hover {
    background-color: darken($bg, 8%);
  }

  &:active {
    transform: translateY(1px);
  }
}

// ---------- 3. 多参数与默认参数引用前置参数 ----------
@mixin size($width, $height: $width) {
  width: $width;
  height: $height;
}

// ---------- 4. 可变参数 arglist ----------
@mixin box-shadow-multi($shadows...) {
  box-shadow: $shadows;
}

// ---------- 5. 布尔参数开关 ----------
@mixin card-style($elevated: false) {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;

  @if $elevated {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  } @else {
    border: 1px solid #eaeaea;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  }
}

// ---------- 6. @content 内容块：媒体查询包装器 ----------
@mixin breakpoint($width) {
  @media (min-width: $width) {
    @content;
  }
}

@mixin hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    @content;
  }
}

// ---------- 7. 实战混入集合 ----------
@mixin clearfix {
  &::after {
    content: "";
    display: table;
    clear: both;
  }
}

@mixin text-truncate {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

@mixin triangle($direction, $size, $color) {
  width: 0;
  height: 0;

  @if $direction == up {
    border-left: $size solid transparent;
    border-right: $size solid transparent;
    border-bottom: $size solid $color;
  } @else if $direction == down {
    border-left: $size solid transparent;
    border-right: $size solid transparent;
    border-top: $size solid $color;
  } @else if $direction == left {
    border-top: $size solid transparent;
    border-bottom: $size solid transparent;
    border-right: $size solid $color;
  } @else if $direction == right {
    border-top: $size solid transparent;
    border-bottom: $size solid transparent;
    border-left: $size solid $color;
  }
}

@mixin linear-gradient($from, $to, $angle: 90deg) {
  background: $from;
  background: linear-gradient($angle, $from, $to);
}

// ============================================================
// 应用到通用 demo 元素
// ============================================================
.sass-demo {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  padding: 16px;
  background: #f7f8fa;
  color: #333;

  // 按钮系列：演示位置参数 / 关键字参数 / 默认参数
  .btn {
    margin: 4px;
    @include button-base(#3498db);

    &.btn-success {
      @include button-base(#27ae60);
    }

    &.btn-danger {
      @include button-base(#e74c3c, #ffffff, 4px);
    }

    &.btn-warning {
      @include button-base($bg: #f39c12, $radius: 20px);
    }
  }

  // 卡片：演示布尔开关与 @content
  .card {
    margin-bottom: 12px;
    @include card-style($elevated: true);

    &.card-flat {
      @include card-style($elevated: false);
    }

    &.card-hover {
      @include hover-lift {
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      }
    }
  }

  // 列表：演示文本截断混入
  .list {
    @include card-style;
    list-style: none;
    margin: 0 0 12px;
    padding: 8px 12px;

    li {
      padding: 8px 4px;
      border-bottom: 1px solid #f0f0f0;
      @include text-truncate;

      &:last-child {
        border-bottom: none;
      }
    }
  }

  // 网格：演示 size / center-flex / clearfix
  .grid {
    @include clearfix;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 12px;

    .grid-item {
      @include size(110px);
      @include center-flex;
      background: #9b59b6;
      color: #ffffff;
      border-radius: 8px;
      font-weight: bold;
    }
  }

  // 表单：演示 @content 媒体查询包装器实现响应式
  .form {
    @include card-style;

    .form-row {
      margin-bottom: 12px;

      @include breakpoint(768px) {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      label {
        display: block;
        margin-bottom: 4px;
        font-size: 13px;
        color: #555;

        @include breakpoint(768px) {
          width: 100px;
          margin-bottom: 0;
        }
      }

      input,
      textarea,
      select {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;

        &:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        }
      }
    }
  }

  // 三角形演示
  .triangle-up {
    @include triangle(up, 18px, #e67e22);
    margin: 8px 0;
  }

  .triangle-right {
    @include triangle(right, 18px, #1abc9c);
    margin: 8px 0;
  }

  // 渐变演示
  .gradient-box {
    @include linear-gradient(#667eea, #764ba2);
    @include size(100%, 60px);
    border-radius: 6px;
    color: #ffffff;
    @include center-flex;
    margin-top: 12px;
    font-weight: bold;
  }

  // 可变参数演示：多重阴影
  .shadow-box {
    @include card-style;
    @include box-shadow-multi(
      0 2px 4px rgba(0, 0, 0, 0.1),
      0 8px 16px rgba(0, 0, 0, 0.15)
    );
    margin-top: 12px;
  }
}
`,
  },

  // =========================================================
  // 第二章：内置函数
  // =========================================================
  {
    id: "sass-functions",
    group: "核心功能",
    icon: "ƒ",
    title: "内置函数",
    content: `# 内置函数

Sass 内置了一百多个函数，覆盖**颜色、数字、字符串、列表、Map、 introspection（自省）、选择器**七大类。它们是 Sass 的「标准库」——让你在样式表里做计算、转换、查询，而不必依赖外部工具。

本章会按类别把常用函数讲透，每个函数都配示例与编译结果。最后还会教你如何用 \`@function\` 编写自定义函数，把项目里反复出现的计算封装起来。

> 重要提示：Sass 从 1.x 开始推荐用模块化函数（\`@use "sass:color"\` 后用 \`color.adjust()\`），旧的全局函数（\`lighten\`、\`map-get\` 等）仍然可用但会逐步废弃。本章两种写法都会介绍，新代码建议优先用模块化写法。

---

## 一、颜色函数

颜色函数是 Sass 最受欢迎的特性。给定一个主色，你能派生出整套配色方案。

### 1.1 创建颜色：rgb / rgba / hsl / hsla

\`\`\`scss
$red: rgb(255, 0, 0);              // #ff0000
$semi: rgba(255, 0, 0, 0.5);       // 半透明红
$warm: hsl(30, 100%, 50%);         // 橙色（色相30°）
$soft: hsla(200, 50%, 60%, 0.8);   // 柔和蓝
\`\`\`

\`rgb\` / \`rgba\` 接收红绿蓝分量（0-255）和透明度（0-1）；\`hsl\` / \`hsla\` 接收色相（0-360）、饱和度、亮度（百分比）和透明度。

### 1.2 亮度调整：lighten / darken

\`\`\`scss
$base: #3498db;

lighten($base, 20%);   // 变亮 20% → #6abee6
darken($base, 20%);    // 变暗 20% → #1f6e9c
\`\`\`

> 注意：\`lighten\` / \`darken\` 在新版 Sass 中标记为废弃，推荐用 \`color.adjust($c, $lightness: 20%)\` 或 \`color.adjust($c, $lightness: -20%)\`。本章两种写法都会出现，编译均能通过（旧写法会给出警告）。

### 1.3 色相调整：adjust-hue

\`\`\`scss
$base: #3498db;
adjust-hue($base, 60deg);   // 色相 +60° → 偏绿的蓝
adjust-hue($base, -60deg);  // 色相 -60° → 偏紫的蓝
\`\`\`

模块化写法：\`color.adjust($base, $hue: 60deg)\`。

### 1.4 饱和度调整：saturate / desaturate

\`\`\`scss
$base: hsl(200, 30%, 50%);
saturate($base, 30%);     // 饱和度 +30% → 更鲜艳
desaturate($base, 30%);   // 饱和度 -30% → 更灰
\`\`\`

### 1.5 透明度调整：opacify / transparentize

\`\`\`scss
$base: rgba(52, 152, 219, 0.5);
opacify($base, 0.3);          // 不透明度 +0.3 → 0.8
transparentize($base, 0.3);   // 不透明度 -0.3 → 0.2
fade-in($base, 0.3);          // opacify 的别名
fade-out($base, 0.3);         // transparentize 的别名
\`\`\`

### 1.6 颜色混合：mix / scale-color

\`\`\`scss
mix(#ff0000, #0000ff);              // 红蓝各半 → #800080（紫）
mix(#ff0000, #0000ff, 75%);         // 75% 红 + 25% 蓝
\`\`\`

\`scale-color\` 按「当前值的比例」缩放，比 \`adjust\` 的「绝对增减」更符合直觉：

\`\`\`scss
$base: #3498db;
scale-color($base, $lightness: 50%);   // 朝 100% 亮度方向走 50%
scale-color($base, $saturation: -50%); // 朝 0% 饱和度方向走 50%
\`\`\`

### 1.7 获取颜色分量：red / green / blue / hue / saturation / lightness / alpha

\`\`\`scss
$c: rgba(52, 152, 219, 0.8);
red($c);          // 52
green($c);        // 152
blue($c);         // 219
alpha($c);        // 0.8（opacity 是 alpha 的别名）
hue(hsl(200, 50%, 50%));          // 200deg
saturation(hsl(200, 50%, 50%));   // 50%
lightness(hsl(200, 50%, 50%));    // 50%
\`\`\`

### 1.8 IE 兼容：ie-hex-str

把颜色转成 IE 滤镜需要的 \#AARRGGBB 格式：

\`\`\`scss
ie-hex-str(rgba(52, 152, 219, 0.8));   // #803498DB
\`\`\`

### 1.9 模块化新写法：color.adjust / color.change

\`\`\`scss
@use "sass:color";

$base: #3498db;

// adjust：在现有值上增减
color.adjust($base, $lightness: 15%, $saturation: -10%);

// change：直接设置成指定值
color.change($base, $alpha: 0.5);

// scale：按比例缩放
color.scale($base, $lightness: 40%);
\`\`\`

| 函数 | 含义 | 旧等价 |
| --- | --- | --- |
| \`color.adjust($c, $k: v)\` | 增减 | lighten/darken/saturate 等 |
| \`color.change($c, $k: v)\` | 设置 | 无直接等价 |
| \`color.scale($c, $k: v)\` | 比例缩放 | scale-color |

> 区分 \`adjust\` 和 \`change\`：\`adjust($c, $lightness: 20%)\` 是「在当前亮度上加 20%」，\`change($c, $lightness: 20%)\` 是「把亮度设成 20%」。两者完全不同。

### 1.10 实战：自动派生配色方案

\`\`\`scss
@use "sass:color";

$primary: #3498db;

.primary        { background: $primary; }
.primary-light  { background: color.adjust($primary, $lightness: 15%); }
.primary-dark   { background: color.adjust($primary, $lightness: -15%); }
.primary-hover  { background: color.adjust($primary, $saturation: 10%); }
\`\`\`

给定一个主色，自动生成亮色、暗色、悬浮色——这就是设计系统的基础。

---

## 二、数字函数

### 2.1 percentage / round / ceil / floor / abs

\`\`\`scss
percentage(0.5);   // 50%   把 0-1 的小数转百分比
round(2.4);        // 2     四舍五入
round(2.6);        // 3
ceil(2.1);         // 3     向上取整
floor(2.9);        // 2     向下取整
abs(-5);           // 5     绝对值
\`\`\`

### 2.2 min / max

\`\`\`scss
min(10px, 20px, 5px);   // 5px
max(10px, 20px, 5px);   // 20px
\`\`\`

> 注意：CSS 自身也有 \`min()\` / \`max()\` 函数（如 \`width: min(100%, 500px)\`）。在 Sass 里，如果参数都是「无单位或同单位的数字」，Sass 会在编译期求值；如果想保留 CSS 的 \`min()\`，用特殊语法 \`min(100%, 500px)\`（混合单位）会让 Sass 让它原样输出。

### 2.3 random

\`\`\`scss
random(100);   // 1-100 之间的随机整数
random();      // 0-1 之间的随机小数
\`\`\`

\`random\` 在编译期求值，每次编译结果不同。可用于生成随机的占位色或测试数据。

### 2.4 单位相关：unit / unitless / comparable

\`\`\`scss
unit(10px);          // "px"
unit(10);            // ""
unitless(10);        // true
unitless(10px);      // false
comparable(10px, 5em);   // false（px 和 em 不能直接运算）
comparable(10px, 5mm);   // true（都是长度）
\`\`\`

---

## 三、字符串函数

Sass 字符串有两种：**带引号**（\`"abc"\`）和**不带引号**（\`abc\`，CSS 标识符）。

### 3.1 unquote / quote

\`\`\`scss
unquote("hello");   // hello（去掉引号）
quote(hello);       // "hello"（加上引号）
\`\`\`

### 3.2 大小写转换

\`\`\`scss
to-upper-case("abc");   // "ABC"
to-lower-case("ABC");   // "abc"
\`\`\`

### 3.3 长度与索引

\`\`\`scss
str-length("hello");    // 5
str-index("hello", "l"); // 3（从 1 开始计数，找不到返回 null）
\`\`\`

### 3.4 插入与切片

\`\`\`scss
str-insert("Hello", " X", 6);   // "Hello X"（在第 6 位插入）
str-slice("hello", 2, 4);       // "ell"（从第 2 到第 4 个字符）
str-slice("hello", 2);          // "ello"（到末尾）
str-slice("hello", -3);         // "llo"（负数从末尾算）
\`\`\`

### 3.5 实战：用字符串函数生成 BEM 类名

\`\`\`scss
@function bem($block, $element: null, $modifier: null) {
  $name: $block;
  @if $element {
    $name: $name + "__" + $element;
  }
  @if $modifier {
    $name: $name + "--" + $modifier;
  }
  @return $name;
}

.card-title-lg { /* ... */ }
// 等价于 .#{bem(card, title, lg)}
\`\`\`

---

## 四、列表函数

列表是 Sass 中**有序的值集合**，用空格或逗号分隔。\`1px solid red\`、\`a, b, c\` 都是列表。

### 4.1 length / nth / index

\`\`\`scss
$list: 10px 20px 30px;
length($list);   // 3
nth($list, 2);   // 20px（索引从 1 开始！）
index($list, 20px);   // 2（找不到返回 null）
\`\`\`

> **重要**：Sass 列表索引从 **1** 开始，不是 0！这是从 Ruby 继承的约定，初学者最容易踩坑。

### 4.2 join / append / zip

\`\`\`scss
join(1px 2px, 3px 4px);     // 1px 2px 3px 4px
join((1px 2px), (3px 4px), comma);   // 1px, 2px, 3px, 4px（用逗号连接）
append(1px 2px, 3px);       // 1px 2px 3px
zip(1px 2px, solid dashed); // (1px solid) (2px dashed)  配对成多维列表
\`\`\`

\`zip\` 像「拉链」一样把多个列表按位置配对，常用于把属性名和值配对。

### 4.3 list-separator / set-nth

\`\`\`scss
list-separator(1px 2px 3px);   // space（空格分隔）
list-separator(1px, 2px, 3px); // comma
set-nth(10px 20px 30px, 2, 99px);  // 10px 99px 30px（替换第 2 项）
\`\`\`

### 4.4 实战：遍历列表生成边距工具类

\`\`\`scss
$spacers: 0, 4px, 8px, 16px, 24px, 32px;

@each $size in $spacers {
  $i: index($spacers, $size) - 1;
  .mt-#{$i} { margin-top: $size; }
  .mb-#{$i} { margin-bottom: $size; }
}
\`\`\`

输出 \`.mt-0\`、\`.mt-1\` ... \`.mt-5\`，每个对应不同边距。这正是 Bootstrap 这类框架的内部做法。

---

## 五、Map 函数

Map 是键值对集合，类似 JavaScript 的对象。用 \`($key: $value, ...)\` 语法创建。

### 5.1 map-get / map-merge / map-remove

\`\`\`scss
$theme: (
  primary: #3498db,
  success: #27ae60,
  danger: #e74c3c,
);

map-get($theme, primary);     // #3498db
map-get($theme, warning);     // null（不存在返回 null）

$extended: map-merge($theme, (warning: #f39c12));   // 合并/新增
map-remove($theme, danger);   // 删除键，返回新 Map（原 Map 不变）
\`\`\`

### 5.2 map-keys / map-values

\`\`\`scss
map-keys($theme);    // (primary, success, danger)
map-values($theme);  // (#3498db, #27ae60, #e74c3c)
\`\`\`

### 5.3 map-has-key

\`\`\`scss
map-has-key($theme, primary);   // true
map-has-key($theme, warning);   // false
\`\`\`

常用于在取值前判断键是否存在，配合 \`@warn\` 给出友好提示。

### 5.4 模块化新写法

\`\`\`scss
@use "sass:map";

map.get($theme, primary);      // 等价 map-get
map.merge($theme, $new);       // 等价 map-merge
map.remove($theme, danger);    // 等价 map-remove
map.keys($theme);              // 等价 map-keys
map.values($theme);            // 等价 map-values
map.has-key($theme, primary);  // 等价 map-has-key
\`\`\`

### 5.5 实战：用 Map 管理配色并生成类

\`\`\`scss
$colors: (
  primary: #3498db,
  success: #27ae60,
  danger: #e74c3c,
  warning: #f39c12,
);

@each $name, $value in $colors {
  .text-#{$name} { color: $value; }
  .bg-#{$name}   { background-color: $value; }
}
\`\`\`

输出 \`.text-primary\`、\`.bg-success\` 等共 8 个类，全部来自一份 Map 配置。改配色只需改 Map，类自动更新。

---

## 六、introspection 自省函数

「自省」函数用于**在编译期查询值的类型与特征**，是写健壮混入/函数的利器。

### 6.1 type-of

\`\`\`scss
type-of(10px);      // "number"
type-of("hi");      // "string"
type-of(#fff);      // "color"
type-of(true);      // "bool"
type-of((a: 1));    // "map"
type-of(1px 2px);   // "list"
type-of(null);      // "null"
type-of(foo);       // "string"（不带引号的字符串）
\`\`\`

### 6.2 unit / unitless

见数字函数一节。

### 6.3 variable-exists / mixin-exists / function-exists / global-variable-exists

\`\`\`scss
$brand: #333;

variable-exists("brand");        // true（当前作用域是否有 $brand）
global-variable-exists("brand"); // true（全局作用域）
mixin-exists("clearfix");        // 某混入是否已定义
function-exists("rem");          // 某函数是否已定义
\`\`\`

这些函数让混入能「检测环境」，做条件式行为，比如只有当某个函数存在时才调用它。

### 6.4 feature-exists / content-exists

\`\`\`scss
feature-exists("at-error");    // true（当前 Sass 是否支持 @error）
content-exists();              // 调用 @content 的混入里，判断调用者是否传了内容块
\`\`\`

\`content-exists\` 在带 \`@content\` 的混入里很有用——可以决定是否输出某些包装结构。

### 6.5 inspect / keywords

\`\`\`scss
inspect((a: 1, b: 2));   // '(a: 1, b: 2)' 把任意值转成可读字符串
\`\`\`

\`keywords($args)\` 把可变参数 \`$args...\` 里关键字参数提取成 Map，用于混入内部解析关键字参数。

---

## 七、选择器函数

选择器函数操作选择器字符串，返回新选择器。需要 \`@use "sass:selector"\` 或全局函数。

### 7.1 selector-nest / selector-append

\`\`\`scss
selector-nest(".card", "&:hover");   // '.card:hover'（嵌套，& 指代父级）
selector-append(".card", ":hover");  // '.card:hover'（直接拼接，不带空格）
\`\`\`

\`nest\` 会在选择器间加后代空格（除非用 \`&\`），\`append\` 直接拼接。两者都能生成 \`@extend\` 友好的选择器。

### 7.2 selector-replace / selector-unify / is-superselector

\`\`\`scss
selector-replace(".a .b", ".b", ".c");   // '.a .c'（把 .b 替换成 .c）
selector-unify(".a", ".b");              // '.a.b'（合并成同时匹配两者）
is-superselector(".a", ".a .b");        // true（.a 是否能匹配 .a .b 能匹配的所有元素）
\`\`\`

这些函数多用于框架开发，普通项目较少直接使用，但理解它们有助于掌握 \`@extend\` 的行为。

### 7.3 simple-selectors / parse-selector

\`\`\`scss
simple-selectors("a.btn:hover");   // (a, .btn, :hover) 拆成简单选择器
\`\`\`

---

## 八、自定义函数 @function

当内置函数不够用时，可以写自己的函数。函数用 \`@function\` 定义，用 \`@return\` 返回值。

### 8.1 基本语法

\`\`\`scss
@function px-to-rem($px, $base: 16px) {
  @return ($px / $base) * 1rem;
}

h1 { font-size: px-to-rem(32px); }   // 2rem
h2 { font-size: px-to-rem(24px); }   // 1.5rem
\`\`\`

### 8.2 带条件与循环的函数

\`\`\`scss
@function clamp-value($value, $min, $max) {
  @if $value < $min { @return $min; }
  @if $value > $max { @return $max; }
  @return $value;
}

.a { width: clamp-value(150px, 100px, 200px); }   // 150px
.b { width: clamp-value(50px, 100px, 200px); }    // 100px
\`\`\`

### 8.3 递归函数

\`\`\`scss
@function factorial($n) {
  @if $n <= 1 { @return 1; }
  @return $n * factorial($n - 1);
}

$content: factorial(5);   // 120
\`\`\`

> 提示：函数用于「计算」，不要在函数里输出 CSS（那是混入的活）。函数必须 \`@return\` 一个值。

### 8.4 实战：根据亮度自动选文字颜色

\`\`\`scss
@use "sass:color";

@function text-color-for($bg) {
  @if lightness($bg) > 50% {
    @return #000;   // 背景亮 → 用黑字
  } @else {
    @return #fff;   // 背景暗 → 用白字
  }
}

.btn-primary  { background: #3498db; color: text-color-for(#3498db); }
.btn-warning  { background: #f39c12; color: text-color-for(#f39c12); }
\`\`\`

这是一个非常实用的函数——给定任意背景色，自动返回可读性最好的文字色。

### 8.5 实战：颜色加深至可读

\`\`\`scss
@use "sass:color";

@function readable-darken($color, $target-lightness: 30%) {
  $current: lightness($color);
  $diff: $target-lightness - $current;
  @if $diff < 0 {
    @return color.adjust($color, $lightness: $diff);
  } @else {
    @return $color;   // 已经够暗，不再处理
  }
}
\`\`\`

---

## 九、函数使用注意事项

### 9.1 区分编译期与运行期

Sass 函数在**编译期**执行，结果写死在 CSS 里。\`random()\` 每次编译都不同，但编译完就固定了——浏览器里不会变化。要运行期动态，得用 CSS 自定义属性 + JS。

### 9.2 不要过度计算

复杂的递归或大量循环会拖慢编译。如果一个函数被调用上百次、每次内部又循环，编译时间会明显变长。

### 9.3 优先用内置函数

内置函数用 Dart 实现，比自定义函数快得多。能用 \`color.adjust\` 就别自己写 HSL 转换。

### 9.4 函数要纯

好的函数是「纯函数」——相同输入永远返回相同输出，没有副作用。不要在函数里修改全局变量或输出 CSS。

---

## 十、本章小结

- **颜色函数**是 Sass 最强特性：\`lighten/darken/adjust-hue/saturate/desaturate/opacify/transparentize/mix/scale-color\`，新写法统一为 \`color.adjust/change/scale\`。
- **数字函数**：\`percentage/round/ceil/floor/abs/min/max/random\`，配合 \`unit/unitless\` 处理单位。
- **字符串函数**：\`unquote/quote/to-upper-case/to-lower-case/str-length/str-insert/str-index/str-slice\`。
- **列表函数**：\`length/nth/join/append/zip/index/set-nth/list-separator\`，**索引从 1 开始**。
- **Map 函数**：\`map-get/map-merge/map-remove/map-keys/map-values/map-has-key\`，是管理配置的核心。
- **自省函数**：\`type-of/unit/unitless/variable-exists/mixin-exists/function-exists/content-exists\`，用于写健壮的混入与函数。
- **选择器函数**：\`selector-nest/selector-replace/selector-unify\`，多用于框架。
- **自定义 \`@function\`** 用于封装计算，\`@return\` 返回值，与混入（输出样式）分工明确。

---

## 九、函数编写规范与调试技巧

写函数不只是"能跑"，还要可读、可维护、可测试。下面是一套来自真实项目的实战规范。

### 命名规范

- 函数名用 **小写连字符**（kebab-case）：\`strip-unit\`、\`to-rem\`、\`color-yiq\`。
- 与混入区分：函数名倾向于"名词/形容词"（返回值），混入名倾向于"动词"（动作）。例如 \`font-size()\` 是函数，\`set-font-size()\` 是混入。
- 前缀避免与内置函数冲突：不要直接叫 \`lighten\`、\`darken\`，会被覆盖。可以加项目前缀，如 \`my-lighten\`、\`brand-tint\`。
- 布尔判断函数用 \`is-\` / \`has-\` 前缀：\`is-dark(#333)\`、\`has-unit(16px)\`，语义更清晰。

### 参数设计

- **必选参数在前，可选参数在后**，可选参数给默认值：

\`\`\`scss
@function clamp-value($value, $min: 0, $max: 100) {
  @return math.min($max, math.max($min, $value));
}
\`\`\`

- **不要超过 4 个位置参数**。如果参数太多，说明该用 Map 了：

\`\`\`scss
// 不好：6 个位置参数，调用时容易写错顺序
@function shadow($x, $y, $blur, $spread, $color, $inset) { ... }

// 好：用 Map，键名明确
@function shadow($opts) {
  $x: map.get($opts, x) or 0;
  $y: map.get($opts, y) or 0;
  $blur: map.get($opts, blur) or 0;
  // ...
}
\`\`\`

- 用 \`@error\` 校验参数类型，**fail fast**（尽早失败）：

\`\`\`scss
@function rem($px) {
  @if type-of($px) != "number" {
    @error "rem() 需要数字，收到 #{type-of($px)}: #{$px}";
  }
  @if not unitless($px) and unit($px) != "px" {
    @error "rem() 需要 px 或无单位数字，收到单位 #{unit($px)}";
  }
  @return math.div($px, 16px) * 1rem;
}
\`\`\`

这样调用 \`rem("16px")\` 或 \`rem(16em)\` 时会立刻报错并指出原因，而不是产出错误的 CSS。

### 调试三件套：@debug / @warn / @error

| 指令 | 行为 | 适用场景 |
| --- | --- | --- |
| \`@debug\` | 输出到控制台，继续编译 | 查看中间值、变量内容 |
| \`@warn\` | 输出警告，继续编译 | 弃用提示、非致命问题 |
| \`@error\` | 输出错误，**停止编译** | 参数校验、不可恢复错误 |

\`\`\`scss
@function rem($px) {
  @debug "rem 收到: #{$px} (#{type-of($px)})";
  @return math.div($px, 16px) * 1rem;
}
\`\`\`

编译时会输出 \`rem 收到: 32 (number)\`，帮你确认参数实际值。调试完删掉 \`@debug\` 即可。

### 纯函数原则

Sass 函数应该是**纯函数**——同样的输入永远得到同样的输出，不产生副作用。这意味着：

- ❌ 不要在函数里 \`@include\` 混入（语法也不允许）。
- ❌ 不要在函数里 \`@import\` 或修改全局变量（用 \`!global\` 改全局是反模式）。
- ✅ 只做计算，\`@return\` 返回值。

纯函数的好处是**可预测、可测试、可缓存**。你可以在任何地方调用，不用担心改变全局状态。这也是 Sass 函数与 JavaScript 函数的核心区别——Sass 函数在编译期运行，更应该保持纯粹。

---

## 十、函数 vs 混入：如何选择

这是新手最常困惑的问题。两者都能"复用代码"，但职责完全不同。

| 维度 | \`@function\` | \`@mixin\` |
| --- | --- | --- |
| 返回 | 一个**值** | 一段 **CSS 声明/规则** |
| 调用 | \`$val: my-fn()\`，用在属性值里 | \`@include my-mixin\`，用在规则块里 |
| 用途 | 计算、转换、判断、查询 | 输出样式、批量生成、媒体查询 |
| 例子 | \`rem(16)\` → \`1rem\` | \`@include clearfix\` 输出 \`::after\` |
| 能否参与运算 | ✅ 可以 \`rem(16) + 8px\` | ❌ 不能 |
| 能否输出多条声明 | ❌ 只返回单值 | ✅ 可以输出任意多行 |

**口诀**：要"值"用函数，要"样式"用混入。

\`\`\`scss
// 函数：返回值
@function spacing($level) {
  @return $level * 4px;
}
.card { padding: spacing(2); }  // padding: 8px;
.hero { margin: spacing(4) auto; }  // margin: 16px auto;

// 混入：输出样式
@mixin card-padding($level) {
  padding: $level * 4px;
  box-sizing: border-box;
}
.card { @include card-padding(2); }
\`\`\`

两者都能达到类似效果，但函数更灵活（可以参与运算 \`spacing(2) + spacing(1)\`），混入更适合输出复杂的多行声明和嵌套规则。**实际项目中两者配合使用**：函数负责算，混入负责输出。

---

## 十一、综合案例：响应式流式字体函数

把本章学的数学函数、单位处理、Map 结合起来，写一个**响应式流式字体**函数。它在最小屏和最大屏之间线性插值字号，比纯媒体查询更平滑。

\`\`\`scss
@use "sass:math";

// 流式字号：在 min-vw 到 max-vw 之间，字号从 min-fs 到 max-fs 线性变化
// 用法：font-size: fluid-type(320px, 1200px, 16px, 24px);
@function fluid-type($min-vw, $max-vw, $min-fs, $max-fs) {
  // 剥离单位，便于计算
  $v1: math.div($min-fs, 1px);   // 16
  $v2: math.div($max-fs, 1px);   // 24
  $w1: math.div($min-vw, 1px);   // 320
  $w2: math.div($max-vw, 1px);   // 1200
  // 斜率 = (v2 - v1) / (w2 - w1)
  $slope: math.div($v2 - $v1, $w2 - $w1);
  // 截距 = v1 - slope * w1
  $intercept: $v1 - $slope * $w1;
  // 用 calc 实现运行时插值（浏览器根据视口宽度实时计算）
  @return calc(#{$slope * 1px} * 100vw + #{$intercept * 1px});
}

h1 {
  font-size: fluid-type(320px, 1200px, 24px, 48px);
  // 输出: calc(3px * 100vw + 14.4px)
  // 320px 屏 → 24px，1200px 屏 → 48px，中间线性变化
}
\`\`\`

这个函数综合运用了 \`math.div\`（安全除法）、单位剥离、\`calc\` 拼接，是真实项目里常用的工具函数。配合 \`@include\` 一个混入再加上 \`@media\` 钳制上下限，就能做出非常顺滑的响应式排版。

### 函数章节总结

- 函数是 Sass 的"计算单元"，**只返回值**，不输出样式。
- 内置函数覆盖颜色、数字、字符串、列表、Map、自省、选择器七大类，新版本统一用模块化调用（\`color.adjust\`、\`map.get\`、\`math.div\`）。
- 写函数要遵循命名规范、参数设计、纯函数原则，用 \`@debug/@warn/@error\` 三件套调试。
- 函数 vs 混入：要值用函数，要样式用混入，两者配合使用。

下面是本章可运行示例，把上述函数集中应用到 demo 元素上。你能看到颜色派生、Map 驱动的配色、函数计算的尺寸等效果。
`,
    code: `// ============================================================
// 第 2 章演示代码：内置函数
// 演示颜色 / 数字 / 字符串 / 列表 / Map / 自省 / 自定义函数
// ============================================================

@use "sass:color";
@use "sass:map";

// ---------- 自定义函数 ----------
// 像素转 rem
@function rem($px, $base: 16px) {
  @return ($px / $base) * 1rem;
}

// 根据背景亮度自动选文字颜色
@function text-on($bg) {
  @if lightness($bg) > 55% {
    @return #1a1a1a;
  } @else {
    @return #ffffff;
  }
}

// 把列表转成逗号分隔字符串
@function join-by-comma($list) {
  $result: "";
  @each $item in $list {
    @if $result == "" {
      $result: inspect($item);
    } @else {
      $result: $result + ", " + inspect($item);
    }
  }
  @return unquote($result);
}

// ---------- 配置：用 Map 管理主题色 ----------
$theme: (
  primary: #3498db,
  success: #27ae60,
  danger: #e74c3c,
  warning: #f39c12,
  info: #16a085,
);

$spacers: 0 4px 8px 12px 16px 24px 32px;
$font-stack: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

// ============================================================
// 应用到通用 demo 元素
// ============================================================
.sass-demo {
  font-family: $font-stack;
  padding: 16px;
  background: scale-color(#f7f8fa, $lightness: 0%);
  color: #333;

  // 按钮系列：用 @each 遍历 Map，配合 color.adjust 派生悬浮色
  .btn {
    display: inline-block;
    margin: 4px;
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: rem(14px);
    cursor: pointer;
    transition: background-color 0.2s ease;

    @each $name, $color in $theme {
      &.btn-#{$name} {
        background-color: $color;
        color: text-on($color);

        &:hover {
          background-color: color.adjust($color, $lightness: -8%);
        }

        &:active {
          background-color: color.adjust($color, $lightness: -15%);
        }
      }
    }

    // 用 mix 混合出特殊配色
    &.btn-mix {
      background-color: mix(map.get($theme, primary), map.get($theme, danger));
      color: #ffffff;
    }
  }

  // 卡片：演示 scale-color 与 color.adjust
  .card {
    margin-bottom: 12px;
    padding: 16px;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid color.adjust(map.get($theme, primary), $lightness: 35%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .card-title {
      margin: 0 0 8px;
      font-size: rem(18px);
      color: map.get($theme, primary);
    }

    .card-text {
      margin: 0;
      font-size: rem(14px);
      line-height: 1.6;
      color: color.adjust(#333333, $lightness: 20%);
    }
  }

  // 列表：演示字符串函数与列表函数
  .list {
    list-style: none;
    margin: 0 0 12px;
    padding: 8px 12px;
    background: #ffffff;
    border-radius: 6px;
    border-left: 4px solid map.get($theme, info);

    li {
      padding: 8px 4px;
      border-bottom: 1px solid #f0f0f0;
      font-size: rem(13px);

      &::before {
        content: "第 " + str-length("Item") + " 项 → ";
        color: map.get($theme, success);
        font-weight: bold;
      }

      &:last-child {
        border-bottom: none;
      }
    }
  }

  // 网格：演示 percentage / round / 数字函数
  .grid {
    display: flex;
    flex-wrap: wrap;
    gap: round(11.6px);   // → 12px
    margin-bottom: 12px;

    .grid-item {
      // 平均分 4 列，减去 gap
      width: percentage(1 / 4);
      height: ceil(60.2px);   // → 61px
      background: color.adjust(map.get($theme, warning), $hue: 20deg);
      color: text-on(color.adjust(map.get($theme, warning), $hue: 20deg));
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      box-sizing: border-box;
    }
  }

  // 表单：演示 max / abs / 自定义 rem 函数
  .form {
    padding: 16px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

    .form-row {
      margin-bottom: max(12px, 0.75rem);

      label {
        display: block;
        margin-bottom: 4px;
        font-size: rem(13px);
        color: #555;
        text-transform: to-upper-case("label");
      }

      input,
      select,
      textarea {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: rem(14px);
        box-sizing: border-box;
        transition: border-color 0.2s, box-shadow 0.2s;

        &:focus {
          outline: none;
          border-color: map.get($theme, primary);
          box-shadow: 0 0 0 3px rgba(52, 152, 219, abs(-0.2));
        }
      }
    }
  }

  // 调色板演示：从一个主色派生 5 个明度阶梯
  .palette {
    display: flex;
    gap: 4px;
    margin-top: 12px;
    height: 40px;
    border-radius: 6px;
    overflow: hidden;

    @each $i in (1, 2, 3, 4, 5) {
      $step: ($i - 3) * 15%;
      .palette-#{$i} {
        flex: 1;
        background: color.adjust(map.get($theme, primary), $lightness: $step);
      }
    }
  }

  // 自定义函数演示：join-by-comma
  .fn-demo {
    margin-top: 12px;
    padding: 12px;
    background: color.scale(map.get($theme, success), $lightness: 60%);
    border-radius: 6px;
    font-size: rem(13px);
    color: text-on(color.scale(map.get($theme, success), $lightness: 60%));

    &::after {
      content: "列表合并结果: " + join-by-comma($spacers);
    }
  }
}
`,
  },

  // =========================================================
  // 第三章：控制指令
  // =========================================================
  {
    id: "sass-control",
    group: "核心功能",
    icon: "🔀",
    title: "控制指令",
    content: `# 控制指令

控制指令是 Sass 的「程序化」核心：\`@if\` 做条件判断，\`@for\` / \`@each\` / \`@while\` 做循环。它们让 Sass 能够**批量生成 CSS**——网格列、间距工具类、配色调色板、图标类，全都靠控制指令自动产出。

没有控制指令，你要手写 24 个 \`.col-1\` 到 \`.col-24\`；有了它，几行循环就搞定。本章把四种指令讲透，并给出大量实战模式与陷阱警示。

---

## 一、@if 条件指令

### 1.1 基本语法

\`\`\`scss
@mixin text-color($bg) {
  @if lightness($bg) > 50% {
    color: #000;
  } @else {
    color: #fff;
  }
}
\`\`\`

\`@if\` 后跟一个表达式，为真则执行其后的块。可以接 \`@else if\` 和 \`@else\`。

### 1.2 @else if 链

\`\`\`scss
@function size-label($px) {
  @if $px < 12px { @return "xs"; }
  @else if $px < 16px { @return "sm"; }
  @else if $px < 24px { @return "md"; }
  @else if $px < 36px { @return "lg"; }
  @else { @return "xl"; }
}
\`\`\`

### 1.3 真假判定规则

Sass 中只有 \`false\` 和 \`null\` 是假，其余一切（包括 \`0\`、空字符串、空列表）都是真。这与 JavaScript 不同（JS 里 \`0\`、\`""\` 是假）：

\`\`\`scss
@if 0        { /* 会执行，0 在 Sass 里是真 */ }
@if ""       { /* 会执行，空字符串也是真 */ }
@if null     { /* 不会执行 */ }
@if false    { /* 不会执行 */ }
@if ()       { /* 空列表，会执行（注意：某些版本空列表视作 null） */ }
\`\`\`

> 这个细节要特别小心：写 \`@if $value\` 时，如果 \`$value\` 是 \`0\`，在 Sass 里条件成立！

### 1.4 单行 if 函数：if()

除了指令 \`@if\`，还有函数 \`if($cond, $yes, $no)\`，类似三元运算符：

\`\`\`scss
$mode: dark;
$bg: if($mode == dark, #000, #fff);   // #000
\`\`\`

\`if()\` 用在表达式里，\`@if\` 用在语句块里。

### 1.5 比较与逻辑运算符

\`\`\`scss
$a == $b      // 等于
$a != $b      // 不等于
$a < $b       // 小于
$a > $b       // 大于
$a <= $b      // 小于等于
$a >= $b      // 大于等于
$a and $b     // 与
$a or $b      // 或
not $a        // 非
\`\`\`

注意 Sass 用 \`and\` / \`or\` / \`not\`（单词），不是 \`&&\` / \`||\` / \`!\`。

### 1.6 实战：响应式断点条件生成

\`\`\`scss
@mixin respond($name) {
  @if $name == mobile {
    @media (max-width: 575px) { @content; }
  } @else if $name == tablet {
    @media (min-width: 576px) and (max-width: 991px) { @content; }
  } @else if $name == desktop {
    @media (min-width: 992px) { @content; }
  } @else {
    @warn "未知断点: #{$name}";
  }
}
\`\`\`

---

## 二、@for 循环

### 2.1 两种形式：through 与 to

\`\`\`scss
// through：包含结束值
@for $i from 1 through 5 {
  .col-#{$i} { width: $i * 20%; }
}
// 生成 i = 1, 2, 3, 4, 5

// to：不包含结束值
@for $i from 1 to 5 {
  .row-#{$i} { /* ... */ }
}
// 生成 i = 1, 2, 3, 4
\`\`\`

**区别**：\`through\` 是闭区间 \[1, 5\]，\`to\` 是左闭右开 \[1, 5)。初学者常记混，记住口诀「through 穿过去包含，to 到了不含」。

### 2.2 倒序循环

\`\`\`scss
@for $i from 5 through 1 {
  .order-#{$i} { order: $i; }
}
// 生成 5, 4, 3, 2, 1
\`\`\`

from 大于 to 时自动倒序。

### 2.3 实战：生成网格列

\`\`\`scss
$columns: 12;

@for $i from 1 through $columns {
  .col-#{$i} {
    width: percentage($i / $columns);
  }
}
\`\`\`

输出 \`.col-1\` ~ \`.col-12\`，宽度从 8.33% 到 100%。这就是 Bootstrap 栅格的核心。

### 2.4 实战：生成间距工具类

\`\`\`scss
@for $i from 0 through 5 {
  .mt-#{$i} { margin-top: $i * 8px; }
  .mb-#{$i} { margin-bottom: $i * 8px; }
  .pt-#{$i} { padding-top: $i * 8px; }
  .pb-#{$i} { padding-bottom: $i * 8px; }
}
\`\`\`

一行循环产出 24 个工具类，覆盖 0/8/16/24/32/40px 的间距。

---

## 三、@each 循环

\`@each\` 遍历列表或 Map，是 Sass 里**最常用**的循环。

### 3.1 遍历列表

\`\`\`scss
$sizes: small, medium, large;

@each $size in $sizes {
  .icon-#{$size} {
    font-size: if($size == small, 12px, if($size == medium, 16px, 24px));
  }
}
\`\`\`

### 3.2 遍历 Map（解构）

\`\`\`scss
$icons: (
  home: "\\e900",
  user: "\\e901",
  search: "\\e902",
);

@each $name, $code in $icons {
  .icon-#{$name}::before {
    font-family: "iconfont";
    content: $code;
  }
}
\`\`\`

\`@each $key, $value in $map\` 会把每个键值对解构成两个变量。这是生成图标类的标准手法。

### 3.3 多变量解构（遍历多维列表）

\`\`\`scss
$breakpoints: (
  (small 576px),
  (medium 768px),
  (large 992px),
);

@each $name, $value in $breakpoints {
  .hidden-#{$name} {
    @media (max-width: $value - 1) { display: none; }
  }
}
\`\`\`

当列表元素本身是列表时，\`@each\` 会自动解构，把每个子列表的元素赋给多个变量。

### 3.4 index 函数配合 @each 取序号

\`@each\` 不直接给序号，但可以查：

\`\`\`scss
$colors: red green blue;

@each $color in $colors {
  $i: index($colors, $color);
  .box-#{$i} { background: $color; }
}
\`\`\`

### 3.5 实战：用 Map 生成颜色调色板

\`\`\`scss
$palette: (
  50:  #f0f9ff,
  100: #e0f2fe,
  500: #0ea5e9,
  900: #0c4a6e,
);

@each $shade, $color in $palette {
  .bg-primary-#{$shade} { background-color: $color; }
  .text-primary-#{$shade} { color: $color; }
}
\`\`\`

这正是 Tailwind 这类工具优先框架生成 \`bg-primary-500\`、\`text-primary-900\` 的方式。

---

## 四、@while 循环

\`@while\` 在条件为真时持续循环。不如 \`@for\` 常用，但在「步长不固定」时有用。

### 4.1 基本语法

\`\`\`scss
$i: 1;
@while $i <= 5 {
  .mt-#{$i} { margin-top: $i * 8px; }
  $i: $i + 1;   // 必须手动递增！
}
\`\`\`

> **关键**：\`@while\` 不会自动改变变量，你必须在循环体内手动更新 \`$i\`，否则会**死循环**导致编译卡死。

### 4.2 实战：指数级增长

\`\`\`scss
$i: 1;
@while $i <= 1024 {
  .w-#{$i} { width: $i * 1px; }
  $i: $i * 2;   // 1, 2, 4, 8, 16 ... 1024
}
\`\`\`

生成 \`.w-1\`、\`.w-2\`、\`.w-4\` ... \`.w-1024\`，宽度按 2 的幂增长。这种「指数级」序列 \`@for\` 做不到，正好用 \`@while\`。

### 4.3 死循环陷阱

\`\`\`scss
// ❌ 忘记递增，编译会卡死
$i: 1;
@while $i <= 5 {
  .box-#{$i} { /* ... */ }
  // 漏了 $i: $i + 1;
}
\`\`\`

写 \`@while\` 时第一件事就是确认循环变量会被更新。

---

## 五、综合实战：生成完整的设计令牌

把四种指令组合起来，一次性生成一整套设计令牌（间距、字号、颜色、阴影）。

\`\`\`scss
// 间距：@for 生成
@for $i from 0 through 6 {
  $value: $i * 4px;
  .m-#{$i}  { margin: $value; }
  .p-#{$i}  { padding: $value; }
}

// 字号：@each 遍历 Map
$font-sizes: (
  xs: 12px, sm: 14px, base: 16px, lg: 18px, xl: 24px, xxl: 32px
);
@each $name, $size in $font-sizes {
  .text-#{$name} { font-size: $size; }
}

// 颜色：@each + @if 区分明度
$theme: (primary: #3498db, success: #27ae60, danger: #e74c3c);
@each $name, $color in $theme {
  .bg-#{$name} {
    background: $color;
    color: if(lightness($color) > 50%, #000, #fff);
  }
}

// 阴影：@for 生成多级
@for $i from 1 through 4 {
  .shadow-#{$i} { box-shadow: 0 $i * 2px $i * 6px rgba(0,0,0,.1 * $i); }
}
\`\`\`

几十行 Sass 输出上百个工具类——这就是控制指令的威力。

---

## 六、循环的妙用与陷阱

### 6.1 妙用：用 @each 生成状态类

\`\`\`scss
$states: (
  success: #27ae60,
  warning: #f39c12,
  danger: #e74c3c,
);

@each $name, $color in $states {
  .alert-#{$name} {
    border-left: 4px solid $color;
    background: mix($color, #fff, 15%);
    color: darken($color, 20%);
    padding: 12px;
    border-radius: 4px;
  }
}
\`\`\`

### 6.2 妙用：@for 生成 Z 字形布局

\`\`\`scss
@for $i from 1 through 6 {
  .zigzag-item:nth-child(#{$i}) {
    margin-left: if($i % 2 == 1, 0, 40px);
  }
}
\`\`\`

奇数项靠左、偶数项右移，形成 Z 字形。用 \`@if\` 配合 \`@for\` 实现交替样式。

### 6.3 陷阱一：循环内重用变量名导致污染

\`\`\`scss
// ❌ $i 在嵌套循环里被外层复用，逻辑错乱
@for $i from 1 through 3 {
  @for $i from 1 through 3 {   // 内外都叫 $i
    .box-#{$i} { /* ... */ }
  }
}
\`\`\`

嵌套循环要用不同变量名（\`$i\`、\`$j\`、\`$k\`）。

### 6.4 陷阱二：循环生成过多 CSS

\`\`\`scss
// ❌ 12 列 × 5 断点 × 6 间距 = 360 个类
@for $col from 1 through 12 {
  @each $bp in (sm md lg xl) {
    @for $mt from 0 through 5 {
      .col-#{$bp}-#{$col} .mt-#{$mt} { /* ... */ }
    }
  }
}
\`\`\`

控制指令很爽，但每次循环都在「长 CSS」。过度循环会让产物膨胀到几百 KB。生成前想清楚是否真的需要这么多类，能否用 CSS 自定义属性或更通用的规则替代。

### 6.5 陷阱三：@each 修改 Map 不会生效

\`\`\`scss
$colors: (a: 1, b: 2);
@each $k, $v in $colors {
  $colors: map-merge($colors, ($k: $v + 1));   // ❌ 不影响当前遍历
}
\`\`\`

\`@each\` 遍历的是循环开始时的快照，循环内修改 Map 不会改变本次遍历。要在遍历中累积结果，用递归函数或先收集到列表。

### 6.6 陷阱四：@while 死循环

如前所述，忘记递增会卡死编译器。写 \`@while\` 时务必确认退出条件终会满足。

---

## 七、控制指令与函数、混入的配合

控制指令很少单独使用，通常嵌在混入或函数里。

### 7.1 在混入里用 @if

\`\`\`scss
@mixin button($variant: primary) {
  @if $variant == primary {
    background: #3498db;
  } @else if $variant == danger {
    background: #e74c3c;
  } @else {
    background: #999;
  }
}
\`\`\`

### 7.2 在函数里用 @for

\`\`\`scss
@function sum-list($list) {
  $total: 0;
  @for $i from 1 through length($list) {
    $total: $total + nth($list, $i);
  }
  @return $total;
}
\`\`\`

### 7.3 在混入里用 @each 批量生成

\`\`\`scss
@mixin generate-modifiers($map) {
  @each $key, $value in $map {
    &--#{$key} {
      background: $value;
    }
  }
}
.alert { @include generate-modifiers($states); }
\`\`\`

---

## 八、本章小结

- **\`@if / @else if / @else\`** 做条件分支；只有 \`false\` 和 \`null\` 是假。
- **\`@for $i from A through B\`** 闭区间，**\`to\`** 左闭右开。
- **\`@each\`** 遍历列表或 Map，是最常用的循环，支持多变量解构。
- **\`@while\`** 适合不固定步长，但**必须手动更新变量**，否则死循环。
- 实战模式：网格列、间距工具类、配色调色板、图标类、状态提示框。
- 陷阱：变量名冲突、CSS 膨胀、循环内改 Map 无效、\`@while\` 死循环。
- 控制指令通常配合混入/函数使用，是构建设计系统与工具类框架的基石。

---

## 九、控制指令与设计令牌系统

现代前端（Tailwind、Material、Ant Design）都采用"设计令牌（Design Tokens）"思想：把颜色、间距、字号、圆角等抽象成一组命名变量，再用控制指令批量生成工具类。Sass 的 \`@each\` + Map 是实现这一思想的最佳组合。

### 令牌分层架构

一个成熟的设计令牌系统通常分三层：

\`\`\`scss
// 第一层：原始令牌（Raw Tokens）—— 不带语义的原子值
$colors-raw: (
  gray-50: #f9fafb,
  gray-100: #f3f4f6,
  gray-500: #6b7280,
  gray-900: #111827,
  blue-500: #3b82f6,
  blue-600: #2563eb,
  red-500: #ef4444,
);

// 第二层：语义令牌（Semantic Tokens）—— 赋予含义
$colors-semantic: (
  text-primary: map.get($colors-raw, gray-900),
  text-secondary: map.get($colors-raw, gray-500),
  bg-surface: map.get($colors-raw, gray-50),
  bg-muted: map.get($colors-raw, gray-100),
  brand: map.get($colors-raw, blue-500),
  brand-hover: map.get($colors-raw, blue-600),
  danger: map.get($colors-raw, red-500),
);

// 第三层：组件令牌（Component Tokens）—— 绑定到具体组件
$colors-component: (
  button-bg: map.get($colors-semantic, brand),
  button-text: #fff,
  button-bg-hover: map.get($colors-semantic, brand-hover),
  card-bg: map.get($colors-semantic, bg-surface),
  card-border: map.get($colors-raw, gray-100),
);
\`\`\`

### 用 @each 批量生成工具类

\`\`\`scss
// 遍历语义令牌，生成 .text-{name} 和 .bg-{name} 工具类
@each $name, $color in $colors-semantic {
  .text-#{$name} { color: $color; }
  .bg-#{$name} { background-color: $color; }
}

// 输出：
// .text-primary { color: #111827; }
// .text-secondary { color: #6b7280; }
// .bg-brand { background-color: #3b82f6; }
// ...
\`\`\`

这种"令牌 + 循环"的模式让设计系统**单一数据源**：改一处 Map，所有工具类自动更新，杜绝不一致。

### 间距令牌与工具类

\`\`\`scss
$spacing-base: 4px;
$spacing-scale: 0, 1, 2, 3, 4, 6, 8, 12, 16;

@each $i in $spacing-scale {
  $value: $i * $spacing-base;
  .m-#{$i}  { margin: $value; }
  .p-#{$i}  { padding: $value; }
  .mt-#{$i} { margin-top: $value; }
  .pt-#{$i} { padding-top: $value; }
}
// 输出: .m-0, .m-1, .m-2 ... .m-16, .p-0 ... .pt-16
\`\`\`

这正是 Tailwind CSS 内部的实现思路（Tailwind 用 JS 生成，Sass 用 \`@each\` 生成，原理一致）。

---

## 十、栅格系统深度实现

上一节的 \`@for\` 只生成了基础列宽。真实栅格系统还需要**偏移（offset）、列排序（push/pull）、响应式断点**。用嵌套循环可以一次生成全部。

\`\`\`scss
$columns: 12;
$breakpoints: (
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
);

// 生成响应式列宽 + 偏移
@each $name, $value in $breakpoints {
  @media (min-width: $value) {
    @for $i from 1 through $columns {
      // 列宽
      .col-#{$name}-#{$i} {
        width: percentage(math.div($i, $columns));
      }
      // 偏移
      @if $i < $columns {
        .offset-#{$name}-#{$i} {
          margin-left: percentage(math.div($i, $columns));
        }
      }
    }
  }
}
// 输出: .col-sm-1 ... .col-xl-12, .offset-sm-1 ... .offset-xl-11
\`\`\`

这里 \`@each\`（断点）嵌套 \`@for\`（列数），生成 \`5 断点 × 12 列 × 2 类型 = 120\` 个类。手写这些类要几百行，Sass 循环只需十几行。

### 嵌套循环的变量作用域

嵌套循环时，**外层变量在内层可见，反之不行**：

\`\`\`scss
@each $bp, $val in $breakpoints {     // $bp, $val 在内层可用
  @for $i from 1 through $columns {   // $i 在外层不可用
    .col-#{$bp}-#{$i} { ... }         // 可以同时用 $bp 和 $i
  }
}
\`\`\`

如果内层需要影响外层，只能通过累加 + \`!global\`（不推荐），更好的做法是改用函数计算。

---

## 十一、主题切换与暗色模式

控制指令配合 CSS 变量，可以优雅地实现**多主题**和**暗色模式**。

### 方案一：编译期多主题（生成多套 CSS）

\`\`\`scss
$themes: (
  light: (bg: #fff, text: #333, brand: #3b82f6),
  dark:  (bg: #1a1a1a, text: #f0f0f0, brand: #60a5fa),
);

@each $theme-name, $theme-map in $themes {
  .theme-#{$theme-name} {
    @each $key, $value in $theme-map {
      --color-#{$key}: #{$value};
    }
  }
}
// 输出：
// .theme-light { --color-bg: #fff; --color-text: #333; ... }
// .theme-dark  { --color-bg: #1a1a1a; --color-text: #f0f0f0; ... }
\`\`\`

HTML 加 \`class="theme-dark"\` 即可切换主题。优点是兼容性好，缺点是 CSS 体积大。

### 方案二：运行时切换（CSS 变量 + prefers-color-scheme）

\`\`\`scss
// 用 @if 判断生成默认与暗色两套变量
@mixin theme-variables($dark: false) {
  @if $dark {
    --bg: #1a1a1a;
    --text: #f0f0f0;
  } @else {
    --bg: #ffffff;
    --text: #333333;
  }
}

:root { @include theme-variables(false); }
@media (prefers-color-scheme: dark) {
  :root { @include theme-variables(true); }
}
\`\`\`

浏览器会根据系统设置自动切换，无需 JS。两种方案可以结合：用 Sass 生成变量，用 CSS 变量做运行时切换。

---

## 十二、编译性能优化

控制指令虽好，但滥用会导致 CSS 膨胀、编译变慢。以下是性能要点。

### 1. 避免在循环里做重复计算

\`\`\`scss
// 慢：每次循环都调用函数
@for $i from 1 through 100 {
  .w-#{$i} { width: expensive-fn($i); }
}

// 快：把不变的部分提到循环外
$base: expensive-fn(1);
@for $i from 1 through 100 {
  .w-#{$i} { width: $base * $i; }
}
\`\`\`

### 2. 控制生成的类数量

\`@each\` 嵌套 \`@for\` 容易生成几何级数的类。比如 \`5 断点 × 12 列 × 12 偏移 = 720 个类\`。如果用不到这么多，**按需生成**：

\`\`\`scss
// 只生成实际用到的断点
$used-breakpoints: (md, lg);
@each $bp in $used-breakpoints {
  @for $i from 1 through $columns {
    .col-#{$bp}-#{$i} { ... }
  }
}
\`\`\`

### 3. 用 @use 替代 @import

\`@import\` 会导致文件被多次嵌入，变量重复定义。\`@use\` 有命名空间、只加载一次，编译更快。新项目一律用 \`@use\`。

### 4. 减少深层嵌套

\`\`\`scss
// 慢且输出冗长
.parent {
  .child {
    .grandchild {
      @for $i from 1 through 10 { .item-#{$i} { ... } }
    }
  }
}
// 输出: .parent .child .grandchild .item-1 { ... }

// 快且扁平
@for $i from 1 through 10 {
  .parent .child .grandchild .item-#{$i} { ... }
}
\`\`\`

选择器嵌套越深，编译器解析越慢，输出 CSS 也越长。

---

## 十三、调试与常见错误

### 1. @while 死循环

忘记更新循环变量是最常见的错误：

\`\`\`scss
$i: 1;
@while $i <= 10 {
  .w-#{$i} { width: $i * 10px; }
  // 忘了 $i: $i + 1; → 死循环，编译卡死
}
\`\`\`

**解决**：写 \`@while\` 时先写好变量更新语句，再写循环体。

### 2. @for 的 through vs to 混淆

\`\`\`scss
@for $i from 1 through 3 { /* $i = 1, 2, 3 闭区间 */ }
@for $i from 1 to 3      { /* $i = 1, 2     左闭右开 */ }
\`\`\`

记不住就记住：\`through\` 包含终点，\`to\` 不包含。生成 N 项用 \`through N\`。

### 3. @each 遍历 Map 时写错键名

\`\`\`scss
$theme: (primary: #3b82f6, danger: #ef4444);
@each $name, $color in $theme {
  .text-#{primary} { color: $color; }  // 错！应该用 $name
}
\`\`\`

\`#{primary}\` 会被当成字面量，所有类都变成 \`.text-primary\`。正确写法是 \`#{$name}\`。

### 4. 循环内无法修改 Map

\`\`\`scss
$counter: ();
@for $i from 1 through 5 {
  $counter: map.merge($counter, ($i: $i * 2));  // 看似可行
}
// 但 $counter 在循环外仍是空 Map，因为作用域问题
\`\`\`

Sass 的 Map 是不可变的，\`map.merge\` 返回新 Map。在循环里累加需要 \`!global\`，但这属于反模式。**需要累加结果时，改用函数递归或预计算**。

### 5. 用 @debug 查看循环变量

\`\`\`scss
@for $i from 1 through 3 {
  @debug "当前 i = #{$i}";
  .col-#{$i} { width: percentage($i / 12); }
}
\`\`\`

编译时输出 \`当前 i = 1\`、\`当前 i = 2\`、\`当前 i = 3\`，帮你确认循环是否按预期执行。

### 控制指令章节总结

- \`@if/@else if/@else\` 做分支；\`@for through/to\` 做计数循环；\`@each\` 做遍历；\`@while\` 做条件循环。
- 配合 Map 和列表，可以批量生成设计令牌、栅格、工具类、主题。
- 性能关键：减少嵌套、按需生成、用 \`@use\` 替代 \`@import\`。
- 调试用 \`@debug\`，校验用 \`@error\`，警惕 \`@while\` 死循环和 \`@for\` 区间混淆。

下面是本章可运行示例，它用控制指令生成了网格、间距、配色、图标占位、阴影等大量工具类，并应用到 demo 元素上。
`,
    code: `// ============================================================
// 第 3 章演示代码：控制指令 @if / @for / @each / @while
// 批量生成网格、间距、配色、图标、阴影等工具类
// ============================================================

@use "sass:color";

// ---------- 配置 ----------
$columns: 12;
$spacer-base: 8px;
$theme: (
  primary: #3498db,
  success: #27ae60,
  danger: #e74c3c,
  warning: #f39c12,
  info: #16a085,
);
$font-stack: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

// ---------- 自定义函数：根据背景选文字色（演示 @if） ----------
@function text-on($bg) {
  @if lightness($bg) > 55% {
    @return #1a1a1a;
  } @else {
    @return #ffffff;
  }
}

// ============================================================
// 用控制指令批量生成工具类
// ============================================================

// @for 生成 12 列栅格（through 包含结束值）
@for $i from 1 through $columns {
  .col-#{$i} {
    width: percentage($i / $columns);
    float: left;
  }
}

// @for 生成间距工具类
@for $i from 0 through 5 {
  .m-#{$i}  { margin: $i * $spacer-base; }
  .mt-#{$i} { margin-top: $i * $spacer-base; }
  .mb-#{$i} { margin-bottom: $i * $spacer-base; }
  .p-#{$i}  { padding: $i * $spacer-base; }
}

// @for 生成多级阴影
@for $i from 1 through 4 {
  .shadow-#{$i} {
    box-shadow: 0 #{$i * 2px} #{$i * 6px} rgba(0, 0, 0, 0.06 * $i);
  }
}

// @each 遍历 Map 生成颜色工具类
@each $name, $color in $theme {
  .text-#{$name} { color: $color; }
  .bg-#{$name} {
    background-color: $color;
    color: text-on($color);
  }
}

// @each 生成字号工具类
$font-sizes: (
  xs: 12px,
  sm: 14px,
  base: 16px,
  lg: 18px,
  xl: 24px,
);
@each $name, $size in $font-sizes {
  .text-#{$name} { font-size: $size; }
}

// @each 多变量解构：生成响应式隐藏类
$breakpoints: (
  (mobile 576px),
  (tablet 768px),
  (desktop 992px),
);
@each $name, $value in $breakpoints {
  .hidden-#{$name} {
    @media (max-width: $value - 1) {
      display: none !important;
    }
  }
}

// @while 生成指数级宽度（演示不常用步长）
$i: 1;
@while $i <= 64 {
  .w-#{$i} { width: $i * 1px; }
  $i: $i * 2;
}

// ============================================================
// 应用到通用 demo 元素
// ============================================================
.sass-demo {
  font-family: $font-stack;
  padding: 16px;
  background: #f7f8fa;
  color: #333;

  // 按钮：@each 遍历主题色
  .btn {
    display: inline-block;
    margin: 4px;
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    @each $name, $color in $theme {
      &.btn-#{$name} {
        background-color: $color;
        color: text-on($color);

        &:hover {
          background-color: color.adjust($color, $lightness: -8%);
        }
      }
    }
  }

  // 卡片：使用 @if 区分明度，自动配文字色
  .card {
    margin-bottom: 12px;
    padding: 16px;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    @each $name, $color in $theme {
      &.card-#{$name} {
        border-top: 4px solid $color;

        .card-title {
          color: $color;
        }
      }
    }

    .card-title {
      margin: 0 0 8px;
      font-size: 18px;
    }

    .card-text {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: #555;
    }
  }

  // 列表：演示 @for 生成序号
  .list {
    list-style: none;
    margin: 0 0 12px;
    padding: 8px 12px;
    background: #ffffff;
    border-radius: 6px;
    border-left: 4px solid map-get($theme, info);

    @for $i from 1 through 4 {
      li:nth-child(#{$i}) {
        padding: 8px 4px;
        border-bottom: 1px solid #f0f0f0;
        font-size: 13px;

        &::before {
          content: "#{$i}. ";
          font-weight: bold;
          color: map-get($theme, primary);
        }

        &:last-child {
          border-bottom: none;
        }
      }
    }
  }

  // 网格：演示 @for 生成栅格
  .grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;

    // 用循环生成 6 个网格项，分别占不同列数
    @for $i from 1 through 6 {
      .grid-item-#{$i} {
        // 交替使用不同列宽
        $cols: if($i % 2 == 1, 4, 8);
        width: percentage($cols / $columns);
        height: 50px;
        background: color.adjust(map-get($theme, primary), $lightness: ($i - 3) * 8%);
        color: text-on(color.adjust(map-get($theme, primary), $lightness: ($i - 3) * 8%));
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        box-sizing: border-box;
      }
    }
  }

  // 表单
  .form {
    padding: 16px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

    .form-row {
      margin-bottom: 12px;

      label {
        display: block;
        margin-bottom: 4px;
        font-size: 13px;
        color: #555;
      }

      input,
      select,
      textarea {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;

        &:focus {
          outline: none;
          border-color: map-get($theme, primary);
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        }
      }
    }
  }

  // 调色板：@each 遍历明度 Map
  $palette: (
    50: #e3f2fd,
    100: #bbdefb,
    500: #2196f3,
    700: #1976d2,
    900: #0d47a1,
  );

  .palette {
    display: flex;
    height: 40px;
    border-radius: 6px;
    overflow: hidden;
    margin-top: 12px;

    @each $shade, $color in $palette {
      .palette-#{$shade} {
        flex: 1;
        background: $color;
        color: text-on($color);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
      }
    }
  }

  // 图标占位：@each 生成图标类
  $icons: (
    home: #3498db,
    user: #27ae60,
    search: #e74c3c,
    heart: #e91e63,
  );

  .icon-row {
    display: flex;
    gap: 12px;
    margin-top: 12px;

    @each $name, $color in $icons {
      .icon-#{$name} {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: $color;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        text-transform: uppercase;

        &::after {
          content: "#{$name}";
        }
      }
    }
  }
}
`,
  },

  // =========================================================
  // 第四章：继承 @extend
  // =========================================================
  {
    id: "sass-extend",
    group: "核心功能",
    icon: "🔗",
    title: "继承 @extend",
    content: `# 继承 @extend

\`@extend\` 是 Sass 的另一个核心复用机制。它和混入都能复用样式，但思路完全不同：**混入复制声明，继承合并选择器**。\`@extend\` 让一个选择器「继承」另一个选择器的所有规则，最终在 CSS 里把它们合并成一个用逗号分隔的选择器组。

本章讲清 \`@extend\` 的工作原理、占位符选择器、它的局限与陷阱，以及最重要的——**什么时候该用 \`@extend\`，什么时候该用 \`@mixin\`**。

---

## 一、@extend 基本用法

### 1.1 继承一个选择器

\`\`\`scss
.message {
  padding: 10px;
  border: 1px solid;
  border-radius: 4px;
}

.error {
  @extend .message;
  background: #fdd;
  border-color: #f00;
}

.success {
  @extend .message;
  background: #dfd;
  border-color: #0a0;
}
\`\`\`

编译结果：

\`\`\`css
.message, .error, .success {
  padding: 10px;
  border: 1px solid;
  border-radius: 4px;
}

.error {
  background: #fdd;
  border-color: #f00;
}

.success {
  background: #dfd;
  border-color: #0a0;
}
\`\`\`

注意第一行：\`.message\`、\`.error\`、\`.success\` 被**合并成一个选择器组**，共享同一组声明。这正是 \`@extend\` 与混入的根本区别——**声明只输出一次**。

### 1.2 继承会把所有相关规则都带过来

\`@extend\` 不只是继承单条规则，而是继承**所有匹配该选择器的规则**，包括后代选择器：

\`\`\`scss
.message {
  padding: 10px;
}
.message .title {
  font-weight: bold;
}

.error {
  @extend .message;
  background: #fdd;
}
\`\`\`

编译结果：

\`\`\`css
.message, .error {
  padding: 10px;
}
.message .title, .error .title {
  font-weight: bold;
}
.error {
  background: #fdd;
}
\`\`\`

\`.error .title\` 被自动加进来了——因为 \`.error\` 继承了 \`.message\`，凡是 \`.message\` 出现的地方，\`.error\` 也跟着出现。这是 \`@extend\` 强大但也容易失控的地方。

---

## 二、占位符选择器 %placeholder

占位符是「**只为继承而存在、自身不输出**」的选择器，用 \`%\` 开头。

### 2.1 为什么需要占位符

直接 \`@extend .message\` 的问题：\`.message\` 本身会出现在最终 CSS 里。如果你只是想定义一个「基类」供继承、并不打算直接用 \`class="message"\`，那 \`.message\` 就成了多余的 CSS。

占位符解决这个：

\`\`\`scss
%message-base {
  padding: 10px;
  border: 1px solid;
  border-radius: 4px;
}

.error {
  @extend %message-base;
  background: #fdd;
}

.success {
  @extend %message-base;
  background: #dfd;
}
\`\`\`

编译结果：

\`\`\`css
.error, .success {
  padding: 10px;
  border: 1px solid;
  border-radius: 4px;
}

.error { background: #fdd; }
.success { background: #dfd; }
\`\`\`

\`%message-base\` **没有出现在 CSS 里**——它只是个「模板」，被继承后才生成 \`.error, .success\` 这一组。这是「静态共享样式」的最佳实践。

### 2.2 占位符 vs 类选择器

| 特性 | \`%placeholder\` | \`.class\` |
| --- | --- | --- |
| 自身输出 CSS | 否 | 是 |
| 可被 HTML 直接使用 | 否（不是真实类） | 是 |
| 用途 | 内部基类、模板 | 既要直接用又要被继承 |
| 推荐度 | 纯继承场景推荐 | 需要直接用时用 |

经验法则：**如果这个类不会被 HTML 直接引用，只是用来被继承，就用 \`%\`。**

### 2.3 占位符可以带参数吗

占位符**不能**像混入那样带参数。它就是一组固定声明。需要参数化时，用混入；不需要参数、只求共享时，用占位符。

---

## 三、@extend 的局限

### 3.1 不能跨 @media

\`@extend\` 最大的限制：**不能从 \`@media\` 内部继承外部选择器**。

\`\`\`scss
.error { color: red; }

@media (max-width: 768px) {
  .alert {
    @extend .error;   // ❌ 报错！
  }
}
\`\`\`

编译会报错：\`You may not @extend an outer selector from within @media.\`

原因：\`@extend\` 通过合并选择器实现，但 \`@media\` 是独立的样式块，外部选择器无法「钻进」媒体查询里。这种场景只能用混入：

\`\`\`scss
@mixin error-style { color: red; }

.error { @include error-style; }

@media (max-width: 768px) {
  .alert { @include error-style; }   // ✅ 混入可以
}
\`\`\`

### 3.2 不能继承复杂选择器组合

\`@extend\` 可以继承大多数选择器，但有些复杂情况（如带伪元素的、跨多层嵌套的）行为可能不符合直觉。一般建议只继承简单的类或占位符。

### 3.3 继承链过长导致选择器膨胀

\`\`\`scss
.a { ... }
.b { @extend .a; }
.c { @extend .b; }
.d { @extend .c; }
.e { @extend .d; }
\`\`\`

链式继承会让选择器组越来越长：\`.a, .b, .c, .d, .e\`。链太长时，最终的选择器组可能非常臃肿。

---

## 四、链式继承

继承可以链式传递：A 继承 B，C 又继承 A，则 C 也得到 B 的样式。

\`\`\`scss
%base {
  display: inline-block;
  padding: 6px 12px;
}

%button {
  @extend %base;
  border-radius: 4px;
  cursor: pointer;
}

%primary {
  @extend %button;
  background: #3498db;
  color: #fff;
}

.btn-primary {
  @extend %primary;
}
\`\`\`

\`.btn-primary\` 会同时得到 \`%base\`、\`%button\`、\`%primary\` 三层样式。链式继承能构建出有层次的样式体系，但要控制深度，通常 2-3 层为宜。

---

## 五、@extend !optional

默认情况下，\`@extend\` 一个不存在的选择器会报错。加 \`!optional\` 可让它静默跳过：

\`\`\`scss
.alert {
  @extend .nonexistent;              // ❌ 报错：选择器不存在
  @extend .nonexistent !optional;    // ✅ 静默跳过
}
\`\`\`

\`!optional\` 在写库或混入时有用——当不确定某个类是否被定义时，用 \`!optional\` 避免编译失败。

---

## 六、@extend vs @mixin：性能与选择器膨胀

这是 Sass 社区最经典的争论。我们用数据说话。

### 6.1 体积对比

假设有 10 个按钮共享基础样式，基础样式有 5 行声明：

\`\`\`scss
// 混入方案
@mixin btn-base { /* 5 行 */ }
.btn-1 { @include btn-base; }
.btn-2 { @include btn-base; }
// ... 10 个

// 继承方案
%btn-base { /* 5 行 */ }
.btn-1 { @extend %btn-base; }
.btn-2 { @extend %btn-base; }
// ... 10 个
\`\`\`

| 方案 | 5 行声明出现次数 | 选择器组长度 |
| --- | --- | --- |
| 混入 | 10 次（每个按钮复制一份） | 单选择器 |
| 继承 | 1 次（合并成一组） | 10 个选择器逗号分隔 |

- 混入：**声明重复**，但选择器短。
- 继承：**声明只一份**，但选择器组长。

当共享的声明很多、调用点很多时，继承的体积优势明显。但当选择器组动辄上百个时，选择器本身的字节数也不可忽视。

### 6.2 选择器膨胀的危险

\`@extend\` 会把继承者插入到**原选择器出现的每一处**。如果基类被用在很多复合选择器里：

\`\`\`scss
.message { ... }
.modal .message { ... }
.sidebar .message { ... }
.header .nav .message { ... }

.error { @extend .message; }
\`\`\`

那么 \`.error\` 会被加到所有这些复合选择器里：

\`\`\`css
.message, .error { ... }
.modal .message, .modal .error { ... }
.sidebar .message, .sidebar .error { ... }
.header .nav .message, .header .nav .error { ... }
\`\`\`

选择器数量翻倍，CSS 迅速膨胀。这就是 Sass 官方**在新版中逐渐不推荐 \`@extend\`** 的原因之一。

### 6.3 gzip 后的差异

值得注意：现代网站几乎都开 gzip。gzip 对重复声明（混入产生的）压缩率极高，对长选择器组（继承产生的）压缩率也不错。**实际生产环境中，两者的 gzip 后体积差异往往没有想象中大**。因此选择时不应只看裸 CSS 字节数。

---

## 七、何时用 @extend，何时用 @mixin

这是本章最重要的小节。给出明确的决策指南：

### 7.1 用 @mixin 的情况

- **需要参数或条件分支**：继承无法参数化。
- **需要跨 @media 复用**：继承做不到。
- **样式会被很多不相关的选择器使用**：避免选择器膨胀。
- **想要明确「这次调用产生了哪些样式」**：混入是显式的，继承是隐式的。
- **静态分析友好**：混入调用一眼可见，继承关系要追踪。

### 7.2 用 @extend（占位符）的情况

- **纯粹的静态共享**：一组固定声明被多处复用，无参数。
- **语义上是「is-a」关系**：\`.error\` 是一种 \`.message\`，\`.btn-primary\` 是一种 \`.button\`。
- **想要声明只输出一次**：关心裸 CSS 体积。
- **共享的是结构性样式**（如 clearfix、visually-hidden），而非外观变体。

### 7.3 决策流程图

\`\`\`
需要参数吗？
  ├─ 是 → @mixin
  └─ 否 → 需要跨 @media 吗？
           ├─ 是 → @mixin
           └─ 否 → 是静态结构性共享（is-a 关系）吗？
                    ├─ 是 → @extend %placeholder
                    └─ 否 → @mixin
\`\`\`

**一个安全默认**：拿不准就用 \`@mixin\`。Sass 官方也倾向于推荐混入，因为它的行为更可预测、更易维护。

### 7.4 反模式：用 @extend 复用外观变体

\`\`\`scss
// ❌ 反模式：用继承做颜色变体
%button { padding: 10px; border-radius: 4px; }
%blue   { @extend %button; background: blue; }
%red    { @extend %button; background: red; }
\`\`\`

颜色变体本质是「参数化的外观」，更适合混入：

\`\`\`scss
@mixin button($bg) {
  padding: 10px;
  border-radius: 4px;
  background: $bg;
}
\`\`\`

### 7.5 反模式：跨大范围继承通用类

\`\`\`scss
// ❌ .card 在几十处使用，.special-card 继承它会让选择器组爆炸
.card { ... }
.card .title { ... }
.card .body { ... }
/* ... 很多 .card 相关规则 ... */

.special-card { @extend .card; }
\`\`\`

这种情况下，\`.special-card\` 会被塞进所有 \`.card\` 相关选择器里。改用混入或重新设计结构。

---

## 八、@extend 的最佳实践

### 8.1 优先用占位符

只要不是必须直接在 HTML 里用 \`class="message"\`，就用 \`%message\`。占位符不会污染最终 CSS，也避免被意外继承到无关地方。

### 8.2 控制 @extend 的层级

继承链保持 2-3 层以内。过深的链难以追踪，且选择器组会很长。

### 8.3 不要 @extend 通用选择器

避免 \`@extend .col-*\`（通配）或被广泛使用的工具类（如 \`@extend .pull-right\`）。这些选择器出现在太多复合规则里，继承会让 CSS 爆炸。

### 8.4 把 @extend 写在选择器顶部

\`\`\`scss
.error {
  @extend %message;     // 先继承
  background: #fdd;      // 再写自己的
  border-color: #f00;
}
\`\`\`

虽然 \`@extend\` 的实际位置由 Sass 智能安排，但语义上「先继承基类、再覆盖细节」的书写顺序更易读。

### 8.5 谨慎在第三方库上 @extend

继承第三方库的类会绑定到它的实现细节，库升级时可能出问题。更稳妥的是用混入或在自己的占位符里重新声明。

---

## 九、@extend 的工作机制深入

理解 \`@extend\` 如何「重写」样式表，能帮你预测它的行为。

### 9.1 选择器替换

\`@extend .a\` 的本质：在样式表里，**凡是出现 \`.a\` 的地方，都加上继承者**。Sass 不会复制声明，而是「扩展选择器」。

\`\`\`scss
.a:hover { color: red; }
.b { @extend .a; }
\`\`\`

变成：

\`\`\`css
.a:hover, .b:hover { color: red; }
\`\`\`

注意是 \`.b:hover\`，不是 \`.b\`——\`@extend\` 智能地把 \`.b\` 替换到 \`.a\` 的位置，保留 \` :hover\` 部分。

### 9.2 不能继承的情况

- 继承带占位符的选择器组合中不存在的占位符 → 静默（占位符不输出）。
- 从 \`@media\` 内继承外层选择器 → 报错。
- 继承自己（\`.a { @extend .a; }\`）→ 会被忽略。

### 9.3 extend 与选择器特异性

\`@extend\` 合并选择器后，特异性遵循 CSS 规则。\`.error\` 继承 \`.message\`，两者特异性相同（都是 0,1,0），后定义的 \`.error\` 规则会覆盖前面的。这通常符合预期。

---

## 十、综合对比与本章小结

### 10.1 三种复用方式终极致对比

| 维度 | 变量 | 混入 | 继承（占位符） |
| --- | --- | --- | --- |
| 复用对象 | 单个值 | 一段声明 | 一组选择器规则 |
| 参数 | 否 | 是 | 否 |
| 跨 @media | 是 | 是 | **否** |
| 输出方式 | 内联值 | 复制声明 | 合并选择器 |
| 体积影响 | 极小 | 调用越多越大 | 声明一份，选择器组变长 |
| 可预测性 | 高 | 高 | 中（隐式扩展） |
| 推荐场景 | 单值复用 | 参数化样式 | 静态 is-a 共享 |

### 10.2 核心要点回顾

- \`@extend\` **合并选择器**而非复制声明，与混入的「复制」截然不同。
- **占位符 \`%placeholder\`** 是纯继承场景的最佳选择，自身不输出 CSS。
- \`@extend\` **不能跨 \`@media\`**，这是它最硬的限制。
- \`@extend !optional\` 让继承失败时静默跳过。
- **链式继承**要控制深度，避免选择器膨胀。
- \`@extend\` 会让继承者出现在基类的**所有相关规则**里，可能引发 CSS 膨胀。
- 决策指南：**需要参数/跨媒体查询/外观变体 → 混入；静态 is-a 结构共享 → 占位符继承；拿不准 → 用混入**。
- Sass 官方在新版中更倾向混入，因为其行为可预测、易维护。

---

## 补充一：@extend 的真实输出对比实验

光说不练假把式。我们做一个对比实验，直观感受 \`@extend\` 与 \`@mixin\` 的输出差异。

### 实验设置

5 个按钮共享 4 行基础样式，分别用混入和继承实现：

\`\`\`scss
// 方案 A：混入
@mixin btn-a { display: inline-block; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
.a1 { @include btn-a; background: #f00; }
.a2 { @include btn-a; background: #0f0; }
.a3 { @include btn-a; background: #00f; }
.a4 { @include btn-a; background: #ff0; }
.a5 { @include btn-a; background: #0ff; }

// 方案 B：占位符继承
%btn-b { display: inline-block; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
.b1 { @extend %btn-b; background: #f00; }
.b2 { @extend %btn-b; background: #0f0; }
.b3 { @extend %btn-b; background: #00f; }
.b4 { @extend %btn-b; background: #ff0; }
.b5 { @extend %btn-b; background: #0ff; }
\`\`\`

### 输出对比

方案 A（混入）——4 行基础声明重复 5 次：

\`\`\`css
.a1 { display:inline-block; padding:8px 16px; border-radius:4px; cursor:pointer; background:#f00; }
.a2 { display:inline-block; padding:8px 16px; border-radius:4px; cursor:pointer; background:#0f0; }
/* ... a3 a4 a5 同样各重复一次 */
\`\`\`

方案 B（继承）——4 行基础声明只出现一次，选择器合并：

\`\`\`css
.b1, .b2, .b3, .b4, .b5 { display:inline-block; padding:8px 16px; border-radius:4px; cursor:pointer; }
.b1 { background:#f00; }
.b2 { background:#0f0; }
/* ... */
\`\`\`

**裸字符数**：方案 B 明显更少。但开启 gzip 后，方案 A 的重复模式压缩率极高，差距大幅缩小。

### 结论

- 关心**裸 CSS 体积**（如内联关键 CSS）→ 继承略优。
- 关心**可维护性与可预测性** → 混入更优。
- **gzip 环境**下两者差距很小，应优先按可维护性选择。

---

## 补充二：从 @extend 迁移到 @mixin

很多老项目大量使用 \`@extend\`，迁移到 \`@mixin\` 时有章可循。

### 迁移步骤

1. **识别静态共享样式**：把被 \`@extend\` 的基类/占位符转成混入。
2. **替换调用点**：\`@extend %foo\` → \`@include foo\`。
3. **删除占位符定义中的 \`%\`**，改为 \`@mixin foo { ... }\`。
4. **检查跨 \`@media\` 调用**：迁移后这些原本报错的地方现在能工作了。
5. **回归测试**：确认视觉无差异。

### 迁移示例

迁移前：

\`\`\`scss
%card { background: #fff; border-radius: 8px; padding: 16px; }
.product-card { @extend %card; /* ... */ }
.user-card { @extend %card; /* ... */ }
\`\`\`

迁移后：

\`\`\`scss
@mixin card { background: #fff; border-radius: 8px; padding: 16px; }
.product-card { @include card; /* ... */ }
.user-card { @include card; /* ... */ }
\`\`\`

行为几乎一致，仅输出方式从「合并选择器」变成「复制声明」。

### 何时保留 @extend

并非所有 \`@extend\` 都该迁移。以下场景保留 \`@extend\` 反而更好：

- **a11y 工具类**：\`%visually-hidden\`、\`%sr-only\` 这类纯结构样式，无参数、多处共享，继承输出更紧凑。
- **clearfix 等结构技巧**：固定不变、无变体。
- **明确语义 is-a 关系**：且确认基类不会出现在大量复合选择器中。

迁移的核心判断仍是那句：**有参数或跨媒体查询 → 混入；纯静态 is-a → 可保留继承。**

---

## 补充三：@extend 的常见错误与排查

### "You may not @extend an outer selector from within @media"

原因：在 \`@media\` 内 \`@extend\` 了外部选择器。解决：改用混入，或把被继承的样式也放进同一个 \`@media\` 内。

### 选择器数量爆炸

现象：编译产物里出现超长的逗号分隔选择器组。原因：基类被用在很多复合选择器里，继承者被插入每一处。解决：改用占位符（不被复合选择器引用），或改用混入。

### 继承了意外的样式

现象：某个类莫名多了几条声明。原因：它 \`@extend\` 的选择器在别处有额外规则（包括后代选择器），全部被带过来了。排查：全局搜索被继承的选择器，检查所有出现位置。

### 循环继承

\`\`\`scss
.a { @extend .b; }
.b { @extend .a; }   // 循环！
\`\`\`

Sass 会检测到循环并报错。解决：重新设计继承关系，打破环。

### 继承了带 !important 的声明

\`@extend\` 会继承 \`!important\` 声明，且继承者自身的 \`!important\` 优先级规则较复杂。一般避免在被继承的基类里写 \`!important\`，以免继承链上出现难以预期的覆盖。

---

## 继承的输出体积与可维护性

\`@extend\` 最大的卖点"DRY（不重复）"同时也是它最大的风险。当你 \`@extend\` 一个被多处使用的类时，Sass 会把继承者追加到**所有**出现该类的选择器组里，导致选择器组爆炸。

### 选择器膨胀实例

\`\`\`scss
.button { padding: 8px 16px; }
.header .button { font-size: 14px; }
.footer .button { font-size: 12px; }
.sidebar .button { color: #333; }

// 现在 .btn-primary 继承 .button
.btn-primary { @extend .button; background: blue; }
\`\`\`

输出：

\`\`\`css
.button, .btn-primary { padding: 8px 16px; }
.header .button, .header .btn-primary { font-size: 14px; }
.footer .button, .footer .btn-primary { font-size: 12px; }
.sidebar .button, .sidebar .btn-primary { color: #333; }
.btn-primary { background: blue; }
\`\`\`

原本 4 条规则变成了 4 条**更长的**规则，选择器组里多了 \`.btn-primary\`。如果再有 \`.btn-secondary\`、\`.btn-danger\` 都 \`@extend .button\`，每个选择器组会不断膨胀。在大项目里，这会让 CSS 体积**不降反升**。

### 占位符能缓解但不能根治

用 \`%placeholder\` 替代实体类，可以避免被无关选择器牵连：

\`\`\`scss
%button-base { padding: 8px 16px; }   // 不输出
.btn-primary { @extend %button-base; background: blue; }
.btn-danger  { @extend %button-base; background: red; }
\`\`\`

输出干净：

\`\`\`css
.btn-primary, .btn-danger { padding: 8px 16px; }
.btn-primary { background: blue; }
.btn-danger { background: red; }
\`\`\`

但一旦继承链变深（A extends B extends C），或者继承者很多，选择器组仍会变长。**经验法则：占位符继承不超过 2 层，继承者不超过 10 个**。

---

## @extend 的未来：还值得用吗

社区趋势是**逐渐弃用 \`@extend\`，改用 \`@mixin\`**。原因：

1. **CSS 体积**：\`@mixin\` 复制声明，看似重复，但每条规则独立， gzip 压缩后体积差异很小；\`@extend\` 拼长选择器组，反而难压缩。
2. **可维护性**：\`@mixin\` 的来源清晰（在调用处），\`@extend\` 的来源隐式（要全局搜索谁继承了谁），调试困难。
3. **可移植性**：\`@mixin\` 输出独立规则，可以跨文件移动；\`@extend\` 依赖被继承者的作用域，移动后可能失效。
4. **工具支持**：PostCSS、Tailwind、CSS Modules 等现代工具对 \`@extend\` 支持不佳，\`@mixin\` 更通用。

### 何时仍可用 @extend

- **语义明确的单层继承**：如 \%visually-hidden、%clearfix 这种工具类，继承者少且稳定。
- **需要严格 DRY 的设计系统**：且团队约定好了继承规范。
- **小型项目**：CSS 体积不是瓶颈时。

其余场景，**优先用 \`@mixin\`**。这也是 Bootstrap 5、Tailwind 等主流框架的选择。

---

## 最终选型建议

| 需求 | 推荐方案 | 理由 |
| --- | --- | --- |
| 复用一组声明（按钮样式、卡片样式） | \`@mixin\` | 输出独立、可调试、易维护 |
| 共享工具类（clearfix、sr-only） | \`%placeholder\` + \`@extend\` | 语义清晰、零冗余 |
| 动态参数化样式 | \`@mixin\` + 参数 | \`@extend\` 不支持参数 |
| 批量生成工具类 | \`@each\` + \`@mixin\` | 数据驱动、可控 |
| 跨组件共享基础结构 | \`@mixin\` 或组合 \`@use\` | 避免继承链耦合 |

**一句话总结**：把 \`@extend\` 当作"语义工具"（共享稳定的工具类），把 \`@mixin\` 当作"样式工厂"（参数化批量产出）。两者各司其职，但新项目应以 \`@mixin\` 为主。

下面是本章可运行示例，演示占位符继承、链式继承、\`!optional\`，并与混入方案做对比，全部应用到 demo 元素上。
`,
    code: `// ============================================================
// 第 4 章演示代码：继承 @extend
// 演示 @extend / %placeholder / 链式继承 / !optional
// ============================================================

@use "sass:color";

// ---------- 1. 占位符：消息基类 ----------
%message-base {
  padding: 12px 16px;
  border-radius: 4px;
  border: 1px solid transparent;
  font-size: 14px;
  line-height: 1.5;
}

// ---------- 2. 链式继承：按钮基类 → 变体 ----------
%button-base {
  display: inline-block;
  padding: 10px 20px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

%button-primary {
  @extend %button-base;
  background-color: #3498db;
  color: #ffffff;

  &:hover {
    background-color: color.adjust(#3498db, $lightness: -8%);
  }
}

%button-danger {
  @extend %button-base;
  background-color: #e74c3c;
  color: #ffffff;

  &:hover {
    background-color: color.adjust(#e74c3c, $lightness: -8%);
  }
}

// ---------- 3. 静态共享占位符：卡片表面 ----------
%surface {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

// ---------- 4. 视觉隐藏占位符（经典 a11y 用法） ----------
%visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// ---------- 5. 清除浮动占位符 ----------
%clearfix {
  &::after {
    content: "";
    display: table;
    clear: both;
  }
}

// ============================================================
// 应用到通用 demo 元素
// ============================================================
.sass-demo {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  padding: 16px;
  background: #f7f8fa;
  color: #333;

  // 按钮：通过 @extend 占位符获得样式
  .btn {
    margin: 4px;

    &.btn-primary {
      @extend %button-primary;

      &:active {
        transform: translateY(1px);
      }
    }

    &.btn-danger {
      @extend %button-danger;
    }

    // !optional 演示：继承一个不存在的占位符，静默跳过
    &.btn-ghost {
      @extend %button-base;
      background: transparent;
      border-color: #3498db;
      color: #3498db;

      &:hover {
        background: #3498db;
        color: #ffffff;
      }
    }

    // 继承可能不存在的类，用 !optional 避免报错
    &.btn-optional {
      @extend %button-base;
      @extend %maybe-undefined !optional;
      background: #95a5a6;
      color: #ffffff;
    }
  }

  // 消息提示：继承 %message-base
  .alert {
    margin-bottom: 12px;

    &.alert-success {
      @extend %message-base;
      background: #dff0d8;
      border-color: #d6e9c6;
      color: #3c763d;
    }

    &.alert-error {
      @extend %message-base;
      background: #f2dede;
      border-color: #ebccd1;
      color: #a94442;
    }

    &.alert-warning {
      @extend %message-base;
      background: #fcf8e3;
      border-color: #faebcc;
      color: #8a6d3b;
    }
  }

  // 卡片：继承 %surface 获得共享表面样式
  .card {
    @extend %surface;
    margin-bottom: 12px;
    padding: 16px;

    &.card-elevated {
      @extend %surface;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .card-title {
      margin: 0 0 8px;
      font-size: 18px;
      color: #2c3e50;
    }

    .card-text {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: #555;
    }

    // 视觉隐藏的标题（给屏幕阅读器用）
    .sr-only {
      @extend %visually-hidden;
    }
  }

  // 列表：继承 %surface + %clearfix
  .list {
    @extend %surface;
    @extend %clearfix;
    list-style: none;
    margin: 0 0 12px;
    padding: 8px 12px;

    li {
      padding: 8px 4px;
      border-bottom: 1px solid #f0f0f0;
      font-size: 13px;

      &:last-child {
        border-bottom: none;
      }

      &.list-item-highlight {
        // 链式：再继承一个带左侧色条的占位符
        @extend %message-base;
        background: #fff8e1;
        border-color: #ffe082;
        border-left: 4px solid #f39c12;
      }
    }
  }

  // 网格：继承 %clearfix
  .grid {
    @extend %clearfix;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 12px;

    .grid-item {
      @extend %surface;
      width: 110px;
      height: 110px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #9b59b6;
      color: #ffffff;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(155, 89, 182, 0.3);
    }
  }

  // 表单：继承 %surface
  .form {
    @extend %surface;
    padding: 16px;

    .form-row {
      margin-bottom: 12px;

      label {
        display: block;
        margin-bottom: 4px;
        font-size: 13px;
        color: #555;
      }

      input,
      select,
      textarea {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;

        &:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        }
      }
    }
  }

  // 按钮组：演示继承后选择器合并的紧凑性
  .btn-group {
    @extend %clearfix;
    display: inline-block;

    .btn {
      margin: 0;
      border-radius: 0;
      float: left;

      &:first-child {
        border-radius: 6px 0 0 6px;
      }

      &:last-child {
        border-radius: 0 6px 6px 0;
      }
    }
  }
}
`,
  },
];
