"use client";

// =============================================================
// 程序员职业出路教程页面
// -------------------------------------------------------------
// 纯内容阅读型教程，无代码编辑器，无运行按钮。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { careerChapters, careerChapterGroups } from "../courses-data/career-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";
export default function CareerTutorial() {
  const [activeId, setActiveId] = useState(careerChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);


  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/career",
    contentRef,
    activeId
  );
  const activeChapter =
    careerChapters.find((c) => c.id === activeId) || careerChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = careerChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    saveCurrentBeforeSwitch();
    setActiveId(chapterId);
    setSidebarOpen(false);
  }, [saveCurrentBeforeSwitch]);

  const groupedChapters = careerChapterGroups.map((group) => ({
    group,
    items: careerChapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = careerChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? careerChapters[idx - 1] : null;
  const nextChapter =
    idx < careerChapters.length - 1 ? careerChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <Sidebar
          title="学习目录"
          tip="点击章节开始阅读"
          footer={<p>💡 提示：本教程为深度阅读内容</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/career"
          meta={`共 ${careerChapters.length} 章 · 职业发展指南`}
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
              程序员职业出路指南 · 深度阅读 · 帮助你规划职业发展方向
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}