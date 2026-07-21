# 第一章 Mantine 的设计理念

> "Build fully functional accessible web applications faster than ever."

在 React 生态中，UI 组件库多如繁星——从早期的 Material-UI、Ant Design，到近年的 Chakra UI、Radix UI，每一种都在试图回答同一个问题：如何让开发者用更少的时间，构建出更好的应用界面？Mantine 给出的答案并不复杂——**开箱即用、可访问、可定制、面向 AI 协作**。本章将从 Mantine 的定位、设计哲学、模块化结构、可访问性承诺、暗色模式策略、v9 新特性、横向对比以及快速上手等八个维度，系统性地剖析这套组件库背后的设计思路。

---

## 1.1 什么是 Mantine

### 1.1.1 项目定位

Mantine 是一个专注于提供卓越用户体验与开发体验的 React 组件库。与某些只关注"视觉表现"的库不同，Mantine 的目标从来不止于"做出好看的按钮"——它希望覆盖一个真实业务应用从表单、布局、通知、模态框到日期选择、文件上传、富文本编辑、图表展示的几乎所有交互需求。换句话说，Mantine 想要解决的是**"构建一个完整可用、可访问的 Web 应用"**这一更高层次的问题，而不仅仅是组件本身的视觉风格。

这种定位带来了几个直接的工程后果：

- 它内置了一整套 hooks 集合（70+），覆盖了从状态管理、副作用、DOM 操作到设备检测的常用场景，无需四处搜寻第三方包；
- 它提供了独立的表单状态管理方案 `@mantine/form`，深度集成 Mantine 组件的同时保持了与第三方校验库（zod、yup、valibot 等）的对接能力；
- 它通过 `@mantine/notifications`、`@mantine/modals`、`@mantine/spotlight` 等上下文型扩展包，统一管理跨组件的命令式交互场景，避免业务代码被状态提升"污染"；
- 它的所有组件都基于 TypeScript 编写，类型推断完整，且对外暴露了细粒度的 props 类型，开发者可以轻松构造出与业务模型对齐的封装组件。

### 1.1.2 项目历史

Mantine 由 Vitaly Rtishchev 于 **2021 年 1 月** 创建，最初是一个个人项目，旨在弥补当时 React 组件库在"开发体验"上的不足。彼时的 Material-UI 体量庞大、定制成本高；Ant Design 偏向企业级数据展示场景，主题定制路径曲折；Chakra UI 虽然灵活，但组件数量偏少。Mantine 以"功能完整 + 开箱即用"为切入点，迅速在社区中获得关注。

经过近五年的迭代（截至本文写作时为 v9），Mantine 已经成长为：

- **138 个组件**
- **82 个 hooks**
- **345 个文档页面**
- **1668 个交互式 demos**

这一组数字背后体现的是一个非常严苛的工程承诺：**每个 API 都有文档、每个特性都有可运行的交互式示例**。对于开发者来说，这意味着遇到问题几乎总能在官方文档中找到可复制的解决方案，而不必诉诸 Stack Overflow 或反复试验。

### 1.1.3 v9 当前状态

v9 是 Mantine 截至目前最大的一次主版本升级，其核心变化可以概括为三句话：

1. **全面拥抱 React 19.2+**——利用其 style hoisting、actions、use 等新特性优化渲染性能与开发体验；
2. **新增 `@mantine/schedule` 包**——提供完整的企业级日历调度组件套件（这是 Mantine 历史上第一次覆盖"日历"这一复杂场景）；
3. **AI 友好**——文档结构、API 命名、错误信息全面调整，使其更易于被 AI 代码助手理解和生成。

### 1.1.4 安装

安装 Mantine 极其简单——核心包只需一条命令：

```bash
# 安装 Mantine 核心包与 hooks 包（两者通常一起安装）
# @mantine/core：所有 UI 组件
# @mantine/hooks：70+ 通用 React hooks
npm install @mantine/core @mantine/hooks
```

后续章节会介绍各个扩展包的安装方式，此处先建立整体认识。

---

## 1.2 核心设计哲学

### 1.2.1 三大原则

Mantine 的官方口号"Build fully functional accessible web applications faster than ever"实际上浓缩了三大设计原则：

| 原则 | 含义 | 工程体现 |
| --- | --- | --- |
| **开箱即用（Out of the box）** | 安装即可使用，无需复杂配置 | 默认主题即可直接投入生产环境；CSS 变量优先，无需 CSS-in-JS 运行时即可工作 |
| **可访问（Accessible）** | 内置 WAI-ARIA 支持、键盘导航、焦点管理 | 所有交互组件遵循 WAI-ARIA 规范；Focus Ring 系统自动处理键盘/鼠标差异 |
| **可定制（Customizable）** | 主题、样式、组件行为均可深度定制 | `createTheme` 提供统一主题入口；组件支持 `classNames`、`styles`、`vars` 三种定制层级 |

这三者并非孤立——它们之间存在强烈的张力。例如：开箱即用通常意味着"默认好看"，但"默认好看"又常常意味着"难以定制"；可访问性通常会带来额外的 DOM 结构与属性，又可能影响"开箱即用"的简洁度。Mantine 的处理方式是：**把默认值做得足够好，把覆盖入口做得足够细**。

### 1.2.2 "Built for the AI-assisted workflow"

这是 v9 文档中明确写出的、并且是 v9 升级重点强调的一个设计取向。它的含义不是"用 AI 写 Mantine 代码"，而是 **Mantine 的 API 设计、文档结构、错误信息都考虑到了 AI 代码助手的工作方式**。

具体体现在：

- **API 命名一致性**：所有组件的尺寸、颜色、圆角、间距等"维度"属性都使用统一的命名（`size`、`color`、`radius`、`variant` 等），AI 模型在见过一个组件后即可类推其他组件；
- **文档结构标准化**：每个组件页面都遵循"概述 → Import → Usage → Variants → Props → Styles API → Accessibility"的固定结构，便于模型快速定位信息；
- **错误信息可读性**：开发模式下的警告信息会被刻意写得详细，包含上下文与建议方案；
- **1668 个交互式 demos**：这些 demos 既是人看的，也是 AI 看的——它们构成了一个庞大的"反例-正例"训练语料。

对于开发者来说，这意味着：**在 Trae、Cursor、Copilot 等 AI 代码助手中使用 Mantine，比使用其他许多库更不容易出错**。

### 1.2.3 模块化设计哲学

Mantine 不强求"全量使用"。所有的功能被拆分成 16 个独立发布的 npm 包，开发者可以按需引入：

- 只需要组件？装 `@mantine/core`；
- 需要表单管理？加 `@mantine/form`；
- 需要通知系统？加 `@mantine/notifications`；
- 需要日历调度？加 `@mantine/schedule`。

这种"核心 + 扩展"的结构降低了包体积、缩短了构建时间，也让"用 Mantine 做一个表单页"和"用 Mantine 做一个完整后台"成为两种可以平滑过渡的体验。

---

## 1.3 模块化包结构

下面表格列出了 Mantine v9 全部 16 个 npm 包及其用途。除 `@mantine/core` 与 `@mantine/hooks` 之外，其余包均为可选安装。

| 包名 | 用途 | 是否独立可拆 |
| --- | --- | --- |
| `@mantine/core` | 核心组件库，包含 138 个 UI 组件 | 必装 |
| `@mantine/hooks` | 70+ 通用 React hooks（状态、副作用、DOM、设备检测等） | 必装 |
| `@mantine/form` | 表单状态管理，支持字段校验、动态字段、表单数组 | 推荐 |
| `@mantine/dates` | 日期选择器、日历、范围选择器等日期组件 | 按需 |
| `@mantine/charts` | 图表组件（v9 起基于 Recharts 3 封装） | 按需 |
| `@mantine/tiptap` | 富文本编辑器（v9 起基于 Tiptap 3） | 按需 |
| `@mantine/notifications` | 全局通知系统，支持命令式 API | 按需 |
| `@mantine/modals` | 全局模态框管理，支持命令式 API | 按需 |
| `@mantine/spotlight` | 命令面板（类似 Spotlight / Command-K） | 按需 |
| `@mantine/dropzone` | 文件拖拽上传组件 | 按需 |
| `@mantine/carousel` | 轮播组件（基于 Embla Carousel） | 按需 |
| `@mantine/code-highlight` | 代码高亮组件（基于 highlight.js） | 按需 |
| `@mantine/nprogress` | 顶部进度条（类似 NProgress） | 按需 |
| `@mantine/schedule` | **v9 新增**：完整日历调度组件套件（Schedule、DayView、WeekView、MonthView、YearView、MobileMonthView） | 按需 |
| `@mantine/core` styles | 全局样式入口（`@mantine/core/styles.css`） | 必引 |
| `@mantine/notifications` styles | 通知系统样式 | 按需 |

> **说明**：除 `@mantine/core` 外，每个扩展包都需要单独引入对应的样式文件（如 `@mantine/dates/styles.css`），这是 v7 起引入的约定——它把"组件逻辑"与"组件样式"完全分离，使按需引入更彻底。

### 安装示例

```bash
# 安装核心包（必装，提供所有 UI 组件与基础 hooks）
npm install @mantine/core @mantine/hooks

# 安装表单包（提供 @mantine/form，独立于 core 的表单状态管理）
npm install @mantine/form

# 安装通知系统（提供 Notifications 与 notifications.show() 命令式 API）
npm install @mantine/notifications

# 安装日期组件（DatePicker、DateInput、Calendar 等）
npm install @mantine/dates

# v9 新增：完整的日历调度组件套件
# 提供 Schedule、DayView、WeekView、MonthView、YearView、MobileMonthView
npm install @mantine/schedule

# 图表包（v9 起基于 Recharts 3 封装，比直接用 Recharts 更易主题化）
npm install @mantine/charts recharts

# 富文本编辑器（v9 起基于 Tiptap 3）
npm install @mantine/tiptap @tiptap/react @tiptap/pm
```

---

## 1.4 可访问性（Accessibility）承诺

可访问性（Accessibility，简称 a11y）不是 Mantine 的"附加特性"，而是**设计阶段的硬约束**。每一个新组件在进入主分支之前，都会经过 WAI-ARIA 规范检查、键盘导航测试、屏幕阅读器测试三道关卡。

### 1.4.1 WAI-ARIA 标准遵循

Mantine 所有交互组件都遵循 [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) 规范：

- 模态框遵循 `role="dialog"` + `aria-modal="true"` 模式，并自动管理焦点陷阱（focus trap）；
- 下拉菜单遵循 `aria-haspopup` + `aria-expanded` 模式，支持方向键导航；
- 选项卡（Tabs）遵循 `role="tablist"` 模式，支持方向键、Home、End 等键盘操作；
- Toast 通知遵循 `role="alert"` 模式，确保屏幕阅读器立即播报。

这些规范并非"开发者需要手动配置"，而是组件内部默认行为——开发者只要使用组件，就自动获得符合规范的可访问性能力。

### 1.4.2 Focus Ring 系统详解

Focus Ring（焦点环）是可访问性中视觉最敏感的部分——它告诉键盘用户"我现在聚焦在哪里"。Mantine 提供了三种模式，由 `theme.focusRing` 控制：

| 模式 | 行为 | 推荐场景 |
| --- | --- | --- |
| `'auto'`（默认） | 仅在键盘导航时显示焦点环，鼠标点击不显示 | 大多数生产环境 |
| `'always'` | 键盘和鼠标点击都显示焦点环 | 需要极强视觉一致性、无障碍要求极高的场景 |
| `'never'` | 不显示焦点环 | **不推荐**——会剥夺键盘用户的视觉指示，违反 WCAG 2.4.7 |

`'auto'` 模式之所以是默认值，是因为它通过 `:focus-visible` 选择器实现——该选择器在浏览器层面区分"键盘聚焦"与"鼠标聚焦"，从而实现"鼠标点击无环、键盘导航有环"的效果。根据 [caniuse](https://caniuse.com/css-focus-visible) 数据，该选择器目前已被 **91%+ 浏览器支持**，完全可以作为生产环境的默认方案。

### 1.4.3 自定义焦点样式

除了 `focusRing` 三态控制之外，Mantine 还提供了更细粒度的焦点定制入口：

- **`theme.focusClassName`**：自定义焦点环的 CSS 类名，便于使用 Tailwind、CSS Module 等方案覆盖；
- **`theme.cursorType`**：控制交互元素的光标行为，可选 `'default'` 或 `'pointer'`（默认 `default`，与原生 button 行为一致；设置为 `pointer` 时所有可交互元素显示手型光标）。

### 1.4.4 配置示例

```javascript
import { createTheme, MantineProvider } from '@mantine/core';

// 创建主题，配置焦点环行为
const theme = createTheme({
  // 'auto' - 仅键盘导航时显示焦点环（推荐，默认值）
  // 'always' - 键盘和鼠标点击都显示焦点环
  // 'never' - 不显示焦点环（不推荐，影响可访问性）
  focusRing: 'auto',

  // 'default' - 交互元素使用默认光标（与原生 button 一致）
  // 'pointer' - 交互元素使用手型光标（更"网页化"的视觉风格）
  cursorType: 'pointer',

  // 可选：自定义焦点环的 CSS 类名
  // 当 focusRing 为 'auto' 时，该类名会附加到 :focus-visible 状态
  // focusClassName: 'my-custom-focus-ring',
});

function App() {
  return (
    // MantineProvider 必须在应用根节点渲染，且整个应用只能使用一次
    <MantineProvider theme={theme}>
      {/* 应用内容 */}
    </MantineProvider>
  );
}
```

> **实践建议**：在生产环境中保持 `focusRing: 'auto'` 是最稳妥的选择。如果你确实需要完全自定义焦点样式，请确保自定义样式依然提供了清晰的视觉指示——切勿以"美观"为名单纯隐藏焦点环。

---

## 1.5 Dark Mode 哲学

Mantine 的暗色模式实现有一个明确的设计取向：**不依赖 JavaScript 即可正确呈现**——所有色彩方案相关的样式都通过 `data-mantine-color-scheme` 属性在 CSS 层切换，而不是通过 React context 动态注入。这种设计带来三个好处：

1. SSR 场景下不会出现"先亮后暗"的闪烁（FOUC）；
2. 用户偏好可以在 hydration 之前通过一段同步脚本读取 localStorage 并设置属性；
3. 整套色彩方案完全由 CSS 变量驱动，性能开销几乎为零。

### 1.5.1 三种色彩方案

`data-mantine-color-scheme` 属性接受三个值：

| 值 | 行为 |
| --- | --- |
| `'light'` | 强制亮色模式 |
| `'dark'` | 强制暗色模式 |
| `'auto'` | 跟随系统（通过 `prefers-color-scheme` 媒体查询解析） |

### 1.5.2 在特定模式下隐藏组件

某些组件（如装饰性背景图、节日横幅）可能只希望在亮色或暗色模式下显示。Mantine 为所有组件提供了两个 props：

- `lightHidden`：在亮色模式下隐藏该组件；
- `darkHidden`：在暗色模式下隐藏该组件。

```javascript
// 在亮色模式下隐藏深色背景图，在暗色模式下隐藏浅色背景图
<>
  <Image src="/dark-bg.png" lightHidden />
  <Image src="/light-bg.png" darkHidden />
</>
```

### 1.5.3 禁用色彩切换过渡动画

默认情况下，Mantine 会在用户切换亮/暗模式时为所有色彩相关属性添加 200ms 的过渡动画。如果你希望切换更"硬切"，可以在 `MantineProvider` 上设置 `transitionDuration={0}`，或者在 CSS 中覆盖 `--mantine-transition-duration` 变量。

### 1.5.4 完整的 Dark Mode 切换示例

```javascript
import {
  MantineProvider,
  useMantineColorScheme,
  useComputedColorScheme,
  Button,
  Group,
} from '@mantine/core';

function ColorSchemeToggle() {
  // useMantineColorScheme：获取和设置色彩方案
  // 返回 { colorScheme, setColorScheme, toggleColorScheme }
  // 注意：colorScheme 可能是 'light'、'dark' 或 'auto'
  const { setColorScheme } = useMantineColorScheme();

  // useComputedColorScheme：获取"计算后"的色彩方案
  // 第一个参数是默认值（当 colorScheme 为 'auto' 时使用）
  // 返回值永远是 'light' 或 'dark'（不会是 'auto'）
  // 适合用于决定图标、文案等具体 UI 元素
  const computedColorScheme = useComputedColorScheme('light');

  const toggleColorScheme = () => {
    // 在亮色和暗色之间切换
    // 注意：此处直接使用 computedColorScheme，而非原始 colorScheme
    // 否则当 colorScheme 为 'auto' 时会切换到 'auto' 自身，造成逻辑混乱
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Group justify="center">
      <Button onClick={toggleColorScheme}>
        当前模式：{computedColorScheme}
      </Button>
    </Group>
  );
}

function App() {
  return (
    // defaultColorScheme 设置默认色彩方案
    // 支持 'light'、'dark'、'auto'（跟随系统）
    // 注意：此值仅在 localStorage 中无用户偏好时生效
    <MantineProvider defaultColorScheme="auto">
      <ColorSchemeToggle />
    </MantineProvider>
  );
}
```

> **关键区别**：`useMantineColorScheme().colorScheme` 可能返回 `'auto'`，而 `useComputedColorScheme()` 永远返回 `'light'` 或 `'dark'`——后者已经"解析"了 `auto` 的实际效果。这一点在编写切换按钮、决定图标时尤为重要。

---

## 1.6 v9 的新特性

v9 是 Mantine 的一次"主版本大升级"，涉及 React 版本要求、性能优化、新组件、新 hooks、API 调整等多个方面。本节梳理其中最重要的变化。

### 1.6.1 React 19.2+ 成为 peer dependency

所有 `@mantine/*` 包现在都将 React 19.2 及以上版本列为 peer dependency。这一变化不是单纯的"版本号更新"——它使得 Mantine 可以使用 React 19 引入的若干关键能力：

- **`use` Hook**：用于在渲染过程中读取 Promise 或 Context，简化异步数据加载；
- **Server Actions**：与 Next.js App Router 深度配合，简化表单提交流程；
- **React Compiler**：自动化的记忆化，使 Mantine 内部的 `useMemo`、`useCallback` 等优化部分可以交由编译器处理；
- **style hoisting**：将内联样式提升到组件树外层，避免重复创建，详见 1.6.2。

> **迁移提示**：如果你的项目还在 React 18 上，需要先升级到 React 19.2+ 才能使用 Mantine v9。升级本身通常不复杂，但需注意 React 19 移除了一些已废弃的 API（如 `ReactDOM.render`、`string refs` 等）。

### 1.6.2 deduplicateInlineStyles prop

v9 在所有组件上新增了 `deduplicateInlineStyles` prop。这是一个看似不起眼但实际影响很大的优化——它利用 React 19 引入的 **style hoisting** 机制，对响应式 `style` props 进行去重和提升。

考虑一个典型场景：在一个数据密集的表格中，每个单元格都通过 `style={{ background: ... }}` 设置背景色。在 v8 中，每个单元格都会创建一个独立的内联 style 对象，造成不必要的内存开销与 reconciliation 成本。

启用 `deduplicateInlineStyles` 后：

- 相同的 style 对象会被去重，复用同一个引用；
- 内联样式会被"提升"到组件树外层，由 React 19 在更高效的层级处理；
- 在大列表、表格、网格等场景下，性能提升可达 20-30%。

```javascript
// 在大型列表组件上启用 deduplicateInlineStyles
<List deduplicateInlineStyles>
  {items.map((item) => (
    <List.Item key={item.id} style={{ background: item.color }}>
      {item.label}
    </List.Item>
  ))}
</List>
```

### 1.6.3 新增 @mantine/schedule 包

`@mantine/schedule` 是 v9 重磅新增的包，提供完整的日历调度组件套件。它包含以下组件：

| 组件 | 用途 |
| --- | --- |
| `Schedule` | 顶层容器，管理事件数据与视图切换 |
| `DayView` | 日视图，按小时排列当天事件 |
| `WeekView` | 周视图，7 列 × 24 小时网格 |
| `MonthView` | 月视图，传统月历布局 |
| `YearView` | 年视图，12 个月缩略图 |
| `MobileMonthView` | 移动端优化的月视图，支持滑动切换 |

这套组件瞄准的是企业级日历调度场景——类似 Google Calendar、Outlook 日历的功能，开发者现在可以直接基于 Mantine 构建，无需引入 react-big-calendar 等额外依赖。

### 1.6.4 新组件

v9 新增了若干个长期被社区期盼的组件：

- **`FloatingWindow`**：可拖拽、可调整大小的浮动窗口，适合构建 IDE 风格、多面板应用；
- **`OverflowList`**：自动处理子项溢出，将溢出的部分折叠为"… 更多"按钮，常用于面包屑、标签列表；
- **`Marquee`**：跑马灯组件，支持水平和垂直方向，常用于公告、广告位；
- **`Scroller`**：增强型滚动容器，自动隐藏滚动条、支持触控滑动、统一移动端与桌面端滚动体验。

### 1.6.5 新 hooks

v9 同步新增了多个 hooks：

- `use-collapse`：通用的折叠动画 hook，已用于 Collapse 组件；
- `use-horizontal-collapse`：水平方向的折叠动画（配合 Collapse 的 `orientation="horizontal"`）；
- `use-floating-window`：管理 FloatingWindow 的拖拽、调整大小逻辑。

### 1.6.6 Collapse 组件支持水平方向

`Collapse` 组件现在支持 `orientation="horizontal"` props，可以在水平方向展开/收起。这对侧边栏、抽屉式面板场景非常有用——此前开发者需要通过 `transform` 或 `width` 手动实现，现在则与垂直方向使用完全相同的 API。

```javascript
// 水平方向的折叠面板
<Collapse orientation="horizontal" in={opened}>
  <Box p="md" style={{ width: 300 }}>
    侧边栏内容
  </Box>
</Collapse>
```

### 1.6.7 fontWeights.medium 调整

v9 中，`theme.fontWeights.medium` 的值从 `500` 调整为 `600`。这是一个看似微小的视觉调整，但实际上是为了适配现代字体（如 Inter、SF Pro）在屏幕上的渲染效果——这些字体在 500 字重下与 normal（400）几乎无法区分，600 才能产生明显的"中等"视觉效果。

如果你有自定义的字体方案，需要重新审视是否受此变化影响。

### 1.6.8 Schema 验证统一为 schemaResolver

在 v8 及之前，Mantine form 与校验库的集成需要使用各自专用的 resolver：

- `zodResolver`（来自 `@mantine/form`）；
- `yupResolver`（来自 `@mantine/form`）；
- `joiResolver`（需要手动适配）；
- `valibotResolver`（需要手动适配）。

v9 统一为单一的 `schemaResolver`，任何遵循标准 Schema 协议的库（zod、yup、valibot、arktype 等）都可以通过同一个 resolver 接入：

```javascript
import { useForm } from '@mantine/form';
import { schemaResolver } from '@mantine/form';
import { z } from 'zod';

// 定义 Zod schema
const schema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少 8 位'),
});

// 使用 schemaResolver 统一接入
const form = useForm({
  validate: schemaResolver(schema),
  initialValues: { email: '', password: '' },
});
```

这一变化大幅降低了学习成本——开发者只需记住一个 resolver 名称，即可适配所有主流校验库。

---

## 1.7 与其他 UI 库的对比

为了让读者更清晰地理解 Mantine 在 React 生态中的位置，本节通过表格对比 Mantine 与三大主流 UI 库。

| 维度 | Mantine v9 | Material-UI (MUI) | Ant Design | Chakra UI |
| --- | --- | --- | --- | --- |
| **组件数量** | 138 + 82 hooks | 60+ | 60+ | 50+ |
| **包大小（gzip，core）** | ~80KB | ~90KB | ~200KB | ~110KB |
| **主题定制能力** | CSS 变量优先，运行时可改 | Sass 变量 + 主题对象，编译期为主 | Less 变量 + ConfigProvider，编译期为主 | 运行时主题对象，灵活 |
| **表单管理** | 内置 `@mantine/form`，深度集成 | 需 react-hook-form 等外部方案 | 内置 Form 组件，与字段绑定较强 | 需 react-hook-form 等外部方案 |
| **暗色模式** | CSS 变量切换，支持 auto | 主题切换，需重新渲染 | ConfigProvider 切换，性能一般 | CSS 变量切换，支持 auto |
| **TypeScript 支持** | 原生编写，类型完整 | 较好，部分类型需手动推断 | 较好 | 较好 |
| **学习曲线** | 平缓，API 一致性高 | 中等，sx prop 需理解 | 较陡，命名规范繁杂 | 平缓，类似 Tailwind |
| **适用场景** | 中后台、SaaS、企业应用、需要表单/日历/调度的复杂场景 | 紧跟 Material Design 风格的应用 | 企业级中后台、数据展示密集型应用 | 设计自由度高、与 Tailwind 配合的场景 |

### 关键差异分析

**与 Material-UI 相比**：MUI 紧跟 Material Design 规范，视觉风格"克制且统一"；Mantine 不绑定任何设计语言，视觉风格更"现代且通用"。如果团队希望避免"Material Design 既视感"，Mantine 是更合适的起点。

**与 Ant Design 相比**：Ant Design 在企业级数据展示（表格、表单、筛选器）上积累深厚，但主题定制路径曲折、暗色模式实现较重。Mantine 在表单管理（`@mantine/form`）、暗色模式、主题定制上更现代，且包大小显著更小。

**与 Chakra UI 相比**：Chakra UI 的设计哲学是"样式即 props"，灵活度极高，但组件数量偏少，且不提供表单管理、日期选择等"重业务"组件。Mantine 在保持灵活性的同时，提供了完整的业务组件覆盖。

---

## 1.8 快速开始

本节通过一个完整的 Next.js 集成示例，演示如何将 Mantine 接入 Next.js App Router 项目，并处理 SSR 防闪烁等关键工程问题。

### 1.8.1 安装依赖

```bash
# 安装 Mantine 核心包与 hooks
npm install @mantine/core @mantine/hooks

# 安装 Next.js（如果项目尚未初始化）
# npx create-next-app@latest my-app
```

### 1.8.2 配置根布局

以下代码展示了一个完整的 `app/layout.js`，包含：防闪烁脚本、主题配置、MantineProvider 渲染。

```javascript
// app/layout.js —— Next.js App Router 根布局
import '@mantine/core/styles.css'; // 引入 Mantine 核心样式（必引）
import Script from 'next/script'; // Next.js 脚本组件
import { createTheme, MantineProvider } from '@mantine/core';

// ============ 防闪烁脚本 ============
// 在 hydration 前同步读取 localStorage 中的色彩方案偏好，
// 设置 data-mantine-color-scheme 属性，防止亮→暗闪烁（FOUC）
// 注意：Next.js 16 / React 19.2 下不要在 client component 里渲染 <script>，
// 应使用 next/script 的 beforeInteractive 策略
const COLOR_SCHEME_SCRIPT = `
  try {
    var stored = window.localStorage.getItem('mantine-color-scheme-value');
    var scheme = stored === 'light' || stored === 'dark' || stored === 'auto'
      ? stored : 'light';
    // 如果是 auto，解析为实际的 light/dark
    var resolved = scheme !== 'auto'
      ? scheme
      : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-mantine-color-scheme', resolved);
  } catch(e) {}
`;

// ============ 主题配置 ============
const theme = createTheme({
  // 主色调：使用 Mantine 内置颜色名（blue、grape、indigo、teal 等 57 种）
  primaryColor: 'blue',

  // 主色阴影索引（0-9，索引越大颜色越深）
  // 可分别为亮色和暗色模式指定不同的阴影
  // 通常亮色用较深阴影保证对比度，暗色用较浅阴影避免过亮
  primaryShade: { light: 6, dark: 8 },

  // 默认圆角大小：xs / sm / md / lg / xl
  defaultRadius: 'md',

  // 自动对比度：filled variant 的按钮文字颜色自动调整为黑/白
  // 例如蓝色背景自动使用白色文字，黄色背景自动使用黑色文字
  autoContrast: true,

  // 字体族（与系统字体保持一致，无需额外加载字体文件）
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

  // 标题字体配置
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '700',
  },
});

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 防闪烁脚本：在 hydration 前执行 */}
        {/* strategy="beforeInteractive" 确保脚本在 React hydration 之前运行 */}
        <Script
          id="mantine-color-scheme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: COLOR_SCHEME_SCRIPT }}
        />
      </head>
      <body>
        {/* MantineProvider 必须在应用根节点渲染，且只能使用一次 */}
        {/* defaultColorScheme 设置初始色彩方案（防闪烁脚本会覆盖此值） */}
        <MantineProvider theme={theme} defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
```

### 1.8.3 使用第一个组件

```javascript
// app/page.js —— 首页
'use client'; // Mantine 大部分组件依赖客户端能力，需声明为 client component

import { Button, Container, Title, Stack } from '@mantine/core';

export default function HomePage() {
  return (
    // Container：响应式容器，自动居中并设置最大宽度
    <Container size="md" py="xl">
      {/* Stack：垂直堆叠布局，自动添加子元素间距 */}
      <Stack gap="md">
        <Title order={1}>Hello Mantine v9</Title>
        {/* variant 控制视觉风格：filled（实心）、outline（描边）、subtle（淡背景）、light */}
        <Button variant="filled" color="blue">
          主要按钮
        </Button>
        <Button variant="outline" color="grape">
          描边按钮
        </Button>
        <Button variant="subtle" color="teal">
          淡背景按钮
        </Button>
      </Stack>
    </Container>
  );
}
```

### 1.8.4 SSR 防闪烁原理

防闪烁（FOUC，Flash of Unstyled Content）是 SSR 场景下的经典问题。其成因是：

1. 服务器渲染时不知道用户的色彩方案偏好（localStorage 只在浏览器可用）；
2. 服务器默认输出 `light` 主题的 HTML；
3. 浏览器接收 HTML 后，React hydration 完成前，页面已呈现为 `light`；
4. Hydration 完成后，应用读取 localStorage 并切换为 `dark`，造成"亮→暗"闪烁。

Mantine 的解决方案是 **`COLOR_SCHEME_SCRIPT`**——一段同步执行的脚本，在 React hydration 之前读取 localStorage 并设置 `data-mantine-color-scheme` 属性。由于 Mantine 的所有色彩都基于 CSS 变量，且 CSS 变量的取值由 `data-mantine-color-scheme` 决定，因此只要该属性在 hydration 前被正确设置，页面就会立即以正确主题呈现。

> **关键细节**：脚本必须使用 `strategy="beforeInteractive"`（Next.js 16 / React 19.2 下的推荐方式），确保它在 React hydration 之前同步执行。如果使用普通的 `<script>` 标签且放在 body 末尾，脚本可能在 hydration 之后才执行，防闪烁效果失效。

---

## 本章小结

本章从 Mantine 的定位出发，依次介绍了其设计哲学（开箱即用、可访问、可定制、AI 友好）、模块化包结构（16 个独立 npm 包）、可访问性承诺（WAI-ARIA、Focus Ring 系统）、Dark Mode 哲学（CSS 变量驱动、auto 模式）、v9 新特性（React 19.2+、deduplicateInlineStyles、@mantine/schedule、新组件与新 hooks）、与其他主流 UI 库的横向对比，以及 Next.js 集成示例。

回顾全章，可以提炼出 Mantine 的几个核心设计取向：

1. **CSS 变量优先**——主题、暗色模式、焦点环都通过 CSS 变量驱动，性能与可维护性俱佳；
2. **API 一致性**——所有组件的 size、color、radius、variant 等维度属性命名统一，学习成本极低；
3. **可访问性是硬约束**——WAI-ARIA、键盘导航、焦点环均作为组件默认行为提供；
4. **业务覆盖完整**——表单、日期、图表、富文本、通知、模态框、命令面板、日历调度一应俱全，无需四处拼装第三方依赖；
5. **面向 AI 协作**——v9 显式将"AI 友好"纳入设计目标，文档结构、API 命名、错误信息均经过优化。

理解了这些设计取向之后，我们就具备了深入学习具体组件 API 的基础。下一章将聚焦于 `MantineProvider` 与主题系统——它是 Mantine 定制能力的核心入口，也是理解后续所有组件行为的前提。
