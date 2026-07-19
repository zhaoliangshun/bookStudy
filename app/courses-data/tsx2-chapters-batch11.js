// =============================================================
// TypeScript + React 从入门到精通大全 —— 第 11 批
// -------------------------------------------------------------
// 章节 51-55：第十一部分 性能优化
// 沙箱：/api/run-ts（TS 转译 + ReactJSX 运行时）
// 导出：const chapters
// =============================================================

const chapters = [
  // ===========================================================
  // tsx2-ch51：React 渲染原理
  // ===========================================================
  {
    id: "tsx2-ch51",
    group: "第十一部分 性能优化",
    icon: "🧠",
    title: "第五十一章 React 渲染原理",
    content: `# 第五十一章 React 渲染原理

要优化 React 应用性能，必须先理解 React 是怎么把组件变成屏幕上的像素的。本章讲清"虚拟 DOM、Reconciliation、Fiber 架构、Render/Commit 阶段、并发渲染"这一整套底层机制。

---

## 一、为什么需要虚拟 DOM

\`\`\`tsx
// 直接操作 DOM 的代价很高
// 每次 setState 后，React 不知道"哪些 DOM 节点需要改"
// 如果靠开发者手动 diff：onClick 里写一堆 if-else 比较，代码没法维护
\`\`\`

React 的解法是**"用 JS 对象描述 UI"**：

\`\`\`tsx
// JSX 会被编译成这样的"React 元素"对象（简化版）
const element = {
  type: "div",
  props: { className: "container" },
  children: [
    {
      type: "h1",
      props: {},
      children: ["你好"]
    },
    {
      type: "p",
      props: {},
      children: ["世界"]
    }
  ]
};

// 这个对象就是"虚拟 DOM"
\`\`\`

**虚拟 DOM 的本质**：用 JS 对象描述真实 DOM。

---

## 二、Reconciliation：协调算法

React 用"两棵虚拟 DOM 树的 diff"来决定怎么改真实 DOM。这个过程叫 **Reconciliation**。

\`\`\`tsx
// 当 setState 触发时：
// 1. React 调用组件函数，得到新的虚拟 DOM 树
// 2. 和旧的虚拟 DOM 树比较（diff）
// 3. 计算出"最小的 DOM 修改列表"
// 4. 一次性应用到真实 DOM

// 这就是为什么 React 不直接 diff 真实 DOM
// 因为虚拟 DOM 是普通 JS 对象，diff 速度极快
// 真实 DOM 操作是浏览器行为，开销大
\`\`\`

---

## 三、Diff 算法的两个核心假设

React 的 diff 不是"通用最优算法"（那需要 O(n³)，不可行）。它基于两个**经验性假设**把复杂度降到 O(n)：

\`\`\`tsx
// 假设 1：不同类型的元素会产生不同的树
// <div>...</div> 变成 <span>...</span>
// React 直接卸载旧树，搭新树（不深入比较）

// 假设 2：通过 key 标识哪些子元素是"同一个"
//   <ul>
//     <li key="a">A</li>
//     <li key="b">B</li>
//   </ul>
//   <ul>
//     <li key="a">A</li>
//     <li key="b">B</li>
//     <li key="c">C</li>
//   </ul>
// React 知道只新增了 C，不会重建 A 和 B
\`\`\`

---

## 四、Fiber 架构：可中断的协调器

React 16 之前，Reconciliation 是**同步**的——一旦开始 diff，必须跑完。组件树很大时，主线程被占满几十毫秒，浏览器掉帧。

React 16 引入 **Fiber 架构**：把协调过程拆成小任务，每帧跑一点，剩下的让给浏览器。

\`\`\`tsx
// Fiber 节点：每个 React 元素对应一个 Fiber 节点
// 它是一个链表节点，包含：
//   - type：组件类型
//   - key
//   - child / sibling / return：构成 fiber tree
//   - pendingProps / memoizedProps
//   - alternate：指向另一棵树的对应节点（双缓冲）
//   - effectTag：要做哪些 DOM 操作

// Fiber 把"递归 diff"改成"循环遍历链表"
// 这样可以：
//   1. 中断：每帧跑 5ms，剩下的让给浏览器
//   2. 恢复：从中断处继续
//   3. 优先级：紧急任务（用户输入）优先于不紧急任务（数据加载）
\`\`\`

---

## 五、Render 阶段 vs Commit 阶段

\`\`\`tsx
// React 的一次更新分两阶段：

// Render 阶段（可中断、纯计算）：
//   1. 调用组件函数，生成新虚拟 DOM
//   2. diff 出 effect list（要做的副作用列表）
//   3. 不涉及任何真实 DOM 操作
//   4. 可以被打断、重启

// Commit 阶段（不可中断、真正改 DOM）：
//   1. 一次性把所有 effect 应用到真实 DOM
//   2. 触发 useLayoutEffect 的清理 + 新 effect
//   3. 浏览器绘制
//   4. 触发 useEffect（异步）

// useEffect 在 commit 后异步执行，所以不会阻塞绘制
// useLayoutEffect 在 commit 时同步执行，会阻塞绘制
\`\`\`

---

## 六、并发渲染（Concurrent Rendering）

React 18 的核心特性。把"同步渲染"改成"可中断、可恢复的并发渲染"。

\`\`\`tsx
// 之前：setState → 立即开始 diff（不可打断）→ 改 DOM
// 现在：setState → 标记"我要更新" → React 调度器决定何时 diff

// 三个层面的并发能力：
// 1. 自动批处理（Automatic Batching）
//    多个 setState 合并成一次渲染
function Comp() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);

  const handler = async () => {
    setA(1);  // 之前：立刻触发渲染
    setB(2);  // 之前：又触发一次
    // 现在：合并成一次，只渲染一次
  };
}

// 2. 过渡更新（Transitions）
//    前面 useTransition 章节讲过
//    把不紧急的更新让给浏览器空闲时间

// 3. Suspense 改进
//    等待异步数据时，UI 不被破坏
//    配合 useTransition 可以让旧 UI 保持显示
\`\`\`

---

## 七、关键时间线

\`\`\`tsx
// 用户输入 "a"
//   ↓
// setState（紧急）
//   ↓
// 触发 Render 阶段（diff）
//   ↓
// 触发 Commit 阶段（改 DOM）
//   ↓
// useLayoutEffect 同步执行
//   ↓
// 浏览器绘制
//   ↓
// useEffect 异步执行

// 用户输入 "ab"
//   ↓
// 紧急更新插入，新 Render 阶段开始
//   ↓
// 旧 Render 被丢弃（Fiber 优势）
//   ↓
// 新 Render 完成 → Commit → 绘制
\`\`\`

---

## 八、为什么理解这些有用

\`\`\`tsx
// 1. 知道"为什么 setState 后立刻读 state 拿到的是旧值"
//    因为 setState 是异步的，state 要等下一次 render 才更新

// 2. 知道"为什么 useEffect 不能写条件语句"
//    因为 hooks 链表依赖固定顺序，条件会破坏对应关系

// 3. 知道"为什么 key 不能用 index"
//    因为 diff 时用 key 匹配元素，index 会让算法误判身份

// 4. 知道"为什么 useTransition 能让 UI 流畅"
//    因为它把更新标记为低优先级，让浏览器先绘制紧急的 UI

// 5. 知道"为什么 Context.Provider 的 value 要用 useMemo"
//    因为每次 Provider 渲染会重建 value，所有消费者都重渲染
\`\`\`

---

## 小结

- 虚拟 DOM = 用 JS 对象描述 UI，让 diff 在 JS 层完成。
- React 用 O(n) 的启发式 diff：按 type + key 匹配节点。
- Fiber 架构让协调过程可中断、可恢复，引入"优先级"概念。
- 更新分 Render（可中断、纯计算）和 Commit（不可中断、改 DOM）两阶段。
- React 18 的并发渲染：自动批处理、Transitions、Suspense 三大能力。
- 理解这些机制是后面"性能优化"章节的基础。`,
  },

  // ===========================================================
  // tsx2-ch52：减少重渲染
  // ===========================================================
  {
    id: "tsx2-ch52",
    group: "第十一部分 性能优化",
    icon: "🪶",
    title: "第五十二章 减少重渲染",
    content: `# 第五十二章 减少重渲染

React 的性能问题 90% 来自"不必要的重渲染"。本章讲 5 个核心技巧：定位重渲染原因、合理组织 state、状态下沉、key 稳定、Context 拆分。

---

## 一、什么是"不必要的重渲染"

\`\`\`tsx
// 当 state 变化时，React 会从该组件开始，往下重新渲染整棵子树
// 即便子组件的 props 没变

function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>clicked {count}</button>
      {/* 即使 BigChild 没接收 count，它也会跟着重渲染 */}
      <BigChild />
    </>
  );
}
\`\`\`

> 一个组件"重渲染"= 它**的函数体**被重新执行了（diff 还是会做，只是子组件如果不接受新 props 就不会改 DOM）。

---

## 二、定位：找出谁在重渲染

\`\`\`tsx
// 第 1 招：在每个组件顶部加 console.log
function BigChild() {
  console.log("BigChild rendered");
  return <div>...</div>;
}
// 点几次按钮看 BigChild 出现几次 → 它就是不该重渲染的

// 第 2 招：用 React DevTools Profiler（ch55 讲）

// 第 3 招：用 why-did-you-render 库
import whyDidYouRender from "@welldone-software/why-did-you-render";
whyDidYouRender(React, { trackAllPureComponents: true });
// 不必要的重渲染会在控制台报警

// 第 4 招：自定义 hook
function useWhyRender(name: string, props: Record<string, unknown>) {
  const prev = useRef(props);
  useEffect(() => {
    const changed: string[] = [];
    for (const k of Object.keys(props)) {
      if (!Object.is(prev.current[k], props[k])) changed.push(k);
    }
    if (changed.length) console.log(\`\${name} 重渲染，变化的 props：\${changed}\`);
    prev.current = props;
  });
}
\`\`\`

---

## 三、技巧 1：合理组织 state 结构

\`\`\`tsx
// ❌ 反例：一个大对象，每次只改一个字段也导致整个对象"变"
const [form, setForm] = useState({ a: 1, b: 2, c: 3 });
const onChange = () => setForm(f => ({ ...f, a: f.a + 1 }));
// 即使只改 a，form 的引用也变了，传给子组件的 form.a 也算"新 props"

// ✅ 正例：把不相关的字段拆成多个 state
const [a, setA] = useState(1);
const [b, setB] = useState(2);
const [c, setC] = useState(3);
// 改 a 时只有用到 a 的子组件重渲染
\`\`\`

---

## 四、技巧 2：状态下沉（State Colocation）

\`\`\`tsx
// ❌ 反例：状态放在最外层
function Page() {
  const [text, setText] = useState("");  // 只在 Input 组件用
  return (
    <>
      <Header />
      <Sidebar />
      <Input value={text} onChange={setText} />
      {/* 每次输入，Header 和 Sidebar 都会重渲染（因为 Page 重渲染了） */}
    </>
  );
}

// ✅ 正例：状态下沉到真正使用它的组件
function Page() {
  return (
    <>
      <Header />
      <Sidebar />
      <InputWithState />  {/* 状态在这里面 */}
    </>
  );
}

function InputWithState() {
  const [text, setText] = useState("");  // 只在自己里面
  return <input value={text} onChange={e => setText(e.target.value)} />;
}
\`\`\`

> **核心原则**：把 state 放在"最贴近使用它的组件"。

---

## 五、技巧 3：key 稳定性

\`\`\`tsx
// ❌ 反例：用 index 当 key，列表变化时引发错乱
{items.map((item, i) => <Row key={i} item={item} />)}
// 当 items 头部插入新元素时，所有 key 都变了
// React 认为每个 Row 都是"新组件"，全部卸载重建
// 性能差 + 状态丢失（输入框值会清空）

// ✅ 正例：用业务唯一字段
{items.map(item => <Row key={item.id} item={item} />)}
// 同一个 id 永远对应同一个 Row
\`\`\`

---

## 六、技巧 4：React.memo 浅比较

\`\`\`tsx
// React.memo 让组件在 props 不变时跳过重渲染
const Row = React.memo(function Row({ item, onClick }: Props) {
  console.log("Row rendered", item.id);
  return <li onClick={onClick}>{item.name}</li>;
});

// 父组件传新对象时，memo 失效
function Parent() {
  // ❌ 每次 Parent 渲染都新建对象，Row 会重渲染
  return <Row item={{ id: 1, name: "A" }} onClick={handleClick} />;
}

// ✅ 解决办法 1：把对象提到组件外
const ITEM = { id: 1, name: "A" };
function Parent() {
  return <Row item={ITEM} onClick={handleClick} />;
}

// ✅ 解决办法 2：用 useMemo 缓存
function Parent() {
  const item = useMemo(() => ({ id: 1, name: "A" }), []);
  return <Row item={item} onClick={handleClick} />;
}
\`\`\`

> 注意：\`onClick={handleClick}\` 里如果 handleClick 每次新建（普通函数），memo 也失效。要用 useCallback 稳定。

---

## 七、技巧 5：拆分 Context

\`\`\`tsx
// ❌ 反例：一个大 context，所有消费者一起重渲染
const AppContext = createContext({ user, theme, lang, count, setCount });
// 改 count 时所有用 user/theme/lang 的组件也重渲染

// ✅ 正例：按更新频率拆分
const UserContext = createContext(user);
const ThemeContext = createContext(theme);
const LangContext = createContext(lang);
const CountContext = createContext([count, setCount]);
// 改 count 只影响 CountContext 的消费者
\`\`\`

极端情况下，可以**用 selector**：

\`\`\`tsx
// 第三方库 use-context-selector
import { createContext } from "use-context-selector";
const StoreCtx = createContext(null);

// 只有 selected 字段变化时才重渲染
const user = useContextSelector(StoreCtx, s => s.user);
\`\`\`

---

## 八、综合案例

\`\`\`tsx
// 优化前：10000 个 Cell，每次输入框变化都重渲染所有
function BadTodo() {
  const [todos, setTodos] = useState(TODOS);
  const [text, setText] = useState("");

  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <ul>
        {todos.map(t => (
          <Cell key={t.id} todo={t} onToggle={() => setTodos(/*...*/)} />
        ))}
      </ul>
    </>
  );
}

// 优化后：输入框状态独立、Cell memo、回调稳定
function GoodTodo() {
  const [todos, setTodos] = useState(TODOS);
  return (
    <>
      <TodoInput />
      <TodoList todos={todos} setTodos={setTodos} />
    </>
  );
}

const TodoInput = React.memo(function TodoInput() {
  // 状态在这里，输入不会引起兄弟组件重渲染
  const [text, setText] = useState("");
  return <input value={text} onChange={e => setText(e.target.value)} />;
});

const TodoList = React.memo(function TodoList({ todos, setTodos }: Props) {
  // 用 useCallback 稳定 onToggle
  const onToggle = useCallback((id: number) => {
    setTodos(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, [setTodos]);

  return (
    <ul>
      {todos.map(t => <Cell key={t.id} todo={t} onToggle={onToggle} />)}
    </ul>
  );
});

const Cell = React.memo(function Cell({ todo, onToggle }: { todo: Todo; onToggle: (id: number) => void }) {
  // todo 引用稳定时，Cell 不重渲染
  console.log("Cell", todo.id);
  return <li onClick={() => onToggle(todo.id)}>{todo.text}</li>;
});
\`\`\`

---

## 九、useMemo / useCallback 不要过度使用

\`\`\`tsx
// ❌ 滥用：给所有东西都加 useMemo / useCallback
// 收益 = 0（memo 已经够了），反而多一份"维护依赖"的心智负担

// 真正的判断标准：
// 1. 子组件被 React.memo 包裹了 → useCallback / useMemo 有用
// 2. 作为 useEffect 依赖 → 稳定引用避免 effect 反复执行
// 3. 用在昂贵的计算里 → useMemo 缓存结果
// 4. 其他情况 → 直接写新对象/新函数，省事
\`\`\`

---

## 小结

- 90% 的 React 性能问题来自不必要的重渲染。
- 5 大技巧：合理 state 结构、状态下沉、稳定 key、React.memo、拆分 Context。
- 定位用 console.log / DevTools Profiler / why-did-you-render。
- useMemo / useCallback 只在"用了才有效"的场景用。
- 性能优化第一步永远是"先测量，再优化"，不要凭感觉。`,
  },

  // ===========================================================
  // tsx2-ch53：代码分割与懒加载
  // ===========================================================
  {
    id: "tsx2-ch53",
    group: "第十一部分 性能优化",
    icon: "📦",
    title: "第五十三章 代码分割与懒加载",
    content: `# 第五十三章 代码分割与懒加载

当项目变大，首屏加载的 JS 包可能几 MB。代码分割（code splitting）让你把代码拆成"按需加载的块"，首屏只下载必需的。本章讲 React.lazy + Suspense + 动态 import 的实战。

---

## 一、为什么要代码分割

\`\`\`tsx
// 传统打包：所有组件 + 路由 + 工具库都打成一个 main.js
// 用户打开首页就下载整个包，哪怕他一辈子不用"管理后台"

// 代码分割后：
// main.js（首屏必需，几十 KB）
// + dashboard.chunk.js（用户进入管理后台时才下载）
// + chart.chunk.js（用户点开图表时才下载）
// + editor.chunk.js（用户打开编辑器时才下载）
\`\`\`

---

## 二、React.lazy：动态加载组件

\`\`\`tsx
import { lazy, Suspense } from "react";

// React.lazy 接一个返回 Promise 的函数
// 第一次渲染这个组件时，React 会调用这个函数去 import
const HeavyChart = lazy(() => import("./HeavyChart"));

function Dashboard() {
  return (
    <Suspense fallback={<div>加载中…</div>}>
      <HeavyChart />
    </Suspense>
  );
}
\`\`\`

**关键点**：
- \`lazy()\` 必须在**模块顶层**调用（不能在条件里）。
- 必须配 \`<Suspense>\` 用，否则 React 报错。
- 内部用 dynamic import 实现。

---

## 三、Suspense 的 fallback

\`\`\`tsx
// 多个 lazy 组件可以共用一个 Suspense
<Suspense fallback={<Skeleton />}>
  <Header />
  <HeavyChart />
  <DataTable />
</Suspense>

// 也可以嵌套：内层有更具体的 fallback
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Suspense fallback={<ChartSkeleton />}>
    <HeavyChart />
  </Suspense>
  <DataTable />
</Suspense>
\`\`\`

> 注意：Suspense 的 fallback 显示期间，被包裹的组件**什么都不渲染**（连同位置）。可以用 React 18 改进的 \`startTransition\` + Suspense 让旧 UI 保持显示。

---

## 四、命名导出组件的处理

\`\`\`tsx
// 如果组件是命名导出，lazy 的 import 需要 default 化
// HeavyChart.ts
export function HeavyChart() { ... }
// 上面这样写 React.lazy 会报错（因为 lazy 期望 default export）

// 解决：在中间文件里再 default 一下
// HeavyChart.lazy.ts
export { HeavyChart as default } from "./HeavyChart";
// 或者直接：
export { default } from "./HeavyChart";  // 如果源文件有 default

// 然后
const HeavyChart = lazy(() => import("./HeavyChart.lazy"));
\`\`\`

---

## 五、Next.js 里的 dynamic

\`\`\`tsx
// Next.js 提供了更强大的 next/dynamic
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./HeavyChart"), {
  loading: () => <Skeleton />,        // 等价于 Suspense fallback
  ssr: false,                          // 这个组件跳过 SSR（只在客户端渲染）
});

// 用法
function Page() {
  return <HeavyChart data={data} />;
}

// 命名导出处理
const HeavyChart = dynamic(
  () => import("./HeavyChart").then(m => m.HeavyChart),
  { ssr: false }
);
\`\`\`

> Next.js 13+ App Router 里，**默认就是按路由自动代码分割**，每个 page.tsx 是一个独立的 chunk。

---

## 六、路由级代码分割

\`\`\`tsx
// React Router v6
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
}
\`\`\`

每个 \`pages/Xxx\` 会被 webpack 打成单独的 chunk，只有用户访问对应路由时才会下载。

---

## 七、按条件懒加载（弹窗、抽屉）

\`\`\`tsx
function Page() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>打开编辑器</button>

      {open && (
        // 弹窗的代码只在第一次打开时下载
        <Suspense fallback={<div>编辑器加载中…</div>}>
          <RichEditor onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}

const RichEditor = lazy(() => import("./RichEditor"));
\`\`\`

> 配合 useTransition 可以让"打开动作"平滑，不显示骨架屏。

---

## 八、preload：提前加载但不执行

\`\`\`tsx
// 有时候你"知道用户大概率会点"，想提前下载但不让它渲染
// 可以用 dynamic import 的预加载技巧

function Page() {
  const preload = () => {
    // 浏览器后台下载这个 chunk，但不执行
    import("./HeavyChart");
  };

  return (
    <>
      {/* 鼠标悬停时预加载 */}
      <button onMouseEnter={preload} onClick={() => setOpen(true)}>
        打开图表
      </button>
    </>
  );
}
\`\`\`

Next.js 还提供 \`<Link prefetch>\` 做路由预取。

---

## 九、Vite 里的代码分割

\`\`\`tsx
// Vite 用 ES modules 原生支持代码分割
// import() 自动变成单独的 chunk
// 无需额外配置

// 路由级手动拆分示例
const routes = {
  "/": lazy(() => import("./pages/Home")),
  "/about": lazy(() => import("./pages/About")),
};

// 构建产物里你会看到：
// dist/assets/Home-[hash].js
// dist/assets/About-[hash].js
// dist/assets/index-[hash].js
\`\`\`

---

## 十、什么时候**不要**懒加载

\`\`\`tsx
// ❌ 错误用法：把首屏关键组件也懒加载
// 用户首屏会看到骨架屏，体验更差

// ❌ 错误用法：把小组件懒加载
// 懒加载本身有"下载 + 解析"开销
// 一个 5KB 的组件懒加载可能比直接打包还慢

// 适合懒加载：
// 1. 路由级页面（每个几十 KB ~ 几 MB）
// 2. 重型组件（图表编辑器、富文本、地图）
// 3. 弹窗/抽屉（用户 80% 时间不打开）
// 4. 低频功能（管理后台、设置页）

// 不适合懒加载：
// 1. 首屏核心组件
// 2. < 10KB 的小组件
// 3. 极常用的组件
\`\`\`

---

## 小结

- 代码分割让首屏 JS 包变小，配合懒加载按需下载。
- \`React.lazy(() => import(...))\` + \`<Suspense fallback={...}>\` 是标准组合。
- Next.js 用 \`next/dynamic\` 提供更强大能力（ssr: false、loading）。
- 路由级、弹窗级、富文本/图表级是三大典型懒加载场景。
- 配合 useTransition 让切换更平滑，鼠标悬停时 preload 提前下载。`,
  },

  // ===========================================================
  // tsx2-ch54：虚拟列表
  // ===========================================================
  {
    id: "tsx2-ch54",
    group: "第十一部分 性能优化",
    icon: "📜",
    title: "第五十四章 虚拟列表",
    content: `# 第五十四章 虚拟列表

当列表有 1 万、10 万行时，全部渲染会让 DOM 节点爆掉。虚拟列表（Virtual List）的思路是**只渲染用户能看见的那部分**，滚动时按需替换。本章讲原理、react-window、react-virtuoso 三个层次。

---

## 一、为什么需要虚拟列表

\`\`\`tsx
// 一个 10 万行的列表
// 每行 50 个 DOM 节点（div、img、文本）
// 总共 500 万个 DOM 节点
// 浏览器会：
//   1. 内存爆炸（每个 DOM 节点 ~ 1KB，500 万个 = 5GB）
//   2. 渲染卡死（layout / paint 都是 O(n) 甚至更差）
//   3. 滚动掉帧

// 虚拟列表的解法：只渲染"视口内 + 一点 buffer"的几十行
// 10 万行变 30 行，5GB 变 几MB
\`\`\`

---

## 二、虚拟列表的核心原理

\`\`\`tsx
// 三件事：
// 1. 知道容器高度、知道每行高度
// 2. 根据 scrollTop 算出"用户在看哪几行"
// 3. 只渲染这几行 + 用一个空 div 占住总高度

// 伪代码
function VirtualList({ items, itemHeight = 50, viewportHeight = 600 }) {
  const [scrollTop, setScrollTop] = useState(0);

  // 用户能看到的行索引范围
  const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - 5);  // 上下多渲染 5 行做缓冲
  const endIdx = Math.min(items.length, Math.ceil((scrollTop + viewportHeight) / itemHeight) + 5);

  // 只渲染这区间
  const visible = items.slice(startIdx, endIdx);

  return (
    <div
      style={{ height: viewportHeight, overflowY: "auto" }}
      onScroll={e => setScrollTop(e.currentTarget.scrollTop)}
    >
      {/* 这个占位 div 用总高度撑出滚动条 */}
      <div style={{ height: items.length * itemHeight, position: "relative" }}>
        {/* 可见行用 transform 偏移到正确位置 */}
        <div style={{ position: "absolute", top: startIdx * itemHeight }}>
          {visible.map(item => (
            <Row key={item.id} item={item} height={itemHeight} />
          ))}
        </div>
      </div>
    </div>
  );
}
\`\`\`

---

## 三、固定高度 vs 变高

| 维度 | 固定高度 | 变高 |
|---|---|---|
| 实现难度 | 简单 | 复杂（需要先测量每行高度） |
| 性能 | 最好 | 略差（需要动态算位置） |
| 适用 | 列表项大小相同 | 列表项大小不同（聊天记录、商品卡） |
| 库支持 | 所有虚拟列表库 | 需要"动态测量"功能 |

---

## 四、react-window 实战

\`\`\`tsx
import { FixedSizeList, VariableSizeList } from "react-window";

const items = Array.from({ length: 100000 }, (_, i) => \`Item \${i}\`);

function App() {
  return (
    <FixedSizeList
      height={600}             // 视口高度
      itemCount={items.length} // 总数
      itemSize={50}            // 每行高度
      width="100%"
    >
      {({ index, style }) => (
        // 用 style 绝对定位到正确位置
        <div style={style}>{\`Row \${items[index]}\`}</div>
      )}
    </FixedSizeList>
  );
}

// 变高版本
function App2() {
  const getItemSize = (index: number) => {
    return items[index].length > 20 ? 80 : 40;
  };

  return (
    <VariableSizeList
      height={600}
      itemCount={items.length}
      itemSize={getItemSize}
      width="100%"
    >
      {({ index, style }) => <div style={style}>{items[index]}</div>}
    </VariableSizeList>
  );
}
\`\`\`

react-window 还提供 \`FixedSizeGrid\` / \`VariableSizeGrid\` 给二维表格用。

---

## 五、react-virtuoso：更强大的虚拟列表

\`\`\`tsx
import { Virtuoso } from "react-virtuoso";

// 自动处理变高、滚动到底加载、动态插入
function Chat() {
  const [items, setItems] = useState(MESSAGES);

  return (
    <Virtuoso
      style={{ height: 600 }}
      data={items}
      // 渲染每一行
      itemContent={(index, item) => <Message {...item} />}
      // 滚到顶时加载更多
      startReached={() => loadMore()}
      // 滚到底时加载
      endReached={() => loadMore()}
      // 自动跟随到底（聊天场景）
      followOutput="smooth"
    />
  );
}
\`\`\`

virtuoso 的特色：
- 不需要预先知道每行高度
- 滚到顶/底自动加载更多
- 反转列表（聊天记录）
- 表格、网格、Masonry 布局都有对应组件

---

## 六、虚拟表格（grid）

\`\`\`tsx
// 横向 + 纵向都要虚拟化
import { FixedSizeGrid } from "react-window";

function BigTable({ rows, cols }: { rows: number; cols: number }) {
  return (
    <FixedSizeGrid
      columnCount={cols}
      rowCount={rows}
      columnWidth={100}
      rowHeight={30}
      width={800}
      height={600}
    >
      {({ columnIndex, rowIndex, style }) => (
        <div style={style}>{\`R\${rowIndex} C\${columnIndex}\`}</div>
      )}
    </FixedSizeGrid>
  );
}
\`\`\`

10 万 × 50 列的表格也能流畅滚动。

---

## 七、自己手写虚拟列表的几个坑

\`\`\`tsx
// 坑 1：scrollTop 不是整数
// 用 Math.floor 处理

// 坑 2：图片懒加载
// 用 IntersectionObserver 或 react-window 自带的 onItemsRendered

// 坑 3：sticky 元素（表头）
// react-window 不会自动处理，需要自己写

// 坑 4：行内有输入框
// 用户滚动时输入框会卸载，导致失焦
// 解决：用 react-window 的 ScrollSeekPlaceholder 或自己保留焦点

// 坑 5：服务端渲染
// 初始 scrollTop = 0，但浏览器会恢复滚动位置
// 需要在 useLayoutEffect 里 sync 一下
\`\`\`

---

## 八、什么时候**不要**用虚拟列表

\`\`\`tsx
// 1. 列表 < 200 行 → 直接全渲染，虚拟列表反而有 overhead
// 2. 列表项非常复杂（每个 50+ DOM 节点）→ 性能仍可能不够，需要分块
// 3. 需要 SEO 的列表 → 虚拟列表的"未渲染项"对爬虫不可见
//    （用 SSR + 初始渲染前 N 项）
// 4. 必须支持"跳到任意行"的命令式 API
//    → 一些虚拟列表库需要特殊处理
\`\`\`

---

## 九、性能对比

| 列表规模 | 全渲染 | 虚拟列表 |
|---|---|---|
| 100 行 | 流畅 | 没必要 |
| 1,000 行 | 略卡 | 流畅 |
| 10,000 行 | 卡顿 | 流畅 |
| 100,000 行 | 浏览器崩溃 | 流畅 |

---

## 小结

- 虚拟列表是"只渲染用户能看见的部分"，让 10 万行也能 60fps 滚动。
- 固定高度最简单，变高需要动态测量。
- react-window 适合固定/变高列表，react-virtuoso 处理更复杂场景。
- 列表 < 200 行时不要用虚拟列表，overhead 反而更大。
- 配合 IntersectionObserver 做图片懒加载，sticky 元素需要特殊处理。`,
  },

  // ===========================================================
  // tsx2-ch55：Profiler 与性能分析
  // ===========================================================
  {
    id: "tsx2-ch55",
    group: "第十一部分 性能优化",
    icon: "🔬",
    title: "第五十五章 Profiler 与性能分析",
    content: `# 第五十五章 Profiler 与性能分析

性能优化的第一步永远是**测量**。本章介绍 React DevTools Profiler、why-did-you-render、performance.mark 三个核心工具，以及一个完整的"性能优化清单"。

---

## 一、React DevTools Profiler

DevTools 浏览器扩展里有个 Profiler 标签，能录制 React 渲染过程。

\`\`\`tsx
// 1. 安装 React DevTools（Chrome / Firefox 都有）
// 2. 打开 DevTools → 切到 Profiler 标签
// 3. 点击录制按钮（圆形）
// 4. 操作你的应用（点按钮、滚动、输入）
// 5. 停止录制

// 你会看到一张"火焰图"（flame chart）：
// - 每个组件是一个条
// - 条越宽 = 渲染耗时越长
// - 颜色：黄色=渲染慢，绿色=正常
// - 灰色=本次没渲染（被 memo 跳过了）
\`\`\`

> 火焰图里找"又宽又黄"的条，那就是慢组件。

---

## 二、React 18 的 Profiler API

\`\`\`tsx
import { Profiler, ReactNode } from "react";

function onRender(
  id: string,                  // Profiler 的 id
  phase: "mount" | "update" | "nested-update",  // 渲染阶段
  actualDuration: number,      // 本次渲染耗时（毫秒）
  baseDuration: number,        // 不优化时的耗时
  startTime: number,           // 开始时间戳
  commitTime: number,          // 提交时间戳
) {
  // 上报数据到埋点系统
  console.log(\`\${id} 渲染耗时 \${actualDuration.toFixed(1)}ms\`);
}

function App() {
  return (
    <Profiler id="App" onRender={onRender}>
      <Toolbar />
      <Profiler id="Heavy" onRender={onRender}>
        <HeavyComponent />
      </Profiler>
    </Profiler>
  );
}
\`\`\`

> 用 Profiler 包裹关键组件，自动收集每次渲染的耗时。生产环境记得抽样或上传到监控系统。

---

## 三、why-did-you-render：找出"为什么重渲染"

\`\`\`tsx
// 安装
// npm i @welldone-software/why-did-you-render

// 在入口文件（main.tsx）顶部加
import React from "react";

if (process.env.NODE_ENV === "development") {
  const whyDidYouRender = require("@welldone-software/why-did-you-render");
  whyDidYouRender(React, {
    trackAllPureComponents: true,  // 跟踪所有"应该 memo 但没 memo"的组件
  });
}

// 给特定组件加标志
const MyComponent = (props) => { ... };
MyComponent.whyDidYouRender = true;  // 告诉库监控这个组件

// 当 MyComponent 在 props 没变（或 shallow equal）时重渲染
// 控制台会打印：
// [why-did-you-render] MyComponent
//   Props changes: { user: { refDifferent: true } }
// 即使对象引用变了但内容没变，也会报警
\`\`\`

---

## 四、自定义重渲染检测 hook

\`\`\`tsx
// 不引第三方，自己写一个
function useRenderCount(name: string) {
  const ref = useRef(0);
  ref.current++;
  console.log(\`[\${name}] 渲染了 \${ref.current} 次\`);
}

// 用法
function BigList() {
  useRenderCount("BigList");
  return <ul>{...}</ul>;
}
\`\`\`

---

## 五、performance.mark / measure：精确测量

\`\`\`tsx
// 浏览器 Performance API 可以打"时间戳"
function HeavyWork() {
  performance.mark("heavy-start");

  // 模拟重计算
  const result = BIG_DATA.filter(/*...*/).map(/*...*/);

  performance.mark("heavy-end");
  performance.measure("heavy", "heavy-start", "heavy-end");

  // 在 DevTools Performance 面板能看到这段
  return result;
}

// 自动上报到监控系统
function reportMeasure() {
  const measures = performance.getEntriesByName("heavy");
  const last = measures[measures.length - 1];
  console.log(\`耗时：\${last.duration.toFixed(2)}ms\`);

  // 清理避免内存泄漏
  performance.clearMeasures("heavy");
  performance.clearMarks("heavy-start");
  performance.clearMarks("heavy-end");
}
\`\`\`

---

## 六、React Profiler 与 performance 配合

\`\`\`tsx
// 把 onRender 里的耗时打点
function onRender(id: string, phase: string, actualDuration: number) {
  performance.mark(\`react-\${id}-end\`);
  performance.measure(\`react-\${id}\`, \`react-\${id}-end\`);
  // 配合 Sentry / 自建监控上报
}
\`\`\`

---

## 七、Chrome DevTools Performance 面板

\`\`\`tsx
// 1. DevTools → Performance 标签
// 2. 点击录制（或 Ctrl+E）
// 3. 操作应用
// 4. 停止

// 你会看到：
// - Main 线程上每帧做了什么（黄色=JS，紫色=Layout，绿色=Paint）
// - FPS 曲线（掉到 60 以下就是卡顿）
// - 长任务（黄色长条 > 50ms = 长任务，会卡 UI）

// 优化目标：
// 1. 主线程每帧 < 16ms
// 2. 没有 > 50ms 的长任务
// 3. Layout / Paint 占比 < 20%
\`\`\`

---

## 八、性能优化清单（checklist）

\`\`\`tsx
// 通用层
// ✅ 1. 测量再优化（用 Profiler / Performance 面板找到瓶颈）
// ✅ 2. 列表 key 用业务唯一字段，不是 index
// ✅ 3. 长列表用虚拟化
// ✅ 4. 首屏外代码用 React.lazy + Suspense

// 组件层
// ✅ 5. React.memo 包裹纯展示组件
// ✅ 6. 子组件需要的回调用 useCallback 稳定
// ✅ 7. 复杂派生数据用 useMemo
// ✅ 8. 状态下沉（不放在不必要的父级）
// ✅ 9. Context 拆分（按更新频率）

// 渲染层
// ✅ 10. 用 useTransition 标记非紧急更新
// ✅ 11. 列表过滤/排序用 useDeferredValue
// ✅ 12. 避免大对象放 state（用 ref 缓存）
// ✅ 13. 表单非受控化（性能敏感时）

// 资源层
// ✅ 14. 图片用 next/image 或懒加载
// ✅ 15. 字体 subsetting
// ✅ 16. CSS 用 CSS-in-JS 增量（避免运行时开销）
// ✅ 17. 第三方库按需引入（lodash-es、antd babel-plugin-import）
\`\`\`

---

## 九、生产环境监控

\`\`\`tsx
// 抽样上报 Profiler 数据
const SAMPLE_RATE = 0.1;  // 10% 用户

function onRender(id: string, phase: string, actualDuration: number) {
  if (Math.random() > SAMPLE_RATE) return;
  // 上报到 Sentry / 自建埋点
  sendBeacon(\`/api/perf\`, {
    id, phase, duration: actualDuration,
    url: location.pathname,
    ua: navigator.userAgent,
  });
}

// 或者用 web-vitals 库
import { onLCP, onFID, onCLS } from "web-vitals";
onLCP(console.log);  // 最大内容绘制
onFID(console.log);  // 首次输入延迟
onCLS(console.log);  // 累计布局偏移
\`\`\`

---

## 小结

- 优化第一步永远是测量：React Profiler、Chrome DevTools、why-did-you-render。
- Profiler 组件可以在生产环境抽样上报，监控真实用户性能。
- 长任务（>50ms）= 一定卡；FPS < 60 = 用户能感觉到卡。
- 优化清单：key 稳定、状态下沉、memo、useCallback、Context 拆分、虚拟列表、懒加载。
- 上 web-vitals 三个核心指标：LCP、FID、CLS。`,
  },
];

export { chapters };
