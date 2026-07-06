"use client";

// =============================================================
// 《Redis 实战教程》- 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型书籍，无代码执行功能（Redis 需要独立服务）。
// 内容包含大量 redis-cli 命令示例，用 Markdown 代码块展示。
//
// 本书定位：
//   Redis 是最流行的内存数据库 / 缓存。本书覆盖安装、5+1 种数据结构、
//   持久化（RDB/AOF）、过期与淘汰、主从/哨兵/集群、
//   缓存模式、分布式锁、限流、消息队列、排行榜等应用场景，
//   以及性能优化与运维实战。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { redisChapters, redisChapterGroups } from "../redis-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function RedisBook() {
  const [activeId, setActiveId] = useState(redisChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    redisChapters.find((c) => c.id === activeId) || redisChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = redisChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = redisChapterGroups.map((group) => ({
    group,
    items: redisChapters.filter((c) => c.group === group),
  }));

  const idx = redisChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? redisChapters[idx - 1] : null;
  const nextChapter =
    idx < redisChapters.length - 1 ? redisChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={<p>🟥 Redis · 最流行的内存数据库与缓存</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          currentPath="/redis"
          meta={`共 ${redisChapters.length} 章 · Redis 实战`}
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
            <p>Redis 实战教程 · 覆盖日常开发全部知识 · 愿你的缓存又快又稳</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
