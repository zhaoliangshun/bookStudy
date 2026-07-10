// =============================================================
// Sass 交互式教程 - 第 3 批章节（进阶技巧）
// -------------------------------------------------------------
// 本文件包含以下 4 章（group 统一为 "进阶技巧"）：
//   1. sass-data-structures — 列表与 Map
//   2. sass-color           — 颜色系统
//   3. sass-responsive      — 响应式与媒体查询
//   4. sass-architecture    — 项目架构与最佳实践
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（统一为"进阶技巧"）
//   content : Markdown 格式的详细讲解（文字量大，每章 ≥ 600 行）
//   code    : 纯 SCSS 代码，由服务端 sass 包编译为 CSS 后在 iframe 预览
//
// 编写约束：
//   - code 字段为纯 SCSS，不含 HTML，不含反引号，不含 \${ 插值
//   - Sass 插值统一使用 #{$var}
//   - 前端预览模板会自动追加通用 demo HTML（含 .sass-demo 容器及
//     .btn / .card / .list / .grid / .form / .alert / .badge 等元素）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：列表与 Map
  // =========================================================
  {
    id: "sass-data-structures",
    group: "进阶技巧",
    icon: "🗂️",
    title: "列表与 Map",
    content: `## 列表与 Map：Sass 的数据结构

Sass 中的列表（List）和映射（Map）是组织数据的核心结构。列表像数组，是有序的值集合；映射像对象/字典，是键值对集合。掌握它们，你就能用数据驱动样式——一个 Map 就能生成整套按钮变体、整套间距工具类、多套主题。这是 Sass 从「写样式」升级到「工程化样式」的关键一步。

### 为什么需要数据结构

写纯 CSS 时，颜色、间距、断点散落在各处，改一处要全局搜索替换。Sass 的 List/Map 让你把相关数据集中管理，再用循环批量生成规则。好处有三：

1. **单一数据源**：所有颜色/间距/断点集中在一个 Map 里，修改只改一处
2. **批量生成**：一个 @each 循环就能产出几十个工具类，告别复制粘贴
3. **可维护性**：新增一个主题色只需往 Map 加一行，对应样式自动生成

### List 与 Map 的关系

Map 在底层其实就是「键值对列表」，很多列表函数对 Map 也适用。理解了 List，再看 Map 会非常自然。

\`\`\`
Sass 数据结构关系图

  ┌─────────────────────────────────────┐
  │            Sass 数据结构              │
  ├──────────────────┬──────────────────┤
  │      List 列表     │      Map 映射     │
  │  有序值集合        │  键值对集合       │
  │  (a b c)          │  (k1: v1, k2: v2) │
  ├──────────────────┼──────────────────┤
  │  空格/逗号分隔     │  逗号分隔         │
  │  可嵌套           │  可嵌套           │
  │  length/nth/join  │  map-get/keys    │
  └──────────────────┴──────────────────┘
\`\`\`

## 一、List 列表详解

### 1.1 创建列表

列表有两种分隔符：空格和逗号。括号 \`()\` 用于分组和明确意图。

| 写法 | 类型 | 说明 |
| --- | --- | --- |
| \`1px 2px 3px\` | 空格分隔列表 | 常用于多值属性如 margin、box-shadow |
| \`red, green, blue\` | 逗号分隔列表 | 常用于颜色集合 |
| \`()\` | 空列表 | 长度为 0 |
| \`("only")\` | 单元素列表 | 括号强制其为列表类型 |
| \`(1 2) (3 4)\` | 嵌套列表 | 每个括号是一个子列表 |

\`\`\`scss
// 空格分隔：常用于多值属性
$shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
$margin: 10px 20px;

// 逗号分隔：常用于颜色、字体栈集合
$colors: red, green, blue;
$fonts: "Helvetica", "Arial", sans-serif;

// 空列表
$empty: ();

// 单元素列表：用括号明确它是列表而非单个值
$single: ("only-one");
\`\`\`

> 💡 **关键点**：\`(a b c)\` 和 \`a b c\` 几乎等价。括号主要用来：①创建空列表 \`()\`；②创建单元素列表；③在嵌套场景里明确分组边界，避免歧义。

### 1.2 分隔符

列表的分隔符用 \`list-separator()\` 函数查询，返回 \`space\` 或 \`comma\`。

\`\`\`scss
$a: 1 2 3;
$b: 1, 2, 3;
list-separator($a); // space
list-separator($b); // comma
\`\`\`

分隔符会影响合并、追加时的结果。一般来说：**多值属性（margin/padding/box-shadow/transform）用空格分隔，枚举集合（颜色、断点列表）用逗号分隔**。

### 1.3 空列表

空列表 \`()\` 长度为 0，常用作累加器的初始值：

\`\`\`scss
$accum: ();
$accum: append($accum, "a");
$accum: append($accum, "b");
// $accum 现在是 ("a", "b")
\`\`\`

> ⚠️ 对空列表调用 \`nth()\` 会报错。遍历前先用 \`length() > 0\` 判断，或确保列表非空。

### 1.4 嵌套列表

列表可以嵌套，用括号分组。典型场景：成对数据、矩阵。

\`\`\`scss
// 成对的「名字 + 值」
$pairs: ("sm" 640px) ("md" 768px) ("lg" 1024px);

// 二维矩阵
$matrix: (1 2 3) (4 5 6) (7 8 9);

// 取第一个子列表的第 2 个元素
nth(nth($pairs, 1), 2); // 640px
\`\`\`

不过实际项目中，**成对数据更推荐用 Map**（键值对天然清晰），嵌套列表主要用于顺序敏感的二维结构。

## 二、List 操作函数

### 2.1 length() — 长度

\`\`\`scss
$colors: red, green, blue;
length($colors); // 3
length(());      // 0
\`\`\`

\`length()\` 对 Map 返回键值对的数量。

### 2.2 nth($list, $n) — 取值

索引从 **1** 开始（不是 0！），负数从末尾倒数。

\`\`\`scss
$colors: red, green, blue, yellow;
nth($colors, 1);  // red   （第一个）
nth($colors, -1); // yellow（最后一个）
nth($colors, 2);  // green
\`\`\`

> ⚠️ 索引越界会**直接编译报错**。用 \`length()\` 先校验，或确保索引在合法范围。

### 2.3 set-nth($list, $n, $value) — 修改（返回新列表）

Sass 列表是**不可变**的，\`set-nth\` 返回新列表，原列表不变。

\`\`\`scss
$colors: red, green, blue;
$new: set-nth($colors, 2, emerald);
// $colors 仍是 (red, green, blue)
// $new 是 (red, emerald, blue)
\`\`\`

### 2.4 index($list, $value) — 查找位置

返回值在列表中的位置（1 开始），找不到返回 \`null\`。

\`\`\`scss
$colors: red, green, blue;
index($colors, blue);  // 3
index($colors, pink);  // null
\`\`\`

### 2.5 join($list1, $list2, $separator) — 合并

\`\`\`scss
$a: 1 2;
$b: 3 4;
join($a, $b);              // 1 2 3 4（默认沿用第一段分隔符 space）
join($a, $b, comma);       // 1, 2, 3, 4
join((1, 2), (3, 4));      // 1, 2, 3, 4（第一段是 comma）
\`\`\`

第三个参数可指定分隔符：\`space\` / \`comma\` / \`auto\`（默认）。

### 2.6 append($list, $val, $separator) — 追加

\`\`\`scss
$colors: red, green;
append($colors, blue);        // red, green, blue
append($colors, blue, space); // red green blue（强制空格分隔）
\`\`\`

### 2.7 其他列表函数

| 函数 | 作用 | 示例 |
| --- | --- | --- |
| \`list-separator($list)\` | 返回分隔符 | \`space\` / \`comma\` |
| \`is-bracketed($list)\` | 是否方括号列表 | \`[1 2 3]\` 为 true |
| \`zip($l1, $l2...)\` | 拉链合并多个列表 | 多列配对 |

\`\`\`scss
// zip 把多个列表按位置配对成嵌套列表
$names: sm md lg;
$sizes: 640px 768px 1024px;
$pairs: zip($names, $sizes);
// (("sm" 640px) ("md" 768px) ("lg" 1024px))
\`\`\`

### 2.8 函数速查表

\`\`\`
length($list)            → 数量
nth($list, $n)           → 第 n 个
set-nth($list, $n, $v)   → 新列表
index($list, $v)         → 位置或 null
join($l1, $l2, $sep)     → 合并
append($list, $v, $sep)  → 追加
list-separator($list)    → space / comma
zip($l1, $l2, ...)       → 拉链配对
\`\`\`

## 三、Map 映射详解

### 3.1 创建 Map

Map 用 \`()\` 包裹，键值对用 \`:\` 分隔，逗号结尾。键通常是标识符或字符串，值可以是任意类型（包括另一个 Map）。

\`\`\`scss
$theme-colors: (
  primary: #3b82f6,
  secondary: #64748b,
  success: #22c55e,
  warning: #f59e0b,
  danger: #ef4444,
);
\`\`\`

> 💡 Map 的键**唯一**，后写的同名键会覆盖前者。键不带引号时是标识符，带引号是字符串，两者在大多数情况下等价。

### 3.2 map-get($map, $key) — 取值

\`\`\`scss
$primary: map-get($theme-colors, primary); // #3b82f6
\`\`\`

找不到键返回 \`null\`（不报错）。也可用 \`map.get\`（需 \`@use "sass:map"\`）。

### 3.3 map-keys($map) / map-values($map)

返回所有键/所有值，结果是**列表**。

\`\`\`scss
$keys: map-keys($theme-colors);   // (primary, secondary, success, ...)
$vals: map-values($theme-colors); // (#3b82f6, #64748b, #22c55e, ...)
\`\`\`

### 3.4 map-has-key($map, $key) — 判断键存在

\`\`\`scss
map-has-key($theme-colors, primary); // true
map-has-key($theme-colors, dark);    // false
\`\`\`

常用于在 mixin 里做防御性检查，避免取到 \`null\`。

### 3.5 map-merge($map1, $map2) — 合并/覆盖

返回新 Map，相同键以第二个为准。也常用于「往 Map 加一项」。

\`\`\`scss
$extended: map-merge($theme-colors, (
  dark: #1e293b,
  light: #f8fafc,
));
\`\`\`

> 💡 \`map-merge\` 是「更新 Map」的标准方式。因为 Map 不可变，你不能直接 \`$map.key: value\`，只能用 \`map-merge\` 生成新 Map 再赋值。

### 3.6 map-remove($map, $keys...) — 移除键

\`\`\`scss
$trimmed: map-remove($theme-colors, info, danger);
\`\`\`

返回移除指定键后的新 Map，原 Map 不变。

### 3.7 函数速查表

\`\`\`
map-get($map, $key)        → 取值
map-keys($map)             → 键列表
map-values($map)           → 值列表
map-has-key($map, $key)    → 布尔
map-merge($m1, $m2)        → 合并/新增/覆盖
map-remove($map, $keys...) → 移除键
\`\`\`

## 四、用 Map 管理设计体系

这是 List/Map 最有价值的应用：把设计令牌结构化。

### 4.1 主题色 Map

\`\`\`scss
$theme-colors: (
  primary: #3b82f6,
  success: #22c55e,
  warning: #f59e0b,
  danger: #ef4444,
  info: #06b6d4,
);
\`\`\`

### 4.2 间距体系 Map

\`\`\`scss
$spacing: (
  0: 0,
  1: 0.25rem,
  2: 0.5rem,
  3: 0.75rem,
  4: 1rem,
  6: 1.5rem,
  8: 2rem,
  12: 3rem,
  16: 4rem,
);
\`\`\`

> 这就是 Tailwind 风格的间距刻度。用 Map 存储后，\`@each\` 一行循环就能生成所有 \`.m-1\` \`.p-4\` \`.mt-8\` 工具类。

### 4.3 断点 Map

\`\`\`scss
$breakpoints: (
  sm: 640px,
  md: 768px,
  lg: 1024px,
  xl: 1280px,
);
\`\`\`

### 4.4 圆角 / 阴影 / 字号 Map

\`\`\`scss
$radius: (sm: 4px, md: 8px, lg: 12px, full: 9999px);
$shadows: (sm: 0 1px 2px rgba(0,0,0,.05), md: 0 4px 6px rgba(0,0,0,.1));
$font-sizes: (xs: 0.75rem, sm: 0.875rem, base: 1rem, lg: 1.125rem, xl: 1.25rem);
\`\`\`

把所有令牌都 Map 化，你的样式系统就有了「单一数据源」。

## 五、@each 遍历

\`@each\` 是连接「数据」与「样式」的桥梁。它能遍历列表和 Map。

### 5.1 遍历列表

\`\`\`scss
$columns: 1 2 3 4 6 12;
@each $col in $columns {
  .grid-col-#{$col} {
    grid-template-columns: repeat(#{$col}, 1fr);
  }
}
\`\`\`

### 5.2 遍历 Map（解构键值）

\`\`\`scss
@each $name, $color in $theme-colors {
  .btn-#{$name} {
    background-color: $color;
    color: white;
  }
}
\`\`\`

这会生成 \`.btn-primary\` \`.btn-success\` 等。**新增一个主题色只需往 Map 加一行，按钮变体自动出现**——这就是数据驱动的威力。

### 5.3 遍历间距生成工具类

\`\`\`scss
@each $key, $value in $spacing {
  .m-#{$key}  { margin: $value; }
  .p-#{$key}  { padding: $value; }
  .mt-#{$key} { margin-top: $value; }
  .pt-#{$key} { padding-top: $value; }
}
\`\`\`

### 5.4 插值 #{$var}

循环里要把变量拼进选择器或属性名，必须用插值 \`#{$var}\`：

\`\`\`scss
@each $name, $color in $theme-colors {
  .text-#{$name} { color: $color; }   // 选择器插值
  .bg-#{$name}   { background: $color; }
}
\`\`\`

> ⚠️ Sass 插值是 \`#{$var}\`，**不是** \`\${var}\`（那是 JS 模板字符串语法，Sass 不认）。

## 六、嵌套 Map 实战：多主题

Map 的值可以是另一个 Map，形成嵌套结构。多主题场景非常典型。

\`\`\`scss
$themes: (
  light: (
    bg: #ffffff,
    text: #1e293b,
    border: #e2e8f0,
    accent: #3b82f6,
  ),
  dark: (
    bg: #0f172a,
    text: #f1f5f9,
    border: #334155,
    accent: #60a5fa,
  ),
);
\`\`\`

### 6.1 读取嵌套值

先取内层 Map，再取值：

\`\`\`scss
$light-bg: map-get(map-get($themes, light), bg); // #ffffff
\`\`\`

### 6.2 嵌套 @each 生成多主题样式

\`\`\`scss
@each $theme-name, $palette in $themes {
  .theme-#{$theme-name} {
    background-color: map-get($palette, bg);
    color: map-get($palette, text);
    border: 1px solid map-get($palette, border);
    .accent { color: map-get($palette, accent); }
  }
}
\`\`\`

生成 \`.theme-light\` 和 \`.theme-dark\` 两套样式。要加 \`sepia\` 主题？往 Map 加一项即可。

## 七、列表生成网格

用列表驱动网格列数工具类：

\`\`\`scss
$grid-cols: 1 2 3 4 6 12;
@each $col in $grid-cols {
  .cols-#{$col} {
    display: grid;
    grid-template-columns: repeat(#{$col}, 1fr);
  }
}
\`\`\`

也可以用 \`@for\` 生成 1~12 的连续列数。列表方式适合「只需要几个常用列数」的场景，更精简。

## 八、Map 驱动的组件变体

这是企业级 Sass 最常见的模式：一个 Map + 一个 @each = 一整套组件变体。

\`\`\`scss
$button-variants: (
  primary: #3b82f6,
  success: #22c55e,
  warning: #f59e0b,
  danger: #ef4444,
);

@each $name, $color in $button-variants {
  .btn-#{$name} {
    background: $color;
    color: white;
    &:hover  { background: mix(black, $color, 15%); }
    &:active { background: mix(black, $color, 30%); }
  }
}
\`\`\`

### 8.1 更复杂的变体：带尺寸

用嵌套 Map 同时管理颜色和尺寸：

\`\`\`scss
$buttons: (
  primary: (bg: #3b82f6, text: white),
  outline: (bg: transparent, text: #3b82f6),
);
@each $name, $opts in $buttons {
  .btn-#{$name} {
    background: map-get($opts, bg);
    color: map-get($opts, text);
  }
}
\`\`\`

## 九、列表 vs Map：如何选择

| 场景 | 用 List | 用 Map |
| --- | --- | --- |
| 顺序敏感的枚举（列数 1,2,3,4） | ✅ | ❌ |
| 键值对（颜色名→颜色值） | ❌ | ✅ |
| 多值属性（margin: 1 2 3 4） | ✅ | ❌ |
| 设计令牌体系（间距/断点/色板） | ❌ | ✅ |
| 成对数据（名字+值） | 可用 zip | ✅ 更清晰 |

**经验法则**：只要存在「名字→值」的映射关系，就用 Map；只是「一组同类值」，用 List。

## 十、遍历技巧与陷阱

### 10.1 索引遍历 @for

需要索引时用 \`@for\`：

\`\`\`scss
@for $i from 1 through length($colors) {
  .item-#{$i} { color: nth($colors, $i); }
}
\`\`\`

### 10.2 陷阱：nth 越界

\`\`\`scss
// ❌ 错误：列表只有 3 项，取第 4 项会编译报错
nth((a b c), 4);
\`\`\`

### 10.3 陷阱：Map 遍历顺序

Sass Map **保持插入顺序**（Dart Sass 1.x 起），所以你可以依赖遍历顺序来控制输出顺序。

### 10.4 陷阱：空值过滤

Map 里可能有 \`null\` 值。遍历时可跳过：

\`\`\`scss
@each $name, $color in $theme-colors {
  @if $color {
    .text-#{$name} { color: $color; }
  }
}
\`\`\`

## 十一、综合示例：用 Map 构建完整工具类系统

把上面的知识组合起来，构建一个迷你 Tailwind：

\`\`\`scss
$colors: (primary: #3b82f6, danger: #ef4444);
$spacing: (1: 0.25rem, 2: 0.5rem, 4: 1rem);

// 颜色工具类
@each $name, $color in $colors {
  .text-#{$name} { color: $color; }
  .bg-#{$name}   { background-color: $color; }
}

// 间距工具类
@each $key, $val in $spacing {
  .m-#{$key}  { margin: $val; }
  .p-#{$key}  { padding: $val; }
  .mt-#{$key} { margin-top: $val; }
  .mb-#{$key} { margin-bottom: $val; }
}
\`\`\`

几十行 SCSS 就生成了上百条 CSS 规则，且全部由数据驱动。

## 十二、最佳实践

1. **令牌 Map 化**：颜色、间距、断点、圆角、阴影、字号全部用 Map 集中管理
2. **单一数据源**：每个令牌只在一处定义，其他地方引用
3. **键名用语义**：用 \`primary\` 而非 \`blue\`，这样换色板时不用改键名
4. **不可变思维**：List/Map 不可变，操作都返回新值，记得重新赋值
5. **防御性取值**：mixin 里用 \`map-has-key\` 校验，避免 \`null\` 污染输出
6. **插值用 #{}**：拼选择器/属性名时只能用 \`#{$var}\`
7. **避免过度生成**：不是所有变体都要循环生成，按需用 \`@use\` 的命名空间控制
8. **命名键用连字符**：\`text-muted\` 比 \`textMuted\` 更符合 CSS 习惯

## 十三、常见错误

### 错误 1：用 \${} 插值

\`\`\`scss
// ❌ Sass 不支持 \${}
.btn-\${$name} { }

// ✅ 正确：用 #{}
.btn-#{$name} { }
\`\`\`

### 错误 2：直接修改 Map

\`\`\`scss
// ❌ 不能这样赋值
$theme-colors(primary): #000;

// ✅ 用 map-merge
$theme-colors: map-merge($theme-colors, (primary: #000));
\`\`\`

### 错误 3：忘记索引从 1 开始

\`\`\`scss
$colors: red, green, blue;
nth($colors, 0); // ❌ 报错，索引最小是 1
nth($colors, 1); // ✅ red
\`\`\`

### 错误 4：遍历空列表不判断

\`\`\`scss
$list: ();
@each $item in $list {
  // 不会执行，安全
}
// 但手动 nth 前要判断 length
\`\`\`

## 十四、小结

- **List** 是有序值集合，用 \`length/nth/join/append\` 操作，索引从 1 开始
- **Map** 是键值对集合，用 \`map-get/keys/values/merge/remove\` 操作
- **@each** 是数据驱动样式的核心，能遍历列表和 Map
- **嵌套 Map** 适合多主题、复杂变体场景
- **设计令牌 Map 化** 是构建可维护样式系统的基石

下面这段 SCSS 代码综合演示了列表与 Map 的全部用法，编译后会生成网格、按钮变体、间距工具类和多主题样式，可在预览区观察效果。`,
    code: `// ============================================================
// 第一章代码：列表与 Map 全面实战
// ============================================================
@use "sass:color";

// ---- 1. 列表 List 基础 ----
// 空格分隔列表（常用于多值属性）
$sizes-space: 4px 8px 16px 24px;
// 逗号分隔列表（常用于枚举集合）
$colors-list: red, green, blue, yellow;
// 单元素列表（括号强制其为列表类型）
$single: ("only");
// 空列表
$empty: ();
// 嵌套列表：用括号分组
$matrix: (1 2 3) (4 5 6) (7 8 9);
$pairs: ("sm" 640px) ("md" 768px) ("lg" 1024px);

// length：获取列表长度
$len-colors: length($colors-list); // 4
$len-empty: length($empty);        // 0

// nth：按索引取值（索引从 1 开始，负数从末尾算）
$first-color: nth($colors-list, 1); // red
$last-color: nth($colors-list, -1); // yellow

// set-nth：返回新列表（原列表不变）
$updated: set-nth($colors-list, 2, emerald);

// index：查找元素位置（找不到返回 null）
$pos: index($colors-list, blue); // 3

// join：合并两个列表（默认沿用第一段分隔符）
$merged: join($sizes-space, $colors-list);
$merged-comma: join($sizes-space, $colors-list, comma);

// append：追加元素
$appended: append($colors-list, purple);
$appended-space: append($colors-list, purple, space);

// list-separator：返回分隔符 space / comma
$sep-1: list-separator($sizes-space); // space
$sep-2: list-separator($colors-list); // comma

// ---- 2. Map 基础：主题色 ----
$theme-colors: (
  primary: #3b82f6,
  secondary: #64748b,
  success: #22c55e,
  warning: #f59e0b,
  danger: #ef4444,
  info: #06b6d4,
);

// map-get：取值
$primary: map-get($theme-colors, primary); // #3b82f6
// map-keys / map-values：返回列表
$all-keys: map-keys($theme-colors);
$all-values: map-values($theme-colors);
// map-has-key：判断键是否存在
$has-primary: map-has-key($theme-colors, primary); // true
$has-dark: map-has-key($theme-colors, dark);       // false
// map-merge：合并（也用于新增/覆盖）
$extended: map-merge($theme-colors, (dark: #1e293b, light: #f8fafc));
// map-remove：移除键（返回新 Map）
$trimmed: map-remove($theme-colors, info, danger);

// ---- 3. 嵌套 Map：多主题 ----
$themes: (
  light: (
    bg: #ffffff,
    text: #1e293b,
    border: #e2e8f0,
    accent: #3b82f6,
  ),
  dark: (
    bg: #0f172a,
    text: #f1f5f9,
    border: #334155,
    accent: #60a5fa,
  ),
);
// 读取嵌套值：先取内层 Map 再取值
$light-bg: map-get(map-get($themes, light), bg);
$dark-text: map-get(map-get($themes, dark), text);

// ---- 4. 用 Map 管理间距体系 ----
$spacing: (
  0: 0,
  1: 0.25rem,
  2: 0.5rem,
  3: 0.75rem,
  4: 1rem,
  6: 1.5rem,
  8: 2rem,
  12: 3rem,
  16: 4rem,
);

// ---- 5. 断点 Map ----
$breakpoints: (
  sm: 640px,
  md: 768px,
  lg: 1024px,
  xl: 1280px,
);

// ---- 6. @each 遍历列表生成网格列数工具类 ----
$columns: 1 2 3 4 6 12;
@each $col in $columns {
  .grid-col-#{$col} {
    display: grid;
    grid-template-columns: repeat(#{$col}, 1fr);
    gap: 8px;
  }
}

// ---- 7. @each 遍历 Map 生成按钮变体 ----
@each $name, $color in $theme-colors {
  .btn-#{$name} {
    display: inline-block;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background-color: $color;
    color: white;
    cursor: pointer;
    &:hover {
      background-color: color.mix(black, $color, 15%);
    }
    &:active {
      background-color: color.mix(black, $color, 30%);
    }
  }
}

// ---- 8. @each 遍历间距 Map 生成 margin/padding 工具类 ----
@each $key, $value in $spacing {
  .m-#{$key}  { margin: $value; }
  .p-#{$key}  { padding: $value; }
  .mt-#{$key} { margin-top: $value; }
  .pt-#{$key} { padding-top: $value; }
  .mb-#{$key} { margin-bottom: $value; }
  .pb-#{$key} { padding-bottom: $value; }
}

// ---- 9. 嵌套 Map 遍历：多主题样式 ----
@each $theme-name, $palette in $themes {
  .theme-#{$theme-name} {
    background-color: map-get($palette, bg);
    color: map-get($palette, text);
    border: 1px solid map-get($palette, border);
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 8px;
    .accent {
      color: map-get($palette, accent);
      font-weight: bold;
    }
  }
}

// ---- 10. 嵌套列表遍历：行列配对 ----
@each $pair in $pairs {
  $name: nth($pair, 1);
  $size: nth($pair, 2);
  .container-#{$name} {
    max-width: $size;
    margin: 0 auto;
  }
}

// ---- 11. 列表遍历生成文字颜色工具类 ----
@each $name, $color in $theme-colors {
  .text-#{$name} { color: $color; }
  .bg-#{$name}   { background-color: $color; }
}

// ---- 12. 综合应用：演示容器样式 ----
.sass-demo {
  font-family: system-ui, sans-serif;
  padding: 16px;
  background: map-get(map-get($themes, light), bg);
  color: map-get(map-get($themes, light), text);

  .card {
    border-radius: 8px;
    padding: map-get($spacing, 4);
    margin-bottom: map-get($spacing, 3);
    border: 1px solid map-get(map-get($themes, light), border);
    background: #f8fafc;
  }
  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    li {
      padding: map-get($spacing, 2) map-get($spacing, 3);
      border-bottom: 1px solid #e2e8f0;
    }
  }
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    background: map-get($theme-colors, primary);
    color: white;
  }
  .btn {
    background: map-get($theme-colors, primary);
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
}
`,
  },

  // =========================================================
  // 第二章：颜色系统
  // =========================================================
  {
    id: "sass-color",
    group: "进阶技巧",
    icon: "🌈",
    title: "颜色系统",
    content: `## 颜色系统：用 Sass 构建科学的调色板

颜色是 UI 设计的灵魂。纯 CSS 里调色靠手动试色，而 Sass 提供了一整套颜色函数，让你能从「一个主色」数学地推导出整套色阶、hover/active 状态色、无障碍对比色、暗黑模式色板。本章系统讲解 Sass 颜色体系。

### 颜色为什么需要「系统化」

随手写 \`color: #3b82f6\` 很快，但问题随之而来：

1. hover 用什么色？随便调暗一点？没有统一标准
2. 主色 50-900 色阶怎么来？手动列 10 个色值易不一致
3. 文字在背景上够清晰吗？无障碍对比度不达标
4. 暗黑模式色板怎么生成？又重写一遍？

Sass 颜色函数让这些问题都变成「公式计算」，可复现、可维护。

\`\`\`
Sass 颜色能力图谱

  ┌─────────────────────────────────────────────┐
  │              Sass 颜色系统                    │
  ├───────────┬───────────┬─────────────────────┤
  │  表示法    │  调整函数  │   系统化生成         │
  │  hex      │  lighten  │   50-900 色阶       │
  │  rgb      │  darken   │   hover/active       │
  │  hsl      │  adjust   │   对比度文字          │
  │  named    │  scale    │   暗黑模式色板        │
  │  hwb      │  mix      │   多主题派生          │
  └───────────┴───────────┴─────────────────────┘
\`\`\`

## 一、颜色表示法

### 1.1 十六进制 hex

\`\`\`scss
$c1: #3b82f6;       // 6 位
$c2: #3b82f680;     // 8 位（末 2 位是 alpha，0x80 ≈ 50%）
$c3: #fff;          // 3 位简写
\`\`\`

hex 最常用、最简洁，但**不便于计算**（要分解 R/G/B 通道）。

### 1.2 rgb / rgba

\`\`\`scss
$c1: rgb(59, 130, 246);
$c2: rgba(59, 130, 246, 0.5); // 50% 透明
$c3: rgb(59 130 246 / 50%);   // 现代空格 + 斜杠语法
\`\`\`

> 💡 现代语法 \`rgb(59 130 246 / 50%)\` 用空格和斜杠，取代逗号。Sass 输出 CSS 时会自动处理。

### 1.3 hsl / hsla（重点）

\`\`\`scss
$c1: hsl(217, 91%, 60%);       // 色相 217°，饱和度 91%，亮度 60%
$c2: hsla(217, 91%, 60%, 0.5);
$c3: hsl(217 91% 60% / 50%);   // 现代语法
\`\`\`

HSL 的三个分量有明确视觉含义：

| 分量 | 含义 | 范围 |
| --- | --- | --- |
| H（Hue 色相） | 颜色在色轮上的角度 | 0-360deg |
| S（Saturation 饱和度） | 颜色的鲜艳程度 | 0%-100% |
| L（Lightness 亮度） | 颜色的明暗 | 0%-100% |

### 1.4 HSL 为什么更适合调色板

调色板本质是「同一色相、不同亮度」。HSL 里只要固定 H 和 S，调 L 就能生成色阶，**直觉且可控**。而 hex/rgb 调亮度要同时改三个通道，难以保证色相一致。

\`\`\`
HSL 调色板生成原理（固定 H=217, S=91%）

  L=90%  ██████████  50   最浅
  L=80%  ██████████  100
  L=70%  ██████████  200
  L=60%  ██████████  300
  L=50%  ██████████  400
  L=40%  ██████████  500  基准
  L=30%  ██████████  600
  L=20%  ██████████  700
  L=15%  ██████████  800
  L=10%  ██████████  900  最深
\`\`\`

### 1.5 命名颜色

CSS 内置 140+ 命名颜色，如 \`cornflowerblue\` \`tomato\` \`rebeccapurple\`。方便原型，正式项目建议用 hex/hsl。

## 二、传统颜色函数（已废弃但仍可用）

> ⚠️ 下列全局函数在 Dart Sass 中**已废弃**（会产生告警），推荐用 \`sass:color\` 模块替代。但旧代码仍常见，需认识。

### 2.1 lighten / darken — 调明暗

\`\`\`scss
lighten(#3b82f6, 20%); // 变亮 20%
darken(#3b82f6, 20%);  // 变暗 20%
\`\`\`

### 2.2 adjust-hue — 调色相

\`\`\`scss
adjust-hue(#3b82f6, 60deg); // 色相 +60°
\`\`\`

### 2.3 saturate / desaturate — 调饱和度

\`\`\`scss
saturate(#3b82f6, 20%);   // 更鲜艳
desaturate(#3b82f6, 20%); // 更灰
\`\`\`

### 2.4 mix — 混合两色

\`\`\`scss
mix(red, blue, 50%);        // 红蓝各半
mix(black, #3b82f6, 15%);   // 主色混入 15% 黑 → 用于 hover
\`\`\`

### 2.5 transparentize / opacify — 调透明度

\`\`\`scss
transparentize(#3b82f6, 0.5); // alpha -0.5
opacify(rgba(#3b82f6, 0.3), 0.4); // alpha +0.4
\`\`\`

### 2.6 废弃对照表

| 废弃全局函数 | 推荐模块函数 |
| --- | --- |
| \`lighten($c, $n)\` | \`color.adjust($c, $lightness: $n)\` |
| \`darken($c, $n)\` | \`color.adjust($c, $lightness: -$n)\` |
| \`adjust-hue($c, $n)\` | \`color.adjust($c, $hue: $n)\` |
| \`saturate($c, $n)\` | \`color.adjust($c, $saturation: $n)\` |
| \`desaturate($c, $n)\` | \`color.adjust($c, $saturation: -$n)\` |
| \`transparentize($c, $n)\` | \`color.adjust($c, $alpha: -$n)\` |
| \`opacify($c, $n)\` | \`color.adjust($c, $alpha: $n)\` |

## 三、color 模块新语法（推荐）

\`\`\`scss
@use "sass:color";

$base: #3b82f6;
color.adjust($base, $lightness: 20%);   // 变亮
color.adjust($base, $lightness: -20%);  // 变暗
color.adjust($base, $hue: 60deg);       // 调色相
color.adjust($base, $saturation: 20%);  // 调饱和度
color.adjust($base, $alpha: -0.5);      // 调透明度
\`\`\`

\`color.adjust\` 用**命名参数**明确要调整哪个通道，可读性强，且能一次调多个：

\`\`\`scss
color.adjust($base, $lightness: 10%, $saturation: -10%);
\`\`\`

### 3.1 color.change — 直接设置

\`adjust\` 是「增减」，\`change\` 是「设为」：

\`\`\`scss
color.change($base, $alpha: 0.5); // alpha 设为 0.5
color.change($base, $hue: 0deg);  // 色相设为 0（红色）
\`\`\`

### 3.2 color.scale — 按比例缩放

\`scale\` 在「当前值」和「极值」之间按百分比移动，**比 adjust 更平滑**：

\`\`\`scss
color.scale($base, $lightness: 30%);  // 向最亮方向走 30%
color.scale($base, $lightness: -30%); // 向最暗方向走 30%
\`\`\`

> 💡 **scale vs adjust 的区别**：\`adjust($c, $lightness: 30%)\` 是「亮度 +30 个百分点」；\`scale($c, $lightness: 30%)\` 是「在当前到 100% 之间走 30%」。后者对已经很亮的颜色增量小，对很暗的颜色增量大，**生成色阶更均匀**。

### 3.3 color.mix — 混合

\`\`\`scss
color.mix(red, blue, 50%);       // 各半
color.mix(black, #3b82f6, 15%);  // 混入 15% 黑
color.mix(white, #3b82f6, 30%);  // 混入 30% 白
\`\`\`

### 3.4 color.complement / color.invert

\`\`\`scss
color.complement(#3b82f6); // 互补色（色相 +180°）
color.invert(#3b82f6);     // 反色（RGB 各通道取反）
\`\`\`

### 3.5 通道读取

\`\`\`scss
color.red(#3b82f6);    // 59
color.green(#3b82f6);  // 130
color.blue(#3b82f6);   // 246
color.hue(#3b82f6);    // 217deg
color.saturation(#3b82f6); // 91%
color.lightness(#3b82f6);  // 60%
color.alpha(rgba(#3b82f6, 0.5)); // 0.5
\`\`\`

## 四、scale-color 统一调整

全局 \`scale-color\` 也能按比例缩放多个通道：

\`\`\`scss
scale-color(#3b82f6, $lightness: 30%, $saturation: -20%);
\`\`\`

对应模块版 \`color.scale\`。推荐用模块版。

## 五、生成 50-900 色阶调色板

这是颜色系统最经典的实战。以一个 500 基准色，用 \`scale\` 生成完整色阶。

\`\`\`scss
@use "sass:color";
$brand: #3b82f6; // 500 基准

$brand-palette: (
  50:  color.scale($brand, $lightness: 45%),
  100: color.scale($brand, $lightness: 36%),
  200: color.scale($brand, $lightness: 27%),
  300: color.scale($brand, $lightness: 18%),
  400: color.scale($brand, $lightness: 9%),
  500: $brand,
  600: color.scale($brand, $lightness: -9%),
  700: color.scale($brand, $lightness: -18%),
  800: color.scale($brand, $lightness: -27%),
  900: color.scale($brand, $lightness: -36%),
);
\`\`\`

然后遍历输出工具类：

\`\`\`scss
@each $step, $value in $brand-palette {
  .brand-#{$step} { background-color: $value; }
}
\`\`\`

### 5.1 为什么用 scale 而非 adjust

\`adjust($brand, $lightness: 45%)\` 会让 50 直接冲到接近白色；而 \`scale\` 会让 50 在「当前值→100%」之间走 45%，保留色相特征，色阶更和谐。

### 5.2 HSL 方式生成色阶

也可以直接用 HSL 拼装：

\`\`\`scss
@function palette($hue, $sat, $light) {
  @return hsl($hue, $sat, $light);
}
$brand-50: hsl(217, 91%, 95%);
$brand-900: hsl(217, 91%, 20%);
\`\`\`

HSL 方式色相绝对一致，是 Tailwind 等设计系统的底层思路。

## 六、颜色对比度与无障碍

WCAG 要求文字与背景对比度达标：正文 ≥ 4.5:1，大字 ≥ 3:1。Sass 没有内置对比度函数，但可用 YIQ 亮度公式判断该用深色还是浅色文字。

\`\`\`scss
@use "sass:color";
@use "sass:math";

@function text-on($bg) {
  $r: color.red($bg);
  $g: color.green($bg);
  $b: color.blue($bg);
  $yiq: math.div(($r * 299) + ($g * 587) + ($b * 114), 1000);
  @if $yiq >= 150 { @return #1e293b; } // 背景亮 → 深色文字
  @else           { @return #ffffff; } // 背景暗 → 浅色文字
}

.btn { background: #3b82f6; color: text-on(#3b82f6); }
\`\`\`

> 💡 YIQ 不是严格的 WCAG 对比度，但作为「自动选文字色」的启发式足够好用。需要精确对比度可用 \`color.contrast\`（社区）或预计算。

### 6.1 对比度等级

| 等级 | 正文 | 大字 |
| --- | --- | --- |
| AA | ≥ 4.5:1 | ≥ 3:1 |
| AAA | ≥ 7:1 | ≥ 4.5:1 |

设计色板时，确保主色与白/黑文字组合达到 AA。

## 七、主题色派生 hover/active/disabled

交互状态色应从主色数学派生，而非另起炉灶：

\`\`\`scss
@use "sass:color";
$base: #3b82f6;

.btn {
  background: $base;
  &:hover   { background: color.adjust($base, $lightness: -8%); }
  &:active  { background: color.adjust($base, $lightness: -16%); }
  &:disabled { background: color.mix($base, white, 40%); }
}
\`\`\`

规则经验：hover 调暗 5-10%，active 调暗 10-20%，disabled 混入大量白变灰。

### 7.1 批量派生多色按钮

\`\`\`scss
$variants: (primary: #3b82f6, success: #22c55e, danger: #ef4444);
@each $name, $base in $variants {
  .btn-#{$name} {
    background: $base;
    &:hover  { background: color.adjust($base, $lightness: -8%); }
    &:active { background: color.adjust($base, $lightness: -16%); }
  }
}
\`\`\`

## 八、颜色变量组织

### 8.1 语义层 vs 原始层

好的颜色组织分两层：

\`\`\`scss
// 原始层：色板
$blue-500: #3b82f6;
$blue-700: #1d4ed8;
$red-500: #ef4444;

// 语义层：用途
$color-primary: $blue-500;
$color-primary-hover: $blue-700;
$color-danger: $red-500;
\`\`\`

组件只用语义层变量。换色板时改原始层，语义层和组件无需改动。

### 8.2 用 Map 组织色板

\`\`\`scss
$blues: (50: #eff6ff, 500: #3b82f6, 900: #1e3a8a);
$color-primary: map-get($blues, 500);
\`\`\`

## 九、暗黑模式色板

暗黑模式不是简单反色，而是一套独立色板：

\`\`\`scss
$light: (bg: #fff, surface: #f8fafc, text: #1e293b, border: #e2e8f0);
$dark:  (bg: #0f172a, surface: #1e293b, text: #f1f5f9, border: #334155);
\`\`\`

通过 \`prefers-color-scheme\` 或 \`data-theme\` 切换：

\`\`\`scss
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f172a;
    --text: #f1f5f9;
  }
}
\`\`\`

### 9.1 暗黑模式注意点

- 背景不用纯黑（#000），用深蓝灰（#0f172a）更护眼
- 文字不用纯白，用 #f1f5f9 降低眩光
- 阴影在暗色下应更弱、更柔和
- 强调色（accent）在暗色下应提亮以保证对比度

## 十、综合调色板策略

\`\`\`
完整颜色系统构建流程

  1. 选基准色（500）
        │
        ▼
  2. scale 生成 50-900 色阶
        │
        ▼
  3. 派生 hover/active/disabled
        │
        ▼
  4. YIQ 自动选文字色
        │
        ▼
  5. 语义层映射（primary/success/...）
        │
        ▼
  6. 暗黑模式独立色板
\`\`\`

## 十一、最佳实践

1. **用 color 模块**：弃用全局 \`lighten/darken\`，用 \`color.adjust/scale\`
2. **scale 生成色阶**：\`color.scale\` 比 \`adjust\` 色阶更均匀
3. **两层变量**：原始层（色板）+ 语义层（用途），组件只引用语义层
4. **交互色数学派生**：hover/active 从主色 adjust，保证一致性
5. **无障碍优先**：用 YIQ 或对比度检查选文字色
6. **暗色独立色板**：不要直接反色，单独设计
7. **Map 化色板**：便于遍历生成工具类
8. **HSL 调色**：需要色相一致的色阶时优先 HSL

## 十二、常见错误

### 错误 1：用 \${} 插值

\`\`\`scss
// ❌ Sass 不支持 \${}
.color-\${$name} { }
// ✅
.color-#{$name} { }
\`\`\`

### 错误 2：adjust 把颜色冲爆

\`\`\`scss
// ❌ 50 色阶会冲成纯白
color.adjust($brand, $lightness: 45%);
// ✅ 用 scale
color.scale($brand, $lightness: 45%);
\`\`\`

### 错误 3：忘 @use "sass:color"

\`\`\`scss
// ❌ color.adjust 未定义
color.adjust(#fff, $lightness: 10%);
// ✅
@use "sass:color";
color.adjust(#fff, $lightness: 10%);
\`\`\`

### 错误 4：用 / 做除法

\`\`\`scss
// ❌ 废弃告警
$result: 255 / 1000;
// ✅
@use "sass:math";
$result: math.div(255, 1000);
\`\`\`

## 十三、小结

- **表示法**：hex 简洁、rgb 直观、**hsl 最适合调色板**
- **函数**：弃用全局，用 \`color.adjust/scale/change/mix\`
- **色阶**：\`color.scale\` 生成 50-900，比 adjust 均匀
- **状态色**：hover/active 从主色 adjust 派生
- **无障碍**：YIQ 公式自动选文字色
- **暗黑模式**：独立色板，不直接反色

## 十四、现代 CSS 颜色空间：lab / lch / oklch

CSS Color Module Level 4 引入了基于 CIE Lab 的感知均匀颜色空间：\`lab()\`、\`lch()\`、\`oklch()\`。它们比 HSL 更符合人眼感知——同样亮度变化在视觉上真的等距。

### 14.1 为什么 HSL 不完美

HSL 的"亮度"是数学定义而非感知定义。黄色 \`hsl(60, 100%, 50%)\` 和蓝色 \`hsl(240, 100%, 50%)\` 理论上同亮度，但人眼觉得黄色亮得多。这导致 HSL 色阶在黄绿色相区偏亮、蓝紫色相区偏暗。

\`\`\`
HSL 亮度不均匀（同为 L=50%）

  黄色 hsl(60,100%,50%)   ████████  视觉很亮
  绿色 hsl(120,100%,50%)  ████████  视觉较亮
  蓝色 hsl(240,100%,50%)  ████████  视觉较暗
  紫色 hsl(280,100%,50%)  ████████  视觉暗

  → 同一 L 值，感知亮度差异巨大
\`\`\`

### 14.2 oklch 颜色空间

\`oklch()\` 是 2024 年最受推崇的颜色空间，三个分量：

| 分量 | 含义 | 范围 |
| --- | --- | --- |
| L（Lightness） | 感知亮度 | 0-1 或 0%-100% |
| C（Chroma） | 色彩浓度（类似饱和度） | 0-0.4+ |
| H（Hue） | 色相角度 | 0-360deg |

\`\`\`scss
// oklch 语法
\$brand: oklch(62% 0.19 264); // L=62% C=0.19 H=264°
\`\`\`

### 14.3 Sass 与现代颜色空间

Sass 1.x 的 \`sass:color\` 模块**目前主要基于 RGB/HSL**，对 lab/lch/oklch 的函数支持有限。但你可以：

1. **直接使用原生 CSS 值**：Sass 会将其视为不透明颜色值原样输出
2. **用 CSS 变量桥接**：颜色令牌用 CSS 变量 + oklch，Sass 只做结构组织
3. **等待 Sass 2.x**：官方计划增强现代颜色空间支持

\`\`\`scss
// Sass 接受 oklch 值但无法用 color.adjust 调整
\$brand: oklch(62% 0.19 264);
.brand { background: \$brand; } // 原样输出，没问题
// color.adjust(\$brand, ...) // ❌ 可能不支持
\`\`\`

> 💡 **实践建议**：需要感知均匀色阶时，用 CSS 变量 + oklch 预计算色阶值存入 Map，Sass 负责遍历输出工具类。

## 十五、色板设计案例对比

不同设计系统有不同色板生成策略，理解差异有助于选择适合项目的方法。

### 15.1 Tailwind 的策略

Tailwind 用手工调校的色阶，每个色相 11 档（50-950）。色阶之间非线性，人工调整以保证视觉和谐：

\`\`\`scss
// Tailwind blue 色阶（手工值）
\$tw-blue: (
  50:  #eff6ff,
  100: #dbeafe,
  200: #bfdbfe,
  300: #93c5fd,
  400: #60a5fa,
  500: #3b82f6,
  600: #2563eb,
  700: #1d4ed8,
  800: #1e40af,
  900: #1e3a8a,
  950: #172554,
);
\`\`\`

特点：50-300 偏白偏柔和，500 是基准，700+ 适合文字，950 几乎是深底色。

### 15.2 Material Design 的策略

Material 用 HSL 固定色相、调整亮度，生成 50-900 共 10 档。500 是主色，其他档用预设亮度百分比：

\`\`\`scss
// Material 风格：固定 H/S，调 L
\$mat-blue: (
  50:  hsl(217, 92%, 95%),
  100: hsl(217, 92%, 90%),
  500: hsl(217, 92%, 60%),
  900: hsl(217, 92%, 20%),
);
\`\`\`

特点：色相绝对一致，但浅色档可能偏灰（S 不变但 L 太高时视觉饱和度下降）。

### 15.3 两种策略对比

| 维度 | Tailwind（手工） | Material（HSL 公式） |
| --- | --- | --- |
| 色阶质量 | 极高（人工调校） | 较好（公式生成） |
| 维护成本 | 高（每色手工列值） | 低（一个公式） |
| 灵活性 | 固定档位 | 可任意增减档 |
| 适用场景 | 严肃设计系统 | 快速原型/工具类 |

> 💡 **推荐**：生产项目用 Tailwind 风格手工色板（质量优先），内部工具/原型用 Material 风格公式生成（效率优先）。

### 15.4 用 Sass 近似 Tailwind 风格色阶

结合 \`color.scale\` + 手动微调，可以用 Sass 近似 Tailwind 色阶。深色档同时降亮度、提饱和度，避免色阶变浑浊——这是 Tailwind 色板看起来"干净"的秘诀：

\`\`\`scss
@use "sass:color";
\$base: #3b82f6;

\$palette: (
  50:  color.scale(\$base, \$lightness: 48%),
  100: color.scale(\$base, \$lightness: 40%),
  200: color.scale(\$base, \$lightness: 30%),
  300: color.scale(\$base, \$lightness: 18%),
  400: color.scale(\$base, \$lightness: 8%),
  500: \$base,
  600: color.scale(\$base, \$lightness: -8%, \$saturation: 5%),
  700: color.scale(\$base, \$lightness: -18%, \$saturation: 8%),
  800: color.scale(\$base, \$lightness: -28%, \$saturation: 10%),
  900: color.scale(\$base, \$lightness: -38%, \$saturation: 12%),
);
\`\`\`

### 15.5 浅色档降饱和的技巧

提亮度的同时微降饱和度，避免浅色过艳。这是因为人眼对高亮度颜色的饱和度更敏感：

\`\`\`scss
50:  color.scale(color.scale(\$base, \$lightness: 48%), \$saturation: -10%),
\`\`\`

\`\`\`
色阶调校原则

  浅色档（50-400）：提亮度 + 降饱和 → 柔和不艳
  基准档（500）  ：原色不动
  深色档（600-900）：降亮度 + 提饱和 → 深邃不浊
\`\`\`

## 十六、渐变与颜色

Sass 颜色函数非常适合生成渐变色板。

### 16.1 等距色阶渐变

\`\`\`scss
@use "sass:color";
\$base: #3b82f6;
.grad {
  background: linear-gradient(
    to right,
    color.scale(\$base, \$lightness: 40%),
    \$base,
    color.scale(\$base, \$lightness: -40%)
  );
}
\`\`\`

### 16.2 多色彩虹渐变

用 \`append\` 累加色标，\`@each\` 遍历色相生成彩虹渐变：

\`\`\`scss
\$hues: 0 60 120 180 240 300;
\$stops: ();
@each \$h in \$hues {
  \$stops: append(\$stops, hsl(\$h, 80%, 55%), comma);
}
.rainbow {
  background: linear-gradient(to right, \$stops);
}
\`\`\`

### 16.3 渐变方向工具类

\`\`\`scss
\$dirs: (
  to-right: to right,
  to-left: to left,
  to-bottom: to bottom,
);
@each \$name, \$dir in \$dirs {
  .grad-#{\$name} {
    background: linear-gradient(\$dir, #3b82f6, #1d4ed8);
  }
}
\`\`\`

### 16.4 文字渐变

\`\`\`scss
.gradient-text {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
\`\`\`

## 十七、颜色调试技巧

### 17.1 @debug 输出颜色值

\`\`\`scss
@use "sass:color";
\$c: color.adjust(#3b82f6, \$lightness: -10%);
@debug \$c; // 编译时在终端输出颜色值
\`\`\`

### 17.2 生成色板预览

用 @each 遍历色阶，输出色块预览类，直观检查色阶质量：

\`\`\`scss
@each \$step, \$val in \$palette {
  .swatch-#{\$step} {
    background: \$val;
    &::after { content: "#{\$step}"; }
  }
}
\`\`\`

### 17.3 亮度估算函数

为每个色块标注亮度，确保无障碍达标：

\`\`\`scss
@use "sass:color";
@use "sass:math";
@function luminance(\$c) {
  \$r: math.div(color.red(\$c), 255);
  \$g: math.div(color.green(\$c), 255);
  \$b: math.div(color.blue(\$c), 255);
  @return 0.2126 * \$r + 0.7152 * \$g + 0.0722 * \$b;
}
\`\`\`

> 💡 精确 WCAG 对比度需要 gamma 校正，这里用简化版做快速估算。

## 十八、颜色系统决策树

\`\`\`
需要颜色系统？

  ├─ 项目小、几个色 → 直接 hex 变量
  │
  ├─ 中型项目、需色阶 → Map + color.scale 生成
  │     ├─ 要求高 → 手工调校（Tailwind 风格）
  │     └─ 够用即可 → 公式生成（Material 风格）
  │
  ├─ 大型设计系统 → 两层变量（原始+语义）+ 暗黑色板
  │     └─ 需感知均匀 → oklch + CSS 变量
  │
  └─ 多主题 → 嵌套 Map + @each 生成主题类
\`\`\`

## 十九、补充最佳实践

1. **色阶先深后浅**：从 500 基准色出发，向浅色和深色两端 scale，保证基准色准确
2. **深色档提饱和**：降亮度的同时微提饱和度，避免深色变浑浊
3. **浅色档降饱和**：提亮度的同时微降饱和度，避免浅色过艳
4. **状态色用 adjust**：hover/active 用 adjust（绝对增减），不用 scale（比例缩放）
5. **禁用纯黑纯白**：用 #0f172a 代替 #000，用 #f8fafc 代替 #fff，视觉更舒适
6. **品牌色锁定**：主色一旦确定，派生色全部用函数计算，禁止手写魔法值
7. **暗色不是反色**：暗黑模式重新设计色板，不是简单反色
8. **测试色盲友好**：用在线工具检查色板在色盲视角下的区分度

下面这段 SCSS 综合演示了颜色系统：生成 50-900 色阶、多色按钮变体、自动文字色、暗黑模式，可在预览区观察色板效果。`,
    code: `// ============================================================
// 第二章代码：颜色系统全面实战
// ============================================================
@use "sass:color";
@use "sass:math";

// ---- 1. 颜色表示法 ----
$color-hex: #3b82f6;
$color-hex-alpha: #3b82f680;
$color-rgb: rgb(59, 130, 246);
$color-rgba: rgba(59, 130, 246, 0.5);
$color-hsl: hsl(217, 91%, 60%);
$color-hsla: hsla(217, 91%, 60%, 0.5);
$color-named: cornflowerblue;

// ---- 2. HSL 颜色空间：便于生成调色板 ----
$base-hue: 217;
$base-sat: 91%;
$base-light: 60%;

// ---- 3. 传统颜色函数（已废弃但仍可用，会有告警） ----
$lighter: lighten($color-hex, 20%);
$darker: darken($color-hex, 20%);
$hue-shifted: adjust-hue($color-hex, 60deg);
$more-sat: saturate($color-hex, 20%);
$less-sat: desaturate($color-hex, 20%);
$mixed-old: mix(red, blue, 50%);
$transparent: transparentize($color-hex, 0.5);
$opaque: opacify($color-hex, 0.3);

// ---- 4. color.adjust 新语法（推荐） ----
$adj-light: color.adjust($color-hex, $lightness: 20%);
$adj-dark: color.adjust($color-hex, $lightness: -20%);
$adj-hue: color.adjust($color-hex, $hue: 60deg);
$adj-sat: color.adjust($color-hex, $saturation: 20%);

// ---- 5. color.scale 按比例缩放（生成色阶更均匀） ----
$scaled-up: color.scale($color-hex, $lightness: 30%);
$scaled-down: color.scale($color-hex, $lightness: -30%);

// ---- 6. 生成 50-900 色阶调色板 ----
$brand-base: #3b82f6;
$brand-palette: (
  50:  color.scale($brand-base, $lightness: 45%),
  100: color.scale($brand-base, $lightness: 36%),
  200: color.scale($brand-base, $lightness: 27%),
  300: color.scale($brand-base, $lightness: 18%),
  400: color.scale($brand-base, $lightness: 9%),
  500: $brand-base,
  600: color.scale($brand-base, $lightness: -9%),
  700: color.scale($brand-base, $lightness: -18%),
  800: color.scale($brand-base, $lightness: -27%),
  900: color.scale($brand-base, $lightness: -36%),
);

// 输出色阶色块
@each $step, $value in $brand-palette {
  .brand-#{$step} {
    display: inline-block;
    width: 60px;
    background-color: $value;
    color: white;
    padding: 8px 4px;
    margin: 2px;
    border-radius: 4px;
    text-align: center;
    font-size: 12px;
  }
}

// ---- 7. 主题色派生 hover/active/disabled ----
$theme-base: (
  primary: #3b82f6,
  success: #22c55e,
  warning: #f59e0b,
  danger: #ef4444,
);

@each $name, $base in $theme-base {
  .btn-color-#{$name} {
    display: inline-block;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background-color: $base;
    color: white;
    cursor: pointer;
    margin: 2px;
    &:hover {
      background-color: color.adjust($base, $lightness: -8%);
    }
    &:active {
      background-color: color.adjust($base, $lightness: -16%);
    }
    &:disabled {
      background-color: color.mix($base, white, 40%);
      cursor: not-allowed;
    }
  }
}

// ---- 8. 颜色对比度与无障碍（YIQ 自动选文字色） ----
@function text-color-on($bg) {
  $r: color.red($bg);
  $g: color.green($bg);
  $b: color.blue($bg);
  $yiq: math.div(($r * 299) + ($g * 587) + ($b * 114), 1000);
  @if $yiq >= 150 {
    @return #1e293b;
  } @else {
    @return #ffffff;
  }
}

// ---- 9. 暗黑模式色板 ----
$light-theme: (
  bg: #ffffff,
  surface: #f8fafc,
  text: #1e293b,
  text-muted: #64748b,
  border: #e2e8f0,
);
$dark-theme: (
  bg: #0f172a,
  surface: #1e293b,
  text: #f1f5f9,
  text-muted: #94a3b8,
  border: #334155,
);

// ---- 10. 综合演示样式 ----
.sass-demo {
  font-family: system-ui, sans-serif;
  background-color: map-get($light-theme, bg);
  color: map-get($light-theme, text);
  padding: 16px;

  .card {
    background-color: map-get($light-theme, surface);
    border: 1px solid map-get($light-theme, border);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    color: text-color-on(map-get($light-theme, surface));
  }
  .alert {
    border-radius: 6px;
    padding: 8px 12px;
    margin: 4px 0;
    color: white;
    &.alert-success { background: map-get($theme-base, success); }
    &.alert-warning { background: map-get($theme-base, warning); }
    &.alert-danger  { background: map-get($theme-base, danger); }
  }
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    background: $brand-base;
    color: text-color-on($brand-base);
  }
  .btn {
    background-color: $brand-base;
    color: text-color-on($brand-base);
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
  }
  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    li {
      padding: 8px;
      border-bottom: 1px solid map-get($light-theme, border);
    }
  }
}

// ---- 11. 暗黑模式（跟随系统） ----
@media (prefers-color-scheme: dark) {
  .sass-demo {
    background-color: map-get($dark-theme, bg);
    color: map-get($dark-theme, text);
    .card {
      background-color: map-get($dark-theme, surface);
      border-color: map-get($dark-theme, border);
      color: text-color-on(map-get($dark-theme, surface));
    }
    .list li {
      border-color: map-get($dark-theme, border);
    }
  }
}
`,
  },

  // =========================================================
  // 第三章：响应式与媒体查询
  // =========================================================
  {
    id: "sass-responsive",
    group: "进阶技巧",
    icon: "📱",
    title: "响应式与媒体查询",
    content: `## 响应式与媒体查询：让样式适配一切屏幕

移动优先时代，响应式是基本功。纯 CSS 写媒体查询要重复敲 \`@media (min-width: 768px)\`，断点散落难管理。Sass 用 Map 集中管理断点 + mixin 封装媒体查询 + @each 批量生成响应式工具类，让响应式代码 DRY、可维护。

### 响应式的核心矛盾

\`\`\`
设备屏幕尺寸碎片化

  手机 375px   ▏
  平板 768px   ▏▕▏
  笔电 1024px  ▏▕▏▕▏
  桌面 1440px  ▏▕▏▕▏▕▏
  4K   2560px  ▏▕▏▕▏▕▏▕▏

  → 同一套样式要在所有宽度下可用
  → 需要断点 + 媒体查询来「按宽度切换样式」
\`\`\`

### mobile-first 哲学

响应式有两种思路：

1. **mobile-first**：先写移动端样式，再用 \`min-width\` 逐步增强到大屏
2. **desktop-first**：先写桌面样式，再用 \`max-width\` 向下兼容小屏

**推荐 mobile-first**：移动端流量占比高，且 \`min-width\` 逐级覆盖更符合「渐进增强」，CSS 优先级更干净。

\`\`\`
mobile-first（min-width）      desktop-first（max-width）

  默认 = 移动端                   默认 = 桌面端
  @media (min-width:768px)      @media (max-width:767px)
  @media (min-width:1024px)     @media (max-width:1023px)
  小 → 大 逐级增强               大 → 小 逐级降级
\`\`\`

## 一、@media 嵌套

Sass 允许把 \`@media\` 嵌套在选择器内部，编译后会提升到顶层：

\`\`\`scss
.card {
  width: 100%;
  @media (min-width: 768px) {
    width: 50%;
  }
}
\`\`\`

编译为：

\`\`\`css
.card { width: 100%; }
@media (min-width: 768px) {
  .card { width: 50%; }
}
\`\`\`

这让响应式样式**就近写在组件旁边**，而非散落到文件底部。

## 二、断点变量管理

### 2.1 用变量存断点

\`\`\`scss
$bp-sm: 640px;
$bp-md: 768px;
$bp-lg: 1024px;
$bp-xl: 1280px;
\`\`\`

### 2.2 用 Map 存断点（推荐）

\`\`\`scss
$breakpoints: (
  sm: 640px,
  md: 768px,
  lg: 1024px,
  xl: 1280px,
  xxl: 1536px,
);
\`\`\`

Map 的好处：可用 \`@each\` 批量生成、用键名引用、集中维护。

## 三、mixin 封装媒体查询

### 3.1 基础 mixin（@content 传递）

\`@content\` 让 mixin 接收一块样式块，是封装媒体查询的关键：

\`\`\`scss
@use "sass:map";
$breakpoints: (sm: 640px, md: 768px, lg: 1024px);

@mixin respond-to($bp) {
  @if map.has-key($breakpoints, $bp) {
    @media (min-width: map.get($breakpoints, $bp)) {
      @content;
    }
  } @else {
    @warn "未知断点: #{$bp}";
  }
}

.card {
  width: 100%;
  @include respond-to(md) {
    width: 50%;
  }
}
\`\`\`

调用时写 \`@include respond-to(md) { ... }\`，清晰表达「在 md 及以上」。

### 3.2 desktop-first 版本

\`\`\`scss
@mixin respond-below($bp) {
  @media (max-width: map.get($breakpoints, $bp) - 1px) {
    @content;
  }
}
\`\`\`

> 💡 \`max-width: 767px\` 而非 \`768px\`，避免与 \`min-width: 768px\` 重叠。

### 3.3 断点之间（区间）

\`\`\`scss
@mixin between($min, $max) {
  @media (min-width: map.get($breakpoints, $min))
     and (max-width: map.get($breakpoints, $max) - 1px) {
    @content;
  }
}
\`\`\`

## 四、mobile-first vs desktop-first 示例

### 4.1 mobile-first（推荐）

\`\`\`scss
.grid {
  grid-template-columns: 1fr;          // 移动端 1 列
  @include respond-to(sm) { grid-template-columns: repeat(2, 1fr); }
  @include respond-to(md) { grid-template-columns: repeat(3, 1fr); }
  @include respond-to(lg) { grid-template-columns: repeat(4, 1fr); }
}
\`\`\`

从小到大，每个断点「叠加」更宽的布局，CSS 优先级自然递增。

### 4.2 desktop-first

\`\`\`scss
.grid {
  grid-template-columns: repeat(4, 1fr); // 桌面 4 列
  @include respond-below(lg) { grid-template-columns: repeat(3, 1fr); }
  @include respond-below(md) { grid-template-columns: repeat(2, 1fr); }
  @include respond-below(sm) { grid-template-columns: 1fr; }
}
\`\`\`

## 五、响应式字体

### 5.1 clamp 流体字号

\`clamp(最小, 首选, 最大)\` 让字号随视口流体变化，无需媒体查询：

\`\`\`scss
h1 {
  font-size: clamp(1.5rem, 2vw + 0.5rem, 2.5rem);
}
\`\`\`

- 视口很小时取 1.5rem
- 视口很大时取 2.5rem
- 中间随 2vw + 0.5rem 平滑变化

### 5.2 clamp + 媒体查询组合

\`\`\`scss
h1 {
  font-size: 1.5rem;
  @include respond-to(md) { font-size: 2rem; }
  @include respond-to(lg) { font-size: 2.5rem; }
}
\`\`\`

clamp 适合「平滑过渡」，媒体查询适合「阶梯跳变」。两者常组合使用。

### 5.3 响应式排版函数

\`\`\`scss
@function fluid-size($min, $max, $min-vw, $max-vw) {
  $v: calc(#{$min} + (#{$max} - #{$min}) * (100vw - #{$min-vw}) / (#{$max-vw} - #{$min-vw}));
  @return clamp(#{$min}, #{$v}, #{$max});
}
\`\`\`

## 六、响应式网格

\`\`\`scss
.grid {
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr;
  @include respond-to(sm) { grid-template-columns: repeat(2, 1fr); }
  @include respond-to(md) { grid-template-columns: repeat(3, 1fr); }
  @include respond-to(lg) { grid-template-columns: repeat(4, 1fr); }
}
\`\`\`

### 6.1 响应式间距

\`\`\`scss
.card {
  padding: 8px;
  @include respond-to(md) { padding: 16px; }
  @include respond-to(lg) { padding: 24px; }
}
\`\`\`

## 七、@media 生成工具类

### 7.1 响应式显隐工具类

\`\`\`scss
$bps: sm md lg;
@each $bp in $bps {
  .hide-on-#{$bp} {
    @include respond-to($bp) { display: none !important; }
  }
  .show-on-#{$bp} {
    display: none !important;
    @include respond-to($bp) { display: block !important; }
  }
}
\`\`\`

生成 \`.hide-on-md\` \`.show-on-lg\` 等，类似 Tailwind 的 \`md:hidden\`。

### 7.2 响应式文字对齐

\`\`\`scss
@each $bp, $size in $breakpoints {
  @each $align in (left, center, right) {
    .text-#{$align}-#{$bp} {
      @include respond-to($bp) { text-align: $align; }
    }
  }
}
\`\`\`

生成 \`.text-center-md\` \`.text-right-lg\` 等。

### 7.3 响应式网格列数

\`\`\`scss
@each $bp, $size in $breakpoints {
  @for $i from 1 through 12 {
    .col-#{$i}-#{$bp} {
      @include respond-to($bp) { grid-column: span #{$i}; }
    }
  }
}
\`\`\`

## 八、断点命名约定

\`\`\`
常见断点命名（参考 Tailwind / Bootstrap）

  sm  640px   小手机横屏 / 大手机
  md  768px   平板竖屏
  lg  1024px  平板横屏 / 小笔电
  xl  1280px  桌面
  xxl 1536px  大桌面
\`\`\`

命名建议：

1. **用抽象名**（sm/md/lg）而非具体设备（phone/tablet），设备会变
2. **统一一套**：全项目用同一断点 Map
3. **5 个左右够用**：太多断点难维护，太少不够灵活

## 九、容器查询概念

媒体查询基于**视口宽度**，但组件可能在不同容器里有不同布局需求。容器查询基于**容器宽度**：

\`\`\`css
.card-container { container-type: inline-size; }
@container (min-width: 400px) {
  .card { flex-direction: row; }
}
\`\`\`

Sass 对容器查询没有特殊支持（它是原生 CSS 特性），但可以用同样的 Map+mixin 思路封装：

\`\`\`scss
@mixin container-up($size) {
  @container (min-width: $size) { @content; }
}
\`\`\`

> 容器查询是新特性（2023 起主流浏览器支持），适合组件库。传统响应式用媒体查询即可。

## 十、打印样式 @media print

打印场景需要专门优化：隐藏交互元素、黑白化、避免分页断裂。

\`\`\`scss
@media print {
  .btn, .form { display: none; }
  .card {
    border: 1px solid #000;
    box-shadow: none;
    break-inside: avoid;
  }
  body { background: white; color: black; }
}
\`\`\`

打印要点：

1. **隐藏无用元素**：按钮、表单、导航、广告
2. **黑白化**：背景改白、文字改黑、阴影去掉
3. **避免断裂**：\`break-inside: avoid\` 防止卡片被分页切开
4. **显示链接 URL**：用 \`::after\` 在打印时显示链接地址

\`\`\`scss
@media print {
  a[href]::after {
    content: " (" attr(href) ")";
  }
}
\`\`\`

## 十一、暗黑模式 @media (prefers-color-scheme)

跟随系统暗黑模式：

\`\`\`scss
@media (prefers-color-scheme: dark) {
  body {
    background: #0f172a;
    color: #f1f5f9;
  }
}
\`\`\`

### 11.1 手动切换（data 属性）

跟随系统不够灵活，常配合手动切换：

\`\`\`scss
[data-theme="dark"] {
  body { background: #0f172a; color: #f1f5f9; }
}
\`\`\`

### 11.2 两者结合

\`\`\`scss
// 跟随系统
@media (prefers-color-scheme: dark) {
  :root { --bg: #0f172a; }
}
// 手动覆盖
[data-theme="light"] { --bg: #fff; }
[data-theme="dark"]  { --bg: #0f172a; }
\`\`\`

### 11.3 暗黑模式策略

- 用 CSS 变量承载颜色，切换时只改变量值
- 暗色背景用深蓝灰（#0f172a）而非纯黑
- 文字用 #f1f5f9 而非纯白
- 强调色在暗色下提亮（如 #3b82f6 → #60a5fa）

## 十二、其他媒体特性

\`\`\`scss
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
@media (hover: hover) {
  .btn:hover { background: #2563eb; }
}
@media (orientation: landscape) { /* 横屏 */ }
@media (min-resolution: 2dppx) { /* 高分屏 retina */ }
\`\`\`

### 12.1 prefers-reduced-motion

尊重用户「减少动画」的系统设置，是无障碍重要一环：

\`\`\`scss
.fade {
  transition: opacity 0.3s;
}
@media (prefers-reduced-motion: reduce) {
  .fade { transition: none; }
}
\`\`\`

## 十三、媒体查询组织技巧

### 13.1 集中定义，就近使用

断点 Map 集中在 \`abstracts/_variables.scss\`，mixin 集中在 \`abstracts/_mixins.scss\`，组件内就近 \`@include\`。

### 13.2 避免断点爆炸

如果一个组件有 5 个断点各改 10 个属性，说明布局过于依赖断点。考虑用 \`clamp\`、\`fr\` 单位、\`auto-fit\` 减少断点：

\`\`\`scss
// 用 auto-fit 自适应，0 个断点
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
\`\`\`

### 13.3 断点顺序

mobile-first 下，断点**从小到大**书写，确保大屏规则覆盖小屏：

\`\`\`scss
.x {
  // 默认（移动）
  @include respond-to(sm) { }
  @include respond-to(md) { }
  @include respond-to(lg) { }
}
\`\`\`

## 十四、综合实战

\`\`\`scss
@use "sass:map";
$breakpoints: (sm: 640px, md: 768px, lg: 1024px);

@mixin respond-to($bp) {
  @media (min-width: map.get($breakpoints, $bp)) { @content; }
}

.sass-demo {
  font-size: clamp(1rem, 2vw, 1.25rem);
  .grid {
    display: grid;
    gap: 8px;
    grid-template-columns: 1fr;
    @include respond-to(sm) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(md) { grid-template-columns: repeat(3, 1fr); }
  }
}
\`\`\`

## 十五、最佳实践

1. **mobile-first**：默认写移动端，用 \`min-width\` 增强
2. **Map 管断点**：集中定义，全项目复用
3. **mixin 封装**：\`@include respond-to(md)\` 比裸 \`@media\` 可读
4. **clamp 流体**：字号/间距能用 clamp 就别堆断点
5. **@each 批量**：响应式工具类用循环生成
6. **抽象命名**：sm/md/lg 而非 phone/tablet
7. **打印优化**：\`@media print\` 隐藏交互、黑白化、防断裂
8. **尊重无障碍**：\`prefers-reduced-motion\` 关动画
9. **CSS 变量+暗黑**：暗色用变量承载，切换低成本

## 十六、常见错误

### 错误 1：用 \${} 插值

\`\`\`scss
// ❌
.hide-on-\${$bp} { }
// ✅
.hide-on-#{$bp} { }
\`\`\`

### 错误 2：断点重叠

\`\`\`scss
// ❌ max 和 min 都含 768px，768px 时两套都生效
@media (max-width: 768px) { }
@media (min-width: 768px) { }
// ✅ max 用 767px
@media (max-width: 767px) { }
@media (min-width: 768px) { }
\`\`\`

### 错误 3：desktop-first 顺序错乱

\`\`\`scss
// ❌ 大屏写在前面会被小屏覆盖
.x { @include respond-to(lg) { font-size: 2rem; } }
.x { font-size: 1rem; } // 这行后写，覆盖了上面
\`\`\`

### 错误 4：忘 @use "sass:map"

\`\`\`scss
// ❌ map.get 未定义
map.get($breakpoints, md);
// ✅
@use "sass:map";
\`\`\`

## 十七、小结

- **mixin 封装**：\`@content\` 让媒体查询可复用、可读
- **Map 管断点**：集中维护，\`@each\` 批量生成工具类
- **mobile-first**：默认移动端，\`min-width\` 增强，优先级干净
- **clamp 流体**：字号间距平滑过渡，减少断点
- **打印/暗黑/无障碍**：\`@media print\` / \`prefers-color-scheme\` / \`prefers-reduced-motion\`
- **容器查询**：基于容器宽度，适合组件库

## 十八、移动端特殊处理

### 18.1 安全区域适配

iPhone X 以上的刘海屏有安全区域，需要 \`env(safe-area-inset-*)\` 适配：

\`\`\`scss
.bottom-bar {
  padding-bottom: env(safe-area-inset-bottom);
  // 兼容旧版 iOS（constant 已废弃但老设备需要）
  padding-bottom: constant(safe-area-inset-bottom);
}
\`\`\`

### 18.2 100vh 问题

移动端 \`100vh\` 包含浏览器地址栏，会导致内容被遮挡。用 \`100dvh\`（动态视口高度）替代：

\`\`\`scss
.fullscreen {
  height: 100vh;      // 回退
  height: 100dvh;     // 现代浏览器，随地址栏伸缩
}
\`\`\`

| 单位 | 含义 | 地址栏影响 |
| --- | --- | --- |
| \`100vh\` | 视口高度 | 固定（含地址栏） |
| \`100dvh\` | 动态视口高度 | 随地址栏变化 |
| \`100svh\` | 小视口高度 | 始终含地址栏（最保守） |
| \`100lvh\` | 大视口高度 | 始终不含地址栏（最大） |

### 18.3 触摸目标尺寸

WCAG 建议触摸目标至少 44×44px。用 Sass mixin 保证：

\`\`\`scss
@mixin touch-target(\$size: 44px) {
  min-width: \$size;
  min-height: \$size;
}
.btn { @include touch-target; }
\`\`\`

### 18.4 禁用文本选择

移动端长按按钮会触发选中文本，用 \`user-select: none\` 禁用：

\`\`\`scss
.btn, .icon {
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent; // 去掉点击高亮
}
\`\`\`

## 十九、响应式图片与媒体

### 19.1 响应式图片基础

\`\`\`scss
img {
  max-width: 100%;
  height: auto;
}
\`\`\`

### 19.2 aspect-ratio 保持比例

\`\`\`scss
.card-image {
  aspect-ratio: 16 / 9;
  object-fit: cover;
  width: 100%;
}
\`\`\`

### 19.3 响应式背景图

不同断点加载不同分辨率的图片，节省移动端流量：

\`\`\`scss
.hero {
  background-image: url("mobile.jpg");
  background-size: cover;
  @include respond-to(md) {
    background-image: url("tablet.jpg");
  }
  @include respond-to(lg) {
    background-image: url("desktop.jpg");
  }
}
\`\`\`

### 19.4 响应式视频

\`\`\`scss
.video-wrap {
  position: relative;
  aspect-ratio: 16 / 9;
  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
}
\`\`\`

## 二十、响应式调试技巧

### 20.1 断点指示器

开发时在角落显示当前断点，方便调试：

\`\`\`scss
body::before {
  position: fixed;
  bottom: 0;
  right: 0;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 4px 8px;
  z-index: 9999;
  content: "xs";
  @include respond-to(sm) { content: "sm"; }
  @include respond-to(md) { content: "md"; }
  @include respond-to(lg) { content: "lg"; }
  @include respond-to(xl) { content: "xl"; }
}
\`\`\`

> 生产环境记得删除这个调试样式。

### 20.2 网格可视化

调试布局时临时显示网格线：

\`\`\`scss
.debug-grid {
  background-image: linear-gradient(
    rgba(255,0,0,0.1) 1px,
    transparent 1px
  );
  background-size: 100% 8px;
}
\`\`\`

### 20.3 响应式测试清单

\`\`\`
响应式检查清单

  □ 375px  （iPhone SE）    布局是否正常？
  □ 414px  （iPhone Plus）   文字是否可读？
  □ 768px  （iPad 竖屏）     网格是否切换？
  □ 1024px （iPad 横屏）     侧栏是否出现？
  □ 1440px （笔记本）        内容是否居中？
  □ 1920px （桌面）          是否过大留白？
  □ 横屏/竖屏切换             布局是否适应？
  □ 缩放 200%                是否仍可使用？
\`\`\`

## 二十一、性能与响应式

### 21.1 避免过多媒体查询

每个 \`@media\` 都增加 CSS 体积。能用 \`clamp\`、\`auto-fit\`、\`fr\` 解决的，就别堆断点：

\`\`\`scss
// ❌ 5 个断点
.title {
  font-size: 1rem;
  @include respond-to(sm) { font-size: 1.25rem; }
  @include respond-to(md) { font-size: 1.5rem; }
  @include respond-to(lg) { font-size: 1.875rem; }
  @include respond-to(xl) { font-size: 2.25rem; }
}
// ✅ 1 行 clamp
.title { font-size: clamp(1rem, 0.5rem + 2vw, 2.25rem); }
\`\`\`

### 21.2 CSS 变量 + 媒体查询

用 CSS 变量承载断点相关值，媒体查询只改变量，减少重复规则：

\`\`\`scss
:root { --cols: 1; }
@media (min-width: 640px) { :root { --cols: 2; } }
@media (min-width: 1024px) { :root { --cols: 4; } }
.grid { grid-template-columns: repeat(var(--cols), 1fr); }
\`\`\`

这样网格规则只写一次，断点只改变量值，CSS 更精简。

### 21.3 按需加载断点

\`\`\`
性能优化策略

  ├─ 能用 clamp/auto-fit → 不用 @media
  ├─ 必须用 @media → 用 CSS 变量承载值
  ├─ 组件级响应式 → 用容器查询替代媒体查询
  └─ 关键 CSS 内联，非关键 CSS 异步加载
\`\`\`

## 二十二、补充最佳实践

1. **先移动端再增强**：默认样式服务最小屏幕，逐步 \`min-width\` 增强
2. **断点服务于内容**：内容需要换行时才加断点，而非按设备尺寸
3. **触摸与鼠标分离**：用 \`@media (hover: hover)\` 区分交互方式
4. **图片用 srcset**：配合 Sass 响应式背景图，前端用 \`<img srcset>\` 按需加载
5. **测试真实设备**：浏览器模拟器不能完全还原移动端性能和渲染差异
6. **横屏也要测**：\`@media (orientation: landscape)\` 处理横屏特殊布局
7. **字体最小 14px**：移动端小于 14px 的中文字难看清
8. **按钮间距足够**：移动端按钮间距至少 8px，防止误触

下面这段 SCSS 综合演示了断点管理、媒体查询 mixin、响应式网格/字体、工具类生成、打印样式和暗黑模式，可在预览区调整窗口宽度观察响应式效果。`,
    code: `// ============================================================
// 第三章代码：响应式与媒体查询实战
// ============================================================
@use "sass:map";

// ---- 1. 断点 Map（集中管理） ----
$breakpoints: (
  sm: 640px,
  md: 768px,
  lg: 1024px,
  xl: 1280px,
  xxl: 1536px,
);

// ---- 2. 媒体查询 mixin（mobile-first，min-width） ----
@mixin respond-to($bp) {
  @if map.has-key($breakpoints, $bp) {
    @media (min-width: map.get($breakpoints, $bp)) {
      @content;
    }
  } @else {
    @warn "未知断点: #{$bp}";
  }
}

// desktop-first 版本（max-width，注意 -1px 避免重叠）
@mixin respond-below($bp) {
  @if map.has-key($breakpoints, $bp) {
    @media (max-width: map.get($breakpoints, $bp) - 1px) {
      @content;
    }
  }
}

// 断点区间
@mixin between($min, $max) {
  @media (min-width: map.get($breakpoints, $min))
     and (max-width: map.get($breakpoints, $max) - 1px) {
    @content;
  }
}

// ---- 3. 响应式字体（clamp + 媒体查询） ----
.sass-demo {
  font-family: system-ui, sans-serif;
  // clamp(最小, 首选, 最大)：流体响应式字号
  font-size: clamp(1rem, 2vw + 0.5rem, 1.25rem);
  padding: 16px;

  // 响应式标题：不同断点不同字号
  h1, h2, h3 {
    font-size: 1.5rem;
    margin: 0 0 8px;
    @include respond-to(md) { font-size: 2rem; }
    @include respond-to(lg) { font-size: 2.5rem; }
  }

  // ---- 4. 响应式网格 ----
  .grid {
    display: grid;
    gap: 8px;
    // 默认 1 列（移动端）
    grid-template-columns: 1fr;
    @include respond-to(sm) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(md) { grid-template-columns: repeat(3, 1fr); }
    @include respond-to(lg) { grid-template-columns: repeat(4, 1fr); }
  }

  // ---- 5. 卡片响应式 ----
  .card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    // 移动端全宽，桌面端按比例
    width: 100%;
    @include respond-to(md) {
      width: calc(50% - 4px);
      display: inline-block;
    }
    @include respond-to(lg) {
      width: calc(33.333% - 6px);
    }
  }

  // ---- 6. 表单响应式 ----
  .form {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 8px 0;
    @include respond-to(md) {
      flex-direction: row;
      align-items: center;
    }
    input {
      flex: 1;
      padding: 8px;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
    }
  }

  // ---- 7. 列表响应式 ----
  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    li {
      padding: 8px;
      border-bottom: 1px solid #e2e8f0;
      @include respond-to(md) {
        display: flex;
        justify-content: space-between;
      }
    }
  }

  .btn {
    display: inline-block;
    background: #3b82f6;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    // 小屏按钮全宽
    @include respond-below(sm) {
      width: 100%;
    }
  }

  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    background: #3b82f6;
    color: white;
  }

  .alert {
    padding: 8px 12px;
    border-radius: 6px;
    margin: 4px 0;
    background: #f1f5f9;
  }
}

// ---- 8. 用 @each + mixin 生成响应式显隐工具类 ----
$visibility-bps: sm md lg;
@each $bp in $visibility-bps {
  .hide-on-#{$bp} {
    @include respond-to($bp) {
      display: none !important;
    }
  }
  .show-on-#{$bp} {
    display: none !important;
    @include respond-to($bp) {
      display: block !important;
    }
  }
}

// ---- 9. 响应式文字对齐工具类 ----
@each $bp, $size in $breakpoints {
  @each $align in (left, center, right) {
    .text-#{$align}-#{$bp} {
      @include respond-to($bp) {
        text-align: $align;
      }
    }
  }
}

// ---- 10. 打印样式 ----
@media print {
  .sass-demo {
    .btn, .form {
      display: none !important;
    }
    .card {
      border: 1px solid #000;
      box-shadow: none;
      break-inside: avoid;
      width: 100%;
    }
    background: white;
    color: black;
  }
}

// ---- 11. 暗黑模式（跟随系统） ----
@media (prefers-color-scheme: dark) {
  .sass-demo {
    background: #0f172a;
    color: #f1f5f9;
    .card {
      background: #1e293b;
      border-color: #334155;
    }
    .list li {
      border-color: #334155;
    }
    .form input {
      background: #1e293b;
      border-color: #475569;
      color: #f1f5f9;
    }
    .alert {
      background: #1e293b;
    }
  }
}

// ---- 12. 暗黑模式手动切换（data 属性） ----
[data-theme="dark"] {
  .sass-demo {
    background: #0f172a;
    color: #f1f5f9;
    .card {
      background: #1e293b;
      border-color: #334155;
    }
  }
}

// ---- 13. 尊重「减少动画」系统设置 ----
@media (prefers-reduced-motion: reduce) {
  .sass-demo * {
    animation: none !important;
    transition: none !important;
  }
}
`,
  },

  // =========================================================
  // 第四章：项目架构与最佳实践
  // =========================================================
  {
    id: "sass-architecture",
    group: "进阶技巧",
    icon: "🏛️",
    title: "项目架构与最佳实践",
    content: `## 项目架构与最佳实践：构建可维护的 Sass 工程

小项目随便写几个 SCSS 文件没事，一旦项目变大——几十个组件、多套主题、多人协作——没有架构就会变成「面条式 CSS」：样式冲突、难以复用、修改一处牵连十处。本章讲业界成熟的 7-1 架构、设计令牌、BEM 命名、模块化拆分与性能优化，让你的 Sass 工程可持续维护。

### 为什么需要架构

\`\`\`
没有架构的痛苦

  ❌ 样式散落在各处，找不到
  ❌ 同一颜色硬编码 50 处，改色要全局替换
  ❌ 选择器优先级战争（!important 满天飞）
  ❌ 重复代码多，复制粘贴成风
  ❌ 新人接手看不懂结构

  → 需要统一的目录结构 + 命名规范 + 模块化
\`\`\`

\`\`\`
有架构的收益

  ✅ 文件位置可预测（按钮样式去 components/）
  ✅ 设计令牌集中管理，改一处全站生效
  ✅ 模块化，复用性强
  ✅ 优先级清晰，少用 !important
  ✅ 新人按图索骥，快速上手
\`\`\`

## 一、7-1 架构模式

7-1 是 Sass 社区最流行的架构：**7 个目录 + 1 个入口文件**。

\`\`\`
sass/
├── abstracts/      抽象层：变量、函数、mixin（不输出 CSS）
│   ├── _variables.scss
│   ├── _functions.scss
│   ├── _mixins.scss
│   └── _placeholders.scss
├── base/           基础层：重置、排版、全局样式
│   ├── _reset.scss
│   ├── _typography.scss
│   └── _base.scss
├── components/     组件层：按钮、卡片、表单等
│   ├── _button.scss
│   ├── _card.scss
│   ├── _form.scss
│   └── _badge.scss
├── layout/         布局层：网格、头部、侧栏、页脚
│   ├── _grid.scss
│   ├── _header.scss
│   ├── _footer.scss
│   └── _sidebar.scss
├── pages/          页面层：特定页面样式
│   ├── _home.scss
│   └── _profile.scss
├── themes/         主题层：多主题
│   ├── _light.scss
│   └── _dark.scss
├── vendors/        第三方层：覆盖框架样式
│   ├── _bootstrap.scss
│   └── _tailwind-overrides.scss
└── main.scss       入口：只做 @use 引入，不写样式
\`\`\`

### 1.1 七个目录的职责

| 目录 | 职责 | 是否输出 CSS | 示例 |
| --- | --- | --- | --- |
| abstracts | 变量/函数/mixin/占位符 | ❌ 不输出 | \`$color-primary\`、\`@mixin\` |
| base | 重置、全局基础样式 | ✅ 输出 | \`*\`、\`body\`、标题 |
| components | 独立可复用组件 | ✅ 输出 | \`.btn\`、\`.card\` |
| layout | 页面布局结构 | ✅ 输出 | \`.header\`、\`.grid\` |
| pages | 特定页面样式 | ✅ 输出 | \`.home-page\` |
| themes | 主题覆盖 | ✅ 输出 | \`.theme-dark\` |
| vendors | 第三方覆盖 | ✅ 输出 | 覆盖框架默认 |

### 1.2 main.scss 入口

入口文件只做「组装」，不写具体样式：

\`\`\`scss
// abstracts（先引入，后面要用）
@use "abstracts/variables";
@use "abstracts/mixins";

// base
@use "base/reset";
@use "base/typography";

// vendors
@use "vendors/bootstrap";

// layout
@use "layout/grid";
@use "layout/header";

// components
@use "components/button";
@use "components/card";

// pages
@use "pages/home";

// themes
@use "themes/dark";
\`\`\`

> 💡 \`@use\` 顺序很重要：abstracts 最先，base 次之，然后 vendors → layout → components → pages → themes。

## 二、目录结构组织原则

### 2.1 单一职责

每个文件只负责一件事：\`_button.scss\` 只放按钮，\`_card.scss\` 只放卡片。文件小、好找、好维护。

### 2.2 文件命名规范

- **下划线前缀**：\`_button.scss\` 表示「partial」（部分文件），不会被单独编译，只能被 \`@use\`
- **小写连字符**：\`_nav-bar.scss\` 而非 \`_NavBar.scss\`
- **语义命名**：用 \`_button.scss\` 而非 \`_btn.scss\`（太简写难懂）

### 2.3 文件粒度

一个组件一个文件，不要把所有组件塞进 \`_components.scss\`。文件多没关系，导航靠目录结构。

## 三、@use 模块化拆分

### 3.1 @use vs @import

\`@import\` 已废弃（全局污染、重复执行）。\`@use\` 是现代标准：

| 特性 | \`@import\`（废弃） | \`@use\`（推荐） |
| --- | --- | --- |
| 命名空间 | 无（全局污染） | 有（\`@use "vars"\` → \`vars.$x\`） |
| 重复引入 | 多次执行 | 只执行一次 |
| 成员可见性 | 全暴露 | 可用 \`@forward\` 转发 |

\`\`\`scss
// ❌ 废弃
@import "variables";
$primary; // 直接用，但不知来自哪

// ✅ 推荐
@use "abstracts/variables" as vars;
vars.$primary; // 带命名空间，来源清晰
\`\`\`

### 3.2 @use 的命名空间

\`\`\`scss
@use "sass:color";
@use "abstracts/variables"; // 默认命名空间 = 文件名（variables）
variables.$color-primary;

@use "abstracts/variables" as v; // 自定义命名空间
v.$color-primary;

@use "abstracts/variables" as *; // 无命名空间（不推荐，易污染）
\`\`\`

### 3.3 @forward 转发

\`@forward\` 把一个模块的成员「转发」给引用者，常用于做 index 文件：

\`\`\`scss
// abstracts/_index.scss
@forward "variables";
@forward "mixins";
@forward "functions";

// 别处只需
@use "abstracts" as *;
\`\`\`

### 3.4 @use 私有成员

下划线开头的成员是私有的，\`@use\` 不会暴露：

\`\`\`scss
// _functions.scss
$_internal: 10;       // 私有，外部不可见
@function public() {} // 公开
\`\`\`

## 四、设计令牌 design tokens

设计令牌是设计系统的「原子变量」：颜色、间距、字体、圆角、阴影等全部变量化。

\`\`\`scss
// abstracts/_variables.scss

// 颜色令牌
$color-primary: #3b82f6;
$color-primary-dark: #2563eb;
$color-success: #22c55e;
$color-danger: #ef4444;
$color-text: #1e293b;
$color-text-muted: #64748b;
$color-bg: #ffffff;
$color-border: #e2e8f0;

// 间距令牌（8px 网格）
$space-1: 0.25rem;
$space-2: 0.5rem;
$space-3: 0.75rem;
$space-4: 1rem;
$space-6: 1.5rem;
$space-8: 2rem;

// 字体令牌
$font-sans: system-ui, -apple-system, "Segoe UI", sans-serif;
$font-size-sm: 0.875rem;
$font-size-base: 1rem;
$font-size-lg: 1.125rem;

// 圆角令牌
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 12px;
$radius-full: 9999px;

// 阴影令牌
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);

// 断点令牌
$bp-md: 768px;
$bp-lg: 1024px;
\`\`\`

### 4.1 令牌分层

\`\`\`
令牌分层（参考设计系统）

  原始令牌（raw）        语义令牌（semantic）      组件令牌（component）
  $blue-500: #3b82f6  →  $color-primary: $blue-500  →  $btn-bg: $color-primary
      ↑                       ↑                          ↑
  色板原始值              表达用途                   组件专用
\`\`\`

换色板时只改原始令牌，语义层和组件无需动。

### 4.2 避免魔法数字

魔法数字（magic number）是写死且无意义的数值：

\`\`\`scss
// ❌ 魔法数字，没人知道 17 怎么来的
.card { padding: 17px; }

// ✅ 用令牌
.card { padding: $space-4; }
\`\`\`

所有数值都应来自令牌，确保一致性和可维护性。

## 五、BEM 命名与 Sass 配合

BEM = Block（块）+ Element（元素）+ Modifier（修饰符），是 CSS 命名约定，与 Sass 的 \`&\` 配合极佳。

### 5.1 BEM 结构

\`\`\`
.block              块：独立组件
.block__element     元素：块的内部部分（双下划线）
.block--modifier    修饰符：块/元素的变体（双连字符）
\`\`\`

\`\`\`scss
// HTML: <div class="card card--elevated">
//            <h2 class="card__title">标题</h2>
//            <div class="card__body">内容</div>
//          </div>
.card {
  &__title { font-size: 1.25rem; }
  &__body { color: #64748b; }
  &--elevated { box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
}
\`\`\`

### 5.2 BEM 的好处

1. **扁平选择器**：\`.card__title\` 而非 \`.card .title\`，优先级低、不依赖 DOM 嵌套
2. **避免冲突**：双下划线/双连字符命名独特，不会和别的组件撞名
3. **意图清晰**：看到 \`__\` 知道是子元素，\`--\` 知道是变体

### 5.3 用 mixin 简化 BEM

手写 \`&__title\` 还好，但可以用 mixin 更显式：

\`\`\`scss
@mixin element($name) {
  &__#{$name} { @content; }
}
@mixin modifier($name) {
  &--#{$name} { @content; }
}

.card {
  @include element(title) { font-size: 1.25rem; }
  @include modifier(elevated) { box-shadow: $shadow-lg; }
}
\`\`\`

## 六、组件化思维

### 6.1 什么是好组件

- **独立**：不依赖外部样式就能工作
- **可复用**：在多个页面都能用
- **可配置**：通过修饰符或变量改变外观
- **单一职责**：一个组件只做一件事

### 6.2 组件结构

\`\`\`scss
// components/_button.scss
@use "../abstracts/variables" as v;
@use "../abstracts/mixins" as m;

.btn {
  // 基础样式
  display: inline-block;
  padding: v.$space-2 v.$space-4;
  border: none;
  border-radius: v.$radius-md;
  background: v.$color-primary;
  color: white;
  cursor: pointer;

  // 状态
  &:hover { background: v.$color-primary-dark; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }

  // 修饰符
  &--sm { padding: v.$space-1 v.$space-2; font-size: v.$font-size-sm; }
  &--lg { padding: v.$space-3 v.$space-6; font-size: v.$font-size-lg; }
  &--block { display: block; width: 100%; }
  &--success { background: v.$color-success; }
}
\`\`\`

### 6.3 组件依赖

组件只依赖 abstracts（变量/mixin），不依赖其他组件。组件之间通过 HTML 组合，不通过 \`@extend\` 互相继承。

## 七、单一职责与避免魔法数字

### 7.1 单一职责

每个 SCSS 文件、每个选择器只负责一件事。不要在 \`_card.scss\` 里写按钮样式。

### 7.2 避免魔法数字

| ❌ 魔法数字 | ✅ 令牌 |
| --- | --- |
| \`padding: 13px\` | \`padding: $space-3\` |
| \`color: #4a5568\` | \`color: $color-text-muted\` |
| \`border-radius: 6px\` | \`border-radius: $radius-md\` |

### 7.3 用 Map 替代散乱变量

\`\`\`scss
// ❌ 散乱
$space-1: 0.25rem;
$space-2: 0.5rem;
// ...难遍历

// ✅ Map 化
$spacing: (1: 0.25rem, 2: 0.5rem, 4: 1rem);
@each $k, $v in $spacing {
  .m-#{$k} { margin: $v; }
}
\`\`\`

## 八、注释规范

### 8.1 注释类型

\`\`\`scss
// 单行注释：编译后消失（推荐用于内部说明）

/* 多行注释：编译后保留（用于版权、文件头） */

//! 重要注释：即使压缩模式也保留
\`\`\`

### 8.2 文件头注释

\`\`\`scss
/*!
 * Button 组件
 * 负责：按钮基础样式与变体
 * 依赖：abstracts/variables, abstracts/mixins
 * 作者：xxx
 */
\`\`\`

### 8.3 区块分隔

\`\`\`scss
// ============ 颜色令牌 ============
$color-primary: #3b82f6;

// ============ 间距令牌 ============
$space-1: 0.25rem;
\`\`\`

### 8.4 注释原则

1. **解释「为什么」而非「是什么」**：代码能看懂是什么，注释要说明设计原因
2. **别过度注释**：显然的代码不需注释
3. **保持同步**：改代码必改注释，过时注释比没注释更糟

## 九、版本管理与协作

### 9.1 Git 工作流

- SCSS 文件纳入 Git，PR review 把关样式质量
- 大改动开分支，避免直接动 main
- 提交信息说明改了哪些令牌/组件

### 9.2 令牌变更影响

改一个令牌（如 \`$color-primary\`）会影响所有引用它的组件。提交前全局搜索引用，确认影响范围。

### 9.3 设计令牌与设计稿同步

令牌应与 Figma/Sketch 设计稿一致。可用 Style Dictionary 等工具从设计稿自动生成令牌。

## 十、与 CSS Modules / Tailwind 共存

### 10.1 与 CSS Modules

Next.js/Vue 的 CSS Modules 会给类名加 hash。Sass 仍可正常用，只是类名被处理：

\`\`\`scss
// Button.module.scss
.btn {
  &--primary { background: $color-primary; }
}
// 编译为 .Button_btn__a1b2 + .Button_btn--primary__c3d4
\`\`\`

BEM 的 \`--\` 修饰符在 CSS Modules 里仍有效。

### 10.2 与 Tailwind 共存

两种策略：

1. **Tailwind 为主，Sass 补充**：用 Sass 写复杂组件、设计令牌，Tailwind 写工具类
2. **Sass 为主，Tailwind 备用**：用 Sass @apply? 不行——Tailwind 用 @apply 在 CSS 里，Sass 不直接支持。可在 PostCSS 阶段处理

\`\`\`
共存建议

  设计令牌 → Sass 变量（单一数据源）
  工具类   → Tailwind（m-4, text-center）
  组件     → Sass + BEM（复杂交互组件）
  布局     → Tailwind grid/flex
\`\`\`

### 10.3 令牌同步

Sass 令牌和 Tailwind 配置应同步。可从一份 JSON 生成两边配置（Style Dictionary）。

## 十一、性能优化

### 11.1 选择器效率

浏览器从右向左匹配选择器。**最右边的关键选择器决定性能**：

\`\`\`scss
// ❌ 关键选择器是 *，匹配所有元素再过滤，慢
.nav ul li a * { }

// ✅ 关键选择器具体，快
.nav-link { }
\`\`\`

规则：

1. **别超过 3 层嵌套**：\`.a .b .c .d .e\` 性能差
2. **避免通用选择器** \`*\` 做关键选择器
3. **用类选择器**：类比标签/属性选择器快
4. **BEM 扁平化**：\`.card__title\` 比 \`.card .title\` 快

### 11.2 @extend 膨胀

\`@extend\` 会把选择器串到一起，**容易产生爆炸式输出**：

\`\`\`scss
// ❌ @extend 导致选择器串联膨胀
%base { padding: 8px; }
.a { @extend %base; }
.b { @extend %base; }
.c { @extend %base; }
// 输出：.a, .b, .c { padding: 8px; }
// 看似无害，但 @extend 跨文件会串到一起，几十个选择器堆一行
\`\`\`

### 11.3 @extend vs @include vs placeholder

| 方式 | 行为 | 适用 |
| --- | --- | --- |
| \`@extend .class\` | 串联选择器 | ⚠️ 谨慎，易膨胀 |
| \`@extend %placeholder\` | 串联（占位符不输出） | 比 extend class 好，但仍膨胀 |
| \`@include mixin\` | 复制样式块 | ✅ 推荐，输出可预测 |
| CSS 变量 \`var()\` | 运行时引用 | ✅ 主题切换最佳 |

**现代建议**：少用 \`@extend\`，多用 \`@include\` 和 CSS 变量。

### 11.4 用 CSS 变量减体积

重复值用 CSS 变量，编译后只声明一次：

\`\`\`scss
:root { --primary: #3b82f6; }
.btn { background: var(--primary); }
.card { border-color: var(--primary); }
.link { color: var(--primary); }
\`\`\`

### 11.5 按需引入

只 \`@use\` 实际用到的模块。Sass 的 \`@use\` 是按需的，不会引入未用代码。

### 11.6 避免深嵌套

\`\`\`scss
// ❌ 深嵌套，输出长选择器
.nav {
  ul {
    li {
      a {
        span { color: red; }
      }
    }
  }
}
// 输出 .nav ul li a span { color: red; }

// ✅ BEM 扁平
.nav-link-label { color: red; }
\`\`\`

## 十二、注释与文档

### 12.1 SassDoc

SassDoc 是 Sass 的文档生成工具（类似 JSDoc）：

\`\`\`scss
/// 计算文字对比色
/// @param {Color} $bg - 背景色
/// @return {Color} 适合的文字色
/// @author xxx
@function text-on($bg) { ... }
\`\`\`

### 12.2 文档要点

- mixin/function 写参数说明
- 复杂逻辑写设计原因
- 令牌写取值依据

## 十三、综合架构示例

\`\`\`
一个中型项目的 sass/ 结构

sass/
├── abstracts/
│   ├── _variables.scss   颜色/间距/字体令牌
│   ├── _mixins.scss      响应式/BEM mixin
│   ├── _functions.scss   颜色派生函数
│   └── _index.scss       @forward 聚合
├── base/
│   ├── _reset.scss
│   └── _typography.scss
├── components/
│   ├── _button.scss
│   ├── _card.scss
│   ├── _form.scss
│   └── _badge.scss
├── layout/
│   ├── _grid.scss
│   ├── _header.scss
│   └── _footer.scss
├── pages/
│   └── _home.scss
├── themes/
│   ├── _light.scss
│   └── _dark.scss
├── vendors/
│   └── _overrides.scss
└── main.scss             入口，只 @use
\`\`\`

## 十四、最佳实践清单

1. **7-1 架构**：7 目录 + 1 入口，职责分明
2. **@use 替代 @import**：命名空间、按需、无污染
3. **设计令牌化**：颜色/间距/字体/圆角/阴影全变量化
4. **令牌分层**：原始 → 语义 → 组件
5. **BEM 命名**：扁平选择器，意图清晰
6. **单一职责**：一文件一组件
7. **避免魔法数字**：数值全走令牌
8. **少用 @extend**：用 @include/CSS 变量替代
9. **浅嵌套**：不超过 3 层
10. **注释解释 why**：不啰嗦 what
11. **令牌与设计稿同步**：Style Dictionary 自动化
12. **CSS 变量做主题**：切换低成本
13. **性能优先**：关键选择器具体、避免通用选择器

## 十五、常见错误

### 错误 1：用 \${} 插值

\`\`\`scss
// ❌ Sass 不支持 \${}
.btn--\${$name} { }
// ✅
.btn--#{$name} { }
\`\`\`

### 错误 2：@import 跨文件共享变量

\`\`\`scss
// ❌ @import 已废弃，且全局污染
@import "variables";

// ✅ @use 带命名空间
@use "abstracts/variables" as v;
v.$color-primary;
\`\`\`

### 错误 3：@extend 跨文件膨胀

\`\`\`scss
// ❌ 跨文件 @extend 导致选择器串到一起
@use "../components/button";
.card { @extend .btn; } // 把 .card 加到所有 .btn 出现处

// ✅ 用 mixin 或 CSS 变量
.card { @include button-base; }
\`\`\`

### 错误 4：魔法数字满地

\`\`\`scss
// ❌
.header { height: 87px; padding: 13px 29px; }
// ✅
.header { height: $header-height; padding: $space-3 $space-6; }
\`\`\`

### 错误 5：深嵌套

\`\`\`scss
// ❌ 5 层嵌套
.page .main .content .article .title { }
// ✅ BEM
.article__title { }
\`\`\`

## 十六、与其他方案对比

\`\`\`
Sass 7-1 vs Tailwind vs CSS-in-JS

  Sass 7-1     传统项目，设计系统，主题丰富，团队习惯写 CSS
  Tailwind     快速原型，工具类驱动，喜欢原子化
  CSS-in-JS    React 组件化，运行时主题，JS 生态

  → 可混合：Sass 做令牌/主题，Tailwind 做工具类
\`\`\`

## 十七、小结

- **7-1 架构**：abstracts/base/components/layout/pages/themes/vendors + main
- **@use 模块化**：替代 @import，命名空间清晰
- **设计令牌**：颜色/间距/字体/圆角/阴影变量化，分层管理
- **BEM**：扁平选择器，与 Sass \`&\` 配合
- **单一职责 + 无魔法数字**：可维护性基石
- **性能**：少 @extend、浅嵌套、具体关键选择器、CSS 变量减体积
- **共存**：与 CSS Modules/Tailwind 各取所长

下面这段 SCSS 用单文件演示 7-1 架构的令牌、mixin、BEM 组件、响应式布局和暗黑模式，注释标明了在真实项目里应如何拆分到各目录，可在预览区观察组件效果。`,
    code: `// ============================================================
// 第四章代码：项目架构与最佳实践（单文件演示 7-1 架构）
// ============================================================
// 实际项目会按 7-1 架构拆分到 abstracts/ base/ components/
// layout/ pages/ themes/ vendors/ 目录，本文件用注释分隔演示
@use "sass:color";

// ============== 1. abstracts/ —— 设计令牌（变量） ==============
// 颜色令牌
$color-primary: #3b82f6;
$color-primary-dark: #2563eb;
$color-success: #22c55e;
$color-danger: #ef4444;
$color-text: #1e293b;
$color-text-muted: #64748b;
$color-bg: #ffffff;
$color-surface: #f8fafc;
$color-border: #e2e8f0;

// 间距令牌（8px 网格，避免魔法数字）
$space-1: 0.25rem;
$space-2: 0.5rem;
$space-3: 0.75rem;
$space-4: 1rem;
$space-6: 1.5rem;
$space-8: 2rem;

// 字体令牌
$font-sans: system-ui, -apple-system, "Segoe UI", sans-serif;
$font-size-sm: 0.875rem;
$font-size-base: 1rem;
$font-size-lg: 1.125rem;
$font-size-xl: 1.25rem;
$line-height-base: 1.5;

// 圆角令牌
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 12px;
$radius-full: 9999px;

// 阴影令牌
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

// 断点令牌
$bp-md: 768px;
$bp-lg: 1024px;

// ============== 2. abstracts/ —— mixin 与函数 ==============
// 媒体查询 mixin（mobile-first）
@mixin md-up {
  @media (min-width: $bp-md) { @content; }
}
@mixin lg-up {
  @media (min-width: $bp-lg) { @content; }
}

// BEM 辅助 mixin：避免重复写父选择器
@mixin element($name) {
  &__#{$name} { @content; }
}
@mixin modifier($name) {
  &--#{$name} { @content; }
}

// ============== 3. base/ —— 基础样式 ==============
.sass-demo {
  font-family: $font-sans;
  font-size: $font-size-base;
  line-height: $line-height-base;
  color: $color-text;
  background: $color-bg;
  padding: $space-4;

  // ============== 4. components/ —— 按钮组件（BEM） ==============
  .btn {
    display: inline-block;
    padding: $space-2 $space-4;
    border: none;
    border-radius: $radius-md;
    font-size: $font-size-base;
    background: $color-primary;
    color: white;
    cursor: pointer;
    transition: background 0.2s;
    &:hover { background: $color-primary-dark; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }

    // BEM 修饰符
    @include modifier("block") { display: block; width: 100%; }
    @include modifier("sm") { padding: $space-1 $space-2; font-size: $font-size-sm; }
    @include modifier("lg") { padding: $space-3 $space-6; font-size: $font-size-lg; }
    @include modifier("success") { background: $color-success; }
    @include modifier("danger") { background: $color-danger; }
  }

  // ============== 5. components/ —— 卡片组件（BEM） ==============
  .card {
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    padding: $space-4;
    margin-bottom: $space-3;
    box-shadow: $shadow-sm;

    @include element("title") {
      font-size: $font-size-lg;
      margin: 0 0 $space-2;
      color: $color-text;
    }
    @include element("body") {
      color: $color-text-muted;
      font-size: $font-size-sm;
    }
    @include element("footer") {
      margin-top: $space-3;
      padding-top: $space-3;
      border-top: 1px solid $color-border;
    }
    @include modifier("elevated") {
      box-shadow: $shadow-lg;
    }
  }

  // ============== 6. layout/ —— 网格布局 ==============
  .grid {
    display: grid;
    gap: $space-3;
    grid-template-columns: 1fr;
    @include md-up { grid-template-columns: repeat(2, 1fr); }
    @include lg-up { grid-template-columns: repeat(3, 1fr); }
  }

  // ============== 7. components/ —— 列表 ==============
  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    li {
      padding: $space-2 $space-3;
      border-bottom: 1px solid $color-border;
      &:last-child { border-bottom: none; }
    }
  }

  // ============== 8. components/ —— 徽章 ==============
  .badge {
    display: inline-block;
    padding: $space-1 $space-2;
    border-radius: $radius-full;
    font-size: $font-size-sm;
    background: $color-primary;
    color: white;
  }

  // ============== 9. components/ —— 表单 ==============
  .form {
    display: flex;
    flex-direction: column;
    gap: $space-2;
    margin: $space-2 0;
    @include md-up { flex-direction: row; }
    input {
      padding: $space-2 $space-3;
      border: 1px solid $color-border;
      border-radius: $radius-sm;
      font-size: $font-size-base;
      flex: 1;
    }
  }

  // ============== 10. components/ —— 警告框 ==============
  .alert {
    padding: $space-2 $space-3;
    border-radius: $radius-md;
    margin-bottom: $space-2;
    &--success {
      background: color.change($color-success, $alpha: 0.1);
      color: $color-success;
    }
    &--danger {
      background: color.change($color-danger, $alpha: 0.1);
      color: $color-danger;
    }
  }
}

// ============== 11. themes/ —— 暗黑模式令牌覆盖 ==============
@media (prefers-color-scheme: dark) {
  .sass-demo {
    background: #0f172a;
    color: #f1f5f9;
    .card {
      background: #1e293b;
      border-color: #334155;
      &__body { color: #94a3b8; }
      &__footer { border-color: #334155; }
    }
    .list li { border-color: #334155; }
    .form input {
      background: #1e293b;
      border-color: #475569;
      color: #f1f5f9;
    }
  }
}

// ============== 12. 尊重「减少动画」（无障碍） ==============
@media (prefers-reduced-motion: reduce) {
  .sass-demo .btn { transition: none; }
}
`,
  },
];
