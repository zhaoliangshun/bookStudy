"use client";

// =============================================================
// 滚动位置记忆组件
// -------------------------------------------------------------
// 全局监听 .content 元素的滚动位置，按「课程路径 + 章节hash」
// 存入 sessionStorage。刷新页面后自动恢复到上次的滚动位置。
//
// 核心难点：刷新后页面先用默认章节渲染，Sidebar 才从
// localStorage/hash 恢复正确章节。如果在错误章节的内容上
// 恢复滚动位置，章节切换后位置就错了。
//
// 解决方案：等待 hash 稳定 + 内容高度稳定后再恢复。
//   1. hash 稳定：连续 3 次轮询（300ms）hash 未变化
//   2. 内容稳定：连续 2 次轮询（200ms）scrollHeight 未变化
//   3. 两个条件都满足后才恢复滚动位置
// =============================================================

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const findContent = () => document.querySelector(".content");

    let restored = false;

    // ---- hash 与内容高度稳定性追踪 ----
    let lastHash = window.location.hash.slice(1);
    let hashStableCount = 0; // hash 连续未变化次数
    let lastScrollHeight = 0;
    let heightStableCount = 0; // scrollHeight 连续未变化次数

    // ---- 恢复滚动位置 ----
    const tryRestore = () => {
      if (restored) return;
      const el = findContent();
      if (!el) return;

      const currentHash = window.location.hash.slice(1);

      // 1. 检查 hash 是否稳定
      if (currentHash !== lastHash) {
        lastHash = currentHash;
        hashStableCount = 0;
        // hash 变了，重置高度追踪（内容会跟着变）
        lastScrollHeight = 0;
        heightStableCount = 0;
        return;
      }
      hashStableCount++;

      // hash 需连续稳定 3 次（300ms）才继续
      if (hashStableCount < 3) return;

      // 2. hash 稳定后，检查是否有保存的滚动位置
      const key = `scrollPos:${pathname}:${currentHash}`;
      let savedPos;
      try {
        savedPos = sessionStorage.getItem(key);
      } catch (e) {
        restored = true;
        return;
      }

      if (savedPos == null) {
        // 没有保存的位置，无需恢复
        restored = true;
        return;
      }

      const target = parseInt(savedPos, 10);

      // 3. 检查内容高度是否稳定（章节已渲染完毕）
      if (el.scrollHeight !== lastScrollHeight) {
        lastScrollHeight = el.scrollHeight;
        heightStableCount = 0;
        return;
      }
      heightStableCount++;

      // 高度需连续稳定 2 次（200ms）才恢复
      if (heightStableCount < 2) return;

      // 4. 内容稳定，恢复滚动位置（.content 已配置 scroll-behavior: auto，瞬时定位）
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll > 0) {
        el.scrollTop = Math.min(target, maxScroll);
      }
      restored = true;
    };

    // 每 100ms 尝试恢复，最多持续 3 秒
    const restoreInterval = setInterval(tryRestore, 100);
    const stopTimer = setTimeout(() => {
      restored = true;
    }, 3000);

    // ---- 保存滚动位置（节流，确保最新位置已存储）----
    let lastSavedPos = -1;
    let saveTimer = null;
    const handleScroll = () => {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        const el = findContent();
        if (!el || !restored) return;
        const pos = el.scrollTop;
        if (pos === lastSavedPos) return;
        lastSavedPos = pos;
        try {
          const key = `scrollPos:${pathname}:${window.location.hash.slice(1)}`;
          sessionStorage.setItem(key, String(pos));
        } catch (e) {}
      }, 150);
    };

    // 页面隐藏 / 卸载前立即保存（比 beforeunload 更可靠）
    const saveNow = () => {
      const el = findContent();
      if (!el) return;
      try {
        const key = `scrollPos:${pathname}:${window.location.hash.slice(1)}`;
        sessionStorage.setItem(key, String(el.scrollTop));
      } catch (e) {}
    };

    // ---- 挂载滚动监听（元素可能延迟渲染，用 MutationObserver 兜底）----
    let currentEl = findContent();
    const attachListener = (el) => {
      if (currentEl) currentEl.removeEventListener("scroll", handleScroll);
      currentEl = el;
      if (currentEl) {
        currentEl.addEventListener("scroll", handleScroll, { passive: true });
      }
    };
    if (currentEl) attachListener(currentEl);

    // 元素可能尚未渲染，用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver(() => {
      if (!currentEl || !document.contains(currentEl)) {
        const el = findContent();
        if (el) attachListener(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 延迟兜底（MutationObserver 在某些情况下可能错过）
    const attachTimer = setTimeout(() => {
      if (!currentEl || !document.contains(currentEl)) {
        const el = findContent();
        if (el) attachListener(el);
      }
    }, 500);

    window.addEventListener("pagehide", saveNow);
    window.addEventListener("beforeunload", saveNow);

    return () => {
      clearInterval(restoreInterval);
      clearTimeout(stopTimer);
      clearTimeout(attachTimer);
      clearTimeout(saveTimer);
      observer.disconnect();
      window.removeEventListener("pagehide", saveNow);
      window.removeEventListener("beforeunload", saveNow);
      if (currentEl) {
        currentEl.removeEventListener("scroll", handleScroll);
      }
    };
  }, [pathname]);

  return null;
}
