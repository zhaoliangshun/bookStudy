"use client";

// =============================================================
// 代码块交互组件（增强版）
// -------------------------------------------------------------
// 在教程页面的每个 Markdown 代码块中使用 Monaco 编辑器，支持：
//   - 行号显示、语法高亮、代码折叠（Monaco 内置）
//   - 可编辑（用户可修改代码后运行）
//   - VS Code 风格快捷键（Monaco 内置）
//   - 复制 / 运行 / Playground / 外网运行 四个操作按钮
// =============================================================

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { getExternalPlaygrounds, openExternal } from "./external-playgrounds";

// Monaco Editor 依赖浏览器环境，必须关 SSR。
// 用 next/dynamic 在客户端动态加载。
const MonacoEditor = dynamic(
  () => import("./components/MonacoEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="md-code-loading">正在加载编辑器…</div>
    ),
  }
);

// ------------------------------------------------------------------
// 语言映射表
// ------------------------------------------------------------------
// key      —— Markdown 代码围栏的语言标识（小写）
// api      —— 后端执行接口路径（为空则不可运行）
// pgId     —— Playground 语言 id（为空则无 Playground 按钮）
// label    —— 工具栏显示的语言名称
// lang     —— 传给 Monaco 的语言 id（为空则用 key 本身）
// ------------------------------------------------------------------
const LANG_MAP = {
  // JavaScript / Node.js
  js: { api: "/api/run", pgId: "node", label: "JavaScript", lang: "javascript" },
  javascript: { api: "/api/run", pgId: "node", label: "JavaScript", lang: "javascript" },
  jsx: { api: "/api/run", pgId: "node", label: "JavaScript", lang: "javascript" },
  node: { api: "/api/run", pgId: "node", label: "Node.js", lang: "javascript" },
  // TypeScript
  ts: { api: "/api/run-ts", pgId: "ts", label: "TypeScript", lang: "typescript" },
  typescript: { api: "/api/run-ts", pgId: "ts", label: "TypeScript", lang: "typescript" },
  tsx: { api: "/api/run-ts", pgId: "ts", label: "TypeScript", lang: "typescript" },
  // Python
  py: { api: "/api/run-py", pgId: "python", label: "Python", lang: "python" },
  python: { api: "/api/run-py", pgId: "python", label: "Python", lang: "python" },
  // Java
  java: { api: "/api/run-java", pgId: "java", label: "Java", lang: "java" },
  // C#
  cs: { api: "/api/run-csharp", pgId: "csharp", label: "C#", lang: "csharp" },
  csharp: { api: "/api/run-csharp", pgId: "csharp", label: "C#", lang: "csharp" },
  // Go
  go: { api: "/api/run-go", pgId: "go", label: "Go", lang: "go" },
  golang: { api: "/api/run-go", pgId: "go", label: "Go", lang: "go" },
  // Sass / SCSS
  scss: { api: "/api/run-sass", pgId: "sass", label: "SCSS", lang: "scss" },
  sass: { api: "/api/run-sass", pgId: "sass", label: "Sass", lang: "scss" },
  // GraphQL
  gql: { api: "/api/run-gql", pgId: "gql", label: "GraphQL", lang: "graphql" },
  graphql: { api: "/api/run-gql", pgId: "gql", label: "GraphQL", lang: "graphql" },
  // C
  c: { api: "/api/run-c", pgId: "c", label: "C", lang: "c" },
  // C++
  cpp: { api: "/api/run-cpp", pgId: "cpp", label: "C++", lang: "cpp" },
  "c++": { api: "/api/run-cpp", pgId: "cpp", label: "C++", lang: "cpp" },
  cc: { api: "/api/run-cpp", pgId: "cpp", label: "C++", lang: "cpp" },
  // Ruby
  rb: { api: "/api/run-ruby", pgId: "ruby", label: "Ruby", lang: "ruby" },
  ruby: { api: "/api/run-ruby", pgId: "ruby", label: "Ruby", lang: "ruby" },
  // Swift
  swift: { api: "/api/run-swift", pgId: "swift", label: "Swift", lang: "swift" },
  // Shell
  sh: { api: "/api/run-shell", pgId: "shell", label: "Shell", lang: "shell" },
  bash: { api: "/api/run-shell", pgId: "shell", label: "Shell", lang: "shell" },
  shell: { api: "/api/run-shell", pgId: "shell", label: "Shell", lang: "shell" },
  zsh: { api: "/api/run-shell", pgId: "shell", label: "Shell", lang: "shell" },
  // SQL
  sql: { api: "/api/run-sql", pgId: "sql", label: "SQL", lang: "sql" },
  // 纯文本 / JSON / HTML / CSS 等不可运行语言（仅显示，不提供运行按钮）
  json: { label: "JSON", lang: "json" },
  html: { label: "HTML", lang: "html" },
  css: { label: "CSS", lang: "css" },
  text: { label: "Text", lang: "plaintext" },
  plain: { label: "Text", lang: "plaintext" },
  yaml: { label: "YAML", lang: "yaml" },
  yml: { label: "YAML", lang: "yaml" },
  xml: { label: "XML", lang: "xml" },
  md: { label: "Markdown", lang: "markdown" },
  markdown: { label: "Markdown", lang: "markdown" },
  dockerfile: { label: "Dockerfile", lang: "dockerfile" },
  nginx: { label: "Nginx", lang: "plaintext" },
  ini: { label: "INI", lang: "ini" },
  toml: { label: "TOML", lang: "ini" },
};

// ------------------------------------------------------------------
// 运行结果解析
// ------------------------------------------------------------------
function parseRunResult(langLower, data) {
  if (langLower === "scss" || langLower === "sass") {
    let output = "";
    if (data.css) output = data.css;
    if (data.warnings && data.warnings.length > 0) {
      output += (output ? "\n\n" : "") + "[编译警告]\n" + data.warnings.join("\n");
    }
    return { output: output || "(无输出：编译失败或代码为空)", error: data.error || "" };
  }
  if (langLower === "gql" || langLower === "graphql") {
    let output = "";
    if (data.data !== null && data.data !== undefined) {
      output = JSON.stringify(data.data, null, 2);
    }
    let error = "";
    if (data.errors && data.errors.length > 0) {
      error = data.errors.map((e) => e.message).join("\n");
    }
    if (!output && !error) output = "(无返回数据)";
    return { output, error };
  }
  return { output: data.output || "(无输出)", error: data.error || "" };
}

export function CodeBlock({ code: initialCode, lang, maxHeight = 300 }) {
  // 可编辑代码状态
  const [code, setCode] = useState(initialCode);

  // 交互状态
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  // 外网运行下拉菜单展开状态
  const [extMenuOpen, setExtMenuOpen] = useState(false);
  // 在线状态：离线时禁用"运行"和"外网运行"按钮
  // 初始值统一用 true（保证 SSR 和客户端首次渲染一致，避免 hydration 不匹配），
  // 在 useEffect 中再读取真实的 navigator.onLine
  const [isOnline, setIsOnline] = useState(true);

  // 复制按钮定时器 / 运行请求 ID（用于清理，避免内存泄漏与竞态）
  const copyTimerRef = useRef(null);
  const runIdRef = useRef(0);

  // 监听浏览器 online / offline 事件，实时更新在线状态
  // PWA 离线模式下，navigator.onLine 会变 false，按钮自动禁用
  useEffect(() => {
    // 客户端首次挂载时同步真实的在线状态
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 组件卸载时清理复制按钮定时器，防止 setState 作用于已卸载组件
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  // 当外部传入的初始代码变化时（例如切换章节导致 Markdown 重新渲染，
  // 或 React 复用了旧的 CodeBlock 实例），同步更新内部编辑状态，
  // 避免旧章节代码残留在编辑器中。
  // 同时清掉上一次的运行结果（output / error / showOutput），
  // 否则切换章节后还会看到旧章节的运行输出。
  // 注意：useEffect 必须放在它所引用的 state 声明之后，否则会触发
  // “变量未声明即使用”的报错（temporal dead zone）。
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setCode(initialCode);
      setOutput("");
      setError("");
      setShowOutput(false);
    });
    return () => cancelAnimationFrame(id);
  }, [initialCode]);

  // 语言信息查询
  const langLower = (lang || "").toLowerCase().trim();
  const langInfo = LANG_MAP[langLower];
  const canRun = !!langInfo?.api;
  const canPlayground = !!langInfo?.pgId;
  const displayLabel = langInfo?.label || (lang ? lang.toUpperCase() : "");
  const monacoLang = langInfo?.lang || langLower || "plaintext";

  // 当前语言可用的外网平台列表
  const externalPGs = useMemo(
    () => getExternalPlaygrounds(langLower),
    [langLower]
  );
  const canExternal = externalPGs.length > 0;

  // 离线时禁用"运行"和"外网运行"按钮（这些功能依赖后端或外网）
  // 复制 / Playground / 重置 仍可用：Playground 页面本身已被 SW 缓存
  const runDisabled = !canRun || isRunning || !isOnline;
  const extDisabled = !canExternal || !isOnline;

  // ---------- 复制代码到剪贴板 ----------
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = code;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {}
    }
    setCopied(true);
    // 清理上一次的定时器，避免快速连续复制时多个定时器互相覆盖
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 1500);
  }, [code]);

  // ---------- 就地运行代码 ----------
  const handleRun = useCallback(async () => {
    if (!langInfo?.api) return;
    // 离线防御：即使按钮被绕过（如 Ctrl+Enter 快捷键），也不发请求
    if (!isOnline) {
      setShowOutput(true);
      setOutput("");
      setError("离线模式：代码运行不可用，请连接网络后重试");
      return;
    }
    // 递增请求 ID，用于丢弃快速连续点击时产生的过期请求结果
    const currentRunId = ++runIdRef.current;
    setIsRunning(true);
    setShowOutput(true);
    setOutput(`正在执行 ${langInfo.label}...`);
    setError("");
    try {
      const res = await fetch(langInfo.api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      // 有更新的请求发起，丢弃旧结果，避免竞态
      if (runIdRef.current !== currentRunId) return;
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        if (runIdRef.current !== currentRunId) return;
        setError(`执行失败 (HTTP ${res.status})${errText ? ": " + errText : ""}`);
        setOutput("");
        return;
      }
      const data = await res.json();
      if (runIdRef.current !== currentRunId) return;
      const parsed = parseRunResult(langLower, data);
      setOutput(parsed.output || "(无输出)");
      setError(parsed.error || "");
    } catch (err) {
      if (runIdRef.current !== currentRunId) return;
      setError("请求失败: " + err.message);
      setOutput("");
    } finally {
      // 仅当本次请求仍是最新请求时才复位 isRunning，
      // 否则会误关更新的运行中请求的加载状态
      if (runIdRef.current === currentRunId) {
        setIsRunning(false);
      }
    }
  }, [code, langLower, langInfo, isOnline]);

  // ---------- 复制到 Playground 并打开 ----------
  // 使用固定的窗口名 "playground"：如果已有同名标签页，则复用它
  // （导航到新 URL 触发重新加载），而不是每次都打开新标签页。
  // 不使用 noopener，以便复用标签页时能手动 focus 将其置于前台。
  const handlePlayground = useCallback(() => {
    if (!langInfo?.pgId) return;
    try {
      localStorage.setItem("playground:code:" + langInfo.pgId, code);
    } catch {}
    const win = window.open(
      `/playground?lang=${langInfo.pgId}`,
      "playground"
    );
    // 复用已打开的标签页时，手动将其聚焦到前台
    if (win) win.focus();
  }, [code, langInfo]);

  // ---------- 重置代码 ----------
  const handleReset = useCallback(() => {
    setCode(initialCode);
  }, [initialCode]);

  // ---------- 打开外网在线运行平台 ----------
  const handleExternal = useCallback(
    async (pgId) => {
      setExtMenuOpen(false);
      await openExternal(pgId, code, langLower);
    },
    [code, langLower]
  );

  // ---------- 外网下拉菜单：点击外部自动收起 ----------
  useEffect(() => {
    if (!extMenuOpen) return;
    const handler = (e) => {
      if (!e.target.closest || !e.target.closest(".md-ext-dropdown")) {
        setExtMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [extMenuOpen]);

  // 代码是否有修改（用于显示重置按钮）
  const hasChanged = code !== initialCode;

  return (
    <div className={`md-code-block-wrap ${showOutput ? "has-output" : ""}`}>
      {/* 顶部黑色工具栏：语言标签 + 操作按钮（仿 Playground pg-pane-header） */}
      <div className="md-code-toolbar">
        <div className="md-code-toolbar-left">
          <span className="dot dot-red"></span>
          <span className="dot dot-yellow"></span>
          <span className="dot dot-green"></span>
          {displayLabel && (
            <span className="md-code-lang-tag">{displayLabel}</span>
          )}
        </div>
        <div className="md-code-toolbar-right">
          {canExternal && (
            <div className="md-ext-dropdown">
              <button
                className="md-code-btn md-code-btn-ext"
                onClick={() => !extDisabled && setExtMenuOpen((v) => !v)}
                disabled={extDisabled}
                title={
                  isOnline
                    ? "在外部网站运行代码（无需本地环境）"
                    : "离线模式：外网运行不可用"
                }
                aria-expanded={extMenuOpen}
                aria-haspopup="menu"
              >
                🌐 外网 <span className="pg-caret">▾</span>
              </button>
              {extMenuOpen && !extDisabled && (
                <div className="md-ext-menu" role="menu">
                  {externalPGs.map((pg) => (
                    <button
                      key={pg.id}
                      className="md-ext-item"
                      onClick={() => handleExternal(pg.id)}
                      role="menuitem"
                    >
                      <span className="md-ext-icon">{pg.icon}</span>
                      <span>{pg.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {hasChanged && (
            <button
              className="md-code-btn"
              onClick={handleReset}
              title="重置为原始代码"
            >
              ↺ 重置
            </button>
          )}
          <button
            className="md-code-btn"
            onClick={handleCopy}
            title="复制代码到剪贴板"
          >
            {copied ? "✓ 已复制" : "复制"}
          </button>
          {canRun && (
            <button
              className="md-code-btn md-code-btn-run"
              onClick={handleRun}
              disabled={runDisabled}
              title={
                isOnline
                  ? `运行 ${langInfo.label} 代码（Ctrl/Cmd + Enter）`
                  : "离线模式：代码运行不可用，请联网后重试"
              }
            >
              {isRunning
                ? "运行中..."
                : isOnline
                ? "▶ 运行"
                : "✈ 离线"}
            </button>
          )}
          {canPlayground && (
            <button
              className="md-code-btn md-code-btn-pg"
              onClick={handlePlayground}
              title="在 Playground 中打开"
            >
              🚀 Playground
            </button>
          )}
        </div>
      </div>

      {/* 代码编辑器（Monaco） */}
      <div className="md-code-editor-container">
        <MonacoEditor
          value={code}
          onChange={setCode}
          language={monacoLang}
          onRun={canRun ? handleRun : undefined}
          minHeight={60}
          maxHeight={maxHeight}
          autoHeight
        />
      </div>

      {/* 运行结果输出面板 */}
      {showOutput && (
        <div className="md-code-output">
          <div className="md-code-output-header">
            <span>运行结果</span>
            <button
              className="md-code-output-close"
              onClick={() => setShowOutput(false)}
              title="关闭结果面板"
            >
              ✕
            </button>
          </div>
          {output && (
            <pre className={`md-code-output-body ${error ? "has-error" : ""}`}>
              {output}
            </pre>
          )}
          {error && <pre className="md-code-output-error">{error}</pre>}
        </div>
      )}
    </div>
  );
}

export default CodeBlock;
