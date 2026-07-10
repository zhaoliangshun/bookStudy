"use client";

// =============================================================
// 程序员出路指南教程页面
// -------------------------------------------------------------
// 主题：大龄程序员失业后的出路指南
// 纯内容阅读型教程，无代码编辑器，无运行按钮。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { futureChapters, futureChapterGroups } from "../courses-data/future-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function FutureTutorial() {
  // ---------- 状态管理 ----------
  const [activeId, setActiveId] = useState(futureChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  // 当前章节对象
  const activeChapter =
    futureChapters.find((c) => c.id === activeId) || futureChapters[0];

  // ---------- 切换章节 ----------
  const selectChapter = useCallback((chapterId) => {
    const chapter = futureChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    // 切换章节后滚动到顶部
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  // ---------- 按分组组织章节 ----------
  const groupedChapters = futureChapterGroups.map((group) => ({
    group,
    items: futureChapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = futureChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? futureChapters[idx - 1] : null;
  const nextChapter =
    idx < futureChapters.length - 1 ? futureChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <Sidebar
          title="学习目录"
          tip="点击章节开始阅读"
          footer={<p>💡 提示：本指南为深度阅读内容，建议按顺序阅读</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/future"
          meta={`共 ${futureChapters.length} 章 · 程序员出路指南`}
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
              程序员出路指南 · 大龄程序员失业转型手册 · 人生不是线性函数
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
