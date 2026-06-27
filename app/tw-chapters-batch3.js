// =============================================================
// Tailwind CSS 交互式教程 —— 第三批章节（共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. tw-borders      — 边框与圆角
//   2. tw-shadows      — 阴影与效果
//   3. tw-backgrounds  — 背景与渐变
//   4. tw-forms        — 表单组件
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
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：边框与圆角
  // =========================================================
  {
    id: "tw-borders",
    title: "边框与圆角",
    icon: "⬜",
    group: "组件样式",
    content: `## 边框与圆角：界面的"轮廓语言"

如果说颜色和间距决定了界面的"气质"，那么**边框与圆角**决定的是界面的"轮廓语言"——它告诉用户"这里是按钮"、"那里是一张卡片"、"这个输入框可以点击"。一个没有边框的世界里，所有元素糊成一片，用户根本分不清哪里能点、哪里是内容；而恰到好处的边框与圆角，能在不增加视觉噪音的前提下，把界面划分得井井有条。

Tailwind 把 CSS 里所有和"边框、圆角、轮廓、环、分隔线"相关的属性都拆成了细粒度的工具类，并且预设了和整套设计系统对齐的刻度（边框宽度按 1/2/4/8px，圆角按 sm/md/lg/xl/2xl/3xl/full，颜色按 50~950 全色板）。本章将**逐一、深入**讲解这些类，包括它们的底层 CSS 原理、常见组合模式、以及大量实战陷阱。

> 💡 **核心心法**：边框不是"画一根线"那么简单——它涉及**宽度、颜色、样式、圆角**四个维度的协同。一个看起来"精致"的卡片，往往是 \`border\` + \`border-gray-200\` + \`rounded-lg\` + \`shadow-sm\` 的组合，每一项都克制，叠加起来才有质感。新手常犯的错是"边框太粗、颜色太重、圆角太大"，导致界面"塑料感"。

## 边框宽度：border / border-{n}

边框宽度用 \`border\` 前缀，预设了 5 档：

| 类名 | border-width | 含义 | 典型用途 |
| --- | --- | --- | --- |
| \`border-0\` | 0px | 无边框 | 移除边框（覆盖默认） |
| \`border\` | 1px | 默认（最常用） | 卡片、输入框、分隔区 |
| \`border-2\` | 2px | 略粗 | 强调边框、激活态 |
| \`border-4\` | 4px | 粗 | 装饰性边框、特殊强调 |
| \`border-8\` | 8px | 很粗 | 营销页大边框、艺术效果 |

\`\`\`html
<!-- 默认 1px 边框：最常用 -->
<div class="border border-gray-300 p-4">1px 边框</div>
<!-- 2px 边框：略粗，常用于 hover/active 强调 -->
<div class="border-2 border-blue-500 p-4">2px 边框</div>
\`\`\`

### 重要原理：border 默认带颜色和样式

这是新手最常踩的坑。**单独写 \`border\` 不会显示边框！** 因为：

1. \`border\` 只设置 \`border-width: 1px\`，但 **\`border-style\` 默认是 \`none\`**（CSS 规范），所以即便有宽度也看不见。
2. Tailwind 的 **Preflight（基础重置）** 给所有元素设了 \`border-style: solid; border-width: 0\`，所以 \`border\` 类实际上是把宽度从 0 改成 1px，**样式已经是 solid**（Preflight 设的）。
3. 但 **\`border-color\` 默认是 \`currentColor\`**（继承文字颜色）！所以如果你不写颜色，边框颜色 = 文字颜色。

> ⚠️ **必踩坑**：很多人写 \`<div class="border p-4">...</div>\` 发现"看不到边框"，以为是 Tailwind 出 bug。其实边框是有的，只是颜色继承了文字色——如果文字是深色而背景也是深色，就看不见了。**养成习惯：写 \`border\` 必须同时写 \`border-{color}\`**，例如 \`border border-gray-200\`。

### 方向边框：border-t / border-r / border-b / border-l

\`border\` 是四向都加边框，你也可以只加**某一侧**：

| 类名 | 含义 | 典型用途 |
| --- | --- | --- |
| \`border-t\` | 仅上边框 | 卡片顶部分隔线、表格行 |
| \`border-r\` | 仅右边框 | 侧边栏右分隔 |
| \`border-b\` | 仅下边框 | **最常用**：表头、卡片底部分隔、链接下划线替代 |
| \`border-l\` | 仅左边框 | 引用块左侧色条、状态指示 |
| \`border-t-2\` / \`border-b-4\` 等 | 单侧指定宽度 | 强调某一侧 |

\`\`\`html
<!-- 引用块：左侧色条 border-l-4 -->
<blockquote class="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
  这是一段引用，左侧 4px 蓝色边框做装饰。
</blockquote>

<!-- 卡片底部分隔：border-b -->
<div class="border-b border-gray-200 pb-2 mb-2">标题区</div>
<div>内容区</div>
\`\`\`

方向边框宽度同样支持 \`border-t-0\`/\`border-t-2\`/\`border-t-4\`/\`border-t-8\`，以及 \`border-x\`（左右）/ \`border-y\`（上下）双向简写。

> 💡 **\`border-x\` / \`border-y\` 简写**：\`border-x\` 同时设左右边框，\`border-y\` 同时设上下边框。例如 \`border-x border-x-2 border-x-red-500\`。但颜色要写 \`border-x-{color}\`（v3.1+ 支持），老版本只能用 \`border-{color}\` 统一设。

## 边框颜色：border-{color}-{shade}

边框颜色用 \`border-\` + 颜色名 + 数字（50~950）表示，和文字色、背景色共用同一套调色板：

| 类名 | 颜色 | 用途 |
| --- | --- | --- |
| \`border-gray-200\` | 浅灰 | **最常用**：卡片、输入框默认边框 |
| \`border-gray-300\` | 中灰 | hover 边框、分隔线 |
| \`border-gray-400\` | 深灰 | 禁用态、次级强调 |
| \`border-blue-500\` | 蓝 | 聚焦态、激活态 |
| \`border-red-500\` | 红 | 错误态、危险操作 |
| \`border-green-500\` | 绿 | 成功态 |
| \`border-transparent\` | 透明 | 占位（hover 才显示边框时用） |
| \`border-current\` | currentColor | 继承文字色（默认值） |
| \`border-black/10\` | 黑色 10% 透明 | 极淡边框（v3.x 任意透明度） |

\`\`\`html
<!-- 经典输入框边框：默认灰，聚焦蓝，错误红 -->
<input class="border border-gray-300 focus:border-blue-500" />
<input class="border border-red-500" />  <!-- 错误态 -->
\`\`\`

### 颜色 + 透明度

边框颜色支持透明度修饰符 \`border-{color}/{opacity}\`，例如 \`border-black/10\` = 黑色 10% 透明度。这在做"极淡边框"时极有用——比 \`border-gray-200\` 更柔和，适合浅色背景上的卡片。

### 配合状态前缀

边框颜色常和状态前缀组合，做交互反馈：

- \`hover:border-gray-400\`：悬停时边框变深
- \`focus:border-blue-500\`：聚焦时边框变蓝（输入框标配）
- \`border-transparent hover:border-gray-200\`：默认无边框，悬停才出现（避免布局抖动）

> ⚠️ **布局抖动陷阱**：如果你用 \`border\` + \`hover:border\` 切换"无边框/有边框"，元素会因边框 0→1px 而**跳动 1px**。解决：默认用 \`border-transparent\`（占位 1px 透明边框），hover 时只换颜色 \`hover:border-gray-200\`，宽度始终 1px，不抖动。

## 边框样式：border-solid / dashed / dotted / double / none

CSS 的 \`border-style\` 决定边框的"线型"，Tailwind 全部支持：

| 类名 | border-style | 视觉 | 用途 |
| --- | --- | --- | --- |
| \`border-solid\`（Preflight 默认） | 实线 | ━━━ | 默认，绝大多数场景 |
| \`border-dashed\` | 虚线 | ┅┅┅ | 占位区、可拖拽区、未完成 |
| \`border-dotted\` | 点线 | ····· | 提示性边框、装饰 |
| \`border-double\` | 双线 | ═══ | 装饰性、特殊强调（需宽度≥3px） |
| \`border-none\` | 无 | 无 | 移除边框 |

\`\`\`html
<!-- 虚线占位上传区：border-2 border-dashed -->
<div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
  拖拽文件到此处，或点击上传
</div>

<!-- 双线装饰边框：border-4 border-double -->
<div class="border-4 border-double border-amber-600 p-4">
  复古装饰边框
</div>
\`\`\`

> 💡 **\`border-double\` 需要足够宽度**：双线效果需要边框宽度 ≥3px 才能看清两条线，\`border\`(1px) 配 \`border-double\` 会糊成一团。建议 \`border-4 border-double\` 起。

## 圆角：rounded 家族

圆角用 \`rounded\` 前缀，预设了 8 档 + \`full\`：

| 类名 | border-radius | 视觉 | 用途 |
| --- | --- | --- | --- |
| \`rounded-none\` | 0 | 直角 | 表格、严谨的金融界面 |
| \`rounded-sm\` | 0.125rem (2px) | 微圆 | 极简风格、小元素 |
| \`rounded\` | 0.25rem (4px) | 小圆 | 默认，按钮、输入框 |
| \`rounded-md\` | 0.375rem (6px) | 中圆 | 标签、小卡片 |
| \`rounded-lg\` | 0.5rem (8px) | 大圆 | **最常用**：卡片、模态框 |
| \`rounded-xl\` | 0.75rem (12px) | 更大圆 | 大卡片、特色区域 |
| \`rounded-2xl\` | 1rem (16px) | 大圆角 | 弹窗、营销卡片 |
| \`rounded-3xl\` | 1.5rem (24px) | 超大圆角 | 移动端卡片、流式设计 |
| \`rounded-full\` | 9999px | 完全圆 | 头像、圆形按钮、标签胶囊 |

\`\`\`html
<!-- 卡片标配：rounded-lg -->
<div class="bg-white rounded-lg border border-gray-200 p-6">标准卡片</div>

<!-- 头像：rounded-full -->
<img class="w-12 h-12 rounded-full" src="..." />
\`\`\`

### 方向圆角：rounded-t / rounded-r / rounded-b / rounded-l

只圆某一侧的角，同样支持 sm/md/lg/xl 等档位：

| 类名 | 含义 | 用途 |
| --- | --- | --- |
| \`rounded-t-lg\` | 仅上两角圆 | 顶部圆角卡片（底部贴边） |
| \`rounded-r-lg\` | 仅右两角圆 | 按钮组左半 |
| \`rounded-b-lg\` | 仅下两角圆 | 底部圆角 |
| \`rounded-l-lg\` | 仅左两角圆 | 按钮组右半 |
| \`rounded-tl-lg\` / \`rounded-tr-lg\` / \`rounded-br-lg\` / \`rounded-bl-lg\` | 单个角 | 不规则圆角、气泡 |

\`\`\`html
<!-- 按钮组：左半圆左，右半圆右 -->
<div class="flex">
  <button class="rounded-l-lg border border-r-0 border-gray-300 px-4 py-2">左</button>
  <button class="rounded-r-lg border border-gray-300 px-4 py-2">右</button>
</div>

<!-- 气泡：左上不圆（接对话尾巴），其他圆 -->
<div class="bg-blue-500 text-white p-3 rounded-lg rounded-tl-none">消息气泡</div>
\`\`\`

> 💡 **\`rounded-t\` 是简写**：\`rounded-t-lg\` = \`rounded-tl-lg rounded-tr-lg\`。同理 \`rounded-r\`/\`rounded-b\`/\`rounded-l\`。组合方向角能做不规则圆角（如聊天气泡、提示框）。

### 圆角的"统一性原则"

一个界面的圆角应该**统一**——要么全用 \`rounded\`(4px)，要么全用 \`rounded-lg\`(8px)，混用会显得凌乱。常见约定：

- **紧凑工具型**：\`rounded\` 或 \`rounded-sm\`（Notion、Linear 风格）
- **常规卡片型**：\`rounded-lg\`（最主流，GitHub、Vercel 风格）
- **柔和移动型**：\`rounded-xl\` / \`rounded-2xl\`（iOS、Apple 风格）
- **胶囊标签型**：\`rounded-full\`（标签、小按钮）

## 轮廓：outline

\`outline\` 和 \`border\` 长得像但本质不同：**\`outline\` 不占布局空间**（不影响盒子尺寸），通常用于辅助提示而非装饰。

| 类名 | 含义 | 用途 |
| --- | --- | --- |
| \`outline-none\` | 移除默认 outline | **必写**：移除浏览器默认聚焦轮廓 |
| \`outline\` | 1px outline | 基础轮廓 |
| \`outline-2\` / \`outline-4\` / \`outline-8\` | 指定宽度 | 强调轮廓 |
| \`outline-{color}\` | 轮廓颜色 | 配合宽度 |
| \`outline-dashed\` / \`outline-dotted\` / \`outline-double\` | 轮廓样式 | 装饰 |
| \`outline-offset-2\` / \`outline-offset-4\` | 轮廓和元素的间距 | 双层轮廓效果 |

> ⚠️ **可访问性必读**：浏览器默认给 \`<button>\`/\`<a>\` 等聚焦元素一个 \`outline\`（通常是蓝色或黑色实线），这是**键盘用户导航的生命线**——他们靠 Tab 键移动焦点，靠 outline 知道当前在哪。**永远不要无脑写 \`outline-none\` 移除它而不提供替代！** 正确做法：\`outline-none\` + \`focus:ring\`（用 ring 替代 outline 提供视觉聚焦反馈）。

\`\`\`html
<!-- 正确：移除默认 outline，用 ring 替代 -->
<button class="outline-none focus:ring-2 focus:ring-blue-500 rounded px-4 py-2">
  安全的按钮
</button>
\`\`\`

## ring 环：聚焦反馈利器

\`ring\` 是 Tailwind 的特色——它在元素**外侧**画一圈"环"，本质是 \`box-shadow\`（不是 border），**不占布局空间**。最适合做聚焦反馈。

| 类名 | 含义 | 用途 |
| --- | --- | --- |
| \`ring\` | 默认 3px 蓝-500 环 | 基础环 |
| \`ring-0\` / \`ring-1\` / \`ring-2\` / \`ring-4\` / \`ring-8\` | 环宽度 | 自定义环宽 |
| \`ring-{color}\` | 环颜色 | 配合宽度 |
| \`ring-inset\` | 环画在**内侧** | 内嵌环效果 |
| \`ring-offset-2\` / \`ring-offset-4\` | 环和元素的间隙 | 双层视觉（环和元素之间有缝） |
| \`ring-offset-{color}\` | 间隙颜色 | 配合 offset |

\`\`\`html
<!-- 聚焦反馈：focus:ring-2 focus:ring-blue-500 -->
<button class="focus:ring-2 focus:ring-blue-500 ...">点击我</button>

<!-- 头像选中环：ring-2 ring-offset-2 ring-green-500 -->
<img class="ring-2 ring-offset-2 ring-green-500 rounded-full" />
\`\`\`

### ring 和 border 的本质区别

这是常被混淆的点：

| 维度 | border | ring |
| --- | --- | --- |
| CSS 属性 | \`border\` | \`box-shadow\`（0 0 0 Npx color） |
| 占布局空间 | **是**（1px border 让元素大 2px） | **否**（不影响盒子尺寸） |
| 在元素哪侧 | 内侧（border 在 padding 之外） | 外侧（默认）/ 内侧（\`ring-inset\`） |
| 可叠加 | 单层 | 可多层（\`ring\` + \`shadow\` 叠加） |
| 适用场景 | 装饰、分隔 | 聚焦反馈、选中态 |

> 💡 **为什么聚焦用 ring 不用 border**：聚焦时如果用 \`focus:border-blue-500\`，原本没边框的元素会突然多出 1px 边框，导致**内容向内挤压 1px**（布局跳动）。用 \`focus:ring\` 则完全不影响布局——环是 \`box-shadow\`，画在元素之外。这就是 Tailwind 推荐聚焦用 ring 的根本原因。

### ring-offset 的"双层环"效果

\`ring-offset-2\` 在环和元素之间留 2px 间隙，间隙颜色默认白色（可改）。常用于"选中态"视觉——例如头像被选中时，头像 + 2px 白缝 + 绿环，层次分明。

### 多重 ring（v3.x 高级）

v3.x 支持 \`focus:ring-2 focus:ring-blue-500 focus:ring-offset-2\` 三层叠加（环 + 缝 + 元素）。也可以用任意值做更多层：\`[box-shadow:0_0_0_2px_red,0_0_0_4px_blue]\`。

## divide 分隔线：列表神器

当一组元素**垂直或水平堆叠**，想在它们**之间**加分隔线，\`divide\` 比手动给每个加 border 高效得多：

| 类名 | 含义 | 等价于 |
| --- | --- | --- |
| \`divide-y\` | 子元素之间加**水平**分隔线（垂直列表） | 每个子元素 \`border-t\`（除第一个） |
| \`divide-x\` | 子元素之间加**垂直**分隔线（水平列表） | 每个子元素 \`border-l\`（除第一个） |
| \`divide-y-0\` / \`divide-y-2\` / \`divide-y-4\` | 分隔线宽度 | |
| \`divide-{color}\` | 分隔线颜色 | |
| \`divide-y-reverse\` / \`divide-x-reverse\` | 反向（分隔线画在底部/右侧） | |

\`\`\`html
<!-- 垂直列表分隔：divide-y divide-gray-200 -->
<ul class="divide-y divide-gray-200">
  <li class="py-3">第一项</li>
  <li class="py-3">第二项</li>
  <li class="py-3">第三项</li>
</ul>
\`\`\`

> 💡 **divide vs 手动 border**：\`divide-y\` 自动处理"第一个元素不要顶部分隔线"，比手动写 \`border-t border-t-gray-200 first:border-t-0\` 简洁得多。但 \`divide\` 依赖 \`border-collapse\` 思路，对**动态增删**的列表有重绘成本，超长列表慎用。

> ⚠️ **divide 与 flex/grid 配合**：\`divide-x\` 在 \`flex\` 容器里有效（子元素是 flex item），但 \`divide-y\` 在 \`grid\` 多列布局里**只按 DOM 顺序**加分隔线，可能不符合视觉。grid 列表分隔建议用 \`gap\` + 单独边框。

## 任意值：方括号语法

预设刻度不够用时，用方括号写任意值：

| 写法 | 含义 |
| --- | --- |
| \`rounded-[10px]\` | 10px 圆角 |
| \`rounded-[50%]\` | 50% 圆角（椭圆） |
| \`border-[3px]\` | 3px 边框宽度 |
| \`border-[#1da1f2]\` | 任意颜色边框 |
| \`ring-[5px]\` | 5px 环宽 |
| \`divide-y-[3px]\` | 3px 分隔线 |

\`\`\`html
<!-- 任意圆角 -->
<div class="rounded-[18px] bg-indigo-500 p-4">18px 自定义圆角</div>
<!-- 任意边框色 -->
<div class="border-2 border-[#1da1f2] p-4">Twitter 蓝</div>
\`\`\`

> ⚠️ **任意值的代价**：方括号任意值不会被 Tailwind 编译进产物缓存，每个任意值都生成独立 CSS 规则。大量使用会让 CSS 体积膨胀。**优先用预设刻度，任意值作为逃生舱**。

## 实战组合模式

### 1. 标准卡片

\`\`\`html
<div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
  <h3 class="font-semibold text-gray-800 mb-2">标题</h3>
  <p class="text-sm text-gray-600">内容</p>
</div>
\`\`\`

\`rounded-lg\` + \`border\` + \`border-gray-200\` + \`shadow-sm\` 是卡片"四件套"——克制但有质感。

### 2. 输入框聚焦态

\`\`\`html
<input class="border border-gray-300 rounded-md px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
\`\`\`

\`focus:outline-none\` 移除默认轮廓 + \`focus:ring-2\` 加蓝环 + \`focus:border-blue-500\` 边框也变蓝——三件套提供清晰聚焦反馈，且不影响布局。

### 3. 选中头像

\`\`\`html
<img class="w-12 h-12 rounded-full ring-2 ring-offset-2 ring-blue-500" />
\`\`\`

\`ring-2 ring-offset-2\` 形成"头像 + 2px 白缝 + 蓝环"的选中视觉。

### 4. 虚线上传区

\`\`\`html
<div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
  拖拽文件到此
</div>
\`\`\`

\`border-2 border-dashed\` + \`hover:border-blue-500\` 是上传区标配。

## 常见陷阱总结

1. **\`border\` 单写看不见**：必须配 \`border-{color}\`，否则颜色继承文字色。
2. **\`outline-none\` 必配 \`focus:ring\`**：移除默认聚焦轮廓要提供替代，否则键盘用户无法导航。
3. **聚焦用 ring 不用 border**：border 会让布局跳动，ring 不会。
4. **\`border-transparent\` 防 hover 抖动**：默认无边框时用透明占位，避免悬停时元素跳动。
5. **\`border-double\` 需 ≥3px**：宽度不够双线糊成一团。
6. **圆角要统一**：一个界面用 1~2 档圆角，别混用。
7. **\`divide\` 不适合 grid 多列**：按 DOM 顺序分隔，视觉可能错位。
8. **\`rounded-full\` 非正圆**：方形元素配 \`rounded-full\` 是椭圆，要正圆需 \`w-N h-N\` 等宽高。

## 动手试试

下面的演示覆盖了边框宽度对照、方向边框、边框样式、圆角各档位、方向圆角、ring 聚焦效果、divide 分隔列表、任意值。修改任意 class 后点"运行"查看实时效果，试着改边框颜色、圆角大小、ring 宽度感受变化。`,
    code: `<!-- ============================================================ -->
<!-- 第一章演示：边框与圆角全览                                       -->
<!-- 包含：边框宽度 / 方向边框 / 边框样式 / 圆角阶梯 /              -->
<!--       方向圆角 / outline / ring 聚焦 / divide 分隔 / 任意值     -->
<!-- ============================================================ -->

<!-- 外层容器：max-w-4xl 最大宽 56rem，mx-auto 居中，p-6 内边距，space-y-10 子元素间距 -->
<div class="max-w-4xl mx-auto p-6 space-y-10">

  <!-- ============ 区块 1：边框宽度对照 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">① 边框宽度对照</h2>
    <p class="text-sm text-gray-500 mb-4">border-0 / border(1px) / border-2 / border-4 / border-8。注意必须配 border-{color} 才看得见。</p>

    <!-- 五种宽度对比：统一 border-gray-400 灰色，p-4 内边距，mb-2 行间距 -->
    <div class="space-y-3">
      <!-- border-0：0px 无边框 -->
      <div class="border-0 border-gray-400 p-4 bg-gray-50 rounded text-sm text-gray-700">border-0 — 0px（无边框）</div>
      <!-- border：1px 默认，最常用 -->
      <div class="border border-gray-400 p-4 bg-gray-50 rounded text-sm text-gray-700">border — 1px（默认，最常用）</div>
      <!-- border-2：2px 略粗 -->
      <div class="border-2 border-gray-400 p-4 bg-gray-50 rounded text-sm text-gray-700">border-2 — 2px（hover/active 强调）</div>
      <!-- border-4：4px 粗 -->
      <div class="border-4 border-gray-400 p-4 bg-gray-50 rounded text-sm text-gray-700">border-4 — 4px（装饰性）</div>
      <!-- border-8：8px 很粗 -->
      <div class="border-8 border-gray-400 p-4 bg-gray-50 rounded text-sm text-gray-700">border-8 — 8px（艺术效果）</div>
    </div>
  </section>

  <!-- ============ 区块 2：方向边框 + 颜色 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">② 方向边框 &amp; 颜色</h2>
    <p class="text-sm text-gray-500 mb-4">border-t/r/b/l 仅单侧；颜色用 border-{color}-{shade}。</p>

    <div class="grid grid-cols-2 gap-4">
      <!-- 引用块：border-l-4 左侧 4px 色条 -->
      <blockquote class="border-l-4 border-blue-500 bg-blue-50 pl-4 py-3 pr-3 rounded-r">
        <p class="text-sm text-blue-900">border-l-4 border-blue-500 —— 引用块左侧色条</p>
      </blockquote>
      <!-- 顶部分隔：border-t-2 -->
      <div class="border-t-2 border-emerald-500 bg-emerald-50 pt-3 px-3 pb-2 rounded-b">
        <p class="text-sm text-emerald-900">border-t-2 border-emerald-500 —— 顶部色条</p>
      </div>
      <!-- 底部分隔：border-b（最常用） -->
      <div class="border-b border-gray-300 pb-2">
        <p class="text-sm text-gray-700">border-b border-gray-300 —— 底部细分隔（表头/标题常用）</p>
      </div>
      <!-- 状态色边框：红色错误态 -->
      <div class="border-2 border-red-400 bg-red-50 p-3 rounded">
        <p class="text-sm text-red-700">border-2 border-red-400 —— 错误/危险态边框</p>
      </div>
    </div>
  </section>

  <!-- ============ 区块 3：边框样式 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">③ 边框样式（solid/dashed/dotted/double）</h2>
    <p class="text-sm text-gray-500 mb-4">border-double 需 ≥3px 宽度才看清双线。</p>

    <div class="space-y-3">
      <!-- 实线（默认）：border-solid -->
      <div class="border-2 border-solid border-gray-500 p-3 rounded text-sm text-gray-700">border-solid — 实线（默认）</div>
      <!-- 虚线：border-dashed，常用于占位上传区 -->
      <div class="border-2 border-dashed border-blue-400 p-3 rounded text-sm text-gray-700">border-dashed — 虚线（占位/上传区）</div>
      <!-- 点线：border-dotted，装饰性 -->
      <div class="border-2 border-dotted border-purple-400 p-3 rounded text-sm text-gray-700">border-dotted — 点线（装饰）</div>
      <!-- 双线：border-double，需 ≥3px -->
      <div class="border-4 border-double border-amber-600 p-3 rounded text-sm text-gray-700">border-4 border-double — 双线（装饰，复古）</div>
    </div>
  </section>

  <!-- ============ 区块 4：圆角阶梯 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">④ 圆角阶梯（rounded-none ~ rounded-full）</h2>
    <p class="text-sm text-gray-500 mb-4">最常用 rounded-lg(8px)；rounded-full 需配等宽高才是正圆。</p>

    <!-- 8 档圆角对比：统一 w-20 h-20 方块，bg-indigo-500，flex 居中显示类名 -->
    <div class="flex flex-wrap items-center gap-4">
      <div class="w-20 h-20 bg-indigo-500 rounded-none flex items-center justify-center text-white text-xs text-center">rounded-none</div>
      <div class="w-20 h-20 bg-indigo-500 rounded-sm flex items-center justify-center text-white text-xs text-center">rounded-sm</div>
      <div class="w-20 h-20 bg-indigo-500 rounded flex items-center justify-center text-white text-xs text-center">rounded</div>
      <div class="w-20 h-20 bg-indigo-500 rounded-md flex items-center justify-center text-white text-xs text-center">rounded-md</div>
      <div class="w-20 h-20 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-xs text-center">rounded-lg</div>
      <div class="w-20 h-20 bg-indigo-500 rounded-xl flex items-center justify-center text-white text-xs text-center">rounded-xl</div>
      <div class="w-20 h-20 bg-indigo-500 rounded-2xl flex items-center justify-center text-white text-xs text-center">rounded-2xl</div>
      <div class="w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center text-white text-xs text-center">rounded-3xl</div>
      <div class="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs text-center">rounded-full</div>
    </div>
  </section>

  <!-- ============ 区块 5：方向圆角 + 不规则圆角 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑤ 方向圆角 &amp; 不规则圆角</h2>
    <p class="text-sm text-gray-500 mb-4">rounded-t/r/b/l 圆某一侧；组合单角做气泡等不规则形状。</p>

    <div class="grid grid-cols-3 gap-4">
      <!-- 仅上方圆角：rounded-t-2xl -->
      <div class="bg-rose-500 text-white p-4 rounded-t-2xl h-24 flex items-end text-sm">rounded-t-2xl（仅上圆）</div>
      <!-- 仅下方圆角：rounded-b-2xl -->
      <div class="bg-rose-500 text-white p-4 rounded-b-2xl h-24 flex items-start text-sm">rounded-b-2xl（仅下圆）</div>
      <!-- 仅左侧圆角：rounded-l-2xl -->
      <div class="bg-rose-500 text-white p-4 rounded-l-2xl h-24 flex items-center text-sm">rounded-l-2xl（仅左圆）</div>
      <!-- 气泡：rounded-2xl rounded-tl-none（左上不圆接尾巴） -->
      <div class="bg-blue-500 text-white p-4 rounded-2xl rounded-tl-none h-24 flex items-center text-sm">气泡<br>rounded-tl-none</div>
      <!-- 单角圆：rounded-tr-3xl rounded-bl-3xl -->
      <div class="bg-emerald-500 text-white p-4 rounded-tr-3xl rounded-bl-3xl h-24 flex items-center text-sm">对角圆<br>tr-3xl bl-3xl</div>
      <!-- 按钮组：左半 rounded-r-none，右半 rounded-l-none -->
      <div class="flex h-24">
        <button class="bg-gray-700 text-white px-3 rounded-l-lg text-sm">左</button>
        <button class="bg-gray-800 text-white px-3 text-sm">中</button>
        <button class="bg-gray-900 text-white px-3 rounded-r-lg text-sm">右</button>
      </div>
    </div>
  </section>

  <!-- ============ 区块 6：ring 聚焦效果 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑥ ring 环聚焦效果</h2>
    <p class="text-sm text-gray-500 mb-4">点击下方按钮/输入框看 ring 聚焦环；ring 不占布局，比 border 更适合聚焦反馈。</p>

    <div class="space-y-4">
      <!-- 输入框聚焦：focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">点击聚焦看蓝环：</label>
        <input type="text" placeholder="点击我聚焦"
               class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
      </div>

      <!-- 不同颜色 ring 的按钮组 -->
      <div class="flex flex-wrap gap-3">
        <!-- 默认 ring（3px blue-500） -->
        <button class="bg-gray-100 text-gray-800 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">focus:ring-2（蓝）</button>
        <!-- 绿色 ring -->
        <button class="bg-gray-100 text-gray-800 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">focus:ring-2（绿）</button>
        <!-- 红色 ring + 宽环 ring-4 -->
        <button class="bg-gray-100 text-gray-800 px-4 py-2 rounded focus:outline-none focus:ring-4 focus:ring-red-300 text-sm">focus:ring-4（红宽）</button>
        <!-- ring-offset 双层环 -->
        <button class="bg-gray-100 text-gray-800 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 text-sm">ring-offset（带缝）</button>
      </div>

      <!-- 选中头像：ring-2 ring-offset-2 ring-green-500 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-2">选中头像（ring-2 ring-offset-2 ring-green-500）：</p>
        <div class="flex gap-3">
          <!-- 未选中：无 ring -->
          <div class="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">A</div>
          <!-- 选中：ring-2 ring-offset-2 ring-green-500 -->
          <div class="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold ring-2 ring-offset-2 ring-green-500">B</div>
          <!-- 内嵌环：ring-2 ring-inset ring-blue-500 -->
          <div class="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold ring-2 ring-inset ring-white">C</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ 区块 7：divide 分隔列表 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑦ divide 分隔线</h2>
    <p class="text-sm text-gray-500 mb-4">divide-y 垂直列表分隔，divide-x 水平列表分隔，自动跳过首项。</p>

    <div class="grid grid-cols-2 gap-6">
      <!-- 垂直列表：divide-y divide-gray-200 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-2">divide-y（垂直列表）</p>
        <ul class="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          <li class="px-4 py-3 text-sm text-gray-700 bg-white">📋 第一项：项目概览</li>
          <li class="px-4 py-3 text-sm text-gray-700 bg-white">👥 第二项：团队成员</li>
          <li class="px-4 py-3 text-sm text-gray-700 bg-white">📊 第三项：数据分析</li>
          <li class="px-4 py-3 text-sm text-gray-700 bg-white">⚙️ 第四项：系统设置</li>
        </ul>
      </div>
      <!-- 水平列表：divide-x divide-gray-300 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-2">divide-x（水平列表）</p>
        <div class="flex divide-x divide-gray-300 border border-gray-300 rounded-lg overflow-hidden">
          <div class="flex-1 px-3 py-3 text-sm text-gray-700 bg-white text-center">首页</div>
          <div class="flex-1 px-3 py-3 text-sm text-gray-700 bg-white text-center">产品</div>
          <div class="flex-1 px-3 py-3 text-sm text-gray-700 bg-white text-center">关于</div>
          <div class="flex-1 px-3 py-3 text-sm text-gray-700 bg-white text-center">联系</div>
        </div>
        <!-- 彩色分隔线：divide-blue-300 -->
        <p class="text-xs font-semibold text-gray-500 mt-4 mb-2">divide-blue-300（彩色分隔）</p>
        <ul class="divide-y divide-blue-300 border border-blue-300 rounded-lg overflow-hidden">
          <li class="px-4 py-2 text-sm text-blue-800 bg-blue-50">蓝色主题项 1</li>
          <li class="px-4 py-2 text-sm text-blue-800 bg-blue-50">蓝色主题项 2</li>
          <li class="px-4 py-2 text-sm text-blue-800 bg-blue-50">蓝色主题项 3</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- ============ 区块 8：任意值 + outline ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑧ 任意值 &amp; outline</h2>
    <p class="text-sm text-gray-500 mb-4">rounded-[18px]、border-[#1da1f2]、outline + outline-offset 双层轮廓。</p>

    <div class="grid grid-cols-2 gap-4">
      <!-- 任意圆角：rounded-[18px] -->
      <div class="rounded-[18px] bg-gradient-to-br from-purple-500 to-pink-500 p-5 text-white">
        <p class="text-sm font-semibold">rounded-[18px]</p>
        <p class="text-xs text-purple-100 mt-1">自定义 18px 圆角</p>
      </div>
      <!-- 任意边框色：border-[#1da1f2] Twitter 蓝 -->
      <div class="border-2 border-[#1da1f2] bg-[#1da1f2]/5 p-5 rounded-lg">
        <p class="text-sm font-semibold text-[#1da1f2]">border-[#1da1f2]</p>
        <p class="text-xs text-gray-600 mt-1">Twitter 品牌色边框</p>
      </div>
      <!-- outline + offset 双层轮廓 -->
      <div class="flex items-center justify-center py-6">
        <button class="px-4 py-2 bg-amber-500 text-white rounded outline-none focus:outline-4 focus:outline-amber-500 focus:outline-offset-4 text-sm">
          点击我（outline-offset）
        </button>
      </div>
      <!-- 任意分隔线宽度：divide-y-[3px] -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-2">divide-y-[3px]（任意宽度）</p>
        <ul class="divide-y divide-y-[3px] divide-gray-400 border border-gray-400 rounded">
          <li class="px-3 py-2 text-sm text-gray-700 bg-white">3px 分隔项 A</li>
          <li class="px-3 py-2 text-sm text-gray-700 bg-white">3px 分隔项 B</li>
          <li class="px-3 py-2 text-sm text-gray-700 bg-white">3px 分隔项 C</li>
        </ul>
      </div>
    </div>
  </section>
</div>`,
  },

  // =========================================================
  // 第二章：阴影与效果
  // =========================================================
  {
    id: "tw-shadows",
    title: "阴影与效果",
    icon: "🌑",
    group: "组件样式",
    content: `## 阴影与效果：界面的"立体感与动效"

平面设计有句老话："**没有阴影的世界是平的**"。在 UI 里同样成立——如果所有元素都是纯色块、没有阴影、没有过渡，界面会显得呆板、廉价、缺乏层次。恰到好处的阴影让卡片"浮起来"，过渡动画让交互"有反馈"，玻璃态让背景"透出来"，这些"效果"是界面从"能用"到"好用"再到"爱用"的关键升级。

Tailwind 把 CSS 里所有和"视觉效果"相关的属性都拆成了工具类：阴影（box-shadow）、透明度（opacity）、混合模式（blend-mode）、滤镜（filter）、背景滤镜（backdrop-filter）、过渡（transition）、动画（animation）、变换（transform）。本章将**逐一、深入**讲解这些类，包括它们的底层 CSS 原理、性能代价、以及大量实战陷阱。

> 💡 **核心心法**：效果是"调味料"，不是"主菜"。一个界面如果**结构（布局）和内容（文字）**没做好，加再多阴影动画也救不回来。反之，结构和内容到位后，**克制的效果**（一个 \`shadow-sm\`、一段 \`transition\`、一个 \`hover:scale-105\`）就能让界面"活"起来。新手最常犯的错是"效果过度"——满屏 \`shadow-2xl\`、到处 \`animate-pulse\`、所有元素都 \`transition-all\`，结果是视觉噪音爆炸。

## 阴影：shadow 家族

阴影用 \`shadow\` 前缀，本质是 \`box-shadow\`，预设了 7 档（v3.x）：

| 类名 | box-shadow 强度 | 视觉 | 用途 |
| --- | --- | --- | --- |
| \`shadow-none\` | 无 | 完全平面 | 移除阴影 |
| \`shadow-sm\` | 极淡 | 微浮 | 细边框卡片、徽章 |
| \`shadow\` | 浅 | 略浮 | 默认卡片、按钮 |
| \`shadow-md\` | 中 | 明显浮起 | 悬停卡片、下拉菜单 |
| \`shadow-lg\` | 较深 | 高浮 | 模态框、弹窗 |
| \`shadow-xl\` | 深 | 很高浮 | 大弹窗、营销卡片 |
| \`shadow-2xl\` | 极深 | 浮空 | 英雄区卡片、强调 |
| \`shadow-inner\` | 内阴影 | 凹陷 | 输入框内凹、按压态 |

\`\`\`html
<!-- 标准卡片：shadow-sm 克制有质感 -->
<div class="bg-white rounded-lg shadow-sm p-6">卡片</div>
<!-- 悬停加深：hover:shadow-md -->
<div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">悬停卡片</div>
\`\`\`

### 阴影的"层级哲学"

阴影传达**层级关系**——阴影越深，元素越"靠近"用户。设计时遵循：

1. **背景层**：无阴影（页面底色）。
2. **内容层**：\`shadow-sm\`（卡片、列表）。
3. **浮起层**：\`shadow-md\` / \`shadow-lg\`（悬停、下拉菜单）。
4. **覆盖层**：\`shadow-xl\` / \`shadow-2xl\`（模态框、抽屉）。

一个界面里**同时存在的阴影档位不要超过 3 个**，否则层级混乱。

### shadow-inner：内凹阴影

\`shadow-inner\` 把阴影画在元素**内侧**，营造"凹陷"感，常用于：

- 输入框内凹效果（替代边框）
- 按钮按压态（\`active:shadow-inner\`）
- 选中的标签页

\`\`\`html
<!-- 按压态按钮：active:shadow-inner -->
<button class="bg-gray-200 active:shadow-inner active:bg-gray-300 px-4 py-2 rounded">
  按下我
</button>
\`\`\`

## 阴影颜色：shadow-{color}（v3.x）

默认阴影是黑色半透明（\`rgba(0,0,0,0.1)\` 系列）。v3.x 起支持**彩色阴影**：

| 类名 | 含义 |
| --- | --- |
| \`shadow-{color}-{shade}\` | 彩色阴影（如 \`shadow-blue-500\`） |
| \`shadow-{color}/{opacity}\` | 彩色阴影 + 透明度 |

\`\`\`html
<!-- 彩色阴影：让阴影呼应主题色 -->
<button class="bg-blue-500 shadow-lg shadow-blue-500/50 text-white px-4 py-2 rounded">
  蓝色光晕按钮
</button>
\`\`\`

> 💡 **彩色阴影的高级感**：彩色阴影（\`shadow-{color}/50\`）比黑色阴影更"现代"——它让阴影和元素颜色呼应，营造"发光"感。常用于 CTA 按钮、强调卡片。但**别滥用**，否则界面像霓虹灯。

> ⚠️ **陷阱**：\`shadow-{color}\` 只改颜色，**必须配合 \`shadow\`/\`shadow-md\` 等宽度类**才显示。单写 \`shadow-blue-500\` 不会出现阴影（因为没有 \`box-shadow\` 定义）。

## 透明度：opacity

\`opacity-{n}\` 控制元素整体透明度，0~100（v3.x 支持 0/5/10/20/.../100 任意 5 的倍数，也可任意值）：

| 类名 | opacity | 用途 |
| --- | --- | --- |
| \`opacity-0\` | 0（完全透明） | 隐藏（但仍占空间，配合 hover 显示） |
| \`opacity-25\` | 25% | 极淡 |
| \`opacity-50\` | 50% | 半透明 |
| \`opacity-75\` | 75% | 略透 |
| \`opacity-100\` | 100%（默认） | 不透明 |

\`\`\`html
<!-- 禁用态：opacity-50 -->
<button class="opacity-50 cursor-not-allowed">禁用按钮</button>
<!-- 悬停显示：opacity-0 hover:opacity-100 -->
<div class="opacity-0 hover:opacity-100 transition-opacity">悬停才显示</div>
\`\`\`

### opacity vs 颜色透明度

两种"透明"方式的区别：

- \`opacity-50\`：整个元素（含子元素、文字、边框）都半透明。
- \`bg-black/50\`：只背景半透明，文字不透明（更常用）。

做"遮罩层"时用 \`bg-black/50\`（遮罩半透，但遮罩上的文字清晰）；做"禁用态"时用 \`opacity-50\`（整个控件淡化）。

## 混合模式：mix-blend / bg-blend

混合模式控制元素如何与**下层**颜色混合，类似 Photoshop 的图层混合：

### mix-blend-{mode}：元素混合

| 类名 | 含义 |
| --- | --- |
| \`mix-blend-normal\` | 正常（默认） |
| \`mix-blend-multiply\` | 正片叠底（变暗） |
| \`mix-blend-screen\` | 滤色（变亮） |
| \`mix-blend-overlay\` | 叠加 |
| \`mix-blend-darken\` / \`mix-blend-lighten\` | 变暗/变亮 |
| \`mix-blend-color-dodge\` / \`mix-blend-color-burn\` | 颜色减淡/加深 |
| \`mix-blend-hard-light\` / \`mix-blend-soft-light\` | 强光/柔光 |
| \`mix-blend-difference\` / \`mix-blend-exclusion\` | 差值/排除 |
| \`mix-blend-hue\` / \`mix-blend-saturation\` / \`mix-blend-color\` / \`mix-blend-luminosity\` | HSL 分量混合 |

### bg-blend-{mode}：背景混合

\`bg-blend-\` 控制元素的**多个背景层**之间如何混合（背景色 + 背景图）。

\`\`\`html
<!-- mix-blend-multiply：让文字和背景图融合 -->
<div class="bg-gradient-to-br from-pink-500 to-orange-500">
  <h2 class="mix-blend-multiply text-white text-6xl font-black">融合文字</h2>
</div>
\`\`\`

> 💡 **混合模式是高级技巧**，用得好能做艺术效果，用不好会让界面"脏"。日常 UI 几乎不用，主要场景：营销页大字标题、艺术化背景、图片叠加效果。

## 滤镜：filter 家族

\`filter\` 给元素加视觉效果滤镜（类似 Instagram 滤镜）。Tailwind 把每个滤镜函数都拆成了独立类：

| 类名 | CSS | 作用 |
| --- | --- | --- |
| \`filter\` | \`filter: ...\` | 启用滤镜（v3 自动启用可省略） |
| \`blur-sm\` / \`blur\` / \`blur-md\` / \`blur-lg\` / \`blur-xl\` | \`blur(Npx)\` | 高斯模糊 |
| \`brightness-0\` ~ \`brightness-200\` | \`brightness(N%)\` | 亮度（100=原样） |
| \`contrast-0\` ~ \`contrast-200\` | \`contrast(N%)\` | 对比度 |
| \`grayscale-0\` / \`grayscale\` | \`grayscale(N%)\` | 灰度（头像默认彩，hover 灰） |
| \`hue-rotate-15\` ~ \`hue-rotate-180\` | \`hue-rotate(Ndeg)\` | 色相旋转 |
| \`invert-0\` / \`invert\` | \`invert(N%)\` | 反色 |
| \`saturate-0\` ~ \`saturate-200\` | \`saturate(N%)\` | 饱和度 |
| \`sepia-0\` / \`sepia\` | \`sepia(N%)\` | 棕褐色（复古） |
| \`drop-shadow-sm\` / \`drop-shadow\` / \`drop-shadow-md\` / \`drop-shadow-lg\` / \`drop-shadow-xl\` / \`drop-shadow-2xl\` | \`drop-shadow(...)\` | **滤镜阴影**（按形状投影） |

\`\`\`html
<!-- 头像默认灰，hover 彩 -->
<img class="grayscale hover:grayscale-0 transition" />
<!-- 按下变暗：active:brightness-75 -->
<button class="active:brightness-75">按下变暗</button>
\`\`\`

### drop-shadow vs box-shadow

这是常被混淆的两个阴影：

| 维度 | box-shadow（\`shadow\`） | drop-shadow（\`drop-shadow\`） |
| --- | --- | --- |
| 投影形状 | **矩形**（盒子形状） | **按元素不透明像素**投影 |
| 适用对象 | 矩形卡片、按钮 | 透明 PNG 图标、SVG、不规则形状、文字 |
| CSS 属性 | \`box-shadow\` | \`filter: drop-shadow()\` |
| 性能 | 好 | 较差（滤镜计算） |

> 💡 **drop-shadow 用法**：给透明背景的 PNG/SVG 图标加阴影时，\`shadow\` 会按矩形投出"方块阴影"（很难看），\`drop-shadow\` 则按图标的实际形状投影。文字加阴影也用 \`drop-shadow\`（\`shadow\` 是盒子阴影，会让文字方块化）。

\`\`\`html
<!-- 文字光晕：drop-shadow（不是 shadow） -->
<span class="text-5xl drop-shadow-lg">✨</span>
\`\`\`

## 背景滤镜：backdrop 家族

\`backdrop-filter\` 给元素**背后的内容**（透过元素能看到的内容）加滤镜。最经典的应用是**玻璃态（Glassmorphism）**：

| 类名 | 作用 |
| --- | --- |
| \`backdrop-blur-sm\` / \`backdrop-blur\` / \`backdrop-blur-md\` / \`backdrop-blur-lg\` / \`backdrop-blur-xl\` | 背景模糊 |
| \`backdrop-brightness-...\` | 背景亮度 |
| \`backdrop-contrast-...\` | 背景对比度 |
| \`backdrop-grayscale\` | 背景灰度 |
| \`backdrop-hue-rotate-...\` | 背景色相 |
| \`backdrop-invert\` | 背景反色 |
| \`backdrop-opacity-...\` | 背景透明度 |
| \`backdrop-saturate-...\` | 背景饱和度 |
| \`backdrop-sepia\` | 背景棕褐 |

\`\`\`html
<!-- 玻璃态卡片：bg-white/30 + backdrop-blur-lg -->
<div class="bg-white/30 backdrop-blur-lg border border-white/40 rounded-xl p-6">
  透过我能看到背景模糊
</div>
\`\`\`

### 玻璃态配方

玻璃态的"三件套"：\`bg-{color}/{30-50}\`（半透明背景）+ \`backdrop-blur-lg\`（背景模糊）+ \`border border-white/40\`（半透明边框增加边缘层次）。再加 \`shadow-lg\` 提升浮起感。

> ⚠️ **性能陷阱**：\`backdrop-filter\` 是**性能杀手**——浏览器要对元素背后所有像素做实时滤镜计算。大面积使用（如整页背景）会卡顿，尤其移动端。建议只用于小面积卡片、导航栏。Safari 旧版需要 \`-webkit-\` 前缀，Tailwind 已自动处理。

## 过渡：transition 家族

过渡让属性变化"平滑"而非"突变"，是交互反馈的灵魂：

| 类名 | 作用 |
| --- | --- |
| \`transition-none\` | 无过渡 |
| \`transition\` | 过渡 color/background/border/transform 等常用属性（150ms） |
| \`transition-all\` | 过渡**所有**属性（慎用，性能差） |
| \`transition-colors\` | 仅过渡 color/background/border（150ms） |
| \`transition-opacity\` | 仅过渡 opacity（150ms） |
| \`transition-shadow\` | 仅过渡 box-shadow（150ms） |
| \`transition-transform\` | 仅过渡 transform（150ms） |
| \`duration-75\` / \`duration-100\` / \`duration-150\` / \`duration-200\` / \`duration-300\` / \`duration-500\` / \`duration-700\` / \`duration-1000\` | 持续时间（ms） |
| \`ease-linear\` / \`ease-in\` / \`ease-out\` / \`ease-in-out\` | 缓动函数 |
| \`delay-75\` / \`delay-100\` / \`delay-150\` / \`delay-300\` / \`delay-500\` / \`delay-700\` / \`delay-1000\` | 延迟（ms） |

\`\`\`html
<!-- 按钮 hover 过渡：transition-colors duration-200 -->
<button class="bg-blue-500 hover:bg-blue-600 transition-colors duration-200">
  悬停变色
</button>

<!-- 卡片 hover 浮起：transition-shadow + transition-transform -->
<div class="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
  悬停浮起
</div>
\`\`\`

### transition vs transition-all

- \`transition\`：只过渡**白名单属性**（color、background、border、transform、opacity、box-shadow 等），性能好。
- \`transition-all\`：过渡**所有**属性，包括 width/height/margin 等，**性能差**（每帧重排），慎用。

> 💡 **最佳实践**：优先用 \`transition\`（默认白名单足够 90% 场景），需要特定属性用 \`transition-colors\`/\`transition-transform\` 等。只在确实需要过渡 \`all\` 时才用 \`transition-all\`。

### 缓动函数的"感觉"

| 缓动 | 感觉 | 用途 |
| --- | --- | --- |
| \`ease-linear\` | 匀速 | 进度条、机械运动 |
| \`ease-in\` | 慢→快（加速） | 元素退出、下落 |
| \`ease-out\` | 快→慢（减速） | 元素进入（最自然） |
| \`ease-in-out\` | 慢→快→慢 | 大多数交互（默认） |

UI 交互**默认用 \`ease-out\` 或 \`ease-in-out\`**——元素"减速到位"比"加速到位"更自然。\`ease-in\` 只用于"离开"（如下拉菜单关闭）。

## 动画：animate 家族

\`animate-\` 给元素加预设动画：

| 类名 | 动画 | 用途 |
| --- | --- | --- |
| \`animate-spin\` | 360° 旋转（1s 循环） | 加载 spinner |
| \`animate-ping\` | 缩放+淡出（1s 循环） | 在线指示点、雷达 |
| \`animate-pulse\` | 透明度脉动（2s 循环） | 骨架屏、加载占位 |
| \`animate-bounce\` | 上下弹跳（1s 循环） | 加载文字、"下拉更多" |

\`\`\`html
<!-- 加载 spinner：animate-spin -->
<svg class="animate-spin h-5 w-5">...</svg>

<!-- 在线指示：animate-ping -->
<span class="relative flex h-3 w-3">
  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
  <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
</span>

<!-- 骨架屏：animate-pulse -->
<div class="animate-pulse bg-gray-200 rounded h-4 w-3/4"></div>
\`\`\`

### 自定义动画

在 \`tailwind.config.js\` 里扩展 \`animation\` 和 \`keyframes\`：

\`\`\`js
module.exports = {
  theme: {
    extend: {
      animation: {
        wiggle: 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
};
\`\`\`

> ⚠️ **可访问性警告**：动画可能引发部分用户的前庭紊乱（眩晕）。应在系统设置"减少动效"时禁用动画，Tailwind 提供 \`motion-safe:\` 和 \`motion-reduce:\` 前缀：\`animate-spin motion-reduce:animate-none\`。

## transform：平移 / 缩放 / 旋转 / 倾斜

\`transform\` 改变元素的形状和位置，**不触发重排**（性能极好），是动画首选：

| 类名 | 作用 | 示例 |
| --- | --- | --- |
| \`translate-x-{n}\` / \`translate-y-{n}\` | 平移 | \`translate-x-4\`（右移 1rem） |
| \`-translate-x-{n}\` / \`-translate-y-{n}\` | 负向平移 | \`-translate-y-1\`（上移） |
| \`scale-0\` / \`scale-50\` / \`scale-75\` / \`scale-90\` / \`scale-95\` / \`scale-100\` / \`scale-105\` / \`scale-110\` / \`scale-125\` / \`scale-150\` | 缩放 | \`hover:scale-105\`（悬停放大） |
| \`rotate-0\` / \`rotate-1\` / \`rotate-2\` / \`rotate-3\` / \`rotate-6\` / \`rotate-12\` / \`rotate-45\` / \`rotate-90\` / \`rotate-180\` | 旋转 | \`rotate-45\` |
| \`-rotate-{n}\` | 反向旋转 | \`-rotate-12\` |
| \`skew-x-{n}\` / \`skew-y-{n}\` | 倾斜 | \`skew-x-12\` |
| \`transform-gpu\` | GPU 加速 | 性能优化 |
| \`transform-none\` | 移除 transform | 重置 |

\`\`\`html
<!-- 悬停放大：hover:scale-105 -->
<button class="hover:scale-105 transition-transform">放大</button>

<!-- 旋转图标：rotate-45 -->
<span class="rotate-45 inline-block">+</span>  <!-- + 转 45° = × -->

<!-- 居中绝对定位：-translate-x-1/2 -translate-y-1/2 -->
<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">居中</div>
\`\`\`

### transform 居中的"黄金组合"

\`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2\` 是绝对定位元素居中的经典写法——先把左上角放到容器中心（\`left-1/2 top-1/2\`），再反向平移自身一半（\`-translate-x-1/2 -translate-y-1/2\`）。比 \`margin: auto\` 更灵活（不需要知道元素尺寸）。

### transform 的"原点"：transform-origin

\`origin-center\`（默认）/ \`origin-top\` / \`origin-bottom\` / \`origin-left\` / \`origin-right\` / \`origin-top-left\` 等控制 transform 的变换原点。旋转/缩放时原点不同效果差异大。

> 💡 **transform 性能优势**：\`transform\` 和 \`opacity\` 是**仅有的两个不触发重排的动画属性**——浏览器只在合成层处理它们，性能极佳。做动画时优先用 \`transform\`（平移/缩放/旋转）而非 \`top/left/width/height\`。

## 实战组合模式

### 1. 悬停浮起卡片

\`\`\`html
<div class="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
  悬停浮起
</div>
\`\`\`

\`transition-all\` + \`hover:shadow-lg\` + \`hover:-translate-y-1\` 是卡片悬停"浮起"标配。

### 2. 玻璃态导航栏

\`\`\`html
<nav class="bg-white/70 backdrop-blur-lg border-b border-white/30 sticky top-0">
  玻璃态导航
</nav>
\`\`\`

\`bg-white/70\` + \`backdrop-blur-lg\` + \`border-white/30\` = 苹果风玻璃态。

### 3. 加载骨架屏

\`\`\`html
<div class="animate-pulse space-y-3">
  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
  <div class="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
\`\`\`

\`animate-pulse\` + 灰色圆角块 = 骨架屏占位。

### 4. CTA 按钮发光

\`\`\`html
<button class="bg-blue-500 shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105 transition-all">
  发光按钮
</button>
\`\`\`

\`shadow-{color}/50\` + \`hover:scale-105\` = 彩色发光 CTA。

## 常见陷阱总结

1. **效果是调味料**：克制使用，过度则视觉噪音爆炸。
2. **\`shadow-{color}\` 须配 \`shadow\` 宽度**：单写颜色不显示。
3. **聚焦反馈用 ring 不用 box-shadow**：ring 已是 box-shadow，叠加 \`shadow\` 会冲突。
4. **\`transition-all\` 性能差**：优先 \`transition\` 或具体属性。
5. **\`backdrop-filter\` 性能杀手**：移动端大面积慎用。
6. **图标阴影用 \`drop-shadow\` 不用 \`shadow\`**：透明 PNG 用 box-shadow 会出方块。
7. **动画要可访问**：\`motion-reduce:animate-none\` 尊重用户设置。
8. **动画优先 \`transform\`/\`opacity\`**：不触发重排，性能好。
9. **阴影层级不超 3 档**：层级混乱显廉价。

## 动手试试

下面的演示覆盖了阴影阶梯、阴影颜色、opacity、玻璃态卡片、transition hover 动画、animate-spin/pulse/bounce、transform 缩放旋转平移。修改任意 class 后点"运行"查看效果，悬停元素感受过渡动画。`,
    code: `<!-- ============================================================ -->
<!-- 第二章演示：阴影与效果全览                                       -->
<!-- 包含：阴影阶梯 / 阴影颜色 / opacity / 玻璃态卡片 /              -->
<!--       transition hover / animate-spin/pulse/bounce /            -->
<!--       transform 缩放旋转平移 / drop-shadow                       -->
<!-- ============================================================ -->

<!-- 外层容器：max-w-4xl 最大宽 56rem，mx-auto 居中，p-6 内边距，space-y-10 子元素间距 -->
<div class="max-w-4xl mx-auto p-6 space-y-10">

  <!-- ============ 区块 1：阴影阶梯 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">① 阴影阶梯（shadow-sm ~ shadow-2xl）</h2>
    <p class="text-sm text-gray-500 mb-4">阴影越深越"浮起"。日常用 shadow-sm/lg，模态框用 shadow-xl/2xl。</p>

    <!-- 8 档阴影对比：统一 w-32 h-24 白底卡片，rounded-lg，flex 居中显示类名 -->
    <div class="flex flex-wrap items-center gap-6 py-6 bg-gray-50 rounded-lg p-4">
      <!-- shadow-none：无阴影 -->
      <div class="w-32 h-24 bg-white rounded-lg shadow-none flex items-center justify-center text-xs text-gray-600">shadow-none</div>
      <!-- shadow-sm：极淡 -->
      <div class="w-32 h-24 bg-white rounded-lg shadow-sm flex items-center justify-center text-xs text-gray-600">shadow-sm</div>
      <!-- shadow：浅 -->
      <div class="w-32 h-24 bg-white rounded-lg shadow flex items-center justify-center text-xs text-gray-600">shadow</div>
      <!-- shadow-md：中 -->
      <div class="w-32 h-24 bg-white rounded-lg shadow-md flex items-center justify-center text-xs text-gray-600">shadow-md</div>
      <!-- shadow-lg：较深 -->
      <div class="w-32 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center text-xs text-gray-600">shadow-lg</div>
      <!-- shadow-xl：深 -->
      <div class="w-32 h-24 bg-white rounded-lg shadow-xl flex items-center justify-center text-xs text-gray-600">shadow-xl</div>
      <!-- shadow-2xl：极深 -->
      <div class="w-32 h-24 bg-white rounded-lg shadow-2xl flex items-center justify-center text-xs text-gray-600">shadow-2xl</div>
      <!-- shadow-inner：内凹 -->
      <div class="w-32 h-24 bg-gray-100 rounded-lg shadow-inner flex items-center justify-center text-xs text-gray-600">shadow-inner</div>
    </div>
  </section>

  <!-- ============ 区块 2：彩色阴影 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">② 彩色阴影（shadow-{color}/opacity）</h2>
    <p class="text-sm text-gray-500 mb-4">彩色阴影呼应主题色，营造"发光"感。注意必须配 shadow 宽度类。</p>

    <div class="flex flex-wrap gap-6 py-6 bg-gray-50 rounded-lg p-4">
      <!-- 蓝色发光按钮：shadow-lg shadow-blue-500/50 -->
      <button class="bg-blue-500 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105 transition-all text-sm font-medium">
        蓝色光晕
      </button>
      <!-- 紫色发光 -->
      <button class="bg-purple-500 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 transition-all text-sm font-medium">
        紫色光晕
      </button>
      <!-- 绿色发光 -->
      <button class="bg-emerald-500 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-emerald-500/50 hover:shadow-emerald-500/70 hover:scale-105 transition-all text-sm font-medium">
        绿色光晕
      </button>
      <!-- 粉色发光 -->
      <button class="bg-pink-500 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 hover:scale-105 transition-all text-sm font-medium">
        粉色光晕
      </button>
      <!-- 琥珀发光 -->
      <button class="bg-amber-500 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-amber-500/50 hover:shadow-amber-500/70 hover:scale-105 transition-all text-sm font-medium">
        琥珀光晕
      </button>
    </div>
  </section>

  <!-- ============ 区块 3：opacity 透明度 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">③ opacity 透明度</h2>
    <p class="text-sm text-gray-500 mb-4">opacity 影响整个元素（含子元素）；bg-{color}/N 只影响背景，文字仍清晰。</p>

    <div class="grid grid-cols-2 gap-6">
      <!-- opacity 阶梯：5 档透明度对比 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-2">opacity 阶梯（整体淡）：</p>
        <div class="space-y-2">
          <div class="bg-blue-500 text-white px-3 py-2 rounded text-sm opacity-100">opacity-100（100%）</div>
          <div class="bg-blue-500 text-white px-3 py-2 rounded text-sm opacity-75">opacity-75（75%）</div>
          <div class="bg-blue-500 text-white px-3 py-2 rounded text-sm opacity-50">opacity-50（50%）</div>
          <div class="bg-blue-500 text-white px-3 py-2 rounded text-sm opacity-25">opacity-25（25%）</div>
        </div>
      </div>
      <!-- bg 透明度 vs opacity 对比 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-2">bg/black-N（背景透，文字清晰）vs opacity-50（整体透）：</p>
        <!-- bg-black/50：遮罩层标配，背景半透文字清晰 -->
        <div class="bg-black/50 text-white px-3 py-2 rounded text-sm mb-2">bg-black/50 + 白字（文字清晰）</div>
        <!-- opacity-50：整体淡化，文字也淡 -->
        <div class="bg-black text-white px-3 py-2 rounded text-sm opacity-50">opacity-50（文字也淡）</div>
        <!-- 禁用态：opacity-50 cursor-not-allowed -->
        <button class="mt-2 bg-gray-500 text-white px-4 py-2 rounded opacity-50 cursor-not-allowed text-sm">禁用按钮（opacity-50）</button>
      </div>
    </div>
  </section>

  <!-- ============ 区块 4：玻璃态卡片（backdrop-blur） ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">④ 玻璃态卡片（backdrop-blur）</h2>
    <p class="text-sm text-gray-500 mb-4">bg-white/30 + backdrop-blur-lg + border-white/40 = 苹果风玻璃态。背后需有内容才看得到模糊。</p>

    <!-- 玻璃态容器：背后放彩色渐变，玻璃卡片浮在上面 -->
    <div class="relative rounded-2xl overflow-hidden p-8 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400">
      <!-- 背景装饰圆点，让模糊效果更明显 -->
      <div class="absolute -top-4 -left-4 w-24 h-24 bg-yellow-300 rounded-full opacity-70"></div>
      <div class="absolute bottom-0 right-4 w-32 h-32 bg-cyan-300 rounded-full opacity-70"></div>

      <!-- 玻璃卡片1：bg-white/30 backdrop-blur-lg border-white/40 -->
      <div class="relative bg-white/30 backdrop-blur-lg border border-white/40 rounded-xl p-5 shadow-lg">
        <h3 class="text-white font-bold text-lg drop-shadow">玻璃态卡片</h3>
        <p class="text-white/90 text-sm mt-1">bg-white/30 + backdrop-blur-lg + border-white/40，透过卡片能看到背景模糊的彩色圆点。</p>
      </div>

      <!-- 玻璃卡片2：暗色玻璃 bg-black/30 -->
      <div class="relative mt-4 bg-black/30 backdrop-blur-md border border-white/20 rounded-xl p-5">
        <h3 class="text-white font-bold text-lg">暗色玻璃</h3>
        <p class="text-white/80 text-sm mt-1">bg-black/30 + backdrop-blur-md，适合浅色背景上的玻璃效果。</p>
      </div>
    </div>
  </section>

  <!-- ============ 区块 5：transition 过渡动画 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑤ transition 过渡动画（悬停看效果）</h2>
    <p class="text-sm text-gray-500 mb-4">transition 让属性变化平滑。悬停下方元素感受不同 duration 和 ease。</p>

    <div class="grid grid-cols-3 gap-4">
      <!-- 颜色过渡：transition-colors duration-300 -->
      <div class="bg-gray-50 p-4 rounded-lg text-center">
        <p class="text-xs text-gray-500 mb-2">transition-colors</p>
        <button class="bg-blue-500 hover:bg-pink-500 text-white px-4 py-2 rounded transition-colors duration-300 text-sm">变色 300ms</button>
      </div>
      <!-- 阴影+位移过渡：transition-all hover:-translate-y-1 hover:shadow-lg -->
      <div class="bg-gray-50 p-4 rounded-lg text-center">
        <p class="text-xs text-gray-500 mb-2">浮起卡片</p>
        <div class="bg-white rounded-lg shadow p-3 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-sm text-gray-700">
          悬停浮起
        </div>
      </div>
      <!-- 缩放过渡：transition-transform hover:scale-110 -->
      <div class="bg-gray-50 p-4 rounded-lg text-center">
        <p class="text-xs text-gray-500 mb-2">scale 缩放</p>
        <button class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded transition-transform duration-200 hover:scale-110 text-sm">放大 110%</button>
      </div>
      <!-- 延迟过渡：delay-300 -->
      <div class="bg-gray-50 p-4 rounded-lg text-center">
        <p class="text-xs text-gray-500 mb-2">delay-500 延迟</p>
        <button class="bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors duration-300 delay-500 text-sm">悬停 500ms 后变色</button>
      </div>
      <!-- 透明度过渡：opacity-0 hover:opacity-100 -->
      <div class="bg-gray-50 p-4 rounded-lg text-center">
        <p class="text-xs text-gray-500 mb-2">opacity 显隐</p>
        <div class="relative inline-block">
          <button class="bg-gray-700 text-white px-4 py-2 rounded text-sm">悬停我</button>
          <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300" style="opacity:1">3</span>
        </div>
      </div>
      <!-- ease 对比 -->
      <div class="bg-gray-50 p-4 rounded-lg text-center">
        <p class="text-xs text-gray-500 mb-2">ease-in-out vs linear</p>
        <div class="flex gap-2 justify-center">
          <div class="w-6 h-6 bg-rose-500 rounded transition-transform duration-700 ease-in-out hover:translate-x-8"></div>
          <div class="w-6 h-6 bg-rose-500 rounded transition-transform duration-700 ease-linear hover:translate-x-8"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ 区块 6：animate 动画 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑥ animate 预设动画</h2>
    <p class="text-sm text-gray-500 mb-4">spin 旋转加载、ping 雷达点、pulse 骨架屏、bounce 弹跳。motion-reduce 尊重用户设置。</p>

    <div class="grid grid-cols-2 gap-6">
      <!-- animate-spin：加载 spinner -->
      <div class="bg-gray-50 p-6 rounded-lg flex flex-col items-center gap-3">
        <p class="text-xs font-semibold text-gray-500">animate-spin（加载）</p>
        <!-- SVG spinner：animate-spin，border 圆形，border-t 上色 -->
        <div class="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        <p class="text-xs text-gray-500">数据加载中...</p>
      </div>

      <!-- animate-ping：在线指示点 -->
      <div class="bg-gray-50 p-6 rounded-lg flex flex-col items-center gap-3">
        <p class="text-xs font-semibold text-gray-500">animate-ping（在线指示）</p>
        <!-- 双层 ping：底层固定 + 上层 animate-ping 扩散 -->
        <span class="relative flex h-4 w-4">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
        </span>
        <p class="text-xs text-gray-500">用户在线</p>
      </div>

      <!-- animate-pulse：骨架屏 -->
      <div class="bg-gray-50 p-6 rounded-lg">
        <p class="text-xs font-semibold text-gray-500 mb-3">animate-pulse（骨架屏）</p>
        <!-- 骨架屏：灰色块 + animate-pulse 脉动 -->
        <div class="animate-pulse space-y-2">
          <div class="h-3 bg-gray-300 rounded w-3/4"></div>
          <div class="h-3 bg-gray-300 rounded w-1/2"></div>
          <div class="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
      </div>

      <!-- animate-bounce：弹跳 -->
      <div class="bg-gray-50 p-6 rounded-lg flex flex-col items-center gap-3">
        <p class="text-xs font-semibold text-gray-500">animate-bounce（弹跳）</p>
        <!-- 向下箭头弹跳：提示下拉更多 -->
        <div class="text-3xl animate-bounce">⌄</div>
        <p class="text-xs text-gray-500">下拉加载更多</p>
      </div>
    </div>
  </section>

  <!-- ============ 区块 7：transform 变换 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑦ transform 变换（平移/缩放/旋转/倾斜）</h2>
    <p class="text-sm text-gray-500 mb-4">transform 不触发重排，是动画首选。悬停看交互效果。</p>

    <div class="grid grid-cols-4 gap-4">
      <!-- 平移：translate-x-4 -->
      <div class="bg-gray-50 p-4 rounded-lg text-center">
        <p class="text-xs text-gray-500 mb-2">translate-x-4</p>
        <div class="w-10 h-10 mx-auto bg-indigo-500 rounded translate-x-4"></div>
      </div>
      <!-- 缩放：scale-150 -->
      <div class="bg-gray-50 p-4 rounded-lg text-center">
        <p class="text-xs text-gray-500 mb-2">scale-150</p>
        <div class="w-10 h-10 mx-auto bg-indigo-500 rounded scale-150"></div>
      </div>
      <!-- 旋转：rotate-45 -->
      <div class="bg-gray-50 p-4 rounded-lg text-center">
        <p class="text-xs text-gray-500 mb-2">rotate-45</p>
        <div class="w-10 h-10 mx-auto bg-indigo-500 rounded rotate-45"></div>
      </div>
      <!-- 倾斜：skew-x-12 -->
      <div class="bg-gray-50 p-4 rounded-lg text-center">
        <p class="text-xs text-gray-500 mb-2">skew-x-12</p>
        <div class="w-10 h-10 mx-auto bg-indigo-500 rounded skew-x-12"></div>
      </div>
    </div>

    <!-- transform 居中：absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -->
    <p class="text-xs font-semibold text-gray-500 mt-6 mb-2">transform 居中（绝对定位 + translate）：</p>
    <div class="relative h-32 bg-gray-100 rounded-lg border border-gray-200">
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-rose-500 text-white px-4 py-2 rounded-lg text-sm">
        居中（left-1/2 + -translate-x-1/2）
      </div>
    </div>

    <!-- hover transform 交互：旋转 + 加号变叉 -->
    <p class="text-xs font-semibold text-gray-500 mt-6 mb-2">hover:rotate-45（加号转 45° 变叉）：</p>
    <div class="flex gap-4">
      <button class="w-12 h-12 bg-gray-700 text-white text-2xl rounded-full flex items-center justify-center transition-transform duration-300 hover:rotate-90">+</button>
      <button class="w-12 h-12 bg-blue-600 text-white text-2xl rounded-full flex items-center justify-center transition-transform duration-300 hover:rotate-180">↻</button>
      <button class="w-12 h-12 bg-emerald-600 text-white text-2xl rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-125">★</button>
      <button class="w-12 h-12 bg-purple-600 text-white text-2xl rounded-full flex items-center justify-center transition-transform duration-300 hover:-translate-y-2">↑</button>
    </div>
  </section>

  <!-- ============ 区块 8：drop-shadow 滤镜阴影 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑧ drop-shadow 滤镜阴影 &amp; 滤镜</h2>
    <p class="text-sm text-gray-500 mb-4">drop-shadow 按形状投影（图标/文字用）；grayscale/brightness 等滤镜做效果。</p>

    <div class="grid grid-cols-2 gap-6">
      <!-- drop-shadow vs shadow 对比：文字和 emoji -->
      <div class="bg-gray-50 p-6 rounded-lg">
        <p class="text-xs font-semibold text-gray-500 mb-3">drop-shadow（按形状）vs shadow（按盒子）：</p>
        <!-- drop-shadow-lg：emoji 按形状投影 -->
        <p class="text-5xl mb-2 drop-shadow-lg">✨🌟</p>
        <p class="text-xs text-gray-500">↑ drop-shadow-lg（光晕按 emoji 形状）</p>
        <!-- shadow + 文字：盒子方块阴影 -->
        <p class="text-5xl mb-2 mt-3 shadow-lg inline-block">✨🌟</p>
        <p class="text-xs text-gray-500">↑ shadow-lg（盒子方块阴影）</p>
      </div>

      <!-- 滤镜：grayscale / brightness / contrast -->
      <div class="bg-gray-50 p-6 rounded-lg">
        <p class="text-xs font-semibold text-gray-500 mb-3">滤镜（grayscale / brightness / contrast）：</p>
        <div class="flex gap-3">
          <!-- 原图：用渐变模拟图片 -->
          <div class="w-14 h-14 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500"></div>
          <!-- grayscale：灰度 -->
          <div class="w-14 h-14 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 grayscale"></div>
          <!-- brightness-125：变亮 -->
          <div class="w-14 h-14 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 brightness-125"></div>
          <!-- contrast-200：高对比 -->
          <div class="w-14 h-14 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 contrast-200"></div>
          <!-- sepia：棕褐复古 -->
          <div class="w-14 h-14 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 sepia"></div>
        </div>
        <p class="text-xs text-gray-500 mt-2">依次：原图 / 灰度 / 变亮 / 高对比 / 复古</p>
        <!-- hover 变彩：grayscale hover:grayscale-0 -->
        <div class="mt-3">
          <div class="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 grayscale hover:grayscale-0 transition cursor-pointer"></div>
          <p class="text-xs text-gray-500 mt-1">↑ hover 变彩</p>
        </div>
      </div>
    </div>
  </section>
</div>`,
  },

  // =========================================================
  // 第三章：背景与渐变
  // =========================================================
  {
    id: "tw-backgrounds",
    title: "背景与渐变",
    icon: "🖼️",
    group: "组件样式",
    content: `## 背景与渐变：界面的"色彩画布"

背景是界面的"画布"——它奠定了整个页面的视觉基调。纯色背景是最基础的，但当你想做品牌感的渐变按钮、卡片封面图、文字渐变标题、毛玻璃效果时，就需要掌握背景图片、背景大小、背景位置、背景裁切、渐变等一系列工具类。

Tailwind 把 CSS 里所有和"背景"相关的属性都拆成了细粒度的工具类：背景色、背景图、背景大小、背景位置、背景重复、背景附着、背景裁切、渐变方向、渐变色站。本章将**逐一、深入**讲解这些类，包括它们的底层 CSS 原理、常见组合、以及大量实战陷阱。

> 💡 **核心心法**：背景设计有"克制"和"丰盛"两条路线。**克制路线**用纯色 + 浅色卡片（Notion、Linear 风格），靠布局和排版取胜；**丰盛路线**用渐变 + 图片 + 玻璃态（Stripe、Apple 风格），靠视觉冲击取胜。两者没有优劣，但要**统一**——一个界面要么克制到底，要么丰盛得有章法，最忌讳"这里纯色那里渐变"的混搭。

## 背景色：bg-{color}-{shade}

背景色用 \`bg-\` + 颜色名 + 数字，和文字色、边框色共用同一套调色板：

| 类名 | 颜色 | 用途 |
| --- | --- | --- |
| \`bg-white\` / \`bg-black\` | 白/黑 | 最基础 |
| \`bg-gray-50\` ~ \`bg-gray-950\` | 灰阶 | 页面底色、卡片底、悬停态 |
| \`bg-blue-500\` / \`bg-emerald-500\` 等 | 主题色 | 按钮、强调元素 |
| \`bg-red-50\` / \`bg-green-50\` | 极浅色 | 提示框底色（错误/成功） |
| \`bg-transparent\` | 透明 | 移除背景 |
| \`bg-current\` | currentColor | 继承文字色 |

\`\`\`html
<!-- 按钮主色：bg-blue-500 -->
<button class="bg-blue-500 hover:bg-blue-600 text-white">按钮</button>
<!-- 提示框：浅红底 + 深红字 -->
<div class="bg-red-50 text-red-800 border border-red-200 p-4">错误提示</div>
\`\`\`

### 背景色 + 透明度（重点）

v3.x 起，所有颜色支持透明度修饰符 \`bg-{color}/{opacity}\`：

| 写法 | 含义 |
| --- | --- |
| \`bg-blue-500\` | 100% 不透明 |
| \`bg-blue-500/75\` | 75% 不透明 |
| \`bg-blue-500/50\` | 50% 半透明 |
| \`bg-black/50\` | 黑色 50%（遮罩层标配） |
| \`bg-white/10\` | 白色 10%（玻璃态） |

\`\`\`html
<!-- 遮罩层：bg-black/50 -->
<div class="fixed inset-0 bg-black/50">半透明遮罩</div>
<!-- 玻璃态：bg-white/10 -->
<div class="bg-white/10 backdrop-blur-lg">玻璃卡片</div>
\`\`\`

> 💡 **透明度 vs opacity**：\`bg-black/50\` 只让**背景**半透明，文字和子元素仍清晰；\`opacity-50\` 让**整个元素**（含子元素）半透明。做遮罩层、玻璃态时一定用 \`bg-{color}/N\`，不要用 \`opacity\`。

## 背景图片：bg-[url('...')]

背景图用任意值 \`bg-[url('...')]\`（注意引号嵌套）：

\`\`\`html
<div class="bg-[url('https://example.com/bg.jpg')]">背景图</div>
\`\`\`

> ⚠️ **模板字符串转义**：在 Tailwind 配置文件里写 \`url('...')\` 时，单引号没问题；但在 \`content\` 模板字符串里要注意，方括号语法 \`bg-[url('...')]\` 在 CDN 模式下完全支持。

### 背景大小：bg-cover / bg-contain / bg-auto

| 类名 | background-size | 行为 |
| --- | --- | --- |
| \`bg-auto\` | auto | 原始尺寸（默认） |
| \`bg-cover\` | cover | **填满容器**，可能裁切（最常用） |
| \`bg-contain\` | contain | 完整显示，可能留白 |

\`\`\`html
<!-- 封面图：bg-cover bg-center -->
<div class="h-64 bg-[url('...')] bg-cover bg-center"></div>
\`\`\`

> 💡 **bg-cover vs object-cover**：\`bg-cover\` 用于**背景图**（\`background-image\`），\`object-cover\` 用于 **\`<img>\` 标签**（\`object-fit\`）。两者效果类似但属性不同。背景图不能被屏幕阅读器识别（纯装饰用），\`<img>\` 有语义（内容图）。

### 背景位置：bg-center / bg-top / bg-left / bg-right / bg-bottom

| 类名 | background-position |
| --- | --- |
| \`bg-center\` | center center（最常用） |
| \`bg-top\` / \`bg-bottom\` | 顶部/底部 |
| \`bg-left\` / \`bg-right\` | 左/右 |
| \`bg-left-top\` / \`bg-right-bottom\` 等 | 角落 |
| \`bg-[center_top]\` | 任意值 |

\`bg-cover\` 配 \`bg-center\` 是封面图标配——填满容器且居中聚焦。

### 背景重复：bg-no-repeat / bg-repeat / bg-repeat-x / bg-repeat-y

| 类名 | 含义 |
| --- | --- |
| \`bg-repeat\`（默认） | 平铺重复 |
| \`bg-no-repeat\` | 不重复（最常用） |
| \`bg-repeat-x\` | 水平重复 |
| \`bg-repeat-y\` | 垂直重复 |
| \`bg-repeat-round\` / \`bg-repeat-space\` | 整数平铺/均匀间隔 |

\`\`\`html
<!-- 背景图标配：bg-cover bg-center bg-no-repeat -->
<div class="bg-[url('...')] bg-cover bg-center bg-no-repeat"></div>
\`\`\`

### 背景附着：bg-fixed / bg-local / bg-scroll

| 类名 | 含义 | 用途 |
| --- | --- | --- |
| \`bg-fixed\` | 背景固定（不随页面滚动） | 视差效果 |
| \`bg-local\` | 背景随元素内容滚动 | 可滚动容器内 |
| \`bg-scroll\`（默认） | 背景随页面滚动 | 默认 |

> ⚠️ **bg-fixed 移动端陷阱**：\`bg-fixed\` 在 iOS Safari 旧版有 bug（背景抖动或失效）。需要视差效果时移动端建议用 JS 实现，或降级为 \`bg-scroll\`。

## 背景裁切：bg-clip

\`background-clip\` 控制背景**绘制范围**：

| 类名 | background-clip | 含义 |
| --- | --- | --- |
| \`bg-clip-border\`（默认） | border-box | 背景延伸到边框外缘 |
| \`bg-clip-padding\` | padding-box | 背景延伸到 padding 外缘（不含边框） |
| \`bg-clip-content\` | content-box | 背景仅内容区 |
| \`bg-clip-text\` | text | **背景裁切到文字**（文字渐变神器） |

### bg-clip-text：文字渐变

\`bg-clip-text\` 是做"渐变文字"的核心——把背景（渐变）裁切到文字形状，配合 \`text-transparent\` 让文字本身透明，露出渐变背景：

\`\`\`html
<h1 class="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
  渐变文字标题
</h1>
\`\`\`

**配方**：\`bg-gradient-to-r\` + \`from-{color}\` + \`to-{color}\` + \`bg-clip-text\` + \`text-transparent\`。**五件套缺一不可**——少了 \`text-transparent\` 文字会盖住渐变，少了 \`bg-clip-text\` 渐变会铺满整个盒子。

> ⚠️ **必踩坑**：很多人写文字渐变忘了 \`text-transparent\`，结果文字是默认黑色，渐变看不见（被文字盖住）。记住：\`bg-clip-text\` + \`text-transparent\` 是一对，必须一起用。

## 渐变：bg-gradient-to-{direction}

渐变是 Tailwind 背景“最强大”的部分。语法是 \`bg-gradient-to-{direction}\` + \`from-{color}\` + \`via-{color}\`(可选) + \`to-{color}\`。

### 渐变方向

| 类名 | 方向 | 视觉 |
| --- | --- | --- |
| \`bg-gradient-to-r\` | 向右 → | 左到右 |
| \`bg-gradient-to-l\` | 向左 ← | 右到左 |
| \`bg-gradient-to-t\` | 向上 ↑ | 下到上 |
| \`bg-gradient-to-b\` | 向下 ↓ | 上到下（最常用） |
| \`bg-gradient-to-tr\` | 向右上 ↗ | 左下到右上 |
| \`bg-gradient-to-tl\` | 向左上 ↖ | 右下到左上 |
| \`bg-gradient-to-br\` | 向右下 ↘ | 左上到右下（最常用斜向） |
| \`bg-gradient-to-bl\` | 向左下 ↙ | 右上到左下 |

### 色站：from / via / to

| 类名 | 含义 |
| --- | --- |
| \`from-{color}\` | 起始色（0%） |
| \`via-{color}\` | 中间色（50%，可选） |
| \`to-{color}\` | 结束色（100%） |

\`\`\`html
<!-- 两色渐变：from-pink-500 to-orange-500 -->
<div class="bg-gradient-to-r from-pink-500 to-orange-500"></div>
<!-- 三色渐变：from-cyan-400 via-blue-500 to-purple-600 -->
<div class="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"></div>
\`\`\`

### 色站位置（v3.x）

可以用 \`from-{position}\` / \`via-{position}\` / \`to-{position}\` 控制色站位置：

| 类名 | 含义 |
| --- | --- |
| \`from-0%\` / \`from-50%\` / \`from-100%\` | 起始位置 |
| \`via-50%\` | 中间位置 |
| \`to-50%\` / \`to-100%\` | 结束位置 |

\`\`\`html
<!-- 色站位置：from-0% via-50% to-100% -->
<div class="bg-gradient-to-r from-pink-500 from-0% via-purple-500 via-50% to-blue-500 to-100%"></div>
\`\`\`

### 渐变角度：bg-gradient-to-[Ndeg]

v3.x 起支持任意角度（不再局限于 8 个方向）：

\`\`\`html
<!-- 45° 渐变 -->
<div class="bg-gradient-to-[45deg] from-pink-500 to-purple-500"></div>
<!-- 135° 渐变 -->
<div class="bg-gradient-to-[135deg] from-cyan-400 to-blue-600"></div>
\`\`\`

> 💡 **角度记忆**：\`to-r\` = \`to 90deg\`，\`to-b\` = \`to 180deg\`，\`to-l\` = \`to 270deg\`，\`to-t\` = \`to 0deg\`。斜向：\`to-tr\` = \`45deg\`，\`to-br\` = \`135deg\`，\`to-bl\` = \`225deg\`，\`to-tl\` = \`315deg\`。

## 多重背景

CSS 支持多层背景（用逗号分隔），Tailwind 用任意值实现：

\`\`\`html
<div class="bg-[url('overlay.png'),url('bg.jpg')] bg-cover bg-center"></div>
\`\`\`

或叠加渐变和图片：

\`\`\`html
<!-- 渐变叠加图片：图片底 + 渐变蒙层 -->
<div class="bg-[linear-gradient(to_right,rgba(0,0,0,0.5),transparent),url('bg.jpg')] bg-cover">
  渐变蒙层 + 背景图
</div>
\`\`\`

> 💡 **多重背景顺序**：CSS 多重背景**第一层在最上**。所以 \`linear-gradient(...), url(...)\` 是渐变在上、图片在下。顺序错了渐变会盖住图片。

## 任意值背景

| 写法 | 含义 |
| --- | --- |
| \`bg-[#1da1f2]\` | 任意颜色 |
| \`bg-[url('...')]\` | 任意图片 |
| \`bg-[linear-gradient(...)]\` | 任意渐变 |
| \`bg-[length:200px_300px]\` | 任意大小 |
| \`bg-[position:center_top]\` | 任意位置 |

## 实战组合模式

### 1. 渐变按钮

\`\`\`html
<button class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
  渐变按钮
</button>
\`\`\`

\`bg-gradient-to-r\` + \`from-{color}\` + \`to-{color}\` + \`hover:from/to\` 加深 = 渐变按钮标配。

### 2. 渐变文字标题

\`\`\`html
<h1 class="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent text-6xl font-black">
  彩虹标题
</h1>
\`\`\`

### 3. 卡片封面图

\`\`\`html
<div class="h-48 bg-[url('cover.jpg')] bg-cover bg-center"></div>
\`\`\`

### 4. 渐变蒙层图片

\`\`\`html
<div class="relative">
  <img src="..." class="w-full" />
  <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
  <h3 class="absolute bottom-0 text-white">图片底部渐变蒙层文字</h3>
</div>
\`\`\`

\`bg-gradient-to-t from-black/70 to-transparent\` 是“图片底部加深显文字”标配。

### 5. 三色彩虹渐变

\`\`\`html
<div class="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
\`\`\`

### 6. 玻璃态（见阴影章）

\`bg-white/30 backdrop-blur-lg border-white/40\`。

## 常见陷阱总结

1. **文字渐变五件套缺一不可**：\`bg-gradient-to-r\` + \`from\` + \`to\` + \`bg-clip-text\` + \`text-transparent\`。
2. **\`bg-{color}/N\` 优于 \`opacity\`**：做半透明背景一定用颜色透明度，不要用 opacity（会影响子元素）。
3. **\`bg-cover\` 配 \`bg-center\`**：封面图标配，缺 \`bg-center\` 可能裁切到关键内容。
4. **\`bg-fixed\` 移动端 bug**：iOS Safari 旧版失效，需降级。
5. **多重背景顺序**：第一层在最上，写反了渐变盖住图。
6. **背景图无语义**：纯装饰用背景图，内容图用 \`<img>\`（可访问性）。
7. **渐变方向用 \`to-\`**：是 \`to-r\`（向右），不是 \`r\`。新手常漏 \`to-\`。
8. **角度方向**：\`to-r\` = 90deg，\`to-t\` = 0deg（向上）。
9. **via 中间色**：两色渐变不够丰富时加 \`via-{color}\` 做三色，但别加太多色站（彩虹既视感）。

## 动手试试

下面的演示覆盖了纯色背景、背景图配 cover/center、文字渐变（bg-clip-text）、多种方向渐变、三色渐变、角度渐变、渐变蒙层。修改任意 class 后点“运行”查看效果，试着改 \`from\`/\`via\`/\`to\` 颜色和方向感受变化。`,
    code: `<!-- ============================================================ -->
<!-- 第三章演示：背景与渐变全览                                       -->
<!-- 包含：纯色背景 / 背景图 cover-center / 文字渐变 bg-clip-text /  -->
<!--       多方向渐变 / 三色渐变 / 角度渐变 / 渐变蒙层 / 玻璃态       -->
<!-- ============================================================ -->

<!-- 外层容器：max-w-4xl 最大宽 56rem，mx-auto 居中，p-6 内边距，space-y-10 子元素间距 -->
<div class="max-w-4xl mx-auto p-6 space-y-10">

  <!-- ============ 区块 1：纯色背景 + 透明度 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">① 纯色背景 &amp; 透明度</h2>
    <p class="text-sm text-gray-500 mb-4">bg-{color}-{shade}；透明度用 bg-{color}/N（只影响背景，不影响子元素）。</p>

    <div class="space-y-3">
      <!-- 灰阶背景：bg-gray-50/100/200 -->
      <div class="flex gap-2">
        <div class="bg-gray-50 border border-gray-200 flex-1 p-3 rounded text-xs text-gray-700 text-center">bg-gray-50</div>
        <div class="bg-gray-100 border border-gray-200 flex-1 p-3 rounded text-xs text-gray-700 text-center">bg-gray-100</div>
        <div class="bg-gray-200 flex-1 p-3 rounded text-xs text-gray-700 text-center">bg-gray-200</div>
        <div class="bg-gray-800 flex-1 p-3 rounded text-xs text-white text-center">bg-gray-800</div>
      </div>
      <!-- 主题色背景 -->
      <div class="flex gap-2">
        <div class="bg-blue-500 flex-1 p-3 rounded text-xs text-white text-center">bg-blue-500</div>
        <div class="bg-emerald-500 flex-1 p-3 rounded text-xs text-white text-center">bg-emerald-500</div>
        <div class="bg-rose-500 flex-1 p-3 rounded text-xs text-white text-center">bg-rose-500</div>
        <div class="bg-amber-500 flex-1 p-3 rounded text-xs text-white text-center">bg-amber-500</div>
        <div class="bg-purple-500 flex-1 p-3 rounded text-xs text-white text-center">bg-purple-500</div>
      </div>
      <!-- 透明度对比：bg-blue-500/100 ~ /25 -->
      <div class="flex gap-2">
        <div class="bg-blue-500/100 flex-1 p-3 rounded text-xs text-white text-center">/100</div>
        <div class="bg-blue-500/75 flex-1 p-3 rounded text-xs text-white text-center">/75</div>
        <div class="bg-blue-500/50 flex-1 p-3 rounded text-xs text-white text-center">/50</div>
        <div class="bg-blue-500/25 flex-1 p-3 rounded text-xs text-blue-900 text-center">/25</div>
        <div class="bg-blue-500/10 flex-1 p-3 rounded text-xs text-blue-900 text-center">/10</div>
      </div>
      <!-- 提示框：浅底 + 深字 -->
      <div class="grid grid-cols-3 gap-2">
        <div class="bg-red-50 border border-red-200 text-red-800 p-3 rounded text-xs">错误提示（bg-red-50）</div>
        <div class="bg-green-50 border border-green-200 text-green-800 p-3 rounded text-xs">成功提示（bg-green-50）</div>
        <div class="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded text-xs">警告提示（bg-amber-50）</div>
      </div>
    </div>
  </section>

  <!-- ============ 区块 2：背景图 cover/center（用渐变模拟图片） ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">② 背景图大小 &amp; 位置</h2>
    <p class="text-sm text-gray-500 mb-4">bg-cover 填满裁切，bg-contain 完整留白，配 bg-center 居中聚焦。此处用渐变模拟图片。</p>

    <div class="grid grid-cols-3 gap-4">
      <!-- bg-cover bg-center：填满裁切，最常用 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-1">bg-cover bg-center</p>
        <div class="h-28 bg-gradient-to-br from-pink-400 via-orange-400 to-yellow-400 bg-cover bg-center rounded-lg flex items-end p-2">
          <span class="text-white text-xs font-semibold drop-shadow">填满裁切</span>
        </div>
      </div>
      <!-- bg-contain：完整显示留白 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-1">bg-contain bg-center</p>
        <div class="h-28 bg-gradient-to-br from-cyan-400 to-blue-500 bg-contain bg-center bg-no-repeat bg-clip-border rounded-lg border border-gray-200 relative">
          <div class="absolute inset-0 flex items-end p-2">
            <span class="text-white text-xs font-semibold drop-shadow">完整留白</span>
          </div>
        </div>
      </div>
      <!-- bg-auto：原始尺寸 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-1">bg-auto（原始）</p>
        <div class="h-28 bg-purple-500 bg-auto rounded-lg flex items-end p-2">
          <span class="text-white text-xs font-semibold">原始尺寸</span>
        </div>
      </div>
    </div>

    <!-- 背景重复演示：bg-repeat vs bg-no-repeat -->
    <p class="text-xs font-semibold text-gray-500 mt-4 mb-2">背景重复（用 radial-gradient 模拟图案）：</p>
    <div class="grid grid-cols-2 gap-4">
      <!-- bg-repeat：平铺重复 -->
      <div>
        <p class="text-xs text-gray-500 mb-1">bg-repeat（平铺）</p>
        <div class="h-20 rounded-lg border border-gray-200" style="background-image: radial-gradient(circle, #6366f1 2px, transparent 2px); background-size: 16px 16px;"></div>
      </div>
      <!-- bg-no-repeat：单次显示 -->
      <div>
        <p class="text-xs text-gray-500 mb-1">bg-no-repeat + bg-center</p>
        <div class="h-20 rounded-lg border border-gray-200 bg-no-repeat bg-center" style="background-image: radial-gradient(circle, #6366f1 8px, transparent 8px); background-size: 32px 32px;"></div>
      </div>
    </div>
  </section>

  <!-- ============ 区块 3：文字渐变（bg-clip-text） ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">③ 文字渐变（bg-clip-text + text-transparent）</h2>
    <p class="text-sm text-gray-500 mb-4">五件套：bg-gradient-to-r + from + to + bg-clip-text + text-transparent，缺一不可。</p>

    <div class="space-y-4">
      <!-- 两色渐变文字：from-pink-500 to-orange-500 -->
      <h3 class="text-5xl font-black bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
        两色渐变标题
      </h3>
      <!-- 三色渐变文字：from-cyan-400 via-blue-500 to-purple-600 -->
      <h3 class="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
        三色彩虹标题
      </h3>
      <!-- 斜向渐变文字：bg-gradient-to-br -->
      <h3 class="text-4xl font-bold bg-gradient-to-br from-emerald-500 to-teal-600 bg-clip-text text-transparent">
        斜向渐变（to-br）
      </h3>
      <!-- 渐变文字 + 描述 -->
      <div class="bg-gray-900 p-6 rounded-xl">
        <p class="text-xs text-gray-400 mb-2">深色背景上的渐变文字：</p>
        <h3 class="text-4xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
          夜空彩虹
        </h3>
        <p class="text-sm text-gray-300 mt-2">渐变文字在深色背景上尤其醒目，常用于品牌名、营销大标题。</p>
      </div>
      <!-- 反面教材：少了 text-transparent -->
      <div class="border border-dashed border-red-300 bg-red-50 p-3 rounded">
        <p class="text-xs text-red-600 mb-1">反面教材（少了 text-transparent，文字盖住渐变）：</p>
        <h3 class="text-3xl font-black bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text">
          看不到渐变（文字默认黑色）
        </h3>
      </div>
    </div>
  </section>

  <!-- ============ 区块 4：渐变方向全览 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">④ 渐变方向全览（8 方向）</h2>
    <p class="text-sm text-gray-500 mb-4">to-r/l/t/b/tr/tl/br/bl。每块标注方向，颜色统一 from-pink-500 to-indigo-500。</p>

    <div class="grid grid-cols-4 gap-3">
      <!-- to-t：向上 -->
      <div class="h-20 rounded-lg bg-gradient-to-t from-pink-500 to-indigo-500 flex items-end justify-center p-2">
        <span class="text-white text-xs font-semibold">to-t ↑</span>
      </div>
      <!-- to-tr：右上 -->
      <div class="h-20 rounded-lg bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-end justify-center p-2">
        <span class="text-white text-xs font-semibold">to-tr ↗</span>
      </div>
      <!-- to-r：向右 -->
      <div class="h-20 rounded-lg bg-gradient-to-r from-pink-500 to-indigo-500 flex items-end justify-center p-2">
        <span class="text-white text-xs font-semibold">to-r →</span>
      </div>
      <!-- to-br：右下 -->
      <div class="h-20 rounded-lg bg-gradient-to-br from-pink-500 to-indigo-500 flex items-end justify-center p-2">
        <span class="text-white text-xs font-semibold">to-br ↘</span>
      </div>
      <!-- to-b：向下 -->
      <div class="h-20 rounded-lg bg-gradient-to-b from-pink-500 to-indigo-500 flex items-end justify-center p-2">
        <span class="text-white text-xs font-semibold">to-b ↓</span>
      </div>
      <!-- to-bl：左下 -->
      <div class="h-20 rounded-lg bg-gradient-to-bl from-pink-500 to-indigo-500 flex items-end justify-center p-2">
        <span class="text-white text-xs font-semibold">to-bl ↙</span>
      </div>
      <!-- to-l：向左 -->
      <div class="h-20 rounded-lg bg-gradient-to-l from-pink-500 to-indigo-500 flex items-end justify-center p-2">
        <span class="text-white text-xs font-semibold">to-l ←</span>
      </div>
      <!-- to-tl：左上 -->
      <div class="h-20 rounded-lg bg-gradient-to-tl from-pink-500 to-indigo-500 flex items-end justify-center p-2">
        <span class="text-white text-xs font-semibold">to-tl ↖</span>
      </div>
    </div>
  </section>

  <!-- ============ 区块 5：三色渐变 + 角度渐变 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑤ 三色渐变 &amp; 角度渐变</h2>
    <p class="text-sm text-gray-500 mb-4">via-{color} 加中间色做三色；bg-gradient-to-[Ndeg] 任意角度。</p>

    <div class="space-y-3">
      <!-- 三色彩虹：from-red-500 via-yellow-500 to-green-500 -->
      <div class="h-16 rounded-lg bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 flex items-center px-4">
        <span class="text-white font-bold drop-shadow">from-red-500 via-yellow-500 to-green-500</span>
      </div>
      <!-- 三色海洋：from-cyan-400 via-blue-500 to-purple-600 -->
      <div class="h-16 rounded-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 flex items-center px-4">
        <span class="text-white font-bold drop-shadow">from-cyan-400 via-blue-500 to-purple-600</span>
      </div>
      <!-- 三色日落：from-amber-400 via-pink-500 to-purple-600 -->
      <div class="h-16 rounded-lg bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 flex items-center px-4">
        <span class="text-white font-bold drop-shadow">from-amber-400 via-pink-500 to-purple-600</span>
      </div>

      <!-- 角度渐变：bg-gradient-to-[45deg] / [135deg] / [225deg] -->
      <div class="grid grid-cols-3 gap-3 mt-4">
        <div>
          <p class="text-xs text-gray-500 mb-1">to-[45deg]</p>
          <div class="h-16 rounded-lg bg-gradient-to-[45deg] from-pink-500 to-indigo-500"></div>
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">to-[135deg]</p>
          <div class="h-16 rounded-lg bg-gradient-to-[135deg] from-pink-500 to-indigo-500"></div>
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">to-[225deg]</p>
          <div class="h-16 rounded-lg bg-gradient-to-[225deg] from-pink-500 to-indigo-500"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ 区块 6：渐变按钮 + 渐变蒙层 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑥ 渐变按钮 &amp; 渐变蒙层</h2>
    <p class="text-sm text-gray-500 mb-4">渐变按钮配 hover 加深；图片底部 bg-gradient-to-t from-black/70 to-transparent 显文字。</p>

    <!-- 渐变按钮：hover 改 from/to 加深 -->
    <div class="flex flex-wrap gap-3 mb-6">
      <button class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-105 text-sm font-medium">
        蓝紫渐变按钮
      </button>
      <button class="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 text-sm font-medium">
        绿青渐变按钮
      </button>
      <button class="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-pink-500/30 transition-all hover:scale-105 text-sm font-medium">
        粉红渐变按钮
      </button>
    </div>

    <!-- 渐变蒙层图片：底部 bg-gradient-to-t from-black/70 to-transparent -->
    <div class="relative h-48 rounded-xl overflow-hidden">
      <!-- 模拟封面图：渐变 + 装饰圆 -->
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"></div>
      <div class="absolute -top-8 -right-8 w-32 h-32 bg-white/20 rounded-full"></div>
      <div class="absolute bottom-10 left-10 w-20 h-20 bg-yellow-300/40 rounded-full"></div>
      <!-- 底部蒙层：bg-gradient-to-t from-black/70 to-transparent -->
      <div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent"></div>
      <!-- 蒙层上的文字 -->
      <div class="absolute bottom-0 left-0 right-0 p-4">
        <h3 class="text-white font-bold text-lg">封面图标题</h3>
        <p class="text-white/80 text-sm">底部渐变蒙层让文字清晰可读</p>
      </div>
    </div>
  </section>

  <!-- ============ 区块 7：bg-clip 对比 + 多重背景 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑦ bg-clip 裁切 &amp; 多重背景</h2>
    <p class="text-sm text-gray-500 mb-4">bg-clip-border/padding/content/text 控制背景绘制范围；多重背景第一层在最上。</p>

    <div class="grid grid-cols-2 gap-4">
      <!-- bg-clip-border：背景延伸到边框外缘 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-1">bg-clip-border（默认，含边框）</p>
        <div class="bg-blue-500 border-8 border-dashed border-yellow-400 p-4 rounded text-white text-sm bg-clip-border">
          背景延伸到边框外缘
        </div>
      </div>
      <!-- bg-clip-padding：背景到 padding 外缘 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-1">bg-clip-padding（不含边框）</p>
        <div class="bg-blue-500 border-8 border-dashed border-yellow-400 p-4 rounded text-white text-sm bg-clip-padding">
          背景到 padding 外缘
        </div>
      </div>
      <!-- bg-clip-content：背景仅内容区 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-1">bg-clip-content（仅内容）</p>
        <div class="bg-blue-500 border-8 border-dashed border-yellow-400 p-4 rounded text-white text-sm bg-clip-content">
          背景仅内容区
        </div>
      </div>
      <!-- bg-clip-text：背景裁切到文字 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-1">bg-clip-text（裁切到文字）</p>
        <div class="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent p-4 rounded text-2xl font-black border border-gray-200">
          渐变文字
        </div>
      </div>
    </div>

    <!-- 多重背景：渐变蒙层 + 模拟图片纹理 -->
    <p class="text-xs font-semibold text-gray-500 mt-4 mb-2">多重背景（渐变 + 图案，第一层在最上）：</p>
    <div class="h-24 rounded-lg border border-gray-200" style="background-image: linear-gradient(to right, rgba(99,102,241,0.7), rgba(236,72,153,0.7)), radial-gradient(circle, #fff 2px, transparent 2px); background-size: 100% 100%, 16px 16px;">
      <div class="h-full flex items-center justify-center text-white font-semibold text-sm drop-shadow">
        紫粉渐变蒙层 + 白色圆点图案
      </div>
    </div>
  </section>

  <!-- ============ 区块 8：实战组合卡片 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑧ 实战：渐变营销卡片</h2>
    <p class="text-sm text-gray-500 mb-4">综合运用：渐变背景 + 渐变文字 + 玻璃态按钮 + 阴影。</p>

    <div class="grid grid-cols-2 gap-4">
      <!-- 卡片1：紫粉渐变 + 渐变文字 + 玻璃按钮 -->
      <div class="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-6 shadow-xl shadow-purple-500/30 relative overflow-hidden">
        <div class="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
        <span class="text-xs font-bold uppercase tracking-widest text-white/80">Pro Plan</span>
        <h3 class="text-3xl font-black text-white mt-2">¥99<span class="text-base font-normal text-white/70">/月</span></h3>
        <p class="text-white/90 text-sm mt-2 mb-4">解锁全部高级功能，享受专属客服。</p>
        <button class="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition text-sm font-medium">
          立即升级
        </button>
      </div>
      <!-- 卡片2：青蓝渐变 + 文字渐变 -->
      <div class="bg-gradient-to-br from-cyan-500 to-blue-700 rounded-2xl p-6 shadow-xl shadow-blue-500/30 relative overflow-hidden">
        <div class="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full"></div>
        <span class="text-xs font-bold uppercase tracking-widest text-white/80">Starter</span>
        <h3 class="text-3xl font-black bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent mt-2">免费</h3>
        <p class="text-white/90 text-sm mt-2 mb-4">基础功能永久免费，无需信用卡。</p>
        <button class="bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition text-sm font-medium">
          免费开始
        </button>
      </div>
    </div>
  </section>
</div>`,
  },

  // =========================================================
  // 第四章：表单组件
  // =========================================================
  {
    id: "tw-forms",
    title: "表单组件",
    icon: "📝",
    group: "组件样式",
    content: `## 表单组件：用户输入的"接口"

表单是 Web 应用和用户交互的"接口"——登录、注册、搜索、提交订单、填写资料……几乎所有需要用户输入的场景都离不开表单。一个设计良好的表单能让用户"无脑填写"，一个糟糕的表单则让用户抓狂（输入框看不清、按钮点不准、聚焦没反馈、错误提示找不到）。

Tailwind 处理表单有一个核心理念：**Preflight（基础重置）会先"扒光"表单元素的浏览器默认样式**，让所有元素回到"白纸"状态，然后用工具类重新精确控制。这意味着你**必须自己写样式**，否则表单元素会"裸奔"。本章将**逐一、深入**讲解各类表单元素的样式化，包括 input、textarea、select、checkbox、radio、range、file input，以及表单布局和状态管理。

> 💡 **核心心法**：表单设计的三原则是**清晰**（用户知道哪里能输入、输入什么）、**反馈**（聚焦、输入、错误都有视觉反馈）、**宽容**（输入框够大、点击区域够大、错误提示够友好）。Tailwind 让你能精确控制每一像素，但别滥用——表单是"工具"，不是"装饰"，**可读性和可用性永远高于美观**。

## Preflight：表单元素的"裸奔"重置

这是理解 Tailwind 表单的**第一原理**。Tailwind 的 Preflight 对表单元素做了这些重置：

| 元素 | 重置内容 |
| --- | --- |
| \`<input>\` / \`<textarea>\` / \`<select>\` | 移除默认边框、背景、内边距，字体继承 |
| \`<button>\` | 背景透明、边框 none、内边距 0、字体继承 |
| \`<textarea>\` | \`resize: vertical\`（仅垂直可调整） |
| \`<h1>\`~\`<h6>\` | 字号字重继承（按钮内标题不再巨大） |
| \`<ul>\`/\`<ol>\` | 移除 list-style 和 padding |
| \`<img>\` | \`display: block\`、\`max-width: 100%\` |

**关键后果**：如果不写任何 class，\`<input>\` 会是一个**没有边框、没有内边距、看不见的输入框**——你根本不知道哪里能输入！这就是为什么用 Tailwind 写表单**必须**手动加边框、内边距、圆角等样式。

\`\`\`html
<!-- ❌ 裸奔：什么都看不见 -->
<input type="text" />

<!-- ✅ 标配：边框 + 圆角 + 内边距 + 聚焦环 -->
<input type="text" class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
\`\`\`

> ⚠️ **必踩坑**：新手第一次用 Tailwind 写 \`<input>\` 会发现"输入框不见了"，以为是 bug。其实是 Preflight 把默认样式全移除了。**养成习惯：每个表单元素至少要有 border + px + py + rounded + focus 样式**。

## input 基础样式：登录框标配

一个标准的文本输入框需要这些 class：

\`\`\`html
<input type="text"
       class="w-full                  <!-- 宽度占满 -->
              border border-gray-300  <!-- 边框 -->
              rounded-md              <!-- 圆角 -->
              px-3 py-2               <!-- 内边距 -->
              text-sm                 <!-- 字号 -->
              text-gray-900           <!-- 文字色 -->
              placeholder-gray-400    <!-- 占位符色 -->
              focus:outline-none      <!-- 移除默认轮廓 -->
              focus:ring-2            <!-- 聚焦环宽 -->
              focus:ring-blue-500     <!-- 聚焦环色 -->
              focus:border-blue-500"  <!-- 聚焦边框色 -->
       placeholder="请输入..." />
\`\`\`

这套"七件套"是输入框标配，每个 class 都不可省：

1. \`w-full\`：宽度占满父容器（默认 input 只占内容宽）。
2. \`border border-gray-300\`：边框（否则看不见）。
3. \`rounded-md\`：圆角（与按钮统一）。
4. \`px-3 py-2\`：内边距（否则文字贴边）。
5. \`text-sm\`：字号（默认太大，sm 更紧凑）。
6. \`focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500\`：聚焦反馈（移除默认轮廓 + 蓝环 + 蓝边框）。

### 占位符颜色：placeholder-{color}

占位符（\`placeholder\`）默认颜色偏深，可用 \`placeholder-\` 前缀调整：

| 类名 | 含义 |
| --- | --- |
| \`placeholder-gray-400\` | 浅灰（默认推荐） |
| \`placeholder-gray-500\` | 中灰 |
| \`placeholder-blue-400\` | 主题色占位符 |

v3.x 起也支持 \`placeholder-{color}/{opacity}\` 透明度。

> 💡 **占位符 ≠ 标签**：占位符是"示例文字"，不是字段名。字段名应放在 \`<label>\` 里（可访问性）。占位符一旦输入就消失，不能依赖它传达关键信息。

## textarea：多行文本

\`<textarea>\` 的样式和 \`<input>\` 类似，但要额外控制**高度**和**调整行为**：

\`\`\`html
<textarea rows="4"
          class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                 resize-y"
          placeholder="请输入内容..."></textarea>
\`\`\`

### resize 控制调整方向

| 类名 | resize | 含义 |
| --- | --- | --- |
| \`resize-none\` | none | 禁止调整（固定高度） |
| \`resize-y\` | vertical | 仅垂直（默认，推荐） |
| \`resize-x\` | horizontal | 仅水平 |
| \`resize\` | both | 任意方向（不推荐，破坏布局） |

> 💡 **为什么默认 \`resize-y\`**：Preflight 给 \`<textarea>\` 设了 \`resize: vertical\`，避免用户横向拉宽撑破布局。如果你要完全禁止调整（如固定高度评论框），用 \`resize-none\`。

## select：下拉选择框

\`<select>\` 的样式化有个"千古难题"——浏览器默认会在右侧画一个下拉箭头，且**很难用纯 CSS 跨浏览器统一**。Tailwind 的处理方式：

\`\`\`html
<select class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
               bg-white appearance-none
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
  <option>选项一</option>
  <option>选项二</option>
</select>
\`\`\`

### appearance-none：移除原生外观

\`appearance-none\` 移除浏览器原生样式（包括默认箭头），让你完全自定义。移除后需要**自己加下拉箭头**，通常用背景图或 SVG：

\`\`\`html
<select class="... appearance-none bg-[url('data:image/svg+xml,...')] bg-no-repeat bg-[right_0.75rem_center] pr-10">
\`\`\`

> ⚠️ **陷阱**：\`appearance-none\` 后不加自定义箭头，select 看起来就像普通输入框，用户不知道能点开。务必补上箭头图标（背景 SVG 或绝对定位的 chevron）。

## 复选框 / 单选框：appearance-none 自定义

原生 \`<input type="checkbox">\` 和 \`<input type="radio">\` 的样式**跨浏览器极不一致**，且很难用 CSS 直接美化。Tailwind 推荐用 \`appearance-none\` + 自定义：

### 基础自定义复选框

\`\`\`html
<input type="checkbox"
       class="appearance-none w-5 h-5 border-2 border-gray-300 rounded
              checked:bg-blue-500 checked:border-blue-500
              focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
              transition-colors cursor-pointer" />
\`\`\`

关键点：
- \`appearance-none\`：移除原生方框。
- \`w-5 h-5\` + \`border-2\` + \`rounded\`：自定义方框形状。
- \`checked:bg-blue-500 checked:border-blue-500\`：选中时变蓝。
- **勾选符号**：纯 CSS 难画对勾，常用 \`peer\` + 兄弟元素叠加 SVG，或用 \`accent-color\`（见下）。

### 现代方案：accent-color

v3.x 起可用 \`accent-blue-500\` 直接改原生控件的强调色（无需 appearance-none）：

\`\`\`html
<input type="checkbox" class="accent-blue-500 w-5 h-5" />
<input type="radio" class="accent-blue-500 w-5 h-5" />
<input type="range" class="accent-blue-500" />
\`\`\`

\`accent-color\` 是最简单的方案——保留原生形状，只改颜色。**浏览器支持良好**（Chrome/Firefox/Safari 14.1+），优先用这个。需要完全自定义形状再用 \`appearance-none\`。

### peer：联动兄弟元素

\`peer\` 让"兄弟元素"能根据前一个元素的状态变化样式，是做"自定义复选框带勾"的利器：

\`\`\`html
<label class="flex items-center gap-2">
  <input type="checkbox" class="peer sr-only" />
  <span class="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 flex items-center justify-center">
    <svg class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100">✓</svg>
  </span>
  <span>同意条款</span>
</label>
\`\`\`

\`peer\` 写在 input 上，\`peer-checked:\` 写在后面的兄弟元素上。input 隐藏（\`sr-only\`），用后面的 \`<span>\` 显示自定义方框和勾。

## range：滑块

原生 \`<input type="range">\` 同样跨浏览器不一致，\`accent-color\` 是最简方案：

\`\`\`html
<input type="range" class="w-full accent-blue-500" min="0" max="100" />
\`\`\`

完全自定义需要 \`appearance-none\` + 跨浏览器伪元素（\`::-webkit-slider-thumb\` 等），较复杂，CDN 模式下用任意值实现。日常用 \`accent-color\` 足够。

## file input：file: 前缀（重点）

\`<input type="file">\` 的样式化有个**特殊前缀** \`file:\`——它专门针对"选择文件"按钮部分：

\`\`\`html
<input type="file"
       class="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100" />
\`\`\`

### file: 前缀的原理

\`<input type="file">\` 渲染成两部分：
1. **按钮**（"选择文件"）：对应伪元素 \`::file-selector-button\`。
2. **文件名文本**：剩余区域。

\`file:\` 前缀就是给 \`::file-selector-button\` 加样式。没有 \`file:\` 的话，普通 class 只影响外层和文件名文本，按钮保持浏览器默认（很丑）。

> ⚠️ **必踩坑**：很多人写 \`<input type="file" class="bg-blue-500 text-white">\` 发现按钮没变蓝。因为 \`bg-blue-500\` 作用在整个 input，而按钮是 \`::file-selector-button\` 伪元素，需要用 \`file:bg-blue-500\` 才生效。

### file: 常用组合

| 类名 | 含义 |
| --- | --- |
| \`file:mr-4\` | 按钮和文件名间距 |
| \`file:py-2 file:px-4\` | 按钮内边距 |
| \`file:rounded-md\` | 按钮圆角 |
| \`file:border-0\` | 移除按钮边框 |
| \`file:bg-blue-50\` | 按钮背景 |
| \`file:text-blue-700\` | 按钮文字色 |
| \`hover:file:bg-blue-100\` | 悬停加深 |
| \`file:font-semibold\` | 按钮字重 |

## 表单布局：label + input 配合

### 垂直布局（最常用）

\`\`\`html
<div class="space-y-1">
  <label class="block text-sm font-medium text-gray-700">邮箱</label>
  <input type="email" class="..." />
  <p class="text-xs text-gray-500">我们不会泄露你的邮箱。</p>
</div>
\`\`\`

\`label\` 用 \`block\` 独占一行 + \`text-sm font-medium\`，\`input\` 在下方，提示文字用 \`text-xs\`。

### 水平布局（grid）

\`\`\`html
<div class="grid grid-cols-3 gap-4 items-center">
  <label class="text-sm text-gray-700">姓名</label>
  <input type="text" class="col-span-2 ..." />
</div>
\`\`\`

### 内联布局（flex）

\`\`\`html
<label class="flex items-center gap-2">
  <input type="checkbox" />
  <span>记住我</span>
</label>
\`\`\`

### 表单整体网格

\`\`\`html
<form class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>姓</div>
  <div>名</div>
  <div class="md:col-span-2">邮箱</div>
</form>
\`\`\`

## 状态：focus / disabled / 必填 / 无效

### focus：聚焦态（已多次提及）

\`focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500\` 是聚焦四件套。

### disabled：禁用态

\`\`\`html
<input type="text" disabled
       class="... disabled:bg-gray-100 disabled:cursor-not-allowed" />
\`\`\`

\`disabled:\` 前缀给禁用元素加样式（灰底 + 禁止光标）。

### 必填 / 无效伪类

| 伪类 | 含义 | Tailwind 前缀 |
| --- | --- | --- |
| \`:required\` | 必填字段 | \`required:\` |
| \`:invalid\` | 校验失败 | \`invalid:\` |
| \`:valid\` | 校验通过 | \`valid:\` |

\`\`\`html
<input type="email" required
       class="... invalid:border-red-500 invalid:ring-red-500" />
\`\`\`

> 💡 **校验的坑**：\`:invalid\` 在用户**输入前**就触发（如果字段为空且 required），会让表单一开始就"红"。常用 \`peer\` + \`peer-invalid:\` 或 JS 控制，避免初始红。

## 实战组合模式

### 1. 标准登录表单

邮箱 + 密码 + 记住我 + 登录按钮，垂直布局，每个字段配 label 和提示。

### 2. 搜索框

圆角胶囊 + 左侧搜索图标 + placeholder。

### 3. 自定义复选框

\`appearance-none\` + \`peer\` + 兄弟 span 显示勾。

### 4. range 滑块

\`accent-color\` + 数值显示。

### 5. file input

\`file:\` 前缀美化按钮。

## 常见陷阱总结

1. **Preflight 让表单"裸奔"**：每个表单元素必须手动加 border/px/py/rounded/focus。
2. **\`file:\` 前缀美化文件按钮**：普通 class 改不了按钮，必须用 \`file:\`。
3. **\`appearance-none\` 后补箭头**：select 移除原生外观后要补自定义箭头。
4. **聚焦用 ring 不用 border**：border 会让布局跳动（见边框章）。
5. **占位符 ≠ 标签**：字段名放 \`<label>\`，占位符只是示例。
6. **\`accent-color\` 优先**：美化 checkbox/radio/range 用 \`accent-\` 最简。
7. **\`peer\` 联动兄弟**：自定义控件常用 \`peer\` + 兄弟元素显示状态。
8. **\`:invalid\` 初始触发**：必填空字段一开始就 invalid，用 \`peer\` 延迟显示。
9. **textarea 默认 resize-y**：避免横向拉宽撑破布局。
10. **可访问性**：每个 input 配 \`<label for>\`，\`sr-only\` 隐藏的要有 \`aria-label\`。

## 动手试试

下面的演示是一个完整的登录表单，外加搜索框、自定义复选框、range 滑块、file input。点击各输入框看聚焦环，尝试勾选复选框、拖动滑块、选择文件感受交互。`,
    code: `<!-- ============================================================ -->
<!-- 第四章演示：表单组件全览                                         -->
<!-- 包含：登录表单（邮箱/密码/记住我/按钮）/ 搜索框 /                -->
<!--       自定义复选框 / range 滑块 / file input / select            -->
<!-- ============================================================ -->

<!-- 外层容器：max-w-3xl 最大宽 48rem，mx-auto 居中，p-6 内边距，space-y-10 子元素间距 -->
<div class="max-w-3xl mx-auto p-6 space-y-10">

  <!-- ============ 区块 1：登录表单 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">① 登录表单（input / password / checkbox / button）</h2>
    <p class="text-sm text-gray-500 mb-4">每个 input 配 label + 提示；聚焦有蓝环；记住我用 accent-color 美化。</p>

    <!-- 登录卡片：bg-white 白底，shadow 阴影，rounded-xl 圆角，p-6 内边距 -->
    <form class="bg-white shadow rounded-xl border border-gray-100 p-6 space-y-4">
      <!-- 邮箱字段：space-y-1 标签和输入框间距 -->
      <div class="space-y-1">
        <label for="login-email" class="block text-sm font-medium text-gray-700">邮箱地址</label>
        <!-- 邮箱输入框：七件套标配 w-full/border/rounded-md/px-3/py-2/text-sm/focus ring -->
        <input id="login-email" type="email" required
               placeholder="you@example.com"
               class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
        <p class="text-xs text-gray-500">我们不会泄露你的邮箱。</p>
      </div>

      <!-- 密码字段 -->
      <div class="space-y-1">
        <div class="flex items-center justify-between">
          <label for="login-pwd" class="block text-sm font-medium text-gray-700">密码</label>
          <a href="#" class="text-xs text-blue-600 hover:text-blue-700">忘记密码？</a>
        </div>
        <input id="login-pwd" type="password" required
               placeholder="至少 8 位字符"
               class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
      </div>

      <!-- 记住我：flex items-center 水平排列，accent-blue-500 美化复选框 -->
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" class="w-4 h-4 accent-blue-500 cursor-pointer" />
        <span class="text-sm text-gray-700">记住我（7 天免登录）</span>
      </label>

      <!-- 登录按钮：w-full 占满，bg-blue-600 hover 加深，focus ring -->
      <button type="button"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-md
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition">
        登录
      </button>

      <!-- 分隔线 + 第三方登录提示 -->
      <div class="relative py-2">
        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200"></div></div>
        <div class="relative flex justify-center"><span class="bg-white px-2 text-xs text-gray-500">或</span></div>
      </div>
      <button type="button"
              class="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-md transition">
        使用 GitHub 登录
      </button>
    </form>
  </section>

  <!-- ============ 区块 2：搜索框 + select ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">② 搜索框 &amp; select 下拉</h2>
    <p class="text-sm text-gray-500 mb-4">搜索框用 relative + absolute 定位图标；select 用 appearance-none + 自定义箭头。</p>

    <div class="space-y-4">
      <!-- 搜索框：relative 容器 + absolute 左侧图标 + input pl-10 留图标空间 -->
      <div class="relative">
        <!-- 搜索图标：absolute left-3 top-1/2 居中，text-gray-400 灰色 -->
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <!-- 搜索输入框：rounded-full 胶囊，pl-10 留图标空间，bg-gray-100 浅灰底 -->
        <input type="text" placeholder="搜索文档、教程、示例..."
               class="w-full bg-gray-100 border border-transparent rounded-full pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition" />
      </div>

      <!-- select 下拉：appearance-none 移除原生箭头 + 自定义 chevron 图标 -->
      <div class="relative">
        <select class="w-full appearance-none border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm text-gray-900 bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
          <option>选择你的技术栈</option>
          <option>React</option>
          <option>Vue</option>
          <option>Svelte</option>
          <option>Angular</option>
        </select>
        <!-- 自定义下拉箭头：absolute right-3 top-1/2 居中，pointer-events-none 不阻挡点击 -->
        <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </section>

  <!-- ============ 区块 3：自定义复选框 / 单选框（peer 联动） ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">③ 自定义复选框 &amp; 单选框（peer 联动）</h2>
    <p class="text-sm text-gray-500 mb-4">对比 accent-color 简化版 和 peer+appearance-none 完全自定义版。</p>

    <div class="grid grid-cols-2 gap-6">
      <!-- accent-color 简化版：保留原生形状，只改颜色 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-2">accent-color 简化版</p>
        <div class="space-y-2 p-4 bg-gray-50 rounded-lg">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" class="w-5 h-5 accent-blue-500 cursor-pointer" checked />
            <span class="text-sm text-gray-700">accent-blue-500（勾选）</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" class="w-5 h-5 accent-emerald-500 cursor-pointer" />
            <span class="text-sm text-gray-700">accent-emerald-500</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="r1" class="w-5 h-5 accent-purple-500 cursor-pointer" checked />
            <span class="text-sm text-gray-700">选项 A（单选）</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="r1" class="w-5 h-5 accent-purple-500 cursor-pointer" />
            <span class="text-sm text-gray-700">选项 B（单选）</span>
          </label>
        </div>
      </div>

      <!-- peer + appearance-none 完全自定义：带勾的方框 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-2">peer + appearance-none 自定义</p>
        <div class="space-y-3 p-4 bg-gray-50 rounded-lg">
          <!-- 自定义复选框：input sr-only 隐藏 + peer-checked 兄弟显示勾 -->
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" class="peer sr-only" checked />
            <span class="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 flex items-center justify-center transition-colors">
              <!-- 勾选符号：opacity-0 默认隐藏，peer-checked:opacity-100 选中显示 -->
              <svg class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span class="text-sm text-gray-700">同意服务条款（自定义方框）</span>
          </label>
          <!-- 自定义单选：rounded-full 圆形 -->
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="r2" class="peer sr-only" checked />
            <span class="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-blue-500 flex items-center justify-center transition-colors">
              <span class="w-2.5 h-2.5 bg-blue-500 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></span>
            </span>
            <span class="text-sm text-gray-700">自定义圆形单选</span>
          </label>
          <!-- 多选标签组 -->
          <div class="flex flex-wrap gap-2 pt-2">
            <label class="cursor-pointer">
              <input type="checkbox" class="peer sr-only" />
              <span class="px-3 py-1 rounded-full text-xs border border-gray-300 peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500 transition-colors">JavaScript</span>
            </label>
            <label class="cursor-pointer">
              <input type="checkbox" class="peer sr-only" checked />
              <span class="px-3 py-1 rounded-full text-xs border border-gray-300 peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500 transition-colors">React</span>
            </label>
            <label class="cursor-pointer">
              <input type="checkbox" class="peer sr-only" />
              <span class="px-3 py-1 rounded-full text-xs border border-gray-300 peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500 transition-colors">Vue</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ 区块 4：range 滑块 + textarea + file input ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">④ range 滑块 / textarea / file input</h2>
    <p class="text-sm text-gray-500 mb-4">range 用 accent-color 美化；textarea 默认 resize-y；file input 用 file: 前缀美化按钮。</p>

    <div class="space-y-5">
      <!-- range 滑块：accent-blue-500 改强调色 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">音量（range + accent-color）</label>
        <input type="range" min="0" max="100" value="60"
               class="w-full accent-blue-500 cursor-pointer" />
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span><span>50</span><span>100</span>
        </div>
      </div>

      <!-- textarea：resize-y 仅垂直调整 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">留言（textarea）</label>
        <textarea rows="3" placeholder="请输入你的留言..."
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y transition"></textarea>
        <p class="text-xs text-gray-500 mt-1">右下角可垂直拖拽调整高度（resize-y）。</p>
      </div>

      <!-- file input：file: 前缀美化按钮 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">上传头像（file input）</label>
        <input type="file"
               class="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100 file:cursor-pointer file:transition-colors" />
        <p class="text-xs text-gray-500 mt-1">file: 前缀美化"选择文件"按钮，hover:file: 加深背景。</p>
      </div>

      <!-- 禁用态 + 错误态对比 -->
      <div class="grid grid-cols-2 gap-4">
        <!-- 禁用态：disabled:bg-gray-100 disabled:cursor-not-allowed -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">禁用态</label>
          <input type="text" disabled placeholder="不可编辑"
                 class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-400
                        disabled:cursor-not-allowed" />
        </div>
        <!-- 错误态：border-red-500 + 红色提示 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">错误态</label>
          <input type="email" value="invalid-email"
                 class="w-full border-2 border-red-500 rounded-md px-3 py-2 text-sm text-gray-900
                        focus:outline-none focus:ring-2 focus:ring-red-500" />
          <p class="text-xs text-red-600 mt-1">⚠ 邮箱格式不正确</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ 区块 5：表单网格布局 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑤ 表单网格布局（grid-cols-2）</h2>
    <p class="text-sm text-gray-500 mb-4">姓/名两列，邮箱占两列（col-span-2），常用 grid 做表单对齐。</p>

    <form class="bg-white shadow rounded-xl border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 姓：左列 -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">姓</label>
        <input type="text" placeholder="张"
               class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
      </div>
      <!-- 名：右列 -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">名</label>
        <input type="text" placeholder="三"
               class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
      </div>
      <!-- 邮箱：col-span-2 占两列 -->
      <div class="space-y-1 md:col-span-2">
        <label class="block text-sm font-medium text-gray-700">邮箱</label>
        <input type="email" placeholder="zhangsan@example.com"
               class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
      </div>
      <!-- 地址：col-span-2 占两列 -->
      <div class="space-y-1 md:col-span-2">
        <label class="block text-sm font-medium text-gray-700">联系地址</label>
        <input type="text" placeholder="北京市朝阳区..."
               class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
      </div>
      <!-- 提交按钮：col-span-2 -->
      <button type="button"
              class="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-md
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition">
        保存资料
      </button>
    </form>
  </section>
</div>`,
  },
];