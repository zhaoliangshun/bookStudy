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
//     autoHeight={false}          // 可选，true=根据内容自动调整高度（代码少时不留白、无滚动条）
//     placeholder=""              // 可选，占位提示（未实现，保留接口）
//   />
//
// autoHeight 说明：
//   - false（默认）：编辑器绝对定位撑满父容器，适合固定区域（Playground、教程主编辑器）
//   - true：编辑器高度随内容变化，受 minHeight/maxHeight 限制，适合代码块（CodeBlock）
//           代码少时编辑器也小，不会出现多余滚动条和留白
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
  autoHeight = false,
}) {
  const editorRef = useRef(null);
  const wrapRef = useRef(null);
  // onRun 用 ref 包一层，避免回调变化时反复重新注册命令
  const onRunRef = useRef(onRun);
  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  // 把 autoHeight/minHeight/maxHeight 放进 ref，handleMount 只跑一次也能拿到最新值
  const configRef = useRef({ autoHeight, minHeight, maxHeight });
  useEffect(() => {
    configRef.current = { autoHeight, minHeight, maxHeight };
  }, [autoHeight, minHeight, maxHeight]);

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

    const { autoHeight: auto, minHeight: minH, maxHeight: maxH } = configRef.current;

    if (auto) {
      // ---------- 自动高度模式 ----------
      // 根据内容高度动态调整容器高度，代码少时编辑器也小，
      // 不会出现留白和多余的滚动条。受 minHeight/maxHeight 限制。
      const updateHeight = () => {
        const contentHeight = editor.getContentHeight();
        // +2px 余量：Monaco 的 getContentHeight 偶有 1-2px 计算误差，
        // 不加余量会出现多余的垂直滚动条。
        const h = Math.min(Math.max(contentHeight + 2, minH), maxH);
        if (wrapRef.current) {
          wrapRef.current.style.height = `${h}px`;
        }
        // 重新测量让 Monaco 适配新高度
        editor.layout();
      };
      editor.onDidContentSizeChange(updateHeight);
      updateHeight();
    } else {
      // ---------- 填充父容器模式 ----------
      // Monaco 在 flex 容器里首次挂载时，可能因为容器尺寸还没稳定，
      // 导致显示异常。等下一帧容器布局完成后强制重新测量。
      requestAnimationFrame(() => {
        if (editorRef.current) {
          editorRef.current.layout();
        }
      });
    }
  }, []);

  // ---------- 卸载时清理 ----------
  useEffect(() => {
    return () => {
      editorRef.current = null;
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`monaco-editor-wrap${autoHeight ? " auto-height" : ""}`}
      // autoHeight 模式才需要 minHeight/maxHeight 限制高度（教程代码块）。
      // 非 autoHeight 模式（playground）由 CSS 的 position:absolute; inset:0
      // 撑满父容器，加 inline 限制反而会导致编辑器只占 maxHeight 高度，
      // 下方出现空白。
      style={
        autoHeight
          ? { minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px` }
          : undefined
      }
    >
      <Editor
        height="100%"
        width="100%"
        language={LANG_MAP[language] || "plaintext"}
        value={value}
        onChange={(val) => onChange?.(val ?? "")}
        onMount={handleMount}
        options={{
          // 代码不足一屏时不在最后一行后留白，避免出现多余的垂直滚动条
          scrollBeyondLastLine: false,
          // 超长行不水平滚动（按需折行），避免横向滚动条
          wordWrap: "on",
          // 滚动条样式：更细、无阴影、按需显示
          scrollbar: {
            // autoHeight 模式下编辑器高度等于内容高度，垂直滚动条没意义，
            // 且 getContentHeight 偶有 1-2px 误差会触发多余滚动条，直接隐藏。
            vertical: autoHeight ? "hidden" : "auto",
            horizontal: "auto",
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
            useShadows: false,
            alwaysConsumeMouseWheel: false,
          },
          // minimap 默认关闭（教程场景不需要缩略图）
          minimap: { enabled: false },
          // 关闭粘性滚动（VS Code 新特性，教程场景不需要）
          stickyScroll: { enabled: false },
          // 关闭右侧的装饰概览尺（标记缩略条），让右侧更干净
          overviewRulerLanes: 0,
        }}
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
