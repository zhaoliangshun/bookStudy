// =============================================================
// Mantine v9 深度实战 —— 第 2 批章节（Theme 主题系统）
// -------------------------------------------------------------
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// =============================================================

export const chapters = [
  {
    id: "mantinepro-theme-overview",
    icon: "🎨",
    title: "Theme 系统总览",
    group: "二、Mantine Theme 系统",
    content: `# Theme 系统总览

## 一、主题是什么

在 Mantine 中，**主题（Theme）** 是一个包含所有设计 token（颜色、字体、间距、圆角、阴影等）的 JavaScript 对象。它决定了你的应用长什么样——按钮什么颜色、输入框多大、文字用什么字体。

Mantine 的主题系统是其最强大的特性之一。理解它，你就能：

- 自定义品牌色，一键改变整个应用的色调
- 统一设置字体、间距、圆角等设计规范
- 为单个组件设置全局默认 props
- 实现亮色/暗色模式无缝切换
- 精确控制每个组件每个内部元素的样式

---

## 二、主题对象的完整结构

Mantine 主题对象（MantineTheme）包含以下属性：

| 属性分类 | 属性名 | 说明 |
|---------|--------|------|
| **基础** | \`white\`, \`black\` | 白色和黑色的 hex 值 |
| **焦点** | \`focusRing\` | 焦点环模式（auto/always/never） |
| **缩放** | \`scale\` | rem 单位比例 |
| **字体** | \`fontFamily\`, \`fontFamilyMonospace\`, \`headings\` | 字体族配置 |
| **字号** | \`fontSizes\`, \`lineHeights\`, \`fontWeights\` | 字号、行高、字重 |
| **颜色** | \`colors\`, \`primaryColor\`, \`primaryShade\`, \`autoContrast\` | 颜色系统 |
| **间距** | \`spacing\` | 间距值（margin/padding） |
| **圆角** | \`radius\`, \`defaultRadius\` | 圆角值 |
| **阴影** | \`shadows\` | 阴影值 |
| **断点** | \`breakpoints\` | 响应式断点 |
| **光标** | \`cursorType\` | 交互元素光标类型 |
| **渐变** | \`defaultGradient\` | 默认渐变配置 |
| **组件** | \`components\` | 组件级默认 props 和样式覆盖 |
| **其他** | \`other\` | 自定义属性 |

所有这些属性都有合理的默认值，你只需要覆盖需要自定义的部分。

---

## 三、createTheme：创建主题

使用 \`createTheme\` 函数创建主题覆盖对象：

\`\`\`jsx
import { createTheme, MantineProvider } from '@mantine/core';

// createTheme 接收一个部分主题对象
// 它会与默认主题深度合并
const theme = createTheme({
  // 只写你想覆盖的属性
  primaryColor: 'indigo',
  defaultRadius: 'md',
  fontFamily: '"Inter", -apple-system, sans-serif',
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <YourApp />
    </MantineProvider>
  );
}
\`\`\`

> **最佳实践**：始终在组件外部调用 \`createTheme\`。如果在组件 body 内创建，每次渲染都会生成新的主题对象，导致不必要的重渲染。

---

## 四、MantineProvider 详解

MantineProvider 是主题系统的入口，它的主要 props：

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| \`theme\` | MantineThemeOverride | - | 主题覆盖对象 |
| \`defaultColorScheme\` | 'light'/'dark'/'auto' | 'light' | 默认色彩方案 |
| \`forceColorScheme\` | 'light'/'dark' | - | 强制色彩方案（忽略用户选择） |
| \`colorSchemeManager\` | Manager | localStorage | 色彩方案存储管理器 |
| \`classNamesPrefix\` | string | 'mantine' | 静态类名前缀 |
| \`withCssVariables\` | boolean | true | 是否注入 CSS 变量 |
| \`withStaticClasses\` | boolean | true | 是否添加静态类名 |
| \`withGlobalClasses\` | boolean | true | 是否注入全局工具类 |
| \`cssVariablesResolver\` | function | - | 自定义 CSS 变量生成器 |
| \`deduplicateInlineStyles\` | boolean | false | React 19 内联样式去重优化 |

### 4.1 defaultColorScheme

\`\`\`jsx
// 亮色模式（默认）
<MantineProvider defaultColorScheme="light">...</MantineProvider>

// 暗色模式
<MantineProvider defaultColorScheme="dark">...</MantineProvider>

// 自动：跟随系统偏好
<MantineProvider defaultColorScheme="auto">...</MantineProvider>
\`\`\`

### 4.2 ColorSchemeScript：避免 SSR 闪烁

在 Next.js 等 SSR 框架中，需要在 \`<head>\` 中添加 ColorSchemeScript，在 hydration 前同步设置色彩方案，避免亮→暗的闪烁（FOUC）：

\`\`\`jsx
// app/layout.js
import { ColorSchemeScript, MantineProvider } from '@mantine/core';

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 在页面渲染前执行，读取 localStorage 并设置 data-mantine-color-scheme */}
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
\`\`\`

---

## 五、多主题合并

使用 \`mergeThemeOverrides\` 合并多个主题覆盖对象：

\`\`\`jsx
import { createTheme, mergeThemeOverrides, MantineProvider } from '@mantine/core';

// 基础主题
const baseTheme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
});

// 企业定制主题
const corporateTheme = createTheme({
  fontFamily: 'Roboto, sans-serif',
  autoContrast: true,
  cursorType: 'pointer',
});

// 组件默认 props 覆盖
const componentsTheme = createTheme({
  components: {
    Button: { defaultProps: { size: 'lg' } },
    TextInput: { defaultProps: { size: 'md' } },
  },
});

// 合并所有主题
const finalTheme = mergeThemeOverrides(baseTheme, corporateTheme, componentsTheme);

function App() {
  return (
    <MantineProvider theme={finalTheme}>
      <YourApp />
    </MantineProvider>
  );
}
\`\`\`

---

## 六、局部主题：MantineThemeProvider

使用 MantineThemeProvider 为应用的某个部分设置独立主题，而不影响其他部分：

\`\`\`jsx
import { MantineThemeProvider, Button, createTheme } from '@mantine/core';

// 为某个区域创建特殊主题
const darkSectionTheme = createTheme({
  primaryColor: 'cyan',
  components: {
    Button: Button.extend({
      defaultProps: { variant: 'outline', color: 'cyan' },
    }),
  },
});

function App() {
  return (
    <div>
      {/* 这里使用全局主题的蓝色按钮 */}
      <Button>全局按钮</Button>

      {/* 这里使用局部主题的青色描边按钮 */}
      <MantineThemeProvider theme={darkSectionTheme}>
        <Button>局部按钮</Button>
      </MantineThemeProvider>

      {/* 这里又回到全局主题 */}
      <Button>全局按钮</Button>
    </div>
  );
}
\`\`\`

---

## 七、useMantineTheme：在组件中访问主题

使用 \`useMantineTheme\` hook 在组件中获取当前主题对象：

\`\`\`jsx
import { useMantineTheme, Box, Text } from '@mantine/core';

function ThemeInfo() {
  const theme = useMantineTheme();

  return (
    <Box p="md">
      <Text>主色名：{theme.primaryColor}</Text>
      <Text>主色阶：{JSON.stringify(theme.primaryShade)}</Text>
      <Text>蓝色第 6 阶：{theme.colors.blue[6]}</Text>
      <Text>默认圆角：{theme.defaultRadius}</Text>
      <Text>字体：{theme.fontFamily}</Text>
      {/* 可以直接使用主题值设置内联样式 */}
      <Box
        mt="md"
        p="md"
        style={{
          backgroundColor: theme.colors.blue[0],
          color: theme.colors.blue[9],
          borderRadius: theme.radius.md,
        }}
      >
        使用主题色的卡片
      </Box>
    </Box>
  );
}
\`\`\`

---

## 本章小结

- 主题是包含所有设计 token 的对象，决定应用的视觉外观
- 使用 createTheme 创建主题覆盖，与默认主题深度合并
- MantineProvider 是主题入口，支持色彩方案管理和 CSS 变量注入
- mergeThemeOverrides 可以合并多个主题对象
- MantineThemeProvider 用于局部主题覆盖
- useMantineTheme hook 可以在组件中访问当前主题

下一章我们深入颜色系统，这是主题定制中最常用的部分。`,
  },
  {
    id: "mantinepro-theme-colors",
    icon: "🎨",
    title: "颜色系统深度解析",
    group: "二、Mantine Theme 系统",
    content: `# 颜色系统深度解析

## 一、颜色系统的设计

Mantine 的颜色系统是其主题系统中最精妙的部分。每种颜色都是一个**包含 10 个色阶（shade）的数组**，索引从 0（最浅）到 9（最深）：

\`\`\`js
colors: {
  blue: [
    '#e7f5ff', // 0 - 最浅，适合背景
    '#d0ebff', // 1
    '#a5d8ff', // 2
    '#74c0fc', // 3
    '#4dabf7', // 4
    '#339af0', // 5
    '#228be6', // 6 - 亮色模式常用主色
    '#1c7ed6', // 7 - hover 色
    '#1971c2', // 8 - 暗色模式常用主色
    '#1864ab', // 9 - 最深
  ],
}
\`\`\`

内置颜色有：dark、gray、red、pink、grape、violet、indigo、blue、cyan、teal、green、lime、yellow、orange。

### 色阶使用约定

| 色阶 | 用途 |
|------|------|
| 0-2 | 背景色、hover 背景、标签背景 |
| 3-4 | 边框、分割线 |
| 5-6 | 主色、按钮填充（亮色模式） |
| 7-8 | hover 状态、按钮填充（暗色模式） |
| 9 | 文字、深色背景 |

---

## 二、自定义品牌色

添加自定义颜色只需在 \`colors\` 中提供 10 个色阶，并将 \`primaryColor\` 设为该颜色名：

\`\`\`jsx
import { createTheme, MantineProvider, Button } from '@mantine/core';

// 海军蓝品牌色
const NAVY = '#1a365d';

const theme = createTheme({
  colors: {
    // 自定义颜色必须提供至少 10 个色阶
    navy: [
      '#eef2f7', // 0 - 浅背景
      '#d0dceb', // 1
      '#a2b9d6', // 2
      '#7496c1', // 3
      '#4a75ad', // 4
      '#2d5694', // 5
      '#1e4278', // 6
      NAVY,      // 7 - 主色
      '#152d4f', // 8 - hover
      '#0f2340', // 9 - 最深
    ],
  },
  // 将主色设为自定义颜色
  primaryColor: 'navy',
  primaryShade: 7, // 使用索引 7 作为主色
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <Button>海军蓝按钮</Button>
    </MantineProvider>
  );
}
\`\`\`

---

## 三、virtualColor：虚拟颜色

virtualColor 是一种特殊颜色，它在**亮色和暗色模式下引用不同的颜色**：

\`\`\`jsx
import { createTheme, virtualColor, MantineProvider } from '@mantine/core';

const theme = createTheme({
  colors: {
    // 虚拟颜色：亮色模式用 cyan，暗色模式用 pink
    primary: virtualColor({
      name: 'primary',
      light: 'cyan',  // 亮色模式引用 cyan 色板
      dark: 'pink',   // 暗色模式引用 pink 色板
    }),
  },
  primaryColor: 'primary',
});
\`\`\`

虚拟颜色非常有用——你可以让品牌色在亮色模式下是蓝色，在暗色模式下是深蓝色，自动适配。

---

## 四、colorsTuple：单色填充

\`colorsTuple\` 将一个颜色用于所有 10 个色阶：

\`\`\`jsx
import { colorsTuple, createTheme } from '@mantine/core';

const theme = createTheme({
  colors: {
    // 所有色阶都是白色（一般不推荐用于主色）
    white: colorsTuple('#ffffff'),
    // 从动态数组创建
    brandPink: colorsTuple(Array.from({ length: 10 }, () => '#FFC0CB')),
  },
});
\`\`\`

---

## 五、generateColors：自动生成色板

使用 \`@mantine/colors-generator\` 从一个基础颜色自动生成完整的 10 色阶：

\`\`\`bash
npm install chroma-js @mantine/colors-generator
\`\`\`

\`\`\`jsx
import { generateColors } from '@mantine/colors-generator';
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
  colors: {
    // 从一个基础颜色自动生成和谐的色板
    brand: generateColors('#375EAC'),
  },
  primaryColor: 'brand',
});
\`\`\`

> 提示：generateColors 对较暗的颜色（blue、violet、red 系）效果最好，对黄色系效果一般。

---

## 六、primaryShade：主色阴影

\`primaryShade\` 指定哪个色阶（0-9）作为主色。可以分别为亮色和暗色模式设置不同值：

\`\`\`jsx
const theme = createTheme({
  primaryColor: 'blue',
  // 亮色模式用 6，暗色模式用 8（暗色模式需要更亮的色阶才能看清）
  primaryShade: { light: 6, dark: 8 },
});
\`\`\`

默认值是 \`{ light: 6, dark: 8 }\`，这对大多数颜色是最佳选择。

---

## 七、autoContrast：自动对比度

当 \`autoContrast\` 为 true 时，Mantine 会自动调整 filled 变体按钮的文字颜色为黑色或白色，以确保足够的对比度：

\`\`\`jsx
const theme = createTheme({
  autoContrast: true, // 开启自动对比度
  luminanceThreshold: 0.3, // 亮度阈值（0-1），超过则文字用黑色
});
\`\`\`

强烈建议开启这个选项，它可以避免"浅黄色按钮配白色文字看不清"的问题。

---

## 八、色彩方案管理（Dark Mode）

### 8.1 切换色彩方案

使用 \`useMantineColorScheme\` hook 切换亮/暗模式：

\`\`\`jsx
import {
  useMantineColorScheme,
  useComputedColorScheme,
  Button,
} from '@mantine/core';

function ColorSchemeToggle() {
  // useMantineColorScheme：获取和设置色彩方案
  // colorScheme 可能是 'light'、'dark' 或 'auto'
  const { setColorScheme } = useMantineColorScheme();

  // useComputedColorScheme：获取计算后的色彩方案
  // 返回值永远是 'light' 或 'dark'（如果设置了 auto，会解析为实际值）
  const computed = useComputedColorScheme('light');

  return (
    <Button
      onClick={() => setColorScheme(computed === 'dark' ? 'light' : 'dark')}
    >
      {computed === 'dark' ? '☀️ 亮色' : '🌙 暗色'}
    </Button>
  );
}
\`\`\`

### 8.2 自定义存储

默认情况下，色彩方案偏好存储在 localStorage 的 \`mantine-color-scheme-value\` key 中。你可以自定义：

\`\`\`jsx
import { localStorageColorSchemeManager, MantineProvider } from '@mantine/core';

const colorSchemeManager = localStorageColorSchemeManager({
  key: 'my-app-theme', // 自定义 localStorage key
});

<MantineProvider colorSchemeManager={colorSchemeManager}>
  <App />
</MantineProvider>;
\`\`\`

---

## 九、TypeScript 类型扩展

自定义颜色后，扩展 TypeScript 类型以获得类型提示：

\`\`\`tsx
import { DefaultMantineColor, MantineColorsTuple } from '@mantine/core';

// 将自定义颜色名加入联合类型
type ExtendedColors = 'navy' | 'brand' | DefaultMantineColor;

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedColors, MantineColorsTuple>;
  }
}
\`\`\`

---

## 本章小结

- 每种颜色是 10 个色阶的数组，从最浅（0）到最深（9）
- 自定义颜色需要提供 10 个色阶，设置 primaryColor 和 primaryShade
- virtualColor 实现亮/暗模式不同颜色
- generateColors 自动从基础颜色生成色板
- autoContrast 自动调整文字颜色确保可读性
- useMantineColorScheme 和 useComputedColorScheme 管理色彩方案切换
- TypeScript 扩展为自定义颜色提供类型安全

下一章我们继续探索字体、间距、圆角等其他设计 token。`,
  },
];
