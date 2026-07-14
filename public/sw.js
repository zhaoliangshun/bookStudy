/* ===================================================================
 * BookStudy Service Worker
 * -------------------------------------------------------------------
 * 策略：
 *   1. 安装时预缓存核心路由（首页 + manifest + icon）
 *   2. 静态资源（_next/static, icons, svg）：cache-first，永不淘汰
 *   3. HTML 文档：network-first，失败回退缓存，缓存也没有则回退到首页
 *   4. /api/* 动态接口：永远走网络，离线时返回 503
 *   5. Monaco Editor worker：单独缓存
 * 版本号更新（CACHE_VERSION）会触发新 SW 接管 + 旧缓存清理
 * =================================================================== */

const CACHE_VERSION = "v1.0.0";
const STATIC_CACHE = `bs-static-${CACHE_VERSION}`;
const PAGE_CACHE = `bs-page-${CACHE_VERSION}`;
const RUNTIME_CACHE = `bs-runtime-${CACHE_VERSION}`;

// 预缓存列表：安装时立即拉取并缓存
// 注意：HTML 路由只在 network-first 时使用，预缓存主要用于首页
const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icon.svg",
];

// 需要跳过缓存的路径前缀
const NEVER_CACHE = [
  "/api/",        // 后端接口（Python/Node 沙箱），离线时不可用
  "/_next/webpack-hmr", // HMR websocket
  "/sockjs",      // dev 模式的 sockjs
];

// 静态资源路径前缀（cache-first）
const STATIC_PATTERNS = [
  "/_next/static/",
  "/_next/image",
];

// 安装：预缓存核心 URL，并立即 activate
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      // 用 allSettled 而不是 all：单个 URL 失败不应中断整个安装
      await Promise.allSettled(
        PRECACHE_URLS.map(async (url) => {
          try {
            // { cache: "reload" } 强制走网络，避免命中 HTTP 缓存导致旧内容
            const res = await fetch(url, { cache: "reload" });
            if (res.ok || res.type === "opaque") {
              await cache.put(url, res);
            }
          } catch (e) {
            console.warn("[SW] precache 失败:", url, e.message);
          }
        })
      );
      // 跳过等待，让新 SW 立即接管（开发期尤其需要）
      await self.skipWaiting();
    })()
  );
});

// 激活：清理旧版本缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const validCaches = new Set([STATIC_CACHE, PAGE_CACHE, RUNTIME_CACHE]);
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("bs-") && !validCaches.has(k))
          .map((k) => caches.delete(k))
      );
      // 立即接管所有 client（无需刷新页面）
      await self.clients.claim();
      console.log("[SW] activated", CACHE_VERSION);
    })()
  );
});

// 工具：判断 URL 是否匹配某个前缀
function matchesAny(url, patterns) {
  return patterns.some((p) => url.startsWith(p));
}

// 主拦截逻辑
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 只拦截同源请求
  if (url.origin !== self.location.origin) return;

  // 仅处理 GET，跳过其他方法
  if (req.method !== "GET") return;

  // 跳过 HMR / dev websocket / API（让浏览器走网络，离线时自然失败）
  if (matchesAny(url.pathname, NEVER_CACHE)) {
    return;
  }

  // 1. 静态资源：cache-first
  if (matchesAny(url.pathname, STATIC_PATTERNS)) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // 2. manifest / icon / favicon：cache-first（带更新检查）
  if (
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/icon.svg" ||
    url.pathname === "/favicon.ico"
  ) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // 3. HTML 文档：network-first，失败回退缓存
  const isHTML =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");
  if (isHTML) {
    event.respondWith(networkFirstForHTML(req));
    return;
  }

  // 4. 其他资源（字体、图片等）：stale-while-revalidate
  event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
});

// ---------- cache-first：先查缓存，没有再走网络并写入缓存 ----------
async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && (res.ok || res.type === "opaque")) {
      cache.put(req, res.clone());
    }
    return res;
  } catch (e) {
    // 网络失败且缓存也没有，返回空 Response
    return new Response("", { status: 504 });
  }
}

// ---------- network-first for HTML：先走网络拿最新，失败回缓存 ----------
async function networkFirstForHTML(req) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      // 网络成功，写一份到缓存
      cache.put(req, res.clone());
    }
    return res;
  } catch (e) {
    // 网络失败：先尝试匹配当前 URL 的缓存
    const cached = await cache.match(req);
    if (cached) return cached;
    // 再尝试回退到首页（部分已缓存的资源可能能拼出页面）
    const fallback = await cache.match("/");
    if (fallback) return fallback;
    // 完全没有：返回一个最小离线提示页
    return new Response(
      `<!doctype html><meta charset="utf-8"><title>离线</title>
       <body style="font-family:sans-serif;padding:2rem;text-align:center">
       <h2>当前处于离线状态</h2>
       <p>该页面尚未缓存，请联网访问一次后再离线阅读。</p>
       <p><a href="/">返回首页</a></p>
       </body>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

// ---------- stale-while-revalidate：返回缓存同时后台更新 ----------
async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req)
    .then((res) => {
      if (res && (res.ok || res.type === "opaque")) {
        cache.put(req, res.clone());
      }
      return res;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

// ---------- 消息通信：允许页面主动触发更新 ----------
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
