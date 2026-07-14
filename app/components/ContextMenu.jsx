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

import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function ContextMenu({ items, position, onClose }) {
  const menuRef = useRef(null);
  // 修复：用 state 保存调整后的位置，在 useLayoutEffect 中读取 menuRef 真实尺寸，
  // 避免在渲染阶段读取 ref（react-hooks/refs 规则）
  const [adjustedPos, setAdjustedPos] = useState(position);

  // 修复：用 ref 保存 onClose，避免 onClose 不稳定导致监听器反复绑定/解绑
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // 点击外部关闭
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onCloseRef.current();
      }
    };
    document.addEventListener("mousedown", handler);
    // 按 ESC 关闭
    const keyHandler = (e) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, []);

  // 菜单超出屏幕边界时自动翻转
  // 在 useLayoutEffect 中读取 menuRef 真实尺寸并调整位置（绘制前同步完成，避免闪烁）
  useLayoutEffect(() => {
    setAdjustedPos(getAdjustedPosition(position, menuRef));
  }, [position]);

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
// 修复：重命名为 getAdjustedPosition（非 Hook，不含 Hook 调用），
// 优先使用 menuRef 获取真实菜单尺寸，首次渲染前用预估尺寸作为 fallback
function getAdjustedPosition(position, menuRef) {
  if (typeof window === "undefined") return position;

  // 优先使用真实菜单尺寸，首次渲染前 menuRef.current 为 null 时用预估尺寸
  const rect = menuRef.current?.getBoundingClientRect();
  const menuW = rect?.width ?? 200;
  const menuH = rect?.height ?? 280;

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