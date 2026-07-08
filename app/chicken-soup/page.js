"use client";

import { useState, useRef, useCallback } from "react";
import { chickenSoupChapters, chickenSoupChapterGroups } from "./chicken-soup-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function ChickenSoupBook() {
  const [activeId, setActiveId] = useState(chickenSoupChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    chickenSoupChapters.find((c) => c.id === activeId) || chickenSoupChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = chickenSoupChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = chickenSoupChapterGroups.map((group) => ({
    group,
    items: chickenSoupChapters.filter((c) => c.group === group),
  }));

  const idx = chickenSoupChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? chickenSoupChapters[idx - 1] : null;
  const nextChapter =
    idx < chickenSoupChapters.length - 1 ? chickenSoupChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击开始阅读，温暖你的心灵"
          footer={<p>💡 共 {chickenSoupChapters.length} 篇，愿这些文字温暖你</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/chicken-soup"
          meta={`共 ${chickenSoupChapters.length} 篇 · 心灵鸡汤`}
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
                <span className="nav-dir">← 上一篇</span>
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
                <span className="nav-dir">下一篇 →</span>
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
              🍲 心灵鸡汤 · {chickenSoupChapters.length} 篇温暖文字 · 在低落迷茫时给予你力量与安慰
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
