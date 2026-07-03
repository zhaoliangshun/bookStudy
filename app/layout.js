import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Node.js / TypeScript / Tailwind CSS / Python / Sass / GraphQL 交互式教程 · 在线编辑运行",
  description: "详细全面的 Node.js、TypeScript、Tailwind CSS、Python、Sass 与 GraphQL 教程，涵盖模块系统、文件系统、流、事件、加密、异步编程、类型系统、泛型、装饰器、原子化 CSS、响应式布局、Python 语法、面向对象、装饰器/生成器、asyncio、Sass 变量/嵌套/混入/继承、GraphQL Schema/Query/Mutation/Resolver/Subscription 等常用知识，支持在线修改源代码并实时运行/预览。",
};

export default function RootLayout({ children }) {
  // 在 React hydrate 之前读取 localStorage 设置主题，
  // 避免首屏先显示默认主题再闪烁切换的问题。
  // suppressHydrationWarning：data-theme 与客户端可能不一致，忽略告警。
  const themeInitScript = `
    (function() {
      try {
        var t = localStorage.getItem('theme-preference');
        if (t && ['cyan','blue','violet','emerald','rose','amber'].indexOf(t) !== -1) {
          document.documentElement.setAttribute('data-theme', t);
        } else {
          document.documentElement.setAttribute('data-theme', 'cyan');
        }
      } catch (e) {
        document.documentElement.setAttribute('data-theme', 'cyan');
      }
    })();
  `;
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
