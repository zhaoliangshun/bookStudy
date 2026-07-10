"use client";

// =============================================================
// Next.js 16 教程 - 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型书籍页面，无代码编辑器。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// 代码块通过 MarkdownRenderer 中的 CodeBlock 组件提供
// 复制 / 运行 / 跳转 Playground 工具栏。
// 章节状态通过 URL hash 持久化（由 Sidebar 组件统一处理）。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { nextjsChapters, nextjsChapterGroups } from "../courses-data/nextjs-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function NextjsBook() {
  const [activeId, setActiveId] = useState(nextjsChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    nextjsChapters.find((c) => c.id === activeId) || nextjsChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = nextjsChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = nextjsChapterGroups.map((group) => ({
    group,
    items: nextjsChapters.filter((c) => c.group === group),
  }));

  const idx = nextjsChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? nextjsChapters[idx - 1] : null;
  const nextChapter =
    idx < nextjsChapters.length - 1 ? nextjsChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={<p>💡 共 {nextjsChapters.length} 章，基于 Next.js 16.2.9 + React 19.2.4</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/nextjs"
          meta={`共 ${nextjsChapters.length} 章 · Next.js 16 教程`}
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
              Next.js 16 教程 · 25 章系统化内容 · 涵盖基础入门、数据交互、高级路由、性能缓存、配置部署
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
