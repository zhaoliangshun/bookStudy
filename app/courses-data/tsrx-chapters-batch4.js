export const chapters = [
  {
    id: "tsrx-context-state",
    group: "状态管理篇",
    icon: "🌐",
    title: "Context+useReducer全局状态",
    content: `## Context + useReducer 全局状态管理

Context API 是 React 内置的跨组件状态共享方案，结合 useReducer 可以实现类似 Redux 的全局状态管理模式。这种组合无需第三方依赖，适合中小型应用的状态管理，同时 TypeScript 的类型系统能为我们提供完整的类型安全保障。

### createContext 泛型与默认值设计

创建 Context 时，我们需要明确指定类型。有两种常见的初始值策略：使用默认值 vs 使用 null + 运行时检查。使用 null + 运行时检查是更推荐的方式，因为它可以强制消费者必须被 Provider 包裹，避免使用默认值导致的潜在错误。

\`\`\`tsx
import { createContext, useContext, useMemo, useReducer, ReactNode } from 'react';

// 定义 Theme 状态类型和 Action 类型
interface ThemeState {
  mode: 'light' | 'dark';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
}

type ThemeAction =
  | { type: 'TOGGLE_MODE' }
  | { type: 'SET_PRIMARY_COLOR'; payload: string }
  | { type: 'SET_FONT_SIZE'; payload: 'small' | 'medium' | 'large' };

// 方式1：直接提供默认值（简单但不推荐，无法检测是否在 Provider 内）
const ThemeContext1 = createContext<ThemeState>({
  mode: 'light',
  primaryColor: '#3b82f6',
  fontSize: 'medium',
});

// 方式2：null + 运行时检查（推荐，更安全）
// Context 值包含 state 和 dispatch
interface ThemeContextValue {
  state: ThemeState;
  dispatch: React.Dispatch<ThemeAction>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// 自定义消费 Hook：如果在 Provider 外使用则抛出错误
function useTheme() {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme 必须在 ThemeProvider 内部使用');
  }
  return context;
}

// Theme Reducer 函数：纯函数处理状态更新
function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'TOGGLE_MODE':
      return {
        ...state,
        mode: state.mode === 'light' ? 'dark' : 'light',
      };
    case 'SET_PRIMARY_COLOR':
      return { ...state, primaryColor: action.payload };
    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.payload };
    default:
      return state;
  }
}

// 初始状态
const initialThemeState: ThemeState = {
  mode: 'light',
  primaryColor: '#3b82f6',
  fontSize: 'medium',
};
\`\`\`

### Provider 组件封装与 useMemo 优化

Provider 组件负责将状态和 dispatch 传递给子组件。非常重要的一点是：必须使用 useMemo 来稳定 value 对象的引用，否则每次 Provider 重新渲染都会创建新的 value 对象，导致所有消费者组件强制重渲染，即使状态没有变化。

\`\`\`tsx
interface ThemeProviderProps {
  children: ReactNode;
}

function ThemeProvider({ children }: ThemeProviderProps) {
  const [state, dispatch] = useReducer(themeReducer, initialThemeState);

  // 🔴 关键：使用 useMemo 缓存 value，避免不必要的重渲染
  // 如果不使用 useMemo，每次 Provider 渲染都会创建新对象，导致所有消费者重渲染
  const value = useMemo(
    () => ({ state, dispatch }),
    [state] // 只有 state 变化时才创建新的 value
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Auth Context 示例：用户登录状态
interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roles: string[];
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthUser }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<AuthUser> };

interface AuthContextValue {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  return context;
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { user: action.payload, isLoading: false, error: null };
    case 'LOGIN_FAILURE':
      return { user: null, isLoading: false, error: action.payload };
    case 'LOGOUT':
      return { user: null, isLoading: false, error: null };
    case 'UPDATE_PROFILE':
      return state.user
        ? { ...state, user: { ...state.user, ...action.payload } }
        : state;
    default:
      return state;
  }
}
\`\`\`

### useReducer 结合 Context 实现 Todo 全局状态

现在我们来实现一个完整的 Todo 全局状态管理，展示如何将 reducer、Provider 和自定义 Hook 结合起来使用。这是一个经典的 CRUD 示例，包含添加、删除、切换完成状态、筛选等功能。

\`\`\`tsx
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority: 'low' | 'medium' | 'high';
}

type FilterType = 'all' | 'active' | 'completed';

interface TodoState {
  todos: Todo[];
  filter: FilterType;
  searchQuery: string;
}

type TodoAction =
  | { type: 'ADD_TODO'; payload: Omit<Todo, 'id' | 'createdAt'> }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'UPDATE_TODO'; payload: { id: string; text: string } }
  | { type: 'TOGGLE_ALL' }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'SET_FILTER'; payload: FilterType }
  | { type: 'SET_SEARCH'; payload: string };

interface TodoContextValue {
  state: TodoState;
  dispatch: React.Dispatch<TodoAction>;
  filteredTodos: Todo[];
  stats: {
    total: number;
    active: number;
    completed: number;
  };
  addTodo: (text: string, priority?: 'low' | 'medium' | 'high') => void;
}

const TodoContext = createContext<TodoContextValue | null>(null);

function useTodos() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos 必须在 TodoProvider 内部使用');
  }
  return context;
}

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD_TODO':
      const newTodo: Todo = {
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      return {
        ...state,
        todos: [newTodo, ...state.todos],
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.payload),
      };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.payload ? { ...t, completed: !t.completed } : t
        ),
      };
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.payload.id ? { ...t, text: action.payload.text } : t
        ),
      };
    case 'TOGGLE_ALL':
      const allCompleted = state.todos.every((t) => t.completed);
      return {
        ...state,
        todos: state.todos.map((t) => ({ ...t, completed: !allCompleted })),
      };
    case 'CLEAR_COMPLETED':
      return {
        ...state,
        todos: state.todos.filter((t) => !t.completed),
      };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    default:
      return state;
  }
}

function TodoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    filter: 'all',
    searchQuery: '',
  });

  // 计算筛选后的 todos（派生状态）
  const filteredTodos = useMemo(() => {
    let result = state.todos;

    if (state.filter === 'active') {
      result = result.filter((t) => !t.completed);
    } else if (state.filter === 'completed') {
      result = result.filter((t) => t.completed);
    }

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      result = result.filter((t) => t.text.toLowerCase().includes(query));
    }

    return result;
  }, [state.todos, state.filter, state.searchQuery]);

  // 统计数据
  const stats = useMemo(
    () => ({
      total: state.todos.length,
      active: state.todos.filter((t) => !t.completed).length,
      completed: state.todos.filter((t) => t.completed).length,
    }),
    [state.todos]
  );

  // 便捷 action 函数
  const addTodo = (text: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    if (text.trim()) {
      dispatch({ type: 'ADD_TODO', payload: { text: text.trim(), completed: false, priority } });
    }
  };

  const value = useMemo(
    () => ({ state, dispatch, filteredTodos, stats, addTodo }),
    [state, filteredTodos, stats]
  );

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}
\`\`\`

### 多 Context 按更新频率拆分与性能优化

Context 的一个重要特性是"消费即订阅"——任何调用 useContext 的组件都会在 Context 值变化时重渲染。如果把所有状态放在一个 Context 里，任何小的状态变化都会导致所有消费者重渲染。最佳实践是按更新频率拆分多个 Context：主题（很少变化）、用户信息（偶尔变化）、Todo 数据（频繁变化）、Todo 筛选条件（中等频率变化）。

\`\`\`tsx
// 组合所有 Provider 的根组件
function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TodoProvider>
          {children}
        </TodoProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// AuthProvider 完整实现，包含异步 action
function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: false,
    error: null,
  });

  // 异步登录函数
  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      // 模拟 API 请求
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const user: AuthUser = {
        id: '1',
        name: '张三',
        email,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
        roles: ['user'],
      };
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: '登录失败，请检查邮箱和密码' });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const hasRole = (role: string) => {
    return state.user?.roles.includes(role) ?? false;
  };

  const value = useMemo(
    () => ({ state, dispatch, login, logout, hasRole }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 使用 memo 优化子组件：避免无关 props 变化导致的重渲染
const ThemeToggle = () => {
  const { state, dispatch } = useTheme();
  return (
    <button
      onClick={() => dispatch({ type: 'TOGGLE_MODE' })}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
    >
      {state.mode === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

const TodoInput = () => {
  const { addTodo } = useTodos();
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTodo(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="添加新待办..."
        className="flex-1 px-4 py-2 border rounded-lg"
      />
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">
        添加
      </button>
    </form>
  );
};

const TodoList = () => {
  const { filteredTodos, dispatch } = useTodos();
  return (
    <ul className="space-y-2">
      {filteredTodos.map((todo) => (
        <li
          key={todo.id}
          className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
            className="w-5 h-5"
          />
          <span className={todo.completed ? 'line-through text-gray-400' : ''}>
            {todo.text}
          </span>
          <span className="text-xs px-2 py-1 rounded" style={{
            backgroundColor: todo.priority === 'high' ? '#fecaca' :
                           todo.priority === 'medium' ? '#fef08a' : '#bbf7d0'
          }}>
            {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
          </span>
          <button
            onClick={() => dispatch({ type: 'DELETE_TODO', payload: todo.id })}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            删除
          </button>
        </li>
      ))}
    </ul>
  );
};

// 综合 Demo 页面
const TodoApp = () => {
  const { stats, state, dispatch } = useTodos();
  const { state: authState } = useAuth();

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">待办事项</h1>
        <div className="flex items-center gap-3">
          {authState.user && <span>欢迎, {authState.user.name}</span>}
          <ThemeToggle />
        </div>
      </div>
      <TodoInput />
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => dispatch({ type: 'SET_FILTER', payload: f })}
            className={\`px-3 py-1 rounded \${
              state.filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700'
            }\`}
          >
            {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成'}
          </button>
        ))}
      </div>
      <TodoList />
      <div className="mt-4 text-sm text-gray-500">
        共 {stats.total} 项，{stats.active} 项进行中，{stats.completed} 项已完成
      </div>
    </div>
  );
};

// 根应用入口
export default function App() {
  return (
    <AppProviders>
      <TodoApp />
    </AppProviders>
  );
}
\`\`\`

### Context 性能陷阱总结

使用 Context 时需要注意几个常见的性能问题：

1. **不使用 useMemo 包裹 value**：这是最常见的错误，每次 Provider 重渲染都会创建新对象，导致所有消费者重渲染
2. **单一大 Context**：把所有状态放在一个 Context 里，任何状态变化都会通知所有消费者，应该按更新频率拆分
3. **在 Context 中存放不稳定的函数**：dispatch 是稳定的，但自定义函数如果不加入 useMemo 的依赖数组或不使用 useCallback 会每次变化
4. **消费者组件本身不使用 memo**：即使 Context 值不变，如果父组件重渲染，子组件也会重渲染，配合 React.memo 可以避免

当应用规模继续增长时，可以考虑 Zustand 或 Redux Toolkit 等专门的状态管理库，它们提供了更精细的订阅机制和更优的性能。`,
  },
  {
    id: "tsrx-zustand",
    group: "状态管理篇",
    icon: "🐻",
    title: "Zustand轻量状态管理",
    content: `## Zustand 轻量状态管理

Zustand 是一个极简、轻量的 React 状态管理库，由 Jotai 和 react-spring 的作者开发。它不需要 Provider 包裹，API 简洁直观，同时提供了优秀的 TypeScript 支持和中间件生态。相比 Context 需要自行处理性能优化，Zustand 内置了 selector 机制，组件只订阅自己关心的状态，自动避免无关重渲染。

### Zustand 基础与 TypeScript 类型定义

使用 Zustand 只需要调用 create 函数，传入一个返回状态和操作的函数。TypeScript 可以自动推断类型，但为了更好的代码提示和类型安全，推荐显式定义 State 和 Actions 接口。

\`\`\`tsx
import { create } from 'zustand';

// 安装依赖：npm install zustand

// 定义 Store 的类型：包含 state 和 actions
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

// 创建 store
// create<T>()((set, get) => ({ ... })) 是 Zustand 的标准写法
const useBearStore = create<BearStore>()((set, get) => ({
  // 初始状态
  bears: 0,
  color: 'brown',

  // Actions：使用 set 更新状态
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  decreasePopulation: () => set((state) => ({ bears: Math.max(0, state.bears - 1) })),
  removeAllBears: () => set({ bears: 0 }),
  setColor: (color) => set({ color }),
}));

// 在组件中使用
function BearCounter() {
  // 只订阅 bears，其他状态变化不会导致该组件重渲染
  const bears = useBearStore((state) => state.bears);
  return <h1>🐻 {bears} around here...</h1>;
}

function BearControls() {
  // 可以同时获取多个值，也可以只获取 actions
  const increasePopulation = useBearStore((state) => state.increasePopulation);
  const decreasePopulation = useBearStore((state) => state.decreasePopulation);
  const removeAllBears = useBearStore((state) => state.removeAllBears);

  return (
    <div className="flex gap-2">
      <button onClick={increasePopulation} className="px-4 py-2 bg-green-500 text-white rounded">
        + 增加
      </button>
      <button onClick={decreasePopulation} className="px-4 py-2 bg-orange-500 text-white rounded">
        - 减少
      </button>
      <button onClick={removeAllBears} className="px-4 py-2 bg-red-500 text-white rounded">
        清空
      </button>
    </div>
  );
}

// 直接获取整个 store（不推荐用于组件内，会订阅所有变化）
function BearInfo() {
  const { color, setColor } = useBearStore();
  return (
    <div className="mt-4">
      <p>当前颜色: {color}</p>
      <div className="flex gap-2 mt-2">
        {['brown', 'black', 'white', 'polar'].map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={\`px-3 py-1 rounded \${
              color === c ? 'ring-2 ring-blue-500' : ''
            }\`}
            style={{ backgroundColor: c === 'polar' ? '#e5e7eb' : c }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
\`\`\`

### 中间件：devtools、persist、immer

Zustand 提供了丰富的中间件来扩展功能：devtools 用于 Redux DevTools 调试，persist 用于本地存储持久化，immer 用于直接修改状态。中间件可以组合使用。

\`\`\`tsx
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ============ devtools 中间件 ============
// 启用 Redux DevTools，可以在浏览器中看到状态变化、时间旅行调试
interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const useCounterStore = create<CounterStore>()(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 }), false, 'counter/increment'),
      decrement: () => set((state) => ({ count: state.count - 1 }), false, 'counter/decrement'),
      reset: () => set({ count: 0 }, false, 'counter/reset'),
    }),
    { name: 'CounterStore' } // DevTools 中显示的名称
  )
);

// ============ persist 中间件 ============
// 将状态持久化到 localStorage 或 sessionStorage
interface SettingsStore {
  theme: 'light' | 'dark';
  language: 'zh-CN' | 'en-US';
  notifications: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: 'zh-CN' | 'en-US') => void;
  toggleNotifications: () => void;
}

const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'zh-CN',
      notifications: true,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
    }),
    {
      name: 'app-settings', // localStorage 中的 key 名称
      storage: createJSONStorage(() => localStorage), // 默认就是 localStorage，可以改成 sessionStorage
      // partialize：选择需要持久化的字段（默认全部持久化）
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        // notifications 不持久化
      }),
      // 版本号：用于迁移
      version: 1,
      // migrate：版本升级时的数据迁移
      migrate: (persistedState: unknown, version) => {
        if (version === 0) {
          return { ...(persistedState as object), notifications: true };
        }
        return persistedState as SettingsStore;
      },
    }
  )
);

// ============ immer 中间件 ============
// 使用 immer 后可以直接 mutate state，不需要返回新对象
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoStore {
  todos: TodoItem[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodo: (id: string, text: string) => void;
}

const useTodoStore = create<TodoStore>()(
  immer((set) => ({
    todos: [],

    // 直接修改 draft，immer 会负责生成不可变更新
    addTodo: (text) =>
      set((state) => {
        state.todos.unshift({
          id: crypto.randomUUID(),
          text,
          completed: false,
        });
      }),

    toggleTodo: (id) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id);
        if (todo) {
          todo.completed = !todo.completed;
        }
      }),

    deleteTodo: (id) =>
      set((state) => {
        const index = state.todos.findIndex((t) => t.id === id);
        if (index !== -1) {
          state.todos.splice(index, 1);
        }
      }),

    updateTodo: (id, text) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id);
        if (todo) {
          todo.text = text;
        }
      }),
  }))
);
\`\`\`

### 切片模式 Slices 拆分大型 Store

当 store 变得庞大时，可以使用切片模式将不同领域的状态拆分成独立的切片函数，然后组合成一个完整的 store。这类似于 Redux 的 combineReducers，但更加灵活。

\`\`\`tsx
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ============ 定义各个切片的类型 ============
// User 切片
interface UserState {
  user: { id: string; name: string; email: string } | null;
  isLoggedIn: boolean;
}

interface UserActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<{ name: string; email: string }>) => void;
}

type UserSlice = UserState & UserActions;

// Cart 切片
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
}

interface CartActions {
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

type CartSlice = CartState & CartActions;

// UI 切片
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  modalOpen: boolean;
  modalContent: ReactNode | null;
}

interface UIActions {
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
}

type UISlice = UIState & UIActions;

// 组合所有切片类型
type AppStore = UserSlice & CartSlice & UISlice;

// ============ 实现各个切片 ============
// 每个切片是一个函数，接收 set/get 参数并返回该切片的状态和操作
const createUserSlice: StateCreator<
  AppStore,
  [['zustand/devtools', never], ['zustand/immer', never]],
  [],
  UserSlice
> = (set) => ({
  user: null,
  isLoggedIn: false,

  login: async (email, password) => {
    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set(
      (state) => {
        state.user = { id: '1', name: '张三', email };
        state.isLoggedIn = true;
      },
      false,
      'user/login'
    );
  },

  logout: () =>
    set(
      (state) => {
        state.user = null;
        state.isLoggedIn = false;
      },
      false,
      'user/logout'
    ),

  updateProfile: (data) =>
    set(
      (state) => {
        if (state.user) {
          Object.assign(state.user, data);
        }
      },
      false,
      'user/updateProfile'
    ),
});

const createCartSlice: StateCreator<
  AppStore,
  [['zustand/devtools', never], ['zustand/immer', never]],
  [],
  CartSlice
> = (set, get) => ({
  items: [],
  couponCode: null,

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }
    }),

  removeItem: (id) =>
    set((state) => {
      const index = state.items.findIndex((i) => i.id === id);
      if (index !== -1) state.items.splice(index, 1);
    }),

  updateQuantity: (id, quantity) =>
    set((state) => {
      const item = state.items.find((i) => i.id === id);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
    }),

  clearCart: () => set({ items: [], couponCode: null }),

  applyCoupon: (code) => set({ couponCode: code }),

  getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  getTotalPrice: () => {
    const subtotal = get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = get().couponCode === 'SAVE10' ? 0.1 : 0;
    return subtotal * (1 - discount);
  },
});

const createUISlice: StateCreator<
  AppStore,
  [['zustand/devtools', never], ['zustand/immer', never]],
  [],
  UISlice
> = (set) => ({
  sidebarOpen: false,
  theme: 'light',
  modalOpen: false,
  modalContent: null,

  toggleSidebar: () => set((state) => { state.sidebarOpen = !state.sidebarOpen; }),
  setTheme: (theme) => set({ theme }),
  openModal: (content) => set({ modalOpen: true, modalContent: content }),
  closeModal: () => set({ modalOpen: false, modalContent: null }),
});

// ============ 组合所有切片创建 store ============
// 需要先安装 immer: npm install immer
import type { StateCreator } from 'zustand';

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      immer((...args) => ({
        ...createUserSlice(...args),
        ...createCartSlice(...args),
        ...createUISlice(...args),
      })),
      {
        name: 'app-storage',
        partialize: (state) => ({
          user: state.user,
          isLoggedIn: state.isLoggedIn,
          theme: state.theme,
        }),
      }
    ),
    { name: 'AppStore' }
  )
);
\`\`\`

### Selectors、useShallow 与 subscribe

Zustand 的核心性能优势在于 selector 机制——组件只订阅自己选择的状态片段。当选择多个字段时，需要使用 useShallow 进行浅比较，避免每次都返回新对象导致的重渲染。

\`\`\`tsx
import { useShallow } from 'zustand/react/shallow';

// ============ Selectors 详解 ============
// ✅ 推荐：使用 selector 精确订阅需要的状态
function CartBadge() {
  // 只订阅 items.length，只有数量变化时才重渲染
  const itemCount = useAppStore((state) => state.items.length);
  return <span className="badge">{itemCount}</span>;
}

// ✅ 选择多个字段：使用 useShallow 进行浅比较
function CartSummary() {
  // 不使用 useShallow 的话，每次都会返回新对象，导致重渲染
  const { items, getTotalPrice, getTotalItems } = useAppStore(
    useShallow((state) => ({
      items: state.items,
      getTotalPrice: state.getTotalPrice,
      getTotalItems: state.getTotalItems,
    }))
  );

  const total = getTotalPrice();
  const count = getTotalItems();

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <p>商品数量: {count}</p>
      <p className="text-xl font-bold">总计: ¥{total.toFixed(2)}</p>
    </div>
  );
}

// ✅ 只获取 actions（actions 引用稳定，可以直接解构）
function CartActions() {
  const { addItem, clearCart } = useAppStore((state) => ({
    addItem: state.addItem,
    clearCart: state.clearCart,
  }));

  return (
    <div className="flex gap-2">
      <button
        onClick={() =>
          addItem({
            id: 'prod-1',
            name: '示例商品',
            price: 99,
            image: '/product.jpg',
          })
        }
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        添加商品
      </button>
      <button onClick={clearCart} className="px-4 py-2 bg-red-500 text-white rounded">
        清空购物车
      </button>
    </div>
  );
}

// ============ subscribe 监听状态变化 ============
// subscribe 可以在组件外监听状态变化，常用于持久化、日志、同步等
const unsub = useAppStore.subscribe(
  (state) => state.theme,
  (theme, prevTheme) => {
    console.log(\`主题从 \${prevTheme} 切换到 \${theme}\`);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },
  { fireImmediately: true } // 立即执行一次
);

// 在组件中使用 useEffect 订阅
function ThemeSync() {
  useEffect(() => {
    // 订阅 user 变化
    const unsubUser = useAppStore.subscribe(
      (state) => state.user,
      (user) => {
        if (user) {
          console.log('用户登录:', user.name);
        } else {
          console.log('用户登出');
        }
      }
    );

    // 组件卸载时取消订阅
    return () => {
      unsubUser();
    };
  }, []);

  return null;
}

// ============ Zustand vs Context vs Redux 选型建议 ============

/**
 * | 特性                | Context + useReducer | Zustand      | Redux Toolkit |
 * |---------------------|----------------------|--------------|---------------|
 * | 学习曲线            | 低（React内置）      | 低（API简洁）| 中（概念较多）|
 * | Provider 包裹       | 需要                 | 不需要       | 需要          |
 * | 性能优化            | 手动（useMemo）      | 自动（selector）| 自动（reselect）|
 * | 中间件生态          | 无                   | 较丰富       | 非常丰富      |
 * | DevTools            | 无                   | 支持         | 优秀          |
 * | TypeScript 支持     | 好                   | 优秀         | 优秀          |
 * | 包体积              | 0                    | ~1KB         | ~10KB         |
 * | 适合场景            | 小型应用/低频状态    | 中小型应用   | 中大型应用    |
 *
 * 选型建议：
 * 1. 主题、用户信息等低频全局状态：Context 就够了
 * 2. 大多数中小应用：Zustand 是最佳选择，简单高效
 * 3. 大型团队项目、需要严格数据流、复杂异步逻辑：Redux Toolkit
 * 4. 需要服务端渲染、数据缓存：考虑 RTK Query 或 TanStack Query + Zustand
 */
\`\`\``,
  },
  {
    id: "tsrx-rtk",
    group: "状态管理篇",
    icon: "🔴",
    title: "Redux Toolkit(RTK)完整指南",
    content: `## Redux Toolkit (RTK) 完整指南

Redux Toolkit 是 Redux 官方推荐的编写 Redux 逻辑的工具集，它封装了 Redux 核心逻辑，提供了简洁的 API，内置 immer 支持直接修改状态，消除了 Redux 传统写法中的样板代码。RTK 还包含 RTK Query 数据请求缓存方案，是中大型 React 应用状态管理的首选方案。

### RTK 基础配置与 createSlice

首先安装依赖：\`npm install @reduxjs/toolkit react-redux\`。使用 configureStore 创建 store，使用 createSlice 定义状态和 reducers。

\`\`\`tsx
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook, Provider } from 'react-redux';

// ============ 定义 Counter Slice ============
interface CounterState {
  value: number;
  status: 'idle' | 'loading' | 'failed';
}

const initialCounterState: CounterState = {
  value: 0,
  status: 'idle',
};

const counterSlice = createSlice({
  name: 'counter',
  initialState: initialCounterState,
  reducers: {
    // RTK 内置 immer，可以直接 mutate state！
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

// 导出 action creators
export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;

// ============ 定义 Todo Slice ============
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

type FilterType = 'all' | 'active' | 'completed';

interface TodoState {
  todos: Todo[];
  filter: FilterType;
}

const initialTodoState: TodoState = {
  todos: [],
  filter: 'all',
};

const todoSlice = createSlice({
  name: 'todos',
  initialState: initialTodoState,
  reducers: {
    todoAdded: {
      reducer: (state, action: PayloadAction<Todo>) => {
        state.todos.unshift(action.payload);
      },
      // prepare 函数用于自定义 payload 创建逻辑
      prepare: (text: string, priority: Todo['priority'] = 'medium') => ({
        payload: {
          id: crypto.randomUUID(),
          text,
          completed: false,
          priority,
        } as Todo,
      }),
    },
    todoToggled: (state, action: PayloadAction<string>) => {
      const todo = state.todos.find((t) => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    todoDeleted: (state, action: PayloadAction<string>) => {
      state.todos = state.todos.filter((t) => t.id !== action.payload);
    },
    filterChanged: (state, action: PayloadAction<FilterType>) => {
      state.filter = action.payload;
    },
    completedCleared: (state) => {
      state.todos = state.todos.filter((t) => !t.completed);
    },
  },
});

export const {
  todoAdded,
  todoToggled,
  todoDeleted,
  filterChanged,
  completedCleared,
} = todoSlice.actions;

// ============ 创建 Store ============
export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    todos: todoSlice.reducer,
  },
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

// ============ TypeScript 类型导出 ============
// 推导 RootState 和 AppDispatch 类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ============ 类型化的 Hooks ============
// 在组件中使用这些而不是原生的 useDispatch/useSelector
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ============ Provider 包裹应用 ============
function ReduxProviders({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

// 根应用
import { ReactNode } from 'react';

function App() {
  return (
    <ReduxProviders>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Redux Toolkit Demo</h1>
        <CounterDemo />
        <TodoDemo />
      </div>
    </ReduxProviders>
  );
}

function CounterDemo() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
      <h2 className="text-lg font-semibold mb-3">计数器: {count}</h2>
      <div className="flex gap-2">
        <button onClick={() => dispatch(decrement())} className="px-3 py-1 bg-red-500 text-white rounded">
          -
        </button>
        <button onClick={() => dispatch(increment())} className="px-3 py-1 bg-green-500 text-white rounded">
          +
        </button>
        <button onClick={() => dispatch(incrementByAmount(5))} className="px-3 py-1 bg-blue-500 text-white rounded">
          +5
        </button>
        <button onClick={() => dispatch(reset())} className="px-3 py-1 bg-gray-500 text-white rounded">
          重置
        </button>
      </div>
    </div>
  );
}
\`\`\`

### createAsyncThunk 异步请求

createAsyncThunk 用于处理异步逻辑（如 API 请求），它会自动生成 pending/fulfilled/rejected 三个 action type，可以在 extraReducers 中监听这些状态。

\`\`\`tsx
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// 定义 User 类型
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
}

interface UsersState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

// 创建异步 thunk
// 第一个泛型参数：返回数据类型
// 第二个泛型参数：入参类型
// 第三个泛型参数：thunkAPI 配置
export const fetchUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      if (!response.ok) {
        throw new Error('请求失败');
      }
      const data = await response.json();
      return data as User[];
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchUserById = createAsyncThunk<
  User,
  number,
  { rejectValue: string }
>(
  'users/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(\`https://jsonplaceholder.typicode.com/users/\${userId}\`);
      if (!response.ok) throw new Error('用户不存在');
      return (await response.json()) as User;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  // extraReducers 处理其他 slice 或 thunk 产生的 action
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? '未知错误';
      })
      // fetchUserById
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? '未知错误';
      });
  },
});

export const { clearSelectedUser } = usersSlice.actions;

// 在 store 中注册
// 别忘了在 configureStore 的 reducer 中添加 users: usersSlice.reducer
\`\`\`

### RTK Query 数据请求与缓存

RTK Query 是 RTK 内置的数据请求和缓存工具，它能自动缓存请求结果、提供加载/错误状态、支持乐观更新、标签失效自动刷新，无需手动编写 loading/error 状态和 thunk。

\`\`\`tsx
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// 创建 API service
export const api = createApi({
  // reducerPath 是这个 slice 在 store 中的 key
  reducerPath: 'api',
  // baseQuery 是基础请求配置
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://jsonplaceholder.typicode.com/',
    // 可以添加全局 headers
    prepareHeaders: (headers, { getState }) => {
      // const token = (getState() as RootState).auth.token;
      // if (token) headers.set('authorization', \`Bearer \${token}\`);
      return headers;
    },
  }),
  // tagTypes 用于缓存失效标签
  tagTypes: ['Post', 'User', 'Comment'],
  endpoints: (builder) => ({
    // 查询：useGetPostsQuery Hook
    getPosts: builder.query<Post[], void>({
      query: () => 'posts',
      // providesTags: 这个查询提供哪些标签（用于缓存）
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Post' as const, id })), { type: 'Post', id: 'LIST' }]
          : [{ type: 'Post', id: 'LIST' }],
    }),

    // 带参数的查询
    getPostById: builder.query<Post, number>({
      query: (id) => \`posts/\${id}\`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),

    getPostsByUser: builder.query<Post[], number>({
      query: (userId) => \`users/\${userId}/posts\`,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Post' as const, id }))]
          : [],
    }),

    // 变更（POST/PUT/DELETE）：useAddPostMutation Hook
    addPost: builder.mutation<Post, Partial<Post>>({
      query: (body) => ({
        url: 'posts',
        method: 'POST',
        body,
      }),
      // invalidatesTags: 使哪些缓存失效，触发自动刷新
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),

    updatePost: builder.mutation<Post, { id: number; body: Partial<Post> }>({
      query: ({ id, body }) => ({
        url: \`posts/\${id}\`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Post', id }],
    }),

    deletePost: builder.mutation<void, number>({
      query: (id) => ({
        url: \`posts/\${id}\`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),
  }),
});

// 自动生成的 Hooks - 命名规则：use[端点名称]Query / use[端点名称]Mutation
export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useGetPostsByUserQuery,
  useAddPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = api;

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

// 在 store 中注册 RTK Query 的 middleware 和 reducer
export const storeWithApi = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    todos: todoSlice.reducer,
    users: usersSlice.reducer,
    [api.reducerPath]: api.reducer,
  },
  // 添加 api middleware，启用缓存、自动刷新等功能
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

// ============ 在组件中使用 RTK Query ============
function PostsList() {
  // data: 返回的数据，isLoading: 首次加载，isFetching: 任何时候正在请求
  // error: 错误，refetch: 手动刷新
  const { data: posts, isLoading, isFetching, error, refetch } = useGetPostsQuery();

  if (isLoading) return <div className="p-4">加载中...</div>;
  if (error) return <div className="p-4 text-red-500">加载失败</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">帖子列表</h2>
        <button
          onClick={refetch}
          disabled={isFetching}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isFetching ? '刷新中...' : '刷新'}
        </button>
      </div>
      <div className="space-y-3">
        {posts?.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

function PostItem({ post }: { post: Post }) {
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

  return (
    <div className="p-3 bg-white rounded-lg shadow">
      <h3 className="font-semibold">{post.title}</h3>
      <p className="text-gray-600 text-sm mt-1">{post.body}</p>
      <button
        onClick={() => deletePost(post.id)}
        disabled={isDeleting}
        className="mt-2 text-red-500 text-sm"
      >
        {isDeleting ? '删除中...' : '删除'}
      </button>
    </div>
  );
}
\`\`\`

### createEntityAdapter 实体 CRUD

createEntityAdapter 提供了一套标准化的 state 结构和预定义的 CRUD reducer/selector，用于管理类似关系型数据库的实体集合，自动生成 selectById、selectAll、selectIds、selectTotal 等选择器。

\`\`\`tsx
import { createEntityAdapter, createSlice, createSelector } from '@reduxjs/toolkit';

// 定义实体类型
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
}

// 创建 adapter
// sortComparer 用于排序（可选）
const productsAdapter = createEntityAdapter<Product, string>({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

// 初始化 state：adapter 提供 ids 和 entities 的初始结构
// 可以添加额外的状态字段
const initialState = productsAdapter.getInitialState({
  loading: false,
  error: null as string | null,
  selectedCategory: 'all',
  searchQuery: '',
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // 使用 adapter 提供的 CRUD 方法
    productAdded: productsAdapter.addOne,
    productsReceived: productsAdapter.setAll,
    productUpdated: productsAdapter.updateOne, // { id, changes }
    productsUpdated: productsAdapter.updateMany,
    productDeleted: productsAdapter.removeOne,
    productsDeleted: productsAdapter.removeMany, // id[]
    allProductsDeleted: productsAdapter.removeAll,
    // upsert：存在则更新，不存在则添加
    productUpserted: productsAdapter.upsertOne,
    productsUpserted: productsAdapter.upsertMany,
    // 额外的 reducer
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  productAdded,
  productsReceived,
  productUpdated,
  productDeleted,
  setSelectedCategory,
  setSearchQuery,
} = productsSlice.actions;

// adapter 自动生成的 selectors
// 需要传入一个函数从 root state 中获取这个 slice
export const {
  selectAll: selectAllProducts,
  selectById: selectProductById,
  selectIds: selectProductIds,
  selectTotal: selectTotalProducts,
  selectEntities: selectProductEntities,
} = productsAdapter.getSelectors<RootState>((state) => state.products);

// 创建自定义的带筛选的 selector
// 使用 createSelector 创建记忆化 selector
export const selectFilteredProducts = createSelector(
  [selectAllProducts, (state: RootState) => state.products.selectedCategory, (state: RootState) => state.products.searchQuery],
  (products, category, search) => {
    let result = products;
    if (category !== 'all') {
      result = result.filter((p) => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return result;
  }
);

export const selectCategories = createSelector([selectAllProducts], (products) => {
  const cats = new Set(products.map((p) => p.category));
  return ['all', ...Array.from(cats)];
});

// 在组件中使用示例
function ProductList() {
  const products = useAppSelector(selectFilteredProducts);
  const categories = useAppSelector(selectCategories);
  const selectedCategory = useAppSelector((s) => s.products.selectedCategory);
  const total = useAppSelector(selectTotalProducts);
  const dispatch = useAppDispatch();

  const handleAddSample = () => {
    dispatch(productAdded({
      id: crypto.randomUUID(),
      name: '示例商品',
      price: 99,
      category: '电子',
      stock: 100,
      description: '这是一个示例商品',
    }));
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-4 items-center">
        <h2 className="text-xl font-bold">商品管理 (共 {total} 件)</h2>
        <button onClick={handleAddSample} className="px-3 py-1 bg-green-500 text-white rounded">
          添加示例
        </button>
      </div>
      <div className="flex gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => dispatch(setSelectedCategory(cat))}
            className={\`px-3 py-1 rounded \${selectedCategory === cat ? 'bg-blue-500 text-white' : 'bg-gray-100'}\`}
          >
            {cat === 'all' ? '全部' : cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-red-500 font-bold">¥{product.price}</p>
            <p className="text-sm text-gray-500">分类: {product.category} | 库存: {product.stock}</p>
            <p className="text-sm mt-2">{product.description}</p>
            <button
              onClick={() => dispatch(productDeleted(product.id))}
              className="mt-2 text-red-500 text-sm"
            >
              删除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
\`\`\`

RTK 提供了一整套完整的状态管理解决方案：createSlice 处理同步状态、createAsyncThunk 处理异步逻辑、RTK Query 处理数据请求缓存、createEntityAdapter 处理实体集合。配合 TypeScript 的类型推导，可以获得极佳的开发体验和类型安全。`,
  },
  {
    id: "tsrx-router-basic",
    group: "路由篇",
    icon: "🧭",
    title: "React Router v6基础",
    content: `## React Router v6 基础

React Router 是 React 生态中最流行的路由库，v6 版本带来了更简洁的 API、更好的嵌套路由支持和更优的性能。它支持 BrowserRouter（History API）和 HashRouter（Hash 模式），提供声明式路由配置、动态路由、嵌套路由等核心功能。

### 路由配置与导航基础

安装依赖：\`npm install react-router-dom\`。使用 BrowserRouter 包裹应用，Routes 包裹多个 Route，Route 定义 path 与 element 的映射关系。

\`\`\`tsx
import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
} from 'react-router-dom';

// ============ 页面组件 ============
function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">🏠 首页</h1>
      <p className="text-gray-600">欢迎来到首页！这是 React Router v6 示例。</p>
    </div>
  );
}

function About() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">📖 关于我们</h1>
      <p className="text-gray-600">这是关于页面，介绍我们的团队和使命。</p>
    </div>
  );
}

function Contact() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">📞 联系我们</h1>
      <p className="text-gray-600">邮箱: hello@example.com</p>
      <p className="text-gray-600">电话: 123-456-7890</p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="text-xl text-gray-500 mt-4">页面未找到</p>
      <Link to="/" className="inline-block mt-4 text-blue-500 hover:underline">
        返回首页
      </Link>
    </div>
  );
}

// ============ 导航栏组件 ============
function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-blue-600">
            MyApp
          </Link>
          <div className="flex gap-6">
            {/* Link 用于普通导航 */}
            <Link to="/" className="text-gray-600 hover:text-blue-600">
              首页
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600">
              关于
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-blue-600">
              联系
            </Link>

            {/* NavLink 用于当前路由高亮，支持 isActive 回调 */}
            <NavLink
              to="/products"
              className={({ isActive }) =>
                \`font-medium \${isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}\`
              }
            >
              产品
            </NavLink>

            {/* NavLink 也支持 style 回调 */}
            <NavLink
              to="/users"
              style={({ isActive }) => ({
                fontWeight: isActive ? 'bold' : 'normal',
                color: isActive ? '#2563eb' : '#4b5563',
              })}
            >
              用户
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ============ 布局组件 ============
function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto">{children}</main>
    </div>
  );
}

// ============ 基础路由配置 ============
function BasicRouterApp() {
  return (
    // BrowserRouter 使用 HTML5 History API（推荐，URL 更干净）
    // HashRouter 使用 URL hash（#），适合静态文件托管
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* 404 通配符：path="*" 匹配所有未匹配的路由 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

import { ReactNode } from 'react';
\`\`\`

### 嵌套路由与 Outlet

嵌套路由是 React Router v6 的核心特性之一。父路由可以渲染子路由的内容通过 Outlet 组件，实现共享布局。index 路由作为父路由的默认子页面。

\`\`\`tsx
import { Routes, Route, Outlet, Link, NavLink } from 'react-router-dom';

// ============ 产品模块的嵌套布局 ============
function ProductsLayout() {
  return (
    <div className="flex">
      {/* 侧边栏：产品分类导航 */}
      <aside className="w-64 min-h-screen bg-white border-r p-4">
        <h2 className="text-lg font-bold mb-4">产品分类</h2>
        <nav className="space-y-1">
          <NavLink
            to="/products"
            end
            className={({ isActive }) =>
              \`block px-3 py-2 rounded \${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}\`
            }
          >
            全部产品
          </NavLink>
          <NavLink
            to="/products/electronics"
            className={({ isActive }) =>
              \`block px-3 py-2 rounded \${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}\`
            }
          >
            电子产品
          </NavLink>
          <NavLink
            to="/products/clothing"
            className={({ isActive }) =>
              \`block px-3 py-2 rounded \${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}\`
            }
          >
            服装
          </NavLink>
          <NavLink
            to="/products/books"
            className={({ isActive }) =>
              \`block px-3 py-2 rounded \${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}\`
            }
          >
            图书
          </NavLink>
        </nav>
      </aside>

      {/* 主内容区：Outlet 渲染子路由 */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

// 产品列表页（index 路由）
function ProductsIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">全部产品</h1>
      <p className="text-gray-600 mb-4">浏览所有产品分类，或从左侧选择具体分类。</p>
      <div className="grid grid-cols-3 gap-4">
        {['电子产品', '服装', '图书'].map((cat) => (
          <Link
            key={cat}
            to={cat === '电子产品' ? '/products/electronics' : cat === '服装' ? '/products/clothing' : '/products/books'}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition text-center"
          >
            {cat}
          </Link>
        ))}
      </div>
    </div>
  );
}

function ElectronicsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📱 电子产品</h1>
      <div className="grid grid-cols-2 gap-4">
        {['iPhone 15', 'MacBook Pro', 'iPad Air', 'AirPods Pro'].map((item) => (
          <div key={item} className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold">{item}</h3>
            <p className="text-gray-500 text-sm mt-1">点击查看详情</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClothingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">👕 服装</h1>
      <p className="text-gray-600">服装分类产品列表</p>
    </div>
  );
}

function BooksPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📚 图书</h1>
      <p className="text-gray-600">图书分类产品列表</p>
    </div>
  );
}

// ============ 嵌套路由配置 ============
function NestedRouterExample() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          {/* 嵌套路由：/products 下有子路由 */}
          <Route path="/products" element={<ProductsLayout />}>
            {/* index 路由：父路由的默认子页面 */}
            <Route index element={<ProductsIndex />} />
            <Route path="electronics" element={<ElectronicsPage />} />
            <Route path="clothing" element={<ClothingPage />} />
            <Route path="books" element={<BooksPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
\`\`\`

### 动态路由与 useParams

动态路由使用 \`:参数名\` 定义路径参数，在组件中通过 useParams() 获取参数值。常见场景如用户详情页、商品详情页等。

\`\`\`tsx
import { Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';

// 用户列表页
function UsersList() {
  const users = [
    { id: '1', name: '张三', email: 'zhangsan@example.com' },
    { id: '2', name: '李四', email: 'lisi@example.com' },
    { id: '3', name: '王五', email: 'wangwu@example.com' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">用户列表</h1>
      <div className="space-y-3">
        {users.map((user) => (
          <Link
            key={user.id}
            to={\`/users/\${user.id}\`}
            className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {user.name[0]}
              </div>
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// 用户详情页 - 使用 useParams 获取动态路由参数
function UserDetail() {
  // useParams 返回对象，键名对应路由定义中的参数名
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  // 根据 userId 获取用户数据（实际项目中从 API 或 store 获取）
  const userMap: Record<string, { id: string; name: string; email: string; role: string }> = {
    '1': { id: '1', name: '张三', email: 'zhangsan@example.com', role: '管理员' },
    '2': { id: '2', name: '李四', email: 'lisi@example.com', role: '编辑' },
    '3': { id: '3', name: '王五', email: 'wangwu@example.com', role: '普通用户' },
  };

  const user = userId ? userMap[userId] : undefined;

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">用户不存在</p>
        <button onClick={() => navigate('/users')} className="mt-2 text-blue-500">
          返回列表
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)} // navigate(-1) 后退一页
        className="text-blue-500 mb-4 flex items-center gap-1"
      >
        ← 返回
      </button>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
            {user.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-500">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
              {user.role}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Link
            to={\`/users/\${userId}/posts\`}
            className="p-4 bg-gray-50 rounded hover:bg-gray-100 text-center"
          >
            📝 查看帖子
          </Link>
          <Link
            to={\`/users/\${userId}/settings\`}
            className="p-4 bg-gray-50 rounded hover:bg-gray-100 text-center"
          >
            ⚙️ 用户设置
          </Link>
        </div>
      </div>
    </div>
  );
}

function UserPosts() {
  const { userId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-blue-500 mb-4">← 返回用户详情</button>
      <h1 className="text-2xl font-bold mb-4">用户 {userId} 的帖子</h1>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold">帖子标题 {i}</h3>
            <p className="text-gray-500 text-sm">这是帖子内容的摘要...</p>
          </div>
        ))}
      </div>
    </div>
  );
}
\`\`\`

### useNavigate 编程跳转与 useLocation

useNavigate 用于编程式导航，useLocation 获取当前 URL 信息（pathname、search、state）。location.state 可以用于页面间隐式传值。

\`\`\`tsx
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 从 location.state 获取跳转来源（由路由守卫传入）
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // 模拟登录
    await new Promise((r) => setTimeout(r, 500));
    // 登录成功后跳转到原页面，replace: true 替换历史记录，避免回退到登录页
    navigate(from, { replace: true });
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">登录</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">邮箱</label>
          <input
            type="email"
            defaultValue="demo@example.com"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">密码</label>
          <input
            type="password"
            defaultValue="123456"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          登录
        </button>
      </form>
    </div>
  );
}

// Navigation Blocking：离开未保存表单时提示
import { unstable_Blocker as Blocker, unstable_useBlocker as useBlocker } from 'react-router-dom';

function EditProfilePage() {
  const [formData, setFormData] = useState({ name: '', bio: '' });
  const [isDirty, setIsDirty] = useState(false);
  const navigate = useNavigate();

  // 当表单有未保存更改时阻止导航
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDirty(false);
    // 保存后跳转
    navigate('/profile');
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">编辑个人资料</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">姓名</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              setIsDirty(true);
            }}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">简介</label>
          <textarea
            value={formData.bio}
            onChange={(e) => {
              setFormData({ ...formData, bio: e.target.value });
              setIsDirty(true);
            }}
            className="w-full px-3 py-2 border rounded-lg"
            rows={4}
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          保存
        </button>
      </form>

      {/* 导航阻止确认对话框 */}
      {blocker.state === 'blocked' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm">
            <h3 className="text-lg font-bold mb-2">确定离开？</h3>
            <p className="text-gray-600 mb-4">您有未保存的更改，确定要离开此页面吗？</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => blocker.reset()}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                取消
              </button>
              <button
                onClick={() => blocker.proceed()}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                确定离开
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
\`\`\``,
  },
  {
    id: "tsrx-router-data",
    group: "路由篇",
    icon: "📊",
    title: "React Router数据加载loader/action",
    content: `## React Router 数据加载 loader/action

React Router v6.4+ 引入了全新的数据路由 API，使用 createBrowserRouter 替代 JSX 形式的 Routes 配置，支持 loader（渲染前数据加载）、action（表单提交处理）、errorElement（错误边界）等功能。这种"数据先行"的模式让数据获取更加集中和可预测。

### createBrowserRouter 基础配置

createBrowserRouter 接受路由配置数组，每个路由可以定义 path、element、loader、action、errorElement、children 等属性，配合 RouterProvider 使用。

\`\`\`tsx
import {
  createBrowserRouter,
  RouterProvider,
  redirect,
  json,
  useLoaderData,
  useActionData,
  useRouteError,
  isRouteErrorResponse,
  Link,
  Outlet,
} from 'react-router-dom';

// ============ 页面组件 ============
async function getPosts() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts');
  if (!res.ok) throw new Response('加载失败', { status: res.status });
  return res.json();
}

// Loader 函数：在路由渲染前执行，返回的数据可以通过 useLoaderData 获取
async function postsLoader() {
  const posts = await getPosts();
  return { posts: posts.slice(0, 10) };
}

function PostsPage() {
  // useLoaderData 获取 loader 返回的数据，自动类型推断
  const { posts } = useLoaderData() as Awaited<ReturnType<typeof postsLoader>>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">帖子列表</h1>
      <div className="space-y-3">
        {posts.map((post: { id: number; title: string; body: string }) => (
          <Link
            key={post.id}
            to={\`/posts/\${post.id}\`}
            className="block p-4 bg-white rounded-lg shadow hover:shadow-md"
          >
            <h3 className="font-semibold">{post.title}</h3>
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{post.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

async function getPostById(id: string) {
  const res = await fetch(\`https://jsonplaceholder.typicode.com/posts/\${id}\`);
  if (!res.ok) {
    if (res.status === 404) throw new Response('帖子不存在', { status: 404 });
    throw new Response('加载失败', { status: res.status });
  }
  return res.json();
}

// 带参数的 loader：params 包含路由参数
async function postLoader({ params }: { params: { postId: string } }) {
  const post = await getPostById(params.postId);
  return { post };
}

function PostDetailPage() {
  const { post } = useLoaderData() as { post: { id: number; title: string; body: string; userId: number } };

  return (
    <div className="p-6">
      <Link to="/posts" className="text-blue-500 mb-4 inline-block">← 返回列表</Link>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-700">{post.body}</p>
      </div>
    </div>
  );
}

// 错误页组件：处理 loader/action 中抛出的错误
function ErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div className="p-8 text-center">
          <h1 className="text-6xl font-bold text-gray-300">404</h1>
          <p className="text-xl mt-4">{error.data || '页面未找到'}</p>
          <Link to="/" className="text-blue-500 mt-4 inline-block">返回首页</Link>
        </div>
      );
    }
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">出错了</h1>
        <p className="mt-2">{error.status} {error.statusText}</p>
      </div>
    );
  }

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-red-500">未知错误</h1>
    </div>
  );
}

function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">首页</h1>
      <Link to="/posts" className="text-blue-500 mt-4 inline-block">查看帖子</Link>
    </div>
  );
}

// ============ 路由配置 ============
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'posts',
        loader: postsLoader,
        element: <PostsPage />,
      },
      {
        path: 'posts/:postId',
        loader: postLoader,
        element: <PostDetailPage />,
      },
    ],
  },
]);

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4">
        <Link to="/" className="font-bold text-xl">Data Router Demo</Link>
      </nav>
      <Outlet />
    </div>
  );
}

function App() {
  return <RouterProvider router={router} />;
}
\`\`\`

### Form 组件与 action 处理

React Router 的 Form 组件会自动拦截表单提交，将数据发送到对应的 action 函数，无需手动 fetch。useActionData 获取 action 返回的结果（如验证错误）。

\`\`\`tsx
import {
  Form,
  redirect,
  useActionData,
  useNavigation,
  type ActionFunctionArgs,
} from 'react-router-dom';

// Action 函数：处理表单提交
async function createPostAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const title = formData.get('title') as string;
  const body = formData.get('body') as string;
  const userId = formData.get('userId') as string;

  // 服务端验证
  const errors: Record<string, string> = {};
  if (!title || title.length < 3) {
    errors.title = '标题至少3个字符';
  }
  if (!body || body.length < 10) {
    errors.body = '内容至少10个字符';
  }

  if (Object.keys(errors).length > 0) {
    // 返回错误（不抛出），组件可以通过 useActionData 获取
    return json({ errors, values: { title, body, userId } }, { status: 400 });
  }

  // 提交到 API
  const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body, userId: Number(userId) }),
  });

  if (!res.ok) {
    throw new Response('创建失败', { status: res.status });
  }

  // 重定向到帖子列表
  return redirect('/posts');
}

function NewPostPage() {
  // useActionData 获取 action 返回的数据（错误信息等）
  const actionData = useActionData() as {
    errors?: Record<string, string>;
    values?: { title: string; body: string; userId: string };
  };
  // useNavigation 获取导航状态：idle | loading | submitting
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">创建新帖子</h1>

      {/* Form 组件自动 POST 到当前路由的 action */}
      <Form method="post" className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">标题</label>
          <input
            type="text"
            name="title"
            defaultValue={actionData?.values?.title || ''}
            className="w-full px-3 py-2 border rounded-lg"
          />
          {actionData?.errors?.title && (
            <p className="text-red-500 text-sm mt-1">{actionData.errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">内容</label>
          <textarea
            name="body"
            rows={5}
            defaultValue={actionData?.values?.body || ''}
            className="w-full px-3 py-2 border rounded-lg"
          />
          {actionData?.errors?.body && (
            <p className="text-red-500 text-sm mt-1">{actionData.errors.body}</p>
          )}
        </div>

        <input type="hidden" name="userId" value="1" />

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          {isSubmitting ? '提交中...' : '发布'}
        </button>
      </Form>
    </div>
  );
}

// 在路由配置中添加 action
const routerWithAction = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'posts', loader: postsLoader, element: <PostsPage /> },
      { path: 'posts/:postId', loader: postLoader, element: <PostDetailPage /> },
      {
        path: 'posts/new',
        action: createPostAction,
        element: <NewPostPage />,
      },
    ],
  },
]);
\`\`\`

### defer 延迟加载与 Suspense

defer() 允许我们不等待所有数据加载完成就渲染页面，先显示框架和已加载的数据，配合 Await 和 Suspense 实现渐进式加载。这对于慢请求的场景非常有用，可以提升用户感知性能。

\`\`\`tsx
import { defer, Await, useAsyncValue, useLoaderData } from 'react-router-dom';
import { Suspense } from 'react';

// 模拟慢请求
async function getSlowData() {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return { message: '这是延迟加载的数据' };
}

async function getFastData() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { stats: { total: 100, active: 42 } };
}

// defer loader：返回 defer 包裹的 Promise
async function dashboardLoader() {
  return defer({
    fastData: getFastData(),
    slowData: getSlowData(),
  });
}

function DashboardPage() {
  const { fastData, slowData } = useLoaderData() as {
    fastData: Awaited<ReturnType<typeof getFastData>>;
    slowData: Promise<Awaited<ReturnType<typeof getSlowData>>>;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>

      {/* 快速数据立即显示 */}
      <Suspense fallback={<div className="p-4 bg-gray-100 rounded">加载统计...</div>}>
        <Await resolve={fastData}>
          {(data) => (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-600">总数</p>
                <p className="text-2xl font-bold">{data.stats.total}</p>
              </div>
              <div className="p-4 bg-green-100 rounded-lg">
                <p className="text-sm text-green-600">活跃</p>
                <p className="text-2xl font-bold">{data.stats.active}</p>
              </div>
            </div>
          )}
        </Await>
      </Suspense>

      {/* 慢数据延迟显示，显示骨架屏 */}
      <Suspense
        fallback={
          <div className="p-4 bg-gray-100 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        }
      >
        <Await resolve={slowData}>
          {(data) => (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="font-semibold">延迟加载数据</p>
              <p className="text-gray-600 mt-2">{data.message}</p>
            </div>
          )}
        </Await>
      </Suspense>
    </div>
  );
}
\`\`\`

### useNavigation 全局 Loading 与 lazy 代码分割

useNavigation 可以获取全局导航状态，用于显示全局 loading 指示器。结合 lazy() 可以实现路由级别的代码分割，减小首屏包体积。

\`\`\`tsx
import { useNavigation, lazy } from 'react-router-dom';

// 全局加载指示器
function GlobalLoading() {
  const navigation = useNavigation();
  const isLoading = navigation.state !== 'idle';

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-blue-500 animate-pulse"></div>
    </div>
  );
}

// 路由级代码分割：lazy() 动态导入组件
// 注意：lazy 返回的对象需要包含 Component 属性
const LazySettings = lazy(async () => {
  // 模拟网络延迟
  await new Promise((r) => setTimeout(r, 1000));
  const { SettingsPage } = await import('./pages/SettingsPage');
  return { Component: SettingsPage };
});

const LazyAbout = lazy(async () => {
  const { AboutPage } = await import('./pages/AboutPage');
  return { Component: AboutPage };
});

// 路由配置中使用 lazy
const routerWithLazy = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <GlobalLoading />
        <Layout />
      </>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'posts', loader: postsLoader, element: <PostsPage /> },
      { path: 'posts/new', action: createPostAction, element: <NewPostPage /> },
      { path: 'posts/:postId', loader: postLoader, element: <PostDetailPage /> },
      // lazy 路由：代码分割，访问时才加载
      {
        path: 'settings',
        lazy: LazySettings,
      },
      {
        path: 'about',
        lazy: LazyAbout,
      },
    ],
  },
]);

// 使用 json() 工具函数返回 JSON 响应
// json(data, init) 等价于 new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' }, ...init })
async function apiAction() {
  return json({ success: true, message: '操作成功' }, { status: 201 });
}

// redirect() 工具函数用于重定向
// redirect(url, init) 返回 302 重定向响应
function requireAuthLoader({ request }: { request: Request }) {
  const isLoggedIn = localStorage.getItem('token');
  if (!isLoggedIn) {
    const params = new URLSearchParams();
    params.set('from', new URL(request.url).pathname);
    return redirect('/login?' + params.toString());
  }
  return null;
}
\`\`\``,
  },
  {
    id: "tsrx-router-guard",
    group: "路由篇",
    icon: "🛡️",
    title: "路由守卫与权限控制",
    content: `## 路由守卫与权限控制

在实际应用中，我们经常需要根据用户的登录状态和角色来控制路由访问。React Router v6 没有内置的路由守卫 API，但我们可以通过组件封装、loader 重定向、高阶组件（HOC）等方式实现权限控制。

### ProtectedRoute 认证守卫组件

RequireAuth 组件检查用户登录状态，未登录则重定向到登录页，并通过 location.state 保存来源地址，登录成功后返回原页面。

\`\`\`tsx
import { Navigate, useLocation, Outlet } from 'react-router-dom';

// ============ 认证 Context ============
interface AuthUser {
  id: string;
  name: string;
  roles: string[];
  permissions: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用');
  return ctx;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 初始化时检查本地存储的 token
    const token = localStorage.getItem('token');
    if (token) {
      // 验证 token 有效性，获取用户信息
      setUser({
        id: '1',
        name: '张三',
        roles: ['user'],
        permissions: ['read:posts'],
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    if (email === 'a****@*********' && password === '123456') {
      const userData: AuthUser = {
        id: '1',
        name: '张三',
        roles: ['admin'],
        permissions: ['read:posts', 'write:posts', 'delete:posts', 'manage:users'],
      };
      setUser(userData);
      localStorage.setItem('token', 'fake-jwt-token');
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============ RequireAuth 守卫组件 ============
function RequireAuth() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!user) {
    // 未登录，重定向到登录页
    // state.from 保存当前位置，登录后可以跳回来
    // replace: true 替换历史记录，避免回退到守卫页又跳回登录页
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 已登录，渲染子路由
  return <Outlet />;
}

// 登录页
function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('a****@*********');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 获取登录前尝试访问的页面
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('邮箱或密码错误');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">登录</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-600 rounded">{error}</div>}
        <div>
          <label className="block text-sm font-medium mb-1">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  );
}

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
\`\`\`

### 基于角色的权限守卫 RequireRole

除了登录状态，很多场景需要基于用户角色（role）或权限（permission）来控制访问。RequireRole 组件检查用户是否拥有指定角色，没有则显示 403 页面或重定向。

\`\`\`tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// ============ 角色守卫组件 ============
interface RequireRoleProps {
  roles: string[];
  // 权限不足时的行为：'redirect' 重定向到 403，'hide' 直接不渲染
  mode?: 'redirect' | 'hide';
}

function RequireRole({ roles, mode = 'redirect' }: RequireRoleProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 检查用户是否拥有所需角色中的任意一个
  const hasRequiredRole = roles.some((role) => user.roles.includes(role));

  if (!hasRequiredRole) {
    if (mode === 'hide') return null;
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}

// 基于权限的守卫（更细粒度）
interface RequirePermissionProps {
  permissions: string[];
  // requireAll: true 需要所有权限，false 只需任意一个
  requireAll?: boolean;
}

function RequirePermission({ permissions, requireAll = false }: RequirePermissionProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasPermission = requireAll
    ? permissions.every((p) => user.permissions.includes(p))
    : permissions.some((p) => user.permissions.includes(p));

  if (!hasPermission) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}

// 403 未授权页面
function ForbiddenPage() {
  const { logout } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-orange-500">403</h1>
      <p className="text-xl text-gray-600 mt-4">您没有权限访问此页面</p>
      <div className="mt-6 flex gap-4">
        <Link to="/dashboard" className="px-4 py-2 bg-blue-500 text-white rounded">
          返回首页
        </Link>
        <button onClick={logout} className="px-4 py-2 bg-gray-500 text-white rounded">
          退出登录
        </button>
      </div>
    </div>
  );
}

// 受保护的页面
function DashboardPage() {
  const { user, logout } = useAuth();
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">欢迎，{user?.name}</h1>
        <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded">
          退出
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Link to="/admin/users" className="p-4 bg-white rounded-lg shadow hover:shadow-md">
          用户管理 (仅管理员)
        </Link>
        <Link to="/posts/create" className="p-4 bg-white rounded-lg shadow hover:shadow-md">
          发布文章
        </Link>
        <Link to="/profile" className="p-4 bg-white rounded-lg shadow hover:shadow-md">
          个人中心
        </Link>
      </div>
    </div>
  );
}

function AdminUsersPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">👥 用户管理</h1>
      <p className="text-gray-600">只有管理员才能看到这个页面</p>
    </div>
  );
}

function CreatePostPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">✍️ 发布文章</h1>
      <p className="text-gray-600">需要 write:posts 权限</p>
    </div>
  );
}

import { Link } from 'react-router-dom';
\`\`\`

### 动态路由与 loader 中权限验证

更灵活的方式是通过路由配置数组和 loader 来进行权限控制。我们可以定义路由 meta 信息，根据用户权限动态过滤路由，或者在 loader 中进行权限验证并 redirect。

\`\`\`tsx
import { createBrowserRouter, redirect, Navigate } from 'react-router-dom';

// 路由配置类型扩展：添加 meta 信息
interface RouteConfig {
  path?: string;
  index?: boolean;
  element?: React.ReactNode;
  meta?: {
    requiresAuth?: boolean;
    roles?: string[];
    permissions?: string[];
    title?: string;
    hidden?: boolean; // 是否在导航菜单中隐藏
  };
  children?: RouteConfig[];
  errorElement?: React.ReactNode;
  loader?: (args: unknown) => unknown;
}

// 定义完整路由配置
const routeConfig: RouteConfig[] = [
  {
    path: '/login',
    element: <LoginPage />,
    meta: { requiresAuth: false, title: '登录' },
  },
  {
    path: '/',
    element: <MainLayout />,
    meta: { requiresAuth: true },
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        element: <DashboardPage />,
        meta: { title: '仪表盘', requiresAuth: true },
      },
      {
        path: 'posts',
        element: <Outlet />,
        meta: { title: '文章管理', requiresAuth: true },
        children: [
          { index: true, element: <PostsPage /> },
          {
            path: 'create',
            element: <CreatePostPage />,
            meta: { title: '发布文章', permissions: ['write:posts'] },
          },
        ],
      },
      {
        path: 'admin',
        element: <Outlet />,
        meta: { title: '系统管理', roles: ['admin'] },
        children: [
          {
            path: 'users',
            element: <AdminUsersPage />,
            meta: { title: '用户管理', roles: ['admin'] },
          },
        ],
      },
      {
        path: 'profile',
        element: <ProfilePage />,
        meta: { title: '个人中心', requiresAuth: true },
      },
    ],
  },
  {
    path: '/forbidden',
    element: <ForbiddenPage />,
    meta: { requiresAuth: false },
  },
  { path: '*', element: <NotFoundPage /> },
];

// 创建带权限验证 loader 的路由
function createProtectedRouter(routes: RouteConfig[]): ReturnType<typeof createBrowserRouter> {
  function processRoutes(routeList: RouteConfig[]): unknown[] {
    return routeList.map((route) => {
      const processed: Record<string, unknown> = {
        path: route.path,
        index: route.index,
        element: route.element,
        errorElement: route.errorElement,
      };

      // 如果需要认证，添加 loader 进行权限检查
      if (route.meta?.requiresAuth || route.meta?.roles || route.meta?.permissions) {
        processed.loader = ({ request }: { request: Request }) => {
          // 这里需要获取 auth 状态，可以从 store 或 Context 获取
          // 由于 loader 在组件外运行，需要从 store 或单例获取
          const user = getCurrentUser(); // 从 store 获取
          const pathname = new URL(request.url).pathname;

          if (!user) {
            const params = new URLSearchParams();
            params.set('from', pathname);
            return redirect('/login?' + params.toString());
          }

          // 角色检查
          if (route.meta?.roles && !route.meta.roles.some((r) => user.roles.includes(r))) {
            return redirect('/forbidden');
          }

          // 权限检查
          if (route.meta?.permissions) {
            const hasPerm = route.meta.permissions.every((p) => user.permissions.includes(p));
            if (!hasPerm) return redirect('/forbidden');
          }

          return null;
        };
      }

      if (route.children) {
        processed.children = processRoutes(route.children);
      }

      return processed;
    });
  }

  return createBrowserRouter(processRoutes(routes) as Parameters<typeof createBrowserRouter>[0]);
}

// 从 store 获取当前用户（示例）
function getCurrentUser(): AuthUser | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  return {
    id: '1',
    name: '张三',
    roles: ['admin'],
    permissions: ['read:posts', 'write:posts', 'delete:posts', 'manage:users'],
  };
}

// 动态生成导航菜单：根据用户权限过滤可见菜单
function useFilteredNav() {
  const { user } = useAuth();
  return useMemo(() => {
    if (!user) return [];
    return getNavItems(routeConfig, user);
  }, [user]);
}

function getNavItems(routes: RouteConfig[], user: AuthUser, basePath = '') {
  const items: Array<{ path: string; title: string }> = [];
  routes.forEach((route) => {
    if (route.meta?.hidden) return;
    if (route.meta?.roles && !route.meta.roles.some((r) => user.roles.includes(r))) return;
    if (route.meta?.permissions && !route.meta.permissions.every((p) => user.permissions.includes(p))) return;

    const fullPath = route.path ? (basePath + '/' + route.path).replace(/\/+/g, '/') : basePath;
    if (route.meta?.title && route.element && !route.children) {
      items.push({ path: fullPath, title: route.meta.title });
    }
    if (route.children) {
      items.push(...getNavItems(route.children, user, fullPath));
    }
  });
  return items;
}

import { useMemo } from 'react';
\`\`\`

### HOC withAuth 高阶组件守卫

除了组件方式，还可以使用高阶组件（HOC）来包装需要权限的组件。HOC 方式更适合包装单个组件级别的权限控制。

\`\`\`tsx
import { ComponentType, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// withAuth HOC：包装组件，未登录重定向
function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options?: { redirectTo?: string }
) {
  return function WithAuthComponent(props: P) {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
      if (!isLoading && !user) {
        navigate(options?.redirectTo || '/login', {
          state: { from: location },
          replace: true,
        });
      }
    }, [user, isLoading, navigate, location]);

    if (isLoading) return <div>加载中...</div>;
    if (!user) return null;

    return <WrappedComponent {...props} />;
  };
}

// withRole HOC：角色检查
function withRole<P extends object>(
  WrappedComponent: ComponentType<P>,
  roles: string[]
) {
  return function WithRoleComponent(props: P) {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (user && !roles.some((r) => user.roles.includes(r))) {
        navigate('/forbidden', { replace: true });
      }
    }, [user, navigate]);

    if (!user) return null;
    if (!roles.some((r) => user.roles.includes(r))) return null;

    return <WrappedComponent {...props} />;
  };
}

// 使用 HOC
const ProtectedProfile = withAuth(ProfilePage);
const AdminOnly = withRole(AdminUsersPage, ['admin']);

// HOC 可以组合使用
const AdminWithAuth = withAuth(withRole(AdminUsersPage, ['admin']));

// 根应用入口
function App() {
  const router = createProtectedRouter(routeConfig);
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

function MainLayout() {
  const navItems = useFilteredNav();
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="block px-3 py-2 rounded hover:bg-gray-700"
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50">
        <header className="bg-white shadow p-4 flex justify-between">
          <span>{user?.name}</span>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

function ProfilePage() {
  return <div className="p-8"><h1 className="text-2xl">个人中心</h1></div>;
}

function NotFoundPage() {
  return <div className="p-8 text-center"><h1>404</h1></div>;
}

import { Link, Outlet, RouterProvider } from 'react-router-dom';
\`\`\``,
  },
  {
    id: "tsrx-router-patterns",
    group: "路由篇",
    icon: "🔄",
    title: "路由模式与高级技巧",
    content: `## 路由模式与高级技巧

掌握 React Router 的高级模式可以让你的应用体验更上一层楼。useSearchParams 管理 URL 查询参数实现可分享的筛选状态，location.state 实现模态框背景路由，ScrollRestoration 滚动恢复，useMatches 面包屑导航，以及路由代码分割等高级模式。

### useSearchParams URL 查询参数管理

useSearchParams 用于读写 URL 中的查询参数（?keyword=xxx&page=1&sort=date），非常适合搜索、筛选、分页等场景。将筛选状态同步到 URL 的好处是：用户可以分享链接、刷新页面后状态保留、浏览器前进后退能恢复状态。

\`\`\`tsx
import { useSearchParams, useLoaderData, defer, Await, Link } from 'react-router-dom';
import { Suspense, useMemo } from 'react';

// 示例：商品列表页，支持搜索、筛选、分页、排序
async function searchProducts({ request }: { request: Request }) {
  const url = new URL(request.url);
  const keyword = url.searchParams.get('keyword') || '';
  const category = url.searchParams.get('category') || 'all';
  const page = Number(url.searchParams.get('page')) || 1;
  const sort = url.searchParams.get('sort') || 'newest';
  const pageSize = 12;

  // 模拟 API 请求
  await new Promise((r) => setTimeout(r, 300));
  const allProducts = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: \`商品 \${i + 1}\`,
    price: Math.floor(Math.random() * 500) + 50,
    category: ['electronics', 'clothing', 'books'][i % 3],
    createdAt: Date.now() - i * 86400000,
  }));

  let filtered = allProducts;
  if (keyword) {
    filtered = filtered.filter((p) => p.name.includes(keyword));
  }
  if (category !== 'all') {
    filtered = filtered.filter((p) => p.category === category);
  }

  // 排序
  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else filtered.sort((a, b) => b.createdAt - a.createdAt);

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const products = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { products, total, totalPages, page };
}

function ProductsSearchPage() {
  // useSearchParams 返回 [searchParams, setSearchParams]
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, total, totalPages, page } = useLoaderData() as Awaited<ReturnType<typeof searchProducts>>;

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'newest';

  // 更新搜索参数的辅助函数
  const updateParams = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    // 筛选变化时重置页码到1
    if ('category' in updates || 'keyword' in updates || 'sort' in updates) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('keyword') as HTMLInputElement;
    updateParams({ keyword: input.value || undefined });
  };

  const categories = [
    { value: 'all', label: '全部分类' },
    { value: 'electronics', label: '电子产品' },
    { value: 'clothing', label: '服装' },
    { value: 'books', label: '图书' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">商品搜索</h1>

      {/* 搜索栏 */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          name="keyword"
          defaultValue={keyword}
          placeholder="搜索商品..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg">
          搜索
        </button>
      </form>

      {/* 筛选和排序 */}
      <div className="flex gap-4 mb-6">
        <select
          value={category}
          onChange={(e) => updateParams({ category: e.target.value })}
          className="px-3 py-2 border rounded-lg"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="newest">最新</option>
          <option value="price-asc">价格从低到高</option>
          <option value="price-desc">价格从高到低</option>
        </select>

        <span className="ml-auto text-gray-500">共 {total} 件商品</span>
      </div>

      {/* 商品网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {products.map((product: { id: number; name: string; price: number; category: string }) => (
          <Link
            key={product.id}
            to={\`/products/\${product.id}\`}
            className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition"
          >
            <div className="h-32 bg-gray-100 rounded mb-2"></div>
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-red-500 font-bold">¥{product.price}</p>
            <p className="text-xs text-gray-400">{product.category}</p>
          </Link>
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => updateParams({ page: String(p) })}
              className={\`w-10 h-10 rounded \${
                page === p ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }\`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
\`\`\`

### location.state 隐式传值与模态框模式

location.state 可以在页面间传递不需要出现在 URL 中的数据。经典场景是模态框（Modal）叠加在背景页面上，比如点击图片列表中的图片，弹出模态框显示大图，背景仍然是列表页，关闭模态框后回到列表。

\`\`\`tsx
import { useLocation, useNavigate, Outlet, useParams } from 'react-router-dom';

// ============ 模态框路由模式 ============
// 路由配置：
// /images - 图片列表
// /images/:id - 图片详情（正常页面）
// 当从列表页点击时，以模态框形式展示，背景仍然是列表

function ImagesLayout() {
  const location = useLocation();
  // 通过 location.state 判断是否以模态框形式展示
  const isModal = location.state?.modal;
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <div>
      {/* 背景页面：如果是模态框，显示之前的页面；否则显示 Outlet */}
      {backgroundLocation && isModal ? (
        <Outlet context={{ backgroundLocation }} />
      ) : (
        <Outlet />
      )}

      {/* 模态框 */}
      {isModal && (
        <ImageModal />
      )}
    </div>
  );
}

function ImageModal() {
  const navigate = useNavigate();
  const { imageId } = useParams();
  const [image, setImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    setImage({ url: \`https://picsum.photos/800/600?random=\${imageId}\`, title: \`图片 \${imageId}\` });
  }, [imageId]);

  const closeModal = () => {
    // navigate(-1) 返回上一页，关闭模态框
    navigate(-1);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={closeModal}
    >
      <div
        className="bg-white rounded-lg max-w-3xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {image && (
          <>
            <img src={image.url} alt={image.title} className="w-full" />
            <div className="p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">{image.title}</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                ✕ 关闭
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ImagesListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const images = Array.from({ length: 20 }, (_, i) => i + 1);

  const openImage = (id: number) => {
    // 跳转时传入 backgroundLocation（当前位置）和 modal: true
    navigate(\`/images/\${id}\`, {
      state: {
        modal: true,
        backgroundLocation: location,
      },
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">图片库</h1>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((id) => (
          <button
            key={id}
            onClick={() => openImage(id)}
            className="aspect-square rounded-lg overflow-hidden hover:ring-2 ring-blue-500 transition"
          >
            <img
              src={\`https://picsum.photos/200/200?random=\${id}\`}
              alt={\`图片 \${id}\`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function ImageDetailPage() {
  const { imageId } = useParams();
  return (
    <div className="p-6">
      <Link to="/images" className="text-blue-500 mb-4 inline-block">← 返回列表</Link>
      <img
        src={\`https://picsum.photos/800/600?random=\${imageId}\`}
        alt={\`图片 \${imageId}\`}
        className="w-full rounded-lg"
      />
      <h1 className="text-2xl font-bold mt-4">图片 {imageId}</h1>
      <p className="text-gray-600">图片详情页面（非模态框模式）</p>
    </div>
  );
}

import { Link, useNavigate as useNavAlias } from 'react-router-dom';
import { useState, useEffect } from 'react';
\`\`\`

### 面包屑导航 useMatches 与 ScrollRestoration

useMatches 返回当前匹配的所有路由层级，可以配合 handle.crumb 数据实现面包屑导航。React Router v6 还提供了 ScrollRestoration 组件来管理滚动位置，类似浏览器原生的滚动恢复行为。

\`\`\`tsx
import {
  useMatches,
  UIMatch,
  ScrollRestoration,
  Outlet,
  Link,
  useBeforeUnload,
} from 'react-router-dom';

// 在路由配置中使用 handle 定义面包屑数据
const routerWithCrumbs = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    handle: { crumb: () => '首页' },
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'products',
        element: <Outlet />,
        handle: { crumb: () => <Link to="/products">商品管理</Link> },
        children: [
          {
            index: true,
            element: <ProductsListPage />,
          },
          {
            path: ':category',
            element: <Outlet />,
            // crumb 可以是函数，接收 data（loader 返回的数据）和 params
            handle: {
              crumb: (data: { categoryName?: string }, params: { category?: string }) =>
                data?.categoryName || params?.category || '分类',
            },
            children: [
              {
                index: true,
                element: <CategoryPage />,
              },
              {
                path: ':productId',
                element: <ProductDetailPage />,
                // loader 可以返回数据给 crumb 使用
                loader: async ({ params }) => {
                  return json({ productName: \`商品 \${params.productId}\` });
                },
                handle: {
                  crumb: (data: { productName?: string }) => data?.productName || '商品详情',
                },
              },
            ],
          },
        ],
      },
    ],
  },
]);

// 面包屑组件
function Breadcrumbs() {
  const matches = useMatches() as UIMatch<unknown, { crumb?: (data: unknown, params: Record<string, string>) => ReactNode }>[];

  // 过滤出有 crumb 的路由
  const crumbs = matches
    .filter((match) => match.handle?.crumb)
    .map((match) => ({
      path: match.pathname,
      crumb: match.handle.crumb!(match.data, match.params),
    }));

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 p-4 bg-white border-b">
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-2">
          {i > 0 && <span>/</span>}
          {i === crumbs.length - 1 ? (
            <span className="text-gray-900 font-medium">{crumb.crumb}</span>
          ) : (
            <span>{crumb.crumb}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

// 布局组件，包含 ScrollRestoration
function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumbs />
      <Outlet />
      {/* ScrollRestoration 会模拟浏览器的滚动恢复行为
          回退/前进时恢复滚动位置，导航到新页面滚动到顶部 */}
      <ScrollRestoration
        getKey={(location) => {
          // 对于模态框路由，使用相同的 key 保持背景滚动位置
          if (location.state?.modal) {
            return location.state.backgroundLocation?.pathname || location.pathname;
          }
          return location.pathname;
        }}
      />
    </div>
  );
}
\`\`\`

### useBlocker 离开确认与 React.lazy 代码分割

useBlocker 可以阻止用户在有未保存更改时离开页面。配合 React.lazy 和 Suspense 可以实现路由级别的代码分割，优化首屏加载性能。

\`\`\`tsx
import { useBlocker, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

// 表单编辑页：未保存时离开提示
function EditArticlePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const formRef = useRef<{ title: string; content: string }>({ title: '', content: '' });

  // 跟踪表单是否被修改
  useEffect(() => {
    const hasChanges = title !== formRef.current.title || content !== formRef.current.content;
    setIsDirty(hasChanges && !!(title || content));
  }, [title, content]);

  // 阻止页面内导航（React Router 跳转）
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  // 阻止浏览器刷新/关闭页面（beforeunload 事件）
  useBeforeUnload(
    (event) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = '您有未保存的更改';
      }
    },
    { capture: true }
  );

  const handleSave = () => {
    formRef.current = { title, content };
    setIsDirty(false);
    alert('保存成功！');
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">编辑文章</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg"
        >
          保存
        </button>
      </div>

      {/* 离开确认对话框 */}
      {blocker.state === 'blocked' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold mb-2">⚠️ 未保存的更改</h3>
            <p className="text-gray-600 mb-4">您有未保存的更改，确定要离开吗？</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => blocker.reset()}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                继续编辑
              </button>
              <button
                onClick={() => blocker.proceed()}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                确定离开
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ React.lazy 路由代码分割 ============
// 使用 React.lazy + Suspense 实现路由级别的代码分割
import { lazy, Suspense } from 'react';

// 懒加载页面组件
const LazyHome = lazy(() => import('./pages/Home'));
const LazyPosts = lazy(() => import('./pages/Posts'));
const LazyPostDetail = lazy(() => import('./pages/PostDetail'));
const LazyAbout = lazy(() => import('./pages/About'));

// 加载中显示的 fallback 组件
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500">页面加载中...</p>
      </div>
    </div>
  );
}

// 包装懒加载组件的工具函数
function withSuspense<T extends object>(Component: React.ComponentType<T>) {
  return function WithSuspenseWrapper(props: T) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// createBrowserRouter 中使用 lazy 导入（React Router 原生支持）
const routerWithLazy = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { HomePage } = await import('./pages/Home');
          return { Component: HomePage };
        },
      },
      {
        path: 'posts',
        lazy: async () => {
          const { PostsPage } = await import('./pages/Posts');
          return { Component: withSuspense(PostsPage) };
        },
      },
      {
        path: 'posts/:id',
        lazy: async () => {
          const { PostDetailPage } = await import('./pages/PostDetail');
          return { Component: PostDetailPage, loader: postDetailLoader };
        },
      },
      {
        path: 'about',
        lazy: async () => {
          const { AboutPage } = await import('./pages/About');
          return { Component: AboutPage };
        },
      },
    ],
  },
]);

async function postDetailLoader({ params }: { params: { id: string } }) {
  return json({ id: params.id });
}

import { json, useBeforeUnload } from 'react-router-dom';
\`\`\``,
  },
  {
    id: "tsrx-form-controlled",
    group: "表单篇",
    icon: "📝",
    title: "受控组件与表单基础",
    content: `## 受控组件与表单基础

React 表单处理有两种模式：受控组件和非受控组件。受控组件将表单数据绑定到 React state，通过 onChange 更新，是 React 推荐的单向数据流方式；非受控组件使用 defaultValue 和 useRef 直接从 DOM 获取值，适用于简单场景、文件上传或快速原型。

### 受控组件 vs 非受控组件

受控组件中，表单数据由 React 组件管理，value 绑定 state，onChange 更新 state，数据流单向可控。非受控组件中，表单数据由 DOM 本身管理，使用 ref 获取值。理解两者的区别和适用场景是 React 表单开发的基础。

\`\`\`tsx
import { useState, useRef, FormEvent, ChangeEvent } from 'react';

// ============ 受控组件示例 ============
// React 推荐方式：单向数据流，state 是唯一数据源
function ControlledForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // 所有数据都在 state 中，可以直接使用
    console.log('提交数据:', { name, email, bio });
    alert(\`提交成功！\n姓名: \${name}\n邮箱: \${email}\`);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">受控表单示例</h2>
      <div>
        <label className="block text-sm font-medium mb-1">姓名</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="请输入姓名"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">邮箱</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="请输入邮箱"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">简介</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="介绍一下自己"
        />
      </div>
      <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-lg">
        提交
      </button>
      <p className="text-sm text-gray-500">
        当前输入: {name} / {email}
      </p>
    </form>
  );
}

// ============ 非受控组件示例 ============
// 使用 defaultValue 和 useRef，数据在 DOM 中
function UncontrolledForm() {
  // useRef 创建引用，用于访问 DOM 元素
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // 通过 ref.current.value 获取输入值
    const data = {
      name: nameRef.current?.value || '',
      email: emailRef.current?.value || '',
      bio: bioRef.current?.value || '',
    };
    console.log('非受控提交:', data);
    alert(\`提交成功！\n姓名: \${data.name}\`);
  };

  // reset：非受控组件可以直接调用 form.reset()
  const formRef = useRef<HTMLFormElement>(null);
  const handleReset = () => {
    formRef.current?.reset();
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="max-w-md space-y-4 p-6 bg-white rounded-lg shadow"
    >
      <h2 className="text-xl font-bold mb-4">非受控表单示例</h2>
      <div>
        <label className="block text-sm font-medium mb-1">姓名</label>
        <input
          type="text"
          ref={nameRef}
          defaultValue=""
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="请输入姓名"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">邮箱</label>
        <input
          type="email"
          ref={emailRef}
          defaultValue=""
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="请输入邮箱"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">简介</label>
        <textarea
          ref={bioRef}
          defaultValue=""
          rows={3}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="介绍一下自己"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 py-2 bg-blue-500 text-white rounded-lg">
          提交
        </button>
        <button type="button" onClick={handleReset} className="px-4 py-2 bg-gray-200 rounded-lg">
          重置
        </button>
      </div>
    </form>
  );
}

// ============ 对比说明 ============
/**
 * 受控组件优点：
 * 1. 即时验证：每次输入都可以校验
 * 2. 条件禁用按钮：根据输入动态控制
 * 3. 输入格式化：如手机号自动加横线
 * 4. 数据完全可控
 *
 * 非受控组件优点：
 * 1. 代码简单，不需要为每个字段写 state
 * 2. 文件上传必须用非受控（<input type="file">）
 * 3. 集成非 React 代码更容易
 * 4. 快速原型开发
 *
 * 选择建议：
 * - 大多数表单：受控组件
 * - 非常简单的表单：非受控组件
 * - 文件上传：非受控组件（必须）
 * - 多字段复杂表单：考虑 React Hook Form（见后续章节）
 */
\`\`\`

### 各类表单控件处理

React 中不同类型的表单控件有不同的处理方式：text/number 使用 value+onChange，checkbox 使用 checked，radio 使用 name 分组和 value，select 使用 value+onChange，文件上传使用非受控 ref 配合 FileReader。

\`\`\`tsx
import { useState, useRef, ChangeEvent } from 'react';

function AllControlsForm() {
  // ============ 文本类型 ============
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // number 类型：value 永远是 string，需要手动转 number
  const [age, setAge] = useState<string>('');
  const [bio, setBio] = useState('');

  // ============ 复选框 ============
  // 单个 checkbox：boolean checked
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  // 多个 checkbox：使用数组或 Set
  const [hobbies, setHobbies] = useState<string[]>([]);

  // ============ 单选框 ============
  const [gender, setGender] = useState('');

  // ============ 下拉选择 ============
  const [city, setCity] = useState('');
  // 多选 select
  const [skills, setSkills] = useState<string[]>([]);

  // ============ 文件上传 ============
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 处理多选 checkbox
  const handleHobbyChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (e.target.checked) {
      setHobbies([...hobbies, value]);
    } else {
      setHobbies(hobbies.filter((h) => h !== value));
    }
  };

  // 处理多选 select
  const handleSkillsChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setSkills(selected);
  };

  // 处理文件上传 + 预览
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // 使用 FileReader 预览图片
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      username,
      password,
      age: age ? Number(age) : null,
      bio,
      subscribeNewsletter,
      hobbies,
      gender,
      city,
      skills,
      fileName: selectedFile?.name,
    };
    console.log('完整表单数据:', formData);
    alert('表单提交成功！查看控制台获取完整数据');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold">各类表单控件演示</h2>

      {/* 文本输入 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* 数字输入 */}
      <div>
        <label className="block text-sm font-medium mb-1">年龄 (number 类型转数字)</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          min="0"
          max="120"
          className="w-full px-3 py-2 border rounded-lg"
        />
        <p className="text-xs text-gray-500 mt-1">type="number" 的 value 仍是 string，需 Number() 转换</p>
      </div>

      {/* 多行文本 */}
      <div>
        <label className="block text-sm font-medium mb-1">个人简介</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {/* 单个 checkbox */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={subscribeNewsletter}
            onChange={(e) => setSubscribeNewsletter(e.target.checked)}
            className="w-4 h-4"
          />
          <span>订阅新闻邮件</span>
        </label>
      </div>

      {/* 多个 checkbox 组 */}
      <div>
        <label className="block text-sm font-medium mb-2">兴趣爱好 (多选)</label>
        <div className="flex gap-4">
          {['阅读', '运动', '音乐', '旅行', '编程'].map((hobby) => (
            <label key={hobby} className="flex items-center gap-1">
              <input
                type="checkbox"
                value={hobby}
                checked={hobbies.includes(hobby)}
                onChange={handleHobbyChange}
              />
              <span className="text-sm">{hobby}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 单选框 radio */}
      <div>
        <label className="block text-sm font-medium mb-2">性别</label>
        <div className="flex gap-4">
          {['男', '女', '保密'].map((g) => (
            <label key={g} className="flex items-center gap-1">
              <input
                type="radio"
                name="gender"
                value={g}
                checked={gender === g}
                onChange={(e) => setGender(e.target.value)}
              />
              <span className="text-sm">{g}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 下拉选择 select */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">所在城市</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">请选择</option>
            <option value="beijing">北京</option>
            <option value="shanghai">上海</option>
            <option value="guangzhou">广州</option>
            <option value="shenzhen">深圳</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">技能 (多选)</label>
          <select
            multiple
            value={skills}
            onChange={handleSkillsChange}
            className="w-full px-3 py-2 border rounded-lg h-24"
          >
            <option value="react">React</option>
            <option value="vue">Vue</option>
            <option value="angular">Angular</option>
            <option value="node">Node.js</option>
            <option value="python">Python</option>
          </select>
        </div>
      </div>

      {/* 文件上传 */}
      <div>
        <label className="block text-sm font-medium mb-1">上传头像</label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="w-full"
        />
        {previewUrl && (
          <div className="mt-2">
            <img src={previewUrl} alt="预览" className="w-24 h-24 object-cover rounded" />
          </div>
        )}
      </div>

      <button type="submit" className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium">
        提交
      </button>
    </form>
  );
}
\`\`\`

### FormData API 与表单重置

FormData API 提供了一种便捷方式从表单元素收集数据，无需为每个字段单独绑定 state。配合 Object.fromEntries 可以快速转换为普通对象。表单重置可以使用 form.reset() 方法或将 state 重置为初始值。

\`\`\`tsx
import { useState, FormEvent } from 'react';

// ============ 使用 FormData API ============
function FormDataDemo() {
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // new FormData(formElement) 自动收集所有带 name 属性的字段
    const formData = new FormData(e.currentTarget);

    // 方式1：遍历 entries
    const data: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      // 处理多选：如果 key 已存在，转为数组
      if (data[key]) {
        data[key] = Array.isArray(data[key]) ? [...data[key] as unknown[], value] : [data[key], value];
      } else {
        data[key] = value;
      }
    });

    // 方式2：Object.fromEntries（不支持多选/文件）
    // const data = Object.fromEntries(formData);

    setSubmittedData(data);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold">FormData API 示例</h2>
        <div>
          <label className="block text-sm font-medium mb-1">姓名 (name="fullname")</label>
          <input
            type="text"
            name="fullname"
            defaultValue="张三"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">邮箱 (name="email")</label>
          <input
            type="email"
            name="email"
            defaultValue="z*******@***********"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">标签 (多选)</label>
          <div className="flex gap-3">
            {['React', 'Vue', 'Angular'].map((tag) => (
              <label key={tag} className="flex items-center gap-1">
                <input type="checkbox" name="tags" value={tag} defaultChecked={tag === 'React'} />
                <span className="text-sm">{tag}</span>
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-lg">
          使用 FormData 提交
        </button>
      </form>

      {submittedData && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">提交的数据：</h3>
          <pre className="text-sm overflow-auto">{JSON.stringify(submittedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

// ============ 受控组件的表单重置 ============
function ResetDemo() {
  // 定义初始值
  const initialValues = {
    username: '',
    email: '',
    role: 'user',
  };

  const [formData, setFormData] = useState(initialValues);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('提交:', formData);
    setSubmitted(true);
  };

  // 方式1：重置为初始值
  const handleReset = () => {
    setFormData(initialValues);
    setSubmitted(false);
  };

  // 判断表单是否被修改（dirty 状态）
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialValues);

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">表单重置示例</h2>
      {submitted && (
        <div className="p-3 bg-green-50 text-green-700 rounded">提交成功！</div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">用户名</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">邮箱</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">角色</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="user">普通用户</option>
          <option value="editor">编辑</option>
          <option value="admin">管理员</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 py-2 bg-blue-500 text-white rounded-lg">
          提交
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={!isDirty}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          重置
        </button>
      </div>
      {isDirty && <p className="text-sm text-orange-500">表单已修改，重置可恢复初始值</p>}
    </form>
  );
}

// ============ 多字段表单痛点 ============
/**
 * 当表单字段较多时（如10+字段），受控组件方式会变得繁琐：
 * 1. 每个字段都要写 useState
 * 2. 每个字段都要单独写 onChange
 * 3. 需要手动维护 types
 * 4. 验证逻辑分散
 *
 * 解决方案：
 * 1. 使用单个 useState 管理整个表单对象（见 ResetDemo）
 * 2. 使用 name 属性统一处理 onChange（handleChange 模式）
 * 3. 使用 React Hook Form（推荐，见后续章节）
 */
\`\`\``,
  },
  {
    id: "tsrx-form-validation",
    group: "表单篇",
    icon: "✅",
    title: "表单验证策略",
    content: `## 表单验证策略

表单验证是保证数据质量的关键环节。常见的验证策略包括即时验证（onChange/onBlur 实时校验）、提交时整体验证、异步验证（如用户名唯一性检查）。配合 Zod 等 Schema 验证库可以声明式地定义验证规则，获得类型安全和清晰的错误提示。

### 即时验证与错误状态管理

即时验证在用户输入时或失焦时进行校验，提供实时反馈。需要维护一个 errors 对象来存储每个字段的错误消息，根据 touched/dirty 状态决定何时显示错误。

\`\`\`tsx
import { useState, FormEvent, ChangeEvent, useCallback } from 'react';

// ============ 验证函数抽象 ============
// 可复用的验证器函数
const validators = {
  required: (value: string, message = '此字段为必填') => {
    return value.trim() ? null : message;
  },
  minLength: (min: number, message?: string) => (value: string) => {
    return value.length >= min ? null : message || \`至少 \${min} 个字符\`;
  },
  maxLength: (max: number, message?: string) => (value: string) => {
    return value.length <= max ? null : message || \`最多 \${max} 个字符\`;
  },
  email: (value: string) => {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(value) ? null : '请输入有效的邮箱地址';
  },
  pattern: (regex: RegExp, message: string) => (value: string) => {
    return regex.test(value) ? null : message;
  },
  match: (getCompareValue: () => string, message: string) => (value: string) => {
    return value === getCompareValue() ? null : message;
  },
};

// ============ 注册表单验证 ============
interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface TouchedFields {
  username: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
}

function RegisterFormWithValidation() {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [touched, setTouched] = useState<TouchedFields>({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // 验证单个字段
  const validateField = useCallback((name: keyof RegisterFormData, value: string) => {
    let error: string | null = null;

    switch (name) {
      case 'username':
        error = validators.required(value, '请输入用户名')
          || validators.minLength(3, '用户名至少3个字符')(value)
          || validators.maxLength(20, '用户名最多20个字符')(value)
          || validators.pattern(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')(value);
        break;
      case 'email':
        error = validators.required(value, '请输入邮箱')
          || validators.email(value);
        break;
      case 'password':
        error = validators.required(value, '请输入密码')
          || validators.minLength(8, '密码至少8个字符')(value);
        if (!error) {
          // 自定义密码强度：包含大小写字母和数字
          const hasUpperCase = /[A-Z]/.test(value);
          const hasLowerCase = /[a-z]/.test(value);
          const hasNumber = /[0-9]/.test(value);
          if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            error = '密码需包含大小写字母和数字';
          }
        }
        break;
      case 'confirmPassword':
        error = validators.required(value, '请确认密码')
          || validators.match(() => formData.password, '两次密码不一致')(value);
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === null;
  }, [formData.password]);

  // 验证所有字段
  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof RegisterFormData, string>> = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof RegisterFormData>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (!error) {
        // validateField 已经更新 errors state，这里手动设置用于返回结果
      } else {
        newErrors[key] = typeof error === 'string' ? error : '';
        isValid = false;
      }
    });

    return isValid;
  }, [formData, validateField]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 如果字段已被 touched，即时验证
    if (touched[name as keyof RegisterFormData]) {
      validateField(name as keyof RegisterFormData, value);
    }

    // 如果是密码字段，且确认密码已有值，重新验证确认密码
    if (name === 'password' && formData.confirmPassword) {
      validateField('confirmPassword', formData.confirmPassword);
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name as keyof RegisterFormData, value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // 标记所有字段为 touched
    setTouched({ username: true, email: true, password: true, confirmPassword: true });

    if (validateAll()) {
      alert(\`注册成功！\n用户名: \${formData.username}\n邮箱: \${formData.email}\`);
    }
  };

  // 密码强度指示器
  const passwordStrength = (() => {
    const pwd = formData.password;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  })();

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabels = ['很弱', '弱', '一般', '强', '很强'];

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold">注册 - 即时验证</h2>

      <div>
        <label className="block text-sm font-medium mb-1">用户名</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          onBlur={handleBlur}
          className={\`w-full px-3 py-2 border rounded-lg \${
            touched.username && errors.username ? 'border-red-500' : ''
          }\`}
        />
        {touched.username && errors.username && (
          <p className="text-red-500 text-sm mt-1">{errors.username}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">邮箱</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={\`w-full px-3 py-2 border rounded-lg \${
            touched.email && errors.email ? 'border-red-500' : ''
          }\`}
        />
        {touched.email && errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">密码</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          className={\`w-full px-3 py-2 border rounded-lg \${
            touched.password && errors.password ? 'border-red-500' : ''
          }\`}
        />
        {formData.password && (
          <div className="mt-1">
            <div className="flex gap-1 h-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={\`flex-1 rounded \${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'}\`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">密码强度: {strengthLabels[passwordStrength - 1] || '很弱'}</p>
          </div>
        )}
        {touched.password && errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">确认密码</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          className={\`w-full px-3 py-2 border rounded-lg \${
            touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : ''
          }\`}
        />
        {touched.confirmPassword && errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium">
        注册
      </button>
    </form>
  );
}
\`\`\`

### 异步验证与防抖

某些验证需要调用后端 API，如检查用户名是否已存在。异步验证需要使用 useEffect 和 AbortController 进行防抖和请求取消，避免每次按键都发送请求。

\`\`\`tsx
import { useState, useEffect, useRef, FormEvent } from 'react';

function AsyncValidationForm() {
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 异步验证用户名：防抖 + AbortController
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameError(null);
      setIsValid(false);
      return;
    }

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 创建新的 AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 防抖延迟
    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      setUsernameError(null);

      try {
        // 模拟 API 请求（实际项目中调用后端接口）
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(resolve, 800);
          controller.signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new Error('Aborted'));
          });
        });

        if (controller.signal.aborted) return;

        // 模拟已存在的用户名
        const existingUsernames = ['admin', 'root', 'test', 'user'];
        if (existingUsernames.includes(username.toLowerCase())) {
          setUsernameError('该用户名已被使用');
          setIsValid(false);
        } else {
          setUsernameError(null);
          setIsValid(true);
        }
      } catch {
        // 请求被取消，不处理
      } finally {
        if (!controller.signal.aborted) {
          setIsCheckingUsername(false);
        }
      }
    }, 500); // 500ms 防抖

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [username]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isValid && !isCheckingUsername) {
      alert(\`用户名 \${username} 可用，提交成功！\`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-xl font-bold">异步验证（用户名唯一性检查）</h2>
      <div>
        <label className="block text-sm font-medium mb-1">用户名</label>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={\`w-full px-3 py-2 border rounded-lg pr-10 \${
              usernameError ? 'border-red-500' : isValid ? 'border-green-500' : ''
            }\`}
            placeholder="输入用户名检查是否可用"
          />
          {isCheckingUsername && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!isCheckingUsername && isValid && username.length >= 3 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</span>
          )}
        </div>
        {isCheckingUsername && <p className="text-blue-500 text-sm mt-1">正在检查可用性...</p>}
        {usernameError && <p className="text-red-500 text-sm mt-1">{usernameError}</p>}
        {isValid && !isCheckingUsername && (
          <p className="text-green-500 text-sm mt-1">✓ 用户名可用</p>
        )}
      </div>
      <button
        type="submit"
        disabled={!isValid || isCheckingUsername}
        className="w-full py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
      >
        提交
      </button>
    </form>
  );
}
\`\`\`

### Zod Schema 基础验证

Zod 是一个 TypeScript 优先的 Schema 声明和验证库。使用 Zod 可以声明式定义验证规则，自动推导 TypeScript 类型，通过 safeParse 方法安全地解析数据并返回成功/失败结果，配合 flatten() 获取结构化的错误信息。

\`\`\`tsx
import { z } from 'zod';
import { useState, FormEvent } from 'react';

// ============ 安装 Zod：npm install zod ============

// ============ 基础 Zod Schema ============
// 字符串验证
const emailSchema = z.string().email('请输入有效的邮箱地址');
const passwordSchema = z
  .string()
  .min(8, '密码至少8位')
  .regex(/[A-Z]/, '需包含大写字母')
  .regex(/[a-z]/, '需包含小写字母')
  .regex(/[0-9]/, '需包含数字');

// 对象 Schema
const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, '用户名至少3个字符')
      .max(20, '用户名最多20个字符')
      .regex(/^[a-zA-Z0-9_]+$/, '只能包含字母、数字和下划线'),
    email: z.string().email('请输入有效的邮箱'),
    password: passwordSchema,
    confirmPassword: z.string(),
    age: z.coerce.number().min(18, '必须年满18岁').max(120, '年龄不合法').optional(),
    bio: z.string().max(500, '简介最多500字').optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, '必须同意服务条款'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次密码不一致',
    path: ['confirmPassword'], // 错误关联到 confirmPassword 字段
  });

// 从 Schema 推导 TypeScript 类型
type RegisterFormData = z.infer<typeof registerSchema>;

function ZodValidationForm() {
  const [formData, setFormData] = useState<Partial<RegisterFormData>>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? (value ? Number(value) : '') : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    // safeParse 安全解析：返回 { success: true, data } 或 { success: false, error }
    const result = registerSchema.safeParse(formData);

    if (!result.success) {
      // flatten() 将错误转换为 fieldErrors: { fieldName: [errorMsg] }
      const fieldErrors = result.error.flatten().fieldErrors;
      const formattedErrors: Record<string, string> = {};
      Object.entries(fieldErrors).forEach(([key, messages]) => {
        if (messages && messages.length > 0) {
          formattedErrors[key] = messages[0];
        }
      });
      setErrors(formattedErrors);
    } else {
      // result.data 是类型安全的 RegisterFormData
      console.log('验证通过:', result.data);
      setErrors({});
      setSuccess(true);
    }
  };

  // 原生表单手动集成 Zod 示例
  const handleNativeSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData);

    // 注意：checkbox 的值需要特殊处理
    const data = {
      ...rawData,
      agreeToTerms: formData.get('agreeToTerms') === 'on',
      age: rawData.age ? Number(rawData.age) : undefined,
    };

    const result = registerSchema.safeParse(data);
    if (result.success) {
      console.log('原生表单 Zod 验证通过:', result.data);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold">Zod 表单验证</h2>
        {success && (
          <div className="p-3 bg-green-50 text-green-700 rounded">验证通过！</div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">用户名</label>
          <input
            type="text"
            name="username"
            value={formData.username as string}
            onChange={handleChange}
            className={\`w-full px-3 py-2 border rounded-lg \${errors.username ? 'border-red-500' : ''}\`}
          />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">邮箱</label>
          <input
            type="email"
            name="email"
            value={formData.email as string}
            onChange={handleChange}
            className={\`w-full px-3 py-2 border rounded-lg \${errors.email ? 'border-red-500' : ''}\`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">密码</label>
          <input
            type="password"
            name="password"
            value={formData.password as string}
            onChange={handleChange}
            className={\`w-full px-3 py-2 border rounded-lg \${errors.password ? 'border-red-500' : ''}\`}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">确认密码</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword as string}
            onChange={handleChange}
            className={\`w-full px-3 py-2 border rounded-lg \${errors.confirmPassword ? 'border-red-500' : ''}\`}
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">年龄 (选填)</label>
          <input
            type="number"
            name="age"
            value={formData.age as number | ''}
            onChange={handleChange}
            className={\`w-full px-3 py-2 border rounded-lg \${errors.age ? 'border-red-500' : ''}\`}
          />
          {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms as boolean}
              onChange={handleChange}
            />
            <span className="text-sm">我同意服务条款</span>
          </label>
          {errors.agreeToTerms && <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>}
        </div>

        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-lg">
          注册
        </button>
      </form>
    </div>
  );
}
\`\`\``,
  },
  {
    id: "tsrx-react-hook-form",
    group: "表单篇",
    icon: "📋",
    title: "React Hook Form(RHF)+Zod完整方案",
    content: `## React Hook Form (RHF) + Zod 完整方案

React Hook Form 是 React 生态中最流行的表单库，它以非受控组件为基础，通过 ref 注册字段，最小化重渲染，性能优异。配合 @hookform/resolvers/zod 和 Zod，可以实现类型安全的表单验证，代码简洁且维护性强。

### useForm 基础与 register 字段注册

安装依赖：\`npm install react-hook-form @hookform/resolvers zod\`。useForm Hook 接收 defaultValues、resolver（验证器）、mode（验证触发时机）等配置，返回 register、handleSubmit、formState、control 等方法。

\`\`\`tsx
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ============ 定义 Zod Schema ============
const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  rememberMe: z.boolean().optional(),
});

// 从 Schema 推导表单类型
type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  // useForm 配置
  const {
    register, // 注册字段：连接 input 到 RHF
    handleSubmit, // 包装 onSubmit，验证通过后才执行
    formState: { errors, isSubmitting, isDirty, isValid },
    reset, // 重置表单
    setValue, // 手动设置字段值
    getValues, // 手动获取字段值
    watch, // 监听字段变化
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema), // 使用 Zod 作为验证器
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onBlur', // 验证时机：onBlur（失焦时验证）| onChange（实时）| onSubmit（提交时）| onTouched
  });

  // handleSubmit 包装提交函数，验证通过后才调用，data 已类型安全
  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    console.log('登录数据:', data);
    // 模拟 API 请求
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert(\`登录成功！\n邮箱: \${data.email}\`);
  };

  // watch 监听字段值（会导致重渲染，用于条件渲染/联动）
  const emailValue = watch('email');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-2xl font-bold">登录 - RHF 基础</h2>

      <div>
        <label className="block text-sm font-medium mb-1">邮箱</label>
        {/* register(name, rules?) 注册字段，返回 { onChange, onBlur, name, ref } */}
        <input
          type="email"
          {...register('email')}
          className={\`w-full px-3 py-2 border rounded-lg \${errors.email ? 'border-red-500' : ''}\`}
          placeholder="y**@***********"
        />
        {/* errors.fieldName?.message 获取错误消息 */}
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">密码</label>
        <input
          type="password"
          {...register('password')}
          className={\`w-full px-3 py-2 border rounded-lg \${errors.password ? 'border-red-500' : ''}\`}
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('rememberMe')} />
          <span className="text-sm">记住我</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
      >
        {isSubmitting ? '登录中...' : '登录'}
      </button>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="flex-1 py-2 bg-gray-200 rounded-lg"
        >
          重置
        </button>
        <button
          type="button"
          onClick={() => setValue('email', 'd***@***********')}
          className="flex-1 py-2 bg-gray-200 rounded-lg"
        >
          填充示例
        </button>
      </div>

      <p className="text-xs text-gray-400">
        当前邮箱: {emailValue || '(未输入)'}
      </p>
    </form>
  );
}
\`\`\`

### Controller 包装第三方受控组件

对于不支持 ref 的第三方受控组件（如 MUI DatePicker、Antd Select、自定义组件等），需要使用 Controller 组件或 useController Hook 将其接入 RHF 的状态管理。Controller 通过 render prop 提供 field 对象（包含 onChange、onBlur、value、name、ref）。

\`\`\`tsx
import { useForm, Controller, SubmitHandler, useController } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

// ============ 完整注册表单 Schema ============
const registerSchema = z
  .object({
    username: z.string().min(3, '至少3个字符').max(20, '最多20个字符'),
    email: z.string().email('邮箱格式不正确'),
    password: z
      .string()
      .min(8, '至少8位')
      .regex(/[A-Z]/, '需包含大写字母')
      .regex(/[a-z]/, '需包含小写字母')
      .regex(/[0-9]/, '需包含数字'),
    confirmPassword: z.string(),
    birthday: z.date({ required_error: '请选择生日', invalid_type_error: '日期格式不正确' }),
    gender: z.enum(['male', 'female', 'other'], { required_error: '请选择性别' }),
    country: z.string().min(1, '请选择国家'),
    bio: z.string().max(500, '最多500字').optional(),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: '必须同意条款' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次密码不一致',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

// ============ 自定义 UI 组件示例（模拟第三方组件） ============
// 自定义日期选择器（受控组件，不支持 ref）
function DatePicker({
  value,
  onChange,
  error,
}: {
  value?: Date;
  onChange: (date: Date | null) => void;
  error?: string;
}) {
  return (
    <div>
      <input
        type="date"
        value={value ? value.toISOString().split('T')[0] : ''}
        onChange={(e) => {
          const date = e.target.value ? new Date(e.target.value) : null;
          onChange(date);
        }}
        className={\`w-full px-3 py-2 border rounded-lg \${error ? 'border-red-500' : ''}\`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

// 自定义单选组
function RadioGroup({
  options,
  value,
  onChange,
  error,
}: {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <div className="flex gap-4">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-1">
            <input
              type="radio"
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="w-4 h-4"
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

// 自定义下拉选择
function Select({
  options,
  value,
  onChange,
  placeholder,
  error,
}: {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={\`w-full px-3 py-2 border rounded-lg \${error ? 'border-red-500' : ''}\`}
      >
        <option value="">{placeholder || '请选择'}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

function CompleteRegisterForm() {
  const {
    register,
    handleSubmit,
    control, // Controller 需要 control 对象
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      bio: '',
      agreeTerms: false,
    },
    mode: 'onTouched',
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    console.log('完整表单数据:', data);
    await new Promise((r) => setTimeout(r, 1000));
    alert('注册成功！');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-2xl font-bold">完整注册表单 - Controller 包装第三方组件</h2>

      <div>
        <label className="block text-sm font-medium mb-1">用户名</label>
        <input
          {...register('username')}
          className={\`w-full px-3 py-2 border rounded-lg \${errors.username ? 'border-red-500' : ''}\`}
        />
        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">邮箱</label>
        <input
          type="email"
          {...register('email')}
          className={\`w-full px-3 py-2 border rounded-lg \${errors.email ? 'border-red-500' : ''}\`}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">密码</label>
          <input
            type="password"
            {...register('password')}
            className={\`w-full px-3 py-2 border rounded-lg \${errors.password ? 'border-red-500' : ''}\`}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">确认密码</label>
          <input
            type="password"
            {...register('confirmPassword')}
            className={\`w-full px-3 py-2 border rounded-lg \${errors.confirmPassword ? 'border-red-500' : ''}\`}
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      {/* Controller 包装自定义日期选择器 */}
      <div>
        <label className="block text-sm font-medium mb-1">生日</label>
        <Controller
          name="birthday"
          control={control}
          render={({ field }) => (
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              error={errors.birthday?.message}
            />
          )}
        />
      </div>

      {/* Controller 包装自定义单选组 */}
      <div>
        <label className="block text-sm font-medium mb-1">性别</label>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <RadioGroup
              options={[
                { value: 'male', label: '男' },
                { value: 'female', label: '女' },
                { value: 'other', label: '其他' },
              ]}
              value={field.value}
              onChange={field.onChange}
              error={errors.gender?.message}
            />
          )}
        />
      </div>

      {/* Controller 包装自定义下拉选择 */}
      <div>
        <label className="block text-sm font-medium mb-1">国家/地区</label>
        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <Select
              options={[
                { value: 'cn', label: '中国' },
                { value: 'us', label: '美国' },
                { value: 'jp', label: '日本' },
                { value: 'uk', label: '英国' },
              ]}
              value={field.value}
              onChange={field.onChange}
              placeholder="选择国家"
              error={errors.country?.message}
            />
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">个人简介</label>
        <textarea
          {...register('bio')}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div>
        <Controller
          name="agreeTerms"
          control={control}
          render={({ field }) => (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.value || false}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              <span className="text-sm">我已阅读并同意服务条款和隐私政策</span>
            </label>
          )}
        />
        {errors.agreeTerms && <p className="text-red-500 text-sm mt-1">{errors.agreeTerms.message}</p>}
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {isSubmitting ? '注册中...' : '注册账号'}
        </button>
        <button
          type="button"
          onClick={() => reset()}
          className="px-6 py-3 bg-gray-200 rounded-lg"
        >
          清空
        </button>
      </div>
    </form>
  );
}
\`\`\`

### useFieldArray 动态字段数组

useFieldArray 用于管理动态增减的字段数组，如标签列表、多个联系人、多规格商品等。它提供 fields（字段数组）、append、prepend、remove、swap、move 等操作方法。

\`\`\`tsx
import { useForm, useFieldArray, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ============ Todo 编辑表单：多个标签 ============
const todoSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  // 标签数组：至少1个标签
  tags: z
    .array(
      z.object({
        id: z.string(),
        text: z.string().min(1, '标签内容不能为空'),
      })
    )
    .min(1, '至少添加一个标签'),
  // 子任务
  subtasks: z.array(
    z.object({
      id: z.string(),
      title: z.string().min(1, '子任务标题不能为空'),
      done: z.boolean(),
    })
  ),
});

type TodoFormValues = z.infer<typeof todoSchema>;

function TodoEditForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      tags: [{ id: crypto.randomUUID(), text: '' }],
      subtasks: [],
    },
  });

  // useFieldArray 管理动态标签
  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({
    control,
    name: 'tags',
  });

  // useFieldArray 管理动态子任务
  const {
    fields: subtaskFields,
    append: appendSubtask,
    remove: removeSubtask,
  } = useFieldArray({
    control,
    name: 'subtasks',
  });

  const onSubmit: SubmitHandler<TodoFormValues> = (data) => {
    console.log('Todo 数据:', data);
    alert('保存成功！');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-xl font-bold">编辑 Todo</h2>

      <div>
        <label className="block text-sm font-medium mb-1">标题</label>
        <input
          {...register('title')}
          className={\`w-full px-3 py-2 border rounded-lg \${errors.title ? 'border-red-500' : ''}\`}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">描述</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">优先级</label>
        <select {...register('priority')} className="w-full px-3 py-2 border rounded-lg">
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
        </select>
      </div>

      {/* 动态标签 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium">标签</label>
          <button
            type="button"
            onClick={() => appendTag({ id: crypto.randomUUID(), text: '' })}
            className="text-blue-500 text-sm hover:underline"
          >
            + 添加标签
          </button>
        </div>
        <div className="space-y-2">
          {tagFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(\`tags.\${index}.text\` as const)}
                placeholder="标签名称"
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              {tagFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="px-3 py-2 text-red-500 hover:bg-red-50 rounded"
                >
                  删除
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.tags?.root && <p className="text-red-500 text-sm mt-1">{errors.tags.root.message}</p>}
        {errors.tags?.message && <p className="text-red-500 text-sm mt-1">{errors.tags.message}</p>}
      </div>

      {/* 动态子任务 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium">子任务</label>
          <button
            type="button"
            onClick={() => appendSubtask({ id: crypto.randomUUID(), title: '', done: false })}
            className="text-blue-500 text-sm hover:underline"
          >
            + 添加子任务
          </button>
        </div>
        <div className="space-y-2">
          {subtaskFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Controller
                name={\`subtasks.\${index}.done\` as const}
                control={control}
                render={({ field: checkboxField }) => (
                  <input
                    type="checkbox"
                    checked={checkboxField.value}
                    onChange={(e) => checkboxField.onChange(e.target.checked)}
                    className="w-4 h-4"
                  />
                )}
              />
              <input
                {...register(\`subtasks.\${index}.title\` as const)}
                placeholder="子任务标题"
                className="flex-1 px-2 py-1 border rounded"
              />
              <button
                type="button"
                onClick={() => removeSubtask(index)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          {subtaskFields.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">暂无子任务，点击上方按钮添加</p>
          )}
        </div>
      </div>

      <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium mt-6">
        保存 Todo
      </button>
    </form>
  );
}
\`\`\`

### FormProvider、useFormContext 嵌套表单与完整登录 Demo

FormProvider 和 useFormContext 可以在深层嵌套的子组件中访问表单方法，无需通过 props 层层传递 register、control 等。这对于复杂的多步骤表单、拆分的表单组件非常有用。

\`\`\`tsx
import { useForm, FormProvider, useFormContext, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ============ 多步骤表单 Schema ============
const step1Schema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
});

const step2Schema = z.object({
  nickname: z.string().min(2, '昵称至少2个字符'),
  avatar: z.string().optional(),
});

const completeSchema = step1Schema.merge(step2Schema);
type CompleteFormValues = z.infer<typeof completeSchema>;

// ============ 子组件使用 useFormContext ============
// 不需要 props 传递 register/control，直接从 context 获取
function Step1Email() {
  const { register, formState: { errors } } = useFormContext<CompleteFormValues>();
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">步骤 1：账户信息</h3>
      <div>
        <label className="block text-sm font-medium mb-1">邮箱</label>
        <input
          type="email"
          {...register('email')}
          className={\`w-full px-3 py-2 border rounded-lg \${errors.email ? 'border-red-500' : ''}\`}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">密码</label>
        <input
          type="password"
          {...register('password')}
          className={\`w-full px-3 py-2 border rounded-lg \${errors.password ? 'border-red-500' : ''}\`}
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>
    </div>
  );
}

function Step2Profile() {
  const { register, formState: { errors } } = useFormContext<CompleteFormValues>();
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">步骤 2：个人资料</h3>
      <div>
        <label className="block text-sm font-medium mb-1">昵称</label>
        <input
          {...register('nickname')}
          className={\`w-full px-3 py-2 border rounded-lg \${errors.nickname ? 'border-red-500' : ''}\`}
        />
        {errors.nickname && <p className="text-red-500 text-sm mt-1">{errors.nickname.message}</p>}
      </div>
    </div>
  );
}

// ============ 多步骤表单主组件 ============
function MultiStepForm() {
  const methods = useForm<CompleteFormValues>({
    resolver: zodResolver(completeSchema),
    defaultValues: { email: '', password: '', nickname: '' },
    mode: 'onTouched',
  });

  const [step, setStep] = useState(1);
  const { handleSubmit, trigger } = methods;

  // 下一步：先验证当前步骤的字段
  const handleNext = async () => {
    const fieldsToValidate = step === 1 ? ['email', 'password'] : ['nickname'];
    const isValid = await trigger(fieldsToValidate as Array<keyof CompleteFormValues>);
    if (isValid) setStep(step + 1);
  };

  const onSubmit: SubmitHandler<CompleteFormValues> = (data) => {
    console.log('完整注册数据:', data);
    alert('注册成功！');
  };

  return (
    // FormProvider 将 methods 传递给所有子组件
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
        {/* 步骤指示器 */}
        <div className="flex items-center justify-center mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center">
              <div className={\`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium \${
                step >= s ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }\`}>
                {s}
              </div>
              {s < 2 && <div className={\`w-16 h-1 \${step > s ? 'bg-blue-500' : 'bg-gray-200'}\`} />}
            </div>
          ))}
        </div>

        {step === 1 && <Step1Email />}
        {step === 2 && <Step2Profile />}

        <div className="flex gap-2 mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 py-2 bg-gray-200 rounded-lg"
            >
              上一步
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-2 bg-blue-500 text-white rounded-lg"
            >
              下一步
            </button>
          ) : (
            <button
              type="submit"
              className="flex-1 py-2 bg-green-500 text-white rounded-lg"
            >
              完成注册
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

import { useState } from 'react';
\`\`\`

RHF + Zod 是 React 表单开发的黄金组合：RHF 负责表单状态管理、性能优化和事件处理，Zod 负责 Schema 定义、验证逻辑和类型推导。Controller/useController 兼容所有第三方 UI 库，useFieldArray 处理动态字段，FormProvider 支持跨组件状态共享，完全覆盖企业级表单开发的各种场景。`,
  },
];

