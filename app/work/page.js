"use client";

// =============================================================
// 职场生存指南书籍 - 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型书籍页面,无代码编辑器,无运行按钮。
// 结构:侧边栏章节导航 + 主内容区 Markdown 渲染。
// 支持:上一章/下一章导航、移动端侧边栏抽屉。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { workChapters, workChapterGroups } from "../work-book-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import SiteNav from "../components/SiteNav";
import Sidebar from "../components/Sidebar";

export default function WorkBook() {
  const [activeId, setActiveId] = useState(workChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    workChapters.find((c) => c.id === activeId) || workChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = workChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = workChapterGroups.map((group) => ({
    group,
    items: workChapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = workChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? workChapters[idx - 1] : null;
  const nextChapter =
    idx < workChapters.length - 1 ? workChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <SiteNav currentPath="/work" meta={`共 ${workChapters.length} 章 · 中等篇幅`} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={<p>💡 做一个职场清醒人</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
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
              职场生存指南 · 做一个职场清醒人 · 愿你既会做事,也懂做人
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
