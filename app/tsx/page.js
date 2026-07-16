"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { tsxChapters, tsxChapterGroups } from "../courses-data/tsx-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import CodeBlock from "../CodeBlock";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";
export default function TsReactTutorial() {
  const initialChapter = tsxChapters[0];

  const [activeId, setActiveId] = useState(initialChapter.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);


  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/tsx",
    contentRef,
    activeId
  );
  const activeChapter =
    tsxChapters.find((c) => c.id === activeId) || tsxChapters[0];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const chapter = tsxChapters.find((c) => c.id === hash);
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
    const chapter = tsxChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    saveCurrentBeforeSwitch();
    setActiveId(chapterId);
    setSidebarOpen(false);
  }, [saveCurrentBeforeSwitch]);

  const groupedChapters = tsxChapterGroups.map((group) => ({
    group,
    items: tsxChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="学习目录"
          tip="点击章节开始学习 TypeScript + React"
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/tsx"
          meta={`共 ${tsxChapters.length} 章 · 日常开发常用模式`}
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
            <CodeBlock code={activeChapter.code} lang="tsx" maxHeight={600} />
          </section>

          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>
              TypeScript + React 实战教程 · 代码示例可直接复制到 React 项目中使用 · 涵盖 Props、Hooks、事件、自定义 Hook、Context、API 数据类型等核心知识点
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

function ChapterNav({ activeId, onSelect }) {
  const idx = tsxChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? tsxChapters[idx - 1] : null;
  const next = idx < tsxChapters.length - 1 ? tsxChapters[idx + 1] : null;

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
