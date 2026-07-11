"use client";

// =============================================================
// 书签管理器（右上角悬浮按钮）
// -------------------------------------------------------------
// 圆形按钮显示书签图标 📑，点击展开面板。
// 面板顶部有「添加当前页」按钮，点击将当前页面 URL 加入书签。
// 下方列表展示最近 20 条书签，点击可跳转，每条可单独删除。
// 数据存储在 localStorage，key 为 "bookmarks"。
// =============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const STORAGE_KEY = "bookmarks";
const MAX_BOOKMARKS = 20;

function getFullUrl() {
  if (typeof window === "undefined") return "";
  return window.location.href;
}

function getPageTitle() {
  if (typeof document === "undefined") return "";
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

// 截取 URL 中 pathname 部分用于显示（去掉协议和域名）
function displayPath(url) {
  try {
    const u = new URL(url);
    return u.pathname + u.search + u.hash || "/";
  } catch {
    return url;
  }
}

export default function BookmarkManager() {
  const [open, setOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [addedFlash, setAddedFlash] = useState(false);
  const panelRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 初始化加载书签
  useEffect(() => {
    setBookmarks(loadBookmarks());
  }, []);

  // 路径变化时重新加载（确保多标签页同步）
  useEffect(() => {
    setBookmarks(loadBookmarks());
  }, [pathname, searchParams]);

  // 点击外部关闭面板
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // 添加当前页为书签
  const addBookmark = useCallback(() => {
    const url = getFullUrl();
    const title = getPageTitle();
    const now = Date.now();

    setBookmarks((prev) => {
      // 去重：如果 URL 已存在，移除旧的
      const filtered = prev.filter((b) => b.url !== url);
      const next = [{ url, title, time: now }, ...filtered].slice(0, MAX_BOOKMARKS);
      saveBookmarks(next);
      return next;
    });

    // 闪烁反馈
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 600);
  }, []);

  // 删除单个书签
  const removeBookmark = useCallback(
    (e, url) => {
      e.stopPropagation();
      setBookmarks((prev) => {
        const next = prev.filter((b) => b.url !== url);
        saveBookmarks(next);
        return next;
      });
    },
    []
  );

  // 跳转到书签
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

  const currentUrl = getFullUrl();
  const isCurrentPageBookmarked = bookmarks.some((b) => b.url === currentUrl);

  return (
    <div className="floating-bookmark" ref={panelRef}>
      <button
        className={`floating-bookmark-btn${addedFlash ? " flash" : ""}`}
        onClick={() => setOpen((v) => !v)}
        title="书签"
        aria-label="书签"
      >
        <span className="floating-bookmark-btn-icon">
          {isCurrentPageBookmarked ? "🔖" : "📑"}
        </span>
      </button>

      {open && (
        <div className="floating-bookmark-panel">
          <div className="floating-bookmark-panel-header">
            <span>书签</span>
            <span className="floating-bookmark-count">
              {bookmarks.length}/{MAX_BOOKMARKS}
            </span>
          </div>

          {/* 添加当前页按钮 */}
          <button
            className="floating-bookmark-add-btn"
            onClick={addBookmark}
            disabled={isCurrentPageBookmarked}
          >
            <span className="floating-bookmark-add-icon">＋</span>
            <span className="floating-bookmark-add-text">
              {isCurrentPageBookmarked ? "已在书签中" : "添加当前页"}
            </span>
          </button>

          {/* 书签列表 */}
          <div className="floating-bookmark-list">
            {bookmarks.length === 0 ? (
              <div className="floating-bookmark-empty">暂无书签</div>
            ) : (
              bookmarks.map((bm) => (
                <div
                  key={bm.url}
                  role="button"
                  tabIndex={0}
                  className={`floating-bookmark-item${currentUrl === bm.url ? " active" : ""}`}
                  onClick={() => goToBookmark(bm.url)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goToBookmark(bm.url);
                    }
                  }}
                  title={bm.url}
                >
                  <span className="floating-bookmark-item-icon">
                    {currentUrl === bm.url ? "📍" : "🔗"}
                  </span>
                  <span className="floating-bookmark-item-info">
                    <span className="floating-bookmark-item-title">
                      {bm.title || displayPath(bm.url)}
                    </span>
                    <span className="floating-bookmark-item-path">
                      {displayPath(bm.url)}
                    </span>
                  </span>
                  <button
                    className="floating-bookmark-item-del"
                    onClick={(e) => removeBookmark(e, bm.url)}
                    title="删除此书签"
                    aria-label="删除书签"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}