"use client";

// =============================================================
// Python 实战项目教程 - 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型技术书籍页面,无代码编辑器,无运行按钮。
// 结构:侧边栏章节导航 + 主内容区 Markdown 渲染。
// 支持:上一章/下一章导航、移动端侧边栏抽屉。
// 本书特点:10 个实战项目,从 CLI 到企业级 FastAPI,全程 demo + 逐行注释。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { pyprojectChapters, pyprojectChapterGroups } from "../courses-data/pyproject-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function PyProjectBook() {
  const [activeId, setActiveId] = useState(pyprojectChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    pyprojectChapters.find((c) => c.id === activeId) || pyprojectChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = pyprojectChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = pyprojectChapterGroups.map((group) => ({
    group,
    items: pyprojectChapters.filter((c) => c.group === group),
  }));

  const idx = pyprojectChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? pyprojectChapters[idx - 1] : null;
  const nextChapter =
    idx < pyprojectChapters.length - 1 ? pyprojectChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={
            <p>
              🚀 共 {pyprojectChapters.length} 章 · 10 个实战项目从 CLI 到企业级后端
            </p>
          }
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/pyproject"
          meta={`共 ${pyprojectChapters.length} 章 · Python 实战项目`}
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
              Python 实战项目教程 · 10 个项目从入门到企业级 ·
              CLI / 爬虫 / API / WebSocket / FastAPI
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
