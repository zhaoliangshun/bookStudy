// =============================================================
// Mantine 教程 —— 第 1 批：基础入门
// -------------------------------------------------------------
// 覆盖：Mantine 介绍、安装与 Next.js App Router 集成、主题系统、
//       常用组件（Button、TextInput、Select、Modal、布局组件等）。
// 章节对象格式与 rhf-chapters-batch1.js 一致：
//   { id, group, icon, title, content, code }
//   - content: Markdown 字符串（内部 ``` 代码围栏需写成 \`\`\` 转义）
//   - code:    可选的 CodeBlock 源码字符串（教程页底部展示，可在线运行）
// =============================================================

export const chapters = [
  // -------------------------------------------------------------
  // 章节 1：Mantine 是什么
  // -------------------------------------------------------------
  {
    id: "m-intro",
    group: "基础入门",
    icon: "🎨",
    title: "Mantine 是什么",
    content: `# Mantine 是什么

Mantine 是一个基于 React 的全功能 UI 组件库，主打"开箱即用"的体验。

## 为什么选 Mantine

- **100+ 组件**：Button、Input、Modal、Drawer、Table、Tabs、Stepper…… 一应俱全
- **自带 Form 库**：\`@mantine/form\` 提供强大的表单状态管理与校验，无需再装 react-hook-form
- **CSS Modules 驱动**：v7 之后脱离 emotion，v9 完全基于 CSS Modules，性能更好、SSR 友好
- **主题系统强大**：基于 CSS Variables，运行时切换主题/暗色模式零延迟
- **TypeScript 优先**：所有组件类型完备，IDE 提示优秀
- **Hooks 库附赠**：\`@mantine/hooks\` 提供 60+ 实用 hooks（use-debounced、use-media-query 等）

## 与其他库对比

| 特性 | Mantine v9 | Ant Design v5 | Chakra UI v3 |
| --- | --- | --- | --- |
| 样式方案 | CSS Modules | CSS-in-JS | CSS-in-JS |
| Form 库 | 自带 @mantine/form | 无 | 无 |
| SSR 性能 | 优秀（无运行时 CSS 注入） | 一般 | 一般 |
| 暗色模式 | 内置 | 内置 | 内置 |
| 包体积 | 中等 | 较大 | 较小 |

## v9 的重要变化（如果你用过旧版）

- 弃用 emotion，全面改用 **CSS Modules**（\`*.module.css\`）
- 组件样式通过 \`@mantine/core/styles.css\` 全局引入一次即可
- 主题覆盖通过 \`createTheme\` + CSS Variables，不再需要 \`<CacheProvider>\`
- \`styles\` API 仍保留，但优先推荐用 \`classNames\` + CSS Modules

下一章我们正式开始安装与集成。
`,
  },

  // -------------------------------------------------------------
  // 章节 2：安装与 Next.js App Router 集成
  // -------------------------------------------------------------
  {
    id: "m-install",
    group: "基础入门",
    icon: "📦",
    title: "安装与 Next.js 集成",
    content: `# 安装与 Next.js App Router 集成

## 1. 安装依赖

\`\`\`bash
# 核心库 + hooks + form 库
npm install @mantine/core @mantine/hooks @mantine/form

# 可选：通知、提示等附加组件
npm install @mantine/notifications @mantine/dates

# 校验库（与 form 配合使用）
npm install zod
\`\`\`

## 2. 引入全局样式

在 \`app/layout.js\` 顶部**只引入一次**：

\`\`\`js
import "@mantine/core/styles.css";
\`\`\`

> **注意**：v9 不再需要 emotion、不再需要 \`<CacheProvider>\`、不再需要 ServerStyleSheet。
> 这一行的 \`styles.css\` 包含了所有组件的基础样式 + CSS Variables 定义。

## 3. 用 MantineProvider 包裹根 layout

\`\`\`jsx
// app/layout.js
import "@mantine/core/styles.css";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";

export const metadata = {
  title: "My App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <head>
        {/* 防止首屏主题闪烁（FOUC）：在 hydration 前注入 localStorage 中的主题 */}
        <ColorSchemeScript />
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

## 关键点说明

### ColorSchemeScript 的作用

如果用户上次选了暗色模式，刷新页面时 React 还没 hydrate，
浏览器会先用 light 主题渲染 → hydrate 后切到 dark，造成"白闪一下"。
\`<ColorSchemeScript />\` 会在 \`<head>\` 里塞一段同步脚本，hydration 前就设置好 \`data-mantine-color-scheme\` 属性。

### MantineProvider 放在哪

- **全局**：放 \`app/layout.js\`，全站都能用 Mantine 组件
- **局部**：放某个子路由的 \`layout.js\`（如 \`app/blog/layout.js\`），
  只在该子树生效，不影响其他页面

本项目因为已有主题系统，所以 Mantine 的 demo 走的是**局部 layout** 方案，
放在 \`app/mantine-demo/layout.js\` 里，这样不会污染教程主站的主题。

## 4. 验证安装

随便在某个客户端组件里写：

\`\`\`jsx
"use client";
import { Button } from "@mantine/core";

export default function Test() {
  return <Button color="blue">Hello Mantine</Button>;
}
\`\`\`

能看到带蓝色背景的按钮就成功了。下一章讲主题。
`,
    code: `// app/mantine-demo/layout.js
// 局部 layout 示例：只在 /mantine-demo 路由下启用 MantineProvider
import "@mantine/core/styles.css";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";

export const metadata = {
  title: "Mantine Demo",
};

export default function MantineDemoLayout({ children }) {
  return (
    <MantineProvider defaultColorScheme="light">
      {/* ColorSchemeScript 必须放在 head 里，这里因为是嵌套 layout，
          Next.js 会自动把它放到 <head> */}
      <ColorSchemeScript />
      {children}
    </MantineProvider>
  );
}
`,
  },

  // -------------------------------------------------------------
  // 章节 3：主题系统与 createTheme
  // -------------------------------------------------------------
  {
    id: "m-theme",
    group: "基础入门",
    icon: "🎭",
    title: "主题系统与 createTheme",
    content: `# 主题系统与 createTheme

Mantine 的主题通过 \`createTheme\` 创建，传给 \`<MantineProvider theme={...}>\`。
主题会自动转成 **CSS Variables** 注入到 \`<body>\` 上，所有组件通过 var() 读取。

## 最简主题

\`\`\`jsx
import { createTheme, MantineProvider } from "@mantine/core";

const theme = createTheme({
  // 主色：blue/green/red/grape/... 或自定义
  primaryColor: "grape",
  // 字体
  fontFamily: "system-ui, sans-serif",
  // 默认圆角
  defaultRadius: "md",
});

export default function App({ children }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {children}
    </MantineProvider>
  );
}
\`\`\`

## 自定义颜色

每个颜色是 10 个色阶的数组（从亮到暗），Mantine 用它生成各种状态色：

\`\`\`js
const brand = createTheme({
  colors: {
    // 自定义品牌色，10 阶色阶
    brand: [
      "#f0eeff", // 0 最浅
      "#dbd7ff",
      "#b8acff",
      "#9580ff",
      "#7c5fff",
      "#6b3fff", // 5 - 主色阶
      "#5f2fff",
      "#5024e0",
      "#4219d1",
      "#3009c2", // 9 最深
    ],
  },
  primaryColor: "brand", // 用 brand 作为主色
});
\`\`\`

## 自定义组件默认值

\`components\` 字段可以**给某个组件统一改默认 props**：

\`\`\`js
const theme = createTheme({
  components: {
    Button: {
      defaultProps: {
        // 全站 Button 默认用 filled 变体
        variant: "filled",
        // 默认圆角
        radius: "xl",
      },
    },
    TextInput: {
      defaultProps: {
        size: "md",
      },
    },
  },
});
\`\`\`

## 主题切换（暗色模式）

\`\`\`jsx
"use client";
import { useMantineColorScheme, Button } from "@mantine/core";

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  return (
    <Button onClick={() => toggleColorScheme()}>
      切换到 {colorScheme === "dark" ? "亮色" : "暗色"}
    </Button>
  );
}
\`\`\`

\`toggleColorScheme()\` 会自动把新值写进 localStorage（key 默认 \`mantine-color-scheme\`），
刷新后 \`ColorSchemeScript\` 读取这个值，所以能保持主题状态。

## CSS Variables 是什么

主题注入后，\`<body>\` 上会出现形如：

\`\`\`css
body {
  --mantine-color-blue-5: #228be6;
  --mantine-color-text: #25262b;
  --mantine-radius-md: 8px;
  /* ... 上百个变量 */
}
\`\`\`

任何地方都能用 \`var(--mantine-color-blue-5)\` 直接引用，包括你自己的 CSS 文件。
这是 Mantine 与传统 CSS-in-JS 最大的不同。
`,
    code: `// 完整主题示例：自定义品牌色 + 组件默认值
import { createTheme, MantineProvider, Button, TextInput, Stack } from "@mantine/core";

const theme = createTheme({
  primaryColor: "brand",
  colors: {
    brand: ["#f0eeff", "#dbd7ff", "#b8acff", "#9580ff",
            "#7c5fff", "#6b3fff", "#5f2fff", "#5024e0",
            "#4219d1", "#3009c2"],
  },
  defaultRadius: "md",
  components: {
    Button: { defaultProps: { radius: "xl" } },
  },
});

export default function Demo() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Stack p="md">
        <Button>主色按钮（brand）</Button>
        <Button color="blue">蓝色按钮</Button>
        <TextInput placeholder="默认 size=md" />
      </Stack>
    </MantineProvider>
  );
}
`,
  },

  // -------------------------------------------------------------
  // 章节 4：Button 与 ActionIcon
  // -------------------------------------------------------------
  {
    id: "m-button",
    group: "基础入门",
    icon: "🔘",
    title: "Button 与 ActionIcon",
    content: `# Button 与 ActionIcon

Button 是用得最多的组件，先掌握它的几个核心属性。

## Button 的核心属性

\`\`\`jsx
import { Button, Group } from "@mantine/core";

<Group>
  {/* variant：变体（视觉风格） */}
  <Button variant="filled">filled（实心，默认）</Button>
  <Button variant="light">light（浅色背景）</Button>
  <Button variant="outline">outline（描边）</Button>
  <Button variant="subtle">subtle（无背景，hover 才有）</Button>
  <Button variant="transparent">transparent（完全透明）</Button>
  <Button variant="default">default（灰色默认按钮）</Button>

  {/* color：颜色，可取主题色名或 hex */}
  <Button color="red">红色</Button>
  <Button color="#9580ff">自定义 hex</Button>

  {/* size：尺寸 */}
  <Button size="xs">xs</Button>
  <Button size="sm">sm</Button>
  <Button size="md">md（默认）</Button>
  <Button size="lg">lg</Button>
  <Button size="xl">xl</Button>

  {/* radius：圆角 */}
  <Button radius="xl">圆角</Button>
  <Button radius={0}>直角</Button>

  {/* loading / disabled */}
  <Button loading>加载中</Button>
  <Button disabled>禁用</Button>

  {/* fullWidth：占满父容器宽度 */}
  <Button fullWidth>占满宽度</Button>
</Group>
\`\`\`

## 带图标的 Button

\`\`\`jsx
import { Button } from "@mantine/core";
// 图标可以用 lucide-react / react-icons / 任意 SVG
// 这里用纯 emoji 演示（项目里推荐用图标库）

<Button leftSection="🚀">发射</Button>
<Button rightSection="→">下一步</Button>
<Button loaderProps={{ type: "dots" }}>自定义加载</Button>
\`\`\`

## leftSection / rightSection 的用途

这两个属性用来塞**图标、头像、徽章**等到按钮内部：
- \`leftSection\`：左侧内容
- \`rightSection\`：右侧内容
- Mantine 会自动给两侧内容加合理 margin

## ActionIcon：方形小按钮

\`\`\`jsx
import { ActionIcon } from "@mantine/core";

<ActionIcon variant="default" size="lg">
  ★
</ActionIcon>

<ActionIcon variant="filled" color="red" size="xl">
  🗑
</ActionIcon>
\`\`\`

ActionIcon 和 Button 的区别：
- **Button**：用于主要操作，宽按钮，带文字
- **ActionIcon**：用于次要操作（删除、收藏、设置），通常是方形 32×32

## loadingProps 自定义加载指示器

\`\`\`jsx
<Button loading loaderProps={{ type: "dots", color: "white" }}>
  自定义 loader
</Button>
\`\`\`

Mantine 默认 loader 类型有 \`bars\` / \`dots\` / \`oval\` 三种。
全局也能在 \`createTheme\` 里改默认 loader。
`,
    code: `import { Button, ActionIcon, Group, Stack } from "@mantine/core";

export default function Demo() {
  return (
    <Stack p="md" gap="md">
      <Group>
        <Button variant="filled">filled</Button>
        <Button variant="light">light</Button>
        <Button variant="outline">outline</Button>
        <Button variant="subtle">subtle</Button>
        <Button variant="default">default</Button>
      </Group>

      <Group>
        <Button color="blue">blue</Button>
        <Button color="red">red</Button>
        <Button color="grape">grape</Button>
        <Button color="#9580ff">自定义</Button>
      </Group>

      <Group>
        <Button size="xs">xs</Button>
        <Button size="sm">sm</Button>
        <Button size="md">md</Button>
        <Button size="lg">lg</Button>
        <Button size="xl">xl</Button>
      </Group>

      <Group>
        <Button loading>加载中</Button>
        <Button disabled>禁用</Button>
        <Button leftSection="🚀">发射</Button>
        <Button rightSection="→">下一步</Button>
      </Group>

      <Group>
        <ActionIcon variant="default" size="lg" aria-label="收藏">
          ★
        </ActionIcon>
        <ActionIcon variant="filled" color="red" size="lg" aria-label="删除">
          🗑
        </ActionIcon>
      </Group>
    </Stack>
  );
}
`,
  },

  // -------------------------------------------------------------
  // 章节 5：输入组件
  // -------------------------------------------------------------
  {
    id: "m-input",
    group: "基础入门",
    icon: "⌨️",
    title: "输入组件全家桶",
    content: `# 输入组件全家桶

Mantine 提供了丰富的输入组件，统一遵守一些约定：
- 都支持 \`size\`（xs/sm/md/lg/xl）
- 都支持 \`radius\`、\`variant\`（filled/light/unstyled）
- 都支持 \`error\`（错误信息，会自动红框）
- 都支持 \`withAsterisk\`（显示必填红星）
- 都支持 \`leftSection\` / \`rightSection\`

## TextInput：文本输入

\`\`\`jsx
import { TextInput } from "@mantine/core";

<TextInput
  label="用户名"
  placeholder="请输入用户名"
  description="3-20 个字符"
  error="用户名已被占用"  // 不为空时显示红色错误信息
  withAsterisk           // 显示必填红星
  leftSection="@"
  size="md"
/>
\`\`\`

\`label\` / \`description\` / \`error\` 的区别：
- \`label\`：字段名（如"用户名"）
- \`description\`：辅助说明（如"3-20 个字符"）
- \`error\`：错误提示，会同时把输入框描红

## PasswordInput：密码输入

自带"显示密码"切换按钮：

\`\`\`jsx
import { PasswordInput } from "@mantine/core";

<PasswordInput
  label="密码"
  placeholder="至少 8 位"
  withAsterisk
  visibleToggleButtonProps={{ "aria-label": "切换显示密码" }}
/>
\`\`\`

## NumberInput：数字输入

带步进器、可限制 min/max、可格式化：

\`\`\`jsx
import { NumberInput } from "@mantine/core";

<NumberInput
  label="年龄"
  placeholder="18-99"
  min={18}
  max={99}
  step={1}
  // 千分位
  clampBehavior="strict"
  thousandSeparator=","
/>
\`\`\`

NumberInput 的事件回调是 \`onChange\`，但参数**是 number 或空字符串**（不是 event）：

\`\`\`js
<NumberInput onChange={(value) => console.log(typeof value, value)} />
// 输入 5 时打印：number 5
// 清空时打印：string "" (空字符串)
\`\`\`

> ⚠️ 这是初学者最常踩的坑！和 \`TextInput\` 的 \`onChange(e)\` 不一样。

## Textarea：多行文本

\`\`\`jsx
import { Textarea } from "@mantine/core";

<Textarea
  label="个人简介"
  placeholder="说说你自己..."
  autosize           // 高度自适应
  minRows={3}
  maxRows={8}
  maxLength={200}
/>
\`\`\`

## Textarea 自带计数器

\`\`\`jsx
<Textarea
  label="备注"
  maxLength={100}
  // 右下角显示 "12/100"
/>
\`\`\`

## Switch：开关

\`\`\`jsx
import { Switch } from "@mantine/core";

<Switch label="接收营销邮件" defaultChecked />
<Switch label="大小" size="lg" color="grape" />
<Switch
  label="带图标"
  onLabel="开"
  offLabel="关"
  size="lg"
/>
\`\`\`

## Combobox / Select 留到下章

Select、MultiSelect、TagsInput 这些属于"复杂输入"，下一章专门讲。
`,
    code: `import { TextInput, PasswordInput, NumberInput, Textarea, Switch, Stack } from "@mantine/core";

export default function Demo() {
  return (
    <Stack p="md" gap="md" style={{ maxWidth: 400 }}>
      <TextInput
        label="用户名"
        placeholder="请输入用户名"
        description="3-20 个字符"
        withAsterisk
        leftSection="@"
      />

      <TextInput
        label="带错误的输入框"
        placeholder="试试输入"
        error="用户名已被占用"
      />

      <PasswordInput
        label="密码"
        placeholder="至少 8 位"
        withAsterisk
      />

      <NumberInput
        label="年龄"
        placeholder="18-99"
        min={18}
        max={99}
        defaultValue={20}
      />

      <Textarea
        label="个人简介"
        placeholder="说说你自己..."
        autosize
        minRows={3}
        maxLength={200}
      />

      <Switch label="接收营销邮件" defaultChecked />
      <Switch
        label="带开/关文字"
        onLabel="开"
        offLabel="关"
        size="lg"
        color="grape"
      />
    </Stack>
  );
}
`,
  },

  // -------------------------------------------------------------
  // 章节 6：Select / Checkbox / Radio
  // -------------------------------------------------------------
  {
    id: "m-select",
    group: "基础入门",
    icon: "☑️",
    title: "选择类组件",
    content: `# 选择类组件

Select / Checkbox / Radio 是表单里第二大常用类型。

## Select：下拉单选

\`\`\`jsx
import { Select } from "@mantine/core";

const data = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
];

<Select
  label="选择框架"
  placeholder="选一个..."
  data={data}
  searchable       // 可搜索
  clearable         // 可清空
  nothingFoundMessage="找不到结果"
/>
\`\`\`

\`data\` 支持两种格式：
1. \`[{ value, label }]\` —— 完整对象数组
2. \`["React", "Vue"]\` —— 字符串数组（value === label）

## Select 的分组

\`\`\`js
const data = [
  { group: "前端", items: [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
  ]},
  { group: "后端", items: [
    { value: "node", label: "Node.js" },
    { value: "python", label: "Python" },
  ]},
];
\`\`\`

## MultiSelect：多选

\`\`\`jsx
import { MultiSelect } from "@mantine/core";

<MultiSelect
  label="选择技能"
  data={[{ value: "js", label: "JS" }, ...]}
  searchable
  clearable
  maxValues={5}    // 最多选 5 个
/>
\`\`\`

## TagsInput：可输入新标签

MultiSelect 只能选预设值，TagsInput 允许用户**自己输入新值**：

\`\`\`jsx
import { TagsInput } from "@mantine/core";

<TagsInput
  label="标签"
  placeholder="输入后回车添加"
  data={["已存在的标签"]}
  // 允许用户输入不在 data 里的新值
  acceptValueOnBlur
/>
\`\`\`

## Checkbox：复选框

\`\`\`jsx
import { Checkbox } from "@mantine/core";

<Checkbox label="同意服务条款" />
<Checkbox label="禁用" disabled />
<Checkbox
  label="自定义颜色"
  color="grape"
  size="lg"
  radius="xl"
/>
\`\`\`

## Checkbox.Group：复选组

\`\`\`jsx
import { Checkbox, Stack } from "@mantine/core";

<Checkbox.Group label="选择你感兴趣的领域">
  <Stack mt="xs">
    <Checkbox value="frontend" label="前端" />
    <Checkbox value="backend" label="后端" />
    <Checkbox value="devops" label="运维" />
  </Stack>
</Checkbox.Group>
\`\`\`

## Radio.Group：单选组

\`\`\`jsx
import { Radio, Stack } from "@mantine/core";

<Radio.Group label="性别" withAsterisk>
  <Stack mt="xs">
    <Radio value="male" label="男" />
    <Radio value="female" label="女" />
    <Radio value="other" label="其他" />
  </Stack>
</Radio.Group>
\`\`\`

Radio 和 Checkbox 区别：
- Checkbox：多选，每个 \`value\` 独立勾选
- Radio：单选，同名 group 内只能选一个

## SegmentedControl：分段选择器

适合 2-4 个选项的快速切换：

\`\`\`jsx
import { SegmentedControl } from "@mantine/core";

<SegmentedControl
  data={[
    { value: "list", label: "列表" },
    { value: "grid", label: "网格" },
    { value: "card", label: "卡片" },
  ]}
/>
\`\`\`

## Box 选择：CheckboxCard / RadioCard（v9 新增）

\`\`\`jsx
import { CheckboxCard } from "@mantine/core";

<CheckboxCard withBorder p="md">
  <Group>
    <CheckboxCard.Indicator />
    <div>
      <Text fw={500}>Pro Plan</Text>
      <Text size="xs" c="dimmed">月付 9.9</Text>
    </div>
  </Group>
</CheckboxCard>
\`\`\`

这种卡片式选择非常适合做套餐选择、价格方案等场景。
`,
    code: `import { Select, MultiSelect, TagsInput, Checkbox, Radio, SegmentedControl, Stack } from "@mantine/core";

const frameworkData = [
  { group: "前端", items: [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
  ]},
  { group: "后端", items: [
    { value: "node", label: "Node.js" },
    { value: "python", label: "Python" },
    { value: "go", label: "Go" },
  ]},
];

export default function Demo() {
  return (
    <Stack p="md" gap="md" style={{ maxWidth: 400 }}>
      <Select
        label="选择框架（可搜索）"
        placeholder="选一个..."
        data={frameworkData}
        searchable
        clearable
      />

      <MultiSelect
        label="选择技能（可多选）"
        placeholder="选多个..."
        data={[
          { value: "js", label: "JavaScript" },
          { value: "ts", label: "TypeScript" },
          { value: "react", label: "React" },
          { value: "node", label: "Node.js" },
        ]}
        searchable
        clearable
        maxValues={3}
      />

      <TagsInput
        label="标签（可输入新值）"
        placeholder="输入后回车添加"
        data={["已存在标签"]}
        defaultValue={["初始标签"]}
      />

      <Checkbox.Group label="兴趣领域">
        <Stack mt="xs">
          <Checkbox value="frontend" label="前端" />
          <Checkbox value="backend" label="后端" />
          <Checkbox value="devops" label="运维" />
        </Stack>
      </Checkbox.Group>

      <Radio.Group label="性别" withAsterisk defaultValue="male">
        <Stack mt="xs">
          <Radio value="male" label="男" />
          <Radio value="female" label="女" />
        </Stack>
      </Radio.Group>

      <SegmentedControl
        fullWidth
        data={[
          { value: "list", label: "列表" },
          { value: "grid", label: "网格" },
          { value: "card", label: "卡片" },
        ]}
      />
    </Stack>
  );
}
`,
  },

  // -------------------------------------------------------------
  // 章节 7：Modal / Drawer / Notification
  // -------------------------------------------------------------
  {
    id: "m-overlay",
    group: "基础入门",
    icon: "🪟",
    title: "Modal / Drawer / Notification",
    content: `# Modal / Drawer / Notification

弹层类组件用于在用户当前焦点之外显示内容。

## Modal：对话框

\`\`\`jsx
import { useDisclosure } from "@mantine/hooks";
import { Modal, Button, TextInput, Stack } from "@mantine/core";

function Demo() {
  // useDisclosure 是 Mantine 自带的开关 hook
  // 返回 [opened, { open, close, toggle }]
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>打开对话框</Button>

      <Modal
        opened={opened}
        onClose={close}
        title="用户协议"
        size="lg"           // xs/sm/md/lg/xl 或 "60%" / 数字
        centered            // 垂直居中
        closeOnClickOutside // 点击遮罩关闭（默认 true）
        closeOnEscape       // ESC 关闭（默认 true）
      >
        <Stack>
          <p>这里是内容...</p>
          <TextInput placeholder="签名" />
          <Button onClick={close}>同意并关闭</Button>
        </Stack>
      </Modal>
    </>
  );
}
\`\`\`

### useDisclosure 是什么

\`@mantine/hooks\` 提供的实用 hook，把布尔状态 + 一组操作函数打包：

\`\`\`js
const [opened, handlers] = useDisclosure(false);
// opened: 当前状态
// handlers.open()   → true
// handlers.close()  → false
// handlers.toggle() → 取反
\`\`\`

也可以传第二个参数指定初始状态切换的回调：

\`\`\`js
const [opened, { open, close, toggle }] = useDisclosure(false, {
  onOpen: () => console.log("打开了"),
  onClose: () => console.log("关闭了"),
});
\`\`\`

## Modal 的常用 size

\`\`\`jsx
<Modal size="sm" />    // 400px
<Modal size="md" />    // 500px（默认）
<Modal size="lg" />    // 600px
<Modal size="xl" />    // 800px
<Modal size="60%" />   // 60% 视口宽
<Modal size={720} />   // 720px
\`\`\`

## Drawer：抽屉

从屏幕一边滑出的面板，适合做侧边表单 / 详情页：

\`\`\`jsx
import { Drawer, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

function Demo() {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <>
      <Button onClick={open}>打开抽屉</Button>
      <Drawer
        opened={opened}
        onClose={close}
        title="设置"
        position="right"   // left / right / top / bottom
        size="md"          // 同 Modal
      >
        内容...
      </Drawer>
    </>
  );
}
\`\`\`

Drawer 和 Modal 的区别：
- **Modal**：居中弹出，盖住整个屏幕
- **Drawer**：从一边滑出，剩余空间被遮罩盖住

## Notification：通知

\`\`\`jsx
import { notifications } from "@mantine/notifications";
import { Button } from "@mantine/core";

// 注意：要先在根布局包 MantineProvider + Notifications
function Demo() {
  return (
    <Button
      onClick={() =>
        notifications.show({
          title: "操作成功",
          message: "数据已保存",
          color: "green",
          autoClose: 3000, // 3 秒后自动关闭
          withCloseButton: true,
        })
      }
    >
      显示通知
    </Button>
  );
}
\`\`\`

> \`@mantine/notifications\` 需要单独安装：\`npm install @mantine/notifications\`
> 并在 \`<MantineProvider>\` 内部包一层 \`<Notifications position="top-right" />\`

## Alert：内联提示

不是浮层，嵌在页面里的提示框：

\`\`\`jsx
import { Alert } from "@mantine/core";

<Alert
  title="注意"
  color="yellow"
  variant="light"
>
  你的会员将在 3 天后到期
</Alert>
\`\`\`

Alert 4 个变体：
- \`light\`：浅色背景
- \`filled\`：实色背景
- \`outline\`：描边
- \`transparent\`：透明
`,
    code: `import { useDisclosure } from "@mantine/hooks";
import { Modal, Drawer, Button, TextInput, Stack, Alert } from "@mantine/core";

export default function Demo() {
  const [modalOpen, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [drawerOpen, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  return (
    <Stack p="md" gap="md" style={{ maxWidth: 400 }}>
      <Button onClick={openModal}>打开 Modal</Button>
      <Button variant="light" onClick={openDrawer}>打开 Drawer</Button>

      <Alert title="注意" color="yellow" variant="light">
        你的会员将在 3 天后到期
      </Alert>

      <Alert title="成功" color="green" variant="filled">
        数据已保存
      </Alert>

      <Modal
        opened={modalOpen}
        onClose={closeModal}
        title="用户协议"
        size="lg"
        centered
      >
        <Stack>
          <p>这里是协议内容...</p>
          <TextInput placeholder="请输入签名" />
          <Button onClick={closeModal}>同意并关闭</Button>
        </Stack>
      </Modal>

      <Drawer
        opened={drawerOpen}
        onClose={closeDrawer}
        title="设置"
        position="right"
      >
        <Stack>
          <TextInput label="昵称" defaultValue="小明" />
          <TextInput label="邮箱" defaultValue="xm@example.com" />
          <Button>保存</Button>
        </Stack>
      </Drawer>
    </Stack>
  );
}
`,
  },

  // -------------------------------------------------------------
  // 章节 8：布局组件
  // -------------------------------------------------------------
  {
    id: "m-layout",
    group: "基础入门",
    icon: "📐",
    title: "布局组件",
    content: `# 布局组件

Mantine 提供了几个核心布局组件，掌握它们就基本能应付所有页面布局。

## Container：居中容器

\`\`\`jsx
import { Container } from "@mantine/core";

<Container size="md">  {/* 默认 1200px */}
  内容
</Container>

<Container size={800}>  {/* 自定义宽度 */}
  内容
</Container>

<Container fluid>  {/* 100% 宽度 */}
  内容
</Container>
\`\`\`

size 预设：\`xs=540\` \`sm=720\` \`md=960\` \`lg=1140\` \`xl=1320\`

## Stack：垂直堆叠（最常用）

\`\`\`jsx
import { Stack, Button, TextInput } from "@mantine/core";

<Stack gap="md">  {/* 间距：xs/sm/md/lg/xl 或数字 */}
  <TextInput placeholder="姓名" />
  <TextInput placeholder="邮箱" />
  <Button>提交</Button>
</Stack>
\`\`\`

Stack 默认 \`align="stretch"\`（占满宽度），可以改：

\`\`\`jsx
<Stack align="center">  {/* 居中 */}
<Stack align="flex-start">  {/* 靠左 */}
\`\`\`

## Group：水平排列

\`\`\`jsx
import { Group, Button } from "@mantine/core";

<Group gap="md">
  <Button>确定</Button>
  <Button variant="default">取消</Button>
</Group>
\`\`\`

Group 关键 props：
- \`gap\`：元素间距
- \`justify\`：主轴对齐（flex-start / center / flex-end / space-between）
- \`align\`：交叉轴对齐
- \`wrap\`：是否换行（默认 \`wrap\`）
- \`grow\`：是否让子元素平分宽度

## Flex：自定义 flex 容器

\`\`\`jsx
import { Flex, Box } from "@mantine/core";

<Flex gap="md" justify="center" align="center" direction="row" wrap="wrap">
  <Box bg="blue" p="md" c="white">A</Box>
  <Box bg="red" p="md" c="white">B</Box>
  <Box bg="green" p="md" c="white">C</Box>
</Flex>
\`\`\`

Flex 和 Group 区别：
- **Group**：只能水平，自动间距，方便
- **Flex**：完全自定义 \`direction\`/\`justify\`/\`align\`，更灵活

## Grid：栅格系统

\`\`\`jsx
import { Grid, Box } from "@mantine/core";

<Grid>
  <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
    <Box bg="blue" p="md">1</Box>
  </Grid.Col>
  <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
    <Box bg="red" p="md">2</Box>
  </Grid.Col>
  <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
    <Box bg="green" p="md">3</Box>
  </Grid.Col>
</Grid>
\`\`\`

\`span\` 的对象语法是**响应式**的：
- \`base\`：默认（手机）
- \`sm\` / \`md\` / \`lg\` / \`xl\`：不同断点

12 列栅格，\`span={6}\` 表示占一半，\`span={4}\` 占 1/3。

## Paper：内容卡片

\`Paper\` 是带阴影、圆角、背景色的容器，几乎所有卡片都用它做底：

\`\`\`jsx
import { Paper, Text } from "@mantine/core";

<Paper shadow="sm" radius="md" p="lg" withBorder>
  <Text>带细边框的卡片</Text>
</Paper>

<Paper shadow="xl" radius="lg" p="lg" bg="gray.0">
  <Text>带大阴影的卡片</Text>
</Paper>
\`\`\`

shadow 预设：\`xs\` \`sm\` \`md\` \`lg\` \`xl\`，由主题的 shadows 决定。

## Box：通用盒子

最基础的盒子，支持所有 CSS style props：

\`\`\`jsx
import { Box } from "@mantine/core";

<Box
  bg="blue.5"
  c="white"
  p="md"
  m="sm"
  style={{ borderRadius: 8 }}
>
  内容
</Box>
\`\`\`

Mantine 的 style props 是快捷方式，等同于：
- \`bg="blue.5"\` → \`backgroundColor: var(--mantine-color-blue-5)\`
- \`c="white"\` → \`color: white\`
- \`p="md"\` → \`padding: var(--mantine-spacing-md)\`

## Center：完美居中

\`\`\`jsx
import { Center, Box } from "@mantine/core";

<Center h={200}>  {/* 高度 200px，内容水平+垂直居中 */}
  <Box>居中内容</Box>
</Center>
\`\`\`

## SimpleGrid：自适应网格

不需要算列数，自动按最小宽度排：

\`\`\`jsx
import { SimpleGrid, Box } from "@mantine/core";

<SimpleGrid
  cols={{ base: 1, sm: 2, lg: 3 }}  {/* 各断点列数 */}
  spacing="lg"
>
  <Box bg="blue">1</Box>
  <Box bg="red">2</Box>
  <Box bg="green">3</Box>
  <Box bg="yellow">4</Box>
</SimpleGrid>
\`\`\`

\`spacingSm\` / \`spacingLg\` 还能让不同断点用不同间距。
`,
    code: `import { Container, Stack, Group, Flex, Grid, Paper, Box, Text, SimpleGrid, Center } from "@mantine/core";

export default function Demo() {
  return (
    <Container size="md" p="md">
      <Stack gap="md">
        {/* Stack：垂直堆叠 */}
        <Stack gap="xs">
          <Text fw={500}>1. Stack（垂直堆叠）</Text>
          <TextInputDemo />
        </Stack>

        {/* Group：水平排列 */}
        <Paper p="sm" withBorder>
          <Text fw={500} mb="xs">2. Group（水平排列）</Text>
          <Group justify="space-between">
            <span>左</span>
            <span>右</span>
          </Group>
        </Paper>

        {/* Grid：响应式栅格 */}
        <Paper p="sm" withBorder>
          <Text fw={500} mb="xs">3. Grid（响应式栅格）</Text>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <Box bg="blue" p="md" c="white" ta="center">1</Box>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <Box bg="red" p="md" c="white" ta="center">2</Box>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <Box bg="green" p="md" c="white" ta="center">3</Box>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* SimpleGrid：自适应网格 */}
        <Paper p="sm" withBorder>
          <Text fw={500} mb="xs">4. SimpleGrid（自适应）</Text>
          <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="sm">
            <Box bg="grape" p="md" c="white" ta="center">A</Box>
            <Box bg="grape" p="md" c="white" ta="center">B</Box>
            <Box bg="grape" p="md" c="white" ta="center">C</Box>
            <Box bg="grape" p="md" c="white" ta="center">D</Box>
          </SimpleGrid>
        </Paper>

        {/* Center：居中 */}
        <Paper p="sm" withBorder>
          <Text fw={500} mb="xs">5. Center（居中）</Text>
          <Center h={100} bg="gray.0">
            <Text>水平 + 垂直居中</Text>
          </Center>
        </Paper>
      </Stack>
    </Container>
  );
}

function TextInputDemo() {
  // 占位，避免引入太多组件
  return (
    <Paper p="sm" withBorder>
      <Text>Stack 子项 1</Text>
      <Text>Stack 子项 2</Text>
      <Text>Stack 子项 3</Text>
    </Paper>
  );
}
`,
  },
];
