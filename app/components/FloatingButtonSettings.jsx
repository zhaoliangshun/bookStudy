"use client";

// =============================================================
// 文件：app/components/FloatingButtonSettings.jsx
// -------------------------------------------------------------
// 【一句话职责】
//   右侧浮动按钮组的「设置入口」：一个齿轮 ⚙️ 圆形按钮。
//   点击后向左弹出面板，列出 4 个开关，控制其他浮动按钮的显示/隐藏。
//
// 【设计要点】
//   1. 齿轮按钮自身始终显示，否则用户无法再唤出设置面板
//   2. 面板采用与其他浮动面板（阅读主题面板）相同的弹出方向（向左）
//   3. 用 checkbox + label 形式的开关，可直接点击，也支持键盘 Tab/Space
//   4. 点击面板外部或按 Escape 关闭面板
//   5. 「全部显示 / 全部隐藏」两个快捷按钮方便批量操作
// =============================================================

import { useState, useEffect, useRef } from "react";
import {
  useFloatingButtonVisibility,
  FLOATING_BUTTON_IDS,
} from "./FloatingButtonVisibility";

// 设置面板里展示的按钮信息
// id   : 对应 Context 里 visibility 对象的 key
// icon : emoji 图标，与右侧实际按钮的图标一致，方便用户对照
// name : 显示名称
const BUTTON_INFO = [
  { id: "editorTheme", icon: "🎨", name: "编辑器主题" },
  { id: "readingTheme", icon: "🎨", name: "阅读主题" },
  { id: "chapterNav", icon: "←→", name: "章节导航" },
  { id: "quickScroll", icon: "↑↓", name: "快速滚动" },
];

export default function FloatingButtonSettings() {
  const { visibility, setVisibility } = useFloatingButtonVisibility();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

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

  // 全部显示 / 全部隐藏 快捷操作
  const showAll = () => {
    FLOATING_BUTTON_IDS.forEach((id) => setVisibility(id, true));
  };
  const hideAll = () => {
    FLOATING_BUTTON_IDS.forEach((id) => setVisibility(id, false));
  };

  return (
    <div className="floating-btn-settings" ref={panelRef}>
      {/* 触发按钮：齿轮 ⚙️ */}
      <button
        className="floating-btn-settings-btn"
        onClick={() => setOpen((v) => !v)}
        title="显示/隐藏浮动按钮"
        aria-label="显示/隐藏浮动按钮"
        aria-expanded={open}
      >
        <span className="floating-btn-settings-icon">⚙️</span>
      </button>

      {/* 展开面板 */}
      {open && (
        <div className="floating-btn-settings-panel">
          <div className="floating-btn-settings-panel-header">
            浮动按钮设置
          </div>

          {/* 开关列表 */}
          <div className="floating-btn-settings-list">
            {BUTTON_INFO.map((item) => {
              const checked = !!visibility[item.id];
              return (
                <label
                  key={item.id}
                  className="floating-btn-settings-item"
                  title={`显示或隐藏「${item.name}」按钮`}
                >
                  <span className="floating-btn-settings-item-icon">
                    {item.icon}
                  </span>
                  <span className="floating-btn-settings-item-name">
                    {item.name}
                  </span>
                  {/* 用原生 checkbox 保证可访问性 + 键盘可操作 */}
                  <input
                    type="checkbox"
                    className="floating-btn-settings-checkbox"
                    checked={checked}
                    onChange={(e) => setVisibility(item.id, e.target.checked)}
                  />
                  {/* 视觉开关滑块，覆盖在 checkbox 之上 */}
                  <span
                    className={`floating-btn-settings-switch ${
                      checked ? "on" : "off"
                    }`}
                    aria-hidden="true"
                  />
                </label>
              );
            })}
          </div>

          {/* 底部快捷操作 */}
          <div className="floating-btn-settings-actions">
            <button
              type="button"
              className="floating-btn-settings-action-btn"
              onClick={showAll}
            >
              全部显示
            </button>
            <button
              type="button"
              className="floating-btn-settings-action-btn"
              onClick={hideAll}
            >
              全部隐藏
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
