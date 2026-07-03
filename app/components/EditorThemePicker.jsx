"use client";

import { useEffect, useRef, useState } from "react";
import { MONACO_THEMES } from "./monaco-themes";
import { useEditorTheme } from "./EditorThemeProvider";

/**
 * Monaco 编辑器主题选择器
 * @param {"toolbar" | "compact"} variant - toolbar：编辑器工具栏；compact：编辑器内浮层
 */
export default function EditorThemePicker({ variant = "toolbar" }) {
  const { themeId, setThemeId } = useEditorTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const current = MONACO_THEMES.find((t) => t.id === themeId) ?? MONACO_THEMES[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const pick = (id) => {
    setThemeId(id);
    setOpen(false);
  };

  return (
    <div
      className={`editor-theme-picker editor-theme-picker--${variant}`}
      ref={rootRef}
    >
      <button
        type="button"
        className="editor-theme-picker-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        title="切换编辑器主题"
      >
        <span
          className="editor-theme-swatch"
          style={{ background: current.swatch }}
          aria-hidden
        />
        <span className="editor-theme-label">
          {variant === "compact" ? "主题" : current.name}
        </span>
        <span className={`editor-theme-arrow ${open ? "open" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="editor-theme-menu" role="listbox" aria-label="编辑器主题">
          <div className="editor-theme-menu-header">编辑器主题</div>
          <ul className="editor-theme-list">
            {MONACO_THEMES.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={themeId === t.id}
                  className={`editor-theme-option ${themeId === t.id ? "active" : ""}`}
                  onClick={() => pick(t.id)}
                >
                  <span
                    className="editor-theme-option-swatch"
                    style={{ background: t.swatch }}
                    aria-hidden
                  />
                  <span className="editor-theme-option-name">{t.name}</span>
                  <span className="editor-theme-option-kind">
                    {t.kind === "dark" ? "暗色" : "浅色"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
