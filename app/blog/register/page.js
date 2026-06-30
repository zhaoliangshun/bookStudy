// =============================================================
// 注册页
// -------------------------------------------------------------
// 流程：表单 → 调 register()（注册后自动登录）→ 跳首页
// =============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../_lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // 前端基础校验：密码长度
    if (password.length < 6) {
      setError("密码至少 6 位");
      return;
    }
    // 前端基础校验：两次密码一致
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setSubmitting(true);
    try {
      // register 内部会自动调 login，注册完直接登录态
      await register(username.trim(), email.trim(), password);
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
        <h1 className="auth-title">注册</h1>
        <p className="auth-subtitle">创建账号开始写作</p>

        {error && <div className="blog-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="blog-form-group">
            <label className="blog-label">用户名</label>
            <input
              type="text"
              className="blog-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="3-50 字符"
              minLength={3}
              maxLength={50}
              autoComplete="username"
              required
            />
          </div>
          <div className="blog-form-group">
            <label className="blog-label">邮箱</label>
            <input
              type="email"
              className="blog-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
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
              minLength={6}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="blog-form-group">
            <label className="blog-label">确认密码</label>
            <input
              type="password"
              className="blog-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再输入一次"
              minLength={6}
              autoComplete="new-password"
              required
            />
          </div>
          <button
            type="submit"
            className="blog-btn blog-btn-primary"
            style={{ width: "100%" }}
            disabled={submitting || !username || !email || !password}
          >
            {submitting ? "注册中..." : "注册"}
          </button>
        </form>

        <div className="auth-footer">
          已有账号？<Link href="/blog/login">直接登录</Link>
        </div>
      </div>
    </div>
  );
}
