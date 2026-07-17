"use client";

// =============================================================
// 文件：app/auth-demo/page.js
// -------------------------------------------------------------
// 【一句话职责】
//   /auth-demo 路由的主页面。用 AppShell 搭建一个完整认证站点
//   布局，通过左侧导航在多个认证流程间切换：
//     1. 🔐 登录     — 用户名密码 + OTP 两步登录
//     2. 📝 注册     — 用户名/邮箱/密码/安全问题三步注册
//     3. 🔑 忘记密码 — 邮箱验证码 + 重置密码
//     4. 🔄 修改密码 — 已登录用户修改密码
//     5. 🛡️ 安全问题 — KBA 安全问题查看/验证
//     6. 📋 个人资料 — 查看/编辑用户资料
//     7. 🎫 会话管理 — 会话信息/登出/2FA开关/用户列表
//
// 【站点结构】
//   AppShell
//   ├── Header  : Logo + 标题 + 主题切换 + 登录状态徽标
//   ├── Navbar  : 导航链接（切换功能模块）
//   └── Main    : 当前选中的功能组件
//
// 【技术点】
//   - AppShell 的 header/navbar/main 三栏布局
//   - useMantineColorScheme 运行时切换亮/暗主题
//   - useDisclosure 管理开关状态（Navbar 折叠/展开）
//   - 登录状态在父组件管理，通过回调传递给子组件
//   - 未登录时隐藏需要认证的功能（修改密码/个人资料/会话管理）
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
  Badge,
  Container,
  Box,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

// ---- 认证流程组件 ----
import LoginFlow from "./components/LoginFlow";
import RegisterFlow from "./components/RegisterFlow";
import ForgotPasswordFlow from "./components/ForgotPasswordFlow";
import ChangePasswordFlow from "./components/ChangePasswordFlow";
import SecurityQuestionsPanel from "./components/SecurityQuestionsPanel";
import ProfilePanel from "./components/ProfilePanel";
import SessionPanel from "./components/SessionPanel";

// ---- SDK 会话管理 ----
import { isLoggedIn, getSession, logout as sdkLogout } from "./lib/sdk";

// ---- 教程组件 ----
import AuthDemoTutorial from "./tutorial";

// ============================================================
// 导航配置
// ------------------------------------------------------------
// needAuth: true 表示需要登录才能访问
// 按功能分组：公开功能 vs 需要认证的功能
// ============================================================
const navItems = [
  // --- 公开功能（未登录也可访问）---
  { value: "login", label: "登录", icon: "🔐", needAuth: false },
  { value: "register", label: "注册", icon: "📝", needAuth: false },
  { value: "forgotPassword", label: "忘记密码", icon: "🔑", needAuth: false },
  { value: "security", label: "安全问题", icon: "🛡️", needAuth: false },

  // --- 需要认证的功能 ---
  { value: "profile", label: "个人资料", icon: "📋", needAuth: true },
  { value: "changePassword", label: "修改密码", icon: "🔄", needAuth: true },
  { value: "session", label: "会话管理", icon: "🎫", needAuth: true },
];

export default function AuthDemoPage() {
  // ---- Navbar 折叠状态 ----
  // useDisclosure 返回 [opened, { open, close, toggle }]
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);

  // ---- 当前选中的功能模块 ----
  const [activeSection, setActiveSection] = useState("login");

  // ---- 教程视图切换 ----
  const [showTutorial, setShowTutorial] = useState(false);

  // ---- 登录状态 ----
  // loggedIn: 是否已登录
  // session: 当前会话信息（sessionId, token, username 等）
  // 用 lazy initializer 在首次渲染时读取 SDK 会话状态，
  // 避免在 useEffect 中同步 setState 触发级联渲染
  const [loggedIn, setLoggedIn] = useState(() =>
    typeof window !== "undefined" ? isLoggedIn() : false
  );
  const [session, setSession] = useState(() =>
    typeof window !== "undefined" ? getSession() : null
  );

  // ---- 主题切换 ----
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  // ---- 登录成功回调 ----
  const handleLoginSuccess = (sessionInfo) => {
    setLoggedIn(true);
    setSession(sessionInfo || getSession());
    // 登录成功后跳转到个人资料页
    setActiveSection("profile");
  };

  // ---- 注册成功回调 ----
  const handleRegisterSuccess = (sessionInfo) => {
    setLoggedIn(true);
    setSession(sessionInfo || getSession());
    setActiveSection("profile");
  };

  // ---- 登出回调 ----
  const handleLogout = () => {
    sdkLogout();
    setLoggedIn(false);
    setSession(null);
    setActiveSection("login");
  };

  // ---- 渲染当前功能组件 ----
  const renderActiveComponent = () => {
    switch (activeSection) {
      case "login":
        return (
          <LoginFlow
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setActiveSection("register")}
            onSwitchToForgotPassword={() => setActiveSection("forgotPassword")}
          />
        );
      case "register":
        return (
          <RegisterFlow
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setActiveSection("login")}
          />
        );
      case "forgotPassword":
        return (
          <ForgotPasswordFlow
            onSwitchToLogin={() => setActiveSection("login")}
          />
        );
      case "security":
        return <SecurityQuestionsPanel onBack={() => setActiveSection("login")} />;
      case "profile":
        return loggedIn ? (
          <ProfilePanel onBack={() => setActiveSection("session")} />
        ) : (
          <NeedLoginNotice onLogin={() => setActiveSection("login")} />
        );
      case "changePassword":
        return loggedIn ? (
          <ChangePasswordFlow onBack={() => setActiveSection("session")} />
        ) : (
          <NeedLoginNotice onLogin={() => setActiveSection("login")} />
        );
      case "session":
        return loggedIn ? (
          <SessionPanel onLogout={handleLogout} />
        ) : (
          <NeedLoginNotice onLogin={() => setActiveSection("login")} />
        );
      default:
        return <LoginFlow onLoginSuccess={handleLoginSuccess} />;
    }
  };

  // ---- 过滤导航项：未登录时隐藏需要认证的功能 ----
  const visibleNavItems = navItems.filter(
    (item) => !item.needAuth || loggedIn
  );

  return (
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
        <Group h="60px" px="md" justify="space-between">
          {/* 左侧：Burger + Logo */}
          <Group gap="sm">
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              size="sm"
              hiddenFrom="sm"
            />
            <Text fw={700} size="lg" c="indigo">
              🔐 Auth Demo
            </Text>
            <Badge size="xs" variant="light" color="gray" visibleFrom="sm">
              ForgeRock + Zod + Mantine
            </Badge>
          </Group>

          {/* 右侧：登录状态 + 主题切换 */}
          <Group gap="md">
            {/* 教程切换按钮 */}
            <Badge
              size="sm"
              variant={showTutorial ? "filled" : "light"}
              color="indigo"
              onClick={() => setShowTutorial((v) => !v)}
              style={{ cursor: "pointer" }}
            >
              {showTutorial ? "← 返回 Demo" : "📖 教程"}
            </Badge>

            {/* 登录状态徽标 */}
            {loggedIn ? (
              <Badge size="sm" color="green" variant="light" leftSection="●">
                {session?.displayName || session?.username}
              </Badge>
            ) : (
              <Badge size="sm" color="gray" variant="light">
                未登录
              </Badge>
            )}

            {/* 主题切换 */}
            <SegmentedControl
              size="xs"
              value={colorScheme}
              onChange={(v) => setColorScheme(v)}
              data={[
                { value: "light", label: "☀️" },
                { value: "dark", label: "🌙" },
              ]}
            />
          </Group>
        </Group>
      </AppShell.Header>

      {/* ============ 左侧导航栏 ============ */}
      <AppShell.Navbar p="xs">
        <AppShell.Section grow>
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.value}
              active={activeSection === item.value}
              variant="light"
              onClick={() => {
                setActiveSection(item.value);
                toggleMobile();
              }}
              leftSection={<Text size="lg">{item.icon}</Text>}
              label={item.label}
            />
          ))}
        </AppShell.Section>

        {/* 底部：登录/登出按钮 */}
        <AppShell.Section>
          <Box p="xs">
            <Divider mb="xs" />
            {loggedIn ? (
              <NavLink
                onClick={handleLogout}
                leftSection={<Text size="lg">🚪</Text>}
                label="退出登录"
                color="red"
              />
            ) : (
              <NavLink
                onClick={() => setActiveSection("login")}
                leftSection={<Text size="lg">🚪</Text>}
                label="去登录"
              />
            )}
            <Text size="xs" c="dimmed" ta="center" mt="xs">
              SDK v4.9 · Mantine v9 · Zod v4
            </Text>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* ============ 主内容区 ============ */}
      <AppShell.Main>
        <Container size={showTutorial ? "xl" : "md"}>
          {showTutorial ? <AuthDemoTutorial /> : renderActiveComponent()}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

// ============================================================
// 未登录提示组件
// ============================================================
function NeedLoginNotice({ onLogin }) {
  return (
    <Box
      style={{
        textAlign: "center",
        padding: "60px 20px",
        color: "var(--mantine-color-dimmed-text)",
      }}
    >
      <Text size="48px" mb="md">
        🔒
      </Text>
      <Text size="lg" fw={500} mb="xs">
        此功能需要登录
      </Text>
      <Text size="sm" c="dimmed" mb="lg">
        请先登录后再访问此页面
      </Text>
      <Text size="sm" c="dimmed" mb="lg">
        测试账号：<strong>demo</strong> / <strong>Demo1234</strong>
      </Text>
      <Box
        component="button"
        onClick={onLogin}
        style={{
          padding: "10px 32px",
          borderRadius: "8px",
          border: "none",
          background: "var(--mantine-color-indigo-filled)",
          color: "var(--mantine-color-white)",
          fontSize: "14px",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        去登录
      </Box>
    </Box>
  );
}
