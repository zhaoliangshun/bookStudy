"use client";

// =============================================================
// MonacoEditor 包装组件
// -------------------------------------------------------------
// 用 Monaco Editor（VS Code 同款编辑器）替换原来的手写 textarea 编辑器。
// 提供的能力：
//   1. 完整 VS Code 编辑体验：IntelliSense 补全、多光标、查找替换、
//      代码折叠、括号配对、悬停提示、minimap、错误波浪线等。
//   2. 多语言语法高亮（Monaco 内置，不需要外置 highlight 函数）。
//   3. 自定义 "Playground Light" 主题，配色对齐现有 var(--editor-*) 系列。
//   4. Ctrl/Cmd + Enter 运行代码（通过 onRun 回调）。
//   5. Tab 缩进、注释切换、行操作等 VS Code 原生快捷键。
//
// 用法：
//   <MonacoEditor
//     value={code}
//     onChange={setCode}
//     language="python"           // Monaco 语言 id（见 LANG_MAP）
//     onRun={runCode}             // 可选，Ctrl/Cmd+Enter 回调
//   />
//
// 加载方式：
//   Monaco 核心通过 CDN（jsdelivr）按需加载，避免本地 worker 配置。
//   组件本身需要在 next/dynamic({ ssr: false }) 下使用，因为 Monaco
//   依赖浏览器环境（DOM、Worker）。
// =============================================================

import { useEffect, useRef, useCallback } from "react";
import Editor, { loader } from "@monaco-editor/react";

// ---------- playground 语言 id → Monaco 语言 id 映射 ----------
// playground 里的 lang.id（如 "node" "ts" "python"）和 Monaco 的语言 id
// 不完全一致，这里统一映射。未命中的回退到 "plaintext"。
const LANG_MAP = {
  node: "javascript",
  javascript: "javascript",
  backend: "javascript",
  ts: "typescript",
  python: "python",
  java: "java",
  csharp: "csharp",
  go: "go",
  sass: "scss",
  gql: "graphql",
  c: "c",
  cpp: "cpp",
  ruby: "ruby",
  swift: "swift",
  shell: "shell",
  sql: "sql",
};

// 自定义主题名（在 onMount 里定义）
const THEME_NAME = "pg-light";

// ---------- 配置 Monaco CDN ----------
// 默认从 jsdelivr CDN 加载 monaco-editor 核心（约 5MB，按需 lazy 加载各语言）。
// 如果未来需要离线，可以改用 loader.config({ monaco: 本地 monaco 实例 })。
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
}) {
  // monaco 实例和 editor 实例的引用
  const monacoRef = useRef(null);
  const editorRef = useRef(null);
  // onRun 用 ref 包一层，避免回调变化时反复重新注册命令
  const onRunRef = useRef(onRun);
  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  // ---------- 编辑器挂载时的初始化 ----------
  const handleMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // ---------- 定义自定义主题：Playground Light ----------
    // 配色对齐 globals.css 里的 --editor-* 变量，让 Monaco 和原编辑器视觉一致。
    monaco.editor.defineTheme(THEME_NAME, {
      base: "vs",                 // 基于 vs（亮色）派生
      inherit: true,              // 继承 vs 主题的其它配色
      rules: [
        // token 颜色参考 VS Code Light+ 和原 .tok-* 类的配色
        { token: "comment", foreground: "6a9955", fontStyle: "italic" },
        { token: "string", foreground: "a31515" },
        { token: "number", foreground: "098658" },
        { token: "keyword", foreground: "0000ff" },
        { token: "type", foreground: "267f99" },
        { token: "function", foreground: "795e26" },
        { token: "variable", foreground: "1e293b" },
        { token: "constant", foreground: "836c00" },
      ],
      colors: {
        // 背景色（#ffffff = --editor-bg）
        "editor.background": "#ffffff",
        // 前景色（#1e293b = --editor-text）
        "editor.foreground": "#1e293b",
        // 光标颜色（#2563eb = --primary）
        "editorCursor.foreground": "#2563eb",
        // 当前行高亮背景
        "editor.lineHighlightBackground": "#f1f5f9",
        "editor.lineHighlightBorder": "#00000000",
        // 选区颜色
        "editor.selectionBackground": "#2563eb2e",
        "editor.inactiveSelectionBackground": "#2563eb1a",
        // 行号槽
        "editorGutter.background": "#f1f5f9",
        "editorLineNumber.foreground": "#94a3b8",
        "editorLineNumber.activeForeground": "#475569",
        // 匹配括号高亮
        "editorBracketMatch.background": "#2563eb2e",
        "editorBracketMatch.border": "#2563eb",
        // 焦点边框
        "editor.focusHighlightBorder": "#00000000",
        // 滚动条
        "editorScrollbar.background": "#f1f5f900",
        "scrollbarSlider.background": "#cbd5e1aa",
        "scrollbarSlider.hoverBackground": "#94a3b8",
        "scrollbarSlider.activeBackground": "#64748b",
        // minimap
        "minimap.background": "#fafbfc",
      },
    });

    // ---------- 注册 Ctrl/Cmd + Enter 运行代码 ----------
    // Monaco 自带很多命令，我们用 addCommand 注册一个独立命令。
    // 注意：addCommand 注册的命令在编辑器焦点状态下生效。
    editor.addCommand(
      // monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
      2048 | 3,                    // 2048 = CtrlCmd 位掩码，3 = Enter
      () => {
        if (typeof onRunRef.current === "function") {
          onRunRef.current();
        }
      },
      // 允许在所有上下文里触发（不限定 textarea 焦点）
      ""
    );

    // ---------- 暴露 editor 给外部（调试用）----------
    // 暴露到 window.__monacoEditor 方便控制台调试
    if (typeof window !== "undefined") {
      window.__monacoEditor = editor;
    }

    // ---------- 强制重新布局 ----------
    // Monaco 在 flex 容器里首次挂载时，可能因为容器尺寸还没稳定，
    // 导致 .margin（行号槽）宽度计算偏小、行号数字被裁。
    // 用 requestAnimationFrame 等下一帧（此时容器已布局完成），
    // 手动触发 layout() 强制重新测量，修复行号显示问题。
    requestAnimationFrame(() => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    });
  }, []);

  // ---------- 语言切换时，重新触发模型语言更新 ----------
  // Editor 组件的 language prop 变化会自动切换，但 Monaco 的 TS/JS
  // diagnostics 在切换语言时可能残留。这里在卸载时清理。
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        delete window.__monacoEditor;
      }
    };
  }, []);

  // ---------- Monaco 编辑器配置项 ----------
  const options = {
    // 主题
    theme: THEME_NAME,
    // 字体：和原 .code-editor 一致
    fontFamily:
      '"SF Mono", "Fira Code", "JetBrains Mono", Menlo, Monaco, Consolas, monospace',
    fontSize: 13,
    lineHeight: 1.6 * 13,        // ≈ 20.8，匹配原 line-height: 1.6
    fontLigatures: true,         // 启用 Fira Code 连字（如 => ===）
    // 行号：playground 空间有限，隐藏行号列让代码区更宽。
    // 用户可通过状态栏的"行 X · N 行"提示知道当前行号。
    lineNumbers: "off",
    // 缩进
    tabSize: 2,
    insertSpaces: true,
    detectIndentation: false,   // 关闭自动检测，固定用 2 空格
    // minimap：右侧缩略图。playground 空间有限，关闭以让代码区更宽。
    minimap: {
      enabled: false,
    },
    // 滚动
    automaticLayout: true,       // 自动跟随容器尺寸调整
    scrollBeyondLastLine: false,
    smoothScrolling: true,
    // 编辑体验
    cursorBlinking: "smooth",
    cursorSmoothCaretAnimation: "on",
    multiCursorModifier: "ctrlCmd", // Ctrl/Cmd + 点击 多光标
    roundedSelection: true,
    // 折叠
    folding: true,
    foldingStrategy: "indentation",
    // 括号配对
    matchBrackets: "always",
    autoClosingBrackets: "always",
    autoClosingQuotes: "always",
    autoSurround: "languageDefined",
    // 自动补全（IntelliSense）
    quickSuggestions: {
      other: true,
      comments: false,
      strings: true,
    },
    quickSuggestionsDelay: 200,
    suggestOnTriggerCharacters: true,
    tabCompletion: "on",
    acceptSuggestionOnEnter: "on",
    // 悬停提示
    hover: { enabled: true, delay: 300 },
    // 链接化（URL、文件路径可点击）
    links: true,
    // 鼠标滚轮 + 按住缩放字体
    mouseWheelZoom: true,
    // Tab 不展开为缩进字符（保留 Tab 字符）—— playground 代码用空格
    // 默认 insertSpaces=true 已经处理了
    // 隐藏右侧字形边距（用于断点，playground 不需要）
    glyphMargin: false,
    // 代码区上下内边距：给代码更多呼吸空间，避免紧贴行号槽顶部/底部
    padding: {
      top: 14,
      bottom: 14,
    },
    // 关闭原地拖拽选中（避免误触）
    dragAndDrop: false,
    // 不固定宽度，自动换行关掉（playground 是代码，应该可以横向滚动）
    wordWrap: "off",
    // 滚动条样式
    scrollbar: {
      vertical: "auto",
      horizontal: "auto",
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
      useShadows: false,
    },
    // 不显示大纲/面包屑（playground 单文件不需要）
    breadcrumbs: { enabled: false },
    // Tab 焦点行为：Tab 应在编辑器内插入缩进，而不是切到下一个控件
    tabFocusMode: false,
  };

  return (
    <Editor
      height="100%"
      width="100%"
      language={LANG_MAP[language] || "plaintext"}
      value={value}
      onChange={(val) => onChange?.(val ?? "")}
      onMount={handleMount}
      options={options}
      loading={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
            background: "#ffffff",
            color: "#64748b",
            fontFamily: "system-ui, sans-serif",
            fontSize: 13,
          }}
        >
          正在加载 Monaco Editor（首次约 1-3 秒）…
        </div>
      }
    />
  );
}
