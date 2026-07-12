"use client";

// =============================================================
// 书籍/章节右键操作状态管理 Hook
// -------------------------------------------------------------
// 提供隐藏书籍、标记删除章节、隐藏章节的状态管理。
// 持久化策略：localStorage（即时响应）+ 服务端 JSON 文件（跨设备同步）
// 使用 useEffect 统一同步到服务端（防抖），避免闭包陷阱。
// =============================================================

import { useState, useEffect, useCallback } from "react";

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
  const [loaded, setLoaded] = useState(false);

  // 挂载后：优先从服务端加载，再 fallback 到 localStorage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/preferences");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (cancelled) return;
        // 按字段独立判断：服务端有数据则用服务端，无数据则 fallback 到 localStorage
        if (data.hiddenBooks?.length) setHiddenBooks(new Set(data.hiddenBooks));
        else setHiddenBooks(loadSet(HIDDEN_BOOKS_KEY));
        if (data.deletedChapters?.length) setDeletedChapterIds(new Set(data.deletedChapters));
        else setDeletedChapterIds(loadSet(DELETED_CHAPTERS_KEY));
        if (data.hiddenChapters?.length) setHiddenChapterIds(new Set(data.hiddenChapters));
        else setHiddenChapterIds(loadSet(HIDDEN_CHAPTERS_KEY));
        setLoaded(true);
      } catch {
        if (cancelled) return;
        setHiddenBooks(loadSet(HIDDEN_BOOKS_KEY));
        setDeletedChapterIds(loadSet(DELETED_CHAPTERS_KEY));
        setHiddenChapterIds(loadSet(HIDDEN_CHAPTERS_KEY));
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 统一同步到服务端（防抖 300ms）
  useEffect(() => {
    if (!loaded) return;
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
  }, [hiddenBooks, deletedChapterIds, hiddenChapterIds, loaded]);

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
