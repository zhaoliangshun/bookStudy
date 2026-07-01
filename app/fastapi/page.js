"use client";

// =============================================================
// FastAPI 应用开发实战教程 - 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型技术书籍页面,无代码编辑器,无运行按钮。
// 结构:侧边栏章节导航 + 主内容区 Markdown 渲染。
// 支持:上一章/下一章导航、移动端侧边栏抽屉。
// 本书特点:系统讲解 FastAPI,从基础概念到生产部署。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { fastapiChapters, fastapiChapterGroups } from "../fastapi-book-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function FastAPIBook() {
  const [activeId, setActiveId] = useState(fastapiChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    fastapiChapters.find((c) => c.id === activeId) || fastapiChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = fastapiChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = fastapiChapterGroups.map((group) => ({
    group,
    items: fastapiChapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = fastapiChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? fastapiChapters[idx - 1] : null;
  const nextChapter =
    idx < fastapiChapters.length - 1 ? fastapiChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={<p>⚡ 高性能、易用、自动文档的现代 Web 框架</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/fastapi"
          meta={`共 ${fastapiChapters.length} 章 · 从入门到精通`}
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
              FastAPI 应用开发实战 · 从入门到精通 · 高性能 API 框架的完整指南
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
