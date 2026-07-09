"use client";

import { EditorThemeProvider } from "./EditorThemeProvider";
import ScrollRestoration from "./ScrollRestoration";
import QuickScroll from "./QuickScroll";
import FloatingChapterNav from "./FloatingChapterNav";
import FloatingThemeSwitcher from "./FloatingThemeSwitcher";

export default function Providers({ children }) {
  return (
    <EditorThemeProvider>
      <ScrollRestoration />
      <div className="floating-panel-group">
        <FloatingThemeSwitcher />
        <FloatingChapterNav />
        <QuickScroll />
      </div>
      {children}
    </EditorThemeProvider>
  );
}
