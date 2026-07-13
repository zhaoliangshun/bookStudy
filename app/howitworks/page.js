"use client";

// =============================================================
// 计算机工作原理教程页面
// -------------------------------------------------------------
// 主题：面向开发者的计算机原理——代码是怎么跑起来的
// 纯内容阅读型教程，无代码编辑器，无运行按钮。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// =============================================================

import { useState, useRef, useCallback } from "react";
import { howitworksChapters, howitworksChapterGroups } from "../courses-data/howitworks-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";
export default function HowItWorksTutorial() {
  // ---------- 状态管理 ----------
  const [activeId, setActiveId] = useState(howitworksChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);


  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/howitworks",
    contentRef,
    activeId
  );
  // 当前章节对象
  const activeChapter =
    howitworksChapters.find((c) => c.id === activeId) || howitworksChapters[0];

  // ---------- 切换章节 ----------
  const selectChapter = useCallback((chapterId) => {
    const chapter = howitworksChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    saveCurrentBeforeSwitch();
    setActiveId(chapterId);
    setSidebarOpen(false);
  }, [saveCurrentBeforeSwitch]);

  // ---------- 按分组组织章节 ----------
  const groupedChapters = howitworksChapterGroups.map((group) => ({
    group,
    items: howitworksChapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = howitworksChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? howitworksChapters[idx - 1] : null;
  const nextChapter =
    idx < howitworksChapters.length - 1 ? howitworksChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <Sidebar
          title="学习目录"
          tip="点击章节开始阅读"
          footer={<p>💡 提示：理解原理，写出更好的代码</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/howitworks"
          meta={`共 ${howitworksChapters.length} 章 · 代码是怎么跑起来的`}
        />

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
              代码是怎么跑起来的 · 面向开发者的计算机原理 · 理解原理是成为优秀开发者的关键
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
