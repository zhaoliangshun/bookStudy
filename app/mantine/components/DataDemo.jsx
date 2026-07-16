"use client";

// =============================================================
// 文件：app/mantine/components/DataDemo.jsx
// -------------------------------------------------------------
// 【职责】演示 Mantine 数据展示最常用组件：
//   - Table        : 数据表格（斑马纹 + 高亮行 + 表头样式）
//   - Card         : 卡片容器（图片 + 标题 + 内容 + 操作）
//   - Badge        : 标签/徽章（状态标记）
//   - Avatar       : 头像（文字/图片 + 不同尺寸/形状）
//   - Progress     : 进度条
//   - Stat / KPI   : 统计数字卡片
//   - Pagination   : 分页
// =============================================================

import { useState } from "react";
import {
  Paper,
  Title,
  Text,
  Stack,
  Table,
  Card,
  Badge,
  Avatar,
  Progress,
  Group,
  Pagination,
  SimpleGrid,
  ThemeIcon,
  Box,
} from "@mantine/core";

// ---- 模拟用户数据 ----
// 用于 Table 展示，包含姓名/角色/状态/进度等字段
const users = [
  { id: 1, name: "张三", role: "管理员", status: "active",  progress: 95, avatar: "张" },
  { id: 2, name: "李四", role: "编辑",   status: "active",  progress: 72, avatar: "李" },
  { id: 3, name: "王五", role: "访客",   status: "pending", progress: 45, avatar: "王" },
  { id: 4, name: "赵六", role: "编辑",   status: "inactive",progress: 30, avatar: "赵" },
  { id: 5, name: "孙七", role: "管理员", status: "active",  progress: 88, avatar: "孙" },
];

// ---- 状态 -> Badge 配置映射 ----
// 不同状态用不同颜色区分，一眼看出状态
const statusConfig = {
  active:   { color: "green",  label: "活跃" },
  pending:  { color: "yellow", label: "待审" },
  inactive: { color: "gray",   label: "停用" },
};

// ---- KPI 统计数据 ----
const stats = [
  { label: "总用户", value: "1,284", icon: "👥", color: "indigo" },
  { label: "活跃",   value: "956",   icon: "🟢", color: "green" },
  { label: "今日新增", value: "37",  icon: "📈", color: "teal" },
  { label: "转化率", value: "12.3%", icon: "🎯", color: "orange" },
];

export default function DataDemo() {
  // ---- 分页状态 ----
  const [page, setPage] = useState(1);

  return (
    <Stack gap="xl">
      {/* ============ 区块标题 ============ */}
      <div>
        <Title order={2}>📊 数据展示</Title>
        <Text size="sm" c="dimmed" mt={4}>
          Table + Card + Badge + Avatar + Progress + KPI 统计 + 分页
        </Text>
      </div>

      {/* ============ KPI 统计卡片 ============ */}
      {/* SimpleGrid：响应式网格，cols={{ base: 2, sm: 4 }}
          手机 2 列、平板以上 4 列 */}
      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        {stats.map((stat) => (
          <Card key={stat.label} withBorder padding="md" radius="md">
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                {stat.label}
              </Text>
              <ThemeIcon
                color={stat.color}
                variant="light"
                size="sm"
                radius="xl"
              >
                {stat.icon}
              </ThemeIcon>
            </Group>
            <Text size="xl" fw={700}>
              {stat.value}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      {/* ============ 数据表格 ============ */}
      <Paper withBorder>
        <Box p="md">
          <Title order={4}>用户列表</Title>
          <Text size="xs" c="dimmed">
            Table + 斑马纹 + Badge 状态 + Avatar 头像 + Progress 进度
          </Text>
        </Box>

        {/* 表格横向滚动容器
            Mantine v9 移除了 Table.Scrollable，用 Box + overflowX:auto 替代 */}
        <Box style={{ overflowX: "auto" }}>
          {/* striped：斑马纹；highlightOnHover：鼠标悬停高亮；
              verticalSpacing：行间距 */}
          <Table striped highlightOnHover verticalSpacing="sm" style={{ minWidth: 500 }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>用户</Table.Th>
                <Table.Th>角色</Table.Th>
                <Table.Th>状态</Table.Th>
                <Table.Th>完成度</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((user) => (
                <Table.Tr key={user.id}>
                  {/* 用户列：头像 + 姓名 */}
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar color="indigo" radius="xl" size="sm">
                        {user.avatar}
                      </Avatar>
                      <Text size="sm" fw={500}>
                        {user.name}
                      </Text>
                    </Group>
                  </Table.Td>

                  {/* 角色列 */}
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {user.role}
                    </Text>
                  </Table.Td>

                  {/* 状态列：Badge 标签 */}
                  <Table.Td>
                    <Badge
                      color={statusConfig[user.status].color}
                      variant="light"
                    >
                      {statusConfig[user.status].label}
                    </Badge>
                  </Table.Td>

                  {/* 进度列：Progress 进度条 */}
                  <Table.Td>
                    <Group gap="xs">
                      <Progress
                        value={user.progress}
                        size="sm"
                        radius="xl"
                        style={{ flex: 1 }}
                        color={user.progress >= 80 ? "green" : "indigo"}
                      />
                      <Text size="xs" c="dimmed" w={36}>
                        {user.progress}%
                      </Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>

        {/* 分页 */}
        <Group justify="flex-end" p="md">
          <Pagination
            total={5}
            page={page}
            onChange={setPage}
            size="sm"
            siblings={1}
          />
        </Group>
      </Paper>

      {/* ============ 卡片画廊 ============ */}
      <div>
        <Title order={4} mb="sm">卡片组件（Card + 图片 + 操作按钮）</Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          {[
            { title: "产品 A", price: "¥99", desc: "基础版，适合个人使用", color: "indigo" },
            { title: "产品 B", price: "¥299", desc: "专业版，适合小团队", color: "teal" },
            { title: "产品 C", price: "¥899", desc: "企业版，不限人数", color: "orange" },
          ].map((product) => (
            <Card key={product.title} withBorder radius="md" padding="lg">
              <Group justify="space-between" mb="xs">
                <Text fw={700}>{product.title}</Text>
                <Badge color={product.color} variant="light" size="lg">
                  {product.price}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed" mb="md">
                {product.desc}
              </Text>
              <Group gap="xs">
                <Badge variant="dot" color="green">在线</Badge>
                <Badge variant="dot" color="blue">推荐</Badge>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      </div>
    </Stack>
  );
}
