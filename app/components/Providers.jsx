"use client";

import { EditorThemeProvider } from "./EditorThemeProvider";
import ScrollRestoration from "./ScrollRestoration";
import QuickScroll from "./QuickScroll";
import ReadingThemeSwitcher from "./ReadingThemeSwitcher";

export default function Providers({ children }) {
  return (
    <EditorThemeProvider>
      <ScrollRestoration />
      <QuickScroll />
      <ReadingThemeSwitcher />
      {children}
    </EditorThemeProvider>
  );
}
