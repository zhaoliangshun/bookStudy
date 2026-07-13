"use client";

// =============================================================
// 《委屈的解剖学——当尊严被践踏之后，如何治愈受伤的心灵》
// -------------------------------------------------------------
// 纯内容阅读型心理学治疗书籍，无代码编辑器，无运行按钮。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// 支持：上一章/下一章导航、移动端侧边栏抽屉。
//
// 本书定位：
//   当你在冲突中被人砸东西、破口大骂、人格侮辱，你选择了沉默，
//   但事后心里久久不能放下，反复回想，觉得自己输了、尊严碎了、
//   憋出病来——这本书就是为你写的。它不是教你如何怼回去，而是
//   教你如何看破这件事的本质、如何治愈受伤的心灵、以及以后再
//   遇到类似情况时该怎么办。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { hurtChapters, hurtChapterGroups } from "../courses-data/hurt-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";
export default function HurtBook() {
  const [activeId, setActiveId] = useState(hurtChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);


  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/hurt",
    contentRef,
    activeId
  );
  const activeChapter =
    hurtChapters.find((c) => c.id === activeId) || hurtChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = hurtChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    saveCurrentBeforeSwitch();
    setActiveId(chapterId);
    setSidebarOpen(false);
  }, [saveCurrentBeforeSwitch]);

  const groupedChapters = hurtChapterGroups.map((group) => ({
    group,
    items: hurtChapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = hurtChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? hurtChapters[idx - 1] : null;
  const nextChapter =
    idx < hurtChapters.length - 1 ? hurtChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={<p>🕊️ 看见伤 · 理解伤 · 治愈伤 · 超越伤</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/hurt"
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
              委屈的解剖学 · 看见伤 · 理解伤 · 治愈伤 · 超越伤 · 愿你带着伤疤，依然可以活得很好
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}