"use client";

// =============================================================
// AI 应用编程教程页面（全新）
// -------------------------------------------------------------
// 结构与 /ai、/ts、/py 等教程页面一致：
//   1. 数据源：aiappChapters / aiappChapterGroups（来自 aiapp-tutorial-data）
//   2. 运行接口：/api/run（Node.js 沙箱执行 JavaScript 代码）
//   3. 文案：AI 应用编程教程
//
// 与既有 /ai（AI 编程方法 40 章）和 /ai-agent（AI Agent 开发）教程互补，
// 本教程共 50 章，覆盖：
//   AI 编程入门 / 主流大模型对比 / AI 编程工具全景 / Codex 深度使用 /
//   Claude 深度使用 / 提示词工程实战 / AI 编程实用技巧 / AI 编程工作流 /
//   陷阱与最佳实践 / 进阶与未来
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { aiappChapters, aiappChapterGroups } from "../aiapp-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import ExternalRunDropdown from "../components/ExternalRunDropdown";
import dynamic from "next/dynamic";

// Monaco 编辑器按需加载（SSR 关闭，避免服务端渲染报错）
const MonacoEditor = dynamic(() => import("../components/MonacoEditor"), {
  ssr: false,
  loading: () => (
    <div className="monaco-loading-placeholder">正在加载编辑器…</div>
  ),
});

export default function AIAppTutorial() {
  // ---------- 状态管理 ----------
  // 默认使用第一个章节作为初始状态。
  // 注意：不在渲染阶段读取 window.location.hash，否则 SSR 与客户端
  // 在 URL 带 hash 时渲染结果不一致，会触发 React hydration 错误。
  // URL hash 的处理放到 useEffect 中，在客户端挂载后再切换章节。
  const initialChapter = aiappChapters[0];

  const [activeId, setActiveId] = useState(initialChapter.id);
  const [code, setCode] = useState(initialChapter.code);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  // 当前章节对象
  const activeChapter =
    aiappChapters.find((c) => c.id === activeId) || aiappChapters[0];

  // 客户端挂载后读取 URL hash：有效则切换到对应章节，无效则清除。
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const chapter = aiappChapters.find((c) => c.id === hash);
    if (chapter) {
      const id = requestAnimationFrame(() => {
        setActiveId(hash);
        setCode(chapter.code);
      });
      return () => cancelAnimationFrame(id);
    } else {
      // hash 无效，清除它（跨页面跳转时可能残留）
      const url = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", url);
    }
  }, []);

  // ---------- 切换章节 ----------
  const selectChapter = useCallback((chapterId) => {
    const chapter = aiappChapters.find((c) => c.id === chapterId);
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

  // ---------- 在 Playground 中打开 ----------
  const handlePlayground = useCallback(() => {
    try {
      localStorage.setItem("playground:code:node", code);
    } catch {}
    window.open(`/playground?lang=node`, "_blank", "noopener,noreferrer");
  }, [code]);

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

  // 按分组组织章节
  const groupedChapters = aiappChapterGroups.map((group) => ({
    group,
    items: aiappChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏：章节导航 ===== */}
        <Sidebar
          title="学习目录"
          tip="点击章节学习 AI 应用编程"
          footer={
            <p>💡 提示：按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 运行代码</p>
          }
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          currentPath="/aiapp"
          meta={`共 ${aiappChapters.length} 章 · 在线编辑运行`}
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
              <span className="console-title">控制台输出</span>
              <span className="console-hint">
                {isRunning
                  ? "执行中..."
                  : hasRun
                  ? "执行完成"
                  : "点击运行查看结果"}
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
                  <span>
                    点击上方&quot;运行代码&quot;按钮，或按 Ctrl+Enter 执行代码
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* 章节底部导航：上一章/下一章 */}
          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>
              AI 应用编程教程 · 代码在 Node.js 沙箱中执行 · 共 50 章，覆盖 AI
              编程入门、大模型对比、工具全景、Codex/Claude 深度使用、提示词工程、
              实用技巧、工作流、陷阱与最佳实践、进阶与未来
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航组件 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = aiappChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? aiappChapters[idx - 1] : null;
  const next = idx < aiappChapters.length - 1 ? aiappChapters[idx + 1] : null;

  return (
    <nav className="chapter-nav-bottom">
      {prev ? (
        <button className="nav-btn nav-prev" onClick={() => onSelect(prev.id)}>
          <span className="nav-dir">← 上一章</span>
          <span className="nav-title">
            {prev.icon} {prev.title}
          </span>
        </button>
      ) : (
        <span />
      )}
      {next ? (
        <button className="nav-btn nav-next" onClick={() => onSelect(next.id)}>
          <span className="nav-dir">下一章 →</span>
          <span className="nav-title">
            {next.icon} {next.title}
          </span>
        </button>
      ) : (
        <span />
      )}
    </nav>
  );
}
