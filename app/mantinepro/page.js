"use client";

// =============================================================
// 《Mantine v9 深度实战》- 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型技术书籍页面，无代码编辑器，无运行按钮。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// 支持：上一章/下一章导航、移动端侧边栏抽屉、阅读位置记忆。
//
// 本书内容：
//   · Mantine 的设计理念与设计目的
//   · Theme 主题系统深度解析
//   · Form 表单验证（重点讲解 v9 的 schemaResolver + Zod）
// =============================================================

import { useState, useRef, useCallback } from "react";
import { mantineproChapters, mantineproChapterGroups } from "../courses-data/mantinepro-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";

export default function MantineProBook() {
  // 当前激活的章节 ID，默认第一章
  const [activeId, setActiveId] = useState(mantineproChapters[0].id);
  // 移动端侧边栏开关
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // 内容区 ref，用于阅读位置记忆
  const contentRef = useRef(null);

  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/mantinepro",
    contentRef,
    activeId
  );

  // 当前章节对象
  const activeChapter =
    mantineproChapters.find((c) => c.id === activeId) || mantineproChapters[0];

  // 选择章节
  const selectChapter = useCallback(
    (chapterId) => {
      const chapter = mantineproChapters.find((c) => c.id === chapterId);
      if (!chapter) return;
      saveCurrentBeforeSwitch();
      setActiveId(chapterId);
      setSidebarOpen(false);
    },
    [saveCurrentBeforeSwitch]
  );

  // 按分组组织章节，传给 Sidebar
  const groupedChapters = mantineproChapterGroups.map((group) => ({
    group,
    items: mantineproChapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = mantineproChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? mantineproChapters[idx - 1] : null;
  const nextChapter =
    idx < mantineproChapters.length - 1 ? mantineproChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="Mantine v9"
          tip="点击章节开始阅读"
          footer={
            <p>
              🎨 理念 · Theme · Form
              <br />
              📂 按 <kbd>Ctrl</kbd> + <kbd>B</kbd> 收起 / 展开目录
            </p>
          }
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          currentPath="/mantinepro"
          meta={`共 ${mantineproChapters.length} 章 · Mantine v9 深度实战指南`}
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
              《Mantine v9 深度实战》 · 理念 · Theme · Form ·
              基于 Mantine v9.4+ 编写，适用于 React 19 + Next.js 16 项目
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
