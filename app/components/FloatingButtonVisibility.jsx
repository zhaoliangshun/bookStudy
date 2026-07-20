"use client";

// =============================================================
// 文件：app/components/FloatingButtonVisibility.jsx
// -------------------------------------------------------------
// 【一句话职责】
//   管理「右侧一排浮动按钮」的显示/隐藏状态，并暴露给：
//     - 各浮动按钮组件（FloatingEditorTheme / ReadingThemeSwitcher /
//       FloatingChapterNav / QuickScroll）：读取自己的可见性
//     - FloatingButtonSettings（齿轮设置按钮）：读写所有按钮的可见性
//
// 【为什么用 Context 而不是 props】
//   右侧浮动按钮分散在 Providers.jsx 的 <div className="floating-panel-group">
//   里，各自独立渲染、独立 hook，互相之间没有父子关系。用 Context 让
//   每个组件都能直接拿到可见性，不用层层透传 props。
//
// 【持久化】
//   设置保存在 localStorage，key = "floating-buttons-visibility"，
//   值是一个 JSON 对象：{ editorTheme, readingTheme, chapterNav, quickScroll }。
//   每个 value 是 true / false。默认全部为 true（显示）。
//
// 【SSR 注意】
//   服务端没有 localStorage，初始 state 必须是「全部显示」，
//   避免服务端渲染为隐藏、客户端 hydration 时变成显示，造成
//   hydration mismatch 警告。实际用户设置在 useEffect 里读取后
//   再覆盖。
// =============================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// localStorage key
export const FLOATING_BUTTONS_STORAGE_KEY = "floating-buttons-visibility";

// 受管理的浮动按钮 id 列表（与设置面板里显示的开关一一对应）
// 顺序即设置面板里从上到下的展示顺序
export const FLOATING_BUTTON_IDS = [
  "bookmark",
  "editorTheme",
  "readingTheme",
  "chapterNav",
  "quickScroll",
];

// 默认全部显示
const DEFAULT_VISIBILITY = {
  bookmark: true,
  editorTheme: true,
  readingTheme: true,
  chapterNav: true,
  quickScroll: true,
};

// Context 类型：{ visibility, setVisibility, toggle }
const FloatingButtonVisibilityContext = createContext(null);

// 安全读取 localStorage：解析失败时回退到默认值
function readStoredVisibility() {
  try {
    const raw = localStorage.getItem(FLOATING_BUTTONS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      // 合并默认值，避免新增的按钮 id 没有对应字段
      return { ...DEFAULT_VISIBILITY, ...parsed };
    }
  } catch {}
  return null;
}

// 安全写入 localStorage
function writeStoredVisibility(visibility) {
  try {
    localStorage.setItem(
      FLOATING_BUTTONS_STORAGE_KEY,
      JSON.stringify(visibility)
    );
  } catch {}
}

export function FloatingButtonVisibilityProvider({ children }) {
  // 初始为默认值（全部显示），保证 SSR 与首屏 hydration 一致
  const [visibility, setVisibilityState] = useState(DEFAULT_VISIBILITY);

  // 客户端挂载后：从 localStorage 读取用户保存的设置
  useEffect(() => {
    const stored = readStoredVisibility();
    if (stored) {
      setVisibilityState(stored);
    }
  }, []);

  // 更新某个按钮的可见性，并同步持久化
  const setVisibility = useCallback((id, visible) => {
    setVisibilityState((prev) => {
      const next = { ...prev, [id]: !!visible };
      writeStoredVisibility(next);
      return next;
    });
  }, []);

  // 切换某个按钮的可见性（true <-> false）
  const toggle = useCallback((id) => {
    setVisibilityState((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      writeStoredVisibility(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ visibility, setVisibility, toggle }),
    [visibility, setVisibility, toggle]
  );

  return (
    <FloatingButtonVisibilityContext.Provider value={value}>
      {children}
    </FloatingButtonVisibilityContext.Provider>
  );
}

// Hook：供浮动按钮和设置面板使用
export function useFloatingButtonVisibility() {
  const ctx = useContext(FloatingButtonVisibilityContext);
  if (!ctx) {
    throw new Error(
      "useFloatingButtonVisibility must be used within FloatingButtonVisibilityProvider"
    );
  }
  return ctx;
}
