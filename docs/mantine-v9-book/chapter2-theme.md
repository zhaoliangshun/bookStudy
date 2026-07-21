# 第二章 · Mantine Theme 主题系统

> 本章是全书的核心章节。Mantine v9 的所有视觉表现——颜色、字体、间距、圆角、阴影、组件样式——都由 Theme 系统统一驱动。掌握 Theme 系统，就掌握了定制 Mantine 的钥匙。

Mantine v9 的主题系统由三层架构组成：

1. **MantineProvider**：根级 Provider，负责注入主题上下文（Theme Context）、色彩方案（Color Scheme）与 CSS 变量
2. **MantineTheme 对象**：描述完整设计令牌（Design Tokens）的数据结构——颜色、字体、间距、圆角、阴影、断点等
3. **Styles API**：组件级样式覆盖机制，允许你针对任意组件的内部元素进行精细的样式定制

本章将依次深入这三层架构，并补充颜色系统、CSS 变量体系、响应式主题、多主题支持、TypeScript 类型安全、企业级品牌主题实战等多个专题。

---

## 2.1 MantineProvider 详解

### 2.1.1 MantineProvider 的作用与定位

`MantineProvider` 是 Mantine 应用的根级 Provider，它承担着四项核心职责：

1. **注入主题上下文**：通过 React Context 将主题配置分发给所有后代组件
2. **管理色彩方案**：控制亮色/暗色模式的切换，并响应系统偏好变化
3. **生成 CSS 变量**：将主题令牌转化为 CSS 自定义属性，注入到 `:root` 或指定元素上
4. **提供全局配置**：如默认属性、类名前缀、CSS 模块解析器等

### 2.1.2 基础配置

```tsx
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';

// 创建主题对象
const theme = createTheme({
  // 主色调
  primaryColor: 'indigo',
  // 默认圆角大小
  defaultRadius: 'md',
  // 字体族
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  // 等宽字体族（用于代码块）
  fontFamilyMonospace: 'JetBrains Mono, Fira Code, monospace',
  // 标题字体族
  headings: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '700',
  },
});

function App() {
  return (
    <MantineProvider
      theme={theme}
      // 默认色彩方案：'light' | 'dark' | 'auto'
      defaultColorScheme="auto"
      // CSS 变量选择器
      cssVariablesSelector=":root"
      // 强制色彩方案（忽略系统偏好）
      // forceColorScheme={undefined}
    >
      {/* 你的应用内容 */}
    </MantineProvider>
  );
}
```

### 2.1.3 嵌套 MantineProvider

Mantine 支持嵌套 `MantineProvider`，你可以在应用的某个子树中覆盖部分主题配置，而不影响其他部分：

```tsx
<MantineProvider theme={mainTheme}>
  {/* 使用主主题 */}
  <Button>普通按钮</Button>

  <MantineProvider theme={adminTheme}>
    {/* 使用管理员主题 */}
    <Button>管理员按钮</Button>
  </MantineProvider>
</MantineProvider>
```

这种嵌套机制在以下场景中非常有用：

- **多租户系统**：不同租户使用不同的品牌色
- **管理后台**：后台区域使用不同的视觉风格
- **A/B 测试**：在同一个应用中测试不同的主题方案

### 2.1.4 CSS 变量选择器

`cssVariablesSelector` 属性控制 Mantine 将 CSS 变量注入到哪个 DOM 元素上。默认值是 `:root`（即 `<html>` 元素），这意味着所有 CSS 变量都在全局作用域中。

在某些场景下，你可能希望将 CSS 变量限制在特定范围内：

```tsx
// 将 CSS 变量注入到指定的容器元素上
<MantineProvider cssVariablesSelector="#my-app">
  <div id="my-app">
    {/* CSS 变量只在 #my-app 内生效 */}
  </div>
</MantineProvider>
```

---

## 2.2 MantineTheme 对象深度解析

### 2.2.1 主题对象结构

`MantineTheme` 是一个包含所有设计令牌的 JavaScript 对象。通过 `createTheme()` 创建的主题对象会与 Mantine 的默认主题进行深度合并，这样你只需要覆盖需要修改的部分。

主题对象的主要结构如下：

```typescript
interface MantineTheme {
  // 颜色系统
  colors: Record<string, MantineColorsTuple>;
  primaryColor: string;
  primaryShade: MantineColorShade;
  // 色彩方案
  autoContrast: boolean;
  luminanceThreshold: number;
  // 字体
  fontFamily: string;
  fontFamilyMonospace: string;
  fontSizes: Record<string, string>;
  lineHeights: Record<string, string>;
  headings: {
    fontFamily: string;
    fontWeight: string;
    sizes: Record<string, { fontSize: string; lineHeight: string; fontWeight?: string }>;
  };
  // 间距
  spacing: Record<string, string>;
  // 圆角
  radius: Record<string, string>;
  defaultRadius: MantineRadius;
  // 阴影
  shadows: Record<string, string>;
  // 断点（响应式）
  breakpoints: Record<string, string>;
  // 组件样式
  components: Record<string, MantineComponentTheme>;
  // 其他全局配置
  cursorType: 'default' | 'pointer';
  scale: number;
  respectReducedMotion: boolean;
  // 其他...
}
```

### 2.2.2 颜色系统

Mantine 的颜色系统是其主题系统中最核心的部分。每个 Mantine 组件都使用颜色系统来定义其视觉外观。

#### 默认颜色

Mantine 内置了以下颜色调色板：

| 颜色名 | 描述 | 典型用途 |
|--------|------|----------|
| `dark` | 中性暗色 | 暗色模式背景、文字 |
| `gray` | 中性灰色 | 边框、禁用状态、辅助文字 |
| `red` | 红色 | 错误、危险操作、删除 |
| `pink` | 粉色 | 装饰性元素 |
| `grape` | 紫色（偏红） | 装饰性元素 |
| `violet` | 紫罗兰色 | 装饰性元素 |
| `indigo` | 靛蓝色 | 默认主色调（推荐） |
| `blue` | 蓝色 | 信息、链接 |
| `cyan` | 青色 | 信息提示 |
| `teal` | 蓝绿色 | 成功状态 |
| `green` | 绿色 | 成功、确认 |
| `lime` | 黄绿色 | 警告提示 |
| `yellow` | 黄色 | 警告 |
| `orange` | 橙色 | 强调、注意 |

每种颜色都包含 10 个色阶（0-9），其中 0 是最浅的，9 是最深的。

#### 使用颜色

```tsx
import { Button, Text, Box } from '@mantine/core';

function ColorDemo() {
  return (
    <>
      {/* 使用颜色名称 + 色阶 */}
      <Button color="blue.5">蓝色按钮</Button>
      <Button color="teal.7">深蓝绿按钮</Button>
      <Button color="red">红色按钮（默认色阶）</Button>

      {/* 在 Style Props 中使用 */}
      <Box bg="blue.1" c="blue.9" p="md">
        <Text>浅蓝背景 + 深蓝文字</Text>
      </Box>
    </>
  );
}
```

#### 自定义颜色

你可以通过 `createTheme` 添加自定义颜色：

```tsx
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
  colors: {
    // 自定义品牌色（10 个色阶）
    brand: [
      '#f0f5ff', // 0 - 最浅
      '#d6e4ff',
      '#adc8ff',
      '#84a9ff',
      '#6690ff',
      '#3366ff', // 5 - 中间色
      '#2541db',
      '#1930b7',
      '#102693',
      '#091a7a', // 9 - 最深
    ],
  },
  // 设置主色调
  primaryColor: 'brand',
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <Button color="brand">品牌色按钮</Button>
    </MantineProvider>
  );
}
```

#### primaryShade 与 autoContrast

`primaryShade` 控制主色调的默认色阶。你可以为亮色和暗色模式分别设置：

```tsx
const theme = createTheme({
  primaryColor: 'indigo',
  primaryShade: { light: 6, dark: 8 },
  // 自动对比度：当背景色和文字色对比度不足时自动调整
  autoContrast: true,
  // 亮度阈值（用于 autoContrast 判断）
  luminanceThreshold: 0.3,
});
```

### 2.2.3 字体系统

Mantine 的字体系统分为三个层级：

1. **全局字体**：`fontFamily` 和 `fontFamilyMonospace`
2. **字号**：`fontSizes` 对象，包含 `xs`、`sm`、`md`、`lg`、`xl` 等预设尺寸
3. **标题字体**：`headings` 对象，包含 `h1`-`h6` 的独立配置

```tsx
const theme = createTheme({
  // 全局字体
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, Fira Code, monospace',

  // 字号预设
  fontSizes: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    md: '1rem',      // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
  },

  // 行高预设
  lineHeights: {
    xs: '1.4',
    sm: '1.45',
    md: '1.55',
    lg: '1.6',
    xl: '1.65',
  },

  // 标题配置
  headings: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2.25rem', lineHeight: '1.3' },
      h2: { fontSize: '1.875rem', lineHeight: '1.35' },
      h3: { fontSize: '1.5rem', lineHeight: '1.4' },
      h4: { fontSize: '1.25rem', lineHeight: '1.45' },
      h5: { fontSize: '1.125rem', lineHeight: '1.5' },
      h6: { fontSize: '1rem', lineHeight: '1.5' },
    },
  },
});
```

### 2.2.4 间距系统

Mantine 使用一套统一的间距预设，所有的 padding、margin、gap 等属性都使用这些预设值：

```tsx
const theme = createTheme({
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
  },
});
```

使用间距预设：

```tsx
<Box p="md" m="lg" gap="sm">
  {/* p="md" → padding: 1rem */}
  {/* m="lg" → margin: 1.5rem */}
  {/* gap="sm" → gap: 0.75rem */}
</Box>
```

### 2.2.5 圆角系统

```tsx
const theme = createTheme({
  defaultRadius: 'md',
  radius: {
    xs: '0.125rem',  // 2px
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '1rem',      // 16px
    xl: '2rem',      // 32px
  },
});
```

### 2.2.6 阴影系统

```tsx
const theme = createTheme({
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
  },
});
```

### 2.2.7 断点系统（响应式）

Mantine 的断点系统基于 `min-width` 媒体查询。默认断点：

```tsx
const theme = createTheme({
  breakpoints: {
    xs: '36em',    // 576px
    sm: '48em',    // 768px
    md: '62em',    // 992px
    lg: '75em',    // 1200px
    xl: '88em',    // 1408px
  },
});
```

在组件中使用响应式样式：

```tsx
// Style Props 中使用响应式值
<Box
  w={{ base: '100%', sm: '80%', md: '60%' }}
  p={{ base: 'sm', md: 'lg' }}
  display={{ base: 'block', md: 'flex' }}
>
  响应式内容
</Box>
```

---

## 2.3 CSS 变量体系

### 2.3.1 自动生成的 CSS 变量

Mantine 会自动将主题中的所有令牌生成为 CSS 变量，并注入到 DOM 中。这些变量遵循一致的命名规范：

```css
/* 颜色变量 */
--mantine-color-blue-0: #e7f5ff;
--mantine-color-blue-1: #d0ebff;
--mantine-color-blue-2: #a5d8ff;
/* ... 直到 blue-9 */

/* 主色调变量 */
--mantine-primary-color-0: var(--mantine-color-indigo-0);
--mantine-primary-color-filled: var(--mantine-color-indigo-6);
--mantine-primary-color-filled-hover: var(--mantine-color-indigo-7);

/* 间距变量 */
--mantine-spacing-xs: 0.5rem;
--mantine-spacing-sm: 0.75rem;
--mantine-spacing-md: 1rem;
--mantine-spacing-lg: 1.5rem;
--mantine-spacing-xl: 2rem;

/* 圆角变量 */
--mantine-radius-xs: 0.125rem;
--mantine-radius-sm: 0.25rem;
--mantine-radius-md: 0.5rem;
--mantine-radius-lg: 1rem;
--mantine-radius-xl: 2rem;

/* 字号变量 */
--mantine-font-size-xs: 0.75rem;
--mantine-font-size-sm: 0.875rem;
--mantine-font-size-md: 1rem;
--mantine-font-size-lg: 1.125rem;
--mantine-font-size-xl: 1.25rem;

/* 阴影变量 */
--mantine-shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--mantine-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
/* ... */
```

### 2.3.2 在自定义 CSS 中使用 CSS 变量

CSS 变量系统让你可以在自定义 CSS 中直接使用 Mantine 的设计令牌，保持视觉一致性：

```css
/* 在你的 CSS 模块或全局样式中 */
.my-custom-card {
  background-color: var(--mantine-color-blue-1);
  color: var(--mantine-color-blue-9);
  padding: var(--mantine-spacing-md);
  border-radius: var(--mantine-radius-md);
  box-shadow: var(--mantine-shadow-sm);
}

.my-custom-card:hover {
  background-color: var(--mantine-color-blue-2);
  box-shadow: var(--mantine-shadow-md);
}

/* 暗色模式适配 */
[data-mantine-color-scheme='dark'] .my-custom-card {
  background-color: var(--mantine-color-dark-6);
  color: var(--mantine-color-dark-0);
}
```

### 2.3.3 CSS 变量的优势

1. **零运行时开销**：CSS 变量由浏览器原生支持，不需要 JavaScript 运行时计算
2. **暗色模式无缝切换**：色彩方案切换时，只需修改 CSS 变量值，不需要重新渲染组件
3. **第三方集成**：任何 CSS-in-JS 方案或纯 CSS 方案都可以使用 Mantine 的 CSS 变量
4. **性能优化**：CSS 变量变化只触发 paint/render，不触发 JavaScript 执行

---

## 2.4 Styles API —— 组件级样式定制

### 2.4.1 什么是 Styles API

Styles API 是 Mantine 提供的组件级样式定制机制。每个 Mantine 组件由多个内部元素（如 `root`、`input`、`label`、`description` 等）组成，Styles API 允许你针对这些内部元素进行样式覆盖。

### 2.4.2 基本用法

```tsx
import { TextInput } from '@mantine/core';

function StyledInput() {
  return (
    <TextInput
      label="用户名"
      placeholder="请输入用户名"
      // 通过 styles prop 覆盖内部元素样式
      styles={{
        root: {
          // 根元素
          marginBottom: '1rem',
        },
        input: {
          // 输入框元素
          backgroundColor: 'var(--mantine-color-blue-0)',
          borderColor: 'var(--mantine-color-blue-3)',
          '&:focus': {
            borderColor: 'var(--mantine-color-blue-6)',
          },
        },
        label: {
          // 标签元素
          fontWeight: 600,
          color: 'var(--mantine-color-gray-8)',
        },
      }}
    />
  );
}
```

### 2.4.3 每个组件的内部元素

要查看一个组件有哪些内部元素可以自定义，可以查阅 Mantine 官方文档中该组件页面的 "Styles API" 部分。每个组件的内部元素命名是固定的，例如：

| 组件 | 内部元素 |
|------|----------|
| `Button` | `root`、`inner`、`label` |
| `TextInput` | `root`、`input`、`label`、`description`、`error` |
| `Modal` | `root`、`inner`、`content`、`header`、`title`、`body`、`overlay`、`close` |
| `Select` | `root`、`input`、`label`、`description`、`error`、`dropdown`、`option`、`section` |
| `Table` | `table`、`thead`、`tbody`、`tr`、`th`、`td` |
| `Tabs` | `root`、`list`、`tab`、`tabLabel`、`panel` |

### 2.4.4 classNames prop

除了 `styles` prop，Mantine 还提供了 `classNames` prop，让你可以使用 CSS 类名来定制样式：

```tsx
import { TextInput } from '@mantine/core';
import classes from './MyInput.module.css';

function StyledInput() {
  return (
    <TextInput
      label="用户名"
      classNames={{
        root: classes.root,
        input: classes.input,
        label: classes.label,
      }}
    />
  );
}
```

### 2.4.5 全局组件样式

如果你希望全局覆盖某个组件的默认样式（而不是在每个实例上重复设置），可以在主题中配置：

```tsx
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
  components: {
    // 全局覆盖 Button 组件的默认样式
    Button: {
      defaultProps: {
        radius: 'xl',
        variant: 'filled',
      },
      styles: {
        root: {
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      },
    },

    // 全局覆盖 TextInput 的样式
    TextInput: {
      defaultProps: {
        size: 'md',
      },
      styles: {
        input: {
          backgroundColor: 'var(--mantine-color-gray-0)',
        },
      },
    },

    // 全局覆盖 Card 的样式
    Card: {
      defaultProps: {
        shadow: 'sm',
        padding: 'lg',
        radius: 'md',
        withBorder: true,
      },
    },
  },
});
```

---

## 2.5 响应式主题

### 2.5.1 响应式 Style Props

Mantine 的 Style Props 原生支持响应式值，使用对象语法指定不同断点下的值：

```tsx
import { Box, Text, Stack } from '@mantine/core';

function ResponsiveLayout() {
  return (
    <Box
      // 响应式宽度
      w={{ base: '100%', sm: '80%', md: '60%', lg: '50%' }}
      // 响应式内边距
      p={{ base: 'sm', md: 'lg', lg: 'xl' }}
      // 响应式显示
      display={{ base: 'block', md: 'none' }}
      // 响应式 flex 方向
      style={{
        flexDirection: 'column',
        '@media (min-width: 768px)': {
          flexDirection: 'row',
        },
      }}
    >
      <Text>响应式内容</Text>
    </Box>
  );
}
```

### 2.5.2 响应式样式函数

Mantine 提供了 `em()` 和 `rem()` 辅助函数，帮助你编写响应式样式：

```tsx
import { em, rem } from '@mantine/core';

// em(16) → '1em'（在默认 16px 字号下）
// rem(16) → '1rem'

const styles = {
  '@media (min-width: ${em(768)})': {
    // 在 768px 以上生效
    padding: rem(24),
  },
};
```

---

## 2.6 多主题支持

### 2.6.1 场景：多主题切换

在实际项目中，你可能需要支持多个主题（如品牌主题、节日主题、高对比度主题等）。Mantine 支持通过嵌套 Provider 或动态切换主题来实现：

```tsx
import { useState } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';

// 定义多个主题
const lightTheme = createTheme({
  primaryColor: 'indigo',
  colors: {
    brand: [/* ... */],
  },
});

const darkTheme = createTheme({
  primaryColor: 'cyan',
  colors: {
    brand: [/* 暗色版本的颜色 */],
  },
});

const highContrastTheme = createTheme({
  primaryColor: 'dark',
  colors: {
    brand: [/* 高对比度颜色 */],
  },
  autoContrast: true,
  luminanceThreshold: 0.5,
});

const themes = {
  light: lightTheme,
  dark: darkTheme,
  highContrast: highContrastTheme,
};

function App() {
  const [currentTheme, setCurrentTheme] = useState('light');

  return (
    <MantineProvider theme={themes[currentTheme]}>
      <select
        value={currentTheme}
        onChange={(e) => setCurrentTheme(e.target.value)}
      >
        <option value="light">亮色主题</option>
        <option value="dark">暗色主题</option>
        <option value="highContrast">高对比度主题</option>
      </select>
      {/* 应用内容 */}
    </MantineProvider>
  );
}
```

### 2.6.2 使用 useMantineTheme 读取主题

在组件中，可以使用 `useMantineTheme` hook 来读取当前主题配置：

```tsx
import { useMantineTheme, Text, Box } from '@mantine/core';

function ThemeInfo() {
  const theme = useMantineTheme();

  return (
    <Box>
      <Text>主色调：{theme.primaryColor}</Text>
      <Text>默认圆角：{theme.defaultRadius}</Text>
      <Text>字体族：{theme.fontFamily}</Text>
      <Text>断点数量：{Object.keys(theme.breakpoints).length}</Text>
    </Box>
  );
}
```

---

## 2.7 TypeScript 类型安全

### 2.7.1 主题类型推断

Mantine 提供了完整的 TypeScript 类型定义，`createTheme()` 函数返回的类型会自动推断：

```typescript
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'indigo',
  colors: {
    brand: [
      '#f0f5ff', '#d6e4ff', '#adc8ff', '#84a9ff',
      '#6690ff', '#3366ff', '#2541db', '#1930b7',
      '#102693', '#091a7a',
    ],
  },
});

// theme 的类型会被自动推断，包括自定义的 'brand' 颜色
type MyTheme = typeof theme;
```

### 2.7.2 扩展类型定义

如果你需要为自定义颜色或自定义属性扩展类型，可以使用 TypeScript 的模块扩充：

```typescript
// types/mantine.d.ts
import { MantineColorsTuple } from '@mantine/core';

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: {
      brand: MantineColorsTuple;
    };
  }
}
```

---

## 2.8 企业级品牌主题实战

### 2.8.1 完整示例：构建企业品牌主题

假设你正在为一个名为 "Acme Corp" 的企业构建应用，品牌色为深蓝色系：

```tsx
import { createTheme, MantineProvider, Button, Card, TextInput, Container, Title, Text, Group, Stack } from '@mantine/core';
import '@mantine/core/styles.css';

// 定义 Acme Corp 品牌色（10 个色阶）
const acmeColors = {
  // 品牌主色：深蓝
  acme: [
    '#edf2ff', // 0 - 最浅，用于背景
    '#dbe4ff', // 1
    '#bac8ff', // 2
    '#91a7ff', // 3
    '#748ffc', // 4
    '#5c7cfa', // 5 - 中间色，用于主按钮
    '#4c6ef5', // 6 - 主色（primary）
    '#4263eb', // 7 - hover 状态
    '#3b5bdb', // 8
    '#364fc7', // 9 - 最深，用于文字
  ],

  // 辅助色：暖橙（用于强调、CTA）
  accent: [
    '#fff4e6', '#ffe8cc', '#ffd8a8', '#ffc078',
    '#ffa94d', '#ff922b', '#fd7e14', '#e8590c',
    '#d9480f', '#bf4000',
  ],

  // 成功色：翠绿
  success: [
    '#ebfbee', '#d3f9d8', '#b2f2bb', '#8ce99a',
    '#69db7c', '#51cf66', '#40c057', '#37b24d',
    '#2f9e44', '#2b8a3e',
  ],
};

// 创建 Acme 主题
const acmeTheme = createTheme({
  // 颜色
  colors: acmeColors,
  primaryColor: 'acme',
  primaryShade: { light: 6, dark: 5 },

  // 字体
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, Fira Code, monospace',
  headings: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '700',
  },

  // 圆角——略微圆润
  defaultRadius: 'md',
  radius: {
    xs: '0.25rem',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },

  // 间距——8px 基准
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2.5rem',
  },

  // 阴影——更柔和的阴影
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 4px 8px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.04)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.04)',
  },

  // 全局组件样式
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 600,
          transition: 'all 0.15s ease',
        },
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        radius: 'lg',
        padding: 'lg',
      },
    },
    TextInput: {
      styles: {
        input: {
          '&:focus': {
            borderColor: 'var(--mantine-color-acme-6)',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <MantineProvider theme={acmeTheme} defaultColorScheme="auto">
      <Container size="md" py="xl">
        <Title order={1} mb="md">
          Acme Corp 管理平台
        </Title>
        <Text c="dimmed" mb="xl">
          企业级 Mantine v9 主题定制示例
        </Text>

        <Group mb="xl">
          <Button color="acme">品牌主按钮</Button>
          <Button color="accent">强调按钮</Button>
          <Button color="success">成功按钮</Button>
          <Button variant="outline" color="acme">轮廓按钮</Button>
        </Group>

        <Card>
          <Stack>
            <Title order={3}>用户信息</Title>
            <TextInput label="用户名" placeholder="请输入用户名" />
            <TextInput label="邮箱" placeholder="请输入邮箱" />
            <Button color="acme" fullWidth>提交</Button>
          </Stack>
        </Card>
      </Container>
    </MantineProvider>
  );
}
```

### 2.8.2 主题最佳实践

1. **使用 `createTheme()` 而非直接修改对象**：`createTheme()` 会与默认主题进行深度合并，确保你不会遗漏必要的配置
2. **定义 10 个色阶**：自定义颜色必须提供完整的 10 个色阶，否则可能导致组件渲染异常
3. **优先使用 CSS 变量**：在自定义样式中使用 Mantine 的 CSS 变量，而不是硬编码颜色值，这样暗色模式切换才能正确工作
4. **利用 `primaryShade`**：为亮色和暗色模式分别设置主色调色阶，确保两种模式下都有良好的对比度
5. **全局组件样式只放默认值**：在 `components` 中只设置影响全局的默认值和样式，每个实例的特殊需求通过 `styles` 或 `classNames` prop 覆盖
6. **关注暗色模式**：在自定义样式时始终考虑暗色模式，使用 `[data-mantine-color-scheme='dark']` 选择器适配

---

## 2.9 本章小结

本章我们全面深入地学习了 Mantine v9 的 Theme 系统：

1. **MantineProvider**：根级 Provider，负责主题注入、色彩方案管理和 CSS 变量生成
2. **MantineTheme 对象**：包含颜色、字体、间距、圆角、阴影、断点等所有设计令牌
3. **颜色系统**：内置 14 种颜色调色板，支持自定义颜色，每个颜色 10 个色阶
4. **CSS 变量体系**：自动生成，零运行时开销，支持暗色模式无缝切换
5. **Styles API**：组件级样式覆盖机制，通过 `styles` 和 `classNames` prop 定制内部元素
6. **响应式主题**：Style Props 原生支持响应式值，使用对象语法
7. **多主题支持**：通过嵌套 Provider 或动态切换实现
8. **TypeScript 类型安全**：完整的类型推断和模块扩充支持
9. **企业级实战**：完整的品牌主题构建示例和最佳实践

在下一章中，我们将学习 Mantine 的另一个核心系统——**Form 表单验证**，掌握如何使用 `@mantine/form` 构建复杂、可靠、用户友好的表单。