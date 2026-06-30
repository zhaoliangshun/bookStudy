// =============================================================
// Blog Platform —— 布局
// -------------------------------------------------------------
// 【职责】
//   1. 在最外层包 AuthProvider，让所有子页面都能用 useAuth
//   2. 渲染顶部导航栏（Logo + 菜单 + 登录状态）
//   3. 渲染页面内容（children）
//
// 【为什么在 layout 而不是 page 包 Provider】
//   layout 在路由切换时不会重新挂载，Provider 状态能跨页面保留。
//   如果在 page 包，每次跳转都重新初始化，会丢失登录状态。
// =============================================================

import "./blog.css";
import { AuthProvider } from "./_lib/auth-context";
import BlogHeader from "./_components/Header";

export const metadata = {
  title: "Blog Platform | 教学博客平台",
  description: "Next.js + FastAPI + MySQL 全栈教学项目",
};

export default function BlogLayout({ children }) {
  return (
    <AuthProvider>
      <div className="blog-app">
        <BlogHeader />
        <main className="blog-main">{children}</main>
        <footer className="blog-footer">
          <p>
            Blog Platform · Next.js 16 + FastAPI + MySQL 教学项目 ·{" "}
            <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer">
              API 文档
            </a>
          </p>
        </footer>
      </div>
    </AuthProvider>
  );
}
