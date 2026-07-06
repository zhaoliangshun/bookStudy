"use client";

// =============================================================
// 操作系统实战教程（服务器向）—— 页面组件
// -------------------------------------------------------------
// 与 py5/page.js 结构一致，差异点：
//   1. 数据源：osChapters / osChapterGroups（来自 os-tutorial-data.js）
//   3. 执行 API：/api/run-shell（POST { code } -> { output, error, exitCode }）
//   4. 编辑器文件名：example.sh，placeholder 改为 Shell 提示
//   5. 启动时 GET /api/run-shell 拿 bash 版本展示在侧边栏
//   6. 移除 Playground 按钮（playground 暂不支持 shell lang）
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { osChapters, osChapterGroups } from "../os-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import CodeBlock from "../CodeBlock";

export default function OSTutorial() {
  // 默认使用第一个章节作为初始状态。
  // 注意：不在渲染阶段读取 window.location.hash，否则 SSR 与客户端
  // 在 URL 带 hash 时渲染结果不一致，会触发 React hydration 错误。
  // URL hash 的处理放到 useEffect 中，在客户端挂载后再切换章节。
  const initialChapter = osChapters[0];

  const [activeId, setActiveId] = useState(initialChapter.id);
  const [shellVersion, setShellVersion] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  const activeChapter =
    osChapters.find((c) => c.id === activeId) || osChapters[0];

  // 客户端挂载后读取 URL hash：有效则切换到对应章节，无效则清除。
  // 这里读取 window 不会导致 hydration 错误，因为首次渲染已经完成。
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const chapter = osChapters.find((c) => c.id === hash);
    if (chapter) {
      const id = requestAnimationFrame(() => {
        setActiveId(hash);
      });
      return () => cancelAnimationFrame(id);
    } else {
      // hash 无效，清除它（跨页面跳转时可能残留）
      const url = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", url);
    }
  }, []);

  // 切换章节
  // CodeBlock 内部通过 useEffect 监听 initialCode 变化自动同步，
  // 这里只需切换 activeId，无需手动 setCode。
  const selectChapter = useCallback((chapterId) => {
    const chapter = osChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, []);

  // 启动时获取 bash 版本（GET /api/run-shell 返回 version）
  useEffect(() => {
    fetch("/api/run-shell")
      .then((r) => r.json())
      .then((d) => {
        if (d.version) {
          // 取第一行，如 "GNU bash, version 5.2.2(1)-release" -> "bash 5.2.2"
          const firstLine = d.version.split("\n")[0];
          setShellVersion(firstLine);
        }
      })
      .catch(() => {});
  }, []);

  // 按分组聚合章节
  const groupedChapters = osChapterGroups.map((group) => ({
    group,
    items: osChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="学习目录"
          tip={`操作系统实战教程 · ${osChapters.length} 章服务器运维 · 每章 demo 可在沙箱运行${shellVersion ? " (" + shellVersion + ")" : ""}`}
          footer={<p>Ctrl + Enter 运行代码 · 沙箱执行 bash</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          currentPath="/os"
          meta={`共 ${osChapters.length} 章 · 服务器运维实战`}
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
            <CodeBlock code={activeChapter.code} lang="sh" />
          </section>

          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>操作系统实战教程 · {osChapters.length} 章 {osChapterGroups.length} 分组 · 覆盖 Linux 服务器运维与部署核心场景</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// 上一章 / 下一章导航
function ChapterNav({ activeId, onSelect }) {
  const idx = osChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? osChapters[idx - 1] : null;
  const next = idx < osChapters.length - 1 ? osChapters[idx + 1] : null;

  return (
    <nav className="chapter-nav-bottom">
      {prev ? (
        <button className="nav-btn nav-prev" onClick={() => onSelect(prev.id)}>
          <span className="nav-dir">上一章</span>
          <span className="nav-title">{prev.title}</span>
        </button>
      ) : <span />}
      {next ? (
        <button className="nav-btn nav-next" onClick={() => onSelect(next.id)}>
          <span className="nav-dir">下一章</span>
          <span className="nav-title">{next.title}</span>
        </button>
      ) : <span />}
    </nav>
  );
}
