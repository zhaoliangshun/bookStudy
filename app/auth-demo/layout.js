// =============================================================
// 文件：app/auth-demo/layout.js
// -------------------------------------------------------------
// 【职责】
//   /auth-demo 路由的布局根组件。挂载 MantineProvider 让子树能使用 Mantine 组件。
//
// 【样式隔离】
//   Mantine 的 reset 和 CSS 变量只在 /auth-demo 子树生效，
//   不污染主站（教程网站）原有样式。与 /mantine 路由隔离方式一致。
//
// 【防闪烁脚本】
//   已上移到 app/layout.js（root layout），用 next/script 的 beforeInteractive
//   策略在 hydration 前同步设置 data-mantine-color-scheme。
//   原因：Next.js 16 / React 19.2 对在 client component 中渲染 <script> 会警告
//   （"Scripts inside React components are never executed when rendering on the client"）。
//   next/script 是 Next.js 官方推荐的脚本加载方式，不会触发该警告。
// =============================================================

import "@mantine/core/styles.css";
import { MantineProvider, createTheme } from "@mantine/core";

// 定制主题：indigo 主色 + 中等圆角 + 自动对比度
// primaryShade 指定亮/暗模式下的主色深浅级别（0-9，越大越深）
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
  title: "ForgeRock 认证实战 Demo",
  description: "Zod + Mantine + @forgerock/javascript-sdk 综合认证演示",
};

export default function AuthDemoLayout({ children }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {children}
    </MantineProvider>
  );
}
