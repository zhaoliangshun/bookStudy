// =============================================================
// 文件：app/auth-demo/layout.js
// -------------------------------------------------------------
// 【职责】
//   /auth-demo 路由的布局根组件。挂载 MantineProvider 让子树能使
//   用 Mantine 组件，并注入自定义主题 + 防闪烁脚本。
//
// 【样式隔离】
//   Mantine 的 reset 和 CSS 变量只在 /auth-demo 子树生效，
//   不污染主站（教程网站）原有样式。与 /mantine 路由隔离方式一致。
//
// 【为什么 ColorSchemeScript 放在 MantineProvider 外部】
//   MantineProvider 是客户端组件（使用 React Context），其子树
//   在 hydration 阶段会被 React 重新渲染。React 19.2 对客户端渲染
//   中出现的 <script> 标签会发出警告（脚本不会执行）。放在外部
//   作为 Server Component 的直接输出，<script> 标签仅作为静态 HTML
//   下发，在 HTML 解析阶段同步执行，不参与 hydration。
// =============================================================

import "@mantine/core/styles.css";
import { MantineProvider, createTheme, ColorSchemeScript } from "@mantine/core";

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
    <>
      {/* ColorSchemeScript：在 HTML 解析阶段同步读取 localStorage
          设置主题，避免刷新时亮→暗闪烁(FOUC) */}
      <ColorSchemeScript defaultColorScheme="light" />
      <MantineProvider theme={theme} defaultColorScheme="light">
        {children}
      </MantineProvider>
    </>
  );
}
