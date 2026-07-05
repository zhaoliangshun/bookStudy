"use client";

// =============================================================
// 《反驳的艺术》- 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型书籍页面，无代码编辑器，无运行按钮。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// 支持：上一章/下一章导航、移动端侧边栏抽屉。
//
// 本书定位：
//   偏逻辑拆解 + 快速反应 + 掷地有声的回击技术。
//   与《怼人艺术》(话术)、《反怼心理学》(心理防御)、《回怼护盾》(防御)
//   形成互补——本书专注于"如何在对话中实时识别漏洞、看穿意图、
//   快速组织反驳、用最简洁有力的话掷地有声地回击"。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { rebutChapters, rebutChapterGroups } from "../rebut-book-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function RebutBook() {
  const [activeId, setActiveId] = useState(rebutChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    rebutChapters.find((c) => c.id === activeId) || rebutChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = rebutChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = rebutChapterGroups.map((group) => ({
    group,
    items: rebutChapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = rebutChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? rebutChapters[idx - 1] : null;
  const nextChapter =
    idx < rebutChapters.length - 1 ? rebutChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={<p>⚔️ 听得清 · 看得透 · 说得准 · 立得稳</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/rebut"
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
              反驳的艺术 · 听得清、看得透、说得准、立得稳 · 愿你既有锋芒，也有清醒
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
