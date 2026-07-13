"use client";

// =============================================================
// Python Web 后端开发教程 - 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型书籍页面，无代码编辑器。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// 代码块通过 MarkdownRenderer 中的 CodeBlock 组件提供
// 复制 / 运行 / 跳转 Playground 工具栏。
// 章节状态通过 URL hash 持久化（由 Sidebar 组件统一处理）。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { pywebChapters, pywebChapterGroups } from "../courses-data/pyweb-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";
export default function PyWebBook() {
  const [activeId, setActiveId] = useState(pywebChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);


  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/pyweb",
    contentRef,
    activeId
  );
  const activeChapter =
    pywebChapters.find((c) => c.id === activeId) || pywebChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = pywebChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    saveCurrentBeforeSwitch();
    setActiveId(chapterId);
    setSidebarOpen(false);
  }, [saveCurrentBeforeSwitch]);

  const groupedChapters = pywebChapterGroups.map((group) => ({
    group,
    items: pywebChapters.filter((c) => c.group === group),
  }));

  const idx = pywebChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? pywebChapters[idx - 1] : null;
  const nextChapter =
    idx < pywebChapters.length - 1 ? pywebChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={<p>💡 共 {pywebChapters.length} 章，FastAPI + SQLAlchemy 2.0 完整实战</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/pyweb"
          meta={`共 ${pywebChapters.length} 章 · Python Web 后端开发`}
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
              Python Web 后端开发教程 · 20 章系统化内容 · 涵盖基础入门、数据库、认证安全、实战部署
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
