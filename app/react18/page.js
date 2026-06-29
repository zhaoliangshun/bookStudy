"use client";

// =============================================================
// React 18 新特性交互式教程页面
// -------------------------------------------------------------
// 结构与 Node.js / pnpm 教程页面一致，区别：
//   1. 数据源：react18Chapters / react18ChapterGroups（来自 react18-tutorial-data）
//   2. 运行接口：/api/run（在 Node.js vm 沙箱里执行纯 JS 代码）
//   3. 高亮器：highlightJavaScript（JS 语法高亮）
//   4. 文案：React 18 新特性、playground.js 文件名
//
// 说明：React 18 的并发渲染、Suspense、Hooks 等特性依赖浏览器 DOM
//   和 react 模块，无法直接在 Node 沙箱运行。因此每章的 code 字段
//   用纯 JS 模拟演示对应特性的底层原理（如用 setTimeout 模拟时间
//   切片、用 Promise 模拟 Suspense 数据获取），帮助理解机制。
// =============================================================

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { react18Chapters, react18ChapterGroups } from "../react18-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import { highlightJavaScript } from "../highlight";
import Sidebar from "../components/Sidebar";

export default function React18Tutorial() {
  // ---------- 状态管理 ----------
  // 当前选中的章节 id
  const [activeId, setActiveId] = useState(react18Chapters[0].id);
  // 代码编辑器中的代码（用户可修改）
  const [code, setCode] = useState(react18Chapters[0].code);
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
  const activeChapter =
    react18Chapters.find((c) => c.id === activeId) || react18Chapters[0];

  // ---------- 切换章节 ----------
  const selectChapter = useCallback((chapterId) => {
    const chapter = react18Chapters.find((c) => c.id === chapterId);
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

  // ---------- 键盘快捷键：Ctrl/Cmd + Enter 运行 ----------
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

  // ---------- Tab 键缩进 ----------
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      // JS 代码用 2 空格缩进
      const newCode = code.slice(0, start) + "  " + code.slice(end);
      setCode(newCode);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  };

  // 按分组组织章节
  const groupedChapters = react18ChapterGroups.map((group) => ({
    group,
    items: react18Chapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏：章节导航 ===== */}
        <Sidebar
          title="学习目录"
          tip="点击章节开始学习 React 18"
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
          currentPath="/react18"
          meta={`共 ${react18Chapters.length} 章 · 在线运行 JS 演示`}
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
                <span className="editor-filename">playground.js</span>
              </div>
              <div className="editor-actions">
                <button
                  className="btn btn-secondary"
                  onClick={resetCode}
                  disabled={isRunning}
                  title="恢复默认代码"
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
                  placeholder="在这里编写 JavaScript 代码，可以自由修改后运行..."
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
          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>
              React 18 新特性交互式教程 · JS 代码在 Node.js 沙箱中运行 · 涵盖并发渲染/自动批处理/startTransition/useTransition/useDeferredValue/Suspense/流式SSR/useId/useSyncExternalStore/useInsertionEffect/Strict Mode/迁移指南
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航组件 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = react18Chapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? react18Chapters[idx - 1] : null;
  const next = idx < react18Chapters.length - 1 ? react18Chapters[idx + 1] : null;

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
