// =============================================================
// React 中使用 TypeScript 从入门到精通大全 —— 第九批章节
// -------------------------------------------------------------
// 覆盖：第五部分 Hooks 全解（下段）
// 包含 5 个章节：ch40 ~ ch44
//
// 章节列表：
//   - ch40 useReducer 复杂状态
//   - ch41 useContext 与性能优化
//   - ch42 自定义 Hook 设计原则
//   - ch43 自定义 Hook 实战合集
//   - ch44 useId/useSyncExternalStore/useTransition/useDeferredValue
//
// 风格定位：
//   - 每章都从"为什么需要"切入，再讲"怎么用"
//   - 每段代码都配套逐行注释，注释里讲透"为什么这样写"
//   - 所有 demo 都通过 /api/run-ts 沙箱可运行
//   - 语言简洁、直击要点，避免堆砌
//
// 运行环境：
//   - TypeScript 5.x（strict、esModuleInterop 等默认开启）
//   - React 18（沙箱注入 react / react-dom）
//   - 沙箱使用 ts.transpileModule，target=ES2020, module=CommonJS, jsx=ReactJSX
// =============================================================

const chapters = [
  // ============================================================
  // ch40: useReducer 复杂状态
  // ============================================================
  {
    id: "tsx3-ch40",
    group: "第五部分 Hooks 全解",
    icon: "🎛️",
    title: "ch40 useReducer 复杂状态",
    content: `# ch40 useReducer 复杂状态

## 为什么讲这个

当组件状态变多、状态之间有依赖、状态变化需要"按规则走"时，\`useState\` 会让你写出面条式的 \`setXxx\` 代码——逻辑散落在事件处理函数里，bug 修复时你得在五六个 \`set\` 调用之间反复横跳。\`useReducer\` 把"状态怎么变"集中到一处（reducer 函数），把"想让它怎么变"用 action 表达，复杂状态机瞬间清晰。

## 1. useReducer vs useState：什么时候该换

判断标准很简单：**当多个状态需要一起变化、或下一步状态依赖上一步多个字段时**，就该换 \`useReducer\`。

\`\`\`ts
// ❌ useState 写法：逻辑分散、容易遗漏
function FormUseState() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);     // 容易忘记重置 error
    setError(null);
    try {
      const res = await fetch("/api");
      setData(await res.text());
    } catch (e) {
      setData(null);      // 又要手动重置 data
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };
  // 三个 set 散落 4 处，改一个忘了改另一个就是 bug
}
\`\`\`

\`\`\`tsx
// ✅ useReducer 写法：状态变迁集中在一个 reducer 里
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string }
  | { status: "error"; error: string };

// action 用联合类型，每一个分支都是一个明确的"意图"
type Action =
  | { type: "START" }
  | { type: "SUCCESS"; data: string }
  | { type: "ERROR"; error: string }
  | { type: "RESET" };

// reducer：纯函数，根据 action.type 决定下一个状态
// 这里 TS 的穷尽检查保证你不会漏掉任何一个分支
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { status: "loading" };           // 进入 loading，自动丢掉旧 data/error
    case "SUCCESS":
      return { status: "success", data: action.data };
    case "ERROR":
      return { status: "error", error: action.error };
    case "RESET":
      return { status: "idle" };
    // 这里不需要 default：联合类型被穷尽后，TS 会强制你写全所有 case
  }
}

function FormUseReducer() {
  const [state, dispatch] = useReducer(reducer, { status: "idle" });

  const submit = async () => {
    dispatch({ type: "START" });               // 一个动作表达完整意图
    try {
      const res = await fetch("/api");
      dispatch({ type: "SUCCESS", data: await res.text() });
    } catch (e) {
      dispatch({ type: "ERROR", error: String(e) });
    }
  };

  // 渲染时按状态分支，TS 自动收窄 data/error 字段
  return (
    <div>
      {state.status === "loading" && <p>加载中...</p>}
      {state.status === "success" && <p>{state.data}</p>}
      {state.status === "error" && <p style={{ color: "red" }}>{state.error}</p>}
      <button onClick={submit}>提交</button>
    </div>
  );
}
\`\`\`

差别一眼可见：reducer 让"状态机"显式可见，每个 action 都是一个原子变迁，**不会出现"半个状态"**。

## 2. reducer 的类型签名

reducer 的类型签名由 React 提供：\`Reducer<State, Action>\`。

\`\`\`ts
import { useReducer, Reducer } from "react";

// 显式标注 reducer 类型，让 reducer 函数体内得到精确的类型提示
const counterReducer: Reducer<number, Action> = (state, action) => {
  // state 自动推断为 number
  // action 自动推断为 Action 联合类型
  switch (action.type) {
    case "INC": return state + 1;
    case "DEC": return state - 1;
  }
};
\`\`\`

更推荐的做法是**让 TS 从 reducer 反推类型**，而不是手写 \`Reducer<...>\`：

\`\`\`ts
// 让 reducer 自己定义类型，组件里 useReducer 自动推断
function todoReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case "ADD": return [...state, action.todo];
    case "REMOVE": return state.filter(t => t.id !== action.id);
  }
}

// 组件里：
// const [todos, dispatch] = useReducer(todoReducer, initialTodos);
// todos 自动推断为 Todo[]，dispatch 自动推断为 Dispatch<TodoAction>
\`\`\`

## 3. action 联合类型与 dispatch 类型

action 用**联合类型 + 字面量标签**是 React + TS 的核心模式：

\`\`\`ts
// 每个分支的 type 字段是字面量字符串，作为"标签"
type CartAction =
  | { type: "ADD"; product: Product; quantity: number }
  | { type: "REMOVE"; productId: string }
  | { type: "CLEAR" }
  | { type: "APPLY_COUPON"; code: string };

// dispatch 的类型由 useReducer 自动推断
// 不需要手写 Dispatch<CartAction>，下面这行就是冗余：
// const dispatch: Dispatch<CartAction> = ...;
\`\`\`

调用 \`dispatch\` 时，TS 会根据 \`type\` 字段提示你必填的额外字段：

\`\`\`ts
dispatch({ type: "ADD" });
// ❌ 报错：缺少 product 和 quantity

dispatch({ type: "ADD", product: p, quantity: 1 });
// ✅ 正确

dispatch({ type: "REMOVE", productId: "abc" });
// ✅ 正确
\`\`\`

## 4. 穷尽检查：never 技巧

为了防止你新增 action 类型后忘记在 reducer 里加分支，可以在 switch 末尾用一个 \`never\` 检查：

\`\`\`ts
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START": return { status: "loading" };
    case "SUCCESS": return { status: "success", data: action.data };
    case "ERROR": return { status: "error", error: action.error };
    case "RESET": return { status: "idle" };
    default: {
      // 如果 Action 联合类型新增了一个分支但上面没处理
      // action 在这里就会被收窄成那个新类型，赋给 never 会报错
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
\`\`\`

新增 \`{ type: "CANCEL" }\` 时，TS 会在 \`const _exhaustive: never = action\` 报错——提醒你补 case。

## 5. 复杂状态机示例：购物车

下面是一个稍微完整一点的购物车 reducer，体现"复杂状态机"思路：

\`\`\`tsx
type Product = { id: string; name: string; price: number };

type CartItem = Product & { quantity: number };

type CartState = {
  items: CartItem[];
  coupon: string | null;
  // 派生字段：总价（也可以选择不存，渲染时算）
  total: number;
};

type CartAction =
  | { type: "ADD"; product: Product; quantity: number }
  | { type: "REMOVE"; productId: string }
  | { type: "CLEAR" }
  | { type: "APPLY_COUPON"; code: string };

// 计算总价：把所有 item 的 price * quantity 加总
function calcTotal(items: CartItem[], coupon: string | null): number {
  const sum = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  // 简单优惠券：VIP9 折
  return coupon === "VIP" ? sum * 0.9 : sum;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      // 已存在的商品增加数量，否则新增
      const existing = state.items.find(i => i.id === action.product.id);
      const items = existing
        ? state.items.map(i =>
            i.id === action.product.id
              ? { ...i, quantity: i.quantity + action.quantity }
              : i
          )
        : [...state.items, { ...action.product, quantity: action.quantity }];
      return { ...state, items, total: calcTotal(items, state.coupon) };
    }
    case "REMOVE": {
      const items = state.items.filter(i => i.id !== action.productId);
      return { ...state, items, total: calcTotal(items, state.coupon) };
    }
    case "CLEAR":
      return { items: [], coupon: null, total: 0 };
    case "APPLY_COUPON": {
      const coupon = action.code || null;
      return { ...state, coupon, total: calcTotal(state.items, coupon) };
    }
  }
}

function ShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    coupon: null,
    total: 0,
  });

  return (
    <div>
      <ul>
        {state.items.map(item => (
          <li key={item.id}>
            {item.name} x {item.quantity} = ¥{item.price * item.quantity}
            <button onClick={() => dispatch({ type: "REMOVE", productId: item.id })}>
              删除
            </button>
          </li>
        ))}
      </ul>
      <p>总计：¥{state.total}</p>
      <button onClick={() => dispatch({ type: "APPLY_COUPON", code: "VIP" })}>
        应用 VIP 折扣
      </button>
      <button onClick={() => dispatch({ type: "CLEAR" })}>清空</button>
    </div>
  );
}
\`\`\`

注意三个设计点：

1. **派生字段 total 跟着状态走**——所有路径都重算 total，不会出现"items 变了 total 没变"的不一致。
2. **action 描述意图**，不描述实现——"ADD" 而不是 "PUSH_TO_ARRAY"。
3. **reducer 是纯函数**，所有副作用（网络、定时器）都留在组件里。

## 小结

- 多个状态联动、状态变迁有规则时，\`useReducer\` 比 \`useState\` 更安全。
- action 用联合类型 + 字面量标签，dispatch 类型由 \`useReducer\` 自动推断。
- 用 \`never\` 做穷尽检查，新增 action 时 TS 强制你补 case。
- reducer 必须是纯函数，副作用留在组件里。

## 避坑清单

- ❌ 一个 action 里有 5 个字段还都可选（应该拆成多个 action）
- ❌ reducer 里调 fetch / setTimeout（reducer 必须纯函数）
- ❌ 在 reducer 里 mutate state（应该返回新对象）
- ❌ 不用 \`never\` 穷尽检查（新增 action 会漏 case）
- ❌ 状态字段过多还不分模块（应该按业务域拆多个 useReducer）

下一章我们看 \`useContext\`——以及它最棘手的"性能问题"。`
  },

  // ============================================================
  // ch41: useContext 与性能优化
  // ============================================================
  {
    id: "tsx3-ch41",
    group: "第五部分 Hooks 全解",
    icon: "🌐",
    title: "ch41 useContext 与性能优化",
    content: `# ch41 useContext 与性能优化

## 为什么讲这个

\`useContext\` 是 React 跨组件传值的官方方案——免掉 props 逐层透传。但它有一个广为人知的副作用：**任何 Context 值变化，所有消费该 Context 的组件都会重新渲染**，哪怕它只用到了值里的一小部分。这一章讲清楚嵌套怎么组织、性能怎么救、什么时候该用 Context 分片。

## 1. Context 嵌套：单 Provider 还是多 Provider

实际项目里 Context 不会只有一个。用户信息、主题、国际化、通知——动辄四五个。怎么组织？

\`\`\`tsx
// 单个 Context 文件：user-context.tsx
type User = { id: string; name: string; role: "admin" | "user" };
type UserContextValue = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextValue | null>(null);

// 自定义 hook：消费时自动判空，省得每个调用方都写 useContext + null check
function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (ctx === null) {
    throw new Error("useUser 必须在 UserProvider 内部使用");
  }
  return ctx;
}

function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const value = useMemo(
    () => ({
      user,
      login: (u: User) => setUser(u),
      logout: () => setUser(null),
    }),
    [user]
  );
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export { UserProvider, useUser };
\`\`\`

每个领域一个 Provider 文件，根组件里嵌套即可：

\`\`\`tsx
// App.tsx：多个 Provider 嵌套
function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <I18nProvider>
          <NotificationProvider>
            <Router />
          </NotificationProvider>
        </I18nProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
\`\`\`

嵌套层数多了看着难受，可以写个工具函数组合：

\`\`\`tsx
// 组合多个 Provider 的工具：减少嵌套
function composeProviders(...providers: React.FC<{ children: React.ReactNode }>[]) {
  return ({ children }: { children: React.ReactNode }) =>
    providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      <>{children}</>
    );
}

// 用法：
const AppProviders = composeProviders(ThemeProvider, UserProvider, I18nProvider);
// <AppProviders><App /></AppProviders>
\`\`\`

## 2. useContext 触发所有消费者渲染：根因

Context 的更新机制是**整体替换**：Provider 的 value 引用变了，所有 \`useContext\` 拿这个 Context 的组件全部重渲染，**React 不会比对 value 内部字段**。

\`\`\`tsx
// ❌ 经典翻车场景
function BadProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // 每次渲染都产生新对象引用，所有消费者都会重渲染
  const value = { user, setUser, theme, setTheme };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// 任何子组件即使只用 user，theme 一变也会跟着重渲染
\`\`\`

修复有两层：

1. **用 \`useMemo\` 包 value**，让引用稳定。
2. **拆分 Context**，让无关字段各自独立。

## 3. memo + state 抽离模式

当 Context 值变化频率高（比如 mousemove 实时位置），即便 \`useMemo\` 也救不了——值真的每次都不一样。这时应该把"高频变化的值"和"低频变化的 setter"分开。

\`\`\`tsx
// 把 state 和 dispatch 拆成两个 Context
// state 频繁变，dispatch 几乎不变
type ThemeState = "light" | "dark";

// 拆 Context：state 一个，setter 一个
const ThemeStateContext = createContext<ThemeState>("light");
const ThemeSetterContext = createContext<((t: ThemeState) => void) | null>(null);

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeState>("light");

  // setter 引用稳定：用 useCallback 锁住，theme 变化不会让 setter 变
  const setThemeStable = useCallback((t: ThemeState) => setTheme(t), []);

  return (
    <ThemeStateContext.Provider value={theme}>
      <ThemeSetterContext.Provider value={setThemeStable}>
        {children}
      </ThemeSetterContext.Provider>
    </ThemeStateContext.Provider>
  );
}

// 自定义 hook：只想读 theme
function useThemeState() {
  return useContext(ThemeStateContext);
}

// 自定义 hook：只想改 theme（不订阅变化）
function useThemeSetter() {
  const setter = useContext(ThemeSetterContext);
  if (setter === null) throw new Error("useThemeSetter 必须在 ThemeProvider 内");
  return setter;
}
\`\`\`

这样：一个只调用 \`useThemeSetter\` 的"切换按钮"组件，**theme 变化时不会重渲染**，因为它没订阅 state。

\`\`\`tsx
// 这个组件只调用 setter，不订阅 theme，所以 theme 变它不重渲染
const ThemeToggle = memo(function ThemeToggle() {
  const setTheme = useThemeSetter();
  console.log("ThemeToggle 渲染"); // 只在初次渲染时打印
  return (
    <button onClick={() => setTheme("dark")}>
      切换到暗色
    </button>
  );
});

// 这个组件订阅 theme，每次 theme 变都重渲染
function ThemedCard() {
  const theme = useThemeState();
  return <div style={{ background: theme === "dark" ? "#333" : "#fff" }}>卡片</div>;
}
\`\`\`

## 4. Context 分片：值太大时按字段拆

如果 Context 里有 10 个字段，组件 A 只用 \`user\`，组件 B 只用 \`theme\`——你不愿意 A 因为 theme 变化而重渲染。可以把 Context 按"语义域"拆开。

\`\`\`tsx
// 拆之前：一个大 Context
type AppState = {
  user: User | null;
  theme: "light" | "dark";
  notifications: Notification[];
  cart: CartItem[];
};

// 拆之后：每个语义域一个 Context
const UserContext = createContext<User | null>(null);
const ThemeContext = createContext<"light" | "dark">("light");
const NotificationContext = createContext<Notification[]>([]);
const CartContext = createContext<CartItem[]>([]);

// 组件只订阅自己关心的那部分
function UserBadge() {
  const user = useContext(UserContext);   // theme 变化不影响这里
  return <span>{user?.name ?? "未登录"}</span>;
}
\`\`\`

## 5. selector 模式：用 useSyncExternalStore 自己实现

如果不想拆 Context，又想"只订阅一部分"，可以用 React 18 的 \`useSyncExternalStore\` 实现一个 selector。社区库如 \`use-context-selector\` 就是这套思路。

\`\`\`ts
// 简化版 selector hook：从 Context 里挑一部分
// 注意：这只是思路示意，完整实现要处理快照一致性
function useContextSelector<T, S>(ctx: Context<T>, selector: (v: T) => S): S {
  const value = useContext(ctx);
  // 用 useMemo 让 selector 结果稳定
  return useMemo(() => selector(value), [value, selector]);
}

// 用法：
// const userName = useContextSelector(UserContext, u => u?.name);
\`\`\`

> 完整的 selector 实现要处理"中间值闪烁"问题，这一章不展开，第 44 章会专门讲 \`useSyncExternalStore\`。

## 小结

- Context 值变化会触发所有消费者重渲染，根因是"整体替换"。
- 三个救性能的招：\`useMemo\` 稳定 value、state/setter 拆分、按语义域拆 Context。
- \`memo\` + 拆分 setter 让"只改不读"的组件免渲染。
- 高频变化 + 多字段场景才需要 selector 模式，简单场景别过度设计。

## 避坑清单

- ❌ Provider value 不用 \`useMemo\` 包（每次渲染都新对象）
- ❌ 一个大 Context 装十几个字段（应该按语义域拆）
- ❌ Context 默认值给 \`{}\` 然后到处 \`as\`（应该给 \`null\` + 自定义 hook 判空）
- ❌ 用 Context 传高频变化的值（如 mousemove）不拆 setter
- ❌ Provider 嵌套层数爆炸（用 composeProviders 工具函数收一下）

下一章我们看自定义 Hook 的设计原则。`
  },

  // ============================================================
  // ch42: 自定义 Hook 设计原则
  // ============================================================
  {
    id: "tsx3-ch42",
    group: "第五部分 Hooks 全解",
    icon: "🧩",
    title: "ch42 自定义 Hook 设计原则",
    content: `# ch42 自定义 Hook 设计原则

## 为什么讲这个

写了几个 React 项目你就会发现：业务逻辑如果不抽成自定义 Hook，组件会越长越长，最后变成 800 行的怪物。但**抽得不好比不抽更糟**——名字乱、参数多、返回值看不懂、还到处是副作用泄漏。这一章把"怎么设计一个好 Hook"的几条原则讲清楚。

## 1. 单一职责：一个 Hook 只做一件事

最常见的新手错误：把"用户列表 + 表单状态 + 分页"塞到一个 \`useUserPage\` 里。结果是这个 Hook 谁都没法复用。

\`\`\`ts
// ❌ 一个 Hook 干三件事
function useUserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [page, setPage] = useState(1);
  // ...fetch、submit、翻页全混在一起
}

// ✅ 拆成三个职责明确的 Hook
function useUserList(page: number) { /* 只管列表 + 分页 */ }
function useUserForm(initial?: User) { /* 只管表单状态 */ }
function usePagination(total: number, pageSize: number) { /* 只管页码 */ }
\`\`\`

判断标准：能不能用一句话说清这个 Hook 干什么。如果说"它管 X 和 Y 和 Z"，就该拆。

## 2. 返回值约定：元组 vs 对象

两种返回值风格：

\`\`\`ts
// 元组：适合"返回值少 + 顺序固定"的场景
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn(v => !v), []);
  return [on, toggle] as const;  // as const 让返回类型是 [boolean, () => void]
}
// 用法：const [isOpen, toggle] = useToggle();

// 对象：适合"返回值多 + 字段有语义"的场景
function useFetch<T>(url: string) {
  return { data, loading, error, refetch };
}
// 用法：const { data, loading } = useFetch("/api");
\`\`\`

选择规则：

| 返回值个数 | 推荐风格 | 原因 |
| --- | --- | --- |
| 1-2 个 | 元组 | 简洁，调用处一行写完 |
| 3 个以上 | 对象 | 调用处可解构想要的字段 |
| 返回值语义弱（state+setter） | 元组 | 跟 useState 保持一致 |
| 返回值语义强（多个独立字段） | 对象 | 字段名比位置更好记 |

**关键陷阱**：元组返回必须加 \`as const\`，否则 TS 会把返回类型推断成联合数组：

\`\`\`ts
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  return [on, setOn];  // ❌ 类型推断为 (boolean | Dispatch<...>)[]
  // 调用方 const [on, toggle] = useToggle() 时，on 是 boolean | Dispatch
}

function useToggleFixed(initial = false) {
  const [on, setOn] = useState(initial);
  return [on, setOn] as const;  // ✅ 类型是 readonly [boolean, Dispatch<...>]
}
\`\`\`

## 3. 命名：useXxx 不是建议是规则

自定义 Hook 必须 \`use\` 开头，原因不是风格而是**ESLint 的 react-hooks/rules-of-hooks 规则会据此判断**：

\`\`\`ts
// ✅ 正确命名
function useDebounce<T>(value: T, delay: number): T { ... }

// ❌ 不以 use 开头，ESLint 不会把它当 Hook 检查
function debounce<T>(value: T, delay: number): T { ... }
// 这种命名下，如果在条件分支里调用它，ESLint 不会报错——埋下 bug
\`\`\`

命名还要"动词 + 名词"或"名 + 状态"：

- \`useDebounce\`：把值去抖动
- \`useFetch\`：发请求
- \`useLocalStorage\`：操作 localStorage
- \`useIsMobile\`：判断是否移动端（返回 boolean 的 Hook 加 is 前缀更清晰）
- \`useUserPermissions\`：拿用户权限

## 4. 参数设计：可选参数 + 默认值

参数多于 2 个时，用对象传参，避免"位置参数地狱"：

\`\`\`ts
// ❌ 位置参数：调用方根本记不住第 4 个是啥
function useFetch(url: string, method: string, headers: object, body: unknown, credentials: boolean) {
  // ...
}
// useFetch("/api", "POST", {}, data, true)  // 谁能看懂？

// ✅ 对象参数：每个参数都有名字
type UseFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  credentials?: RequestCredentials;
};

function useFetch(url: string, options: UseFetchOptions = {}) {
  const { method = "GET", headers = {}, body, credentials = "same-origin" } = options;
  // ...
}
// useFetch("/api", { method: "POST", body: data })  // 一目了然
\`\`\`

## 5. 依赖管理：useCallback / useMemo 别乱用

Hook 内部暴露给调用方的函数，必须用 \`useCallback\` 包，否则调用方一旦把它放进 \`useEffect\` 依赖里就会无限循环：

\`\`\`ts
function useFetch(url: string) {
  const [data, setData] = useState(null);

  // ❌ 没用 useCallback，每次渲染都是新函数引用
  const refetch = () => {
    fetch(url).then(r => r.json()).then(setData);
  };

  // 调用方这样写就会无限触发：
  // useEffect(() => { refetch(); }, [refetch]);

  return { data, refetch };
}

function useFetchFixed(url: string) {
  const [data, setData] = useState(null);

  // ✅ 用 useCallback 锁住引用，url 不变 refetch 就不变
  const refetch = useCallback(() => {
    fetch(url).then(r => r.json()).then(setData);
  }, [url]);

  return { data, refetch };
}
\`\`\`

但 **\`useCallback\` 不是免费的**——它本身要存依赖、比对依赖。如果函数不会传给子组件或被 useEffect 依赖，就不必包。

## 6. 可测性：纯逻辑优先

好的 Hook 应该"可脱离 UI 测试"。React Testing Library 提供 \`renderHook\`：

\`\`\`ts
import { renderHook } from "@testing-library/react";
import { useCounter } from "./useCounter";

test("useCounter 应该能加能减", () => {
  const { result } = renderHook(() => useCounter(0));

  expect(result.current.count).toBe(0);
  act(() => result.current.inc());
  expect(result.current.count).toBe(1);
  act(() => result.current.dec());
  expect(result.current.count).toBe(0);
});
\`\`\`

让 Hook 可测的关键：

1. **副作用集中**：fetch / subscribe 写在一处，便于 mock。
2. **状态可枚举**：用联合类型而非多个 boolean。
3. **不依赖全局变量**：不要在 Hook 里读 \`window.xxx\`，要么传参，要么用 \`useSyncExternalStore\` 包一层。

## 7. 一个反面教材 vs 正面教材

\`\`\`ts
// ❌ 反面：什么都干，参数乱，返回乱
function useStuff(id: string, mode: string, shouldFetch: boolean, retryCount: number) {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ name: "" });
  // 100 行混合逻辑...
  return [data, setData, form, setForm, () => {}, true, false];
  // 7 个返回值，元组顺序谁能记住？
}

// ✅ 正面：拆开 + 对象返回
function useResource<T>(id: string, options?: { retry?: number; enabled?: boolean }) {
  const { retry = 3, enabled = true } = options ?? {};
  // 只管"按 id 拉数据 + 重试"
  return { data: null as T | null, loading: false, error: null as Error | null };
}

function useNameForm(initial = "") {
  const [name, setName] = useState(initial);
  return { name, setName };
}
\`\`\`

## 小结

- 单一职责：一句话说不清就该拆。
- 元组返回加 \`as const\`；3 个以上返回值用对象。
- 必须 \`use\` 开头，ESLint 据此启用 Hook 规则。
- 参数多于 2 个用对象传，避免位置参数地狱。
- 暴露给调用方的函数用 \`useCallback\` 锁住引用。
- 设计要让 Hook 可脱离 UI 单独测试。

## 避坑清单

- ❌ 一个 Hook 返回 7 个值还用元组（应该用对象或拆 Hook）
- ❌ 元组返回不加 \`as const\`（类型推断成联合数组）
- ❌ Hook 不以 \`use\` 开头（ESLint 不检查，埋 Hook 规则 bug）
- ❌ 暴露的函数不 \`useCallback\`（调用方 useEffect 无限循环）
- ❌ 在 Hook 里直接读 \`window\`/\`document\`（难以测试，SSR 报错）
- ❌ 参数 5 个还用位置传（应该改对象传参）

下一章我们看 6 个实战自定义 Hook 的完整实现。`
  },

  // ============================================================
  // ch43: 自定义 Hook 实战合集
  // ============================================================
  {
    id: "tsx3-ch43",
    group: "第五部分 Hooks 全解",
    icon: "🛠️",
    title: "ch43 自定义 Hook 实战合集",
    content: `# ch43 自定义 Hook 实战合集

## 为什么讲这个

理论懂了，没写过几个 Hook 还是不会用。这一章给你 6 个高频实战 Hook，每个都是项目里能直接拷贝走用的——读完不仅能抄，还能照着套路写出第十个、第二十个。

## 1. useDebounce：值去抖

搜索框输入时，用户每敲一个字符就发请求会爆 API。\`useDebounce\` 让值"停顿指定时间后才更新"。

\`\`\`ts
import { useState, useEffect } from "react";

// 泛型 T 让这个 Hook 能去抖任意类型的值
function useDebounce<T>(value: T, delay: number): T {
  // 内部维护一个"延迟后的值"
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // 每次 value 变化，开一个定时器
    // delay 毫秒后才真正 setDebounced
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);

    // 清理函数：value 在 delay 内再次变化时，旧定时器被取消
    // 这就是"去抖"的核心——只有最后一次变化才会真正生效
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
\`\`\`

配套组件 demo：

\`\`\`tsx
function SearchBox() {
  const [keyword, setKeyword] = useState("");
  // 去抖 500ms：用户停止输入 0.5 秒后才发请求
  const debouncedKeyword = useDebounce(keyword, 500);

  useEffect(() => {
    if (debouncedKeyword) {
      // 这里发请求，不会因为快速输入而多次触发
      console.log("搜索：", debouncedKeyword);
    }
  }, [debouncedKeyword]);

  return (
    <input
      value={keyword}
      onChange={e => setKeyword(e.target.value)}
      placeholder="输入关键词搜索"
    />
  );
}
\`\`\`

## 2. useLocalStorage：localStorage 持久化

把状态同步到 localStorage，刷新页面不丢。

\`\`\`ts
import { useState, useEffect, useCallback } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
  // 惰性初始化：第一次读 localStorage，没有就用 initialValue
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      // localStorage 不可用（隐私模式）或 JSON 解析失败，降级用 initialValue
      return initialValue;
    }
  });

  // setValue 同时写 state 和 localStorage
  const setStoredValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue(prev => {
        // 支持函数式更新，跟原生 useState 行为一致
        const resolved = next instanceof Function ? next(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // 写失败（满了/隐私模式）静默忽略，state 仍然更新
        }
        return resolved;
      });
    },
    [key]
  );

  // 跨标签页同步：其他 tab 改了 localStorage，这里跟着变
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue) as T);
        } catch {
          // 忽略解析失败
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key]);

  return [value, setStoredValue] as const;
}
\`\`\`

组件 demo：

\`\`\`tsx
function ThemeSwitcher() {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("app-theme", "light");
  return (
    <button onClick={() => setTheme(t => (t === "light" ? "dark" : "light"))}>
      当前：{theme}（点击切换，刷新页面保留）
    </button>
  );
}
\`\`\`

## 3. useFetch：通用请求 Hook

\`\`\`ts
import { useState, useEffect, useCallback, useRef } from "react";

type UseFetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

function useFetch<T>(url: string, options?: RequestInit): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 用 ref 控制"组件卸载后不再 setState"，避免内存泄漏警告
  const mountedRef = useRef(true);
  // 用 ref 保存最新 url，refetch 时能拿到
  const urlRef = useRef(url);
  urlRef.current = url;

  const doFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(urlRef.current, options);
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      const json = (await res.json()) as T;
      // 卸载后不 setState
      if (mountedRef.current) setData(json);
    } catch (e) {
      if (mountedRef.current) setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    mountedRef.current = true;
    doFetch();
    return () => {
      // 标记已卸载，异步回调里据此跳过 setState
      mountedRef.current = false;
    };
  }, [doFetch]);

  return { data, loading, error, refetch: doFetch };
}
\`\`\`

组件 demo：

\`\`\`tsx
function UserProfile({ userId }: { userId: string }) {
  const { data: user, loading, error, refetch } = useFetch<User>(
    \`/api/users/\${userId}\`
  );

  if (loading) return <p>加载中...</p>;
  if (error) return <p>出错了：{error.message}</p>;
  if (!user) return <p>无数据</p>;

  return (
    <div>
      <p>{user.name}</p>
      <button onClick={refetch}>刷新</button>
    </div>
  );
}
\`\`\`

## 4. useMediaQuery：响应式断点

\`\`\`ts
import { useState, useEffect } from "react";

function useMediaQuery(query: string): boolean {
  // 初始值用 matchMedia 立刻拿到，避免首帧闪烁
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false; // SSR 保护
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    // 立即同步一次，处理"挂载时已经匹配"的场景
    setMatches(mql.matches);
    // addListener 已废弃，现代浏览器用 addEventListener
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
\`\`\`

组件 demo：

\`\`\`tsx
function ResponsiveLayout() {
  // 断点判断：屏幕宽 ≥ 768px 视为桌面
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div style={{ display: "flex", flexDirection: isDesktop ? "row" : "column" }}>
      <Sidebar />
      <Main />
    </div>
  );
}

// 也可以再封装一层，让调用方更直观
function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}
\`\`\`

## 5. usePrevious：拿上一次的值

React 没有 \`usePrevious\` 内置 Hook，但实现极简，业务里很常用——比如"价格变了才弹通知"。

\`\`\`ts
import { useRef, useEffect } from "react";

function usePrevious<T>(value: T): T | undefined {
  // ref 在渲染期间是"上一次 commit 的值"
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    // 在 commit 后更新 ref，下次渲染时拿到的就是"上一次的值"
    ref.current = value;
  }, [value]);

  return ref.current;
}
\`\`\`

组件 demo：

\`\`\`tsx
function PriceAlert({ price }: { price: number }) {
  const prevPrice = usePrevious(price);

  useEffect(() => {
    // 只有价格真的变化时才弹通知
    if (prevPrice !== undefined && price !== prevPrice) {
      const direction = price > prevPrice ? "上涨" : "下跌";
      console.log(\`价格\${direction}：\${prevPrice} → \${price}\`);
    }
  }, [price, prevPrice]);

  return <p>当前价格：¥{price}</p>;
}
\`\`\`

注意：\`usePrevious\` 的初始返回是 \`undefined\`（第一次渲染没有"上一次"），调用方要判空。

## 6. useOnClickOutside：点外部关闭

弹窗、下拉框的经典需求——点到外面就关。

\`\`\`ts
import { useEffect, RefObject } from "react";

function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (e: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      // ref.current 是当前 DOM 节点
      // 没挂载 || 点击落在元素内部 → 什么都不做
      const el = ref.current;
      if (el === null || el.contains(e.target as Node)) return;
      handler(e);
    };

    // mousedown 比 click 更早触发，体验更好
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
\`\`\`

组件 demo：

\`\`\`tsx
function Dropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 点外部就关
  useOnClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)}>菜单</button>
      {open && (
        <ul style={{ position: "absolute", top: "100%", background: "#fff" }}>
          <li>选项一</li>
          <li>选项二</li>
        </ul>
      )}
    </div>
  );
}
\`\`\`

## 小结

- \`useDebounce\`：定时器 + 清理函数，去抖核心模式。
- \`useLocalStorage\`：try/catch + storage 事件，跨标签同步。
- \`useFetch\`：mountedRef 防卸载后 setState，refetch 用 useCallback 锁引用。
- \`useMediaQuery\`：matchMedia + addEventListener，记得 SSR 保护。
- \`usePrevious\`：useRef + useEffect 在 commit 后更新。
- \`useOnClickOutside\`：mousedown 早于 click，记得判 contains。

## 避坑清单

- ❌ \`useDebounce\` 不写 cleanup（旧定时器残留导致值闪烁）
- ❌ \`useFetch\` 不判 mounted（卸载后 setState 警告）
- ❌ \`useMediaQuery\` 用 \`addListener\`（已废弃，用 \`addEventListener\`）
- ❌ \`usePrevious\` 不判 \`undefined\`（首次渲染拿到 undefined 直接用会爆）
- ❌ \`useOnClickOutside\` 用 \`click\`（用 \`mousedown\` 体验更好且更早）
- ❌ \`useLocalStorage\` 不 try/catch（隐私模式下 localStorage 会抛错）

下一章我们看 React 18 的并发 API 和外部 store 订阅。`
  },

  // ============================================================
  // ch44: useId/useSyncExternalStore/useTransition/useDeferredValue
  // ============================================================
  {
    id: "tsx3-ch44",
    group: "第五部分 Hooks 全解",
    icon: "⚡",
    title: "ch44 useId/useSyncExternalStore/useTransition/useDeferredValue",
    content: `# ch44 useId/useSyncExternalStore/useTransition/useDeferredValue

## 为什么讲这个

React 18 一次性放出了 4 个新 Hook：\`useId\` 解决 SSR id 一致性，\`useSyncExternalStore\` 解决外部 store 订阅的"撕裂"问题，\`useTransition\` 和 \`useDeferredValue\` 解决"高优先级更新打断低优先级更新"的并发渲染问题。这一章把它们一次讲透，每个都配可运行的 demo。

## 1. useId：服务端与客户端一致的 id

服务端渲染（SSR）时，HTML 在服务器生成，hydration 时浏览器接管。如果用 \`Math.random()\` 或 \`useRef(Date.now())\` 生成 id，服务端和客户端会生成不同的值——hydration 报错。

\`\`\`tsx
import { useId } from "react";

function FormField({ label }: { label: string }) {
  // useId 返回一个稳定的唯一 id，SSR 和客户端一致
  // 注意：这个 id 不是数字，而是形如 ":r0:" 的字符串
  const id = useId();

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {/* 用生成的 id 关联 input，无障碍读屏能正确朗读 */}
      <input id={id} type="text" />
    </div>
  );
}

function App() {
  // 同一个组件多次使用，每个 useId 调用得到不同 id
  return (
    <>
      <FormField label="姓名" />
      <FormField label="邮箱" />
    </>
  );
}
\`\`\`

注意事项：

- \`useId\` 生成的 id **不要用作列表 key**（key 应该来自数据本身）。
- \`useId\` 的 id 含 \`:\` 字符，CSS 选择器要转义，别直接拿去 querySelector。
- 多个 \`useId\` 调用按调用顺序生成，**不能在条件分支或循环里调用**。

## 2. useSyncExternalStore：订阅外部 store

当你的数据源在 React 之外（Redux 老版本、Zustand 内部、window 尺寸、浏览器 API），用 \`useState\` + \`useEffect\` 订阅会有"撕裂"问题——并发渲染时不同组件读到不同版本的状态。\`useSyncExternalStore\` 是 React 18 官方答案。

\`\`\`ts
import { useSyncExternalStore } from "react";

// 一个最简的外部 store：监听 window 尺寸
type SizeState = { width: number; height: number };

// 1. subscribe：注册监听器，返回取消监听的函数
function subscribe(callback: () => void): () => void {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

// 2. getSnapshot：返回当前快照（必须是稳定引用，否则死循环）
function getSnapshot(): SizeState {
  return { width: window.innerWidth, height: window.innerHeight };
}

// 3. getServerSnapshot：SSR 时用（因为服务端没 window）
function getServerSnapshot(): SizeState {
  return { width: 0, height: 0 };
}

function useWindowSize(): SizeState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
\`\`\`

组件 demo：

\`\`\`tsx
function WindowSizeDisplay() {
  const { width, height } = useWindowSize();
  return (
    <p>
      当前窗口：{width} × {height}
    </p>
  );
}
\`\`\`

**最关键的坑**：\`getSnapshot\` 必须返回**稳定引用**。下面是反面教材：

\`\`\`ts
// ❌ 每次 getSnapshot 返回新对象，引用每次都不同
// React 会认为状态一直在变，无限重渲染
function getSnapshotBad() {
  return { width: window.innerWidth, height: window.innerHeight };
}
// 每次 {} 字面量都是新对象，引用不同 → 死循环
\`\`\`

修复：用缓存机制保证引用稳定：

\`\`\`ts
// ✅ 缓存快照：只在尺寸真变时才返回新对象
let cached: SizeState | null = null;

function getSnapshotGood(): SizeState {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (cached === null || cached.width !== w || cached.height !== h) {
    cached = { width: w, height: h };
  }
  return cached;
}
\`\`\`

## 3. useTransition：标记非紧急更新

React 18 默认所有更新都是"紧急"的。但有些更新可以慢一拍——比如搜索框里输入字符是紧急的，搜索结果列表的过滤可以延后。 \`useTransition\` 让你显式标记"非紧急更新"。

\`\`\`tsx
import { useState, useTransition, MemoExoticComponent } from "react";

function SearchPage() {
  const [keyword, setKeyword] = useState("");        // 紧急：输入框立即响应
  const [filter, setFilter] = useState("");          // 非紧急：列表过滤可延后
  // isPending 表示"非紧急更新还在进行中"
  const [isPending, startTransition] = useTransition();

  const items = Array.from({ length: 10000 }, (_, i) => \`item-\${i}\`);
  const filtered = items.filter(i => i.includes(filter));

  return (
    <div>
      <input
        value={keyword}
        onChange={e => {
          // 紧急：输入框立即更新，用户感知不到延迟
          setKeyword(e.target.value);
          // 非紧急：过滤 10000 项可以放到 transition 里
          startTransition(() => {
            setFilter(e.target.value);
          });
        }}
      />
      {/* isPending 时显示一个微弱的加载提示 */}
      {isPending && <span style={{ opacity: 0.5 }}>过滤中...</span>}
      <ul>
        {filtered.slice(0, 100).map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

效果：用户在搜索框里狂敲字符，输入框始终流畅，列表"慢慢追上来"——不会卡住。

## 4. useDeferredValue：延迟一个值

\`useTransition\` 是"我自己包一段 setState"，\`useDeferredValue\` 是反过来——你拿到的就是一个"延后的值"。

\`\`\`tsx
import { useState, useDeferredValue, useMemo } from "react";

function FilterList({ items }: { items: string[] }) {
  const [keyword, setKeyword] = useState("");
  // deferredKeyword 落后于 keyword，等浏览器空闲时才追上
  const deferredKeyword = useDeferredValue(keyword);

  // 用 useMemo 让"过滤"这个重活只在 deferredKeyword 变化时重算
  const filtered = useMemo(() => {
    return items.filter(i => i.includes(deferredKeyword));
  }, [items, deferredKeyword]);

  // isStale 判断：当前值和延后值不一致 → 还在追赶
  const isStale = keyword !== deferredKeyword;

  return (
    <div>
      <input
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
      />
      <ul style={{ opacity: isStale ? 0.5 : 1 }}>
        {filtered.slice(0, 50).map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

\`useTransition\` vs \`useDeferredValue\` 怎么选：

| 场景 | 选哪个 | 原因 |
| --- | --- | --- |
| 你能控制 setState 调用 | \`useTransition\` | 直接包住 setState 更精确 |
| 状态来自 props 或第三方 | \`useDeferredValue\` | 拿不到 setState 只能延后值 |
| 想显示 isPending | \`useTransition\` | 它直接返回 isPending |
| 想显示"是否还在追赶" | \`useDeferredValue\` | 对比新旧值即可 |

## 5. 综合示例：可中断的搜索

把 \`useTransition\` + \`useDeferredValue\` + 虚拟列表思路揉一起，看完整效果：

\`\`\`tsx
function HeavySearch({ data }: { data: string[] }) {
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const deferredInput = useDeferredValue(input);

  // 用 deferredInput 做重计算，输入流畅
  const result = useMemo(() => {
    return data.filter(s => s.includes(deferredInput));
  }, [data, deferredInput]);

  return (
    <div>
      <input
        value={input}
        onChange={e => {
          setInput(e.target.value);
          // 同时用 transition 标记一次 setState，双重保险
          startTransition(() => {
            // 这里可以做一些非紧急的副状态更新
          });
        }}
      />
      {isPending ? <span>更新中...</span> : null}
      <ul style={{ opacity: isPending ? 0.6 : 1 }}>
        {result.slice(0, 50).map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

## 小结

- \`useId\`：SSR 一致的唯一 id，不要拿去做 key 或 CSS 选择器。
- \`useSyncExternalStore\`：订阅外部 store 必备，\`getSnapshot\` 必须返回稳定引用。
- \`useTransition\`：包住 setState 标记非紧急，返回 isPending 可显示加载态。
- \`useDeferredValue\`：拿一个延后的值，适合"状态来自外部"场景。

## 避坑清单

- ❌ \`useId\` 的 id 拿去做 key 或 CSS 选择器（含 \`:\` 会爆）
- ❌ \`useSyncExternalStore\` 的 \`getSnapshot\` 返回新对象（死循环）
- ❌ \`useSyncExternalStore\` 漏了 \`getServerSnapshot\`（SSR 报错）
- ❌ \`useTransition\` 里包 \`fetch\`（transition 是给 setState 用的，不是给副作用的）
- ❌ 滥用 \`useDeferredValue\` 简单场景（小列表根本不需要，反而引入复杂度）
- ❌ 在 \`startTransition\` 里写 \`await\`（transition 内同步 setState 才生效）

至此，第五部分"Hooks 全解"全部讲完。下一部分我们看性能优化的完整套路。`
  },
];

export { chapters };
