"use client";

// =============================================================
// 《PostgreSQL 实战教程》- 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型书籍，无代码执行功能（PostgreSQL 需要独立数据库服务）。
// 内容包含大量 SQL 代码示例，用 Markdown 代码块展示。
//
// 本书定位：
//   与现有 /mysql（MySQL 实战）不同——本书专注 PostgreSQL，
//   覆盖安装配置、丰富数据类型、查询、索引（B-Tree/GIN/GiST/BRIN）、
//   事务与 MVCC、JSON/JSONB、数组、全文检索、PL/pgSQL、视图触发器、
//   流复制与逻辑复制、备份恢复、分区表、执行计划、扩展生态等
//   日常开发与运维全部知识。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { postgresChapters, postgresChapterGroups } from "../courses-data/postgres-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function PostgresBook() {
  const [activeId, setActiveId] = useState(postgresChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    postgresChapters.find((c) => c.id === activeId) || postgresChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = postgresChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = postgresChapterGroups.map((group) => ({
    group,
    items: postgresChapters.filter((c) => c.group === group),
  }));

  const idx = postgresChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? postgresChapters[idx - 1] : null;
  const nextChapter =
    idx < postgresChapters.length - 1 ? postgresChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={<p>🐘 PostgreSQL · 世界上最先进的开源关系型数据库</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          currentPath="/postgres"
          meta={`共 ${postgresChapters.length} 章 · PostgreSQL 实战`}
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
            <p>PostgreSQL 实战教程 · 覆盖日常开发与运维全部知识 · 愿你写出的 SQL 又快又稳</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
