// =============================================================
// Mantine 从入门到精通大全 - 第三批章节（第三部分 布局组件，共 4 项）
// -------------------------------------------------------------
// 本批包含：
//   mantine2-ch10 : 第十章 Box/Stack/Group/Container 基础布局
//   mantine2-ch11 : 第十一章 Grid 栅格系统与响应式
//   mantine2-ch12 : 第十二章 SimpleGrid 与 Flex 弹性布局
//   mantine2-ch13 : 第十三章 Space/Divider/AspectRatio 分隔与比例
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：Mantine v9 / React 19 / Next.js 16
// =============================================================

const chapters = [
  // ============================================================
  // 第十章 Box/Stack/Group/Container 基础布局
  // ============================================================
  {
    id: 'mantine2-ch10',
    group: '第三部分 布局组件',
    icon: '📦',
    title: '第十章 Box/Stack/Group/Container 基础布局',
    content: `## 一句话目标

掌握 Mantine 四大基础布局组件——\`Box\`（万能容器）、\`Stack\`（垂直堆叠）、\`Group\`（水平排列）、\`Container\`（居中容器），并系统学习贯穿所有组件的 **style props 体系**（\`p\`/\`m\`/\`bg\`/\`c\`/\`bd\` 等）。学完这章，80% 的页面布局你能闭眼写。

---

## 一、Box：最基础的容器

\`Box\` 是 Mantine 的「原子容器」——本质上是一个带样式 props 的 \`<div>\`。它最朴素，但最灵活。

**为什么用 Box 而不是直接 \`<div>\`？**

因为 \`Box\` 支持所有 **style props**——内边距、外边距、背景色、文字色、边框都能用 props 写，不用单独写 CSS。

\`\`\`jsx
import { Box } from '@mantine/core';

export default function Demo() {
  return (
    // Box 默认渲染成 <div>
    // p="md"：内边距用主题 md 间距（默认 16px）
    // bg="blue.6"：背景色用 blue 色阶第 6 级
    // c="white"：文字色白色
    // radius="md"：圆角中等
    <Box p="md" bg="blue.6" c="white" radius="md">
      我是一个带样式的容器
    </Box>
  );
}
\`\`\`

> ⭐ \`Box\` 是 Mantine 的「瑞士军刀」——任何需要加 padding、背景、边框的容器，第一反应就用 \`Box\`。

### 1.1 透传原生 props 与 component

\`Box\` 接受所有原生 div 的 props（\`onClick\`、\`id\`、\`className\`、\`style\` 等），还支持 \`component\` prop 改成其他标签：

\`\`\`jsx
import { Box, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* 1. 普通 div，加 onClick */}
      <Box onClick={() => alert('点击')} style={{ cursor: 'pointer' }} p="sm" bg="gray.1">
        可点击的 Box
      </Box>

      {/* 2. component="a"：渲染成 <a> 标签，但保留 style props 能力 */}
      <Box component="a" href="https://mantine.dev" target="_blank" c="blue">
        渲染成链接的 Box
      </Box>

      {/* 3. component="section"：语义化标签 */}
      <Box component="section" p="lg" bg="gray.1">
        渲染成 section
      </Box>
    </Stack>
  );
}
\`\`\`

### 1.2 Box 的 mod prop：条件样式

\`mod\`（modifiers）让你按状态加修饰符，配合主题的 \`variants\` 用——日常开发不常用，但知道有这个能力：

\`\`\`jsx
import { Box } from '@mantine/core';

export default function Demo() {
  return (
    // mod 接受对象，键是修饰符名，值是布尔
    // 这里只是演示，实际样式需在主题里定义 Box 的 variants
    <Box mod={{ active: true, disabled: false }} p="md" bg="gray.1">
      带 modifier 的 Box
    </Box>
  );
}
\`\`\`

---

## 二、Stack：垂直堆叠

\`Stack\` 把子元素**垂直排列**，并控制间距。是写表单、卡片内容的首选。

\`\`\`jsx
import { Stack, Button, Text } from '@mantine/core';

export default function Demo() {
  return (
    // gap="md"：子元素间距 16px（默认就是 md）
    // align="stretch"：子元素水平拉伸（默认）
    // justify="flex-start"：垂直顶部对齐（默认）
    <Stack gap="md" align="stretch" justify="flex-start">
      <Text>第一行</Text>
      <Text>第二行</Text>
      <Button>第三行是个按钮</Button>
    </Stack>
  );
}
\`\`\`

### 2.1 gap：间距控制

\`gap\` 接受主题 spacing 的 key（\`xs\`/\`sm\`/\`md\`/\`lg\`/\`xl\`）或具体数值：

\`\`\`jsx
import { Stack, Box } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap={0}>
      {/* gap={0}：子元素紧贴 */}
      <Box bg="blue.3" p="sm">gap=0</Box>
      <Box bg="blue.3" p="sm">紧贴</Box>
    </Stack>
  );
}
\`\`\`

### 2.2 align：水平对齐

\`align\` 控制子元素在**交叉轴**（水平方向）的对齐方式：

| 值 | 含义 |
| --- | --- |
| \`stretch\` | 拉伸到容器宽度（默认） |
| \`flex-start\` | 左对齐 |
| \`center\` | 居中 |
| \`flex-end\` | 右对齐 |

\`\`\`jsx
import { Stack, Button } from '@mantine/core';

export default function Demo() {
  return (
    // align="center"：子元素水平居中
    <Stack align="center" gap="sm">
      <Button>按钮 1</Button>
      <Button>按钮 2</Button>
      <Button>按钮 3</Button>
    </Stack>
  );
}
\`\`\`

### 2.3 justify：垂直分布

\`justify\` 控制子元素在**主轴**（垂直方向）的分布：

\`\`\`jsx
import { Stack, Box } from '@mantine/core';

export default function Demo() {
  return (
    // 高度撑开，让 justify 有空间分布
    // justify="space-between"：首尾贴边，中间均分
    <Stack h={300} justify="space-between">
      <Box bg="blue.3" p="sm">顶部</Box>
      <Box bg="blue.3" p="sm">中间</Box>
      <Box bg="blue.3" p="sm">底部</Box>
    </Stack>
  );
}
\`\`\`

> ⭐ \`Stack\` + \`Group\` 是 Mantine 布局的两把刷子——垂直用 Stack，水平用 Group，95% 的布局场景覆盖了。

---

## 三、Group：水平排列

\`Group\` 把子元素**水平排列**，子元素默认按内容宽度（不拉伸）。

\`\`\`jsx
import { Group, Button } from '@mantine/core';

export default function Demo() {
  return (
    // gap="md"：子元素间距 16px
    // 默认 align="center"：垂直居中
    // 默认 justify="flex-start"：左对齐
    // 默认 wrap="wrap"：换行
    <Group gap="md">
      <Button>按钮 1</Button>
      <Button>按钮 2</Button>
      <Button>按钮 3</Button>
    </Group>
  );
}
\`\`\`

### 3.1 grow：子元素等宽拉伸

默认 \`Group\` 子元素按内容宽度，设 \`grow\` 后子元素等宽撑满：

\`\`\`jsx
import { Group, Button } from '@mantine/core';

export default function Demo() {
  return (
    // grow：让所有子元素等宽拉伸（flex: 1）
    <Group grow>
      <Button>左</Button>
      <Button>中</Button>
      <Button>右</Button>
    </Group>
  );
}
\`\`\`

### 3.2 justify：水平对齐分布

\`\`\`jsx
import { Group, Button, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="md">
      {/* justify="flex-start"：左对齐（默认） */}
      <Group justify="flex-start">
        <Button>左对齐</Button>
      </Group>

      {/* justify="center"：居中 */}
      <Group justify="center">
        <Button>居中</Button>
      </Group>

      {/* justify="flex-end"：右对齐 */}
      <Group justify="flex-end">
        <Button>右对齐</Button>
      </Group>

      {/* justify="space-between"：两端对齐 */}
      <Group justify="space-between">
        <Button>左</Button>
        <Button>右</Button>
      </Group>
    </Stack>
  );
}
\`\`\`

### 3.3 wrap：是否换行

\`\`\`jsx
import { Group, Button } from '@mantine/core';

export default function Demo() {
  return (
    // wrap="wrap"：换行（默认）
    // wrap="nowrap"：不换行（超出会溢出）
    // wrap="wrap-reverse"：反向换行
    <Group wrap="wrap">
      {Array.from({ length: 20 }).map((_, i) => (
        <Button key={i}>按钮 {i + 1}</Button>
      ))}
    </Group>
  );
}
\`\`\`

### 3.4 preventGrowOverflow：防止子元素溢出

当 \`grow\` 拉伸的子元素内容过长时，可能会撑破容器。设 \`preventGrowOverflow\` 可以自动收缩：

\`\`\`jsx
import { Group, Button } from '@mantine/core';

export default function Demo() {
  return (
    // grow + preventGrowOverflow（默认 true）：子元素等宽且不溢出
    // 每个子元素宽度上限是 (1 / 子元素数) * 100%
    <Group grow preventGrowOverflow wrap="nowrap">
      <Button>短</Button>
      <Button>这个按钮的文字非常长非常长</Button>
      <Button>中等等等</Button>
    </Group>
  );
}
\`\`\`

> ⭐ \`preventGrowOverflow\` 默认就是 \`true\`。如果你的子元素确实需要按内容宽度（不均分），设为 \`false\`。

---

## 四、Container：居中容器

\`Container\` 是**水平居中、限制最大宽度**的容器——做博客、落地页、表单页的「主内容区」必用。

\`\`\`jsx
import { Container, Text } from '@mantine/core';

export default function Demo() {
  return (
    // 默认 size="md"：最大宽度约 960px
    // 自动水平居中（左右 margin: auto）
    // 默认带左右内边距（px）
    <Container size="md" bg="gray.1">
      <Text>主内容区，居中且限宽</Text>
    </Container>
  );
}
\`\`\`

### 4.1 size：宽度档位

\`size\` 接受预设值或具体数值。预设值对应最大宽度（默认主题）：

| 值 | 最大宽度 |
| --- | --- |
| \`xs\` | 540px |
| \`sm\` | 720px |
| \`md\` | 960px |
| \`lg\` | 1140px |
| \`xl\` | 1320px |

\`\`\`jsx
import { Container, Stack, Text } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      <Container size="xs" bg="blue.1">
        <Text size="sm">xs：540px</Text>
      </Container>
      <Container size="sm" bg="blue.1">
        <Text size="sm">sm：720px</Text>
      </Container>
      <Container size="lg" bg="blue.1">
        <Text size="sm">lg：1140px</Text>
      </Container>
    </Stack>
  );
}
\`\`\`

### 4.2 fluid：满宽

\`\`\`jsx
import { Container, Text } from '@mantine/core';

export default function Demo() {
  return (
    // fluid：100% 宽度，但仍保留左右内边距
    // 等价于 size="100%"
    <Container fluid bg="gray.1">
      <Text>满宽容器</Text>
    </Container>
  );
}
\`\`\`

### 4.3 自定义 size 数值

\`size\` 也可以是数字（像素）：

\`\`\`jsx
import { Container, Text } from '@mantine/core';

export default function Demo() {
  return (
    // size={480}：最大宽度 480px
    // px={0}：去掉默认左右内边距
    <Container size={480} px={0} bg="blue.1">
      <Text size="sm">480px 容器无内边距</Text>
    </Container>
  );
}
\`\`\`

> ⚠️ \`size\` **本身不支持响应式对象**——它只是一个固定值。要响应式 max-width，得用主题里覆盖 \`Container\` 的 \`vars\` 或自定义 \`classNames\`。

---

## 五、style props 体系全解

\`Box\`、\`Stack\`、\`Group\`、\`Container\` 以及 Mantine 几乎所有组件都支持一套统一的 **style props**。掌握这一套，写样式不用频繁切 CSS。

### 5.1 间距：p / m

\`p\` 是 padding，\`m\` 是 margin。每个都有方向变体：

| 全称 | 缩写 | 含义 |
| --- | --- | --- |
| padding | \`p\` | 四周 |
| paddingInline | \`px\` | 左右 |
| paddingBlock | \`py\` | 上下 |
| paddingLeft | \`pl\` | 左 |
| paddingRight | \`pr\` | 右 |
| paddingTop | \`pt\` | 上 |
| paddingBottom | \`pb\` | 下 |
| margin | \`m\` | 四周 |
| marginInline | \`mx\` | 左右 |
| marginBlock | \`my\` | 上下 |
| marginLeft | \`ml\` | 左 |
| marginRight | \`mr\` | 右 |
| marginTop | \`mt\` | 上 |
| marginBottom | \`mb\` | 下 |

\`\`\`jsx
import { Box } from '@mantine/core';

export default function Demo() {
  return (
    <Box
      p="md"     // 四周 padding 16px
      px="xl"    // 左右 padding 24px（覆盖 px 部分）
      pt="lg"    // 顶部 padding 20px（覆盖 pt 部分）
      mb="lg"    // 底部外边距 20px
      bg="gray.1"
    >
      精细控制 padding/margin
    </Box>
  );
}
\`\`\`

> ⭐ 优先级：\`p\` < \`px\`/\`py\` < \`pl\`/\`pr\`/\`pt\`/\`pb\`。具体的覆盖粗粒度的。

### 5.2 颜色：bg / c / bd

- \`bg\`：背景色
- \`c\`：文字色
- \`bd\`：边框

\`\`\`jsx
import { Box } from '@mantine/core';

export default function Demo() {
  return (
    <Box
      p="lg"
      bg="blue.6"            // 背景蓝
      c="white"              // 文字白
      bd="2px solid red"     // 红色边框
      radius="md"
    >
      蓝 / 白 / 红边框
    </Box>
  );
}
\`\`\`

### 5.3 颜色取值：色阶语法

\`bg\`、\`c\` 等接受多种格式：

\`\`\`jsx
import { Box, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="md">
      {/* 1. 主题色名 + 色阶，如 "blue.6" */}
      <Box bg="blue.6" c="white" p="sm">blue.6</Box>

      {/* 2. 主题色名（不带色阶，默认取第 6 阶） */}
      <Box bg="red" c="white" p="sm">red</Box>

      {/* 3. dimmed：弱化色（亮色模式灰，暗色模式浅灰） */}
      <Box bg="dimmed" c="white" p="sm">dimmed</Box>

      {/* 4. 任意 CSS 颜色值 */}
      <Box bg="#ff6b6b" c="white" p="sm">#ff6b6b</Box>

      {/* 5. 透明色：色阶后加 /A 表示透明度（0-100） */}
      <Box bg="blue.6/30" p="sm">blue.6/30（30% 透明度）</Box>
    </Stack>
  );
}
\`\`\`

### 5.4 其他常用 style props

\`\`\`jsx
import { Box } from '@mantine/core';

export default function Demo() {
  return (
    <Box
      w={300}           // 宽度 300px
      h={100}           // 高度 100px
      mih={80}          // 最小高度 80px
      mah={200}         // 最大高度 200px
      miw={200}         // 最小宽度 200px
      maw={400}         // 最大宽度 400px
      radius="lg"       // 圆角大
      shadow="md"       // 阴影中
      bd="1px solid gray.3"
      bg="white"
      c="dark"
      display="flex"    // display 模式
      style={{ overflow: 'hidden' }}  // 任意原生 style
    >
      各种 style props
    </Box>
  );
}
\`\`\`

### 5.5 响应式 style props

style props 支持对象语法做响应式（断点：\`base\`/\`xs\`/\`sm\`/\`md\`/\`lg\`/\`xl\`）：

\`\`\`jsx
import { Box, Text } from '@mantine/core';

export default function Demo() {
  return (
    // p 在手机上 sm，md 及以上 lg，lg 及以上 xl
    <Box
      p={{ base: 'sm', md: 'lg', lg: 'xl' }}
      bg={{ base: 'blue.2', md: 'blue.4' }}
      c={{ base: 'dark', md: 'white' }}
    >
      <Text>响应式 padding 和颜色</Text>
    </Box>
  );
}
\`\`\`

> ⭐ 响应式 style props 是 Mantine 的一大杀器——不用写一行媒体查询 CSS，纯 props 搞定三端适配。

---

## 小结

| 组件 | 用途 | 关键 props |
| --- | --- | --- |
| \`Box\` | 万能容器 | \`p\`/\`m\`/\`bg\`/\`c\`/\`bd\`/\`radius\`/\`component\` |
| \`Stack\` | 垂直堆叠 | \`gap\`/\`align\`/\`justify\` |
| \`Group\` | 水平排列 | \`gap\`/\`grow\`/\`wrap\`/\`justify\`/\`align\`/\`preventGrowOverflow\` |
| \`Container\` | 居中限宽 | \`size\`/\`fluid\`/\`px\` |

**style props 优先级口诀**：\`p\` < \`px\`/\`py\` < \`pl\`/\`pr\`/\`pt\`/\`pb\`，颜色用 \`色名.色阶\` 或 \`色名.色阶/透明度\`。

下一章我们学 Grid 栅格系统——做响应式布局的核心武器。`,
  },

  // ============================================================
  // 第十一章 Grid 栅格系统与响应式
  // ============================================================
  {
    id: 'mantine2-ch11',
    group: '第三部分 布局组件',
    icon: '🔲',
    title: '第十一章 Grid 栅格系统与响应式',
    content: `## 一句话目标

掌握 Mantine 的 \`Grid\` 栅格系统——\`columns\`、\`gap\`、\`Grid.Col\` 的 \`span\`/\`offset\`/\`order\`，以及响应式断点配置。学完这章，所有响应式页面布局你都能优雅实现。

---

## 一、Grid 栅格基础

\`Grid\` 把一行分成 **N 列**（默认 12 列），子元素 \`Grid.Col\` 通过 \`span\` 占几列。和 Bootstrap、Ant Design 的栅格是一个思路。

\`\`\`jsx
import { Grid, Box } from '@mantine/core';

export default function Demo() {
  return (
    // Grid：栅格容器
    // columns={12}：默认就是 12 列，可省略
    // gap="md"：列间距和行间距都是 md（16px）
    <Grid gap="md">
      {/* span={6}：占 6 列（12 列里的一半） */}
      <Grid.Col span={6}>
        <Box bg="blue.2" p="md">span=6</Box>
      </Grid.Col>
      <Grid.Col span={6}>
        <Box bg="blue.2" p="md">span=6</Box>
      </Grid.Col>

      {/* span={4}：占 4 列（12 列里的三分之一） */}
      <Grid.Col span={4}>
        <Box bg="blue.3" p="md">span=4</Box>
      </Grid.Col>
      <Grid.Col span={4}>
        <Box bg="blue.3" p="md">span=4</Box>
      </Grid.Col>
      <Grid.Col span={4}>
        <Box bg="blue.3" p="md">span=4</Box>
      </Grid.Col>
    </Grid>
  );
}
\`\`\`

> ⭐ \`Grid\` 是 Mantine 响应式布局的核心——所有「手机 1 列、平板 2 列、桌面 3 列」的需求都用它。

### 1.1 columns：自定义列数

默认 12 列，你也可以改成其他数：

\`\`\`jsx
import { Grid, Box } from '@mantine/core';

export default function Demo() {
  return (
    // columns={10}：10 列栅格
    // 适合不能被 12 整除的布局（比如 5 列等宽）
    <Grid columns={10} gap="md">
      <Grid.Col span={2}><Box bg="blue.2" p="md">2</Box></Grid.Col>
      <Grid.Col span={2}><Box bg="blue.2" p="md">2</Box></Grid.Col>
      <Grid.Col span={2}><Box bg="blue.2" p="md">2</Box></Grid.Col>
      <Grid.Col span={2}><Box bg="blue.2" p="md">2</Box></Grid.Col>
      <Grid.Col span={2}><Box bg="blue.2" p="md">2</Box></Grid.Col>
    </Grid>
  );
}
\`\`\`

### 1.2 gap：间距

\`gap\` 控制列与列、行与行之间的间距。可以是字符串（主题 spacing）或数字：

\`\`\`jsx
import { Grid, Box } from '@mantine/core';

export default function Demo() {
  return (
    // gap="lg"：列间距和行间距都是 lg（20px）
    <Grid gap="lg">
      <Grid.Col span={6}><Box bg="blue.2" p="md">span=6</Box></Grid.Col>
      <Grid.Col span={6}><Box bg="blue.2" p="md">span=6</Box></Grid.Col>
      <Grid.Col span={6}><Box bg="blue.2" p="md">span=6</Box></Grid.Col>
      <Grid.Col span={6}><Box bg="blue.2" p="md">span=6</Box></Grid.Col>
    </Grid>
  );
}
\`\`\`

### 1.3 rowGap / columnGap：分别控制

想列间距和行间距不一样？用 \`columnGap\` + \`rowGap\`（会覆盖 \`gap\`）：

\`\`\`jsx
import { Grid, Box } from '@mantine/core';

export default function Demo() {
  return (
    // columnGap="xs"：列间距小（紧凑）
    // rowGap="xl"：行间距大（行间留白）
    <Grid columnGap="xs" rowGap="xl">
      <Grid.Col span={6}><Box bg="blue.2" p="md">列间距小</Box></Grid.Col>
      <Grid.Col span={6}><Box bg="blue.2" p="md">列间距小</Box></Grid.Col>
      <Grid.Col span={6}><Box bg="blue.2" p="md">行间距大</Box></Grid.Col>
      <Grid.Col span={6}><Box bg="blue.2" p="md">行间距大</Box></Grid.Col>
    </Grid>
  );
}
\`\`\`

---

## 二、Grid.Col：span / offset / order

### 2.1 span：占几列

\`span\` 决定 \`Grid.Col\` 占几列，不指定时默认占满整行（\`span={12}\`）。还支持 \`"auto"\` 和 \`"content"\`：

\`\`\`jsx
import { Grid, Box } from '@mantine/core';

export default function Demo() {
  return (
    <Grid gap="md">
      {/* 不写 span，默认占 12 列（整行） */}
      <Grid.Col><Box bg="blue.2" p="md">默认整行</Box></Grid.Col>

      {/* span="auto"：按可用空间自动分配 */}
      <Grid.Col span="auto"><Box bg="blue.3" p="md">auto</Box></Grid.Col>
      <Grid.Col span="auto"><Box bg="blue.3" p="md">auto</Box></Grid.Col>
      <Grid.Col span={6}><Box bg="blue.4" p="md">span=6</Box></Grid.Col>

      {/* span="content"：按内容宽度（不撑满） */}
      <Grid.Col span="content"><Box bg="blue.5" p="md">content</Box></Grid.Col>
      <Grid.Col span={6}><Box bg="blue.4" p="md">span=6</Box></Grid.Col>
    </Grid>
  );
}
\`\`\`

**span 三种取值对比**：

| 取值 | 行为 |
| --- | --- |
| 数字（1-12） | 占指定列数 |
| \`"auto"\` | 与其他 auto 平分剩余空间 |
| \`"content"\` | 按内容宽度，不撑满 |

### 2.2 offset：左侧偏移

\`offset\` 让 \`Grid.Col\` 左侧空出几列：

\`\`\`jsx
import { Grid, Box } from '@mantine/core';

export default function Demo() {
  return (
    <Grid gap="md">
      {/* offset={3}：左侧空 3 列，span={6}：占 6 列 */}
      <Grid.Col span={6} offset={3}>
        <Box bg="blue.2" p="md">居中（offset=3, span=6）</Box>
      </Grid.Col>

      {/* offset={4}：左侧空 4 列 */}
      <Grid.Col span={4} offset={4}>
        <Box bg="blue.3" p="md">居中（offset=4, span=4）</Box>
      </Grid.Col>
    </Grid>
  );
}
\`\`\`

### 2.3 order：排序

\`order\` 控制 \`Grid.Col\` 的视觉顺序（不改 DOM 顺序）：

\`\`\`jsx
import { Grid, Box } from '@mantine/core';

export default function Demo() {
  return (
    <Grid gap="md">
      {/* DOM 顺序是 A B C，但 order 改变视觉顺序 */}
      <Grid.Col span={4} order={3}><Box bg="blue.2" p="md">A（order=3）</Box></Grid.Col>
      <Grid.Col span={4} order={1}><Box bg="blue.3" p="md">B（order=1）</Box></Grid.Col>
      <Grid.Col span={4} order={2}><Box bg="blue.4" p="md">C（order=2）</Box></Grid.Col>
    </Grid>
  );
}
\`\`\`

> ⭐ \`order\` 在响应式场景特别有用——手机上 A 在 B 前面，桌面上想让 B 在 A 前面，就用 \`order\` 调整。

### 2.4 Grid.Col 的 align：单独控制对齐

\`Grid.Col\` 自带 \`align\` prop，覆盖 \`Grid\` 的 \`align\`，控制单个列的垂直对齐：

\`\`\`jsx
import { Grid, Box } from '@mantine/core';

export default function Demo() {
  return (
    <Grid gap="md" align="stretch">
      <Grid.Col span={4} align="flex-start">
        <Box bg="blue.2" p="md" h={60}>顶</Box>
      </Grid.Col>
      <Grid.Col span={4} align="center">
        <Box bg="blue.3" p="md" h={60}>中</Box>
      </Grid.Col>
      <Grid.Col span={4} align="flex-end">
        <Box bg="blue.4" p="md" h={60}>底</Box>
      </Grid.Col>
    </Grid>
  );
}
\`\`\`

---

## 三、响应式断点

Mantine 默认断点（可在主题里改）：

| 断点 | 默认宽度 | 含义 |
| --- | --- | --- |
| \`base\` | - | 所有屏幕（手机起） |
| \`xs\` | 36em（576px） | 大手机 |
| \`sm\` | 48em（768px） | 平板竖屏 |
| \`md\` | 62em（992px） | 平板横屏 / 小桌面 |
| \`lg\` | 75em（1200px） | 桌面 |
| \`xl\` | 88em（1408px） | 大桌面 |

\`span\`、\`offset\`、\`order\` 都支持对象语法做响应式：

\`\`\`jsx
import { Grid, Box } from '@mantine/core';

export default function Demo() {
  return (
    <Grid gap="md">
      {/* 手机 1 列（span=12），平板 2 列（md=6），桌面 3 列（lg=4） */}
      <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
        <Box bg="blue.2" p="md">卡片 1</Box>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
        <Box bg="blue.2" p="md">卡片 2</Box>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
        <Box bg="blue.2" p="md">卡片 3</Box>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
        <Box bg="blue.2" p="md">卡片 4</Box>
      </Grid.Col>
    </Grid>
  );
}
\`\`\`

> ⭐ 这是 \`Grid\` 最经典的写法：\`span={{ base: 12, md: 6, lg: 4 }}\`——一行代码实现三端响应式。

### 3.1 gap 响应式

\`gap\`、\`rowGap\`、\`columnGap\` 都支持响应式对象：

\`\`\`jsx
import { Grid, Box } from '@mantine/core';

export default function Demo() {
  return (
    // 手机上间距小，桌面间距大
    <Grid gap={{ base: 5, xs: 'sm', md: 'md', lg: 'lg' }}>
      <Grid.Col span={6}><Box bg="blue.2" p="md">1</Box></Grid.Col>
      <Grid.Col span={6}><Box bg="blue.2" p="md">2</Box></Grid.Col>
      <Grid.Col span={6}><Box bg="blue.2" p="md">3</Box></Grid.Col>
      <Grid.Col span={6}><Box bg="blue.2" p="md">4</Box></Grid.Col>
    </Grid>
  );
}
\`\`\`

### 3.2 order 响应式

\`\`\`jsx
import { Grid, Box } from '@mantine/core';

export default function Demo() {
  return (
    <Grid gap="md">
      {/* 手机上 sidebar 在下面（order=2），桌面上在左边（order=1） */}
      <Grid.Col span={{ base: 12, md: 4 }} order={{ base: 2, md: 1 }}>
        <Box bg="blue.2" p="md">Sidebar</Box>
      </Grid.Col>
      {/* 手机上 main 在上面（order=1），桌面上在右边（order=2） */}
      <Grid.Col span={{ base: 12, md: 8 }} order={{ base: 1, md: 2 }}>
        <Box bg="blue.3" p="md">Main Content</Box>
      </Grid.Col>
    </Grid>
  );
}
\`\`\`

### 3.3 offset 响应式

\`\`\`jsx
import { Grid, Box } from '@mantine/core';

export default function Demo() {
  return (
    <Grid gap="md">
      {/* 桌面上偏移居中，手机上不偏移 */}
      <Grid.Col span={{ base: 12, md: 6 }} offset={{ base: 0, md: 3 }}>
        <Box bg="blue.2" p="md">响应式 offset</Box>
      </Grid.Col>
    </Grid>
  );
}
\`\`\`

---

## 四、grow / justify / align

### 4.1 grow：自动等分

设 \`grow\` 后，所有 \`Grid.Col\` 不指定 \`span\` 时自动等分剩余空间：

\`\`\`jsx
import { Grid, Box } from '@mantine/core';

export default function Demo() {
  return (
    // grow：3 个 Col 不指定 span，自动各占 4 列
    <Grid grow>
      <Grid.Col><Box bg="blue.2" p="md">1</Box></Grid.Col>
      <Grid.Col><Box bg="blue.2" p="md">2</Box></Grid.Col>
      <Grid.Col><Box bg="blue.2" p="md">3</Box></Grid.Col>
    </Grid>
  );
}
\`\`\`

### 4.2 justify：水平对齐

\`justify\` 控制所有 Col 在主轴上的对齐（当 Col 总宽度不满时）：

\`\`\`jsx
import { Grid, Box } from '@mantine/core';

export default function Demo() {
  return (
    // 3 个 Col 各占 2 列（共 6 列），剩 6 列空间
    // justify="center"：把剩余空间均分到两侧
    <Grid justify="center" gap="md">
      <Grid.Col span={2}><Box bg="blue.2" p="md">1</Box></Grid.Col>
      <Grid.Col span={2}><Box bg="blue.2" p="md">2</Box></Grid.Col>
      <Grid.Col span={2}><Box bg="blue.2" p="md">3</Box></Grid.Col>
    </Grid>
  );
}
\`\`\`

### 4.3 align：垂直对齐

\`align\` 控制 Col 在交叉轴（垂直方向）的对齐：

\`\`\`jsx
import { Grid, Box } from '@mantine/core';

export default function Demo() {
  return (
    // align="center"：垂直居中（不同高度的 Col）
    <Grid align="center" gap="md">
      <Grid.Col span={6}><Box bg="blue.2" p="md" h={60}>高 60</Box></Grid.Col>
      <Grid.Col span={6}><Box bg="blue.3" p="md" h={100}>高 100</Box></Grid.Col>
    </Grid>
  );
}
\`\`\`

---

## 五、type="container"：容器查询

默认 \`Grid\` 用**媒体查询**（基于视口宽度）。设 \`type="container"\` 改用**容器查询**（基于父容器宽度）——组件化场景特别有用（组件本身不知道外面给了多宽）：

\`\`\`jsx
import { Grid, Box } from '@mantine/core';

export default function Demo() {
  return (
    // 外层 wrapper 仅为演示，可拖拽右下角调整宽度
    <div style={{ resize: 'horizontal', overflow: 'hidden', maxWidth: '100%' }}>
      {/* type="container"：用容器查询 */}
      {/* breakpoints：容器查询必须指定具体 px 值（不能用主题断点名） */}
      <Grid
        type="container"
        breakpoints={{ xs: '100px', sm: '200px', md: '300px', lg: '400px', xl: '500px' }}
      >
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Box bg="blue.2" p="md">1</Box>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Box bg="blue.2" p="md">2</Box>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Box bg="blue.2" p="md">3</Box>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Box bg="blue.2" p="md">4</Box>
        </Grid.Col>
      </Grid>
    </div>
  );
}
\`\`\`

> ⭐ 容器查询是 Mantine v8+ 的新能力——做可复用组件库时，组件内布局跟着容器走，而不是跟着视口走，更符合组件化思维。

---

## 六、实战：卡片列表

经典响应式卡片列表——手机 1 列、平板 2 列、桌面 3 列、大屏 4 列：

\`\`\`jsx
import { Grid, Card, Text, Image, Button } from '@mantine/core';

const cards = [
  { id: 1, title: '卡片 1', desc: '描述 1' },
  { id: 2, title: '卡片 2', desc: '描述 2' },
  { id: 3, title: '卡片 3', desc: '描述 3' },
  { id: 4, title: '卡片 4', desc: '描述 4' },
  { id: 5, title: '卡片 5', desc: '描述 5' },
  { id: 6, title: '卡片 6', desc: '描述 6' },
];

export default function Demo() {
  return (
    // 响应式：手机 1 列、平板 2 列、桌面 3 列、大屏 4 列
    <Grid gap={{ base: 5, md: 'md' }}>
      {cards.map((c) => (
        <Grid.Col key={c.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              <Image
                src={\`https://picsum.photos/400/200?random=\${c.id}\`}
                height={160}
                alt={c.title}
              />
            </Card.Section>
            <Text fw={500} size="lg" mt="md">{c.title}</Text>
            <Text size="sm" c="dimmed" mt="xs">{c.desc}</Text>
            <Button variant="light" color="blue" fullWidth mt="md" radius="md">
              查看详情
            </Button>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  );
}
\`\`\`

---

## 七、实战：表单布局

表单常见的「左标签右输入」响应式布局：

\`\`\`jsx
import { Grid, TextInput, Text, Button } from '@mantine/core';

export default function Demo() {
  return (
    <Grid gap="md">
      {/* 标签：手机整行，桌面占 3 列右对齐 */}
      <Grid.Col span={{ base: 12, md: 3 }}>
        <Text ta={{ base: 'left', md: 'right' }} pt={{ base: 0, md: 'sm' }}>
          用户名
        </Text>
      </Grid.Col>
      {/* 输入框：手机整行，桌面占 9 列 */}
      <Grid.Col span={{ base: 12, md: 9 }}>
        <TextInput placeholder="请输入用户名" />
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 3 }}>
        <Text ta={{ base: 'left', md: 'right' }} pt={{ base: 0, md: 'sm' }}>
          邮箱
        </Text>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 9 }}>
        <TextInput placeholder="请输入邮箱" />
      </Grid.Col>

      {/* 操作区：md 以上偏移 3 列对齐输入框 */}
      <Grid.Col span={{ base: 12, md: 9 }} offset={{ base: 0, md: 3 }}>
        <Button>提交</Button>
      </Grid.Col>
    </Grid>
  );
}
\`\`\`

---

## 小结

| prop | 作用 | 响应式 |
| --- | --- | --- |
| \`columns\` | 总列数（默认 12） | ❌ |
| \`gap\` | 间距（行列同） | ✅ \`{base, md}\` |
| \`rowGap\`/\`columnGap\` | 行/列间距 | ✅ |
| \`grow\` | 自动等分 | ❌ |
| \`justify\` | 水平对齐 | ❌ |
| \`align\` | 垂直对齐 | ❌ |
| \`type="container"\` | 容器查询模式 | ❌ |
| \`Grid.Col span\` | 占几列 / \`"auto"\` / \`"content"\` | ✅ \`{base, md, lg}\` |
| \`Grid.Col offset\` | 左偏移 | ✅ |
| \`Grid.Col order\` | 排序 | ✅ |
| \`Grid.Col align\` | 单列对齐（align-self） | ❌ |

**响应式口诀**：\`span={{ base: 12, md: 6, lg: 4 }}\` 是黄金组合，覆盖 90% 场景。

下一章学 \`SimpleGrid\` 和 \`Flex\`——更轻量的布局选择。`,
  },

  // ============================================================
  // 第十二章 SimpleGrid 与 Flex 弹性布局
  // ============================================================
  {
    id: 'mantine2-ch12',
    group: '第三部分 布局组件',
    icon: '🧩',
    title: '第十二章 SimpleGrid 与 Flex 弹性布局',
    content: `## 一句话目标

掌握 Mantine 的 \`SimpleGrid\`（等宽网格）和 \`Flex\`（弹性盒子）两个布局组件，知道何时用 \`Grid\`、何时用 \`SimpleGrid\`、何时用 \`Flex\`，并能落地图片墙、按钮组等高频场景。

---

## 一、SimpleGrid：等宽网格

\`SimpleGrid\` 是「**等宽网格**」——你只告诉它一行有几列，剩下的它自动搞定。比 \`Grid\` 简单，适合**等宽卡片列表**。底层基于 CSS Grid 实现。

\`\`\`jsx
import { SimpleGrid, Box } from '@mantine/core';

export default function Demo() {
  return (
    // cols={3}：固定 3 列
    // spacing="md"：间距 16px
    <SimpleGrid cols={3} spacing="md">
      <Box bg="blue.2" p="md">1</Box>
      <Box bg="blue.2" p="md">2</Box>
      <Box bg="blue.2" p="md">3</Box>
      <Box bg="blue.2" p="md">4</Box>
      <Box bg="blue.2" p="md">5</Box>
      <Box bg="blue.2" p="md">6</Box>
    </SimpleGrid>
  );
}
\`\`\`

> ⭐ \`SimpleGrid\` 比 \`Grid\` 简单——不用数 \`span\`，只说「几列」就行。

### 1.1 cols 响应式：核心能力

\`cols\` 支持对象语法做响应式，这是 \`SimpleGrid\` 最常用的写法：

\`\`\`jsx
import { SimpleGrid, Box } from '@mantine/core';

export default function Demo() {
  return (
    // 手机 1 列，平板 2 列，桌面 3 列，大屏 4 列
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
      {Array.from({ length: 8 }).map((_, i) => (
        <Box key={i} bg="blue.2" p="md">卡片 {i + 1}</Box>
      ))}
    </SimpleGrid>
  );
}
\`\`\`

> ⭐ 这是 \`SimpleGrid\` 的招牌用法——一行代码搞定响应式等宽网格，比 \`Grid\` 简洁太多。

### 1.2 spacing：水平+垂直间距

\`spacing\` 同时控制列间距和行间距：

\`\`\`jsx
import { SimpleGrid, Box } from '@mantine/core';

export default function Demo() {
  return (
    // spacing="lg"：列间距和行间距都是 lg（20px）
    <SimpleGrid cols={3} spacing="lg">
      <Box bg="blue.2" p="md">1</Box>
      <Box bg="blue.2" p="md">2</Box>
      <Box bg="blue.2" p="md">3</Box>
      <Box bg="blue.2" p="md">4</Box>
    </SimpleGrid>
  );
}
\`\`\`

### 1.3 verticalSpacing：单独控制行间距

想列间距和行间距不一样？用 \`spacing\` + \`verticalSpacing\`：

\`\`\`jsx
import { SimpleGrid, Box } from '@mantine/core';

export default function Demo() {
  return (
    // spacing="xs"：列间距小（紧凑）
    // verticalSpacing="xl"：行间距大（行间留白）
    <SimpleGrid
      cols={3}
      spacing="xs"
      verticalSpacing="xl"
    >
      <Box bg="blue.2" p="md">1</Box>
      <Box bg="blue.2" p="md">2</Box>
      <Box bg="blue.2" p="md">3</Box>
      <Box bg="blue.2" p="md">4</Box>
      <Box bg="blue.2" p="md">5</Box>
      <Box bg="blue.2" p="md">6</Box>
    </SimpleGrid>
  );
}
\`\`\`

### 1.4 spacing 和 verticalSpacing 都支持响应式

\`\`\`jsx
import { SimpleGrid, Box } from '@mantine/core';

export default function Demo() {
  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, md: 4 }}
      spacing={{ base: 10, sm: 'md' }}              // 列间距响应式
      verticalSpacing={{ base: 'sm', md: 'lg' }}    // 行间距响应式
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <Box key={i} bg="blue.2" p="md">卡片 {i + 1}</Box>
      ))}
    </SimpleGrid>
  );
}
\`\`\`

### 1.5 type="container"：容器查询

和 \`Grid\` 一样，\`SimpleGrid\` 也支持 \`type="container"\`——基于父容器宽度而非视口宽度响应。容器查询模式下，断点 key 必须是具体 px/em 值：

\`\`\`jsx
import { SimpleGrid, Box } from '@mantine/core';

export default function Demo() {
  return (
    // 外层 wrapper 仅为演示，可拖拽右下角调整宽度
    <div style={{ resize: 'horizontal', overflow: 'hidden', maxWidth: '100%' }}>
      {/* type="container"：用容器查询 */}
      {/* cols 的 key 是具体 px 值（不是主题断点名） */}
      <SimpleGrid
        type="container"
        cols={{ base: 1, '300px': 2, '500px': 5 }}
        spacing={{ base: 10, '300px': 'md' }}
      >
        <Box bg="blue.2" p="md">1</Box>
        <Box bg="blue.2" p="md">2</Box>
        <Box bg="blue.2" p="md">3</Box>
        <Box bg="blue.2" p="md">4</Box>
        <Box bg="blue.2" p="md">5</Box>
      </SimpleGrid>
    </div>
  );
}
\`\`\`

> ⭐ 容器查询模式适合做**可复用组件**——组件内布局跟着容器宽度走，嵌入任何地方都能正确响应。

### 1.6 minColWidth：自动列数

设 \`minColWidth\` 后，\`SimpleGrid\` 会按「容器宽度 / minColWidth」自动算列数（CSS Grid \`auto-fill\`）。此时 \`cols\` prop 被忽略：

\`\`\`jsx
import { SimpleGrid, Box } from '@mantine/core';

export default function Demo() {
  return (
    // minColWidth="200px"：每列至少 200px，列数自动算
    // 容器变宽 → 列变多；容器变窄 → 列变少
    <SimpleGrid minColWidth="200px" spacing="md">
      <Box bg="blue.2" p="md">1</Box>
      <Box bg="blue.2" p="md">2</Box>
      <Box bg="blue.2" p="md">3</Box>
      <Box bg="blue.2" p="md">4</Box>
      <Box bg="blue.2" p="md">5</Box>
    </SimpleGrid>
  );
}
\`\`\`

### 1.7 autoFlow：auto-fill vs auto-fit

配合 \`minColWidth\` 用，控制最后一行不满时的行为：

\`\`\`jsx
import { SimpleGrid, Box, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* autoFlow="auto-fill"（默认）：保留空轨道，子元素不拉伸 */}
      <SimpleGrid minColWidth="100px" autoFlow="auto-fill">
        <Box bg="blue.2" p="md">1</Box>
        <Box bg="blue.2" p="md">2</Box>
        <Box bg="blue.2" p="md">3</Box>
      </SimpleGrid>

      {/* autoFlow="auto-fit"：折叠空轨道，子元素拉伸填满 */}
      <SimpleGrid minColWidth="100px" autoFlow="auto-fit">
        <Box bg="blue.3" p="md">1</Box>
        <Box bg="blue.3" p="md">2</Box>
        <Box bg="blue.3" p="md">3</Box>
      </SimpleGrid>
    </Stack>
  );
}
\`\`\`

**两者区别**：

| 模式 | 最后一行不满时 |
| --- | --- |
| \`auto-fill\` | 保留空位，子元素按内容宽度 |
| \`auto-fit\` | 折叠空位，子元素拉伸填满 |

### 1.8 autoRows：行高控制

\`autoRows\` 控制隐式创建的行的高度，让所有行等高或有最小高度：

\`\`\`jsx
import { SimpleGrid, Box } from '@mantine/core';

export default function Demo() {
  return (
    // autoRows="minmax(100px, auto)"：行高最小 100px，最大按内容
    <SimpleGrid cols={3} autoRows="minmax(100px, auto)" spacing="md">
      <Box bg="blue.2" p="md">1</Box>
      <Box bg="blue.2" p="md">2</Box>
      <Box bg="blue.2" p="md">3</Box>
      <Box bg="blue.2" p="md">4</Box>
      <Box bg="blue.2" p="md">5</Box>
    </SimpleGrid>
  );
}
\`\`\`

---

## 二、Flex：弹性盒子

\`Flex\` 是 Mantine 对 \`display: flex\` 的封装——把所有 flex 属性变成 props，省得写 CSS。

\`\`\`jsx
import { Flex, Box } from '@mantine/core';

export default function Demo() {
  return (
    // direction="row"：主轴水平（默认）
    // justify="center"：主轴居中
    // align="center"：交叉轴居中
    // gap="md"：子元素间距
    <Flex
      direction="row"
      justify="center"
      align="center"
      gap="md"
      h={200}
      bg="gray.1"
    >
      <Box bg="blue.3" p="md">A</Box>
      <Box bg="blue.3" p="md">B</Box>
      <Box bg="blue.3" p="md">C</Box>
    </Flex>
  );
}
\`\`\`

> ⭐ \`Flex\` 的优势：所有 flex 属性都是 props，IDE 自动补全，不用记 CSS 关键字。

### 2.1 direction：主轴方向

\`\`\`jsx
import { Flex, Box } from '@mantine/core';

export default function Demo() {
  return (
    <Flex direction="column" gap="md">
      <Box bg="blue.3" p="md">上</Box>
      <Box bg="blue.3" p="md">中</Box>
      <Box bg="blue.3" p="md">下</Box>
    </Flex>
  );
}
\`\`\`

\`direction\` 可选值：

| 值 | CSS 等价 |
| --- | --- |
| \`row\` | \`flex-direction: row\`（默认） |
| \`row-reverse\` | \`flex-direction: row-reverse\` |
| \`column\` | \`flex-direction: column\` |
| \`column-reverse\` | \`flex-direction: column-reverse\` |

### 2.2 justify：主轴对齐

\`\`\`jsx
import { Flex, Box, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="md">
      <Flex justify="flex-start" gap="sm" bg="gray.1" p="sm">
        <Box bg="blue.3" p="xs">A</Box>
        <Box bg="blue.3" p="xs">B</Box>
      </Flex>
      <Flex justify="center" gap="sm" bg="gray.1" p="sm">
        <Box bg="blue.3" p="xs">A</Box>
        <Box bg="blue.3" p="xs">B</Box>
      </Flex>
      <Flex justify="flex-end" gap="sm" bg="gray.1" p="sm">
        <Box bg="blue.3" p="xs">A</Box>
        <Box bg="blue.3" p="xs">B</Box>
      </Flex>
      <Flex justify="space-between" gap="sm" bg="gray.1" p="sm">
        <Box bg="blue.3" p="xs">A</Box>
        <Box bg="blue.3" p="xs">B</Box>
      </Flex>
      <Flex justify="space-around" gap="sm" bg="gray.1" p="sm">
        <Box bg="blue.3" p="xs">A</Box>
        <Box bg="blue.3" p="xs">B</Box>
      </Flex>
    </Stack>
  );
}
\`\`\`

### 2.3 align：交叉轴对齐

\`\`\`jsx
import { Flex, Box, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="md">
      <Flex align="flex-start" gap="sm" bg="gray.1" p="sm" h={80}>
        <Box bg="blue.3" p="xs">A</Box>
        <Box bg="blue.3" p="xs" style={{ height: 50 }}>B（高 50）</Box>
      </Flex>
      <Flex align="center" gap="sm" bg="gray.1" p="sm" h={80}>
        <Box bg="blue.3" p="xs">A</Box>
        <Box bg="blue.3" p="xs" style={{ height: 50 }}>B（高 50）</Box>
      </Flex>
      <Flex align="flex-end" gap="sm" bg="gray.1" p="sm" h={80}>
        <Box bg="blue.3" p="xs">A</Box>
        <Box bg="blue.3" p="xs" style={{ height: 50 }}>B（高 50）</Box>
      </Flex>
    </Stack>
  );
}
\`\`\`

### 2.4 wrap：是否换行

\`\`\`jsx
import { Flex, Box } from '@mantine/core';

export default function Demo() {
  return (
    // wrap="wrap"：换行（默认）
    <Flex wrap="wrap" gap="sm">
      {Array.from({ length: 15 }).map((_, i) => (
        <Box key={i} bg="blue.3" p="md" w={100}>{i + 1}</Box>
      ))}
    </Flex>
  );
}
\`\`\`

### 2.5 Flex 与 Group/Stack 的区别

\`Flex\` 比 \`Group\`/\`Stack\` 更底层：

| 组件 | 本质 | 适用场景 |
| --- | --- | --- |
| \`Stack\` | \`Flex direction="column"\` 的快捷方式 | 简单垂直排列 |
| \`Group\` | \`Flex\` + 默认 \`wrap\` + 子元素不拉伸 | 简单水平排列 |
| \`Flex\` | 完整 flex 容器 | 需要精细控制 direction/align |

\`\`\`jsx
import { Flex, Stack, Group, Box } from '@mantine/core';

export default function Demo() {
  return (
    <>
      {/* Stack 等价于 Flex direction="column" */}
      <Stack gap="md">
        <Box bg="blue.2" p="sm">Stack 1</Box>
        <Box bg="blue.2" p="sm">Stack 2</Box>
      </Stack>

      {/* Group 等价于 Flex direction="row" + wrap */}
      <Group gap="md" mt="md">
        <Box bg="blue.2" p="sm">Group 1</Box>
        <Box bg="blue.2" p="sm">Group 2</Box>
      </Group>

      {/* Flex 完整控制 */}
      <Flex direction="row-reverse" justify="flex-end" align="center" gap="md" mt="md">
        <Box bg="blue.2" p="sm">Flex 1</Box>
        <Box bg="blue.2" p="sm">Flex 2</Box>
      </Flex>
    </>
  );
}
\`\`\`

---

## 三、SimpleGrid vs Grid 选型

| 场景 | 推荐 | 原因 |
| --- | --- | --- |
| 等宽卡片列表（手机 1 / 平板 2 / 桌面 3） | \`SimpleGrid\` | 一行 \`cols\` 搞定，最简洁 |
| 不同列宽（sidebar 4 + main 8） | \`Grid\` | \`Grid.Col span\` 精细控制 |
| 需要 \`offset\` 居中或留白 | \`Grid\` | \`SimpleGrid\` 没有 \`offset\` |
| 需要 \`order\` 排序 | \`Grid\` | \`SimpleGrid\` 没有 \`order\` |
| 图片墙（等宽不等高） | \`SimpleGrid\` | 简单 |
| 表单标签+输入框 | \`Grid\` | 精细控制列宽 |
| 自动列数（按容器宽度算） | \`SimpleGrid\` + \`minColWidth\` | \`Grid\` 不支持 |
| 不规则布局 | \`Flex\` 或 \`Grid\` | 灵活 |

> ⭐ 选型口诀：**等宽用 SimpleGrid，不等宽用 Grid，自由排布用 Flex**。

---

## 四、实战：图片墙

\`\`\`jsx
import { SimpleGrid, Image, AspectRatio } from '@mantine/core';

export default function Demo() {
  return (
    // 图片墙：手机 2 列，平板 3 列，桌面 4 列
    <SimpleGrid
      cols={{ base: 2, sm: 3, md: 4 }}
      spacing="sm"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <AspectRatio key={i} ratio={1}>
          <Image
            src={\`https://picsum.photos/300/300?random=\${i + 1}\`}
            alt={\`图片 \${i + 1}\`}
            radius="md"
          />
        </AspectRatio>
      ))}
    </SimpleGrid>
  );
}
\`\`\`

---

## 五、实战：按钮组

\`\`\`jsx
import { Flex, Button, Group } from '@mantine/core';

export default function Demo() {
  return (
    <>
      {/* 1. 顶部按钮组：左主操作 + 右次操作，用 Flex space-between */}
      <Flex justify="space-between" align="center" mb="md">
        <Button color="blue">新建项目</Button>
        <Flex gap="sm">
          <Button variant="light" color="gray">导出</Button>
          <Button variant="light" color="red">删除</Button>
        </Flex>
      </Flex>

      {/* 2. 居中按钮组（CTA），用 Group 居中 */}
      <Group justify="center" gap="md">
        <Button size="lg">立即开始</Button>
        <Button size="lg" variant="default">了解更多</Button>
      </Group>

      {/* 3. 等宽按钮组，用 Flex + fullWidth */}
      <Flex gap="sm" mt="md">
        <Button fullWidth>上一步</Button>
        <Button fullWidth>下一步</Button>
      </Flex>
    </>
  );
}
\`\`\`

---

## 小结

| 组件 | 用途 | 关键 props |
| --- | --- | --- |
| \`SimpleGrid\` | 等宽网格 | \`cols\`/\`spacing\`/\`verticalSpacing\`/\`type\`/\`minColWidth\`/\`autoFlow\`/\`autoRows\` |
| \`Flex\` | 弹性盒子 | \`direction\`/\`justify\`/\`align\`/\`gap\`/\`wrap\` |

**选型口诀**：等宽用 \`SimpleGrid\`，不等宽用 \`Grid\`，自由排布用 \`Flex\`。简单垂直用 \`Stack\`，简单水平用 \`Group\`。

下一章学 \`Space\`、\`Divider\`、\`AspectRatio\`——分隔与比例组件。`,
  },

  // ============================================================
  // 第十三章 Space/Divider/AspectRatio 分隔与比例
  // ============================================================
  {
    id: 'mantine2-ch13',
    group: '第三部分 布局组件',
    icon: '📏',
    title: '第十三章 Space/Divider/AspectRatio 分隔与比例',
    content: `## 一句话目标

掌握 Mantine 的三个「小巧但常用」布局组件：\`Space\`（空白间距）、\`Divider\`（分隔线）、\`AspectRatio\`（固定宽高比）。学完这章，表单分组、视频嵌入、间距留白这些细节场景你都能优雅处理。

---

## 一、Space：空白间距

\`Space\` 渲染一个**纯空白块**——就是占位用的，让两个元素之间留出指定距离。

\`\`\`jsx
import { Space, Text } from '@mantine/core';

export default function Demo() {
  return (
    <div>
      <Text>第一段</Text>
      {/* h="md"：高度 16px 的空白 */}
      <Space h="md" />
      <Text>第二段（和第一段间距 md）</Text>
    </div>
  );
}
\`\`\`

> ⭐ \`Space\` 的本质：一个 \`<div>\` + 指定宽高。**能用 \`gap\` 就用 \`gap\`，没法用 \`gap\` 才用 \`Space\`**。

### 1.1 h：高度间距（最常用）

\`\`\`jsx
import { Space, Text, Box } from '@mantine/core';

export default function Demo() {
  return (
    <div>
      <Box bg="blue.2" p="sm">上方</Box>
      {/* h="xl"：高度 24px 的空白 */}
      <Space h="xl" />
      <Box bg="blue.2" p="sm">下方（间距 xl）</Box>

      {/* 也可以是数字（px） */}
      <Space h={50} />
      <Box bg="blue.3" p="sm">间距 50px</Box>
    </div>
  );
}
\`\`\`

### 1.2 w：宽度间距

\`w\` 用于水平方向间距——但通常 \`Group gap\` 更方便：

\`\`\`jsx
import { Space, Text, Group } from '@mantine/core';

export default function Demo() {
  return (
    <Group gap={0}>
      <Text>左</Text>
      {/* w="xl"：水平 24px 空白 */}
      <Space w="xl" />
      <Text>右</Text>
    </Group>
  );
}
\`\`\`

### 1.3 什么时候用 Space

- 在 \`<div>\` 这种非 flex/grid 容器里，需要留白时。
- 老代码迁移，懒得改成 \`gap\`。
- 需要动态可计算的间距（\`<Space h={someValue} />\`）。

**优先级**：\`Stack gap\` > \`Group gap\` > \`Flex gap\` > \`Space\`。

---

## 二、Divider：分隔线

\`Divider\` 渲染一条**分隔线**——水平或垂直，可带文字标签。表单分组、菜单分组最常用。

\`\`\`jsx
import { Divider, Stack, Text } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      <Text>基本信息</Text>
      {/* 默认水平分隔线 */}
      <Divider />
      <Text>更多设置</Text>
    </Stack>
  );
}
\`\`\`

### 2.1 orientation：方向

\`\`\`jsx
import { Divider, Group, Text } from '@mantine/core';

export default function Demo() {
  return (
    // orientation="vertical"：垂直分隔线
    // 注意：垂直分隔线需要在 flex 容器里，且有高度
    <Group gap="md" h={40}>
      <Text>左</Text>
      <Divider orientation="vertical" />
      <Text>中</Text>
      <Divider orientation="vertical" />
      <Text>右</Text>
    </Group>
  );
}
\`\`\`

### 2.2 label：带文字的分隔线

\`\`\`jsx
import { Divider, Stack, Text } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      <Text>页面顶部内容</Text>

      {/* label="更多"：分隔线中间显示文字 */}
      <Divider label="更多" />

      <Text>下方内容</Text>

      {/* 也可以放图标、链接等任意 ReactNode */}
      <Divider label={<a href="#">查看更多 →</a>} />
    </Stack>
  );
}
\`\`\`

### 2.3 labelPosition：标签位置

\`\`\`jsx
import { Divider, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* labelPosition="left"：标签在左 */}
      <Divider label="左对齐" labelPosition="left" />
      {/* labelPosition="center"：标签居中（默认） */}
      <Divider label="居中" labelPosition="center" />
      {/* labelPosition="right"：标签在右 */}
      <Divider label="右对齐" labelPosition="right" />
    </Stack>
  );
}
\`\`\`

### 2.4 variant：线型样式

\`\`\`jsx
import { Divider, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* solid：实线（默认） */}
      <Divider variant="solid" />
      {/* dashed：虚线 */}
      <Divider variant="dashed" />
      {/* dotted：点线 */}
      <Divider variant="dotted" />
    </Stack>
  );
}
\`\`\`

### 2.5 size：粗细

\`\`\`jsx
import { Divider, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      <Divider size="xs" />
      <Divider size="sm" />
      <Divider size="md" />
      <Divider size="lg" />
      <Divider size="xl" />
      {/* 也可以是数字（像素） */}
      <Divider size={3} />
    </Stack>
  );
}
\`\`\`

### 2.6 color：颜色

\`\`\`jsx
import { Divider, Stack } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      {/* 颜色用主题色名 */}
      <Divider color="red" />
      <Divider color="blue" />
      {/* 也可以是色阶 */}
      <Divider color="gray.4" />
    </Stack>
  );
}
\`\`\`

### 2.7 my：快捷上下边距

\`Divider\` 经常需要上下留白，直接用 \`my\` prop 控制：

\`\`\`jsx
import { Divider, Stack, Text } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap={0}>
      <Text>上面</Text>
      {/* my="lg"：上下 margin 各 20px */}
      <Divider my="lg" label="分隔" />
      <Text>下面</Text>
    </Stack>
  );
}
\`\`\`

> ⭐ \`my\` 是 \`marginTop\` + \`marginBottom\` 的简写——分隔线加留白最常用的写法。

---

## 三、AspectRatio：固定宽高比

\`AspectRatio\` 强制子元素保持**固定宽高比**——视频、图片、占位符的「不变形」神器。

\`\`\`jsx
import { AspectRatio, Image } from '@mantine/core';

export default function Demo() {
  return (
    // ratio={16/9}：宽高比 16:9
    // 子元素会撑满容器且保持比例
    <AspectRatio ratio={16 / 9} w={400} bg="gray.1">
      <Image src="https://picsum.photos/640/360" alt="示例" />
    </AspectRatio>
  );
}
\`\`\`

> ⭐ \`AspectRatio\` 解决的是「**容器宽度变化时，高度按比例自动调整**」——响应式视频/图片必用。

### 3.1 ratio：常见比例

\`\`\`jsx
import { AspectRatio, Stack, Text, Box } from '@mantine/core';

export default function Demo() {
  return (
    <Stack>
      <Text>1:1（正方形）</Text>
      <AspectRatio ratio={1} w={200} bg="blue.2">
        <Box>1:1</Box>
      </AspectRatio>

      <Text>16:9（视频）</Text>
      <AspectRatio ratio={16 / 9} w={300} bg="blue.3">
        <Box>16:9</Box>
      </AspectRatio>

      <Text>4:3（老电视）</Text>
      <AspectRatio ratio={4 / 3} w={300} bg="blue.4">
        <Box>4:3</Box>
      </AspectRatio>

      <Text>21:9（电影）</Text>
      <AspectRatio ratio={21 / 9} w={400} bg="blue.5">
        <Box>21:9</Box>
      </AspectRatio>
    </Stack>
  );
}
\`\`\`

### 3.2 嵌入视频

\`\`\`jsx
import { AspectRatio } from '@mantine/core';

export default function Demo() {
  return (
    // 视频容器：16:9 比例
    <AspectRatio ratio={16 / 9} w="100%" bg="black">
      <iframe
        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
        title="YouTube video"
        allowFullScreen
        style={{ border: 0 }}
      />
    </AspectRatio>
  );
}
\`\`\`

> 视频嵌入是 \`AspectRatio\` 最经典的场景——容器宽度自适应，高度自动按 16:9 调整。

### 3.3 嵌入任意内容

\`AspectRatio\` 不限于图片视频，任意内容都行：

\`\`\`jsx
import { AspectRatio, Center, Text } from '@mantine/core';

export default function Demo() {
  return (
    <AspectRatio ratio={1} w={200} bg="gray.1">
      <Center>
        <Text size="xl" fw={700}>正方形占位</Text>
      </Center>
    </AspectRatio>
  );
}
\`\`\`

---

## 四、实战：表单分组

用 \`Divider\` 给表单分组，让信息层次清晰：

\`\`\`jsx
import { Stack, Divider, TextInput, Textarea, Button, Title, Select } from '@mantine/core';

export default function Demo() {
  return (
    <Stack gap="md">
      <Title order={4}>新建文章</Title>

      {/* 第一组：基本信息 */}
      <Divider label="基本信息" labelPosition="left" />
      <TextInput label="标题" placeholder="请输入标题" />
      <Select
        label="分类"
        placeholder="选择分类"
        data={[
          { value: 'tech', label: '技术' },
          { value: 'life', label: '生活' },
        ]}
      />

      {/* 第二组：内容 */}
      <Divider my="sm" label="内容" labelPosition="left" />
      <Textarea label="正文" placeholder="请输入正文" minRows={5} />

      {/* 第三组：操作 */}
      <Divider my="sm" />
      <Button>发布</Button>
    </Stack>
  );
}
\`\`\`

---

## 五、实战：响应式视频卡片

\`\`\`jsx
import { Card, AspectRatio, Image, Text, Group, Badge, Button } from '@mantine/core';

export default function Demo() {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder w={400}>
      <Card.Section>
        {/* 视频缩略图保持 16:9 */}
        <AspectRatio ratio={16 / 9}>
          <Image
            src="https://picsum.photos/640/360"
            alt="视频封面"
          />
        </AspectRatio>
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>React 入门教程</Text>
        <Badge color="red" variant="light">HOT</Badge>
      </Group>

      <Text size="sm" c="dimmed">
        从零开始学 React，适合前端新手。
      </Text>

      <Button variant="light" color="blue" fullWidth mt="md" radius="md">
        立即观看
      </Button>
    </Card>
  );
}
\`\`\`

---

## 六、实战：分隔线美化列表

\`Divider\` 让列表项之间有清晰边界：

\`\`\`jsx
import { Stack, Divider, Text, Group, Avatar } from '@mantine/core';

const users = [
  { name: '张三', desc: '前端工程师' },
  { name: '李四', desc: '后端工程师' },
  { name: '王五', desc: '设计师' },
];

export default function Demo() {
  return (
    <Stack gap={0}>
      {users.map((u, i) => (
        <div key={u.name}>
          <Group gap="sm" p="sm">
            <Avatar color="blue" radius="xl">{u.name[0]}</Avatar>
            <Stack gap={0}>
              <Text size="sm" fw={500}>{u.name}</Text>
              <Text size="xs" c="dimmed">{u.desc}</Text>
            </Stack>
          </Group>
          {/* 最后一项不显示分隔线 */}
          {i < users.length - 1 && <Divider />}
        </div>
      ))}
    </Stack>
  );
}
\`\`\`

---

## 小结

| 组件 | 用途 | 关键 props |
| --- | --- | --- |
| \`Space\` | 空白间距 | \`h\`/\`w\` |
| \`Divider\` | 分隔线 | \`orientation\`/\`label\`/\`labelPosition\`/\`variant\`/\`size\`/\`color\`/\`my\` |
| \`AspectRatio\` | 固定宽高比 | \`ratio\` |

**使用建议**：
- \`Space\`：能用 \`gap\` 就别用 \`Space\`。
- \`Divider\`：表单分组、列表分隔、卡片分节首选。
- \`AspectRatio\`：视频、图片、占位符保持比例必用。

至此第三部分「布局组件」结束。下一部分我们学按钮与标识组件——Button 进阶、ActionIcon、Badge、Indicator。`,
  },
];

export { chapters };
