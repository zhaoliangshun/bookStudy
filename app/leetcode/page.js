"use client";
import { useState, useRef, useCallback } from "react";
import { leetcodeChapters, leetcodeChapterGroups } from "../courses-data/leetcode-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";
export default function LeetcodeBook() {
  const [activeId, setActiveId] = useState(leetcodeChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/leetcode",
    contentRef,
    activeId
  );
  const activeChapter = leetcodeChapters.find((c) => c.id === activeId) || leetcodeChapters[0];
  const selectChapter = useCallback((chapterId) => {
    const chapter = leetcodeChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    saveCurrentBeforeSwitch();
    setActiveId(chapterId);
    setSidebarOpen(false);
  }, [saveCurrentBeforeSwitch]);
  const groupedChapters = leetcodeChapterGroups.map((group) => ({
    group,
    items: leetcodeChapters.filter((c) => c.group === group),
  }));
  const idx = leetcodeChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? leetcodeChapters[idx - 1] : null;
  const nextChapter = idx < leetcodeChapters.length - 1 ? leetcodeChapters[idx + 1] : null;
  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击题目开始刷题"
          footer={<p>💡 共 {leetcodeChapters.length} 题，刷完拿下大厂Offer</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/leetcode"
          meta={`共 ${leetcodeChapters.length} 题 · LeetCode面试必刷`}
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
              <button className="nav-btn nav-prev" onClick={() => selectChapter(prevChapter.id)}>
                <span className="nav-dir">← 上一题</span>
                <span className="nav-title">{prevChapter.icon} {prevChapter.title}</span>
              </button>
            ) : <span />}
            {nextChapter ? (
              <button className="nav-btn nav-next" onClick={() => selectChapter(nextChapter.id)}>
                <span className="nav-dir">下一题 →</span>
                <span className="nav-title">{nextChapter.icon} {nextChapter.title}</span>
              </button>
            ) : <span />}
          </nav>
        </main>
      </div>
    </div>
  );
}
