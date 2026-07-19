"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import { useEditorTheme } from "./EditorThemeProvider";
import { registerMonacoThemes } from "./monaco-themes";

let monacoPreloaded = false;
let monacoPreloadPromise = null;
let monacoLoadFailed = false;

export function preloadMonaco() {
  if (monacoPreloaded) return;
  if (monacoPreloadPromise) return monacoPreloadPromise;

  monacoPreloadPromise = loader.init().then((monaco) => {
    registerMonacoThemes(monaco);
    monacoPreloaded = true;
    monacoLoadFailed = false;
    return monaco;
  }).catch(() => {
    monacoLoadFailed = true;
  });

  return monacoPreloadPromise;
}

if (typeof window !== "undefined") {
  const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1000));
  idleCallback(() => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = "https://cdn.jsdelivr.net";
    document.head.appendChild(link);
  }, { timeout: 2000 });
}

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

loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs",
  },
});

function handleBeforeMount(monaco) {
  registerMonacoThemes(monaco);

  // 禁用 TypeScript / JavaScript 诊断（教程 demo 代码常引用未导入的
  // React 全局变量、缺少类型声明等，避免编辑器满屏红色波浪线告警）
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: true,
  });
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: true,
  });
}

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
  const { themeId, theme } = useEditorTheme();
  const editorRef = useRef(null);
  const wrapRef = useRef(null);
  const disposablesRef = useRef([]);
  const rafRef = useRef(null);
  const onRunRef = useRef(onRun);
  const [loadError, setLoadError] = useState(monacoLoadFailed);

  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  const configRef = useRef({ autoHeight, minHeight, maxHeight });
  useEffect(() => {
    configRef.current = { autoHeight, minHeight, maxHeight };
  }, [autoHeight, minHeight, maxHeight]);

  useEffect(() => {
    if (loadError) return;
    const timer = setTimeout(() => {
      if (!editorRef.current) {
        setLoadError(true);
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [loadError]);

  const handleMount = useCallback((editor) => {
    editorRef.current = editor;

    const runDisposable = editor.addCommand(2048 | 3, () => {
      if (typeof onRunRef.current === "function") {
        onRunRef.current();
      }
    }, "");
    if (runDisposable) disposablesRef.current.push(runDisposable);

    const { autoHeight: auto, minHeight: minH, maxHeight: maxH } = configRef.current;

    if (auto) {
      const updateHeight = () => {
        const ed = editorRef.current;
        if (!ed) return;
        const contentHeight = ed.getContentHeight();
        const overflow = contentHeight + 2 > maxH;
        const h = Math.min(Math.max(contentHeight + 2, minH), maxH);
        if (wrapRef.current) {
          wrapRef.current.style.height = `${h}px`;
        }
        ed.updateOptions({
          scrollbar: { vertical: overflow ? "auto" : "hidden" },
        });
        ed.layout();
      };
      const sizeDisposable = editor.onDidContentSizeChange(updateHeight);
      if (sizeDisposable) disposablesRef.current.push(sizeDisposable);
      updateHeight();
    } else {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (editorRef.current) {
          editorRef.current.layout();
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;
    const currentValue = editorRef.current.getValue();
    if (currentValue !== value) {
      const model = editorRef.current.getModel();
      if (model) {
        model.pushEditOperations(
          [],
          [{ range: model.getFullModelRange(), text: value }],
          () => null
        );
      } else {
        editorRef.current.setValue(value);
      }
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      disposablesRef.current.forEach((d) => {
        try { d.dispose(); } catch {}
      });
      disposablesRef.current = [];
      if (editorRef.current) {
        try {
          const model = editorRef.current.getModel();
          if (model) model.dispose();
          editorRef.current.dispose();
        } catch {}
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`monaco-editor-wrap${autoHeight ? " auto-height" : ""}`}
      data-editor-kind={theme.kind}
      style={
        autoHeight
          ? { minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px` }
          : undefined
      }
    >
      {loadError ? (
        <textarea
          className="monaco-fallback-textarea"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          spellCheck={false}
          placeholder={placeholder}
          style={{
            width: "100%",
            height: autoHeight ? `${Math.min(Math.max(minHeight, 200), maxHeight)}px` : "100%",
            minHeight: `${minHeight}px`,
            padding: "14px",
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            fontSize: 13,
            lineHeight: 1.5,
            border: "1px solid var(--border, #e2e8f0)",
            borderRadius: 8,
            resize: autoHeight ? "vertical" : "none",
            background: theme.kind === "dark" ? "#1e1e1e" : "#ffffff",
            color: theme.kind === "dark" ? "#d4d4d4" : "#334155",
            outline: "none",
            tabSize: 2,
            whiteSpace: "pre",
            overflowWrap: "normal",
            overflowX: "auto",
          }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              onRunRef.current?.();
            }
            if (e.key === "Tab") {
              e.preventDefault();
              const ta = e.currentTarget;
              const start = ta.selectionStart;
              const end = ta.selectionEnd;
              const val = ta.value;
              ta.value = val.substring(0, start) + "  " + val.substring(end);
              ta.selectionStart = ta.selectionEnd = start + 2;
              onChange?.(ta.value);
            }
          }}
        />
      ) : (
        <Editor
          height="100%"
          width="100%"
          theme={themeId}
          language={LANG_MAP[language] || "plaintext"}
          value={value}
          onChange={(val) => onChange?.(val ?? "")}
          beforeMount={handleBeforeMount}
          onMount={handleMount}
          onValidate={() => {}}
          options={{
            scrollBeyondLastLine: false,
            wordWrap: "on",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
            fontSize: 13,
            fontLigatures: false,
            lineHeight: 1.5,
            padding: { top: 14, bottom: 14 },
            renderLineHighlight: "line",
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
              useShadows: false,
              alwaysConsumeMouseWheel: false,
            },
            minimap: { enabled: false },
            stickyScroll: { enabled: false },
            overviewRulerLanes: 0,
            automaticLayout: true,
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
      )}
    </div>
  );
}
