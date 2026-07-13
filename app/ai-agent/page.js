"use client";

// =============================================================
// AI Agent开发实战书籍 - 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型技术书籍页面,无代码编辑器,无运行按钮。
// 结构:侧边栏章节导航 + 主内容区 Markdown 渲染。
// 支持:上一章/下一章导航、移动端侧边栏抽屉。
// 本书特点:系统讲解AI Agent开发,从基础概念到生产部署。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { aiAgentChapters, aiAgentChapterGroups } from "../courses-data/ai-agent-book-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";
export default function AIAgentBook() {
  const [activeId, setActiveId] = useState(aiAgentChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);


  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/ai-agent",
    contentRef,
    activeId
  );
  const activeChapter =
    aiAgentChapters.find((c) => c.id === activeId) || aiAgentChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = aiAgentChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    saveCurrentBeforeSwitch();
    setActiveId(chapterId);
    setSidebarOpen(false);
  }, [saveCurrentBeforeSwitch]);

  const groupedChapters = aiAgentChapterGroups.map((group) => ({
    group,
    items: aiAgentChapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = aiAgentChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? aiAgentChapters[idx - 1] : null;
  const nextChapter =
    idx < aiAgentChapters.length - 1 ? aiAgentChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={<p>🤖 从入门到精通,成为Agent时代的构建者</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/ai-agent"
          meta={`共 ${aiAgentChapters.length} 章 · 从入门到精通`}
        />

        {/* ===== 主内容区 ===== */}
        <main className="content" ref={contentRef}>
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

          <section className="lesson-section">
            <MarkdownRenderer content={activeChapter.content} />
          </section>

          {/* 上一章 / 下一章 导航 */}
          <nav className="chapter-nav-bottom">
            {prevChapter ? (
              <button
                className="nav-btn nav-prev"
                onClick={() => selectChapter(prevChapter.id)}
              >
                <span className="nav-dir">← 上一章</span>
                <span className="nav-title">
                  {prevChapter.icon} {prevChapter.title}
                </span>
              </button>
            ) : (
              <span />
            )}
            {nextChapter ? (
              <button
                className="nav-btn nav-next"
                onClick={() => selectChapter(nextChapter.id)}
              >
                <span className="nav-dir">下一章 →</span>
                <span className="nav-title">
                  {nextChapter.icon} {nextChapter.title}
                </span>
              </button>
            ) : (
              <span />
            )}
          </nav>

          <footer className="content-footer">
            <p>
              AI Agent开发实战 · 从入门到精通 · 工具会变,构建系统能力永远有价值
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
