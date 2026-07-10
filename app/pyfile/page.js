"use client";

// =============================================================
// Python 文件操作实战教程 - 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型技术书籍页面,无代码编辑器,无运行按钮。
// 结构:侧边栏章节导航 + 主内容区 Markdown 渲染。
// 支持:上一章/下一章导航、移动端侧边栏抽屉。
// 本书特点:从 open 到 pathlib,从文本到二进制,系统讲解 Python 文件操作。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { pyfileChapters, pyfileChapterGroups } from "../courses-data/pyfile-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function PyFileBook() {
  const [activeId, setActiveId] = useState(pyfileChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    pyfileChapters.find((c) => c.id === activeId) || pyfileChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = pyfileChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = pyfileChapterGroups.map((group) => ({
    group,
    items: pyfileChapters.filter((c) => c.group === group),
  }));

  const idx = pyfileChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? pyfileChapters[idx - 1] : null;
  const nextChapter =
    idx < pyfileChapters.length - 1 ? pyfileChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={
            <p>
              📁 共 {pyfileChapters.length} 章 · 从 open 到 pathlib 的文件操作全栈实战
            </p>
          }
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/pyfile"
          meta={`共 ${pyfileChapters.length} 章 · Python 文件操作实战`}
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
              Python 文件操作实战 · 从基础读写到进阶实战的完整指南 ·
              open / pathlib / shutil / csv / json / zipfile
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
