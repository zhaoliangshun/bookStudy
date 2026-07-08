// =============================================================
// Node.js 交互式教程主页面
// -------------------------------------------------------------
// 这是一个 Client Component（'use client'），因为需要：
//   - 状态管理（当前章节、代码内容、运行结果）
//   - 事件处理（切换章节、点击运行、修改代码）
//   - 浏览器交互（textarea 编辑、滚动）
//
// 页面结构：
//   ┌──────────┬─────────────────────────────┐
//   │  侧边栏   │       主内容区               │
//   │  章节列表 │  ┌─ Markdown 讲解 ─────────┐ │
//   │          │  └────────────────────────┘ │
//   │          │  ┌─ 代码编辑器 ────────────┐ │
//   │          │  │  [运行] [重置]           │ │
//   │          │  └────────────────────────┘ │
//   │          │  ┌─ 输出控制台 ────────────┐ │
//   │          │  └────────────────────────┘ │
//   └──────────┴─────────────────────────────┘
// =============================================================

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { chapters, chapterGroups } from "./tutorial-data";
import { MarkdownRenderer } from "./MarkdownRenderer";
import Sidebar from "./components/Sidebar";
import CodeBlock from "./CodeBlock";

export default function Home() {
  // ---------- 状态管理 ----------
  // 默认使用第一个章节作为初始状态。
  // 注意：不在渲染阶段读取 window.location.hash，否则 SSR 与客户端
  // 在 URL 带 hash 时渲染结果不一致，会触发 React hydration 错误。
  // URL hash 的处理放到 useEffect 中，在客户端挂载后再切换章节。
  const initialChapter = chapters[0];

  // 当前选中的章节 id
  const [activeId, setActiveId] = useState(initialChapter.id);
  // 侧边栏在移动端的展开状态
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 主内容区引用（用于切换章节时滚动到顶部）
  const contentRef = useRef(null);

  // 当前章节对象
  const activeChapter = chapters.find((c) => c.id === activeId) || chapters[0];

  // 客户端挂载后读取 URL hash：有效则切换到对应章节，无效则清除。
  // 这里读取 window 不会导致 hydration 错误，因为首次渲染已经完成。
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const chapter = chapters.find((c) => c.id === hash);
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
    const chapter = chapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    // 滚动内容区到顶部
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  // ---------- 切换侧边栏（供 Ctrl+B 快捷键在移动端使用） ----------
  // 桌面端的收起 / 展开由 Sidebar 内部 collapsed 状态管理，无需父组件参与；
  // 移动端抽屉需要父组件控制，故提供此 toggle 回调。
  // 用 useCallback 稳定引用，避免 Sidebar 内的 keydown 监听器频繁重注册。
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((open) => !open);
  }, []);

  // 按分组组织章节
  const groupedChapters = chapterGroups.map((group) => ({
    group,
    items: chapters.filter((c) => c.group === group),
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
          onToggleSidebar={toggleSidebar}
          currentPath="/"
          meta={`共 ${chapters.length} 章 · 可在线编辑运行`}
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
            <CodeBlock code={activeChapter.code} lang="js" maxHeight={400} />
          </section>

          {/* 章节底部导航：上一章/下一章 */}
          <ChapterNav
            activeId={activeId}
            onSelect={selectChapter}
          />

          <footer className="content-footer">
            <p>
              Node.js 交互式教程 · 代码在服务端沙箱中执行 · 支持 fs/path/crypto 等内置模块
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航组件 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = chapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;

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
