"use client";

// =============================================================
// 快速滚动组件（回到顶部 / 跳到底部）
// -------------------------------------------------------------
// 在内容区右侧显示两个浮动按钮：
//   ↑ 回到顶部（不在顶部时显示）
//   ↓ 跳到底部（不在底部时显示）
// 滚动容器为 .content 元素，平滑滚动动画。
// =============================================================

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

export default function QuickScroll() {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);

  const findContent = useCallback(
    () => document.querySelector(".content"),
    []
  );

  // 检测滚动位置，决定按钮显隐
  const checkScroll = useCallback(() => {
    const el = findContent();
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    // 距离顶部超过 200px 时显示「回到顶部」
    setShowTop(scrollTop > 200);
    // 距离底部超过 200px 时显示「跳到底部」
    setShowBottom(scrollHeight - scrollTop - clientHeight > 200);
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
    let currentEl = findContent();

    // 用 MutationObserver 等待 .content 元素渲染
    const attach = () => {
      const el = findContent();
      if (el && el !== currentEl) {
        if (currentEl) {
          currentEl.removeEventListener("scroll", checkScroll);
        }
        currentEl = el;
        currentEl.addEventListener("scroll", checkScroll, { passive: true });
        checkScroll();
      } else if (el && !currentEl) {
        currentEl = el;
        currentEl.addEventListener("scroll", checkScroll, { passive: true });
        checkScroll();
      }
    };

    attach();

    const observer = new MutationObserver(() => {
      if (!currentEl || !document.contains(currentEl)) {
        attach();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 延迟兜底（内容渲染后再次检查）
    const attachTimer = setTimeout(attach, 500);
    const checkTimer = setTimeout(checkScroll, 800);

    return () => {
      observer.disconnect();
      clearTimeout(attachTimer);
      clearTimeout(checkTimer);
      if (currentEl) {
        currentEl.removeEventListener("scroll", checkScroll);
      }
    };
  }, [pathname, findContent, checkScroll]);

  return (
    <div className="quick-scroll">
      {showTop && (
        <button
          className="quick-scroll-btn quick-scroll-top"
          onClick={scrollToTop}
          title="回到顶部"
          aria-label="回到顶部"
        >
          ↑
        </button>
      )}
      {showBottom && (
        <button
          className="quick-scroll-btn quick-scroll-bottom"
          onClick={scrollToBottom}
          title="跳到底部"
          aria-label="跳到底部"
        >
          ↓
        </button>
      )}
    </div>
  );
}
