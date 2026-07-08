"use client";

// =============================================================
// 书籍分类管理 Hook
// -------------------------------------------------------------
// 管理用户对书籍分类的自定义操作：新建分组、重命名分组、删除/隐藏分组。
// 持久化策略：localStorage（即时）+ 服务端 JSON 文件（防抖同步，跨设备）
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

function loadLocal() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaultConfig, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultConfig };
}

function saveLocal(config) {
  try { localStorage.setItem(KEY, JSON.stringify(config)); } catch {}
}

function uid() {
  return "c-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function useBookCategories(initiallyHidden = []) {
  const [config, setConfig] = useState(() => {
    const loaded = loadLocal();
    if (loaded.hidden.length === 0 && initiallyHidden.length > 0) {
      return { ...loaded, hidden: [...initiallyHidden] };
    }
    return loaded;
  });
  const [loaded, setLoaded] = useState(false);

  // 挂载后：优先从服务端加载
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/preferences");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (cancelled) return;
        if (data.categoryConfig) {
          const merged = { ...defaultConfig, ...data.categoryConfig };
          if (merged.hidden.length === 0 && initiallyHidden.length > 0) {
            merged.hidden = [...initiallyHidden];
          }
          setConfig(merged);
        }
        setLoaded(true);
      } catch {
        if (cancelled) return;
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [initiallyHidden]);

  // 统一同步：localStorage 即时保存，服务端防抖 400ms
  useEffect(() => {
    if (!loaded) return;
    saveLocal(config);
    const timer = setTimeout(() => {
      fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryConfig: config }),
      }).catch(() => {});
    }, 400);
    return () => clearTimeout(timer);
  }, [config, loaded]);

  // 新建分组
  const addCategory = useCallback((name, icon = "📁") => {
    const id = uid();
    setConfig((prev) => {
      const newCustom = [...prev.custom, { id, name, icon }];
      const next = { ...prev, custom: newCustom };
      if (next.order) next.order = [...next.order, name];
      return next;
    });
    return id;
  }, []);

  // 重命名分组
  const renameCategory = useCallback((oldName, newName, newIcon) => {
    setConfig((prev) => {
      const next = { ...prev, custom: [...prev.custom], renamed: { ...prev.renamed }, icons: { ...prev.icons } };
      const customIdx = next.custom.findIndex((c) => c.name === oldName);
      if (customIdx !== -1) {
        next.custom[customIdx] = { ...next.custom[customIdx], name: newName };
        if (newIcon) next.custom[customIdx].icon = newIcon;
      } else {
        let origName = oldName;
        for (const [orig, renamed] of Object.entries(next.renamed)) {
          if (renamed === oldName) { origName = orig; break; }
        }
        next.renamed[origName] = newName;
        if (newIcon) next.icons[newName] = newIcon;
        if (next.icons[oldName]) {
          next.icons[newName] = newIcon || next.icons[oldName];
          delete next.icons[oldName];
        }
      }
      if (next.order) next.order = next.order.map((n) => (n === oldName ? newName : n));
      return next;
    });
  }, []);

  // 删除/隐藏分组
  const deleteCategory = useCallback((name) => {
    setConfig((prev) => {
      const next = { ...prev, custom: [...prev.custom], hidden: [...prev.hidden] };
      const isCustom = prev.custom.some((c) => c.name === name);
      if (isCustom) {
        next.custom = next.custom.filter((c) => c.name !== name);
      } else {
        let origName = name;
        for (const [orig, renamed] of Object.entries(prev.renamed)) {
          if (renamed === name) { origName = orig; break; }
        }
        if (!next.hidden.includes(origName)) next.hidden.push(origName);
      }
      if (next.order) next.order = next.order.filter((n) => n !== name);
      return next;
    });
  }, []);

  const isCustom = useCallback((name) => config.custom.some((c) => c.name === name), [config.custom]);

  const ensureOrderInitialized = useCallback((getVisibleNames) => {
    setConfig((prev) => {
      if (prev.order && prev.order.length > 0) return prev;
      return { ...prev, order: getVisibleNames() };
    });
  }, []);

  const reorderCategories = useCallback((newOrder) => {
    setConfig((prev) => ({ ...prev, order: newOrder }));
  }, []);

  // 重置为默认配置
  const resetToDefaults = useCallback(() => {
    const defaults = { ...defaultConfig, hidden: [...initiallyHidden] };
    setConfig(defaults);
    saveLocal(defaults);
    fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryConfig: defaults }),
    }).catch(() => {});
  }, [initiallyHidden]);

  // 重置为指定配置
  const resetToConfig = useCallback((newConfig) => {
    const next = { ...defaultConfig, ...newConfig };
    setConfig(next);
    saveLocal(next);
    fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryConfig: next }),
    }).catch(() => {});
  }, []);

  return { config, addCategory, renameCategory, deleteCategory, isCustom, ensureOrderInitialized, reorderCategories, resetToDefaults, resetToConfig };
}
