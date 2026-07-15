"use client";

// =============================================================
// 《Python工作实战手册》页面
// -------------------------------------------------------------
// 聚焦工作中高频使用的 Python 知识，多 demo、多注释、可运行。
//   1. 数据源：pythonWorkChapters / pythonWorkChapterGroups
//   2. 运行接口：/api/run-py（由 CodeBlock 内部调用）
//   3. 代码通过 CodeBlock 组件展示并支持运行
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { pythonWorkChapters, pythonWorkChapterGroups } from "../courses-data/python-work-book-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import CodeBlock from "../CodeBlock";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";

export default function PythonWorkBook() {
  const initialChapter = pythonWorkChapters[0];

  const [activeId, setActiveId] = useState(initialChapter.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/python-work",
    contentRef,
    activeId
  );

  const activeChapter =
    pythonWorkChapters.find((c) => c.id === activeId) || pythonWorkChapters[0];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const chapter = pythonWorkChapters.find((c) => c.id === hash);
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
    const chapter = pythonWorkChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    saveCurrentBeforeSwitch();
    setActiveId(chapterId);
    setSidebarOpen(false);
  }, [saveCurrentBeforeSwitch]);

  const groupedChapters = pythonWorkChapterGroups.map((group) => ({
    group,
    items: pythonWorkChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="学习目录"
          tip="点击章节开始学习 Python 工作实战"
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          currentPath="/python-work"
          meta={`共 ${pythonWorkChapters.length} 章 · 工作常用 + 可运行 demo`}
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
            <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
              第 {Math.max(pythonWorkChapters.findIndex(c => c.id === activeId) + 1, 1)} / {pythonWorkChapters.length} 章 · Ctrl/Cmd + ←/→ 切换章节
            </div>
          </div>

          <section className="lesson-section">
            <MarkdownRenderer content={activeChapter.content} />
            {activeChapter.code && (
              <CodeBlock code={activeChapter.code} lang="py" maxHeight={500} />
            )}
          </section>

          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>
              Python工作实战手册 · 代码由系统 python3 子进程执行 · 多demo多注释，学完就能用
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

function ChapterNav({ activeId, onSelect }) {
  const idx = pythonWorkChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? pythonWorkChapters[idx - 1] : null;
  const next = idx < pythonWorkChapters.length - 1 ? pythonWorkChapters[idx + 1] : null;

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
