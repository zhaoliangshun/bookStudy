"use client";

// =============================================================
// 书籍/章节右键操作状态管理 Hook
// -------------------------------------------------------------
// 提供隐藏书籍、标记删除章节、隐藏章节的状态管理。
// 持久化策略：localStorage（即时响应）+ 服务端 JSON 文件（跨设备同步）
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

// 将三个集合同步到服务端
async function syncToServer(hiddenBooks, deletedChapterIds, hiddenChapterIds) {
  try {
    await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hiddenBooks: [...hiddenBooks],
        deletedChapters: [...deletedChapterIds],
        hiddenChapters: [...hiddenChapterIds],
      }),
    });
  } catch {
    // 网络错误静默忽略
  }
}

export default function useBookChapterActions() {
  const [hiddenBooks, setHiddenBooks] = useState(() => new Set());
  const [deletedChapterIds, setDeletedChapterIds] = useState(() => new Set());
  const [hiddenChapterIds, setHiddenChapterIds] = useState(() => new Set());

  // 挂载后：优先从服务端加载，再 fallback 到 localStorage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/preferences");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (cancelled) return;
        if (data.hiddenBooks?.length) {
          setHiddenBooks(new Set(data.hiddenBooks));
        }
        if (data.deletedChapters?.length) {
          setDeletedChapterIds(new Set(data.deletedChapters));
        }
        if (data.hiddenChapters?.length) {
          setHiddenChapterIds(new Set(data.hiddenChapters));
        }
        const hasServerData =
          data.hiddenBooks?.length ||
          data.deletedChapters?.length ||
          data.hiddenChapters?.length;
        if (hasServerData) return;
      } catch {
        // 服务端不可用，降级到 localStorage
      }
      if (cancelled) return;
      setHiddenBooks(loadSet(HIDDEN_BOOKS_KEY));
      setDeletedChapterIds(loadSet(DELETED_CHAPTERS_KEY));
      setHiddenChapterIds(loadSet(HIDDEN_CHAPTERS_KEY));
    })();
    return () => { cancelled = true; };
  }, []);

  const hideBook = useCallback((path) => {
    setHiddenBooks((prev) => {
      const next = new Set(prev);
      next.add(path);
      saveSet(HIDDEN_BOOKS_KEY, next);
      syncToServer(next, deletedChapterIds, hiddenChapterIds);
      return next;
    });
  }, [deletedChapterIds, hiddenChapterIds]);

  const unhideBook = useCallback((path) => {
    setHiddenBooks((prev) => {
      const next = new Set(prev);
      next.delete(path);
      saveSet(HIDDEN_BOOKS_KEY, next);
      syncToServer(next, deletedChapterIds, hiddenChapterIds);
      return next;
    });
  }, [deletedChapterIds, hiddenChapterIds]);

  // 标记删除 / 取消删除标记章节
  const deleteChapter = useCallback((id) => {
    setDeletedChapterIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveSet(DELETED_CHAPTERS_KEY, next);
      syncToServer(hiddenBooks, next, hiddenChapterIds);
      return next;
    });
  }, [hiddenBooks, hiddenChapterIds]);

  const undeleteChapter = useCallback((id) => {
    setDeletedChapterIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      saveSet(DELETED_CHAPTERS_KEY, next);
      syncToServer(hiddenBooks, next, hiddenChapterIds);
      return next;
    });
  }, [hiddenBooks, hiddenChapterIds]);

  // 隐藏 / 恢复章节
  const hideChapter = useCallback((id) => {
    setHiddenChapterIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveSet(HIDDEN_CHAPTERS_KEY, next);
      syncToServer(hiddenBooks, deletedChapterIds, next);
      return next;
    });
  }, [hiddenBooks, deletedChapterIds]);

  const unhideChapter = useCallback((id) => {
    setHiddenChapterIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      saveSet(HIDDEN_CHAPTERS_KEY, next);
      syncToServer(hiddenBooks, deletedChapterIds, next);
      return next;
    });
  }, [hiddenBooks, deletedChapterIds]);

  // 批量隐藏 / 恢复章节（用于分组右键菜单）
  const hideChapters = useCallback((ids) => {
    setHiddenChapterIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      saveSet(HIDDEN_CHAPTERS_KEY, next);
      syncToServer(hiddenBooks, deletedChapterIds, next);
      return next;
    });
  }, [hiddenBooks, deletedChapterIds]);

  const unhideChapters = useCallback((ids) => {
    setHiddenChapterIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      saveSet(HIDDEN_CHAPTERS_KEY, next);
      syncToServer(hiddenBooks, deletedChapterIds, next);
      return next;
    });
  }, [hiddenBooks, deletedChapterIds]);

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
  };
}
