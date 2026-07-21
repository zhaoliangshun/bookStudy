// =============================================================
// Mantine 之道 · 理念与设计目的 —— 第四批章节
// -------------------------------------------------------------
// 本批包含：
//   mantine3-ch20 : 第二十章 暗色模式完整实战
//   mantine3-ch21 : 第二十一章 CSS 变量层深入（vars resolver）
//   mantine3-ch22 : 第二十二章 主题与暗色模式 API 总结
//   mantine3-ch23 : 第二十三章 主题调试与 DevTools
//   mantine3-ch24 : 第二十四章 自定义品牌色完整流程
//   mantine3-ch25 : 第二十五章 主题系统性能优化
//
// 风格：实战导向，每个章节都有完整可运行 demo
// 适用版本：Mantine v9 / React 19 / Next.js 16
// =============================================================

const chapters = [
  // ============================================================
  // 第二十章
  // ============================================================
  {
    id: "mantine3-ch20",
    group: "第三部分 Theme 主题系统",
    icon: "🌚",
    title: "第二十章 暗色模式完整实战",
    content: `## 20.1 暗色模式的完整流程

一个生产级暗色模式需要解决 **5 个问题**：

1. **默认色板**：用户没设偏好时跟随系统。
2. **手动切换**：用户可以手动切换。
3. **持久化**：记住用户偏好。
4. **防闪烁**：SSR 时不闪烁。
5. **暗色色板优化**：暗色模式下的色板针对深色背景优化。

Mantine v9 提供了完整的解决方案。

---

## 20.2 完整的暗色模式实现

### 1. 全局类型

\`\`\`ts
// types/color-scheme.ts
export type ColorScheme = 'light' | 'dark' | 'auto';
export type ComputedColorScheme = 'light' | 'dark';
\`\`\`

### 2. 主题 + Provider

\`\`\`tsx
// providers.tsx
'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { useMemo } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useMemo(() => createTheme({
    primaryColor: 'violet',
    primaryShade: { light: 6, dark: 4 },
    // 暗色模式下的特殊 token
    other: {
      headerBg: 'var(--mantine-color-body)',
      cardBg: 'var(--mantine-color-body)',
    },
  }), []);

  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="auto"  // 跟随系统
    >
      {children}
    </MantineProvider>
  );
}
\`\`\`

### 3. layout.tsx（防闪烁）

\`\`\`tsx
// app/layout.tsx
import '@mantine/core/styles.css';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" {...mantineHtmlProps}>
      <head>
        {/* 必须在 <head> 里，防止暗色模式闪烁 */}
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
\`\`\`

### 4. 切换按钮

\`\`\`tsx
'use client';

import { ActionIcon, Tooltip, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export function ColorSchemeToggle() {
  // setColorScheme: 设置用户偏好
  const { setColorScheme } = useMantineColorScheme();
  // 实际生效的色板（已解析 auto）
  const computedColorScheme = useComputedColorScheme();

  return (
    <Tooltip label={computedColorScheme === 'dark' ? '亮色' : '暗色'}>
      <ActionIcon
        onClick={() => setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')}
        variant="default"
        size="lg"
      >
        {computedColorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
      </ActionIcon>
    </Tooltip>
  );
}
\`\`\`

### 5. 三档切换（light/dark/auto）

\`\`\`tsx
'use client';

import { SegmentedControl, useMantineColorScheme } from '@mantine/core';

export function ColorSchemeSegmented() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <SegmentedControl
      value={colorScheme}
      onChange={(value) => setColorScheme(value as 'light' | 'dark' | 'auto')}
      data={[
        { label: '☀️ 亮色', value: 'light' },
        { label: '🌙 暗色', value: 'dark' },
        { label: '🖥️ 自动', value: 'auto' },
      ]}
    />
  );
}
\`\`\`

---

## 20.3 暗色色板优化

### 默认 24 色板的暗色表现

Mantine 24 个预定义色板都**针对暗色模式优化过**：

- **primary color 6 阶**（亮色）→ **4 阶**（暗色）：让按钮在深色背景下更亮。
- **gray 色板**：在暗色模式下颜色反转。
- **dark 色板**：完全独立的暗色中性色。

\`\`\`jsx
// 默认色板在暗色模式下的效果
<Button color="violet">按钮</Button>
// 亮色模式：紫色 6 阶（深）
// 暗色模式：紫色 4 阶（浅）
\`\`\`

### 自定义色板的暗色优化

如果你写了自定义色板，建议提供**两个版本**：

\`\`\`jsx
import { MantineColorsTuple, createTheme } from '@mantine/core';

// 亮色品牌色（10 阶）
const brandLight: MantineColorsTuple = [
  '#f3f0ff', '#e5d4ff', '#d0b0ff', '#b88aff', '#9d63ff',
  '#7c3aed', '#5b21b6', '#491a94', '#3b1372', '#1e0a3d',
];

// 暗色品牌色（10 阶，可以不同！）
const brandDark: MantineColorsTuple = [
  '#2a1b4e', '#3b2570', '#4c3092', '#5d3bb4', '#6e46d6',
  '#7c3aed', '#9252f3', '#a86ef5', '#be8af7', '#d4a6f9',
];

// 用函数式 API 根据色板方案切换
const theme = createTheme((theme) => ({
  primaryColor: 'brand',
  colors: {
    // 这里可以根据 theme.colorScheme 切换，但 colorScheme 在 createTheme 时还没确定
    // 所以一般用 primaryShade 处理
    brand: brandLight,  // 默认 light
  },
  primaryShade: { light: 6, dark: 4 },
}));
\`\`\`

> ⚠️ 注意：Mantine 9 的 colors 字段在 createTheme 时已经确定，**不支持根据色板方案动态切换**。
> 解法：用 \`primaryShade\` 选不同色阶，**而不是** 切换整个色板。

---

## 20.4 暗色模式下的图片

### 静态图片

\`\`\`tsx
'use client';

import { useComputedColorScheme, Image } from '@mantine/core';

export function Logo() {
  const colorScheme = useComputedColorScheme();
  return (
    <Image
      src={colorScheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
      alt="logo"
      h={32}
    />
  );
}
\`\`\`

### 用 CSS 滤镜

\`\`\`css
/* 暗色模式下把所有图片反色 */
[data-mantine-color-scheme="dark"] img:not(.preserve-color) {
  filter: invert(1) hue-rotate(180deg);
}
\`\`\`

> ⚠️ 这种方式对彩色图片（如照片）效果不好，只适合**简单图标**。

### 用 SVG currentColor

\`\`\`tsx
// 用 currentColor 让 SVG 跟随文字色
export function Icon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" style={{ color: 'var(--mantine-color-text)' }}>
      <path d="..." fill="currentColor" />
    </svg>
  );
}
\`\`\`

---

## 20.5 暗色模式下的图表

图表库（recharts、chart.js）的颜色**不跟随 Mantine 主题**，需要手动映射。

\`\`\`tsx
'use client';

import { LineChart } from '@mantine/charts';
import { useComputedColorScheme } from '@mantine/core';

export function MyChart({ data }: { data: any[] }) {
  const colorScheme = useComputedColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <LineChart
      h={300}
      data={data}
      dataKey="date"
      series={[{ name: 'value', color: 'violet.6' }]}
      gridColor={isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'}
      textColor={isDark ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-gray-7)'}
    />
  );
}
\`\`\`

---

## 20.6 暗色模式下的 Modal / Drawer

\`\`\`jsx
<Modal
  opened={opened}
  onClose={close}
  title="标题"
  // 暗色模式下自动适配
  overlayProps={{
    backgroundOpacity: 0.55,
    blur: 3,
  }}
  // 暗色模式下用更深的背景
  styles={{
    content: {
      background: 'var(--mantine-color-body)',
    },
  }}
>
  ...
</Modal>
\`\`\`

---

## 20.7 暗色模式下的代码高亮

如果你的项目有代码块（博客、文档），需要适配暗色：

\`\`\`jsx
import { Code, CodeProps } from '@mantine/core';
import { useComputedColorScheme } from '@mantine/core';

export function ThemedCode(props: CodeProps) {
  const colorScheme = useComputedColorScheme();
  return (
    <Code
      {...props}
      style={{
        background: colorScheme === 'dark'
          ? 'var(--mantine-color-dark-6)'
          : 'var(--mantine-color-gray-0)',
        color: 'var(--mantine-color-text)',
        ...props.style,
      }}
    />
  );
}
\`\`\`

---

## 20.8 暗色模式的可访问性

### 对比度检查

\`\`\`jsx
import { readableColor } from '@mantine/hooks';

function MyComponent() {
  // 检查某个背景色上用白字还是黑字
  const textColor = readableColor('#5b21b6');  // 'white'（深紫背景用白字）
}
\`\`\`

### prefers-reduced-motion

\`\`\`jsx
import { useReducedMotion } from '@mantine/hooks';

function AnimatedCard() {
  const reduceMotion = useReducedMotion();

  return (
    <Card
      style={{
        transition: reduceMotion ? 'none' : 'all 0.3s',
      }}
    >
  </Card>
  );
}
\`\`\`

\`MantineProvider\` 默认 \`respectReducedMotion: true\`，自动尊重系统设置。

---

## 20.9 持久化到服务端

如果你的项目用 cookie 持久化（多子应用共享）：

\`\`\`tsx
'use client';

import { cookieStorage, MantineProvider, localStorageColorSchemeManager } from '@mantine/core';
import { useMemo } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const manager = useMemo(() =>
    cookieStorage({
      key: 'mantine-color-scheme',
      get: (key) => {
        if (typeof document === 'undefined') return null;
        const match = document.cookie.match(new RegExp(\`(^| )\${key}=([^;]+)\`));
        return match ? match[2] : null;
      },
      set: (key, value) => {
        document.cookie = \`\${key}=\${value}; max-age=31536000; path=/; SameSite=Lax\`;
      },
    }),
    []
  );

  return (
    <MantineProvider
      defaultColorScheme="auto"
      colorSchemeManager={manager}
    >
      {children}
    </MantineProvider>
  );
}
\`\`\`

---

## 20.10 完整实战：带暗色模式的 Dashboard

\`\`\`tsx
// dashboard-layout.tsx
'use client';

import { AppShell, Group, Title, ColorSchemeToggle } from '@myapp/components';
import { useComputedColorScheme } from '@mantine/core';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const colorScheme = useComputedColorScheme();

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header
        style={{
          background: colorScheme === 'dark'
            ? 'var(--mantine-color-dark-7)'
            : 'var(--mantine-color-white)',
          borderBottom: '1px solid var(--mantine-color-default-border)',
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Title order={3}>My Dashboard</Title>
          <ColorSchemeToggle />
        </Group>
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
\`\`\`

---

## 20.11 小结

- 暗色模式的 5 个关键点：**默认跟随、用户切换、持久化、防闪烁、色板优化**。
- 用 \`primaryShade: { light: 6, dark: 4 }\` 解决暗色模式色板问题。
- 图表、图片、代码高亮需要**手动适配**暗色模式。
- \`ColorSchemeScript\` 必须放在 \`<head>\` 里防止闪烁。
- 用 \`useComputedColorScheme()\` 拿到实际生效的色板。

> ⭐ 记住：**「ColorSchemeScript + MantineProvider + 切换按钮 = 完整暗色模式」**。

下一章我们深入 CSS 变量层与 vars resolver。
`,
  },

  // ============================================================
  // 第二十一章
  // ============================================================
  {
    id: "mantine3-ch21",
    group: "第三部分 Theme 主题系统",
    icon: "🔬",
    title: "第二十一章 CSS 变量层深入（vars resolver）",
    content: `## 21.1 什么是 vars resolver

\`vars resolver\` 是 Mantine 内部的一个机制：

**输入**：组件的 props + 当前 theme
**输出**：注入到组件根元素的 CSS 变量对象

\`\`\`ts
type VarsResolver = (theme: MantineTheme, params: Record<string, any>) => Record<string, Record<string, any>>;
\`\`\`

---

## 21.2 为什么需要 vars resolver

### 场景：动态颜色

假设你要做一个**根据 props 动态变色的 Button**：

\`\`\`jsx
<Button color="violet">按钮</Button>
<Button color="red">按钮</Button>
<Button color="blue">按钮</Button>
\`\`\`

**方式 1：用 styles（runtime 合并）**

\`\`\`jsx
styles: (theme, params) => ({
  root: {
    background: \`var(--mantine-color-\${params.color}-\${params.colorScheme === 'dark' ? 4 : 6})\`,
  },
})
\`\`\`

**方式 2：用 vars（编译期生成，性能更好）**

\`\`\`jsx
vars: (theme, params) => ({
  root: {
    '--button-bg': \`var(--mantine-color-\${params.color}-\${params.colorScheme === 'dark' ? 4 : 6})\`,
  },
})
\`\`\`

**区别**：

- \`styles\`：每次 render 重新计算样式对象，emotion 合并。
- \`vars\`：计算一次 CSS 变量值，浏览器原生级联。

**性能**：

- 1000 个 Button 切换主题：\`styles\` ~50ms，\`vars\` < 5ms。

---

## 21.3 Mantine 内部 vars resolver 示例

以 \`<Button>\` 为例（简化版）：

\`\`\`ts
// Mantine 内部 Button 的 vars resolver
const buttonVarsResolver: MantineVarsResolver = (theme, params) => {
  const colors = theme.variantColorResolver({
    color: params.color || theme.primaryColor,
    theme,
    colorScheme: params.colorScheme,
  });

  return {
    root: {
      '--button-height': \`var(--mantine-height-\${params.size})\`,
      '--button-padding-x': \`var(--mantine-spacing-\${params.size})\`,
      '--button-fz': \`var(--mantine-font-size-\${params.size})\`,
      '--button-bg': colors.background,
      '--button-color': colors.color,
      '--button-hover': colors.hover,
      '--button-border': \`\${rem(1)} solid \${colors.border}\`,
    },
  };
};
\`\`\`

**生成的 CSS**：

\`\`\`css
.mantine-Button-root {
  --button-height: var(--mantine-height-md);
  --button-bg: var(--mantine-color-violet-6);
  --button-hover: var(--mantine-color-violet-7);
  height: var(--button-height);
  background: var(--button-bg);

  &:hover {
    background: var(--button-hover);
  }
}
\`\`\`

**关键点**：

- \`--button-bg\` 是**逻辑变量**（不是具体值）。
- 暗色模式下，\`--mantine-color-violet-6\` 自动变成 \`--mantine-color-violet-4\`。
- 浏览器自动级联，**零 JS 参与**。

---

## 21.4 variantColorResolver

Mantine 内部用 \`variantColorResolver\` 处理**组件 + variant + color** 的颜色映射：

\`\`\`ts
// 简化版
function variantColorResolver({ color, variant, theme, colorScheme }) {
  const c = theme.colors[color][theme.primaryShade[colorScheme]];

  switch (variant) {
    case 'filled':
      return { background: c, color: theme.white, hover: theme.colors[color][theme.primaryShade[colorScheme] + 1] };
    case 'light':
      return { background: theme.colors[color][0], color: c, hover: theme.colors[color][1] };
    case 'outline':
      return { background: 'transparent', color: c, border: c };
    case 'subtle':
      return { background: 'transparent', color: c, hover: theme.colors[color][0] };
    case 'default':
      return { background: theme.white, color: theme.black, border: theme.colors.gray[3] };
    // ...
  }
}
\`\`\`

**这是 Mantine 的魔法核心**：

- \`<Button color="violet" variant="filled">\` → 自动算出 \`background: violet-6\`。
- \`<Button color="violet" variant="light">\` → 自动算出 \`background: violet-0\`。
- **不需要你手写**，vars resolver 自动处理。

---

## 21.5 自定义 vars resolver

### 在业务组件里用

\`\`\`tsx
// components/Button.tsx
import { Button as MantineButton, ButtonProps, MantineVarsResolver, createTheme } from '@mantine/core';

// 自定义 vars resolver
const customButtonResolver: MantineVarsResolver = (theme, params: ButtonProps) => {
  // 拿到 variant 颜色
  const colors = theme.variantColorResolver({
    color: params.color || theme.primaryColor,
    theme,
    colorScheme: params.colorScheme || 'light',
    variant: params.variant,
  });

  return {
    root: {
      '--button-bg': colors.background,
      '--button-color': colors.color,
      '--button-hover': colors.hover,
      // 自定义：圆角由 size 决定
      '--button-radius': params.size === 'sm' ? '4px' : '8px',
    },
  };
};

// 在主题里注册
const theme = createTheme({
  components: {
    Button: {
      vars: customButtonResolver,
    },
  },
});

// 用法
<Button color="violet" size="md" variant="filled">按钮</Button>
\`\`\`

### 复杂场景：根据 props 注入多个 CSS 变量

\`\`\`ts
const customButtonResolver: MantineVarsResolver = (theme, params: ButtonProps & { brand?: boolean }) => {
  return {
    root: {
      // 1. 颜色
      '--button-bg': params.brand ? theme.colors.brand[6] : 'var(--mantine-color-gray-6)',
      '--button-color': params.brand ? 'var(--mantine-color-white)' : 'var(--mantine-color-text)',
      // 2. 尺寸
      '--button-height': params.size === 'sm' ? '32px' : params.size === 'md' ? '40px' : '48px',
      '--button-fz': params.size === 'sm' ? '12px' : params.size === 'md' ? '14px' : '16px',
      // 3. 圆角
      '--button-radius': params.fullWidth ? '9999px' : 'var(--mantine-radius-md)',
    },
  };
};
\`\`\`

---

## 21.6 vars resolver 的最佳实践

### 原则 1：优先用 vars，其次用 styles

\`\`\`jsx
// ❌ 性能差
styles: (theme, params) => ({
  root: {
    background: \`var(--mantine-color-\${params.color}-6)\`,
    color: 'white',
  },
})

// ✅ 性能好
vars: (theme, params) => ({
  root: {
    '--button-bg': \`var(--mantine-color-\${params.color}-6)\`,
    '--button-color': 'white',
  },
})
\`\`\`

### 原则 2：CSS 变量名用前缀

\`\`\`jsx
// ✅ 用 --button- 前缀，避免和 Mantine 内部变量冲突
vars: () => ({
  root: {
    '--button-bg': 'red',
  },
})

// ❌ 不要用 --bg，会和其他组件冲突
vars: () => ({
  root: {
    '--bg': 'red',  // 危险！
  },
})
\`\`\`

### 原则 3：能复用 Mantine token 就复用

\`\`\`jsx
// ✅ 复用 Mantine 主题 token
vars: () => ({
  root: {
    '--button-bg': 'var(--mantine-color-violet-6)',
  },
})

// ❌ 硬编码颜色
vars: () => ({
  root: {
    '--button-bg': '#7c3aed',  // 不能跟随主题变化
  },
})
\`\`\`

---

## 21.7 在业务代码里读 CSS 变量

### 用 \`useMantineCssVariables\`

\`\`\`jsx
import { useMantineCssVariables } from '@mantine/core';

function MyComponent() {
  const cssVars = useMantineCssVariables();
  // cssVars['--mantine-color-violet-6'] = '121 80 196'

  return (
    <div>
      {Object.entries(cssVars).slice(0, 5).map(([key, value]) => (
        <div key={key}>
          {key}: {value}
        </div>
      ))}
    </div>
  );
}
\`\`\`

> ⚠️ 注意：\`useMantineCssVariables()\` **不触发重渲染**，仅返回当前 DOM 的 CSS 变量。

### 用 \`getComputedStyle\`

\`\`\`js
// 在浏览器控制台
const root = document.documentElement;
const styles = getComputedStyle(root);
const violet6 = styles.getPropertyValue('--mantine-color-violet-6');  // '121 80 196'
\`\`\`

---

## 21.8 实战：自定义 Card 组件

\`\`\`tsx
// components/Card.tsx
import { Card as MantineCard, CardProps, MantineVarsResolver, createTheme } from '@mantine/core';

const cardVarsResolver: MantineVarsResolver = (theme, params: CardProps & { variant?: 'default' | 'bordered' | 'shadowed' }) => {
  return {
    root: {
      '--card-bg': params.variant === 'bordered'
        ? 'var(--mantine-color-body)'
        : 'var(--mantine-color-body)',
      '--card-border': params.variant === 'bordered'
        ? '1px solid var(--mantine-color-default-border)'
        : 'none',
      '--card-shadow': params.variant === 'shadowed'
        ? 'var(--mantine-shadow-md)'
        : 'none',
    },
  };
};

const theme = createTheme({
  components: {
    Card: {
      vars: cardVarsResolver,
    },
  },
});

// 用法
<Card variant="default">默认</Card>
<Card variant="bordered">带边框</Card>
<Card variant="shadowed">带阴影</Card>
\`\`\`

---

## 21.9 vars 编译期的处理

Mantine 用 **postcss-preset-env** + **postcss-custom-properties** 处理 CSS 变量：

1. **postcss-preset-env**：把 var() 引用展开（如果浏览器不支持 var()）。
2. **postcss-custom-properties**：编译期把 \`--my-var: 16px;\` 提到 \`:root\`。

**但是**：Mantine v9 不展开 var()（保留运行时计算），因为：

- 现代浏览器都支持 var()。
- 展开 var() 会**失去响应式 / 主题切换能力**。
- 保留 var() 让暗色模式 / 主题切换**零 JS 重渲染**。

---

## 21.10 vars resolver 调试

\`\`\`tsx
// 在浏览器控制台
const button = document.querySelector('.mantine-Button-root');
const styles = getComputedStyle(button);

// 列出所有 CSS 变量
for (let i = 0; i < styles.length; i++) {
  const prop = styles[i];
  if (prop.startsWith('--')) {
    console.log(prop, '=', styles.getPropertyValue(prop));
  }
}
\`\`\`

---

## 21.11 小结

- \`vars resolver\` 是 Mantine 内部的核心机制，**计算一次 CSS 变量，浏览器原生级联**。
- \`variantColorResolver\` 处理 \`color + variant\` 的颜色映射。
- 优先用 \`vars\`，其次用 \`styles\`（vars 性能更好）。
- CSS 变量名用**前缀**避免冲突，复用 Mantine token 保持主题一致。
- \`useMantineCssVariables()\` 不触发重渲染，可以拿到当前 CSS 变量。

> ⭐ 记住：**「vars resolver = 编译期生成 CSS 变量，运行时零计算」**。

下一章我们做主题与暗色模式的 API 总结。
`,
  },

  // ============================================================
  // 第二十二章
  // ============================================================
  {
    id: "mantine3-ch22",
    group: "第三部分 Theme 主题系统",
    icon: "📚",
    title: "第二十二章 主题与暗色模式 API 总结",
    content: `## 22.1 主题相关 API 速查

### 主题创建

| API | 作用 | 例子 |
| --- | --- | --- |
| \`createTheme(overrides)\` | 创建主题 | \`createTheme({ primaryColor: 'violet' })\` |
| \`createTheme((theme) => overrides)\` | 函数式 API | \`createTheme((theme) => ({ ... }))\` |
| \`MantineThemeOverride\` | 类型 | 主题覆盖对象 |
| \`MantineTheme\` | 类型 | 完整主题对象 |

### 主题访问

| API | 作用 | 触发重渲染 |
| --- | --- | --- |
| \`useMantineTheme()\` | 拿 JS 主题对象 | ✅ |
| \`useMantineCssVariables()\` | 拿 CSS 变量 | ❌ |

### 主题 Provider

| API | 作用 |
| --- | --- |
| \`<MantineProvider>\` | 主题 / 暗色模式根 Provider |
| \`theme\` prop | 注入主题 |
| \`defaultColorScheme\` prop | 默认色板 |
| \`colorSchemeManager\` prop | 自定义色板管理器 |
| \`<ColorSchemeScript>\` | SSR 防闪烁 |
| \`mantineHtmlProps\` | 服务端 \`<html>\` 属性 |

---

## 22.2 暗色模式 API 速查

### 切换色板

| API | 作用 |
| --- | --- |
| \`useMantineColorScheme()\` | 拿 \`colorScheme\` 和 \`setColorScheme\` |
| \`setColorScheme('dark' \\| 'light' \\| 'auto')\` | 设置色板 |
| \`toggleColorScheme()\` | 切换 |
| \`clearColorScheme()\` | 清除（回到 auto） |

### 读取色板

| API | 返回值 | 触发重渲染 |
| --- | --- | --- |
| \`useColorScheme()\` | \`'light' \\| 'dark' \\| 'auto'\`（用户偏好） | ✅ |
| \`useComputedColorScheme()\` | \`'light' \\| 'dark'\`（实际生效） | ✅ |
| \`useMantineCssVariables()\` | 当前 CSS 变量 | ❌ |

### 组件级色板

\`\`\`jsx
<MyComponent colorScheme="dark" />
// 大多数 Mantine 组件接受 colorScheme prop，用于强制指定
\`\`\`

---

## 22.3 颜色 API 速查

### 预定义色板

\`\`\`jsx
// 24 个色板
<Button color="blue">蓝色</Button>
<Button color="red">红色</Button>
<Button color="violet">紫色</Button>
// 等等

// 带色阶
<Button color="violet.5">紫色 5 阶</Button>
<Button color="violet.9">紫色 9 阶</Button>
\`\`\`

### 自定义色板

\`\`\`jsx
// 在 createTheme 里
const theme = createTheme({
  colors: {
    brand: brandColors,  // MantineColorsTuple（10 阶）
  },
  primaryColor: 'brand',
});

// 在组件里
<Button color="brand">品牌色</Button>
<Button color="brand.5">品牌色 5 阶</Button>
\`\`\`

### 暗色专用色板

\`\`\`jsx
// dark-* 色板（10 阶）
style={{ background: 'var(--mantine-color-dark-7)' }}

// 内部色板
style={{ background: 'var(--mantine-color-body)' }}  // 自动适配
style={{ color: 'var(--mantine-color-text)' }}        // 自动适配
style={{ border: '1px solid var(--mantine-color-default-border)' }}
\`\`\`

---

## 22.4 主题覆盖 API 速查

### 组件级覆盖

| 子配置 | 作用 | 例子 |
| --- | --- | --- |
| \`defaultProps\` | 全局默认 props | \`{ radius: 'xl' }\` |
| \`classNames\` | 全局 className | \`{ root: 'my-btn' }\` |
| \`styles\` | 全局样式对象 | \`(theme, params) => ({ root: { ... } })\` |
| \`vars\` | 全局 CSS 变量 | \`(theme, params) => ({ root: { '--btn-bg': '...' } })\` |

### 主题级覆盖

| 字段 | 作用 |
| --- | --- |
| \`primaryColor\` | 全局主色 |
| \`primaryShade\` | 亮色 / 暗色色阶 |
| \`defaultRadius\` | 全局圆角 |
| \`colors\` | 自定义色板 |
| \`radius\` / \`spacing\` / \`shadows\` / \`breakpoints\` | 设计 token |
| \`fontFamily\` / \`fontFamilyMonospace\` | 字体 |
| \`headings\` | 标题样式 |
| \`components\` | 组件级覆盖 |
| \`other\` | 自定义 token |
| \`cursorType\` / \`focusRing\` / \`respectReducedMotion\` | 全局行为 |

---

## 22.5 Hook API 速查

### 主题相关

\`\`\`jsx
import { useMantineTheme, useMantineCssVariables, useMantineColorScheme } from '@mantine/core';

const theme = useMantineTheme();                    // JS 主题对象
const cssVars = useMantineCssVariables();           // CSS 变量
const { colorScheme, setColorScheme, toggleColorScheme, clearColorScheme } = useMantineColorScheme();

const colorScheme = useColorScheme();               // 用户偏好
const computedColorScheme = useComputedColorScheme(); // 实际生效
\`\`\`

### 暗色相关

\`\`\`jsx
import { useComputedColorScheme, useColorScheme } from '@mantine/core';

const userPreference = useColorScheme();           // 'light' / 'dark' / 'auto'
const actual = useComputedColorScheme();            // 'light' / 'dark'
\`\`\`

---

## 22.6 Provider 速查

### 必须的 Provider

\`\`\`jsx
<MantineProvider theme={theme} defaultColorScheme="auto">
  ...
</MantineProvider>
\`\`\`

### 可选 Provider

\`\`\`jsx
import { DatesProvider } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { Spotlight } from '@mantine/spotlight';

<MantineProvider>
  <DatesProvider settings={{ locale: 'zh-cn' }}>
    <ModalsProvider>
      <Notifications />
      <Spotlight actions={actions} />
      <App />
    </ModalsProvider>
  </DatesProvider>
</MantineProvider>
\`\`\`

---

## 22.7 调试 API 速查

### 主题调试

\`\`\`jsx
import { useMantineTheme } from '@mantine/core';

const theme = useMantineTheme();
console.log({
  primaryColor: theme.primaryColor,
  colors: Object.keys(theme.colors),
  spacing: theme.spacing,
});
\`\`\`

### CSS 变量调试

\`\`\`jsx
import { useMantineCssVariables } from '@mantine/core';

const cssVars = useMantineCssVariables();
console.log(cssVars);
\`\`\`

### DevTools 集成

\`\`\`bash
npm install --save-dev @mantine/devtools
\`\`\`

\`\`\`jsx
import { MantineDevtools } from '@mantine/devtools';

<MantineProvider>
  <App />
  <MantineDevtools />
</MantineProvider>
\`\`\`

---

## 22.8 类型 API 速查

### 主题类型

\`\`\`ts
import type {
  MantineTheme,
  MantineThemeOverride,
  MantineColorsTuple,
  MantineColor,
  MantineSize,
  MantineRadius,
  MantineSpacing,
  MantineShadow,
  MantineBreakpoint,
  MantineVariant,
  MantineVarsResolver,
  ComponentThemeOverride,
} from '@mantine/core';
\`\`\`

### 表单类型

\`\`\`ts
import type { UseFormInput, UseFormReturnType } from '@mantine/form';
\`\`\`

---

## 22.9 实战：完整的项目主题文件

\`\`\`ts
// theme/index.ts
import { createTheme, MantineColorsTuple, MantineThemeOverride } from '@mantine/core';

// 1. 品牌色
const brand: MantineColorsTuple = [
  '#f3f0ff', '#e5d4ff', '#d0b0ff', '#b88aff', '#9d63ff',
  '#7c3aed', '#5b21b6', '#491a94', '#3b1372', '#1e0a3d',
];

// 2. 中性色
const neutral: MantineColorsTuple = [
  '#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#ced4da',
  '#adb5bd', '#868e96', '#495057', '#343a40', '#212529',
];

// 3. 业务色
const success: MantineColorsTuple = [
  '#ebfbee', '#d3f9d8', '#b2f2bb', '#8ce99a', '#69db7c',
  '#51cf66', '#40c057', '#37b24d', '#2f9e44', '#2b8a3e',
];

// 4. 警告色
const warning: MantineColorsTuple = [
  '#fff9db', '#fff3bf', '#ffec99', '#ffe066', '#ffd43b',
  '#fcc419', '#fab005', '#f59f00', '#f08c00', '#e67700',
];

// 5. 错误色
const danger: MantineColorsTuple = [
  '#fff5f5', '#ffe3e3', '#ffc9c9', '#ffa8a8', '#ff8787',
  '#ff6b6b', '#fa5252', '#f03e3e', '#e03131', '#c92a2a',
];

// 6. 主题覆盖
const themeOverride: MantineThemeOverride = {
  colors: { brand, neutral, success, warning, danger },
  primaryColor: 'brand',
  primaryShade: { light: 6, dark: 4 },
  white: '#ffffff',
  black: '#000000',
  defaultRadius: 'md',
  cursorType: 'pointer',
  focusRing: 'auto',
  respectReducedMotion: true,
  components: {
    Button: {
      defaultProps: { radius: 'md', size: 'sm' },
      styles: { root: { fontWeight: 600 } },
    },
    Card: {
      defaultProps: { radius: 'lg', withBorder: true },
    },
  },
  other: {
    headerHeight: 60,
    sidebarWidth: 240,
  },
};

export const theme = createTheme(themeOverride);
export { brand, neutral, success, warning, danger };
\`\`\`

---

## 22.10 小结

本章是 **Theme + 暗色模式 API 的速查表**：

- **创建**：createTheme（对象 / 函数）
- **Provider**：MantineProvider、ColorSchemeScript、mantineHtmlProps
- **访问**：useMantineTheme / useMantineCssVariables / useMantineColorScheme
- **暗色**：useColorScheme / useComputedColorScheme / setColorScheme / toggleColorScheme
- **组件覆盖**：defaultProps / classNames / styles / vars
- **类型**：MantineTheme / MantineThemeOverride / MantineColorsTuple / MantineVarsResolver

> ⭐ 记住：**「createTheme 入口、Provider 注入、Hook 访问、styles/vars 覆盖、ColorSchemeScript 防闪烁」**——这是 Mantine 主题系统的完整心智模型。

下一章我们看主题调试与 DevTools。
`,
  },

  // ============================================================
  // 第二十三章
  // ============================================================
  {
    id: "mantine3-ch23",
    group: "第三部分 Theme 主题系统",
    icon: "🛠️",
    title: "第二十三章 主题调试与 DevTools",
    content: `## 23.1 调试工具一览

调试 Mantine 主题有 4 种方式：

1. **浏览器 DevTools**：检查 CSS 变量
2. **\`@mantine/devtools\`**：官方浮动调试面板
3. **自定义调试组件**：在页面里可视化主题
4. **Storybook**：组件库文档（可选）

---

## 23.2 浏览器 DevTools

### 查看所有 CSS 变量

\`\`\`js
// 在控制台
const root = document.documentElement;
const styles = getComputedStyle(root);

// 列出所有 Mantine 变量
const mantineVars = [];
for (let i = 0; i < styles.length; i++) {
  const prop = styles[i];
  if (prop.startsWith('--mantine-')) {
    mantineVars.push(\`\${prop}: \${styles.getPropertyValue(prop)}\`);
  }
}
console.log(mantineVars.slice(0, 30).join('\\n'));
\`\`\`

### 临时修改变量

\`\`\`js
// 在控制台
document.documentElement.style.setProperty('--mantine-color-violet-6', '255 0 0');
// 立即看到效果：所有 violet 元素变红
\`\`\`

### 查看暗色模式

\`\`\`js
// 当前色板
document.documentElement.getAttribute('data-mantine-color-scheme');  // 'light' / 'dark'

// 切换暗色
document.documentElement.setAttribute('data-mantine-color-scheme', 'dark');
\`\`\`

### 查看特定组件的 CSS 变量

\`\`\`js
// 找到 Button 元素
const btn = document.querySelector('.mantine-Button-root');
const styles = getComputedStyle(btn);

// Button 内部 CSS 变量
console.log(styles.getPropertyValue('--button-bg'));
console.log(styles.getPropertyValue('--button-color'));
\`\`\`

---

## 23.3 @mantine/devtools

### 安装

\`\`\`bash
npm install --save-dev @mantine/devtools
\`\`\`

### 使用

\`\`\`tsx
// app.tsx
import { MantineDevtools } from '@mantine/devtools';

<MantineProvider theme={theme}>
  <App />
  <MantineDevtools />
</MantineProvider>
\`\`\`

### 功能

- 浮动按钮（右下角），点击打开调试面板。
- 查看当前主题 token。
- 切换暗色模式。
- 检查组件状态。
- 性能 Profiling（React DevTools 集成）。
- 跳转到 Mantine 文档。

### 自定义

\`\`\`tsx
<MantineDevtools
  position="bottom-right"  // 'top-left' / 'top-right' / 'bottom-left' / 'bottom-right'
  hidden // 隐藏（生产环境）
/>
\`\`\`

---

## 23.4 自定义调试组件

### 主题概览

\`\`\`tsx
'use client';

import { useMantineTheme } from '@mantine/core';

export function ThemeOverview() {
  const theme = useMantineTheme();

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
      <details style={{ background: 'var(--mantine-color-body)', padding: 16, borderRadius: 8, border: '1px solid var(--mantine-color-default-border)', maxWidth: 400 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>主题调试</summary>
        <pre style={{ fontSize: 12, maxHeight: 500, overflow: 'auto', marginTop: 8 }}>
{JSON.stringify({
  primaryColor: theme.primaryColor,
  primaryShade: theme.primaryShade,
  defaultRadius: theme.defaultRadius,
  colors: Object.keys(theme.colors),
  spacing: theme.spacing,
  radius: theme.radius,
  fontFamily: theme.fontFamily,
  breakpoints: theme.breakpoints,
  components: Object.keys(theme.components),
}, null, 2)}
        </pre>
      </details>
    </div>
  );
}
\`\`\`

### 颜色色板可视化

\`\`\`tsx
'use client';

import { useMantineTheme } from '@mantine/core';

export function ColorPalette() {
  const theme = useMantineTheme();

  return (
    <div style={{ padding: 16 }}>
      {Object.entries(theme.colors).map(([name, shades]) => (
        <div key={name} style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 14, marginBottom: 8 }}>{name}</h4>
          <div style={{ display: 'flex', gap: 4 }}>
            {shades.map((shade, i) => (
              <div
                key={i}
                style={{
                  width: 40,
                  height: 40,
                  background: \`hsl(\${shade})\`,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  color: i > 5 ? 'white' : 'black',
                }}
                title={\`\${name}.\${i}: \${shade}\`}
              >
                {i}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
\`\`\`

### CSS 变量实时查看

\`\`\`tsx
'use client';

import { useMantineCssVariables } from '@mantine/core';

export function CssVarsDebug() {
  const cssVars = useMantineCssVariables();

  const groups = Object.keys(cssVars).reduce((acc, key) => {
    const group = key.split('-')[2] || 'other';  // --mantine-color-xxx → 'color'
    if (!acc[group]) acc[group] = [];
    acc[group].push({ key, value: cssVars[key] });
    return acc;
  }, {} as Record<string, Array<{ key: string; value: string }>>);

  return (
    <div style={{ maxHeight: 600, overflow: 'auto' }}>
      {Object.entries(groups).map(([group, vars]) => (
        <div key={group} style={{ marginBottom: 16 }}>
          <h4>{group}</h4>
          <table style={{ fontSize: 12, width: '100%' }}>
            <tbody>
              {vars.map(({ key, value }) => (
                <tr key={key}>
                  <td style={{ padding: 4, color: 'var(--mantine-color-dimmed)' }}>{key}</td>
                  <td style={{ padding: 4, fontFamily: 'monospace' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
\`\`\`

---

## 23.5 在 React DevTools 中调试

### 找到 MantineProvider

\`\`\`
React DevTools → Components → MantineProvider
\`\`\`

查看 props：
- \`theme\`：完整主题对象
- \`defaultColorScheme\`：默认色板

### 检查 Context 值

\`\`\`
React DevTools → Components → MantineProvider → Hooks → MantineContext
\`\`\`

---

## 23.6 性能调试

### 切换暗色模式的重渲染检查

\`\`\`tsx
// 在组件里加 console.log
function MyComponent() {
  console.log('MyComponent rendered');
  return <div>...</div>;
}

// 点击暗色切换
// ❌ 看到 MyComponent rendered → 有重渲染
// ✅ 看不到 → 零重渲染（CSS 变量生效）
\`\`\`

### 用 React DevTools Profiler

1. 打开 React DevTools → Profiler 标签。
2. 点击录制。
3. 切换暗色模式。
4. 停止录制。
5. 查看哪些组件**没有**被标黄（黄色 = 重渲染）。

---

## 23.7 常见调试场景

### 场景 1：暗色模式不生效

**排查步骤**：

1. 检查 \`<ColorSchemeScript>\` 是否在 \`<head>\` 里。
2. 检查 \`<MantineProvider>\` 的 \`defaultColorScheme\`。
3. 检查 \`data-mantine-color-scheme\` 属性是否变化（DevTools）。
4. 检查 \`[data-mantine-color-scheme="dark"]\` 选择器的 CSS 变量。

\`\`\`js
// 强制切到暗色（如果还是亮色，说明 CSS 变量没生效）
document.documentElement.setAttribute('data-mantine-color-scheme', 'dark');
\`\`\`

### 场景 2：自定义色板不生效

**排查步骤**：

1. 检查 \`colors\` 数组是否是 10 阶。
2. 检查 \`primaryColor\` 名称是否匹配 \`colors\` 的 key。
3. 检查 MantineProvider 的 theme prop 是否传对。

\`\`\`js
// 在控制台查看主题
const theme = JSON.parse(localStorage.getItem('mantine-theme') || '{}');
console.log(theme);
\`\`\`

### 场景 3：主题切换闪烁

**排查步骤**：

1. 检查 \`<ColorSchemeScript>\` 是否在所有页面（layout.tsx）。
2. 检查 \`mantineHtmlProps\` 是否应用到 \`<html>\` 标签。
3. 检查 \`suppressHydrationWarning\` 是否设置（mantineHtmlProps 已经包含）。

### 场景 4：组件样式不生效

**排查步骤**：

1. 检查 \`styles\` 字段名（如 \`root\`、\`label\`）。
2. 检查 CSS 优先级（组件实例 > 主题级）。
3. 检查 \`!important\` 是否被其他样式覆盖。

---

## 23.8 Mantine Studio

Mantine 团队开发了一个**可视化主题编辑器**：https://studio.mantine.dev/

功能：
- 可视化编辑主题 token。
- 实时预览。
- 导出 createTheme 代码。
- 支持多色板管理。

---

## 23.9 小结

- 浏览器 DevTools：**最快**的调试方式，能直接看 CSS 变量。
- \`@mantine/devtools\`：**官方推荐**，浮动面板 + 主题可视化。
- 自定义组件：业务项目里写一个 debug 组件，长期可用。
- 性能调试：用 React DevTools Profiler 检查暗色模式切换的**零重渲染**。

> ⭐ 记住：**「DevTools + @mantine/devtools + React Profiler = 三件套」**。

下一章我们完整过一遍自定义品牌色流程。
`,
  },

  // ============================================================
  // 第二十四章
  // ============================================================
  {
    id: "mantine3-ch24",
    group: "第三部分 Theme 主题系统",
    icon: "🎨",
    title: "第二十四章 自定义品牌色完整流程",
    content: `## 24.1 完整流程概览

自定义品牌色需要 5 步：

1. **确定品牌基础色**（设计师给一个 hex）。
2. **生成 10 阶色板**（Mantine Color Generator）。
3. **调整色板**（手动微调特定阶）。
4. **应用到主题**（\`createTheme\`）。
5. **测试对比度**（WCAG AA）。

---

## 24.2 第 1 步：确定品牌基础色

假设设计师给了 \`#5C33FF\`（紫色）。

---

## 24.3 第 2 步：生成 10 阶色板

访问 https://mantine.dev/colors-generator/

1. 输入 \`#5C33FF\`。
2. 选择饱和度（saturation）和亮度（lightness）调整。
3. 复制 10 阶 hex 数组。

\`\`\`jsx
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
\`\`\`

---

## 24.4 第 3 步：调整色板

### 常见调整场景

**场景 1：第 5 阶（主色）太暗**

\`\`\`jsx
const brand: MantineColorsTuple = [
  '#f3f0ff',
  '#e5d4ff',
  '#d0b0ff',
  '#b88aff',
  '#9d63ff',
  '#7c3aed',
  // 如果觉得 6 阶太暗，可以把 5 阶提亮一些
  '#5b21b6',  // 6
  '#491a94',
  '#3b1372',
  '#1e0a3d',
];
\`\`\`

**场景 2：第 0 阶（背景色）太深**

\`\`\`jsx
// 把 0 阶调更浅
const brand: MantineColorsTuple = [
  '#faf5ff',  // 0 - 更浅
  '#e5d4ff',
  // ...
];
\`\`\`

**场景 3：暗色模式需要不同色阶**

\`\`\`jsx
// 在 primaryShade 里指定
const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: {
    light: 6,  // 亮色模式用 6 阶
    dark: 4,   // 暗色模式用 4 阶（更亮，在深色背景上更明显）
  },
});
\`\`\`

---

## 24.5 第 4 步：应用到主题

\`\`\`jsx
// theme.ts
import { createTheme, MantineColorsTuple } from '@mantine/core';

const brand: MantineColorsTuple = [
  '#f3f0ff', '#e5d4ff', '#d0b0ff', '#b88aff', '#9d63ff',
  '#7c3aed', '#5b21b6', '#491a94', '#3b1372', '#1e0a3d',
];

export const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: { light: 6, dark: 4 },
  colors: { brand },
  // 其他配置
  defaultRadius: 'md',
  fontFamily: 'Inter, sans-serif',
});
\`\`\`

---

## 24.6 第 5 步：测试对比度

### 自动检查工具

\`\`\`bash
npm install --save-dev @axe-core/react
\`\`\`

\`\`\`tsx
if (process.env.NODE_ENV !== 'production') {
  import('@axe-core/react').then(({ default: axe }) => {
    axe(React, ReactDOM, 1000);
  });
}
\`\`\`

### 手动检查关键组合

| 背景 | 文字 | 检查 |
| --- | --- | --- |
| \`brand[6]\` (filled 按钮背景) | \`white\` | 4.5:1+ ✅ |
| \`brand[0]\` (light 背景) | \`brand[6]\` | 4.5:1+ ✅ |
| \`white\` (默认背景) | \`brand[6]\` | 4.5:1+ ✅ |
| \`brand[6]\` (filled 背景) | \`brand[0]\` | ❌ 不行 |

### 暗色模式检查

| 背景 | 文字 | 检查 |
| --- | --- | --- |
| \`dark[7]\` (深色背景) | \`brand[4]\` (浅紫) | 4.5:1+ ✅ |
| \`dark[8]\` (更深的背景) | \`brand[3]\` (更浅紫) | 4.5:1+ ✅ |
| \`brand[4]\` (按钮背景) | \`white\` | 4.5:1+ ✅ |

### 在线工具

- https://webaim.org/resources/contrastchecker/
- Chrome DevTools → Inspect → Accessibility 标签

---

## 24.7 实战：完整品牌色方案

\`\`\`ts
// theme/colors.ts
import { MantineColorsTuple } from '@mantine/core';

// 主品牌色：紫色
export const brand: MantineColorsTuple = [
  '#f3f0ff',  // 0
  '#e5d4ff',  // 1
  '#d0b0ff',  // 2
  '#b88aff',  // 3
  '#9d63ff',  // 4
  '#7c3aed',  // 5
  '#5b21b6',  // 6 (主色)
  '#491a94',  // 7
  '#3b1372',  // 8
  '#1e0a3d',  // 9
];

// 业务色：成功
export const success: MantineColorsTuple = [
  '#ebfbee', '#d3f9d8', '#b2f2bb', '#8ce99a', '#69db7c',
  '#51cf66', '#40c057', '#37b24d', '#2f9e44', '#2b8a3e',
];

// 业务色：警告
export const warning: MantineColorsTuple = [
  '#fff9db', '#fff3bf', '#ffec99', '#ffe066', '#ffd43b',
  '#fcc419', '#fab005', '#f59f00', '#f08c00', '#e67700',
];

// 业务色：错误
export const danger: MantineColorsTuple = [
  '#fff5f5', '#ffe3e3', '#ffc9c9', '#ffa8a8', '#ff8787',
  '#ff6b6b', '#fa5252', '#f03e3e', '#e03131', '#c92a2a',
];

// 业务色：信息（用 brand）
// 通常用 brand 色，不需要单独定义

// 中性色：灰
export const neutral: MantineColorsTuple = [
  '#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#ced4da',
  '#adb5bd', '#868e96', '#495057', '#343a40', '#212529',
];
\`\`\`

\`\`\`ts
// theme/index.ts
import { createTheme } from '@mantine/core';
import { brand, success, warning, danger, neutral } from './colors';

export const theme = createTheme({
  colors: { brand, success, warning, danger, neutral },
  primaryColor: 'brand',
  primaryShade: { light: 6, dark: 4 },
  defaultRadius: 'md',
  fontFamily: 'Inter, -apple-system, sans-serif',
  components: {
    Alert: {
      // 不同 severity 用不同业务色
      styles: (theme, params: { color?: string }) => ({
        root: {
          borderWidth: 1,
        },
      }),
    },
  },
});
\`\`\`

---

## 24.8 实战：用品牌色的常见组件

\`\`\`jsx
// 按钮
<Button color="brand">主按钮</Button>
<Button color="brand" variant="light">次按钮</Button>
<Button color="brand" variant="outline">轮廓按钮</Button>
<Button color="brand" variant="subtle">淡按钮</Button>

// Badge
<Badge color="brand">Brand</Badge>
<Badge color="success">成功</Badge>
<Badge color="warning">警告</Badge>
<Badge color="danger">错误</Badge>

// Alert
<Alert color="success" title="成功">操作完成</Alert>
<Alert color="warning" title="警告">请注意</Alert>
<Alert color="danger" title="错误">操作失败</Alert>

// 链接
<Anchor color="brand">品牌色链接</Anchor>
\`\`\`

---

## 24.9 跨色板联动

有时候一个 UI 元素需要**多个色板**：

\`\`\`jsx
// 成功状态：绿色图标 + 品牌色按钮
<Alert
  color="success"  // 整体用 success
  icon={<IconCheck />}
  title="上传成功"
>
  <Button color="brand" component="a" href="/uploads">查看文件</Button>
</Alert>

// 错误状态：红色背景 + 白色文字
<Alert color="danger" title="错误">
  <Button color="white" variant="white">重试</Button>
</Alert>
\`\`\`

---

## 24.10 多主题支持

如果你的项目需要**多套主题**（如不同品牌），可以用 \`useState\` + \`createTheme\`：

\`\`\`tsx
'use client';

import { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { theme as defaultTheme, brandATheme, brandBTheme } from './themes';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState('default');

  const theme = {
    default: defaultTheme,
    brandA: brandATheme,
    brandB: brandBTheme,
  }[currentTheme];

  return (
    <MantineProvider theme={theme}>
      <button onClick={() => setCurrentTheme('brandA')}>切到品牌 A</button>
      <button onClick={() => setCurrentTheme('brandB')}>切到品牌 B</button>
      <button onClick={() => setCurrentTheme('default')}>默认</button>
      <YourApp />
    </MantineProvider>
  );
}
\`\`\`

---

## 24.11 主题持久化

如果用户选择了品牌色，**记住他的选择**：

\`\`\`tsx
'use client';

import { useState, useEffect } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { brandATheme, brandBTheme, defaultTheme } from './themes';

const themes = { default: defaultTheme, brandA: brandATheme, brandB: brandBTheme };

export default function App() {
  const [currentTheme, setCurrentTheme] = useState('default');

  // 读取 localStorage
  useEffect(() => {
    const saved = localStorage.getItem('app-theme');
    if (saved && themes[saved as keyof typeof themes]) {
      setCurrentTheme(saved);
    }
  }, []);

  // 写 localStorage
  const handleChangeTheme = (name: string) => {
    setCurrentTheme(name);
    localStorage.setItem('app-theme', name);
  };

  return (
    <MantineProvider theme={themes[currentTheme]}>
      <button onClick={() => handleChangeTheme('brandA')}>品牌 A</button>
      <button onClick={() => handleChangeTheme('brandB')}>品牌 B</button>
      <YourApp />
    </MantineProvider>
  );
}
\`\`\`

---

## 24.12 常见错误

### 错误 1：色板阶数不对

\`\`\`ts
// ❌ 9 阶
const brand = ['#fff', '#f0f', '#e0e', '#d0d', '#c0c', '#b0b', '#a0a', '#909', '#808'];

// ✅ 10 阶（TypeScript 强制）
const brand: MantineColorsTuple = ['#fff', '#f0f', '#e0e', '#d0d', '#c0c', '#b0b', '#a0a', '#909', '#808', '#707'];
\`\`\`

### 错误 2：主色引用错

\`\`\`jsx
// ❌ primaryColor 写错
const theme = createTheme({
  primaryColor: 'violet',  // 但 colors 里只有 'brand'
  colors: { brand: [...] },
});

// ✅ 修正
const theme = createTheme({
  primaryColor: 'brand',  // 对应 colors.brand
  colors: { brand: [...] },
});
\`\`\`

### 错误 3：暗色模式看不清

\`\`\`jsx
// ❌ 暗色模式 primaryShade=6（深），看不清
primaryShade: { light: 6, dark: 6 }

// ✅ 暗色模式 primaryShade=4（浅）
primaryShade: { light: 6, dark: 4 }
\`\`\`

---

## 24.13 小结

完整流程：

1. **确定品牌基础色**（设计师 hex）
2. **生成 10 阶**（Mantine Color Generator）
3. **调整色板**（微调特定阶）
4. **应用到主题**（\`createTheme\`）
5. **测试对比度**（WCAG AA）

**进阶**：

- 暗色模式用 \`primaryShade: { light: 6, dark: 4 }\` 优化。
- 多品牌主题用 \`useState\` + \`createTheme\` 切换。
- 主题持久化用 \`localStorage\`。

> ⭐ 记住：**「基础色 → 10 阶 → primaryShade → 对比度测试」是品牌色四步法**。

下一章我们看主题系统性能优化。
`,
  },

  // ============================================================
  // 第二十五章
  // ============================================================
  {
    id: "mantine3-ch25",
    group: "第三部分 Theme 主题系统",
    icon: "⚡",
    title: "第二十五章 主题系统性能优化",
    content: `## 25.1 性能瓶颈在哪

主题系统的性能瓶颈主要在 **3 个地方**：

1. **Context 传递**：主题变化触发整个 Provider 子树重渲染。
2. **CSS 变量生成**：编译期生成，但有些动态场景会运行时计算。
3. **emotion 样式合并**：每个组件 styles prop 都会走 emotion。

---

## 25.2 优化 1：避免主题频繁变化

### 问题

\`\`\`jsx
function App() {
  const [count, setCount] = useState(0);

  // ❌ 每次 render 都创建新 theme
  const theme = createTheme({ primaryColor: 'violet' });

  return (
    <MantineProvider theme={theme}>
      <button onClick={() => setCount(count + 1)}>点击 {count}</button>
    </MantineProvider>
  );
}
\`\`\`

**问题**：每次 \`setCount\` 都会创建新 theme 对象，导致 MantineProvider 子树重渲染。

### 解法：用 \`useMemo\`

\`\`\`jsx
function App() {
  const [count, setCount] = useState(0);

  // ✅ theme 只创建一次
  const theme = useMemo(() => createTheme({ primaryColor: 'violet' }), []);

  return (
    <MantineProvider theme={theme}>
      <button onClick={() => setCount(count + 1)}>点击 {count}</button>
    </MantineProvider>
  );
}
\`\`\`

---

## 25.3 优化 2：用 var() 代替 useMantineTheme

### 问题

\`\`\`jsx
function MyComponent() {
  // ❌ useMantineTheme 触发重渲染
  const theme = useMantineTheme();
  return <div style={{ background: theme.colors.blue[5] }}>...</div>;
}
\`\`\`

**问题**：主题变化时（暗色模式），组件重渲染。

### 解法：用 CSS 变量

\`\`\`jsx
function MyComponent() {
  // ✅ 直接用 var()，不订阅 theme
  return <div style={{ background: 'var(--mantine-color-blue-5)' }}>...</div>;
}
\`\`\`

**原理**：\`<html data-mantine-color-scheme="dark">\` 改变时，浏览器原生级联，**React 不参与**。

---

## 25.4 优化 3：useColorScheme 替代 useMantineColorScheme

### 问题

\`\`\`jsx
function Toggle() {
  // ❌ 订阅了 theme，整个组件订阅重渲染
  const { toggleColorScheme } = useMantineColorScheme();
  return <Button onClick={toggleColorScheme}>切换</Button>;
}
\`\`\`

**问题**：组件订阅了整个 MantineContext，主题变化时（即使是部分 token 变化）也重渲染。

### 解法：用 \`onClick\` 而不订阅

\`\`\`jsx
import { setColorScheme } from '@mantine/core';

function Toggle() {
  // ✅ 不订阅 theme，零重渲染
  return (
    <Button onClick={() => setColorScheme('dark')}>
      切换
    </Button>
  );
}
\`\`\`

> ⚠️ \`setColorScheme\` 是 Mantine 内部函数，**通过 window 全局调用**，不依赖 Context。

---

## 25.5 优化 4：避免 styles prop 内联对象

### 问题

\`\`\`jsx
function MyComponent({ color, size }) {
  // ❌ 每次 render 都生成新对象
  return (
    <Button styles={{ root: { background: color, padding: size } }}>
      按钮
    </Button>
  );
}
\`\`\`

**问题**：emotion 每次都要合并新对象。

### 解法 1：提取到组件外

\`\`\`jsx
// ✅ 静态部分提取
const buttonStyles = { root: { fontWeight: 700 } };

function MyComponent({ color, size }) {
  return (
    <Button
      styles={{
        ...buttonStyles,
        root: { ...buttonStyles.root, background: color },
      }}
    >
      按钮
    </Button>
  );
}
\`\`\`

### 解法 2：用 vars 代替 styles

\`\`\`jsx
function MyComponent({ color, size }) {
  // ✅ vars 是 CSS 变量级，性能更好
  return (
    <Button
      vars={(theme) => ({
        root: {
          '--button-bg': color,
          '--button-padding': size,
        },
      })}
    >
      按钮
    </Button>
  );
}
\`\`\`

---

## 25.6 优化 5：拆分 Provider 树

### 问题

\`\`\`jsx
function App() {
  return (
    <MantineProvider theme={theme}>
      <AppShell>
        <Header />
        <Main>
          <HeavyChart />  {/* 复杂的图表组件 */}
        </Main>
      </AppShell>
    </MantineProvider>
  );
}
\`\`\`

**问题**：\`<Header>\` 不需要重渲染，但主题变化时会重渲染。

### 解法：把不变部分提取到外层

\`\`\`jsx
function App() {
  return (
    // 外层 Provider 不变
    <MantineProvider theme={theme}>
      <AppShell>
        <Header />
        <Main>
          {/* HeavyChart 单独 Provider，自带局部主题 */}
          <MantineProvider theme={chartTheme}>
            <HeavyChart />
          </MantineProvider>
        </Main>
      </AppShell>
    </MantineProvider>
  );
}
\`\`\`

---

## 25.7 优化 6：用 vars resolver 替代运行时计算

### 问题

\`\`\`jsx
const theme = createTheme({
  components: {
    Button: {
      // ❌ 每次 render 都计算
      styles: (theme, params) => ({
        root: {
          background: \`var(--mantine-color-\${params.color}-6)\`,
        },
      }),
    },
  },
});
\`\`\`

**问题**：每次组件 props 变化都要重新计算。

### 解法：vars resolver

\`\`\`jsx
const theme = createTheme({
  components: {
    Button: {
      // ✅ 计算一次，浏览器原生级联
      vars: (theme, params) => ({
        root: {
          '--button-bg': \`var(--mantine-color-\${params.color}-6)\`,
        },
      }),
    },
  },
});
\`\`\`

**性能差异**：1000 个 Button 切换主题，**styles ~50ms vs vars < 5ms**。

---

## 25.8 优化 7：用 defaultProps 替代运行时检查

### 问题

\`\`\`jsx
function MyButton({ color, ...props }) {
  // ❌ 每次 render 都检查
  const finalColor = color || (props.primary ? 'violet' : 'gray');
  return <Button color={finalColor} {...props} />;
}
\`\`\`

**问题**：每次 render 都要计算 defaultColor。

### 解法：主题级 defaultProps

\`\`\`jsx
const theme = createTheme({
  components: {
    Button: {
      defaultProps: { color: 'gray' },
    },
  },
});

function PrimaryButton(props) {
  // ✅ 主题默认 color='gray'，primary 时手动传 'violet'
  return <Button {...props} />;
}

// 用法
<PrimaryButton>普通</PrimaryButton>  // 默认 gray
<PrimaryButton color="violet">主要</PrimaryButton>  // 紫色
\`\`\`

---

## 25.9 优化 8：减少 useContext 订阅

### 问题

\`\`\`jsx
function HeavyComponent() {
  // ❌ 订阅整个 theme
  const theme = useMantineTheme();
  return <div>{theme.colors.violet[5]}</div>;
}
\`\`\`

**问题**：主题任何字段变化都重渲染。

### 解法：用 \`useMemo\` 缓存

\`\`\`jsx
function HeavyComponent() {
  const theme = useMantineTheme();
  // ✅ 缓存计算结果
  const violet5 = useMemo(() => theme.colors.violet[5], [theme]);
  return <div>{violet5}</div>;
}
\`\`\`

### 解法：用 var()

\`\`\`jsx
function HeavyComponent() {
  // ✅ 不订阅
  return <div style={{ color: 'var(--mantine-color-violet-5)' }}>...</div>;
}
\`\`\`

---

## 25.10 优化 9：CSS 变量编译期生成

确保你的项目配置了 **PostCSS** 处理 CSS 变量：

\`\`\`js
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-preset-env': {
      features: {
        'custom-properties': false,  // ❌ 不要展开 var()
      },
    },
  },
};
\`\`\`

**关键**：不要让 postcss 展开 \`var(--mantine-color-violet-5)\`，因为：

- 展开后 = 静态值，**失去主题切换能力**。
- 保留 var() = 浏览器原生级联，**主题切换零 JS 开销**。

---

## 25.11 性能对比表

| 场景 | 默认实现 | 优化后 | 提升 |
| --- | --- | --- | --- |
| 暗色模式切换（1000 组件） | ~50ms | **< 5ms** | 10x |
| 主题切换（1000 组件） | ~200ms | ~150ms | 1.3x |
| 组件重渲染（颜色变化） | 100% | **0%** | ∞ |
| 包大小 | 70KB | 70KB | - |
| 主题更新 Context 订阅 | 100% 组件 | 0% 组件 | ∞ |

---

## 25.12 实战：性能审计脚本

\`\`\`ts
// performance-audit.ts
import { useMantineTheme } from '@mantine/core';

function auditThemeUsage() {
  const issues: string[] = [];

  // 1. 检查是否所有 useMantineTheme 都用了 useMemo
  // （需要 React DevTools 集成，这里只是示意）

  // 2. 检查是否所有 styles 都是内联对象
  // （需要 ESLint 规则，这里只是示意）

  // 3. 检查是否所有颜色都用了 var()
  // （需要自定义 ESLint 规则）

  return issues;
}
\`\`\`

### 自定义 ESLint 规则

\`\`\`js
// .eslintrc.js
module.exports = {
  rules: {
    'no-restricted-syntax': [
      'warn',
      {
        selector: "JSXAttribute[name.name='styles'] ObjectExpression",
        message: '避免内联 styles 对象，请提取到组件外或用 vars 替代',
      },
    ],
  },
};
\`\`\`

---

## 25.13 实战：完整的性能优化配置

\`\`\`ts
// theme.ts（性能优化版）
import { createTheme, MantineVarsResolver } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'violet',
  primaryShade: { light: 6, dark: 4 },
  components: {
    Button: {
      // ✅ 用 vars 而不是 styles
      vars: buttonVarsResolver,
      // ✅ 静态 defaultProps
      defaultProps: { radius: 'md' },
    },
  },
});

const buttonVarsResolver: MantineVarsResolver = (theme, params) => ({
  root: {
    '--button-bg': \`var(--mantine-color-\${params.color}-6)\`,
    '--button-hover': \`var(--mantine-color-\${params.color}-7)\`,
  },
});

export { theme };
\`\`\`

\`\`\`tsx
// app.tsx（性能优化版）
'use client';

import { useMemo } from 'react';
import { MantineProvider } from '@mantine/core';
import { theme } from './theme';

function App() {
  // ✅ theme 用 useMemo
  const memoizedTheme = useMemo(() => theme, []);

  return (
    <MantineProvider theme={memoizedTheme}>
      <MyApp />
    </MantineProvider>
  );
}
\`\`\`

\`\`\`tsx
// my-app.tsx（业务组件，用 var()）
function MyApp() {
  // ✅ 用 var() 替代 useMantineTheme
  return (
    <div style={{
      background: 'var(--mantine-color-body)',
      color: 'var(--mantine-color-text)',
    }}>
      内容
    </div>
  );
}
\`\`\`

---

## 25.14 小结

主题系统的 9 个性能优化技巧：

1. **\`useMemo\` 缓存 theme**：避免每次 render 创建新对象。
2. **用 \`var()\` 代替 \`useMantineTheme\`**：零 Context 订阅。
3. **用 \`setColorScheme\` 代替 \`useMantineColorScheme\`**：在不需要响应色板变化的组件。
4. **避免内联 styles**：用 \`useMemo\` 或 \`vars\`。
5. **拆分 Provider 树**：把不变部分提到外层。
6. **用 \`vars\` 替代 \`styles\`**：CSS 变量级性能更好。
7. **用 \`defaultProps\` 替代运行时检查**：编译期合并。
8. **减少 \`useContext\` 订阅**：用 \`useMemo\` 或 \`var()\`。
9. **CSS 变量不展开**：保留 \`var()\`，不展开成静态值。

> ⭐ 记住：**「CSS 变量层 + useMemo + var() = 零重渲染主题切换」**。

---

## 第三部分总结

到这里，我们讲完了 **Theme 主题系统**全部内容：

- 第十四章：createTheme 完全指南
- 第十五章：颜色系统深度（24 色板 / 10 阶 / HSL 通道）
- 第十六章：圆角 / 间距 / 字体 token
- 第十七章：阴影 / 断点 / 默认值
- 第十八章：primaryColor 与 primaryShade
- 第十九章：主题级组件覆盖（classNames / styles / vars）
- 第二十章：暗色模式完整实战
- 第二十一章：CSS 变量层深入（vars resolver）
- 第二十二章：主题与暗色模式 API 总结
- 第二十三章：主题调试与 DevTools
- 第二十四章：自定义品牌色完整流程
- 第二十五章：主题系统性能优化

接下来进入**第四部分：Form 验证体系**，我们深入 useForm、validate、Zod 联动的完整细节。
`,
  },
];

export { chapters };
