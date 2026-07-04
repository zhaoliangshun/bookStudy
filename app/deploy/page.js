"use client";

// =============================================================
// Python 部署与运维实战教程 - 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型技术书籍页面，无代码编辑器。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// 代码块通过 MarkdownRenderer 中的 CodeBlock 组件提供
// 复制 / 运行 / 跳转 Playground 工具栏。
//
// 本书特色：
//   · 从 Git 版本控制到生产部署的完整运维链路
//   · 篇幅超大、讲解超详细，每个命令配多个 demo
//   · 覆盖：Git / GitHub / GitLab / Docker / Docker Compose
//          Linux 常用命令 / Nginx / Gunicorn / Uvicorn / CI/CD
//   · 面向 Python Web 应用部署，但命令通用
// =============================================================

import { useState, useRef, useCallback } from "react";
import { deployChapters, deployChapterGroups } from "../deploy-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function DeployBook() {
  const [activeId, setActiveId] = useState(deployChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    deployChapters.find((c) => c.id === activeId) || deployChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = deployChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = deployChapterGroups.map((group) => ({
    group,
    items: deployChapters.filter((c) => c.group === group),
  }));

  const idx = deployChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? deployChapters[idx - 1] : null;
  const nextChapter =
    idx < deployChapters.length - 1 ? deployChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={
            <p>
              🚀 共 {deployChapters.length} 章 · 从 Git 到生产部署的完整运维实战
            </p>
          }
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/deploy"
          meta={`共 ${deployChapters.length} 章 · Python 部署与运维`}
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
              Python 部署与运维实战 · 从 Git 版本控制到生产环境 CI/CD 全链路指南
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
