"use client";

// =============================================================
// 毒舌词典书籍 - 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型毒舌语录集页面,无代码编辑器,无运行按钮。
// 结构:侧边栏章节导航 + 主内容区 Markdown 渲染。
// 支持:上一章/下一章导航、移动端侧边栏抽屉。
// 本书特点:语句简短,毒辣金句,骂人不带脏字。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { curseChapters, curseChapterGroups } from "../curse-book-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import SiteNav from "../components/SiteNav";
import Sidebar from "../components/Sidebar";

export default function CurseBook() {
  const [activeId, setActiveId] = useState(curseChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    curseChapters.find((c) => c.id === activeId) || curseChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = curseChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = curseChapterGroups.map((group) => ({
    group,
    items: curseChapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = curseChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? curseChapters[idx - 1] : null;
  const nextChapter =
    idx < curseChapters.length - 1 ? curseChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      {/* ===== 顶部导航栏 ===== */}
      <SiteNav
        currentPath="/curse"
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        meta={`共 ${curseChapters.length} 章 · 骂人不带脏字`}
      />

      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={<p>🐍 骂人不带脏字的艺术</p>}
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
              毒舌词典 · 骂人不带脏字的艺术 · 毒辣犀利,一针见血
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
