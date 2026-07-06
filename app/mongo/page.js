"use client";

// =============================================================
// 《MongoDB 实战教程》- 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型书籍，无代码执行功能（MongoDB 需要独立服务）。
// 内容包含大量 mongo shell / Node.js 驱动代码示例。
//
// 本书定位：
//   MongoDB 是最流行的文档型 NoSQL 数据库。本书覆盖安装、文档模型、
//   CRUD、查询进阶、聚合管道、索引、数据建模、副本集、分片、
//   性能优化、运维实战、应用场景等日常开发全部知识。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { mongoChapters, mongoChapterGroups } from "../mongo-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function MongoBook() {
  const [activeId, setActiveId] = useState(mongoChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    mongoChapters.find((c) => c.id === activeId) || mongoChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = mongoChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = mongoChapterGroups.map((group) => ({
    group,
    items: mongoChapters.filter((c) => c.group === group),
  }));

  const idx = mongoChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? mongoChapters[idx - 1] : null;
  const nextChapter =
    idx < mongoChapters.length - 1 ? mongoChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={<p>🍃 MongoDB · 最流行的文档型 NoSQL 数据库</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          currentPath="/mongo"
          meta={`共 ${mongoChapters.length} 章 · MongoDB 实战`}
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
            <p>MongoDB 实战教程 · 覆盖日常开发全部知识 · 愿你建模又灵活又稳</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
