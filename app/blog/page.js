// =============================================================
// 博客首页
// -------------------------------------------------------------
// 展示最新文章 + 项目介绍
// =============================================================

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { blogApi } from "./_lib/api";

export default function BlogHomePage() {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    blogApi.posts
      .list({ page: 1, page_size: 5 })
      .then((data) => {
        setRecent(data.items);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="blog-home">
      {/* Hero 区 */}
      <section className="hero">
        <h1>📚 Blog Platform</h1>
        <p className="hero-subtitle">
          一个全栈教学项目：Next.js 16 前端 + FastAPI 后端 + MySQL 数据库
        </p>
        <div className="hero-actions">
          <Link href="/blog/posts" className="blog-btn blog-btn-primary">
            浏览文章
          </Link>
          <Link href="/blog/register" className="blog-btn blog-btn-ghost">
            注册账号
          </Link>
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="blog-btn blog-btn-ghost"
          >
            API 文档
          </a>
        </div>
      </section>

      {/* 功能特性 */}
      <section className="features">
        <h2>本项目覆盖的知识点</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>JWT 认证</h3>
            <p>注册、登录、token 管理、权限校验、密码哈希（bcrypt）</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>文章 CRUD</h3>
            <p>创建、编辑、删除、分页、关键词搜索、草稿/发布状态</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>评论树</h3>
            <p>自引用关系、评论回复、递归渲染、级联删除</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏷️</div>
            <h3>多对多标签</h3>
            <p>关联表、文章与标签双向关联、按标签过滤</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗄️</div>
            <h3>SQLAlchemy ORM</h3>
            <p>2.0 风格 Mapped 注解、关系映射、懒加载/预加载</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Next.js 16</h3>
            <p>App Router、Server/Client 组件、rewrites 代理、CSS Modules</p>
          </div>
        </div>
      </section>

      {/* 最新文章 */}
      <section className="recent-posts">
        <h2>最新文章</h2>
        {loading ? (
          <div className="blog-loading">加载中...</div>
        ) : error ? (
          <div className="blog-error">⚠️ {error}</div>
        ) : recent.length === 0 ? (
          <div className="blog-empty">还没有文章</div>
        ) : (
          <div className="post-list">
            {recent.map((post) => (
              <Link
                key={post.id}
                href={`/blog/posts/${post.id}`}
                className="blog-card post-item"
              >
                <h3 className="post-title">{post.title}</h3>
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
      </section>

      {/* 测试账号 */}
      <section className="test-accounts">
        <h2>测试账号</h2>
        <p>种子数据已预置以下账号，可直接登录体验：</p>
        <div className="account-grid">
          <div className="account-card">
            <strong>管理员</strong>
            <code>admin / admin123</code>
          </div>
          <div className="account-card">
            <strong>用户 1</strong>
            <code>alice / alice123</code>
          </div>
          <div className="account-card">
            <strong>用户 2</strong>
            <code>bob / bob123</code>
          </div>
        </div>
      </section>
    </div>
  );
}
