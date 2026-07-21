// ============ 布局文件：Mantine 完整指南 ============
import "@mantine/core/styles.css";
import "highlight.js/styles/github-dark.css";
import { MantineProvider, createTheme } from "@mantine/core";
import "./book-content.css";

// ============ 主题配置 ============
const theme = createTheme({
  primaryColor: "blue",
  primaryShade: { light: 6, dark: 4 },
  defaultRadius: "md",
  autoContrast: true,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  headings: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontWeight: "700",
  },
});

// ============ 页面元数据 ============
export const metadata = {
  title: "Mantine 完整指南：理念、设计与实战",
  description: "深入理解 Mantine 的设计理念、Theme 系统与 Form 验证机制",
};

// ============ 布局组件 ============
export default function MantineGuideLayout({ children }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {children}
    </MantineProvider>
  );
}
