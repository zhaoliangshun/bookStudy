# 第二章 Mantine Theme 系统

> 本章是全书的重点章节。Mantine v9 的所有视觉表现——颜色、字体、间距、圆角、阴影、组件样式——都由 Theme 系统统一驱动。掌握 Theme 系统，就掌握了定制 Mantine 的钥匙。

Mantine v9 的 Theme 系统由三层组成：

1. **MantineProvider**：根级 Provider，注入 theme context、color scheme 与 CSS 变量。
2. **MantineTheme 对象**：描述设计 token 的完整数据结构（颜色、字体、间距等）。
3. **Styles API**：组件级样式覆盖机制，可针对任意内部元素定制样式。

本章将依次深入这三层，并补充颜色系统、CSS 变量、响应式主题、Color Scheme 管理、多主题、TypeScript 类型安全等多个专题，最后给出一个企业级品牌主题实战。

---

## 2.1 MantineProvider 详解

### 2.1.1 作用与定位

`MantineProvider` 是 Mantine 应用的根 Provider，它承担三件核心工作：

- **提供 theme context**：把 `theme` 对象通过 React Context 下发给所有 Mantine 组件。
- **管理 color scheme**：维护当前色彩方案（light / dark / auto），并通过 `colorSchemeManager` 持久化。
- **注入 CSS 变量**：根据 theme 对象生成一组 CSS 变量，注入到 `cssVariablesSelector`（默认 `:root`）所指向的元素，使任意 CSS / inline style 都能消费这些 token。

> ⚠️ **使用约束**：`MantineProvider` 必须渲染在应用根节点、且整个应用只能有一个顶层 `MantineProvider`。若需要局部主题覆盖，请使用 2.9 节介绍的 `MantineThemeProvider`，而不是嵌套 `MantineProvider`。

### 2.1.2 MantineProvider 全部 Props

下表列出 `MantineProvider` 的所有 Props（基于 Mantine v9.4 源码，共 17 个；除 `children` 外其余均可选）：

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `theme` | `MantineThemeOverride` | - | 主题覆盖对象，由 `createTheme()` 生成 |
| `colorSchemeManager` | `MantineColorSchemeManager` | `localStorageManager` | 色彩方案存储管理器，控制如何读写持久化值 |
| `defaultColorScheme` | `'light' \| 'dark' \| 'auto'` | `'light'` | 默认色彩方案（当 manager 取不到值时使用） |
| `forceColorScheme` | `'light' \| 'dark'` | - | 强制色彩方案；设置后忽略 manager 与 defaultColorScheme |
| `cssVariablesSelector` | `string` | `':root'` | CSS 变量注入到的选择器（同时会附加到 `:host`） |
| `withCssVariables` | `boolean` | `true` | 是否注入主题 CSS 变量 |
| `deduplicateCssVariables` | `boolean` | `true` | 是否去重 CSS 变量（与默认值相同的变量不输出） |
| `getRootElement` | `() => HTMLElement \| undefined` | `() => document.documentElement` | 用于设置 `data-mantine-color-scheme` 属性的根元素；SSR 时须返回 `undefined` |
| `classNamesPrefix` | `string` | `'mantine'` | 静态类名前缀，如 `mantine-Button-root` |
| `getStyleNonce` | `() => string` | - | 为生成的 `<style>` 标签生成 `nonce`，用于 CSP |
| `cssVariablesResolver` | `CSSVariablesResolver` | - | 自定义 CSS 变量生成函数，可追加或覆盖默认变量 |
| `withStaticClasses` | `boolean` | `true` | 是否生成静态类名（如 `mantine-Button-root`），关闭后体积更小但调试困难 |
| `withGlobalClasses` | `boolean` | `true` | 是否注入全局类（`hiddenFrom` / `visibleFrom` / `lightHidden` / `darkHidden` 依赖于此） |
| `stylesTransform` | `MantineStylesTransform` | - | 将 `styles` / `sx` 转换为 css class 的转换器，用于对接 CSS-in-JS 库 |
| `deduplicateInlineStyles` | `boolean` | `false` | React 19 内联样式去重，相同响应式样式的组件共享同一 `<style>` 标签 |
| `env` | `'default' \| 'test'` | `'default'` | 运行环境；`'test'` 会禁用过渡与 Portal |
| `children` | `ReactNode` | - | 应用内容 |

> 📌 **关于 `stylesTransform`**：用户最初列出的 16 个 Props 漏掉了它，但它在 v9 源码中确实存在，主要用于将 inline `styles` 转换为 class，便于与 Emotion / styled-components 等 CSS-in-JS 方案集成。

### 2.1.3 基本用法

```javascript
'use client';

import { MantineProvider, createTheme } from '@mantine/core';

// 在组件外部创建 theme，避免每次渲染都产生新对象
const theme = createTheme({
  primaryColor: 'indigo',     // 主色改为 indigo
  defaultRadius: 'md',        // 默认圆角
  fontFamily: 'Inter, sans-serif',
});

export default function App({ children }) {
  return (
    // MantineProvider 必须包裹整个应用
    <MantineProvider theme={theme}>
      {children}
    </MantineProvider>
  );
}
```

### 2.1.4 高级配置示例

下面的示例覆盖了大多数生产环境会用到的高级 Prop：

```javascript
'use client';

import {
  MantineProvider,
  createTheme,
  localStorageManager,
} from '@mantine/core';

const theme = createTheme({
  primaryColor: 'blue',
  classNamesPrefix: 'myapp',    // 静态类前缀改为 myapp-Button-root
});

export default function App({ children }) {
  return (
    <MantineProvider
      theme={theme}
      // 显式指定 localStorage 管理器（默认值，可省略）
      colorSchemeManager={localStorageManager}
      // 默认深色（首次访问且无缓存时）
      defaultColorScheme="dark"
      // 注入到自定义选择器（如 Shadow DOM 场景可改为 ':host'）
      cssVariablesSelector=":root"
      // 关闭 CSS 变量去重（调试时便于查看所有变量）
      deduplicateCssVariables={false}
      // CSP 场景：为生成的 <style> 标签附加 nonce
      getStyleNonce={() => window.__CSP_NONCE__}
      // 追加自定义 CSS 变量（见 2.5 节）
      cssVariablesResolver={(t) => ({
        '--my-brand': '#ff6b6b',
      })}
      // React 19 内联样式去重，提升性能
      deduplicateInlineStyles
    >
      {children}
    </MantineProvider>
  );
}
```

---

## 2.2 主题对象完整结构

`MantineTheme` 接口描述了一份完整的设计 token。下面逐属性讲解，并在末尾给出默认值速查表。

### 2.2.1 属性详解

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `focusRing` | `'auto' \| 'always' \| 'never'` | `'auto'` | 焦点环显示策略：`auto` 仅键盘导航时显示，`always` 键盘+鼠标均显示，`never` 始终隐藏（不推荐） |
| `scale` | `number` | `1` | rem 单位缩放系数，与 `<html>` 的 `font-size` 配合使用 |
| `fontSmoothing` | `boolean` | `true` | 是否在 body 上设置 `font-smoothing` 属性 |
| `white` | `string` | `'#fff'` | 主题白色 |
| `black` | `string` | `'#000'` | 主题黑色 |
| `colors` | `MantineThemeColors` | 内置 14 色 | 颜色对象，键为颜色名，值为至少 10 阶的色阶数组（详见 2.4 节） |
| `primaryShade` | `number \| { light, dark }` | `{ light: 6, dark: 8 }` | 主色色阶索引；可统一指定，也可分别指定亮/暗模式 |
| `primaryColor` | `string` | `'blue'` | 默认主色名（`theme.colors` 的键），不支持直接写 hex/rgb |
| `variantColorResolver` | `VariantColorsResolver` | `defaultVariantColorsResolver` | 根据 variant 解析颜色的函数，可深度定制 Button/ActionIcon 等着色逻辑 |
| `autoContrast` | `boolean` | `false` | filled 变体下是否根据背景色自动调整文本颜色 |
| `luminanceThreshold` | `number` | `0.3` | 自动对比度的亮度阈值（仅在 `autoContrast: true` 时生效） |
| `fontFamily` | `string` | 系统字体栈 | 全局字体族 |
| `fontFamilyMonospace` | `string` | 系统等宽字体栈 | 等宽字体族，用于 `Code` 等组件 |
| `headings` | `object` | 见下文 | 标题样式：`fontFamily`、`fontWeight`、`textWrap`、`sizes`（h1–h6） |
| `radius` | `Record<MantineSize, string>` | 见下文 | 圆角 token 对象 |
| `defaultRadius` | `MantineRadius` | `'md'` | 默认圆角（`radius` 的键或任意 CSS 值） |
| `spacing` | `Record<MantineSize, string>` | 见下文 | 间距 token 对象 |
| `fontSizes` | `Record<MantineSize, string>` | 见下文 | 字号 token 对象 |
| `lineHeights` | `Record<MantineSize, string>` | 见下文 | 行高 token 对象 |
| `fontWeights` | `Record<'regular'\|'medium'\|'bold', string>` | 见下文 | 字重 token 对象 |
| `breakpoints` | `Record<MantineSize, string>` | 见下文 | 断点 token 对象（**单位为 em**） |
| `shadows` | `Record<MantineSize, string>` | 见下文 | 阴影 token 对象 |
| `respectReducedMotion` | `boolean` | `false` | 是否遵守用户系统的「减少动态」偏好 |
| `cursorType` | `'default' \| 'pointer'` | `'default'` | 交互元素的光标类型 |
| `defaultGradient` | `{ from, to, deg? }` | `{ from: 'blue', to: 'cyan', deg: 45 }` | `variant="gradient"` 的默认渐变 |
| `activeClassName` | `string` | `'mantine-active'` | 元素激活态附加的类名（Button、ActionIcon 等） |
| `focusClassName` | `string` | `''` | 元素聚焦态附加的类名；设置后会覆盖 `focusRing` |
| `components` | `MantineThemeComponents` | `{}` | 组件级覆盖配置（详见 2.6 节） |
| `other` | `MantineThemeOther` | `{}` | 任意自定义 token，可通过 `useMantineTheme().other` 读取（详见 2.10 节） |

### 2.2.2 默认值速查表

> 📌 **v9 重要变更**：`fontWeights.medium` 由 v7 的 `500` 改为 `600`。从 v7/v8 升级时请注意视觉差异。

**fontWeights（v9）**

| 键 | 值 |
|----|----|
| `regular` | `400` |
| `medium` | `600`（v9 变更！） |
| `bold` | `700` |

**fontSizes**

| 键 | 值 |
|----|----|
| `xs` | `12px` (`rem(12)`) |
| `sm` | `14px` |
| `md` | `16px` |
| `lg` | `18px` |
| `xl` | `20px` |

**lineHeights**

| 键 | 值 |
|----|----|
| `xs` | `1.4` |
| `sm` | `1.45` |
| `md` | `1.55`（默认） |
| `lg` | `1.6` |
| `xl` | `1.65` |

**headings.sizes**

| 键 | fontSize | lineHeight |
|----|----------|------------|
| `h1` | `34px` | `1.3` |
| `h2` | `26px` | `1.35` |
| `h3` | `22px` | `1.4` |
| `h4` | `18px` | `1.45` |
| `h5` | `16px` | `1.5` |
| `h6` | `14px` | `1.5` |

**spacing**

| 键 | 值 |
|----|----|
| `xs` | `10px` |
| `sm` | `12px` |
| `md` | `16px` |
| `lg` | `20px` |
| `xl` | `32px` |

**radius**

| 键 | 值 |
|----|----|
| `xs` | `2px` |
| `sm` | `4px` |
| `md` | `8px` |
| `lg` | `16px` |
| `xl` | `32px` |

**breakpoints（em 单位）**

| 键 | 值 |
|----|----|
| `xs` | `36em` |
| `sm` | `48em` |
| `md` | `62em` |
| `lg` | `75em` |
| `xl` | `88em` |

**其他默认值**

- `primaryColor`: `'blue'`
- `primaryShade`: `{ light: 6, dark: 8 }`
- `autoContrast`: `false`
- `luminanceThreshold`: `0.3`
- `focusRing`: `'auto'`
- `cursorType`: `'default'`
- `defaultRadius`: `'md'`
- `defaultGradient`: `{ from: 'blue', to: 'cyan', deg: 45 }`
- `activeClassName`: `'mantine-active'`
- `focusClassName`: `''`（空字符串）
- `respectReducedMotion`: `false`

### 2.2.3 代码示例：覆盖多个 token

```javascript
import { createTheme } from '@mantine/core';

const theme = createTheme({
  // 主色与色阶
  primaryColor: 'grape',
  primaryShade: { light: 6, dark: 7 },

  // 字体
  fontFamily: '"Inter", -apple-system, sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", monospace',
  headings: {
    fontFamily: '"Inter", sans-serif',
    fontWeight: '700',
    textWrap: 'balance',     // v9 新增：支持 wrap/nowrap/balance/pretty/stable
    sizes: {
      h1: { fontSize: '2.5rem', lineHeight: '1.2' },
      h2: { fontSize: '2rem', lineHeight: '1.25' },
    },
  },

  // 自动对比度
  autoContrast: true,
  luminanceThreshold: 0.3,

  // 圆角与间距
  defaultRadius: 'lg',
  spacing: { xs: '8px', sm: '12px', md: '16px', lg: '24px', xl: '40px' },

  // 交互
  cursorType: 'pointer',
  respectReducedMotion: true,
});
```

---

## 2.3 createTheme 函数

### 2.3.1 作用

`createTheme(theme: MantineThemeOverride): MantineThemeOverride` 的作用非常简单——**存储 theme override 对象**。它本身不做深度合并（合并发生在 `MantineProvider` 内部），但它能让你在模块作用域显式声明"这是一个 theme override"，避免在组件 body 内创建对象导致不必要的 re-render。

> 💡 **关键点**：theme 对象必须在组件外部创建。若写在组件内部，每次渲染都会产生新对象引用，导致所有消费 theme 的组件重新渲染。

### 2.3.2 基本用法

```javascript
import { createTheme, MantineProvider } from '@mantine/core';

// ✅ 在模块顶层创建：引用稳定
const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  fontFamily: '"Inter", sans-serif',
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <AppContent />
    </MantineProvider>
  );
}
```

### 2.3.3 mergeThemeOverrides：合并多个主题

当主题配置分散在多个文件时，可用 `mergeThemeOverrides(...overrides)` 将它们合并为一个 override 对象：

```javascript
import {
  createTheme,
  mergeThemeOverrides,
  MantineProvider,
  MantineThemeProvider,
} from '@mantine/core';

// ============ 创建主题 ============
// createTheme 返回一个 MantineThemeOverride 对象
// 它会与默认主题深度合并
// 重要：在组件外部创建，避免每次渲染都创建新对象
const baseTheme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  fontFamily: '"Inter", sans-serif',
});

// ============ 合并多个主题 ============
// mergeThemeOverrides 将多个主题覆盖对象合并
const extendedTheme = createTheme({
  cursorType: 'pointer',
  autoContrast: true,
});

const finalTheme = mergeThemeOverrides(baseTheme, extendedTheme);

// 在应用中使用
function App() {
  return (
    <MantineProvider theme={finalTheme}>
      <AppContent />
    </MantineProvider>
  );
}
```

### 2.3.4 MantineThemeProvider：局部主题覆盖

`MantineThemeProvider` 用于应用内某个子树的主题隔离。它接收一个 `theme` prop，会与外层主题深度合并后作用于子树：

```javascript
import { MantineThemeProvider, createTheme, Button } from '@mantine/core';

// 为局部子树定制主题
const sectionTheme = createTheme({
  primaryColor: 'pink',
  defaultRadius: 'xl',
});

function Demo() {
  return (
    <div>
      {/* 子树内：Button 是 pink + 圆角 xl */}
      <MantineThemeProvider theme={sectionTheme}>
        <Button>Pink Section</Button>
      </MantineThemeProvider>

      {/* 子树外：沿用全局主题 */}
      <Button>Global Button</Button>
    </div>
  );
}
```

> 📌 **`MantineProvider` vs `MantineThemeProvider`**：前者是应用根 Provider（含 color scheme、CSS 变量注入），后者仅用于局部主题合并，不重复注入 CSS 变量。局部主题覆盖请使用 `MantineThemeProvider`。

---

## 2.4 自定义颜色系统（重点中的重点）

颜色系统是 Mantine Theme 中最核心、也最容易踩坑的部分。本节分五个小节展开。

### 2.4.1 添加自定义颜色

**核心规则**：

- 每种颜色必须包含**至少 10 个 shade**（索引 0–9）。
- shade 从浅到深排列：索引 0 最浅，索引 9 最深。
- 支持 HEX、RGB、HSL、OKLCH（v9 新增）四种格式。
- 通常索引 6–7 作为亮色模式主色，索引 8–9 作为暗色模式主色。

```javascript
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
  colors: {
    // 自定义"海洋蓝"色板：从浅到深 10 个色阶
    // 索引 0 最浅，索引 9 最深
    // 通常索引 6-7 作为主色使用
    'ocean-blue': [
      '#7AD1DD', // 0 - 最浅，用于背景
      '#5FCCDB', // 1
      '#44CADC', // 2
      '#2AC9DE', // 3
      '#1AC2D9', // 4
      '#11B7CD', // 5
      '#09ADC3', // 6 - 主色（亮色模式默认）
      '#0E99AC', // 7 - hover 色
      '#128797', // 8 - 主色（暗色模式默认）
      '#147885', // 9 - 最深
    ],
    // 自定义"亮粉色"色板
    'bright-pink': [
      '#F0BBDD', '#ED9BCF', '#EC7CC3', '#ED5DB8', '#F13EAF',
      '#F71FA7', '#FF00A1', '#E00890', '#C50E82', '#AD1374',
    ],
  },
  // 指定主色为自定义颜色
  primaryColor: 'ocean-blue',
  // 指定主色阴影：亮色模式用 6，暗色模式用 8
  primaryShade: { light: 6, dark: 8 },
});
```

### 2.4.2 虚拟颜色（Virtual Color）

虚拟颜色是一种"在亮色/暗色模式下引用不同颜色"的机制。它对外表现为一个普通的颜色名，但在切换 color scheme 时自动切换底层引用。

```javascript
import { createTheme, MantineProvider, virtualColor } from '@mantine/core';

const theme = createTheme({
  colors: {
    // virtualColor 创建一个虚拟颜色
    // 在亮色模式下使用 cyan，在暗色模式下使用 pink
    // 对外表现为一个名为 'primary' 的颜色
    primary: virtualColor({
      name: 'primary',
      dark: 'pink',    // 暗色模式下引用 pink 色
      light: 'cyan',   // 亮色模式下引用 cyan 色
    }),
  },
  primaryColor: 'primary',
});
```

> 📌 虚拟颜色本质是一个带 `'mantine-virtual-color': true` 标记的 `MantineColorsTuple`。Mantine 内部会根据当前 color scheme 解析为对应的真实颜色。

### 2.4.3 colorsTuple 函数

`colorsTuple(input: string | string[]): MantineColorsTuple` 用于：

- 将单一颜色展开为所有 shade 都相同（仅用于特殊场景，不推荐常规使用）。
- 将动态数组转换为类型合法的 Mantine color tuple。

```javascript
import { colorsTuple, createTheme } from '@mantine/core';

const theme = createTheme({
  colors: {
    // 所有 shade 都使用同一颜色（不推荐，仅用于特殊场景）
    custom: colorsTuple('#FFC0CB'),
    // 从动态数组创建
    dynamic: colorsTuple(Array.from({ length: 10 }, () => '#FFC0CB')),
  },
});
```

### 2.4.4 颜色生成器

手动凑齐 10 阶色板费时费力。`@mantine/colors-generator` 提供了 `generateColors(baseColor)` 函数，从一个基础颜色自动生成完整色阶：

```javascript
// 安装颜色生成器
// npm install chroma-js @mantine/colors-generator

import { generateColors } from '@mantine/colors-generator';
import { MantineProvider, createTheme } from '@mantine/core';

// 从一个基础颜色生成完整的 10 色阶
// 注意：对较暗的颜色（blue、violet、red）效果最好
const theme = createTheme({
  colors: {
    'pale-blue': generateColors('#375EAC'),
  },
  primaryColor: 'pale-blue',
});
```

> 💡 对过浅的颜色（如 `#eee`）生成的色阶区分度不足，建议输入中等亮度的颜色。

### 2.4.5 TypeScript 类型扩展

默认情况下，`MantineColor` 类型只包含内置 14 色。要让自定义颜色获得类型提示，需要扩展 `MantineThemeColorsOverride` 接口：

```typescript
import { DefaultMantineColor, MantineColorsTuple } from '@mantine/core';

// 扩展 MantineColor 类型，让自定义颜色获得类型提示
type ExtendedCustomColors = 'oceanBlue' | 'brightPink' | DefaultMantineColor;

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, MantineColorsTuple>;
  }
}
```

声明后，所有接收 `MantineColor` 的 prop（如 `<Button color="oceanBlue">`）都会获得自动补全与类型检查。

---

## 2.5 CSS 变量系统（重点）

`MantineProvider` 会基于 theme 对象生成一整套 CSS 变量，并注入到 `cssVariablesSelector`（默认 `:root`）。这些变量既可在 CSS 文件中使用，也可在 inline style 中使用，是连接 JS theme 与 CSS 的桥梁。

### 2.5.1 字体相关变量

| CSS 变量 | 来源 | 示例值 |
|----------|------|--------|
| `--mantine-font-family` | `theme.fontFamily` | 系统字体栈 |
| `--mantine-font-family-monospace` | `theme.fontFamilyMonospace` | 等宽字体栈 |
| `--mantine-font-family-headings` | `theme.headings.fontFamily` | 标题字体 |
| `--mantine-font-weight-normal` | `theme.fontWeights.regular` | `400` |
| `--mantine-font-weight-medium` | `theme.fontWeights.medium` | `600` |
| `--mantine-font-weight-bold` | `theme.fontWeights.bold` | `700` |
| `--mantine-headings-font-weight` | `theme.headings.fontWeight` | `700` |
| `--mantine-line-height` | `theme.lineHeights.md` | `1.55` |

### 2.5.2 Font size 变量

| CSS 变量 | 默认值 |
|----------|--------|
| `--mantine-font-size-xs` | `0.75rem` (12px) |
| `--mantine-font-size-sm` | `0.875rem` (14px) |
| `--mantine-font-size-md` | `1rem` (16px) |
| `--mantine-font-size-lg` | `1.125rem` (18px) |
| `--mantine-font-size-xl` | `1.25rem` (20px) |

同时为标题生成 `--mantine-h1-font-size` … `--mantine-h6-font-size` 及对应 `line-height`。

### 2.5.3 颜色相关变量

每种颜色 `X` 与每个 shade `N`（0–9）都会生成一组变量：

| CSS 变量 | 说明 |
|----------|------|
| `--mantine-color-{color}-{N}` | 颜色原值（如 `--mantine-color-blue-6`） |
| `--mantine-color-{color}-text` | 该颜色的文本色（filled 变体文字色） |
| `--mantine-color-{color}-filled` | 该颜色的填充色（filled 变体背景色） |
| `--mantine-color-{color}-filled-hover` | filled 变体的 hover 色 |
| `--mantine-color-{color}-light` | light 变体的背景色 |
| `--mantine-color-{color}-light-hover` | light 变体 hover 色 |
| `--mantine-color-{color}-light-color` | light 变体的文字色 |
| `--mantine-color-{color}-outline` | outline 变体的边框色 |
| `--mantine-color-{color}-outline-hover` | outline 变体 hover 背景色 |

例如 `--mantine-color-blue-6`、`--mantine-color-blue-filled`、`--mantine-color-blue-light-color` 等。

### 2.5.4 主色变量

| CSS 变量 | 说明 |
|----------|------|
| `--mantine-primary-color-filled` | 主色 filled 变体背景色 |
| `--mantine-primary-color-filled-hover` | 主色 filled 变体 hover 色 |
| `--mantine-primary-color-light` | 主色 light 变体背景色 |
| `--mantine-primary-color-light-hover` | 主色 light 变体 hover 色 |
| `--mantine-primary-color-light-color` | 主色 light 变体文字色 |
| `--mantine-primary-color-contrast` | 主色对比色（文字色） |
| `--mantine-primary-color-contrast-hover` | 主色对比色 hover |

### 2.5.5 通用颜色变量

| CSS 变量 | 说明 |
|----------|------|
| `--mantine-color-white` | `theme.white` |
| `--mantine-color-black` | `theme.black` |
| `--mantine-color-body` | body 文字色 |
| `--mantine-color-text` | 默认文本色 |
| `--mantine-color-error` | 错误色 |
| `--mantine-color-placeholder` | 占位符色 |
| `--mantine-color-anchor` | 链接色 |
| `--mantine-color-dimmed` | 暗淡文本色 |

此外还有间距（`--mantine-spacing-xs` 等）、圆角（`--mantine-radius-md` 等）、阴影（`--mantine-shadow-sm` 等）、断点（`--mantine-breakpoint-md` 等）变量，命名规则一致。

### 2.5.6 在 CSS 中使用

```css
/* 在 CSS 文件中使用 Mantine CSS 变量 */
.my-card {
  /* 使用颜色变量 */
  color: var(--mantine-color-red-5);
  background: var(--mantine-color-grape-9);
  border: 1px solid var(--mantine-color-blue-1);

  /* 使用字体变量 */
  font-family: var(--mantine-font-family);
  font-size: var(--mantine-font-size-md);
  font-weight: var(--mantine-font-weight-bold);

  /* 使用间距变量 */
  padding: var(--mantine-spacing-md);
  margin: var(--mantine-spacing-sm);

  /* 使用圆角变量 */
  border-radius: var(--mantine-radius-md);

  /* 使用阴影变量 */
  box-shadow: var(--mantine-shadow-sm);
}
```

### 2.5.7 在 inline style 中使用

```javascript
// 在 React 组件的 style prop 中使用 CSS 变量
function MyComponent() {
  return (
    <div
      style={{
        // 直接引用 CSS 变量
        color: 'var(--mantine-color-blue-6)',
        backgroundColor: 'var(--mantine-color-gray-0)',
        padding: 'var(--mantine-spacing-lg)',
        borderRadius: 'var(--mantine-radius-md)',
        fontSize: 'var(--mantine-font-size-lg)',
      }}
    >
      Hello Mantine
    </div>
  );
}
```

### 2.5.8 自定义 CSS 变量 Resolver

`cssVariablesResolver` 允许在默认变量之外追加自定义变量，或覆盖默认变量：

```javascript
import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({
  // ...其他配置
});

function App() {
  return (
    <MantineProvider
      theme={theme}
      // cssVariablesResolver 允许添加自定义 CSS 变量
      cssVariablesResolver={(theme) => ({
        '--my-brand-color': '#ff6b6b',
        '--my-custom-spacing': '24px',
        // 也可以覆盖 Mantine 默认变量
        '--mantine-color-body': '#f8f9fa',
      })}
    >
      <AppContent />
    </MantineProvider>
  );
}
```

> ⚠️ `cssVariablesResolver` 返回的对象会与默认变量合并。如需完全替换默认 resolver，可参考 `defaultCssVariablesResolver` 自行实现。

---

## 2.6 组件级样式覆盖（Styles API）

Styles API 是 Theme 章节的第二个重点。它让你能够精确控制组件的每一个内部元素。

### 2.6.1 Styles API 概念

每个 Mantine 组件由若干**内部元素**组成，每个元素有一个 **selector 名称**（如 `root`、`label`、`input`）。通过 `classNames` 与 `styles` 两个 prop，可以为任意 selector 附加类名或行内样式。

以 `Button` 为例，其全部 selectors 如下（源自 v9.4 源码 `ButtonStylesNames`）：

| Selector | 说明 |
|----------|------|
| `root` | 根元素 `<button>` |
| `inner` | 内层容器，承载 section 与 label |
| `label` | 按钮文本标签 |
| `section` | 左/右侧图标容器（`leftSection` / `rightSection`） |
| `loader` | 加载态 `Loader` 元素 |

`Button` 还暴露了一组 CSS 变量（`ButtonCssVariables`）：`--button-justify`、`--button-height`、`--button-padding-x`、`--button-fz`、`--button-radius`、`--button-bg`、`--button-hover`、`--button-hover-color`、`--button-color`、`--button-bd`，可通过 `vars` prop 覆盖（见 2.6.6）。

### 2.6.2 classNames prop

```javascript
// 方式1：直接传 className 字符串
<Button
  classNames={{
    root: 'my-button-root',
    label: 'my-button-label',
    inner: 'my-button-inner',
  }}
>
  Click me
</Button>

// 方式2：配合 CSS Modules
import classes from './Button.module.css';

<Button
  classNames={{
    root: classes.root,
    label: classes.label,
  }}
>
  Click me
</Button>
```

### 2.6.3 styles prop

```javascript
<Button
  styles={{
    root: { backgroundColor: 'red' },
    label: { color: 'blue' },
    inner: { fontSize: 20 },
  }}
>
  Button
</Button>

// 注意：inline styles 优先级高于 classNames
// styles 不支持 :hover 等伪类和媒体查询
// 推荐优先使用 classNames，更灵活且性能更好
```

### 2.6.4 在 theme.components 中通过 Component.extend 覆盖

`Component.extend()` 在全局主题层面为组件设置 `defaultProps` / `classNames` / `styles` / `vars`，作用于所有该组件实例：

```javascript
import { Button, Menu, Tabs, createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
  components: {
    // Component.extend() 全局覆盖组件样式
    Button: Button.extend({
      // 覆盖默认 props
      defaultProps: {
        color: 'cyan',
        variant: 'outline',
      },
      // 覆盖 classNames
      classNames: {
        root: 'my-button-root',
      },
      // 覆盖 styles
      styles: {
        root: { backgroundColor: 'transparent' },
      },
    }),

    // 复合组件的覆盖方式
    MenuItem: Menu.Item.extend({ defaultProps: { color: 'red' } }),
    TabsList: Tabs.List.extend({ defaultProps: { justify: 'center' } }),
  },
});
```

> 📌 除 `Component.extend()` 外，v9 也支持对象语法：`Button: { defaultProps: {...}, styles: {...} }`。两者等价，`extend` 的优势在于有完整类型提示。

### 2.6.5 基于 props 的回调式 classNames/styles

`classNames` / `styles` 也可传函数，签名为 `(theme, props) => Classnames | Styles`，可依据组件 props 动态返回不同样式：

```javascript
import cx from 'clsx';
import { MantineProvider, createTheme, TextInput } from '@mantine/core';
import classes from './Demo.module.css';

const theme = createTheme({
  components: {
    TextInput: TextInput.extend({
      // 回调函数接收 (theme, props) 两个参数
      // 可以根据组件 props 动态返回不同的 classNames
      classNames: (theme, props) => ({
        label: cx({
          // 当 required 为 true 时添加 labelRequired 类
          [classes.labelRequired]: props.required,
        }),
        input: cx({
          // 当 error 存在时添加 inputError 类
          [classes.inputError]: props.error,
        }),
      }),
    }),
  },
});
```

### 2.6.6 组件 CSS 变量覆盖（vars prop）

`vars` 函数接收 `(theme, props)`，返回一个按 selector 分组的 CSS 变量对象。可据此动态设置组件级 CSS 变量，常用于扩展自定义 `size`：

```javascript
import { Button, Group, MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({
  components: {
    Button: Button.extend({
      // vars 函数接收 (theme, props)，返回 CSS 变量对象
      // 可以根据 props 动态设置组件级 CSS 变量
      vars: (theme, props) => {
        // 自定义 'xxl' 尺寸
        if (props.size === 'xxl') {
          return {
            root: {
              '--button-height': '60px',
              '--button-padding-x': '30px',
              '--button-fz': '24px',
            },
          };
        }
        // 自定义 'xxs' 尺寸
        if (props.size === 'xxs') {
          return {
            root: {
              '--button-height': '24px',
              '--button-padding-x': '10px',
              '--button-fz': '10px',
            },
          };
        }
        return { root: {} };
      },
    }),
  },
});

// 使用自定义尺寸
function Demo() {
  return (
    <Group>
      <Button size="xxl">Extra Extra Large</Button>
      <Button size="xxs">Extra Extra Small</Button>
    </Group>
  );
}
```

### 2.6.7 withProps 函数

`Component.withProps(defaultProps)` 创建一个预设了默认 props 的组件变体，便于复用：

```javascript
// withProps 创建一个预设了默认 props 的组件变体
const LinkButton = Button.withProps({
  component: 'a',
  target: '_blank',
  rel: 'noreferrer',
  variant: 'subtle',
});

const PhoneInput = TextInput.withProps({
  label: 'Your phone number',
  placeholder: 'Your phone number',
});
```

> 💡 `withProps` 与 `extend({ defaultProps })` 的区别：`withProps` 产生一个**新组件**（可独立使用），`extend` 修改的是**全局主题中的原组件**。

---

## 2.7 响应式主题

### 2.7.1 breakpoints 控制

`theme.breakpoints` 是一个 `Record<MantineSize, string>`，**单位为 em**（基于用户浏览器默认字号，更符合无障碍最佳实践）。可通过 `createTheme` 覆盖：

```javascript
const theme = createTheme({
  breakpoints: {
    xs: '30em',
    sm: '48em',
    md: '64em',
    lg: '80em',
    xl: '96em',
  },
});
```

### 2.7.2 响应式 style props

所有 style props（`mt`、`p`、`m`、`size` 等）都支持对象语法，按断点返回不同值：

```javascript
// 响应式 style props：不同断点使用不同的值
<Box
  mt={{ base: 10, md: 20 }}  // 默认 margin-top: 10px，md 断点以上 20px
  p={{ base: 'sm', lg: 'md' }}
>
  Content
</Box>
```

`base` 表示默认（最小屏幕）值，其余键为断点名。

### 2.7.3 显隐控制

```javascript
// hiddenFrom：在指定断点及以上隐藏
<Box hiddenFrom="md">
  仅在小屏幕显示
</Box>

// visibleFrom：在指定断点及以上显示
<Box visibleFrom="md">
  仅在大屏幕显示
</Box>

// lightHidden：在亮色模式下隐藏
<Box lightHidden>仅在暗色模式显示</Box>

// darkHidden：在暗色模式下隐藏
<Box darkHidden>仅在亮色模式显示</Box>
```

> ⚠️ `hiddenFrom` / `visibleFrom` 依赖 `withGlobalClasses`（默认开启）。若关闭全局类，这两个 prop 会失效。

---

## 2.8 Color Scheme 管理

### 2.8.1 核心配置项

- `defaultColorScheme`：首次访问且无缓存时的默认方案，可选 `'light'` / `'dark'` / `'auto'`。
- `forceColorScheme`：强制方案（仅 `'light'` / `'dark'`），设置后忽略 manager 与 defaultColorScheme，用于"只允许某一模式"的场景。
- `colorSchemeManager`：持久化策略，默认 `localStorageManager`，也可自定义。

### 2.8.2 useMantineColorScheme hook

```typescript
const {
  colorScheme,       // 当前方案（'light' | 'dark' | 'auto'）
  setColorScheme,    // 设置方案
  clearColorScheme,  // 清除缓存，回退到 defaultColorScheme
  toggleColorScheme, // 在 light/dark 之间切换
} = useMantineColorScheme({ keepTransitions?: boolean });
```

`keepTransitions: true` 可在切换时保留过渡动画。

### 2.8.3 useComputedColorScheme hook

当 `colorScheme` 为 `'auto'` 时，`useMantineColorScheme` 返回的仍是 `'auto'`。要拿到**实际生效**的方案（'light' 或 'dark'），使用 `useComputedColorScheme`：

```javascript
import { useComputedColorScheme } from '@mantine/core';

const computed = useComputedColorScheme('light'); // 默认值
// computed === 'light' | 'dark'
```

### 2.8.4 ColorSchemeScript（SSR 防闪烁）

在 SSR 场景下，若首屏 HTML 用 light、客户端读取 localStorage 后切到 dark，会出现"闪屏"。`ColorSchemeScript` 在 `<head>` 中提前执行一段内联脚本，根据 localStorage 设置 `data-mantine-color-scheme` 属性，从而避免闪烁。

```javascript
// app/layout.js（Next.js App Router）
import { ColorSchemeScript, MantineProvider } from '@mantine/core';

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 必须放在 <head> 内，且 localStorageKey 要与 Provider 一致 */}
        <ColorSchemeScript defaultColorScheme="light" localStorageKey="mantine-color-scheme" />
      </head>
      <body>
        <MantineProvider
          defaultColorScheme="light"
          colorSchemeManager={localStorageManager}
        >
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
```

### 2.8.5 自定义 ColorSchemeManager

`MantineColorSchemeManager` 接口包含 5 个方法：`get` / `set` / `subscribe` / `unsubscribe` / `clear`。当 localStorage 不满足需求（如需 cookie 同步、跨标签页同步）时可自行实现。

下面是一个 cookie manager 示例（SSR 友好）：

```javascript
import { MantineColorSchemeManager } from '@mantine/core';

// 自定义 cookie manager：将 color scheme 写入 cookie，SSR 端可直接读取
function createCookieManager(cookieName = 'mantine-color-scheme') {
  return {
    get(defaultValue) {
      if (typeof document === 'undefined') return defaultValue;
      const match = document.cookie.match(
        new RegExp(`${cookieName}=([^;]+)`)
      );
      return match ? match[1] : defaultValue;
    },
    set(value) {
      document.cookie = `${cookieName}=${value}; path=/; max-age=31536000`;
    },
    subscribe(onUpdate) {
      // 监听 storage 事件以支持跨标签页同步
      window.addEventListener('storage', (e) => {
        if (e.key === cookieName) onUpdate(e.newValue);
      });
    },
    unsubscribe() {
      // 简化示例：实际应保存监听器引用并 removeEventListener
    },
    clear() {
      document.cookie = `${cookieName}=; path=/; max-age=0`;
    },
  };
}
```

### 2.8.6 完整 SSR + Dark Mode 切换示例

```javascript
'use client';

import { useState } from 'react';
import {
  MantineProvider,
  ColorSchemeScript,
  useMantineColorScheme,
  useComputedColorScheme,
  Button,
  Stack,
} from '@mantine/core';
import { localStorageManager } from '@mantine/core';

// 主题切换按钮
function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme('light');
  return (
    <Button
      onClick={() => setColorScheme(computed === 'light' ? 'dark' : 'light')}
    >
      切换到 {computed === 'light' ? '暗色' : '亮色'}
    </Button>
  );
}

export default function App({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider
          defaultColorScheme="light"
          colorSchemeManager={localStorageManager}
        >
          <Stack p="md">
            <ThemeToggle />
            {children}
          </Stack>
        </MantineProvider>
      </body>
    </html>
  );
}
```

---

## 2.9 多主题管理

### 2.9.1 MantineThemeProvider 局部主题

`MantineThemeProvider` 接收一个 `theme` prop，会与外层主题深度合并，作用于其子树。常用于"某个区块使用不同主色 / 不同组件默认值"。

```javascript
import { Button, createTheme, MantineThemeProvider, useMantineTheme } from '@mantine/core';

// 为应用的一部分设置独立主题
const sectionTheme = createTheme({
  components: {
    Button: Button.extend({
      defaultProps: { color: 'cyan', variant: 'outline' },
    }),
  },
});

function App() {
  return (
    <div>
      {/* 这部分使用独立主题 */}
      <MantineThemeProvider theme={sectionTheme}>
        <Button>Cyan Outline Button</Button>
      </MantineThemeProvider>

      {/* 这部分使用全局主题 */}
      <Button>Default Button</Button>
    </div>
  );
}

// useMantineTheme：在组件中获取当前主题
function ThemeInfo() {
  const theme = useMantineTheme();
  return (
    <div>
      <p>主色：{theme.primaryColor}</p>
      <p>字体：{theme.fontFamily}</p>
      <p>蓝色第5阶：{theme.colors.blue[5]}</p>
    </div>
  );
}
```

### 2.9.2 useMantineTheme hook

`useMantineTheme()` 返回当前生效的、已合并的 `MantineTheme` 对象（注意是完整 theme，不是 override）。常用于在自定义组件中读取 token：

```javascript
function MyDivider({ label }) {
  const theme = useMantineTheme();
  return (
    <div style={{ borderTop: `1px solid ${theme.colors.gray[3]}` }}>
      <span style={{ fontSize: theme.fontSizes.sm }}>{label}</span>
    </div>
  );
}
```

> 💡 推荐优先使用 CSS 变量（`var(--mantine-color-gray-3)`）而非 `theme.colors.gray[3]`，前者不会触发组件重渲染。

---

## 2.10 TypeScript 类型安全

### 2.10.1 MantineTheme 完整接口

`MantineTheme` 接口已在 2.2 节详细列出。其核心类型关系：

- `MantineThemeOverride = PartialDeep<MantineTheme>`：所有属性均可选，支持深度部分覆盖。
- `MantineColor = keyof MantineThemeColors`：颜色名联合类型，扩展 `MantineThemeColorsOverride` 后自动包含自定义颜色。
- `MantineThemeComponents = Record<string, MantineThemeComponent>`：组件级覆盖配置。

### 2.10.2 自定义颜色类型扩展

见 2.4.5 节。扩展后 `color="oceanBlue"` 等用法会获得类型检查。

### 2.10.3 theme.other 自定义属性

`theme.other` 是一个 `Record<string, any>` 容器，用于存放任意自定义设计 token，可通过 `useMantineTheme().other` 读取：

```javascript
const theme = createTheme({
  // other 属性：存储任意自定义设计 token
  // 可以通过 useMantineTheme().other 访问
  other: {
    // 自定义品牌色
    charcoal: '#333333',
    // 自定义标题大小
    primaryHeadingSize: 45,
    // 自定义字重
    fontWeights: { bold: 700, extraBold: 900 },
  },
});

// 在组件中使用
function MyComponent() {
  const theme = useMantineTheme();
  return (
    <h1 style={{
      fontSize: theme.other.primaryHeadingSize,
      color: theme.other.charcoal,
    }}>
      Hello
    </h1>
  );
}
```

> 📌 `other` 没有强类型约束。如需类型安全，可通过 `declare module '@mantine/core'` 扩展 `MantineThemeOther` 接口。

### 2.10.4 useProps hook

`useProps(componentName, defaultProps, props)` 用于在自定义组件中实现与 Mantine 内置组件一致的 props 合并行为（`theme.components[Name].defaultProps` → 调用方 props）：

```javascript
import { useProps } from '@mantine/core';

// 自定义组件：defaultProps 可被 theme.components.MyButton.defaultProps 覆盖
function MyComponent(props) {
  const { color, size, ...rest } = useProps('MyButton', { color: 'blue', size: 'md' }, props);
  // ...
}
```

---

## 2.11 实战：构建完整的自定义主题

下面给出一个综合性的企业级品牌主题示例，覆盖颜色、字体、间距、圆角、组件、自定义 token 等所有维度。

```javascript
// theme/brand-theme.js
import { createTheme, virtualColor } from '@mantine/core';

// ============ 品牌色板 ============
// 手动定义品牌色"海军蓝"的 10 个色阶
const NAVY = '#1a365d';
const NAVY_HOVER = '#152d4f';

const navyColors = [
  '#eef2f7', // 0 - 最浅，背景色
  '#d0dceb', // 1
  '#a2b9d6', // 2
  '#7496c1', // 3
  '#4a75ad', // 4
  '#2d5694', // 5
  '#1e4278', // 6
  NAVY,      // 7 - 主色
  NAVY_HOVER,// 8 - hover 色
  '#0f2340', // 9 - 最深
];

// ============ 创建主题 ============
export const brandTheme = createTheme({
  // ============ 颜色系统 ============
  colors: {
    navy: navyColors,
    // 虚拟颜色：亮色模式用 navy，暗色模式用 blue
    primary: virtualColor({
      name: 'primary',
      dark: 'blue',
      light: 'navy',
    }),
  },
  primaryColor: 'navy',
  primaryShade: 7,

  // ============ 字体 ============
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2.125rem', lineHeight: '1.3' },
      h2: { fontSize: '1.625rem', lineHeight: '1.35' },
    },
  },

  // ============ 间距 ============
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '32px',
  },

  // ============ 圆角 ============
  defaultRadius: 'md',
  radius: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },

  // ============ 自动对比度 ============
  autoContrast: true,
  luminanceThreshold: 0.3,

  // ============ 组件级覆盖 ============
  components: {
    // Button：统一按钮风格
    Button: {
      defaultProps: {
        radius: 'xl',      // 胶囊圆角
        size: 'md',
        fw: 500,           // 字重
      },
    },
    // TextInput：统一输入框风格
    TextInput: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
      styles: {
        input: {
          height: '48px',   // 统一输入框高度
          borderWidth: '2px',
        },
      },
    },
    // Card：统一卡片风格
    Card: {
      defaultProps: {
        padding: 'lg',
        radius: 'md',
        shadow: 'sm',
      },
    },
  },

  // ============ 自定义 token ============
  other: {
    brandColor: NAVY,
    brandHoverColor: NAVY_HOVER,
    sidebarWidth: 260,
    headerHeight: 64,
  },
});
```

在应用入口使用该主题：

```javascript
// app/layout.js
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { brandTheme } from '../theme/brand-theme';

export const metadata = {
  title: '企业级品牌应用',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={brandTheme} defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
```

### 2.11.1 主题拆分建议

当主题规模增长，建议按职责拆分：

```
theme/
  brand-theme.js        // 主题入口，mergeThemeOverrides 合并各部分
  colors.js             // 颜色与色板
  typography.js         // 字体、字号、标题
  spacing.js            // 间距、圆角
  components.js         // 组件级覆盖
  types.d.ts            // TypeScript 类型扩展
```

```javascript
// theme/brand-theme.js（拆分版）
import { createTheme, mergeThemeOverrides } from '@mantine/core';
import { colorsTheme } from './colors';
import { typographyTheme } from './typography';
import { spacingTheme } from './spacing';
import { componentsTheme } from './components';

// 合并各模块，统一导出
export const brandTheme = mergeThemeOverrides(
  createTheme({ primaryColor: 'navy', primaryShade: 7, autoContrast: true, luminanceThreshold: 0.3 }),
  colorsTheme,
  typographyTheme,
  spacingTheme,
  componentsTheme
);
```

---

## 本章小结

本章围绕 Mantine v9 Theme 系统展开了 11 个小节：

1. **MantineProvider** 是应用根 Provider，提供 theme context、color scheme 与 CSS 变量；共 17 个 Props，生产环境常用的有 `theme`、`defaultColorScheme`、`colorSchemeManager`、`cssVariablesResolver`、`deduplicateInlineStyles`。
2. **MantineTheme** 描述全部设计 token，注意 v9 中 `fontWeights.medium = 600`（变更点）。
3. **createTheme** 用于在模块作用域稳定 theme 引用；**mergeThemeOverrides** 合并多份 override；**MantineThemeProvider** 用于局部主题。
4. **颜色系统**：自定义颜色须 10 阶；**virtualColor** 实现亮/暗色切换；**colorsTuple** 处理特殊场景；**generateColors** 自动生成色阶；TypeScript 扩展 `MantineThemeColorsOverride` 获得类型提示。
5. **CSS 变量**是连接 JS theme 与 CSS 的桥梁，命名规律统一，可通过 `cssVariablesResolver` 追加自定义变量。
6. **Styles API** 通过 `classNames` / `styles` / `vars` / `extend` / `withProps` 提供组件级样式覆盖能力，回调式签名支持基于 props 的动态样式。
7. **响应式主题**：breakpoints 单位为 em；style props 支持对象语法；`hiddenFrom` / `visibleFrom` / `lightHidden` / `darkHidden` 控制显隐。
8. **Color Scheme 管理**：`useMantineColorScheme` 控制方案，`useComputedColorScheme` 取实际值，`ColorSchemeScript` 防 SSR 闪烁，自定义 manager 支持 cookie / 跨标签页同步。
9. **多主题管理**：`MantineThemeProvider` 实现局部主题隔离，`useMantineTheme` 读取当前主题。
10. **TypeScript**：扩展 `MantineThemeColorsOverride` 与 `MantineThemeOther` 获得完整类型安全；`useProps` 复用 Mantine 的 props 合并逻辑。
11. **实战**：通过企业级品牌主题示例，整合颜色、字体、间距、组件、自定义 token，并给出主题拆分建议。

掌握本章后，你已经具备了定制 Mantine 视觉表现的全部能力。后续章节将进入具体组件（表单、布局、覆层等）的实战，主题知识将在那些章节中持续发挥作用。
