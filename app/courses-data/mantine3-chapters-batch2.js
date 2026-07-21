// =============================================================
// Mantine 之道 · 理念与设计目的 —— 第二批章节
// -------------------------------------------------------------
// 本批包含：
//   mantine3-ch07 : 第七章 CSS 变量层原理
//   mantine3-ch08 : 第八章 emotion 与 style props 的取舍
//   mantine3-ch09 : 第九章 Provider 机制：主题 / 暗色 / 全局样式
//   mantine3-ch10 : 第十章 主题如何「流」进每个组件
//   mantine3-ch11 : 第十一章 响应式系统：媒体查询 vs 容器查询
//   mantine3-ch12 : 第十二章 暗色模式的实现原理
//   mantine3-ch13 : 第十三章 SSR 与 RSC 兼容性
//
// 风格：底层原理导向，每章配套原理图 + 可运行 demo
// 适用版本：Mantine v9 / React 19 / Next.js 16
// =============================================================

const chapters = [
  // ============================================================
  // 第七章
  // ============================================================
  {
    id: "mantine3-ch07",
    group: "第二部分 架构与设计目的",
    icon: "🎨",
    title: "第七章 CSS 变量层原理",
    content: `## 7.1 为什么 Mantine 选择 CSS 变量

在 v7 之前，Mantine 主题是用 **JS 对象**管理的（类似 AntD v4）。但在 v7 之后，团队做了一个**根本性重构**——把所有主题 token 编译成 **CSS 变量**。

这个决定背后的 4 个关键原因：

### 原因 1：运行时切换几乎零成本

JS 主题切换需要：
1. 更新 JS 对象。
2. 触发整个组件树重渲染。
3. emotion 重新生成 CSS。
4. 浏览器重新计算样式。

CSS 变量切换只需要：
1. 改一个属性选择器（如 \`[data-mantine-color-scheme="dark"]\`）。
2. 浏览器原生级联，**所有子元素自动应用新值**。

**性能差异**：1000 个 Button 切换暗色，**JS 主题 ~150ms vs CSS 变量 < 5ms**。

### 原因 2：SSR 友好

JS 主题在 SSR 时需要：
- 服务端渲染一份样式（用 emotion SSR）。
- 客户端 hydrate 时再生成一次。
- 容易出现「样式闪烁」（FOUC）。

CSS 变量在 SSR 时：
- 服务端把 CSS 变量直接写到 \`<style>\` 标签里。
- 客户端 hydrate 时 CSS 变量**已经在 \`:root\` 上**。
- 零闪烁、零不一致。

### 原因 3：浏览器原生支持

CSS 变量是 W3C 标准，所有现代浏览器（Chrome 49+ / Firefox 31+ / Safari 9.1+）原生支持。

不需要 polyfill、不需要 runtime 库。

### 原因 4：可调试性

在 Chrome DevTools 里，**你能直接看到每个 CSS 变量的值**：

\`\`\`
Computed → :root → --mantine-color-violet-5 → 121 80 196
\`\`\`

JS 主题调试时你只能看到「一堆 className + 序列化后的样式对象」，很难追溯源头。

---

## 7.2 CSS 变量的工作机制

### 第一步：编译期生成

Mantine 内部使用 **PostCSS + 自定义插件**，在打包时把主题 token 编译成 CSS 变量。

例如 \`createTheme({ primaryColor: 'violet' })\` 会生成：

\`\`\`css
:root {
  --mantine-color-violet-0: 247 245 255;
  --mantine-color-violet-1: 237 230 252;
  --mantine-color-violet-2: 224 213 248;
  --mantine-color-violet-3: 209 195 244;
  --mantine-color-violet-4: 192 174 240;
  --mantine-color-violet-5: 173 148 233;
  --mantine-color-violet-6: 151 119 225;
  --mantine-color-violet-7: 127 87 215;
  --mantine-color-violet-8: 100 53 198;
  --mantine-color-violet-9: 73 19 173;
  --mantine-primary-color-filled: var(--mantine-color-violet-8);
  --mantine-primary-color-filled-hover: var(--mantine-color-violet-9);
}
\`\`\`

> ⚠️ 注意：Mantine 颜色用 **HSL 通道**（不含 \`hsl(...)\` 前缀）存储，这样可以在不同位置调整透明度：
> \`background: hsl(var(--mantine-color-violet-5) / 0.5)\`

### 第二步：组件用 var() 引用

\`\`\`css
/* Mantine 生成的 Button 样式 */
.mantine-Button-root {
  background: var(--mantine-primary-color-filled);
  color: white;
  border: 1px solid var(--mantine-primary-color-filled);
}

.mantine-Button-root:hover {
  background: var(--mantine-primary-color-filled-hover);
}
\`\`\`

### 第三步：运行时切换（暗色模式）

\`\`\`html
<!-- 亮色模式 -->
<html data-mantine-color-scheme="light">

<!-- 暗色模式 -->
<html data-mantine-color-scheme="dark">
  <style>
    [data-mantine-color-scheme="dark"] {
      --mantine-color-violet-5: 173 148 233;  /* 暗色下色阶反转 */
      --mantine-color-violet-8: 151 119 225;
      /* ... */
    }
  </style>
</html>
\`\`\`

---

## 7.3 主题 token 的完整列表

\`createTheme\` 接受的所有 token 都会编译为 CSS 变量：

### 颜色类

| Token | 编译后 | 用途 |
| --- | --- | --- |
| \`primaryColor\` | \`--mantine-primary-color-*\` | 主题色 |
| \`colors.brand\` | \`--mantine-color-brand-0\` ~ \`--mantine-color-brand-9\` | 10 阶色板 |
| \`white\` / \`black\` | \`--mantine-color-white\` / \`--mantine-color-black\` | 基础色 |
| \`defaultRadius\` | \`--mantine-radius-default\` | 默认圆角 |

### 圆角类

| Token | 编译后 |
| --- | --- |
| \`radius.xs\` ~ \`radius.xl\` | \`--mantine-radius-xs\` ~ \`--mantine-radius-xl\` |
| \`defaultRadius\` | \`--mantine-radius-default\` |

### 间距类

| Token | 编译后 |
| --- | --- |
| \`spacing.xs\` ~ \`spacing.xl\` | \`--mantine-spacing-xs\` ~ \`--mantine-spacing-xl\` |

### 字体类

| Token | 编译后 |
| --- | --- |
| \`fontFamily\` | \`--mantine-font-family\` |
| \`fontFamilyMonospace\` | \`--mantine-font-family-monospace\` |
| \`headings.fontFamily\` | \`--mantine-heading-font-family\` |
| \`headings.sizes.h1\` ~ \`h6\` | \`--mantine-heading-h1-font-size\` 等 |
| \`headings.fontWeight\` | \`--mantine-heading-font-weight\` |

### 阴影类

| Token | 编译后 |
| --- | --- |
| \`shadows.xs\` ~ \`shadows.xl\` | \`--mantine-shadow-xs\` ~ \`--mantine-shadow-xl\` |

### 断点类

| Token | 编译后 |
| --- | --- |
| \`breakpoints.xs\` ~ \`breakpoints.xl\` | \`--mantine-breakpoint-xs\` ~ \`--mantine-breakpoint-xl\` |

---

## 7.4 在自定义组件里使用 Mantine 主题

\`\`\`jsx
import { useMantineTheme } from '@mantine/core';

function MyCard() {
  // 拿到当前主题（不触发重渲染）
  const theme = useMantineTheme();

  return (
    <div
      style={{
        // 直接用 theme 对象里的值
        background: theme.colors.gray[0],
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        fontFamily: theme.fontFamily,
      }}
    >
      我和 Mantine 风格一致
    </div>
  );
}
\`\`\`

或者直接用 CSS 变量（**推荐**——性能更好）：

\`\`\`jsx
function MyCard() {
  return (
    <div
      style={{
        // 直接引用 Mantine 生成的 CSS 变量
        background: 'var(--mantine-color-gray-0)',
        padding: 'var(--mantine-spacing-md)',
        borderRadius: 'var(--mantine-radius-md)',
      }}
    >
      我和 Mantine 风格一致
    </div>
  );
}
\`\`\`

**两种方式的差异**：

| 维度 | useMantineTheme | var() |
| --- | --- | --- |
| 主题更新 | 触发 React 重渲染 | 不触发重渲染 |
| 类型提示 | ✅ 完整 | ⚠️ 需要手写变量名 |
| SSR | 服务端能拿到 | SSR 友好 |

**最佳实践**：业务组件用 \`var()\`，避免重渲染；只在需要动态逻辑时用 \`useMantineTheme()\`。

---

## 7.5 自定义颜色：Mantine Color Generator

Mantine 官方提供 **Color Generator**（https://mantine.dev/colors-generator/）：

1. 输入基础色（如品牌色 \`#5C33FF\`）。
2. 自动生成 10 阶色板（0-9）。
3. 一键复制到 \`createTheme\`。

**为什么要 10 阶？**

- **0-3**：背景、hover、disabled（淡色）。
- **4-6**：常规（普通文字、边框）。
- **7-8**：主题色（按钮、强调）。
- **9**：pressed / focus 暗色。

\`\`\`jsx
// Mantine Color Generator 输出的 10 阶
brand: [
  '#f3f0ff',  // 0
  '#e0d4ff',  // 1
  '#c0a8fb',  // 2
  '#a07bf6',  // 3
  '#8a52f3',  // 4
  '#7c3aed',  // 5
  '#6d28d9',  // 6
  '#5b21b6',  // 7
  '#491a94',  // 8
  '#3b1372',  // 9
],
\`\`\`

---

## 7.6 在业务代码里获取「当前生效的 CSS 变量」

\`\`\`jsx
import { useComputedColorScheme, useMantineCssVariables } from '@mantine/core';

function DebugPanel() {
  // 当前实际生效的色板（light / dark）
  const colorScheme = useComputedColorScheme();
  // 当前主题的所有 CSS 变量键值对
  const cssVars = useMantineCssVariables();

  return (
    <pre>
      colorScheme: {colorScheme}
      {'\\n'}
      {Object.keys(cssVars).slice(0, 10).join('\\n')}
    </pre>
  );
}
\`\`\`

---

## 7.7 小结

- Mantine v7 之后**全面转向 CSS 变量**，主题 token 编译期生成。
- 三大优势：**运行时切换零成本、SSR 友好、浏览器原生支持**。
- 所有 token 都映射到 CSS 变量，业务组件可以用 \`var()\` 引用，**避免重渲染**。
- Mantine Color Generator 帮你一键生成 10 阶品牌色。

> ⭐ 记住：**「CSS 变量是 Mantine 性能优势的根」**。

下一章我们看 emotion 与 style props 的取舍。
`,
  },

  // ============================================================
  // 第八章
  // ============================================================
  {
    id: "mantine3-ch08",
    group: "第二部分 架构与设计目的",
    icon: "🧬",
    title: "第八章 emotion 与 style props 的取舍",
    content: `## 8.1 emotion 在 Mantine 中的角色

**emotion** 是 React 生态最流行的 CSS-in-JS 库之一。Mantine 内部使用 emotion 处理**两件事**：

1. **样式 prop 的 dynamic 计算**：当用户传 \`style={{ background: 'red' }}\` 时，emotion 把样式插入到 \`<head>\`。
2. **组件 style prop 的合并**：当用户传 \`styles={{ root: { ... } }}\` 时，emotion 把样式合并到组件上。

但 Mantine **没有让 emotion 处理主题**——主题是 CSS 变量层，编译期生成。

这就是 Mantine 与 MUI / Chakra 的**根本区别**：

| 库 | 主题 | 动态样式 |
| --- | --- | --- |
| MUI | emotion | emotion |
| Chakra | emotion | emotion |
| Mantine | **CSS 变量** | **emotion** |

---

## 8.2 style props：怎么工作的

Mantine 的 **style props** 是 \`Box\`、\`Stack\`、\`Group\`、\`Flex\` 等布局组件的核心能力：

\`\`\`jsx
<Box
  p="md"          // padding: var(--mantine-spacing-md)
  m="lg"          // margin: var(--mantine-spacing-lg)
  bg="blue.5"     // background: var(--mantine-color-blue-5)
  c="white"       // color: white
  ta="center"     // text-align: center
  fw={700}        // font-weight: 700
>
  我是 Box
</Box>
\`\`\`

底层实现思路：

\`\`\`jsx
// Box 组件的简化版本
function Box({ p, m, bg, c, ta, fw, children, style, ...rest }) {
  // 1. style props 转 CSS 对象
  const dynamicStyle = {
    ...(p && { padding: \`var(--mantine-spacing-\${p})\` }),
    ...(m && { margin: \`var(--mantine-spacing-\${m})\` }),
    ...(bg && { background: resolveColor(bg) }),
    ...(c && { color: resolveColor(c) }),
    ...(ta && { textAlign: ta }),
    ...(fw && { fontWeight: fw }),
  };

  // 2. 合并用户传入的 style
  const mergedStyle = { ...dynamicStyle, ...style };

  // 3. 渲染为普通 div，emotion 不参与
  return <div style={mergedStyle} {...rest}>{children}</div>;
}

// resolveColor 处理 'blue.5' → 'var(--mantine-color-blue-5)'
function resolveColor(value) {
  if (typeof value !== 'string') return value;
  const [color, shade] = value.split('.');
  return shade ? \`var(--mantine-color-\${color}-\${shade})\` : \`var(--mantine-color-\${value})\`;
}
\`\`\`

**关键点**：style props **走原生 \`style\` 属性**，不走 emotion。性能极高。

---

## 8.3 styles prop：组件内部覆盖

当你需要修改 Mantine 组件的**内部元素**（如 Button 的 \`root\` 和 \`label\`），用 \`styles\` prop：

\`\`\`jsx
<Button
  styles={{
    // root 是 Button 最外层元素
    root: {
      background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
      border: 0,
      borderRadius: 3,
      boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
      color: 'white',
      height: 48,
      padding: '0 30px',
    },
    // label 是 Button 内的文字 span
    label: {
      fontWeight: 700,
      letterSpacing: 1,
    },
  }}
>
  渐变按钮
</Button>
\`\`\`

**底层**：Mantine 把 \`styles\` prop 合并到组件的内部 emotion className 中。运行时只计算一次，缓存到组件实例。

### styles vs classNames

| 维度 | styles | classNames |
| --- | --- | --- |
| 传值 | CSS 对象 | className 字符串 |
| 适用 | 动态计算样式 | 静态 CSS 类 |
| 性能 | runtime 合并（轻微开销） | 编译期生成（零开销） |
| 类型 | 完整 TypeScript | 弱类型 |

\`\`\`jsx
// 用 classNames 引用全局 CSS
import classes from './MyButton.module.css';

<Button classNames={{ root: classes.root, label: classes.label }}>
  按钮
</Button>;
\`\`\`

**最佳实践**：
- **能用 classNames 解决就用 classNames**（性能更好）。
- **只有需要动态计算（如根据 props 决定颜色）时才用 styles**。

---

## 8.4 主题级覆盖：components 配置

在主题层定义所有 Button 的默认行为：

\`\`\`jsx
const theme = createTheme({
  components: {
    Button: {
      // 全局默认 props
      defaultProps: { radius: 'xl', size: 'md' },
      // 全局默认样式
      classNames: { root: 'my-btn-root' },
      styles: { root: { fontWeight: 700 } },
      // 全局变量覆盖
      vars: (theme, params) => ({
        root: {
          '--button-color': params.color === 'red' ? 'white' : 'black',
        },
      }),
    },
  },
});
\`\`\`

**覆盖优先级**（从低到高）：
1. 主题默认 props / 样式
2. 组件实例 props
3. 组件实例 styles / classNames

> ⭐ 也就是说，**实例级覆盖永远优先于主题级默认值**。

---

## 8.5 emotion 性能开销的优化技巧

虽然 Mantine 主题不走 emotion，但 \`styles\` prop 还是会走 emotion。**怎么减少开销？**

### 技巧 1：避免内联对象

\`\`\`jsx
// ❌ 每次 render 都生成新对象，emotion 重新计算
<Button styles={{ root: { background: 'red' } }}>按钮</Button>

// ✅ 提取到组件外，只计算一次
const buttonStyles = { root: { background: 'red' } };
<Button styles={buttonStyles}>按钮</Button>
\`\`\`

### 技巧 2：用 classNames 替代动态 styles

\`\`\`jsx
// ❌ 动态计算颜色，每次 props 变化都重新计算
<Button styles={{ root: { background: condition ? 'red' : 'blue' } }}>按钮</Button>

// ✅ 用 className 切换，CSS 类预定义
<Button className={condition ? 'btn-red' : 'btn-blue'}>按钮</Button>
\`\`\`

### 技巧 3：使用 \`vars\` 而非 \`styles\`

\`\`\`jsx
// ✅ vars 是 CSS 变量级覆盖，性能最好
const theme = createTheme({
  components: {
    Button: {
      vars: () => ({
        root: {
          '--button-bg': 'red',
        },
      }),
    },
  },
});
\`\`\`

---

## 8.6 style props 的完整列表

### 间距 props

\`p\`、\`pt\`、\`pr\`、\`pb\`、\`pl\`、\`px\`、\`py\`、\`m\`、\`mt\`、\`mr\`、\`mb\`、\`ml\`、\`mx\`、\`my\`

值：\`xs\` / \`sm\` / \`md\` / \`lg\` / \`xl\` 或任意 CSS 长度值

### 颜色 props

\`c\`（color）、\`bg\`（background）、\`opacity\`

值：\`white\`、\`black\`、\`blue.5\`、\`rgb(0,0,0)\` 等

### 排版 props

\`fw\`（font-weight）、\`fs\`（font-size）、\`ff\`（font-family）、\`ta\`（text-align）、\`lh\`（line-height）、\`tt\`（text-transform）、\`td\`（text-decoration）

### 布局 props

\`display\`、\`pos\`（position）、\`top\`、\`right\`、\`bottom\`、\`left\`

### 边框 props

\`bd\`（border）、\`bt\`、\`br\`、\`bb\`、\`bl\`、\`bdrs\`（border-radius）

### 尺寸 props

\`w\`（width）、\`h\`（height）、\`maw\`、\`mah\`、\`miw\`、\`mih\`

### 其他 props

\`boxShadow\`、\`bgGradient\`、\`visibleFrom\`、\`hiddenFrom\`

\`\`\`jsx
<Box
  p="md"
  m="lg"
  bg="blue.5"
  c="white"
  ta="center"
  fw={700}
  visibleFrom="sm"  // 只在 sm 断点及以上显示
  hiddenFrom="md"   // 在 md 断点及以上隐藏
>
  我是响应式 Box
</Box>
\`\`\`

---

## 8.7 emotion vs Tailwind vs vanilla-extract

如果你的团队对 CSS 方案有强烈偏好，Mantine 也能搭配：

| 方案 | Mantine 兼容性 | 性能 | 学习成本 |
| --- | --- | --- | --- |
| **Mantine 内置** | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Tailwind** | ✅（但会有类名冲突） | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **emotion** | ✅（Mantine 内部用） | ⭐⭐⭐ | ⭐⭐ |
| **vanilla-extract** | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**最佳实践**：

- 大部分项目用 **Mantine 内置方案** 就够了（\`styles\` + \`classNames\` + style props）。
- 已有 Tailwind 的项目可以**混用**，但要注意**类名前缀**（Mantine 用 \`mantine-*\`）。
- 不要引入 emotion 自己写 CSS-in-JS——会和 Mantine 内部的 emotion 冲突。

---

## 8.8 小结

- Mantine 内部用 emotion 处理**动态样式**（\`styles\` prop），**主题用 CSS 变量**。
- style props 走原生 \`style\` 属性，**不走 emotion**，性能极高。
- \`styles\` vs \`classNames\`：**能 classNames 就 classNames**。
- 性能优化三技巧：**避免内联对象、用 classNames 替代动态 styles、使用 vars**。

> ⭐ 记住：**「主题是 CSS 变量层，动态样式是 emotion，style props 是原生 style」**——三层架构各有分工。

下一章我们看 Provider 机制。
`,
  },

  // ============================================================
  // 第九章
  // ============================================================
  {
    id: "mantine3-ch09",
    group: "第二部分 架构与设计目的",
    icon: "🔌",
    title: "第九章 Provider 机制：主题 / 暗色 / 全局样式",
    content: `## 9.1 Provider 层级架构

Mantine 的所有功能都通过 **Provider 树**传递：

\`\`\`
MantineProvider       ← 主题 + 暗色模式 + 全局 CSS
  └── DatesProvider   ← 日期国际化
        └── ModalsProvider   ← 命令式弹窗
              └── Notifications ← 全局通知
                    └── App   ← 你的业务代码
\`\`\`

**为什么这么多 Provider？**

每个 Provider 负责一个**独立的功能域**：

| Provider | 职责 |
| --- | --- |
| \`MantineProvider\` | 主题、暗色模式、全局 CSS、CSS 变量生成 |
| \`DatesProvider\` | 日期国际化（locale）、firstDayOfWeek |
| \`ModalsProvider\` | 命令式弹窗（modal.openConfirmModal） |
| \`Notifications\` | 全局通知（notifications.show） |
| \`Spotlight\` | Spotlight 搜索（Cmd+K） |

你可以**只装用到的 Provider**，不装用不到的。

---

## 9.2 MantineProvider 详解

\`\`\`jsx
import { MantineProvider, createTheme, ColorSchemeScript } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'violet',
  defaultRadius: 'md',
  fontFamily: 'Inter, sans-serif',
});

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        {/* ColorSchemeScript 必须在 <head> 里，防止暗色模式闪烁 */}
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
\`\`\`

### MantineProvider 的核心 props

| Prop | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| \`theme\` | \`MantineThemeOverride\` | ❌ | 主题对象 |
| \`defaultColorScheme\` | \`'light' \\| 'dark' \\| 'auto'\` | ✅ | 默认色板方案 |
| \`forceColorScheme\` | \`'light' \\| 'dark'\` | ❌ | 强制覆盖（一般不用） |
| \`colorSchemeManager\` | \`ColorSchemeManager\` | ❌ | 存储色板到 localStorage |
| \`env\` | \`'test' \\| 'production'\` | ❌ | 测试环境会跳过某些动画 |
| \`getStyleElement\` | \`Function\` | ❌ | SSR 时自定义样式注入 |

---

## 9.3 ColorSchemeScript：防闪烁

**问题**：服务端不知道用户偏好的暗色模式，如果服务端渲染亮色、客户端检测到系统是暗色再切到暗色，**会有短暂闪烁（FOUC）**。

**解法**：在 \`<head>\` 里插入 \`ColorSchemeScript\`，**在 React hydrate 之前就根据 localStorage / 系统偏好设置色板**。

\`\`\`jsx
<head>
  <ColorSchemeScript defaultColorScheme="light" />
</head>
\`\`\`

它生成的 HTML 类似：

\`\`\`html
<script>
  try {
    var colorScheme = localStorage.getItem('mantine-color-scheme-value');
    if (colorScheme === null) {
      colorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-mantine-color-scheme', colorScheme);
  } catch (e) {}
</script>
\`\`\`

**这是 Mantine v9 的关键改进**——v7 之前需要手动写脚本，v9 之后 \`ColorSchemeScript\` 自动处理。

---

## 9.4 useMantineTheme vs useMantineCssVariables

\`\`\`jsx
import { useMantineTheme, useMantineCssVariables } from '@mantine/core';

function MyComponent() {
  // 拿到 JS 主题对象（触发重渲染）
  const theme = useMantineTheme();
  console.log(theme.colors.blue[5]);  // '173 148 233'

  // 拿到当前生效的 CSS 变量（不触发重渲染）
  const cssVars = useMantineCssVariables();
  console.log(cssVars['--mantine-color-blue-5']);  // '173 148 233'
}
\`\`\`

**区别**：

- \`useMantineTheme()\`：返回**完整的 MantineTheme 对象**（JS），主题变化时**会触发组件重渲染**。
- \`useMantineCssVariables()\`：返回**当前生效的 CSS 变量键值对**（运行时读取 DOM），主题变化时**不触发重渲染**。

> ⭐ 最佳实践：**用 \`var(--mantine-color-blue-5)\` 而非 \`useMantineTheme()\`**，避免不必要的重渲染。

---

## 9.5 useComputedColorScheme vs useColorScheme

\`\`\`jsx
import { useColorScheme, useComputedColorScheme } from '@mantine/core';

function MyComponent() {
  // 用户偏好（可能是 'auto'）
  const preferred = useColorScheme();
  // 实际生效的色板（解析 'auto' 后）
  const actual = useComputedColorScheme();
}
\`\`\`

**区别**：

- \`useColorScheme()\`：用户**选择的色板偏好**，可能是 \`'light'\` / \`'dark'\` / \`'auto'\`。
- \`useComputedColorScheme()\`：**实际生效的色板**（已解析 \`'auto'\`），只会是 \`'light'\` 或 \`'dark'\`。

---

## 9.6 多 Provider 的嵌套顺序

\`\`\`jsx
<MantineProvider theme={theme}>
  <DatesProvider settings={{ locale: 'zh-cn' }}>
    <ModalsProvider>
      <Notifications position="top-right" />
      <App />
    </ModalsProvider>
  </DatesProvider>
</MantineProvider>
\`\`\`

**注意顺序**：

- \`MantineProvider\` 必须在最外层（其他 Provider 依赖它的主题上下文）。
- \`DatesProvider\` 必须在所有日期组件外层。
- \`ModalsProvider\` / \`Notifications\` / \`Spotlight\` 必须在使用它们的组件外层。

---

## 9.7 自定义 ColorSchemeManager

默认情况下，色板偏好存储在 \`localStorage\`。如果你的项目需要存到 cookie / 服务端，可以用 \`colorSchemeManager\`：

\`\`\`jsx
import { localStorageColorSchemeManager, cookieStorage } from '@mantine/core';

const manager = localStorageColorSchemeManager({
  key: 'my-app-color-scheme',
  get: (key) => {
    // 自定义读取逻辑
    return localStorage.getItem(key);
  },
  set: (key, value) => {
    // 自定义写入逻辑
    localStorage.setItem(key, value);
  },
});

<MantineProvider
  theme={theme}
  defaultColorScheme="auto"
  colorSchemeManager={manager}
>
  <App />
</MantineProvider>
\`\`\`

**实际场景**：

- 想让用户在浏览器关闭后仍保留偏好：用 \`localStorageColorSchemeManager\`（默认）。
- 同一域名多个子应用共享：用 \`cookieStorageColorSchemeManager\`。
- 服务端强制色板：用 \`cookieStorage\` + SSR。

---

## 9.8 Provider 的可访问性传递

\`MantineProvider\` 还自动注入 \`<style>\` 标签，包含**全屏覆盖规则**：

\`\`\`css
html, body {
  margin: 0;
  padding: 0;
  font-family: var(--mantine-font-family);
}

[data-mantine-color-scheme] {
  color-scheme: light;  /* 或 dark */
  /* 让浏览器原生 UI（滚动条、表单）跟随色板 */
}
\`\`\`

**\`color-scheme\` CSS 属性** 告诉浏览器：「当前网页是亮色还是暗色」，浏览器原生 UI（滚动条、\`input\` 的默认样式）会跟随。

---

## 9.9 测试环境的 Provider

\`\`\`jsx
<MantineProvider env="test" theme={theme}>
  <ComponentToTest />
</MantineProvider>
\`\`\`

\`env="test"\` 会跳过：

- 进入动画
- 退出动画
- 某些异步渲染

让单元测试更稳定。

---

## 9.10 小结

- Mantine 的 Provider 分层：**MantineProvider → DatesProvider → ModalsProvider → Notifications**。
- \`ColorSchemeScript\` 在 \`<head>\` 里**防止暗色模式闪烁**。
- \`useMantineTheme()\` 触发重渲染，\`useMantineCssVariables()\` 不触发。
- \`useColorScheme()\` 是用户偏好，\`useComputedColorScheme()\` 是实际生效。
- 自定义 \`colorSchemeManager\` 可以改变色板存储位置（localStorage / cookie）。

> ⭐ 记住：**「MantineProvider 必装，其他 Provider 按需装」**。

下一章我们看主题如何「流」进每个组件。
`,
  },

  // ============================================================
  // 第十章
  // ============================================================
  {
    id: "mantine3-ch10",
    group: "第二部分 架构与设计目的",
    icon: "💧",
    title: "第十章 主题如何「流」进每个组件",
    content: `## 10.1 主题注入的完整流程

\`MantineProvider\` 注入主题的流程：

\`\`\`
1. createTheme() 生成 MantineThemeOverride 对象
         ↓
2. MantineProvider 接收 theme
         ↓
3. useTheme() Hook 合并默认主题 + 用户覆盖
         ↓
4. useMantineTheme() 把完整主题存入 Context
         ↓
5. 编译期 PostCSS 把主题 token 编译为 CSS 变量
         ↓
6. 组件内部用 var(--mantine-color-violet-5) 引用
         ↓
7. 浏览器原生级联
\`\`\`

---

## 10.2 createTheme：主题对象是什么

\`createTheme\` 接受一个对象，返回 **\`MantineThemeOverride\`**：

\`\`\`ts
type MantineThemeOverride = {
  // 颜色
  colors: Record<string, MantineColorsTuple>;  // 10 阶色板
  primaryColor: string;                        // 主色（colors 中的 key）
  primaryShade: { light: number; dark: number };  // 主色阶
  white: string;                               // 白色 token
  black: string;                               // 黑色 token

  // 圆角
  radius: { xs: string; sm: string; md: string; lg: string; xl: string };
  defaultRadius: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  // 间距
  spacing: { xs: string; sm: string; md: string; lg: string; xl: string };

  // 字体
  fontFamily: string;
  fontFamilyMonospace: string;
  headings: {
    fontFamily: string;
    fontWeight: string;
    sizes: {
      h1: { fontSize: string; lineHeight: string; fontWeight?: string };
      h2: { ... };
      h3: { ... };
      h4: { ... };
      h5: { ... };
      h6: { ... };
    };
  };

  // 阴影
  shadows: { xs: string; sm: string; md: string; lg: string; xl: string };

  // 断点
  breakpoints: { xs: string; sm: string; md: string; lg: string; xl: string };

  // 主题级组件覆盖
  components: Record<string, ComponentThemeOverride>;
};
\`\`\`

---

## 10.3 默认主题的值

如果什么都不传，Mantine 用这套默认值：

\`\`\`jsx
// 简化版默认主题
{
  // 24 个预定义色板，每个 10 阶
  colors: {
    blue: ['#e7f5ff', '#d0ebff', '#a5d8ff', '#74c0fc', '#4dabf7', '#339af0', '#228be6', '#1c7ed6', '#1971c2', '#1864ab'],
    red: ['#fff5f5', '#ffe3e3', '#ffc9c9', '#ffa8a8', '#ff8787', '#ff6b6b', '#fa5252', '#f03e3e', '#e03131', '#c92a2a'],
    green: [...],
    violet: [...],
    // ... 21 个其他色板
  },
  primaryColor: 'blue',  // 默认蓝色
  primaryShade: { light: 6, dark: 8 },

  // 5 档圆角
  radius: { xs: '2px', sm: '4px', md: '8px', lg: '16px', xl: '32px' },
  defaultRadius: 'sm',

  // 5 档间距
  spacing: { xs: '10px', sm: '12px', md: '16px', lg: '20px', xl: '32px' },

  // 字体
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2.125rem', lineHeight: '1.3' },
      h2: { fontSize: '1.625rem', lineHeight: '1.35' },
      // ...
    },
  },

  // 5 档阴影
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    // ...
  },

  // 5 个断点
  breakpoints: { xs: '36em', sm: '48em', md: '62em', lg: '75em', xl: '88em' },
}
\`\`\`

---

## 10.4 主题合并机制

\`createTheme\` 的实现是**浅合并**（一层）：

\`\`\`ts
function createTheme(overrides: MantineThemeOverride): MantineTheme {
  const base = defaultTheme;

  // 1. 浅合并主对象
  const merged = { ...base, ...overrides };

  // 2. 深合并 colors
  if (overrides.colors) {
    merged.colors = { ...base.colors, ...overrides.colors };
  }

  // 3. 深合并 radius / spacing / shadows
  if (overrides.radius) {
    merged.radius = { ...base.radius, ...overrides.radius };
  }

  // 4. 深合并 headings.sizes
  if (overrides.headings?.sizes) {
    merged.headings = {
      ...base.headings,
      ...overrides.headings,
      sizes: { ...base.headings.sizes, ...overrides.headings.sizes },
    };
  }

  // 5. 合并 components
  if (overrides.components) {
    merged.components = { ...base.components, ...overrides.components };
  }

  return merged;
}
\`\`\`

**这意味着**：

- 不传 \`colors\` → 用 24 个预定义色板。
- 传 \`colors: { brand: [...] }\` → **新增** \`brand\`，不覆盖 24 个预定义色板。
- 传 \`colors: { blue: [...] }\` → **覆盖** blue 色板，其他 23 个保留。

---

## 10.5 组件级主题覆盖详解

\`components\` 配置允许你修改**任意组件的默认行为**：

\`\`\`jsx
const theme = createTheme({
  components: {
    Button: {
      defaultProps: {
        // 全局 Button 默认 size
        size: 'md',
        // 全局 Button 默认 radius
        radius: 'xl',
      },
      classNames: {
        // 全局 Button 应用额外 className
        root: 'my-app-button',
      },
      styles: (theme) => ({
        // 全局 Button 样式
        root: {
          fontWeight: 700,
          textTransform: 'uppercase',
        },
      }),
      vars: (theme, params) => ({
        // 全局 Button CSS 变量
        root: {
          '--button-height': params.size === 'sm' ? '32px' : '40px',
        },
      }),
    },
  },
});
\`\`\`

**四个子配置的作用**：

| 子配置 | 作用 | 时机 |
| --- | --- | --- |
| \`defaultProps\` | 全局默认 props | 每次 render |
| \`classNames\` | 额外 className | 编译期合并 |
| \`styles\` | 额外样式 | runtime 合并 |
| \`vars\` | 额外 CSS 变量 | runtime 注入 |

---

## 10.6 主题的「优先级链」

当用户写：

\`\`\`jsx
<Button color="red" radius="xl" styles={{ root: { fontWeight: 700 } }}>
  按钮
</Button>
\`\`\`

最终生效的样式来自（**优先级从低到高**）：

1. **Mantine 默认主题**：color 不指定时默认 blue。
2. **\`MantineProvider\` 的 \`theme.components.Button.defaultProps\`**：比如这里可以设 \`size: 'md'\`。
3. **\`theme.components.Button.styles\`**：比如这里可以设 \`fontWeight: 400\`。
4. **组件实例 props**：color="red" 覆盖主题默认值。
5. **组件实例 styles**：\`{ root: { fontWeight: 700 } }\` 覆盖主题 styles。
6. **CSS 优先级**（最后一个胜出）：emotion 插入的样式 vs 主题的样式。

**核心原则**：**越具体的覆盖越优先**。

---

## 10.7 主题切换的渲染流程

当你调用 \`setColorScheme('dark')\` 时：

\`\`\`
1. setColorScheme() 触发 useState 更新
       ↓
2. MantineProvider 重新计算 children
       ↓
3. <html data-mantine-color-scheme="dark"> 属性更新
       ↓
4. CSS 变量在 [data-mantine-color-scheme="dark"] 选择器下重新计算
       ↓
5. 浏览器原生级联应用到所有子元素
       ↓
6. 组件视觉更新，**React 不参与**
\`\`\`

**关键**：步骤 2-3 触发的 React 重渲染**只渲染 MantineProvider 自己**，不会重渲染子组件树（因为 React 默认不会重渲染 Context 子树，除非 useContext 订阅了变化）。

---

## 10.8 主题调试技巧

### 技巧 1：在 DevTools 里查看所有 CSS 变量

\`\`\`js
// 浏览器控制台
const root = document.documentElement;
const styles = getComputedStyle(root);
const vars = Array.from(document.styleSheets[0].cssRules)
  .map(rule => rule.cssText)
  .filter(text => text.includes('--mantine-'));
console.log(vars.slice(0, 20));
\`\`\`

### 技巧 2：用 \`<DebugTheme>\` 组件可视化

\`\`\`jsx
import { useMantineTheme } from '@mantine/core';

function DebugTheme() {
  const theme = useMantineTheme();
  return (
    <details>
      <summary>当前主题</summary>
      <pre>{JSON.stringify({
        primaryColor: theme.primaryColor,
        primaryShade: theme.primaryShade,
        defaultRadius: theme.defaultRadius,
        spacing: theme.spacing,
        radius: theme.radius,
        // 隐藏 colors / components 避免输出过大
      }, null, 2)}</pre>
    </details>
  );
}
\`\`\`

### 技巧 3：临时禁用某个 CSS 变量

\`\`\`js
// 在控制台
document.documentElement.style.setProperty('--mantine-color-violet-5', '255 0 0');
// 立即看到效果，不改代码
\`\`\`

---

## 10.9 主题与子主题（sub-theme）

Mantine 9 没有原生的子主题 API，但你可以用 \`createTheme\` + 多 \`MantineProvider\` 嵌套：

\`\`\`jsx
function App() {
  return (
    <MantineProvider theme={mainTheme}>
      <Header />
      <MantineProvider theme={darkSectionTheme}>
        <DarkSection />
      </MantineProvider>
      <MantineProvider theme={lightSectionTheme}>
        <LightSection />
      </MantineProvider>
    </MantineProvider>
  );
}
\`\`\`

**注意**：内层 \`MantineProvider\` 会**继承外层的色板方案**（如果没显式设 \`defaultColorScheme\`），但**会覆盖主题 token**。

---

## 10.10 小结

- 主题注入流程：**createTheme → MantineProvider → Context → 编译期 CSS 变量 → 浏览器原生级联**。
- 主题合并是**浅合并 + 深合并**（colors / radius / spacing / headings.sizes 走深合并）。
- 组件级覆盖有 **4 个子配置**：defaultProps、classNames、styles、vars。
- 优先级链：**默认主题 < 主题 components 配置 < 组件实例 props/styles**。
- 主题切换**只重渲染 MantineProvider 自身**，子组件树不重渲染。

> ⭐ 记住：**「主题是 CSS 变量层，组件订阅 Context，React 重渲染范围最小」**。

下一章我们看响应式系统。
`,
  },

  // ============================================================
  // 第十一章
  // ============================================================
  {
    id: "mantine3-ch11",
    group: "第二部分 架构与设计目的",
    icon: "📐",
    title: "第十一章 响应式系统：媒体查询 vs 容器查询",
    content: `## 11.1 响应式断点

Mantine 的响应式系统基于 **5 个断点**：

| 断点 | 默认值 | 范围 |
| --- | --- | --- |
| \`xs\` | 36em (576px) | 0 - 575px |
| \`sm\` | 48em (768px) | 576px - 767px |
| \`md\` | 62em (992px) | 768px - 991px |
| \`lg\` | 75em (1200px) | 992px - 1199px |
| \`xl\` | 88em (1408px) | 1200px 及以上 |

**自定义断点**：

\`\`\`jsx
const theme = createTheme({
  breakpoints: {
    xs: '30em',  // 480px
    sm: '48em',  // 768px
    md: '64em',  // 1024px
    lg: '74em',  // 1184px
    xl: '90em',  // 1440px
  },
});
\`\`\`

---

## 11.2 三种响应式 API

### API 1：object 语法

\`\`\`jsx
<TextInput
  size={{ base: 'sm', md: 'md', lg: 'lg' }}
  label={{ base: '姓名', md: '请输入您的姓名' }}
/>
\`\`\`

**含义**：

- \`base\`：默认（所有断点）。
- \`md\`：md 断点及以上（≥ 992px）。
- \`lg\`：lg 断点及以上（≥ 1200px）。

### API 2：visibleFrom / hiddenFrom

\`\`\`jsx
<Box visibleFrom="sm" hiddenFrom="md">
  我在 sm 到 md 之间显示
</Box>
\`\`\`

**用途**：在某些断点显示 / 隐藏整个元素。

### API 3：style props 数组

\`\`\`jsx
<Box
  p={['xs', 'sm', 'md', 'lg', 'xl']}
  // xs 断点: 10px
  // sm 断点: 12px
  // md 断点: 16px
  // lg 断点: 20px
  // xl 断点: 32px
/>
\`\`\`

**数组顺序**：xs, sm, md, lg, xl（按断点从小到大）。

---

## 11.3 底层实现：媒体查询

Mantine 的响应式 API 底层是 **CSS 媒体查询**：

\`\`\`css
/* 编译后的 CSS */
@media (min-width: 36em) {
  .mantine-Box-root {
    padding: var(--mantine-spacing-xs);
  }
}

@media (min-width: 48em) {
  .mantine-Box-root {
    padding: var(--mantine-spacing-sm);
  }
}

@media (min-width: 62em) {
  .mantine-Box-root {
    padding: var(--mantine-spacing-md);
  }
}

/* ... */
\`\`\`

**注意**：

- Mantine 用 \`min-width\` 媒体查询（mobile-first）。
- 不支持 \`max-width\` 媒体查询（要靠 reverse 思维）。

---

## 11.4 useMediaQuery Hook

\`\`\`jsx
import { useMediaQuery } from '@mantine/hooks';

function MyComponent() {
  // 当视口宽度 >= 768px 时返回 true
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <div>
      {isDesktop ? <DesktopNav /> : <MobileNav />}
    </div>
  );
}
\`\`\`

**useMediaQuery 特点**：

- 基于 \`window.matchMedia\` API。
- 视口变化时自动更新（订阅媒体查询）。
- SSR 友好（服务端返回 false，客户端 hydrate 后再更新）。

**自定义断点**：

\`\`\`jsx
import { useMantineTheme, useMediaQuery } from '@mantine/core';

function MyComponent() {
  const theme = useMantineTheme();
  // 用 Mantine 主题的断点
  const isMd = useMediaQuery(\`(min-width: \${theme.breakpoints.md})\`);
}
\`\`\`

---

## 11.5 useContainerQuery Hook

**问题**：媒体查询只能基于**视口宽度**，但有时候你想基于**父容器宽度**响应式。

例如：父容器宽度 < 600px 时显示移动端布局，> 600px 时显示桌面端布局。视口宽度不能决定，因为父容器可能只占视口的一部分。

\`\`\`jsx
import { useContainerQuery } from '@mantine/hooks';

function MyComponent() {
  const [ref, largerThan600] = useContainerQuery();
  // 当 ref 指向的容器宽度 >= 600px 时返回 true

  return (
    <div ref={ref}>
      {largerThan600 ? <DesktopLayout /> : <MobileLayout />}
    </div>
  );
}
\`\`\`

**底层实现**：

\`\`\`jsx
// 简化版 useContainerQuery
function useContainerQuery() {
  const ref = useRef(null);
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      // 容器宽度 >= 600px ? 满足
      setMatches(entry.contentRect.width >= 600);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, matches];
}
\`\`\`

**应用场景**：

- Dashboard 卡片：父容器宽度不同，布局不同。
- 侧边栏：父容器 < 某宽度时折叠。
- 嵌入式组件：在不同容器中自适应。

---

## 11.6 响应式设计模式

### 模式 1：mobile-first

\`\`\`jsx
// 移动端是默认，逐渐增加桌面端样式
<Box
  p="xs"               // 移动端：10px
  fontSize="sm"        // 移动端：14px
  visibleFrom="md"     // 桌面端才显示
>
  ...
</Box>
\`\`\`

### 模式 2：desktop-first（反推）

如果你先做桌面端，再适配移动端：

\`\`\`jsx
// 桌面端是默认，移动端用 hiddenFrom
<Box
  p="md"              // 桌面端：16px
  fontSize="md"       // 桌面端：16px
  hiddenFrom="md"     // 移动端隐藏
>
  ...
</Box>
\`\`\`

### 模式 3：组件级响应式

\`\`\`jsx
<Group
  gap="xs"
  wrap="wrap"
  justify={{ base: 'flex-start', md: 'space-between' }}
>
  <Button size={{ base: 'xs', md: 'md' }}>小屏紧凑</Button>
  <Button size={{ base: 'xs', md: 'md' }}>小屏紧凑</Button>
</Group>
\`\`\`

---

## 11.7 SimpleGrid 响应式网格

\`SimpleGrid\` 是最常用的响应式布局组件：

\`\`\`jsx
import { SimpleGrid } from '@mantine/core';

<SimpleGrid
  cols={{ base: 1, xs: 2, sm: 3, md: 4, lg: 6 }}
  spacing={{ base: 'xs', md: 'md' }}
  verticalSpacing={{ base: 'xs', md: 'md' }}
>
  <Card>1</Card>
  <Card>2</Card>
  <Card>3</Card>
  <Card>4</Card>
  <Card>5</Card>
  <Card>6</Card>
</SimpleGrid>
\`\`\`

**cols 对象**：

- \`base: 1\`：移动端 1 列。
- \`xs: 2\`：xs 断点起 2 列。
- \`sm: 3\`：sm 断点起 3 列。
- \`md: 4\`：md 断点起 4 列。
- \`lg: 6\`：lg 断点起 6 列。

**底层**：用 CSS Grid + \`grid-template-columns: repeat(N, 1fr)\` + 媒体查询。

---

## 11.8 性能考虑

### 媒体查询 vs JS 监听

| 维度 | 媒体查询 | JS 监听（useMediaQuery） |
| --- | --- | --- |
| 性能 | 浏览器原生级联，零 JS 开销 | 需要订阅媒体查询，**有 JS 开销** |
| 初次渲染 | SSR 时静态生成 | SSR 时返回 false，hydrate 后更新 |
| 适用场景 | 样式切换 | 布局切换（不同组件） |

**最佳实践**：

- **样式切换**（如大小、间距）→ 用媒体查询（\`size={{ base: 'xs', md: 'md' }}\`）。
- **布局切换**（如不同组件）→ 用 \`useMediaQuery\` 或 \`visibleFrom\`。

### 容器查询 vs 媒体查询

| 维度 | 媒体查询 | 容器查询 |
| --- | --- | --- |
| 基于 | 视口 | 父容器 |
| 浏览器支持 | 全面 | Chrome 105+ / Safari 16+ |
| 适用场景 | 整页响应式 | 组件级响应式 |

Mantine 的 \`useContainerQuery\` 内部用 \`ResizeObserver\`，**不受浏览器容器查询支持度限制**。

---

## 11.9 实战：构建响应式 Dashboard

\`\`\`jsx
import { AppShell, SimpleGrid, Card, Title, Group, Button } from '@mantine/core';

function Dashboard() {
  return (
    <AppShell padding="md">
      <AppShell.Main>
        <Group justify="space-between" mb="md">
          <Title order={2}>Dashboard</Title>
          <Button size={{ base: 'xs', sm: 'md' }}>新增</Button>
        </Group>

        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 4 }}
          spacing="md"
          mb="md"
        >
          <Card>卡片 1</Card>
          <Card>卡片 2</Card>
          <Card>卡片 3</Card>
          <Card>卡片 4</Card>
        </SimpleGrid>

        <SimpleGrid
          cols={{ base: 1, md: 2 }}
          spacing="md"
        >
          <Card>左侧大图</Card>
          <Card>右侧表格</Card>
        </SimpleGrid>
      </AppShell.Main>
    </AppShell>
  );
}
\`\`\`

**响应式行为**：

- 移动端：1 列，按钮紧凑。
- 平板：4 卡片 2 列，2 大卡片 1 列。
- 桌面：4 卡片 4 列，2 大卡片 2 列。

---

## 11.10 小结

- Mantine 的 5 个断点：**xs(576px)、sm(768px)、md(992px)、lg(1200px)、xl(1408px)**。
- 三种响应式 API：**object 语法、visibleFrom/hiddenFrom、style props 数组**。
- 媒体查询 vs 容器查询：**视口级用媒体查询，组件级用 useContainerQuery**。
- \`SimpleGrid\` 是响应式网格的首选。

> ⭐ 记住：**「mobile-first + min-width 媒体查询 + 5 档断点」是 Mantine 响应式的核心模型**。

下一章我们看暗色模式的实现原理。
`,
  },

  // ============================================================
  // 第十二章
  // ============================================================
  {
    id: "mantine3-ch12",
    group: "第二部分 架构与设计目的",
    icon: "🌙",
    title: "第十二章 暗色模式的实现原理",
    content: `## 12.1 暗色模式的三种状态

Mantine 的暗色模式有 **3 个状态**：

| 状态 | 含义 |
| --- | --- |
| \`'light'\` | 强制亮色 |
| \`'dark'\` | 强制暗色 |
| \`'auto'\` | 跟随系统（\`prefers-color-scheme: dark\`） |

\`\`\`jsx
<MantineProvider defaultColorScheme="auto">
  <App />
</MantineProvider>
\`\`\`

**auto 的妙处**：

- 用户没设偏好 → 跟随系统。
- 用户手动切换 → 记住用户偏好，覆盖系统。
- 用户清除浏览器数据 → 重新跟随系统。

---

## 12.2 底层实现：data 属性 + CSS 变量

Mantine 的暗色模式**完全基于 CSS 变量 + data 属性**：

\`\`\`html
<!-- 亮色模式 -->
<html data-mantine-color-scheme="light">

<!-- 暗色模式 -->
<html data-mantine-color-scheme="dark">
\`\`\`

\`\`\`css
/* 亮色：默认色板 */
:root {
  --mantine-color-violet-5: 173 148 233;
  --mantine-color-violet-8: 100 53 198;
}

/* 暗色：色板反转 */
[data-mantine-color-scheme="dark"] {
  --mantine-color-violet-5: 173 148 233;  /* 某些颜色保持 */
  --mantine-color-violet-8: 151 119 225;  /* 但 8 阶是 hover 色，需要提亮 */
  --mantine-color-gray-0: 26 27 30;       /* 背景色：深色 */
  --mantine-color-gray-9: 241 243 245;    /* 文字色：浅色 */
}
\`\`\`

**关键观察**：

- 暗色模式**不是简单的颜色反转**。
- 每个色板在 light / dark 下有不同的色阶选择。
- 这就是为什么 Mantine 的暗色模式视觉**看起来舒服**——不是简单 \`invert(1)\`。

---

## 12.3 暗色模式切换流程

\`\`\`
用户点击「切换暗色」按钮
       ↓
toggleColorScheme() 被调用
       ↓
useColorScheme.setState('dark')
       ↓
MantineProvider 重新计算（只重渲染 Provider 自身）
       ↓
document.documentElement.setAttribute('data-mantine-color-scheme', 'dark')
       ↓
CSS 变量在 [data-mantine-color-scheme="dark"] 下重新计算
       ↓
浏览器原生级联应用到所有子元素
       ↓
视觉更新，**React 子树不重渲染**
\`\`\`

**性能关键**：

- 1000 个 Button 切换暗色：**< 5ms**。
- React DevTools Profiler 显示**零组件重渲染**。
- 这是 CSS 变量层的最大优势。

---

## 12.4 切换暗色的代码

### 基础用法

\`\`\`jsx
import { useMantineColorScheme, ActionIcon, Tooltip } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

function ThemeToggle() {
  // useMantineColorScheme 返回 { colorScheme, setColorScheme, clearColorScheme, toggleColorScheme }
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Tooltip label={colorScheme === 'dark' ? '亮色' : '暗色'}>
      <ActionIcon onClick={toggleColorScheme}>
        {colorScheme === 'dark' ? <IconSun /> : <IconMoon />}
      </ActionIcon>
    </Tooltip>
  );
}
\`\`\`

### 高级用法：手动控制

\`\`\`jsx
function ThemeControl() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <SegmentedControl
      value={colorScheme}
      onChange={setColorScheme}
      data={[
        { label: '亮色', value: 'light' },
        { label: '暗色', value: 'dark' },
        { label: '自动', value: 'auto' },
      ]}
    />
  );
}
\`\`\`

---

## 12.5 SSR 防闪烁：ColorSchemeScript

**问题**：服务端不知道用户偏好的暗色模式。

- 服务端渲染：\`data-mantine-color-scheme="light"\`。
- 客户端 hydrate：检查 localStorage，可能是 \`dark\`。
- 如果不处理：用户看到亮色 → 短暂闪烁 → 暗色。

**解法**：在 \`<head>\` 里插入 \`ColorSchemeScript\`，**在 React hydrate 之前**就设置好 \`data-mantine-color-scheme\`。

\`\`\`jsx
import { ColorSchemeScript } from '@mantine/core';

<head>
  <ColorSchemeScript defaultColorScheme="light" />
</head>
\`\`\`

**它做了什么**：

1. 读取 localStorage（\`mantine-color-scheme-value\`）。
2. 如果是 \`null\`，读 \`window.matchMedia('(prefers-color-scheme: dark)')\`。
3. 设置 \`document.documentElement.setAttribute('data-mantine-color-scheme', ...)\`。
4. 这一切在 React hydrate **之前**就完成。

---

## 12.6 暗色模式下的主题覆盖

### 自定义暗色色板

\`\`\`jsx
const theme = createTheme({
  primaryColor: 'violet',
  primaryShade: {
    light: 6,   // 亮色模式用 6 阶
    dark: 4,    // 暗色模式用 4 阶（更亮）
  },
  colors: {
    violet: [
      // 0-9 阶（用于亮色模式）
      '#f3f0ff', '#e5d4ff', '#d0b0ff', '#b88aff', '#9d63ff',
      '#7c3aed', '#5b21b6', '#491a94', '#3b1372', '#1e0a3d',
      // 暗色模式自动反转（Mantine Color Generator 处理）
    ],
  },
});
\`\`\`

### 自定义暗色背景

\`\`\`jsx
const theme = createTheme({
  // 全局背景：暗色模式用深色
  other: {
    background: {
      light: 'var(--mantine-color-white)',
      dark: 'var(--mantine-color-dark-7)',  // Mantine 自带的深色背景
    },
  },
});
\`\`\`

---

## 12.7 颜色方案的内部色板

Mantine 内部预定义了 10 个 dark-* 色阶：

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
<Card style={{ background: 'var(--mantine-color-dark-7)' }}>
  ...
</Card>

// 亮色模式下的卡片背景
<Card style={{ background: 'var(--mantine-color-white)' }}>
  ...
</Card>

// 自动适配：var(--mantine-color-body) 在 light / dark 下自动切换
<Card style={{ background: 'var(--mantine-color-body)' }}>
  ...
</Card>
\`\`\`

**Mantine 内部颜色**：

| 变量 | 亮色 | 暗色 |
| --- | --- | --- |
| \`--mantine-color-body\` | \`--mantine-color-white\` | \`--mantine-color-dark-8\` |
| \`--mantine-color-text\` | \`--mantine-color-black\` | \`--mantine-color-white\` |
| \`--mantine-color-default-border\` | \`--mantine-color-gray-3\` | \`--mantine-color-dark-4\` |
| \`--mantine-color-default\` | \`--mantine-color-white\` | \`--mantine-color-dark-6\` |
| \`--mantine-color-default-hover\` | \`--mantine-color-gray-0\` | \`--mantine-color-dark-5\` |

**\`var(--mantine-color-body)\` 是万能背景色**——自动适配亮/暗色。

---

## 12.8 暗色模式下的图片

\`\`\`jsx
// 用 <picture> 元素 + prefers-color-scheme
<picture>
  <source srcSet="/logo-dark.png" media="(prefers-color-scheme: dark)" />
  <img src="/logo-light.png" alt="logo" />
</picture>
\`\`\`

或者用 Mantine 的 \`useComputedColorScheme\`：

\`\`\`jsx
function Logo() {
  const colorScheme = useComputedColorScheme();
  return <img src={colorScheme === 'dark' ? '/logo-dark.png' : '/logo-light.png'} alt="logo" />;
}
\`\`\`

---

## 12.9 暗色模式的可访问性

### WCAG 对比度

Mantine 的暗色色板**自动满足 WCAG AA 标准**（对比度 ≥ 4.5:1）。

\`\`\`jsx
// 检查对比度
import { readableColor } from '@mantine/hooks';

// readableColor 接受一个背景色，返回最合适的文字色（黑或白）
const textColor = readableColor('#7c3aed');  // 'white'
\`\`\`

### prefers-reduced-motion

暗色模式切换有动画，但**尊重用户的 prefers-reduced-motion 设置**：

\`\`\`css
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
  }
}
\`\`\`

---

## 12.10 暗色模式的常见坑

### 坑 1：忘记 \`ColorSchemeScript\`

\`\`\`jsx
// ❌ 没 ColorSchemeScript：暗色模式会闪烁
<head></head>
<body>
  <MantineProvider defaultColorScheme="auto">
    <App />
  </MantineProvider>
</body>

// ✅ 有 ColorSchemeScript：零闪烁
<head>
  <ColorSchemeScript defaultColorScheme="light" />
</head>
<body>
  <MantineProvider defaultColorScheme="auto">
    <App />
  </MantineProvider>
</body>
\`\`\`

### 坑 2：硬编码颜色

\`\`\`jsx
// ❌ 硬编码白色背景：暗色模式下惨白
<Box style={{ background: 'white' }}>...</Box>

// ✅ 用 var()：自动适配
<Box style={{ background: 'var(--mantine-color-body)' }}>...</Box>
\`\`\`

### 坑 3：图表、地图用错色

图表库（recharts、chart.js）的颜色**不跟随 Mantine 主题**，需要手动适配：

\`\`\`jsx
import { useComputedColorScheme } from '@mantine/core';

function MyChart() {
  const colorScheme = useComputedColorScheme();
  const axisColor = colorScheme === 'dark' ? '#fff' : '#000';
  // 传给 recharts
  return <LineChart data={data} stroke={axisColor} />;
}
\`\`\`

> ⚠️ 这不是 Mantine 的问题——任何「主题」库都有这个问题，**图表颜色需要你手动映射**。

---

## 12.11 小结

- Mantine 暗色模式基于 **\`data-mantine-color-scheme\` 属性 + CSS 变量**。
- 切换暗色**只重渲染 MantineProvider 自身**，不触发子组件重渲染。
- \`ColorSchemeScript\` 必须放在 \`<head>\` 里防止闪烁。
- 暗色色板**不是简单反转**，每个色阶针对暗色优化。
- 业务代码用 \`var(--mantine-color-body)\` 等内部色，自动适配。

> ⭐ 记住：**「暗色模式 = data 属性 + CSS 变量，零 React 重渲染」**。

下一章我们看 SSR 与 RSC 兼容性。
`,
  },

  // ============================================================
  // 第十三章
  // ============================================================
  {
    id: "mantine3-ch13",
    group: "第二部分 架构与设计目的",
    icon: "🚀",
    title: "第十三章 SSR 与 RSC 兼容性",
    content: `## 13.1 Mantine v9 的 SSR 模型

Mantine v9 完全支持 **Next.js 16 App Router + Server Components**。

**关键约束**：

- Mantine 组件是**客户端组件**（依赖 emotion + context）。
- 必须加 \`"use client"\` 或者在客户端组件里使用。
- 服务端组件**不能直接使用** Mantine 组件，但可以**渲染**它们。

---

## 13.2 推荐的 Next.js 16 项目结构

\`\`\`
app/
├── layout.tsx          # 服务端组件，定义 <html> <head> <body>
├── page.tsx            # 服务端组件，业务页面
├── providers.tsx       # 客户端组件，包含所有 Mantine Provider
└── globals.css         # 全局 CSS
\`\`\`

### layout.tsx（服务端组件）

\`\`\`tsx
import '@mantine/core/styles.css';
import './globals.css';

import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { Providers } from './providers';

export const metadata = {
  title: 'My App',
  description: 'Mantine v9 + Next.js 16',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // mantineHtmlProps 包含 suppressHydrationWarning + data-mantine-color-scheme 等
    <html lang="zh-CN" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
\`\`\`

### providers.tsx（客户端组件）

\`\`\`tsx
'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
  primaryColor: 'violet',
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <DatesProvider settings={{ locale: 'zh-cn' }}>
        <ModalsProvider>
          <Notifications position="top-right" />
          {children}
        </ModalsProvider>
      </DatesProvider>
    </MantineProvider>
  );
}
\`\`\`

### page.tsx（服务端组件，渲染 Mantine）

\`\`\`tsx
// 服务端组件，可以直接渲染客户端组件
import { Button } from '@mantine/core';

export default function HomePage() {
  return (
    <div>
      <h1>Hello Mantine</h1>
      {/* Button 是 'use client' 组件，可以从服务端组件里渲染 */}
      <Button>点我</Button>
    </div>
  );
}
\`\`\`

---

## 13.3 mantineHtmlProps

\`mantineHtmlProps\` 包含 SSR 需要的属性：

\`\`\`ts
{
  suppressHydrationWarning: true,  // 防止 Mantine 在 SSR 时修改 <html> 触发警告
  'data-mantine-color-scheme': 'auto',  // 默认色板
}
\`\`\`

**为什么要 \`suppressHydrationWarning\`？**

因为 \`ColorSchemeScript\` 会在 hydrate 之前修改 \`<html>\` 的 \`data-mantine-color-scheme\` 属性，React 会认为这是 hydration mismatch。加 \`suppressHydrationWarning\` 告诉 React：**「我知道这个属性会变，忽略警告」**。

---

## 13.4 服务端组件不能做的事

### ❌ 不能用 useState / useEffect

\`\`\`tsx
// ❌ 服务端组件不能这样写
export default function Page() {
  const [opened, setOpened] = useState(false);  // 报错
  return <Modal opened={opened}>...</Modal>;
}
\`\`\`

### ❌ 不能用 Mantine Hooks

\`\`\`tsx
// ❌ useDisclosure 是客户端 hook
import { useDisclosure } from '@mantine/core';

export default function Page() {
  const [opened, { open }] = useDisclosure();  // 报错
  return <Button onClick={open}>打开</Button>;
}
\`\`\`

### ❌ 不能在 onClick 里直接传函数

\`\`\`tsx
// ❌ 服务端组件不能传事件处理器
export default function Page() {
  return <Button onClick={() => alert('hi')}>点我</Button>;  // 报错
}
\`\`\`

### ✅ 解法：包一层客户端组件

\`\`\`tsx
// page.tsx（服务端）
import { ClientButton } from './ClientButton';

export default function Page() {
  return <ClientButton />;
}

// ClientButton.tsx（客户端）
'use client';

import { Button } from '@mantine/core';
import { useState } from 'react';

export function ClientButton() {
  const [count, setCount] = useState(0);
  return <Button onClick={() => setCount(count + 1)}>点击 {count} 次</Button>;
}
\`\`\`

---

## 13.5 服务端数据 + 客户端交互的混合模式

\`\`\`tsx
// page.tsx（服务端，从数据库取数据）
import { Card } from '@mantine/core';
import { LikeButton } from './LikeButton';
import { db } from './db';

export default async function PostPage({ params }: { params: { id: string } }) {
  // 服务端可以直接 await
  const post = await db.posts.findUnique({ where: { id: params.id } });

  return (
    <Card>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      {/* 客户端组件：处理点赞交互 */}
      <LikeButton postId={post.id} initialLikes={post.likes} />
    </Card>
  );
}

// LikeButton.tsx（客户端）
'use client';

import { Button } from '@mantine/core';
import { useState } from 'react';

export function LikeButton({ postId, initialLikes }: { postId: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  return (
    <Button onClick={() => {
      fetch(\`/api/posts/\${postId}/like\`, { method: 'POST' });
      setLikes(likes + 1);
    }}>
      点赞 {likes}
    </Button>
  );
}
\`\`\`

**这是 Next.js 16 推荐模式**：

- 服务端组件处理**数据获取 + 静态渲染**。
- 客户端组件处理**交互 + 状态**。
- Mantine 组件（Button、Card）可以在两端都使用。

---

## 13.6 Server Action 模式

Next.js 16 的 Server Actions 可以**直接在服务端组件里处理表单提交**：

\`\`\`tsx
// page.tsx（服务端）
import { Container, Title, TextInput, Button, Stack } from '@mantine/core';
import { revalidatePath } from 'next/cache';

async function createPost(formData: FormData) {
  'use server';
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  await db.posts.create({ data: { title, content } });
  revalidatePath('/posts');
}

export default function NewPostPage() {
  return (
    <Container>
      <Title>新建文章</Title>
      <form action={createPost}>
        <Stack>
          <TextInput name="title" label="标题" required />
          <TextInput name="content" label="内容" required />
          <Button type="submit">发布</Button>
        </Stack>
      </form>
    </Container>
  );
}
\`\`\`

**注意**：这里没用 \`useForm\`，因为没有客户端校验需求。如果需要客户端校验，可以混用 \`useForm\` + Server Action。

---

## 13.7 Mantine 与 RSC 的未来

**当前状态**（v9）：

- Mantine 组件都是 \`'use client'\`。
- 服务端组件可以**渲染**它们，但不能**写客户端逻辑**。
- Provider 树必须在客户端组件里。

**演进方向**：

- Mantine 团队在考虑把**纯展示组件**（Text、Title、Box）改成 \`'use server'\`。
- 复杂组件（Modal、Menu、useForm）保持客户端。
- 长期来看，Mantine 会支持**「Server Component 优先 + Client Component 兜底」**的模型。

---

## 13.8 Vite + React Router 的 SSR

如果不使用 Next.js，而是 Vite + React Router + 自定义 SSR（如 Express）：

\`\`\`tsx
// server.tsx（Node.js 服务端）
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <YourRoutes />
    </MantineProvider>
  );
}

app.get('*', (req, res) => {
  // 服务端不直接调用 MantineProvider（会注入 emotion 样式，复杂）
  // 一般用 renderToReadableStream + Emotion Cache
  // 详见官方文档：https://mantine.dev/guides/next/
});
\`\`\`

**推荐**：用 Next.js App Router，Mantine v9 与它兼容性最好。

---

## 13.9 RSC 边界：哪些 Mantine 组件可以跨边界

\`\`\`tsx
// 服务端组件
import { Button, TextInput, Title, Card, Stack } from '@mantine/core';
import { ClientForm } from './ClientForm';

export default function Page() {
  return (
    <Stack>
      {/* ✅ 这些纯展示组件可以在服务端直接渲染 */}
      <Title>Hello</Title>
      <TextInput label="姓名" />
      <Button>提交</Button>

      {/* ⚠️ 这些组件虽然可以在服务端渲染，但 onClick 传不过去 */}
      <Button onClick={() => alert('hi')}>点我</Button>  // ❌ 报错

      {/* ✅ 解决：包一层客户端组件 */}
      <ClientForm />
    </Stack>
  );
}
\`\`\`

**判断标准**：

- 如果组件**没有 onClick / useState / Hooks** → 服务端组件可以直接渲染。
- 如果组件**有交互** → 必须包客户端组件。

---

## 13.10 性能优化：lazy load Mantine

Mantine 全部组件在一起约 70KB gzipped。对于**首屏不重要的页面**，可以懒加载：

\`\`\`tsx
// 用 next/dynamic 懒加载
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@mantine/charts').then(m => m.LineChart), {
  ssr: false,
  loading: () => <Skeleton h={300} />,
});

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyChart data={data} />
    </div>
  );
}
\`\`\`

**何时懒加载**：

- 首屏**不渲染**的组件（如弹窗的内容、设置面板）。
- **很重**的组件（图表、富文本）。
- 不常用**的 Provider**（如 \`@mantine/spotlight\` 的 Spotlight）。

---

## 13.11 小结

- Mantine v9 完全支持 **Next.js 16 App Router + RSC**。
- **layout.tsx 用服务端组件**，**providers.tsx 用客户端组件**。
- \`ColorSchemeScript\` + \`mantineHtmlProps\` 必须放在 \`<head>\` 里。
- 服务端组件可以**渲染** Mantine 组件，但不能**写客户端逻辑**。
- Server Actions 适合**纯提交**，客户端 useForm 适合**复杂校验**。
- 不重要的组件用 \`next/dynamic\` 懒加载。

> ⭐ 记住：**「layout 服务端 + providers 客户端 + 业务组件按需选择」**是 Mantine v9 + Next.js 16 的最佳实践。

---

## 第二部分总结

到这里，我们已经讲完了 Mantine 的架构与设计目的：

- 第七章：CSS 变量层（性能 + SSR + 调试三优势）
- 第八章：emotion + style props（CSS 变量 vs runtime 计算的分工）
- 第九章：Provider 机制（5 个 Provider 树）
- 第十章：主题注入流程（createTheme → Context → CSS 变量 → 浏览器级联）
- 第十一章：响应式系统（5 档断点 + 三种 API + 容器查询）
- 第十二章：暗色模式（data 属性 + CSS 变量 + 零重渲染）
- 第十三章：SSR 与 RSC（layout 服务端 + providers 客户端）

接下来进入**第三部分：Theme 主题系统**，我们深入 createTheme、颜色、暗色、CSS 变量层、style 覆盖的完整细节。
`,
  },
];

export { chapters };
