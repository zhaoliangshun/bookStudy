"use client";

// =============================================================
// MonacoEditor 包装组件
// -------------------------------------------------------------
// 用 Monaco Editor（VS Code 同款编辑器）提供代码编辑能力。
// 完全使用 Monaco 默认配置，不添加任何自定义主题/字体/快捷键。
// 仅保留必要的运行回调（Ctrl/Cmd + Enter）。
//
// 用法：
//   <MonacoEditor
//     value={code}
//     onChange={setCode}
//     language="python"           // Playground 语言 id（见 LANG_MAP）
//     onRun={runCode}             // 可选，Ctrl/Cmd+Enter 回调
//     minHeight={120}             // 可选，最小高度
//     maxHeight={520}             // 可选，最大高度
//     placeholder=""              // 可选，占位提示（未实现，保留接口）
//   />
// =============================================================

import { useEffect, useRef, useCallback } from "react";
import Editor, { loader } from "@monaco-editor/react";

// ---------- 语言 id → Monaco 语言 id 映射 ----------
// playground 里的 lang.id 和 Monaco 的语言 id 不完全一致，这里统一映射。
// 未命中的回退到 "plaintext"。
const LANG_MAP = {
  node: "javascript",
  javascript: "javascript",
  js: "javascript",
  jsx: "javascript",
  backend: "javascript",
  ts: "typescript",
  typescript: "typescript",
  tsx: "typescript",
  python: "python",
  py: "python",
  java: "java",
  csharp: "csharp",
  cs: "csharp",
  go: "go",
  golang: "go",
  sass: "scss",
  scss: "scss",
  gql: "graphql",
  graphql: "graphql",
  c: "c",
  cpp: "cpp",
  "c++": "cpp",
  cc: "cpp",
  ruby: "ruby",
  rb: "ruby",
  swift: "swift",
  shell: "shell",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  sql: "sql",
  html: "html",
  css: "css",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  xml: "xml",
  md: "markdown",
  markdown: "markdown",
  dockerfile: "dockerfile",
  ini: "ini",
  toml: "ini",
  nginx: "plaintext",
  text: "plaintext",
  plain: "plaintext",
};

// ---------- 配置 Monaco CDN ----------
loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs",
  },
});

export default function MonacoEditor({
  value = "",
  onChange,
  language = "javascript",
  onRun,
  minHeight = 120,
  maxHeight = 520,
  placeholder = "",
}) {
  const editorRef = useRef(null);
  // onRun 用 ref 包一层，避免回调变化时反复重新注册命令
  const onRunRef = useRef(onRun);
  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  // ---------- 编辑器挂载时的初始化 ----------
  const handleMount = useCallback((editor) => {
    editorRef.current = editor;

    // ---------- 注册 Ctrl/Cmd + Enter 运行代码 ----------
    // 2048 = CtrlCmd 位掩码，3 = Enter
    editor.addCommand(2048 | 3, () => {
      if (typeof onRunRef.current === "function") {
        onRunRef.current();
      }
    }, "");

    // ---------- 强制重新布局 ----------
    // Monaco 在 flex 容器里首次挂载时，可能因为容器尺寸还没稳定，
    // 导致显示异常。等下一帧容器布局完成后强制重新测量。
    requestAnimationFrame(() => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    });
  }, []);

  // ---------- 卸载时清理 ----------
  useEffect(() => {
    return () => {
      editorRef.current = null;
    };
  }, []);

  return (
    <div
      className="monaco-editor-wrap"
      style={{
        minHeight: `${minHeight}px`,
        maxHeight: `${maxHeight}px`,
        height: "100%",
      }}
    >
      <Editor
        height="100%"
        width="100%"
        language={LANG_MAP[language] || "plaintext"}
        value={value}
        onChange={(val) => onChange?.(val ?? "")}
        onMount={handleMount}
        loading={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
              color: "#64748b",
              fontFamily: "system-ui, sans-serif",
              fontSize: 13,
            }}
          >
            正在加载编辑器…
          </div>
        }
      />
    </div>
  );
}
