"use client";

// =============================================================
// Python 设计思想与架构实战教程 - 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型技术书籍页面,无代码编辑器,无运行按钮。
// 结构:侧边栏章节导航 + 主内容区 Markdown 渲染。
// 支持:上一章/下一章导航、移动端侧边栏抽屉。
// 本书特点:从 SOLID 到设计模式,从架构到微服务,系统讲解工程化思想。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { pyarchChapters, pyarchChapterGroups } from "../pyarch-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function PyArchBook() {
  const [activeId, setActiveId] = useState(pyarchChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    pyarchChapters.find((c) => c.id === activeId) || pyarchChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = pyarchChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = pyarchChapterGroups.map((group) => ({
    group,
    items: pyarchChapters.filter((c) => c.group === group),
  }));

  const idx = pyarchChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? pyarchChapters[idx - 1] : null;
  const nextChapter =
    idx < pyarchChapters.length - 1 ? pyarchChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={
            <p>
              💡 共 {pyarchChapters.length} 章 · 从 SOLID 到微服务的设计思想全栈实战
            </p>
          }
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/pyarch"
          meta={`共 ${pyarchChapters.length} 章 · Python 设计思想与架构`}
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
              Python 设计思想与架构实战 · 从 SOLID 到微服务的工程化指南 ·
              设计模式 / 架构模式 / RESTful / 消息队列
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
