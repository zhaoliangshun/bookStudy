"use client";

// =============================================================
// 怼人语录书籍 - 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型语录集页面,无代码编辑器,无运行按钮。
// 结构:侧边栏章节导航 + 主内容区 Markdown 渲染。
// 支持:上一章/下一章导航、移动端侧边栏抽屉。
// 本书特点:语句简短,格言体语录集。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { quotesChapters, quotesChapterGroups } from "../quotes-book-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import SiteNav from "../components/SiteNav";

export default function QuotesBook() {
  const [activeId, setActiveId] = useState(quotesChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    quotesChapters.find((c) => c.id === activeId) || quotesChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = quotesChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = quotesChapterGroups.map((group) => ({
    group,
    items: quotesChapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = quotesChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? quotesChapters[idx - 1] : null;
  const nextChapter =
    idx < quotesChapters.length - 1 ? quotesChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <SiteNav currentPath="/quotes" onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-inner">
            <div className="sidebar-header">
              <h2>目录</h2>
              <p className="sidebar-tip">点击章节开始阅读</p>
            </div>
            <nav className="chapter-nav">
              {groupedChapters.map(({ group, items }) => (
                <div key={group} className="chapter-group">
                  <div className="group-title">{group}</div>
                  <ul>
                    {items.map((ch) => (
                      <li key={ch.id}>
                        <button
                          className={`chapter-item ${activeId === ch.id ? "active" : ""}`}
                          onClick={() => selectChapter(ch.id)}
                        >
                          <span className="chapter-icon">{ch.icon}</span>
                          <span className="chapter-title-text">{ch.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
            <div className="sidebar-footer">
              <p>💡 一句话噎死人的艺术</p>
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
              怼人语录 · 一句话噎死人的艺术 · 言简意赅,一针见血
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
