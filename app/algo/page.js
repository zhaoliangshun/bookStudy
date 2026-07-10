"use client";

import { useState, useRef, useCallback } from "react";
import { algoChapters, algoChapterGroups } from "../courses-data/algo-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function AlgoBook() {
  const [activeId, setActiveId] = useState(algoChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    algoChapters.find((c) => c.id === activeId) || algoChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = algoChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = algoChapterGroups.map((group) => ({
    group,
    items: algoChapters.filter((c) => c.group === group),
  }));

  const idx = algoChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? algoChapters[idx - 1] : null;
  const nextChapter =
    idx < algoChapters.length - 1 ? algoChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={<p>💡 共 {algoChapters.length} 章，系统掌握算法精髓</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/algo"
          meta={`共 ${algoChapters.length} 章 · 编程算法大全`}
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
              编程算法大全 · {algoChapters.length} 章系统化内容 · 涵盖数据结构、算法思想、面试实战
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
