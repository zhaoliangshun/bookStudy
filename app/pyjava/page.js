"use client";

// =============================================================
// Python vs Java 语言对比教程 - 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型技术书籍页面,无代码编辑器,无运行按钮。
// 结构:侧边栏章节导航 + 主内容区 Markdown 渲染。
// 支持:上一章/下一章导航、移动端侧边栏抽屉。
// 本书特点:系统对比 Python 与 Java 两门语言的差异与各自用途,
//          从语法基础到应用场景,帮助读者理解两门语言的设计哲学
//          与选型决策。所有 Python/Java 代码示例在 Markdown 代码块
//          中展示对比。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { pyjavaChapters, pyjavaChapterGroups } from "../courses-data/pyjava-book-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function PyJavaBook() {
  const [activeId, setActiveId] = useState(pyjavaChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    pyjavaChapters.find((c) => c.id === activeId) || pyjavaChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = pyjavaChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = pyjavaChapterGroups.map((group) => ({
    group,
    items: pyjavaChapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = pyjavaChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? pyjavaChapters[idx - 1] : null;
  const nextChapter =
    idx < pyjavaChapters.length - 1 ? pyjavaChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={<p>🐍☕ Python vs Java,理解差异才能选对工具</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          currentPath="/pyjava"
          meta={`共 ${pyjavaChapters.length} 章 · 从语法到选型`}
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
              Python vs Java 语言对比教程 · 25 章系统对比两门语言的语法、类型系统、并发模型、生态与应用场景
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
