// =============================================================
// 文件：app/mantine-demo/layout.js
// -------------------------------------------------------------
// 【一句话职责】
//   这是 Next.js App Router 下 /mantine-demo 路由的【布局根组件】。
//   它负责把 Mantine（一个 React 组件库，类似 Ant Design / Chakra UI）
//   的运行环境挂载到这棵子树，让所有 /mantine-demo 下的页面都能直接
//   使用 <Button />、<TextInput /> 等 Mantine 组件。
//
// 【Next.js App Router 的 layout 概念】
//   在 App Router 里，每个目录下的 layout.js 会【包裹】该目录及其
//   子目录的所有 page.js。它不会随路由切换而卸载，是放「全局 Provider」
//   的最佳位置。这里把 MantineProvider 放在局部 layout，而不是根
//   app/layout.js，是为了【样式隔离】——见下文说明。
//
// 【为什么需要独立 layout（样式隔离）】
//   Mantine 的 MantineProvider 会向 <body> 注入：
//     1. 一套 CSS 变量（如 --mantine-color-blue-6）
//     2. 一份全局 reset 样式（styles.css）
//   如果挂在根 layout，会污染主站（教程网站）原有的样式系统，
//   导致主站按钮、输入框等元素被 Mantine reset 覆盖。因此这里把
//   Mantine 限制在 /mantine-demo 子树，做到「井水不犯河水」。
//
// 【关于 FOUC（Flash of Unstyled Content，无样式内容闪烁）】
//   切换暗色主题时，如果 HTML 先以亮色渲染、JS 再改成暗色，用户会
//   看到一瞬间的「白闪」。Mantine 提供 <ColorSchemeScript /> 放在
//   <head> 里，在 HTML 解析阶段就定好主题，避免闪烁。但【子 layout
//   无法访问 <head>】，所以这里用 defaultColorScheme="light" 固定
//   亮色作为兜底；页面内部用 useMantineColorScheme 切换时，会通过
//   data-mantine-color-scheme 属性同步，不会闪烁。
//
// 【配套教程章节】
//   - m-create-theme ：createTheme 主题定制
//   - m-provider     ：MantineProvider 用法
//   - m-demo         ：综合 Demo
// =============================================================

// ---- 引入 Mantine 的全局样式表 ----
// @mantine/core/styles.css 包含：CSS Reset、CSS 变量定义、所有组件的基础样式。
// 必须在 MantineProvider 之前引入，否则组件会「裸奔」（没有样式）。
// 这是 Vite/Next 都通用的 side-effect import（只执行副作用，不绑定值）。
import "@mantine/core/styles.css";

// ---- 从 @mantine/core 引入 Provider 和主题工厂函数 ----
// MantineProvider：上下文提供者组件，必须包裹在所有 Mantine 组件外层，
//                  内部通过 React Context 下发主题、颜色方案（亮/暗）。
// createTheme：用来【定制主题】的工厂函数，返回一个 MantineTheme 对象。
//              相比直接传裸对象，它能做类型推导和默认值合并，推荐用它。
// ColorSchemeScript：消除主题闪烁(FOUC)的内联脚本。详见下方使用处注释。
import { MantineProvider, createTheme, ColorSchemeScript } from "@mantine/core";

// ---- 定制 Mantine 主题 ----
// createTheme 接收一个「主题覆盖对象」，未指定的字段沿用 Mantine 默认值。
// 下面逐字段说明：
const theme = createTheme({
  // primaryColor：主色调。Mantine 内置 10+ 色板（blue/indigo/red/teal...），
  //               组件里 variant="filled" 的按钮、选中的输入框边框都用这个色。
  //               这里用 indigo（靛蓝），比默认 blue 更有质感。
  primaryColor: "indigo",

  // primaryShade：主色调的【明暗档位】。Mantine 每个颜色有 10 档（0~9），
  //               0 最浅、9 最深。可以分别给亮色/暗色主题指定不同档位，
  //               保证两种主题下对比度都合适。
  //               { light: 6, dark: 5 } 意为：亮色主题用第 6 档、暗色用第 5 档。
  primaryShade: { light: 6, dark: 5 },

  // defaultRadius：全局默认圆角。可选 0~xl 或具体像素值。
  //                设为 "md" 后，Button/Paper/Card 等默认中等圆角，视觉统一。
  defaultRadius: "md",

  // autoContrast：自动对比度。开启后，当按钮背景色较深时，文字自动用白色；
  //               背景较浅时自动用黑色。免去手动调文字颜色的麻烦。
  autoContrast: true,

  // fontFamily：全局正文字体。这里复用主站 CSS 变量 --sans（若不存在则回退到系统字体栈）。
  //             -apple-system / BlinkMacSystemFont 对应 macOS/iOS 原生字体，
  //             'Segoe UI' 对应 Windows，最终回退到无衬线字体族。
  fontFamily:
    "var(--sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)",

  // headings：标题（h1~h6）的字体配置。这里让标题和正文用同一字体族，
  //           保持视觉一致；也可以单独指定一个更有个性的展示字体。
  headings: {
    fontFamily:
      "var(--sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)",
  },
});

// ---- Next.js 元数据导出 ----
// metadata 是 Next.js App Router 的特殊导出，用于设置 <head> 里的
// <title>、<meta description>，利于 SEO 和浏览器标签页显示。
// 注意：layout 的 metadata 会被子页面继承，子页面可覆盖。
export const metadata = {
  title: "Mantine Demo | Mantine 在线演示",
  description: "Mantine v9 + Form + Zod 在线 Demo",
};

// ---- 默认导出：布局组件 ----
// Next.js 约定：layout.js 必须 default export 一个 React 组件，
// 该组件接收 { children } 作为 props——children 就是子目录下的 page.js
// 渲染出来的内容。
//
// 【为什么是服务端组件】
//   这个文件没有 "use client"，所以它是【服务端组件】(Server Component)。
//   MantineProvider 本身是客户端组件，但可以在服务端组件里渲染——
//   Next 会自动把它标记为客户端边界。MantineProvider 的子组件（children）
//   则按各自是否带 "use client" 决定运行环境。
export default function MantineDemoLayout({ children }) {
  return (
    // MantineProvider：必须的上下文提供者。
    //   theme={theme}          → 注入上面定制的主题
    //   defaultColorScheme="light" → 默认亮色主题（用户可在页面内切换）
    <MantineProvider theme={theme} defaultColorScheme="light">
      {/*
        ColorSchemeScript —— 消除刷新时的主题闪烁(FOUC)
        ---------------------------------------------------------------
        【为什么会闪烁】
          MantineProvider 默认用 localStorageColorSchemeManager 持久化主题，
          key 为 "mantine-color-scheme-value"。刷新流程：
            1) SSR 阶段：服务端读不到 localStorage，用 defaultColorScheme
               ("light") 渲染 → 首屏 HTML 是亮色
            2) React hydration：Mantine 从 localStorage 读到用户上次保存的
               "dark" → 立即切换 → 用户看到「亮色闪一下变暗色」
        【ColorSchemeScript 的作用】
          它渲染成一个内联 <script>，在 HTML 解析阶段【同步执行】（早于
          React hydration），从 localStorage 读取主题并设置
          <html data-mantine-color-scheme="...">。这样首屏 HTML 一渲染
          就是正确主题，无需 hydration 后再切换，彻底消除闪烁。
        【为什么放在这里（子 layout 的 body 内）】
          Next.js 子 layout 无法访问 <head>，但 ColorSchemeScript 是普通
          <script>（非 Next Script），放在 body 内依然能在 HTML 解析时
          同步执行。只要它在 MantineProvider 渲染的内容之前即可。
        【与 defaultColorScheme 的关系】
          两者必须一致（都是 "light"）：defaultColorScheme 是 SSR 兜底值，
          ColorSchemeScript 的 defaultColorScheme 是 localStorage 无值时的
          兜底值。保持一致才能在「用户从没切过主题」时也不闪。
      */}
      <ColorSchemeScript defaultColorScheme="light" />
      {/* children 代表 /mantine-demo/page.js 渲染的内容，
          会被 MantineProvider 的上下文包裹，从而能用 Mantine 组件 */}
      {children}
    </MantineProvider>
  );
}
