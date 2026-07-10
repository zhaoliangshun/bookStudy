"use client";

// =============================================================
// Python Web 后端开发实战教程（全新版）- 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型技术书籍页面，无代码编辑器。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// 代码块通过 MarkdownRenderer 中的 CodeBlock 组件提供
// 复制 / 运行 / 跳转 Playground 工具栏。
// 章节状态通过 URL hash 持久化（由 Sidebar 组件统一处理）。
//
// 本书特色：
//   · 以 FastAPI 为核心，串联 HTTP / REST / WSGI / ASGI / ORM 全栈知识
//   · 篇幅超大、讲解超详细，每个知识点配多个 demo
//   · Django 中等篇幅，Flask 简略了解
//   · 覆盖：路由、请求响应、中间件、依赖注入、JWT/OAuth2、
//          文件上传、CORS、WebSocket、SQLAlchemy ORM
// =============================================================

import { useState, useRef, useCallback } from "react";
import { pyweb2Chapters, pyweb2ChapterGroups } from "../courses-data/pyweb2-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function PyWeb2Book() {
  const [activeId, setActiveId] = useState(pyweb2Chapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    pyweb2Chapters.find((c) => c.id === activeId) || pyweb2Chapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = pyweb2Chapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = pyweb2ChapterGroups.map((group) => ({
    group,
    items: pyweb2Chapters.filter((c) => c.group === group),
  }));

  const idx = pyweb2Chapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? pyweb2Chapters[idx - 1] : null;
  const nextChapter =
    idx < pyweb2Chapters.length - 1 ? pyweb2Chapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={
            <p>
              💡 共 {pyweb2Chapters.length} 章 · FastAPI 为核心的 Python Web
              后端全栈实战
            </p>
          }
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/pyweb2"
          meta={`共 ${pyweb2Chapters.length} 章 · Python Web 后端开发（全新版）`}
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
          </section>

          <nav className="chapter-nav-bottom">
            {prevChapter ? (
              <button
                className="nav-btn nav-prev"
                onClick={() => selectChapter(prevChapter.id)}
              >
                <span className="nav-dir">← 上一章</span>
                <span className="nav-title">
                  {prevChapter.icon} {prevChapter.title}
                </span>
              </button>
            ) : (
              <span />
            )}
            {nextChapter ? (
              <button
                className="nav-btn nav-next"
                onClick={() => selectChapter(nextChapter.id)}
              >
                <span className="nav-dir">下一章 →</span>
                <span className="nav-title">
                  {nextChapter.icon} {nextChapter.title}
                </span>
              </button>
            ) : (
              <span />
            )}
          </nav>

          <footer className="content-footer">
            <p>
              Python Web 后端开发实战（全新版）· 以 FastAPI 为核心的全栈指南 ·
              HTTP / REST / ORM / 认证 / WebSocket
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
