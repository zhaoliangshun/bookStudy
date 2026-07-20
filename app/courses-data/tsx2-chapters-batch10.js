// =============================================================
// TypeScript + React 从入门到精通大全 —— 第 10 批
// -------------------------------------------------------------
// 章节 46-50：第十部分 高级 Hooks
// 沙箱：/api/run-ts（TS 转译 + ReactJSX 运行时）
// 导出：const chapters
// =============================================================

const chapters = [
  // ===========================================================
  // tsx2-ch46：useId
  // ===========================================================
  {
    id: "tsx2-ch46",
    group: "第十部分 高级 Hooks",
    icon: "🆔",
    title: "第四十六章 useId",
    content: `# 第四十六章 useId

useId 是 React 18 引入的 Hook，专门用来**生成稳定且唯一的 ID**。它在服务端渲染（SSR）和无障碍（a11y）场景下尤其重要——传统的 \`Math.random()\` / \`Date.now()\` 在这些场景下会出问题。

---

## 一、为什么不能自己造 ID

\`\`\`tsx
// ❌ 反例 1：服务端和客户端生成不同的 ID，导致 hydration mismatch
const id = Math.random().toString(36).slice(2);
// 服务端跑：id = "abc"
// 客户端跑：id = "xyz"
// React 报错：Hydration failed

// ❌ 反例 2：用 ref + useState 也会出问题
const [id] = useState(() => Math.random());
// 服务端执行一次，客户端再执行一次，值不同

// ❌ 反例 3：用计数器，多个组件并发时可能重复
let nextId = 0;
const id = \`comp-\${nextId++}\`;
// 在 React 18 并发模式下不可靠
\`\`\`

useId 的设计就是解决这些问题：**同一个组件、同一台机器、同一棵树，id 永远一致；不同的调用得到不同的 id**。

---

## 二、基本用法

\`\`\`tsx
import { useId } from "react";

function FormField() {
  // 生成一个唯一的 id，每个组件实例都不同
  const inputId = useId();

  return (
    <>
      {/* 用同一个 id 关联 label 和 input */}
      <label htmlFor={inputId}>用户名：</label>
      <input id={inputId} type="text" />
    </>
  );
}
\`\`\`

> **同组件多次调用**会得到**不同**的 id：\`useId()\`, \`useId()\`, \`useId()\` 会生成 3 个不同的 ID。

---

## 三、配合 a11y（无障碍）

label 和表单控件必须用同一个 id 关联起来，这是 WCAG 标准。

\`\`\`tsx
function TextField({
  label,
  error,
  ...inputProps
}: {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  // 给 input、error 消息各分配一个 id
  const inputId = useId();
  const errorId = useId();

  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        // 错误消息也被屏幕阅读器读出
        <span id={errorId} role="alert" style={{ color: "red" }}>
          {error}
        </span>
      )}
    </div>
  );
}
\`\`\`

> 用 \`aria-describedby\` 关联错误消息，屏幕阅读器在聚焦 input 时会同时读出错误。

---

## 四、SSR 安全的体现

在 Next.js 等框架下，组件会在**服务端**和**客户端**各跑一次。useId 保证两次跑出来一样。

\`\`\`tsx
// Next.js / Remix 的 RSC（React Server Components）里也能用
// 服务端渲染出的 HTML：<label for=":r1:">
// 客户端 hydrate 后 useId() 同样返回 ":r1:"
// 不会 mismatch
function Page() {
  return (
    <html>
      <body>
        <FormField label="邮箱" />
      </body>
    </html>
  );
}
\`\`\`

---

## 五、同一个组件里用多个 ID

\`\`\`tsx
function PasswordField() {
  // 一次性生成两个 ID，分别用于 input 和提示
  const [inputId, hintId] = [useId(), useId()];
  // 或者更优雅：手动加后缀
  const baseId = useId();

  return (
    <>
      <label htmlFor={baseId}>密码：</label>
      <input
        id={baseId}
        type="password"
        aria-describedby={\`\${hintId}-strength\${hintId}-rules\`}
      />
      <p id={\`\${hintId}-strength\`}>强度：强</p>
      <p id={\`\${hintId}-rules\`}>至少 8 位</p>
    </>
  );
}
\`\`\`

> 推荐用"基础 id + 后缀"的方式管理一组 ID，调试时也更清晰。

---

## 六、生成随机 key 也能用

\`\`\`tsx
function DynamicList({ items }: { items: string[] }) {
  // 想给"匿名子项"一个稳定 key
  const baseId = useId();

  return (
    <ul>
      {items.map((item, i) => (
        // 用 useId 当 key 的后缀，保证稳定 + 唯一
        <li key={\`\${baseId}-\${i}\`}>{item}</li>
      ))}
    </ul>
  );
}
\`\`\`

> **注意**：key 还是推荐用业务唯一字段（id / slug），useId 只在确实没有稳定字段时作为兜底。

---

## 七、useId 不会出现在 DOM 上

useId 返回的 id 形如 \`:r0:\` / \`:r1:\`（冒号包起来）。CSS 选择器需要转义：

\`\`\`tsx
const id = useId();  // ":r2:"

// CSS 里要这样选
// [id=":r2:"]  ← 直接用冒号
// 或者用属性选择器 [id^=":r2"]

// 也可以剥掉冒号
const safeId = id.replace(/:/g, "");
// <div id="r2"></div>
\`\`\`

---

## 八、典型场景清单

| 场景 | 用途 |
|---|---|
| \`<label htmlFor>\` | 关联 label 和 input |
| \`aria-describedby\` | 关联说明文字 |
| \`aria-labelledby\` | 关联标题/分组 |
| \`aria-controls\` | 关联被控制的元素 |
| SVG \`<defs>\` | 给图案/滤镜一个稳定 ID |
| 自动生成 form ID | 嵌套表单时避免重复 |

---

## 小结

- useId 是 React 18 提供的"稳定唯一 ID"生成器，专治 SSR 下的 id 不一致。
- 用法极简：\`const id = useId();\`，可重复调用，**每次都不同**。
- 配合 \`htmlFor\` / \`aria-describedby\` / \`aria-labelledby\` 写无障碍组件。
- DOM 里的 id 形如 \`:r0:\`，CSS 选元素时记得这种格式。`,
  },

  // ===========================================================
  // tsx2-ch47：useTransition
  // ===========================================================
  {
    id: "tsx2-ch47",
    group: "第十部分 高级 Hooks",
    icon: "⏳",
    title: "第四十七章 useTransition",
    content: `# 第四十七章 useTransition

React 18 引入了**并发渲染（Concurrent Rendering）**能力。useTransition 就是这个能力对外暴露的 Hook 之一：它让你把"不紧急的状态更新"标记出来，让 React 优先处理用户输入、动画等"紧急任务"。

---

## 一、什么是"过渡（Transition）"

在 React 18 之前，**所有状态更新都是"紧急"的**——一旦 setState，React 立刻开始同步渲染，中间不能被打断。这导致一个问题：

\`\`\`tsx
// 想象输入框 onChange 里调 setState
// 同时根据关键词过滤一个 1 万条数据的列表
// 用户每按一个键，渲染就卡 200ms，输入框"卡顿"

function Search() {
  const [query, setQuery] = useState("");
  // 同步过滤 1 万条数据
  const filtered = BIG_LIST.filter(item => item.includes(query));
  return <input onChange={e => setQuery(e.target.value)} />;
}
\`\`\`

React 18 的解决方案：**把"更新 query"标为紧急，"更新过滤结果"标为过渡**。这样输入框保持流畅，过滤结果稍后才更新。

---

## 二、useTransition 基本用法

\`\`\`tsx
import { useState, useTransition } from "react";

function Search() {
  const [query, setQuery] = useState("");
  // pending: 是否处于过渡中
  // startTransition: 把某个更新包起来，标记为非紧急
  const [pending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 第一步：紧急更新——立刻把输入框值改过来
    setQuery(value);

    // 第二步：非紧急更新——过滤可以晚一点
    // 这里的 setState 都用函数式形式，React 会延后执行
    startTransition(() => {
      setFiltered(BIG_LIST.filter(item => item.includes(value)));
    });
  };

  return (
    <>
      <input value={query} onChange={handleChange} />
      {/* pending 期间显示 loading 状态 */}
      {pending && <span>加载中…</span>}
      <List items={filtered} />
    </>
  );
}
\`\`\`

---

## 三、startTransition 的特性

\`\`\`tsx
// 1. 必须是同步函数，不能是 async
startTransition(() => {
  setA(1);
  setB(2);
});

// ❌ 这样不行：async 函数里 setState 已经发生在 await 之后
startTransition(async () => {
  await fetchData();
  setData(result);  // 这个 setState 不在 transition 里
});

// ✅ 正确做法：await 之后用 useTransition 包
async function load() {
  const result = await fetchData();
  startTransition(() => setData(result));
}

// 2. 在 transition 里的更新可以被打断
//    如果用户又输入了新字符，React 会放弃当前 transition，重新开始

// 3. transition 里抛出的错误会被边界捕获
\`\`\`

---

## 四、pending 状态的实际意义

\`\`\`tsx
function HeavyList({ query }: { query: string }) {
  const [filtered, setFiltered] = useState<Item[]>([]);
  const [pending, startTransition] = useTransition();

  // 父组件传新 query 过来时，启动 transition
  useEffect(() => {
    startTransition(() => {
      setFiltered(BIG_LIST.filter(item => item.includes(query)));
    });
  }, [query]);

  return (
    <div style={{ opacity: pending ? 0.6 : 1 }}>
      {/* pending 时降低透明度，给用户"在加载"的暗示 */}
      {pending && <Spinner />}
      <ul>{filtered.map(item => <li key={item.id}>{item.name}</li>)}</ul>
    </div>
  );
}
\`\`\`

---

## 五、哪些更新适合放进 startTransition

| 适合 | 不适合 |
|---|---|
| 大列表过滤、搜索 | 输入框的受控值（必须立即响应） |
| 路由切换 | 动画 / 滚动 |
| 标签页切换 | 弹窗显示/隐藏 |
| 复杂图表重绘 | 用户主动点击触发的反馈 |
| 视图模式切换（网格/列表） | 表单提交的状态 |

> 简单判断：**用户能否容忍这个更新晚 100ms 显示**？能就放进 transition。

---

## 六、useTransition 与 Suspense 配合

transition 里的组件如果触发 lazy load，会自动用 Suspense 的 fallback，**不会**让整个页面 fallback 闪一下。

\`\`\`tsx
import { Suspense, lazy, useState, useTransition } from "react";
const Heavy = lazy(() => import("./Heavy"));

function App() {
  const [tab, setTab] = useState("home");
  const [pending, startTransition] = useTransition();

  const onTabClick = (newTab: string) => {
    // 切 tab 是非紧急的，可以延后
    startTransition(() => setTab(newTab));
  };

  return (
    <>
      <TabBar active={tab} onClick={onTabClick} />
      {pending && <TopLoadingBar />}  {/* 顶部小进度条 */}
      <Suspense fallback={<PageSkeleton />}>
        {tab === "home" ? <Home /> : <Heavy />}
      </Suspense>
    </>
  );
}
\`\`\`

没有 transition 时，点击切到 Heavy 标签会瞬间用 PageSkeleton 替换整个页面，体验很差；有了 transition，**页面停留在旧内容**，等 Heavy 加载完再平滑切换。

---

## 七、避免常见错误

\`\`\`tsx
// ❌ 错误 1：把"输入框值"放进 transition
// 用户的按键必须立刻反映到 UI 上
const [value, setValue] = useState("");
startTransition(() => setValue(e.target.value));  // 输入会卡

// ✅ 正确：输入框紧急，派生状态用 transition
setValue(e.target.value);  // 紧急
startTransition(() => setFiltered(...));  // 非紧急

// ❌ 错误 2：在 transition 里 await
startTransition(async () => {
  const data = await fetchData();
  setData(data);
});

// ✅ 正确：await 放在外面，setData 放进 transition
async function handler() {
  const data = await fetchData();
  startTransition(() => setData(data));
}
\`\`\`

---

## 小结

- useTransition 解决"更新太多导致主线程卡顿"的问题。
- 关键 API：\`startTransition(callback)\` 包裹非紧急更新；\`pending\` 标识是否还在过渡中。
- transition 里的更新**可被打断**——React 优先处理更紧急的更新。
- 配合 Suspense + lazy 时，切换路由/标签不会闪 skeleton，体验更平滑。
- 紧急更新（输入框、动画）**不要**放进 transition，否则用户感知到卡顿。`,
  },

  // ===========================================================
  // tsx2-ch48：useDeferredValue
  // ===========================================================
  {
    id: "tsx2-ch48",
    group: "第十部分 高级 Hooks",
    icon: "🕐",
    title: "第四十八章 useDeferredValue",
    content: `# 第四十八章 useDeferredValue

useDeferredValue 和 useTransition 是一对"兄弟 API"：useTransition 是让你**主动**把更新标为非紧急；useDeferredValue 是让你**被动**接收一个"延迟版"的值。两者底层都利用了 React 18 的并发渲染。

---

## 一、为什么需要 useDeferredValue

\`\`\`tsx
// 场景：父组件传一个快速变化的值（搜索框 query）给子组件
// 子组件根据 query 渲染一份很重的视图

function Parent() {
  const [query, setQuery] = useState("");
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <HeavyChild query={query} />
    </>
  );
}

function HeavyChild({ query }: { query: string }) {
  // 这个组件渲染很慢（比如画 1 万个节点）
  // 每次 query 变它都要从头算
  return <List items={BIG_LIST.filter(item => item.includes(query))} />;
}
\`\`\`

每次按键 query 都立刻传给 HeavyChild，导致它每次都立即重渲染。**useDeferredValue 让你"延后"接收这个值**。

---

## 二、基本用法

\`\`\`tsx
import { useDeferredValue } from "react";

function HeavyChild({ query }: { query: string }) {
  // 拿到一个"延迟版"的 query：父组件 query 变时，React 不立刻用它
  // 而是等主线程空闲时再更新
  const deferredQuery = useDeferredValue(query);

  // 用 deferredQuery 算派生数据
  const filtered = BIG_LIST.filter(item => item.includes(deferredQuery));

  return <List items={filtered} />;
}
\`\`\`

行为：
- 父组件 query 从 "a" → "ab" 时，HeavyChild 先用旧值 "a" 继续渲染（保持响应）。
- 主线程空下来后，React 用 "ab" 重渲染 HeavyChild。

**结果**：用户输入框始终流畅，重组件"追上来"即可。

---

## 三、和 debounce 的区别

\`\`\`tsx
// debounce：等用户停止输入 N 毫秒才更新
const debounced = useDebounce(query, 300);
// 行为：用户输入 → 等 300ms → 才更新

// useDeferredValue：React 调度器决定何时更新
const deferred = useDeferredValue(query);
// 行为：用户输入 → 立刻标记为低优先级 → React 找到空闲时再更新
\`\`\`

| 维度 | debounce | useDeferredValue |
|---|---|---|
| 延迟策略 | 固定时间 | 框架调度决定 |
| 第一次更新 | 必然等 N ms | 可能立刻更新（如果主线程空闲） |
| 被打断 | 不能 | 能（用户又输入时丢弃上一次） |
| 适配 SSR | ❌ 需 polyfill | ✅ React 内置 |
| 时间感知 | 用户/开发者决定 | 浏览器帧率自适应 |

> useDeferredValue 更智能——它不浪费时间，会"挤"出空就更新。

---

## 四、配合 memo 优化

useDeferredValue 的"延迟"会让组件先用旧值渲染一次。这给了你用 React.memo 阻止重渲染的机会。

\`\`\`tsx
const Row = React.memo(function Row({ item, highlight }: { item: Item; highlight: string }) {
  // 复杂计算
  return <li style={{ background: item.includes(highlight) ? "yellow" : "" }}>{item}</li>;
});

function HeavyChild({ query }: { query: string }) {
  const deferred = useDeferredValue(query);
  const filtered = BIG_LIST.filter(item => item.includes(deferred));

  return (
    <ul>
      {filtered.map(item => (
        // 当 deferred 不变时（即 query 还在变），Row 不会重渲染
        <Row key={item.id} item={item.name} highlight={deferred} />
      ))}
    </ul>
  );
}
\`\`\`

注意这里 key 用了 item.id 而不是 \`filtered\` 的 index，这样当 deferred 追上新值时，只有需要更新的 Row 重渲染。

---

## 五、pending 状态检测

useDeferredValue 没有自己的 pending，但你能用 \`useSyncExternalStore\` 或旧值 === 新值 检测"是不是还在过渡中"。

\`\`\`tsx
function HeavyChild({ query }: { query: string }) {
  const deferred = useDeferredValue(query);
  // 如果当前值不等于"最新传入的值"，说明 React 还在追
  const isStale = query !== deferred;

  return (
    <div style={{ opacity: isStale ? 0.7 : 1 }}>
      {isStale && <span>（正在更新…）</span>}
      <List query={deferred} />
    </div>
  );
}
\`\`\`

> 这就是 useTransition 提供的 \`pending\` 在 useDeferredValue 里的等价实现。

---

## 六、典型用法：表格 + 搜索

\`\`\`tsx
function DataTable({ rows, query }: { rows: Row[]; query: string }) {
  const deferredQuery = useDeferredValue(query);

  // 当 query 变化时，先用旧 deferredQuery 渲染
  // React 调度器空下来再用新值重新过滤
  const filtered = useMemo(() => {
    return rows.filter(r => r.name.toLowerCase().includes(deferredQuery.toLowerCase()));
  }, [rows, deferredQuery]);

  return (
    <table>
      <thead><tr><th>名称</th><th>值</th></tr></thead>
      <tbody>
        {filtered.map(r => <tr key={r.id}><td>{r.name}</td><td>{r.value}</td></tr>)}
      </tbody>
    </table>
  );
}
\`\`\`

10 万行数据下，输入框依然流畅。

---

## 七、和 useTransition 的取舍

| 场景 | 推荐 |
|---|---|
| 你**能控制**事件处理函数（onClick、onChange） | useTransition 更直接 |
| 你是**接收 prop** 的子组件，没法改父组件 | useDeferredValue 唯一选择 |
| 需要 pending 状态做 UI 反馈 | useTransition |
| 不想动事件代码，只想"让重渲染延后" | useDeferredValue |

实际项目里两者经常**配合使用**：
- 父组件用 useTransition 控制事件
- 子组件用 useDeferredValue 进一步"兜底"重渲染

---

## 小结

- useDeferredValue = "接收一个延迟版的值"，主线程不空闲时返回旧值。
- 解决"高频传入的 prop 导致重组件卡顿"。
- 比 debounce 更智能：自适应帧率、可被打断。
- 配合 React.memo 效果最佳：旧值期间保持稳定引用。
- 没有内置 pending 标志，但 \`value !== deferredValue\` 就是过渡中。`,
  },

  // ===========================================================
  // tsx2-ch49：useSyncExternalStore
  // ===========================================================
  {
    id: "tsx2-ch49",
    group: "第十部分 高级 Hooks",
    icon: "🔗",
    title: "第四十九章 useSyncExternalStore",
    content: `# 第四十九章 useSyncExternalStore

useSyncExternalStore 是 React 18 引入的 Hook，专门用来**订阅 React 之外的数据源**（比如 Redux、Zustand、localStorage、window.matchMedia 等）。它解决了"在并发渲染下外部数据可能不一致"的问题。

---

## 一、为什么需要 useSyncExternalStore

\`\`\`tsx
// 假设我们想订阅 localStorage 的变化
function useLocalStorage(key: string) {
  // ❌ 反例 1：直接在 useState 里读，外部变化时不会更新
  const [value, setValue] = useState(localStorage.getItem(key));
  return value;
}

// ❌ 反例 2：用 useEffect 订阅
function useLocalStorage2(key: string) {
  const [value, setValue] = useState(localStorage.getItem(key));
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key) setValue(e.newValue);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key]);
  return value;
}
\`\`\`

反例 2 在 React 18 并发模式下会出问题：
- 渲染可能被中断
- 外部数据在中断期间可能变化
- React 重启渲染时拿到的可能是"过期快照"
- 出现 UI 和数据不一致的 bug（tearing）

useSyncExternalStore 就是 React 18 给出的"正确订阅外部源"的标准 API。

---

## 二、useSyncExternalStore 的签名

\`\`\`tsx
// 三个参数：
// 1. subscribe：订阅函数，接收 callback，当数据变化时调用 callback
// 2. getSnapshot：取当前快照值（必须返回稳定引用！）
// 3. getServerSnapshot（可选）：SSR 时取值的函数

const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
\`\`\`

---

## 三、订阅 localStorage

\`\`\`tsx
import { useSyncExternalStore } from "react";

// 自定义 storage 事件（因为 storage 事件只在其他 tab 触发）
function emitChange(key: string, newValue: string | null) {
  window.dispatchEvent(new CustomEvent("local-storage-change", { detail: { key, newValue } }));
}

// 写值时通知订阅者
function setItem(key: string, value: string) {
  localStorage.setItem(key, value);
  emitChange(key, value);
}

function useLocalStorage(key: string): string | null {
  return useSyncExternalStore(
    // 1. subscribe：监听 storage 事件 + 自定义事件
    (notify) => {
      const onStorage = (e: StorageEvent) => { if (e.key === key) notify(); };
      const onCustom = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail.key === key) notify();
      };
      window.addEventListener("storage", onStorage);
      window.addEventListener("local-storage-change", onCustom);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener("local-storage-change", onCustom);
      };
    },
    // 2. getSnapshot：返回当前值（必须引用稳定）
    () => localStorage.getItem(key),
    // 3. getServerSnapshot：SSR 时返回 null
    () => null,
  );
}
\`\`\`

---

## 四、订阅 matchMedia

\`\`\`tsx
// 检测用户偏好：是否开了 reduced motion
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    // 订阅媒体查询变化
    (notify) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    // 当前值
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    // SSR 默认
    () => false,
  );
}

function AnimatedBox() {
  const reduce = usePrefersReducedMotion();
  return <div style={{ transition: reduce ? "none" : "all 0.3s" }}>...</div>;
}
\`\`\`

---

## 五、订阅在线状态

\`\`\`tsx
function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    (notify) => {
      window.addEventListener("online", notify);
      window.addEventListener("offline", notify);
      return () => {
        window.removeEventListener("online", notify);
        window.removeEventListener("offline", notify);
      };
    },
    () => navigator.onLine,
    () => true,  // SSR 时假设在线
  );
}

function StatusBar() {
  const online = useOnlineStatus();
  return <p>{online ? "🟢 在线" : "🔴 离线"}</p>;
}
\`\`\`

---

## 六、订阅 Redux / Zustand 之类的状态库

\`\`\`tsx
// Zustand 自带 useSyncExternalStore 实现
import { create } from "zustand";

const useStore = create((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
}));

function Counter() {
  // 自动按 selector 订阅，count 变才重渲染
  const count = useStore((s) => s.count);
  const inc = useStore((s) => s.inc);
  return <button onClick={inc}>count: {count}</button>;
}

// Redux 8+ 的 useSelector 也用 useSyncExternalStore 实现
import { useSelector } from "react-redux";
function TodoList() {
  const todos = useSelector((s: RootState) => s.todos);
  return <ul>{todos.map(t => <li key={t.id}>{t.text}</li>)}</ul>;
}
\`\`\`

---

## 七、getSnapshot 必须返回稳定引用

\`\`\`tsx
// ❌ 错误：每次调用返回新对象
const value = useSyncExternalStore(
  subscribe,
  () => ({ count: store.count }),  // 新对象，引用每次都不同
  () => ({ count: 0 }),
);
// React 会陷入无限循环！

// ✅ 正确：返回稳定值（primitive 或固定对象）
const value = useSyncExternalStore(
  subscribe,
  () => store.count,  // 数字，引用稳定
);

// ✅ 或者用 useMemo 在外部包一层
const value = useSyncExternalStore(
  subscribe,
  () => store.user,  // 假设 store.user 是引用稳定的
);
\`\`\`

> 这条规则最容易踩坑。如果你的数据源每次返回新对象，需要在数据源层做缓存或提供"上次值"。

---

## 八、什么时候**不要**用

| 场景 | 用什么 |
|---|---|
| 组件内部状态 | useState |
| 跨组件共享的 React 状态 | Context + useReducer |
| Redux / Zustand / Jotai 之类 | 它们自己的 hook（内部已封装 useSyncExternalStore） |
| 外部数据源（localStorage、matchMedia、WebSocket） | ✅ useSyncExternalStore |

---

## 小结

- useSyncExternalStore 是 React 18 的"订阅外部数据源"标准 API。
- 三大参数：subscribe / getSnapshot / getServerSnapshot（SSR）。
- 核心价值：在并发渲染下保证 UI 不出现 tearing（撕裂）。
- getSnapshot 必须返回**稳定引用**，否则死循环。
- Redux 8 / Zustand / Jotai 都已用它实现，**优先用库的 hook**而不是自己包。`,
  },

  // ===========================================================
  // tsx2-ch50：useImperativeHandle 与 useLayoutEffect
  // ===========================================================
  {
    id: "tsx2-ch50",
    group: "第十部分 高级 Hooks",
    icon: "🎛️",
    title: "第五十章 useImperativeHandle 与 useLayoutEffect",
    content: `# 第五十章 useImperativeHandle 与 useLayoutEffect

这一章讲两个相对底层的 Hook：useImperativeHandle 用来"暴露子组件的命令式 API"，useLayoutEffect 用来"在浏览器绘制前同步执行副作用"。两者都偏底层，95% 的业务代码用不上，但需要时不可或缺。

---

## 一、ref 基础回顾

\`\`\`tsx
// useRef 返回一个"跨渲染保持"的容器对象
// .current 字段是自由读写区
function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>聚焦</button>
    </>
  );
}
\`\`\`

ref 有两个特殊属性：
1. \`.current\` 变化**不触发**重渲染。
2. 不能通过 props 传递（React 不推荐），要用 forwardRef（ch19 提过）。

---

## 二、useImperativeHandle：自定义 ref 暴露的 API

\`\`\`tsx
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

// 子组件类型签名：定义它愿意暴露的命令式 API
type InputHandle = {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
};

// 用 forwardRef 包裹，让父组件能传 ref 进来
const FancyInput = forwardRef<InputHandle, { placeholder?: string }>(
  function FancyInput({ placeholder }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState("");

    // 用 useImperativeHandle 重新定义 ref.current 的形状
    useImperativeHandle(ref, () => ({
      // 父组件调用 ref.current.focus() 时，实际执行这里
      focus: () => { inputRef.current?.focus(); },
      clear: () => {
        setValue("");
        inputRef.current?.focus();
      },
      getValue: () => value,
    }), [value]);  // 依赖项：value 变时重建对象

    return (
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
      />
    );
  }
);

// 父组件使用
function Form() {
  const inputRef = useRef<InputHandle>(null);

  return (
    <>
      <FancyInput ref={inputRef} placeholder="请输入" />
      <button onClick={() => inputRef.current?.focus()}>聚焦</button>
      <button onClick={() => alert(inputRef.current?.getValue())}>取值</button>
    </>
  );
}
\`\`\`

**为什么要包一层**：直接暴露 DOM 元素（\`ref={inputRef}\`）会让父组件完全控制 DOM，破坏封装。useImperativeHandle 让父组件只能调"你愿意暴露"的方法。

---

## 三、useImperativeHandle 的细节

\`\`\`tsx
useImperativeHandle(ref, createHandle, deps?);

// 1. 不传 createHandle：ref.current = undefined（清空）
useImperativeHandle(ref, undefined);

// 2. 依赖项：和 useMemo 一样
//    空依赖：只创建一次
//    有依赖：依赖变时重建

// 3. 多次调用 useImperativeHandle：后面的覆盖前面的

// 4. 配合 TypeScript：用 useRef<HandleType>(null!)
//    ! 是"我保证会被赋值"断言
\`\`\`

---

## 四、useLayoutEffect：同步副作用

\`\`\`tsx
// useEffect 在浏览器绘制之后才执行（异步）
// useLayoutEffect 在浏览器绘制之前执行（同步）

function Box() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  // 用 useLayoutEffect 在"绘制前"读取 DOM
  // 避免"先显示错的高度，再改回正确高度"的闪烁
  useLayoutEffect(() => {
    if (ref.current) {
      setHeight(ref.current.getBoundingClientRect().height);
    }
  }, []);

  return <div ref={ref}>...</div>;
}
\`\`\`

**useLayoutEffect 的执行时机**：
1. React 更新 DOM
2. useLayoutEffect 同步执行
3. 浏览器绘制
4. useEffect 异步执行

---

## 五、useEffect vs useLayoutEffect

| 维度 | useEffect | useLayoutEffect |
|---|---|---|
| 执行时机 | 浏览器绘制**之后** | 浏览器绘制**之前** |
| 是否阻塞绘制 | 不阻塞 | 阻塞 |
| 适合场景 | 大多数副作用（订阅、发请求） | DOM 测量、强制布局、避免闪烁 |
| SSR 警告 | ✅ 服务端不会跑（安全） | ⚠️ 服务端跑会警告（用 useIsomorphicLayoutEffect 兜底） |

> **经验法则**：先用 useEffect，遇到闪烁再换 useLayoutEffect。

---

## 六、典型场景：自适应高度文本域

\`\`\`tsx
function AutoTextarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // 每次 value 变，调整 textarea 高度到内容高度
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // 先重置为 auto 让 scrollHeight 重新计算
    el.style.height = "auto";
    el.style.height = \`\${el.scrollHeight}px\`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ resize: "none", overflow: "hidden" }}
    />
  );
}
\`\`\`

如果用 useEffect，用户会看到"先小→再变大"的一帧闪烁。

---

## 七、SSR 下的 useLayoutEffect 警告

\`\`\`tsx
// 在 Next.js / Remix 等 SSR 框架里，组件会在服务端跑一次
// 服务端没有 DOM，useLayoutEffect 会报警告
// 解决方案：写一个"同构"版本

import { useEffect, useLayoutEffect } from "react";
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function Comp() {
  useIsomorphicLayoutEffect(() => {
    // 服务端跑 useEffect，客户端跑 useLayoutEffect
  }, []);
}
\`\`\`

> React 18 之后，服务端也会直接执行 useLayoutEffect 的 setup（不报警告了），但**清理函数不会跑**。所以现在大多数情况不用管。

---

## 八、useImperativeHandle + useLayoutEffect 组合

有时需要"组件挂载后立刻让父组件能调命令式 API"：

\`\`\`tsx
const Modal = forwardRef<ModalHandle, { children: ReactNode }>(
  function Modal({ children }, ref) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useImperativeHandle(ref, () => ({
      open: () => dialogRef.current?.showModal(),
      close: () => dialogRef.current?.close(),
    }), []);

    // 挂载时如果默认应该打开，可以用 useLayoutEffect
    useLayoutEffect(() => {
      dialogRef.current?.showModal();
    }, []);

    return <dialog ref={dialogRef}>{children}</dialog>;
  }
);
\`\`\`

---

## 九、什么情况下用 ref，而不是 state？

\`\`\`tsx
// 用 ref（不变更触发渲染）：
// 1. 计时器 ID、订阅 ID、AbortController
// 2. DOM 引用
// 3. 上一帧的值
// 4. 命令式 API（useImperativeHandle 暴露的）

// 用 state（变更触发渲染）：
// 1. 表单值
// 2. 列表数据
// 3. UI 标志（loading、error、open）
// 4. 任何会显示在 UI 上的值
\`\`\`

判断标准：**"这个值变化需要让用户看到吗？"** 是 → state；否 → ref。

---

## 小结

- useImperativeHandle + forwardRef：让父组件**通过 ref 调子组件暴露的命令式 API**（focus、scrollTo、open 等）。
- useLayoutEffect：在浏览器绘制**前**同步执行，**避免闪烁**或**读 DOM 布局**。
- 95% 场景用 useEffect 即可，遇到"测量 DOM 后立刻改样式"或"动画定位"时换 useLayoutEffect。
- SSR 项目用 \`useIsomorphicLayoutEffect\` 模式规避警告（React 18 已基本解决）。
- ref 不触发渲染，state 触发渲染——这是最核心的取舍标准。`,
  },
];

export { chapters };
