"use client";

// =============================================================
// 前端面试技巧指南 - 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型书籍页面，无代码编辑器，无运行按钮。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { feInterviewChapters, feInterviewChapterGroups } from "../courses-data/fe-interview-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";
export default function FeInterviewBook() {
  const [activeId, setActiveId] = useState(feInterviewChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);


  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/fe-interview",
    contentRef,
    activeId
  );
  const activeChapter =
    feInterviewChapters.find((c) => c.id === activeId) || feInterviewChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = feInterviewChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    saveCurrentBeforeSwitch();
    setActiveId(chapterId);
    setSidebarOpen(false);
  }, [saveCurrentBeforeSwitch]);

  const groupedChapters = feInterviewChapterGroups.map((group) => ({
    group,
    items: feInterviewChapters.filter((c) => c.group === group),
  }));

  const idx = feInterviewChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? feInterviewChapters[idx - 1] : null;
  const nextChapter =
    idx < feInterviewChapters.length - 1 ? feInterviewChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={<p>💡 共 {feInterviewChapters.length} 章，助你拿下心仪 Offer</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/fe-interview"
          meta={`共 ${feInterviewChapters.length} 章 · 面试技巧指南`}
        />

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
              前端面试技巧指南 · 20 章系统化内容 · 涵盖基础能力、框架工程化、项目算法、实战准备
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}