"use client";

// =============================================================
// 书籍分类管理 Hook
// -------------------------------------------------------------
// 管理用户对书籍分类的自定义操作：新建分组、重命名分组、删除/隐藏分组、
// 子分组（subGroup）的新建/重命名/删除/排序。
// 持久化策略：localStorage（即时）+ 服务端 JSON 文件（防抖同步，跨设备）
// =============================================================

import { useState, useCallback, useEffect } from "react";

const KEY = "sidebar:category-config";

const SUBGROUP_SEP = "::__";

const defaultConfig = {
  custom: [],
  renamed: {},
  icons: {},
  hidden: [],
  order: null,
  subGroups: {},
  subGroupOrder: {},
};

function loadLocal() {
  if (typeof window === "undefined") return { ...defaultConfig };
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

function subGroupId() {
  return "sg-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function makeSubGroupKey(parentName, sgId) {
  return parentName + SUBGROUP_SEP + sgId;
}

function parseSubGroupKey(key) {
  const idx = key.indexOf(SUBGROUP_SEP);
  if (idx === -1) return null;
  return { parent: key.slice(0, idx), sgId: key.slice(idx + SUBGROUP_SEP.length) };
}

export { SUBGROUP_SEP, makeSubGroupKey, parseSubGroupKey };

export default function useBookCategories(initiallyHidden = []) {
  const [config, setConfig] = useState(() => {
    const loaded = loadLocal();
    if (loaded.hidden.length === 0 && initiallyHidden.length > 0) {
      return { ...loaded, hidden: [...initiallyHidden] };
    }
    return loaded;
  });
  const [loaded, setLoaded] = useState(false);

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
          if (!merged.subGroups) merged.subGroups = {};
          if (!merged.subGroupOrder) merged.subGroupOrder = {};
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

  const renameCategory = useCallback((oldName, newName, newIcon) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        custom: [...prev.custom],
        renamed: { ...prev.renamed },
        icons: { ...prev.icons },
        subGroups: { ...prev.subGroups },
        subGroupOrder: { ...prev.subGroupOrder },
      };
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
      if (next.subGroups[oldName]) {
        next.subGroups[newName] = next.subGroups[oldName];
        delete next.subGroups[oldName];
      }
      if (next.subGroupOrder[oldName]) {
        next.subGroupOrder[newName] = next.subGroupOrder[oldName];
        delete next.subGroupOrder[oldName];
      }
      return next;
    });
  }, []);

  const deleteCategory = useCallback((name) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        custom: [...prev.custom],
        hidden: [...prev.hidden],
        subGroups: { ...prev.subGroups },
        subGroupOrder: { ...prev.subGroupOrder },
      };
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
      delete next.subGroups[name];
      delete next.subGroupOrder[name];
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

  // ===== 子分组管理 =====

  const getSubGroups = useCallback((parentName) => {
    return config.subGroups[parentName] || [];
  }, [config.subGroups]);

  const addSubGroup = useCallback((parentName, name) => {
    const id = subGroupId();
    setConfig((prev) => {
      const next = { ...prev, subGroups: { ...prev.subGroups }, subGroupOrder: { ...prev.subGroupOrder } };
      const existing = next.subGroups[parentName] || [];
      next.subGroups[parentName] = [...existing, { id, name }];
      return next;
    });
    return id;
  }, []);

  const renameSubGroup = useCallback((parentName, sgId, newName) => {
    setConfig((prev) => {
      const next = { ...prev, subGroups: { ...prev.subGroups } };
      const list = next.subGroups[parentName];
      if (!list) return prev;
      const idx = list.findIndex((sg) => sg.id === sgId);
      if (idx === -1) return prev;
      next.subGroups[parentName] = [
        ...list.slice(0, idx),
        { ...list[idx], name: newName },
        ...list.slice(idx + 1),
      ];
      return next;
    });
  }, []);

  const deleteSubGroup = useCallback((parentName, sgId) => {
    setConfig((prev) => {
      const next = { ...prev, subGroups: { ...prev.subGroups }, subGroupOrder: { ...prev.subGroupOrder } };
      const list = next.subGroups[parentName];
      if (!list) return prev;
      next.subGroups[parentName] = list.filter((sg) => sg.id !== sgId);
      return next;
    });
  }, []);

  const reorderSubGroups = useCallback((parentName, newOrder) => {
    setConfig((prev) => ({
      ...prev,
      subGroupOrder: { ...prev.subGroupOrder, [parentName]: newOrder },
    }));
  }, []);

  const getOrderedSubGroups = useCallback((parentName) => {
    const list = config.subGroups[parentName] || [];
    const order = config.subGroupOrder[parentName];
    if (!order || order.length === 0) return list;
    const map = new Map();
    list.forEach((sg) => map.set(sg.id, sg));
    const result = [];
    order.forEach((id) => {
      const sg = map.get(id);
      if (sg) {
        result.push(sg);
        map.delete(id);
      }
    });
    map.forEach((sg) => result.push(sg));
    return result;
  }, [config.subGroups, config.subGroupOrder]);

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

  const resetToConfig = useCallback((newConfig) => {
    const next = { ...defaultConfig, ...newConfig };
    if (!next.subGroups) next.subGroups = {};
    if (!next.subGroupOrder) next.subGroupOrder = {};
    setConfig(next);
    saveLocal(next);
    fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryConfig: next }),
    }).catch(() => {});
  }, []);

  return {
    config,
    addCategory,
    renameCategory,
    deleteCategory,
    isCustom,
    ensureOrderInitialized,
    reorderCategories,
    resetToDefaults,
    resetToConfig,
    getSubGroups,
    addSubGroup,
    renameSubGroup,
    deleteSubGroup,
    reorderSubGroups,
    getOrderedSubGroups,
  };
}
