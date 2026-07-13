"use client";

// =============================================================
// 《40岁前端的下半场》- 阅读页面
// -------------------------------------------------------------
// 纯内容阅读型书籍页面，无代码编辑器，无运行按钮。
// 结构：侧边栏章节导航 + 主内容区 Markdown 渲染。
// 支持：上一章/下一章导航、移动端侧边栏抽屉、URL hash 同步。
//
// 本书定位：
//   专门写给 40 岁左右、做了多年前端开发、突然或即将被裁的中年男人。
//   与现有《程序员职业出路》(通用规划)不同——本书聚焦"被裁之后怎么办"：
//   从情绪、财务、法律，到技能盘点、出路选择、求职实战、心态重建，
//   一本可以放在床头、被裁当晚就开始翻的实操指南。
//
// 读者画像：
//   - 35-45 岁男性，前端开发 10-15 年
//   - 上有老下有小，房贷车贷在身
//   - 技术不差但也不是大牛，title 多为高级/资深前端
//   - 突然接到 HR 谈话，或感觉风声不对
// =============================================================

import { useState, useRef, useCallback } from "react";
import { career40Chapters, career40ChapterGroups } from "../courses-data/career40-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";
export default function Career40Book() {
  const [activeId, setActiveId] = useState(career40Chapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);


  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/career40",
    contentRef,
    activeId
  );
  const activeChapter =
    career40Chapters.find((c) => c.id === activeId) || career40Chapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = career40Chapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    saveCurrentBeforeSwitch();
    setActiveId(chapterId);
    setSidebarOpen(false);
  }, [saveCurrentBeforeSwitch]);

  const groupedChapters = career40ChapterGroups.map((group) => ({
    group,
    items: career40Chapters.filter((c) => c.group === group),
  }));

  // 上一章 / 下一章
  const idx = career40Chapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? career40Chapters[idx - 1] : null;
  const nextChapter =
    idx < career40Chapters.length - 1 ? career40Chapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <Sidebar
          title="目录"
          tip="点击章节开始阅读"
          footer={<p>🌅 40 岁不是终点 · 是另一段人生的开始</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          currentPath="/career40"
          meta={`共 ${career40Chapters.length} 章 · 给被裁的中年前端`}
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
              40岁前端的下半场 · 写给每一个被裁后仍在寻找出路的男人 · 愿你度过这一关，仍能挺直腰板
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
