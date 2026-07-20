// =============================================================
// Mantine 从入门到精通大全 - 第九批章节（第九部分 主题与样式定制，共 4 章）
// -------------------------------------------------------------
// 本批包含：
//   mantine2-ch39 : 第三十九章 createTheme 深入与 colors 色板
//   mantine2-ch40 : 第四十章 style props 与 classNames/styles
//   mantine2-ch41 : 第四十一章 CSS 变量与 vars 覆盖
//   mantine2-ch42 : 第四十二章 自定义组件与 polymorphic
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：Mantine v9 / React 19 / Next.js 16
// 注意：第三章已讲过 createTheme 基础，本批第一章深入进阶，避免重复。
// =============================================================

const chapters = [
  // ============================================================
  // 第三十九章 createTheme 深入与 colors 色板
  // ============================================================
  {
    id: 'mantine2-ch39',
    group: '第九部分 主题与样式定制',
    icon: '🌈',
    title: '第三十九章 createTheme 深入与 colors 色板',
    content: `## 一句话目标

深入掌握 Mantine 主题系统的全貌——从 CSS 变量到组件渲染的完整链路，学会用 \`createTheme\` 定制企业级品牌主题，掌握 colors 色板生成、自动对比度、focusRing 等高级配置。

> 第三章已讲过 \`createTheme\` 的基础用法（primaryColor/fontFamily/defaultRadius/components.defaultProps），本章不再重复，直接讲进阶。

---

## 一、主题系统全貌：三层架构

Mantine 主题系统由三层组成，理解这三层就理解了所有定制行为的本质：

\`\`\`
第一层：CSS 变量（--mantine-color-blue-6 等）
       ↓ 由 MantineProvider 注入到 :root
第二层：MantineProvider（持 theme 对象 + 颜色方案上下文）
       ↓ 通过 React Context 下发
第三层：组件（Button/Text/Box 等）
       ↓ 读取 CSS 变量与 theme 对象渲染
\`\`\`

**关键认知**：组件样式 = 默认 CSS + CSS 变量值。改主题就是改 CSS 变量，组件自动跟着变。

\`\`\`jsx
// app/layout.js：完整主题注入流程
import '@mantine/core/styles.css';
import { MantineProvider, createTheme, ColorSchemeScript } from '@mantine/core';

// 1. createTheme：创建主题对象（与默认主题深合并）
const theme = createTheme({
  primaryColor: 'indigo',
  fontFamily: 'system-ui, sans-serif',
});

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <head>
        {/* 2. ColorSchemeScript：hydration 前注入颜色方案，防闪烁 */}
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        {/* 3. MantineProvider：注入 CSS 变量 + 提供 theme context */}
        <MantineProvider theme={theme} defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
\`\`\`

> ⭐ \`createTheme\` 不是必须的——直接传对象给 \`theme\` prop 也能用，但 \`createTheme\` 会做类型推导和深合并校验，强烈推荐。

---

## 二、theme 对象完整字段速查

\`createTheme\` 接收一个对象，字段可分为五大类。下表是高频字段速查：

| 字段 | 类型 | 说明 | 示例 |
| --- | --- | --- | --- |
| \`primaryColor\` | string | 全局主色名 | \`'indigo'\` |
| \`white\` / \`black\` | string | 亮/暗背景色 | \`'#fff'\` |
| \`colors\` | object | 色板（10 阶数组） | \`{ brand: [...] }\` |
| \`primaryShade\` | number / object | 主色阶（亮/暗分别设置） | \`{ light: 6, dark: 8 }\` |
| \`fontFamily\` | string | 正文字体 | \`'system-ui'\` |
| \`fontFamilyMono\` | string | 等宽字体（Code 用） | \`'ui-monospace'\` |
| \`headings\` | object | 标题字体/尺寸 | \`{ fontFamily, sizes }\` |
| \`fontSizes\` | object | 字号系统 | \`{ md: '15px' }\` |
| \`lineHeights\` | object | 行高系统 | \`{ md: 1.55 }\` |
| \`spacing\` | object | 间距系统 | \`{ md: '16px' }\` |
| \`radius\` | object | 圆角系统 | \`{ md: '8px' }\` |
| \`shadows\` | object | 阴影系统 | \`{ md: '0 4px 12px rgba(0,0,0,.1)' }\` |
| \`defaultRadius\` | string / number | 默认圆角 | \`'md'\` |
| \`autoContrast\` | boolean | 自动文字对比色 | \`true\` |
| \`luminanceThreshold\` | number | 自动对比度阈值 | \`0.3\` |
| \`focusRing\` | string | 焦点环尺寸策略 | \`'always' / 'auto' / 'never'\` |
| \`activeStyles\` | object | 按下态样式 | \`{ transform: 'translateY(1px)' }\` |
| \`respectReducedMotion\` | boolean | 尊重系统减少动画 | \`true\` |
| \`cursorType\` | string | 光标类型 | \`'default' / 'pointer'\` |
| \`vars\` | object | 全局 CSS 变量覆盖 | - |
| \`components\` | object | 组件级主题覆盖 | - |

---

## 三、primaryShade：主色阶精确控制

默认情况下，组件用色阶 6（亮色）或 8（暗色）。你可以精确控制：

\`\`\`jsx
import { createTheme, MantineProvider, Button, Group } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'blue',
  // primaryShade：精确指定组件用哪一阶色
  // - 数字：亮暗都用同一阶
  // - 对象：分别指定亮/暗色方案下的色阶
  primaryShade: {
    light: 5,  // 亮色方案下用第 5 阶（比默认 6 浅一点）
    dark: 7,   // 暗色方案下用第 7 阶（比默认 8 浅一点）
  },
});

export default function Demo() {
  return (
    <MantineProvider theme={theme}>
      <Group>
        {/* 按钮背景会取 blue 色板第 5 阶 */}
        <Button>浅一点的蓝</Button>
      </Group>
    </MantineProvider>
  );
}
\`\`\`

**什么时候要改？** 品牌色定下来后，如果默认色阶看起来太深或太浅，调这个比改色板省事。

---

## 四、autoContrast 与 luminanceThreshold：自动文字色

按钮背景深色时，文字应该是白色；背景浅色时，文字应该是黑色。Mantine 可以自动判断：

\`\`\`jsx
import { MantineProvider, createTheme, Button, Group } from '@mantine/core';

const theme = createTheme({
  // autoContrast：开启后，variant="filled" 的组件自动选择文字色
  // 比如黄色背景自动用黑字，深蓝背景自动用白字
  autoContrast: true,
  // luminanceThreshold：亮度阈值（0~1）
  // 背景亮度 > 阈值 → 文字用深色
  // 背景亮度 < 阈值 → 文字用浅色
  // 默认 0.3，调高则更多颜色被判为"浅色"
  luminanceThreshold: 0.3,
});

export default function Demo() {
  return (
    <MantineProvider theme={theme}>
      <Group>
        {/* 黄色背景亮度高，自动用黑字 */}
        <Button color="yellow">黄色按钮</Button>
        {/* 深蓝背景亮度低，自动用白字 */}
        <Button color="indigo">深蓝按钮</Button>
        {/* lime 色亮度也高，黑字更易读 */}
        <Button color="lime">柠檬绿</Button>
      </Group>
    </MantineProvider>
  );
}
\`\`\`

> ⭐ 不开 \`autoContrast\` 时，filled 按钮文字色固定为 \`white\`，黄色、柠檬绿这种浅色背景上撞色严重。开启后省心。

---

## 五、自定义色板：10 阶梯度的取用规则

手写 10 阶色板很痛苦但有规律可循——0 最浅，9 最深，主色在第 6 阶：

\`\`\`jsx
import { MantineProvider, createTheme, Button, Group, Stack, Text } from '@mantine/core';

// 自定义品牌色板：手动写 10 阶
// 规律：0 最浅（背景用），6 主色，9 最深（边框/深色文字）
const brandColors = [
  '#f0fdf4', // 0：最浅，用于 light 变体背景
  '#dcfce7', // 1
  '#bbf7d0', // 2
  '#86efac', // 3
  '#4ade80', // 4
  '#22c55e', // 5
  '#16a34a', // 6：主色，组件默认取这阶
  '#15803d', // 7：hover 态
  '#166534', // 8：暗色方案默认
  '#14532d', // 9：最深，深色背景文字
];

const theme = createTheme({
  colors: {
    brand: brandColors,
  },
  primaryColor: 'brand',
});

export default function Demo() {
  return (
    <MantineProvider theme={theme}>
      <Stack>
        <Group>
          {/* 未指定 color，用 primaryColor="brand" 第 6 阶 */}
          <Button>品牌主按钮</Button>
          {/* variant="light" 用色阶 1 做背景，色阶 6 做文字 */}
          <Button variant="light">浅色品牌</Button>
          {/* variant="outline" 用色阶 6 做边框 */}
          <Button variant="outline">描边品牌</Button>
        </Group>
      </Stack>
    </MantineProvider>
  );
}
\`\`\`

**色阶取用规则速记**（亮色方案）：

| 场景 | 用的色阶 |
| --- | --- |
| \`variant="filled"\` 背景 | 6 |
| \`variant="light"\` 背景 | 1 |
| \`variant="light"\` 文字 | 6 |
| \`variant="outline"\` 边框 | 6 |
| hover 加深 | 7 |
| 深色背景文字 | 9 |

> 暗色方案下，Mantine 自动用 8/9 阶做背景，0/1 阶做文字——所以你写色板时务必保证 10 阶都填齐。

---

## 六、focusRing：焦点环策略

焦点环是键盘访问性（a11y）的核心。Mantine 提供三种策略：

\`\`\`jsx
import { createTheme } from '@mantine/core';

const theme = createTheme({
  // focusRing 取值：
  // - 'always'：始终显示焦点环（最安全，但鼠标点击也显示）
  // - 'auto'（默认）：仅键盘聚焦时显示（鼠标点击不显示）
  // - 'never'：永不显示（不推荐，破坏 a11y）
  focusRing: 'auto',
});
\`\`\`

> ⭐ \`'auto'\` 是最佳实践：键盘用户能看见焦点，鼠标用户不被打扰。Mantine 通过 \`:focus-visible\` CSS 选择器实现。

---

## 七、activeStyles 与 respectReducedMotion：交互细节

\`\`\`jsx
import { createTheme } from '@mantine/core';

const theme = createTheme({
  // activeStyles：按下态样式（点击瞬间的视觉反馈）
  // 默认 { transform: 'translateY(1px)' }——按钮按下时下沉 1px
  activeStyles: {
    transform: 'translateY(2px) scale(0.98)',
  },

  // respectReducedMotion：尊重系统「减少动画」偏好
  // 用户在 OS 设置了「减少动画」后，所有过渡动画自动禁用
  // 默认 true，强烈建议保持
  respectReducedMotion: true,

  // cursorType：全局光标类型
  // - 'default'：箭头（更克制）
  // - 'pointer'（默认）：手型（更友好）
  cursorType: 'pointer',
});
\`\`\`

**为什么不建议关 \`respectReducedMotion\`？** 部分用户对动画敏感（前庭功能障碍），系统级「减少动画」是 a11y 的重要设置，尊重它能让产品更包容。

---

## 八、组件级主题：components 三件套

\`components.X\` 下有三个核心字段，对应三种覆盖方式：

| 字段 | 作用 | 类型 |
| --- | --- | --- |
| \`defaultProps\` | 覆盖默认 props | object |
| \`classNames\` | 追加 className | string / object / function |
| \`styles\` | 追加样式 | object / function |

### 1. defaultProps：改默认值

\`\`\`jsx
const theme = createTheme({
  components: {
    Button: {
      defaultProps: {
        // 所有 Button 默认 outline 样式 + md 尺寸
        variant: 'outline',
        size: 'md',
        radius: 'xl',
      },
    },
  },
});
\`\`\`

### 2. classNames：追加 class

\`\`\`jsx
// 先在 globals.css 写好样式
// .my-btn { font-weight: 800; }
// .my-btn-label { letter-spacing: 0.5px; }

const theme = createTheme({
  components: {
    Button: {
      classNames: {
        // 对象形式：按子部件指定
        root: 'my-btn',         // 根元素
        label: 'my-btn-label',  // 文字 label
        // 还可以：icon / loader / section 等
      },
      // 也可以用函数形式，拿到 theme 和 params
      // classNames: (theme, params) => ({ root: 'my-btn' })
    },
  },
});
\`\`\`

### 3. styles：追加内联样式

\`\`\`jsx
const theme = createTheme({
  components: {
    Button: {
      styles: {
        // 对象形式：直接写样式
        root: { fontWeight: 800 },
        label: { letterSpacing: '0.5px' },
      },
      // 函数形式：可以读 theme 和 params 做条件样式
      // styles: (theme, params) => ({
      //   root: { fontWeight: params.variant === 'filled' ? 800 : 600 },
      // })
    },
  },
});
\`\`\`

> ⭐ 这三件套是统一组件规范的杀手锏：\`defaultProps\` 改默认值，\`classNames\` 加自定义 class，\`styles\` 加内联样式。下一章会详细展开 \`classNames\` / \`styles\` 的函数形式。

---

## 九、实战：企业品牌主题

把上面学到的全部用上，搭一套企业品牌主题：

\`\`\`jsx
// theme/brand-theme.js：抽出主题配置，便于复用
import { createTheme } from '@mantine/core';

export const brandTheme = createTheme({
  // 1. 主色：自定义品牌色「靛青」
  primaryColor: 'brand',
  colors: {
    brand: [
      '#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc',
      '#818cf8', '#6366f1', '#4f46e5', '#4338ca',
      '#3730a3', '#312e81',
    ],
  },

  // 2. 字体：使用现代系统字体栈
  fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
  fontFamilyMono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
  headings: {
    fontFamily: 'inherit',  // 标题用同一字体，保持一致
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2.25rem', lineHeight: 1.2 },
      h2: { fontSize: '1.75rem', lineHeight: 1.3 },
      h3: { fontSize: '1.375rem', lineHeight: 1.4 },
    },
  },

  // 3. 圆角与间距：稍大一点更现代
  defaultRadius: 'md',
  radius: { md: '8px', lg: '12px', xl: '16px' },
  spacing: { xs: '8px', sm: '12px', md: '16px', lg: '24px', xl: '32px' },

  // 4. 自动对比 + 焦点策略
  autoContrast: true,
  luminanceThreshold: 0.3,
  focusRing: 'auto',
  respectReducedMotion: true,

  // 5. 按下态：稍微下沉，模拟物理反馈
  activeStyles: { transform: 'translateY(1px)' },

  // 6. 组件级规范：所有按钮 md 尺寸 + xl 圆角
  components: {
    Button: {
      defaultProps: { size: 'md', radius: 'xl' },
    },
    TextInput: {
      defaultProps: { size: 'md', radius: 'md' },
    },
    Card: {
      defaultProps: { radius: 'md', padding: 'lg', withBorder: true },
    },
  },
});
\`\`\`

\`\`\`jsx
// app/layout.js：应用品牌主题
import '@mantine/core/styles.css';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { brandTheme } from '@/theme/brand-theme';

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <head><ColorSchemeScript defaultColorScheme="light" /></head>
      <body>
        <MantineProvider theme={brandTheme} defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
\`\`\`

\`\`\`jsx
// app/page.js：验证品牌主题
import { Button, TextInput, Card, Title, Text, Stack } from '@mantine/core';

export default function Home() {
  return (
    <Stack m="xl">
      <Title order={1}>企业品牌主题演示</Title>
      <Text>所有组件自动应用品牌色与圆角。</Text>

      <Card>
        <Stack>
          {/* 没写 size/radius，全部用主题默认值 */}
          <TextInput label="邮箱" placeholder="you@example.com" />
          <Button>提交</Button>
        </Stack>
      </Card>
    </Stack>
  );
}
\`\`\`

---

## 小结

| 配置项 | 作用 |
| --- | --- |
| \`primaryColor\` / \`colors\` | 主色与色板 |
| \`primaryShade\` | 精确控制色阶 |
| \`autoContrast\` / \`luminanceThreshold\` | 自动文字对比色 |
| \`focusRing\` | 焦点环策略 |
| \`activeStyles\` / \`respectReducedMotion\` | 交互细节与无障碍 |
| \`components.X.defaultProps\` | 组件默认 props |
| \`components.X.classNames\` / \`styles\` | 组件 class / 样式覆盖 |

下一章我们学习 style props——给单个组件加样式最快捷的方式。`,
  },

  // ============================================================
  // 第四十章 style props 与 classNames/styles
  // ============================================================
  {
    id: 'mantine2-ch40',
    group: '第九部分 主题与样式定制',
    icon: '💅',
    title: '第四十章 style props 与 classNames/styles',
    content: `## 一句话目标

掌握 Mantine 给单个组件加样式的所有方式——style props 快捷属性、classNames/styles 灵活覆盖、vars 直接设 CSS 变量、unstyled 完全去样式，并完成一个 TextInput 样式定制实战。

---

## 一、style props 全解

style props 是 Mantine 组件都支持的「快捷样式属性」，本质是把常见 CSS 属性映射成 props：

| prop | 对应 CSS | 示例 |
| --- | --- | --- |
| \`p\` | padding | \`p="xl"\` |
| \`px\` / \`py\` | padding 横向 / 纵向 | \`px="md"\` |
| \`pt/pr/pb/pl\` | padding 上右下左 | \`pt={8}\` |
| \`m\` | margin | \`m="xs"\` |
| \`mx\` / \`my\` | margin 横向 / 纵向 | \`mx="auto"\` |
| \`mt/mr/mb/ml\` | margin 上右下左 | \`mt={16}\` |
| \`bg\` | background | \`bg="red"\` |
| \`c\` | color | \`c="blue"\` |
| \`bd\` | border | \`bd="1px solid gray"\` |
| \`fz\` | font-size | \`fz="lg"\` |
| \`fw\` | font-weight | \`fw={700}\` |
| \`lh\` | line-height | \`lh={1.5}\` |
| \`ta\` | text-align | \`ta="center"\` |
| \`op\` | opacity | \`op={0.5}\` |
| \`w\` / \`h\` | width / height | \`w={200}\` |
| \`miw\` / \`maw\` | min-width / max-width | \`maw={400}\` |
| \`mih\` / \`mah\` | min-height / max-height | - |
| \`bdrs\` | border-radius | \`bdrs="50%"\` |
| \`pos\` | position | \`pos="absolute"\` |
| \`top/right/bottom/left\` | 定位偏移 | \`top={0}\` |
| \`display\` | display | \`display="none"\` |

\`\`\`jsx
import { Box } from '@mantine/core';

export default function Demo() {
  return (
    // 用 style props 一行写完所有样式
    <Box
      p="xl"           // 内边距 xl（24px）
      m="md"           // 外边距 md（16px）
      bg="gray.1"      // 背景色：gray 色板第 1 阶
      c="gray.9"       // 文字色：gray 色板第 9 阶
      bd="1px solid gray.3"  // 边框：1px 实线 gray 第 3 阶
      bdrs="md"        // 圆角 md（6px）
      fz="lg"          // 字号 lg
      fw={500}         // 字重 500
      lh={1.6}         // 行高 1.6
      ta="center"      // 文字居中
    >
      一行样式搞定
    </Box>
  );
}
\`\`\`

> ⭐ \`bg="gray.1"\` 这种「色名.阶数」语法是 Mantine 特色——直接引用主题色板。等价于 CSS 的 \`var(--mantine-color-gray-1)\`。

---

## 二、响应式 style props

style props 支持响应式——传对象即可：

\`\`\`jsx
import { Box, Text } from '@mantine/core';

export default function Demo() {
  return (
    <Box
      // 响应式：不同断点不同值
      // base：默认（移动端）
      // xs/sm/md/lg/xl：对应断点以上
      p={{ base: 'sm', md: 'lg' }}     // 移动端 sm，md 及以上 lg
      fz={{ base: 'sm', lg: 'xl' }}    // 移动端 sm，lg 及以上 xl
      maw={{ base: '100%', md: 600 }}  // 移动端占满，桌面端最大 600px
      bg={{ base: 'blue.1', md: 'blue.0' }}  // 不同断点不同背景
    >
      <Text>缩放窗口看效果</Text>
    </Box>
  );
}
\`\`\`

**断点对照**（默认）：

| 断点 | min-width |
| --- | --- |
| \`base\` | 0 |
| \`xs\` | 36em (576px) |
| \`sm\` | 48em (768px) |
| \`md\` | 62em (992px) |
| \`lg\` | 75em (1200px) |
| \`xl\` | 88em (1408px) |

> ⭐ 响应式写法是 Mantine 的强项——不用写一行 CSS 媒体查询，纯 props 搞定。

---

## 三、伪类 style props

用 \`__\` 前缀指定伪类样式：

\`\`\`jsx
import { Box } from '@mantine/core';

export default function Demo() {
  return (
    <Box
      p="lg"
      bg="gray.1"
      // __hover：鼠标悬浮时的样式
      __hover={{ bg: 'blue.1', cursor: 'pointer' }}
      // __focus：获得焦点时的样式（需 tabIndex 才能聚焦）
      __focus={{ outline: '2px solid blue' }}
      // __active：按下时的样式
      __active={{ transform: 'scale(0.98)' }}
      tabIndex={0}
    >
      鼠标移上来 / 点击 / 用 Tab 聚焦试试
    </Box>
  );
}
\`\`\`

**支持的伪类 props**：

| prop | 对应 CSS |
| --- | --- |
| \`__hover\` | \`:hover\` |
| \`__focus\` | \`:focus\` |
| \`__active\` | \`:active\` |
| \`__focusVisible\` | \`:focus-visible\` |
| \`__placeholder\` | \`:placeholder-shown\` |

> ⭐ 这比写 CSS 类快多了，适合简单交互效果。复杂动画还是建议写 CSS。

---

## 四、classNames prop

\`classNames\` 用于给组件**内部各子部件**加 class：

\`\`\`jsx
// 先在 globals.css 写好样式
// .my-input { background: #fafafa; }
// .my-input-label { font-weight: 700; color: #555; }

import { TextInput } from '@mantine/core';

export default function Demo() {
  return (
    <TextInput
      label="用户名"
      placeholder="输入用户名"
      // 字符串形式：只给根元素加 class
      // classNames="my-text-input"

      // 对象形式：分别给子部件加 class
      // 不同组件支持的子部件名不同，查官方文档
      classNames={{
        root: 'my-input-root',
        input: 'my-input',
        label: 'my-input-label',
        // TextInput 还支持：wrapper / description / error / required / section 等
      }}
    />
  );
}
\`\`\`

**函数形式**（拿 theme 和 params）：

\`\`\`jsx
<TextInput
  size="lg"
  // 函数形式：可根据 params（含 variant/size/等）做条件 class
  classNames={(theme, params) => ({
    input: params.size === 'lg' ? 'big-input' : 'normal-input',
  })}
/>
\`\`\`

> ⭐ \`params\` 里的字段因组件而异——TextInput 有 \`size/variant/withError\`，Button 有 \`size/variant/color/loading\` 等。

---

## 五、styles prop

\`styles\` 用于给子部件加内联样式，与 \`classNames\` 用法对称：

\`\`\`jsx
import { TextInput } from '@mantine/core';

export default function Demo() {
  return (
    <TextInput
      label="邮箱"
      placeholder="you@example.com"
      // 对象形式：按子部件指定样式
      styles={{
        input: {
          backgroundColor: '#fef3c7',  // 浅黄背景
          border: '1px dashed #f59e0b', // 虚线橙色边框
          fontFamily: 'monospace',
        },
        label: {
          fontWeight: 700,
          color: '#92400e',
        },
      }}
    />
  );
}
\`\`\`

**函数形式**（最强大）：

\`\`\`jsx
<TextInput
  color="red"
  // 函数形式：可读 theme（拿主题色/间距）和 params（拿 props）
  styles={(theme, params) => ({
    input: {
      // 用 theme.colors 引用主题色
      // params.color 是组件传入的 color prop
      backgroundColor: theme.colors[params.color || 'blue'][0],
      borderColor: theme.colors[params.color || 'blue'][6],
    },
    label: {
      color: theme.colors[params.color || 'blue'][8],
    },
  })}
/>
\`\`\`

> ⭐ \`styles\` 函数形式是定制组件的瑞士军刀——能拿到 theme（主题对象）和 params（组件 props），想怎么改怎么改。

---

## 六、vars prop：直接设 CSS 变量

\`vars\` 允许直接设置 CSS 变量，作用域是组件根元素：

\`\`\`jsx
import { Button, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      <Button>默认按钮</Button>

      {/* 单实例覆盖：只改这一个按钮的变量 */}
      <Button
        // vars：以 CSS 变量名（去掉 --mantine- 前缀）为 key
        vars={{
          root: {
            '--button-height': '40px',
            '--button-padding-x': '24px',
            '--button-fz': '14px',
            '--button-radius': '999px',
          },
        }}
      >
        自定义变量按钮
      </Button>
    </Stack>
  );
}
\`\`\`

**vars 的优势**：改 CSS 变量比改 style 优先级高，且响应式切换（亮/暗）时变量可重新计算。下一章会深入讲 CSS 变量命名规则与全局覆盖。

---

## 七、unstyled prop：完全去样式

\`unstyled\` 把组件变成「裸元素」——保留语义和行为，去除所有视觉样式：

\`\`\`jsx
import { Button, TextInput, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* unstyled 后：无边框、无背景、无圆角，只剩点击事件 */}
      <Button unstyled onClick={() => alert('点了')}>
        看起来像链接
      </Button>

      {/* unstyled 后：TextInput 变成原生 input */}
      <TextInput unstyled placeholder="裸输入框" />
    </Stack>
  );
}
\`\`\`

**用途**：
- 你只想要组件的「逻辑」（点击事件、表单集成）但完全自定义视觉。
- 构建设计系统，用 Mantine 做行为层，自己做视觉层。

---

## 八、实战：定制 TextInput 样式

把所有定制手段用上，做一个「卡片式邮箱输入框」：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { TextInput, Box, Text, Group } from '@mantine/core';
import { IconMail, IconCheck } from '@tabler/icons-react';

export default function EmailInput() {
  const [value, setValue] = useState('');
  // 简单的邮箱格式校验
  const isValid = /^[^@]+@[^@]+\\.[^@]+$/.test(value);

  return (
    <Box
      maw={420}
      mx="auto"
      mt="xl"
      p="lg"
      bg={{ base: 'gray.0', md: 'gray.1' }}
      bdrs="lg"
      bd="1px solid gray.3"
    >
      <Text fw={600} mb="xs" c="gray.8">邮箱注册</Text>

      <TextInput
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        placeholder="you@example.com"
        leftSection={<IconMail size={16} />}
        // 用 styles 函数形式定制 input 视觉
        styles={(theme, params) => ({
          input: {
            backgroundColor: '#fff',
            // 注意：模板字符串里的 \${} 在源码中需转义
            border: \`1px solid \${isValid ? theme.colors.green[6] : theme.colors.gray[4]}\`,
            borderRadius: '8px',
            height: '44px',
            fontSize: '15px',
            // 聚焦时阴影
            '&:focus': {
              borderColor: theme.colors.blue[6],
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)',
            },
          },
          section: {
            color: isValid ? theme.colors.green[6] : theme.colors.gray[5],
          },
        })}
      />

      {/* 校验状态提示 */}
      <Group mt="xs" gap="xs">
        {value && (
          <Text size="sm" c={isValid ? 'green.7' : 'red.7'} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {isValid ? <IconCheck size={14} /> : null}
            {isValid ? '邮箱格式正确' : '邮箱格式不对'}
          </Text>
        )}
      </Group>
    </Box>
  );
}
\`\`\`

---

## 小结

| 手段 | 适用场景 | 优先级 |
| --- | --- | --- |
| style props | 快捷单属性 | 低（基础） |
| 响应式 style props | 跨断点适配 | 低 |
| 伪类 style props | 简单 hover/focus | 低 |
| \`classNames\` | 复用 CSS 类 | 中（class） |
| \`styles\` 对象 | 一次性内联样式 | 中 |
| \`styles\` 函数 | 拿 theme/params 条件样式 | 中 |
| \`vars\` | 改 CSS 变量（响应式优先级高） | 高 |
| \`unstyled\` | 完全自定义 skin | - |

下一章深入 CSS 变量系统，理解 Mantine 样式的「底层货币」。`,
  },

  // ============================================================
  // 第四十一章 CSS 变量与 vars 覆盖
  // ============================================================
  {
    id: 'mantine2-ch41',
    group: '第九部分 主题与样式定制',
    icon: '⚙️',
    title: '第四十一章 CSS 变量与 vars 覆盖',
    content: `## 一句话目标

彻底搞懂 Mantine 的 CSS 变量系统——变量命名规则、组件级与全局级 vars 覆盖、读取主题与色案的 hooks、暗色模式下的变量切换，并完成动态主题色切换实战。

---

## 一、CSS 变量命名规则

Mantine 所有可定制样式都通过 CSS 变量驱动，命名规则统一：

\`\`\`
--mantine-{category}-{name}-{shade}
\`\`\`

**常见前缀**：

| 类别 | 变量示例 | 说明 |
| --- | --- | --- |
| 颜色 | \`--mantine-color-blue-6\` | blue 色板第 6 阶 |
| 文字色 | \`--mantine-color-text\` | 默认文字色 |
| 背景色 | \`--mantine-color-body\` | 页面背景 |
| 间距 | \`--mantine-spacing-md\` | md 间距 |
| 圆角 | \`--mantine-radius-md\` | md 圆角 |
| 字号 | \`--mantine-font-size-md\` | md 字号 |
| 行高 | \`--mantine-line-height-md\` | md 行高 |
| 阴影 | \`--mantine-shadow-md\` | md 阴影 |
| 字体 | \`--mantine-font-family\` | 正文字体 |
| 主色 | \`--mantine-primary-color-6\` | 主色第 6 阶 |
| 焦点环 | \`--mantine-focus-ring\` | 焦点环样式 |

> ⭐ 颜色变量 = \`--mantine-color-{色名}-{0-9}\`，共 10 阶。亮/暗方案下，同名变量值不同（Mantine 自动切换）。

---

## 二、vars prop：组件级覆盖

每个 Mantine 组件都支持 \`vars\` prop，覆盖该组件实例的 CSS 变量：

\`\`\`jsx
import { Button, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* 默认按钮：用主题默认变量 */}
      <Button>默认按钮</Button>

      {/* 单实例覆盖：只改这一个按钮的变量 */}
      <Button
        vars={{
          root: {
            // 改这个按钮的高度、圆角、字号
            '--button-height': '36px',
            '--button-radius': '4px',
            '--button-fz': '13px',
          },
        }}
      >
        自定义按钮
      </Button>
    </Stack>
  );
}
\`\`\`

**vars 对象结构**：

\`\`\`jsx
vars={{
  root: { /* 根元素变量 */ },
  // 部分组件有多子部件
  input: { /* 输入框变量 */ },
  label: { /* 标签变量 */ },
}}
\`\`\`

> 每个组件支持的子部件 vars 名不同，可在 Mantine 官方文档对应组件页面查到。

---

## 三、vars 函数形式：拿 theme 计算

\`vars\` 也可以是函数，拿 \`theme\` 做动态计算：

\`\`\`jsx
import { Button } from '@mantine/core';

export default function Demo() {
  return (
    <Button
      // 函数形式：可读 theme 拿主题色板等
      vars={(theme) => ({
        root: {
          // 用 theme.colors 读色板
          '--button-bg': theme.colors.indigo[6],
          '--button-hover': theme.colors.indigo[7],
        },
      })}
    >
      函数 vars 按钮
    </Button>
  );
}
\`\`\`

> ⭐ 函数形式的优势：能根据当前主题动态计算——比如暗色方案下用更深的色阶。

---

## 四、theme.vars：全局 CSS 变量覆盖

在 \`createTheme\` 的 \`vars\` 字段中，可以全局覆盖任意 CSS 变量：

\`\`\`jsx
import { MantineProvider, createTheme, Button, Box, Text } from '@mantine/core';

const theme = createTheme({
  // vars：全局 CSS 变量覆盖
  // 写变量全名（含 --mantine- 前缀），值是字符串
  vars: {
    '--mantine-color-text': '#1a1a1a',       // 全局文字色
    '--mantine-color-body': '#fafafa',       // 全局背景色
    '--mantine-font-family': 'system-ui, sans-serif',
    '--mantine-radius-md': '10px',           // 全局 md 圆角
    // 也可以加自定义变量
    '--my-brand-accent': '#6366f1',
  },
});

export default function Demo() {
  return (
    <MantineProvider theme={theme}>
      <Box p="xl">
        <Text>全局变量已覆盖</Text>
        <Button>按钮</Button>
      </Box>
    </MantineProvider>
  );
}
\`\`\`

> ⭐ \`theme.vars\` 的作用域是 \`:root\`——全局生效。组件级 \`vars\` prop 优先级更高（作用域是组件根元素）。

---

## 五、useMantineTheme：读取主题对象

在组件里读 theme 对象：

\`\`\`jsx
'use client';
import { useMantineTheme, Box, Text, Stack } from '@mantine/core';

export default function ThemeInspector() {
  // useMantineTheme：拿到当前 MantineProvider 注入的 theme 对象
  const theme = useMantineTheme();

  return (
    <Box p="lg" bd="1px dashed">
      <Stack gap="xs">
        <Text>当前主色：{theme.primaryColor}</Text>
        <Text>默认圆角：{theme.defaultRadius}</Text>
        <Text>md 间距：{theme.spacing.md}</Text>
        <Text>蓝色第 6 阶：{theme.colors.blue[6]}</Text>
        <Text>md 字号：{theme.fontSizes.md}</Text>
        <Text>字体：{theme.fontFamily}</Text>
      </Stack>
    </Box>
  );
}
\`\`\`

**用途**：写自定义组件时需要根据主题计算样式，就用这个 hook。

---

## 六、useMantineColorScheme：读取色案

\`\`\`jsx
'use client';
import { useMantineColorScheme, useComputedColorScheme, Box, Text, Stack } from '@mantine/core';

export default function ColorSchemeInspector() {
  // colorScheme：用户设置的方案（可能是 'auto'）
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  // computedColorScheme：实际生效的方案（'light' 或 'dark'）
  const computed = useComputedColorScheme('light');

  return (
    <Box p="lg">
      <Stack gap="xs">
        <Text>用户设置：{colorScheme}</Text>
        <Text>实际生效：{computed}</Text>
        <Text>是暗色吗：{computed === 'dark' ? '是' : '否'}</Text>
        <Text>切换：<button onClick={() => setColorScheme(computed === 'dark' ? 'light' : 'dark')}>点我切换</button></Text>
      </Stack>
    </Box>
  );
}
\`\`\`

> ⭐ 拿实际生效值用 \`useComputedColorScheme\`，拿用户设置的用 \`useMantineColorScheme\`。两者用途不同，别混淆。

---

## 七、自定义 CSS 变量并在组件中使用

除了 Mantine 内置变量，你可以加自己的变量：

\`\`\`jsx
import { MantineProvider, createTheme, Box, Text } from '@mantine/core';

const theme = createTheme({
  vars: {
    // 自定义业务变量
    '--brand-gradient-from': '#6366f1',
    '--brand-gradient-to': '#8b5cf6',
    '--card-shadow': '0 4px 20px rgba(99, 102, 241, 0.15)',
  },
});

export default function Demo() {
  return (
    <MantineProvider theme={theme}>
      {/* 在 style 中用 var() 引用自定义变量 */}
      <Box
        p="xl"
        style={{
          // 渐变背景用自定义变量
          background: 'linear-gradient(135deg, var(--brand-gradient-from), var(--brand-gradient-to))',
          boxShadow: 'var(--card-shadow)',
          borderRadius: '12px',
        }}
      >
        <Text c="white" fw={700}>渐变卡片</Text>
      </Box>
    </MantineProvider>
  );
}
\`\`\`

**好处**：变量集中管理，改一处全局生效；且能配合响应式切换。

---

## 八、暗色模式下的变量覆盖

亮/暗方案下，Mantine 自动切换同名变量的值。你也可以分别覆盖：

\`\`\`jsx
import { MantineProvider, createTheme, Box, Text } from '@mantine/core';

const theme = createTheme({
  vars: {
    // 默认（亮色）下的值
    '--my-card-bg': '#ffffff',
    '--my-card-border': '#e5e7eb',
  },
});

// 在 globals.css 中写暗色覆盖：
// [data-mantine-color-scheme="dark"] {
//   --my-card-bg: #1f1f1f;
//   --my-card-border: #373737;
// }

export default function Demo() {
  return (
    <MantineProvider theme={theme}>
      <Box
        p="xl"
        style={{
          backgroundColor: 'var(--my-card-bg)',
          border: '1px solid var(--my-card-border)',
        }}
      >
        <Text>切换暗色模式看背景变化</Text>
      </Box>
    </MantineProvider>
  );
}
\`\`\`

> ⭐ Mantine 在 \`<html>\` 上加 \`data-mantine-color-scheme="dark"\` 属性，CSS 用属性选择器切换变量值。这是亮暗同变量自动切换的底层机制。

---

## 九、实战：动态主题色切换

让用户从几个预设色里选主色，实时切换：

\`\`\`jsx
'use client';
import { useState } from 'react';
import { MantineProvider, createTheme, Button, Group, Box, Text, Title } from '@mantine/core';

// 预设几套主题色板
const palettes = {
  indigo: ['#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81'],
  emerald: ['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
  rose: ['#fff1f2', '#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e', '#e11d48', '#be123c', '#9f1239', '#881337'],
};

export default function DynamicTheme() {
  const [currentColor, setCurrentColor] = useState('indigo');

  // 根据 currentColor 动态创建主题
  const theme = createTheme({
    primaryColor: currentColor,
    colors: {
      indigo: palettes.indigo,
      emerald: palettes.emerald,
      rose: palettes.rose,
    },
  });

  return (
    <MantineProvider theme={theme}>
      <Box p="xl">
        <Title order={3} mb="md">选择主题色：</Title>

        {/* 颜色选择器 */}
        <Group mb="lg">
          {Object.keys(palettes).map((name) => (
            <Button
              key={name}
              color={name}
              variant={currentColor === name ? 'filled' : 'light'}
              onClick={() => setCurrentColor(name)}
            >
              {name}
            </Button>
          ))}
        </Group>

        {/* 预览组件会随主题色变化 */}
        <Group>
          <Button>主按钮</Button>
          <Button variant="light">浅色按钮</Button>
          <Button variant="outline">描边按钮</Button>
        </Group>
      </Box>
    </MantineProvider>
  );
}
\`\`\`

> ⭐ 实际项目中，\`MantineProvider\` 通常在 \`layout.js\` 里包一次。这里为了演示动态切换，把它放在组件内部。

**进阶玩法**：把 \`currentColor\` 持久化到 localStorage，让用户下次访问保留选择：

\`\`\`jsx
'use client';
import { useEffect, useState } from 'react';

// 读取初始值时优先用 localStorage
const [currentColor, setCurrentColor] = useState(() => {
  if (typeof window === 'undefined') return 'indigo';  // SSR 兜底
  return localStorage.getItem('theme-color') || 'indigo';
});

// 变化时写回
useEffect(() => {
  localStorage.setItem('theme-color', currentColor);
}, [currentColor]);
\`\`\`

---

## 小结

| API | 作用 |
| --- | --- |
| CSS 变量命名 | \`--mantine-{category}-{name}-{shade}\` |
| \`vars\` prop | 组件级变量覆盖 |
| \`theme.vars\` | 全局变量覆盖 |
| \`useMantineTheme\` | 读主题对象 |
| \`useMantineColorScheme\` | 读色案（含 auto） |
| \`useComputedColorScheme\` | 读实际生效色案 |
| 自定义变量 | \`theme.vars\` 加自己的变量 |
| 暗色覆盖 | \`[data-mantine-color-scheme="dark"]\` 选择器 |

下一章学习自定义组件与 polymorphic——把 Mantine 当积木搭自己的组件库。`,
  },

  // ============================================================
  // 第四十二章 自定义组件与 polymorphic
  // ============================================================
  {
    id: 'mantine2-ch42',
    group: '第九部分 主题与样式定制',
    icon: '🧩',
    title: '第四十二章 自定义组件与 polymorphic',
    content: `## 一句话目标

掌握 Mantine 的多态渲染能力——\`component\` prop 切换根元素、\`renderRoot\` 自定义渲染、\`unstyled\` 去样式化、\`withProps\` 工具函数、polymorphic 类型，并封装一组业务按钮组件。

---

## 一、component prop：多态渲染

几乎所有 Mantine 组件都支持 \`component\` prop，可以改变渲染的 HTML 标签：

\`\`\`jsx
import { Box, Text, Button, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* Box 默认渲染 div，改成 a 就变链接 */}
      <Box component="a" href="https://mantine.dev" target="_blank" c="blue">
        用 Box 渲染的链接
      </Box>

      {/* Text 默认 div，改成 span 就能内联 */}
      <Text component="span" c="red" fw={700}>
        内联红字
      </Text>

      {/* Button 默认 button，改成 a 可做链接按钮 */}
      <Button component="a" href="/docs" target="_blank">
        链接按钮
      </Button>
    </Stack>
  );
}
\`\`\`

> ⭐ \`component\` 改变的是 HTML 标签，**保留所有 Mantine 样式**。这是构建语义化组件的利器——同一套视觉，根据场景换标签。

---

## 二、component 与 TypeScript：polymorphic 类型

在 TS 项目中，\`component\` 会自动推断对应标签的 props 类型：

\`\`\`tsx
import { Box } from '@mantine/core';

export default function Demo() {
  return (
    <>
      {/* TS 推断：component="a" → 必须有 href，可有 target */}
      <Box component="a" href="https://example.com" target="_blank">
        链接
      </Box>

      {/* component="button" → 可有 onClick / type 等 */}
      <Box component="button" type="submit" onClick={() => console.log('点')}>
        按钮
      </Box>

      {/* component="label" → 可有 htmlFor */}
      <Box component="label" htmlFor="email">邮箱</Box>
    </>
  );
}
\`\`\`

> ⭐ polymorphic 类型是 Mantine 的招牌特性——同一个组件支持多种标签，TS 还能正确提示对应标签的 props。这是很多组件库做不到的。

---

## 三、renderRoot：完全自定义根元素

\`component\` 只能换标签，\`renderRoot\` 可以完全接管根元素渲染：

\`\`\`jsx
'use client';
import { Box, Button, Stack } from '@mantine/core';
import Link from 'next/link';

export default function Demo() {
  return (
    <Stack>
      {/* renderRoot：把根元素替换成 Next.js Link */}
      <Button
        renderRoot={(props) => (
          <Link href="/dashboard" {...props} />
        )}
      >
        跳到仪表盘
      </Button>

      {/* Box 用 renderRoot 渲染成自定义组件 */}
      <Box
        bg="gray.1"
        p="md"
        renderRoot={(props) => <article {...props} />}
      >
        用 article 标签渲染
      </Box>
    </Stack>
  );
}
\`\`\`

**\`renderRoot\` vs \`component\`**：

| 场景 | 用 |
| --- | --- |
| 只换 HTML 标签 | \`component\` |
| 用 React 组件（如 Next.js Link） | \`renderRoot\` |
| 需要拦截 props 再传 | \`renderRoot\` |

> ⭐ 配 Next.js 时，\`renderRoot\` + \`Link\` 是把 Button 变成「客户端导航链接按钮」的标准做法。

---

## 四、unstyled：完全去样式化

\`unstyled\` 把组件变成纯逻辑壳，所有 CSS 类移除，只保留 DOM 结构和行为：

\`\`\`jsx
import { Button, TextInput, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* unstyled Button：无背景、无边框，但保留 onClick */}
      <Button unstyled onClick={() => alert('点了')}>
        看起来像链接的按钮
      </Button>

      {/* unstyled TextInput：变成原生 input，但保留 form 集成 */}
      <TextInput unstyled placeholder="裸输入框" />

      {/* unstyled Box：完全去样式，等价于 fragment */}
      <Box unstyled>无样式容器</Box>
    </Stack>
  );
}
\`\`\`

**用途**：
- 你想要组件的逻辑（如 \`useForm\` 集成、键盘交互），但完全自定义视觉。
- 构建设计系统，用 Mantine 做行为层，自己做视觉层。

---

## 五、自定义组件封装模式

用 Box/Group/Stack 等组合，封装业务组件：

\`\`\`jsx
'use client';
import { Box, Group, Text, Badge } from '@mantine/core';

// 用户卡片组件：基于 Box + Group 组合
export function UserCard({ name, role, avatar, status, ...rest }) {
  return (
    <Box
      p="md"
      bg="white"
      bdrs="md"
      bd="1px solid gray.3"
      // 支持 style props 透传
      {...rest}
    >
      <Group justify="space-between">
        <Group>
          {/* 头像 */}
          <Box
            w={40}
            h={40}
            bdrs="50%"
            bg="gray.2"
            style={{
              // 注意：模板字符串中的 \${avatar} 在源码中需转义
              backgroundImage: avatar ? \`url(\${avatar})\` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <Box>
            <Text fw={600} fz="sm">{name}</Text>
            <Text fz="xs" c="gray.6">{role}</Text>
          </Box>
        </Group>
        {/* 状态徽章 */}
        <Badge color={status === 'online' ? 'green' : 'gray'} variant="light">
          {status === 'online' ? '在线' : '离线'}
        </Badge>
      </Group>
    </Box>
  );
}

// 使用
export default function Demo() {
  return (
    <Box maw={400} mx="auto" mt="xl">
      <UserCard
        name="张三"
        role="前端工程师"
        status="online"
        avatar="https://i.pravatar.cc/80?img=1"
      />
    </Box>
  );
}
\`\`\`

> ⭐ 封装业务组件的核心：用 Box 做容器（透传 style props），用 Group/Stack 做布局，业务逻辑自己写。展开 \`...rest\` 让组件保持可扩展性。

---

## 六、withProps 工具函数

\`withProps\` 给组件预设默认 props，返回一个新组件：

\`\`\`jsx
import { Button, withProps, Group } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

// 预设一个「删除按钮」组件
const DeleteButton = withProps(Button, {
  color: 'red',
  variant: 'light',
  size: 'sm',
  leftSection: <IconTrash size={14} />,
});

// 预设一个「主提交按钮」
const SubmitButton = withProps(Button, {
  variant: 'filled',
  size: 'lg',
  fullWidth: true,
});

export default function Demo() {
  return (
    <Group>
      {/* 用法跟 Button 一样，但已有默认 props */}
      <DeleteButton>删除</DeleteButton>
      <SubmitButton>提交</SubmitButton>

      {/* 还能覆盖默认 props */}
      <DeleteButton size="md" color="orange">强制橙色</DeleteButton>
    </Group>
  );
}
\`\`\`

**\`withProps\` vs \`defaultProps\`（主题里）**：

| 手段 | 作用域 |
| --- | --- |
| \`theme.components.X.defaultProps\` | 全局所有 X 组件 |
| \`withProps(X, {...})\` | 仅这个新组件实例 |

> ⭐ \`withProps\` 适合「定义几个固定的业务变体」——比每次手写一堆 props 干净。

---

## 七、polymorphic + withProps：组合使用

\`withProps\` 出来的组件依然支持 \`component\` 与 \`renderRoot\`：

\`\`\`jsx
import { withProps, Box, Stack } from '@mantine/core';

// 预设一个卡片容器
const Card = withProps(Box, {
  p: 'lg',
  bg: 'white',
  bdrs: 'md',
  bd: '1px solid gray.3',
  shadow: 'sm',
});

export default function Demo() {
  return (
    <Stack>
      <Card>普通卡片</Card>

      {/* 用 component 改成 article */}
      <Card component="article">
        <h3>文章标题</h3>
        <p>文章内容...</p>
      </Card>

      {/* 用 renderRoot 接 Next.js Link */}
      {/* <Card renderRoot={(p) => <Link href="/x" {...p} />}>点击跳转</Card> */}
    </Stack>
  );
}
\`\`\`

> ⭐ \`withProps\` 不破坏 polymorphic 能力——这是它比简单封装函数组件更优的地方。

---

## 八、实战：封装业务按钮组件

把所学全用上，封装一组业务按钮：

\`\`\`jsx
'use client';
import { Button, withProps, Group } from '@mantine/core';
import Link from 'next/link';
import {
  IconDeviceFloppy,
  IconTrash,
  IconArrowLeft,
  IconExternalLink,
} from '@tabler/icons-react';

// 1. 保存按钮：主操作，绿色 + 保存图标
export const SaveButton = withProps(Button, {
  color: 'green',
  variant: 'filled',
  leftSection: <IconDeviceFloppy size={16} />,
});

// 2. 删除按钮：危险操作，红色 + 垃圾桶
export const DeleteButton = withProps(Button, {
  color: 'red',
  variant: 'light',
  leftSection: <IconTrash size={16} />,
});

// 3. 返回按钮：次操作，灰色 + 箭头
export const BackButton = withProps(Button, {
  variant: 'subtle',
  color: 'gray',
  leftSection: <IconArrowLeft size={16} />,
});

// 4. 外链按钮：用 component="a" + 外链图标
export function ExternalLinkButton({ href, children, ...rest }) {
  return (
    <Button
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      variant="outline"
      rightSection={<IconExternalLink size={14} />}
      {...rest}
    >
      {children}
    </Button>
  );
}

// 5. 站内跳转按钮：用 renderRoot 接 Next.js Link
export function InternalLinkButton({ href, children, ...rest }) {
  return (
    <Button
      renderRoot={(props) => <Link href={href} {...props} />}
      variant="filled"
      {...rest}
    >
      {children}
    </Button>
  );
}

// 使用演示
export default function Demo() {
  return (
    <Group>
      <SaveButton>保存</SaveButton>
      <DeleteButton>删除</DeleteButton>
      <BackButton>返回</BackButton>
      <ExternalLinkButton href="https://mantine.dev">文档</ExternalLinkButton>
      <InternalLinkButton href="/dashboard">进控制台</InternalLinkButton>
    </Group>
  );
}
\`\`\`

**封装心法**：
1. 视觉变体（颜色、图标）用 \`withProps\` 预设。
2. 行为变体（外链、内链）用 \`component\` / \`renderRoot\` 切换。
3. 透传 \`...rest\`，保留 Button 所有原生能力。

---

## 小结

| API | 作用 |
| --- | --- |
| \`component\` | 改 HTML 标签，保留样式 |
| \`renderRoot\` | 完全自定义根元素渲染 |
| \`unstyled\` | 去除所有样式 |
| \`withProps(Component, props)\` | 预设默认 props 造新组件 |
| polymorphic 类型 | TS 自动推断对应标签 props |

至此，主题与样式定制部分结束。下一部分我们学习 Mantine 的 Hooks 大全与实战案例。`,
  },
];

export { chapters };
