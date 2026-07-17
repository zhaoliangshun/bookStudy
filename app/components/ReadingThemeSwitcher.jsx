"use client";

// =============================================================
// 阅读主题切换器（右侧悬浮按钮）
// -------------------------------------------------------------
// 通过 <html> 的 data-reading-theme 属性切换整站阅读配色，
// 与 accent 主题色（ThemeSwitcher）互不影响，可独立搭配使用。
//
// 阅读主题列表（11 款）：
//   默认（浅色） / 护眼绿 / 暖黄 / 暗夜 / 柔和灰
//   墨韵 / 海棠 / 海蓝 / 森林 / 豆沙 / 暮光
// =============================================================

import { useState, useEffect, useRef } from "react";
import { useFloatingButtonVisibility } from "./FloatingButtonVisibility";

const READING_THEMES = [
  { id: "default", name: "默认", icon: "☀️", desc: "经典浅色" },
  { id: "eye-care", name: "护眼", icon: "🌿", desc: "柔和绿调" },
  { id: "warm", name: "暖黄", icon: "📖", desc: "羊皮纸色" },
  { id: "dark", name: "暗夜", icon: "🌙", desc: "夜间阅读" },
  { id: "gray", name: "柔和", icon: "☁️", desc: "低对比灰" },
  { id: "ink", name: "墨韵", icon: "🖋️", desc: "宣纸墨色" },
  { id: "rose", name: "海棠", icon: "🌸", desc: "淡粉米色" },
  { id: "ocean", name: "海蓝", icon: "🌊", desc: "海蓝晨曦" },
  { id: "forest", name: "森林", icon: "🌲", desc: "森林墨绿" },
  { id: "sepia", name: "豆沙", icon: "🫘", desc: "豆沙米白" },
  { id: "dusk", name: "暮光", icon: "🌌", desc: "深紫黑" },
];

const STORAGE_KEY = "reading-theme-preference";
const DEFAULT_THEME = "default";

export default function ReadingThemeSwitcher() {
  const { visibility } = useFloatingButtonVisibility();
  const [current, setCurrent] = useState(DEFAULT_THEME);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // 挂载时从 localStorage 读取
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && READING_THEMES.some((t) => t.id === saved)) {
          setCurrent(saved);
          document.documentElement.setAttribute("data-reading-theme", saved);
        }
      } catch {}
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // 切换主题
  const switchTheme = (id) => {
    setCurrent(id);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-reading-theme", id);
    }
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
    setOpen(false);
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
  // 必须放在所有 hooks 之后，避免破坏 hooks 调用顺序
  if (visibility.readingTheme === false) return null;

  return (
    <div className="reading-theme-switcher" ref={panelRef}>
      {/* 悬浮触发按钮 */}
      <button
        className="reading-theme-btn"
        onClick={() => setOpen((v) => !v)}
        title="切换阅读主题"
        aria-label="切换阅读主题"
      >
        <span className="reading-theme-btn-icon">🎨</span>
      </button>

      {/* 展开面板 */}
      {open && (
        <div className="reading-theme-panel">
          <div className="reading-theme-panel-header">阅读主题</div>
          <div className="reading-theme-list">
            {READING_THEMES.map((t) => (
              <button
                key={t.id}
                className={`reading-theme-item ${current === t.id ? "active" : ""}`}
                onClick={() => switchTheme(t.id)}
                title={t.desc}
              >
                <span className="reading-theme-item-icon">{t.icon}</span>
                <span className="reading-theme-item-name">{t.name}</span>
                <span className="reading-theme-item-desc">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}