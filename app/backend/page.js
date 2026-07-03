"use client";

// =============================================================
// 后端开发综合教程页面
// -------------------------------------------------------------
// 与 JS/TS/GraphQL 教程页面结构基本一致，区别：
//   1. 数据源：backendChapters / backendChapterGroups（来自
//      backend-tutorial-data）
//   2. 运行接口：/api/run-backend（复用共享沙箱执行 Node.js 代码）
//   3. 高亮器：highlightJavaScript（code 字段为 Node.js 代码）
//   4. 文案：后端开发教程、backend.js 文件名
//   5. content 中讲解语言无关的后端原理，code 用 Node.js 演示
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { backendChapters, backendChapterGroups } from "../backend-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import ExternalRunDropdown from "../components/ExternalRunDropdown";
import dynamic from "next/dynamic";
const MonacoEditor = dynamic(() => import("../components/MonacoEditor"), { ssr: false, loading: () => <div className="monaco-loading-placeholder">正在加载编辑器…</div> });

export default function BackendTutorial() {
  // ---------- 状态管理 ----------
  const [activeId, setActiveId] = useState(backendChapters[0].id);
  const [code, setCode] = useState(backendChapters[0].code);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  const activeChapter =
    backendChapters.find((c) => c.id === activeId) || backendChapters[0];

  // ---------- 切换章节 ----------
  const selectChapter = useCallback((chapterId) => {
    const chapter = backendChapters.find((c) => c.id === chapterId);
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

  // ---------- 执行代码 ----------
  // 调用 /api/run-backend，后端用共享沙箱执行 Node.js 代码
  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput("正在执行后端示例代码...");
    setError("");
    try {
      const res = await fetch("/api/run-backend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      setOutput(data.output || "");
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
      localStorage.setItem("playground:code:backend", code);
    } catch {}
    window.open(`/playground?lang=backend`, "_blank", "noopener,noreferrer");
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

  const groupedChapters = backendChapterGroups.map((group) => ({
    group,
    items: backendChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏 ===== */}
        <Sidebar
          title="学习目录"
          tip="点击章节开始学习后端开发"
          footer={<p>💡 提示：按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 执行代码</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/backend"
          meta={`共 ${backendChapters.length} 章 · 综合教程`}
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
                <span className="editor-filename">backend.js</span>
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
              <MonacoEditor
                key={activeId}
                value={code}
                onChange={setCode}
                language="javascript"
                onRun={runCode}
              />
            </div>
          </section>

          {/* 输出控制台 */}
          <section className="console-section">
            <div className="console-header">
              <span className="console-title">运行结果</span>
              <span className="console-hint">
                {isRunning ? "执行中..." : hasRun ? "执行完成" : "点击运行代码查看结果"}
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
                  <span className="placeholder-icon">🛠</span>
                  <span>点击上方"运行代码"按钮，或按 Ctrl+Enter 执行后端示例</span>
                </div>
              )}
            </div>
          </section>

          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>
              后端开发综合教程 · 语言无关的核心知识点 · 示例代码用 Node.js 演示，可在沙箱中直接运行
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = backendChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? backendChapters[idx - 1] : null;
  const next = idx < backendChapters.length - 1 ? backendChapters[idx + 1] : null;

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
