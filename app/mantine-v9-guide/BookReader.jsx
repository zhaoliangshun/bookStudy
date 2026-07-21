// =============================================================
// Mantine v9 现代开发指南 - 客户端阅读器
// -------------------------------------------------------------
// 负责：章节切换、侧边栏目录、Markdown 渲染、阅读进度、快捷键。
// 与站点通用 Sidebar 解耦，使用 AppShell 提供沉浸式阅读体验。
// =============================================================

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
  ColorSwatch,
} from "@mantine/core";

// ============ 阅读器主组件 ============
export default function BookReader({ chapters }) {
  // ---- 状态 ----
  const [activeIndex, setActiveIndex] = useState(0);
  const [navbarOpened, setNavbarOpened] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const currentChapter = chapters[activeIndex];

  // ---- 滚动进度监听 ----
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollHeight > 0 ? Math.min((scrollTop / scrollHeight) * 100, 100) : 0;
      setScrollProgress(progress);
      setShowBackToTop(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeIndex]);

  // ---- 章节切换 ----
  const handleChapterChange = useCallback(
    (index) => {
      if (index < 0 || index >= chapters.length) return;
      setActiveIndex(index);
      setNavbarOpened(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [chapters.length]
  );

  // ---- 键盘快捷键：Alt + 方向键切换章节 ----
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        handleChapterChange(activeIndex - 1);
      }
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

  // ---- Markdown 组件配置 ----
  const markdownComponents = useMemo(
    () => ({
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
      header={{ height: 64 }}
      navbar={{
        width: 320,
        breakpoint: "sm",
        collapsed: { mobile: !navbarOpened },
      }}
      padding={0}
    >
      {/* ---- 顶部栏 ---- */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger
              opened={navbarOpened}
              onClick={() => setNavbarOpened((o) => !o)}
              hiddenFrom="sm"
              size="sm"
              aria-label="切换目录"
            />
            <ThemeIcon variant="light" color="blue" size="md" radius="md">
              <Box component="span" fw={700}>
                M
              </Box>
            </ThemeIcon>
            <Text fw={700} size="lg" component="span" c="blue">
              Mantine v9 现代开发指南
            </Text>
          </Group>

          <Group gap="xs" wrap="nowrap" visibleFrom="sm">
            <ColorSwatch color="var(--mantine-color-blue-6)" size={14} />
            <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>
              {currentChapter.shortTitle}
            </Text>
          </Group>
        </Group>

        <Progress
          value={scrollProgress}
          size="xs"
          color="blue"
          radius={0}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
        />
      </AppShell.Header>

      {/* ---- 侧边栏目录 ---- */}
      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Group gap="sm" mb="md">
            <ThemeIcon variant="light" color="blue" size="sm">
              <Box component="span" fw={700}>
                ≡
              </Box>
            </ThemeIcon>
            <Text fw={600} size="sm" c="dimmed">
              目录
            </Text>
          </Group>
        </AppShell.Section>

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
                  style={{ borderRadius: "6px", marginBottom: "2px" }}
                />
              ))}
            </Box>
          </ScrollArea>
        </AppShell.Section>

        <AppShell.Section>
          <Divider mb="sm" />
          <Text size="xs" c="dimmed" ta="center">
            Mantine v9.4+ · React 19 · TypeScript
          </Text>
          <Text size="xs" c="dimmed" ta="center" mt="xs">
            Alt + ←/→ 切换章节
          </Text>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* ---- 内容区 ---- */}
      <AppShell.Main>
        <Container size="md" py="xl" px="lg">
          {/* 章节标题 */}
          <Box mb="xl">
            <Text size="xs" c="blue" fw={600} tt="uppercase" mb="xs">
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

          {/* Markdown 内容 */}
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

          {/* 章节导航 */}
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

          <Box h={100} />
        </Container>
      </AppShell.Main>

      {/* ---- 返回顶部 ---- */}
      <Tooltip label="返回顶部" position="left">
        <ActionIcon
          className={`back-to-top ${showBackToTop ? "" : "back-to-top--hidden"}`}
          color="blue"
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
