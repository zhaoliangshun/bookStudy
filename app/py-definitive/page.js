"use client";

import { useState, useRef, useCallback } from "react";
import { pyDefinitiveChapters, pyDefinitiveChapterGroups } from "../py-definitive-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function PyDefinitiveBook() {
  const [activeId, setActiveId] = useState(pyDefinitiveChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    pyDefinitiveChapters.find((c) => c.id === activeId) || pyDefinitiveChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = pyDefinitiveChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = pyDefinitiveChapterGroups.map((group) => ({
    group,
    items: pyDefinitiveChapters.filter((c) => c.group === group),
  }));

  const idx = pyDefinitiveChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? pyDefinitiveChapters[idx - 1] : null;
  const nextChapter =
    idx < pyDefinitiveChapters.length - 1 ? pyDefinitiveChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="📕 Python权威指南目录"
          tip="点击章节开始阅读"
          footer={<p>💡 共 {pyDefinitiveChapters.length} 章，Python编程完全指南</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/py-definitive"
          meta={`共 ${pyDefinitiveChapters.length} 章 · Python权威指南`}
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
              Python权威指南 · {pyDefinitiveChapters.length} 章系统化内容 · 从入门到高级特性全覆盖
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
