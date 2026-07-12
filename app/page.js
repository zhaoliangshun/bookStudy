"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TUTORIALS = [
  { path: "/nodejs", name: "Node.js 入门", icon: "💚", desc: "服务端 JavaScript 运行时" },
  { path: "/py", name: "Python 入门", icon: "🐍", desc: "简洁优雅的编程语言" },
  { path: "/ts", name: "TypeScript", icon: "🔷", desc: "带类型的 JavaScript" },
  { path: "/java", name: "Java 入门", icon: "☕", desc: "企业级开发首选" },
  { path: "/go", name: "Go 语言", icon: "🐹", desc: "高并发编程语言" },
  { path: "/csharp", name: "C# 入门", icon: "🟣", desc: ".NET 生态语言" },
  { path: "/sql", name: "SQL 入门", icon: "🗄️", desc: "数据库查询语言" },
  { path: "/mysql", name: "MySQL", icon: "🐬", desc: "流行关系型数据库" },
  { path: "/postgres", name: "PostgreSQL", icon: "🐘", desc: "高级开源数据库" },
  { path: "/redis", name: "Redis", icon: "🔴", desc: "内存键值数据库" },
  { path: "/mongo", name: "MongoDB", icon: "🍃", desc: "NoSQL 文档数据库" },
  { path: "/nextjs", name: "Next.js", icon: "▲", desc: "React 全栈框架" },
  { path: "/fastapi", name: "FastAPI", icon: "⚡", desc: "现代 Python Web 框架" },
  { path: "/http", name: "HTTP 协议", icon: "🌐", desc: "Web 通信基础" },
  { path: "/sass", name: "Sass/SCSS", icon: "💅", desc: "CSS 预处理器" },
  { path: "/gql", name: "GraphQL", icon: "◈", desc: "API 查询语言" },
];

export default function Home() {
  const router = useRouter();
  const [savedPath, setSavedPath] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const doRedirect = () => {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      let path = "/nodejs";

      let hasSaved = false;
      try {
        const saved = localStorage.getItem("sidebar:last-book");
        if (saved && saved !== "/" && saved.startsWith("/")) {
          path = saved;
          hasSaved = true;
          setSavedPath(saved);
        }
      } catch {}

      if (!cancelled) {
        setTimeout(() => {
          if (!cancelled) {
            router.replace(path + search + hash);
          }
        }, hasSaved ? 100 : 500);
      }
    };

    doRedirect();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      fontFamily: "var(--sans)",
      padding: "40px 20px",
    }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .home-loading-spinner {
          width: 28px;
          height: 28px;
          border: 3px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .home-card {
          animation: fadeIn 0.4s ease-out both;
          transition: all 0.2s ease;
        }
        .home-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          border-color: var(--primary);
        }
      `}</style>

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{
            fontSize: "36px",
            fontWeight: 800,
            color: "var(--text)",
            margin: "0 0 12px 0",
            letterSpacing: "-0.02em",
          }}>
            📚 编程学习平台
          </h1>
          <p style={{
            fontSize: "16px",
            color: "var(--text-secondary)",
            margin: 0,
          }}>
            交互式教程 · 在线代码运行 · 边学边练
          </p>
          {savedPath && (
            <div style={{
              marginTop: "20px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              background: "var(--bg-secondary)",
              borderRadius: "8px",
              fontSize: "14px",
              color: "var(--text-secondary)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}>
              <div className="home-loading-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
              正在跳转到上次学习位置...
            </div>
          )}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
        }}>
          {TUTORIALS.map((tutorial, index) => (
            <Link
              key={tutorial.path}
              href={tutorial.path}
              className="home-card"
              style={{
                display: "block",
                padding: "20px",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                textDecoration: "none",
                color: "inherit",
                animationDelay: `${index * 30}ms`,
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>{tutorial.icon}</div>
              <div style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: "4px",
              }}>
                {tutorial.name}
              </div>
              <div style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}>
                {tutorial.desc}
              </div>
            </Link>
          ))}
        </div>

        <div style={{
          textAlign: "center",
          marginTop: "48px",
          paddingTop: "24px",
          borderTop: "1px solid var(--border)",
          color: "var(--text-secondary)",
          fontSize: "13px",
        }}>
          <p>提示：使用键盘 <kbd style={{
            padding: "2px 6px",
            background: "var(--bg-secondary)",
            borderRadius: "4px",
            border: "1px solid var(--border)",
            fontFamily: "monospace",
          }}>Ctrl/Cmd + ←/→</kbd> 在章节间快速切换</p>
        </div>
      </div>
    </div>
  );
}
