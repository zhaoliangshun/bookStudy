"use client";

// =============================================================
// 书籍拖拽排序 Hook
// -------------------------------------------------------------
// 管理书籍在各分类中的排序和跨分类移动。
// 持久化策略：localStorage（即时响应）+ 服务端 JSON 文件（跨设备同步）
// 服务端同步使用 useEffect + 防抖，避免拖拽过程中频繁请求。
// =============================================================

import { useState, useCallback, useEffect } from "react";

const ORDER_KEY = "sidebar:book-order";

// 从分类列表生成默认排序
export function getDefaultBookOrder(categories) {
  const order = {};
  categories.forEach((cat) => {
    order[cat.name] = cat.books.map((b) => b.path);
  });
  return order;
}

// 合并已保存排序与默认排序（处理新增书籍：追加到末尾；处理新增/重命名分类）
export function mergeOrder(saved, defaults) {
  const merged = { ...defaults };
  for (const [cat, paths] of Object.entries(saved)) {
    if (!merged[cat]) {
      merged[cat] = paths;
      continue;
    }
    const savedSet = new Set(paths);
    const defaultPaths = merged[cat];
    const kept = paths.filter((p) => defaultPaths.includes(p));
    const added = defaultPaths.filter((p) => !savedSet.has(p));
    merged[cat] = [...kept, ...added];
  }
  return merged;
}

export default function useBookDragDrop(categories) {
  const [bookOrder, setBookOrder] = useState(() => getDefaultBookOrder(categories));
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
        if (data.bookOrder && Object.keys(data.bookOrder).length > 0) {
          const defaults = getDefaultBookOrder(categories);
          setBookOrder(mergeOrder(data.bookOrder, defaults));
        } else {
          try {
            const raw = localStorage.getItem(ORDER_KEY);
            if (raw) {
              const saved = JSON.parse(raw);
              const defaults = getDefaultBookOrder(categories);
              setBookOrder(mergeOrder(saved, defaults));
            }
          } catch {}
        }
        setLoaded(true);
      } catch {
        if (cancelled) return;
        try {
          const raw = localStorage.getItem(ORDER_KEY);
          if (raw) {
            const saved = JSON.parse(raw);
            const defaults = getDefaultBookOrder(categories);
            setBookOrder(mergeOrder(saved, defaults));
          }
        } catch {}
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [categories]);

  // 统一同步到 localStorage（即时）+ 服务端（防抖 400ms）
  const persistLocal = useCallback((order) => {
    try { localStorage.setItem(ORDER_KEY, JSON.stringify(order)); } catch {}
  }, []);

  useEffect(() => {
    if (!loaded) return;
    persistLocal(bookOrder);
    const timer = setTimeout(() => {
      fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookOrder }),
      }).catch(() => {});
    }, 400);
    return () => clearTimeout(timer);
  }, [bookOrder, loaded, persistLocal]);

  // 同分类内重新排序
  const reorderInCategory = useCallback((category, fromIndex, toIndex) => {
    setBookOrder((prev) => {
      const items = [...(prev[category] || [])];
      if (fromIndex < 0 || fromIndex >= items.length) return prev;
      if (toIndex < 0 || toIndex > items.length) return prev;
      const [moved] = items.splice(fromIndex, 1);
      items.splice(toIndex > fromIndex ? toIndex - 1 : toIndex, 0, moved);
      return { ...prev, [category]: items };
    });
  }, []);

  // 跨分类移动
  const moveToCategory = useCallback((fromCategory, fromIndex, toCategory, toIndex) => {
    setBookOrder((prev) => {
      const fromItems = [...(prev[fromCategory] || [])];
      if (fromIndex < 0 || fromIndex >= fromItems.length) return prev;
      const [moved] = fromItems.splice(fromIndex, 1);
      const toItems = [...(prev[toCategory] || [])];
      const insertAt = Math.min(toIndex, toItems.length);
      toItems.splice(insertAt, 0, moved);
      return { ...prev, [fromCategory]: fromItems, [toCategory]: toItems };
    });
  }, []);

  // 重命名分类：更新 bookOrder 中的 key
  const renameCategoryInOrder = useCallback((oldName, newName) => {
    setBookOrder((prev) => {
      if (oldName === newName) return prev;
      if (!prev[oldName] && !prev[newName]) return prev;
      const next = { ...prev };
      if (prev[oldName]) {
        next[newName] = prev[oldName];
        delete next[oldName];
      }
      return next;
    });
  }, []);

  // 删除分类：从 bookOrder 中移除该分类
  const removeCategoryFromOrder = useCallback((categoryName) => {
    setBookOrder((prev) => {
      if (!prev[categoryName]) return prev;
      const next = { ...prev };
      delete next[categoryName];
      return next;
    });
  }, []);

  // 确保分类存在于 bookOrder 中（新建空分类）
  const ensureCategory = useCallback((categoryName) => {
    setBookOrder((prev) => prev[categoryName] ? prev : { ...prev, [categoryName]: [] });
  }, []);

  // 批量移动书籍到指定分类
  const moveBooksToCategory = useCallback((moves) => {
    setBookOrder((prev) => {
      const next = { ...prev };
      const pathSet = new Set(moves.map((m) => m.path));
      for (const cat of Object.keys(next)) {
        next[cat] = next[cat].filter((p) => !pathSet.has(p));
      }
      for (const { path, toCategory } of moves) {
        if (!next[toCategory]) next[toCategory] = [];
        next[toCategory] = [...next[toCategory], path];
      }
      return next;
    });
  }, []);

  // 重置为默认排序
  const resetToDefaults = useCallback((categories) => {
    const defaults = getDefaultBookOrder(categories);
    setBookOrder(defaults);
    persistLocal(defaults);
    fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookOrder: defaults }),
    }).catch(() => {});
  }, [persistLocal]);

  // 重置为指定排序
  const resetToOrder = useCallback((order) => {
    setBookOrder(order);
    persistLocal(order);
    fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookOrder: order }),
    }).catch(() => {});
  }, [persistLocal]);

  const getOrderedPaths = useCallback((categoryName) => bookOrder[categoryName] || [], [bookOrder]);

  return {
    bookOrder,
    reorderInCategory,
    moveToCategory,
    renameCategoryInOrder,
    removeCategoryFromOrder,
    ensureCategory,
    moveBooksToCategory,
    resetToDefaults,
    resetToOrder,
    getOrderedPaths,
  };
}
