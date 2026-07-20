"use client";

// =============================================================
// 书签管理器（右侧浮动按钮组中的一员）
// -------------------------------------------------------------
// 圆形按钮位于右侧浮动按钮组的最上方，点击向左展开书签列表面板。
// 面板内有「添加当前页」按钮，点击将当前页面 URL 加入书签。
// 下方列表展示最近 20 条书签，点击可跳转，每条可单独删除。
// 数据存储在 localStorage，key 为 "bookmarks"。
// 面板向左弹出（与阅读主题/设置面板方向一致），按 Esc 或点击外部关闭。
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useFloatingButtonVisibility } from "./FloatingButtonVisibility";

const STORAGE_KEY = "bookmarks";
const MAX_BOOKMARKS = 20;

const ROUTE_NAMES = {
  "/py": "Python 入门",
  "/py6": "Python 全解",
  "/py8": "Python 大全",
  "/py9": "Python 逐层深入",
  "/pyfile": "文件操作",
  "/pyfile2": "文件管理",
  "/pykit": "常用知识点",
  "/pynet": "网络编程",
  "/pydb": "数据库操作",
  "/pyweb": "Python Web",
  "/pyweb2": "Web 后端开发",
  "/fastapi": "FastAPI",
  "/pysubprocess": "subprocess 子进程",
  "/pythread": "线程与进程",
  "/pythread2": "多线程入门",
  "/pyprocess": "多进程编程",
  "/pyasync": "asyncio 异步编程",
  "/pyasync2": "asyncio 异步 V2",
  "/pyasync3": "asyncio demo 驱动",
  "/pyeng": "工程化实践",
  "/pyint": "原理图解",
  "/pyrun": "代码执行原理",
  "/pyarch": "设计与架构",
  "/pyproject": "实战项目",
  "/pyjava": "Python vs Java",
  "/pyvsjava": "Python vs Java 深度对比",
  "/pyvsjs": "Python vs JS 深度对比",
  "/py-definitive": "Python 权威指南",
  "/py-backend": "Python Web后端大全",
  "/nodejs": "Node.js 入门",
  "/nodejs2": "Node.js 进阶",
  "/nodejs3": "Node.js 源码",
  "/noderun": "Node.js 运行原理",
  "/reactsrc": "React 源码构建",
  "/vuesrc": "Vue 源码构建",
  "/nodejs-backend": "Node.js Web后端实战",
  "/ts": "TypeScript 入门",
  "/ts2": "TypeScript 进阶",
  "/ts3": "TypeScript 高阶实战",
  "/tsgen": "TS 泛型专题",
  "/workers": "Web Workers",
  "/playground": "代码 Playground",
  "/java": "Java 入门到精通",
  "/java-web": "Java Web 开发",
  "/java-master": "Java 开发详解",
  "/ai": "AI 编程入门",
  "/aiapp": "AI 应用编程",
  "/aipy": "Python AI 开发",
  "/ai-agent": "AI Agent 开发",
  "/nextjs": "Next.js",
  "/sass": "Sass",
  "/fe-engineering": "前端工程化",
  "/fe-interview": "前端面试",
  "/http": "HTTP 通信",
  "/net": "计算机网络",
  "/backend": "后端开发",
  "/backend-essential": "后端开发必备知识",
  "/gql": "GraphQL",
  "/deploy": "部署与运维",
  "/go": "Go 语言",
  "/csharp": "C#",
  "/todo": "Todo List 实战",
  "/blog-tutorial": "Blog 系统教程",
  "/blog": "博客系统",
  "/sql": "数据库开发",
  "/mysql": "MySQL",
  "/postgres": "PostgreSQL",
  "/redis": "Redis",
  "/mongo": "MongoDB",
  "/algo": "编程算法大全",
  "/leetcode": "LeetCode 面试 200 题",
  "/cs": "计算机原理",
  "/howitworks": "代码怎么跑起来",
  "/os": "操作系统",
  "/prog-guide": "编程指南",
  "/future": "程序员出路指南",
  "/career": "职业发展",
  "/career40": "40岁前端出路",
  "/work": "职场生存",
  "/comm": "沟通交流",
  "/psychology": "心向阳光",
  "/nervous": "与紧张和解",
  "/stomach": "脾胃调养",
  "/ibs": "肠易激康复",
  "/dignity": "放不下的愤怒",
  "/hurt": "委屈的解剖学",
  "/chicken-soup": "心灵鸡汤",
  "/relations": "人际关系心理学",
  "/dui": "怼人艺术",
  "/fandui": "反怼心理学",
  "/shield": "回怼护盾",
  "/quotes": "怼人语录",
  "/curse": "毒舌词典",
  "/rebut": "反驳的艺术",
  "/unharmed": "破怒：翻篇指南",
  "/talk-rebut": "谈话绝地反击",
  "/letting-go": "释怀",
  // 补全 BOOK_CATEGORIES 中遗漏的 3 个路由，让书签能显示正确标题
  "/zod-mini": "Zod Mini 实战",
  "/forgerock-mini": "ForgeRock Mini 认证",
  "/betting-activation": "集团账户激活 Demo",
};

function getFullUrl() {
  if (typeof window === "undefined") return "";
  return window.location.href;
}

function getRouteName(pathname) {
  if (!pathname) return "";
  const path = pathname.replace(/\/$/, "") || "/";
  if (ROUTE_NAMES[path]) return ROUTE_NAMES[path];
  const segments = path.split("/").filter(Boolean);
  for (let i = segments.length; i > 0; i--) {
    const sub = "/" + segments.slice(0, i).join("/");
    if (ROUTE_NAMES[sub]) return ROUTE_NAMES[sub];
  }
  return "";
}

function getChapterTitle() {
  if (typeof document === "undefined") return "";
  const h1 = document.querySelector("h1.chapter-main-title, h1");
  if (h1 && h1.textContent) {
    const cleaned = h1.textContent.replace(/^[\s\d\p{Emoji}\p{P}]+/u, "").trim();
    if (cleaned) return cleaned;
  }
  return "";
}

function getPageTitle() {
  if (typeof window === "undefined") return "";
  const pathname = window.location.pathname;
  const routeName = getRouteName(pathname);
  const chapterTitle = getChapterTitle();

  if (routeName && chapterTitle) {
    return `${routeName} · ${chapterTitle}`;
  }
  if (chapterTitle) return chapterTitle;
  if (routeName) return routeName;
  return document.title || "";
}

function loadBookmarks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.slice(0, MAX_BOOKMARKS);
    }
  } catch {}
  return [];
}

function saveBookmarks(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_BOOKMARKS)));
  } catch {}
}

function displayPath(url) {
  try {
    const u = new URL(url);
    return u.pathname + u.search + u.hash || "/";
  } catch {
    return url;
  }
}

function getPathFromUrl(url) {
  try {
    const u = new URL(url);
    return u.pathname;
  } catch {
    return "";
  }
}

function extractShortTitle(fullTitle, url) {
  if (!fullTitle) return displayPath(url);
  const sepMatch = fullTitle.match(/^(.+?)\s[·•]\s(.+)$/);
  if (sepMatch) return sepMatch[2];
  if (fullTitle.includes("交互式教程") || fullTitle.includes("在线编辑运行")) {
    const routeName = getRouteName(getPathFromUrl(url));
    if (routeName) return routeName;
    const path = displayPath(url);
    return path.split("#")[0] || path;
  }
  return fullTitle;
}

function isOldTitleFormat(title) {
  if (!title) return true;
  if (title.includes("·") || title.includes("•")) return false;
  if (title.includes("交互式教程") || title.includes("在线编辑运行")) return true;
  if (title === document.title) return true;
  return false;
}

export default function BookmarkManager() {
  const [open, setOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [addedFlash, setAddedFlash] = useState(false);
  const containerRef = useRef(null);
  const flashTimerRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // 读取「浮动按钮可见性」设置：用户在齿轮设置里关掉书签时，整个按钮不渲染
  const { visibility } = useFloatingButtonVisibility();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBookmarks(loadBookmarks());
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);

    const timer = setTimeout(() => {
      const url = getFullUrl();
      const newTitle = getPageTitle();
      if (!newTitle) return;

      setBookmarks((prev) => {
        const idx = prev.findIndex((b) => b.url === url);
        if (idx === -1) return prev;
        if (prev[idx].title && !isOldTitleFormat(prev[idx].title) && prev[idx].title.includes("·")) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], title: newTitle };
        saveBookmarks(updated);
        return updated;
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const addBookmark = useCallback(() => {
    const url = getFullUrl();
    const title = getPageTitle();
    const now = Date.now();

    setBookmarks((prev) => {
      const filtered = prev.filter((b) => b.url !== url);
      const next = [{ url, title, time: now }, ...filtered].slice(0, MAX_BOOKMARKS);
      saveBookmarks(next);
      return next;
    });

    setAddedFlash(true);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setAddedFlash(false), 600);
  }, []);

  const removeBookmark = useCallback(
    (e, url) => {
      e.stopPropagation();
      e.preventDefault();
      setBookmarks((prev) => {
        const next = prev.filter((b) => b.url !== url);
        saveBookmarks(next);
        return next;
      });
    },
    []
  );

  const goToBookmark = useCallback(
    (url) => {
      try {
        const u = new URL(url);
        router.push(u.pathname + u.search + u.hash);
      } catch {
        router.push(url);
      }
      setOpen(false);
    },
    [router]
  );

  // 隐藏时直接返回 null（所有 hooks 已调用完毕，不会破坏 hooks 顺序）
  if (visibility.bookmark === false) return null;

  const currentUrl = getFullUrl();
  const isCurrentPageBookmarked = bookmarks.some((b) => b.url === currentUrl);

  return (
    <div className="bookmark-corner" ref={containerRef}>
      <button
        className={`bookmark-corner-btn${addedFlash ? " flash" : ""}${open ? " active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        title={isCurrentPageBookmarked ? "书签（当前页已收藏）" : "书签"}
        aria-label="书签"
      >
        <svg
          className="bookmark-corner-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={isCurrentPageBookmarked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {open && (
        <>
          <div className="bookmark-corner-panel">
            <div className="bookmark-corner-header">
              <span className="bookmark-corner-title">书签</span>
              <span className="bookmark-corner-count">
                {bookmarks.length}/{MAX_BOOKMARKS}
              </span>
            </div>

            <button
              className={`bookmark-corner-add${isCurrentPageBookmarked ? " added" : ""}`}
              onClick={addBookmark}
              disabled={isCurrentPageBookmarked}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isCurrentPageBookmarked ? (
                  <polyline points="20 6 9 17 4 12" />
                ) : (
                  <>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </>
                )}
              </svg>
              <span>{isCurrentPageBookmarked ? "已添加到书签" : "添加当前页"}</span>
            </button>

            <div className="bookmark-corner-list">
              {bookmarks.length === 0 ? (
                <div className="bookmark-corner-empty">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ opacity: 0.3, marginBottom: "8px" }}
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>暂无书签</span>
                  <span className="bookmark-corner-empty-hint">点击上方「添加当前页」开始收藏</span>
                </div>
              ) : (
                bookmarks.map((bm) => (
                  <button
                    key={bm.url}
                    className={`bookmark-corner-item${currentUrl === bm.url ? " active" : ""}`}
                    onClick={() => goToBookmark(bm.url)}
                    title={bm.url}
                  >
                    <span className="bookmark-corner-item-icon">
                      {currentUrl === bm.url ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      )}
                    </span>
                    <span className="bookmark-corner-item-info">
                      <span className="bookmark-corner-item-title">
                        {extractShortTitle(bm.title, bm.url)}
                      </span>
                      <span className="bookmark-corner-item-path">
                        {displayPath(bm.url)}
                      </span>
                    </span>
                    <span
                      className="bookmark-corner-item-del"
                      onClick={(e) => removeBookmark(e, bm.url)}
                      title="删除"
                      role="button"
                      tabIndex={0}
                      aria-label="删除书签"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
