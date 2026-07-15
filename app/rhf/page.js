"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { rhfChapters, rhfChapterGroups } from "../courses-data/rhf-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import CodeBlock from "../CodeBlock";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";
export default function ReactHookFormTutorial() {
  const initialChapter = rhfChapters[0];

  const [activeId, setActiveId] = useState(initialChapter.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);


  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/rhf",
    contentRef,
    activeId
  );
  const activeChapter =
    rhfChapters.find((c) => c.id === activeId) || rhfChapters[0];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const chapter = rhfChapters.find((c) => c.id === hash);
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
    const chapter = rhfChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    saveCurrentBeforeSwitch();
    setActiveId(chapterId);
    setSidebarOpen(false);
  }, [saveCurrentBeforeSwitch]);

  const groupedChapters = rhfChapterGroups.map((group) => ({
    group,
    items: rhfChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="学习目录"
          tip="点击章节开始学习 React Hook Form"
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/rhf"
          meta={`共 ${rhfChapters.length} 章 · React 表单最佳实践`}
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
            <CodeBlock code={activeChapter.code} lang="jsx" maxHeight={600} />
          </section>

          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>
              React Hook Form 交互式教程 · 代码示例可直接复制到 React 项目中使用 · 涵盖 useForm、register、handleSubmit、Controller、Zod 验证等核心知识点
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

function ChapterNav({ activeId, onSelect }) {
  const idx = rhfChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? rhfChapters[idx - 1] : null;
  const next = idx < rhfChapters.length - 1 ? rhfChapters[idx + 1] : null;

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
