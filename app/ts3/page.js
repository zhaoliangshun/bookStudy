"use client";

// =============================================================
// TypeScript 高阶实战教程（ts3）页面
// -------------------------------------------------------------
// 结构与 TS 教程页面一致，区别：
//   1. 数据源：ts3Chapters / ts3ChapterGroups（来自 ts3-tutorial-data）
//   2. 运行接口：/api/run-ts（先 TS 转译再沙箱执行）
//   3. 高亮器：highlightTypeScript（支持 interface/type/enum 等关键字）
//   4. 文案：TypeScript 高阶实战教程、example.ts 文件名
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { ts3Chapters, ts3ChapterGroups } from "../ts3-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import ExternalRunDropdown from "../components/ExternalRunDropdown";
import dynamic from "next/dynamic";
const MonacoEditor = dynamic(() => import("../components/MonacoEditor"), { ssr: false, loading: () => <div className="monaco-loading-placeholder">正在加载编辑器…</div> });

export default function TypeScript3Tutorial() {
  // 默认使用第一个章节作为初始状态。
  // 注意：不在渲染阶段读取 window.location.hash，否则 SSR 与客户端
  // 在 URL 带 hash 时渲染结果不一致，会触发 React hydration 错误。
  // URL hash 的处理放到 useEffect 中，在客户端挂载后再切换章节。
  const initialChapter = ts3Chapters[0];

  const [activeId, setActiveId] = useState(initialChapter.id);
  const [code, setCode] = useState(initialChapter.code);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  const activeChapter =
    ts3Chapters.find((c) => c.id === activeId) || ts3Chapters[0];

  // 客户端挂载后读取 URL hash：有效则切换到对应章节，无效则清除。
  // 这里读取 window 不会导致 hydration 错误，因为首次渲染已经完成。
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const chapter = ts3Chapters.find((c) => c.id === hash);
    if (chapter) {
      setActiveId(hash);
      setCode(chapter.code);
    } else {
      // hash 无效，清除它（跨页面跳转时可能残留）
      const url = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", url);
    }
  }, []);

  const selectChapter = useCallback((chapterId) => {
    const chapter = ts3Chapters.find((c) => c.id === chapterId);
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

  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput("正在转译 TypeScript 并执行...");
    setError("");
    try {
      const res = await fetch("/api/run-ts", {
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
      localStorage.setItem("playground:code:ts", code);
    } catch {}
    window.open(`/playground?lang=ts`, "_blank", "noopener,noreferrer");
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

  const groupedChapters = ts3ChapterGroups.map((group) => ({
    group,
    items: ts3Chapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="学习目录"
          tip="点击章节开始学习 TypeScript 高阶实战"
          footer={<p>💡 提示：按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 运行代码</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/ts3"
          meta={`共 ${ts3Chapters.length} 章 · 可在线编辑运行`}
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
                <span className="editor-filename">example.ts</span>
              </div>
              <div className="editor-actions">
                <ExternalRunDropdown code={code} langLower="ts" disabled={isRunning} />
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
                language="typescript"
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

          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>
              TypeScript 高阶实战教程 · 代码先经 TS 编译器转译再在沙箱中执行 · 类型体操/React/Node.js/工程化/架构实战
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

function ChapterNav({ activeId, onSelect }) {
  const idx = ts3Chapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? ts3Chapters[idx - 1] : null;
  const next = idx < ts3Chapters.length - 1 ? ts3Chapters[idx + 1] : null;

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