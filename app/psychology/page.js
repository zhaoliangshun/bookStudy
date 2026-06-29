"use client";

// =============================================================
// 心理学书籍阅读页面
// -------------------------------------------------------------
// 《心向阳光——心理健康与自我疗愈指南》
// 纯内容阅读型书籍，无代码编辑器，无运行按钮。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { psychologyChapters, psychologyChapterGroups } from "../psychology-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function PsychologyBook() {
  const [activeId, setActiveId] = useState(psychologyChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    psychologyChapters.find((c) => c.id === activeId) || psychologyChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = psychologyChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = psychologyChapterGroups.map((group) => ({
    group,
    items: psychologyChapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = psychologyChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? psychologyChapters[idx - 1] : null;
  const nextChapter =
    idx < psychologyChapters.length - 1 ? psychologyChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <Sidebar
          title="心向阳光"
          tip="点击章节开始阅读"
          footer={
            <p>
              💡 本书共 {psychologyChapters.length} 章，覆盖心理健康、心理疗愈、拧巴性格疗愈三大主题
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
          currentPath="/psychology"
          meta={`共 ${psychologyChapters.length} 章 · 心理健康与自我疗愈指南`}
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
              《心向阳光——心理健康与自我疗愈指南》 · 深度阅读 ·
              愿你在这里找到温柔与力量
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
