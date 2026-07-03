"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { py4Chapters, py4ChapterGroups } from "../py4-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import ExternalRunDropdown from "../components/ExternalRunDropdown";
import dynamic from "next/dynamic";
const MonacoEditor = dynamic(() => import("../components/MonacoEditor"), { ssr: false, loading: () => <div className="monaco-loading-placeholder">正在加载编辑器…</div> });

export default function Python4Tutorial() {
  const [activeId, setActiveId] = useState(py4Chapters[0].id);
  const [code, setCode] = useState(py4Chapters[0].code);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  const activeChapter =
    py4Chapters.find((c) => c.id === activeId) || py4Chapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = py4Chapters.find((c) => c.id === chapterId);
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
    setOutput("正在调用 python3 执行...");
    setError("");
    try {
      const res = await fetch("/api/run-py", {
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

  const groupedChapters = py4ChapterGroups.map((group) => ({
    group,
    items: py4Chapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="学习目录"
          tip="Python 3.12+ 全面教程，56 章，每章可运行 demo"
          footer={
            <p>
              Ctrl + Enter 运行代码
            </p>
          }
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/py4"
          meta={`共 ${py4Chapters.length} 章 · Python 3.12+`}
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
              <MonacoEditor
                value={code}
                onChange={setCode}
                language="python"
                onRun={runCode}
              />
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
                  <span>点击上方&quot;运行代码&quot;按钮，或按 Ctrl+Enter 执行代码</span>
                </div>
              )}
            </div>
          </section>

          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>Python 3.12+ 全面实战教程 · 56 章 14 分组 · 覆盖日常开发所有核心功能</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

function ChapterNav({ activeId, onSelect }) {
  const idx = py4Chapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? py4Chapters[idx - 1] : null;
  const next = idx < py4Chapters.length - 1 ? py4Chapters[idx + 1] : null;

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