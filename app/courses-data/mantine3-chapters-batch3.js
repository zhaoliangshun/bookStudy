// =============================================================
// Mantine 之道 · 理念与设计目的 —— 第三批章节
// -------------------------------------------------------------
// 本批包含：
//   mantine3-ch14 : 第十四章 createTheme 完全指南
//   mantine3-ch15 : 第十五章 颜色系统深度（24 色板 / 10 阶 / 通道）
//   mantine3-ch16 : 第十六章 圆角 / 间距 / 字体 token
//   mantine3-ch17 : 第十七章 阴影 / 断点 / 默认值
//   mantine3-ch18 : 第十八章 primaryColor 与 primaryShade
//   mantine3-ch19 : 第十九章 主题级组件覆盖（classNames / styles / vars）
//
// 风格：API 详尽，每个 token 都配 demo
// 适用版本：Mantine v9 / React 19 / Next.js 16
// =============================================================

const chapters = [
  // ============================================================
  // 第十四章
  // ============================================================
  {
    id: "mantine3-ch14",
    group: "第三部分 Theme 主题系统",
    icon: "🎭",
    title: "第十四章 createTheme 完全指南",
    content: `## 14.1 createTheme 的本质

\`createTheme\` 是一个**高阶函数**，它接受一个**主题覆盖对象**（MantineThemeOverride），返回**完整主题对象**（MantineTheme）。

\`\`\`ts
// 类型签名
function createTheme(overrides?: MantineThemeOverride): MantineTheme {
  // ...
}
\`\`\`

**调用方式**：

\`\`\`jsx
// 1. 完整写法
const theme = createTheme({
  primaryColor: 'violet',
  defaultRadius: 'md',
  fontFamily: 'Inter, sans-serif',
});

// 2. 链式 API（v9 引入）
const theme = createTheme({
  primaryColor: 'violet',
})
  .set({ defaultRadius: 'md' })
  .set({ fontFamily: 'Inter, sans-serif' });

// 3. 函数式 API（推荐用于动态主题）
const theme = createTheme((theme) => ({
  // theme 是当前主题，可以基于它做计算
  defaultRadius: theme.primaryColor === 'red' ? 'sm' : 'md',
}));
\`\`\`

---

## 14.2 MantineThemeOverride 完整字段

\`\`\`ts
type MantineThemeOverride = {
  // === 颜色 ===
  colors: Record<string, MantineColorsTuple>;  // 10 阶色板
  primaryColor: string;                        // colors 中的 key
  primaryShade: number | { light: number; dark: number };
  white: string;
  black: string;

  // === 圆角 ===
  radius: Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string>>;
  defaultRadius: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  // === 间距 ===
  spacing: Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string>>;

  // === 字体 ===
  fontFamily: string;
  fontFamilyMonospace: string;
  headings: {
    fontFamily?: string;
    fontWeight?: string;
    sizes?: Partial<Record<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', {
      fontSize: string;
      lineHeight: string;
      fontWeight?: string;
    }>>;
  };

  // === 阴影 ===
  shadows: Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string>>;

  // === 断点 ===
  breakpoints: Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string>>;

  // === 主题级组件覆盖 ===
  components: Record<string, ComponentThemeOverride>;

  // === 其他 token ===
  other: Record<string, unknown>;
  cursorType: 'pointer' | 'default';
  focusRing: 'auto' | 'always' | 'never';
  respectReducedMotion: boolean;
};
\`\`\`

---

## 14.3 完整示例：企业品牌主题

\`\`\`jsx
import { createTheme, MantineColorsTuple } from '@mantine/core';

// 1. 定义品牌色（10 阶）
const brand: MantineColorsTuple = [
  '#f3f0ff',  // 0 - 最浅
  '#e5d4ff',
  '#d0b0ff',
  '#b88aff',
  '#9d63ff',
  '#7c3aed',  // 5 - 中等
  '#5b21b6',
  '#491a94',
  '#3b1372',
  '#1e0a3d',  // 9 - 最深
];

// 2. 暗色模式下的次要色
const secondary: MantineColorsTuple = [
  '#fff5f5', '#ffe3e3', '#ffc9c9', '#ffa8a8', '#ff8787',
  '#ff6b6b', '#fa5252', '#f03e3e', '#e03131', '#c92a2a',
];

// 3. 中性色（灰）
const neutral: MantineColorsTuple = [
  '#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#ced4da',
  '#adb5bd', '#868e96', '#495057', '#343a40', '#212529',
];

// 4. 创建主题
export const theme = createTheme({
  // 颜色
  colors: { brand, secondary, neutral },
  primaryColor: 'brand',
  primaryShade: { light: 6, dark: 4 },
  white: '#ffffff',
  black: '#000000',

  // 圆角
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  defaultRadius: 'md',

  // 间距
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },

  // 字体
  fontFamily: 'Inter, -apple-system, sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", Consolas, monospace',
  headings: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2.5rem', lineHeight: '1.2' },
      h2: { fontSize: '2rem', lineHeight: '1.25' },
      h3: { fontSize: '1.5rem', lineHeight: '1.3' },
      h4: { fontSize: '1.25rem', lineHeight: '1.35' },
      h5: { fontSize: '1.125rem', lineHeight: '1.4' },
      h6: { fontSize: '1rem', lineHeight: '1.5' },
    },
  },

  // 阴影
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
  },

  // 断点
  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
  },

  // 全局默认值
  cursorType: 'pointer',
  focusRing: 'auto',  // auto = 键盘 focus 时才显示，always = 始终显示
  respectReducedMotion: true,

  // 自定义 token
  other: {
    appName: 'MyApp',
    headerHeight: 60,
  },

  // 组件级覆盖
  components: {
    Button: {
      defaultProps: { radius: 'xl' },
      styles: { root: { fontWeight: 600 } },
    },
  },
});
\`\`\`

---

## 14.4 函数式 API：基于当前主题计算

\`\`\`jsx
const theme = createTheme((theme) => ({
  // 当 primaryColor 是 red 时，用 sm 圆角，否则用 md
  defaultRadius: theme.primaryColor === 'red' ? 'sm' : 'md',

  // 当 primaryColor 是 brand 时，header 用更紧凑的间距
  spacing: {
    ...theme.spacing,
    md: theme.primaryColor === 'brand' ? '14px' : '16px',
  },
}));
\`\`\`

**用途**：

- 主题根据环境动态调整。
- 配合多套主题（用户切换品牌色）。
- 复杂计算（根据屏幕尺寸调整）。

---

## 14.5 主题的「冻结」与「扩展」

### 冻结（return theme as-is）

\`\`\`jsx
const baseTheme = createTheme({
  primaryColor: 'violet',
});

// 后续可以链式修改
const customizedTheme = createTheme({
  ...baseTheme,  // ❌ 浅展开会丢失嵌套
  primaryColor: 'red',
});
\`\`\`

> ⚠️ 直接展开 baseTheme 不安全，因为 MantineTheme 里有函数、Symbol、不可枚举属性等。

### 正确方式：用 createTheme 合并

\`\`\`jsx
// ✅ 方式 1：createTheme 二次调用（不会自动合并）
const theme1 = createTheme({ primaryColor: 'violet' });
const theme2 = createTheme({ defaultRadius: 'xl' });
// theme2 没有 primaryColor（默认 blue）

// ✅ 方式 2：手动合并
const baseTheme = createTheme({ primaryColor: 'violet' });
const extendedTheme = {
  ...baseTheme,
  defaultRadius: 'xl',  // 顶层属性可以这样覆盖
};

// ✅ 方式 3：用第三方库 lodash.merge 深合并
import merge from 'lodash.merge';
const theme3 = merge({}, baseTheme, { defaultRadius: 'xl' });
\`\`\`

---

## 14.6 多套主题切换

\`\`\`tsx
// themes.ts
import { createTheme } from '@mantine/core';

export const lightTheme = createTheme({
  primaryColor: 'violet',
  white: '#ffffff',
  black: '#000000',
});

export const darkTheme = createTheme({
  primaryColor: 'violet',
  white: '#ffffff',
  black: '#000000',
  // 暗色模式特殊配置
  other: {
    isDark: true,
  },
});

// Brand-A 主题
export const brandATheme = createTheme({
  primaryColor: 'blue',
  colors: {
    blue: [/* 蓝色 10 阶 */],
  },
});

// Brand-B 主题
export const brandBTheme = createTheme({
  primaryColor: 'orange',
  colors: {
    orange: [/* 橙色 10 阶 */],
  },
});
\`\`\`

**运行时切换**：

\`\`\`tsx
'use client';

import { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { lightTheme, darkTheme, brandATheme, brandBTheme } from './themes';

export function App() {
  const [theme, setTheme] = useState(lightTheme);

  return (
    <MantineProvider theme={theme}>
      <button onClick={() => setTheme(brandATheme)}>切换到品牌 A</button>
      <button onClick={() => setTheme(brandBTheme)}>切换到品牌 B</button>
    </MantineProvider>
  );
}
\`\`\`

**注意**：切换主题会**触发整个组件树重渲染**（因为 Context 变了），不像暗色模式那么轻量。**适合低频切换**（用户选品牌），不适合高频切换。

---

## 14.7 在多 Provider 里共享主题

\`\`\`tsx
'use client';

import { createTheme, MantineProvider, MantineTheme } from '@mantine/core';
import { createContext, useContext, useMemo } from 'react';

// 创建主题 Context
const ThemeContext = createContext<MantineTheme | null>(null);

export function useAppTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // useMemo 防止 theme 重建
  const theme = useMemo(() => createTheme({ primaryColor: 'violet' }), []);

  return (
    <MantineProvider theme={theme}>
      <ThemeContext.Provider value={theme}>
        {children}
      </ThemeContext.Provider>
    </MantineProvider>
  );
}

// 在业务组件里用
function MyComponent() {
  const theme = useAppTheme();
  return <div style={{ color: theme.colors.violet[5] }}>...</div>;
}
\`\`\`

**为什么用 \`useMemo\`？**

\`createTheme\` 返回新对象，如果**不缓存**，每次 \`ThemeProvider\` 渲染都会生成新 theme，导致所有子组件 \`useContext\` 拿到不同的引用，触发不必要的重渲染。

---

## 14.8 主题调试工具

### 1. \`<ThemeDebug>\` 组件

\`\`\`tsx
'use client';

import { useMantineTheme } from '@mantine/core';

export function ThemeDebug() {
  const theme = useMantineTheme();

  return (
    <details style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999, background: 'white', padding: 16, border: '1px solid #ccc', maxWidth: 400 }}>
      <summary>主题调试</summary>
      <pre style={{ fontSize: 12, maxHeight: 400, overflow: 'auto' }}>
        {JSON.stringify({
          primaryColor: theme.primaryColor,
          primaryShade: theme.primaryShade,
          defaultRadius: theme.defaultRadius,
          colors: Object.keys(theme.colors),
          spacing: theme.spacing,
          radius: theme.radius,
          fontFamily: theme.fontFamily,
          breakpoints: theme.breakpoints,
        }, null, 2)}
      </pre>
    </details>
  );
}
\`\`\`

### 2. Mantine 官方 DevTools

\`\`\`bash
npm install --save-dev @mantine/devtools
\`\`\`

\`\`\`tsx
import { MantineDevtools } from '@mantine/devtools';

<MantineProvider theme={theme}>
  <App />
  <MantineDevtools />  {/* 浮动按钮，可视化主题、组件状态 */}
</MantineProvider>
\`\`\`

**功能**：

- 查看当前主题 token。
- 切换暗色模式。
- 检查组件状态。
- 性能 profiling。

---

## 14.9 常见错误

### 错误 1：colors 不是 10 阶

\`\`\`jsx
// ❌ 9 阶会编译报错
const badColors = ['#fff', '#f0f', '#e0e', '#d0d', '#c0c', '#b0b', '#a0a', '#909', '#808'];

// ❌ 11 阶会编译报错
const tooManyColors = ['#fff', '#f0f', '#e0e', '#d0d', '#c0c', '#b0b', '#a0a', '#909', '#808', '#707', '#606'];

// ✅ 10 阶
const goodColors: MantineColorsTuple = ['#fff', '#f0f', '#e0e', '#d0d', '#c0c', '#b0b', '#a0a', '#909', '#808', '#707'];
\`\`\`

### 错误 2：primaryColor 引用不存在的色

\`\`\`jsx
const theme = createTheme({
  primaryColor: 'brand',  // 但 colors 里没有 'brand'
  colors: { other: [...] },  // 错误！应该叫 brand
});
\`\`\`

### 错误 3：headings.sizes 字段缺失

\`\`\`jsx
// ❌ 缺 lineHeight
const theme = createTheme({
  headings: {
    sizes: {
      h1: { fontSize: '2rem' },  // 缺 lineHeight
    },
  },
});

// ✅ 完整
const theme = createTheme({
  headings: {
    sizes: {
      h1: { fontSize: '2rem', lineHeight: '1.3' },
    },
  },
});
\`\`\`

---

## 14.10 小结

- \`createTheme\` 接受 \`MantineThemeOverride\`，返回 \`MantineTheme\`。
- 完整字段：颜色 / 圆角 / 间距 / 字体 / 阴影 / 断点 / 组件覆盖 / 其他。
- 支持**函数式 API**（基于当前主题计算）。
- 多套主题用 \`useState\` 切换，但**会触发重渲染**。
- 用 \`useMemo\` 缓存 theme 对象，避免不必要的重渲染。
- 推荐用 \`@mantine/devtools\` 调试主题。

> ⭐ 记住：**「createTheme 是主题的入口，主题对象会变成 CSS 变量层」**。

下一章我们看颜色系统的深度细节。
`,
  },

  // ============================================================
  // 第十五章
  // ============================================================
  {
    id: "mantine3-ch15",
    group: "第三部分 Theme 主题系统",
    icon: "🌈",
    title: "第十五章 颜色系统深度（24 色板 / 10 阶 / 通道）",
    content: `## 15.1 24 个预定义色板

Mantine 内置 **24 个色板**（MantineColorsTuple），每个 10 阶：

| 类别 | 色板 |
| --- | --- |
| 冷色 | blue, cyan, grape, indigo, violet, purple, pink |
| 暖色 | red, orange, yellow, lime, green, teal |
| 中性 | gray, dark, white, black |
| 特殊 | blue, red, green, yellow（语义色） |
| Tailwind 风格 | slate, gray, zinc, neutral, stone |

\`\`\`jsx
// 直接用预定义色板
<Button color="blue">蓝色按钮</Button>
<Badge color="green">成功</Badge>
<Alert color="red">错误</Alert>
\`\`\`

---

## 15.2 10 阶色板的语义

每个色板的 10 阶对应不同用途：

| 阶 | 用途 | 例子 |
| --- | --- | --- |
| 0 | 最浅背景 | \`<Button variant="light">\` 的背景 |
| 1 | 浅背景 | hover 状态、disabled 背景 |
| 2 | 边框（淡） | input 边框 |
| 3 | 边框（深） | hover 边框 |
| 4 | 文字（淡） | 占位符 |
| 5 | 文字（深） | 副标题 |
| 6 | 主题色（默认） | \`<Button variant="filled">\` 背景 |
| 7 | 主题色（hover） | 按钮 hover |
| 8 | 主题色（active） | 按钮 active |
| 9 | 主题色（最暗） | pressed 状态 |

**Mantine 内部用法**（以 Button 为例）：

\`\`\`css
.mantine-Button-root {
  /* variant="filled" + color="blue" */
  background: var(--mantine-color-blue-filled);       /* blue[6] */
  color: var(--mantine-color-white);

  /* hover */
  background: var(--mantine-color-blue-filled-hover);  /* blue[7] */

  /* variant="light" + color="blue" */
  background: var(--mantine-color-blue-light);         /* blue[0] */
  color: var(--mantine-color-blue-light-color);        /* blue[6] */
}
\`\`\`

---

## 15.3 颜色通道：HSL 而非 Hex

Mantine 内部把颜色存为 **HSL 通道**（不包含 \`hsl(...)\` 前缀）：

\`\`\`js
// Mantine 内部存的是这样
'121 80 196'

// 而不是
'hsl(271, 80%, 60%)'
'#7c3aed'
\`\`\`

**为什么不直接用 hex？**

因为 HSL 通道让 Mantine 可以在 **runtime 调整 alpha**：

\`\`\`css
/* 用 var() 加 alpha */
background: hsl(var(--mantine-color-blue-6) / 0.5);
/* 输出：hsla(208, 100%, 50%, 0.5) */
\`\`\`

如果 Mantine 存的是 \`#228be6\`，**没法**在 runtime 调整 alpha，必须预定义 10 个 alpha 等级。

---

## 15.4 自定义色板

### 用 Mantine Color Generator

1. 访问 https://mantine.dev/colors-generator/
2. 输入基础色（如品牌色 \`#5C33FF\`）
3. 自动生成 10 阶色板
4. 复制到 createTheme

\`\`\`jsx
import { createTheme, MantineColorsTuple } from '@mantine/core';

// 从 Mantine Color Generator 复制的 10 阶
const brand: MantineColorsTuple = [
  '#f3f0ff',  // 0
  '#e5d4ff',  // 1
  '#d0b0ff',  // 2
  '#b88aff',  // 3
  '#9d63ff',  // 4
  '#7c3aed',  // 5
  '#5b21b6',  // 6
  '#491a94',  // 7
  '#3b1372',  // 8
  '#1e0a3d',  // 9
];

const theme = createTheme({
  colors: { brand },
  primaryColor: 'brand',
});
\`\`\`

### 手动调整色阶

\`\`\`jsx
// 如果第 5 阶太暗，可以手动调亮
const brand: MantineColorsTuple = [
  '#f3f0ff',
  '#e5d4ff',
  '#d0b0ff',
  '#b88aff',
  '#9d63ff',
  '#a980ff',  // 手动调亮，作为主要品牌色
  '#7c3aed',
  '#5b21b6',
  '#491a94',
  '#1e0a3d',
];
\`\`\`

### 从现有颜色派生

\`\`\`jsx
import { MantineColorsTuple, generateColors } from '@mantine/colors-generator';

// generateColors 接受一个基础色，生成 10 阶
const brand = generateColors('#5C33FF');
// 输出 MantineColorsTuple
\`\`\`

> ⚠️ \`@mantine/colors-generator\` 是 **Node 工具**，不能在浏览器运行。一般在构建时调用。

---

## 15.5 primaryColor 与 primaryShade

\`\`\`jsx
const theme = createTheme({
  primaryColor: 'violet',  // 主题色名（colors 的 key）
  primaryShade: {
    light: 6,  // 亮色模式用 6 阶
    dark: 4,   // 暗色模式用 4 阶（更亮）
  },
});
\`\`\`

**为什么暗色模式用更浅的阶？**

暗色背景下，**深色按钮看不清**。所以暗色模式默认用更浅的色阶（4 而不是 6），保证对比度。

**手动指定**：

\`\`\`jsx
<Button color="violet.4">强制用 4 阶</Button>
<Button color="violet">用 primaryShade 自动</Button>
\`\`\`

---

## 15.6 语义色

很多组件有专门的语义色 prop（\`color="red"\`、\`color="green"\`），这些颜色**不依赖 primaryColor**：

\`\`\`jsx
// 语义色：成功
<Alert color="green" title="成功">操作完成</Alert>

// 语义色：错误
<Alert color="red" title="错误">操作失败</Alert>

// 语义色：警告
<Alert color="yellow" title="警告">请注意</Alert>

// 语义色：信息
<Alert color="blue" title="提示">这是一条信息</Alert>
\`\`\`

**最佳实践**：

- 主题色（primary）：用于品牌、CTA、强调。
- 语义色（red/green/yellow）：用于状态（成功、错误、警告）。
- 中性色（gray/dark）：用于次要内容、边框、背景。

---

## 15.7 颜色的可访问性

### WCAG 对比度

Mantine 的色板**自动满足 WCAG AA**：

- 普通文字：对比度 ≥ 4.5:1
- 大文字：对比度 ≥ 3:1

**检查对比度**：

\`\`\`jsx
import { readableColor } from '@mantine/hooks';

// readableColor 接受一个背景色，返回最合适的文字色（黑或白）
const bg = theme.colors.brand[6];  // '#5b21b6'
const text = readableColor(bg);    // 'white'（深色背景用白字）
\`\`\`

### 自定义色板的可访问性

如果你手动写了色板，要保证：

- 6 阶（filled 背景）：文字用 white 看得清。
- 0 阶（light 背景）：文字用 6 阶看得清。
- 不要在 0 阶上用 9 阶文字（对比度不够）。

---

## 15.8 透明度与暗色叠加

### 用 alpha

\`\`\`jsx
// 用 var() + alpha
<Box style={{ background: 'hsl(var(--mantine-color-violet-6) / 0.1)' }}>
  半透明背景
</Box>
\`\`\`

### 用 overlay

\`\`\`jsx
// 暗色模式下的半透明黑叠加
<Box style={{
  background: colorScheme === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.05)',
}}>
  自适应叠加
</Box>
\`\`\`

---

## 15.9 颜色的渐变

\`\`\`jsx
// Mantine 内置渐变
<Box
  bg="red"
  style={{
    background: 'linear-gradient(45deg, var(--mantine-color-violet-6), var(--mantine-color-pink-6))',
  }}
>
  渐变背景
</Box>

// 用 bgGradient prop
<Box
  bgGradient="linear-gradient(45deg, var(--mantine-color-violet-6), var(--mantine-color-pink-6))"
>
  渐变
</Box>
\`\`\`

---

## 15.10 dark-* 色板（暗色模式专用）

Mantine 内部预定义了 dark-* 色阶，用于暗色模式的中性背景：

\`\`\`css
[data-mantine-color-scheme="dark"] {
  --mantine-color-dark-0: #C9C9C9;
  --mantine-color-dark-1: #B8B8B8;
  --mantine-color-dark-2: #828282;
  --mantine-color-dark-3: #696969;
  --mantine-color-dark-4: #424242;
  --mantine-color-dark-5: #3B3B3B;
  --mantine-color-dark-6: #2E2E2E;
  --mantine-color-dark-7: #242424;
  --mantine-color-dark-8: #1F1F1F;
  --mantine-color-dark-9: #141414;
}
\`\`\`

**用法**：

\`\`\`jsx
// 暗色模式下的卡片背景
<Card style={{ background: 'var(--mantine-color-dark-7)' }}>...</Card>

// 暗色模式下的 hover
<Button style={{ '--button-bg-hover': 'var(--mantine-color-dark-5)' }}>...</Button>
\`\`\`

---

## 15.11 实战：完整品牌色方案

\`\`\`jsx
import { createTheme, MantineColorsTuple } from '@mantine/core';

// 1. 品牌主色（紫色）
const brand: MantineColorsTuple = [
  '#f8f0fc', '#f3d9fa', '#eebefb', '#e599f6', '#db78ed',
  '#c95eed', '#a834d6', '#8b29b3', '#6e1f8c', '#4d1663',
];

// 2. 业务色（成功）
const success: MantineColorsTuple = [
  '#ebfbee', '#d3f9d8', '#b2f2bb', '#8ce99a', '#69db7c',
  '#51cf66', '#40c057', '#37b24d', '#2f9e44', '#2b8a3e',
];

// 3. 业务色（警告）
const warning: MantineColorsTuple = [
  '#fff9db', '#fff3bf', '#ffec99', '#ffe066', '#ffd43b',
  '#fcc419', '#fab005', '#f59f00', '#f08c00', '#e67700',
];

// 4. 业务色（错误）
const danger: MantineColorsTuple = [
  '#fff5f5', '#ffe3e3', '#ffc9c9', '#ffa8a8', '#ff8787',
  '#ff6b6b', '#fa5252', '#f03e3e', '#e03131', '#c92a2a',
];

// 5. 中性灰
const neutral: MantineColorsTuple = [
  '#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#ced4da',
  '#adb5bd', '#868e96', '#495057', '#343a40', '#212529',
];

const theme = createTheme({
  colors: { brand, success, warning, danger, neutral },
  primaryColor: 'brand',
  primaryShade: { light: 6, dark: 4 },
  white: '#ffffff',
  black: '#000000',
});

// 全局 Alert 默认色
theme.components = {
  ...theme.components,
  Alert: {
    defaultProps: { color: 'neutral' },
  },
  Notification: {
    defaultProps: { color: 'neutral' },
  },
};
\`\`\`

---

## 15.12 小结

- Mantine 24 个预定义色板，每个 10 阶。
- 10 阶对应不同用途：背景 / hover / 边框 / 文字 / 主题色。
- 颜色用 **HSL 通道**存储，方便 runtime 调整 alpha。
- 自定义色板用 **Mantine Color Generator**（https://mantine.dev/colors-generator/）。
- \`primaryShade\` 让亮色 / 暗色用不同色阶，保证对比度。
- dark-* 色板用于暗色模式的中性背景。

> ⭐ 记住：**「10 阶 = 0 浅背景 → 6 主色 → 9 深色，HSL 通道支持 alpha 调整」**。

下一章我们看圆角 / 间距 / 字体 token。
`,
  },

  // ============================================================
  // 第十六章
  // ============================================================
  {
    id: "mantine3-ch16",
    group: "第三部分 Theme 主题系统",
    icon: "📏",
    title: "第十六章 圆角 / 间距 / 字体 token",
    content: `## 16.1 圆角（radius）

### 默认 5 档

\`\`\`jsx
const theme = createTheme({
  radius: {
    xs: '2px',   // 0.125rem
    sm: '4px',   // 0.25rem
    md: '8px',   // 0.5rem
    lg: '16px',  // 1rem
    xl: '32px',  // 2rem
  },
  defaultRadius: 'sm',  // 全局默认圆角
});
\`\`\`

### 用法

\`\`\`jsx
// 组件级指定
<Button radius="xl">大圆角</Button>
<Card radius="md">中等圆角</Card>
<TextInput radius="xs">小圆角</TextInput>

// 全局默认（来自 defaultRadius）
<Button>默认圆角</Button>  // sm
\`\`\`

### 圆角选择建议

| 风格 | 推荐 |
| --- | --- |
| 极简现代 | \`md\` 或 \`lg\` |
| 商务正式 | \`sm\` 或 \`xs\` |
| 圆润可爱 | \`xl\` |

### 自定义单位

\`\`\`jsx
// 可以用任意 CSS 单位
const theme = createTheme({
  radius: {
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '2rem',
  },
});
\`\`\`

---

## 16.2 间距（spacing）

### 默认 5 档

\`\`\`jsx
const theme = createTheme({
  spacing: {
    xs: '10px',
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '32px',
  },
});
\`\`\`

### 用法

\`\`\`jsx
// style props
<Box p="md" m="lg">...</Box>

// 组件 props
<Stack gap="sm">...</Stack>
<Group gap="md">...</Group>
<Grid gutter="lg">...</Grid>

// 任意数值
<Box p={20}>...</Box>  // 20px
<Box p="5rem">...</Box>  // 5rem
\`\`\`

### 间距选择建议

| 场景 | 推荐 |
| --- | --- |
| 紧凑布局 | \`xs\` 或 \`sm\` |
| 标准布局 | \`md\` |
| 宽松布局 | \`lg\` 或 \`xl\` |

### 响应式间距

\`\`\`jsx
<Box p={{ base: 'xs', md: 'md', lg: 'lg' }}>
  移动端紧凑，桌面端宽松
</Box>
\`\`\`

---

## 16.3 字体（fontFamily）

### 默认字体

\`\`\`jsx
const theme = createTheme({
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
});
\`\`\`

### 自定义字体

\`\`\`jsx
const theme = createTheme({
  fontFamily: 'Inter, -apple-system, sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", Consolas, monospace',
});
\`\`\`

### 引入 Google Fonts

在 \`layout.tsx\` 里引入：

\`\`\`jsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html className={inter.className}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
\`\`\`

\`\`\`jsx
// 然后在主题里用
const theme = createTheme({
  fontFamily: 'var(--font-inter), sans-serif',
});
\`\`\`

### 用法

\`\`\`jsx
// 全局字体（来自 fontFamily）
<Text>默认字体</Text>

// 等宽字体
<Code>const x = 1;</Code>

// 自定义字体
<Text style={{ fontFamily: 'var(--font-inter)' }}>Inter 字体</Text>
\`\`\`

---

## 16.4 标题（headings）

### 默认配置

\`\`\`jsx
const defaultHeadings = {
  fontFamily: '-apple-system, sans-serif',
  fontWeight: '700',
  sizes: {
    h1: { fontSize: '2.125rem', lineHeight: '1.3', fontWeight: '700' },
    h2: { fontSize: '1.625rem', lineHeight: '1.35', fontWeight: '700' },
    h3: { fontSize: '1.375rem', lineHeight: '1.4', fontWeight: '700' },
    h4: { fontSize: '1.125rem', lineHeight: '1.45', fontWeight: '700' },
    h5: { fontSize: '1rem', lineHeight: '1.5', fontWeight: '700' },
    h6: { fontSize: '0.875rem', lineHeight: '1.5', fontWeight: '700' },
  },
};
\`\`\`

### 自定义标题

\`\`\`jsx
const theme = createTheme({
  headings: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '800',  // 全局标题加粗
    sizes: {
      h1: { fontSize: '3rem', lineHeight: '1.2', fontWeight: '900' },
      h2: { fontSize: '2.25rem', lineHeight: '1.25', fontWeight: '800' },
      h3: { fontSize: '1.75rem', lineHeight: '1.3', fontWeight: '700' },
      // h4-h6 继承全局 fontWeight
    },
  },
});
\`\`\`

### 用法

\`\`\`jsx
import { Title } from '@mantine/core';

<Title order={1}>H1 标题</Title>
<Title order={2}>H2 标题</Title>
<Title order={3}>H3 标题</Title>
<Title order={4}>H4 标题</Title>
<Title order={5}>H5 标题</Title>
<Title order={6}>H6 标题</Title>

// 自定义大小（不依赖 order）
<Title order={2} size="h1">order=2 但大小是 h1</Title>
\`\`\`

### 响应式标题

\`\`\`jsx
<Title order={1} size={{ base: 'h3', md: 'h1' }}>
  移动端小，桌面端大
</Title>
\`\`\`

---

## 16.5 其他 token

### cursorType

\`\`\`jsx
const theme = createTheme({
  cursorType: 'pointer',  // 所有可交互元素用 pointer 光标
});
\`\`\`

**可选值**：

- \`'pointer'\`：所有可点击元素都是手指光标（推荐）。
- \`'default'\`：默认光标（按钮用箭头，不推荐）。

### focusRing

\`\`\`jsx
const theme = createTheme({
  focusRing: 'auto',  // auto = 键盘 focus 时才显示，鼠标点击不显示
});
\`\`\`

**可选值**：

- \`'auto'\`：键盘 focus 时显示，鼠标点击不显示（推荐）。
- \`'always'\`：所有 focus 都显示（包括鼠标点击，不推荐，会很丑）。
- \`'never'\`：所有 focus 都不显示（可访问性差，不推荐）。

### respectReducedMotion

\`\`\`jsx
const theme = createTheme({
  respectReducedMotion: true,  // 用户系统设置 prefers-reduced-motion 时禁用动画
});
\`\`\`

**推荐 \`true\`**：尊重用户的可访问性设置。

---

## 16.6 实战：完整设计 token

\`\`\`jsx
import { createTheme } from '@mantine/core';

const theme = createTheme({
  // === 圆角 ===
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  defaultRadius: 'md',

  // === 间距 ===
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },

  // === 字体 ===
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", Consolas, monospace',
  headings: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2.5rem', lineHeight: '1.2' },
      h2: { fontSize: '2rem', lineHeight: '1.25' },
      h3: { fontSize: '1.5rem', lineHeight: '1.3' },
      h4: { fontSize: '1.25rem', lineHeight: '1.35' },
      h5: { fontSize: '1.125rem', lineHeight: '1.4' },
      h6: { fontSize: '1rem', lineHeight: '1.5' },
    },
  },

  // === 全局行为 ===
  cursorType: 'pointer',
  focusRing: 'auto',
  respectReducedMotion: true,

  // === 自定义 token（other）===
  other: {
    headerHeight: 60,
    sidebarWidth: 240,
    appName: 'MyApp',
  },
});
\`\`\`

---

## 16.7 在业务代码里访问 other

\`\`\`jsx
import { useMantineTheme } from '@mantine/core';

function MyHeader() {
  const theme = useMantineTheme();
  return (
    <div style={{ height: theme.other.headerHeight }}>
      {/* 用 theme.other 访问自定义 token */}
    </div>
  );
}
\`\`\`

**或直接用 CSS 变量**（推荐）：

\`\`\`jsx
// Mantine 会自动把 other 编译为 CSS 变量
// 可以在 style 里直接用
<div style={{ height: 'var(--mantine-other-headerHeight)' }}>
  高度来自 theme.other
</div>
\`\`\`

---

## 16.8 style props 完整对照

| Prop | 接受值 | 对应 CSS |
| --- | --- | --- |
| \`p\`, \`pt\`, \`pr\`, \`pb\`, \`pl\`, \`px\`, \`py\` | \`xs\`/\`sm\`/\`md\`/\`lg\`/\`xl\` 或任意 CSS | padding |
| \`m\`, \`mt\`, \`mr\`, \`mb\`, \`ml\`, \`mx\`, \`my\` | 同上 | margin |
| \`bg\` | 颜色或色阶 | background |
| \`c\` | 颜色或色阶 | color |
| \`fw\` | 100-900 | font-weight |
| \`fs\` | 数字或字符串 | font-size |
| \`lh\` | 数字或字符串 | line-height |
| \`ff\` | 字符串 | font-family |
| \`ta\` | \`left\`/\`center\`/\`right\`/\`justify\` | text-align |
| \`tt\` | \`uppercase\`/\`lowercase\`/\`capitalize\`/\`none\` | text-transform |
| \`td\` | \`underline\`/\`line-through\`/\`none\` | text-decoration |
| \`bd\`, \`bt\`, \`br\`, \`bb\`, \`bl\` | 字符串 | border |
| \`bdrs\` | 字符串 | border-radius |
| \`w\`, \`h\`, \`maw\`, \`mah\`, \`miw\`, \`mih\` | 字符串 | width/height |
| \`pos\` | 字符串 | position |
| \`top\`, \`right\`, \`bottom\`, \`left\` | 字符串 | top/right/bottom/left |
| \`boxShadow\` | 字符串 | box-shadow |
| \`opacity\` | 0-1 | opacity |
| \`display\` | 字符串 | display |
| \`visibleFrom\`, \`hiddenFrom\` | 断点 | 响应式显示 |

---

## 16.9 小结

- 5 档圆角（xs/sm/md/lg/xl），用 \`defaultRadius\` 设全局默认。
- 5 档间距（xs/sm/md/lg/xl），影响 style props 的 p/m/gap。
- 字体分正文和标题，标题有 6 档（h1-h6）。
- \`cursorType\` \`focusRing\` \`respectReducedMotion\` 是可访问性 token。
- \`other\` 字段可以存自定义 token，自动编译为 CSS 变量。
- style props 完整覆盖了**所有常用 CSS 属性**。

> ⭐ 记住：**「5 档圆角 + 5 档间距 + 6 档标题」是 Mantine 的「尺寸系统三剑客」**。

下一章我们看阴影 / 断点 / 默认值。
`,
  },

  // ============================================================
  // 第十七章
  // ============================================================
  {
    id: "mantine3-ch17",
    group: "第三部分 Theme 主题系统",
    icon: "🌓",
    title: "第十七章 阴影 / 断点 / 默认值",
    content: `## 17.1 阴影（shadows）

### 默认 5 档

\`\`\`jsx
const theme = createTheme({
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  },
});
\`\`\`

### 用法

\`\`\`jsx
// 组件 shadow prop
<Card shadow="sm">小阴影</Card>
<Card shadow="md">中等阴影</Card>
<Card shadow="lg">大阴影</Card>
<Card shadow="xl">超大阴影</Card>

// style prop
<Box shadow="md">...</Box>
<Box style={{ boxShadow: 'var(--mantine-shadow-md)' }}>...</Box>
\`\`\`

### 阴影选择建议

| 场景 | 推荐 |
| --- | --- |
| 扁平化设计 | \`xs\` 或 \`sm\` |
| 标准卡片 | \`md\` |
| 弹窗 / Drawer | \`lg\` 或 \`xl\` |
| Hover 效果 | 从 \`sm\` → \`md\` 过渡 |

### 暗色模式下的阴影

暗色模式下，**阴影需要调整**（黑色阴影在深色背景上看不清）：

\`\`\`jsx
const theme = createTheme({
  shadows: {
    // 暗色模式用更明显的阴影 + 黑色
    xs: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.5)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5), 0 4px 6px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.5), 0 10px 10px rgba(0, 0, 0, 0.5)',
  },
});
\`\`\`

**或者用 \`boxShadow\` 加内阴影模拟深度**：

\`\`\`jsx
<Card style={{
  boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 16px rgba(0, 0, 0, 0.5)',
}}>
  暗色模式用边框 + 阴影
</Card>
\`\`\`

---

## 17.2 断点（breakpoints）

### 默认 5 档

\`\`\`jsx
const theme = createTheme({
  breakpoints: {
    xs: '36em',  // 576px
    sm: '48em',  // 768px
    md: '62em',  // 992px
    lg: '75em',  // 1200px
    xl: '88em',  // 1408px
  },
});
\`\`\`

### 单位选择

| 单位 | 含义 | 优缺点 |
| --- | --- | --- |
| \`em\` | 相对父元素字体大小 | 受父元素影响 |
| \`rem\` | 相对根元素字体大小 | 推荐，受影响小 |
| \`px\` | 绝对像素 | 简单但不够灵活 |

**Mantine 默认用 \`em\`**，因为它和浏览器默认字体大小（16px）挂钩，可以**让用户的浏览器设置影响断点**。

### 自定义断点

\`\`\`jsx
// 更紧凑的断点（适合移动端优先的项目）
const theme = createTheme({
  breakpoints: {
    xs: '30em',  // 480px
    sm: '40em',  // 640px
    md: '56em',  // 896px
    lg: '72em',  // 1152px
    xl: '88em',  // 1408px
  },
});

// 更宽松的断点（适合大屏优先的项目）
const theme = createTheme({
  breakpoints: {
    xs: '40em',  // 640px
    sm: '56em',  // 896px
    md: '72em',  // 1152px
    lg: '88em',  // 1408px
    xl: '104em', // 1664px
  },
});
\`\`\`

### 用法

\`\`\`jsx
// object 语法
<Box
  p={{ base: 'xs', md: 'md' }}
  display={{ base: 'block', md: 'flex' }}
>
  响应式
</Box>

// visibleFrom / hiddenFrom
<Box visibleFrom="md">只在 md 及以上显示</Box>
<Box hiddenFrom="lg">lg 及以上隐藏</Box>

// 数组语法（按 xs/sm/md/lg/xl 顺序）
<Box p={['xs', 'sm', 'md', 'lg', 'xl']}>...</Box>
\`\`\`

---

## 17.3 默认值（defaults）

\`MantineProvider\` 接受一些全局默认值，影响所有组件：

### defaultColorScheme

\`\`\`jsx
<MantineProvider defaultColorScheme="auto">
  {/* auto / light / dark */}
</MantineProvider>
\`\`\`

### env

\`\`\`jsx
<MantineProvider env="test">
  {/* test 环境下禁用某些动画 */}
</MantineProvider>
\`\`\`

---

## 17.4 主题级其他 token

### white / black

\`\`\`jsx
const theme = createTheme({
  white: '#ffffff',  // 全局白色 token
  black: '#000000',  // 全局黑色 token
});
\`\`\`

**用途**：

- \`--mantine-color-white\` / \`--mantine-color-black\` 是基础色。
- 一些组件的默认文字色（如 Button）会用 \`--mantine-color-white\`。
- 暗色模式下 white 不变，black 不变，但其他颜色反转。

**自定义**：

\`\`\`jsx
// 如果你的项目背景不是纯白/纯黑
const theme = createTheme({
  white: '#fafafa',  // 浅灰
  black: '#0a0a0a',  // 深灰
});
\`\`\`

---

## 17.5 实战：响应式 Dashboard 配置

\`\`\`jsx
const theme = createTheme({
  // 紧凑断点（移动端优先）
  breakpoints: {
    xs: '30em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
  },

  // 阴影（清晰 + 暗色友好）
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
  },

  // 圆角（中等圆润）
  radius: {
    xs: '2px',
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '24px',
  },
  defaultRadius: 'md',

  // 间距（标准）
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
});
\`\`\`

---

## 17.6 主题调试

\`\`\`jsx
import { useMantineTheme } from '@mantine/core';

function ThemeDebug() {
  const theme = useMantineTheme();
  return (
    <pre>
      shadows: {JSON.stringify(theme.shadows, null, 2)}
      breakpoints: {JSON.stringify(theme.breakpoints, null, 2)}
      white: {theme.white}
      black: {theme.black}
    </pre>
  );
}
\`\`\`

---

## 17.7 暗色模式的阴影技巧

暗色模式下，单纯用 \`box-shadow\` 效果不好（黑色阴影在深色背景上看不清）。**三种解法**：

### 解法 1：增强阴影

\`\`\`jsx
const darkShadows = {
  xs: '0 1px 3px rgba(0, 0, 0, 0.5)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.7)',
  md: '0 4px 6px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.7)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.5), 0 4px 6px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.5), 0 10px 10px rgba(0, 0, 0, 0.5)',
};
\`\`\`

### 解法 2：边框 + 阴影

\`\`\`jsx
// 暗色模式下用半透明白色边框
const style = colorScheme === 'dark'
  ? { boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 6px rgba(0, 0, 0, 0.5)' }
  : { boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' };
\`\`\`

### 解法 3：Mantine 内部 token

\`\`\`jsx
// 用 Mantine 提供的 --mantine-color-default-border 等变量
<Card style={{
  boxShadow: '0 1px 3px var(--mantine-color-default-border), 0 1px 2px rgba(0, 0, 0, 0.05)',
}}>
  暗色友好阴影
</Card>
\`\`\`

---

## 17.8 小结

- 5 档阴影（xs/sm/md/lg/xl），用 \`shadow\` prop 或 \`boxShadow\` style prop。
- 暗色模式下用**增强阴影 + 边框** 模拟深度。
- 5 档断点（xs/sm/md/lg/xl），用 \`em\` 单位保证灵活性。
- \`white\` / \`black\` 是基础色 token，可以自定义。
- \`env="test"\` 用于测试环境，禁用某些动画。

> ⭐ 记住：**「阴影 + 断点是响应式与立体感的两大支柱」**。

下一章我们看 primaryColor 与 primaryShade。
`,
  },

  // ============================================================
  // 第十八章
  // ============================================================
  {
    id: "mantine3-ch18",
    group: "第三部分 Theme 主题系统",
    icon: "🎯",
    title: "第十八章 primaryColor 与 primaryShade",
    content: `## 18.1 primaryColor 的作用

\`primaryColor\` 是**全局主色**，影响：

1. \`<Button>\`、\`<Badge>\` 等组件**不指定 color 时的默认色**。
2. **焦点环**（focus ring）的颜色。
3. **链接**（Anchor）的颜色。
4. **激活状态**（如 Tabs active）的颜色。

\`\`\`jsx
const theme = createTheme({
  primaryColor: 'violet',  // 全局主色是紫色
});

<Button>按钮</Button>  // 默认紫色
<Anchor href="/">链接</Anchor>  // 默认紫色
\`\`\`

---

## 18.2 primaryColor 的两个常见用法

### 用法 1：用预定义色板

\`\`\`jsx
const theme = createTheme({
  primaryColor: 'violet',  // 24 个预定义色板之一
});
\`\`\`

### 用法 2：用自定义品牌色

\`\`\`jsx
const theme = createTheme({
  primaryColor: 'brand',  // 引用 colors 中定义的色板
  colors: {
    brand: brandColors,  // 10 阶
  },
});
\`\`\`

---

## 18.3 primaryShade：亮色与暗色用不同色阶

\`\`\`jsx
const theme = createTheme({
  primaryColor: 'violet',
  primaryShade: {
    light: 6,  // 亮色模式用 6 阶（深紫）
    dark: 4,   // 暗色模式用 4 阶（浅紫）
  },
});
\`\`\`

**为什么暗色模式用更浅的色阶？**

暗色背景下，**深色按钮看不清**。所以暗色模式默认用更浅的色阶。

**Mantine 9 的默认**：

\`\`\`jsx
primaryShade: {
  light: 6,  // 亮色：6 阶
  dark: 8,   // 暗色：8 阶
}
\`\`\`

> ⚠️ 注意：Mantine v9 的默认是 dark: 8（深色），但**实际效果因色板而异**。推荐**手动指定 dark: 4 或 5**（更亮），效果更好。

---

## 18.4 覆盖 primaryShade

### 组件级

\`\`\`jsx
// 强制用 4 阶
<Button color="violet.4">按钮</Button>

// 用 primaryShade 自动
<Button color="violet">按钮</Button>
\`\`\`

### 主题级

\`\`\`jsx
const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: { light: 5, dark: 3 },  // 全局覆盖
});
\`\`\`

### 按组件类型

\`\`\`jsx
// Button 用 6 阶，Badge 用 5 阶
const theme = createTheme({
  components: {
    Button: {
      vars: (_, params) => ({
        root: {
          '--button-bg': \`var(--mantine-color-\${params.color}-\${params.colorScheme === 'dark' ? 4 : 6})\`,
        },
      }),
    },
  },
});
\`\`\`

---

## 18.5 主题级组件 defaultProps

\`\`\`jsx
const theme = createTheme({
  primaryColor: 'violet',
  components: {
    // 所有 Button 默认紫色
    Button: {
      defaultProps: { color: 'violet' },
    },
    // 所有 Anchor 默认紫色 + underline
    Anchor: {
      defaultProps: { color: 'violet', underline: 'always' },
    },
    // 所有 Tabs 用 violet 作为主题色
    Tabs: {
      defaultProps: { color: 'violet' },
    },
  },
});
\`\`\`

---

## 18.6 动态主题

**场景**：用户从「品牌 A」切换到「品牌 B」，primaryColor 也跟着变。

\`\`\`tsx
'use client';

import { useState } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { brandAColors, brandBColors } from './brand-colors';

function App() {
  const [brand, setBrand] = useState<'a' | 'b'>('a');

  const theme = createTheme({
    primaryColor: brand === 'a' ? 'brandA' : 'brandB',
    colors: brand === 'a' ? brandAColors : brandBColors,
  });

  return (
    <MantineProvider theme={theme}>
      <button onClick={() => setBrand(brand === 'a' ? 'b' : 'a')}>
        切换到品牌 {brand === 'a' ? 'B' : 'A'}
      </button>
    </MantineProvider>
  );
}
\`\`\`

**注意**：切换主题会**触发整个组件树重渲染**。如果页面很重，会卡顿。

**优化**：用 \`useMemo\` 缓存 theme，或拆分为多个子 Provider。

---

## 18.7 primaryShade 调试

\`\`\`jsx
import { useMantineTheme } from '@mantine/core';

function DebugPrimary() {
  const theme = useMantineTheme();
  return (
    <pre>
      primaryColor: {theme.primaryColor}
      primaryShade: {JSON.stringify(theme.primaryShade)}
      active shade: {theme.primaryShade[
        theme.colorScheme === 'dark' ? 'dark' : 'light'
      ]}
    </pre>
  );
}
\`\`\`

---

## 18.8 实战：多品牌 SaaS 主题

\`\`\`tsx
// themes.ts
import { createTheme, MantineColorsTuple } from '@mantine/core';

const brandA: MantineColorsTuple = [
  '#e3fafc', '#c5f6fa', '#99e9f2', '#66d9e8', '#3bc9db',
  '#22b8cf', '#15aabf', '#1098ad', '#0c8599', '#0b7285',
];

const brandB: MantineColorsTuple = [
  '#fff0f6', '#ffdeeb', '#fcc2d7', '#faa2c1', '#f783ac',
  '#f06595', '#e64980', '#d6336c', '#c2255c', '#a61e4d',
];

export const brandATheme = createTheme({
  primaryColor: 'brandA',
  colors: { brandA },
  primaryShade: { light: 6, dark: 4 },
});

export const brandBTheme = createTheme({
  primaryColor: 'brandB',
  colors: { brandB },
  primaryShade: { light: 6, dark: 4 },
});
\`\`\`

\`\`\`tsx
// app.tsx
'use client';

import { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { brandATheme, brandBTheme } from './themes';

export default function App() {
  const [brand, setBrand] = useState<'A' | 'B'>('A');
  const theme = brand === 'A' ? brandATheme : brandBTheme;

  return (
    <MantineProvider theme={theme}>
      <button onClick={() => setBrand(brand === 'A' ? 'B' : 'A')}>
        切换品牌
      </button>
      <YourApp />
    </MantineProvider>
  );
}
\`\`\`

---

## 18.9 常见错误

### 错误 1：primaryColor 引用不存在的色

\`\`\`jsx
// ❌ 'brand' 没在 colors 里
const theme = createTheme({
  primaryColor: 'brand',
});

// ✅ 'brand' 在 colors 里
const theme = createTheme({
  primaryColor: 'brand',
  colors: { brand: brandColors },
});
\`\`\`

### 错误 2：primaryShade 超出范围

\`\`\`jsx
// ❌ 11 超出 0-9 范围
const theme = createTheme({
  primaryShade: { light: 11, dark: 6 },
});

// ✅ 0-9 范围内
const theme = createTheme({
  primaryShade: { light: 5, dark: 4 },
});
\`\`\`

### 错误 3：light/dark 混淆

\`\`\`jsx
// ❌ light=8（深色）会让亮色模式按钮看不清
const theme = createTheme({
  primaryShade: { light: 8, dark: 4 },
});

// ✅ light=6（深色）适合亮色模式
const theme = createTheme({
  primaryShade: { light: 6, dark: 4 },
});
\`\`\`

---

## 18.10 小结

- \`primaryColor\` 是全局主色，影响 Button / Anchor / Tabs 等。
- \`primaryShade\` 让亮色 / 暗色用不同色阶，保证对比度。
- 推荐 **light: 6, dark: 4** 的组合。
- 用 components 配置可以按组件类型覆盖 primaryShade。
- 多品牌主题用 \`useState\` + \`createTheme\` 切换，但**会触发重渲染**。

> ⭐ 记住：**「primaryColor + primaryShade 是品牌色的入口」**。

下一章我们看主题级组件覆盖。
`,
  },

  // ============================================================
  // 第十九章
  // ============================================================
  {
    id: "mantine3-ch19",
    group: "第三部分 Theme 主题系统",
    icon: "🔧",
    title: "第十九章 主题级组件覆盖（classNames / styles / vars）",
    content: `## 19.1 组件级覆盖的 4 个子配置

在主题的 \`components\` 字段下，每个组件可以配置 **4 个子选项**：

\`\`\`ts
type ComponentThemeOverride = {
  defaultProps: Record<string, any>;       // 全局默认 props
  classNames: Record<string, string>;       // 全局 className
  styles: Record<string, CSSProperties> | ((theme, params) => Record<string, CSSProperties>);
  vars: Record<string, Record<string, any>> | ((theme, params) => Record<string, Record<string, any>>);
};
\`\`\`

---

## 19.2 defaultProps：全局默认 props

**作用**：给组件设置全局默认值。

\`\`\`jsx
const theme = createTheme({
  components: {
    Button: {
      defaultProps: {
        radius: 'xl',     // 所有 Button 默认大圆角
        size: 'md',       // 中等大小
        variant: 'filled', // 实心样式
      },
    },
    TextInput: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
    },
    Modal: {
      defaultProps: {
        centered: true,   // 所有 Modal 默认居中
        radius: 'lg',
        size: 'lg',
      },
    },
  },
});

// 现在可以省略这些 props
<Button>按钮</Button>  // 默认 size=md, radius=xl, variant=filled
<Modal opened={opened} onClose={close}>...</Modal>  // 默认居中 + radius=lg
\`\`\`

**优先级**：组件实例 props > defaultProps。

\`\`\`jsx
<Button size="lg">按钮</Button>  // 实例指定 size=lg，覆盖 defaultProps 的 size=md
\`\`\`

---

## 19.3 classNames：全局 className

**作用**：给组件的**子元素**添加全局 className。

\`\`\`jsx
// 1. 定义 CSS
import classes from './theme-overrides.module.css';

const theme = createTheme({
  components: {
    Button: {
      classNames: {
        root: classes.buttonRoot,    // 按钮最外层元素
        label: classes.buttonLabel,  // 按钮内的文字 span
        inner: classes.buttonInner,  // 内部容器
      },
    },
  },
});
\`\`\`

\`\`\`css
/* theme-overrides.module.css */
.buttonRoot {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.buttonRoot:hover {
  transform: translateY(-1px);
  transition: transform 0.2s;
}

.buttonLabel {
  font-weight: 700;
}
\`\`\`

**优点**：

- 编译期生成，**零运行时开销**。
- 可以用任何 CSS 特性（媒体查询、伪类、动画）。

---

## 19.4 styles：全局样式对象

**作用**：用 JS 对象写全局样式（runtime 合并）。

\`\`\`jsx
const theme = createTheme({
  components: {
    Button: {
      // 写法 1：直接对象
      styles: {
        root: {
          fontWeight: 700,
          textTransform: 'uppercase',
        },
        label: {
          letterSpacing: 1,
        },
      },

      // 写法 2：函数（拿到 theme 和 params）
      styles: (theme, params) => ({
        root: {
          fontWeight: 700,
          // 动态根据 props 决定
          background: params.color === 'red' ? theme.colors.red[6] : theme.colors.blue[6],
        },
      }),
    },
  },
});
\`\`\`

**params 是什么？**

params 是组件的 props（除了 \`styles\` / \`classNames\` / \`vars\` 这些主题配置项）。

\`\`\`jsx
<Button color="red" size="md">按钮</Button>
// params = { color: 'red', size: 'md', children: '按钮', ... }
\`\`\`

---

## 19.5 vars：CSS 变量级覆盖

**作用**：注入自定义 CSS 变量到组件。

\`\`\`jsx
const theme = createTheme({
  components: {
    Button: {
      vars: (theme, params) => ({
        root: {
          '--button-height': params.size === 'sm' ? '32px' : '40px',
          '--button-fz': params.size === 'sm' ? '12px' : '14px',
        },
      }),
    },
  },
});
\`\`\`

**生成的 CSS**：

\`\`\`css
.mantine-Button-root {
  --button-height: 40px;
  --button-fz: 14px;
  height: var(--button-height);
  font-size: var(--button-fz);
}
\`\`\`

**vars 的优势**：

- 比 \`styles\` 性能更好（CSS 变量层，零 runtime 计算）。
- 可以被子组件继承（用 \`var(--button-height)\` 引用）。
- 暗色模式下，CSS 变量自动响应。

---

## 19.6 实战：统一按钮风格

\`\`\`jsx
const theme = createTheme({
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
        size: 'sm',
      },
      classNames: {
        root: 'app-button-root',
      },
      styles: (theme) => ({
        root: {
          fontWeight: 600,
          // 不要 transform: uppercase（中文环境下显得奇怪）
        },
      }),
    },
  },
});
\`\`\`

\`\`\`css
/* globals.css */
.app-button-root {
  transition: all 0.2s;
}

.app-button-root:hover {
  transform: translateY(-1px);
  box-shadow: var(--mantine-shadow-md);
}
\`\`\`

---

## 19.7 实战：表单组件统一风格

\`\`\`jsx
const theme = createTheme({
  components: {
    TextInput: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
    },
    NumberInput: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
    },
    Textarea: {
      defaultProps: {
        size: 'md',
        radius: 'md',
        autosize: true,    // 自适应高度
        minRows: 2,
        maxRows: 6,
      },
    },
  },
});
\`\`\`

---

## 19.8 实战：Alert 颜色映射

\`\`\`jsx
const theme = createTheme({
  components: {
    Alert: {
      styles: (theme) => ({
        // 成功用绿色，警告用黄色
        root: {
          borderWidth: 1,
        },
        icon: {
          size: 20,
        },
      }),
    },
  },
});

// 用法
<Alert color="green" title="成功">操作完成</Alert>
<Alert color="yellow" title="警告">请注意</Alert>
<Alert color="red" title="错误">操作失败</Alert>
\`\`\`

---

## 19.9 实战：自定义 Card 风格

\`\`\`jsx
const theme = createTheme({
  components: {
    Card: {
      defaultProps: {
        radius: 'lg',
        withBorder: true,
        padding: 'lg',
      },
      styles: (theme) => ({
        root: {
          // 暗色模式下用 border 模拟深度
          background: theme.colorScheme === 'dark'
            ? 'var(--mantine-color-dark-6)'
            : 'var(--mantine-color-white)',
        },
      }),
    },
  },
});
\`\`\`

---

## 19.10 主题级组件覆盖的局限性

### 限制 1：不能改组件的内部逻辑

\`classNames\` / \`styles\` / \`vars\` 只能改**外观**，不能改**行为**。

例如：

- 不能让 \`<Modal>\` 默认开启 closeOnEscape（虽然可以传 defaultProps）。
- 不能让 \`<TextInput>\` 默认有自动 focus（需要包装）。

### 限制 2：覆盖优先级

\`\`\`
组件实例 styles > 主题级 styles
组件实例 className > 主题级 classNames
组件实例 props > 主题级 defaultProps
\`\`\`

如果想让主题级配置覆盖组件实例，可以用 \`styles\`（运行时合并，**样式合并**而非替换）：

\`\`\`jsx
// 主题级
styles: { root: { fontWeight: 700 } }

// 组件实例
<Button styles={{ root: { color: 'red' } }}>
  // 实际：fontWeight 700 + color red（两个都生效，合并而非覆盖）
</Button>
\`\`\`

---

## 19.11 主题级覆盖 vs 业务组件

### 什么时候用主题级覆盖

- 全局通用的样式（如 Button 圆角、TextInput 大小）。
- 不需要传 props 就生效的默认行为。
- 一次配置，全局生效。

### 什么时候用业务组件

\`\`\`tsx
// components/Button.tsx
import { Button as MantineButton, ButtonProps } from '@mantine/core';
import { forwardRef } from 'react';

export const Button = forwardRef<HTMLButtonElement, ButtonProps & { loading?: boolean }>(
  ({ loading, children, ...props }, ref) => {
    return (
      <MantineButton
        ref={ref}
        loading={loading}
        // 项目特定的默认行为
        radius="xl"
        size="md"
        {...props}
      >
        {children}
      </MantineButton>
    );
  }
);
\`\`\`

**业务组件的适用场景**：

- 加载状态、自动 disable 等行为。
- 项目特有的 props。
- 业务组合（按钮 + 图标 + 文字）。

**最佳实践**：

- 主题级配置 + 业务组件封装**结合使用**。
- 简单样式（圆角、间距、字体）→ 主题级。
- 复杂行为（loading、async、error state）→ 业务组件。

---

## 19.12 小结

- 组件级覆盖有 4 个子配置：**defaultProps / classNames / styles / vars**。
- **defaultProps**：全局默认 props，组件实例可覆盖。
- **classNames**：全局 className，零运行时开销。
- **styles**：JS 对象或函数，可以拿到 theme 和 params。
- **vars**：CSS 变量级覆盖，性能最好。
- 优先级：组件实例 > 主题级。
- 行为级改动 → 业务组件；样式级改动 → 主题级。

> ⭐ 记住：**「主题级管外观，业务组件管行为」**。

---

## 第三部分上半总结

到这里，我们讲完了 Theme 系统的前半部分（第十四到十九章）：

- 第十四章：createTheme 完全指南（MantineThemeOverride 完整字段）
- 第十五章：颜色系统（24 色板 / 10 阶 / HSL 通道）
- 第十六章：圆角 / 间距 / 字体 token
- 第十七章：阴影 / 断点 / 默认值
- 第十八章：primaryColor 与 primaryShade
- 第十九章：主题级组件覆盖（4 个子配置）

接下来进入**Theme 系统后半部分**，我们看响应式 API、暗色模式深度、CSS 变量层、组件级深度覆盖。
`,
  },
];

export { chapters };
