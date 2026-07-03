"use client";

// =============================================================
// pnpm 交互式教程页面
// -------------------------------------------------------------
// 结构与 Go / Java 教程页面一致，区别：
//   1. 数据源：pnpmChapters / pnpmChapterGroups（来自 pnpm-tutorial-data）
//   2. 运行接口：/api/run-shell（在 bash 沙箱里执行 shell 脚本）
//   3. 高亮器：highlightShell（支持 # 注释、变量 $var、字符串、内建命令）
//   4. 文案：pnpm 教程、playground.sh 文件名
//
// 特殊说明：沙箱环境没有真实安装 pnpm，章节的 code 字段是用
//   echo 模拟 pnpm 命令输出的 bash 脚本，能在沙箱里运行并展示
//   命令的典型输出格式，帮助理解 pnpm 行为。
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { pnpmChapters, pnpmChapterGroups } from "../pnpm-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import dynamic from "next/dynamic";
import Sidebar from "../components/Sidebar";
import ExternalRunDropdown from "../components/ExternalRunDropdown";

const MonacoEditor = dynamic(() => import("../components/MonacoEditor"), { ssr: false, loading: () => <div className="monaco-loading-placeholder">正在加载编辑器…</div> });

// 默认代码示例：用户首次进入时显示，可自由修改后运行
const DEFAULT_CODE = `#!/bin/bash
# pnpm 教程示例脚本
# 沙箱环境未安装 pnpm，用 echo 模拟命令输出

echo "=== pnpm 版本信息（模拟输出）===" 
echo "pnpm v9.15.0"
echo ""

echo "=== pnpm 与 npm 磁盘占用对比（模拟）==="
printf "%-12s %-15s %s\\n" "项目" "npm" "pnpm"
printf "%-12s %-15s %s\\n" "----" "---" "----"
printf "%-12s %-15s %s\\n" "项目 A" "320 MB" "45 MB"
printf "%-12s %-15s %s\\n" "项目 B" "298 MB" "12 MB（共享 store）"
printf "%-12s %-15s %s\\n" "总计" "618 MB" "57 MB"
echo ""
echo "💡 pnpm 通过内容寻址 store 让多项目共享依赖，节省磁盘"
`;

export default function PnpmTutorial() {
  // ---------- 状态管理 ----------
  const [activeId, setActiveId] = useState(pnpmChapters[0].id);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  // 当前章节对象
  const activeChapter =
    pnpmChapters.find((c) => c.id === activeId) || pnpmChapters[0];

  // ---------- 切换章节 ----------
  const selectChapter = useCallback((chapterId) => {
    const chapter = pnpmChapters.find((c) => c.id === chapterId);
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
    setOutput("正在执行 Shell 脚本...");
    setError("");
    try {
      const res = await fetch("/api/run-shell", {
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

  // 按分组组织章节
  const groupedChapters = pnpmChapterGroups.map((group) => ({
    group,
    items: pnpmChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏：章节导航 ===== */}
        <Sidebar
          title="学习目录"
          tip="点击章节开始学习 pnpm"
          footer={<p>💡 提示：按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 运行脚本</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/pnpm"
          meta={`共 ${pnpmChapters.length} 章 · 在线运行 Shell 示例`}
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
                <span className="editor-filename">playground.sh</span>
              </div>
              <div className="editor-actions">
                <ExternalRunDropdown code={code} langLower="sh" disabled={isRunning} />
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
                  {isRunning ? "⏳ 执行中..." : "▶ 运行脚本"}
                </button>
              </div>
            </div>
            <div className="editor-wrap">
              <MonacoEditor
                value={code}
                onChange={setCode}
                language="shell"
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
                  <span>点击上方&quot;运行脚本&quot;按钮，或按 Ctrl+Enter 执行脚本</span>
                </div>
              )}
            </div>
          </section>

          {/* 章节底部导航：上一章/下一章 */}
          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>
              pnpm 9.x 交互式教程 · Shell 脚本在 bash 沙箱中运行 · 涵盖安装配置/依赖管理/Workspace monorepo/overrides 补丁/缓存 store/发布部署
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航组件 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = pnpmChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? pnpmChapters[idx - 1] : null;
  const next = idx < pnpmChapters.length - 1 ? pnpmChapters[idx + 1] : null;

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
