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
import useBookCategories, { makeSubGroupKey, parseSubGroupKey } from "../hooks/useBookCategories";

// =============================================================
// 书籍目录数据（从 SiteNav 移入，集中维护）
// =============================================================
const BOOK_CATEGORIES = [
  {
    name: "未分组",
    icon: "📋",
    books: [],
    system: true,
  },
  {
    name: "Python 编程",
    icon: "🐍",
    books: [
      { path: "/pybasic", label: "Python 基础路径", icon: "🌱" },
      { path: "/py", label: "Python 入门", icon: "🐍" },
      { path: "/py4", label: "Python 进阶", icon: "🐍" },
      { path: "/py6", label: "Python 全解", icon: "🐍" },
      { path: "/py8", label: "Python 大全", icon: "🐍" },
      { path: "/py9", label: "Python 逐层深入", icon: "📘" },
      { path: "/pymod", label: "模块与包", icon: "📦" },
      { path: "/pyex", label: "异常处理", icon: "⚠️" },
      { path: "/pyfile", label: "文件操作", icon: "📁" },
      { path: "/pyfile2", label: "文件管理", icon: "🗂️" },
      { path: "/pykit", label: "常用知识点", icon: "🧰" },
      { path: "/pynet", label: "网络编程", icon: "🌐" },
      { path: "/pydb", label: "数据库操作", icon: "🗄️" },
      { path: "/pyweb", label: "Python Web", icon: "🌐" },
      { path: "/pyweb2", label: "Web 后端开发", icon: "🌐" },
      { path: "/fastapi", label: "FastAPI", icon: "⚡" },
      { path: "/pysubprocess", label: "subprocess 子进程", icon: "🔌" },
      { path: "/pythread", label: "线程与进程", icon: "🧵" },
      { path: "/pythread2", label: "多线程入门", icon: "🧵" },
      { path: "/pyprocess", label: "多进程编程", icon: "🧬" },
      { path: "/pyasync", label: "asyncio 异步编程", icon: "🌊" },
      { path: "/pyasync2", label: "asyncio 异步 V2", icon: "🌊" },
      { path: "/pyeng", label: "工程化实践", icon: "⚙️" },
      { path: "/pyint", label: "原理图解", icon: "🔬" },
      { path: "/pyrun", label: "代码执行原理", icon: "🔬" },
      { path: "/pyarch", label: "设计与架构", icon: "🏛️" },
      { path: "/pyproject", label: "实战项目", icon: "🚀" },
      { path: "/pyjava", label: "Python vs Java", icon: "⚔️" },
      { path: "/pyvsjava", label: "Python vs Java 深度对比", icon: "⚔️" },
      { path: "/pyvsjs", label: "Python vs JS 深度对比", icon: "⚔️" },
      { path: "/py-definitive", label: "Python 权威指南", icon: "📕" },
      { path: "/py-backend", label: "Python Web后端大全", icon: "🏗️" },
    ],
  },
  {
    name: "JS / TS 生态",
    icon: "⬢",
    books: [
      { path: "/", label: "Node.js 入门", icon: "🟢" },
      { path: "/nodejs2", label: "Node.js 进阶", icon: "🟢" },
      { path: "/nodejs3", label: "Node.js 源码", icon: "🟡" },
      { path: "/ts", label: "TypeScript 入门", icon: "🔷" },
      { path: "/ts2", label: "TypeScript 进阶", icon: "🔶" },
      { path: "/ts3", label: "TypeScript 高阶实战", icon: "💠" },
      { path: "/workers", label: "Web Workers", icon: "👷" },
      { path: "/pnpm", label: "pnpm 包管理", icon: "📦" },
      { path: "/playground", label: "代码 Playground", icon: "🛝" },
    ],
  },
  {
    name: "Java 开发",
    icon: "☕",
    books: [
      { path: "/java", label: "Java 入门到精通", icon: "☕" },
      { path: "/java-web", label: "Java Web 开发", icon: "🌐" },
      { path: "/java-master", label: "Java 开发详解", icon: "📗" },
    ],
  },
  {
    name: "AI 智能开发",
    icon: "🤖",
    books: [
      { path: "/ai", label: "AI 编程入门", icon: "🤖" },
      { path: "/aiapp", label: "AI 应用编程", icon: "🤖" },
      { path: "/aipy", label: "Python AI 开发", icon: "🐍" },
      { path: "/ai-agent", label: "AI Agent 开发", icon: "🤖" },
    ],
  },
  {
    name: "前端工程",
    icon: "💻",
    books: [
      { path: "/nextjs", label: "Next.js", icon: "▲" },
      { path: "/sass", label: "Sass", icon: "💅" },
      { path: "/fe-engineering", label: "前端工程化", icon: "⚙️" },
      { path: "/fe-interview", label: "前端面试", icon: "🎯" },
    ],
  },
  {
    name: "后端与网络",
    icon: "🖥️",
    books: [
      { path: "/http", label: "HTTP 通信", icon: "🌐" },
      { path: "/net", label: "计算机网络", icon: "🌐" },
      { path: "/backend", label: "后端开发", icon: "🖥️" },
      { path: "/backend-essential", label: "后端开发必备知识", icon: "⚙️" },
      { path: "/gql", label: "GraphQL", icon: "◈" },
      { path: "/deploy", label: "部署与运维", icon: "🚀" },
      { path: "/go", label: "Go 语言", icon: "🐹" },
      { path: "/csharp", label: "C#", icon: "🟪" },
    ],
  },
  {
    name: "实战项目",
    icon: "🚀",
    books: [
      { path: "/todo", label: "Todo List 实战", icon: "✅" },
      { path: "/blog-tutorial", label: "Blog 系统教程", icon: "📝" },
      { path: "/blog", label: "博客系统", icon: "📰" },
    ],
  },
  {
    name: "数据库与缓存",
    icon: "🗄️",
    books: [
      { path: "/sql", label: "数据库开发", icon: "🗄️" },
      { path: "/mysql", label: "MySQL", icon: "🐬" },
      { path: "/redis", label: "Redis", icon: "🟥" },
      { path: "/mongo", label: "MongoDB", icon: "🍃" },
    ],
  },
  {
    name: "算法与数据结构",
    icon: "🧮",
    books: [
      { path: "/algo", label: "编程算法大全", icon: "📐" },
      { path: "/leetcode", label: "LeetCode 面试 200 题", icon: "🏆" },
    ],
  },
  {
    name: "计算机基础",
    icon: "🧠",
    books: [
      { path: "/cs", label: "计算机原理", icon: "💡" },
      { path: "/howitworks", label: "代码怎么跑起来", icon: "⚙️" },
      { path: "/os", label: "操作系统", icon: "🐧" },
      { path: "/prog-guide", label: "编程指南", icon: "📖" },
    ],
  },
  {
    name: "职场成长",
    icon: "🛤️",
    books: [
      { path: "/future", label: "程序员出路指南", icon: "🧭" },
      { path: "/career", label: "职业发展", icon: "🛤️" },
      { path: "/career40", label: "40岁下半场", icon: "🌅" },
      { path: "/work", label: "职场生存", icon: "💼" },
      { path: "/comm", label: "沟通交流", icon: "💬" },
    ],
  },
  {
    name: "身心健康",
    icon: "💚",
    books: [
      { path: "/psychology", label: "心向阳光", icon: "🧠" },
      { path: "/nervous", label: "与紧张和解", icon: "🌊" },
      { path: "/stomach", label: "脾胃调养", icon: "🌿" },
      { path: "/ibs", label: "肠易激康复", icon: "🫃" },
      { path: "/dignity", label: "放不下的愤怒", icon: "🕊️" },
      { path: "/hurt", label: "委屈的解剖学", icon: "💔" },
      { path: "/chicken-soup", label: "心灵鸡汤", icon: "🍲" },
    ],
  },
  {
    name: "人际智慧",
    icon: "🛡️",
    books: [
      { path: "/relations", label: "人际关系心理学", icon: "🤝" },
      { path: "/dui", label: "怼人艺术", icon: "🎯" },
      { path: "/fandui", label: "反怼心理学", icon: "🛡️" },
      { path: "/shield", label: "回怼护盾", icon: "🛡️" },
      { path: "/quotes", label: "怼人语录", icon: "💬" },
      { path: "/curse", label: "毒舌词典", icon: "🐍" },
      { path: "/rebut", label: "反驳的艺术", icon: "⚔️" },
      { path: "/unharmed", label: "破怒：翻篇指南", icon: "💔" },
      { path: "/talk-rebut", label: "谈话绝地反击", icon: "🗡️" },
    ],
  },
  {
    name: "已隐藏",
    icon: "🗂️",
    books: [],
    system: true,
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
  // 客户端挂载后从 localStorage 恢复侧边栏收起状态（避免 SSR hydration 不匹配）
  const [collapsedReady, setCollapsedReady] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar:collapsed");
      if (saved !== null) setCollapsed(saved === "true");
    } catch {}
    setCollapsedReady(true);
  }, []);
  const [width, setWidth] = useState(DEFAULT_SIDEBAR_W);
  const [bookDropdownOpen, setBookDropdownOpen] = useState(false);
  const bookDropdownRef = useRef(null);
  const router = useRouter();
  // 多展开模式：同一时间可以展开多个分类，方便跨分组拖拽书籍。
  // expandedCategories 为已展开分类名的 Set；空 Set 表示全部收起。
  // 初始默认展开"Python 编程"，打开下拉框时会恢复上次状态或自动展开当前书籍分组。
  const [expandedCategories, setExpandedCategories] = useState(() => new Set(["Python 编程"]));
  // 章节分组收起状态：用 Set 记录已收起的分组名。
  // 持久化到 localStorage，key 包含当前书籍路径，刷新后保持上次展开/收起状态。
  // 注意：初始化时不能用 lazy init，因为需要从 localStorage 读取（需要 currentPath），
  // 由下方 useEffect 负责首次加载恢复。
  const [collapsedGroups, setCollapsedGroups] = useState(
    () => new Set(groupedChapters.map((g) => g.group))
  );

  // ===== 右键菜单状态 =====
  const {
    hiddenBooks,
    hiddenChapterIds,
    hideChapter,
    unhideChapter,
    hideChapters,
    unhideChapters,
    clearHiddenBooks,
    resetAll: resetChapterPrefs,
  } = useBookChapterActions();

  const [ctxMenu, setCtxMenu] = useState(null);

  // ===== 分类重命名 / 新建分组的输入状态 =====
  const [editingCategory, setEditingCategory] = useState(null); // 正在重命名的分类名
  const [editValue, setEditValue] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const editInputRef = useRef(null);
  const addInputRef = useRef(null);

  // ===== 子分组状态 =====
  const [expandedSubGroups, setExpandedSubGroups] = useState(() => new Set());
  const [editingSubGroup, setEditingSubGroup] = useState(null); // { parent, sgId }
  const [editSubGroupValue, setEditSubGroupValue] = useState("");
  const [showAddSubGroup, setShowAddSubGroup] = useState(null); // parentName 或 null
  const [newSubGroupName, setNewSubGroupName] = useState("");
  const editSubGroupInputRef = useRef(null);
  const addSubGroupInputRef = useRef(null);
  // 子分组拖拽状态
  const sgDragStateRef = useRef(null); // { parent, sgId, key }
  const [sgDragIndicator, setSgDragIndicator] = useState(null); // { key, position: 'before'|'after' }
  // 书籍拖拽悬停在子分组标题上的 DOM
  const bookDragOverSubGroupRef = useRef(null);

  // ===== 书籍下拉框展开状态记忆 =====
  const DROPDOWN_EXPANDED_KEY = "sidebar:book-dropdown-expanded";
  // 标记是否已经执行过首次打开时的状态恢复（避免重复）
  const dropdownInitializedRef = useRef(false);
  // 内存中缓存的上次关闭时的展开状态（关闭时立即保存，打开时优先使用）
  const savedDropdownStateRef = useRef(null);

  // 重命名输入框聚焦
  useEffect(() => {
    if (editingCategory && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCategory]);

  // 新建输入框聚焦
  useEffect(() => {
    if (showAddInput && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [showAddInput]);

  // 子分组重命名输入框聚焦
  useEffect(() => {
    if (editingSubGroup && editSubGroupInputRef.current) {
      editSubGroupInputRef.current.focus();
      editSubGroupInputRef.current.select();
    }
  }, [editingSubGroup]);

  // 新建子分组输入框聚焦
  useEffect(() => {
    if (showAddSubGroup && addSubGroupInputRef.current) {
      addSubGroupInputRef.current.focus();
    }
  }, [showAddSubGroup]);

  // ===== 书籍分类管理（新建/重命名/删除/排序） =====
  const initiallyHiddenCats = useMemo(
    () => BOOK_CATEGORIES.filter((c) => c.hide && !c.system).map((c) => c.name),
    []
  );
  const { config: catConfig, addCategory, renameCategory, deleteCategory, isCustom: isCustomCategory, ensureOrderInitialized, reorderCategories, resetToDefaults: resetCatConfig, resetToConfig, addSubGroup, renameSubGroup, deleteSubGroup, getOrderedSubGroups } =
    useBookCategories(initiallyHiddenCats);

  // ===== 书籍拖拽排序 =====
  const { bookOrder, reorderInCategory, moveToCategory, renameCategoryInOrder, removeCategoryFromOrder, ensureCategory, moveBooksToCategory, mergeSubGroupIntoParent, updateOrder, resetToDefaults: resetBookOrder, resetToOrder, getOrderedPaths } =
    useBookDragDrop(BOOK_CATEGORIES);

  // ===== 用户保存的默认分组设置 =====
  const [savedDefaults, setSavedDefaults] = useState(null);
  useEffect(() => {
    fetch("/api/preferences")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        if (data.savedDefaults) setSavedDefaults(data.savedDefaults);
      })
      .catch(() => {});
  }, []);

  // 拖拽状态：记录正在拖拽的书籍信息
  const dragStateRef = useRef(null); // { bookPath, sourceCategory, sourceIndex }
  // 拖拽悬停展开分类的定时器
  const dragExpandTimerRef = useRef(null);
  // 分类标题拖拽状态
  const catDragStateRef = useRef(null); // { catName, startY }
  const [catDragIndicator, setCatDragIndicator] = useState(null); // { catName, position: 'before'|'after' }
  const draggingCatRef = useRef(null); // 正在拖拽的分类标题 DOM
  // 记录最后一次拖拽结束时间，用于阻止拖拽后的意外点击（浏览器在 dragend 后可能触发 click）
  const lastDragEndTimeRef = useRef(0);
  // 书籍拖拽悬停在分类标题上的 DOM（用于高亮提示可以放置）
  const bookDragOverTitleRef = useRef(null);

  // 构建 bookPath → 默认分类名 的映射（用于归还书籍到默认分组）
  const bookDefaultCategory = useMemo(() => {
    const map = {};
    BOOK_CATEGORIES.forEach((cat) => {
      if (cat.system) return;
      cat.books.forEach((b) => {
        map[b.path] = cat.name;
      });
    });
    return map;
  }, []);

  // 统一维护 bookOrder 数据一致性：确保每本书都在正确的分类中
  // - 旧 hiddenBooks 中的书籍 → "已隐藏"（这些是用户之前主动隐藏的）
  // - 在被隐藏默认分类中的书籍 → "未分组"（分组被隐藏，书不应自动变隐藏）
  // - 在被删除自定义分类中的书籍 → 归还到默认分类或"未分组"
  // - 完全不在 bookOrder 中的书籍 → 默认分类（可见）或"未分组"
  // - 清理无效路径（已删除书籍的旧路径）
  // - 清理已不存在的分类 key（已删除的自定义分类、已隐藏默认分类的冗余 key）
  useEffect(() => {
    const moves = [];
    const assignedPaths = new Set();
    const catsToRemove = [];
    const allValidPaths = new Set(ALL_BOOKS.map((b) => b.path));

    // 收集所有合法的分类名（系统分类 + 可见默认分类 + 自定义分类）
    const validCatNames = new Set();
    validCatNames.add("未分组");
    validCatNames.add("已隐藏");
    BOOK_CATEGORIES.forEach((c) => {
      if (c.system) return;
      if (!catConfig.hidden.includes(c.name)) {
        validCatNames.add(catConfig.renamed[c.name] || c.name);
      }
    });
    catConfig.custom.forEach((c) => validCatNames.add(c.name));

    // 收集当前 bookOrder 中所有已分配的书籍路径，同时检查隐藏/已删除分类
    for (const [catName, paths] of Object.entries(bookOrder)) {
      // 过滤掉无效路径
      const validPaths = paths.filter((p) => allValidPaths.has(p));

      // 检查是否是子分组 key
      const parsedSg = parseSubGroupKey(catName);
      if (parsedSg) {
        const { parent: parentName, sgId } = parsedSg;
        // 父分类不存在 → 书籍移到未分组
        if (!validCatNames.has(parentName)) {
          validPaths.forEach((p) => {
            if (!assignedPaths.has(p)) {
              assignedPaths.add(p);
              moves.push({ path: p, toCategory: "未分组" });
            }
          });
          catsToRemove.push({ cat: catName, remove: true });
          continue;
        }
        // 子分组已被删除 → 书籍移回父分类根级
        const sgList = catConfig.subGroups[parentName] || [];
        const sgExists = sgList.some((sg) => sg.id === sgId);
        if (!sgExists) {
          validPaths.forEach((p) => {
            if (!assignedPaths.has(p)) {
              assignedPaths.add(p);
              moves.push({ path: p, toCategory: parentName });
            }
          });
          catsToRemove.push({ cat: catName, remove: true });
          continue;
        }
        // 子分组有效，收集有效路径
        validPaths.forEach((p) => assignedPaths.add(p));
        if (validPaths.length !== paths.length) {
          catsToRemove.push({ cat: catName, clean: validPaths });
        }
        continue;
      }

      // 跳过系统分类，直接收集有效路径
      if (catName === "未分组" || catName === "已隐藏") {
        validPaths.forEach((p) => assignedPaths.add(p));
        // 如果有无效路径被过滤掉，需要更新
        if (validPaths.length !== paths.length) {
          catsToRemove.push({ cat: catName, clean: validPaths });
        }
        continue;
      }

      // 分类不存在（已删除的自定义分类或已隐藏的默认分类），其中的书需要重新分配
      if (!validCatNames.has(catName)) {
        validPaths.forEach((p) => {
          if (!assignedPaths.has(p)) {
            assignedPaths.add(p);
            const defCat = bookDefaultCategory[p];
            if (!defCat || catConfig.hidden.includes(defCat)) {
              moves.push({ path: p, toCategory: "未分组" });
            } else {
              const displayName = catConfig.renamed[defCat] || defCat;
              moves.push({ path: p, toCategory: displayName });
            }
          }
        });
        catsToRemove.push({ cat: catName, remove: true });
        continue;
      }

      // 找原始分类名（考虑重命名），检查是否是被隐藏的默认分类
      let origName = catName;
      for (const [orig, renamed] of Object.entries(catConfig.renamed)) {
        if (renamed === catName) { origName = orig; break; }
      }
      const isDefault = BOOK_CATEGORIES.some((c) => c.name === origName && !c.system);
      const isHidden = isDefault && catConfig.hidden.includes(origName);
      if (isHidden) {
        // 默认分类被隐藏了，把其中的书移到"未分组"
        validPaths.forEach((p) => {
          if (!assignedPaths.has(p)) {
            assignedPaths.add(p);
            moves.push({ path: p, toCategory: "未分组" });
          }
        });
        catsToRemove.push({ cat: catName, remove: true });
      } else {
        validPaths.forEach((p) => assignedPaths.add(p));
        // 如果有无效路径被过滤掉，记录需要清理
        if (validPaths.length !== paths.length) {
          catsToRemove.push({ cat: catName, clean: validPaths });
        }
      }
    }

    // 收集旧 hiddenBooks 中的书籍（用户主动隐藏的，保留在已隐藏）
    if (hiddenBooks.size > 0) {
      hiddenBooks.forEach((p) => {
        if (allValidPaths.has(p) && !assignedPaths.has(p)) {
          assignedPaths.add(p);
          moves.push({ path: p, toCategory: "已隐藏" });
        }
      });
    }

    // 检查所有书籍是否都在 bookOrder 中
    ALL_BOOKS.forEach((b) => {
      if (assignedPaths.has(b.path)) return;
      const defCat = bookDefaultCategory[b.path];
      if (!defCat || catConfig.hidden.includes(defCat)) {
        moves.push({ path: b.path, toCategory: "未分组" });
      } else {
        const displayName = catConfig.renamed[defCat] || defCat;
        moves.push({ path: b.path, toCategory: displayName });
      }
    });

    // 需要清理或更新分类
    if (catsToRemove.length > 0 || moves.length > 0) {
      updateOrder((prev) => {
        let next = { ...prev };
        // 处理分类清理
        catsToRemove.forEach(({ cat, remove, clean }) => {
          if (remove) {
            delete next[cat];
          } else if (clean) {
            next[cat] = clean;
          }
        });
        // 如果有书籍需要移动
        if (moves.length > 0) {
          const pathSet = new Set(moves.map((m) => m.path));
          for (const cat of Object.keys(next)) {
            next[cat] = next[cat].filter((p) => !pathSet.has(p));
          }
          for (const { path, toCategory } of moves) {
            if (!next[toCategory]) next[toCategory] = [];
            next[toCategory] = [...next[toCategory], path];
          }
        }
        return next;
      });
    }
    if (hiddenBooks.size > 0) {
      clearHiddenBooks();
    }
  }, [bookOrder, catConfig.hidden, catConfig.renamed, catConfig.custom, catConfig.subGroups, hiddenBooks, updateOrder, clearHiddenBooks, bookDefaultCategory]);

  // 根据排序、自定义分类、隐藏状态计算最终可见的分类列表（含子分组）
  const visibleCategories = useMemo(() => {
    // 1. 处理默认分类：过滤隐藏的（系统分类"未分组""已隐藏"永不隐藏）、应用重命名和图标
    const defaultCats = BOOK_CATEGORIES
      .filter((cat) => cat.system || !catConfig.hidden.includes(cat.name))
      .map((cat) => ({
        ...cat,
        name: cat.system ? cat.name : (catConfig.renamed[cat.name] || cat.name),
        icon: cat.system ? cat.icon : (catConfig.icons[catConfig.renamed[cat.name] || cat.name] || cat.icon),
        isCustom: false,
      }));

    // 2. 添加自定义分类
    const customCats = catConfig.custom.map((c) => ({
      name: c.name,
      icon: c.icon || "📁",
      books: [],
      isCustom: true,
      id: c.id,
    }));

    // 3. 分离系统分类："未分组"固定最前，"已隐藏"固定最后
    const allMerged = [...defaultCats, ...customCats];
    const ungroupedCat = allMerged.find((c) => c.name === "未分组");
    const hiddenCat = allMerged.find((c) => c.name === "已隐藏");
    const regularCats = allMerged.filter((c) => c.name !== "未分组" && c.name !== "已隐藏");

    // 4. 应用自定义排序（不包含系统分类）
    let sortedRegular = regularCats;
    if (catConfig.order && catConfig.order.length > 0) {
      const orderMap = new Map();
      catConfig.order.forEach((name, i) => {
        if (name !== "未分组" && name !== "已隐藏") orderMap.set(name, i);
      });
      sortedRegular = [...regularCats].sort((a, b) => {
        const ai = orderMap.has(a.name) ? orderMap.get(a.name) : 999;
        const bi = orderMap.has(b.name) ? orderMap.get(b.name) : 999;
        return ai - bi;
      });
    }

    // 组装：未分组 → 普通分类 → 已隐藏
    let allCats = [
      ...(ungroupedCat ? [ungroupedCat] : []),
      ...sortedRegular,
      ...(hiddenCat ? [hiddenCat] : []),
    ];

    // 5. 收集所有 bookOrder 中已分配的书籍路径（区分根级和子分组）
    const assignedPaths = new Set();
    const subGroupBooks = {}; // sgKey -> [paths]
    Object.entries(bookOrder).forEach(([key, paths]) => {
      const parsed = parseSubGroupKey(key);
      if (parsed) {
        subGroupBooks[key] = paths;
        paths.forEach((p) => assignedPaths.add(p));
      } else {
        paths.forEach((p) => assignedPaths.add(p));
      }
    });

    // 6. 找出未分配的书籍，归入合适的分类根级
    const unassigned = {};
    ALL_BOOKS.forEach((b) => {
      if (assignedPaths.has(b.path)) return;
      const defCat = bookDefaultCategory[b.path];
      if (!defCat) {
        if (!unassigned["未分组"]) unassigned["未分组"] = [];
        unassigned["未分组"].push(b.path);
        return;
      }
      if (catConfig.hidden.includes(defCat)) {
        if (!unassigned["未分组"]) unassigned["未分组"] = [];
        unassigned["未分组"].push(b.path);
        return;
      }
      const displayName = catConfig.renamed[defCat] || defCat;
      if (!unassigned[displayName]) unassigned[displayName] = [];
      unassigned[displayName].push(b.path);
    });

    // 7. 为每个分类构建根级books和子分组结构
    return allCats.map((cat) => {
      const catName = cat.name;
      let orderedPaths = [...(getOrderedPaths(catName) || [])];
      if (unassigned[catName]) {
        orderedPaths = [...orderedPaths, ...unassigned[catName]];
      }
      const rootBooks = orderedPaths
        .map((p) => ALL_BOOKS.find((b) => b.path === p))
        .filter(Boolean);

      // 获取该分类下的子分组
      const subGroups = getOrderedSubGroups(catName).map((sg) => {
        const sgKey = makeSubGroupKey(catName, sg.id);
        const sgPaths = subGroupBooks[sgKey] || getOrderedPaths(sgKey) || [];
        return {
          id: sg.id,
          key: sgKey,
          name: sg.name,
          books: sgPaths
            .map((p) => ALL_BOOKS.find((b) => b.path === p))
            .filter(Boolean),
        };
      });

      return {
        ...cat,
        books: rootBooks,
        subGroups,
      };
    }).filter((cat) => {
      return true;
    });
  }, [catConfig, getOrderedPaths, bookOrder, bookDefaultCategory, getOrderedSubGroups]);

  // 根据隐藏状态过滤后的章节分组
  const filteredGroupedChapters = useMemo(() => {
    return groupedChapters
      .map((g) => ({
        ...g,
        items: g.items.filter((c) => !hiddenChapterIds.has(c.id)),
      }))
      .filter((g) => g.items.length > 0);
  }, [groupedChapters, hiddenChapterIds]);

  // 已读的章节，按原始分组归类（用于"已读的章节"区域）
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
  const handleBookContextMenu = useCallback((e, bookPath, categoryName) => {
    e.preventDefault();
    setCtxMenu({ type: "book", target: bookPath, category: categoryName, position: { x: e.clientX, y: e.clientY } });
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

  // 书籍分类标题右键
  const handleCategoryContextMenu = useCallback((e, categoryName) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ type: "book-category", target: categoryName, position: { x: e.clientX, y: e.clientY } });
  }, []);

  // 子分组标题右键
  const handleSubGroupContextMenu = useCallback((e, parentName, sgId, sgName) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ type: "sub-group", target: { parent: parentName, sgId, name: sgName }, position: { x: e.clientX, y: e.clientY } });
  }, []);

  // 开始新建子分组
  const startAddSubGroup = useCallback((parentName) => {
    setShowAddSubGroup(parentName);
    setNewSubGroupName("");
    setCtxMenu(null);
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.add(parentName);
      return next;
    });
  }, []);

  // 确认新建子分组
  const confirmAddSubGroup = useCallback(() => {
    const parentName = showAddSubGroup;
    const name = newSubGroupName.trim();
    if (!parentName || !name) {
      setShowAddSubGroup(null);
      setNewSubGroupName("");
      return;
    }
    const sgId = addSubGroup(parentName, name);
    const sgKey = makeSubGroupKey(parentName, sgId);
    ensureCategory(sgKey);
    setExpandedSubGroups((prev) => {
      const next = new Set(prev);
      next.add(sgKey);
      return next;
    });
    setShowAddSubGroup(null);
    setNewSubGroupName("");
  }, [showAddSubGroup, newSubGroupName, addSubGroup, ensureCategory]);

  // 开始重命名子分组
  const startRenameSubGroup = useCallback((parentName, sgId, sgName) => {
    setEditingSubGroup({ parent: parentName, sgId });
    setEditSubGroupValue(sgName);
    setCtxMenu(null);
  }, []);

  // 确认重命名子分组
  const confirmRenameSubGroup = useCallback(() => {
    if (!editingSubGroup) return;
    const { parent, sgId } = editingSubGroup;
    const newName = editSubGroupValue.trim();
    if (!newName) {
      setEditingSubGroup(null);
      setEditSubGroupValue("");
      return;
    }
    renameSubGroup(parent, sgId, newName);
    setEditingSubGroup(null);
    setEditSubGroupValue("");
  }, [editingSubGroup, editSubGroupValue, renameSubGroup]);

  // 删除子分组（书籍移回父分类根级）
  const handleDeleteSubGroup = useCallback((parentName, sgId) => {
    const sgKey = makeSubGroupKey(parentName, sgId);
    mergeSubGroupIntoParent(sgKey);
    deleteSubGroup(parentName, sgId);
    setExpandedSubGroups((prev) => {
      const next = new Set(prev);
      next.delete(sgKey);
      return next;
    });
    setCtxMenu(null);
  }, [mergeSubGroupIntoParent, deleteSubGroup]);

  // 开始重命名分类
  const startRenameCategory = useCallback((name) => {
    setEditingCategory(name);
    setEditValue(name);
    setCtxMenu(null);
  }, []);

  // 确认重命名
  const confirmRenameCategory = useCallback(() => {
    const oldName = editingCategory;
    const newName = editValue.trim();
    if (!oldName || !newName || newName === oldName) {
      setEditingCategory(null);
      setEditValue("");
      return;
    }
    // 检查重名
    const existingNames = visibleCategories.map((c) => c.name);
    if (existingNames.includes(newName)) {
      setEditingCategory(null);
      setEditValue("");
      return;
    }
    renameCategory(oldName, newName);
    renameCategoryInOrder(oldName, newName);
    // 更新展开状态中的名称
    setExpandedCategories((prev) => {
      if (!prev.has(oldName)) return prev;
      const next = new Set(prev);
      next.delete(oldName);
      next.add(newName);
      return next;
    });
    setEditingCategory(null);
    setEditValue("");
  }, [editingCategory, editValue, renameCategory, renameCategoryInOrder, visibleCategories]);

  // 删除/隐藏分类
  const handleDeleteCategory = useCallback((name) => {
    setCtxMenu(null);
    const orderedPaths = getOrderedPaths(name);
    const isCustom = isCustomCategory(name);

    if (orderedPaths.length > 0) {
      const moves = orderedPaths
        .map((p) => {
          const defCat = bookDefaultCategory[p];
          if (!defCat) return { path: p, toCategory: "未分组" };
          if (catConfig.hidden.includes(defCat)) return { path: p, toCategory: "未分组" };
          if (isCustom) {
            const displayName = catConfig.renamed[defCat] || defCat;
            return { path: p, toCategory: displayName };
          }
          return { path: p, toCategory: "未分组" };
        });
      moveBooksToCategory(moves);
    }

    removeCategoryFromOrder(name);
    deleteCategory(name);
    // 从展开集合中移除
    setExpandedCategories((prev) => {
      if (!prev.has(name)) return prev;
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
  }, [getOrderedPaths, isCustomCategory, bookDefaultCategory, catConfig.hidden, catConfig.renamed, moveBooksToCategory, removeCategoryFromOrder, deleteCategory]);

  // 确认新建分组
  const confirmAddCategory = useCallback(() => {
    const name = newCatName.trim();
    if (!name) {
      setShowAddInput(false);
      setNewCatName("");
      return;
    }
    const existingNames = visibleCategories.map((c) => c.name);
    if (existingNames.includes(name)) {
      setShowAddInput(false);
      setNewCatName("");
      return;
    }
    addCategory(name);
    ensureCategory(name);
    // 自动展开新分组
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.add(name);
      return next;
    });
    setShowAddInput(false);
    setNewCatName("");
  }, [newCatName, addCategory, ensureCategory, visibleCategories]);

  // 重置所有设置：恢复默认分组、排序、隐藏状态
  const handleResetAll = useCallback(() => {
    const hasSaved = savedDefaults && savedDefaults.bookOrder && savedDefaults.categoryConfig;
    const msg = hasSaved
      ? "确定要重置书籍分组设置吗？\n\n将恢复到你上次保存的默认分组布局。"
      : "确定要重置所有书籍分组设置吗？\n\n将恢复系统默认分组、排序，清空自定义分组和子分组。";
    if (!window.confirm(msg)) return;
    setShowAddInput(false);
    setNewCatName("");
    setEditingCategory(null);
    setEditValue("");
    setShowAddSubGroup(null);
    setNewSubGroupName("");
    setEditingSubGroup(null);
    setEditSubGroupValue("");
    setExpandedCategories(new Set(["Python 编程"]));
    setExpandedSubGroups(new Set());
    if (hasSaved) {
      resetToOrder(savedDefaults.bookOrder);
      resetToConfig(savedDefaults.categoryConfig);
    } else {
      resetBookOrder(BOOK_CATEGORIES);
      resetCatConfig();
    }
    resetChapterPrefs();
  }, [savedDefaults, resetBookOrder, resetCatConfig, resetToOrder, resetToConfig, resetChapterPrefs]);

  // 保存当前分组布局为默认设置
  const handleSaveAsDefault = useCallback(() => {
    if (!window.confirm("保存当前分组和排序为默认布局？\n\n下次重置时将恢复到这个状态。")) return;
    const defaults = { bookOrder: { ...bookOrder }, categoryConfig: { ...catConfig } };
    setSavedDefaults(defaults);
    fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ savedDefaults: defaults }),
    }).catch(() => {});
  }, [bookOrder, catConfig]);

  // 恢复出厂设置：清除用户保存的默认 + 重置到系统硬编码默认
  const handleFactoryReset = useCallback(() => {
    if (!window.confirm("确定要恢复出厂设置吗？\n\n这将清除你保存的自定义默认布局，所有分组、排序、自定义分组和子分组都将恢复到代码中的初始状态。")) return;
    setSavedDefaults(null);
    fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ savedDefaults: null }),
    }).catch(() => {});
    setShowAddInput(false);
    setNewCatName("");
    setEditingCategory(null);
    setEditValue("");
    setShowAddSubGroup(null);
    setNewSubGroupName("");
    setEditingSubGroup(null);
    setEditSubGroupValue("");
    setExpandedCategories(new Set(["Python 编程"]));
    setExpandedSubGroups(new Set());
    resetBookOrder(BOOK_CATEGORIES);
    resetCatConfig();
    resetChapterPrefs();
  }, [resetBookOrder, resetCatConfig, resetChapterPrefs]);

  // 根据右键菜单类型构建菜单项
  const ctxMenuItems = useMemo(() => {
    if (!ctxMenu) return [];

    if (ctxMenu.type === "book") {
      const isInHidden = ctxMenu.category === "已隐藏";
      if (isInHidden) {
        // 在已隐藏分组中：移回默认分组；若默认分组不可用则进"未分组"
        const defCat = bookDefaultCategory[ctxMenu.target];
        const targetCat = defCat && !catConfig.hidden.includes(defCat)
          ? (catConfig.renamed[defCat] || defCat)
          : "未分组";
        return [
          {
            label: "移出已隐藏",
            icon: "👁️",
            onClick: () => moveBooksToCategory([{ path: ctxMenu.target, toCategory: targetCat }]),
          },
        ];
      } else {
        return [
          {
            label: "移入已隐藏",
            icon: "🙈",
            onClick: () => moveBooksToCategory([{ path: ctxMenu.target, toCategory: "已隐藏" }]),
          },
        ];
      }
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
      const isHidden = hiddenChapterIds.has(ctxMenu.target);
      const items = [];
      items.push(
        isHidden
          ? { label: "恢复此章节", icon: "↩️", onClick: () => unhideChapter(ctxMenu.target) }
          : { label: "已读此章节", icon: "✅", onClick: () => hideChapter(ctxMenu.target) }
      );
      return items;
    }

    if (ctxMenu.type === "book-category") {
      const catName = ctxMenu.target;
      const isSystem = catName === "未分组" || catName === "已隐藏";
      const isCustom = isCustomCategory(catName);
      const items = [];
      if (!isSystem) {
        items.push({ label: "新建子分组", icon: "📁", onClick: () => startAddSubGroup(catName) });
        items.push({ divider: true });
        items.push({ label: "重命名", icon: "✏️", onClick: () => startRenameCategory(catName) });
        items.push({
          label: isCustom ? "删除分组" : "隐藏分组",
          icon: "🗑️",
          danger: true,
          onClick: () => handleDeleteCategory(catName),
        });
      }
      return items;
    }

    if (ctxMenu.type === "sub-group") {
      const { parent, sgId, name } = ctxMenu.target;
      return [
        { label: "重命名", icon: "✏️", onClick: () => startRenameSubGroup(parent, sgId, name) },
        {
          label: "删除子分组",
          icon: "🗑️",
          danger: true,
          onClick: () => {
            if (window.confirm(`删除子分组"${name}"？其中的书籍将移回父分类根级。`)) {
              handleDeleteSubGroup(parent, sgId);
            }
          },
        },
      ];
    }

    return [];
  }, [
    ctxMenu, hiddenChapterIds, groupedChapters,
    hideChapter, unhideChapter, hideChapters, unhideChapters,
    startRenameCategory, handleDeleteCategory, isCustomCategory,
    bookDefaultCategory, catConfig.renamed, moveBooksToCategory,
    startAddSubGroup, startRenameSubGroup, handleDeleteSubGroup,
  ]);

  // ===== 书籍拖拽事件处理 =====

  // 记录上一次显示的拖拽指示器，避免重复 DOM 操作导致闪烁
  const lastIndicatorRef = useRef({ el: null, type: null });

  // 清除所有卡片上的拖拽指示类
  const clearAllDragIndicators = useCallback(() => {
    if (lastIndicatorRef.current.el) {
      lastIndicatorRef.current.el.classList.remove("drag-over-before", "drag-over-after");
    }
    lastIndicatorRef.current = { el: null, type: null };
    document.querySelectorAll(".drag-over-before, .drag-over-after").forEach((el) => {
      el.classList.remove("drag-over-before", "drag-over-after");
    });
  }, []);

  // 清除书籍拖拽悬停在分类标题上的高亮
  const clearBookDragTitleHighlight = useCallback(() => {
    if (bookDragOverTitleRef.current) {
      bookDragOverTitleRef.current.classList.remove("book-drop-target");
      bookDragOverTitleRef.current = null;
    }
  }, []);

  // 清除书籍拖拽悬停在子分组标题上的高亮
  const clearBookDragSubGroupHighlight = useCallback(() => {
    if (bookDragOverSubGroupRef.current) {
      bookDragOverSubGroupRef.current.classList.remove("book-drop-target");
      bookDragOverSubGroupRef.current = null;
    }
  }, []);

  // 清除子分组拖拽指示器
  const clearSgDragIndicator = useCallback(() => {
    document.querySelectorAll(".sg-drag-over-before, .sg-drag-over-after").forEach((el) => {
      el.classList.remove("sg-drag-over-before", "sg-drag-over-after");
    });
    setSgDragIndicator(null);
  }, []);

  // 拖拽开始：记录来源信息
  const handleDragStart = useCallback((e, bookPath, categoryName, index) => {
    dragStateRef.current = { bookPath, sourceCategory: categoryName, sourceIndex: index };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", bookPath);
    // 立即添加 dragging 类，确保第一次 dragover 时拖拽源已被排除
    e.target.classList.add("dragging");
  }, []);

  // 拖拽结束：清理状态
  const handleDragEnd = useCallback((e) => {
    e.target.classList.remove("dragging");
    clearAllDragIndicators();
    clearBookDragTitleHighlight();
    clearBookDragSubGroupHighlight();
    document.querySelectorAll(".grid-drop-active").forEach((el) => {
      el.classList.remove("grid-drop-active");
    });
    // 清理悬停展开定时器
    if (dragExpandTimerRef.current !== null) {
      clearTimeout(dragExpandTimerRef.current);
      dragExpandTimerRef.current = null;
    }
    dragStateRef.current = null;
    sgDragStateRef.current = null;
  }, [clearAllDragIndicators, clearBookDragTitleHighlight, clearBookDragSubGroupHighlight]);

  // 统一由网格 dragover 计算插入位置（避免卡片和网格两个处理器切换时闪烁）
  const handleGridDragOver = useCallback((e, categoryName) => {
    if (!dragStateRef.current) return;
    if (catDragStateRef.current) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    clearBookDragTitleHighlight();

    const grid = e.currentTarget;
    grid.classList.remove("grid-drop-active");
    // 使用 data-book-path 排除正在拖拽的卡片，而非依赖 CSS 类（重渲染时类会丢失）
    const draggingPath = dragStateRef.current.bookPath;
    const allCards = grid.querySelectorAll(".sidebar-book-card");
    const cards = Array.from(allCards).filter((el) => el.dataset.bookPath !== draggingPath);

    // 工具：设置指示器，只在变化时操作 DOM，避免闪烁
    const setIndicator = (el, type) => {
      const last = lastIndicatorRef.current;
      if (last.el === el && last.type === type) return;
      if (last.el) {
        last.el.classList.remove("drag-over-before", "drag-over-after");
      }
      if (el && type) {
        el.classList.add(type);
      }
      lastIndicatorRef.current = { el, type };
    };

    if (cards.length === 0) {
      setIndicator(null, null);
      grid.classList.add("grid-drop-active");
      grid._dragInsertIndex = 0;
      return;
    }

    const rects = cards.map((c) => c.getBoundingClientRect());
    const { clientX, clientY } = e;
    const lastIdx = cards.length - 1;

    // 1. 在所有卡片上方 → 插入开头
    if (clientY < rects[0].top) {
      setIndicator(cards[0], "drag-over-before");
      grid._dragInsertIndex = 0;
      return;
    }

    // 2. 在所有卡片下方 → 追加末尾
    if (clientY > rects[lastIdx].bottom) {
      setIndicator(cards[lastIdx], "drag-over-after");
      grid._dragInsertIndex = cards.length;
      return;
    }

    // 3. 找到鼠标所在行（垂直覆盖 clientY 的卡片）
    const rowIndices = [];
    for (let i = 0; i < rects.length; i++) {
      if (clientY >= rects[i].top && clientY <= rects[i].bottom) {
        rowIndices.push(i);
      }
    }

    if (rowIndices.length > 0) {
      const firstInRow = rowIndices[0];
      const lastInRow = rowIndices[rowIndices.length - 1];
      const rowLeft = rects[firstInRow].left;
      const rowRight = rects[lastInRow].right;

      // 3a. 在该行所有卡片右侧
      if (clientX > rowRight) {
        if (lastInRow === lastIdx) {
          // 最后一行最右 → 追加末尾
          setIndicator(cards[lastIdx], "drag-over-after");
          grid._dragInsertIndex = cards.length;
        } else {
          // 非最后行右侧 → 下一行第一个卡片前
          setIndicator(cards[lastInRow + 1], "drag-over-before");
          grid._dragInsertIndex = lastInRow + 1;
        }
        return;
      }

      // 3b. 在该行左侧 → 插入该行第一个卡片前
      if (clientX < rowLeft) {
        setIndicator(cards[firstInRow], "drag-over-before");
        grid._dragInsertIndex = firstInRow;
        return;
      }

      // 3c. 在卡片上：遍历行内卡片，根据中线判断插前面还是后面
      for (let i = 0; i < rowIndices.length; i++) {
        const idx = rowIndices[i];
        const r = rects[idx];
        const midX = r.left + r.width / 2;
        if (clientX < midX) {
          setIndicator(cards[idx], "drag-over-before");
          grid._dragInsertIndex = idx;
          return;
        }
        if (i === rowIndices.length - 1 || clientX < rects[rowIndices[i + 1]].left) {
          setIndicator(cards[idx], "drag-over-after");
          grid._dragInsertIndex = idx + 1;
          return;
        }
      }
    }

    // 4. 在两行之间（行间距 gap 区域）：根据 Y 位置判断是上一行末尾还是下一行开头
    for (let i = 0; i < lastIdx; i++) {
      if (clientY > rects[i].bottom && clientY < rects[i + 1].top) {
        const gapMidY = (rects[i].bottom + rects[i + 1].top) / 2;
        if (clientY < gapMidY) {
          setIndicator(cards[i], "drag-over-after");
          grid._dragInsertIndex = i + 1;
        } else {
          setIndicator(cards[i + 1], "drag-over-before");
          grid._dragInsertIndex = i + 1;
        }
        return;
      }
    }

    // 兜底：追加末尾
    setIndicator(cards[lastIdx], "drag-over-after");
    grid._dragInsertIndex = cards.length;
  }, [clearBookDragTitleHighlight]);

  // 拖拽离开网格区域时清除空网格高亮
  const handleGridDragLeave = useCallback((e) => {
    const grid = e.currentTarget;
    const rect = grid.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      grid.classList.remove("grid-drop-active");
    }
  }, []);

  // 在书籍卡片上释放：只 preventDefault 标记为有效放置目标，让事件冒泡到 grid 统一处理
  const handleCardDrop = useCallback(
    (e) => {
      e.preventDefault();
    },
    []
  );

  // 在网格任意位置释放（卡片上或空白区），使用 dragover 时已计算好的 _dragInsertIndex
  const handleGridDrop = useCallback(
    (e, toCategory) => {
      e.preventDefault();
      clearAllDragIndicators();
      clearBookDragTitleHighlight();
      clearBookDragSubGroupHighlight();
      e.currentTarget.classList.remove("grid-drop-active");
      const ds = dragStateRef.current;
      if (!ds) return;

      const grid = e.currentTarget;
      const insertIndex = typeof grid._dragInsertIndex === "number" ? grid._dragInsertIndex : getOrderedPaths(toCategory).length;
      grid._dragInsertIndex = undefined;

      if (ds.sourceCategory === toCategory) {
        const adjustedInsertIndex = insertIndex <= ds.sourceIndex ? insertIndex : insertIndex + 1;
        reorderInCategory(toCategory, ds.sourceIndex, adjustedInsertIndex);
      } else {
        moveToCategory(ds.sourceCategory, ds.sourceIndex, toCategory, insertIndex);
        const parsed = parseSubGroupKey(toCategory);
        if (parsed) {
          setExpandedCategories((prev) => {
            if (prev.has(parsed.parent)) return prev;
            const next = new Set(prev);
            next.add(parsed.parent);
            return next;
          });
          setExpandedSubGroups((prev) => {
            if (prev.has(toCategory)) return prev;
            const next = new Set(prev);
            next.add(toCategory);
            return next;
          });
        } else {
          setExpandedCategories((prev) => {
            if (prev.has(toCategory)) return prev;
            const next = new Set(prev);
            next.add(toCategory);
            return next;
          });
        }
      }
      dragStateRef.current = null;
      if (dragExpandTimerRef.current !== null) {
        clearTimeout(dragExpandTimerRef.current);
        dragExpandTimerRef.current = null;
      }
    },
    [reorderInCategory, moveToCategory, clearAllDragIndicators, clearBookDragTitleHighlight, clearBookDragSubGroupHighlight, getOrderedPaths]
  );

  // ===== 分类标题拖拽排序 =====
  const clearCatDragIndicator = useCallback(() => {
    document.querySelectorAll(".cat-drag-over-before, .cat-drag-over-after").forEach((el) => {
      el.classList.remove("cat-drag-over-before", "cat-drag-over-after");
    });
    setCatDragIndicator(null);
  }, []);

  const handleCatDragStart = useCallback((e, catName) => {
    if (catName === "已隐藏" || catName === "未分组") {
      e.preventDefault();
      return;
    }
    catDragStateRef.current = { catName };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "category:" + catName);
    requestAnimationFrame(() => {
      e.target.classList.add("dragging-cat");
      draggingCatRef.current = e.target;
    });
  }, []);

  const handleCatDragEnd = useCallback((e) => {
    e.target.classList.remove("dragging-cat");
    clearCatDragIndicator();
    catDragStateRef.current = null;
    draggingCatRef.current = null;
  }, [clearCatDragIndicator]);

  const handleCatDragOver = useCallback((e, catName) => {
    const ds = catDragStateRef.current;
    if (!ds) return;
    if (catName === "已隐藏" || ds.catName === catName) {
      clearCatDragIndicator();
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";

    const titleEl = e.currentTarget;
    const rect = titleEl.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? "before" : "after";

    setCatDragIndicator((prev) => {
      if (prev && prev.catName === catName && prev.position === position) return prev;
      return { catName, position };
    });

    document.querySelectorAll(".cat-drag-over-before, .cat-drag-over-after").forEach((el) => {
      el.classList.remove("cat-drag-over-before", "cat-drag-over-after");
    });
    titleEl.classList.add(position === "before" ? "cat-drag-over-before" : "cat-drag-over-after");
  }, [clearCatDragIndicator]);

  const handleCatDragLeave = useCallback((e) => {
    const related = e.relatedTarget;
    if (related && e.currentTarget.contains(related)) return;
    e.currentTarget.classList.remove("cat-drag-over-before", "cat-drag-over-after");
  }, []);

  const handleCatDrop = useCallback((e, targetCatName) => {
    e.preventDefault();
    e.stopPropagation();
    clearCatDragIndicator();
    const ds = catDragStateRef.current;
    if (!ds) return;
    const sourceName = ds.catName;
    if (sourceName === targetCatName || targetCatName === "已隐藏" || targetCatName === "未分组") return;

    // 构建当前顺序（不含系统分类），执行移动
    const currentOrder = visibleCategories.map((c) => c.name).filter((n) => n !== "未分组" && n !== "已隐藏");
    const fromIdx = currentOrder.indexOf(sourceName);
    const toIdx = currentOrder.indexOf(targetCatName);
    if (fromIdx === -1 || toIdx === -1) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const insertAfter = e.clientY >= midY;

    const newOrder = [...currentOrder];
    newOrder.splice(fromIdx, 1);
    let insertIdx = newOrder.indexOf(targetCatName);
    if (insertAfter) insertIdx += 1;
    newOrder.splice(insertIdx, 0, sourceName);

    reorderCategories(newOrder);
    // 立即清空拖拽状态
    catDragStateRef.current = null;
    draggingCatRef.current = null;
  }, [clearCatDragIndicator, visibleCategories, reorderCategories]);

  // 全局拖拽结束兜底：防止 React 重渲染导致 DOM 上的 onDragEnd 未触发，状态残留阻止点击
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      lastDragEndTimeRef.current = Date.now();
      dragStateRef.current = null;
      catDragStateRef.current = null;
      draggingCatRef.current = null;
      sgDragStateRef.current = null;
      document.querySelectorAll(".drag-over-before, .drag-over-after").forEach((el) => {
        el.classList.remove("drag-over-before", "drag-over-after");
      });
      document.querySelectorAll(".cat-drag-over-before, .cat-drag-over-after").forEach((el) => {
        el.classList.remove("cat-drag-over-before", "cat-drag-over-after");
      });
      document.querySelectorAll(".sg-drag-over-before, .sg-drag-over-after").forEach((el) => {
        el.classList.remove("sg-drag-over-before", "sg-drag-over-after");
      });
      document.querySelectorAll(".book-drop-target").forEach((el) => {
        el.classList.remove("book-drop-target");
      });
      document.querySelectorAll(".grid-drop-active").forEach((el) => {
        el.classList.remove("grid-drop-active");
      });
      bookDragOverTitleRef.current = null;
      bookDragOverSubGroupRef.current = null;
      setCatDragIndicator(null);
      setSgDragIndicator(null);
      if (dragExpandTimerRef.current !== null) {
        clearTimeout(dragExpandTimerRef.current);
        dragExpandTimerRef.current = null;
      }
    };
    document.addEventListener("dragend", handleGlobalDragEnd);
    return () => document.removeEventListener("dragend", handleGlobalDragEnd);
  }, []);

  // 当前书籍信息
  const currentBook = ALL_BOOKS.find((b) => b.path === currentPath) || ALL_BOOKS[0];

  // ===== 查找当前书籍所在的分类和子分组 =====
  // 返回 { categoryName, subGroupKey } ，subGroupKey 为 null 表示在根级
  const findCurrentBookLocation = useCallback(() => {
    const bookPath = currentPath;
    // 遍历 bookOrder 查找书籍在哪个分类/子分组
    for (const [key, paths] of Object.entries(bookOrder)) {
      if (paths.includes(bookPath)) {
        const parsed = parseSubGroupKey(key);
        if (parsed) {
          return { categoryName: parsed.parent, subGroupKey: key };
        }
        return { categoryName: key, subGroupKey: null };
      }
    }
    // bookOrder 中找不到时，从默认分类中找
    const origMatched = BOOK_CATEGORIES.find((cat) =>
      cat.books.some((b) => b.path === bookPath)
    );
    if (origMatched) {
      const displayName = catConfig.renamed[origMatched.name] || origMatched.name;
      return { categoryName: displayName, subGroupKey: null };
    }
    return { categoryName: null, subGroupKey: null };
  }, [currentPath, bookOrder, catConfig.renamed]);

  // ===== 书籍下拉框：打开时始终展开当前书籍所在分组和子分组 =====
  // 关闭时保存展开状态到 localStorage，打开时恢复上次状态，并始终确保当前书籍所在分组/子分组展开
  useEffect(() => {
    if (bookDropdownOpen) {
      // 始终定位当前书籍所在分类和子分组（不管有无保存状态都要确保展开）
      const loc = findCurrentBookLocation();
      const saved = savedDropdownStateRef.current;
      let catsToExpand;
      let sgsToExpand;
      if (saved) {
        // 有内存缓存，恢复上次状态（同一次页面会话内关闭再打开）
        catsToExpand = new Set(saved.categories || []);
        sgsToExpand = new Set(saved.subGroups || []);
      } else {
        // 尝试从 localStorage 恢复（页面刷新后首次打开）
        catsToExpand = new Set();
        sgsToExpand = new Set();
        try {
          const raw = localStorage.getItem(DROPDOWN_EXPANDED_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            const validCatNames = new Set(visibleCategories.map((c) => c.name));
            (parsed.categories || []).filter((n) => validCatNames.has(n)).forEach((n) => catsToExpand.add(n));
            const validSgKeys = [];
            visibleCategories.forEach((cat) => {
              (cat.subGroups || []).forEach((sg) => validSgKeys.push(sg.key));
            });
            const validSgSet = new Set(validSgKeys);
            (parsed.subGroups || []).filter((k) => validSgSet.has(k)).forEach((k) => sgsToExpand.add(k));
          }
        } catch {}
      }
      // 关键：始终确保当前书籍所在的分类和子分组被展开（无论保存状态如何）
      if (loc.categoryName) catsToExpand.add(loc.categoryName);
      if (loc.subGroupKey) sgsToExpand.add(loc.subGroupKey);
      setExpandedCategories(catsToExpand);
      setExpandedSubGroups(sgsToExpand);
      savedDropdownStateRef.current = {
        categories: Array.from(catsToExpand),
        subGroups: Array.from(sgsToExpand),
      };
    } else {
      // 下拉框关闭：保存当前展开状态到内存缓存和 localStorage
      if (dropdownInitializedRef.current || expandedCategories.size > 0) {
        const state = {
          categories: Array.from(expandedCategories),
          subGroups: Array.from(expandedSubGroups),
        };
        savedDropdownStateRef.current = state;
        try { localStorage.setItem(DROPDOWN_EXPANDED_KEY, JSON.stringify(state)); } catch {}
      }
    }
    dropdownInitializedRef.current = true;
  }, [bookDropdownOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ===== 侧边栏收起状态持久化 =====
  // 用户收起/展开侧边栏后保存到 localStorage，刷新页面保持状态
  // collapsedReady 为 false 时跳过，避免初始恢复时覆盖 localStorage
  useEffect(() => {
    if (!collapsedReady) return;
    try { localStorage.setItem("sidebar:collapsed", String(collapsed)); } catch {}
  }, [collapsed, collapsedReady]);

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

  // ===== 章节分组展开/收起状态持久化 =====
  // 按书籍路径（currentPath）分别保存到 localStorage，切换书籍或刷新后保持状态。
  // 用 ref 标记是否已完成首次恢复，避免保存默认初始状态覆盖用户数据。
  const CHAPTER_GROUPS_KEY_PREFIX = "sidebar:chapter-groups:";
  const chapterGroupsInitializedRef = useRef(false);

  // 切换书籍时：从 localStorage 恢复该书籍的分组展开状态
  useEffect(() => {
    if (!currentPath) return;
    const allGroupNames = groupedChapters.map((g) => g.group);
    if (allGroupNames.length === 0) return;

    const storageKey = CHAPTER_GROUPS_KEY_PREFIX + currentPath;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        // saved 是已收起的分组名数组，校验有效性
        const validNames = new Set(allGroupNames);
        const validCollapsed = (saved.collapsed || []).filter((n) => validNames.has(n));
        setCollapsedGroups(new Set(validCollapsed));
      } else {
        // 该书籍无保存状态：默认全部收起，仅展开包含当前激活章节的分组
        const activeGroup = groupedChapters.find((g) =>
          g.items.some((c) => c.id === activeId)
        )?.group;
        const defaultCollapsed = new Set(
          allGroupNames.filter((name) => name !== activeGroup)
        );
        setCollapsedGroups(defaultCollapsed);
      }
    } catch {
      // localStorage 不可用，使用默认：全部收起
      setCollapsedGroups(new Set(allGroupNames));
    }
    chapterGroupsInitializedRef.current = true;
  }, [currentPath, groupedChapters, activeId]);

  // collapsedGroups 变化时（用户操作后）保存到 localStorage
  useEffect(() => {
    if (!chapterGroupsInitializedRef.current || !currentPath) return;
    const storageKey = CHAPTER_GROUPS_KEY_PREFIX + currentPath;
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        collapsed: Array.from(collapsedGroups),
      }));
    } catch {}
  }, [collapsedGroups, currentPath]);

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
                    <div className="sidebar-book-dropdown-actions">
                      <button
                        className="sidebar-add-category-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddInput(true);
                        }}
                        title="新建分组"
                      >
                        ➕ 新建分组
                      </button>
                      <button
                        className="sidebar-save-default-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveAsDefault();
                        }}
                        title="保存当前布局为默认"
                      >
                        💾 保存默认
                      </button>
                      <button
                        className="sidebar-reset-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResetAll();
                        }}
                        title="重置所有分组设置"
                      >
                        🔄 重置
                      </button>
                      <button
                        className="sidebar-factory-reset-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFactoryReset();
                        }}
                        title="恢复出厂设置：清除所有自定义配置（包括保存的默认），回到代码初始状态"
                      >
                        🏭 出厂
                      </button>
                      <button
                        className="sidebar-book-dropdown-close"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBookDropdownOpen(false);
                          setShowAddInput(false);
                          setNewCatName("");
                        }}
                        title="关闭"
                        aria-label="关闭"
                      >
                        ✕
                      </button>
                    </div>
                    <span>📚 全部书籍（{ALL_BOOKS.length} 本）</span>
                  </div>
                  {/* 新建分组输入框 */}
                  {showAddInput && (
                    <div className="sidebar-add-category-row">
                      <input
                        ref={addInputRef}
                        type="text"
                        className="sidebar-category-edit-input"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="输入分组名称..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") confirmAddCategory();
                          if (e.key === "Escape") {
                            setShowAddInput(false);
                            setNewCatName("");
                          }
                        }}
                        onBlur={confirmAddCategory}
                      />
                    </div>
                  )}
                  <div className="sidebar-book-dropdown-body">
                    {visibleCategories.map((category) => {
                      const isCollapsed = !expandedCategories.has(category.name);
                      const isEditing = editingCategory === category.name;
                      const isAddingSg = showAddSubGroup === category.name;
                      const hasSubGroups = category.subGroups && category.subGroups.length > 0;
                      const totalBooksInCat = category.books.length + (hasSubGroups ? category.subGroups.reduce((s, sg) => s + sg.books.length, 0) : 0);
                      return (
                      <div key={category.name} className="sidebar-book-category">
                        {isEditing ? (
                          <div className="sidebar-book-category-title editing">
                            <span className={`sidebar-book-category-arrow${isCollapsed ? "" : " expanded"}`}>▶</span>
                            <span>{category.icon}</span>
                            <input
                              ref={editInputRef}
                              type="text"
                              className="sidebar-category-edit-input"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") confirmRenameCategory();
                                if (e.key === "Escape") {
                                  setEditingCategory(null);
                                  setEditValue("");
                                }
                              }}
                              onBlur={confirmRenameCategory}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        ) : (
                        <div
                          className={`sidebar-book-category-title ${isCollapsed ? "collapsed" : ""}`}
                          draggable={category.name !== "已隐藏"}
                          onClick={() =>
                            setExpandedCategories((prev) => {
                              const next = new Set(prev);
                              if (next.has(category.name)) {
                                next.delete(category.name);
                              } else {
                                next.add(category.name);
                              }
                              return next;
                            })
                          }
                          onContextMenu={(e) => handleCategoryContextMenu(e, category.name)}
                          onDragStart={(e) => handleCatDragStart(e, category.name)}
                          onDragEnd={handleCatDragEnd}
                          onDragOver={(e) => {
                            if (catDragStateRef.current) {
                              handleCatDragOver(e, category.name);
                              return;
                            }
                            if (dragStateRef.current) {
                              e.preventDefault();
                              e.stopPropagation();
                              e.dataTransfer.dropEffect = "move";
                              clearAllDragIndicators();
                              clearBookDragSubGroupHighlight();
                              const titleEl = e.currentTarget;
                              if (bookDragOverTitleRef.current !== titleEl) {
                                clearBookDragTitleHighlight();
                                titleEl.classList.add("book-drop-target");
                                bookDragOverTitleRef.current = titleEl;
                              }
                              if (isCollapsed && dragExpandTimerRef.current === null) {
                                dragExpandTimerRef.current = setTimeout(() => {
                                  setExpandedCategories((prev) => {
                                    if (prev.has(category.name)) return prev;
                                    const next = new Set(prev);
                                    next.add(category.name);
                                    return next;
                                  });
                                  dragExpandTimerRef.current = null;
                                }, 500);
                              }
                            }
                          }}
                          onDragLeave={(e) => {
                            if (catDragStateRef.current) {
                              handleCatDragLeave(e);
                              return;
                            }
                            if (dragStateRef.current) {
                              const titleEl = e.currentTarget;
                              const rect = titleEl.getBoundingClientRect();
                              if (
                                e.clientX < rect.left ||
                                e.clientX > rect.right ||
                                e.clientY < rect.top ||
                                e.clientY > rect.bottom
                              ) {
                                clearBookDragTitleHighlight();
                              }
                            }
                            if (dragExpandTimerRef.current !== null) {
                              clearTimeout(dragExpandTimerRef.current);
                              dragExpandTimerRef.current = null;
                            }
                          }}
                          onDrop={(e) => {
                            if (catDragStateRef.current) {
                              handleCatDrop(e, category.name);
                              return;
                            }
                            if (dragStateRef.current) {
                              e.preventDefault();
                              e.stopPropagation();
                              clearAllDragIndicators();
                              clearBookDragTitleHighlight();
                              clearBookDragSubGroupHighlight();
                              const ds = dragStateRef.current;
                              if (ds.sourceCategory !== category.name) {
                                const targetOrder = getOrderedPaths(category.name);
                                moveToCategory(ds.sourceCategory, ds.sourceIndex, category.name, targetOrder.length);
                              }
                              setExpandedCategories((prev) => {
                                if (prev.has(category.name)) return prev;
                                const next = new Set(prev);
                                next.add(category.name);
                                return next;
                              });
                              dragStateRef.current = null;
                            }
                            if (dragExpandTimerRef.current !== null) {
                              clearTimeout(dragExpandTimerRef.current);
                              dragExpandTimerRef.current = null;
                            }
                          }}
                          title={category.name === "已隐藏" ? "已隐藏的书籍" : (isCollapsed ? "点击展开，拖拽排序" : "点击收起，拖拽排序")}
                        >
                          <span className={`sidebar-book-category-arrow${isCollapsed ? "" : " expanded"}`}>
                            ▶
                          </span>
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                        )}
                        {!isCollapsed && (
                        <>
                          {isAddingSg && (
                            <div className="sidebar-add-subgroup-row">
                              <input
                                ref={addSubGroupInputRef}
                                type="text"
                                className="sidebar-category-edit-input"
                                value={newSubGroupName}
                                onChange={(e) => setNewSubGroupName(e.target.value)}
                                placeholder="输入子分组名称..."
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") confirmAddSubGroup();
                                  if (e.key === "Escape") {
                                    setShowAddSubGroup(null);
                                    setNewSubGroupName("");
                                  }
                                }}
                                onBlur={confirmAddSubGroup}
                              />
                            </div>
                          )}
                          {category.books.length > 0 && (
                          <div
                            className="sidebar-book-grid"
                            onDragOver={(e) => handleGridDragOver(e, category.name)}
                            onDragLeave={handleGridDragLeave}
                            onDrop={(e) => handleGridDrop(e, category.name)}
                          >
                            {category.books.map((book, idx) => {
                              const orderedPaths = getOrderedPaths(category.name);
                              const realIdx = category.name === "已隐藏"
                                ? idx
                                : orderedPaths.indexOf(book.path);
                              return (
                              <div
                                key={book.path}
                                draggable
                                data-book-path={book.path}
                                className={`sidebar-book-card ${currentPath === book.path ? "active" : ""}`}
                                onClick={(e) => {
                                  if (dragStateRef.current) {
                                    e.preventDefault();
                                    return;
                                  }
                                  if (Date.now() - lastDragEndTimeRef.current < 100) {
                                    e.preventDefault();
                                    return;
                                  }
                                  setBookDropdownOpen(false);
                                  router.push(book.path);
                                }}
                                onContextMenu={(e) => handleBookContextMenu(e, book.path, category.name)}
                                onDragStart={(e) => handleDragStart(e, book.path, category.name, realIdx)}
                                onDragEnd={handleDragEnd}
                                onDrop={(e) => handleCardDrop(e, category.name)}
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
                              );
                            })}
                          </div>
                          )}
                          {hasSubGroups && category.subGroups.map((sg) => {
                            const sgKey = sg.key;
                            const sgExpanded = expandedSubGroups.has(sgKey);
                            const isSgEditing = editingSubGroup && editingSubGroup.parent === category.name && editingSubGroup.sgId === sg.id;
                            return (
                            <div key={sg.id} className="sidebar-subgroup">
                              {isSgEditing ? (
                                <div className="sidebar-subgroup-title editing">
                                  <span className={`sidebar-subgroup-arrow${sgExpanded ? " expanded" : ""}`}>▶</span>
                                  <span className="sidebar-subgroup-icon">📁</span>
                                  <input
                                    ref={editSubGroupInputRef}
                                    type="text"
                                    className="sidebar-category-edit-input"
                                    value={editSubGroupValue}
                                    onChange={(e) => setEditSubGroupValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") confirmRenameSubGroup();
                                      if (e.key === "Escape") {
                                        setEditingSubGroup(null);
                                        setEditSubGroupValue("");
                                      }
                                    }}
                                    onBlur={confirmRenameSubGroup}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              ) : (
                              <div
                                className={`sidebar-subgroup-title ${!sgExpanded ? "collapsed" : ""}`}
                                onClick={() =>
                                  setExpandedSubGroups((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(sgKey)) {
                                      next.delete(sgKey);
                                    } else {
                                      next.add(sgKey);
                                    }
                                    return next;
                                  })
                                }
                                onContextMenu={(e) => handleSubGroupContextMenu(e, category.name, sg.id, sg.name)}
                                onDragOver={(e) => {
                                  if (catDragStateRef.current || sgDragStateRef.current) return;
                                  if (dragStateRef.current) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.dataTransfer.dropEffect = "move";
                                    clearAllDragIndicators();
                                    clearBookDragTitleHighlight();
                                    const titleEl = e.currentTarget;
                                    if (bookDragOverSubGroupRef.current !== titleEl) {
                                      clearBookDragSubGroupHighlight();
                                      titleEl.classList.add("book-drop-target");
                                      bookDragOverSubGroupRef.current = titleEl;
                                    }
                                  }
                                }}
                                onDragLeave={(e) => {
                                  if (dragStateRef.current) {
                                    const titleEl = e.currentTarget;
                                    const rect = titleEl.getBoundingClientRect();
                                    if (
                                      e.clientX < rect.left ||
                                      e.clientX > rect.right ||
                                      e.clientY < rect.top ||
                                      e.clientY > rect.bottom
                                    ) {
                                      clearBookDragSubGroupHighlight();
                                    }
                                  }
                                }}
                                onDrop={(e) => {
                                  if (catDragStateRef.current || sgDragStateRef.current) return;
                                  if (dragStateRef.current) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    clearAllDragIndicators();
                                    clearBookDragTitleHighlight();
                                    clearBookDragSubGroupHighlight();
                                    const ds = dragStateRef.current;
                                    if (ds.sourceCategory !== sgKey) {
                                      const targetOrder = getOrderedPaths(sgKey);
                                      moveToCategory(ds.sourceCategory, ds.sourceIndex, sgKey, targetOrder.length);
                                    }
                                    setExpandedCategories((prev) => {
                                      if (prev.has(category.name)) return prev;
                                      const next = new Set(prev);
                                      next.add(category.name);
                                      return next;
                                    });
                                    setExpandedSubGroups((prev) => {
                                      if (prev.has(sgKey)) return prev;
                                      const next = new Set(prev);
                                      next.add(sgKey);
                                      return next;
                                    });
                                    dragStateRef.current = null;
                                  }
                                }}
                                title={`子分组：${sg.name}`}
                              >
                                <span className={`sidebar-subgroup-arrow${sgExpanded ? " expanded" : ""}`}>▶</span>
                                <span className="sidebar-subgroup-icon">📁</span>
                                <span className="sidebar-subgroup-name">{sg.name}</span>
                                <span className="sidebar-subgroup-count">{sg.books.length}</span>
                              </div>
                              )}
                              {sgExpanded && (
                              <div
                                className="sidebar-subgroup-books"
                                onDragOver={(e) => handleGridDragOver(e, sgKey)}
                                onDragLeave={handleGridDragLeave}
                                onDrop={(e) => handleGridDrop(e, sgKey)}
                              >
                                {sg.books.map((book, idx) => {
                                  const orderedPaths = getOrderedPaths(sgKey);
                                  const realIdx = orderedPaths.indexOf(book.path);
                                  return (
                                  <div
                                    key={book.path}
                                    draggable
                                    data-book-path={book.path}
                                    className={`sidebar-book-card ${currentPath === book.path ? "active" : ""}`}
                                    onClick={(e) => {
                                      if (dragStateRef.current) {
                                        e.preventDefault();
                                        return;
                                      }
                                      if (Date.now() - lastDragEndTimeRef.current < 100) {
                                        e.preventDefault();
                                        return;
                                      }
                                      setBookDropdownOpen(false);
                                      router.push(book.path);
                                    }}
                                    onContextMenu={(e) => handleBookContextMenu(e, book.path, sgKey)}
                                    onDragStart={(e) => handleDragStart(e, book.path, sgKey, realIdx)}
                                    onDragEnd={handleDragEnd}
                                    onDrop={(e) => handleCardDrop(e, sgKey)}
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
                                  );
                                })}
                                {sg.books.length === 0 && (
                                  <div className="sidebar-empty-grid-hint">
                                    拖拽书籍到此子分组
                                  </div>
                                )}
                              </div>
                              )}
                            </div>
                            );
                          })}
                          {category.books.length === 0 && !hasSubGroups && (
                            <div className="sidebar-empty-grid-hint">
                              {category.name === "已隐藏"
                                ? "拖拽书籍到此处隐藏"
                                : category.name === "未分组"
                                ? "暂无未分组书籍"
                                : "拖拽书籍到此处，或右键新建子分组"}
                            </div>
                          )}
                        </>
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
                        className={`chapter-item ${activeId === ch.id ? "active" : ""}`}
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

            {/* 已读的章节区域（按分组展示） */}
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
                  <span className="group-title-text">已读的章节 ({hiddenChapterCount})</span>
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
                                  className={`chapter-item ${activeId === ch.id ? "active" : ""}`}
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
