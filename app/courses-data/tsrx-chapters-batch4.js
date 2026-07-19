export const chapters = [
  {
    id: "tsrx-context-state",
    group: "状态管理篇",
    icon: "🌐",
    title: "Context+useReducer全局状态方案",
    content: `## Context+useReducer全局状态方案

在 React 应用中，当状态需要在多个组件间共享时，逐层传递 props（prop drilling）会让代码变得臃肿难维护。Context API 结合 useReducer 是 React 内置的轻量级全局状态方案，无需引入第三方库即可实现类似 Redux 的状态管理模式，适合中小型应用。

### createContext 泛型类型定义与 Provider 封装

使用 TypeScript 时，首先需要为 Context 定义清晰的类型，然后通过 createContext 创建上下文，并封装 Provider 组件来管理状态：

\`\`\`tsx
import { createContext, useContext, useMemo, useReducer, ReactNode } from "react";

// ==================== 主题 Context ====================
type ThemeMode = "light" | "dark";
interface ThemeContextType {
  mode: ThemeMode;
  primaryColor: string;
  toggleTheme: () => void;
  setPrimaryColor: (color: string) => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ==================== 认证 Context ====================
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==================== Todo Context (useReducer) ====================
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}
type TodoAction =
  | { type: "ADD"; text: string }
  | { type: "TOGGLE"; id: string }
  | { type: "DELETE"; id: string }
  | { type: "CLEAR_COMPLETED" };

interface TodoContextType {
  todos: Todo[];
  dispatch: React.Dispatch<TodoAction>;
}
const TodoContext = createContext<TodoContextType | undefined>(undefined);
\`\`\`

### useReducer 结合 Context 实现 Todo 全局状态

useReducer 适合管理复杂的状态逻辑，将状态更新逻辑集中在 reducer 函数中，再通过 Context 分发到整个应用：

\`\`\`tsx
// Todo reducer 函数 - 集中管理所有状态更新
function todoReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case "ADD":
      return [
        ...state,
        {
          id: Date.now().toString(),
          text: action.text,
          completed: false,
          createdAt: Date.now(),
        },
      ];
    case "TOGGLE":
      return state.map((todo) =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      );
    case "DELETE":
      return state.filter((todo) => todo.id !== action.id);
    case "CLEAR_COMPLETED":
      return state.filter((todo) => !todo.completed);
    default:
      return state;
  }
}

// 统一的 AppProvider - 组合所有 Context Provider
interface AppProviderProps {
  children: ReactNode;
}
export function AppProvider({ children }: AppProviderProps) {
  // 主题状态
  const [themeState, setThemeState] = useReducer(
    (s: { mode: ThemeMode; primaryColor: string }, a: Partial<{ mode: ThemeMode; primaryColor: string }>) => ({ ...s, ...a }),
    { mode: "light", primaryColor: "#1890ff" }
  );

  // 认证状态
  const [authState, setAuthState] = useReducer(
    (s: { user: User | null; isLoading: boolean }, a: Partial<{ user: User | null; isLoading: boolean }>) => ({ ...s, ...a }),
    { user: null, isLoading: false }
  );

  // Todo 状态 - 使用专门的 reducer
  const [todos, dispatch] = useReducer(todoReducer, []);

  // useMemo 稳定 value 引用 - 避免无关重渲染！
  const themeValue = useMemo<ThemeContextType>(
    () => ({
      mode: themeState.mode,
      primaryColor: themeState.primaryColor,
      toggleTheme: () => setThemeState({ mode: themeState.mode === "light" ? "dark" : "light" }),
      setPrimaryColor: (color) => setThemeState({ primaryColor: color }),
    }),
    [themeState]
  );

  const authValue = useMemo<AuthContextType>(
    () => ({
      user: authState.user,
      isLoading: authState.isLoading,
      login: async (email: string, password: string) => {
        setAuthState({ isLoading: true });
        // 模拟 API 调用
        await new Promise((r) => setTimeout(r, 1000));
        setAuthState({
          user: { id: "1", name: "用户", email },
          isLoading: false,
        });
      },
      logout: () => setAuthState({ user: null }),
    }),
    [authState]
  );

  const todoValue = useMemo<TodoContextType>(() => ({ todos, dispatch }), [todos]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <AuthContext.Provider value={authValue}>
        <TodoContext.Provider value={todoValue}>
          {children}
        </TodoContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
\`\`\`

### 自定义消费 Hook 与性能优化

为每个 Context 创建自定义 Hook，既方便使用又能处理未找到 Provider 的错误；同时要注意 Context 的性能陷阱——**所有消费者都会在 value 变化时重渲染**：

\`\`\`tsx
// 自定义消费 Hook - 带错误检查
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within AppProvider");
  return ctx;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AppProvider");
  return ctx;
}

export function useTodos() {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodos must be used within TodoProvider");
  return ctx;
}

// ==================== 使用示例 ====================
function ThemeToggle() {
  const { mode, toggleTheme } = useTheme();
  console.log("ThemeToggle 渲染"); // 只有 theme 变化时才会打印
  return (
    <button onClick={toggleTheme}>
      {mode === "light" ? "🌙 深色" : "☀️ 浅色"}
    </button>
  );
}

function TodoList() {
  const { todos, dispatch } = useTodos();
  console.log("TodoList 渲染"); // 只有 todos 变化时才会打印
  return (
    <div>
      {todos.map((todo) => (
        <div key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => dispatch({ type: "TOGGLE", id: todo.id })}
          />
          <span style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
            {todo.text}
          </span>
          <button onClick={() => dispatch({ type: "DELETE", id: todo.id })}>
            删除
          </button>
        </div>
      ))}
    </div>
  );
}

function UserInfo() {
  const { user, logout } = useAuth();
  console.log("UserInfo 渲染"); // 只有 auth 状态变化时才会打印
  if (!user) return <div>未登录</div>;
  return (
    <div>
      <span>欢迎, {user.name}</span>
      <button onClick={logout}>退出登录</button>
    </div>
  );
}
\`\`\`

### 综合 Demo：主题切换 + 登录 + Todo

最后在根组件包裹 AppProvider，实现完整的全局状态管理：

\`\`\`tsx
import { useState, memo } from "react";

// memo 包装子组件 - 进一步减少重渲染
const MemoThemeToggle = memo(ThemeToggle);
const MemoTodoList = memo(TodoList);
const MemoUserInfo = memo(UserInfo);

function AddTodo() {
  const { dispatch } = useTodos();
  const [text, setText] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      dispatch({ type: "ADD", text: text.trim() });
      setText("");
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="添加待办..."
      />
      <button type="submit">添加</button>
    </form>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div style={{ padding: 20 }}>
        <header style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          <MemoThemeToggle />
          <MemoUserInfo />
        </header>
        <main>
          <h2>待办事项</h2>
          <AddTodo />
          <MemoTodoList />
        </main>
      </div>
    </AppProvider>
  );
}
\`\`\`

### Context 性能陷阱与最佳实践

1. **拆分 Context 按更新频率**：主题很少变、Todo 经常变、用户信息偶尔变——拆成三个 Context 而不是一个大 Context
2. **useMemo 稳定 value**：每次 Provider 渲染都创建新对象会导致所有消费者重渲染，必须用 useMemo
3. **memo 包装消费者组件**：配合 React.memo 进一步阻止不必要的重渲染
4. **不要滥用 Context**：仅在状态真正需要跨多层组件共享时使用，局部状态用 useState/useReducer 即可
\`,
  },
  {
    id: "tsrx-zustand",
    group: "状态管理篇",
    icon: "🐻",
    title: "Zustand轻量状态管理",
    content: `## Zustand轻量状态管理

Zustand（德语"状态"）是一个极其轻量（~1KB）、简单直接的 React 状态管理库。它没有 Provider 嵌套、没有繁琐的样板代码，API 简洁优雅，同时支持中间件扩展，是中小型项目的绝佳选择。

### Zustand 基础：create 定义 Store 与 TS 类型

使用 zustand 只需一个 create 函数即可创建全局 store，TypeScript 类型定义非常自然：

\`\`\`tsx
import { create } from "zustand";

// 定义 Store 的类型：State + Actions
interface BearStore {
  // State
  bears: number;
  color: string;
  // Actions
  increasePopulation: () => void;
  decreasePopulation: () => void;
  removeAllBears: () => void;
  setColor: (color: string) => void;
}

// 创建 store - create<T>() 传入初始化函数
// set 用于更新状态，get 用于获取当前状态
const useBearStore = create<BearStore>()((set, get) => ({
  bears: 0,
  color: "brown",

  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  decreasePopulation: () => set((state) => ({ bears: Math.max(0, state.bears - 1) })),
  removeAllBears: () => set({ bears: 0 }),
  setColor: (color) => set({ color }),
}));

// 在组件中使用 - 直接选择需要的状态！
function BearCounter() {
  // 只订阅 bears - 只有 bears 变化时才重渲染
  const bears = useBearStore((s) => s.bears);
  return <h1>🐻 {bears} around here...</h1>;
}

function BearControls() {
  // 可以同时选择多个字段，也可以直接取 actions
  const increasePopulation = useBearStore((s) => s.increasePopulation);
  const removeAllBears = useBearStore((s) => s.removeAllBears);
  return (
    <div>
      <button onClick={increasePopulation}>增加一只熊</button>
      <button onClick={removeAllBears}>清除所有熊</button>
    </div>
  );
}
\`\`\`

### 中间件：devtools、persist、immer

Zustand 中间件让功能扩展变得简单，常用的三个中间件是 devtools（调试）、persist（持久化）、immer（可变写法）：

\`\`\`tsx
import { create } from "zustand";
import { devtools, persist, immer } from "zustand/middleware";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoStore {
  todos: Todo[];
  filter: "all" | "active" | "completed";
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  setFilter: (filter: "all" | "active" | "completed") => void;
  clearCompleted: () => void;
}

// 中间件组合：persist(localStorage) + devtools(Redux DevTools)
const useTodoStore = create<TodoStore>()(
  devtools(
    persist(
      (set, get) => ({
        todos: [],
        filter: "all",

        addTodo: (text) =>
          set(
            (state) => ({
              todos: [
                ...state.todos,
                { id: Date.now().toString(), text, completed: false },
              ],
            }),
            false, // 不是替换整个状态
            "todo/add" // action type for devtools
          ),

        toggleTodo: (id) =>
          set(
            (state) => ({
              todos: state.todos.map((t) =>
                t.id === id ? { ...t, completed: !t.completed } : t
              ),
            }),
            false,
            "todo/toggle"
          ),

        deleteTodo: (id) =>
          set(
            (state) => ({ todos: state.todos.filter((t) => t.id !== id) }),
            false,
            "todo/delete"
          ),

        setFilter: (filter) => set({ filter }, false, "todo/setFilter"),

        clearCompleted: () =>
          set(
            (state) => ({ todos: state.todos.filter((t) => !t.completed) }),
            false,
            "todo/clearCompleted"
          ),
      }),
      {
        name: "todo-storage", // localStorage key
        // partialize - 选择要持久化的字段
        partialize: (state) => ({ todos: state.todos }), // 只持久化 todos，不持久化 filter
      }
    ),
    { name: "TodoStore" } // devtools store name
  )
);

// ========== 使用 immer 中间件 - 可以直接 mutate state ==========
interface ImmerTodoStore {
  todos: Todo[];
  addTodoImmer: (text: string) => void;
  toggleTodoImmer: (id: string) => void;
}

const useImmerTodoStore = create<ImmerTodoStore>()(
  immer((set) => ({
    todos: [],
    addTodoImmer: (text) =>
      set((state) => {
        // 直接 mutate！immer 会处理不可变更新
        state.todos.push({ id: Date.now().toString(), text, completed: false });
      }),
    toggleTodoImmer: (id) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id);
        if (todo) todo.completed = !todo.completed;
      }),
  }))
);
\`\`\`

### 切片模式（Slices）拆分大型 Store + subscribe 监听

当 store 变大时，可以用切片模式按功能拆分成多个小的 slice 再组合；同时 subscribe 可以监听状态变化做副作用：

\`\`\`tsx
import { create, StateCreator } from "zustand";

// ========== 切片1: Auth 切片 ==========
interface User {
  id: string;
  name: string;
  role: "admin" | "user";
}
interface AuthSlice {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
const createAuthSlice: StateCreator<
  AuthSlice & CartSlice & SettingsSlice,
  [],
  [],
  AuthSlice
> = (set) => ({
  user: null,
  login: async (email, password) => {
    await new Promise((r) => setTimeout(r, 500));
    set({ user: { id: "1", name: "张三", role: "user" } });
  },
  logout: () => set({ user: null }),
});

// ========== 切片2: Cart 切片 ==========
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
interface CartSlice {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}
const createCartSlice: StateCreator<
  AuthSlice & CartSlice & SettingsSlice,
  [],
  [],
  CartSlice
> = (set, get) => ({
  items: [],
  addItem: (item) => {
    const existing = get().items.find((i) => i.id === item.id);
    if (existing) {
      set((state) => ({
        items: state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      }));
    } else {
      set((state) => ({ items: [...state.items, { ...item, quantity: 1 }] }));
    }
  },
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    })),
  clearCart: () => set({ items: [] }),
});

// ========== 切片3: Settings 切片 ==========
interface SettingsSlice {
  theme: "light" | "dark";
  language: "zh" | "en";
  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (lang: "zh" | "en") => void;
}
const createSettingsSlice: StateCreator<
  AuthSlice & CartSlice & SettingsSlice,
  [],
  [],
  SettingsSlice
> = (set) => ({
  theme: "light",
  language: "zh",
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
});

// ========== 组合所有切片 ==========
const useAppStore = create<AuthSlice & CartSlice & SettingsSlice>()((...a) => ({
  ...createAuthSlice(...a),
  ...createCartSlice(...a),
  ...createSettingsSlice(...a),
}));

// ========== subscribe 监听状态变化 ==========
// 可以在组件外使用，监听特定变化
const unsubscribe = useAppStore.subscribe(
  (state) => state.user,
  (user, prevUser) => {
    console.log("用户状态变化:", prevUser, "→", user);
    if (user) {
      console.log("用户登录了，加载购物车...");
    } else {
      console.log("用户退出了，清空购物车...");
      useAppStore.getState().clearCart();
    }
  }
);
// 需要时取消监听: unsubscribe()
\`\`\`

### Selectors 与 shallow 比较优化性能

合理使用 selector 和 useShallow 可以避免不必要的重渲染：

\`\`\`tsx
import { useShallow } from "zustand/react/shallow";

// ❌ 不好的写法：每次都返回新对象，即使字段值没变也会重渲染
function BadCartBadge() {
  const { items, user } = useAppStore((s) => ({
    items: s.items,
    user: s.user,
  }));
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return <div>购物车({count}) {user?.name}</div>;
}

// ✅ 好的写法1：分别选择单个字段
function GoodCartBadge() {
  const items = useAppStore((s) => s.items);
  const user = useAppStore((s) => s.user);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return <div>购物车({count}) {user?.name}</div>;
}

// ✅ 好的写法2：需要多个字段时用 useShallow 浅比较
function CartInfo() {
  // useShallow 会浅比较返回的对象，只有字段真正变化时才重渲染
  const { items, theme } = useAppStore(
    useShallow((s) => ({ items: s.items, theme: s.theme }))
  );
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return (
    <div>
      <p>主题: {theme}</p>
      <p>总价: ¥{total.toFixed(2)}</p>
    </div>
  );
}

// Zustand vs Context vs Redux 选型建议
// ==========================================
// | 方案        | 包大小 | 学习成本 | 样板代码 | 适用场景           |
// |------------|--------|----------|----------|--------------------|
// | Context    | 0KB    | 低       | 中       | 低频更新的全局状态  |
// | Zustand    | ~1KB   | 极低     | 极少     | 中小型应用首选      |
// | Redux/RTK  | ~12KB  | 中高     | 多       | 大型应用、团队协作  |
\`\`\`
\`,
  },
  {
    id: "tsrx-rtk",
    group: "状态管理篇",
    icon: "🔴",
    title: "Redux Toolkit(RTK)完整指南",
    content: `## Redux Toolkit(RTK)完整指南

Redux Toolkit（RTK）是 Redux 官方推荐的工具集，它封装了 Redux 核心逻辑，解决了原生 Redux 样板代码过多、配置繁琐的问题。内置 Immer 支持可变写法、RTK Query 数据请求缓存、createAsyncThunk 异步处理等，是大型 React 应用的成熟状态管理方案。

### RTK 基础配置：createSlice + configureStore

首先安装依赖：\`npm install @reduxjs/toolkit react-redux\`，然后开始配置 store：

\`\`\`tsx
import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";

// ==================== Counter Slice 示例 ====================
interface CounterState {
  value: number;
  status: "idle" | "loading" | "failed";
}
const initialState: CounterState = {
  value: 0,
  status: "idle",
};

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    // 内置 Immer - 可以直接 mutate state！
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    reset: (state) => {
      state.value = 0;
    },
  },
});

// 导出 actions
export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;

// ==================== Todo Slice 示例 ====================
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}
interface TodoState {
  items: Todo[];
  filter: "all" | "active" | "completed";
}
const todoInitialState: TodoState = {
  items: [],
  filter: "all",
};

const todoSlice = createSlice({
  name: "todos",
  initialState: todoInitialState,
  reducers: {
    todoAdded: {
      reducer: (state, action: PayloadAction<Todo>) => {
        state.items.push(action.payload);
      },
      // prepare callback - 统一构造 payload
      prepare: (text: string) => ({
        payload: {
          id: Date.now().toString(),
          text,
          completed: false,
        },
      }),
    },
    todoToggled: (state, action: PayloadAction<string>) => {
      const todo = state.items.find((t) => t.id === action.payload);
      if (todo) todo.completed = !todo.completed;
    },
    todoDeleted: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    filterChanged: (state, action: PayloadAction<"all" | "active" | "completed">) => {
      state.filter = action.payload;
    },
    completedCleared: (state) => {
      state.items = state.items.filter((t) => !t.completed);
    },
  },
});

export const { todoAdded, todoToggled, todoDeleted, filterChanged, completedCleared } = todoSlice.actions;

// ==================== 配置 Store ====================
export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    todos: todoSlice.reducer,
  },
  // 可以添加中间件
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
    // .concat(logger) // 自定义日志中间件
});

// ==================== 类型化 Hooks ====================
// 这是关键！推导 RootState 和 AppDispatch 类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 自定义类型安全的 hooks - 在组件中用这两个代替原生 useDispatch/useSelector
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
\`\`\`

### Provider 注入与组件中使用

在根组件用 Provider 包裹整个应用，然后在组件中使用类型化 hooks：

\`\`\`tsx
import { Provider } from "react-redux";
import { store } from "./store";

// 根组件
function RootApp() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

// ==================== Counter 组件 ====================
function Counter() {
  const count = useAppSelector((s) => s.counter.value);
  const status = useAppSelector((s) => s.counter.status);
  const dispatch = useAppDispatch();

  return (
    <div>
      <h2>计数: {count}</h2>
      <p>状态: {status}</p>
      <button onClick={() => dispatch(increment())}>+1</button>
      <button onClick={() => dispatch(decrement())}>-1</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
      <button onClick={() => dispatch(reset())}>重置</button>
    </div>
  );
}

// ==================== TodoList 组件 ====================
function TodoList() {
  const { items, filter } = useAppSelector((s) => s.todos);
  const dispatch = useAppDispatch();
  const [input, setInput] = useState("");

  const filteredTodos = items.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      dispatch(todoAdded(input.trim()));
      setInput("");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="添加待办..." />
        <button type="submit">添加</button>
      </form>
      <div>
        {(["all", "active", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => dispatch(filterChanged(f))}
            style={{ fontWeight: filter === f ? "bold" : "normal" }}
          >
            {f === "all" ? "全部" : f === "active" ? "未完成" : "已完成"}
          </button>
        ))}
      </div>
      <ul>
        {filteredTodos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch(todoToggled(todo.id))}
            />
            <span style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch(todoDeleted(todo.id))}>删除</button>
          </li>
        ))}
      </ul>
      <button onClick={() => dispatch(completedCleared())}>清除已完成</button>
    </div>
  );
}
\`\`\`

### createAsyncThunk 异步请求处理

createAsyncThunk 专门处理异步逻辑（如 API 请求），自动生成 pending/fulfilled/rejected 三个 action 类型：

\`\`\`tsx
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface Post {
  id: number;
  title: string;
  body: string;
}
interface PostsState {
  items: Post[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// createAsyncThunk 接受两个参数: action type 前缀 + 异步函数
export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts");
      if (!res.ok) throw new Error("请求失败");
      const data = await res.json();
      return data as Post[];
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const addNewPost = createAsyncThunk(
  "posts/addNewPost",
  async (newPost: { title: string; body: string }, { rejectWithValue }) => {
    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPost, userId: 1 }),
      });
      return await res.json() as Post;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState: { items: [], status: "idle", error: null } as PostsState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchPosts
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // addNewPost
      .addCase(addNewPost.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

// 在组件中使用
function PostsList() {
  const { items: posts, status, error } = useAppSelector((s) => s.posts);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPosts());
    }
  }, [status, dispatch]);

  if (status === "loading") return <div>加载中...</div>;
  if (status === "failed") return <div>错误: {error}</div>;

  return (
    <div>
      {posts.slice(0, 10).map((post) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </div>
      ))}
    </div>
  );
}
\`\`\`

### RTK Query 数据请求缓存

RTK Query 是 RTK 内置的数据获取和缓存工具，自动处理缓存、标签失效、轮询等，类似 React Query/SWR：

\`\`\`tsx
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// 创建 API service
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://jsonplaceholder.typicode.com",
  }),
  // 标签类型 - 用于缓存失效
  tagTypes: ["Post", "User"],
  endpoints: (builder) => ({
    // Query - 获取数据，useGetPostsQuery 自动生成
    getPosts: builder.query<Post[], void>({
      query: () => "/posts",
      providesTags: ["Post"], // 数据带 Post 标签
    }),
    getPost: builder.query<Post, number>({
      query: (id) => \`/posts/\${id}\`,
      providesTags: (result, error, id) => [{ type: "Post", id }],
    }),
    getUsers: builder.query<User[], void>({
      query: () => "/users",
      providesTags: ["User"],
    }),
    // Mutation - 修改数据
    addPost: builder.mutation<Post, Partial<Post>>({
      query: (body) => ({
        url: "/posts",
        method: "POST",
        body,
      }),
      // 失效 Post 标签 - 自动重新获取
      invalidatesTags: ["Post"],
    }),
    updatePost: builder.mutation<Post, Partial<Post> & { id: number }>({
      query: ({ id, ...body }) => ({
        url: \`/posts/\${id}\`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Post", id }, "Post"],
    }),
    deletePost: builder.mutation<void, number>({
      query: (id) => ({
        url: \`/posts/\${id}\`,
        method: "DELETE",
      }),
      invalidatesTags: ["Post"],
    }),
  }),
});

// 自动生成 hooks - 命名规则: use{EndpointName}Query / use{EndpointName}Mutation
export const {
  useGetPostsQuery,
  useGetPostQuery,
  useGetUsersQuery,
  useAddPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = apiSlice;

// 在 store 中添加 middleware 和 reducer
export const rtkStore = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    todos: todoSlice.reducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// 在组件中使用 RTK Query
function RTKPostsDemo() {
  // 自动获取数据！data/isLoading/isError 全部给你
  const { data: posts, isLoading, isError } = useGetPostsQuery();
  const [addPost] = useAddPostMutation();

  if (isLoading) return <div>加载中...</div>;
  if (isError) return <div>加载失败</div>;

  return (
    <div>
      <button
        onClick={async () => {
          await addPost({ title: "新文章", body: "内容...", userId: 1 });
          // 添加后标签自动失效，posts 自动刷新！
        }}
      >
        添加文章
      </button>
      {posts?.slice(0, 5).map((post) => (
        <div key={post.id}>
          <h4>{post.title}</h4>
        </div>
      ))}
    </div>
  );
}
\`\`\`

### createEntityAdapter 实体 CRUD 标准化

对于列表类型的数据，createEntityAdapter 提供标准化的状态结构和预置的 CRUD reducer：

\`\`\`tsx
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

// 定义实体
interface User {
  id: string;
  name: string;
  email: string;
}

// 创建 adapter - 按 id 存储，支持排序
const usersAdapter = createEntityAdapter<User>({
  sortComparer: (a, b) => a.name.localeCompare(b.name), // 按名字排序
});

// 初始状态是 { ids: [], entities: {} } 标准化结构
const usersSlice = createSlice({
  name: "users",
  initialState: usersAdapter.getInitialState({
    // 可以加额外状态
    loadingStatus: "idle" as "idle" | "loading" | "succeeded" | "failed",
  }),
  reducers: {
    userAdded: usersAdapter.addOne,
    userReceived: (state, action: PayloadAction<User>) => {
      usersAdapter.setOne(state, action.payload);
    },
    usersReceived(state, action: PayloadAction<User[]>) {
      usersAdapter.setAll(state, action.payload);
    },
    userUpdated: usersAdapter.updateOne, // { id, changes: { ... } }
    userDeleted: usersAdapter.removeOne,
    manyUsersDeleted: usersAdapter.removeMany, // id[]
    allUsersRemoved: usersAdapter.removeAll,
    usersUpserted: usersAdapter.upsertMany, // 存在则更新，不存在则添加
  },
});

// adapter 自动生成 selectors
export const {
  selectAll: selectAllUsers, // 所有用户数组
  selectById: selectUserById, // 按 id 选单个用户
  selectIds: selectUserIds, // id 数组
  selectTotal: selectTotalUsers, // 总数
  selectEntities: selectUserEntities, // { [id]: entity } 对象
} = usersAdapter.getSelectors<RootState>((state) => state.users);

// 在组件中使用
function UsersList() {
  const users = useAppSelector(selectAllUsers);
  const total = useAppSelector(selectTotalUsers);
  return (
    <div>
      <p>共 {total} 个用户</p>
      {users.map((user) => (
        <div key={user.id}>{user.name} - {user.email}</div>
      ))}
    </div>
  );
}
\`\`\`
\`,
  },
  {
    id: "tsrx-router-basic",
    group: "路由篇",
    icon: "🧭",
    title: "React Router v6基础",
    content: `## React Router v6基础

React Router 是 React 生态中最主流的路由库，v6 版本经过全面重构，API 更简洁、功能更强大。本章节我们将学习 React Router v6 的核心概念和基础用法。

### 安装与路由模式选择

首先安装：\`npm install react-router-dom\`。React Router 提供两种路由模式：BrowserRouter（history 模式，URL 更美观但需要服务端配置）和 HashRouter（hash 模式，URL 带 # 但无需服务端配置）：

\`\`\`tsx
import { BrowserRouter, HashRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import App from "./App";

// ========== 方式1: BrowserRouter - history 模式 (推荐) ==========
// URL 示例: http://localhost:3000/about
// 需要服务端配置: 所有路径都返回 index.html
ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// ========== 方式2: HashRouter - hash 模式 ==========
// URL 示例: http://localhost:3000/#/about
// 适合静态文件部署，无需服务端配置
// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <HashRouter>
//     <App />
//   </HashRouter>
// );
\`\`\`

### Routes + Route 基本路由配置 + Link/NavLink 导航

用 Routes 包裹多个 Route，每个 Route 定义 path 和 element；用 Link 或 NavLink 做导航：

\`\`\`tsx
import { Routes, Route, Link, NavLink } from "react-router-dom";

// 页面组件
function Home() {
  return (
    <div>
      <h1>🏠 首页</h1>
      <p>欢迎来到首页！</p>
    </div>
  );
}

function About() {
  return (
    <div>
      <h1>ℹ️ 关于我们</h1>
      <p>这是关于页面。</p>
    </div>
  );
}

function Contact() {
  return (
    <div>
      <h1>📞 联系我们</h1>
      <p>邮箱: contact@example.com</p>
    </div>
  );
}

function NotFound() {
  return (
    <div>
      <h1>404 - 页面未找到</h1>
      <p>您访问的页面不存在。</p>
    </div>
  );
}

// 导航组件 - NavLink 会自动给当前路由添加 active 类名
function Navbar() {
  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    fontWeight: isActive ? "bold" : "normal",
    color: isActive ? "#1890ff" : "#333",
    textDecoration: "none",
    marginRight: 16,
  });

  return (
    <nav style={{ padding: 16, borderBottom: "1px solid #eee" }}>
      <NavLink to="/" style={navLinkStyle} end>
        🏠 首页
      </NavLink>
      <NavLink to="/about" style={navLinkStyle}>
        ℹ️ 关于
      </NavLink>
      <NavLink to="/contact" style={navLinkStyle}>
        📞 联系
      </NavLink>
      {/* Link 是普通导航链接，没有 active 状态 */}
      <Link to="/" style={{ marginLeft: 20 }}>回到首页</Link>
    </nav>
  );
}

function App() {
  return (
    <div>
      <Navbar />
      <main style={{ padding: 20 }}>
        <Routes>
          {/* index 路由 - 父路径的默认子路由 */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* 404 通配路由 - 放在最后 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
\`\`\`

### 嵌套路由与 Outlet + index 路由

嵌套路由是 React Router v6 的核心特性，可以通过 Outlet 渲染子路由，实现布局共享：

\`\`\`tsx
import { Routes, Route, Outlet, NavLink } from "react-router-dom";

// 布局组件 - Outlet 是子路由渲染的位置
function Layout() {
  return (
    <div>
      {/* 顶部导航栏 */}
      <header style={{ background: "#001529", color: "white", padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", height: 60 }}>
          <h1 style={{ margin: 0, marginRight: 40, fontSize: 20 }}>🐻 熊管理系统</h1>
          <nav>
            <NavLink
              to="/"
              end
              style={({ isActive }) => ({
                color: isActive ? "#1890ff" : "white",
                padding: "0 16px",
                textDecoration: "none",
              })}
            >
              仪表盘
            </NavLink>
            <NavLink
              to="/users"
              style={({ isActive }) => ({
                color: isActive ? "#1890ff" : "white",
                padding: "0 16px",
                textDecoration: "none",
              })}
            >
              用户管理
            </NavLink>
            <NavLink
              to="/settings"
              style={({ isActive }) => ({
                color: isActive ? "#1890ff" : "white",
                padding: "0 16px",
                textDecoration: "none",
              })}
            >
              系统设置
            </NavLink>
          </nav>
        </div>
      </header>
      {/* 侧边栏 + 内容区 */}
      <div style={{ display: "flex" }}>
        <aside style={{ width: 200, background: "#f0f2f5", padding: 20, minHeight: "calc(100vh - 60px)" }}>
          <p>侧边栏菜单</p>
        </aside>
        {/* Outlet - 子路由在这里渲染！ */}
        <main style={{ flex: 1, padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// 子页面
function Dashboard() {
  return (
    <div>
      <h2>📊 仪表盘</h2>
      <p>欢迎使用管理系统！</p>
    </div>
  );
}

function UsersLayout() {
  return (
    <div>
      <h2>👥 用户管理</h2>
      <div style={{ marginBottom: 16 }}>
        <NavLink to="/users" end>用户列表</NavLink>
        {" | "}
        <NavLink to="/users/new">新增用户</NavLink>
      </div>
      {/* 嵌套 Outlet - 用户子页面 */}
      <Outlet />
    </div>
  );
}

function UsersList() {
  return (
    <div>
      <h3>用户列表</h3>
      <p>这里显示所有用户...</p>
    </div>
  );
}

function NewUser() {
  return (
    <div>
      <h3>新增用户</h3>
      <p>用户创建表单...</p>
    </div>
  );
}

function UserProfile() {
  return (
    <div>
      <h3>个人中心</h3>
      <p>用户个人信息...</p>
    </div>
  );
}

function Settings() {
  return (
    <div>
      <h2>⚙️ 系统设置</h2>
      <p>系统配置页面...</p>
    </div>
  );
}

// 嵌套路由配置
function NestedRoutesApp() {
  return (
    <Routes>
      {/* 父路由使用 Layout */}
      <Route path="/" element={<Layout />}>
        {/* index 路由 - / 路径默认显示 Dashboard */}
        <Route index element={<Dashboard />} />
        {/* 用户模块 - 还有自己的嵌套布局 */}
        <Route path="users" element={<UsersLayout />}>
          <Route index element={<UsersList />} />
          <Route path="new" element={<NewUser />} />
        </Route>
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>
    </Routes>
  );
}
\`\`\`

### 动态路由参数 + useParams + useNavigate 编程式跳转

动态路由用 :paramName 语法，通过 useParams 获取参数；useNavigate 实现编程式跳转：

\`\`\`tsx
import { Routes, Route, Link, useParams, useNavigate, useLocation } from "react-router-dom";

// 模拟用户数据
const users = [
  { id: "1", name: "张三", email: "zhangsan@example.com", role: "管理员" },
  { id: "2", name: "李四", email: "lisi@example.com", role: "编辑" },
  { id: "3", name: "王五", email: "wangwu@example.com", role: "普通用户" },
];

// 用户列表页
function DynamicUserList() {
  const navigate = useNavigate();
  return (
    <div>
      <h2>用户列表</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id} style={{ marginBottom: 8 }}>
            <Link to={\`/dynamic-users/\${user.id}\`}>{user.name}</Link>
            <button
              onClick={() => navigate(\`/dynamic-users/\${user.id}\`)}
              style={{ marginLeft: 10 }}
            >
              查看详情
            </button>
            {/* 带 state 的编程式跳转 */}
            <button
              onClick={() =>
                navigate(\`/dynamic-users/\${user.id}\`, {
                  state: { from: "list", timestamp: Date.now() },
                })
              }
              style={{ marginLeft: 10 }}
            >
              查看(带状态)
            </button>
          </li>
        ))}
      </ul>
      {/* 跳转并替换历史记录（不留下回退记录） */}
      <button onClick={() => navigate("/", { replace: true })}>
        返回首页(替换历史)
      </button>
    </div>
  );
}

// 用户详情页 - 动态路由参数
function UserDetailPage() {
  // useParams 获取动态路由参数
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  // useLocation 获取当前 location 信息，包括 state
  const location = useLocation();
  const state = location.state as { from?: string; timestamp?: number } | null;

  const user = users.find((u) => u.id === userId);

  if (!user) {
    return (
      <div>
        <h2>用户不存在</h2>
        <button onClick={() => navigate(-1)}>返回上一页</button>
      </div>
    );
  }

  return (
    <div>
      <h2>用户详情: {user.name}</h2>
      {state?.from && <p>来自: {state.from} 页面</p>}
      <ul>
        <li>ID: {user.id}</li>
        <li>姓名: {user.name}</li>
        <li>邮箱: {user.email}</li>
        <li>角色: {user.role}</li>
      </ul>
      <div style={{ marginTop: 20 }}>
        {/* navigate(-1) 后退一页 */}
        <button onClick={() => navigate(-1)}>← 返回</button>
        <button onClick={() => navigate(1)} style={{ marginLeft: 10 }}>
          前进 →
        </button>
        <button onClick={() => navigate("/dynamic-users")} style={{ marginLeft: 10 }}>
          返回列表
        </button>
      </div>
    </div>
  );
}

function DynamicRoutesDemo() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dynamic-users" element={<DynamicUserList />} />
      {/* 动态路由: :userId 是参数 */}
      <Route path="/dynamic-users/:userId" element={<UserDetailPage />} />
    </Routes>
  );
}
\`\`\`

### 综合示例：完整路由配置

把所有知识点组合起来的完整路由配置：

\`\`\`tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

function FullApp() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 公开布局 */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* 需要登录的后台布局 - 下一章会讲路由守卫 */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:userId" element={<UserDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

// 占位组件（实际项目中是真实页面）
function PublicLayout() { return <div><Outlet /></div>; }
function LoginPage() { return <div>登录页</div>; }
function RegisterPage() { return <div>注册页</div>; }
function DashboardLayout() { return <div><Outlet /></div>; }
function DashboardHome() { return <div>控制台首页</div>; }
function ProfilePage() { return <div>个人资料</div>; }
function UsersPage() { return <div>用户管理</div>; }
function SettingsPage() { return <div>设置</div>; }
\`\`\`
\`,
  },
  {
    id: "tsrx-router-data",
    group: "路由篇",
    icon: "📊",
    title: "React Router数据加载与loader",
    content: `## React Router数据加载与loader

React Router v6.4+ 引入了全新的数据路由（Data Router）API，提供 loader 数据预加载、action 表单处理、defer 延迟加载、错误处理等强大功能，让数据获取与路由深度整合。

### createBrowserRouter + RouterProvider 配置路由数组

用 createBrowserRouter 创建路由配置数组（替代 JSX Routes 写法），通过 RouterProvider 注入：

\`\`\`tsx
import {
  createBrowserRouter,
  RouterProvider,
  useLoaderData,
  Link,
  Outlet,
} from "react-router-dom";

// 模拟数据
interface Post {
  id: number;
  title: string;
  body: string;
  author: string;
}

const posts: Post[] = [
  { id: 1, title: "React 入门指南", body: "React 基础内容...", author: "张三" },
  { id: 2, title: "TypeScript 实战", body: "TS 高级类型...", author: "李四" },
  { id: 3, title: "React Router 6 解析", body: "新路由 API...", author: "王五" },
];

// 页面组件
function RootLayout() {
  return (
    <div>
      <nav style={{ padding: 16, background: "#f5f5f5" }}>
        <Link to="/" style={{ marginRight: 16 }}>🏠 首页</Link>
        <Link to="/posts" style={{ marginRight: 16 }}>📝 文章列表</Link>
        <Link to="/about">ℹ️ 关于</Link>
      </nav>
      <main style={{ padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}

function HomePage() {
  return (
    <div>
      <h1>🏠 首页</h1>
      <p>欢迎访问！使用数据路由后，数据在渲染前就已加载完成。</p>
    </div>
  );
}

function AboutPage() {
  return (
    <div>
      <h1>ℹ️ 关于</h1>
      <p>这是一个 React Router 数据路由示例。</p>
    </div>
  );
}

// ========== loader 函数 - 在路由渲染前加载数据 ==========
// 文章列表 loader
async function postsLoader(): Promise<Post[]> {
  // 模拟 API 请求延迟
  await new Promise((r) => setTimeout(r, 500));
  return posts;
}

// 文章列表页 - 通过 useLoaderData 获取 loader 返回的数据
function PostsPage() {
  // loader 返回的数据直接可用！不需要 useEffect + useState
  const posts = useLoaderData() as Post[];
  return (
    <div>
      <h1>📝 文章列表</h1>
      <p>共 {posts.length} 篇文章（数据由 loader 预加载）</p>
      <ul>
        {posts.map((post) => (
          <li key={post.id} style={{ marginBottom: 12 }}>
            <Link to={\`/posts/\${post.id}\`}>
              <h3>{post.title}</h3>
            </Link>
            <p>作者: {post.author}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 单篇文章 loader - 接收 params 参数
async function postLoader({ params }: { params: { postId: string } }): Promise<Post> {
  await new Promise((r) => setTimeout(r, 300));
  const post = posts.find((p) => p.id === Number(params.postId));
  if (!post) {
    throw new Response("文章不存在", { status: 404 });
  }
  return post;
}

// 单篇文章详情页
function PostDetailPage() {
  const post = useLoaderData() as Post;
  return (
    <div>
      <Link to="/posts">← 返回列表</Link>
      <h1>{post.title}</h1>
      <p>作者: {post.author}</p>
      <div style={{ marginTop: 20, lineHeight: 1.8 }}>{post.body}</div>
    </div>
  );
}

// ========== 配置路由数组 ==========
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    // 可以给所有子路由共享 loader 数据
    // loader: rootLoader,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      {
        path: "posts",
        element: <PostsPage />,
        loader: postsLoader, // 关联 loader
      },
      {
        path: "posts/:postId",
        element: <PostDetailPage />,
        loader: postLoader,
      },
    ],
  },
]);

// 入口组件
export default function DataRouterApp() {
  return <RouterProvider router={router} />;
}
\`\`\`

### Form + action 处理表单提交 + useActionData

action 用于处理表单提交等写操作，配合 Form 组件自动调用，无需手动写 onSubmit：

\`\`\`tsx
import {
  createBrowserRouter,
  RouterProvider,
  Form,
  useActionData,
  useLoaderData,
  redirect,
  json,
} from "react-router-dom";

// 类型
interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

// 模拟数据库
let contactsDB: Contact[] = [];

// Loader - 获取已提交的留言
async function contactsLoader() {
  return [...contactsDB].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Action - 处理表单提交
async function contactAction({ request }: { request: Request }) {
  // Form 自动提交表单数据，通过 request.formData() 获取
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  // 服务端验证
  const errors: Record<string, string> = {};
  if (!name || name.length < 2) errors.name = "姓名至少2个字符";
  if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) errors.email = "邮箱格式不正确";
  if (!message || message.length < 5) errors.message = "留言至少5个字符";

  if (Object.keys(errors).length > 0) {
    // 返回错误给组件
    return json({ errors, values: { name, email, message } }, { status: 400 });
  }

  // 保存数据
  const newContact: Contact = {
    id: Date.now().toString(),
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
  };
  contactsDB.push(newContact);

  // 成功后重定向
  return redirect("/contacts");
}

// 留言页面
function ContactsPage() {
  const contacts = useLoaderData() as Contact[];
  // 获取 action 返回的数据（如错误信息）
  const actionData = useActionData() as {
    errors?: Record<string, string>;
    values?: { name: string; email: string; message: string };
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1>📮 联系我们</h1>

      {/* React Router Form - 自动调用 action */}
      <Form method="post" style={{ marginBottom: 30 }}>
        <div style={{ marginBottom: 16 }}>
          <label>姓名:</label>
          <input
            name="name"
            type="text"
            defaultValue={actionData?.values?.name || ""}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
          {actionData?.errors?.name && (
            <p style={{ color: "red", margin: "4px 0 0" }}>{actionData.errors.name}</p>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>邮箱:</label>
          <input
            name="email"
            type="email"
            defaultValue={actionData?.values?.email || ""}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
          {actionData?.errors?.email && (
            <p style={{ color: "red", margin: "4px 0 0" }}>{actionData.errors.email}</p>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>留言:</label>
          <textarea
            name="message"
            rows={4}
            defaultValue={actionData?.values?.message || ""}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
          {actionData?.errors?.message && (
            <p style={{ color: "red", margin: "4px 0 0" }}>{actionData.errors.message}</p>
          )}
        </div>

        <button
          type="submit"
          style={{ padding: "10px 24px", background: "#1890ff", color: "white", border: "none", borderRadius: 4 }}
        >
          提交留言
        </button>
      </Form>

      <h2>留言列表 ({contacts.length})</h2>
      {contacts.length === 0 ? (
        <p>暂无留言</p>
      ) : (
        <div>
          {contacts.map((c) => (
            <div key={c.id} style={{ padding: 12, border: "1px solid #eee", marginBottom: 8, borderRadius: 4 }}>
              <strong>{c.name}</strong> <small>({c.email})</small>
              <p style={{ margin: "8px 0 0" }}>{c.message}</p>
              <small style={{ color: "#999" }}>{new Date(c.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 配置路由
const contactsRouter = createBrowserRouter([
  {
    path: "/contacts",
    element: <ContactsPage />,
    loader: contactsLoader,
    action: contactAction, // 关联 action
  },
]);
\`\`\`

### defer 延迟加载 + Await + Suspense + errorElement 错误处理

defer 允许先渲染页面骨架，再等待慢数据加载；errorElement 处理路由级错误：

\`\`\`tsx
import {
  createBrowserRouter,
  RouterProvider,
  useLoaderData,
  defer,
  Await,
  Suspense,
  useRouteError,
  isRouteErrorResponse,
  Link,
} from "react-router-dom";

// 快速数据 - 立即返回
async function getQuickStats() {
  await new Promise((r) => setTimeout(r, 200));
  return { totalUsers: 1234, totalPosts: 567, todayVisits: 89 };
}

// 慢数据 - 需要较长时间
async function getSlowComments(): Promise<{ id: number; text: string; user: string }[]> {
  await new Promise((r) => setTimeout(r, 2000)); // 模拟慢请求
  return [
    { id: 1, text: "写得很好！", user: "读者A" },
    { id: 2, text: "学到了很多", user: "读者B" },
    { id: 3, text: "期待更多内容", user: "读者C" },
  ];
}

// 使用 defer 的 loader - 返回 Promise 而不是 await
function dashboardLoader() {
  return defer({
    stats: getQuickStats(), // 快速数据可以 await 也可以 defer
    comments: getSlowComments(), // 慢数据 defer 延迟加载
  });
}

// 错误页面组件
function ErrorPage() {
  const error = useRouteError();
  console.error("路由错误:", error);

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div style={{ padding: 40, textAlign: "center" }}>
          <h1>404 😢</h1>
          <p>抱歉，页面未找到</p>
          <Link to="/">返回首页</Link>
        </div>
      );
    }
    if (error.status === 403) {
      return <div><h1>403 🚫</h1><p>没有权限访问</p></div>;
    }
    return (
      <div style={{ padding: 40 }}>
        <h1>出错了 😰</h1>
        <p>状态: {error.status}</p>
        <p>{error.statusText}</p>
        {error.data && <pre>{JSON.stringify(error.data, null, 2)}</pre>}
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>未知错误</h1>
      <p>{(error as Error).message}</p>
    </div>
  );
}

// 仪表盘页面 - 使用 Suspense + Await 处理延迟数据
function DashboardPage() {
  const { stats, comments } = useLoaderData() as {
    stats: Promise<{ totalUsers: number; totalPosts: number; todayVisits: number }>;
    comments: Promise<{ id: number; text: string; user: string }[]>;
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 数据仪表盘</h1>

      {/* 快速数据先渲染，慢数据用 Suspense 包裹显示 loading */}
      <Suspense fallback={<p>加载统计数据中...</p>}>
        <Await resolve={stats}>
          {(statsData) => (
            <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
              <div style={{ padding: 20, background: "#e6f7ff", borderRadius: 8, flex: 1 }}>
                <h3>总用户</h3>
                <p style={{ fontSize: 32, margin: 0, color: "#1890ff" }}>{statsData.totalUsers}</p>
              </div>
              <div style={{ padding: 20, background: "#f6ffed", borderRadius: 8, flex: 1 }}>
                <h3>总文章</h3>
                <p style={{ fontSize: 32, margin: 0, color: "#52c41a" }}>{statsData.totalPosts}</p>
              </div>
              <div style={{ padding: 20, background: "#fff7e6", borderRadius: 8, flex: 1 }}>
                <h3>今日访问</h3>
                <p style={{ fontSize: 32, margin: 0, color: "#fa8c16" }}>{statsData.todayVisits}</p>
              </div>
            </div>
          )}
        </Await>
      </Suspense>

      <h2>💬 最新评论</h2>
      <Suspense
        fallback={
          <div style={{ padding: 20, textAlign: "center", color: "#999" }}>
            <p>评论加载中...（这可能需要几秒钟）</p>
            <div className="loading-spinner" />
          </div>
        }
      >
        <Await resolve={comments}>
          {(commentList) => (
            <div>
              {commentList.map((c) => (
                <div key={c.id} style={{ padding: 12, borderBottom: "1px solid #eee" }}>
                  <strong>{c.user}:</strong> {c.text}
                </div>
              ))}
            </div>
          )}
        </Await>
      </Suspense>
    </div>
  );
}

// 配置带 errorElement 的路由
const deferRouter = createBrowserRouter([
  {
    path: "/",
    element: <DashboardPage />,
    loader: dashboardLoader,
    errorElement: <ErrorPage />, // 整个路由树的错误边界
    children: [
      {
        path: "some-broken-page",
        loader: async () => {
          throw new Response("故意出错测试", { status: 500 });
        },
        element: <div>这页打不开</div>,
        errorElement: <ErrorPage />, // 子路由可以有自己的 errorElement
      },
    ],
  },
]);
\`\`\`

### useNavigation 获取加载状态 + redirect + json() 工具

useNavigation 可以获取全局导航/提交的 loading 状态：

\`\`\`tsx
import { useNavigation, Form } from "react-router-dom";

// 全局加载指示器
function GlobalLoading() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const isSubmitting = navigation.state === "submitting";

  if (isSubmitting) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        padding: 8, background: "#52c41a", color: "white", textAlign: "center", zIndex: 9999
      }}>
        ⏳ 提交中...
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg, #1890ff, #52c41a)", zIndex: 9999,
        animation: "loadingBar 1s infinite"
      }} />
    );
  }

  return null;
}

// loader/action 中常用的工具函数说明：
// - redirect(path) - 重定向到其他路由，如 return redirect("/login")
// - json(data, init?) - 返回 JSON Response，自动设置 Content-Type
// - new Response(data, init) - 自定义 Response
//
// 示例:
// async function protectedLoader({ request }) {
//   const user = await getCurrentUser();
//   if (!user) {
//     const params = new URLSearchParams();
//     params.set("from", new URL(request.url).pathname);
//     return redirect("/login?" + params.toString());
//   }
//   return json({ user });
// }
\`\`\`
\`,
  },
  {
    id: "tsrx-router-guard",
    group: "路由篇",
    icon: "🛡️",
    title: "路由守卫与权限控制",
    content: `## 路由守卫与权限控制

在真实应用中，很多页面需要用户登录后才能访问，有些页面还需要特定角色权限。React Router v6 通过路由守卫组件、HOC、loader 权限校验等方式实现权限控制。

### ProtectedRoute 基础路由守卫组件

最基础的路由守卫是一个包裹组件，检查登录状态，未登录则跳转：

\`\`\`tsx
import { ReactNode } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";

// 模拟认证状态（实际项目中可能来自 Context/Zustand/Redux）
interface AuthUser {
  id: string;
  name: string;
  role: "admin" | "editor" | "user";
}

// 这里简单用一个全局变量模拟，实际用状态管理
let currentUser: AuthUser | null = null;
export function setCurrentUser(user: AuthUser | null) {
  currentUser = user;
}
export function getCurrentUser() {
  return currentUser;
}

// ==================== 基础登录守卫 ====================
// 方式1: 包裹 children
function RequireAuth({ children }: { children: ReactNode }) {
  const user = getCurrentUser();
  const location = useLocation();

  if (!user) {
    // 未登录，跳转到登录页，并用 state 保存当前路径，登录后跳回来
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// 方式2: 配合 Outlet 做父路由守卫（更常用）
function ProtectedLayout() {
  const user = getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 已登录，渲染子路由
  return (
    <div>
      <header style={{ background: "#001529", color: "white", padding: "0 20px" }}>
        <span>欢迎, {user.name} ({user.role})</span>
        <button
          onClick={() => {
            setCurrentUser(null);
            window.location.href = "/login";
          }}
          style={{ marginLeft: 20 }}
        >
          退出登录
        </button>
      </header>
      <main style={{ padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}

// 登录页
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // 获取登录前的页面路径
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 简单模拟登录
    if (email === "admin@example.com" && password === "admin123") {
      setCurrentUser({ id: "1", name: "管理员", role: "admin" });
      navigate(from, { replace: true }); // 跳回原页面
    } else if (email === "user@example.com" && password === "user123") {
      setCurrentUser({ id: "2", name: "普通用户", role: "user" });
      navigate(from, { replace: true });
    } else {
      setError("邮箱或密码错误");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: 30, border: "1px solid #eee", borderRadius: 8 }}>
      <h2 style={{ textAlign: "center" }}>🔐 登录</h2>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>邮箱:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com 或 user@example.com"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>密码:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin123 或 user123"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <button
          type="submit"
          style={{ width: "100%", padding: 10, background: "#1890ff", color: "white", border: "none", borderRadius: 4 }}
        >
          登录
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: 16, color: "#666", fontSize: 12 }}>
        测试账号: admin@example.com / admin123 (管理员)<br />
        user@example.com / user123 (普通用户)
      </p>
    </div>
  );
}
\`\`\`

### 基于角色的权限守卫（Role Guard）+ 403 未授权页面

除了登录状态，还需要根据用户角色控制页面访问：

\`\`\`tsx
import { Navigate, Outlet } from "react-router-dom";
import { ReactNode } from "react";

type Role = "admin" | "editor" | "user";

// ==================== 角色守卫组件 ====================
interface RequireRoleProps {
  allowedRoles: Role[];
  children?: ReactNode;
}

function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const user = getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // 已登录但无权限 - 跳转到 403 页面
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}

// 角色守卫布局组件 - 配合 Outlet
function RoleProtectedLayout({ allowedRoles }: { allowedRoles: Role[] }) {
  const user = getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}

// 403 未授权页面
function ForbiddenPage() {
  return (
    <div style={{ textAlign: "center", padding: 100 }}>
      <h1 style={{ fontSize: 72, margin: 0 }}>403</h1>
      <h2>🚫 访问被拒绝</h2>
      <p>您没有权限访问此页面</p>
      <a href="/dashboard" style={{ color: "#1890ff" }}>返回首页</a>
    </div>
  );
}

// ==================== 后台页面 ====================
function DashboardHome() {
  const user = getCurrentUser();
  return (
    <div>
      <h1>📊 仪表盘</h1>
      <p>欢迎回来, {user?.name}!</p>
    </div>
  );
}

function UserManagement() {
  return (
    <div>
      <h1>👥 用户管理</h1>
      <p>只有管理员能看到这个页面</p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={{ padding: 10, border: "1px solid #ddd" }}>ID</th>
            <th style={{ padding: 10, border: "1px solid #ddd" }}>姓名</th>
            <th style={{ padding: 10, border: "1px solid #ddd" }}>角色</th>
            <th style={{ padding: 10, border: "1px solid #ddd" }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {[
            { id: "1", name: "张三", role: "admin" },
            { id: "2", name: "李四", role: "editor" },
            { id: "3", name: "王五", role: "user" },
          ].map((u) => (
            <tr key={u.id}>
              <td style={{ padding: 10, border: "1px solid #ddd" }}>{u.id}</td>
              <td style={{ padding: 10, border: "1px solid #ddd" }}>{u.name}</td>
              <td style={{ padding: 10, border: "1px solid #ddd" }}>{u.role}</td>
              <td style={{ padding: 10, border: "1px solid #ddd" }}>
                <button>编辑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PostManagement() {
  return (
    <div>
      <h1>📝 文章管理</h1>
      <p>管理员和编辑都能看到这个页面</p>
    </div>
  );
}

function ProfilePage() {
  return (
    <div>
      <h1>👤 个人资料</h1>
      <p>所有登录用户都能看到</p>
    </div>
  );
}
\`\`\`

### 动态路由根据权限过滤 + HOC 包装 + loader 中验证

除了组件包裹，还可以用 useMemo 过滤路由数组、HOC 高阶组件、或在 loader 中做权限校验（数据路由）：

\`\`\`tsx
import { Routes, Route, Navigate, useRoutes, useLoaderData, redirect } from "react-router-dom";
import { ReactElement, ComponentType } from "react";

// ==================== 路由配置表（带权限 meta） ====================
interface RouteConfig {
  path: string;
  element: ReactElement;
  roles?: Role[];
  children?: RouteConfig[];
  meta?: { title?: string; requiresAuth?: boolean };
}

const routeConfigs: RouteConfig[] = [
  {
    path: "profile",
    element: <ProfilePage />,
    meta: { title: "个人资料", requiresAuth: true },
  },
  {
    path: "posts",
    element: <PostManagement />,
    roles: ["admin", "editor"],
    meta: { title: "文章管理" },
  },
  {
    path: "users",
    element: <UserManagement />,
    roles: ["admin"],
    meta: { title: "用户管理" },
  },
];

// 根据用户角色过滤路由
function useFilteredRoutes(configs: RouteConfig[]): ReactElement[] {
  const user = getCurrentUser();
  // 实际项目可能用 useMemo 缓存
  const filtered = configs.filter((route) => {
    if (route.roles && (!user || !route.roles.includes(user.role))) {
      return false;
    }
    return true;
  });

  return filtered.map((route) => (
    <Route key={route.path} path={route.path} element={route.element}>
      {route.children && route.children.length > 0 && (
        useFilteredRoutes(route.children)
      )}
    </Route>
  ));
}

// 使用动态过滤路由的组件
function DynamicRoutesDemo() {
  const filteredRoutes = useFilteredRoutes(routeConfigs);
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route element={<ProtectedLayout />}>
        <Route index element={<DashboardHome />} />
        {filteredRoutes}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ==================== HOC 高阶组件包装守卫 ====================
function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  allowedRoles?: Role[]
) {
  return function AuthComponent(props: P) {
    const user = getCurrentUser();
    const location = useLocation();

    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/forbidden" replace />;
    }

    return <WrappedComponent {...props} />;
  };
}

// 使用 HOC
const ProtectedUserManagement = withAuth(UserManagement, ["admin"]);
const ProtectedPostManagement = withAuth(PostManagement, ["admin", "editor"]);
const ProtectedProfile = withAuth(ProfilePage);

// ==================== 数据路由 loader 中做权限验证 ====================
// 这是 React Router 6.4+ 推荐的方式！在 loader 中重定向，不渲染路由组件
async function adminLoader({ request }: { request: Request }) {
  const user = getCurrentUser();
  if (!user) {
    const url = new URL(request.url);
    return redirect(\`/login?from=\${encodeURIComponent(url.pathname)}\`);
  }
  if (user.role !== "admin") {
    return redirect("/forbidden");
  }
  return { user };
}

async function editorLoader({ request }: { request: Request }) {
  const user = getCurrentUser();
  if (!user) {
    const url = new URL(request.url);
    return redirect(\`/login?from=\${encodeURIComponent(url.pathname)}\`);
  }
  if (!["admin", "editor"].includes(user.role)) {
    return redirect("/forbidden");
  }
  return { user };
}

// 完整路由配置（包含公开路由 + 受保护路由）
/*
const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/forbidden", element: <ForbiddenPage /> },
  {
    element: <ProtectedLayout />,
    children: [
      { path: "/dashboard", element: <DashboardHome /> },
      { path: "/dashboard/profile", element: <ProtectedProfile /> },
      {
        path: "/dashboard/users",
        element: <UserManagement />,
        loader: adminLoader, // loader 中验证权限
      },
      {
        path: "/dashboard/posts",
        element: <PostManagement />,
        loader: editorLoader,
      },
    ],
  },
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "*", element: <div>404 Not Found</div> },
]);
*/
\`\`\`

### 路由守卫最佳实践总结

\`\`\`tsx
// 1. 简单场景：直接用 ProtectedLayout 父路由 + Outlet
//    未登录跳转 login，带 state.from 登录后跳回

// 2. 角色权限：RequireRole 组件或 RoleProtectedLayout 父路由
//    admin/editor/user 不同角色看到不同页面

// 3. 数据路由推荐：在 loader 中做权限校验，redirect 到对应页面
//    好处是渲染前就完成判断，不会闪一下组件

// 4. 侧边栏/菜单也要根据权限过滤！
//    不仅是路由守卫，用户看到的导航菜单也要匹配权限

function Sidebar() {
  const user = getCurrentUser();
  const menuItems = [
    { path: "/dashboard", label: "仪表盘", roles: ["admin", "editor", "user"] },
    { path: "/dashboard/posts", label: "文章管理", roles: ["admin", "editor"] },
    { path: "/dashboard/users", label: "用户管理", roles: ["admin"] },
    { path: "/dashboard/profile", label: "个人资料", roles: ["admin", "editor", "user"] },
  ];

  const visibleItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <aside style={{ width: 200, padding: 20 }}>
      {visibleItems.map((item) => (
        <a key={item.path} href={item.path} style={{ display: "block", padding: 10 }}>
          {item.label}
        </a>
      ))}
    </aside>
  );
}
\`\`\`
\`,
  },
  {
    id: "tsrx-router-patterns",
    group: "路由篇",
    icon: "🔄",
    title: "路由模式与高级技巧",
    content: `## 路由模式与高级技巧

掌握基础路由后，React Router 还有很多高级模式可以让应用体验更好：URL 查询参数同步、页面间隐式传值、滚动恢复、面包屑、懒加载、模态框路由、离开页面确认等。

### useSearchParams 读写 URL 查询参数（搜索/筛选/分页）

useSearchParams 让我们可以方便地读写 URL 查询参数，非常适合搜索、筛选、分页等场景——URL 可分享、可书签、可回退：

\`\`\`tsx
import { useSearchParams, useLoaderData, defer, Await, Suspense } from "react-router-dom";

// 模拟文章数据
const allArticles = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: \`文章 \${i + 1}\`,
  category: ["frontend", "backend", "devops", "design"][i % 4],
  author: ["张三", "李四", "王五", "赵六"][i % 4],
  date: new Date(2024, 0, i + 1).toISOString(),
}));

async function searchArticles(keyword: string, category: string, page: number, pageSize: number) {
  await new Promise((r) => setTimeout(r, 300));
  let filtered = allArticles;
  if (keyword) {
    filtered = filtered.filter((a) => a.title.includes(keyword));
  }
  if (category && category !== "all") {
    filtered = filtered.filter((a) => a.category === category);
  }
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

// 搜索页面
function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 从 URL 获取参数，有默认值
  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "all";
  const page = Number(searchParams.get("page") || "1");
  const pageSize = 10;

  // 实际项目这里会结合 loader 获取数据
  // const { items, totalPages } = useLoaderData();

  // 更新查询参数的辅助函数
  const updateParams = (updates: Record<string, string | number | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === "all") {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });
    // 搜索时回到第一页
    if ("keyword" in updates || "category" in updates) {
      newParams.set("page", "1");
    }
    setSearchParams(newParams);
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1>🔍 文章搜索</h1>

      {/* 搜索栏 */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="搜索文章..."
          value={keyword}
          onChange={(e) => updateParams({ keyword: e.target.value || undefined })}
          style={{ flex: 1, minWidth: 200, padding: 8 }}
        />
        <select
          value={category}
          onChange={(e) => updateParams({ category: e.target.value })}
          style={{ padding: 8 }}
        >
          <option value="all">全部分类</option>
          <option value="frontend">前端</option>
          <option value="backend">后端</option>
          <option value="devops">运维</option>
          <option value="design">设计</option>
        </select>
      </div>

      {/* 结果列表（模拟） */}
      <div style={{ marginBottom: 20 }}>
        {allArticles.slice(0, 5).map((a) => (
          <div key={a.id} style={{ padding: 12, borderBottom: "1px solid #eee" }}>
            <h3>{a.title}</h3>
            <span style={{ color: "#666" }}>{a.category} · {a.author}</span>
          </div>
        ))}
      </div>

      {/* 分页 */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button
          disabled={page <= 1}
          onClick={() => updateParams({ page: page - 1 })}
        >
          上一页
        </button>
        {[1, 2, 3, 4, 5].map((p) => (
          <button
            key={p}
            onClick={() => updateParams({ page: p })}
            style={{ fontWeight: p === page ? "bold" : "normal" }}
          >
            {p}
          </button>
        ))}
        <button onClick={() => updateParams({ page: page + 1 })}>下一页</button>
      </div>

      <p style={{ textAlign: "center", marginTop: 16, color: "#999" }}>
        当前 URL: {typeof window !== "undefined" ? window.location.search : ""}
      </p>
    </div>
  );
}
\`\`\`

### location.state 隐式传值 + 模态框保持背景路由

location.state 可以在页面跳转时传递不显示在 URL 中的数据，适合模态框场景：

\`\`\`tsx
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";

// 图片数据
const images = [
  { id: "1", title: "风景1", url: "https://picsum.photos/800/600?random=1", desc: "美丽的山川" },
  { id: "2", title: "风景2", url: "https://picsum.photos/800/600?random=2", desc: "海边日落" },
  { id: "3", title: "风景3", url: "https://picsum.photos/800/600?random=3", desc: "城市夜景" },
  { id: "4", title: "风景4", url: "https://picsum.photos/800/600?random=4", desc: "森林小径" },
];

// 图片列表页
function ImageGallery() {
  const location = useLocation();
  // location.state 可以传递背景位置信息
  console.log("来自:", location.state);

  return (
    <div style={{ padding: 20 }}>
      <h1>🖼️ 图片画廊</h1>
      <p style={{ color: "#666" }}>点击图片查看详情（模态框打开，背景保持列表）</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {images.map((img) => (
          <Link
            key={img.id}
            to={\`/images/\${img.id}\`}
            // 通过 state 传递背景位置信息，用于模态框返回时恢复滚动
            state={{ backgroundLocation: location }}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
              <img src={img.url} alt={img.title} style={{ width: "100%", height: 150, objectFit: "cover" }} />
              <div style={{ padding: 10 }}>
                <h4 style={{ margin: 0 }}>{img.title}</h4>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {/* Outlet 用于嵌套模态路由，当在 /images/123 时模态框渲染在这里 */}
      <Outlet />
    </div>
  );
}

// 图片详情模态框
function ImageModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { imageId } = useParams();
  const image = images.find((i) => i.id === imageId);

  if (!image) return null;

  const close = () => {
    // 返回上一页，或者跳回列表
    navigate(-1);
  };

  return (
    <div
      onClick={close}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 8, maxWidth: 600, padding: 20 }}>
        <img src={image.url} alt={image.title} style={{ width: "100%", borderRadius: 4 }} />
        <h2>{image.title}</h2>
        <p>{image.desc}</p>
        <button onClick={close}>关闭</button>
      </div>
    </div>
  );
}
\`\`\`

### 面包屑导航 + useMatches + 路由懒加载

useMatches 可以获取当前匹配的所有路由层级，方便做面包屑；React.lazy + Suspense 实现路由级代码分割：

\`\`\`tsx
import { useMatches, Link, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";

// ==================== 面包屑导航 ====================
// 路由 meta 中定义面包屑标题
function Breadcrumbs() {
  const matches = useMatches();
  // matches 是当前匹配的所有路由对象数组

  // 过滤出有 handle 的路由（我们在路由配置中加 handle.crumb）
  const crumbs = matches
    .filter((match) => Boolean((match.handle as { crumb?: (data: unknown) => string })?.crumb))
    .map((match) => ({
      path: match.pathname,
      label: (match.handle as { crumb: (data: unknown) => string }).crumb(match.data),
    }));

  return (
    <nav style={{ padding: "12px 20px", background: "#fafafa", borderBottom: "1px solid #eee" }}>
      {crumbs.map((crumb, i) => (
        <span key={crumb.path}>
          {i > 0 && <span style={{ margin: "0 8px", color: "#ccc" }}>/</span>}
          {i === crumbs.length - 1 ? (
            <span style={{ color: "#666" }}>{crumb.label}</span>
          ) : (
            <Link to={crumb.path} style={{ color: "#1890ff", textDecoration: "none" }}>
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

// ==================== 路由懒加载（代码分割） ====================
// 用 React.lazy 动态导入，实现代码分割
const LazyDashboard = lazy(() => import("./pages/Dashboard"));
const LazyUsers = lazy(() => import("./pages/Users"));
const LazyUserDetail = lazy(() => import("./pages/UserDetail"));
const LazySettings = lazy(() => import("./pages/Settings"));

// 加载中 fallback
function PageLoading() {
  return (
    <div style={{ padding: 60, textAlign: "center" }}>
      <div style={{
        width: 40, height: 40, border: "4px solid #f3f3f3",
        borderTop: "4px solid #1890ff", borderRadius: "50%",
        animation: "spin 1s linear infinite", margin: "0 auto",
      }} />
      <p style={{ marginTop: 16, color: "#666" }}>页面加载中...</p>
    </div>
  );
}

// 使用懒加载的布局
function LazyLayout() {
  return (
    <div>
      <Breadcrumbs />
      {/* Suspense 包裹懒加载组件 */}
      <Suspense fallback={<PageLoading />}>
        <Outlet />
      </Suspense>
    </div>
  );
}

// 路由配置示例（createBrowserRouter）
// {
//   path: "/",
//   element: <LazyLayout />,
//   handle: { crumb: () => "首页" },
//   children: [
//     { index: true, element: <LazyDashboard /> },
//     {
//       path: "users",
//       element: <LazyUsers />,
//       handle: { crumb: () => "用户管理" },
//       children: [
//         {
//           path: ":userId",
//           element: <LazyUserDetail />,
//           // crumb 可以使用 loader 返回的数据！
//           handle: { crumb: (user: User) => user?.name || "详情" },
//           loader: userLoader,
//         },
//       ],
//     },
//     { path: "settings", element: <LazySettings />, handle: { crumb: () => "设置" } },
//   ],
// }
\`\`\`

### ScrollRestoration 滚动恢复 + useBlocker 离开确认

React Router v6.4+ 内置滚动恢复；useBlocker（或 unstable_useBlocker）用于未保存表单时的离开确认：

\`\`\`tsx
import {
  ScrollRestoration,
  useBlocker,
  unstable_useBlocker,
  Form,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";

// ==================== ScrollRestoration 滚动恢复 ====================
// 只在数据路由（createBrowserRouter）下有效
// 自动在导航时恢复滚动位置，回退到列表页保持上次位置
function AppWithScroll() {
  return (
    <div>
      {/* 放在根布局里，放在 react-router 管理的元素内部 */}
      <ScrollRestoration
        getKey={(location) => {
          // 自定义滚动位置存储 key
          // 默认使用 location.key，同一页面不同 state 不同位置
          return location.pathname;
        }}
      />
      <Outlet />
    </div>
  );
}

// ==================== useBlocker 离开未保存表单确认 ====================
// v6 中 useBlocker 是 unstable_useBlocker
function EditPostForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // 表单是否被修改过（脏状态）
  const [isDirty, setIsDirty] = useState(false);

  // 方式1: useBlocker (React Router v6.10+)
  const blocker = unstable_useBlocker(
    () => isDirty, // 当表单有未保存修改时阻塞导航
  );

  // 方式2: 手动监听 beforeunload（刷新/关闭页面）
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "您有未保存的更改，确定要离开吗？";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    setIsDirty(true);
  };

  const handleContentChange = (v: string) => {
    setContent(v);
    setIsDirty(true);
  };

  const handleSave = () => {
    // 保存逻辑...
    setIsDirty(false);
    alert("保存成功！");
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1>✏️ 编辑文章</h1>

      {/* 阻塞确认对话框 */}
      {blocker.state === "blocked" && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{ background: "white", padding: 30, borderRadius: 8, maxWidth: 400 }}>
            <h3>⚠️ 未保存的更改</h3>
            <p>您有未保存的修改，确定要离开吗？</p>
            <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => blocker.reset()}>
                继续编辑
              </button>
              <button
                onClick={() => blocker.proceed()}
                style={{ background: "#ff4d4f", color: "white", border: "none", padding: "8px 16px", borderRadius: 4 }}
              >
                确定离开
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label>标题:</label>
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>内容:</label>
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          rows={10}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={handleSave}
          style={{ padding: "10px 24px", background: "#52c41a", color: "white", border: "none", borderRadius: 4 }}
        >
          保存
        </button>
        <button onClick={() => navigate(-1)} style={{ padding: "10px 24px" }}>
          取消
        </button>
        {isDirty && <span style={{ color: "#faad14", alignSelf: "center" }}>● 未保存</span>}
      </div>
    </div>
  );
}
\`\`\`

### 高级路由模式总结

\`\`\`tsx
// 常见路由模式总结:
//
// 1. ✅ 查询参数(useSearchParams) - 搜索/筛选/分页状态同步到URL
//    好处: 可分享、可书签、浏览器前进后退可用
//
// 2. ✅ 模态框路由 - 列表页打开详情模态框
//    通过 location.state 传递 backgroundLocation，保持背景
//
// 3. ✅ 面包屑(useMatches) - 自动生成层级导航
//    配合路由 handle.crumb，还能用 loader 数据
//
// 4. ✅ 懒加载(React.lazy + Suspense) - 代码分割
//    减小首屏包体积，按需加载页面
//
// 5. ✅ 滚动恢复(ScrollRestoration) - 列表回退保持位置
//    数据路由内置，开箱即用
//
// 6. ✅ 离开确认(useBlocker) - 防止未保存更改丢失
//    配合 beforeunload 覆盖刷新/关闭场景
\`\`\`
\`,
  },
  {
    id: "tsrx-form-controlled",
    group: "表单篇",
    icon: "📝",
    title: "受控组件与表单基础",
    content: `## 受控组件与表单基础

表单是 React 应用中最常见的交互模式之一。React 推荐使用**受控组件**来处理表单数据——表单元素的值由 React state 控制，这符合 React "单向数据流"的哲学。

### 受控组件 vs 非受控组件

受控组件：value 绑定 state + onChange 更新 state，React 成为"唯一数据源"；非受控组件：通过 ref 直接从 DOM 获取值，适合简单场景：

\`\`\`tsx
import { useState, useRef, FormEvent, ChangeEvent } from "react";

// ==================== 受控组件（推荐） ====================
function ControlledForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // 数据都在 state 里，直接用
    console.log("提交数据:", { name, email });
    alert(\`提交成功！姓名: \${name}, 邮箱: \${email}\`);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
      <h3>受控组件示例</h3>
      <div style={{ marginBottom: 12 }}>
        <label>姓名:</label>
        {/* value 绑定 state，onChange 更新 state */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
          placeholder="请输入姓名"
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>邮箱:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
          placeholder="请输入邮箱"
        />
      </div>
      <button type="submit" style={{ padding: "8px 20px" }}>
        提交
      </button>
      <p style={{ marginTop: 10, color: "#666" }}>
        当前输入: {name} / {email}
      </p>
    </form>
  );
}

// ==================== 非受控组件 ====================
function UncontrolledForm() {
  // 用 useRef 获取 DOM 元素
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // 直接从 ref 取值
    const name = nameRef.current?.value || "";
    const email = emailRef.current?.value || "";
    console.log("非受控提交:", { name, email });
    alert(\`非受控提交！姓名: \${name}, 邮箱: \${email}\`);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, marginTop: 30 }}>
      <h3>非受控组件示例</h3>
      <div style={{ marginBottom: 12 }}>
        <label>姓名:</label>
        {/* defaultValue 设置初始值，不绑定 value */}
        <input
          type="text"
          ref={nameRef}
          defaultValue=""
          style={{ width: "100%", padding: 8, marginTop: 4 }}
          placeholder="请输入姓名"
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>邮箱:</label>
        <input
          type="email"
          ref={emailRef}
          defaultValue=""
          style={{ width: "100%", padding: 8, marginTop: 4 }}
          placeholder="请输入邮箱"
        />
      </div>
      <button type="submit" style={{ padding: "8px 20px" }}>
        提交
      </button>
      <p style={{ marginTop: 10, color: "#999", fontSize: 12 }}>
        适合简单表单、文件上传等场景
      </p>
    </form>
  );
}

export default function ControlledVsUncontrolled() {
  return (
    <div style={{ padding: 30 }}>
      <ControlledForm />
      <UncontrolledForm />
    </div>
  );
}
\`\`\`

### 所有常见 input 类型处理

覆盖 text、number、checkbox（用 checked）、radio（name 分组）、select、textarea、file：

\`\`\`tsx
import { useState, ChangeEvent, FormEvent } from "react";

// 表单数据类型
interface FormData {
  username: string;
  age: number;
  gender: "male" | "female" | "other";
  hobbies: string[];
  country: string;
  bio: string;
  newsletter: boolean;
  avatar: File | null;
}

function AllInputsForm() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    age: 18,
    gender: "male",
    hobbies: [],
    country: "china",
    bio: "",
    newsletter: true,
    avatar: null,
  });

  // 通用输入处理 - 用 name/value 更新对应字段
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    // checkbox 需要特殊处理
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      // hobbies 是多选 checkbox 数组
      if (name === "hobbies") {
        setFormData((prev) => ({
          ...prev,
          hobbies: checked
            ? [...prev.hobbies, value]
            : prev.hobbies.filter((h) => h !== value),
        }));
      } else {
        // newsletter 是单个 checkbox
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    } else if (type === "file") {
      // 文件上传
      const files = (e.target as HTMLInputElement).files;
      setFormData((prev) => ({ ...prev, avatar: files?.[0] || null }));
    } else if (type === "number") {
      // number 类型转数字
      setFormData((prev) => ({ ...prev, [name]: Number(value) || 0 }));
    } else {
      // text/select/radio/textarea 通用
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("完整表单数据:", formData);
    alert(\`提交成功！\n\${JSON.stringify(formData, null, 2)}`);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, padding: 20 }}>
      <h2>📋 完整表单示例</h2>

      {/* text */}
      <div style={{ marginBottom: 16 }}>
        <label>用户名:</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
          placeholder="请输入用户名"
        />
      </div>

      {/* number */}
      <div style={{ marginBottom: 16 }}>
        <label>年龄:</label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          min={0}
          max={120}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      {/* radio - name 分组，同一时间选一个 */}
      <div style={{ marginBottom: 16 }}>
        <label>性别:</label>
        <div style={{ marginTop: 4 }}>
          <label style={{ marginRight: 20 }}>
            <input
              type="radio"
              name="gender"
              value="male"
              checked={formData.gender === "male"}
              onChange={handleChange}
            />{" "}
            男
          </label>
          <label style={{ marginRight: 20 }}>
            <input
              type="radio"
              name="gender"
              value="female"
              checked={formData.gender === "female"}
              onChange={handleChange}
            />{" "}
            女
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="other"
              checked={formData.gender === "other"}
              onChange={handleChange}
            />{" "}
            其他
          </label>
        </div>
      </div>

      {/* checkbox 多选 - hobbies 数组 */}
      <div style={{ marginBottom: 16 }}>
        <label>爱好:</label>
        <div style={{ marginTop: 4 }}>
          {["阅读", "运动", "音乐", "编程", "旅行"].map((hobby) => (
            <label key={hobby} style={{ marginRight: 16 }}>
              <input
                type="checkbox"
                name="hobbies"
                value={hobby}
                checked={formData.hobbies.includes(hobby)}
                onChange={handleChange}
              />{" "}
              {hobby}
            </label>
          ))}
        </div>
      </div>

      {/* select 下拉选择 */}
      <div style={{ marginBottom: 16 }}>
        <label>国家:</label>
        <select
          name="country"
          value={formData.country}
          onChange={handleChange}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        >
          <option value="china">中国</option>
          <option value="japan">日本</option>
          <option value="korea">韩国</option>
          <option value="usa">美国</option>
          <option value="uk">英国</option>
        </select>
      </div>

      {/* select multiple 多选 */}
      <div style={{ marginBottom: 16 }}>
        <label>技能(多选):</label>
        <select
          multiple
          name="skills"
          style={{ width: "100%", padding: 8, marginTop: 4, height: 100 }}
        >
          <option value="react">React</option>
          <option value="vue">Vue</option>
          <option value="typescript">TypeScript</option>
          <option value="nodejs">Node.js</option>
        </select>
      </div>

      {/* textarea 多行文本 */}
      <div style={{ marginBottom: 16 }}>
        <label>个人简介:</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
          placeholder="介绍一下你自己..."
        />
      </div>

      {/* 单个 checkbox */}
      <div style={{ marginBottom: 16 }}>
        <label>
          <input
            type="checkbox"
            name="newsletter"
            checked={formData.newsletter}
            onChange={handleChange}
          />{" "}
          订阅邮件通知
        </label>
      </div>

      {/* 文件上传 */}
      <div style={{ marginBottom: 16 }}>
        <label>头像上传:</label>
        <input
          type="file"
          name="avatar"
          onChange={handleChange}
          accept="image/*"
          style={{ width: "100%", marginTop: 4, padding: 8 }}
        />
        {formData.avatar && (
          <p style={{ color: "#52c41a", margin: "4px 0 0" }}>
            已选择文件: {formData.avatar.name} ({(formData.avatar.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      <button type="submit" style={{ padding: "10px 30px", background: "#1890ff", color: "white", border: "none", borderRadius: 4 }}>
        提交表单
      </button>
    </form>
  );
}
\`\`\`

### 表单提交与 FormData API + 表单重置

使用 FormData API 可以方便地收集表单数据（尤其适合非受控表单），以及如何重置表单：

\`\`\`tsx
import { useState, useRef, FormEvent } from "react";

// 初始值（用于重置）
const initialLoginForm = {
  email: "",
  password: "",
  remember: false,
};

function FormSubmitAndReset() {
  const [formData, setFormData] = useState(initialLoginForm);
  const [submittedData, setSubmittedData] = useState<typeof initialLoginForm | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // 方式1: 受控组件 - 从 state 取数据提交
  const handleControlledSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("受控提交:", formData);
    setSubmittedData(formData);
  };

  // 方式2: FormData API - 从 form 元素直接收集数据
  // 这需要 input 有 name 属性！
  const handleFormDataSubmit = (e: FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    // 遍历所有字段
    const data: Record<string, FormDataEntryValue> = {};
    formData.forEach((value, key) => {
      // 处理同名字段（如多选）
      if (data[key]) {
        data[key] = Array.isArray(data[key])
          ? [...(data[key] as string[]), value as string]
          : [data[key] as string, value as string];
      } else {
        data[key] = value;
      }
    });

    console.log("FormData 收集:", data);
    setSubmittedData({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      remember: formData.get("remember") === "on",
    });
  };

  // 重置方式1: state 设回初始值
  const handleResetByState = () => {
    setFormData(initialLoginForm);
    setSubmittedData(null);
  };

  // 重置方式2: 调用 form.reset() 方法
  const handleResetByForm = () => {
    formRef.current?.reset();
    setFormData(initialLoginForm);
    setSubmittedData(null);
  };

  return (
    <div style={{ padding: 30, maxWidth: 500 }}>
      <h2>🚪 登录表单</h2>

      {/* 用 ref 绑定 form 元素 */}
      <form ref={formRef} onSubmit={handleControlledSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>邮箱:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            placeholder="your@email.com"
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>密码:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            placeholder="请输入密码"
            required
            minLength={6}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={(e) => setFormData((prev) => ({ ...prev, remember: e.target.checked }))}
            />{" "}
            记住我
          </label>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" style={{ padding: "10px 24px", background: "#1890ff", color: "white", border: "none", borderRadius: 4 }}>
            登录
          </button>
          {/* type="reset" 按钮会自动调用 form.reset() */}
          <button type="button" onClick={handleResetByState}>
            重置(State)
          </button>
          <button type="button" onClick={handleResetByForm}>
            重置(Form)
          </button>
        </div>
      </form>

      {submittedData && (
        <div style={{ marginTop: 20, padding: 16, background: "#f6ffed", border: "1px solid #b7eb8f", borderRadius: 4 }}>
          <h4>✅ 提交的数据:</h4>
          <pre>{JSON.stringify(submittedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
\`\`\`

### 受控组件最佳实践

\`\`\`tsx
// 1. 表单字段较多时，用一个 state 对象管理而不是多个 useState
//    配合 handleChange 通用处理函数减少代码

// 2. 文件上传 <input type="file"> 总是非受控的
//    因为 input 的 value 是只读的，只能通过 ref 或 onChange e.target.files 获取

// 3. 表单验证放在 onChange 或 onSubmit 中，下一章会详细讲

// 4. disabled 提交按钮防止重复提交
function SubmitButtonDemo() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      alert("提交成功");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <button
      onClick={handleSubmit}
      disabled={isSubmitting}
      style={{ opacity: isSubmitting ? 0.6 : 1 }}
    >
      {isSubmitting ? "提交中..." : "提交"}
    </button>
  );
}
\`\`\`
\`,
  },
  {
    id: "tsrx-form-validation",
    group: "表单篇",
    icon: "✅",
    title: "表单验证策略",
    content: `## 表单验证策略

表单验证是提升用户体验的关键——及时告诉用户输入哪里有问题，而不是等提交后才报错。本章节我们将学习即时验证、提交验证、异步验证，以及 Zod schema 验证入门。

### 即时验证（onChange/onBlur）+ 错误消息管理

即时验证在用户输入时或输入框失焦时立即校验，给用户及时反馈：

\`\`\`tsx
import { useState, ChangeEvent, FormEvent } from "react";

// 错误类型
type FormErrors = Record<string, string>;

// 表单数据
interface SignupForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// 校验函数 - 接收字段名和值，返回错误消息或空字符串
function validateField(
  name: string,
  value: string,
  formData: Partial<SignupForm>
): string {
  switch (name) {
    case "username":
      if (!value.trim()) return "请输入用户名";
      if (value.length < 3) return "用户名至少3个字符";
      if (value.length > 20) return "用户名最多20个字符";
      if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(value)) return "用户名只能包含字母、数字、下划线和中文";
      return "";
    case "email":
      if (!value.trim()) return "请输入邮箱";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "邮箱格式不正确";
      return "";
    case "password":
      if (!value) return "请输入密码";
      if (value.length < 8) return "密码至少8个字符";
      if (!/[A-Z]/.test(value)) return "密码需要包含至少一个大写字母";
      if (!/[a-z]/.test(value)) return "密码需要包含至少一个小写字母";
      if (!/[0-9]/.test(value)) return "密码需要包含至少一个数字";
      return "";
    case "confirmPassword":
      if (!value) return "请确认密码";
      if (value !== formData.password) return "两次密码输入不一致";
      return "";
    default:
      return "";
  }
}
\`\`\`

### 表单验证完整实现 + 异步验证

现在用这些校验函数实现一个完整的注册表单，包含 onChange/onBlur 即时验证、提交时整体验证、以及异步验证用户名是否已被注册：

\`\`\`tsx
function SignupForm() {
  const [formData, setFormData] = useState<SignupForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [asyncValidating, setAsyncValidating] = useState<string | null>(null);

  // 已存在的用户名（模拟数据库）
  const existingUsernames = ["admin", "root", "user", "张三"];

  // 通用输入处理
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 即时验证（onChange）
    if (touched[name]) {
      const error = validateField(name, value, { ...formData, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // 失焦时验证
  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value, formData);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // 异步验证：用户名是否已注册
  useEffect(() => {
    const username = formData.username;
    if (!username || username.length < 3) return;
    if (errors.username) return;

    const timer = setTimeout(() => {
      setAsyncValidating(username);
      // 模拟 API 检查延迟
      setTimeout(() => {
        if (existingUsernames.includes(username)) {
          setErrors((prev) => ({ ...prev, username: "该用户名已被注册" }));
        } else {
          setErrors((prev) => {
            const next = { ...prev };
            delete next.username;
            return next;
          });
        }
        setAsyncValidating(null);
      }, 800);
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.username]);

  // 整体验证所有字段
  const validateAll = (): boolean => {
    const newErrors: FormErrors = {};
    Object.entries(formData).forEach(([name, value]) => {
      const error = validateField(name, value, formData);
      if (error) newErrors[name] = error;
    });
    setErrors(newErrors);
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      alert("注册成功！");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputStyle = (name: string) => ({
    width: "100%",
    padding: 8,
    marginTop: 4,
    border: errors[name] ? "1px solid #ff4d4f" : "1px solid #d9d9d9",
    borderRadius: 4,
  });
\`\`\`
\`,
  },