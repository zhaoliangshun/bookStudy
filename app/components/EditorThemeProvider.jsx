"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_MONACO_THEME,
  MONACO_THEME_STORAGE_KEY,
  MONACO_THEMES,
  getMonacoTheme,
} from "./monaco-themes";

const EditorThemeContext = createContext(null);

export function EditorThemeProvider({ children }) {
  const [themeId, setThemeIdState] = useState(DEFAULT_MONACO_THEME);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MONACO_THEME_STORAGE_KEY);
      if (saved && MONACO_THEMES.some((t) => t.id === saved)) {
        setThemeIdState(saved);
      }
    } catch {}
    setReady(true);
  }, []);

  const setThemeId = useCallback((id) => {
    if (!MONACO_THEMES.some((t) => t.id === id)) return;
    setThemeIdState(id);
    try {
      localStorage.setItem(MONACO_THEME_STORAGE_KEY, id);
    } catch {}
  }, []);

  const value = useMemo(
    () => ({
      themeId,
      theme: getMonacoTheme(themeId),
      setThemeId,
      ready,
    }),
    [themeId, setThemeId, ready],
  );

  return (
    <EditorThemeContext.Provider value={value}>
      {children}
    </EditorThemeContext.Provider>
  );
}

export function useEditorTheme() {
  const ctx = useContext(EditorThemeContext);
  if (!ctx) {
    throw new Error("useEditorTheme must be used within EditorThemeProvider");
  }
  return ctx;
}
