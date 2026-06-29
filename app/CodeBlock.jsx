"use client";

// =============================================================
// 代码块交互组件
// -------------------------------------------------------------
// 在教程页面的每个 Markdown 代码块右上角提供三个操作按钮：
//   1. 复制     —— 把代码复制到剪贴板
//   2. 运行     —— 就地调用后端 API 执行代码，并在代码块下方
//                  展示运行结果（stdout / stderr）
//   3. Playground —— 把代码写入 localStorage 后跳转到 /playground
//                  页面，并自动选中对应的语言环境
//
// 设计要点：
//   - 通过 LANG_MAP 把 Markdown 代码块的语言标识（如 py、ts、java）
//     映射到后端执行接口和 Playground 语言 id。
//   - 无法运行的语言（如 json、html、text）只显示「复制」按钮。
//   - Playground 按钮仅在语言有对应 pgId 时显示。
//   - 运行结果就地展示，可手动关闭，不跳转页面。
// =============================================================

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ------------------------------------------------------------------
// 语言映射表
// ------------------------------------------------------------------
// key   —— Markdown 代码围栏的语言标识（小写）
// api   —— 后端执行接口路径（为空则不可运行）
// pgId  —— Playground 语言 id（为空则无 Playground 按钮）
// label —— 工具栏显示的语言名称
// ------------------------------------------------------------------
const LANG_MAP = {
  // JavaScript / Node.js
  js: { api: "/api/run", pgId: "node", label: "JavaScript" },
  javascript: { api: "/api/run", pgId: "node", label: "JavaScript" },
  jsx: { api: "/api/run", pgId: "node", label: "JavaScript" },
  node: { api: "/api/run", pgId: "node", label: "Node.js" },
  // TypeScript
  ts: { api: "/api/run-ts", pgId: "ts", label: "TypeScript" },
  typescript: { api: "/api/run-ts", pgId: "ts", label: "TypeScript" },
  tsx: { api: "/api/run-ts", pgId: "ts", label: "TypeScript" },
  // Python
  py: { api: "/api/run-py", pgId: "python", label: "Python" },
  python: { api: "/api/run-py", pgId: "python", label: "Python" },
  // Java
  java: { api: "/api/run-java", pgId: "java", label: "Java" },
  // C#
  cs: { api: "/api/run-csharp", pgId: "csharp", label: "C#" },
  csharp: { api: "/api/run-csharp", pgId: "csharp", label: "C#" },
  // Go
  go: { api: "/api/run-go", pgId: "go", label: "Go" },
  golang: { api: "/api/run-go", pgId: "go", label: "Go" },
  // Sass / SCSS
  scss: { api: "/api/run-sass", pgId: "sass", label: "SCSS" },
  sass: { api: "/api/run-sass", pgId: "sass", label: "Sass" },
  // GraphQL
  gql: { api: "/api/run-gql", pgId: "gql", label: "GraphQL" },
  graphql: { api: "/api/run-gql", pgId: "gql", label: "GraphQL" },
  // C
  c: { api: "/api/run-c", pgId: "c", label: "C" },
  // C++
  cpp: { api: "/api/run-cpp", pgId: "cpp", label: "C++" },
  "c++": { api: "/api/run-cpp", pgId: "cpp", label: "C++" },
  cc: { api: "/api/run-cpp", pgId: "cpp", label: "C++" },
  // Ruby
  rb: { api: "/api/run-ruby", pgId: "ruby", label: "Ruby" },
  ruby: { api: "/api/run-ruby", pgId: "ruby", label: "Ruby" },
  // Swift
  swift: { api: "/api/run-swift", pgId: "swift", label: "Swift" },
  // Shell
  sh: { api: "/api/run-shell", pgId: "shell", label: "Shell" },
  bash: { api: "/api/run-shell", pgId: "shell", label: "Shell" },
  shell: { api: "/api/run-shell", pgId: "shell", label: "Shell" },
  zsh: { api: "/api/run-shell", pgId: "shell", label: "Shell" },
  // SQL
  sql: { api: "/api/run-sql", pgId: "sql", label: "SQL" },
};

// ------------------------------------------------------------------
// 运行结果解析
// ------------------------------------------------------------------
// 不同语言的后端接口返回格式不一致，这里统一转为 { output, error }：
//   - Sass 接口返回 { css, error, warnings }
//   - GraphQL 接口返回 { data, errors }
//   - 其余接口返回 { output, error }
// ------------------------------------------------------------------
function parseRunResult(langLower, data) {
  // Sass / SCSS：编译后输出 CSS
  if (langLower === "scss" || langLower === "sass") {
    let output = "";
    if (data.css) output = data.css;
    if (data.warnings && data.warnings.length > 0) {
      output +=
        (output ? "\n\n" : "") +
        "[编译警告]\n" +
        data.warnings.join("\n");
    }
    return {
      output: output || "(无输出：编译失败或代码为空)",
      error: data.error || "",
    };
  }

  // GraphQL：返回 { data, errors }
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

  // 默认格式：{ output, error }
  return { output: data.output || "(无输出)", error: data.error || "" };
}

export function CodeBlock({ code, lang }) {
  const router = useRouter();

  // 交互状态
  const [copied, setCopied] = useState(false); // 是否已复制（用于按钮文案反馈）
  const [output, setOutput] = useState(""); // 运行输出
  const [error, setError] = useState(""); // 运行错误
  const [isRunning, setIsRunning] = useState(false); // 是否正在运行
  const [showOutput, setShowOutput] = useState(false); // 是否展示输出面板

  // 语言信息查询
  const langLower = (lang || "").toLowerCase().trim();
  const langInfo = LANG_MAP[langLower];
  const canRun = !!langInfo?.api; // 是否可运行
  const canPlayground = !!langInfo?.pgId; // 是否支持 Playground
  // 工具栏语言标签：有映射用映射名，否则用原始 lang 大写
  const displayLabel = langInfo?.label || (lang ? lang.toUpperCase() : "");

  // ---------- 复制代码到剪贴板 ----------
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // 降级方案：某些浏览器（非 HTTPS）不支持 Clipboard API，
      // 用临时 textarea + execCommand 兜底
      try {
        const ta = document.createElement("textarea");
        ta.value = code;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        // 彻底失败则静默处理
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [code]);

  // ---------- 就地运行代码 ----------
  // 调用对应语言的后端 API，把返回结果展示在代码块下方面板
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

  // ---------- 复制到 Playground 并跳转 ----------
  // 把代码写入 localStorage（key 与 playground 页面一致），
  // 然后跳转到 /playground?lang=xxx，playground 会在挂载时
  // 读取 URL 参数自动切换到对应语言标签
  const handlePlayground = useCallback(() => {
    if (!langInfo?.pgId) return;
    try {
      localStorage.setItem("playground:code:" + langInfo.pgId, code);
    } catch {
      // localStorage 不可用时静默跳转（会使用默认代码）
    }
    router.push(`/playground?lang=${langInfo.pgId}`);
  }, [code, langInfo, router]);

  return (
    <div className={`md-code-block-wrap ${showOutput ? "has-output" : ""}`}>
      {/* 代码区 */}
      <pre className="md-code-block">
        <code className={lang ? `language-${lang}` : ""}>{code}</code>
      </pre>

      {/* 右上角工具栏 */}
      <div className="md-code-toolbar">
        {displayLabel && (
          <span className="md-code-lang-tag">{displayLabel}</span>
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
            title={`运行 ${langInfo.label} 代码`}
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
