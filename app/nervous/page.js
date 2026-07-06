"use client";

// =============================================================
// 《与紧张和解》阅读页面
// -------------------------------------------------------------
// 《与紧张和解——理解并化解遇事忐忑的心理指南》
// 纯内容阅读型书籍，无代码编辑器，无运行按钮。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { nervousChapters, nervousChapterGroups } from "../nervous-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function NervousBook() {
  const [activeId, setActiveId] = useState(nervousChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    nervousChapters.find((c) => c.id === activeId) || nervousChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = nervousChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = nervousChapterGroups.map((group) => ({
    group,
    items: nervousChapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = nervousChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? nervousChapters[idx - 1] : null;
  const nextChapter =
    idx < nervousChapters.length - 1 ? nervousChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <Sidebar
          title="与紧张和解"
          tip="点击章节开始阅读"
          footer={
            <p>
              💡 本书共 {nervousChapters.length} 章，理解紧张、化解紧张、与紧张共处
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
          currentPath="/nervous"
          meta={`共 ${nervousChapters.length} 章 · 理解并化解遇事忐忑的心理指南`}
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
              《与紧张和解——理解并化解遇事忐忑的心理指南》 · 深度阅读 ·
              愿你与紧张和解，温柔地走自己的路
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
