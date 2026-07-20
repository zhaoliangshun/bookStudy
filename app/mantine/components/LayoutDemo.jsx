"use client";

// =============================================================
// 文件：app/mantine/components/LayoutDemo.jsx
// -------------------------------------------------------------
// 【职责】演示 Mantine 布局排版类组件：
//   - Grid + Col   : 12 栅格系统
//   - SimpleGrid   : 自动等宽网格
//   - Stack        : 垂直堆叠（带间距）
//   - Group        : 水平分组（带间距）
//   - Box          : 万能 div（支持 style prop）
//   - Center       : 居中容器
//   - AspectRatio  : 固定宽高比
//   - Divider      : 分割线
//   - Container    : 内容居中容器
//
// 【优化点（相对旧版）】
//   - 增加响应式 Grid 演示（不同断点）
//   - 增加 AspectRatio 卡片示例
//   - 颜色对比度优化（暗色主题下也清晰）
//   - 增加"盒子调试"演示：常见 padding/阴影/边框组合
// =============================================================

import {
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Grid,
  SimpleGrid,
  Box,
  Center,
  AspectRatio,
  Divider,
  Container,
  Card,
  Badge,
  ThemeIcon,
} from "@mantine/core";

// ---- 响应式 Grid 演示数据 ----
const gridItems = [
  { col: "基础栅格", desc: "12 列系统", color: "indigo" },
  { col: "跨 2 列", desc: "2 / 12", color: "teal" },
  { col: "跨 3 列", desc: "3 / 12", color: "orange" },
  { col: "响应式", desc: "xs: 12, sm: 6, md: 4", color: "pink" },
  { col: "自动", desc: "填满剩余", color: "cyan" },
  { col: "偏移", desc: "offset=2", color: "grape" },
];

export default function LayoutDemo() {
  return (
    <Stack gap="xl">
      {/* ============ 区块标题 ============ */}
      <div>
        <Title order={2}>📐 布局排版</Title>
        <Text size="sm" c="dimmed" mt={4}>
          Grid + SimpleGrid + Stack + Group + AspectRatio + 响应式
        </Text>
      </div>

      {/* ============ Grid 12 栅格系统 ============ */}
      <Paper withBorder p="md">
        <Title order={4} mb="xs">🔲 12 栅格系统 Grid</Title>
        <Text size="xs" c="dimmed" mb="md">
          基于 12 列的响应式栅格，移动端自动堆叠
        </Text>
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <DemoBox color="indigo">xs:12 sm:6 md:4</DemoBox>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <DemoBox color="teal">xs:12 sm:6 md:4</DemoBox>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <DemoBox color="orange">xs:12 sm:6 md:4</DemoBox>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <DemoBox color="pink">xs:6 sm:3</DemoBox>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <DemoBox color="cyan">xs:6 sm:3</DemoBox>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <DemoBox color="grape">xs:6 sm:3</DemoBox>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <DemoBox color="lime">xs:6 sm:3</DemoBox>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* ============ Grid 偏移 ============ */}
      <Paper withBorder p="md">
        <Title order={4} mb="xs">↔️ 栅格偏移</Title>
        <Text size="xs" c="dimmed" mb="md">
          用 offset 属性让列向右偏移
        </Text>
        <Grid gutter="md">
          <Grid.Col span={4} offset={2}>
            <DemoBox color="indigo">span=4 offset=2</DemoBox>
          </Grid.Col>
          <Grid.Col span={4}>
            <DemoBox color="teal">span=4</DemoBox>
          </Grid.Col>
          <Grid.Col span={6} offset={3}>
            <DemoBox color="orange">span=6 offset=3（居中）</DemoBox>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* ============ SimpleGrid 自动均分 ============ */}
      <Paper withBorder p="md">
        <Title order={4} mb="xs">🔳 自动均分 SimpleGrid</Title>
        <Text size="xs" c="dimmed" mb="md">
          不用算 span，指定每行几列即可
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          {gridItems.map((item, i) => (
            <Card key={i} withBorder padding="md" radius="md">
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="sm">{item.col}</Text>
                <ThemeIcon size="sm" color={item.color} variant="light">
                  {i + 1}
                </ThemeIcon>
              </Group>
              <Text size="xs" c="dimmed">{item.desc}</Text>
            </Card>
          ))}
        </SimpleGrid>
      </Paper>

      {/* ============ Stack vs Group ============ */}
      <Paper withBorder p="md">
        <Title order={4} mb="xs">📏 Stack vs Group</Title>
        <Text size="xs" c="dimmed" mb="md">
          Stack 垂直堆叠 / Group 水平排列
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Card withBorder padding="md">
            <Badge mb="xs" color="indigo" variant="light">Stack 垂直</Badge>
            <Stack gap="xs">
              <DemoBox color="indigo" inline>第一行</DemoBox>
              <DemoBox color="indigo" inline>第二行</DemoBox>
              <DemoBox color="indigo" inline>第三行</DemoBox>
            </Stack>
          </Card>
          <Card withBorder padding="md">
            <Badge mb="xs" color="teal" variant="light">Group 水平</Badge>
            <Group gap="xs" wrap="wrap">
              <DemoBox color="teal" inline>项目 1</DemoBox>
              <DemoBox color="teal" inline>项目 2</DemoBox>
              <DemoBox color="teal" inline>项目 3</DemoBox>
              <DemoBox color="teal" inline>项目 4</DemoBox>
            </Group>
          </Card>
        </SimpleGrid>
      </Paper>

      {/* ============ AspectRatio 宽高比 ============ */}
      <Paper withBorder p="md">
        <Title order={4} mb="xs">🖼️ 固定宽高比 AspectRatio</Title>
        <Text size="xs" c="dimmed" mb="md">
          防止图片/视频加载时布局抖动
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          {[
            { ratio: 1,   label: "1:1 (正方形)" },
            { ratio: 4/3, label: "4:3 (传统)" },
            { ratio: 16/9, label: "16:9 (宽屏)" },
            { ratio: 21/9, label: "21:9 (超宽)" },
          ].map((item) => (
            <div key={item.ratio}>
              <AspectRatio ratio={item.ratio}>
                <Center
                  style={{
                    background: "var(--mantine-color-indigo-light)",
                    color: "var(--mantine-color-indigo-filled)",
                    borderRadius: 8,
                    flexDirection: "column",
                  }}
                >
                  <Text size="lg" fw={700}>{item.ratio}</Text>
                  <Text size="xs">{item.label}</Text>
                </Center>
              </AspectRatio>
            </div>
          ))}
        </SimpleGrid>
      </Paper>

      {/* ============ Container 居中容器 ============ */}
      <Paper withBorder p="md">
        <Title order={4} mb="xs">📦 Container 居中容器</Title>
        <Text size="xs" c="dimmed" mb="md">
          自动左右内边距 + 最大宽度限制
        </Text>
        <Box bg="var(--mantine-color-indigo-0)" p="md" style={{ borderRadius: 8 }}>
          <Container size="xs" p="md" bg="var(--mantine-color-body)" style={{ borderRadius: 4 }}>
            <Text size="sm">xs - 540px</Text>
          </Container>
        </Box>
        <Box bg="var(--mantine-color-indigo-0)" p="md" mt="sm" style={{ borderRadius: 8 }}>
          <Container size="md" p="md" bg="var(--mantine-color-body)" style={{ borderRadius: 4 }}>
            <Text size="sm">md - 720px</Text>
          </Container>
        </Box>
        <Box bg="var(--mantine-color-indigo-0)" p="md" mt="sm" style={{ borderRadius: 8 }}>
          <Container size="xl" p="md" bg="var(--mantine-color-body)" style={{ borderRadius: 4 }}>
            <Text size="sm">xl - 1320px</Text>
          </Container>
        </Box>
      </Paper>

      {/* ============ Divider 分割线 ============ */}
      <Paper withBorder p="md">
        <Title order={4} mb="xs">➖ 分割线 Divider</Title>
        <Text size="xs" c="dimmed" mb="md">
          4 种变体：水平、垂直、带标签、点状
        </Text>
        <Stack>
          <Text size="sm">第一段内容</Text>
          <Divider />
          <Text size="sm">第二段内容</Text>
          <Divider label="或者" labelPosition="center" />
          <Text size="sm">第三段内容</Text>
          <Divider label="继续" labelPosition="left" />
          <Text size="sm">第四段内容</Text>
        </Stack>
      </Paper>
    </Stack>
  );
}

// ---- 内部辅助组件：演示用色块 ----
// 用透明背景 + 边框 + 主题色文字，在亮/暗主题下都清晰
// 这里用普通字符串拼接避免 JSX 对象内模板字符串的转义陷阱
function DemoBox({ color = "indigo", children, inline = false }) {
  return (
    <Box
      p="md"
      style={{
        background: "var(--mantine-color-" + color + "-light)",
        color: "var(--mantine-color-" + color + "-light-color)",
        borderRadius: 8,
        border: "1px solid var(--mantine-color-" + color + "-filled)",
        textAlign: "center",
        fontSize: "0.875rem",
        fontWeight: 500,
        display: inline ? "block" : "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: inline ? "auto" : 64,
      }}
    >
      {children}
    </Box>
  );
}
