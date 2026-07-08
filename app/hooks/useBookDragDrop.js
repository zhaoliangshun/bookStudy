"use client";

// =============================================================
// 书籍拖拽排序 Hook
// -------------------------------------------------------------
// 管理书籍在各分类中的排序和跨分类移动。
// 持久化策略：localStorage（即时响应）+ 服务端 JSON 文件（跨设备同步）
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
      // 分类在默认中不存在（自定义分类或已重命名），保留其数据
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

// 将 bookOrder 同步到服务端
async function syncToServer(bookOrder) {
  try {
    await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookOrder }),
    });
  } catch {
    // 网络错误静默忽略，localStorage 已有本地备份
  }
}

export default function useBookDragDrop(categories) {
  const [bookOrder, setBookOrder] = useState(() => getDefaultBookOrder(categories));

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
          return;
        }
      } catch {
        // 服务端不可用，降级到 localStorage
      }
      try {
        const raw = localStorage.getItem(ORDER_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          const defaults = getDefaultBookOrder(categories);
          setBookOrder(mergeOrder(saved, defaults));
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [categories]);

  // 持久化：localStorage + 服务端
  const persist = useCallback((order) => {
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    } catch {}
    syncToServer(order);
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

  // 重命名分类：更新 bookOrder 中的 key
  const renameCategoryInOrder = useCallback(
    (oldName, newName) => {
      setBookOrder((prev) => {
        if (oldName === newName) return prev;
        if (!prev[oldName] && !prev[newName]) return prev;
        const next = { ...prev };
        if (prev[oldName]) {
          next[newName] = prev[oldName];
          delete next[oldName];
        }
        persist(next);
        return next;
      });
    },
    [persist]
  );

  // 删除分类：从 bookOrder 中移除该分类
  const removeCategoryFromOrder = useCallback(
    (categoryName) => {
      setBookOrder((prev) => {
        if (!prev[categoryName]) return prev;
        const next = { ...prev };
        delete next[categoryName];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  // 确保分类存在于 bookOrder 中（新建空分类）
  const ensureCategory = useCallback(
    (categoryName) => {
      setBookOrder((prev) => {
        if (prev[categoryName]) return prev;
        const next = { ...prev, [categoryName]: [] };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  // 批量移动书籍到指定分类（用于删除分组时归还书籍到默认分组）
  // moves: [{ path, toCategory }]
  const moveBooksToCategory = useCallback(
    (moves) => {
      setBookOrder((prev) => {
        const next = { ...prev };
        // 先从所有分类中移除这些书籍
        const pathSet = new Set(moves.map((m) => m.path));
        for (const cat of Object.keys(next)) {
          next[cat] = next[cat].filter((p) => !pathSet.has(p));
        }
        // 再添加到目标分类
        for (const { path, toCategory } of moves) {
          if (!next[toCategory]) next[toCategory] = [];
          next[toCategory] = [...next[toCategory], path];
        }
        persist(next);
        return next;
      });
    },
    [persist]
  );

  // 重置为默认排序（清空所有自定义排序）
  const resetToDefaults = useCallback(
    (categories) => {
      const defaults = getDefaultBookOrder(categories);
      setBookOrder(defaults);
      persist(defaults);
    },
    [persist]
  );

  // 重置为指定的排序（用于恢复用户保存的默认设置）
  const resetToOrder = useCallback(
    (order) => {
      setBookOrder(order);
      persist(order);
    },
    [persist]
  );

  // 获取某分类下排序后的书籍路径列表
  const getOrderedPaths = useCallback(
    (categoryName) => bookOrder[categoryName] || [],
    [bookOrder]
  );

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
