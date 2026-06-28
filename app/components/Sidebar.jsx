"use client";

// =============================================================
// 通用侧边栏组件 —— 全局共享
// -------------------------------------------------------------
// 功能：
//   1. 章节目录导航（分组展示、高亮当前章节）
//   2. 可收起 / 展开（桌面端点击 ✕ 收起，点击浮动按钮展开）
//   3. 可拖拽调整宽度（200px ~ 480px，双击恢复默认 280px）
//   4. 移动端抽屉式（通过 sidebarOpen 控制）
//
// 用法：
//   <Sidebar
//     title="学习目录"
//     tip="点击章节开始学习"
//     footer={<p>💡 提示</p>}
//     groupedChapters={groupedChapters}
//     activeId={activeId}
//     onSelectChapter={selectChapter}
//     sidebarOpen={sidebarOpen}
//     onCloseSidebar={() => setSidebarOpen(false)}
//   />
// =============================================================

import { useState, useCallback } from "react";

const MIN_SIDEBAR_W = 200;
const MAX_SIDEBAR_W = 480;
const DEFAULT_SIDEBAR_W = 280;

export default function Sidebar({
  title = "目录",
  tip = "",
  footer = null,
  groupedChapters = [],
  activeId = "",
  onSelectChapter,
  sidebarOpen = false,
  onCloseSidebar,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(DEFAULT_SIDEBAR_W);

  // ===== 拖拽调整宽度 =====
  const startResize = useCallback((e) => {
    e.preventDefault();
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (ev) => {
      const newWidth = Math.max(
        MIN_SIDEBAR_W,
        Math.min(MAX_SIDEBAR_W, ev.clientX)
      );
      setWidth(newWidth);
    };

    const onMouseUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  const handleSelect = useCallback(
    (chapterId) => {
      onSelectChapter(chapterId);
    },
    [onSelectChapter]
  );

  return (
    <>
      <aside
        className={`sidebar ${sidebarOpen ? "open" : ""} ${collapsed ? "collapsed" : ""}`}
        style={collapsed ? undefined : { width: `${width}px` }}
      >
        <div className="sidebar-inner">
          <div className="sidebar-header">
            <div className="sidebar-header-row">
              <h2>{title}</h2>
              <button
                className="sidebar-collapse-btn"
                onClick={() => setCollapsed(true)}
                title="收起目录"
                aria-label="收起目录"
              >
                ✕
              </button>
            </div>
            {tip && <p className="sidebar-tip">{tip}</p>}
          </div>
          <nav className="chapter-nav">
            {groupedChapters.map(({ group, items }) => (
              <div key={group} className="chapter-group">
                <div className="group-title">{group}</div>
                <ul>
                  {items.map((ch) => (
                    <li key={ch.id}>
                      <button
                        className={`chapter-item ${activeId === ch.id ? "active" : ""}`}
                        onClick={() => handleSelect(ch.id)}
                      >
                        <span className="chapter-icon">{ch.icon}</span>
                        <span className="chapter-title-text">{ch.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          {footer && <div className="sidebar-footer">{footer}</div>}
        </div>

        {/* 拖拽调整宽度的把手 */}
        <div
          className="sidebar-resize-handle"
          onMouseDown={startResize}
          onDoubleClick={() => setWidth(DEFAULT_SIDEBAR_W)}
          title="拖拽调整宽度 · 双击恢复默认"
        >
          <div className="sidebar-resize-grip" />
        </div>
      </aside>

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={onCloseSidebar} />
      )}

      {/* 收起后的展开浮动按钮 */}
      {collapsed && (
        <button
          className="sidebar-expand-btn"
          onClick={() => setCollapsed(false)}
          title="展开目录"
          aria-label="展开目录"
        >
          <span className="expand-btn-icon">📖</span>
          <span className="expand-btn-text">目录</span>
        </button>
      )}
    </>
  );
}
