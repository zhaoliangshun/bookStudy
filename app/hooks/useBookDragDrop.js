"use client";

// =============================================================
// 书籍拖拽排序 Hook
// -------------------------------------------------------------
// 管理书籍在各分类（包括子分组）中的排序和跨分类移动。
// 子分组 key 格式："父分类名::__子分组ID"
// 持久化策略：localStorage（即时响应）+ 服务端 JSON 文件（跨设备同步）
// =============================================================

import { useState, useCallback, useEffect, useRef } from "react";
import { SUBGROUP_SEP, parseSubGroupKey } from "./useBookCategories";

const ORDER_KEY = "sidebar:book-order";

export function getDefaultBookOrder(categories) {
  const order = {};
  categories.forEach((cat) => {
    order[cat.name] = cat.books.map((b) => b.path);
  });
  return order;
}

export function mergeOrder(saved, defaults) {
  const allValidPaths = new Set();
  const pathToDefaultCat = {};
  for (const [cat, paths] of Object.entries(defaults)) {
    for (const p of paths) {
      allValidPaths.add(p);
      if (!pathToDefaultCat[p]) {
        pathToDefaultCat[p] = cat;
      }
    }
  }

  const savedAssigned = new Set();
  for (const paths of Object.values(saved)) {
    for (const p of paths) {
      if (allValidPaths.has(p)) {
        savedAssigned.add(p);
      }
    }
  }

  const merged = {};
  for (const [cat, paths] of Object.entries(saved)) {
    merged[cat] = paths.filter((p) => allValidPaths.has(p));
  }

  for (const [cat, paths] of Object.entries(defaults)) {
    for (const p of paths) {
      if (!savedAssigned.has(p)) {
        if (!merged[cat]) merged[cat] = [];
        if (!merged[cat].includes(p)) {
          merged[cat].push(p);
        }
      }
    }
  }

  for (const cat of Object.keys(defaults)) {
    if (!merged[cat]) merged[cat] = [];
  }

  return merged;
}

// 同步从 localStorage 加载 bookOrder（用于 useState 初始化，避免首次渲染缺少子分组 key）
function loadLocalOrder(categories) {
  if (typeof window === "undefined") return getDefaultBookOrder(categories);
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      const defaults = getDefaultBookOrder(categories);
      return mergeOrder(saved, defaults);
    }
  } catch {}
  return getDefaultBookOrder(categories);
}

export default function useBookDragDrop(categories) {
  const [bookOrder, setBookOrder] = useState(() => loadLocalOrder(categories));
  const [loaded, setLoaded] = useState(false);
  // 追踪本地是否已修改 bookOrder（防止服务端同步覆盖用户在加载期间的拖拽操作）
  const localModifiedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/preferences");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (cancelled) return;
        if (!localModifiedRef.current) {
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
        }
        setLoaded(true);
      } catch {
        if (cancelled) return;
        if (!localModifiedRef.current) {
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
      }
    })();
    return () => { cancelled = true; };
  }, [categories]);

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

  const reorderInCategory = useCallback((category, fromIndex, toIndex) => {
    localModifiedRef.current = true;
    setBookOrder((prev) => {
      const items = [...(prev[category] || [])];
      if (fromIndex < 0 || fromIndex >= items.length) return prev;
      if (toIndex < 0 || toIndex > items.length) return prev;
      const [moved] = items.splice(fromIndex, 1);
      items.splice(toIndex > fromIndex ? toIndex - 1 : toIndex, 0, moved);
      return { ...prev, [category]: items };
    });
  }, []);

  const moveToCategory = useCallback((fromCategory, fromIndex, toCategory, toIndex) => {
    localModifiedRef.current = true;
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

  const renameCategoryInOrder = useCallback((oldName, newName) => {
    localModifiedRef.current = true;
    setBookOrder((prev) => {
      if (oldName === newName) return prev;
      const next = { ...prev };
      const oldPrefix = oldName + SUBGROUP_SEP;
      const newPrefix = newName + SUBGROUP_SEP;
      for (const key of Object.keys(next)) {
        if (key === oldName) {
          next[newName] = next[key];
          delete next[key];
        } else if (key.startsWith(oldPrefix)) {
          const newKey = newPrefix + key.slice(oldPrefix.length);
          next[newKey] = next[key];
          delete next[key];
        }
      }
      if (!next[newName]) next[newName] = [];
      return next;
    });
  }, []);

  const removeCategoryFromOrder = useCallback((categoryName) => {
    localModifiedRef.current = true;
    setBookOrder((prev) => {
      const next = { ...prev };
      const prefix = categoryName + SUBGROUP_SEP;
      for (const key of Object.keys(next)) {
        if (key === categoryName || key.startsWith(prefix)) {
          delete next[key];
        }
      }
      return next;
    });
  }, []);

  const ensureCategory = useCallback((categoryName) => {
    localModifiedRef.current = true;
    setBookOrder((prev) => prev[categoryName] ? prev : { ...prev, [categoryName]: [] });
  }, []);

  const moveBooksToCategory = useCallback((moves) => {
    localModifiedRef.current = true;
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

  const mergeSubGroupIntoParent = useCallback((subGroupKey) => {
    localModifiedRef.current = true;
    setBookOrder((prev) => {
      const parsed = parseSubGroupKey(subGroupKey);
      if (!parsed) return prev;
      const { parent } = parsed;
      const sgBooks = prev[subGroupKey];
      if (!sgBooks || sgBooks.length === 0) {
        const next = { ...prev };
        delete next[subGroupKey];
        return next;
      }
      const next = { ...prev };
      const parentBooks = [...(next[parent] || [])];
      next[parent] = [...parentBooks, ...sgBooks];
      delete next[subGroupKey];
      return next;
    });
  }, []);

  const updateOrder = useCallback((updater) => {
    localModifiedRef.current = true;
    setBookOrder((prev) => updater(prev) || prev);
  }, []);

  const resetToDefaults = useCallback((categories) => {
    localModifiedRef.current = true;
    const defaults = getDefaultBookOrder(categories);
    setBookOrder(defaults);
    persistLocal(defaults);
    fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookOrder: defaults }),
    }).catch(() => {});
  }, [persistLocal]);

  const resetToOrder = useCallback((order) => {
    localModifiedRef.current = true;
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
    mergeSubGroupIntoParent,
    updateOrder,
    resetToDefaults,
    resetToOrder,
    getOrderedPaths,
  };
}
