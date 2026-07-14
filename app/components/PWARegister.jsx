"use client";

import { useEffect } from "react";

/**
 * PWA Register
 * -------------------------------------------------------------------
 * 在客户端挂载后注册 Service Worker。
 * - 仅在生产环境注册（dev 模式 SW 容易和 HMR 冲突）
 * - 注册成功后打印版本号，便于调试
 * - 监听 controllerupdate 事件，提示用户刷新拿最新内容
 */
export default function PWARegister() {
  useEffect(() => {
    // dev 模式下不注册：避免 SW 缓存干扰 HMR
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          // updateViaCache: "none" 确保每次都拉取最新 sw.js
          updateViaCache: "none",
        });
        if (reg.waiting) {
          // 有新版本在等待，主动跳过等待让用户尽快拿到新内容
          reg.waiting.postMessage("SKIP_WAITING");
        }
        // 监听新版本接管，提示用户刷新
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });
      } catch (err) {
        console.warn("[PWA] SW 注册失败:", err.message);
      }
    };

    register();
  }, []);

  return null;
}
