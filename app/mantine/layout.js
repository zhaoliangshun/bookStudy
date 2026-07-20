// =============================================================
// 文件：app/mantine/layout.js
// -------------------------------------------------------------
// 【职责】
//   /mantine 路由的布局根组件，挂载 MantineProvider 让子树能用
//   Mantine 组件，并注入自定义主题 + 防闪烁脚本。
//
// 【样式隔离】
//   Mantine 的 reset 和 CSS 变量只在 /mantine 子树生效，
//   不污染主站（教程网站）原有样式。
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
//   方案 C（可考虑的更稳写法）：
//     next/script + beforeInteractive 策略，让脚本在 hydration 前
//     执行。这里没有用 next/script，因为它和 suppressHydrationWarning
//     一起用偶尔会双触发。
// =============================================================

import "@mantine/core/styles.css";
import { MantineProvider, createTheme } from "@mantine/core";

// 定制主题
const theme = createTheme({
  primaryColor: "indigo",
  primaryShade: { light: 6, dark: 4 },
  defaultRadius: "md",
  autoContrast: true,
  fontFamily:
    "var(--sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)",
  headings: {
    fontFamily:
      "var(--sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)",
    fontWeight: "700",
  },
  // 默认间距更紧凑一点
  spacing: { xs: "8px", sm: "12px", md: "16px", lg: "20px", xl: "32px" },
  // 表格行间距更宽松
  components: {
    Table: {
      defaultProps: {
        verticalSpacing: "sm",
        horizontalSpacing: "md",
        highlightOnHover: true,
        striped: true,
      },
    },
  },
});

export const metadata = {
  title: "Mantine 组件实战 Demo",
  description: "Mantine v9 常用组件完整站点演示",
};

// 防闪烁脚本：HTML 解析阶段同步读取 localStorage 设置主题，
// 避免刷新时亮→暗闪烁(FOUC)。与 Mantine ColorSchemeScript 内容一致。
const COLOR_SCHEME_SCRIPT = `try{var _c=window.localStorage.getItem("mantine-color-scheme-value");var c=_c==="light"||_c==="dark"||_c==="auto"?_c:"light";var cc=c!=="auto"?c:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-mantine-color-scheme",cc);}catch(e){}`;

export default function MantineLayout({ children }) {
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

      {/* 【滚动修复】
          主站 globals.css 里 html/body 被锁成 height:100% + overflow:hidden，
          是为主站「侧边栏 + 内容区各自滚动」的布局服务的。
          但 Mantine 的 AppShell 是「Header/Navbar 固定定位 + body 整体滚动」
          设计——AppShell-main 只有 min-height:100dvh，没有内部 overflow。
          body 被锁后内容超出视口就拉不下去，导致页面无法滚动。
          这里用 !important 覆盖回浏览器的默认滚动行为，仅作用于 /mantine
          子树（layout.js 的 <style> 标签只在当前路由段注入）。
          同时优化滚动条样式，保持与主站统一。 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body {
              height: auto !important;
              overflow: auto !important;
            }
            /* 暗色主题下也保持可读 */
            html[data-mantine-color-scheme="dark"] body {
              background: var(--mantine-color-dark-7);
            }
            /* 自定义滚动条（仅作用于 /mantine 子树） */
            .mantine-AppShell-main::-webkit-scrollbar,
            html::-webkit-scrollbar { width: 8px; height: 8px; }
            .mantine-AppShell-main::-webkit-scrollbar-track,
            html::-webkit-scrollbar-track { background: transparent; }
            .mantine-AppShell-main::-webkit-scrollbar-thumb,
            html::-webkit-scrollbar-thumb {
              background: rgba(128, 128, 128, 0.35);
              border-radius: 4px;
            }
            .mantine-AppShell-main::-webkit-scrollbar-thumb:hover,
            html::-webkit-scrollbar-thumb:hover {
              background: rgba(128, 128, 128, 0.55);
            }
          `,
        }}
      />

      <MantineProvider theme={theme} defaultColorScheme="light">
        {children}
      </MantineProvider>
    </>
  );
}
