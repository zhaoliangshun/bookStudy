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
import { useRouter } from "next/navigation";
import EditorThemePicker from "./EditorThemePicker";
import ContextMenu from "./ContextMenu";
import useBookChapterActions from "../hooks/useBookChapterActions";
import useBookDragDrop from "../hooks/useBookDragDrop";

// =============================================================
// 书籍目录数据（从 SiteNav 移入，集中维护）
// =============================================================
const BOOK_CATEGORIES = [
  {
    name: "Python 教程",
    icon: "🐍",
    books: [
      { path: "/py", label: "Python", icon: "🐍" },
      { path: "/py4", label: "Python 进阶", icon: "🐍" },
      { path: "/py6", label: "Python 全解", icon: "🐍" },
      { path: "/py8", label: "Python 大全", icon: "🐍" },
      { path: "/py9", label: "Python 逐层深入", icon: "📘" },
      { path: "/pynet", label: "Python 网络编程", icon: "🌐" },
      { path: "/pythread", label: "Python 线程进程", icon: "🧵" },
      { path: "/pythread2", label: "Python 多线程入门", icon: "🧵" },
      { path: "/pyprocess", label: "Python 多进程教程", icon: "🧬" },
      { path: "/pysubprocess", label: "Python subprocess", icon: "🔌" },
      { path: "/pydb", label: "Python 数据库", icon: "🗄️" },
      { path: "/pyint", label: "Python 原理图解", icon: "🔬" },
      { path: "/pyweb", label: "Python Web", icon: "🌐" },
      { path: "/pyweb2", label: "Python Web 后端", icon: "🌐" },
      { path: "/fastapi", label: "FastAPI", icon: "⚡" },
      { path: "/pyarch", label: "Python 设计与架构", icon: "🏛️" },
      { path: "/pyeng", label: "Python 工程化", icon: "⚙️" },
      { path: "/pyfile", label: "Python 文件操作", icon: "📁" },
      { path: "/pyfile2", label: "Python 文件管理", icon: "🗂️" },
      { path: "/pyasync", label: "Python asyncio 异步编程", icon: "🌊" },
      { path: "/pyasync2", label: "Python asyncio 异步编程 V2", icon: "🌊" },
      { path: "/pykit", label: "Python 开发常用知识点", icon: "🧰" },
      { path: "/pyrun", label: "Python 执行代码原理", icon: "🔬" },
      { path: "/pyproject", label: "Python 实战项目", icon: "🚀" },
      { path: "/pyjava", label: "Python vs Java", icon: "🐍" },
      { path: "/pyvsjs", label: "Python vs JS 深度对比", icon: "⚔️" },
      { path: "/pyvsjava", label: "Python vs Java 深度对比", icon: "⚔️" },
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
      { path: "/http", label: "HTTP 通信教程", icon: "🌐" },
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
      { path: "/unharmed", label: "破怒：情绪暴击后翻篇指南", icon: "💔" },
    ],
  },
  {
    name: "已隐藏",
    icon: "🗂️",
    books: [
      { path: "/pybasic", label: "Python 基础路径", icon: "🌱" },
      { path: "/pymod", label: "Python 模块与包", icon: "📦" },
      { path: "/pyex", label: "Python 异常处理", icon: "⚠️" },
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
  const router = useRouter();
  // 手风琴模式：同一时间只展开一个分类。
  // expandedCategory 为当前展开的分类名；null 表示全部收起。
  // 初始默认展开"Python 教程"。
  const [expandedCategory, setExpandedCategory] = useState("Python 教程");
  // 章节分组收起状态：用 Set 记录已收起的分组名，默认全部收起。
  // 点击 group-title 可 toggle；当前激活章节所在分组会自动展开。
  const [collapsedGroups, setCollapsedGroups] = useState(
    () => new Set(groupedChapters.map((g) => g.group))
  );

  // ===== 右键菜单状态 =====
  const {
    hiddenBooks,
    deletedChapterIds,
    hiddenChapterIds,
    hideBook,
    unhideBook,
    deleteChapter,
    undeleteChapter,
    hideChapter,
    unhideChapter,
    hideChapters,
    unhideChapters,
  } = useBookChapterActions();

  const [ctxMenu, setCtxMenu] = useState(null);

  // ===== 书籍拖拽排序 =====
  const { bookOrder, reorderInCategory, moveToCategory, getOrderedPaths } =
    useBookDragDrop(BOOK_CATEGORIES);

  // 拖拽状态：记录正在拖拽的书籍信息
  const dragStateRef = useRef(null); // { bookPath, sourceCategory, sourceIndex }

  // 根据排序和隐藏状态过滤后的书籍分类
  const visibleCategories = useMemo(() => {
    return BOOK_CATEGORIES.map((cat) => {
      const orderedPaths = getOrderedPaths(cat.name);
      if (cat.name === "已隐藏") {
        // 已隐藏：显示 bookOrder 中该分类的书籍 + 动态隐藏的书籍
        const dynamicHidden = ALL_BOOKS.filter(
          (b) => hiddenBooks.has(b.path) && !orderedPaths.includes(b.path)
        );
        const allPaths = [...orderedPaths, ...dynamicHidden.map((b) => b.path)];
        return {
          ...cat,
          books: allPaths
            .map((p) => ALL_BOOKS.find((b) => b.path === p))
            .filter(Boolean),
        };
      }
      // 普通分类：使用排序后的路径，过滤掉已隐藏的书籍
      return {
        ...cat,
        books: orderedPaths
          .filter((p) => !hiddenBooks.has(p))
          .map((p) => ALL_BOOKS.find((b) => b.path === p))
          .filter(Boolean),
      };
    });
  }, [hiddenBooks, getOrderedPaths, bookOrder]);

  // 根据隐藏状态过滤后的章节分组
  const filteredGroupedChapters = useMemo(() => {
    return groupedChapters
      .map((g) => ({
        ...g,
        items: g.items.filter((c) => !hiddenChapterIds.has(c.id)),
      }))
      .filter((g) => g.items.length > 0);
  }, [groupedChapters, hiddenChapterIds]);

  // 被删除的章节，按原始分组归类（用于"已删除章节"区域）
  const hiddenChapterGroups = useMemo(() => {
    return groupedChapters
      .map((g) => ({
        group: g.group,
        items: g.items.filter((c) => hiddenChapterIds.has(c.id)),
      }))
      .filter((g) => g.items.length > 0);
  }, [groupedChapters, hiddenChapterIds]);

  // 被隐藏章节总数
  const hiddenChapterCount = useMemo(
    () => hiddenChapterGroups.reduce((sum, g) => sum + g.items.length, 0),
    [hiddenChapterGroups]
  );

  // "已删除章节"区域是否收起
  const [hiddenSectionCollapsed, setHiddenSectionCollapsed] = useState(true);

  // 已删除章节区域内各分组的展开状态
  // 用 Set 记录已展开的分组名，默认为空 Set（即全部收起）
  const [hiddenGroupExpanded, setHiddenGroupExpanded] = useState(() => new Set());

  // 右键菜单事件处理器
  const handleBookContextMenu = useCallback((e, bookPath) => {
    e.preventDefault();
    setCtxMenu({ type: "book", target: bookPath, position: { x: e.clientX, y: e.clientY } });
  }, []);

  const handleGroupContextMenu = useCallback((e, groupName) => {
    e.preventDefault();
    setCtxMenu({ type: "group", target: groupName, position: { x: e.clientX, y: e.clientY } });
  }, []);

  const handleChapterContextMenu = useCallback((e, chapterId) => {
    e.preventDefault();
    setCtxMenu({ type: "chapter", target: chapterId, position: { x: e.clientX, y: e.clientY } });
  }, []);

  // 隐藏区域分组右键（始终显示"取消隐藏"）
  const handleHiddenGroupContextMenu = useCallback((e, groupName) => {
    e.preventDefault();
    setCtxMenu({ type: "hidden-group", target: groupName, position: { x: e.clientX, y: e.clientY } });
  }, []);

  // 根据右键菜单类型构建菜单项
  const ctxMenuItems = useMemo(() => {
    if (!ctxMenu) return [];

    if (ctxMenu.type === "book") {
      const isHidden = hiddenBooks.has(ctxMenu.target);
      return [
        isHidden
          ? { label: "取消隐藏", icon: "👁️", onClick: () => unhideBook(ctxMenu.target) }
          : { label: "隐藏此书", icon: "🙈", onClick: () => hideBook(ctxMenu.target) },
      ];
    }

    if (ctxMenu.type === "group") {
      const group = groupedChapters.find((g) => g.group === ctxMenu.target);
      if (!group) return [];
      const allHidden = group.items.every((c) => hiddenChapterIds.has(c.id));
      const ids = group.items.map((c) => c.id);
      return [
        allHidden
          ? { label: "恢复此分组", icon: "↩️", onClick: () => unhideChapters(ids) }
          : { label: "删除此分组所有章节", icon: "🗑️", danger: true, onClick: () => hideChapters(ids) },
      ];
    }

    if (ctxMenu.type === "hidden-group") {
      const group = groupedChapters.find((g) => g.group === ctxMenu.target);
      if (!group) return [];
      const ids = group.items.filter((c) => hiddenChapterIds.has(c.id)).map((c) => c.id);
      return [
        { label: "恢复此分组", icon: "↩️", onClick: () => unhideChapters(ids) },
      ];
    }

    if (ctxMenu.type === "chapter") {
      const isDeleted = deletedChapterIds.has(ctxMenu.target);
      const isHidden = hiddenChapterIds.has(ctxMenu.target);
      const items = [];
      items.push(
        isDeleted
          ? { label: "标记未读", icon: "📖", onClick: () => undeleteChapter(ctxMenu.target) }
          : { label: "已读此章节", icon: "✅", onClick: () => deleteChapter(ctxMenu.target) }
      );
      items.push({ divider: true });
      items.push(
        isHidden
          ? { label: "恢复此章节", icon: "↩️", onClick: () => unhideChapter(ctxMenu.target) }
          : { label: "删除此章节", icon: "🗑️", danger: true, onClick: () => hideChapter(ctxMenu.target) }
      );
      return items;
    }

    return [];
  }, [
    ctxMenu, hiddenBooks, hiddenChapterIds, deletedChapterIds, groupedChapters,
    hideBook, unhideBook, deleteChapter, undeleteChapter,
    hideChapter, unhideChapter, hideChapters, unhideChapters,
  ]);

  // ===== 书籍拖拽事件处理 =====
  // 拖拽开始：记录来源信息
  const handleDragStart = useCallback((e, bookPath, categoryName, index) => {
    dragStateRef.current = { bookPath, sourceCategory: categoryName, sourceIndex: index };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", bookPath);
    // 延迟添加 dragging 样式（避免拖拽幽灵图立即变半透明）
    requestAnimationFrame(() => {
      e.target.classList.add("dragging");
    });
  }, []);

  // 拖拽结束：清理状态
  const handleDragEnd = useCallback((e) => {
    e.target.classList.remove("dragging");
    // 延迟清空拖拽状态，确保 click 事件先检查到 dragStateRef
    setTimeout(() => {
      dragStateRef.current = null;
    }, 0);
  }, []);

  // 拖拽经过书籍卡片：判断插入位置（卡片上半=插前面，下半=插后面）
  const handleCardDragOver = useCallback((e, categoryName, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    // 移除所有 drag-over 类
    card.parentElement.querySelectorAll(".drag-over-before, .drag-over-after").forEach((el) => {
      el.classList.remove("drag-over-before", "drag-over-after");
    });
    // 根据鼠标位置添加对应的类
    if (e.clientY < midY) {
      card.classList.add("drag-over-before");
    } else {
      card.classList.add("drag-over-after");
    }
  }, []);

  // 拖拽离开书籍卡片
  const handleCardDragLeave = useCallback((e) => {
    e.currentTarget.classList.remove("drag-over-before", "drag-over-after");
  }, []);

  // 在书籍卡片上释放
  const handleCardDrop = useCallback(
    (e, toCategory, toIndex) => {
      e.preventDefault();
      e.currentTarget.classList.remove("drag-over-before", "drag-over-after");
      const ds = dragStateRef.current;
      if (!ds) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      // 鼠标在卡片上半部 → insert before；下半部 → insert after
      const insertIndex = e.clientY < midY ? toIndex : toIndex + 1;

      if (ds.sourceCategory === toCategory) {
        // 同分类内排序
        const adjustedIndex =
          insertIndex > ds.sourceIndex ? insertIndex - 1 : insertIndex;
        reorderInCategory(toCategory, ds.sourceIndex, adjustedIndex);
      } else {
        // 跨分类移动
        moveToCategory(ds.sourceCategory, ds.sourceIndex, toCategory, insertIndex);
        // 联动隐藏状态
        if (toCategory === "已隐藏") {
          hideBook(ds.bookPath);
        } else if (ds.sourceCategory === "已隐藏") {
          unhideBook(ds.bookPath);
        }
      }
      // 不清空 dragStateRef，留给 dragEnd 清理（防止 click 事件误触发跳转）
      ds.dropped = true;
    },
    [reorderInCategory, moveToCategory, hideBook, unhideBook]
  );

  // 当前书籍信息
  const currentBook = ALL_BOOKS.find((b) => b.path === currentPath) || ALL_BOOKS[0];

  // 智能展开：如果当前页面属于某个分类，自动展开它（并收起其他），避免迷路
  useEffect(() => {
    const matchedCategory = BOOK_CATEGORIES.find((cat) =>
      cat.books.some((b) => b.path === currentPath)
    );
    if (matchedCategory) {
      // 用 raf 延迟 setState，避免在 effect 同步阶段直接更新状态触发级联渲染
      // （react-hooks/set-state-in-effect 规则）。
      const raf = requestAnimationFrame(() => {
        setExpandedCategory(matchedCategory.name);
      });
      return () => cancelAnimationFrame(raf);
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
  //   3. collapsedGroups 不放入依赖数组，改在 setCollapsedGroups 的
  //      functional update 中通过 prev 读取最新值，避免"依赖与修改同源"
  //      导致的循环渲染。
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
    if (matched) {
      // 用 raf 延迟 setState，避免在 effect 同步阶段直接更新状态触发级联渲染
      // （react-hooks/set-state-in-effect 规则）。
      const raf = requestAnimationFrame(() => {
        // 通过 functional update 读取最新的 collapsedGroups，
        // 已展开就返回 prev（同引用，React 不会重渲染）
        setCollapsedGroups((prev) => {
          if (!prev.has(matched.group)) return prev;
          const next = new Set(prev);
          next.delete(matched.group);
          return next;
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [activeId, groupedChapters]);

  // 点击外部关闭书籍目录下拉（排除右键菜单内的点击）
  useEffect(() => {
    if (!bookDropdownOpen) return;
    const handler = (e) => {
      // 如果点击的是右键菜单内部，不关闭下拉
      if (e.target.closest(".ctx-menu")) return;
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
  // groupedChapters 的 ref：父组件未 memo 时每次渲染都产生新引用，
  // 若直接放入 tryRestore 的依赖数组会导致 effect 无限重跑。
  // 改用 ref 在 effect 内读取最新值，依赖数组只保留真正需要触发重跑的 currentPath。
  const groupedChaptersRef = useRef(groupedChapters);

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
  useEffect(() => {
    groupedChaptersRef.current = groupedChapters;
  }, [groupedChapters]);

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
      // 通过 ref 读取最新的 groupedChapters，避免将其放入依赖数组
      const chapters = groupedChaptersRef.current;
      if (!targetId && chapters.length > 0) {
        targetId = chapters[0].items[0]?.id || null;
      }

      if (!targetId) return;

      // 切换到目标章节（通过 ref 调用最新的 onSelectChapter）
      if (targetId !== activeIdRef.current) {
        onSelectRef.current(targetId);
      }
      // 只展开目标章节所在分组，不收起其他已展开的分组（全部手动操作）
      const matched = chapters.find((g) =>
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
    // 只在 currentPath 变化时重新注册监听器；
    // groupedChapters 和 onSelectChapter 通过 ref 读取最新值，不放入依赖
  }, [currentPath]);

  // activeId 变化时同步到 URL hash
  // 覆盖底部"上一章/下一章"按钮等非 Sidebar 触发的章节切换
  // 跳过首次渲染，避免覆盖初始 URL hash（初始 hash 由 tryRestore 负责）
  // 同时把章节写入 localStorage，保证非 Sidebar 触发的切换也能被记住
  //
  // 注意：不能用 mountedRef（布尔 ref）跳过首次执行！
  // React StrictMode（App Router 默认开启）下 effect 会执行两次：
  //   第一次：mountedRef.current = false → 设为 true → return
  //   第二次：mountedRef.current = true → 直接执行 hash 同步 → 覆盖 URL hash
  // 这会导致 tryRestore 刚从 URL hash 恢复的章节被这里的 pushState 覆盖掉。
  // 改用 prevActiveIdForHashRef 比较 activeId 是否"真正变化"来跳过首次执行：
  //   首次：ref 为 null → 记录 activeId 并返回（两次 StrictMode 执行都如此）
  //   后续：activeId 与 ref 中的旧值不同时才执行 hash 同步
  const prevActiveIdForHashRef = useRef(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    // activeId 没有真正变化时跳过（包括 StrictMode 下的二次执行）
    if (prevActiveIdForHashRef.current === activeId) return;
    const isFirstRun = prevActiveIdForHashRef.current === null;
    prevActiveIdForHashRef.current = activeId;
    // 首次挂载跳过 hash 同步，交给 tryRestore 处理 URL hash 恢复
    if (isFirstRun) return;

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

  // 切换课程时重置首次滚动标记，让新课程也能滚动一次。
  // 必须放在 effect 中执行（不能在渲染阶段访问/修改 ref，
  // 否则触发 react-hooks/refs 规则报错）。
  // 此 effect 在下面的滚动 effect 之前声明，因此会先执行，
  // 确保 hasScrolledRef 在滚动 effect 读取前已被重置为 false。
  useEffect(() => {
    if (lastScrolledPathRef.current !== currentPath) {
      lastScrolledPathRef.current = currentPath;
      hasScrolledRef.current = false;
    }
  }, [currentPath]);

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
                    {visibleCategories.map((category) => {
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
                          <span className={`sidebar-book-category-arrow${isCollapsed ? "" : " expanded"}`}>
                            ▶
                          </span>
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                        {/* 平铺网格：一行多个书籍卡片，自动换行 */}
                        {!isCollapsed && (
                        <div className="sidebar-book-grid">
                          {category.books.map((book, idx) => (
                            <div
                              key={book.path}
                              draggable
                              className={`sidebar-book-card ${currentPath === book.path ? "active" : ""}`}
                              onClick={(e) => {
                                // 拖拽中不触发点击跳转
                                if (dragStateRef.current) {
                                  e.preventDefault();
                                  return;
                                }
                                setBookDropdownOpen(false);
                                router.push(book.path);
                              }}
                              onContextMenu={(e) => handleBookContextMenu(e, book.path)}
                              onDragStart={(e) => handleDragStart(e, book.path, category.name, idx)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => handleCardDragOver(e, category.name, idx)}
                              onDragLeave={handleCardDragLeave}
                              onDrop={(e) => handleCardDrop(e, category.name, idx)}
                              title={`${book.label}（可拖拽排序）`}
                              role="link"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  setBookDropdownOpen(false);
                                  router.push(book.path);
                                }
                              }}
                            >
                              <span className="sidebar-book-card-icon">{book.icon}</span>
                              <span className="sidebar-book-card-label">{book.label}</span>
                            </div>
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
            {filteredGroupedChapters.map(({ group, items }) => {
              const isGroupCollapsed = collapsedGroups.has(group);
              return (
              <div key={group} className="chapter-group">
                <button
                  type="button"
                  className={`group-title ${isGroupCollapsed ? "collapsed" : ""}`}
                  onClick={() => toggleGroup(group)}
                  onContextMenu={(e) => handleGroupContextMenu(e, group)}
                  aria-expanded={!isGroupCollapsed}
                  title={isGroupCollapsed ? "点击展开" : "点击收起"}
                >
                  <span className={`group-title-arrow${isGroupCollapsed ? "" : " expanded"}`}>
                    ▶
                  </span>
                  <span className="group-title-text">{group}</span>
                </button>
                {!isGroupCollapsed && (
                <ul>
                  {items.map((ch) => (
                    <li key={ch.id}>
                      <button
                        ref={activeId === ch.id ? activeChapterRef : null}
                        className={`chapter-item ${activeId === ch.id ? "active" : ""} ${deletedChapterIds.has(ch.id) ? "deleted" : ""}`}
                        onClick={() => handleSelect(ch.id)}
                        onContextMenu={(e) => handleChapterContextMenu(e, ch.id)}
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

            {/* 已删除的章节区域（按分组展示） */}
            {hiddenChapterGroups.length > 0 && (
              <div className="chapter-group hidden-chapters-section">
                <button
                  type="button"
                  className={`group-title ${hiddenSectionCollapsed ? "collapsed" : ""}`}
                  onClick={() => setHiddenSectionCollapsed((v) => !v)}
                  title={hiddenSectionCollapsed ? "点击展开" : "点击收起"}
                >
                  <span className={`group-title-arrow${hiddenSectionCollapsed ? "" : " expanded"}`}>
                    ▶
                  </span>
                  <span className="group-title-text">已删除的章节 ({hiddenChapterCount})</span>
                </button>
                {!hiddenSectionCollapsed && (
                  <div className="hidden-chapters-groups">
                    {hiddenChapterGroups.map(({ group, items }) => {
                      const isGroupExpanded = hiddenGroupExpanded.has(group);
                      return (
                        <div key={group} className="hidden-group">
                          <button
                            type="button"
                            className={`hidden-group-title ${isGroupExpanded ? "" : "collapsed"}`}
                            onClick={() =>
                              setHiddenGroupExpanded((prev) => {
                                const next = new Set(prev);
                                isGroupExpanded ? next.delete(group) : next.add(group);
                                return next;
                              })
                            }
                            onContextMenu={(e) => handleHiddenGroupContextMenu(e, group)}
                            title={isGroupExpanded ? "点击收起" : "点击展开"}
                          >
                            <span className={`group-title-arrow${isGroupExpanded ? " expanded" : ""}`}>
                              ▶
                            </span>
                            <span className="hidden-group-name">{group}</span>
                            <span className="hidden-group-count">{items.length}</span>
                          </button>
                          {isGroupExpanded && (
                          <ul>
                            {items.map((ch) => (
                              <li key={ch.id}>
                                <button
                                  className={`chapter-item ${activeId === ch.id ? "active" : ""} ${deletedChapterIds.has(ch.id) ? "deleted" : ""}`}
                                  onClick={() => onSelectChapter(ch.id)}
                                  onContextMenu={(e) => handleChapterContextMenu(e, ch.id)}
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
                  </div>
                )}
              </div>
            )}
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

      {/* 右键菜单 */}
      {ctxMenu && (
        <ContextMenu
          items={ctxMenuItems}
          position={ctxMenu.position}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </>
  );
}
