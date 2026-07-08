"use client";

// =============================================================
// 书籍/章节右键操作状态管理 Hook
// -------------------------------------------------------------
// 提供隐藏书籍、已读/删除章节的状态持久化（localStorage）
//
// 返回值：
//   hiddenBooks        - Set<string>  被隐藏的书籍路径
//   deletedChapterIds  - Set<string>  已被标记为已读的章节 ID（删除线）
//   hiddenChapterIds   - Set<string>  被删除的章节 ID
//   hideBook(path)     - 隐藏一本书
//   unhideBook(path)   - 取消隐藏一本书
//   deleteChapter(id)  - 标记章节为已读（删除线）
//   undeleteChapter(id) - 标记章节为未读
//   hideChapter(id)    - 删除章节
//   unhideChapter(id)  - 恢复章节
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

  // 挂载后从 localStorage 读取
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setHiddenBooks(loadSet(HIDDEN_BOOKS_KEY));
      setDeletedChapterIds(loadSet(DELETED_CHAPTERS_KEY));
      setHiddenChapterIds(loadSet(HIDDEN_CHAPTERS_KEY));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // 隐藏 / 取消隐藏书籍
  const hideBook = useCallback((path) => {
    setHiddenBooks((prev) => {
      const next = new Set(prev);
      next.add(path);
      saveSet(HIDDEN_BOOKS_KEY, next);
      return next;
    });
  }, []);

  const unhideBook = useCallback((path) => {
    setHiddenBooks((prev) => {
      const next = new Set(prev);
      next.delete(path);
      saveSet(HIDDEN_BOOKS_KEY, next);
      return next;
    });
  }, []);

  // 标记已读 / 标记未读章节
  const deleteChapter = useCallback((id) => {
    setDeletedChapterIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveSet(DELETED_CHAPTERS_KEY, next);
      return next;
    });
  }, []);

  const undeleteChapter = useCallback((id) => {
    setDeletedChapterIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      saveSet(DELETED_CHAPTERS_KEY, next);
      return next;
    });
  }, []);

  // 删除 / 恢复章节
  const hideChapter = useCallback((id) => {
    setHiddenChapterIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveSet(HIDDEN_CHAPTERS_KEY, next);
      return next;
    });
  }, []);

  const unhideChapter = useCallback((id) => {
    setHiddenChapterIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      saveSet(HIDDEN_CHAPTERS_KEY, next);
      return next;
    });
  }, []);

  // 批量删除 / 恢复章节（用于分组右键菜单）
  const hideChapters = useCallback((ids) => {
    setHiddenChapterIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      saveSet(HIDDEN_CHAPTERS_KEY, next);
      return next;
    });
  }, []);

  const unhideChapters = useCallback((ids) => {
    setHiddenChapterIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      saveSet(HIDDEN_CHAPTERS_KEY, next);
      return next;
    });
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
  };
}