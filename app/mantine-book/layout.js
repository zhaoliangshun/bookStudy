// ============ 引入样式 ============
// Mantine 核心样式（必须）
import "@mantine/core/styles.css";
// highlight.js 代码高亮主题（github-dark 深色主题）
import "highlight.js/styles/github-dark.css";

import { MantineProvider, createTheme } from "@mantine/core";
// 阅读器内容排版样式（markdown 渲染样式 + 全局滚动修复）
import "./book-content.css";

// ============ 主题配置 ============
// 为阅读器创建一个舒适的阅读主题
const theme = createTheme({
  // 主色调：靛蓝色，适合阅读器界面
  primaryColor: "indigo",
  primaryShade: { light: 6, dark: 4 },
  // 默认圆角
  defaultRadius: "md",
  // 自动对比度：确保按钮文字可读
  autoContrast: true,
  // 字体族：使用系统字体栈，兼容性好
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  // 标题字体
  headings: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontWeight: "700",
  },
});

// ============ 页面元数据 ============
export const metadata = {
  title: "Mantine v9 实战指南",
  description:
    "基于 Mantine v9 的完整指南，聚焦设计理念、Theme 系统与 Form 验证",
};

// ============ 布局组件 ============
// /mantine-book 路由的布局
// 挂载 MantineProvider，为阅读器提供主题和色彩方案
export default function BookLayout({ children }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {children}
    </MantineProvider>
  );
}
