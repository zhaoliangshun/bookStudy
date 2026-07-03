"use client";

// =============================================================
// Sass 交互式教程页面
// -------------------------------------------------------------
// 与 Tailwind / Python 教程页面的混合方案：
//   - 像 Tailwind：输出区是 iframe 实时预览，不是控制台文本
//   - 像 Python：需要调 /api/run-sass 后端接口（编译 SCSS → CSS）
//
// 工作流程：
//   1. 用户在编辑器里写 SCSS 代码
//   2. 点"编译预览"按钮 → 调 POST /api/run-sass { code }
//   3. 后端用 dart-sass 把 SCSS 编译成 CSS 返回
//   4. 前端把 CSS 塞进 <style>，配合一段通用 demo HTML，组成完整
//      HTML 文档放进 iframe.srcDoc 实时渲染
//   5. 编译错误（语法错误）显示在错误区，带行号提示
// =============================================================

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { sassChapters, sassChapterGroups } from "../sass-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";
import ExternalRunDropdown from "../components/ExternalRunDropdown";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("../components/MonacoEditor"), { ssr: false, loading: () => <div className="monaco-loading-placeholder">正在加载编辑器…</div> });

// 通用 demo HTML：放进 iframe body 里，让用户写的 SCSS 有元素可样式化。
// 包含常见组件元素：按钮、卡片、列表、网格、表单、徽章、提示框、导航等。
// 所有元素都在 .sass-demo 容器内，用户的 SCSS 通过 .sass-demo 选择器去样式化。
const DEMO_HTML = `
<div class="sass-demo">
  <h2>Demo 预览区</h2>
  <p>这段 HTML 是固定的演示模板，你的 SCSS 会样式化这些元素。</p>

  <h3>按钮</h3>
  <div class="btn-group">
    <button class="btn">默认按钮</button>
    <button class="btn btn--primary">Primary</button>
    <button class="btn btn--secondary">Secondary</button>
    <button class="btn btn--success">Success</button>
    <button class="btn btn--danger">Danger</button>
  </div>

  <h3>卡片</h3>
  <div class="grid">
    <div class="card">
      <div class="card__header">卡片标题</div>
      <div class="card__body">这是卡片内容，可以放文字、图片等。</div>
      <div class="card__footer"><button class="btn btn--primary">操作</button></div>
    </div>
    <div class="card">
      <div class="card__header">第二张卡片</div>
      <div class="card__body">另一段内容。</div>
    </div>
  </div>

  <h3>列表</h3>
  <ul class="list">
    <li class="list__item">列表项 1</li>
    <li class="list__item">列表项 2</li>
    <li class="list__item">列表项 3</li>
  </ul>

  <h3>徽章与提示</h3>
  <div>
    <span class="badge">默认</span>
    <span class="badge badge--primary">Primary</span>
    <span class="badge badge--success">Success</span>
  </div>
  <div class="alert">这是一条提示信息。</div>
  <div class="alert alert--warning">这是警告提示。</div>

  <h3>表单</h3>
  <form class="form" onsubmit="return false">
    <label class="form__label">用户名</label>
    <input class="form__input" type="text" placeholder="请输入用户名" />
    <label class="form__label">密码</label>
    <input class="form__input" type="password" placeholder="请输入密码" />
    <button class="btn btn--primary" type="submit">提交</button>
  </form>

  <h3>导航</h3>
  <nav class="nav">
    <a class="nav__link nav__link--active" href="#">首页</a>
    <a class="nav__link" href="#">产品</a>
    <a class="nav__link" href="#">关于</a>
  </nav>
</div>
`;

export default function SassTutorial() {
  // ---------- 状态管理 ----------
  const [activeId, setActiveId] = useState(sassChapters[0].id);
  const [code, setCode] = useState(sassChapters[0].code);
  const [compiledCss, setCompiledCss] = useState(""); // 编译后的 CSS
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [previewKey, setPreviewKey] = useState(0); // 强制刷新 iframe
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  // 构造预览用的完整 HTML 文档：编译后的 CSS + demo HTML
  // 没编译过（compiledCss 为空）时，iframe 显示提示信息
  const previewDoc = useMemo(() => {
    const styleContent = compiledCss || "/* 尚未编译，点击「编译预览」按钮 */";
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;
      color: #1e293b;
      background: #ffffff;
    }
    .sass-demo h2 { font-size: 18px; margin: 0 0 8px; }
    .sass-demo h3 { font-size: 15px; margin: 16px 0 8px; color: #64748b; }
    /* 用户编译后的 CSS */
    ${styleContent}
  </style>
</head>
<body>
  ${DEMO_HTML}
</body>
</html>`;
  }, [compiledCss]);

  const activeChapter =
    sassChapters.find((c) => c.id === activeId) || sassChapters[0];

  // ---------- 切换章节 ----------
  const selectChapter = useCallback((chapterId) => {
    const chapter = sassChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setCode(chapter.code);
    setCompiledCss("");
    setError("");
    setHasRun(false);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  // ---------- 编译预览 ----------
  // 调 /api/run-sass 把 SCSS 编译成 CSS，成功后刷新 iframe
  const runPreview = useCallback(async () => {
    setIsRunning(true);
    setError("");
    try {
      const res = await fetch("/api/run-sass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.error) {
        setCompiledCss("");
        setError(data.error);
      } else {
        setCompiledCss(data.css || "");
        setError(data.warnings && data.warnings.length ? data.warnings.join("\n") : "");
      }
      setHasRun(true);
      setPreviewKey((k) => k + 1); // 强制刷新 iframe
    } catch (err) {
      setError("请求失败: " + err.message);
      setCompiledCss("");
    } finally {
      setIsRunning(false);
    }
  }, [code]);

  // ---------- 重置代码 ----------
  const resetCode = useCallback(() => {
    setCode(activeChapter.code);
    setCompiledCss("");
    setError("");
    setHasRun(false);
  }, [activeChapter]);

  // ---------- 在 Playground 中打开 ----------
  const handlePlayground = useCallback(() => {
    try {
      localStorage.setItem("playground:code:sass", code);
    } catch {}
    window.open(`/playground?lang=sass`, "_blank", "noopener,noreferrer");
  }, [code]);

  // ---------- 键盘快捷键：Ctrl/Cmd + Enter 编译预览 ----------
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runPreview();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [runPreview]);

  // 按分组组织章节
  const groupedChapters = sassChapterGroups.map((group) => ({
    group,
    items: sassChapters.filter((c) => c.group === group),
  }));

  return (
    <div className="app-shell">
      <div className="main-layout">
        {/* ===== 侧边栏：章节导航 ===== */}
        <Sidebar
          title="学习目录"
          tip="点击章节开始学习 Sass"
          footer={<p>💡 提示：按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 编译预览</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/sass"
          meta={`共 ${sassChapters.length} 章 · 在线编译运行`}
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
                <span className="editor-filename">style.scss</span>
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
                  onClick={runPreview}
                  disabled={isRunning}
                >
                  {isRunning ? "⏳ 编译中..." : "▶ 编译预览"}
                </button>
              </div>
            </div>
            <div className="editor-wrap">
              <MonacoEditor
                key={activeId}
                value={code}
                onChange={setCode}
                language="scss"
                onRun={runPreview}
              />
            </div>
          </section>

          {/* 编译错误区（语法错误显示在这里） */}
          {error && (
            <section className="console-section">
              <div className="console-header">
                <span className="console-title">编译输出</span>
                <span className="console-hint" style={{ color: "#dc2626" }}>
                  {compiledCss ? "警告" : "编译失败"}
                </span>
              </div>
              <div className="console-body">
                <pre className="console-error">
                  <span className="error-label">{compiledCss ? "警告:" : "错误:"}</span>
                  {"\n"}
                  {error}
                </pre>
              </div>
            </section>
          )}

          {/* 预览区（iframe 实时渲染） */}
          <section className="preview-section">
            <div className="preview-header">
              <span className="preview-title">实时预览</span>
              <span className="preview-hint">
                {isRunning ? "编译中..." : hasRun ? (compiledCss ? "已编译" : "编译失败") : '点击"编译预览"按钮查看效果'}
              </span>
            </div>
            <div className="preview-wrap">
              {hasRun && compiledCss ? (
                <iframe
                  key={previewKey}
                  className="preview-iframe"
                  srcDoc={previewDoc}
                  title="Sass 预览"
                  sandbox="allow-scripts"
                />
              ) : (
                <div className="preview-placeholder">
                  <span className="placeholder-icon">🎨</span>
                  <span>点击上方"编译预览"按钮，编译 SCSS 并查看渲染效果</span>
                </div>
              )}
            </div>
          </section>

          {/* 编译后的 CSS 输出（折叠展示，方便学习） */}
          {hasRun && compiledCss && (
            <section className="console-section">
              <div className="console-header">
                <span className="console-title">编译后的 CSS</span>
                <span className="console-hint">{compiledCss.split("\n").length} 行</span>
              </div>
              <div className="console-body">
                <pre className="console-output">{compiledCss}</pre>
              </div>
            </section>
          )}

          {/* 章节底部导航 */}
          <ChapterNav activeId={activeId} onSelect={selectChapter} />

          <footer className="content-footer">
            <p>
              Sass 交互式教程 · SCSS 由 dart-sass 编译成 CSS · 支持变量/嵌套/混入/继承/控制指令/函数，编译错误带行号提示
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// ===== 上一章 / 下一章 导航组件 =====
function ChapterNav({ activeId, onSelect }) {
  const idx = sassChapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? sassChapters[idx - 1] : null;
  const next = idx < sassChapters.length - 1 ? sassChapters[idx + 1] : null;

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
