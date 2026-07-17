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
// =============================================================

import "@mantine/core/styles.css";
import { MantineProvider, createTheme, ColorSchemeScript } from "@mantine/core";

// 定制主题：indigo 主色 + 中等圆角 + 自动对比度
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
  title: "Mantine 组件实战 Demo",
  description: "Mantine v9 常用组件完整站点演示",
};

export default function MantineLayout({ children }) {
  return (
    <>
      {/* ColorSchemeScript：在 HTML 解析阶段同步读取 localStorage
          设置主题，避免刷新时亮→暗闪烁(FOUC)。
          必须放在 MantineProvider 之外——MantineProvider 是客户端组件，
          其子树会在 hydration 阶段被 React 重新渲染，而 React 19.2 会
          对客户端渲染中出现的 <script> 标签发出警告（脚本不会执行）。
          放在外部作为 Server Component 的直接输出，<script> 标签仅作为
          静态 HTML 下发，不会触发 hydration 警告。 */}
      <ColorSchemeScript defaultColorScheme="light" />

      {/* 【滚动修复】
          主站 globals.css 里 html/body 被锁成 height:100% + overflow:hidden，
          是为主站「侧边栏 + 内容区各自滚动」的布局服务的。
          但 Mantine 的 AppShell 是「Header/Navbar 固定定位 + body 整体滚动」
          设计——AppShell-main 只有 min-height:100dvh，没有内部 overflow。
          body 被锁后内容超出视口就拉不下去，导致页面无法滚动。
          这里用 !important 覆盖回浏览器的默认滚动行为，仅作用于 /mantine
          子树（layout.js 的 <style> 标签只在当前路由段注入）。 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body {
              height: auto !important;
              overflow: auto !important;
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
