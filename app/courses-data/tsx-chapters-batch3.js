export const chapters = [
  {
    id: "tsx-custom-hook",
    group: "进阶篇",
    icon: "🔧",
    title: "自定义 Hook 类型",
    content: `# 自定义 Hook 类型

自定义 Hook 是 React 逻辑复用的核心。TypeScript 下写自定义 Hook 非常自然，主要是标注参数和返回值类型。

---

## 基础：返回单个值

\`\`\`tsx
import { useState, useEffect } from "react";

// 自定义 Hook：获取窗口大小
function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;  // 返回 { width: number; height: number }
}

// 使用时自动推断
function App() {
  const { width, height } = useWindowSize();
  return <div>窗口大小：{width} × {height}</div>;
}
\`\`\`

---

## 返回多个值（元组）

很多 Hook 返回 \`[value, setValue, ...]\` 的元组形式，需要用 \`as const\` 让 TypeScript 正确推断：

\`\`\`tsx
import { useState, useCallback } from "react";

// 简单的 toggle Hook
function useToggle(initialValue = false): [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  const set = useCallback((v: boolean) => {
    setValue(v);
  }, []);

  // 返回元组，用 as const 让 TS 识别为元组而非数组
  return [value, toggle, set] as const;
}

// 使用
function Modal() {
  const [isOpen, toggleOpen, setOpen] = useToggle(false);

  return (
    <>
      <button onClick={toggleOpen}>切换</button>
      <button onClick={() => setOpen(true)}>打开</button>
      <button onClick={() => setOpen(false)}>关闭</button>
      {isOpen && <div>弹窗内容</div>}
    </>
  );
}
\`\`\`

---

## 泛型自定义 Hook

Hook 也可以是泛型的，最常见的例子是 \`useLocalStorage\`：

\`\`\`tsx
import { useState, useEffect } from "react";

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // 从 localStorage 读取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // 设置值时同时写入 localStorage
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

// 使用 - 类型自动推断
function Settings() {
  // name 自动为 string
  const [name, setName] = useLocalStorage("name", "");

  // theme 自动为 "light" | "dark"
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");

  // settings 自动为对象类型
  const [settings, setSettings] = useLocalStorage("settings", {
    notifications: true,
    language: "zh"
  });

  return (
    <div>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        切换主题（当前：{theme}）
      </button>
    </div>
  );
}
\`\`\`

---

## 异步数据请求 Hook（useFetch 模式）

最实用的自定义 Hook 之一：封装数据请求逻辑。

\`\`\`tsx
import { useState, useEffect, useCallback } from "react";

// 请求状态类型
type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

function useFetch<T>(url: string): FetchState<T> & { refetch: () => void } {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null
  });

  const fetchData = useCallback(() => {
    setState(s => ({ ...s, loading: true, error: null }));

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return res.json() as Promise<T>;
      })
      .then(data => setState({ data, loading: false, error: null }))
      .catch(error => setState({ data: null, loading: false, error }));
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

// 使用时指定数据类型
type User = {
  id: number;
  name: string;
  email: string;
};

function UserProfile({ userId }: { userId: number }) {
  const { data, loading, error, refetch } = useFetch<User>(
    \`https://jsonplaceholder.typicode.com/users/\${userId}\`
  );

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误：{error.message}</div>;
  if (!data) return null;

  return (
    <div>
      <h3>{data.name}</h3>
      <p>{data.email}</p>
      <button onClick={refetch}>重新加载</button>
    </div>
  );
}
\`\`\`

---

## 本章小结

✅ 自定义 Hook 的返回值类型由 TypeScript 自动推断
✅ 返回元组时加 \`as const\` 避免被推断为联合类型数组
✅ 泛型 Hook 加 \`<T>\` 可以让调用方传入类型，如 \`useLocalStorage<T>\`
✅ 异步 Hook 封装 loading/error/data 状态，类型安全
✅ Hook 的参数类型标注和普通函数一样

下一章讲 Context！`,
    code: `import React, { useState, useEffect, useCallback, useMemo } from "react";

// ==============================
// 1. useToggle
// ==============================
function useToggle(initialValue = false): readonly [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  const set = useCallback((v: boolean) => setValue(v), []);
  return [value, toggle, set] as const;
}

// ==============================
// 2. useLocalStorage（泛型）
// ==============================
function useLocalStorage<T>(key: string, initialValue: T): readonly [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

// ==============================
// 3. useDebounce（防抖）
// ==============================
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ==============================
// 演示组件
// ==============================
export default function CustomHookDemo() {
  // useToggle
  const [showPanel, togglePanel] = useToggle(true);
  const [darkMode, , setDarkMode] = useToggle(false);

  // useLocalStorage
  const [name, setName] = useLocalStorage("demo-name", "访客");
  const [count, setCount] = useLocalStorage("demo-count", 0);

  // useDebounce 搜索
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 500);

  const fruits = useMemo(() => ["苹果", "香蕉", "橙子", "葡萄", "草莓", "西瓜", "芒果"], []);
  const searchResults = useMemo(() => {
    if (!debouncedSearch) return fruits;
    return fruits.filter(f => f.includes(debouncedSearch));
  }, [debouncedSearch, fruits]);

  return (
    <div style={{
      maxWidth: 500, margin: "40px auto", padding: 20,
      background: darkMode ? "#1f2937" : "white",
      color: darkMode ? "#f3f4f6" : "#111827",
      borderRadius: 12, transition: "all 0.3s"
    }}>
      <h2 style={{ marginBottom: 16 }}>🔧 自定义 Hook 类型</h2>

      {/* useToggle */}
      <div style={{ marginBottom: 20, padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}>
        <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#6b7280" }}>1. useToggle</h4>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button onClick={togglePanel} style={{ padding: "6px 12px" }}>
            {showPanel ? "隐藏" : "显示"}面板
          </button>
          <button onClick={() => setDarkMode(!darkMode)} style={{ padding: "6px 12px" }}>
            {darkMode ? "☀️ 浅色" : "🌙 深色"}
          </button>
        </div>
        {showPanel && (
          <div style={{ padding: 10, background: darkMode ? "#374151" : "#f9fafb", borderRadius: 6, fontSize: 14 }}>
            这是一个可以切换显示/隐藏的面板
          </div>
        )}
      </div>

      {/* useLocalStorage */}
      <div style={{ marginBottom: 20, padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}>
        <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#6b7280" }}>2. useLocalStorage（刷新页面数据仍在）</h4>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="输入你的名字"
            style={{ flex: 1, padding: 8 }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setCount(c => c - 1)} style={{ padding: "6px 12px" }}>-</button>
          <span style={{ minWidth: 40, textAlign: "center" }}>{count}</span>
          <button onClick={() => setCount(c => c + 1)} style={{ padding: "6px 12px" }}>+</button>
          <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 8 }}>计数持久化</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 13 }}>
          你好，<strong>{name}</strong>！
        </div>
      </div>

      {/* useDebounce */}
      <div style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}>
        <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#6b7280" }}>3. useDebounce（防抖搜索）</h4>
        <input
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="搜索水果..."
          style={{ width: "100%", padding: 8, boxSizing: "border-box", marginBottom: 10 }}
        />
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>
          防抖值（延迟500ms更新）：{debouncedSearch || "（空）"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {searchResults.map(f => (
            <span key={f} style={{
              padding: "3px 10px", background: darkMode ? "#3b82f6" : "#dbeafe",
              color: darkMode ? "white" : "#1d4ed8", borderRadius: 12, fontSize: 12
            }}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
`,
  },

  {
    id: "tsx-context",
    group: "进阶篇",
    icon: "🌐",
    title: "Context 类型",
    content: `# Context 类型

React Context 用于跨组件共享状态。TypeScript 下需要给 createContext 传入正确的类型。

---

## 基础用法

\`\`\`tsx
import { createContext, useContext, useState, ReactNode } from "react";

// 1. 定义 Context 的类型
type ThemeContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
};

// 2. 创建 Context（初始值可以是 undefined，但我们后面会处理）
const ThemeContext = createContext<ThemeContextType | null>(null);

// 3. 创建 Provider 组件
type ThemeProviderProps = {
  children: ReactNode;
};

function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    setTheme(t => (t === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 4. 创建自定义 Hook（封装 useContext，不用每次都判空）
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// 5. 在子组件中使用
function ThemedButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      style={{
        background: theme === "dark" ? "#333" : "#fff",
        color: theme === "dark" ? "#fff" : "#333"
      }}
    >
      当前主题：{theme}
    </button>
  );
}

// 6. 在根组件包裹 Provider
function App() {
  return (
    <ThemeProvider>
      <ThemedButton />
    </ThemeProvider>
  );
}
\`\`\`

---

## 完整的用户认证 Context 示例

这是实际项目中最常用的模式：

\`\`\`tsx
import { createContext, useContext, useState, ReactNode } from "react";

// 用户类型
type User = {
  id: number;
  name: string;
  email: string;
  avatar?: string;
};

// Context 类型
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = { children: ReactNode };

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // 模拟 API 调用
    const response = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    const userData = await response.json() as User;
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 自定义 Hook
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

// 使用
function NavBar() {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>欢迎，{user!.name}</span>  {/* user 不为 null，因为 isAuthenticated */}
          <button onClick={logout}>退出</button>
        </>
      ) : (
        <Link to="/login">登录</Link>
      )}
    </nav>
  );
}
\`\`\`

---

## 避免 null 检查的技巧

如果你不想每次都判 null，可以给 Context 一个默认值：

\`\`\`tsx
// 方式一：给一个默认对象（但 toggleTheme 是无意义的空函数）
const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {}  // 空函数作为默认值
});

// 这样 useContext 就不用判 null 了
function useTheme() {
  return useContext(ThemeContext);
}
\`\`\`

但这种方式有个缺点：如果忘记包裹 Provider，不会报错，而是使用默认值。

**推荐方式**：用 null 初始值 + 自定义 Hook 抛错误，这样开发时能及时发现问题。

---

## 本章小结

✅ \`createContext<Type | null>(null)\` 创建 Context
✅ 自定义 Hook 封装 \`useContext\`，加 null 检查并抛错
✅ Provider 的 props 类型：\`{ children: ReactNode }\`
✅ Context 的 value 可以包含状态、函数、计算属性
✅ \`Partial<User>\` 用于更新部分字段

下一章是最后一章：综合实战！`,
    code: `import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ==============================
// 1. Theme Context
// ==============================
type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  colors: { bg: string; card: string; text: string; border: string };
};

const ThemeContext = createContext<ThemeContextType | null>(null);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  const toggleTheme = useCallback(() => {
    setThemeState(t => (t === "light" ? "dark" : "light"));
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
  }, []);

  const colors = theme === "light"
    ? { bg: "#ffffff", card: "#f9fafb", text: "#111827", border: "#e5e7eb" }
    : { bg: "#111827", card: "#1f2937", text: "#f3f4f6", border: "#374151" };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

// ==============================
// 2. Counter Context（简单示例）
// ==============================
type CounterContextType = {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
};

const CounterContext = createContext<CounterContextType | null>(null);

function CounterProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(0), []);

  return (
    <CounterContext.Provider value={{ count, increment, decrement, reset }}>
      {children}
    </CounterContext.Provider>
  );
}

function useCounter() {
  const ctx = useContext(CounterContext);
  if (!ctx) throw new Error("useCounter must be used within CounterProvider");
  return ctx;
}

// ==============================
// 消费组件
// ==============================
function ThemeSwitcher() {
  const { theme, toggleTheme, colors } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: "8px 16px",
        border: \`1px solid \${colors.border}\`,
        borderRadius: 6,
        background: colors.card,
        color: colors.text,
        cursor: "pointer",
        fontSize: 14
      }}
    >
      {theme === "light" ? "🌙 切换到深色" : "☀️ 切换到浅色"}
    </button>
  );
}

function CounterDisplay() {
  const { count } = useCounter();
  const { colors } = useTheme();
  return (
    <div style={{
      fontSize: 48, fontWeight: "bold", textAlign: "center",
      color: colors.text, padding: "20px 0"
    }}>
      {count}
    </div>
  );
}

function CounterControls() {
  const { increment, decrement, reset } = useCounter();
  const { colors } = useTheme();

  const btnStyle: React.CSSProperties = {
    padding: "10px 20px", fontSize: 18, border: "none", borderRadius: 6,
    background: "#3b82f6", color: "white", cursor: "pointer"
  };

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      <button onClick={decrement} style={btnStyle}>−</button>
      <button onClick={reset} style={{ ...btnStyle, background: colors.border, color: colors.text }}>
        重置
      </button>
      <button onClick={increment} style={btnStyle}>+</button>
    </div>
  );
}

// ==============================
// 主演示组件
// ==============================
function ContextDemoContent() {
  const { colors } = useTheme();

  return (
    <div style={{
      minHeight: 400,
      background: colors.bg,
      color: colors.text,
      padding: 24,
      borderRadius: 12,
      transition: "all 0.3s"
    }}>
      <h2 style={{ margin: "0 0 16px", textAlign: "center" }}>🌐 Context 类型</h2>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <ThemeSwitcher />
      </div>

      <CounterProvider>
        <div style={{
          background: colors.card,
          border: \`1px solid \${colors.border}\`,
          borderRadius: 8,
          padding: 20,
          maxWidth: 300,
          margin: "0 auto"
        }}>
          <div style={{ textAlign: "center", fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
            Counter Context 示例
          </div>
          <CounterDisplay />
          <CounterControls />
        </div>
      </CounterProvider>

      <div style={{
        marginTop: 20, textAlign: "center",
        fontSize: 12, color: "#9ca3af"
      }}>
        主题和计数器分别由两个独立的 Context 管理
      </div>
    </div>
  );
}

export default function ContextDemo() {
  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <ThemeProvider>
        <ContextDemoContent />
      </ThemeProvider>
    </div>
  );
}
`,
  },

  {
    id: "tsx-fetch-api",
    group: "实战篇",
    icon: "🚀",
    title: "API 数据类型 + 综合实战",
    content: `# API 数据类型 + 综合实战

最后一章，我们把前面学的内容组合起来，做一个完整的「用户列表」小应用，覆盖真实开发中最常见的场景。

---

## 第一步：定义 API 数据类型

这是前后端协作中最重要的一步——先定义数据的形状：

\`\`\`tsx
// 来自后端的用户数据
type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: {
    city: string;
    street: string;
  };
  company: {
    name: string;
  };
};

// 通用 API 响应格式（如果后端有统一包装）
type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

// 列表查询参数
type QueryParams = {
  page?: number;
  pageSize?: number;
  keyword?: string;
};
\`\`\`

---

## 第二步：封装 API 请求函数

\`\`\`tsx
// API 基础封装
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!response.ok) {
    throw new Error(\`请求失败: \${response.status}\`);
  }
  return response.json();
}

// 用户相关 API
const userApi = {
  // 获取用户列表
  getList: () => request<User[]>("https://jsonplaceholder.typicode.com/users"),

  // 获取单个用户
  getById: (id: number) => request<User>(\`https://jsonplaceholder.typicode.com/users/\${id}\`)
};
\`\`\`

---

## 第三步：写自定义 Hook 封装数据请求

\`\`\`tsx
import { useState, useEffect } from "react";

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

function useAsync<T>(asyncFn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    setState({ data: null, loading: true, error: null });

    asyncFn()
      .then(data => {
        if (mounted) setState({ data, loading: false, error: null });
      })
      .catch(err => {
        if (mounted) setState({ data: null, loading: false, error: err.message });
      });

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
\`\`\`

---

## 第四步：组件中使用

\`\`\`tsx
// 用户卡片组件
type UserCardProps = {
  user: User;
  onClick?: () => void;
};

function UserCard({ user, onClick }: UserCardProps) {
  return (
    <div onClick={onClick} className="user-card">
      <img
        src={\`https://api.dicebear.com/7.x/initials/svg?seed=\${user.name}\`}
        alt={user.name}
      />
      <div>
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <p>{user.company.name}</p>
      </div>
    </div>
  );
}

// 用户列表页面
function UserListPage() {
  const { data: users, loading, error } = useAsync(() => userApi.getList(), []);
  const [keyword, setKeyword] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 过滤用户
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!keyword) return users;
    const lower = keyword.toLowerCase();
    return users.filter(u =>
      u.name.toLowerCase().includes(lower) ||
      u.email.toLowerCase().includes(lower)
    );
  }, [users, keyword]);

  if (loading) return <div className="loading">加载中...</div>;
  if (error) return <div className="error">错误：{error}</div>;

  return (
    <div>
      <input
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        placeholder="搜索用户..."
      />
      <div className="user-list">
        {filteredUsers.map(user => (
          <UserCard
            key={user.id}
            user={user}
            onClick={() => setSelectedUser(user)}
          />
        ))}
      </div>
      {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}
\`\`\`

---

## 关键类型工具：常用类型操作符

在 React 开发中，这些 TypeScript 工具类型非常实用：

| 类型 | 说明 | 示例 |
|------|------|------|
| \`Partial<T>\` | 所有属性变为可选 | \`Partial<User>\` → 所有字段可选 |
| \`Required<T>\` | 所有属性变为必选 | \`Required<Props>\` |
| \`Pick<T, K>\` | 选取部分属性 | \`Pick<User, "id" \\| "name">\` |
| \`Omit<T, K>\` | 排除部分属性 | \`Omit<User, "address" \\| "company">\` |
| \`Record<K, V>\` | 键值对对象 | \`Record<string, User>\` |
| \`Awaited<T>\` | 解包 Promise 返回值类型 | \`Awaited<ReturnType<typeof fetchUser>>\` |
| \`React.ComponentProps<typeof Component>\` | 获取组件 Props 类型 | \`ComponentProps<typeof Button>\` |

---

## React.FC 还需要用吗？

早期教程常看到 \`const App: React.FC = () => {}\`，现在**不推荐**了：

\`\`\`tsx
// ❌ 不推荐 React.FC
const App: React.FC<{ title: string }> = ({ title }) => {
  return <div>{title}</div>;
};

// ✅ 推荐：直接给 props 标注类型
function App({ title }: { title: string }) {
  return <div>{title}</div>;
}

// ✅ 箭头函数也一样
const App = ({ title }: { title: string }) => {
  return <div>{title}</div>;
};
\`\`\`

React.FC 的问题：
1. 隐式包含 \`children\` 类型，但很多组件不需要 children
2. 不支持泛型组件
3. 让 defaultProps 类型推断变差

**简单原则**：直接写 \`function Component(props: PropsType)\` 就好。

---

## 本章小结（也是整个教程总结）

✅ **Props**：用 \`type\` 定义，可选加 \`?\`，默认值用解构默认值
✅ **children**：用 \`React.ReactNode\`
✅ **useState**：初始值自动推断，空数组/联合类型需手动标注泛型
✅ **useRef**：DOM 引用标注元素类型，如 \`useRef<HTMLInputElement>(null)\`
✅ **事件**：内联函数自动推断，提取函数标注 \`ChangeEvent\`, \`MouseEvent\` 等
✅ **自定义 Hook**：泛型 + as const 返回元组
✅ **Context**：\`createContext<Type | null>(null)\` + 自定义 Hook 抛错
✅ **API**：先定义数据类型，封装 request 泛型函数
✅ **避免 React.FC**，直接给 props 加类型标注

坚持以上模式，你的 React + TypeScript 代码就足够类型安全且实用了！`,
    code: `import React, { useState, useEffect, useMemo, useCallback, type ReactNode, type ChangeEvent } from "react";

// ==============================
// 类型定义
// ==============================
type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: { city: string; street: string };
  company: { name: string };
};

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

// ==============================
// 工具 Hook
// ==============================
function useAsync<T>(asyncFn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null, loading: true, error: null
  });

  useEffect(() => {
    let mounted = true;
    setState({ data: null, loading: true, error: null });

    asyncFn()
      .then(data => { if (mounted) setState({ data, loading: false, error: null }); })
      .catch(err => { if (mounted) setState({ data: null, loading: false, error: err.message }); });

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

// ==============================
// API 封装
// ==============================
async function fetchUsers(): Promise<User[]> {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}

// ==============================
// UI 组件
// ==============================
function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <div style={{
        width: 36, height: 36, border: "3px solid #e5e7eb",
        borderTopColor: "#3b82f6", borderRadius: "50%",
        animation: "spin 0.8s linear infinite", margin: "0 auto"
      }} />
      <style>{@keyframes spin { to { transform: rotate(360deg); } }}</style>
      <div style={{ marginTop: 12, color: "#6b7280", fontSize: 14 }}>加载中...</div>
    </div>
  );
}

function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>😕</div>
      <div style={{ color: "#ef4444", marginBottom: 12 }}>{message}</div>
      {onRetry && (
        <button onClick={onRetry} style={{ padding: "6px 16px", cursor: "pointer" }}>
          重试
        </button>
      )}
    </div>
  );
}

function UserCard({ user, onClick, active }: { user: User; onClick?: () => void; active?: boolean }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", gap: 12, padding: 12, cursor: "pointer",
        border: "1px solid", borderColor: active ? "#3b82f6" : "#e5e7eb",
        borderRadius: 8, background: active ? "#eff6ff" : "white",
        transition: "all 0.15s"
      }}
    >
      <img
        src={\`https://api.dicebear.com/7.x/initials/svg?seed=\${user.name}&backgroundColor=3b82f6\`}
        alt={user.name}
        style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
        <div style={{ fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          📧 {user.email}
        </div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          🏢 {user.company.name}
        </div>
      </div>
    </div>
  );
}

function UserDetail({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "white", borderRadius: 12, padding: 24,
          width: "90%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
          <img
            src={\`https://api.dicebear.com/7.x/initials/svg?seed=\${user.name}&backgroundColor=3b82f6\`}
            alt={user.name}
            style={{ width: 56, height: 56, borderRadius: "50%" }}
          />
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>{user.name}</h3>
            <div style={{ fontSize: 13, color: "#6b7280" }}>@{user.username}</div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: "#9ca3af" }}>×</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
          <div>📧 <a href={\`mailto:\${user.email}\`} style={{ color: "#3b82f6" }}>{user.email}</a></div>
          <div>📞 {user.phone}</div>
          <div>🌐 <a href={\`https://\${user.website}\`} target="_blank" rel="noreferrer" style={{ color: "#3b82f6" }}>{user.website}</a></div>
          <div>📍 {user.address.city}, {user.address.street}</div>
          <div>🏢 {user.company.name}</div>
        </div>
      </div>
    </div>
  );
}

// ==============================
// 主页面
// ==============================
export default function ApiDemo() {
  const [reloadKey, setReloadKey] = useState(0);
  const { data: users, loading, error } = useAsync(fetchUsers, [reloadKey]);

  const [keyword, setKeyword] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  }, []);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!keyword.trim()) return users;
    const kw = keyword.toLowerCase();
    return users.filter(u =>
      u.name.toLowerCase().includes(kw) ||
      u.email.toLowerCase().includes(kw) ||
      u.company.name.toLowerCase().includes(kw)
    );
  }, [users, keyword]);

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>🚀 综合实战 - 用户列表</h2>
        <button
          onClick={() => setReloadKey(k => k + 1)}
          style={{ padding: "6px 12px", fontSize: 13, cursor: "pointer" }}
        >
          🔄 刷新
        </button>
      </div>

      <input
        value={keyword}
        onChange={handleSearchChange}
        placeholder="🔍 搜索姓名、邮箱、公司..."
        style={{
          width: "100%", padding: "10px 12px", boxSizing: "border-box",
          border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, marginBottom: 16
        }}
      />

      {loading && <Spinner />}

      {error && <ErrorMessage message={error} onRetry={() => setReloadKey(k => k + 1)} />}

      {users && (
        <>
          <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>
            共 {filteredUsers.length} 个用户{keyword && \`（搜索"\${keyword}"）\`}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredUsers.length === 0 ? (
              <div style={{ textAlign: "center", padding: 30, color: "#9ca3af" }}>
                🔍 没有找到匹配的用户
              </div>
            ) : filteredUsers.map(user => (
              <UserCard
                key={user.id}
                user={user}
                active={selectedUser?.id === user.id}
                onClick={() => setSelectedUser(user)}
              />
            ))}
          </div>
        </>
      )}

      {selectedUser && (
        <UserDetail user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
`,
  },
];
