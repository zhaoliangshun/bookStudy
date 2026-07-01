"use client";

// =============================================================
// 操作系统实战教程（服务器向）—— 页面组件
// -------------------------------------------------------------
// 与 py5/page.js 结构一致，差异点：
//   1. 数据源：osChapters / osChapterGroups（来自 os-tutorial-data.js）
//   2. 高亮器：highlightShell（来自 shell-highlight.js）
//   3. 执行 API：/api/run-shell（POST { code } -> { output, error, exitCode }）
//   4. 编辑器文件名：example.sh，placeholder 改为 Shell 提示
//   5. 启动时 GET /api/run-shell 拿 bash 版本展示在侧边栏
//   6. 移除 Playground 按钮（playground 暂不支持 shell lang）
// =============================================================

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { osChapters, osChapterGroups } from "../os-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import { highlightShell } from "../shell-highlight";
import Sidebar from "../components/Sidebar";
import ExternalRunDropdown from "../components/ExternalRunDropdown";

export default function OSTutorial() {
  const [activeId, setActiveId] = useState(osChapters[0].id);
  const [code, setCode] = useState(osChapters[0].code);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [shellVersion, setShellVersion] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const contentRef = useRef(null);

  // 代码高亮：code 变化时重新生成 HTML
  const highlightedHTML = useMemo(
    () => highlightShell(code) + "\n",
    [code]
  );

  // 编辑器滚动同步：textarea / 高亮层 / 行号三者同步
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
    osChapters.find((c) => c.id === activeId) || osChapters[0];

  // 切换章节
  const selectChapter = useCallback((chapterId) => {
    const chapter = osChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setCode(chapter.code);
    setOutput("");
    setError("");
    setHasRun(false);
    setSidebarOpen(false);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, []);

  // 运行 Shell 代码
  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput("正在调用 bash 执行...");
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

  // 重置为初始代码
  const resetCode = useCallback(() => {
    setCode(activeChapter.code);
    setOutput("");
    setError("");
    setHasRun(false);
  }, [activeChapter]);

  // Ctrl+Enter 运行快捷键
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

  // 启动时获取 bash 版本（GET /api/run-shell 返回 version）
  useEffect(() => {
    fetch("/api/run-shell")
      .then((r) => r.json())
      .then((d) => {
        if (d.version) {
          // 取第一行，如 "GNU bash, version 5.2.2(1)-release" -> "bash 5.2.2"
          const firstLine = d.version.split("\n")[0];
          setShellVersion(firstLine);
        }
      })
      .catch(() => {});
  }, []);

  // Tab 键插入 4 空格（与 py5 一致）
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

  // 按分组聚合章节
  const groupedChapters = osChapterGroups.map((group) => ({
    group,
    items: osChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="学习目录"
          tip={`操作系统实战教程 · ${osChapters.length} 章服务器运维 · 每章 demo 可在沙箱运行${shellVersion ? " (" + shellVersion + ")" : ""}`}
          footer={<p>Ctrl + Enter 运行代码 · 沙箱执行 bash</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          currentPath="/os"
          meta={`共 ${osChapters.length} 章 · 服务器运维实战`}
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
                <span className="editor-filename">example.sh</span>
                {shellVersion && (
                  <span style={{ marginLeft: 12, fontSize: 12, color: "#888", fontFamily: "var(--font-geist-mono)" }}>
                    {shellVersion}
                  </span>
                )}
              </div>
              <div className="editor-actions">
                <ExternalRunDropdown code={code} langLower="sh" disabled={isRunning} />
                <button className="btn btn-secondary" onClick={resetCode} disabled={isRunning} title="恢复初始代码">
                  重置
                </button>
                <button className="btn btn-primary" onClick={runCode} disabled={isRunning}>
                  {isRunning ? "执行中..." : "运行代码"}
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
                  placeholder="在这里编写 Shell 脚本..."
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
                  <span>点击&ldquo;运行代码&rdquo;按钮，或按 Ctrl+Enter 执行 · 沙箱为本地 bash（部分特权命令如 systemctl/docker 需在真实服务器练习）</span>
                </div>
              )}
            </div>
          </section>

          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>操作系统实战教程 · {osChapters.length} 章 {osChapterGroups.length} 分组 · 覆盖 Linux 服务器运维与部署核心场景</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// 上一章 / 下一章导航
function ChapterNav({ activeId, onSelect }) {
  const idx = osChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? osChapters[idx - 1] : null;
  const next = idx < osChapters.length - 1 ? osChapters[idx + 1] : null;

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
