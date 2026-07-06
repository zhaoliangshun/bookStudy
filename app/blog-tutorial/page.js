"use client";

// =============================================================
// Blog 系统交互式教程页面（FastAPI + JWT + SQLAlchemy）
// -------------------------------------------------------------
// 路由：/blog-tutorial（与现有 /blog 博客应用区分开）
// 结构与 Go / pnpm 教程页面一致，区别：
//   1. 数据源：blogChapters / blogChapterGroups（来自 blog-tutorial-data）
//   2. 运行接口：/api/run-py（调用系统 python3 执行）
//   4. 文件名：playground.py
//
// 教程特色：每章 code 都是「真正可运行的 Python」，使用 FastAPI 的
//   TestClient 在进程内发起 HTTP 请求，因此无需启动 uvicorn 服务器
//   就能看到真实的 HTTP 状态码和 JSON 响应。JWT 章节会真实签发与
//   验证 token。
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { blogChapters, blogChapterGroups } from "../blog-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import CodeBlock from "../CodeBlock";

export default function BlogTutorial() {
  // ---------- 状态管理 ----------
  const [activeId, setActiveId] = useState(blogChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  // 当前章节对象
  const activeChapter =
    blogChapters.find((c) => c.id === activeId) || blogChapters[0];

  // ---------- 切换章节 ----------
  // CodeBlock 内部通过 useEffect 监听 initialCode 变化自动同步，
  // 这里只需切换 activeId，无需手动 setCode。
  const selectChapter = useCallback((chapterId) => {
    const chapter = blogChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  // 按分组组织章节
  const groupedChapters = blogChapterGroups.map((group) => ({
    group,
    items: blogChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏：章节导航 ===== */}
        <Sidebar
          title="学习目录"
          tip="从零搭建 FastAPI + JWT 博客系统"
          footer={<p>💡 提示：按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 运行代码</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          currentPath="/blog-tutorial"
          meta={`共 ${blogChapters.length} 章 · 在线运行 FastAPI + JWT 代码`}
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
            <CodeBlock code={activeChapter.code} lang="py" />
          </section>

          {/* 章节底部导航：上一章/下一章 */}
          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>
              Blog 系统教程 · FastAPI + JWT + SQLAlchemy · 代码在 python3 沙箱中真实运行（用 TestClient 无需启动服务器）
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航组件 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = blogChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? blogChapters[idx - 1] : null;
  const next = idx < blogChapters.length - 1 ? blogChapters[idx + 1] : null;

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
