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
//   原先使用 Mantine 的 <ColorSchemeScript />，但它是客户端组件，
//   会渲染出 <script> 标签——Next.js 16 / React 19.2 会对客户端渲染
//   中出现的 <script> 发出警告（脚本在 hydration 阶段不会执行）。
//   官方推荐做法：直接写 <script>，服务端 type="text/javascript"
//   （HTML 解析阶段同步执行，先于首屏绘制），客户端 type="text/plain"
//   （React 不再警告，软导航时也不重复执行），并加 suppressHydrationWarning
//   处理 type 属性的服务端/客户端不一致。
//   脚本内容与 Mantine ColorSchemeScript 内部生成的一致，
//   仅是换了"外壳"以避开 React 警告。
// =============================================================

import "@mantine/core/styles.css";
import { MantineProvider, createTheme } from "@mantine/core";

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

// 防闪烁脚本内容：在 HTML 解析阶段同步读取 localStorage 设置主题，
// 避免刷新时亮→暗闪烁(FOUC)。与 Mantine ColorSchemeScript 生成的一致。
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
