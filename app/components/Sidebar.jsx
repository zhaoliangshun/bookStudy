"use client";

// =============================================================
// 通用侧边栏组件 —— 全局共享
// -------------------------------------------------------------
// 功能：
//   1. 章节目录导航（分组展示、高亮当前章节）
//   2. 可收起 / 展开（桌面端点击 ✕ 收起，点击浮动按钮展开）
//   3. 可拖拽调整宽度（200px ~ 480px，双击恢复默认 280px）
//   4. 移动端抽屉式（通过 sidebarOpen 控制）
//   5. Ctrl+B 快捷键切换侧边栏（类似 VS Code）
//      - 桌面端：切换 collapsed（收起 / 展开侧边栏）
//      - 移动端：调用 onToggleSidebar 切换抽屉（需父组件传入该 prop）
//      - 在输入框 / 编辑器内同样生效，并阻止浏览器默认粗体行为
//
// 用法：
//   <Sidebar
//     title="学习目录"
//     tip="点击章节开始学习"
//     footer={<p>💡 提示</p>}
//     groupedChapters={groupedChapters}
//     activeId={activeId}
//     onSelectChapter={selectChapter}
//     sidebarOpen={sidebarOpen}
//     onCloseSidebar={() => setSidebarOpen(false)}
//     onToggleSidebar={() => setSidebarOpen(v => !v)}  // 可选，启用移动端 Ctrl+B
//   />
// =============================================================

import { useState, useCallback, useEffect, useMemo, useRef } from "react";

// =============================================================
// 书籍目录数据（从 SiteNav 移入，集中维护）
// =============================================================
const BOOK_CATEGORIES = [
  {
    name: "编程教程",
    icon: "💻",
    books: [
      { path: "/playground", label: "代码 Playground", icon: "🛝" },
      { path: "/", label: "Node.js", icon: "⬢" },
      { path: "/nodejs2", label: "Node.js 进阶", icon: "🟢" },
      { path: "/nodejs3", label: "Node.js 源码", icon: "🟡" },
      { path: "/pnpm", label: "pnpm", icon: "📦" },
      { path: "/ts", label: "TypeScript", icon: "🔷" },
      { path: "/ts2", label: "TypeScript 进阶", icon: "🔶" },
      { path: "/ts3", label: "TypeScript 高阶实战", icon: "💠" },
      { path: "/tw", label: "Tailwind CSS", icon: "🎨" },
      { path: "/react18", label: "React 18", icon: "⚛️" },
      { path: "/react19", label: "React 19", icon: "⚛️" },
      { path: "/py", label: "Python", icon: "🐍" },
      { path: "/py4", label: "Python 进阶", icon: "🐍" },
      { path: "/py5", label: "Python 高阶", icon: "🐍" },
      { path: "/py", label: "Python", icon: "🐍" },
      { path: "/net", label: "计算机网络", icon: "🌐" },
      { path: "/blog-tutorial", label: "Blog 系统教程", icon: "📝" },
      { path: "/pyweb", label: "Python Web", icon: "🌐" },
      { path: "/fastapi", label: "FastAPI", icon: "⚡" },
      { path: "/java", label: "Java", icon: "☕" },
      { path: "/java-web", label: "Java Web", icon: "🌐" },
      { path: "/csharp", label: "C#", icon: "🟪" },
      { path: "/go", label: "Go", icon: "🐹" },
      { path: "/sass", label: "Sass", icon: "💅" },
      { path: "/gql", label: "GraphQL", icon: "◈" },
      { path: "/sql", label: "数据库开发", icon: "🗄️" },
      { path: "/backend", label: "后端开发", icon: "🖥️" },
      { path: "/os", label: "操作系统", icon: "🐧" },
      { path: "/ai", label: "AI编程", icon: "🤖" },
      { path: "/ai-agent", label: "AI Agent开发", icon: "🤖" },
      { path: "/fe-interview", label: "前端面试", icon: "🎯" },
      { path: "/fe-engineering", label: "前端工程化", icon: "⚙️" },
      { path: "/nextjs", label: "Next.js", icon: "▲" },
    ],
  },
  {
    name: "综合知识",
    icon: "📚",
    books: [
      { path: "/career", label: "职业出路", icon: "🛤️" },
      { path: "/comm", label: "沟通交流", icon: "💬" },
      { path: "/psychology", label: "心向阳光", icon: "🧠" },
      { path: "/work", label: "职场", icon: "💼" },
      { path: "/stomach", label: "脾胃调养", icon: "🌿" },
      { path: "/dui", label: "怼人艺术", icon: "🎯" },
      { path: "/fandui", label: "反怼心理学", icon: "🛡️" },
      { path: "/shield", label: "回怼护盾", icon: "🛡️" },
      { path: "/quotes", label: "怼人语录", icon: "💬" },
      { path: "/curse", label: "毒舌词典", icon: "🐍" },
    ],
  },
];

const ALL_BOOKS = BOOK_CATEGORIES.flatMap((cat) =>
  cat.books.map((b) => ({ ...b, category: cat.name }))
);

const MIN_SIDEBAR_W = 200;
const MAX_SIDEBAR_W = 480;
const DEFAULT_SIDEBAR_W = 280;

export default function Sidebar({
  title = "目录",
  tip = "",
  footer = null,
  groupedChapters = [],
  activeId = "",
  onSelectChapter,
  sidebarOpen = false,
  onCloseSidebar,
  onToggleSidebar,
  currentPath = "/",
  meta = "",
  defaultCollapsed = false,
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [width, setWidth] = useState(DEFAULT_SIDEBAR_W);
  const [bookDropdownOpen, setBookDropdownOpen] = useState(false);
  const bookDropdownRef = useRef(null);

  // 当前书籍信息
  const currentBook = ALL_BOOKS.find((b) => b.path === currentPath) || ALL_BOOKS[0];

  // 点击外部关闭书籍目录下拉
  useEffect(() => {
    if (!bookDropdownOpen) return;
    const handler = (e) => {
      if (bookDropdownRef.current && !bookDropdownRef.current.contains(e.target)) {
        setBookDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bookDropdownOpen]);

  // ===== Ctrl+B 切换侧边栏（类似 VS Code） =====
  // -------------------------------------------------------------
  // 全局监听 keydown：
  //   - Ctrl+B (Win/Linux) 或 Cmd+B (Mac) 触发
  //   - preventDefault 阻止浏览器默认的"加粗"行为，确保在 textarea
  //     / 输入框内也能正常切换侧边栏
  //   - 桌面端（宽度 > 768px）：toggle 内部 collapsed 状态
  //   - 移动端：调用父组件传入的 onToggleSidebar 切换抽屉
  //     （若未传入则降级为：仅在抽屉打开时调用 onCloseSidebar 关闭）
  //
  // 用 matchMedia 做断点判断，与 CSS 媒体查询保持一致，比 innerWidth 更稳。
  // 依赖项里放入回调，确保拿到最新闭包；监听器只在挂载时注册一次。
  // -------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 同时兼容 Ctrl（Win/Linux）和 Cmd（Mac）
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key !== "b") return;

      // 阻止浏览器默认行为（如 contentEditable 的加粗、书签等）
      e.preventDefault();

      // 桌面端：切换收起 / 展开
      const isDesktop = window.matchMedia("(min-width: 769px)").matches;
      if (isDesktop) {
        setCollapsed((c) => !c);
        return;
      }

      // 移动端：优先用父组件的 toggle 回调
      if (typeof onToggleSidebar === "function") {
        onToggleSidebar();
        return;
      }
      // 降级：抽屉打开时关闭它
      if (sidebarOpen && typeof onCloseSidebar === "function") {
        onCloseSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, onCloseSidebar, onToggleSidebar]);

  // ===== URL Hash 同步 =====
  // -------------------------------------------------------------
  // 用 URL hash（如 #fe-eng-overview）记录当前章节：
  //   1. 点击章节 -> pushState 更新 URL（不刷新页面）
  //   2. 刷新页面 -> mount 时读取 hash，自动恢复章节
  //   3. 浏览器前进/后退 -> 监听 popstate / hashchange 同步
  //
  // 只改这一个文件，所有教程页面自动获得 hash 同步能力。
  // -------------------------------------------------------------

  // 收集所有章节 id（用于验证 hash 有效性）
  const allChapterIds = useMemo(
    () => groupedChapters.flatMap((g) => g.items.map((c) => c.id)),
    [groupedChapters]
  );

  // 用 ref 保存最新值，避免 useEffect 频繁重新注册监听器
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;
  const onSelectRef = useRef(onSelectChapter);
  onSelectRef.current = onSelectChapter;
  const validIdsRef = useRef(allChapterIds);
  validIdsRef.current = allChapterIds;

  useEffect(() => {
    // 从 URL hash 读取章节 id，若有效且与当前不同则同步
    const syncFromHash = () => {
      const hash = window.location.hash.slice(1);
      if (
        hash &&
        hash !== activeIdRef.current &&
        validIdsRef.current.includes(hash)
      ) {
        onSelectRef.current(hash);
      }
    };

    // mount 后立即同步一次（解决刷新后回到第一章的问题）
    syncFromHash();

    // 浏览器前进 / 后退、手动改 hash 时同步
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
    };
  }, []);

  // activeId 变化时同步到 URL hash
  // 覆盖底部"上一章/下一章"按钮等非 Sidebar 触发的章节切换
  // 跳过首次渲染，避免覆盖初始 URL hash
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (typeof window === "undefined") return;
    const currentHash = window.location.hash.slice(1);
    if (activeId && activeId !== currentHash) {
      const url = `${window.location.pathname}${window.location.search}#${activeId}`;
      window.history.pushState(null, "", url);
    }
  }, [activeId]);

  // ===== 拖拽调整宽度 =====
  const startResize = useCallback((e) => {
    e.preventDefault();
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (ev) => {
      const newWidth = Math.max(
        MIN_SIDEBAR_W,
        Math.min(MAX_SIDEBAR_W, ev.clientX)
      );
      setWidth(newWidth);
    };

    const onMouseUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  const handleSelect = useCallback(
    (chapterId) => {
      // 更新 URL hash（不触发滚动、不刷新页面）
      // 使用 pushState 而非直接改 hash，避免触发 hashchange 造成重复回调
      if (typeof window !== "undefined" && window.history) {
        const url = `${window.location.pathname}${window.location.search}#${chapterId}`;
        window.history.pushState(null, "", url);
      }
      onSelectChapter(chapterId);
    },
    [onSelectChapter]
  );

  return (
    <>
      {/* 移动端浮动菜单按钮（桌面端由 CSS 隐藏） */}
      {!sidebarOpen && typeof onToggleSidebar === "function" && (
        <button
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="打开目录"
          title="打开目录"
        >
          ☰
        </button>
      )}

      <aside
        className={`sidebar ${sidebarOpen ? "open" : ""} ${collapsed ? "collapsed" : ""}`}
        style={collapsed ? undefined : { width: `${width}px` }}
      >
        <div className="sidebar-inner">
          {/* 书籍目录切换器 */}
          <div className="sidebar-book-switcher" ref={bookDropdownRef}>
            <button
              className={`sidebar-book-btn ${bookDropdownOpen ? "active" : ""}`}
              onClick={() => setBookDropdownOpen(!bookDropdownOpen)}
              aria-expanded={bookDropdownOpen}
            >
              <span className="sidebar-book-icon">{currentBook.icon}</span>
              <span className="sidebar-book-label">{currentBook.label}</span>
              <span className={`sidebar-book-arrow ${bookDropdownOpen ? "open" : ""}`}>▾</span>
            </button>
            {bookDropdownOpen && (
              <div className="sidebar-book-dropdown">
                <div className="sidebar-book-dropdown-header">
                  📚 全部书籍（{ALL_BOOKS.length} 本）
                </div>
                <div className="sidebar-book-dropdown-body">
                  {BOOK_CATEGORIES.map((category) => (
                    <div key={category.name} className="sidebar-book-category">
                      <div className="sidebar-book-category-title">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                      <div className="sidebar-book-list">
                        {category.books.map((book) => (
                          <a
                            key={book.path}
                            href={book.path}
                            className={`sidebar-book-item ${currentPath === book.path ? "active" : ""}`}
                            onClick={() => setBookDropdownOpen(false)}
                          >
                            <span className="sidebar-book-item-icon">{book.icon}</span>
                            <span className="sidebar-book-item-label">{book.label}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {meta && <div className="sidebar-meta">{meta}</div>}

          <div className="sidebar-header">
            <div className="sidebar-header-row">
              <h2>{title}</h2>
              <button
                className="sidebar-collapse-btn"
                onClick={() => setCollapsed(true)}
                title="收起目录 (Ctrl+B)"
                aria-label="收起目录"
              >
                ✕
              </button>
            </div>
            {tip && <p className="sidebar-tip">{tip}</p>}
          </div>
          <nav className="chapter-nav">
            {groupedChapters.map(({ group, items }) => (
              <div key={group} className="chapter-group">
                <div className="group-title">{group}</div>
                <ul>
                  {items.map((ch) => (
                    <li key={ch.id}>
                      <button
                        className={`chapter-item ${activeId === ch.id ? "active" : ""}`}
                        onClick={() => handleSelect(ch.id)}
                      >
                        <span className="chapter-icon">{ch.icon}</span>
                        <span className="chapter-title-text">{ch.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          {footer && <div className="sidebar-footer">{footer}</div>}
        </div>

        {/* 拖拽调整宽度的把手 */}
        <div
          className="sidebar-resize-handle"
          onMouseDown={startResize}
          onDoubleClick={() => setWidth(DEFAULT_SIDEBAR_W)}
          title="拖拽调整宽度 · 双击恢复默认"
        >
          <div className="sidebar-resize-grip" />
        </div>
      </aside>

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={onCloseSidebar} />
      )}

      {/* 收起后的展开浮动按钮 */}
      {collapsed && (
        <button
          className="sidebar-expand-btn"
          onClick={() => setCollapsed(false)}
          title="展开目录 (Ctrl+B)"
          aria-label="展开目录"
        >
          <span className="expand-btn-icon">📖</span>
          <span className="expand-btn-text">目录</span>
        </button>
      )}
    </>
  );
}
