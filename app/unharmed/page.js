"use client";

// =============================================================
// 《破怒——被情绪暴击后如何彻底翻篇》- 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型书籍页面，无代码编辑器，无运行按钮。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// 支持：上一章/下一章导航、移动端侧边栏抽屉。
//
// 本书定位：
//   专门针对"与人争执时对方突然情绪爆发（砸东西、破口大骂、怒不可遏），
//   你当场被镇住不敢作声，事后却长期无法释怀、反复回想、气愤难平、
//   觉得自己受了天大委屈、尊严碎了一地、甚至憋出病来"这一特定心理创伤。
//   重点：看破真相 → 疗愈伤口 → 预防再犯。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { unharmedChapters, unharmedChapterGroups } from "../unharmed-book-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function UnharmedBook() {
  const [activeId, setActiveId] = useState(unharmedChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    unharmedChapters.find((c) => c.id === activeId) || unharmedChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = unharmedChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = unharmedChapterGroups.map((group) => ({
    group,
    items: unharmedChapters.filter((c) => c.group === group),
  }));

  const idx = unharmedChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? unharmedChapters[idx - 1] : null;
  const nextChapter =
    idx < unharmedChapters.length - 1 ? unharmedChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="破怒"
          tip="点击章节开始阅读"
          footer={
            <p>
              🌱 看破真相 · 疗愈伤口 · 不再受伤
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
          currentPath="/unharmed"
          meta={`共 ${unharmedChapters.length} 章 · 被情绪暴击后的心灵重建指南`}
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
              《破怒——被情绪暴击后如何彻底翻篇》 · 深度阅读 ·
              愿你在这里找到看破的智慧、疗愈的力量和不再受伤的勇气
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
