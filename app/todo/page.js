// =============================================================
// Todo List Demo —— 前后端联调示例
// -------------------------------------------------------------
// 【这个 demo 在做什么】
//   用 Next.js 16 + React 19 写一个待办事项页面，
//   通过 /api/todos/* 调用 FastAPI 后端的 CRUD 接口。
//
// 【架构说明】
//   浏览器  ──>  Next.js (3000)  ──rewrites──>  FastAPI (8000)  ──>  内存列表
//   ↑                                                                       |
//   └─────────────────────────── JSON ────────────────────────────────────┘
//
//   - 浏览器只跟 3000 端口通信（同源，无 CORS 问题）
//   - Next.js 的 rewrites 把 /api/todos/* 代理到 http://127.0.0.1:8000/items/*
//   - FastAPI 那边也开了 CORS 做双保险，前端可以直连 :8000 测试
//
// 【功能】
//   1. 加载列表（首次进入 + 手动刷新）
//   2. 新建事项（输入框 + 添加按钮 + 回车提交）
//   3. 切换完成状态（点击 checkbox）
//   4. 删除事项（点击删除按钮）
//   5. 过滤：全部 / 未完成 / 已完成
//   6. 错误提示 + 加载状态
//
// 【为什么用 'use client'】
//   页面有大量状态管理和事件处理（useState / useEffect / onClick），
//   必须是 Client Component。Next.js 16 默认是 Server Component，
//   文件顶部加 'use client' 切到客户端渲染。
// =============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";

// -------------------------------------------------------------
// API 客户端：把所有跟后端通信的逻辑集中到一个对象里
// -------------------------------------------------------------
// 【为什么封装】
//   1. 路径集中管理，改 API 地址只动一处
//   2. 错误处理统一，不用每个调用点都写 try/catch
//   3. 类型转换 / 字段映射集中做（如果后端字段名跟前端不一致）
//
// 【请求路径】
//   所有请求走 /api/todos/*（Next.js rewrites 代理到 FastAPI /items/*）
const API_BASE = "/api/todos";

// 统一的错误处理：把 fetch 抛出的错误或后端返回的 {detail: "..."} 转成可读字符串
async function handleError(res) {
  // FastAPI 校验失败 / 主动抛错会返回 {detail: "..."} 或 {detail: [...]}
  let detail = `${res.status} ${res.statusText}`;
  try {
    const body = await res.json();
    if (body.detail) {
      // detail 可能是字符串，也可能是 Pydantic 校验错误数组
      detail = typeof body.detail === "string"
        ? body.detail
        : JSON.stringify(body.detail);
    }
  } catch {
    // 响应不是 JSON（如 204 删除成功没 body），用默认 detail
  }
  throw new Error(detail);
}

const api = {
  // 获取事项列表。可选 done 参数过滤完成状态
  async list(done) {
    const url = done === undefined ? API_BASE : `${API_BASE}?done=${done}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) await handleError(res);
    return res.json(); // 返回 [{id, title, done}, ...]
  },

  // 创建事项。POST + JSON body
  async create(title) {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, done: false }),
    });
    if (!res.ok) await handleError(res);
    return res.json(); // 返回 {id, title, done}
  },

  // 更新事项（部分更新）。用 PUT 配合 {done} 或 {title}
  async update(id, patch) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) await handleError(res);
    return res.json();
  },

  // 删除事项。返回 204 无 body
  async remove(id) {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    if (!res.ok) await handleError(res);
    return true;
  },
};

// =============================================================
// 主组件
// =============================================================
export default function TodoPage() {
  // ---------- 状态 ----------
  // items：事项列表，从后端拉取
  const [items, setItems] = useState([]);
  // loading：是否正在加载（用于显示骨架/禁用按钮）
  const [loading, setLoading] = useState(true);
  // error：错误信息（null 表示无错误）
  const [error, setError] = useState(null);
  // newTitle：输入框内容（受控组件）
  const [newTitle, setNewTitle] = useState("");
  // submitting：是否正在提交新增（防止重复点击）
  const [submitting, setSubmitting] = useState(false);
  // filter：当前过滤模式 all / active / done
  const [filter, setFilter] = useState("all");
  // 乐观更新中正在操作的 id 集合（用于禁用对应行的按钮）
  const [pendingIds, setPendingIds] = useState(new Set());

  // ---------- 加载列表 ----------
  // useCallback 包一层，让引用稳定，避免 useEffect 无限循环
  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.list();
      setItems(data);
    } catch (err) {
      // 后端没启动 / 网络错误 / 接口报错都会进到这里
      setError(`加载失败：${err.message}。请确认 FastAPI 后端已启动（默认 http://127.0.0.1:8000）`);
    } finally {
      setLoading(false);
    }
  }, []);

  // 首次挂载时拉取一次
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // ---------- 新建事项 ----------
  async function handleAdd(e) {
    // 阻止表单默认提交（会导致页面刷新）
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return; // 空标题不让提交

    setSubmitting(true);
    setError(null);
    try {
      const created = await api.create(title);
      // 把新事项加到列表开头（最新的在最上面）
      setItems((prev) => [created, ...prev]);
      setNewTitle(""); // 清空输入框
    } catch (err) {
      setError(`创建失败：${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- 切换完成状态 ----------
  // 这里用「乐观更新」：先改 UI，再发请求；失败再回滚。
  // 体验比「等响应再改 UI」好得多，是常见的前端模式。
  async function handleToggle(item) {
    // 标记该 id 正在操作（禁用 checkbox）
    setPendingIds((prev) => new Set(prev).add(item.id));
    setError(null);
    // 先在本地切换 done 状态
    const newDone = !item.done;
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, done: newDone } : it))
    );
    try {
      await api.update(item.id, { done: newDone });
      // 请求成功，无需额外处理（UI 已经更新过了）
    } catch (err) {
      // 失败：回滚 UI
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, done: item.done } : it))
      );
      setError(`更新失败：${err.message}`);
    } finally {
      // 移除该 id 的 pending 标记
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }

  // ---------- 删除事项 ----------
  // 也用乐观更新：先从列表移除，失败再加回来
  async function handleDelete(item) {
    setPendingIds((prev) => new Set(prev).add(item.id));
    setError(null);
    // 备份原列表，失败时用来回滚
    const backup = items;
    setItems((prev) => prev.filter((it) => it.id !== item.id));
    try {
      await api.remove(item.id);
    } catch (err) {
      // 失败：把这条加回列表
      setItems(backup);
      setError(`删除失败：${err.message}`);
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }

  // ---------- 过滤后的列表 ----------
  // filter 不变时，items 不变，useMemo 会缓存结果
  // 这里列表很短，不 memo 也没事，写法上展示一下思路
  const visibleItems = items.filter((it) => {
    if (filter === "active") return !it.done;
    if (filter === "done") return it.done;
    return true;
  });

  // 统计数字
  const activeCount = items.filter((it) => !it.done).length;
  const doneCount = items.length - activeCount;

  // ---------- 渲染 ----------
  return (
    <div className={styles.page}>
      <main className={styles.container}>
        {/* 标题区 */}
        <header className={styles.header}>
          <h1 className={styles.title}>📝 Todo List</h1>
          <p className={styles.subtitle}>
            Next.js 16 前端 + FastAPI 后端联调示例
          </p>
          <p className={styles.hint}>
            前端走 <code>/api/todos/*</code>（Next.js rewrites 代理到 FastAPI
            <code>/items/*</code>）
          </p>
        </header>

        {/* 新建事项表单 */}
        <form onSubmit={handleAdd} className={styles.addForm}>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="输入待办事项，按回车或点添加"
            className={styles.input}
            disabled={submitting}
            maxLength={100}
          />
          <button
            type="submit"
            className={styles.addButton}
            disabled={submitting || !newTitle.trim()}
          >
            {submitting ? "添加中..." : "添加"}
          </button>
        </form>

        {/* 过滤器 + 统计 */}
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            {[
              { key: "all", label: `全部 (${items.length})` },
              { key: "active", label: `未完成 (${activeCount})` },
              { key: "done", label: `已完成 (${doneCount})` },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`${styles.filterBtn} ${
                  filter === f.key ? styles.filterBtnActive : ""
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button onClick={loadItems} className={styles.refreshBtn} disabled={loading}>
            {loading ? "刷新中..." : "↻ 刷新"}
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className={styles.error}>
            ⚠️ {error}
          </div>
        )}

        {/* 列表区 */}
        {loading && items.length === 0 ? (
          // 首次加载
          <div className={styles.empty}>加载中...</div>
        ) : visibleItems.length === 0 ? (
          // 空列表
          <div className={styles.empty}>
            {items.length === 0
              ? "还没有待办事项，添加第一个吧～"
              : "当前过滤条件下没有事项"}
          </div>
        ) : (
          <ul className={styles.list}>
            {visibleItems.map((item) => {
              const isPending = pendingIds.has(item.id);
              return (
                <li
                  key={item.id}
                  className={`${styles.item} ${
                    item.done ? styles.itemDone : ""
                  } ${isPending ? styles.itemPending : ""}`}
                >
                  <label className={styles.checkboxWrap}>
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => handleToggle(item)}
                      disabled={isPending}
                    />
                    <span className={styles.itemTitle}>{item.title}</span>
                  </label>
                  <button
                    onClick={() => handleDelete(item)}
                    className={styles.deleteBtn}
                    disabled={isPending}
                    title="删除"
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* 页脚说明 */}
        <footer className={styles.footer}>
          <p>
            <strong>启动方式：</strong>
          </p>
          <ol>
            <li>
              启动后端：<code>cd fastapi-demo &amp;&amp; pip install -r requirements.txt &amp;&amp; uvicorn main:app --reload</code>
            </li>
            <li>
              启动前端：<code>npm run dev</code>（默认 <code>http://localhost:3000</code>）
            </li>
            <li>
              打开本页：<code>http://localhost:3000/todo</code>
            </li>
          </ol>
        </footer>
      </main>
    </div>
  );
}
