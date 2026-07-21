// ============ Client Component：书籍阅读器 ============
// "use client" 声明为客户端组件
// 负责：章节切换、侧边栏目录、内容渲染、阅读进度、响应式布局

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  AppShell,
  Text,
  Group,
  Button,
  Box,
  NavLink,
  Progress,
  Burger,
  Container,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Divider,
  ThemeIcon,
} from "@mantine/core";

// ============ 阅读器主组件 ============
/**
 * @param {Object} props
 * @param {Array} props.chapters - 章节数组，每项包含 slug, title, shortTitle, content
 */
export default function BookReader({ chapters }) {
  // ---- 状态管理 ----
  // 当前激活的章节索引
  const [activeIndex, setActiveIndex] = useState(0);
  // 移动端侧边栏开关状态
  const [navbarOpened, setNavbarOpened] = useState(false);
  // 阅读进度百分比（0-100）
  const [scrollProgress, setScrollProgress] = useState(0);
  // 是否显示"返回顶部"按钮
  const [showBackToTop, setShowBackToTop] = useState(false);

  // 当前章节对象
  const currentChapter = chapters[activeIndex];

  // ---- 滚动监听：计算阅读进度 ----
  useEffect(() => {
    const handleScroll = () => {
      // 当前滚动位置
      const scrollTop = window.scrollY;
      // 可滚动的总高度 = 文档总高度 - 视口高度
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      // 计算进度百分比
      const progress =
        scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));

      // 滚动超过 300px 时显示返回顶部按钮
      setShowBackToTop(scrollTop > 300);
    };

    // 监听滚动事件（使用 passive 提升性能）
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeIndex]);

  // ---- 章节切换 ----
  const handleChapterChange = useCallback(
    (index) => {
      if (index < 0 || index >= chapters.length) return;
      setActiveIndex(index);
      // 关闭移动端侧边栏
      setNavbarOpened(false);
      // 滚动到页面顶部
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [chapters.length]
  );

  // ---- 键盘快捷键：左右箭头切换章节 ----
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt + ← 上一章
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        handleChapterChange(activeIndex - 1);
      }
      // Alt + → 下一章
      if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        handleChapterChange(activeIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, handleChapterChange]);

  // ---- 返回顶部 ----
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ---- react-markdown 配置 ----
  // useMemo 避免每次渲染都重新创建配置
  const markdownComponents = useMemo(
    () => ({
      // 自定义代码块渲染：添加语言标签
      pre({ node, children, ...props }) {
        return <pre {...props}>{children}</pre>;
      },
      // 表格包裹容器：支持水平滚动
      table({ node, ...props }) {
        return (
          <div style={{ overflowX: "auto", margin: "0 0 1.3rem" }}>
            <table {...props} />
          </div>
        );
      },
    }),
    []
  );

  return (
    <AppShell
      // 顶部栏高度
      header={{ height: 60 }}
      // 侧边栏配置
      navbar={{
        width: 300,
        breakpoint: "sm",
        // 移动端：根据 navbarOpened 控制显示/隐藏
        collapsed: { mobile: !navbarOpened },
      }}
      padding={0}
    >
      {/* ============ 顶部栏 ============ */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          {/* 左侧：菜单按钮 + 书名 */}
          <Group gap="sm" wrap="nowrap">
            <Burger
              opened={navbarOpened}
              onClick={() => setNavbarOpened((o) => !o)}
              hiddenFrom="sm"
              size="sm"
              aria-label="切换目录"
            />
            <Text fw={700} size="lg" component="span" c="indigo">
              Mantine v9 实战指南
            </Text>
          </Group>

          {/* 右侧：当前章节标题 */}
          <Text size="sm" c="dimmed" visibleFrom="sm" style={{ flexShrink: 0 }}>
            {currentChapter.shortTitle}
          </Text>
        </Group>

        {/* 阅读进度条 */}
        <Progress
          value={scrollProgress}
          size="xs"
          color="indigo"
          radius={0}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
        />
      </AppShell.Header>

      {/* ============ 侧边栏目录 ============ */}
      <AppShell.Navbar p="md">
        {/* Mantine v9 中 Section 挂在 AppShell 上，不是 AppShell.Navbar 上 */}
        <AppShell.Section>
          <Group gap="sm" mb="md">
            <ThemeIcon variant="light" color="indigo" size="sm">
              <Box component="span" fw={700}>
                M
              </Box>
            </ThemeIcon>
            <Text fw={600} size="sm" c="dimmed">
              目录
            </Text>
          </Group>
        </AppShell.Section>

        {/* 章节列表（可滚动） */}
        <AppShell.Section grow>
          <ScrollArea h="100%">
            <Box mb="sm">
              {chapters.map((chapter, index) => (
                <NavLink
                  key={chapter.slug}
                  active={index === activeIndex}
                  label={
                    <Text size="sm" fw={index === activeIndex ? 600 : 400}>
                      {chapter.title}
                    </Text>
                  }
                  description={chapter.description}
                  onClick={() => handleChapterChange(index)}
                  style={{
                    borderRadius: "6px",
                    marginBottom: "2px",
                  }}
                />
              ))}
            </Box>
          </ScrollArea>
        </AppShell.Section>

        {/* 底部信息 */}
        <AppShell.Section>
          <Divider mb="sm" />
          <Text size="xs" c="dimmed" ta="center">
            基于 Mantine v9.4+ · React 19
          </Text>
          <Text size="xs" c="dimmed" ta="center" mt="xs">
            Alt + ←/→ 切换章节
          </Text>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* ============ 内容区 ============ */}
      <AppShell.Main>
        <Container size="md" py="xl" px="lg">
          {/* 章节标题区 */}
          <Box mb="xl">
            <Text size="xs" c="indigo" fw={600} tt="uppercase" mb="xs">
              {currentChapter.shortTitle}
            </Text>
            <Text size="2rem" fw={800} mb="sm">
              {currentChapter.title}
            </Text>
            <Text size="sm" c="dimmed">
              {currentChapter.description}
            </Text>
            <Divider mt="md" />
          </Box>

          {/* Markdown 内容渲染区 */}
          <article className="book-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[
                [rehypeHighlight, { detect: true, ignoreMissing: true }],
              ]}
              components={markdownComponents}
            >
              {currentChapter.content}
            </ReactMarkdown>
          </article>

          {/* 章节导航：上一章 / 下一章 */}
          <Divider my="xl" />
          <Group justify="space-between" wrap="nowrap">
            <Button
              variant="subtle"
              color="gray"
              disabled={activeIndex === 0}
              onClick={() => handleChapterChange(activeIndex - 1)}
              style={{ flex: 1, maxWidth: 200 }}
            >
              ← 上一章
            </Button>
            <Text size="xs" c="dimmed" ta="center" style={{ flexShrink: 0 }}>
              {activeIndex + 1} / {chapters.length}
            </Text>
            <Button
              variant="subtle"
              color="gray"
              disabled={activeIndex === chapters.length - 1}
              onClick={() => handleChapterChange(activeIndex + 1)}
              style={{ flex: 1, maxWidth: 200 }}
            >
              下一章 →
            </Button>
          </Group>

          {/* 底部留白 */}
          <Box h={80} />
        </Container>
      </AppShell.Main>

      {/* ============ 返回顶部按钮 ============ */}
      <Tooltip label="返回顶部" position="left">
        <ActionIcon
          className={`back-to-top ${showBackToTop ? "" : "back-to-top--hidden"}`}
          color="indigo"
          variant="filled"
          size="lg"
          radius="xl"
          onClick={scrollToTop}
          aria-label="返回顶部"
        >
          <Box component="span" style={{ fontSize: 18 }}>
            ↑
          </Box>
        </ActionIcon>
      </Tooltip>
    </AppShell>
  );
}
