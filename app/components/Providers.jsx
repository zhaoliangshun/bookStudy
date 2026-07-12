"use client";

import { EditorThemeProvider } from "./EditorThemeProvider";
import ScrollRestoration from "./ScrollRestoration";
import QuickScroll from "./QuickScroll";
import ReadingThemeSwitcher from "./ReadingThemeSwitcher";
import FloatingChapterNav from "./FloatingChapterNav";
import FloatingEditorTheme from "./FloatingEditorTheme";
import BookmarkManager from "./BookmarkManager";

export default function Providers({ children }) {
  return (
    <EditorThemeProvider>
      <ScrollRestoration />
      <BookmarkManager />
      <div className="floating-panel-group">
        <FloatingEditorTheme />
        <ReadingThemeSwitcher />
        <FloatingChapterNav />
        <QuickScroll />
      </div>
      {children}
    </EditorThemeProvider>
  );
}