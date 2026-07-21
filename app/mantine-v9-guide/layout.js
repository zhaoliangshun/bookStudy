// =============================================================
// Mantine v9 现代开发指南 - 根布局
// -------------------------------------------------------------
// 为该书籍路由提供独立的 MantineProvider 实例，
// 避免与站点全局主题产生冲突，同时确保阅读器拥有舒适的默认配色。
// =============================================================

"use client";

// Mantine 核心样式必须最先导入，否则组件样式会丢失
import "@mantine/core/styles.css";
// highlight.js 代码高亮主题，使用 github 适配浅色阅读背景
import "highlight.js/styles/github.css";

import { MantineProvider, createTheme } from "@mantine/core";
// 阅读器专属排版样式
import "./book-content.css";

// ============ 阅读器主题配置 ============
// 使用 blue 作为主色，与 Mantine 品牌色保持一致
const readerTheme = createTheme({
  // 主色调：Mantine 品牌蓝
  primaryColor: "blue",
  // 浅色模式使用 shade 6，深色模式使用 shade 8，保证对比度
  primaryShade: { light: 6, dark: 8 },
  // 默认圆角：中等，符合现代审美
  defaultRadius: "md",
  // 自动对比度：确保彩色背景上的文字可读
  autoContrast: true,
  // 字体栈：优先使用系统字体，减少加载时间
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans SC', sans-serif",
  // 标题字体：与正文字体一致，保持简洁
  headings: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans SC', sans-serif",
    fontWeight: "700",
  },
  // 组件默认样式微调
  components: {
    Button: {
      defaultProps: {
        // 默认按钮带轻微阴影，提升可点击感
        fw: 600,
      },
    },
  },
});

// ============ 页面元数据 ============
// 注意：在 "use client" 文件中无法导出 metadata，
// 因此元数据定义在 page.js 中。

// ============ 布局组件 ============
export default function MantineV9GuideLayout({ children }) {
  return (
    <MantineProvider theme={readerTheme} defaultColorScheme="light">
      {children}
    </MantineProvider>
  );
}
