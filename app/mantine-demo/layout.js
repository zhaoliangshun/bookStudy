// =============================================================
// Mantine Demo —— Layout
// -------------------------------------------------------------
// 【职责】
//   1. 引入 Mantine 全局样式（styles.css）
//   2. 挂 MantineProvider，让所有 demo 页面都能用 Mantine 组件
//   3. 隔离 Mantine 的全局样式，避免污染主站主题
//
// 【为什么需要独立 layout】
//   Mantine 的 MantineProvider 会注入全局 CSS Variables 和 reset 样式，
//   如果放在主 layout 里会影响所有页面。这里局部挂载到 /mantine-demo 子树。
//
// 【关于 ColorSchemeScript】
//   ColorSchemeScript 通常放在 <head> 中避免 FOUC，但子 layout 无法访问 <head>。
//   这里用 defaultColorScheme="light" 固定亮色（demo 不切换暗色时无 FOUC），
//   demo 页面内部通过 useMantineColorScheme 切换时会通过 data 属性同步。
// =============================================================

import "@mantine/core/styles.css";
import { MantineProvider, createTheme } from "@mantine/core";

// 自定义主题（演示 createTheme 用法）
const theme = createTheme({
  primaryColor: "indigo",
  primaryShade: { light: 6, dark: 5 },
  defaultRadius: "md",
  autoContrast: true,
  fontFamily:
    "var(--sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)",
  headings: {
    fontFamily:
      "var(--sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)",
  },
});

export const metadata = {
  title: "Mantine Demo | Mantine 在线演示",
  description: "Mantine v9 + Form + Zod 在线 Demo",
};

export default function MantineDemoLayout({ children }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {children}
    </MantineProvider>
  );
}
