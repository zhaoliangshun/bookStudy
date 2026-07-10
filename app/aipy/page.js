"use client";

// =============================================================
// Python 人工智能开发教程页面
// -------------------------------------------------------------
// 结构与其他教程页面一致，区别：
//   1. 数据源：aipyChapters / aipyChapterGroups（来自 aipy-tutorial-data）
//   2. 运行接口：/api/run-py（由 CodeBlock 内部调用）
//   3. 文案：Python 人工智能开发教程
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { aipyChapters, aipyChapterGroups } from "../courses-data/aipy-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import CodeBlock from "../CodeBlock";

export default function AIPyTutorial() {
  const initialChapter = aipyChapters[0];

  const [activeId, setActiveId] = useState(initialChapter.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  const activeChapter =
    aipyChapters.find((c) => c.id === activeId) || aipyChapters[0];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const chapter = aipyChapters.find((c) => c.id === hash);
    if (chapter) {
      const id = requestAnimationFrame(() => {
        setActiveId(hash);
      });
      return () => cancelAnimationFrame(id);
    } else {
      const url = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", url);
    }
  }, []);

  const selectChapter = useCallback((chapterId) => {
    const chapter = aipyChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = aipyChapterGroups.map((group) => ({
    group,
    items: aipyChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="学习目录"
          tip="点击章节学习 Python AI 开发"
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/aipy"
          meta={`共 ${aipyChapters.length} 章 · 在线编辑运行`}
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
            <CodeBlock code={activeChapter.code} lang="py" maxHeight={400} />
          </section>

          <ChapterNav
            activeId={activeId}
            onSelect={selectChapter}
          />

          <footer className="content-footer">
            <p>
              Python 人工智能开发教程 · 代码由系统 python3 子进程执行 · 涵盖 AI入门、NumPy、Pandas、可视化、机器学习、深度学习、NLP、计算机视觉、项目实战共 {aipyChapters.length} 章
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

function ChapterNav({ activeId, onSelect }) {
  const idx = aipyChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? aipyChapters[idx - 1] : null;
  const next = idx < aipyChapters.length - 1 ? aipyChapters[idx + 1] : null;

  return (
    <nav className="chapter-nav-bottom">
      {prev ? (
        <button className="nav-btn nav-prev" onClick={() => onSelect(prev.id)}>
          <span className="nav-dir">← 上一章</span>
          <span className="nav-title">{prev.icon} {prev.title}</span>
        </button>
      ) : (
        <span />
      )}
      {next ? (
        <button className="nav-btn nav-next" onClick={() => onSelect(next.id)}>
          <span className="nav-dir">下一章 →</span>
          <span className="nav-title">{next.icon} {next.title}</span>
        </button>
      ) : (
        <span />
      )}
    </nav>
  );
}
