"use client";

// =============================================================
// 文件：app/mantine/page.js
// -------------------------------------------------------------
// 【一句话职责】
//   /mantine 路由的主页面。用 AppShell 搭建一个「完整后台管理站点」
//   布局，通过左侧导航在 4 个 Demo 区块间切换：
//     1. 表单实战  — useForm + 校验 + 各类输入控件
//     2. 数据展示  — Table + Card + Badge + Avatar
//     3. 反馈交互  — Modal + Drawer + LoadingOverlay + Alert
//     4. 布局排版  — Grid + SimpleGrid + Stack + 响应式
//
// 【站点结构】
//   AppShell
//   ├── Header  : Logo + 标题 + 全局搜索 + 主题切换 + 用户菜单
//   ├── Navbar  : 导航链接（切换 Demo 区块）
//   └── Main    : 当前选中的 Demo 组件
//
// 【技术点】
//   - AppShell 的 header/navbar/main 三栏布局
//   - useMantineColorScheme 运行时切换亮/暗主题
//   - useDisclosure 管理开关状态（Navbar 折叠/展开）
//   - NavLink 侧边导航高亮当前选中项
// =============================================================

import { useState } from "react";
import {
  AppShell,
  Burger,
  Group,
  Text,
  NavLink,
  SegmentedControl,
  useMantineColorScheme,
  Avatar,
  Indicator,
  Menu,
  Container,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

// ---- 4 个 Demo 组件 ----
import FormDemo from "./components/FormDemo";
import DataDemo from "./components/DataDemo";
import FeedbackDemo from "./components/FeedbackDemo";
import LayoutDemo from "./components/LayoutDemo";

// ---- 导航配置 ----
// navItems 定义左侧导航的每一项：value 是唯一标识（用于切换），
// label 是显示文字，icon 是 emoji，component 是点击后渲染的组件。
const navItems = [
  { value: "form", label: "表单实战", icon: "📝", component: <FormDemo /> },
  { value: "data", label: "数据展示", icon: "📊", component: <DataDemo /> },
  { value: "feedback", label: "反馈交互", icon: "🔔", component: <FeedbackDemo /> },
  { value: "layout", label: "布局排版", icon: "📐", component: <LayoutDemo /> },
];

export default function MantinePage() {
  // ---- Navbar 折叠状态 ----
  // useDisclosure 返回 [opened, { open, close, toggle }]，
  // 比 useState(false) + 手写 toggle 函数更简洁。
  // 移动端默认折叠 Navbar，桌面端展开。
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);

  // ---- 当前选中的 Demo 区块 ----
  // 默认显示「表单实战」
  const [activeSection, setActiveSection] = useState("form");

  // ---- 主题切换 ----
  // useMantineColorScheme 返回 { colorScheme, setColorScheme, toggleColorScheme }。
  // colorScheme 是当前主题（'light' 或 'dark'），setColorScheme 直接设置。
  // 切换后 Mantine 修改 <html data-mantine-color-scheme>，
  // 所有组件通过 CSS 变量自动响应。
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  // 当前要渲染的 Demo 组件
  const activeDemo =
    navItems.find((item) => item.value === activeSection)?.component || (
      <FormDemo />
    );

  return (
    // =========================================================
    // AppShell：Mantine 的页面骨架组件
    // ---------------------------------------------------------
    // layout="default"：Header 在顶部，Navbar 在左侧
    // header={{ height: 60 }}：固定 Header 高度 60px
    // navbar={{ width: 240, breakpoint: 'sm' }}：
    //   桌面端(≥sm)显示 240px 宽侧边栏；移动端(<sm)折叠，用 Burger 按钮控制
    // padding="md"：主内容区内边距
    // =========================================================
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
        {/* Group h={60}：高度撑满 Header；px="md"：左右内边距；
            justify="space-between"：两端对齐 */}
        <Group h="60px" px="md" justify="space-between">
          {/* 左侧：Burger（移动端折叠按钮）+ Logo */}
          <Group gap="sm">
            {/* Burger：汉堡菜单按钮，仅移动端可见（桌面端 hidden） */}
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              size="sm"
              hiddenFrom="sm"
            />
            <Text fw={700} size="lg" c="indigo">
              ⚡ Mantine Demo
            </Text>
          </Group>

          {/* 右侧：主题切换 + 用户菜单 */}
          <Group gap="md">
            {/* SegmentedControl：分段控制器切换亮/暗主题
                value 对应 colorScheme，onChange 调用 setColorScheme */}
            <SegmentedControl
              size="xs"
              value={colorScheme}
              onChange={(v) => setColorScheme(v)}
              data={[
                { value: "light", label: "☀️" },
                { value: "dark", label: "🌙" },
              ]}
            />

            {/* Menu：下拉菜单，包裹用户头像 */}
            <Menu shadow="md" width={160} position="bottom-end">
              <Menu.Target>
                {/* Indicator：小红点提示，包裹 Avatar 头像 */}
                <Indicator color="red" size={8} offset={6} processing>
                  <Avatar
                    size="sm"
                    radius="xl"
                    color="indigo"
                    variant="filled"
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
                <Menu.Item leftSection="🚪" color="red">
                  退出登录
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      {/* ============ 左侧导航栏 ============ */}
      <AppShell.Navbar p="xs">
        {/* Navbar.Section：可滚动区域，放导航链接 */}
        <AppShell.Section grow>
          {navItems.map((item) => (
            <NavLink
              key={item.value}
              // active：当前选中项高亮（左侧粗边框 + 背景色）
              active={activeSection === item.value}
              // variant="light"：选中时用浅色背景
              variant="light"
              onClick={() => {
                setActiveSection(item.value);
                toggleMobile(); // 移动端点击后收起导航
              }}
              // leftSection：左侧图标
              leftSection={<Text size="lg">{item.icon}</Text>}
              label={item.label}
            />
          ))}
        </AppShell.Section>

        {/* 底部固定区域：版本信息 */}
        <AppShell.Section>
          <Box p="xs">
            <Text size="xs" c="dimmed" ta="center">
              Mantine v9.4.1 · React 19
            </Text>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* ============ 主内容区 ============ */}
      <AppShell.Main>
        {/* Container size="xl"：限制最大宽度，居中。
            由于主站 body overflow:hidden，AppShell 内部 main 区域
            会自动管理滚动，内容超出时 main 内部滚动。 */}
        <Container size="xl">{activeDemo}</Container>
      </AppShell.Main>
    </AppShell>
  );
}
