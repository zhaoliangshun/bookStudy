"use client";

// =============================================================
// TypeScript 交互式教程页面
// -------------------------------------------------------------
// 结构与 Node.js 教程页面（app/page.js）基本一致，区别：
//   1. 数据源：tsChapters / tsChapterGroups（来自 ts-tutorial-data）
//   2. 运行接口：/api/run-ts（先 TS 转译再沙箱执行）
//   3. 高亮器：highlightTypeScript（支持 interface/type/enum 等关键字）
//   4. 文案：TypeScript 教程、example.ts 文件名
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { tsChapters, tsChapterGroups } from "../ts-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import ExternalRunDropdown from "../components/ExternalRunDropdown";
import dynamic from "next/dynamic";
const MonacoEditor = dynamic(() => import("../components/MonacoEditor"), { ssr: false, loading: () => <div className="monaco-loading-placeholder">正在加载编辑器…</div> });

export default function TypeScriptTutorial() {
  // ---------- 状态管理 ----------
  const [activeId, setActiveId] = useState(tsChapters[0].id);
  const [code, setCode] = useState(tsChapters[0].code);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  // 当前章节对象
  const activeChapter =
    tsChapters.find((c) => c.id === activeId) || tsChapters[0];

  // ---------- 切换章节 ----------
  const selectChapter = useCallback((chapterId) => {
    const chapter = tsChapters.find((c) => c.id === chapterId);
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
  // 与 Node.js 教程不同，这里调用 /api/run-ts，会先 TS 转译再沙箱执行
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
      localStorage.setItem("playground:code:ts", code);
    } catch {}
    window.open(`/playground?lang=ts`, "_blank", "noopener,noreferrer");
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
  const groupedChapters = tsChapterGroups.map((group) => ({
    group,
    items: tsChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏：章节导航 ===== */}
        <Sidebar
          title="学习目录"
          tip="点击章节开始学习 TypeScript"
          footer={<p>💡 提示：按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 运行代码</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/ts"
          meta={`共 ${tsChapters.length} 章 · 可在线编辑运行`}
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
                value={code}
                onChange={setCode}
                language="typescript"
                onRun={runCode}
              />
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
              TypeScript 交互式教程 · 代码先经 TS 编译器转译再在沙箱中执行 · 支持 interface/type/enum/泛型/装饰器
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航组件 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = tsChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? tsChapters[idx - 1] : null;
  const next = idx < tsChapters.length - 1 ? tsChapters[idx + 1] : null;

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
