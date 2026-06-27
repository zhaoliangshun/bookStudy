// =============================================================
// Tailwind CSS 交互式教程 —— 第四批章节（共 4 章 · 进阶篇）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. tw-responsive      — 响应式设计
//   2. tw-darkmode        — 暗黑模式
//   3. tw-customization   — 自定义配置
//   4. tw-patterns        — 常用布局实战
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解（文字量是普通教程的 5 倍）
//   code    : 可预览的 HTML 片段（带 Tailwind class + 详细中文注释）
//
// 预览机制说明：
//   - 用户在编辑器里写的是 HTML 片段（不是可执行 JS）
//   - 前端用 <iframe> 加载 Tailwind Play CDN（https://cdn.tailwindcss.com）
//   - 把用户的 HTML 片段塞进 iframe 的 body 里实时渲染
//   - 因此 code 字段是 HTML 片段，不需要 <html><head> 外层结构
//   - 所有代码都带详细 HTML 注释 <!-- --> 说明每个 class 的作用
//   - 需要自定义配置时，可在片段开头用 <script>tailwind.config = {...}</script>
//     （Play CDN 支持，用于演示自定义主题、darkMode 等）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：响应式设计
  // =========================================================
  {
    id: "tw-responsive",
    title: "响应式设计",
    icon: "📱",
    group: "进阶",
    content: `## 响应式设计：一套代码，适配所有屏幕

在 2026 年的今天，用户访问你网站的设备种类前所未有地多：375px 的 iPhone SE、412px 的 Android 中端机、768px 的 iPad mini、1024px 的 iPad Pro 横屏、1280px 的笔记本电脑、1920px 的 1080p 显示器、2560px 的 2K 显示器、甚至 3840px 的 4K 大屏。如果为每种屏幕单独写一套 CSS，维护成本会爆炸；如果只写一套固定布局，在小屏上会出现横向滚动条、在大屏上会出现大片留白。

**响应式设计（Responsive Design）** 的核心思想就是：用同一套 HTML，配合"会随屏幕宽度变化"的 CSS，让界面在所有尺寸下都好用。而 Tailwind 把这件事做到了极致——它用**断点前缀**（\`sm:\` / \`md:\` / \`lg:\` / \`xl:\` / \`2xl:\`）这种极其简洁的语法，让你在同一个元素的 class 列表里直接描述"不同屏幕下不同的样式"，再也不用写一堆 \`@media\` 查询。

> 💡 **核心心法**：Tailwind 的响应式是 **mobile-first（移动优先）**。这一点怎么强调都不为过——你写的"无前缀"类是**所有屏幕的基础样式（也是最小屏幕的样式）**，加了断点前缀的类是"屏幕宽度达到该断点**及以上**时生效"的覆盖。理解了 mobile-first，你就理解了 Tailwind 响应式 90% 的内容；不理解 mobile-first，你会写出"在大屏正常、小屏错乱"的代码而不知为何。

## mobile-first 移动优先：Tailwind 响应式的灵魂

mobile-first 不是 Tailwind 发明的概念，它是响应式设计的最佳实践之一。意思是：**先为最小屏幕（手机）设计，再逐步增强到大屏**。

为什么是这个方向？因为手机屏幕小、约束多，把最精简、最核心的内容和布局先在手机上做对，能强迫你聚焦"什么最重要"。然后到大屏时，你有更多空间，可以展开更多列、显示更多细节——这是"增强"。反过来，如果先为大屏设计（复杂的 4 列布局），再往小屏"砍"内容，往往会砍得支离破碎，且容易遗漏。

### Tailwind 如何体现 mobile-first

Tailwind 的断点前缀对应的 CSS 是 \`min-width\` 媒体查询。例如：

\`\`\`css
/* md:text-2xl 编译后的 CSS（简化） */
.text-2xl { font-size: 1.5rem; }              /* 基础类：所有屏幕 */
@media (min-width: 768px) {
  .md\\:text-2xl { font-size: 1.5rem; }       /* md 及以上覆盖 */
}
\`\`\`

关键点：\`min-width: 768px\` 意味着"\`md:\` 前缀的样式在屏幕宽度 **≥768px** 时生效"。所以：

- **无前缀的类**：基础样式，**所有屏幕**都生效（包括最小的手机）。
- **\`sm:\` 类**：屏幕 ≥640px 时生效（覆盖基础样式）。
- **\`md:\` 类**：屏幕 ≥768px 时生效（覆盖 \`sm:\` 和基础）。
- **\`lg:\` 类**：屏幕 ≥1024px 时生效。
- 以此类推，**断点越大，优先级覆盖越靠后**。

### 一个最经典的例子

\`\`\`html
<!-- 一段文字：手机 base，平板 sm 加大，桌面 md 更大，大屏 lg 最大 -->
<p class="text-base sm:text-lg md:text-xl lg:text-2xl">
  这段文字会随屏幕变大而变大。
</p>
\`\`\`

渲染逻辑：
- 0~639px（手机）：\`text-base\`（1rem = 16px）
- 640~767px（大手机/小平板）：\`sm:text-lg\`（1.125rem = 18px）覆盖
- 768~1023px（平板）：\`md:text-xl\`（1.25rem = 20px）覆盖
- ≥1024px（桌面）：\`lg:text-2xl\`（1.5rem = 24px）覆盖

注意 CSS 特异性：由于 \`@media (min-width: 768px)\` 在基础规则**之后**声明，且选择器特异性相同，后声明的胜出——这就是"大屏覆盖小屏"的底层原理。

> ⚠️ **新手最大陷阱：写反方向**。很多人习惯了"桌面优先"思维，会写 \`text-2xl md:text-base\` 想表达"桌面大字、手机小字"。结果在手机上反而是 \`text-2xl\`（基础类，所有屏幕生效），\`md:text-base\` 要到 768px 以上才生效——**完全反了**！正确写法是 \`text-base md:text-2xl\`（基础小字，桌面变大）。**永远从最小屏幕开始写，往大屏加前缀**。

## 5 个默认断点

Tailwind 预设了 5 个断点，覆盖了从手机到超大桌面：

| 前缀 | 断点像素 | 断点 rem | 对应设备（典型） | min-width 媒体查询 |
| --- | --- | --- | --- | --- |
| \`sm:\` | 640px | 40rem | 大手机横屏 / 小平板 | \`@media (min-width: 640px)\` |
| \`md:\` | 768px | 48rem | iPad 竖屏 / 平板 | \`@media (min-width: 768px)\` |
| \`lg:\` | 1024px | 64rem | iPad 横屏 / 小笔记本 | \`@media (min-width: 1024px)\` |
| \`xl:\` | 1280px | 80rem | 标准桌面显示器 | \`@media (min-width: 1280px)\` |
| \`2xl:\` | 1536px | 96rem | 大桌面 / 2K 屏 | \`@media (min-width: 1536px)\` |

几个要点：

1. **没有默认的 \`xs:\`**：0~639px 就是"基础样式"的作用域，不需要前缀。如果你想要 \`xs:\`（比如 475px），需要自定义断点（见后文）。
2. **断点是"开区间下界"**：\`md:\` 在 ≥768px 生效，所以 767px 和 768px 是两个不同的样式状态——这是为什么预览时拖动窗口宽度到 768px 那一刻会"跳变"。
3. **断点之间无缝衔接**：640/768/1024/1280/1536 这些数字是 Tailwind 团队根据主流设备选的"公约数"，覆盖了绝大多数设备的宽度边界。
4. **rem 而非 px**：Tailwind 的断点用 \`rem\` 单位（根字号默认 16px），所以如果用户在浏览器里调大了默认字号，断点会随之缩放——这对可访问性是好事。

> 💡 **记忆口诀**：640 / 768 / 1024 / 1280 / 1536。前缀 \`sm md lg xl 2xl\`。把它们贴在显示器边上，写响应式时随时对照。

## 断点前缀写法

把断点前缀加在**任何工具类前面**，用冒号 \`:\` 分隔，就让它"只在指定断点及以上生效"：

\`\`\`html
<!-- 背景色：手机红，平板(md)蓝 -->
<div class="bg-red-500 md:bg-blue-500">...</div>

<!-- 显示方式：手机隐藏，桌面(md)显示为块 -->
<div class="hidden md:block">...</div>

<!-- 网格列数：手机 1 列，平板 2 列，桌面 3 列，大屏 4 列 -->
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">...</div>

<!-- Flex 方向：手机纵向，桌面横向 -->
<div class="flex flex-col md:flex-row">...</div>
\`\`\`

### 前缀可以加在几乎所有类上

不只是布局类，**颜色、间距、字号、圆角、阴影、动画……几乎所有工具类都支持断点前缀**：

\`\`\`html
<!-- 响应式间距 -->
<div class="p-4 md:p-8 lg:p-12">...</div>

<!-- 响应式圆角 -->
<div class="rounded md:rounded-lg lg:rounded-2xl">...</div>

<!-- 响应式阴影 -->
<div class="shadow md:shadow-lg lg:shadow-xl">...</div>

<!-- 响应式字重 -->
<p class="font-normal md:font-semibold">...</p>
\`\`\`

> ⚠️ **前缀不能加在变体前缀之后**：写法顺序是 \`断点:状态:类名\`，例如 \`md:hover:bg-blue-500\`（桌面端悬停变蓝）。不能写成 \`hover:md:bg-blue-500\`。状态前缀（hover/focus 等）和断点前缀的顺序固定为"断点在前、状态在后"。

## min-width vs max-width：两种方向

前面讲了，Tailwind 默认的断点前缀是 \`min-width\` 方向（达到该宽度**及以上**生效）。但有时候你想要"**仅在小于某宽度时**生效"——比如"只在手机上显示汉堡菜单按钮，桌面隐藏"。

v3.2+ 引入了 **\`max-*\` 前缀**，正好解决这个反向需求：

| 前缀 | 含义 | 等价媒体查询 |
| --- | --- | --- |
| \`max-sm:\` | 屏幕 <640px 时生效（即手机） | \`@media (max-width: 639.98px)\` |
| \`max-md:\` | 屏幕 <768px 时生效 | \`@media (max-width: 767.98px)\` |
| \`max-lg:\` | 屏幕 <1024px 时生效 | \`@media (max-width: 1023.98px)\` |
| \`max-xl:\` | 屏幕 <1280px 时生效 | \`@media (max-width: 1279.98px)\` |
| \`max-2xl:\` | 屏幕 <1536px 时生效 | \`@media (max-width: 1535.98px)\` |

\`\`\`html
<!-- 汉堡按钮：仅手机显示（<768px），桌面隐藏 -->
<button class="max-md:block hidden">☰</button>

<!-- 侧边栏：手机时全宽，桌面固定宽度 -->
<aside class="max-md:w-full md:w-64">...</aside>
\`\`\`

### min-width 与 max-width 的边界对应关系

\`sm:\`（≥640px）和 \`max-sm:\`（<640px）是**互补**的一对，合起来覆盖所有宽度。同理 \`md:\` 和 \`max-md:\`。注意 \`max-sm:\` 的边界是 639.98px（不含 640），与 \`sm:\` 的 640px 严丝合缝。

> 💡 **何时用 max-* 前缀**：当你表达"**仅小屏**"的语义时，用 \`max-*\` 比"基础类 + 大屏覆盖"更直观。例如"汉堡菜单仅手机显示"，写 \`max-md:block hidden\`（≤767px 显示，否则隐藏）比写 \`block md:hidden\`（默认显示，768px+ 隐藏）语义更清晰——前者一眼能看出"这是手机专属"。但两种写法效果相同，看团队习惯。

### min-width 与 max-width 混用陷阱

⚠️ **不要在同一个属性上同时用 min 和 max 前缀，否则容易冲突**。例如：

\`\`\`html
<!-- ❌ 危险：max-md:text-lg 和 md:text-base 在 768px 边界可能冲突 -->
<p class="max-md:text-lg md:text-base">...</p>
\`\`\`

在 768px 这一刻，\`max-md:\` 失效（因为不再 <768），\`md:\` 生效——理论上没冲突。但因为 CSS 特异性相同，顺序决定胜负，容易踩坑。**建议：同一个属性要么全用 min 方向，要么全用 max 方向，不要混**。

## 多断点组合：阶梯式响应

真实项目里，一个元素往往要经历 3~4 个断点的样式变化，形成"阶梯"。这是响应式最常见写法：

\`\`\`html
<!-- 标题字号阶梯 -->
<h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
  阶梯式标题
</h1>

<!-- 网格列数阶梯 -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  <!-- 卡片们 -->
</div>

<!-- 容器内边距阶梯 -->
<div class="px-4 sm:px-6 md:px-8 lg:px-12">...</div>

<!-- Flex 方向 + 间距阶梯 -->
<div class="flex flex-col gap-4 md:flex-row md:gap-8">...</div>
\`\`\`

写阶梯的关键：**从最小屏写到最大屏，每个断点只写"变化的部分"**。不需要每个断点都重写所有属性——基础类已经设了默认，断点类只覆盖需要变的。

> 💡 **阶梯的"连贯性"**：阶梯不是越长越好。3~4 个断点足够覆盖绝大多数场景。如果发现要写 5 个以上的断点才能让布局好看，多半是布局思路有问题（比如用了固定宽度而非弹性布局）。

## 响应式设计实战场景

### 场景 1：卡片网格从 1 列到多列

这是响应式最经典的场景——电商商品列表、博客文章列表、特性卡片，都是"手机 1 列、平板 2 列、桌面 3~4 列"。

\`\`\`html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  <div class="bg-white rounded-lg shadow p-4">卡片 1</div>
  <div class="bg-white rounded-lg shadow p-4">卡片 2</div>
  <!-- ... -->
</div>
\`\`\`

逻辑：手机 1 列（\`grid-cols-1\`），≥640px 变 2 列，≥1024px 变 3 列，≥1280px 变 4 列。\`gap-4\` 控制卡片间距（所有屏幕统一 1rem，也可做阶梯 \`gap-2 md:gap-6\`）。

### 场景 2：导航栏从抽屉到水平

手机屏幕窄，导航菜单只能折叠成"汉堡按钮 + 抽屉/下拉"；桌面屏幕宽，菜单水平展开。这是响应式最复杂的场景之一。

\`\`\`html
<nav class="flex items-center justify-between p-4">
  <!-- Logo：始终显示 -->
  <div class="font-bold">Logo</div>
  <!-- 汉堡按钮：仅手机显示（md:hidden = 桌面隐藏） -->
  <button class="md:hidden">☰</button>
  <!-- 菜单：手机隐藏（hidden），桌面水平显示（md:flex） -->
  <div class="hidden md:flex gap-6">
    <a href="#">首页</a>
    <a href="#">产品</a>
    <a href="#">关于</a>
  </div>
</nav>
\`\`\`

注意 \`md:hidden\`（汉堡按钮在桌面隐藏）和 \`hidden md:flex\`（菜单在手机隐藏、桌面显示）的对称配合——这是响应式导航的"标配组合"。

> ⚠️ **抽屉的展开需要 JS**：上面的例子中，汉堡按钮点击后展开菜单需要一小段 JavaScript（监听点击 toggle 菜单的 \`hidden\`）。也可以用纯 CSS 的 checkbox + peer 技巧实现，本章节的 demo 用了 peer 技巧，无需 JS。

### 场景 3：响应式字号

正文、标题、Hero 文案都应该响应式。手机上字太大占满屏幕，桌面太小又显得"小气"：

\`\`\`html
<h1 class="text-3xl md:text-5xl lg:text-6xl font-bold">超大标题</h1>
<p class="text-sm md:text-base lg:text-lg text-gray-600">正文描述</p>
\`\`\`

### 场景 4：隐藏/显示元素

很多元素"只在小屏"或"只在大屏"显示。组合 \`hidden\` 和 \`block\`/\`flex\` 即可：

\`\`\`html
<!-- 仅桌面显示的侧边广告 -->
<aside class="hidden lg:block">桌面广告</aside>

<!-- 仅手机显示的底部导航栏 -->
<nav class="md:hidden fixed bottom-0">手机底部栏</nav>

<!-- 仅大屏显示的装饰图 -->
<img class="hidden xl:block" src="..." />
\`\`\`

| 需求 | 写法 |
| --- | --- |
| 仅手机显示 | \`md:hidden\`（默认显示，768px+ 隐藏）或 \`max-md:block hidden\` |
| 仅桌面显示 | \`hidden md:block\`（默认隐藏，768px+ 显示） |
| 仅大屏显示 | \`hidden lg:block\` |
| 手机和桌面都显示，但样式不同 | 用断点前缀覆盖样式，而非隐藏 |

## 容器 container：响应式最大宽度

\`container\` 类是一个特殊的工具类，它会根据当前断点设置 \`max-width\`，让内容在大屏上不至于无限拉伸：

\`\`\`html
<div class="container mx-auto px-4">
  <!-- 内容最大宽度随断点变化 -->
</div>
\`\`\`

\`container\` 在各断点的 \`max-width\`：

| 断点 | container 的 max-width |
| --- | --- |
| <640px（基础） | 100%（无限制） |
| sm (≥640px) | 640px |
| md (≥768px) | 768px |
| lg (≥1024px) | 1024px |
| xl (≥1280px) | 1280px |
| 2xl (≥1536px) | 1536px |

也就是说，\`container\` 让内容宽度"跟着断点走"——到了 md 断点，内容最宽 768px，居中显示，两侧留白。常用于"页面主内容区"。

> 💡 **container 的常见搭配**：\`container mx-auto px-4\`（居中 + 左右内边距）。\`mx-auto\` 必须加，否则 container 不会居中；\`px-4\` 防止内容贴边。也可以用响应式内边距 \`container mx-auto px-4 sm:px-6 lg:px-8\`。

> ⚠️ **container vs max-w-7xl**：很多人更喜欢用 \`max-w-7xl mx-auto px-4\` 而非 \`container\`——前者内容在大屏统一限宽 80rem（1280px），不会随断点跳变；后者每个断点都跳一次宽度。视设计而定，"统一限宽"更现代，"逐级跟随"更经典。

## 响应式陷阱大全

### 陷阱 1：断点重叠导致样式"打架"

\`\`\`html
<!-- ❌ 期望：手机红，平板(md)蓝，桌面(lg)绿 -->
<div class="bg-red-500 md:bg-blue-500 lg:bg-green-500">...</div>
\`\`\`

这个写法是对的——但理解清楚：在 lg(≥1024px) 时，\`md:bg-blue-500\` 和 \`lg:bg-green-500\` **同时生效**，但 \`lg:\` 在 \`md:\` 之后声明（CSS 顺序），所以绿色胜出。这是"大屏覆盖小屏"的正常工作。但如果你写反了顺序（\`lg:\` 在前 \`md:\` 在后），就会出错——不过 Tailwind 的 CSS 生成顺序是固定的（按断点从小到大），所以你 class 里写的顺序不影响最终结果。**放心写，Tailwind 会按断点顺序正确层叠**。

### 陷阱 2：忘写基础类，小屏"裸奔"

\`\`\`html
<!-- ❌ 只写了 md: 的样式，手机上没有任何样式 -->
<div class="md:bg-blue-500 md:p-4">...</div>
\`\`\`

在手机上（<768px），这个 div 没有背景色、没有内边距——因为基础类没写。**正确做法**：先写基础类（手机样式），再加断点覆盖。

\`\`\`html
<!-- ✅ 基础类 + 断点覆盖 -->
<div class="bg-blue-500 p-4 md:bg-green-500 md:p-8">...</div>
\`\`\`

### 陷阱 3：max-* 与 min-* 混用导致边界闪烁

如前文所述，同一属性混用 \`max-md:\` 和 \`md:\` 在 768px 边界可能闪烁。**建议统一方向**。

### 陷阱 4：响应式只改了布局，没改交互

响应式不只是"列数变化"，还包括"交互模式变化"。例如：

- 桌面用 hover 下拉菜单，手机应改为点击展开（手机没有 hover）。
- 桌面用鼠标拖拽排序，手机应改为长按拖拽或上下移动按钮。
- 桌面 tooltip 用 hover 显示，手机应改为点击或常驻显示。

### 陷阱 5：在 iframe 里测试断点不准

本教程的预览是 iframe，iframe 的宽度受外层容器限制。如果你想测试某个断点的效果，需要**把预览区拖到对应宽度**（例如拖到 800px 测试 \`md:\`）。在真实开发中，用 Chrome DevTools 的设备模拟器更准确。

## 自定义断点

默认 5 个断点不够用时，可在 \`tailwind.config.js\` 的 \`theme.screens\`（或 \`theme.extend.screens\`）自定义：

\`\`\`js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      screens: {
        xs: '475px',      // 新增超小屏断点
        '3xl': '1920px',  // 新增超大屏断点
      }
    }
  }
}
\`\`\`

配置后即可用 \`xs:\` 和 \`3xl:\` 前缀。**注意用 \`extend.screens\` 是追加，直接写 \`theme.screens\` 是覆盖（会丢失默认 5 个）**。

> 💡 **CDN 模式自定义断点**：本教程预览用 Play CDN，可以这样配置：\`<script>tailwind.config = { theme: { extend: { screens: { xs: '475px' } } } }</script>\`。配置后 \`xs:\` 前缀即可用。

### 自定义断点的常见需求

| 需求 | 配置 |
| --- | --- |
| 增加 \`xs\`（475px，超小手机） | \`screens: { xs: '475px' }\` |
| 覆盖默认断点值 | \`theme: { screens: { md: '800px' } }\`（直接覆盖，非 extend） |
| 命名断点（语义化） | \`screens: { tablet: '768px', desktop: '1024px' }\` → \`tablet:\`/\`desktop:\` |
| 范围断点（max-width） | v3.2+ 用 \`max-*\` 前缀，或自定义 \`{ sm: { max: '640px' } }\` |

## 响应式设计的"思考流程"

写响应式时，推荐按这个流程思考：

1. **先在手机上把布局做对**（基础类）。手机空间最小，最能逼你想清楚"什么最重要"。
2. **预想大屏的布局**（\`md:\` 或 \`lg:\`）。例如手机 1 列，桌面想变 3 列——加 \`md:grid-cols-3\`。
3. **检查中间断点**（\`sm:\`）。有时手机到桌面跨度太大，中间需要过渡，例如手机 1 列 → 平板 2 列 → 桌面 3 列。
4. **检查超大屏**（\`xl:\`/\`2xl:\`）。如果内容在 1920px 上显得空旷，加 \`max-w-7xl mx-auto\` 限宽。
5. **测试交互**。每个断点都点一遍，确保 hover、点击、滚动都正常。

> 💡 **设计稿断点对齐**：和设计师约定好"只出 3 套设计稿：手机(375)、平板(768)、桌面(1280)"，对应 \`base\`/\`md:\`/\`xl:\`。不要让设计师出 10 套稿——开发对应不上，徒增沟通成本。

## 常见陷阱总结

1. **mobile-first 方向反了**：永远从最小屏写起，大屏用前缀覆盖。
2. **忘写基础类**：基础类是所有屏幕的默认，断点类只是覆盖。
3. **min/max 混用**：同一属性别混用 \`max-*\` 和 \`*\` 前缀。
4. **断点不是越多越好**：3~4 个断点足够，太多说明布局思路有问题。
5. **只改布局不改交互**：hover 在手机上不存在，要换点击。
6. **container 不居中**：\`container\` 必须配 \`mx-auto\`。
7. **iframe 测试要拖宽度**：预览区宽度决定断点，别在宽屏上只测了 \`lg:\`。
8. **自定义断点用 extend**：\`theme.extend.screens\` 追加，\`theme.screens\` 覆盖。

## 动手试试

下面的演示覆盖了：响应式网格（1→2→3→4 列）、响应式导航栏（汉堡/水平切换，纯 CSS 实现）、响应式字号阶梯、隐藏/显示元素对照、container 容器。**修改预览区宽度**（拖动窗口或用 DevTools 设备模拟）能看到各断点的样式跳变。试着改断点值、列数、字号感受 mobile-first 的工作方式。`,
    code: `<!-- ============================================================ -->
<!-- 第一章演示：响应式设计全览                                       -->
<!-- 包含：响应式网格 / 响应式导航 / 响应式字号 / 隐藏显示 / 容器     -->
<!--                                                              -->
<!-- 📌 测试方法：拖动预览区宽度，观察在 640/768/1024/1280px 的跳变  -->
<!-- ============================================================ -->

<!-- 外层容器：max-w-6xl 限宽 72rem，mx-auto 居中，p-4 md:p-8 响应式内边距 -->
<div class="max-w-6xl mx-auto p-4 md:p-8 space-y-10">

  <!-- ============ 区块 1：响应式网格（1→2→3→4 列） ============ -->
  <section>
    <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-2">① 响应式网格</h2>
    <!-- 说明文字：text-sm md:text-base 响应式字号，text-gray-500 灰色 -->
    <p class="text-sm md:text-base text-gray-500 mb-4">
      手机 1 列 · ≥640px 2 列 · ≥768px 3 列 · ≥1024px 4 列。拖动预览区宽度观察跳变。
    </p>

    <!-- 网格容器：grid + 阶梯列数 + gap 阶梯间距 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
      <!-- 8 个卡片，统一样式：bg-white + 圆角 + 阴影 + 内边距 + 居中文字 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center text-sm text-gray-700">卡片 1</div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center text-sm text-gray-700">卡片 2</div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center text-sm text-gray-700">卡片 3</div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center text-sm text-gray-700">卡片 4</div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center text-sm text-gray-700">卡片 5</div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center text-sm text-gray-700">卡片 6</div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center text-sm text-gray-700">卡片 7</div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center text-sm text-gray-700">卡片 8</div>
    </div>
  </section>

  <!-- ============ 区块 2：响应式导航栏（纯 CSS 抽屉） ============ -->
  <section>
    <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-2">② 响应式导航栏</h2>
    <p class="text-sm md:text-base text-gray-500 mb-4">
      手机显示汉堡按钮（点击展开菜单）；≥768px 汉堡消失，菜单水平展开。用 checkbox + peer 纯 CSS 实现。
    </p>

    <!-- 导航栏：bg-gray-900 深色背景 -->
    <nav class="bg-gray-900 rounded-lg overflow-hidden">
      <div class="max-w-5xl mx-auto px-4">
        <!-- 顶部行：flex 居中对齐，h-16 高 4rem -->
        <div class="flex items-center justify-between h-14 md:h-16">
          <!-- Logo：text-white font-bold，始终显示 -->
          <div class="text-white font-bold text-lg">🚀 Logo</div>

          <!-- 汉堡按钮：md:hidden（桌面隐藏）。label 关联隐藏的 checkbox -->
          <label for="nav-toggle" class="md:hidden text-white text-2xl cursor-pointer select-none leading-none">☰</label>
        </div>

        <!-- 隐藏的 checkbox：peer 让后续元素能根据它的选中状态变化 -->
        <!-- hidden 隐藏复选框本身；peer 类让它成为"兄弟元素的参照" -->
        <input type="checkbox" id="nav-toggle" class="hidden peer" />

        <!-- 菜单容器：
             手机：hidden 默认隐藏，peer-checked:flex 勾选时显示为 flex（纵向）
             桌面：md:flex 始终显示为 flex（横向），peer-checked 不影响 -->
        <div class="hidden peer-checked:flex md:flex flex-col md:flex-row md:items-center gap-2 md:gap-6 pb-4 md:pb-0">
          <a href="#" class="text-gray-300 hover:text-white text-sm md:py-0 py-2 block">首页</a>
          <a href="#" class="text-gray-300 hover:text-white text-sm md:py-0 py-2 block">产品</a>
          <a href="#" class="text-gray-300 hover:text-white text-sm md:py-0 py-2 block">价格</a>
          <a href="#" class="text-gray-300 hover:text-white text-sm md:py-0 py-2 block">关于</a>
          <!-- 按钮：mt-2 手机留上间距，md:mt-0 桌面顶齐 -->
          <a href="#" class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded md:ml-2 mt-2 md:mt-0 text-center">登录</a>
        </div>
      </div>
    </nav>
  </section>

  <!-- ============ 区块 3：响应式字号阶梯 ============ -->
  <section>
    <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-2">③ 响应式字号阶梯</h2>
    <p class="text-sm md:text-base text-gray-500 mb-4">同一个标题在不同屏幕下字号递增。手机不挤、桌面不小。</p>

    <!-- 大标题：text-3xl(手机) → sm:text-4xl → md:text-5xl → lg:text-6xl -->
    <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
      响应式标题：随屏幕变大
    </h1>
    <!-- 副标题：text-base → md:text-lg → lg:text-xl -->
    <p class="text-base md:text-lg lg:text-xl text-gray-600 mt-3 max-w-2xl">
      正文也会响应式变大。注意 mobile-first：基础类 text-base 是所有屏幕的默认，断点类只是覆盖。
    </p>
  </section>

  <!-- ============ 区块 4：隐藏 / 显示元素对照 ============ -->
  <section>
    <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-2">④ 隐藏 / 显示元素</h2>
    <p class="text-sm md:text-base text-gray-500 mb-4">hidden md:block = 手机隐藏桌面显示；md:hidden = 手机显示桌面隐藏。</p>

    <!-- 两个对照卡片，分别在不同断点显示 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 仅手机显示：md:hidden（≥768px 隐藏） -->
      <div class="md:hidden bg-blue-50 border border-blue-200 rounded-lg p-4 text-center text-sm text-blue-700">
        📱 仅手机显示（md:hidden）
      </div>
      <!-- 仅桌面显示：hidden md:block（<768px 隐藏） -->
      <div class="hidden md:block bg-green-50 border border-green-200 rounded-lg p-4 text-center text-sm text-green-700">
        🖥️ 仅桌面显示（hidden md:block）
      </div>
    </div>

    <!-- max-* 前缀演示：max-md:block hidden = <768px 显示 -->
    <div class="mt-4 max-md:block hidden bg-amber-50 border border-amber-200 rounded-lg p-4 text-center text-sm text-amber-700">
      ⚠️ 用 max-md:block hidden 实现"仅手机显示"（v3.2+ 写法）
    </div>
  </section>

  <!-- ============ 区块 5：容器 container ============ -->
  <section>
    <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-2">⑤ 容器 container</h2>
    <p class="text-sm md:text-base text-gray-500 mb-4">container 让内容宽度随断点限宽，配合 mx-auto 居中、px-4 防贴边。</p>

    <!-- container 类：各断点自动限宽 + mx-auto 居中 + px-4 sm:px-6 响应式内边距 -->
    <div class="container mx-auto px-4 sm:px-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 text-center">
      <p class="text-gray-700 text-sm">container 内容区：拖宽预览区，看到它在大屏不再无限拉伸，而是逐级限宽并居中。</p>
    </div>

    <!-- 对比：max-w-3xl 统一限宽 -->
    <div class="max-w-3xl mx-auto mt-4 bg-gray-100 rounded-lg p-6 text-center">
      <p class="text-gray-700 text-sm">max-w-3xl：统一限宽 48rem，不随断点跳变（更现代的写法）。</p>
    </div>
  </section>

  <!-- ============ 区块 6：响应式间距 + 方向综合 ============ -->
  <section>
    <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-2">⑥ 综合：响应式方向 + 间距</h2>
    <p class="text-sm md:text-base text-gray-500 mb-4">手机纵向堆叠 + 紧凑间距；桌面横向排列 + 宽松间距。</p>

    <!-- flex 容器：手机纵向 flex-col gap-4，桌面横向 md:flex-row md:gap-8 -->
    <div class="flex flex-col md:flex-row gap-4 md:gap-8 bg-white border border-gray-200 rounded-lg p-4 md:p-6">
      <!-- 三个子元素：手机时 flex-1 撑满纵向，桌面时 flex-1 平分横向 -->
      <div class="flex-1 bg-indigo-50 rounded p-4 text-center text-sm text-indigo-700">区块 A</div>
      <div class="flex-1 bg-indigo-50 rounded p-4 text-center text-sm text-indigo-700">区块 B</div>
      <div class="flex-1 bg-indigo-50 rounded p-4 text-center text-sm text-indigo-700">区块 C</div>
    </div>
  </section>

</div>`,
  },

  // =========================================================
  // 第二章：暗黑模式
  // =========================================================
  {
    id: "tw-darkmode",
    title: "暗黑模式",
    icon: "🌙",
    group: "进阶",
    content: `## 暗黑模式：不只是"换个深色背景"

暗黑模式（Dark Mode）在 2018 年随 macOS Mojave 普及，之后 iOS、Android、Windows、所有主流浏览器都跟进了系统级暗黑模式，用户对其期望已成常态。一个现代 Web 应用如果只提供浅色主题，会被认为"不完整"。

但暗黑模式**远不只是把背景改成黑色、文字改成白色**这么简单。它涉及：色彩对比度的重新校准、品牌色在深色背景上的可读性、阴影在深色背景上的"消失"问题、状态色（成功/警告/错误）的色相调整、图片和插图的适配……一个做得好的暗黑模式，往往比浅色模式更难——因为深色背景上"什么颜色都显得太亮"，需要克制和调低饱和度。

Tailwind 用 \`dark:\` 前缀把暗黑模式做成了一等公民，让你能像写响应式一样写"主题切换"——同一套 HTML，配两套样式（浅色 + 深色），通过一个开关切换。本章将**深入**讲解三种 \`darkMode\` 策略、\`dark:\` 前缀的原理、切换按钮的实现，以及深色配色的设计要点。

> 💡 **核心心法**：暗黑模式本质是"**为同一元素写两套样式，按主题切换**"。Tailwind 的 \`dark:\` 前缀让你在 class 列表里同时写两套，例如 \`bg-white dark:bg-gray-900 text-gray-900 dark:text-white\`。前端怎么知道用哪套？取决于 \`darkMode\` 配置——跟随系统（media）或手动切换（class/selector）。

## 为什么需要暗黑模式

在动手前，先理解"为什么"，才能做对"怎么做"。暗黑模式的核心价值：

1. **夜间护眼**：深色背景减少屏幕发光面积，在暗环境下显著降低眼睛疲劳。这是用户最直接的诉求。
2. **省电（OLED 屏）**：OLED 屏幕黑色像素不发光，深色主题能省电 10~40%（视内容而定）。这对手机续航是实打实的提升。
3. **专注感**：深色背景让内容（文字、图片）更突出，适合长时间阅读、代码编辑、设计软件。VS Code、Figma、Linear 默认深色就是这个原因。
4. **高级感**：深色界面在视觉上更"沉稳""科技"，很多产品（如 Vercel、Linear、Arc 浏览器）用深色作为品牌主色调。
5. **用户期望**：当系统是暗黑模式时，用户期望 Web 应用也跟着变暗——如果应用还是刺眼的白色，会有"违和感"。

但也有**不适合暗黑模式**的场景：

- **内容密集的长文本阅读**（如维基百科、新闻）：浅色背景 + 深色文字的对比度最高，长时间阅读深色反而更累（光晕效应）。
- **印刷品预览**：纸张是白的，预览也应保持白底。
- **图表密集的数据看板**：深色背景上颜色辨识度下降，除非专门为深色调色。

> ⚠️ **不要无脑全黑**：纯黑（\`#000\`）背景配纯白（\`#fff\`）文字对比度过高（21:1），在 OLED 上反而刺眼，且会让阴影完全看不见。**推荐深灰背景**（如 \`gray-900\` = \`#111827\` 或 \`#0a0a0a\`），文字用 \`gray-100\` 而非纯白。这是主流暗黑模式（GitHub、VS Code、Linear）的共同选择。

## dark: 前缀：Tailwind 的暗黑模式语法

\`dark:\` 是一个**变体前缀**，和 \`hover:\`/\`focus:\` 同类。它修饰一个工具类，让该类"在暗黑模式下生效"：

\`\`\`html
<!-- 浅色：白底深字；深色：深底浅字 -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  这段文字会随主题切换。
</div>
\`\`\`

\`dark:\` 前缀几乎可以加在所有工具类上：颜色、边框、阴影、透明度、甚至渐变。

\`\`\`html
<!-- 响应式 + 暗黑组合：sm: 和 dark: 可叠加 -->
<div class="bg-gray-100 sm:bg-white dark:bg-gray-800 dark:sm:bg-gray-900">
  组合前缀
</div>

<!-- 渐变也能 dark -->
<div class="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-700">
  渐变切换
</div>

<!-- 边框、阴影、分隔线 -->
<div class="border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
  边框阴影
</div>
\`\`\`

> 💡 **\`dark:\` 与 \`sm:\` 等断点前缀的顺序**：\`sm:dark:\` 或 \`dark:sm:\` 都可以，Tailwind 会正确处理。但推荐统一一种顺序（团队约定），保持代码整洁。

## 三种 darkMode 策略

\`dark:\` 前缀"什么时候生效"，由 \`darkMode\` 配置决定。Tailwind 提供三种策略：

### 策略 1：media（默认，跟随系统）

\`\`\`js
// tailwind.config.js
module.exports = {
  darkMode: 'media',  // 默认值，可省略
}
\`\`\`

\`media\` 策略下，\`dark:\` 前缀对应 \`@media (prefers-color-scheme: dark)\` 媒体查询。当**用户的操作系统/浏览器**设置为暗黑模式时，\`dark:\` 类自动生效。

\`\`\`css
/* dark:bg-gray-900 在 media 策略下编译为 */
@media (prefers-color-scheme: dark) {
  .dark\\:bg-gray-900 { background-color: #111827; }
}
\`\`\`

**优点**：零配置、零 JS，完全跟随系统，用户体验一致（系统暗 → 应用自动暗）。

**缺点**：**用户无法在应用内手动切换**——如果系统是浅色但用户想在这个应用里用深色，做不到。这对"主题偏好独立于系统"的产品（如代码编辑器、设计工具）是硬伤。

### 策略 2：class（手动切换，最常用）

\`\`\`js
// tailwind.config.js
module.exports = {
  darkMode: 'class',  // 改为 class 策略
}
\`\`\`

\`class\` 策略下，\`dark:\` 前缀对应"祖先元素（通常是 \`<html>\`）有 \`dark\` 类"这个条件。即：

\`\`\`css
/* dark:bg-gray-900 在 class 策略下编译为 */
.dark .dark\\:bg-gray-900 { background-color: #111827; }
\`\`\`

只要 \`<html class="dark">\`，所有 \`dark:\` 类生效；移除 \`dark\` 类，恢复浅色。**切换主题 = 切换 \`<html>\` 上的 \`dark\` 类**，用一行 JS 即可：

\`\`\`js
document.documentElement.classList.toggle('dark');
\`\`\`

**优点**：用户可在应用内自由切换，不依赖系统；可记忆用户偏好（localStorage）；可默认跟随系统但允许覆盖。

**缺点**：需要一小段 JS 来切换；初始加载时如果没正确设置 \`dark\` 类，会"闪一下"白屏（FOUC）——需要在 \`<head>\` 里提前跑一段内联脚本读取 localStorage 设置初始类。

> 💡 **\`class\` 是生产环境最常用的策略**。绝大多数 Web 应用都用 \`class\` + 一个切换按钮 + localStorage 记忆 + 初始内联脚本防闪烁。本章节的 demo 就是这个完整方案。

### 策略 3：selector（v3.4.1+，自定义选择器）

\`\`\`js
// tailwind.config.js
module.exports = {
  darkMode: 'selector',  // 或 ['selector', '[data-theme="dark"]']
}
\`\`\`

\`selector\` 策略是 \`class\` 的泛化版——你可以指定**任意 CSS 选择器**作为"暗黑模式触发条件"。默认等价于 \`class\`（用 \`.dark\`），但可以改成 \`[data-theme="dark"]\`、\`.theme-dark\` 等。

\`\`\`js
// 用 data-theme 属性触发
darkMode: ['selector', '[data-theme="dark"]']
\`\`\`

这样 \`<html data-theme="dark">\` 时 \`dark:\` 生效。适合需要**多套主题**（不止深浅两套）或与现有主题系统（如 CSS 变量主题）集成的场景。

> ⚠️ **\`class\` 与 \`selector\` 的关系**：\`selector\` 是 v3.4.1 引入的超集，\`class\` 等价于 \`['selector', '.dark']\`。新项目推荐用 \`selector\`（更灵活），老项目继续用 \`class\` 也完全没问题。两者切换主题的 JS 一样——都是操作触发元素的那个类/属性。

## prefers-color-scheme：系统暗黑偏好

CSS 媒体查询 \`prefers-color-scheme\` 反映用户的系统级主题偏好：

\`\`\`css
@media (prefers-color-scheme: dark) {
  /* 用户系统是暗黑模式 */
}
@media (prefers-color-scheme: light) {
  /* 用户系统是浅色模式 */
}
\`\`\`

用户可以在操作系统（macOS 的"通用"设置、Windows 的"颜色"、iOS/Android 的"显示"）或浏览器（Chrome 的 appearance 设置）里切换。这个偏好会被 \`darkMode: 'media'\` 自动读取。

在 \`class\` 策略下，如果你想"**默认跟随系统，但允许用户手动覆盖**"，可以用 JS 读取系统偏好作为初始值：

\`\`\`js
// 读取系统偏好
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
// 读取用户记忆（优先级高于系统）
const saved = localStorage.getItem('theme');
// 决定初始主题：用户记忆 > 系统偏好
if (saved === 'dark' || (!saved && prefersDark)) {
  document.documentElement.classList.add('dark');
}
\`\`\`

这是生产环境的标准做法——既尊重系统，又给用户控制权。

## 实战：带切换按钮的暗黑模式

下面是一个完整的暗黑模式示例，包含：

1. \`darkMode: 'class'\` 配置（CDN 模式用 \`<script>tailwind.config = { darkMode: 'class' }</script>\`）。
2. 一个切换按钮，点击 toggle \`<html>\` 的 \`dark\` 类。
3. 一张卡片，展示浅色/深色两套样式。

切换按钮的 JS 很简单：

\`\`\`js
function toggleTheme(btn) {
  // 切换 <html> 的 dark 类
  var isDark = document.documentElement.classList.toggle('dark');
  // 更新按钮文字（让用户看到当前状态）
  btn.textContent = isDark ? '🌙 切换到浅色' : '☀️ 切换到深色';
}
\`\`\`

按钮通过 \`onclick="toggleTheme(this)"\` 绑定。整个方案无需任何框架，纯原生 JS。

> ⚠️ **CDN 配置必须在 HTML 之前**：\`<script>tailwind.config = {...}</script>\` 要放在 HTML 片段**最前面**，这样 Tailwind Play CDN 在扫描 class 生成 CSS 时就已经知道用 \`class\` 策略。如果放在后面，首次渲染可能用错策略。

## 深色配色的设计要点

写暗黑模式时，"颜色怎么选"比"语法怎么写"更难。下面是经验总结：

### 1. 背景用深灰，不用纯黑

| 选择 | 颜色 | 说明 |
| --- | --- | --- |
| ❌ 纯黑 | \`#000000\` | 对比度过高刺眼，阴影看不见 |
| ✅ 深灰 | \`gray-900\` (\`#111827\`) | 主流选择，柔和 |
| ✅ 更深灰 | \`gray-950\` (\`#030712\`) | 想要更"沉浸"可选 |
| ✅ 带色相的深色 | \`slate-900\`/\`zinc-900\` | 比纯灰更有质感 |

### 2. 文字用浅灰，不用纯白

| 选择 | 颜色 | 说明 |
| --- | --- | --- |
| ❌ 纯白 | \`#ffffff\` | 太亮，长读刺眼 |
| ✅ 浅灰主文字 | \`gray-100\` (\`#f3f4f6\`) | 主流主文字色 |
| ✅ 中灰次文字 | \`gray-400\` (\`#9ca3af\`) | 次要描述、占位符 |
| ✅ 深灰辅助文字 | \`gray-500\` (\`#6b7280\`) | 时间戳、disabled |

### 3. 品牌色"降一档"

浅色背景上 \`blue-600\` 看着正好，但深色背景上 \`blue-600\` 会显得太暗（对比度不够）。深色模式下品牌色通常**调亮一档**（\`blue-500\` 或 \`blue-400\`）：

\`\`\`html
<button class="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600">
  按钮
</button>
\`\`\`

### 4. 阴影在深色上"消失"

浅色背景上 \`shadow-md\` 很明显，但深色背景上阴影（黑色半透明）和背景几乎融为一体，看不见。深色模式通常**降低阴影强度**或改用**边框/亮色高光**替代：

\`\`\`html
<div class="shadow-md dark:shadow-none dark:border dark:border-gray-700">
  卡片
</div>
\`\`\`

### 5. 状态色调整

- ✅ 成功绿：浅色 \`green-600\`，深色 \`green-500\`（提亮）。
- ⚠️ 警告黄：浅色 \`amber-500\`，深色 \`amber-400\`（提亮，否则看不清）。
- ❌ 错误红：浅色 \`red-600\`，深色 \`red-500\` 或 \`red-400\`。

### 6. 图片和插图

白色背景的图片在深色模式下会很刺眼。可以用 \`dark:opacity-90\` 略微降低，或为图片加圆角和边框把它"框"起来。SVG 插图如果是 \`currentColor\`，会自动跟随文字色，最省心。

## 对比度：可访问性底线

深色模式下容易踩"对比度不足"的坑。WCAG AA 标准要求：

| 内容类型 | 正常文字（<18px） | 大文字（≥18px 或 ≥14px 粗体） |
| --- | --- | --- |
| 对比度 | ≥4.5:1 | ≥3:1 |

工具推荐：Chrome DevTools 的"Elements → Accessibility"面板会显示文字对比度，或用 [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)。

常见低对比度错误：

- \`gray-500\` 文字配 \`gray-900\` 背景 → 对比度 ~3.2:1，不达标。
- \`gray-400\` 文字配 \`gray-800\` 背景 → 对比度 ~4.8:1，达标。
- \`blue-600\` 按钮配白字在深色模式 → 蓝色背景 + 白字对比度只有 ~3.9:1，需用 \`blue-500\` 或 \`blue-700\`。

## 防闪烁（FOUC）：初始主题的正确设置

用 \`class\` 策略时，如果初始 \`<html>\` 没有 \`dark\` 类，页面会先以浅色渲染，等 JS 跑完加上 \`dark\` 类才切换——这中间的"白闪一下"叫 **FOUC（Flash of Unstyled Content）**。在暗黑用户眼里非常刺眼。

解决：在 \`<head>\` 里放一段**阻塞式内联脚本**，在渲染前就设置好初始类：

\`\`\`html
<head>
  <script>
    // 在 CSS 渲染前执行，读取偏好并设置初始 dark 类
    (function() {
      var saved = localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    })();
  </script>
</head>
\`\`\`

> ⚠️ **本教程预览的限制**：iframe 里无法控制 \`<head>\`，所以 demo 会有轻微闪烁。真实项目把这段脚本放 \`<head>\` 即可避免。本 demo 用按钮手动切换，不涉及 FOUC。

## 常见陷阱总结

1. **忘配 \`darkMode: 'class'\`**：默认 \`media\` 策略下 \`dark:\` 只跟随系统，按钮切换无效。想手动切换必须配 \`class\`。
2. **切换的是 \`<html>\` 不是 \`<body>\`**：\`class\` 策略检查的是 \`<html>\`（documentElement）上的 \`dark\` 类，不是 \`<body>\`。
3. **纯黑纯白刺眼**：用 \`gray-900\` + \`gray-100\`，别用 \`#000\` + \`#fff\`。
4. **深色阴影看不见**：深色模式改用边框或降低阴影。
5. **品牌色不调亮**：深色背景下 \`*-600\` 偏暗，提亮到 \`*-500\`/\`*-400\`。
6. **FOUC 白闪**：\`class\` 策略需在 \`<head>\` 提前设置初始类。
7. **对比度不足**：用 DevTools 检查，确保 ≥4.5:1。
8. **图片在深色下刺眼**：加圆角边框框住，或降透明度。

## 动手试试

下面的演示配了 \`darkMode: 'class'\`（通过 CDN 的 \`<script>tailwind.config\`），点击右上角的切换按钮会在浅色/深色间切换。试着点击按钮，观察卡片背景、文字、边框、按钮颜色的变化——所有 \`dark:\` 前缀的类都会生效。改一下 \`dark:\` 后的颜色值，再点击切换看效果。`,
    code: `<!-- ============================================================ -->
<!-- 第二章演示：暗黑模式（带切换按钮）                               -->
<!--                                                              -->
<!-- 关键：在 HTML 片段开头注入 darkMode: 'class' 配置              -->
<!--       Play CDN 会读取该配置，让 dark: 前缀基于 .dark 类生效    -->
<!-- ============================================================ -->

<!-- ① 注入 Tailwind 配置：darkMode 改为 class 策略 -->
<!-- 必须放在 HTML 之前，让 CDN 在扫描 class 时就知道用 class 策略 -->
<script>
  tailwind.config = {
    darkMode: 'class',
    // 顺便演示一个自定义品牌色，让按钮在深浅两套下都好看
    theme: {
      extend: {
        colors: {
          brand: {
            50:  '#eff6ff',
            100: '#dbeafe',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8'
          }
        }
      }
    }
  }
</script>

<!-- ② 主题切换脚本：toggle <html> 上的 dark 类，并更新按钮文字 -->
<script>
  // 切换函数：被按钮的 onclick 调用
  function toggleTheme(btn) {
    // documentElement 就是 <html> 元素
    // classList.toggle('dark')：有 dark 就移除返回 false，没有就加上返回 true
    var isDark = document.documentElement.classList.toggle('dark');
    // 根据当前状态更新按钮显示文字，让用户清楚现在是什么主题
    btn.textContent = isDark ? '🌙 切换到浅色' : '☀️ 切换到深色';
  }
</script>

<!-- ③ 页面主体：浅色 bg-gray-50，深色 dark:bg-gray-900 -->
<!-- min-h-screen 至少占满一屏，transition-colors 切换时有过渡动画 -->
<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 py-8 px-4">

  <!-- 切换按钮容器：max-w-2xl 居中，flex 右对齐 -->
  <div class="max-w-2xl mx-auto flex justify-end mb-6">
    <!-- 按钮：onclick 调用 toggleTheme，传入 this（按钮自身） -->
    <!-- 浅色：bg-white 深字 + 边框；深色：dark:bg-gray-800 浅字 + 深边框 -->
    <button onclick="toggleTheme(this)"
            class="px-4 py-2 rounded-lg text-sm font-medium
                   bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200
                   border border-gray-200 dark:border-gray-700
                   hover:bg-gray-100 dark:hover:bg-gray-700
                   transition-colors shadow-sm">
      ☀️ 切换到深色
    </button>
  </div>

  <!-- ============ 区块 1：主题卡片 ============ -->
  <!-- 卡片：浅色白底，深色深灰底；边框、阴影都切换 -->
  <div class="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-none dark:border dark:border-gray-700 p-8 transition-colors duration-300">

    <!-- 标题：浅色 gray-900，深色 gray-100 -->
    <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
      暗黑模式示例卡片
    </h1>
    <!-- 副标题：浅色 gray-600，深色 gray-400（次要文字） -->
    <p class="text-gray-600 dark:text-gray-400 mb-6">
      点击右上角按钮切换主题。所有 dark: 前缀的类会同时生效——背景、文字、边框、按钮。
    </p>

    <!-- 信息行：flex 横排，gap-4 间距 -->
    <div class="flex items-center gap-4 mb-6">
      <!-- 头像：rounded-full，ring 边框切换 -->
      <div class="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-lg">
        A
      </div>
      <div>
        <!-- 用户名：主文字色 -->
        <div class="font-semibold text-gray-900 dark:text-gray-100">Alex Zhang</div>
        <!-- 角色：次要文字色 -->
        <div class="text-sm text-gray-500 dark:text-gray-400">前端工程师</div>
      </div>
    </div>

    <!-- 标签行：三个标签，每个都切换背景和文字 -->
    <div class="flex flex-wrap gap-2 mb-6">
      <!-- 标签1：浅色蓝底深字，深色蓝底浅字（提亮一档） -->
      <span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
        Tailwind
      </span>
      <span class="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
        响应式
      </span>
      <span class="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
        主题切换
      </span>
    </div>

    <!-- 主按钮：浅色 brand-600，深色 brand-500（提亮一档） -->
    <button class="w-full bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600
                   text-white font-semibold py-2.5 rounded-lg transition-colors
                   focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
      关注作者
    </button>
  </div>

  <!-- ============ 区块 2：深浅色对照说明 ============ -->
  <div class="max-w-2xl mx-auto mt-6 grid grid-cols-2 gap-4">
    <!-- 浅色说明卡 -->
    <div class="bg-white border border-gray-200 rounded-lg p-4">
      <div class="text-xs font-semibold text-gray-500 mb-1">浅色模式（light）</div>
      <div class="text-sm text-gray-900">bg-white · text-gray-900</div>
      <div class="text-xs text-gray-500 mt-1">白底深字，对比度高</div>
    </div>
    <!-- 深色说明卡：直接写死深色，不切换，做对照 -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div class="text-xs font-semibold text-gray-400 mb-1">深色模式（dark）</div>
      <div class="text-sm text-gray-100">bg-gray-900 · text-gray-100</div>
      <div class="text-xs text-gray-400 mt-1">深灰底浅字，护眼</div>
    </div>
  </div>

</div>`,
  },

  // =========================================================
  // 第三章：自定义配置
  // =========================================================
  {
    id: "tw-customization",
    title: "自定义配置",
    icon: "⚙️",
    group: "进阶",
    content: `## 自定义配置：让 Tailwind 变成"你团队的"设计系统

Tailwind 开箱即用的默认值（颜色板、间距刻度、断点、字体）覆盖了 80% 的通用场景，但真实项目几乎一定要自定义——你的品牌色不会恰好是 \`blue-500\`，你的字体不会恰好是系统默认无衬线，你的断点可能要加一个 \`xs\`，你的卡片圆角可能统一是 \`12px\` 而非 \`8px\`。

\`tailwind.config.js\` 就是 Tailwind 的"控制中心"——它让你在不写一行自定义 CSS 的前提下，把 Tailwind 调整成完全契合你项目的设计系统。配置得当的 Tailwind，**全团队写出来的代码天然一致**（因为可选的值都是预设好的），这正是 Utility-First 的精髓：约束带来一致。

本章将**深入**讲解配置文件的完整结构、\`theme.extend\` vs \`theme\` 的关键区别、各类设计令牌（颜色/间距/字体/断点/阴影/动画）的自定义方法、插件系统、任意值语法，以及 CDN 模式下的配置方式。

> 💡 **核心心法**：自定义配置的目标是"**让常用的值变成预设类，少用任意值**"。如果你的项目里到处是 \`bg-[#1da1f2]\`、\`p-[13px]\`、\`rounded-[11px]\`，说明配置没做好——这些值应该提前写进 \`theme.extend\`，变成 \`bg-twitter\`/\`p-3.5\`/\`rounded-card\`。**配置 = 把"项目约定"固化为"工具类"**。

## tailwind.config.js 的作用与结构

\`tailwind.config.js\` 是 Tailwind 的可选配置文件（用 \`npx tailwindcss init\` 生成）。它是一个 CommonJS 模块，导出一个配置对象：

\`\`\`js
// tailwind.config.js
module.exports = {
  // 暗黑模式策略：false | 'media' | 'class' | 'selector'
  darkMode: 'media',

  // 内容扫描：告诉 Tailwind 去哪些文件扫描 class，决定 tree-shaking
  content: [
    './src/**/*.{html,js,jsx,ts,tsx,vue}',
    './index.html',
  ],

  // 主题：设计令牌（颜色、间距、字体等）的定义
  theme: {
    extend: {
      // 扩展（推荐）：在默认值基础上追加，不丢失默认
      colors: { /* ... */ },
      spacing: { /* ... */ },
    },
    // 直接写 theme.xxx 会"覆盖"默认（慎用）
  },

  // 变体：哪些状态前缀可用（hover/focus/dark 等），一般不用改
  variants: {},

  // 插件：引入官方或第三方插件
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
\`\`\`

四大核心字段：\`content\`（扫描哪些文件）、\`theme\`（设计令牌）、\`plugins\`（插件）、\`darkMode\`（暗黑策略，上一章讲过）。下面逐一深入。

## content 字段：tree-shaking 的命脉

\`content\` 是**最重要的字段**——它决定 Tailwind 扫描哪些文件来"找出你用了哪些 class"，进而只生成这些 class 的 CSS（tree-shaking）。配置错的话，要么 CSS 体积爆炸（漏扫描 → 全生成），要么 class 不生效（没扫到 → 没生成）。

\`\`\`js
content: [
  // 扫描 src 下所有 html/js/jsx/ts/tsx/vue 文件
  './src/**/*.{html,js,jsx,ts,tsx,vue}',
  // 根目录的 index.html
  './index.html',
  // 第三方组件库的源码（如果有）
  './node_modules/my-ui-lib/src/**/*.{js,ts}',
]
\`\`\`

要点：

1. **用 glob 模式**：\`**/*.{js,jsx}\` 匹配任意深度的 .js/.jsx 文件。
2. **要全**：漏掉某个目录，那个目录里用的 class 就不会生成 CSS（界面"没样式"）。
3. **别扫 node_modules 全部**：只扫你真正用到的组件库，否则扫描慢、产物大。
4. **不要扫 .md/.txt 等非代码文件**：除非里面真的写了 class（如文档站）。
5. **CDN 模式不需要 content**：Play CDN 在浏览器里实时扫描 DOM，不需要 \`content\` 配置。

> ⚠️ **class 必须是"完整的字符串字面量"**才能被扫描到。Tailwind 用正则提取 class 名，**不能是动态拼接**：

\`\`\`html
<!-- ✅ 完整字面量：能被扫描 -->
<div class="bg-blue-500 text-white">...</div>

<!-- ❌ 动态拼接：扫不到，CSS 不生成，没样式 -->
<div class="bg-{{color}}-500">...</div>
<div :class="'bg-' + color + '-500'">...</div>
\`\`\`

如果必须动态，把所有可能的完整 class 列出来（哪怕没用）：\`class="bg-blue-500 bg-red-500 bg-green-500"\`，或用 \`safelist\` 配置。

## theme.extend vs theme：扩展 vs 覆盖

这是配置里**最关键的概念**，也是新手最常踩的坑。

\`theme\` 对象下，有两种写法：

### 写法 1：theme.extend（扩展，推荐）

\`\`\`js
theme: {
  extend: {
    colors: {
      brand: '#3b82f6',  // 在默认颜色板基础上"加一个" brand
    }
  }
}
\`\`\`

\`extend\` 是**追加**——默认的 \`red\`/\`blue\`/\`gray\` 等全部保留，额外加一个 \`brand\`。**绝大多数情况用 extend**。

### 写法 2：theme.xxx 直接写（覆盖，慎用）

\`\`\`js
theme: {
  colors: {
    brand: '#3b82f6',  // 直接写会"覆盖"整个 colors！
  }
}
\`\`\`

直接在 \`theme.colors\` 下写，会**完全替换**默认颜色板——后果是 \`bg-blue-500\`/\`text-red-600\` 等全部失效！只有当你确实要"不要任何默认色，全自定义"时才这么做（极罕见）。

| 写法 | 效果 | 适用场景 |
| --- | --- | --- |
| \`theme.extend.colors = { brand: ... }\` | 默认色 + brand（追加） | **推荐**，绝大多数情况 |
| \`theme.colors = { brand: ... }\` | 只剩 brand（覆盖） | 极端自定义，不要默认色 |

> ⚠️ **必踩坑**：新手看到 \`theme: { colors: {...} }\` 就直接往里写，结果整个项目的 \`text-gray-600\` 全失效，界面塌了。**记住：自定义一律放 \`extend\` 里**，除非你有明确理由覆盖。

## 自定义颜色 theme.extend.colors

颜色是最常自定义的令牌。你的品牌色、语义色（success/warning/danger/info）、行业色（金融的红绿、医疗的青）都该配进来。

\`\`\`js
theme: {
  extend: {
    colors: {
      // 单值颜色
      brand: '#3b82f6',

      // 调色板（带 50~950 档位，推荐）
      brand: {
        50:  '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554',
      },

      // 语义色（用 default 键做"无档位"主色）
      success: '#10b981',
      danger:  { DEFAULT: '#ef4444', light: '#fca5a5' },
    }
  }
}
\`\`\`

配置后即可用：

\`\`\`html
<!-- 单值 -->
<button class="bg-brand text-white">按钮</button>

<!-- 调色板档位 -->
<button class="bg-brand-600 hover:bg-brand-700 text-white">按钮</button>
<div class="bg-brand-50 text-brand-700">浅底深字</div>

<!-- 语义色 -->
<div class="text-success">成功</div>
<div class="bg-danger text-white">危险</div>
<div class="bg-danger-light">浅红背景</div>
\`\`\`

> 💡 **品牌色一定要配完整档位**（至少 50/100/500/600/700/900）。原因：你要做 hover 态（\`brand-600 → brand-700\`）、浅底深字（\`brand-50 + brand-700\`）、禁用态（\`brand-300\`）、深色模式（提亮一档）——这些都需要不同档位。只配一个 \`brand: '#3b82f6'\` 远远不够。

> 💡 **生成调色板的工具**：用 [uicolors.app](https://uicolors.app/) 或 [tailwindcolor.com](https://tailwindcolor.com/)，输入一个主色，自动生成 50~950 全档位。

## 自定义间距 theme.extend.spacing

\`spacing\` 是一个**"基底令牌"**——它不仅控制 \`p-*\`/\`m-*\`/\`gap-*\`，还影响 \`w-*\`/\`h-*\`/\`top-*\` 等所有和尺寸相关的类。Tailwind 默认间距以 0.25rem（4px）为步长：\`p-4\` = 1rem = 16px。

\`\`\`js
theme: {
  extend: {
    spacing: {
      // 加一个 4.5rem (72px) 的间距
      '18': '4.5rem',
      // 命名间距（语义化）
      'safe': 'env(safe-area-inset-bottom)',  // iOS 安全区
      'screen-1/2': '50vh',
    }
  }
}
\`\`\`

配置后：\`p-18\`/\`m-18\`/\`w-18\`/\`h-18\`/\`gap-18\` 全部可用，\`pb-safe\`/\`h-screen-1/2\` 也可用。

> ⚠️ **不要覆盖默认 spacing**：\`theme.spacing = {...}\` 会让 \`p-4\`/\`m-8\` 等全部失效。永远用 \`extend\`。

## 自定义字体 theme.extend.fontFamily

\`\`\`js
theme: {
  extend: {
    fontFamily: {
      // 覆盖默认 sans（无衬线主字体）
      sans: ['Inter', 'system-ui', 'sans-serif'],
      // 加一个 display（展示字体，标题用）
      display: ['Poppins', 'sans-serif'],
      // 等宽字体
      mono: ['JetBrains Mono', 'monospace'],
    }
  }
}
\`\`\`

配置后：\`font-sans\`（默认 body 字体）、\`font-display\`（标题字体）、\`font-mono\`（代码字体）。\`font-sans\` 还会作为全局默认（Preflight 里 \`html { font-family: theme('fontFamily.sans') }\`）。

\`\`\`html
<h1 class="font-display text-4xl">展示标题（Poppins）</h1>
<p class="font-sans">正文（Inter）</p>
<code class="font-mono">const x = 1</code>
\`\`\`

> 💡 **字体加载**：配置 \`fontFamily\` 只是告诉 Tailwind "用这个名字"，字体文件本身要在 CSS 里 \`@import\` 或 \`<link>\` 加载。Google Fonts 一行 \`<link>\` 即可。中文 Web 字体很大（几 MB），建议用字体子集化（fontmin）或系统字体兜底。

## 自定义断点 theme.extend.screens

上一章提到过，这里再强调。加新断点用 \`extend.screens\`：

\`\`\`js
theme: {
  extend: {
    screens: {
      xs: '475px',    // 超小屏
      '3xl': '1920px', // 超大屏
    }
  }
}
\`\`\`

配置后 \`xs:\`/\`3xl:\` 前缀可用。要**覆盖**默认断点值（如把 \`md\` 改成 800px），用 \`theme.screens\`（非 extend）。

## 自定义阴影 / 圆角 / 动画

### 阴影 theme.extend.boxShadow

\`\`\`js
theme: {
  extend: {
    boxShadow: {
      // 自定义命名阴影
      'soft': '0 2px 8px rgba(0,0,0,0.06)',
      'card': '0 4px 12px rgba(0,0,0,0.08)',
      'glow': '0 0 20px rgba(59,130,246,0.5)',  // 发光效果
    }
  }
}
\`\`\`

用 \`shadow-soft\`/\`shadow-card\`/\`shadow-glow\`。

### 圆角 theme.extend.borderRadius

\`\`\`js
theme: {
  extend: {
    borderRadius: {
      '4xl': '2rem',      // 比 3xl 更大
      'card': '0.75rem',  // 命名圆角
    }
  }
}
\`\`\`

### 动画 theme.extend.animation + keyframes

\`\`\`js
theme: {
  extend: {
    // 定义关键帧
    keyframes: {
      'wiggle': {
        '0%, 100%': { transform: 'rotate(-3deg)' },
        '50%':      { transform: 'rotate(3deg)' },
      }
    },
    // 定义动画类
    animation: {
      'wiggle': 'wiggle 1s ease-in-out infinite',
      'fade-in': 'fadeIn 0.5s ease-out',
    }
  }
}
\`\`\`

用 \`animate-wiggle\`/\`animate-fade-in\`。

## 自定义工具类：addUtilities / addComponents / addVariant

当 \`theme\` 不够用（要加全新的工具类或组件类），用插件 API 在 \`plugins\` 里写：

\`\`\`js
const plugin = require('tailwindcss/plugin')

module.exports = {
  plugins: [
    // 1. addUtilities：加工具类（如 .text-balance）
    plugin(function({ addUtilities }) {
      addUtilities({
        '.text-balance': { 'text-wrap': 'balance' },
        '.text-pretty':  { 'text-wrap': 'pretty' },
      })
    }),

    // 2. addComponents：加组件类（如 .btn）
    plugin(function({ addComponents }) {
      addComponents({
        '.btn': {
          '@apply px-4 py-2 rounded font-medium transition': {},
          // 也可直接写 CSS
        }
      })
    }),

    // 3. addVariant：加新变体前缀（如 hocus = hover+focus）
    plugin(function({ addVariant }) {
      addVariant('hocus', ['&:hover', '&:focus'])
    }),
  ]
}
\`\`\`

- \`addUtilities\`：加原子工具类（一行 CSS 属性），如 \`text-balance\`。
- \`addComponents\`：加组件类（一组属性），如 \`btn\`/\`card\`。注意 \`.btn\` 会破坏"全 utility"纯粹性，团队有争议，慎用。
- \`addVariant\`：加新前缀，如 \`hocus:\` = \`hover:\` + \`focus:\` 合并。

## 插件 plugins：官方生态

Tailwind 官方维护了几个高质量插件，开箱即用：

| 插件 | 安装 | 作用 |
| --- | --- | --- |
| \`@tailwindcss/forms\` | \`npm i -D @tailwindcss/forms\` | 美化表单元素（input/select/checkbox 默认样式） |
| \`@tailwindcss/typography\` | 同上 | 给 \`prose\` 容器加排版（博客文章、Markdown 渲染） |
| \`@tailwindcss/aspect-ratio\` | 同上 | \`aspect-w-*\`/\`aspect-h-*\` 锁定宽高比（v3 已内置 \`aspect-*\`，老版本用插件） |
| \`@tailwindcss/line-clamp\` | 同上 | \`line-clamp-*\` 截断多行文字（v3.3 已内置，无需插件） |
| \`@tailwindcss/container-queries\` | 同上 | 容器查询 \`@container\`（v4 已内置） |

\`\`\`js
plugins: [
  require('@tailwindcss/forms'),        // 表单美化
  require('@tailwindcss/typography'),   // 排版
]
\`\`\`

> 💡 **\`@tailwindcss/typography\` 的 \`prose\`**：给富文本容器加 \`class="prose"\`，里面的 \`<h1>/<p>/<ul>/<a>\` 等自动有美观排版。写博客、文档站必备。

## 任意值语法 [value]：逃生舱

不想配配置、想用一个一次性的值？用方括号写**任意值**：

\`\`\`html
<!-- 任意颜色 -->
<div class="bg-[#1da1f2]">Twitter 蓝</div>

<!-- 任意间距 -->
<div class="p-[13px]">13px 内边距</div>

<!-- 任意字号 -->
<p class="text-[15px]">15px 字号</p>

<!-- 任意圆角 -->
<div class="rounded-[12px]">12px 圆角</div>

<!-- 任意栅格 -->
<div class="grid-cols-[200px_1fr_100px]">三列网格</div>

<!-- 任意选择器（v3.x） -->
<div class="[&:hover]:bg-blue-500">hover 变蓝（任意变体）</div>
\`\`\`

任意值**无需配置即可用**，是"应急逃生舱"。但代价：

1. **不能复用**：每个任意值都是一次性的，下次要用还得再写一遍。
2. **CSS 体积**：每个任意值生成独立规则，多了体积膨胀。
3. **失去一致性**：\`p-[13px]\` 和 \`p-3\`(12px) 差 1px，团队各写各的，界面失协调。

> ⚠️ **任意值 vs 配置**：如果一个值用了**3 次以上**，就值得写进 \`theme.extend\` 变成预设类。用了 1~2 次的临时值，用任意值没问题。

## CDN 模式下的配置方式

本教程预览用 Play CDN，配置方式略有不同——不用 \`tailwind.config.js\` 文件，而是在引入 CDN 后用 \`<script>tailwind.config = {...}</script>\` 设置：

\`\`\`html
<!-- 引入 CDN -->
<script src="https://cdn.tailwindcss.com"></script>
<!-- 注入配置 -->
<script>
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          brand: { 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' }
        },
        fontFamily: {
          display: ['Poppins', 'sans-serif']
        }
      }
    }
  }
</script>
\`\`\`

CDN 配置后，\`bg-brand-500\`/\`font-display\` 等自定义类即可在 HTML 里使用。**本章节的 demo 就是这个方式**——在 HTML 片段开头注入配置，然后用自定义品牌色和字体。

> ⚠️ **CDN 模式只用于开发**：Play CDN 在浏览器里实时编译 CSS，体积大、性能差，**不能用于生产**。生产要用 PostCSS 或 CLI 预编译。本教程用 CDN 是为了在线预览方便。

## 配置的最佳实践

1. **一律用 \`extend\`**：避免误覆盖默认值。
2. **品牌色配全档位**：50/100/500/600/700/900 至少要有。
3. **语义化命名**：\`brand\`/\`success\`/\`danger\` 比 \`my-blue\`/\`my-green\` 更易记。
4. **content 配全**：漏扫 = 没样式。
5. **任意值克制用**：超 3 次就配置化。
6. **团队共享配置**：把 \`tailwind.config.js\` 提交到仓库，全团队一致。
7. **多项目复用**：抽成单独的 \`@your-org/tailwind-config\` npm 包，各项目 extends。

## 常见陷阱总结

1. **\`theme.colors\` 覆盖默认**：永远用 \`extend\`。
2. **content 漏扫**：动态拼接的 class 扫不到，要用完整字面量。
3. **品牌色只配一个值**：做不了 hover/浅底深字，要配档位。
4. **CDN 配置在 HTML 之后**：首次渲染用错配置，要放最前面。
5. **任意值滥用**：CSS 膨胀、失去一致性。
6. **覆盖 spacing/fontFamily**：会让 \`p-4\`/\`font-sans\` 等失效。
7. **插件版本不匹配**：v3 的插件不能用于 v4，反之亦然。
8. **CDN 用于生产**：性能差，只能开发用。

## 动手试试

下面的演示用 CDN 注入了一套自定义品牌色（\`brand\` 调色板）、自定义字体（\`display\`）、自定义阴影（\`soft\`）和自定义圆角（\`card\`）。观察卡片如何用 \`bg-brand-600\`/\`font-display\`/\`shadow-soft\`/\`rounded-card\` 等自定义类。试着改 \`tailwind.config\` 里的颜色值，再运行，看卡片颜色如何变化。也可以加一个自定义间距 \`spacing: { '128': '32rem' }\`，然后试试 \`w-128\`。`,
    code: `<!-- ============================================================ -->
<!-- 第三章演示：自定义配置                                          -->
<!--                                                              -->
<!-- 关键：在 HTML 片段开头注入完整 tailwind.config                 -->
<!--       定义品牌色 brand、字体 display、阴影 soft、圆角 card    -->
<!--       然后在 HTML 里用这些自定义类                            -->
<!-- ============================================================ -->

<!-- ① 注入自定义配置：品牌色 + 字体 + 阴影 + 圆角 -->
<script>
  tailwind.config = {
    theme: {
      extend: {
        // 品牌色调色板（50~950 完整档位，方便做 hover/浅底深字）
        colors: {
          brand: {
            50:  '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554'
          },
          // 语义色
          success: '#10b981',
          danger:  '#ef4444'
        },
        // 自定义字体（display 用于标题）
        fontFamily: {
          display: ['Georgia', 'serif']
        },
        // 自定义阴影（soft 柔和投影）
        boxShadow: {
          'soft': '0 2px 12px rgba(0,0,0,0.06)',
          'card': '0 4px 16px rgba(37,99,235,0.12)'
        },
        // 自定义圆角
        borderRadius: {
          'card': '0.75rem'
        },
        // 自定义动画
        keyframes: {
          'fade-up': {
            '0%':   { opacity: '0', transform: 'translateY(8px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' }
          }
        },
        animation: {
          'fade-up': 'fade-up 0.5s ease-out'
        }
      }
    }
  }
</script>

<!-- ② 页面主体：用自定义类展示效果 -->
<div class="min-h-screen bg-gray-50 py-10 px-4">

  <!-- 标题区：用自定义字体 font-display -->
  <div class="max-w-3xl mx-auto text-center mb-10">
    <!-- font-display 用 Georgia 衬线字体，区别于默认 sans -->
    <h1 class="font-display text-4xl font-bold text-gray-900 mb-2">
      自定义配置演示
    </h1>
    <p class="text-gray-600">品牌色 brand · 展示字体 display · 柔和阴影 soft · 卡片圆角 card</p>
  </div>

  <!-- ============ 区块 1：品牌色卡（展示完整调色板） ============ -->
  <div class="max-w-3xl mx-auto mb-10">
    <h2 class="text-lg font-semibold text-gray-800 mb-3">① brand 调色板（50~950）</h2>
    <!-- 网格展示 11 个档位 -->
    <div class="grid grid-cols-6 md:grid-cols-11 gap-2">
      <!-- 每个色块用对应的 bg-brand-{n}，h-16 高 4rem，flex 居中显示档位数字 -->
      <div class="bg-brand-50 h-16 rounded flex items-end justify-center text-xs text-brand-900 pb-1">50</div>
      <div class="bg-brand-100 h-16 rounded flex items-end justify-center text-xs text-brand-900 pb-1">100</div>
      <div class="bg-brand-200 h-16 rounded flex items-end justify-center text-xs text-brand-900 pb-1">200</div>
      <div class="bg-brand-300 h-16 rounded flex items-end justify-center text-xs text-brand-900 pb-1">300</div>
      <div class="bg-brand-400 h-16 rounded flex items-end justify-center text-xs text-white pb-1">400</div>
      <div class="bg-brand-500 h-16 rounded flex items-end justify-center text-xs text-white pb-1">500</div>
      <div class="bg-brand-600 h-16 rounded flex items-end justify-center text-xs text-white pb-1">600</div>
      <div class="bg-brand-700 h-16 rounded flex items-end justify-center text-xs text-white pb-1">700</div>
      <div class="bg-brand-800 h-16 rounded flex items-end justify-center text-xs text-white pb-1">800</div>
      <div class="bg-brand-900 h-16 rounded flex items-end justify-center text-xs text-white pb-1">900</div>
      <div class="bg-brand-950 h-16 rounded flex items-end justify-center text-xs text-white pb-1">950</div>
    </div>
  </div>

  <!-- ============ 区块 2：用自定义类做的卡片 ============ -->
  <div class="max-w-3xl mx-auto mb-10">
    <h2 class="text-lg font-semibold text-gray-800 mb-3">② 品牌卡片（综合自定义类）</h2>

    <!-- 卡片：rounded-card 自定义圆角 + shadow-soft 自定义阴影 + animate-fade-up 自定义动画 -->
    <div class="bg-white rounded-card shadow-soft p-6 animate-fade-up">
      <!-- 卡片头：浅底深字 bg-brand-50 + text-brand-700 -->
      <div class="flex items-center gap-3 mb-4">
        <!-- logo 块：bg-brand-600 + 圆角 -->
        <div class="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">B</div>
        <div>
          <h3 class="font-display text-xl font-bold text-gray-900">Brand 组件库</h3>
          <p class="text-sm text-gray-500">v1.0.0 · MIT 协议</p>
        </div>
      </div>

      <!-- 描述：普通段落 -->
      <p class="text-gray-700 mb-4">
        这张卡片用到了 <code class="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded text-sm">rounded-card</code>、
        <code class="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded text-sm">shadow-soft</code>、
        <code class="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded text-sm">font-display</code>、
        <code class="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded text-sm">bg-brand-600</code> 等自定义类。
      </p>

      <!-- 按钮组：hover 态用 brand-700 -->
      <div class="flex gap-3">
        <!-- 主按钮：bg-brand-600 hover:bg-brand-700 -->
        <button class="bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2 rounded-card transition-colors shadow-card">
          立即使用
        </button>
        <!-- 次按钮：浅底深字 bg-brand-50 + text-brand-700 -->
        <button class="bg-brand-50 hover:bg-brand-100 text-brand-700 font-medium px-4 py-2 rounded-card transition-colors">
          查看文档
        </button>
      </div>
    </div>
  </div>

  <!-- ============ 区块 3：语义色 + 自定义动画 ============ -->
  <div class="max-w-3xl mx-auto mb-10">
    <h2 class="text-lg font-semibold text-gray-800 mb-3">③ 语义色 + 状态徽章</h2>

    <div class="bg-white rounded-card shadow-soft p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- 成功：bg-success（自定义语义色） -->
      <div class="bg-success/10 border border-success/30 rounded-lg p-4 text-center">
        <div class="text-success text-2xl font-bold mb-1">✓</div>
        <div class="text-sm font-medium text-gray-800">构建成功</div>
        <div class="text-xs text-gray-500 mt-1">3.2s</div>
      </div>
      <!-- 警告：用 amber 系列 -->
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
        <div class="text-amber-600 text-2xl font-bold mb-1">!</div>
        <div class="text-sm font-medium text-gray-800">2 个警告</div>
        <div class="text-xs text-gray-500 mt-1">需关注</div>
      </div>
      <!-- 错误：bg-danger -->
      <div class="bg-danger/10 border border-danger/30 rounded-lg p-4 text-center">
        <div class="text-danger text-2xl font-bold mb-1">✗</div>
        <div class="text-sm font-medium text-gray-800">构建失败</div>
        <div class="text-xs text-gray-500 mt-1">1 个错误</div>
      </div>
    </div>
  </div>

  <!-- ============ 区块 4：任意值对照 ============ -->
  <div class="max-w-3xl mx-auto">
    <h2 class="text-lg font-semibold text-gray-800 mb-3">④ 任意值语法（无需配置）</h2>
    <div class="bg-white rounded-card shadow-soft p-6 space-y-3">
      <!-- 任意颜色 bg-[#1da1f2] -->
      <div class="bg-[#1da1f2] text-white px-4 py-2 rounded text-sm">bg-[#1da1f2] Twitter 蓝（任意颜色）</div>
      <!-- 任意间距 p-[13px] -->
      <div class="bg-gray-100 p-[13px] rounded text-sm text-gray-700">p-[13px] 任意间距（13px）</div>
      <!-- 任意栅格 grid-cols-[200px_1fr] -->
      <div class="grid grid-cols-[120px_1fr] gap-3 items-center">
        <div class="bg-brand-100 text-brand-700 text-xs text-center py-2 rounded">200px</div>
        <div class="bg-gray-100 text-gray-600 text-xs py-2 px-3 rounded">1fr（自适应剩余）</div>
      </div>
      <p class="text-xs text-gray-500 mt-2">提示：任意值是逃生舱，频繁使用的值应写进 theme.extend。</p>
    </div>
  </div>

</div>`,
  },

  // =========================================================
  // 第四章：常用布局实战
  // =========================================================
  {
    id: "tw-patterns",
    title: "常用布局实战",
    icon: "🎯",
    group: "进阶",
    content: `## 常用布局实战：从碎片到完整界面

前面几章你学了 Tailwind 的各种"零件"——颜色、间距、Flex、Grid、响应式、暗黑模式、自定义配置。但真实项目里，你面对的不是"给一个 div 加 padding"，而是"做一个登录页"、"做一个产品落地页"、"做一个后台侧边栏布局"。这些**完整界面**由多个组件组合而成，每个组件又由几十个工具类堆叠。

本章不教新工具类，而是教**如何把工具类组合成常见组件**——卡片、导航栏、侧边栏、页脚、表单、模态框、标签页、徽章、空状态、骨架屏。每个组件都给**完整可运行的 HTML**，并讲解其结构思路。最后用一个综合的"产品落地页"把所有组件串起来，展示真实项目的 Tailwind 写法。

> 💡 **核心心法**：写组件时先想**结构（语义化 HTML）**，再想**布局（Flex/Grid）**，最后想**样式（颜色/间距/圆角）**。不要一上来就堆 class——先 \`<header>/<nav>/<main>/<section>/<footer>\` 把骨架搭好，再逐个区域填充。这样写出的代码可读、可维护、可访问。

## 卡片组件：界面的"原子"

卡片是 Web 界面最常见的组件——商品卡、文章卡、用户卡、特性卡，结构都是"图片/图标 + 标题 + 描述 + 操作"。一个标准卡片：

\`\`\`html
<article class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
  <!-- 顶部图片 -->
  <img src="..." class="w-full h-48 object-cover" />
  <!-- 内容区 -->
  <div class="p-6">
    <h3 class="font-semibold text-lg text-gray-900 mb-2">标题</h3>
    <p class="text-gray-600 text-sm mb-4">描述文字</p>
    <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">按钮</button>
  </div>
</article>
\`\`\`

关键点：

- \`overflow-hidden\`：让顶部图片的圆角和卡片一致（否则图片方角会"戳出"卡片圆角）。
- \`object-cover\`：图片填满容器不变形（裁剪多余部分）。
- \`w-full h-48\`：图片宽度撑满、固定高度。
- 内容区用 \`p-6\` 统一内边距，标题/描述/按钮之间用 \`mb-*\` 控制间距。

> 💡 **卡片"四件套"**：\`rounded-xl\` + \`shadow-sm\` + \`border border-gray-100\` + \`bg-white\` 是卡片标配——圆角 + 微阴影 + 极淡边框 + 白底。克制但有质感。新手常犯的错是 \`shadow-2xl\` 太重，卡片像"浮在空中"。

### 卡片的 hover 提升

\`\`\`html
<article class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden
               transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
  <!-- ... -->
</article>
\`\`\`

\`hover:shadow-lg hover:-translate-y-1\` + \`transition-all\` = 悬停时阴影变深 + 上浮 4px + 平滑过渡。这是卡片交互的"标配动效"，让界面"活"起来。

## 导航栏：logo + 菜单 + 按钮

导航栏是页面的"门面"，结构固定：左侧 logo，中间/右侧菜单，最右侧操作按钮（登录/注册）。响应式导航在上一章讲过（汉堡 + 抽屉），这里给桌面版完整结构：

\`\`\`html
<header class="bg-white border-b border-gray-200 sticky top-0 z-50">
  <nav class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
    <!-- 左：logo -->
    <div class="font-bold text-xl text-gray-900">Logo</div>
    <!-- 中：菜单（绝对定位居中，或直接 flex） -->
    <div class="hidden md:flex items-center gap-8">
      <a class="text-gray-600 hover:text-gray-900 text-sm">首页</a>
      <a class="text-gray-600 hover:text-gray-900 text-sm">产品</a>
      <a class="text-gray-600 hover:text-gray-900 text-sm">价格</a>
    </div>
    <!-- 右：按钮 -->
    <div class="flex items-center gap-3">
      <a class="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">登录</a>
      <a class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">注册</a>
    </div>
  </nav>
</header>
\`\`\`

关键点：

- \`sticky top-0 z-50\`：粘性吸顶 + 高层级（不被内容遮挡）。
- \`border-b\`：底部分隔线，区分导航和内容。
- \`h-16\`：固定高度 4rem，统一导航栏高度。
- \`justify-between\`：三段（logo / 菜单 / 按钮）两端对齐。

> ⚠️ **\`sticky\` vs \`fixed\`**：\`sticky top-0\` 滚动时吸顶但**不脱离文档流**（页面内容不会跑到导航下面）；\`fixed\` 脱离文档流，需要给内容加 \`pt-16\` 补偿高度。导航栏优先用 \`sticky\`。

## 侧边栏布局：fixed 侧边栏 + 主内容

后台管理、文档站常见"左侧固定侧边栏 + 右侧主内容"布局：

\`\`\`html
<div class="flex min-h-screen">
  <!-- 侧边栏：固定宽度 w-64，sticky 让它跟随滚动 -->
  <aside class="w-64 bg-gray-900 text-gray-300 flex-shrink-0 hidden md:block">
    <div class="p-4">
      <div class="font-bold text-white mb-6">后台</div>
      <nav class="space-y-1">
        <a class="block px-3 py-2 rounded hover:bg-gray-800">仪表盘</a>
        <a class="block px-3 py-2 rounded bg-gray-800 text-white">用户管理</a>
        <a class="block px-3 py-2 rounded hover:bg-gray-800">设置</a>
      </nav>
    </div>
  </aside>
  <!-- 主内容：flex-1 撑满剩余 -->
  <main class="flex-1 p-6 bg-gray-50">
    <h1 class="text-2xl font-bold mb-4">主内容区</h1>
    <!-- ... -->
  </main>
</div>
\`\`\`

关键点：

- 外层 \`flex min-h-screen\`：横向 flex，至少占满一屏。
- 侧边栏 \`w-64 flex-shrink-0\`：固定 16rem 宽，不被压缩。
- 主内容 \`flex-1\`：撑满剩余宽度。
- \`hidden md:block\`：手机隐藏侧边栏（手机用底部 tab 或抽屉）。

> 💡 **侧边栏滚动独立**：如果侧边栏很长，可以加 \`sticky top-0 h-screen overflow-y-auto\`，让侧边栏独立滚动，不跟主内容一起滚。

## 页脚：多列链接 + 版权

页脚通常分三部分：品牌简介 + 多列链接 + 底部版权。响应式用 grid 在手机折叠成 1~2 列、桌面展开 4 列：

\`\`\`html
<footer class="bg-gray-900 text-gray-400">
  <div class="max-w-6xl mx-auto px-4 py-12">
    <!-- 上部：4 列 grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
      <div>
        <h4 class="text-white font-semibold mb-3">产品</h4>
        <ul class="space-y-2 text-sm">
          <li><a class="hover:text-white">功能</a></li>
          <li><a class="hover:text-white">价格</a></li>
        </ul>
      </div>
      <!-- 更多列... -->
    </div>
    <!-- 底部版权：border-t 分隔，flex 两端对齐 -->
    <div class="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between gap-4 text-sm">
      <p>© 2026 Your Company. 保留所有权利。</p>
      <div class="flex gap-4">
        <a class="hover:text-white">隐私政策</a>
        <a class="hover:text-white">服务条款</a>
      </div>
    </div>
  </div>
</footer>
\`\`\`

关键点：

- \`grid-cols-2 md:grid-cols-4\`：手机 2 列、桌面 4 列。
- \`space-y-2\`：链接列表纵向间距。
- \`border-t\`：版权区上分隔线。
- \`flex-col md:flex-row\`：版权行手机纵向、桌面横向。

## 表单页：label + input 网格

表单用 grid 排列字段，label 在 input 上方，必填项加红星：

\`\`\`html
<form class="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6 space-y-4">
  <!-- 两列网格：姓/名 -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">姓 <span class="text-red-500">*</span></label>
      <input type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">名 <span class="text-red-500">*</span></label>
      <input type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
    </div>
  </div>
  <!-- 邮箱：占满 -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
    <input type="email" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
  </div>
  <!-- 提交按钮 -->
  <button class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg">提交</button>
</form>
\`\`\`

关键点：

- \`grid-cols-1 sm:grid-cols-2\`：手机单列、桌面双列。
- \`w-full\`：input 撑满列宽。
- \`focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none\`：聚焦三件套（移除默认轮廓 + 蓝环 + 蓝边框）。
- \`block ... mb-1\`：label 块级显示 + 下方小间距。

## 模态框：fixed + 居中 + 遮罩

模态框 = 全屏遮罩 + 居中内容。用 \`fixed inset-0\` 铺满、\`flex items-center justify-center\` 居中：

\`\`\`html
<!-- 遮罩层：fixed 铺满，bg-black/50 半透明黑，flex 居中 -->
<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
  <!-- 模态框：bg-white 圆角阴影，max-w 限宽，w-full 撑满（小屏） -->
  <div class="bg-white rounded-xl shadow-xl w-full max-w-md">
    <!-- 头部 -->
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <h3 class="font-semibold text-lg">标题</h3>
      <button class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
    </div>
    <!-- 内容 -->
    <div class="p-6 text-gray-600">
      模态框内容...
    </div>
    <!-- 底部按钮 -->
    <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
      <button class="px-4 py-2 text-sm text-gray-600">取消</button>
      <button class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">确认</button>
    </div>
  </div>
</div>
\`\`\`

关键点：

- \`fixed inset-0\`：固定定位 + 四向 0 = 铺满视口。
- \`bg-black/50\`：50% 透明黑遮罩。
- \`flex items-center justify-center\`：让模态框居中。
- \`p-4\`：遮罩内边距，防止模态框贴边（小屏）。
- \`w-full max-w-md\`：模态框宽度撑满但不超过 28rem。
- \`z-50\`：高层级，盖住其他内容。

> ⚠️ **模态框的可访问性**：真实项目要用 \`role="dialog"\`、\`aria-modal="true"\`、焦点陷阱、Esc 关闭。本教程 demo 简化了，只展示样式。

## 标签页 tabs：用 JS 切换

标签页需要一小段 JS 控制激活态。结构：tab 按钮组 + 对应内容面板：

\`\`\`html
<!-- tab 按钮：border-b 分隔，active 项加底部蓝条 -->
<div class="border-b border-gray-200 flex gap-1">
  <button onclick="showTab(0)" class="tab-btn px-4 py-2 text-sm border-b-2 border-blue-500 text-blue-600">Tab 1</button>
  <button onclick="showTab(1)" class="tab-btn px-4 py-2 text-sm border-b-2 border-transparent text-gray-600">Tab 2</button>
</div>
<!-- 面板 -->
<div class="tab-panel p-4">面板 1 内容</div>
<div class="tab-panel p-4 hidden">面板 2 内容</div>

<script>
function showTab(i) {
  // 切换按钮激活态
  document.querySelectorAll('.tab-btn').forEach((b, idx) => {
    if (idx === i) {
      b.className = 'tab-btn px-4 py-2 text-sm border-b-2 border-blue-500 text-blue-600';
    } else {
      b.className = 'tab-btn px-4 py-2 text-sm border-b-2 border-transparent text-gray-600';
    }
  });
  // 切换面板显示
  document.querySelectorAll('.tab-panel').forEach((p, idx) => {
    p.classList.toggle('hidden', idx !== i);
  });
}
</script>
\`\`\`

关键点：

- 激活 tab：\`border-b-2 border-blue-500 text-blue-600\`（底部蓝条 + 蓝字）。
- 非激活 tab：\`border-b-2 border-transparent text-gray-600\`（透明边框占位防抖动 + 灰字）。
- 面板切换：\`classList.toggle('hidden', ...)\`。

> 💡 **透明边框防抖动**：激活/非激活切换时，\`border-transparent\` 保持 2px 边框宽度不变，只是颜色变化，避免文字上下跳动。

## 徽章 / 标签 / 进度条

### 徽章（小标签）

\`\`\`html
<!-- 圆形数字徽章 -->
<span class="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">3</span>

<!-- 状态徽章 -->
<span class="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">Active</span>
\`\`\`

### 进度条

\`\`\`html
<!-- 外层：bg-gray-200 圆角，h-2 固定高度，overflow-hidden -->
<div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
  <!-- 内层：bg-blue-600，w-3/4 表示 75% 进度 -->
  <div class="bg-blue-600 h-full rounded-full" style="width: 75%"></div>
</div>
\`\`\`

> 💡 **进度条用 inline style 控制宽度**：\`width: 75%\` 是动态值，用 inline style 比 Tailwind 的 \`w-3/4\` 更灵活（可以任意百分比）。Tailwind 的 \`w-3/4\` 只有几个固定档位。

## 空状态 empty state

列表为空时显示"空状态"——图标 + 文字 + 操作按钮，避免一片空白让用户困惑：

\`\`\`html
<div class="text-center py-16">
  <!-- 大图标：text-6xl，text-gray-300 -->
  <div class="text-6xl mb-4">📭</div>
  <h3 class="text-lg font-medium text-gray-900 mb-1">还没有数据</h3>
  <p class="text-gray-500 text-sm mb-4">点击下方按钮添加第一条记录</p>
  <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ 添加</button>
</div>
\`\`\`

## 加载骨架屏 skeleton

数据加载中显示骨架屏（灰色块 + 闪烁动画），比"白屏"或"转圈"体验好：

\`\`\`html
<div class="space-y-3">
  <!-- 骨架块：bg-gray-200 rounded + animate-pulse 闪烁 -->
  <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
  <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
  <div class="h-24 bg-gray-200 rounded animate-pulse"></div>
</div>
\`\`\`

\`animate-pulse\` 是 Tailwind 内置的"透明度脉冲"动画，模拟加载中的呼吸效果。骨架块的宽度用 \`w-3/4\`/\`w-1/2\` 模拟真实文字长度。

## 综合：产品落地页

把上面的组件串起来，就是一个完整的产品落地页：

1. **顶部导航栏**（sticky 吸顶）：logo + 菜单 + 注册按钮。
2. **Hero 区**：大标题 + 副标题 + CTA 按钮 + 装饰背景。
3. **特性卡片网格**：3~4 个特性卡，响应式 1/2/3 列。
4. **数据统计区**：4 个大数字 + 描述。
5. **页脚**：4 列链接 + 版权。

下面 demo 实现了这个完整落地页，全部纯 Tailwind，响应式适配手机/平板/桌面。这是真实项目里 Tailwind 的典型用法——**没有自定义 CSS，所有样式都在 class 里**。

> 💡 **落地页的"节奏感"**：各区块纵向间距要大（\`py-16\`/\`py-24\`），让用户滚动时有"段落感"。区块背景可交替（白/灰）区分。Hero 区要有视觉冲击（大字号 + 渐变/图片背景）。

## 常见陷阱总结

1. **卡片图片不圆角**：忘加 \`overflow-hidden\`，图片方角戳出。
2. **导航栏 fixed 没补高度**：\`fixed\` 脱离文档流，内容会被遮挡；优先用 \`sticky\`。
3. **模态框不居中**：忘加 \`flex items-center justify-center\`。
4. **模态框小屏贴边**：忘加 \`p-4\`，小屏模态框贴屏幕边。
5. **tab 切换抖动**：非激活 tab 没 \`border-transparent\` 占位，激活时多 2px 导致跳动。
6. **进度条用 \`w-3/4\`**：固定档位不够灵活，动态值用 inline style。
7. **空状态太简陋**：只写"暂无数据"，应加图标 + 引导按钮。
8. **骨架屏没动画**：忘加 \`animate-pulse\`，灰块不动像"坏了"。
9. **落地页各区块挤在一起**：纵向间距不够，用 \`py-16\`/\`py-24\` 拉开。
10. **响应式只调列数**：还要调字号、间距、显隐，全维度响应。

## 动手试试

下面的演示是一个完整的"产品落地页"，包含导航栏、Hero、特性卡片、数据统计、页脚五大区块，全部响应式。拖动预览区宽度，观察各区块在手机/平板/桌面下的变化。试着改 Hero 的渐变色、卡片的图标、统计数字，感受一个完整页面是如何用纯 Tailwind 搭出来的。`,
    code: `<!-- ============================================================ -->
<!-- 第四章演示：综合产品落地页                                      -->
<!-- 包含：导航栏 / Hero / 特性卡片 / 数据统计 / 页脚                -->
<!-- 全部纯 Tailwind 实现，响应式适配手机/平板/桌面                  -->
<!-- ============================================================ -->

<!-- ============ 1. 顶部导航栏（sticky 吸顶） ============ -->
<!-- sticky top-0：滚动吸顶；z-50：高层级不被遮挡；bg-white/80 backdrop-blur：半透明毛玻璃 -->
<header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
  <!-- nav：max-w-6xl 限宽居中，px-4 内边距，h-16 固定高 4rem -->
  <nav class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
    <!-- 左：logo（font-bold 加粗 + text-xl） -->
    <div class="flex items-center gap-2">
      <!-- logo 图标块 -->
      <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
      <span class="font-bold text-lg text-gray-900">Nebula</span>
    </div>
    <!-- 中：桌面菜单（hidden md:flex 手机隐藏桌面显示） -->
    <div class="hidden md:flex items-center gap-8">
      <a href="#" class="text-gray-600 hover:text-gray-900 text-sm transition-colors">产品</a>
      <a href="#" class="text-gray-600 hover:text-gray-900 text-sm transition-colors">功能</a>
      <a href="#" class="text-gray-600 hover:text-gray-900 text-sm transition-colors">价格</a>
      <a href="#" class="text-gray-600 hover:text-gray-900 text-sm transition-colors">文档</a>
    </div>
    <!-- 右：按钮组 -->
    <div class="flex items-center gap-3">
      <a href="#" class="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">登录</a>
      <!-- 注册按钮：bg-blue-600 + hover 加深 + 圆角 -->
      <a href="#" class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
        免费注册
      </a>
    </div>
  </nav>
</header>

<!-- ============ 2. Hero 区（大标题 + CTA + 渐变背景） ============ -->
<!-- 渐变背景：bg-gradient-to-br from-blue-50 via-white to-indigo-50 -->
<section class="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
    <!-- 顶部小标签：bg-blue-100 + 圆形胶囊 -->
    <div class="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
      <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
      全新 2.0 版本已发布
    </div>
    <!-- 大标题：text-4xl 手机 → md:text-6xl 桌面，font-bold 加粗，渐变文字 -->
    <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
      让团队协作
      <span class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        如星云般流畅
      </span>
    </h1>
    <!-- 副标题：text-lg md:text-xl，text-gray-600，max-w-2xl 限宽 -->
    <p class="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
      Nebula 是新一代团队协作平台，集成任务管理、文档协作、即时通讯，让远程团队像在同一个房间。
    </p>
    <!-- CTA 按钮组：flex 居中 + gap-4 -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
      <!-- 主按钮：bg-blue-600 + 大尺寸 -->
      <a href="#" class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg text-base transition-colors shadow-lg shadow-blue-500/30 w-full sm:w-auto">
        立即开始
      </a>
      <!-- 次按钮：透明背景 + 边框 -->
      <a href="#" class="bg-white hover:bg-gray-50 text-gray-700 font-medium px-8 py-3 rounded-lg text-base border border-gray-300 transition-colors w-full sm:w-auto">
        观看演示
      </a>
    </div>
    <!-- 底部小字 -->
    <p class="text-sm text-gray-500 mt-6">免费试用 14 天 · 无需信用卡</p>
  </div>
</section>

<!-- ============ 3. 特性卡片网格（响应式 1/2/3 列） ============ -->
<section class="max-w-6xl mx-auto px-4 py-16 md:py-24">
  <!-- 区块标题：居中 -->
  <div class="text-center mb-12">
    <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-3">为什么选择 Nebula</h2>
    <p class="text-gray-600 max-w-xl mx-auto">六大核心能力，覆盖团队协作的每一个环节。</p>
  </div>

  <!-- 卡片网格：grid + 阶梯列数（1→2→3）+ gap 阶梯 -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

    <!-- 卡片 1：hover 上浮 + 阴影加深 -->
    <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <!-- 图标：bg-blue-50 + text-blue-600 + 圆角 -->
      <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-2xl mb-4">⚡</div>
      <h3 class="font-semibold text-lg text-gray-900 mb-2">极速体验</h3>
      <p class="text-gray-600 text-sm">基于边缘网络加速，全球任何地区都能在 100ms 内响应。</p>
    </div>

    <!-- 卡片 2 -->
    <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center text-2xl mb-4">🔒</div>
      <h3 class="font-semibold text-lg text-gray-900 mb-2">企业级安全</h3>
      <p class="text-gray-600 text-sm">端到端加密、SOC 2 合规、SSO 单点登录，数据安全无忧。</p>
    </div>

    <!-- 卡片 3 -->
    <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <div class="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center text-2xl mb-4">🤝</div>
      <h3 class="font-semibold text-lg text-gray-900 mb-2">实时协作</h3>
      <p class="text-gray-600 text-sm">多人同时编辑文档，光标实时可见，评论即时通知。</p>
    </div>

    <!-- 卡片 4 -->
    <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <div class="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center text-2xl mb-4">📊</div>
      <h3 class="font-semibold text-lg text-gray-900 mb-2">数据看板</h3>
      <p class="text-gray-600 text-sm">可视化团队进度、成员负载、项目燃尽，决策有据可依。</p>
    </div>

    <!-- 卡片 5 -->
    <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <div class="w-12 h-12 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center text-2xl mb-4">🔗</div>
      <h3 class="font-semibold text-lg text-gray-900 mb-2">丰富集成</h3>
      <p class="text-gray-600 text-sm">支持 200+ 第三方应用：GitHub、Figma、Slack、Notion 无缝衔接。</p>
    </div>

    <!-- 卡片 6 -->
    <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <div class="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-lg flex items-center justify-center text-2xl mb-4">📱</div>
      <h3 class="font-semibold text-lg text-gray-900 mb-2">全平台覆盖</h3>
      <p class="text-gray-600 text-sm">Web、iOS、Android、桌面端原生应用，随时随地保持同步。</p>
    </div>

  </div>
</section>

<!-- ============ 4. 数据统计区（深色背景 + 4 个大数字） ============ -->
<section class="bg-gray-900 text-white">
  <div class="max-w-6xl mx-auto px-4 py-16 md:py-20">
    <!-- 网格：手机 2 列，桌面 4 列 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      <!-- 统计 1 -->
      <div>
        <!-- 大数字：text-4xl font-bold + 渐变色 -->
        <div class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">10万+</div>
        <div class="text-gray-400 text-sm">活跃团队</div>
      </div>
      <!-- 统计 2 -->
      <div>
        <div class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">99.9%</div>
        <div class="text-gray-400 text-sm">服务可用性</div>
      </div>
      <!-- 统计 3 -->
      <div>
        <div class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">200+</div>
        <div class="text-gray-400 text-sm">集成应用</div>
      </div>
      <!-- 统计 4 -->
      <div>
        <div class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">4.9</div>
        <div class="text-gray-400 text-sm">用户评分</div>
      </div>
    </div>
  </div>
</section>

<!-- ============ 5. CTA 行动召唤区 ============ -->
<section class="max-w-6xl mx-auto px-4 py-16 md:py-24">
  <!-- CTA 卡片：渐变背景 + 圆角 + 阴影 -->
  <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-center shadow-xl">
    <h2 class="text-2xl md:text-3xl font-bold text-white mb-3">准备好开始了吗？</h2>
    <p class="text-blue-100 mb-6 max-w-xl mx-auto">加入 10 万+ 团队，让协作更高效。14 天免费试用，随时取消。</p>
    <a href="#" class="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-lg">
      免费开始使用
    </a>
  </div>
</section>

<!-- ============ 6. 页脚（4 列链接 + 版权） ============ -->
<footer class="bg-gray-900 text-gray-400">
  <div class="max-w-6xl mx-auto px-4 py-12">
    <!-- 上部：4 列 grid，手机 2 列桌面 4 列 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
      <!-- 列 1：品牌简介 -->
      <div class="col-span-2 md:col-span-1">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
          <span class="font-bold text-white text-lg">Nebula</span>
        </div>
        <p class="text-sm text-gray-500">让团队协作如星云般流畅。</p>
      </div>
      <!-- 列 2：产品 -->
      <div>
        <h4 class="text-white font-semibold mb-3 text-sm">产品</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="#" class="hover:text-white transition-colors">功能</a></li>
          <li><a href="#" class="hover:text-white transition-colors">价格</a></li>
          <li><a href="#" class="hover:text-white transition-colors">更新日志</a></li>
          <li><a href="#" class="hover:text-white transition-colors">路线图</a></li>
        </ul>
      </div>
      <!-- 列 3：公司 -->
      <div>
        <h4 class="text-white font-semibold mb-3 text-sm">公司</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="#" class="hover:text-white transition-colors">关于我们</a></li>
          <li><a href="#" class="hover:text-white transition-colors">招聘</a></li>
          <li><a href="#" class="hover:text-white transition-colors">博客</a></li>
          <li><a href="#" class="hover:text-white transition-colors">联系</a></li>
        </ul>
      </div>
      <!-- 列 4：资源 -->
      <div>
        <h4 class="text-white font-semibold mb-3 text-sm">资源</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="#" class="hover:text-white transition-colors">文档</a></li>
          <li><a href="#" class="hover:text-white transition-colors">API</a></li>
          <li><a href="#" class="hover:text-white transition-colors">社区</a></li>
          <li><a href="#" class="hover:text-white transition-colors">状态</a></li>
        </ul>
      </div>
    </div>
    <!-- 底部版权：border-t 分隔，flex 两端对齐 -->
    <div class="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
      <p>© 2026 Nebula Inc. 保留所有权利。</p>
      <div class="flex gap-6">
        <a href="#" class="hover:text-white transition-colors">隐私政策</a>
        <a href="#" class="hover:text-white transition-colors">服务条款</a>
        <a href="#" class="hover:text-white transition-colors">Cookie</a>
      </div>
    </div>
  </div>
</footer>`,
  },
];
