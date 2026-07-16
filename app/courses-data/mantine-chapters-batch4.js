// =============================================================
// Mantine 教程 —— 第 4 批：CSS 自定义
// -------------------------------------------------------------
// 覆盖：CSS Modules 机制、createTheme 主题覆盖、classNames/styles API、
//       全局 CSS 覆盖、CSS Variables、暗色模式、按需引入。
// =============================================================

export const chapters = [
  // -------------------------------------------------------------
  // 章节 1：CSS Modules 机制
  // -------------------------------------------------------------
  {
    id: "m-css-modules",
    group: "CSS 自定义",
    icon: "📦",
    title: "Mantine 的 CSS Modules 机制",
    content: `# Mantine 的 CSS Modules 机制

Mantine v9 完全基于 **CSS Modules**（\`*.module.css\`），不再依赖 emotion。理解这一点是用好 Mantine 的关键。

## 为什么用 CSS Modules

| 特性 | emotion (v6 之前) | CSS Modules (v7+) |
| --- | --- | --- |
| 运行时 | 有（CSS-in-JS 注入） | 无（构建时生成） |
| SSR 性能 | 一般（需 SSR 抽取） | 优秀（纯静态 CSS） |
| 包体积 | 较大 | 小 |
| 类型推导 | TS 支持 | TS 支持 |
| 调试 | 类名动态难找 | 类名稳定可读 |

## 全局样式入口

\`\`\`js
// app/layout.js
import "@mantine/core/styles.css";
\`\`\

这一行引入 Mantine 所有组件的 CSS（已 tree-shake 优化）。**全局只引入一次**，在 root layout 即可。

## 类名生成规则

Mantine 组件的类名形如 \`m-xxxxxx\`（CSS Modules hash）：

\`\`\`html
<button class="m-1a2b3c4d5e6f">按钮</button>
\`\`\

调试时可以在 DevTools 看到，类名稳定（同一组件同一 hash），刷新不变。

## 单组件 CSS 文件

如果只想要某个组件的样式（减小包体积），按需引入：

\`\`\`js
// 只用 Button，不要全部样式
import "@mantine/core/components/Button/Button.css";
import "@mantine/core/components/TextInput/TextInput.css";
\`\`\

但要小心遗漏依赖（Button 用了 Box，TextInput 用了 Input），建议直接全局引入 \`styles.css\`，构建工具会自动 tree-shake。

## CSS Modules 的隔离

你自己的 \`*.module.css\` 类名会被 hash 成 \`your-module_xxx_yyy\`，**不会和 Mantine 类名冲突**。

\`\`\`css
/* my-page.module.css */
.card {
  background: white; /* 编译后变成 my-page_card__xxx */
}
\`\`\

\`\`\`jsx
import styles from "./my-page.module.css";
<div className={styles.card}>...</div>
\`\`\

## 覆盖 Mantine 类名的三种方式

1. **classNames prop**：传类名覆盖（推荐）
2. **styles prop**：传内联样式（简单场景）
3. **createTheme**：全局主题覆盖

后面章节详述。

## 踩坑提示

- **不要 import \`.css\` 文件作为非 module**（会污染全局）
- 自定义 CSS 用 \`.module.css\` 后缀
- Mantine 类名是 \`m-xxx\`，你自己的类名是 \`模块名_类名_hash\`，不会冲突
- 如果直接写 \`<style>\` 标签覆盖，要加 !important 或更精确选择器（不推荐）
`,
  },

  // -------------------------------------------------------------
  // 章节 2：createTheme 主题覆盖
  // -------------------------------------------------------------
  {
    id: "m-create-theme",
    group: "CSS 自定义",
    icon: "🎨",
    title: "createTheme 主题覆盖",
    content: `# createTheme 主题覆盖

\`createTheme\` 是 Mantine 的核心主题 API，覆盖颜色、字体、间距、断点等。

## 基本用法

\`\`\`jsx
import { MantineProvider, createTheme } from "@mantine/core";

const theme = createTheme({
  // 主色（primary color），从 Mantine 内置调色板选
  primaryColor: "blue",

  // 字体
  fontFamily: "Inter, sans-serif",
  headings: {
    fontFamily: "Inter, sans-serif",
    sizes: {
      h1: { fontSize: "2rem" },
    },
  },

  // 默认圆角
  defaultRadius: "md",

  // 缩放因子（影响所有组件的间距/大小）
  scale: 1,

  // 暗色模式自动切换
  autoContrast: true,
});

export default function App({ children }) {
  return (
    <MantineProvider theme={theme}>
      {children}
    </MantineProvider>
  );
}
\`\`\

## 颜色系统

Mantine 内置 10+ 调色板（每个 10 个亮度）：

\`\`\`js
const theme = createTheme({
  primaryColor: "indigo", // 主色
  primaryShade: { light: 4, dark: 6 }, // 主色亮度（亮色/暗色模式分别）
});
\`\`\

内置颜色：\`blue\` \`indigo\` \`purple\` \`pink\` \`red\` \`orange\` \`yellow\` \`lime\` \`green\` \`teal\` \`cyan\` \`gray\` \`violet\` \`grape\`。

## 自定义颜色

\`\`\`js
const theme = createTheme({
  colors: {
    // 完整覆盖某个颜色（10 个亮度，从亮到暗）
    brand: [
      "#f0f4ff", "#dbe4ff", "#bfd3ff",
      "#9bb4ff", "#748ffc", "#5c7cfa",
      "#4263eb", "#3b5bdb", "#364fc7", "#283a8e",
    ],
  },
  primaryColor: "brand",
});
\`\`\

## 字体

\`\`\`js
const theme = createTheme({
  fontFamily: "var(--sans, -apple-system, sans-serif)",
  fontFamilyMonospace: "ui-monospace, SFMono-Regular, monospace",
  headings: {
    fontFamily: "var(--sans, inherit)",
    fontWeight: "700",
    textWrap: "balance",
  },
  fontSizes: {
    xs: "0.7rem",
    sm: "0.85rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
  },
  lineHeights: {
    sm: "1.4",
    md: "1.6",
  },
});
\`\`\

## 间距与圆角

\`\`\`js
const theme = createTheme({
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  radius: {
    xs: "2px",
    sm: "4px",
    md: "8px",
    lg: "16px",
    xl: "32px",
  },
  defaultRadius: "md", // 默认圆角
});
\`\`\

## 断点

\`\`\`js
const theme = createTheme({
  breakpoints: {
    xs: "36em",
    sm: "48em",
    md: "62em",
    lg: "75em",
    xl: "88em",
  },
});
\`\`\

## 组件默认 props

\`createTheme\` 的 \`components\` 字段可以覆盖任意组件的默认 props：

\`\`\`js
const theme = createTheme({
  components: {
    Button: {
      defaultProps: {
        radius: "xl",
        size: "md",
      },
    },
    TextInput: {
      defaultProps: {
        size: "md",
        withAsterisk: false,
      },
    },
    Modal: {
      defaultProps: {
        centered: true,
        size: "lg",
      },
    },
  },
});
\`\`\

## 组件级 classNames/styles

\`classNames\` 覆盖类名，\`styles\` 覆盖内联样式（每个内部元素都可以单独覆盖）：

\`\`\`js
const theme = createTheme({
  components: {
    Button: {
      classNames: {
        root: "my-btn-root",
        inner: "my-btn-inner",
        label: "my-btn-label",
        loader: "my-btn-loader",
      },
      styles: {
        root: { fontWeight: 600 },
        label: { letterSpacing: "0.02em" },
      },
    },
  },
});
\`\`\

\`classNames\` 和 \`styles\` 的 key 是组件内部元素的名称，可以查 Mantine 文档或源码看每个组件有哪些元素。

## 多主题切换

\`\`\`jsx
const lightTheme = createTheme({ primaryColor: "blue" });
const darkTheme = createTheme({ primaryColor: "violet" });

function App({ theme: name, children }) {
  const theme = name === "dark" ? darkTheme : lightTheme;
  return (
    <MantineProvider theme={theme} forceColorScheme={name}>
      {children}
    </MantineProvider>
  );
}
\`\`\

## CSS Variables

Mantine 把所有主题变量都暴露为 CSS 变量，可以在任意 CSS 文件里使用：

\`\`\`css
.my-card {
  background: var(--mantine-color-body);
  color: var(--mantine-color-text);
  border: 1px solid var(--mantine-color-default-border);
  border-radius: var(--mantine-radius-md);
  padding: var(--mantine-spacing-md);
}

.my-title {
  font-family: var(--mantine-font-family);
  font-size: var(--mantine-font-size-xl);
  font-weight: var(--mantine-h1-font-weight);
}
\`\`\

## 常用 CSS Variables 速查

| 变量 | 含义 |
| --- | --- |
| \`--mantine-color-text\` | 默认文字色 |
| \`--mantine-color-body\` | body 背景 |
| \`--mantine-color-default\` | 默认背景（Card 等） |
| \`--mantine-color-default-border\` | 默认边框 |
| \`--mantine-primary-color-filled\` | Button filled 背景 |
| \`--mantine-color-blue-500\` | 蓝色 500 |
| \`--mantine-font-family\` | 字体 |
| \`--mantine-radius-md\` | md 圆角 |
| \`--mantine-spacing-md\` | md 间距 |
| \`--mantine-font-size-md\` | md 字号 |
| \`--mantine-breakpoint-md\` | md 断点 |
| \`--mantine-z-index-modal\` | Modal 层级 |

每个调色板都有 10 个变量 \`--mantine-color-{name}-{0-9}\`。
`,
  },

  // -------------------------------------------------------------
  // 章节 3：classNames/styles API
  // -------------------------------------------------------------
  {
    id: "m-classnames-api",
    group: "CSS 自定义",
    icon: "🧬",
    title: "classNames 与 styles API",
    content: `# classNames 与 styles API

每个 Mantine 组件都支持 \`classNames\` 和 \`styles\` prop，可以覆盖内部任意元素的类名和样式。

## 基本用法（对象形式）

\`\`\`jsx
<Button
  classNames={{
    root: "my-root",
    inner: "my-inner",
    label: "my-label",
  }}
  styles={{
    root: { width: "100%" },
    label: { fontWeight: 600 },
  }}
>
  按钮
</Button>
\`\`\

## 函数形式（拿到 theme）

\`\`\`jsx
<Button
  classNames={(theme) => ({
    root: "my-root",
    label: "my-label",
  })}
  styles={(theme) => ({
    root: {
      backgroundColor: theme.colors.blue[6],
      "&:hover": {
        backgroundColor: theme.colors.blue[7],
      },
    },
  })}
>
  按钮
</Button>
\`\`\

函数形式让你能访问 \`theme\` 对象，写条件样式更方便。

## 各组件的内部元素名

查 Mantine 文档每个组件的 "Styles API" 部分，比如 \`TextInput\` 的元素：

- \`wrapper\`：外层 wrapper
- \`input\`：\`<input>\` 本身
- \`label\`：label
- \`error\`：错误文字
- \`description\`：描述文字
- \`required\`：必填星号
- \`section\`：左侧/右侧图标区

\`\`\`jsx
<TextInput
  label="邮箱"
  placeholder="user@example.com"
  classNames={{
    input: "my-input",
    label: "my-label",
  }}
  styles={{
    input: {
      borderBottom: "2px solid var(--mantine-color-blue-5)",
      borderRadius: 0,
      background: "transparent",
    },
  }}
/>
\`\`\

## 配合 CSS Modules

\`\`\`css
/* custom-input.module.css */
.input {
  border: none;
  border-bottom: 2px solid var(--mantine-color-blue-5);
  border-radius: 0;
  background: transparent;
  font-size: 1.1rem;
  transition: border-color 0.2s;
}
.input:focus,
.input:focus-within {
  border-color: var(--mantine-color-blue-7);
  outline: none;
}
.label {
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
}
\`\`\

\`\`\`jsx
import styles from "./custom-input.module.css";

<TextInput
  label="邮箱"
  classNames={{
    input: styles.input,
    label: styles.label,
  }}
/>;
\`\`\

## 全局覆盖（createTheme）

\`\`\`jsx
const theme = createTheme({
  components: {
    Button: {
      classNames: {
        root: "my-btn",
      },
      styles: {
        root: {
          fontWeight: 600,
          letterSpacing: "0.02em",
        },
      },
    },
  },
});
\`\`\

全局覆盖会影响所有 \`Button\` 实例。

## 单实例覆盖 vs 全局覆盖

| 场景 | 推荐 |
| --- | --- |
| 一次性的特殊样式 | 组件 \`classNames\`/\`styles\` prop |
| 整个应用统一风格 | \`createTheme.components.Xxx.classNames\` |
| 复用样式 | 抽 React 组件包装 |
| 隔离的样式 | CSS Modules |

## 复合选择器

\`styles\` 函数里可以用 \`&\` 表示当前元素：

\`\`\`jsx
<Button
  styles={{
    root: {
      "&.my-btn-large": {
        padding: "1rem 2rem",
      },
      "&:hover": {
        transform: "translateY(-2px)",
      },
      "&[data-disabled]": {
        opacity: 0.4,
      },
    },
  }}
>
  按钮
</Button>
\`\`\

## 子元素选择器

\`\`\`jsx
<Card
  styles={{
    root: {
      "& .my-card-title": {
        fontSize: "1.25rem",
      },
      "&:hover .my-card-title": {
        color: "var(--mantine-primary-color-filled)",
      },
    },
  }}
>
  <div className="my-card-title">标题</div>
</Card>
\`\`\

## 踩坑提示

- \`styles\` 对象里的 key 是**驼峰**（CSS 属性名），\`border-radius\` 写成 \`borderRadius\`
- 复合选择器必须用 \`&\` 开头，不能直接写 \`"button:hover"\`
- \`classNames\` 和 \`styles\` 同名元素都要单独传，不能合并
- 不要在 \`styles\` 里写 \`@media\`，用 CSS Modules 替代
`,
  },

  // -------------------------------------------------------------
  // 章节 4：全局 CSS 覆盖
  // -------------------------------------------------------------
  {
    id: "m-global-css",
    group: "CSS 自定义",
    icon: "🌐",
    title: "全局 CSS 覆盖",
    content: `# 全局 CSS 覆盖

除了 \`createTheme\` 和 \`classNames\`，有时需要直接覆盖 Mantine 的全局类名。

## 全局 CSS 文件

\`\`\`css
/* app/globals.css */
@import "@mantine/core/styles.css";

/* 覆盖所有 Button 的圆角 */
.mantine-Button-root {
  border-radius: 999px !important;
}

/* 覆盖所有 Modal 的圆角 */
.mantine-Modal-content {
  border-radius: 16px !important;
}
\`\`\

## 类名前缀

Mantine v9 的全局类名前缀默认是 \`m-\`（CSS Modules hash），但你可以通过 \`cssVariablesResolver\` 或 \`classNamesPrefix\` 自定义。

\`\`\`jsx
const theme = createTheme({
  // 设置类名前缀（v9 可能改 API，查阅最新文档）
});

<MantineProvider
  theme={theme}
  // 其他配置
>
\`\`\

实际上 v9 用 CSS Modules，全局类名是 hash 后的 \`m-xxx\`，**不推荐直接覆盖**（hash 不稳定）。优先用 \`classNames\` API。

## CSS Variables 覆盖

Mantine 把主题变量都暴露为 CSS 变量，可以在 \`<style>\` 里覆盖：

\`\`\`css
/* globals.css */
:root {
  --mantine-color-body: #f8fafc;
  --mantine-color-text: #1e293b;
  --mantine-primary-color-filled: #6366f1;
  --mantine-radius-md: 12px;
}

[data-mantine-color-scheme="dark"] {
  --mantine-color-body: #0f172a;
  --mantine-color-text: #e2e8f0;
}
\`\`\

注意：覆盖 CSS 变量**不会影响所有派生变量**（比如 \`primary-color-filled\` 是计算值）。最可靠的方式还是用 \`createTheme\`。

## cssVariablesResolver

Mantine 提供官方 API 覆盖 CSS 变量：

\`\`\`jsx
import { MantineProvider, createTheme, rem } from "@mantine/core";

const theme = createTheme({
  cssVariables: {
    "--mantine-color-body": "#fafafa",
    "--mantine-color-text": "#1a1a1a",
  },
});

<MantineProvider theme={theme}>
\`\`\

或用 resolver 函数动态计算：

\`\`\`jsx
const theme = createTheme({
  cssVariablesResolver: (theme) => ({
    "--my-custom-var": theme.colors[theme.primaryColor][6],
  }),
});
\`\`\

## 在 Next.js App Router 中

\`\`\`jsx
// app/layout.js
import "@mantine/core/styles.css";
import "./globals.css"; // 你的全局覆盖

import { MantineProvider, ColorSchemeScript } from "@mantine/core";

const theme = createTheme({ ... });

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
\`\`\

\`ColorSchemeScript\` 必须在 \`<head>\` 中（避免 FOUC），\`MantineProvider\` 在 \`<body>\` 中。

## !important 的使用场景

通常不需要 \`!important\`，但有时要覆盖 Mantine 内联样式：

\`\`\`css
/* 强制覆盖 Mantine 注入的内联样式 */
.my-input {
  background-color: white !important;
}
\`\`\

只在确有必要时用，否则会增加维护成本。

## 踩坑提示

- 不要用 \`!important\` 覆盖 hover/focus，会有竞争问题
- 全局类名 hash 可能随版本变化，**不要依赖具体 hash 值**
- 在 App Router 中 \`@mantine/core/styles.css\` 必须 **server-side 可达**，不要动态导入
- \`globals.css\` 写在 \`@mantine/core/styles.css\` 之后，确保覆盖优先
`,
  },

  // -------------------------------------------------------------
  // 章节 5：暗色模式
  // -------------------------------------------------------------
  {
    id: "m-dark-mode",
    group: "CSS 自定义",
    icon: "🌙",
    title: "暗色模式",
    content: `# 暗色模式

Mantine 内置暗色模式支持，基于 \`data-mantine-color-scheme\` 属性切换。

## 基本用法

\`\`\`jsx
import { MantineProvider, ColorSchemeScript } from "@mantine/core";

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 必须在 head 中，避免 FOUC */}
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider defaultColorScheme="auto">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
\`\`\

- \`defaultColorScheme="auto"\`：跟随系统偏好
- \`defaultColorScheme="light"\`：默认亮色
- \`defaultColorScheme="dark"\`：默认暗色

## useMantineColorScheme Hook

\`\`\`jsx
"use client";
import { useMantineColorScheme, Button, Group } from "@mantine/core";

function ThemeToggle() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Group>
      <Button onClick={() => setColorScheme("light")}>亮色</Button>
      <Button onClick={() => setColorScheme("dark")}>暗色</Button>
      <Button onClick={() => setColorScheme("auto")}>自动</Button>
      <Button onClick={toggleColorScheme}>切换</Button>
      <span>当前: {colorScheme}</span>
    </Group>
  );
}
\`\`\

\`colorScheme\` 返回 \`"light" | "dark"\`（auto 会解析成实际值）。

## 持久化用户偏好

\`\`\`jsx
import { useEffect } from "react";
import { useMantineColorScheme } from "@mantine/core";

function usePersistColorScheme() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  // 启动时恢复
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setColorScheme(saved);
  }, [setColorScheme]);

  // 变化时保存
  useEffect(() => {
    localStorage.setItem("theme", colorScheme);
  }, [colorScheme]);
}
\`\`\

\`ColorSchemeScript\` 已经在 SSR 时把 \`localStorage["mantine-color-scheme"]\` 读取并设置 \`data-mantine-color-scheme\`，你只需要切换时写回 localStorage 即可。

## CSS Variables 区分暗色

\`\`\`css
.my-card {
  background: var(--mantine-color-body);
  color: var(--mantine-color-text);
}

/* 暗色下定制 */
[data-mantine-color-scheme="dark"] .my-card {
  border-color: var(--mantine-color-dark-4);
}

/* 亮色下定制 */
[data-mantine-color-scheme="light"] .my-card {
  border-color: var(--mantine-color-gray-3);
}
\`\`\

## createTheme 中区分暗色

\`\`\`js
const theme = createTheme({
  primaryColor: "blue",
  primaryShade: { light: 6, dark: 5 },
  autoContrast: true, // 自动选文字色（亮背景用黑字，暗背景用白字）
  luminanceThreshold: 0.5,
});
\`\`\

- \`primaryShade\`：暗色模式可以选不同的亮度
- \`autoContrast\`：自动决定 Button filled 内的文字色

## 自定义暗色调色板

\`\`\`js
const theme = createTheme({
  colors: {
    dark: [
      "#C1C2C5", "#A6A7AB", "#909296", "#5c5f66",
      "#373A40", "#2C2E33", "#25262B", "#1A1B1E", "#141517", "#101113",
    ],
  },
  black: "#000",
  white: "#fff",
});
\`\`\

\`dark\` 调色板控制 Mantine 的 \`--mantine-color-dark-N\`，影响所有暗色背景。

## 踩坑提示

- \`ColorSchemeScript\` 必须在 \`<head>\` 中，否则 SSR 阶段会有 FOUC
- \`useMantineColorScheme\` 是客户端 hook，不能在 Server Component 中调用
- 切换 \`colorScheme\` 会触发整页重新渲染（CSS Variables 切换）
- 系统切换主题时（auto 模式），\`colorScheme\` 会自动更新
`,
  },

  // -------------------------------------------------------------
  // 章节 6：在线 Demo
  // -------------------------------------------------------------
  {
    id: "m-demo",
    group: "CSS 自定义",
    icon: "🎯",
    title: "在线 Demo（独立路由）",
    content: `# 在线 Demo

下方 \`code\` 是一个完整的 \`/mantine-demo\` 路由的 demo，演示：

- **主题切换**（亮/暗 + 自定义主色）
- **Form + Zod 表单**（嵌套对象、异步校验、动态字段）
- **CSS 自定义**（classNames、CSS Modules）
- **Modal 表单**

打开 \`/mantine-demo\` 即可体验。

\`\`\`jsx
"use client";
// 一个完整的 Mantine demo：表单 + 主题切换 + 自定义样式
import { useState } from "react";
import {
  MantineProvider,
  ColorSchemeScript,
  createTheme,
  Container,
  Paper,
  Title,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Checkbox,
  Button,
  Group,
  Stack,
  Modal,
  useMantineColorScheme,
  Box,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { schemaResolver } from "@mantine/form";
import { z } from "zod";

// ---------- Schema ----------
const schema = z.object({
  name: z.string().min(2, "姓名至少 2 字"),
  email: z.string().email("邮箱格式不正确"),
  age: z.coerce.number().int().min(18, "必须 18 岁以上"),
  role: z.enum(["admin", "user", "guest"]),
  bio: z.string().max(200, "简介最多 200 字").optional(),
  agree: z.literal(true, {
    errorMap: () => ({ message: "必须同意条款" }),
  }),
});

const initialValues = {
  name: "",
  email: "",
  age: 18,
  role: "user",
  bio: "",
  agree: false,
};

// ---------- 表单组件 ----------
function UserForm({ onSubmit }) {
  const form = useForm({
    initialValues,
    validate: schemaResolver(schema),
    validateInputOnBlur: true,
  });

  return (
    <Paper p="md" withBorder>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <TextInput
            label="姓名"
            placeholder="张三"
            withAsterisk
            {...form.getInputProps("name")}
          />
          <TextInput
            label="邮箱"
            placeholder="user@example.com"
            withAsterisk
            {...form.getInputProps("email")}
          />
          <NumberInput
            label="年龄"
            withAsterisk
            min={0}
            max={150}
            {...form.getInputProps("age")}
          />
          <Select
            label="角色"
            data={[
              { value: "admin", label: "管理员" },
              { value: "user", label: "用户" },
              { value: "guest", label: "访客" },
            ]}
            withAsterisk
            {...form.getInputProps("role")}
          />
          <Textarea
            label="简介"
            placeholder="介绍一下自己..."
            autosize
            minRows={2}
            {...form.getInputProps("bio")}
          />
          <Checkbox
            label="我同意服务条款"
            {...form.getInputProps("agree", { type: "checkbox" })}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => form.reset()}>
              重置
            </Button>
            <Button type="submit">提交</Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}

// ---------- 主题切换 ----------
function ThemeSwitcher() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  return (
    <Group>
      <Button
        variant={colorScheme === "light" ? "filled" : "light"}
        onClick={() => setColorScheme("light")}
      >
        亮色
      </Button>
      <Button
        variant={colorScheme === "dark" ? "filled" : "light"}
        onClick={() => setColorScheme("dark")}
      >
        暗色
      </Button>
    </Group>
  );
}

// ---------- 主页面 ----------
export default function MantineDemoPage() {
  const [submitted, setSubmitted] = useState(null);
  const [opened, setOpened] = useState(false);

  return (
    <Container size="sm" py="xl">
      <Stack>
        <Group justify="space-between">
          <Title order={2}>Mantine Demo</Title>
          <ThemeSwitcher />
        </Group>

        <Text size="sm" c="dimmed">
          演示 Form + Zod + 主题切换 + Modal。试试提交表单或切换主题。
        </Text>

        <UserForm
          onSubmit={(values) => {
            setSubmitted(values);
            setOpened(true);
          }}
        />

        <Modal opened={opened} onClose={() => setOpened(false)} title="提交结果">
          <pre style={{
            background: "var(--mantine-color-dark-8)",
            color: "var(--mantine-color-gray-3)",
            padding: "1rem",
            borderRadius: "8px",
            overflow: "auto",
            fontSize: "0.875rem",
          }}>
            {JSON.stringify(submitted, null, 2)}
          </pre>
        </Modal>
      </Stack>
    </Container>
  );
}
\`\`\

打开 \`/mantine-demo\` 路由体验。

\`code\` 字段是可运行的完整 demo 源码，挂在 \`/mantine-demo\` 路由下，包含：

1. **表单**：zod schema 校验 + 异步提交
2. **主题**：亮/暗切换
3. **Modal**：提交结果展示
4. **样式**：Mantine 原生样式 + Container/Paper 布局
`,
    code: `"use client";
import { useState } from "react";
import {
  Container,
  Paper,
  Title,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Checkbox,
  Button,
  Group,
  Stack,
  Modal,
  useMantineColorScheme,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { schemaResolver } from "@mantine/form";
import { z } from "zod";

// zod schema
const schema = z.object({
  name: z.string().min(2, "姓名至少 2 字"),
  email: z.string().email("邮箱格式不正确"),
  age: z.coerce.number().int().min(18, "必须 18 岁以上"),
  role: z.enum(["admin", "user", "guest"]),
  bio: z.string().max(200, "简介最多 200 字").optional(),
  agree: z.literal(true, {
    errorMap: () => ({ message: "必须同意条款" }),
  }),
});

const initialValues = {
  name: "",
  email: "",
  age: 18,
  role: "user",
  bio: "",
  agree: false,
};

function UserForm({ onSubmit }) {
  const form = useForm({
    initialValues,
    validate: schemaResolver(schema),
    validateInputOnBlur: true,
  });

  return (
    <Paper p="md" withBorder>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <TextInput label="姓名" placeholder="张三" withAsterisk {...form.getInputProps("name")} />
          <TextInput label="邮箱" placeholder="user@example.com" withAsterisk {...form.getInputProps("email")} />
          <NumberInput label="年龄" withAsterisk min={0} max={150} {...form.getInputProps("age")} />
          <Select
            label="角色"
            data={[
              { value: "admin", label: "管理员" },
              { value: "user", label: "用户" },
              { value: "guest", label: "访客" },
            ]}
            withAsterisk
            {...form.getInputProps("role")}
          />
          <Textarea label="简介" placeholder="介绍一下自己..." autosize minRows={2} {...form.getInputProps("bio")} />
          <Checkbox label="我同意服务条款" {...form.getInputProps("agree", { type: "checkbox" })} />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => form.reset()}>重置</Button>
            <Button type="submit">提交</Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}

function ThemeSwitcher() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  return (
    <Group>
      <Button variant={colorScheme === "light" ? "filled" : "light"} onClick={() => setColorScheme("light")}>亮色</Button>
      <Button variant={colorScheme === "dark" ? "filled" : "light"} onClick={() => setColorScheme("dark")}>暗色</Button>
    </Group>
  );
}

export default function MantineDemoPage() {
  const [submitted, setSubmitted] = useState(null);
  const [opened, setOpened] = useState(false);

  return (
    <Container size="sm" py="xl">
      <Stack>
        <Group justify="space-between">
          <Title order={2}>Mantine Demo</Title>
          <ThemeSwitcher />
        </Group>
        <Text size="sm" c="dimmed">
          演示 Form + Zod + 主题切换 + Modal。试试提交表单或切换主题。
        </Text>
        <UserForm
          onSubmit={(values) => {
            setSubmitted(values);
            setOpened(true);
          }}
        />
        <Modal opened={opened} onClose={() => setOpened(false)} title="提交结果">
          <pre style={{
            background: "var(--mantine-color-dark-8)",
            color: "var(--mantine-color-gray-3)",
            padding: "1rem",
            borderRadius: "8px",
            overflow: "auto",
            fontSize: "0.875rem",
          }}>
            {JSON.stringify(submitted, null, 2)}
          </pre>
        </Modal>
      </Stack>
    </Container>
  );
}`,
  },
];
