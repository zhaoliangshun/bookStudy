"use client";

// =============================================================
// 《MySQL 实战教程》- 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型书籍，无代码执行功能（MySQL 需要独立数据库服务）。
// 内容包含大量 SQL 代码示例，用 Markdown 代码块展示。
//
// 本书定位：
//   与现有 /sql（基于 SQLite 的可执行教程）不同——本书专注 MySQL，
//   覆盖安装配置、数据类型、查询、索引、事务、锁、主从复制、
//   读写分离、分库分表、性能优化、运维实战等日常开发全部知识。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { mysqlChapters, mysqlChapterGroups } from "../courses-data/mysql-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function MysqlBook() {
  const [activeId, setActiveId] = useState(mysqlChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    mysqlChapters.find((c) => c.id === activeId) || mysqlChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = mysqlChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = mysqlChapterGroups.map((group) => ({
    group,
    items: mysqlChapters.filter((c) => c.group === group),
  }));

  const idx = mysqlChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? mysqlChapters[idx - 1] : null;
  const nextChapter =
    idx < mysqlChapters.length - 1 ? mysqlChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={<p>🐬 MySQL · 最流行的开源关系型数据库</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          currentPath="/mysql"
          meta={`共 ${mysqlChapters.length} 章 · MySQL 实战`}
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
            <p>MySQL 实战教程 · 覆盖日常开发全部知识 · 愿你写出的 SQL 又快又稳</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
