"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// =============================================================
// 根路径 / 重定向页面
// -------------------------------------------------------------
// 访问根路径时，自动跳转到上次关闭浏览器时浏览的书籍页面。
// 如果没有记录（首次访问），则默认跳转到 /nodejs（Node.js 入门）。
// 使用客户端 useEffect 做跳转，避免 SSR 期间无法读取 localStorage。
// =============================================================
export default function Home() {
  const router = useRouter();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    let path;
    if (hash) {
      // URL 带有 hash（如 /#chapter-id），说明是旧的 Node.js 入门书签，
      // 始终跳转到 /nodejs 并保留 hash/search
      path = "/nodejs";
    } else {
      // 无 hash：跳转到上次访问的书籍，首次访问默认 /nodejs
      path = "/nodejs";
      try {
        const saved = localStorage.getItem("sidebar:last-book");
        if (saved && saved !== "/") {
          path = saved;
        }
      } catch {}
    }
    const fullUrl = path + search + hash;
    setTarget(path);
    router.replace(fullUrl);
  }, [router]);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      flexDirection: "column",
      gap: "12px",
      fontFamily: "var(--sans)",
      color: "var(--text-secondary)",
      background: "var(--bg)",
    }}>
      <div style={{ fontSize: "32px" }}>📚</div>
      <div style={{ fontSize: "14px" }}>正在跳转到{target ? ` ${target}` : ""}...</div>
    </div>
  );
}
