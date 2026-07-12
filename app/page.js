"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    let path;
    if (hash) {
      path = "/nodejs";
    } else {
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
      gap: "16px",
      fontFamily: "var(--sans)",
      color: "var(--text-secondary)",
      background: "var(--bg)",
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>
      <div className="loading-spinner"></div>
      <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)" }}>📚 编程学习平台</div>
      <div style={{ fontSize: "14px" }}>正在跳转到{target ? ` ${target}` : ""}...</div>
    </div>
  );
}
