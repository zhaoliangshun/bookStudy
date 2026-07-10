"use client";

// =============================================================
// 前端工程化教程 - 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型书籍页面，无代码编辑器。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// 代码块通过 MarkdownRenderer 中的 CodeBlock 组件提供
// 复制 / 运行 / 跳转 Playground 工具栏。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { feEngineeringChapters, feEngineeringChapterGroups } from "../courses-data/fe-engineering-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function FeEngineeringBook() {
  const [activeId, setActiveId] = useState(feEngineeringChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    feEngineeringChapters.find((c) => c.id === activeId) || feEngineeringChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = feEngineeringChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = feEngineeringChapterGroups.map((group) => ({
    group,
    items: feEngineeringChapters.filter((c) => c.group === group),
  }));

  const idx = feEngineeringChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? feEngineeringChapters[idx - 1] : null;
  const nextChapter =
    idx < feEngineeringChapters.length - 1 ? feEngineeringChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={<p>💡 共 {feEngineeringChapters.length} 章，构建体系化的前端工程化知识</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/fe-engineering"
          meta={`共 ${feEngineeringChapters.length} 章 · 前端工程化教程`}
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
              前端工程化教程 · 15 章系统化内容 · 涵盖基础概念、构建与打包、质量与现代化
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
