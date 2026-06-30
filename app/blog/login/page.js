// =============================================================
// 登录页
// -------------------------------------------------------------
// 流程：表单 → 调 login() → 成功跳首页，失败显示错误
// =============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../_lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      // 登录成功，跳首页（或来源页）
      // 真实项目可以用 query string 记录来源页，登录后跳回去
      router.push("/blog");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card blog-card">
        <h1 className="auth-title">登录</h1>
        <p className="auth-subtitle">用账号密码登录博客平台</p>

        {error && <div className="blog-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="blog-form-group">
            <label className="blog-label">用户名 / 邮箱</label>
            <input
              type="text"
              className="blog-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin 或 admin@blog.dev"
              autoComplete="username"
              required
            />
          </div>
          <div className="blog-form-group">
            <label className="blog-label">密码</label>
            <input
              type="password"
              className="blog-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="blog-btn blog-btn-primary"
            style={{ width: "100%" }}
            disabled={submitting || !username || !password}
          >
            {submitting ? "登录中..." : "登录"}
          </button>
        </form>

        <div className="auth-footer">
          没有账号？<Link href="/blog/register">立即注册</Link>
        </div>

        <div className="auth-hint">
          <p>测试账号（种子数据）：</p>
          <ul>
            <li><code>admin / admin123</code>（管理员）</li>
            <li><code>alice / alice123</code></li>
            <li><code>bob / bob123</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
