"use client";

import { useState, useRef, useCallback } from "react";
import { pyBackendChapters, pyBackendChapterGroups } from "../courses-data/py-backend-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";
export default function PyBackendBook() {
  const [activeId, setActiveId] = useState(pyBackendChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);


  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/py-backend",
    contentRef,
    activeId
  );
  const activeChapter =
    pyBackendChapters.find((c) => c.id === activeId) || pyBackendChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = pyBackendChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    saveCurrentBeforeSwitch();
    setActiveId(chapterId);
    setSidebarOpen(false);
  }, [saveCurrentBeforeSwitch]);

  const groupedChapters = pyBackendChapterGroups.map((group) => ({
    group,
    items: pyBackendChapters.filter((c) => c.group === group),
  }));

  const idx = pyBackendChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? pyBackendChapters[idx - 1] : null;
  const nextChapter =
    idx < pyBackendChapters.length - 1 ? pyBackendChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={
            <p>
              💡 共 {pyBackendChapters.length} 章 · Python Web 后端开发全栈知识大全
            </p>
          }
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/py-backend"
          meta={`共 ${pyBackendChapters.length} 章 · Python Web后端大全`}
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
              Python Web后端大全 · {pyBackendChapters.length} 章系统化内容 · 从HTTP协议到微服务部署的全栈开发指南
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
