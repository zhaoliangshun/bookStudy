"use client";

// =============================================================
// 书籍/章节右键操作状态管理 Hook
// -------------------------------------------------------------
// 提供隐藏书籍、标记删除章节、隐藏章节的状态管理。
// 持久化策略：localStorage（即时响应）+ 服务端 JSON 文件（跨设备同步）
// 使用 useEffect 统一同步到服务端（防抖），避免闭包陷阱。
// =============================================================

import { useState, useEffect, useCallback, useRef } from "react";

const HIDDEN_BOOKS_KEY = "sidebar:hidden-books";
const DELETED_CHAPTERS_KEY = "sidebar:deleted-chapters";
const HIDDEN_CHAPTERS_KEY = "sidebar:hidden-chapters";

function loadSet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveSet(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {}
}

export default function useBookChapterActions() {
  const [hiddenBooks, setHiddenBooks] = useState(() => new Set());
  const [deletedChapterIds, setDeletedChapterIds] = useState(() => new Set());
  const [hiddenChapterIds, setHiddenChapterIds] = useState(() => new Set());
  const loadedRef = useRef(false);

  // 挂载后：优先从服务端加载，再 fallback 到 localStorage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/preferences");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (cancelled) return;
        if (data.hiddenBooks?.length) setHiddenBooks(new Set(data.hiddenBooks));
        if (data.deletedChapters?.length) setDeletedChapterIds(new Set(data.deletedChapters));
        if (data.hiddenChapters?.length) setHiddenChapterIds(new Set(data.hiddenChapters));
        loadedRef.current = true;
      } catch {
        if (cancelled) return;
        setHiddenBooks(loadSet(HIDDEN_BOOKS_KEY));
        setDeletedChapterIds(loadSet(DELETED_CHAPTERS_KEY));
        setHiddenChapterIds(loadSet(HIDDEN_CHAPTERS_KEY));
        loadedRef.current = true;
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 统一同步到服务端（防抖 300ms，避免频繁请求）
  useEffect(() => {
    if (!loadedRef.current) return;
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

  const updateSet = useCallback((setter, key) => (updater) => {
    setter((prev) => {
      const next = typeof updater === "function"
        ? new Set([...updater(prev)])
        : new Set([...updater]);
      saveSet(key, next);
      return next;
    });
  }, []);

  const hideBook = useCallback((path) => {
    setHiddenBooks((prev) => { const n = new Set(prev); n.add(path); saveSet(HIDDEN_BOOKS_KEY, n); return n; });
  }, []);

  const unhideBook = useCallback((path) => {
    setHiddenBooks((prev) => { const n = new Set(prev); n.delete(path); saveSet(HIDDEN_BOOKS_KEY, n); return n; });
  }, []);

  const deleteChapter = useCallback((id) => {
    setDeletedChapterIds((prev) => { const n = new Set(prev); n.add(id); saveSet(DELETED_CHAPTERS_KEY, n); return n; });
  }, []);

  const undeleteChapter = useCallback((id) => {
    setDeletedChapterIds((prev) => { const n = new Set(prev); n.delete(id); saveSet(DELETED_CHAPTERS_KEY, n); return n; });
  }, []);

  const hideChapter = useCallback((id) => {
    setHiddenChapterIds((prev) => { const n = new Set(prev); n.add(id); saveSet(HIDDEN_CHAPTERS_KEY, n); return n; });
  }, []);

  const unhideChapter = useCallback((id) => {
    setHiddenChapterIds((prev) => { const n = new Set(prev); n.delete(id); saveSet(HIDDEN_CHAPTERS_KEY, n); return n; });
  }, []);

  const hideChapters = useCallback((ids) => {
    setHiddenChapterIds((prev) => {
      const n = new Set(prev);
      ids.forEach((id) => n.add(id));
      saveSet(HIDDEN_CHAPTERS_KEY, n);
      return n;
    });
  }, []);

  const unhideChapters = useCallback((ids) => {
    setHiddenChapterIds((prev) => {
      const n = new Set(prev);
      ids.forEach((id) => n.delete(id));
      saveSet(HIDDEN_CHAPTERS_KEY, n);
      return n;
    });
  }, []);

  const clearHiddenBooks = useCallback(() => {
    setHiddenBooks(() => { const n = new Set(); saveSet(HIDDEN_BOOKS_KEY, n); return n; });
  }, []);

  const resetAll = useCallback(() => {
    const empty = new Set();
    setHiddenBooks(empty);
    setDeletedChapterIds(empty);
    setHiddenChapterIds(empty);
    saveSet(HIDDEN_BOOKS_KEY, empty);
    saveSet(DELETED_CHAPTERS_KEY, empty);
    saveSet(HIDDEN_CHAPTERS_KEY, empty);
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
