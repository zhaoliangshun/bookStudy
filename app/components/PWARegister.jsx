"use client";

import { useEffect, useRef } from "react";

/**
 * PWA Register
 * -------------------------------------------------------------------
 * 在客户端挂载后注册 Service Worker。
 * - 仅在生产环境注册（dev 模式 SW 容易和 HMR 冲突）
 * - 注册成功后打印版本号，便于调试
 * - 监听 controllerchange 事件，提示用户刷新拿最新内容
 * - 修复：正确清理事件监听器，防止内存泄漏；防止无限刷新循环
 */
export default function PWARegister() {
  const refreshingRef = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;
    let refreshing = false;

    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        if (cancelled) return;
        if (reg.waiting) {
          reg.waiting.postMessage("SKIP_WAITING");
        }
        // 监听新版本接管，提示用户刷新
        navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
      } catch (err) {
        if (!cancelled) {
          console.warn("[PWA] SW 注册失败:", err.message);
        }
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    register();

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  return null;
}
