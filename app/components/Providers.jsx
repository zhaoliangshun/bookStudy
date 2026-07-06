"use client";

import { EditorThemeProvider } from "./EditorThemeProvider";
import ScrollRestoration from "./ScrollRestoration";
import QuickScroll from "./QuickScroll";

export default function Providers({ children }) {
  return (
    <EditorThemeProvider>
      <ScrollRestoration />
      <QuickScroll />
      {children}
    </EditorThemeProvider>
  );
}
