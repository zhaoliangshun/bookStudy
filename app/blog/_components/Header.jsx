// 顶部导航栏：显示 Logo、菜单、登录状态

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../_lib/auth-context";

export default function BlogHeader() {
  const { user, isLogin, isAdmin, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: "/blog", label: "首页" },
    { href: "/blog/posts", label: "文章" },
    { href: "/blog/tags", label: "标签" },
  ];

  function handleLogout() {
    logout();
    router.push("/blog");
  }

  return (
    <header className="blog-header">
      <div className="blog-header-inner">
        <Link href="/blog" className="blog-logo">
          📚 Blog Platform
        </Link>

        <nav className="blog-nav">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`blog-nav-link ${pathname === l.href ? "active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          {isLogin && (
            <Link
              href="/blog/posts/new"
              className={`blog-nav-link ${pathname === "/blog/posts/new" ? "active" : ""}`}
            >
              写文章
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/blog/admin"
              className={`blog-nav-link ${pathname === "/blog/admin" ? "active" : ""}`}
            >
              管理
            </Link>
          )}
        </nav>

        <div className="blog-header-right">
          {loading ? (
            <span className="blog-user-loading">...</span>
          ) : isLogin ? (
            <>
              <Link href="/blog/me" className="blog-user-link">
                <span className="blog-avatar">
                  {user.avatar ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={user.avatar} alt={user.username} />
                    </>
                  ) : (
                    user.username[0].toUpperCase()
                  )}
                </span>
                <span>{user.username}</span>
              </Link>
              <button onClick={handleLogout} className="blog-btn blog-btn-ghost">
                登出
              </button>
            </>
          ) : (
            <>
              <Link href="/blog/login" className="blog-btn blog-btn-ghost">
                登录
              </Link>
              <Link href="/blog/register" className="blog-btn blog-btn-primary">
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
