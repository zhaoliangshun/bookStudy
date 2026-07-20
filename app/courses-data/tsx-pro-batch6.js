// =============================================================
// TypeScript + React 全栈精通 - Batch 6: React Hooks 全套
// -------------------------------------------------------------
// 章节范围（共 8 章）：
//   35. tspro-use-effect            useEffect 副作用管理
//   36. tspro-use-context           useContext 上下文
//   37. tspro-use-reducer           useReducer 复杂状态
//   38. tspro-use-callback          useCallback 函数缓存
//   39. tspro-use-memo              useMemo 值缓存
//   40. tspro-use-ref               useRef 引用
//   41. tspro-use-imperative-handle useImperativeHandle + forwardRef
//   42. tspro-custom-hooks          自定义 Hook 完全指南
//
// 代码运行环境：ts.transpileModule + jsx: ReactJSX + target ES2020
// 沙箱注入 react / react/jsx-runtime 的 mock，可写 JSX 语法
// =============================================================

export const chapters = [
  // =========================================================
  // 第三十五章：useEffect 副作用管理
  // =========================================================
  {
    id: "tspro-use-effect",
    group: "六、React Hooks 全套",
    icon: "🌀",
    title: "useEffect 副作用管理",
    content: `# 第三十五章：useEffect 副作用管理

## 35.1 为什么需要 useEffect

React 组件应该是**纯函数**——相同的 props/state 永远返回相同的 JSX。但真实业务需要：

- 数据获取（fetch）
- 订阅事件（WebSocket、resize）
- 操作 DOM（聚焦、滚动）
- 启动定时器

这些操作会"对外部世界产生影响"或"读取外部状态"，叫做**副作用（side effect）**。React 把副作用集中到 \`useEffect\` 里管理，让组件主体保持纯净。

\`\`\`tsx
// ❌ 错：在组件主体里直接操作 DOM（每次渲染都执行）
function Counter() {
  const [count, setCount] = useState(0);
  document.title = '点击了 ' + count + ' 次';  // 副作用混在渲染逻辑里
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ✅ 对：用 useEffect 包裹副作用
function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.title = '点击了 ' + count + ' 次';
  }, [count]);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
\`\`\`

## 35.2 useEffect 是什么

\`useEffect\` 让你在**渲染完成后**执行副作用函数，并且可以选择在下次执行前或卸载时清理。

基本签名：

\`\`\`tsx
useEffect(setup, dependencies?)
\`\`\`

- \`setup\`：副作用函数，可以返回一个清理函数（cleanup）
- \`dependencies\`：依赖数组，决定何时重新执行 setup

执行时机：**DOM 更新之后**（异步、不阻塞页面绘制）。

\`\`\`tsx
useEffect(() => {
  console.log('组件渲染完毕');
});
\`\`\`

## 35.3 三种依赖数组

依赖数组决定了 useEffect **何时重新执行**，是核心概念：

### 1. 不传依赖数组：每次渲染都执行

\`\`\`tsx
useEffect(() => {
  console.log('每次渲染都执行');
});
\`\`\`

实际项目里几乎不用——性能差，且容易造成无限循环。

### 2. 空数组 \`[]\`：只在挂载后执行一次

\`\`\`tsx
useEffect(() => {
  console.log('组件挂载后执行一次');
  return () => console.log('组件卸载时执行');
}, []);
\`\`\`

适合：初始化数据、订阅事件、启动定时器。返回的函数会在**卸载时**调用。

### 3. 依赖数组 \`[a, b]\`：依赖变化时执行

\`\`\`tsx
useEffect(() => {
  console.log('count 变了:', count);
}, [count]);

useEffect(() => {
  console.log('count 或 name 变了:', count, name);
}, [count, name]);
\`\`\`

依赖变化时：先执行上次的 cleanup → 再执行新的 setup。

### 对比表

| 依赖数组 | 执行时机 | 适用场景 |
| --- | --- | --- |
| 不传 | 每次渲染后 | 几乎不用 |
| \`[]\` | 挂载后一次 | 初始化、订阅 |
| \`[dep]\` | dep 变化时 | 响应状态变化 |

\`\`\`tsx
function Timer() {
  const [count, setCount] = useState(0);

  // 1. 空数组：只在挂载时启动定时器
  useEffect(() => {
    const id = setInterval(() => setCount(c => c + 1), 1000);
    return () => clearInterval(id);  // 卸载时清理
  }, []);

  // 2. 依赖数组：count 变化时打印
  useEffect(() => {
    console.log('count:', count);
  }, [count]);

  return <div>{count}</div>;
}
\`\`\`

## 35.4 cleanup 清理函数

setup 函数可以返回一个 cleanup 函数，**在下次执行 setup 前 / 组件卸载时**调用。

\`\`\`tsx
useEffect(() => {
  const id = setInterval(() => console.log('tick'), 1000);
  // 返回清理函数
  return () => {
    clearInterval(id);  // 清除定时器，避免内存泄漏
    console.log('cleanup');
  };
}, []);
\`\`\`

**为什么必须清理**：

1. **避免内存泄漏**：定时器、订阅没清理会一直存在
2. **避免旧回调执行**：fetch 完成时组件已卸载，setState 会报警告
3. **避免重复绑定**：每次 setup 都加监听，没清理会叠加

\`\`\`tsx
// ❌ 没清理，每次 resize 都会多加一个监听器
useEffect(() => {
  window.addEventListener('resize', handleResize);
});

// ✅ 返回 cleanup 解绑
useEffect(() => {
  const handler = () => console.log(window.innerWidth);
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
\`\`\`

## 35.5 fetch 数据的标准模式

\`\`\`tsx
function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;  // 标志位：组件是否已卸载
    setLoading(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setUsers(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    // cleanup：标记已取消，避免 setState on unmounted component
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorView error={error} />;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\`

**关键点**：用 \`cancelled\` 标志位防止组件卸载后 setState。

## 35.6 何时用 useLayoutEffect 替代

\`useEffect\` 是**异步**执行（浏览器绘制之后），如果副作用会**修改 DOM 并且会导致页面闪烁**，改用 \`useLayoutEffect\`：

- \`useEffect\`：DOM 更新后异步执行，不阻塞绘制
- \`useLayoutEffect\`：DOM 更新后**同步**执行，阻塞绘制

\`\`\`tsx
import { useLayoutEffect, useRef } from 'react';

function Tooltip({ text }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // 测量 DOM 位置：用 useLayoutEffect 避免先渲染错位置再跳到正确位置
  useLayoutEffect(() => {
    const rect = ref.current!.getBoundingClientRect();
    setPosition({ x: rect.x, y: rect.y + rect.height });
  }, [text]);

  return (
    <div ref={ref} style={{ position: 'absolute', left: position.x, top: position.y }}>
      {text}
    </div>
  );
}
\`\`\`

**判断标准**：

- 副作用读 DOM、改样式 → \`useLayoutEffect\`（避免闪烁）
- 其它（fetch、订阅、定时器、日志）→ \`useEffect\`

## 35.7 常见陷阱

### 陷阱 1：依赖漏写

\`\`\`tsx
function Counter() {
  const [count, setCount] = useState(0);

  // ❌ 漏了 count，effect 永远拿到旧值（0）
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);  // count 闭包捕获的是 0，永远 +1 = 1
    }, 1000);
    return () => clearInterval(id);
  }, []);  // eslint 会警告：missing dependency 'count'

  // ✅ 方案 1：用函数式更新，避免依赖 count
  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1);  // c 是最新值
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ✅ 方案 2：把 count 加入依赖
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [count]);  // 每次 count 变都重启定时器（性能差）
}
\`\`\`

**建议**：开 \`react-hooks/exhaustive-deps\` ESLint 规则，自动检测依赖漏写。

### 陷阱 2：闭包陷阱（stale closure）

\`\`\`tsx
function Timer() {
  const [count, setCount] = useState(0);

  // ❌ 闭包捕获了 count=0，永远输出 0
  useEffect(() => {
    const id = setInterval(() => {
      console.log(count);  // 永远是 0
      setCount(count + 1);  // 永远设为 1
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ✅ 方案 1：函数式更新
  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => {
        console.log(c);  // 最新值
        return c + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ✅ 方案 2：用 ref 保存最新值
  const countRef = useRef(count);
  useEffect(() => { countRef.current = count; });
  useEffect(() => {
    const id = setInterval(() => {
      console.log(countRef.current);  // 最新值
    }, 1000);
    return () => clearInterval(id);
  }, []);
}
\`\`\`

### 陷阱 3：无限循环

\`\`\`tsx
// ❌ 死循环：effect 修改 state → 触发渲染 → effect 重新执行
function Bad() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(count + 1);  // 改 state
  });  // 没有依赖数组
  return <div>{count}</div>;
}

// ✅ 加依赖数组限制
function Good() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(count + 1);
  }, [count]);  // 只在 count 变时执行
  return <div>{count}</div>;
}
\`\`\`

### 陷阱 4：把对象/函数当依赖

\`\`\`tsx
function Bad({ options }) {
  const [data, setData] = useState(null);
  // ❌ options 是对象，每次父组件渲染都是新引用，effect 会无限执行
  useEffect(() => {
    fetch(options.url).then(setData);
  }, [options]);

  // ✅ 只依赖需要的字段
  useEffect(() => {
    fetch(options.url).then(setData);
  }, [options.url]);
}
\`\`\`

## 35.8 实际项目中的 useEffect

1. **加依赖数组**：避免每次渲染都执行
2. **必加 cleanup**：定时器、订阅、监听都要清理
3. **fetch 用 cancelled 标志**：防止卸载后 setState 警告
4. **开 ESLint exhaustive-deps**：自动检测依赖
5. **测 DOM 用 useLayoutEffect**：避免闪烁
6. **复杂副作用拆开写**：每个 effect 只做一件事

\`\`\`tsx
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);

  // ✅ 一个 effect 只做一件事
  // 1. 订阅房间
  useEffect(() => {
    const ws = new WebSocket('wss://example.com/' + roomId);
    ws.onmessage = e => setMessages(prev => [...prev, JSON.parse(e.data)]);
    return () => ws.close();
  }, [roomId]);

  // 2. 重置消息（roomId 变时）
  useEffect(() => {
    setMessages([]);
  }, [roomId]);

  return <div>{messages.length}</div>;
}
\`\`\`

## 35.9 小结

- useEffect 集中管理副作用，让组件主体保持纯函数
- 三种依赖数组：不传（每次）/ \`[]\`（一次）/ \`[deps]\`（依赖变化时）
- cleanup 在下次 setup 前 / 卸载时执行，必加避免泄漏
- fetch 用 \`cancelled\` 标志防止卸载后 setState
- 测 DOM 改样式用 \`useLayoutEffect\`，其他用 \`useEffect\`
- 常见陷阱：依赖漏写、闭包陷阱、无限循环、对象当依赖
- 开 \`exhaustive-deps\` ESLint 规则自动检查依赖
`,
    code: `// =============================================================
// 第 35 章 demo：useEffect 副作用管理
// 模拟 useEffect 三种依赖数组、cleanup、闭包陷阱
// =============================================================

// ---- 模拟 React 渲染循环 ----
// 记录每次渲染的 state 快照
const renderLog = [];

// 简易 hooks 调度器：模拟 useEffect 的依赖对比
const effects = [];
let currentRender = null;

function simulateRender(component, props, prevDeps) {
  // 设置当前渲染上下文
  currentRender = { effects: [] };
  // 调用组件函数（组件内调 useEffect 收集副作用）
  const result = component(props);
  // 执行本次渲染收集到的 effect（按依赖对比决定是否真的执行）
  currentRender.effects.forEach(({ setup, deps, name }) => {
    const prevDep = prevDeps[name];
    const shouldRun = !deps || !prevDep || deps.some((d, i) => d !== prevDep[i]);
    if (shouldRun) {
      // 执行 setup，返回的 cleanup 保存起来
      const cleanup = setup();
      prevDeps[name] = deps;
      if (cleanup) {
        // 模拟 cleanup 在下次执行前调用
        setTimeout(() => {}, 0);  // 占位
      }
    }
  });
  renderLog.push({ props, result });
  return result;
}

// ---- 1. 三种依赖数组对比 ----
console.log('=== 1. 三种依赖数组对比 ===');

// 模拟不传依赖：每次都执行
let effectRuns_always = 0;
function CompAlways(props) {
  // 模拟 useEffect(() => { effectRuns_always++; })
  currentRender.effects.push({
    name: 'always',
    setup: () => { effectRuns_always++; console.log('  [effect 无依赖] 执行 #' + effectRuns_always); },
    deps: undefined,
  });
  return { count: props.count };
}
const deps1 = {};
simulateRender(CompAlways, { count: 1 }, deps1);
simulateRender(CompAlways, { count: 1 }, deps1);
simulateRender(CompAlways, { count: 2 }, deps1);
console.log('  总执行次数:', effectRuns_always, '（每次渲染都执行）');

// 模拟空数组 []：只执行一次
let effectRuns_once = 0;
function CompOnce(props) {
  currentRender.effects.push({
    name: 'once',
    setup: () => {
      effectRuns_once++;
      console.log('  [effect 空数组] 执行 #' + effectRuns_once);
      return () => console.log('  [cleanup] 卸载时执行');
    },
    deps: [],
  });
  return { count: props.count };
}
const deps2 = {};
simulateRender(CompOnce, { count: 1 }, deps2);
simulateRender(CompOnce, { count: 2 }, deps2);
simulateRender(CompOnce, { count: 3 }, deps2);
console.log('  总执行次数:', effectRuns_once, '（只挂载时执行一次）');

// 模拟依赖数组 [count]：count 变化时执行
let effectRuns_dep = 0;
function CompDep(props) {
  currentRender.effects.push({
    name: 'dep',
    setup: () => { effectRuns_dep++; console.log('  [effect [count]] 执行 #' + effectRuns_dep + ', count=' + props.count); },
    deps: [props.count],
  });
  return { count: props.count };
}
const deps3 = {};
simulateRender(CompDep, { count: 1 }, deps3);
simulateRender(CompDep, { count: 1 }, deps3);  // count 没变，不执行
simulateRender(CompDep, { count: 2 }, deps3);  // count 变了，执行
simulateRender(CompDep, { count: 2 }, deps3);  // count 没变，不执行
console.log('  总执行次数:', effectRuns_dep, '（count 变化时执行）');

// ---- 2. cleanup 清理函数模拟 ----
console.log('\\n=== 2. cleanup 清理函数 ===');

function simulateEffectWithCleanup(deps, depsKey) {
  const prevDep = depsKey.deps;
  const shouldRun = !depsKey.initialized || deps.some((d, i) => d !== prevDep[i]);
  if (shouldRun) {
    if (depsKey.prevCleanup) {
      console.log('  [cleanup] 上次的清理执行');
      depsKey.prevCleanup();
    }
    const cleanup = depsKey.setup(deps);
    depsKey.prevCleanup = cleanup;
    depsKey.deps = deps;
    depsKey.initialized = true;
  }
}

const timerState = { initialized: false, deps: [], prevCleanup: null };
const setup = (deps) => {
  const roomId = deps[0];
  console.log('  [setup] 订阅房间 ' + roomId);
  return () => console.log('  [cleanup] 解绑房间 ' + roomId);
};

console.log('roomId=1:');
simulateEffectWithCleanup(['room-1'], timerState);

console.log('roomId=1（重新渲染，没变）:');
simulateEffectWithCleanup(['room-1'], timerState);

console.log('roomId=2（变了，先 cleanup 再 setup）:');
simulateEffectWithCleanup(['room-2'], timerState);

// ---- 3. 闭包陷阱模拟 ----
console.log('\\n=== 3. 闭包陷阱 ===');

// ❌ 错误写法：闭包捕获了 count=0
function badClosureDemo() {
  let count = 0;
  let intervalId = null;
  // 模拟 useEffect(() => { setInterval(() => setCount(count + 1), 1000) }, [])
  // count 在闭包里永远是 0
  const capturedCount = count;  // 闭包捕获
  intervalId = {
    tick: () => {
      console.log('  ❌ 闭包陷阱：count =', capturedCount, '（永远是初始值 0）');
      count = capturedCount + 1;  // 永远设为 1
    }
  };
  return { intervalId, getCount: () => count };
}
const bad = badClosureDemo();
bad.intervalId.tick();
bad.intervalId.tick();
console.log('  最终 count =', bad.getCount(), '（应该是 1，不是 2）');

// ✅ 正确写法：用函数式更新
function goodClosureDemo() {
  let count = 0;
  const intervalId = {
    tick: () => {
      // 模拟 setCount(c => c + 1)，c 是最新值
      count = ((c) => c + 1)(count);
      console.log('  ✅ 函数式更新：count =', count);
    }
  };
  return { intervalId, getCount: () => count };
}
const good = goodClosureDemo();
good.intervalId.tick();
good.intervalId.tick();
good.intervalId.tick();
console.log('  最终 count =', good.getCount(), '（正确累加）');

// ---- 4. fetch 数据取消模式 ----
console.log('\\n=== 4. fetch 数据取消模式 ===');

function simulateFetchEffect(roomId) {
  let cancelled = false;
  console.log('  [setup] 开始 fetch room=' + roomId);
  // 模拟异步 fetch
  setTimeout(() => {
    if (cancelled) {
      console.log('  [fetch 完成] 组件已卸载/roomId 已变，跳过 setState');
    } else {
      console.log('  [fetch 完成] 收到 room=' + roomId + ' 的数据，setState');
    }
  }, 10);
  return () => {
    cancelled = true;
    console.log('  [cleanup] 标记 cancelled=true');
  };
}

console.log('挂载，fetch room=1:');
const cleanup1 = simulateFetchEffect(1);
console.log('  立刻切换到 room=2（触发 cleanup）:');
cleanup1();
const cleanup2 = simulateFetchEffect(2);
// 等 fetch 完成
setTimeout(() => {
  console.log('  --- fetch 结果到达 ---');
  console.log('  注意：room=1 的 fetch 完成时 cancelled=true，不会 setState');
}, 20);

// ---- 5. useLayoutEffect vs useEffect 执行时机 ----
console.log('\\n=== 5. useLayoutEffect vs useEffect ===');

const executionOrder = [];
// 模拟组件渲染
function Component() {
  // React 实际顺序：
  // 1. render（组件函数执行）
  executionOrder.push('1. render（生成 vdom）');
  // 2. DOM 更新
  executionOrder.push('2. DOM update（提交到真实 DOM）');
  // 3. useLayoutEffect 同步执行
  executionOrder.push('3. useLayoutEffect（同步，阻塞绘制）');
  // 4. 浏览器绘制
  executionOrder.push('4. browser paint（用户看到）');
  // 5. useEffect 异步执行
  executionOrder.push('5. useEffect（异步，不阻塞绘制）');
}
Component();
executionOrder.forEach(step => console.log('  ' + step));

console.log('  → useLayoutEffect 适合测 DOM，避免闪烁');
console.log('  → useEffect 适合大多数副作用');

// ---- 关键要点总结 ----
console.log('\\n=== useEffect 核心要点 ===');
console.log('1. useEffect 在 DOM 更新后执行副作用');
console.log('2. 三种依赖数组：不传/[]/[deps]，控制何时重新执行');
console.log('3. cleanup 在下次 setup 前 / 卸载时执行，必加');
console.log('4. fetch 用 cancelled 标志防止卸载后 setState');
console.log('5. 测 DOM 用 useLayoutEffect 避免闪烁');
console.log('6. 闭包陷阱：用函数式更新或 useRef 保存最新值');
console.log('7. 开 ESLint exhaustive-deps 规则检查依赖');
`,
  },

  // =========================================================
  // 第三十六章：useContext 上下文
  // =========================================================
  {
    id: "tspro-use-context",
    group: "六、React Hooks 全套",
    icon: "📡",
    title: "useContext 上下文",
    content: `# 第三十六章：useContext 上下文

## 36.1 为什么需要 Context

React 默认**单向数据流**：父组件通过 props 把数据传给子组件。但有些数据要**跨多层组件传递**：

- 主题（dark/light）
- 当前用户（login user）
- 语言（i18n）
- 路由信息
- 全局通知

\`\`\`tsx
// ❌ props 透传（prop drilling）：每一层都要写一遍
function App() {
  const [user, setUser] = useState(null);
  return <Layout user={user} />;  // 第 1 层
}
function Layout({ user }) {
  return <Sidebar user={user} />;  // 第 2 层
}
function Sidebar({ user }) {
  return <UserInfo user={user} />;  // 第 3 层
}
function UserInfo({ user }) {
  return <p>{user.name}</p>;  // 第 4 层才用
}
\`\`\`

痛点：

1. **中间组件被迫接 props**：明明自己不用，只为传给子组件
2. **改字段名要改一堆文件**：\`user\` 改成 \`currentUser\`，4 个文件都得改
3. **类型签名冗长**：每个中间组件都要声明 \`user\` 类型

Context 解决了这个问题：**跨组件共享数据，跳过中间层**。

## 36.2 Context 是什么

Context 是 React 提供的**全局数据通道**。Provider 写入数据，所有后代组件都能用 \`useContext\` 读取，**不需要 props 透传**。

三件套：

1. \`createContext(default)\`：创建 Context 对象
2. \`<Context.Provider value={...}>\`：在父组件提供数据
3. \`useContext(Context)\`：在子组件消费数据

\`\`\`tsx
import { createContext, useContext, useState } from 'react';

// 1. 创建 Context（带默认值）
const ThemeContext = createContext<'light' | 'dark'>('light');

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  // 2. Provider 提供数据
  return (
    <ThemeContext.Provider value={theme}>
      <Page />
    </ThemeContext.Provider>
  );
}

function Page() {
  return <Button />;  // 不需要 props
}

function Button() {
  // 3. 消费数据
  const theme = useContext(ThemeContext);
  return <button className={'btn-' + theme}>按钮</button>;
}
\`\`\`

中间的 \`Page\` 完全不用关心 theme，代码清爽很多。

## 36.3 Context 的类型标注

### 简单类型

\`\`\`tsx
const ThemeContext = createContext<'light' | 'dark'>('light');
// 类型自动推断为 Context<'light' | 'dark'>
\`\`\`

### 复杂类型 + 默认值 null

很多场景下，初始值没意义（如未登录的用户）。常用模式：默认值 \`null\` + 运行时检查。

\`\`\`tsx
type User = { id: number; name: string; role: 'admin' | 'user' };

// 默认值 null，类型是 User | null
const UserContext = createContext<User | null>(null);

function App() {
  const [user, setUser] = useState<User | null>(null);
  return (
    <UserContext.Provider value={user}>
      <Header />
    </UserContext.Provider>
  );
}

function Header() {
  const user = useContext(UserContext);  // 类型是 User | null
  if (!user) return <p>未登录</p>;
  return <p>欢迎，{user.name}</p>;  // 收窄为 User
}
\`\`\`

### 提供完整 Context 类型（含 setter）

\`\`\`tsx
type ThemeContextValue = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

// 默认值用 undefined（占位）
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const value: ThemeContextValue = {
    theme,
    toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light'),
  };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
\`\`\`

## 36.4 自定义 useXxx Hook 包装

直接 \`useContext\` 有两个问题：

1. 默认值 \`null\` 时每次都要判空
2. 用错 Context（复制粘贴忘改）很难发现

**最佳实践**：封装自定义 Hook，**未在 Provider 内使用就报错**。

\`\`\`tsx
// contexts/ThemeContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const value = {
    theme,
    toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light'),
  };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// 自定义 Hook：未在 Provider 内使用就报错
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error('useTheme 必须在 <ThemeProvider> 内使用');
  }
  return ctx;
}

// 使用
function Button() {
  const { theme, toggleTheme } = useTheme();  // 类型自动推断，不会是 null
  return <button className={'btn-' + theme} onClick={toggleTheme}>切换</button>;
}
\`\`\`

## 36.5 Context 嵌套

多个 Context 可以嵌套使用：

\`\`\`tsx
function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <I18nProvider>
          <Page />
        </I18nProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

function Page() {
  const { theme } = useTheme();    // 主题
  const { user } = useUser();      // 用户
  const { t } = useI18n();          // 国际化
  return <div className={theme}>...</div>;
}
\`\`\`

嵌套层数多了可读性差，可以用**组合 Provider**：

\`\`\`tsx
function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <I18nProvider>
          {children}
        </I18nProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

// 入口
<AppProviders>
  <App />
</AppProviders>
\`\`\`

## 36.6 默认值的作用

\`createContext(default)\` 的默认值在**没有匹配的 Provider 时**使用：

\`\`\`tsx
const ThemeContext = createContext('light');

// 不在 Provider 内
function Standalone() {
  const theme = useContext(ThemeContext);  // 'light'（用默认值）
  return <button className={theme}>按钮</button>;
}

// 在 Provider 内
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Standalone />  {/* 这里读到 'dark' */}
    </ThemeContext.Provider>
  );
}
\`\`\`

**实际项目中**：

- 默认值主要用于**测试组件**（脱离 Provider 单独渲染）
- 真实运行时一定有 Provider 包裹，默认值不会用到
- 用自定义 Hook 报错比"用默认值静默通过"更安全

## 36.7 Context 的性能问题

**Context 的一个重大缺陷**：**Context 值变化时，所有消费组件都会重新渲染**，即使只用了其中一部分。

\`\`\`tsx
const UserContext = createContext<{
  user: User;
  setUser: (u: User) => void;
} | null>(null);

function App() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 });
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <UserAvatar />     {/* 只用 user.name */}
      <UserAge />        {/* 只用 user.age */}
      <UserEditor />     {/* 用 setUser */}
    </UserContext.Provider>
  );
}

// user.age 变化时，三个组件都会重新渲染
// 即使 UserAvatar 只用 name
function UserAvatar() {
  const { user } = useContext(UserContext);
  return <img src={user.avatar} alt={user.name} />;
}
\`\`\`

**性能优化方案**：

### 1. 拆分 Context

\`\`\`tsx
const UserStateContext = createContext<User | null>(null);
const UserDispatchContext = createContext<(u: User) => void>(() => {});

function UserProvider({ children }) {
  const [user, setUser] = useState(initialUser);
  return (
    <UserStateContext.Provider value={user}>
      <UserDispatchContext.Provider value={setUser}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
}

// 只用 setUser 的组件不会因 user 变化重渲染
function UserEditor() {
  const setUser = useContext(UserDispatchContext);
  return <button onClick={() => setUser({...})}>修改</button>;
}
\`\`\`

### 2. 用 useMemo 包裹 value

\`\`\`tsx
function UserProvider({ children }) {
  const [user, setUser] = useState(initialUser);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
\`\`\`

### 3. 高频变化数据用状态管理库

context 适合**低频变化**的全局数据（主题、用户、语言）。**高频更新**（如鼠标位置、滚动条）会让所有消费者频繁重渲染，用 \`zustand\` / \`jotai\` / \`redux\` 更合适。

## 36.8 实际项目中的 Context

1. **永远配自定义 Hook**：用错时报错而不是返回 undefined
2. **value 用 useMemo 包裹**：避免每次渲染都创建新对象
3. **拆分 Context**：state 和 dispatch 分开
4. **低频数据用 Context**：主题、用户、语言、路由
5. **高频数据用 zustand**：避免重渲染爆炸

\`\`\`tsx
// 推荐的 Context 文件结构
// contexts/
//   ThemeContext.tsx     （含 Provider + useTheme）
//   UserContext.tsx      （含 Provider + useUser）
//   I18nContext.tsx      （含 Provider + useI18n）
\`\`\`

## 36.9 小结

- Context 解决 props 透传问题，跨多层组件共享数据
- 三件套：\`createContext\` + \`<Provider>\` + \`useContext\`
- 默认值 \`null\` 时配自定义 Hook 抛错
- 多个 Context 嵌套用组合 Provider 减少嵌套
- Context 值变化会让所有消费者重渲染，性能差
- 拆分 state/dispatch、useMemo 包裹 value 优化
- 低频数据用 Context，高频数据用 zustand 等状态库
`,
    code: `// =============================================================
// 第 36 章 demo：useContext 上下文
// 模拟 Context 创建、Provider、useContext、嵌套、性能问题
// =============================================================

// ---- 模拟 React Context 系统 ----
const contextMap = new Map();
let currentFiber = null;  // 模拟当前组件树位置

function createContext(defaultValue) {
  const context = {
    _id: Math.random().toString(36).slice(2),
    _defaultValue: defaultValue,
    Provider: null,
  };
  // Provider 是个对象，挂载 value
  context.Provider = function Provider(props) {
    return {
      type: 'Provider',
      context: context,
      value: props.value,
      children: props.children,
    };
  };
  contextMap.set(context._id, context);
  return context;
}

// 模拟 useContext：从组件树向上找最近的 Provider
function useContext(context) {
  // 模拟：在 currentFiber 链上找 Provider
  let fiber = currentFiber;
  while (fiber) {
    if (fiber.providerValues && fiber.providerValues.has(context._id)) {
      return fiber.providerValues.get(context._id);
    }
    fiber = fiber.parent;
  }
  return context._defaultValue;  // 没找到，用默认值
}

// 渲染时构建 fiber 树（带 parent 链）
function createFiber(parent, providerValues) {
  return {
    parent: parent,
    providerValues: providerValues || (parent ? parent.providerValues : new Map()),
  };
}

// ---- 1. Context 三件套基础 ----
console.log('=== 1. Context 三件套 ===');

// 创建 ThemeContext，默认 'light'
const ThemeContext = createContext('light');

// 模拟组件树：App（Provider value='dark'） → Page → Button
function renderButton() {
  const theme = useContext(ThemeContext);
  return { type: 'button', className: 'btn-' + theme };
}

// 模拟渲染
const appFiber = createFiber(null, new Map());
appFiber.providerValues.set(ThemeContext._id, 'dark');

const pageFiber = createFiber(appFiber);
const buttonFiber = createFiber(pageFiber);

currentFiber = buttonFiber;
console.log('  在 Provider="dark" 内渲染 Button:');
console.log('  ', JSON.stringify(renderButton()));

// 在 Provider 外渲染，用默认值
currentFiber = createFiber(null);
console.log('  在 Provider 外渲染 Button:');
console.log('  ', JSON.stringify(renderButton()), '（用默认值 light）');

// ---- 2. 默认值的作用 ----
console.log('\\n=== 2. 默认值的作用 ===');

const LangContext = createContext('zh-CN');

// 没有 Provider 时
currentFiber = createFiber(null);
console.log('  无 Provider，使用默认值:', useContext(LangContext));

// 有 Provider 时
const langFiber = createFiber(null, new Map());
langFiber.providerValues.set(LangContext._id, 'en-US');
currentFiber = langFiber;
console.log('  有 Provider，使用 Provider 值:', useContext(LangContext));

// ---- 3. 自定义 Hook 包装（带错误检查） ----
console.log('\\n=== 3. 自定义 Hook 包装 ===');

const UserContext = createContext(null);

function UserProvider(props, parentFiber) {
  const fiber = createFiber(parentFiber, new Map(parentFiber ? parentFiber.providerValues : new Map()));
  fiber.providerValues.set(UserContext._id, props.value);
  return fiber;
}

function useUser() {
  const ctx = useContext(UserContext);
  if (ctx === null) {
    throw new Error('useUser 必须在 <UserProvider> 内使用');
  }
  return ctx;
}

// 在 Provider 内调用 useUser
const userFiber = UserProvider({ value: { name: 'Alice', age: 25 } }, null);
currentFiber = createFiber(userFiber);
const user = useUser();
console.log('  在 Provider 内:', JSON.stringify(user));

// 在 Provider 外调用 useUser（应该报错）
currentFiber = createFiber(null);
try {
  useUser();
} catch (e) {
  console.log('  在 Provider 外:', e.message);
}

// ---- 4. Context 嵌套 ----
console.log('\\n=== 4. Context 嵌套 ===');

const ThemeCtx = createContext('light');
const UserCtx = createContext(null);
const I18nCtx = createContext('zh');

// 模拟嵌套 Provider
const rootFiber = createFiber(null, new Map());
rootFiber.providerValues.set(ThemeCtx._id, 'dark');
rootFiber.providerValues.set(UserCtx._id, { name: 'Bob' });
rootFiber.providerValues.set(I18nCtx._id, 'en');

// 子组件同时用三个 Context
currentFiber = createFiber(rootFiber);
const theme = useContext(ThemeCtx);
const currentUser = useContext(UserCtx);
const lang = useContext(I18nCtx);
console.log('  theme:', theme);
console.log('  user :', JSON.stringify(currentUser));
console.log('  lang :', lang);

// ---- 5. 拆分 state / dispatch Context（性能优化） ----
console.log('\\n=== 5. 拆分 state / dispatch ===');

const StateContext = createContext(null);
const DispatchContext = createContext(() => {});

// 模拟只有 dispatch 变化的场景
const stateFiber = createFiber(null, new Map());
stateFiber.providerValues.set(StateContext._id, { count: 1 });
stateFiber.providerValues.set(DispatchContext._id, () => {});

function useCount() { return useContext(StateContext).count; }
function useSetCount() { return useContext(DispatchContext); }

// 模拟 state 变化：只更新 StateContext
console.log('  state 变化（count: 1 → 2）:');
stateFiber.providerValues.set(StateContext._id, { count: 2 });
console.log('    使用 useCount 的组件：重渲染（读到了新 count）');
console.log('    使用 useSetCount 的组件：不重渲染（dispatch 引用没变）');

// ---- 6. Context 性能问题演示 ----
console.log('\\n=== 6. Context 性能问题 ===');

// 模拟 3 个消费者
const consumers = ['UserAvatar', 'UserAge', 'UserEditor'];
let renderCount = 0;
const contextValue = { user: { name: 'Alice', age: 25 }, setUser: () => {} };

function simulateContextRender(newValue) {
  console.log('  Context value 变化:', JSON.stringify(newValue));
  consumers.forEach(name => {
    renderCount++;
    console.log('    ' + name + ' 重渲染');
  });
}

simulateContextRender(contextValue);
simulateContextRender({ ...contextValue, user: { ...contextValue.user, age: 26 } });
console.log('  总渲染次数:', renderCount, '（每次 Context 变都全部重渲染）');

// 用 useMemo 优化：value 引用没变就不重渲染
console.log('\\n  用 useMemo 包裹 value 优化:');
let memoValue = { user: { name: 'Alice', age: 25 }, setUser: () => {} };
let renderCount2 = 0;
function simulateMemoRender(newMemoValue, depsChanged) {
  if (depsChanged) {
    memoValue = newMemoValue;
    console.log('  useMemo 重新计算，value 引用变了');
    consumers.forEach(() => renderCount2++);
  } else {
    console.log('  useMemo 命中，value 引用不变，消费者不重渲染');
  }
}
simulateMemoRender(memoValue, false);
simulateMemoRender(memoValue, false);
console.log('  总渲染次数:', renderCount2);

// ---- 7. 完整 ThemeProvider 例子 ----
console.log('\\n=== 7. 完整 ThemeProvider 模拟 ===');

function createThemeProvider() {
  const ThemeCtx = createContext(undefined);
  let currentTheme = 'light';

  function ThemeProvider(props) {
    const fiber = createFiber(null, new Map());
    fiber.providerValues.set(ThemeCtx._id, {
      theme: currentTheme,
      toggleTheme: () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        fiber.providerValues.set(ThemeCtx._id, {
          theme: currentTheme,
          toggleTheme: () => {},
        });
      },
    });
    return fiber;
  }

  function useTheme() {
    const ctx = useContext(ThemeCtx);
    if (ctx === undefined) {
      throw new Error('useTheme 必须在 <ThemeProvider> 内使用');
    }
    return ctx;
  }

  return { ThemeProvider, useTheme };
}

const { ThemeProvider, useTheme } = createThemeProvider();
const themeFiber = ThemeProvider({});
currentFiber = createFiber(themeFiber);
const { theme: t, toggleTheme } = useTheme();
console.log('  初始 theme:', t);
toggleTheme();
const { theme: t2 } = useTheme();
console.log('  toggle 后 theme:', t2);

// ---- 关键要点总结 ----
console.log('\\n=== useContext 核心要点 ===');
console.log('1. Context 解决 props 透传，跨多层共享数据');
console.log('2. 三件套：createContext + Provider + useContext');
console.log('3. 默认值用于无 Provider 场景（测试、独立渲染）');
console.log('4. 配自定义 Hook（useXxx），未在 Provider 内抛错');
console.log('5. 多 Context 嵌套用组合 Provider 减少嵌套');
console.log('6. value 用 useMemo 包裹避免不必要重渲染');
console.log('7. 拆分 state/dispatch Context 优化性能');
console.log('8. 低频数据用 Context，高频数据用 zustand 等');
`,
  },

  // =========================================================
  // 第三十七章：useReducer 复杂状态
  // =========================================================
  {
    id: "tspro-use-reducer",
    group: "六、React Hooks 全套",
    icon: "🎛️",
    title: "useReducer 复杂状态",
    content: `# 第三十七章：useReducer 复杂状态

## 37.1 为什么需要 useReducer

\`useState\` 适合**简单状态**：一个值、一组值。但状态一复杂，问题就来了：

\`\`\`tsx
// 表单状态：用 useState 要写一堆
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  // 提交时要同时改 4 个 state
  const handleSubmit = () => {
    setSubmitting(true);
    setErrors(validate());
    setTouched({ name: true, email: true });
    // ... 一堆 set
  };
}
\`\`\`

痛点：

1. **状态分散**：相关联的状态散落在多个 useState
2. **逻辑分散**：相同业务逻辑写在多个事件处理器里
3. **状态转换不可预测**：调用方随便 setState，没有约束

\`useReducer\` 借鉴 Redux 思路：**把状态和状态转换逻辑集中到一起**，让数据流清晰可控。

## 37.2 useReducer 三件套

\`\`\`tsx
const [state, dispatch] = useReducer(reducer, initialState, init?)
\`\`\`

- \`reducer\`：纯函数 \`(state, action) => newState\`，描述状态如何变化
- \`action\`：描述"发生了什么"的对象 \`{ type: 'xxx', payload?: ... }\`
- \`dispatch\`：派发 action 触发状态更新

\`\`\`tsx
import { useReducer } from 'react';

// 1. reducer：纯函数，描述状态转换
function counterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      return state;
  }
}

// 2. 初始状态
const initialState = { count: 0 };

function Counter() {
  // 3. useReducer 返回 [state, dispatch]
  const [state, dispatch] = useReducer(counterReducer, initialState);

  return (
    <div>
      <p>{state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+1</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-1</button>
      <button onClick={() => dispatch({ type: 'reset' })}>重置</button>
    </div>
  );
}
\`\`\`

**核心思想**：组件只负责"派发什么 action"，状态如何变化由 reducer 决定。

## 37.3 何时用 useReducer 替代 useState

| 场景 | 用 useState | 用 useReducer |
| --- | --- | --- |
| 单个简单值（计数器、开关） | ✅ | ❌ |
| 关联状态（表单多个字段） | ❌ | ✅ |
| 复杂状态转换（多分支） | ❌ | ✅ |
| 状态变化有约束（必须满足条件） | ❌ | ✅ |
| 需要测试状态转换逻辑 | ❌ | ✅ |
| 多人协作、状态流转要清晰 | ❌ | ✅ |

\`\`\`tsx
// ✅ 简单值用 useState
const [open, setOpen] = useState(false);
const [count, setCount] = useState(0);

// ✅ 复杂状态用 useReducer
const [form, dispatch] = useReducer(formReducer, {
  values: { name: '', email: '' },
  errors: {},
  submitting: false,
  touched: {},
});
\`\`\`

**经验法则**：useState 超过 3 个、或状态间有依赖，就考虑 useReducer。

## 37.4 判别式联合 Action

TypeScript 配合 useReducer 的杀手锏：**判别式联合类型**让 action.payload 类型安全。

\`\`\`tsx
type CounterState = { count: number };

// 判别式联合：每个 action 类型对应不同 payload
type CounterAction =
  | { type: 'increment' }                                          // 无 payload
  | { type: 'decrement' }
  | { type: 'reset' }
  | { type: 'set'; payload: number }                              // 带 payload
  | { type: 'add'; payload: { amount: number; twice?: boolean } }; // 复杂 payload

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    case 'set':
      // 这里 action 自动收窄为 { type: 'set'; payload: number }
      return { count: action.payload };
    case 'add':
      // 这里 action.payload.amount 可访问
      const amount = action.payload.twice ? action.payload.amount * 2 : action.payload.amount;
      return { count: state.count + amount };
    default:
      return state;
  }
}

// dispatch 时自动检查 payload 类型
dispatch({ type: 'set', payload: 10 });  // ✅
dispatch({ type: 'set' });               // ❌ TS 报错：缺少 payload
dispatch({ type: 'set', payload: '10' }); // ❌ TS 报错：payload 不是 number
\`\`\`

**关键好处**：

1. dispatch 时 TS 自动检查 payload 类型
2. reducer 里 switch 自动收窄 action 类型
3. 加新 action 类型时所有相关地方都有提示

## 37.5 穷尽性检查 never

加新 case 时容易漏，TS 提供**never 检查**保证覆盖所有分支：

\`\`\`tsx
function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    // ❌ 故意漏掉 reset、set、add
    default:
      // 检查 action 是否是 never 类型
      const _exhaustive: never = action;  // 如果漏了 case，这里报错
      return state;
  }
}
// TS 报错：Type '{ type: "reset"; }' is not assignable to type 'never'.
\`\`\`

加新 action 时：

\`\`\`tsx
type CounterAction =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' }
  | { type: 'set'; payload: number }
  | { type: 'add'; payload: { amount: number; twice?: boolean } }
  | { type: 'multiply'; payload: number };  // 新增

// reducer 没加 case 'multiply'，default 处的 never 检查会报错
// → 强制开发者补上 case 'multiply'
\`\`\`

**这是 useReducer + TS 最强大的特性**——编译期保证 reducer 完整性。

## 37.6 init 惰性初始化

第三个参数 \`init\` 用来**惰性计算初始状态**。避免每次渲染都执行昂贵的初始化。

\`\`\`tsx
// ❌ 每次渲染都执行 JSON.parse
function Component() {
  const [state, dispatch] = useReducer(reducer, JSON.parse(localStorage.getItem('data') || '{}'));
}

// ✅ 用 init 惰性初始化，只在挂载时执行一次
function init(initialArg) {
  return JSON.parse(localStorage.getItem('data') || '{}');
}

function Component() {
  const [state, dispatch] = useReducer(reducer, null, init);
}
\`\`\`

**重置场景**：dispatch 一个 reset action，配合 init 重置回初始状态。

\`\`\`tsx
const initialState = { count: 0 };
function init() {
  return { count: Number(localStorage.getItem('initialCount')) || 0 };
}

function reducer(state, action) {
  switch (action.type) {
    case 'reset':
      return init();  // 重新调用 init
    case 'increment':
      return { count: state.count + 1 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  return (
    <div>
      <p>{state.count}</p>
      <button onClick={() => dispatch({ type: 'reset' })}>重置</button>
    </div>
  );
}
\`\`\`

## 37.7 购物车 reducer 实战

\`\`\`tsx
type CartItem = { id: string; name: string; price: number; quantity: number };
type CartState = { items: CartItem[]; total: number };

type CartAction =
  | { type: 'add'; payload: CartItem }
  | { type: 'remove'; payload: { id: string } }
  | { type: 'updateQuantity'; payload: { id: string; quantity: number } }
  | { type: 'clear' };

function calcTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const existing = state.items.find(i => i.id === action.payload.id);
      let items: CartItem[];
      if (existing) {
        // 已存在，数量 +1
        items = state.items.map(i =>
          i.id === action.payload.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        // 不存在，新增
        items = [...state.items, { ...action.payload, quantity: 1 }];
      }
      return { items, total: calcTotal(items) };
    }
    case 'remove': {
      const items = state.items.filter(i => i.id !== action.payload.id);
      return { items, total: calcTotal(items) };
    }
    case 'updateQuantity': {
      const items = state.items.map(i =>
        i.id === action.payload.id
          ? { ...i, quantity: Math.max(0, action.payload.quantity) }
          : i
      ).filter(i => i.quantity > 0);
      return { items, total: calcTotal(items) };
    }
    case 'clear':
      return { items: [], total: 0 };
    default:
      return state;
  }
}

function ShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  const handleAdd = (item: CartItem) => dispatch({ type: 'add', payload: item });
  const handleRemove = (id: string) => dispatch({ type: 'remove', payload: { id } });

  return (
    <div>
      <p>总价：¥{state.total}</p>
      <ul>
        {state.items.map(item => (
          <li key={item.id}>
            {item.name} × {item.quantity} = ¥{item.price * item.quantity}
            <button onClick={() => handleRemove(item.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

## 37.8 useReducer + useContext 替代 Redux

把 reducer 提到 Provider 里，所有后代组件都能 dispatch：

\`\`\`tsx
import { createContext, useContext, useReducer, ReactNode } from 'react';

type CartContextValue = {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart 必须在 <CartProvider> 内使用');
  return ctx;
}

// 任何后代组件都能 dispatch
function AddToCartButton({ item }: { item: CartItem }) {
  const { dispatch } = useCart();
  return <button onClick={() => dispatch({ type: 'add', payload: item })}>加入购物车</button>;
}
\`\`\`

小型项目用这个模式可以替代 Redux，简单清晰。

## 37.9 实际项目中的 useReducer

1. **判别式联合 action**：TS 自动检查 payload
2. **never 穷尽检查**：保证覆盖所有分支
3. **reducer 是纯函数**：不要在 reducer 里副作用（fetch、console.log）
4. **不可变更新**：永远返回新对象，不要直接改 state
5. **复杂逻辑用 immer**：避免展开运算符地狱
6. **init 惰性初始化**：避免每次渲染重复计算

\`\`\`tsx
import { produce } from 'immer';

// 用 immer 简化不可变更新
function cartReducer(state: CartState, action: CartAction): CartState {
  return produce(state, draft => {
    switch (action.type) {
      case 'add':
        const existing = draft.items.find(i => i.id === action.payload.id);
        if (existing) existing.quantity += 1;
        else draft.items.push({ ...action.payload, quantity: 1 });
        draft.total = draft.items.reduce((s, i) => s + i.price * i.quantity, 0);
        break;
      case 'clear':
        draft.items = [];
        draft.total = 0;
        break;
    }
  });
}
\`\`\`

## 37.10 小结

- useReducer 把状态和状态转换逻辑集中到 reducer
- 三件套：reducer（纯函数）+ action（描述变化）+ dispatch（派发）
- 简单状态用 useState，复杂状态用 useReducer
- 判别式联合 action 让 dispatch 时自动检查 payload
- never 穷尽检查保证 reducer 覆盖所有分支
- 第三个参数 init 惰性初始化，避免重复计算
- useReducer + useContext 可以替代小型 Redux
- 用 immer 简化不可变更新
`,
    code: `// =============================================================
// 第 37 章 demo：useReducer 复杂状态
// 模拟购物车 reducer、判别式联合 action、never 穷尽检查
// =============================================================

// ---- 模拟 useReducer 实现 ----
function useReducer(reducer, initialState, init) {
  // 真实 React 用闭包保存 state，这里用变量模拟
  let state = init ? init(initialState) : initialState;
  const dispatch = (action) => {
    const newState = reducer(state, action);
    console.log('  [dispatch]', JSON.stringify(action), '→', JSON.stringify(newState));
    state = newState;
    return state;
  };
  return [state, dispatch];
}

// ---- 1. 简单 counter reducer ----
console.log('=== 1. 简单 counter reducer ===');

function counterReducer(state, action) {
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
      return state;
  }
}

let [counterState, counterDispatch] = useReducer(counterReducer, { count: 0 });
console.log('  初始 state:', JSON.stringify(counterState));
counterState = counterDispatch({ type: 'increment' });
counterState = counterDispatch({ type: 'increment' });
counterState = counterDispatch({ type: 'set', payload: 100 });
counterState = counterDispatch({ type: 'decrement' });
counterState = counterDispatch({ type: 'reset' });
console.log('  最终 state:', JSON.stringify(counterState));

// ---- 2. 判别式联合 Action 模拟 ----
console.log('\\n=== 2. 判别式联合 Action ===');

// type CounterAction =
//   | { type: 'increment' }
//   | { type: 'decrement' }
//   | { type: 'set'; payload: number }
//   | { type: 'add'; payload: { amount: number; twice?: boolean } };

function typedCounterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      // 这里 action 收窄为 { type: 'increment' }
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'set':
      // 这里 action.payload 是 number
      return { count: action.payload };
    case 'add':
      // 这里 action.payload.amount 可访问
      const amount = action.payload.twice ? action.payload.amount * 2 : action.payload.amount;
      return { count: state.count + amount };
    default:
      return state;
  }
}

let [typedState, typedDispatch] = useReducer(typedCounterReducer, { count: 0 });
typedState = typedDispatch({ type: 'add', payload: { amount: 5, twice: true } });
typedState = typedDispatch({ type: 'add', payload: { amount: 3 } });
console.log('  最终 state:', JSON.stringify(typedState));

// 模拟 TS 编译期检查：dispatch 时检查 payload
console.log('  --- TS 编译期检查（模拟） ---');
console.log('  ✅ dispatch({ type: "set", payload: 10 })  → 通过');
console.log('  ❌ dispatch({ type: "set" })              → 报错：缺 payload');
console.log('  ❌ dispatch({ type: "set", payload: "10" }) → 报错：payload 类型错');

// ---- 3. never 穷尽性检查 ----
console.log('\\n=== 3. never 穷尽性检查 ===');

// 模拟漏 case 的 reducer
function incompleteReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    // 漏了 reset、set、add
    default:
      // 模拟 const _exhaustive: never = action;
      // 如果 action 还有其他 case，TS 会报错
      const remainingCases = ['reset', 'set', 'add'];
      if (remainingCases.length > 0) {
        console.log('  ⚠️  TS 报错：以下 case 未处理:', remainingCases.join(', '));
        console.log('     类型 "' + remainingCases[0] + '" 不能赋值给 "never"');
      }
      return state;
  }
}
incompleteReducer({ count: 0 }, { type: 'reset' });

// 加上所有 case 后，never 检查通过
console.log('  --- 补全所有 case 后 ---');
console.log('  ✅ 所有分支覆盖，const _exhaustive: never = action 通过');

// ---- 4. init 惰性初始化 ----
console.log('\\n=== 4. init 惰性初始化 ===');

let initCallCount = 0;
function expensiveInit(initialArg) {
  initCallCount++;
  console.log('  [init] 计算（耗时操作）, 第 ' + initCallCount + ' 次');
  return { data: 'expensive-' + initialArg, items: [] };
}

// 模拟 useReducer(reducer, initialArg, init)：init 只调用一次
let [initState, initDispatch] = useReducer(
  (s) => s,
  'initialArg',
  expensiveInit
);
console.log('  init 调用次数:', initCallCount, '（只调用一次）');

// ---- 5. 购物车 reducer 实战 ----
console.log('\\n=== 5. 购物车 reducer 实战 ===');

function calcTotal(items) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const existing = state.items.find(i => i.id === action.payload.id);
      let items;
      if (existing) {
        items = state.items.map(i =>
          i.id === action.payload.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        items = [...state.items, { ...action.payload, quantity: 1 }];
      }
      return { items, total: calcTotal(items) };
    }
    case 'remove': {
      const items = state.items.filter(i => i.id !== action.payload.id);
      return { items, total: calcTotal(items) };
    }
    case 'updateQuantity': {
      const items = state.items.map(i =>
        i.id === action.payload.id
          ? { ...i, quantity: Math.max(0, action.payload.quantity) }
          : i
      ).filter(i => i.quantity > 0);
      return { items, total: calcTotal(items) };
    }
    case 'clear':
      return { items: [], total: 0 };
    default:
      return state;
  }
}

let [cartState, cartDispatch] = useReducer(cartReducer, { items: [], total: 0 });
cartState = cartDispatch({ type: 'add', payload: { id: '1', name: '苹果', price: 5 } });
cartState = cartDispatch({ type: 'add', payload: { id: '2', name: '香蕉', price: 3 } });
cartState = cartDispatch({ type: 'add', payload: { id: '1', name: '苹果', price: 5 } });  // 苹果 +1
cartState = cartDispatch({ type: 'updateQuantity', payload: { id: '2', quantity: 3 } });
cartState = cartDispatch({ type: 'remove', payload: { id: '1' } });
console.log('\\n  最终购物车:');
console.log('    items:', JSON.stringify(cartState.items));
console.log('    total: ¥' + cartState.total);

// ---- 6. useReducer + useContext 模式 ----
console.log('\\n=== 6. useReducer + useContext ===');

// 模拟 Context + Provider
function createCartStore() {
  const listeners = [];
  let currentState = { items: [], total: 0 };

  function dispatch(action) {
    currentState = cartReducer(currentState, action);
    listeners.forEach(l => l(currentState));
  }

  function subscribe(listener) {
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }

  function getState() { return currentState; }
  return { dispatch, subscribe, getState };
}

const cartStore = createCartStore();

// 模拟两个组件订阅
const componentA_log = [];
const componentB_log = [];
cartStore.subscribe(state => componentA_log.push(JSON.stringify(state)));
cartStore.subscribe(state => componentB_log.push(JSON.stringify(state)));

console.log('  组件 A 和 B 都订阅了 CartContext');
cartStore.dispatch({ type: 'add', payload: { id: '1', name: '书', price: 50 } });
console.log('  dispatch 后 A 收到:', componentA_log.length, '次');
console.log('  dispatch 后 B 收到:', componentB_log.length, '次');
console.log('  → 两个组件都收到更新（useReducer + useContext 模式）');

// ---- 关键要点总结 ----
console.log('\\n=== useReducer 核心要点 ===');
console.log('1. 三件套：reducer（纯函数）+ action + dispatch');
console.log('2. 简单状态用 useState，复杂状态用 useReducer');
console.log('3. 判别式联合 action：TS 自动检查 payload');
console.log('4. switch 内 action 类型自动收窄');
console.log('5. never 穷尽检查：保证覆盖所有 case');
console.log('6. 第三参数 init 惰性初始化，避免重复计算');
console.log('7. useReducer + useContext 可替代小型 Redux');
console.log('8. 用 immer 简化不可变更新');
`,
  },

  // =========================================================
  // 第三十八章：useCallback 函数缓存
  // =========================================================
  {
    id: "tspro-use-callback",
    group: "六、React Hooks 全套",
    icon: "🔒",
    title: "useCallback 函数缓存",
    content: `# 第三十八章：useCallback 函数缓存

## 38.1 useCallback 解决什么问题

React 函数组件**每次渲染都会重新执行函数体**，组件内定义的函数每次都是新引用：

\`\`\`tsx
function Parent({ data }) {
  const handleClick = () => {  // 每次渲染都是新函数
    console.log('clicked', data);
  };
  return <Child onClick={handleClick} />;
}

const Child = React.memo(function Child({ onClick }) {
  console.log('Child 渲染');
  return <button onClick={onClick}>click</button>;
});
\`\`\`

即使 \`data\` 没变，\`handleClick\` 每次都是新引用 → \`React.memo\` 失效 → Child 重渲染。

\`useCallback\` 缓存函数引用，**只有依赖变化时才重新创建**：

\`\`\`tsx
function Parent({ data }) {
  const handleClick = useCallback(() => {
    console.log('clicked', data);
  }, [data]);  // data 不变，handleClick 引用不变
  return <Child onClick={handleClick} />;
}
\`\`\`

\`React.memo\` 命中，Child 不重渲染。

## 38.2 useCallback 基本用法

\`\`\`tsx
const memoizedCallback = useCallback(callback, dependencies);
\`\`\`

- \`callback\`：要缓存的函数
- \`dependencies\`：依赖数组，决定何时重新创建

\`\`\`tsx
function SearchBox() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  // ❌ 每次渲染都创建新函数
  const handleSearch = () => {
    fetch('/api/search?q=' + query + '&page=' + page);
  };

  // ✅ 只在 query 或 page 变化时重建
  const handleSearchMemo = useCallback(() => {
    fetch('/api/search?q=' + query + '&page=' + page);
  }, [query, page]);

  return <button onClick={handleSearchMemo}>搜索</button>;
}
\`\`\`

**与 useEffect 依赖数组规则一致**：依赖变化时重新创建函数。

## 38.3 依赖数组怎么填

\`useCallback\` 内部用到的**所有外部变量**都要进依赖数组：

\`\`\`tsx
function Profile({ userId }) {
  const [tab, setTab] = useState('posts');

  // ✅ 用到 fetchPosts、userId、tab，都要进依赖
  const loadData = useCallback(async () => {
    const data = await fetchPosts(userId, tab);
    return data;
  }, [fetchPosts, userId, tab]);

  // ❌ 漏依赖：闭包捕获了旧值
  const loadDataBad = useCallback(async () => {
    const data = await fetchPosts(userId, tab);  // tab 永远是旧值
  }, [userId]);  // 漏了 tab
}
\`\`\`

**经验**：

- 开 \`react-hooks/exhaustive-deps\` ESLint 规则
- 不知道填什么就把用到的外部变量都填上

## 38.4 何时不需要 useCallback

**不是所有函数都需要 useCallback**。滥用反而更慢：

### 1. 简单内联函数

\`\`\`tsx
// ❌ 没必要 useCallback
const handleClick = useCallback(() => {
  setCount(c => c + 1);
}, []);

// ✅ 直接内联
return <button onClick={() => setCount(c => c + 1)}>+1</button>;
\`\`\`

\`useCallback\` 本身有性能开销（比较依赖、维护缓存）。简单函数用内联更轻量。

### 2. 没传给子组件

\`\`\`tsx
function Parent() {
  // ❌ 只在 Parent 内部用，没必要缓存
  const handleSort = useCallback(() => {
    items.sort(...);
  }, [items]);

  return <div>{renderSorted(handleSort)}</div>;  // 不传给子组件
}
\`\`\`

useCallback 的收益是**让接收方 \`React.memo\` 命中**。如果函数没传给子组件，缓存没意义。

### 3. 依赖几乎每次都变

\`\`\`tsx
// ❌ query 每次输入都变，useCallback 没意义
const handleSearch = useCallback(() => {
  fetch('/api?q=' + query);
}, [query]);  // query 每次都变
\`\`\`

依赖每次都变 = 每次都重建函数 = 跟不用 useCallback 一样。

### 判断标准

**只在以下场景用 useCallback**：

1. 函数作为 prop 传给 \`React.memo\` 包裹的子组件
2. 函数作为 useEffect / useCallback 的依赖
3. 函数被外部代码订阅（如 \`addEventListener\`）

## 38.5 与 React.memo 配合

\`useCallback\` 最常见的场景——**配合 React.memo 优化子组件**。

\`\`\`tsx
import { memo, useCallback, useState } from 'react';

// 子组件用 memo 包裹：props 不变就不重渲染
const ExpensiveItem = memo(function ExpensiveItem({ item, onSelect }) {
  console.log('ExpensiveItem 渲染', item.id);
  return (
    <li>
      <span>{item.name}</span>
      <button onClick={() => onSelect(item.id)}>select</button>
    </li>
  );
});

function List({ items }) {
  const [selected, setSelected] = useState(null);

  // ✅ useCallback 让 onSelect 引用稳定
  const handleSelect = useCallback((id) => {
    setSelected(id);
  }, []);  // setSelected 引用稳定，依赖空数组

  return (
    <ul>
      {items.map(item => (
        <ExpensiveItem key={item.id} item={item} onSelect={handleSelect} />
      ))}
    </ul>
  );
}
\`\`\`

\`selected\` 变化时，\`List\` 重渲染，但 \`handleSelect\` 引用不变 → \`ExpensiveItem\` 不重渲染。

**关键**：useCallback 让 \`handleSelect\` 引用稳定 → memo 命中 → 子组件跳过渲染。

## 38.6 稳定引用的常见场景

### 1. 防抖 / 节流

\`\`\`tsx
function SearchBox() {
  const debouncedSearch = useCallback(
    debounce((q) => fetch('/api?q=' + q), 300),
    []
  );
  return <input onChange={e => debouncedSearch(e.target.value)} />;
}
\`\`\`

依赖空数组 = 函数只创建一次，debounce 内部计时器才能正确累积。

### 2. 定时器回调

\`\`\`tsx
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // ✅ tick 引用稳定，useEffect 只执行一次
    const tick = () => setCount(c => c + 1);
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);  // 依赖空数组
}
\`\`\`

### 3. effect 依赖

\`\`\`tsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  // ✅ fetchUser 引用稳定，useEffect 只在 userId 变化时执行
  const fetchUser = useCallback(async () => {
    const data = await api.getUser(userId);
    setUser(data);
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);  // 依赖稳定的 fetchUser
}
\`\`\`

### 4. 事件订阅

\`\`\`tsx
function WindowSize() {
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    // ✅ handler 引用稳定，addEventListener/removeEventListener 配对
    const handler = () => setSize({ w: innerWidth, h: innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
}
\`\`\`

## 38.7 useCallback 与 useState 函数式更新

很多场景下，回调函数只用 \`setState\`。这种**不需要 useCallback**——\`setState\` 本身引用稳定。

\`\`\`tsx
function Counter() {
  const [count, setCount] = useState(0);

  // ❌ 多余：setCount 引用稳定，不需要 useCallback
  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  // ✅ 直接定义（setCount 永远不变）
  const increment2 = () => setCount(c => c + 1);

  return <button onClick={increment2}>+1</button>;
}
\`\`\`

**setState 是稳定引用**，用它的函数不需要 useCallback。

## 38.8 实际项目中的 useCallback

1. **传给 React.memo 子组件的回调**：必用
2. **作为 useEffect 依赖**：必用（否则 effect 每次都执行）
3. **addEventListener 的 handler**：必用
4. **简单内联 onClick**：不用
5. **只在父组件内部用的函数**：不用
6. **依赖每次都变的函数**：不用

\`\`\`tsx
function App() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState([]);

  // ✅ 传给 memo 子组件
  const handleSelect = useCallback((id) => {
    setData(prev => prev.filter(d => d.id !== id));
  }, []);

  // ✅ 作为 useEffect 依赖
  const fetchData = useCallback(async () => {
    const result = await api.list();
    setData(result);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ❌ 没必要 useCallback
  const handleSimpleClick = () => setCount(c => c + 1);

  return (
    <div>
      <button onClick={handleSimpleClick}>{count}</button>
      <List data={data} onSelect={handleSelect} />
    </div>
  );
}
\`\`\`

## 38.9 小结

- useCallback 缓存函数引用，依赖变化时才重新创建
- 解决"父组件每次渲染都传新函数导致 React.memo 失效"
- 依赖数组填法与 useEffect 一致（用到的外部变量都填）
- **不是所有函数都需要 useCallback**：滥用反而更慢
- 只在 3 种场景用：传给 memo 子组件、作为 effect 依赖、addEventListener
- \`setState\` 是稳定引用，只用它的回调不需要 useCallback
- 简单内联函数直接写，别套 useCallback
`,
    code: `// =============================================================
// 第 38 章 demo：useCallback 函数缓存
// 模拟 useCallback 依赖对比、与 React.memo 配合
// =============================================================

// ---- 模拟 useCallback 实现 ----
function useCallbackImpl(callback, deps) {
  // 真实 React 用闭包保存上次依赖和函数
  let prevDeps = null;
  let prevCallback = null;

  return function() {
    // 第一次：直接保存
    if (prevDeps === null) {
      prevDeps = deps;
      prevCallback = callback;
      console.log('  [useCallback] 首次创建函数');
      return prevCallback;
    }
    // 后续：对比依赖
    const changed = deps.some((d, i) => d !== prevDeps[i]);
    if (changed) {
      prevDeps = deps;
      prevCallback = callback;
      console.log('  [useCallback] 依赖变化，重新创建函数');
      return prevCallback;
    }
    console.log('  [useCallback] 依赖未变，复用旧函数');
    return prevCallback;
  };
}

// ---- 模拟 React.memo ----
function memo(Component) {
  let lastProps = null;
  let lastResult = null;
  let renderCount = 0;
  return function(props) {
    // 浅比较 props
    const same = lastProps && Object.keys(props).every(k =>
      typeof props[k] === 'function'
        ? props[k] === lastProps[k]  // 函数引用比较
        : props[k] === lastProps[k]
    );
    if (same) {
      console.log('  [memo] props 没变，跳过渲染');
      return lastResult;
    }
    lastProps = props;
    renderCount++;
    console.log('  [memo] props 变了，重渲染 #' + renderCount);
    lastResult = Component(props);
    return lastResult;
  };
}

// ---- 1. 没 useCallback 的问题 ----
console.log('=== 1. 没 useCallback 的问题 ===');

function ParentWithoutMemo(props) {
  // 每次渲染都创建新函数
  const handleClick = () => { console.log('  clicked', props.data); };
  return { onClick: handleClick };
}

const MemoizedChild = memo(function Child(props) {
  return { button: 'button-' + props.onClick };
});

console.log('渲染 1:');
let parent1 = ParentWithoutMemo({ data: 'A' });
MemoizedChild({ onClick: parent1.onClick });

console.log('渲染 2（data 没变）:');
let parent2 = ParentWithoutMemo({ data: 'A' });
MemoizedChild({ onClick: parent2.onClick });
console.log('  → 函数引用变了，memo 失效');

// ---- 2. 用 useCallback 优化 ----
console.log('\\n=== 2. 用 useCallback 优化 ===');

function ParentWithMemo(props) {
  // useCallback 缓存函数
  const handleClick = useCallbackImpl(
    () => { console.log('  clicked', props.data); },
    [props.data]
  );
  return { onClick: handleClick };
}

console.log('渲染 1:');
let p1 = ParentWithMemo({ data: 'A' });
let fn1 = p1.onClick();
console.log('  fn1 引用:', typeof fn1 === 'function' ? 'function' : 'unknown');

console.log('渲染 2（data 没变）:');
let p2 = ParentWithMemo({ data: 'A' });
let fn2 = p2.onClick();
console.log('  fn1 === fn2 ?', fn1 === fn2, '（同一引用）');

console.log('渲染 3（data 变了）:');
let p3 = ParentWithMemo({ data: 'B' });
let fn3 = p3.onClick();
console.log('  fn1 === fn3 ?', fn1 === fn3, '（不同引用）');

// ---- 3. 与 React.memo 配合 ----
console.log('\\n=== 3. useCallback + React.memo 配合 ===');

let lastHandlerRef = null;
function ParentWithMemoAndChild(props) {
  const handleClick = useCallbackImpl(() => {
    console.log('  click', props.data);
  }, [props.data]);
  return { onClick: handleClick };
}

const MemoChild = memo(function Child(props) {
  return { rendered: true };
});

console.log('渲染 1（首次）:');
let pa1 = ParentWithMemoAndChild({ data: 'A' });
let handler1 = pa1.onClick();
MemoChild({ onClick: handler1 });

console.log('渲染 2（data 没变，handler 引用稳定）:');
let pa2 = ParentWithMemoAndChild({ data: 'A' });
let handler2 = pa2.onClick();
MemoChild({ onClick: handler2 });
console.log('  → handler1 === handler2 ?', handler1 === handler2);

console.log('渲染 3（data 变了）:');
let pa3 = ParentWithMemoAndChild({ data: 'B' });
let handler3 = pa3.onClick();
MemoChild({ onClick: handler3 });
console.log('  → handler1 === handler3 ?', handler1 === handler3);

// ---- 4. 何时不需要 useCallback ----
console.log('\\n=== 4. 何时不需要 useCallback ===');

// 场景 1：简单内联函数
console.log('  场景 1：简单内联 onClick');
console.log('    ✅ 直接写：onClick={() => setCount(c => c + 1)}');
console.log('    ❌ 不需要：useCallback(() => setCount(c => c + 1), [])');

// 场景 2：没传给子组件
console.log('  场景 2：函数只在父组件内部用');
console.log('    ✅ 直接定义：const handleSort = () => items.sort(...)');
console.log('    ❌ 不需要：useCallback（没传给子组件，缓存没意义）');

// 场景 3：依赖几乎每次都变
console.log('  场景 3：依赖每次都变');
console.log('    ❌ useCallback(() => fetch(q), [q])  // q 每次输入都变');

// 场景 4：只用 setState 的回调
console.log('  场景 4：回调只用 setState');
console.log('    ✅ 直接定义：const inc = () => setCount(c => c + 1)');
console.log('    ❌ 不需要：setCount 本身就是稳定引用');

// ---- 5. setState 是稳定引用演示 ----
console.log('\\n=== 5. setState 是稳定引用 ===');

function useStateStub(initial) {
  let state = initial;
  // React 内部 setState 引用永远不变
  const setState = (newVal) => {
    state = typeof newVal === 'function' ? newVal(state) : newVal;
    console.log('    setState 被调用，新值:', state);
  };
  return [state, setState];
}

const [count, setCount] = useStateStub(0);
const setCountRef1 = setCount;
setCount(1);
const setCountRef2 = setCount;
setCount(c => c + 1);
console.log('  setCount 引用稳定：', setCountRef1 === setCountRef2, '（永远相同）');
console.log('  → 只用 setState 的回调不需要 useCallback');

// ---- 6. 防抖场景：稳定引用的重要性 ----
console.log('\\n=== 6. 防抖场景：稳定引用 ===');

function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ❌ 错：每次渲染都创建新 debounce 函数，timer 永远被清空
let badRenderCount = 0;
function BadSearch(props) {
  const debounced = debounce((q) => console.log('  search:', q), 100);
  badRenderCount++;
  return { handler: debounced };
}
console.log('  ❌ 错误写法：每次渲染都新建 debounce');
const bad1 = BadSearch({}).handler;
const bad2 = BadSearch({}).handler;
console.log('    bad1 === bad2 ?', bad1 === bad2, '（不同引用，timer 不共享）');

// ✅ 对：用 useCallback 缓存
let goodRenderCount = 0;
function GoodSearch(props) {
  const handler = useCallbackImpl(
    debounce((q) => console.log('  search:', q), 100),
    []
  );
  goodRenderCount++;
  return { handler: handler };
}
console.log('  ✅ 正确写法：useCallback + []');
const good1 = GoodSearch({}).handler();
const good2 = GoodSearch({}).handler();
console.log('    good1 === good2 ?', good1 === good2, '（同一引用，timer 共享）');

// ---- 7. 完整的优化对比 ----
console.log('\\n=== 7. 完整优化对比 ===');

function runBenchmark(useCallbackOn) {
  let childRenders = 0;
  const Child = memo(function Child(props) {
    childRenders++;
    return null;
  });

  let handler;
  for (let i = 0; i < 5; i++) {
    if (useCallbackOn) {
      // 模拟 useCallback：依赖不变，引用稳定
      if (i === 0) handler = () => {};
    } else {
      // 模拟无 useCallback：每次都新建
      handler = () => {};
    }
    Child({ onClick: handler });
  }
  return childRenders;
}

const withMemo = runBenchmark(true);
const withoutMemo = runBenchmark(false);
console.log('  用 useCallback：子组件渲染 ' + withMemo + ' 次');
console.log('  不用 useCallback：子组件渲染 ' + withoutMemo + ' 次');
console.log('  → 优化效果：减少', withoutMemo - withMemo, '次渲染');

// ---- 关键要点总结 ----
console.log('\\n=== useCallback 核心要点 ===');
console.log('1. useCallback 缓存函数引用，依赖变化时才重建');
console.log('2. 主要场景：传给 React.memo 子组件的回调');
console.log('3. 作为 useEffect / useCallback 的依赖');
console.log('4. addEventListener 的 handler 需要稳定引用');
console.log('5. setState 引用稳定，只用它的回调不需要 useCallback');
console.log('6. 简单内联函数直接写，别套 useCallback');
console.log('7. 依赖每次都变的函数，useCallback 没意义');
`,
  },

  // =========================================================
  // 第三十九章：useMemo 值缓存
  // =========================================================
  {
    id: "tspro-use-memo",
    group: "六、React Hooks 全套",
    icon: "💾",
    title: "useMemo 值缓存",
    content: `# 第三十九章：useMemo 值缓存

## 39.1 useMemo 缓存计算结果

\`useMemo\` 缓存**计算结果**，只在依赖变化时重新计算。

\`\`\`tsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
\`\`\`

\`\`\`tsx
function ProductList({ products, filter }) {
  // ❌ 每次渲染都重新过滤 + 排序（即使 products/filter 没变）
  const visibleProducts = products
    .filter(p => p.category === filter)
    .sort((a, b) => a.price - b.price);

  // ✅ 只在 products 或 filter 变化时重新计算
  const visibleProductsMemo = useMemo(
    () => products
      .filter(p => p.category === filter)
      .sort((a, b) => a.price - b.price),
    [products, filter]
  );

  return <ul>{visibleProductsMemo.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
\`\`\`

**核心思想**：相同的输入 → 复用上次的输出，避免重复计算。

## 39.2 何时用 useMemo

### 1. 计算昂贵

\`\`\`tsx
function Chart({ data }) {
  // 计算复杂统计：O(n²) 算法
  const stats = useMemo(() => {
    return calculateStats(data);  // 假设要遍历 10w 次
  }, [data]);

  return <svg>{stats.map(...)}</svg>;
}
\`\`\`

**判断标准**：计算量 > 缓存开销（依赖比较 + 内存）才划算。

### 2. 缓存对象/数组引用

\`\`\`tsx
function Parent({ users }) {
  // ❌ 每次渲染都是新对象，传给 memo 子组件会重渲染
  const filteredUsers = users.filter(u => u.active);

  // ✅ useMemo 缓存引用
  const filteredUsersMemo = useMemo(
    () => users.filter(u => u.active),
    [users]
  );

  return <MemoizedList users={filteredUsersMemo} />;
}
\`\`\`

**关键**：\`React.memo\` 浅比较 props，对象/数组每次都是新引用 → memo 失效。useMemo 让引用稳定。

### 3. 缓存依赖项

\`\`\`tsx
function Search({ query }) {
  // ✅ 用 useMemo 让 options 引用稳定
  const options = useMemo(() => ({
    url: '/api/search',
    params: { q: query },
  }), [query]);

  // options 作为 useEffect 依赖
  useEffect(() => {
    fetch(options.url + '?q=' + options.params.q);
  }, [options]);  // options 引用稳定，effect 只在 query 变时执行
}
\`\`\`

### 4. 复杂 JSX 缓存

\`\`\`tsx
function BigList({ items }) {
  // ✅ 列表 JSX 缓存，items 不变就复用
  const list = useMemo(() =>
    items.map(item => (
      <li key={item.id}>
        <Item data={item} />
      </li>
    )),
    [items]
  );

  return <ul>{list}</ul>;
}
\`\`\`

## 39.3 何时不该用 useMemo

### 1. 简单计算

\`\`\`tsx
// ❌ 简单计算用 useMemo 反而更慢
const sum = useMemo(() => a + b, [a, b]);  // 加法比 useMemo 开销还小

// ✅ 直接计算
const sum = a + b;

// ❌ 字符串拼接
const greeting = useMemo(() => 'Hello, ' + name, [name]);
// ✅ 直接
const greeting = 'Hello, ' + name;
\`\`\`

\`useMemo\` 有开销（依赖比较、缓存存储）。**简单计算直接算**比缓存更快。

### 2. 原始值

\`\`\`tsx
// ❌ 原始值不需要 useMemo
const isVisible = useMemo(() => count > 0, [count]);
// ✅ 直接
const isVisible = count > 0;
\`\`\`

原始值比较成本几乎为 0，重新计算比缓存更快。

### 3. 依赖每次都变

\`\`\`tsx
// ❌ 依赖每次都变，useMemo 没意义
const result = useMemo(() => compute(value), [value]);  // value 每次都变
\`\`\`

依赖每次都变 = 每次都重新计算 = 跟不用 useMemo 一样，反而多了缓存开销。

### 判断标准

| 场景 | 用 useMemo | 不用 |
| --- | --- | --- |
| 计算耗时（O(n) 以上） | ✅ | |
| 缓存对象/数组引用（传给 memo 子组件） | ✅ | |
| 计算简单加法/拼接 | | ✅ |
| 原始值（boolean、number） | | ✅ |
| 依赖每次都变 | | ✅ |

## 39.4 useMemo 与 useCallback 的关系

\`useCallback\` 本质上是 \`useMemo\` 的语法糖：

\`\`\`tsx
// 这两个等价
const handleClick = useCallback(() => { doSomething(a); }, [a]);

const handleClick2 = useMemo(() => () => { doSomething(a); }, [a]);
\`\`\`

\`useCallback(fn, deps)\` 等价于 \`useMemo(() => fn, deps)\`——缓存函数引用。

**使用建议**：

- 缓存函数 → 用 \`useCallback\`（语义清晰）
- 缓存值/对象/数组 → 用 \`useMemo\`

## 39.5 useMemo 缓存对象避免重渲染

最常见的优化场景——**用 useMemo 包裹传给 memo 子组件的 props**。

\`\`\`tsx
import { memo, useMemo, useState } from 'react';

const UserCard = memo(function UserCard({ user, style }) {
  console.log('UserCard 渲染');
  return (
    <div style={style}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

function App() {
  const [count, setCount] = useState(0);
  const [user] = useState({ name: 'Alice', email: 'a@x.com' });

  // ❌ style 每次都是新对象 → UserCard 重渲染
  // const style = { color: 'red', padding: 10 };

  // ✅ useMemo 缓存 style 引用
  const style = useMemo(() => ({
    color: 'red',
    padding: 10,
  }), []);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <UserCard user={user} style={style} />
    </div>
  );
}
\`\`\`

\`count\` 变化时 \`App\` 重渲染，但 \`style\` 引用不变 → \`UserCard\` 跳过渲染。

## 39.6 useMemo 的依赖

跟 useEffect / useCallback 一样：**用到的外部变量都要进依赖**。

\`\`\`tsx
function Filter({ items, keyword, sortBy }) {
  // ✅ 用到 items、keyword、sortBy，都进依赖
  const filtered = useMemo(() => {
    let result = items;
    if (keyword) {
      result = result.filter(i => i.name.includes(keyword));
    }
    if (sortBy) {
      result = [...result].sort((a, b) => a[sortBy] - b[sortBy]);
    }
    return result;
  }, [items, keyword, sortBy]);
}
\`\`\`

**坑**：依赖漏写会用旧值：

\`\`\`tsx
// ❌ 漏 sortBy，sortBy 变了 filtered 不变
const filtered = useMemo(() => {
  return [...items].sort((a, b) => a[sortBy] - b[sortBy]);
}, [items]);  // 漏了 sortBy
\`\`\`

## 39.7 useMemo 不能保证性能

**React 文档明确**：\`useMemo\` 是**性能优化手段**，不是语义保证。

\`\`\`tsx
// React 可能"忘记" memoized 值，下次重新计算
const value = useMemo(() => compute(a, b), [a, b]);
\`\`\`

React 在内存紧张时可能丢弃缓存，下次渲染重新计算。所以：

- **不能依赖 useMemo 保证引用稳定**做关键逻辑
- 只是"性能优化"，去掉也不影响正确性

如果需要语义保证（必须稳定引用），用 \`useRef\`：

\`\`\`tsx
function Component() {
  const ref = useRef();
  if (ref.current === null) {
    ref.current = { initial: true };  // 只初始化一次
  }
  const value = ref.current;  // 永远稳定
}
\`\`\`

## 39.8 实际项目中的 useMemo

1. **耗时计算**：复杂统计、排序、过滤
2. **传给 memo 子组件的对象/数组 props**：保持引用稳定
3. **作为 useEffect 依赖**：避免 effect 频繁执行
4. **不要滥用**：简单计算直接算

\`\`\`tsx
function Dashboard({ data, filter, sortKey }) {
  // ✅ 耗时计算
  const stats = useMemo(() => calculateStats(data), [data]);

  // ✅ 传给 memo 子组件的对象
  const tableProps = useMemo(() => ({
    data: stats,
    config: { filter, sortKey },
  }), [stats, filter, sortKey]);

  return (
    <div>
      <StatsChart data={stats} />
      <MemoizedTable {...tableProps} />
    </div>
  );
}
\`\`\`

## 39.9 小结

- useMemo 缓存计算结果，依赖变化时才重新计算
- 主要场景：耗时计算、缓存对象/数组引用、作为 effect 依赖
- 简单计算 / 原始值 / 依赖每次都变 → 不用 useMemo
- \`useCallback(fn, deps)\` 等价于 \`useMemo(() => fn, deps)\`
- useMemo 是性能优化，不是语义保证，React 可能丢弃缓存
- 需要稳定引用用 \`useRef\` 初始化模式
- 滥用 useMemo 反而更慢（依赖比较开销）
`,
    code: `// =============================================================
// 第 39 章 demo：useMemo 值缓存
// 模拟 useMemo 依赖对比、缓存对象引用、性能优化场景
// =============================================================

// ---- 模拟 useMemo 实现 ----
function useMemoImpl(compute, deps) {
  let prevDeps = null;
  let prevValue = null;
  let initialized = false;

  return function() {
    if (!initialized) {
      prevDeps = deps;
      prevValue = compute();
      initialized = true;
      console.log('  [useMemo] 首次计算');
      return prevValue;
    }
    const changed = deps.some((d, i) => d !== prevDeps[i]);
    if (changed) {
      prevDeps = deps;
      prevValue = compute();
      console.log('  [useMemo] 依赖变化，重新计算');
      return prevValue;
    }
    console.log('  [useMemo] 命中缓存，复用旧值');
    return prevValue;
  };
}

// 包装成函数：每次"渲染"调用一次
function makeUseMemo(compute, deps) {
  const memoFn = useMemoImpl(compute, deps);
  return () => memoFn();
}

// ---- 1. 基础：缓存计算结果 ----
console.log('=== 1. 缓存计算结果 ===');

let computeCount = 0;
const getStats = makeUseMemo(
  () => {
    computeCount++;
    console.log('  [compute] 执行复杂计算 #' + computeCount);
    return { sum: 1 + 2 + 3, avg: 2 };
  },
  [1, 2, 3]
);

console.log('渲染 1:');
getStats();
console.log('渲染 2（依赖没变）:');
getStats();
console.log('渲染 3（依赖没变）:');
getStats();
console.log('  总计算次数:', computeCount, '（应该为 1）');

// ---- 2. 依赖变化重新计算 ----
console.log('\\n=== 2. 依赖变化重新计算 ===');

let computeCount2 = 0;
let currentData = [1, 2, 3];
const getStats2 = makeUseMemo(
  () => {
    computeCount2++;
    console.log('  [compute] 重新计算');
    return currentData.reduce((s, n) => s + n, 0);
  },
  [currentData]
);

console.log('渲染 1（data=[1,2,3]）:');
getStats2();
console.log('渲染 2（data=[1,2,3] 没变）:');
getStats2();
console.log('渲染 3（data=[1,2,3,4]）:');
currentData = [1, 2, 3, 4];
const getStats3 = makeUseMemo(
  () => {
    computeCount2++;
    console.log('  [compute] 重新计算');
    return currentData.reduce((s, n) => s + n, 0);
  },
  [currentData]
);
getStats3();
console.log('  总计算次数:', computeCount2);

// ---- 3. 缓存对象引用 ----
console.log('\\n=== 3. 缓存对象引用 ===');

function withoutMemo() {
  // 模拟每次渲染都创建新对象
  return { color: 'red', padding: 10 };
}
const obj1 = withoutMemo();
const obj2 = withoutMemo();
console.log('  不用 useMemo：obj1 === obj2 ?', obj1 === obj2, '（每次都是新对象）');

const getStyle = makeUseMemo(() => ({ color: 'red', padding: 10 }), []);
const style1 = getStyle();
const style2 = getStyle();
console.log('  用 useMemo：style1 === style2 ?', style1 === style2, '（同一引用）');

// ---- 4. React.memo + useMemo 配合 ----
console.log('\\n=== 4. React.memo + useMemo 配合 ===');

function memo(Component) {
  let lastProps = null;
  let lastResult = null;
  let renderCount = 0;
  return function(props) {
    const same = lastProps && Object.keys(props).every(k =>
      typeof props[k] === 'object' && props[k] !== null
        ? props[k] === lastProps[k]
        : props[k] === lastProps[k]
    );
    if (same) {
      console.log('  [memo] 跳过渲染');
      return lastResult;
    }
    lastProps = props;
    renderCount++;
    console.log('  [memo] 重渲染 #' + renderCount);
    lastResult = Component(props);
    return lastResult;
  };
}

const UserCard = memo(function(props) {
  return { rendered: true, user: props.user.name };
});

// ❌ 不用 useMemo：每次都新对象 → memo 失效
console.log('  ❌ 不用 useMemo:');
for (let i = 0; i < 3; i++) {
  UserCard({ user: { name: 'A' }, style: { color: 'red' } });
}

// ✅ 用 useMemo：style 引用稳定 → memo 命中
console.log('  ✅ 用 useMemo:');
const getStableStyle = makeUseMemo(() => ({ color: 'red' }), []);
for (let i = 0; i < 3; i++) {
  UserCard({ user: { name: 'A' }, style: getStableStyle() });
}

// ---- 5. 不该用 useMemo 的场景 ----
console.log('\\n=== 5. 不该用 useMemo 的场景 ===');

// 场景 1：简单计算
console.log('  场景 1：简单加法');
console.log('    ❌ useMemo(() => a + b, [a, b])');
console.log('    ✅ const sum = a + b  （直接计算）');

// 场景 2：原始值
console.log('  场景 2：原始值');
console.log('    ❌ useMemo(() => count > 0, [count])');
console.log('    ✅ const visible = count > 0');

// 场景 3：依赖每次都变
console.log('  场景 3：依赖每次都变');
console.log('    ❌ useMemo(() => compute(value), [value])  // value 每次都变');

// ---- 6. 性能对比：耗时计算 ----
console.log('\\n=== 6. 性能对比：耗时计算 ===');

function expensiveCompute(n) {
  let result = 0;
  for (let i = 0; i < n; i++) {
    result += Math.sqrt(i);
  }
  return result;
}

// 不用 useMemo：每次渲染都重算
let noMemoTime = 0;
let noMemoRuns = 0;
for (let render = 0; render < 5; render++) {
  const start = Date.now();
  expensiveCompute(100000);
  noMemoTime += Date.now() - start;
  noMemoRuns++;
}
console.log('  不用 useMemo：5 次渲染都重算，总耗时 ' + noMemoTime + 'ms');

// 用 useMemo：只算一次
let memoTime = 0;
let memoRuns = 0;
const getExpensive = makeUseMemo(() => {
  const start = Date.now();
  const r = expensiveCompute(100000);
  memoTime = Date.now() - start;
  return r;
}, [1]);
for (let render = 0; render < 5; render++) {
  getExpensive();
  memoRuns++;
}
console.log('  用 useMemo：5 次渲染只算 1 次，总耗时 ' + memoTime + 'ms');
console.log('  → 性能提升约', (noMemoTime / Math.max(memoTime, 1)).toFixed(1) + ' 倍');

// ---- 7. useMemo 作为 useEffect 依赖 ----
console.log('\\n=== 7. useMemo 作为 effect 依赖 ===');

let effectRuns = 0;
function simulateSearch(query) {
  // ✅ useMemo 让 options 引用稳定
  const getOptions = makeUseMemo(() => ({
    url: '/api/search',
    params: { q: query },
  }), [query]);

  // useEffect 依赖 options
  const options = getOptions();
  // 模拟 useEffect 执行
  effectRuns++;
  console.log('  [useEffect] fetch options:', JSON.stringify(options));
}

simulateSearch('hello');  // 首次：计算 + effect 执行
simulateSearch('hello');  // 复用：options 引用稳定，effect 不执行
simulateSearch('world'); // query 变了：重新计算 + effect 执行
console.log('  effect 总执行次数:', effectRuns, '（应该 2 次：首次 + query 变）');

// ---- 8. useCallback 与 useMemo 等价性 ----
console.log('\\n=== 8. useCallback 与 useMemo 等价性 ===');

let cbCount = 0;
let memoCount = 0;

const useCallbackFn = makeUseMemo(() => {
  cbCount++;
  return () => console.log('  callback');
}, [1]);

const useMemoFn = makeUseMemo(() => {
  memoCount++;
  return () => console.log('  memo');
}, [1]);

useCallbackFn();
useCallbackFn();
useMemoFn();
useMemoFn();
console.log('  useCallback 等价 useMemo(() => fn, deps)');
console.log('  两者都只创建一次函数');

// ---- 关键要点总结 ----
console.log('\\n=== useMemo 核心要点 ===');
console.log('1. useMemo 缓存计算结果，依赖变化时才重新计算');
console.log('2. 适用：耗时计算、缓存对象/数组引用');
console.log('3. 不适用：简单计算、原始值、依赖每次都变');
console.log('4. useCallback(fn, deps) 等价 useMemo(() => fn, deps)');
console.log('5. useMemo 是性能优化，不是语义保证');
console.log('6. React 可能丢弃缓存，下次重新计算');
console.log('7. 需要稳定引用用 useRef 初始化模式');
`,
  },

  // =========================================================
  // 第四十章：useRef 引用
  // =========================================================
  {
    id: "tspro-use-ref",
    group: "六、React Hooks 全套",
    icon: "🗝️",
    title: "useRef 引用",
    content: `# 第四十章：useRef 引用

## 40.1 useRef 是什么

\`useRef\` 返回一个**可变对象** \`{ current: T }\`，特点：

1. **修改 .current 不触发重渲染**
2. **组件整个生命周期保持同一个对象**

\`\`\`tsx
const ref = useRef<T>(initialValue);
// ref = { current: initialValue }
// 读：ref.current
// 写：ref.current = newValue
\`\`\`

跟 \`useState\` 的核心区别：

| 特性 | useState | useRef |
| --- | --- | --- |
| 修改触发重渲染 | ✅ | ❌ |
| 适合存 UI 状态 | ✅ | ❌ |
| 适合存可变值 | ❌ | ✅ |
| 适合存 DOM 引用 | ❌ | ✅ |
| 渲染期间读取 | ❌（旧值） | ✅（最新值） |

\`\`\`tsx
function Counter() {
  const [count, setCount] = useState(0);
  const renderCount = useRef(0);

  // 每次渲染 +1，但不触发重渲染
  renderCount.current++;
  return <p>渲染了 {renderCount.current} 次</p>;
}
\`\`\`

## 40.2 ref.current 修改不触发重渲染

\`\`\`tsx
function Timer() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;  // 修改 .current 不触发重渲染
    }
  };

  return (
    <div>
      <p>{seconds}秒</p>
      <button onClick={stop}>停止</button>
    </div>
  );
}
\`\`\`

**关键**：\`intervalRef.current\` 存定时器 ID，更新它不会引起重渲染。

## 40.3 三大用途

### 用途 1：DOM 引用

最常见的用途——**访问真实 DOM 节点**。

\`\`\`tsx
function InputFocus() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 挂载后聚焦输入框
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} type="text" />;
}
\`\`\`

操作 DOM 场景：

- \`focus()\` / \`blur()\`
- 滚动控制 \`scrollIntoView()\`
- 获取尺寸 \`getBoundingClientRect()\`
- 调用 \`<video>\` / \`<canvas>\` 原生方法

\`\`\`tsx
function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const play = () => videoRef.current?.play();
  const pause = () => videoRef.current?.pause();

  return (
    <div>
      <video ref={videoRef} src="video.mp4" />
      <button onClick={play}>播放</button>
      <button onClick={pause}>暂停</button>
    </div>
  );
}
\`\`\`

### 用途 2：缓存可变值

存不参与渲染的数据。

\`\`\`tsx
function Component() {
  // 缓存上一次的值
  const prevCountRef = useRef(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    prevCountRef.current = count;  // 更新缓存
  });

  const prevCount = prevCountRef.current;
  return (
    <div>
      <p>当前：{count}，上次：{prevCount}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  );
}
\`\`\`

### 用途 3：定时器 ID / 订阅句柄

\`\`\`tsx
function Stopwatch() {
  const [time, setTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    if (timerRef.current) return;  // 防止重复启动
    timerRef.current = setInterval(() => setTime(t => t + 1), 100);
  };

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);  // 卸载时清理
    };
  }, []);

  return (
    <div>
      <p>{time}</p>
      <button onClick={start}>开始</button>
      <button onClick={stop}>停止</button>
    </div>
  );
}
\`\`\`

## 40.4 useRef 必填泛型

\`\`\`useRef\` 的类型签名有三种重载，**初始值不同语义不同**：

### 1. \`useRef<T>(initialValue: T)\` → \`RefObject<T>\`

\`\`\`tsx
const ref = useRef<number>(0);
// ref.current: number（可读可写）
ref.current = 5;
\`\`\`

### 2. \`useRef<T>(null)\` → \`RefObject<T | null>\`（DOM 引用常用）

\`\`\`tsx
const inputRef = useRef<HTMLInputElement>(null);
// ref.current: HTMLInputElement | null
// 挂载前是 null，挂载后是 DOM 节点
useEffect(() => {
  inputRef.current?.focus();  // 用可选链处理 null
}, []);
\`\`\`

### 3. \`useRef<T>()\` 不传初始值 → \`MutableRefObject<T | undefined>\`

\`\`\`tsx
const ref = useRef<number>();
// ref.current: number | undefined
// 不推荐，类型不安全
\`\`\`

**最佳实践**：

- DOM 引用：\`useRef<HTMLDivElement>(null)\`
- 缓存值：\`useRef<number>(0)\` / \`useRef<User | null>(null)\`
- **永远指定泛型**，避免 \`useRef<any>\`

\`\`\`tsx
// ✅ 正确
const inputRef = useRef<HTMLInputElement>(null);
const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
const prevRef = useRef<User | null>(null);

// ❌ 不要 any
const ref = useRef<any>(null);
\`\`\`

## 40.5 不要在 render 中读写 ref.current

\`\`\`tsx
function Bad() {
  const ref = useRef(0);

  // ❌ 在 render 中写 ref：违反纯函数原则
  ref.current++;

  // ❌ 在 render 中读 ref 做条件渲染
  if (ref.current > 5) return null;

  return <div>{ref.current}</div>;
}
\`\`\`

**为什么**：

1. React 严格模式会调用 render 两次，ref.current 会 +2
2. render 应该是纯函数，不能有副作用
3. ref 适合在**事件处理器 / useEffect** 中读写

\`\`\`tsx
function Good() {
  const ref = useRef(0);

  // ✅ 在事件处理器中写
  const handleClick = () => {
    ref.current++;
    console.log('点击次数:', ref.current);
  };

  // ✅ 在 useEffect 中写
  useEffect(() => {
    ref.current = Date.now();
  }, []);

  return <button onClick={handleClick}>click</button>;
}
\`\`\`

## 40.6 useRef 与 useState 的区别

\`\`\`tsx
// ❌ 用 useState 存定时器 ID：每次 setState 都触发重渲染
function Bad() {
  const [timerId, setTimerId] = useState<number | null>(null);
  const start = () => {
    const id = setInterval(...);
    setTimerId(id);  // 触发重渲染！
  };
}

// ✅ 用 useRef 存定时器 ID：不触发重渲染
function Good() {
  const timerRef = useRef<number | null>(null);
  const start = () => {
    timerRef.current = setInterval(...);  // 不触发重渲染
  };
}
\`\`\`

**判断标准**：

- 数据**参与渲染**（显示在 UI 上）→ \`useState\`
- 数据**不参与渲染**（DOM 引用、定时器 ID、缓存）→ \`useRef\`

## 40.7 useRef 实现 usePrevious

经典自定义 Hook：获取上一次的值。

\`\`\`tsx
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;  // 每次 effect 后更新
  });

  return ref.current;  // 返回旧值（effect 还没执行）
}

function Counter() {
  const [count, setCount] = useState(0);
  const prev = usePrevious(count);
  return (
    <div>
      <p>当前：{count}，上次：{prev}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  );
}
\`\`\`

**执行顺序**：

1. 渲染：\`ref.current\` 还是上次 effect 设的值
2. 返回 \`ref.current\` → 显示旧值
3. useEffect 执行：\`ref.current = value\` → 更新为本次值
4. 下次渲染时返回新的"旧值"

## 40.8 实际项目中的 useRef

1. **DOM 引用**：聚焦、滚动、播放控制
2. **缓存值**：定时器 ID、订阅句柄、上一次的值
3. **跨渲染存可变数据**：避免闭包陷阱
4. **不要存 UI 状态**：用 useState
5. **不要在 render 中读写**：违反纯函数

\`\`\`tsx
function ChatInput({ onSend }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const draftRef = useRef('');  // 缓存草稿（不需要触发渲染）

  const handleSend = () => {
    onSend(draftRef.current);
    draftRef.current = '';
    inputRef.current?.focus();
  };

  return (
    <div>
      <input
        ref={inputRef}
        value={draftRef.current}
        onChange={e => { draftRef.current = e.target.value; }}
      />
      <button onClick={handleSend}>发送</button>
    </div>
  );
}
\`\`\`

## 40.9 小结

- useRef 返回 \`{ current: T }\`，修改不触发重渲染
- 三大用途：DOM 引用 / 缓存可变值 / 定时器 ID
- useRef 必填泛型：\`useRef<HTMLInputElement>(null)\`
- 不要在 render 中读写 ref.current（违反纯函数）
- 数据参与渲染用 useState，不参与用 useRef
- 经典应用：实现 usePrevious 自定义 Hook
`,
    code: `// =============================================================
// 第 40 章 demo：useRef 引用
// 模拟 useRef 的 3 大用途：DOM 引用、缓存值、定时器 ID
// =============================================================

// ---- 模拟 useRef 实现 ----
function useRefImpl(initialValue) {
  // 真实 React 用 fiber 节点保存，整个生命周期不变
  const ref = { current: initialValue };
  return ref;
}

// ---- 1. useRef 基础 ----
console.log('=== 1. useRef 基础 ===');

const myRef = useRefImpl(0);
console.log('  初始 ref:', JSON.stringify(myRef));

// 修改 .current 不触发重渲染
myRef.current = 5;
console.log('  修改后 ref:', JSON.stringify(myRef));
console.log('  → .current 修改不触发重渲染');

// 同一引用，整个生命周期不变
const ref1 = myRef;
myRef.current = 10;
console.log('  ref1 === myRef ?', ref1 === myRef, '（同一对象）');
console.log('  ref1.current:', ref1.current, '（自动同步）');

// ---- 2. 用途 1：DOM 引用 ----
console.log('\\n=== 2. 用途 1：DOM 引用 ===');

// 模拟 DOM 节点
function createDOMNode(tag) {
  return {
    tagName: tag,
    focus: () => console.log('  [DOM] focus()'),
    blur: () => console.log('  [DOM] blur()'),
    scrollIntoView: () => console.log('  [DOM] scrollIntoView()'),
    value: '',
  };
}

function InputFocus() {
  // useRef<HTMLInputElement>(null)
  const inputRef = useRefImpl(null);

  // 模拟 useEffect(() => { inputRef.current?.focus(); }, [])
  setTimeout(() => {
    // 模拟 React 把 DOM 节点赋值给 ref.current
    inputRef.current = createDOMNode('INPUT');
    console.log('  挂载后，inputRef.current:', inputRef.current.tagName);
    inputRef.current.focus();  // 调用 DOM 方法
  }, 0);

  return { type: 'input', ref: inputRef };
}

const inputComp = InputFocus();
console.log('  挂载前，inputRef.current:', inputComp.ref.current, '（null）');

// ---- 3. 用途 2：缓存可变值 ----
console.log('\\n=== 3. 用途 2：缓存可变值 ===');

// 实现 usePrevious：获取上一次的值
function usePreviousImpl(value) {
  const ref = useRefImpl(undefined);

  // 模拟 useEffect：每次渲染后执行
  setTimeout(() => {
    ref.current = value;
    console.log('  [useEffect] ref.current =', JSON.stringify(value), '（保存当前值）');
  }, 0);

  return ref.current;  // 返回旧值
}

console.log('  --- usePrevious 演示 ---');
let prev1 = usePreviousImpl(1);
console.log('  第 1 次渲染，prev =', prev1, '（undefined，还没执行 effect）');

let prev2 = usePreviousImpl(2);
console.log('  第 2 次渲染，prev =', prev2, '（上次的 1，effect 刚执行）');

let prev3 = usePreviousImpl(3);
console.log('  第 3 次渲染，prev =', prev3, '（上次的 2）');

// ---- 4. 用途 3：定时器 ID ----
console.log('\\n=== 4. 用途 3：定时器 ID ===');

function Stopwatch() {
  const timerRef = useRefImpl(null);
  let tickCount = 0;

  const start = () => {
    if (timerRef.current !== null) {
      console.log('  已经在运行，不重复启动');
      return;
    }
    // 模拟 setInterval，返回 ID
    timerRef.current = setIntervalMock(() => {
      tickCount++;
      console.log('  tick #' + tickCount);
    }, 100);
    console.log('  启动定时器，ID=' + timerRef.current);
  };

  const stop = () => {
    if (timerRef.current !== null) {
      clearIntervalMock(timerRef.current);
      console.log('  停止定时器，ID=' + timerRef.current);
      timerRef.current = null;
    }
  };

  return { start, stop, getTick: () => tickCount };
}

// 模拟 setInterval / clearInterval
let nextTimerId = 1;
const activeTimers = new Map();
function setIntervalMock(fn, delay) {
  const id = nextTimerId++;
  activeTimers.set(id, { fn, delay, calls: 0 });
  return id;
}
function clearIntervalMock(id) {
  activeTimers.delete(id);
}

const sw = Stopwatch();
console.log('  启动:');
sw.start();
console.log('  再启动一次（应该被阻止）:');
sw.start();
console.log('  停止:');
sw.stop();
console.log('  → timerRef.current 存了 ID，不触发重渲染');

// ---- 5. useRef 与 useState 对比 ----
console.log('\\n=== 5. useRef 与 useState 对比 ===');

// useState 模拟
let useStateRenderCount = 0;
function useStateImpl(initial) {
  let state = initial;
  const setState = (newVal) => {
    state = typeof newVal === 'function' ? newVal(state) : newVal;
    useStateRenderCount++;  // 触发重渲染
    console.log('  [useState] setState 触发重渲染 #' + useStateRenderCount);
  };
  return [state, setState];
}

// useRef 模拟
let useRefRenderCount = 0;
function useRefImplTracked(initial) {
  const ref = { current: initial };
  return ref;
}

console.log('  --- useState 场景 ---');
const [count, setCount] = useStateImpl(0);
setCount(1);
setCount(2);
setCount(3);
console.log('  useState 触发重渲染次数:', useStateRenderCount);

console.log('  --- useRef 场景 ---');
const counterRef = useRefImplTracked(0);
counterRef.current = 1;
counterRef.current = 2;
counterRef.current = 3;
console.log('  useRef 触发重渲染次数:', useRefRenderCount, '（0 次）');
console.log('  → 数据不参与渲染用 useRef，参与渲染用 useState');

// ---- 6. 必填泛型演示 ----
console.log('\\n=== 6. useRef 必填泛型 ===');

// 模拟 TS 泛型
console.log('  ✅ DOM 引用：useRef<HTMLInputElement>(null)');
const domRef = useRefImpl(null);
console.log('    ref.current 类型：HTMLInputElement | null');
console.log('    挂载前 null，挂载后 DOM 节点');

console.log('  ✅ 缓存值：useRef<number>(0)');
const numRef = useRefImpl(0);
console.log('    ref.current 类型：number');
console.log('    初始值 0:', numRef.current);

console.log('  ✅ 定时器：useRef<ReturnType<typeof setInterval> | null>(null)');
const tRef = useRefImpl(null);
console.log('    ref.current 类型：number | null');

console.log('  ❌ 不推荐：useRef<any>(null)');
console.log('    → 类型不安全，丢失 TS 检查');

// ---- 7. 不要在 render 中读写 ref.current ----
console.log('\\n=== 7. 不要在 render 中读写 ref.current ===');

let renderCount = 0;
function BadComponent() {
  const ref = useRefImpl(0);

  // ❌ 模拟在 render 中写 ref
  ref.current++;
  console.log('  [render] ref.current =', ref.current);

  // ❌ 模拟在 render 中读 ref 做条件
  if (ref.current > 2) {
    console.log('  [render] 基于 ref 条件返回 null（不可预测）');
  }

  return { rendered: true };
}

console.log('  严格模式下 render 会调用两次:');
console.log('  第 1 次渲染:');
BadComponent();
console.log('  第 2 次渲染（严格模式重复调用）:');
BadComponent();
console.log('  → ref.current 累加了两次，行为不可预测');

// 正确做法
function GoodComponent() {
  const ref = useRefImpl(0);

  const handleClick = () => {
    ref.current++;
    console.log('  [event] 点击次数:', ref.current);
  };

  setTimeout(() => {
    ref.current = Date.now();
    console.log('  [useEffect] 设置 ref');
  }, 0);

  return { onClick: handleClick };
}

console.log('\\n  正确做法（事件中读写）:');
const good = GoodComponent();
good.onClick();
good.onClick();

// ---- 关键要点总结 ----
console.log('\\n=== useRef 核心要点 ===');
console.log('1. useRef 返回 { current: T }，修改不触发重渲染');
console.log('2. 三大用途：DOM 引用 / 缓存值 / 定时器 ID');
console.log('3. useRef 必填泛型：useRef<HTMLInputElement>(null)');
console.log('4. 不要在 render 中读写 ref.current');
console.log('5. 数据参与渲染用 useState，不参与用 useRef');
console.log('6. 经典应用：usePrevious 自定义 Hook');
console.log('7. 同一引用，整个生命周期保持不变');
`,
  },

  // =========================================================
  // 第四十一章：useImperativeHandle + forwardRef
  // =========================================================
  {
    id: "tspro-use-imperative-handle",
    group: "六、React Hooks 全套",
    icon: "📤",
    title: "useImperativeHandle + forwardRef",
    content: `# 第四十一章：useImperativeHandle + forwardRef

## 41.1 为什么需要 forwardRef

React 默认**只允许父组件通过 props 控制子组件**，不能直接操作子组件的 DOM。但有些场景父组件需要拿到子组件的 DOM：

- 父组件让子组件的 input 聚焦
- 父组件触发子组件的方法（重置表单、滚动）
- 通用组件库暴露 imperative API

\`\`\`tsx
// ❌ 直接传 ref 不行（函数组件默认不支持 ref）
function MyInput(props) {
  return <input {...props} />;
}

function Parent() {
  const inputRef = useRef<HTMLInputElement>(null);
  return <MyInput ref={inputRef} />;  // ref 不会传给 input！
}
\`\`\`

**原因**：函数组件没有实例，\`ref\` 默认拿到的是 \`undefined\`。\`forwardRef\` 让函数组件能"转发" ref 给内部 DOM。

## 41.2 forwardRef 转发 ref

\`\`\`tsx
import { forwardRef } from 'react';

// 用 forwardRef 包裹函数组件，第二个参数是 ref
const MyInput = forwardRef<HTMLInputElement, Props>(function MyInput(props, ref) {
  return <input ref={ref} {...props} />;  // 把 ref 转发给 input
});

function Parent() {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();  // 现在能拿到内部的 input
  }, []);
  return <MyInput ref={inputRef} />;
}
\`\`\`

\`forwardRef\` 的作用：**让父组件传的 ref 能透传到子组件内部的 DOM**。

### forwardRef 的类型签名

\`\`\`tsx
forwardRef<T, P>(render: (props: P, ref: Ref<T>) => ReactElement)
// T：ref.current 的类型
// P：props 的类型
\`\`\`

\`\`\`tsx
interface Props {
  value: string;
  onChange: (v: string) => void;
}

const MyInput = forwardRef<HTMLInputElement, Props>(function MyInput(props, ref) {
  return <input ref={ref} value={props.value} onChange={e => props.onChange(e.target.value)} />;
});
\`\`\`

## 41.3 useImperativeHandle 暴露子组件方法

只暴露 DOM 不够，更常见的场景是**暴露自定义方法**（focus、clear、reset、scrollTo）。

\`useImperativeHandle\` 让子组件**自定义暴露给父组件的实例值**，而不是直接给 DOM。

\`\`\`tsx
import { forwardRef, useImperativeHandle, useRef } from 'react';

// 1. 定义暴露的接口
export interface InputHandle {
  focus: () => void;
  clear: () => void;
  setValue: (v: string) => void;
  getValue: () => string;
}

// 2. forwardRef + useImperativeHandle
const FancyInput = forwardRef<InputHandle, Props>(function FancyInput(props, ref) {
  const inputRef = useRef<HTMLInputElement>(null);

  // 暴露给父组件的方法（而不是整个 DOM）
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    setValue: (v: string) => {
      if (inputRef.current) inputRef.current.value = v;
    },
    getValue: () => inputRef.current?.value ?? '',
  }), []);  // 依赖数组

  return <input ref={inputRef} {...props} />;
});

// 3. 父组件使用
function Parent() {
  const inputRef = useRef<InputHandle>(null);

  const handleFocus = () => inputRef.current?.focus();
  const handleClear = () => inputRef.current?.clear();

  return (
    <div>
      <FancyInput ref={inputRef} />
      <button onClick={handleFocus}>聚焦</button>
      <button onClick={handleClear}>清空</button>
    </div>
  );
}
\`\`\`

**好处**：

1. **封装性**：父组件只能用你暴露的方法，不能乱操作 DOM
2. **类型安全**：接口定义清楚，TS 自动检查
3. **解耦**：内部实现可以换（用 div 代替 input），父组件代码不变

## 41.4 ref 类型 React.Ref<T>

forwardRef 的 ref 参数类型是 \`React.Ref<T>\`，可能是：

- \`RefObject<T>\`（useRef 返回的对象）
- \`RefCallback<T>\`（回调函数 ref）
- \`null\`

\`\`\`tsx
// 类型 Ref<T> = RefObject<T> | RefCallback<T> | null

// 1. 对象 ref
const ref1 = useRef<HTMLInputElement>(null);
<MyInput ref={ref1} />;

// 2. 回调 ref
<MyInput ref={(node) => {
  console.log('DOM 节点', node);
}} />;

// 3. 不传 ref
<MyInput />;
\`\`\`

\`useImperativeHandle\` 会自动处理这三种情况，不用关心。

## 41.5 useImperativeHandle 的依赖数组

\`useImperativeHandle(ref, createHandle, deps?)\`：

- \`ref\`：父组件传的 ref
- \`createHandle\`：返回要暴露的对象
- \`deps\`：依赖数组，依赖变化时重新创建 handle

\`\`\`tsx
const FancyInput = forwardRef<InputHandle, Props>(function FancyInput(props, ref) {
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ 无依赖：handle 引用永远不变
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }), []);

  // ✅ 有依赖：props.defaultValue 变时重新创建
  useImperativeHandle(ref, () => ({
    reset: () => {
      if (inputRef.current) inputRef.current.value = props.defaultValue;
    },
  }), [props.defaultValue]);
});
\`\`\`

**建议**：默认用 \`[]\` 让 handle 引用稳定，依赖外部变量时再加依赖。

## 41.6 何时用 useImperativeHandle

### 场景 1：聚焦 / 失焦

\`\`\`tsx
const AutoFocusInput = forwardRef<{ focus: () => void }>(function AutoFocusInput(props, ref) {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }), []);
  return <input ref={inputRef} />;
});

function Form() {
  const ref = useRef<{ focus: () => void }>(null);
  return (
    <div>
      <AutoFocusInput ref={ref} />
      <button onClick={() => ref.current?.focus()}>聚焦输入框</button>
    </div>
  );
}
\`\`\`

### 场景 2：表单重置

\`\`\`tsx
interface FormHandle {
  reset: () => void;
  submit: () => void;
  validate: () => boolean;
}

const MyForm = forwardRef<FormHandle, Props>(function MyForm(props, ref) {
  const formRef = useRef<HTMLFormElement>(null);

  useImperativeHandle(ref, () => ({
    reset: () => formRef.current?.reset(),
    submit: () => formRef.current?.requestSubmit(),
    validate: () => formRef.current?.reportValidity() ?? false,
  }), []);

  return <form ref={formRef}>...</form>;
});

function Parent() {
  const formRef = useRef<FormHandle>(null);
  return (
    <div>
      <MyForm ref={formRef} />
      <button onClick={() => formRef.current?.reset()}>重置</button>
      <button onClick={() => formRef.current?.submit()}>提交</button>
    </div>
  );
}
\`\`\`

### 场景 3：滚动控制

\`\`\`tsx
interface ScrollHandle {
  scrollToTop: () => void;
  scrollToBottom: () => void;
  scrollTo: (y: number) => void;
}

const ScrollableList = forwardRef<ScrollHandle, Props>(function ScrollableList(props, ref) {
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    scrollToTop: () => {
      if (containerRef.current) containerRef.current.scrollTop = 0;
    },
    scrollToBottom: () => {
      if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
    },
    scrollTo: (y: number) => {
      if (containerRef.current) containerRef.current.scrollTop = y;
    },
  }), []);

  return <div ref={containerRef} style={{ overflow: 'auto' }}>{props.children}</div>;
});
\`\`\`

## 41.7 不要滥用 useImperativeHandle

\`useImperativeHandle\` 是"逃生舱"，**优先用 props 控制**：

\`\`\`tsx
// ❌ 不推荐：用 ref 触发子组件行为
const Child = forwardRef<ChildHandle>(function Child(props, ref) {
  const [open, setOpen] = useState(false);
  useImperativeHandle(ref, () => ({
    show: () => setOpen(true),
    hide: () => setOpen(false),
  }));
  return <Modal open={open} />;
});

function Parent() {
  const ref = useRef<ChildHandle>(null);
  return (
    <div>
      <Child ref={ref} />
      <button onClick={() => ref.current?.show()}>显示</button>
    </div>
  );
}

// ✅ 推荐：用 props 控制
function Child({ open, onToggle }) {
  return <Modal open={open} onToggle={onToggle} />;
}

function Parent() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Child open={open} onToggle={setOpen} />
      <button onClick={() => setOpen(true)}>显示</button>
    </div>
  );
}
\`\`\`

**何时用 useImperativeHandle**：

- 父组件需要触发子组件的 DOM 操作（focus、scroll）
- 表单组件暴露 reset/submit/validate
- 通用组件库设计 imperative API

**何时不该用**：

- 能用 props 控制就用 props
- 状态管理用 useState/useReducer
- 数据传递用 Context

## 41.8 forwardRef + TypeScript 完整模板

\`\`\`tsx
import { forwardRef, useImperativeHandle, useRef } from 'react';

// 1. 暴露的接口
export interface MyComponentHandle {
  focus: () => void;
  clear: () => void;
}

// 2. props 类型
interface MyComponentProps {
  defaultValue?: string;
}

// 3. forwardRef 包裹
const MyComponent = forwardRef<MyComponentHandle, MyComponentProps>(
  function MyComponent(props, ref) {
    const inputRef = useRef<HTMLInputElement>(null);

    // 4. useImperativeHandle 暴露方法
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => {
        if (inputRef.current) inputRef.current.value = '';
      },
    }), []);

    return <input ref={inputRef} defaultValue={props.defaultValue} />;
  }
);

export default MyComponent;
\`\`\`

## 41.9 小结

- \`forwardRef\` 让函数组件能转发 ref 给内部 DOM
- \`useImperativeHandle\` 自定义暴露给父组件的方法，封装性更好
- 接口定义清楚（interface），TS 自动检查
- 默认依赖 \`[]\` 让 handle 引用稳定
- **不要滥用**：能用 props 就用 props
- 典型场景：focus、reset、scroll 控制
`,
    code: `// =============================================================
// 第 41 章 demo：useImperativeHandle + forwardRef
// 模拟 forwardRef 转发 ref、useImperativeHandle 暴露方法
// =============================================================

// ---- 模拟 forwardRef 实现 ----
function forwardRef(render) {
  // 返回一个组件函数，接收 props 和 ref
  const Component = function(props) {
    // 真实 React 把 ref 作为第二个参数传给 render
    return render(props, props.ref || null);
  };
  Component._isForwarded = true;  // 标记是 forwardRef 组件
  return Component;
}

// ---- 模拟 useImperativeHandle 实现 ----
function useImperativeHandle(ref, createHandle, deps) {
  // 真实 React 会缓存 handle 并按 deps 决定是否重新创建
  if (ref && typeof ref === 'object') {
    ref.current = createHandle();
    console.log('  [useImperativeHandle] 设置 ref.current');
  } else if (typeof ref === 'function') {
    ref(createHandle());
    console.log('  [useImperativeHandle] 调用 ref 回调');
  }
}

// ---- 1. 普通 ref 不会传给内部 DOM ----
console.log('=== 1. 普通 ref 不会传给内部 DOM ===');

function MyInputNoForward(props) {
  // ref 不在 props 里（React 自动剥离 ref）
  console.log('  [MyInputNoForward] props.ref:', props.ref, '（被 React 剥离）');
  return { type: 'input', props: { value: props.value } };
}

const ref1 = { current: null };
MyInputNoForward({ value: 'hello', ref: ref1 });
console.log('  ref1.current:', ref1.current, '（永远是 null，ref 没传进去）');

// ---- 2. forwardRef 转发 ref ----
console.log('\\n=== 2. forwardRef 转发 ref ===');

const MyInputForward = forwardRef(function MyInput(props, ref) {
  console.log('  [MyInput] 收到 ref，转发给 input');
  // 模拟 <input ref={ref} />
  return { type: 'input', ref: ref, props: { value: props.value } };
});

const ref2 = { current: null };
const inputEl = MyInputForward({ value: 'hello', ref: ref2 });
// 模拟 React 把 DOM 节点赋给 ref.current
ref2.current = { tagName: 'INPUT', value: 'hello', focus: () => console.log('  [DOM] focus') };
console.log('  ref2.current.tagName:', ref2.current.tagName, '（拿到内部 input）');
console.log('  → forwardRef 成功转发 ref');

// ---- 3. useImperativeHandle 暴露自定义方法 ----
console.log('\\n=== 3. useImperativeHandle 暴露自定义方法 ===');

// 定义暴露的接口
// interface InputHandle {
//   focus: () => void;
//   clear: () => void;
//   setValue: (v: string) => void;
//   getValue: () => string;
// }

const FancyInput = forwardRef(function FancyInput(props, ref) {
  // 内部 ref：引用真实 DOM
  const inputRef = { current: { tagName: 'INPUT', value: props.defaultValue || '', focus: () => console.log('  [DOM] focus()') } };

  // useImperativeHandle：暴露自定义方法（不是整个 DOM）
  useImperativeHandle(ref, () => ({
    focus: () => {
      console.log('  [handle.focus] 调用 DOM focus');
      inputRef.current.focus();
    },
    clear: () => {
      console.log('  [handle.clear] 清空 value');
      inputRef.current.value = '';
    },
    setValue: (v) => {
      console.log('  [handle.setValue] 设置 value =', v);
      inputRef.current.value = v;
    },
    getValue: () => {
      console.log('  [handle.getValue] 读取 value');
      return inputRef.current.value;
    },
  }), []);

  return { type: 'input', ref: inputRef };
});

// 父组件使用
const parentRef = { current: null };
FancyInput({ defaultValue: 'hello', ref: parentRef });

console.log('\\n  父组件调用暴露的方法:');
console.log('  --- handle.focus() ---');
parentRef.current.focus();
console.log('  --- handle.getValue() ---');
const v = parentRef.current.getValue();
console.log('    返回:', v);
console.log('  --- handle.setValue("world") ---');
parentRef.current.setValue('world');
console.log('  --- handle.clear() ---');
parentRef.current.clear();
const v2 = parentRef.current.getValue();
console.log('    清空后返回:', v2);

// ---- 4. 类型安全检查 ----
console.log('\\n=== 4. 类型安全检查 ===');

// 模拟 TS 检查
console.log('  ✅ parentRef.current?.focus()  → 通过');
console.log('  ✅ parentRef.current?.clear()  → 通过');
console.log('  ✅ parentRef.current?.setValue("x")  → 通过');
console.log('  ✅ parentRef.current?.getValue()  → 通过');
console.log('  ❌ parentRef.current?.unknown()  → TS 报错：unknown 不在接口里');
console.log('  → 父组件只能用暴露的方法，封装性好');

// ---- 5. 与直接暴露 DOM 对比 ----
console.log('\\n=== 5. 与直接暴露 DOM 对比 ===');

// ❌ 直接暴露 DOM：父组件能任意操作
const DirectExposeInput = forwardRef(function DirectExposeInput(props, ref) {
  const inputRef = { current: { tagName: 'INPUT', value: '', focus: () => {}, removeAttribute: () => {}, style: {} } };
  ref.current = inputRef.current;  // 直接把 DOM 给父组件
  return { type: 'input', ref: inputRef };
});

const directRef = { current: null };
DirectExposeInput({ ref: directRef });
console.log('  ❌ 直接暴露 DOM：父组件能调用');
console.log('    directRef.current.removeAttribute("value")  // 乱操作');
console.log('    directRef.current.style.display = "none"   // 任意改样式');
console.log('  → 没有封装性，父组件能乱搞');

// ✅ useImperativeHandle：只暴露需要的方法
console.log('\\n  ✅ useImperativeHandle：只暴露需要的方法');
console.log('    parentRef.current.focus()  // 只能用 focus');
console.log('    parentRef.current.clear()  // 和 clear');
console.log('  → 封装性好，内部实现可以换');

// ---- 6. 完整表单组件例子 ----
console.log('\\n=== 6. 完整表单组件例子 ===');

// interface FormHandle {
//   reset: () => void;
//   submit: () => void;
//   validate: () => boolean;
// }

const MyForm = forwardRef(function MyForm(props, ref) {
  const formState = { values: { name: '', email: '' }, errors: {} };

  useImperativeHandle(ref, () => ({
    reset: () => {
      console.log('  [Form.reset] 清空表单');
      formState.values = { name: '', email: '' };
      formState.errors = {};
    },
    submit: () => {
      console.log('  [Form.submit] 提交表单:', JSON.stringify(formState.values));
    },
    validate: () => {
      const ok = formState.values.name && formState.values.email;
      console.log('  [Form.validate] 验证结果:', !!ok);
      return !!ok;
    },
  }), []);

  return { type: 'form', state: formState };
});

const formRef = { current: null };
MyForm({ ref: formRef });
formRef.current.reset();
formRef.current.submit();
formRef.current.validate();

// ---- 7. 滚动控制例子 ----
console.log('\\n=== 7. 滚动控制例子 ===');

// interface ScrollHandle {
//   scrollToTop: () => void;
//   scrollToBottom: () => void;
//   scrollTo: (y: number) => void;
// }

const ScrollableList = forwardRef(function ScrollableList(props, ref) {
  const containerRef = { current: { scrollTop: 100, scrollHeight: 1000 } };

  useImperativeHandle(ref, () => ({
    scrollToTop: () => {
      containerRef.current.scrollTop = 0;
      console.log('  [scrollToTop] scrollTop =', containerRef.current.scrollTop);
    },
    scrollToBottom: () => {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      console.log('  [scrollToBottom] scrollTop =', containerRef.current.scrollTop);
    },
    scrollTo: (y) => {
      containerRef.current.scrollTop = y;
      console.log('  [scrollTo] scrollTop =', containerRef.current.scrollTop);
    },
  }), []);

  return { type: 'div', ref: containerRef };
});

const scrollRef = { current: null };
ScrollableList({ ref: scrollRef });
scrollRef.current.scrollToTop();
scrollRef.current.scrollTo(500);
scrollRef.current.scrollToBottom();

// ---- 关键要点总结 ----
console.log('\\n=== useImperativeHandle 核心要点 ===');
console.log('1. forwardRef 让函数组件能转发 ref 给内部 DOM');
console.log('2. useImperativeHandle 自定义暴露给父组件的方法');
console.log('3. 接口定义（interface）让 TS 自动检查');
console.log('4. 默认依赖 [] 让 handle 引用稳定');
console.log('5. 不要滥用：能用 props 就用 props');
console.log('6. 典型场景：focus、reset、scroll 控制');
console.log('7. 封装性好，内部实现可换，父组件代码不变');
`,
  },

  // =========================================================
  // 第四十二章：自定义 Hook 完全指南
  // =========================================================
  {
    id: "tspro-custom-hooks",
    group: "六、React Hooks 全套",
    icon: "🎣",
    title: "自定义 Hook 完全指南",
    content: `# 第四十二章：自定义 Hook 完全指南

## 42.1 自定义 Hook 的本质

自定义 Hook **不是新 API**，只是一个**约定**：函数名以 \`use\` 开头，内部调用其他 Hook。它的本质是**复用状态逻辑**，而不是复用 UI。

\`\`\`tsx
// 自定义 Hook：把"计数器"逻辑封装起来
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initialValue);
  return { count, increment, decrement, reset };
}

// 任何组件都能复用这个逻辑
function ComponentA() {
  const { count, increment } = useCounter(0);  // 独立的 state
  return <button onClick={increment}>{count}</button>;
}

function ComponentB() {
  const { count, increment } = useCounter(100);  // 另一份独立的 state
  return <button onClick={increment}>{count}</button>;
}
\`\`\`

**关键点**：

1. 每个组件调用 \`useCounter\` 都会**创建一份独立的 state**
2. Hook 不是单例，不像 class 实例的共享
3. 复用的是"逻辑"，不是"数据"

## 42.2 useXxx 命名规范

React 通过**函数名前缀** \`use\` 识别 Hook，依赖此约定做 Hook 规则检查（不能在条件/循环里调用）。

\`\`\`tsx
// ✅ 正确命名
function useToggle() { ... }
function useFetch(url) { ... }
function useLocalStorage(key) { ... }

// ❌ 不以 use 开头：React 不认为是 Hook，规则不生效
function toggle() { ... }        // 看不出来是 Hook
function fetchUser(url) { ... }  // 跟全局 fetch 容易混淆

// ❌ 不要用 use 开头命名非 Hook 函数
function useGetUser() {           // 内部没用 Hook，不是 Hook
  return fetch('/api/user');
}
\`\`\`

**规则**：

- 内部用了 \`useState/useEffect/...\` 等任何 React Hook → 必须以 \`use\` 开头
- 内部没用任何 Hook → 不要以 \`use\` 开头（避免误导）

## 42.3 自定义 Hook 的 TS 类型

明确标注参数和返回值类型，让使用者获得类型提示。

\`\`\`tsx
// 简单 Hook：返回单个值
function useToggle(initial: boolean = false): [boolean, () => void] {
  const [on, setOn] = useState(initial);
  const toggle = () => setOn(prev => !prev);
  return [on, toggle];
}

// 用法
const [isOpen, toggleOpen] = useToggle(false);  // 类型自动推断

// 复杂 Hook：返回对象
interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// 用法：泛型自动推断
const { data, loading } = useFetch<User[]>('/api/users');
// data 类型是 User[] | null
\`\`\`

## 42.4 返回值类型设计

### 1. 返回数组：固定顺序，适合 2 个值

\`\`\`tsx
function useState<T>(initial: T): [T, (v: T) => void] { ... }
const [count, setCount] = useState(0);
\`\`\`

**优点**：调用方可以随意命名（\`count\` / \`setCount\`）
**缺点**：超过 2 个值可读性差

### 2. 返回对象：扩展性好，适合多个值

\`\`\`tsx
function useCounter(): { count: number; increment: () => void; reset: () => void } { ... }
const { count, increment } = useCounter();
\`\`\`

**优点**：可以只取需要的字段，顺序无关
**缺点**：调用方不能自由重命名（除非用 \`:\` 别名）

### 3. 返回元组 + 对象：两全其美

\`\`\`tsx
function useInput(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  return {
    value,
    onChange: (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    reset: () => setValue(initialValue),
    // 也暴露数组形式
    bind: { value, onChange },
  };
}

// 用法
const nameInput = useInput('');
<input {...nameInput.bind} />
<button onClick={nameInput.reset}>重置</button>
\`\`\`

## 42.5 组合多个 Hook

自定义 Hook 内部可以调用其他自定义 Hook，组合复杂逻辑。

\`\`\`tsx
function useUser(userId: string) {
  const { data: user, loading } = useFetch<User>('/api/users/' + userId);
  const prevUser = usePrevious(user);  // 调用其他自定义 Hook
  return { user, prevUser, loading };
}

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// 复杂 Hook 组合多个简单 Hook
function useDashboard(userId: string) {
  const { user, loading: userLoading } = useUser(userId);
  const { data: posts, loading: postsLoading } = useFetch<Post[]>('/api/posts?user=' + userId);
  const debouncedQuery = useDebounce(userId, 300);

  return {
    user,
    posts,
    loading: userLoading || postsLoading,
  };
}
\`\`\`

**原则**：每个 Hook 只做一件事，复杂 Hook 由简单 Hook 组合而成。

## 42.6 5 个经典自定义 Hook

### 1. useToggle：布尔开关

\`\`\`tsx
function useToggle(initial: boolean = false): [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue(v => !v);
  const set = (v: boolean) => setValue(v);
  return [value, toggle, set];
}

// 用法
const [visible, toggleVisible, setVisible] = useToggle(false);
<button onClick={toggleVisible}>{visible ? '隐藏' : '显示'}</button>
\`\`\`

### 2. useDebounce：防抖

\`\`\`tsx
function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);  // cleanup
  }, [value, delay]);

  return debounced;
}

// 用法：搜索框防抖
function SearchBox() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  useEffect(() => {
    if (debouncedQuery) fetch('/api?q=' + debouncedQuery);
  }, [debouncedQuery]);
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
\`\`\`

### 3. useLocalStorage：持久化存储

\`\`\`tsx
function useLocalStorage<T>(key: string, initialValue: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('localStorage 写入失败', e);
    }
  }, [key, value]);

  return [value, setValue];
}

// 用法
const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
\`\`\`

### 4. useFetch：数据请求

\`\`\`tsx
interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useFetch<T>(url: string, options?: RequestInit): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url, options)
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(data => {
        if (!cancelled) {
          setData(data);
          setError(null);
        }
      })
      .catch(e => {
        if (!cancelled) setError(e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [url, refreshKey]);

  return { data, loading, error, refetch };
}

// 用法
function UserList() {
  const { data: users, loading, error, refetch } = useFetch<User[]>('/api/users');
  if (loading) return <Spinner />;
  if (error) return <button onClick={refetch}>重试</button>;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\`

### 5. usePrevious：上一次的值

\`\`\`tsx
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// 用法
function Counter() {
  const [count, setCount] = useState(0);
  const prev = usePrevious(count);
  return <p>当前 {count}，上次 {prev}</p>;
}
\`\`\`

## 42.7 自定义 Hook 注意事项

### 1. 不要破坏 Hook 规则

\`\`\`tsx
// ❌ 在条件里调用 Hook
function useBadHook(enabled: boolean) {
  if (enabled) {
    const [count, setCount] = useState(0);  // 错！条件调用
  }
}

// ✅ 把条件放进 Hook 内部
function useGoodHook(enabled: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (enabled) { ... }
  }, [enabled]);
}
\`\`\`

### 2. 不要在自定义 Hook 里管理 UI

\`\`\`tsx
// ❌ Hook 里直接渲染 UI（破坏纯逻辑原则）
function useModal() {
  return <Modal />;  // 不该这样
}

// ✅ Hook 返回状态，UI 由调用方决定
function useModal() {
  const [open, setOpen] = useState(false);
  return { open, openModal: () => setOpen(true), closeModal: () => setOpen(false) };
}
\`\`\`

### 3. 不要忘记 cleanup

\`\`\`tsx
// ❌ 没清理定时器
function useBadTimer() {
  useEffect(() => {
    setInterval(() => console.log('tick'), 1000);
  }, []);  // 卸载后定时器还在跑
}

// ✅ 返回 cleanup
function useGoodTimer() {
  useEffect(() => {
    const id = setInterval(() => console.log('tick'), 1000);
    return () => clearInterval(id);
  }, []);
}
\`\`\`

## 42.8 实际项目中的自定义 Hook

1. **逻辑复用优先**：相同状态逻辑提取成 Hook
2. **单一职责**：每个 Hook 只做一件事
3. **类型完整**：参数和返回值都标类型
4. **加注释**：说明 Hook 用途和用法
5. **测试覆盖**：纯逻辑 Hook 容易写单测

\`\`\`tsx
// hooks/useAuth.ts
import { useEffect, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;  // cleanup
  }, []);

  return { user, loading };
}
\`\`\`

## 42.9 小结

- 自定义 Hook 是"以 \`use\` 开头的函数"，复用状态逻辑
- 每个 Hook 调用都创建独立的 state，不是单例
- 必须以 \`use\` 开头，让 React 识别并启用 Hook 规则
- 类型标注完整：参数、返回值都明确
- 返回数组适合 2 个值，对象适合多个值
- 复杂 Hook 由简单 Hook 组合而成
- 5 个经典 Hook：useToggle、useDebounce、useLocalStorage、useFetch、usePrevious
- 不要在 Hook 里管理 UI，遵守 Hook 规则
`,
    code: `// =============================================================
// 第 42 章 demo：自定义 Hook 完全指南
// 实现 5 个经典自定义 Hook
// =============================================================

// ---- 模拟 React useState / useEffect / useRef ----
function makeStateContainer() {
  return {
    state: [],     // 用数组保存各 useState 的值
    effects: [],   // 保存各 useEffect 的依赖和 cleanup
    refs: [],      // 保存各 useRef 的对象
    stateIndex: 0,
    effectIndex: 0,
    refIndex: 0,
    reset() {
      this.stateIndex = 0;
      this.effectIndex = 0;
      this.refIndex = 0;
    },
  };
}

const container = makeStateContainer();

function useStateImpl(initial) {
  const idx = container.stateIndex++;
  if (container.state[idx] === undefined) {
    container.state[idx] = typeof initial === 'function' ? initial() : initial;
  }
  const setState = (newVal) => {
    container.state[idx] = typeof newVal === 'function' ? newVal(container.state[idx]) : newVal;
  };
  return [container.state[idx], setState];
}

function useEffectImpl(setup, deps) {
  const idx = container.effectIndex++;
  const prev = container.effects[idx];
  const shouldRun = !prev || !deps || deps.some((d, i) => d !== prev.deps[i]);
  if (shouldRun) {
    if (prev && prev.cleanup) prev.cleanup();
    const cleanup = setup();
    container.effects[idx] = { deps, cleanup };
  }
}

function useRefImpl(initial) {
  const idx = container.refIndex++;
  if (container.refs[idx] === undefined) {
    container.refs[idx] = { current: initial };
  }
  return container.refs[idx];
}

// 模拟 React.memo
function memo(Component) {
  let lastProps = null;
  let lastResult = null;
  return function(props) {
    const same = lastProps && Object.keys(props).every(k => props[k] === lastProps[k]);
    if (same) return lastResult;
    lastProps = props;
    lastResult = Component(props);
    return lastResult;
  };
}

// ---- 1. useToggle：布尔开关 ----
console.log('=== 1. useToggle ===');

function useToggle(initial) {
  const [value, setValue] = useStateImpl(initial);
  const toggle = () => setValue(v => !v);
  const set = (v) => setValue(v);
  return [value, toggle, set];
}

container.reset();
const [visible1, toggleVisible, setVisible] = useToggle(false);
console.log('  初始 visible:', visible1);
toggleVisible();
console.log('  toggle 后:', container.state[0]);
setVisible(true);
console.log('  set(true) 后:', container.state[0]);

// ---- 2. useDebounce：防抖 ----
console.log('\\n=== 2. useDebounce ===');

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useStateImpl(value);

  // 模拟 setTimeout（用同步方式演示）
  useEffectImpl(() => {
    console.log('  [useDebounce] 设置定时器，' + delay + 'ms 后更新');
    setDebounced(value);
    return () => console.log('  [useDebounce] 清除旧定时器');
  }, [value, delay]);

  return debounced;
}

container.reset();
console.log('  输入 "h":');
let d1 = useDebounce('h', 300);
console.log('  debounced:', d1);
console.log('  输入 "he":');
let d2 = useDebounce('he', 300);
console.log('  debounced:', d2, '（还是旧值 h，定时器没触发）');

// ---- 3. useLocalStorage：持久化存储 ----
console.log('\\n=== 3. useLocalStorage ===');

// 模拟 localStorage
const fakeStorage = {};
const localStorageMock = {
  getItem: (k) => fakeStorage[k] || null,
  setItem: (k, v) => { fakeStorage[k] = v; },
  removeItem: (k) => { delete fakeStorage[k]; },
};

function useLocalStorage(key, initialValue) {
  // 惰性初始化：只在挂载时读 localStorage
  const [value, setValue] = useStateImpl(() => {
    const stored = localStorageMock.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  // 同步写入 localStorage
  useEffectImpl(() => {
    console.log('  [useLocalStorage] 写入', key, '=', JSON.stringify(value));
    localStorageMock.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

container.reset();
console.log('  第一次使用 theme：');
const [theme1, setTheme] = useLocalStorage('theme', 'light');
console.log('  theme:', theme1);
setTheme('dark');
const [theme2, setTheme2] = useLocalStorage('theme', 'light');
console.log('  写入后 localStorage:', fakeStorage['theme']);

// ---- 4. useFetch：数据请求 ----
console.log('\\n=== 4. useFetch ===');

function useFetch(url) {
  const [data, setData] = useStateImpl(null);
  const [loading, setLoading] = useStateImpl(true);
  const [error, setError] = useStateImpl(null);
  const [refreshKey, setRefreshKey] = useStateImpl(0);

  const refetch = () => setRefreshKey(k => k + 1);

  // 模拟 fetch
  const fakeFetch = (u) => Promise.resolve({
    ok: true,
    json: () => Promise.resolve([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }])
  });

  useEffectImpl(() => {
    let cancelled = false;
    setLoading(true);
    console.log('  [useFetch] 请求', url);
    fakeFetch(url)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setData(data);
          setError(null);
          console.log('  [useFetch] 成功，data:', JSON.stringify(data));
        }
      })
      .catch(e => {
        if (!cancelled) setError(e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; console.log('  [useFetch] cleanup'); };
  }, [url, refreshKey]);

  return { data, loading, error, refetch };
}

container.reset();
const fetchResult = useFetch('/api/users');
console.log('  初始 loading:', fetchResult.loading);

// ---- 5. usePrevious：上一次的值 ----
console.log('\\n=== 5. usePrevious ===');

function usePrevious(value) {
  const ref = useRefImpl(undefined);

  useEffectImpl(() => {
    console.log('  [usePrevious] ref.current =', JSON.stringify(value));
    ref.current = value;
  });

  return ref.current;
}

container.reset();
console.log('  第 1 次渲染，count = 10:');
let prev1 = usePrevious(10);
console.log('    prev =', prev1, '（undefined，effect 还没执行）');

console.log('  第 2 次渲染，count = 20:');
let prev2 = usePrevious(20);
console.log('    prev =', prev2, '（上次的 10）');

console.log('  第 3 次渲染，count = 30:');
let prev3 = usePrevious(30);
console.log('    prev =', prev3, '（上次的 20）');

// ---- 6. 组合多个 Hook：useUser ----
console.log('\\n=== 6. 组合多个 Hook ===');

function useUser(userId) {
  // 组合 useFetch 和 usePrevious
  const { data: user, loading } = useFetch('/api/users/' + userId);
  const prevUser = usePrevious(user);
  return { user, prevUser, loading };
}

container.reset();
const { user, prevUser, loading } = useUser(1);
console.log('  user:', user);
console.log('  prevUser:', prevUser);
console.log('  loading:', loading);

// ---- 7. 自定义 Hook 复用：两个组件独立 state ----
console.log('\\n=== 7. Hook 复用独立性 ===');

function useCounter(initial) {
  const [count, setCount] = useStateImpl(initial);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initial);
  return { count, increment, decrement, reset };
}

// 组件 A
container.reset();
const counterA = useCounter(0);
console.log('  组件 A 初始:', counterA.count);
counterA.increment();
counterA.increment();
console.log('  组件 A +2 后:', container.state[0]);

// 组件 B（独立 state）
const counterB = useCounter(100);
console.log('  组件 B 初始:', counterB.count, '（不受 A 影响）');
counterB.increment();
console.log('  组件 B +1 后:', container.state[1], '（A 还是', container.state[0], '）');

// ---- 8. Hook 规则检查 ----
console.log('\\n=== 8. Hook 规则 ===');
console.log('  ✅ 函数名以 use 开头：useToggle / useFetch / useLocalStorage');
console.log('  ✅ 内部用了 React Hook → 必须 use 开头');
console.log('  ❌ 不能在条件 / 循环里调用 Hook');
console.log('  ❌ 不能在普通函数里调用 Hook（只能在组件或自定义 Hook 里）');
console.log('  ✅ ESLint react-hooks/rules-of-hooks 自动检查');

// ---- 9. 返回值设计对比 ----
console.log('\\n=== 9. 返回值设计 ===');

console.log('  数组返回（适合 2 个值）:');
console.log('    const [count, setCount] = useState(0)');
console.log('    → 调用方可自由命名');

console.log('  对象返回（适合多个值）:');
console.log('    const { count, increment, reset } = useCounter()');
console.log('    → 顺序无关，只取需要的');

console.log('  混合返回（两全其美）:');
console.log('    const input = useInput()');
console.log('    <input {...input.bind} />');
console.log('    input.reset()');

// ---- 关键要点总结 ----
console.log('\\n=== 自定义 Hook 核心要点 ===');
console.log('1. 自定义 Hook 是"以 use 开头的函数"，复用状态逻辑');
console.log('2. 每次调用创建独立 state，不是单例');
console.log('3. 必须 use 开头，让 React 识别并启用 Hook 规则');
console.log('4. 类型标注完整：参数、返回值');
console.log('5. 返回数组适合 2 个值，对象适合多个值');
console.log('6. 复杂 Hook 由简单 Hook 组合');
console.log('7. 5 个经典 Hook：useToggle/useDebounce/useLocalStorage/useFetch/usePrevious');
console.log('8. 不要在 Hook 里管理 UI，遵守 Hook 规则');
`,
  },
];