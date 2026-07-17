"use client";

// =============================================================
// 文件：app/auth-demo/components/SessionPanel.jsx
// -------------------------------------------------------------
// 【职责】
//   会话管理面板。展示当前登录会话的详细信息（sessionId、token、
//   用户名、显示名、邮箱、登录/过期时间），提供 2FA 开关、登出按钮，
//   并用表格展示 Mock 用户库（调试用，不含密码）。
//
// 【技术栈】
//   - Mantine v9：Paper / Stack / Text / Code / Group / Button /
//     Badge / Divider / Table / Timeline / Switch
//   - Mock SDK：isLoggedIn / getSession / logout / getCurrentUser /
//     toggleTwoFactor / getMockUsers
//
// 【props】
//   onLogout {Function} 登出成功后触发的父组件回调
// =============================================================

import { useState } from "react";
// 导入 Mantine v9 组件
import {
  Paper,
  Stack,
  Text,
  Code,
  Group,
  Button,
  Badge,
  Divider,
  Table,
  Timeline,
  Switch,
} from "@mantine/core";
// 导入 Mock SDK 提供的会话与用户管理函数
import {
  isLoggedIn,
  getSession,
  logout,
  getCurrentUser,
  toggleTwoFactor,
  getMockUsers,
} from "../lib/sdk.js";

/**
 * 会话管理面板组件
 * @param {{ onLogout?: () => void }} props
 */
export default function SessionPanel({ onLogout }) {
  // ---- 本地状态 ----
  // 这些数据都来自 Mock SDK 的同步函数，因此用 useState 的懒初始化
  // （惰性 initializer）在组件首次渲染时读取一次，避免渲染闪烁。
  const [loggedIn, setLoggedIn] = useState(() => isLoggedIn());
  // 当前会话信息：{ sessionId, token, username, displayName, email, loginTime, expiresAt }
  const [session, setSession] = useState(() => getSession());
  // 当前用户信息：用于读取 twoFactorEnabled 的初始值
  const [user, setUser] = useState(() => getCurrentUser());
  // Mock 用户库列表（调试用）：每次刷新都重新读取最新数据
  const [users, setUsers] = useState(() => getMockUsers());

  /**
   * 从 SDK 重新读取所有状态
   * 在 2FA 切换、登出等操作后调用，保证 UI 与 Mock 数据一致
   */
  function refresh() {
    setLoggedIn(isLoggedIn());
    setSession(getSession());
    setUser(getCurrentUser());
    setUsers(getMockUsers());
  }

  /**
   * 处理登出
   * 先调用 SDK 的 logout() 清除会话，再刷新本地状态，最后触发父组件回调
   */
  function handleLogout() {
    logout();
    // 登出后 session/user 都会变成 null，刷新状态使面板切换到“未登录”提示
    refresh();
    // 通知父组件执行后续逻辑（如跳转回登录页）
    onLogout?.();
  }

  /**
   * 切换双因素认证（2FA）开关
   * @param {boolean} checked 开关的新状态
   */
  function handleToggle2FA(checked) {
    // 调用 SDK 切换 2FA；Mock 模式下立即生效
    const res = toggleTwoFactor(checked);
    // 无论成功失败都刷新一次：
    //   成功 → 同步最新状态；失败 → 回滚开关到实际值
    if (res.error) {
      refresh();
      return;
    }
    refresh();
  }

  // ---- 未登录：显示提示，不再渲染后续内容 ----
  if (!loggedIn) {
    return (
      <Paper p="xl" withBorder>
        <Text c="dimmed" ta="center">
          请先登录
        </Text>
      </Paper>
    );
  }

  // 时间格式化助手：把 ISO 字符串转为本地可读格式
  const formatTime = (iso) => (iso ? new Date(iso).toLocaleString("zh-CN") : "-");

  return (
    <Stack gap="md">
      {/* ====================================================== */}
      {/* 一、当前会话信息卡片                                      */}
      {/* ====================================================== */}
      <Paper p="lg" withBorder shadow="xs">
        <Stack gap="sm">
          <Group justify="space-between">
            <Text fw={600} size="lg">
              当前会话
            </Text>
            {/* 在线状态徽章 */}
            <Badge color="green" variant="light">
              在线
            </Badge>
          </Group>

          <Divider />

          {/* 会话核心字段：长串（sessionId / token）用 Code 展示，便于复制 */}
          <Group gap="xs">
            <Text fw={500} style={{ width: 110 }}>
              会话 ID：
            </Text>
            <Code>{session?.sessionId ?? "-"}</Code>
          </Group>
          <Group gap="xs">
            <Text fw={500} style={{ width: 110 }}>
              Token：
            </Text>
            <Code>{session?.token ?? "-"}</Code>
          </Group>
          <Group gap="xs">
            <Text fw={500} style={{ width: 110 }}>
              用户名：
            </Text>
            <Text>{session?.username ?? "-"}</Text>
          </Group>
          <Group gap="xs">
            <Text fw={500} style={{ width: 110 }}>
              显示名：
            </Text>
            <Text>{session?.displayName ?? "-"}</Text>
          </Group>
          <Group gap="xs">
            <Text fw={500} style={{ width: 110 }}>
              邮箱：
            </Text>
            <Text>{session?.email ?? "-"}</Text>
          </Group>

          <Divider />

          {/* 会话时间线：登录时间 → 过期时间
              active={1} 表示第二个节点（过期时间）为当前激活节点 */}
          <Timeline active={1} bulletSize={18} lineWidth={2}>
            <Timeline.Item title="登录时间">
              <Text c="dimmed" size="sm">
                {formatTime(session?.loginTime)}
              </Text>
            </Timeline.Item>
            <Timeline.Item title="过期时间">
              <Text c="dimmed" size="sm">
                {formatTime(session?.expiresAt)}
              </Text>
            </Timeline.Item>
          </Timeline>

          <Divider />

          {/* 2FA 开关：checked 绑定到当前用户的 twoFactorEnabled */}
          <Group justify="space-between">
            <div>
              <Text fw={500}>双因素认证 (2FA)</Text>
              <Text c="dimmed" size="xs">
                开启后登录需输入短信验证码
              </Text>
            </div>
            <Switch
              checked={!!user?.twoFactorEnabled}
              onChange={(event) => handleToggle2FA(event.currentTarget.checked)}
            />
          </Group>

          <Divider />

          {/* 登出按钮 */}
          <Group justify="flex-end">
            <Button color="red" variant="light" onClick={handleLogout}>
              登出
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* ====================================================== */}
      {/* 二、Mock 用户库（调试用）                                 */}
      {/* ====================================================== */}
      <Paper p="lg" withBorder shadow="xs">
        <Stack gap="sm">
          <Group justify="space-between">
            <Text fw={600} size="lg">
              用户库（调试）
            </Text>
            <Badge variant="light">{users.length} 个用户</Badge>
          </Group>
          <Text c="dimmed" size="xs">
            Mock 数据库中的所有用户（不含密码）
          </Text>

          {/* Mantine v9 Table 用法：Table.Thead / Table.Tbody / Table.Tr / Table.Th / Table.Td */}
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>用户名</Table.Th>
                <Table.Th>显示名</Table.Th>
                <Table.Th>邮箱</Table.Th>
                <Table.Th>2FA</Table.Th>
                <Table.Th>状态</Table.Th>
                <Table.Th>安全问题数</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((u) => (
                <Table.Tr key={u.username}>
                  <Table.Td>{u.username}</Table.Td>
                  <Table.Td>{u.displayName || "-"}</Table.Td>
                  <Table.Td>{u.email}</Table.Td>
                  <Table.Td>
                    {/* 2FA 状态用彩色徽章区分 */}
                    {u.twoFactorEnabled ? (
                      <Badge color="green" size="sm">
                        开启
                      </Badge>
                    ) : (
                      <Badge color="gray" size="sm">
                        关闭
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {/* 账户锁定状态 */}
                    {u.locked ? (
                      <Badge color="red" size="sm">
                        锁定
                      </Badge>
                    ) : (
                      <Badge color="blue" size="sm">
                        正常
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>{u.securityQuestions?.length ?? 0}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  );
}
