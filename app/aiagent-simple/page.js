"use client";

// =============================================================
// AI 智能体开发入门教程（aiagent-simple）交互式页面
// -------------------------------------------------------------
// 定位：入门级，从最简单的概念讲起，每章都有可运行 demo
// 主题：从「什么是 Agent」到「实战项目」全流程覆盖
// demo：用 mock 数据模拟 LLM，无需 API Key 即可运行
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { aiagentSimpleChapters, aiagentSimpleChapterGroups } from "../courses-data/aiagent-simple-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import CodeBlock from "../CodeBlock";
import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";

export default function AiAgentSimpleTutorial() {
  // 默认使用第一个章节作为初始状态（SSR 一致性）
  const initialChapter = aiagentSimpleChapters[0];

  const [activeId, setActiveId] = useState(initialChapter.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/aiagent-simple",
    contentRef,
    activeId
  );

  // 当前章节对象
  const activeChapter =
    aiagentSimpleChapters.find((c) => c.id === activeId) || aiagentSimpleChapters[0];

  // 客户端挂载后读取 URL hash：有效则切换到对应章节，无效则清除
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const chapter = aiagentSimpleChapters.find((c) => c.id === hash);
    if (chapter) {
      const id = requestAnimationFrame(() => {
        setActiveId(hash);
      });
      return () => cancelAnimationFrame(id);
    } else {
      const url = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", url);
    }
  }, []);

  // 切换章节
  const selectChapter = useCallback((chapterId) => {
    const chapter = aiagentSimpleChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    // 切换前保存当前章的滚动位置，下次切回时能从这里继续阅读
    saveCurrentBeforeSwitch();
    setActiveId(chapterId);
    setSidebarOpen(false);
    // 不再强制 scrollTop = 0，由 useReadingScrollPosition 自动恢复
  }, [saveCurrentBeforeSwitch]);

  // 按分组组织章节
  const groupedChapters = aiagentSimpleChapterGroups.map((group) => ({
    group,
    items: aiagentSimpleChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏：章节导航 ===== */}
        <Sidebar
          title="学习目录"
          tip="点击章节开始学习 AI 智能体开发"
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          currentPath="/aiagent-simple"
          meta={`共 ${aiagentSimpleChapters.length} 章 · 入门级 · 含可运行 demo`}
        />

        {/* ===== 主内容区 ===== */}
        <main className="content" ref={contentRef}>
          {/* 章节标题区 */}
          <div className="chapter-header">
            <div className="chapter-breadcrumb">
              <span>{activeChapter.group}</span>
              <span className="breadcrumb-sep">/</span>
              <span>{activeChapter.title}</span>
            </div>
            <h1 className="chapter-main-title">
              <span className="chapter-main-icon">{activeChapter.icon}</span>
              {activeChapter.title}
            </h1>
          </div>

          {/* Markdown 讲解区 */}
          <section className="lesson-section">
            <MarkdownRenderer content={activeChapter.content} />
            <CodeBlock code={activeChapter.code} lang="py" maxHeight={400} />
          </section>

          {/* 章节底部导航：上一章/下一章 */}
          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>
              AI 智能体开发入门 · demo 用 mock 数据模拟 LLM，无需 API Key ·
              代码由系统 python3 子进程执行
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航组件 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = aiagentSimpleChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? aiagentSimpleChapters[idx - 1] : null;
  const next = idx < aiagentSimpleChapters.length - 1 ? aiagentSimpleChapters[idx + 1] : null;

  return (
    <nav className="chapter-nav-bottom">
      {prev ? (
        <button className="nav-btn nav-prev" onClick={() => onSelect(prev.id)}>
          <span className="nav-dir">← 上一章</span>
          <span className="nav-title">{prev.icon} {prev.title}</span>
        </button>
      ) : (
        <span />
      )}
      {next ? (
        <button className="nav-btn nav-next" onClick={() => onSelect(next.id)}>
          <span className="nav-dir">下一章 →</span>
          <span className="nav-title">{next.icon} {next.title}</span>
        </button>
      ) : (
        <span />
      )}
    </nav>
  );
}
