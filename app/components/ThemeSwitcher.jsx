"use client";

// =============================================================
// 主题切换器组件
// -------------------------------------------------------------
// 通过给 <html> 元素设置 data-theme 属性，配合 globals.css 里
// [data-theme="xxx"] 选择器覆盖 CSS 变量，实现整站主题色切换。
//
// 主题列表在 THEMES 数组里维护，每项包含：
//   id    —— data-theme 属性值
//   name  —— 显示名称
//   swatch —— 主色 + 浅色，用于色卡预览
//   vars   —— 该主题覆盖的 CSS 变量（同步写到 globals.css 中）
//
// 用户选择保存在 localStorage，刷新后保持。
// 首次加载时在 layout.js 里通过内联脚本设置默认主题，避免闪烁。
// =============================================================

import { useState, useEffect, useRef } from "react";

// 主题预设：与 globals.css 中 [data-theme="xxx"] 块保持一致
// 这里的 vars 仅用于文档可读性，实际样式在 CSS 里定义
const THEMES = [
  {
    id: "cyan",
    name: "深青",
    swatch: { primary: "#0891b2", light: "#cffafe" },
  },
  {
    id: "blue",
    name: "天空蓝",
    swatch: { primary: "#2563eb", light: "#dbeafe" },
  },
  {
    id: "violet",
    name: "葡萄紫",
    swatch: { primary: "#7c3aed", light: "#ede9fe" },
  },
  {
    id: "emerald",
    name: "薄荷绿",
    swatch: { primary: "#10b981", light: "#d1fae5" },
  },
  {
    id: "rose",
    name: "玫瑰粉",
    swatch: { primary: "#e11d48", light: "#ffe4e6" },
  },
  {
    id: "amber",
    name: "琥珀橙",
    swatch: { primary: "#d97706", light: "#fef3c7" },
  },
];

const STORAGE_KEY = "theme-preference";
const DEFAULT_THEME = "cyan";

export default function ThemeSwitcher() {
  const [current, setCurrent] = useState(DEFAULT_THEME);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ---------- 挂载时读取 localStorage ----------
  // 同时把旧版本存到 localStorage 的主题同步到 cookie，
  // 使服务端下次渲染时可直接读取，避免首屏闪烁。
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && THEMES.some((t) => t.id === saved)) {
        setCurrent(saved);
        document.documentElement.setAttribute("data-theme", saved);
        document.cookie = `${STORAGE_KEY}=${saved}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {}
  }, []);

  // ---------- 切换主题 ----------
  // 同时更新 <html data-theme>、组件状态、localStorage、cookie。
  // cookie 用于服务端在首屏 HTML 中直接渲染正确的 data-theme。
  const switchTheme = (id) => {
    setCurrent(id);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", id);
    }
    try {
      localStorage.setItem(STORAGE_KEY, id);
      document.cookie = `${STORAGE_KEY}=${id}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
    setOpen(false);
  };

  // ---------- 点击外部关闭下拉 ----------
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // 当前主题的色卡
  const currentTheme = THEMES.find((t) => t.id === current) || THEMES[0];

  return (
    <div className="theme-switcher" ref={dropdownRef}>
      <button
        className="theme-switcher-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        title="切换主题色"
      >
        {/* 当前主题色卡：两个小色块拼一起 */}
        <span
          className="theme-swatch-current"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.swatch.primary} 50%, ${currentTheme.swatch.light} 50%)`,
          }}
        />
        <span className="theme-switcher-label">主题</span>
        <span className={`theme-arrow ${open ? "open" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="theme-dropdown" role="menu">
          <div className="theme-dropdown-header">选择主题色</div>
          <div className="theme-grid">
            {THEMES.map((t) => (
              <button
                key={t.id}
                className={`theme-card ${current === t.id ? "active" : ""}`}
                onClick={() => switchTheme(t.id)}
                role="menuitem"
                title={t.name}
              >
                <span
                  className="theme-card-swatch"
                  style={{
                    background: `linear-gradient(135deg, ${t.swatch.primary} 50%, ${t.swatch.light} 50%)`,
                  }}
                />
                <span className="theme-card-name">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
