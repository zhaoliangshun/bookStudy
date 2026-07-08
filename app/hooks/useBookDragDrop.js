"use client";

// =============================================================
// 书籍拖拽排序 Hook
// -------------------------------------------------------------
// 管理书籍在各分类中的排序和跨分类移动，持久化到 localStorage。
//
// 数据结构：
//   bookOrder = { "Python 教程": ["/py", "/py4", ...], "Java 教程": [...], ... }
//
// 拖拽到"已隐藏"分类时，自动联动 hiddenBooks 状态。
// =============================================================

import { useState, useCallback, useEffect } from "react";

const ORDER_KEY = "sidebar:book-order";

// 从 BOOK_CATEGORIES 生成默认排序
export function getDefaultBookOrder(categories) {
  const order = {};
  categories.forEach((cat) => {
    order[cat.name] = cat.books.map((b) => b.path);
  });
  return order;
}

// 合并已保存排序与默认排序（处理新增书籍：追加到末尾）
export function mergeOrder(saved, defaults) {
  const merged = { ...defaults };
  for (const [cat, paths] of Object.entries(saved)) {
    if (!merged[cat]) {
      merged[cat] = paths;
      continue;
    }
    const savedSet = new Set(paths);
    const defaultPaths = merged[cat];
    // 保留已保存的排序，新增的书籍追加到末尾
    const kept = paths.filter((p) => defaultPaths.includes(p));
    const added = defaultPaths.filter((p) => !savedSet.has(p));
    merged[cat] = [...kept, ...added];
  }
  return merged;
}

export default function useBookDragDrop(categories) {
  const [bookOrder, setBookOrder] = useState(() =>
    getDefaultBookOrder(categories)
  );

  // 挂载后从 localStorage 恢复
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ORDER_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const defaults = getDefaultBookOrder(categories);
        setBookOrder(mergeOrder(saved, defaults));
      }
    } catch {}
  }, [categories]);

  // 持久化
  const persist = useCallback((order) => {
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    } catch {}
  }, []);

  // 同分类内重新排序
  const reorderInCategory = useCallback(
    (category, fromIndex, toIndex) => {
      setBookOrder((prev) => {
        const items = [...(prev[category] || [])];
        if (fromIndex < 0 || fromIndex >= items.length) return prev;
        if (toIndex < 0 || toIndex > items.length) return prev;
        const [moved] = items.splice(fromIndex, 1);
        items.splice(toIndex > fromIndex ? toIndex - 1 : toIndex, 0, moved);
        const next = { ...prev, [category]: items };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  // 跨分类移动
  const moveToCategory = useCallback(
    (fromCategory, fromIndex, toCategory, toIndex) => {
      setBookOrder((prev) => {
        const fromItems = [...(prev[fromCategory] || [])];
        if (fromIndex < 0 || fromIndex >= fromItems.length) return prev;
        const [moved] = fromItems.splice(fromIndex, 1);
        const toItems = [...(prev[toCategory] || [])];
        const insertAt = Math.min(toIndex, toItems.length);
        toItems.splice(insertAt, 0, moved);
        const next = {
          ...prev,
          [fromCategory]: fromItems,
          [toCategory]: toItems,
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  // 获取某分类下排序后的书籍路径列表
  const getOrderedPaths = useCallback(
    (categoryName) => bookOrder[categoryName] || [],
    [bookOrder]
  );

  return { bookOrder, reorderInCategory, moveToCategory, getOrderedPaths };
}