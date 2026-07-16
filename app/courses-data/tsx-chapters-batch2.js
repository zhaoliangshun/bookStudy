export const chapters = [
  {
    id: "tsx-usestate-useref",
    group: "基础篇",
    icon: "🎣",
    title: "useState 与 useRef 类型",
    content: `# useState 与 useRef 类型

React Hooks 在 TypeScript 下用起来很简单，大部分时候类型会自动推断，少数情况需要手动标注。

---

## useState 类型

### 1. 自动推断（推荐）

当初始值不是 null/undefined 时，TypeScript 能自动推断类型：

\`\`\`tsx
import { useState } from "react";

function Counter() {
  // count 自动推断为 number，setCount 只接受 number
  const [count, setCount] = useState(0);

  // name 自动推断为 string
  const [name, setName] = useState("");

  // isOpen 自动推断为 boolean
  const [isOpen, setIsOpen] = useState(false);

  // 数组自动推断为 string[]
  const [tags, setTags] = useState<string[]>([]);  // ⚠️ 空数组需要标注！

  return (
    <button onClick={() => setCount(count + 1)}>
      点击了 {count} 次
    </button>
  );
}
\`\`\`

### 2. 空数组/空对象初始值

初始值是空数组 \`[]\` 或空对象 \`{}\` 时，TypeScript 无法自动推断，必须手动指定泛型：

\`\`\`tsx
// ❌ 错误：inferred as never[]
const [users, setUsers] = useState([]);

// ✅ 正确：手动指定类型
const [users, setUsers] = useState<User[]>([]);
const [config, setConfig] = useState<ConfigType>({});
const [map, setMap] = useState<Record<string, number>>({});
\`\`\`

### 3. 联合类型（null / undefined 场景）

当 state 可能是 null 时（比如数据还没加载回来），用联合类型：

\`\`\`tsx
type User = {
  id: number;
  name: string;
  email: string;
};

function UserProfile() {
  // user 可能是 User 或 null（初始为 null，加载后有值）
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/user")
      .then(res => res.json())
      .then(data => setUser(data))   // data 是 User 类型
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>加载中...</div>;
  if (!user) return <div>未登录</div>;

  // ✅ 到这里 user 一定存在，不需要 ?.
  return <div>你好，{user.name}</div>;
}
\`\`\`

### 4. 多个可能类型（联合类型）

\`\`\`tsx
type Status = "idle" | "loading" | "success" | "error";

const [status, setStatus] = useState<Status>("idle");
// setStatus 只能传入这四个字符串之一
setStatus("success");  // ✅
setStatus("done");     // ❌ 类型错误
\`\`\`

### 5. 函数式更新

类型会自动推断，不需要额外标注：

\`\`\`tsx
const [count, setCount] = useState(0);

// prevCount 自动推断为 number
setCount(prevCount => prevCount + 1);

const [user, setUser] = useState<User | null>(null);
setUser(prev => prev ? { ...prev, name: "新名字" } : null);
\`\`\`

---

## useRef 类型

### 1. DOM 元素引用

\`\`\`tsx
import { useRef, useEffect } from "react";

function InputFocus() {
  // 指定 ref 指向的元素类型
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 挂载后自动聚焦
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} />;
}
\`\`\`

常见的 HTML 元素类型：
- \`HTMLInputElement\` — input
- \`HTMLButtonElement\` — button
- \`HTMLDivElement\` — div
- \`HTMLTextAreaElement\` — textarea
- \`HTMLSelectElement\` — select
- \`HTMLFormElement\` — form
- \`HTMLCanvasElement\` — canvas
- \`HTMLElement\` — 通用元素

### 2. 存储可变值（不触发重渲染）

\`\`\`tsx
function Timer() {
  // useRef 存定时器 ID，初始值为 null
  const timerRef = useRef<number | null>(null);

  const startTimer = () => {
    timerRef.current = window.setInterval(() => {
      console.log("tick");
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  return (
    <div>
      <button onClick={startTimer}>开始</button>
      <button onClick={stopTimer}>停止</button>
    </div>
  );
}
\`\`\`

### 3. 注意 null 检查

因为初始值是 null，访问 \`current\` 时 TypeScript 会要求你做检查：

\`\`\`tsx
const inputRef = useRef<HTMLInputElement>(null);

// ❌ 错误：'inputRef.current' is possibly 'null'
inputRef.current.focus();

// ✅ 方式一：可选链
inputRef.current?.focus();

// ✅ 方式二：非空断言（确定元素已挂载）
// 在事件处理或 useEffect 内，DOM 已经挂载，安全
inputRef.current!.focus();

// ✅ 方式三：if 判断
if (inputRef.current) {
  inputRef.current.focus();
}
\`\`\`

---

## useEffect / useMemo / useCallback 类型

这三个 Hook 的类型几乎都是自动推断的，基本不需要手动标注！

### useEffect 不需要标注

\`\`\`tsx
// 完全不需要类型标注
useEffect(() => {
  const timer = setTimeout(() => {
    console.log("done");
  }, 1000);

  // 清理函数返回值自动推断
  return () => clearTimeout(timer);
}, []);
\`\`\`

### useMemo 自动推断返回值类型

\`\`\`tsx
// filteredList 自动推断为 User[]
const filteredList = useMemo(() => {
  return users.filter(u => u.age > 18);
}, [users]);

// 手动标注也可以，但没必要
const filteredList = useMemo<User[]>(() => {
  return users.filter(u => u.age > 18);
}, [users]);
\`\`\`

### useCallback 自动推断函数类型

\`\`\`tsx
// handleClick 自动推断为 (e: React.MouseEvent<HTMLButtonElement>) => void
const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
  console.log("clicked", e.currentTarget);
}, []);
\`\`\`

---

## useReducer 类型

\`\`\`tsx
import { useReducer } from "react";

// 定义 State 类型
type State = {
  count: number;
  step: number;
};

// 定义 Action 类型（Discriminated Union 模式）
type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "setStep"; payload: number }
  | { type: "reset" };

// 初始状态
const initialState: State = { count: 0, step: 1 };

// reducer 函数，state 和 action 都有类型
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + state.step };
    case "decrement":
      return { ...state, count: state.count - state.step };
    case "setStep":
      return { ...state, step: action.payload };
    case "reset":
      return initialState;
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <p>Step: {state.step}</p>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
      <button onClick={() => dispatch({ type: "setStep", payload: 2 })}>
        Step = 2
      </button>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
    </div>
  );
}
\`\`\`

---

## 本章小结

✅ useState 初始值明确时自动推断类型，不需要手动标注
✅ 空数组 \`[]\` 必须标注：\`useState<User[]>([])\`
✅ 可能为 null 的值用联合类型：\`useState<User | null>(null)\`
✅ useRef 操作 DOM 时标注元素类型：\`useRef<HTMLInputElement>(null)\`
✅ 访问 \`ref.current\` 时用 \`?.\` 或 \`!\` 处理 null
✅ useEffect/useMemo/useCallback 基本不需要手动标注类型
✅ useReducer 用 Discriminated Union 定义 Action 类型最安全

下一章讲事件处理！`,
    code: `import React, { useState, useRef, useEffect, useReducer, useMemo } from "react";

// ==============================
// 示例1：useState 各种类型
// ==============================
type User = {
  id: number;
  name: string;
  age: number;
};

function StateDemo() {
  const [count, setCount] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "张三", age: 25 },
    { id: 2, name: "李四", age: 30 },
    { id: 3, name: "王五", age: 20 }
  ]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filtered = useMemo(() => {
    if (!keyword) return users;
    return users.filter(u => u.name.includes(keyword));
  }, [users, keyword]);

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>useState 示例</h3>

      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => setCount(c => c + 1)}
          style={{ padding: "6px 12px", marginRight: 8 }}
        >
          点击次数：{count}
        </button>
      </div>

      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="搜索用户名..."
        style={{ padding: 8, width: "100%", boxSizing: "border-box", marginBottom: 8 }}
      />

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 6 }}>
        {filtered.map(u => (
          <div
            key={u.id}
            onClick={() => setSelectedUser(u)}
            style={{
              padding: 10,
              cursor: "pointer",
              borderBottom: "1px solid #f3f4f6",
              background: selectedUser?.id === u.id ? "#eff6ff" : "white"
            }}
          >
            {u.name}（{u.age}岁）
          </div>
        ))}
      </div>

      {selectedUser && (
        <div style={{ marginTop: 8, padding: 10, background: "#f0fdf4", borderRadius: 6, fontSize: 13 }}>
          ✅ 已选中：{selectedUser.name}
        </div>
      )}
    </div>
  );
}

// ==============================
// 示例2：useRef - DOM 引用
// ==============================
function RefDemo() {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
    inputRef.current?.select();
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>useRef 示例</h3>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          defaultValue="点击按钮聚焦我"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={focusInput} style={{ padding: "8px 16px" }}>
          聚焦输入框
        </button>
      </div>
    </div>
  );
}

// ==============================
// 示例3：useReducer
// ==============================
type TodoState = {
  todos: { id: number; text: string; done: boolean }[];
  filter: "all" | "active" | "done";
};

type TodoAction =
  | { type: "add"; text: string }
  | { type: "toggle"; id: number }
  | { type: "delete"; id: number }
  | { type: "setFilter"; filter: TodoState["filter"] };

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case "add":
      return {
        ...state,
        todos: [...state.todos, { id: Date.now(), text: action.text, done: false }]
      };
    case "toggle":
      return {
        ...state,
        todos: state.todos.map(t =>
          t.id === action.id ? { ...t, done: !t.done } : t
        )
      };
    case "delete":
      return {
        ...state,
        todos: state.todos.filter(t => t.id !== action.id)
      };
    case "setFilter":
      return { ...state, filter: action.filter };
    default:
      return state;
  }
};

function ReducerDemo() {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [
      { id: 1, text: "学习 TS+React", done: true },
      { id: 2, text: "写一个组件", done: false }
    ],
    filter: "all"
  });
  const [text, setText] = useState("");

  const visibleTodos = state.todos.filter(t => {
    if (state.filter === "active") return !t.done;
    if (state.filter === "done") return t.done;
    return true;
  });

  return (
    <div>
      <h3 style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>useReducer 示例 - TodoList</h3>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && text.trim()) {
              dispatch({ type: "add", text: text.trim() });
              setText("");
            }
          }}
          placeholder="添加待办，按回车..."
          style={{ flex: 1, padding: 8 }}
        />
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {(["all", "active", "done"] as const).map(f => (
          <button
            key={f}
            onClick={() => dispatch({ type: "setFilter", filter: f })}
            style={{
              padding: "4px 10px",
              fontSize: 12,
              border: "none",
              borderRadius: 4,
              background: state.filter === f ? "#3b82f6" : "#e5e7eb",
              color: state.filter === f ? "white" : "#374151",
              cursor: "pointer"
            }}
          >
            {f === "all" ? "全部" : f === "active" ? "进行中" : "已完成"}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 6 }}>
        {visibleTodos.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
            暂无待办
          </div>
        ) : visibleTodos.map(t => (
          <div
            key={t.id}
            style={{
              padding: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderBottom: "1px solid #f3f4f6"
            }}
          >
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => dispatch({ type: "toggle", id: t.id })}
            />
            <span style={{ flex: 1, textDecoration: t.done ? "line-through" : "none", color: t.done ? "#9ca3af" : "inherit" }}>
              {t.text}
            </span>
            <button
              onClick={() => dispatch({ type: "delete", id: t.id })}
              style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", fontSize: 12 }}
            >
              删除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==============================
// 主组件
// ==============================
export default function HooksDemo() {
  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <h2 style={{ marginBottom: 16 }}>🎣 useState / useRef / useReducer 类型</h2>
      <StateDemo />
      <RefDemo />
      <ReducerDemo />
    </div>
  );
}
`,
  },

  {
    id: "tsx-events",
    group: "基础篇",
    icon: "🖱️",
    title: "事件处理类型",
    content: `# 事件处理类型

React 中事件处理是最常用的功能之一，TypeScript 下需要给事件对象正确的类型。

---

## 最简单的方式：让 TS 自动推断

大多数时候你**不需要手动写类型**！直接在 JSX 中写内联函数，TypeScript 会自动推断事件类型：

\`\`\`tsx
// ✅ 内联写法：e 自动推断为 React.ChangeEvent<HTMLInputElement>
<input onChange={(e) => {
  console.log(e.target.value);  // 有完整类型提示
}} />

// ✅ 内联写法：e 自动推断为 React.MouseEvent<HTMLButtonElement>
<button onClick={(e) => {
  console.log(e.currentTarget);
}}>
  点击
</button>
\`\`\`

**推荐**：如果事件处理函数只有一两行，直接写内联箭头函数，不用考虑类型问题！

---

## 提取事件处理函数

当逻辑比较复杂，需要把处理函数提取出来时，就需要标注事件类型：

\`\`\`tsx
import { useState } from "react";
import type { ChangeEvent, MouseEvent, FormEvent } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 1. input onChange：ChangeEvent<HTMLInputElement>
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // 2. button onClick：MouseEvent<HTMLButtonElement>
  const handleSubmitClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("提交", { email, password });
  };

  // 3. form onSubmit：FormEvent<HTMLFormElement>
  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("表单提交", { email, password });
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <input
        type="email"
        value={email}
        onChange={handleEmailChange}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}  {/* 内联更简单 */}
      />
      <button type="submit" onClick={handleSubmitClick}>
        登录
      </button>
    </form>
  );
}
\`\`\`

---

## 常用事件类型速查表

| 事件 | 类型 | 常见元素 |
|------|------|---------|
| onClick | \`React.MouseEvent<T>\` | button, div, a 等 |
| onChange (input/select/textarea) | \`React.ChangeEvent<T>\` | input, select, textarea |
| onSubmit | \`React.FormEvent<T>\` | form |
| onInput | \`React.FormEvent<T>\` | input |
| onFocus / onBlur | \`React.FocusEvent<T>\` | input, button 等 |
| onKeyDown / onKeyUp / onKeyPress | \`React.KeyboardEvent<T>\` | input, 全局监听 |
| onMouseEnter / onMouseLeave | \`React.MouseEvent<T>\` | 任何元素 |
| onScroll | \`React.UIEvent<T>\` | div, window |
| onWheel | \`React.WheelEvent<T>\` | 任何元素 |
| onCopy / onPaste | \`React.ClipboardEvent<T>\` | input, div |
| onDrag / onDrop | \`React.DragEvent<T>\` | 可拖拽元素 |

T 是元素类型：\`HTMLInputElement\`, \`HTMLButtonElement\`, \`HTMLDivElement\` 等。

---

## target vs currentTarget

这是 React 事件中最容易混淆的点：

- **\`e.currentTarget\`**：**绑定事件的那个元素**，类型就是你标注的那个 T，安全可访问
- **\`e.target\`**：**实际触发事件的元素**，可能是子元素，类型不确定

\`\`\`tsx
// 推荐用 currentTarget！类型永远正确
const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
  // ✅ currentTarget 一定是 HTMLButtonElement，可以安全访问 button 的属性
  console.log(e.currentTarget.disabled);
  console.log(e.currentTarget.name);
  console.log(e.currentTarget.value);

  // ⚠️ target 可能是子元素（比如 button 里嵌套了 span）
  // 类型是 EventTarget，需要类型断言
  console.log((e.target as HTMLButtonElement).value);
};

// 在 onChange 中用 target（因为用户输入的就是 input 本身）
const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  // ✅ input 的 onChange 中 target 就是 input 自己
  console.log(e.target.value);
  console.log(e.target.checked);  // checkbox 用
};
\`\`\`

**简单记忆**：
- onChange 用 \`e.target.value\`
- onClick 用 \`e.currentTarget\`

---

## 事件类型的泛型参数

如果你的函数不关心具体元素类型，可以用 \`HTMLElement\`：

\`\`\`tsx
// 任何 HTML 元素的点击事件
const handleAnyClick = (e: MouseEvent<HTMLElement>) => {
  console.log(e.currentTarget.id);
};

// 完全不使用事件对象，可以不标注
const handleClick = () => {
  console.log("clicked");
};
\`\`\`

---

## 阻止默认行为和冒泡

\`\`\`tsx
const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();  // 阻止表单默认提交
  // ...处理逻辑
};

const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
  e.stopPropagation();  // 阻止事件冒泡
  // ...处理逻辑
};
\`\`\`

---

## 键盘事件

\`\`\`tsx
import type { KeyboardEvent } from "react";

const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
    console.log("按下了回车");
    console.log("输入值：", e.currentTarget.value);
  }
  if (e.key === "Escape") {
    console.log("按下了 Esc");
  }
  // Ctrl+S / Cmd+S
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    console.log("保存");
  }
};

<input onKeyDown={handleKeyDown} />;
\`\`\`

---

## 不用事件参数时，干脆不写类型

如果处理函数根本不用事件对象 \`e\`，那完全不需要标注类型：

\`\`\`tsx
// ❌ 没必要写类型
const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
  setOpen(true);
};

// ✅ 直接不传 e
const handleClick = () => {
  setOpen(true);
};
\`\`\`

---

## 本章小结

✅ **内联事件函数**自动推断类型，不用手动标注（推荐首选）
✅ 提取事件函数时，常用类型：
- onChange → \`ChangeEvent<HTMLInputElement>\`
- onClick → \`MouseEvent<HTMLButtonElement>\`
- onSubmit → \`FormEvent<HTMLFormElement>\`
- onKeyDown → \`KeyboardEvent<HTMLInputElement>\`
✅ \`e.currentTarget\` 是绑定事件的元素，类型安全；\`e.target\` 可能是子元素
✅ 不用事件对象 \`e\` 时直接省略参数
✅ \`preventDefault()\` 阻止默认行为，\`stopPropagation()\` 阻止冒泡

下一章讲自定义 Hook 类型！`,
    code: `import React, { useState, type ChangeEvent, type MouseEvent, type FormEvent, type KeyboardEvent } from "react";

// ==============================
// 示例：各种事件类型
// ==============================
export default function EventsDemo() {
  const [text, setText] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [count, setCount] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLog(prev => [\`[\${new Date().toLocaleTimeString()}] \${msg}\`, ...prev].slice(0, 8));
  };

  // input onChange
  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  // checkbox onChange
  const handleCheckChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  // button onClick
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    setCount(c => c + 1);
    addLog(\`点击按钮，当前次数：\${count + 1}，按钮id：\${e.currentTarget.id}\`);
  };

  // form onSubmit
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addLog(\`表单提交，文本内容：\${text}\`);
  };

  // 键盘事件
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addLog("按下 Enter 键");
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      addLog("按下 Ctrl/Cmd+K 快捷键");
    }
  };

  // select onChange
  const [selected, setSelected] = useState("");
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelected(e.target.value);
    addLog(\`选择了：\${e.target.value}\`);
  };

  // textarea onChange
  const [areaText, setAreaText] = useState("");
  const handleAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setAreaText(e.target.value);
  };

  return (
    <div style={{ maxWidth: 550, margin: "40px auto", padding: 20 }}>
      <h2 style={{ marginBottom: 16 }}>🖱️ 事件处理类型</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, display: "block", marginBottom: 4 }}>文本输入 (ChangeEvent)</label>
          <input
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="输入文本，试试 Enter 或 Ctrl+K"
            style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, display: "block", marginBottom: 4 }}>下拉选择 (ChangeEvent)</label>
          <select
            value={selected}
            onChange={handleSelectChange}
            style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
          >
            <option value="">请选择</option>
            <option value="apple">🍎 苹果</option>
            <option value="banana">🍌 香蕉</option>
            <option value="orange">🍊 橙子</option>
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, display: "block", marginBottom: 4 }}>多行文本 (ChangeEvent)</label>
          <textarea
            value={areaText}
            onChange={handleAreaChange}
            placeholder="说点什么..."
            rows={2}
            style={{ width: "100%", padding: 8, boxSizing: "border-box", resize: "vertical" }}
          />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckChange}
          />
          我同意服务条款 (Checkbox ChangeEvent)
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            id="count-btn"
            type="button"
            onClick={handleClick}
            style={{ padding: "8px 16px", cursor: "pointer" }}
          >
            点击计数：{count}
          </button>
          <button
            type="submit"
            disabled={!isChecked}
            style={{
              padding: "8px 16px",
              cursor: isChecked ? "pointer" : "not-allowed",
              background: isChecked ? "#3b82f6" : "#d1d5db",
              color: "white",
              border: "none",
              borderRadius: 4
            }}
          >
            提交表单 (FormEvent)
          </button>
        </div>
      </form>

      {/* 事件日志 */}
      <div>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>事件日志：</div>
        <div style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: 6,
          padding: 10,
          fontSize: 12,
          fontFamily: "monospace",
          height: 160,
          overflowY: "auto"
        }}>
          {log.length === 0 ? (
            <div style={{ color: "#9ca3af" }}>操作后这里会显示日志...</div>
          ) : log.map((msg, i) => (
            <div key={i} style={{ padding: "2px 0", borderBottom: i < log.length - 1 ? "1px solid #f3f4f6" : "none" }}>
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`,
  },
];
