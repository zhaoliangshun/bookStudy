"use client";

// =============================================================
// 《放不下的愤怒：被攻击后如何修复尊严与重建自我》- 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型书籍页面，无代码编辑器，无运行按钮。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// 支持：上一章/下一章导航、移动端侧边栏抽屉、URL hash 同步。
//
// 本书定位：
//   写给那些在冲突中被对方暴怒攻击、当时僵住沉默、事后几个月
//   无法放下的人。帮助读者看破那件事、疗愈受伤的心灵、
//   重建自我价值、学会未来如何应对类似事件。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { dignityChapters, dignityChapterGroups } from "../dignity-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function DignityBook() {
  const [activeId, setActiveId] = useState(dignityChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    dignityChapters.find((c) => c.id === activeId) || dignityChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = dignityChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = dignityChapterGroups.map((group) => ({
    group,
    items: dignityChapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = dignityChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? dignityChapters[idx - 1] : null;
  const nextChapter =
    idx < dignityChapters.length - 1 ? dignityChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={<p>💚 那件事终将过去 · 你会比从前更强</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          currentPath="/dignity"
          meta={`共 ${dignityChapters.length} 章 · 放不下的愤怒`}
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
              放不下的愤怒 · 写给每一个在冲突中受了伤却说不出口的人 · 愿你读完此书，终于能轻轻把那件事放下
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
