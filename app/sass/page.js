"use client";

// =============================================================
// Sass 交互式教程页面
// -------------------------------------------------------------
// 与其他教程页面（Python / TypeScript / GraphQL 等）保持一致：
//   - 章节末尾的代码 demo 直接复用 CodeBlock 组件
//   - 调 /api/run-sass 把 SCSS 编译成 CSS，作为运行结果输出
//   - 无独立编辑器、无背景色、无 iframe 预览，与教程内的代码块完全一致
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { sassChapters, sassChapterGroups } from "../sass-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import CodeBlock from "../CodeBlock";

export default function SassTutorial() {
  // ---------- 状态管理 ----------
  // 默认使用第一个章节作为初始状态。
  // 注意：不在渲染阶段读取 window.location.hash，否则 SSR 与客户端
  // 在 URL 带 hash 时渲染结果不一致，会触发 React hydration 错误。
  // URL hash 的处理放到 useEffect 中，在客户端挂载后再切换章节。
  const initialChapter = sassChapters[0];

  const [activeId, setActiveId] = useState(initialChapter.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  // 当前章节对象
  const activeChapter =
    sassChapters.find((c) => c.id === activeId) || sassChapters[0];

  // 客户端挂载后读取 URL hash：有效则切换到对应章节，无效则清除。
  // 这里读取 window 不会导致 hydration 错误，因为首次渲染已经完成。
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const chapter = sassChapters.find((c) => c.id === hash);
    if (chapter) {
      const id = requestAnimationFrame(() => {
        setActiveId(hash);
      });
      return () => cancelAnimationFrame(id);
    } else {
      // hash 无效，清除它（跨页面跳转时可能残留）
      const url = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", url);
    }
  }, []);

  // ---------- 切换章节 ----------
  // CodeBlock 内部通过 useEffect 监听 initialCode 变化自动同步，
  // 这里只需切换 activeId，无需手动 setCode。
  const selectChapter = useCallback((chapterId) => {
    const chapter = sassChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    // 切换章节后滚动到顶部
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  // 按分组组织章节
  const groupedChapters = sassChapterGroups.map((group) => ({
    group,
    items: sassChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏：章节导航 ===== */}
        <Sidebar
          title="学习目录"
          tip="点击章节开始学习 Sass"
          footer={<p>💡 提示：按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 编译运行</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/sass"
          meta={`共 ${sassChapters.length} 章 · 在线编译运行`}
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
            <CodeBlock code={activeChapter.code} lang="scss" />
          </section>

          {/* 章节底部导航 */}
          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>
              Sass 交互式教程 · SCSS 由 dart-sass 编译成 CSS · 支持变量/嵌套/混入/继承/控制指令/函数，编译错误带行号提示
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航组件 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = sassChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? sassChapters[idx - 1] : null;
  const next = idx < sassChapters.length - 1 ? sassChapters[idx + 1] : null;

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
