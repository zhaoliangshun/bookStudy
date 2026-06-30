// =============================================================
// 编辑文章页
// -------------------------------------------------------------
// 流程：
//   1. 加载文章（带作者权限校验）
//   2. 填充表单
//   3. 提交更新
//   4. 跳回详情页
// 必须是作者本人或管理员才能访问。
// =============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { blogApi } from "../../../_lib/api";
import { useAuth } from "../../../_lib/auth-context";

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [tags, setTags] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 加载文章 + 标签
  useEffect(() => {
    Promise.all([
      blogApi.posts.get(id),
      blogApi.tags.list(),
    ])
      .then(([post, allTags]) => {
        // 权限校验：非作者非管理员跳走
        if (!user || (user.id !== post.author.id && !isAdmin)) {
          router.replace("/blog/posts");
          return;
        }
        setTitle(post.title);
        setSummary(post.summary || "");
        setContent(post.content);
        setIsPublished(post.is_published);
        setSelectedTagIds(post.tags?.map((t) => t.id) || []);
        setTags(allTags);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, user, isAdmin, router]);

  function toggleTag(tid) {
    setSelectedTagIds((prev) =>
      prev.includes(tid) ? prev.filter((t) => t !== tid) : [...prev, tid]
    );
  }

  async function handleSubmit(publish) {
    if (!title.trim() || !content.trim()) {
      setError("标题和正文不能为空");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await blogApi.posts.update(id, {
        title: title.trim(),
        summary: summary.trim() || null,
        content: content,
        is_published: publish,
        tag_ids: selectedTagIds,
      });
      router.push(`/blog/posts/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loading) return <div className="blog-loading">加载中...</div>;
  if (error) return <div className="blog-error">⚠️ {error}</div>;

  return (
    <div className="post-form-page">
      <h1>✏️ 编辑文章</h1>

      {error && <div className="blog-error">⚠️ {error}</div>}

      <div className="blog-form-group">
        <label className="blog-label">标题 *</label>
        <input
          type="text"
          className="blog-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
        />
      </div>

      <div className="blog-form-group">
        <label className="blog-label">摘要</label>
        <input
          type="text"
          className="blog-input"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          maxLength={500}
        />
      </div>

      <div className="blog-form-group">
        <label className="blog-label">正文 *</label>
        <textarea
          className="blog-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ minHeight: 320 }}
          required
        />
      </div>

      <div className="blog-form-group">
        <label className="blog-label">标签</label>
        <div className="tag-checkbox-grid">
          {tags.map((t) => (
            <span
              key={t.id}
              className={`tag-checkbox ${selectedTagIds.includes(t.id) ? "checked" : ""}`}
              onClick={() => toggleTag(t.id)}
            >
              {selectedTagIds.includes(t.id) ? "✓ " : ""}{t.name}
            </span>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button
          className="blog-btn blog-btn-primary"
          onClick={() => handleSubmit(true)}
          disabled={submitting}
        >
          {submitting ? "保存中..." : "💾 保存并发布"}
        </button>
        <button
          className="blog-btn blog-btn-ghost"
          onClick={() => handleSubmit(false)}
          disabled={submitting}
        >
          💾 存为草稿
        </button>
        <Link href={`/blog/posts/${id}`} className="blog-btn blog-btn-ghost">
          取消
        </Link>
      </div>
    </div>
  );
}
