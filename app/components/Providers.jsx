"use client";

import { EditorThemeProvider } from "./EditorThemeProvider";
import ScrollRestoration from "./ScrollRestoration";

export default function Providers({ children }) {
  return (
    <EditorThemeProvider>
      <ScrollRestoration />
      {children}
    </EditorThemeProvider>
  );
}
