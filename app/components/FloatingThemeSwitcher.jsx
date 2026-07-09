"use client";

// =============================================================
// 统一主题切换器（右侧悬浮按钮）
// -------------------------------------------------------------
// 合并「阅读主题」和「编辑器主题」到一个面板中：
//   上半区：阅读主题（整站配色，通过 data-reading-theme 切换）
//   下半区：编辑器主题（Monaco 代码配色）
// 点击外部自动关闭面板。
// =============================================================

import { useState, useEffect, useRef } from "react";
import { MONACO_THEMES } from "./monaco-themes";
import { useEditorTheme } from "./EditorThemeProvider";

const READING_THEMES = [
  { id: "default", name: "默认", icon: "☀️", desc: "经典浅色" },
  { id: "eye-care", name: "护眼", icon: "🌿", desc: "柔和绿调" },
  { id: "warm", name: "暖黄", icon: "📖", desc: "羊皮纸色" },
  { id: "dark", name: "暗夜", icon: "🌙", desc: "夜间阅读" },
  { id: "gray", name: "柔和", icon: "☁️", desc: "低对比灰" },
];

const READING_STORAGE_KEY = "reading-theme-preference";

export default function FloatingThemeSwitcher() {
  const { themeId: editorThemeId, setThemeId: setEditorThemeId } = useEditorTheme();
  const [readingTheme, setReadingTheme] = useState("default");
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // 挂载时从 localStorage 读取阅读主题
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(READING_STORAGE_KEY);
        if (saved && READING_THEMES.some((t) => t.id === saved)) {
          setReadingTheme(saved);
          document.documentElement.setAttribute("data-reading-theme", saved);
        }
      } catch {}
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // 切换阅读主题
  const switchReadingTheme = (id) => {
    setReadingTheme(id);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-reading-theme", id);
    }
    try {
      localStorage.setItem(READING_STORAGE_KEY, id);
    } catch {}
  };

  // 切换编辑器主题
  const switchEditorTheme = (id) => {
    setEditorThemeId(id);
  };

  // 点击外部关闭面板
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const currentEditorTheme =
    MONACO_THEMES.find((t) => t.id === editorThemeId) ?? MONACO_THEMES[0];

  return (
    <div className="floating-theme-switcher" ref={panelRef}>
      {/* 悬浮触发按钮 */}
      <button
        className="floating-theme-btn"
        onClick={() => setOpen((v) => !v)}
        title="切换主题"
        aria-label="切换主题"
      >
        <span className="floating-theme-btn-icon">🎨</span>
      </button>

      {/* 展开面板 */}
      {open && (
        <div className="floating-theme-panel">
          {/* 阅读主题区 */}
          <div className="floating-theme-section-header">阅读主题</div>
          <div className="floating-theme-list">
            {READING_THEMES.map((t) => (
              <button
                key={t.id}
                className={`floating-theme-item ${readingTheme === t.id ? "active" : ""}`}
                onClick={() => switchReadingTheme(t.id)}
                title={t.desc}
              >
                <span className="floating-theme-item-icon">{t.icon}</span>
                <span className="floating-theme-item-name">{t.name}</span>
                <span className="floating-theme-item-desc">{t.desc}</span>
              </button>
            ))}
          </div>

          {/* 分隔线 */}
          <div className="floating-theme-divider" />

          {/* 编辑器主题区 */}
          <div className="floating-theme-section-header">编辑器主题</div>
          <div className="floating-theme-list floating-theme-list-scroll">
            {MONACO_THEMES.map((t) => (
              <button
                key={t.id}
                className={`floating-theme-item ${editorThemeId === t.id ? "active" : ""}`}
                onClick={() => switchEditorTheme(t.id)}
                title={t.name}
              >
                <span
                  className="floating-theme-item-swatch"
                  style={{ background: t.swatch }}
                />
                <span className="floating-theme-item-name">{t.name}</span>
                <span className="floating-theme-item-kind">
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
