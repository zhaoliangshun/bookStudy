"use client";

// =============================================================
// 书籍分类管理 Hook
// -------------------------------------------------------------
// 管理用户对书籍分类的自定义操作：新建分组、重命名分组、删除/隐藏分组、
// 子分组（subGroup）的新建/重命名/删除/排序。
// 持久化策略：仅写入服务端 JSON 文件（data/user-preferences.json）。
//   不再使用 localStorage，所有操作的最终归宿是服务端文件，
//   以用户最后一次操作为准。
// =============================================================

import { useState, useCallback, useEffect, useRef } from "react";

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
  // 初始用默认值，服务端数据由下方 fetch effect 加载
  const [config, setConfig] = useState(() => {
    if (initiallyHidden.length > 0) {
      return { ...defaultConfig, hidden: [...initiallyHidden] };
    }
    return { ...defaultConfig };
  });
  // 标记服务端数据是否已加载完成。
  // Sidebar 的「bookOrder 清理 effect」依赖 catConfig.custom 判断自定义分类是否有效，
  // 如果在 catConfig 加载前执行清理，会把文件中的自定义分类 key 当成「无效分类」删掉。
  const [loaded, setLoaded] = useState(false);
  // 追踪本地是否已修改 config
  //   1. 防止 fetch 完成时用服务端数据覆盖用户在加载期间的修改
  //   2. 作为保存 effect 的 gate：用户从未修改过时不发 POST
  const localModifiedRef = useRef(false);

  // 挂载时从服务端文件加载配置（文件是唯一真相源）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/preferences");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (cancelled) return;
        if (data.categoryConfig && !localModifiedRef.current) {
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

  // 任何变更都同步到服务端文件（防抖 400ms，避免连续操作发太多请求）
  // 关键：gate 用 localModifiedRef 而非 loaded。否则用户在 fetch 完成前
  // 的修改会因 loaded===false 被跳过保存，刷新后丢失。
  useEffect(() => {
    if (!localModifiedRef.current) return;
    const timer = setTimeout(() => {
      fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryConfig: config }),
      }).catch(() => {});
    }, 400);
    return () => clearTimeout(timer);
  }, [config]);

  const addCategory = useCallback((name, icon = "📁") => {
    localModifiedRef.current = true;
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
    localModifiedRef.current = true;
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
    localModifiedRef.current = true;
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
    localModifiedRef.current = true;
    setConfig((prev) => ({ ...prev, order: newOrder }));
  }, []);

  // ===== 子分组管理 =====

  const getSubGroups = useCallback((parentName) => {
    return config.subGroups[parentName] || [];
  }, [config.subGroups]);

  const addSubGroup = useCallback((parentName, name) => {
    localModifiedRef.current = true;
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
    localModifiedRef.current = true;
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
    localModifiedRef.current = true;
    setConfig((prev) => {
      const next = { ...prev, subGroups: { ...prev.subGroups }, subGroupOrder: { ...prev.subGroupOrder } };
      const list = next.subGroups[parentName];
      if (!list) return prev;
      next.subGroups[parentName] = list.filter((sg) => sg.id !== sgId);
      return next;
    });
  }, []);

  const reorderSubGroups = useCallback((parentName, newOrder) => {
    localModifiedRef.current = true;
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
    localModifiedRef.current = true;
    const defaults = { ...defaultConfig, hidden: [...initiallyHidden] };
    setConfig(defaults);
    fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryConfig: defaults }),
    }).catch(() => {});
  }, [initiallyHidden]);

  const resetToConfig = useCallback((newConfig) => {
    localModifiedRef.current = true;
    const next = { ...defaultConfig, ...newConfig };
    if (!next.subGroups) next.subGroups = {};
    if (!next.subGroupOrder) next.subGroupOrder = {};
    setConfig(next);
    fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryConfig: next }),
    }).catch(() => {});
  }, []);

  return {
    config,
    loaded,
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
