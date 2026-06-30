// 用户中心页：显示当前用户信息 + 我写的文章

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../_lib/auth-context";
import { blogApi } from "../_lib/api";

export default function MePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // 未登录跳走
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/blog/login");
    }
  }, [authLoading, user, router]);

  // 加载我写的文章（包括草稿）
  useEffect(() => {
    if (!user) return;
    blogApi.posts
      .list({ author_id: user.id, page: 1, page_size: 50 })
      .then((data) => {
        setMyPosts(data.items);
        setLoadingPosts(false);
      })
      .catch(() => setLoadingPosts(false));
  }, [user]);

  if (authLoading || !user) return <div className="blog-loading">加载中...</div>;

  return (
    <div className="profile-page">
      <div className="profile-header blog-card">
        <div className="profile-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            user.username[0].toUpperCase()
          )}
        </div>
        <div className="profile-info">
          <h1>
            {user.username}
            {user.is_admin && <span className="blog-tag" style={{ background: "#fef3c7", color: "#92400e", marginLeft: 8 }}>管理员</span>}
          </h1>
          <p>{user.email}</p>
          {user.bio && <p style={{ marginTop: 4 }}>{user.bio}</p>}
          <p style={{ marginTop: 4, fontSize: 12 }}>
            注册于 {new Date(user.created_at).toLocaleDateString("zh-CN")}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <Link href="/blog/posts/new" className="blog-btn blog-btn-primary">✍️ 写新文章</Link>
        <button
          className="blog-btn blog-btn-ghost"
          onClick={() => {
            logout();
            router.push("/blog");
          }}
        >
          登出
        </button>
      </div>

      <h2 style={{ fontSize: 18, margin: "0 0 12px" }}>我写的文章（{myPosts.length}）</h2>

      {loadingPosts ? (
        <div className="blog-loading">加载中...</div>
      ) : myPosts.length === 0 ? (
        <div className="blog-empty">还没写过文章</div>
      ) : (
        <div className="my-posts-list">
          {myPosts.map((p) => (
            <div key={p.id} className="my-post-item">
              <div className="my-post-info">
                <Link href={`/blog/posts/${p.id}`} className="my-post-title">
                  {p.title}
                  {!p.is_published && <span className="draft-badge">草稿</span>}
                </Link>
                <div className="my-post-meta">
                  {p.view_count} 浏览 · {p.comment_count} 评论 · {new Date(p.created_at).toLocaleDateString("zh-CN")}
                </div>
              </div>
              <Link href={`/blog/posts/${p.id}/edit`} className="blog-btn blog-btn-ghost blog-btn-sm">
                编辑
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
