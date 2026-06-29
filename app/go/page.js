"use client";

// =============================================================
// Go 交互式教程页面
// -------------------------------------------------------------
// 结构与 C# / Java 教程页面一致，区别：
//   1. 数据源：goChapters / goChapterGroups（来自 go-tutorial-data）
//   2. 运行接口：/api/run-go（调用 go run 编译运行）
//   3. 高亮器：highlightGo（支持 func/package/import/struct/interface
//      等关键字、反引号原始字符串、rune '...'、内置函数）
//   4. 文案：Go 教程、main.go 文件名
// =============================================================

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { goChapters, goChapterGroups } from "../go-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import { highlightGo } from "../go-highlight";
import SiteNav from "../components/SiteNav";
import Sidebar from "../components/Sidebar";

// 默认代码示例：用户首次进入时显示，可自由修改后运行
const DEFAULT_CODE = `// Go 1.21+ 示例
// 必须包含 package main 和 func main()
package main

import (
	"fmt"
	"strings"
)

func main() {
	// 1. 基本输出
	fmt.Println("Hello, Go!")

	// 2. 字符串拼接与格式化
	name := "张三"
	age := 18
	fmt.Printf("我叫%s，今年%d岁\n", name, age)

	// 3. 切片与 for range
	fruits := []string{"苹果", "香蕉", "橙子"}
	for i, fruit := range fruits {
		fmt.Printf("  %d. %s\n", i+1, fruit)
	}

	// 4. 简单计算（1 到 100 求和）
	sum := 0
	for i := 1; i <= 100; i++ {
		sum += i
	}
	fmt.Println("1 到 100 的和：", sum)

	// 5. 使用 strings 包
	fmt.Println(strings.Repeat("Go", 3)) // GoGoGo
}
`;

export default function GoTutorial() {
  // ---------- 状态管理 ----------
  const [activeId, setActiveId] = useState(goChapters[0].id);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const contentRef = useRef(null);

  // 把当前代码高亮成 HTML（用 Go 高亮器）
  const highlightedHTML = useMemo(
    () => highlightGo(code) + "\n",
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

  // 当前章节对象
  const activeChapter =
    goChapters.find((c) => c.id === activeId) || goChapters[0];

  // ---------- 切换章节 ----------
  const selectChapter = useCallback((chapterId) => {
    const chapter = goChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    // 注意：不重置 code，让用户保留编辑器内容
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
    setOutput("正在编译并执行 Go 代码...");
    setError("");
    try {
      const res = await fetch("/api/run-go", {
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
    setCode(DEFAULT_CODE);
    setOutput("");
    setError("");
    setHasRun(false);
  }, []);

  // ---------- 在 Playground 中打开 ----------
  const handlePlayground = useCallback(() => {
    try {
      localStorage.setItem("playground:code:go", code);
    } catch {}
    window.open(`/playground?lang=go`, "_blank", "noopener,noreferrer");
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

  // ---------- Tab 键缩进 ----------
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      // Go 官方规范使用 tab，但编辑器用 4 空格便于显示
      const newCode = code.slice(0, start) + "    " + code.slice(end);
      setCode(newCode);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      });
    }
  };

  // 按分组组织章节
  const groupedChapters = goChapterGroups.map((group) => ({
    group,
    items: goChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <SiteNav currentPath="/go" meta={`共 ${goChapters.length} 章 · 在线编译运行`} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="main-layout">
        {/* ===== 侧边栏：章节导航 ===== */}
        <Sidebar
          title="学习目录"
          tip="点击章节开始学习 Go"
          footer={<p>💡 提示：按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 运行代码</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
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
                <span className="editor-filename">main.go</span>
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
                  {isRunning ? "⏳ 编译中..." : "▶ 运行代码"}
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
                  placeholder="在这里编写 Go 代码，可以自由修改后运行..."
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
              Go 1.21+ 交互式教程 · 代码由系统 go run 编译运行 · 涵盖语法基础/接口/泛型/并发 goroutine/channel/Go Modules/Web 开发
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航组件 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = goChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? goChapters[idx - 1] : null;
  const next = idx < goChapters.length - 1 ? goChapters[idx + 1] : null;

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
