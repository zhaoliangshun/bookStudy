"use client";

// =============================================================
// 代码块交互组件（增强版）
// -------------------------------------------------------------
// 在教程页面的每个 Markdown 代码块中使用与 Playground 完全相同的
// 代码编辑器组件，支持：
//   - 行号显示
//   - 语法高亮（叠加技术：透明 textarea 覆盖在高亮 pre 上）
//   - 可编辑（用户可修改代码后运行）
//   - VS Code 风格快捷键（Tab 缩进、Ctrl+/ 注释、Ctrl+D 复制行等）
//   - 复制 / 运行 / Playground 三个操作按钮
// =============================================================

import { useState, useCallback, useMemo } from "react";
import CodeEditor from "./components/CodeEditor";

// 高亮函数引入
import { highlightJavaScript } from "./highlight";
import { highlightTypeScript } from "./ts-highlight";
import { highlightPython } from "./py-highlight";
import { highlightJava } from "./java-highlight";
import { highlightCsharp } from "./csharp-highlight";
import { highlightGo } from "./go-highlight";
import { highlightScss } from "./sass-highlight";
import { highlightGraphQL } from "./gql-highlight";
import { highlightC } from "./c-highlight";
import { highlightCpp } from "./cpp-highlight";
import { highlightRuby } from "./ruby-highlight";
import { highlightSwift } from "./swift-highlight";
import { highlightShell } from "./shell-highlight";
import { highlightSql } from "./sql-highlight";

// ------------------------------------------------------------------
// 语言映射表
// ------------------------------------------------------------------
// key      —— Markdown 代码围栏的语言标识（小写）
// api      —— 后端执行接口路径（为空则不可运行）
// pgId     —— Playground 语言 id（为空则无 Playground 按钮）
// label    —— 工具栏显示的语言名称
// highlight —— 语法高亮函数
// comment  —— 行注释前缀（用于 Ctrl+/ 快捷键）
// ------------------------------------------------------------------
const LANG_MAP = {
  // JavaScript / Node.js
  js: { api: "/api/run", pgId: "node", label: "JavaScript", highlight: highlightJavaScript, comment: "//" },
  javascript: { api: "/api/run", pgId: "node", label: "JavaScript", highlight: highlightJavaScript, comment: "//" },
  jsx: { api: "/api/run", pgId: "node", label: "JavaScript", highlight: highlightJavaScript, comment: "//" },
  node: { api: "/api/run", pgId: "node", label: "Node.js", highlight: highlightJavaScript, comment: "//" },
  // TypeScript
  ts: { api: "/api/run-ts", pgId: "ts", label: "TypeScript", highlight: highlightTypeScript, comment: "//" },
  typescript: { api: "/api/run-ts", pgId: "ts", label: "TypeScript", highlight: highlightTypeScript, comment: "//" },
  tsx: { api: "/api/run-ts", pgId: "ts", label: "TypeScript", highlight: highlightTypeScript, comment: "//" },
  // Python
  py: { api: "/api/run-py", pgId: "python", label: "Python", highlight: highlightPython, comment: "#" },
  python: { api: "/api/run-py", pgId: "python", label: "Python", highlight: highlightPython, comment: "#" },
  // Java
  java: { api: "/api/run-java", pgId: "java", label: "Java", highlight: highlightJava, comment: "//" },
  // C#
  cs: { api: "/api/run-csharp", pgId: "csharp", label: "C#", highlight: highlightCsharp, comment: "//" },
  csharp: { api: "/api/run-csharp", pgId: "csharp", label: "C#", highlight: highlightCsharp, comment: "//" },
  // Go
  go: { api: "/api/run-go", pgId: "go", label: "Go", highlight: highlightGo, comment: "//" },
  golang: { api: "/api/run-go", pgId: "go", label: "Go", highlight: highlightGo, comment: "//" },
  // Sass / SCSS
  scss: { api: "/api/run-sass", pgId: "sass", label: "SCSS", highlight: highlightScss, comment: "//" },
  sass: { api: "/api/run-sass", pgId: "sass", label: "Sass", highlight: highlightScss, comment: "//" },
  // GraphQL
  gql: { api: "/api/run-gql", pgId: "gql", label: "GraphQL", highlight: highlightGraphQL, comment: "#" },
  graphql: { api: "/api/run-gql", pgId: "gql", label: "GraphQL", highlight: highlightGraphQL, comment: "#" },
  // C
  c: { api: "/api/run-c", pgId: "c", label: "C", highlight: highlightC, comment: "//" },
  // C++
  cpp: { api: "/api/run-cpp", pgId: "cpp", label: "C++", highlight: highlightCpp, comment: "//" },
  "c++": { api: "/api/run-cpp", pgId: "cpp", label: "C++", highlight: highlightCpp, comment: "//" },
  cc: { api: "/api/run-cpp", pgId: "cpp", label: "C++", highlight: highlightCpp, comment: "//" },
  // Ruby
  rb: { api: "/api/run-ruby", pgId: "ruby", label: "Ruby", highlight: highlightRuby, comment: "#" },
  ruby: { api: "/api/run-ruby", pgId: "ruby", label: "Ruby", highlight: highlightRuby, comment: "#" },
  // Swift
  swift: { api: "/api/run-swift", pgId: "swift", label: "Swift", highlight: highlightSwift, comment: "//" },
  // Shell
  sh: { api: "/api/run-shell", pgId: "shell", label: "Shell", highlight: highlightShell, comment: "#" },
  bash: { api: "/api/run-shell", pgId: "shell", label: "Shell", highlight: highlightShell, comment: "#" },
  shell: { api: "/api/run-shell", pgId: "shell", label: "Shell", highlight: highlightShell, comment: "#" },
  zsh: { api: "/api/run-shell", pgId: "shell", label: "Shell", highlight: highlightShell, comment: "#" },
  // SQL
  sql: { api: "/api/run-sql", pgId: "sql", label: "SQL", highlight: highlightSql, comment: "--" },
  // 纯文本 / JSON / HTML / CSS 等不可运行语言（仅显示，不提供运行按钮）
  json: { label: "JSON", highlight: null, comment: "//" },
  html: { label: "HTML", highlight: null, comment: "<!--" },
  css: { label: "CSS", highlight: null, comment: "/*" },
  text: { label: "Text", highlight: null, comment: "#" },
  plain: { label: "Text", highlight: null, comment: "#" },
  yaml: { label: "YAML", highlight: null, comment: "#" },
  yml: { label: "YAML", highlight: null, comment: "#" },
  xml: { label: "XML", highlight: null, comment: "<!--" },
  md: { label: "Markdown", highlight: null, comment: "<!--" },
  markdown: { label: "Markdown", highlight: null, comment: "<!--" },
  dockerfile: { label: "Dockerfile", highlight: null, comment: "#" },
  nginx: { label: "Nginx", highlight: null, comment: "#" },
  ini: { label: "INI", highlight: null, comment: ";" },
  toml: { label: "TOML", highlight: null, comment: "#" },
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

export function CodeBlock({ code: initialCode, lang }) {
  // 可编辑代码状态
  const [code, setCode] = useState(initialCode);
  // 交互状态
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  // 语言信息查询
  const langLower = (lang || "").toLowerCase().trim();
  const langInfo = LANG_MAP[langLower];
  const canRun = !!langInfo?.api;
  const canPlayground = !!langInfo?.pgId;
  const displayLabel = langInfo?.label || (lang ? lang.toUpperCase() : "");
  const highlightFn = langInfo?.highlight || null;
  const commentPrefix = langInfo?.comment || "//";

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
    setTimeout(() => setCopied(false), 1500);
  }, [code]);

  // ---------- 就地运行代码 ----------
  const handleRun = useCallback(async () => {
    if (!langInfo?.api) return;
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
      const data = await res.json();
      const parsed = parseRunResult(langLower, data);
      setOutput(parsed.output || "(无输出)");
      setError(parsed.error || "");
    } catch (err) {
      setError("请求失败: " + err.message);
      setOutput("");
    } finally {
      setIsRunning(false);
    }
  }, [code, langLower, langInfo]);

  // ---------- 复制到 Playground 并在新标签页打开 ----------
  const handlePlayground = useCallback(() => {
    if (!langInfo?.pgId) return;
    try {
      localStorage.setItem("playground:code:" + langInfo.pgId, code);
    } catch {}
    window.open(
      `/playground?lang=${langInfo.pgId}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, [code, langInfo]);

  // ---------- 重置代码 ----------
  const handleReset = useCallback(() => {
    setCode(initialCode);
  }, [initialCode]);

  // 代码是否有修改（用于显示重置按钮）
  const hasChanged = code !== initialCode;

  return (
    <div className={`md-code-block-wrap ${showOutput ? "has-output" : ""}`}>
      {/* 代码编辑器（与 Playground 完全相同的组件） */}
      <div className="md-code-editor-container">
        <CodeEditor
          value={code}
          onChange={setCode}
          highlight={highlightFn}
          comment={commentPrefix}
          onRun={canRun ? handleRun : undefined}
          minHeight={80}
          maxHeight={400}
          placeholder=""
        />
      </div>

      {/* 右上角工具栏 */}
      <div className="md-code-toolbar">
        {displayLabel && (
          <span className="md-code-lang-tag">{displayLabel}</span>
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
            disabled={isRunning}
            title={`运行 ${langInfo.label} 代码（Ctrl/Cmd + Enter）`}
          >
            {isRunning ? "运行中..." : "▶ 运行"}
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
