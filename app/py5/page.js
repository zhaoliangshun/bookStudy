"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { py5Chapters, py5ChapterGroups } from "../py5-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import { highlightPython } from "../py-highlight";
import Sidebar from "../components/Sidebar";

export default function Python5Tutorial() {
  const [activeId, setActiveId] = useState(py5Chapters[0].id);
  const [code, setCode] = useState(py5Chapters[0].code);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [pyVersion, setPyVersion] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const contentRef = useRef(null);

  const highlightedHTML = useMemo(
    () => highlightPython(code) + "\n",
    [code]
  );

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
    py5Chapters.find((c) => c.id === activeId) || py5Chapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = py5Chapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setCode(chapter.code);
    setOutput("");
    setError("");
    setHasRun(false);
    setSidebarOpen(false);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, []);

  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput("正在调用 Python 3.13 执行...");
    setError("");
    try {
      const res = await fetch("/api/run-py", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.pythonVersion) setPyVersion(data.pythonVersion);
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

  const resetCode = useCallback(() => {
    setCode(activeChapter.code);
    setOutput("");
    setError("");
    setHasRun(false);
  }, [activeChapter]);

  const handlePlayground = useCallback(() => {
    try {
      localStorage.setItem("playground:code:python", code);
    } catch {}
    window.open(`/playground?lang=python`, "_blank", "noopener,noreferrer");
  }, [code]);

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

  useEffect(() => {
    // 启动时获取 Python 版本
    fetch("/api/run-py", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "import sys; print(sys.version.split()[0])" }),
    }).then(r => r.json()).then(d => {
      if (d.output) setPyVersion(d.output.trim());
    }).catch(() => {});
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.slice(0, start) + "    " + code.slice(end);
      setCode(newCode);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      });
    }
  };

  const groupedChapters = py5ChapterGroups.map((group) => ({
    group,
    items: py5Chapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="学习目录"
          tip={`Python 3.13 教程 · 56 章实战 demo · 每章可在沙箱中直接运行${pyVersion ? " (Python " + pyVersion + ")" : ""}`}
          footer={
            <p>
              Ctrl + Enter 运行代码 · 所有 demo 基于 Python 3.13
            </p>
          }
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/py5"
          meta={`共 ${py5Chapters.length} 章 · Python 3.13${pyVersion ? " (" + pyVersion + ")" : ""}`}
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

          <section className="editor-section">
            <div className="editor-header">
              <div className="editor-label">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
                <span className="editor-filename">example.py</span>
                {pyVersion && <span style={{marginLeft: 12, fontSize: 12, color: "#888", fontFamily: "var(--font-geist-mono)"}}>Python {pyVersion}</span>}
              </div>
              <div className="editor-actions">
                <button className="btn btn-secondary" onClick={resetCode} disabled={isRunning} title="恢复初始代码">
                  重置
                </button>
                <button className="btn btn-primary" onClick={runCode} disabled={isRunning}>
                  {isRunning ? "执行中..." : "运行代码"}
                </button>
                <button className="btn btn-secondary" onClick={handlePlayground} title="在 Playground 中打开">
                  Playground
                </button>
              </div>
            </div>
            <div className="editor-wrap">
              <div className="line-numbers" ref={lineNumbersRef}>
                {code.split("\n").map((_, i) => (
                  <div key={i} className="line-number">{i + 1}</div>
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
                  placeholder="在这里编写 Python 代码..."
                />
              </div>
            </div>
          </section>

          <section className="console-section">
            <div className="console-header">
              <span className="console-title">控制台输出</span>
              <span className="console-hint">
                {isRunning ? "执行中..." : hasRun ? "执行完成" : "点击运行查看结果"}
              </span>
            </div>
            <div className="console-body">
              {output && (
                <pre className={`console-output ${error ? "has-error" : ""}`}>{output}</pre>
              )}
              {error && (
                <pre className="console-error">
                  <span className="error-label">错误:</span>
                  {"\n"}{error}
                </pre>
              )}
              {!hasRun && !isRunning && (
                <div className="console-placeholder">
                  <span>点击"运行代码"按钮，或按 Ctrl+Enter 执行代码 · 沙箱使用 Python {pyVersion || "3.13"}</span>
                </div>
              )}
            </div>
          </section>

          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>Python 3.13 全面实战教程 · 56 章 14 分组 · 所有 demo 均已在 Python {pyVersion || "3.13"} 沙箱中验证通过</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

function ChapterNav({ activeId, onSelect }) {
  const idx = py5Chapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? py5Chapters[idx - 1] : null;
  const next = idx < py5Chapters.length - 1 ? py5Chapters[idx + 1] : null;

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