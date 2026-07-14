"use client";

import { Component } from "react";
import { usePathname } from "next/navigation";
import { EditorThemeProvider } from "./EditorThemeProvider";
import ScrollRestoration from "./ScrollRestoration";
import QuickScroll from "./QuickScroll";
import ReadingThemeSwitcher from "./ReadingThemeSwitcher";
import FloatingChapterNav from "./FloatingChapterNav";
import FloatingEditorTheme from "./FloatingEditorTheme";
import BookmarkManager from "./BookmarkManager";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("页面渲染错误：", error, errorInfo);
  }

  // 修复：路由切换时重置错误状态，避免一个页面的错误 permanently 阻塞其他页面
  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          fontFamily: "var(--sans, system-ui, sans-serif)",
          color: "var(--text, #1a1a2e)",
          background: "var(--bg, #f7f8fa)",
        }}>
          <div style={{ fontSize: "48px" }}>😵</div>
          <h2 style={{ margin: 0, fontSize: "20px" }}>页面渲染出错</h2>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary, #64748b)" }}>
            请刷新页面重试，或清除浏览器缓存后再次访问。
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "8px 24px",
              border: "1px solid var(--border, #e2e8f0)",
              borderRadius: "8px",
              background: "var(--primary, #0891b2)",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Providers({ children }) {
  // 路由变化时通过 resetKey 触发 ErrorBoundary 重置错误状态
  const pathname = usePathname();
  return (
    <ErrorBoundary resetKey={pathname}>
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
    </ErrorBoundary>
  );
}