"use client";

// =============================================================
// 滚动位置记忆组件
// -------------------------------------------------------------
// 全局监听 .content 元素的滚动位置，按「课程路径 + 章节hash」
// 存入 sessionStorage。刷新页面后自动恢复到上次的滚动位置。
//
// 工作原理：
//   1. 滚动时（防抖 200ms）保存当前位置到 sessionStorage
//   2. 页面刷新时，等章节恢复 + 内容渲染完毕后恢复滚动位置
//   3. 切换章节（hash 变化）时不恢复，由 selectChapter 滚动到顶部
// =============================================================

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 按当前课程路径 + 章节hash 生成存储键
    const getKey = () =>
      `scrollPos:${pathname}:${window.location.hash.slice(1)}`;

    // 查找内容滚动容器
    const findContent = () => document.querySelector(".content");

    let restored = false; // 是否已完成恢复
    let lastHash = window.location.hash.slice(1); // 记录初始 hash

    // ---- 恢复滚动位置 ----
    // 内容可能在章节恢复后才渲染完成，用轮询确保内容就绪
    const tryRestore = () => {
      if (restored) return;
      const el = findContent();
      if (!el) return;

      // hash 从空变为有值（Sidebar 从 localStorage 恢复了章节），
      // 更新 lastHash 使 key 匹配
      const currentHash = window.location.hash.slice(1);
      if (currentHash !== lastHash) {
        lastHash = currentHash;
      }

      try {
        const pos = sessionStorage.getItem(getKey());
        if (pos != null) {
          const target = parseInt(pos, 10);
          const maxScroll = el.scrollHeight - el.clientHeight;
          // 内容高度足够才恢复，否则等下一轮轮询
          if (maxScroll > 0 && el.scrollHeight >= target + el.clientHeight) {
            el.scrollTop = target;
            restored = true;
          } else if (maxScroll <= 0) {
            // 内容不足以滚动，无需恢复
            restored = true;
          }
        } else {
          // 没有保存的位置，无需恢复
          restored = true;
        }
      } catch (e) {
        restored = true;
      }
    };

    // 每 100ms 尝试恢复，最多持续 2 秒
    const restoreInterval = setInterval(tryRestore, 100);
    const stopTimer = setTimeout(() => {
      clearInterval(restoreInterval);
      restored = true;
    }, 2000);

    // ---- 保存滚动位置（防抖）----
    let saveTimer = null;
    const handleScroll = () => {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        const el = findContent();
        if (!el || !restored) return;
        try {
          sessionStorage.setItem(getKey(), String(el.scrollTop));
        } catch (e) {
          // sessionStorage 不可用时静默忽略
        }
      }, 200);
    };

    // 页面卸载前立即保存一次（防止防抖未执行）
    const handleBeforeUnload = () => {
      const el = findContent();
      if (!el) return;
      try {
        sessionStorage.setItem(getKey(), String(el.scrollTop));
      } catch (e) {}
    };

    // ---- 挂载滚动监听 ----
    let currentEl = findContent();
    if (currentEl) {
      currentEl.addEventListener("scroll", handleScroll, { passive: true });
    }
    // 元素可能尚未渲染，延迟重试
    const attachTimer = setTimeout(() => {
      if (!currentEl || !document.contains(currentEl)) {
        currentEl = findContent();
        if (currentEl) {
          currentEl.addEventListener("scroll", handleScroll, { passive: true });
        }
      }
    }, 300);

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(restoreInterval);
      clearTimeout(stopTimer);
      clearTimeout(attachTimer);
      clearTimeout(saveTimer);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (currentEl) {
        currentEl.removeEventListener("scroll", handleScroll);
      }
    };
  }, [pathname]);

  return null;
}
