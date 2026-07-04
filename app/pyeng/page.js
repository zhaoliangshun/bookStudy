"use client";

// =============================================================
// Python 工程化实战教程 - 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型技术书籍页面,无代码编辑器,无运行按钮。
// 结构:侧边栏章节导航 + 主内容区 Markdown 渲染。
// 支持:上一章/下一章导航、移动端侧边栏抽屉。
// 本书特点:从日志到测试,系统讲解 Python 工程化工具链。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { pyengChapters, pyengChapterGroups } from "../pyeng-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function PyEngBook() {
  const [activeId, setActiveId] = useState(pyengChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    pyengChapters.find((c) => c.id === activeId) || pyengChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = pyengChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = pyengChapterGroups.map((group) => ({
    group,
    items: pyengChapters.filter((c) => c.group === group),
  }));

  const idx = pyengChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? pyengChapters[idx - 1] : null;
  const nextChapter =
    idx < pyengChapters.length - 1 ? pyengChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={
            <p>
              ⚙️ 共 {pyengChapters.length} 章 · 从日志到测试的 Python 工程化全栈实战
            </p>
          }
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/pyeng"
          meta={`共 ${pyengChapters.length} 章 · Python 工程化实战`}
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
              Python 工程化实战 · 从日志到测试的工具链指南 ·
              logging / 配置 / 命令行 / pytest / 格式化
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
