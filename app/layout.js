import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Node.js / TypeScript / Tailwind CSS / Python 交互式教程 · 在线编辑运行",
  description: "详细全面的 Node.js、TypeScript、Tailwind CSS 与 Python 教程，涵盖模块系统、文件系统、流、事件、加密、异步编程、类型系统、泛型、装饰器、原子化 CSS、响应式布局、Python 语法、面向对象、装饰器/生成器、asyncio 等常用知识，支持在线修改源代码并实时运行/预览。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
