"use client";

// =============================================================
// 书籍分类管理 Hook
// -------------------------------------------------------------
// 管理用户对书籍分类的自定义操作：新建分组、重命名分组、删除/隐藏分组。
// 持久化到 localStorage + 服务端。
//
// 数据模型（存储在 preferences 的 categoryConfig 字段）：
//   {
//     custom: [{ id, name, icon }],     // 用户新建的分组
//     renamed: { [origName]: newName }, // 默认分组的重命名映射
//     icons: { [name]: icon },          // 图标覆盖
//     hidden: [origName],               // 被隐藏的默认分组名（原始名）
//     order: [name, ...],               // 分组显示顺序（显示名）
//   }
// =============================================================

import { useState, useCallback, useEffect } from "react";

const KEY = "sidebar:category-config";

const defaultConfig = {
  custom: [],
  renamed: {},
  icons: {},
  hidden: [],
  order: null,
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaultConfig, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultConfig };
}

function save(config) {
  try { localStorage.setItem(KEY, JSON.stringify(config)); } catch {}
  fetch("/api/preferences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categoryConfig: config }),
  }).catch(() => {});
}

function uid() {
  return "c-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function useBookCategories(initiallyHidden = []) {
  const [config, setConfig] = useState(() => {
    const loaded = load();
    if (loaded.hidden.length === 0 && initiallyHidden.length > 0) {
      return { ...loaded, hidden: [...initiallyHidden] };
    }
    return loaded;
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/preferences")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        if (!cancelled && data.categoryConfig) {
          const merged = { ...defaultConfig, ...data.categoryConfig };
          if (merged.hidden.length === 0 && initiallyHidden.length > 0) {
            merged.hidden = [...initiallyHidden];
          }
          setConfig(merged);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [initiallyHidden]);

  const update = useCallback((updater) => {
    setConfig((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      save(next);
      return next;
    });
  }, []);

  // 新建分组
  const addCategory = useCallback((name, icon = "📁") => {
    const id = uid();
    update((prev) => {
      const newCustom = [...prev.custom, { id, name, icon }];
      const next = { ...prev, custom: newCustom };
      if (next.order) {
        next.order = [...next.order, name];
      }
      return next;
    });
    return id;
  }, [update]);

  // 重命名分组（同时可选改图标）
  const renameCategory = useCallback((oldName, newName, newIcon) => {
    update((prev) => {
      const next = { ...prev, custom: [...prev.custom], renamed: { ...prev.renamed }, icons: { ...prev.icons } };

      const customIdx = next.custom.findIndex((c) => c.name === oldName);
      if (customIdx !== -1) {
        next.custom[customIdx] = { ...next.custom[customIdx], name: newName };
        if (newIcon) next.custom[customIdx].icon = newIcon;
      } else {
        // 默认分组：找原始名
        let origName = oldName;
        for (const [orig, renamed] of Object.entries(next.renamed)) {
          if (renamed === oldName) { origName = orig; break; }
        }
        next.renamed[origName] = newName;
        if (newIcon) next.icons[newName] = newIcon;
        // 迁移 icons key
        if (next.icons[oldName]) {
          next.icons[newName] = newIcon || next.icons[oldName];
          delete next.icons[oldName];
        }
      }

      // 更新 order
      if (next.order) {
        next.order = next.order.map((n) => (n === oldName ? newName : n));
      }
      return next;
    });
  }, [update]);

  // 删除/隐藏分组
  // 自定义分组：彻底删除；默认分组：隐藏
  const deleteCategory = useCallback((name) => {
    update((prev) => {
      const next = { ...prev, custom: [...prev.custom], hidden: [...prev.hidden] };
      const isCustom = prev.custom.some((c) => c.name === name);
      if (isCustom) {
        next.custom = next.custom.filter((c) => c.name !== name);
      } else {
        // 找原始名
        let origName = name;
        for (const [orig, renamed] of Object.entries(prev.renamed)) {
          if (renamed === name) { origName = orig; break; }
        }
        if (!next.hidden.includes(origName)) next.hidden.push(origName);
      }
      if (next.order) {
        next.order = next.order.filter((n) => n !== name);
      }
      return next;
    });
  }, [update]);

  const isCustom = useCallback((name) => config.custom.some((c) => c.name === name), [config.custom]);

  // 确保 order 字段已初始化（按当前可见顺序生成）
  // getVisibleNames: () => string[]  由调用方提供当前可见分类名列表（不含"已隐藏"）
  const ensureOrderInitialized = useCallback((getVisibleNames) => {
    setConfig((prev) => {
      if (prev.order && prev.order.length > 0) return prev;
      const names = getVisibleNames();
      const next = { ...prev, order: names };
      save(next);
      return next;
    });
  }, []);

  // 重新排序分类（拖拽后调用）
  // newOrder: 完整的新顺序数组（已确保"已隐藏"在最后）
  const reorderCategories = useCallback((newOrder) => {
    update((prev) => ({ ...prev, order: newOrder }));
  }, [update]);

  // 重置为默认配置
  const resetToDefaults = useCallback(() => {
    const defaults = { ...defaultConfig, hidden: [...initiallyHidden] };
    setConfig(defaults);
    save(defaults);
  }, [initiallyHidden]);

  // 重置为指定配置（用于恢复用户保存的默认设置）
  const resetToConfig = useCallback((config) => {
    const next = { ...defaultConfig, ...config };
    setConfig(next);
    save(next);
  }, []);

  return { config, addCategory, renameCategory, deleteCategory, isCustom, ensureOrderInitialized, reorderCategories, resetToDefaults, resetToConfig };
}
