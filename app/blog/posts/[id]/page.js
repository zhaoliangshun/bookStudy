// =============================================================
// 文章详情页
// -------------------------------------------------------------
// 功能：
//   1. 显示文章标题、作者、时间、正文、标签
//   2. 显示评论树（含回复）
//   3. 登录用户可以发评论、回复评论、删除自己的评论
//   4. 作者/管理员可以编辑、删除文章
// =============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { blogApi } from "../../_lib/api";
import { useAuth } from "../../_lib/auth-context";
import CommentTree from "../../_components/CommentTree";

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLogin, isAdmin } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 新评论输入
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadPost = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await blogApi.posts.get(id);
      setPost(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  // 发表顶级评论
  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await blogApi.comments.create(id, { content: newComment.trim() });
      setNewComment("");
      // 重新加载文章（拿到新评论）
      await loadPost();
    } catch (err) {
      alert("评论失败：" + err.message);
    } finally {
      setSubmittingComment(false);
    }
  }

  // 删除文章
  async function handleDeletePost() {
    if (!confirm("确定删除这篇文章吗？此操作不可撤销。")) return;
    try {
      await blogApi.posts.remove(id);
      router.push("/blog/posts");
    } catch (err) {
      alert("删除失败：" + err.message);
    }
  }

  // 评论创建/删除后的回调：重新加载
  async function onCommentChanged() {
    await loadPost();
  }

  if (loading) return <div className="blog-loading">加载中...</div>;
  if (error) return <div className="blog-error">⚠️ {error}</div>;
  if (!post) return <div className="blog-empty">文章不存在</div>;

  const isAuthor = user && user.id === post.author.id;
  const canEdit = isAuthor || isAdmin;

  return (
    <div>
      <div className="post-detail">
        <h1>{post.title}</h1>

        <div className="post-detail-meta">
          <span>✍️ <Link href={`/blog/users/${post.author.id}`}>{post.author.username}</Link></span>
          <span>🕒 {new Date(post.created_at).toLocaleString("zh-CN")}</span>
          {post.updated_at !== post.created_at && (
            <span>✏️ 更新于 {new Date(post.updated_at).toLocaleString("zh-CN")}</span>
          )}
          <span>👁️ {post.view_count} 次浏览</span>
          <span>💬 {post.comment_count} 条评论</span>
        </div>

        {post.tags?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            {post.tags.map((t) => (
              <span key={t.id} className="blog-tag">{t.name}</span>
            ))}
          </div>
        )}

        <div className="post-detail-content">{post.content}</div>

        {canEdit && (
          <div className="post-detail-actions">
            <Link href={`/blog/posts/${post.id}/edit`} className="blog-btn blog-btn-ghost">
              ✏️ 编辑
            </Link>
            <button onClick={handleDeletePost} className="blog-btn blog-btn-danger">
              🗑️ 删除
            </button>
          </div>
        )}
      </div>

      {/* 评论区 */}
      <div className="comments-section">
        <h2>💬 评论（{post.comment_count}）</h2>

        {isLogin ? (
          <form className="comment-form" onSubmit={handleAddComment}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写下你的评论..."
              maxLength={2000}
              required
            />
            <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                className="blog-btn blog-btn-primary"
                disabled={submittingComment || !newComment.trim()}
              >
                {submittingComment ? "发送中..." : "发表评论"}
              </button>
            </div>
          </form>
        ) : (
          <div className="blog-card" style={{ textAlign: "center", marginBottom: 20 }}>
            <p style={{ margin: 0, color: "#64748b" }}>
              <Link href="/blog/login" style={{ color: "#2563eb" }}>登录</Link> 后才能评论
            </p>
          </div>
        )}

        {/* 评论树 */}
        {post.comments?.length > 0 ? (
          <ul className="comment-list">
            {post.comments.map((c) => (
              <CommentTree
                key={c.id}
                comment={c}
                postId={post.id}
                currentUserId={user?.id}
                isAdmin={isAdmin}
                onChanged={onCommentChanged}
              />
            ))}
          </ul>
        ) : (
          <div className="blog-empty" style={{ padding: 30 }}>
            还没有评论，来说两句吧～
          </div>
        )}
      </div>
    </div>
  );
}
