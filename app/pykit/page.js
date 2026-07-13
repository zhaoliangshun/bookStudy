"use client";

// =============================================================
// Python 开发常用知识点（pykit）交互式页面
// -------------------------------------------------------------
// 聚焦日常开发最高频使用的 Python 知识点，总结性 + 实用 demo。
//   1. 数据源：pykitChapters / pykitChapterGroups（来自 pykit-tutorial-data）
//   2. 运行接口：/api/run-py（由 CodeBlock 内部调用）
//   3. 底部 demo 直接复用 CodeBlock 组件
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { pykitChapters, pykitChapterGroups } from "../courses-data/pykit-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import CodeBlock from "../CodeBlock";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";
export default function PyKitTutorial() {
  // 默认使用第一个章节作为初始状态。
  // 注意：不在渲染阶段读取 window.location.hash，否则 SSR 与客户端
  // 在 URL 带 hash 时渲染结果不一致，会触发 React hydration 错误。
  const initialChapter = pykitChapters[0];

  const [activeId, setActiveId] = useState(initialChapter.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);


  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/pykit",
    contentRef,
    activeId
  );
  // 当前章节对象
  const activeChapter =
    pykitChapters.find((c) => c.id === activeId) || pykitChapters[0];

  // 客户端挂载后读取 URL hash
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const chapter = pykitChapters.find((c) => c.id === hash);
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
    const chapter = pykitChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    saveCurrentBeforeSwitch();
    setActiveId(chapterId);
    setSidebarOpen(false);
  }, [saveCurrentBeforeSwitch]);

  // 按分组组织章节
  const groupedChapters = pykitChapterGroups.map((group) => ({
    group,
    items: pykitChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏：章节导航 ===== */}
        <Sidebar
          title="学习目录"
          tip="点击章节开始学习 Python 开发常用知识点"
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          currentPath="/pykit"
          meta={`共 ${pykitChapters.length} 章 · 常用知识点 + 实战 demo`}
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

          {/* 章节底部导航：上一章/下一章 */}
          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>
              Python 开发常用知识点 · 代码由系统 python3 子进程执行 · 每行代码都有注释，demo 驱动学实战
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航组件 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = pykitChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? pykitChapters[idx - 1] : null;
  const next = idx < pykitChapters.length - 1 ? pykitChapters[idx + 1] : null;

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
