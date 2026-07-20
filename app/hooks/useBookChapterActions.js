"use client";

// =============================================================
// 书籍/章节右键操作状态管理 Hook
// -------------------------------------------------------------
// 提供隐藏书籍、标记删除章节、隐藏章节的状态管理。
// 持久化策略：仅写入服务端 JSON 文件（data/user-preferences.json）。
//   不再使用 localStorage，所有操作的最终归宿是服务端文件，
//   以用户最后一次操作为准。
// 使用 useEffect 统一同步到服务端（防抖），避免闭包陷阱。
// 关键：保存 effect 的 gate 用 localModifiedRef 而非 loaded，
//   避免用户在 fetch 完成前的修改因 loaded===false 被跳过保存。
// =============================================================

import { useState, useEffect, useCallback, useRef } from "react";

export default function useBookChapterActions() {
  const [hiddenBooks, setHiddenBooks] = useState(() => new Set());
  const [deletedChapterIds, setDeletedChapterIds] = useState(() => new Set());
  const [hiddenChapterIds, setHiddenChapterIds] = useState(() => new Set());
  // 追踪本地是否已修改（防止服务端同步覆盖 + 跳过未修改时的保存 effect）
  const localModifiedRef = useRef(false);

  // 挂载后从服务端文件加载（文件是唯一真相源）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/preferences");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (cancelled) return;
        // 仅在用户尚未本地修改时才用服务端数据覆盖
        if (!localModifiedRef.current) {
          if (data.hiddenBooks?.length) setHiddenBooks(new Set(data.hiddenBooks));
          if (data.deletedChapters?.length) setDeletedChapterIds(new Set(data.deletedChapters));
          if (data.hiddenChapters?.length) setHiddenChapterIds(new Set(data.hiddenChapters));
        }
      } catch {
        // 静默失败，状态保持默认空集
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 统一同步到服务端文件（防抖 300ms）
  // gate 用 localModifiedRef.current：用户从未修改过时不发请求
  useEffect(() => {
    if (!localModifiedRef.current) return;
    const timer = setTimeout(() => {
      fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hiddenBooks: [...hiddenBooks],
          deletedChapters: [...deletedChapterIds],
          hiddenChapters: [...hiddenChapterIds],
        }),
      }).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [hiddenBooks, deletedChapterIds, hiddenChapterIds]);

  const hideBook = useCallback((path) => {
    localModifiedRef.current = true;
    setHiddenBooks((prev) => { const n = new Set(prev); n.add(path); return n; });
  }, []);

  const unhideBook = useCallback((path) => {
    localModifiedRef.current = true;
    setHiddenBooks((prev) => { const n = new Set(prev); n.delete(path); return n; });
  }, []);

  const deleteChapter = useCallback((id) => {
    localModifiedRef.current = true;
    setDeletedChapterIds((prev) => { const n = new Set(prev); n.add(id); return n; });
  }, []);

  const undeleteChapter = useCallback((id) => {
    localModifiedRef.current = true;
    setDeletedChapterIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  }, []);

  const hideChapter = useCallback((id) => {
    localModifiedRef.current = true;
    setHiddenChapterIds((prev) => { const n = new Set(prev); n.add(id); return n; });
  }, []);

  const unhideChapter = useCallback((id) => {
    localModifiedRef.current = true;
    setHiddenChapterIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  }, []);

  const hideChapters = useCallback((ids) => {
    localModifiedRef.current = true;
    setHiddenChapterIds((prev) => {
      const n = new Set(prev);
      ids.forEach((id) => n.add(id));
      return n;
    });
  }, []);

  const unhideChapters = useCallback((ids) => {
    localModifiedRef.current = true;
    setHiddenChapterIds((prev) => {
      const n = new Set(prev);
      ids.forEach((id) => n.delete(id));
      return n;
    });
  }, []);

  const clearHiddenBooks = useCallback(() => {
    localModifiedRef.current = true;
    setHiddenBooks(() => new Set());
  }, []);

  const resetAll = useCallback(() => {
    localModifiedRef.current = true;
    const empty = new Set();
    setHiddenBooks(empty);
    setDeletedChapterIds(empty);
    setHiddenChapterIds(empty);
    fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hiddenBooks: [], deletedChapters: [], hiddenChapters: [] }),
    }).catch(() => {});
  }, []);

  return {
    hiddenBooks,
    deletedChapterIds,
    hiddenChapterIds,
    hideBook,
    unhideBook,
    deleteChapter,
    undeleteChapter,
    hideChapter,
    unhideChapter,
    hideChapters,
    unhideChapters,
    clearHiddenBooks,
    resetAll: resetAll,
  };
}
