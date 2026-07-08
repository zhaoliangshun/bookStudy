"use client";

// =============================================================
// 通用右键菜单组件
// -------------------------------------------------------------
// 用法：
//   <ContextMenu
//     items={[
//       { label: "删除", icon: "🗑️", danger: true, onClick: () => ... },
//       { label: "隐藏", icon: "👁️", onClick: () => ... },
//     ]}
//     position={{ x: 100, y: 200 }}
//     onClose={() => setMenu(null)}
//   />
//
// 菜单项支持：
//   - label: 显示文字
//   - icon: 前置图标
//   - danger: 红色高亮（用于删除等危险操作）
//   - divider: 分隔线
//   - onClick: 点击回调
// =============================================================

import { useEffect, useRef } from "react";

export default function ContextMenu({ items, position, onClose }) {
  const menuRef = useRef(null);

  // 点击外部关闭
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    // 按 ESC 关闭
    const keyHandler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [onClose]);

  // 菜单超出屏幕边界时自动翻转
  const adjustedPos = useAdjustedPosition(position, menuRef);

  return (
    <div
      className="ctx-menu"
      ref={menuRef}
      style={{ left: adjustedPos.x, top: adjustedPos.y }}
      role="menu"
      onMouseDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} className="ctx-menu-divider" />
        ) : (
          <button
            key={i}
            className={`ctx-menu-item ${item.danger ? "danger" : ""}`}
            onClick={() => {
              item.onClick?.();
              onClose();
            }}
            role="menuitem"
          >
            {item.icon && <span className="ctx-menu-item-icon">{item.icon}</span>}
            <span className="ctx-menu-item-label">{item.label}</span>
          </button>
        )
      )}
    </div>
  );
}

// 自动调整菜单位置，避免超出视口
function useAdjustedPosition(position, menuRef) {
  if (typeof window === "undefined") return position;

  // 预估菜单尺寸（面板最大宽度 200px，每项约 36px 高）
  const menuW = 200;
  const menuH = 280;

  let x = position.x;
  let y = position.y;

  if (x + menuW > window.innerWidth - 8) {
    x = window.innerWidth - menuW - 8;
  }
  if (y + menuH > window.innerHeight - 8) {
    y = window.innerHeight - menuH - 8;
  }
  if (x < 4) x = 4;
  if (y < 4) y = 4;

  return { x, y };
}