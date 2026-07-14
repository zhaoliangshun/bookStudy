"use client";

// =============================================================
// 人性弱点书籍阅读页面
// -------------------------------------------------------------
// 《人性的弱点图谱——看清自己，理解他人，走向成熟》
// 纯内容阅读型书籍，无代码编辑器，无运行按钮。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// =============================================================

import { useState, useRef, useCallback } from "react";
import {
  humanWeaknessChapters,
  humanWeaknessChapterGroups,
} from "../courses-data/human-weakness-book-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";
export default function HumanWeaknessBook() {
  const [activeId, setActiveId] = useState(humanWeaknessChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/human-weakness",
    contentRef,
    activeId
  );
  const activeChapter =
    humanWeaknessChapters.find((c) => c.id === activeId) ||
    humanWeaknessChapters[0];

  const selectChapter = useCallback(
    (chapterId) => {
      const chapter = humanWeaknessChapters.find((c) => c.id === chapterId);
      if (!chapter) return;
      saveCurrentBeforeSwitch();
      setActiveId(chapterId);
      setSidebarOpen(false);
    },
    [saveCurrentBeforeSwitch]
  );

  const groupedChapters = humanWeaknessChapterGroups.map((group) => ({
    group,
    items: humanWeaknessChapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = humanWeaknessChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? humanWeaknessChapters[idx - 1] : null;
  const nextChapter =
    idx < humanWeaknessChapters.length - 1
      ? humanWeaknessChapters[idx + 1]
      : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <Sidebar
          title="人性的弱点图谱"
          tip="点击章节开始阅读"
          footer={
            <p>
              💡 本书共 {humanWeaknessChapters.length} 章，覆盖认知偏差、情绪应激、社交面子、自我意志、改进成长五大主题
              <br />
              📂 按 <kbd>Ctrl</kbd> + <kbd>B</kbd> 收起 / 展开目录
            </p>
          }
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          currentPath="/human-weakness"
          meta={`共 ${humanWeaknessChapters.length} 章 · 看清自己，理解他人，走向成熟`}
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
              《人性的弱点图谱——看清自己，理解他人，走向成熟》 · 深度阅读 ·
              认识弱点不是自我否定，而是成长的起点
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
