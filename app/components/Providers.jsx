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
// 右侧浮动按钮的可见性管理（Provider + 设置入口）
import { FloatingButtonVisibilityProvider } from "./FloatingButtonVisibility";
import FloatingButtonSettings from "./FloatingButtonSettings";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Monaco Editor 在路由切换时可能抛出 "InstantiationService has been disposed"
    // 这是因为 language worker 的异步回调在编辑器实例销毁后仍在执行，属于无害警告。
    // 不触发错误边界，避免页面被错误 UI 覆盖。
    if (error && /InstantiationService has been disposed/i.test(error.message || "")) {
      this.setState({ hasError: false });
      return;
    }
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
        {/* 用 VisibilityProvider 包裹浮动按钮组，让所有按钮
            和设置入口共享同一份「显示/隐藏」状态 */}
        <FloatingButtonVisibilityProvider>
          <div className="floating-panel-group">
            {/* 书签管理器：与其他浮动按钮共用同一容器 */}
            <BookmarkManager />
            <FloatingEditorTheme />
            <ReadingThemeSwitcher />
            <FloatingChapterNav />
            <QuickScroll />
          </div>
          {/* 设置入口（齿轮按钮）：单独放在右下角，不与其他浮动按钮共组 */}
          <FloatingButtonSettings />
        </FloatingButtonVisibilityProvider>
        {children}
      </EditorThemeProvider>
    </ErrorBoundary>
  );
}