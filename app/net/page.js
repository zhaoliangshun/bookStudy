"use client";

// =============================================================
// 计算机网络交互式教程页面（工作中常用到的网络知识）
// -------------------------------------------------------------
// 路由：/net
// 结构与 blog-tutorial / py 等教程页面一致，区别：
//   1. 数据源：netChapters / netChapterGroups（来自 net-tutorial-data）
//   2. 运行接口：/api/run-py（调用系统 python3 执行）
//   3. 高亮器：highlightPython（支持 # 注释、三引号字符串、装饰器、关键字）
//   4. 文件名：network.py
//
// 教程特色：每章 code 都是「真正可运行的 Python」，用 socket、
//   http.server、http.client、ssl、struct、hashlib 等标准库演示
//   网络协议，在沙箱中真实起本地 server + client 通信。
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { netChapters, netChapterGroups } from "../net-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import ExternalRunDropdown from "../components/ExternalRunDropdown";
import dynamic from "next/dynamic";
const MonacoEditor = dynamic(() => import("../components/MonacoEditor"), { ssr: false, loading: () => <div className="monaco-loading-placeholder">正在加载编辑器…</div> });

// 默认代码示例：用户首次进入时显示，可自由修改后运行
const DEFAULT_CODE = `# 计算机网络教程示例：用 socket 起一个 TCP server + client
import socket, threading

# ---------- TCP Server ----------
def server_handler(conn, addr):
    print(f"[server] 接受连接: {addr}")
    data = conn.recv(1024)
    print(f"[server] 收到: {data.decode()}")
    conn.sendall(b"HTTP/1.1 200 OK\\r\\nContent-Length: 12\\r\\n\\r\\nhello world")
    conn.close()

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(("127.0.0.1", 0))
server.listen(1)
port = server.getsockname()[1]
print(f"[server] 监听 127.0.0.1:{port}")

# 后台线程跑 server
threading.Thread(target=lambda: (lambda c, a: server_handler(c, a))(*server.accept()), daemon=True).start()

# ---------- TCP Client ----------
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect(("127.0.0.1", port))
client.sendall(b"ping")
resp = client.recv(1024)
print(f"[client] 收到响应:\\n{resp.decode()}")
client.close()
server.close()
print("\\n💡 提示：这就是 HTTP 底层的 TCP 通信，左侧选择章节深入学习各协议")
`;

export default function NetworkTutorial() {
  // ---------- 状态管理 ----------
  const [activeId, setActiveId] = useState(netChapters[0].id);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  // 当前章节对象
  const activeChapter =
    netChapters.find((c) => c.id === activeId) || netChapters[0];

  // ---------- 切换章节 ----------
  const selectChapter = useCallback((chapterId) => {
    const chapter = netChapters.find((c) => c.id === chapterId);
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
    setOutput("正在执行 Python 代码...");
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
  const groupedChapters = netChapterGroups.map((group) => ({
    group,
    items: netChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏：章节导航 ===== */}
        <Sidebar
          title="学习目录"
          tip="工作中常用到的计算机网络知识"
          footer={<p>💡 提示：按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 运行代码</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          currentPath="/net"
          meta={`共 ${netChapters.length} 章 · 在线运行网络协议代码`}
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
                <span className="editor-filename">network.py</span>
              </div>
              <div className="editor-actions">
                <ExternalRunDropdown code={code} langLower="py" disabled={isRunning} />
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

          {/* 输出控制台 */}
          <section className="console-section">
            <div className="console-header">
              <span className="console-title">运行结果</span>
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
                  <span>点击上方&quot;运行代码&quot;按钮，或按 Ctrl+Enter 执行代码</span>
                </div>
              )}
            </div>
          </section>

          {/* 章节底部导航：上一章/下一章 */}
          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>
              计算机网络教程 · 聚焦工作中常用到的网络知识 · 代码在 python3 沙箱中真实运行（用 socket/http.server 起本地 server）
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航组件 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = netChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? netChapters[idx - 1] : null;
  const next = idx < netChapters.length - 1 ? netChapters[idx + 1] : null;

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
