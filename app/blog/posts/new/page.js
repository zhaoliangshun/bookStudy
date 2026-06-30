// =============================================================
// 写新文章页
// -------------------------------------------------------------
// 流程：填表单 → 调 create() → 成功跳详情页
// 必须登录。未登录会自动跳到登录页。
// =============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { blogApi } from "../../_lib/api";
import { useAuth } from "../../_lib/auth-context";

export default function NewPostPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [tags, setTags] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // 加载标签
  useEffect(() => {
    blogApi.tags.list().then(setTags).catch(() => {});
  }, []);

  // 未登录跳转
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/blog/login");
    }
  }, [authLoading, user, router]);

  function toggleTag(id) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
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
      const created = await blogApi.posts.create({
        title: title.trim(),
        summary: summary.trim() || null,
        content: content,
        is_published: publish,
        tag_ids: selectedTagIds,
      });
      router.push(`/blog/posts/${created.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) return <div className="blog-loading">加载中...</div>;
  if (!user) return null;

  return (
    <div className="post-form-page">
      <h1>✍️ 写新文章</h1>

      {error && <div className="blog-error">⚠️ {error}</div>}

      <div className="blog-form-group">
        <label className="blog-label">标题 *</label>
        <input
          type="text"
          className="blog-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="文章标题（最多 200 字）"
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
          placeholder="一句话简介，留空则不显示"
        />
      </div>

      <div className="blog-form-group">
        <label className="blog-label">正文 *</label>
        <textarea
          className="blog-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={"支持 Markdown 风格的纯文本\n# 一级标题\n## 二级标题\n正文内容..."}
          style={{ minHeight: 320 }}
          required
        />
      </div>

      <div className="blog-form-group">
        <label className="blog-label">标签</label>
        {tags.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 13 }}>暂无标签</p>
        ) : (
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
        )}
      </div>

      <div className="form-actions">
        <button
          className="blog-btn blog-btn-primary"
          onClick={() => handleSubmit(true)}
          disabled={submitting || !title.trim() || !content.trim()}
        >
          {submitting ? "保存中..." : "📤 发布"}
        </button>
        <button
          className="blog-btn blog-btn-ghost"
          onClick={() => handleSubmit(false)}
          disabled={submitting || !title.trim() || !content.trim()}
        >
          💾 存为草稿
        </button>
        <Link href="/blog/posts" className="blog-btn blog-btn-ghost">
          取消
        </Link>
      </div>
    </div>
  );
}
