// =============================================================
// Node.js 交互式教程主页面
// -------------------------------------------------------------
// 这是一个 Client Component（'use client'），因为需要：
//   - 状态管理（当前章节、代码内容、运行结果）
//   - 事件处理（切换章节、点击运行、修改代码）
//   - 浏览器交互（textarea 编辑、滚动）
//
// 页面结构：
//   ┌──────────┬─────────────────────────────┐
//   │  侧边栏   │       主内容区               │
//   │  章节列表 │  ┌─ Markdown 讲解 ─────────┐ │
//   │          │  └────────────────────────┘ │
//   │          │  ┌─ 代码编辑器 ────────────┐ │
//   │          │  │  [运行] [重置]           │ │
//   │          │  └────────────────────────┘ │
//   │          │  ┌─ 输出控制台 ────────────┐ │
//   │          │  └────────────────────────┘ │
//   └──────────┴─────────────────────────────┘
// =============================================================

"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { chapters, chapterGroups } from "./tutorial-data";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { highlightJavaScript } from "./highlight";
import Sidebar from "./components/Sidebar";

export default function Home() {
  // ---------- 状态管理 ----------
  // 当前选中的章节 id
  const [activeId, setActiveId] = useState(chapters[0].id);
  // 代码编辑器中的代码（用户可修改）
  const [code, setCode] = useState(chapters[0].code);
  // 运行输出结果
  const [output, setOutput] = useState("");
  // 运行错误信息
  const [error, setError] = useState("");
  // 是否正在运行中
  const [isRunning, setIsRunning] = useState(false);
  // 是否已运行过（用于控制台初始提示）
  const [hasRun, setHasRun] = useState(false);
  // 侧边栏在移动端的展开状态
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 代码编辑器 textarea 的引用（用于支持 Tab 键缩进）
  const textareaRef = useRef(null);
  // 高亮层 <pre> 的引用（用于和 textarea 同步滚动）
  const highlightRef = useRef(null);
  // 行号容器的引用（同样需要同步滚动）
  const lineNumbersRef = useRef(null);
  // 主内容区引用（用于切换章节时滚动到顶部）
  const contentRef = useRef(null);

  // 把当前代码高亮成 HTML，用 useMemo 缓存，避免每次渲染都重新计算。
  // 末尾补一个换行，保证最后一行代码下方的留白和高亮层与 textarea 对齐。
  const highlightedHTML = useMemo(
    () => highlightJavaScript(code) + "\n",
    [code]
  );

  // 编辑器滚动同步：textarea 滚动时，让高亮层和行号跟着一起滚。
  // 三者用相同的字体度量/padding，所以 scrollTop/scrollLeft 可以直接复用。
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

  // 当前章节对象
  const activeChapter = chapters.find((c) => c.id === activeId) || chapters[0];

  // ---------- 切换章节 ----------
  const selectChapter = useCallback((chapterId) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setCode(chapter.code);
    setOutput("");
    setError("");
    setHasRun(false);
    setSidebarOpen(false);
    // 滚动内容区到顶部
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  // ---------- 切换侧边栏（供 Ctrl+B 快捷键在移动端使用） ----------
  // 桌面端的收起 / 展开由 Sidebar 内部 collapsed 状态管理，无需父组件参与；
  // 移动端抽屉需要父组件控制，故提供此 toggle 回调。
  // 用 useCallback 稳定引用，避免 Sidebar 内的 keydown 监听器频繁重注册。
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((open) => !open);
  }, []);

  // ---------- 运行代码 ----------
  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput("正在执行...");
    setError("");
    try {
      // 向 /api/run 发送代码，等待执行结果
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setOutput(data.output || "(无输出)");
      setError(data.error || "");
    } catch (err) {
      setError("请求失败: " + err.message);
      setOutput("");
    } finally {
      setIsRunning(false);
      setHasRun(true);
    }
  }, [code]);

  // ---------- 重置代码 ----------
  const resetCode = useCallback(() => {
    setCode(activeChapter.code);
    setOutput("");
    setError("");
    setHasRun(false);
  }, [activeChapter]);

  // ---------- 在 Playground 中打开 ----------
  const handlePlayground = useCallback(() => {
    try {
      localStorage.setItem("playground:code:node", code);
    } catch {}
    window.open(`/playground?lang=node`, "_blank", "noopener,noreferrer");
  }, [code]);

  // ---------- 键盘快捷键 ----------
  // Ctrl/Cmd + Enter 运行代码
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [runCode]);

  // ---------- 代码编辑器：支持 Tab 键缩进 ----------
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      // 在光标处插入两个空格
      const newCode = code.slice(0, start) + "  " + code.slice(end);
      setCode(newCode);
      // 把光标移到插入位置之后
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  };

  // 按分组组织章节
  const groupedChapters = chapterGroups.map((group) => ({
    group,
    items: chapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏：章节导航 ===== */}
        <Sidebar
          title="学习目录"
          tip="点击章节开始学习"
          footer={
            <p>
              💡 提示：按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 运行代码
              <br />
              📂 按 <kbd>Ctrl</kbd> + <kbd>B</kbd> 收起 / 展开目录
            </p>
          }
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={toggleSidebar}
          currentPath="/"
          meta={`共 ${chapters.length} 章 · 可在线编辑运行`}
        />

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
                <span className="editor-filename">example.js</span>
              </div>
              <div className="editor-actions">
                <button
                  className="btn btn-secondary"
                  onClick={resetCode}
                  disabled={isRunning}
                  title="恢复章节初始代码"
                >
                  ↺ 重置
                </button>
                <button
                  className="btn btn-primary"
                  onClick={runCode}
                  disabled={isRunning}
                >
                  {isRunning ? "⏳ 执行中..." : "▶ 运行代码"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handlePlayground}
                  title="在 Playground 中打开"
                >
                  🚀 Playground
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
                {/*
                  高亮层：放在 textarea 下方（z-index 较低），渲染彩色代码。
                  aria-hidden 对屏幕阅读器隐藏，因为 textarea 才是真正的可编辑内容。
                  dangerouslySetInnerHTML 直接注入高亮后的 HTML（已做转义，安全）。
                */}
                <pre
                  ref={highlightRef}
                  className="editor-highlight"
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: highlightedHTML }}
                />
                {/*
                  textarea：放在高亮层上方（z-index 较高），文字颜色设为透明，
                  只保留光标 (caret-color)，用户「看到」的是下层的高亮代码，
                  但「编辑」的依然是这个 textarea 里的原始文本。
                  onScroll 用于把滚动量同步给高亮层和行号。
                */}
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
                  placeholder="在这里编写 Node.js 代码，可以自由修改后运行..."
                />
              </div>
            </div>
          </section>

          {/* 输出控制台 */}
          <section className="console-section">
            <div className="console-header">
              <span className="console-title">控制台输出</span>
              <span className="console-hint">
                {isRunning ? "执行中..." : hasRun ? "执行完成" : "点击运行查看结果"}
              </span>
            </div>
            <div className="console-body">
              {output && (
                <pre className={`console-output ${error ? "has-error" : ""}`}>
                  {output}
                </pre>
              )}
              {error && (
                <pre className="console-error">
                  <span className="error-label">错误:</span>
                  {"\n"}
                  {error}
                </pre>
              )}
              {!hasRun && !isRunning && (
                <div className="console-placeholder">
                  <span className="placeholder-icon">▶</span>
                  <span>点击上方"运行代码"按钮，或按 Ctrl+Enter 执行代码</span>
                </div>
              )}
            </div>
          </section>

          {/* 章节底部导航：上一章/下一章 */}
          <ChapterNav
            activeId={activeId}
            onSelect={selectChapter}
          />

          <footer className="content-footer">
            <p>
              Node.js 交互式教程 · 代码在服务端沙箱中执行 · 支持 fs/path/crypto 等内置模块
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航组件 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = chapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;

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
