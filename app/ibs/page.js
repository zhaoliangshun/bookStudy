"use client";

// =============================================================
// 肠易激综合征康复全书 - 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型书籍页面，无代码编辑器，无运行按钮。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// 支持：上一章/下一章导航、移动端侧边栏抽屉。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { ibsChapters, ibsChapterGroups } from "../courses-data/ibs-book-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";
export default function IBSBook() {
  const [activeId, setActiveId] = useState(ibsChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);


  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/ibs",
    contentRef,
    activeId
  );
  const activeChapter =
    ibsChapters.find((c) => c.id === activeId) || ibsChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = ibsChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    saveCurrentBeforeSwitch();
    setActiveId(chapterId);
    setSidebarOpen(false);
  }, [saveCurrentBeforeSwitch]);

  const groupedChapters = ibsChapterGroups.map((group) => ({
    group,
    items: ibsChapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = ibsChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? ibsChapters[idx - 1] : null;
  const nextChapter =
    idx < ibsChapters.length - 1 ? ibsChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={
            <p>
              💡 本书共 {ibsChapters.length} 章 · 从认识、诊断到长期管理
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
          currentPath="/ibs"
          meta={`共 ${ibsChapters.length} 章 · 肠易激综合征康复全书`}
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
              《肠易激综合征康复全书》 · 健康科普 ·
              愿你与肠道和解，温柔地走自己的路
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
