"use client";

import { EditorThemeProvider } from "./EditorThemeProvider";
import ScrollRestoration from "./ScrollRestoration";
import QuickScroll from "./QuickScroll";
import ReadingThemeSwitcher from "./ReadingThemeSwitcher";
import FloatingChapterNav from "./FloatingChapterNav";

export default function Providers({ children }) {
  return (
    <EditorThemeProvider>
      <ScrollRestoration />
      <div className="floating-panel-group">
        <QuickScroll />
        <ReadingThemeSwitcher />
        <FloatingChapterNav />
      </div>
      {children}
    </EditorThemeProvider>
  );
}
