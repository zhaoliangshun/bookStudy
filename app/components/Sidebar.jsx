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
import EditorThemePicker from "./EditorThemePicker";

// =============================================================
// 书籍目录数据（从 SiteNav 移入，集中维护）
// =============================================================
const BOOK_CATEGORIES = [
  {
    name: "Python 教程",
    icon: "🐍",
    books: [
      { path: "/pybasic", label: "Python 基础路径", icon: "🌱" },
      { path: "/py", label: "Python", icon: "🐍" },
      { path: "/py6", label: "Python 全解", icon: "🐍" },
      { path: "/py8", label: "Python 大全", icon: "🐍" },
      { path: "/py9", label: "Python 逐层深入", icon: "📘" },
      { path: "/pynet", label: "Python 网络编程", icon: "🌐" },
      { path: "/pythread", label: "Python 线程进程", icon: "🧵" },
      { path: "/pythread2", label: "Python 多线程入门", icon: "🧵" },
      { path: "/pydb", label: "Python 数据库", icon: "🗄️" },
      { path: "/pyex", label: "Python 异常处理", icon: "⚠️" },
      { path: "/pyint", label: "Python 原理图解", icon: "🔬" },
      { path: "/pyweb", label: "Python Web", icon: "🌐" },
      { path: "/pyweb2", label: "Python Web 后端", icon: "🌐" },
      { path: "/fastapi", label: "FastAPI", icon: "⚡" },
      { path: "/pyarch", label: "Python 设计与架构", icon: "🏛️" },
      { path: "/pyeng", label: "Python 工程化", icon: "⚙️" },
      { path: "/pyfile", label: "Python 文件操作", icon: "📁" },
      { path: "/pyproject", label: "Python 实战项目", icon: "🚀" },
      { path: "/pyjava", label: "Python vs Java", icon: "🐍" },
    ],
  },
  {
    name: "Java 教程",
    icon: "☕",
    books: [
      { path: "/java", label: "Java", icon: "☕" },
      { path: "/java-web", label: "Java Web", icon: "🌐" },
    ],
  },
  {
    name: "数据库教程",
    icon: "🗄️",
    books: [
      { path: "/sql", label: "数据库开发", icon: "🗄️" },
      { path: "/mysql", label: "MySQL", icon: "🐬" },
      { path: "/redis", label: "Redis", icon: "🟥" },
      { path: "/mongo", label: "MongoDB", icon: "🍃" },
    ],
  },
  {
    name: "AI 教程",
    icon: "🤖",
    books: [
      { path: "/ai", label: "AI编程", icon: "🤖" },
      { path: "/aiapp", label: "AI 应用编程", icon: "🤖" },
      { path: "/ai-agent", label: "AI Agent开发", icon: "🤖" },
      { path: "/aipy", label: "Python AI开发", icon: "🐍" },
    ],
  },
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
      { path: "/net", label: "计算机网络", icon: "🌐" },
      { path: "/blog-tutorial", label: "Blog 系统教程", icon: "📝" },
      { path: "/deploy", label: "部署与运维", icon: "🚀" },
      { path: "/csharp", label: "C#", icon: "🟪" },
      { path: "/go", label: "Go", icon: "🐹" },
      { path: "/sass", label: "Sass", icon: "💅" },
      { path: "/gql", label: "GraphQL", icon: "◈" },
      { path: "/backend", label: "后端开发", icon: "🖥️" },
      { path: "/cs", label: "计算机原理", icon: "💡" },
      { path: "/howitworks", label: "代码怎么跑起来的", icon: "⚙️" },
      { path: "/os", label: "操作系统", icon: "🐧" },
      { path: "/fe-interview", label: "前端面试", icon: "🎯" },
      { path: "/fe-engineering", label: "前端工程化", icon: "⚙️" },
      { path: "/nextjs", label: "Next.js", icon: "▲" },
    ],
  },
  {
    name: "综合知识",
    icon: "📚",
    books: [
      { path: "/future", label: "程序员出路指南", icon: "🧭" },
      { path: "/career40", label: "40岁前端的下半场", icon: "🌅" },
      { path: "/comm", label: "沟通交流", icon: "💬" },
      { path: "/psychology", label: "心向阳光", icon: "🧠" },
      { path: "/nervous", label: "与紧张和解", icon: "🌊" },
      { path: "/relations", label: "人际关系心理学", icon: "🤝" },
      { path: "/work", label: "职场", icon: "💼" },
      { path: "/stomach", label: "脾胃调养", icon: "🌿" },
      { path: "/ibs", label: "肠易激康复", icon: "🫃" },
      { path: "/dui", label: "怼人艺术", icon: "🎯" },
      { path: "/fandui", label: "反怼心理学", icon: "🛡️" },
      { path: "/shield", label: "回怼护盾", icon: "🛡️" },
      { path: "/quotes", label: "怼人语录", icon: "💬" },
      { path: "/curse", label: "毒舌词典", icon: "🐍" },
      { path: "/rebut", label: "反驳的艺术", icon: "⚔️" },
      { path: "/dignity", label: "放不下的愤怒", icon: "💚" },
      { path: "/hurt", label: "委屈的解剖学", icon: "🕊️" },
    ],
  },
  {
    name: "已隐藏",
    icon: "🗂️",
    books: [
      { path: "/pymod", label: "Python 模块与包", icon: "📦" },
      { path: "/py4", label: "Python 进阶", icon: "🐍" },
      { path: "/career", label: "职业出路", icon: "🛤️" },
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
  // 手风琴模式：同一时间只展开一个分类。
  // expandedCategory 为当前展开的分类名；null 表示全部收起。
  // 初始默认展开"Python 教程"。
  const [expandedCategory, setExpandedCategory] = useState("Python 教程");
  // 章节分组收起状态：用 Set 记录已收起的分组名，默认全部收起。
  // 点击 group-title 可 toggle；当前激活章节所在分组会自动展开。
  const [collapsedGroups, setCollapsedGroups] = useState(
    () => new Set(groupedChapters.map((g) => g.group))
  );

  // 当前书籍信息
  const currentBook = ALL_BOOKS.find((b) => b.path === currentPath) || ALL_BOOKS[0];

  // 智能展开：如果当前页面属于某个分类，自动展开它（并收起其他），避免迷路
  useEffect(() => {
    const matchedCategory = BOOK_CATEGORIES.find((cat) =>
      cat.books.some((b) => b.path === currentPath)
    );
    if (matchedCategory) {
      setExpandedCategory(matchedCategory.name);
    }
  }, [currentPath]);

  // 切换章节分组的收起 / 展开状态
  const toggleGroup = useCallback((groupName) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  }, []);

  // 按钮显示逻辑：
  //   - 只有当前章节所在分组展开（其他都收起）→ 显示"全部展开"
  //   - 除当前章节所在分组外还有其他分组展开 → 显示"全部收起"
  // expandedCount 为当前展开的分组数量
  const expandedCount = groupedChapters.length - collapsedGroups.size;
  const allExpanded = expandedCount > 1;

  // 滚动相关 ref（提前声明，供 collapseAllGroups 闭包使用）
  const hasScrolledRef = useRef(false);

  // 全部展开：清空 collapsedGroups
  const expandAllGroups = useCallback(() => {
    setCollapsedGroups(new Set());
  }, []);

  // 全部收起：把所有分组名加入 collapsedGroups，但保留当前激活章节所在分组展开
  // 同时触发一次"滚动到中央"，把当前章节菜单定位到视野区中央
  const collapseAllGroups = useCallback(() => {
    // 找到当前激活章节所在分组，收起其他分组时跳过它
    const activeGroup = groupedChapters.find((g) =>
      g.items.some((c) => c.id === activeId)
    )?.group;
    setCollapsedGroups(
      new Set(
        groupedChapters
          .map((g) => g.group)
          .filter((name) => name !== activeGroup)
      )
    );
    // 重置首次滚动标记，让滚动 effect 重新执行一次
    hasScrolledRef.current = false;
  }, [groupedChapters, activeId]);

  // 激活章节变化时，自动展开其所在分组（避免点"下一章"后章节被收起看不到）
  // 注意：
  //   1. 只在 activeId 真正变化时触发，不依赖 collapsedGroups，
  //      否则用户手动收起当前章节所在分组时会被立即展开回去。
  //   2. 首次挂载（prevActiveIdRef 为 null）时跳过——首次展开由
  //      tryRestore 统一负责，避免"初始 activeId 展开第一组"与
  //      "恢复 activeId 展开第 N 组"同时发生导致两组都展开。
  const prevActiveIdRef = useRef(null);
  useEffect(() => {
    // 首次挂载，记录当前 activeId 但不展开（交给 tryRestore 处理）
    if (prevActiveIdRef.current === null) {
      prevActiveIdRef.current = activeId;
      return;
    }
    // activeId 没变（例如只是 collapsedGroups 变了），不做任何处理
    if (prevActiveIdRef.current === activeId) return;
    prevActiveIdRef.current = activeId;
    if (!activeId) return;
    const matched = groupedChapters.find((g) =>
      g.items.some((c) => c.id === activeId)
    );
    if (matched && collapsedGroups.has(matched.group)) {
      setCollapsedGroups((prev) => {
        const next = new Set(prev);
        next.delete(matched.group);
        return next;
      });
    }
  }, [activeId, groupedChapters, collapsedGroups]);

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

  // 用 ref 保存最新值，避免 useEffect 频繁重新注册监听器。
  // ref 的更新放在 effect 中，避免在渲染阶段修改 ref.current（React 19 严格模式报错）。
  const activeIdRef = useRef(activeId);
  const onSelectRef = useRef(onSelectChapter);
  const validIdsRef = useRef(allChapterIds);
  // 当前课程路径的 ref，供 mount 一次性 effect 中安全读取最新值
  const currentPathRef = useRef(currentPath);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);
  useEffect(() => {
    onSelectRef.current = onSelectChapter;
  }, [onSelectChapter]);
  useEffect(() => {
    validIdsRef.current = allChapterIds;
  }, [allChapterIds]);
  useEffect(() => {
    currentPathRef.current = currentPath;
  }, [currentPath]);

  // ===== 章节恢复：URL hash > localStorage > 默认第一章 =====
  // -------------------------------------------------------------
  // 触发时机：
  //   1. 组件 mount（打开 / 刷新课程页面）
  //   2. currentPath 变化（切换课程）
  //   3. 浏览器前进 / 后退（hashchange / popstate）
  //
  // 恢复章节时同时重置分组状态：全部收起，仅展开目标章节所在分组。
  // 这样可以避免"初始 activeId（第一组）展开第一组"与"恢复 activeId
  // （第 N 组）展开第 N 组"同时发生导致两组都展开的问题。
  // -------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const tryRestore = () => {
      const hash = window.location.hash.slice(1);
      let targetId = null;
      // 1. 优先恢复 URL hash 中的章节
      if (hash && validIdsRef.current.includes(hash)) {
        targetId = hash;
      }
      // 2. 没有 hash 时，回退到 localStorage 记住的最后浏览章节
      if (!targetId && !hash && currentPath) {
        try {
          const last = localStorage.getItem(
            `sidebar:lastChapter:${currentPath}`
          );
          if (last && validIdsRef.current.includes(last)) {
            targetId = last;
          }
        } catch (e) {
          // localStorage 不可用时静默忽略
        }
      }

      // 3. 首次打开该课程（无 hash 且无 localStorage 记录）：
      //    使用第一个分组的第一章，并展开第一个分组
      if (!targetId && groupedChapters.length > 0) {
        targetId = groupedChapters[0].items[0]?.id || null;
      }

      if (!targetId) return;

      // 切换到目标章节
      if (targetId !== activeIdRef.current) {
        onSelectChapter(targetId);
      }
      // 只展开目标章节所在分组，不收起其他已展开的分组（全部手动操作）
      const matched = groupedChapters.find((g) =>
        g.items.some((c) => c.id === targetId)
      );
      if (matched) {
        setCollapsedGroups((prev) => {
          // 已经展开就不变，避免无意义渲染
          if (!prev.has(matched.group)) return prev;
          const next = new Set(prev);
          next.delete(matched.group);
          return next;
        });
      }
    };

    // mount / currentPath 变化后立即尝试恢复
    tryRestore();

    // 浏览器前进 / 后退、手动改 hash 时同步
    window.addEventListener("hashchange", tryRestore);
    window.addEventListener("popstate", tryRestore);
    return () => {
      window.removeEventListener("hashchange", tryRestore);
      window.removeEventListener("popstate", tryRestore);
    };
  }, [currentPath, onSelectChapter, groupedChapters]);

  // activeId 变化时同步到 URL hash
  // 覆盖底部"上一章/下一章"按钮等非 Sidebar 触发的章节切换
  // 跳过首次渲染，避免覆盖初始 URL hash
  // 同时把章节写入 localStorage，保证非 Sidebar 触发的切换也能被记住
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
    if (activeId && currentPathRef.current) {
      try {
        localStorage.setItem(
          `sidebar:lastChapter:${currentPathRef.current}`,
          activeId
        );
      } catch (e) {
        // localStorage 不可用时静默忽略
      }
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
        // 记住此课程最后浏览的章节，下次打开该课程时自动恢复
        try {
          localStorage.setItem(`sidebar:lastChapter:${currentPath}`, chapterId);
        } catch (e) {
          // localStorage 不可用时静默忽略
        }
      }
      onSelectChapter(chapterId);
    },
    [onSelectChapter, currentPath]
  );

  // 处理跨页面跳转：当路径变化时，清除无效的 hash
  useEffect(() => {
    const handlePathChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && !validIdsRef.current.includes(hash)) {
        // hash 无效，清除它
        const url = `${window.location.pathname}${window.location.search}`;
        window.history.replaceState(null, "", url);
      }
    };

    // 监听 popstate 事件
    window.addEventListener("popstate", handlePathChange);
    // 初始检查
    handlePathChange();

    return () => {
      window.removeEventListener("popstate", handlePathChange);
    };
  }, []);

  // ===== 激活章节菜单自动滚动到视野区 =====
  // -------------------------------------------------------------
  // 场景：刷新页面后从 URL hash 恢复到第 N 章，或首次打开课程时，
  // 左侧目录里对应章节菜单需要自动出现在视野区中央。
  //
  // 注意：只在"首次打开课程"时滚动一次，之后切换章节 / 分组不再自动滚动，
  // 避免干扰用户手动滚动浏览。用 hasScrolledRef 标记是否已完成首次滚动，
  // currentPath 变化（切换课程）时重置标记，让新课程也滚动一次。
  // -------------------------------------------------------------
  const activeChapterRef = useRef(null);
  const lastScrolledPathRef = useRef(currentPath);

  // 切换课程时重置首次滚动标记，让新课程也能滚动一次
  if (lastScrolledPathRef.current !== currentPath) {
    lastScrolledPathRef.current = currentPath;
    hasScrolledRef.current = false;
  }

  // 把激活章节菜单滚动到侧边栏视野区的中央。
  // 仅在首次打开课程时执行一次；之后切换章节 / 分组不再滚动。
  // 用双层 requestAnimationFrame 确保浏览器完成布局后再测量位置，
  // 避免读到未更新的尺寸（分组刚展开时高度可能还是 0）。
  useEffect(() => {
    if (typeof window === "undefined") return;
    // 已经完成首次滚动，不再自动滚动
    if (hasScrolledRef.current) return;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = activeChapterRef.current;
        if (!el) return;
        const container = el.closest(".chapter-nav");
        if (!container) return;
        // 容器不可见（如桌面端收起状态），跳过本次（下次再试）
        if (container.clientHeight === 0) return;

        const elRect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        // 激活项在容器内的偏移量
        const offsetInContainer = elRect.top - containerRect.top;
        // 让激活项中心对齐容器中心：scrollTop = 偏移量 - (容器高度 - 项高度) / 2
        const target =
          container.scrollTop +
          offsetInContainer -
          (container.clientHeight - el.offsetHeight) / 2;
        container.scrollTop = Math.max(0, target);
        // 标记已完成首次滚动
        hasScrolledRef.current = true;
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [activeId, collapsed, collapsedGroups, currentPath]);

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
          {/* 书籍选择 + 编辑器主题选择：同一行，左书籍右主题，各占一半 */}
          <div className="sidebar-book-switcher" ref={bookDropdownRef}>
            <div className="sidebar-book-row">
              <button
                className={`sidebar-book-btn ${bookDropdownOpen ? "active" : ""}`}
                onClick={() => setBookDropdownOpen(!bookDropdownOpen)}
                aria-expanded={bookDropdownOpen}
                title="切换书籍"
              >
                <span className="sidebar-book-icon">{currentBook.icon}</span>
                <span className="sidebar-book-label">{currentBook.label}</span>
                <span className={`sidebar-book-arrow ${bookDropdownOpen ? "open" : ""}`}>▾</span>
              </button>
              <EditorThemePicker variant="sidebar" />
            </div>
            {bookDropdownOpen && (
              <>
                {/* 全屏遮罩：点击关闭面板 */}
                <div
                  className="sidebar-book-overlay"
                  onClick={() => setBookDropdownOpen(false)}
                />
                {/* 全屏宽度面板：fixed 定位脱离侧边栏宽度限制 */}
                <div className="sidebar-book-dropdown">
                  <div className="sidebar-book-dropdown-header" onClick={() => setBookDropdownOpen(false)}>
                    <span>📚 全部书籍（{ALL_BOOKS.length} 本）</span>
                    <button
                      className="sidebar-book-dropdown-close"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBookDropdownOpen(false);
                      }}
                      title="关闭"
                      aria-label="关闭"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="sidebar-book-dropdown-body">
                    {BOOK_CATEGORIES.map((category) => {
                      const isCollapsed = expandedCategory !== category.name;
                      return (
                      <div key={category.name} className="sidebar-book-category">
                        <div
                          className={`sidebar-book-category-title ${isCollapsed ? "collapsed" : ""}`}
                          onClick={() =>
                            setExpandedCategory((prev) =>
                              prev === category.name ? null : category.name
                            )
                          }
                          title={isCollapsed ? "点击展开" : "点击收起"}
                        >
                          <span className="sidebar-book-category-arrow">
                            {isCollapsed ? "▶" : "▾"}
                          </span>
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                        {/* 平铺网格：一行多个书籍卡片，自动换行 */}
                        {!isCollapsed && (
                        <div className="sidebar-book-grid">
                          {category.books.map((book) => (
                            <a
                              key={book.path}
                              href={book.path}
                              className={`sidebar-book-card ${currentPath === book.path ? "active" : ""}`}
                              onClick={() => setBookDropdownOpen(false)}
                              title={book.label}
                            >
                              <span className="sidebar-book-card-icon">{book.icon}</span>
                              <span className="sidebar-book-card-label">{book.label}</span>
                            </a>
                          ))}
                        </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 分组批量展开/收起 + 关闭侧边栏 工具条 */}
          {groupedChapters.length > 0 && (
            <div className="sidebar-group-toolbar">
              <button
                type="button"
                className="sidebar-group-toolbar-btn"
                onClick={allExpanded ? collapseAllGroups : expandAllGroups}
                title={allExpanded ? "全部收起" : "全部展开"}
              >
                {allExpanded ? "⊟ 全部收起" : "⊞ 全部展开"}
              </button>
              <button
                className="sidebar-collapse-btn"
                onClick={() => setCollapsed(true)}
                title="收起目录 (Ctrl+B)"
                aria-label="收起目录"
              >
                ✕
              </button>
            </div>
          )}
          <nav className="chapter-nav">
            {groupedChapters.map(({ group, items }) => {
              const isGroupCollapsed = collapsedGroups.has(group);
              return (
              <div key={group} className="chapter-group">
                <button
                  type="button"
                  className={`group-title ${isGroupCollapsed ? "collapsed" : ""}`}
                  onClick={() => toggleGroup(group)}
                  aria-expanded={!isGroupCollapsed}
                  title={isGroupCollapsed ? "点击展开" : "点击收起"}
                >
                  <span className="group-title-arrow">
                    {isGroupCollapsed ? "▶" : "▾"}
                  </span>
                  <span className="group-title-text">{group}</span>
                </button>
                {!isGroupCollapsed && (
                <ul>
                  {items.map((ch) => (
                    <li key={ch.id}>
                      <button
                        ref={activeId === ch.id ? activeChapterRef : null}
                        className={`chapter-item ${activeId === ch.id ? "active" : ""}`}
                        onClick={() => handleSelect(ch.id)}
                      >
                        <span className="chapter-icon">{ch.icon}</span>
                        <span className="chapter-title-text">{ch.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                )}
              </div>
              );
            })}
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
