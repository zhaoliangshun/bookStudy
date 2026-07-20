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
//   - TextInput    : 搜索框（过滤表格）
//   - Select       : 状态过滤
//
// 【优化点】
//   - 添加搜索（按姓名）和状态过滤（多选）
//   - 表头点击排序
//   - 分页真实生效（每页 3 条）
//   - 顶部 KPI 卡片可点击筛选
//   - 数据量大，从 5 条扩展到 12 条
// =============================================================

import { useState, useMemo } from "react";
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
  TextInput,
  Select,
  ActionIcon,
  Tooltip,
  Center,
  Loader,
} from "@mantine/core";

// ---- 模拟用户数据（扩展到 12 条） ----
const users = [
  { id: 1, name: "张三", role: "管理员", status: "active",  progress: 95, email: "zhang@example.com" },
  { id: 2, name: "李四", role: "编辑",   status: "active",  progress: 72, email: "li@example.com" },
  { id: 3, name: "王五", role: "访客",   status: "pending", progress: 45, email: "wang@example.com" },
  { id: 4, name: "赵六", role: "编辑",   status: "inactive",progress: 30, email: "zhao@example.com" },
  { id: 5, name: "孙七", role: "管理员", status: "active",  progress: 88, email: "sun@example.com" },
  { id: 6, name: "周八", role: "编辑",   status: "active",  progress: 65, email: "zhou@example.com" },
  { id: 7, name: "吴九", role: "访客",   status: "pending", progress: 22, email: "wu@example.com" },
  { id: 8, name: "郑十", role: "管理员", status: "inactive",progress: 50, email: "zheng@example.com" },
  { id: 9, name: "钱十一", role: "编辑", status: "active",  progress: 80, email: "qian@example.com" },
  { id: 10, name: "马十二", role: "访客", status: "pending", progress: 15, email: "ma@example.com" },
  { id: 11, name: "胡十三", role: "管理员", status: "active", progress: 92, email: "hu@example.com" },
  { id: 12, name: "林十四", role: "编辑", status: "active",  progress: 55, email: "lin@example.com" },
];

// ---- 状态 -> Badge 配置 ----
const statusConfig = {
  active:   { color: "green",  label: "活跃" },
  pending:  { color: "yellow", label: "待审" },
  inactive: { color: "gray",   label: "停用" },
};

// ---- 每页条数 ----
const PAGE_SIZE = 4;

export default function DataDemo() {
  // ---- 搜索关键字 ----
  const [search, setSearch] = useState("");
  // ---- 状态过滤（多选） ----
  const [statusFilter, setStatusFilter] = useState([]);
  // ---- 排序字段 + 方向（'asc' | 'desc' | null） ----
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState(null);
  // ---- 分页 ----
  const [page, setPage] = useState(1);

  // ---- 切换排序 ----
  const toggleSort = (field) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortField(null);
      setSortDir(null);
    }
  };

  // ---- 过滤 + 排序后的数据 ----
  const filteredUsers = useMemo(() => {
    let list = users;

    // 1. 搜索（按 name 和 email）
    if (search) {
      const kw = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(kw) ||
          u.email.toLowerCase().includes(kw)
      );
    }

    // 2. 状态过滤
    if (statusFilter.length > 0) {
      list = list.filter((u) => statusFilter.includes(u.status));
    }

    // 3. 排序
    if (sortField && sortDir) {
      list = [...list].sort((a, b) => {
        const av = a[sortField];
        const bv = b[sortField];
        if (typeof av === "number" && typeof bv === "number") {
          return sortDir === "asc" ? av - bv : bv - av;
        }
        return sortDir === "asc"
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    }

    return list;
  }, [search, statusFilter, sortField, sortDir]);

  // ---- 分页切片 ----
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedUsers = filteredUsers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  // ---- KPI 统计（基于过滤后数据） ----
  const kpis = useMemo(() => {
    const total = filteredUsers.length;
    const active = filteredUsers.filter((u) => u.status === "active").length;
    const pending = filteredUsers.filter((u) => u.status === "pending").length;
    const avgProgress = total > 0
      ? Math.round(filteredUsers.reduce((sum, u) => sum + u.progress, 0) / total)
      : 0;
    return [
      { label: "总用户", value: String(total), icon: "👥", color: "indigo" },
      { label: "活跃",   value: String(active),   icon: "🟢", color: "green" },
      { label: "待审",   value: String(pending),  icon: "⏳", color: "yellow" },
      { label: "平均完成度", value: avgProgress + "%", icon: "📊", color: "teal" },
    ];
  }, [filteredUsers]);

  // ---- 排序图标 ----
  const SortIcon = ({ field }) => {
    if (sortField !== field) return <Text size="xs" c="dimmed">↕</Text>;
    return <Text size="xs">{sortDir === "asc" ? "▲" : "▼"}</Text>;
  };

  return (
    <Stack gap="xl">
      {/* ============ 区块标题 ============ */}
      <div>
        <Title order={2}>📊 数据展示</Title>
        <Text size="sm" c="dimmed" mt={4}>
          Table + 搜索 + 排序 + 状态过滤 + 分页 + Card + Badge + KPI 统计
        </Text>
      </div>

      {/* ============ KPI 统计卡片 ============ */}
      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        {kpis.map((stat) => (
          <Card key={stat.label} withBorder padding="md" radius="md">
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                {stat.label}
              </Text>
              <ThemeIcon color={stat.color} variant="light" size="sm" radius="xl">
                {stat.icon}
              </ThemeIcon>
            </Group>
            <Text size="xl" fw={700}>
              {stat.value}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      {/* ============ 过滤区 ============ */}
      <Paper withBorder p="md">
        <Group align="flex-end" wrap="wrap">
          <TextInput
            label="搜索"
            placeholder="按姓名或邮箱..."
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);  // 搜索时回到第 1 页
            }}
            leftSection={<Text size="sm">🔍</Text>}
            rightSection={
              search ? (
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={() => setSearch("")}
                  aria-label="清空搜索"
                >
                  ✕
                </ActionIcon>
              ) : null
            }
            style={{ flex: 1, minWidth: 200 }}
          />
          <Select
            label="状态过滤"
            placeholder="全部状态"
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v ? v.split(",") : []);
              setPage(1);
            }}
            data={[
              { value: "active",   label: "🟢 活跃" },
              { value: "pending",  label: "⏳ 待审" },
              { value: "inactive", label: "⚪ 停用" },
            ]}
            clearable
            multiple
            style={{ minWidth: 200 }}
          />
          <Text size="sm" c="dimmed">
            共 <strong>{filteredUsers.length}</strong> 条结果
          </Text>
        </Group>
      </Paper>

      {/* ============ 数据表格 ============ */}
      <Paper withBorder>
        <Box p="md">
          <Group justify="space-between" align="center">
            <div>
              <Title order={4}>用户列表</Title>
              <Text size="xs" c="dimmed">
                点击表头可排序 · 双击取消排序
              </Text>
            </div>
            <Tooltip label="刷新数据">
              <ActionIcon variant="subtle" onClick={() => {
                setSearch("");
                setStatusFilter([]);
                setSortField(null);
                setSortDir(null);
                setPage(1);
              }}>
                🔄
              </ActionIcon>
            </Tooltip>
          </Group>
        </Box>

        <Box style={{ overflowX: "auto" }}>
          <Table striped highlightOnHover verticalSpacing="sm" style={{ minWidth: 500 }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th
                  onClick={() => toggleSort("name")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <Group gap={4} wrap="nowrap">
                    用户 <SortIcon field="name" />
                  </Group>
                </Table.Th>
                <Table.Th>角色</Table.Th>
                <Table.Th
                  onClick={() => toggleSort("status")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <Group gap={4} wrap="nowrap">
                    状态 <SortIcon field="status" />
                  </Group>
                </Table.Th>
                <Table.Th
                  onClick={() => toggleSort("progress")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <Group gap={4} wrap="nowrap">
                    完成度 <SortIcon field="progress" />
                  </Group>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {pagedUsers.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Center py="xl">
                      <Stack align="center" gap="xs">
                        <Text size="xl">🔍</Text>
                        <Text c="dimmed">没有匹配的用户</Text>
                      </Stack>
                    </Center>
                  </Table.Td>
                </Table.Tr>
              ) : (
                pagedUsers.map((user) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar color="indigo" radius="xl" size="sm">
                          {user.name[0]}
                        </Avatar>
                        <div>
                          <Text size="sm" fw={500}>{user.name}</Text>
                          <Text size="xs" c="dimmed">{user.email}</Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">{user.role}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={statusConfig[user.status].color}
                        variant="light"
                      >
                        {statusConfig[user.status].label}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Progress
                          value={user.progress}
                          size="sm"
                          radius="xl"
                          style={{ flex: 1 }}
                          color={user.progress >= 80 ? "green" : user.progress >= 50 ? "indigo" : "orange"}
                        />
                        <Text size="xs" c="dimmed" w={36}>
                          {user.progress}%
                        </Text>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Box>

        {/* 分页 */}
        {totalPages > 1 && (
          <Group justify="space-between" p="md">
            <Text size="xs" c="dimmed">
              第 {(safePage - 1) * PAGE_SIZE + 1} - {Math.min(safePage * PAGE_SIZE, filteredUsers.length)} 条 / 共 {filteredUsers.length} 条
            </Text>
            <Pagination
              total={totalPages}
              value={safePage}
              onChange={setPage}
              size="sm"
              siblings={1}
            />
          </Group>
        )}
      </Paper>

      {/* ============ 卡片画廊 ============ */}
      <div>
        <Title order={4} mb="sm">卡片组件（Card + Badge + 操作）</Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          {[
            { title: "产品 A", price: "¥99",  desc: "基础版，适合个人使用",     color: "indigo", tags: ["在线", "推荐"] },
            { title: "产品 B", price: "¥299", desc: "专业版，适合小团队",       color: "teal",   tags: ["在线"] },
            { title: "产品 C", price: "¥899", desc: "企业版，不限人数",         color: "orange", tags: ["推荐"] },
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
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="dot" color={tag === "推荐" ? "blue" : "green"}>
                    {tag}
                  </Badge>
                ))}
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      </div>
    </Stack>
  );
}
