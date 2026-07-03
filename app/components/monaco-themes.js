// =============================================================
// Monaco 编辑器主题预设
// -------------------------------------------------------------
// 内置 vs / vs-dark 直接使用 Monaco 自带主题；
// 其余通过 defineTheme 注册，配色参考各流行编辑器主题。
// =============================================================

export const MONACO_THEME_STORAGE_KEY = "monaco-editor-theme";
export const DEFAULT_MONACO_THEME = "vs";

const NO_BORDER = "#00000000";

function editorColors({
  bg,
  fg,
  lineNum,
  lineNumActive,
  selection,
  lineHighlight,
  gutter,
  cursor,
}) {
  return {
    "editor.background": bg,
    "editor.foreground": fg,
    "editorLineNumber.foreground": lineNum,
    "editorLineNumber.activeForeground": lineNumActive ?? fg,
    "editor.selectionBackground": selection,
    "editor.lineHighlightBackground": lineHighlight,
    "editorGutter.background": gutter ?? bg,
    "editorCursor.foreground": cursor ?? fg,
    "focusBorder": NO_BORDER,
    "editor.lineHighlightBorder": NO_BORDER,
  };
}

/** @type {Array<{ id: string; name: string; kind: "light" | "dark"; swatch: string; builtin?: boolean; base?: string; colors?: Record<string, string>; rules?: Array<{ token: string; foreground?: string; fontStyle?: string }> }>} */
export const MONACO_THEMES = [
  {
    id: "vs",
    name: "Light 浅色",
    kind: "light",
    swatch: "#ffffff",
    builtin: true,
  },
  {
    id: "vs-dark",
    name: "Dark 暗色",
    kind: "dark",
    swatch: "#1e1e1e",
    builtin: true,
  },
  {
    id: "github-light",
    name: "GitHub Light",
    kind: "light",
    swatch: "#ffffff",
    base: "vs",
    colors: editorColors({
      bg: "#ffffff",
      fg: "#24292f",
      lineNum: "#8c959f",
      selection: "#b6e3ff",
      lineHighlight: "#f6f8fa",
      cursor: "#0969da",
    }),
    rules: [
      { token: "comment", foreground: "6e7781", fontStyle: "italic" },
      { token: "keyword", foreground: "cf222e" },
      { token: "string", foreground: "0a3069" },
      { token: "number", foreground: "0550ae" },
      { token: "type", foreground: "953800" },
      { token: "function", foreground: "8250df" },
    ],
  },
  {
    id: "github-dark",
    name: "GitHub Dark",
    kind: "dark",
    swatch: "#0d1117",
    base: "vs-dark",
    colors: editorColors({
      bg: "#0d1117",
      fg: "#c9d1d9",
      lineNum: "#6e7681",
      selection: "#264f78",
      lineHighlight: "#161b22",
      cursor: "#58a6ff",
    }),
    rules: [
      { token: "comment", foreground: "8b949e", fontStyle: "italic" },
      { token: "keyword", foreground: "ff7b72" },
      { token: "string", foreground: "a5d6ff" },
      { token: "number", foreground: "79c0ff" },
      { token: "type", foreground: "ffa657" },
      { token: "function", foreground: "d2a8ff" },
    ],
  },
  {
    id: "one-dark",
    name: "One Dark",
    kind: "dark",
    swatch: "#282c34",
    base: "vs-dark",
    colors: editorColors({
      bg: "#282c34",
      fg: "#abb2bf",
      lineNum: "#495162",
      selection: "#3e4451",
      lineHighlight: "#2c313a",
      cursor: "#528bff",
    }),
    rules: [
      { token: "comment", foreground: "5c6370", fontStyle: "italic" },
      { token: "keyword", foreground: "c678dd" },
      { token: "string", foreground: "98c379" },
      { token: "number", foreground: "d19a66" },
      { token: "type", foreground: "e5c07b" },
      { token: "function", foreground: "61afef" },
    ],
  },
  {
    id: "dracula",
    name: "Dracula",
    kind: "dark",
    swatch: "#282a36",
    base: "vs-dark",
    colors: editorColors({
      bg: "#282a36",
      fg: "#f8f8f2",
      lineNum: "#6272a4",
      selection: "#44475a",
      lineHighlight: "#313340",
      cursor: "#f8f8f0",
    }),
    rules: [
      { token: "comment", foreground: "6272a4", fontStyle: "italic" },
      { token: "keyword", foreground: "ff79c6" },
      { token: "string", foreground: "f1fa8c" },
      { token: "number", foreground: "bd93f9" },
      { token: "type", foreground: "8be9fd", fontStyle: "italic" },
      { token: "function", foreground: "50fa7b" },
    ],
  },
  {
    id: "monokai",
    name: "Monokai",
    kind: "dark",
    swatch: "#272822",
    base: "vs-dark",
    colors: editorColors({
      bg: "#272822",
      fg: "#f8f8f2",
      lineNum: "#90908a",
      selection: "#49483e",
      lineHighlight: "#3e3d32",
      cursor: "#f8f8f0",
    }),
    rules: [
      { token: "comment", foreground: "75715e", fontStyle: "italic" },
      { token: "keyword", foreground: "f92672" },
      { token: "string", foreground: "e6db74" },
      { token: "number", foreground: "ae81ff" },
      { token: "type", foreground: "66d9ef", fontStyle: "italic" },
      { token: "function", foreground: "a6e22e" },
    ],
  },
  {
    id: "solarized-light",
    name: "Solarized Light",
    kind: "light",
    swatch: "#fdf6e3",
    base: "vs",
    colors: editorColors({
      bg: "#fdf6e3",
      fg: "#657b83",
      lineNum: "#93a1a1",
      selection: "#eee8d5",
      lineHighlight: "#eee8d5",
      cursor: "#657b83",
    }),
    rules: [
      { token: "comment", foreground: "93a1a1", fontStyle: "italic" },
      { token: "keyword", foreground: "859900" },
      { token: "string", foreground: "2aa198" },
      { token: "number", foreground: "d33682" },
      { token: "type", foreground: "b58900" },
      { token: "function", foreground: "268bd2" },
    ],
  },
  {
    id: "solarized-dark",
    name: "Solarized Dark",
    kind: "dark",
    swatch: "#002b36",
    base: "vs-dark",
    colors: editorColors({
      bg: "#002b36",
      fg: "#839496",
      lineNum: "#586e75",
      selection: "#073642",
      lineHighlight: "#073642",
      cursor: "#839496",
    }),
    rules: [
      { token: "comment", foreground: "586e75", fontStyle: "italic" },
      { token: "keyword", foreground: "859900" },
      { token: "string", foreground: "2aa198" },
      { token: "number", foreground: "d33682" },
      { token: "type", foreground: "b58900" },
      { token: "function", foreground: "268bd2" },
    ],
  },
  {
    id: "nord",
    name: "Nord",
    kind: "dark",
    swatch: "#2e3440",
    base: "vs-dark",
    colors: editorColors({
      bg: "#2e3440",
      fg: "#d8dee9",
      lineNum: "#4c566a",
      selection: "#434c5e",
      lineHighlight: "#3b4252",
      cursor: "#d8dee9",
    }),
    rules: [
      { token: "comment", foreground: "616e88", fontStyle: "italic" },
      { token: "keyword", foreground: "81a1c1" },
      { token: "string", foreground: "a3be8c" },
      { token: "number", foreground: "b48ead" },
      { token: "type", foreground: "8fbcbb" },
      { token: "function", foreground: "88c0d0" },
    ],
  },
];

export function getMonacoTheme(id) {
  return MONACO_THEMES.find((t) => t.id === id) ?? MONACO_THEMES[0];
}

let registered = false;

/** 注册所有自定义 Monaco 主题（幂等，全局只执行一次） */
export function registerMonacoThemes(monaco) {
  if (registered) return;
  registered = true;

  for (const theme of MONACO_THEMES) {
    if (theme.builtin) continue;
    monaco.editor.defineTheme(theme.id, {
      base: theme.base,
      inherit: true,
      rules: theme.rules ?? [],
      colors: theme.colors ?? {},
    });
  }
}
