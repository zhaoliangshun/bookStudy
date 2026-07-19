// =============================================================
// Mantine 从入门到精通大全 - 第二批章节（第二部分 文本与排版，共 5 项）
// -------------------------------------------------------------
// 本批包含：
//   mantine2-ch05 : 第五章 Text 文本组件全解
//   mantine2-ch06 : 第六章 Title 标题与 Anchor 锚点
//   mantine2-ch07 : 第七章 List 列表与 Blockquote 引用
//   mantine2-ch08 : 第八章 Mark/Code/Kbd/Highlight 高亮与代码
//   mantine2-ch09 : 第九章 TypographyStylesProvider 与排版系统
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：Mantine v9 / React 19 / Next.js 16
// =============================================================

const chapters = [
  // ============================================================
  // 第五章 Text 文本组件全解
  // ============================================================
  {
    id: 'mantine2-ch05',
    group: '第二部分 文本与排版',
    icon: '📝',
    title: '第五章 Text 文本组件全解',
    content: `## 一句话目标

掌握 Mantine 使用频率最高的 \`Text\` 组件——\`size\`、\`fw\`、\`c\`、\`ta\`、\`td\`、\`tt\`、\`fs\`、\`lh\` 等排版属性，以及 \`span\`、\`truncate\`、\`lineClamp\`、\`inherit\`、\`gradient\`、\`component\` 等进阶用法。学完这章，UI 上 90% 的文字你都能优雅处理。

---

## 一、Text 是什么

\`Text\` 是 Mantine 里最基础的文本组件，它本质上是一个带样式 props 的 \`<div>\`（或 \`<p>\`、\`<span>\`）。

**为什么不用原生 \`<p>\`？**

因为原生标签调字号、颜色、行高都要写 CSS。而 \`Text\` 把这些常用排版属性变成了 props——一行 JSX 就搞定，配合主题系统还能自动适配暗色模式。

\`\`\`jsx
import { Text, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* 最朴素的 Text，默认是 <p> 标签，size="sm" */}
      <Text>这是一段普通文字</Text>
      {/* size="lg" 大字号，fw={700} 加粗 */}
      <Text size="lg" fw={700}>大号粗体</Text>
      {/* c="dimmed" 是主题提供的弱化色（亮色模式灰，暗色模式浅灰） */}
      <Text c="dimmed">辅助说明文字</Text>
    </Stack>
  );
}
\`\`\`

> ⭐ \`c="dimmed"\` 是日常开发超高频用法——辅助说明、占位提示、时间戳都用它。

---

## 二、size：字号

\`size\` 接受预设值或任意 CSS 长度。

\`\`\`jsx
import { Text, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="xs">
      {/* 预设值：xs/sm/md/lg/xl，对应主题 fontSizes */}
      <Text size="xs">xs 字号（12px）</Text>
      <Text size="sm">sm 字号（14px，默认）</Text>
      <Text size="md">md 字号（16px）</Text>
      <Text size="lg">lg 字号（18px）</Text>
      <Text size="xl">xl 字号（20px）</Text>

      {/* 也可以用具体数字/字符串，单位是 px */}
      <Text size={24}>24px 大字</Text>
      <Text size="2rem">2rem 字号</Text>
      <Text size="1.5em">1.5em 相对字号</Text>
    </Stack>
  );
}
\`\`\`

**预设值的好处：** 全局改 \`theme.fontSizes.md\` 后，所有 \`size="md"\` 的 Text 一起变。具体像素值不受主题影响。

---

## 三、fw：字重（font-weight）

\`fw\` 接受数字（100-900）或预设关键词。

\`\`\`jsx
import { Text, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="xs">
      {/* 数字：100/200/.../900 */}
      <Text fw={300}>300 细体</Text>
      <Text fw={400}>400 常规（默认）</Text>
      <Text fw={500}>500 中等</Text>
      <Text fw={700}>700 加粗</Text>
      <Text fw={900}>900 特粗</Text>

      {/* 关键词：normal / bold / bolder / lighter */}
      <Text fw="bold">bold 加粗</Text>
    </Stack>
  );
}
\`\`\`

> ⭐ 注意：\`fw\` 只控制字重。要斜体用 \`fs="italic"\`（后面讲）。

---

## 四、c：颜色

\`c\` 支持主题色名、CSS 颜色值、特殊关键字。

\`\`\`jsx
import { Text, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="xs">
      {/* 1. 主题色名：blue/red/green/orange/violet 等 */}
      <Text c="blue">蓝色文字</Text>
      <Text c="red">红色文字</Text>
      <Text c="teal">青色文字</Text>

      {/* 2. 带色阶：blue.6 表示第 6 阶（主色阶），
          0 最浅，9 最深 */}
      <Text c="blue.3">浅蓝</Text>
      <Text c="blue.9">深蓝</Text>

      {/* 3. 特殊关键字 */}
      <Text c="dimmed">dimmed 弱化色（最常用）</Text>
      <Text c="bright">bright 亮色（暗色模式更明显）</Text>

      {/* 4. 任意 CSS 颜色值 */}
      <Text c="#ff5722">自定义十六进制</Text>
      <Text c="rgba(0,0,0,0.5)">半透明黑</Text>
      <Text c="var(--my-color)">CSS 变量</Text>
    </Stack>
  );
}
\`\`\`

**为什么推荐用 \`c="dimmed"\` 而不是 \`c="gray"\`？**

\`dimmed\` 在亮/暗模式下会自动选合适的灰度，而 \`gray\` 是固定色阶——暗色模式下会太黑看不见。

---

## 五、ta：text-align 对齐

\`\`\`jsx
import { Text, Stack, Box } from '@mantine/core';

export default function Demo() {
  return (
    {/* 给一个固定宽度才看得出对齐效果 */}
    <Box w={300}>
      <Stack gap="xs">
        {/* ta="left" 左对齐（默认） */}
        <Text ta="left">左对齐：默认值</Text>
        {/* ta="center" 居中 */}
        <Text ta="center">居中对齐</Text>
        {/* ta="right" 右对齐 */}
        <Text ta="right">右对齐</Text>
        {/* ta="justify" 两端对齐 */}
        <Text ta="justify">
          两端对齐：这段文字会自动调整字间距，让左右两边都对齐到容器边缘。常用于正文排版。
        </Text>
      </Stack>
    </Box>
  );
}
\`\`\`

---

## 六、td：text-decoration 文本装饰

\`\`\`jsx
import { Text, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="xs">
      {/* td="underline" 下划线 */}
      <Text td="underline">下划线文字</Text>
      {/* td="line-through" 删除线（常用于原价） */}
      <Text td="line-through">删除线</Text>
      {/* td="overline" 上划线 */}
      <Text td="overline">上划线</Text>

      {/* 组合使用：underline + line-through */}
      <Text td="underline line-through">下划线 + 删除线</Text>

      {/* 常见场景：原价划掉，旁边显示现价 */}
      <Text component="div">
        <Text span td="line-through" c="dimmed" size="sm">¥999</Text>
        {' '}
        <Text span c="red" fw={700}>¥599</Text>
      </Text>
    </Stack>
  );
}
\`\`\`

---

## 七、tt：text-transform 大小写转换

\`\`\`jsx
import { Text, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="xs">
      {/* tt="uppercase" 全大写 */}
      <Text tt="uppercase">hello world → 全大写</Text>
      {/* tt="lowercase" 全小写 */}
      <Text tt="lowercase">Hello World → 全小写</Text>
      {/* tt="capitalize" 每个单词首字母大写 */}
      <Text tt="capitalize">hello world → 首字母大写</Text>
      {/* tt="none" 不变（默认） */}
      <Text tt="none">保持原样</Text>
    </Stack>
  );
}
\`\`\`

> ⭐ \`uppercase\` 在英文标签、徽章里超常用——比如 \`<Badge tt="uppercase">NEW</Badge>\`。

---

## 八、fs：font-style 字体样式

\`\`\`jsx
import { Text, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="xs">
      {/* fs="italic" 斜体 */}
      <Text fs="italic">这是斜体文字</Text>
      {/* fs="normal" 正常（默认） */}
      <Text fs="normal">这是正常文字</Text>

      {/* 组合：斜体 + 灰色，常用于引文 */}
      <Text fs="italic" c="dimmed">— 鲁迅《呐喊》</Text>
    </Stack>
  );
}
\`\`\`

---

## 九、lh：line-height 行高

\`lh\` 接受数字（无单位倍数）、字符串（带单位）或预设值。

\`\`\`jsx
import { Text, Stack, Box } from '@mantine/core';

export default function Demo() {
  return (
    <Box w={300}>
      <Stack gap="md">
        {/* lh="xs" 紧凑（1.1） */}
        <Text lh="xs">
          紧凑行高：行与行之间几乎贴在一起。适用于标题、按钮文字等短文本场景。
        </Text>
        {/* lh="md" 默认（1.55） */}
        <Text lh="md">
          默认行高：正文的常规行距，阅读舒适。Mantine 默认正文行高就是 1.55。
        </Text>
        {/* lh="xl" 宽松（1.8） */}
        <Text lh="xl">
          宽松行高：行距很大，常用于博客、长文阅读，提升阅读体验。
        </Text>

        {/* 数字：行高倍数 */}
        <Text lh={1.2}>行高 1.2 倍</Text>
        <Text lh={2}>行高 2 倍</Text>

        {/* 带单位 */}
        <Text lh="32px">固定 32px 行高</Text>
      </Stack>
    </Box>
  );
}
\`\`\`

---

## 十、span：行内文本

默认 \`Text\` 渲染为 \`<p>\`（块级），加 \`span\` 后渲染为 \`<span>\`（行内）。

\`\`\`jsx
import { Text } from '@mantine/core';

export default function Demo() {
  return (
    {/* Text 块级 */}
    <Text>
      这是一段话，
      {/* span 让这段文字行内显示，可以混排 */}
      <Text span c="blue" fw={700}>蓝色加粗</Text>
      ，继续后面的内容，
      <Text span fs="italic" c="dimmed">斜体灰色</Text>
      ，结束。
    </Text>
  );
}
\`\`\`

> ⭐ \`span\` 在「同一段里要混合多种样式」时是必需的——不能用多个 \`<p>\` 因为它们会换行。

---

## 十一、truncate：单行截断

\`truncate\` 让超长文字在容器边缘自动加 \`…\` 省略号。

\`\`\`jsx
import { Text, Box } from '@mantine/core';

export default function Demo() {
  return (
    {/* 限定宽度才能看到截断效果 */}
    <Box w={200}>
      {/* truncate：超长部分用 … 代替（单行） */}
      <Text truncate>
        这是一段非常非常长的文字，会超出容器宽度，被截断显示为省略号
      </Text>

      {/* truncate 的别名写法：truncate="end" */}
      <Text truncate="end" mt="md">
        末尾省略号写法，效果同上
      </Text>

      {/* truncate="start" 开头省略号 */}
      <Text truncate="start" mt="md">
        这是一段长文字，开头被省略
      </Text>
    </Box>
  );
}
\`\`\`

**适用场景：** 表格里的长 URL、列表项标题、文件名展示。

---

## 十二、lineClamp：多行截断

\`lineClamp={n}\` 限制最多显示 n 行，超出部分 \`…\` 截断。

\`\`\`jsx
import { Text, Box } from '@mantine/core';

export default function Demo() {
  return (
    <Box w={300}>
      {/* lineClamp={2}：最多 2 行 */}
      <Text lineClamp={2}>
        这是一段非常非常长的文字，会超出两行被截断。
        Mantine 的 lineClamp 内部用 -webkit-line-clamp 实现，
        兼容性非常好，现代浏览器都支持。继续加内容让它超出两行...
        再多写一些，确保真的超过两行，能看到省略号效果。
      </Text>

      {/* lineClamp={3}：最多 3 行 */}
      <Text lineClamp={3} mt="md">
        同样的内容，这次允许显示 3 行。
        这是一段非常非常长的文字，会超出两行被截断。
        Mantine 的 lineClamp 内部用 -webkit-line-clamp 实现，
        兼容性非常好，现代浏览器都支持。
      </Text>

      {/* lineClamp 可以搭配 expand 按钮，实现"展开全文" */}
      <Text lineClamp={4} mt="md">
        评论内容：这个产品真的不错，物流很快，包装也很好，已经回购第三次了。
        外观漂亮，性能稳定，性价比高，强烈推荐给大家。
        客服态度也很好，有问题响应及时，售后无忧。
      </Text>
    </Box>
  );
}
\`\`\`

> ⭐ \`lineClamp\` 是商品卡片、评论列表、文章摘要的标配。

---

## 十三、inherit：继承父级样式

\`inherit\` 让 Text 不应用自己的字号/颜色，而是继承父元素。

\`\`\`jsx
import { Text, Box } from '@mantine/core';

export default function Demo() {
  return (
    {/* 父元素设了大字号和颜色 */}
    <Box fz={32} c="violet" fw={700}>
      父级文字
      {/* 默认 Text 会用自己的 size="sm"，覆盖父级 */}
      <Text>子级默认（不继承，是小字）</Text>
      {/* inherit 让子级继承父级的 32px、violet、700 */}
      <Text inherit>子级继承（同样大）</Text>
    </Box>
  );
}
\`\`\`

**用途：** 当 Text 嵌套在 \`Anchor\`、\`Button\`、\`Badge\` 等组件内部时，加 \`inherit\` 能让它跟随父组件样式，避免字号不统一。

---

## 十四、gradient：渐变文字

\`variant="gradient"\` + \`gradient\` prop 实现文字渐变效果。

\`\`\`jsx
import { Text, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* variant="gradient"：渐变文字
          gradient={from, to, deg} 控制起始色、结束色、角度 */}
      <Text variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 45 }} size="xl" fw={700}>
        蓝青渐变文字
      </Text>

      <Text variant="gradient" gradient={{ from: 'violet', to: 'pink', deg: 90 }} size="xl" fw={700}>
        紫粉渐变文字
      </Text>

      <Text variant="gradient" gradient={{ from: 'orange', to: 'red', deg: 45 }} size="xl" fw={700}>
        橙红渐变文字
      </Text>

      {/* 渐变文字 + 大号粗体，常用于落地页标题 */}
      <Text
        variant="gradient"
        gradient={{ from: 'teal', to: 'lime', deg: 90 }}
        size="3rem"
        fw={900}
      >
        BIG GRADIENT TITLE
      </Text>
    </Stack>
  );
}
\`\`\`

> ⭐ 渐变文字内部用 \`background-clip: text\` 实现，兼容性良好。

---

## 十五、component：多态渲染

\`component\` prop 让 Text 渲染为任意 HTML 标签或自定义组件——这是 Mantine 的**多态渲染**特性。

\`\`\`jsx
import { Text, Stack } from '@mantine/core';
import { Link } from 'next/link';

export default function Demo() {
  return (
    <Stack>
      {/* 默认渲染为 <p> */}
      <Text>默认 p 标签</Text>

      {/* component="div" 渲染为 <div>，可以包其他块级元素 */}
      <Text component="div">
        <div>内部嵌套 div</div>
      </Text>

      {/* component="span" 等价于 span 属性 */}
      <Text component="span">span 标签</Text>

      {/* component="label" 渲染为 <label>，用于表单关联 */}
      <Text component="label" htmlFor="username" fw={500}>
        用户名
      </Text>

      {/* component="a" 渲染为链接 */}
      <Text component="a" href="https://mantine.dev" target="_blank" c="blue" td="underline">
        跳转 Mantine 官网
      </Text>

      {/* component 传入自定义组件，比如 next/link */}
      <Text
        component={Link}
        href="/about"
        c="blue"
        td="underline"
      >
        关于我们（Next.js 内部跳转）
      </Text>
    </Stack>
  );
}
\`\`\`

**多态的核心价值：** 样式不变，语义变。比如想让一段文字既保留 \`Text\` 的所有样式能力，又能作为 \`<a>\` 链接工作，\`component="a"\` 一行搞定。

---

## 十六、实战：用户资料卡

综合运用前面所有知识点：

\`\`\`jsx
import { Text, Stack, Group, Box, Avatar } from '@mantine/core';

export default function UserProfile() {
  return (
    <Box p="lg" bg="var(--mantine-color-gray-0)" radius="md" maw={400}>
      <Group gap="md">
        <Avatar src="/avatar.jpg" radius="xl" size={56} />
        <Stack gap={2}>
          {/* 名字：lg 字号 + 700 字重 */}
          <Text size="lg" fw={700}>张三</Text>
          {/* 邮箱：小字 + dimmed + truncate */}
          <Text size="sm" c="dimmed" truncate>
            zhangsan@example.com
          </Text>
        </Stack>
      </Group>

      {/* 简介：两行截断 */}
      <Text size="sm" mt="md" lineClamp={2} c="dimmed">
        资深前端工程师，专注 React 生态，热爱开源。
        曾参与多个大型项目的架构设计，对性能优化有深入研究。
        目前在写 Mantine 教程，欢迎交流。
      </Text>

      {/* 标签行：行内 span 混排 */}
      <Text size="xs" mt="sm" c="dimmed">
        <Text span fw={500} c="blue">关注 128</Text>
        {' · '}
        <Text span fw={500} c="blue">粉丝 1.2k</Text>
        {' · '}
        <Text span fw={500} c="blue">文章 36</Text>
      </Text>
    </Box>
  );
}
\`\`\`

---

## 十七、完整 props 速查表

| prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| size | xs/sm/md/lg/xl 或数字 | sm | 字号 |
| fw | 100-900 / normal/bold | 400 | 字重 |
| c | 主题色 / 颜色值 | inherit | 颜色 |
| ta | left/center/right/justify | left | 对齐 |
| td | underline/line-through/overline | none | 装饰线 |
| tt | uppercase/lowercase/capitalize | none | 大小写 |
| fs | italic/normal | normal | 斜体 |
| lh | 预设/数字/带单位 | md | 行高 |
| span | boolean | false | 渲染为 span |
| truncate | boolean / start / end | false | 单行截断 |
| lineClamp | number | - | 多行截断 |
| inherit | boolean | false | 继承父级 |
| variant | text / gradient | text | 视觉变体 |
| gradient | {from, to, deg} | - | 渐变配置 |
| component | 标签名 / 组件 | p | 多态渲染 |

---

## 小结

- \`Text\` 是 Mantine 排版的基石，所有文字场景都应该用它。
- 三大高频组合：\`size\` + \`fw\` + \`c\` 决定基本外观。
- \`truncate\` 单行省略、\`lineClamp\` 多行省略是后台界面必备。
- \`component\` 多态渲染让 Text 能化身任意标签或组件。

下一章我们学习 \`Title\` 和 \`Anchor\`——标题层级与链接处理。`,
  },

  // ============================================================
  // 第六章 Title 标题与 Anchor 锚点
  // ============================================================
  {
    id: 'mantine2-ch06',
    group: '第二部分 文本与排版',
    icon: '📰',
    title: '第六章 Title 标题与 Anchor 锚点',
    content: `## 一句话目标

掌握 \`Title\` 组件（h1-h6 标题层级）和 \`Anchor\` 链接组件，学会在不破坏语义和无障碍的前提下，做出漂亮的标题与可点击链接。

---

## 一、Title：语义化标题

\`Title\` 本质上是一个带样式 props 的 \`<h1>\` 到 \`<h6>\`。它解决了两个问题：

1. **语义**：通过 \`order\` prop 决定渲染为哪个级别标题，HTML 层级正确，对 SEO 与无障碍友好。
2. **样式**：字号、字重自动应用主题配置，不用手写 CSS。

\`\`\`jsx
import { Title, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* order={1} 渲染为 <h1>，order={2} 渲染为 <h2>，以此类推 */}
      <Title order={1}>h1 主标题</Title>
      <Title order={2}>h2 二级标题</Title>
      <Title order={3}>h3 三级标题</Title>
      <Title order={4}>h4 四级标题</Title>
      <Title order={5}>h5 五级标题</Title>
      <Title order={6}>h6 六级标题</Title>
    </Stack>
  );
}
\`\`\`

> ⭐ \`order\` 是必填 prop——不传会报错。这强制你想清楚每一级的语义。

---

## 二、为什么不用原生 \`<h1>\`

写原生标签也能用，但 Mantine 的 \`Title\` 提供了：

- **统一字号**：所有 h1 都用 \`theme.headings.sizes.h1\`，改一处全局生效。
- **统一字重**：默认字重 700，可全局调整。
- **暗色适配**：文字色自动跟随颜色方案。
- **可覆盖样式**：通过 props 覆盖字号字重，不影响语义。

\`\`\`jsx
import { Title, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* 默认行为：渲染为 h2，字号/字重用主题配置 */}
      <Title order={2}>默认 h2</Title>

      {/* 用 size 覆盖字号，但语义还是 h2 */}
      <Title order={2} size="h1">h2 语义，但用 h1 的字号</Title>
      {/* 用 fw 覆盖字重 */}
      <Title order={2} fw={300}>细体 h2</Title>
      {/* 用 c 改颜色 */}
      <Title order={2} c="blue">蓝色 h2</Title>
      {/* ta 改对齐 */}
      <Title order={2} ta="center">居中 h2</Title>
    </Stack>
  );
}
\`\`\`

**为什么有时要 \`order={2} size="h1"\`？**

因为页面只能有一个 \`<h1>\`（SEO 规则），但视觉上某段标题需要 h1 那么大。这时用 h2 的语义 + h1 的字号，既符合 SEO 又符合设计。

---

## 三、全局配置标题字号

在主题里改 \`headings\` 配置：

\`\`\`jsx
// app/layout.js
import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({
  headings: {
    // 全局字体
    fontFamily: 'system-ui, sans-serif',
    // 每个级别的字号字重
    sizes: {
      h1: { fontSize: '2.5rem', fontWeight: 800 },
      h2: { fontSize: '2rem', fontWeight: 700 },
      h3: { fontSize: '1.5rem', fontWeight: 700 },
      h4: { fontSize: '1.25rem', fontWeight: 600 },
      h5: { fontSize: '1rem', fontWeight: 600 },
      h6: { fontSize: '0.875rem', fontWeight: 600 },
    },
    // 全局字重（可被 sizes 中的覆盖）
    fontWeight: 700,
    // 全局行高
    lineHeight: 1.2,
  },
});

export default function RootLayout({ children }) {
  return (
    <MantineProvider theme={theme}>
      {children}
    </MantineProvider>
  );
}
\`\`\`

> ⭐ 配置主题是统一设计规范的正确方式——不要在业务代码里到处写 \`size="2rem"\`。

---

## 四、Anchor：链接组件

\`Anchor\` 是 Mantine 的链接组件，本质上是 \`Text component="a"\` 的封装。它有几个增强：

1. 默认带主题色和下划线
2. 暗色模式自动适配
3. 支持所有 Text 的样式 props

\`\`\`jsx
import { Anchor, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* 基础用法：内部锚点 */}
      <Anchor href="/about" target="_blank" size="md">
        关于我们
      </Anchor>

      {/* 不带下划线（hover 时才显示） */}
      <Anchor href="#" underline="hover">
        鼠标悬停才显示下划线
      </Anchor>

      {/* 永远不显示下划线 */}
      <Anchor href="#" underline="never" c="dimmed">
        不显示下划线
      </Anchor>

      {/* 行内链接，混排在一段话里 */}
      <Anchor href="#" size="sm" td="underline" c="blue">
        Mantine 文档
      </Anchor>
    </Stack>
  );
}
\`\`\`

**\`underline\` 三个值的区别：**

- \`always\`：永远显示下划线（默认）
- \`hover\`：只在鼠标悬停时显示
- \`never\`：永不显示

---

## 五、外部链接 vs 内部链接

在 Next.js 项目里，内部跳转应该用 \`next/link\`，外部链接才用 \`<a>\`。\`Anchor\` 通过 \`component\` prop 支持两者：

\`\`\`jsx
'use client';
import { Anchor, Stack } from '@mantine/core';
import Link from 'next/link';

export default function Demo() {
  return (
    <Stack>
      {/* 1. 外部链接：直接用 href，渲染为 <a> */}
      <Anchor href="https://mantine.dev" target="_blank" rel="noopener noreferrer">
        Mantine 官网（外部）
      </Anchor>

      {/* 2. 内部链接：component={Link} */}
      <Anchor component={Link} href="/dashboard">
        仪表盘（Next.js 内部跳转）
      </Anchor>

      {/* 3. 带 query 参数的内部链接 */}
      <Anchor component={Link} href="/users?id=123">
        用户详情
      </Anchor>

      {/* 4. 自定义 react-router 等其他路由库 */}
      {/* <Anchor component={RouterLink} to="/about">关于</Anchor> */}
    </Stack>
  );
}
\`\`\`

> ⭐ **坑点**：内部跳转用 \`href="/about"\` 而非 \`component={Link}\`，会触发整页刷新，丢失 SPA 体验。

---

## 六、外部链接的安全属性

外部链接务必加 \`rel="noopener noreferrer"\`：

\`\`\`jsx
import { Anchor } from '@mantine/core';

export default function Demo() {
  return (
    <Anchor
      href="https://example.com"
      target="_blank"
      // noopener：防止新页面通过 window.opener 操纵原页面（安全）
      // noreferrer：不向目标站点发送 referer（隐私）
      rel="noopener noreferrer"
    >
      安全的外部链接
    </Anchor>
  );
}
\`\`\`

**为什么必须加？** \`target="_blank"\` 不加 \`noopener\` 时，新开的页面可以用 \`window.opener.location = '恶意网址'\` 劫持原页面。这是经典安全漏洞。

---

## 七、带图标的链接

\`\`\`jsx
import { Anchor, Group } from '@mantine/core';
import { IconExternalLink, IconArrowRight } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Group>
      {/* 右侧图标：表示「跳转出去」 */}
      <Anchor href="https://github.com" target="_blank" rel="noopener noreferrer">
        <Group gap={6}>
          GitHub
          <IconExternalLink size={14} />
        </Group>
      </Anchor>

      {/* 内部跳转 + 右箭头 */}
      <Anchor href="/next">
        <Group gap={6}>
          下一页
          <IconArrowRight size={14} />
        </Group>
      </Anchor>
    </Group>
  );
}
\`\`\`

---

## 八、标题与无障碍

标题的正确层级对**屏幕阅读器**用户至关重要。无障碍要点：

1. **每页一个 \`<h1>\`**：通常是页面主标题。
2. **层级递进**：不要从 h1 直接跳到 h4，要 h1→h2→h3。
3. **不滥用标题**：只是为了样式大而用 h1 是错的——样式用 \`size\` 控制。

\`\`\`jsx
import { Title, Text, Stack } from '@mantine/core';

export default function Article() {
  return (
    <Stack>
      {/* ✅ 正确：页面主标题用 h1，唯一一个 */}
      <Title order={1}>React 19 新特性详解</Title>

      {/* ✅ 二级标题：章节 */}
      <Title order={2}>一、并发渲染改进</Title>
      <Text>正文内容...</Text>

      {/* ✅ 三级标题：子章节 */}
      <Title order={3}>useTransition 优化</Title>
      <Text>子章节内容...</Text>

      {/* ❌ 错误示例：跳过 h3 直接用 h4 */}
      {/* <Title order={4}>跳层标题</Title> */}

      {/* ❌ 错误示例：为了字大用 h1 */}
      {/* <Title order={1}>这只是想大一点</Title> */}

      {/* ✅ 想大字：用 size 覆盖，order 保持语义 */}
      <Title order={2} size="h1">这个 h2 视觉上很大</Title>
    </Stack>
  );
}
\`\`\`

---

## 九、Anchor 锚点跳转（页内定位）

\`Anchor\` 配合 HTML id 可以实现「跳到页面某处」效果：

\`\`\`jsx
import { Anchor, Title, Stack, Box, Text } from '@mantine/core';

export default function DocPage() {
  return (
    <Stack>
      {/* 目录：点击跳到对应位置 */}
      <Anchor href="#section-1">第一节</Anchor>
      <Anchor href="#section-2">第二节</Anchor>

      {/* 内容区：id 与 href 对应 */}
      <Box id="section-1" mt="xl">
        <Title order={2}>第一节：入门</Title>
        <Text>内容...</Text>
      </Box>

      <Box id="section-2" mt="xl">
        <Title order={2}>第二节：进阶</Title>
        <Text>内容...</Text>
      </Box>
    </Stack>
  );
}
\`\`\`

**注意：** 这是浏览器原生行为，点击会平滑滚动到 \`id="section-1"\` 的元素。如需平滑滚动，可加 CSS：\`html { scroll-behavior: smooth; }\`。

---

## 十、实战：博客文章头部

\`\`\`jsx
import { Title, Text, Anchor, Group, Box } from '@mantine/core';
import { IconClock, IconUser } from '@tabler/icons-react';

export default function ArticleHeader() {
  return (
    <Box>
      {/* 文章主标题：h1，整页唯一 */}
      <Title order={1} mb="xs">
        Mantine v9 完全指南
      </Title>

      {/* 副标题：用 Text 而非 h2，因为不是结构层级 */}
      <Text size="lg" c="dimmed" mb="md">
        从零到一搭建现代 React 后台界面
      </Text>

      {/* 元信息：作者、时间、分类 */}
      <Group gap="lg" c="dimmed" size="sm">
        <Group gap={6}>
          <IconUser size={14} />
          {/* 作者：链接到作者主页 */}
          <Anchor href="/author/zhangsan" c="dimmed" underline="hover">
            张三
          </Anchor>
        </Group>
        <Group gap={6}>
          <IconClock size={14} />
          <Text span size="sm">2026-07-19</Text>
        </Group>
        {/* 分类：多个标签 */}
        <Group gap={6}>
          <Anchor href="/tags/react" c="dimmed" underline="hover">#react</Anchor>
          <Anchor href="/tags/mantine" c="dimmed" underline="hover">#mantine</Anchor>
        </Group>
      </Group>
    </Box>
  );
}
\`\`\`

---

## 十一、Title 与 Anchor 速查表

| 组件 | prop | 说明 |
| --- | --- | --- |
| Title | order（必填） | 1-6，对应 h1-h6 |
| Title | size | 覆盖字号（默认跟 order） |
| Title | fw / c / ta | 字重/颜色/对齐 |
| Title | component | 多态渲染 |
| Anchor | href | 链接地址 |
| Anchor | target | _blank 等 |
| Anchor | underline | always/hover/never |
| Anchor | component | 传 next/link 等 |
| Anchor | rel | noopener noreferrer（外部链接必备） |

---

## 小结

- \`Title order\` 决定语义层级，\`size\` 决定视觉字号——两者解耦。
- 一页一个 h1，层级递进，是 SEO 和无障碍的硬规则。
- \`Anchor\` 内部链接用 \`component={Link}\`，外部链接务必加 \`rel="noopener noreferrer"\`。

下一章学习列表与引用块。`,
  },

  // ============================================================
  // 第七章 List 列表与 Blockquote 引用
  // ============================================================
  {
    id: 'mantine2-ch07',
    group: '第二部分 文本与排版',
    icon: '📋',
    title: '第七章 List 列表与 Blockquote 引用',
    content: `## 一句话目标

掌握 \`List\` 列表组件（有序/无序/自定义图标）和 \`Blockquote\` 引用块组件，做出结构化的步骤说明、特性列表、评论引用等常见 UI。

---

## 一、List 基础用法

\`List\` 是 Mantine 的列表组件，比原生 \`<ul>\` 强在：可控制图标、间距、对齐、嵌套。

\`\`\`jsx
import { List, Stack, Text } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      <Text fw={500}>默认列表（无序列表）：</Text>
      {/* 默认 type="unordered"，渲染为 <ul>，带圆点 */}
      <List>
        <List.Item>第一条</List.Item>
        <List.Item>第二条</List.Item>
        <List.Item>第三条</List.Item>
      </List>

      <Text fw={500} mt="md">有序列表：</Text>
      {/* type="ordered" 渲染为 <ol>，自动编号 */}
      <List type="ordered">
        <List.Item>第一步</List.Item>
        <List.Item>第二步</List.Item>
        <List.Item>第三步</List.Item>
      </List>
    </Stack>
  );
}
\`\`\`

> ⭐ \`type="ordered"\` 是步骤说明、教程场景的标配。

---

## 二、size：尺寸

\`size\` 控制字号和图标大小。

\`\`\`jsx
import { List } from '@mantine/core';

export default function Demo() {
  return (
    <>
      <List size="xs">
        <List.Item>xs 列表项</List.Item>
        <List.Item>第二条</List.Item>
      </List>

      <List size="sm" mt="md">
        <List.Item>sm 列表项（默认）</List.Item>
        <List.Item>第二条</List.Item>
      </List>

      <List size="lg" mt="md">
        <List.Item>lg 列表项</List.Item>
        <List.Item>第二条</List.Item>
      </List>

      <List size="xl" mt="md">
        <List.Item>xl 列表项</List.Item>
        <List.Item>第二条</List.Item>
      </List>
    </>
  );
}
\`\`\`

---

## 三、spacing：列表项间距

\`spacing\` 控制每一项之间的间距。

\`\`\`jsx
import { List } from '@mantine/core';

export default function Demo() {
  return (
    <>
      {/* spacing="xs"：紧凑 */}
      <List spacing="xs">
        <List.Item>紧凑列表</List.Item>
        <List.Item>项之间很近</List.Item>
        <List.Item>用于密集信息</List.Item>
      </List>

      {/* spacing="md"：默认 */}
      <List spacing="md" mt="md">
        <List.Item>常规列表</List.Item>
        <List.Item>默认间距</List.Item>
      </List>

      {/* spacing="xl"：宽松 */}
      <List spacing="xl" mt="md">
        <List.Item>宽松列表</List.Item>
        <List.Item>项之间很远</List.Item>
        <List.Item>呼吸感强</List.Item>
      </List>
    </>
  );
}
\`\`\`

---

## 四、center：图标与文字垂直居中

默认图标在第一行顶部对齐。多行列表项时，加 \`center\` 让图标居中对齐：

\`\`\`jsx
import { List } from '@mantine/core';

export default function Demo() {
  return (
    <>
      {/* 默认：图标顶部对齐 */}
      <List>
        <List.Item>
          多行列表项第一行
          <br />
          第二行内容，图标在第一行顶部
        </List.Item>
      </List>

      {/* center：图标居中对齐 */}
      <List center mt="md">
        <List.Item>
          多行列表项第一行
          <br />
          第二行内容，图标垂直居中
        </List.Item>
      </List>
    </>
  );
}
\`\`\`

---

## 五、icon：自定义图标

\`icon\` prop 替换默认的圆点。

\`\`\`jsx
import { List } from '@mantine/core';
import { IconCheck, IconX, IconStar } from '@tabler/icons-react';

export default function Demo() {
  return (
    <>
      {/* icon 全局替换：所有项用同一图标 */}
      <List icon={<IconCheck size={16} color="green" />}>
        <List.Item>支持 TypeScript</List.Item>
        <List.Item>暗色模式开箱即用</List.Item>
        <List.Item>80+ 组件</List.Item>
      </List>

      {/* 列出特性：✓ 优点 + ✗ 缺点 */}
      <List mt="md">
        <List.Item icon={<IconCheck size={16} color="green" />}>
          优点：组件丰富
        </List.Item>
        <List.Item icon={<IconCheck size={16} color="green" />}>
          优点：文档完善
        </List.Item>
        <List.Item icon={<IconX size={16} color="red" />}>
          缺点：包体积偏大
        </List.Item>
      </List>

      {/* 评分列表：每项不同图标 */}
      <List mt="md">
        <List.Item icon={<IconStar size={16} fill="orange" color="orange" />}>
          五星好评
        </List.Item>
        <List.Item icon={<IconStar size={16} fill="orange" color="orange" />}>
          强烈推荐
        </List.Item>
      </List>
    </>
  );
}
\`\`\`

> ⭐ \`List.Item icon\` 优先级高于 \`List icon\`，可以一项一项定制。

---

## 六、listStyleType：原生列表样式

如果想用 \`disc\`、\`decimal\`、\`square\` 等原生 CSS 列表样式：

\`\`\`jsx
import { List } from '@mantine/core';

export default function Demo() {
  return (
    <>
      {/* listStyleType 用 CSS 关键字 */}
      <List listStyleType="disc">
        <List.Item>实心圆点（默认 disc）</List.Item>
        <List.Item>第二项</List.Item>
      </List>

      <List listStyleType="square" mt="md">
        <List.Item>实心方块</List.Item>
        <List.Item>第二项</List.Item>
      </List>

      <List listStyleType="decimal" mt="md">
        <List.Item>数字编号 1</List.Item>
        <List.Item>数字编号 2</List.Item>
      </List>

      <List listStyleType="none" mt="md">
        <List.Item>无标记</List.Item>
        <List.Item>常用于自定义场景</List.Item>
      </List>
    </>
  );
}
\`\`\`

---

## 七、嵌套列表

\`List\` 可以嵌套，渲染为多级缩进列表：

\`\`\`jsx
import { List } from '@mantine/core';

export default function Demo() {
  return (
    <List>
      <List.Item>第一章：入门</List.Item>
      {/* 嵌套 List：自动缩进 */}
      <List.Item>
        第二章：进阶
        <List withSpacing>
          <List.Item>2.1 主题定制</List.Item>
          <List.Item>2.2 表单进阶</List.Item>
          {/* 三级嵌套 */}
          <List.Item>
            2.3 Hooks
            <List withSpacing>
              <List.Item>2.3.1 useDisclosure</List.Item>
              <List.Item>2.3.2 useDebouncedValue</List.Item>
            </List>
          </List.Item>
        </List>
      </List.Item>
      <List.Item>第三章：实战</List.Item>
    </List>
  );
}
\`\`\`

> \`withSpacing\` 让嵌套列表自带顶部间距。

---

## 八、withPadding：列表整体缩进

\`withPadding\` 让整个列表左缩进，给图标留位置：

\`\`\`jsx
import { List } from '@mantine/core';

export default function Demo() {
  return (
    <>
      {/* 默认：不缩进 */}
      <List>
        <List.Item>不缩进的列表</List.Item>
        <List.Item>从最左开始</List.Item>
      </List>

      {/* withPadding：缩进留出图标位置 */}
      <List withPadding mt="md">
        <List.Item>带缩进的列表</List.Item>
        <List.Item>与左边有距离</List.Item>
      </List>
    </>
  );
}
\`\`\`

---

## 九、Blockquote：引用块

\`Blockquote\` 用于突出引用的文字，自带左侧色条、图标和背景色。

\`\`\`jsx
import { Blockquote, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* 基础引用块 */}
      <Blockquote>
        代码是写给人看的，顺便让机器执行。
      </Blockquote>

      {/* cite：标注来源 */}
      <Blockquote cite="— Harold Abelson">
        程序首先是为了人阅读而编写，其次才是为了让机器执行。
      </Blockquote>

      {/* color：左侧色条颜色 */}
      <Blockquote color="blue">
        蓝色引用块
      </Blockquote>
      <Blockquote color="red">
        红色引用块（用于警告/重要提示）
      </Blockquote>
      <Blockquote color="green">
        绿色引用块（用于成功提示）
      </Blockquote>
    </Stack>
  );
}
\`\`\`

---

## 十、自定义图标与样式

\`\`\`jsx
import { Blockquote, Stack } from '@mantine/core';
import { IconInfoCircle, IconAlertTriangle, IconBulb } from '@tabler/icons-react';

export default function Demo() {
  return (
    <Stack>
      {/* icon：左侧图标 */}
      <Blockquote icon={<IconInfoCircle size={24} />} color="blue">
        提示：这是一段重要的提示信息，请仔细阅读。
      </Blockquote>

      {/* 警告块 */}
      <Blockquote
        icon={<IconAlertTriangle size={24} />}
        color="orange"
      >
        警告：此操作不可逆，请确认后再执行。
      </Blockquote>

      {/* 小贴士 */}
      <Blockquote
        icon={<IconBulb size={24} />}
        color="yellow"
      >
        小贴士：按 Ctrl+K 可以快速打开命令面板。
      </Blockquote>

      {/* 无图标 */}
      <Blockquote icon={null} color="gray">
        纯文字引用，无图标
      </Blockquote>
    </Stack>
  );
}
\`\`\`

---

## 十一、实战 1：评论列表

\`\`\`jsx
import { List, Avatar, Text, Group, Box, Blockquote } from '@mantine/core';

const comments = [
  { id: 1, user: '张三', avatar: 'Z', time: '2 小时前', content: '这个组件库真不错，已经用在生产环境了。' },
  { id: 2, user: '李四', avatar: 'L', time: '1 小时前', content: '文档很完善，上手很快。', reply: '同意，比 Ant Design 现代。' },
];

export default function CommentList() {
  return (
    <Box maw={500}>
      <List spacing="lg" listStyleType="none" withPadding={false}>
        {comments.map((c) => (
          <List.Item key={c.id}>
            <Group align="flex-start" gap="sm">
              <Avatar color="blue" radius="xl">{c.avatar}</Avatar>
              <Box style={{ flex: 1 }}>
                <Group justify="space-between">
                  <Text size="sm" fw={700}>{c.user}</Text>
                  <Text size="xs" c="dimmed">{c.time}</Text>
                </Group>
                <Text size="sm" mt={4}>{c.content}</Text>
                {/* 嵌套回复用 Blockquote */}
                {c.reply && (
                  <Blockquote cite="王五" icon={null} color="gray" p="sm" mt="sm">
                    <Text size="sm">{c.reply}</Text>
                  </Blockquote>
                )}
              </Box>
            </Group>
          </List.Item>
        ))}
      </List>
    </Box>
  );
}
\`\`\`

---

## 十二、实战 2：步骤说明

\`\`\`jsx
import { List, Text, Box, ThemeIcon } from '@mantine/core';
import { IconCircle1, IconCircle2, IconCircle3 } from '@tabler/icons-react';

export default function StepGuide() {
  return (
    <Box maw={500}>
      <Text fw={700} mb="md">如何安装 Mantine：</Text>

      <List spacing="md">
        <List.Item icon={<ThemeIcon color="blue" radius="xl"><IconCircle1 size={16} /></ThemeIcon>}>
          <Text size="sm">
            <Text span fw={600}>安装核心包</Text>
            <br />
            <Text span c="dimmed">运行 npm install @mantine/core @mantine/hooks</Text>
          </Text>
        </List.Item>
        <List.Item icon={<ThemeIcon color="blue" radius="xl"><IconCircle2 size={16} /></ThemeIcon>}>
          <Text size="sm">
            <Text span fw={600}>引入样式</Text>
            <br />
            <Text span c="dimmed">在 layout.js 中 import '@mantine/core/styles.css'</Text>
          </Text>
        </List.Item>
        <List.Item icon={<ThemeIcon color="blue" radius="xl"><IconCircle3 size={16} /></ThemeIcon>}>
          <Text size="sm">
            <Text span fw={600}>包裹 MantineProvider</Text>
            <br />
            <Text span c="dimmed">在根布局用 MantineProvider 包裹 children</Text>
          </Text>
        </List.Item>
      </List>
    </Box>
  );
}
\`\`\`

---

## 十三、List 与 Blockquote 速查表

| 组件 | prop | 说明 |
| --- | --- | --- |
| List | type | ordered / unordered |
| List | size | xs/sm/md/lg/xl |
| List | spacing | 项间距 |
| List | icon | 全局图标 |
| List | center | 图标垂直居中 |
| List | withPadding | 整体左缩进 |
| List | listStyleType | disc/decimal/square/none |
| List.Item | icon | 单项图标（覆盖 List） |
| Blockquote | cite | 来源 |
| Blockquote | icon | 自定义图标 |
| Blockquote | color | 左侧色条颜色 |

---

## 小结

- \`List\` 适合做特性列表、步骤说明、嵌套目录。
- \`List.Item icon\` 让每项图标独立，做出特性对比、评分等场景。
- \`Blockquote\` 是提示信息、引文展示的优雅容器。
- 多用 \`withPadding\` + \`center\` 让列表「呼吸感」合适。

下一章学习代码高亮组件 Mark/Code/Kbd/Highlight。`,
  },

  // ============================================================
  // 第八章 Mark/Code/Kbd/Highlight 高亮与代码
  // ============================================================
  {
    id: 'mantine2-ch08',
    group: '第二部分 文本与排版',
    icon: '✏️',
    title: '第八章 Mark/Code/Kbd/Highlight 高亮与代码',
    content: `## 一句话目标

掌握 Mantine 的「高亮与代码」家族：\`Mark\` 高亮、\`Code\` 代码块、\`Kbd\` 键盘按键、\`Highlight\` 搜索高亮，以及 \`Prism\` 代码语法高亮。技术博客、文档站、命令行展示都离不开它们。

---

## 一、Mark：高亮一段文字

\`Mark\` 把文字背景染成黄色（默认），相当于 \`<mark>\` 标签的强化版。

\`\`\`jsx
import { Mark, Text, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* 基础高亮：默认黄色背景 */}
      <Text>
        这段话里 <Mark>Mantine</Mark> 是被高亮的关键词
      </Text>

      {/* color：自定义高亮颜色（用主题色名） */}
      <Text>
        <Mark color="blue">蓝色高亮</Mark>
        {' '}
        <Mark color="red">红色高亮</Mark>
        {' '}
        <Mark color="green">绿色高亮</Mark>
      </Text>

      {/* 渐变高亮：color 接受渐变对象 */}
      <Text>
        这是 <Mark color="orange">橙色高亮</Mark> 的效果
      </Text>

      {/* 行内混排：长句子里的多个高亮 */}
      <Text>
        使用 <Mark>Mantine</Mark> 开发，搭配 <Mark>Next.js</Mark> 路由，
        部署到 <Mark>Vercel</Mark> 是最爽的组合。
      </Text>
    </Stack>
  );
}
\`\`\`

> ⭐ \`Mark\` 是行内组件，自动渲染为 \`<mark>\`，背景半透明，文字保持原色。

---

## 二、Code：行内代码

\`Code\` 用于展示行内代码片段，等宽字体 + 灰色背景。

\`\`\`jsx
import { Code, Text, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      <Text>
        使用 <Code>npm install @mantine/core</Code> 安装核心包
      </Text>

      <Text>
        在 React 中用 <Code>useState</Code> 管理状态，
        用 <Code>useEffect</Code> 处理副作用
      </Text>

      {/* color：自定义代码块颜色 */}
      <Text>
        自定义颜色：<Code color="red">useState</Code>
      </Text>

      {/* block：代码块（多行） */}
      <Code block>
{ \`import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  return <button>{count}</button>;
}\` }
      </Code>
    </Stack>
  );
}
\`\`\`

**行内 vs 块级的区别：**

- 默认（无 \`block\`）：行内 \`<code>\`，灰底圆角，混在文字里。
- \`block\`：多行 \`<pre><code>\`，等宽字体，可滚动，用于展示完整代码片段。

---

## 三、Code block 多行代码

\`\`\`jsx
import { Code, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* block：多行代码，自动换行+滚动 */}
      <Code block>
{ \`// 这是一个示例代码块
import { Button } from '@mantine/core';

export default function App() {
  return (
    <Button onClick={() => alert('Hello!')}>
      点我
    </Button>
  );
}\` }
      </Code>

      {/* 长代码：超出会自动横向滚动 */}
      <Code block>
{ \`const veryLongVariableName = someFunction(argumentOne, argumentTwo, argumentThree, argumentFour, argumentFive);\` }
      </Code>
    </Stack>
  );
}
\`\`\`

> 默认 \`Code block\` 没有语法高亮——只有等宽字体。要语法高亮用 \`Prism\`（后面讲）。

---

## 四、Kbd：键盘按键

\`Kbd\` 展示键盘按键样式，常用于快捷键说明。

\`\`\`jsx
import { Kbd, Text, Group, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* 单按键 */}
      <Text>
        按 <Kbd>Enter</Kbd> 提交
      </Text>

      {/* 组合键：用 + 或 → 连接 */}
      <Text>
        <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd> 保存
      </Text>
      <Text>
        <Kbd>Cmd</Kbd> + <Kbd>Shift</Kbd> + <Kbd>P</Kbd> 打开命令面板
      </Text>

      {/* 方向键 */}
      <Text>
        用 <Kbd>↑</Kbd> <Kbd>↓</Kbd> <Kbd>←</Kbd> <Kbd>→</Kbd> 移动光标
      </Text>

      {/* 大小 */}
      <Group>
        <Kbd size="xs">XS</Kbd>
        <Kbd size="sm">SM</Kbd>
        <Kbd size="md">MD</Kbd>
        <Kbd size="lg">LG</Kbd>
      </Group>
    </Stack>
  );
}
\`\`\`

> ⭐ \`Kbd\` 是文档、快捷键提示、终端模拟器的必备组件。

---

## 五、Highlight：搜索高亮

\`Highlight\` 把字符串中匹配的关键词自动高亮——比手动拼 \`Mark\` 方便太多。

\`\`\`jsx
import { Highlight, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* highlight：要高亮的关键词（字符串或字符串数组） */}
      <Highlight highlight="Mantine">
        Mantine 是一套现代化 React 组件库
      </Highlight>

      {/* 多个关键词：传数组 */}
      <Highlight highlight={['React', '组件']}>
        Mantine 是 React 组件库，组件丰富
      </Highlight>

      {/* 自定义高亮颜色 */}
      <Highlight highlight="Next.js" color="red">
        推荐用 Next.js 部署
      </Highlight>

      {/* 模拟搜索结果 */}
      <Highlight highlight="Form" color="blue">
        useForm 是 Mantine Form 的核心 hook
      </Highlight>
    </Stack>
  );
}
\`\`\`

**Highlight vs Mark 的区别：**

- \`Mark\`：手动包裹要高亮的文字。
- \`Highlight\`：传一段文字 + 关键词，自动高亮所有匹配位置。

---

## 六、实战：搜索结果高亮

\`\`\`jsx
import { useState } from 'react';
import { Highlight, TextInput, Stack, Text } from '@mantine/core';

const articles = [
  'Mantine v9 新特性：性能提升 30%',
  '如何用 Mantine 搭建后台系统',
  'Mantine 与 Ant Design 对比',
  'React 19 配合 Mantine 的最佳实践',
];

export default function SearchDemo() {
  const [query, setQuery] = useState('Mantine');

  return (
    <Stack maw={500}>
      {/* 搜索框 */}
      <TextInput
        placeholder="输入关键词搜索..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* 搜索结果：每个标题高亮匹配部分 */}
      {articles.map((title, i) => (
        <Highlight key={i} highlight={query || 'Mantine'} color="yellow">
          {title}
        </Highlight>
      ))}
    </Stack>
  );
}
\`\`\`

> ⭐ \`Highlight\` 在搜索结果页、命令面板、过滤列表是高频组件。

---

## 七、Prism：语法高亮

\`Prism\` 基于 \` prismjs \` 实现代码语法高亮，需要单独安装。

\`\`\`bash
npm install @mantine/prism
\`\`\`

然后在 \`layout.js\` 引入样式：

\`\`\`jsx
import '@mantine/prism/styles.css';
\`\`\`

基础用法：

\`\`\`jsx
import { Prism, Stack } from '@mantine/prism';

export default function Demo() {
  return (
    <Stack>
      {/* Prism：自动语法高亮，language 指定语言 */}
      <Prism language="jsx">
{ \`// React 组件示例
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      点击次数：{count}
    </button>
  );
}\` }
      </Prism>

      {/* 不同语言 */}
      <Prism language="bash">
{ \`# 安装依赖
npm install @mantine/core @mantine/hooks

# 启动开发服务器
npm run dev\` }
      </Prism>

      <Prism language="tsx">
{ \`interface User {
  name: string;
  age: number;
}

const user: User = { name: 'Tom', age: 18 };\` }
      </Prism>

      {/* JSON */}
      <Prism language="json">
{ \`{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "@mantine/core": "^9.0.0"
  }
}\` }
      </Prism>
    </Stack>
  );
}
\`\`\`

> **提示**：Mantine v9 推荐使用 \`@mantine/code-highlight\` 替代 \`@mantine/prism\`（基于 shiki，体积更小、ESM 友好）。用法类似，这里以 Prism 为例保持兼容。

---

## 八、Prism 进阶：行号与复制

\`\`\`jsx
import { Prism } from '@mantine/prism';

export default function Demo() {
  return (
    <>
      {/* withLineNumbers：显示行号 */}
      <Prism language="jsx" withLineNumbers>
{ \`function hello() {
  console.log('Hello');
  return 'world';
}\` }
      </Prism>

      {/* noCopy：禁用复制按钮（默认带复制按钮） */}
      <Prism language="bash" noCopy mt="md">
{ \`npm install @mantine/prism\` }
      </Prism>

      {/* highlightLines：高亮指定行 */}
      <Prism
        language="jsx"
        highlightLines={{ 2: { color: 'red' }, 3: { color: 'green' } }}
        mt="md"
      >
{ \`const a = 1;
const b = 2;  // 这行红色
const c = 3;  // 这行绿色
const d = 4;\` }
      </Prism>

      {/* 自定义代码颜色主题：colorScheme 主题色 */}
      <Prism language="tsx" colorScheme="dark" mt="md">
{ \`const x: number = 42;\` }
      </Prism>
    </>
  );
}
\`\`\`

---

## 九、实战：技术博客代码块

\`\`\`jsx
import { Prism, Text, Title, Stack, Kbd } from '@mantine/core';
// 注意：实际项目里 Prism 从 @mantine/prism 导入
// 这里为了 demo 简化演示，实际代码请按上面方式导入

export default function BlogPost() {
  return (
    <Stack>
      <Title order={2}>1. 使用 useState 管理状态</Title>
      <Text>
        在 React 中，用 <Kbd>useState</Kbd> 创建状态变量。下面是一个计数器示例：
      </Text>

      {/* 代码块 */}
      <Prism language="jsx" withLineNumbers>
{ \`import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}\` }
      </Prism>

      <Title order={3} mt="md">要点</Title>
      <Text>
        1. <Kbd>useState</Kbd> 返回一个数组，第一项是值，第二项是 setter。
        <br />
        2. 不要直接修改 state，必须调用 setter。
      </Text>
    </Stack>
  );
}
\`\`\`

---

## 十、速查表

| 组件 | 用途 | 来源包 |
| --- | --- | --- |
| \`Mark\` | 行内文字高亮 | @mantine/core |
| \`Code\` | 行内代码 / 代码块 | @mantine/core |
| \`Kbd\` | 键盘按键展示 | @mantine/core |
| \`Highlight\` | 自动搜索高亮 | @mantine/core |
| \`Prism\` | 语法高亮代码块 | @mantine/prism |
| \`CodeHighlight\` | 新版语法高亮（推荐） | @mantine/code-highlight |

---

## 小结

- \`Mark\` 手动高亮、\`Highlight\` 自动高亮——选哪个看关键词是不是动态的。
- \`Code\` 等宽但不染色；要语法高亮用 \`Prism\` 或 \`CodeHighlight\`。
- \`Kbd\` 是文档、快捷键提示、CLI 演示的必备。
- 技术博客、文档站，这套组件组合起来又快又好看。

下一章学习排版系统集成——\`TypographyStylesProvider\` 与 react-markdown。`,
  },

  // ============================================================
  // 第九章 TypographyStylesProvider 与排版系统
  // ============================================================
  {
    id: 'mantine2-ch09',
    group: '第二部分 文本与排版',
    icon: '🔤',
    title: '第九章 TypographyStylesProvider 与排版系统',
    content: `## 一句话目标

学会用 \`TypographyStylesProvider\` 让**非 Mantine 组件**（比如 markdown 渲染的 HTML、富文本编辑器输出）自动套用 Mantine 的排版样式——做博客、文档站、富文本展示的终极武器。

---

## 一、为什么需要 TypographyStylesProvider

到目前为止，我们用 \`Text\`、\`Title\` 等 Mantine 组件写的文字，都有 Mantine 默认样式。但实际开发中经常遇到这种场景：

\`\`\`jsx
// 场景：从后端拿到一段 HTML 字符串
const html = \`
  <h1>文章标题</h1>
  <p>这是正文段落。</p>
  <ul><li>列表项</li></ul>
  <blockquote>这是引用</blockquote>
\`;

// 用 dangerouslySetInnerHTML 渲染
export default function Article() {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
\`\`\`

**问题：** 渲染出来的 \`<h1>\`、\`<p>\` 是浏览器默认样式——大但难看，跟 Mantine 主题完全脱节。

\`TypographyStylesProvider\` 解决的就是这个问题：**它会把 Mantine 主题的字号、行高、字重、颜色、间距、链接样式……自动应用到内部所有原生 HTML 标签上**。

---

## 二、基础用法

\`\`\`jsx
import { TypographyStylesProvider, Box } from '@mantine/core';

const html = \`
  <h1>文章标题</h1>
  <p>这是一段正文，使用了 <code>TypographyStylesProvider</code> 包裹后，
     所有原生 HTML 标签都会套用 Mantine 主题样式。</p>
  <h2>二级标题</h2>
  <ul>
    <li>列表项 1</li>
    <li>列表项 2</li>
  </ul>
  <blockquote>这是引用块，自带左侧色条和背景</blockquote>
  <a href="#">这是链接，自动应用主题色</a>
\`;

export default function Demo() {
  return (
    {/* TypographyStylesProvider：让里面的 HTML 标签自动套用 Mantine 样式 */}
    <TypographyStylesProvider>
      {/* 用 dangerouslySetInnerHTML 渲染 HTML 字符串 */}
      <Box dangerouslySetInnerHTML={{ __html: html }} />
    </TypographyStylesProvider>
  );
}
\`\`\`

> ⭐ 没加 \`TypographyStylesProvider\` 时，\`<h1>\` 是浏览器默认大字；加上后，自动变成 Mantine 主题配置的 h1 样式。

---

## 三、会被套用样式的标签

\`TypographyStylesProvider\` 内部对以下标签应用样式：

| 标签 | 套用的样式 |
| --- | --- |
| \`<h1>\` - \`<h6>\` | 标题字号、字重（按主题 headings 配置） |
| \`<p>\` | 正文行高、间距 |
| \`<a>\` | 链接色、hover 下划线 |
| \`<ul>\` / \`<ol>\` / \`<li>\` | 列表缩进、标记 |
| \`<blockquote>\` | 引用块（左侧色条、背景） |
| \`<code>\` | 行内代码（等宽、灰底） |
| \`<pre>\` | 代码块（背景、padding） |
| \`<mark>\` | 高亮（黄色背景） |
| \`<kbd>\` | 键盘按键样式 |
| \`<hr>\` | 分隔线（主题色） |
| \`<strong>\` / \`<em>\` | 粗体 / 斜体 |
| \`<table>\` 系列 | 表格样式 |

---

## 四、与 react-markdown 集成

技术博客、文档站几乎都用 \`react-markdown\` 渲染 Markdown。结合 \`TypographyStylesProvider\` 可以让 Markdown 输出直接套 Mantine 样式。

**安装：**

\`\`\`bash
npm install react-markdown remark-gfm
\`\`\`

**使用：**

\`\`\`jsx
'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TypographyStylesProvider, Box, Stack } from '@mantine/core';

const markdown = \`
# 文章标题

这是一段正文，**加粗** 和 *斜体* 都能正确渲染。

## 二级标题

- 列表项 1
- 列表项 2
- 列表项 3

\`\`\`js
const x = 42;
console.log(x);
\`\`\`

> 这是引用块，会被 Mantine 自动美化。

[链接到 Mantine](https://mantine.dev)
\`;

export default function MarkdownPage() {
  return (
    <Stack>
      {/* 关键：用 TypographyStylesProvider 包住 react-markdown 的输出 */}
      <TypographyStylesProvider>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdown}
        </ReactMarkdown>
      </TypographyStylesProvider>
    </Stack>
  );
}
\`\`\`

**为什么要用 remarkGfm？**

支持 GitHub 风格 Markdown：表格、删除线、任务列表、自动链接等。

---

## 五、自定义渲染组件

\`react-markdown\` 支持自定义每个标签渲染成什么组件。可以让某些标签用 Mantine 组件代替原生 HTML：

\`\`\`jsx
'use client';
import ReactMarkdown from 'react-markdown';
import { TypographyStylesProvider, Title, Text, Anchor, List, Blockquote, Code } from '@mantine/core';

const markdown = \`
# 标题
- 列表项
> 引用块
\`;

// 自定义渲染：把 markdown 标签映射到 Mantine 组件
const components = {
  // h1 用 Title order={1}
  h1: (props) => <Title order={1} {...props} />,
  h2: (props) => <Title order={2} {...props} />,
  h3: (props) => <Title order={3} {...props} />,
  // p 用 Text
  p: (props) => <Text {...props} />,
  // a 用 Anchor
  a: ({ children, ...props }) => (
    <Anchor target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </Anchor>
  ),
  // ul/ol 用 List
  ul: (props) => <List type="unordered" {...props} />,
  ol: (props) => <List type="ordered" {...props} />,
  li: (props) => <List.Item {...props} />,
  // blockquote 用 Blockquote
  blockquote: (props) => <Blockquote {...props} />,
  // code 用 Code
  code: ({ inline, children }) => (
    inline ? <Code>{children}</Code> : <Code block>{children}</Code>
  ),
};

export default function CustomMarkdown() {
  return (
    // 注意：用了自定义 components 后，TypographyStylesProvider 仍然有用——
    // 它会处理那些没有自定义渲染的标签（如 strong、em、table 等）
    <TypographyStylesProvider>
      <ReactMarkdown components={components}>
        {markdown}
      </ReactMarkdown>
    </TypographyStylesProvider>
  );
}
\`\`\`

> ⭐ **混合策略最佳实践：** 简单标签（strong、em、table）交给 \`TypographyStylesProvider\` 自动处理；复杂标签（h1、blockquote、code block）手动映射到对应 Mantine 组件，获得更精细控制。

---

## 六、自定义排版样式

如果对 Mantine 默认排版不满意，可以在主题里覆盖：

\`\`\`jsx
import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({
  // headings：自定义所有标题样式
  headings: {
    fontFamily: 'Georgia, serif',
    fontWeight: 800,
    sizes: {
      h1: { fontSize: '3rem', lineHeight: 1.2 },
      h2: { fontSize: '2.25rem', lineHeight: 1.3 },
      h3: { fontSize: '1.75rem', lineHeight: 1.4 },
    },
  },

  // 字体配置
  fontFamily: 'system-ui, -apple-system, "PingFang SC", sans-serif',
  lineHeight: 1.7,  // 正文行高

  // components：覆盖 TypographyStylesProvider 内部样式
  components: {
    TypographyStylesProvider: {
      styles: (theme) => ({
        root: {
          // 自定义所有内部元素的样式
          '& p': {
            marginBottom: theme.spacing.md,
          },
          '& blockquote': {
            borderLeft: \`4px solid \${theme.colors.blue[6]}\`,
            paddingLeft: theme.spacing.md,
            color: theme.colors.gray[7],
            fontStyle: 'italic',
          },
          '& code': {
            background: theme.colors.gray[1],
            padding: '2px 6px',
            borderRadius: theme.radius.sm,
            fontSize: '0.9em',
          },
          '& a': {
            color: theme.colors.blue[6],
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
          '& ul, & ol': {
            marginBottom: theme.spacing.md,
            paddingLeft: theme.spacing.lg,
          },
        },
      }),
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <MantineProvider theme={theme}>
      {children}
    </MantineProvider>
  );
}
\`\`\`

> ⭐ 这样配置后，所有 \`TypographyStylesProvider\` 内的 HTML 都会按你的样式渲染——一次配置，全局生效。

---

## 七、实战：博客文章页

\`\`\`jsx
'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  TypographyStylesProvider,
  Container,
  Title,
  Text,
  Group,
  Anchor,
  Box,
} from '@mantine/core';
import { IconClock, IconUser } from '@tabler/icons-react';

// 模拟从后端获取的 markdown 内容
const article = {
  title: 'Mantine v9 新特性详解',
  author: '张三',
  date: '2026-07-19',
  content: \`
## 一、性能改进

Mantine v9 相比 v7，**首屏渲染快 30%**，包体积减少 20%。

主要优化点：

- 改用静态 CSS 文件，去掉 Emotion 运行时
- 支持 React Server Components
- 优化暗色模式切换性能

## 二、新组件

### CodeHighlight

基于 shiki 的语法高亮组件，比 Prism 更轻量：

\`\`\`bash
npm install @mantine/code-highlight
\`\`\`

> ⭐ 推荐新项目直接用 CodeHighlight 替代 Prism。

## 三、迁移指南

参见 [官方迁移文档](https://mantine.dev)。
\`,
};

export default function BlogArticle() {
  return (
    <Container size="md" py="xl">
      {/* 文章头部 */}
      <Box mb="xl">
        <Title order={1} mb="xs">{article.title}</Title>
        <Group c="dimmed" size="sm" gap="lg">
          <Group gap={6}>
            <IconUser size={14} />
            <Anchor href={\`/author/\${article.author}\`} c="dimmed" underline="hover">
              {article.author}
            </Anchor>
          </Group>
          <Group gap={6}>
            <IconClock size={14} />
            <Text span size="sm">{article.date}</Text>
          </Group>
        </Group>
      </Box>

      {/* 文章正文：Markdown 渲染 + Mantine 样式 */}
      <TypographyStylesProvider>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {article.content}
        </ReactMarkdown>
      </TypographyStylesProvider>
    </Container>
  );
}
\`\`\`

---

## 八、富文本编辑器输出渲染

类似地，富文本编辑器（如 TipTap、Slate）输出 HTML 后，也可以用 \`TypographyStylesProvider\` 统一样式：

\`\`\`jsx
import { TypographyStylesProvider, Box } from '@mantine/core';

export default function RichTextRender({ html }) {
  return (
    <TypographyStylesProvider>
      {/* 富文本编辑器输出的 HTML 直接渲染 */}
      <Box dangerouslySetInnerHTML={{ __html: html }} />
    </TypographyStylesProvider>
  );
}

// 使用示例
const editorOutput = \`
<h2>编辑器输出</h2>
<p>这是一段由 <strong>富文本编辑器</strong> 生成的内容。</p>
<p>包含 <a href="#">链接</a>、<em>斜体</em>、<u>下划线</u> 等格式。</p>
<blockquote>编辑器输出的引用块也会自动美化</blockquote>
\`;

export function Demo() {
  return <RichTextRender html={editorOutput} />;
}
\`\`\`

---

## 九、注意事项

**1. \`TypographyStylesProvider\` 只对**直接子元素**的原生 HTML 标签生效**。如果你在内部又嵌套了 Mantine 组件（如 \`<Title>\`），那些组件会用自己的样式——可能导致冲突。建议**二选一**：

- 方案 A：全部用 Mantine 组件（\`Title\`、\`Text\`、\`List\`），不用 Provider。
- 方案 B：用 Provider 包裹原生 HTML / Markdown，不再手动写 Mantine 组件。

**2. CSS 优先级**：\`TypographyStylesProvider\` 用的是较弱的样式选择器，方便被覆盖。如果业务组件的 className 优先级更高，会正常生效。

**3. SSR 支持**：完全支持服务端渲染，不会闪烁。

---

## 十、速查表

| API | 作用 |
| --- | --- |
| \`TypographyStylesProvider\` | 让内部 HTML 自动套 Mantine 排版样式 |
| \`theme.headings\` | 配置标题字号字重 |
| \`theme.components.TypographyStylesProvider.styles\` | 覆盖内部样式 |
| \`dangerouslySetInnerHTML\` | React 渲染 HTML 字符串 |
| \`react-markdown\` | 渲染 Markdown |
| \`remark-gfm\` | GitHub 风格 Markdown 插件 |

---

## 小结

- \`TypographyStylesProvider\` 是「渲染富文本/Markdown/编辑器输出」场景的核心组件。
- 与 \`react-markdown\` 搭配是技术博客、文档站的标准方案。
- 通过 \`components.X.styles\` 可以精细控制内部样式。
- 二选一原则：要么全用 Mantine 组件，要么用 Provider 包裹原生 HTML。

至此，文本与排版部分结束。下一部分我们学习布局组件——\`Box\`、\`Stack\`、\`Group\`、\`Grid\`、\`Flex\`，搭出复杂页面骨架。`,
  },
];

export { chapters };
