// =============================================================
// 文章列表页
// -------------------------------------------------------------
// 功能：分页浏览、关键词搜索、按标签过滤
// =============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { blogApi } from "../_lib/api";

export default function PostsPage() {
  // 列表数据
  const [data, setData] = useState({ items: [], total: 0, page: 1, page_size: 10, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 过滤条件
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState(""); // 输入框即时值，按回车才提交搜索
  const [tagId, setTagId] = useState(null);

  // 标签列表
  const [tags, setTags] = useState([]);

  // 加载标签（一次性）
  useEffect(() => {
    blogApi.tags.list().then(setTags).catch(() => {});
  }, []);

  // 加载文章列表
  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await blogApi.posts.list({
        page,
        page_size: 10,
        keyword: keyword || undefined,
        tag_id: tagId || undefined,
      });
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, keyword, tagId]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // 搜索：按回车触发
  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    setKeyword(searchInput.trim());
  }

  // 切换标签过滤
  function toggleTag(id) {
    setPage(1);
    setTagId((prev) => (prev === id ? null : id));
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, margin: "0 0 20px" }}>📝 所有文章</h1>

      {/* 工具栏：搜索框 */}
      <form className="posts-toolbar" onSubmit={handleSearch}>
        <input
          type="text"
          className="posts-search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="搜索文章标题或摘要，按回车..."
        />
        <button type="submit" className="blog-btn blog-btn-ghost">
          搜索
        </button>
        {keyword && (
          <button
            type="button"
            className="blog-btn blog-btn-ghost blog-btn-sm"
            onClick={() => {
              setKeyword("");
              setSearchInput("");
              setPage(1);
            }}
          >
            ✕ 清除
          </button>
        )}
      </form>

      {/* 标签过滤 */}
      {tags.length > 0 && (
        <div className="tag-filter">
          <span style={{ fontSize: 13, color: "#64748b", marginRight: 4 }}>标签：</span>
          {tags.map((t) => (
            <span
              key={t.id}
              className={`tag-filter-item ${tagId === t.id ? "active" : ""}`}
              onClick={() => toggleTag(t.id)}
            >
              {t.name}
            </span>
          ))}
        </div>
      )}

      {/* 列表 */}
      {loading ? (
        <div className="blog-loading">加载中...</div>
      ) : error ? (
        <div className="blog-error">⚠️ {error}</div>
      ) : data.items.length === 0 ? (
        <div className="blog-empty">
          {keyword || tagId ? "没有符合条件的文章" : "还没有文章，去写第一篇吧～"}
        </div>
      ) : (
        <div className="post-list">
          {data.items.map((post) => (
            <Link
              key={post.id}
              href={`/blog/posts/${post.id}`}
              className="blog-card post-item"
            >
              <h3 className="post-title">
                {post.title}
                {!post.is_published && <span className="draft-badge">草稿</span>}
              </h3>
              {post.summary && <p className="post-summary">{post.summary}</p>}
              <div className="post-meta">
                <span>✍️ {post.author.username}</span>
                <span>👁️ {post.view_count}</span>
                <span>💬 {post.comment_count}</span>
                <span>🕒 {new Date(post.created_at).toLocaleDateString("zh-CN")}</span>
              </div>
              {post.tags?.length > 0 && (
                <div className="post-tags">
                  {post.tags.map((t) => (
                    <span key={t.id} className="blog-tag">
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* 分页 */}
      {data.total_pages > 1 && (
        <div className="blog-pagination">
          <button
            className="page-btn"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            ← 上一页
          </button>
          <span className="page-info">
            第 {page} / {data.total_pages} 页（共 {data.total} 篇）
          </span>
          <button
            className="page-btn"
            disabled={page >= data.total_pages}
            onClick={() => setPage(page + 1)}
          >
            下一页 →
          </button>
        </div>
      )}
    </div>
  );
}
