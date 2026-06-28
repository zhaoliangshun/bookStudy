"use client";

// =============================================================
// Tailwind CSS 交互式教程页面
// -------------------------------------------------------------
// 与 Node.js / TypeScript 教程页面的主要区别：
//   1. 数据源：twChapters / twChapterGroups
//   2. 没有"运行 API"——代码是 HTML 片段，前端用 iframe 直接渲染预览
//   3. 用 Tailwind Play CDN（https://cdn.tailwindcss.com）让 iframe 里的
//      class 实时生效，无需本地构建
//   4. 高亮器：highlightHtml（支持 HTML 标签 + Tailwind class 着色）
//   5. 输出区是 iframe 预览，而不是控制台文本
// =============================================================

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { twChapters, twChapterGroups } from "../tw-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import { highlightHtml } from "../html-highlight";
import SiteNav from "../components/SiteNav";

export default function TailwindTutorial() {
  // ---------- 状态管理 ----------
  const [activeId, setActiveId] = useState(twChapters[0].id);
  const [code, setCode] = useState(twChapters[0].code);
  const [previewKey, setPreviewKey] = useState(0); // 用于强制刷新 iframe
  const [hasRun, setHasRun] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const contentRef = useRef(null);
  const iframeRef = useRef(null);

  // 把当前 HTML 代码高亮成 HTML 字符串（用于叠加层渲染）
  const highlightedHTML = useMemo(
    () => highlightHtml(code) + "\n",
    [code]
  );

  // 编辑器滚动同步
  const handleEditorScroll = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = ta.scrollTop;
      highlightRef.current.scrollLeft = ta.scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = ta.scrollTop;
    }
  }, []);

  const activeChapter =
    twChapters.find((c) => c.id === activeId) || twChapters[0];

  // 构造预览用的完整 HTML 文档（含 Tailwind CDN）
  // 用户写的 code 片段会被塞进 body 里。如果 code 开头有
  // <script>tailwind.config = {...}</script>，会被正确执行。
  const previewDoc = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif; }
  </style>
</head>
<body>
${code}
</body>
</html>`;
  }, [code]);

  // ---------- 切换章节 ----------
  const selectChapter = useCallback((chapterId) => {
    const chapter = twChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setCode(chapter.code);
    setHasRun(false);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  // ---------- 运行（刷新预览） ----------
  // 与 JS/TS 教程不同，这里不调 API。直接刷新 iframe 的 srcdoc 即可。
  // 通过修改 previewKey 强制 React 重建 iframe，确保内容更新。
  const runPreview = useCallback(() => {
    setHasRun(true);
    setPreviewKey((k) => k + 1);
  }, []);

  // ---------- 重置代码 ----------
  const resetCode = useCallback(() => {
    setCode(activeChapter.code);
    setHasRun(false);
  }, [activeChapter]);

  // ---------- 键盘快捷键：Ctrl/Cmd + Enter 刷新预览 ----------
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runPreview();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [runPreview]);

  // ---------- Tab 键缩进 ----------
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.slice(0, start) + "  " + code.slice(end);
      setCode(newCode);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  };

  // 按分组组织章节
  const groupedChapters = twChapterGroups.map((group) => ({
    group,
    items: twChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <SiteNav currentPath="/tw" meta={`共 ${twChapters.length} 章 · 可在线编辑运行`} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="main-layout">
        {/* ===== 侧边栏：章节导航 ===== */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-inner">
            <div className="sidebar-header">
              <h2>学习目录</h2>
              <p className="sidebar-tip">点击章节开始学习 Tailwind CSS</p>
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
              <p>💡 提示：按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 刷新预览</p>
            </div>
          </div>
        </aside>

        {/* 移动端遮罩 */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ===== 主内容区 ===== */}
        <main className="content" ref={contentRef}>
          {/* 章节标题区 */}
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

          {/* Markdown 讲解区 */}
          <section className="lesson-section">
            <MarkdownRenderer content={activeChapter.content} />
          </section>

          {/* 代码编辑器区 */}
          <section className="editor-section">
            <div className="editor-header">
              <div className="editor-label">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
                <span className="editor-filename">preview.html</span>
              </div>
              <div className="editor-actions">
                <button
                  className="btn btn-secondary"
                  onClick={resetCode}
                  title="恢复章节初始代码"
                >
                  ↺ 重置
                </button>
                <button
                  className="btn btn-primary"
                  onClick={runPreview}
                >
                  ▶ 刷新预览
                </button>
              </div>
            </div>
            <div className="editor-wrap">
              {/* 行号显示 */}
              <div className="line-numbers" ref={lineNumbersRef}>
                {code.split("\n").map((_, i) => (
                  <div key={i} className="line-number">
                    {i + 1}
                  </div>
                ))}
              </div>
              {/* 编辑区：高亮层 + textarea 叠加 */}
              <div className="editor-area">
                <pre
                  ref={highlightRef}
                  className="editor-highlight"
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: highlightedHTML }}
                />
                <textarea
                  ref={textareaRef}
                  className="code-editor"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onScroll={handleEditorScroll}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  wrap="off"
                  placeholder="在这里编写 HTML + Tailwind class，可自由修改后刷新预览..."
                />
              </div>
            </div>
          </section>

          {/* 预览区（替代控制台） */}
          <section className="preview-section">
            <div className="preview-header">
              <span className="preview-title">实时预览</span>
              <span className="preview-hint">
                {hasRun ? "已刷新" : '点击"刷新预览"按钮查看效果'}
              </span>
            </div>
            <div className="preview-wrap">
              {hasRun ? (
                <iframe
                  key={previewKey}
                  ref={iframeRef}
                  className="preview-iframe"
                  srcDoc={previewDoc}
                  title="Tailwind 预览"
                  sandbox="allow-scripts"
                />
              ) : (
                <div className="preview-placeholder">
                  <span className="preview-placeholder-icon">▶</span>
                  <span>点击上方"刷新预览"按钮，或按 Ctrl+Enter 渲染 HTML</span>
                </div>
              )}
            </div>
          </section>

          {/* 章节底部导航：上一章/下一章 */}
          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>
              Tailwind CSS 交互式教程 · 代码在 iframe 中通过 Play CDN 实时渲染 · 支持 utility class / 响应式 / 暗黑模式 / 自定义配置
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航组件 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = twChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? twChapters[idx - 1] : null;
  const next = idx < twChapters.length - 1 ? twChapters[idx + 1] : null;

  return (
    <nav className="chapter-nav-bottom">
      {prev ? (
        <button className="nav-btn nav-prev" onClick={() => onSelect(prev.id)}>
          <span className="nav-dir">← 上一章</span>
          <span className="nav-title">{prev.icon} {prev.title}</span>
        </button>
      ) : (
        <span />
      )}
      {next ? (
        <button className="nav-btn nav-next" onClick={() => onSelect(next.id)}>
          <span className="nav-dir">下一章 →</span>
          <span className="nav-title">{next.icon} {next.title}</span>
        </button>
      ) : (
        <span />
      )}
    </nav>
  );
}
