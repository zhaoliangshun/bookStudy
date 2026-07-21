// =============================================================
// Mantine v9 深度实战 —— 第 1 批章节（理念篇）
// -------------------------------------------------------------
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// =============================================================

export const chapters = [
  {
    id: "mantinepro-intro",
    icon: "📘",
    title: "为什么选择 Mantine",
    group: "一、Mantine 的理念",
    content: `# 为什么选择 Mantine

## 一、Mantine 是什么

Mantine 是一个**专注于提供卓越用户体验（UX）和开发体验（DX）的 React 组件库**。它由 Vitaly Rtishchev 于 2021 年 1 月创建，至今已发布超过 200 个版本，发展成为 React 生态中功能最完整、设计最现代的组件库之一。

在 v9 版本中，Mantine 包含：

| 指标 | 数量 |
|------|------|
| 组件数量 | 138+ |
| Hooks 数量 | 82+ |
| 文档页面 | 345+ |
| 交互式 Demo | 1668+ |
| 贡献者 | 500+ |

Mantine 的定位不是"又一个 Material Design 实现"，而是一套**独立设计语言**的 React 组件系统。它有自己的视觉风格、交互哲学和工程理念。

---

## 二、Mantine 的设计目的

### 2.1 开箱即用，零配置可用

Mantine 最核心的设计目的之一，是让开发者在**不写一行自定义 CSS 的情况下**，就能构建出功能完整、视觉美观的 Web 应用。

对比其他组件库的繁琐配置：

\`\`\`jsx
// Mantine：安装即用
import { Button, TextInput } from '@mantine/core';

function App() {
  return (
    <div>
      <TextInput label="邮箱" placeholder="your@email.com" />
      <Button>提交</Button>
    </div>
  );
}
\`\`\`

你不需要引入额外的 CSS 文件（只需引入一次全局样式），不需要配置主题提供者的复杂选项，不需要安装 peer dependencies。所有组件默认就能正常工作，而且看起来很不错。

### 2.2 为开发者体验而生

Mantine 的 API 设计始终围绕一个问题：**如何让开发者写更少的代码，同时获得更强的能力？**

举几个例子：

\`\`\`jsx
// 1. 组件 API 统一：所有输入类组件都有相同的 props
<TextInput label="姓名" placeholder="请输入姓名" withAsterisk error="姓名必填" />
<Textarea label="简介" placeholder="介绍一下自己" withAsterisk />
<PasswordInput label="密码" placeholder="请输入密码" withAsterisk />
<NumberInput label="年龄" placeholder="请输入年龄" withAsterisk />

// 2. Style Props：用 props 直接写样式，不需要 className
<Box mt="md" px="lg" py="xl" bg="gray.0" c="blue.6">
  快速样式
</Box>

// 3. useForm：表单状态管理极其简洁
const form = useForm({
  initialValues: { email: '', password: '' },
  validate: { email: isEmail('邮箱格式不正确') },
});
\`\`\`

### 2.3 模块化，按需使用

Mantine 采用**模块化包结构**，你不需要安装整个组件库，可以只引入需要的包：

| 包名 | 用途 |
|------|------|
| \`@mantine/core\` | 核心 UI 组件库（138+ 组件） |
| \`@mantine/hooks\` | 82+ 实用 React Hooks |
| \`@mantine/form\` | 表单状态管理与验证（独立包，不依赖 core） |
| \`@mantine/dates\` | 日期选择与日历组件 |
| \`@mantine/charts\` | 图表组件（v9 基于 Recharts 3） |
| \`@mantine/tiptap\` | 富文本编辑器（v9 基于 Tiptap 3） |
| \`@mantine/notifications\` | 全局通知系统 |
| \`@mantine/modals\` | 模态框管理 |
| \`@mantine/spotlight\` | 命令面板（Cmd+K） |
| \`@mantine/dropzone\` | 文件拖拽上传 |
| \`@mantine/carousel\` | 轮播组件 |
| \`@mantine/code-highlight\` | 代码高亮 |
| \`@mantine/nprogress\` | 顶部导航进度条 |
| \`@mantine/schedule\` | v9 新增，完整日历调度组件套件 |

这种设计让你可以：

1. **只安装需要的包**，减小打包体积
2. **独立使用某些能力**——@mantine/form 和 @mantine/hooks 可以完全脱离 @mantine/core 使用
3. **渐进式引入**——从核心组件开始，需要时再添加其他包

### 2.4 为 AI 辅助开发而设计（v9 重点）

v9 是 Mantine 面向 AI 时代的一次重大升级。官方明确将 **"Built for the AI-assisted workflow"** 作为核心理念之一：

- **LLM 优化文档**：文档结构、代码示例、API 参考都针对大语言模型优化，便于 AI 工具准确理解和生成 Mantine 代码
- **Agent Skills**：提供可被 AI Coding Agent 直接调用的技能接口
- **MCP Server**：Mantine 提供 Model Context Protocol 服务器，AI 工具可以直接查询 Mantine API、组件文档和最佳实践
- **一致的 API 约定**：所有组件遵循相同的 props 模式（label、placeholder、error、size、variant、color...），AI 更容易生成正确的代码

这意味着在使用 Cursor、Claude Code、Windsurf 等 AI 编程工具时，Mantine 的代码生成质量远高于其他组件库。

---

## 三、Mantine 的核心设计原则

### 3.1 可访问性（Accessibility）第一

Mantine 组件严格遵循 WAI-ARIA 标准，让你的应用对所有人可用，包括使用屏幕阅读器、键盘导航的用户。

**Focus Ring 系统**：

Mantine 有一个智能的焦点环（Focus Ring）系统，通过 \`theme.focusRing\` 控制：

| 模式 | 行为 | 适用场景 |
|------|------|---------|
| \`"auto"\`（默认） | 仅键盘导航时显示焦点环 | 大多数应用，兼顾美观和可访问性 |
| \`"always"\` | 键盘和鼠标点击都显示焦点环 | 对可访问性要求极高的场景 |
| \`"never"\` | 不显示焦点环 | **不推荐**，会影响键盘用户体验 |

\`\`\`jsx
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
  // 默认：仅键盘导航时显示焦点环
  // 使用 :focus-visible 选择器，91%+ 的浏览器支持
  focusRing: 'auto',
});
\`\`\`

### 3.2 暗色模式优先

Mantine 不是"暗色模式作为附加功能"，而是从设计之初就**原生支持亮色和暗色两种模式**：

- 通过 \`data-mantine-color-scheme\` 属性全局控制
- 支持 \`light\`、\`dark\`、\`auto\`（跟随系统偏好）三种模式
- 所有组件在暗色模式下自动适配，不需要开发者手动调整
- 提供 \`lightHidden\`、\`darkHidden\` props 方便在特定模式下隐藏元素
- 提供 \`ColorSchemeScript\` 在 SSR 时避免亮→暗闪烁（FOUC）

### 3.3 TypeScript 优先

Mantine 是用 TypeScript 编写的，提供完整的类型定义。所有组件的 props、主题配置、hooks 返回值都有精确的类型推断：

\`\`\`tsx
// 主题类型安全
const theme = createTheme({
  primaryColor: 'blue', // ✅ TypeScript 知道合法的颜色名
  // primaryColor: 'blu', // ❌ 编译错误
});

// useForm 类型推断
const form = useForm({
  initialValues: { name: '', age: 0 },
});
form.values.name; // string 类型
form.values.age;  // number 类型
\`\`\`

### 3.4 不锁定你的样式

Mantine 提供了多层级的样式定制能力，从最简单的 props 到最深层的组件内部元素覆盖：

1. **Style Props**：mt、px、bg、c 等快速设置样式
2. **className / style**：标准 React 方式覆盖
3. **Styles API**：\`classNames\` 和 \`styles\` props 精确控制组件内部每个元素
4. **vars prop**：通过 CSS 变量覆盖组件级样式
5. **Component.extend()**：在主题中全局覆盖组件默认 props 和样式
6. **静态类名**：所有组件都有 \`.mantine-{Component}-{element}\` 格式的静态类名，可以直接在 CSS 中覆盖
7. **MantineThemeProvider**：为应用局部设置独立主题

---

## 四、Mantine 与其他组件库的对比

| 维度 | Mantine | Material-UI (MUI) | Ant Design | Chakra UI |
|------|---------|-------------------|------------|-----------|
| 组件数量 | 138+ | 100+ | 60+ | 60+ |
| 包体积 | 小（按需引入） | 大 | 中 | 小 |
| 设计语言 | 独立设计 | Material Design | 企业级设计 | 简约设计 |
| 主题定制 | 极强（CSS 变量+Styles API） | 中等（较复杂） | 中等（CSS 变量） | 强（Style Props） |
| 表单管理 | 内置 @mantine/form | 需额外库 | 需额外库 | 无内置 |
| 暗色模式 | 原生支持 | 支持 | 支持 | 原生支持 |
| Hooks 数量 | 82+ | 10+ | 5+ | 20+ |
| TypeScript | 优秀 | 良好 | 良好 | 优秀 |
| 学习曲线 | 平缓 | 较陡 | 中等 | 平缓 |
| AI 友好度 | v9 极佳 | 一般 | 一般 | 良好 |
| 适用场景 | 通用/企业/AI 应用 | 企业级 Material 风格 | 后台管理系统 | 快速原型/通用 |

**Mantine 最适合的场景**：

1. **现代 Web 应用**：SaaS、管理后台、开发者工具
2. **快速原型开发**：开箱即用的组件让你几分钟就能搭出界面
3. **需要高度定制的设计系统**：Styles API 和主题系统让你可以打造完全自定义的视觉风格
4. **AI 辅助开发项目**：v9 的 AI 工作流优化让 AI 生成代码质量更高
5. **Next.js 项目**：与 App Router、SSR、RSC 完美集成

---

## 五、第一个 Mantine 应用

让我们快速搭建第一个 Mantine 应用，感受一下开发体验：

### 5.1 安装

\`\`\`bash
# 安装核心包和 hooks
npm install @mantine/core @mantine/hooks

# 如果需要表单
npm install @mantine/form
\`\`\`

### 5.2 Next.js App Router 配置

在根布局中引入样式和 MantineProvider：

\`\`\`jsx
// app/layout.js
import '@mantine/core/styles.css'; // 引入 Mantine 核心样式（仅需一次）
import { MantineProvider, ColorSchemeScript } from '@mantine/core';

export const metadata = { title: 'My Mantine App' };

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        {/* ColorSchemeScript：在 hydration 前设置色彩方案，避免闪烁 */}
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        {/* MantineProvider：提供主题上下文，注入 CSS 变量 */}
        <MantineProvider defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
\`\`\`

### 5.3 写一个简单页面

\`\`\`jsx
// app/page.js
import {
  Container,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Stack,
  Checkbox,
} from '@mantine/core';
import { useForm } from '@mantine/form';

export default function HomePage() {
  const form = useForm({
    initialValues: { email: '', password: '', remember: false },
    validate: {
      email: (value) => (/^\\S+@\\S+$/.test(value) ? null : '邮箱格式不正确'),
    },
  });

  return (
    <Container size={420} py={40}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={2} ta="center" mb="md">
          欢迎使用 Mantine
        </Title>
        <Text c="dimmed" ta="center" mb="xl">
          这是你的第一个 Mantine 页面
        </Text>

        <form onSubmit={form.onSubmit((values) => console.log(values))}>
          <Stack>
            <TextInput
              label="邮箱"
              placeholder="your@email.com"
              withAsterisk
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="密码"
              placeholder="请输入密码"
              withAsterisk
              {...form.getInputProps('password')}
            />
            <Checkbox
              label="记住我"
              {...form.getInputProps('remember', { type: 'checkbox' })}
            />
            <Button type="submit" fullWidth mt="md">
              登录
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
\`\`\`

不到 60 行代码，我们就有了一个功能完整的登录表单——包含布局、样式、表单验证、状态管理，全部由 Mantine 提供。

---

## 本章小结

- Mantine 是一个专注 UX 和 DX 的 React 组件库，v9 拥有 138+ 组件
- 核心设计目的：开箱即用、DX 优先、模块化、AI 友好
- 四大设计原则：可访问性第一、暗色模式优先、TypeScript 优先、不锁定样式
- 与其他组件库相比，Mantine 在表单管理、Hooks 数量、主题定制和 AI 友好度上具有优势
- 安装配置非常简单，只需引入一次样式和 MantineProvider

下一章我们将深入了解 Mantine 的架构和核心概念，为后续学习主题和表单打下基础。`,
  },
  {
    id: "mantinepro-architecture",
    icon: "🏗️",
    title: "Mantine 的架构与核心概念",
    group: "一、Mantine 的理念",
    content: `# Mantine 的架构与核心概念

## 一、整体架构

Mantine 采用**分层架构**，每一层都有明确的职责：

\`\`\`
┌─────────────────────────────────────────┐
│         你的应用代码                      │
├─────────────────────────────────────────┤
│  @mantine/form   @mantine/dates  @mantine/charts  │
│  @mantine/notifications  @mantine/modals  ...  │
├─────────────────────────────────────────┤
│            @mantine/core                │
│  ┌─────────────────────────────────┐   │
│  │  Components (Button, Input...)  │   │
│  ├─────────────────────────────────┤   │
│  │  Theme System / Styles API      │   │
│  ├─────────────────────────────────┤   │
│  │  CSS Variables Engine           │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│            @mantine/hooks               │
├─────────────────────────────────────────┤
│              React                      │
└─────────────────────────────────────────┘
\`\`\`

- **@mantine/hooks**：最底层，82+ 实用 Hooks，不包含任何 UI 组件，可以独立使用
- **@mantine/core**：核心层，包含组件、主题系统、CSS 变量引擎
- **功能包**：@mantine/form、@mantine/dates、@mantine/charts 等，建立在 core 或 hooks 之上
- **你的应用**：最上层，组合使用这些能力

---

## 二、核心概念

### 2.1 受控 vs 非受控模式

Mantine 组件（特别是表单相关组件）同时支持两种模式：

**受控模式**：组件的值由 React state 控制

\`\`\`jsx
const [value, setValue] = useState('');
<TextInput value={value} onChange={(e) => setValue(e.target.value)} />;
\`\`\`

**非受控模式（推荐）**：组件内部管理值，通过 ref 或 form 获取

\`\`\`jsx
// useForm 默认使用非受控模式
const form = useForm({
  mode: 'uncontrolled', // v7+ 推荐
  initialValues: { email: '' },
});

// key={form.key('email')} 确保非受控模式正常工作
<TextInput key={form.key('email')} {...form.getInputProps('email')} />;
\`\`\`

非受控模式的优势是**性能更好**——输入时不会触发整个组件树的重渲染。

### 2.2 Style Props

所有 Mantine 组件都支持一组通用的 Style Props，让你可以直接在 JSX 中设置常用样式：

\`\`\`jsx
<Box
  m="md"        // margin
  mt="xl"       // margin-top
  mx="auto"     // margin-left + margin-right
  p="lg"        // padding
  px="sm"       // padding-left + padding-right
  w="100%"      // width
  miw={200}     // min-width
  maw={600}     // max-width
  h={50}        // height
  bg="blue.1"   // background-color
  c="blue.6"    // color（文字颜色）
  display="flex"
  fz="md"       // font-size
  fw={600}      // font-weight
  ta="center"   // text-align
>
  快速设置样式
</Box>
\`\`\`

所有间距值（m、p 等）都引用主题中的 \`theme.spacing\`，颜色值引用 \`theme.colors\`。

### 2.3 Variant 和 Color

几乎所有可视化组件都支持 \`variant\` 和 \`color\` 两个核心 props：

**常用 variant**：

| Variant | 视觉效果 | 适用组件 |
|---------|---------|---------|
| \`filled\` | 实心填充（默认） | Button、Badge、ActionIcon |
| \`light\` | 浅色背景 | Button、Badge |
| \`outline\` | 描边 | Button、Badge、TextInput |
| \`subtle\` | 无背景，hover 时高亮 | Button、ActionIcon |
| \`transparent\` | 透明背景 | Button、ActionIcon |
| \`white\` | 白色文字 | Button（用于深色背景） |
| \`default\` | 默认灰色边框 | Button、TextInput |

\`\`\`jsx
<Group>
  <Button variant="filled" color="blue">实心</Button>
  <Button variant="light" color="blue">浅色</Button>
  <Button variant="outline" color="blue">描边</Button>
  <Button variant="subtle" color="blue">文字</Button>
  <Button variant="white" color="blue">白色</Button>
</Group>
\`\`\`

### 2.4 Size 和 Radius

\`size\` 控制组件的尺寸，\`radius\` 控制圆角：

\`\`\`jsx
// size: xs, sm, md, lg, xl 或具体数值
<Button size="xs">超小</Button>
<Button size="sm">小</Button>
<Button size="md">中（默认）</Button>
<Button size="lg">大</Button>
<Button size="xl">超大</Button>

// radius: xs, sm, md, lg, xl 或具体数值
<Button radius="xs">小圆角</Button>
<Button radius="md">中圆角</Button>
<Button radius="xl">大圆角</Button>
<Button radius={0}>无圆角</Button>
\`\`\`

### 2.5 组件命名约定

Mantine 遵循一致的命名约定：

- **输入类组件**：TextInput、Textarea、PasswordInput、NumberInput、Select、MultiSelect、DateInput
- **展示类组件**：Text、Title、Badge、Avatar、Kbd、Code、Table
- **反馈类组件**：Alert、Notification、Loader、Progress、Skeleton
- **布局类组件**：Container、Group、Stack、Flex、Grid、SimpleGrid、Space、Divider
- **导航类组件**：Tabs、Stepper、Pagination、Breadcrumbs、Anchor、NavLink
- **弹层类组件**：Modal、Drawer、Popover、Tooltip、Menu、HoverCard
- **按钮类组件**：Button、ActionIcon、UnstyledButton、CloseButton

---

## 三、理解 MantineProvider

MantineProvider 是 Mantine 应用的根组件，它负责：

1. **提供主题上下文**：通过 React Context 将主题对象传递给所有组件
2. **管理色彩方案**：处理 light/dark/auto 模式切换
3. **注入 CSS 变量**：将主题值生成 CSS 变量，供组件内部样式使用
4. **注入全局样式**：添加 CSS reset 和基础样式

\`\`\`jsx
import { MantineProvider, createTheme } from '@mantine/core';

// 自定义主题（在组件外创建，避免每次渲染重建）
const theme = createTheme({
  primaryColor: 'indigo',
  defaultRadius: 'md',
});

function App() {
  return (
    <MantineProvider
      theme={theme}                     // 自定义主题对象
      defaultColorScheme="light"        // 默认色彩方案
      withGlobalClasses={true}          // 是否注入全局工具类
      withCssVariables={true}           // 是否生成 CSS 变量
    >
      <YourApp />
    </MantineProvider>
  );
}
\`\`\`

> **重要**：MantineProvider 应该在应用根节点渲染，且通常只使用一次。如果你需要在局部覆盖主题，使用 MantineThemeProvider。

---

## 四、CSS 变量引擎

Mantine v9 的核心是 CSS 变量引擎。主题中的所有设计 token 都转换为 CSS 变量，组件通过这些变量获取样式值。

例如，当你设置 \`primaryColor: 'blue'\` 时，Mantine 会生成：

\`\`\`css
:root {
  --mantine-primary-color-0: #e7f5ff;
  --mantine-primary-color-1: #d0ebff;
  --mantine-primary-color-2: #a5d8ff;
  --mantine-primary-color-3: #74c0fc;
  --mantine-primary-color-4: #4dabf7;
  --mantine-primary-color-5: #339af0;
  --mantine-primary-color-6: #228be6;
  --mantine-primary-color-7: #1c7ed6;
  --mantine-primary-color-8: #1971c2;
  --mantine-primary-color-9: #1864ab;
  --mantine-primary-color-filled: var(--mantine-primary-color-6);
  --mantine-primary-color-filled-hover: var(--mantine-primary-color-7);
  --mantine-primary-color-light: rgba(34, 139, 230, 0.1);
  --mantine-color-text: var(--mantine-color-black);
  --mantine-color-body: var(--mantine-color-white);
  /* ... 更多变量 */
}
\`\`\`

组件内部使用这些变量：

\`\`\`css
.mantine-Button-root {
  background-color: var(--mantine-primary-color-filled);
  color: var(--mantine-color-white);
  border-radius: var(--mantine-radius-default);
  font-size: var(--mantine-font-size-md);
  padding: 0 var(--mantine-spacing-md);
}

.mantine-Button-root:hover {
  background-color: var(--mantine-primary-color-filled-hover);
}
\`\`\`

这意味着：

1. **切换主题不需要重新渲染**——只需要改变 CSS 变量值
2. **暗色模式切换非常快**——只需要切换一个 \`data-mantine-color-scheme\` 属性
3. **你可以在自己的 CSS 中使用这些变量**

---

## 本章小结

- Mantine 采用分层架构：hooks → core → 功能包 → 你的应用
- 核心概念包括：受控/非受控模式、Style Props、variant/color/size/radius、命名约定
- MantineProvider 是根组件，负责主题上下文、色彩方案、CSS 变量注入
- CSS 变量引擎是 Mantine 的核心，实现了高性能的主题切换和暗色模式

下一章我们将深入 Mantine 的 Theme 系统，这是 Mantine 最强大的能力之一。`,
  },
];
