"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MONACO_THEMES } from "./monaco-themes";
import { useEditorTheme } from "./EditorThemeProvider";

/**
 * Monaco 编辑器主题选择器
 * @param {"toolbar" | "compact" | "sidebar"} variant
 *   - toolbar：编辑器工具栏
 *   - compact：编辑器内浮层
 *   - sidebar：侧边栏（下拉菜单用 Portal 渲染到 body，避免被 overflow:hidden 裁剪）
 */
export default function EditorThemePicker({ variant = "toolbar" }) {
  const { themeId, setThemeId } = useEditorTheme();
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const current = MONACO_THEMES.find((t) => t.id === themeId) ?? MONACO_THEMES[0];

  // 计算下拉菜单位置：贴在按钮下方，右对齐按钮右边缘
  const updateMenuPos = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const menuWidth = 220;
    // 右边缘对齐按钮右边缘；若会溢出左侧，则左对齐按钮左边缘
    let left = rect.right - menuWidth;
    if (left < 8) left = rect.left;
    // 防止溢出右侧
    const maxLeft = window.innerWidth - menuWidth - 8;
    if (left > maxLeft) left = maxLeft;
    setMenuPos({ top: rect.bottom + 6, left });
  };

  useEffect(() => {
    if (!open) return;
    updateMenuPos();

    // 点击外部关闭
    const handleClick = (e) => {
      if (
        btnRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target)
      )
        return;
      setOpen(false);
    };
    // 滚动 / resize 时重新计算位置（滚动时菜单跟随按钮）
    const handleScroll = () => updateMenuPos();
    const handleResize = () => updateMenuPos();

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  const pick = (id) => {
    setThemeId(id);
    setOpen(false);
  };

  return (
    <div
      className={`editor-theme-picker editor-theme-picker--${variant}`}
    >
      <button
        ref={btnRef}
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

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="editor-theme-menu"
            role="listbox"
            aria-label="编辑器主题"
            style={{
              position: "fixed",
              top: `${menuPos.top}px`,
              left: `${menuPos.left}px`,
              right: "auto",
            }}
          >
            <div className="editor-theme-menu-header">编辑器主题</div>
            <div className="editor-theme-menu-sub">
              共 {MONACO_THEMES.length} 款 · 参照 VS Code 流行主题
            </div>
            <ul className="editor-theme-list">
              {MONACO_THEMES.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={themeId === t.id}
                    className={`editor-theme-option ${
                      themeId === t.id ? "active" : ""
                    }`}
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
          </div>,
          document.body
        )}
    </div>
  );
}
