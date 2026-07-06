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

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

export default function QuickScroll() {
  const pathname = usePathname();
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  // 查找内容滚动容器
  const findContent = useCallback(
    () => document.querySelector(".content"),
    []
  );

  // 检测滚动位置，决定按钮状态
  const checkScroll = useCallback(() => {
    const el = findContent();
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setAtTop(scrollTop < 200);
    setAtBottom(scrollHeight - scrollTop - clientHeight < 200);
  }, [findContent]);

  // 滚动到顶部
  const scrollToTop = useCallback(() => {
    const el = findContent();
    if (!el) return;
    el.scrollTo({ top: 0, behavior: "smooth" });
  }, [findContent]);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    const el = findContent();
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [findContent]);

  useEffect(() => {
    // scroll 事件不冒泡，但 capture 阶段可以在 window 上捕获子元素的滚动
    // 这样切换章节后 .content 被替换也不需要重新绑定
    window.addEventListener("scroll", checkScroll, true);
    // resize 时内容高度可能变化
    window.addEventListener("resize", checkScroll);

    // 初始检查 + 延迟检查（等待内容渲染完毕）
    checkScroll();
    const t1 = setTimeout(checkScroll, 300);
    const t2 = setTimeout(checkScroll, 800);

    return () => {
      window.removeEventListener("scroll", checkScroll, true);
      window.removeEventListener("resize", checkScroll);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, checkScroll]);

  return (
    <div className="quick-scroll">
      <button
        className={`quick-scroll-btn quick-scroll-top ${atTop ? "disabled" : ""}`}
        onClick={scrollToTop}
        title="回到顶部"
        aria-label="回到顶部"
      >
        ↑
      </button>
      <button
        className={`quick-scroll-btn quick-scroll-bottom ${atBottom ? "disabled" : ""}`}
        onClick={scrollToBottom}
        title="跳到底部"
        aria-label="跳到底部"
      >
        ↓
      </button>
    </div>
  );
}
