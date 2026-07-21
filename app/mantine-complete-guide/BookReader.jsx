"use client";

// =============================================================
// Mantine 完整指南 - 书籍阅读器组件
// -------------------------------------------------------------
// 功能：
//   1. 左侧导航栏显示章节目录
//   2. 右侧显示当前章节内容（Markdown 渲染）
//   3. 支持响应式设计（移动端抽屉式导航）
//   4. 阅读进度条显示
//   5. 返回顶部按钮
//   6. 键盘快捷键支持（Alt + ←/→ 切换章节）
// =============================================================

import { useState, useEffect } from "react";
import {
  AppShell,
  Burger,
  Group,
  Title,
  Text,
  ScrollArea,
  Box,
  Container,
  Paper,
  ThemeIcon,
  Divider,
  Progress,
  ActionIcon,
  Tooltip,
  Anchor,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

/**
 * 书籍阅读器主组件
 * @param {Object} props
 * @param {Array} props.chapters - 章节数组，每项包含 title, shortTitle, description, content
 */
export default function BookReader({ chapters }) {
  // ---- 状态管理 ----
  const [opened, { toggle, close }] = useDisclosure(); // 移动端导航栏开关
  const [activeChapter, setActiveChapter] = useState(0); // 当前章节索引
  const [scrollProgress, setScrollProgress] = useState(0); // 阅读进度
  const [showBackToTop, setShowBackToTop] = useState(false); // 返回顶部按钮显示

  // ---- 滚动监听：计算阅读进度 ----
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      setShowBackToTop(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ---- 切换章节 ----
  const handleChapterChange = (index) => {
    setActiveChapter(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
    close(); // 移动端关闭导航
  };

  // ---- 返回顶部 ----
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---- 键盘快捷键：Alt + 左右箭头切换章节 ----
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === "ArrowLeft" && activeChapter > 0) {
        handleChapterChange(activeChapter - 1);
      }
      if (e.altKey && e.key === "ArrowRight" && activeChapter < chapters.length - 1) {
        handleChapterChange(activeChapter + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeChapter, chapters.length]);

  const currentChapter = chapters[activeChapter];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      {/* ============ 顶部导航栏 ============ */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <ThemeIcon size="lg" variant="gradient" gradient={{ from: "blue", to: "cyan" }}>
              <Text fw={700} size="lg">M</Text>
            </ThemeIcon>
            <Title order={4} visibleFrom="sm">
              Mantine 完整指南
            </Title>
          </Group>

          <Text size="sm" c="dimmed" visibleFrom="sm">
            {currentChapter.title}
          </Text>

          <Group>
            <Text size="xs" c="dimmed">
              {activeChapter + 1} / {chapters.length}
            </Text>
          </Group>
        </Group>
        <Progress value={scrollProgress} size="xs" color="blue" radius={0} />
      </AppShell.Header>

      {/* ============ 左侧导航栏：章节目录 ============ */}
      <AppShell.Navbar p="md">
        <AppShell.Section grow component={ScrollArea}>
          <Box mb="md">
            <Title order={5} mb="sm" c="dimmed">
              目录
            </Title>
            {chapters.map((chapter, index) => (
              <Paper
                key={index}
                p="sm"
                mb="xs"
                withBorder
                style={{
                  cursor: "pointer",
                  backgroundColor: index === activeChapter ? "var(--mantine-color-blue-0)" : undefined,
                  transition: "background-color 0.2s",
                }}
                onClick={() => handleChapterChange(index)}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Box style={{ flex: 1 }}>
                    <Text size="sm" fw={index === activeChapter ? 700 : 500}>
                      {chapter.title}
                    </Text>
                    <Text size="xs" c="dimmed" mt={2}>
                      {chapter.description}
                    </Text>
                  </Box>
                  {index === activeChapter && (
                    <ThemeIcon size="sm" variant="light" color="blue">
                      ✓
                    </ThemeIcon>
                  )}
                </Group>
              </Paper>
            ))}
          </Box>
        </AppShell.Section>

        <AppShell.Section>
          <Divider my="sm" />
          <Text size="xs" c="dimmed" ta="center">
            基于 Mantine v7.13 · React 18+
          </Text>
          <Text size="xs" c="dimmed" ta="center" mt={4}>
            快捷键：Alt + ← → 切换章节
          </Text>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* ============ 主内容区 ============ */}
      <AppShell.Main>
        <Container size="md">
          <Paper p="xl" withBorder>
            <Title order={2} mb="xs">
              {currentChapter.title}
            </Title>
            <Text c="dimmed" mb="lg">
              {currentChapter.description}
            </Text>
            <Divider mb="xl" />

            {/* Markdown 内容渲染 */}
            <Box className="book-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {currentChapter.content}
              </ReactMarkdown>
            </Box>

            <Divider my="xl" />

            {/* 章节导航：上一章 / 下一章 */}
            <Group justify="space-between">
              <Anchor
                component="button"
                type="button"
                onClick={() => handleChapterChange(activeChapter - 1)}
                disabled={activeChapter === 0}
                size="sm"
              >
                ← 上一章
              </Anchor>
              <Text size="sm" c="dimmed">
                {activeChapter + 1} / {chapters.length}
              </Text>
              <Anchor
                component="button"
                type="button"
                onClick={() => handleChapterChange(activeChapter + 1)}
                disabled={activeChapter === chapters.length - 1}
                size="sm"
              >
                下一章 →
              </Anchor>
            </Group>
          </Paper>
        </Container>
      </AppShell.Main>

      {/* ============ 返回顶部按钮 ============ */}
      <Tooltip label="返回顶部" position="left">
        <ActionIcon
          variant="filled"
          size="xl"
          radius="xl"
          color="blue"
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            opacity: showBackToTop ? 1 : 0,
            pointerEvents: showBackToTop ? "auto" : "none",
            transition: "opacity 0.3s",
          }}
        >
          ↑
        </ActionIcon>
      </Tooltip>
    </AppShell>
  );
}
