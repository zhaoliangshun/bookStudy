// =============================================================
// Blog Platform —— Auth Context
// -------------------------------------------------------------
// 【这个文件在做什么】
//   提供全局的「当前登录用户」状态，让任何组件都能拿到 / 修改登录态。
//   用 React Context + useReducer 实现，避免把 user prop 一层层传。
//
// 【典型用法】
//   // 在根布局包一层 Provider
//   <AuthProvider><App /></AuthProvider>
//
//   // 在任何子组件里读取
//   const { user, login, logout, loading } = useAuth();
//
// 【为什么用 Context 而不是全局变量】
//   1. 响应式：状态变了，用到的组件自动重新渲染
//   2. 作用域隔离：不同 Provider 实例互不干扰
//   3. 测试友好：测试时可以包一层 mock Provider
// =============================================================

"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { blogApi, getToken, getStoredUser, setAuth, clearAuth } from "./api";

// ---------- Context 定义 ----------
const AuthContext = createContext(null);

// ---------- Provider 组件 ----------
export function AuthProvider({ children }) {
  // user：当前登录用户对象，null 表示未登录
  // 用 getStoredUser() 初始化，首屏直接用 localStorage 里的缓存，
  // 避免未登录用户也能看到「登录中...」一闪而过
  const [user, setUser] = useState(null);
  // loading：是否正在初始化（首次进页面时会调 /auth/me 验证 token）
  const [loading, setLoading] = useState(true);

  // ---------- 初始化：进入页面时验证 token ----------
  useEffect(() => {
    let cancelled = false;
    async function init() {
      const token = getToken();
      const stored = getStoredUser();
      // 先用缓存填上，避免闪烁
      if (stored) setUser(stored);
      if (!token) {
        // 没登录，结束
        setLoading(false);
        return;
      }
      try {
        // 有 token，调 /auth/me 验证 + 拿最新用户信息
        const fresh = await blogApi.auth.me();
        if (cancelled) return;
        setUser(fresh);
        setAuth(token, fresh); // 更新缓存
      } catch {
        // token 失效，清掉
        if (cancelled) return;
        clearAuth();
        setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  // ---------- 登录 ----------
  const login = useCallback(async (username, password) => {
    const data = await blogApi.auth.login({ username, password });
    // data = { access_token, token_type, user }
    setAuth(data.access_token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  // ---------- 注册（注册后自动登录） ----------
  const register = useCallback(async (username, email, password) => {
    await blogApi.auth.register({ username, email, password });
    // 注册成功后自动登录，提升体验
    return login(username, password);
  }, [login]);

  // ---------- 登出 ----------
  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  // ---------- 更新用户信息 ----------
  const updateUser = useCallback((updater) => {
    setUser((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const token = getToken();
      if (token && next) setAuth(token, next);
      return next;
    });
  }, []);

  const value = {
    user,
    loading,
    isLogin: !!user,
    isAdmin: !!user?.is_admin,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------- useAuth hook ----------
// 必须在 Provider 内部使用，否则抛错（早暴露问题）
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error("useAuth 必须在 <AuthProvider> 内部使用");
  }
  return ctx;
}
