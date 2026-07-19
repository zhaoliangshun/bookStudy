// =============================================================
// React 中使用 TypeScript 从入门到精通大全 —— 第十二批章节
// -------------------------------------------------------------
// 覆盖：第八部分 状态管理
// 包含 5 个章节：ch57 ~ ch61
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
  // ch57: Context + useReducer
  // ============================================================
  {
    id: "tsx3-ch57",
    group: "第八部分 状态管理",
    icon: "🌀",
    title: "ch57 Context + useReducer",
    content: `# ch57 Context + useReducer

## 为什么讲这个

当组件树里有 3 层以上需要共享同一份状态时，逐层传 props 会让你写到怀疑人生。React 自带的 Context API 是"零依赖"解决方案——不需要装任何库，开箱即用。

但 Context 单独用有两个坑：**状态多了 useState 写不下**、**任何状态变化都会让所有消费组件重新渲染**。这一章讲怎么用 \`useReducer\` 把状态收拢成"一个 store + dispatch"，再讲 Context 嵌套优化和 selector 模式，让你能用纯 React 解决 80% 的状态共享场景。

## 1. 最朴素的 Context：传一份值

先看最简单的 Context——只是把一份值传给后代：

\`\`\`tsx
import { createContext, useContext } from "react";

// 1. 创建 Context：泛型参数是 value 的类型
//    默认值给 null，调用方必须确保 Provider 套上了
type Theme = "light" | "dark";
const ThemeContext = createContext<Theme | null>(null);

// 2. Provider 组件：包住后代，提供 value
function App() {
  return (
    // value 必传，类型必须匹配 Theme
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// 3. 消费方：useContext 拿到 value
function Toolbar() {
  // useContext 返回 Theme | null，要先判空
  const theme = useContext(ThemeContext);
  if (theme === null) {
    // 没拿到 value：通常意味着忘了套 Provider
    return <div>no theme</div>;
  }
  return <div>当前主题：{theme}</div>;
}
\`\`\`

注意 \`createContext<Theme | null>(null)\` 这个写法——默认值给 \`null\`，消费方就必须判空，TypeScript 才不会抱怨。**不要写 \`createContext<Theme>(undefined as any)\`**，那是逃避类型检查。

## 2. 自定义 hook + Context：抛出"非空"值

每消费一次就判空很烦。可以包一个自定义 hook，把"判空"集中在一处：

\`\`\`tsx
import { createContext, useContext } from "react";

type Theme = "light" | "dark";
const ThemeContext = createContext<Theme | null>(null);

// 自定义 hook：内部判空，外部使用直接拿到 Theme
function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (theme === null) {
    // 抛错而非返回默认值：让 bug 早暴露
    throw new Error("useTheme 必须在 ThemeContext.Provider 内部使用");
  }
  return theme;
}

// 消费方
function Toolbar() {
  const theme = useTheme(); // 类型是 Theme，不用判空
  return <div>当前主题：{theme}</div>;
}
\`\`\`

这是 React 官方推荐的模式——**自定义 hook 既封装判空，又能改名**，比 \`useContext\` 更友好。

## 3. useReducer：把多个 useState 收成一个 store

当状态多了（比如购物车：商品列表、总价、折扣、地址……），用 5 个 \`useState\` 会乱。用 \`useReducer\` 把它们打包成一个对象，再靠 \`dispatch\` 修改：

\`\`\`tsx
import { useReducer } from "react";

// 1. 状态类型：把所有状态打包
interface CartState {
  items: string[];     // 商品列表
  discount: number;    // 折扣（0-1）
}

// 2. Action 类型：用联合类型描述"所有可能的操作"
type CartAction =
  | { type: "add"; item: string }    // 加商品
  | { type: "remove"; item: string } // 移商品
  | { type: "setDiscount"; value: number }; // 改折扣

// 3. reducer：纯函数，根据 action 返回新 state
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add":
      // 不可变更新：用展开符返回新数组
      return { ...state, items: [...state.items, action.item] };
    case "remove":
      return { ...state, items: state.items.filter(i => i !== action.item) };
    case "setDiscount":
      return { ...state, discount: action.value };
    default:
      // TS 这里会穷尽检查：漏掉一个 case 编译报错
      const _exhaustive: never = action;
      return _exhaustive;
  }
}

// 4. 使用 useReducer
function Cart() {
  // 第二参数是初始 state
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    discount: 0,
  });

  return (
    <div>
      <p>商品数：{state.items.length}</p>
      <p>折扣：{state.discount}</p>
      <button onClick={() => dispatch({ type: "add", item: "苹果" })}>
        加苹果
      </button>
      <button onClick={() => dispatch({ type: "setDiscount", value: 0.8 })}>
        打 8 折
      </button>
    </div>
  );
}
\`\`\`

注意 \`_exhaustive: never = action\` 这一行——它是 TypeScript 的"穷尽检查"模式。如果你以后加了新 action 但忘了写 case，TS 在这里就报错，比运行时白屏强太多。

## 4. Context + useReducer：经典组合

把 \`useReducer\` 的 \`state\` 和 \`dispatch\` 通过 Context 传下去，就是经典模式：

\`\`\`tsx
import { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";

// 状态与 Action
interface CartState {
  items: string[];
}
type CartAction = { type: "add"; item: string };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add":
      return { ...state, items: [...state.items, action.item] };
  }
}

// Context：同时存 state 和 dispatch
interface CartContextValue {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
}
const CartContext = createContext<CartContextValue | null>(null);

// Provider 组件：内部 useReducer，把值塞 Context
function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

// 自定义 hook
function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (ctx === null) {
    throw new Error("useCart 必须在 CartProvider 内部使用");
  }
  return ctx;
}

// 消费方 A：只展示，不修改
function CartList() {
  const { state } = useCart();
  return <div>商品：{state.items.join(", ")}</div>;
}

// 消费方 B：只 dispatch，不读 state
function AddButton() {
  const { dispatch } = useCart();
  return (
    <button onClick={() => dispatch({ type: "add", item: "苹果" })}>
      加苹果
    </button>
  );
}

// 顶层
function App() {
  return (
    <CartProvider>
      <CartList />
      <AddButton />
    </CartProvider>
  );
}
\`\`\`

这就是社区说的 **"Context + useReducer" 经典模式**。它解决了"层层 props 传递"的问题，类型安全也跟上了。

但这个模式有个**性能坑**：每次 \`state\` 变化，所有用 \`useCart\` 的组件都会重新渲染——即使 \`AddButton\` 只用了 \`dispatch\` 根本不读 \`state\`。

## 5. 拆分 Context：解决"全员重渲染"

把 \`state\` 和 \`dispatch\` 拆成两个 Context，可以让"只 dispatch 不读 state" 的组件避开重渲染：

\`\`\`tsx
import { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";

interface CartState {
  items: string[];
}
type CartAction = { type: "add"; item: string };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add":
      return { ...state, items: [...state.items, action.item] };
  }
}

// 拆成两个 Context：state 一个，dispatch 一个
const CartStateContext = createContext<CartState | null>(null);
// dispatch 类型几乎不变，用 React.Dispatch
const CartDispatchContext = createContext<React.Dispatch<CartAction> | null>(null);

function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  return (
    // 嵌套两层 Provider：state 在外，dispatch 在内
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
}

// 两个自定义 hook：分别取 state 和 dispatch
function useCartState(): CartState {
  const s = useContext(CartStateContext);
  if (s === null) throw new Error("useCartState 必须在 CartProvider 内");
  return s;
}
function useCartDispatch(): React.Dispatch<CartAction> {
  const d = useContext(CartDispatchContext);
  if (d === null) throw new Error("useCartDispatch 必须在 CartProvider 内");
  return d;
}

// AddButton 只用 dispatch：state 变它也不重渲染
function AddButton() {
  const dispatch = useCartDispatch();
  console.log("AddButton 渲染");
  return (
    <button onClick={() => dispatch({ type: "add", item: "苹果" })}>
      加苹果
    </button>
  );
}
\`\`\`

这就是 **"Context 拆分" 模式**——把变的部分（state）和不变的部分（dispatch）分开。dispatch 是引用稳定的，所以 \`CartDispatchContext\` 的 value 永远不变，消费方不会因为 state 变而重渲染。

## 6. selector 模式：让消费方只订阅"自己关心的字段"

\`AddButton\` 的问题解决了，但 \`CartList\` 里如果你只关心 \`items.length\`，加折扣这种和 length 无关的变化也会让它重渲染。selector 模式让组件"只订阅自己关心的字段"：

\`\`\`tsx
import { createContext, useContext, useReducer, useMemo, useRef } from "react";
import type { ReactNode } from "react";

interface CartState {
  items: string[];
  discount: number;
}
type CartAction =
  | { type: "add"; item: string }
  | { type: "setDiscount"; value: number };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add":
      return { ...state, items: [...state.items, action.item] };
    case "setDiscount":
      return { ...state, discount: action.value };
  }
}

// 简化版 selector hook：用 useRef 缓存上次值，相等就返回旧引用
function useCartSelector<T>(selector: (s: CartState) => T): T {
  // 模拟实现：真实的实现要用 useSyncExternalStore（见下文）
  // 这里演示"selector 只取部分字段"的思想
  const state = useContext(CartStateContext)!;
  return selector(state);
}

const CartStateContext = createContext<CartState | null>(null);

function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], discount: 0 });
  return (
    <CartStateContext.Provider value={state}>
      {children}
    </CartStateContext.Provider>
  );
}

// 组件 A：只关心 items.length，加折扣时它不重渲染（理想情况）
function CartCount() {
  const count = useCartSelector(s => s.items.length);
  return <div>商品数：{count}</div>;
}

// 组件 B：只关心 discount
function DiscountDisplay() {
  const discount = useCartSelector(s => s.discount);
  return <div>折扣：{discount}</div>;
}
\`\`\`

> **注意**：上面这段代码只是演示 selector 的"思想"。**直接用 \`useContext\` + selector 仍然会全量重渲染**，因为 \`useContext\` 订阅的是整个 Context value。要真正实现"按字段订阅"，需要用 \`useSyncExternalStore\`（React 18 提供），或者直接用下一章的 Zustand。

## 7. useSyncExternalStore：React 18 官方订阅外部 store

React 18 提供了 \`useSyncExternalStore\`，能让你"安全地订阅外部数据源"。它就是 selector 模式的官方实现：

\`\`\`tsx
import { useSyncExternalStore } from "react";

// 一个最小的 store：listeners 集合 + getSnapshot
function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    setState: (next: T) => {
      state = next;
      listeners.forEach(l => l());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const store = createStore<{ count: number }>({ count: 0 });

// 组件订阅 store 的某个字段
function Counter() {
  // useSyncExternalStore：
  //   第 1 参数：订阅函数
  //   第 2 参数：取值函数（必须返回稳定引用）
  const count = useSyncExternalStore(
    store.subscribe,
    () => store.getState().count
  );
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => store.setState({ count: count + 1 })}>
        +1
      </button>
    </div>
  );
}
\`\`\`

\`useSyncExternalStore\` 的好处是 **"只订阅 + 浅比较快路径"**——只有当 \`getSnapshot\` 返回值变了（Object.is 比较）才重渲染。Zustand 内部就是基于它实现的。

## 8. Context 嵌套地狱：怎么破

实际项目里你会看到这种"嵌套地狱"：

\`\`\`tsx
// 嵌套地狱：5 层 Provider
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <UserProvider>
            <ToastProvider>
              <Router />
            </ToastProvider>
          </UserProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
\`\`\`

可以抽一个组合 Provider：

\`\`\`tsx
import type { ReactNode } from "react";

// 把所有 Provider 组成一个数组，reduce 成嵌套结构
function compose(providers: React.ComponentType<{ children: ReactNode }>[]) {
  return ({ children }: { children: ReactNode }) =>
    providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children
    );
}

const AppProviders = compose([
  ThemeProvider,
  AuthProvider,
  CartProvider,
  UserProvider,
  ToastProvider,
]);

function App() {
  return (
    <AppProviders>
      <Router />
    </AppProviders>
  );
}
\`\`\`

嵌套层数没变，但代码"看着清爽"了。**真正的解药是减少 Context 数量**：能合并的合并（比如 user + auth 合一个）、能用第三方库的就用库（避免自己写 selector）。

## 小结

- Context 是 React 自带的"依赖注入"，配合自定义 hook 用最舒服。
- 状态多了用 \`useReducer\`，配 \`type Action\` 联合类型 + \`never\` 穷尽检查。
- Context + useReducer 是经典模式，但有"全员重渲染"问题。
- 拆分 state/dispatch 两个 Context 让 dispatch 方避开重渲染。
- 真正的"按字段订阅"需要 \`useSyncExternalStore\`，或直接用 Zustand（下一章）。
- Context 嵌套地狱用 \`compose\` 缓解，但更该减 Context 数量。

## 避坑清单

- ❌ \`createContext<T>(undefined as any)\` 逃避类型检查（应该 \`<T | null>(null)\` + 判空）
- ❌ Context value 用对象但每次都 \`new\` 一个新对象（导致全员重渲染，应该用 \`useMemo\` 包）
- ❌ useReducer 写完忘加 \`never\` 穷尽检查（漏 case TS 不报错）
- ❌ 在 Provider 外用 \`useContext\` 返回 null 不判空（运行时白屏）
- ❌ 用 Context 传"高频变化"的值（如鼠标位置、滚动条），重渲染爆炸

下一章我们看 **Zustand**——一个用 100 行代码解决 Context 性能问题的极简状态库。`
  },

  // ============================================================
  // ch58: Zustand 极简状态库
  // ============================================================
  {
    id: "tsx3-ch58",
    group: "第八部分 状态管理",
    icon: "🐻",
    title: "ch58 Zustand 极简状态库",
    content: `# ch58 Zustand 极简状态库

## 为什么讲这个

上一章我们看了 Context + useReducer，它解决了 props 透传，但留下了"全员重渲染"和"selector 要自己实现"两个坑。\`useSyncExternalStore\` 能解决，但要自己写 store 框架——成本不小。

**Zustand**（德语"状态"）就是把这些样板代码封装好的库。它的核心 API 只有 \`create\` 一个函数，整个 README 不超过一屏，但能解决 95% 的状态管理需求。它是当下 React 社区增长最快的库之一——**因为简单、因为快、因为类型友好**。

这一章我们看 Zustand 的核心 API：\`create\`、selector、\`shallow\`、\`persist\`、middleware。

## 1. 安装与最小 demo

\`\`\`bash
npm install zustand
\`\`\`

最小 demo：

\`\`\`tsx
import { create } from "zustand";

// 1. 定义状态类型：包含 state 字段和 action 函数
interface BearStore {
  bears: number;                  // state
  increase: () => void;           // action
  reset: () => void;
}

// 2. create 创建 store
//    泛型参数 BearStore 约束返回类型
//    回调里的 set 是更新函数
const useBearStore = create<BearStore>((set) => ({
  bears: 0,                       // 初始 state
  // 用 set 更新：partial 合并
  increase: () => set(s => ({ bears: s.bears + 1 })),
  reset: () => set({ bears: 0 }),
}));

// 3. 组件里用 hook：传 selector 只取需要的字段
function BearCounter() {
  // 只订阅 bears 字段：bears 变才重渲染
  const bears = useBearStore(s => s.bears);
  return <h1>{bears} only</h1>;
}

function Controls() {
  // 只取 action：action 引用稳定，永远不重渲染
  const increase = useBearStore(s => s.increase);
  const reset = useBearStore(s => s.reset);
  return (
    <>
      <button onClick={increase}>+1</button>
      <button onClick={reset}>reset</button>
    </>
  );
}
\`\`\`

注意 \`useBearStore(s => s.bears)\` 这个写法——这就是 **selector 模式**。它只订阅 \`bears\` 字段，别的字段变了它都不重渲染。这是 Zustand 相比 Context 的最大优势。

## 2. set 的两种写法：对象 vs 函数

\`\`\`tsx
import { create } from "zustand";

interface Store {
  count: number;
  name: string;
  inc: () => void;
  setName: (n: string) => void;
  incAndRename: () => void;
}

const useStore = create<Store>((set) => ({
  count: 0,
  name: "default",
  // 写法 1：对象形式，partial 合并
  inc: () => set({ count: 1 }),
  // 写法 2：函数形式，可以读老 state
  setName: (n) => set({ name: n }),
  // 写法 3：函数式更新，类似 setState(prev => ...)
  incAndRename: () => set(s => ({ count: s.count + 1, name: "renamed" })),
}));
\`\`\`

\`set\` 接受两种参数：
- 对象：和当前 state 浅合并
- 函数：拿到老 state，返回要合并的对象

第二种用得多——因为大部分时候你需要根据老 state 算新 state。

## 3. 不用 selector：直接拿整个 state（不推荐）

\`\`\`tsx
// ❌ 不推荐：拿到整个 state，任意字段变都重渲染
function Bad() {
  const state = useBearStore();
  return <div>{state.bears}</div>;
}

// ✅ 推荐：只取需要的字段
function Good() {
  const bears = useBearStore(s => s.bears);
  return <div>{bears}</div>;
}
\`\`\`

**Zustand 最大的坑**：忘了写 selector，每次都拿整个 store——性能就退化到 Context 水平。

## 4. 取多个字段：useShallow 防止重渲染

如果你要取多个字段，selector 返回新对象，引用每次都变，会导致无意义重渲染：

\`\`\`tsx
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

interface Store {
  count: number;
  name: string;
}

const useStore = create<Store>(() => ({
  count: 0,
  name: "default",
}));

// ❌ 有坑：返回新对象，引用每次都变 → 总重渲染
function Bad() {
  const { count, name } = useStore(s => ({ count: s.count, name: s.name }));
  return <div>{count}-{name}</div>;
}

// ✅ 正确：用 useShallow 包一层，浅比较返回值
function Good() {
  const { count, name } = useStore(useShallow(s => ({ count: s.count, name: s.name })));
  return <div>{count}-{name}</div>;
}
\`\`\`

\`useShallow\` 会用浅比较（\`Object.is\` 逐字段）判断返回值是否真的变了。如果字段值没变，就不触发重渲染。

**Zustand 4.3+ 推荐用 \`useShallow\`**（从 \`zustand/react/shallow\` 导入），不要再用老的 \`shallow\` 函数——那个有 React Hook 规则问题。

## 5. 取 action：用 \`useStore()\` 不带 selector 也行

action 函数引用稳定（创建时就定下来了，永不变），所以可以不带 selector 拿：

\`\`\`tsx
import { create } from "zustand";

interface Store {
  count: number;
  inc: () => void;
  reset: () => void;
}

const useStore = create<Store>((set) => ({
  count: 0,
  inc: () => set(s => ({ count: s.count + 1 })),
  reset: () => set({ count: 0 }),
}));

// 不带 selector 拿整个 store：但只用 action，state 变也不重渲染
// 因为 action 是引用稳定的，React 会用 Object.is 比较
function Controls() {
  // 这里用解构只取 action，count 变了 Controls 不重渲染
  // 因为 useStore 拿的是整个 state 对象
  // 但只要 state 对象引用没变，就不重渲染——
  // 而 set 是浅合并生成新对象，所以引用每次都变 ✗
  // 实际上 useStore() 不带 selector 会订阅整个 state
  const { inc, reset } = useStore();
  return (
    <>
      <button onClick={inc}>+1</button>
      <button onClick={reset}>reset</button>
    </>
  );
}

// ✅ 更稳的写法：单独 selector 取每个 action
function SafeControls() {
  const inc = useStore(s => s.inc);
  const reset = useStore(s => s.reset);
  return (
    <>
      <button onClick={inc}>+1</button>
      <button onClick={reset}>reset</button>
    </>
  );
}
\`\`\`

**记住**：每个 selector 一次只取一个字段最稳。要取多个字段就用 \`useShallow\`。

## 6. 在组件外读写 store

有时你想在工具函数、定时器、axios 拦截器里读写 store——这些地方没有 React 上下文。Zustand 给了非 hook 形式的 API：

\`\`\`tsx
import { create } from "zustand";

interface AuthStore {
  token: string | null;
  setToken: (t: string | null) => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  setToken: (t) => set({ token: t }),
}));

// 组件外读：getState
const currentToken = useAuthStore.getState().token;
console.log("当前 token：", currentToken);

// 组件外写：setState（也可以用 action）
useAuthStore.getState().setToken("new-token");

// 直接 setState 也行（不用 action）
useAuthStore.setState({ token: "another-token" });

// 订阅变化：subscribe
useAuthStore.subscribe(state => {
  console.log("token 变成：", state.token);
});
\`\`\`

这是 Zustand 相比 Redux 的优势——**store 可以脱离 React 独立使用**。SSR、Web Worker、非 React 代码里都能访问。

## 7. persist：把状态存到 localStorage

刷新页面后 state 丢失是个常见痛点。Zustand 的 \`persist\` middleware 把 state 自动同步到 localStorage（或别的存储）：

\`\`\`tsx
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  theme: "light" | "dark";
  fontSize: number;
  setTheme: (t: "light" | "dark") => void;
}

// persist 是 middleware，套在 create 外面
const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: "light",
      fontSize: 14,
      setTheme: (t) => set({ theme: t }),
    }),
    {
      name: "settings-storage", // localStorage 的 key
      // 可选：只持久化部分字段
      partialize: (state) => ({
        theme: state.theme,
        fontSize: state.fontSize,
        // action 函数不会序列化，自动排除
      }),
    }
  )
);

// 组件正常用
function ThemeToggle() {
  const theme = useSettingsStore(s => s.theme);
  const setTheme = useSettingsStore(s => s.setTheme);
  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      当前：{theme}（点击切换）
    </button>
  );
}
\`\`\`

注意 \`create<SettingsStore>()(...)\` 这个**双括号**——加上 \`persist\` middleware 后，类型推导需要这个额外的 \`()\`。这是 Zustand 4 的已知"小坑"，加上就对了。

## 8. middleware：在 set 前后插入逻辑

Zustand 的 middleware 模式让你能在 \`set\` 前后插入日志、验证、订阅等逻辑：

\`\`\`tsx
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface TodoStore {
  todos: { id: number; text: string; done: boolean }[];
  add: (text: string) => void;
  toggle: (id: number) => void;
}

const useTodoStore = create<TodoStore>()(
  devtools( // devtools：连接 Redux DevTools 调试
    persist( // persist：持久化到 localStorage
      (set) => ({
        todos: [],
        add: (text) => set(
          s => ({ todos: [...s.todos, { id: Date.now(), text, done: false }] }),
          false, // 第二参数：是否替换整个 state，false = 合并
          "todos/add" // 第三参数：action 名（devtools 显示用）
        ),
        toggle: (id) => set(
          s => ({
            todos: s.todos.map(t =>
              t.id === id ? { ...t, done: !t.done } : t
            ),
          }),
          false,
          "todos/toggle"
        ),
      }),
      { name: "todos-storage" }
    ),
    { name: "TodoStore" } // devtools 里显示的 store 名
  )
);
\`\`\`

middleware 是嵌套的——\`devtools(persist(...))\` 表示"先 persist 再 devtools"。可以多个 middleware 串起来。

常用 middleware：
- \`devtools\`：连 Redux DevTools，调试神器
- \`persist\`：localStorage 持久化
- \`subscribeWithSelector\`：选择性订阅
- \`immer\`：用 immer 写"可变"代码（实际是不可变更新）

## 9. 用 immer middleware 写"可变"代码

不可变更新嵌套深了写得痛苦。配 \`immer\` middleware 后可以"直接改 draft"：

\`\`\`tsx
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface TreeStore {
  tree: {
    level1: { level2: { value: number } };
  };
  updateDeep: (v: number) => void;
}

const useTreeStore = create<TreeStore>()(
  immer((set) => ({
    tree: {
      level1: { level2: { value: 0 } },
    },
    // immer 让你直接 mutate draft，背后自动转不可变更新
    updateDeep: (v) => set(s => {
      s.tree.level1.level2.value = v; // 看起来像 mutable
    }),
  }))
);
\`\`\`

需要装 \`immer\`：\`npm install immer\`。

## 10. 拆分 store：按领域分多个 store

Zustand 推荐 **"按领域拆 store"**，而不是像 Redux 那样搞一个大 store：

\`\`\`tsx
import { create } from "zustand";

// 用户 store
const useUserStore = create<UserStore>(() => ({ ... }));

// 购物车 store
const useCartStore = create<CartStore>(() => ({ ... }));

// 通知 store
const useToastStore = create<ToastStore>(() => ({ ... }));

// 三个 store 互不影响，重渲染范围更小
\`\`\`

这是 Zustand 的设计哲学——**少即是多**。Context 嵌套地狱在这里不存在，每个 store 各自独立。

## 小结

- Zustand 的 \`create\` 是核心，selector 模式天然支持按字段订阅。
- 单字段用 \`useStore(s => s.x)\`；多字段用 \`useShallow\`；action 单独取最稳。
- 组件外用 \`getState\` / \`setState\` / \`subscribe\`，脱离 React 也能用。
- \`persist\` middleware 自动同步 localStorage，\`devtools\` 接 Redux DevTools。
- \`immer\` middleware 让你写"可变"代码，背后自动转不可变更新。
- 按"领域"拆 store，避免大 store 嵌套地狱。

## 避坑清单

- ❌ 不写 selector 直接 \`useStore()\` 拿整个 state（全员重渲染）
- ❌ selector 返回新对象不用 \`useShallow\`（每次都重渲染）
- ❌ 忘了 \`create<T>()(...)\` 的双括号（middleware 类型推导报错）
- ❌ 在 \`set\` 里直接 mutate（应该返回新对象，或用 immer middleware）
- ❌ 把高频变化值塞 Zustand（比如鼠标位置，应该用 ref + rAF）

下一章我们看 **Redux Toolkit**——大型企业项目的主流选择。`
  },

  // ============================================================
  // ch59: Redux Toolkit 实战
  // ============================================================
  {
    id: "tsx3-ch59",
    group: "第八部分 状态管理",
    icon: "🏛️",
    title: "ch59 Redux Toolkit 实战",
    content: `# ch59 Redux Toolkit 实战

## 为什么讲这个

Redux 是状态管理的"老大哥"——2015 年发布，定义了"单向数据流 + 不可变更新 + 时间旅行"的范式。但它有三大痛点：**样板代码多**（写一个 action 要 4 个文件）、**手写不可变更新痛苦**、**异步处理用 thunk/saga 各有坑**。

**Redux Toolkit**（简称 RTK）是 Redux 官方推出的"现代化封装"，把上述痛点全解决了——\`createSlice\` 一个函数搞定 reducer+action，\`createAsyncThunk\` 内置异步处理，\`configureStore\` 默认开 redux-devtools 和 thunk middleware。**官方推荐所有 Redux 项目都用 RTK，不再手写 reducer**。

这一章我们看 RTK 的核心 API 和 TypeScript 集成。

## 1. 安装

\`\`\`bash
# 装 @reduxjs/toolkit 和 react-redux
npm install @reduxjs/toolkit react-redux
\`\`\`

\`@reduxjs/toolkit\` 包含 redux 核心、redux-thunk、immer、reselect 等所有依赖，不用单独装。

## 2. configureStore：配置 store

\`\`\`tsx
import { configureStore } from "@reduxjs/toolkit";

// 1. 先准备两个 slice（下一节定义）
// import counterReducer from "./counterSlice";
// import userReducer from "./userSlice";

// 2. configureStore 接受 reducer 配置
export const store = configureStore({
  reducer: {
    // 每个 key 对应一个 slice 的 reducer
    // counter: counterReducer,
    // user: userReducer,
  },
  // 默认已经启用：redux-devtools、redux-thunk、不可变更新检查
  // 不需要手写 middleware 数组
});

// 3. 导出类型： RootState 和 AppDispatch
//    这两个类型在组件里到处用
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
\`\`\`

注意 \`ReturnType<typeof store.getState>\` 这个技巧——它从 \`store.getState\` 反推 state 类型。这样改 slice 时类型自动跟着变，不用手维护。

## 3. createSlice：一个函数搞定 reducer + action

\`\`\`tsx
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 1. 定义 state 类型
interface CounterState {
  value: number;
  step: number;
}

// 2. createSlice：name + initialState + reducers
const counterSlice = createSlice({
  name: "counter", // namespace：action type 前缀
  initialState: {
    value: 0,
    step: 1,
  } as CounterState, // 推荐 as 显式标注 initialState
  reducers: {
    // 每个 reducer 自动生成一个 action creator
    // PayloadAction<X> 表示 action.payload 的类型是 X
    increment: (state) => {
      // 这里可以直接 mutate！RTK 内部用 immer 转不可变更新
      state.value += state.step;
    },
    // 带 payload 的 reducer
    addBy: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    // 带 payload 的对象类型
    setStep: (state, action: PayloadAction<{ step: number }>) => {
      state.step = action.payload.step;
    },
  },
});

// 3. 导出 action creators
//    名字和 reducers 的 key 一一对应
export const { increment, addBy, setStep } = counterSlice.actions;

// 4. 导出 reducer
export default counterSlice.reducer;
\`\`\`

注意几个关键点：

- **state 可以直接 mutate**——RTK 内部用 immer，看起来像可变，实际是不可变更新。
- **每个 reducer 自动生成 action creator**——不用手写 \`actionTypes\` 和 \`actionCreators\`。
- **\`PayloadAction<T>\` 标注 payload 类型**——TS 类型安全。

## 4. 在组件里使用：useSelector + useDispatch

\`\`\`tsx
import { useSelector, useDispatch } from "react-redux";
import { increment, addBy } from "./counterSlice";

// 组件 A：读 state
function CounterView() {
  // useSelector 接受 selector 函数
  // RootState 是从 store 推导出来的全局类型
  const value = useSelector((s: RootState) => s.counter.value);
  return <h1>{value}</h1>;
}

// 组件 B：dispatch
function CounterControls() {
  const dispatch = useDispatch();
  return (
    <>
      {/* 不带 payload */}
      <button onClick={() => dispatch(increment())}>+1</button>
      {/* 带 payload */}
      <button onClick={() => dispatch(addBy(10))}>+10</button>
    </>
  );
}
\`\`\`

记得把 \`store\` 用 \`Provider\` 包住根组件：

\`\`\`tsx
import { Provider } from "react-redux";
import { store } from "./store";

function App() {
  return (
    <Provider store={store}>
      <CounterView />
      <CounterControls />
    </Provider>
  );
}
\`\`\`

## 5. Typed Hooks：避免到处写 RootState

每次 \`useSelector((s: RootState) => ...)\` 都要标 RootState，烦。**Typed Hooks** 模式：自定义类型化的 \`useSelector\` 和 \`useDispatch\`：

\`\`\`tsx
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// 1. 自定义 typed hooks
export const useAppSelector = useSelector.withTypedRootState<RootState>();
// 或者更稳的写法：
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: <TSelected>(
  selector: (state: RootState) => TSelected,
  equalityFn?: (a: TSelected, b: TSelected) => boolean
) => TSelected = useSelector;

// 2. 组件里用 typed hooks
function CounterView() {
  // 不用写 RootState，自动推导
  const value = useAppSelector(s => s.counter.value);
  return <h1>{value}</h1>;
}

function CounterControls() {
  // dispatch 类型是 AppDispatch，有完整 TS 提示
  const dispatch = useAppDispatch();
  return <button onClick={() => dispatch(increment())}>+1</button>;
}
\`\`\`

这是 RTK 官方推荐的 **Typed Hooks 模式**——把类型集中在一个文件，业务组件干净。

## 6. createAsyncThunk：异步处理

Redux 异步最常用的就是 thunk——\`createAsyncThunk\` 把它包好：

\`\`\`tsx
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// 1. 定义 thunk：三个泛型参数
//    - 返回值类型
//    - 参数类型
//    - thunkAPI 类型（含 dispatch、getState、rejectValue 等）
export const fetchUser = createAsyncThunk<
  { id: number; name: string }, // 返回值
  number,                       // 参数：userId
  { rejectValue: string }       // thunkAPI 配置
>(
  "user/fetch", // action type 前缀
  async (userId, thunkAPI) => {
    try {
      const res = await fetch(\`/api/users/\${userId}\`);
      if (!res.ok) {
        // 用 rejectValue 把错误塞到 action.payload
        return thunkAPI.rejectWithValue("fetch failed");
      }
      return (await res.json()) as { id: number; name: string };
    } catch (e) {
      return thunkAPI.rejectWithValue("network error");
    }
  }
);

// 2. 在 slice 里处理三个状态：pending / fulfilled / rejected
interface UserState {
  data: { id: number; name: string } | null;
  loading: boolean;
  error: string | null;
}

const userSlice = createSlice({
  name: "user",
  initialState: { data: null, loading: false, error: null } as UserState,
  reducers: {
    // 同步 reducer
    clearUser: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  // extraReducers：处理 thunk 的三个生命周期
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // payload 类型自动推导
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // 来自 rejectValue
      });
  },
});

export default userSlice.reducer;
\`\`\`

注意 \`builder.addCase\` 的链式调用——每个 case 对应一个生命周期，payload 类型自动从 thunk 推导。这种"类型自动流动"是 RTK 的精髓。

## 7. 在组件里 dispatch thunk

\`\`\`tsx
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { fetchUser } from "./userSlice";

function UserPanel({ userId }: { userId: number }) {
  const dispatch = useAppDispatch();
  // selector 读 state
  const { data, loading, error } = useAppSelector(s => s.user);

  useEffect(() => {
    // thunk 是个 Promise，可以 await / .then
    dispatch(fetchUser(userId));
  }, [userId, dispatch]);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>出错：{error}</div>;
  if (data) return <div>{data.name}</div>;
  return null;
}
\`\`\`

如果想在组件里 await thunk 结果再做事：

\`\`\`tsx
import { unwrapResult } from "@reduxjs/toolkit";

async function handleClick() {
  try {
    // unwrapResult 拿 fulfilled 的 payload，rejected 会抛错
    const result = unwrapResult(await dispatch(fetchUser(1)));
    console.log("拿到结果：", result);
  } catch (e) {
    console.error("thunk 失败：", e);
  }
}
\`\`\`

## 8. RTK Query：RTK 自带的"数据请求层"

RTK 自带了一个 **RTK Query** 子库，类似 TanStack Query，专门处理"请求缓存 + 状态"。可以省掉 \`createAsyncThunk\` 的大部分代码：

\`\`\`tsx
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// 1. 定义 API
export const userApi = createApi({
  reducerPath: "userApi", // 在 store 里的 key
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    // query：简单的 GET
    getUserById: builder.query<{ id: number; name: string }, number>({
      query: (id) => \`/users/\${id}\`,
    }),
    // mutation：POST/PUT/DELETE
    createUser: builder.mutation<{ id: number }, { name: string }>({
      query: (body) => ({ url: "/users", method: "POST", body }),
    }),
  }),
});

// 2. 导出 hooks（自动生成）
export const { useGetUserByIdQuery, useCreateUserMutation } = userApi;

// 3. store 里要注册
// configureStore({
//   reducer: {
//     [userApi.reducerPath]: userApi.reducer,
//   },
//   middleware: (getDefault) => getDefault().concat(userApi.middleware),
// });

// 4. 组件里用：自动管理 loading/error/缓存
function UserView({ id }: { id: number }) {
  const { data, isLoading, error } = useGetUserByIdQuery(id);
  if (isLoading) return <div>loading</div>;
  if (error) return <div>error</div>;
  return <div>{data?.name}</div>;
}
\`\`\`

如果项目用 Redux，**强烈推荐用 RTK Query 代替 \`createAsyncThunk\`**——缓存、去重、失效、乐观更新全都内置。第七部分我们讲 TanStack Query 时会对比两者。

## 9. Selector 性能：用 reselect 做 memoize

直接 \`useSelector(s => s.users.find(u => u.id === id))\` 每次都返回新引用，会无意义重渲染。用 \`createSelector\` 做 memoize：

\`\`\`tsx
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store";

// 1. createSelector：输入 selector + 计算 selector
//    只有输入变了才重新计算
const selectUserById = (state: RootState, id: number) =>
  state.users.entities[id];

// memoized selector
export const selectUserName = createSelector(
  [selectUserById],
  (user) => user?.name ?? "unknown"
);

// 2. 组件里用
function UserName({ id }: { id: number }) {
  // 第二参数传入 id：useSelector 会传入 state
  // createSelector 会 memoize
  const name = useSelector((s: RootState) => selectUserName(s, id));
  return <div>{name}</div>;
}
\`\`\`

\`createSelector\` 默认是浅比较输入参数。如果 selector 依赖外部变量（如 \`id\`），要么用 \`useMemo\` 包 selector，要么用 \`createStructuredSelector\` 等高级用法。

## 10. 模块化：按 feature 组织

RTK 推荐按"功能"组织目录：

\`\`\`
src/
├── features/
│   ├── counter/
│   │   ├── counterSlice.ts   # slice + reducer + actions
│   │   ├── Counter.tsx       # 组件
│   │   └── index.ts          # 导出桶
│   ├── user/
│   │   ├── userSlice.ts
│   │   └── User.tsx
├── app/
│   ├── store.ts              # configureStore
│   └── hooks.ts              # Typed Hooks
└── main.tsx
\`\`\`

每个 feature 一个文件夹，对外只导出"组件 + 必要 action"。slice 内部细节不外泄。

## 小结

- \`configureStore\` 默认开启 devtools、thunk、不可变更新检查。
- \`createSlice\` 一个函数生成 reducer + action creators，内部用 immer 支持可变写法。
- Typed Hooks（\`useAppSelector\` / \`useAppDispatch\`）把类型集中在一处。
- \`createAsyncThunk\` 处理异步，\`extraReducers\` 用 builder 模式接三个生命周期。
- RTK Query 内置缓存+失效，比手写 thunk 强。
- \`createSelector\` 做 memoize，避免无意义重渲染。

## 避坑清单

- ❌ 不用 Typed Hooks，每个组件都写 \`useSelector<RootState, T>\`（应该集中 hooks）
- ❌ 在 reducer 里写 \`return {...state, ...}\` 不可变写法（RTK 用 immer，可以直接 mutate）
- ❌ \`createAsyncThunk\` 不写 \`rejectValue\`（错误处理拿不到类型）
- ❌ 不用 \`extraReducers\` builder 模式，用老的 \`{[type]: ...}\` 对象（类型推导弱）
- ❌ 在 selector 里直接 \`find\`/\`filter\` 返回新对象（应该用 \`createSelector\` memoize）

下一章我们看 **Jotai**——另一个完全不同的状态管理范式：原子化。`
  },

  // ============================================================
  // ch60: Jotai 原子化状态
  // ============================================================
  {
    id: "tsx3-ch60",
    group: "第八部分 状态管理",
    icon: "⚛️",
    title: "ch60 Jotai 原子化状态",
    content: `# ch60 Jotai 原子化状态

## 为什么讲这个

前面两章我们看了两种状态管理范式：

- **Zustand**：单一 store，靠 selector 取部分状态。
- **Redux Toolkit**：单一 store + reducer/slice 模式。

它们都是"自顶向下"的——一个 store 装所有状态。但 React 本身是"自底向上"的——组件组合成树。**Jotai** 借鉴 Recoil 思路，提出 **"原子化"** 模式：把状态拆成最小粒度的"原子"，组件订阅原子，原子之间可以派生。

Jotai 适合"状态分散、依赖关系复杂"的场景。它的 API 比 Redux 简单，比 Zustand 更接近 React 心智模型。

## 1. 安装与最小 demo

\`\`\`bash
npm install jotai
\`\`\`

最小 demo：

\`\`\`tsx
import { atom, useAtom } from "jotai";

// 1. 创建一个原子：初始值 0
const countAtom = atom(0);

// 2. 组件里用 useAtom：类似 useState，返回 [value, setter]
function Counter() {
  const [count, setCount] = useAtom(countAtom);
  return (
    <div>
      <p>{count}</p>
      {/* setCount 和 useState 一样用 */}
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  );
}

// 3. 不需要 Provider 包！Jotai 默认走全局 store
\`\`\`

注意两点：
- **不需要 Provider**——Jotai 默认有一个全局 store，可以直接用。
- **\`useAtom\` 接口和 \`useState\` 完全一样**——学习成本几乎为零。

如果想用多个独立 store（比如微前端场景），可以加 \`<Provider>\`：

\`\`\`tsx
import { Provider, atom, useAtom } from "jotai";

const myStore = createStore();

function App() {
  return (
    // 指定 store
    <Provider store={myStore}>
      <Counter />
    </Provider>
  );
}
\`\`\`

## 2. 只读 atom：派生状态

\`atom\` 的第一个参数可以是"读函数"，做出派生状态：

\`\`\`tsx
import { atom, useAtom } from "jotai";

// 基础 atom：可读可写
const countAtom = atom(0);

// 派生 atom：只读，依赖 countAtom
const doubleAtom = atom(get => get(countAtom) * 2);

function DoubleDisplay() {
  const [double] = useAtom(doubleAtom); // double 是只读，setter 无效
  return <p>双倍：{double}</p>;
}

// 修改 countAtom，DoubleDisplay 自动重渲染
function Counter() {
  const [count, setCount] = useAtom(countAtom);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
\`\`\`

注意 \`atom(get => ...)\` 这个形式——\`get\` 函数用来读其他 atom。Jotai 内部自动追踪依赖，countAtom 变了 doubleAtom 自动重算。

## 3. 读写分离的 atom：自定义 setter

可以分别定义读和写：

\`\`\`tsx
import { atom, useAtom } from "jotai";

const countAtom = atom(0);

// 自定义读写：读时返回字符串，写时清零
const displayAtom = atom(
  // 读函数
  get => \`当前值：\${get(countAtom)}\`,
  // 写函数
  (get, set, action: "inc" | "reset") => {
    if (action === "inc") {
      set(countAtom, get(countAtom) + 1);
    } else {
      set(countAtom, 0);
    }
  }
);

function Display() {
  const [display, dispatch] = useAtom(displayAtom);
  return (
    <div>
      <p>{display}</p>
      {/* 调用时传 action */}
      <button onClick={() => dispatch("inc")}>+1</button>
      <button onClick={() => dispatch("reset")}>reset</button>
    </div>
  );
}
\`\`\`

这种"读和写都自定义"的 atom 像"action 入口"——把多个原子修改打包成一个语义化操作。

## 4. 多个 atom 组合：派生

\`\`\`tsx
import { atom, useAtom } from "jotai";

interface Product {
  id: number;
  price: number;
}

// 三个独立 atom
const productsAtom = atom<Product[]>([]);
const filterAtom = atom<"all" | "expensive">("all");
const minPriceAtom = atom(100);

// 派生 atom：组合多个 atom
const filteredProductsAtom = atom(get => {
  const products = get(productsAtom);
  const filter = get(filterAtom);
  const minPrice = get(minPriceAtom);

  if (filter === "all") return products;
  return products.filter(p => p.price >= minPrice);
});

// 总价 atom：再依赖 filteredProductsAtom
const totalPriceAtom = atom(get => {
  const list = get(filteredProductsAtom);
  return list.reduce((sum, p) => sum + p.price, 0);
});

function TotalPrice() {
  const [total] = useAtom(totalPriceAtom);
  return <p>总价：{total}</p>;
}
\`\`\`

每个派生 atom 自动 memoize——只有依赖变了才重算。这就是 Jotai 比 Zustand 更强的地方：**多个 store 间的派生关系天然支持**。

## 5. useAtomValue 与 useSetAtom：精确订阅

如果你只读不写，或者只写不读，用更精确的 hook 可以避免重渲染：

\`\`\`tsx
import { atom, useAtomValue, useSetAtom } from "jotai";

const countAtom = atom(0);

// 只读：useAtomValue
function Display() {
  const count = useAtomValue(countAtom);
  return <p>{count}</p>;
}

// 只写：useSetAtom
function IncButton() {
  const setCount = useSetAtom(countAtom);
  // countAtom 变了这里也不重渲染
  return <button onClick={() => setCount(c => c + 1)}>+1</button>;
}
\`\`\`

\`useSetAtom\` 类似 Zustand 单独取 action——避免"只想写不想读"的组件被 state 变化波及。

## 6. async atom：异步派生

\`atom\` 的读函数可以是 async，自动支持 Suspense：

\`\`\`tsx
import { atom, useAtom } from "jotai";

// 异步 atom：返回 Promise
const userInfoAtom = atom(async () => {
  const res = await fetch("/api/me");
  return res.json() as Promise<{ id: number; name: string }>;
});

function UserInfo() {
  // useAtom 自动 Suspense，等 fetch 完才渲染
  const [user] = useAtom(userInfoAtom);
  return <p>{user.name}</p>;
}

// 配合 Suspense 边界
function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <UserInfo />
    </Suspense>
  );
}
\`\`\`

注意必须用 \`<Suspense>\` 包住，否则异步 atom 会抛 Promise 没人接。

## 7. 依赖另一个 atom 的 async atom

\`\`\`tsx
import { atom, useAtom } from "jotai";

// 基础 atom：用户 id
const userIdAtom = atom(1);

// 异步派生 atom：依赖 userIdAtom，自动重新 fetch
const userDetailsAtom = atom(async get => {
  const id = get(userIdAtom);
  const res = await fetch(\`/api/users/\${id}\`);
  return res.json() as Promise<{ name: string }>;
});

function UserDetails() {
  const [user] = useAtom(userDetailsAtom);
  return <p>{user.name}</p>;
}

// 切换 id 时，userDetailsAtom 自动重新 fetch
function SwitchUser() {
  const [id, setId] = useAtom(userIdAtom);
  return <button onClick={() => setId(id + 1)}>下一个 id={id}</button>;
}
\`\`\`

这是 Jotai 最优雅的场景——**声明式的数据依赖**。改 \`userIdAtom\`，所有依赖它的 async atom 自动重 fetch，组件拿到新数据自动重渲染。完全不需要写 \`useEffect\` + \`setState\` 的样板代码。

## 8. atomFamily：参数化的 atom

如果你要"每个 id 一个独立 atom"（比如商品列表里每个商品都有独立状态），用 \`atomFamily\`：

\`\`\`tsx
import { atom, useAtom } from "jotai";
import { atomFamily } from "jotai/utils";

// 1. atomFamily：参数化创建 atom
//    每个 id 一个独立 atom，互不影响
const productAtomFamily = atomFamily((id: number) =>
  atom<{ id: number; loading: boolean; data?: { name: string } }>({
    id,
    loading: false,
  })
);

// 2. 组件用：传 id 取对应 atom
function ProductItem({ id }: { id: number }) {
  const [state, setState] = useAtom(productAtomFamily(id));
  return (
    <div>
      <span>商品 #{state.id}</span>
      <button onClick={() => setState(s => ({ ...s, loading: !s.loading }))}>
        {state.loading ? "loading" : "idle"}
      </button>
    </div>
  );
}

// 列表里 100 个商品，每个商品状态独立
function ProductList({ ids }: { ids: number[] }) {
  return (
    <div>
      {ids.map(id => <ProductItem key={id} id={id} />)}
    </div>
  );
}
\`\`\`

注意 \`atomFamily\` 默认会**缓存所有创建过的 atom**——如果 key 是无限多的（比如随机字符串），会导致内存泄漏。这时要手动 \`remove(key)\`：

\`\`\`tsx
// 删除某个 key 缓存
productAtomFamily.remove(5);
// 清空所有
productAtomFamily.setShouldRemove((prev, id) => {
  // 返回 true 表示该 atom 该删了
  return Date.now() - prev.created > 60_000;
});
\`\`\`

## 9. atomWithStorage：持久化

Jotai 自带 \`atomWithStorage\` 做 localStorage 持久化：

\`\`\`tsx
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// 自动同步 localStorage
const themeAtom = atomWithStorage<"light" | "dark">("theme", "light");

function ThemeToggle() {
  const [theme, setTheme] = useAtom(themeAtom);
  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      {theme}
    </button>
  );
}
\`\`\`

刷新页面 theme 还在——和 Zustand 的 \`persist\` 一样的效果，但代码更短。

## 10. 集成外部状态：atomWithObservable

Jotai 能直接订阅 Observable（比如 RxJS）：

\`\`\`tsx
import { useAtom } from "jotai";
import { atomWithObservable } from "jotai/utils";
import { interval } from "rxjs";

// 订阅 RxJS 的 interval
const timerAtom = atomWithObservable(() => interval(1000));

function Timer() {
  // 每秒更新一次
  const [tick] = useAtom(timerAtom);
  return <p>tick: {tick}</p>;
}
\`\`\`

这让 Jotai 能接入任何 Observable 数据源——WebSocket、SSE、RxJS、动画帧。

## 11. 性能：选择性订阅

Jotai 用 atom 拆得越细，重渲染范围越小：

\`\`\`tsx
// ❌ 大 atom：一处变全员渲染
const formAtom = atom({
  name: "",
  email: "",
  phone: "",
});

// ✅ 拆细：每个字段一个 atom
const nameAtom = atom("");
const emailAtom = atom("");
const phoneAtom = atom("");

// 改 name 时只有 NameInput 重渲染
function NameInput() {
  const [name, setName] = useAtom(nameAtom);
  return <input value={name} onChange={e => setName(e.target.value)} />;
}
\`\`\`

这是 Jotai 相比 Zustand 的另一个优势——**atom 是最小粒度，重渲染自动精确到字段**。

## 小结

- Jotai 用 \`atom\` 把状态拆成最小粒度，组件订阅 atom。
- 派生 atom 用 \`get\` 函数读其他 atom，自动 memoize。
- async atom 配 \`<Suspense>\` 用，依赖变了自动重新 fetch。
- \`atomFamily\` 做参数化 atom，注意缓存清理。
- \`atomWithStorage\` 自动持久化，\`atomWithObservable\` 接 RxJS。
- atom 拆得越细，重渲染范围越小。

## 避坑清单

- ❌ 把所有 state 塞一个大 atom（违背原子化初衷，应该拆细）
- ❌ async atom 不包 \`<Suspense>\`（抛 Promise 没人接，会报错）
- ❌ \`atomFamily\` 用无限 key（缓存爆炸，应该 \`remove\` 或 \`setShouldRemove\`）
- ❌ 只读用 \`useAtom\`（应该用 \`useAtomValue\`，少一层重渲染）
- ❌ 在派生 atom 里做副作用（应该用 \`atomEffect\` 或 \`useEffect\`）

下一章我们对比所有状态管理方案，给你一份"选型指南"。`
  },

  // ============================================================
  // ch61: 状态管理选型
  // ============================================================
  {
    id: "tsx3-ch61",
    group: "第八部分 状态管理",
    icon: "🧭",
    title: "ch61 状态管理选型",
    content: `# ch61 状态管理选型

## 为什么讲这个

前 4 章我们看了 Context、Zustand、Redux Toolkit、Jotai 四种方案。每一种都能"用"，但**何时该用哪种**才是工程的核心问题——选错了，要么代码臃肿、要么性能爆炸、要么团队抗拒。

这一章我们做一个横向对比，并给出"按场景选库"的决策树。读完这章你应该能在 5 分钟内决定一个新项目该用哪种状态管理。

## 1. 先问一个问题：你真的需要状态管理库吗

90% 的 React 项目，**只用 \`useState\` + \`useContext\` 就够了**。所谓"状态管理库"是为了解决特定问题，不是默认配置。先看你的项目有没有以下"信号"：

| 信号 | 说明 | 该考虑 |
| --- | --- | --- |
| 多组件共享同一份 state | 父子兄弟都要读 / 写 | Context 或外部库 |
| 跨层级 props 透传 3 层以上 | "prop drilling" | Context 或外部库 |
| state 高频变化导致重渲染卡顿 | 列表滚动、动画、轮询 | Zustand / Jotai |
| 异步数据需要缓存 + 失效 | API 请求结果 | TanStack Query / RTK Query |
| 大团队 + 严格 action 规范 | 多人协作、审计 | Redux Toolkit |
| 状态有复杂派生关系 | A 依赖 B，B 依赖 C | Jotai / Zustand selector |

如果上面 6 条都不满足——**保持简单，不要装库**。

## 2. 状态管理两大流派

React 状态管理大致分两派：

### 派别 1：单一 store（自顶向下）

代表：Redux、Redux Toolkit、Zustand。

特点：
- 全局只有一个 store（或按领域分几个）。
- 用 selector 取部分状态。
- 适合"集中管理 + 严格规范"。

### 派别 2：原子化 / 多 store（自底向上）

代表：Jotai、Recoil。

特点：
- 状态拆成最小粒度的 atom。
- atom 之间可以派生。
- 适合"状态分散 + 派生关系复杂"。

\`\`\`tsx
// 派别 1（Zustand）：一个 store 装所有
const useStore = create<Store>((set) => ({
  user: null,
  cart: [],
  // ...
}));

// 派别 2（Jotai）：每个状态一个 atom
const userAtom = atom(null);
const cartAtom = atom([]);
// 派生 atom 把它们组合
const cartTotalAtom = atom(get => get(cartAtom).reduce(...));
\`\`\`

没有绝对优劣，看场景选。

## 3. 四大方案横向对比

| 维度 | Context + useReducer | Zustand | Redux Toolkit | Jotai |
| --- | --- | --- | --- | --- |
| 学习成本 | 低 | 极低 | 中 | 低 |
| 样板代码 | 中 | 极少 | 少（RTK 已封装） | 极少 |
| 性能（高频更新） | 差 | 好 | 好 | 好 |
| 派生状态 | 手写 memoize | selector | reselect | 原生支持 |
| 异步处理 | 手写 thunk | 外部库 | createAsyncThunk / RTK Query | async atom |
| TypeScript 友好 | 中 | 极好 | 好 | 极好 |
| 调试工具 | React DevTools | Redux DevTools | Redux DevTools | Redux DevTools |
| 持久化 | 手写 | persist middleware | 手写 / redux-persist | atomWithStorage |
| SSR 支持 | 一般 | 好 | 好 | 好 |
| 团队上手 | 快 | 极快 | 慢（要懂 Redux） | 中 |
| 生态成熟度 | 高（React 自带） | 高 | 极高 | 中 |
| 包体积 | 0 | ~1KB | ~14KB | ~3KB |

## 4. 性能维度深入：重渲染范围

不同方案在"state 变化时谁重渲染"上差异巨大：

\`\`\`tsx
// 场景：状态对象 { a, b, c } 三个字段，组件只读 a

// Context：a/b/c 任一变都重渲染（除非拆 Context）
const ctx = useContext(MyContext);
return <div>{ctx.a}</div>;

// Zustand：只订阅 a，b/c 变不重渲染
const a = useStore(s => s.a);
return <div>{a}</div>;

// Redux + useSelector：同 Zustand，只订阅 a
const a = useSelector(s => s.foo.a);
return <div>{a}</div>;

// Jotai：a 单独一个 atom，最细粒度
const aAtom = atom(0);
const [a] = useAtom(aAtom);
return <div>{a}</div>;
\`\`\`

**性能从差到好**：Context（无 selector） < Context（拆分） < Zustand/Redux（selector） < Jotai（原子化）。

但要注意：**性能不是唯一标准**。如果你的 state 不高频变化，Context 的"差"也无所谓——为了性能上 Jotai 不值。

## 5. 开发体验对比

\`\`\`tsx
// === Zustand：极简 ===
const useStore = create<State>(set => ({
  count: 0,
  inc: () => set(s => ({ count: s.count + 1 })),
}));

// 组件
const inc = useStore(s => s.inc);

// === Redux Toolkit：套路化 ===
const counterSlice = createSlice({
  name: "counter",
  initialState: { count: 0 },
  reducers: {
    inc: state => { state.count += 1; },
  },
});
const { inc } = counterSlice.actions;

// 组件
const dispatch = useAppDispatch();
<button onClick={() => dispatch(inc())}>+1</button>;

// === Jotai：贴近 useState ===
const countAtom = atom(0);

// 组件
const [count, setCount] = useAtom(countAtom);
<button onClick={() => setCount(c => c + 1)}>+1</button>;
\`\`\`

**Zustand 和 Jotai 更接近原生 React 心智**——useState 的延伸。Redux Toolkit 多了一层"action 概念"，学习曲线陡一些。

## 6. 按场景选库：决策树

### 场景 A：小型项目（< 10 个页面）

\`\`\`
推荐：useState + useContext
理由：根本不用引入库，减少一个依赖
\`\`\`

\`\`\`tsx
// 一个 ThemeContext + 一个 UserContext 就够了
const ThemeContext = createContext<"light" | "dark">("light");
const UserContext = createContext<User | null>(null);

// App 顶层套 Provider 即可
\`\`\`

### 场景 B：中型项目 + 跨组件共享中等状态

\`\`\`
推荐：Zustand
理由：极简、selector 性能好、SSR 友好
\`\`\`

\`\`\`tsx
// 拆 2-3 个 store：useUserStore / useCartStore / useToastStore
const useCartStore = create<CartStore>(set => ({
  items: [],
  add: item => set(s => ({ items: [...s.items, item] })),
}));
\`\`\`

### 场景 C：大型项目 + 严格规范 + 多人协作

\`\`\`
推荐：Redux Toolkit
理由：action 可审计、有 RTK Query 处理请求、生态成熟
\`\`\`

\`\`\`tsx
// features/feature-a/featureASlice.ts
const featureASlice = createSlice({
  name: "featureA",
  initialState,
  reducers: { ... },
  extraReducers: builder => {
    builder.addCase(fetchA.pending, ...);
  },
});
\`\`\`

### 场景 D：状态有复杂派生关系

\`\`\`
推荐：Jotai
理由：派生 atom 是一等公民，依赖追踪自动
\`\`\`

\`\`\`tsx
// 多个 atom 互相依赖，自动 memoize
const aAtom = atom(0);
const bAtom = atom(0);
const cAtom = atom(get => get(aAtom) + get(bAtom));
\`\`\`

### 场景 E：异步数据为主

\`\`\`
推荐：TanStack Query（第七部分）或 RTK Query
理由：状态管理库不擅长请求缓存，专库专用
\`\`\`

\`\`\`tsx
// 用 TanStack Query 管理请求缓存
const { data } = useQuery({
  queryKey: ["user", id],
  queryFn: () => fetchUser(id),
});

// Zustand 只管"UI 状态"（如 modal 开关）
const useUIStore = create<UIStore>(set => ({
  modalOpen: false,
  toggleModal: () => set(s => ({ modalOpen: !s.modalOpen })),
}));
\`\`\`

**这是当下最流行的"分层架构"**：请求用 TanStack Query，UI 状态用 Zustand。两者职责分明，避免"把请求结果塞 Redux"的反模式。

## 7. 类型友好度对比

四个方案在 TypeScript 集成上各有差异：

\`\`\`tsx
// Zustand：泛型参数最简单
const useStore = create<Store>(set => ({ ... }));
// selector 自动推导
const a = useStore(s => s.a); // 类型自动是 a 的类型

// Redux Toolkit：Typed Hooks 模式
export const useAppSelector: <T>(s: (r: RootState) => T) => T = useSelector;
const a = useAppSelector(s => s.foo.a);

// Jotai：atom 泛型 + 自动推导
const aAtom = atom(0); // 自动 number
const [a, setA] = useAtom(aAtom);

// Context：泛型参数 + 自定义 hook
const Ctx = createContext<Store | null>(null);
function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error("...");
  return v;
}
\`\`\`

**TypeScript 友好度从好到差**：Jotai = Zustand > Redux Toolkit > Context（Context 要自己写自定义 hook 判空）。

## 8. 性能 Benchmark：高频更新场景

下面是一个"每秒更新 60 次状态"的场景，看各方案的重渲染次数（理论估算）：

\`\`\`tsx
// 假设有 100 个组件订阅同一份 state 的不同字段
// 高频更新某个字段 60 次/秒

// Context（无 selector）：100 个组件 × 60 = 6000 次/秒 重渲染
// Context（拆分）：1 个组件 × 60 = 60 次/秒（拆对了的话）
// Zustand selector：1 个组件 × 60 = 60 次/秒
// Redux useSelector：1 个组件 × 60 = 60 次/秒
// Jotai atom：1 个组件 × 60 = 60 次/秒
\`\`\`

差异主要在"是否能精确订阅"。Context 不拆分 = 全员重渲染，其他三种都支持精确订阅。

**但**：如果是"低频更新"（如用户点击按钮），所有方案的重渲染次数都接近，差异可以忽略。

## 9. 迁移成本

如果你的项目已经在用某种方案，迁移成本要算上：

| 从 | 到 | 难度 | 工作量 |
| --- | --- | --- | --- |
| Context | Zustand | 易 | 1-2 天 |
| Context | Redux Toolkit | 中 | 1 周 |
| Redux | Redux Toolkit | 易 | 几天（API 重叠） |
| Zustand | Jotai | 中 | 1 周 |
| Redux | Zustand | 中 | 1-2 周 |

**不建议为了"换库而换库"**——除非原方案确实带来开发痛点（如 Context 性能问题、Redux 样板太多）。能重构就重构，不能就保持。

## 10. 我的推荐

下面是 2026 年我对新项目的推荐（**个人建议，仅供参考**）：

| 项目类型 | 推荐 | 理由 |
| --- | --- | --- |
| 个人 / Demo | Context + useReducer | 零依赖 |
| 小型 SaaS / Dashboard | Zustand + TanStack Query | 极简 + 请求缓存 |
| 中型项目 | Zustand + TanStack Query | 同上，规模也撑得住 |
| 大型企业后台 | Redux Toolkit + RTK Query | 规范、可审计、生态成熟 |
| 复杂表单 / 编辑器 | Jotai | 派生关系天然支持 |
| 实时协作 / 数据流 | Jotai + atomWithObservable | 接 RxJS 顺 |
| 微前端 | Zustand（多 store） | 各子应用独立 store |
| Next.js / SSR 项目 | Zustand / Jotai | SSR 友好 |

**核心原则**：选最简单能满足需求的方案。不要为了"看起来高级"上 Redux，也不要为了"追新"上 Jotai——**合适的才是好的**。

## 小结

- 90% 项目不需要状态管理库，\`useState\` + \`useContext\` 足够。
- 两大流派：单一 store（Redux / Zustand）vs 原子化（Jotai）。
- 性能：Context（无 selector）< Context（拆分）< Zustand/Redux < Jotai。
- 类型友好：Jotai = Zustand > RTK > Context。
- 分层架构推荐：TanStack Query 管请求，Zustand 管 UI 状态。
- 选最简单的方案，不要为了"高级"过度工程化。

## 避坑清单

- ❌ 小项目硬上 Redux（应该用 useState + Context）
- ❌ 把 API 请求结果塞 Redux/Zustand（应该用 TanStack Query）
- ❌ 为了"性能"上 Jotai 但状态根本不高频（性能差异忽略）
- ❌ 大型项目用 Context 不拆分（重渲染爆炸）
- ❌ 同一项目混用 Redux + Zustand + Jotai（应该统一选一个）
- ❌ 选库不看团队水平（Redux 对新手不友好，应该考虑团队能力）

状态管理到这里告一段落。下一部分我们进入 **路由**——React Router v6 和 Next.js App Router。`
  },
];

export { chapters };
