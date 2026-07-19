"use client";

// =============================================================
// 文件：app/mantine/page.js
// -------------------------------------------------------------
// 【一句话职责】
//   /mantine 路由的主页面。用 AppShell 搭建一个「完整后台管理站点」
//   布局，通过左侧导航在 4 个 Demo 区块间切换：
//     1. 表单实战  — useForm + 校验 + 各类输入控件
//     2. 数据展示  — Table + Card + Badge + Avatar + 搜索/排序/分页
//     3. 反馈交互  — Modal + Drawer + LoadingOverlay + Alert + Toast
//     4. 布局排版  — Grid + SimpleGrid + Stack + 响应式
//
// 【站点结构】
//   AppShell
//   ├── Header  : Burger + Logo + 全局搜索(占位) + 主题切换 + 用户菜单
//   ├── Navbar  : 导航链接（切换 Demo 区块）
//   └── Main    : 当前选中的 Demo 组件（带错误边界 + 滚动到顶）
//
// 【优化点（相对旧版）】
//   - 主题切换按钮从 SegmentedControl 改为 ActionIcon（更紧凑）
//   - "退出登录" 点了有反馈（用通知 + 清状态）
//   - 切换区块时自动滚到顶
//   - Header 加全局搜索框（演示完整后台布局）
//   - 错误边界捕获子组件异常，不让整个页面崩溃
//   - 用户菜单的 "处理中" 状态有 disabled 反馈
//   - 自建通知 store（不依赖 @mantine/notifications），任意位置可调用
// =============================================================

import React, { useState, useRef } from "react";
import {
  AppShell,
  Burger,
  Group,
  Text,
  NavLink,
  ActionIcon,
  useMantineColorScheme,
  useComputedColorScheme,
  Avatar,
  Indicator,
  Menu,
  Container,
  Box,
  TextInput,
  Kbd,
  Paper,
  rem,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useHotkeys } from "@mantine/hooks";

// ---- 4 个 Demo 组件 ----
import FormDemo from "./components/FormDemo";
import DataDemo from "./components/DataDemo";
import FeedbackDemo from "./components/FeedbackDemo";
import LayoutDemo from "./components/LayoutDemo";
import {
  showNotification,
  NotificationProvider,
  NotificationContainer,
} from "./components/notifications";

// ---- 错误边界组件 ----
// 捕获子组件渲染时的 JS 错误，避免整个 AppShell 崩溃
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    // 实际项目可上报到错误监控（Sentry 等）
    console.error("[ErrorBoundary]", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <Paper p="lg" withBorder style={{ borderColor: "var(--mantine-color-red-6)" }}>
          <Text fw={700} c="red" mb="xs">⚠️ 组件渲染出错</Text>
          <Text size="sm" c="dimmed" mb="sm">
            {this.state.error?.message || "未知错误"}
          </Text>
          <ActionIcon
            variant="light"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            🔄
          </ActionIcon>
          <Text size="xs" c="dimmed" mt="xs">点击刷新按钮重试</Text>
        </Paper>
      );
    }
    return this.props.children;
  }
}

// ---- 导航配置 ----
const navItems = [
  { value: "form", label: "表单实战", icon: "📝", component: <FormDemo />, desc: "useForm + 校验 + 输入控件" },
  { value: "data", label: "数据展示", icon: "📊", component: <DataDemo />, desc: "Table + Card + Badge + 搜索排序" },
  { value: "feedback", label: "反馈交互", icon: "🔔", component: <FeedbackDemo />, desc: "Modal + Drawer + Toast + Skeleton" },
  { value: "layout", label: "布局排版", icon: "📐", component: <LayoutDemo />, desc: "Grid + SimpleGrid + 响应式" },
];

export default function MantinePage() {
  // ---- Navbar 折叠状态（移动端） ----
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);

  // ---- 当前选中的 Demo 区块 ----
  const [activeSection, setActiveSection] = useState("form");

  // ---- 主题切换 ----
  // useComputedColorScheme 返回计算后的实际值（auto 也会解析为 light/dark），
  // 比直接用 useMantineColorScheme().colorScheme 更可靠。
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", { getInitialValueInEffect: true });
  const isDark = computedColorScheme === "dark";

  // ---- 全局搜索框 ----
  const [search, setSearch] = useState("");

  // ---- 用户菜单状态 ----
  const [loggingOut, setLoggingOut] = useState(false);

  // ---- 主内容区 ref（用于切换时滚到顶） ----
  const mainRef = useRef(null);

  // ---- 切换区块时滚到顶 + 移动端收起侧边栏 ----
  const handleNavClick = (value) => {
    setActiveSection(value);
    closeMobile();  // 移动端点完自动收起
    // 滚到顶（用 rAF 等 DOM 更新完再滚）
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  // ---- 退出登录（带 loading 反馈） ----
  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      setLoggingOut(false);
      showNotification({
        color: "gray",
        title: "已退出登录",
        message: "下次见！",
        icon: "🚪",
      });
    }, 600);
  };

  // ---- 快捷键：Cmd/Ctrl+K 聚焦搜索 ----
  const searchRef = useRef(null);
  useHotkeys([
    ["mod+K", () => searchRef.current?.focus()],
  ]);

  // 当前要渲染的 Demo
  const activeItem = navItems.find((item) => item.value === activeSection);
  const activeDemo = activeItem?.component || <FormDemo />;

  return (
    // NotificationProvider 包裹整个 AppShell，让所有组件都能用 showNotification()
    // NotificationContainer 渲染在 fixed 位置，不受 AppShell 布局影响
    <NotificationProvider>
      <NotificationContainer />
      {/* AppShell：Mantine 的页面骨架组件
          header={{ height: 60 }}：固定 Header 高度 60px
          navbar：桌面端 240px 宽，移动端可折叠
          padding="md"：主内容区内边距 */}
      <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened },
      }}
      padding="md"
    >
      {/* ============ 顶部导航栏 ============ */}
      <AppShell.Header>
        <Group h="60px" px="md" justify="space-between" wrap="nowrap">
          {/* 左侧：Burger（移动端）+ Logo */}
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              size="sm"
              hiddenFrom="sm"
              aria-label="切换导航"
            />
            <Text fw={700} size="lg" c="indigo" style={{ whiteSpace: "nowrap" }}>
              ⚡ Mantine Demo
            </Text>
          </Group>

          {/* 中间：全局搜索（演示用） */}
          <TextInput
            ref={searchRef}
            placeholder="搜索组件、文档…"
            size="xs"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            leftSection={<Text size="sm">🔍</Text>}
            rightSection={
              <Kbd style={{ fontSize: rem(10) }}>⌘K</Kbd>
            }
            rightSectionWidth={42}
            visibleFrom="sm"
            style={{ flex: 1, maxWidth: 360, margin: "0 auto" }}
            aria-label="全局搜索"
          />

          {/* 右侧：主题切换 + 通知 + 用户菜单 */}
          <Group gap="xs" wrap="nowrap">
            {/* 主题切换按钮（暗/亮） */}
            <Tooltip label={isDark ? "切换到亮色" : "切换到暗色"}>
              <ActionIcon
                variant="default"
                size="lg"
                onClick={() => setColorScheme(isDark ? "light" : "dark")}
                aria-label="切换主题"
              >
                <Text size="md">{isDark ? "☀️" : "🌙"}</Text>
              </ActionIcon>
            </Tooltip>

            {/* 用户菜单 */}
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <Indicator color="green" size={8} offset={6} processing>
                  <Avatar
                    size="sm"
                    radius="xl"
                    color="indigo"
                    variant="filled"
                    style={{ cursor: "pointer" }}
                  >
                    Z
                  </Avatar>
                </Indicator>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>账户</Menu.Label>
                <Menu.Item leftSection="👤">个人资料</Menu.Item>
                <Menu.Item leftSection="⚙️">设置</Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection="🚪"
                  color="red"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? "退出中…" : "退出登录"}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      {/* ============ 左侧导航栏 ============ */}
      <AppShell.Navbar p="xs">
        <AppShell.Section grow>
          {navItems.map((item) => (
            <NavLink
              key={item.value}
              active={activeSection === item.value}
              variant="light"
              onClick={() => handleNavClick(item.value)}
              leftSection={<Text size="lg">{item.icon}</Text>}
              label={item.label}
              description={item.desc}
            />
          ))}
        </AppShell.Section>

        {/* 底部：版本信息 */}
        <AppShell.Section>
          <Box p="xs">
            <Text size="xs" c="dimmed" ta="center">
              Mantine v9 · React 19
            </Text>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* ============ 主内容区 ============ */}
      <AppShell.Main ref={mainRef}>
        {/* 区块顶部标题（带描述 + 当前区块的 emoji 大图标） */}
        <Paper p="md" mb="md" withBorder radius="md">
          <Group justify="space-between" align="center">
            <Group gap="md">
              <Text size="xl">{activeItem?.icon}</Text>
              <div>
                <Text fw={700} size="lg">
                  {activeItem?.label}
                </Text>
                <Text size="xs" c="dimmed">
                  {activeItem?.desc}
                </Text>
              </div>
            </Group>
            <Text size="xs" c="dimmed" visibleFrom="sm">
              {navItems.findIndex((i) => i.value === activeSection) + 1} / {navItems.length}
            </Text>
          </Group>
        </Paper>

        <Container size="xl" px={0}>
          {/* 错误边界：子组件崩溃只影响当前区块，不影响整个站点 */}
          <ErrorBoundary key={activeSection}>
            {activeDemo}
          </ErrorBoundary>
        </Container>
      </AppShell.Main>
    </AppShell>
    </NotificationProvider>
  );
}
