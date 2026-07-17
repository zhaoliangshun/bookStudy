"use client";

// =============================================================
// 文件：app/mantine/components/LayoutDemo.jsx
// -------------------------------------------------------------
// 【职责】演示 Mantine 布局排版组件：
//   - Grid        : 12 列响应式网格（跨列/偏移/响应式断点）
//   - SimpleGrid  : 等宽卡片网格（比 Grid 更简洁）
//   - Stack       : 垂直布局（flex-direction: column）
//   - Group       : 水平布局（flex-direction: row）
//   - Container   : 内容容器（限制最大宽度 + 居中）
//   - AspectRatio : 宽高比容器
//   - Space       : 间距占位
// =============================================================

import {
  Paper,
  Title,
  Text,
  Stack,
  Grid,
  SimpleGrid,
  Group,
  Container,
  AspectRatio,
  Box,
  Divider,
  Code,
} from "@mantine/core";

export default function LayoutDemo() {
  return (
    <Stack gap="xl">
      {/* ============ 区块标题 ============ */}
      <div>
        <Title order={2}>📐 布局排版</Title>
        <Text size="sm" c="dimmed" mt={4}>
          Grid 12 列网格 + SimpleGrid 等宽卡片 + Stack/Group + AspectRatio
        </Text>
      </div>

      {/* ============ Grid 12 列网格 ============ */}
      <Paper withBorder p="lg">
        <Title order={4} mb="sm">Grid —— 12 列响应式网格</Title>
        <Text size="xs" c="dimmed" mb="md">
          span={"{12}"} 占满整行；span={"{6}"} 占一半；span={"{4}"} 占三分之一
        </Text>
        <Grid>
          {/* span={12}：占满 12 列（整行） */}
          <Grid.Col span={12}>
            <Box
              p="md"
              style={{
                background: "var(--mantine-color-indigo-0)",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <Code>span=12</Code>（整行）
            </Box>
          </Grid.Col>

          {/* span={6}：占 6 列（一半） */}
          <Grid.Col span={6}>
            <Box
              p="md"
              style={{
                background: "var(--mantine-color-indigo-1)",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <Code>span=6</Code>（半行）
            </Box>
          </Grid.Col>
          <Grid.Col span={6}>
            <Box
              p="md"
              style={{
                background: "var(--mantine-color-indigo-1)",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <Code>span=6</Code>（半行）
            </Box>
          </Grid.Col>

          {/* span={4}：占 4 列（三分之一） */}
          <Grid.Col span={4}>
            <Box
              p="md"
              style={{
                background: "var(--mantine-color-indigo-2)",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <Code>span=4</Code>
            </Box>
          </Grid.Col>
          <Grid.Col span={4}>
            <Box
              p="md"
              style={{
                background: "var(--mantine-color-indigo-2)",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <Code>span=4</Code>
            </Box>
          </Grid.Col>
          <Grid.Col span={4}>
            <Box
              p="md"
              style={{
                background: "var(--mantine-color-indigo-2)",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <Code>span=4</Code>
            </Box>
          </Grid.Col>

          {/* 响应式断点：手机整行、平板半行、桌面三分之一 */}
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <Box
              p="md"
              style={{
                background: "var(--mantine-color-teal-1)",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <Code>响应式 span</Code>
              <Text size="xs" c="dimmed" mt={4}>
                手机 12 / 平板 6 / 桌面 4
              </Text>
            </Box>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <Box
              p="md"
              style={{
                background: "var(--mantine-color-teal-1)",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <Code>响应式 span</Code>
              <Text size="xs" c="dimmed" mt={4}>
                手机 12 / 平板 6 / 桌面 4
              </Text>
            </Box>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <Box
              p="md"
              style={{
                background: "var(--mantine-color-teal-1)",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <Code>响应式 span</Code>
              <Text size="xs" c="dimmed" mt={4}>
                手机 12 / 平板 6 / 桌面 4
              </Text>
            </Box>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* ============ SimpleGrid 等宽卡片 ============ */}
      <Paper withBorder p="lg">
        <Title order={4} mb="sm">SimpleGrid —— 等宽卡片网格</Title>
        <Text size="xs" c="dimmed" mb="md">
          比 Grid 更简洁：只需指定列数，自动等分。cols 是响应式的。
        </Text>
        <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 5 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <Box
              key={i}
              p="md"
              style={{
                background: "var(--mantine-color-gray-1)",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <Text size="sm" fw={600}>
                卡片 {i + 1}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Paper>

      {/* ============ Stack vs Group ============ */}
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {/* Stack：垂直布局 */}
        <Paper withBorder p="lg">
          <Title order={5} mb="md">
            Stack —— 垂直布局
          </Title>
          <Stack gap="sm" align="stretch">
            <Box p="sm" bg="indigo.0" style={{ borderRadius: 6 }}>
              第一行
            </Box>
            <Box p="sm" bg="indigo.1" style={{ borderRadius: 6 }}>
              第二行
            </Box>
            <Box p="sm" bg="indigo.2" style={{ borderRadius: 6 }}>
              第三行
            </Box>
          </Stack>
        </Paper>

        {/* Group：水平布局 */}
        <Paper withBorder p="lg">
          <Title order={5} mb="md">
            Group —— 水平布局
          </Title>
          <Group gap="sm" grow>
            <Box p="sm" bg="teal.0" style={{ borderRadius: 6, textAlign: "center" }}>
              A
            </Box>
            <Box p="sm" bg="teal.1" style={{ borderRadius: 6, textAlign: "center" }}>
              B
            </Box>
            <Box p="sm" bg="teal.2" style={{ borderRadius: 6, textAlign: "center" }}>
              C
            </Box>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* ============ AspectRatio 宽高比 ============ */}
      <Paper withBorder p="lg">
        <Title order={4} mb="sm">AspectRatio —— 固定宽高比容器</Title>
        <Text size="xs" c="dimmed" mb="md">
          常用于图片/视频/iframe，保持固定比例不变形。ratio={"{16/9}"} 是 16:9。
        </Text>
        {/* ratio={16/9}：宽高比 16:9。无论容器多宽，高度自动按比例计算。 */}
        <AspectRatio ratio={16 / 9} style={{ maxWidth: 480 }}>
          <Box
            style={{
              background:
                "linear-gradient(135deg, var(--mantine-color-indigo-5), var(--mantine-color-violet-5))",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text c="white" fw={700} size="xl">
              16:9 区域
            </Text>
          </Box>
        </AspectRatio>
      </Paper>
    </Stack>
  );
}
