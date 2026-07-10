"use client";

// =============================================================
// TypeScript 泛型专门教程页面
// -------------------------------------------------------------
// 主题：从最简单到最复杂，系统讲透 TypeScript 泛型
// 代码先经 TS 编译器转译（/api/run-ts），再在 vm 沙箱中执行。
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { tsgenChapters, tsgenChapterGroups } from "../tsgen-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import CodeBlock from "../CodeBlock";

export default function TSGenTutorial() {
  // 默认使用第一个章节作为初始状态。
  // 注意：不在渲染阶段读取 window.location.hash，否则 SSR 与客户端
  // 在 URL 带 hash 时渲染结果不一致，会触发 React hydration 错误。
  const initialChapter = tsgenChapters[0];

  const [activeId, setActiveId] = useState(initialChapter.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    tsgenChapters.find((c) => c.id === activeId) || tsgenChapters[0];

  // 客户端挂载后读取 URL hash：有效则切换到对应章节，无效则清除。
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const chapter = tsgenChapters.find((c) => c.id === hash);
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

  // ---------- 切换章节 ----------
  const selectChapter = useCallback((chapterId) => {
    const chapter = tsgenChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((open) => !open);
  }, []);

  // 按分组组织章节
  const groupedChapters = tsgenChapterGroups.map((group) => ({
    group,
    items: tsgenChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏：章节导航 ===== */}
          <Sidebar
            title="学习目录"
            tip="点击章节开始学习泛型"
            groupedChapters={groupedChapters}
            activeId={activeId}
            onSelectChapter={selectChapter}
            sidebarOpen={sidebarOpen}
            onCloseSidebar={() => setSidebarOpen(false)}
            onToggleSidebar={toggleSidebar}
            currentPath="/tsgen"
            meta={"共 " + tsgenChapters.length + " 章 · 从简单到复杂讲透泛型"}
          />

          {/* ===== 主内容区 ===== */}
          <main className="content" ref={contentRef}>
            {/* 章节标题区 */}
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

            {/* Markdown 讲解区 */}
            <section className="lesson-section">
              <MarkdownRenderer content={activeChapter.content} />
              <CodeBlock code={activeChapter.code} lang="ts" maxHeight={400} />
            </section>

            {/* 章节底部导航：上一章/下一章 */}
            <ChapterNav activeId={activeId} onSelect={selectChapter} />

            <footer className="content-footer">
              <p>
                TypeScript 泛型专门教程 · 代码先经 TS 编译器转译再在沙箱中执行 · 从基础到类型体操
              </p>
            </footer>
          </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航组件 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = tsgenChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? tsgenChapters[idx - 1] : null;
  const next = idx < tsgenChapters.length - 1 ? tsgenChapters[idx + 1] : null;

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
