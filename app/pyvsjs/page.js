"use client";

// =============================================================
// Python vs JavaScript/TypeScript/Node.js 深度对比 - 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型技术书籍页面,无代码编辑器,无运行按钮。
// 结构:侧边栏章节导航 + 主内容区 Markdown 渲染。
// 本书特点:38 章深度对比,从设计哲学到选型指南,
// 覆盖语法、运行时、并发、生态四大维度。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { pyvsjsChapters, pyvsjsChapterGroups } from "../courses-data/pyvsjs-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";
export default function PyVsJsBook() {
  const [activeId, setActiveId] = useState(pyvsjsChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);


  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/pyvsjs",
    contentRef,
    activeId
  );
  const activeChapter =
    pyvsjsChapters.find((c) => c.id === activeId) || pyvsjsChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = pyvsjsChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    saveCurrentBeforeSwitch();
    setActiveId(chapterId);
    setSidebarOpen(false);
  }, [saveCurrentBeforeSwitch]);

  const groupedChapters = pyvsjsChapterGroups.map((group) => ({
    group,
    items: pyvsjsChapters.filter((c) => c.group === group),
  }));

  const idx = pyvsjsChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? pyvsjsChapters[idx - 1] : null;
  const nextChapter =
    idx < pyvsjsChapters.length - 1 ? pyvsjsChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={
            <p>
              ⚔️ 共 {pyvsjsChapters.length} 章 · Python vs JS/TS/Node.js 深度对比
            </p>
          }
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/pyvsjs"
          meta={`共 ${pyvsjsChapters.length} 章 · Python vs JS 深度对比`}
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
              Python vs JavaScript/TypeScript/Node.js 深度对比 ·
              从设计哲学到选型指南的完整对比 · 语法 / 运行时 / 并发 / 生态
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
