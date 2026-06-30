// =============================================================
// 评论树组件（递归）
// -------------------------------------------------------------
// 【为什么要递归】
//   评论可以回复评论，回复也是评论，理论上无限嵌套。
//   用递归组件最自然：每个 CommentTree 渲染一条评论 + 它的回复列表，
//   回复列表里每条又是一个 CommentTree。
//
// 【功能】
//   - 显示评论内容、作者、时间
//   - 登录用户可以点「回复」展开回复框
//   - 作者本人/管理员可以删除
// =============================================================

"use client";

import { useState } from "react";
import { blogApi } from "../_lib/api";

export default function CommentTree({ comment, postId, currentUserId, isAdmin, onChanged }) {
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canDelete = currentUserId && (currentUserId === comment.author.id || isAdmin);

  async function handleReply(e) {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      await blogApi.comments.create(postId, {
        content: replyContent.trim(),
        parent_id: comment.id,
      });
      setReplyContent("");
      setReplying(false);
      await onChanged();
    } catch (err) {
      alert("回复失败：" + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("确定删除这条评论吗？回复也会一起删除。")) return;
    try {
      await blogApi.comments.remove(comment.id);
      await onChanged();
    } catch (err) {
      alert("删除失败：" + err.message);
    }
  }

  return (
    <li className="comment-item">
      <div className="comment-header">
        <span className="blog-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>
          {comment.author.avatar ? (
            <img src={comment.author.avatar} alt={comment.author.username} />
          ) : (
            comment.author.username[0].toUpperCase()
          )}
        </span>
        <span className="comment-author">{comment.author.username}</span>
        <span className="comment-time">
          {new Date(comment.created_at).toLocaleString("zh-CN")}
        </span>
      </div>

      <div className="comment-content">{comment.content}</div>

      <div className="comment-actions">
        {currentUserId && (
          <button
            className="blog-btn blog-btn-ghost blog-btn-sm"
            onClick={() => setReplying(!replying)}
          >
            💬 回复
          </button>
        )}
        {canDelete && (
          <button
            className="blog-btn blog-btn-danger blog-btn-sm"
            onClick={handleDelete}
          >
            🗑️ 删除
          </button>
        )}
      </div>

      {/* 回复框 */}
      {replying && (
        <form className="reply-form" onSubmit={handleReply}>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={`回复 @${comment.author.username}...`}
            maxLength={2000}
            required
          />
          <div style={{ marginTop: 6, display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              type="button"
              className="blog-btn blog-btn-ghost blog-btn-sm"
              onClick={() => { setReplying(false); setReplyContent(""); }}
            >
              取消
            </button>
            <button
              type="submit"
              className="blog-btn blog-btn-primary blog-btn-sm"
              disabled={submitting || !replyContent.trim()}
            >
              {submitting ? "发送中..." : "回复"}
            </button>
          </div>
        </form>
      )}

      {/* 递归渲染回复 */}
      {comment.replies?.length > 0 && (
        <ul className="comment-list comment-replies">
          {comment.replies.map((r) => (
            <CommentTree
              key={r.id}
              comment={r}
              postId={postId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onChanged={onChanged}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
