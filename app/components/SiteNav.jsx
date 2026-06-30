"use client";

// =============================================================
// 站点导航组件 —— 统一管理所有书籍目录
// -------------------------------------------------------------
// 所有教程页面共享此组件，书籍目录集中维护，避免重复代码。
//
// 使用方式：
//   <SiteNav currentPath="/ai" />
//
// Props:
//   currentPath - 当前页面路径，用于高亮当前书籍
// =============================================================

import { useState, useRef, useEffect, useCallback } from "react";

// =============================================================
// 书籍目录数据（集中维护，新增书籍只需在此添加）
// =============================================================
const BOOK_CATEGORIES = [
  {
    name: "编程教程",
    icon: "💻",
    books: [
      { path: "/playground", label: "代码 Playground", icon: "🛝" },
      { path: "/", label: "Node.js", icon: "⬢" },
      { path: "/pnpm", label: "pnpm", icon: "📦" },
      { path: "/ts", label: "TypeScript", icon: "🔷" },
      { path: "/tw", label: "Tailwind CSS", icon: "🎨" },
      { path: "/react18", label: "React 18", icon: "⚛️" },
      { path: "/react19", label: "React 19", icon: "⚛️" },
      { path: "/py", label: "Python", icon: "🐍" },
      { path: "/pyweb", label: "Python Web", icon: "🌐" },
      { path: "/java", label: "Java", icon: "☕" },
      { path: "/csharp", label: "C#", icon: "🟪" },
      { path: "/go", label: "Go", icon: "🐹" },
      { path: "/sass", label: "Sass", icon: "💅" },
      { path: "/gql", label: "GraphQL", icon: "◈" },
      { path: "/backend", label: "后端开发", icon: "🖥️" },
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
      { path: "/psychology", label: "心理学", icon: "🧠" },
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

// 扁平化所有书籍，方便查找
const ALL_BOOKS = BOOK_CATEGORIES.flatMap((cat) =>
  cat.books.map((b) => ({ ...b, category: cat.name }))
);

export default function SiteNav({ currentPath = "/", onMenuToggle, meta }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // 当前书籍信息
  const currentBook = ALL_BOOKS.find((b) => b.path === currentPath) || ALL_BOOKS[0];

  // 点击外部关闭下拉
  const handleClickOutside = useCallback((e) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target) &&
      triggerRef.current &&
      !triggerRef.current.contains(e.target)
    ) {
      setDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen, handleClickOutside]);

  // 键盘关闭
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [dropdownOpen]);

  return (
    <header className="topbar">
      {/* 移动端菜单按钮 */}
      <button
        className="menu-btn"
        aria-label="切换菜单"
        onClick={onMenuToggle}
      >
        ☰
      </button>

      {/* 元信息 */}
      {meta && <div className="topbar-meta">{meta}</div>}

      {/* 书籍目录下拉按钮 */}
      <div className="topbar-nav">
        <button
          ref={triggerRef}
          className={`topbar-directory-btn ${dropdownOpen ? "active" : ""}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <span className="directory-btn-icon">📖</span>
          <span>书籍目录</span>
          <span className={`directory-arrow ${dropdownOpen ? "open" : ""}`}>▾</span>
        </button>

        {/* 下拉面板 */}
        {dropdownOpen && (
          <div className="directory-dropdown" ref={dropdownRef}>
            <div className="directory-header">
              <span>📚 全部书籍（{ALL_BOOKS.length} 本）</span>
            </div>
            <div className="directory-body">
              {BOOK_CATEGORIES.map((category) => (
                <div key={category.name} className="directory-category">
                  <div className="directory-category-title">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                    <span className="directory-category-count">
                      {category.books.length}
                    </span>
                  </div>
                  <div className="directory-books">
                    {category.books.map((book) => (
                      <a
                        key={book.path}
                        href={book.path}
                        className={`directory-book-item ${currentPath === book.path ? "active" : ""}`}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <span className="directory-book-icon">{book.icon}</span>
                        <span className="directory-book-label">{book.label}</span>
                        {currentPath === book.path && (
                          <span className="directory-book-badge">当前</span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}