"use client";

// =============================================================
// Vite 实战教程页面
// -------------------------------------------------------------
// 与其他教程页面（Sass / TypeScript / Go 等）保持一致的结构：
//   - 侧边栏：章节导航（按分组展示）
//   - 主内容区：Markdown 讲解 + 末尾 CodeBlock 演示代码
//   - code 字段是可在 Node 中运行的演示脚本，lang="js" 调用
//     /api/run 在线执行；完整 vite.config.js 等配置写在正文的
//     Markdown 代码块里供复制。
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { viteChapters, viteChapterGroups } from "../courses-data/vite-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import CodeBlock from "../CodeBlock";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";

export default function ViteTutorial() {
  // ---------- 状态管理 ----------
  // 默认使用第一个章节作为初始状态。
  // 不在渲染阶段读取 window.location.hash，否则 SSR 与客户端在
  // URL 带 hash 时渲染结果不一致，会触发 React hydration 错误。
  // URL hash 的处理放到 useEffect 中，在客户端挂载后再切换章节。
  const initialChapter = viteChapters[0];

  const [activeId, setActiveId] = useState(initialChapter.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/vite",
    contentRef,
    activeId
  );

  // 当前章节对象
  const activeChapter =
    viteChapters.find((c) => c.id === activeId) || viteChapters[0];

  // 客户端挂载后读取 URL hash：有效则切换到对应章节，无效则清除。
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const chapter = viteChapters.find((c) => c.id === hash);
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
  const selectChapter = useCallback(
    (chapterId) => {
      const chapter = viteChapters.find((c) => c.id === chapterId);
      if (!chapter) return;
      saveCurrentBeforeSwitch();
      setActiveId(chapterId);
      setSidebarOpen(false);
    },
    [saveCurrentBeforeSwitch]
  );

  // 按分组组织章节
  const groupedChapters = viteChapterGroups.map((group) => ({
    group,
    items: viteChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏：章节导航 ===== */}
        <Sidebar
          title="学习目录"
          tip="点击章节开始学习 Vite"
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/vite"
          meta={`共 ${viteChapters.length} 章 · 配置可复制 · 演示可运行`}
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

          {/* Markdown 讲解区 + 演示代码 */}
          <section className="lesson-section">
            <MarkdownRenderer content={activeChapter.content} />
            <CodeBlock code={activeChapter.code} lang="js" maxHeight={400} />
          </section>

          {/* 章节底部导航 */}
          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>
              Vite 实战教程 · 14 章覆盖创建项目 / 配置 / 代理 / 环境变量 / HMR / 插件 / 构建优化 / 部署 · 配置可直接复制到项目使用
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航组件 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = viteChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? viteChapters[idx - 1] : null;
  const next = idx < viteChapters.length - 1 ? viteChapters[idx + 1] : null;

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
