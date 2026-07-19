export const chapters = [
  {
    id: "tsrx-usereducer",
    icon: "🎛️",
    group: "Hooks篇",
    title: "useReducer复杂状态管理",
    content: `## useReducer复杂状态管理

当组件状态逻辑复杂、包含多个子状态、或者下一个状态依赖于上一个状态时，useState 可能会导致代码臃肿且难以维护。useReducer 是 React 提供的另一种状态管理方案，它借鉴了 Redux 的 reducer 模式，让状态更新更可预测、更易测试。

### 一、reducer函数：纯函数(state, action) => newState

useReducer 的核心是 reducer 函数，它必须是一个纯函数，接收当前状态和 action 对象，返回新的状态。

\`\`\`tsx
import React, { useReducer } from 'react';

// 定义状态类型
interface CounterState {
  count: number;
}

// 定义action类型 - 使用可辨识联合
type CounterAction =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' }
  | { type: 'set'; payload: number };

// reducer纯函数：接收当前state和action，返回新state
const counterReducer = (state: CounterState, action: CounterAction): CounterState => {
  // 使用switch穷尽检查所有action类型
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    case 'set':
      return { count: action.payload };
    default:
      // TypeScript穷尽检查：如果有未处理的action类型，编译时报错
      const _exhaustive: never = action;
      throw new Error(\`Unknown action type: \${_exhaustive}\`);
  }
};

const Counter = () => {
  // useReducer接收reducer函数和初始状态，返回state和dispatch
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
};
\`\`\`

### 二、TodoList完整reducer实现

下面是一个完整的TodoList应用，包含add/toggle/delete/edit/filter等全部功能：

\`\`\`tsx
import React, { useReducer, useState } from 'react';

// Todo项类型
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// 过滤类型
type FilterType = 'all' | 'active' | 'completed';

// 状态类型
interface TodoState {
  todos: Todo[];
  filter: FilterType;
  nextId: number;
}

// Action可辨识联合类型
type TodoAction =
  | { type: 'add'; payload: string }
  | { type: 'toggle'; payload: number }
  | { type: 'delete'; payload: number }
  | { type: 'edit'; payload: { id: number; text: string } }
  | { type: 'setFilter'; payload: FilterType }
  | { type: 'clearCompleted' };

// 初始状态
const initialState: TodoState = {
  todos: [],
  filter: 'all',
  nextId: 1,
};

// Todo reducer函数
const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'add':
      // 添加新todo，id自增
      return {
        ...state,
        todos: [...state.todos, {
          id: state.nextId,
          text: action.payload,
          completed: false,
        }],
        nextId: state.nextId + 1,
      };
    case 'toggle':
      // 切换todo的完成状态
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };
    case 'delete':
      // 删除指定todo
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload),
      };
    case 'edit':
      // 编辑todo文本
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, text: action.payload.text }
            : todo
        ),
      };
    case 'setFilter':
      // 设置过滤条件
      return { ...state, filter: action.payload };
    case 'clearCompleted':
      // 清除所有已完成的todo
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed),
      };
    default:
      const _exhaustive: never = action;
      throw new Error(\`Unknown action: \${_exhaustive}\`);
  }
};

const TodoList = () => {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  const [inputText, setInputText] = useState('');

  // 根据filter过滤显示的todos
  const filteredTodos = state.todos.filter(todo => {
    if (state.filter === 'active') return !todo.completed;
    if (state.filter === 'completed') return todo.completed;
    return true;
  });

  const handleAdd = () => {
    if (inputText.trim()) {
      dispatch({ type: 'add', payload: inputText.trim() });
      setInputText('');
    }
  };

  return (
    <div>
      <h2>TodoList with useReducer</h2>
      <input
        value={inputText}
        onChange={e => setInputText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
        placeholder="输入待办事项"
      />
      <button onClick={handleAdd}>添加</button>
      
      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch({ type: 'toggle', payload: todo.id })}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch({ type: 'delete', payload: todo.id })}>
              删除
            </button>
          </li>
        ))}
      </ul>

      <div>
        <button onClick={() => dispatch({ type: 'setFilter', payload: 'all' })}>全部</button>
        <button onClick={() => dispatch({ type: 'setFilter', payload: 'active' })}>未完成</button>
        <button onClick={() => dispatch({ type: 'setFilter', payload: 'completed' })}>已完成</button>
        <button onClick={() => dispatch({ type: 'clearCompleted' })}>清除已完成</button>
      </div>
    </div>
  );
};
\`\`\`

### 三、初始化init：惰性创建初始状态

useReducer 支持第三个参数 init 函数，用于惰性计算初始状态。当初始状态需要经过昂贵计算时（比如从localStorage读取），这种方式可以避免每次渲染都重新计算：

\`\`\`tsx
import React, { useReducer } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoState {
  todos: Todo[];
  nextId: number;
}

type TodoAction =
  | { type: 'add'; payload: string }
  | { type: 'toggle'; payload: number }
  | { type: 'delete'; payload: number };

// init函数：惰性初始化，从localStorage读取数据
const init = (initialTodos: Todo[]): TodoState => {
  // 从localStorage读取保存的todos
  const saved = localStorage.getItem('todos');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        todos: parsed.todos || initialTodos,
        nextId: parsed.nextId || 1,
      };
    } catch (e) {
      console.error('Failed to parse saved todos', e);
    }
  }
  return { todos: initialTodos, nextId: 1 };
};

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  let newState: TodoState;
  switch (action.type) {
    case 'add':
      newState = {
        ...state,
        todos: [...state.todos, { id: state.nextId, text: action.payload, completed: false }],
        nextId: state.nextId + 1,
      };
      break;
    case 'toggle':
      newState = {
        ...state,
        todos: state.todos.map(t =>
          t.id === action.payload ? { ...t, completed: !t.completed } : t
        ),
      };
      break;
    case 'delete':
      newState = {
        ...state,
        todos: state.todos.filter(t => t.id !== action.payload),
      };
      break;
    default:
      return state;
  }
  // 每次状态变化时保存到localStorage
  localStorage.setItem('todos', JSON.stringify(newState));
  return newState;
};

const PersistentTodoList = () => {
  // useReducer第三个参数是init函数，第二个参数是传给init的参数
  const [state, dispatch] = useReducer(todoReducer, [], init);

  return (
    <div>
      <p>数据自动保存到localStorage</p>
      <button onClick={() => dispatch({ type: 'add', payload: '新任务' })}>
        添加任务
      </button>
      <ul>
        {state.todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch({ type: 'toggle', payload: todo.id })}
            />
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
};
\`\`\`

### 四、useReducer vs useState：如何选择？

| 场景 | useState | useReducer |
|------|----------|------------|
| 简单独立状态（如input、布尔开关） | ✅ 推荐 | ❌ 过度设计 |
| 多个子状态互相关联 | ❌ 多次setState | ✅ 集中管理 |
| 状态更新逻辑复杂（有条件分支） | ❌ 逻辑散落在事件处理中 | ✅ reducer集中处理 |
| 状态转移需要可预测、可测试 | ❌ 难以测试 | ✅ reducer是纯函数易测试 |
| 深层子组件需要触发状态更新 | ❌ 需要层层传递callback | ✅ 传递dispatch即可 |
| 需要实现undo/redo | ❌ 困难 | ✅ 保存state历史数组 |

\`\`\`tsx
import React, { useReducer, useState } from 'react';

// 场景对比：useState vs useReducer

// 适合useState的简单场景
const SimpleCounter = () => {
  // 单个数值，逻辑简单，用useState足够
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Clicked {count} times
    </button>
  );
};

// 适合useReducer的复杂场景：表单多字段联动
interface FormState {
  username: string;
  email: string;
  password: string;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

type FormAction =
  | { type: 'setField'; field: keyof FormState; value: string }
  | { type: 'setErrors'; errors: Record<string, string> }
  | { type: 'submitStart' }
  | { type: 'submitEnd' }
  | { type: 'reset' };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'setField':
      return { ...state, [action.field]: action.value, errors: {} };
    case 'setErrors':
      return { ...state, errors: action.errors, isSubmitting: false };
    case 'submitStart':
      return { ...state, isSubmitting: true, errors: {} };
    case 'submitEnd':
      return { ...state, isSubmitting: false };
    case 'reset':
      return { username: '', email: '', password: '', errors: {}, isSubmitting: false };
    default:
      return state;
  }
};

const ComplexForm = () => {
  // 多个字段关联更新，用useReducer更清晰
  const [state, dispatch] = useReducer(formReducer, {
    username: '',
    email: '',
    password: '',
    errors: {},
    isSubmitting: false,
  });

  const handleSubmit = async () => {
    dispatch({ type: 'submitStart' });
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    dispatch({ type: 'submitEnd' });
  };

  return (
    <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
      <input
        value={state.username}
        onChange={e => dispatch({ type: 'setField', field: 'username', value: e.target.value })}
        placeholder="用户名"
      />
      {state.errors.username && <span>{state.errors.username}</span>}
      <button type="submit" disabled={state.isSubmitting}>
        {state.isSubmitting ? '提交中...' : '提交'}
      </button>
    </form>
  );
};
\`\`\`

### 五、useReducer + useContext 替代 Redux

当状态需要在多层组件间共享时，可以结合 useReducer 和 useContext 创建一个轻量级的状态管理方案，适合中小型应用：

\`\`\`tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// ============ 全局状态定义 ============
interface AppState {
  user: { name: string; loggedIn: boolean } | null;
  theme: 'light' | 'dark';
  notifications: string[];
}

type AppAction =
  | { type: 'login'; payload: { name: string } }
  | { type: 'logout' }
  | { type: 'toggleTheme' }
  | { type: 'addNotification'; payload: string }
  | { type: 'clearNotifications' };

const initialAppState: AppState = {
  user: null,
  theme: 'light',
  notifications: [],
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'login':
      return { ...state, user: { name: action.payload.name, loggedIn: true } };
    case 'logout':
      return { ...state, user: null };
    case 'toggleTheme':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
    case 'addNotification':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'clearNotifications':
      return { ...state, notifications: [] };
    default:
      return state;
  }
};

// ============ Context创建 ============
const AppStateContext = createContext<AppState | null>(null);
const AppDispatchContext = createContext<React.Dispatch<AppAction> | null>(null);

// Provider组件
interface AppProviderProps {
  children: ReactNode;
}

const AppProvider = ({ children }: AppProviderProps) => {
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};

// 自定义Hook封装
const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within AppProvider');
  return context;
};

const useAppDispatch = () => {
  const context = useContext(AppDispatchContext);
  if (!context) throw new Error('useAppDispatch must be used within AppProvider');
  return context;
};

// ============ 使用示例 ============
const UserProfile = () => {
  const state = useAppState();
  const dispatch = useAppDispatch();
  
  return (
    <div>
      {state.user ? (
        <>
          <p>欢迎, {state.user.name}!</p>
          <button onClick={() => dispatch({ type: 'logout' })}>退出登录</button>
        </>
      ) : (
        <button onClick={() => dispatch({ type: 'login', payload: { name: '张三' } })}>
          登录
        </button>
      )}
    </div>
  );
};

const ThemeToggle = () => {
  const state = useAppState();
  const dispatch = useAppDispatch();
  return (
    <button onClick={() => dispatch({ type: 'toggleTheme' })}>
      当前主题: {state.theme}，点击切换
    </button>
  );
};

const App = () => (
  <AppProvider>
    <UserProfile />
    <ThemeToggle />
  </AppProvider>
);
\`\`\`

### 本章小结

- **reducer必须是纯函数**：相同输入永远产生相同输出，不能有副作用、不能修改原state、不能调用非纯函数（如Date.now()、Math.random()）
- **action使用可辨识联合**：通过type字段区分不同action类型，配合switch语句实现穷尽检查，TypeScript能在编译时捕获未处理的action
- **dispatch是稳定引用**：dispatch函数在组件生命周期内不会改变，可以安全地作为useEffect依赖或传递给子组件
- **选择原则**：简单状态用useState，复杂多关联状态用useReducer；需要跨组件共享时结合useContext
`,
  },
  {
    id: "tsrx-usecontext",
    icon: "🌍",
    group: "Hooks篇",
    title: "useContext跨组件通信",
    content: `## useContext跨组件通信

在React应用中，数据通常通过props自上而下传递。但当某些数据需要在多层嵌套的组件中使用时（如当前用户信息、主题、语言偏好），层层传递props会变得非常繁琐，这被称为"props drilling"问题。useContext提供了一种在组件之间共享此类数据的方式，不必显式地通过每一层组件传递props。

### 一、createContext泛型与Provider

Context的使用分为三步：创建Context、提供Context（Provider）、消费Context（useContext）。

\`\`\`tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// ============ 1. 创建Context ============
// 使用createContext创建Context，需要指定泛型类型
// 参数是默认值，当组件没有被Provider包裹时使用

// 主题Context
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// 创建Context，默认值需要匹配ThemeContextType类型
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {
    console.warn('toggleTheme called outside ThemeProvider');
  },
});

// ============ 2. 创建Provider组件 ============
interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // value属性是传递给所有消费者的值
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ============ 3. 消费Context：自定义Hook封装 ============
const useTheme = () => {
  const context = useContext(ThemeContext);
  // 如果context为默认值，说明没有被Provider包裹
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// ============ 使用示例 ============
const ThemedButton = () => {
  // 直接使用useContext获取主题，不需要通过props传递
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      style={{
        background: theme === 'dark' ? '#333' : '#fff',
        color: theme === 'dark' ? '#fff' : '#333',
        padding: '10px 20px',
        border: '1px solid #ccc',
      }}
    >
      当前主题: {theme}，点击切换
    </button>
  );
};

// 深层嵌套组件也能直接获取
const DeepNestedComponent = () => {
  const { theme } = useTheme();
  return (
    <div style={{ padding: '20px', background: theme === 'dark' ? '#222' : '#f5f5f5' }}>
      <p>我是深层嵌套组件，直接获取到主题: {theme}</p>
      <ThemedButton />
    </div>
  );
};

const ContextDemo = () => (
  <ThemeProvider>
    <DeepNestedComponent />
  </ThemeProvider>
);
\`\`\`

### 二、ThemeContext主题切换完整Demo

\`\`\`tsx
import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

// 完整的主题配置
interface ThemeColors {
  primary: string;
  background: string;
  text: string;
  card: string;
  border: string;
}

interface ThemeConfig {
  name: 'light' | 'dark';
  colors: ThemeColors;
}

const lightTheme: ThemeConfig = {
  name: 'light',
  colors: {
    primary: '#3b82f6',
    background: '#ffffff',
    text: '#1f2937',
    card: '#f9fafb',
    border: '#e5e7eb',
  },
};

const darkTheme: ThemeConfig = {
  name: 'dark',
  colors: {
    primary: '#60a5fa',
    background: '#111827',
    text: '#f9fafb',
    card: '#1f2937',
    border: '#374151',
  },
};

interface ThemeContextValue {
  theme: ThemeConfig;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark';
}

const ThemeProvider = ({ children, defaultTheme = 'light' }: ThemeProviderProps) => {
  const [themeName, setThemeName] = useState<'light' | 'dark'>(defaultTheme);

  const value = useMemo(() => ({
    theme: themeName === 'dark' ? darkTheme : lightTheme,
    isDark: themeName === 'dark',
    toggleTheme: () => setThemeName(prev => prev === 'light' ? 'dark' : 'light'),
    setTheme: (t: 'light' | 'dark') => setThemeName(t),
  }), [themeName]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// 主题卡片组件
const ThemeCard = ({ title, children }: { title: string; children: ReactNode }) => {
  const { theme } = useTheme();
  return (
    <div style={{
      background: theme.colors.card,
      color: theme.colors.text,
      border: \`1px solid \${theme.colors.border}\`,
      borderRadius: '8px',
      padding: '20px',
      margin: '10px 0',
    }}>
      <h3 style={{ color: theme.colors.primary, marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
};

// 主题切换按钮
const ThemeSwitcher = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      style={{
        background: isDark ? darkTheme.colors.primary : lightTheme.colors.primary,
        color: '#fff',
        border: 'none',
        borderRadius: '20px',
        padding: '8px 20px',
        cursor: 'pointer',
      }}
    >
      {isDark ? '🌙 暗色模式' : '☀️ 亮色模式'}
    </button>
  );
};

const ThemeDemo = () => {
  const { theme } = useTheme();
  return (
    <div style={{
      background: theme.colors.background,
      color: theme.colors.text,
      minHeight: '100vh',
      padding: '20px',
    }}>
      <h1>ThemeContext 完整演示</h1>
      <ThemeSwitcher />
      <ThemeCard title="关于主题切换">
        <p>通过Context，所有子组件都可以访问当前主题配置，无需层层传递props。</p>
        <p>当前主题：{theme.name}</p>
      </ThemeCard>
      <ThemeCard title="颜色展示">
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {Object.entries(theme.colors).map(([name, color]) => (
            <div key={name} style={{
              background: color,
              width: '60px',
              height: '60px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: theme.name === 'dark' ? '#fff' : '#000',
              border: \`1px solid \${theme.colors.border}\`,
            }}>
              {name}
            </div>
          ))}
        </div>
      </ThemeCard>
    </div>
  );
};

const App = () => (
  <ThemeProvider defaultTheme="light">
    <ThemeDemo />
  </ThemeProvider>
);
\`\`\`

### 三、AuthContext用户登录态管理

\`\`\`tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// 用户类型
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
}

// Auth Context 值类型
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// 自定义Hook：useAuth
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 模拟登录API
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟验证
      if (email === 'a****@*********' && password === '123456') {
        setUser({
          id: '1',
          name: '管理员',
          email: 'a****@*********',
          role: 'admin',
        });
      } else if (email && password.length >= 6) {
        setUser({
          id: '2',
          name: email.split('@')[0],
          email,
          role: 'user',
        });
      } else {
        throw new Error('邮箱或密码错误（密码至少6位）');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

  // 计算派生状态
  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 使用示例组件
const LoginForm = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch {
      // 错误已在context中处理
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>登录</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="邮箱"
        />
      </div>
      <div>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="密码"
        />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? '登录中...' : '登录'}
      </button>
      <p style={{ fontSize: '12px', color: '#666' }}>
        提示：a****@********* / 123456 登录为管理员
      </p>
    </form>
  );
};

const UserDashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  return (
    <div>
      <h2>欢迎，{user?.name}！</h2>
      <p>邮箱：{user?.email}</p>
      <p>角色：{user?.role}</p>
      {isAdmin && <p style={{ color: 'red' }}>🔐 您有管理员权限</p>}
      <button onClick={logout}>退出登录</button>
    </div>
  );
};

const AuthDemo = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <UserDashboard /> : <LoginForm />;
};

const App = () => (
  <AuthProvider>
    <AuthDemo />
  </AuthProvider>
);
\`\`\`

### 四、多Context拆分与性能优化

Context有一个重要特性：**当Provider的value引用变化时，所有消费该Context的组件都会重新渲染**，即使组件只用到了value中的某一部分。解决方法是按更新频率拆分多个Context。

\`\`\`tsx
import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

// ❌ 不好的做法：把所有状态放在一个Context里
const BadStoreContext = createContext({
  user: null as { name: string } | null,
  theme: 'light' as string,
  notifications: [] as string[],
  setUser: (_: { name: string } | null) => {},
  setTheme: (_: string) => {},
  addNotification: (_: string) => {},
});

// 问题：addNotification被调用时，即使只消费theme的组件也会重渲染

// ✅ 好的做法：按更新频率拆分Context
// 1. 用户状态（登录/登出，更新频率低）
const UserContext = createContext<{
  user: { name: string } | null;
  setUser: (user: { name: string } | null) => void;
} | null>(null);

// 2. 主题状态（切换频率低）
const ThemeContext = createContext<{
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
} | null>(null);

// 3. 通知状态（更新频率高）
const NotificationContext = createContext<{
  notifications: string[];
  addNotification: (msg: string) => void;
  clearNotifications: () => void;
} | null>(null);

// 各Context的Provider可以单独提供，也可以组合
const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};

const useThemeValue = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeValue must be used within ThemeProvider');
  return ctx;
};

const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

// 组合Provider组件
interface AppProvidersProps {
  children: ReactNode;
}

const AppProviders = ({ children }: AppProvidersProps) => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState<string[]>([]);

  // 使用useMemo稳定value引用
  const userValue = useMemo(() => ({ user, setUser }), [user]);
  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);
  const notificationValue = useMemo(() => ({
    notifications,
    addNotification: (msg: string) => setNotifications(prev => [...prev, msg]),
    clearNotifications: () => setNotifications([]),
  }), [notifications]);

  return (
    <UserContext.Provider value={userValue}>
      <ThemeContext.Provider value={themeValue}>
        <NotificationContext.Provider value={notificationValue}>
          {children}
        </NotificationContext.Provider>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
};

// 主题切换组件只订阅ThemeContext，通知更新不会导致它重渲染
const ThemeOnlyComponent = React.memo(() => {
  console.log('ThemeOnlyComponent rendered'); // 添加通知时不会打印
  const { theme, setTheme } = useThemeValue();
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      主题: {theme}
    </button>
  );
});

// 通知组件只订阅NotificationContext
const NotificationList = React.memo(() => {
  console.log('NotificationList rendered'); // 切换主题时不会打印
  const { notifications, clearNotifications } = useNotifications();
  return (
    <div>
      <h4>通知 ({notifications.length})</h4>
      <button onClick={clearNotifications}>清空</button>
      <ul>
        {notifications.map((n, i) => <li key={i}>{n}</li>)}
      </ul>
    </div>
  );
});
\`\`\`

### 五、Context性能问题与useMemo稳定引用

关于Context性能，需要理解以下关键几点：

1. **React.memo不能阻止context引起的重渲染**：即使组件被memo包裹，如果它消费的context value变化了，组件仍然会重渲染
2. **value使用useMemo包裹**：如果不使用useMemo，每次Provider重渲染都会创建新的对象引用，导致所有消费者无意义重渲染
3. **拆分粒度要适度**：不是拆得越细越好，过细会导致Provider嵌套过深，增加代码复杂度

\`\`\`tsx
import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

// 性能对比：使用useMemo vs 不使用useMemo

// ✅ 正确：使用useMemo缓存value
const CorrectContext = createContext<{ count: number }>({ count: 0 });

const CorrectProvider = ({ children }: { children: ReactNode }) => {
  const [count, setCount] = useState(0);
  const [unrelatedState, setUnrelatedState] = useState(0);

  // useMemo确保只有count变化时value引用才变
  const value = useMemo(() => ({ count }), [count]);

  return (
    <CorrectContext.Provider value={value}>
      <button onClick={() => setUnrelatedState(s => s + 1)}>
        不相关状态更新: {unrelatedState}
      </button>
      <button onClick={() => setCount(c => c + 1)}>
        Count +1
      </button>
      {children}
    </CorrectContext.Provider>
  );
};

// ❌ 错误：不使用useMemo，每次Provider重渲染都创建新对象
const BadContext = createContext<{ count: number }>({ count: 0 });

const BadProvider = ({ children }: { children: ReactNode }) => {
  const [count, setCount] = useState(0);
  const [unrelatedState, setUnrelatedState] = useState(0);

  // 没有useMemo，每次渲染都是新对象{}
  // unrelatedState变化时，消费者也会重渲染！
  const value = { count };

  return (
    <BadContext.Provider value={value}>
      {children}
    </BadContext.Provider>
  );
};

// 消费者组件
const Consumer = () => {
  const { count } = useContext(CorrectContext);
  console.log('Consumer rendered with count:', count);
  return <p>Count: {count}</p>;
};
\`\`\`

### 本章小结

- **createContext需要泛型类型**：明确Context值的类型，获得完整类型推断
- **Provider必须包裹在组件树外层**：消费组件必须是Provider的后代，否则使用默认值
- **自定义Hook封装useContext**：提供更好的错误提示和使用体验
- **Context性能问题**：value引用变化会重渲染所有消费者，memo无法拦截
- **按更新频率拆分Context**：高频更新的数据独立成Context，避免无关重渲染
- **useMemo稳定value引用**：Provider中始终用useMemo包裹value对象
`,
  },
  {
    id: "tsrx-usememo",
    icon: "🧮",
    title: "useMemo计算缓存",
    content: `## useMemo计算缓存

在React组件渲染过程中，如果存在计算开销较大的操作（如大数组过滤排序、复杂数学计算、数据转换），每次渲染都重新执行这些操作会导致性能问题。useMemo可以缓存计算结果，只有当依赖项发生变化时才重新计算。

### 一、useMemo(() => compute, deps)基本用法

useMemo接收两个参数：一个"创建"函数和一个依赖数组。它会返回该函数的返回值，并在依赖不变时缓存这个结果。

\`\`\`tsx
import React, { useState, useMemo } from 'react';

// 昂贵计算函数：斐波那契数列（递归实现，故意不优化以展示性能差异）
const fib = (n: number): number => {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
};

const FibCalculator = () => {
  const [n, setN] = useState(30);
  const [count, setCount] = useState(0);

  // ✅ useMemo缓存计算结果，只有n变化时才重新计算
  const fibResult = useMemo(() => {
    console.log('Calculating fib(' + n + ')...');
    return fib(n);
  }, [n]); // 依赖数组：n变化时重新计算

  // 如果不用useMemo，每次点击count按钮也会重新计算fib！
  // const fibResult = fib(n); // ❌ 每次渲染都计算

  return (
    <div>
      <h2>useMemo缓存斐波那契计算</h2>
      <div>
        <label>n = </label>
        <input
          type="number"
          value={n}
          onChange={e => setN(Number(e.target.value) || 0)}
        />
      </div>
      <p>fib({n}) = <strong>{fibResult}</strong></p>
      <p>无关计数器：{count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        点击+1（不应该触发fib计算）
      </button>
      <p style={{ fontSize: '12px', color: '#666' }}>
        打开控制台观察：只有n变化时才打印"Calculating..."
      </p>
    </div>
  );
};
\`\`\`

### 二、大列表过滤排序性能Demo

\`\`\`tsx
import React, { useState, useMemo } from 'react';

// 生成模拟数据
const generateData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: \`用户\${i + 1}\`,
    age: 18 + Math.floor(Math.random() * 50),
    score: Math.floor(Math.random() * 100),
    department: ['技术部', '产品部', '设计部', '运营部'][Math.floor(Math.random() * 4)],
  }));
};

interface User {
  id: number;
  name: string;
  age: number;
  score: number;
  department: string;
}

const largeUserData = generateData(10000); // 1万条数据

const LargeListDemo = () => {
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'score'>('score');
  const [filterDept, setFilterDept] = useState('全部');
  const [darkMode, setDarkMode] = useState(false); // 无关状态

  // ✅ useMemo缓存大列表过滤排序结果
  // 只有searchText/sortBy/filterDept变化时才重新计算
  const filteredAndSortedUsers = useMemo(() => {
    console.log('正在过滤和排序用户列表...');
    let result = largeUserData;

    // 按部门过滤
    if (filterDept !== '全部') {
      result = result.filter(u => u.department === filterDept);
    }

    // 按搜索词过滤
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(lowerSearch));
    }

    // 排序
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b[sortBy] - a[sortBy];
    });

    return result;
  }, [searchText, sortBy, filterDept]); // 依赖数组

  // 只渲染前100条（虚拟滚动简化版）
  const displayUsers = filteredAndSortedUsers.slice(0, 100);

  return (
    <div style={{ padding: '20px' }}>
      <h2>大列表过滤排序（useMemo优化）</h2>
      <p>共 {largeUserData.length} 条数据，显示匹配的前100条</p>
      
      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="搜索用户名"
        />
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="全部">全部部门</option>
          <option value="技术部">技术部</option>
          <option value="产品部">产品部</option>
          <option value="设计部">设计部</option>
          <option value="运营部">运营部</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
          <option value="score">按分数排序</option>
          <option value="age">按年龄排序</option>
          <option value="name">按名称排序</option>
        </select>
        <button onClick={() => setDarkMode(d => !d)}>
          切换{darkMode ? '亮色' : '暗色'}模式（无关状态）
        </button>
      </div>

      <p>匹配结果：{filteredAndSortedUsers.length} 条</p>

      <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #ccc' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ position: 'sticky', top: 0, background: darkMode ? '#333' : '#f0f0f0' }}>
              <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>ID</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>姓名</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>年龄</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>分数</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>部门</th>
            </tr>
          </thead>
          <tbody>
            {displayUsers.map(user => (
              <tr key={user.id}>
                <td style={{ padding: '6px 8px' }}>{user.id}</td>
                <td style={{ padding: '6px 8px' }}>{user.name}</td>
                <td style={{ padding: '6px 8px' }}>{user.age}</td>
                <td style={{ padding: '6px 8px' }}>{user.score}</td>
                <td style={{ padding: '6px 8px' }}>{user.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
\`\`\`

### 三、保持对象/数组引用稳定，配合React.memo防止子组件重渲染

useMemo另一个重要用途：保持传递给子组件的对象/数组引用稳定，避免React.memo失效导致的无意义重渲染。

\`\`\`tsx
import React, { useState, useMemo, memo } from 'react';

// 子组件：使用React.memo包裹
// React.memo对props进行浅比较，props引用不变则不重渲染
const ChildComponent = memo(({ config, items }: {
  config: { color: string; size: number };
  items: number[];
}) => {
  console.log('ChildComponent rendered!');
  return (
    <div style={{ color: config.color, fontSize: config.size }}>
      <p>配置：color={config.color}, size={config.size}</p>
      <p>数据项：{items.join(', ')}</p>
    </div>
  );
});

const ParentComponent = () => {
  const [count, setCount] = useState(0);
  const [color, setColor] = useState('blue');

  // ❌ 错误：每次渲染都是新对象，React.memo失效！
  // const badConfig = { color, size: 16 };
  // const badItems = [1, 2, 3];

  // ✅ 正确：使用useMemo保持引用稳定
  const config = useMemo(() => ({
    color,
    size: 16,
  }), [color]); // 只有color变化时才返回新对象

  const items = useMemo(() => [1, 2, 3], []); // 空依赖，永远不重新创建

  return (
    <div>
      <h2>useMemo稳定引用 + React.memo</h2>
      <button onClick={() => setCount(c => c + 1)}>
        点击计数：{count}（不应该导致Child重渲染）
      </button>
      <button onClick={() => setColor(c => c === 'blue' ? 'red' : 'blue')}>
        切换颜色（会导致Child重渲染）
      </button>
      <ChildComponent config={config} items={items} />
      <p style={{ fontSize: '12px', color: '#666' }}>
        打开控制台观察：点击计数按钮时ChildComponent不会打印rendered
      </p>
    </div>
  );
};
\`\`\`

### 四、useMemo依赖错误案例与过度优化反模式

使用useMemo时要注意正确设置依赖数组，同时避免过早优化。

\`\`\`tsx
import React, { useState, useMemo } from 'react';

const UseMemoPitfalls = () => {
  const [a, setA] = useState(1);
  const [b, setB] = useState(2);

  // ❌ 错误1：在依赖中使用了memo计算值本身，造成循环依赖或过时值
  // const badSum = useMemo(() => a + badSum, [a, badSum]); // 不要这样做！

  // ✅ 正确：依赖只包含真正需要的原始值
  const sum = useMemo(() => a + b, [a, b]);

  // ❌ 错误2：useMemo中执行副作用（useMemo是渲染阶段执行的）
  // const badEffect = useMemo(() => {
  //   document.title = \`Sum: \${sum}\`; // 不要在useMemo中做副作用！
  //   return sum;
  // }, [sum]);

  // ✅ 正确：副作用应该用useEffect
  // useEffect(() => {
  //   document.title = \`Sum: \${sum}\`;
  // }, [sum]);

  // ❌ 错误3：过度优化 - 简单计算不需要useMemo
  // useMemo本身也有开销（依赖比较、缓存存储）
  const simpleValue = a * 2; // 简单乘法，直接计算即可，不需要useMemo

  // ✅ 什么时候真的需要useMemo？
  // 1. 计算确实昂贵（大数据量过滤/排序/递归）
  // 2. 需要保持引用稳定传给memo子组件
  // 3. 计算结果作为其他Hook的依赖
  const expensiveValue = useMemo(() => {
    // 比如上千次循环、复杂正则匹配、大数组reduce
    let result = 0;
    for (let i = 0; i < 100000; i++) {
      result += Math.sqrt(i * a);
    }
    return result;
  }, [a]); // 只有a变化时才重新计算

  return (
    <div>
      <h2>useMemo使用注意事项</h2>
      <div>
        <button onClick={() => setA(a => a + 1)}>a: {a}</button>
        <button onClick={() => setB(b => b + 1)}>b: {b}</button>
      </div>
      <p>sum = a + b = {sum}</p>
      <p>simpleValue = a * 2 = {simpleValue}（直接计算，不用useMemo）</p>
      <p>expensiveValue（有缓存）: {Math.floor(expensiveValue)}</p>
      <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5', fontSize: '14px' }}>
        <p><strong>useMemo不能保证语义上的缓存</strong></p>
        <p>React官方文档明确说明：useMemo只是性能优化手段，React可能在某些情况下丢弃缓存重新计算
        （如内存不足时）。因此，你的代码在没有useMemo时也应该能正常工作，useMemo只影响性能。</p>
        <p><strong>优化原则：先Profile再优化！</strong></p>
        <p>使用React DevTools Profiler确认性能瓶颈后再添加useMemo，不要过度优化。</p>
      </div>
    </div>
  );
};
\`\`\`

### 本章小结

- **useMemo用于缓存昂贵计算**：返回值在依赖不变时被缓存
- **语法**：const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])
- **重要用途**：保持对象/数组引用稳定，配合React.memo避免子组件无意义重渲染
- **依赖数组规则**：和useEffect一样，必须包含所有在回调中使用的响应式值
- **不能保证永远缓存**：React可能在内存紧张时丢弃缓存，不要依赖useMemo做语义保证
- **不要过度优化**：简单计算直接写就行，useMemo本身有开销；先Profiler确认瓶颈再优化
- **不要在useMemo中执行副作用**：渲染阶段不应有副作用，副作用用useEffect
`,
  },
  {
    id: "tsrx-usecallback",
    icon: "🔗",
    title: "useCallback函数缓存",
    content: `## useCallback函数缓存

在React中，每次组件渲染都会创建新的函数实例。当这些函数作为props传递给被React.memo包裹的子组件时，会导致子组件无意义地重渲染。useCallback用于缓存函数引用，在依赖不变时返回同一个函数。

### 一、useCallback(fn, deps)基本用法

useCallback接收一个内联回调函数和一个依赖数组，返回该回调函数的memoized版本。只有当某个依赖改变时，才会更新这个回调函数。

\`\`\`tsx
import React, { useState, useCallback, memo } from 'react';

// 用React.memo包裹的子组件 - 只有props引用变化时才重渲染
const MemoizedButton = memo(({ onClick, label }: {
  onClick: () => void;
  label: string;
}) => {
  console.log(\`Button "\${label}" rendered!\`);
  return (
    <button onClick={onClick} style={{ margin: '5px', padding: '8px 16px' }}>
      {label}
    </button>
  );
});

const UseCallbackBasic = () => {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // ❌ 不使用useCallback：每次渲染都是新函数
  // 每次父组件渲染（比如输入text时），这个函数都是新引用
  // 导致MemoizedButton每次都重渲染
  // const handleIncrement = () => setCount(c => c + 1);

  // ✅ 使用useCallback：依赖为空，只创建一次
  // 空依赖数组意味着这个函数永远不会变
  const handleIncrement = useCallback(() => {
    setCount(c => c + 1);
  }, []); // 没有依赖

  const handleReset = useCallback(() => {
    setCount(0);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>useCallback基本用法</h2>
      <p>Count: {count}</p>
      <MemoizedButton onClick={handleIncrement} label="+1" />
      <MemoizedButton onClick={handleReset} label="重置" />
      <div style={{ marginTop: '10px' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="输入文字（不应该导致按钮重渲染）"
        />
      </div>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        打开控制台观察：输入框输入时按钮不会打印"rendered"
      </p>
    </div>
  );
};
\`\`\`

### 二、useCallback和useMemo的关系

useCallback和useMemo关系密切，可以互相转换：
- useCallback(fn, deps) 等价于 useMemo(() => fn, deps)
- useMemo缓存"值"，useCallback缓存"函数"

\`\`\`tsx
import React, { useState, useCallback, useMemo } from 'react';

const CallbackVsMemo = () => {
  const [count, setCount] = useState(0);

  // useCallback：缓存函数本身
  const incrementWithCallback = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  // useMemo：缓存函数的返回值。如果返回函数，效果和useCallback一样
  const incrementWithMemo = useMemo(() => {
    // 返回一个函数
    return () => setCount(c => c + 1);
  }, []);

  // 验证：它们都是函数
  console.log('useCallback返回:', typeof incrementWithCallback); // function
  console.log('useMemo返回:', typeof incrementWithMemo); // function

  // 区别：
  // useCallback(fn, deps) → 缓存fn
  // useMemo(() => fn, deps) → 缓存() => fn的返回值，也就是fn
  // 所以 useCallback(fn, deps) === useMemo(() => fn, deps)

  return (
    <div>
      <h2>useCallback vs useMemo</h2>
      <p>Count: {count}</p>
      <button onClick={incrementWithCallback}>useCallback +1</button>
      <button onClick={incrementWithMemo}>useMemo +1</button>
      <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
        <p><strong>记忆法则：</strong></p>
        <ul>
          <li><code>useCallback</code>：缓存<strong>函数</strong>，用于传递给子组件的事件处理函数</li>
          <li><code>useMemo</code>：缓存<strong>计算结果</strong>，用于昂贵计算或稳定引用</li>
        </ul>
      </div>
    </div>
  );
};
\`\`\`

### 三、给memo子组件传递callback props必须用useCallback

这是useCallback最常见的使用场景。

\`\`\`tsx
import React, { useState, useCallback, memo, useMemo } from 'react';

// 列表项组件 - memo包裹
interface TodoItemProps {
  id: number;
  text: string;
  completed: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const TodoItem = memo(({ id, text, completed, onToggle, onDelete }: TodoItemProps) => {
  console.log(\`TodoItem #\${id} rendered\`);
  return (
    <li style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <input
        type="checkbox"
        checked={completed}
        onChange={() => onToggle(id)}
      />
      <span style={{ textDecoration: completed ? 'line-through' : 'none', flex: 1 }}>
        {text}
      </span>
      <button onClick={() => onDelete(id)}>删除</button>
    </li>
  );
});

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: '学习useCallback', completed: false },
    { id: 2, text: '理解React.memo', completed: false },
    { id: 3, text: '掌握性能优化', completed: false },
  ]);
  const [inputText, setInputText] = useState('');
  const [darkMode, setDarkMode] = useState(false); // 无关状态

  // ✅ 使用useCallback缓存事件处理函数
  // 如果不使用useCallback，每次添加/切换/删除一个todo，
  // 所有TodoItem都会因为接收新函数而重渲染
  const handleToggle = useCallback((id: number) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []); // 空依赖：setTodos是稳定的，不需要放进依赖

  const handleDelete = useCallback((id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  const handleAdd = useCallback(() => {
    if (inputText.trim()) {
      setTodos(prev => [...prev, {
        id: Date.now(),
        text: inputText.trim(),
        completed: false,
      }]);
      setInputText('');
    }
  }, [inputText]); // inputText变化时更新函数

  return (
    <div style={{ padding: '20px' }}>
      <h2>TodoList with useCallback</h2>
      <button onClick={() => setDarkMode(d => !d)}>
        切换{darkMode ? '亮色' : '暗色'}模式（无关状态）
      </button>
      <div style={{ marginTop: '10px', marginBottom: '10px' }}>
        <input
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="添加新待办"
        />
        <button onClick={handleAdd}>添加</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            id={todo.id}
            text={todo.text}
            completed={todo.completed}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
      </ul>
      <p style={{ fontSize: '12px', color: '#666' }}>
        打开控制台：切换暗色模式时，TodoItem不应重渲染
      </p>
    </div>
  );
};
\`\`\`

### 四、自定义Hook返回函数应该用useCallback包裹 & 常见错误

自定义Hook如果返回函数，这些函数应该用useCallback包裹，以便调用方可以安全地将它们作为useEffect等Hook的依赖。

\`\`\`tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';

// ============ 自定义Hook：useToggle ============
// 返回的函数用useCallback包裹
const useToggle = (initialValue = false): [boolean, () => void, (v: boolean) => void] => {
  const [value, setValue] = useState(initialValue);

  // ✅ 用useCallback包裹toggle函数
  // 调用方可以安全地将它作为useEffect依赖
  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  const setValueDirect = useCallback((v: boolean) => {
    setValue(v);
  }, []);

  return [value, toggle, setValueDirect];
};

// ============ 常见错误场景 ============
const UseCallbackPitfalls = () => {
  const [isOpen, toggle] = useToggle(false);
  const [count, setCount] = useState(0);

  // ❌ 常见错误1：在useCallback里引用了未列在deps中的变量
  const [multiplier, setMultiplier] = useState(2);
  
  // const badCallback = useCallback(() => {
  //   // multiplier没有列在deps里，会读到陈旧值！
  //   setCount(c => c * multiplier);
  // }, []); // ESLint会警告：React Hook useCallback has a missing dependency: 'multiplier'

  // ✅ 正确：把依赖列全
  const goodMultiply = useCallback(() => {
    setCount(c => c * multiplier);
  }, [multiplier]);

  // 错误2：传给DOM原生元素的函数不需要useCallback
  // <button onClick={() => setCount(c => c + 1)}>
  // 原生button不是memo组件，新函数不会造成性能问题

  // 错误3：组件没有memo，callback用了useCallback也白搭
  // 如果子组件没有用React.memo包裹，不管props变不变都会重渲染

  // ✅ 什么时候不需要useCallback？
  // 1. 传给DOM原生组件（div, button, input等）
  // 2. 子组件没有用React.memo包裹
  // 3. 非常简单的页面，性能没有问题
  // 4. 函数每次都要变化（比如依赖经常变的props）

  // 演示：正确使用自定义Hook返回的callback
  useEffect(() => {
    console.log('toggle函数稳定，这个effect只会在mount时执行');
    // 因为toggle是useCallback([])返回的，引用永远不变
  }, [toggle]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>useCallback注意事项</h2>
      <p>开关状态: {isOpen ? '开' : '关'}</p>
      <button onClick={toggle}>切换</button>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+1（原生按钮，无需useCallback）</button>
      <button onClick={goodMultiply}>x{multiplier}</button>
      <div>
        <label>乘数: </label>
        <input
          type="number"
          value={multiplier}
          onChange={e => setMultiplier(Number(e.target.value))}
        />
      </div>
      <div style={{ marginTop: '20px', padding: '10px', background: '#fff3cd', borderRadius: '4px' }}>
        <p><strong>不需要useCallback的场景：</strong></p>
        <ul>
          <li>传给原生DOM元素的事件处理函数</li>
          <li>子组件没有被React.memo包裹</li>
          <li>函数依赖经常变化，缓存没有意义</li>
          <li>简单页面/组件，没有性能问题</li>
        </ul>
        <p><strong>需要useCallback的场景：</strong></p>
        <ul>
          <li>函数作为props传递给memo子组件</li>
          <li>函数作为其他Hook的依赖（如useEffect）</li>
          <li>自定义Hook返回的函数</li>
        </ul>
      </div>
    </div>
  );
};
\`\`\`

### 本章小结

- **useCallback缓存函数引用**：依赖不变时返回同一个函数
- **语法**：const memoizedFn = useCallback(() => doSomething(a, b), [a, b])
- **与useMemo关系**：useCallback(fn, deps) === useMemo(() => fn, deps)
- **核心使用场景**：
  1. 给React.memo子组件传递回调函数props
  2. 自定义Hook返回函数，方便调用方作为依赖
  3. 函数作为useEffect等Hook的依赖
- **不需要useCallback**：原生DOM组件、子组件没memo、简单页面
- **依赖要列全**：ESLint的react-hooks/exhaustive-deps规则会帮你检查
`,
  },
  {
    id: "tsrx-customhook",
    icon: "🪝",
    title: "自定义Hook封装模式",
    content: `## 自定义Hook封装模式

自定义Hook是React Hooks最强大的特性之一，它允许你将组件逻辑提取到可重用的函数中。自定义Hook让状态逻辑可以在多个组件间复用，而不需要使用高阶组件（HOC）或render props等复杂模式。

### 命名规则与基本原则

自定义Hook必须以"use"开头（如useToggle、useLocalStorage），这不仅是约定，也是ESLint插件识别Hook的规则。自定义Hook内部可以调用其他Hook，但必须遵循Hook规则（只在顶层调用）。

### 1. useToggle - 布尔值切换

\`\`\`tsx
import { useState, useCallback } from 'react';

// 通用布尔值切换Hook
// 用于管理开关、弹窗显示/隐藏、折叠/展开等场景
const useToggle = (initialValue: boolean = false): [
  boolean,           // 当前值
  () => void,        // toggle函数
  (v: boolean) => void  // 直接设置值
] => {
  const [value, setValue] = useState(initialValue);

  // 使用useCallback保持函数引用稳定
  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  const setDirect = useCallback((v: boolean) => {
    setValue(v);
  }, []);

  return [value, toggle, setDirect];
};

// 使用示例
const ToggleDemo = () => {
  const [isModalOpen, toggleModal, setModalOpen] = useToggle(false);
  const [isDarkMode, toggleDarkMode] = useToggle(true);

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={toggleModal}>
        {isModalOpen ? '关闭弹窗' : '打开弹窗'}
      </button>
      <button onClick={toggleDarkMode}>
        {isDarkMode ? '🌙 暗色' : '☀️ 亮色'}
      </button>
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white', padding: '20px', border: '1px solid #ccc',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: '8px',
        }}>
          <h3>弹窗内容</h3>
          <p>这是一个用useToggle控制的弹窗</p>
          <button onClick={() => setModalOpen(false)}>关闭</button>
        </div>
      )}
    </div>
  );
};
\`\`\`

### 2. useLocalStorage - 持久化到localStorage

\`\`\`tsx
import { useState, useCallback, useEffect } from 'react';

// 自动同步localStorage的Hook
// 数据在页面刷新后依然保留
const useLocalStorage = <T>(key: string, initialValue: T): [
  T,
  (value: T | ((prev: T) => T)) => void,
  () => void
] => {
  // 初始化时从localStorage读取
  const [storedValue, setStoredValue] = useState<T>(() => {
    // 惰性初始化：只在首次渲染时读取
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

  // 删除值
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(\`Error removing localStorage key "\${key}":\`, error);
    }
  }, [key, initialValue]);

  // 监听其他标签页的storage变化，实现多标签页同步
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

  return [storedValue, setValue, removeValue];
};

// 使用示例
const LocalStorageDemo = () => {
  const [name, setName] = useLocalStorage('user-name', '');
  const [theme] = useLocalStorage('theme', 'light');

  return (
    <div style={{ padding: '20px' }}>
      <h3>useLocalStorage演示</h3>
      <p>输入的名字会自动保存到localStorage，刷新页面后依然存在</p>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="输入你的名字"
      />
      {name && <p>你好，{name}！</p>}
      <p>当前保存的主题设置：{theme}</p>
    </div>
  );
};
\`\`\`

### 3. useDebounce - 防抖值更新

\`\`\`tsx
import { useState, useEffect } from 'react';

// 防抖Hook：值变化后延迟更新
// 常用于搜索输入、窗口resize等频繁触发的场景
const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 设置定时器，delay毫秒后更新值
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函数：如果value在delay内再次变化，取消上一次定时器
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // value或delay变化时重新设置

  return debouncedValue;
};

// 使用示例：防抖搜索
const DebounceSearchDemo = () => {
  const [searchText, setSearchText] = useState('');
  // 输入停止300ms后debouncedSearchText才会更新
  const debouncedSearch = useDebounce(searchText, 300);

  // 使用防抖后的值进行搜索，避免每次按键都发请求
  useEffect(() => {
    if (debouncedSearch) {
      console.log('发起搜索请求:', debouncedSearch);
      // 这里可以调用搜索API
    }
  }, [debouncedSearch]);

  return (
    <div style={{ padding: '20px' }}>
      <h3>useDebounce搜索演示</h3>
      <input
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        placeholder="输入搜索关键词"
        style={{ padding: '8px', width: '300px' }}
      />
      <p>实时输入: {searchText}</p>
      <p>防抖后（300ms）: <strong>{debouncedSearch}</strong></p>
    </div>
  );
};
\`\`\`

### 4. useFetch - 数据请求+loading/error

\`\`\`tsx
import { useState, useEffect, useCallback } from 'react';

// 数据请求Hook
interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

const useFetch = <T>(url: string, options?: RequestInit): FetchState<T> & { refetch: () => void } => {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      const data = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      });
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
};

// 使用示例
interface User {
  id: number;
  name: string;
  email: string;
}

const FetchDemo = () => {
  const { data, loading, error, refetch } = useFetch<User[]>(
    'https://jsonplaceholder.typicode.com/users'
  );

  if (loading) return <div>加载中...</div>;
  if (error) return <div>出错了: {error.message}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h3>useFetch数据请求</h3>
      <button onClick={refetch}>重新获取</button>
      <ul>
        {data?.map(user => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
};
\`\`\`

### 5. useInterval - 解决setInterval闭包陈旧问题

\`\`\`tsx
import { useState, useEffect, useRef, useCallback } from 'react';

// setInterval的Hook封装
// 解决两个问题：
// 1. 闭包陈旧：回调函数里能获取最新值
// 2. 自动清理：组件卸载时自动清除定时器
const useInterval = (callback: () => void, delay: number | null) => {
  // 使用useRef保存最新的callback
  const savedCallback = useRef<() => void>();

  // 每次渲染后更新ref中的callback
  // 这样interval回调里总是能拿到最新的函数和状态
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // 设置interval
  useEffect(() => {
    // delay为null时暂停
    if (delay === null) return;

    const tick = () => {
      savedCallback.current?.();
    };

    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
};

// 使用示例：计数器
const IntervalDemo = () => {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  // useInterval里回调能获取最新的count值
  useInterval(
    () => {
      setCount(c => c + 1);
    },
    isRunning ? 1000 : null // delay为null时暂停
  );

  return (
    <div style={{ padding: '20px' }}>
      <h3>useInterval定时器</h3>
      <p>Count: {count}</p>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? '暂停' : '开始'}
      </button>
      <button onClick={() => setCount(0)}>重置</button>
      <p style={{ fontSize: '12px', color: '#666' }}>
        相比直接使用setInterval，useInterval自动处理闭包问题和清理
      </p>
    </div>
  );
};
\`\`\`

### 6. useEventListener - 自动清理事件监听

\`\`\`tsx
import { useEffect, useRef } from 'react';

// 事件监听Hook
// 自动处理事件绑定和清理，避免内存泄漏
const useEventListener = <K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement | Document = window,
  options?: boolean | AddEventListenerOptions
) => {
  // 使用useRef保存handler，避免每次渲染都重新绑定
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // 确保element支持addEventListener
    if (!element || !element.addEventListener) return;

    const eventListener = (event: Event) => {
      savedHandler.current(event as WindowEventMap[K]);
    };

    element.addEventListener(eventName, eventListener, options);

    // 清理：组件卸载时移除监听
    return () => {
      element.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
};

// 使用示例：监听键盘事件
const EventListenerDemo = () => {
  const [lastKey, setLastKey] = useState<string>('');

  useEventListener('keydown', (e) => {
    setLastKey(e.key);
  });

  return (
    <div style={{ padding: '20px' }}>
      <h3>useEventListener键盘监听</h3>
      <p>按下任意键，下方显示最后按下的键：</p>
      <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{lastKey || '按下一个键'}</p>
    </div>
  );
};
\`\`\`

### 7. useMediaQuery - 响应式断点匹配

\`\`\`tsx
import { useState, useEffect } from 'react';

// 响应式媒体查询Hook
// 返回当前是否匹配指定的媒体查询
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    // 惰性初始化：SSR时window不存在，返回false
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // 初始检查
    setMatches(mediaQuery.matches);

    // 监听变化
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 兼容新旧API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Safari < 14
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
};

// 使用示例：响应式布局
const MediaQueryDemo = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <div style={{ padding: '20px' }}>
      <h3>useMediaQuery响应式检测</h3>
      <p>当前屏幕：<strong>{isMobile ? '📱 移动端' : '💻 桌面端'}</strong></p>
      <p>系统主题偏好：<strong>{isDarkMode ? '🌙 暗色模式' : '☀️ 亮色模式'}</strong></p>
      <p>减少动画：<strong>{isReducedMotion ? '是' : '否'}</strong></p>
      <div style={{
        padding: '20px',
        background: isMobile ? '#ffe0e0' : '#e0ffe0',
        borderRadius: '8px',
      }}>
        {isMobile ? '在手机上看到的是红色背景' : '在桌面端看到的是绿色背景'}
      </div>
    </div>
  );
};
\`\`\`

### 8. usePrevious - 获取上一轮渲染值

\`\`\`tsx
import { useEffect, useRef } from 'react';

// 获取上一轮渲染的值
const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]); // 每次渲染后更新ref，但返回的是更新前的值

  // 返回的是上一次渲染时ref.current的值
  return ref.current;
};

// 使用示例：比较值变化
const PreviousDemo = () => {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  const [name, setName] = useState('');
  const prevName = usePrevious(name);

  return (
    <div style={{ padding: '20px' }}>
      <h3>usePrevious获取上一轮值</h3>
      <div>
        <p>Count: 当前={count}, 之前={prevCount ?? '无'}</p>
        <button onClick={() => setCount(c => c + 1)}>+1</button>
      </div>
      <div style={{ marginTop: '10px' }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="输入名字"
        />
        <p>名字变化：{prevName} → {name}</p>
      </div>
    </div>
  );
};
\`\`\`

### 更多实用Hooks：useKeyPress、useHover、useWindowSize

\`\`\`tsx
// ============ useKeyPress：监听单个按键 ============
const useKeyPress = (targetKey: string): boolean => {
  const [isPressed, setIsPressed] = useState(false);

  useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === targetKey) setIsPressed(true);
  });
  useEventListener('keyup', (e: KeyboardEvent) => {
    if (e.key === targetKey) setIsPressed(false);
  });

  return isPressed;
};

// ============ useHover：鼠标悬停状态 ============
const useHover = <T extends HTMLElement>(): [React.RefObject<T>, boolean] => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return [ref, isHovered];
};

// ============ useWindowSize：窗口尺寸 ============
interface WindowSize {
  width: number;
  height: number;
}

const useWindowSize = (): WindowSize => {
  const [size, setSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEventListener('resize', () => {
    setSize({ width: window.innerWidth, height: window.innerHeight });
  });

  return size;
};

// ============ 综合示例 ============
const CombinedHooksDemo = () => {
  const escapePressed = useKeyPress('Escape');
  const [hoverRef, isHovered] = useHover<HTMLDivElement>();
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (escapePressed) {
      console.log('Escape键被按下！可以用来关闭弹窗');
    }
  }, [escapePressed]);

  return (
    <div style={{ padding: '20px' }}>
      <h3>更多Hooks演示</h3>
      <div
        ref={hoverRef}
        style={{
          padding: '20px',
          background: isHovered ? '#4CAF50' : '#ccc',
          color: 'white',
          textAlign: 'center',
          borderRadius: '8px',
          transition: 'background 0.3s',
        }}
      >
        {isHovered ? '鼠标在上面！' : '把鼠标移到这里'}
      </div>
      <p style={{ marginTop: '20px' }}>
        窗口尺寸: {width} x {height}
      </p>
      <p>Escape键: {escapePressed ? '✅ 按下中' : '❌ 未按下'}</p>
    </div>
  );
};
\`\`\`

### 本章小结

- **自定义Hook命名**：必须以"use"开头，这是ESLint识别的基础
- **逻辑复用本质**：自定义Hook复用的是"状态逻辑"，不是状态本身；每次调用Hook产生独立的state
- **useRef保存回调**：解决闭包陈旧问题（如useInterval、useEventListener）
- **useCallback包裹返回函数**：保证函数引用稳定，方便调用方作为依赖
- **自动清理副作用**：useEffect返回清理函数，组件卸载时自动执行
- **类型泛型支持**：自定义Hook使用泛型<T>提供类型安全（如useLocalStorage<T>、useDebounce<T>）
- **组合现有Hook**：自定义Hook内部可以调用其他自定义Hook，层层组合
`,
  },
  {
    id: "tsrx-uselayouteffect",
    icon: "📐",
    title: "useLayoutEffect与DOM测量",
    content: `## useLayoutEffect与DOM测量

useEffect在浏览器完成绘制之后异步执行，不会阻塞浏览器更新屏幕。而useLayoutEffect在DOM变更之后、浏览器绘制之前同步执行，会阻塞浏览器绘制。这使得useLayoutEffect非常适合需要读取DOM布局信息并同步修改DOM的场景。

### 一、useEffect vs useLayoutEffect执行时机

理解两者的执行时机差异至关重要：

1. 组件渲染（render phase）→ 生成虚拟DOM
2. DOM变更（commit phase）→ React更新真实DOM
3. **useLayoutEffect** 执行（同步，阻塞绘制）→ 可以读取/修改DOM
4. 浏览器绘制（paint）→ 用户看到页面
5. **useEffect** 执行（异步，绘制后）→ 不阻塞页面

\`\`\`tsx
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';

const EffectTimingDemo = () => {
  const [count, setCount] = useState(0);
  const renderTime = useRef(Date.now());

  // useLayoutEffect在DOM更新后、浏览器绘制前同步执行
  useLayoutEffect(() => {
    console.log('1. useLayoutEffect执行 - DOM已更新但还没绘制');
    console.log('   此时可以读取DOM尺寸、位置等布局信息');
    // 这里的DOM修改用户看不到中间态（不会闪烁）
  }, [count]);

  // useEffect在浏览器绘制完成后异步执行
  useEffect(() => {
    console.log('2. useEffect执行 - 浏览器已完成绘制');
    console.log('   用户已经看到了页面更新');
  }, [count]);

  console.log('0. 组件渲染');

  return (
    <div style={{ padding: '20px' }}>
      <h2>useLayoutEffect vs useEffect 执行时机</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>触发更新</button>
      <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0' }}>
        <h4>执行顺序（打开Console观察）：</h4>
        <ol>
          <li>组件渲染 → 更新虚拟DOM</li>
          <li>React更新真实DOM</li>
          <li><strong>useLayoutEffect</strong>同步执行（阻塞绘制）</li>
          <li>浏览器绘制页面</li>
          <li><strong>useEffect</strong>异步执行（绘制后）</li>
        </ol>
      </div>
    </div>
  );
};
\`\`\`

### 二、DOM测量：获取元素尺寸和位置

useLayoutEffect最常见的用途是DOM测量。如果你在useEffect中读取DOM尺寸并据此修改样式，用户可能会看到一帧闪烁（先看到旧布局，再看到新布局）。

\`\`\`tsx
import React, { useState, useLayoutEffect, useRef } from 'react';

// 测量元素尺寸的Hook
const useElementSize = <T extends HTMLElement>(): [
  React.RefObject<T>,
  { width: number; height: number; top: number; left: number }
] => {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0, top: 0, left: 0 });

  // 使用useLayoutEffect：在绘制前完成测量和状态更新
  // 如果用useEffect，用户可能先看到0尺寸，然后突然跳变
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      // getBoundingClientRect返回元素的位置和尺寸信息
      const rect = element.getBoundingClientRect();
      setSize({
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      });
    };

    // 初始测量
    updateSize();

    // 监听窗口resize
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return [ref, size];
};

// 使用示例
const MeasureDemo = () => {
  const [boxRef, boxSize] = useElementSize<HTMLDivElement>();
  const [text, setText] = useState('调整窗口大小，观察尺寸变化');

  return (
    <div style={{ padding: '20px' }}>
      <h2>DOM测量演示</h2>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        style={{ width: '100%', height: '60px', marginBottom: '10px' }}
      />
      <div
        ref={boxRef}
        style={{
          padding: '20px',
          background: '#e3f2fd',
          border: '2px solid #2196f3',
          borderRadius: '8px',
          resize: 'both',
          overflow: 'auto',
          minWidth: '200px',
          minHeight: '100px',
        }}
      >
        <p>{text}</p>
        <div style={{
          position: 'absolute',
          top: '5px',
          right: '10px',
          fontSize: '12px',
          color: '#666',
        }}>
          拖拽右下角可以调整大小
        </div>
      </div>
      <div style={{ marginTop: '10px', fontFamily: 'monospace' }}>
        <p>宽度: {Math.round(boxSize.width)}px</p>
        <p>高度: {Math.round(boxSize.height)}px</p>
        <p>位置: top={Math.round(boxSize.top)}, left={Math.round(boxSize.left)}</p>
      </div>
    </div>
  );
};
\`\`\`

### 三、Tooltip自动调整方向Demo

这是一个经典的useLayoutEffect使用场景：根据元素位置自动决定Tooltip显示在上方还是下方，避免超出视口。

\`\`\`tsx
import React, { useState, useLayoutEffect, useRef } from 'react';

// Tooltip组件：自动判断显示方向
interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip = ({ text, children }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 使用useLayoutEffect：在Tooltip显示前测量位置，决定方向
  useLayoutEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // 判断上方空间是否足够
    const spaceAbove = triggerRect.top;
    const spaceBelow = viewportHeight - triggerRect.bottom;

    // 如果下方空间不够且上方空间足够，显示在上方；否则显示在下方
    if (spaceBelow < tooltipRect.height && spaceAbove >= tooltipRect.height) {
      setPosition('top');
    } else {
      setPosition('bottom');
    }
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      style={{ display: 'inline-block', position: 'relative' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            ...(position === 'top'
              ? { bottom: '100%', marginBottom: '8px' }
              : { top: '100%', marginTop: '8px' }),
            background: '#333',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
          }}
        >
          {text}
          {/* 小三角指示器 */}
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            ...(position === 'top'
              ? { bottom: '-6px', borderTop: '6px solid #333' }
              : { top: '-6px', borderBottom: '6px solid #333' }),
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
          }} />
        </div>
      )}
    </div>
  );
};

const TooltipDemo = () => {
  return (
    <div style={{ padding: '40px 20px' }}>
      <h2>Tooltip自动调整方向</h2>
      <p>将鼠标移到下面的元素上，Tooltip会自动判断显示在上方还是下方</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '200px', alignItems: 'center' }}>
        <div style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
        }}>
          <Tooltip text="我显示在下方！（因为上方空间不够）">
            <button style={{ padding: '10px 20px', fontSize: '16px' }}>
              靠近顶部的按钮
            </button>
          </Tooltip>
        </div>
        <div>
          <p>滚动页面查看效果</p>
        </div>
        <div style={{
          position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
        }}>
          <Tooltip text="我显示在上方！（因为下方空间不够）">
            <button style={{ padding: '10px 20px', fontSize: '16px' }}>
              靠近底部的按钮
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
\`\`\`

### 四、滚动位置保持与防止闪烁

\`\`\`tsx
import React, { useState, useLayoutEffect, useRef } from 'react';

// 保持滚动位置的Hook：类似聊天应用加载历史消息时保持视口位置
const useScrollPosition = (containerRef: React.RefObject<HTMLElement>, dependency: any) => {
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 在DOM更新后、绘制前，调整滚动位置
    // 这样用户看不到页面跳动
    const scrollHeight = container.scrollHeight;
    const scrollTop = container.scrollTop;

    // 使用requestAnimationFrame在浏览器绘制前设置滚动位置
    requestAnimationFrame(() => {
      if (container) {
        // 保持滚动位置相对于底部
        container.scrollTop = container.scrollHeight - scrollHeight + scrollTop;
      }
    });
  }, [dependency]);
};

// 防闪烁Demo：useEffect vs useLayoutEffect对比
const FlickerFixDemo = () => {
  const [showFixed, setShowFixed] = useState(true);
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxWidth, setBoxWidth] = useState(0);

  // ❌ 如果用useEffect，会有闪烁：
  // 用户先看到boxWidth=0的状态，然后看到正确的宽度
  // useEffect(() => {
  //   if (boxRef.current) {
  //     setBoxWidth(boxRef.current.getBoundingClientRect().width);
  //   }
  // }, []);

  // ✅ 用useLayoutEffect，在绘制前设置正确的值，用户看不到闪烁
  useLayoutEffect(() => {
    if (boxRef.current) {
      setBoxWidth(boxRef.current.getBoundingClientRect().width);
    }
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>防止闪烁</h2>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setShowFixed(s => !s)}>
          {showFixed ? '隐藏' : '显示'}宽度测量Demo
        </button>
      </div>
      {showFixed && (
        <div
          ref={boxRef}
          style={{
            padding: '20px',
            background: '#e8f5e9',
            border: '2px solid #4caf50',
            borderRadius: '8px',
            width: '70%',
          }}
        >
          <p>这个元素的宽度是在useLayoutEffect中测量的</p>
          <p>测量结果宽度：<strong>{Math.round(boxWidth)}px</strong></p>
          <p style={{ fontSize: '12px', color: '#666' }}>
            如果用useEffect测量，你会看到宽度从0突然跳到正确值（闪烁）
          </p>
        </div>
      )}
    </div>
  );
};
\`\`\`

### 五、SSR警告问题与useIsomorphicLayoutEffect

在Next.js等SSR框架中使用useLayoutEffect会触发警告，因为useLayoutEffect在服务器端不存在。解决方案是创建isomorphic版本：

\`\`\`tsx
import { useEffect, useLayoutEffect } from 'react';

// useIsomorphicLayoutEffect
// 在SSR环境使用useEffect（避免警告），在客户端使用useLayoutEffect
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// 使用示例：SSR安全的DOM测量Hook
const useIsomorphicSize = <T extends HTMLElement>(): [
  React.RefObject<T>,
  { width: number; height: number }
] => {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // 使用isomorphic版本，SSR时是useEffect，客户端是useLayoutEffect
  useIsomorphicLayoutEffect(() => {
    const updateSize = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return [ref, size];
};

const SSRSafeDemo = () => {
  const [ref, size] = useIsomorphicSize<HTMLDivElement>();

  return (
    <div style={{ padding: '20px' }}>
      <h2>SSR安全的useLayoutEffect</h2>
      <div
        ref={ref}
        style={{
          padding: '20px',
          background: '#fff3e0',
          border: '2px solid #ff9800',
          borderRadius: '8px',
        }}
      >
        <p>这个组件在Next.js SSR中不会有警告</p>
        <p>尺寸: {Math.round(size.width)} x {Math.round(size.height)}</p>
      </div>
      <div style={{ marginTop: '20px', padding: '15px', background: '#fff8e1' }}>
        <h4>选择指南：</h4>
        <ul>
          <li><strong>90%情况用useEffect</strong>：数据获取、事件订阅、手动修改DOM不涉及布局</li>
          <li><strong>需要DOM测量/同步更新DOM</strong>：用useLayoutEffect</li>
          <li><strong>在SSR/Next.js中使用useLayoutEffect</strong>：用useIsomorphicLayoutEffect封装</li>
        </ul>
      </div>
    </div>
  );
};
\`\`\`

### 本章小结

- **useEffect执行时机**：浏览器绘制完成后异步执行，不阻塞
- **useLayoutEffect执行时机**：DOM变更后、浏览器绘制前同步执行，会阻塞绘制
- **useLayoutEffect适用场景**：
  1. DOM测量（getBoundingClientRect、offsetWidth/offsetHeight等）
  2. 同步修改DOM以避免闪烁
  3. Tooltip/Popover自动定位
  4. 保持滚动位置
- **使用原则**：优先使用useEffect，只有在确实需要同步读取/修改DOM时才用useLayoutEffect
- **SSR注意事项**：useLayoutEffect在服务器端执行会触发警告，需要useIsomorphicLayoutEffect封装
- **性能影响**：useLayoutEffect中不要放耗时操作，否则会阻塞页面渲染导致卡顿
`,
  },
  {
    id: "tsrx-usedeferredvalue",
    icon: "⏳",
    title: "useDeferredValue与useTransition",
    content: `## useDeferredValue与useTransition

React 18引入了并发渲染特性，其中useTransition和useDeferredValue是两个最重要的Hook，用于实现非阻塞更新。它们允许你将某些更新标记为"非紧急"，让React在处理紧急更新（如输入框输入）时保持界面响应。

### 一、useTransition：非阻塞更新

useTransition允许你将状态更新标记为"过渡更新"（transition），这是一种低优先级更新。React会优先处理更紧急的更新（如用户输入），在浏览器空闲时再处理过渡更新。

\`\`\`tsx
import React, { useState, useTransition } from 'react';

// 模拟一个需要大量计算的搜索结果列表
const generateSearchResults = (query: string) => {
  // 模拟大量计算/渲染工作
  const results = [];
  for (let i = 0; i < 10000; i++) {
    results.push({
      id: i,
      text: \`搜索结果 \${i + 1} 关于 "\${query}"\`,
    });
  }
  return results;
};

const SearchDemo = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: number; text: string }>>([]);
  // useTransition返回两个值：
  // isPending：是否正在进行过渡更新
  // startTransition：将状态更新包装为过渡更新的函数
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 紧急更新：输入框立即响应，保证打字流畅
    setQuery(value);

    // 非紧急更新：搜索结果列表的更新被标记为低优先级
    // React会先处理输入框更新，浏览器空闲时再更新列表
    startTransition(() => {
      // 大量计算在这里执行不会阻塞输入
      setResults(generateSearchResults(value));
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>useTransition非阻塞搜索</h2>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="输入搜索内容（试试输入快一点）"
        style={{ padding: '10px', width: '300px', fontSize: '16px' }}
      />
      {isPending && (
        <div style={{ color: '#666', marginTop: '10px' }}>
          ⏳ 正在搜索...
        </div>
      )}
      <div style={{
        marginTop: '10px',
        maxHeight: '400px',
        overflow: 'auto',
        border: '1px solid #ccc',
        opacity: isPending ? 0.5 : 1,
        transition: 'opacity 0.2s',
      }}>
        {query && results.slice(0, 100).map(result => (
          <div key={result.id} style={{
            padding: '8px',
            borderBottom: '1px solid #eee',
          }}>
            {result.text}
          </div>
        ))}
      </div>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        注意：输入框始终流畅，大量搜索结果的更新被延迟处理
      </p>
    </div>
  );
};
\`\`\`

### 二、useDeferredValue：延迟某个值的更新

useDeferredValue用于延迟一个值的更新，让React在紧急更新完成后再更新这个延迟值。它类似于防抖，但由React的调度器自适应控制延迟时间。

\`\`\`tsx
import React, { useState, useDeferredValue, useMemo } from 'react';

// 模拟大列表组件（渲染开销大）
const ExpensiveList = ({ query }: { query: string }) => {
  // 使用useMemo模拟昂贵的过滤计算
  const items = useMemo(() => {
    console.log('过滤列表，query:', query);
    const result = [];
    for (let i = 0; i < 5000; i++) {
      if (String(i).includes(query) || !query) {
        result.push({ id: i, text: \`列表项 #\${i}\` });
      }
    }
    return result;
  }, [query]);

  return (
    <div style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #ccc' }}>
      {items.slice(0, 200).map(item => (
        <div key={item.id} style={{ padding: '4px 8px' }}>
          {item.text}
        </div>
      ))}
      <p style={{ padding: '8px', color: '#666', fontSize: '12px' }}>
        共 {items.length} 项（仅显示前200项）
      </p>
    </div>
  );
};

const DeferredValueDemo = () => {
  const [query, setQuery] = useState('');
  // useDeferredValue返回一个延迟版本的值
  // 当query快速变化时，deferredQuery会"滞后"一点更新
  const deferredQuery = useDeferredValue(query);

  // 检查是否正在延迟中
  const isStale = query !== deferredQuery;

  return (
    <div style={{ padding: '20px' }}>
      <h2>useDeferredValue延迟更新</h2>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="输入数字过滤列表"
        style={{ padding: '10px', width: '300px', fontSize: '16px' }}
      />
      <p style={{ fontSize: '12px', color: '#666' }}>
        实时输入: "{query}" | 延迟值: "{deferredQuery}"
        {isStale && ' (更新中...)'}
      </p>
      {/* 大列表使用延迟值，不会阻塞输入 */}
      <div style={{ opacity: isStale ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        <ExpensiveList query={deferredQuery} />
      </div>
      <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0' }}>
        <h4>useDeferredValue vs 防抖对比：</h4>
        <ul>
          <li><strong>防抖（debounce）</strong>：固定延迟时间（如300ms），停止输入后才更新</li>
          <li><strong>useDeferredValue</strong>：React调度器自适应，设备性能好延迟短，性能差延迟长</li>
          <li><strong>防抖</strong>：用户停止输入后才看到结果，可能有"卡一下"的感觉</li>
          <li><strong>useDeferredValue</strong>：尽可能快地更新结果，同时保持输入流畅</li>
        </ul>
      </div>
    </div>
  );
};
\`\`\`

### 三、Suspense配合useTransition做skeleton loading

\`\`\`tsx
import React, { useState, useTransition, Suspense } from 'react';

// 模拟异步数据加载组件
const fetchUserData = (userId: string): Promise<{ name: string; posts: string[] }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        name: \`用户\${userId}\`,
        posts: Array.from({ length: 5 }, (_, i) => \`用户\${userId}的动态 #\${i + 1}\`),
      });
    }, 1500);
  });
};

// 模拟一个需要Suspense的数据组件
const UserProfile = ({ userId }: { userId: string }) => {
  // 注意：这是演示代码，实际使用中需要配合支持Suspense的数据获取库
  // 如React Query、Relay、或React 18的use API
  const [user, setUser] = useState<{ name: string; posts: string[] } | null>(null);

  React.useEffect(() => {
    let mounted = true;
    fetchUserData(userId).then(data => {
      if (mounted) setUser(data);
    });
    return () => { mounted = false; };
  }, [userId]);

  if (!user) throw new Promise(() => {}); // 触发Suspense

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>{user.name}</h3>
      <ul>
        {user.posts.map((post, i) => (
          <li key={i}>{post}</li>
        ))}
      </ul>
    </div>
  );
};

// 骨架屏组件
const ProfileSkeleton = () => (
  <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
    <div style={{ height: '24px', width: '120px', background: '#e0e0e0', borderRadius: '4px', marginBottom: '15px' }} />
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} style={{
        height: '20px',
        background: '#f0f0f0',
        borderRadius: '4px',
        marginBottom: '8px',
      }} />
    ))}
  </div>
);

const TabContainer = () => {
  const [tab, setTab] = useState('1');
  const [isPending, startTransition] = useTransition();

  const selectTab = (nextTab: string) => {
    // 标签切换使用transition
    // 用户点击标签按钮立即响应（有视觉反馈），内容区域显示skeleton
    startTransition(() => {
      setTab(nextTab);
    });
  };

  const tabs = ['1', '2', '3'];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Suspense + useTransition加载状态</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => selectTab(t)}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              background: tab === t ? '#2196f3' : '#e0e0e0',
              color: tab === t ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              opacity: isPending ? 0.7 : 1,
            }}
          >
            用户{t}
            {isPending && tab === t && '...'}
          </button>
        ))}
      </div>
      {/* 
        Suspense包裹异步组件
        key变化时会fallback到skeleton
        useTransition让标签按钮保持响应
      */}
      <Suspense fallback={<ProfileSkeleton />}>
        <div style={{ opacity: isPending ? 0.5 : 1, transition: 'opacity 0.2s' }}>
          <UserProfile key={tab} userId={tab} />
        </div>
      </Suspense>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        点击不同用户标签，观察：按钮立即响应，内容区平滑加载
      </p>
    </div>
  );
};
\`\`\`

### 本章小结

- **useTransition返回值**：
  - `isPending`：布尔值，表示过渡更新是否正在进行
  - `startTransition(fn)`：将fn中的状态更新标记为低优先级
- **useDeferredValue(value)**：返回value的延迟版本，React会在紧急更新后更新它
- **两者都是React 18并发特性**：不阻塞用户输入，保持界面流畅
- **使用场景**：
  - 大搜索框输入过滤
  - 大列表/表格渲染
  - 标签页切换配合Suspense skeleton
  - 任何UI更新量大但不需要立即反映的场景
- **startTransition与setTimeout区别**：
  - setTimeout是固定延迟后执行
  - startTransition由React调度，高优先级更新（如输入）会中断它
- **防抖vs useDeferredValue**：
  - 防抖：固定延迟，停止输入后才更新
  - useDeferredValue：React自适应调度，尽早更新同时保持流畅
- **使用原则**：紧急更新（输入、点击）直接setState，非紧急更新（搜索结果、列表过滤）用startTransition包裹
`,
  },
  {
    id: "tsrx-useid",
    icon: "🆔",
    title: "useId/useSyncExternalStore/useInsertionEffect",
    content: `## useId/useSyncExternalStore/useInsertionEffect

React 18新增了三个专门的Hook：useId用于生成SSR安全的唯一ID，useSyncExternalStore用于订阅外部数据源，useInsertionEffect主要为CSS-in-JS库设计。

### 一、useId：生成唯一ID（SSR安全）

在React应用中，我们经常需要生成唯一ID用于label htmlFor、aria-describedby等无障碍属性。在SSR（服务端渲染）场景下，普通的自增ID可能导致客户端和服务端生成的ID不一致，引起hydration mismatch。useId可以生成SSR安全的唯一ID。

\`\`\`tsx
import React, { useState, useId } from 'react';

// 表单输入组件：使用useId生成唯一ID
const FormInput = ({
  label,
  type = 'text',
  value,
  onChange,
  describedBy,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  describedBy?: string;
}) => {
  // useId生成唯一ID，SSR安全
  // 同一个组件实例中调用多次useId会生成不同的ID
  const id = useId();
  const helperId = useId();

  return (
    <div style={{ marginBottom: '15px' }}>
      <label
        htmlFor={id}  // 关联input
        style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        aria-describedby={describedBy || helperId}
        style={{
          padding: '8px 12px',
          width: '300px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '14px',
        }}
      />
      {!describedBy && (
        <div id={helperId} style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          请输入{label}
        </div>
      )}
    </div>
  );
};

// 密码强度提示（使用aria-describedby）
const PasswordInput = () => {
  const [password, setPassword] = useState('');
  const id = useId();
  const errorId = useId();
  const isWeak = password.length > 0 && password.length < 8;

  return (
    <div style={{ marginBottom: '15px' }}>
      <label htmlFor={id} style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
        密码
      </label>
      <input
        id={id}
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        aria-invalid={isWeak}
        aria-describedby={isWeak ? errorId : undefined}
        style={{
          padding: '8px 12px',
          width: '300px',
          border: isWeak ? '1px solid red' : '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
      {isWeak && (
        <div id={errorId} style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
          密码至少需要8个字符
        </div>
      )}
    </div>
  );
};

const UseIdDemo = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  return (
    <form style={{ padding: '20px', maxWidth: '400px' }} onSubmit={e => e.preventDefault()}>
      <h2>useId生成唯一ID</h2>
      <p style={{ fontSize: '14px', color: '#666' }}>
        useId生成的ID在SSR和客户端一致，不会有hydration mismatch问题
      </p>
      <FormInput
        label="用户名"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <FormInput
        label="邮箱"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <PasswordInput />
      <button type="submit" style={{
        padding: '10px 20px',
        background: '#2196f3',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      }}>
        注册
      </button>
      <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5' }}>
        <h4>useId使用场景：</h4>
        <ul>
          <li><code>label</code>的<code>htmlFor</code>属性关联input</li>
          <li><code>aria-describedby</code>关联描述文本</li>
          <li><code>aria-labelledby</code>关联标签元素</li>
          <li>任何需要唯一ID的无障碍属性</li>
        </ul>
        <p style={{ fontSize: '12px', color: '#e65100' }}>
          注意：useId生成的ID带":"前缀（如":r0:"），不要在CSS选择器中使用！
        </p>
      </div>
    </form>
  );
};
\`\`\`

### 二、useSyncExternalStore：订阅外部store

useSyncExternalStore是React 18提供的一个用于订阅外部数据源的Hook，它能在并发模式下安全地读取外部状态，避免"撕裂"问题（tearing）。常见用途包括订阅Redux store、window事件、自定义event emitter等。

\`\`\`tsx
import React, { useSyncExternalStore, useCallback, useState } from 'react';

// ============ 1. 订阅window resize事件 ============
const useWindowWidth = () => {
  // useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)
  // subscribe: 注册订阅函数，返回取消订阅函数
  // getSnapshot: 返回当前store的快照
  // getServerSnapshot（可选）: SSR时的初始值
  return useSyncExternalStore(
    // subscribe函数：当store变化时调用callback
    (callback) => {
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    },
    // getSnapshot：获取当前值
    () => window.innerWidth,
    // getServerSnapshot：SSR时返回（window不存在）
    () => 0
  );
};

const useOnlineStatus = () => {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    () => navigator.onLine,
    () => true
  );
};

// ============ 2. 自定义Event Emitter Store ============
// 简单的发布订阅实现
class EventEmitter<T> {
  private listeners = new Set<() => void>();
  private state: T;

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState = () => this.state;

  setState = (newState: T | ((prev: T) => T)) => {
    this.state = newState instanceof Function ? newState(this.state) : newState;
    this.listeners.forEach(listener => listener());
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
}

// 创建全局store
const counterStore = new EventEmitter({ count: 0 });

// 使用useSyncExternalStore订阅store
const useCounterStore = () => {
  const state = useSyncExternalStore(
    counterStore.subscribe,
    counterStore.getState
  );
  return state;
};

// Store操作方法
const increment = () => counterStore.setState(s => ({ count: s.count + 1 }));
const decrement = () => counterStore.setState(s => ({ count: s.count - 1 }));
const reset = () => counterStore.setState({ count: 0 });

// ============ 使用示例 ============
const CounterDisplay = () => {
  const { count } = useCounterStore();
  console.log('CounterDisplay rendered');
  return (
    <div style={{ fontSize: '48px', fontWeight: 'bold', textAlign: 'center', padding: '20px' }}>
      {count}
    </div>
  );
};

const CounterControls = () => {
  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
      <button onClick={decrement} style={buttonStyle}>-1</button>
      <button onClick={reset} style={buttonStyle}>重置</button>
      <button onClick={increment} style={buttonStyle}>+1</button>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 20px',
  fontSize: '16px',
  cursor: 'pointer',
  borderRadius: '4px',
  border: '1px solid #ccc',
  background: '#fff',
};

const ExternalStoreDemo = () => {
  const windowWidth = useWindowWidth();
  const isOnline = useOnlineStatus();
  const [showExtra, setShowExtra] = useState(false);

  return (
    <div style={{ padding: '20px' }}>
      <h2>useSyncExternalStore订阅外部数据源</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Window状态 */}
        <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>浏览器API订阅</h3>
          <p>窗口宽度：<strong>{windowWidth}px</strong></p>
          <p>网络状态：<strong>{isOnline ? '🟢 在线' : '🔴 离线'}</strong></p>
          <p style={{ fontSize: '12px', color: '#666' }}>
            调整窗口大小或断开网络观察变化
          </p>
        </div>

        {/* 全局Store */}
        <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>外部Store订阅</h3>
          <CounterDisplay />
          <CounterControls />
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            即使组件不相关，store变化时订阅者自动更新
          </p>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5' }}>
        <h4>useSyncExternalStore要点：</h4>
        <ul>
          <li><strong>subscribe</strong>函数必须返回取消订阅函数</li>
          <li><strong>getSnapshot</strong>必须返回不可变值（不可直接修改state）</li>
          <li>主要用于Redux/Zustand等外部状态库连接器</li>
          <li>解决React 18并发模式下的"撕裂"(tearing)问题</li>
        </ul>
      </div>
    </div>
  );
};
\`\`\`

### 三、useInsertionEffect：CSS-in-JS库专用

useInsertionEffect在DOM变更之前执行，主要为CSS-in-JS库（如styled-components、Emotion）设计，用于在布局读取前注入`<style>`标签。业务代码几乎不需要使用。

\`\`\`tsx
import { useEffect, useLayoutEffect, useInsertionEffect } from 'react';

// useInsertionEffect执行时机：
// 1. useInsertionEffect（DOM变更前，注入样式）
// 2. useLayoutEffect（DOM变更后，绘制前）
// 3. useEffect（绘制后）

// CSS-in-JS库的简化示例（实际库更复杂）
const useCSS = (css: string) => {
  useInsertionEffect(() => {
    // 在DOM变更前注入style标签
    // 这样useLayoutEffect读取布局时样式已经生效
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [css]);
};

// 业务组件示例（通常不用直接用useInsertionEffect）
const StyledButton = ({ color = 'blue', children }: { color?: string; children: React.ReactNode }) => {
  useCSS(\`
    .custom-btn-\${color} {
      background: \${color};
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  \`);

  return <button className={\`custom-btn-\${color}\`}>{children}</button>;
};

const HookComparison = () => {
  useInsertionEffect(() => {
    console.log('0. useInsertionEffect - 最早执行，DOM变更前');
  }, []);

  useLayoutEffect(() => {
    console.log('1. useLayoutEffect - DOM变更后，绘制前');
  }, []);

  useEffect(() => {
    console.log('2. useEffect - 绘制后异步执行');
  }, []);

  console.log('组件渲染');

  return (
    <div style={{ padding: '20px' }}>
      <h2>三种Effect执行顺序</h2>
      <p>打开控制台观察执行顺序</p>
      <ol>
        <li>组件渲染</li>
        <li><strong>useInsertionEffect</strong>（注入样式）</li>
        <li><strong>useLayoutEffect</strong>（DOM测量）</li>
        <li>浏览器绘制</li>
        <li><strong>useEffect</strong>（副作用）</li>
      </ol>
      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd' }}>
        <p><strong>注意：</strong>useInsertionEffect不能访问refs，也不能触发更新，
        它的存在完全是为了解决CSS-in-JS库的样式注入顺序问题。业务开发应使用useEffect或useLayoutEffect。</p>
      </div>
    </div>
  );
};
\`\`\`

### 本章小结

- **useId**：生成SSR安全的唯一ID，用于label htmlFor和aria-*属性，ID带":"前缀不能用于CSS选择器
- **useSyncExternalStore**：订阅外部数据源（window事件、Redux/Zustand store），三个参数：subscribe/getSnapshot/getServerSnapshot
- **useInsertionEffect**：DOM变更前执行，仅供CSS-in-JS库注入`<style>`标签使用，业务代码不用
- 三个都是React 18新增Hook，useId和useSyncExternalStore在应用开发中有使用场景
`,
  },
  {
    id: "tsrx-hooks-rules",
    icon: "⚠️",
    group: "Hooks篇",
    title: "Hooks规则与原理深入",
    content: `## Hooks规则与原理深入

React Hooks看似简单，但有严格的使用规则。理解这些规则背后的原理，可以帮助我们避免常见的坑（如闭包陷阱、依赖数组错误），写出更健壮的React代码。

### 一、Hook两条铁律

React官方规定了Hook的两条使用规则：

**规则1：只在React函数组件或自定义Hook的顶层调用Hook**
不能在条件语句、循环语句、嵌套函数（非Hook函数）中调用Hook。

**规则2：只在React函数组件或自定义Hook中调用Hook**
不能在普通JavaScript函数中调用Hook。

\`\`\`tsx
import React, { useState, useEffect } from 'react';

// ❌ 错误示例1：在条件语句中调用Hook
const BadConditionalHook = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  // if (isLoggedIn) {
  //   // 错误！不能在if里调用Hook，每次渲染调用顺序可能不同
  //   const [user, setUser] = useState(null);
  // }

  // ✅ 正确：在顶层调用，条件判断放在Hook返回的JSX中
  const [user, setUser] = useState(null);

  return <div>{isLoggedIn ? <p>欢迎{user?.name}</p> : <p>请登录</p>}</div>;
};

// ❌ 错误示例2：在循环中调用Hook
const BadLoopHook = ({ items }: { items: string[] }) => {
  // items.forEach(item => {
  //   // 错误！不能在循环里调用Hook
  //   const [value, setValue] = useState(item);
  // });

  // ✅ 正确：用数组代替单个state
  const [values, setValues] = useState(items);

  return <ul>{values.map((v, i) => <li key={i}>{v}</li>)}</ul>;
};

// ❌ 错误示例3：在普通函数中调用Hook
// function notAComponent() {
//   const [x, setX] = useState(0); // 错误！不是组件也不是自定义Hook
// }

// ✅ 正确：自定义Hook以use开头
function useCustomHook() {
  const [value, setValue] = useState(0); // 正确：自定义Hook
  return [value, setValue] as const;
}

// ✅ 正确：在函数组件顶层调用
const GoodHookUsage = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  );
};
\`\`\`

### 二、为什么有规则？React用链表存储Hook状态

理解Hook的底层实现原理，就能明白为什么必须遵守规则。React在每个组件内部用**链表**存储Hook状态：

\`\`\`tsx
// React内部简化版Hook存储原理（伪代码）
// 每个组件fiber节点上有一个hook链表

interface Hook {
  memoizedState: any;      // 当前状态
  baseState: any;          // 基础状态
  baseQueue: any;          // 更新队列
  queue: any;              // 更新队列
  next: Hook | null;       // 指向下一个Hook
}

// 组件首次渲染时（mount）：
// 1. 按调用顺序创建Hook节点，依次加入链表
// useState(0) → next → useState('') → next → useEffect(...) → null
//    hook1              hook2                hook3

// 组件更新渲染时（update）：
// 1. 从链表头部开始，依次取出hook
// 2. 第1次调用useState() → 取hook1
// 3. 第2次调用useState() → 取hook2
// 4. 第3次调用useEffect() → 取hook3
// 如果调用顺序变了（多了/少了/跳过了），对应关系就错位了！

// 伪代码演示为什么顺序必须一致：
let currentHook: Hook | null = null;
let firstHook: Hook | null = null;

function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };

  if (currentHook === null) {
    firstHook = currentHook = hook;
  } else {
    currentHook = currentHook.next = hook;
  }
  return currentHook;
}

function updateWorkInProgressHook(): Hook {
  // 按顺序取下一个hook
  currentHook = currentHook ? currentHook.next : firstHook;
  if (currentHook === null) {
    throw new Error('Rendered more hooks than during the previous render.');
  }
  return currentHook;
}

// 所以如果条件调用Hook：
// 第一次渲染：useState(A) → useState(B) → useEffect(C)
// 第二次渲染：useState(A) → (if false跳过B) → useEffect(C)
//                             ↑ C对应了B的位置，状态错位！
\`\`\`

### 三、ESLint规则检查

eslint-plugin-react-hooks插件提供了两条规则强制检查Hook规范：

\`\`\`json
// .eslintrc.json 配置
{
  "plugins": ["react-hooks"],
  "rules": {
    // 检查Hook调用规则（顶层调用、函数组件/自定义Hook内调用）
    "react-hooks/rules-of-hooks": "error",
    // 检查依赖数组是否完整
    "react-hooks/exhaustive-deps": "warn"
  }
}
\`\`\`

\`\`\`tsx
import React, { useState, useEffect, useCallback } from 'react';

// ESLint会检查依赖数组
const DependencyCheck = () => {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  // ❌ ESLint警告：useEffect有缺失依赖 'step'
  // useEffect(() => {
  //   const id = setInterval(() => {
  //     setCount(c => c + step); // step被使用但不在依赖中
  //   }, 1000);
  //   return () => clearInterval(id);
  // }, []); // ← ESLint说缺少step

  // ✅ 正确：要么把step加入依赖
  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + step);
    }, 1000);
    return () => clearInterval(id);
  }, [step]); // step在依赖中

  // ✅ 或者使用函数式更新，不依赖step
  // const addStep = useCallback(() => {
  //   setCount(c => c + step);
  // }, [step]);

  return (
    <div>
      <p>Count: {count}</p>
      <input
        type="number"
        value={step}
        onChange={e => setStep(Number(e.target.value))}
      />
    </div>
  );
};
\`\`\`

### 四、经典闭包陷阱与useLatest解法

Hooks中最常见的Bug是**Stale Closure（闭包陈旧）**：回调函数捕获了旧的state/props值。

\`\`\`tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';

// 经典陷阱：setInterval读取旧state
const StaleClosureBug = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // ❌ 问题：setInterval的回调在创建时捕获了当时的count
    // 这个effect只在mount时执行一次，回调里的count永远是0
    const id = setInterval(() => {
      console.log('当前count:', count); // 永远打印0！
      // setCount(count + 1); // 永远从0加到1，不会继续增加
    }, 1000);
    return () => clearInterval(id);
  }, []); // 空依赖，回调只创建一次

  return (
    <div>
      <h2>闭包陷阱演示</h2>
      <p>Count: {count}（这个计数器不会正常工作）</p>
      <button onClick={() => setCount(c => c + 1)}>手动+1</button>
    </div>
  );
};

// ✅ 解法1：使用函数式更新（推荐，最简单）
const FunctionalUpdateFix = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      // 函数式更新不依赖外部count变量
      setCount(prevCount => prevCount + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []); // 空依赖没问题

  return <p>Count: {count}（函数式更新修复）</p>;
};

// ✅ 解法2：useRef保存最新值（通用解法useLatest）
const useLatest = <T>(value: T) => {
  const ref = useRef(value);
  // 每次渲染后更新ref为最新值
  // useEffect是渲染后执行，这里用useLayoutEffect也可以
  useEffect(() => {
    ref.current = value;
  });
  return ref;
};

const UseLatestFix = () => {
  const [count, setCount] = useState(0);
  const countRef = useLatest(count); // 始终指向最新count

  useEffect(() => {
    const id = setInterval(() => {
      // 通过ref.current获取最新值
      console.log('最新count:', countRef.current);
      setCount(c => c + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [countRef]);

  return <p>Count: {count}（useLatest修复）</p>;
};

// ✅ 解法3：useEvent（React 19新增，官方解决方案）
// React 19提供useEvent RFC，专门解决这个问题
// const useEvent = (callback) => {
//   const ref = useLatest(callback);
//   return useCallback((...args) => ref.current(...args), []);
// };
\`\`\`

### 本章小结

- **两条铁律**：Hook必须在顶层调用、只能在函数组件/自定义Hook中调用
- **原理**：React用链表按调用顺序存储Hook状态，顺序错位导致状态对应错乱
- **ESLint插件**：eslint-plugin-react-hooks自动检查规则和依赖数组，务必开启
- **Stale Closure（闭包陈旧）**：回调捕获了旧state，是最常见Hook Bug
- **三种解法**：函数式更新、useRef保存最新值（useLatest）、React 19的useEvent
- **不要撒谎deps**：不要用注释禁用exhaustive-deps，要理解并正确处理依赖
`,
  },
  {
    id: "tsrx-hooks-patterns",
    icon: "🎨",
    group: "Hooks篇",
    title: "React Hooks设计模式",
    content: `## React Hooks设计模式

Hooks不仅仅是useState/useEffect，它们可以组合出强大的设计模式，帮助我们写出更易维护、可复用的React代码。本章介绍几种常用的Hooks设计模式。

### 一、状态提升与状态下放

状态管理的第一个决策：状态应该放在哪里？

**状态提升**：当多个组件需要共享状态时，将状态放到它们最近的共同父组件。
**状态下放**：当某个状态只在一个子组件中使用时，把状态放到那个子组件中，不要放到父组件。

\`\`\`tsx
import React, { useState } from 'react';

// ✅ 状态下放：状态放到使用它的组件里
// 这样其他组件不会因为这个状态变化而重渲染
const PersonalInfo = () => {
  // name只在PersonalInfo中使用，状态放在这里
  const [name, setName] = useState('');
  return <input value={name} onChange={e => setName(e.target.value)} placeholder="姓名" />;
};

// ✅ 状态提升：共享状态放到父组件
interface User {
  name: string;
  age: number;
}

// 父组件管理共享状态
const UserForm = () => {
  // user被多个子组件共享，提升到父组件
  const [user, setUser] = useState<User>({ name: '', age: 0 });

  return (
    <div>
      <NameInput name={user.name} onChange={name => setUser(u => ({ ...u, name }))} />
      <AgeInput age={user.age} onChange={age => setUser(u => ({ ...u, age }))} />
      <UserPreview user={user} />
    </div>
  );
};

const NameInput = ({ name, onChange }: { name: string; onChange: (v: string) => void }) => (
  <input value={name} onChange={e => onChange(e.target.value)} placeholder="姓名" />
);

const AgeInput = ({ age, onChange }: { age: number; onChange: (v: number) => void }) => (
  <input type="number" value={age} onChange={e => onChange(Number(e.target.value))} />
);

const UserPreview = ({ user }: { user: User }) => (
  <div>预览：{user.name}，{user.age}岁</div>
);
\`\`\`

### 二、容器组件与展示组件分离

将逻辑（数据获取、状态管理）和UI展示分离到不同组件：

\`\`\`tsx
import React, { useState, useEffect } from 'react';

// 展示组件：只负责UI渲染，通过props接收数据和回调
// 通常写成无状态组件，可复用性强
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoListViewProps {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  onToggle: (id: number) => void;
  onAdd: (text: string) => void;
}

// 展示组件：纯UI
const TodoListView = ({ todos, isLoading, error, onToggle, onAdd }: TodoListViewProps) => {
  const [text, setText] = useState('');

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div>
        <input value={text} onChange={e => setText(e.target.value)} />
        <button onClick={() => { onAdd(text); setText(''); }}>添加</button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} onClick={() => onToggle(todo.id)} style={{
            textDecoration: todo.completed ? 'line-through' : 'none',
            cursor: 'pointer',
          }}>
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

// 容器组件：负责数据获取和状态管理
const TodoListContainer = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/todos?_limit=10')
      .then(res => res.json())
      .then(data => { setTodos(data); setIsLoading(false); })
      .catch(err => { setError(err.message); setIsLoading(false); });
  }, []);

  const handleToggle = (id: number) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAdd = (text: string) => {
    setTodos(prev => [...prev, { id: Date.now(), text, completed: false }]);
  };

  return (
    <TodoListView
      todos={todos}
      isLoading={isLoading}
      error={error}
      onToggle={handleToggle}
      onAdd={handleAdd}
    />
  );
};
\`\`\`

### 三、Compound Component复合组件

复合组件模式通过Context共享隐式状态，让多个子组件协同工作，使用方式类似HTML的`<select>`和`<option>`：

\`\`\`tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ============ Tabs复合组件完整实现 ============
interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

const useTabsContext = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>');
  return ctx;
};

// Tabs根组件
interface TabsProps {
  defaultTab?: string;
  children: ReactNode;
  activeTab?: string;
  onChange?: (tabId: string) => void;
}

const Tabs = ({ defaultTab, activeTab: controlledTab, onChange, children }: TabsProps) => {
  const [internalTab, setInternalTab] = useState(defaultTab || '');
  // 支持受控和非受控两种模式
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;

  const setActiveTab = useCallback((id: string) => {
    if (controlledTab === undefined) {
      setInternalTab(id);
    }
    onChange?.(id);
  }, [controlledTab, onChange]);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div style={{ fontFamily: 'system-ui' }}>{children}</div>
    </TabsContext.Provider>
  );
};

// TabList：标签按钮容器
interface TabListProps {
  children: ReactNode;
}

const TabList = ({ children }: TabListProps) => {
  return (
    <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', gap: '4px' }}>
      {children}
    </div>
  );
};

// Tab：单个标签按钮
interface TabProps {
  tabId: string;
  children: ReactNode;
}

const Tab = ({ tabId, children }: TabProps) => {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === tabId;

  return (
    <button
      onClick={() => setActiveTab(tabId)}
      style={{
        padding: '10px 20px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: isActive ? 600 : 400,
        color: isActive ? '#2563eb' : '#6b7280',
        borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
        marginBottom: '-2px',
        transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  );
};

// TabPanels：面板容器
interface TabPanelsProps {
  children: ReactNode;
}

const TabPanels = ({ children }: TabPanelsProps) => {
  return <div style={{ padding: '20px 0' }}>{children}</div>;
};

// TabPanel：单个面板内容
interface TabPanelProps {
  tabId: string;
  children: ReactNode;
}

const TabPanel = ({ tabId, children }: TabPanelProps) => {
  const { activeTab } = useTabsContext();
  if (activeTab !== tabId) return null;
  return <div>{children}</div>;
};

// 挂载子组件
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

// ============ 使用示例 ============
const TabsDemo = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>复合组件：Tabs</h2>
      <Tabs defaultTab="overview">
        <Tabs.List>
          <Tabs.Tab tabId="overview">概览</Tabs.Tab>
          <Tabs.Tab tabId="features">功能</Tabs.Tab>
          <Tabs.Tab tabId="settings">设置</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panels>
          <Tabs.Panel tabId="overview">
            <h3>概览页面</h3>
            <p>这是概览面板的内容。通过复合组件模式，我们可以像写HTML一样使用Tabs：</p>
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
{`<Tabs>
  <Tabs.List>
    <Tabs.Tab tabId="a">标签A</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panels>
    <Tabs.Panel tabId="a">内容A</Tabs.Panel>
  </Tabs.Panels>
</Tabs>`}
            </pre>
          </Tabs.Panel>
          <Tabs.Panel tabId="features">
            <h3>功能页面</h3>
            <ul>
              <li>✅ 支持受控/非受控模式</li>
              <li>✅ 通过Context隐式传递状态</li>
              <li>✅ 使用API类似原生HTML</li>
              <li>✅ 完全可定制样式</li>
            </ul>
          </Tabs.Panel>
          <Tabs.Panel tabId="settings">
            <h3>设置页面</h3>
            <p>在这里配置应用设置。</p>
          </Tabs.Panel>
        </Tabs.Panels>
      </Tabs>
    </div>
  );
};
\`\`\`

### 四、Prop Getters模式

Prop Getters模式返回函数（getXxxProps），让调用方将内部props与自定义props合并：

\`\`\`tsx
import React, { useState, useCallback, ReactNode } from 'react';

// Prop Getters模式示例：可复用的点击展开Hook
interface UseToggleReturn {
  isOn: boolean;
  toggle: () => void;
  getTogglerProps: (props?: Record<string, any>) => Record<string, any>;
}

const useToggle = (initial = false): UseToggleReturn => {
  const [isOn, setIsOn] = useState(initial);
  const toggle = useCallback(() => setIsOn(v => !v), []);

  // getTogglerProps合并内部props和用户传入的props
  const getTogglerProps = useCallback((props: Record<string, any> = {}) => {
    return {
      'aria-pressed': isOn,
      onClick: (e: React.MouseEvent) => {
        // 先执行用户的onClick
        props.onClick?.(e);
        // 如果用户没有阻止默认行为，再执行toggle
        if (!e.defaultPrevented) {
          toggle();
        }
      },
      ...props,
    };
  }, [isOn, toggle]);

  return { isOn, toggle, getTogglerProps };
};

// 使用示例
const PropGettersDemo = () => {
  const { isOn, getTogglerProps } = useToggle(false);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Prop Getters模式</h2>
      <p>开关状态: {isOn ? '开' : '关'}</p>
      
      {/* 简单使用 */}
      <button {...getTogglerProps()}>切换</button>
      
      {/* 传递自定义props，内部props自动合并 */}
      <button
        {...getTogglerProps({
          id: 'my-btn',
          style: { marginLeft: '10px', padding: '10px' },
          onClick: () => console.log('自定义onClick也会执行'),
        })}
      >
        带自定义props的切换
      </button>
    </div>
  );
};
\`\`\`

### 五、State Reducer模式与Control Props受控模式

State Reducer允许调用方覆写组件的reducer行为；Control Props让组件完全受控（类似input的value/onChange）：

\`\`\`tsx
import React, { useState, useReducer, useCallback } from 'react';

// State Reducer模式：允许外部修改状态更新逻辑
type ToggleAction =
  | { type: 'toggle' }
  | { type: 'reset' };

interface UseToggleStateReducerOptions {
  initialState?: boolean;
  // 调用方可以传入自定义reducer覆写默认行为
  stateReducer?: (state: boolean, action: ToggleAction) => boolean;
}

const defaultToggleReducer = (state: boolean, action: ToggleAction): boolean => {
  switch (action.type) {
    case 'toggle': return !state;
    case 'reset': return false;
    default: return state;
  }
};

const useToggleAdvanced = ({
  initialState = false,
  stateReducer = defaultToggleReducer,
}: UseToggleStateReducerOptions = {}) => {
  const [state, dispatch] = useReducer(
    // 内部用自定义reducer包裹，调用方可以修改行为
    (prevState: boolean, action: ToggleAction) => {
      // 先让stateReducer决定新状态
      const changes = stateReducer(prevState, action);
      return changes;
    },
    initialState
  );

  const toggle = useCallback(() => dispatch({ type: 'toggle' }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  return { isOn: state, toggle, reset };
};

// 控制props模式示例：完全由父组件控制
interface ControlledCounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const ControlledCounter = ({ value, onChange, min = 0, max = 100 }: ControlledCounterProps) => {
  // 组件本身不持有state，完全由props控制
  return (
    <div>
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>-</button>
      <span style={{ padding: '0 20px' }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</button>
    </div>
  );
};

// 使用示例
const AdvancedPatternsDemo = () => {
  // State Reducer使用：限制只能点击3次
  const [clicks, setClicks] = useState(0);
  const { isOn: limitedToggle, toggle } = useToggleAdvanced({
    stateReducer: (state, action) => {
      if (action.type === 'toggle' && clicks >= 3 && !state) {
        alert('最多只能开启3次！');
        return state; // 阻止开启
      }
      return defaultToggleReducer(state, action);
    },
  });

  // Control Props使用
  const [counterValue, setCounterValue] = useState(0);

  return (
    <div style={{ padding: '20px' }}>
      <h2>State Reducer & Control Props</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
        <h3>State Reducer：限制点击次数</h3>
        <p>状态: {limitedToggle ? '开' : '关'}</p>
        <button onClick={() => { toggle(); setClicks(c => limitedToggle ? c : c + 1); }}>
          切换（点击次数: {clicks}/3）
        </button>
        <p style={{ fontSize: '12px', color: '#666' }}>
          State Reducer允许调用方自定义状态更新逻辑，类似downshift库
        </p>
      </div>

      <div style={{ padding: '15px', border: '1px solid #ccc' }}>
        <h3>Control Props：完全受控组件</h3>
        <ControlledCounter value={counterValue} onChange={setCounterValue} min={0} max={10} />
        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          类似input value/onChange，组件状态完全由父组件控制
        </p>
      </div>
    </div>
  );
};
\`\`\`

### 本章小结

- **状态提升/下放**：共享状态提升到最近共同父组件；只在一个子组件用的状态下放到该子组件
- **容器/展示分离**：容器组件管数据逻辑，展示组件管UI渲染，职责清晰易测试
- **复合组件**：通过Context隐式共享状态，使用API类似HTML原生元素（如Tabs）
- **Prop Getters**：返回getXxxProps函数合并内部和用户props，灵活复用
- **State Reducer**：允许调用方传入reducer覆写组件行为，极致灵活（如downshift）
- **Control Props**：组件完全受控（value+onChange），类似原生input，父组件完全控制状态
`,
  },
];