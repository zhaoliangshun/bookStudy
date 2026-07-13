"use client";

// =============================================================
// FastAPI 认证授权简化版教程页面
// -------------------------------------------------------------
// 主题：只讲干货，简单易懂的 FastAPI 认证授权
// 含代码编辑器与运行按钮，demo 在服务端 Python 沙箱中执行。
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { fastapiauthSimpleChapters, fastapiauthSimpleChapterGroups } from "../courses-data/fastapiauth-simple-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import CodeBlock from "../CodeBlock";
import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";

export default function FastapiAuthSimpleTutorial() {
  // 默认使用第一个章节作为初始状态（SSR 一致性）
  const initialChapter = fastapiauthSimpleChapters[0];

  const [activeId, setActiveId] = useState(initialChapter.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/fastapiauth-simple",
    contentRef,
    activeId
  );

  // 当前章节对象
  const activeChapter =
    fastapiauthSimpleChapters.find((c) => c.id === activeId) || fastapiauthSimpleChapters[0];

  // 客户端挂载后读取 URL hash
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const chapter = fastapiauthSimpleChapters.find((c) => c.id === hash);
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

  // 切换章节
  const selectChapter = useCallback((chapterId) => {
    const chapter = fastapiauthSimpleChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    // 切换前保存当前章的滚动位置，下次切回时能从这里继续阅读
    saveCurrentBeforeSwitch();
    setActiveId(chapterId);
    setSidebarOpen(false);
    // 不再强制 scrollTop = 0，由 useReadingScrollPosition 自动恢复
  }, [saveCurrentBeforeSwitch]);

  // 按分组组织章节
  const groupedChapters = fastapiauthSimpleChapterGroups.map((group) => ({
    group,
    items: fastapiauthSimpleChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏：章节导航 ===== */}
        <Sidebar
          title="学习目录"
          tip="点击章节开始学习"
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          currentPath="/fastapiauth-simple"
          meta={`共 ${fastapiauthSimpleChapters.length} 章 · 干货精简`}
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
            <CodeBlock code={activeChapter.code} lang="py" maxHeight={400} />
          </section>

          {/* 章节底部导航 */}
          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>
              FastAPI 认证授权精简版 · 只讲干货 · 代码在服务端沙箱中执行
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航组件 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = fastapiauthSimpleChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? fastapiauthSimpleChapters[idx - 1] : null;
  const next = idx < fastapiauthSimpleChapters.length - 1 ? fastapiauthSimpleChapters[idx + 1] : null;

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
