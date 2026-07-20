// =============================================================
// TypeScript + React 全栈精通 - Batch 9: 状态管理与路由
// -------------------------------------------------------------
// 章节范围（共 6 章）：
//   54. tspro-context-state  Context API 状态管理
//   55. tspro-zustand        Zustand 轻量状态管理
//   56. tspro-react-router   React Router v6/v7 完整指南
//   57. tspro-fetch          fetch / axios 数据请求
//   58. tspro-react-query    React Query / SWR 数据获取库
//   59. tspro-suspense-data  Suspense 数据获取（实验性）
//
// 代码运行环境：ts.transpileModule + jsx: ReactJSX + target ES2020
// 沙箱注入 react / react/jsx-runtime 的 mock，可写 JSX 语法
// =============================================================

export const chapters = [
  // =========================================================
  // 第五十四章：Context API 状态管理
  // =========================================================
  {
    id: "tspro-context-state",
    group: "九、状态管理与路由",
    icon: "🌐",
    title: "Context API 状态管理",
    content: `# 第五十四章：Context API 状态管理

## 54.1 为什么需要 Context

React 是单向数据流：props 只能从父传子。当组件层级深时，传一个 user 得从顶层一层层透传：

\`\`\`tsx
function App({ user }) {
  return <Header user={user} />;   // 透传
}

function Header({ user }) {
  return <UserInfo user={user} />; // 透传
}

function UserInfo({ user }) {
  return <span>{user.name}</span>; // 终于用上了
}
\`\`\`

中间层 \`Header\` 根本不关心 user，只是"搬运工"。层级到 5 层、10 层就是经典的 **prop drilling 地狱**：中间组件被迫加 props、改 props 类型，删除字段还得同步改一圈。

Context 用来跳过中间层，把数据直接塞给真正需要它的组件。

## 54.2 Context 是什么

\`Context\` 是 React 提供的**跨层级数据传递**机制。像"全局变量"，但能触发重渲染。

三个核心 API：

- \`createContext(defaultValue)\`：创建 Context 对象
- \`<Context.Provider value={...}>\`：在树的上层提供数据
- \`useContext(Context)\`：在任意子组件读取数据

\`\`\`tsx
const UserContext = createContext<User | null>(null);

function App() {
  return (
    <UserContext.Provider value={{ name: 'Tom' }}>
      <UserInfo />  {/* 不用透传 props */}
    </UserContext.Provider>
  );
}

function UserInfo() {
  const user = useContext(UserContext);
  return <span>{user?.name}</span>;
}
\`\`\`

defaultValue 只在 Provider **完全缺失**时使用，只要套了 Provider 就永远拿到 Provider 的 value。

## 54.3 useContext + useState 组合做全局状态

光有 Context 只是"只读"，要能修改还得配合 useState。典型模式：Provider 内用 useState，把 value + setter 一起塞进 Context。

\`\`\`tsx
interface ThemeState {
  theme: 'light' | 'dark';
  toggle: () => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const value: ThemeState = {
    theme,
    toggle: () => setTheme(t => (t === 'light' ? 'dark' : 'light')),
  };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
\`\`\`

封装 \`useTheme\` 自定义 hook 是工程化标配：拿到非 null 类型 + 缺 Provider 时报错。

## 54.4 Context 嵌套

实际项目经常多个 Context 一起用，套娃式：

\`\`\`tsx
<ThemeProvider>
  <UserProvider>
    <I18nProvider>
      <App />
    </I18nProvider>
  </UserProvider>
</ThemeProvider>
\`\`\`

层数多了可读性差，可以写一个 composeProviders 工具：

\`\`\`tsx
function composeProviders(...providers) {
  return ({ children }) =>
    providers.reduceRight((acc, [Provider, props]) => (
      <Provider {...props}>{acc}</Provider>
    ), children);
}

const AppProviders = composeProviders(
  [ThemeProvider],
  [UserProvider],
  [I18nProvider]
);
\`\`\`

## 54.5 性能问题：任何 consumer 都会重渲染

这是 Context **最容易被忽视的坑**：Context value 变了，**所有 useContext 的组件**都会重渲染，不管它们用的是 value 的哪一部分。

\`\`\`tsx
const ctx = { user: { name: 'Tom', age: 20 }, setUser: () => {} };

// 即使只关心 user.name，user 变了也会重渲染
function UserName() {
  const { user } = useContext(UserContext);
  return <span>{user.name}</span>;
}
\`\`\`

跟 Zustand 的"选择器订阅"相比，这是 Context 的先天劣势——没法只订阅 \`user.name\` 而不订阅 \`user.age\`。

## 54.6 useMemo 稳定 value

Provider 每次渲染都会新建一个 \`value\` 对象，引用变了，所有 consumer 重渲染——即使内容没变。

\`\`\`tsx
// ❌ 每次渲染 value 引用都变
<ThemeContext.Provider value={{ theme, toggle }}>

// ✅ 用 useMemo 稳定引用
const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);
<ThemeContext.Provider value={value}>
\`\`\`

toggle 是 useState 派生的函数，需要 useCallback 包一下才能稳定。

## 54.7 分割 Context 优化

如果一个 Context 里既有"频繁变化的值"（如表单输入），又有"很少变的值"（如主题），可以**拆成两个 Context**：

\`\`\`tsx
// 拆分前：任何一个变了都触发全部重渲染
const AppContext = createContext({ theme, user, cart, ... });

// 拆分后：theme 变只重渲染订阅 theme 的
const ThemeContext = createContext({ theme, toggleTheme });
const UserContext = createContext({ user, setUser });
const CartContext = createContext({ cart, addToCart });
\`\`\`

更彻底的方案：把"状态部分"和"动作部分"拆开，因为动作函数引用稳定，不会触发重渲染。

\`\`\`tsx
const ThemeStateContext = createContext({ theme: 'light' as Theme });
const ThemeActionContext = createContext({ toggle: () => {} });
\`\`\`

需要状态的组件订阅 \`ThemeStateContext\`，只需要触发动作的按钮订阅 \`ThemeActionContext\`——状态变化不会触发按钮重渲染。

## 54.8 何时该换 Zustand/Redux

Context 适合的场景：

- 低频更新：主题、用户登录态、i18n 语言
- 全局只读配置
- 中小型应用

**该换 Zustand/Redux 的信号**：

- 高频更新（实时数据、动画状态）：Context 让大量组件重渲染
- 状态需要细粒度订阅：只关心 user.name 不想因 user.age 变化重渲染
- 状态间复杂依赖、需要中间件（日志、持久化、devtools）
- 多 store 协同、需要时间旅行调试

经验：**Context 撑不住时再上 Zustand**。Zustand 学习成本极低，不必一开始就上。

## 54.9 Context 常见陷阱

1. **default value 陷阱**：\`createContext(null)\` 的 null 只在 Provider 缺失时使用
2. **没 Provider 报错**：自定义 hook 加 \`if (!ctx) throw new Error\` 比静默拿 null 强
3. **render 阶段修改 Context**：跟修改 state 一样禁止
4. **Provider 嵌套覆盖**：内层 Provider 的 value 覆盖外层
5. **多实例隔离**：不同 Provider 实例状态隔离，适合 Modal/Portal 局部状态

## 54.10 小结

- Context 解决 prop drilling，跳过中间层传数据
- createContext + Provider + useContext 三件套
- 配合 useState 做可变全局状态，封装自定义 hook
- 性能坑：value 变了所有 consumer 都重渲染
- 优化：useMemo 稳定 value、拆分 Context（状态/动作分离）
- 高频更新或细粒度订阅场景换 Zustand/Redux
`,
    code: `// =============================================================
// 第 54 章 demo：Context API 状态管理
// 模拟 createContext / Provider / useContext + ThemeContext + UserContext 组合
// =============================================================

// ---- 模拟 React Context 机制 ----
let providerStack = [];  // 模拟 Provider 嵌套栈

function createContext(defaultValue) {
  // 创建 Context 对象：唯一 id + 默认值
  return { _id: Symbol('context'), defaultValue };
}

function Provider(context, value, children) {
  // Provider 节点：保存 context 引用 + value + 子树
  return { type: 'Provider', context, value, children };
}

function useContext(context) {
  // 从 Provider 栈顶往下找最近的同名 Provider
  for (let i = providerStack.length - 1; i >= 0; i--) {
    if (providerStack[i].context === context) {
      return providerStack[i].value;
    }
  }
  // 没找到返回默认值
  return context.defaultValue;
}

function render(tree, stack) {
  if (!tree) return;
  // Provider 节点：压栈后渲染子树
  if (tree.type === 'Provider') {
    const newStack = [...stack, tree];
    render(tree.children, newStack);
    return;
  }
  // 函数组件：调用取 vnode
  if (typeof tree.type === 'function') {
    render(tree.type(tree.props || {}), stack);
    return;
  }
  // 文本节点直接打印
  if (typeof tree === 'string') console.log('  render:', tree);
}

function h(type, props) {
  return { type, props: props || {} };
}

// ---- 1. 创建两个 Context ----
console.log('=== 1. 创建 ThemeContext + UserContext ===');

const ThemeContext = createContext({ theme: 'light', toggle: () => {} });
const UserContext = createContext({ user: { name: '', age: 0 } });

console.log('  ThemeContext 默认值:', ThemeContext.defaultValue.theme);
console.log('  UserContext 默认值:', UserContext.defaultValue.user.name);

// ---- 2. ThemeProvider + UserProvider 组合 ----
console.log('\\n=== 2. ThemeProvider + UserProvider 嵌套 ===');

function ThemeProvider(children) {
  // 模拟 useState：本次固定值，实际项目会因状态变化重渲染
  const value = {
    theme: 'dark',
    toggle: () => console.log('    切换主题'),
  };
  return Provider(ThemeContext, value, children);
}

function UserProvider(children) {
  const value = {
    user: { name: 'Tom', age: 20 },
    login: (name) => console.log('    登录:', name),
    logout: () => console.log('    退出'),
  };
  return Provider(UserContext, value, children);
}

// ---- 3. 消费组件 ----
console.log('\\n=== 3. 消费组件读 Context ===');

function ThemeDisplay() {
  const { theme } = useContext(ThemeContext);  // 只关心 theme
  return '当前主题: ' + theme;
}

function UserGreeting() {
  const { user } = useContext(UserContext);  // 只关心 user
  return '你好，' + user.name + '（' + user.age + '岁）';
}

// 嵌套 Provider：Theme 外层、User 内层
const tree = ThemeProvider(UserProvider(h(UserGreeting)));
render(tree, []);

// 单独渲染 ThemeDisplay
render(ThemeProvider(h(ThemeDisplay)), []);

// ---- 4. 同一组件读多个 Context ----
console.log('\\n=== 4. Dashboard 读多个 Context ===');

function Dashboard() {
  const themeCtx = useContext(ThemeContext);
  const userCtx = useContext(UserContext);
  return '仪表盘：' + userCtx.user.name + ' | 主题: ' + themeCtx.theme;
}

render(ThemeProvider(UserProvider(h(Dashboard))), []);

// ---- 5. useMemo 稳定 value 引用 ----
console.log('\\n=== 5. useMemo 稳定 value 引用 ===');

function useMemoStable(factory, deps) {
  // 简化：deps 变时才重建
  if (!useMemoStable._deps || deps.join(',') !== useMemoStable._deps.join(',')) {
    useMemoStable._deps = deps;
    useMemoStable._value = factory();
  }
  return useMemoStable._value;
}

let renderCount = 0;
let lastValueRef = null;

function StableProvider(theme) {
  // ✅ 用 useMemo 稳定 value 引用
  const value = useMemoStable(() => ({ theme, toggle: () => {} }), [theme]);
  renderCount++;
  const stable = value === lastValueRef;
  console.log('  StableProvider 渲染 ' + renderCount + ' 次, 引用稳定:', stable);
  lastValueRef = value;
}

StableProvider('light');
StableProvider('light');  // theme 没变，value 引用稳定
StableProvider('dark');   // theme 变了，value 重建

// ---- 6. 缺 Provider 拿默认值 ----
console.log('\\n=== 6. 缺 Provider 拿默认值 ===');

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme 必须在 ThemeProvider 内使用');
  return ctx;
}

// 不套 Provider，直接读：拿到的是 defaultValue
const ctx = useContext(ThemeContext);
console.log('  无 Provider 拿到默认值:', ctx.theme);

// ---- 7. 拆分 Context 优化 ----
console.log('\\n=== 7. 拆分 Context 优化重渲染 ===');

const ThemeStateContext = createContext({ theme: 'light' });
const ThemeActionContext = createContext({ toggle: () => {} });

console.log('  拆分前：theme 变 → 所有 consumer 重渲染');
console.log('  拆分后：theme 变 → 只 ThemeStateContext consumer 重渲染');
console.log('         toggle 引用稳定 → ThemeActionContext consumer 不重渲染');

// ---- 8. 多实例隔离 ----
console.log('\\n=== 8. 多 Provider 实例状态隔离 ===');

function makeProvider(value) {
  return (children) => Provider(ThemeContext, { theme: value, toggle: () => {} }, children);
}

const ProviderA = makeProvider('light');
const ProviderB = makeProvider('dark');

// 不同 Provider 实例的 consumer 拿到不同的值
render(ProviderA(h(ThemeDisplay)), []);
render(ProviderB(h(ThemeDisplay)), []);

// ---- 关键要点总结 ----
console.log('\\n=== Context API 核心要点 ===');
console.log('1. createContext + Provider + useContext 三件套');
console.log('2. 配合 useState 做可变全局状态，封装 useXxx hook');
console.log('3. value 变了所有 consumer 都重渲染（最大坑）');
console.log('4. useMemo 稳定 value 引用，避免无关重渲染');
console.log('5. 拆分 Context：状态/动作分离、不同频率状态分离');
console.log('6. 高频更新或细粒度订阅场景换 Zustand/Redux');
`,
  },

  // =========================================================
  // 第五十五章：Zustand 轻量状态管理
  // =========================================================
  {
    id: "tspro-zustand",
    group: "九、状态管理与路由",
    icon: "🐻",
    title: "Zustand 轻量状态管理",
    content: `# 第五十五章：Zustand 轻量状态管理

## 55.1 为什么需要 Zustand

上一章讲了 Context 的性能坑：value 一变所有 consumer 都重渲染。Zustand 就是为解决这个问题而生。

对比 Context：

- **Context**：所有 consumer 全量重渲染，没法只订阅一部分
- **Zustand**：选择器订阅，只有用到的字段变了才重渲染

\`\`\`tsx
// Context：count 变了所有 consumer 重渲染
const { count, name } = useContext(StoreContext);

// Zustand：只订阅 count，name 变了不会触发
const count = useStore(s => s.count);
const name = useStore(s => s.name);
\`\`\`

而且 Zustand：

- API 极简（核心就一个 \`create\`）
- 不需要 Provider 包裹
- 包体积小（~1KB）
- TS 支持一流

## 55.2 Zustand 是什么

Zustand（德语"状态"）是 React 生态最流行的轻量状态库。核心思想：**store 是一个普通对象 + 订阅机制**，组件通过 hook 订阅 store 的某一部分。

\`\`\`tsx
import { create } from 'zustand';

interface BearStore {
  bears: number;
  increase: () => void;
  reset: () => void;
}

const useBearStore = create<BearStore>((set) => ({
  bears: 0,
  increase: () => set(state => ({ bears: state.bears + 1 })),
  reset: () => set({ bears: 0 }),
}));

function Counter() {
  const bears = useBearStore(s => s.bears);
  const increase = useBearStore(s => s.increase);
  return <button onClick={increase}>{bears}</button>;
}
\`\`\`

没有 Provider、没有 reducer、没有 action type，比 Redux 简洁得多。

## 55.3 create store API

\`create\` 接收一个初始化函数，参数是 \`set\` 和 \`get\`：

\`\`\`tsx
const useStore = create<Store>((set, get) => ({
  // 状态
  count: 0,
  user: null,
  // 同步更新
  increment: () => set(s => ({ count: s.count + 1 })),
  // 替换整个 state（少用）
  reset: () => set({ count: 0 }),
  // 读当前 state
  fetchUser: async (id) => {
    const user = await api.getUser(id);
    set({ user });
  },
  // get() 读取最新状态
  double: () => set({ count: get().count * 2 }),
}));
\`\`\`

\`set\` 是浅合并（类似 class 组件的 setState），不用手动展开其他字段。

## 55.4 subscribe 选择器

组件订阅 store 时**必须传选择器**，否则任何状态变化都会重渲染：

\`\`\`tsx
// ❌ 不传选择器：任何字段变都重渲染
const store = useBearStore();

// ✅ 只订阅需要的字段
const bears = useBearStore(s => s.bears);
const increase = useBearStore(s => s.increase);

// ✅ 多字段：用 shallow 比较避免每次新对象触发重渲染
import { shallow } from 'zustand/shallow';
const { bears, increase } = useBearStore(
  s => ({ bears: s.bears, increase: s.increase }),
  shallow
);
\`\`\`

非组件代码也能订阅：

\`\`\`tsx
// 在普通函数/工具里订阅
const unsub = useBearStore.subscribe(state => {
  console.log('bears 变成:', state.bears);
});
// 取消订阅
unsub();
\`\`\`

## 55.5 TS 类型设计

Zustand 的 TS 类型设计很直观：定义 State 接口，传给 \`create<State>\`。

\`\`\`tsx
interface TodoStore {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  // 派生数据用 getter
  visibleTodos: () => Todo[];
  // 动作
  addTodo: (text: string) => void;
  toggle: (id: string) => void;
  setFilter: (f: TodoStore['filter']) => void;
}

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  filter: 'all',
  visibleTodos: () => {
    const { todos, filter } = get();
    if (filter === 'active') return todos.filter(t => !t.done);
    if (filter === 'completed') return todos.filter(t => t.done);
    return todos;
  },
  addTodo: (text) => set(s => ({
    todos: [...s.todos, { id: Date.now().toString(), text, done: false }],
  })),
  toggle: (id) => set(s => ({
    todos: s.todos.map(t => t.id === id ? { ...t, done: !t.done } : t),
  })),
  setFilter: (filter) => set({ filter }),
}));
\`\`\`

注意 \`visibleTodos\` 是函数而不是直接计算，否则每次 set 都会重算。

## 55.6 middleware：persist / devtools

Zustand 通过 middleware 扩展能力，常用两个：

**persist**：自动把 store 持久化到 localStorage：

\`\`\`tsx
import { persist } from 'zustand/middleware';

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'user-storage' }  // localStorage key
  )
);
\`\`\`

**devtools**：接入 Redux DevTools 调试：

\`\`\`tsx
const useStore = create<Store>()(
  devtools(
    (set) => ({ ... }),
    { name: 'MyStore' }
  )
);
\`\`\`

middleware 可以组合：\`persist(devtools(createStore))\`。

## 55.7 组合多个 store

实际项目会有多个 store：user store、cart store、ui store。它们彼此独立：

\`\`\`tsx
const useUserStore = create<UserStore>(...);
const useCartStore = create<CartStore>(...);
const useUIStore = create<UIStore>(...);

function Header() {
  const user = useUserStore(s => s.user);
  const cartCount = useCartStore(s => s.items.length);
  const theme = useUIStore(s => s.theme);
  // ...
}
\`\`\`

也可以在一个组件里组合多个 store 的派生数据：

\`\`\`tsx
const useDerived = () => {
  const user = useUserStore(s => s.user);
  const cart = useCartStore(s => s.items);
  return useMemo(() => ({
    summary: user ? user.name + ': ' + cart.length + ' 件' : '未登录',
  }), [user, cart]);
};
\`\`\`

## 55.8 Zustand vs Context vs Redux

| 维度 | Context | Zustand | Redux |
|------|---------|---------|-------|
| 包体积 | 0 | ~1KB | ~3KB |
| 学习成本 | 低 | 极低 | 中 |
| Provider | 必须 | 不需要 | 必须 |
| 选择器订阅 | ❌ | ✅ | ✅ |
| 中间件 | 手动 | 内置 | 强大 |
| DevTools | 无 | 内置 | 强大 |
| 适合规模 | 小 | 中大 | 大 |

实际选择：

- 小项目 / 低频更新：Context 够用
- 中大型项目：Zustand 性价比最高
- 团队习惯约束式 + 时间旅行：Redux Toolkit

## 55.9 小结

- Zustand 解决 Context "全量重渲染"问题，支持选择器订阅
- 核心 API：\`create((set, get) => ({...}))\`
- 组件用 \`useStore(s => s.field)\` 精准订阅
- middleware：persist（持久化）、devtools（调试）
- 多 store 组合：每个领域一个 store，互不耦合
- 比 Redux 简洁，比 Context 高效，是 React 项目首选
`,
    code: `// =============================================================
// 第 55 章 demo：Zustand 轻量状态管理
// 模拟 create / subscribe / 选择器 / persist 中间件实现
// =============================================================

// ---- 模拟 Zustand 核心 ----
function createStore(createState) {
  let state;             // 当前 state
  const listeners = new Set();  // 订阅者集合

  // set：浅合并 + 通知所有订阅者
  const set = (partial) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...nextState };
    listeners.forEach(l => l(state));  // 通知
  };

  // get：读最新 state
  const get = () => state;

  // 初始化：调用 createState 拿到初始 state + 动作
  state = createState(set, get);

  // 订阅：返回取消订阅函数
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  // useStore：React hook 形式（这里简化为函数版）
  const useStore = (selector) => {
    return selector(state);
  };
  useStore.subscribe = subscribe;
  useStore.getState = get;
  useStore.setState = set;
  return useStore;
}

// 简化版 shallow 比较
function shallow(a, b) {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every(k => a[k] === b[k]);
}

// ---- 1. 创建 counter store ----
console.log('=== 1. 创建 counter store ===');

const useCounter = createStore((set, get) => ({
  count: 0,
  user: { name: 'Tom' },
  increment: () => set(s => ({ count: s.count + 1 })),
  reset: () => set({ count: 0 }),
  double: () => set({ count: get().count * 2 }),
}));

console.log('  初始 count:', useCounter.getState().count);

// ---- 2. 选择器订阅 ----
console.log('\\n=== 2. 选择器订阅 ===');

// 模拟组件：只订阅 count，user 变化不触发重渲染
let componentRenderCount = 0;
const renderCounter = () => {
  const count = useCounter(s => s.count);  // 只订阅 count
  componentRenderCount++;
  console.log('  [CounterComp 渲染 ' + componentRenderCount + ' 次] count =', count);
};

renderCounter();
useCounter.setState({ count: 5 });
renderCounter();

// user 变了，但 CounterComp 只订阅 count，不重渲染
console.log('  --- 改 user.name（不影响 count 订阅）---');
useCounter.setState({ user: { name: 'Jerry' } });
console.log('  CounterComp 渲染次数:', componentRenderCount, '（应该不变）');

// ---- 3. subscribe 全局监听 ----
console.log('\\n=== 3. subscribe 全局监听 ===');

let logCount = 0;
const unsub = useCounter.subscribe((state) => {
  logCount++;
  console.log('  [监听器 ' + logCount + '] count:', state.count);
});

useCounter.getState().increment();  // count: 5 -> 6
useCounter.getState().increment();  // count: 6 -> 7
useCounter.getState().double();     // count: 7 -> 14
console.log('  共触发监听器', logCount, '次');

unsub();  // 取消订阅
useCounter.getState().increment();
console.log('  取消后再 increment，监听器触发次数:', logCount, '（应不变）');

// ---- 4. 多字段订阅 + shallow 比较 ----
console.log('\\n=== 4. 多字段订阅 + shallow 比较 ===');

const useMulti = createStore((set) => ({
  count: 0,
  name: 'Tom',
  bump: () => set(s => ({ count: s.count + 1 })),
}));

let multiRenderCount = 0;
const renderMulti = () => {
  // 模拟 useStore(s => ({count, name}), shallow)
  const picked = { count: useMulti.getState().count, name: useMulti.getState().name };
  if (!shallow(renderMulti._last, picked)) {
    multiRenderCount++;
    renderMulti._last = picked;
    console.log('  [MultiComp 渲染 ' + multiRenderCount + ' 次]', picked);
  }
};

renderMulti();
useMulti.getState().bump();   // count 变了，重渲染
renderMulti();
useMulti.setState({ name: 'Jerry' });  // name 变了，重渲染
renderMulti();
useMulti.setState({ name: 'Jerry' });  // 没变，shallow 命中，不重渲染
renderMulti();
console.log('  MultiComp 共渲染', multiRenderCount, '次');

// ---- 5. 模拟 persist 中间件 ----
console.log('\\n=== 5. 模拟 persist 中间件 ===');

const memoryStorage = {};
function persist(createState, options) {
  const key = options.name;
  // 启动时从 storage 读
  const persisted = memoryStorage[key];
  return (set, get) => {
    const store = createState(set, get);
    // 合并持久化数据
    const initial = persisted ? { ...store, ...JSON.parse(persisted) } : store;
    // 包装 set：每次更新都写 storage
    const wrappedSet = (partial) => {
      set(partial);
      memoryStorage[key] = JSON.stringify(get());
    };
    // 重新设置初始 state
    set(initial);
    // 用 Proxy 替换原 set（简化：直接重写动作）
    return { ...initial, _persisted: true };
  };
}

const usePersisted = createStore(
  persist(
    (set) => ({
      theme: 'light',
      toggle: () => set(s => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
    }),
    { name: 'app-theme' }
  )
);

console.log('  初始 theme:', usePersisted.getState().theme);
usePersisted.setState({ theme: 'dark' });
console.log('  修改后 theme:', usePersisted.getState().theme);
console.log('  storage 内容:', memoryStorage['app-theme']);

// ---- 6. 组合多个 store ----
console.log('\\n=== 6. 组合多个 store ===');

const useUserStore = createStore((set) => ({
  user: { name: 'Tom', age: 20 },
  setUser: (user) => set({ user }),
}));

const useCartStore = createStore((set) => ({
  items: ['apple', 'book'],
  addItem: (item) => set(s => ({ items: [...s.items, item] })),
}));

// 一个组件同时读两个 store
function Header() {
  const user = useUserStore(s => s.user);
  const items = useCartStore(s => s.items);
  return user.name + ' | 购物车 ' + items.length + ' 件';
}

console.log('  Header:', Header());

useCartStore.getState().addItem('pen');
console.log('  加购后 Header:', Header());

// ---- 7. 异步 action ----
console.log('\\n=== 7. 异步 action ===');

const usePostStore = createStore((set, get) => ({
  posts: [],
  loading: false,
  fetchPosts: async () => {
    set({ loading: true });
    // 模拟请求
    const posts = await new Promise(resolve => {
      setTimeout(() => resolve([{ id: 1, title: 'Hello' }]), 10);
    });
    set({ posts, loading: false });
  },
}));

const fetchPromise = usePostStore.getState().fetchPosts();
fetchPromise.then(() => {
  console.log('  异步加载完成 posts:', usePostStore.getState().posts);
  console.log('  loading 状态:', usePostStore.getState().loading);

  // ---- 关键要点总结 ----
  console.log('\\n=== Zustand 核心要点 ===');
  console.log('1. create((set, get) => ({...})) 创建 store');
  console.log('2. 组件用 useStore(s => s.field) 选择器订阅');
  console.log('3. 多字段订阅用 shallow 避免无关重渲染');
  console.log('4. subscribe 全局监听，适合非组件代码');
  console.log('5. middleware：persist 持久化、devtools 调试');
  console.log('6. 多 store 组合：按领域拆分');
  console.log('7. 异步 action：内部 await 后 set');
});
`,
  },

  // =========================================================
  // 第五十六章：React Router v6/v7 完整指南
  // =========================================================
  {
    id: "tspro-react-router",
    group: "九、状态管理与路由",
    icon: "🛣️",
    title: "React Router v6/v7 完整指南",
    content: `# 第五十六章：React Router v6/v7 完整指南

## 56.1 为什么需要路由

SPA（单页应用）只有一个 HTML 页面，"切换页面"靠 JS 拦截 URL 变化、渲染对应组件——这就是前端路由。

不用路由：

- 切换页面要刷新整个页面，白屏
- 状态丢失
- URL 跟页面内容不对应，没法分享/收藏

前端路由：

- URL 变了不刷新页面，渲染对应组件
- 支持浏览器前进/后退
- URL 跟页面一一对应，可分享、可收藏

React Router 是 React 生态最主流的路由库，v6 大幅简化 API，v7 进一步整合成框架级（Remix 风格）。

## 56.2 React Router v6/v7 API 概览

核心 API：

- \`<BrowserRouter>\`：路由容器，包裹整个应用
- \`<Routes>\`：路由匹配容器
- \`<Route>\`：定义一条路由
- \`<Link>\` / \`<NavLink>\`：跳转链接
- \`useNavigate\`：编程式跳转
- \`useParams\`：读动态路由参数
- \`useSearchParams\`：读 query string
- \`<Outlet>\`：嵌套路由的占位
- \`<Navigate>\`：声明式重定向

最小示例：

\`\`\`tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
\`\`\`

## 56.3 Routes / Route / Link

\`<Routes>\` 会遍历内部 \`<Route>\`，找到第一个匹配的渲染。v6 不再需要 \`exact\`，路径默认就是精确匹配。

\`\`\`tsx
import { Link, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
        <Link to="/users/123">用户 123</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
\`\`\`

\`<Link to="...">\` 渲染成 \`<a>\`，但点击不会触发整页刷新。

\`<NavLink>\` 是增强版 Link，会自动给当前匹配的链接加 \`active\` 类名，适合做导航高亮。

## 56.4 useNavigate / useParams / useSearchParams

**useNavigate**：编程式跳转

\`\`\`tsx
function Login() {
  const navigate = useNavigate();
  const handleLogin = async () => {
    await api.login();
    navigate('/dashboard');       // 跳转
    navigate(-1);                  // 后退
    navigate('/users', { replace: true });  // 替换，不留历史
  };
  return <button onClick={handleLogin}>登录</button>;
}
\`\`\`

**useParams**：读动态路由参数

\`\`\`tsx
function UserDetail() {
  const { id } = useParams();  // 从 /users/:id 取出 id
  return <h1>用户 ID: {id}</h1>;
}
\`\`\`

**useSearchParams**：读 / 写 query string

\`\`\`tsx
function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';
  const setPage = (p) => setSearchParams(prev => {
    prev.set('page', String(p));
    return prev;
  });
  return <input defaultValue={keyword} />;
}
// URL: /search?q=react&page=2
\`\`\`

## 56.5 嵌套路由

v6 嵌套路由用 \`<Outlet>\` 在父组件留位置，子路由渲染到 Outlet 里：

\`\`\`tsx
function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="stats" element={<Stats />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function DashboardLayout() {
  return (
    <div>
      <Sidebar />
      <main><Outlet /></main>  {/* 子路由渲染到这里 */}
    </div>
  );
}
\`\`\`

- \`path="dashboard"\` + 子 \`path="stats"\` 自动拼成 \`/dashboard/stats\`
- \`index\` 表示默认子路由（访问 \`/dashboard\` 时渲染）

## 56.6 动态路由参数

路径以 \`:\` 开头的是动态参数：

\`\`\`tsx
<Route path="/users/:id" element={<UserDetail />} />
<Route path="/posts/:category/:slug" element={<PostDetail />} />
\`\`\`

\`\`\`tsx
// URL: /posts/react/2024-guide
function PostDetail() {
  const { category, slug } = useParams();
  // category = 'react', slug = '2024-guide'
}
\`\`\`

可选参数用 \`?\`（v6.4+）：

\`\`\`tsx
<Route path="/users/:id?" element={<UserDetail />} />
// /users 和 /users/123 都能匹配
\`\`\`

通配符 \`*\` 可以匹配剩余路径（v6 移除了 \`*\` 在中间的用法，只能在末尾）：

\`\`\`tsx
<Route path="/files/*" element={<Files />} />
// useMatch('/files/*') 拿到剩余路径
\`\`\`

## 56.7 路由守卫

实际项目经常要做权限控制：未登录跳登录页，无权限跳 403。常见模式是封装一个 \`ProtectedRoute\`：

\`\`\`tsx
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

// 使用
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/dashboard" element={
    <ProtectedRoute><Dashboard /></ProtectedRoute>
  } />
</Routes>
\`\`\`

更优雅的方式：用 \`loader\`（v6.4+ / v7）在路由加载前做权限校验，校验失败直接 throw redirect。

\`\`\`tsx
const router = createBrowserRouter([
  {
    path: '/dashboard',
    loader: async () => {
      const user = await getUser();
      if (!user) throw redirect('/login');
      return { user };
    },
    Component: Dashboard,
  },
]);
\`\`\`

## 56.8 懒加载路由

大应用按路由拆 chunk，首屏只加载首页代码：

\`\`\`tsx
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const UserDetail = lazy(() => import('./pages/UserDetail'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users/:id" element={<UserDetail />} />
      </Routes>
    </Suspense>
  );
}
\`\`\`

v6.4+ 数据路由器更简洁：

\`\`\`tsx
const router = createBrowserRouter([
  { path: '/', lazy: () => import('./pages/Home').then(m => ({ Component: m.Home })) },
  { path: '/about', lazy: () => import('./pages/About').then(m => ({ Component: m.default })) },
]);
\`\`\`

## 56.9 404 处理

用 \`path="*"\` 兜底所有未匹配的路径：

\`\`\`tsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="*" element={<NotFound />} />
</Routes>
\`\`\`

嵌套场景下，\`*\` 可以放在子路由层做局部 404：

\`\`\`tsx
<Route path="/dashboard" element={<DashboardLayout />}>
  <Route index element={<DashboardHome />} />
  <Route path="*" element={<Dashboard404 />} />
</Route>
\`\`\`

## 56.10 TS 类型 useParams<T>

\`useParams\` 默认返回 \`Record<string, string | undefined>\`，要拿到精确类型用泛型：

\`\`\`tsx
interface UserParams {
  id: string;  // 必须存在
}

function UserDetail() {
  const { id } = useParams<UserParams>();
  // id 类型: string | undefined
  // 即使写了 string，运行时仍可能是 undefined（用户乱输 URL）
  if (!id) return <NotFound />;
  return <h1>User {id}</h1>;
}
\`\`\`

更安全的方式：用 zod / valibot 在 loader 里校验：

\`\`\`tsx
const router = createBrowserRouter([
  {
    path: '/users/:id',
    loader: async ({ params }) => {
      const id = z.string().uuid().parse(params.id);  // 校验失败 throw
      return { user: await api.getUser(id) };
    },
    Component: UserDetail,
    ErrorBoundary: UserError,
  },
]);
\`\`\`

## 56.11 小结

- React Router v6/v7 是 React 主流路由库
- 核心三件套：\`<Routes>\` / \`<Route>\` / \`<Link>\`
- 嵌套路由用 \`<Outlet>\` 占位
- 动态参数 \`:id\`，\`useParams<T>\` 拿类型
- 路由守卫：封装 ProtectedRoute 或用 loader
- 懒加载：React.lazy + Suspense 或路由级 lazy
- 404：\`path="*"\` 兜底
`,
    code: `// =============================================================
// 第 56 章 demo：React Router v6/v7 完整指南
// 模拟 Router / Route / Link / useNavigate / useParams 实现
// =============================================================

// ---- 模拟 Router 核心 ----
let currentPath = '/';        // 当前路径
const listeners = new Set();  // 路径变化监听器

function navigate(to, opts) {
  // 改路径 + 通知所有监听器
  if (opts && opts.replace) {
    currentPath = to;
  } else {
    currentPath = to;
  }
  listeners.forEach(fn => fn(currentPath));
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// 把路径模式编译成正则：/users/:id -> ^/users/([^/]+)$
function compilePath(pattern) {
  const keys = [];
  const regex = pattern
    .replace(/:([^/]+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    })
    .replace(/\\*/g, '.*');
  return { regex: new RegExp('^' + regex + '$'), keys };
}

function matchPath(pattern, path) {
  const { regex, keys } = compilePath(pattern);
  const match = path.match(regex);
  if (!match) return null;
  const params = {};
  keys.forEach((k, i) => { params[k] = match[i + 1]; });
  return { params };
}

// ---- 1. 基本路由匹配 ----
console.log('=== 1. 基本路由匹配 ===');

const routes = [
  { path: '/', element: '首页内容' },
  { path: '/about', element: '关于我们' },
  { path: '/users/:id', element: '用户详情' },
  { path: '/posts/:category/:slug', element: '文章详情' },
  { path: '*', element: '404 Not Found' },
];

function renderRoute(path) {
  for (const route of routes) {
    const matched = matchPath(route.path, path);
    if (matched) {
      console.log('  路径 ' + path + ' 匹配 ' + route.path + ' ->', route.element);
      return { route, params: matched.params };
    }
  }
}

renderRoute('/');
renderRoute('/about');
renderRoute('/users/123');
renderRoute('/posts/react/2024-guide');
renderRoute('/unknown');  // 走 404

// ---- 2. useParams 解析 ----
console.log('\\n=== 2. useParams 解析动态参数 ===');

function useParams(pattern, path) {
  const matched = matchPath(pattern, path);
  return matched ? matched.params : {};
}

console.log('  /users/123 的 id:', useParams('/users/:id', '/users/123').id);
console.log('  /posts/react/2024-guide:', useParams('/posts/:category/:slug', '/posts/react/2024-guide'));

// ---- 3. useNavigate 编程式跳转 ----
console.log('\\n=== 3. useNavigate 编程式跳转 ===');

let renderCount = 0;
function App() {
  renderCount++;
  const result = renderRoute(currentPath);
  console.log('  [App 渲染 ' + renderCount + ' 次] 当前路径:', currentPath, '->', result.route.element);
}

// 订阅路径变化
subscribe(App);

App();                  // 首次渲染
navigate('/');          // 跳首页
navigate('/about');     // 跳关于
navigate('/users/456'); // 跳用户 456
navigate('/unknown');   // 跳 404

// ---- 4. useSearchParams 解析 query ----
console.log('\\n=== 4. useSearchParams 解析 query string ===');

function parseQuery(search) {
  const params = new URLSearchParams(search);
  const obj = {};
  params.forEach((v, k) => { obj[k] = v; });
  return obj;
}

console.log('  ?q=react&page=2 ->', parseQuery('?q=react&page=2'));
console.log('  ?q=react ->', parseQuery('?q=react'));

// ---- 5. 嵌套路由 ----
console.log('\\n=== 5. 嵌套路由 + Outlet ===');

const nestedRoutes = [
  {
    path: '/dashboard',
    layout: 'DashboardLayout',
    children: [
      { path: '/dashboard', element: 'Dashboard Home', index: true },
      { path: '/dashboard/stats', element: 'Stats 页面' },
      { path: '/dashboard/settings', element: 'Settings 页面' },
    ],
  },
];

function renderNested(path) {
  for (const parent of nestedRoutes) {
    // 父路由匹配前缀
    if (path === parent.path || path.startsWith(parent.path + '/')) {
      console.log('  [Layout: ' + parent.layout + ']');
      console.log('    <Outlet> 渲染:');
      // 找子路由
      for (const child of parent.children) {
        const matched = matchPath(child.path, path);
        if (matched) {
          console.log('      ', child.element);
          return;
        }
      }
      console.log('      （无子路由匹配）');
      return;
    }
  }
}

renderNested('/dashboard');
renderNested('/dashboard/stats');
renderNested('/dashboard/settings');

// ---- 6. 路由守卫 ----
console.log('\\n=== 6. 路由守卫 ProtectedRoute ===');

let currentUser = null;  // 模拟未登录

function ProtectedRoute(element) {
  if (!currentUser) {
    return { redirect: '/login', reason: '未登录' };
  }
  return element;
}

console.log('  未登录访问 /dashboard:', ProtectedRoute('Dashboard 内容'));

// 模拟登录后
currentUser = { name: 'Tom' };
console.log('  登录后访问 /dashboard:', ProtectedRoute('Dashboard 内容'));

// ---- 7. 懒加载路由 ----
console.log('\\n=== 7. 懒加载路由 ===');

function lazy(loader) {
  let loaded = null;
  return {
    load: async () => {
      if (!loaded) loaded = await loader();
      return loaded;
    },
    isLoaded: () => loaded !== null,
  };
}

const LazyHome = lazy(() => Promise.resolve('Home 组件（已加载）'));
const LazyAbout = lazy(() => Promise.resolve('About 组件（已加载）'));

console.log('  LazyHome 已加载?', LazyHome.isLoaded());
LazyHome.load().then(comp => {
  console.log('  LazyHome 加载完成:', comp);
  console.log('  LazyHome 已加载?', LazyHome.isLoaded());

  // ---- 8. 404 兜底 ----
  console.log('\\n=== 8. 404 兜底 ===');
  renderRoute('/not-exist');
  renderRoute('/random/path');

  // ---- 9. useParams 泛型（模拟 TS）----
  console.log('\\n=== 9. useParams<T> 类型推导 ===');

  // 模拟 TS 泛型：声明接口，运行时检查必填字段
  function useParamsTyped(path, pattern) {
    const params = useParams(pattern, path);
    // 运行时校验：必填字段
    if (!params.id) {
      console.log('  警告：id 为 undefined');
    }
    return params;
  }

  const p = useParamsTyped('/users/abc', '/users/:id');
  console.log('  useParams<{id: string}> 拿到:', p);

  // ---- 关键要点总结 ----
  console.log('\\n=== React Router v6/v7 核心要点 ===');
  console.log('1. <Routes>/<Route>/<Link> 三件套');
  console.log('2. 嵌套路由用 <Outlet> 占位');
  console.log('3. 动态参数 :id，useParams<T> 拿类型');
  console.log('4. useNavigate 编程式跳转');
  console.log('5. useSearchParams 操作 query string');
  console.log('6. 路由守卫：ProtectedRoute 或 loader');
  console.log('7. 懒加载：React.lazy + Suspense');
  console.log('8. 404：path="*" 兜底');
});
`,
  },

  // =========================================================
  // 第五十七章：fetch / axios 数据请求
  // =========================================================
  {
    id: "tspro-fetch",
    group: "九、状态管理与路由",
    icon: "📡",
    title: "fetch / axios 数据请求",
    content: `# 第五十七章：fetch / axios 数据请求

## 57.1 前端数据请求的演进

前端发起 HTTP 请求大致经历：

- XMLHttpRequest（XHR）：老 API，回调地狱
- jQuery $.ajax：封装 XHR，简化用法
- fetch：浏览器原生，Promise 化
- axios：第三方库，更友好的 API、拦截器、TS 支持
- React Query / SWR：基于 fetch/axios 的请求管理库

现代项目组合：**fetch 或 axios 做底层 + React Query 做状态管理**。

## 57.2 fetch API 基本用法

\`fetch\` 是浏览器原生 API，基于 Promise：

\`\`\`tsx
// 基本用法
fetch('/api/users')
  .then(res => res.json())
  .then(data => console.log(data));

// async/await 写法
async function loadUsers() {
  const res = await fetch('/api/users');
  const data = await res.json();
  console.log(data);
}
\`\`\`

POST 请求：

\`\`\`tsx
async function createUser(payload: { name: string }) {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
\`\`\`

注意 \`fetch\` 的两个坑：

1. **HTTP 错误状态（4xx/5xx）不会 reject**，必须手动检查 \`res.ok\`
2. **网络错误才 reject**，比如断网、CORS 失败

\`\`\`tsx
async function safeFetch(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('HTTP ' + res.status + ': ' + res.statusText);
  }
  return res.json();
}
\`\`\`

## 57.3 请求/响应类型设计

TS 项目里数据请求一定要标类型，避免 \`any\` 满天飞：

\`\`\`tsx
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface CreateUserPayload {
  name: string;
  email: string;
}

async function getUser(id: string): Promise<User> {
  const res = await fetch('/api/users/' + id);
  if (!res.ok) throw new Error('Failed');
  return res.json();  // 自动断言为 Promise<User>
}

async function createUser(payload: CreateUserPayload): Promise<User> {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
\`\`\`

运行时数据不保证符合类型（后端可能返回意外结构），关键接口建议用 zod / valibot 校验：

\`\`\`tsx
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
});

async function getUser(id: string) {
  const res = await fetch('/api/users/' + id);
  return UserSchema.parse(await res.json());  // 运行时校验
}
\`\`\`

## 57.4 错误处理

健壮的错误处理要区分三类：

- **网络错误**：断网、CORS、域名错误
- **HTTP 错误**：4xx（客户端错误）、5xx（服务端错误）
- **业务错误**：HTTP 200 但 body 里 \`code !== 0\`

\`\`\`tsx
class ApiError extends Error {
  constructor(public status: number, public code: number, message: string) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (e) {
    throw new ApiError(0, 0, '网络错误：' + e.message);
  }

  if (!res.ok) {
    throw new ApiError(res.status, 0, 'HTTP ' + res.status);
  }

  const data = await res.json();
  if (data.code !== 0) {
    throw new ApiError(res.status, data.code, data.message);
  }
  return data.data as T;
}
\`\`\`

## 57.5 AbortController 取消请求

组件卸载后还在 fetch，会触发"setState on unmounted component"警告，且浪费带宽。\`AbortController\` 可以取消 fetch：

\`\`\`tsx
function UserProfile({ id }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/users/' + id, { signal: controller.signal })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(e => {
        if (e.name === 'AbortError') return;  // 主动取消，忽略
        console.error(e);
      });
    return () => controller.abort();  // 卸载时取消
  }, [id]);

  return <div>{user?.name}</div>;
}
\`\`\`

取消后 fetch 会 reject 一个 \`AbortError\`，记得 catch 里跳过这种错误。

## 57.6 axios vs fetch

| 维度 | fetch | axios |
|------|-------|-------|
| 来源 | 浏览器原生 | 第三方库 |
| 体积 | 0 | ~12KB |
| HTTP 错误 | 手动检查 res.ok | 自动 reject |
| 响应转换 | 手动 res.json() | 自动转换 |
| 拦截器 | 无 | 内置 |
| 超时 | AbortController | timeout 选项 |
| 取消 | AbortController | CancelToken / AbortController |
| TS 支持 | 原生 | 更友好 |

简单场景用 fetch 够了，复杂项目（拦截器、超时、并发、上传进度）用 axios 更省心。

\`\`\`tsx
// axios 示例
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
});

api.get<User>('/users/123')
  .then(res => {
    console.log(res.data);  // 类型: User
    console.log(res.status);
  })
  .catch(err => {
    if (err.response) {
      console.log(err.response.status, err.response.data);
    }
  });
\`\`\`

## 57.7 拦截器

axios 拦截器可以在请求/响应到达业务代码前做统一处理：

\`\`\`tsx
// 请求拦截器：自动加 token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

// 响应拦截器：统一错误处理
api.interceptors.response.use(
  res => res.data,  // 直接剥一层 data
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
\`\`\`

fetch 没原生拦截器，可以包一层 wrapper 实现类似效果。

## 57.8 并发请求 Promise.all

多个独立请求用 \`Promise.all\` 并发，比逐个 await 快得多：

\`\`\`tsx
// ❌ 串行：总时间 = user_time + posts_time
async function loadSerial() {
  const user = await fetch('/api/user').then(r => r.json());
  const posts = await fetch('/api/posts').then(r => r.json());
  return { user, posts };
}

// ✅ 并发：总时间 = max(user_time, posts_time)
async function loadParallel() {
  const [user, posts] = await Promise.all([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
  ]);
  return { user, posts };
}
\`\`\`

变体：

- \`Promise.allSettled\`：等所有完成（不管成功失败），适合"尽力获取"
- \`Promise.race\`：第一个完成就返回，适合超时控制
- \`Promise.any\`：第一个成功就返回，适合备用源

## 57.9 小结

- fetch 是浏览器原生 API，基于 Promise
- fetch 不会因 HTTP 错误 reject，要手动检查 res.ok
- TS 项目接口要标类型，关键数据用 zod 校验
- AbortController 取消请求避免组件卸载后 setState
- axios 比 fetch 多拦截器、超时、自动转换
- 并发请求用 Promise.all，总时间 = max
`,
    code: `// =============================================================
// 第 57 章 demo：fetch / axios 数据请求
// 模拟 fetch + AbortController + 拦截器 + Promise.all 并发
// =============================================================

// ---- 模拟 fetch 实现 ----
const mockDB = {
  '/api/users': [
    { id: 1, name: 'Tom', email: 'tom@x.com' },
    { id: 2, name: 'Jerry', email: 'jerry@x.com' },
  ],
  '/api/user': { id: 1, name: 'Tom', email: 'tom@x.com' },
  '/api/posts': [
    { id: 1, title: 'Hello' },
    { id: 2, title: 'World' },
  ],
  '/api/error': { _status: 500, message: 'Server Error' },
};

const requestLog = [];  // 请求日志（模拟拦截器记录）

function mockFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    // 模拟网络延迟
    const delay = 30 + Math.random() * 20;

    const timer = setTimeout(() => {
      // 主动取消
      if (options.signal && options.signal.aborted) {
        const err = new Error('The user aborted a request');
        err.name = 'AbortError';
        reject(err);
        return;
      }

      const data = mockDB[url];
      if (!data) {
        // 模拟 404
        resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: () => Promise.resolve({ message: 'Not Found' }),
        });
        return;
      }

      if (data._status === 500) {
        resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.resolve({ message: data.message }),
        });
        return;
      }

      resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(data),
      });
    }, delay);

    // 监听 abort 信号
    if (options.signal) {
      options.signal.addEventListener('abort', () => {
        clearTimeout(timer);
        const err = new Error('The user aborted a request');
        err.name = 'AbortError';
        reject(err);
      });
    }
  });
}

// ---- 1. 基本 fetch 用法 ----
console.log('=== 1. 基本 fetch 用法 ===');

mockFetch('/api/users')
  .then(res => res.json())
  .then(data => {
    console.log('  用户列表:', data.length, '条');
    data.forEach(u => console.log('    -', u.name, u.email));
  });

// ---- 2. 手动检查 res.ok ----
console.log('\\n=== 2. 手动检查 res.ok（HTTP 错误不 reject）===');

async function safeFetch(url) {
  const res = await mockFetch(url);
  if (!res.ok) {
    throw new Error('HTTP ' + res.status + ': ' + res.statusText);
  }
  return res.json();
}

safeFetch('/api/unknown').catch(e => console.log('  错误捕获:', e.message));

// ---- 3. async/await + TS 类型（模拟）----
console.log('\\n=== 3. async/await + 类型标注 ===');

async function getUser() {
  // 模拟 TS 返回类型 Promise<User>
  const data = await safeFetch('/api/user');
  return { id: data.id, name: data.name, email: data.email };
}

getUser().then(user => console.log('  用户:', user.name, '| 邮箱:', user.email));

// ---- 4. AbortController 取消请求 ----
console.log('\\n=== 4. AbortController 取消请求 ===');

const controller = new AbortController();
// 立即取消（模拟组件卸载）
setTimeout(() => controller.abort(), 5);

mockFetch('/api/users', { signal: controller.signal })
  .then(r => r.json())
  .then(data => console.log('  拿到数据:', data.length))
  .catch(e => {
    if (e.name === 'AbortError') {
      console.log('  请求已取消（AbortError），忽略');
    } else {
      console.log('  其他错误:', e.message);
    }
  });

// ---- 5. 自定义 AbortController ----
console.log('\\n=== 5. 模拟 AbortController 行为 ===');

class SimpleAbortController {
  constructor() {
    this.signal = { aborted: false, _listeners: [] };
  }
  abort() {
    this.signal.aborted = true;
    this.signal._listeners.forEach(fn => fn());
  }
}

const ctrl = new SimpleAbortController();
console.log('  abort 前 signal.aborted:', ctrl.signal.aborted);
ctrl.abort();
console.log('  abort 后 signal.aborted:', ctrl.signal.aborted);

// ---- 6. 模拟 axios 拦截器 ----
console.log('\\n=== 6. 模拟 axios 拦截器 ===');

function createAxios() {
  const requestInterceptors = [];
  const responseInterceptors = [];

  const instance = {
    interceptors: {
      request: { use: (fn) => requestInterceptors.push(fn) },
      response: { use: (onSuccess, onError) => responseInterceptors.push({ onSuccess, onError }) },
    },
    async get(url) {
      // 应用请求拦截器
      let config = { url };
      for (const i of requestInterceptors) config = i(config) || config;
      requestLog.push({ url: config.url, time: Date.now() });

      try {
        let res = await mockFetch(config.url);
        // 应用响应拦截器（成功）
        for (const i of responseInterceptors) {
          if (i.onSuccess) res = i.onSuccess(res) || res;
        }
        return res;
      } catch (e) {
        // 应用响应拦截器（失败）
        for (const i of responseInterceptors) {
          if (i.onError) {
            const handled = i.onError(e);
            if (handled) return handled;
          }
        }
        throw e;
      }
    },
  };
  return instance;
}

const api = createAxios();

// 请求拦截器：加 token
api.interceptors.request.use(config => {
  console.log('  [请求拦截] 加 token');
  config.headers = { Authorization: 'Bearer xxx' };
  return config;
});

// 响应拦截器：剥一层 data
api.interceptors.response.use(
  res => {
    console.log('  [响应拦截] 状态:', res.status);
    return res;
  },
  err => {
    console.log('  [响应拦截] 错误:', err.message);
    return Promise.reject(err);
  }
);

api.get('/api/user').then(res => console.log('  最终拿到:', res.status, 'OK'));

// ---- 7. 并发请求 Promise.all ----
console.log('\\n=== 7. 并发请求 Promise.all ===');

async function loadParallel() {
  const start = Date.now();
  const [user, posts] = await Promise.all([
    mockFetch('/api/user').then(r => r.json()),
    mockFetch('/api/posts').then(r => r.json()),
  ]);
  const elapsed = Date.now() - start;
  console.log('  并发耗时:', elapsed + 'ms');
  console.log('  user:', user.name);
  console.log('  posts:', posts.length, '篇');
}

async function loadSerial() {
  const start = Date.now();
  const user = await mockFetch('/api/user').then(r => r.json());
  const posts = await mockFetch('/api/posts').then(r => r.json());
  const elapsed = Date.now() - start;
  console.log('  串行耗时:', elapsed + 'ms（应该约为并发的 2 倍）');
}

loadParallel().then(() => loadSerial()).then(() => {
  // ---- 8. Promise.allSettled 容错 ----
  console.log('\\n=== 8. Promise.allSettled 容错 ===');

  Promise.allSettled([
    mockFetch('/api/user').then(r => r.json()),
    mockFetch('/api/unknown').then(r => r.json()),
  ]).then(results => {
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') console.log('  请求 ' + i + ' 成功:', r.value.name || 'N/A');
      else console.log('  请求 ' + i + ' 失败:', r.reason.message);
    });
  });

  // ---- 9. 超时控制 Promise.race ----
  console.log('\\n=== 9. 超时控制 Promise.race ===');

  function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout after ' + ms + 'ms')), ms)
    );
    return Promise.race([promise, timeout]);
  }

  withTimeout(mockFetch('/api/user'), 5)
    .then(() => console.log('  请求成功'))
    .catch(e => console.log('  超时:', e.message));

  setTimeout(() => {
    // ---- 关键要点总结 ----
    console.log('\\n=== fetch / axios 核心要点 ===');
    console.log('1. fetch 是浏览器原生 API，基于 Promise');
    console.log('2. HTTP 错误（4xx/5xx）不会 reject，要手动检查 res.ok');
    console.log('3. AbortController 取消请求，避免卸载后 setState');
    console.log('4. axios 提供拦截器、超时、自动 JSON 转换');
    console.log('5. 请求拦截器：加 token、加日志');
    console.log('6. 响应拦截器：剥 data、统一错误处理');
    console.log('7. 并发用 Promise.all，容错用 allSettled，超时用 race');
  }, 200);
});
`,
  },

  // =========================================================
  // 第五十八章：React Query / SWR 数据获取库
  // =========================================================
  {
    id: "tspro-react-query",
    group: "九、状态管理与路由",
    icon: "🔄",
    title: "React Query / SWR 数据获取库",
    content: `# 第五十八章：React Query / SWR 数据获取库

## 58.1 传统数据请求的问题

用 fetch/axios + useEffect + useState 写数据请求，每个组件都要写一遍：

\`\`\`tsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch('/api/users', { signal: controller.signal })
      .then(res => res.json())
      .then(data => { setUsers(data); setError(null); })
      .catch(e => { if (e.name !== 'AbortError') setError(e); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorView />;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\`

痛点：

- **样板代码多**：每个请求组件都写一遍 loading/error/abort
- **没缓存**：切走再切回重新请求，浪费
- **没自动刷新**：数据过时了不知道
- **请求竞态**：快速切换 id 时旧请求覆盖新请求
- **窗口聚焦不刷新**：用户切回标签页看不到最新数据

React Query / SWR 就是为解决这些痛点而生。

## 58.2 React Query / SWR 解决什么问题

核心能力：

- **自动缓存**：相同 key 的请求只发一次，后续从缓存读
- **重新验证**：窗口聚焦、网络恢复时自动刷新
- **加载/错误状态**：自动管理 isLoading / isError
- **请求去重**：多个组件同时请求同一接口自动合并
- **分页/无限滚动**：内置支持
- **乐观更新**：mutation 先改 UI 再发请求
- **请求竞态处理**：自动取消旧请求

代码对比：

\`\`\`tsx
// 传统：15 行
function UserList() {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { /* fetch + setStates */ }, []);
  if (loading) return <Spinner />;
  return <ul>{users.map(u => <li>{u.name}</li>)}</ul>;
}

// React Query：3 行
function UserList() {
  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  if (isLoading) return <Spinner />;
  return <ul>{data.map(u => <li>{u.name}</li>)}</ul>;
}
\`\`\`

## 58.3 stale-while-revalidate 思想

SWR（也是库的名字）核心思想来自 HTTP 缓存策略 \`stale-while-revalidate\`：

1. **先返回缓存**（即使过期）：用户立刻看到数据，无白屏
2. **后台重新请求**：拿到新数据后无感更新
3. **缓存作为兜底**：断网时仍能展示旧数据

时序：

\`\`\`
首次：  请求 → loading → 拿到数据 → 渲染
再次：  缓存(立即渲染) → 后台请求 → 新数据(无感更新)
断网：  缓存(立即渲染) → 请求失败 → 仍展示缓存
\`\`\`

React Query 默认行为就是 SWR：\`staleTime\` 控制多久内算"新鲜"，\`gcTime\` 控制缓存保留多久。

## 58.4 useQuery API

\`\`\`tsx
import { useQuery } from '@tanstack/react-query';

function UserList() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users'],           // 缓存 key（数组形式）
    queryFn: fetchUsers,           // 请求函数
    staleTime: 60_000,             // 1 分钟内不重新请求
    refetchOnWindowFocus: true,    // 窗口聚焦时刷新（默认 true）
    retry: 3,                      // 失败重试 3 次
  });

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorView error={error} />;
  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\`

\`queryKey\` 是 React Query 的灵魂：相同 key 共享缓存。带参数的请求用数组：

\`\`\`tsx
// 带 id 的请求
const { data } = useQuery({
  queryKey: ['users', userId],
  queryFn: () => fetchUser(userId),
});

// 带筛选条件
const { data } = useQuery({
  queryKey: ['users', { page, filter }],
  queryFn: () => fetchUsers({ page, filter }),
});
\`\`\`

\`queryKey\` 变了会自动重新请求。

## 58.5 useMutation API

写操作（POST/PUT/DELETE）用 \`useMutation\`：

\`\`\`tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreateUserForm() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (newUser) => fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(newUser),
    }),
    onSuccess: () => {
      // 创建成功后让 users 查询失效，自动重新请求
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return (
    <form onSubmit={e => {
      e.preventDefault();
      mutation.mutate({ name: 'Tom' });
    }}>
      <button disabled={mutation.isPending}>
        {mutation.isPending ? '创建中...' : '创建'}
      </button>
    </form>
  );
}
\`\`\`

\`invalidateQueries\` 是 React Query 的核心机制：标记某个 key 的缓存"过期"，所有用到这个 key 的组件会自动重新请求。

## 58.6 缓存策略

关键配置：

- **\`staleTime\`**：数据"新鲜期"，期间不会重新请求。默认 0（永远立刻重新验证）
- **\`gcTime\`**（旧名 cacheTime）：缓存多久没被用就 GC，默认 5 分钟
- **\`refetchOnWindowFocus\`**：窗口聚焦时重新验证，默认 true
- **\`refetchOnReconnect\`**：网络恢复时重新验证，默认 true
- **\`retry\`**：失败重试次数，默认 3

\`\`\`tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,         // 30 秒内不重新请求
      gcTime: 5 * 60_000,        // 5 分钟 GC
      refetchOnWindowFocus: true,
      retry: 2,
    },
  },
});
\`\`\`

选择经验：

- 频繁变化的数据：staleTime 设短（10s）
- 很少变化的数据：staleTime 设长（5min）
- 用户操作触发的：staleTime = Infinity，手动 invalidate

## 58.7 乐观更新

乐观更新：mutation 时**先改本地缓存**让用户立刻看到效果，请求失败再回滚。

\`\`\`tsx
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // 取消正在进行的查询，避免覆盖乐观更新
    await queryClient.cancelQueries({ queryKey: ['todos'] });
    // 保存旧数据用于回滚
    const previous = queryClient.getQueryData(['todos']);
    // 乐观更新缓存
    queryClient.setQueryData(['todos'], (old) =>
      old.map(t => t.id === newTodo.id ? newTodo : t)
    );
    return { previous };  // 传给 onError 的 context
  },
  onError: (err, newTodo, context) => {
    // 失败回滚
    queryClient.setQueryData(['todos'], context.previous);
  },
  onSettled: () => {
    // 不管成功失败都重新验证
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
\`\`\`

用户体验：点了按钮立刻生效，不需要等请求完成。

## 58.8 加载/错误状态

React Query 提供多种状态：

- \`isLoading\`：首次加载（没有缓存）
- \`isFetching\`：正在请求（包括后台重新验证）
- \`isPending\`：mutation 进行中
- \`isError\`：请求失败
- \`isSuccess\`：请求成功
- \`error\`：错误对象

\`\`\`tsx
const { data, isLoading, isFetching, isError, error } = useQuery({...});

if (isLoading) return <Spinner />;             // 首次加载
if (isError) return <ErrorView error={error} />; // 错误
return (
  <div>
    {isFetching && <RefreshBadge />}  {/* 后台刷新中 */}
    <ul>{data.map(...)}</ul>
  </div>
);
\`\`\`

区分 \`isLoading\` 和 \`isFetching\` 很重要：前者阻塞渲染，后者只是后台提示。

## 58.9 SWR 对比

SWR 是 Vercel 出的另一个数据获取库，思路类似但 API 更简洁：

\`\`\`tsx
// SWR
import useSWR from 'swr';

function UserList() {
  const { data, error, isLoading } = useSWR('/api/users', fetcher);
  if (isLoading) return <Spinner />;
  if (error) return <ErrorView />;
  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\`

| 维度 | React Query | SWR |
|------|-------------|-----|
| 包体积 | ~13KB | ~4KB |
| 学习曲线 | 略陡 | 平缓 |
| DevTools | 强大 | 基础 |
| Mutation | 完整 | 手动 |
| 乐观更新 | 内置 onMutate | 手动 |
| 无限滚动 | 内置 | 内置 |
| 预取 | 完整 API | 简单 |
| 适合规模 | 大型项目 | 中小型 |

经验：小型项目用 SWR 简洁，大型项目用 React Query 工具链更全。

## 58.10 小结

- React Query / SWR 解决传统请求的样板代码、缓存、竞态问题
- 核心 SWR 思想：先返回缓存，后台重新验证
- \`useQuery\` 读，\`useMutation\` 写
- \`queryKey\` 是缓存灵魂，相同 key 共享
- \`invalidateQueries\` 让缓存失效，触发重新请求
- 乐观更新：先改缓存，失败回滚
- \`staleTime\` 控制新鲜期，\`gcTime\` 控制 GC
- 区分 \`isLoading\`（首次）和 \`isFetching\`（任意请求中）
`,
    code: `// =============================================================
// 第 58 章 demo：React Query / SWR 数据获取库
// 模拟 useQuery + 缓存 + 乐观更新 + useMutation 实现
// =============================================================

// ---- 模拟 React Query 核心 ----
const queryCache = new Map();  // queryKey -> 缓存数据
const querySubscribers = new Map();  // queryKey -> 订阅回调集合
let fetchCount = 0;  // 统计实际 fetch 次数

function getKey(key) {
  // queryKey 是数组，转成字符串作为 Map key
  return JSON.stringify(key);
}

function notifySubscribers(key) {
  const subs = querySubscribers.get(getKey(key)) || [];
  subs.forEach(fn => fn(queryCache.get(getKey(key))));
}

// useQuery 简化实现
function useQuery(options) {
  const { queryKey, queryFn, staleTime = 0 } = options;
  const keyStr = getKey(queryKey);
  const cached = queryCache.get(keyStr);

  // 模拟组件状态
  const state = {
    data: cached ? cached.data : undefined,
    isLoading: !cached,
    isFetching: true,
    isError: false,
    error: null,
  };

  // 1. 有缓存且没过期：直接返回，不请求
  if (cached && Date.now() - cached.updatedAt < staleTime) {
    state.isFetching = false;
    return { ...state, _fromCache: true };
  }

  // 2. 有缓存但过期：先返回缓存，后台重新验证（SWR）
  if (cached) {
    state.isLoading = false;
    state.isFetching = true;
    console.log('    [SWR] 先返回缓存，后台重新验证');
  }

  // 3. 发起请求
  fetchCount++;
  queryFn().then(data => {
    queryCache.set(keyStr, { data, updatedAt: Date.now() });
    console.log('    [fetch 完成] key:', queryKey, '数据:', data);
    notifySubscribers(queryKey);
  }).catch(e => {
    console.log('    [fetch 失败]', e.message);
  });

  return state;
}

// useMutation 简化实现
function useMutation(options) {
  const { mutationFn, onMutate, onSuccess, onError, onSettled } = options;
  const state = { isPending: false, isError: false, error: null };

  const mutate = async (variables) => {
    state.isPending = true;
    let context;
    try {
      // onMutate：乐观更新，返回 context 给 onError
      if (onMutate) context = await onMutate(variables);
      const data = await mutationFn(variables);
      state.isPending = false;
      if (onSuccess) onSuccess(data, variables, context);
      if (onSettled) onSettled(data, null, variables, context);
      return { data };
    } catch (e) {
      state.isPending = false;
      state.isError = true;
      state.error = e;
      if (onError) onError(e, variables, context);
      if (onSettled) onSettled(undefined, e, variables, context);
      return { error: e };
    }
  };

  return { ...state, mutate };
}

function invalidateQueries(queryKey) {
  // 简化：直接清缓存，下次请求会重新 fetch
  const keyStr = getKey(queryKey);
  if (queryKey === undefined) {
    queryCache.clear();
  } else {
    queryCache.delete(keyStr);
  }
  console.log('    [invalidate] 清除缓存:', queryKey);
}

function setQueryData(queryKey, updater) {
  const keyStr = getKey(queryKey);
  const old = queryCache.get(keyStr);
  const newData = typeof updater === 'function' ? updater(old?.data) : updater;
  queryCache.set(keyStr, { data: newData, updatedAt: Date.now() });
}

function getQueryData(queryKey) {
  return queryCache.get(getKey(queryKey))?.data;
}

// ---- 模拟 fetcher ----
const mockData = {
  users: [
    { id: 1, name: 'Tom', done: false },
    { id: 2, name: 'Jerry', done: false },
  ],
};

async function fetchUsers() {
  // 模拟延迟
  await new Promise(r => setTimeout(r, 20));
  return JSON.parse(JSON.stringify(mockData.users));  // 返回副本
}

async function toggleTodo(id) {
  await new Promise(r => setTimeout(r, 10));
  const todo = mockData.users.find(t => t.id === id);
  if (todo) todo.done = !todo.done;
  return todo;
}

// ---- 1. 首次请求：isLoading = true ----
console.log('=== 1. 首次请求 ===');

let r1 = useQuery({ queryKey: ['users'], queryFn: fetchUsers, staleTime: 1000 });
console.log('  isLoading:', r1.isLoading, 'isFetching:', r1.isFetching);

// ---- 2. 缓存命中（staleTime 内）----
console.log('\\n=== 2. 缓存命中（staleTime 内不重新请求）===');

// 手动等首次完成
setTimeout(() => {
  console.log('  首次完成后 fetchCount:', fetchCount);
  let r2 = useQuery({ queryKey: ['users'], queryFn: fetchUsers, staleTime: 1000 });
  console.log('  二次请求 isLoading:', r2.isLoading, 'isFetching:', r2.isFetching);
  console.log('  fetchCount 应该不变:', fetchCount);
  console.log('  缓存数据:', r2.data);

  // ---- 3. SWR：缓存过期，先返回缓存再后台刷新 ----
  console.log('\\n=== 3. SWR 模式（缓存过期）===');
  let r3 = useQuery({ queryKey: ['users'], queryFn: fetchUsers, staleTime: 0 });
  console.log('  isLoading:', r3.isLoading, '（应该 false，有缓存）');
  console.log('  isFetching:', r3.isFetching, '（应该 true，后台刷新）');

  setTimeout(() => {
    console.log('  后台刷新完成，fetchCount:', fetchCount);

    // ---- 4. 多组件共享缓存 ----
    console.log('\\n=== 4. 多组件共享同一 queryKey 缓存 ===');
    let compA = useQuery({ queryKey: ['users'], queryFn: fetchUsers, staleTime: 5000 });
    let compB = useQuery({ queryKey: ['users'], queryFn: fetchUsers, staleTime: 5000 });
    console.log('  compA.data === compB.data:', compA.data === compB.data, '（共享缓存）');

    // ---- 5. useMutation + invalidateQueries ----
    console.log('\\n=== 5. useMutation + invalidateQueries ===');

    let mutationFetchCount = 0;
    const toggleMutation = useMutation({
      mutationFn: toggleTodo,
      onSuccess: () => {
        console.log('  [onSuccess] mutation 完成，invalidate users');
        invalidateQueries(['users']);
      },
    });

    toggleMutation.mutate(1).then(() => {
      console.log('  mutation 完成后再次 useQuery：');
      let r4 = useQuery({ queryKey: ['users'], queryFn: fetchUsers, staleTime: 0 });
      console.log('  数据已失效，重新请求 fetchCount 应增加');

      // ---- 6. 乐观更新 ----
      console.log('\\n=== 6. 乐观更新 onMutate ===');

      const optimisticMutation = useMutation({
        mutationFn: toggleTodo,
        onMutate: async (id) => {
          // 保存旧数据用于回滚
          const previous = getQueryData(['users']);
          // 乐观更新：先改缓存
          setQueryData(['users'], (old) =>
            old.map(t => t.id === id ? { ...t, done: !t.done } : t)
          );
          console.log('  [onMutate] 乐观更新缓存，旧数据已保存');
          return { previous };
        },
        onError: (err, id, context) => {
          // 失败回滚
          setQueryData(['users'], context.previous);
          console.log('  [onError] 失败，回滚缓存');
        },
        onSettled: () => {
          console.log('  [onSettled] 不管成败都重新验证');
        },
      });

      let before = getQueryData(['users']);
      console.log('  更新前 todo[0].done:', before[0].done);
      optimisticMutation.mutate(1);
      let afterOptimistic = getQueryData(['users']);
      console.log('  乐观更新后立刻读缓存 done:', afterOptimistic[0].done, '（已变化）');

      // ---- 7. 各种状态 ----
      console.log('\\n=== 7. 加载/错误状态 ===');

      async function failingFetcher() {
        throw new Error('Network Error');
      }

      let errorQuery = useQuery({
        queryKey: ['error-endpoint'],
        queryFn: failingFetcher,
        staleTime: 0,
      });
      console.log('  失败请求 isError:', errorQuery.isError);
      console.log('  error:', errorQuery.error);

      // ---- 8. 模拟 SWR API ----
      console.log('\\n=== 8. 模拟 SWR API（更简洁）===');

      function useSWR(key, fetcher) {
        return useQuery({
          queryKey: [key],
          queryFn: fetcher,
          staleTime: 0,
        });
      }

      let swr = useSWR('/api/users', fetchUsers);
      console.log('  useSWR 返回:', { isLoading: swr.isLoading, isFetching: swr.isFetching });

      setTimeout(() => {
        // ---- 关键要点总结 ----
        console.log('\\n=== React Query / SWR 核心要点 ===');
        console.log('1. useQuery 读，useMutation 写');
        console.log('2. queryKey 是缓存灵魂，相同 key 共享');
        console.log('3. staleTime 内不重新请求，gcTime 控制 GC');
        console.log('4. SWR：先返回缓存，后台重新验证');
        console.log('5. invalidateQueries 让缓存失效触发重请求');
        console.log('6. 乐观更新：onMutate 改缓存，onError 回滚');
        console.log('7. 区分 isLoading（首次）和 isFetching（任意请求中）');
        console.log('8. SWR 更简洁，React Query 工具链更全');
      }, 50);
    });
  }, 50);
}, 50);
`,
  },

  // =========================================================
  // 第五十九章：Suspense 数据获取（实验性）
  // =========================================================
  {
    id: "tspro-suspense-data",
    group: "九、状态管理与路由",
    icon: "⏳",
    title: "Suspense 数据获取（实验性）",
    content: `# 第五十九章：Suspense 数据获取（实验性）

## 59.1 传统数据请求的痛点

前面几章的请求模式都是"声明 loading 状态 + 渲染分支"：

\`\`\`tsx
function UserDetail({ id }) {
  const { data, isLoading, isError } = useQuery({...});
  if (isLoading) return <Spinner />;
  if (isError) return <ErrorView />;
  return <UserCard user={data} />;
}
\`\`\`

问题：

- **逻辑分散**：每个请求组件都写一遍 if loading/error
- **瀑布流**：父组件请求完才渲染子组件，子组件才能发请求
- **状态嵌套**：多个请求要写 if isLoading1 && isLoading2，难维护
- **不能优雅组合**：请求和渲染逻辑强耦合

Suspense for Data Fetching 想重新设计这套模式：**组件只关心"我有数据了怎么渲染"，请求状态交给 Suspense 边界处理**。

## 59.2 Suspense for Data Fetching 思想

核心思想：让数据请求像读取同步变量一样自然。组件渲染时直接"用"数据，没拿到就"暂停"，Suspense 边界捕获暂停状态展示 fallback。

\`\`\`tsx
// 理想形态（实验性 API）
function UserDetail({ id }) {
  // 直接读数据，没拿到就 throw promise
  const user = use(promiseFor(id));
  return <UserCard user={user} />;  // 拿到才执行
}

// 父组件用 Suspense 包裹
function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <UserDetail id={1} />
    </Suspense>
  );
}
\`\`\`

对比：

- 传统：组件内部管理 loading（"我怎么还没好"）
- Suspense：组件假设数据已就绪（"我拿到就用"），没就绪由父级 Suspense 兜底

## 59.3 throw promise 模式

Suspense 的实现核心是 **throw promise**：组件渲染时如果数据没好，就 throw 一个 Promise，React 捕获这个 Promise，等它 resolve 后重新渲染组件。

\`\`\`tsx
// 简化版 useSuspenseResource
function getResource(resource) {
  if (resource.status === 'pending') {
    throw resource.promise;  // 关键：throw promise
  }
  if (resource.status === 'success') {
    return resource.data;
  }
  if (resource.status === 'error') {
    throw resource.error;
  }
}

function createResource(promise) {
  const resource = { status: 'pending', promise: null, data: null, error: null };
  resource.promise = promise.then(
    data => { resource.status = 'success'; resource.data = data; },
    error => { resource.status = 'error'; resource.error = error; }
  );
  return resource;
}
\`\`\`

工作流程：

1. 组件首次渲染，调 \`getResource\`
2. \`resource.status === 'pending'\`，throw promise
3. React 捕获 promise，渲染最近的 \`<Suspense fallback={...}>\`
4. promise resolve 后，React 重新渲染组件
5. \`resource.status === 'success'\`，返回 data，正常渲染

## 59.4 与 useEffect/useState 对比

\`\`\`tsx
// 传统 useEffect + useState
function User({ id }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchUser(id).then(u => { setUser(u); setLoading(false); });
  }, [id]);
  if (loading) return <Spinner />;
  return <Card user={user} />;
}

// Suspense 模式
function User({ id }) {
  const user = use(fetchUserResource(id));  // 内部 throw promise
  return <Card user={user} />;  // 拿到才执行
}

// 父组件统一处理 loading
<Suspense fallback={<Spinner />}>
  <User id={1} />
</Suspense>
\`\`\`

Suspense 的好处：

- **声明式**：组件只写"有数据时怎么渲染"
- **统一加载状态**：多个组件共享一个 Suspense 边界
- **避免瀑布**：父组件渲染时子组件能并行发起请求
- **可组合**：Suspense 可以嵌套，每层处理不同粒度的 loading

## 59.5 Error Boundary 配合

throw promise 让 Suspense 处理 loading，那请求失败 throw error 怎么办？答案是 **Error Boundary**：

\`\`\`tsx
import { Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorView />}>
      <Suspense fallback={<Spinner />}>
        <User id={1} />
      </Suspense>
    </ErrorBoundary>
  );
}
\`\`\`

- 请求中 throw promise → Suspense 接住，渲染 fallback
- 请求失败 throw error → ErrorBoundary 接住，渲染错误 UI
- 请求成功 → 正常渲染组件

这种"声明式 IO"组合让数据流非常清晰。

## 59.6 并发渲染简介

Suspense 是 React 并发渲染（Concurrent Rendering）的核心机制。并发模式下：

- **可中断渲染**：React 可以暂停当前渲染，处理更高优先级更新
- **保留中间状态**：暂停的渲染不丢失，恢复后继续
- **优先级调度**：用户输入优先级 > 数据刷新

\`\`\`tsx
import { startTransition, useDeferredValue } from 'react';

function Search() {
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const results = useSearch(deferred);  // Suspense

  const onChange = e => {
    startTransition(() => {  // 标记为非紧急更新
      setQuery(e.target.value);
    });
  };

  return <input value={query} onChange={onChange} />;
}
\`\`\`

\`startTransition\` 告诉 React：这个更新可以被打断，不要阻塞用户输入。

## 59.7 为什么还未正式发布

Suspense for Data Fetching 状态：

- **Suspense for lazy loading**：已正式发布（\`React.lazy\`）
- **Suspense for Data Fetching**：实验性，API 还在变
- **Server Components**：已发布但需框架支持（Next.js App Router）

原因：

1. **API 设计未定稿**：\`use\` hook 的语义、cache 策略还在调整
2. **缓存层缺失**：需要框架提供缓存（React Query / Relay / Next.js）
3. **错误处理复杂**：throw promise / throw error 双模式让心智模型变复杂
4. **生态适配**：现有数据库需要改造支持 Suspense

实际项目用法：

- 用 React Query 的 \`suspense: true\` 选项体验 Suspense
- 用 Next.js App Router 的 async server components 拿到"已就绪"数据
- 不要自己手写 throw promise（除非学习）

## 59.8 React 18 的 use() hook（实验性）

React 18 引入 \`use\` hook，可以在组件内"读取" promise 或 context：

\`\`\`tsx
import { use } from 'react';

function User({ userPromise }) {
  // 直接读 promise，没就绪自动 throw
  const user = use(userPromise);
  return <Card user={user} />;
}

// 父组件
function App() {
  const userPromise = fetchUser(1);
  return (
    <Suspense fallback={<Spinner />}>
      <User userPromise={userPromise} />
    </Suspense>
  );
}
\`\`\`

注意 \`use\` 跟其他 hook 不同：**可以在条件分支和循环里调用**（其他 hook 必须顶层调用）。

## 59.9 小结

- Suspense for Data Fetching 让组件只关心"有数据怎么渲染"
- 核心机制：throw promise，React 捕获后展示 Suspense fallback
- 配合 Error Boundary 处理错误
- 并发渲染支持可中断、优先级调度
- API 仍实验性，实际项目用 React Query suspense 或 Next.js
- \`use\` hook 是未来方向，可在条件分支调用
`,
    code: `// =============================================================
// 第 59 章 demo：Suspense 数据获取（实验性）
// 模拟 throw promise + Suspense + ErrorBoundary 实现
// =============================================================

// ---- 模拟 React Suspense 机制 ----
const SuspenseState = {
  pending: 'pending',
  success: 'success',
  error: 'error',
};

// 创建资源：包装 promise，跟踪状态
function createResource(promise) {
  const resource = {
    status: SuspenseState.pending,
    promise: null,
    data: null,
    error: null,
  };
  resource.promise = promise.then(
    data => {
      resource.status = SuspenseState.success;
      resource.data = data;
    },
    error => {
      resource.status = SuspenseState.error;
      resource.error = error;
    }
  );
  return resource;
}

// 读取资源：关键！pending 时 throw promise
function readResource(resource) {
  if (resource.status === SuspenseState.pending) {
    throw resource.promise;  // 关键：throw promise
  }
  if (resource.status === SuspenseState.success) {
    return resource.data;
  }
  if (resource.status === SuspenseState.error) {
    throw resource.error;  // 失败 throw error
  }
}

// ---- 模拟 Suspense 边界 ----
function Suspense(fallback, children) {
  return { type: 'Suspense', fallback, children };
}

function ErrorBoundary(fallback, children) {
  return { type: 'ErrorBoundary', fallback, children };
}

// 渲染器：捕获 throw promise / throw error
function render(tree) {
  try {
    if (tree.type === 'Suspense') {
      try {
        return render(tree.children);
      } catch (e) {
        // 捕获 promise：渲染 fallback
        if (e instanceof Promise || (e && e.then)) {
          return 'fallback: ' + tree.fallback;
        }
        throw e;  // 非 promise 错误继续抛
      }
    }
    if (tree.type === 'ErrorBoundary') {
      try {
        return render(tree.children);
      } catch (e) {
        if (e instanceof Promise || (e && e.then)) {
          throw e;  // promise 让上层 Suspense 处理
        }
        return 'error: ' + tree.fallback;
      }
    }
    if (typeof tree === 'function') {
      return render(tree());
    }
    return String(tree);
  } catch (e) {
    if (e instanceof Promise || (e && e.then)) {
      return 'fallback: <Spinner />';  // 顶层兜底
    }
    throw e;
  }
}

// ---- 模拟数据请求 ----
const mockUser = { id: 1, name: 'Tom', email: 'tom@x.com' };
const mockError = new Error('Network Error');

function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === 999) reject(mockError);
      else resolve({ ...mockUser, id });
    }, 30);
  });
}

// 缓存：相同 id 共享资源
const resourceCache = new Map();
function getUserResource(id) {
  if (!resourceCache.has(id)) {
    resourceCache.set(id, createResource(fetchUser(id)));
  }
  return resourceCache.get(id);
}

// ---- 1. throw promise 工作流程 ----
console.log('=== 1. throw promise 工作流程 ===');

function UserComponent(id) {
  // 直接读，没好就 throw
  const user = readResource(getUserResource(id));
  return '用户: ' + user.name + ' (id=' + user.id + ')';
}

// 首次渲染：应该 throw promise，展示 fallback
const tree1 = Suspense('<Spinner />', () => UserComponent(1));
console.log('  首次渲染结果:', render(tree1));

// ---- 2. 等 promise resolve 后重新渲染 ----
console.log('\\n=== 2. 等待数据 resolve 后重新渲染 ===');

setTimeout(() => {
  // 资源已 success，再渲染应该拿到数据
  const tree2 = Suspense('<Spinner />', () => UserComponent(1));
  console.log('  resolve 后渲染结果:', render(tree2));

  // ---- 3. ErrorBoundary 捕获错误 ----
  console.log('\\n=== 3. ErrorBoundary 捕获错误 ===');

  function FailingUser(id) {
    const user = readResource(getUserResource(id));
    return '用户: ' + user.name;
  }

  const tree3 = ErrorBoundary('<ErrorView />', () => FailingUser(999));
  // 先 throw promise，等 reject 后 throw error
  console.log('  首次渲染（pending）:', render(tree3));

  setTimeout(() => {
    // 已 error，再渲染应该被 ErrorBoundary 捕获
    const tree4 = ErrorBoundary('<ErrorView />', () => FailingUser(999));
    console.log('  reject 后渲染结果:', render(tree4));

    // ---- 4. 嵌套 Suspense ----
    console.log('\\n=== 4. 嵌套 Suspense（不同粒度 fallback）===');

    function OuterComponent() {
      const user = readResource(getUserResource(1));
      return 'Outer(' + user.name + ') -> ' + InnerComponent();
    }

    function InnerComponent() {
      const user = readResource(getUserResource(2));
      return 'Inner(' + user.name + ')';
    }

    const nestedTree = Suspense(
      '<OuterSpinner />',
      () => Suspense('<InnerSpinner />', () => OuterComponent())
    );
    console.log('  嵌套渲染结果:', render(nestedTree));

    // ---- 5. 多个请求并发（避免瀑布）----
    console.log('\\n=== 5. 多个请求并发 ===');

    function MultiUser() {
      // 同时发两个请求（throw promise 让 React 等都完成）
      const u1 = readResource(getUserResource(1));
      const u2 = readResource(getUserResource(2));
      return u1.name + ' & ' + u2.name;
    }

    const start = Date.now();
    // 同时创建两个资源（并发发起）
    getUserResource(1);
    getUserResource(2);

    setTimeout(() => {
      const result = render(Suspense('<Spinner />', () => MultiUser()));
      const elapsed = Date.now() - start;
      console.log('  渲染结果:', result);
      console.log('  总耗时:', elapsed + 'ms（应该接近单请求，不是 2 倍）');

      // ---- 6. 模拟 use() hook ----
      console.log('\\n=== 6. 模拟 use() hook ===');

      function use(promiseOrResource) {
        // promise -> 创建 resource -> 读
        if (promiseOrResource && promiseOrResource.then) {
          // 是 promise，包装成 resource（简化：每次新建，实际应缓存）
          const r = createResource(promiseOrResource);
          return readResource(r);
        }
        // 已是 resource
        return readResource(promiseOrResource);
      }

      function UserWithUse(promise) {
        const user = use(promise);
        return 'use() -> ' + user.name;
      }

      // use() 也能 throw promise
      const newPromise = fetchUser(3);
      const useTree = Suspense('<Spinner />', () => UserWithUse(newPromise));
      console.log('  首次渲染:', render(useTree));

      setTimeout(() => {
        // promise resolve 后重渲染
        const useTree2 = Suspense('<Spinner />', () => UserWithUse(newPromise));
        // 注：这里因为新 promise 每次新建，演示用 cached 资源
        const cachedResource = createResource(fetchUser(1));
        setTimeout(() => {
          const result = readResource(cachedResource);
          console.log('  use() 拿到数据:', result.name);

          // ---- 7. 与 useEffect/useState 对比 ----
          console.log('\\n=== 7. 与 useEffect/useState 对比 ===');
          console.log('  传统：组件内部 if loading/error');
          console.log('  Suspense：组件只写"有数据怎么渲染"');
          console.log('  loading 状态交给父级 Suspense 统一处理');
          console.log('  错误状态交给 ErrorBoundary 统一处理');

          // ---- 8. 并发渲染简介 ----
          console.log('\\n=== 8. 并发渲染 startTransition ===');

          function startTransition(fn) {
            // 简化：标记为低优先级，可被打断
            console.log('  [startTransition] 标记为非紧急更新');
            fn();
          }

          let query = 'a';
          startTransition(() => {
            query = 'abc';
          });
          console.log('  query 更新:', query);
          console.log('  → 用户输入优先级 > 数据刷新');

          // ---- 关键要点总结 ----
          console.log('\\n=== Suspense 数据获取核心要点 ===');
          console.log('1. 组件只关心"有数据怎么渲染"，loading 交给 Suspense');
          console.log('2. 核心机制：pending 时 throw promise');
          console.log('3. React 捕获 promise，渲染 fallback');
          console.log('4. promise resolve 后自动重新渲染');
          console.log('5. 错误用 ErrorBoundary 捕获');
          console.log('6. 嵌套 Suspense 支持不同粒度 fallback');
          console.log('7. 多请求并发避免瀑布流');
          console.log('8. use() hook 是未来方向，可在条件分支调用');
          console.log('9. 仍实验性，实际用 React Query suspense 或 Next.js');
        }, 50);
      }, 50);
    }, 50);
  }, 50);
}, 50);
`,
  },
];
