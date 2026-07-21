# 第三章 · Mantine Theme 系统

> "Theme is the backbone of Mantine's customization system."

Mantine 的 Theme 系统是其最核心的设计之一。与许多 UI 库依赖 CSS-in-JS 运行时或复杂的样式覆盖不同，Mantine 采用了一套**基于 CSS 变量的主题架构**，在保持高性能的同时提供了极其灵活的定制能力。本章将从 `MantineProvider` 的使用、`createTheme` 的完整配置项、CSS 变量的生成机制、颜色系统、组件级样式覆盖、以及实战中的最佳实践等六个维度，全面剖析 Mantine 的主题系统。

---

## 3.1 MantineProvider：主题的入口

### 3.1.1 基本用法

`MantineProvider` 是 Mantine 主题系统的根组件，必须在应用的最外层渲染，且整个应用**只能使用一次**。它负责将主题配置注入到组件树中，并生成对应的 CSS 变量。

```javascript
import { MantineProvider, createTheme } from '@mantine/core';

// 创建主题配置
const theme = createTheme({
  primaryColor: 'blue',
  primaryShade: { light: 6, dark: 4 },
  defaultRadius: 'md',
  autoContrast: true,
});

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {/* 应用内容 */}
      <Button>Primary Button</Button>
    </MantineProvider>
  );
}
```

### 3.1.2 MantineProvider 的关键 Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `theme` | `MantineTheme` | `{}` | 主题配置对象，由 `createTheme` 生成 |
| `defaultColorScheme` | `'light' \| 'dark' \| 'auto'` | `'light'` | 默认色彩方案，`'auto'` 跟随系统 |
| `forceColorScheme` | `'light' \| 'dark'` | `undefined` | 强制色彩方案（调试用，生产环境慎用） |
| `cssVariablesResolver` | `Function` | `undefined` | 自定义 CSS 变量生成器 |
| `getRootElement` | `() => HTMLElement` | `undefined` | 指定 CSS 变量挂载的根元素 |
| `styleNonce` | `string` | `undefined` | CSP nonce，用于安全策略 |

### 3.1.3 与 Next.js App Router 的集成

在 Next.js App Router 中，`MantineProvider` 必须放在 Server Component 中，并通过 `layout.js` 导出：

```javascript
// app/layout.js
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';

const theme = createTheme({
  primaryColor: 'indigo',
  defaultRadius: 'md',
});

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
```

> **注意**：`@mantine/core/styles.css` 必须在 `layout.js` 中引入，不能在 `page.js` 中引入，否则样式不会生效。

---

## 3.2 createTheme：主题配置详解

`createTheme` 是 Mantine 提供的主题创建函数，它接受一个配置对象并返回完整的主题。这个函数不仅提供类型提示，还会对配置进行校验和合并。

### 3.2.1 完整配置项一览

```javascript
const theme = createTheme({
  // ============ 颜色系统 ============
  primaryColor: 'blue',           // 主色调，影响 Button、ActionIcon 等组件的默认颜色
  primaryShade: {                 // 主色调的色阶
    light: 6,                     // 亮色模式下的色阶（0-9）
    dark: 4,                      // 暗色模式下的色阶（0-9）
  },
  colors: {                       // 自定义颜色
    brand: [                      // 10 级色阶数组
      '#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6',
      '#42a5f5', '#2196f3', '#1e88e5', '#1976d2',
      '#1565c0', '#0d47a1',
    ],
  },

  // ============ 排版系统 ============
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2.125rem', lineHeight: '1.3' },
      h2: { fontSize: '1.625rem', lineHeight: '1.35' },
      h3: { fontSize: '1.375rem', lineHeight: '1.4' },
      h4: { fontSize: '1.125rem', lineHeight: '1.45' },
      h5: { fontSize: '1rem', lineHeight: '1.5' },
      h6: { fontSize: '0.875rem', lineHeight: '1.5' },
    },
  },

  // ============ 间距系统 ============
  spacing: {
    xs: '0.625rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
  },

  // ============ 圆角系统 ============
  defaultRadius: 'md',            // 默认圆角
  radius: {
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },

  // ============ 阴影系统 ============
  shadows: {
    xs: '0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.05)',
    sm: '0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.1)',
    md: '0 0.1875rem 0.375rem rgba(0, 0, 0, 0.1)',
    lg: '0 0.375rem 0.75rem rgba(0, 0, 0, 0.1)',
    xl: '0 0.625rem 1.25rem rgba(0, 0, 0, 0.1)',
  },

  // ============ 断点系统 ============
  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
  },

  // ============ 其他配置 ============
  autoContrast: true,             // 自动计算文本对比度
  luminanceThreshold: 0.3,        // 自动对比度的亮度阈值
  focusRing: 'auto',              // 焦点环显示策略
  cursorType: 'default',          // 光标类型
  defaultGradient: 'linear-gradient(45deg, #40c9ff 0%, #845ec2 100%)',
  lineHeights: {
    xs: '1.4',
    sm: '1.45',
    md: '1.55',
    lg: '1.65',
    xl: '1.75',
  },
  scale: 1,                       // 全局缩放比例
  respectReducedMotion: true,     // 尊重用户的减少动画偏好
});
```

### 3.2.2 颜色系统详解

Mantine 的颜色系统基于 **10 级色阶**（0-9），每个颜色包含从最浅到最深的 10 个变体。这种设计使得开发者可以轻松地在不同场景下选择合适的颜色深度。

#### 内置颜色

Mantine 提供了 14 种内置颜色：

| 颜色名 | 用途 | 色阶范围 |
|--------|------|----------|
| `dark` | 深色文本、背景 | 0-9 |
| `gray` | 中性色、边框、禁用状态 | 0-9 |
| `red` | 错误、危险操作 | 0-9 |
| `pink` | 强调、女性化设计 | 0-9 |
| `grape` | 紫色调强调 | 0-9 |
| `violet` | 紫色调 | 0-9 |
| `indigo` | 主色调候选 | 0-9 |
| `blue` | 主色调候选、链接 | 0-9 |
| `cyan` | 信息提示 | 0-9 |
| `teal` | 成功、正面反馈 | 0-9 |
| `green` | 成功、确认 | 0-9 |
| `lime` | 亮绿色强调 | 0-9 |
| `yellow` | 警告 | 0-9 |
| `orange` | 警告、注意 | 0-9 |

#### 自定义颜色

```javascript
const theme = createTheme({
  colors: {
    // 自定义品牌色
    brand: [
      '#e3f2fd', // brand[0] - 最浅
      '#bbdefb', // brand[1]
      '#90caf9', // brand[2]
      '#64b5f6', // brand[3]
      '#42a5f5', // brand[4]
      '#2196f3', // brand[5] - 中间色
      '#1e88e5', // brand[6]
      '#1976d2', // brand[7]
      '#1565c0', // brand[8]
      '#0d47a1', // brand[9] - 最深
    ],
  },
});

// 使用自定义颜色
<Button color="brand">Brand Button</Button>
<Text c="brand.7">Brand Text</Text>
```

#### primaryColor 与 primaryShade

`primaryColor` 决定了 `Button`、`ActionIcon`、`Loader` 等组件的默认颜色。`primaryShade` 则决定了在亮色和暗色模式下使用哪个色阶。

```javascript
const theme = createTheme({
  primaryColor: 'indigo',
  primaryShade: { light: 6, dark: 4 },
});

// 效果：
// - 亮色模式下，Button 使用 indigo[6]（较深）
// - 暗色模式下，Button 使用 indigo[4]（较浅）
// 这样设计是为了在不同背景下保持良好的对比度
```

### 3.2.3 排版系统

Mantine 的排版系统包含三个层面：

1. **全局字体**：`fontFamily` 和 `fontFamilyMonospace`
2. **字号**：`fontSizes` 定义了 5 级字号（xs-sm-md-lg-xl）
3. **标题**：`headings` 单独配置，包含字体、字重、各级标题的尺寸

```javascript
const theme = createTheme({
  fontFamily: '"Inter", sans-serif',
  headings: {
    fontFamily: '"Inter", sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2.5rem', lineHeight: '1.2' },
      h2: { fontSize: '2rem', lineHeight: '1.25' },
      h3: { fontSize: '1.5rem', lineHeight: '1.3' },
    },
  },
});
```

### 3.2.4 间距与圆角

Mantine 使用 **命名间距** 和 **命名圆角**，而不是硬编码的像素值。这种设计使得全局调整间距和圆角变得非常简单。

```javascript
// 使用间距
<Box p="md">Padding: 1rem</Box>
<Group gap="lg">Gap: 1.25rem</Group>

// 使用圆角
<Paper radius="lg">Border Radius: 0.75rem</Paper>
<Button radius="xl">Pill Button</Button>
```

---

## 3.3 CSS 变量的生成机制

### 3.3.1 自动生成的 CSS 变量

`MantineProvider` 会根据主题配置自动生成一系列 CSS 变量，这些变量可以在全局或组件内使用。

```css
/* 自动生成的 CSS 变量示例 */
:root {
  /* 颜色变量 */
  --mantine-color-primary: #228be6;
  --mantine-color-blue-0: #e7f5ff;
  --mantine-color-blue-1: #d0ebff;
  /* ... */
  
  /* 间距变量 */
  --mantine-spacing-xs: 0.625rem;
  --mantine-spacing-sm: 0.75rem;
  --mantine-spacing-md: 1rem;
  
  /* 圆角变量 */
  --mantine-radius-xs: 0.125rem;
  --mantine-radius-sm: 0.25rem;
  --mantine-radius-md: 0.5rem;
  
  /* 阴影变量 */
  --mantine-shadow-sm: 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.1);
  
  /* 字体变量 */
  --mantine-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --mantine-font-family-monospace: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  
  /* 字号变量 */
  --mantine-font-size-xs: 0.75rem;
  --mantine-font-size-sm: 0.875rem;
  --mantine-font-size-md: 1rem;
}
```

### 3.3.2 在自定义样式中使用 CSS 变量

```css
/* 在 CSS 文件中使用 Mantine 变量 */
.custom-card {
  background: var(--mantine-color-body);
  border: 1px solid var(--mantine-color-gray-3);
  border-radius: var(--mantine-radius-md);
  padding: var(--mantine-spacing-md);
  box-shadow: var(--mantine-shadow-sm);
}

.custom-card:hover {
  border-color: var(--mantine-color-blue-6);
  box-shadow: var(--mantine-shadow-md);
}
```

```javascript
// 在 JS 中使用 CSS 变量
const styles = {
  backgroundColor: 'var(--mantine-color-blue-0)',
  padding: 'var(--mantine-spacing-md)',
};

<Box style={styles}>Content</Box>
```

### 3.3.3 暗色模式下的 CSS 变量

Mantine 通过 `data-mantine-color-scheme` 属性区分亮色和暗色模式，CSS 变量会根据该属性自动切换。

```css
/* 亮色模式 */
:root[data-mantine-color-scheme="light"] {
  --mantine-color-body: #ffffff;
  --mantine-color-text: #212529;
  --mantine-color-gray-0: #f8f9fa;
}

/* 暗色模式 */
:root[data-mantine-color-scheme="dark"] {
  --mantine-color-body: #1a1b1e;
  --mantine-color-text: #c1c2c5;
  --mantine-color-gray-0: #25262b;
}
```

---

## 3.4 组件级样式覆盖

Mantine 提供了三种层级的样式覆盖机制，从简单到复杂依次是：

### 3.4.1 方式一：props 直接覆盖

最简单的方式是通过组件的 `style`、`className`、`sx` 等 props 直接覆盖样式。

```javascript
// 使用 style prop
<Button style={{ backgroundColor: 'red' }}>Red Button</Button>

// 使用 className prop
<Button className="custom-button">Custom Button</Button>

// 使用 sx prop（Mantine v6 遗留，v7+ 推荐使用 style 或 className）
<Button sx={{ backgroundColor: 'red' }}>Red Button</Button>
```

### 3.4.2 方式二：classNames 和 styles props

Mantine 的每个组件都暴露了 `classNames` 和 `styles` props，可以精确覆盖组件内部各个部分的样式。

```javascript
// 查看组件的 Styles API 文档，了解可覆盖的部分
// Button 的 Styles API 包括：root, inner, label, loader, section 等

<Button
  classNames={{
    root: 'custom-button-root',
    label: 'custom-button-label',
  }}
  styles={{
    root: {
      backgroundColor: 'var(--mantine-color-blue-6)',
      '&:hover': {
        backgroundColor: 'var(--mantine-color-blue-7)',
      },
    },
    label: {
      fontWeight: 700,
    },
  }}
>
  Custom Button
</Button>
```

### 3.4.3 方式三：主题级覆盖

如果希望全局覆盖某个组件的默认样式，可以在 `createTheme` 中使用 `components` 配置。

```javascript
const theme = createTheme({
  components: {
    Button: {
      // 覆盖默认 props
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
      // 覆盖默认样式
      styles: (theme, params) => ({
        root: {
          fontWeight: 600,
          textTransform: 'uppercase',
        },
      }),
      // 覆盖默认 classNames
      classNames: (theme, params) => ({
        root: 'global-button',
      }),
    },
    Card: {
      defaultProps: {
        padding: 'lg',
        radius: 'md',
        withBorder: true,
      },
      styles: (theme) => ({
        root: {
          backgroundColor: theme.colors.gray[0],
        },
      }),
    },
  },
});
```

### 3.4.4 方式四：vars prop（CSS 变量覆盖）

Mantine 的 `vars` prop 允许你在组件级别覆盖 CSS 变量，这是一种更现代、更高效的样式覆盖方式。

```javascript
<Button
  vars={{
    '--button-bg': 'var(--mantine-color-blue-6)',
    '--button-hover': 'var(--mantine-color-blue-7)',
    '--button-color': 'white',
  }}
>
  Custom Button
</Button>

<Card
  vars={{
    '--card-padding': 'var(--mantine-spacing-lg)',
    '--card-radius': 'var(--mantine-radius-md)',
  }}
>
  Card Content
</Card>
```

---

## 3.5 实战：构建企业级主题

### 3.5.1 主题配置文件组织

在实际项目中，建议将主题配置抽离到单独的文件中，便于维护和复用。

```javascript
// theme/index.js
import { createTheme } from '@mantine/core';
import { colors } from './colors';
import { typography } from './typography';
import { components } from './components';

export const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: { light: 6, dark: 4 },
  defaultRadius: 'md',
  autoContrast: true,
  colors,
  ...typography,
  components,
});
```

```javascript
// theme/colors.js
export const colors = {
  brand: [
    '#e3f2fd',
    '#bbdefb',
    '#90caf9',
    '#64b5f6',
    '#42a5f5',
    '#2196f3',
    '#1e88e5',
    '#1976d2',
    '#1565c0',
    '#0d47a1',
  ],
  // 其他自定义颜色...
};
```

```javascript
// theme/typography.js
export const typography = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },
  headings: {
    fontFamily: '"Inter", sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2.5rem', lineHeight: '1.2' },
      h2: { fontSize: '2rem', lineHeight: '1.25' },
      h3: { fontSize: '1.5rem', lineHeight: '1.3' },
      h4: { fontSize: '1.25rem', lineHeight: '1.35' },
      h5: { fontSize: '1rem', lineHeight: '1.4' },
      h6: { fontSize: '0.875rem', lineHeight: '1.4' },
    },
  },
};
```

```javascript
// theme/components.js
export const components = {
  Button: {
    defaultProps: {
      size: 'md',
      radius: 'md',
    },
  },
  Card: {
    defaultProps: {
      padding: 'lg',
      radius: 'md',
      withBorder: true,
    },
  },
  TextInput: {
    defaultProps: {
      size: 'md',
    },
  },
};
```

### 3.5.2 动态主题切换

在某些场景下，可能需要根据用户偏好或业务需求动态切换主题。

```javascript
'use client';

import { useState } from 'react';
import { MantineProvider, createTheme, Button, Group } from '@mantine/core';

const lightTheme = createTheme({
  primaryColor: 'blue',
  defaultColorScheme: 'light',
});

const darkTheme = createTheme({
  primaryColor: 'indigo',
  defaultColorScheme: 'dark',
});

export default function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(false);

  return (
    <MantineProvider theme={isDark ? darkTheme : lightTheme}>
      <Group>
        <Button onClick={() => setIsDark(!isDark)}>
          切换到{isDark ? '亮色' : '暗色'}模式
        </Button>
      </Group>
    </MantineProvider>
  );
}
```

> **注意**：动态切换主题会导致整个组件树重新渲染，可能影响性能。更推荐的方式是使用 `defaultColorScheme` 配合 `useMantineColorScheme` 来切换色彩方案，而不是切换整个主题。

### 3.5.3 主题与 Tailwind CSS 的共存

Mantine 可以与 Tailwind CSS 共存，但需要注意样式的优先级问题。

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // 引用 Mantine 的 CSS 变量
        primary: 'var(--mantine-color-primary)',
        body: 'var(--mantine-color-body)',
        text: 'var(--mantine-color-text)',
      },
      spacing: {
        xs: 'var(--mantine-spacing-xs)',
        sm: 'var(--mantine-spacing-sm)',
        md: 'var(--mantine-spacing-md)',
        lg: 'var(--mantine-spacing-lg)',
        xl: 'var(--mantine-spacing-xl)',
      },
    },
  },
};
```

```javascript
// 在组件中同时使用 Mantine 和 Tailwind
<Button className="bg-primary hover:bg-primary/90 text-white">
  Tailwind + Mantine
</Button>
```

---

## 3.6 最佳实践与常见问题

### 3.6.1 最佳实践

1. **优先使用 CSS 变量**：在自定义样式中优先使用 `var(--mantine-*)` 而不是硬编码的值，这样可以保持与主题的一致性。

2. **避免过度定制**：Mantine 的默认主题已经经过精心设计，除非有明确的品牌需求，否则不建议大幅修改默认配置。

3. **使用 `createTheme` 而不是直接传对象**：`createTheme` 提供类型提示和配置校验，可以避免很多低级错误。

4. **组件级覆盖优先于主题级覆盖**：如果只是个别组件需要特殊样式，使用 `styles` 或 `classNames` props，而不是在 `theme.components` 中全局覆盖。

5. **测试暗色模式**：在开发过程中定期切换到暗色模式检查样式，确保在所有色彩方案下都有良好的视觉效果。

### 3.6.2 常见问题

**Q: 为什么我的 CSS 变量没有生效？**

A: 确保 `@mantine/core/styles.css` 已经在根 layout 中引入，且 `MantineProvider` 包裹了所有使用 Mantine 组件的父组件。

**Q: 如何覆盖某个组件的默认样式？**

A: 有三种方式：
1. 使用 `styles` prop 覆盖单个实例
2. 使用 `theme.components` 覆盖全局默认
3. 使用 `vars` prop 覆盖 CSS 变量

**Q: 自定义颜色后，按钮颜色没有变化？**

A: 确保设置了 `primaryColor` 为你的自定义颜色名，且颜色数组包含 10 个色阶。

**Q: 如何在 Next.js 中避免 FOUC（Flash of Unstyled Content）？**

A: 使用 `defaultColorScheme="auto"` 并在 `<head>` 中添加同步脚本读取用户偏好：

```html
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        try {
          var colorScheme = localStorage.getItem('mantine-color-scheme') || 'light';
          document.documentElement.setAttribute('data-mantine-color-scheme', colorScheme);
        } catch (e) {}
      })();
    `,
  }}
/>
```

---

## 3.7 本章小结

本章深入剖析了 Mantine 的 Theme 系统，从 `MantineProvider` 的使用到 `createTheme` 的完整配置，从 CSS 变量的生成机制到组件级样式覆盖的四种方式，最后通过实战案例展示了如何构建企业级主题。

核心要点：
- `MantineProvider` 是主题系统的入口，必须在应用根节点使用且只能使用一次
- `createTheme` 提供类型安全的主题配置，支持颜色、排版、间距、圆角、阴影等全方位定制
- Mantine 基于 CSS 变量构建，性能优异且易于与外部样式方案共存
- 组件级样式覆盖提供了从简单到复杂的多种选择，满足不同场景需求
- 实战中建议将主题配置抽离到单独文件，便于维护和复用

下一章将深入讲解 Mantine 的 Form 验证系统，这是 Mantine 生态中另一个核心模块。
