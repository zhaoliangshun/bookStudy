"use client";

import { EditorThemeProvider } from "./EditorThemeProvider";

export default function Providers({ children }) {
  return <EditorThemeProvider>{children}</EditorThemeProvider>;
}
