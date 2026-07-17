"use client";

// =============================================================
// 编辑器主题切换器（右侧悬浮按钮）
// -------------------------------------------------------------
// 圆形按钮显示当前主题色预览方块，点击向左弹出可滚动面板。
// 面板列出所有 Monaco 编辑器主题，带浅色/暗色标识。
// 点击外部自动关闭面板。
// =============================================================

import { useState, useEffect, useRef } from "react";
import { MONACO_THEMES } from "./monaco-themes";
import { useEditorTheme } from "./EditorThemeProvider";
import { useFloatingButtonVisibility } from "./FloatingButtonVisibility";

export default function FloatingEditorTheme() {
  const { themeId, setThemeId } = useEditorTheme();
  const { visibility } = useFloatingButtonVisibility();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const current = MONACO_THEMES.find((t) => t.id === themeId) ?? MONACO_THEMES[0];

  const switchTheme = (id) => {
    setThemeId(id);
  };

  // 点击外部或按 Escape 关闭面板
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const escHandler = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", escHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", escHandler);
    };
  }, [open]);

  // 用户在设置面板里关闭了本按钮：直接返回 null，不渲染
  // 注意：必须放在所有 hooks（useEffect 等）之后，否则会破坏 hooks 调用顺序
  if (visibility.editorTheme === false) return null;

  return (
    <div className="floating-editor-theme" ref={panelRef}>
      <button
        className="floating-editor-theme-btn"
        onClick={() => setOpen((v) => !v)}
        title="切换编辑器主题"
        aria-label="切换编辑器主题"
      >
        <span
          className="floating-editor-theme-swatch"
          style={{ background: current.swatch }}
        />
      </button>

      {open && (
        <div className="floating-editor-theme-panel">
          <div className="floating-editor-theme-panel-header">编辑器主题</div>
          <div className="floating-editor-theme-list">
            {MONACO_THEMES.map((t) => (
              <button
                key={t.id}
                className={`floating-editor-theme-item ${themeId === t.id ? "active" : ""}`}
                onClick={() => switchTheme(t.id)}
                title={t.name}
              >
                <span
                  className="floating-editor-theme-item-swatch"
                  style={{ background: t.swatch }}
                />
                <span className="floating-editor-theme-item-name">{t.name}</span>
                <span className="floating-editor-theme-item-kind">
                  {t.kind === "dark" ? "暗色" : "浅色"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}