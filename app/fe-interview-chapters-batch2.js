// =============================================================
// 前端面试技巧指南 - 第 2 批章节（框架与工程化 5 章）
// =============================================================

export const chapters = [
  // ============================================================
  // 第 6 章：React 面试高频考点
  // ============================================================
  {
    id: "fe-react",
    group: "框架与工程化",
    icon: "⚛️",
    title: "React 面试高频考点",
    content: `
# React 面试高频考点

## 1. Virtual DOM 深入理解

### 1.1 什么是 Virtual DOM

Virtual DOM（虚拟 DOM）是 React 的核心概念之一，它是一个用 JavaScript 对象来表示真实 DOM 结构的轻量级抽象。每一个 Virtual DOM 节点都是一个普通的 JavaScript 对象，包含标签名（type）、属性（props）和子节点（children）等信息。

一个简单的 Virtual DOM 节点结构示例如下：

\`\`\`javascript
const vnode = {
  type: 'div',
  props: {
    id: 'app',
    className: 'container'
  },
  children: [
    {
      type: 'h1',
      props: { className: 'title' },
      children: ['Hello World']
    }
  ]
};
\`\`\`

### 1.2 为什么需要 Virtual DOM

在早期前端开发中，直接操作真实 DOM 存在以下痛点：

**性能问题**：真实 DOM 操作非常昂贵。每次 DOM 变化都会触发浏览器的重排（reflow）和重绘（repaint），频繁操作会严重影响页面性能。特别是在复杂交互场景下，频繁的 DOM 操作会导致页面卡顿。

**开发效率问题**：使用原生 DOM API 或 jQuery 直接操作 DOM，代码往往变得难以维护。开发者需要手动管理 DOM 的状态和变更，容易产生 bug。

**跨平台需求**：Virtual DOM 本质上是 JavaScript 对象，不依赖于浏览器环境。这使得 React 可以扩展到其他平台，如 React Native（移动端）、React VR（虚拟现实）等。

Virtual DOM 的核心优势在于：

1. **批量更新**：React 将多次状态更新合并为一次 DOM 更新，减少不必要的 DOM 操作。
2. **高效的 Diff 算法**：通过比较新旧 Virtual DOM 树的差异，只更新变化的部分。
3. **声明式编程**：开发者只需描述 UI 应该是什么样子，React 负责将状态映射到 DOM。
4. **跨平台能力**：Virtual DOM 是平台无关的抽象层。

### 1.3 Reconciliation 协调算法详解

Reconciliation（协调）是 React 用来比较新旧 Virtual DOM 树并计算最小更新的算法。React 使用一种启发式的 O(n) 算法，基于以下两个假设：

**假设一**：不同类型的元素会产生不同的树结构。如果根元素类型不同，React 会销毁旧树并从头构建新树。

**假设二**：开发者可以通过 key 属性来标识哪些子元素在不同渲染中是稳定的。

**Diff 算法的三层策略**：

**Tree Diff（树层级比较）**：
- React 只对同层级的节点进行比较，不跨层级比较。
- 如果节点类型不同，直接删除旧节点及其子树，创建新节点。
- 如果节点类型相同，则复用 DOM 节点，只更新变化的属性。

**Component Diff（组件层级比较）**：
- 同一类型的组件，React 会保留组件实例，只更新 props。
- 不同类型的组件，React 会卸载旧组件，挂载新组件。
- 对于同一类型的组件，使用 shouldComponentUpdate 或 React.memo 可以跳过不必要的渲染。

**Element Diff（元素层级比较）**：
- 对于同一层级的子节点列表，React 通过 key 属性来识别每个节点。
- 没有 key 时，React 按位置比较，可能导致不必要的删除和创建。
- 有了 key 后，React 可以通过 key 匹配新旧节点，实现高效的移动和复用。

**key 的重要性**：

key 是 React 识别元素身份的唯一标识。以下情况必须使用 key：

\`\`\`javascript
// 不好的做法：使用数组索引作为 key
{items.map((item, index) => <li key={index}>{item.name}</li>)}

// 好的做法：使用稳定的唯一标识作为 key
{items.map(item => <li key={item.id}>{item.name}</li>)}
\`\`\`

使用索引作为 key 的问题：当列表顺序发生变化（如插入、删除、排序）时，React 无法正确识别元素身份，可能导致：
- 组件状态错乱（如受控组件的输入值）
- 不必要的 DOM 操作
- 性能下降

### 1.4 Virtual DOM 的性能误区

常见的误解是"Virtual DOM 一定比直接操作 DOM 快"。实际上：

- Virtual DOM 的操作本身有开销（创建 JS 对象、Diff 计算）。
- 对于简单的 DOM 操作，直接操作 DOM 可能更快。
- Virtual DOM 的真正价值在于：在复杂应用中，它能保证可接受的性能，同时提供声明式的开发体验。
- React 的批量更新和异步渲染机制才是性能优化的关键。

## 2. 组件生命周期

### 2.1 Class 组件生命周期

React 16.3 之后，class 组件生命周期分为三个阶段：

**挂载阶段（Mounting）**：
- constructor()：初始化 state 和绑定方法
- static getDerivedStateFromProps(props, state)：在渲染前根据 props 更新 state
- render()：纯函数，返回 React 元素
- componentDidMount()：组件挂载后执行，适合进行网络请求、订阅

**更新阶段（Updating）**：
- static getDerivedStateFromProps(props, state)：每次渲染前调用
- shouldComponentUpdate(nextProps, nextState)：决定是否重新渲染，返回布尔值
- render()：重新渲染
- getSnapshotBeforeUpdate(prevProps, prevState)：在 DOM 更新前获取信息
- componentDidUpdate(prevProps, prevState, snapshot)：DOM 更新后操作

**卸载阶段（Unmounting）**：
- componentWillUnmount()：清理定时器、取消订阅

**错误处理**：
- static getDerivedStateFromError(error)：渲染备用 UI
- componentDidCatch(error, info)：记录错误日志

**已废弃的生命周期**（React 17+ 中需要加 UNSAFE_ 前缀）：
- componentWillMount → 在 render 前执行，可能被多次调用
- componentWillReceiveProps → 在新 props 到达时执行
- componentWillUpdate → 在 render 前执行，可能被多次调用

废弃原因：React 16 引入 Fiber 架构后，render 阶段可能被中断和重启，这些生命周期可能在一次更新中被多次调用，导致意外行为。

### 2.2 函数组件与 Hooks

函数组件是更简洁的组件定义方式，配合 Hooks 可以实现 class 组件的所有功能：

\`\`\`javascript
// Class 组件
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  componentDidMount() {
    document.title = \`Count: \${this.state.count}\`;
  }

  componentDidUpdate() {
    document.title = \`Count: \${this.state.count}\`;
  }

  render() {
    return (
      <button onClick={() => this.setState({ count: this.state.count + 1 })}>
        {this.state.count}
      </button>
    );
  }
}

// 函数组件 + Hooks
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
\`\`\`

函数组件的优势：
- 代码更简洁，没有 this 绑定问题
- 逻辑复用更方便（自定义 Hooks）
- 更好的 TypeScript 支持
- 不需要处理生命周期方法的复杂性
- 更容易进行 tree shaking

### 2.3 函数组件与 Class 组件的核心区别

**心智模型不同**：
- Class 组件是面向对象的，关注生命周期和可变状态
- 函数组件是函数式的，每次渲染都是独立的函数调用，捕获当时的 props 和 state

**闭包陷阱**：这是函数组件最容易出错的点。在 class 组件中，this.props 总是指向最新的 props；但在函数组件中，每次渲染都有自己的 props 和 state 快照。

\`\`\`javascript
// Class 组件：this.props 总是最新的
class ShowCount extends React.Component {
  showMessage = () => {
    setTimeout(() => {
      alert(this.props.count); // 总是最新的值
    }, 3000);
  };
}

// 函数组件：捕获的是点击时的值
function ShowCount({ count }) {
  const showMessage = () => {
    setTimeout(() => {
      alert(count); // 捕获的是点击时的值，如果不使用 ref
    }, 3000);
  };
}
\`\`\`

## 3. React Hooks 深入详解

### 3.1 useState

useState 是 React 中最基础的 Hook，用于在函数组件中添加状态。

\`\`\`javascript
const [state, setState] = useState(initialValue);
\`\`\`

**使用要点**：

1. **状态更新是异步的**：React 会批量处理状态更新，在同一个事件处理函数中多次调用 setState 会被合并。如果需要基于前一个状态更新，使用函数式更新：

\`\`\`javascript
setCount(prevCount => prevCount + 1);
\`\`\`

2. **状态是不可变的**：不要直接修改状态对象，而是创建新的对象：

\`\`\`javascript
// 错误
state.name = 'new name';
setState(state);

// 正确
setState({ ...state, name: 'new name' });
\`\`\`

3. **惰性初始化**：如果初始状态需要通过复杂计算得出，可以传入函数：

\`\`\`javascript
const [state, setState] = useState(() => {
  const initial = expensiveComputation();
  return initial;
});
\`\`\`

4. **useState 与 useReducer 的选择**：
- 简单的状态管理使用 useState
- 复杂的状态逻辑（多个子值、状态之间存在依赖关系）使用 useReducer

### 3.2 useEffect

useEffect 用于处理副作用操作，如数据获取、订阅、DOM 操作等。

\`\`\`javascript
useEffect(() => {
  // 副作用逻辑
  return () => {
    // 清理函数（可选）
  };
}, [dependencies]);
\`\`\`

**依赖数组的三种情况**：

1. **不传依赖数组**：每次渲染后都执行
2. **空数组 []**：仅在组件挂载时执行一次，类似 componentDidMount
3. **指定依赖 [a, b]**：当 a 或 b 变化时执行

**常见的 useEffect 使用场景**：

**数据获取**：

\`\`\`javascript
useEffect(() => {
  let cancelled = false;

  async function fetchData() {
    const result = await api.getData();
    if (!cancelled) {
      setData(result);
    }
  }

  fetchData();

  return () => {
    cancelled = true;
  };
}, []);
\`\`\`

**事件监听**：

\`\`\`javascript
useEffect(() => {
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
\`\`\`

**useEffect 的执行时机**：
- useEffect 的回调在浏览器完成布局和绘制之后异步执行
- 不会阻塞浏览器的渲染过程
- 清理函数在下一次 effect 执行前或组件卸载时执行

**useLayoutEffect**：
- 与 useEffect 签名相同，但在浏览器绘制之前同步执行
- 适用于需要同步读取 DOM 布局并同步更新的场景
- 会阻塞浏览器的绘制，谨慎使用

### 3.3 useMemo 和 useCallback

这两个 Hook 用于性能优化，通过记忆化（memoization）避免不必要的计算或渲染。

**useMemo**：缓存计算结果

\`\`\`javascript
const memoizedValue = useMemo(() => {
  return expensiveComputation(a, b);
}, [a, b]);
\`\`\`

适用场景：
- 计算量大且依赖变化不频繁的场景
- 作为 props 传递给使用 React.memo 的子组件时，避免子组件不必要的重渲染
- 作为其他 Hook 的依赖项时保持引用稳定

**useCallback**：缓存函数引用

\`\`\`javascript
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
\`\`\`

适用场景：
- 将回调函数传递给使用 React.memo 的子组件
- 作为 useEffect 的依赖项时保持函数引用稳定

**useMemo 和 useCallback 的区别**：
- useMemo 缓存的是函数执行的结果
- useCallback 缓存的是函数本身
- useCallback(fn, deps) 等价于 useMemo(() => fn, deps)

**性能优化的注意事项**：
- 不要过度使用 useMemo 和 useCallback，它们本身也有开销
- 只在确实存在性能问题或引用稳定性需求时使用
- 配合 React.memo 使用才有意义，否则子组件没有跳过渲染的机制

### 3.4 useRef

useRef 返回一个可变的 ref 对象，其 .current 属性被初始化为传入的值。

\`\`\`javascript
const refContainer = useRef(initialValue);
\`\`\`

**useRef 的三大用途**：

1. **访问 DOM 元素**：

\`\`\`javascript
function TextInput() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current.focus();
  };

  return (
    <>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>聚焦输入框</button>
    </>
  );
}
\`\`\`

2. **保存可变值（不触发重渲染）**：

\`\`\`javascript
function Timer() {
  const intervalRef = useRef(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return <div>{count}</div>;
}
\`\`\`

3. **获取上一次的值**：

\`\`\`javascript
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
\`\`\`

**useRef 与 createRef 的区别**：
- createRef 在每次渲染时都会创建新的 ref 对象
- useRef 在组件的整个生命周期内保持同一个 ref 对象

**useRef 与 useState 的区别**：
- 修改 useRef.current 不会触发重渲染
- 修改 useState 的状态会触发重渲染

### 3.5 useContext

useContext 让你在组件中读取和订阅 context 值。

\`\`\`javascript
const value = useContext(MyContext);
\`\`\`

**Context 的使用模式**：

\`\`\`javascript
// 1. 创建 Context
const ThemeContext = React.createContext('light');

// 2. 提供值
function App() {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Main />
    </ThemeContext.Provider>
  );
}

// 3. 消费值
function Main() {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <div className={theme}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
}
\`\`\`

**Context 的性能注意事项**：
- Context value 变化时，所有使用该 Context 的组件都会重新渲染
- 可以通过拆分 Context 来减少不必要的渲染
- 使用 useMemo 包裹 Context value 来避免不必要的更新

**Context 的适用场景**：
- 主题、语言等全局偏好设置
- 当前认证用户信息
- 路由信息
- 不适合频繁变化的数据

### 3.6 useReducer

useReducer 是 useState 的替代方案，适用于复杂的状态逻辑。

\`\`\`javascript
const [state, dispatch] = useReducer(reducer, initialState, init);
\`\`\`

**使用示例**：

\`\`\`javascript
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: action.payload || 0 };
    default:
      throw new Error(\`Unknown action: \${action.type}\`);
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset', payload: 0 })}>Reset</button>
    </>
  );
}
\`\`\`

**useReducer 的优势**：
- 状态逻辑集中管理，便于维护和测试
- 复杂状态更新逻辑更清晰
- 配合 useContext 可以实现轻量级全局状态管理

### 3.7 自定义 Hooks

自定义 Hooks 是 React 中复用状态逻辑的机制。它是一个以 use 开头的函数，内部可以调用其他 Hooks。

**自定义 Hook 的设计原则**：
- 名字以 use 开头
- 函数内部可以调用其他 Hooks
- 每次调用自定义 Hook 都会获得独立的状态

**经典自定义 Hook 示例**：

1. **useDebounce（防抖）**：

\`\`\`javascript
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
\`\`\`

2. **useLocalStorage（本地存储）**：

\`\`\`javascript
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue];
}
\`\`\`

3. **useFetch（数据获取）**：

\`\`\`javascript
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}
\`\`\`

## 4. 状态管理

### 4.1 Context API

Context API 是 React 内置的轻量级状态管理方案，适合跨组件共享数据。

**Context 的局限性**：
- 不适合频繁更新的状态，因为所有消费者都会重新渲染
- 不适合复杂的状态逻辑
- 没有时间旅行调试等开发工具支持
- 没有中间件支持

**性能优化策略**：
- 拆分 Context：将不同用途的状态放在不同的 Context 中
- 使用 useMemo 包裹 value 对象
- 将状态和更新函数分离到不同的 Context 中

### 4.2 Redux

Redux 是可预测的状态容器，遵循三大原则：
- 单一数据源（Single Source of Truth）
- State 是只读的
- 使用纯函数执行修改

**Redux Toolkit（现代 Redux）**：

Redux Toolkit 是 Redux 官方推荐的编写方式，简化了 Redux 的使用：

\`\`\`javascript
import { createSlice, configureStore } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
  },
});

const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});
\`\`\`

**Redux 中间件原理**：
中间件是在 action 被发起和到达 reducer 之间的扩展点。常见的中间件：
- redux-thunk：处理异步 action
- redux-saga：使用 Generator 处理副作用
- redux-logger：日志记录

**Redux 数据流**：
1. 用户触发事件 → dispatch(action)
2. Store 将 action 传递给 Reducer
3. Reducer 根据 action 类型计算新 state
4. Store 更新 state 并通知订阅者
5. UI 根据新 state 重新渲染

### 4.3 Zustand

Zustand 是一个轻量级的状态管理库，API 设计简洁，不需要 Provider 包裹。

\`\`\`javascript
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
\`\`\`

**Zustand 的优势**：
- 极简的 API，不需要 Provider
- 基于 Hook，天然支持 TypeScript
- 支持中间件（persist、devtools、immer）
- 不需要 action 类型和 reducer 的样板代码
- 按需订阅，只有使用的状态变化时才重新渲染

**Zustand vs Redux 对比**：
- Zustand 更适合中小型项目，上手快，代码量少
- Redux 适合大型项目，有成熟的生态和调试工具
- Zustand 不需要 Provider 包裹，减少了组件树的层级
- Redux 有更严格的规范，团队协作更一致

## 5. React Fiber 架构

### 5.1 为什么需要 Fiber

React 15 及之前的版本使用递归的 Stack Reconciler，存在以下问题：
- 递归调用无法中断，一旦开始就必须完成
- 当组件树很大时，主线程被长时间占用，导致页面卡顿
- 无法响应用户输入或动画等更高优先级的任务

React Fiber 是 React 16 引入的新的协调引擎，核心目标是：
- 将渲染工作分解为小的工作单元
- 能够暂停、恢复和重启工作
- 为不同类型的工作分配优先级
- 复用之前完成的工作
- 在不再需要时终止工作

### 5.2 Fiber 的工作原理

**Fiber 节点**：每个 React 元素对应一个 Fiber 节点，Fiber 节点形成了一个链表结构（Fiber Tree）。

Fiber 节点包含的信息：
- type：组件类型（div、span、函数组件等）
- key：用于 reconciliation
- child：第一个子节点
- sibling：下一个兄弟节点
- return：父节点
- stateNode：对应的 DOM 节点或组件实例
- effectTag：标记需要执行的副作用类型
- expirationTime：任务的过期时间

**双缓存机制**：
React 同时维护两棵 Fiber 树：
- Current Fiber Tree：当前屏幕上显示的 UI 对应的 Fiber 树
- WorkInProgress Fiber Tree：正在构建中的新 Fiber 树

当 WorkInProgress 树构建完成后，React 将其切换为 Current 树，完成一次更新。

**工作循环**：
Fiber 的工作分为两个阶段：

**Render 阶段（可中断）**：
- 从根节点开始遍历 Fiber 树
- 对比新旧 Fiber 节点，标记需要更新的节点
- 可以被更高优先级的任务中断
- 此阶段不产生实际的 DOM 操作

**Commit 阶段（不可中断）**：
- 根据 Render 阶段标记的 effectTag 执行 DOM 操作
- 同步执行，不可中断
- 分为三个子阶段：before mutation、mutation、layout

**优先级调度**：
React 使用 Scheduler 包来管理任务优先级：
- Immediate：需要立即执行的任务
- UserBlocking：用户交互相关的任务
- Normal：普通的更新任务
- Low：低优先级的任务
- Idle：空闲时执行的任务

### 5.3 Fiber 带来的变化

**异步可中断渲染**：React 可以在渲染过程中暂停，处理更高优先级的任务。

**Suspense**：允许组件等待某些条件满足后再渲染。

**Concurrent Mode**：React 18 中的并发特性，让应用保持响应性。

## 6. React 性能优化

### 6.1 React.memo

React.memo 是一个高阶组件，用于对函数组件进行记忆化。如果组件的 props 没有变化，则跳过渲染。

\`\`\`javascript
const MyComponent = React.memo(function MyComponent({ name, age }) {
  return <div>{name}: {age}</div>;
});
\`\`\`

**React.memo 的浅比较**：
- 默认情况下，React.memo 对 props 进行浅比较（shallow comparison）
- 对于引用类型（对象、数组、函数），即使内容相同，引用不同也会触发渲染
- 可以通过第二个参数传递自定义比较函数

\`\`\`javascript
React.memo(Component, (prevProps, nextProps) => {
  return prevProps.user.id === nextProps.user.id;
});
\`\`\`

**使用场景**：
- 纯展示组件，相同输入总是产生相同输出
- 渲染开销大的组件
- 在列表中被频繁渲染的组件

### 6.2 useMemo 和 useCallback 的性能优化作用

- useMemo 和 useCallback 本身不阻止组件渲染，需要配合 React.memo 使用
- 它们确保传递给子组件的 props 引用稳定，让 React.memo 的浅比较能够生效

### 6.3 懒加载和代码分割

**React.lazy 和 Suspense**：

\`\`\`javascript
const OtherComponent = React.lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtherComponent />
    </Suspense>
  );
}
\`\`\`

**路由级别的代码分割**：

\`\`\`javascript
const Home = React.lazy(() => import('./Home'));
const About = React.lazy(() => import('./About'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  );
}
\`\`\`

**代码分割的最佳实践**：
- 按路由分割：每个页面一个独立的 chunk
- 按功能模块分割：大型功能模块独立加载
- 按第三方库分割：将不常变化的库单独打包

### 6.4 避免不必要的渲染

**常见的不必要渲染场景**：
1. 父组件渲染导致所有子组件重新渲染
2. Context value 变化导致所有消费者重新渲染
3. 在渲染函数中创建新的对象或函数作为 props

**优化策略**：
1. 使用 React.memo 包裹子组件
2. 使用 useCallback 稳定函数引用
3. 使用 useMemo 稳定对象引用
4. 将状态下沉到需要它的组件中
5. 使用 children prop 模式

### 6.5 虚拟列表（Virtualization）

对于长列表，使用虚拟列表只渲染可见区域内的元素，大幅减少 DOM 节点数量。

\`\`\`javascript
// 使用 react-window 实现虚拟列表
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={400}
      width="100%"
      itemCount={items.length}
      itemSize={50}
    >
      {Row}
    </FixedSizeList>
  );
}
\`\`\`

## 7. SSR vs CSR：Next.js 基础

### 7.1 客户端渲染（CSR）

CSR 的特点是：
- 服务器返回一个几乎空的 HTML 文件和 JavaScript bundle
- 浏览器下载 JavaScript 后在客户端渲染页面
- 首屏加载慢，但后续交互体验好
- SEO 不友好，搜索引擎可能无法抓取内容

**CSR 的优缺点**：
- 优点：前后端分离，开发效率高，服务器压力小，交互体验好
- 缺点：首屏加载慢，SEO 困难，低端设备性能差

### 7.2 服务端渲染（SSR）

SSR 的特点是：
- 服务器在响应请求时生成完整的 HTML 内容
- 浏览器收到的是包含完整内容的 HTML
- 首屏加载快，SEO 友好
- 服务器压力大，开发复杂度高

**SSR 的优缺点**：
- 优点：首屏加载快，SEO 友好，对低端设备友好
- 缺点：服务器压力大，开发复杂度高，TTFB 可能较长

### 7.3 Next.js 核心概念

Next.js 是一个 React 框架，提供了多种渲染策略：

**页面路由**：
- 基于文件系统的路由：pages 目录下的文件自动成为路由
- 动态路由：使用 [param] 定义动态参数
- API 路由：在 pages/api 下定义 API 端点

**渲染模式**：
- SSR（getServerSideProps）：每次请求都在服务器端渲染
- SSG（getStaticProps）：在构建时生成静态页面
- ISR（Incremental Static Regeneration）：定期重新生成静态页面
- CSR：客户端渲染

**数据获取方法**：
- getServerSideProps：每次请求时运行
- getStaticProps：构建时运行
- getStaticPaths：定义动态路由的静态生成路径

### 7.4 Next.js 的渲染策略选择

**什么场景使用 SSR**：
- 内容频繁变化，需要实时数据
- 需要根据用户请求返回个性化内容
- 需要保护敏感数据，不暴露在客户端

**什么场景使用 SSG**：
- 内容不经常变化（博客、文档、营销页面）
- 页面内容与用户无关
- 需要极致的加载速度

**什么场景使用 ISR**：
- 内容变化不频繁但需要更新
- 不想每次请求都重新构建
- 想在保持静态性能的同时支持内容更新

## 8. React 18 新特性

### 8.1 Concurrent Mode（并发模式）

Concurrent Mode 是 React 18 的核心特性，它让 React 可以同时准备多个版本的 UI。

**关键能力**：
- 中断可恢复的渲染
- 为任务分配优先级
- 在后台预渲染内容

**并发特性不是默认开启的**：在 React 18 中，并发特性需要通过特定的 API 来启用。

### 8.2 Suspense 改进

React 18 中的 Suspense 功能得到增强：

**Suspense 与数据获取**：
React 18 支持在 Suspense 中异步加载数据，不再需要手动处理 loading 状态。

\`\`\`javascript
// React 18 支持 Suspense 用于数据获取
function ProfilePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ProfileDetails />
      <Suspense fallback={<PostsSkeleton />}>
        <ProfileTimeline />
      </Suspense>
    </Suspense>
  );
}
\`\`\`

### 8.3 Server Components

React Server Components 允许组件在服务器端渲染，将渲染结果发送到客户端。

**Server Components 的特点**：
- 零打包体积：Server Components 的代码不会发送到客户端
- 直接访问后端资源：可以直接读写数据库、文件系统
- 自动代码分割：Server Components 自动成为代码分割点
- 客户端组件和服务器组件混合使用

**Server Components vs SSR**：
- SSR 是在服务器端渲染 HTML，但组件代码仍会发送到客户端
- Server Components 的代码永远不会发送到客户端

### 8.4 其他 React 18 新特性

**Automatic Batching**：React 18 默认启用自动批处理，即使在不同上下文中的状态更新也会被合并。

**Transitions**：使用 startTransition 可以将某些更新标记为非紧急的，让 React 优先处理紧急更新。

\`\`\`javascript
import { startTransition } from 'react';

// 紧急更新：输入框的响应
setInputValue(value);

// 非紧急更新：搜索结果的更新
startTransition(() => {
  setSearchResults(results);
});
\`\`\`

**useId**：生成唯一 ID，可用于无障碍属性。

**useDeferredValue**：延迟更新某些值，让紧急更新优先处理。

**useSyncExternalStore**：用于安全地订阅外部存储。

**useInsertionEffect**：在 DOM 变更之前同步执行，适用于 CSS-in-JS 库。

## 9. 常见 React 面试题

### 9.1 setState 是同步还是异步的？

setState 在 React 的事件处理函数和生命周期中是"异步"的（批量更新），但在 setTimeout、原生事件和异步操作中是同步的。

原因：React 为了性能优化，会将多个 setState 调用合并为一次更新。在 React 18 中，默认启用自动批处理，所有 setState 都是批量处理的。

### 9.2 React 中的 key 有什么作用？

key 帮助 React 识别哪些元素发生了变化、被添加或被删除。在 diff 算法中，React 通过 key 来匹配新旧节点，实现最小化 DOM 操作。不使用 key 或使用索引作为 key 可能导致状态错乱和性能问题。

### 9.3 为什么不能在循环、条件判断中调用 Hooks？

React 使用 Hooks 的调用顺序来关联每个 Hook 和对应的状态。如果在条件判断中调用 Hook，会导致调用顺序不一致，React 无法正确关联状态，产生 bug。

### 9.4 useEffect 中的依赖数组如何使用？

依赖数组告诉 React 何时重新执行 effect。如果依赖数组中的值在两次渲染之间发生了变化，effect 就会重新执行。空数组表示只在挂载和卸载时执行。不传依赖数组表示每次渲染都执行。

### 9.5 如何避免 React 中的性能问题？

- 使用 React.memo 避免不必要的渲染
- 使用 useMemo 和 useCallback 缓存值和函数
- 使用 React.lazy 和 Suspense 进行代码分割
- 使用虚拟列表处理长列表
- 避免在渲染函数中创建新对象
- 合理拆分组件，将状态下沉
- 使用 useDeferredValue 处理非紧急更新

### 9.6 受控组件和非受控组件的区别？

受控组件：表单数据由 React 状态管理，通过 value 和 onChange 控制。非受控组件：表单数据由 DOM 自身管理，通过 ref 获取值。受控组件更符合 React 的数据流思想，非受控组件在某些场景下代码更简洁。
`
  },

  // ============================================================
  // 第 7 章：Vue 面试高频考点
  // ============================================================
  {
    id: "fe-vue",
    group: "框架与工程化",
    icon: "💚",
    title: "Vue 面试高频考点",
    content: `
# Vue 面试高频考点

## 1. Vue 响应式系统

### 1.1 Vue 2 响应式原理（Object.defineProperty）

Vue 2 的响应式系统基于 Object.defineProperty，通过劫持对象属性的 getter 和 setter 来实现数据变化检测。

**实现原理**：

1. **初始化阶段**：Vue 在初始化时，遍历 data 对象的所有属性，使用 Object.defineProperty 将每个属性转换为 getter/setter。

2. **依赖收集**：当组件渲染时，会访问响应式数据的 getter，此时 Vue 将当前的 Watcher（渲染 Watcher 或计算属性 Watcher）收集为依赖。

3. **派发更新**：当数据变化时，触发 setter，通知所有依赖该数据的 Watcher 重新执行，完成视图更新。

**Object.defineProperty 的局限性**：

1. **无法检测对象属性的添加和删除**：Vue 2 无法检测到对象新增的属性，需要使用 Vue.set() 或 this.$set() 来添加响应式属性。

\`\`\`javascript
// Vue 2 中无法检测以下变化
this.obj.newProp = 'value'; // 不会触发视图更新

// 需要使用 Vue.set
Vue.set(this.obj, 'newProp', 'value');
// 或
this.$set(this.obj, 'newProp', 'value');
\`\`\`

2. **无法检测数组索引的变化**：通过索引直接设置数组元素不会触发更新。

\`\`\`javascript
this.items[0] = 'new value'; // 不会触发视图更新

// 需要使用
this.$set(this.items, 0, 'new value');
// 或
this.items.splice(0, 1, 'new value');
\`\`\`

3. **无法检测数组长度的变化**：直接修改数组的 length 属性不会触发更新。

4. **需要递归遍历**：初始化时需要深度遍历对象的所有属性，对性能有一定影响。

**Vue 2 对数组的特殊处理**：

Vue 2 重写了数组的七个变异方法（push、pop、shift、unshift、splice、sort、reverse），在这些方法被调用时触发更新。非变异方法（filter、concat、slice）不会触发更新，需要使用新数组替换原数组。

### 1.2 Vue 3 响应式原理（Proxy）

Vue 3 使用 ES6 的 Proxy 重构了响应式系统，解决了 Vue 2 的诸多限制。

**Proxy 的优势**：

1. **可以检测对象属性的添加和删除**：Proxy 可以拦截包括属性读取、赋值、删除、枚举等在内的 13 种操作。

2. **可以检测数组索引和长度的变化**：Proxy 能够拦截数组的所有操作。

3. **不需要递归遍历**：Proxy 在访问属性时才进行代理，是惰性的（lazy），只有真正被访问的属性才会被代理。

4. **更好的性能**：不需要在初始化时递归遍历所有属性，内存占用更少。

**Vue 3 响应式系统的核心 API**：

\`\`\`javascript
import { reactive, ref, readonly, shallowReactive, shallowRef } from 'vue';

// reactive：创建深层响应式对象
const state = reactive({
  count: 0,
  nested: { value: 1 }
});

// ref：创建响应式引用，适用于基本类型
const count = ref(0);

// readonly：创建只读的响应式对象
const original = reactive({ count: 0 });
const copy = readonly(original);

// shallowReactive：仅第一层属性响应式
const shallow = shallowReactive({ nested: { count: 0 } });

// shallowRef：仅 .value 是响应式的
const shallow = shallowRef({ count: 0 });
\`\`\`

**ref 和 reactive 的区别**：

| 特性 | ref | reactive |
|------|-----|----------|
| 适用类型 | 基本类型和对象 | 仅对象 |
| 访问方式 | .value 属性 | 直接访问属性 |
| 模板中 | 自动解包 | 直接使用 |
| 解构 | 保持响应式 | 会丢失响应式 |
| 替换 | 可直接替换 .value | 不能直接替换整个对象 |

**toRef 和 toRefs**：

用于解构 reactive 对象时保持响应式：

\`\`\`javascript
const state = reactive({ name: 'Vue', version: 3 });

// toRef：创建单个属性的响应式引用
const name = toRef(state, 'name');

// toRefs：将对象的所有属性转换为 ref
const { name, version } = toRefs(state);
\`\`\`

### 1.3 Vue 3 响应式系统的内部实现

**核心概念**：

**effect（副作用函数）**：当响应式数据变化时，需要重新执行的函数。在 Vue 3 中，组件的渲染函数、计算属性、watch 回调都是 effect。

**track（依赖收集）**：在 effect 执行期间，记录哪些响应式数据被访问，建立 effect 和数据之间的依赖关系。

**trigger（触发更新）**：当响应式数据变化时，找到所有依赖该数据的 effect 并重新执行。

**WeakMap 存储结构**：

Vue 3 使用 WeakMap → Map → Set 的三层结构存储依赖关系：
- WeakMap：key 是原始对象，value 是 Map
- Map：key 是对象的属性名，value 是 Set
- Set：存储依赖该属性的所有 effect

这种设计的好处：
- WeakMap 的 key 是弱引用，当对象被垃圾回收时，对应的依赖也会被清除
- 使用 Set 保证每个 effect 只被添加一次

## 2. Vue 3 Composition API

### 2.1 为什么需要 Composition API

Options API 的局限性：
- 逻辑碎片化：同一个功能的代码分散在 data、methods、computed、watch 等多个选项中
- 逻辑复用困难：mixins 存在命名冲突、来源不清晰等问题
- 对 TypeScript 支持不友好
- 大型组件难以维护和理解

Composition API 的优势：
- 按功能组织代码，逻辑更内聚
- 更好的逻辑复用（组合函数）
- 完整的 TypeScript 支持
- 更灵活的代码组织方式
- 更好的 tree shaking 支持

### 2.2 Setup 函数

setup 是 Composition API 的入口，在组件创建之前执行。

\`\`\`javascript
export default {
  setup(props, context) {
    // props：响应式的，不能解构
    // context：{ attrs, slots, emit, expose }

    const count = ref(0);

    function increment() {
      count.value++;
    }

    return {
      count,
      increment
    };
  }
};
\`\`\`

**setup 的执行时机**：
- 在 beforeCreate 之前执行
- 此时组件实例尚未创建，无法访问 this
- props 是响应式的，但不应解构，否则会失去响应式

### 2.3 <script setup>

<script setup> 是 Vue 3 的语法糖，让 Composition API 的使用更加简洁。

\`\`\`javascript
<script setup>
import { ref, computed, onMounted } from 'vue';

const count = ref(0);

const double = computed(() => count.value * 2);

function increment() {
  count.value++;
}

onMounted(() => {
  console.log('Component mounted');
});
</script>
\`\`\`

**<script setup> 的特点**：
- 顶层绑定自动暴露给模板
- 导入的组件无需注册即可使用
- 支持 TypeScript 写法
- 更好的 IDE 支持
- 编译时优化

### 2.4 computed 和 watch 深入

**computed**：计算属性，基于响应式依赖缓存结果。

\`\`\`javascript
const fullName = computed({
  get() {
    return firstName.value + ' ' + lastName.value;
  },
  set(value) {
    const parts = value.split(' ');
    firstName.value = parts[0];
    lastName.value = parts[1];
  }
});
\`\`\`

**watch**：监听响应式数据的变化。

\`\`\`javascript
// 监听单个 ref
watch(count, (newVal, oldVal) => {
  console.log(\`Count changed from \${oldVal} to \${newVal}\`);
});

// 监听多个数据源
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
  // ...
});

// 监听 reactive 对象的属性
watch(() => state.count, (newVal, oldVal) => {
  // ...
});

// 深度监听
watch(state, (newVal, oldVal) => {
  // ...
}, { deep: true });

// 立即执行
watch(source, callback, { immediate: true });
\`\`\`

**watchEffect**：自动追踪依赖并执行。

\`\`\`javascript
watchEffect(() => {
  // 自动追踪 count.value 和 name.value
  console.log(\`Count: \${count.value}, Name: \${name.value}\`);
});
\`\`\`

**watch 和 watchEffect 的区别**：
- watch 需要明确指定监听的数据源
- watchEffect 自动追踪回调中使用的所有响应式数据
- watch 可以访问旧值和新值
- watchEffect 在初始化时立即执行一次
- watch 可以通过 lazy 选项控制是否立即执行

**computed 和 watch 的区别**：
- computed 返回一个值，用于模板中的计算
- watch 执行副作用操作，不返回值
- computed 有缓存机制，依赖不变时不会重新计算
- watch 每次数据变化都会执行回调

## 3. 组件通信

### 3.1 Props 和 Emit

**Props（父传子）**：

\`\`\`javascript
// 父组件
<ChildComponent :message="parentMessage" :count="10" />

// 子组件
const props = defineProps({
  message: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
});

// 带默认值的复杂类型
const props = defineProps({
  config: {
    type: Object,
    default: () => ({ theme: 'light' })
  }
});
\`\`\`

**Emit（子传父）**：

\`\`\`javascript
// 子组件
const emit = defineEmits(['update', 'delete']);

function handleClick() {
  emit('update', { id: 1, newValue: 'hello' });
}

// 带验证的 emit
const emit = defineEmits({
  update: (payload) => {
    return payload.id !== undefined;
  }
});

// 父组件
<ChildComponent @update="handleUpdate" />
\`\`\`

### 3.2 Provide / Inject

用于跨层级组件通信，避免 props 逐层传递。

\`\`\`javascript
// 祖先组件
import { provide, ref, readonly } from 'vue';

const theme = ref('light');
const updateTheme = (newTheme) => {
  theme.value = newTheme;
};

provide('theme', readonly(theme));
provide('updateTheme', updateTheme);

// 后代组件
import { inject } from 'vue';

const theme = inject('theme');
const updateTheme = inject('updateTheme');
\`\`\`

**Provide / Inject 的注意事项**：
- 尽量使用 readonly 包裹提供的数据，防止子组件直接修改
- 可以在 provide 时提供修改方法，保持数据流的可追踪性
- 如果提供的是 ref，注入时自动保持响应式
- 适用于组件库、表单等场景

### 3.3 Event Bus（事件总线）

Vue 3 中移除了 $on、$off 等实例方法，可以使用 mitt 等第三方库实现事件总线。

\`\`\`javascript
// 使用 mitt
import mitt from 'mitt';

const emitter = mitt();

// 发布
emitter.emit('event-name', { data: 'value' });

// 订阅
emitter.on('event-name', (payload) => {
  console.log(payload);
});

// 取消订阅
emitter.off('event-name');
\`\`\`

### 3.4 Vuex（Vue 2 状态管理）

Vuex 是 Vue 2 的官方状态管理库，遵循 Flux 架构。

**核心概念**：
- State：单一状态树，存储应用级别的状态
- Getters：类似计算属性，从 state 派生出新数据
- Mutations：同步修改 state 的方法
- Actions：处理异步操作，提交 mutations
- Modules：将 store 分割成模块

\`\`\`javascript
const store = new Vuex.Store({
  state: {
    count: 0
  },
  getters: {
    doubleCount: (state) => state.count * 2
  },
  mutations: {
    increment(state) {
      state.count++;
    }
  },
  actions: {
    incrementAsync({ commit }) {
      setTimeout(() => {
        commit('increment');
      }, 1000);
    }
  }
});
\`\`\`

### 3.5 Pinia（Vue 3 状态管理）

Pinia 是 Vue 3 官方推荐的状态管理库，替代 Vuex。

\`\`\`javascript
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  getters: {
    doubleCount: (state) => state.count * 2
  },
  actions: {
    increment() {
      this.count++;
    },
    async incrementAsync() {
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.count++;
    }
  }
});

// 使用
const counter = useCounterStore();
counter.increment();
\`\`\`

**Pinia 的优势**：
- 更简洁的 API，没有 mutations
- 完整的 TypeScript 支持
- 不需要嵌套模块，使用扁平化结构
- 支持组合式 API 写法
- 更好的 DevTools 支持
- 支持热更新

## 4. Vue Router

### 4.1 Hash 模式 vs History 模式

**Hash 模式**：
- URL 中包含 # 符号，如 http://example.com/#/page
- # 后面的内容不会发送到服务器
- 使用 window.onhashchange 事件监听变化
- 兼容性好，不需要服务器配置
- URL 不够美观

**History 模式**：
- URL 使用正常的路径格式，如 http://example.com/page
- 使用 HTML5 History API（pushState、replaceState）
- 需要服务器配置，将所有路径重定向到 index.html
- URL 更美观
- 需要后端配合处理路由

### 4.2 导航守卫

**全局守卫**：

\`\`\`javascript
router.beforeEach((to, from, next) => {
  // 每次路由变化前执行
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

router.afterEach((to, from) => {
  // 路由变化后执行，不接受 next
  document.title = to.meta.title || 'App';
});
\`\`\`

**路由独享守卫**：

\`\`\`javascript
const routes = [
  {
    path: '/admin',
    component: AdminPage,
    beforeEnter: (to, from, next) => {
      // 仅在该路由激活时执行
      next();
    }
  }
];
\`\`\`

**组件内守卫**：

\`\`\`javascript
export default {
  beforeRouteEnter(to, from, next) {
    // 组件创建前，无法访问 this
    next(vm => {
      // vm 是组件实例
    });
  },
  beforeRouteUpdate(to, from, next) {
    // 路由变化但组件复用时
    next();
  },
  beforeRouteLeave(to, from, next) {
    // 离开当前路由时
    if (hasUnsavedChanges) {
      const answer = confirm('You have unsaved changes. Leave?');
      next(answer);
    } else {
      next();
    }
  }
};
\`\`\`

### 4.3 动态路由和路由懒加载

**动态路由**：

\`\`\`javascript
const routes = [
  {
    path: '/user/:id',
    component: UserProfile,
    // 通过 $route.params.id 获取参数
  }
];

// 编程式导航
router.push({ name: 'user', params: { id: '123' } });
router.push({ path: '/user/123' });
\`\`\`

**路由懒加载**：

\`\`\`javascript
const routes = [
  {
    path: '/about',
    component: () => import('./views/About.vue')
  }
];
\`\`\`

## 5. Vue 生命周期

### 5.1 Vue 2 生命周期

- beforeCreate：实例初始化之后，数据观测和事件配置之前
- created：实例创建完成，数据观测和事件配置完成，但未挂载
- beforeMount：挂载开始之前，render 函数首次调用
- mounted：实例挂载到 DOM 后
- beforeUpdate：数据更新时，DOM 更新前
- updated：DOM 更新后
- beforeDestroy：实例销毁前
- destroyed：实例销毁后

### 5.2 Vue 3 生命周期

- setup：替代 beforeCreate 和 created
- onBeforeMount
- onMounted
- onBeforeUpdate
- onUpdated
- onBeforeUnmount（替代 beforeDestroy）
- onUnmounted（替代 destroyed）
- onActivated：keep-alive 组件激活时
- onDeactivated：keep-alive 组件停用时
- onErrorCaptured：捕获子组件错误

### 5.3 生命周期对比

| Vue 2 | Vue 3 (Options API) | Vue 3 (Composition API) |
|-------|---------------------|-------------------------|
| beforeCreate | beforeCreate | setup() |
| created | created | setup() |
| beforeMount | beforeMount | onBeforeMount |
| mounted | mounted | onMounted |
| beforeUpdate | beforeUpdate | onBeforeUpdate |
| updated | updated | onUpdated |
| beforeDestroy | beforeUnmount | onBeforeUnmount |
| destroyed | unmounted | onUnmounted |

## 6. Keep-Alive 和动态组件

### 6.1 Keep-Alive

Keep-Alive 是一个内置组件，用于缓存不活动的组件实例，避免重复渲染和销毁。

\`\`\`javascript
<keep-alive>
  <component :is="currentComponent" />
</keep-alive>
\`\`\`

**Keep-Alive 的属性**：
- include：字符串或正则，只有匹配的组件会被缓存
- exclude：字符串或正则，匹配的组件不会被缓存
- max：最多缓存多少个组件实例

**缓存的生命周期**：
- activated：组件被激活时调用
- deactivated：组件被停用时调用

**Keep-Alive 的实现原理**：
- 内部维护一个缓存对象（cache）和 keys 数组
- 当组件切换时，将组件实例存入缓存
- 再次渲染时，从缓存中取出实例
- 使用 LRU 策略管理缓存，当超出 max 时移除最久未使用的实例

### 6.2 动态组件

使用 <component> 和 is 属性实现动态组件切换。

\`\`\`javascript
<component :is="currentTabComponent" />
\`\`\`

## 7. NextTick 原理

### 7.1 NextTick 的作用

Vue 的 DOM 更新是异步的。当数据变化时，Vue 不会立即更新 DOM，而是将更新任务放入队列中，在下一个事件循环中统一执行。nextTick 用于在 DOM 更新完成后执行回调。

\`\`\`javascript
this.message = 'Hello';
this.$nextTick(() => {
  // DOM 已更新
  console.log(this.$el.textContent); // 'Hello'
});
\`\`\`

### 7.2 NextTick 的实现原理

Vue 使用微任务优先的策略来实现 nextTick：

1. 优先使用 Promise.then（微任务）
2. 降级使用 MutationObserver（微任务）
3. 降级使用 setImmediate（宏任务）
4. 最后降级使用 setTimeout（宏任务）

降级顺序是根据浏览器兼容性和执行时机来决定的。微任务在 DOM 更新后、浏览器渲染前执行，能够更快地响应。

### 7.3 为什么需要异步更新

- 避免不必要的 DOM 操作：多次数据变化合并为一次 DOM 更新
- 保证 DOM 更新的一致性：所有数据变化在一次更新中完成
- 性能优化：减少重排和重绘的次数

## 8. Vue 性能优化

### 8.1 编译时优化

Vue 3 在编译阶段做了大量优化：

**静态提升**：将不会变化的静态节点提升到渲染函数外部，避免重复创建。

**补丁标志**：在编译时标记动态节点，运行时只比较动态部分，跳过静态内容的比较。

**Block Tree**：将动态节点组织成块，减少 diff 的范围。

**v-memo**：Vue 3.2 新增指令，用于缓存子树。

### 8.2 运行时优化

**合理使用 v-if 和 v-show**：
- v-if：条件不成立时不渲染 DOM，切换开销大
- v-show：始终渲染，通过 CSS display 控制显示隐藏，初始渲染开销大

**列表渲染优化**：
- 使用 key 属性
- 避免在 v-for 中使用 v-if
- 使用 computed 过滤数据，而不是在模板中过滤

**避免不必要的响应式数据**：
- 不需要响应式的数据使用 shallowRef 或 shallowReactive
- 大型数据使用 Object.freeze

**异步组件**：

\`\`\`javascript
import { defineAsyncComponent } from 'vue';

const AsyncComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
});
\`\`\`

### 8.3 打包优化

- 使用 Vite 或 Webpack 进行代码分割
- 按路由懒加载组件
- Tree Shaking：只打包使用的代码
- 第三方库按需引入

## 9. Vue 3 新特性

### 9.1 Teleport

Teleport 允许将组件的内容渲染到 DOM 树中的其他位置。

\`\`\`javascript
<Teleport to="body">
  <Modal />
</Teleport>
\`\`\`

适用场景：Modal、Dialog、Toast、Dropdown 等需要脱离组件层级的 UI。

### 9.2 Suspense

Suspense 用于处理异步组件的加载状态。

\`\`\`javascript
<Suspense>
  <template #default>
    <AsyncComponent />
  </template>
  <template #fallback>
    <Loading />
  </template>
</Suspense>
\`\`\`

### 9.3 Fragment

Vue 3 支持多根节点组件，不需要用单个根元素包裹。

\`\`\`javascript
<template>
  <header>Header</header>
  <main>Content</main>
  <footer>Footer</footer>
</template>
\`\`\`

### 9.4 其他新特性

**Emits 选项**：明确声明组件触发的事件。

**v-model 改进**：支持多个 v-model 绑定和自定义修饰符。

**自定义渲染器**：使用 createRenderer 创建自定义渲染器。

**全局 API 变化**：createApp 替代 new Vue()，全局配置隔离。

**Suspense 和 Teleport**：提供更好的异步和传送能力。

## 10. Vue Diff 算法

### 10.1 Vue 2 的 Diff 算法

Vue 2 使用双端对比算法，从两端向中间比较：

1. 新旧头节点比较
2. 新旧尾节点比较
3. 旧头新尾比较
4. 旧尾新头比较
5. 如果以上都不匹配，使用 key 查找

### 10.2 Vue 3 的 Diff 算法

Vue 3 对 Diff 算法进行了优化：

**预处理**：先处理相同的前缀和后缀节点，减少比较范围。

**最长递增子序列**：对于中间乱序的节点，使用最长递增子序列算法找到最少的移动操作。

### 10.3 为什么需要 key

key 是 Diff 算法效率的关键。没有 key 时，算法只能按位置比较；有了 key，可以精确匹配节点，实现最小化 DOM 操作。

## 11. 常见 Vue 面试题

### 11.1 Vue 中 data 为什么是函数？

组件可能被多次复用，如果 data 是对象，所有组件实例共享同一个数据对象，导致数据污染。使用函数返回数据对象，每次创建组件实例时都会调用函数返回新的数据对象，确保组件间数据隔离。

### 11.2 v-if 和 v-for 为什么不能同时使用？

v-for 的优先级高于 v-if，这意味着 v-if 会在每次循环中执行，造成性能浪费。应该使用 computed 先过滤数据，再对过滤后的结果使用 v-for。

### 11.3 Vue 的 key 原理？

key 是 Vue 识别节点的唯一标识。在 Diff 算法中，Vue 通过 key 来匹配新旧节点，判断节点是否可复用。没有 key 时，Vue 使用就地复用策略，可能导致状态错乱。

### 11.4 虚拟 DOM 的优缺点？

优点：减少直接 DOM 操作、跨平台、声明式编程。缺点：首次渲染需要创建完整的虚拟 DOM 树，占用内存。

### 11.5 Vue 2 和 Vue 3 的主要区别？

响应式系统：Object.defineProperty → Proxy。API 风格：Options API → Composition API。性能：编译时优化、更小的打包体积。TypeScript：原生支持。新特性：Teleport、Suspense、Fragment。
`
  },

  // ============================================================
  // 第 8 章：前端工程化面试题
  // ============================================================
  {
    id: "fe-engineering",
    group: "框架与工程化",
    icon: "🔧",
    title: "前端工程化面试题",
    content: `
# 前端工程化面试题

## 1. 模块打包工具

### 1.1 Webpack

Webpack 是一个静态模块打包器，它将项目中的各种资源（JS、CSS、图片、字体等）视为模块，通过依赖分析构建依赖图，最终打包成浏览器可识别的静态资源。

**核心概念**：

**Entry（入口）**：指定打包的入口文件，Webpack 将从这里开始构建依赖图。可以配置单入口或多入口。

\`\`\`javascript
module.exports = {
  entry: {
    main: './src/index.js',
    admin: './src/admin.js'
  }
};
\`\`\`

**Output（输出）**：指定打包后的文件输出位置和命名规则。

\`\`\`javascript
module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    publicPath: '/'
  }
};
\`\`\`

**Loader（加载器）**：Webpack 本身只能处理 JavaScript 和 JSON 文件，Loader 让 Webpack 能够处理其他类型的文件。Loader 将文件转换为有效的模块，然后添加到依赖图中。

常见 Loader：
- babel-loader：将 ES6+ 代码转换为 ES5
- css-loader：解析 CSS 中的 @import 和 url()
- style-loader：将 CSS 注入 DOM
- sass-loader：将 SCSS/SASS 编译为 CSS
- file-loader：处理文件导入，返回文件路径
- url-loader：将小文件转换为 base64 内联
- ts-loader：编译 TypeScript

**Plugin（插件）**：插件用于执行 Loader 无法完成的任务，如打包优化、资源管理、环境变量注入等。

常见 Plugin：
- HtmlWebpackPlugin：生成 HTML 文件并自动注入打包后的资源
- MiniCssExtractPlugin：将 CSS 提取为单独文件
- TerserWebpackPlugin：压缩 JavaScript
- CssMinimizerWebpackPlugin：压缩 CSS
- DefinePlugin：定义环境变量
- CopyWebpackPlugin：复制静态资源

**Loader 和 Plugin 的区别**：
- Loader 是文件转换器，在模块加载时对文件内容进行转换
- Plugin 是功能扩展器，在 Webpack 构建的生命周期中注入自定义行为
- Loader 关注单个文件的转换，Plugin 关注整个构建流程

### 1.2 Webpack 构建流程

Webpack 的构建流程是一个串行过程：

1. **初始化参数**：从配置文件和命令行参数中读取并合并参数，生成最终的配置对象。

2. **开始编译**：使用配置对象初始化 Compiler 对象，加载所有插件，执行 run 方法开始编译。

3. **确定入口**：根据配置中的 entry 找到所有入口文件。

4. **编译模块**：从入口文件开始，调用 Loader 对模块进行转换，然后解析模块的依赖，递归处理所有依赖模块。

5. **完成模块编译**：所有模块编译完成后，得到每个模块的最终内容和依赖关系。

6. **输出资源**：根据入口和模块的依赖关系，组装成包含多个模块的 Chunk，再将 Chunk 转换为单独的文件输出。

7. **输出完成**：根据配置的输出路径和文件名，将文件写入到文件系统。

### 1.3 Webpack 性能优化

**开发体验优化**：

**HMR（Hot Module Replacement）**：模块热替换，在不刷新整个页面的情况下替换变化的模块。

\`\`\`javascript
module.exports = {
  devServer: {
    hot: true,
    port: 3000,
    open: true,
    historyApiFallback: true
  }
};
\`\`\`

HMR 的工作原理：
- Webpack Dev Server 和浏览器之间建立 WebSocket 连接
- 文件变化时，Webpack 重新编译，生成更新的模块
- 通过 WebSocket 将更新信息推送给浏览器
- 浏览器用新模块替换旧模块，保持应用状态

**构建速度优化**：

1. **缩小搜索范围**：

\`\`\`javascript
module.exports = {
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'], // 减少后缀尝试
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'), // 只处理 src 目录
        exclude: /node_modules/
      }
    ]
  }
};
\`\`\`

2. **使用缓存**：

\`\`\`javascript
module.exports = {
  cache: {
    type: 'filesystem' // Webpack 5 文件系统缓存
  }
};
\`\`\`

3. **多进程/多实例构建**：使用 thread-loader 或 HappyPack 进行并行构建。

4. **使用 DllPlugin**：将不常变化的第三方库单独打包，减少构建时间。

### 1.4 Code Splitting（代码分割）

代码分割是将代码分割成多个 chunk，按需加载，减少初始加载体积。

**入口分割**：配置多个入口点，手动分割代码。

**动态导入**：使用 import() 语法动态加载模块。

\`\`\`javascript
// 动态导入
button.addEventListener('click', () => {
  import('./module').then(module => {
    module.default();
  });
});
\`\`\`

**SplitChunksPlugin**：自动提取公共依赖。

\`\`\`javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          priority: 10
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  }
};
\`\`\`

### 1.5 Tree Shaking

Tree Shaking 是一种通过静态分析去除未使用代码的技术。它依赖于 ES Module 的静态结构（import/export 在编译时确定）。

**Webpack 中启用 Tree Shaking**：

\`\`\`javascript
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true, // 标记未使用的导出
    minimize: true     // 在压缩阶段移除未使用的代码
  }
};
\`\`\`

**注意事项**：
- 必须使用 ES Module（import/export），CommonJS 不支持 Tree Shaking
- 确保 babel 配置不将 ES Module 转换为 CommonJS
- 在 package.json 中配置 sideEffects 字段，标记无副作用的文件

\`\`\`json
{
  "sideEffects": [
    "*.css",
    "*.scss"
  ]
}
\`\`\`

### 1.6 Vite

Vite 是新一代前端构建工具，利用浏览器原生 ES Module 支持，实现极速的开发服务器启动和热更新。

**Vite 的核心原理**：

**开发环境**：
- 使用浏览器原生 ES Module 导入，不需要打包
- 将第三方依赖使用 esbuild 预构建成单个文件
- 按需编译，只编译请求的模块
- 使用 esbuild 进行编译，速度极快

**生产环境**：
- 使用 Rollup 进行打包
- 自动代码分割
- CSS 代码分割
- 预加载优化

**Vite vs Webpack 对比**：

| 特性 | Vite | Webpack |
|------|------|---------|
| 冷启动 | 极快（无需打包） | 较慢（需要打包） |
| HMR | 极快（模块级更新） | 随项目增大而变慢 |
| 构建工具 | esbuild + Rollup | Webpack |
| 生态 | 较新，快速发展 | 成熟，插件丰富 |
| 配置 | 简洁，开箱即用 | 需要较多配置 |

### 1.7 Rollup

Rollup 专注于 JavaScript 库的打包，使用 ES Module 进行代码组织。

**Rollup 的特点**：
- 天然的 Tree Shaking 支持
- 输出多种格式（ESM、CJS、UMD、IIFE）
- 打包结果更简洁可读
- 适合打包库，不太适合打包应用

**Rollup 的输出格式**：
- esm：ES Module 格式
- cjs：CommonJS 格式
- umd：通用模块定义
- iife：立即执行函数

### 1.8 esbuild

esbuild 是用 Go 语言编写的极速打包器，速度比 Webpack 快 10-100 倍。

**esbuild 的特点**：
- 极快的构建速度
- 支持 TypeScript、JSX、ES6+ 语法
- 支持 Tree Shaking
- 代码压缩
- 插件系统相对简单

## 2. Babel

### 2.1 Babel 的工作原理

Babel 是一个 JavaScript 编译器，将 ES6+ 代码转换为向后兼容的 JavaScript 代码。

**Babel 的工作流程**：

1. **解析（Parse）**：将源代码解析为 AST（抽象语法树）。
   - 词法分析：将代码字符串分割为 token 流
   - 语法分析：将 token 流转换为 AST

2. **转换（Transform）**：遍历 AST，应用插件对节点进行增删改。
   - 使用 @babel/traverse 进行深度优先遍历
   - 访问者模式（Visitor Pattern），在进入/离开节点时执行操作

3. **生成（Generate）**：将转换后的 AST 生成代码字符串。
   - 使用 @babel/generator 实现
   - 同时生成 source map

### 2.2 AST（抽象语法树）

AST 是源代码的树状结构表示，每个节点代表代码中的一个构造。

\`\`\`javascript
// 源代码
const add = (a, b) => a + b;

// 简化的 AST 结构
{
  type: "VariableDeclaration",
  declarations: [{
    type: "VariableDeclarator",
    id: { type: "Identifier", name: "add" },
    init: {
      type: "ArrowFunctionExpression",
      params: [
        { type: "Identifier", name: "a" },
        { type: "Identifier", name: "b" }
      ],
      body: {
        type: "BinaryExpression",
        operator: "+",
        left: { type: "Identifier", name: "a" },
        right: { type: "Identifier", name: "b" }
      }
    }
  }]
}
\`\`\`

### 2.3 Plugins 和 Presets

**Plugin（插件）**：Babel 的每个转换功能都由一个插件实现。插件定义了如何转换某个特定的语法。

\`\`\`javascript
{
  "plugins": [
    "@babel/plugin-transform-arrow-functions",
    "@babel/plugin-transform-classes"
  ]
}
\`\`\`

**Preset（预设）**：一组插件的集合，方便批量使用。

\`\`\`javascript
{
  "presets": [
    ["@babel/preset-env", {
      "targets": {
        "browsers": ["> 1%", "last 2 versions"]
      },
      "useBuiltIns": "usage",
      "corejs": 3
    }],
    "@babel/preset-react",
    "@babel/preset-typescript"
  ]
}
\`\`\`

**@babel/preset-env**：
- 根据目标环境自动确定需要转换的语法和 polyfill
- 不需要手动配置转换插件
- useBuiltIns 选项控制 polyfill 的引入方式：
  - false：不自动引入 polyfill
  - entry：根据目标环境引入所有需要的 polyfill
  - usage：按需引入实际使用的 polyfill

**@babel/preset-react**：处理 JSX 语法。

**@babel/preset-typescript**：移除 TypeScript 类型注解。

### 2.4 Polyfill

Polyfill 用于在旧浏览器中实现新的 JavaScript API。

**方案一：@babel/polyfill（已废弃）**：包含 core-js 和 regenerator-runtime。

**方案二：core-js + regenerator-runtime**：
- core-js：提供 ES6+ 的 polyfill
- regenerator-runtime：提供 async/await 和 generator 的运行时支持

**方案三：@babel/plugin-transform-runtime**：
- 避免全局污染
- 适合库的开发
- 将辅助函数和 polyfill 从模块导入，而不是内联

### 2.5 Babel 的配置

\`\`\`javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.25%, not dead',
      modules: false, // 保留 ES Module，让 Webpack 做 Tree Shaking
    }]
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }]
      ]
    }
  }
};
\`\`\`

## 3. ESLint 和 Prettier

### 3.1 ESLint

ESLint 是一个可配置的 JavaScript 代码检查工具，用于发现和修复代码中的问题。

**核心概念**：
- Rules：检测规则，每条规则独立检查一个方面
- Configurations：规则集合，如 eslint:recommended
- Plugins：扩展 ESLint 功能的第三方包
- Parsers：将代码解析为 AST 供 ESLint 分析

**常用配置**：

\`\`\`javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'react/prop-types': 'off'
  }
};
\`\`\`

### 3.2 Prettier

Prettier 是一个代码格式化工具，统一代码风格，减少关于代码样式的争论。

\`\`\`json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always"
}
\`\`\`

**ESLint 和 Prettier 的配合**：
- ESLint 负责代码质量检查
- Prettier 负责代码格式统一
- 使用 eslint-config-prettier 关闭 ESLint 中与 Prettier 冲突的规则
- 使用 eslint-plugin-prettier 将 Prettier 作为 ESLint 规则运行

## 4. Git 工作流

### 4.1 Merge vs Rebase

**Merge（合并）**：
- 创建一个新的合并提交，保留完整的分支历史
- 历史记录更完整，但分支图可能复杂
- 非破坏性操作，不会改变已有提交

**Rebase（变基）**：
- 将当前分支的提交移动到目标分支的顶端
- 历史记录更线性、更清晰
- 会改写提交历史，不适合共享分支

**最佳实践**：
- 对私有分支使用 rebase 保持历史整洁
- 对共享分支（如 main、develop）使用 merge 保留完整历史
- 使用 git pull --rebase 代替 git pull 避免不必要的合并提交

### 4.2 常用 Git 工作流

**Git Flow**：
- 主分支：main（生产环境）、develop（开发环境）
- 支持分支：feature、release、hotfix
- 适合有明确发布周期的项目

**GitHub Flow**：
- 主分支：main（始终可部署）
- 功能分支：从 main 创建，完成后通过 PR 合并回 main
- 简单灵活，适合持续部署

**GitLab Flow**：
- 在 GitHub Flow 基础上增加了环境分支（staging、production）
- 适合多环境部署

### 4.3 Conventional Commits（约定式提交）

约定式提交规范统一了提交信息的格式，便于自动化工具处理。

\`\`\`
<type>[optional scope]: <description>

[optional body]

[optional footer]
\`\`\`

**常用类型**：
- feat：新功能
- fix：Bug 修复
- docs：文档变更
- style：代码格式（不影响代码运行）
- refactor：重构
- perf：性能优化
- test：测试
- chore：构建过程或辅助工具的变动
- ci：CI 配置变更

**示例**：

\`\`\`
feat(auth): add login with Google OAuth

- Implement Google OAuth 2.0 flow
- Add session management
- Update user model

Closes #123
\`\`\`

### 4.4 Git Hooks

Git Hooks 是在特定 Git 事件发生时自动执行的脚本。

**常见 Hooks**：
- pre-commit：提交前执行，可用于代码检查
- commit-msg：提交信息编写后执行，可用于验证提交信息格式
- pre-push：推送前执行，可用于运行测试
- post-merge：合并后执行，可用于重新安装依赖

**Husky**：简化 Git Hooks 配置的工具。

\`\`\`json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
\`\`\`

**lint-staged**：只对暂存区的文件运行检查，提高效率。

\`\`\`json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,md}": [
      "prettier --write"
    ]
  }
}
\`\`\`

## 5. CI/CD 流水线

### 5.1 CI/CD 概念

**CI（持续集成）**：频繁地将代码变更合并到主干，自动运行构建和测试，及早发现集成问题。

**CD（持续交付/持续部署）**：
- 持续交付：确保代码随时可部署到生产环境
- 持续部署：自动将通过测试的代码部署到生产环境

### 5.2 前端 CI/CD 流程

典型的流水线通常包含以下阶段：

1. **代码检查**：运行 ESLint、Prettier 检查代码规范
2. **类型检查**：运行 TypeScript 类型检查
3. **单元测试**：运行 Jest/Vitest 单元测试
4. **构建**：运行构建命令，生成生产环境代码
5. **集成测试**：运行端到端测试（Cypress/Playwright）
6. **部署**：将构建产物部署到服务器

### 5.3 GitHub Actions 示例

\`\`\`yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: build
      - run: echo "Deploying..."
      # 部署到服务器的命令
\`\`\`

## 6. Monorepo

### 6.1 Monorepo 概念

Monorepo 是一种将多个项目/包放在同一个仓库中管理的策略。

**优势**：
- 统一的代码管理和版本控制
- 原子提交：跨项目变更可以在一次提交中完成
- 代码复用更方便
- 统一的工具链和开发规范
- 更容易进行重构

**劣势**：
- 仓库体积大
- 构建时间可能较长
- 权限管理更复杂

### 6.2 pnpm Workspace

pnpm 是高效的包管理器，通过硬链接和符号链接节省磁盘空间。

\`\`\`yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
\`\`\`

**pnpm 的优势**：
- 磁盘空间效率高
- 非扁平的 node_modules 结构，避免幽灵依赖
- 严格的依赖解析
- 快速的安装速度

### 6.3 Turborepo

Turborepo 是一个高性能的 Monorepo 构建系统。

**核心特性**：
- 并行执行任务
- 智能缓存：只重新构建发生变化的部分
- 依赖图分析：自动确定任务执行顺序
- 远程缓存：团队共享缓存

\`\`\`json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {}
  }
}
\`\`\`

## 7. 包管理工具

### 7.1 npm、yarn、pnpm 对比

| 特性 | npm | yarn | pnpm |
|------|-----|------|------|
| 安装速度 | 较慢（v7+ 改善） | 较快 | 快 |
| 磁盘效率 | 低（扁平化） | 低（扁平化） | 高（硬链接） |
| node_modules | 扁平化 | 扁平化 | 非扁平化 |
| 幽灵依赖 | 存在 | 存在 | 不存在 |
| 工作空间 | 支持 | 支持 | 原生支持 |
| lock 文件 | package-lock.json | yarn.lock | pnpm-lock.yaml |

**什么是幽灵依赖**：在扁平化的 node_modules 中，依赖的依赖会被提升到顶层，导致项目可以访问未在 package.json 中声明的依赖。这可能导致依赖变更时项目代码不可预期的行为。

### 7.2 语义化版本（Semver）

版本格式：MAJOR.MINOR.PATCH

- MAJOR：不兼容的 API 修改
- MINOR：向后兼容的功能新增
- PATCH：向后兼容的问题修复

**版本范围符号**：
- ^：兼容版本，允许 MINOR 和 PATCH 变化（^1.2.3 → >=1.2.3 <2.0.0）
- ~：约等于版本，允许 PATCH 变化（~1.2.3 → >=1.2.3 <1.3.0）
- *：任意版本
- >=、<=、>、<：比较版本

## 8. Docker 基础

### 8.1 Docker 核心概念

**镜像（Image）**：应用程序及其运行环境的只读模板。

**容器（Container）**：镜像的运行实例，相互隔离。

**Dockerfile**：定义镜像构建过程的文本文件。

**Docker Compose**：定义和运行多容器应用的工具。

### 8.2 前端项目 Dockerfile 示例

\`\`\`dockerfile
# 多阶段构建
# 阶段 1：构建
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 阶段 2：运行
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

### 8.3 前端项目 Docker Compose 示例

\`\`\`yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - api
  api:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
\`\`\`

## 9. 常见工程化面试题

### 9.1 Webpack 的 Loader 和 Plugin 有什么区别？

Loader 是文件转换器，在模块加载时对文件内容进行转换（如将 SCSS 转换为 CSS 再注入页面）。Loader 在 module.rules 中配置，是一个函数，接收源文件内容，返回转换后的结果。

Plugin 是功能扩展器，在 Webpack 构建的整个生命周期中注入自定义行为。Plugin 是一个类，包含 apply 方法，通过 Webpack 的钩子系统在特定阶段执行操作。

### 9.2 如何提升 Webpack 构建速度？

- 使用 cache 或 cache-loader 缓存构建结果
- 使用 thread-loader 或 HappyPack 多进程构建
- 配置 resolve.extensions 和 resolve.alias 缩小搜索范围
- 使用 include/exclude 限制 Loader 的处理范围
- 使用 DllPlugin 预编译第三方库
- 升级到 Webpack 5，使用持久化缓存
- 使用 esbuild-loader 替代 babel-loader

### 9.3 Vite 为什么比 Webpack 快？

开发环境下，Vite 不需要打包整个应用，而是利用浏览器原生 ES Module 支持，按需提供文件。Webpack 需要先打包所有模块，项目越大启动越慢。Vite 的 HMR 也是基于 ESM，只更新变化的模块，不需要重新构建整个 bundle。

### 9.4 Tree Shaking 的原理是什么？

Tree Shaking 依赖于 ES Module 的静态结构。在编译时，打包工具可以分析模块的 import/export 关系，确定哪些代码被使用、哪些未被使用。未被使用的导出会被标记为 dead code，在压缩阶段被移除。

### 9.5 Babel 和 Polyfill 的关系？

Babel 负责语法转换（如箭头函数、类、解构等），将新语法转换为旧语法。Polyfill 负责 API 补充（如 Promise、Array.from、Object.assign 等），在旧环境中实现新的 API。两者配合使用才能完整支持新特性。
`
  },

  // ============================================================
  // 第 9 章：性能优化面试题
  // ============================================================
  {
    id: "fe-performance",
    group: "框架与工程化",
    icon: "🚀",
    title: "性能优化面试题",
    content: `
# 性能优化面试题

## 1. Core Web Vitals（核心 Web 指标）

Core Web Vitals 是 Google 定义的一组衡量 Web 用户体验的关键指标，是 SEO 排名的重要因素。

### 1.1 LCP（Largest Contentful Paint，最大内容绘制）

LCP 衡量页面的主要内容何时加载完成，即视口内最大的内容元素（图片、视频、文本块）渲染完成的时间。

**标准**：
- 良好：≤ 2.5 秒
- 需要改进：2.5 秒 - 4.0 秒
- 差：> 4.0 秒

**LCP 元素类型**：
- <img> 元素
- <image> 元素（SVG 中的）
- <video> 元素的封面图
- 通过 url() 加载背景图的元素
- 包含文本节点的块级元素

**优化 LCP 的策略**：

1. **优化服务器响应时间**：
   - 使用 CDN 分发静态资源
   - 优化服务端代码，减少 TTFB
   - 使用 HTTP/2 或 HTTP/3

2. **优化资源加载**：
   - 对 LCP 图片使用 preload
   - 使用 fetchpriority="high" 提升优先级
   - 避免在 LCP 元素上使用 lazy loading

3. **优化渲染**：
   - 减少渲染阻塞资源（CSS 和 JavaScript）
   - 内联关键 CSS
   - 使用 SSR/SSG 减少客户端渲染时间

4. **优化 LCP 元素本身**：
   - 压缩图片，使用 WebP/AVIF 格式
   - 使用响应式图片（srcset）
   - 确保 LCP 元素尽早出现在 HTML 中

### 1.2 FID（First Input Delay，首次输入延迟）

FID 衡量用户首次与页面交互时（点击链接、按钮等），浏览器实际响应事件的时间。

**标准**：
- 良好：≤ 100 毫秒
- 需要改进：100 毫秒 - 300 毫秒
- 差：> 300 毫秒

**FID 产生的原因**：
- 主线程被 JavaScript 执行阻塞
- 长任务（Long Task，超过 50ms 的任务）
- 大量的 JavaScript 解析和执行

**优化 FID 的策略**：

1. **代码分割**：
   - 按路由拆分代码
   - 按需加载第三方库
   - 动态导入非关键功能

2. **减少 JavaScript 执行时间**：
   - 使用 Web Worker 处理密集计算
   - 将长任务拆分为小任务
   - 使用 requestIdleCallback 延迟非关键任务

3. **优化第三方脚本**：
   - 延迟加载第三方脚本（async/defer）
   - 评估第三方脚本的必要性

### 1.3 CLS（Cumulative Layout Shift，累积布局偏移）

CLS 衡量页面在加载过程中视觉稳定性的指标，即页面元素意外移动的程度。

**标准**：
- 良好：≤ 0.1
- 需要改进：0.1 - 0.25
- 差：> 0.25

**CLS 产生的原因**：
- 没有尺寸的图片或视频
- 动态注入的内容（广告、嵌入内容）
- 使用 Web 字体导致 FOIT/FOUT
- 在现有内容上方插入 DOM 元素

**优化 CLS 的策略**：

1. **为媒体元素设置尺寸**：

\`\`\`html
<img src="image.jpg" width="640" height="360" alt="Description" />
\`\`\`

或使用 CSS aspect-ratio：

\`\`\`css
img {
  width: 100%;
  height: auto;
  aspect-ratio: 16/9;
}
\`\`\`

2. **为广告/嵌入内容预留空间**：

\`\`\`css
.ad-container {
  min-height: 250px;
}
\`\`\`

3. **避免在现有内容上方插入内容**：
   - 将动态内容插入到现有内容下方
   - 使用骨架屏占位

4. **优化字体加载**：
   - 使用 font-display: optional 或 swap
   - 预加载关键字体
   - 使用 fallback 字体进行大小匹配

## 2. 性能指标深入

### 2.1 FP（First Paint，首次绘制）

FP 是从导航开始到浏览器首次将任何像素渲染到屏幕上的时间。这是用户看到任何视觉变化的第一时刻。

### 2.2 FCP（First Contentful Paint，首次内容绘制）

FCP 是浏览器首次渲染任何文本、图片、非空白 Canvas 或 SVG 的时间。与 FP 不同，FCP 要求渲染的是有意义的内容。

**标准**：
- 良好：≤ 1.8 秒
- 需要改进：1.8 秒 - 3.0 秒
- 差：> 3.0 秒

### 2.3 TTI（Time to Interactive，可交互时间）

TTI 是页面完全可交互的时间。具体来说，是指页面显示有用内容（FCP 已完成）、事件处理器已注册、页面响应时间在 50ms 以内。

**优化 TTI**：
- 代码分割和懒加载
- 减少 JavaScript 执行时间
- 优化关键渲染路径

### 2.4 TBT（Total Blocking Time，总阻塞时间）

TBT 衡量 FCP 和 TTI 之间主线程被阻塞的总时间，即长任务（超过 50ms 的任务）的阻塞部分之和。

**标准**：
- 良好：≤ 200 毫秒
- 需要改进：200 毫秒 - 600 毫秒
- 差：> 600 毫秒

### 2.5 SI（Speed Index，速度指数）

SI 衡量页面内容视觉填充的速度。通过计算页面加载过程中视觉变化的程度来衡量。

## 3. 网络优化

### 3.1 CDN（内容分发网络）

CDN 通过在全球各地部署边缘节点，将内容缓存到离用户最近的服务器上，减少网络延迟。

**CDN 的工作原理**：
1. 用户请求资源时，DNS 解析到最近的 CDN 节点
2. 如果节点有缓存，直接返回缓存内容
3. 如果没有缓存，从源站获取内容并缓存
4. 后续请求直接使用缓存

**CDN 的优化策略**：
- 静态资源（JS、CSS、图片）使用 CDN 分发
- 使用多个 CDN 域名突破浏览器并发连接限制
- 设置合理的缓存策略（Cache-Control）

### 3.2 资源压缩

**Gzip 压缩**：
- 最常用的 HTTP 压缩方式
- 文本资源（HTML、CSS、JS、JSON）压缩率约 60-80%
- 通过 Content-Encoding: gzip 响应头告知浏览器

**Brotli 压缩**：
- Google 开发的压缩算法
- 比 Gzip 压缩率更高（约 20% 提升）
- 需要通过 Content-Encoding: br 响应头告知
- 需要 HTTPS 支持

**配置示例（Nginx）**：

\`\`\`nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml;
gzip_min_length 256;
gzip_comp_level 6;
\`\`\`

### 3.3 HTTP/2 多路复用

HTTP/1.1 的局限性：
- 每个 TCP 连接只能处理一个请求（队头阻塞）
- 浏览器限制同域名的并发连接数（通常 6-8 个）
- 请求头冗余

HTTP/2 的改进：
- **多路复用**：一个 TCP 连接上可以同时处理多个请求/响应
- **头部压缩**：使用 HPACK 算法压缩请求头，减少重复传输
- **服务器推送**：服务器可以主动推送客户端可能需要的资源
- **二进制分帧**：将消息分解为二进制帧，提高传输效率

**HTTP/2 对前端优化的影响**：
- 不再需要雪碧图、文件合并等减少请求数的优化
- 但仍需要代码分割、按需加载等优化

### 3.4 HTTP/3（QUIC）

HTTP/3 基于 QUIC 协议（UDP），进一步改进：
- 0-RTT 连接建立
- 更好的多路复用（无队头阻塞）
- 连接迁移（网络切换时不断开连接）

## 4. 资源加载优化

### 4.1 懒加载（Lazy Loading）

**图片懒加载**：

原生懒加载（推荐）：

\`\`\`html
<img src="image.jpg" loading="lazy" alt="Description" />
\`\`\`

JavaScript 实现（使用 Intersection Observer）：

\`\`\`javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});
\`\`\`

**组件懒加载**：

\`\`\`javascript
// React
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

// Vue
const LazyComponent = defineAsyncComponent(() => import('./HeavyComponent.vue'));
\`\`\`

### 4.2 Preload（预加载）

Preload 用于提前加载当前页面即将使用的关键资源。

\`\`\`html
<!-- 预加载关键字体 -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>

<!-- 预加载关键 CSS -->
<link rel="preload" href="/styles/critical.css" as="style">

<!-- 预加载关键图片 -->
<link rel="preload" href="/images/hero.webp" as="image">

<!-- 预加载关键 JavaScript -->
<link rel="preload" href="/scripts/main.js" as="script">
\`\`\`

**Preload 的使用场景**：
- 关键字体文件
- 首屏重要图片
- 关键 CSS（Critical CSS）
- 延迟加载的脚本中需要的资源

### 4.3 Prefetch（预获取）

Prefetch 用于提前获取未来可能需要的资源。

\`\`\`html
<!-- 预获取下一个页面的资源 -->
<link rel="prefetch" href="/page2.html">

<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//api.example.com">

<!-- 预连接 -->
<link rel="preconnect" href="https://api.example.com">

<!-- 预渲染整个页面 -->
<link rel="prerender" href="/next-page.html">
\`\`\`

**Preload vs Prefetch vs Preconnect 对比**：

| 属性 | 时机 | 优先级 | 用途 |
|------|------|--------|------|
| preload | 当前页面立即需要 | 高 | 当前页面的关键资源 |
| prefetch | 未来可能需要 | 低 | 下一个页面的资源 |
| preconnect | 即将需要连接 | - | 提前建立连接 |
| dns-prefetch | 即将需要 DNS | - | 提前 DNS 解析 |

### 4.4 async 和 defer

\`\`\`html
<!-- 普通 script：阻塞 HTML 解析 -->
<script src="script.js"></script>

<!-- async：异步下载，下载完立即执行（执行时阻塞 HTML 解析） -->
<script src="script.js" async></script>

<!-- defer：异步下载，等 HTML 解析完再按顺序执行 -->
<script src="script.js" defer></script>
\`\`\`

**async 和 defer 的区别**：
- async：下载完立即执行，执行顺序不确定，适合独立脚本（如统计脚本）
- defer：等 DOM 解析完再执行，执行顺序确定，适合依赖 DOM 的脚本
- 两者都不阻塞 HTML 解析

## 5. 代码优化

### 5.1 代码分割（Code Splitting）

代码分割是前端性能优化的核心策略之一，将代码分成多个小块，按需加载。

**路由级别的代码分割**：

\`\`\`javascript
// React Router
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));

// Vue Router
const routes = [
  { path: '/home', component: () => import('./pages/Home.vue') },
  { path: '/about', component: () => import('./pages/About.vue') }
];
\`\`\`

**组件级别的代码分割**：

\`\`\`javascript
// 按交互触发
const handleClick = async () => {
  const module = await import('./heavyModule');
  module.doSomething();
};
\`\`\`

### 5.2 Tree Shaking

Tree Shaking 通过静态分析移除未使用的代码，减少最终打包体积。

**确保 Tree Shaking 生效的条件**：
1. 使用 ES Module（import/export）
2. 确保 Babel 不转换 ES Module 为 CommonJS
3. 在 package.json 中配置 sideEffects 字段

\`\`\`json
{
  "sideEffects": ["*.css", "*.scss"]
}
\`\`\`

### 5.3 Dead Code Elimination（死代码消除）

与 Tree Shaking 不同，Dead Code Elimination 是在更细粒度上移除不可能执行的代码。

\`\`\`javascript
// 构建前
if (process.env.NODE_ENV === 'development') {
  console.log('debug info');
}

// 构建后（生产环境），这段代码会被完全移除
\`\`\`

### 5.4 第三方库优化

**按需引入**：

\`\`\`javascript
// 全量引入（不推荐）
import _ from 'lodash';

// 按需引入（推荐）
import debounce from 'lodash/debounce';

// 或使用 tree-shaking 友好的库
import { debounce } from 'lodash-es';
\`\`\`

**替换大型库**：
- moment.js（约 230KB）→ day.js（约 2KB）
- lodash → 原生 JavaScript 方法
- axios → fetch API（如果不需要拦截器等功能）

## 6. 渲染优化

### 6.1 虚拟滚动（Virtual Scrolling）

虚拟滚动只渲染可视区域内的元素，大幅减少 DOM 节点数量，适合处理长列表。

**原理**：
1. 计算可视区域能容纳的元素数量
2. 根据滚动位置计算需要渲染的元素范围
3. 使用 padding 或 transform 模拟滚动条高度
4. 只渲染可视区域内的元素

**常用库**：
- react-window / react-virtualized（React）
- vue-virtual-scroller（Vue）

### 6.2 requestAnimationFrame

requestAnimationFrame 在浏览器下一次重绘之前执行回调，适合处理动画和视觉更新。

\`\`\`javascript
function animate() {
  // 更新动画
  element.style.transform = \`translateX(\${position}px)\`;
  position += 1;

  if (position < target) {
    requestAnimationFrame(animate);
  }
}

requestAnimationFrame(animate);
\`\`\`

**requestAnimationFrame 的优势**：
- 与浏览器的刷新频率同步（通常 60fps）
- 页面不可见时暂停执行，节省资源
- 自动合并多个动画到一次重绘中

### 6.3 will-change

will-change 用于提前告知浏览器元素将要发生的变化，让浏览器提前优化。

\`\`\`css
.element {
  will-change: transform, opacity;
}
\`\`\`

**使用注意事项**：
- 不要给太多元素应用 will-change
- 在变化发生前添加，变化结束后移除
- 过度使用会消耗更多内存

### 6.4 CSS 触发重排（Reflow）和重绘（Repaint）

**重排（Reflow）**：当元素的几何属性（位置、尺寸）发生变化时，浏览器需要重新计算布局。重排成本高，会影响整个页面。

触发重排的操作：
- 添加/删除 DOM 元素
- 修改元素的尺寸、位置
- 修改字体大小
- 改变窗口大小
- 读取某些属性（offsetTop、offsetLeft、scrollTop 等）

**重绘（Repaint）**：当元素的视觉属性（颜色、背景、阴影）改变但不影响布局时，浏览器只需要重新绘制元素。重绘成本较低。

触发重绘的操作：
- 修改 color、background-color
- 修改 box-shadow
- 修改 visibility

**优化建议**：
- 使用 transform 和 opacity 实现动画（只触发合成，不触发重排和重绘）
- 批量修改 DOM（使用 DocumentFragment 或 display: none）
- 避免在循环中读取布局属性
- 使用 CSS class 批量修改样式，而不是逐个修改

### 6.5 合成（Compositing）

现代浏览器的渲染分为三个阶段：
1. 布局（Layout）：计算元素的位置和大小
2. 绘制（Paint）：填充像素
3. 合成（Composite）：将各层合并为最终图像

transform 和 opacity 的变化只需要合成阶段，不需要重排和重绘，因此性能最好。

**创建合成层**：
- 3D transform（translateZ(0)）
- will-change: transform
- <video>、<canvas>、<iframe> 元素
- CSS 动画和过渡

## 7. 图片优化

### 7.1 图片格式选择

**JPEG**：适合照片和复杂颜色图像，有损压缩。不支持透明。

**PNG**：无损压缩，支持透明。适合图标、Logo、需要透明背景的图像。

**WebP**：Google 开发的格式，同时支持有损和无损压缩，支持透明。比 JPEG 小 25-35%，比 PNG 小 26%。

**AVIF**：新一代格式，基于 AV1 视频编码。比 WebP 更小，质量更高。兼容性正在增长。

**SVG**：矢量格式，适合图标、Logo、简单插图。无限缩放不模糊。

**选择建议**：
- 照片 → WebP（降级 JPEG）
- 图标 → SVG
- 需要透明 → WebP（降级 PNG）
- 追求极致压缩 → AVIF

### 7.2 响应式图片

使用 srcset 和 sizes 为不同屏幕提供不同尺寸的图片。

\`\`\`html
<img
  src="image-800.jpg"
  srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  alt="Description"
/>
\`\`\`

使用 <picture> 元素提供不同格式：

\`\`\`html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
\`\`\`

### 7.3 图片懒加载

现代浏览器原生支持：

\`\`\`html
<img src="image.jpg" loading="lazy" alt="Description" />
\`\`\`

同时设置 decoding="async" 可以异步解码图片，不阻塞主线程：

\`\`\`html
<img src="image.jpg" loading="lazy" decoding="async" alt="Description" />
\`\`\`

## 8. 缓存策略

### 8.1 HTTP 缓存

**强缓存**：

- Expires：指定过期时间（HTTP/1.0，绝对时间）
- Cache-Control：更灵活的缓存控制（HTTP/1.1）

\`\`\`
Cache-Control: max-age=31536000, immutable
\`\`\`

常用指令：
- max-age=N：缓存 N 秒
- no-cache：需要验证后才能使用缓存
- no-store：不缓存任何内容
- public：任何中间节点都可以缓存
- private：仅浏览器可以缓存
- immutable：资源不会变化，不需要重新验证

**协商缓存**：

- Last-Modified / If-Modified-Since：基于时间
- ETag / If-None-Match：基于内容哈希

**最佳实践**：
- HTML 文件：使用协商缓存（no-cache）
- CSS/JS 文件（带 hash）：使用强缓存（max-age=31536000, immutable）
- 图片/字体：使用强缓存

### 8.2 Service Worker 缓存

Service Worker 可以拦截网络请求，实现离线缓存和更精细的缓存控制。

**缓存策略**：

1. **Cache First（缓存优先）**：先查缓存，缓存没有才请求网络。适合不常变化的静态资源。

2. **Network First（网络优先）**：先请求网络，失败时使用缓存。适合需要最新数据但需要离线支持的场景。

3. **Stale While Revalidate（后台更新）**：先返回缓存，同时发起网络请求更新缓存。适合需要在速度和新鲜度之间平衡的场景。

4. **Cache Only（仅缓存）**：只从缓存获取。适合确定不变的资源。

5. **Network Only（仅网络）**：只从网络获取。适合不需要缓存的请求。

### 8.3 浏览器缓存（LocalStorage / SessionStorage / IndexedDB）

| 存储方式 | 容量 | 持久性 | 作用域 | 适用场景 |
|---------|------|--------|--------|---------|
| Cookie | 4KB | 可设置过期 | 同源 | 身份验证 |
| LocalStorage | 5-10MB | 永久 | 同源 | 用户偏好设置 |
| SessionStorage | 5-10MB | 会话级别 | 同源同标签页 | 表单数据暂存 |
| IndexedDB | 无限制 | 永久 | 同源 | 大量结构化数据 |

## 9. Bundle 分析

### 9.1 webpack-bundle-analyzer

webpack-bundle-analyzer 可视化了 Webpack 打包后的文件组成，帮助发现体积问题。

**使用方法**：

\`\`\`javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ]
};
\`\`\`

**分析要点**：
- 找出体积最大的模块
- 检查是否有重复打包的依赖
- 确认 Tree Shaking 是否生效
- 检查是否有不必要的 polyfill

### 9.2 source-map-explorer

可以直接分析 source map 的工具，不需要修改 Webpack 配置。

### 9.3 常见打包问题

**重复打包**：同一个库被多个 chunk 重复打包。解决：使用 SplitChunksPlugin 提取公共依赖。

**moment.js 的 locale 文件**：moment.js 默认包含所有语言的 locale 文件。解决：使用 IgnorePlugin 排除不需要的 locale。

**过大的第三方库**：考虑替换为更轻量的替代品。

## 10. 性能监控

### 10.1 Lighthouse

Lighthouse 是 Google 开发的开源自动化工具，用于审计网页的性能、可访问性、最佳实践和 SEO。

**使用方式**：
- Chrome DevTools 内置
- Chrome 扩展
- 命令行工具
- PageSpeed Insights（在线服务）
- CI/CD 集成

**Lighthouse 性能评分维度**：
- FCP（First Contentful Paint）
- SI（Speed Index）
- LCP（Largest Contentful Paint）
- TTI（Time to Interactive）
- TBT（Total Blocking Time）
- CLS（Cumulative Layout Shift）

### 10.2 WebPageTest

WebPageTest 提供更详细的性能分析和多地域、多设备测试。

**核心功能**：
- 瀑布图：显示每个资源的加载时序
- 视频录制：记录页面加载过程
- 多地域测试：从不同地理位置测试
- 多设备测试：模拟不同设备和网络条件
- 内容拆分：分析不同类型内容的加载时间

### 10.3 Performance API

浏览器提供的 Performance API，可以在代码中获取性能数据。

\`\`\`javascript
// 获取导航时序
const timing = performance.timing;
const pageLoadTime = timing.loadEventEnd - timing.navigationStart;

// 获取资源加载时序
const entries = performance.getEntriesByType('resource');

// PerformanceObserver 监听性能指标
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.startTime, entry.duration);
  }
});
observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'] });
\`\`\`

### 10.4 自定义性能监控

**关键指标监控**：

\`\`\`javascript
// 使用 web-vitals 库
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // 发送到分析服务
  console.log(metric.name, metric.value);
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);
\`\`\`

**自定义时间点监控**：

\`\`\`javascript
// 使用 User Timing API
performance.mark('component-mounted');
// ... 组件挂载完成
performance.measure('mount-time', 'component-mounted');

const measure = performance.getEntriesByName('mount-time')[0];
console.log(\`Component mount time: \${measure.duration}ms\`);
\`\`\`

## 11. 常见性能优化面试题

### 11.1 首屏加载速度优化有哪些方法？

- 使用 SSR/SSG 减少客户端渲染时间
- 代码分割和路由懒加载，减少初始 JavaScript 体积
- 内联关键 CSS，延迟加载非关键 CSS
- 图片优化（压缩、WebP 格式、响应式图片、懒加载）
- 使用 CDN 分发静态资源
- 启用 Gzip/Brotli 压缩
- 使用 HTTP/2 多路复用
- 预加载关键资源（preload）
- 使用骨架屏提升感知性能
- 优化字体加载（font-display: swap）

### 11.2 如何优化长列表渲染性能？

- 使用虚拟滚动（只渲染可视区域内的元素）
- 使用分页或无限滚动加载
- 使用 React.memo 或 Vue 的计算属性缓存渲染结果
- 避免在列表项中使用复杂的计算
- 使用 key 提高 Diff 效率

### 11.3 如何分析和定位性能瓶颈？

- 使用 Lighthouse 进行全面审计
- 使用 Chrome DevTools Performance 面板分析运行时性能
- 使用 webpack-bundle-analyzer 分析打包体积
- 使用 Performance API 进行自定义监控
- 使用 WebPageTest 进行多场景测试

### 11.4 重排和重绘的区别？如何避免？

重排是元素几何属性变化导致布局重新计算，成本高。重绘是视觉属性变化导致的重新绘制，成本较低。

避免方法：
- 使用 transform 和 opacity 实现动画
- 批量修改 DOM（使用 DocumentFragment）
- 使用 CSS class 修改样式
- 避免在循环中读取布局属性
- 对复杂动画使用 position: absolute 或 fixed 脱离文档流

### 11.5 前端性能优化的目标和原则？

目标：为用户提供流畅、快速的体验。具体包括：
- 首屏加载：2 秒以内
- 页面交互响应：100ms 以内
- 动画帧率：60fps
- 核心 Web 指标达标（LCP ≤ 2.5s, FID ≤ 100ms, CLS ≤ 0.1）

原则：
- 先测量再优化，用数据驱动决策
- 关注用户体验，优化用户直接感知的部分
- 持续监控，性能会随着代码变更而退化
- 在开发阶段就考虑性能，而不是事后补救
`
  },

  // ============================================================
  // 第 10 章：前端安全面试题
  // ============================================================
  {
    id: "fe-security",
    group: "框架与工程化",
    icon: "🔒",
    title: "前端安全面试题",
    content: `
# 前端安全面试题

## 1. XSS（跨站脚本攻击）

XSS（Cross-Site Scripting）是最常见的 Web 安全漏洞之一，攻击者通过在网页中注入恶意脚本，当其他用户浏览该页面时，恶意脚本被执行，从而窃取用户信息、会话令牌等。

### 1.1 XSS 的三种类型

**反射型 XSS（Reflected XSS）**：

反射型 XSS 是最简单的 XSS 类型。攻击者将恶意脚本放在 URL 参数中，当用户点击包含恶意脚本的链接时，服务器将脚本反射回页面并执行。

攻击流程：
1. 攻击者构造包含恶意脚本的 URL
2. 诱使用户点击该链接
3. 服务器将 URL 参数直接嵌入到页面中
4. 浏览器解析页面时执行恶意脚本

示例场景：搜索功能将搜索关键词直接显示在页面上，没有进行编码。

\`\`\`javascript
// 有漏洞的代码
const query = new URLSearchParams(location.search).get('q');
document.getElementById('result').innerHTML = \`搜索 "\${query}" 的结果：\`;
\`\`\`

攻击者可以构造 URL：
\`\`\`
https://example.com/search?q=<script>alert('XSS')</script>
\`\`\`

**存储型 XSS（Stored XSS）**：

存储型 XSS 是最危险的 XSS 类型。攻击者将恶意脚本提交到服务器（如评论、用户资料），服务器将其存储在数据库中。当其他用户访问包含该内容的页面时，恶意脚本被执行。

攻击流程：
1. 攻击者提交包含恶意脚本的内容（如评论表单）
2. 服务器存储该内容到数据库
3. 其他用户访问包含该内容的页面
4. 恶意脚本在用户浏览器中执行

危害更大：影响所有访问该内容的用户，不需要诱使用户点击特殊链接。

**DOM 型 XSS（DOM-based XSS）**：

DOM 型 XSS 完全发生在客户端，不经过服务器。恶意脚本通过修改 DOM 环境来执行。

\`\`\`javascript
// 有漏洞的代码
const hash = location.hash.slice(1);
document.getElementById('content').innerHTML = hash;
\`\`\`

攻击者构造 URL：
\`\`\`
https://example.com/#<img src=x onerror="alert('XSS')">
\`\`\`

### 1.2 XSS 的防御措施

**1. 输出编码（Output Encoding）**：

根据输出上下文选择合适的编码方式：

- HTML 上下文：将 <、>、"、'、& 等特殊字符转换为 HTML 实体
- HTML 属性上下文：对属性值进行 HTML 属性编码
- JavaScript 上下文：对插入 JavaScript 代码的数据进行 JavaScript 编码
- URL 上下文：使用 URL 编码
- CSS 上下文：使用 CSS 编码

\`\`\`javascript
// HTML 实体编码
function escapeHtml(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
  };
  return str.replace(/[&<>"']/g, char => map[char]);
}
\`\`\`

**2. 使用安全的 DOM API**：

避免使用 innerHTML、document.write 等不安全的 API，使用 textContent、innerText 等安全的替代方案。

\`\`\`javascript
// 不安全
element.innerHTML = userInput;

// 安全
element.textContent = userInput;

// 使用 DOMPurify 等库进行 HTML 净化
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
\`\`\`

**3. CSP（Content Security Policy，内容安全策略）**：

CSP 通过 HTTP 响应头或 <meta> 标签定义允许加载资源的来源，有效防止 XSS 攻击。

\`\`\`
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-random123'; style-src 'self' 'unsafe-inline'; img-src 'self' https://images.example.com;
\`\`\`

常用指令：
- default-src：默认的资源加载策略
- script-src：允许的脚本来源
- style-src：允许的样式来源
- img-src：允许的图片来源
- connect-src：允许的连接目标（XHR、WebSocket 等）
- font-src：允许的字体来源
- frame-src：允许的 frame 来源

**4. HttpOnly Cookie**：

将 Cookie 标记为 HttpOnly，防止 JavaScript 通过 document.cookie 访问 Cookie。

\`\`\`
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict
\`\`\`

**5. 输入验证**：

- 对用户输入进行白名单验证
- 限制输入长度和格式
- 在服务端和客户端都进行验证

**6. 前端框架的自动防护**：

现代前端框架（React、Vue、Angular）默认对输出进行编码：

- React：JSX 中的变量默认被转义
- Vue：模板中的插值 {{ }} 默认被转义
- Angular：默认对所有值进行净化

**框架中需要注意的危险操作**：

\`\`\`javascript
// React 中危险的操作
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// Vue 中危险的操作
<div v-html="userInput"></div>

// Angular 中危险的操作
<div [innerHTML]="userInput"></div>
\`\`\`

### 1.3 XSS 的面试考点

**XSS 的危害**：
- 窃取用户的 Cookie 和 Session
- 窃取用户的敏感信息
- 劫持用户会话，执行未授权操作
- 修改页面内容，进行钓鱼攻击
- 传播蠕虫

**为什么 XSS 叫跨站脚本**：
最初 XSS 主要利用跨站请求来注入脚本，但现在的 XSS 不一定要跨站。这个名字是历史原因保留的。

## 2. CSRF（跨站请求伪造）

### 2.1 CSRF 攻击原理

CSRF（Cross-Site Request Forgery）攻击者诱导用户在已登录的网站中执行非预期的操作。攻击者利用用户已登录的身份，在用户不知情的情况下发送请求。

**攻击流程**：
1. 用户登录了网站 A（如银行网站），浏览器保存了 Cookie
2. 用户访问了恶意网站 B（或点击了恶意链接）
3. 网站 B 向网站 A 发送请求（如表单提交、API 调用）
4. 浏览器自动携带网站 A 的 Cookie
5. 网站 A 以为请求来自合法用户，执行了操作

**攻击示例**：

\`\`\`html
<!-- 恶意网站上的代码 -->
<img src="https://bank.com/transfer?to=attacker&amount=10000" style="display:none">

<!-- 或使用表单 -->
<form action="https://bank.com/transfer" method="POST" id="hack">
  <input type="hidden" name="to" value="attacker">
  <input type="hidden" name="amount" value="10000">
</form>
<script>document.getElementById('hack').submit();</script>
\`\`\`

### 2.2 CSRF 的防御措施

**1. SameSite Cookie**：

SameSite 属性控制 Cookie 是否随跨站请求发送。

\`\`\`
Set-Cookie: sessionId=abc123; SameSite=Strict
\`\`\`

三种取值：
- Strict：完全禁止跨站发送 Cookie，最安全
- Lax：允许部分跨站请求（GET 导航）发送 Cookie，默认值
- None：允许跨站发送 Cookie，需要配合 Secure

**2. CSRF Token**：

在请求中包含一个随机生成的 Token，服务器验证 Token 的有效性。

实现方式：
1. 服务器生成 CSRF Token，存储在会话中
2. 将 Token 嵌入到表单的隐藏字段或请求头中
3. 提交请求时，服务器验证 Token 是否匹配

\`\`\`html
<form action="/transfer" method="POST">
  <input type="hidden" name="csrf_token" value="random_token_here">
  <!-- 表单内容 -->
</form>
\`\`\`

在 AJAX 请求中使用：

\`\`\`javascript
fetch('/api/data', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
\`\`\`

**3. Referer/Origin 检查**：

验证请求的 Referer 或 Origin 头是否来自可信的域名。

\`\`\`javascript
// 服务端验证
const allowedOrigins = ['https://example.com', 'https://www.example.com'];
const origin = req.headers.origin;
if (!allowedOrigins.includes(origin)) {
  return res.status(403).json({ error: 'Forbidden' });
}
\`\`\`

**4. 自定义请求头**：

添加自定义请求头，利用浏览器同源策略，跨域请求无法设置自定义请求头。

\`\`\`javascript
fetch('/api/data', {
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
});
\`\`\`

**5. 双重 Cookie 验证**：

在 Cookie 和请求参数中都设置相同的随机值，服务器验证两者是否一致。

### 2.3 CSRF 的面试考点

**CSRF 和 XSS 的区别**：
- XSS 利用用户对网站的信任，注入恶意脚本
- CSRF 利用网站对用户浏览器的信任，伪造请求
- XSS 可以绕过 CSRF 的防御（因为可以读取 CSRF Token）
- 同时防御 XSS 和 CSRF 才能保证安全

**为什么 CSRF Token 能防御 CSRF**：
CSRF Token 是一个随机值，攻击者无法获取。虽然浏览器会自动携带 Cookie，但攻击者无法在请求中包含正确的 CSRF Token，因此请求会被服务器拒绝。

**SameSite Cookie 的局限性**：
- 旧浏览器不支持
- Strict 模式可能影响用户体验（如从邮件链接跳转时未登录）
- Lax 模式对 POST 请求有效，但 GET 请求仍可能被利用

## 3. SQL 注入

### 3.1 SQL 注入原理

SQL 注入是通过将恶意 SQL 代码插入到应用程序的查询中，从而操纵数据库的攻击方式。

**攻击示例**：

\`\`\`sql
-- 正常的查询
SELECT * FROM users WHERE username = 'user' AND password = 'password';

-- SQL 注入攻击
SELECT * FROM users WHERE username = 'admin' -- ' AND password = 'password';
-- 如果用户输入 username 为 admin' --，注释掉了后面的密码检查
\`\`\`

### 3.2 SQL 注入的防御措施

**1. 参数化查询（Prepared Statements）**：

这是最有效的防御方式。将 SQL 语句和数据分开，确保用户输入不会被解释为 SQL 代码。

\`\`\`javascript
// 使用参数化查询
const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
db.execute(query, [username, password]);
\`\`\`

**2. 输入验证和转义**：

- 对用户输入进行白名单验证
- 使用数据库驱动提供的转义函数
- 不要自己拼接 SQL 语句

**3. 最小权限原则**：

- 数据库用户只授予必要的权限
- 应用使用受限的数据库账户
- 不同环境使用不同的数据库账户

**4. ORM 框架**：

使用 ORM（Object-Relational Mapping）框架，它们通常内置了 SQL 注入防护。

\`\`\`javascript
// 使用 ORM（如 Sequelize、TypeORM、Prisma）
const user = await User.findOne({
  where: { username: username }
});
\`\`\`

## 4. Clickjacking（点击劫持）

### 4.1 Clickjacking 攻击原理

Clickjacking 通过在透明 iframe 中嵌入目标网站，诱使用户点击透明层上的按钮，实际点击的是目标网站上的元素。

**攻击流程**：
1. 攻击者创建恶意网页，包含目标网站（如社交网站的"关注"按钮）的透明 iframe
2. 在透明 iframe 上方覆盖诱使用户点击的元素（如"点击领取奖品"按钮）
3. 用户点击时，实际点击的是 iframe 中的按钮
4. 用户在不知情的情况下执行了操作

### 4.2 Clickjacking 的防御措施

**1. X-Frame-Options 响应头**：

\`\`\`
X-Frame-Options: DENY
\`\`\`

三种取值：
- DENY：完全禁止页面被嵌入 frame
- SAMEORIGIN：只允许同源页面嵌入
- ALLOW-FROM uri：允许指定来源嵌入（已废弃，使用 CSP 替代）

**2. CSP frame-ancestors**：

\`\`\`
Content-Security-Policy: frame-ancestors 'self' https://trusted.com
\`\`\`

frame-ancestors 比 X-Frame-Options 更灵活，支持多个来源。

**3. Frame Busting**：

\`\`\`javascript
// 在页面中执行
if (top !== self) {
  top.location = self.location;
}
\`\`\`

但这种方式不够可靠，可能被绕过。推荐使用 X-Frame-Options 或 CSP。

## 5. 中间人攻击（MITM）

### 5.1 MITM 攻击原理

中间人攻击是攻击者在通信双方之间拦截、窃听或篡改通信内容的攻击方式。

**常见场景**：
- 公共 Wi-Fi 网络中的攻击
- ARP 欺骗
- DNS 劫持
- 伪造的 SSL 证书

### 5.2 MITM 的防御措施

**1. HTTPS**：

使用 HTTPS 加密通信，确保数据的机密性和完整性。

**2. HSTS（HTTP Strict Transport Security）**：

强制浏览器使用 HTTPS 访问网站，防止降级攻击。

\`\`\`
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
\`\`\`

**3. 证书验证**：

- 使用可信 CA 颁发的证书
- 实施证书透明度（Certificate Transparency）
- 使用 HPKP（已废弃，建议使用 Expect-CT）

**4. 安全的 Cookie 设置**：

\`\`\`
Set-Cookie: sessionId=abc123; Secure; HttpOnly; SameSite=Strict
\`\`\`

## 6. HTTPS 深入

### 6.1 HTTPS 工作原理

HTTPS = HTTP + SSL/TLS，通过加密确保通信安全。

**TLS 握手过程**（简化版）：

1. **客户端 Hello**：客户端发送支持的 TLS 版本、加密套件列表、随机数
2. **服务器 Hello**：服务器选择 TLS 版本和加密套件，发送证书和随机数
3. **证书验证**：客户端验证服务器证书的合法性
4. **密钥交换**：客户端生成预主密钥，用服务器公钥加密发送
5. **会话密钥生成**：双方使用随机数和预主密钥计算会话密钥
6. **加密通信**：使用会话密钥进行对称加密通信

### 6.2 证书验证

浏览器验证证书的步骤：
1. 检查证书是否在有效期内
2. 检查证书的域名是否匹配
3. 检查证书的颁发者是否可信
4. 检查证书是否被吊销（CRL/OCSP）
5. 验证证书链的完整性

### 6.3 HSTS

HSTS 解决以下问题：
- 用户输入 http:// 访问网站
- 攻击者降级 HTTPS 到 HTTP

一旦浏览器收到 HSTS 头，在有效期内对同一域名强制使用 HTTPS 访问。

## 7. CSP（内容安全策略）

### 7.1 CSP 的作用

CSP 是防御 XSS 的最有效手段之一，通过限制资源加载来源和脚本执行来减少攻击面。

### 7.2 CSP 的配置

**通过 HTTP 响应头**：

\`\`\`
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}'; style-src 'self' 'unsafe-inline'; img-src * data:; font-src 'self'; connect-src 'self' https://api.example.com;
\`\`\`

**通过 <meta> 标签**：

\`\`\`html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">
\`\`\`

### 7.3 CSP 指令详解

**default-src**：默认的资源加载策略，其他指令的 fallback。

**script-src**：控制 JavaScript 的加载和执行。

\`\`\`
script-src 'self' 'nonce-abc123' 'strict-dynamic'
\`\`\`

- 'self'：只允许同源脚本
- 'nonce-xxx'：只允许带有指定 nonce 的脚本
- 'sha256-xxx'：只允许内容哈希匹配的脚本
- 'strict-dynamic'：允许通过 nonce/hash 加载的脚本再加载其他脚本
- 'unsafe-inline'：允许内联脚本（不推荐）
- 'unsafe-eval'：允许 eval()（不推荐）

**style-src**：控制样式表的加载。

**img-src**：控制图片的加载来源。

**connect-src**：控制 XHR、WebSocket、EventSource 等连接的目标。

**font-src**：控制字体文件的加载来源。

**frame-src**：控制 iframe 内容的来源。

**frame-ancestors**：控制哪些页面可以嵌入当前页面。

### 7.4 CSP 报告

使用 report-uri 或 report-to 指令收集违反 CSP 的报告。

\`\`\`
Content-Security-Policy: default-src 'self'; report-uri /csp-report
\`\`\`

## 8. CORS（跨域资源共享）

### 8.1 CORS 原理

CORS 允许服务器声明哪些跨域请求可以被浏览器允许。

**简单请求**：
- 请求方法：GET、HEAD、POST
- Content-Type：application/x-www-form-urlencoded、multipart/form-data、text/plain
- 没有自定义请求头

简单请求直接发送，浏览器检查响应头中是否有 Access-Control-Allow-Origin。

**预检请求（Preflight）**：
- 非简单请求会先发送 OPTIONS 请求
- 服务器返回允许的方法、请求头等信息
- 浏览器验证通过后才发送实际请求

### 8.2 CORS 响应头

\`\`\`
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
Access-Control-Expose-Headers: X-Custom-Header
\`\`\`

### 8.3 CORS 安全配置

**不安全的配置**：

\`\`\`
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
\`\`\`

以上配置是不安全的，因为 Access-Control-Allow-Origin: * 和 Access-Control-Allow-Credentials: true 不能同时使用，但即使分开使用，* 也意味着允许任意来源。

**安全的配置**：
- 使用白名单控制允许的来源
- 使用 Access-Control-Allow-Credentials: true 时，必须指定具体的 Origin
- 最小化允许的方法和请求头
- 设置合理的 Access-Control-Max-Age

## 9. 认证和授权

### 9.1 OAuth 2.0

OAuth 2.0 是一个授权框架，允许第三方应用获取有限的资源访问权限。

**四种授权方式**：

1. **授权码模式（Authorization Code）**：最安全，适合有后端的应用
2. **隐式模式（Implicit）**：已废弃，不推荐使用
3. **密码模式（Resource Owner Password Credentials）**：适合信任的应用
4. **客户端凭证模式（Client Credentials）**：适合服务器间通信

**授权码模式流程**：
1. 用户点击"使用 Google 登录"
2. 重定向到 Google 授权页面
3. 用户授权后，Google 返回授权码
4. 应用后端用授权码换取 access token
5. 使用 access token 访问用户资源

### 9.2 JWT（JSON Web Token）

JWT 是一种用于在各方之间安全传输信息的紧凑 URL 安全的令牌格式。

**JWT 的结构**：

\`\`\`
header.payload.signature
\`\`\`

- Header：包含算法和令牌类型
- Payload：包含声明（claims）
- Signature：用于验证令牌的签名

**JWT 的使用场景**：
- 身份验证：用户登录后签发 JWT，后续请求携带 JWT
- 信息交换：安全地在各方之间传输信息

**JWT 安全注意事项**：

1. **不要存储敏感信息**：JWT 的 payload 只是 base64 编码，不是加密的，任何人都可以解码。

2. **设置合理的过期时间**：access token 通常 15-30 分钟，使用 refresh token 获取新的 access token。

3. **使用 HTTPS**：防止令牌在传输中被窃取。

4. **使用强密钥**：用于签名的密钥要足够复杂。

5. **不要在 URL 中传递 JWT**：URL 可能被记录在日志中。

6. **验证所有声明**：iss（签发者）、aud（接收者）、exp（过期时间）等。

### 9.3 Session vs Token 认证

**Session 认证**：
- 服务器维护会话状态
- 客户端只保存 Session ID（Cookie）
- 服务器可以随时撤销会话
- 适合传统的服务端渲染应用

**Token 认证（JWT）**：
- 服务器不维护状态，无状态认证
- 客户端保存 Token（localStorage 或 Cookie）
- 水平扩展友好
- 适合 SPA 和微服务架构

**Session 和 Token 的选择**：
- Session 适合传统的单体应用，安全性更好（服务端可控）
- Token 适合 SPA、移动端、微服务，扩展性更好
- 可以结合使用：Session 用于 Web 应用，Token 用于 API

## 10. 常见安全面试题

### 10.1 XSS 和 CSRF 的区别？

XSS 是攻击者注入恶意脚本到目标网站，利用用户对网站的信任。CSRF 是攻击者诱导用户执行非预期操作，利用网站对用户浏览器的信任。XSS 获取的是用户的权限，CSRF 借用的是用户的身份。防御 XSS 主要靠输出编码和 CSP，防御 CSRF 主要靠 CSRF Token 和 SameSite Cookie。

### 10.2 如何防范 XSS 攻击？

- 对所有用户输入进行输出编码（HTML 实体编码）
- 使用安全的 DOM API（textContent 代替 innerHTML）
- 配置 CSP（Content Security Policy）
- 设置 Cookie 为 HttpOnly，防止 JavaScript 读取
- 使用现代前端框架的默认防护（React JSX 自动转义）
- 对富文本内容使用 DOMPurify 等净化库
- 在服务端和客户端都进行输入验证

### 10.3 如何防范 CSRF 攻击？

- 使用 SameSite Cookie（Strict 或 Lax）
- 使用 CSRF Token，在请求中携带并验证
- 验证 Referer 或 Origin 请求头
- 使用自定义请求头（利用同源策略）
- 敏感操作使用二次验证（验证码、密码确认）
- 不要使用 GET 请求执行状态变更操作

### 10.4 HTTPS 是如何保证安全的？

HTTPS 通过 TLS/SSL 协议实现：
- 加密：使用对称加密保护数据传输的机密性
- 身份验证：通过数字证书验证服务器身份，防止中间人攻击
- 数据完整性：通过消息认证码（MAC）确保数据在传输过程中未被篡改

TLS 握手过程使用非对称加密交换密钥，后续通信使用对称加密（性能更好）。

### 10.5 什么是 CSP？如何配置？

CSP（Content Security Policy）是一种安全机制，通过 HTTP 响应头或 meta 标签定义允许加载资源的来源。它是防御 XSS 的最有效手段之一。

基本配置：
\`\`\`
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}'; style-src 'self' 'unsafe-inline'; img-src * data:; font-src 'self'; connect-src 'self' https://api.example.com;
\`\`\`

关键原则是最小权限：只允许必要的资源来源，禁止内联脚本和 eval。

### 10.6 JWT 的安全性如何保证？

- 使用 HTTPS 传输，防止令牌被窃取
- 设置较短的过期时间（15-30 分钟），使用 refresh token 续期
- 不要在 payload 中存储敏感信息（JWT 只是 base64 编码，不是加密）
- 使用强密钥签名
- 验证所有标准声明（iss、aud、exp、nbf）
- 实现 token 黑名单或撤销机制
- 不要在 URL 中传递 JWT

### 10.7 前端安全还有哪些需要注意的方面？

- 依赖安全：定期检查 npm 依赖的已知漏洞（npm audit）
- 敏感信息保护：不要在客户端存储密钥、密码等敏感信息
- iframe 安全：使用 sandbox 属性限制 iframe 的权限
- postMessage 安全：验证消息来源（event.origin）
- 第三方脚本：谨慎引入第三方脚本，可能引入安全风险
- 文件上传：限制文件类型和大小，服务端验证
- 安全的密码策略：使用 bcrypt 等算法加密存储密码
- RBAC（基于角色的访问控制）：前后端都要做权限校验
- 敏感操作日志：记录关键操作，便于审计和追踪
- 安全头配置：X-Content-Type-Options、X-XSS-Protection、Referrer-Policy 等

### 10.8 如何设计一个安全的登录系统？

1. 使用 HTTPS 传输所有数据
2. 密码使用 bcrypt/scrypt/argon2 加密存储
3. 实现登录失败次数限制和账户锁定
4. 使用验证码防止暴力破解
5. Session/Cookie 设置 Secure、HttpOnly、SameSite 属性
6. 支持多因素认证（MFA）
7. 实现会话超时和自动登出
8. 记录登录日志，异常时告警
9. 使用 CSRF Token 保护表单提交
10. 密码重置使用安全的 token 机制（一次性、有时效性）

### 10.9 什么是 Same-Origin Policy（同源策略）？

同源策略是浏览器最基本的安全机制，限制不同源（协议、域名、端口任一不同）的文档或脚本之间的交互。

同源策略的限制：
- 无法读取不同源的 Cookie、LocalStorage、IndexedDB
- 无法读取不同源的 DOM
- 无法发送 AJAX 请求到不同源（CORS 可以放宽此限制）

同源策略不限制的：
- <script>、<img>、<link>、<iframe> 等标签的跨域加载
- 表单提交
- 重定向

### 10.10 前端安全防护的总结

安全防护是一个多层次、纵深防御的过程，没有单一方案可以解决所有问题。前端安全需要从多个层面入手：

1. **输入层面**：验证和过滤所有用户输入
2. **输出层面**：对所有输出进行编码
3. **传输层面**：使用 HTTPS 加密通信
4. **存储层面**：不在客户端存储敏感信息，Cookie 设置安全属性
5. **策略层面**：配置 CSP、CORS 等安全策略
6. **框架层面**：利用现代框架的默认安全防护
7. **流程层面**：建立安全开发流程，定期安全审计

安全意识是每个前端开发者必备的素养，安全不是可选项，而是必须项。
`
  }
];