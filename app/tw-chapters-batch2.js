// =============================================================
// Tailwind CSS 交互式教程 —— 第二批章节（共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. tw-typography   — 排版与文字
//   2. tw-flexbox      — Flexbox 弹性布局
//   3. tw-grid         — Grid 网格布局
//   4. tw-positioning  — 定位与层叠
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
  // 第一章：排版与文字
  // =========================================================
  {
    id: "tw-typography",
    title: "排版与文字",
    icon: "📝",
    group: "排版与布局",
    content: `## 排版为何如此重要

在所有 UI 元素里，**文字占比通常超过 80%**——标题、正文、按钮文案、表单标签、提示语、数据表格……几乎一切界面都由文字构成。一个界面"看起来是否专业、是否易读"，70% 取决于排版质量。好的排版让读者**感受不到排版的存在**，只感到"读起来很舒服"；坏的排版则会让眼睛疲惫、信息混乱，即便内容再好也无人愿意读完。

Tailwind 把 CSS 里所有和文字相关的属性都拆成了细粒度的工具类：字号、字重、字体族、行高、字间距、对齐、装饰线、大小写转换、缩进、截断、垂直对齐……掌握这套类，你就能精确控制界面里每一个字符的呈现。本章将**逐一、深入**讲解这些类，并给出大量对比示例和常见陷阱。

> 💡 **核心心法**：排版不是"选一个好看的字号"，而是一整套**节奏系统**——字号层级、字重对比、行高呼吸感、字间距松紧，这些维度协同作用才能产生"高级感"。Tailwind 的预设刻度正是帮你建立这套节奏的脚手架。

## 字号系统：text-{size}

字号用 \`text-\` + 关键字表示。注意 \`text\` 前缀同时管"字号"和"文字颜色"，靠值的形态区分：\`text-xl\`/\`text-sm\` 是字号（关键字），\`text-blue-500\` 是颜色（颜色名-数字），\`text-center\` 是对齐（关键字）。看到 \`text-\` 后面是"尺寸关键字"就是字号。

### 完整字号刻度对照表

| 类名 | rem | px（默认根字号 16px） | 行高（Tailwind 默认随字号配置） | 典型用途 |
| --- | --- | --- | --- | --- |
| \`text-xs\` | 0.75rem | 12px | 1rem (16px) | 徽章、辅助说明、版权、表格次级信息 |
| \`text-sm\` | 0.875rem | 14px | 1.25rem (20px) | 次要正文、表单提示、卡片副标题 |
| \`text-base\` | 1rem | 16px | 1.5rem (24px) | 默认正文（浏览器默认值，最常用） |
| \`text-lg\` | 1.125rem | 18px | 1.75rem (28px) | 卡片标题、强调正文、按钮大字 |
| \`text-xl\` | 1.25rem | 20px | 1.75rem (28px) | 区块小标题、侧栏标题 |
| \`text-2xl\` | 1.5rem | 24px | 2rem (32px) | 页面二级标题 H2 |
| \`text-3xl\` | 1.875rem | 30px | 2.25rem (36px) | 页面主标题 H1 |
| \`text-4xl\` | 2.25rem | 36px | 2.5rem (40px) | 大标题、英雄区副标题 |
| \`text-5xl\` | 3rem | 48px | 1 | 首屏巨型标题 |
| \`text-6xl\` | 3.75rem | 60px | 1 | 营销页超大数字 |
| \`text-7xl\` | 4.5rem | 72px | 1 | 营销页超大数字 |
| \`text-8xl\` | 6rem | 96px | 1 | 营销页超大数字 |
| \`text-9xl\` | 8rem | 128px | 1 | 营销页巨型数字（几乎只在数据大屏用） |

**关键洞察**：Tailwind 的字号类**自带了配套行高**。比如 \`text-xl\` 不仅设 \`font-size: 1.25rem\`，还同时设 \`line-height: 1.75rem\`。这是精心调校的——大字号配紧凑行高会拥挤，小字号配宽松行高才好读。所以**优先用预设字号类，而不是单独写 \`text-[20px] leading-7\`**，前者已经帮你把行高调好了。

> ⚠️ **陷阱**：如果你只想要字号不要 Tailwind 自带的行高，可以用 \`leading-none\` 重置行高为 1，或用任意值 \`text-[20px]\`（任意值不会带行高）。这在做"数字徽章"等单行紧凑元素时有用。

### 字号的视觉层级

一个典型页面的字号层级应该是**离散的 3~5 档**，而不是连续的 10 档。常见组合：

- 主标题 \`text-3xl\` → 二级标题 \`text-2xl\` → 小标题 \`text-lg\` → 正文 \`text-base\` → 辅助文字 \`text-sm\` → 徽章 \`text-xs\`
- 英雄区 \`text-5xl\` → 副标题 \`text-xl\` → 正文 \`text-base\`

**层级之间要有明显跳跃**（至少 4px 差距），否则读者分不清谁主谁次。千万不要 \`text-base\` 和 \`text-lg\` 混用做层级——差距太小，等于没有层级。

## 字重：font-{weight}

字重控制文字的粗细，用 \`font-\` + 关键字表示，对应 100~900 的数值：

| 类名 | 数值 | 字重名 | 视觉感受 | 用途 |
| --- | --- | --- | --- | --- |
| \`font-thin\` | 100 | Thin | 极细，几乎像线 | 装饰性大标题（需字体支持） |
| \`font-extralight\` | 200 | Extra Light | 很细 | 营销页大字 |
| \`font-light\` | 300 | Light | 偏细 | 优雅的副标题 |
| \`font-normal\` | 400 | Normal（默认） | 常规 | 正文默认值 |
| \`font-medium\` | 500 | Medium | 略粗 | 强调正文、按钮文字 |
| \`font-semibold\` | 600 | Semibold | 半粗 | 卡片标题、表头 |
| \`font-bold\` | 700 | Bold | 粗体 | 标题、强调 |
| \`font-extrabold\` | 800 | Extra Bold | 很粗 | 大标题 |
| \`font-black\` | 900 | Black | 极粗 | 英雄区巨型标题 |

### 字重的"对比哲学"

字重的价值不在单看某个值，而在**对比**。常见的对比手法：

1. **标题加粗 + 正文常规**：\`font-bold\` 标题 vs \`font-normal\` 正文，最经典的层级区分。
2. **正文 + 关键词半粗**：正文里把关键名词用 \`font-medium\` 或 \`font-semibold\` 提出来，比加粗更优雅。
3. **超大字 + 细字重**：营销页用 \`text-7xl font-light\`（大而细）比 \`font-bold\`（大而粗）更显高级、更有"呼吸感"。
4. **小字 + 粗字重**：\`text-xs font-bold uppercase\` 做徽章标签，小而粗反而醒目。

> ⚠️ **必踩坑**：\`font-thin\`/\`font-extralight\`/\`font-light\` **依赖字体本身提供这些字重**！系统默认字体（如 macOS 的 SF Pro、Windows 的 Segoe UI）通常只提供 400/700 两档，其余会"伪加粗/伪变细"（浏览器算法模拟），效果打折甚至变丑。用细字重时建议引入支持多字重的字体（如 Inter、Roboto）。

### 任意字重

预设不够用时用任意值：\`font-[550]\`、\`font-[350]\`。但实际项目里 9 个预设档位已足够，几乎用不到任意值。

## 字体族：font-{family}

字体族用 \`font-\` + 关键字控制 \`font-family\`：

| 类名 | 默认字体栈 | 用途 |
| --- | --- | --- |
| \`font-sans\` | ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, ... | 无衬线，**默认值**，绝大多数 UI 用这个 |
| \`font-serif\` | ui-serif, Georgia, Cambria, "Times New Roman", ... | 衬线体，正式文档、博客正文、引文 |
| \`font-mono\` | ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, ... | 等宽体，代码块、命令行、数字对齐 |

\`font-sans\` 用的是**系统字体栈**——在 macOS 上显示 SF Pro，Windows 上显示 Segoe UI，Linux 上显示 Ubuntu 字体。好处是**零加载延迟、原生体验**；缺点是跨平台不一致。需要品牌一致性时引入自定义字体（如 Inter、Roboto）。

### 自定义字体族

在 \`tailwind.config.js\` 里扩展（用 \`extend\` 而非覆盖，保留默认三族）：

\`\`\`js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        // 单字符串
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // 自定义命名
        display: ['"Poppins"', 'sans-serif'],   // 用法 font-display
        code: ['"JetBrains Mono"', 'monospace'], // 用法 font-code
      },
    },
  },
};
\`\`\`

> 💡 **实践建议**：正文用 \`font-sans\`，代码/数字用 \`font-mono\`（数字等宽对齐表格超有用），引文/博客用 \`font-serif\`。三族搭配覆盖 99% 场景。

### 中文 Web 字体的坑

中文字体文件巨大（动辄数 MB），Web 加载慢。常见策略：

1. **用系统字体栈**：macOS 用苹方（PingFang），Windows 用微软雅黑（Microsoft YaHei），都在系统里，零加载。Tailwind 默认 \`font-sans\` 已包含这些回退。
2. **按需子集化**：用字体管家、font-spider 等工具只保留页面用到的字符。
3. **用 Web Font 服务**：Google Fonts（中文支持有限）、字蛛、有字库等。

## 字间距：tracking-{value}

字间距控制字符之间的水平间隔，对应 \`letter-spacing\`：

| 类名 | letter-spacing | 感受 | 用途 |
| --- | --- | --- | --- |
| \`tracking-tighter\` | -0.05em | 紧凑 | 大标题（让字母更紧凑有力） |
| \`tracking-tight\` | -0.025em | 略紧 | 标题 |
| \`tracking-normal\` | 0em | 常规 | 默认，正文 |
| \`tracking-wide\` | 0.025em | 略松 | 全大写小字、按钮文字 |
| \`tracking-wider\` | 0.05em | 较松 | 全大写标签、面包屑 |
| \`tracking-widest\` | 0.1em | 很松 | 全大写徽章、章节序号 |

### 字间距的"反比规律"

这是个**反直觉但重要**的规律：

- **字号越大，字间距应收紧**：\`text-5xl tracking-tight\` 让大标题更紧凑有力（字母之间不会"散开"）。
- **字号越小、全大写时，字间距应放宽**：\`text-xs uppercase tracking-widest\` 让小标签更易读（全大写字母本身难辨认，放宽间距弥补）。

记住口诀：**"大字收紧，小字放宽"**。这是专业排版的隐形规则，违背它会让设计"业余感"明显。

任意值：\`tracking-[0.2em]\`、\`tracking-[-0.02em]\`。

## 行高：leading-{value}

行高控制多行文字之间基线的距离，对应 \`line-height\`，是**可读性最重要的属性**之一：

| 类名 | line-height | 感受 | 用途 |
| --- | --- | --- | --- |
| \`leading-none\` | 1 | 紧贴，无行间 | 单行元素（徽章、按钮）、数字 |
| \`leading-tight\` | 1.25 | 紧凑 | 标题（多行标题不松散） |
| \`leading-snug\` | 1.375 | 略紧 | 卡片标题、紧凑列表 |
| \`leading-normal\` | 1.5 | 常规 | 默认，正文 |
| \`leading-relaxed\` | 1.625 | 宽松 | 长正文（博客、文档） |
| \`leading-loose\` | 2 | 很宽松 | 诗歌、特殊强调 |

### 数值行高：leading-{n}

行高也可以用刻度数值（基于 spacing scale，1 = 0.25rem = 4px）：

| 类名 | line-height |
| --- | --- |
| \`leading-3\` | 0.75rem (12px) |
| \`leading-4\` | 1rem (16px) |
| \`leading-5\` | 1.25rem (20px) |
| \`leading-6\` | 1.5rem (24px) |
| \`leading-7\` | 1.75rem (28px) |
| \`leading-8\` | 2rem (32px) |
| \`leading-9\` | 2.25rem (36px) |
| \`leading-10\` | 2.5rem (40px) |

数值行高给出**固定的像素行高**（而非无单位的比例），适合需要精确控制行高的场景。但**通常推荐用无单位的比例行高**（\`leading-normal\` 等），因为它随字号自动缩放。

### 行高的"反比规律"

和字间距类似的反比规律：

- **大字号标题用紧行高**：\`text-4xl leading-tight\`，多行标题不会松散垮掉。
- **小字号正文用宽行高**：\`text-sm leading-relaxed\`，长正文才好读。

> 💡 **可读性黄金法则**：正文行高建议 1.5~1.7（\`leading-normal\` ~ \`leading-relaxed\`）。低于 1.4 行间太挤，高于 1.8 读者换行时找不到下一行。

## 文字对齐：text-{align}

| 类名 | 对齐方式 | 用途 |
| --- | --- | --- |
| \`text-left\` | 左对齐（默认） | 正文、列表（LTR 语言默认） |
| \`text-center\` | 居中 | 标题、按钮文字、英雄区 |
| \`text-right\` | 右对齐 | 数字列、日期、价格 |
| \`text-justify\` | 两端对齐 | 报纸式多栏正文（中文慎用） |

> ⚠️ **陷阱**：\`text-justify\` 在**中文**里效果很差——中文没有单词间隔，两端对齐会拉出难看的空白。仅在英文长段落使用。中文正文一律用 \`text-left\`。

\`text-center\` 是最常用的对齐——但它只对**块级元素内的行内内容**生效。如果你想居中一个块级子元素，要用 flex \`justify-center\` 或 \`mx-auto\`，不是 \`text-center\`（\`text-center\` 居中的是文字，不是盒子）。

## 文字装饰：underline / line-through / decoration-{color}

### 装饰线

| 类名 | 作用 |
| --- | --- |
| \`underline\` | 下划线（\`text-decoration: underline\`） |
| \`overline\` | 上划线 |
| \`line-through\` | 删除线（已删除、已售罄） |
| \`no-underline\` | 移除装饰线（取消链接默认下划线） |

### 装饰线样式与颜色

\`decoration-\` 前缀精细控制装饰线：

| 类名 | 作用 |
| --- | --- |
| \`decoration-solid\` / \`decoration-double\` / \`decoration-dotted\` / \`decoration-wavy\` | 实线/双线/点线/波浪线 |
| \`decoration-{color}\` | 装饰线颜色（如 \`decoration-red-500\`） |
| \`decoration-auto\` / \`decoration-from-font\` | 线粗细跟随字体/自动 |
| \`decoration-1\` ~ \`decoration-4\` | 装饰线粗细（1~4px） |
| \`underline-offset-2\` ~ \`underline-offset-8\` | 下划线和文字的距离 |

示例：\`underline decoration-wavy decoration-red-500 underline-offset-4\` —— 红色波浪下划线，离文字 4px。

> 💡 **链接设计**：现代 Web 倾向 \`hover:underline\`——默认无下划线，悬停才出现。配合 \`text-blue-600 hover:text-blue-800\` 做颜色反馈。

## 文字转换：uppercase / lowercase / capitalize

| 类名 | 作用 | 用途 |
| --- | --- | --- |
| \`uppercase\` | 全大写 | 徽章、标签、按钮（英文） |
| \`lowercase\` | 全小写 | 统一用户输入显示 |
| \`capitalize\` | 首字母大写 | 标题、人名 |
| \`normal-case\` | 还原（默认） | 取消上述转换 |

> ⚠️ **中文无效**：这些类对中文**完全无效**（中文没有大小写概念）。只在英文/拼音场景用。常见组合：\`text-xs font-bold uppercase tracking-widest\` 做英文徽章（小、粗、全大写、宽间距 = 高级感标签）。

## 文字缩进：indent-{n}

控制段落首行缩进，对应 \`text-indent\`，用 spacing 刻度：

\`\`\`html
<p class="indent-8">首行缩进 2rem（8 × 0.25rem），中文段落传统排版。</p>
<p class="indent-0">不缩进。</p>
\`\`\`

中文文章常用 \`indent-8\`（2 字符宽）做首行缩进；英文/现代 UI 多用 \`indent-0\` + 段间距 \`space-y-4\`。

## 列表样式：list-{type}

| 类名 | 作用 |
| --- | --- |
| \`list-disc\` | 实心圆点（\`<ul>\` 默认） |
| \`list-decimal\` | 阿拉伯数字（\`<ol>\` 默认） |
| \`list-none\` | 无标记（常用，移除默认列表样式） |

注意 Tailwind Preflight 会重置 \`<ul>\`/\`<ol>\` 的默认 padding 和 list-style，所以**写列表时通常需要手动加 \`list-disc pl-5\`**：

\`\`\`html
<ul class="list-disc pl-5 space-y-1">
  <li>第一项</li>
  <li>第二项</li>
</ul>
\`\`\`

\`pl-5\` 给列表项左侧留出标记的空间（1.25rem），\`list-inside\` 可让标记在内部（不需 padding）。任意标记样式：\`list-[upper-roman]\`（罗马数字）、\`list-[\\'- '\\']\`（自定义符号，注意转义）。

## 文字截断：truncate 与 line-clamp

### 单行截断：truncate

\`truncate\` 是个组合类，等价于 \`overflow-hidden text-ellipsis whitespace-nowrap\`——禁止换行 + 溢出隐藏 + 末尾省略号：

\`\`\`html
<p class="truncate">这一长串文字超出容器宽度时会显示省略号…</p>
\`\`\`

> ⚠️ **必踩坑**：\`truncate\` 要求父容器有**明确宽度**才会触发截断。在 flex 子元素里要配合 \`min-w-0\`（见间距章），否则子元素 \`min-width: auto\` 会撑破容器，截断失效。

### 多行截断：line-clamp-{1-6}

\`line-clamp-1\` ~ \`line-clamp-6\` 截断到指定行数并显示省略号：

\`\`\`html
<p class="line-clamp-2">这段文字最多显示 2 行，超出部分用 … 截断。常用于卡片摘要、评论列表。</p>
\`\`\`

底层用 \`display: -webkit-box\` + \`-webkit-line-clamp\` 实现，现代浏览器全部支持。注意 \`line-clamp-none\` 可移除截断。

### text-ellipsis vs text-clip

- \`text-ellipsis\`：溢出时显示省略号（配合 \`overflow-hidden\`）
- \`text-clip\`：溢出时直接切断，无省略号

## 文字阴影与光晕

Tailwind v3 内置的 \`shadow-\` 系列是**盒子阴影**（box-shadow），不是文字阴影（text-shadow）。文字阴影在 v3 需用任意值：

\`\`\`html
<p class="[text-shadow:2px_2px_4px_rgba(0,0,0,0.5)]">带阴影的文字</p>
\`\`\`

注意方括号里用下划线 \`_\` 代替空格。**Tailwind v4 起新增了 \`text-shadow-\` 工具类**（如 \`text-shadow-lg\`），语法和 box-shadow 类似。本教程 CDN 兼容 v3/v4，你可以试试两者。

光晕效果常用 \`drop-shadow-\` （滤镜阴影，作用于元素的不透明像素，对透明 PNG 图标效果好）：

\`\`\`html
<span class="text-5xl drop-shadow-lg">✨</span>
\`\`\`

## 垂直对齐：align-{value}

控制 \`vertical-align\`，用于行内元素、表格单元格内的垂直对齐：

| 类名 | vertical-align | 用途 |
| --- | --- | --- |
| \`align-baseline\` | baseline（默认） | 文字基线对齐 |
| \`align-top\` | top | 顶部对齐 |
| \`align-middle\` | middle | 中部对齐（图标和文字垂直居中） |
| \`align-bottom\` | bottom | 底部对齐 |
| \`align-text-top\` / \`align-text-bottom\` | 文字顶/底 | 图标相对文字顶/底 |
| \`align-sub\` / \`align-super\` | 下标/上标 | 数学公式 |

> 💡 **图标对齐**：行内图标 \`<img>\`/\`<svg>\` 和文字基线默认对不齐，常加 \`align-middle\` 或改用 flex \`items-center\`。现代做法推荐 flex。

## 写作陷阱与最佳实践

1. **字号层级要离散**：3~5 档，相邻档差距 ≥4px，避免 \`text-base\` 与 \`text-lg\` 混用做层级。
2. **正文行高 1.5~1.7**：低于 1.4 挤，高于 1.8 散。\`leading-normal\`/\`leading-relaxed\` 是安全选择。
3. **大字收紧、小字放宽**：\`text-5xl tracking-tight\`、\`text-xs tracking-widest\`。
4. **正文最多 65~75 字符宽**：配 \`max-w-prose\`（约 65ch）。
5. **慎用 \`text-justify\`**：中文效果差，英文也常破坏词距。
6. **链接 \`hover:underline\`**：默认无下划线，悬停才出现，比常驻下划线更现代。
7. **字重依赖字体**：细字重需字体支持，否则伪加粗难看。
8. **\`truncate\` 要 \`min-w-0\`**：flex 子元素截断必加 \`min-w-0\`。

## 动手试试

下面的演示覆盖了字号阶梯、字重、字间距、行高、对齐、装饰、大小写转换、\`truncate\`、\`line-clamp\` 等所有排版属性。修改任意 class 后点"运行"查看实时效果。`,
    code: `<!-- ============================================================ -->
<!-- 第一章演示：排版与文字全览                                       -->
<!-- 包含：字号阶梯 / 字重 / 字间距 / 行高 / 对齐 / 装饰 /          -->
<!--       大小写转换 / 缩进 / 列表 / truncate / line-clamp          -->
<!-- ============================================================ -->

<!-- 外层容器：max-w-4xl 最大宽 56rem，mx-auto 居中，p-6 内边距，space-y-10 子元素间距 2.5rem -->
<div class="max-w-4xl mx-auto p-6 space-y-10">

  <!-- ============ 区块 1：字号阶梯（text-xs ~ text-5xl） ============ -->
  <section>
    <!-- 区块标题：text-2xl 字号 1.5rem，font-bold 加粗，text-gray-800 深灰，mb-4 下边距 1rem -->
    <h2 class="text-2xl font-bold text-gray-800 mb-1">① 字号阶梯</h2>
    <!-- 说明文字：text-sm 小字，text-gray-500 中灰，mb-4 下边距 -->
    <p class="text-sm text-gray-500 mb-4">从 text-xs(12px) 到 text-5xl(48px)。注意每个字号自带配套行高。</p>

    <!-- 字号展示：每行一个字号，统一 text-gray-700，space-y-1 行间距 0.25rem -->
    <div class="space-y-1 text-gray-700">
      <p class="text-xs">text-xs — 12px 辅助说明</p>
      <p class="text-sm">text-sm — 14px 次要正文</p>
      <p class="text-base">text-base — 16px 默认正文</p>
      <p class="text-lg">text-lg — 18px 强调正文</p>
      <p class="text-xl">text-xl — 20px 小标题</p>
      <p class="text-2xl">text-2xl — 24px 二级标题</p>
      <p class="text-3xl">text-3xl — 30px 主标题</p>
      <p class="text-4xl">text-4xl — 36px 大标题</p>
      <p class="text-5xl">text-5xl — 48px 巨型标题</p>
    </div>
  </section>

  <!-- ============ 区块 2：字重（font-thin ~ font-black） ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">② 字重对比（100~900）</h2>
    <p class="text-sm text-gray-500 mb-4">细字重依赖字体支持，系统字体可能伪加粗。注意 font-medium(500) 是按钮常用值。</p>

    <!-- 字重展示：每行一个字重，统一 text-3xl 大字号让差异更明显，text-gray-800 -->
    <div class="space-y-2 text-3xl text-gray-800">
      <p class="font-thin">font-thin — 100 极细</p>
      <p class="font-light">font-light — 300 偏细</p>
      <p class="font-normal">font-normal — 400 常规</p>
      <p class="font-medium">font-medium — 500 略粗</p>
      <p class="font-semibold">font-semibold — 600 半粗</p>
      <p class="font-bold">font-bold — 700 粗体</p>
      <p class="font-extrabold">font-extrabold — 800 很粗</p>
      <p class="font-black">font-black — 900 极粗</p>
    </div>
  </section>

  <!-- ============ 区块 3：字体族 + 字间距 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">③ 字体族 &amp; 字间距</h2>
    <p class="text-sm text-gray-500 mb-4">font-sans/serif/mono 三族；大字收紧、小字放宽（反比规律）。</p>

    <!-- 字体族对比：text-xl 大字看效果 -->
    <div class="space-y-1 text-xl mb-4">
      <p class="font-sans">font-sans — 无衬线（默认 UI 字体）</p>
      <p class="font-serif">font-serif — 衬线（正式文档/博客）</p>
      <p class="font-mono">font-mono — 等宽（代码/数字对齐）</p>
    </div>

    <!-- 字间距对比：大标题收紧 vs 小标签放宽 -->
    <p class="text-4xl font-bold tracking-tight text-gray-800 mb-2">大标题 tracking-tight（收紧）</p>
    <p class="text-4xl font-bold tracking-widest text-gray-800 mb-4">大标题 tracking-widest（太松，反面教材）</p>
    <!-- 小标签全大写 + 宽间距 = 高级感徽章 -->
    <p class="text-xs font-bold uppercase tracking-widest text-blue-600">SMALL LABEL · TRACKING-WIDEST</p>
  </section>

  <!-- ============ 区块 4：行高对比 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">④ 行高对比</h2>
    <p class="text-sm text-gray-500 mb-4">左 tight(1.25)，中 normal(1.5)，右 relaxed(1.625)。正文推荐 1.5~1.7。</p>

    <!-- 三列对比：grid grid-cols-3 三列，gap-4 间距，h-40 固定高度让差异明显 -->
    <div class="grid grid-cols-3 gap-4">
      <!-- leading-tight：紧凑，多行文字会挤 -->
      <div class="bg-gray-50 p-3 rounded">
        <p class="text-xs font-semibold text-gray-500 mb-2">leading-tight (1.25)</p>
        <p class="text-sm leading-tight text-gray-700">这是一段示例文字，用来对比不同行高的阅读体验。紧凑行高让多行文字显得拥挤，适合标题不适合正文。</p>
      </div>
      <!-- leading-normal：常规，正文默认 -->
      <div class="bg-gray-50 p-3 rounded">
        <p class="text-xs font-semibold text-gray-500 mb-2">leading-normal (1.5)</p>
        <p class="text-sm leading-normal text-gray-700">这是一段示例文字，用来对比不同行高的阅读体验。常规行高是正文的安全选择，平衡了紧凑与呼吸感。</p>
      </div>
      <!-- leading-relaxed：宽松，长正文更舒服 -->
      <div class="bg-gray-50 p-3 rounded">
        <p class="text-xs font-semibold text-gray-500 mb-2">leading-relaxed (1.625)</p>
        <p class="text-sm leading-relaxed text-gray-700">这是一段示例文字，用来对比不同行高的阅读体验。宽松行高适合长篇正文，如博客、文档，减少阅读疲劳。</p>
      </div>
    </div>
  </section>

  <!-- ============ 区块 5：对齐方式 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑤ 文字对齐</h2>
    <p class="text-sm text-gray-500 mb-4">text-left/center/right/justify。容器有边框便于看清对齐边界。</p>

    <!-- 对齐演示：border 边框 + p-3 内边距，space-y-2 行间距 -->
    <div class="space-y-2">
      <div class="border border-gray-200 p-3 text-left text-sm text-gray-700 bg-gray-50">text-left — 左对齐（默认）</div>
      <div class="border border-gray-200 p-3 text-center text-sm text-gray-700 bg-gray-50">text-center — 居中</div>
      <div class="border border-gray-200 p-3 text-right text-sm text-gray-700 bg-gray-50">text-right — 右对齐</div>
      <div class="border border-gray-200 p-3 text-justify text-sm text-gray-700 bg-gray-50">text-justify — 两端对齐：The quick brown fox jumps over the lazy dog and runs away quickly.</div>
    </div>
  </section>

  <!-- ============ 区块 6：文字装饰 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑥ 文字装饰</h2>
    <p class="text-sm text-gray-500 mb-4">underline/line-through/no-underline，配合 decoration-* 精细控制。</p>

    <div class="space-y-2 text-base text-gray-700">
      <!-- 普通下划线 -->
      <p><span class="underline">underline 普通下划线</span></p>
      <!-- 红色波浪下划线 + 偏移 -->
      <p><span class="underline decoration-wavy decoration-red-500 underline-offset-4">decoration-wavy decoration-red-500 红色波浪线</span></p>
      <!-- 双线 + 蓝色 -->
      <p><span class="underline decoration-double decoration-blue-500 decoration-2">decoration-double decoration-blue-500 双蓝线</span></p>
      <!-- 删除线（已售罄/已删除） -->
      <p><span class="line-through text-gray-400">line-through 删除线（已售罄）</span> <span class="text-red-500 font-semibold">缺货</span></p>
      <!-- 上划线 -->
      <p><span class="overline">overline 上划线</span></p>
      <!-- 链接风格：默认无下划线，hover 才出现 -->
      <p>访问 <a href="#" class="text-blue-600 hover:underline hover:text-blue-800">官方文档</a>（hover 才显示下划线）</p>
    </div>
  </section>

  <!-- ============ 区块 7：大小写转换 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑦ 大小写转换（仅对英文/拼音）</h2>
    <p class="text-sm text-gray-500 mb-4">uppercase/lowercase/capitalize。中文无效。常见组合：小字+全大写+宽间距做徽章。</p>

    <div class="space-y-1 text-lg text-gray-700">
      <p>原文：<span class="font-mono">hello world wide web</span></p>
      <p class="uppercase">uppercase：HELLO WORLD WIDE WEB</p>
      <p class="lowercase">LOWERCASE 强制小写：即使源大写也会变小写</p>
      <p class="capitalize">capitalize：Hello World Wide Web</p>
      <!-- 高级徽章组合：text-xs 小 + font-bold 粗 + uppercase 全大写 + tracking-widest 宽间距 -->
      <p class="mt-3 text-xs font-bold uppercase tracking-widest text-indigo-600">premium · new feature</p>
    </div>
  </section>

  <!-- ============ 区块 8：缩进与列表 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑧ 缩进 &amp; 列表</h2>
    <p class="text-sm text-gray-500 mb-4">indent-8 中文段落首行缩进；list-disc/list-decimal 需配 pl-5 留标记空间。</p>

    <!-- 缩进演示：indent-8 首行缩进 2rem（中文传统排版 2 字符宽） -->
    <p class="indent-8 text-sm leading-relaxed text-gray-700 mb-4">中文段落首行缩进 indent-8（2rem，约 2 个汉字宽）。这是中文文章的传统排版方式。第二行不缩进，回到正常位置。</p>

    <!-- 列表演示：grid 两列对比 -->
    <div class="grid grid-cols-2 gap-6">
      <!-- 无序列表：list-disc 实心圆点，pl-5 左 padding 留标记空间，space-y-1 行间距 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-2">list-disc（无序）</p>
        <ul class="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>第一项内容</li>
          <li>第二项内容</li>
          <li>第三项内容</li>
        </ul>
      </div>
      <!-- 有序列表：list-decimal 阿拉伯数字 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-2">list-decimal（有序）</p>
        <ol class="list-decimal pl-5 space-y-1 text-sm text-gray-700">
          <li>步骤一：打开设置</li>
          <li>步骤二：选择语言</li>
          <li>步骤三：保存更改</li>
        </ol>
      </div>
    </div>
  </section>

  <!-- ============ 区块 9：文字截断 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑨ 文字截断（truncate &amp; line-clamp）</h2>
    <p class="text-sm text-gray-500 mb-4">truncate 单行截断+省略号；line-clamp-N 多行截断。容器固定宽度才生效。</p>

    <!-- 单行截断：truncate，w-80 固定宽度 20rem 让长文字溢出 -->
    <div class="w-80 bg-gray-50 border border-gray-200 p-3 rounded mb-3">
      <p class="text-xs font-semibold text-gray-500 mb-1">truncate（单行）：</p>
      <p class="truncate text-sm text-gray-700">这是一段非常非常长的文字，超出了容器宽度，会被截断并在末尾显示省略号，避免撑破布局。</p>
    </div>

    <!-- 两行截断：line-clamp-2 -->
    <div class="w-80 bg-gray-50 border border-gray-200 p-3 rounded">
      <p class="text-xs font-semibold text-gray-500 mb-1">line-clamp-2（两行）：</p>
      <p class="line-clamp-2 text-sm text-gray-700">这是一段很长的文字，最多显示两行，超出部分用省略号截断。这种效果常用于卡片摘要、评论列表、新闻列表等场景，能在有限空间内展示更多内容的预览，引导用户点击查看完整内容。第三行及以后会被隐藏。</p>
    </div>
  </section>

  <!-- ============ 区块 10：垂直对齐 + 文字阴影 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑩ 垂直对齐 &amp; 文字阴影</h2>
    <p class="text-sm text-gray-500 mb-4">align-middle 让行内图标和文字垂直居中；文字阴影用任意值（v4 有 text-shadow-*）。</p>

    <!-- 垂直对齐：行内 img 和文字基线对不齐，align-middle 修正 -->
    <p class="text-base text-gray-700 mb-3">
      图标
      <span class="inline-block w-6 h-6 bg-blue-500 rounded align-middle"></span>
      用 align-middle 居中（对比下面的默认基线）
    </p>
    <p class="text-base text-gray-700 mb-4">
      图标
      <span class="inline-block w-6 h-6 bg-red-500 rounded"></span>
      默认基线对齐（图标偏下）
    </p>

    <!-- 文字阴影：用任意值 [text-shadow:...] 实现，下划线代替空格 -->
    <p class="text-5xl font-black text-white [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] bg-gray-800 py-2 px-4 rounded inline-block">
      带阴影的标题
    </p>
    <!-- drop-shadow 滤镜阴影（对文字也有效，柔光效果） -->
    <p class="mt-3 text-5xl font-bold text-amber-400 drop-shadow-lg">✨ 光晕文字 drop-shadow-lg</p>
  </section>
</div>`,
  },

  // =========================================================
  // 第二章：Flexbox 弹性布局
  // =========================================================
  {
    id: "tw-flexbox",
    title: "Flexbox 弹性布局",
    icon: "📐",
    group: "排版与布局",
    content: `## 为什么 Flexbox 是现代布局的基石

在 Flexbox 出现之前，Web 布局是一场噩梦：用 \`float\` + \`clear\` 拼布局，用 \`display: inline-block\` 处理水平排列，用各种 hack 实现"垂直居中"（\`position: absolute\` + 负 margin、\`line-height\` 等于高度、\`table-cell\`……）。每一个"看似简单"的布局需求背后都是一串黑魔法。

**Flexbox（弹性盒布局）** 在 2013 年正式标准化，彻底改变了这一切。它专为**一维布局**（一行或一列）设计，提供了三件事：

1. **自动分配空间**：子元素可以根据"重要性"自动伸缩，填满容器。
2. **任意方向对齐**：水平居中、垂直居中、两端对齐……一行属性搞定，不再需要 hack。
3. **顺序重排**：不改 HTML 也能调整子元素显示顺序。

今天，**90% 的 UI 布局都能用 Flexbox 解决**——导航栏、按钮组、卡片头部、表单行、工具条、模态框……掌握 Flexbox 是现代前端的基本功。Tailwind 把 Flexbox 的每个属性都映射成了简洁的工具类，本章将**逐属性、配原理图、配陷阱**地讲透。

## 启用 Flexbox：flex / inline-flex

| 类名 | display | 含义 |
| --- | --- | --- |
| \`flex\` | \`display: flex\` | 块级弹性容器（独占一行） |
| \`inline-flex\` | \`display: inline-flex\` | 行内弹性容器（不独占行，可并排） |

给父元素加 \`flex\`，它就变成**弹性容器**，其**直接子元素**变成**弹性项目（flex items）**。注意：只有直接子元素受影响，孙子元素不受影响（除非它们自己的父元素也是 flex）。

\`\`\`html
<div class="flex">  <!-- 这个 div 是弹性容器 -->
  <div>子1</div>     <!-- 这两个 div 是弹性项目 -->
  <div>子2</div>
</div>
\`\`\`

> 💡 **关键概念**：Flexbox 是**父子关系**的布局——父元素设 \`flex\` + 对齐属性，子元素设 \`flex-1\`/\`order\` 等自身属性。理解"哪些属性写在父上、哪些写在子上"是掌握 Flexbox 的核心。

## 主轴与交叉轴：Flexbox 的灵魂

理解 Flexbox 必须先理解**两根轴**：

- **主轴（main axis）**：弹性项目排列的方向。默认水平（从左到右）。
- **交叉轴（cross axis）**：与主轴垂直的方向。默认垂直（从上到下）。

\`\`\`
默认 flex-row（主轴水平）：
┌──────────────────────────────┐
│  ┌──┐ ┌──┐ ┌──┐              │
│  │子1│ │子2│ │子3│   → 主轴   │
│  └──┘ └──┘ └──┘              │
│   ↕ 交叉轴                    │
└──────────────────────────────┘
\`\`\`

**所有 Flexbox 属性都按"轴"分类**：

- **主轴属性**（写在父上）：\`justify-*\` 控制主轴方向的对齐和间距。
- **交叉轴属性**（写在父上）：\`items-\` 控制交叉轴方向的对齐。
- **自身属性**（写在子上）：\`flex-1\`/\`grow\`/\`shrink\`/\`basis\`/\`order\`/\`self-\`。

> ⚠️ **关键陷阱**：当 \`flex-direction\` 改变时，主轴和交叉轴会**互换**！\`flex-col\` 时主轴变垂直，\`justify-\` 就变成控制垂直对齐了。这是新手最常困惑的点——"为什么 \`justify-center\` 一会儿居中横向、一会儿居中纵向"。

## flex-direction：主轴方向

| 类名 | direction | 主轴方向 | 排列 |
| --- | --- | --- | --- |
| \`flex-row\`（默认） | row | 水平 → | 从左到右 |
| \`flex-row-reverse\` | row-reverse | 水平 ← | 从右到左 |
| \`flex-col\` | column | 垂直 ↓ | 从上到下 |
| \`flex-col-reverse\` | column-reverse | 垂直 ↑ | 从下到上 |

\`\`\`html
<!-- 水平排列（默认） -->
<div class="flex flex-row gap-2">...</div>
<!-- 垂直排列 -->
<div class="flex flex-col gap-2">...</div>
\`\`\`

**响应式常用**：\`flex-col md:flex-row\`——手机上垂直堆叠，桌面水平排列。这是导航栏、卡片网格的标配。

> 💡 \`flex-row-reverse\` 适合 RTL（从右到左）语言或视觉反转效果；\`flex-col-reverse\` 偶尔用于"消息列表从底部往上"的场景。

## flex-wrap：换行控制

| 类名 | 含义 | 行为 |
| --- | --- | --- |
| \`flex-nowrap\`（默认） | 不换行 | 子元素溢出容器（可能撑破或滚动） |
| \`flex-wrap\` | 换行 | 装不下时自动换到下一行 |
| \`flex-wrap-reverse\` | 反向换行 | 换行方向反转 |

\`\`\`html
<!-- 不换行：子元素会被压缩到 min-width，再小就溢出 -->
<div class="flex flex-nowrap">...</div>
<!-- 换行：装不下时自动换行 -->
<div class="flex flex-wrap gap-4">...</div>
\`\`\`

> ⚠️ **必踩坑**：\`flex-nowrap\`（默认）时，如果子元素内容很长且 \`min-width: auto\`，会**撑破容器导致横向滚动条**。解决：要么 \`flex-wrap\` 允许换行，要么给子元素 \`min-w-0\` 允许压缩。

## justify-content：主轴对齐（写在父上）

控制弹性项目在**主轴**方向上的对齐和分布：

| 类名 | 分布效果 | 视觉 |
| --- | --- | --- |
| \`justify-start\`（默认） | 起点对齐，挤在主轴起点 | \`■■■     \` |
| \`justify-end\` | 终点对齐，挤在主轴终点 | \`     ■■■\` |
| \`justify-center\` | 居中 | \`   ■■■  \` |
| \`justify-between\` | 两端对齐，间距均分在中间 | \`■   ■   ■\` |
| \`justify-around\` | 每个项目两侧间距相等 | \` ■  ■  ■ \` |
| \`justify-evenly\` | 所有间距（含两端）完全相等 | \`  ■  ■  ■  \` |

\`between\` vs \`around\` vs \`evenly\` 的区别（假设 3 个项目，容器宽 100，项目共占 40，剩余 60 空间）：

- \`between\`：两端贴边，60 全分到 2 个间隙 → 每间隙 30，两端 0。
- \`around\`：每个项目左右各分 1/6 → 每项目两侧 10，中间间隙 20。
- \`evenly\`：60 分到 4 个间隙（含两端）→ 每间隙 15。

**实战**：导航栏用 \`justify-between\`（logo 在左，菜单在右）；按钮组居中用 \`justify-center\`；卡片均匀分布用 \`justify-evenly\`。

## align-items：交叉轴对齐（写在父上）

控制弹性项目在**交叉轴**方向上的对齐（当项目高度不一致时尤其明显）：

| 类名 | 对齐方式 | 视觉 |
| --- | --- | --- |
| \`items-stretch\`（默认） | 拉伸填满交叉轴 | 所有项目等高 |
| \`items-start\` | 交叉轴起点 | 顶部对齐 |
| \`items-center\` | 交叉轴中点 | 垂直居中 |
| \`items-end\` | 交叉轴终点 | 底部对齐 |
| \`items-baseline\` | 文字基线对齐 | 按文字基线对齐（混排不同字号有用） |

**最常用组合**：\`flex items-center\` —— 水平排列 + 垂直居中。这是按钮（图标 + 文字）、导航栏、工具条的标配。

\`items-baseline\` 是被低估的类：当一行里有不同字号的文字，按基线对齐比按中心对齐更"工整"（视觉上文字底部齐平）。

## align-content：多行整体对齐（写在父上）

当 \`flex-wrap\` 换行产生**多行**时，\`align-content\` 控制**行与行之间**在交叉轴上的分布。**单行时不生效**（因为只有一行）：

| 类名 | 含义 |
| --- | --- |
| \`content-start\` | 所有行挤在交叉轴起点 |
| \`content-center\` | 所有行居中 |
| \`content-end\` | 所有行挤在交叉轴终点 |
| \`content-between\` | 行间两端对齐 |
| \`content-around\` | 行间均匀分布 |
| \`content-evenly\` | 行间完全均等 |
| \`content-stretch\`（默认） | 行拉伸填满 |

> 💡 这是 Flexbox 里最少用的属性之一——多数场景项目不多，单行就够。但在做"标签云"等大量换行元素时有用。

## flex-grow / shrink / basis：弹性伸缩（写在子上）

这三个属性控制弹性项目如何**分配剩余空间**，是 Flexbox "弹性"的核心。

### 三合一简写：flex-{value}

| 类名 | grow / shrink / basis | 含义 |
| --- | --- | --- |
| \`flex-1\` | 1 1 0% | 等分剩余空间（最常用） |
| \`flex-auto\` | 1 1 auto | 按内容尺寸伸缩 |
| \`flex-initial\` | 0 1 auto | 默认值（不扩展，可收缩） |
| \`flex-none\` | 0 0 auto | 完全不伸缩（固定尺寸） |

**最常用的是 \`flex-1\`**：让多个子元素等分容器剩余空间。

\`\`\`html
<div class="flex">
  <div class="flex-1">等分1</div>  <!-- 三个子元素各占 1/3 -->
  <div class="flex-1">等分2</div>
  <div class="flex-1">等分3</div>
</div>
\`\`\`

### 分开写：grow / shrink / basis

- \`grow-{n}\`：\`flex-grow\`，剩余空间分配比例。\`grow\` = \`grow-1\`，\`grow-0\` 不扩展。
- \`shrink-{n}\`：\`flex-shrink\`，空间不足时压缩比例。\`shrink\` = \`shrink-1\`，\`shrink-0\` 不压缩。
- \`basis-{n}\`：\`flex-basis\`，初始尺寸（在分配空间前）。\`basis-1/2\` = 50%，\`basis-64\` = 16rem，\`basis-auto\` 按内容。

\`\`\`html
<div class="flex">
  <div class="grow-0 shrink-0 w-32">固定 8rem</div>  <!-- 不伸缩 -->
  <div class="grow">占据剩余全部</div>                <!-- grow-1 -->
</div>
\`\`\`

### flex-1 与 min-w-0 的著名陷阱

这是 Flexbox 最隐蔽也最重要的坑。看下例：

\`\`\`html
<div class="flex">
  <div class="flex-1">
    <p class="truncate">很长很长的文字...</p>  <!-- 截断失效！ -->
  </div>
</div>
\`\`\`

**为什么 \`truncate\` 失效？** 因为 flex 子元素默认 \`min-width: auto\`，意味着"不会缩小到比内容最小宽度更小"。长文字的最小宽度就是整行不换行的宽度，所以 \`flex-1\` 想压缩它也压不动，容器被撑破，\`truncate\` 自然失效。

**解决**：给 \`flex-1\` 的元素加 \`min-w-0\`：

\`\`\`html
<div class="flex">
  <div class="flex-1 min-w-0">  <!-- 关键！允许压缩到 0 -->
    <p class="truncate">很长很长的文字...</p>  <!-- 现在截断生效 -->
  </div>
</div>
\`\`\`

**记住口诀**：**flex-1 + truncate 必加 min-w-0**。这是面试常考、实战常踩的坑。

## order：顺序重排（写在子上）

\`order-{n}\` 控制弹性项目的显示顺序，数值越小越靠前。默认所有项目 \`order: 0\`：

\`\`\`html
<div class="flex">
  <div class="order-2">A（显示在第2）</div>
  <div class="order-1">B（显示在第1）</div>
  <div class="order-3">C（显示在第3）</div>
</div>
<!-- 实际显示顺序：B A C -->
\`\`\`

支持负值 \`-order-1\`。任意值 \`order-[10]\`。**响应式常用**：\`order-1 md:order-2\`——手机和桌面顺序不同。

> ⚠️ **可访问性警告**：\`order\` 只改变视觉顺序，**不改变 DOM 顺序**，屏幕阅读器仍按 DOM 顺序读。重要的语义顺序不要用 \`order\` 颠倒，应直接改 HTML。

## align-self：单个项目交叉轴对齐（写在子上）

\`self-\` 让**单个**子元素覆盖父级的 \`items-\` 设置：

| 类名 | 含义 |
| --- | --- |
| \`self-auto\`（默认） | 继承父级 \`items-\` |
| \`self-start\` | 交叉轴起点 |
| \`self-center\` | 交叉轴中点 |
| \`self-end\` | 交叉轴终点 |
| \`self-stretch\` | 拉伸 |
| \`self-baseline\` | 基线 |

用途：一行里某个元素需要特殊对齐（如某个按钮比其他高，单独 \`self-center\`）。

## gap：间距（写在父上，现代推荐）

\`gap-\` 控制 flex/grid 子元素之间的间距，比 \`space-x/y-\` 更现代：

| 类名 | 含义 |
| --- | --- |
| \`gap-{n}\` | 行列间距都是 n |
| \`gap-x-{n}\` | 仅主轴（行内）间距 |
| \`gap-y-{n}\` | 仅交叉轴（行间）间距 |

\`\`\`html
<div class="flex gap-4">  <!-- 所有子元素间距 1rem -->
<div class="flex gap-x-4 gap-y-2">  <!-- 行内 1rem，换行后行间 0.5rem -->
\`\`\`

> 💡 **gap vs space-x/y**：\`gap\` 是容器属性（写在父），\`space-x/y\` 是给子元素加 margin。换行时 \`gap\` 行为首尾无多余间距，\`space-x\` 会有错位。**新项目一律用 \`gap\`**，\`space-x/y\` 仅兼容旧浏览器。

## 常见布局实战

### 1. 水平居中

\`\`\`html
<!-- 方法1：flex + justify-center（推荐） -->
<div class="flex justify-center">
  <div>居中的盒子</div>
</div>

<!-- 方法2：mx-auto（需子元素有明确宽度） -->
<div class="mx-auto w-1/2">居中</div>
\`\`\`

### 2. 垂直居中（多种方式）

\`\`\`html
<!-- 方法1：flex items-center（最常用） -->
<div class="flex items-center h-32">
  <div>垂直居中</div>
</div>

<!-- 方法2：flex justify-center items-center（水平+垂直双居中） -->
<div class="flex justify-center items-center h-32">
  <div>完全居中</div>
</div>

<!-- 方法3：grid place-items-center（更简洁） -->
<div class="grid place-items-center h-32">
  <div>完全居中</div>
</div>
\`\`\`

> 💡 \`place-items-center\` 是 \`items-center justify-items-center\` 的简写，**grid 专属**。flex 没有等价简写，要写 \`justify-center items-center\`。

### 3. 等分卡片

\`\`\`html
<div class="flex gap-4">
  <div class="flex-1">卡片1（等宽）</div>
  <div class="flex-1">卡片2（等宽）</div>
  <div class="flex-1">卡片3（等宽）</div>
</div>
\`\`\`

### 4. 圣杯布局（Header / Sidebar / Main / Aside / Footer）

\`\`\`html
<div class="flex flex-col min-h-screen">
  <header class="h-16">Header</header>
  <div class="flex flex-1">
    <aside class="w-60">Sidebar</aside>
    <main class="flex-1">Main</main>
    <aside class="w-48">Aside</aside>
  </div>
  <footer class="h-12">Footer</footer>
</div>
\`\`\`

### 5. 导航栏（logo 左 + 菜单右）

\`\`\`html
<nav class="flex items-center justify-between">
  <div class="logo">Logo</div>
  <div class="flex items-center gap-6">
    <a>首页</a><a>关于</a><a>联系</a>
  </div>
</nav>
\`\`\`

### 6. 响应式 flex-col md:flex-row

\`\`\`html
<div class="flex flex-col md:flex-row gap-4">
  <div class="md:w-1/3">侧栏（手机在上，桌面在左）</div>
  <div class="md:flex-1">主内容</div>
</div>
\`\`\`

## Flexbox 常见陷阱总结

1. **\`flex-1\` + \`truncate\` 必加 \`min-w-0\`**：否则截断失效、容器撑破。
2. **\`flex-col\` 时 \`justify-*\` 控制垂直**：主轴变了，对齐方向也变。
3. **\`items-center\` 不等于"垂直居中"**：在 \`flex-row\` 时是垂直居中，\`flex-col\` 时是水平居中。
4. **\`flex-1\` 不是"等宽"**：是"等分剩余空间"。如果有固定宽度的兄弟，\`flex-1\` 拿剩余的。
5. **\`flex-wrap\` 默认关闭**：不写会溢出。卡片网格要 \`flex-wrap\` 或改用 grid。
6. **\`gap\` 比 \`space-x\` 更可靠**：换行不错位。
7. **\`order\` 不改 DOM**：可访问性顺序仍是 DOM 顺序。

## 动手试试

下面的演示覆盖了 flex 各属性、水平+垂直居中（多种方式）、等分卡片、导航栏、响应式 \`flex-col md:flex-row\`。修改任意 class 后点"运行"查看效果，试着缩窄浏览器看响应式变化。`,
    code: `<!-- ============================================================ -->
<!-- 第二章演示：Flexbox 弹性布局全览                                 -->
<!-- 包含：flex-direction / justify / items / flex-1 /              -->
<!--       居中多种方式 / 等分卡片 / 导航栏 / 响应式                  -->
<!-- ============================================================ -->

<!-- 外层容器：max-w-4xl 最大宽 56rem，mx-auto 居中，p-6 内边距，space-y-10 子元素间距 -->
<div class="max-w-4xl mx-auto p-6 space-y-10">

  <!-- ============ 区块 1：flex-direction 主轴方向 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">① flex-direction（主轴方向）</h2>
    <p class="text-sm text-gray-500 mb-4">flex-row 水平排列（默认），flex-col 垂直排列，*-reverse 反向。</p>

    <!-- flex-row：水平排列，gap-2 间距，每个子元素 bg-blue-500 -->
    <p class="text-xs font-semibold text-gray-500 mb-1">flex-row（水平 →）：</p>
    <div class="flex flex-row gap-2 mb-3">
      <div class="bg-blue-500 text-white px-4 py-2 rounded text-sm">子1</div>
      <div class="bg-blue-500 text-white px-4 py-2 rounded text-sm">子2</div>
      <div class="bg-blue-500 text-white px-4 py-2 rounded text-sm">子3</div>
    </div>

    <!-- flex-row-reverse：水平反向（从右到左） -->
    <p class="text-xs font-semibold text-gray-500 mb-1">flex-row-reverse（水平 ←）：</p>
    <div class="flex flex-row-reverse gap-2 mb-3">
      <div class="bg-cyan-500 text-white px-4 py-2 rounded text-sm">子1</div>
      <div class="bg-cyan-500 text-white px-4 py-2 rounded text-sm">子2</div>
      <div class="bg-cyan-500 text-white px-4 py-2 rounded text-sm">子3</div>
    </div>

    <!-- flex-col：垂直排列 -->
    <p class="text-xs font-semibold text-gray-500 mb-1">flex-col（垂直 ↓）：</p>
    <div class="flex flex-col gap-2 w-40">
      <div class="bg-emerald-500 text-white px-4 py-2 rounded text-sm">子1</div>
      <div class="bg-emerald-500 text-white px-4 py-2 rounded text-sm">子2</div>
      <div class="bg-emerald-500 text-white px-4 py-2 rounded text-sm">子3</div>
    </div>
  </section>

  <!-- ============ 区块 2：justify-content 主轴对齐 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">② justify-content（主轴对齐）</h2>
    <p class="text-sm text-gray-500 mb-4">start/end/center/between/around/evenly。容器有边框便于看清分布。</p>

    <div class="space-y-2">
      <!-- justify-start：起点对齐（默认），子元素挤在左边 -->
      <div class="flex justify-start border border-gray-200 p-2 rounded">
        <span class="text-xs text-gray-500 mr-2">start:</span>
        <div class="bg-purple-500 text-white px-3 py-1 rounded text-xs">项</div>
        <div class="bg-purple-500 text-white px-3 py-1 rounded text-xs">项</div>
        <div class="bg-purple-500 text-white px-3 py-1 rounded text-xs">项</div>
      </div>
      <!-- justify-center：居中 -->
      <div class="flex justify-center border border-gray-200 p-2 rounded">
        <span class="text-xs text-gray-500 mr-2">center:</span>
        <div class="bg-purple-500 text-white px-3 py-1 rounded text-xs">项</div>
        <div class="bg-purple-500 text-white px-3 py-1 rounded text-xs">项</div>
        <div class="bg-purple-500 text-white px-3 py-1 rounded text-xs">项</div>
      </div>
      <!-- justify-end：终点对齐 -->
      <div class="flex justify-end border border-gray-200 p-2 rounded">
        <span class="text-xs text-gray-500 mr-2">end:</span>
        <div class="bg-purple-500 text-white px-3 py-1 rounded text-xs">项</div>
        <div class="bg-purple-500 text-white px-3 py-1 rounded text-xs">项</div>
        <div class="bg-purple-500 text-white px-3 py-1 rounded text-xs">项</div>
      </div>
      <!-- justify-between：两端对齐，中间均分 -->
      <div class="flex justify-between border border-gray-200 p-2 rounded">
        <span class="text-xs text-gray-500">between:</span>
        <div class="bg-purple-500 text-white px-3 py-1 rounded text-xs">项</div>
        <div class="bg-purple-500 text-white px-3 py-1 rounded text-xs">项</div>
        <div class="bg-purple-500 text-white px-3 py-1 rounded text-xs">项</div>
      </div>
      <!-- justify-around：每项两侧间距相等 -->
      <div class="flex justify-around border border-gray-200 p-2 rounded">
        <span class="text-xs text-gray-500">around:</span>
        <div class="bg-purple-500 text-white px-3 py-1 rounded text-xs">项</div>
        <div class="bg-purple-500 text-white px-3 py-1 rounded text-xs">项</div>
        <div class="bg-purple-500 text-white px-3 py-1 rounded text-xs">项</div>
      </div>
      <!-- justify-evenly：所有间距完全相等（含两端） -->
      <div class="flex justify-evenly border border-gray-200 p-2 rounded">
        <span class="text-xs text-gray-500">evenly:</span>
        <div class="bg-purple-500 text-white px-3 py-1 rounded text-xs">项</div>
        <div class="bg-purple-500 text-white px-3 py-1 rounded text-xs">项</div>
        <div class="bg-purple-500 text-white px-3 py-1 rounded text-xs">项</div>
      </div>
    </div>
  </section>

  <!-- ============ 区块 3：align-items 交叉轴对齐 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">③ align-items（交叉轴对齐）</h2>
    <p class="text-sm text-gray-500 mb-4">项目高度不一致时差异明显。h-24 固定容器高度，子元素高度各异。</p>

    <div class="grid grid-cols-3 gap-3">
      <!-- items-start：顶部对齐 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-1">items-start</p>
        <div class="flex items-start h-24 border border-gray-200 p-2 rounded">
          <div class="bg-orange-500 text-white px-2 py-1 rounded text-xs">短</div>
          <div class="bg-orange-500 text-white px-2 py-4 rounded text-xs">较高</div>
          <div class="bg-orange-500 text-white px-2 py-2 rounded text-xs">中</div>
        </div>
      </div>
      <!-- items-center：垂直居中 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-1">items-center</p>
        <div class="flex items-center h-24 border border-gray-200 p-2 rounded">
          <div class="bg-orange-500 text-white px-2 py-1 rounded text-xs">短</div>
          <div class="bg-orange-500 text-white px-2 py-4 rounded text-xs">较高</div>
          <div class="bg-orange-500 text-white px-2 py-2 rounded text-xs">中</div>
        </div>
      </div>
      <!-- items-end：底部对齐 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-1">items-end</p>
        <div class="flex items-end h-24 border border-gray-200 p-2 rounded">
          <div class="bg-orange-500 text-white px-2 py-1 rounded text-xs">短</div>
          <div class="bg-orange-500 text-white px-2 py-4 rounded text-xs">较高</div>
          <div class="bg-orange-500 text-white px-2 py-2 rounded text-xs">中</div>
        </div>
      </div>
      <!-- items-stretch：拉伸填满（默认） -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-1">items-stretch</p>
        <div class="flex items-stretch h-24 border border-gray-200 p-2 rounded">
          <div class="bg-orange-500 text-white px-2 py-1 rounded text-xs flex items-center">拉</div>
          <div class="bg-orange-500 text-white px-2 py-4 rounded text-xs flex items-center">伸</div>
          <div class="bg-orange-500 text-white px-2 py-2 rounded text-xs flex items-center">满</div>
        </div>
      </div>
      <!-- items-baseline：基线对齐 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-1">items-baseline</p>
        <div class="flex items-baseline h-24 border border-gray-200 p-2 rounded">
          <div class="bg-orange-500 text-white px-2 rounded text-xs">小</div>
          <div class="bg-orange-500 text-white px-2 rounded text-2xl">大</div>
          <div class="bg-orange-500 text-white px-2 rounded text-sm">中</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ 区块 4：flex-1 等分 + min-w-0 陷阱 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">④ flex-1 等分 &amp; min-w-0 陷阱</h2>
    <p class="text-sm text-gray-500 mb-4">左：三个 flex-1 等分。右：flex-1 + truncate 必须配 min-w-0 才生效。</p>

    <!-- 等分：三个 flex-1 各占 1/3 -->
    <p class="text-xs font-semibold text-gray-500 mb-1">等分（flex-1 × 3）：</p>
    <div class="flex gap-2 mb-4">
      <div class="flex-1 bg-teal-500 text-white text-center py-3 rounded text-sm">flex-1 (1/3)</div>
      <div class="flex-1 bg-teal-500 text-white text-center py-3 rounded text-sm">flex-1 (1/3)</div>
      <div class="flex-1 bg-teal-500 text-white text-center py-3 rounded text-sm">flex-1 (1/3)</div>
    </div>

    <!-- 固定 + flex-1：固定宽度兄弟 + flex-1 拿剩余 -->
    <p class="text-xs font-semibold text-gray-500 mb-1">固定 + flex-1（拿剩余）：</p>
    <div class="flex gap-2 mb-4">
      <div class="w-32 bg-indigo-500 text-white text-center py-3 rounded text-sm">w-32 固定</div>
      <div class="flex-1 bg-indigo-600 text-white text-center py-3 rounded text-sm">flex-1 拿剩余</div>
    </div>

    <!-- min-w-0 陷阱：对比有无 min-w-0 的截断效果 -->
    <p class="text-xs font-semibold text-gray-500 mb-1">min-w-0 陷阱（左无 min-w-0 截断失效，右有则生效）：</p>
    <div class="grid grid-cols-2 gap-2">
      <!-- 左：没有 min-w-0，truncate 失效，长文字撑破容器 -->
      <div class="border border-red-300 bg-red-50 p-2 rounded">
        <p class="text-xs text-red-600 mb-1">无 min-w-0（撑破）：</p>
        <div class="flex">
          <div class="flex-1">
            <p class="truncate text-sm text-gray-700">这是一段超长文字，没有 min-w-0 时会撑破容器，truncate 失效。</p>
          </div>
        </div>
      </div>
      <!-- 右：有 min-w-0，允许压缩，truncate 生效 -->
      <div class="border border-green-300 bg-green-50 p-2 rounded">
        <p class="text-xs text-green-600 mb-1">有 min-w-0（生效）：</p>
        <div class="flex">
          <div class="flex-1 min-w-0">
            <p class="truncate text-sm text-gray-700">这是一段超长文字，加了 min-w-0 后 truncate 生效，显示省略号。</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ 区块 5：水平 + 垂直居中（多种方式） ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑤ 居中的多种写法</h2>
    <p class="text-sm text-gray-500 mb-4">flex justify-center items-center（双居中）；或 grid place-items-center。</p>

    <div class="grid grid-cols-3 gap-3">
      <!-- 方式1：flex justify-center items-center -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-1">flex 双居中</p>
        <div class="flex justify-center items-center h-28 bg-gray-100 rounded">
          <div class="bg-pink-500 text-white px-3 py-2 rounded text-sm">居中</div>
        </div>
      </div>
      <!-- 方式2：仅垂直居中 items-center -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-1">仅 items-center</p>
        <div class="flex items-center h-28 bg-gray-100 rounded">
          <div class="bg-pink-500 text-white px-3 py-2 rounded text-sm">垂直居中</div>
        </div>
      </div>
      <!-- 方式3：grid place-items-center（更简洁） -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-1">grid place-items-center</p>
        <div class="grid place-items-center h-28 bg-gray-100 rounded">
          <div class="bg-pink-500 text-white px-3 py-2 rounded text-sm">居中</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ 区块 6：导航栏（justify-between 实战） ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑥ 导航栏实战（justify-between）</h2>
    <p class="text-sm text-gray-500 mb-4">Logo 左 + 菜单右：父 justify-between，菜单内部 flex gap。</p>

    <!-- 导航栏：flex items-center justify-between，左右两端对齐 -->
    <nav class="flex items-center justify-between bg-gray-800 px-6 py-3 rounded-lg">
      <!-- 左侧 Logo：flex items-center 让图标和文字垂直居中 -->
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold">T</div>
        <span class="text-white font-semibold">Tailwind</span>
      </div>
      <!-- 右侧菜单：flex gap-6 间距 1.5rem -->
      <div class="flex items-center gap-6">
        <a href="#" class="text-gray-300 hover:text-white text-sm">首页</a>
        <a href="#" class="text-gray-300 hover:text-white text-sm">文档</a>
        <a href="#" class="text-gray-300 hover:text-white text-sm">示例</a>
        <!-- 按钮：bg-blue-500 hover:bg-blue-600 -->
        <button class="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1.5 rounded transition-colors">登录</button>
      </div>
    </nav>
  </section>

  <!-- ============ 区块 7：响应式 flex-col md:flex-row ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑦ 响应式 flex-col md:flex-row</h2>
    <p class="text-sm text-gray-500 mb-4">手机垂直堆叠，桌面（≥768px）水平排列。缩窄浏览器看变化。</p>

    <!-- 响应式布局：flex-col 手机垂直，md:flex-row 桌面水平，gap-4 间距 -->
    <div class="flex flex-col md:flex-row gap-4">
      <!-- 侧栏：md:w-1/3 桌面占 1/3 宽，手机全宽 -->
      <div class="md:w-1/3 bg-amber-100 border border-amber-200 p-4 rounded-lg">
        <h3 class="font-semibold text-amber-800 mb-2">侧栏</h3>
        <p class="text-sm text-amber-700">手机在上，桌面在左。md:w-1/3 在桌面占 1/3 宽。</p>
      </div>
      <!-- 主内容：md:flex-1 桌面拿剩余空间 -->
      <div class="md:flex-1 bg-amber-50 border border-amber-200 p-4 rounded-lg">
        <h3 class="font-semibold text-amber-800 mb-2">主内容</h3>
        <p class="text-sm text-amber-700">这是主内容区。md:flex-1 在桌面拿走侧栏之外的剩余空间。在手机上则垂直堆叠在侧栏下方。</p>
      </div>
    </div>
  </section>

  <!-- ============ 区块 8：flex-wrap 换行 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑧ flex-wrap 换行（标签云）</h2>
    <p class="text-sm text-gray-500 mb-4">flex-wrap 让装不下的子元素自动换行。gap 保证行列间距一致。</p>

    <!-- 标签云：flex flex-wrap 允许换行，gap-2 行列间距都 0.5rem -->
    <div class="flex flex-wrap gap-2">
      <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">JavaScript</span>
      <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">TypeScript</span>
      <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">React</span>
      <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Vue</span>
      <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Next.js</span>
      <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Tailwind CSS</span>
      <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Node.js</span>
      <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Express</span>
      <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">PostgreSQL</span>
      <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Docker</span>
      <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Git</span>
    </div>
  </section>
</div>`,
  },

  // =========================================================
  // 第三章：Grid 网格布局
  // =========================================================
  {
    id: "tw-grid",
    title: "Grid 网格布局",
    icon: "🔲",
    group: "排版与布局",
    content: `## Grid vs Flexbox：何时用哪个

**Flexbox** 是**一维布局**——它擅长在一条线（行或列）上排列元素。当你有"一行按钮"、"一列菜单"、"导航栏左 logo 右菜单"这类需求，Flexbox 是首选。

**Grid** 是**二维布局**——它同时控制行和列，擅长把内容排成**矩阵**。当你有"卡片网格"、"相册"、"表格布局"、"侧边栏 + 主内容 + 右栏"这类需要行列对齐的需求，Grid 是首选。

一个简单的判断法：

| 场景 | 选择 | 理由 |
| --- | --- | --- |
| 一行按钮、一组标签 | **Flex** | 一维，主轴方向排列 |
| 导航栏、工具条 | **Flex** | 一行内的对齐和分布 |
| 卡片网格（2/3/4 列） | **Grid** | 二维矩阵，行列对齐 |
| 表单（标签+输入框两列） | **Grid** | 列宽固定，整齐 |
| 整页布局（header/sidebar/main/footer） | **Grid** | 行列结构清晰 |
| 不确定数量的卡片自动换行 | **Grid**（或 flex-wrap） | grid 自动填充更整齐 |

> 💡 **实战经验**：现代 Web **80% 用 Flex，20% 用 Grid**。但那 20% 用 Grid 的场景（卡片网格、复杂页面布局）用 Flex 会很别扭。两者互补，不是替代关系。**嵌套使用**很常见：外层 Grid 做页面骨架，内层 Flex 做卡片内部对齐。

## 启用 Grid：grid / inline-grid

| 类名 | display | 含义 |
| --- | --- | --- |
| \`grid\` | \`display: grid\` | 块级网格容器（独占一行） |
| \`inline-grid\` | \`display: inline-grid\` | 行内网格容器（不独占行） |

和 Flex 类似，父元素设 \`grid\` 变成网格容器，**直接子元素**变成网格项目。但 Grid 不需要 \`flex-direction\`——它直接定义"几行几列"。

## grid-template-columns：定义列

这是 Grid 最核心的属性。\`grid-cols-{n}\` 定义 n 列等宽网格（n = 1~12）：

| 类名 | 等价 CSS | 含义 |
| --- | --- | --- |
| \`grid-cols-1\` | \`grid-template-columns: repeat(1, minmax(0, 1fr))\` | 1 列等宽 |
| \`grid-cols-2\` | repeat(2, ...) | 2 列等宽 |
| ... | ... | ... |
| \`grid-cols-6\` | repeat(6, ...) | 6 列等宽（常用） |
| ... | ... | ... |
| \`grid-cols-12\` | repeat(12, ...) | 12 列（复杂布局基础） |
| \`grid-cols-none\` | \`none\` | 移除列定义 |

\`\`\`html
<!-- 3 列等宽卡片网格 -->
<div class="grid grid-cols-3 gap-4">
  <div>卡片1</div>
  <div>卡片2</div>
  <div>卡片3</div>
</div>
\`\`\`

> 💡 **为什么是 \`minmax(0, 1fr)\` 而不是 \`1fr\`**：这是 Grid 最隐蔽的坑。\`1fr\` 默认最小宽度是 \`auto\`（内容宽度），长内容会撑破列。\`minmax(0, 1fr)\` 把最小宽度设为 0，允许列压缩，避免溢出。Tailwind 的 \`grid-cols-\` 已经用了 \`minmax(0, 1fr)\`，所以你不用操心——但理解原理有助于排查问题。

### 任意列定义：grid-cols-[...]

预设的 1~12 列不够用时，用方括号写任意列定义（下划线 \`_\` 代替空格）：

\`\`\`html
<!-- 固定 200px 侧栏 + 剩余主内容 -->
<div class="grid grid-cols-[200px_minmax(0,1fr)]">
  <aside>侧栏 200px</aside>
  <main>主内容</main>
</div>

<!-- 3 列：1fr 2fr 1fr（中间宽） -->
<div class="grid grid-cols-[1fr_2fr_1fr]">

<!-- 12 列每列 60px 固定 -->
<div class="grid grid-cols-[repeat(12,60px)]">
\`\`\`

任意值是 Grid 的"逃生舱"——预设等宽列不够时，精确控制每列宽度。常见模式：\`[200px_1fr]\`（固定+弹性）、\`[1fr_2fr]\`（比例）、\`[minmax(200px,1fr)_3fr]\`（最小宽+比例）。

## grid-template-rows：定义行

\`grid-rows-{n}\` 定义 n 行（1~6）。**实际用得少**——多数场景行高由内容决定，自动生成行更灵活：

| 类名 | 含义 |
| --- | --- |
| \`grid-rows-1\` ~ \`grid-rows-6\` | 1~6 行等高 |
| \`grid-rows-none\` | 移除行定义 |

任意行：\`grid-rows-[200px_100px_200px]\`。

## gap：行列间距

Grid 的 \`gap\` 和 Flex 一样，但 Grid 是二维的，可分别控制行列间距：

| 类名 | 含义 |
| --- | --- |
| \`gap-{n}\` | 行列间距都是 n |
| \`gap-x-{n}\` | 仅列间距（水平） |
| \`gap-y-{n}\` | 仅行间距（垂直） |

\`\`\`html
<div class="grid grid-cols-3 gap-4">          <!-- 行列都 1rem -->
<div class="grid grid-cols-3 gap-x-8 gap-y-4"> <!-- 列 2rem，行 1rem -->
\`\`\`

## 跨列与跨行：col-span / row-span

这是 Grid 区别于 Flex 的杀手锏——让某个项目**横跨多列/多行**，做出"不规则但整齐"的布局：

### col-span-{n}

\`col-span-{n}\` 让项目横跨 n 列（n = 1~12，\`col-span-full\` 横跨全部列）：

\`\`\`html
<div class="grid grid-cols-3 gap-4">
  <div class="col-span-2">横跨 2 列</div>  <!-- 占 2/3 -->
  <div>占 1 列</div>                        <!-- 占 1/3 -->
  <div class="col-span-3">横跨全部 3 列</div>
</div>
\`\`\`

### row-span-{n}

\`row-span-{n}\` 让项目横跨 n 行：

\`\`\`html
<div class="grid grid-cols-2 gap-4">
  <div class="row-span-2">高一些（跨 2 行）</div>
  <div>普通</div>
  <div>普通</div>
</div>
\`\`\`

### 精确定位：col-start / col-end / row-start / row-end

除了"跨 n 列"，还能精确指定项目从第几列开始、到第几列结束：

| 类名 | 含义 |
| --- | --- |
| \`col-start-{n}\` | 从第 n 列开始（n = 1~13） |
| \`col-end-{n}\` | 到第 n 列结束（不含） |
| \`col-start-auto\` / \`col-end-auto\` | 自动 |
| \`row-start-{n}\` / \`row-end-{n}\` | 行的开始/结束 |
| \`col-auto\` / \`row-auto\` | 自动放置 |

\`\`\`html
<!-- 12 列布局：item1 占 1-5 列，item2 占 6-13 列 -->
<div class="grid grid-cols-12 gap-4">
  <div class="col-start-1 col-end-5">占 1~4 列</div>
  <div class="col-start-5 col-end-13">占 5~12 列</div>
</div>
\`\`\`

\`col-start-{n} col-end-{m}\` 等价于"从第 n 条网格线到第 m 条网格线"。12 列网格有 13 条网格线（编号 1~13）。

> ⚠️ **陷阱**：\`col-end\` 是"结束于第几条线"，不是"跨几列"。比如 \`col-start-1 col-end-3\` 是占第 1、2 列（跨 2 列），因为 end-3 表示在第 3 条线结束（不含第 3 列）。

## grid-flow：自动放置方向

控制项目如何**自动填入**网格：

| 类名 | 含义 |
| --- | --- |
| \`grid-flow-row\`（默认） | 按行填充（先填满第一行，再第二行） |
| \`grid-flow-col\` | 按列填充（先填满第一列，再第二列） |
| \`grid-flow-dense\` | "密集"算法，回填前面留下的空位 |
| \`grid-flow-row-dense\` | 按行 + 密集回填 |
| \`grid-flow-col-dense\` | 按列 + 密集回填 |

\`grid-flow-dense\` 是高级技巧：当某些项目 \`col-span-2\` 在某行装不下时会留下空位，\`dense\` 让后面的小项目"回填"这些空位，使网格更紧凑。代价是项目顺序可能错乱（视觉顺序 ≠ DOM 顺序）。

## auto-cols / auto-rows：隐式轨道尺寸

当项目超出显式定义的行列时，自动生成的轨道（隐式行/列）的尺寸：

| 类名 | 含义 |
| --- | --- |
| \`auto-cols-auto\`（默认） | 自动 |
| \`auto-cols-min\` / \`auto-cols-max\` / \`auto-cols-fr\` | min-content / max-content / 1fr |
| \`auto-rows-{n}\` | 隐式行固定高度（如 \`auto-rows-fr\` 等高） |
| \`auto-rows-min\` / \`auto-rows-max\` | min/max-content |

实际用得少，了解即可。

## 常见布局实战

### 1. 响应式卡片网格（最常用）

\`\`\`html
<!-- 手机 1 列，平板 2 列，桌面 3 列 -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="card">卡片1</div>
  <div class="card">卡片2</div>
  <div class="card">卡片3</div>
  <div class="card">卡片4</div>
</div>
\`\`\`

这是**最经典的卡片网格写法**——一行三个类搞定响应式：\`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3\`。

### 2. 12 列布局（Bento 风格）

\`\`\`html
<div class="grid grid-cols-6 gap-4">
  <div class="col-span-4">大卡片（4/6）</div>
  <div class="col-span-2">小卡片（2/6）</div>
  <div class="col-span-2">小卡片</div>
  <div class="col-span-2">小卡片</div>
  <div class="col-span-2">小卡片</div>
</div>
\`\`\`

Bento Grid（便当盒布局）是近年流行的不规则卡片布局，靠 \`col-span\` + \`row-span\` 组合实现。

### 3. 侧边栏 + 主内容

\`\`\`html
<!-- 固定 240px 侧栏 + 弹性主内容 -->
<div class="grid grid-cols-[240px_1fr] gap-6">
  <aside>侧栏</aside>
  <main>主内容</main>
</div>

<!-- 响应式：手机上下，桌面左右 -->
<div class="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
  <aside>侧栏</aside>
  <main>主内容</main>
</div>
\`\`\`

### 4. 经典页眉/主体/页脚

\`\`\`html
<div class="grid grid-rows-[auto_1fr_auto] min-h-screen">
  <header>页眉</header>
  <main>主体（占满剩余高度）</main>
  <footer>页脚</footer>
</div>
\`\`\`

\`grid-rows-[auto_1fr_auto]\`：页眉页脚按内容高，主体占满中间。

## Grid 常见陷阱

1. **\`1fr\` 默认 \`min-width: auto\`**：长内容撑破列。Tailwind 的 \`grid-cols-\` 已用 \`minmax(0, 1fr)\` 规避，但任意值 \`grid-cols-[1fr_1fr]\` 要小心，建议写 \`grid-cols-[minmax(0,1fr)_minmax(0,1fr)]\`。
2. **\`col-end\` 是网格线编号**：12 列网格 \`col-end\` 范围 1~13，不是 1~12。
3. **跨列越界**：\`col-span-5\` 在 \`grid-cols-3\` 里会溢出到下一行。计算好列数。
4. **响应式断点列数**：\`grid-cols-1 md:grid-cols-3\` 是标准写法，但要注意卡片数量——3 列网格放 4 个卡片，最后一行只有 1 个，左对齐留空。
5. **\`grid-flow-dense\` 打乱顺序**：视觉顺序可能 ≠ DOM 顺序，影响可访问性。
6. **Grid 不是 Flex**：不要用 Grid 做"一行按钮"（Flex 的 \`justify-*\` 更直接）。Grid 没有 \`justify-center\` 那么直观的水平居中（要用 \`justify-items-center\`）。

## Grid 的对齐属性（补充）

Grid 也有对齐属性，比 Flex 多一层（因为 Grid 是二维的）：

| 类名 | 作用对象 | 含义 |
| --- | --- | --- |
| \`justify-items-{start/center/end/stretch}\` | 单个项目在**列**（水平）方向 | 水平对齐每个项目 |
| \`align-items-{start/center/end/stretch}\` | 单个项目在**行**（垂直）方向 | 垂直对齐每个项目 |
| \`justify-content-{start/center/...}\` | 整个网格在容器水平方向 | 网格整体水平对齐 |
| \`align-content-{start/center/...}\` | 整个网格在容器垂直方向 | 网格整体垂直对齐 |
| \`place-items-center\` | 简写 | \`justify-items-center align-items-center\`（项目在格子里居中） |
| \`place-content-center\` | 简写 | 整个网格居中 |

**最常用**：\`place-items-center\`——让每个项目在自己的格子里水平和垂直都居中。这是做"图标网格"、"头像矩阵"的利器。

## 动手试试

下面的演示覆盖了 \`grid-cols\` 各种、\`col-span\` 跨列、响应式 \`grid-cols-1 md:grid-cols-2 lg:grid-cols-3\`、12 列布局、侧边栏布局、\`place-items-center\`。修改任意 class 后点"运行"查看效果，缩窄浏览器看响应式变化。`,
    code: `<!-- ============================================================ -->
<!-- 第三章演示：Grid 网格布局全览                                   -->
<!-- 包含：grid-cols / col-span / 响应式网格 / 12 列布局 /          -->
<!--       侧边栏布局 / place-items-center                          -->
<!-- ============================================================ -->

<!-- 外层容器：max-w-4xl 最大宽 56rem，mx-auto 居中，p-6 内边距，space-y-10 子元素间距 -->
<div class="max-w-4xl mx-auto p-6 space-y-10">

  <!-- ============ 区块 1：grid-cols 列数对比 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">① grid-cols 列数对比</h2>
    <p class="text-sm text-gray-500 mb-4">grid-cols-2 / 3 / 4。每个格子 h-16 固定高度，gap-2 间距。</p>

    <!-- grid-cols-2：两列等宽 -->
    <p class="text-xs font-semibold text-gray-500 mb-1">grid-cols-2：</p>
    <div class="grid grid-cols-2 gap-2 mb-3">
      <div class="bg-blue-500 text-white h-16 flex items-center justify-center rounded text-sm">1</div>
      <div class="bg-blue-500 text-white h-16 flex items-center justify-center rounded text-sm">2</div>
      <div class="bg-blue-500 text-white h-16 flex items-center justify-center rounded text-sm">3</div>
      <div class="bg-blue-500 text-white h-16 flex items-center justify-center rounded text-sm">4</div>
    </div>

    <!-- grid-cols-3：三列等宽 -->
    <p class="text-xs font-semibold text-gray-500 mb-1">grid-cols-3：</p>
    <div class="grid grid-cols-3 gap-2 mb-3">
      <div class="bg-emerald-500 text-white h-16 flex items-center justify-center rounded text-sm">1</div>
      <div class="bg-emerald-500 text-white h-16 flex items-center justify-center rounded text-sm">2</div>
      <div class="bg-emerald-500 text-white h-16 flex items-center justify-center rounded text-sm">3</div>
      <div class="bg-emerald-500 text-white h-16 flex items-center justify-center rounded text-sm">4</div>
      <div class="bg-emerald-500 text-white h-16 flex items-center justify-center rounded text-sm">5</div>
      <div class="bg-emerald-500 text-white h-16 flex items-center justify-center rounded text-sm">6</div>
    </div>

    <!-- grid-cols-4：四列等宽 -->
    <p class="text-xs font-semibold text-gray-500 mb-1">grid-cols-4：</p>
    <div class="grid grid-cols-4 gap-2">
      <div class="bg-purple-500 text-white h-16 flex items-center justify-center rounded text-sm">1</div>
      <div class="bg-purple-500 text-white h-16 flex items-center justify-center rounded text-sm">2</div>
      <div class="bg-purple-500 text-white h-16 flex items-center justify-center rounded text-sm">3</div>
      <div class="bg-purple-500 text-white h-16 flex items-center justify-center rounded text-sm">4</div>
      <div class="bg-purple-500 text-white h-16 flex items-center justify-center rounded text-sm">5</div>
      <div class="bg-purple-500 text-white h-16 flex items-center justify-center rounded text-sm">6</div>
      <div class="bg-purple-500 text-white h-16 flex items-center justify-center rounded text-sm">7</div>
      <div class="bg-purple-500 text-white h-16 flex items-center justify-center rounded text-sm">8</div>
    </div>
  </section>

  <!-- ============ 区块 2：col-span 跨列 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">② col-span 跨列</h2>
    <p class="text-sm text-gray-500 mb-4">让某些项目横跨多列，做不规则但整齐的布局（Bento 风格）。</p>

    <!-- grid-cols-3 基础上：第一个跨 2 列，第二个占 1 列，第三个跨全部 -->
    <div class="grid grid-cols-3 gap-2">
      <!-- col-span-2：横跨 2 列（占 2/3） -->
      <div class="col-span-2 bg-rose-500 text-white h-20 flex items-center justify-center rounded text-sm">col-span-2（占 2/3）</div>
      <!-- 默认占 1 列 -->
      <div class="bg-rose-400 text-white h-20 flex items-center justify-center rounded text-sm">占 1 列</div>
      <!-- col-span-3：横跨全部 3 列 -->
      <div class="col-span-3 bg-rose-600 text-white h-20 flex items-center justify-center rounded text-sm">col-span-3（横跨全部）</div>
      <!-- 各占 1 列 -->
      <div class="bg-rose-400 text-white h-20 flex items-center justify-center rounded text-sm">1</div>
      <div class="bg-rose-400 text-white h-20 flex items-center justify-center rounded text-sm">2</div>
      <div class="bg-rose-400 text-white h-20 flex items-center justify-center rounded text-sm">3</div>
    </div>
  </section>

  <!-- ============ 区块 3：row-span 跨行 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">③ row-span 跨行</h2>
    <p class="text-sm text-gray-500 mb-4">让某些项目横跨多行，做出"高低错落"的布局。</p>

    <!-- grid-cols-3 + 第一个 row-span-2：第一个项目跨 2 行，比其他高 -->
    <div class="grid grid-cols-3 gap-2">
      <!-- row-span-2：横跨 2 行（高度是其他两倍） -->
      <div class="row-span-2 bg-cyan-600 text-white flex items-center justify-center rounded text-sm">row-span-2</div>
      <div class="bg-cyan-400 text-white h-20 flex items-center justify-center rounded text-sm">普通</div>
      <div class="bg-cyan-400 text-white h-20 flex items-center justify-center rounded text-sm">普通</div>
      <div class="bg-cyan-400 text-white h-20 flex items-center justify-center rounded text-sm">普通</div>
      <div class="bg-cyan-400 text-white h-20 flex items-center justify-center rounded text-sm">普通</div>
    </div>
  </section>

  <!-- ============ 区块 4：响应式卡片网格（最常用） ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">④ 响应式卡片网格（最常用）</h2>
    <p class="text-sm text-gray-500 mb-4">grid-cols-1 sm:grid-cols-2 lg:grid-cols-3。缩窄浏览器看变化。</p>

    <!-- 响应式卡片网格：手机 1 列、平板 2 列、桌面 3 列，gap-4 间距 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- 每个卡片：bg-white 白底，shadow 阴影，rounded-lg 圆角，p-4 内边距 -->
      <div class="bg-white shadow rounded-lg p-4 border border-gray-100">
        <div class="w-10 h-10 bg-blue-500 rounded mb-3"></div>
        <h3 class="font-semibold text-gray-800 mb-1">卡片 1</h3>
        <p class="text-sm text-gray-500">响应式网格，手机 1 列、平板 2 列、桌面 3 列。</p>
      </div>
      <div class="bg-white shadow rounded-lg p-4 border border-gray-100">
        <div class="w-10 h-10 bg-emerald-500 rounded mb-3"></div>
        <h3 class="font-semibold text-gray-800 mb-1">卡片 2</h3>
        <p class="text-sm text-gray-500">一行三个类搞定响应式：grid-cols-1 sm:grid-cols-2 lg:grid-cols-3。</p>
      </div>
      <div class="bg-white shadow rounded-lg p-4 border border-gray-100">
        <div class="w-10 h-10 bg-amber-500 rounded mb-3"></div>
        <h3 class="font-semibold text-gray-800 mb-1">卡片 3</h3>
        <p class="text-sm text-gray-500">这种写法是卡片列表、商品展示、博客文章的标准模式。</p>
      </div>
      <div class="bg-white shadow rounded-lg p-4 border border-gray-100">
        <div class="w-10 h-10 bg-rose-500 rounded mb-3"></div>
        <h3 class="font-semibold text-gray-800 mb-1">卡片 4</h3>
        <p class="text-sm text-gray-500">第四个卡片在桌面会换到第二行第一个位置。</p>
      </div>
      <div class="bg-white shadow rounded-lg p-4 border border-gray-100">
        <div class="w-10 h-10 bg-indigo-500 rounded mb-3"></div>
        <h3 class="font-semibold text-gray-800 mb-1">卡片 5</h3>
        <p class="text-sm text-gray-500">最后一行如果不满 3 个，会左对齐留空。</p>
      </div>
      <div class="bg-white shadow rounded-lg p-4 border border-gray-100">
        <div class="w-10 h-10 bg-cyan-500 rounded mb-3"></div>
        <h3 class="font-semibold text-gray-800 mb-1">卡片 6</h3>
        <p class="text-sm text-gray-500">第六个卡片刚好填满第二行。</p>
      </div>
    </div>
  </section>

  <!-- ============ 区块 5：12 列布局（Bento 风格） ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑤ 12 列布局（Bento 风格）</h2>
    <p class="text-sm text-gray-500 mb-4">grid-cols-6 基础上用 col-span 做不规则卡片，类似 macOS 便当盒。</p>

    <!-- Bento Grid：grid-cols-6，用 col-span 做大小不一的卡片 -->
    <div class="grid grid-cols-6 gap-3">
      <!-- 大卡片：col-span-4 占 4/6 宽 -->
      <div class="col-span-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-5 rounded-xl h-32 flex flex-col justify-end">
        <h3 class="text-lg font-bold">主推卡片</h3>
        <p class="text-sm text-indigo-100">col-span-4 占 4/6 宽度</p>
      </div>
      <!-- 小卡片：col-span-2 占 2/6 -->
      <div class="col-span-2 bg-gray-800 text-white p-5 rounded-xl h-32 flex flex-col justify-end">
        <h3 class="text-lg font-bold">副卡片</h3>
        <p class="text-sm text-gray-400">col-span-2 占 2/6</p>
      </div>
      <!-- 第二行：三个 col-span-2 -->
      <div class="col-span-2 bg-emerald-500 text-white p-4 rounded-xl h-24 flex flex-col justify-end">
        <h3 class="font-bold">指标 A</h3>
        <p class="text-xs text-emerald-100">col-span-2</p>
      </div>
      <div class="col-span-2 bg-amber-500 text-white p-4 rounded-xl h-24 flex flex-col justify-end">
        <h3 class="font-bold">指标 B</h3>
        <p class="text-xs text-amber-100">col-span-2</p>
      </div>
      <div class="col-span-2 bg-rose-500 text-white p-4 rounded-xl h-24 flex flex-col justify-end">
        <h3 class="font-bold">指标 C</h3>
        <p class="text-xs text-rose-100">col-span-2</p>
      </div>
    </div>
  </section>

  <!-- ============ 区块 6：侧边栏 + 主内容（任意值列） ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑥ 侧边栏 + 主内容（任意值列）</h2>
    <p class="text-sm text-gray-500 mb-4">grid-cols-[240px_1fr] 固定侧栏 + 弹性主内容。响应式：手机上下，桌面左右。</p>

    <!-- 任意值列定义：grid-cols-[240px_1fr]，手机单列，桌面两列 -->
    <div class="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
      <!-- 侧栏：固定 240px 宽，bg-gray-100 浅灰底 -->
      <aside class="bg-gray-100 border border-gray-200 p-4 rounded-lg">
        <h3 class="font-semibold text-gray-800 mb-3">侧栏菜单</h3>
        <ul class="space-y-2 text-sm text-gray-600">
          <li class="text-blue-600 font-medium">概览</li>
          <li>数据分析</li>
          <li>用户管理</li>
          <li>系统设置</li>
        </ul>
      </aside>
      <!-- 主内容：flex-1 拿剩余空间 -->
      <main class="bg-white border border-gray-200 p-4 rounded-lg">
        <h3 class="font-semibold text-gray-800 mb-2">主内容区</h3>
        <p class="text-sm text-gray-600 leading-relaxed">这是主内容区，使用 grid-cols-[240px_1fr] 让侧栏固定 240px 宽，主内容自动占据剩余空间。在 lg 断点以下变成单列，侧栏在上、主内容在下，适合移动端浏览。</p>
      </main>
    </div>
  </section>

  <!-- ============ 区块 7：place-items-center 图标网格 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑦ place-items-center（格子内居中）</h2>
    <p class="text-sm text-gray-500 mb-4">让每个项目在自己的格子里水平和垂直都居中，适合图标矩阵。</p>

    <!-- place-items-center：每个 emoji 在自己的格子里居中 -->
    <div class="grid grid-cols-5 gap-3 place-items-center">
      <div class="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">📱</div>
      <div class="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">💻</div>
      <div class="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">🖥️</div>
      <div class="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">⌨️</div>
      <div class="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">🖱️</div>
      <div class="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center text-2xl">🎧</div>
      <div class="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center text-2xl">📷</div>
      <div class="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center text-2xl">🕹️</div>
      <div class="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center text-2xl">💾</div>
      <div class="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center text-2xl">📡</div>
    </div>
  </section>

  <!-- ============ 区块 8：col-start 精确定位 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑧ col-start 精确定位（12 列网格）</h2>
    <p class="text-sm text-gray-500 mb-4">12 列网格 + col-start/col-end 精确控制每个项目的列范围。</p>

    <!-- 12 列网格：用 col-start-N col-end-M 精确定位 -->
    <div class="grid grid-cols-12 gap-2">
      <!-- col-start-1 col-end-5：占第 1~4 列（4 格宽） -->
      <div class="col-start-1 col-end-5 bg-indigo-500 text-white h-12 flex items-center justify-center rounded text-xs">1~4 (4格)</div>
      <!-- col-start-5 col-end-13：占第 5~12 列（8 格宽） -->
      <div class="col-start-5 col-end-13 bg-indigo-600 text-white h-12 flex items-center justify-center rounded text-xs">5~12 (8格)</div>
      <!-- 第二行：3 等分 -->
      <div class="col-start-1 col-end-5 bg-pink-500 text-white h-12 flex items-center justify-center rounded text-xs">1~4</div>
      <div class="col-start-5 col-end-9 bg-pink-500 text-white h-12 flex items-center justify-center rounded text-xs">5~8</div>
      <div class="col-start-9 col-end-13 bg-pink-500 text-white h-12 flex items-center justify-center rounded text-xs">9~12</div>
    </div>
  </section>
</div>`,
  },

  // =========================================================
  // 第四章：定位与层叠
  // =========================================================
  {
    id: "tw-positioning",
    title: "定位与层叠",
    icon: "📍",
    group: "排版与布局",
    content: `## 定位（position）的本质

到目前为止我们学的布局（Flow、Flex、Grid）都是**普通流（normal flow）**——元素按 DOM 顺序、按布局规则"老老实实"地排列。但有些 UI 元素**必须脱离普通流**：

- **工具提示（tooltip）**：鼠标悬停按钮时弹出的小气泡，不能挤开其他元素。
- **模态框（modal）**：覆盖整个屏幕的弹窗，居中显示。
- **返回顶部按钮**：固定在屏幕右下角，滚动时不移动。
- **粘性导航栏**：滚动到顶部时"贴住"不动。
- **徽章**：小角标贴在卡片右上角。

这些都需要 **\`position\`** 属性。Tailwind 提供了 5 种定位模式，每种配合 \`top/right/bottom/left/inset\` 精确控制位置。本章将**逐一深入**讲解，配大量实战示例和层叠陷阱。

## 五种定位模式：position-{value}

| 类名 | position | 行为 |
| --- | --- | --- |
| \`static\`（默认） | 静态 | 普通流，\`top/left\` 等无效 |
| \`relative\` | 相对 | 相对**自己原本的位置**偏移，**不脱离流** |
| \`absolute\` | 绝对 | 脱离流，相对**最近的非 static 祖先**定位 |
| \`fixed\` | 固定 | 脱离流，相对**视口（浏览器窗口）**定位，滚动不动 |
| \`sticky\` | 粘性 | 普通流 + 滚动到阈值时变 fixed |

### static（默认）

\`position: static\` 是默认值，元素在普通流中。**几乎所有元素默认都是 static**，你不需要显式写 \`static\`，除非要覆盖之前设的定位。

\`static\` 元素的 \`top/right/bottom/left/z-index\` **全部无效**。

### relative：相对定位（不脱离流）

\`relative\` 让元素相对**自己原本在流中的位置**偏移。**关键：它仍然占据原来的空间**，不会让其他元素"补位"。

\`\`\`html
<div class="relative top-4 left-4">
  我向下右各偏移 1rem，但原来的位置仍为我保留（其他元素不会补上来）。
</div>
\`\`\`

\`relative\` 最常见的用途**不是真的偏移**，而是**作为 absolute 子元素的定位参照**——这是下文的黄金组合。

### absolute：绝对定位（脱离流）

\`absolute\` 让元素**完全脱离普通流**（其他元素当它不存在，会补位），并相对**最近的非 static 祖先**定位。如果所有祖先都是 static，则相对**初始包含块**（通常是 \`<body>\` 或最近的定位祖先）。

\`\`\`html
<div class="relative">  <!-- 父：relative，作为参照 -->
  <div class="absolute top-0 right-0">  <!-- 子：absolute，相对父的右上角 -->
    我贴在父容器右上角
  </div>
</div>
\`\`\`

> 💡 **黄金组合**：\`relative\`（父）+ \`absolute\`（子）是定位的核心模式。父设 \`relative\` 不偏移（只作参照），子设 \`absolute\` + \`top/right/...\` 精确定位。**做 tooltip、徽章、下拉菜单的第一步永远是给父加 \`relative\`**。

> ⚠️ **必踩坑**：忘记给父加 \`relative\`，子 \`absolute\` 会"飞"到整页的某个角落（相对 body 定位），而不是父容器。这是新手最常见的定位 bug。

### fixed：固定定位（相对视口）

\`fixed\` 让元素脱离流，相对**浏览器视口**定位。**滚动页面时它不动**——这就是"返回顶部按钮"、"固定导航栏"的原理。

\`\`\`html
<button class="fixed bottom-4 right-4">
  我固定在屏幕右下角，滚动也不动
</button>
\`\`\`

> ⚠️ **现代坑**：如果祖先有 \`transform\`、\`filter\`、\`will-change\` 等属性，\`fixed\` 会相对那个祖先而非视口定位（CSS 规范如此）。如果你发现 \`fixed\` 不"粘"在屏幕上了，检查祖先有没有这些属性。

### sticky：粘性定位（流 + fixed 混合）

\`sticky\` 是最有意思的定位——元素在普通流中正常显示，但当滚动到设定的阈值（\`top-\` 等）时，**变成 fixed 贴住**，直到父容器滚出视口才"释放"。

\`\`\`html
<nav class="sticky top-0">
  我正常在流里，但滚动到顶部 0 时贴住不动，直到父容器滚走。
</nav>
\`\`\`

**经典用途**：表格表头（滚动时表头贴顶）、章节标题（滚动到时贴顶）、侧边栏目录。

> ⚠️ **sticky 陷阱**：
> 1. 必须配合 \`top-\`/\`bottom-\` 等阈值，否则不生效（\`sticky\` 没阈值就退化成 \`relative\`）。
> 2. 父容器不能 \`overflow: hidden\`/\`overflow: auto\`，否则 sticky 失效（滚动容器变成了父，不是视口）。
> 3. 父容器高度必须足够（如果父只有 sticky 元素那么高，sticky 没空间"贴"）。

## 偏移属性：top / right / bottom / left / inset

定位模式下用这些属性控制偏移：

| 类名 | 含义 |
| --- | --- |
| \`top-{n}\` | 距顶部 n（向下偏移） |
| \`right-{n}\` | 距右侧 n |
| \`bottom-{n}\` | 距底部 n |
| \`left-{n}\` | 距左侧 n |
| \`inset-0\` | 四向都 0（铺满父容器） |
| \`inset-x-0\` | 左右都 0（水平铺满） |
| \`inset-y-0\` | 上下都 0（垂直铺满） |
| \`inset-{n}\` | 四向都 n |
| \`top-auto\` / \`inset-auto\` | 自动（重置） |

\`n\` 用 spacing 刻度（0/1/2/4/8...），也支持 \`1/2\`（50%）、\`full\`（100%）、任意值 \`top-[120px]\`。

**经典用法**：\`absolute inset-0\` —— 让绝对定位元素铺满父容器（四向都贴边）。常用于遮罩层、覆盖层。

\`\`\`html
<!-- 遮罩：absolute inset-0 + 半透明黑 -->
<div class="relative">
  <img src="...">
  <div class="absolute inset-0 bg-black/50"></div>  <!-- 半透明黑遮罩铺满 -->
</div>
\`\`\`

## z-index：层叠顺序

\`z-{n}\` 控制定位元素（非 static）的层叠顺序，数值越大越在上层：

| 类名 | z-index | 用途 |
| --- | --- | --- |
| \`z-0\` | 0 | 基准 |
| \`z-10\` | 10 | 下拉菜单、tooltip |
| \`z-20\` | 20 | sticky 导航 |
| \`z-30\` | 30 | 固定头 |
| \`z-40\` | 40 | 抽屉 |
| \`z-50\` | 50 | 模态框（最上层） |
| \`z-auto\` | auto | 默认（等于父） |

Tailwind 预设了 0/10/20/30/40/50 几档，足以覆盖大多数场景。需要更多用任意值 \`z-[100]\`。

> ⚠️ **z-index 三大陷阱**：
> 1. **只对定位元素生效**：\`z-50\` 写在 \`position: static\` 元素上**完全无效**。必须先 \`relative\`/\`absolute\`/...
> 2. **层叠上下文**：\`z-index\` 只在**同一个层叠上下文**里比较。如果父元素创建了新的层叠上下文（有 z-index + 定位、或 transform、opacity<1 等），子的 z-index 只在父内部比较，**无法跨父比较**。这是"为什么我的 z-50 模态框被别人的 z-10 遮住"的元凶。
> 3. **数值滥用**：不要动不动 \`z-[9999]\`。用预设档位（10/20/.../50）建立语义层级，模态框永远 \`z-50\`，导航 \`z-30\`。

## 浮动：float（基本弃用）

\`float\` 是 CSS 早期的环绕排版方式（让文字环绕图片），现代布局几乎不用：

| 类名 | 含义 |
| --- | --- |
| \`float-left\` | 左浮动 |
| \`float-right\` | 右浮动 |
| \`float-none\` | 不浮动（默认） |
| \`clear-left\` / \`clear-right\` / \`clear-both\` | 清除浮动 |

> 💡 **现代建议**：\`float\` 在 Flex/Grid 时代基本弃用，唯一保留的用途是"文字环绕图片"（报纸式排版）。其他场景一律用 Flex/Grid。

\`\`\`html
<!-- 文字环绕图片（float 仍合理） -->
<div class="p-4">
  <img src="..." class="float-left mr-4 mb-2 w-32 rounded">
  <p>这段文字会环绕在图片右侧……</p>
</div>
\`\`\`

## 显示与隐藏：display 系列

| 类名 | display | 用途 |
| --- | --- | --- |
| \`block\` | 块级（独占行） | \`<div>\` 默认 |
| \`inline\` | 行内（不独占行，宽高无效） | \`<span>\` 默认 |
| \`inline-block\` | 行内块（不独占行，宽高有效） | 按钮、徽章 |
| \`hidden\` | \`none\`（完全移除，不占空间） | 隐藏元素 |
| \`flex\` / \`inline-flex\` | 弹性 | 见 Flexbox 章 |
| \`grid\` / \`inline-grid\` | 网格 | 见 Grid 章 |
| \`contents\` | 容器"消失"，子元素提升 | 高级技巧 |

### hidden vs 响应式隐藏

\`hidden\` 完全隐藏元素（\`display: none\`，不占空间）。结合响应式前缀做"特定屏幕隐藏"：

\`\`\`html
<div class="hidden md:block">手机隐藏，桌面显示</div>
<div class="block md:hidden">手机显示，桌面隐藏</div>
\`\`\`

这是做"汉堡菜单"（手机显示）/ "完整菜单"（桌面显示）切换的标准写法。

### block vs inline vs inline-block

| 类型 | 独占行 | 可设宽高 | 默认宽度 | 例子 |
| --- | --- | --- | --- | --- |
| \`block\` | 是 | 是 | 父容器宽 | \`<div>\` \`<p>\` \`<h1>\` |
| \`inline\` | 否 | **否** | 内容宽 | \`<span>\` \`<a>\` |
| \`inline-block\` | 否 | 是 | 内容宽 | 按钮、徽章 |

> ⚠️ **inline 陷阱**：\`inline\` 元素设置 \`width\`/\`height\`/\`margin-top\`/\`margin-bottom\` **无效**！想给行内元素设宽高，改用 \`inline-block\` 或 \`flex\`。

## 对象适配：object-{fit}

\`object-fit\` 控制 \`<img>\`/\`<video>\` 等替换元素如何填充其容器：

| 类名 | object-fit | 行为 |
| --- | --- | --- |
| \`object-contain\` | contain | 完整显示，可能留白（不裁切） |
| \`object-cover\` | cover | 填满容器，可能裁切（最常用） |
| \`object-fill\` | fill | 拉伸填满（变形） |
| \`object-none\` | none | 原始尺寸，可能溢出 |
| \`object-scale-down\` | scale-down | 取 none/contain 较小者 |

**最常用**：\`object-cover\`——做"头像"、"卡片封面图"的标配，让图片填满固定尺寸容器且不变形：

\`\`\`html
<div class="w-24 h-24 rounded-full overflow-hidden">
  <img src="..." class="w-full h-full object-cover">
</div>
\`\`\`

配合 \`object-{position}\`（\`object-center\`/\`object-top\`/...）控制裁切焦点。

## overflow：溢出控制

控制内容超出容器时的处理：

| 类名 | 含义 |
| --- | --- |
| \`overflow-visible\`（默认） | 溢出可见（内容显示在容器外） |
| \`overflow-hidden\` | 溢出隐藏（裁切） |
| \`overflow-scroll\` | 始终显示滚动条 |
| \`overflow-auto\` | 需要时才显示滚动条 |
| \`overflow-x-{visible/hidden/scroll/auto}\` | 仅水平方向 |
| \`overflow-y-{...}\` | 仅垂直方向 |

**经典用途**：

1. \`overflow-hidden\` + \`rounded-\`：让圆角裁切内部图片（否则图片会"戳出"圆角）。
2. \`overflow-auto\`：长内容区域可滚动（代码块、表格、聊天记录）。
3. \`overflow-x-auto\`：横向滚动表格/卡片轮播。
4. \`overflow-hidden\` 清除浮动（现代用 \`clearfix\` 或 Flex 替代）。

\`\`\`html
<!-- 圆角 + 溢出隐藏：图片不会戳出圆角 -->
<div class="rounded-lg overflow-hidden">
  <img src="..." class="w-full">
</div>

<!-- 可滚动区域：固定高度 + overflow-auto -->
<div class="h-48 overflow-auto">
  长内容...
</div>
\`\`\`

> ⚠️ **陷阱**：\`overflow-hidden\` 会**裁切 absolute 子元素**！如果 absolute 子元素超出父容器，会被裁掉。做"tooltip 溢出父容器显示"时，父不能 \`overflow-hidden\`。同时 \`overflow: auto/hidden/scroll\` 会**破坏 \`position: sticky\`**（前面提过）。

## 实战陷阱与最佳实践

1. **absolute 必须配 relative 父**：否则会相对 body 飞走。
2. **z-index 只对定位元素生效**：先 \`relative\` 再 \`z-50\`。
3. **层叠上下文跨父不比较**：父有 z-index/transform/opacity<1 会创建新上下文。
4. **sticky 父不能 overflow-auto**：会失效。
5. **overflow-hidden 裁切 absolute**：tooltip 场景慎用。
6. **inline 设宽高无效**：改 inline-block 或 flex。
7. **fixed 被 transform 破坏**：检查祖先有无 transform/filter。
8. **模态框 z-50**：建立语义化 z-index 体系，别滥用 z-[9999]。

## 动手试试

下面的演示覆盖了 \`relative+absolute\` 工具提示、\`fixed\` 返回顶部按钮、\`sticky\` 导航栏、\`z-index\` 层叠、\`overflow\` 滚动区、\`object-cover\` 图片裁切、显示隐藏。修改任意 class 后点"运行"查看效果。`,
    code: `<!-- ============================================================ -->
<!-- 第四章演示：定位与层叠全览                                      -->
<!-- 包含：relative+absolute tooltip / fixed 返回顶部 /            -->
<!--       sticky 导航 / z-index 层叠 / overflow 滚动 /             -->
<!--       object-cover 图片裁切 / 显示隐藏                          -->
<!-- ============================================================ -->

<!-- 外层容器：max-w-4xl 最大宽 56rem，mx-auto 居中，p-6 内边距，space-y-10 子元素间距 -->
<div class="max-w-4xl mx-auto p-6 space-y-10">

  <!-- ============ 区块 1：relative + absolute 工具提示 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">① relative + absolute（工具提示 / 徽章）</h2>
    <p class="text-sm text-gray-500 mb-4">父 relative 作参照，子 absolute 精确定位。徽章贴右上角，tooltip 贴下方。</p>

    <!-- 卡片带徽章：父 relative，徽章 absolute top-0 right-0 -->
    <div class="grid grid-cols-2 gap-4">
      <!-- 卡片1：右上角徽章 -->
      <div class="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <!-- absolute top-0 right-0：贴父容器右上角，translate-x-1/2 -translate-y-1/2 让徽章中心对齐角 -->
        <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">3</span>
        <h3 class="font-semibold text-gray-800">消息通知</h3>
        <p class="text-sm text-gray-500 mt-1">徽章用 absolute 贴右上角，-top-2 -right-2 让它稍微溢出。</p>
      </div>
      <!-- 卡片2：右下角"NEW"标签 -->
      <div class="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm overflow-hidden">
        <!-- absolute top-3 right-3：右上角"NEW"标签 -->
        <span class="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">NEW</span>
        <h3 class="font-semibold text-gray-800 pr-12">最新功能</h3>
        <p class="text-sm text-gray-500 mt-1">标签用 absolute 贴右上角，主标题加 pr-12 避免和标签重叠。</p>
      </div>
    </div>

    <!-- Tooltip 演示：父 relative，tooltip absolute 贴下方 -->
    <div class="mt-6 flex justify-center">
      <div class="relative group">
        <!-- 按钮：group 让子元素能用 group-hover -->
        <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">悬停我看提示</button>
        <!-- tooltip：absolute bottom-full（在按钮上方）left-1/2 -translate-x-1/2 水平居中，
             opacity-0 group-hover:opacity-100 默认隐藏悬停显示，
             mb-2 距按钮 0.5rem，transition-opacity 过渡，
             whitespace-nowrap 防止换行，pointer-events-none 不阻挡鼠标 -->
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          这是一个工具提示
          <!-- 小三角：absolute 顶部居中朝下 -->
          <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ 区块 2：fixed 返回顶部按钮 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">② fixed 返回顶部按钮</h2>
    <p class="text-sm text-gray-500 mb-4">fixed bottom-4 right-4 固定在视口右下角，滚动也不动（注意：预览 iframe 内 fixed 相对 iframe 视口）。</p>

    <!-- fixed 按钮：fixed bottom-4 right-4 距视口右下各 1rem，
         bg-blue-500 hover:bg-blue-600，rounded-full 圆形，shadow-lg 阴影，
         z-50 确保在最上层，size-12 圆形尺寸，flex 居中放箭头 -->
    <button class="fixed bottom-4 right-4 z-50 size-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg flex items-center justify-center text-xl transition-colors">
      ↑
    </button>

    <!-- 说明：fixed 相对视口，滚动也不动。
         注意：在预览 iframe 内，fixed 相对 iframe 视口（不是外层页面），
         所以按钮会固定在预览区右下角。 -->
    <p class="text-xs text-gray-500 mt-2">↑ 看预览区右下角，fixed 按钮固定在那里（滚动预览区也不动）。</p>
  </section>

  <!-- ============ 区块 3：sticky 粘性导航 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">③ sticky 粘性导航</h2>
    <p class="text-sm text-gray-500 mb-4">滚动下面容器内的内容，sticky top-0 的导航会贴住容器顶部不动（直到容器滚完）。</p>

    <!-- sticky 演示容器：h-64 固定高度 16rem，overflow-y-auto 垂直可滚动，
         让 sticky 在这个容器内生效（相对容器滚动） -->
    <div class="h-64 overflow-y-auto border border-gray-200 rounded-lg">
      <!-- 顶部内容：sticky 之前的内容 -->
      <div class="p-4 bg-gray-50">
        <p class="text-sm text-gray-600">↓ 向下滚动查看 sticky 效果 ↓</p>
      </div>
      <!-- sticky 导航：sticky top-0 贴住容器顶部，z-10 在内容之上，
           bg-white 白底 + shadow-sm 阴影 + backdrop 让滚动内容不透过来 -->
      <nav class="sticky top-0 z-10 bg-white/90 backdrop-blur shadow-sm px-4 py-2 border-b border-gray-200">
        <span class="text-sm font-semibold text-gray-800">📌 粘性导航（sticky top-0）</span>
      </nav>
      <!-- 长内容：让容器可滚动，sticky 导航贴顶 -->
      <div class="p-4 space-y-2">
        <p class="text-sm text-gray-700">第一段内容：滚动时上方导航会贴住顶部。</p>
        <p class="text-sm text-gray-700">第二段内容：sticky 元素在普通流里，滚动到阈值才"贴住"。</p>
        <p class="text-sm text-gray-700">第三段内容：和 fixed 不同，sticky 不脱离流，仍占空间。</p>
        <p class="text-sm text-gray-700">第四段内容：常用于表格表头、章节标题、侧边栏目录。</p>
        <p class="text-sm text-gray-700">第五段内容：注意 sticky 父容器不能 overflow-hidden/auto（本例父是 overflow-y-auto 故在此容器内生效）。</p>
        <p class="text-sm text-gray-700">第六段内容：继续滚动，导航依然贴顶。</p>
        <p class="text-sm text-gray-700">第七段内容：直到父容器（这个 h-64 的盒子）滚完，sticky 才释放。</p>
        <p class="text-sm text-gray-700">第八段内容：滚动结束。</p>
      </div>
    </div>
  </section>

  <!-- ============ 区块 4：z-index 层叠 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">④ z-index 层叠顺序</h2>
    <p class="text-sm text-gray-500 mb-4">数值越大越在上层。注意：z-index 只对定位元素（relative/absolute/fixed/sticky）生效。</p>

    <!-- z-index 演示容器：relative 作参照，多个 absolute 子元素叠放 -->
    <div class="relative h-44 mx-auto max-w-sm">
      <!-- 底层 z-0：relative + z-0，绿色，最底层 -->
      <div class="absolute top-0 left-0 z-0 w-32 h-32 bg-emerald-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">z-0（底层）</div>
      <!-- 中层 z-10：偏移一点，蓝色，在绿之上 -->
      <div class="absolute top-8 left-16 z-10 w-32 h-32 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">z-10</div>
      <!-- 高层 z-20：再偏移，紫色，在蓝之上 -->
      <div class="absolute top-16 left-32 z-20 w-32 h-32 bg-purple-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">z-20</div>
      <!-- 最高层 z-30：再偏移，红色，最上层 -->
      <div class="absolute top-24 left-48 z-30 w-32 h-32 bg-rose-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">z-30（顶层）</div>
    </div>
    <p class="text-xs text-gray-500 mt-2">四个方块依次叠加，z-30 红色在最上层。若把 z-30 改成 z-0，红色会沉到底层。</p>
  </section>

  <!-- ============ 区块 5：overflow 溢出控制 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑤ overflow 溢出控制</h2>
    <p class="text-sm text-gray-500 mb-4">overflow-hidden 裁切（配圆角裁图片）、overflow-auto 滚动、overflow-x-auto 横向滚动。</p>

    <div class="grid grid-cols-2 gap-4">
      <!-- overflow-hidden + 圆角：裁切内部内容（图片不戳出圆角） -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-1">overflow-hidden + rounded（裁切）</p>
        <!-- rounded-xl + overflow-hidden：圆角裁掉超出部分 -->
        <div class="rounded-xl overflow-hidden border border-gray-200">
          <!-- 渐变色块代替图片，h-24 高度 -->
          <div class="h-24 bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-white font-semibold">图片/封面</div>
          <div class="p-3 bg-white">
            <p class="text-sm text-gray-700">overflow-hidden 让圆角裁切内部内容。</p>
          </div>
        </div>
      </div>

      <!-- overflow-auto：固定高度 + 自动滚动条 -->
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-1">overflow-y-auto（垂直滚动）</p>
        <!-- h-32 固定高度 8rem，overflow-y-auto 内容超出时显示滚动条 -->
        <div class="h-32 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
          <p class="text-sm text-gray-700 mb-2">第 1 行：固定高度 + overflow-y-auto。</p>
          <p class="text-sm text-gray-700 mb-2">第 2 行：内容超出高度时自动出现滚动条。</p>
          <p class="text-sm text-gray-700 mb-2">第 3 行：常用于聊天记录、代码块、长列表。</p>
          <p class="text-sm text-gray-700 mb-2">第 4 行：滚动查看下方内容。</p>
          <p class="text-sm text-gray-700 mb-2">第 5 行：继续滚动。</p>
          <p class="text-sm text-gray-700 mb-2">第 6 行：到底了。</p>
        </div>
      </div>
    </div>

    <!-- overflow-x-auto：横向滚动（卡片轮播/宽表格） -->
    <p class="text-xs font-semibold text-gray-500 mt-4 mb-1">overflow-x-auto（横向滚动卡片）</p>
    <!-- flex + overflow-x-auto：横向排列，超出可左右滚动，whitespace-nowrap 防换行 -->
    <div class="flex gap-3 overflow-x-auto pb-2">
      <div class="flex-shrink-0 w-40 h-24 bg-indigo-500 text-white rounded-lg flex items-center justify-center text-sm">卡片 1</div>
      <div class="flex-shrink-0 w-40 h-24 bg-indigo-500 text-white rounded-lg flex items-center justify-center text-sm">卡片 2</div>
      <div class="flex-shrink-0 w-40 h-24 bg-indigo-500 text-white rounded-lg flex items-center justify-center text-sm">卡片 3</div>
      <div class="flex-shrink-0 w-40 h-24 bg-indigo-500 text-white rounded-lg flex items-center justify-center text-sm">卡片 4</div>
      <div class="flex-shrink-0 w-40 h-24 bg-indigo-500 text-white rounded-lg flex items-center justify-center text-sm">卡片 5</div>
    </div>
  </section>

  <!-- ============ 区块 6：object-cover + 显示隐藏 ============ -->
  <section>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">⑥ object-cover 图片裁切 &amp; 显示隐藏</h2>
    <p class="text-sm text-gray-500 mb-4">object-cover 让图片填满容器不变形；hidden/md:block 响应式显隐。</p>

    <!-- object-cover：固定方形容器 + object-cover 填充（用渐变模拟图片） -->
    <div class="flex items-center gap-4 mb-4">
      <!-- 容器 w-24 h-24 固定方形，overflow-hidden 裁切 -->
      <div class="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
        <div class="w-full h-full object-cover bg-gradient-to-br from-blue-400 to-purple-500"></div>
      </div>
      <div class="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
        <div class="w-full h-full object-cover bg-gradient-to-br from-emerald-400 to-cyan-500"></div>
      </div>
      <div>
        <p class="text-sm text-gray-700">圆形/圆角容器配 object-cover，图片填满不变形。真实 &lt;img&gt; 用 class="object-cover w-full h-full"。</p>
      </div>
    </div>

    <!-- 显示隐藏：hidden md:block 响应式 -->
    <div class="border border-dashed border-gray-300 p-4 rounded-lg">
      <p class="text-xs font-semibold text-gray-500 mb-2">响应式显隐（缩窄窗口看变化）：</p>
      <!-- hidden md:block：手机隐藏，≥768px 显示 -->
      <div class="hidden md:block bg-blue-100 text-blue-700 p-2 rounded text-sm mb-2">hidden md:block（手机隐藏，桌面显示）—— 桌面完整菜单</div>
      <!-- block md:hidden：手机显示，≥768px 隐藏 -->
      <div class="block md:hidden bg-orange-100 text-orange-700 p-2 rounded text-sm">block md:hidden（手机显示，桌面隐藏）—— 手机汉堡菜单</div>
    </div>
  </section>
</div>`,
  },
];