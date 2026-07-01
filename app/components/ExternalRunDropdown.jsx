"use client";

// =============================================================
// 外网运行下拉菜单组件（教程页面浅色主题）
// -------------------------------------------------------------
// 在教程页面的 editor-actions 区域使用，提供与 CodeBlock 中
// 「🌐 外网」相同的功能，但适配浅色主题样式。
//
// 用法：
//   <ExternalRunDropdown code={code} langLower="py" disabled={isRunning} />
//
// 功能：
//   1. 根据语言自动展示可用的外网平台列表
//   2. 点击展开下拉菜单，选择平台后新标签页打开
//   3. 点击菜单外部自动收起
//   4. 无可用平台时不渲染
// =============================================================

import { useState, useCallback, useEffect, useMemo } from "react";
import { getExternalPlaygrounds, openExternal } from "../external-playgrounds";

export default function ExternalRunDropdown({
  code = "",
  langLower = "",
  disabled = false,
}) {
  // 下拉菜单展开状态
  const [open, setOpen] = useState(false);

  // 当前语言可用的外网平台列表
  const playgrounds = useMemo(
    () => getExternalPlaygrounds(langLower),
    [langLower]
  );

  // ---------- 打开外网平台 ----------
  const handleSelect = useCallback(
    async (pgId) => {
      setOpen(false);
      await openExternal(pgId, code, langLower);
    },
    [code, langLower]
  );

  // ---------- 点击菜单外部自动收起 ----------
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!e.target.closest || !e.target.closest(".ext-run-dropdown")) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // 无可用平台时不渲染
  if (playgrounds.length === 0) return null;

  return (
    <div className="ext-run-dropdown">
      <button
        className="btn btn-secondary ext-run-btn"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        title="在外部网站运行代码（无需本地环境）"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        🌐 外网 <span className="ext-caret">▾</span>
      </button>
      {open && (
        <div className="ext-run-menu" role="menu">
          {playgrounds.map((pg) => (
            <button
              key={pg.id}
              className="ext-run-item"
              onClick={() => handleSelect(pg.id)}
              role="menuitem"
            >
              <span className="ext-run-icon">{pg.icon}</span>
              <span>{pg.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
