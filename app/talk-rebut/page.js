"use client";

import { useState, useRef, useCallback } from "react";
import { talkRebuttalChapters, talkRebuttalChapterGroups } from "../courses-data/talk-rebut-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";
export default function TalkRebuttalBook() {
  const [activeId, setActiveId] = useState(talkRebuttalChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);


  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    "/talk-rebut",
    contentRef,
    activeId
  );
  const activeChapter =
    talkRebuttalChapters.find((c) => c.id === activeId) || talkRebuttalChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = talkRebuttalChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    saveCurrentBeforeSwitch();
    setActiveId(chapterId);
    setSidebarOpen(false);
  }, [saveCurrentBeforeSwitch]);

  const groupedChapters = talkRebuttalChapterGroups.map((group) => ({
    group,
    items: talkRebuttalChapters.filter((c) => c.group === group),
  }));

  const idx = talkRebuttalChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? talkRebuttalChapters[idx - 1] : null;
  const nextChapter =
    idx < talkRebuttalChapters.length - 1 ? talkRebuttalChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="目录"
          tip="学会绝地反击，保护自己"
          footer={<p>🗡️ 共 {talkRebuttalChapters.length} 章，犀利又不失风度</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/talk-rebut"
          meta={`共 ${talkRebuttalChapters.length} 章 · 谈话绝地反击`}
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
              🗡️ 谈话绝地反击 · {talkRebuttalChapters.length} 章实用话术 · 犀利但不失风度
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
