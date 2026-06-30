// =============================================================
// Blog Platform —— 前端 API 客户端
// -------------------------------------------------------------
// 【这个文件在做什么】
//   把所有跟后端通信的逻辑集中到一个对象 `blogApi` 里，
//   包括：请求封装、token 管理、错误处理、各资源的 CRUD 方法。
//
// 【为什么封装】
//   1. 路径集中：后端地址变了只改一处
//   2. token 自动带上：登录后所有请求自动加 Authorization 头
//   3. 错误统一处理：401 自动跳登录、统一抛 Error
//   4. 类型清晰：每个方法的参数和返回值都有注释
//
// 【请求路径】
//   所有请求走 /api/blog/*（Next.js rewrites 代理到 FastAPI /api/blog/*）
//   浏览器只跟同源 3000 端口通信，没有跨域问题。
// =============================================================

// ---------- Token 存储 ----------
// 【为什么用 localStorage 而不是 cookie】
//   1. 简单：localStorage 不会被自动发送，前端代码完全控制
//   2. 跨域友好：cookie 跨域要配 SameSite/Credentials，麻烦
//   3. 教学场景清晰：能直接看到 token 在哪
//
// 【安全提示】
//   生产环境推荐用 httpOnly cookie 存 token，避免 XSS 偷取。
//   localStorage 里的 token 能被 JS 读到，XSS 攻击可以偷走。
//   本 demo 优先简单清晰，安全方面在 README 里说明。
const TOKEN_KEY = "blog_token";
const USER_KEY = "blog_user";

/** 读取 token（同步） */
export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** 保存 token + 用户信息 */
export function setAuth(token, user) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** 清除登录信息（登出） */
export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** 读取已存的用户信息（同步，用于首屏避免闪烁） */
export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ---------- 请求核心 ----------
// 【为什么不用 axios】
//   原生 fetch 够用，少一个依赖。fetch 在现代浏览器和 Node.js 都支持。
//   封装一层处理：JSON 序列化、token、错误。
const API_BASE = "/api/blog";

// 统一错误处理：把后端的 {detail} 或网络错误转成可读字符串
async function parseError(res) {
  let detail = `${res.status} ${res.statusText}`;
  try {
    const body = await res.json();
    if (body.detail) {
      detail = typeof body.detail === "string"
        ? body.detail
        : (Array.isArray(body.detail)
            ? body.detail.map(e => e.msg || JSON.stringify(e)).join("; ")
            : JSON.stringify(body.detail));
    }
  } catch {
    // 响应不是 JSON
  }
  return detail;
}

// 核心 fetch 封装
async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;

  // 默认 headers
  const headers = { ...(options.headers || {}) };

  // 如果 body 是对象，转成 JSON 并设置 Content-Type
  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  // 带 token：登录/注册接口本身不需要，但带上也无妨
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 发请求
  let res;
  try {
    res = await fetch(url, { ...options, headers, cache: "no-store" });
  } catch (err) {
    // 网络错误（后端没启动、DNS 解析失败等）
    throw new Error(`网络错误：${err.message}。请确认后端已启动（默认 http://127.0.0.1:8000）`);
  }

  // 401：token 失效或没登录，清掉本地登录信息
  // 不在这里直接跳转，让调用方决定（避免循环跳转）
  if (res.status === 401) {
    clearAuth();
    const detail = await parseError(res);
    const err = new Error(detail || "未登录或登录已过期");
    err.status = 401;
    throw err;
  }

  // 其他错误
  if (!res.ok) {
    const detail = await parseError(res);
    throw new Error(detail);
  }

  // 204 无内容（DELETE 接口）
  if (res.status === 204) {
    return null;
  }

  // 解析 JSON
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ---------- 便捷方法 ----------
const get = (path, params) => {
  // 把 params 拼到 query string
  if (params) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        sp.append(k, v);
      }
    });
    const qs = sp.toString();
    if (qs) path = `${path}?${qs}`;
  }
  return request(path, { method: "GET" });
};

const post = (path, body) => request(path, { method: "POST", body });
const put = (path, body) => request(path, { method: "PUT", body });
const del = (path) => request(path, { method: "DELETE" });

// =============================================================
// 各资源 API
// =============================================================
export const blogApi = {
  // ---------- 认证 ----------
  auth: {
    /** 注册 */
    register: (data) => post("/auth/register", data),
    /** 登录，返回 {access_token, user} */
    login: (data) => post("/auth/login", data),
    /** 获取当前用户信息 */
    me: () => get("/auth/me"),
    /** 更新当前用户资料 */
    updateMe: (data) => put("/auth/me", data),
  },

  // ---------- 文章 ----------
  posts: {
    /**
     * 文章列表（分页）
     * @param {Object} params - { page, page_size, tag_id, author_id, keyword }
     * @returns {Promise<{items, total, page, page_size, total_pages}>}
     */
    list: (params = {}) => get("/posts", params),
    /** 文章详情（含评论树） */
    get: (id) => get(`/posts/${id}`),
    /** 创建文章 */
    create: (data) => post("/posts", data),
    /** 更新文章 */
    update: (id, data) => put(`/posts/${id}`, data),
    /** 删除文章 */
    remove: (id) => del(`/posts/${id}`),
  },

  // ---------- 评论 ----------
  comments: {
    /** 获取某文章的评论树 */
    listByPost: (postId) => get(`/comments/post/${postId}`),
    /** 创建评论（post_id 走 query string） */
    create: (postId, data) => {
      const path = `/comments?post_id=${postId}`;
      return request(path, { method: "POST", body: data });
    },
    /** 更新评论（content 走 query string） */
    update: (id, content) => {
      const path = `/comments/${id}?content=${encodeURIComponent(content)}`;
      return request(path, { method: "PUT" });
    },
    /** 删除评论 */
    remove: (id) => del(`/comments/${id}`),
  },

  // ---------- 标签 ----------
  tags: {
    /** 标签列表 */
    list: () => get("/tags"),
    /** 创建标签 */
    create: (data) => post("/tags", data),
    /** 删除标签 */
    remove: (id) => del(`/tags/${id}`),
  },
};
