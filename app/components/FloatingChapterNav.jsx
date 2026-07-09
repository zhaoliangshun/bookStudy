"use client";

// =============================================================
// 浮动章节导航（右侧悬浮：上一章 ← / → 下一章）
// -------------------------------------------------------------
// 固定在页面右侧中部，以左右箭头按钮形式显示上一章/下一章导航。
// 数据来源：chapterNavStore 单例（由 Sidebar 在挂载时注册）。
// 无章节数据时自动隐藏。
//
// 交互：
//   ← 上一章：点击后触发 onSelect(prev.id)
//   → 下一章：点击后触发 onSelect(next.id)
//   首章时 ← 灰显禁用，末章时 → 灰显禁用
//   鼠标悬停显示 tooltip（章节图标+标题）
// =============================================================

import { useState, useEffect, useSyncExternalStore } from "react";
import { chapterNavStore } from "./chapterNavStore";

function subscribe(fn) {
  return chapterNavStore.subscribe(fn);
}

function getSnapshot() {
  return chapterNavStore.getState();
}

export default function FloatingChapterNav() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const { chapters, activeId, onSelect } = state;

  const idx = chapters.findIndex((c) => c.id === activeId);
  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null;

  const [hoverPrev, setHoverPrev] = useState(false);
  const [hoverNext, setHoverNext] = useState(false);

  if (!chapters.length) return null;

  return (
    <div className="floating-chapter-nav">
      {prev ? (
        <button
          className="floating-nav-btn"
          onClick={() => onSelect && onSelect(prev.id)}
          onMouseEnter={() => setHoverPrev(true)}
          onMouseLeave={() => setHoverPrev(false)}
          title={`上一章：${prev.icon || ""} ${prev.title}`}
          aria-label="上一章"
        >
          <span className="floating-nav-arrow">←</span>
          {hoverPrev && (
            <span className="floating-nav-tip floating-nav-tip-prev">
              {prev.icon ? <span className="floating-nav-tip-icon">{prev.icon}</span> : null}
              <span className="floating-nav-tip-text">{prev.title}</span>
            </span>
          )}
        </button>
      ) : (
        <button className="floating-nav-btn floating-nav-btn-disabled" disabled aria-label="无上一章">
          <span className="floating-nav-arrow">←</span>
        </button>
      )}
      {next ? (
        <button
          className="floating-nav-btn"
          onClick={() => onSelect && onSelect(next.id)}
          onMouseEnter={() => setHoverNext(true)}
          onMouseLeave={() => setHoverNext(false)}
          title={`下一章：${next.icon || ""} ${next.title}`}
          aria-label="下一章"
        >
          <span className="floating-nav-arrow">→</span>
          {hoverNext && (
            <span className="floating-nav-tip floating-nav-tip-next">
              {next.icon ? <span className="floating-nav-tip-icon">{next.icon}</span> : null}
              <span className="floating-nav-tip-text">{next.title}</span>
            </span>
          )}
        </button>
      ) : (
        <button className="floating-nav-btn floating-nav-btn-disabled" disabled aria-label="无下一章">
          <span className="floating-nav-arrow">→</span>
        </button>
      )}
    </div>
  );
}
