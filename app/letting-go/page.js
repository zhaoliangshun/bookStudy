"use client";

// =============================================================
// 《释怀——坦然面对失去的心理学》阅读页面
// -------------------------------------------------------------
// 纯内容阅读型书籍，无代码编辑器，无运行按钮。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { lettingGoChapters, lettingGoChapterGroups } from "../courses-data/letting-go-book-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function LettingGoBook() {
  const [activeId, setActiveId] = useState(lettingGoChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    lettingGoChapters.find((c) => c.id === activeId) || lettingGoChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = lettingGoChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = lettingGoChapterGroups.map((group) => ({
    group,
    items: lettingGoChapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = lettingGoChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? lettingGoChapters[idx - 1] : null;
  const nextChapter =
    idx < lettingGoChapters.length - 1 ? lettingGoChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <Sidebar
          title="释怀"
          tip="点击章节开始阅读"
          footer={
            <p>
              💡 本书共 {lettingGoChapters.length} 章，陪你走过失去，学会坦然
              <br />
              📂 按 <kbd>Ctrl</kbd> + <kbd>B</kbd> 收起 / 展开目录
            </p>
          }
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          currentPath="/letting-go"
          meta={`共 ${lettingGoChapters.length} 章 · 坦然面对失去的心理学`}
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
              《释怀——坦然面对失去的心理学》 · 深度阅读 ·
              愿你在失去之后，依然能拥抱生活
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
