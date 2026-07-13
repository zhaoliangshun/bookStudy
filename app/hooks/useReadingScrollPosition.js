"use client";

// =============================================================
// 章节阅读位置记忆 Hook —— useReadingScrollPosition
// -------------------------------------------------------------
// 功能：保存每一章的滚动位置，下次切回该章时自动恢复到上次阅读处
//
// 设计要点：
//   1. 用 localStorage 持久化保存（key 含 bookPath + chapterId，每本书每章独立）
//   2. 节流写入（500ms 内多次 scroll 只写一次），避免频繁 IO
//   3. 处理异步内容加载（CodeBlock 是 dynamic import，渲染完后高度才完整）：
//      - 用 ResizeObserver 监听内容高度变化
//      - 一旦 scrollHeight 足够容纳保存的位置，立即恢复
//      - 1 秒超时保护，超时后用 Math.min 防止超出范围
//   4. 切换章节前调用 saveCurrentBeforeSwitch() 立即保存当前章
//   5. 切换后由内部 useEffect 自动恢复新章位置（无需调用方处理）
//   6. beforeunload 和组件卸载时立即保存，防止位置丢失
//
// 使用方式：
//   const { saveCurrentBeforeSwitch } = useReadingScrollPosition(
//     "/book-path",    // 书的唯一路径标识
//     contentRef,      // 内容容器的 ref
//     activeId          // 当前章节 ID
//   );
//
//   const selectChapter = useCallback((chapterId) => {
//     saveCurrentBeforeSwitch();   // 切换前保存
//     setActiveId(chapterId);
//     // 不需要再手动设置 scrollTop = 0，hook 内部会自动恢复
//   }, [saveCurrentBeforeSwitch]);
// =============================================================

import { useRef, useEffect, useCallback } from "react";

// localStorage key 前缀，避免与其他 key 冲突
const STORAGE_PREFIX = "reading:scroll:";

// 节流间隔（毫秒）：scroll 事件触发后多久才真正写入 localStorage
const SAVE_THROTTLE_MS = 500;

// 恢复位置的超时时间（毫秒）：超过此时间内容仍未渲染完则强制恢复
const RESTORE_TIMEOUT_MS = 1000;

export function useReadingScrollPosition(bookPath, contentRef, activeId) {
  // 用 ref 跟踪最新的 activeId 和 scrollTop
  // 原因：scroll 事件回调里访问的 activeId 是闭包捕获的旧值，
  // 用 ref 可以始终拿到最新值，避免每次 activeId 变化都重新绑定事件
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  // 最近一次 scroll 的 scrollTop 值
  // 用于在切换章节/页面关闭时立即保存，不依赖节流定时器
  const lastScrollTopRef = useRef(0);

  // 节流定时器引用
  const saveTimerRef = useRef(null);

  // 立即写入 localStorage（不节流）
  // 参数说明：
  //   chapterId: 章节 ID
  //   scrollTop: 滚动位置（像素）
  const saveNow = useCallback((chapterId, scrollTop) => {
    if (!chapterId || !bookPath) return;
    try {
      localStorage.setItem(
        `${STORAGE_PREFIX}${bookPath}:${chapterId}`,
        String(scrollTop)
      );
    } catch {
      // localStorage 满了或被禁用，忽略错误
    }
  }, [bookPath]);

  // 读取某章保存的滚动位置
  // 参数说明：
  //   chapterId: 章节 ID
  // 返回值：保存的 scrollTop（像素），无记录返回 0
  const loadPosition = useCallback((chapterId) => {
    if (!chapterId || !bookPath) return 0;
    try {
      const v = localStorage.getItem(`${STORAGE_PREFIX}${bookPath}:${chapterId}`);
      // parseInt 第二个参数 10 表示按十进制解析，避免八进制歧义
      return v ? parseInt(v, 10) : 0;
    } catch {
      return 0;
    }
  }, [bookPath]);

  // 节流调度保存（scroll 事件中调用）
  // 原理：500ms 内多次调用只写一次 localStorage，减少 IO 压力
  // 参数说明：
  //   scrollTop: 当前滚动位置（像素）
  const scheduleSave = useCallback((scrollTop) => {
    lastScrollTopRef.current = scrollTop;
    // 已有定时器在等待，直接返回（节流）
    if (saveTimerRef.current) return;
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      saveNow(activeIdRef.current, lastScrollTopRef.current);
    }, SAVE_THROTTLE_MS);
  }, [saveNow]);

  // 切换章节前调用：立即保存当前章的位置（清掉 pending 的节流定时器）
  // 必须立即保存，否则用户切走后节流定时器可能被新章节的 scroll 重置
  const saveCurrentBeforeSwitch = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    saveNow(activeIdRef.current, lastScrollTopRef.current);
  }, [saveNow]);

  // ===== 监听 scroll 事件，节流保存当前位置 =====
  // 用 passive: true 提升滚动性能（不调用 preventDefault）
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    let rafId = null;
    const handleScroll = () => {
      // rAF 节流：每帧最多保存一次，避免高频 scroll 事件卡顿
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        scheduleSave(content.scrollTop);
      });
    };
    content.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      content.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [contentRef, scheduleSave]);

  // ===== 切换章节后恢复新章的位置 =====
  // activeId 变化时触发，处理异步内容加载（CodeBlock dynamic import）
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const saved = loadPosition(activeId);

    // 没保存过位置（首次阅读），滚动到顶部
    if (saved <= 0) {
      content.scrollTop = 0;
      return;
    }

    // 已保存过位置，尝试恢复
    let restored = false;
    let observer = null;
    let timeoutId = null;

    const tryRestore = () => {
      if (restored) return;
      // 检查内容高度是否足够容纳保存的位置
      // scrollHeight - clientHeight 是最大可滚动距离
      const maxScrollTop = content.scrollHeight - content.clientHeight;
      if (maxScrollTop >= saved) {
        // 高度足够，立即恢复
        content.scrollTop = saved;
        restored = true;
        if (observer) observer.disconnect();
        if (timeoutId) clearTimeout(timeoutId);
      }
      // 高度不够，等待 ResizeObserver 触发下一次尝试
    };

    // 立即尝试一次（同步内容已渲染完成的情况）
    tryRestore();

    // 如果还没恢复，用 ResizeObserver 监听内容尺寸变化
    // CodeBlock 是 dynamic import，加载完后内容高度会变化
    if (!restored) {
      observer = new ResizeObserver(tryRestore);
      observer.observe(content);
      // 超时保护：1 秒后无论如何都停止观察并强制恢复
      // 防止内容加载失败或高度永远不够时无限等待
      timeoutId = setTimeout(() => {
        if (!restored) {
          const maxScrollTop = content.scrollHeight - content.clientHeight;
          // 用 Math.min 防止超出范围
          content.scrollTop = Math.min(saved, maxScrollTop);
          restored = true;
        }
        if (observer) observer.disconnect();
      }, RESTORE_TIMEOUT_MS);
    }

    return () => {
      // 清理：取消所有监听和定时器
      restored = true;
      if (observer) observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
    // 注意：loadPosition 是 useCallback，依赖 bookPath，这里可以安全依赖
    // contentRef 是 ref，引用稳定，不会触发 effect 重跑
  }, [activeId, loadPosition, contentRef]);

  // ===== beforeunload 时立即保存当前位置 =====
  // 用户关闭/刷新页面时，把当前章位置持久化
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      saveNow(activeIdRef.current, lastScrollTopRef.current);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveNow]);

  // ===== 组件卸载时立即保存 =====
  // React 路由切换时组件会卸载，此时要保存当前位置
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      saveNow(activeIdRef.current, lastScrollTopRef.current);
    };
    // 空依赖：只在组件卸载时执行一次
    // saveNow 是 useCallback，引用稳定，可省略
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { saveCurrentBeforeSwitch, scheduleSave, loadPosition };
}
