"use client";

// =============================================================
// 快速滚动组件（回到顶部 / 跳到底部）
// -------------------------------------------------------------
// 在内容区右侧显示两个浮动按钮：
//   ↑ 回到顶部（在顶部时灰显）
//   ↓ 跳到底部（在底部时灰显）
// 滚动容器为 .content 元素，平滑滚动动画。
//
// 关键点：scroll 事件不冒泡，但可以用 capture 阶段在 window 上
// 统一捕获，无需手动绑定 / 解绑 .content 元素，切换章节后依然有效。
// =============================================================

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useFloatingButtonVisibility } from "./FloatingButtonVisibility";

export default function QuickScroll() {
  const pathname = usePathname();
  const { visibility } = useFloatingButtonVisibility();
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  // 修复性能：缓存 content 元素引用，避免每次 scroll 都 querySelector
  const contentRef = useRef(null);
  // rAF 节流引用，避免高频 scroll 事件同步执行
  const rafRef = useRef(null);

  // 查找内容滚动容器
  const findContent = useCallback(
    () => document.querySelector(".content"),
    []
  );

  // 检测滚动位置，决定按钮状态
  // 修复性能：用 requestAnimationFrame 节流 + 缓存 contentRef，避免每次 scroll 同步执行 querySelector
  const checkScroll = useCallback(() => {
    if (rafRef.current) return; // 已有待执行的 raf，跳过
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (!contentRef.current) {
        contentRef.current = document.querySelector(".content");
      }
      const el = contentRef.current;
      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      setAtTop(scrollTop < 200);
      setAtBottom(scrollHeight - scrollTop - clientHeight < 200);
    });
  }, []);

  // 滚动到顶部（瞬间完成，无动画）
  const scrollToTop = useCallback(() => {
    const el = findContent();
    if (!el) return;
    el.scrollTop = 0;
  }, [findContent]);

  // 滚动到底部（瞬间完成，无动画）
  const scrollToBottom = useCallback(() => {
    const el = findContent();
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [findContent]);

  useEffect(() => {
    // 路由切换时 .content 元素会被替换，清空缓存引用以重新查找
    contentRef.current = null;

    // scroll 事件不冒泡，但 capture 阶段可以在 window 上捕获子元素的滚动
    // 这样切换章节后 .content 被替换也不需要重新绑定
    window.addEventListener("scroll", checkScroll, true);
    // resize 时内容高度可能变化
    window.addEventListener("resize", checkScroll);

    // 初始检查 + 延迟检查（等待内容渲染完毕）
    // checkScroll 内部已用 rAF 节流，不会在 effect 同步阶段直接 setState
    checkScroll();
    const t1 = setTimeout(checkScroll, 300);
    const t2 = setTimeout(checkScroll, 800);

    return () => {
      window.removeEventListener("scroll", checkScroll, true);
      window.removeEventListener("resize", checkScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, checkScroll]);

  // 用户在设置面板里关闭了本按钮：直接返回 null，不渲染
  // 必须放在所有 hooks 之后，避免破坏 hooks 调用顺序
  if (visibility.quickScroll === false) return null;

  return (
    <div className="quick-scroll">
      <button
        className={`quick-scroll-btn quick-scroll-top ${atTop ? "disabled" : ""}`}
        onClick={scrollToTop}
        disabled={atTop}
        title="回到顶部"
        aria-label="回到顶部"
      >
        ↑
      </button>
      <button
        className={`quick-scroll-btn quick-scroll-bottom ${atBottom ? "disabled" : ""}`}
        onClick={scrollToBottom}
        disabled={atBottom}
        title="跳到底部"
        aria-label="跳到底部"
      >
        ↓
      </button>
    </div>
  );
}
