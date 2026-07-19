// =============================================================
// TypeScript + React 从入门到精通大全 —— 第 9 批
// -------------------------------------------------------------
// 章节 41-45：第九部分 useReducer / useContext / 自定义 Hook
// 沙箱：/api/run-ts（TS 转译 + ReactJSX 运行时）
// 导出：const chapters
// =============================================================

const chapters = [
  // ===========================================================
  // tsx2-ch41：useReducer 基础
  // ===========================================================
  {
    id: "tsx2-ch41",
    group: "第九部分 useReducer / useContext / 自定义 Hook",
    icon: "🎬",
    title: "第四十一章 useReducer 基础",
    content: `# 第四十一章 useReducer 基础

useReducer 是 React 提供的另一种"管理状态"的 Hook。它和 useState 都能存数据，但思维方式不同：useState 是"我有一个值，我要去改它"，useReducer 是"我有一个动作，我要把这个动作丢给一台机器去算结果"。

当一个组件的状态比较复杂（多个字段、互相依赖、或者变更逻辑有分支），用 useReducer 写起来比 useState 清晰得多。

---

## 一、为什么需要 useReducer

\`\`\`tsx
// 想象一个计数器组件，可能有 +1、-1、+5、+10、reset 多种操作
// 如果用 useState，每种操作都要写一段判断或者多个 setter
function Counter() {
  const [count, setCount] = useState(0);

  // 多种操作散落在各处，状态变更的"意图"不集中
  return (
    <>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(count + 5)}>+5</button>
      <button onClick={() => setCount(0)}>重置</button>
    </>
  );
}
\`\`\`

如果操作变多、状态字段变多、变更需要"加锁"或者日志，把逻辑全塞在事件回调里就很难维护。useReducer 把"状态如何变更"抽离成一个**纯函数 reducer**，组件本身只负责"派发动作"。

---

## 二、useReducer 的基本语法

\`\`\`tsx
// 引入 useReducer，从 react 包导入
import { useReducer } from "react";

// 第 1 步：定义 reducer 函数
// reducer 接收 (当前状态, 动作)，返回新的状态
// 它必须是纯函数：相同输入永远返回相同输出，不修改 state 本身
function reducer(state: number, action: { type: string }) {
  // 用 action.type 决定如何更新 state
  switch (action.type) {
    case "increment":
      return state + 1;  // 返回新值，不要直接修改 state
    case "decrement":
      return state - 1;
    case "reset":
      return 0;
    default:
      return state;  // 未知 action 时返回原 state（避免破坏状态）
  }
}

// 第 2 步：在组件中调用 useReducer
function Counter() {
  // useReducer 返回 [state, dispatch]
  // state：当前状态
  // dispatch：派发动作的函数，调用它会触发 reducer 执行
  const [count, dispatch] = useReducer(reducer, 0);

  return (
    <>
      <p>当前：{count}</p>
      {/* 点击按钮时派发动作，reducer 根据 type 决定怎么变 */}
      <button onClick={() => dispatch({ type: "increment" })}>+1</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-1</button>
      <button onClick={() => dispatch({ type: "reset" })}>重置</button>
    </>
  );
}
\`\`\`

---

## 三、带 payload 的 action

真实场景里，光有 type 往往不够。比如"加 5"或者"加 N"，需要在 action 里**带数据**。这部分数据在 Redux 社区里常被叫做 **payload**（载荷）。

\`\`\`tsx
// 给 action 加一个可选的 payload 字段
type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "add"; payload: number }      // 携带要加的数
  | { type: "reset" };

function reducer(state: number, action: Action) {
  switch (action.type) {
    case "increment":
      return state + 1;
    case "decrement":
      return state - 1;
    case "add":
      // 通过 action.payload 取出数据
      return state + action.payload;
    case "reset":
      return 0;
    default:
      return state;
  }
}

function Counter() {
  const [count, dispatch] = useReducer(reducer, 0);

  return (
    <>
      <p>当前：{count}</p>
      {/* 派发 add 时必须传 payload，否则 TypeScript 会报错 */}
      <button onClick={() => dispatch({ type: "add", payload: 5 })}>+5</button>
      <button onClick={() => dispatch({ type: "add", payload: 10 })}>+10</button>
      <button onClick={() => dispatch({ type: "reset" })}>重置</button>
    </>
  );
}
\`\`\`

---

## 四、useReducer 的第三个参数：惰性初始化

useState 我们知道可以直接传一个函数实现"惰性初始化"（lazy initializer），避免每次渲染都计算。useReducer 也可以——通过**第三个参数** init 函数。

\`\`\`tsx
// init 函数只在组件首次挂载时执行一次
// 用来做"昂贵的初始计算"或"从 localStorage 读数据"
function init(initial: number): number {
  console.log("init 只执行一次");
  return initial * 2;
}

function Counter() {
  // 第二个参数是 initialArg（传给 init 的初始值）
  // 第三个参数是 init 函数（可选）
  const [count, dispatch] = useReducer(reducer, 10, init);
  //                       ^^^^^^  ^^^ ^^^^^^^
  //                       reducer initialArg init

  return <p>{count}</p>;
}
\`\`\`

注意：当传入 init 时，reducer 第一个参数 state 的初值是 **init(initialArg) 的返回值**，不是 initialArg 本身。

---

## 五、useReducer vs useState 怎么选

| 维度 | useState | useReducer |
|---|---|---|
| 适用规模 | 简单、独立的状态 | 复杂、互相依赖的状态 |
| 思维模型 | "我要把状态改成 X" | "我要派发一个动作" |
| 状态逻辑 | 写在事件回调里 | 抽到纯函数 reducer 里 |
| 测试性 | 需要渲染组件才能测 | reducer 是纯函数，单独测即可 |
| 派发来源 | 组件内事件 | 任意子组件也能 dispatch |
| 调试 | 看不清"为什么状态变成这样" | 每个 action 都有名字，可打日志 |

**经验法则**：
- 1~2 个互不依赖的简单状态 → useState
- 多个字段 / 嵌套对象 / 多种操作 / 状态机 → useReducer
- 想要"把所有可能的状态变更列在一处" → useReducer

---

## 六、dispatch 的身份稳定性

这一点很关键：**dispatch 函数在组件的整个生命周期中保持引用稳定**（和 useState 的 setter 一样）。这意味着：

\`\`\`tsx
// 即使父组件用 React.memo 包了子组件，把 dispatch 当 prop 传过去
// 也不会引起子组件不必要的重渲染
const Child = React.memo(function Child({ onAdd }: { onAdd: () => void }) {
  console.log("Child 渲染");
  return <button onClick={onAdd}>+</button>;
});

function Parent() {
  const [count, dispatch] = useReducer(reducer, 0);

  // 这里每次 Parent 渲染时，handleAdd 都是新函数
  // 但是传给 Child 的 dispatch 不会变，所以 Child 不会重渲染
  return (
    <>
      <p>{count}</p>
      <Child onAdd={() => dispatch({ type: "add", payload: 1 })} />
    </>
  );
}
\`\`\`

如果你想 handleAdd 也是稳定引用，可以配合 useCallback（ch38 学过）。

---

## 七、一个完整的小例子：待办事项

\`\`\`tsx
// 用 useReducer 写一个迷你 todo 列表
type Todo = { id: number; text: string; done: boolean };

type Action =
  | { type: "add"; payload: string }
  | { type: "toggle"; payload: number }
  | { type: "remove"; payload: number }
  | { type: "clear" };

function reducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "add":
      // 末尾追加新 todo，id 用当前时间戳模拟
      return [...state, { id: Date.now(), text: action.payload, done: false }];
    case "toggle":
      // 把 id 匹配的那条的 done 字段取反
      return state.map(t => (t.id === action.payload ? { ...t, done: !t.done } : t));
    case "remove":
      // 过滤掉要删除的 id
      return state.filter(t => t.id !== action.payload);
    case "clear":
      return [];  // 一键清空
    default:
      return state;
  }
}

function TodoApp() {
  const [todos, dispatch] = useReducer(reducer, []);
  const [text, setText] = useState("");

  return (
    <div>
      {/* 输入框受控写法 */}
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={() => {
        if (!text.trim()) return;
        dispatch({ type: "add", payload: text });
        setText("");
      }}>添加</button>

      <ul>
        {todos.map(t => (
          <li key={t.id}>
            <span
              style={{ textDecoration: t.done ? "line-through" : "none" }}
              onClick={() => dispatch({ type: "toggle", payload: t.id })}
            >
              {t.text}
            </span>
            <button onClick={() => dispatch({ type: "remove", payload: t.id })}>×</button>
          </li>
        ))}
      </ul>

      {todos.length > 0 && (
        <button onClick={() => dispatch({ type: "clear" })}>清空</button>
      )}
    </div>
  );
}
\`\`\`

---

## 小结

- useReducer 是 useState 的"升级版"，把"如何变更状态"集中到一个纯函数 reducer 里。
- 用法：\`const [state, dispatch] = useReducer(reducer, initialArg, init?);\`。
- action 用 **discriminated union**（带 type 字段的对象联合）类型最安全，TypeScript 能在 switch 里自动收窄类型。
- dispatch 引用稳定，可以放心传给孩子、放进 useEffect 依赖都不会引起额外重渲染。
- 选 useState 还是 useReducer，看"状态复杂度"和"是否想把变更逻辑抽离单测"。`,
  },

  // ===========================================================
  // tsx2-ch42：useReducer 模式
  // ===========================================================
  {
    id: "tsx2-ch42",
    group: "第九部分 useReducer / useContext / 自定义 Hook",
    icon: "🏗️",
    title: "第四十二章 useReducer 模式",
    content: `# 第四十二章 useReducer 模式

上一章我们学了 useReducer 的基本语法。这一章重点讲"模式"——怎么用类型系统让 reducer 写得更安全、怎么把 reducer 拆得更小、怎么把 useReducer 和 useContext 组合成"轻量 Redux"。

---

## 一、Discriminated Union 让 action 类型安全

TypeScript 最有用的模式之一：用 **type 字段做判别式**，让编译器自动帮你检查"是否每个分支都处理了"。

\`\`\`tsx
// 用 | 把多种 action 形式串起来
// 关键：每个 case 的 type 字面量类型不同，TS 能据此自动收窄
type CounterAction =
  | { type: "increment" }                                   // 无 payload
  | { type: "decrement" }
  | { type: "add"; payload: number }                        // 必填 payload
  | { type: "set"; payload: number }
  | { type: "reset" }
  | { type: "log"; payload: { at: number; note: string } }; // 复杂 payload

function reducer(state: number, action: CounterAction): number {
  switch (action.type) {
    case "increment":
      return state + 1;
    case "decrement":
      return state - 1;
    case "add":
      // 这里 action 自动被收窄为 { type: "add"; payload: number }
      return state + action.payload;
    case "set":
      return action.payload;
    case "reset":
      return 0;
    case "log":
      // 这里 action 是 { type: "log"; payload: { at; note } }
      console.log(action.payload.at, action.payload.note);
      return state;  // log 不改变数值
    default: {
      // 兜底：TS 仍然把 action 视为 never（如果所有 case 都覆盖了）
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
\`\`\`

> **never 收尾**：在 default 里把 action 赋给 \`never\`，如果以后加了新 case 但忘了处理，TypeScript 会立刻报错。非常推荐。

---

## 二、复杂 state 形态

当 state 本身不是简单值，而是一个对象时，reducer 里要小心**不要修改原对象**。

\`\`\`tsx
// 一个表单 state：包含多个字段、错误信息、提交状态
type FormState = {
  values: { username: string; password: string };
  errors: Partial<Record<"username" | "password", string>>;
  status: "idle" | "submitting" | "success" | "error";
};

type FormAction =
  | { type: "change"; field: "username" | "password"; value: string }
  | { type: "setError"; field: "username" | "password"; message: string }
  | { type: "submit" }
  | { type: "submitSuccess" }
  | { type: "submitError" }
  | { type: "reset" };

function reducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "change":
      // 用展开语法生成新对象，不要直接 state.values.username = ...
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
      };
    case "setError":
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.message },
      };
    case "submit":
      return { ...state, status: "submitting" };
    case "submitSuccess":
      return { ...state, status: "success" };
    case "submitError":
      return { ...state, status: "error" };
    case "reset":
      return {
        values: { username: "", password: "" },
        errors: {},
        status: "idle",
      };
  }
}

function LoginForm() {
  const [state, dispatch] = useReducer(reducer, {
    values: { username: "", password: "" },
    errors: {},
    status: "idle",
  });

  return (
    <form onSubmit={e => {
      e.preventDefault();
      dispatch({ type: "submit" });
    }}>
      <input
        value={state.values.username}
        onChange={e => dispatch({ type: "change", field: "username", value: e.target.value })}
      />
      {/* ... */}
    </form>
  );
}
\`\`\`

**核心原则**：
- reducer 永远是**纯函数**：不能修改 state、不能发请求、不能调 Math.random / Date.now。
- 每次都返回**新对象/新数组**（不可变更新）。
- 复杂结构推荐用 immer 库（这里不展开，官方有文档）。

---

## 三、拆分子 reducer

当 reducer 太大时，可以按"业务领域"拆成多个小 reducer，再用一个**根 reducer**组合起来。

\`\`\`tsx
// 用户子状态 + reducer
type UserState = { name: string; age: number };
type UserAction = { type: "user/setName"; payload: string } | { type: "user/setAge"; payload: number };
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case "user/setName": return { ...state, name: action.payload };
    case "user/setAge":  return { ...state, age: action.payload };
  }
}

// 设置子状态 + reducer
type SettingsState = { theme: "light" | "dark"; lang: "zh" | "en" };
type SettingsAction = { type: "settings/toggleTheme" } | { type: "settings/setLang"; payload: "zh" | "en" };
function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case "settings/toggleTheme": return { ...state, theme: state.theme === "light" ? "dark" : "light" };
    case "settings/setLang":     return { ...state, lang: action.payload };
  }
}

// 整体状态 + 顶层 action
type AppState = { user: UserState; settings: SettingsState };
type AppAction = UserAction | SettingsAction;  // 联合起来

// 根 reducer：把 action 路由到对应的子 reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "user/setName":
    case "user/setAge":
      // 路由到 userReducer
      return { ...state, user: userReducer(state.user, action) };
    case "settings/toggleTheme":
    case "settings/setLang":
      return { ...state, settings: settingsReducer(state.settings, action) };
  }
}

function App() {
  const [state, dispatch] = useReducer(appReducer, {
    user: { name: "小明", age: 18 },
    settings: { theme: "light", lang: "zh" },
  });

  // 业务组件只需要 dispatch 对应 action
  return (
    <button onClick={() => dispatch({ type: "settings/toggleTheme" })}>
      当前主题：{state.settings.theme}
    </button>
  );
}
\`\`\`

> 这种"用 type 前缀做命名空间"的做法在 Redux Toolkit 里也很常见。

---

## 四、context + useReducer：轻量 Redux

把 useReducer 配合 context，可以做出一个"全局状态"模式，免去一层层传 props。

\`\`\`tsx
// 第 1 步：用 createContext 创建一个容器
import { createContext, useContext, useReducer, ReactNode } from "react";

type State = { count: number; user: string | null };
type Action = { type: "inc" } | { type: "dec" } | { type: "setUser"; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "inc": return { ...state, count: state.count + 1 };
    case "dec": return { ...state, count: state.count - 1 };
    case "setUser": return { ...state, user: action.payload };
  }
}

// 创建一个 context，类型是 [State, Dispatch<Action>] 的元组
const StoreContext = createContext<[State, React.Dispatch<Action>] | null>(null);

// 第 2 步：写一个 Provider 组件，把 state 和 dispatch 暴露出去
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { count: 0, user: null });
  // 把 [state, dispatch] 作为 context 的值
  return <StoreContext.Provider value={[state, dispatch]}>{children}</StoreContext.Provider>;
}

// 第 3 步：写一个自定义 hook，让其他组件用起来更顺手
export function useStore() {
  const ctx = useContext(StoreContext);
  // 类型守卫：如果忘了包 Provider，ctx 就是 null，立刻报错
  if (!ctx) throw new Error("useStore 必须在 StoreProvider 内部使用");
  return ctx;
}
\`\`\`

使用方式：

\`\`\`tsx
function Counter() {
  // 直接拿到全局 state 和 dispatch，不需要 prop drilling
  const [state, dispatch] = useStore();
  return (
    <>
      <p>{state.count} / 用户：{state.user ?? "未登录"}</p>
      <button onClick={() => dispatch({ type: "inc" })}>+1</button>
      <button onClick={() => dispatch({ type: "setUser", payload: "张三" })}>登录</button>
    </>
  );
}

function App() {
  return (
    <StoreProvider>
      <Counter />
    </StoreProvider>
  );
}
\`\`\`

---

## 五、拆分 Context：state 和 dispatch 分开

把"读"和"写"放到不同的 context 里，能大幅减少不必要的重渲染（只 dispatch 不读 state 的组件不会因为 state 变化而重渲染）。

\`\`\`tsx
const StateContext = createContext<State | null>(null);
const DispatchContext = createContext<React.Dispatch<Action> | null>(null);

function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { count: 0, user: null });
  return (
    // 两个 Provider 嵌套：读 state 的组件订阅 StateContext，dispatch 组件订阅 DispatchContext
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

function useStoreState() { /* ... */ }
function useStoreDispatch() { /* ... */ }

// 纯派发的按钮组件只订阅 dispatch
const IncrementButton = React.memo(function IncrementButton() {
  const dispatch = useStoreDispatch();
  return <button onClick={() => dispatch({ type: "inc" })}>+1</button>;
});
\`\`\`

这个"拆分 context"的优化是大型 React 应用的关键技巧之一，后面的性能章节会再提到。

---

## 六、在 useEffect 里 dispatch

注意：useEffect 里的 dispatch 引用稳定，**不会**触发 effect 死循环（不像 setState 套 setState 会引发新问题）。所以可以在 effect 里根据某些条件派发 action。

\`\`\`tsx
function Comp() {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    // 比如：当网络状态从离线变在线时，触发同步动作
    window.addEventListener("online", () => {
      dispatch({ type: "online" });
    });
    return () => window.removeEventListener("online", () => {});
    // ✅ dispatch 引用稳定，不用放进依赖数组
  }, []);

  return null;
}
\`\`\`

---

## 小结

- 用 discriminated union + \`never\` 兜底，让 reducer 在编译期就完整覆盖所有 case。
- state 是对象/嵌套结构时，记得**展开语法做不可变更新**，永远不修改旧对象。
- 业务复杂时用"按领域拆子 reducer + 根 reducer 路由"的模式。
- context + useReducer = 轻量 Redux：所有变更走 dispatch，方便加日志、做撤销重做、做时间旅行调试。
- 把 state context 和 dispatch context 拆开，能让只关心派发的组件不被状态更新打扰。`,
  },

  // ===========================================================
  // tsx2-ch43：useContext 基础
  // ===========================================================
  {
    id: "tsx2-ch43",
    group: "第九部分 useReducer / useContext / 自定义 Hook",
    icon: "🌐",
    title: "第四十三章 useContext 基础",
    content: `# 第四十三章 useContext 基础

React 默认是"数据从父组件 props 流向子组件"的单向数据流。当组件树很深、某些数据（主题、用户、语言）需要**跨层级共享**时，靠 props 一层层传下去（prop drilling）既烦又难维护。Context 就是为这个场景设计的。

---

## 一、Context 三件套

\`\`\`tsx
// Context 由三部分组成：createContext / Provider / useContext
import { createContext, useContext, useState, ReactNode } from "react";

// 1. createContext：创建一个"上下文对象"
// 传一个默认值；当 Provider 缺失时，组件会拿到这个值
const ThemeContext = createContext<"light" | "dark">("light");
//                                            ^^^^^^^^^^^ 默认值

// 2. Provider：在组件树顶层包一层，把"值"提供给所有子组件
function App() {
  return (
    <ThemeContext.Provider value="dark">
      {/* 这棵树里所有 useContext(ThemeContext) 都会拿到 "dark" */}
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// 3. useContext：在任意子组件里"读取"上下文
function Toolbar() {
  // Toolbar 不用接收 theme prop，Button 也不用 Toolbar 转发
  return (
    <div>
      <Button />
    </div>
  );
}

function Button() {
  // 直接跨层读 theme，不再 prop drilling
  const theme = useContext(ThemeContext);
  return <button className={theme}>按钮（{theme}）</button>;
}
\`\`\`

---

## 二、为什么用 createContext 不直接传值

普通 props：

\`\`\`tsx
<App theme="dark">
  <Toolbar theme="dark">     {/* 透传 */}
    <Sidebar theme="dark">   {/* 透传 */}
      <Button theme="dark" /> {/* 终于用上了 */}
\`\`\`

Context：

\`\`\`tsx
<App theme="dark">
  <Toolbar>                  {/* 不需要知道 theme */}
    <Sidebar>                {/* 也不需要 */}
      <Button />             {/* 直接 useContext 读 */}
\`\`\`

Context 让"不关心这个数据的中间组件"完全不用知道它的存在。

---

## 三、默认值 vs Provider 值

\`\`\`tsx
// createContext 的默认值只有在"组件不在任何 Provider 里"时才会用
const ThemeContext = createContext<"light" | "dark">("light");

function StandaloneButton() {
  // 没有任何 Provider 包它，返回默认值 "light"
  const theme = useContext(ThemeContext);
  return <button>{theme}</button>;
}

function App() {
  return (
    <>
      <StandaloneButton />        {/* 显示 light */}
      <ThemeContext.Provider value="dark">
        <StandaloneButton />      {/* 显示 dark */}
      </ThemeContext.Provider>
    </>
  );
}
\`\`\`

实战经验：默认值通常设成"安全的兜底"，或者干脆设成 null，配合自定义 hook 报错。

---

## 四、类型安全的 Context：null 模式

直接给 createContext 传对象/函数作为默认值，类型推断会出问题。更稳健的做法是：**默认值为 null，提供一个自定义 hook 检查 null**。

\`\`\`tsx
// 用 | null 兜底，让 useContext 的返回类型是 T | null
type AuthValue = {
  user: { name: string } | null;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);
//                                                  ^^^^ 默认 null，强制必须 Provider

// 自定义 hook：忘记 Provider 时立刻报错，而不是得到错误的"空对象"
export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth 必须在 <AuthProvider> 内部使用");
  }
  return ctx;  // 这里 ctx 已经被收窄为 AuthValue（去掉 null）
}
\`\`\`

这样所有消费组件拿到的都是"肯定有值的 AuthValue"，不用每次都判断 null。

---

## 五、Provider 组件封装

实际开发中通常会写一个 Provider 组件，把"状态 + setter"都包在内部，外部只看到友好接口。

\`\`\`tsx
// 把 createContext 和 Provider 写在同一个文件里，对外只暴露 useXxx
type Theme = "light" | "dark";
const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // 状态在 Provider 内部维护
  const [theme, setTheme] = useState<Theme>("light");
  // 派生一个稳定引用：每次渲染时只创建一次
  const value = useMemo(() => ({
    theme,
    toggle: () => setTheme(t => t === "light" ? "dark" : "light"),
  }), [theme]);
  //                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //                      toggle 函数虽然每次都新建，但因为用了 useState 的函数式更新形式，
  //                      语义上是稳定的；用 useMemo 进一步保险

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme 必须在 ThemeProvider 内部使用");
  return ctx;
}
\`\`\`

消费端：

\`\`\`tsx
function ThemeButton() {
  const { theme, toggle } = useTheme();
  return <button onClick={toggle}>当前：{theme}</button>;
}
\`\`\`

---

## 六、Provider 嵌套

Context 可以嵌套。不同 Provider 互不影响，外层覆盖内层。

\`\`\`tsx
function App() {
  return (
    <ThemeProvider>            {/* 整个 App 用 light 主题 */}
      <Page />
      <ThemeProvider value="dark">  {/* 这部分是 dark */}
        <DarkSection />
      </ThemeProvider>
    </ThemeProvider>
  );
}
\`\`\`

> 注：上面这个例子其实不严谨，ThemeProvider 是我们自定义的，不接受 value。要做嵌套需要把 value 设计成 prop。

更常见的多 Provider 组合：

\`\`\`tsx
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <I18nProvider>
          <RouterProvider>
            <Routes />
          </RouterProvider>
        </I18nProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
\`\`\`

---

## 七、Context 性能小坑

每次 Provider 重新渲染时，所有 useContext 它的子组件都会**重新渲染**（即使这次提供的值和上次一样）。

\`\`\`tsx
// ❌ 反例：每次 Provider 渲染时 value 都是新对象，所有消费者都重渲染
function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {/* 每次渲染都新建对象，Context 内部比较的是"引用相等" */}
      {children}
    </ThemeContext.Provider>
  );
}

// ✅ 正例：把 value 用 useMemo 稳定下来
const value = useMemo(() => ({ theme, setTheme }), [theme]);
return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
\`\`\`

这就是 ch52 会再展开的"减少重渲染"内容。

---

## 八、什么时候用 Context，**不要滥用**

| 适合 Context | 不适合 Context |
|---|---|
| 主题、语言、用户身份 | 频繁变化的局部状态（输入框值） |
| 全局开关（暗黑模式） | 父子组件一对一传递 |
| 路由、鉴权上下文 | "图省事就扔 Context"的懒人心态 |
| 跨多个组件的同一份数据 | 高频更新（每秒几十次的实时数据） |

**经验法则**：能用 props 传就先用 props；超过 3 层透传时再考虑 Context。

---

## 小结

- Context 解决的是"跨层级数据共享"问题，避免 prop drilling。
- 三件套：\`createContext\` 创建、\`Provider\` 提供、\`useContext\` 读取。
- 默认值兜底 + 自定义 hook 检查 null = 类型安全。
- Provider 的 value 必须用 \`useMemo\` 包好，否则所有消费者都会重渲染。
- 不要滥用 Context：频繁更新的状态用 Context 会拖慢整个应用。`,
  },

  // ===========================================================
  // tsx2-ch44：useContext 实战
  // ===========================================================
  {
    id: "tsx2-ch44",
    group: "第九部分 useReducer / useContext / 自定义 Hook",
    icon: "🎨",
    title: "第四十四章 useContext 实战",
    content: `# 第四十四章 useContext 实战

光会语法不够，这一章用 4 个真实场景把 Context 练熟：主题切换、国际化、鉴权、多 Context 组合。学完这些你就能在项目里独立设计 Context 结构了。

---

## 一、Theme Context：完整实现

\`\`\`tsx
// theme-context.tsx
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;        // 用户选择的
  effective: "light" | "dark";  // 实际生效的（处理 system 情况）
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// 媒体查询：判断系统是不是深色
function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // 从 localStorage 恢复用户选择
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("theme") as Theme) || "system";
  });

  // 实际生效的主题：system 时跟随系统
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(getSystemTheme);

  useEffect(() => {
    // 监听系统主题变化
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setSystemTheme(mq.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    // 写回 localStorage，并切换 data-theme 属性
    localStorage.setItem("theme", theme);
    const effective = theme === "system" ? systemTheme : theme;
    document.documentElement.dataset.theme = effective;
  }, [theme, systemTheme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    effective: theme === "system" ? systemTheme : theme,
    setTheme,
  }), [theme, systemTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme 必须在 ThemeProvider 内使用");
  return ctx;
}
\`\`\`

消费端：

\`\`\`tsx
function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <select value={theme} onChange={e => setTheme(e.target.value as Theme)}>
      <option value="light">浅色</option>
      <option value="dark">深色</option>
      <option value="system">跟随系统</option>
    </select>
  );
}

function Card() {
  const { effective } = useTheme();
  // 用 effective 而不是 theme，才能正确处理 system 模式
  return <div className={\`card card-\${effective}\`}>卡片</div>;
}
\`\`\`

---

## 二、i18n Context：国际化

\`\`\`tsx
// i18n-context.tsx
type Locale = "zh" | "en";
type Dict = Record<string, string>;

const zh: Dict = {
  "common.hello": "你好",
  "common.world": "世界",
  "nav.home": "首页",
  "nav.about": "关于",
};
const en: Dict = {
  "common.hello": "Hello",
  "common.world": "World",
  "nav.home": "Home",
  "nav.about": "About",
};

const dicts: Record<Locale, Dict> = { zh, en };

type I18nValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  // t 函数：接收 key，返回当前语言下的字符串
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("zh");

  const t = useMemo(() => (key: string, vars?: Record<string, string | number>) => {
    // 1. 先按当前 locale 查
    let str = dicts[locale][key];
    // 2. 查不到则回退到中文
    if (str === undefined) str = dicts.zh[key] ?? key;
    // 3. 替换变量：{name} -> 真实值
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(\`{\${k}}\`, String(v));
      }
    }
    return str;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n 必须在 I18nProvider 内使用");
  return ctx;
}
\`\`\`

使用：

\`\`\`tsx
function Greeting({ name }: { name: string }) {
  const { t, setLocale, locale } = useI18n();
  return (
    <div>
      <h1>{t("common.hello", { name })}</h1>
      <nav>
        <a href="/">{t("nav.home")}</a>
        <a href="/about">{t("nav.about")}</a>
      </nav>
      <button onClick={() => setLocale(locale === "zh" ? "en" : "zh")}>
        切换语言
      </button>
    </div>
  );
}
\`\`\`

---

## 三、Auth Context：登录态管理

\`\`\`tsx
// auth-context.tsx
type User = { id: string; name: string; roles: ("admin" | "user")[] };

type AuthValue = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: "admin" | "user") => boolean;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 启动时从 token 还原登录态
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/me", { headers: { Authorization: \`Bearer \${token}\` } })
        .then(r => r.ok ? r.json() : null)
        .then((u: User | null) => setUser(u))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("登录失败");
      const { token, user } = await res.json();
      localStorage.setItem("token", token);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // 用 useMemo 避免每次渲染都新建 hasRole 函数
  const value = useMemo<AuthValue>(() => ({
    user,
    loading,
    login,
    logout,
    hasRole: (role) => user?.roles.includes(role) ?? false,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 必须在 AuthProvider 内使用");
  return ctx;
}
\`\`\`

用 hasRole 做权限控制：

\`\`\`tsx
function AdminPanel() {
  const { hasRole } = useAuth();
  if (!hasRole("admin")) return <p>无权限</p>;
  return <h1>管理面板</h1>;
}
\`\`\`

---

## 四、多 Context 组合

真实项目里往往有 5+ 个 Provider。最干净的做法是写一个 \`AppProviders\` 把它们打包：

\`\`\`tsx
// app-providers.tsx
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <QueryProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </QueryProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <AppProviders>
      <Routes />
    </AppProviders>
  );
}
\`\`\`

---

## 五、Context 之间的相互读取

有时候一个 Context 需要读另一个 Context 的值。最简单的办法是把它放进内部组件里。

\`\`\`tsx
// 比如：I18nProvider 需要根据 Auth 的用户偏好设置默认语言
function I18nProviderInner({ children }: { children: ReactNode }) {
  const { user } = useAuth();  // 读另一个 Context
  const [locale, setLocale] = useState<Locale>(() => {
    return (user as any)?.preferredLocale ?? "zh";
  });
  // ...
}

export function I18nProvider(props: { children: ReactNode }) {
  return (
    <AuthProvider>
      <I18nProviderInner {...props} />
    </AuthProvider>
  );
}
\`\`\`

> ⚠️ 这种"Context A 包了 Context B 的 Provider 组件"在 React 里是合法的（Provider 内部能调用任何 Hook），但会让依赖关系变复杂，谨慎使用。

---

## 六、避免 Context 性能问题的几个小技巧

\`\`\`tsx
// 1. 拆分成多个小 Context
//    state context + dispatch context 分离（ch42 讲过）

// 2. Provider 内部用 useMemo 稳定 value
const value = useMemo(() => ({ ... }), [deps]);

// 3. 复杂 Context 配合 selector（用第三方库如 use-context-selector）
//    或者直接用 zustand / jotai

// 4. 对于"读一次就好"的 Context，用 useMemo + useRef 让 value 引用不变
const valueRef = useRef(value);
valueRef.current = value;
const stableValue = useMemo(() => valueRef.current, []);

// 5. 把大对象拆成多个小 Context，按需订阅
const UserContext = createContext<User | null>(null);
const UserActionsContext = createContext<UserActions | null>(null);
\`\`\`

---

## 小结

- **主题 / i18n / 鉴权** 是 Context 最常见的三大场景，每一个都可以写成一个独立 Provider。
- 自定义 hook（\`useTheme\` / \`useI18n\` / \`useAuth\`）是消费 Context 的"标准接口"，内部用 \`if (!ctx) throw\` 兜底。
- 多 Context 组合用 \`AppProviders\` 统一管理，避免在最外层堆一长串 Provider。
- 关注性能：用 \`useMemo\` 稳定 value、拆分 Context、必要时引入专业状态库。`,
  },

  // ===========================================================
  // tsx2-ch45：自定义 Hook
  // ===========================================================
  {
    id: "tsx2-ch45",
    group: "第九部分 useReducer / useContext / 自定义 Hook",
    icon: "🪝",
    title: "第四十五章 自定义 Hook",
    content: `# 第四十五章 自定义 Hook

自定义 Hook 是 React 里"代码复用"的主力工具。它把**有状态的逻辑**（多个 useState / useEffect 的组合）抽成一个函数，多个组件共享。本章从最常用的 8 个 Hook 开始，最后讲"如何写出可测试的 Hook"。

---

## 一、自定义 Hook 的本质

\`\`\`tsx
// 自定义 Hook 就是一个普通函数，名字以 "use" 开头
// 内部可以调用其他 Hook
function useWindowWidth(): number {
  // 内部用 useState + useEffect
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

// 在任意组件里调用
function Page() {
  const width = useWindowWidth();
  return <p>窗口宽度：{width}px</p>;
}
\`\`\`

**核心要点**：
- 命名以 \`use\` 开头（lint 工具靠这个识别）。
- 内部可以调用其他 Hook（useState、useEffect、自定义 Hook）。
- 每次调用 Hook，**都拥有独立的状态**（不是共享！）。
- 可以在两个组件里同时调用 useWindowWidth，它们各有自己的 width state。

---

## 二、useLocalStorage：同步到本地存储

\`\`\`tsx
// 通用模式：把 useState 包成"自动持久化到 localStorage"的版本
function useLocalStorage<T>(key: string, initialValue: T): [T, (v: T) => void] {
  // 初始化时从 localStorage 读
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // 每次 value 变化时写回
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("localStorage 写入失败", e);
    }
  }, [key, value]);

  return [value, setValue];
}

// 用起来和 useState 一模一样
function Settings() {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");
  return <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme}</button>;
}
\`\`\`

---

## 三、useDebounce：延迟更新值

\`\`\`tsx
// 当 value 变化时，等 delay 毫秒没再变才更新
function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // 每次 value 变都重置定时器
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);  // 清理：下次变化或卸载时取消
  }, [value, delay]);

  return debounced;
}

// 搜索框：用户停止输入 300ms 后才真正发请求
function Search() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  // 这里的 effect 只在 debouncedQuery 变时跑
  useEffect(() => {
    if (debouncedQuery) fetch(\`/api/search?q=\${debouncedQuery}\`);
  }, [debouncedQuery]);
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
\`\`\`

---

## 四、usePrevious：拿到上一次的值

\`\`\`tsx
// 拿到 props 或 state 上一次渲染时的值
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  // 用 useEffect 是因为它会在 render 之后才执行
  // 这样 ref.current 永远是"上一次的值"
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;  // 第一次渲染时返回 undefined
}

// 用法：检测 count 是否从 0 变成 1
function Counter() {
  const [count, setCount] = useState(0);
  const prev = usePrevious(count);
  return (
    <>
      <p>当前：{count}（上一次：{prev ?? "无"}）</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </>
  );
}
\`\`\`

---

## 五、useToggle：布尔状态

\`\`\`tsx
// 把 useState<boolean> 简化成"切换开关"
function useToggle(initial = false): [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = useState(initial);
  // 返回 [值, toggle 函数, 强制设置函数]
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle, setValue];
}

function Modal() {
  const [open, toggleOpen, setOpen] = useToggle(false);
  return (
    <>
      <button onClick={toggleOpen}>{open ? "关闭" : "打开"}</button>
      {open && <div className="modal">...</div>}
    </>
  );
}
\`\`\`

---

## 六、useFetch：通用数据请求

\`\`\`tsx
// 把"loading + error + data + abort"打包成一个 hook
type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

function useFetch<T>(url: string) {
  const [state, setState] = useState<FetchState<T>>({ status: "idle" });

  useEffect(() => {
    // 每次 url 变都重新拉
    const ctrl = new AbortController();
    setState({ status: "loading" });

    fetch(url, { signal: ctrl.signal })
      .then(r => {
        if (!r.ok) throw new Error(\`HTTP \${r.status}\`);
        return r.json() as Promise<T>;
      })
      .then((data) => setState({ status: "success", data }))
      .catch((err) => {
        // AbortError 不算真正的错误
        if (err.name === "AbortError") return;
        setState({ status: "error", error: err.message });
      });

    return () => ctrl.abort();
  }, [url]);

  return state;
}

function UserList() {
  const state = useFetch<User[]>("/api/users");
  if (state.status === "loading") return <p>加载中…</p>;
  if (state.status === "error")   return <p>出错：{state.error}</p>;
  if (state.status === "success") return <ul>{state.data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
  return null;
}
\`\`\`

---

## 七、useOnClickOutside：点击外部关闭

\`\`\`tsx
// 检测点击是否发生在 ref 指向的元素外
function useOnClickOutside<T extends HTMLElement>(handler: () => void) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      // 如果点击发生在 ref 内部，就不触发
      if (!ref.current) return;
      if (ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [handler]);

  return ref;
}

// 经典用法：下拉菜单点击外部关闭
function Dropdown() {
  const [open, setOpen] = useState(false);
  const ref = useOnClickOutside<HTMLDivElement>(() => setOpen(false));
  return (
    <div ref={ref}>
      <button onClick={() => setOpen(o => !o)}>菜单</button>
      {open && <ul><li>选项 1</li><li>选项 2</li></ul>}
    </div>
  );
}
\`\`\`

---

## 八、useEvent：稳定的回调（React 18+ 提案）

\`\`\`tsx
// useCallback 的痛点：依赖项多时容易写错或写多
// useEvent（实验性）让回调永远拿到最新值，引用却永远稳定
import { useEvent } from "react";  // ⚠️ 实验性 API，可能改名 useEffectEvent

function Search({ query }: { query: string }) {
  // onSearch 永远引用稳定，但内部能拿到最新的 query
  const onSearch = useEvent(() => {
    console.log("搜索：", query);
  });

  useEffect(() => {
    // 不需要把 onSearch 放进依赖数组
    const id = setInterval(onSearch, 1000);
    return () => clearInterval(id);
  }, []);  // ✅ 不再因为 onSearch 引用变化而重启定时器
  return null;
}
\`\`\`

> 注：截至 React 18 这个 API 仍标记为 \`useEffectEvent\`，未来可能变化。本地用 useRef + useEffect 也能模拟。

---

## 九、测试自定义 Hook

自定义 Hook 之所以强大，**关键就是可测**——它不依赖组件树，只需要 React 的 Hook 运行时即可单测。

\`\`\`tsx
// 用 @testing-library/react-hooks（或 renderHook）测试
import { renderHook, act } from "@testing-library/react";

test("useToggle 切换布尔值", () => {
  const { result } = renderHook(() => useToggle(false));
  expect(result.current[0]).toBe(false);

  // act 包裹：让 React 同步执行状态更新
  act(() => result.current[1]());
  expect(result.current[0]).toBe(true);

  act(() => result.current[1]());
  expect(result.current[0]).toBe(false);
});

test("useDebounce 延迟更新", () => {
  jest.useFakeTimers();
  const { result, rerender } = renderHook(
    ({ value }) => useDebounce(value, 500),
    { initialProps: { value: "a" } }
  );

  rerender({ value: "ab" });
  jest.advanceTimersByTime(499);
  expect(result.current).toBe("a");  // 还没到时间
  jest.advanceTimersByTime(1);
  expect(result.current).toBe("ab");  // 时间到，更新
});
\`\`\`

---

## 十、自定义 Hook 设计原则

| 原则 | 说明 |
|---|---|
| 单一职责 | 一个 Hook 只做一件事 |
| 命名 \`useXxx\` | 必须以 use 开头，让 lint 工具识别 |
| 入参明确 | 类型签名清晰，避免"魔法参数" |
| 返回值稳定 | 能稳定就稳定（用 useCallback / useMemo） |
| 内部清理 | useEffect 必须 return 清理函数 |
| 可测试 | 业务逻辑尽量放在 Hook 里，不要写在组件 |

---

## 小结

- 自定义 Hook 是"有状态逻辑的复用"——把 useState + useEffect 组合抽出来。
- 常见套路：\`useLocalStorage\` / \`useDebounce\` / \`usePrevious\` / \`useToggle\` / \`useFetch\` / \`useOnClickOutside\`。
- 命名 \`useXxx\`、返回稳定引用、清理 effect，这三条是写出好 Hook 的关键。
- 自定义 Hook 的最大好处是**可独立测试**，不用渲染整个组件树。
- 遇到"每个组件都要重复一遍的逻辑"时，就该抽 Hook 了。`,
  },
];

export { chapters };
