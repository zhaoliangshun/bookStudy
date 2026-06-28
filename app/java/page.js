"use client";

// =============================================================
// Java 交互式教程页面
// -------------------------------------------------------------
// 结构与 Node.js / TypeScript / Python 教程页面基本一致，区别：
//   1. 数据源：javaChapters / javaChapterGroups（来自 java-tutorial-data）
//   2. 运行接口：/api/run-java（调用系统 javac 编译 + java 运行）
//   3. 高亮器：highlightJava（支持 public/class/static 等关键字、
//      注解 @Override、Javadoc 注释、char 字面量、类型名）
//   4. 文案：Java 教程、Main.java 文件名
// =============================================================

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { javaChapters, javaChapterGroups } from "../java-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import { highlightJava } from "../java-highlight";
import SiteNav from "../components/SiteNav";

export default function JavaTutorial() {
  // ---------- 状态管理 ----------
  const [activeId, setActiveId] = useState(javaChapters[0].id);
  const [code, setCode] = useState(javaChapters[0].code);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const contentRef = useRef(null);

  // 把当前代码高亮成 HTML（用 Java 高亮器，含 public/class 等关键字）
  const highlightedHTML = useMemo(
    () => highlightJava(code) + "\n",
    [code]
  );

  // 编辑器滚动同步：textarea 滚动时，让高亮层和行号跟着一起滚
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
    javaChapters.find((c) => c.id === activeId) || javaChapters[0];

  // ---------- 切换章节 ----------
  const selectChapter = useCallback((chapterId) => {
    const chapter = javaChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setCode(chapter.code);
    setOutput("");
    setError("");
    setHasRun(false);
    setSidebarOpen(false);
    // 切换章节后滚动到顶部
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  // ---------- 运行代码 ----------
  // 调用 /api/run-java，后端用 javac 编译 + java 运行，返回 stdout/stderr
  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput("正在编译并执行 Java 代码...");
    setError("");
    try {
      const res = await fetch("/api/run-java", {
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
      // Java 惯用 4 空格缩进
      const newCode = code.slice(0, start) + "    " + code.slice(end);
      setCode(newCode);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      });
    }
  };

  // 按分组组织章节
  const groupedChapters = javaChapterGroups.map((group) => ({
    group,
    items: javaChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <SiteNav currentPath="/java" meta={`共 ${javaChapters.length} 章 · 在线编译运行`} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="main-layout">
        {/* ===== 侧边栏：章节导航 ===== */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-inner">
            <div className="sidebar-header">
              <h2>学习目录</h2>
              <p className="sidebar-tip">点击章节开始学习 Java</p>
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
              <p>💡 提示：按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 运行代码</p>
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
                <span className="editor-filename">Main.java</span>
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
                  {isRunning ? "⏳ 编译中..." : "▶ 运行代码"}
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
                  placeholder="在这里编写 Java 代码，可以自由修改后运行..."
                />
              </div>
            </div>
          </section>

          {/* 输出控制台 */}
          <section className="console-section">
            <div className="console-header">
              <span className="console-title">控制台输出</span>
              <span className="console-hint">
                {isRunning ? "编译执行中..." : hasRun ? "执行完成" : "点击运行查看结果"}
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
              Java 交互式教程 · 代码由系统 javac 编译 + java 运行 · 支持 OOP/泛型/集合/多线程/Lambda/Stream，含超时保护
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航组件 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = javaChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? javaChapters[idx - 1] : null;
  const next = idx < javaChapters.length - 1 ? javaChapters[idx + 1] : null;

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
