"use client";

// =============================================================
// GraphQL 交互式教程页面
// -------------------------------------------------------------
// 结构与 JS/TS/Python 教程页面基本一致，区别：
//   1. 数据源：gqlChapters / gqlChapterGroups（来自 gql-tutorial-data）
//   2. 运行接口：/api/run-gql（构建 Schema + 执行 Query）
//   3. 高亮器：highlightGraphQL（支持 query/mutation/type/$
//      变量/@指令/内置标量类型等）
//   4. 文案：GraphQL 教程、.graphql 文件名
//   5. 输出区显示 JSON 格式的 data/errors
// =============================================================

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { gqlChapters, gqlChapterGroups } from "../gql-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import { highlightGraphQL } from "../gql-highlight";
import SiteNav from "../components/SiteNav";
import Sidebar from "../components/Sidebar";

export default function GraphQLTutorial() {
  // ---------- 状态管理 ----------
  const [activeId, setActiveId] = useState(gqlChapters[0].id);
  const [code, setCode] = useState(gqlChapters[0].code);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const contentRef = useRef(null);

  // 把当前代码高亮成 HTML
  const highlightedHTML = useMemo(
    () => highlightGraphQL(code) + "\n",
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
    gqlChapters.find((c) => c.id === activeId) || gqlChapters[0];

  // ---------- 切换章节 ----------
  const selectChapter = useCallback((chapterId) => {
    const chapter = gqlChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setCode(chapter.code);
    setOutput("");
    setError("");
    setHasRun(false);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  // ---------- 执行查询 ----------
  // 调用 /api/run-gql，后端构建 Schema + 执行 Query
  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput("正在构建 Schema 并执行查询...");
    setError("");
    try {
      const res = await fetch("/api/run-gql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      // 格式化 JSON 输出
      let outputText = "";
      if (data.data !== null && data.data !== undefined) {
        outputText += "// === 查询结果 (data) ===\n";
        outputText += JSON.stringify(data.data, null, 2);
      }
      if (data.errors && data.errors.length > 0) {
        outputText += "\n\n// === 错误 (errors) ===\n";
        outputText += data.errors.map((e) => e.message).join("\n");
      }
      if (!data.data && (!data.errors || data.errors.length === 0)) {
        outputText += "(无返回数据)";
      }

      setOutput(outputText);
      setError("");
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
      localStorage.setItem("playground:code:gql", code);
    } catch {}
    window.open(`/playground?lang=gql`, "_blank", "noopener,noreferrer");
  }, [code]);

  // ---------- 键盘快捷键 ----------
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
      const newCode = code.slice(0, start) + "  " + code.slice(end);
      setCode(newCode);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  };

  const groupedChapters = gqlChapterGroups.map((group) => ({
    group,
    items: gqlChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <SiteNav currentPath="/gql" meta={`共 ${gqlChapters.length} 章 · 在线查询执行`} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <Sidebar
          title="学习目录"
          tip="点击章节开始学习 GraphQL"
          footer={<p>💡 提示：按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 执行查询</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
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

          {/* 代码编辑器 */}
          <section className="editor-section">
            <div className="editor-header">
              <div className="editor-label">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
                <span className="editor-filename">schema.graphql</span>
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
                  {isRunning ? "⏳ 执行中..." : "▶ 执行查询"}
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
              <div className="line-numbers" ref={lineNumbersRef}>
                {code.split("\n").map((_, i) => (
                  <div key={i} className="line-number">
                    {i + 1}
                  </div>
                ))}
              </div>
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
                  placeholder="在这里编写 GraphQL Schema + Resolvers + Query，点击「执行查询」..."
                />
              </div>
            </div>
          </section>

          {/* 输出控制台 */}
          <section className="console-section">
            <div className="console-header">
              <span className="console-title">查询结果</span>
              <span className="console-hint">
                {isRunning ? "执行中..." : hasRun ? "执行完成" : "点击执行查询查看结果"}
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
                  <span className="placeholder-icon">⚡</span>
                  <span>点击上方"执行查询"按钮，或按 Ctrl+Enter 执行 GraphQL 查询</span>
                </div>
              )}
            </div>
          </section>

          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>
              GraphQL 交互式教程 · 代码包含 Schema 定义 + Resolver 解析器 + Query 查询 · 后端用 graphql 包构建并执行，返回 JSON
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = gqlChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? gqlChapters[idx - 1] : null;
  const next = idx < gqlChapters.length - 1 ? gqlChapters[idx + 1] : null;

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