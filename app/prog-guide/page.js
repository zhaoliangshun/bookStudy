"use client";

import { useState, useRef, useCallback } from "react";
import { progGuideChapters, progGuideChapterGroups } from "../courses-data/prog-guide-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function ProgGuideBook() {
  const [activeId, setActiveId] = useState(progGuideChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    progGuideChapters.find((c) => c.id === activeId) || progGuideChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = progGuideChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = progGuideChapterGroups.map((group) => ({
    group,
    items: progGuideChapters.filter((c) => c.group === group),
  }));

  const idx = progGuideChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? progGuideChapters[idx - 1] : null;
  const nextChapter =
    idx < progGuideChapters.length - 1 ? progGuideChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="📖 编程指南目录"
          tip="点击章节开始阅读"
          footer={<p>💡 共 {progGuideChapters.length} 章，从入门到精通编程</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/prog-guide"
          meta={`共 ${progGuideChapters.length} 章 · 编程通用指南`}
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
              编程指南 · {progGuideChapters.length} 章系统化内容 · 覆盖计算机基础到高级编程范式
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
