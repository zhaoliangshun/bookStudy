export const chapters = [
  {
    id: "tsrx-usereducer",
    group: "Hooks篇",
    icon: "🎛️",
    title: "useReducer复杂状态管理",
    content: `## useReducer 复杂状态管理

当组件状态逻辑变得复杂，包含多个子值，或者下一个状态依赖于之前的状态时，\`useReducer\` 会比 \`useState\` 更合适。它借鉴了 Redux 的 reducer 思想，但更加轻量，无需引入额外依赖。

### reducer 纯函数核心概念

\`reducer\` 是一个**纯函数**，接收当前 state 和一个 action 对象，返回新的 state：

\`\`\`tsx
// reducer 签名：(state, action) => newState
// 纯函数要求：相同输入永远产生相同输出，不产生副作用，不直接修改state
type CounterState = { count: number };
type CounterAction = 
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' }
  | { type: 'set'; payload: number };

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    case 'set':
      return { count: action.payload };
    // 穷尽检查：TypeScript 会报错如果有action类型没处理
    default:
      const _exhaustiveCheck: never = action;
      throw new Error(\`Unknown action: \${_exhaustiveCheck}\`);
  }
}
\`\`\`

### dispatch 分发 action

\`useReducer\` 返回一个 state 和一个 \`dispatch\` 函数，调用 dispatch 并传入 action 对象即可触发状态更新：

\`\`\`tsx
import { useReducer } from 'react';

function Counter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+1</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-1</button>
      <button onClick={() => dispatch({ type: 'reset' })}>重置</button>
      <button onClick={() => dispatch({ type: 'set', payload: 100 })}>设为100</button>
    </div>
  );
}
\`\`\`

### TodoList 完整 reducer 实现

下面是一个功能完整的 TodoList 应用，包含添加、切换完成、删除、编辑、过滤、清除已完成等所有功能：

\`\`\`tsx
// 定义类型
type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

type FilterType = 'all' | 'active' | 'completed';

type TodoState = {
  todos: Todo[];
  filter: FilterType;
  editingId: string | null;
};

type TodoAction =
  | { type: 'add'; payload: string }
  | { type: 'toggle'; payload: string }
  | { type: 'delete'; payload: string }
  | { type: 'edit'; payload: { id: string; text: string } }
  | { type: 'setFilter'; payload: FilterType }
  | { type: 'clearCompleted' }
  | { type: 'startEdit'; payload: string }
  | { type: 'cancelEdit' };

// 初始状态
const initialState: TodoState = {
  todos: [],
  filter: 'all',
  editingId: null,
};

// reducer 纯函数
function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'add':
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: action.payload.trim(),
        completed: false,
        createdAt: Date.now(),
      };
      return {
        ...state,
        todos: [...state.todos, newTodo],
      };
    case 'toggle':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };
    case 'delete':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload),
      };
    case 'edit':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, text: action.payload.text }
            : todo
        ),
        editingId: null,
      };
    case 'setFilter':
      return { ...state, filter: action.payload };
    case 'clearCompleted':
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed),
      };
    case 'startEdit':
      return { ...state, editingId: action.payload };
    case 'cancelEdit':
      return { ...state, editingId: null };
    default:
      const _exhaustiveCheck: never = action;
      throw new Error(\`Unknown action: \${_exhaustiveCheck}\`);
  }
}
\`\`\`

### 惰性初始化 init 函数

\`useReducer\` 接受第三个参数 \`init\` 函数，用于惰性计算初始状态。当初始状态需要昂贵计算或从 localStorage 读取时非常有用：

\`\`\`tsx
// 从 localStorage 读取初始状态的 init 函数
function init(initialArg: Todo[]): TodoState {
  try {
    const saved = localStorage.getItem('todos-tsrx');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse saved todos', e);
  }
  return {
    todos: initialArg,
    filter: 'all' as FilterType,
    editingId: null,
  };
}

function TodoApp() {
  // 第三个参数 init，第二个参数是传给 init 的参数
  const [state, dispatch] = useReducer(todoReducer, [], init);
  
  // 自动保存到 localStorage
  useEffect(() => {
    localStorage.setItem('todos-tsrx', JSON.stringify(state));
  }, [state]);

  const filteredTodos = state.todos.filter(todo => {
    if (state.filter === 'active') return !todo.completed;
    if (state.filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = state.todos.filter(t => !t.completed).length;
  const completedCount = state.todos.length - activeCount;

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">TodoList with useReducer</h1>
      
      {/* 添加todo输入框 */}
      <input
        type="text"
        placeholder="添加新任务..."
        className="w-full border p-2 rounded mb-4"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
            dispatch({ type: 'add', payload: e.currentTarget.value });
            e.currentTarget.value = '';
          }
        }}
      />

      {/* 过滤按钮 */}
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'completed'] as FilterType[]).map(filter => (
          <button
            key={filter}
            onClick={() => dispatch({ type: 'setFilter', payload: filter })}
            className={\`px-3 py-1 rounded \${
              state.filter === filter 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200'
            }\`}
          >
            {filter === 'all' ? '全部' : filter === 'active' ? '待完成' : '已完成'}
          </button>
        ))}
      </div>

      {/* Todo列表 */}
      <ul className="space-y-2">
        {filteredTodos.map(todo => (
          <li key={todo.id} className="flex items-center gap-2 p-2 border rounded">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch({ type: 'toggle', payload: todo.id })}
            />
            {state.editingId === todo.id ? (
              <input
                type="text"
                defaultValue={todo.text}
                className="flex-1 border p-1"
                autoFocus
                onBlur={(e) => dispatch({ 
                  type: 'edit', 
                  payload: { id: todo.id, text: e.target.value } 
                })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    dispatch({ 
                      type: 'edit', 
                      payload: { id: todo.id, text: e.currentTarget.value } 
                    });
                  }
                  if (e.key === 'Escape') {
                    dispatch({ type: 'cancelEdit' });
                  }
                }}
              />
            ) : (
              <span
                className={\`flex-1 \${todo.completed ? 'line-through text-gray-400' : ''}\`}
                onDoubleClick={() => dispatch({ type: 'startEdit', payload: todo.id })}
              >
                {todo.text}
              </span>
            )}
            <button
              onClick={() => dispatch({ type: 'delete', payload: todo.id })}
              className="text-red-500 hover:text-red-700"
            >
              删除
            </button>
          </li>
        ))}
      </ul>

      {/* 底部统计和操作 */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
        <span>{activeCount} 项待完成</span>
        {completedCount > 0 && (
          <button
            onClick={() => dispatch({ type: 'clearCompleted' })}
            className="text-red-500 hover:underline"
          >
            清除已完成 ({completedCount})
          </button>
        )}
      </div>
    </div>
  );
}
\`\`\`

### useReducer vs useState 选择指南

什么时候用 useReducer，什么时候用 useState？可以参考以下标准：

| 场景 | useState | useReducer |
| --- | --- | --- |
| 简单的独立状态（如数字、字符串、布尔值） | ✅ 首选 | ❌ 过度复杂 |
| 状态是对象/数组，有多个子字段 | ⚠️ 可以用但易混乱 | ✅ 更好 |
| 状态更新逻辑复杂，有多种类型的更新 | ⚠️ setState里写逻辑散 | ✅ reducer集中管理 |
| 下一个状态依赖前一个状态 | ⚠️ 用函数式更新 | ✅ reducer天然支持 |
| 状态更新可预测，需要可测试 | ❌ 难以单元测试 | ✅ reducer纯函数易测试 |
| 需要深层子组件触发状态更新 | ❌ props层层传递回调 | ✅ 配合useContext传dispatch |
| 状态变更有明确的状态转移 | ❌ 隐式的setState | ✅ action描述发生了什么 |

**经验法则**：如果你发现自己在写很多个相关的 \`useState\`，或者 setState 的逻辑越来越复杂（比如需要先判断某些条件再更新），那就是时候迁移到 useReducer 了。

### useReducer + useContext 小型全局状态

对于不需要 Redux 这类复杂状态管理库的中小型应用，useReducer + useContext 的组合完全够用：

\`\`\`tsx
import { createContext, useContext, useReducer, ReactNode } from 'react';

// 创建Context
type TodoContextType = {
  state: TodoState;
  dispatch: React.Dispatch<TodoAction>;
};

const TodoContext = createContext<TodoContextType | null>(null);

// Provider组件
function TodoProvider({ children, initialTodos = [] }: { 
  children: ReactNode;
  initialTodos?: Todo[];
}) {
  const [state, dispatch] = useReducer(todoReducer, initialTodos, init);
  
  // 自动保存
  useEffect(() => {
    localStorage.setItem('todos-tsrx-context', JSON.stringify(state));
  }, [state]);

  return (
    <TodoContext.Provider value={{ state, dispatch }}>
      {children}
    </TodoContext.Provider>
  );
}

// 自定义Hook封装
function useTodos() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within TodoProvider');
  }
  return context;
}

// 深层子组件无需层层传props
function TodoStats() {
  const { state } = useTodos();
  const activeCount = state.todos.filter(t => !t.completed).length;
  return <span>{activeCount} 项待完成</span>;
}

function AddTodo() {
  const { dispatch } = useTodos();
  return (
    <input
      type="text"
      placeholder="添加任务..."
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
          dispatch({ type: 'add', payload: e.currentTarget.value });
          e.currentTarget.value = '';
        }
      }}
    />
  );
}

// App中使用
function App() {
  return (
    <TodoProvider>
      <div>
        <h1>Todo App (with Context)</h1>
        <AddTodo />
        <TodoList />
        <TodoStats />
      </div>
    </TodoProvider>
  );
}
\`\`\`

### 关键要点总结

1. **reducer必须是纯函数**：不能直接修改state，必须返回新对象；不能有API调用、Math.random()、Date.now()等副作用
2. **action使用discriminated union类型**：通过type字段区分，TypeScript能自动类型收窄
3. **不要忘记穷尽检查**：default分支用never类型，确保所有action都被处理
4. **dispatch是稳定引用**：不会在重渲染时改变，可以安全传给子组件或作为useEffect依赖
5. **惰性初始化用第三个参数init**：避免每次渲染都创建初始状态
6. **useReducer不会让你少写代码**，但会让状态逻辑更清晰、更可预测、更易测试
7. **复杂更新逻辑用useReducer**，简单值用useState，不要教条式使用
`,
  },
  {
    id: "tsrx-usecontext",
    group: "Hooks篇",
    icon: "🌍",
    title: "useContext跨组件通信",
    content: `## useContext 跨组件通信

Props 层层传递（prop drilling）是 React 应用中常见的痛点。\`useContext\` 提供了一种在组件之间共享状态的方式，无需显式地通过每一层组件传递 props。

### createContext 泛型与默认值

使用 \`createContext<T>\` 创建 Context 时，需要提供一个默认值。这个默认值在组件树中没有对应 Provider 时使用：

\`\`\`tsx
import { createContext, useContext } from 'react';

// 方式1：创建时就给有意义的默认值
type Theme = 'light' | 'dark';
const ThemeContext = createContext<Theme>('light');

// 方式2：给null作为默认值，在useContext时运行时检查（更常用）
type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};
const ThemeContext = createContext<ThemeContextType | null>(null);

// 封装自定义Hook，带运行时检查
function useTheme() {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
\`\`\`

### Provider value 注入

使用 \`Provider\` 组件包裹需要共享状态的子树，并通过 \`value\` prop 注入数据：

\`\`\`tsx
import { useState, useEffect } from 'react';

function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 从localStorage读取初始主题
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme-tsrx');
      return (saved as Theme) || 'light';
    }
    return 'light';
  });

  // 切换主题
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // 主题变化时：1. 保存到localStorage 2. 修改document的class
  useEffect(() => {
    localStorage.setItem('theme-tsrx', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // 用useMemo稳定value引用，避免不必要重渲染
  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
\`\`\`

配合 CSS Variables 实现主题切换：

\`\`\`css
/* 全局CSS */
:root.light {
  --bg-primary: #ffffff;
  --bg-secondary: #f3f4f6;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --accent: #3b82f6;
  --border: #e5e7eb;
}

:root.dark {
  --bg-primary: #1f2937;
  --bg-secondary: #374151;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --accent: #60a5fa;
  --border: #4b5563;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s, color 0.3s;
}
\`\`\`

### ThemeContext 主题切换完整示例

\`\`\`tsx
// 主题切换按钮组件（可以在任意深层子组件）
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] hover:opacity-80 transition-opacity"
      aria-label={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

// 卡片组件
function ThemedCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]">
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)' }}>{children}</p>
    </div>
  );
}

// 使用示例
function ThemeDemo() {
  return (
    <ThemeProvider>
      <div className="min-h-screen p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">主题切换 Demo</h1>
          <ThemeToggle />
        </header>
        
        <div className="grid gap-4 md:grid-cols-2">
          <ThemedCard title="浅色/深色模式">
            点击右上角按钮切换主题，主题设置会自动保存到 localStorage，
            下次访问时会记住你的选择。整个页面使用 CSS Variables 实现平滑过渡。
          </ThemedCard>
          <ThemedCard title="Context 优势">
            任何子组件都可以直接调用 useTheme() 获取主题和切换函数，
            不需要通过 props 层层传递。
          </ThemedCard>
        </div>
      </div>
    </ThemeProvider>
  );
}
\`\`\`

### AuthContext 用户登录态管理

下面是完整的用户认证 Context，包含登录、登出、加载状态处理：

\`\`\`tsx
type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // 初始化时检查本地token
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      // 实际项目中调用API验证token并获取用户信息
      fetch('/api/me', {
        headers: { Authorization: \`Bearer \${token}\` }
      })
        .then(res => res.json())
        .then(user => setState({ user, loading: false, error: null }))
        .catch(() => {
          localStorage.removeItem('auth-token');
          setState({ user: null, loading: false, error: null });
        });
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('登录失败');
      const data = await res.json();
      localStorage.setItem('auth-token', data.token);
      setState({ user: data.user, loading: false, error: null });
    } catch (err) {
      setState({ 
        user: null, 
        loading: false, 
        error: err instanceof Error ? err.message : '登录失败' 
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    setState({ user: null, loading: false, error: null });
  };

  const value = useMemo(() => ({
    ...state,
    login,
    logout,
  }), [state]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

// 路由守卫组件示例
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="p-8 text-center">加载中...</div>;
  if (!user) return <div className="p-8 text-center">请先登录</div>;
  
  return <>{children}</>;
}
\`\`\`

### 多 Context 拆分原则

**不要把所有状态都塞进一个 AppContext！** 应该按照**更新频率**和**关注点**拆分：

| 拆分策略 | 原因 |
| --- | --- |
| 按功能域拆分（ThemeContext、AuthContext、CartContext） | 职责单一，代码易维护 |
| 按更新频率拆分（频繁变化的单独一个Context） | 避免不相关组件因value变化重渲染 |
| 把state和dispatch分开（可选高级优化） | 只需要dispatch的组件不会因state变化重渲染 |

错误示例（一个大AppContext）：
\`\`\`tsx
// ❌ 不推荐：一个巨大的Context包所有
const AppContext = createContext({
  theme: 'light',
  user: null,
  todos: [],
  cart: [],
  notifications: [],
  // ... 几十个属性
});
// 问题：任何一个属性变化，所有消费组件都重渲染
\`\`\`

正确做法：多个小Context组合：
\`\`\`tsx
// ✅ 推荐：拆分多个Context
function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TodoProvider>
          <CartProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </CartProvider>
        </TodoProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
\`\`\`

### Context 性能问题与解决方案

Context 的性能陷阱：**只要 Provider 的 value 引用变化，所有消费该 Context 的组件都会重渲染**，即使你用了 React.memo 也挡不住！

\`\`\`tsx
// ❌ 性能问题：每次渲染value都是新对象
function BadThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light')
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
// 问题：toggleTheme函数每次渲染都是新引用，导致value是新对象

// ✅ 正确做法：useMemo稳定value引用，useCallback稳定函数引用
function GoodThemeProvider({ children }) {
  const [theme, setTheme] = useState<Theme>('light');
  
  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  }, []);
  
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
\`\`\`

高级优化：拆分state和dispatch Context
\`\`\`tsx
// 更细粒度的优化：将state和dispatch分开
const TodoStateContext = createContext<TodoState | null>(null);
const TodoDispatchContext = createContext<React.Dispatch<TodoAction> | null>(null);

function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  
  // dispatch本身是稳定的，不需要memo
  return (
    <TodoStateContext.Provider value={state}>
      <TodoDispatchContext.Provider value={dispatch}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
}

// 只需要触发action的组件，不会因为state变化重渲染！
function AddTodoButton() {
  const dispatch = useContext(TodoDispatchContext)!;
  // 这个组件只用到dispatch，不会因为todos变化而重渲染
  return <button onClick={() => dispatch({ type: 'add' })}>添加</button>;
}
\`\`\`

### 关键要点总结

1. **createContext给默认值**：要么给合理默认值，要么给null+自定义Hook运行时检查并throw
2. **始终封装自定义Hook**：useTheme()、useAuth()比直接useContext(ThemeContext)更安全
3. **value必须用useMemo包裹**：否则每次Provider重渲染都会创建新对象，导致所有消费者重渲染
4. **函数用useCallback包裹**：或者把函数放在useMemo的依赖里
5. **按功能/更新频率拆分Context**：不要一个AppContext包打天下
6. **React.memo挡不住Context变化**：memo只挡props变化，context变化会穿透memo
7. **Context不是状态管理工具**：它是依赖注入机制，复杂状态逻辑配合useReducer使用
`,
  },
  {
    id: "tsrx-usememo",
    group: "Hooks篇",
    icon: "🧮",
    title: "useMemo计算缓存",
    content: `## useMemo 计算缓存

\`useMemo\` 用于缓存计算结果，在依赖不变时跳过昂贵的计算。它是 React 性能优化的重要工具，但过度使用反而会增加代码复杂度和内存开销。

### useMemo 基础用法

\`useMemo\` 接收一个计算函数和依赖数组，返回缓存的值。只有当依赖变化时才会重新计算：

\`\`\`tsx
import { useMemo, useState } from 'react';

function useMemoDemo() {
  const [count, setCount] = useState(0);
  const [otherState, setOtherState] = useState(0);

  // 普通计算：每次渲染都会执行
  const expensiveResult = expensiveCompute(count);

  // useMemo缓存：只有count变化才重新计算
  const memoizedResult = useMemo(() => {
    console.log('重新计算 expensiveCompute...');
    return expensiveCompute(count);
  }, [count]); // 依赖数组

  return (
    <div>
      <p>Count: {count}</p>
      <p>计算结果: {memoizedResult}</p>
      <button onClick={() => setCount(c => c + 1)}>增加count (触发重算)</button>
      <button onClick={() => setOtherState(o => o + 1)}>
        改变其他状态 (不触发重算)
      </button>
    </div>
  );
}

// 模拟昂贵计算
function expensiveCompute(n: number): number {
  console.log('执行昂贵计算...');
  let result = 0;
  for (let i = 0; i < 100000000; i++) {
    result += (n * i) % 17;
  }
  return result;
}
\`\`\`

### 斐波那契/大列表性能 Demo

下面演示一个大列表 filter+sort 的场景，展示 useMemo 的性能提升：

\`\`\`tsx
type Item = {
  id: number;
  name: string;
  category: 'electronics' | 'clothing' | 'books' | 'food';
  price: number;
  rating: number;
};

// 生成10000条模拟数据
const allItems: Item[] = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: \`商品 \${i + 1}\`,
  category: ['electronics', 'clothing', 'books', 'food'][i % 4] as Item['category'],
  price: Math.floor(Math.random() * 1000) + 10,
  rating: Math.round((Math.random() * 4 + 1) * 10) / 10,
}));

function ProductList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'name'>('rating');
  const [minPrice, setMinPrice] = useState(0);

  // ❌ 没有useMemo：每次输入框变化都重新过滤排序10000条数据
  // const filteredItems = allItems
  //   .filter(item => item.name.includes(searchTerm))
  //   .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
  //   .filter(item => item.price >= minPrice)
  //   .sort((a, b) => b[sortBy] > a[sortBy] ? 1 : -1);

  // ✅ 使用useMemo：只有依赖变化时才重新计算
  const filteredItems = useMemo(() => {
    console.log('重新过滤排序...');
    return allItems
      .filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(item => 
        selectedCategory === 'all' || item.category === selectedCategory
      )
      .filter(item => item.price >= minPrice)
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return b[sortBy] - a[sortBy];
      });
  }, [searchTerm, selectedCategory, sortBy, minPrice]);

  // 分类统计也可以缓存
  const categoryStats = useMemo(() => {
    console.log('计算分类统计...');
    return {
      total: allItems.length,
      electronics: allItems.filter(i => i.category === 'electronics').length,
      clothing: allItems.filter(i => i.category === 'clothing').length,
      books: allItems.filter(i => i.category === 'books').length,
      food: allItems.filter(i => i.category === 'food').length,
    };
  }, []); // 空依赖：只计算一次

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">商品列表 (共{categoryStats.total}件)</h1>
      
      {/* 搜索和筛选区域 */}
      <div className="grid gap-4 mb-6 md:grid-cols-4">
        <input
          type="text"
          placeholder="搜索商品..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">全部分类</option>
          <option value="electronics">电子产品 ({categoryStats.electronics})</option>
          <option value="clothing">服装 ({categoryStats.clothing})</option>
          <option value="books">图书 ({categoryStats.books})</option>
          <option value="food">食品 ({categoryStats.food})</option>
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="border p-2 rounded"
        >
          <option value="rating">按评分排序</option>
          <option value="price">按价格排序</option>
          <option value="name">按名称排序</option>
        </select>
        <input
          type="number"
          placeholder="最低价格"
          value={minPrice}
          onChange={e => setMinPrice(Number(e.target.value))}
          className="border p-2 rounded"
        />
      </div>

      <p className="mb-4 text-gray-500">
        筛选结果: {filteredItems.length} 件商品
      </p>

      {/* 商品列表 - 只渲染前100条防止卡顿 */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.slice(0, 100).map(item => (
          <div key={item.id} className="border p-3 rounded hover:shadow-md">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.category}</p>
            <p className="text-lg text-blue-600">¥{item.price}</p>
            <p className="text-yellow-500">⭐ {item.rating}</p>
          </div>
        ))}
      </div>
      {filteredItems.length > 100 && (
        <p className="mt-4 text-gray-400 text-center">
          仅显示前100条结果，共{filteredItems.length}条
        </p>
      )}
    </div>
  );
}
\`\`\`

### 保持引用稳定配合 React.memo

useMemo 的另一个重要用途：保持对象/数组引用稳定，避免子组件不必要的重渲染：

\`\`\`tsx
import { memo } from 'react';

// 子组件用memo包裹，props浅比较相等则跳过渲染
const ChildComponent = memo(function ChildComponent({ 
  config, 
  items 
}: { 
  config: { theme: string; size: number };
  items: number[];
}) {
  console.log('ChildComponent 渲染');
  return (
    <div style={{ fontSize: config.size }}>
      <p>Theme: {config.theme}</p>
      <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>
    </div>
  );
});

function ParentComponent() {
  const [count, setCount] = useState(0);

  // ❌ 问题：每次渲染都创建新对象/新数组，memo失效
  // const config = { theme: 'dark', size: 16 };
  // const items = [1, 2, 3];

  // ✅ 正确：useMemo保持引用稳定
  const config = useMemo(() => ({ 
    theme: 'dark' as const, 
    size: 16 
  }), []); // 依赖为空，引用永远不变

  const items = useMemo(() => [1, 2, 3], []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>重渲染父组件</button>
      {/* 点击按钮时，config和items引用不变，ChildComponent不会重渲染 */}
      <ChildComponent config={config} items={items} />
    </div>
  );
}
\`\`\`

### useMemo 依赖错误案例

依赖数组是最容易出 bug 的地方：

\`\`\`tsx
function SearchResults({ query, filter }: { query: string; filter: object }) {
  // ❌ 错误1：依赖遗漏 - 使用了filter但没放进依赖数组
  // const results = useMemo(() => {
  //   return search(query, filter);
  // }, [query]); // filter变化时不会重新计算！

  // ❌ 错误2：依赖是对象/数组字面量，每次渲染引用都变
  // 父组件每次render都新建{minPrice: 100}，导致这里每次都重算
  // const results = useMemo(() => {
  //   return search(query, filter);
  // }, [query, filter]); // filter永远是新引用，缓存失效

  // ✅ 正确：基本类型值作为依赖，或用useMemo稳定父组件传的对象
  const results = useMemo(() => {
    return search(query, filter);
  }, [query, filter]);

  // 🔍 eslint-plugin-react-hooks的exhaustive-deps规则会帮你检查！
  // 务必开启这个eslint规则，它能发现90%的依赖错误
}
\`\`\`

### 过度优化反模式

**"不要过早优化"是编程界的名言，useMemo 更是如此！**

\`\`\`tsx
// ❌ 反模式：什么都用useMemo包裹
function OverOptimized({ name, age }) {
  // 简单的字符串拼接、数值计算，直接写就行
  // const fullName = useMemo(() => \`\${name} (\${age})\`, [name, age]);
  // const isAdult = useMemo(() => age >= 18, [age]);
  // const greeting = useMemo(() => \`Hello, \${name}!\`, [name]);

  // ✅ 简单计算直接写，开销远小于useMemo本身的开销
  const fullName = \`\${name} (\${age})\`;
  const isAdult = age >= 18;
  const greeting = \`Hello, \${name}!\`;

  return <div>{greeting}</div>;
}

// 什么时候才需要useMemo？
// 1. 计算确实昂贵（上千次循环、复杂算法、大数据量处理）
// 2. 需要保持引用稳定传给memo化的子组件
// 3. 这个值作为其他Hook的依赖（useEffect、useCallback等）

// 正确的做法：先用DevTools的Profiler确认性能瓶颈
// 打开React DevTools → Profiler → 记录交互 → 查看哪个组件渲染慢
// 只有发现确实有性能问题时，再针对性地加useMemo
\`\`\`

### useMemo 不是语义保证

非常重要的一点：**React 可能会丢弃缓存重新计算**，不要用 useMemo 做语义保证：

\`\`\`tsx
// ❌ 错误：依赖useMemo来做副作用同步或保留引用
const [count, setCount] = useState(0);

// 不要这么做！React未来可能在内存不足时清除缓存
// 这不是useMemo的设计目的
useMemo(() => {
  console.log('count变化了', count); // 这不是副作用！不要在这里执行操作
  localStorage.setItem('count', String(count)); // 这是副作用！应该用useEffect
}, [count]);

// ✅ 正确：副作用放在useEffect
useEffect(() => {
  localStorage.setItem('count', String(count));
}, [count]);

// useMemo仅作为性能优化，React保留"遗忘"缓存的权利：
// - 比如组件离屏后重新显示，可能会重算
// - 未来React可能选择不缓存某些值来优化内存
// 所以：即使不用useMemo，程序逻辑也必须正确
// useMemo只是让它更快，不是让它"才正确"
\`\`\`

### 关键要点总结

1. **useMemo是性能优化，不是语义保证**：不用useMemo代码也要逻辑正确
2. **依赖数组要准确**：用eslint-plugin-react-hooks检查，不要撒谎
3. **不要过度优化**：简单计算直接写，用Profiler确认瓶颈再优化
4. **主要用途**：缓存昂贵计算、保持引用稳定配合memo、作为其他Hook的稳定依赖
5. **空依赖数组=只计算一次**：类似类组件的componentDidMount时机
6. **每次渲染都执行的开销 vs useMemo的开销**：useMemo本身也有开销（依赖比较、内存占用）
7. **useMemo(() => fn, deps) 等价于 useCallback(fn, deps)**，下一节详细讲
`,
  },
  {
    id: "tsrx-usecallback",
    group: "Hooks篇",
    icon: "🔗",
    title: "useCallback函数缓存",
    content: `## useCallback 函数缓存

\`useCallback\` 用于缓存函数引用，在依赖不变时返回同一个函数。它和 \`useMemo\` 关系密切：\`useCallback(fn, deps)\` 完全等价于 \`useMemo(() => fn, deps)\`。

### useCallback 基础

\`\`\`tsx
import { useCallback, useState } from 'react';

function useCallbackDemo() {
  const [count, setCount] = useState(0);

  // ❌ 每次渲染都创建新函数
  // const handleClick = () => {
  //   console.log('clicked', count);
  // };

  // ✅ useCallback缓存函数引用
  const handleClick = useCallback(() => {
    console.log('clicked', count);
  }, [count]); // count变化时才创建新函数

  return <button onClick={handleClick}>点击</button>;
}
\`\`\`

### 给 React.memo 子组件传回调必须用 useCallback

这是 useCallback **最主要、最常见**的使用场景。如果不用 useCallback，每次父组件渲染都会创建新的函数引用，导致 React.memo 浅比较失败，子组件还是会重渲染：

\`\`\`tsx
import { memo, useState, useCallback } from 'react';

// 子组件用memo包裹：props浅比较相等则跳过渲染
const TodoItem = memo(function TodoItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: { id: number; text: string; completed: boolean };
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  console.log(\`TodoItem \${todo.id} 渲染\`);
  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span className={todo.completed ? 'line-through text-gray-400' : ''}>
        {todo.text}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="ml-auto text-red-500 text-sm"
      >
        删除
      </button>
    </div>
  );
});

function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: '学习 useCallback', completed: false },
    { id: 2, text: '理解 memo 原理', completed: false },
    { id: 3, text: '写一个Demo', completed: false },
  ]);
  const [inputValue, setInputValue] = useState('');
  // 这个state只是用来演示：改变它不会导致TodoItem重渲染
  const [dummyState, setDummyState] = useState(0);

  // ❌ 不使用useCallback：每次父组件渲染都新建函数
  // 即使dummyState变化，onToggle/onDelete都是新引用
  // TodoItem的memo浅比较失败，所有TodoItem都重渲染！
  // const handleToggle = (id: number) => {
  //   setTodos(prev => prev.map(t => 
  //     t.id === id ? { ...t, completed: !t.completed } : t
  //   ));
  // };
  // const handleDelete = (id: number) => {
  //   setTodos(prev => prev.filter(t => t.id !== id));
  // };

  // ✅ 使用useCallback：函数引用稳定
  // 只有todos变化时才创建新函数（这里用函数式更新，其实不需要todos依赖）
  const handleToggle = useCallback((id: number) => {
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  }, []); // 空依赖！因为用了函数式更新，不依赖外部todos变量

  const handleDelete = useCallback((id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []); // 空依赖！

  const handleAdd = useCallback(() => {
    if (!inputValue.trim()) return;
    setTodos(prev => [
      ...prev,
      { id: Date.now(), text: inputValue, completed: false }
    ]);
    setInputValue('');
  }, [inputValue]);

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">TodoList (useCallback优化)</h1>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="添加新任务..."
        />
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 rounded"
        >
          添加
        </button>
      </div>

      <div className="border rounded">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* 这个按钮改变dummyState：打开控制台观察TodoItem是否重渲染 */}
      <button
        onClick={() => setDummyState(d => d + 1)}
        className="mt-4 px-4 py-2 bg-gray-200 rounded"
      >
        触发重渲染 (点击次数: {dummyState})
        <span className="block text-xs text-gray-500">
          如果TodoItem没有重新打印日志，说明优化生效
        </span>
      </button>
    </div>
  );
}
\`\`\`

### 自定义 Hook 返回函数应该用 useCallback 包裹

自定义 Hook 返回的函数，如果调用方可能将其作为 useEffect 等 Hook 的依赖，一定要用 useCallback 包裹：

\`\`\`tsx
// ❌ 不好的自定义Hook：返回的函数每次都是新引用
function useBadCounter() {
  const [count, setCount] = useState(0);
  
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(0);
  
  return { count, increment, decrement, reset };
}

// 调用方的问题：
function BadConsumer() {
  const { count, increment } = useBadCounter();
  
  useEffect(() => {
    console.log('increment变化了');
    // 每次渲染increment都是新的，这个effect每次都执行！
  }, [increment]);
}

// ✅ 好的自定义Hook：返回的函数用useCallback包裹
function useGoodCounter() {
  const [count, setCount] = useState(0);
  
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(0), []);
  
  return { count, increment, decrement, reset };
}

// 调用方可以安全地将返回的函数作为依赖
function GoodConsumer() {
  const { count, increment } = useGoodCounter();
  
  useEffect(() => {
    console.log('组件挂载时执行一次');
    // increment引用稳定，这个effect只执行一次
  }, [increment]);
}
\`\`\`

### 常见错误：回调里引用了未列入依赖的变量

这是"闭包陷阱"的一种表现：

\`\`\`tsx
function SearchResults() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ page: 1, pageSize: 20 });

  // ❌ 错误：用了filters但没放进依赖数组
  // 回调里的filters永远是第一次渲染时的值（闭包陷阱）
  // const handleSearch = useCallback(() => {
  //   fetchResults(query, filters); // filters是陈旧的！
  // }, [query]); // 缺少filters依赖

  // ✅ 正确1：把所有用到的值都加入依赖
  const handleSearch1 = useCallback(() => {
    fetchResults(query, filters);
  }, [query, filters]); // 但filters是对象，父组件传的可能不稳定...

  // ✅ 正确2：用函数式更新/useRef避免依赖
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const handleSearch2 = useCallback(() => {
    fetchResults(query, filtersRef.current); // 从ref取最新值
  }, [query]); // 只需要query作为依赖

  // ✅ 正确3：如果是state setter，用函数式更新不需要依赖
  const [data, setData] = useState(null);
  const handleLoadMore = useCallback(() => {
    setData(prev => {
      // 用prev获取之前的state，不需要data在依赖里
      return prev ? [...prev, ...fetchMore()] : fetchMore();
    });
  }, []); // 空依赖！
}
\`\`\`

### 何时不需要 useCallback

很多时候不需要 useCallback，盲目使用反而增加代码复杂度：

\`\`\`tsx
function SimpleComponent() {
  const [count, setCount] = useState(0);

  // 1️⃣ 传给原生DOM元素的事件处理函数，不需要useCallback
  // <button onClick={() => setCount(c => c + 1)}>
  // 原生button不会因为函数引用变化做什么"优化"
  // 这里用useCallback没有任何收益

  // 2️⃣ 子组件没有用memo包裹，不需要useCallback
  const NonMemoChild = ({ onClick }) => <button onClick={onClick}>点击</button>;
  // 即使传新函数，NonMemoChild反正每次都要渲染，useCallback没意义

  // 3️⃣ 简单页面、列表项不多时，不需要useCallback
  // 性能优化要有测量依据，不要"感觉"慢就加

  // 4️⃣ 函数作为其他Hook依赖，但那个Hook本身不常执行
  // useEffect只在挂载执行一次，那依赖的函数即使是新的也没关系
  useEffect(() => {
    const handler = () => console.log('click');
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []); // 空依赖，handler在effect内部创建，没问题

  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;
}

// 🎯 useCallback真正需要的场景总结：
// 1. 函数作为props传给用React.memo包裹的子组件
// 2. 函数作为自定义Hook的返回值，调用方可能作为Hook依赖
// 3. 函数作为useEffect/useMemo等的依赖项
// 4. 其他经过Profiler确认的性能瓶颈场景
\`\`\`

### useCallback 与 useMemo 的关系

\`\`\`tsx
import { useMemo, useCallback } from 'react';

// 两者完全等价：
const fn1 = useCallback(() => {
  console.log('hello');
}, [a, b]);

const fn2 = useMemo(() => {
  return () => {
    console.log('hello');
  };
}, [a, b]);

// fn1 和 fn2 在行为上完全一致
// useCallback 就是语法糖，让你少写一层箭头函数嵌套

// 记忆：
// - useMemo 缓存"值"（计算结果、对象、数组）
// - useCallback 缓存"函数"（回调函数、事件处理函数）
\`\`\`

### 关键要点总结

1. **useCallback缓存函数引用**，主要目的是配合React.memo避免子组件不必要重渲染
2. **自定义Hook返回函数必须useCallback**，调用方可能用作Hook依赖
3. **依赖数组要写全**，用eslint-plugin-react-hooks检查，闭包陷阱很常见
4. **函数式更新能减少依赖**：setState(prev => ...)不需要把state放进依赖
5. **不要滥用useCallback**：传给原生DOM、子组件没memo、简单组件不需要
6. **useCallback本身有开销**：依赖数组比较、存储缓存都有成本
7. **先用Profiler测量**，确认是函数引用变化导致的性能问题再使用
8. **useCallback(fn, deps) ≡ useMemo(() => fn, deps)**，只是用途不同的语法糖
`,
  },
  {
    id: "tsrx-customhook",
    group: "Hooks篇",
    icon: "🪝",
    title: "自定义Hook封装模式",
    content: `## 自定义 Hook 封装模式

自定义 Hook 是 React Hooks 体系中最强大的特性之一。它让你能够将组件逻辑提取到可复用的函数中。命名规则是**必须以 \`use\` 开头**，这样 React 才能自动检查是否违反了 Hooks 规则。

### 自定义 Hook 基本规则

1. **命名必须以 use 开头**：useXxx 格式，这是约定也是 linter 识别 Hook 的标志
2. **只在两个地方调用 Hook**：React 函数组件顶层、自定义 Hook 顶层
3. **不要在条件、循环、嵌套函数中调用 Hook**
4. **自定义 Hook 是复用状态逻辑，不是状态本身**：每次调用 Hook 都是独立的 state

下面是常用的自定义 Hook 实现，覆盖日常开发的大部分场景：

### 1. useToggle - 布尔值切换

最基础也是最常用的自定义 Hook：

\`\`\`tsx
import { useState, useCallback } from 'react';

function useToggle(initialValue = false): [
  boolean,
  { toggle: () => void; setTrue: () => void; setFalse: () => void }
] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, { toggle, setTrue, setFalse }];
}

// 使用示例
function ModalDemo() {
  const [isOpen, { toggle, setFalse: close }] = useToggle();
  
  return (
    <>
      <button onClick={toggle}>打开弹窗</button>
      {isOpen && (
        <div className="modal fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2>弹窗标题</h2>
            <p>这是一个弹窗内容</p>
            <button onClick={close} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  );
}
\`\`\`

### 2. useLocalStorage - 自动持久化到 localStorage

支持泛型、自动 JSON 序列化/反序列化、跨标签页同步：

\`\`\`tsx
import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // 惰性初始化：从localStorage读取
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(\`Error reading localStorage key "\${key}":\`, error);
      return initialValue;
    }
  });

  // 设置值：同时更新state和localStorage
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.error(\`Error setting localStorage key "\${key}":\`, error);
    }
  }, [key]);

  // 监听其他标签页的storage事件，实现跨tab同步
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          // ignore parse errors
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

// 使用示例
function SettingsDemo() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 16);

  return (
    <div>
      <h2>设置（自动保存到localStorage）</h2>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        主题: {theme}
      </button>
      <input
        type="range"
        min={12}
        max={24}
        value={fontSize}
        onChange={e => setFontSize(Number(e.target.value))}
      />
      <p style={{ fontSize }}>预览文字大小</p>
    </div>
  );
}
\`\`\`

### 3. useDebounce - 值防抖

\`\`\`tsx
import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 使用示例：搜索框防抖
function SearchDemo() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  // debouncedSearch变化后才发起搜索请求
  useEffect(() => {
    if (debouncedSearch) {
      console.log('发起搜索:', debouncedSearch);
      // fetchSearchResults(debouncedSearch)
    }
  }, [debouncedSearch]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      placeholder="输入搜索内容（500ms防抖）"
      className="border p-2 rounded w-64"
    />
  );
}
\`\`\`

### 4. useThrottle - 函数节流

\`\`\`tsx
import { useRef, useCallback } from 'react';

function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  const lastCallRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = delay - (now - lastCallRef.current);

    if (remaining <= 0) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      lastCallRef.current = now;
      fnRef.current(...args);
    } else if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        timerRef.current = null;
        fnRef.current(...args);
      }, remaining);
    }
  }, [delay]) as T;
}

// 使用示例：滚动事件处理
function ScrollDemo() {
  const handleScroll = useThrottle(() => {
    console.log('滚动位置:', window.scrollY);
    // 这里可以做滚动加载、吸顶等逻辑
  }, 200);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return <div style={{ height: '300vh' }}>滚动页面看控制台</div>;
}
\`\`\`

### 5. useFetch - 数据请求（带AbortController）

\`\`\`tsx
import { useState, useEffect, useCallback, useRef } from 'react';

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

function useFetch<T = unknown>(url: string | null, options?: RequestInit) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: !!url,
    error: null,
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) return;

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setState({ data: null, loading: true, error: null });

    try {
      const res = await fetch(url, {
        ...options,
        signal: abortController.signal,
      });
      if (!res.ok) throw new Error(\`HTTP error! status: \${res.status}\`);
      const data = await res.json() as T;
      if (!abortController.signal.aborted) {
        setState({ data, loading: false, error: null });
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setState({ data: null, loading: false, error: err });
      }
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch };
}

// 使用示例
interface User {
  id: number;
  name: string;
  email: string;
}

function UserProfile({ userId }: { userId: number }) {
  const { data: user, loading, error, refetch } = useFetch<User>(
    \`https://jsonplaceholder.typicode.com/users/\${userId}\`
  );

  if (loading) return <div>加载中...</div>;
  if (error) return <div>加载失败: {error.message}</div>;
  if (!user) return null;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <button onClick={refetch}>刷新</button>
    </div>
  );
}
\`\`\`

### 6. useInterval - 解决 setInterval 闭包陈旧问题

\`\`\`tsx
import { useEffect, useRef } from 'react';

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // 保存最新的callback到ref
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const tick = () => {
      savedCallback.current();
    };

    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}

// 使用示例：计时器
function Counter() {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  // 不需要把count放进依赖！因为从ref读最新callback
  useInterval(() => {
    setCount(c => c + 1);
  }, isRunning ? 1000 : null); // delay传null可以暂停

  return (
    <div>
      <p>{count} 秒</p>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? '暂停' : '继续'}
      </button>
      <button onClick={() => setCount(0)}>重置</button>
    </div>
  );
}
\`\`\`

### 7. 更多实用自定义 Hook

\`\`\`tsx
// useEventListener - 自动清理事件监听
function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement | null = window
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element) return;
    const eventListener = (event: Event) => 
      savedHandler.current(event as WindowEventMap[K]);
    element.addEventListener(eventName, eventListener);
    return () => element.removeEventListener(eventName, eventListener);
  }, [eventName, element]);
}

// useMediaQuery - 响应式媒体查询
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// useKeyPress - 监听键盘按键
function useKeyPress(targetKey: string, handler: () => void) {
  useEventListener('keydown', (e) => {
    if (e.key === targetKey) handler();
  });
}

// useHover - 鼠标悬停
function useHover<T extends HTMLElement = HTMLDivElement>(): [
  React.RefObject<T>,
  boolean
] {
  const ref = useRef<T>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEventListener('mouseenter', () => setIsHovered(true), ref.current);
  useEventListener('mouseleave', () => setIsHovered(false), ref.current);

  return [ref, isHovered];
}

// useWindowSize - 窗口尺寸
function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEventListener('resize', useThrottle(() => {
    setSize({ width: window.innerWidth, height: window.innerHeight });
  }, 200));

  return size;
}

// usePrevious - 获取上一轮渲染的值
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// 使用示例
function Demo() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [hoverRef, isHovered] = useHover();
  const { width } = useWindowSize();
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  useKeyPress('Escape', () => console.log('ESC pressed'));

  return (
    <div>
      <p>屏幕宽度: {width}px (移动端: {isMobile ? '是' : '否'})</p>
      <div ref={hoverRef} style={{ padding: 20, background: isHovered ? 'blue' : 'gray' }}>
        悬停我: {isHovered ? '悬停中' : '未悬停'}
      </div>
      <p>现在: {count}, 之前: {prevCount}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
    </div>
  );
}
\`\`\`

### 关键要点总结

1. **命名规范**：必须以 use 开头，这是约定也是 React 识别 Hook 的方式
2. **每次调用自定义 Hook 都是独立状态**：多个组件用同一个 useLocalStorage，它们的 state 互不影响
3. **善用 useRef 解决闭包问题**：useInterval 的经典模式就是用 ref 保存最新回调
4. **记得清理副作用**：事件监听、定时器、订阅都要在 useEffect 返回值中清理
5. **返回函数用 useCallback 包裹**：让调用方可以安全作为其他 Hook 的依赖
6. **支持泛型让 Hook 更类型安全**：useLocalStorage<T>、useFetch<T> 比 any 好太多
7. **考虑 SSR 兼容**：typeof window !== 'undefined' 判断，避免 Next.js 等框架报错
8. **组合现有 Hook**：自定义 Hook 内部可以调用其他自定义 Hook，层层组合
`,
  },
  {
    id: "tsrx-uselayouteffect",
    group: "Hooks篇",
    icon: "📐",
    title: "useLayoutEffect与DOM测量",
    content: `## useLayoutEffect 与 DOM 测量

\`useLayoutEffect\` 是一个容易被误解但非常重要的 Hook。它和 \`useEffect\` 很相似，但执行时机不同——它在 DOM 变更后、浏览器绘制前**同步执行**。

### useEffect vs useLayoutEffect 执行时机

两者的根本区别在于执行时机不同，选择不当会导致视觉闪烁：

\`\`\`
时间线:
1. 组件渲染 → 生成虚拟DOM
2. DOM 变更（React提交更新到真实DOM）
3. 👇 useLayoutEffect 在这里执行（同步执行，会阻塞浏览器绘制）
4. 浏览器绘制（Paint）→ 用户看到屏幕更新
5. 👇 useEffect 在这里执行（异步执行，不阻塞绘制）
\`\`\`

简单记忆：
- **useEffect**：渲染后异步执行，不阻塞页面绘制 → 大多数场景用这个
- **useLayoutEffect**：DOM更新后、绘制前同步执行，阻塞绘制 → 需要测量/修改DOM避免闪烁时用

### Tooltip 自动调整方向 Demo

Tooltip 需要根据锚点元素的位置来决定浮层方向，如果用 useEffect 会出现闪烁（先显示在错误位置，再跳到正确位置）：

\`\`\`tsx
import { useState, useRef, useLayoutEffect } from 'react';

type Placement = 'top' | 'bottom' | 'left' | 'right';

function Tooltip({
  children,
  content,
  placement: initialPlacement = 'top',
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: Placement;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPlacement, setActualPlacement] = useState<Placement>(initialPlacement);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const anchorRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isVisible || !anchorRef.current || !tooltipRef.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8;
    const viewportPadding = 10;

    let newPlacement = initialPlacement;
    let top = 0;
    let left = 0;

    // 检查各个方向是否有足够空间
    const spaceAbove = anchorRect.top;
    const spaceBelow = window.innerHeight - anchorRect.bottom;
    const spaceLeft = anchorRect.left;
    const spaceRight = window.innerWidth - anchorRect.right;

    // 如果初始方向空间不够，自动翻转
    if (initialPlacement === 'top' && spaceAbove < tooltipRect.height + gap) {
      newPlacement = 'bottom';
    } else if (initialPlacement === 'bottom' && spaceBelow < tooltipRect.height + gap) {
      newPlacement = 'top';
    } else if (initialPlacement === 'left' && spaceLeft < tooltipRect.width + gap) {
      newPlacement = 'right';
    } else if (initialPlacement === 'right' && spaceRight < tooltipRect.width + gap) {
      newPlacement = 'left';
    }

    // 根据最终方向计算位置
    switch (newPlacement) {
      case 'top':
        top = anchorRect.top - tooltipRect.height - gap;
        left = anchorRect.left + (anchorRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = anchorRect.bottom + gap;
        left = anchorRect.left + (anchorRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = anchorRect.top + (anchorRect.height - tooltipRect.height) / 2;
        left = anchorRect.left - tooltipRect.width - gap;
        break;
      case 'right':
        top = anchorRect.top + (anchorRect.height - tooltipRect.height) / 2;
        left = anchorRect.right + gap;
        break;
    }

    // 边界约束：不超出视口
    left = Math.max(viewportPadding, Math.min(left, window.innerWidth - tooltipRect.width - viewportPadding));
    top = Math.max(viewportPadding, Math.min(top, window.innerHeight - tooltipRect.height - viewportPadding));

    // ✅ 在绘制前同步更新位置，用户看不到闪烁
    setActualPlacement(newPlacement);
    setPosition({ top: top + window.scrollY, left: left + window.scrollX });
  }, [isVisible, initialPlacement]);

  return (
    <div
      ref={anchorRef}
      className="inline-block relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded shadow-lg whitespace-nowrap"
          style={{
            top: position.top,
            left: position.left,
            // 初始隐藏，计算完位置再显示（防止闪烁）
            opacity: position.top === 0 && position.left === 0 ? 0 : 1,
            transition: 'opacity 0.1s',
          }}
        >
          {content}
          <div
            className={\`absolute w-2 h-2 bg-gray-900 transform rotate-45 \${
              actualPlacement === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
              actualPlacement === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
              actualPlacement === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
              'left-[-4px] top-1/2 -translate-y-1/2'
            }\`}
          />
        </div>
      )}
    </div>
  );
}

// 使用示例
function TooltipDemo() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">Tooltip 自动调整方向</h1>
      <p className="mb-4 text-gray-600">
        把鼠标悬停在按钮上，Tooltip会自动检测空间：
        靠近边缘时会翻转方向，不会超出视口。
      </p>
      
      <div className="grid gap-8 mt-16">
        <div className="flex justify-center gap-8">
          <Tooltip content="这是 Tooltip 内容" placement="top">
            <button className="px-4 py-2 bg-blue-500 text-white rounded">
              悬停显示 Tooltip (上方)
            </button>
          </Tooltip>
          <Tooltip content="总是有足够空间的Tooltip" placement="bottom">
            <button className="px-4 py-2 bg-green-500 text-white rounded">
              悬停显示 Tooltip (下方)
            </button>
          </Tooltip>
        </div>

        {/* 边缘测试：靠近顶部和底部的按钮 */}
        <div className="mt-32 flex justify-between">
          <Tooltip content="空间不够会自动翻转！" placement="top">
            <button className="px-4 py-2 bg-red-500 text-white rounded">
              靠近顶部的按钮
            </button>
          </Tooltip>
          <Tooltip content="空间不够会自动翻转！" placement="bottom">
            <button className="px-4 py-2 bg-purple-500 text-white rounded">
              靠近底部的按钮
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
\`\`\`

### 滚动位置恢复

点击详情页再返回列表时，恢复之前的滚动位置：

\`\`\`tsx
import { useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/router';

function useScrollRestoration(key: string) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const savedPositionRef = useRef(0);

  // 离开前保存滚动位置
  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // 恢复之前保存的位置
    const saved = sessionStorage.getItem(\`scroll-\${key}\`);
    if (saved) {
      // ✅ 在绘制前设置scrollTop，用户不会看到从0跳转到保存位置的闪烁
      requestAnimationFrame(() => {
        container.scrollTop = Number(saved);
      });
    }

    const handleScroll = () => {
      savedPositionRef.current = container.scrollTop;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      sessionStorage.setItem(\`scroll-\${key}\`, String(savedPositionRef.current));
    };
  }, [key]);

  return scrollRef;
}

// 在列表页使用
function ArticleList() {
  const scrollRef = useScrollRestoration('article-list');
  const router = useRouter();

  return (
    <div
      ref={scrollRef}
      className="h-screen overflow-y-auto"
      style={{ height: '100vh', overflowY: 'auto' }}
    >
      <h1>文章列表</h1>
      {Array.from({ length: 50 }, (_, i) => (
        <div
          key={i}
          className="p-4 border-b cursor-pointer hover:bg-gray-50"
          onClick={() => router.push(\`/articles/\${i}\`)}
        >
          <h2 className="font-semibold">文章标题 {i + 1}</h2>
          <p className="text-gray-500 text-sm">点击查看详情...</p>
        </div>
      ))}
    </div>
  );
}
\`\`\`

### 防止闪烁：在 paint 前完成 DOM 修改

useLayoutEffect 最大的价值：用户永远看不到"中间态"。用 useEffect 会导致视觉闪烁：

\`\`\`tsx
function CounterWithDOMMeasure() {
  const [count, setCount] = useState(0);
  const [boxSize, setBoxSize] = useState({ width: 0, height: 0 });
  const boxRef = useRef<HTMLDivElement>(null);

  // ❌ 用useEffect：先看到旧尺寸，再闪到新尺寸
  // useEffect(() => {
  //   if (boxRef.current) {
  //     const rect = boxRef.current.getBoundingClientRect();
  //     setBoxSize({ width: rect.width, height: rect.height });
  //   }
  // }, [count]);

  // ✅ 用useLayoutEffect：在绘制前测量并设置，用户看不到闪烁
  useLayoutEffect(() => {
    if (boxRef.current) {
      const rect = boxRef.current.getBoundingClientRect();
      setBoxSize({ width: rect.width, height: rect.height });
    }
  }, [count]);

  return (
    <div className="p-8">
      <button
        onClick={() => setCount(c => c + 1)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        增加内容
      </button>
      <div
        ref={boxRef}
        className="inline-block p-4 border-2 border-blue-500 rounded transition-all"
      >
        {Array.from({ length: count + 1 }).map((_, i) => (
          <p key={i}>这是第 {i + 1} 行内容</p>
        ))}
      </div>
      <p className="mt-4">
        盒子尺寸: {Math.round(boxSize.width)}px × {Math.round(boxSize.height)}px
      </p>
    </div>
  );
}
\`\`\`

### SSR 警告问题与 useIsomorphicLayoutEffect

在 Next.js 等 SSR 框架中使用 useLayoutEffect 会看到警告：\`Warning: useLayoutEffect does nothing on the server\`。

解决方案：创建一个 isomorphic 版本，SSR 时用 useEffect，客户端用 useLayoutEffect：

\`\`\`tsx
import { useEffect, useLayoutEffect } from 'react';

// SSR时useEffect，客户端useLayoutEffect
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// 以后在组件中统一用 useIsomorphicLayoutEffect 即可
function SafeTooltip({ children, content }: { children: React.ReactNode; content: React.ReactNode }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);

  // ✅ SSR安全，不会有警告
  useIsomorphicLayoutEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 8, left: rect.left });
    }
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      {children}
      {position.top > 0 && (
        <div
          className="absolute bg-gray-900 text-white p-2 rounded text-sm z-50"
          style={{ top: position.top, left: position.left }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// Next.js中如果在app directory (React Server Components)下
// 需要加上'use client'指令
// 'use client';
\`\`\`

### 什么时候用 useLayoutEffect？

| 场景 | useEffect | useLayoutEffect |
| --- | --- | --- |
| 数据请求 fetch | ✅ 首选 | ❌ 不要用 |
| 订阅/事件监听 | ✅ 首选 | ❌ 不要用 |
| 设置定时器 setTimeout/setInterval | ✅ 首选 | ❌ 不要用 |
| 手动操作DOM（focus、scroll等） | ⚠️ 可能闪烁 | ✅ 更好 |
| 测量DOM尺寸（getBoundingClientRect、offsetWidth） | ❌ 闪烁 | ✅ 必须用 |
| 根据DOM测量结果同步修改样式/位置 | ❌ 闪烁 | ✅ 必须用 |
| 同步触发重渲染（避免中间态） | ❌ 会看到中间态 | ✅ 必须用 |

**经验法则**：
- 90% 的情况用 useEffect 就够了
- 如果你的代码导致了视觉闪烁/抖动，尝试把 useEffect 换成 useLayoutEffect
- 如果需要读取 DOM 布局信息并同步修改 DOM，必须用 useLayoutEffect
- SSR 环境用 useIsomorphicLayoutEffect 避免警告

### 关键要点总结

1. **useLayoutEffect 在 DOM 更新后、浏览器绘制前同步执行**，会阻塞绘制
2. **主要用途是 DOM 测量和同步修改**，避免视觉闪烁
3. **Tooltip、Popover、下拉菜单等浮层组件**必须用 useLayoutEffect 计算位置
4. **SSR 时会有警告**，用 useIsomorphicLayoutEffect 切换
5. **不要在 useLayoutEffect 里做耗时操作**，它阻塞绘制，慢了用户会感觉到卡顿
6. **大多数副作用用 useEffect**，只有涉及 DOM 测量/同步修改时才用 useLayoutEffect
7. **useLayoutEffect 的 cleanup 和 useEffect 一样**，在组件卸载或下次effect前执行
`,
  },
  {
    id: "tsrx-usedeferredvalue",
    group: "Hooks篇",
    icon: "⏳",
    title: "useDeferredValue与useTransition",
    content: `## useDeferredValue 与 useTransition

React 18 引入的并发特性中，\`useTransition\` 和 \`useDeferredValue\` 是两个用于标记非紧急更新的 Hook。它们让你能够让 UI 在大量计算时保持响应，提升用户体验。

### 核心概念：紧急更新 vs 过渡更新

React 18 之前，所有更新都是紧急的——触发更新后 React 会立即开始渲染，期间浏览器无法响应用户输入。

React 18 将更新分为两类：

- **紧急更新（Urgent Updates）**：打字、点击、拖拽等直接交互，需要立即响应
- **过渡更新（Transition Updates）**：UI 从一个视图过渡到另一个，可以延迟，不需要立即看到结果

\`\`\`tsx
// 比如搜索框场景：
// 1. 输入框显示用户输入的文字 → 紧急更新（必须立即响应，否则感觉卡）
// 2. 搜索结果列表根据输入过滤显示 → 过渡更新（可以有延迟，用户能接受loading）
\`\`\`

### useTransition 基础用法

\`useTransition\` 返回两个值：\`isPending\` 和 \`startTransition\`。用 \`startTransition\` 包裹的状态更新会被标记为低优先级：

\`\`\`tsx
import { useState, useTransition } from 'react';

function SearchBox({ products }: { products: { id: number; name: string }[] }) {
  const [query, setQuery] = useState('');
  const [deferredQuery, setDeferredQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 输入框的值：紧急更新，立即更新
    setQuery(e.target.value);
    
    // 搜索过滤：过渡更新，可以被打断
    startTransition(() => {
      setDeferredQuery(e.target.value);
    });
  };

  // 过滤大列表会很慢，但因为在transition中，不会阻塞输入
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(deferredQuery.toLowerCase())
  );

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="搜索产品..."
        className="w-full border p-3 rounded-lg text-lg mb-4"
      />
      
      {isPending && (
        <div className="text-gray-500 mb-2">搜索中...</div>
      )}

      <div className="border rounded-lg">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="p-3 border-b last:border-b-0 hover:bg-gray-50"
          >
            {product.name}
          </div>
        ))}
        {filteredProducts.length === 0 && deferredQuery && (
          <div className="p-8 text-center text-gray-400">
            未找到相关产品
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
        <p>💡 快速输入文字，输入框始终保持响应</p>
        <p>🔄 列表会"追赶"输入，但不会阻塞输入</p>
        <p>⏳ isPending 可以显示加载状态</p>
      </div>
    </div>
  );
}

// 生成10000条模拟产品数据
const largeProductList = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: \`产品 \${i + 1} - \${['手机', '电脑', '耳机', '键盘', '鼠标', '显示器'][i % 6]}\`,
}));

function App() {
  return <SearchBox products={largeProductList} />;
}
\`\`\`

### useDeferredValue 延迟某个值的更新

\`useDeferredValue\` 用于延迟一个**已存在的值**，返回一个"滞后"版本。它更适合那种接收值作为 props，无法控制 setState 时机的场景：

\`\`\`tsx
import { useState, useDeferredValue, useMemo } from 'react';

// 一个很慢的列表组件，接收过滤文本
function SlowProductList({ filterText }: { filterText: string }) {
  // 延迟filterText的值，让紧急更新（输入）优先
  const deferredText = useDeferredValue(filterText);

  // 这个计算使用延迟后的值
  const filteredProducts = useMemo(() => {
    console.log('过滤产品...');
    return largeProductList.filter(p =>
      p.name.toLowerCase().includes(deferredText.toLowerCase())
    );
  }, [deferredText]);

  // 可以根据值是否"滞后"显示视觉反馈
  const isStale = deferredText !== filterText;

  return (
    <div className={\`border rounded-lg transition-opacity \${isStale ? 'opacity-50' : 'opacity-100'}\`}>
      {filteredProducts.slice(0, 100).map(product => (
        <div key={product.id} className="p-3 border-b">
          {product.name}
        </div>
      ))}
      {isStale && (
        <div className="p-2 text-center text-sm text-gray-400">
          更新中...
        </div>
      )}
    </div>
  );
}

function SearchWithDeferred() {
  const [text, setText] = useState('');

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="搜索产品..."
        className="w-full border p-3 rounded-lg text-lg mb-4"
      />
      <SlowProductList filterText={text} />
    </div>
  );
}
\`\`\`

### Suspense 配合 useTransition 做 Skeleton Loading

和 Suspense 结合可以实现优雅的加载状态：

\`\`\`tsx
import { Suspense, useState, useTransition } from 'react';

// 模拟一个异步加载的组件
function Comments({ postId }: { postId: number }) {
  // 模拟数据请求延迟
  if (Math.random() > 0.5) {
    throw new Promise(resolve => setTimeout(resolve, 1000));
  }

  const comments = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    author: \`用户\${i + 1}\`,
    content: \`这是评论 \${i + 1} 的内容，关于文章 \${postId}\`,
  }));

  return (
    <div className="mt-4 space-y-2">
      {comments.map(c => (
        <div key={c.id} className="p-3 bg-gray-50 rounded">
          <div className="font-semibold text-sm">{c.author}</div>
          <div className="text-gray-600">{c.content}</div>
        </div>
      ))}
    </div>
  );
}

function Post({ postId }: { postId: number }) {
  return (
    <div className="border p-4 rounded">
      <h2 className="text-xl font-bold">文章 {postId}</h2>
      <p className="text-gray-600">这是文章 {postId} 的内容...</p>
      <Suspense fallback={<div className="mt-4 text-gray-400">加载评论中...</div>}>
        <Comments postId={postId} />
      </Suspense>
    </div>
  );
}

function TabDemo() {
  const [tab, setTab] = useState(1);
  const [isPending, startTransition] = useTransition();

  const selectTab = (nextTab: number) => {
    startTransition(() => {
      setTab(nextTab);
    });
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">文章切换 (useTransition + Suspense)</h1>
      
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map(tabNum => (
          <button
            key={tabNum}
            onClick={() => selectTab(tabNum)}
            className={\`px-4 py-2 rounded \${
              tab === tabNum 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }\`}
          >
            文章 {tabNum}
          </button>
        ))}
      </div>

      {/* 过渡期间可以继续显示旧内容，不会出现空白 */}
      <div style={{ opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s' }}>
        <Suspense fallback={
          <div className="border p-8 rounded text-center text-gray-400">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <p className="mt-4">加载文章中...</p>
          </div>
        }>
          <Post postId={tab} />
        </Suspense>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded text-sm">
        <p>✨ 点击标签时：</p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-gray-600">
          <li>按钮立即响应（紧急更新）</li>
          <li>内容区域显示skeleton加载态</li>
          <li>不会阻塞用户再次点击其他标签</li>
        </ul>
      </div>
    </div>
  );
}
\`\`\`

### useDeferredValue vs 防抖/节流对比

很多人会问：useDeferredValue 和我用 lodash.debounce 有什么区别？

| 特性 | 防抖/节流 | useDeferredValue |
| --- | --- | --- |
| 延迟时间 | 固定（如300ms） | 自适应：设备好就快，设备差就慢 |
| 可中断 | ❌ 不可中断，必须等延迟结束 | ✅ 新输入到来可中断正在进行的渲染 |
| 滞后显示 | 延迟期间显示旧值 | 紧急更新后立即渲染，React调度空闲时更新 |
| 网络请求配合 | ✅ 适合减少请求频率 | ⚠️ 不直接解决请求问题，需要结合Suspense |
| 使用场景 | 固定频率控制（输入搜索请求） | 大列表渲染、复杂计算等UI卡顿场景 |

\`\`\`tsx
// 实际项目中两者可以结合使用：
function BestPracticeSearch() {
  const [text, setText] = useState('');
  
  // 1. 防抖用于网络请求：300ms后才发请求，减少请求次数
  const debouncedText = useDebounce(text, 300);
  
  // 2. useDeferredValue用于大列表渲染：让UI保持响应
  const deferredText = useDeferredValue(text);

  // 网络请求用防抖后的值
  useEffect(() => {
    if (debouncedText) {
      console.log('发起搜索请求:', debouncedText);
      // fetchSearchResults(debouncedText)
    }
  }, [debouncedText]);

  // 大列表渲染用延迟值（或者直接用text，React自己调度）
  const filteredList = useMemo(() => {
    return largeProductList.filter(p => 
      p.name.toLowerCase().includes(deferredText.toLowerCase())
    );
  }, [deferredText]);

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      {/* 渲染列表 */}
    </div>
  );
}
\`\`\`

### useTransition vs useDeferredValue 选择

两个 Hook 目的类似，只是使用场景不同：

\`\`\`tsx
// useTransition：你可以控制setState调用的地方
// 适合：你有一个按钮/事件处理函数，在里面触发更新
function TabComponent() {
  const [tab, setTab] = useState(1);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      setTab(2); // 你可以访问到setState
    });
  };

  return <button onClick={handleClick}>切换标签</button>;
}

// useDeferredValue：你接收一个值作为props，无法控制setState
// 适合：通用组件、接收来自父组件的值
function GenericListComponent({ filterText }: { filterText: string }) {
  // 你接收到filterText，但不知道父组件什么时候setState
  // 无法用useTransition，这时用useDeferredValue
  const deferredText = useDeferredValue(filterText);

  return <ExpensiveList filter={deferredText} />;
}

// 两者功能上可以互相转换：
// startTransition(setValue(v)) ≈ setValue(v) + useDeferredValue(v)
// 选哪个取决于你在哪边写代码更方便
\`\`\`

### 关键要点总结

1. **useTransition** 让你标记 setState 为非紧急更新，返回 isPending 显示加载状态
2. **useDeferredValue** 让你延迟一个已有的值，适合接收 props 的通用组件
3. **并发渲染是可中断的**：新的紧急输入到来时，React 会放弃正在进行的低优先级渲染
4. **不会阻塞用户输入**：这是和防抖/节流最大的区别，用户输入永远是流畅的
5. **自适应延迟**：不需要手动设置延迟时间，React 根据设备性能自动调整
6. **和Suspense配合更好**：可以显示优雅的加载状态
7. **不是用来替代防抖的**：防抖控制网络请求频率，useDeferredValue解决UI渲染卡顿，两者可以结合
8. **只在遇到性能问题时使用**：普通应用不需要使用，大列表/复杂视图卡顿再考虑
`,
  },
  {
    id: "tsrx-useid",
    group: "Hooks篇",
    icon: "🆔",
    title: "useId/useSyncExternalStore/useInsertionEffect",
    content: `## useId / useSyncExternalStore / useInsertionEffect

React 18 还新增了几个不那么常用但各有专门用途的 Hook：\`useId\` 生成唯一 ID，\`useSyncExternalStore\` 订阅外部数据源，\`useInsertionEffect\` 给 CSS-in-JS 库注入样式。

### useId 生成唯一 ID（SSR 安全）

\`useId\` 生成唯一的字符串 ID，主要解决两个问题：
1. SSR 水合时客户端和服务端 ID 不匹配导致的 hydration mismatch
2. label htmlFor、aria-describedby 等无障碍属性需要唯一 ID

\`\`\`tsx
import { useId, useState } from 'react';

// ❌ 不要这么做：简单计数器在SSR时会mismatch
let globalId = 0;
function BadIdComponent() {
  const id = \`input-\${globalId++}\`;
  // SSR时服务端生成0,1,2...客户端重新开始生成0,1,2...导致不匹配
  return <input id={id} />;
}

// ✅ 用useId：SSR安全，客户端和服务端生成一致的ID
function TextField({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = useId();
  const errorId = useId(); // 可以生成多个
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error}
        className={\`w-full border p-2 rounded \${error ? 'border-red-500' : 'border-gray-300'}\`}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-red-500 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

// 表单示例
function FormDemo() {
  const formId = useId();
  const nameId = \`\${formId}-name\`; // 可以拼接前缀

  return (
    <form className="max-w-md mx-auto p-6 border rounded-lg">
      <h1 className="text-xl font-bold mb-6">用户注册</h1>
      
      <TextField label="用户名" name="username" placeholder="请输入用户名" />
      <TextField label="邮箱" type="email" name="email" placeholder="请输入邮箱" />
      <TextField label="密码" type="password" name="password" placeholder="请输入密码" />
      
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mt-4"
      >
        注册
      </button>

      <p className="mt-4 text-xs text-gray-400 text-center">
        打开DevTools查看input的id，每次都是唯一的且SSR安全
      </p>
    </form>
  );
}
\`\`\`

**重要：useId 不要用于列表 key！**
\`\`\`tsx
function List({ items }) {
  return (
    <ul>
      {items.map((item) => {
        // ❌ 错误！useId不能用于key
        // const id = useId();
        // return <li key={id}>{item.name}</li>;

        // ✅ 正确：key应该用数据本身的id
        return <li key={item.id}>{item.name}</li>;
      })}
    </ul>
  );
}
// 原因：
// 1. Hooks不能在循环中调用（违反Hooks规则）
// 2. useId是为了无障碍属性，不是为了列表key
// 3. 列表key应该来自你的数据
\`\`\`

### useSyncExternalStore 订阅外部 store

\`useSyncExternalStore\` 是一个专门用于**订阅外部数据源**的 Hook。"外部 store"指的是不属于 React state 的数据：
- Redux store
- 全局变量
- DOM 状态（如网络状态online/offline）
- 第三方状态管理库

\`\`\`tsx
import { useSyncExternalStore } from 'react';

// 基础签名：
// const snapshot = useSyncExternalStore(
//   subscribe,   // 注册回调函数，store变化时调用
//   getSnapshot, // 返回当前store的快照
//   getServerSnapshot? // SSR时返回的快照（可选）
// );

// 示例1：订阅网络在线/离线状态
function useOnlineStatus() {
  return useSyncExternalStore(
    // subscribe：订阅变化
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    // getSnapshot：返回当前值
    () => navigator.onLine,
    // getServerSnapshot：SSR时总是返回true
    () => true
  );
}

function NetworkStatus() {
  const isOnline = useOnlineStatus();
  return (
    <div className={\`fixed bottom-4 right-4 px-4 py-2 rounded-full text-white \${
      isOnline ? 'bg-green-500' : 'bg-red-500'
    }\`}>
      {isOnline ? '🟢 在线' : '🔴 离线'}
    </div>
  );
}
\`\`\`

### useSyncExternalStore 实现 useWindowSize

用 useSyncExternalStore 重写 useWindowSize，比手动用 useEffect 更可靠：

\`\`\`tsx
import { useSyncExternalStore } from 'react';

function useWindowSize() {
  return useSyncExternalStore(
    // subscribe
    (callback) => {
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    },
    // getSnapshot：注意返回的是对象！
    // 必须保证如果值没变化，返回同一个引用
    () => {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    // SSR
    () => ({ width: 0, height: 0 })
  );
}

// 等等，上面有个问题！getSnapshot每次都返回新对象！
// React会认为值变化了，导致无限重渲染。
// 正确做法：缓存最后一个值，只有真正变化时才返回新对象

function useWindowSizeFixed() {
  const lastSnapshot = useRef({ width: 0, height: 0 });

  return useSyncExternalStore(
    (callback) => {
      const handler = () => {
        lastSnapshot.current = {
          width: window.innerWidth,
          height: window.innerHeight,
        };
        callback();
      };
      // 初始化
      handler();
      window.addEventListener('resize', handler);
      return () => window.removeEventListener('resize', handler);
    },
    () => lastSnapshot.current,
    () => ({ width: 0, height: 0 })
  );
}

// 使用示例
function ResponsiveDemo() {
  const { width, height } = useWindowSizeFixed();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">窗口尺寸</h1>
      <p className="text-lg mb-4">
        {width} × {height} 像素
      </p>
      <div className="flex gap-2">
        <span className={\`px-3 py-1 rounded \${isMobile ? 'bg-blue-500 text-white' : 'bg-gray-200'}\`}>
          移动端
        </span>
        <span className={\`px-3 py-1 rounded \${isTablet ? 'bg-green-500 text-white' : 'bg-gray-200'}\`}>
          平板
        </span>
        <span className={\`px-3 py-1 rounded \${isDesktop ? 'bg-purple-500 text-white' : 'bg-gray-200'}\`}>
          桌面端
        </span>
      </div>
    </div>
  );
}
\`\`\`

### useSyncExternalStore 连接 Redux Store

React Redux v8 之后内部就是用 useSyncExternalStore 实现的：

\`\`\`tsx
// 极简Redux-like store实现
function createStore<State>(
  reducer: (state: State, action: any) => State,
  initialState: State
) {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    dispatch: (action: any) => {
      state = reducer(state, action);
      listeners.forEach(l => l());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

// 用useSyncExternalStore连接store
function useStore<State, Selected>(
  store: ReturnType<typeof createStore<State>>,
  selector: (state: State) => Selected
): Selected {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState())
  );
}

// 使用示例
const counterStore = createStore(
  (state: number, action: { type: string }) => {
    switch (action.type) {
      case 'inc': return state + 1;
      case 'dec': return state - 1;
      default: return state;
    }
  },
  0
);

function Counter() {
  const count = useStore(counterStore, s => s);
  return (
    <div className="p-8 text-center">
      <p className="text-4xl font-bold mb-4">{count}</p>
      <button
        onClick={() => counterStore.dispatch({ type: 'inc' })}
        className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
      >
        +
      </button>
      <button
        onClick={() => counterStore.dispatch({ type: 'dec' })}
        className="px-4 py-2 bg-gray-500 text-white rounded"
      >
        -
      </button>
    </div>
  );
}
\`\`\`

### useInsertionEffect - CSS-in-JS 库专用

\`useInsertionEffect\` 是为 CSS-in-JS 库作者设计的 Hook，**业务代码几乎永远不需要用它**。

执行时机：
\`\`\`
时间线:
1. useInsertionEffect → 在DOM变更前执行（CSS-in-JS注入<style>标签）
2. DOM变更
3. useLayoutEffect → DOM测量
4. 浏览器绘制
5. useEffect
\`\`\`

\`\`\`tsx
// 什么时候用useInsertionEffect？
// 只有当你在写一个CSS-in-JS库，需要在渲染前注入<style>标签时

// ❌ 业务代码不要用！
function BusinessComponent() {
  useInsertionEffect(() => {
    // 不要在这里做任何业务逻辑！
    // 这个Hook执行时ref还没附着，DOM还没更新
  }, []);
}

// ✅ CSS-in-JS库作者用它注入样式
function useCSS(css: string) {
  useInsertionEffect(() => {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [css]); // 注意：useInsertionEffect不能访问ref
  
  // 返回类名等
}

// 为什么不用useLayoutEffect？
// 因为useLayoutEffect执行时DOM已经更新了
// 如果在useLayoutEffect里注入样式，浏览器可能已经开始计算布局
// 会导致布局抖动
// useInsertionEffect在DOM mutation前执行，样式先注入，再更新DOM

// 📌 总结：
// - 99.9% 的开发者不需要知道 useInsertionEffect
// - 如果你在写 styled-components、emotion 类似的库才需要考虑
// - 业务逻辑用 useEffect 或 useLayoutEffect
\`\`\`

### 三个Hook对比总结

| Hook | 用途 | 使用者 | 频率 |
| --- | --- | --- | --- |
| **useId** | 生成SSR安全的唯一ID（label/aria） | 应用开发者 | 常用 |
| **useSyncExternalStore** | 订阅外部store（Redux、全局状态、DOM状态） | 库作者+高级应用 | 中等 |
| **useInsertionEffect** | CSS-in-JS库注入<style>标签 | 仅CSS-in-JS库作者 | 极少 |

### 关键要点总结

1. **useId**：生成 SSR 安全的唯一 ID，用于 htmlFor、aria-describedby 等，不要用于 list key
2. **useSyncExternalStore**：订阅任何外部数据源，比手动写 useEffect 更可靠，避免"撕裂"问题
3. **getSnapshot 必须返回稳定引用**：如果是对象，要缓存；否则每次返回新对象导致无限重渲染
4. **getServerSnapshot**：用于 SSR 时返回初始快照，避免 hydration mismatch
5. **useInsertionEffect**：CSS-in-JS 库专用，业务代码不要碰
6. **useInsertionEffect 执行时机最早**：在 DOM 变更前，useLayoutEffect 之前
7. **React 18 的这些 Hook 是为了解决特定问题**，不是让你在所有地方都用
8. **大部分应用开发者只需要 useId**，另外两个在特定场景才需要
`,
  },
  {
    id: "tsrx-hooks-rules",
    group: "Hooks篇",
    icon: "⚠️",
    title: "Hooks规则与原理深入",
    content: `## Hooks 规则与原理深入

理解 Hooks 的规则和背后的原理，能帮你写出更可靠的代码，避免常见的闭包陷阱和依赖数组错误。

### Hooks 两条铁律

Hooks 看起来只是普通函数，但它们有严格的使用规则：

**规则一：只在最顶层调用 Hook**

不要在循环、条件、嵌套函数中调用 Hook：

\`\`\`tsx
// ❌ 错误：在条件语句中调用Hook
function BadComponent({ show }) {
  if (show) {
    const [count, setCount] = useState(0); // 不行！
  }
}

// ❌ 错误：在循环中调用Hook
function BadList({ items }) {
  for (const item of items) {
    const [checked, setChecked] = useState(false); // 不行！
  }
}

// ❌ 错误：在嵌套函数中调用Hook
function BadComponent() {
  const handleClick = () => {
    const [value, setValue] = useState(''); // 不行！
  };
}

// ✅ 正确：只在函数组件/自定义Hook的最顶层调用Hook
function GoodComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  
  // 条件判断放在Hook返回值之后，不要放在Hook调用前
  if (count > 10) {
    // ...
  }
}
\`\`\`

**规则二：只在 React 函数组件和自定义 Hook 中调用 Hook**

不要在普通的 JavaScript 函数中调用 Hook：

\`\`\`tsx
// ❌ 错误：普通函数中调用Hook
function setupCounter() {
  const [count, setCount] = useState(0);
  return count;
}

// ✅ 正确：自定义Hook用use开头，可以调用其他Hook
function useCounter() {
  const [count, setCount] = useState(0);
  return { count };
}

// ✅ 正确：React函数组件
function Counter() {
  const { count } = useCounter();
  return <div>{count}</div>;
}
\`\`\`

### 为什么要有这些规则？原理揭秘

React 使用**单链表**来存储每个组件的 Hook 状态：

\`\`\`
组件Fiber节点
  ↓
hooks链表:
  ┌──────────┐    ┌──────────┐    ┌──────────┐
  │ useState │ -> │ useEffect│ -> │ useContext│
  │ memoized │    │ memoized │    │ memoized │
  │  State   │    │ State:   │    │  value   │
  │  queue   │    │  deps    │    │          │
  └──────────┘    └──────────┘    └──────────┘
    hook0           hook1           hook2

每次渲染时，React按调用顺序依次从链表中取出对应位置的hook状态
\`\`\`

**关键：每次渲染时 Hook 的调用顺序必须完全一致！**

如果顺序变了，就会"拿错"状态：

\`\`\`tsx
function BadConditionalComponent({ isLoggedIn }) {
  // 第一次渲染：isLoggedIn = false
  // hook0: useState('') → name
  // hook1: useState(false) → darkMode
  
  // 第二次渲染：isLoggedIn = true
  // hook0: useState(0) → userId → 错误！这会拿到上一次name的状态
  // hook1: useState('') → name → 拿错了！
  // hook2: useState(false) → darkMode → 拿错了！
  
  if (isLoggedIn) {
    const [userId, setUserId] = useState(0); // 条件里新增的hook，打乱顺序
  }
  const [name, setName] = useState('');
  const [darkMode, setDarkMode] = useState(false);
}

// 这就是为什么Hook必须在顶层、顺序固定的原因！
// React靠"调用顺序"来匹配状态，不是靠变量名或其他标识
\`\`\`

### eslint-plugin-react-hooks 强制执行

React 官方提供了 ESLint 插件强制执行这些规则，**必须开启**：

\`\`\`json
// .eslintrc.json
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error", // 检查规则一、二
    "react-hooks/exhaustive-deps": "warn"  // 检查依赖数组
  }
}
\`\`\`

90% 的 Hooks bug 都能被这个插件发现。不要忽略它的警告！

### 经典闭包陷阱 Stale Closure

Hooks 最常见的 bug 来源就是**闭包陷阱（Stale Closure）**：回调函数捕获了旧的 state/props 值。

\`\`\`tsx
import { useState, useEffect } from 'react';

function StaleClosureDemo() {
  const [count, setCount] = useState(0);

  // 陷阱1：setInterval读旧state
  useEffect(() => {
    const id = setInterval(() => {
      console.log('count:', count); // count永远是0！
      // setCount(count + 1); // 永远只增加到1
    }, 1000);
    return () => clearInterval(id);
  }, []); // 空依赖，effect只执行一次，闭包捕获了初始count=0

  // 陷阱2：事件处理读旧props
  const handleClick = () => {
    setTimeout(() => {
      console.log('点击时的count:', count); // 如果count已变，这里还是旧值
    }, 3000);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
      <button onClick={handleClick}>延迟打印count</button>
    </div>
  );
}
\`\`\`

### useLatest 通用解法：useRef 保存最新值

解决闭包陷阱的通用模式：用 useRef 保存最新值，在回调里读 ref.current：

\`\`\`tsx
import { useRef, useEffect, useState, useCallback } from 'react';

// 通用Hook：总是获取最新值
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

// 修复setInterval
function CorrectCounter() {
  const [count, setCount] = useState(0);
  const countRef = useLatest(count);

  useEffect(() => {
    const id = setInterval(() => {
      console.log('count:', countRef.current); // 总是最新值
      setCount(c => c + 1); // 或者用函数式更新也可以
    }, 1000);
    return () => clearInterval(id);
  }, []); // 空依赖没问题！因为我们从ref读最新值

  return <p>Count: {count}</p>;
}

// 修复事件处理器的闭包问题
function EventHandlerFix() {
  const [count, setCount] = useState(0);
  const countRef = useLatest(count);

  const handleDelayedLog = useCallback(() => {
    setTimeout(() => {
      console.log('最新count:', countRef.current);
    }, 3000);
  }, []); // 空依赖！函数引用永远稳定

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
      <button onClick={handleDelayedLog}>3秒后打印最新count</button>
    </div>
  );
}
\`\`\`

### 依赖数组正确写法

依赖数组是另一个常见的坑。记住：**不要对依赖数组撒谎**，所有在 effect/callback/memo 中用到的响应式值都要列进去。

\`\`\`tsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  // ❌ 错误1：依赖遗漏
  // useEffect(() => {
  //   fetchUser(userId).then(setUser);
  // }, []); // 用了userId但没加依赖！userId变了不会重新请求

  // ❌ 错误2：撒谎式的注释忽略
  // useEffect(() => {
  //   fetchUser(userId).then(setUser);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []); // 这是欺骗，会导致bug

  // ❌ 错误3：对象/函数作为依赖导致无限循环
  // const config = { method: 'GET' }; // 每次渲染新对象
  // useEffect(() => {
  //   fetch(url, config); // config每次都是新引用，effect每次都执行！
  // }, [config]);

  // ✅ 正确1：基本类型值直接加依赖
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  // ✅ 正确2：函数依赖用useCallback
  const fetchData = useCallback(() => {
    return fetchUser(userId);
  }, [userId]);
  useEffect(() => {
    fetchData().then(setUser);
  }, [fetchData]);

  // ✅ 正确3：对象依赖用useMemo稳定引用
  const config = useMemo(() => ({ method: 'GET' as const }), []);
  useEffect(() => {
    fetch(url, config);
  }, [config]);

  // ✅ 正确4：setState函数式更新消除依赖
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1); // 用c => c+1，不需要count在依赖里
    }, 1000);
    return () => clearInterval(id);
  }, []); // 空依赖正确！

  return <div>{/* ... */}</div>;
}
\`\`\`

### 从 Class 生命周期到 Hooks 心智模型

如果你有 Class Component 经验，不要尝试把 Hooks 映射到生命周期，心智模型是不同的：

\`\`\`tsx
// ❌ 不要这样思考："Hooks是生命周期函数"
// componentDidMount → useEffect(..., [])
// componentDidUpdate → useEffect(..., [dep])
// componentWillUnmount → cleanup
// 这种映射思维是错的，会导致你写出不符合Hooks设计的代码

// ✅ 正确的Hooks心智模型：同步

// 类组件思维："在挂载时获取数据"
// Hooks思维："当userId变化时，保持user数据和userId同步"

// 每次渲染都像一次"快照"：
function Counter() {
  const [count, setCount] = useState(0);
  
  // 每次渲染，这里的count都是那次渲染的"快照"
  // 可以理解为：对于这个特定的count值，做xxx
  useEffect(() => {
    console.log('count现在是:', count);
    document.title = \`Count: \${count}\`;
    return () => {
      console.log('清理上一次的count:', count);
    };
  }, [count]);

  // 事件处理函数也是那次渲染的闭包
  function handleClick() {
    setTimeout(() => {
      alert(\`你点击时count是: \${count}\`); // 显示点击那一刻的count
    }, 3000);
  }

  return <button onClick={handleClick}>{count}</button>;
}

// 理解"快照"概念，90%的闭包问题就不会再困惑你了
\`\`\`

Class vs Hooks 对比：

| 概念 | Class Component | Hooks |
| --- | --- | --- |
| 状态存储 | this.state 是一个对象，this会变 | 每次渲染都是独立闭包，state是常量 |
| 逻辑复用 | HOC、render props（嵌套地狱） | 自定义Hook（扁平化组合） |
| 相关逻辑组织 | 分散在多个生命周期 | 相关逻辑放在同一个effect |
| this问题 | bind this或箭头函数 | 无this问题 |
| 心智模型 | 面向对象生命周期 | 函数式同步/数据流 |

### 常见错误和最佳实践

\`\`\`tsx
// 1. 不要在useEffect里直接用async函数
// ❌ 因为async函数返回Promise，cleanup需要直接返回函数
// useEffect(async () => {
//   const data = await fetchData();
// }, []);

// ✅ 正确：在内部定义async函数
useEffect(() => {
  async function loadData() {
    const data = await fetchData();
  }
  loadData();
}, []);

// 2. 不要依赖对象/函数字面量
// ✅ 用useMemo/useCallback稳定引用

// 3. 不要无限循环
// 常见原因：
// - useEffect里setState又触发了自己
// - 依赖数组里有对象/函数每次都新
// - 没有依赖数组（每次渲染后都执行）
// ✅ 用函数式更新、稳定依赖、正确的依赖数组

// 4. 不要过度使用useRef
// ref变化不触发重渲染，不要用它存状态值
// ✅ 只用于：DOM引用、保存最新值（闭包修复）、存储不影响UI的可变值

// 5. 不要对依赖撒谎
// 不要随意禁用exhaustive-deps规则
// 正确做法：调整代码让依赖数组是正确的
// （函数式更新、useCallback、useMemo、useRef）
\`\`\`

### 关键要点总结

1. **两条铁律**：只在顶层调用、只在函数组件/自定义Hook中调用
2. **原理是单链表按顺序存储**：每次渲染调用顺序必须一致，否则状态错乱
3. **必须开启eslint-plugin-react-hooks**：两个规则都打开
4. **闭包陷阱是最大的坑**：理解"每次渲染都是快照"的概念
5. **useRef保存最新值**是解决闭包问题的通用模式
6. **依赖数组不要撒谎**：所有用到的响应式值都要列进去
7. **不要把Hooks当生命周期函数**：心智模型是"同步"，不是"挂载/更新时"
8. **函数式更新可以消除依赖**：setState(prev => ...)不需要把state放进依赖
9. **useEffect的cleanup不只是卸载时执行**：每次重新执行effect前都会清理上一次
10. **理解了原理，Hooks就不再神秘**：它本质上就是一种状态管理和副作用组织方式
`,
  },
  {
    id: "tsrx-hooks-patterns",
    group: "Hooks篇",
    icon: "🎨",
    title: "React Hooks设计模式",
    content: `## React Hooks 设计模式

Hooks 让 React 代码的组织方式发生了变化。掌握一些经过验证的设计模式，能让你的组件更可复用、更易维护。

### 状态提升 vs 状态下放

这是关于状态放在哪里的基本决策：

**状态提升（Lifting State Up）**：当多个组件需要共享状态时，把状态提升到它们最近的共同父组件。

**状态下放（Colocating State）**：把状态放在真正使用它的组件里，不要为了"方便"把状态都放在顶层。

\`\`\`tsx
// ❌ 反模式：状态放太高导致大量props传递和不必要重渲染
function App() {
  const [name, setName] = useState(''); // App不需要知道name，只有UserForm需要
  const [isOpen, setIsOpen] = useState(false); // 只有Modal需要知道
  return (
    <Layout>
      <UserForm name={name} onNameChange={setName} />
      <Content isOpen={isOpen} onOpenChange={setIsOpen} />
    </Layout>
  );
}

// ✅ 正确：状态下放，每个组件管理自己的状态
function UserForm() {
  const [name, setName] = useState(''); // 状态就在用它的地方
  return <input value={name} onChange={e => setName(e.target.value)} />;
}

function Modal() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>打开</button>
      {isOpen && <div onClose={() => setIsOpen(false)}>弹窗内容</div>}
    </>
  );
}

// 🎯 原则：尽可能下放状态，只有当多个组件真的需要共享时才提升
\`\`\`

### Container/Presentational 分离模式

将数据获取/逻辑处理与UI渲染分离：

\`\`\`tsx
// Container组件：负责数据获取、状态逻辑
function TodoListContainer() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos().then(data => {
      setTodos(data);
      setLoading(false);
    });
  }, []);

  const handleToggle = (id: string) => {
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  if (loading) return <div>加载中...</div>;

  return <TodoListView todos={todos} onToggle={handleToggle} />;
}

// Presentational组件：只负责渲染，通过props接收数据和回调
type TodoListViewProps = {
  todos: Todo[];
  onToggle: (id: string) => void;
};

const TodoListView = memo(function TodoListView({ todos, onToggle }: TodoListViewProps) {
  return (
    <ul className="divide-y">
      {todos.map(todo => (
        <li
          key={todo.id}
          onClick={() => onToggle(todo.id)}
          className={\`p-3 cursor-pointer \${todo.completed ? 'line-through text-gray-400' : ''}\`}
        >
          {todo.text}
        </li>
      ))}
    </ul>
  );
});
\`\`\`

### Compound Component 复合组件模式

类似原生的 \`<select>\` 和 \`<option>\`，通过 Context 隐式共享状态，使用方不需要手动传递props：

\`\`\`tsx
import { createContext, useContext, useState, useCallback } from 'react';

// Tabs复合组件实现
type TabsContextType = {
  activeTab: string;
  setActiveTab: (id: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tabs components must be used within <Tabs>');
  return context;
}

// 根组件
function Tabs({
  defaultTab,
  children,
  onChange,
}: {
  defaultTab: string;
  children: React.ReactNode;
  onChange?: (tabId: string) => void;
}) {
  const [activeTab, setActiveTabState] = useState(defaultTab);

  const setActiveTab = useCallback((id: string) => {
    setActiveTabState(id);
    onChange?.(id);
  }, [onChange]);

  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab, setActiveTab]);

  return (
    <TabsContext.Provider value={value}>
      <div className="tabs-container">{children}</div>
    </TabsContext.Provider>
  );
}

// TabList：标签按钮容器
function TabList({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={\`flex border-b \${className}\`} role="tablist">
      {children}
    </div>
  );
}

// Tab：单个标签按钮
function Tab({
  id,
  children,
  disabled = false,
}: {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === id;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(id)}
      className={\`px-4 py-2 -mb-px border-b-2 transition-colors \${
        isActive
          ? 'border-blue-500 text-blue-600 font-medium'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      } \${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}\`}
    >
      {children}
    </button>
  );
}

// TabPanels：面板容器
function TabPanels({ children }: { children: React.ReactNode }) {
  return <div className="py-4">{children}</div>;
}

// TabPanel：单个面板
function TabPanel({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { activeTab } = useTabs();
  if (activeTab !== id) return null;
  return <div role="tabpanel">{children}</div>;
}

// 把复合组件挂载为Tabs的属性
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

// 使用方：API非常简洁，不需要传递一堆props
function TabsDemo() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Tabs复合组件示例</h1>
      
      <Tabs defaultTab="profile" onChange={(id) => console.log('切换到:', id)}>
        <Tabs.List>
          <Tabs.Tab id="profile">个人资料</Tabs.Tab>
          <Tabs.Tab id="settings">设置</Tabs.Tab>
          <Tabs.Tab id="billing" disabled>账单（未开放）</Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panels>
          <Tabs.Panel id="profile">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">个人资料</h2>
              <p>这里显示用户的头像、昵称、邮箱等信息</p>
            </div>
          </Tabs.Panel>
          <Tabs.Panel id="settings">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">设置</h2>
              <p>这里是通知偏好、主题设置等选项</p>
            </div>
          </Tabs.Panel>
          <Tabs.Panel id="billing">
            <p>账单信息</p>
          </Tabs.Panel>
        </Tabs.Panels>
      </Tabs>

      <p className="mt-6 text-sm text-gray-500">
        💡 复合组件模式的优势：API直观、灵活组合、无需手动管理active状态、
        类似原生HTML元素的使用体验
      </p>
    </div>
  );
}
\`\`\`

### Prop Getters 模式

不直接渲染UI，而是返回props getter函数，让调用方灵活组合内部props和自定义props。react-table、downshift等库都用了这个模式：

\`\`\`tsx
import { useState, useCallback, useId } from 'react';

// useToggle返回getToggleProps/getInputProps等函数
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn(p => !p), []);
  const buttonId = useId();
  const contentId = useId();

  // 返回prop getter函数，调用方可以传入自己的props合并
  const getButtonProps = useCallback((props: React.ButtonHTMLAttributes<HTMLButtonElement> = {}) => ({
    id: buttonId,
    'aria-expanded': on,
    'aria-controls': contentId,
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(e); // 先调用调用方的onClick
      if (!e.defaultPrevented) toggle();
    },
    ...props, // 调用方props可以覆盖
  }), [buttonId, contentId, on, toggle]);

  const getContentProps = useCallback((props: React.HTMLAttributes<HTMLDivElement> = {}) => ({
    id: contentId,
    role: 'region',
    'aria-labelledby': buttonId,
    hidden: !on,
    ...props,
  }), [buttonId, contentId, on]);

  return {
    on,
    toggle,
    getButtonProps,
    getContentProps,
  };
}

// 使用方：灵活组合
function AccordionDemo() {
  const { on, getButtonProps, getContentProps } = useToggle();

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="border rounded">
        {/* 可以传自定义onClick，不会被覆盖 */}
        <button
          {...getButtonProps({
            className: 'w-full p-4 text-left flex justify-between items-center hover:bg-gray-50',
            onClick: () => console.log('按钮被点击了'),
          })}
        >
          <span>这是一个折叠面板</span>
          <span>{on ? '▲' : '▼'}</span>
        </button>
        
        <div
          {...getContentProps({
            className: 'p-4 border-t bg-gray-50',
          })}
        >
          <p>这里是折叠的内容，点击按钮展开/收起</p>
          <p>无障碍属性（aria-expanded、aria-controls）已经自动处理好了</p>
        </div>
      </div>
    </div>
  );
}
\`\`\`

### State Reducer 模式

允许调用方通过传入reducer函数覆写组件内部状态变化逻辑，给予最大的灵活性：

\`\`\`tsx
import { useState, useCallback, useReducer } from 'react';

// 定义action类型
type ToggleAction =
  | { type: 'toggle' }
  | { type: 'open' }
  | { type: 'close' };

// 默认reducer
const defaultToggleReducer = (state: boolean, action: ToggleAction): boolean => {
  switch (action.type) {
    case 'toggle': return !state;
    case 'open': return true;
    case 'close': return false;
    default: return state;
  }
};

function useControllableToggle({
  initial = false,
  reducer = defaultToggleReducer,
  onChange,
}: {
  initial?: boolean;
  reducer?: (state: boolean, action: ToggleAction) => boolean;
  onChange?: (state: boolean) => void;
} = {}) {
  const [state, dispatch] = useReducer(reducer, initial);

  const dispatchWithOnChange = useCallback((action: ToggleAction) => {
    const newState = reducer(state, action);
    if (newState !== state) {
      onChange?.(newState);
    }
    // 注意：这里简化了，实际需要用useReducer配合
  }, [state, reducer, onChange]);

  const toggle = useCallback(() => {
    dispatch({ type: 'toggle' });
    onChange?.(!state);
  }, [state, onChange]);

  const open = useCallback(() => {
    if (!state) {
      dispatch({ type: 'open' });
      onChange?.(true);
    }
  }, [state, onChange]);

  const close = useCallback(() => {
    if (state) {
      dispatch({ type: 'close' });
      onChange?.(false);
    }
  }, [state, onChange]);

  return { on: state, toggle, open, close };
}

// 调用方可以自定义reducer改变组件行为：例如点击3次后不再关闭
function CustomToggleDemo() {
  const [clickCount, setClickCount] = useState(0);

  const customReducer = (state: boolean, action: ToggleAction): boolean => {
    // 自定义逻辑：只能打开，打开后点击3次才允许关闭
    if (action.type === 'toggle' && state) {
      if (clickCount < 3) {
        setClickCount(c => c + 1);
        return true; // 保持打开
      }
      setClickCount(0);
    }
    return defaultToggleReducer(state, action);
  };

  const { on, toggle } = useControllableToggle({
    reducer: customReducer,
    onChange: (s) => console.log('状态变化:', s),
  });

  return (
    <div className="p-6 text-center">
      <button
        onClick={toggle}
        className={\`px-6 py-3 rounded-lg text-white transition-colors \${
          on ? 'bg-green-500' : 'bg-gray-500'
        }\`}
      >
        {on ? '开' : '关'}
      </button>
      {on && (
        <p className="mt-4 text-gray-500">
          {clickCount < 3 ? \`再点击 \${3 - clickCount} 次才能关闭\` : '可以关闭了'}
        </p>
      )}
    </div>
  );
}
\`\`\`

### Control Props 受控模式

类似原生 \`<input value={value} onChange={...} />\`，让组件支持"完全受控"和"非受控"两种模式：

\`\`\`tsx
import { useState, useCallback, useEffect, useRef } from 'react';

// 同时支持受控和非受控的useControllableState
function useControllableState<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
}): [T | undefined, (value: T) => void] {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = useCallback((nextValue: T) => {
    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }
    onChange?.(nextValue);
  }, [isControlled, onChange]);

  return [value, setValue];
}

// 基于这个模式的输入组件
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

function Input({ value, defaultValue, onValueChange, ...props }: InputProps) {
  const [internalValue, setInternalValue] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  return (
    <input
      {...props}
      value={internalValue ?? ''}
      onChange={e => setInternalValue(e.target.value)}
      className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

// 使用方可以选择受控或非受控
function ControlledInputDemo() {
  // 非受控：组件自己管理状态
  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">非受控（defaultValue）</label>
        <Input defaultValue="初始值" onValueChange={v => console.log('输入:', v)} />
      </div>

      <ControlledInput />
    </div>
  );
}

function ControlledInput() {
  // 受控：父组件控制value
  const [value, setValue] = useState('');
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        受控（value + onValueChange）: {value}
      </label>
      <Input value={value} onValueChange={setValue} />
    </div>
  );
}
\`\`\`

### 关键要点总结

1. **状态下放优先**：不要为了"统一管理"把状态都放到顶层，需要共享时才提升
2. **Container/Presentational分离**：数据逻辑和UI渲染分开，易测试、易复用
3. **Compound Component复合组件**：通过Context隐式传递状态，API优雅类似原生HTML
4. **Prop Getters模式**：返回props合并函数，灵活性高，适合可访问性库
5. **State Reducer模式**：允许调用方通过reducer覆写内部状态逻辑，最高灵活性
6. **Control Props受控模式**：同时支持受控/非受控，和原生表单元素行为一致
7. **模式是手段不是目的**：根据场景选择，简单组件不需要复杂模式
8. **这些模式可以组合使用**：比如一个组件同时用Compound Component + State Reducer + Control Props
`,
  },
];