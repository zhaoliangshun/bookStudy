import { cookies } from "next/headers";
import Script from "next/script";
import "./globals.css";
import Providers from "./components/Providers";
import PWARegister from "./components/PWARegister";

// Mantine 防闪烁脚本：在 hydration 前同步读取 localStorage 设置 data-mantine-color-scheme，
// 避免 /mantine、/auth-demo 等子树刷新时亮→暗闪烁(FOUC)。
// 放在 root layout 用 beforeInteractive 策略，SSR 时 Next.js 通过 __next_s 机制
// 注入脚本到 HTML，客户端在 hydration 前执行；React 19.2 不会对 next/script 警告。
// 非 Mantine 页面 localStorage 没有 mantine-color-scheme-value，脚本走 catch 分支无副作用。
const MANTINE_COLOR_SCHEME_SCRIPT = `try{var _c=window.localStorage.getItem("mantine-color-scheme-value");var c=_c==="light"||_c==="dark"||_c==="auto"?_c:"light";var cc=c!=="auto"?c:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-mantine-color-scheme",cc);}catch(e){}`;

export const metadata = {
  title: "Node.js / TypeScript / Tailwind CSS / Python / Sass / GraphQL 交互式教程 · 在线编辑运行",
  description: "详细全面的 Node.js、TypeScript、Tailwind CSS、Python、Sass 与 GraphQL 教程，涵盖模块系统、文件系统、流、事件、加密、异步编程、类型系统、泛型、装饰器、原子化 CSS、响应式布局、Python 语法、面向对象、装饰器/生成器、asyncio、Sass 变量/嵌套/混入/继承、GraphQL Schema/Query/Mutation/Resolver/Subscription 等常用知识，支持在线修改源代码并实时运行/预览。",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "BookStudy",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0891b2",
};

// 合法主题列表，与 ThemeSwitcher.jsx 和 globals.css 保持一致
const VALID_THEMES = ["cyan", "blue", "violet", "emerald", "rose", "amber"];
const DEFAULT_THEME = "cyan";
const COOKIE_KEY = "theme-preference";

export default async function RootLayout({ children }) {
  // 在服务端读取 cookie 获取用户保存的主题。
  // 这样首屏 HTML 直接带正确的 data-theme，无需内联脚本，
  // 既避免了 React 19.2 对 <script> 的警告，又防止了主题闪烁。
  const cookieStore = await cookies();
  const savedTheme = cookieStore.get(COOKIE_KEY)?.value;
  const theme = VALID_THEMES.includes(savedTheme) ? savedTheme : DEFAULT_THEME;

  return (
    <html
      lang="zh-CN"
      data-theme={theme}
      suppressHydrationWarning
    >
      <body>
        {/* Mantine 防闪烁脚本：beforeInteractive 在 hydration 前执行，避免亮→暗闪烁 */}
        <Script
          id="mantine-color-scheme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: MANTINE_COLOR_SCHEME_SCRIPT }}
        />
        <Providers>{children}</Providers>
        <PWARegister />
      </body>
    </html>
  );
}
