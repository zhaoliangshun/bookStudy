"use client";

import { useState, useRef, useCallback } from "react";
import { backendEssentialChapters, backendEssentialChapterGroups } from "../courses-data/backend-essential-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";
export default function BackendEssentialBook() {
  const [activeId, setActiveId] = useState(backendEssentialChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);


  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/backend-essential",
    contentRef,
    activeId
  );
  const activeChapter =
    backendEssentialChapters.find((c) => c.id === activeId) || backendEssentialChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = backendEssentialChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    saveCurrentBeforeSwitch();
    setActiveId(chapterId);
    setSidebarOpen(false);
  }, [saveCurrentBeforeSwitch]);

  const groupedChapters = backendEssentialChapterGroups.map((group) => ({
    group,
    items: backendEssentialChapters.filter((c) => c.group === group),
  }));

  const idx = backendEssentialChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? backendEssentialChapters[idx - 1] : null;
  const nextChapter =
    idx < backendEssentialChapters.length - 1 ? backendEssentialChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="⚙️ 后端开发必备知识"
          tip="点击章节开始阅读"
          footer={<p>💡 共 {backendEssentialChapters.length} 章，后端工程师全栈知识体系</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/backend-essential"
          meta={`共 ${backendEssentialChapters.length} 章 · 后端开发必备知识`}
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
              ⚙️ 后端开发必备知识 · {backendEssentialChapters.length} 章系统化内容 · 覆盖网络、操作系统、数据库、分布式、微服务等全栈知识
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
