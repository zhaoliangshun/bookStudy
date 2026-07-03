// 标签列表页

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { blogApi } from "../_lib/api";

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 简单缓存各标签的文章数
  const [counts, setCounts] = useState({});

  useEffect(() => {
    blogApi.tags
      .list()
      .then(async (data) => {
        setTags(data);
        setLoading(false);
        // 并发查每个标签的文章数（教学项目简单实现）
        const results = await Promise.all(
          data.map((t) =>
            fetch(`/api/blog/tags/${t.id}/posts/count`)
              .then((r) => r.json())
              .catch(() => ({ tag_id: t.id, post_count: 0 }))
          )
        );
        const map = {};
        results.forEach((r) => { map[r.tag_id] = r.post_count; });
        setCounts(map);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="blog-loading">加载中...</div>;
  if (error) return <div className="blog-error">⚠️ {error}</div>;

  return (
    <div>
      <h1 style={{ fontSize: 26, margin: "0 0 20px" }}>🏷️ 所有标签</h1>
      {tags.length === 0 ? (
        <div className="blog-empty">还没有标签</div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
        }}>
          {tags.map((t) => (
            <Link
              key={t.id}
              href={`/blog/posts?tag=${t.id}`}
              className="blog-card"
              style={{ display: "block" }}
            >
              <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#0891b2" }}>
                #{t.name}
              </h3>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b", minHeight: 20 }}>
                {t.description || "暂无描述"}
              </p>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                {counts[t.id] ?? 0} 篇文章
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
