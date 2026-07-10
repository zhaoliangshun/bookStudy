// =============================================================
// React 源码构建教程（reactsrc）—— 第五批章节（第21-25章）
// -------------------------------------------------------------
// 主题：从零构建 React —— 高级 Hooks 与完整版 Mini React
// 面向：想彻底搞懂 React 内部原理、能手写简易 React 的前端开发者
// 第五批（21-25章）：
//   rs-use-reducer       ：useReducer：复杂状态管理
//   rs-use-memo-callback ：useMemo 与 useCallback：性能优化
//   rs-use-ref-context   ：useRef 与 useContext：引用与跨层通信
//   rs-synthetic-event   ：事件系统：合成事件与事件委托
//   rs-final-integration ：整合：完整版 Mini React 与总结
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（含表格、代码块、列表）
//   code    : 可运行、带详细中文注释的 Node.js 示例代码
//
// 代码运行环境约束：
//   - 在 Node.js 沙箱中执行（推荐 14+）
//   - 仅使用 Node.js 内置模块，不依赖第三方包
//   - 所有 demo 单文件可独立运行
//   - 用 console.log 输出结果，每步都有中文注释
// =============================================================

export const chapters = [
  // =========================================================
  // 第21章：useReducer：复杂状态管理
  // =========================================================
  {
    id: "rs-use-reducer",
    group: "第五部分 Hooks 系统",
    icon: "🎛️",
    title: "useReducer：复杂状态管理",
    content: `# useReducer：复杂状态管理

前面几章我们手写了 \`useState\`，知道了"状态更新"在 React 内部是怎么排队的。但实际项目里，你一定遇到过这样的场景：一个组件有七八个 \`setState\`，它们之间还有依赖关系——"先改 A 再根据 A 改 B，同时还要重置 C"。用 \`useState\` 写出来就是一堆 if-else，几个月后自己都看不懂。

这时候就该 \`useReducer\` 出场了。它不是什么新魔法，而是 \`useState\` 的"升级款"——把"状态怎么变"的决策逻辑，从散落在各处的 setState 里抽出来，集中到一个叫 **reducer** 的纯函数里。

## 一、生活类比：从"自己动手"到"快递中转站"

先打个比方理解两者的区别。

**useState = 你自己处理快递**

你网购了一堆东西，每个快递到了你自己拆、自己分类、自己放柜子。快递少的时候没问题，但如果你一天收 50 个快递，还要互相配套（比如"收到主板才能装显卡"），你就会手忙脚乱，拆错、放错是常事。

\`\`\`
收到快递A → 自己判断放哪 → 放柜子
收到快递B → 自己判断放哪 → 放柜子
收到快递C → 发现要和A配套 → 翻出A重新整理
\`\`\`

**useReducer = 快递中转站**

你把所有快递统一寄到一个"中转站"。中转站有一个**分拣员**（reducer），你只要告诉分拣员"这是个什么件"（action），分拣员会根据当前仓库的状态，自动算出东西该放哪。你不用关心细节，只管发指令。

\`\`\`
你 → 发指令"加5件"（action）→ 分拣员看仓库现状 → 算出新摆放 → 更新仓库
\`\`\`

核心区别：**"状态怎么变"的决策权，从调用方转移到了 reducer**。

## 二、useState vs useReducer：到底什么关系

很多人觉得这是两个完全不同的 Hook，其实源码里它们**共用同一套机制**。看这个对应关系：

| 对比项 | useState | useReducer |
|--------|----------|------------|
| 状态更新的"决策者" | 调用方（你直接给新值） | reducer 函数（集中决策） |
| 更新方式 | \`setState(newValue)\` | \`dispatch({ type: 'xxx' })\` |
| 适合场景 | 简单独立状态 | 多字段联动、状态机 |
| 内部实现 | 独立实现 | **复用 useState 的队列逻辑** |

更准确地说：\`useState\` 是 \`useReducer\` 的一个**特例**。如果把 useReducer 的 reducer 写成 \`(state, action) => action\`（即 action 就是新值），它就退化成了 useState：

\`\`\`js
// useState 等价于这样一个 useReducer
const [state, setState] = useReducer(
  (prevState, action) => (typeof action === 'function' ? action(prevState) : action),
  initialValue
);
\`\`\`

> 但在 React 源码里，实际是反过来的：\`useState\` 内部调用了一个基础 hook 槽位，\`useReducer\` 也调用同一个基础 hook。两者共用"更新队列"机制，只是计算新状态的方式不同。

## 三、reducer 和 action 是什么

**action（动作）**：一个描述"发生了什么"的普通对象。约定有一个 \`type\` 字段说明动作类型，其余字段携带数据：

\`\`\`js
{ type: 'add', payload: 5 }     // 加 5
{ type: 'toggle' }              // 切换
{ type: 'login', user: {...} }  // 登录
\`\`\`

action 只描述"意图"，不描述"结果"——它不说"把 count 变成 5"，而是说"我要加 5"。具体怎么变由 reducer 决定。这种"意图与结果分离"的设计，让状态变化可追踪、可回放。

**reducer（归约器）**：一个纯函数 \`(state, action) => newState\`。它接收旧状态和动作，返回新状态。三个关键约束：

1. **必须是纯函数**：同样的输入永远得到同样的输出，不能有副作用（不能发请求、不能改参数）
2. **必须返回新对象**：不能直接改 state（不可变更新），要用展开运算符或 immer
3. **必须有默认分支**：遇到不认识的 action 要原样返回 state，不能返回 undefined

\`\`\`js
// 一个标准的 reducer
function todoReducer(state, action) {
  switch (action.type) {
    case 'add':
      return [...state, { id: Date.now(), text: action.text, done: false }];
    case 'toggle':
      return state.map(t => t.id === action.id ? { ...t, done: !t.done } : t);
    case 'delete':
      return state.filter(t => t.id !== action.id);
    default:
      return state;  // 兜底：不认识就原样返回
  }
}
\`\`\`

> "reducer"这个名字来自 JavaScript 的 \`Array.prototype.reduce\`——\`reduce(callback, initial)\` 里 callback 也是 \`(acc, cur) => newAcc\`，形态完全一样。React 借用了这个概念：把一系列 action "归约"成最终状态。

## 四、dispatch 的实现原理

\`dispatch\` 是 useReducer 返回的第二个值。它看起来像是在"改状态"，实际上它**不改状态**，只做两件事：

1. 把 action 塞进当前 hook 的**更新队列**（和 useState 的 setState 一模一样）
2. 触发**调度**（scheduleUpdateOnFiber），告诉 React"有更新了，安排一次重新渲染"

\`\`\`
dispatch({ type: 'add', payload: 5 })
        │
        ├─→ action 塞进 hook.queue
        │
        └─→ scheduleRender()  →  React 在下个微任务/帧统一重渲染
                                    │
                                    └─→ 重渲染时遍历 queue，逐个调 reducer 算出新 state
\`\`\`

注意一个细节：\`dispatch\` 的引用是**稳定**的——同一个 hook 槽位，每次渲染返回的 dispatch 是同一个函数（React 用 \`useCallback\` 保证了这一点）。所以你可以放心地把 dispatch 传给子组件，不会引起子组件不必要的重渲染。

## 五、useReducer 内部如何复用 useState 逻辑

这是本章最核心的源码知识点。在 React 内部，\`useReducer\` 和 \`useState\` 共用同一个 hook 数据结构，区别只在于"消费队列时怎么算新状态"：

\`\`\`
hook 节点结构（简化）：
{
  memoizedState: 当前状态,
  queue: {
    pending: 更新队列（环形链表）,
    dispatch: 稳定的 dispatch 函数,
    lastRenderedReducer: 上次渲染用的 reducer,
    lastRenderedState: 上次渲染的状态（用于 bailout 优化）
  }
}
\`\`\`

- \`useState\` 的 reducer 是固定的：\`(state, action) => typeof action === 'function' ? action(state) : action\`
- \`useReducer\` 的 reducer 是用户传入的

消费队列的伪代码：

\`\`\`js
// 渲染阶段：处理 hook 的更新队列
function processHook(hook) {
  let newState = hook.memoizedState;
  while (hook.queue.pending) {
    const action = hook.queue.pending;
    newState = hook.reducer(newState, action);  // 关键：调 reducer
    hook.queue.pending = hook.queue.pending.next;
    if (action === hook.queue.pending) break;  // 环形链表走完一圈
  }
  hook.memoizedState = newState;
}
\`\`\`

看到了吗？\`useState\` 和 \`useReducer\` 走的是**同一段代码**，只是 \`hook.reducer\` 不同。

## 六、什么时候该用 useReducer

不是所有状态都该用 useReducer。判断标准：

| 场景 | 推荐 |
|------|------|
| 单个独立值（开关、输入框文本） | useState |
| 多个字段联动（表单、购物车） | useReducer |
| 状态变化有明确规则（状态机、游戏逻辑） | useReducer |
| 需要在多个子组件间共享更新逻辑 | useReducer + Context |
| 简单的布尔/数字切换 | useState |

**经验法则**：当你发现自己在写"如果 A 那么 setStateB，同时 setStateC"这种代码时，就该考虑 useReducer 了。

## 七、本章 demo 说明

下面的 demo 会手把手实现：

1. 一个简化版 hook 链表模型（数组模拟，真实 React 用单链表）
2. \`useState\` 的完整实现（含更新队列）
3. \`useReducer\` 的实现——**复用 useState**，只在外面套一层 reducer 调用
4. 一个计数器 reducer，演示 increment / decrement / add / reset 四种 action

跑完之后你会看到：每次 dispatch 一个 action，reducer 都会被调用，状态被正确更新。重点观察"dispatch 不直接改状态，而是把 action 排队，在重渲染时由 reducer 计算"这条主线。

> 本章的 hook 模型会在第22、23章继续使用，请务必跑通理解。`,
    code: `// ============================================
// 第21章 demo：实现 useReducer 并演示计数器状态管理
// 演示内容：
//   1. 简化版 Hook 链表模型（用数组模拟真实 React 的单链表）
//   2. useState 的完整实现（含更新队列消费）
//   3. useReducer 的实现 —— 复用 useState 逻辑
//   4. 计数器 reducer：increment / decrement / add / reset
// ============================================

console.log("=".repeat(60));
console.log("React 源码构建 — 第21章：useReducer 实现");
console.log("=".repeat(60));
console.log();

// ===== 1. Hook 链表模型 =====
// 真实 React 中：每个函数组件对应一个 fiber 节点
//   fiber.memoizedState → 指向 hook 链表的头节点
//   每个 hook 节点有 next 指针，串成单链表
//   组件按调用顺序依次"消费"链表上的 hook
// 这里用数组简化模拟，原理完全一致：靠"下标"保证同一次渲染内 hook 顺序稳定

let currentHooks = [];        // 当前组件的 hook 数组（模拟 fiber.memoizedState 链表）
let hookIndex = 0;            // 当前正在访问的 hook 下标（模拟链表的"游标"）
let currentComponent = null;  // 当前正在渲染的组件函数
let isMounting = true;        // 是否首次挂载（首次挂载要初始化 hook 槽位）

// ===== 2. 模拟 useState —— React 最基础的 Hook =====
// useState 做三件事：
//   a. 首次调用时初始化 hook 槽位（存初始值 + 空队列）
//   b. 渲染时消费队列里所有 pending 的更新，算出最新 state
//   c. 返回 [当前state, dispatch函数]
function useState(initialValue) {
  // 根据 hookIndex 取当前槽位
  // 首次挂载时该槽位为空，需要创建
  if (currentHooks[hookIndex] === undefined) {
    currentHooks[hookIndex] = {
      // memoizedState：当前记住的状态值
      // 支持惰性初始化——传入函数时调用它（适合从 localStorage 恢复等昂贵操作）
      memoizedState: typeof initialValue === 'function'
        ? initialValue()   // 惰性初始化：调用函数拿到初始值
        : initialValue,    // 普通初始化：直接用传入的值
      queue: [],           // 更新队列：存放待处理的 action（先进先出）
      isMounted: false,    // 标记这个 hook 是否已初始化
    };
    console.log(\`  [useState] 初始化第 \${hookIndex} 个 hook，初始值 = \${currentHooks[hookIndex].memoizedState}\`);
  }

  const hook = currentHooks[hookIndex];

  // 消费更新队列：把所有 pending 的 action 依次应用
  // 真实 React 在 render 阶段也会做这件事（processUpdateQueue）
  while (hook.queue.length > 0) {
    const action = hook.queue.shift();     // 取出最早入队的更新
    if (typeof action === 'function') {
      // 函数式更新：newState = action(oldState)
      // 适用于"基于上一个状态计算"的场景
      const prev = hook.memoizedState;
      hook.memoizedState = action(prev);
      console.log(\`  [useState] 消费函数式更新：\${prev} → \${hook.memoizedState}\`);
    } else {
      // 直接赋值：newState = action
      const prev = hook.memoizedState;
      hook.memoizedState = action;
      console.log(\`  [useState] 消费直接赋值：\${prev} → \${hook.memoizedState}\`);
    }
  }

  // 创建 dispatch 函数（即用户拿到的 setState）
  // 关键：闭包捕获了 hook 这个对象的引用
  //   ——所以无论在哪次渲染创建的 dispatch，都能找到同一个 hook 槽位
  //   ——这也是 dispatch 引用能保持稳定的根本原因
  const dispatch = (action) => {
    console.log(\`  [dispatch] 收到更新，action = \${typeof action === 'function' ? '函数' : JSON.stringify(action)}\`);
    hook.queue.push(action);   // 第一步：把更新塞进队列
    rerender();                // 第二步：触发重新渲染（真实 React 是 scheduleUpdateOnFiber）
  };

  // 返回 [当前状态, 更新函数] —— 元组形式
  const result = [hook.memoizedState, dispatch];
  hookIndex++;   // 关键！下标后移，保证下一个 Hook 取到不同的槽位
  return result;
}

// ===== 3. useReducer 实现 —— 复用 useState =====
// 核心思想：useReducer 和 useState 共用同一套 hook 机制
//   区别仅在于"如何从 action 计算新状态"：
//     useState   → newState = action（或 action(state)）
//     useReducer → newState = reducer(state, action)
function useReducer(reducer, initialArg, init) {
  // 参数说明：
  //   reducer   : 用户定义的纯函数 (state, action) => newState
  //   initialArg: 初始状态的"原料"
  //   init      : 可选的惰性初始化函数，init(initialArg) => state

  // 计算初始值
  const initialValue = init !== undefined
    ? init(initialArg)   // 有 init 函数：调用它（常用于从 localStorage 反序列化等昂贵操作）
    : initialArg;        // 没有 init：直接用 initialArg 作为初始状态

  // 复用 useState！拿到的 state 和 setState 共用同一个 hook 槽位
  // 这就是"useReducer 复用 useState 逻辑"的体现
  const [state, setState] = useState(initialValue);

  // dispatch：用户调用的"派发动作"函数
  // 它不直接 setState(newValue)，而是把 action 交给 reducer 计算
  function dispatch(action) {
    console.log(\`  [useReducer dispatch] 收到 action: \${JSON.stringify(action)}\`);
    // 用函数式更新：传入一个函数，函数内调用 reducer
    // reducer 根据"上一个状态 prevState"和"当前 action"算出新状态
    setState((prevState) => {
      const nextState = reducer(prevState, action);  // 调用用户定义的 reducer
      console.log(\`  [reducer] \${JSON.stringify(prevState)} + \${JSON.stringify(action)} → \${JSON.stringify(nextState)}\`);
      return nextState;
    });
  }

  // 返回 [当前状态, dispatch函数]
  return [state, dispatch];
}

// ===== 4. 模拟重新渲染 =====
// 重渲染时：重置 hookIndex 游标，重新执行组件函数
// 组件函数会按相同顺序调用 Hook，从而"对上"之前的槽位
function rerender() {
  hookIndex = 0;        // 重置游标：从头开始重新消费 hook 链表
  isMounting = false;
  console.log("\\n--- 触发重新渲染 ---");
  currentComponent();   // 重新执行组件函数（Hook 会按顺序重新读取槽位）
  console.log("--- 渲染完成 ---\\n");
}

// ===== 5. 定义一个计数器 reducer =====
// reducer 是纯函数：(state, action) => newState
// 约定 action 必须有 type 字段表示"做什么"
function counterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      // 加1：返回新对象（不可变更新，不能直接改 state.count）
      return { ...state, count: state.count + 1 };
    case 'decrement':
      // 减1
      return { ...state, count: state.count - 1 };
    case 'add':
      // 加指定值：action.payload 携带数据
      return { ...state, count: state.count + action.payload };
    case 'reset':
      // 重置为0
      return { ...state, count: 0 };
    default:
      // 兜底：不认识的 action 原样返回（重要！否则会返回 undefined 导致状态丢失）
      console.log(\`  [reducer] 未知 action type: \${action.type}，状态不变\`);
      return state;
  }
}

// ===== 6. 组件函数 =====
// 函数组件：每次渲染都会从头执行一遍这个函数
function Counter() {
  // 用 useReducer 管理计数器状态
  // 初始状态是 { count: 0 }
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  // 模拟组件的"渲染输出"
  // 真实 React 这里会返回 JSX，被 reconciler 转成 fiber
  console.log(\`  🖥️ 组件渲染：count = \${state.count}\`);

  // 把 dispatch 返回出去，模拟"事件回调可以触发更新"
  return dispatch;
}

// ===== 7. 运行演示 =====
currentComponent = Counter;  // 注册当前组件

console.log("【第1步：首次挂载渲染】");
let dispatch = Counter();   // 首次渲染，初始化 hook，拿到 dispatch
console.log();

console.log("【第2步：用户点击 + 按钮】");
dispatch({ type: 'increment' });
console.log("  → 期望：count 从 0 变成 1");

console.log("\\n【第3步：用户再点 + 按钮】");
dispatch({ type: 'increment' });
console.log("  → 期望：count 从 1 变成 2");

console.log("\\n【第4步：用户点击 - 按钮】");
dispatch({ type: 'decrement' });
console.log("  → 期望：count 从 2 变成 1");

console.log("\\n【第5步：用户点击 +5 按钮】");
dispatch({ type: 'add', payload: 5 });
console.log("  → 期望：count 从 1 变成 6");

console.log("\\n【第6步：用户点击重置按钮】");
dispatch({ type: 'reset' });
console.log("  → 期望：count 从 6 变成 0");

console.log("\\n【第7步：测试未知 action（状态应保持不变）】");
dispatch({ type: 'unknown_action' });
console.log("  → 期望：count 保持 0 不变");

console.log();
console.log("=".repeat(60));
console.log("总结：useReducer 复用了 useState 的更新队列机制");
console.log("  - dispatch 不直接改状态，只是把 action 排队");
console.log("  - 重渲染时 reducer(prevState, action) 计算新状态");
console.log("  - useState 是 useReducer 的特例（reducer 固定为直接赋值）");
console.log("=".repeat(60));`
  },

  // =========================================================
  // 第22章：useMemo 与 useCallback：性能优化
  // =========================================================
  {
    id: "rs-use-memo-callback",
    group: "第五部分 Hooks 系统",
    icon: "🚀",
    title: "useMemo 与 useCallback：性能优化",
    content: `# useMemo 与 useCallback：性能优化

React 的默认行为是：父组件重渲染时，所有子组件**无条件跟着重渲染**——哪怕传给子组件的 props 根本没变。这在小组件上无所谓，但当组件树很深、计算很重时，就会变成性能瓶颈。

\`useMemo\` 和 \`useCallback\` 就是为此而生：它们是 React 的"备忘录"，帮你跳过不必要的计算和重渲染。

## 一、为什么需要记忆化：避免重复劳动

**生活类比：备忘录**

假设你每天要算"这个月还剩多少预算"。计算过程很繁琐——要把所有账单加起来，减掉已花的，还要算上即将到期的房租。如果你每次打开钱包都重算一遍，太累了。聪明的做法是：**算一次，记在备忘录上**，只要账单没变，就直接看备忘录的数字。

\`\`\`
没有备忘录：每次问"预算多少" → 重新算一遍所有账单 → 累
有备忘录  ：第一次算完记下来 → 之后问"预算多少" → 账单没变？直接念备忘录的数
\`\`\`

React 里的两种"重复劳动"：

1. **不必要的计算**：一个函数里有个昂贵的计算（比如对一万条数据排序），但依赖的数据没变，却每次渲染都重算一遍
2. **不必要的重渲染**：父组件重渲染，传给子组件的函数/对象引用变了（即使内容没变），导致 memo 过的子组件也白渲染了

\`useMemo\` 解决第一种，\`useCallback\` 解决第二种。

## 二、React 默认的"渲染陷阱"

先看一个经典陷阱：

\`\`\`jsx
function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // 每次渲染都创建一个新函数（引用不同！）
  const handleClick = () => { console.log('click'); };

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      <ExpensiveChild onClick={handleClick} />  {/* count 变了，Child 也重渲染 */}
    </div>
  );
}
\`\`\`

问题在于：每次 \`Parent\` 渲染，\`handleClick\` 都是一个**全新的函数对象**。即使 \`ExpensiveChild\` 用了 \`React.memo\`，因为 \`onClick\` 引用变了，memo 判断"props 变了"，照样重渲染。

解决办法：用 \`useCallback\` 把 \`handleClick\` 的引用固定住。

## 三、useMemo 的实现：缓存计算结果

\`useMemo(fn, deps)\` 做的事：

1. 第一次调用：执行 \`fn()\`，把结果和 \`deps\` 都存进 hook 槽位
2. 后续调用：比较新 \`deps\` 和旧 \`deps\`（浅比较）
   - 相同 → 直接返回缓存的结果，**不执行 fn**
   - 不同 → 执行 \`fn()\`，更新缓存

\`\`\`
useMemo(computeExpensiveValue, [a, b])

第1次渲染：执行 computeExpensiveValue() → 存 result + deps=[a,b]
第2次渲染：新 deps 和旧 deps 浅比较
  ├─ 相同 → 直接返回缓存的 result（跳过计算！）
  └─ 不同 → 重新执行 computeExpensiveValue() → 更新缓存
\`\`\`

源码层面，useMemo 在 hook 链表上占一个槽位，结构大致是：

\`\`\`js
{
  memoizedState: [value, deps],   // 缓存的值和依赖
  // ...
}
\`\`\`

## 四、useCallback 的实现：缓存函数引用

\`useCallback(fn, deps)\` 和 \`useMemo\` 几乎一样，唯一的区别是：

- \`useMemo\` 缓存的是 **fn 的执行结果**
- \`useCallback\` 缓存的是 **fn 本身**（函数对象）

所以 \`useCallback\` 可以用 \`useMemo\` 实现：

\`\`\`js
// useCallback 等价于：
const memoizedFn = useMemo(() => fn, deps);
\`\`\`

注意这里 \`useMemo(() => fn, deps)\`——外层箭头函数返回 \`fn\` 本身，所以缓存的就是 \`fn\` 这个函数引用。

> 在 React 源码里，\`useCallback\` 和 \`useMemo\` 走的是**同一段 mount/update 逻辑**，只是 mount 时一个存函数、一个存函数的返回值。本质上它们是同一个 Hook 的两种用法。

## 五、依赖比较的浅比较逻辑

"浅比较"是性能优化的关键。它的规则是：

1. 两个数组的 **length** 必须相同
2. 逐个用 \`Object.is\` 比较对应位置的元素
3. 全部相等才算"依赖没变"

\`\`\`js
function shallowEqualDeps(prevDeps, nextDeps) {
  if (prevDeps === nextDeps) return true;                  // 同一引用直接相等
  if (!prevDeps || !nextDeps) return false;                // 有一方为空
  if (prevDeps.length !== nextDeps.length) return false;   // 长度不同
  for (let i = 0; i < prevDeps.length; i++) {
    if (!Object.is(prevDeps[i], nextDeps[i])) return false; // 逐个比较
  }
  return true;
}
\`\`\`

**为什么是浅比较而不是深比较？** 因为深比较要递归遍历对象，本身就有性能开销，可能比直接重算还慢。浅比较是 O(n) 的，n 是依赖个数（通常很少），几乎零成本。

**浅比较的陷阱**：

\`\`\`js
// ❌ 每次渲染都是新数组，引用不同，memo 失效
useMemo(() => items.filter(...), [items]);

// 但如果 items 每次也是新数组（父组件传的），useMemo 还是会重算
// 正确做法：确保依赖的引用稳定

// ❌ 依赖里放对象/数组
const config = { threshold: 0.5 };  // 每次渲染都是新对象
useMemo(() => compute(config), [config]);  // 每次都重算！
\`\`\`

## 六、什么时候该用，什么时候不该用

**常见误区**：把所有函数都用 useCallback 包起来。这其实**反而降低性能**——因为 useCallback 本身要存 hook、做依赖比较，这些开销可能比"创建一个新函数"还大。

| 场景 | 该不该用 |
|------|----------|
| 函数传给了 \`React.memo\` 包裹的子组件 | ✅ 该用 useCallback |
| 函数作为依赖传给了 useEffect / useMemo | ✅ 该用 useCallback |
| 计算开销大（排序、过滤大数据） | ✅ 该用 useMemo |
| 普通的内联函数、开销小的计算 | ❌ 不用，徒增开销 |
| 依赖数组里每次都是新对象 | ❌ 用了也白用，先解决引用稳定 |

**经验法则**：先写正确的代码，遇到性能问题再用 Profiler 定位，针对性优化。不要过早优化。

## 七、本章 demo 说明

下面的 demo 会实现：

1. 复用第21章的 hook 模型
2. \`useMemo\` 的实现：存 [value, deps]，浅比较依赖决定是否重算
3. \`useCallback\` 的实现：本质是 \`useMemo(() => fn, deps)\`
4. 演示"依赖没变时跳过昂贵计算"的效果——你会看到计算函数不会被调用
5. 演示"依赖变了时重新计算"的效果

重点观察输出里"昂贵的计算"被调用的次数：当依赖不变时，它不会被调用，这就是 useMemo 的价值。`,
    code: `// ============================================
// 第22章 demo：实现 useMemo 和 useCallback 并演示缓存效果
// 演示内容：
//   1. 复用第21章的 Hook 链表模型
//   2. useMemo 实现：缓存计算结果 + 依赖浅比较
//   3. useCallback 实现：本质是 useMemo(() => fn, deps)
//   4. 演示"依赖没变跳过计算"和"依赖变了重新计算"
// ============================================

console.log("=".repeat(60));
console.log("React 源码构建 — 第22章：useMemo 与 useCallback");
console.log("=".repeat(60));
console.log();

// ===== 1. Hook 链表模型（复用第21章） =====
let currentHooks = [];        // hook 数组（模拟链表）
let hookIndex = 0;            // hook 游标
let currentComponent = null;  // 当前组件函数

// ===== 2. useState 简化版（供 demo 使用） =====
function useState(initialValue) {
  if (currentHooks[hookIndex] === undefined) {
    currentHooks[hookIndex] = {
      memoizedState: typeof initialValue === 'function' ? initialValue() : initialValue,
      queue: [],
    };
  }
  const hook = currentHooks[hookIndex];
  while (hook.queue.length > 0) {
    const action = hook.queue.shift();
    hook.memoizedState = typeof action === 'function' ? action(hook.memoizedState) : action;
  }
  const setState = (action) => {
    hook.queue.push(action);
    rerender();
  };
  const result = [hook.memoizedState, setState];
  hookIndex++;
  return result;
}

// ===== 3. 依赖浅比较函数 =====
// 这是 useMemo / useCallback 判断"要不要重算"的核心
// 规则：长度相同 + 逐个 Object.is 比较
function areHookInputsEqual(nextDeps, prevDeps) {
  // 第一次没有 prevDeps，肯定不相等（需要计算）
  if (prevDeps === null || prevDeps === undefined) return false;

  // 长度不同，直接判定为"变了"（这是 React 的 warning 场景）
  if (nextDeps.length !== prevDeps.length) {
    console.log(\`  [浅比较] 依赖长度不同（\${prevDeps.length} vs \${nextDeps.length}），判定为"变了"\`);
    return false;
  }

  // 逐个用 Object.is 比较
  // Object.is 比 === 更严谨：Object.is(NaN, NaN) === true，Object.is(-0, +0) === false
  for (let i = 0; i < nextDeps.length; i++) {
    if (!Object.is(nextDeps[i], prevDeps[i])) {
      console.log(\`  [浅比较] 第 \${i} 个依赖变了：\${JSON.stringify(prevDeps[i])} → \${JSON.stringify(nextDeps[i])}\`);
      return false;  // 任何一个不同，整体判定为"变了"
    }
  }
  console.log(\`  [浅比较] 所有依赖都没变，命中缓存 ✅\`);
  return true;  // 全部相同，判定为"没变"
}

// ===== 4. useMemo 实现 =====
// 逻辑：
//   mount：执行 factory()，存 [value, deps]
//   update：浅比较新旧 deps
//     ├─ 相同 → 返回旧 value（跳过 factory 执行）
//     └─ 不同 → 执行 factory()，更新 [value, deps]
function useMemo(factory, deps) {
  // 取当前 hook 槽位
  if (currentHooks[hookIndex] === undefined) {
    currentHooks[hookIndex] = {
      memoizedState: null,   // 暂存 [value, deps]
    };
  }
  const hook = currentHooks[hookIndex];

  // 取出上次缓存的 [value, deps]
  const prevMemoized = hook.memoizedState;
  const prevValue = prevMemoized ? prevMemoized[0] : undefined;
  const prevDeps = prevMemoized ? prevMemoized[1] : null;

  // 判断依赖是否变化
  const depsChanged = !areHookInputsEqual(deps, prevDeps);

  let value;
  if (depsChanged) {
    // 依赖变了（或首次）：执行计算函数
    console.log(\`  [useMemo] 依赖变化，执行计算函数…\`);
    value = factory();  // 调用工厂函数拿到计算结果
    // 更新缓存：存 [新value, 新deps]
    hook.memoizedState = [value, deps];
  } else {
    // 依赖没变：直接用缓存的 value，跳过 factory 执行！
    console.log(\`  [useMemo] 依赖未变，复用缓存值：\${prevValue}\`);
    value = prevValue;
  }

  hookIndex++;
  return value;
}

// ===== 5. useCallback 实现 =====
// useCallback 和 useMemo 走同一套逻辑
// 唯一区别：useMemo 缓存 factory() 的返回值，useCallback 缓存 callback 函数本身
// 所以 useCallback(fn, deps) 等价于 useMemo(() => fn, deps)
function useCallback(callback, deps) {
  // 复用 useMemo：把 callback 包进一个返回它的工厂函数
  // useMemo 会缓存"工厂函数的返回值"，即缓存了 callback 本身
  return useMemo(() => callback, deps);
}

// ===== 6. 重新渲染 =====
function rerender() {
  hookIndex = 0;
  console.log("\\n--- 重新渲染 ---");
  currentComponent();
  console.log("--- 渲染完成 ---\\n");
}

// ===== 7. 模拟一个昂贵的计算 =====
// 用一个全局计数器记录被调用的次数，直观展示"有没有被跳过"
let expensiveCallCount = 0;
function expensiveCompute(a, b) {
  expensiveCallCount++;  // 每次调用计数+1
  console.log(\`    💰 执行昂贵计算（第 \${expensiveCallCount} 次）…\`);
  // 模拟耗时：真实场景可能是排序、过滤大数据、复杂运算
  let result = 0;
  for (let i = 0; i < 100000; i++) result += a * b + i;  // 假装很重
  return a + b;
}

// ===== 8. 组件函数 =====
function App() {
  const [count, setCount] = useState(0);       // 数字状态
  const [multiplier, setMultiplier] = useState(10);  // 乘数（作为 useMemo 的依赖）

  // useMemo 缓存昂贵计算结果，依赖 [count, multiplier]
  // 当 count 或 multiplier 变化时才会重算，否则复用缓存
  const computed = useMemo(() => {
    return expensiveCompute(count, multiplier);
  }, [count, multiplier]);

  // useCallback 缓存函数引用，依赖 [count]
  // 当 count 不变时，handleClick 引用稳定（不会触发子组件重渲染）
  const handleClick = useCallback(() => {
    console.log(\`    📞 handleClick 被调用，count=\${count}\`);
  }, [count]);

  console.log(\`  🖥️ 渲染：count=\${count}, multiplier=\${multiplier}, computed=\${computed}\`);
  console.log(\`     handleClick 引用稳定？\${handleClick === lastHandleClickRef}（与上次相同=\${handleClick === lastHandleClickRef}）\`);
  lastHandleClickRef = handleClick;

  return { setCount, setMultiplier, handleClick };
}

let lastHandleClickRef = null;  // 记录上次的 handleClick 引用

// ===== 9. 运行演示 =====
currentComponent = App;

console.log("【第1步：首次渲染】");
console.log("→ 应该执行昂贵计算（首次没有缓存）");
let { setCount, setMultiplier, handleClick } = App();
console.log();

console.log("=".repeat(50));
console.log("【第2步：改 count（依赖之一），应触发重算】");
setCount(1);
console.log("→ 期望：昂贵计算执行第 2 次（count 是依赖，变了）");
console.log();

console.log("=".repeat(50));
console.log("【第3步：不改 count 也不改 multiplier，只是触发渲染】");
// 注意：这里我们手动触发一次 rerender 来模拟"父组件重渲染导致子组件渲染"
// 但由于 useState 没有变化，我们用 setCount(1) 设同样的值
// 不过 setState 即使值相同也会触发 rerender（真实 React 会 bailout）
// 这里我们模拟一个不改变依赖的重渲染
console.log("→ 模拟一次不改变依赖的渲染：");
hookIndex = 0;
console.log("--- 手动重新渲染（依赖不变）---");
App();
console.log("--- 渲染完成 ---");
console.log("→ 期望：昂贵计算 NOT 执行（依赖没变，命中缓存）");
console.log();

console.log("=".repeat(50));
console.log("【第4步：改 multiplier（另一个依赖），应触发重算】");
setMultiplier(20);
console.log("→ 期望：昂贵计算执行第 3 次（multiplier 是依赖，变了）");
console.log();

console.log("=".repeat(50));
console.log("【第5步：演示 useCallback 的引用稳定性】");
console.log("  → 当 count 不变时，handleClick 引用应该保持稳定");
console.log("  → 上面的输出中，handleClick 引用稳定？= true 说明缓存生效");
console.log();

console.log("=".repeat(60));
console.log("总结：");
console.log(\`  昂贵计算共执行了 \${expensiveCallCount} 次（如果没有 useMemo 会执行 5 次）\`);
console.log("  - useMemo：依赖没变时跳过计算，直接返回缓存值");
console.log("  - useCallback：本质是 useMemo(() => fn, deps)，缓存函数引用");
console.log("  - 两者都用浅比较判断依赖是否变化");
console.log("=".repeat(60));`
  },

  // =========================================================
  // 第23章：useRef 与 useContext：引用与跨层通信
  // =========================================================
  {
    id: "rs-use-ref-context",
    group: "第五部分 Hooks 系统",
    icon: "🌐",
    title: "useRef 与 useContext：引用与跨层通信",
    content: `# useRef 与 useContext：引用与跨层通信

前面学的 Hooks 都和"状态 + 重渲染"有关。这一章讲两个"另类"——它们都**不触发重渲染**，但解决的问题完全不同：

- \`useRef\`：存一个"可变的盒子"，改它不会重渲染（适合存 DOM 引用、定时器 ID）
- \`useContext\`：跨组件层级读数据，不需要一层层 props 透传

## 一、useRef 的本质：一个不触发重渲染的可变容器

**生活类比：便签纸**

\`useState\` 像一块**电子显示屏**——你改了上面的字，全屋的人都能看到（触发重渲染）。
\`useRef\` 像一张**便签纸**——你可以在上面随便记东西，但别人不会注意到你改了什么（不触发重渲染）。

\`\`\`
const [count, setCount] = useState(0);   // 电子显示屏：改了会重渲染
const timerRef = useRef(null);            // 便签纸：改 .current 不会重渲染
\`\`\`

### useRef 的数据结构

\`useRef\` 在源码里极其简单——它存的就是一个对象：

\`\`\`js
{ current: initialValue }
\`\`\`

就这么简单。整个 hook 槽位只存这一个对象，\`current\` 是它的唯一属性。你读写 \`ref.current\` 就是在读写这个对象的属性，React 完全不关心、不监听、不触发渲染。

\`\`\`js
// useRef 的实现伪代码
function useRef(initialValue) {
  const ref = { current: initialValue };
  return ref;  // mount 时创建，update 时直接返回同一个对象
}
\`\`\`

> 这也是为什么 React 官方说"useRef is an escape hatch"——它是逃生舱，让你能在"React 的响应式世界"之外存东西。

## 二、useRef vs useState：什么时候用哪个

| 对比项 | useState | useRef |
|--------|----------|--------|
| 改值后是否重渲染 | ✅ 会 | ❌ 不会 |
| 适合存什么 | 需要显示在 UI 上的数据 | 不需要显示的"后台数据" |
| 典型用途 | 计数、表单值、开关 | DOM 节点、定时器 ID、上次的值 |
| 渲染时能否读取最新值 | 渲染中读到的是这次渲染的快照 | 永远读到 .current 最新值 |
| 更新方式 | setState(newValue) | ref.current = newValue |

**关键判断标准**：这个值需要**驱动 UI 更新**吗？

- 需要 → useState（比如 count 显示在页面上）
- 不需要 → useRef（比如定时器 ID，只是用来以后 clear）

**反面教材**：

\`\`\`js
// ❌ 用 useState 存定时器 ID——每次 setTimerId 都白触发一次重渲染
const [timerId, setTimerId] = useState(null);
useEffect(() => {
  setTimerId(setInterval(...));  // 多余的重渲染！
}, []);

// ✅ 用 useRef——存进去就完了，不重渲染
const timerRef = useRef(null);
useEffect(() => {
  timerRef.current = setInterval(...);  // 安静地存
}, []);
\`\`\`

### useRef 的经典用途

1. **访问 DOM 节点**：\`<input ref={inputRef} />\`，然后 \`inputRef.current.focus()\`
2. **保存定时器/订阅句柄**：方便在 useEffect cleanup 里清除
3. **记录"上一次的值"**：比较前后变化
4. **跨渲染保存可变数据**：不触发渲染但需要保留

## 三、Context：跨层级数据传递

**生活类比：广播站**

想象一栋大楼，每层都有办公室。传统 props 传数据就像**快递员一层层送**——从 1 楼传到 5 楼，必须经过 2、3、4 楼的人转交，中间几层根本不需要这个数据却要帮忙传。

Context 像**大楼广播站**——在 1 楼建个广播站（Provider），设定广播内容（value）。任何楼层的办公室只要**开收音机**（useContext）就能直接听到，不用经过中间楼层。

\`\`\`
传统 props：
  App → ThemeProvider → Toolbar → Header → Button
       （数据要一层层透传，中间组件被迫接收它不需要的 props）

Context：
  App（Provider value={theme}）
    └─ ThemeProvider
         └─ Toolbar
              └─ Header
                   └─ Button ← useContext(ThemeContext) 直接拿到 theme
\`\`\`

### Context 的数据结构

Context 是一个对象，核心有四个部分：

\`\`\`js
const MyContext = {
  $$typeof: Symbol.for('react.context'),  // 类型标识
  _currentValue: undefined,                // 当前值（Provider 之间传递用）
  Provider: { $$typeof: Symbol.for('react.provider') },  // 提供者组件
  Consumer: { $$typeof: Symbol.for('react.context') },   // 消费者组件（老 API）
};
\`\`\`

- **Provider**：一个特殊组件，用 \`value\` prop 提供数据：\`<MyContext.Provider value={...}>\`
- **Consumer**：用 render props 消费（老用法），新代码用 \`useContext\`

\`createContext\` 的实现非常简单——就是造上面这个对象：

\`\`\`js
function createContext(defaultValue) {
  const context = {
    _currentValue: defaultValue,  // 默认值（没有 Provider 时用）
    Provider: function Provider({ value, children }) {
      context._currentValue = value;  // Provider 渲染时把 value 存到 context 上
      return children;
    },
    Consumer: function Consumer({ children }) {
      return children(context._currentValue);  // 调用 render props
    },
  };
  return context;
}
\`\`\`

## 四、useContext 的实现：从 fiber 树向上查找 Provider

\`useContext(context)\` 怎么拿到最近的 Provider 的 value？答案是：**从当前 fiber 节点向上爬**，直到找到第一个提供该 context 的 Provider 节点。

\`\`\`
useContext 的查找过程：

  当前 fiber（Button）
    ↑ parent
  Header fiber
    ↑ parent
  Toolbar fiber
    ↑ parent
  ThemeProvider fiber  ← 发现它提供了 ThemeContext！取它的 value
    ↑ parent
  App fiber
\`\`\`

伪代码：

\`\`\`js
function useContext(context) {
  // 从当前 fiber 开始向上找
  let fiber = currentlyRenderingFiber;
  while (fiber !== null) {
    // 检查这个 fiber 是不是对应 context 的 Provider
    if (fiber.type === context.Provider) {
      // 找到了！取 Provider 的 pendingProps.value
      return fiber.pendingProps.value;
    }
    fiber = fiber.parent;  // 往上爬
  }
  // 没找到 Provider，返回 context 的默认值
  return context._currentValue;
}
\`\`\`

> 真实 React 会更复杂：它维护了一个"依赖列表"，当 Provider 的 value 变化时，只通知那些 useContext 过的 fiber 重渲染。这是通过 \`pushProvider/popProvider\` + 订阅机制实现的。

## 五、useContext 的注意事项

1. **value 变化会导致所有消费者重渲染**：Provider 的 value 每次都是新对象时，所有 useContext 的组件都会重渲染，即使内容没变。解决：用 useMemo/useState 包住 value。

\`\`\`js
// ❌ 每次 Provider 渲染 value 都是新对象
<MyContext.Provider value={{ theme: 'dark' }}>

// ✅ value 引用稳定
const value = useMemo(() => ({ theme: 'dark' }), []);
<MyContext.Provider value={value}>
\`\`\`

2. **不要滥用 Context**：Context 穿透性很强，但也会让组件"隐式依赖"全局数据，降低可测试性。适合全局配置（主题、语言、用户信息），不适合高频变化的数据。

3. **Context 嵌套地狱**：多个 Provider 嵌套时代码很难看，可以考虑封装。

## 六、本章 demo 说明

下面的 demo 会实现：

1. \`useRef\`：存一个 \`{ current: value }\` 对象，update 时返回同一个引用
2. \`createContext\`：造一个带 Provider 的 context 对象
3. \`useContext\`：用 fiber 树结构（用 parent 链模拟），从当前节点向上查找最近的 Provider
4. 演示：一个"主题" Context，深层子组件用 useContext 直接读到主题值，无需 props 透传

重点观察：useContext 不需要中间组件参与，数据"穿透"了中间层。`,
    code: `// ============================================
// 第23章 demo：实现 useRef 和 useContext 并演示跨层通信
// 演示内容：
//   1. useRef 实现：{ current: value } 可变容器
//   2. createContext 实现：带 Provider/Consumer 的 context 对象
//   3. useContext 实现：从 fiber 树向上查找 Provider
//   4. 演示：主题 Context 跨多层组件传递
// ============================================

console.log("=".repeat(60));
console.log("React 源码构建 — 第23章：useRef 与 useContext");
console.log("=".repeat(60));
console.log();

// ===== 1. Hook 链表模型 =====
let currentHooks = [];
let hookIndex = 0;
let currentComponent = null;
let currentFiber = null;  // 当前正在渲染的 fiber 节点（用于 useContext 向上查找）

// ===== 2. useRef 实现 =====
// useRef 是最简单的 Hook：存一个 { current: value } 对象
// mount 时创建，update 时直接返回同一个对象（引用稳定！）
function useRef(initialValue) {
  // 取当前 hook 槽位
  if (currentHooks[hookIndex] === undefined) {
    // mount：创建 ref 对象
    // 结构就一个 current 属性，存什么都可以
    const ref = { current: initialValue };
    currentHooks[hookIndex] = {
      memoizedState: ref,  // 把 ref 对象存进 hook 槽位
    };
    console.log(\`  [useRef] 初始化 ref，current = \${JSON.stringify(initialValue)}\`);
  }

  const hook = currentHooks[hookIndex];
  // update：直接返回之前创建的 ref 对象（同一个引用！）
  // 这就是 useRef "引用稳定"的来源：mount 时创建一次，之后永远返回同一个对象
  const ref = hook.memoizedState;

  hookIndex++;
  return ref;
}

// ===== 3. useState 简化版（供 demo 用） =====
function useState(initialValue) {
  if (currentHooks[hookIndex] === undefined) {
    currentHooks[hookIndex] = {
      memoizedState: typeof initialValue === 'function' ? initialValue() : initialValue,
      queue: [],
    };
  }
  const hook = currentHooks[hookIndex];
  while (hook.queue.length > 0) {
    const action = hook.queue.shift();
    hook.memoizedState = typeof action === 'function' ? action(hook.memoizedState) : action;
  }
  const setState = (action) => {
    hook.queue.push(action);
    rerender();
  };
  const result = [hook.memoizedState, setState];
  hookIndex++;
  return result;
}

// ===== 4. createContext 实现 =====
// 造一个 context 对象，包含 Provider 和 Consumer
function createContext(defaultValue) {
  const context = {
    // _currentValue：当前 context 的值
    // 没有 Provider 时用 defaultValue，有 Provider 时被 Provider 覆盖
    _currentValue: defaultValue,
    // 默认值，用于找不到 Provider 时的兜底
    _defaultValue: defaultValue,

    // Provider：一个"特殊组件"，用 value prop 提供数据
    // 在真实 React 中，Provider 是一个特殊类型，reconciler 会特殊处理
    // 这里简化：Provider 渲染时把 value 存到 context._currentValue
    Provider: function ContextProvider(props) {
      // Provider 的核心逻辑：把 value 存到 context 上
      // 真实 React 在 pushProvider 时做这件事
      context._currentValue = props.value;
      console.log(\`    [Provider] 设置 context 值 = \${JSON.stringify(props.value)}\`);
      // Provider 的 children 会被渲染（返回给上层处理）
      return props.children;
    },

    // Consumer：用 render props 消费 context（老 API，新代码用 useContext）
    Consumer: function ContextConsumer(props) {
      // Consumer 的 children 是一个函数：(value) => ReactNode
      const value = context._currentValue;
      return props.children(value);
    },
  };

  return context;
}

// ===== 5. useContext 实现 =====
// 从当前 fiber 向上查找最近的 Provider，取它的 value
function useContext(context) {
  // 真实 React：从当前 fiber 的 dependencies 链表查找，或向上遍历 parent 链
  // 这里简化：直接读 context._currentValue
  // （因为我们的 Provider 在渲染时已经把 value 写入 _currentValue）
  const value = context._currentValue;
  console.log(\`    [useContext] 读取 context 值 = \${JSON.stringify(value)}\`);

  // 为了演示"向上查找 Provider"的逻辑，这里模拟 fiber 树向上遍历
  // 真实 React 代码大致如下（伪代码展示原理）：
  //   let fiber = currentFiber;
  //   while (fiber !== null) {
  //     if (fiber.type === context.Provider) {
  //       return fiber.pendingProps.value;  // 找到 Provider，返回它的 value
  //     }
  //     fiber = fiber.parent;  // 往上爬
  //   }
  //   return context._defaultValue;  // 没找到 Provider，返回默认值

  return value;
}

// ===== 6. 模拟 fiber 树（用于演示 useContext 向上查找的概念） =====
// 真实 React 中每个组件对应一个 fiber 节点，fiber 之间有 parent/child/sibling 链接
function createFiber(type, parent) {
  return {
    type,        // 组件类型（函数组件本身）
    parent,      // 父 fiber（用于 useContext 向上查找）
    child: null, // 第一个子 fiber
    props: {},   // 组件 props
  };
}

// ===== 7. 重新渲染 =====
function rerender() {
  hookIndex = 0;
  console.log("\\n--- 重新渲染 ---");
  currentComponent();
  console.log("--- 渲染完成 ---\\n");
}

// ===== 8. 创建一个主题 Context =====
const ThemeContext = createContext('light');  // 默认主题是 light
console.log("创建 ThemeContext，默认值 = 'light'\\n");

// ===== 9. 演示 useRef =====
console.log("=".repeat(50));
console.log("【演示1：useRef —— 不触发重渲染的可变容器】");
console.log("=".repeat(50));

let timerRef;
function RefDemo() {
  const [count, setCount] = useState(0);
  timerRef = useRef({ id: null, label: '我的定时器' });  // 存一个可变对象

  console.log(\`  🖥️ 渲染：count = \${count}\`);
  console.log(\`     ref.current = \${JSON.stringify(timerRef.current)}\`);

  // 直接改 ref.current 不会触发重渲染！
  // 模拟：在 ref 上记录渲染次数
  timerRef.current.renderCount = (timerRef.current.renderCount || 0) + 1;
  console.log(\`     ref.current.renderCount = \${timerRef.current.renderCount}（改 ref 不触发重渲染）\`);

  return setCount;
}

currentComponent = RefDemo;
const setCount = RefDemo();
console.log("\\n→ 触发一次重渲染（改 state）：");
setCount(1);
console.log("→ 注意：ref.current 是同一个对象，renderCount 在累加（因为没被重置）");
console.log();

// ===== 10. 演示 useContext 跨层通信 =====
console.log("=".repeat(50));
console.log("【演示2：useContext —— 跨层通信，无需 props 透传】");
console.log("=".repeat(50));
console.log();

// 重置 hook 环境
currentHooks = [];
hookIndex = 0;

// 构建组件树：App > ThemeProvider > Toolbar > Header > Button
// Button 需要读主题，但不通过 props 拿，而是用 useContext

// 最深层的 Button 组件——用 useContext 直接读主题
function Button() {
  const theme = useContext(ThemeContext);  // 直接从 Context 读，不需要 props！
  console.log(\`    🖥️ Button 渲染：theme = \${theme}（来自 useContext，非 props）\`);
  return theme;
}

// Header 组件——它不需要主题，只是中间层
function Header() {
  console.log("    🖥️ Header 渲染（不需要 theme，不接收 theme props）");
  return Button();  // 渲染子组件
}

// Toolbar 组件——也不需要主题
function Toolbar() {
  console.log("    🖥️ Toolbar 渲染（不需要 theme，不接收 theme props）");
  return Header();
}

// ThemeProvider 组件——用 Provider 提供主题
function ThemeProvider({ value, children }) {
  // 调用 context.Provider，设置 value
  ThemeContext.Provider({ value, children });
  // 渲染 children（这里是 Toolbar）
  return children();
}

// App 组件——最外层，提供主题
function App() {
  console.log("  🖥️ App 渲染：用 ThemeProvider 提供 theme='dark'");
  // ThemeProvider 的 children 是一个函数（模拟 React children 的延迟求值）
  const result = ThemeProvider({ value: 'dark', children: Toolbar });
  console.log(\`  ✅ 最终 Button 拿到的 theme = \${result}\`);
  return result;
}

console.log("组件树结构：App > ThemeProvider > Toolbar > Header > Button");
console.log("Button 用 useContext 读主题，中间的 Toolbar/Header 不需要透传 props");
console.log();
App();
console.log();

// ===== 11. 演示没有 Provider 时的默认值 =====
console.log("=".repeat(50));
console.log("【演示3：没有 Provider 时使用默认值】");
console.log("=".repeat(50));
console.log();

// 重置 context 的值到默认值
ThemeContext._currentValue = ThemeContext._defaultValue;
console.log(\`没有 Provider 时，useContext 返回默认值 = '\${ThemeContext._currentValue}'\`);

function ButtonWithoutProvider() {
  const theme = useContext(ThemeContext);  // 没有外层 Provider
  console.log(\`  🖥️ ButtonWithoutProvider：theme = \${theme}（来自默认值）\`);
  return theme;
}
ButtonWithoutProvider();
console.log();

console.log("=".repeat(60));
console.log("总结：");
console.log("  useRef：{ current: value } 可变容器，改 .current 不触发重渲染");
console.log("    → 适合存 DOM 引用、定时器 ID、上次的值");
console.log("  useContext：从 fiber 树向上查找最近的 Provider，取它的 value");
console.log("    → 适合跨多层传递全局数据（主题、语言、用户信息）");
console.log("  两者都不触发重渲染（useRef 永远不触发；useContext 在 value 变化时才触发）");
console.log("=".repeat(60));`
  },

  // =========================================================
  // 第24章：事件系统：合成事件与事件委托
  // =========================================================
  {
    id: "rs-synthetic-event",
    group: "第六部分 完整 Mini React",
    icon: "🎪",
    title: "事件系统：合成事件与事件委托",
    content: `# 事件系统：合成事件与事件委托

如果你写过原生 JS，一定熟悉 \`element.addEventListener('click', handler)\`。但 React 里你写的是 \`<button onClick={handler}>\`——看起来差不多，底层却完全是另一套机制。React 没有把事件绑定到每个 button 上，而是**把所有事件统一绑定到根节点**，这就是"事件委托"。

## 一、为什么 React 要造合成事件

**生活类比：翻译官**

假设你是一家跨国公司，员工来自 20 个国家，各说各的母语。如果每个员工发言都要配一个翻译，成本太高。于是公司规定：所有员工发言先汇总到"翻译中心"，翻译中心把各种语言统一翻译成"标准英语"再处理。

React 的合成事件就是这个"翻译中心"——把浏览器各种**不统一**的原生事件，翻译成一套**统一**的合成事件对象。

### 原生事件的三大痛点

1. **浏览器兼容性差**：IE 的 \`e.cancelBubble\` vs 标准的 \`e.stopPropagation()\`；IE 的 \`e.srcElement\` vs 标准的 \`e.target\`
2. **事件对象回收**：原生事件对象在回调结束后会被池化复用（旧版 DOM 规范），异步访问 \`event.target\` 会拿到 null
3. **绑定成本**：如果有 1000 个按钮，每个都 addEventListener，内存开销大

### 合成事件的三个目标

- **统一接口**：屏蔽浏览器差异，开发者只面对一套 API
- **池化复用**：事件对象用完归还，减少 GC 压力（React 17 前的做法）
- **统一管控**：方便实现事件冒泡控制、事件优先级调度

## 二、事件委托：所有事件挂载到根节点

**生活类比：公司前台**

一栋大楼有 500 个办公室，每个办公室都可能收快递。如果每个办公室都派人在门口等快递，太浪费人手。于是大楼规定：所有快递统一送到**一楼前台**，前台根据收件人分发到对应办公室。

React 的事件委托就是这个模式：

\`\`\`
传统方式（不委托）：
  <button onclick=A>  ← 绑定到 button
  <div onclick=B>     ← 绑定到 div
  <span onclick=C>    ← 绑定到 span
  （N 个元素 = N 个监听器）

React 方式（委托到根）：
  root.addEventListener('click', dispatchEvent)  ← 只绑定一次！
  button.onClick → 记录在 fiber 上
  div.onClick    → 记录在 fiber 上
  点击发生时 → 冒泡到 root → dispatchEvent 统一分发
\`\`\`

### React 17 的重大变化：委托位置从 document 改到 root

- **React 16 及以前**：事件绑定到 \`document\` 上
- **React 17 起**：事件绑定到 **React 根容器**（\`createRoot(container)\` 的 container）上

为什么改？因为绑定到 document 会导致同一个页面里多个 React 应用（微前端场景）的事件互相干扰。改成各自根容器后，多个 React 应用可以共存。

## 三、事件冒泡的模拟

原生 DOM 的事件冒泡是浏览器自动完成的——从 \`event.target\` 一路冒泡到 \`document\`。但 React 把事件绑在根节点上，收到的只有"根节点上触发了 click"，怎么知道是哪个子组件的回调该执行？

答案：**手动模拟冒泡**。React 收到原生事件后，从 \`event.target\` 对应的 fiber 开始，**沿着 parent 链向上走**，依次调用每个 fiber 上注册的同名事件回调。

\`\`\`
点击 button（DOM 冒泡到 root）

React 收到后：
  1. 找到 button 对应的 fiber
  2. 从 button fiber 开始向上遍历：
     button fiber → 有 onClick？调用它
       ↓ parent
     div fiber    → 有 onClick？调用它
       ↓ parent
     root fiber   → 结束
\`\`\`

关键：React 用一个循环模拟了"冒泡"，每次调用回调时传入合成事件对象，调用 \`e.stopPropagation()\` 会打断这个循环。

## 四、合成事件对象 SyntheticEvent

合成事件对象是原生事件的"包装器"，它有这些特点：

\`\`\`js
{
  // 常用属性（从原生事件同步过来）
  type: 'click',           // 事件类型
  target: domNode,         // 触发事件的 DOM
  currentTarget: domNode,  // 当前回调绑定的 DOM（随冒泡变化）
  nativeEvent: rawEvent,   // 原生事件引用（逃生舱）

  // 常用方法
  preventDefault(),        // 阻止默认行为
  stopPropagation(),       // 阻止冒泡（实际是设置一个标志位）

  // React 17 前的池化特性（17 后已移除）
  // isPersistent(),  // 异步访问需要 e.persist()
}
\`\`\`

合成事件的 \`stopPropagation\` 实现很巧妙——它不是调用原生的 \`stopPropagation\`，而是设置一个内部标志位，模拟冒泡的循环每次检查这个标志位，如果设置了就停止向上遍历。

\`\`\`js
// 合成事件的简化实现
function createSyntheticEvent(nativeEvent) {
  const syntheticEvent = {
    nativeEvent,                          // 保留原生引用
    target: nativeEvent.target,           // 同步 target
    type: nativeEvent.type,
    isPropagationStopped: false,          // 冒泡停止标志位
    stopPropagation() {
      this.isPropagationStopped = true;   // 设置标志位
      nativeEvent.stopPropagation();      // 也阻止原生冒泡
    },
    preventDefault() {
      nativeEvent.preventDefault();       // 直接调原生
    },
  };
  return syntheticEvent;
}
\`\`\`

## 五、事件系统的完整流程

把上面的知识点串起来，一次点击的完整流程：

\`\`\`
1. 用户点击 button
   ↓
2. 浏览器原生冒泡：button → ... → root（DOM 自动冒泡）
   ↓
3. root 上的监听器 dispatchEvent 被触发
   ↓
4. 从 nativeEvent.target 找到对应的 fiber 节点
   ↓
5. 创建合成事件对象 SyntheticEvent
   ↓
6. 从该 fiber 开始，沿 parent 链向上遍历：
   - 每个 fiber 检查是否有 onClick 回调
   - 有 → 调用回调，传入 syntheticEvent
   - 检查 syntheticEvent.isPropagationStopped
     - true → 停止向上遍历（模拟 stopPropagation）
     - false → 继续向上
   ↓
7. 遍历结束，事件分发完成
\`\`\`

## 六、React 17+ 事件系统的变化总结

| 特性 | React 16 | React 17+ |
|------|----------|-----------|
| 委托位置 | document | React 根容器 |
| 事件池化 | 有（需 persist） | 移除 |
| 合成事件对象 | 复用 | 每次新建 |
| onScroll | 不冒泡 | 不冒泡（特殊处理） |
| onFocus/onBlur | focus 事件 | focusin/focusout（冒泡版） |

## 七、本章 demo 说明

下面的 demo 会实现：

1. 一个模拟的 DOM 节点树（带 parent 链）
2. 把事件委托到根节点——只在 root 上注册一个监听器
3. \`dispatchEvent\` 函数：收到原生事件后，从 target 向上遍历 fiber
4. \`SyntheticEvent\` 合成事件对象：带 stopPropagation 标志位
5. 演示事件冒泡：点击内层按钮，外层 div 的 onClick 也会被触发
6. 演示 stopPropagation：调用后冒泡停止

重点观察：只有一个监听器（在 root 上），却能正确触发各层组件的回调，这就是事件委托的威力。`,
    code: `// ============================================
// 第24章 demo：实现事件委托和合成事件系统
// 演示内容：
//   1. 模拟 DOM 节点树（带 parent 链）
//   2. 事件委托：只在根节点注册一个监听器
//   3. dispatchEvent：从 target 向上遍历，触发各层回调
//   4. SyntheticEvent 合成事件对象（带 stopPropagation 标志位）
//   5. 演示冒泡和 stopPropagation
// ============================================

console.log("=".repeat(60));
console.log("React 源码构建 — 第24章：合成事件与事件委托");
console.log("=".repeat(60));
console.log();

// ===== 1. 模拟 DOM 节点 =====
// 真实浏览器有 DOM API，这里用一个简化对象模拟
// 每个"DOM节点"有：tagName、parent、props（含 onClick 等事件回调）
function createDOMElement(tagName) {
  return {
    tagName,            // 标签名，如 'button'、'div'
    parent: null,       // 父节点（用于冒泡遍历）
    props: {},          // 属性，包括 onClick、onMouseOver 等事件回调
    listeners: {},      // 实际挂载的监听器（委托模式下只有 root 有）
    children: [],       // 子节点列表
  };
}

// ===== 2. 创建合成事件对象 SyntheticEvent =====
// 合成事件是原生事件的"包装器"，屏蔽浏览器差异
// 关键：stopPropagation 不是直接调原生，而是设置标志位，让模拟冒泡的循环停止
function createSyntheticEvent(nativeEvent) {
  const syntheticEvent = {
    // —— 常用属性（从原生事件同步）——
    type: nativeEvent.type,                  // 事件类型，如 'click'
    target: nativeEvent.target,              // 触发事件的 DOM 节点
    currentTarget: null,                     // 当前回调绑定的节点（随冒泡变化）
    nativeEvent: nativeEvent,                // 原生事件引用（逃生舱，需要时可用）

    // —— 冒泡控制标志位 ——
    isPropagationStopped: false,             // 是否已停止冒泡（初始 false）

    // —— 阻止冒泡 ——
    // 不是直接调原生 stopPropagation，而是设置标志位
    // 模拟冒泡的循环每次检查这个标志位，true 就停止向上走
    stopPropagation() {
      this.isPropagationStopped = true;
      nativeEvent.stopPropagation();         // 同时也调原生的（防止原生层面的冒泡）
      console.log("    ⛔ syntheticEvent.stopPropagation() 已调用，冒泡将停止");
    },

    // —— 阻止默认行为 ——
    preventDefault() {
      nativeEvent.preventDefault();
      console.log("    ⛔ syntheticEvent.preventDefault() 已调用");
    },
  };
  return syntheticEvent;
}

// ===== 3. 事件委托核心：在根节点注册监听器 =====
// React 只在根容器上注册一个监听器，而不是每个元素都注册
function setupEventDelegation(rootNode, eventType) {
  // 模拟浏览器 addEventListener：在 root 上挂一个监听器
  // 真实代码：rootNode.addEventListener(eventType, dispatchEvent)
  rootNode.listeners[eventType] = (nativeEvent) => {
    console.log(\`  📡 根节点收到 \${eventType} 事件，开始分发…\`);
    dispatchEvent(nativeEvent, eventType);
  };
  console.log(\`  🔗 在根节点 <\${rootNode.tagName}> 上注册 \${eventType} 监听器（事件委托）\`);
}

// ===== 4. 事件分发函数 dispatchEvent =====
// 这是事件委托的核心逻辑：
//   1. 从 nativeEvent.target 找到触发节点
//   2. 创建合成事件
//   3. 从 target 开始沿 parent 链向上遍历，依次调用各层的 onClick
//   4. 检查 isPropagationStopped，true 则停止
function dispatchEvent(nativeEvent, eventType) {
  // 从原生事件拿到 target（实际被点击的节点）
  const targetNode = nativeEvent.target;

  // 创建合成事件对象（包装原生事件）
  const syntheticEvent = createSyntheticEvent(nativeEvent);

  console.log(\`  🎯 事件目标：<\${targetNode.tagName}>，开始模拟冒泡…\`);

  // 从 target 开始向上遍历（模拟 DOM 事件冒泡）
  let currentNode = targetNode;
  while (currentNode !== null) {
    // 取当前节点对应的"事件回调"（在 props.onClick 上）
    // 真实 React 里回调存在 fiber.memoizedProps.onClick
    const handlerName = 'on' + eventType.charAt(0).toUpperCase() + eventType.slice(1);
    const handler = currentNode.props[handlerName];

    if (handler) {
      // 设置 currentTarget 为当前节点（随冒泡变化）
      syntheticEvent.currentTarget = currentNode;
      console.log(\`  ↗️ 冒泡到 <\${currentNode.tagName}>，调用 \${handlerName}\`);

      // 调用事件回调，传入合成事件
      handler(syntheticEvent);

      // 检查是否调用了 stopPropagation
      if (syntheticEvent.isPropagationStopped) {
        console.log(\`  🛑 冒泡被 stopPropagation 中止，停止向上遍历\`);
        break;  // 停止冒泡
      }
    } else {
      console.log(\`  ↗️ 冒泡到 <\${currentNode.tagName}>，无 \${handlerName} 回调，继续\`);
    }

    // 向上走一层
    currentNode = currentNode.parent;
  }

  console.log(\`  ✅ 事件分发完成\`);
}

// ===== 5. 模拟触发事件 =====
// 浏览器用户点击时，会生成一个原生事件并冒泡到 root
// 这里用一个函数模拟"用户点击了某个节点"
function simulateClick(targetNode, rootNode) {
  console.log(\`\\n👤 用户点击了 <\${targetNode.tagName}>\`);

  // 构造一个"原生事件"对象
  const nativeEvent = {
    type: 'click',
    target: targetNode,     // 实际点击的节点
    _defaultPrevented: false,
    _propagationStopped: false,
    stopPropagation() { this._propagationStopped = true; },
    preventDefault() { this._defaultPrevented = true; },
  };

  // 真实浏览器：事件会从 target 冒泡到 root
  // 但 React 的监听器在 root 上，所以浏览器冒泡到 root 时触发监听器
  // 我们直接调用 root 上注册的监听器
  const listener = rootNode.listeners['click'];
  if (listener) {
    listener(nativeEvent);
  }
}

// ===== 6. 构建 DOM 树并演示 =====
console.log("=".repeat(50));
console.log("【演示1：事件委托 + 冒泡】");
console.log("=".repeat(50));
console.log();

// 构建 DOM 树：root > div > button
const root = createDOMElement('div#root');
const container = createDOMElement('div');
const button = createDOMElement('button');

// 建立父子关系
container.parent = root;
button.parent = container;
root.children.push(container);
container.children.push(button);

// 在各层注册 onClick 回调（真实 React 中这存在 fiber.props 上）
root.props.onClick = (e) => {
  console.log("    📋 root 的 onClick 触发");
};
container.props.onClick = (e) => {
  console.log("    📋 container 的 onClick 触发");
};
button.props.onClick = (e) => {
  console.log("    📋 button 的 onClick 触发");
};

// 设置事件委托：只在 root 上注册一个 click 监听器
setupEventDelegation(root, 'click');
console.log();

// 模拟用户点击 button
// 期望：button → container → root 的 onClick 依次触发（冒泡）
simulateClick(button, root);

// ===== 7. 演示 stopPropagation =====
console.log("\\n" + "=".repeat(50));
console.log("【演示2：stopPropagation 阻止冒泡】");
console.log("=".repeat(50));
console.log();

// 重新设置：在 container 的 onClick 里调用 stopPropagation
container.props.onClick = (e) => {
  console.log("    📋 container 的 onClick 触发");
  e.stopPropagation();  // 阻止冒泡！root 的 onClick 不应该被触发
};

// 再次点击 button
// 期望：button → container 触发，然后 stopPropagation，root 不触发
simulateClick(button, root);

// ===== 8. 演示只有部分节点有回调 =====
console.log("\\n" + "=".repeat(50));
console.log("【演示3：中间节点没有回调，冒泡继续】");
console.log("=".repeat(50));
console.log();

// container 不绑定 onClick（去掉）
delete container.props.onClick;

// 点击 button
// 期望：button 触发 → container 无回调跳过 → root 触发
simulateClick(button, root);

// ===== 9. 总结 =====
console.log("\\n" + "=".repeat(60));
console.log("总结：");
console.log("  1. 事件委托：所有事件只绑定在根节点，不在每个元素上绑定");
console.log("     → 1000 个按钮只需 1 个监听器，省内存");
console.log("  2. 合成事件：包装原生事件，屏蔽浏览器差异");
console.log("     → stopPropagation 用标志位实现，控制模拟冒泡的循环");
console.log("  3. 冒泡模拟：从 target 沿 parent 链向上遍历，依次调用回调");
console.log("     → 检查 isPropagationStopped，true 则停止");
console.log("  4. React 17+ 委托位置从 document 改为根容器");
console.log("     → 支持同页面多个 React 应用共存");
console.log("=".repeat(60));`
  },

  // =========================================================
  // 第25章：整合：完整版 Mini React 与总结
  // =========================================================
  {
    id: "rs-final-integration",
    group: "第六部分 完整版 Mini React",
    icon: "🎉",
    title: "整合：完整版 Mini React 与总结",
    content: `# 整合：完整版 Mini React 与总结

恭喜你走到了最后一章！前面我们一块一块地搭：Fiber 架构、Render 阶段、Commit 阶段、Hooks 系统（useState/useReducer/useMemo/useCallback/useRef/useContext）、事件系统……现在是时候把它们**拼成一个能跑的完整 Mini React**了。

## 一、把所有模块整合到一起

**生活类比：组装一辆汽车**

前面几章像是在造汽车零件——发动机（Fiber 调度）、变速箱（Hooks 链表）、方向盘（事件系统）、轮胎（Commit 阶段）。零件都造好了，但散落一地还不能开。这一章就是**总装车间**：把零件按图纸拼起来，拧紧螺丝，点火试车。

Mini React 的完整流水线：

\`\`\`
1. createElement / jsx  →  生成虚拟 DOM 树（vnode）
2. render(vnode, container)
     ↓
3. workLoop（时间切片调度，这里简化为同步）
     ↓
4. performUnitOfWork（Render 阶段：逐个处理 fiber）
     ├─ reconcileChildren：diff 新旧 children，标记增删改
     └─ 处理函数组件：执行组件函数，拿到子 vnode
     ↓
5. commitRoot（Commit 阶段：操作真实 DOM）
     ├─ 执行 placement / deletion / update
     └─ 执行 useEffect / useLayoutEffect
     ↓
6. 事件委托：在 root 上注册监听器
\`\`\`

## 二、完整 Mini React 的模块清单

我们手写的 Mini React 包含以下模块（对应前面章节）：

| 模块 | 功能 | 对应章节 |
|------|------|----------|
| \`createElement\` | 把 JSX 转成 vnode 对象 | 第二部分 |
| \`render\` | 入口：创建 root fiber，启动调度 | 第二部分 |
| \`workLoop\` | 调度循环：处理 fiber 链表 | 第三部分 |
| \`performUnitOfWork\` | Render 阶段：diff + 收集副作用 | 第三部分 |
| \`commitRoot\` | Commit 阶段：操作真实 DOM | 第三部分 |
| \`useState/useReducer\` | 状态管理 + 更新队列 | 第21章 |
| \`useMemo/useCallback\` | 记忆化缓存 | 第22章 |
| \`useRef/useContext\` | 引用容器 + 跨层通信 | 第23章 |
| \`SyntheticEvent\` | 合成事件 + 事件委托 | 第24章 |

## 三、与真实 React 的对比

我们手写的 Mini React 简化了很多东西，下面是诚实的对比：

### 简化了什么

| 特性 | Mini React | 真实 React |
|------|-----------|-----------|
| 调度 | 同步执行完 | 时间切片（Fiber + 优先级 + Scheduler） |
| Diff | 简单的同层 diff | 带 key 优化的同层 diff + 多种 bailout |
| 事件 | 简化委托 | 完整的 17 种事件类型 + 优先级 |
| 更新批处理 | 同步立即执行 | 自动批处理（React 18 的 automatic batching） |
| 错误边界 | 无 | ErrorBoundary + 完整的错误恢复 |
| Suspense | 无 | 完整的 Suspense + lazy |
| 并发特性 | 无 | Concurrent Mode + Transition + useDeferredValue |
| Key 复用 | 简化 | 完整的 key-based 复用 + 状态保持 |

### 没实现什么（但原理相通）

- **优先级调度**：真实 React 有 Lane 模型，把更新分成 31 种优先级。我们的 Mini React 是"来一个处理一个"。
- **Suspense**：需要 throw promise 机制，我们没实现。
- **Hydration**：服务端渲染注水，需要匹配 DOM 和 vnode。
- **DevTools 支持**：真实 React 有 profiler、hooks inspector。

> 但核心思想是**完全一致**的：Fiber 链表 + 双缓冲（current/workInProgress）+ Render/Commit 两阶段 + Hooks 链表。理解了 Mini React，再看真实 React 源码会顺畅很多。

## 四、React 18 的新特性展望

React 18 是 React 近年来最大的更新，核心是**并发渲染（Concurrent Rendering）**。我们展望一下：

### 1. Concurrent Mode（并发模式）

传统 React 渲染是**同步不可中断**的——一旦开始渲染一个大组件树，主线程被占满，用户输入就卡顿。React 18 的并发模式让渲染**可中断、可恢复**：

\`\`\`
传统：开始渲染 → 100ms 卡顿 → 渲染完 → 响应输入
并发：开始渲染 → 5ms → 让出主线程响应输入 → 继续渲染 → 5ms → ...
\`\`\`

底层靠的是 Fiber 架构的可中断特性 + Scheduler 的优先级调度。

### 2. automatic batching（自动批处理）

React 18 之前，只有 React 事件回调里的多次 setState 会批处理。Promise/setTimeout/原生事件里的 setState 会**各自触发一次渲染**。React 18 后**所有场景都自动批处理**：

\`\`\`js
// React 17：两次渲染
setTimeout(() => {
  setA(1);  // 渲染1
  setB(2);  // 渲染2
}, 0);

// React 18：一次渲染（自动批处理）
setTimeout(() => {
  setA(1);
  setB(2);  // 合并为一次渲染
}, 0);
\`\`\`

### 3. Transitions（过渡）

\`startTransition\` 让你把某些更新标记为"低优先级"，可以被紧急更新打断：

\`\`\`js
import { startTransition } from 'react';

// 用户输入 → 高优先级，立即响应
setInputValue(value);

// 列表过滤 → 低优先级，可被打断
startTransition(() => {
  setSearchResults(filter(value));
});
\`\`\`

这样用户打字不会因为"列表在过滤"而卡顿。

### 4. Suspense 的增强

Suspense 不再局限于 \`React.lazy\`，可以配合数据获取框架（如 Relay、React Query）实现"组件请求数据时自动显示 loading"。

\`\`\`jsx
<Suspense fallback={<Spinner />}>
  <ComponentThatFetchesData />  {/* 内部 throw promise */}
</Suspense>
\`\`\`

### 5. 新的 Hooks

- \`useId\`：SSR 安全的唯一 ID 生成
- \`useSyncExternalStore\`：给外部 store（如 Redux）用的订阅 Hook，解决 tearing 问题
- \`useTransition\` / \`useDeferredValue\`：并发特性对应的 Hook

## 五、学完这套教程，你获得了什么

1. **理解 React 的底层运行机制**：不再是"会用 API"，而是知道每个 API 背后发生了什么
2. **能手写简易 React**：fiber、hooks、事件、diff 全部自己实现过一遍
3. **调试能力提升**：遇到 bug 能从原理层面分析，而不是瞎试
4. **阅读源码的基础**：再看 React 源码，会发现都是熟悉的模式
5. **性能优化直觉**：知道什么操作贵、什么操作便宜，能写出高性能代码

## 六、下一步学习建议

- **读真实 React 源码**：从 \`react-reconciler\` 的 \`ReactFiberBeginWork\` 开始
- **学习 React 18 并发特性**：Lane 模型、Scheduler、Suspense
- **研究状态管理库**：Redux / Zustand / Jotai，对比它们的设计
- **关注 React Server Components**：React 的未来方向

## 七、本章 demo 说明

最后这个 demo 会把前面所有模块整合成一个**能跑的 Mini React**，然后用它实现一个综合应用：

- 计数器（演示 useState/useReducer）
- 列表（演示渲染列表 + 删除）
- 表单输入（演示受控组件 + 事件系统）

由于 Node.js 没有 DOM，我们会用一个"模拟 DOM"来展示渲染结果，用 console.log 输出每次渲染后的"页面"内容。重点不是 DOM 操作细节，而是看**整套机制如何协同工作**。

这是本书的最后一个 demo，跑通它，你就完成了一次"从零构建 React"的旅程。🎉`,
    code: `// ============================================
// 第25章 demo：完整版 Mini React 综合应用
// 整合：createElement + render + fiber + hooks + 事件委托
// 应用：计数器 + 列表 + 表单输入
// ============================================

console.log("=".repeat(60));
console.log("React 源码构建 — 第25章：完整版 Mini React");
console.log("=".repeat(60));
console.log();

// ============================================================
// 第一部分：Mini React 核心
// ============================================================

// ----- 1. 虚拟 DOM 节点 -----
// createElement 把 JSX 转成 vnode 对象
// 真实 React 的 JSX 经 babel 编译后调用 React.createElement
function createElement(type, props, ...children) {
  return {
    type,                          // 'div' / 函数组件
    props: {
      ...props,
      children: children
        .flat()                    // 展平嵌套数组
        .filter(c => c !== false && c !== null && c !== undefined)  // 过滤空值
        .map(c => typeof c === 'object' ? c : createTextElement(c)),  // 文本转成 vnode
    },
  };
}

// 文本节点：特殊的 vnode，type 为 TEXT
function createTextElement(text) {
  return {
    type: 'TEXT',
    props: { nodeValue: text, children: [] },
  };
}

// ----- 2. 模拟 DOM -----
// Node.js 没有 DOM，用一个简化对象模拟真实 DOM 节点
function createDOMNode(tagName) {
  return {
    tagName,
    nodeType: 1,             // 元素节点
    textContent: '',
    attrs: {},               // 属性
    eventHandlers: {},       // 事件回调（onClick 等）
    children: [],            // 子节点
    parent: null,
    // 模拟 DOM 操作
    appendChild(child) { child.parent = this; this.children.push(child); },
    removeChild(child) {
      this.children = this.children.filter(c => c !== child);
      child.parent = null;
    },
    setAttribute(key, val) { this.attrs[key] = val; },
    addEventListener(type, handler) { this.eventHandlers[type] = handler; },
  };
}

// 把整棵 DOM 树序列化成字符串，方便 console.log 查看
function domToString(node, indent = '') {
  if (node.tagName === 'TEXT') {
    return indent + '"' + node.textContent + '"';
  }
  const attrs = Object.entries(node.attrs).map(([k, v]) => \` \${k}="\${v}"\`).join('');
  const childrenStr = node.children.length
    ? '\\n' + node.children.map(c => domToString(c, indent + '  ')).join('\\n') + '\\n' + indent
    : '';
  return \`\${indent}<\${node.tagName}\${attrs}>\${childrenStr}</\${node.tagName}>\`;
}

// ----- 3. Fiber 结构 + 调度 -----
let wipRoot = null;       // work-in-progress 树的根
let currentRoot = null;   // 上一次提交的 fiber 树（用于 diff）
let nextUnitOfWork = null;// 下一个要处理的工作单元
let deletions = [];       // 要删除的 fiber
let wipFiber = null;      // 当前正在 render 的 fiber
let hookIndex = 0;        // 当前 fiber 的 hook 游标

// 创建 fiber 节点
function createFiber(vnode, parent) {
  return {
    type: vnode.type,              // 'div' / 函数组件
    props: vnode.props,            // 包含 children
    parent,                        // 父 fiber
    child: null,                   // 第一个子 fiber
    sibling: null,                 // 下一个兄弟 fiber
    alternate: null,               // 对应的旧 fiber（双缓冲）
    dom: null,                     // 对应的真实 DOM 节点
    effectTag: 'PLACEMENT',        // 副作用标记：PLACEMENT / UPDATE / DELETION
    hooks: [],                     // 函数组件的 hook 数组
  };
}

// ----- 4. render 入口 -----
function render(vnode, container) {
  // 创建 wipRoot，开始新一轮渲染
  wipRoot = createFiber(vnode, null);
  wipRoot.dom = container;
  wipRoot.alternate = currentRoot;  // 连接到上次的树（用于 diff）
  nextUnitOfWork = wipRoot;
  // 真实 React 用 Scheduler 调度，这里简化为同步执行
  workLoop();
}

// ----- 5. 调度循环 -----
function workLoop() {
  // 一直处理到没有下一个工作单元
  while (nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  // 所有工作单元处理完，进入 commit 阶段
  if (wipRoot) {
    commitRoot();
  }
}

// ----- 6. Render 阶段：处理单个 fiber -----
function performUnitOfWork(fiber) {
  const isFunctionComponent = typeof fiber.type === 'function';

  if (isFunctionComponent) {
    // 函数组件：执行组件函数，拿到子 vnode
    updateFunctionComponent(fiber);
  } else {
    // 普通 DOM 元素：创建/更新 DOM 节点
    updateHostComponent(fiber);
  }

  // 返回下一个工作单元（深度优先：child → sibling → parent.sibling）
  if (fiber.child) return fiber.child;
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
  return null;
}

// 处理函数组件
function updateFunctionComponent(fiber) {
  wipFiber = fiber;     // 记录当前 fiber（供 hooks 使用）
  hookIndex = 0;        // 重置 hook 游标
  // 执行组件函数，children 是函数返回的 vnode
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

// 处理 DOM 元素组件
function updateHostComponent(fiber) {
  // 如果没有 dom（新增节点），创建一个
  if (!fiber.dom) {
    fiber.dom = createDOMNode(fiber.type === 'TEXT' ? 'TEXT' : fiber.type);
  }
  // TEXT 节点：把文本内容写到 dom.textContent 上
  if (fiber.type === 'TEXT') {
    fiber.dom.textContent = fiber.props.nodeValue;
  }
  // 处理 children
  reconcileChildren(fiber, fiber.props.children);
}

// ----- 7. diff：对比新旧 children -----
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;

    // 比较 oldFiber 和 element
    const sameType = oldFiber && element && oldFiber.type === element.type;

    if (sameType) {
      // 类型相同：UPDATE
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        parent: wipFiber,
        child: null, sibling: null,
        alternate: oldFiber,       // 指向旧 fiber
        dom: oldFiber.dom,         // 复用旧 DOM
        effectTag: 'UPDATE',
        hooks: oldFiber.hooks,     // 复用旧 hooks
      };
    }
    if (element && !sameType) {
      // 新元素：PLACEMENT
      newFiber = createFiber(element, wipFiber);
      newFiber.effectTag = 'PLACEMENT';
    }
    if (oldFiber && !sameType) {
      // 旧节点多余：DELETION
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    if (oldFiber) oldFiber = oldFiber.sibling;

    // 挂到 fiber 树上
    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (prevSibling) {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
}

// ----- 8. Hooks 实现 -----
function useState(initialValue) {
  // 取出当前 hook 槽位（复用旧 fiber 的或新建）
  const oldHook = wipFiber.alternate && wipFiber.alternate.hooks
    ? wipFiber.alternate.hooks[hookIndex] : null;

  const hook = {
    memoizedState: oldHook ? oldHook.memoizedState
      : (typeof initialValue === 'function' ? initialValue() : initialValue),
    queue: oldHook ? oldHook.queue : [],
  };

  // 消费更新队列
  while (hook.queue.length > 0) {
    const action = hook.queue.shift();
    hook.memoizedState = typeof action === 'function'
      ? action(hook.memoizedState) : action;
  }

  wipFiber.hooks[hookIndex] = hook;

  // dispatch：往当前 fiber 的 hook 队列塞 action，然后触发重渲染
  const setState = (action) => {
    hook.queue.push(action);
    // 触发新一轮渲染
    triggerRender();
  };

  const result = [hook.memoizedState, setState];
  hookIndex++;
  return result;
}

function useReducer(reducer, initialArg, init) {
  const initialValue = init ? init(initialArg) : initialArg;
  const [state, setState] = useState(initialValue);
  function dispatch(action) {
    setState((prev) => reducer(prev, action));
  }
  return [state, dispatch];
}

function useMemo(factory, deps) {
  const oldHook = wipFiber.alternate && wipFiber.alternate.hooks
    ? wipFiber.alternate.hooks[hookIndex] : null;
  const prevDeps = oldHook ? oldHook.deps : null;
  const hasChanged = !prevDeps || !deps || deps.length !== prevDeps.length
    || deps.some((d, i) => !Object.is(d, prevDeps[i]));
  const value = hasChanged ? factory() : oldHook.value;
  const hook = { value, deps: hasChanged ? deps : prevDeps };
  wipFiber.hooks[hookIndex] = hook;
  hookIndex++;
  return value;
}

function useCallback(callback, deps) {
  return useMemo(() => callback, deps);
}

function useRef(initialValue) {
  const oldHook = wipFiber.alternate && wipFiber.alternate.hooks
    ? wipFiber.alternate.hooks[hookIndex] : null;
  const ref = oldHook ? oldHook.ref : { current: initialValue };
  wipFiber.hooks[hookIndex] = { ref };
  hookIndex++;
  return ref;
}

// ----- 9. 触发重渲染 -----
let rootContainer = null;
let rootVnode = null;
function triggerRender() {
  // 用新的 wipRoot 重新渲染（连接到 currentRoot 做 diff）
  wipRoot = createFiber(rootVnode, null);
  wipRoot.dom = rootContainer;
  wipRoot.alternate = currentRoot;
  nextUnitOfWork = wipRoot;
  deletions = [];
  workLoop();
}

// ----- 10. Commit 阶段：操作真实 DOM -----
function commitRoot() {
  // 先处理删除
  deletions.forEach(commitWork);
  // 再处理新增和更新：从 root 的子节点开始提交
  // （root 本身是函数组件，它的 dom 是 container，不需要操作）
  commitWork(wipRoot.child);
  // 保存当前树，作为下次的 alternate
  currentRoot = wipRoot;
  wipRoot = null;
  deletions = [];
}

function commitWork(fiber) {
  if (!fiber) return;

  // 找到最近的父 DOM 节点（函数组件没有 dom，要向上找）
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) domParentFiber = domParentFiber.parent;
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom) {
    // 新增节点：先设置初始属性，再插入 DOM
    updateDOM(fiber.dom, {}, fiber.props);
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom) {
    // 更新节点：对比新旧 props，更新差异
    updateDOM(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION') {
    // 删除节点
    commitDeletion(fiber, domParent);
  }

  // 递归处理子节点和兄弟节点
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

// 更新 DOM 属性（简化版）
function updateDOM(dom, prevProps, nextProps) {
  // 更新文本节点：直接设置 textContent
  if (dom.tagName === 'TEXT') {
    if (nextProps.nodeValue !== (prevProps.nodeValue || '')) {
      dom.textContent = nextProps.nodeValue;
    }
    return;
  }
  // 遍历所有 props，设置事件回调和属性
  Object.keys(nextProps).forEach(key => {
    if (key.startsWith('on')) {
      // 事件回调：onClick → click，存到 eventHandlers 上（事件委托模式）
      const eventType = key.slice(2).toLowerCase();
      dom.eventHandlers[eventType] = nextProps[key];
    } else if (key !== 'children' && nextProps[key] != null) {
      // 普通属性：value、class 等
      dom.setAttribute(key, nextProps[key]);
    }
  });
}

// ----- 11. 模拟事件委托 -----
// 在根容器上注册监听器，统一分发事件
function setupDelegation(container) {
  // 模拟：提供一个 triggerEvent 函数，模拟用户操作
  // eventType  : 事件类型，如 'click'、'change'
  // targetPath : 从 container 开始的子节点索引路径，定位到目标节点
  // inputValue : 可选，模拟用户在 input 里输入的值（用于 change 事件）
  container.triggerEvent = function(eventType, targetPath, inputValue) {
    // 根据 path 找到目标节点
    let target = container;
    for (const idx of targetPath) {
      target = target.children[idx];
    }
    // 模拟用户输入：先更新 input 的 value 属性
    if (inputValue !== undefined) {
      target.attrs.value = inputValue;
    }
    // 同步 value 属性到节点上，让 e.target.value 能读到
    if (target.attrs.value !== undefined) {
      target.value = target.attrs.value;
    }
    console.log(\`\\n  👤 模拟用户 \${eventType} 事件，目标：<\${target.tagName}>\`);

    // 模拟冒泡：从 target 向上触发各层的事件回调
    let node = target;
    while (node) {
      const handler = node.eventHandlers[eventType];
      if (handler) {
        // 创建合成事件对象
        const syntheticEvent = {
          type: eventType,
          target: node,                   // target 指向当前节点
          isPropagationStopped: false,     // 冒泡停止标志位
          stopPropagation() { this.isPropagationStopped = true; },
          preventDefault() {},
        };
        handler(syntheticEvent);
        if (syntheticEvent.isPropagationStopped) break;
      }
      node = node.parent;
    }
  };
}

// ============================================================
// 第二部分：综合应用（计数器 + 列表 + 表单）
// ============================================================

// ----- 应用的状态管理 reducer -----
function appReducer(state, action) {
  switch (action.type) {
    case 'INC':
      return { ...state, count: state.count + 1 };
    case 'DEC':
      return { ...state, count: state.count - 1 };
    case 'SET_INPUT':
      return { ...state, input: action.value };
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, { id: Date.now(), text: state.input }],
        input: '',
      };
    case 'DEL_TODO':
      return { ...state, todos: state.todos.filter(t => t.id !== action.id) };
    default:
      return state;
  }
}

// ----- 应用组件 -----
function App(props) {
  // useReducer 管理所有状态
  const [state, dispatch] = useReducer(appReducer, {
    count: 0,
    input: '',
    todos: [
      { id: 1, text: '学习 React 源码' },
      { id: 2, text: '手写 Mini React' },
    ],
  });

  // useMemo 缓存计算结果
  const todoCount = useMemo(() => {
    console.log('    💰 计算待办数量…');
    return state.todos.length;
  }, [state.todos]);

  // 渲染 vnode 树
  return createElement('div', null,
    // 标题
    createElement('h1', null, 'Mini React 综合应用'),
    // 计数器区域
    createElement('section', null,
      createElement('h2', null, '计数器'),
      createElement('p', null, '当前值：' + state.count),
      createElement('button', {
        onClick: () => dispatch({ type: 'INC' }),
      }, '+1'),
      createElement('button', {
        onClick: () => dispatch({ type: 'DEC' }),
      }, '-1'),
    ),
    // 表单 + 列表区域
    createElement('section', null,
      createElement('h2', null, '待办列表（共 ' + todoCount + ' 项）'),
      createElement('input', {
        value: state.input,
        onChange: (e) => dispatch({ type: 'SET_INPUT', value: e.target.value }),
      }),
      createElement('button', {
        onClick: () => state.input && dispatch({ type: 'ADD_TODO' }),
      }, '添加'),
      createElement('ul', null,
        ...state.todos.map(todo =>
          createElement('li', { key: todo.id },
            todo.text,
            createElement('button', {
              onClick: () => dispatch({ type: 'DEL_TODO', id: todo.id }),
            }, '删除'),
          )
        )
      ),
    ),
  );
}

// ============================================================
// 第三部分：运行演示
// ============================================================

console.log("=".repeat(50));
console.log("【第1步：首次渲染】");
console.log("=".repeat(50));

// 创建模拟根容器
rootContainer = createDOMNode('div#root');
setupDelegation(rootContainer);

// 渲染应用
rootVnode = createElement(App, null);
render(rootVnode, rootContainer);

console.log("\\n渲染结果：");
console.log(domToString(rootContainer));

// ----- 模拟用户操作 -----
// DOM 树结构说明（路径从 container 开始）：
//   container.children[0] = div（App 返回的根 div）
//     div.children[0] = h1（标题）
//     div.children[1] = section（计数器区域）
//       section.children[0] = h2, [1] = p, [2] = button(+1), [3] = button(-1)
//     div.children[2] = section（待办列表区域）
//       section.children[0] = h2, [1] = input, [2] = button(添加), [3] = ul
//         ul.children[0] = li(第一个待办), [1] = li(第二个待办)
//           li.children[0] = TEXT(待办文本), [1] = button(删除)

console.log("\\n" + "=".repeat(50));
console.log("【第2步：点击 +1 按钮】");
console.log("=".repeat(50));
// 路径：container → div[0] → section[1] → button[2]
rootContainer.triggerEvent('click', [0, 1, 2]);
console.log("\\n渲染结果：");
console.log(domToString(rootContainer));

console.log("\\n" + "=".repeat(50));
console.log("【第3步：再点 +1】");
console.log("=".repeat(50));
rootContainer.triggerEvent('click', [0, 1, 2]);
console.log("\\n渲染结果：");
console.log(domToString(rootContainer));

console.log("\\n" + "=".repeat(50));
console.log("【第4步：点击 -1 按钮】");
console.log("=".repeat(50));
// 路径：container → div[0] → section[1] → button[3]
rootContainer.triggerEvent('click', [0, 1, 3]);
console.log("\\n渲染结果：");
console.log(domToString(rootContainer));

console.log("\\n" + "=".repeat(50));
console.log("【第5步：在输入框输入文字，然后点击添加】");
console.log("=".repeat(50));
// 路径：container → div[0] → section[2] → input[1]
// 先模拟用户在 input 里输入文字（触发 change 事件）
rootContainer.triggerEvent('change', [0, 2, 1], '学完 React 写个项目');
console.log("\\n渲染结果（输入后）：");
console.log(domToString(rootContainer));
// 然后点击"添加"按钮
// 路径：container → div[0] → section[2] → button[2]
rootContainer.triggerEvent('click', [0, 2, 2]);
console.log("\\n渲染结果（添加后）：");
console.log(domToString(rootContainer));

console.log("\\n" + "=".repeat(50));
console.log("【第6步：删除一个待办】");
console.log("=".repeat(50));
// 路径：container → div[0] → section[2] → ul[3] → li[0] → button[1]
rootContainer.triggerEvent('click', [0, 2, 3, 0, 1]);
console.log("\\n渲染结果：");
console.log(domToString(rootContainer));

// ----- 最终总结 -----
console.log("\\n" + "=".repeat(60));
console.log("🎉 恭喜！完整版 Mini React 运行成功！");
console.log("=".repeat(60));
console.log();
console.log("本教程完整回顾：");
console.log("  第二部分：createElement + 虚拟 DOM + render");
console.log("  第三部分：Fiber 架构 + Render/Commit 双阶段");
console.log("  第四部分：Hooks 基础（useState + 更新队列）");
console.log("  第五部分：高级 Hooks（useReducer/useMemo/useCallback/useRef/useContext）");
console.log("  第六部分：事件系统（合成事件 + 事件委托）+ 完整整合");
console.log();
console.log("与真实 React 的差距（诚实清单）：");
console.log("  ✗ 没有时间切片和优先级调度（同步执行）");
console.log("  ✗ 没有自动批处理（每次 setState 立即渲染）");
console.log("  ✗ 没有并发特性（Concurrent / Suspense / Transition）");
console.log("  ✗ 没有完整的 key 复用和 bailout 优化");
console.log("  ✗ 事件系统简化（只处理 click）");
console.log("  ✗ 没有 ErrorBoundary / Hydration / DevTools");
console.log();
console.log("但核心原理完全一致：");
console.log("  ✓ Fiber 链表 + 双缓冲（current/workInProgress）");
console.log("  ✓ Render（可中断）+ Commit（不可中断）两阶段");
console.log("  ✓ Hooks 链表 + 更新队列");
console.log("  ✓ 事件委托到根节点 + 合成事件");
console.log();
console.log("React 18+ 展望：");
console.log("  → Concurrent Mode：可中断渲染");
console.log("  → automatic batching：所有场景自动批处理");
console.log("  → Transitions：低优先级更新（startTransition）");
console.log("  → Suspense：数据获取的 loading 管理");
console.log("  → useSyncExternalStore：外部 store 订阅");
console.log();
console.log("下一步：去读真实 React 源码吧！");
console.log("  入口：react-reconciler 的 ReactFiberBeginWork.js");
console.log("=".repeat(60));`
  },
];
