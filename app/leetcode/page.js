"use client";

// =============================================================
// LeetCode 面试算法 200 题 - 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型,每题包含题目/思路/Python/JS/复杂度/拓展。
// 侧边栏按 20 个算法分组展示,共 200 题。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { leetcodeChapters, leetcodeChapterGroups } from "../leetcode-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function LeetCodeBook() {
  const [activeId, setActiveId] = useState(leetcodeChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    leetcodeChapters.find((c) => c.id === activeId) || leetcodeChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = leetcodeChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = leetcodeChapterGroups.map((group) => ({
    group,
    items: leetcodeChapters.filter((c) => c.group === group),
  }));

  const idx = leetcodeChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? leetcodeChapters[idx - 1] : null;
  const nextChapter =
    idx < leetcodeChapters.length - 1 ? leetcodeChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击题目开始刷题"
          footer={<p>📝 200 道高频面试算法题 · Python + JS 双语言实现</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/leetcode"
          meta={`共 ${leetcodeChapters.length} 题 · 中等及以下难度`}
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
                <span className="nav-dir">← 上一题</span>
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
                <span className="nav-dir">下一题 →</span>
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
              LeetCode 面试算法 200 题 · Python + JavaScript 双语言 · 刷题是通向 Offer 的最短路径
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
