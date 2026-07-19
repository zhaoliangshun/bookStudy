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
// 【关于防闪烁脚本】
//   方案 A（使用 ColorSchemeScript）：
//     ColorSchemeScript 是客户端组件，会渲染 <script> 标签。
//     Next.js 16 / React 19.2 会警告 client-rendered <script>
//     不会在 hydration 阶段执行。
//   方案 B（直接写 <script>，当前采用）：
//     服务端渲染时 type="text/javascript"（HTML 解析阶段同步执行）；
//     客户端 hydration 后 type="text/plain"（不执行、避免重复、
//     不被 React 警告）。两端 type 不同用 suppressHydrationWarning。
//     脚本内容与 Mantine 内部生成的 ColorSchemeScript 等价。
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

// 防闪烁脚本：HTML 解析阶段同步读取 localStorage 设置主题，
// 避免刷新时亮→暗闪烁(FOUC)。与 Mantine ColorSchemeScript 内容一致。
const COLOR_SCHEME_SCRIPT = `try{var _c=window.localStorage.getItem("mantine-color-scheme-value");var c=_c==="light"||_c==="dark"||_c==="auto"?_c:"light";var cc=c!=="auto"?c:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-mantine-color-scheme",cc);}catch(e){}`;

export default function AuthDemoLayout({ children }) {
  return (
    <>
      {/* 防闪烁脚本：服务端 type="text/javascript" 同步执行；
          客户端 type="text/plain" 不执行（避免重复执行）也不触发警告；
          suppressHydrationWarning 处理 type 属性两端不一致。 */}
      <script
        type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: COLOR_SCHEME_SCRIPT }}
      />

      <MantineProvider theme={theme} defaultColorScheme="light">
        {children}
      </MantineProvider>
    </>
  );
}
