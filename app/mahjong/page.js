"use client";

// =============================================================
// 红中麻将快速胡牌技巧 - 书籍页面
// -------------------------------------------------------------
// 纯内容阅读型书籍，无代码编辑器，无运行按钮。
// 结构：侧边栏目录 + 主内容区 Markdown 渲染 + 翻页导航。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { mahjongChapters, mahjongChapterGroups } from "../mahjong-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import SiteNav from "../components/SiteNav";

export default function MahjongBook() {
  const [activeId, setActiveId] = useState(mahjongChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    mahjongChapters.find((c) => c.id === activeId) || mahjongChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = mahjongChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = mahjongChapterGroups.map((group) => ({
    group,
    items: mahjongChapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = mahjongChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? mahjongChapters[idx - 1] : null;
  const nextChapter =
    idx < mahjongChapters.length - 1 ? mahjongChapters[idx + 1] : null;

  const currentChapterNum = idx + 1;
  const totalChapters = mahjongChapters.length;

  return (
    <div className="app-shell">
      <SiteNav currentPath="/mahjong" onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-inner">
            <div className="sidebar-header">
              <h2>书籍目录</h2>
              <p className="sidebar-tip">共 {totalChapters} 章 · 点击章节阅读</p>
            </div>
            <nav className="chapter-nav">
              {groupedChapters.map(({ group, items }) => (
                <div key={group} className="chapter-group">
                  <div className="group-title">{group}</div>
                  <ul>
                    {items.map((ch, i) => {
                      const globalIdx = mahjongChapters.findIndex(
                        (c) => c.id === ch.id
                      );
                      return (
                        <li key={ch.id}>
                          <button
                            className={`chapter-item ${activeId === ch.id ? "active" : ""}`}
                            onClick={() => selectChapter(ch.id)}
                          >
                            <span className="chapter-icon">{ch.icon}</span>
                            <span className="chapter-title-text">
                              {globalIdx + 1}. {ch.title}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
            <div className="sidebar-footer">
              <p>💡 提示：本电子书为深度阅读内容</p>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ===== 主内容区 ===== */}
        <main className="content" ref={contentRef}>
          <div className="chapter-header">
            <div className="chapter-breadcrumb">
              <span>{activeChapter.group}</span>
              <span className="breadcrumb-sep">/</span>
              <span>第 {currentChapterNum} 章</span>
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

          {/* 上一章 / 下一章 导航 */}
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
              红中麻将快速胡牌技巧 · 第 {currentChapterNum} / {totalChapters} 章 ·
              助你成为麻将高手
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}