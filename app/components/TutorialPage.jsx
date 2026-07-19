"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Sidebar from "./Sidebar";
import { useReadingScrollPosition } from "../hooks/useReadingScrollPosition";

const MarkdownRenderer = dynamic(
  () => import("../MarkdownRenderer"),
  {
    ssr: true,
    loading: () => <div className="md-body" style={{ padding: "20px 0", color: "var(--text-muted)" }}>正在加载内容...</div>,
  }
);

const CodeBlock = dynamic(
  () => import("../CodeBlock"),
  {
    ssr: false,
    loading: () => (
      <div className="md-code-block-wrap">
        <div className="md-code-toolbar">
          <div className="md-code-toolbar-left">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
        </div>
        <div className="md-code-editor-container" style={{ minHeight: "100px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "13px" }}>
          正在加载编辑器...
        </div>
      </div>
    ),
  }
);

export default function TutorialPage({
  chapters,
  chapterGroups,
  bookPath,
  bookTitle,
  defaultLang = "js",
  footerText,
  tip = "点击章节开始学习",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeId, setActiveId] = useState(chapters[0]?.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // 性能优化：readingProgress 只用于进度条 width，不影响渲染逻辑。
  // 之前用 setState 在每帧导致整个 TutorialPage 重渲。
  // 改为 useRef + 直接 DOM 操作，scroll 帧不再触发 React 更新。
  const progressBarRef = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const contentRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  const rafRef = useRef(null);

  // 章节阅读位置记忆：保存每章的滚动位置，切换回时自动恢复
  // bookPath 作为每本书的独立命名空间，避免不同书之间位置串扰
  const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
    bookPath,
    contentRef,
    activeId
  );

  const chaptersMap = useMemo(() => {
    const map = new Map();
    chapters.forEach((c) => map.set(c.id, c));
    return map;
  }, [chapters]);

  const activeChapter = useMemo(() => {
    return chaptersMap.get(activeId) || chapters[0];
  }, [activeId, chaptersMap, chapters]);

  const groupedChapters = useMemo(() => {
    return chapterGroups.map((group) => ({
      group,
      items: chapters.filter((c) => c.group === group),
    }));
  }, [chapters, chapterGroups]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    if (chaptersMap.has(hash)) {
      const id = requestAnimationFrame(() => {
        setActiveId(hash);
      });
      return () => cancelAnimationFrame(id);
    } else {
      const url = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", url);
    }
  }, [chaptersMap]);

  useEffect(() => {
    const path = pathname || bookPath;
    try {
      localStorage.setItem("sidebar:last-book", path);
      document.cookie = `last_book=${encodeURIComponent(path)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    } catch {}
  }, [pathname, bookPath]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const scrollTop = content.scrollTop;
        const scrollHeight = content.scrollHeight - content.clientHeight;
        const progress = scrollHeight > 0 ? Math.min((scrollTop / scrollHeight) * 100, 100) : 0;
        // 性能优化：直接更新 DOM，避免 setState 触发整页重渲染
        // （进度条每帧都变化，setState 会让 ScrollRestoration、CodeBlock、Markdown
        // 等大量子组件跟着重渲染，是显著的 CPU 浪费）
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${progress}%`;
        }
      });
    };

    content.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      content.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const selectChapter = useCallback((chapterId) => {
    if (!chaptersMap.has(chapterId)) return;

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    setIsTransitioning(true);

    // 切换前保存当前章的滚动位置，下次切回时能从这里继续阅读
    saveCurrentBeforeSwitch();

    setActiveId(chapterId);
    setSidebarOpen(false);

    // 不再强制 scrollTop = 0，由 useReadingScrollPosition 内部 effect
    // 根据保存的位置自动恢复（无保存记录时恢复到 0）

    try {
      window.history.replaceState(null, "", `#${chapterId}`);
    } catch {}

    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 150);
  }, [chaptersMap, saveCurrentBeforeSwitch]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((open) => !open);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "ArrowLeft") {
        e.preventDefault();
        const idx = chapters.findIndex((c) => c.id === activeId);
        if (idx > 0) {
          selectChapter(chapters[idx - 1].id);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "ArrowRight") {
        e.preventDefault();
        const idx = chapters.findIndex((c) => c.id === activeId);
        if (idx < chapters.length - 1) {
          selectChapter(chapters[idx + 1].id);
        }
      }
    };

    const isInInput = (e) => {
      const tag = e.target.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || e.target.closest(".monaco-editor");
    };

    const wrappedHandler = (e) => {
      if (!isInInput(e)) {
        handleKeyDown(e);
      }
    };

    document.addEventListener("keydown", wrappedHandler);
    return () => document.removeEventListener("keydown", wrappedHandler);
  }, [activeId, chapters, selectChapter]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const currentIdx = useMemo(() => {
    return chapters.findIndex((c) => c.id === activeId);
  }, [chapters, activeId]);

  const prevChapter = currentIdx > 0 ? chapters[currentIdx - 1] : null;
  const nextChapter = currentIdx < chapters.length - 1 ? chapters[currentIdx + 1] : null;

  const codeLang = activeChapter?.lang || defaultLang;

  return (
    <div className="app-shell">
      <style>{`
        .reading-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: var(--primary);
          z-index: 9999;
          transition: width 0.1s ease-out;
          box-shadow: 0 0 8px var(--primary);
        }
        .chapter-transition-enter {
          opacity: 0;
          transform: translateY(8px);
        }
        .chapter-transition-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.15s ease-out, transform 0.15s ease-out;
        }
        @media (max-width: 900px) {
          .reading-progress-bar {
            top: 0;
          }
        }
      `}</style>

      <div ref={progressBarRef} className="reading-progress-bar" style={{ width: "0%" }} />

      <div className="main-layout">
        <Sidebar
          title="学习目录"
          tip={tip}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={toggleSidebar}
          currentPath={bookPath}
          meta={`共 ${chapters.length} 章 · 可在线编辑运行`}
        />

        <main className="content" ref={contentRef}>
          <div
            className={isTransitioning ? "chapter-transition-enter" : "chapter-transition-active"}
          >
            <div className="chapter-header">
              <div className="chapter-breadcrumb">
                <span>{activeChapter?.group}</span>
                <span className="breadcrumb-sep">/</span>
                <span>{activeChapter?.title}</span>
              </div>
              <h1 className="chapter-main-title">
                <span className="chapter-main-icon">{activeChapter?.icon}</span>
                {activeChapter?.title}
              </h1>
              <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
                第 {Math.max(currentIdx + 1, 1)} / {chapters.length} 章 · Ctrl/Cmd + ←/→ 切换章节
              </div>
            </div>

            <section className="lesson-section">
              {activeChapter?.content && (
                <MarkdownRenderer content={activeChapter.content} />
              )}
              {activeChapter?.code && (
                <CodeBlock code={activeChapter.code} lang={codeLang} maxHeight={400} />
              )}
            </section>

            <nav className="chapter-nav-bottom">
              {prevChapter ? (
                <button className="nav-btn nav-prev" onClick={() => selectChapter(prevChapter.id)}>
                  <span className="nav-dir">← 上一章</span>
                  <span className="nav-title">{prevChapter.icon} {prevChapter.title}</span>
                </button>
              ) : (
                <span />
              )}
              {nextChapter ? (
                <button className="nav-btn nav-next" onClick={() => selectChapter(nextChapter.id)}>
                  <span className="nav-dir">下一章 →</span>
                  <span className="nav-title">{nextChapter.icon} {nextChapter.title}</span>
                </button>
              ) : (
                <span />
              )}
            </nav>

            <footer className="content-footer">
              <p>{footerText}</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
