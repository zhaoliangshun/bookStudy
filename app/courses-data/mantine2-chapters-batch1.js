// =============================================================
// Mantine 从入门到精通大全 - 第一批章节（前言 + 第一部分入门基础，共 5 项）
// -------------------------------------------------------------
// 本批包含：
//   mantine2-preface : 前言（教程定位 + 学习路线 + 全书目录）
//   mantine2-ch01    : 第一章 安装与项目配置
//   mantine2-ch02    : 第二章 第一个组件：Button 与 props 体系
//   mantine2-ch03    : 第三章 主题初探：primaryColor、colors、radius
//   mantine2-ch04    : 第四章 暗色模式：颜色方案切换
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：Mantine v9 / React 19 / Next.js 16
// =============================================================

const chapters = [
  // ============================================================
  // 前言
  // ============================================================
  {
    id: 'mantine2-preface',
    group: '开篇',
    icon: '📖',
    title: '前言与学习路线',
    content: `## 前言

### 一、这本书适合谁

这是一本**大而全**的 Mantine 教程，目标只有一个：**让你从零基础搭出能上生产的 React 后台界面**。

适合：

- 完全没用过 UI 组件库的 React 新手，想系统学一套组件体系。
- 用过 Ant Design / Material UI，想转 Mantine 的开发者。
- 写过一点 Mantine 但只会用 Button，想补全知识体系。

### 二、Mantine 是什么

Mantine 是一套**现代化 React 组件库**，特点：

- **组件全**：80+ 组件覆盖表单、布局、反馈、导航、数据展示。
- **Hooks 多**：50+ 实用 hooks（防抖、热键、本地存储、滚动等）。
- **主题强**：CSS 变量驱动，暗色模式开箱即用，定制能力一流。
- **TypeScript 友好**：全套类型定义，IDE 提示完整。
- **无样式引擎负担**：基于 Emotion，但提供 CSS 变量层，性能可控。

> ⭐ 一句话：**Ant Design 偏企业风，Material UI 偏谷歌风，Mantine 偏现代极简风——年轻团队的首选。**

### 三、这本书讲什么

全书 **48 章**，十大模块，覆盖日常开发 100% 高频知识点：

| 模块 | 章节 | 主题 |
| --- | --- | --- |
| 入门基础 | 第 1-4 章 | 安装、Button、主题、暗色模式 |
| 文本与排版 | 第 5-9 章 | Text、Title、List、Mark、Code |
| 布局组件 | 第 10-13 章 | Box、Stack、Group、Grid、Flex |
| 按钮与标识 | 第 14-17 章 | Button、ActionIcon、Badge、Indicator |
| 表单输入 | 第 18-24 章 | TextInput、Select、Slider、DatePicker |
| 表单进阶 | 第 25-27 章 | useForm、校验、动态字段 |
| 反馈与覆盖层 | 第 28-32 章 | Modal、Drawer、Popover、Alert、Skeleton |
| 导航与数据展示 | 第 33-38 章 | AppShell、Tabs、Table、Card、Timeline |
| 主题与样式定制 | 第 39-42 章 | createTheme、style props、vars |
| Hooks 与实战 | 第 43-48 章 | Hooks 大全、Notifications、实战案例 |

### 四、版本约定

- **Mantine v9**（最新稳定版）
- **React 19**（Mantine v9 的最低要求）
- **Next.js 16**（App Router）

### 五、怎么用这本教程

每章结构固定：

1. **一句话说清这章干什么**。
2. **可运行代码**——复制就能用。
3. **注释解释为什么**——不是翻译代码。
4. **小结**——这章学了什么。

建议：

- **边读边敲**。复制代码改一改、跑一跑。
- **看不懂先跳过**。主题定制往后学几章再回头看。
- **⭐ 标记**是日常开发 80% 场景都用的核心点。

### 六、五分钟上手

别等了，先跑一段：

\`\`\`jsx
// 最简单的 Mantine 程序：一个带主题色的按钮
import { Button } from '@mantine/core';

export default function App() {
  return (
    // variant="filled" 是实心样式，color="blue" 用蓝色主题
    // size="md" 是中等尺寸，点击弹出提示
    <Button variant="filled" color="blue" size="md" onClick={() => alert('Hello Mantine!')}>
      点我
    </Button>
  );
}
\`\`\`

> ⭐ 这就是 Mantine 的全部哲学：**组件 + props 驱动**。剩下的 47 章，只是在把这句话展开讲透。

---

准备好了吗？下一章我们正式安装 Mantine，搭建第一个项目。`,
  },

  // ============================================================
  // 第一章 安装与项目配置
  // ============================================================
  {
    id: 'mantine2-ch01',
    group: '第一部分 入门基础',
    icon: '🚀',
    title: '第一章 安装与项目配置',
    content: `## 一句话目标

把 Mantine 装进项目，用 MantineProvider 包住根组件，让所有 Mantine 组件能正常工作。

---

## 一、安装依赖

Mantine 拆成几个包，按需安装：

\`\`\`bash
# 核心包：Button、TextInput、Modal 等 80+ 组件都在这里
npm install @mantine/core

# Hooks 包：useDisclosure、useDebouncedValue 等 50+ hooks
npm install @mantine/hooks

# 表单包：useForm hook（表单章节会大量用到）
npm install @mantine/form

# 通知包：showNotification 通知系统（反馈章节用到）
npm install @mantine/notifications

# 日期包：DatePicker 等日期组件
npm install @mantine/dates

# 图标包：Tabler Icons，Mantine 官方推荐搭配
npm install @tabler/icons-react
\`\`\`

> ⭐ 日常开发至少装前三个：\`core\` + \`hooks\` + \`form\`。

---

## 二、引入 CSS

Mantine v9 的样式是**预编译的 CSS 文件**，直接 import 即可（不需要配置 PostCSS）。

\`\`\`jsx
// app/layout.js（Next.js App Router 根布局）
import '@mantine/core/styles.css';

// 如果用了其他包，也要引入对应样式
// import '@mantine/dates/styles.css';
// import '@mantine/notifications/styles.css';

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
\`\`\`

**为什么需要 import CSS？**

Mantine v9 把样式从 JS-in-CSS 改成了**静态 CSS 文件**——好处是：
- 首屏更快（不用等 JS 执行才注入样式）
- 支持 SSR（服务端渲染时样式已就位）
- 包体积更小（不打包 Emotion 运行时）

---

## 三、MantineProvider：必须的根组件

所有 Mantine 组件必须在 \`MantineProvider\` 内部使用，它负责：
1. 注入 CSS 变量（主题色、间距、圆角等）
2. 提供颜色方案上下文（亮色/暗色）
3. 提供默认主题配置

\`\`\`jsx
// app/layout.js
import '@mantine/core/styles.css';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <head>
        {/* ColorSchemeScript：在 hydration 前注入正确的颜色方案，
            防止暗色模式用户刷新时先闪一下亮色（FOUC 闪烁问题） */}
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        {/* MantineProvider：所有 Mantine 组件的根
            defaultColorScheme="light"：默认亮色
            （也可设 "dark" 或 "auto" 跟随系统） */}
        <MantineProvider defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
\`\`\`

> ⭐ **坑点**：忘了加 \`MantineProvider\`，组件能渲染但样式全是乱的——因为 CSS 变量没注入。

---

## 四、完整最小项目

把上面三步合起来，跑一个完整的页面：

\`\`\`jsx
// app/page.js
import { Button, Text, Stack } from '@mantine/core';

export default function Home() {
  return (
    // Stack：垂直堆叠布局，gap="md" 是间距
    <Stack align="center" justify="center" style={{ minHeight: '100vh' }} gap="lg">
      <Text size="xl" fw={700}>Hello Mantine!</Text>
      <Button color="blue" size="lg">开始使用</Button>
    </Stack>
  );
}
\`\`\`

---

## 五、验证安装成功

打开浏览器，如果看到：
- 蓝色实心按钮（不是灰色默认按钮）
- 文字带 Mantine 默认字体
- 暗色模式切换正常（下一章讲）

说明 Mantine 已经跑起来了。

---

## 小结

| 步骤 | 作用 |
| --- | --- |
| \`npm install @mantine/core\` | 安装核心组件 |
| \`import '@mantine/core/styles.css'\` | 引入静态样式 |
| \`<MantineProvider>\` | 注入主题上下文 |
| \`<ColorSchemeScript>\` | 防止暗色模式闪烁 |

下一章我们正式学习第一个组件——Button，它是理解 Mantine props 体系的钥匙。`,
  },

  // ============================================================
  // 第二章 第一个组件：Button 与 props 体系
  // ============================================================
  {
    id: 'mantine2-ch02',
    group: '第一部分 入门基础',
    icon: '🔘',
    title: '第二章 第一个组件：Button 与 props 体系',
    content: `## 一句话目标

通过 Button 组件，掌握 Mantine 所有组件通用的 props 体系——\`variant\`、\`color\`、\`size\`、\`radius\`、\`loaderProps\` 等。学会一个，会一堆。

---

## 一、Button 的五大核心 props

\`\`\`jsx
import { Button, Group } from '@mantine/core';

export default function Demo() {
  return (
    // Group：水平排列容器，gap 控制间距
    <Group>
      {/* 1. variant：视觉样式（最重要！）
          - filled：实心（默认，主操作按钮）
          - outline：描边（次操作按钮）
          - light：浅色背景（辅助操作）
          - subtle：透明背景（弱化操作）
          - transparent：完全透明
          - default：灰色描边（像原生按钮） */}
      <Button variant="filled">Filled</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="light">Light</Button>
      <Button variant="subtle">Subtle</Button>
      <Button variant="default">Default</Button>

      {/* 2. color：主题色，可以是预设名或自定义色
          预设：blue、red、green、orange、grape、violet、indigo 等 */}
      <Button color="red">红色</Button>
      <Button color="grape">葡萄紫</Button>

      {/* 3. size：尺寸
          - xs：超小（表格内操作）
          - sm：小（表单内）
          - md：中（默认，常规按钮）
          - lg：大（落地页 CTA）
          - xl：超大（营销页主按钮） */}
      <Button size="xs">XS</Button>
      <Button size="lg">LG</Button>

      {/* 4. radius：圆角
          - xs/sm/md/lg/xl：从小到大
          - xl 接近胶囊形 */}
      <Button radius="xl">圆角按钮</Button>

      {/* 5. loading：加载状态（提交表单时用）
          自动禁用点击 + 显示旋转加载图标 */}
      <Button loading>提交中</Button>
    </Group>
  );
}
\`\`\`

> ⭐ **核心心法**：\`variant\` + \`color\` + \`size\` 这三个 props 几乎所有 Mantine 组件都有。记住这套组合拳，80% 的组件你都会调样式了。

---

## 二、按钮内嵌图标

Mantine 按钮支持任意子元素，图标放前面即可：

\`\`\`jsx
import { Button, Group } from '@mantine/core';
// @tabler/icons-react 提供 4000+ 图标，按需引入
import { IconHeart, IconDownload, IconTrash } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Group>
      {/* 左侧图标：直接放在文字前面 */}
      <Button leftSection={<IconHeart size={16} />}>
        收藏
      </Button>

      {/* 右侧图标：放在文字后面 */}
      <Button rightSection={<IconDownload size={16} />}>
        下载
      </Button>

      {/* 只有图标（无文字）：建议用 ActionIcon，但 Button 也能用 */}
      <Button leftSection={<IconTrash size={16} />} color="red" variant="light">
        删除
      </Button>
    </Group>
  );
}
\`\`\`

**为什么用 leftSection / rightSection 而不是直接写？**

因为它们保证图标和文字之间的**间距自动对齐**，不用手动调 margin。

---

## 三、渐变按钮

\`\`\`jsx
import { Button, Group } from '@mantine/core';

export default function Demo() {
  return (
    <Group>
      {/* variant="gradient" + gradient prop 控制渐变
          from：起始色，to：结束色，deg：角度 */}
      <Button variant="gradient" gradient={{ from: 'violet', to: 'indigo', deg: 90 }}>
        渐变按钮
      </Button>

      <Button variant="gradient" gradient={{ from: 'orange', to: 'red' }}>
        警告渐变
      </Button>

      {/* 多段渐变（Mantine v7+ 支持） */}
      <Button variant="gradient" gradient={{ from: 'teal', to: 'lime', deg: 45 }}>
        清新渐变
      </Button>
    </Group>
  );
}
\`\`\`

---

## 四、按钮组 ButtonGroup

多个按钮要连在一起时用 \`Button.Group\`：

\`\`\`jsx
import { Button, ButtonGroup } from '@mantine/core';

export default function Demo() {
  return (
    // borderWidth：组内边框宽度（默认 1px）
    <ButtonGroup>
      <Button variant="default">左</Button>
      <Button variant="default">中</Button>
      <Button variant="default">右</Button>
    </ButtonGroup>
  );
}
\`\`\`

---

## 五、完整 props 表

| prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| variant | filled/outline/light/subtle/transparent/default | filled | 视觉样式 |
| color | 主题色名 | blue | 颜色 |
| size | xs/sm/md/lg/xl | sm | 尺寸 |
| radius | xs/sm/md/lg/xl | sm | 圆角 |
| loading | boolean | false | 加载状态 |
| disabled | boolean | false | 禁用 |
| fullWidth | boolean | false | 占满宽度 |
| leftSection | ReactNode | - | 左侧内容 |
| rightSection | ReactNode | - | 右侧内容 |
| loaderProps | object | - | 加载图标配置 |
| gradient | {from,to,deg} | - | 渐变配置 |

---

## 小结

- \`variant\` 决定样式骨架，\`color\` 决定颜色，\`size\` 决定大小。
- 图标用 \`leftSection\` / \`rightSection\`，间距自动。
- \`loading\` 状态自动禁用 + 显示 spinner。

下一章我们深入主题系统，学会自定义颜色、圆角等全局样式。`,
  },

  // ============================================================
  // 第三章 主题初探：primaryColor、colors、radius
  // ============================================================
  {
    id: 'mantine2-ch03',
    group: '第一部分 入门基础',
    icon: '🎨',
    title: '第三章 主题初探：primaryColor、colors、radius',
    content: `## 一句话目标

学会用 \`createTheme\` 自定义全局主题——改主色、改圆角、改字体大小、改间距，一处改全局生效。

---

## 一、Mantine 主题系统是什么

Mantine 的样式由 **CSS 变量**驱动。比如 \`color="blue"\` 实际上是用了 \`--mantine-color-blue-6\` 这个变量。

主题系统的作用：**覆盖这些 CSS 变量的默认值**。

\`\`\`
Button color="blue"
       ↓
读取 --mantine-color-blue-6
       ↓
MantineProvider 注入的 CSS 变量
\`\`\`

所以改主题 = 改 CSS 变量 = 全局生效。

---

## 二、createTheme：创建自定义主题

\`\`\`jsx
// app/layout.js
import '@mantine/core/styles.css';
import { MantineProvider, createTheme, ColorSchemeScript } from '@mantine/core';

// createTheme：创建主题对象，会与默认主题深合并
const theme = createTheme({
  // 1. primaryColor：主色，影响所有未指定 color 的组件
  // 比如改成 indigo，所有 <Button> 默认就是靛蓝色
  primaryColor: 'indigo',

  // 2. fontFamily：全局字体
  fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',

  // 3. headings：标题字体配置（影响 Title 组件）
  headings: {
    fontFamily: 'system-ui, sans-serif',
    sizes: {
      h1: { fontSize: '2.5rem', fontWeight: 800 },
      h2: { fontSize: '2rem', fontWeight: 700 },
    },
  },

  // 4. defaultRadius：全局默认圆角
  // 影响所有未指定 radius 的组件
  // 可选：xs/sm/md/lg/xl 或具体像素值
  defaultRadius: 'md',

  // 5. spacing：间距系统（影响 Stack/Group 的 gap 等）
  // 默认：xs=10, sm=12, md=16, lg=20, xl=24
  spacing: {
    md: '14px',  // 改 md 为 14px
  },

  // 6. fontSizes：字号系统（影响 Text size、Button size 等）
  fontSizes: {
    md: '15px',  // 默认 14px，改成 15px 让正文大一点
  },
});

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <head><ColorSchemeScript /></head>
      <body>
        {/* theme={theme}：传入自定义主题 */}
        <MantineProvider theme={theme} defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
\`\`\`

> ⭐ \`createTheme\` 会与默认主题**深合并**——你只写要改的字段，其他保留默认。

---

## 三、primaryColor 的作用范围

改 \`primaryColor\` 后，**所有未显式指定 color 的组件**都会用这个色：

\`\`\`jsx
import { Button, Badge, Switch, Slider, Group } from '@mantine/core';

// 假设主题设置了 primaryColor: 'indigo'
export default function Demo() {
  return (
    <Group>
      {/* 这三个都没指定 color，都会是 indigo */}
      <Button>主按钮</Button>
      <Badge>新</Badge>
      <Switch defaultChecked />

      {/* 显式指定 color 的不受影响 */}
      <Button color="red">红色按钮</Button>
    </Group>
  );
}
\`\`\`

---

## 四、自定义颜色

Mantine 预设了 30+ 颜色，但你可以加自己的：

\`\`\`jsx
import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({
  // colors：扩展或覆盖颜色
  // 每个颜色是 10 个色阶的数组（0 最浅，9 最深）
  // Mantine 组件用 color="brand" 时取第 6 阶
  colors: {
    // 添加自定义品牌色 "brand"
    brand: [
      '#eef2ff', // 0：最浅，用于浅色背景
      '#e0e7ff', // 1
      '#c7d2fe', // 2
      '#a5b4fc', // 3
      '#818cf8', // 4
      '#6366f1', // 5
      '#4f46e5', // 6：主色（组件默认用这阶）
      '#4338ca', // 7：hover 态
      '#3730a3', // 8
      '#312e81', // 9：最深
    ],
  },
  // 把 primaryColor 指向自定义品牌色
  primaryColor: 'brand',
});
\`\`\`

**为什么是 10 个色阶？**

因为同一颜色在不同场景需要不同明度：
- 浅色背景（variant="light"）用色阶 0
- 文字色用色阶 6
- hover 态用色阶 7
- 深色背景用色阶 9

---

## 五、覆盖组件默认 props

\`\`\`jsx
const theme = createTheme({
  // components：覆盖单个组件的默认 props
  // 比如让所有 Button 默认用 outline 样式
  components: {
    Button: {
      defaultProps: {
        variant: 'outline',
        size: 'md',
      },
    },
    // 让所有 TextInput 默认带描述占位
    TextInput: {
      defaultProps: {
        size: 'md',
      },
    },
  },
});
\`\`\`

> ⭐ 这招在**统一设计规范**时超有用——不用每个组件都写 \`size="md"\`，全局设一次即可。

---

## 小结

| 配置 | 作用 |
| --- | --- |
| \`primaryColor\` | 全局主色 |
| \`colors\` | 自定义/覆盖颜色色阶 |
| \`defaultRadius\` | 全局圆角 |
| \`fontFamily\` | 全局字体 |
| \`components.X.defaultProps\` | 组件默认 props |

下一章我们学暗色模式——Mantine 最被夸奖的功能之一。`,
  },

  // ============================================================
  // 第四章 暗色模式：颜色方案切换
  // ============================================================
  {
    id: 'mantine2-ch04',
    group: '第一部分 入门基础',
    icon: '🌙',
    title: '第四章 暗色模式：颜色方案切换',
    content: `## 一句话目标

实现「亮/暗/跟随系统」三态切换，且刷新不闪烁——这是 Mantine 最被夸奖的功能之一。

---

## 一、Mantine 颜色方案三态

Mantine 支持 \`light\` / \`dark\` / \`auto\` 三种颜色方案：

- \`light\`：强制亮色
- \`dark\`：强制暗色
- \`auto\`：跟随系统（用户在 OS 设置的暗色模式）

\`\`\`jsx
// app/layout.js
import { MantineProvider, ColorSchemeScript } from '@mantine/core';

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <head>
        {/* defaultColorScheme="auto"：默认跟随系统
            也可设 "light" 或 "dark" */}
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
\`\`\`

---

## 二、useMantineColorScheme：切换颜色方案

\`\`\`jsx
'use client';
import { useMantineColorScheme, Button, Group } from '@mantine/core';

export default function ThemeToggle() {
  // useMantineColorScheme：颜色方案 hook
  const { colorScheme, setColorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Group>
      {/* colorScheme：当前设置的值（可能是 "auto"） */}
      <span>当前方案：{colorScheme}</span>

      {/* setColorScheme：直接设置成某个值 */}
      <Button size="xs" variant="light" onClick={() => setColorScheme('light')}>
        亮色
      </Button>
      <Button size="xs" variant="light" onClick={() => setColorScheme('dark')}>
        暗色
      </Button>
      <Button size="xs" variant="light" onClick={() => setColorScheme('auto')}>
        跟随系统
      </Button>

      {/* toggleColorScheme：在 light/dark 间切换（auto 不参与） */}
      <Button size="xs" onClick={toggleColorScheme}>
        切换
      </Button>
    </Group>
  );
}
\`\`\`

> ⭐ \`toggleColorScheme\` 是最常用的——配合一个图标按钮，就是经典的「日/月切换」按钮。

---

## 三、useComputedColorScheme：拿实际生效的值

\`colorScheme\` 可能是 \`"auto"\`，但你要渲染亮/暗图标时需要知道**实际是亮还是暗**。这时用 \`useComputedColorScheme\`：

\`\`\`jsx
'use client';
import { useMantineColorScheme, useComputedColorScheme, ActionIcon } from '@mantine/core';

export default function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  // useComputedColorScheme：把 "auto" 解析成实际的 "light" 或 "dark"
  // getInitialValueInEffect：首次渲染用默认值，effect 后才读真实值
  // （避免 SSR 与客户端不一致）
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = computedColorScheme === 'dark';

  return (
    <ActionIcon
      variant="default"
      size="lg"
      onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
      aria-label="切换主题"
    >
      {isDark ? '☀️' : '🌙'}
    </ActionIcon>
  );
}
\`\`\`

**为什么不用 \`colorScheme === 'dark'\`？**

因为用户可能设的是 \`"auto"\`，此时 \`colorScheme\` 是 \`"auto"\` 而不是 \`"dark"\`，但实际显示是暗色。用 \`useComputedColorScheme\` 才能拿到真实值。

---

## 四、为什么不会闪烁（FOUC）

刷新页面时，如果用户上次选了暗色，HTML 返回时还不知道用户选啥——会先渲染亮色，JS 加载后再切暗色，造成「亮→暗」闪烁。

Mantine 用 \`ColorSchemeScript\` 解决：

\`\`\`jsx
<head>
  {/* ColorSchemeScript 在 HTML 里注入一段同步脚本
      它会在 React hydration 之前读取 localStorage 的值，
      给 <html> 加上 data-mantine-color-scheme="dark" 属性
      这样 CSS 立即生效，不会闪烁 */}
  <ColorSchemeScript defaultColorScheme="light" />
</head>
\`\`\`

**工作流程：**

1. 用户选了暗色 → \`setColorScheme('dark')\` → 写入 localStorage
2. 刷新页面 → HTML 返回 → \`ColorSchemeScript\` 同步执行
3. 脚本读 localStorage → 给 \`<html>\` 加 \`data-mantine-color-scheme="dark"\`
4. CSS 立即生效（Mantine 的 CSS 基于 \`[data-mantine-color-scheme]\` 选择器）
5. React hydration → 显示暗色界面（与初始一致，无闪烁）

---

## 五、持久化用户选择

\`setColorScheme\` 会自动把值写入 localStorage（key 是 \`color-scheme\`），所以**不用自己存**。

但如果你想自定义存储 key 或同步到后端，可以这样：

\`\`\`jsx
'use client';
import { useEffect } from 'react';
import { useMantineColorScheme } from '@mantine/core';

export function SyncThemeToBackend({ userId }) {
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    // colorScheme 变化时同步到后端用户偏好
    if (userId) {
      fetch('/api/user/preferences', {
        method: 'POST',
        body: JSON.stringify({ theme: colorScheme }),
      });
    }
  }, [colorScheme, userId]);

  return null;
}
\`\`\`

---

## 小结

| API | 作用 |
| --- | --- |
| \`defaultColorScheme\` | 初始默认方案 |
| \`useMantineColorScheme\` | 读/写颜色方案（含 auto） |
| \`useComputedColorScheme\` | 拿实际生效的 light/dark |
| \`ColorSchemeScript\` | 防 SSR 闪烁 |

至此入门基础结束。下一部分我们系统学习文本与排版组件。`,
  },
];

export { chapters };
