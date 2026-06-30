// =============================================================
// React 18 新特性交互式教程 —— 第一批章节（并发渲染基础组，共 6 章）
// -------------------------------------------------------------
// 覆盖 React 18 并发渲染基础：createRoot 入口、自动批处理、
// 并发渲染原理、startTransition、useTransition、useDeferredValue。
// 所有 code 字段为可在 Node 沙箱运行的纯 JS（不依赖 react），
// 用 console.log 模拟演示底层原理。
// =============================================================

export const chapters = [
  {
    id: "react18-createRoot",
    title: "createRoot：新的入口 API",
    icon: "🚀",
    group: "并发渲染基础",
    content: `## 一、为什么要有 createRoot

React 18 之前，挂载一个 React 应用只有一种方式：

\`\`\`jsx
import ReactDOM from "react-dom";
import App from "./App";

ReactDOM.render(<App />, document.getElementById("root"));
\`\`\`

这套 API 从 React 0.x 时代一直用到 React 17，被称为 **legacy 模式**。它的核心特征是「同步渲染」——一旦开始渲染，就要一口气把整棵组件树渲染完，期间主线程被完全占用，用户的点击、输入、动画都会被卡住。当组件树变大、节点数变多时，这种「一口气渲完」的模式就成了交互流畅度的最大瓶颈。

React 18 引入并发渲染（Concurrent Rendering）后，渲染过程变成「可中断、可恢复、可按优先级调度」的。要让这套机制生效，必须从应用入口就明确告诉 React：「请用并发模式来调度我的渲染」。旧的 \`ReactDOM.render\` 仍然保留，但它只会以 legacy 模式运行，**无法开启任何并发能力**。于是 React 提供了一个全新的入口 API——\`createRoot\`。

> 一句话总结：\`createRoot\` 不是单纯的 API 改名，而是「打开并发渲染大门的钥匙」。用不用 \`createRoot\`，决定了你的应用能不能享受 React 18 的全部新特性。

## 二、createRoot 的基本用法

\`\`\`jsx
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
\`\`\`

注意三个要点：

1. **导入路径变了**：从 \`react-dom/client\` 导入，而不是顶层的 \`react-dom\`。这是 React 18 显式区分 client / server 入口的设计。
2. **两步走**：先 \`createRoot(container)\` 创建一个 root 实例，再调用 \`root.render(element)\`。这与旧的 \`ReactDOM.render(el, container)\`「一次性调用」不同，root 实例可以被复用，后续更新通过 \`root.render\` 或 \`root.unmount\` 操作。
3. **不再传回调**：旧的 \`ReactDOM.render\` 支持第三个回调参数，\`createRoot\` 的 \`render\` 不再支持。如果需要在渲染完成后做点什么，用 \`flushSync\` 或 \`useEffect\` / \`useLayoutEffect\`。

### 卸载应用

\`\`\`jsx
root.unmount();
\`\`\`

\`unmount\` 会清空容器并触发组件树的卸载生命周期，常用于微前端卸载子应用、单元测试清理等场景。

## 三、createRoot vs legacy render 的对照

| 维度 | \`ReactDOM.render\`（legacy） | \`createRoot\`（concurrent） |
|------|------------------------------|------------------------------|
| 导入 | \`react-dom\` | \`react-dom/client\` |
| 模式 | 同步、不可中断 | 并发、可中断可恢复 |
| 自动批处理 | 仅 React 事件内 | 事件、定时器、Promise、原生事件全覆盖 |
| Transition / useDeferredValue | 不可用 | 可用 |
| Strict Mode 双调用行为 | 不可用 | 一致（开发环境严格双调用） |
| 废弃状态 | React 18 标记弃用，控制台警告 | 推荐入口 |

迁移时，React 18 在使用 \`ReactDOM.render\` 时会打印一条警告：

\`\`\`
ReactDOM.render is no longer supported in React 18. Use createRoot instead.
\`\`\`

这不是报错，应用仍能以 legacy 模式运行，但所有并发特性都不会生效。要彻底享受 React 18，必须切到 \`createRoot\`。

## 四、并发模式的开启方式

并发模式并不是一个单独的开关——**只要使用 \`createRoot\`，应用就运行在并发模式下**。不需要额外调用 \`unstable_createRoot\`（那是早期实验 API）或传任何 flag。

\`\`\`jsx
// ✅ 这一行就足以开启并发渲染
const root = createRoot(container);
root.render(<App />);
\`\`\`

需要澄清一个常见误解：很多人以为「并发模式 = StrictMode」，这是不对的。\`createRoot\` 开启的是并发渲染能力；\`StrictMode\` 是开发环境的额外检查。两者独立。

## 五、StrictMode 配置

\`StrictMode\` 是一个仅在生产环境无副作用、在开发环境帮你发现潜在问题的工具组件。在 React 18 里它新增了「严格模式双调用」行为。

\`\`\`jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
\`\`\`

React 18 的 StrictMode 在开发环境下会**故意额外调用一次**这些函数，以帮助你发现副作用问题：

- 函数组件的函数体（多渲染一次）
- 类组件的 \`constructor\`、\`render\`、\`shouldComponentUpdate\`、\`UNSAFE_\`\` 生命周期
- \`useState\` / \`useMemo\` / \`useReducer\` 的初始化函数
- \`useEffect\` 的 setup 和 cleanup（mount 时执行 setup→cleanup→setup）
- \`useLayoutEffect\` 同理

设计动机是模拟「可中断渲染 → 丢弃 → 重新渲染」的未来场景。如果你的 effect 没有正确清理副作用（比如忘了取消订阅、忘了清定时器），双调用会让问题立刻暴露，而不是等到线上偶发 bug。

> 提示：StrictMode 的双调用**只在开发环境发生，生产构建完全不触发**，不会影响线上性能。

## 六、迁移清单

把一个 React 17 项目迁到 React 18 入口，建议按下面顺序：

1. 升级 \`react\` 和 \`react-dom\` 到 18+。
2. 把入口从 \`ReactDOM.render\` 改成 \`createRoot\`。
3. 把测试里的 \`act\` 从 \`react-dom/test-utils\` 迁移到 \`react\` 包直接导入（\`import { act } from 'react'\`），或使用 \`@testing-library/react\`（已内置 act）。
4. 检查 hydration：服务端渲染改用 \`hydrateRoot\`。
5. 移除 \`ReactDOM.unstable_batchedUpdates\`（已被自动批处理取代，调用变成空操作）。
6. 排查 StrictMode 双调用暴露的副作用清理问题。

### 服务端渲染入口

\`\`\`jsx
import { hydrateRoot } from "react-dom/client";

// container 已经有了服务端渲染出的 HTML，hydrate 复用它
const root = hydrateRoot(document.getElementById("root"), <App />);
\`\`\`

\`hydrateRoot\` 接收的第二个参数是初始元素，这是与 \`createRoot\` 显著不同的签名，迁移时别套错。

---

## 底层原理

\`createRoot\` 返回的 root 对象内部持有一个 \`FiberRoot\`（Fiber 根节点）。FiberRoot 上挂着若干关键字段：

- \`current\`：指向当前屏幕上显示的 Fiber 树的根（HostRoot）。
- \`workInProgress\`：正在构建中的下一棵 Fiber 树。
- \`pendingLanes\`：位图，记录有哪些优先级的更新在等待处理。
- \`callbackNode\`：当前调度的调度任务（由 Scheduler 包持有）。

当调用 \`root.render(<App />)\` 时，React 做的事是：

1. 创建/复用 HostRoot Fiber，把新的 element 挂到 \`updateQueue\` 上。
2. 在 \`HostRoot\` 上标记一个 \`Update\` 对象，分配一个 lane（优先级）。
3. 调用 \`ensureRootIsScheduled\`，向 Scheduler 包注册一个任务。
4. Scheduler 根据优先级和当前时间，决定立即执行还是延后执行该任务。
5. 任务执行时进入 \`renderRootConcurrent\` 或 \`performSyncWorkOnRoot\`，开始构建 workInProgress 树。

与 legacy \`render\` 的根本区别在第 4 步：legacy 模式直接同步进入 \`performSyncWorkOnRoot\`，不经过 Scheduler，也不接受中断；concurrent 模式则把控制权交给 Scheduler，由它决定何时切片、何时让出。这就是「入口决定模式」的底层原因——\`createRoot\` 注册的更新走的是并发调度通道。

## 常见陷阱

- **混用两个入口**：同一个容器上既调用过 \`ReactDOM.render\` 又调用 \`createRoot\`，会抛错 "Target container is not a DOM element that owns a React root"。一旦切到 \`createRoot\`，就不要再碰旧 API。
- **重复 createRoot**：对同一个 DOM 容器多次调用 \`createRoot\` 会警告并导致状态错乱。root 应该只创建一次并缓存。
- **把 StrictMode 当成性能开关**：有人在生产环境用条件判断包 \`StrictMode\` 想关掉双调用。其实 StrictMode 在生产构建里本就被剥离，无需手动处理。
- **依赖 render 回调**：从 17 迁过来时直接把第三个参数 callback 搬过来，\`createRoot\` 不支持，回调永远不会执行。改用 \`useEffect\` 或 \`flushSync\`。
- **container 不干净**：\`createRoot\` 要求传入的 DOM 节点没有被其他 React root 占用，也不能是 \`document.body\`（会警告）。

## 性能提示

- **首屏减少初始渲染负担**：开启并发模式后，首屏大组件树会以切片方式渲染，但首屏仍然要算完。对超大列表，配合 \`useDeferredValue\` 或虚拟滚动，避免首次渲染就把切片额度吃满。
- **合理使用 StrictMode**：开发期保留它捕获副作用 bug，不要因为双调用慢就关掉；性能基准测试应在生产构建下做。
- **缓存 root 实例**：模块作用域里缓存 \`createRoot\` 的返回值，避免热更新或路由切换时反复重建 root。
- **批量挂载时用一个 root**：微前端场景下，每个子应用一个 root 即可，不要为每个子组件单独建 root，否则会失去批处理和调度的全局协调能力。
`,
    code: `// 用纯 JS 模拟 legacy 同步渲染 vs concurrent 并发渲染的差异
// 演示重点：同步渲染一口气跑完会阻塞；并发渲染可被中断、可让出主线程

// ---------- 公共：模拟一个组件树（一堆"渲染单元"） ----------
function makeWorkUnits(count) {
  const units = [];
  for (let i = 0; i < count; i++) {
    units.push({ id: i, name: "Node-" + i });
  }
  return units;
}

// 模拟渲染一个单元要花的"时间"（用累加计数代替真实耗时）
function renderUnit(unit) {
  let busy = 0;
  for (let i = 0; i < 500000; i++) busy += i; // 制造足够 CPU 开销以触发时间切片让出
  return "rendered(" + unit.name + ")";
}

// ---------- 1. legacy 模式：同步、不可中断 ----------
function legacyRender(units) {
  console.log("[legacy] 开始同步渲染，期间无法响应任何输入...");
  const results = [];
  // 一口气跑完，中间不会让出
  for (const u of units) {
    // 模拟：渲染期间用户点击进来，但 legacy 模式不会处理，只能排队
    results.push(renderUnit(u));
  }
  console.log("[legacy] 渲染完成，共 " + results.length + " 个节点");
  console.log("[legacy] 现在才轮到处理用户输入（已被阻塞）");
  return results;
}

// ---------- 2. concurrent 模式：可中断、按时间切片让出 ----------
const TIME_SLICE_MS = 5; // 一个时间片预算 5ms
let interruptedCount = 0;

function shouldYield(startTime) {
  // 时间切片检查：超过预算就让出主线程
  return (performance.now() - startTime) >= TIME_SLICE_MS;
}

function concurrentRender(units) {
  console.log("[concurrent] 开始并发渲染（时间片 = " + TIME_SLICE_MS + "ms）");
  let index = 0;
  const results = [];

  function workLoop() {
    const startTime = performance.now();
    while (index < units.length) {
      results.push(renderUnit(units[index]));
      index++;
      // 关键：每渲染完一个单元就检查是否该让出
      if (shouldYield(startTime) && index < units.length) {
        interruptedCount++;
        console.log("[concurrent] 时间片用完，让出主线程（已渲染 " + index + "/" + units.length + "），响应用户输入后再继续");
        // 模拟"让出后由调度器在下一帧继续"
        setTimeout(workLoop, 0);
        return;
      }
    }
    console.log("[concurrent] 渲染完成，共 " + results.length + " 个节点，被中断 " + interruptedCount + " 次");
  }

  workLoop();
  return results;
}

// ---------- 模拟用户输入 ----------
function simulateUserInput() {
  console.log(">>> 用户点击到达，希望立即响应");
}

// ---------- 对比演示 ----------
const units = makeWorkUnits(40);

console.log("========== 1. legacy 同步渲染 ==========");
const t1 = performance.now();
legacyRender(units);
simulateUserInput(); // 必须等渲染完才能"被看到"
console.log("legacy 总耗时约: " + (performance.now() - t1).toFixed(2) + " ms\\n");

console.log("========== 2. concurrent 并发渲染 ==========");
interruptedCount = 0;
const t2 = performance.now();
concurrentRender(units);
// 用户输入可以在某个时间片让出期间插入
setTimeout(() => {
  simulateUserInput();
  console.log("concurrent 总耗时约: " + (performance.now() - t2).toFixed(2) + " ms");
  console.log("\\n结论：concurrent 模式通过 shouldYield 检查，把长任务切成多个小段，");
  console.log("      让用户输入有机会在切片之间被处理，从而避免长时间卡顿。");
}, 50);
`,
  },
  {
    id: "react18-batching",
    title: "自动批处理 Automatic Batching",
    icon: "📦",
    group: "并发渲染基础",
    content: `## 一、什么是批处理

「批处理（Batching）」指的是：当一次操作里触发了多次状态更新，React 不会每更新一次就重新渲染一次，而是把它们**收集起来、合并成一次重渲染**。

\`\`\`jsx
function handleClick() {
  setCount(c => c + 1);   // 更新 1
  setFlag(f => !f);       // 更新 2
  setText("hi");          // 更新 3
  // React 17 / 18 都只会渲染一次，而不是三次
}
\`\`\`

批处理的意义是性能：三个状态变更只触发一次 reconciliation + commit，省掉两次完整的 diff 和 DOM 操作。在没有批处理的世界里，每次 setState 都立刻同步渲染，列表一长就会卡。

## 二、React 17 的批处理：只覆盖 React 事件

React 17 的批处理依赖一个「执行上下文」标记。只有当 React 自己接管事件处理（合成事件的回调里）时，才会开启批处理。一旦跳出 React 的事件边界，批处理就失效：

\`\`\`jsx
// ✅ React 17：合成事件内，批处理生效，只渲染一次
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
}

// ❌ React 17：定时器里，批处理失效，渲染两次
setTimeout(() => {
  setCount(c => c + 1);  // 渲染 1
  setFlag(f => !f);      // 渲染 2
}, 0);

// ❌ React 17：Promise then 里也失效
fetch("/api").then(() => {
  setCount(c => c + 1);  // 渲染 1
  setFlag(f => !f);      // 渲染 2
});
\`\`\`

在 React 17 中，要在这些场景里手动批处理，得调用一个不稳定 API：

\`\`\`jsx
import { unstable_batchedUpdates } from "react-dom";

setTimeout(() => {
  unstable_batchedUpdates(() => {
    setCount(c => c + 1);
    setFlag(f => !f);
  }); // 渐染一次
}, 0);
\`\`\`

## 三、React 18 的自动批处理：全覆盖

React 18 把批处理下沉到 \`createRoot\` 的更新通道里，**无论更新从哪里发起**（事件、定时器、Promise、原生事件、async/await），都会被自动批处理。

\`\`\`jsx
// ✅ React 18：定时器里也批处理，只渲染一次
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
}, 0);

// ✅ React 18：Promise 里也批处理
fetch("/api").then(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
});

// ✅ React 18：原生事件监听里也批处理
button.addEventListener("click", () => {
  setCount(c => c + 1);
  setFlag(f => !f);
});
\`\`\`

底层原因是 React 18 不再用「执行上下文」判断要不要批处理，而是给每次更新分配一个 lane（优先级），然后在调度阶段统一安排。多次同优先级更新自然落进同一次渲染任务里。

## 四、flushSync：强制同步刷新

自动批处理有时也会带来意外——当你**确实需要**在两次 setState 之间拿到最新的 DOM 时，批处理会让你的"中间态"被合并掉。React 18 提供 \`flushSync\` 强制立即同步刷新：

\`\`\`jsx
import { flushSync } from "react-dom";

function handleClick() {
  setCount(c => c + 1);
  flushSync(() => {
    setFlag(f => !f); // 这里面的更新会立刻同步渲染
  });
  // 到这里 flag 已经体现在 DOM 上了
  setStep(s => s + 1); // 这次的更新会和外层的 setCount 合并
}
\`\`\`

\`flushSync\` 的典型场景：

- 调用某个第三方命令式 API（比如 \`scrollTo\`、\`focus\`、测量尺寸）前，必须确保 DOM 已经反映了某个状态。
- 在事件回调里读取 \`offsetHeight\` 等同步布局信息。

> \`flushSync\` 会破坏批处理、可能触发额外的同步渲染，**不要滥用**。能用 \`useEffect\` / \`useLayoutEffect\` 解决的，优先用 effect。

## 五、自动批处理的"边界"

并非所有更新都会被批处理。以下情况仍会触发独立渲染：

- **不同优先级的更新**：一个同步更新（如用户输入）和一个 transition 更新，会被分到两次渲染里——这正是 \`startTransition\` 的基础。
- **flushSync 包裹的更新**：会从批处理队列中剥离出来单独同步执行。
- **在已经提交的 effect 里再次触发更新**：通常会被安排到下一轮。

## 六、与并发渲染的关系

自动批处理不是并发渲染的全部，但它是基础。并发渲染要解决的「优先级调度」就建立在「更新可以被收集、合并、按优先级排序」之上。理解批处理，是理解后续 transition / useDeferredValue 的前提。

---

## 底层原理

React 18 批处理的核心在 Fiber 的更新队列与 lane 模型：

1. **更新队列（UpdateQueue）**：每个 Hook / HostRoot 上挂着一个环形链表 \`updateQueue\`。每次 setState 都会创建一个 \`Update\` 对象追加到链表尾部。
2. **lane 标记**：每个 \`Update\` 携带一个 lane（32 位整数中的某一位），表示其优先级。同一回调里的多次 setState 通常拿到相同的 lane。
3. **调度合并**：\`scheduleUpdateOnFiber\` 把 lane 写入 \`FiberRoot.pendingLanes\`，然后调用 \`ensureRootIsScheduled\`。这一步会检查 root 是否已有相同优先级的任务在排队——**有就复用，没有才新建**。这就是「多次更新合并成一次渲染」的根因。
4. **渲染阶段消费**：渲染时按 lane 过滤 updateQueue，把属于当前 lane 的 \`Update\` 一次性 reduce 出新 state，所以多次 setState 在一次渲染里被合并计算。

React 17 的 legacy 模式用 \`executionContext\` 位图判断批处理，跳出事件边界后该位图被清空，于是定时器/Promise 里的更新各自调度，导致多次渲染。React 18 改为基于 lane + \`ensureRootIsScheduled\` 的合并策略，不再依赖执行上下文，因此自动覆盖所有来源。

## 常见陷阱

- **依赖多次渲染的中间态**：从 React 17 定时器场景迁过来后，原本会渲染两次的代码现在只渲染一次，依赖"中间那次渲染"的逻辑会失效。改用 \`flushSync\` 显式分隔。
- **在 flushSync 里读 state**：\`flushSync\` 内部触发的渲染是同步的，但在闭包里读到的还是旧 state，需要通过 ref 或 effect 拿最新值。
- **把 flushSync 当性能优化**：它恰恰是性能**反优化**，只在必要同步刷新时使用。
- **eager state 误判**：React 有时会在 setState 时"乐观计算"新值，若 reducer 抛错会回退到入队更新，不要在 reducer 里做副作用。
- **跨优先级期望批处理**：transition 更新和同步更新即使写在一起也不会批处理成一次，这是设计而非 bug。

## 性能提示

- **让一次用户操作的状态变更尽量集中**：把相关的多个 setState 放在同一个回调里，自动批处理会把它们合并，无需手动包装。
- **移除遗留的 unstable_batchedUpdates**：迁到 React 18 后它已变成空操作，留着只会造成误解。
- **避免在高频事件里 flushSync**：scroll、mousemove 等高频事件里用 \`flushSync\` 会让每次都同步渲染，引发掉帧。改用 \`useDeferredValue\` 或 rAF 节流。
- **大列表过滤用 transition**：搜索框过滤大列表时，把过滤结果更新包进 \`startTransition\`，让输入框保持响应、列表更新延后批处理。
`,
    code: `// 用纯 JS 模拟 React 17 vs React 18 的批处理差异
// 核心：把多次 setState 收集到队列，统一 flush 一次

// ---------- 模拟组件状态 ----------
function makeComponent() {
  return {
    state: { count: 0, flag: false, text: "" },
    renderCount: 0,
    pendingUpdates: [], // 待批处理的更新队列
  };
}

function applyUpdates(comp) {
  if (comp.pendingUpdates.length === 0) return;
  // 一次性把所有更新 reduce 到 state 上
  for (const update of comp.pendingUpdates) {
    update(comp.state);
  }
  comp.pendingUpdates = [];
  comp.renderCount++; // 只渲染一次
}

// setState：把更新推入队列
function setState(comp, update) {
  comp.pendingUpdates.push(update);
  scheduleFlush(comp);
}

// ---------- React 17 模型：用 executionContext 判断批处理 ----------
let R17ExecutionContext = 0; // 0 = 不在 React 事件中
const R17_BATCH_FLAG = 1;

function r17SetState(comp, update) {
  comp.pendingUpdates.push(update);
  // 只在 React 事件上下文里才"自动安排合并 flush"
  if (R17ExecutionContext & R17_BATCH_FLAG) {
    // 在事件内：不立即 flush，等事件结束统一 flush
    return;
  }
  // 在事件外（定时器/Promise）：立刻单独 flush 一次 → 多次渲染
  applyUpdates(comp);
}

function r17WithBatch(fn) {
  R17ExecutionContext |= R17_BATCH_FLAG;
  try {
    fn();
  } finally {
    R17ExecutionContext &= ~R17_BATCH_FLAG;
    // 事件结束：flush 一次
  }
}

// ---------- React 18 模型：基于 lane + 调度合并，无视来源 ----------
function r18SetState(comp, update) {
  comp.pendingUpdates.push(update);
  // 无论来源（事件/定时器/Promise），都走"调度合并"
  // ensureRootIsScheduled 会复用已排队的同优先级任务
  scheduleFlush(comp);
}

let scheduled = false;
function scheduleFlush(comp) {
  if (scheduled) return; // 已有任务排队 → 复用，不重复调度
  scheduled = true;
  // 模拟 Scheduler 的延迟调度（用微任务近似）
  Promise.resolve().then(() => {
    scheduled = false;
    applyUpdates(comp);
  });
}

// ---------- 对比演示 ----------
console.log("========== 1. React 17：事件内批处理 ==========");
const c1 = makeComponent();
r17WithBatch(() => {
  r17SetState(c1, s => (s.count++, s));
  r17SetState(c1, s => (s.flag = !s.flag, s));
  r17SetState(c1, s => (s.text = "hi", s));
});
applyUpdates(c1); // 事件结束时统一 flush
console.log("渲染次数:", c1.renderCount, "（期望 1）");
console.log("最终状态:", JSON.stringify(c1.state));

console.log("\\n========== 2. React 17：定时器内不批处理 ==========");
const c2 = makeComponent();
// 模拟 setTimeout 回调里调用 setState
r17SetState(c2, s => (s.count++, s));
r17SetState(c2, s => (s.flag = !s.flag, s));
r17SetState(c2, s => (s.text = "hi", s));
console.log("渲染次数:", c2.renderCount, "（期望 3，每次都立刻 flush）");

console.log("\\n========== 3. React 18：定时器内也自动批处理 ==========");
const c3 = makeComponent();
r18SetState(c3, s => (s.count++, s));
r18SetState(c3, s => (s.flag = !s.flag, s));
r18SetState(c3, s => (s.text = "hi", s));
// 由于用微任务调度，需要等微任务跑完再看结果
setTimeout(() => {
  console.log("渲染次数:", c3.renderCount, "（期望 1）");
  console.log("最终状态:", JSON.stringify(c3.state));

  console.log("\\n========== 4. React 18：flushSync 强制同步刷新 ==========");
  const c4 = makeComponent();
  function flushSync(fn) {
    // flushSync：立刻同步 flush，并把队列从批处理中剥离
    fn();
    applyUpdates(c4);
  }
  r18SetState(c4, s => (s.count++, s));      // 进入队列
  flushSync(() => {
    r18SetState(c4, s => (s.flag = !s.flag, s)); // 这次的更新被立即 flush
  });
  console.log("此时渲染次数:", c4.renderCount, "（flushSync 内的更新已立即提交）");
  r18SetState(c4, s => (s.text = "hi", s));  // 进入队列
  setTimeout(() => {
    console.log("最终渲染次数:", c4.renderCount, "（期望 2：flushSync 一次 + 剩余合并一次）");
    console.log("最终状态:", JSON.stringify(c4.state));
  }, 10);
}, 10);
`,
  },
  {
    id: "react18-concurrent-rendering",
    title: "并发渲染原理",
    icon: "⚡",
    group: "并发渲染基础",
    content: `## 一、什么是并发渲染

并发渲染（Concurrent Rendering）是 React 18 的核心升级。它把原本「一旦开始就停不下来」的同步渲染，改造成「**可中断、可恢复、可按优先级重新安排**」的渲染过程。

打个比方：同步渲染像是一辆没有刹车的列车，从起点到终点一路不停；并发渲染像是一辆可以随时靠边停车让行、之后再继续前进的列车。这种"让行"能力，让高优先级任务（用户输入）能插队，低优先级任务（大列表过滤）可以被打断重来。

并发渲染不等于多线程——React 仍然跑在主线程上。它的"并发"是**协作式**的：渲染循环主动检查时间预算，超时就让出主线程，等浏览器空闲了再继续。这跟操作系统的"时间片轮转"是同一个思路。

## 二、可中断渲染

并发渲染里，一次渲染任务可以在任意一个 Fiber 节点处被打断：

- 用户输入进来，当前低优先级渲染被取消，立刻开始高优先级渲染。
- 时间片用完，当前渲染暂停，把控制权还给浏览器，下一帧继续。
- 新的高优先级更新到来，旧的低优先级 workInProgress 树可能被丢弃重来。

被打断后，已经做过的 diff 工作不会白费太多——React 用 \`workInProgress\` 指针和双缓冲机制保留进度，恢复时从断点继续，或基于新 state 重新开始。

## 三、时间切片（Time Slicing）

时间切片是并发渲染实现"不阻塞主线程"的具体手段。React 把一次大的渲染任务拆成若干小段，每段执行 \`~5ms\`（\`react-scheduler\` 里的常量 \`frameInterval = 5\`），然后让出主线程，等下一帧再继续。

\`\`\`text
一帧（~16.6ms）
├── React 渲染片段 1（5ms）
├── 浏览器处理输入/布局/绘制
├── React 渲染片段 2（5ms）
├── 浏览器处理输入/布局/绘制
└── React 渲染片段 3（剩余）
\`\`\`

这样用户输入、动画帧都不会被长任务卡住。判断"该不该让出"的函数就是 \`shouldYield\`（源码里叫 \`shouldYieldToHost\`）：

\`\`\`js
function shouldYieldToHost() {
  const timeElapsed = getCurrentTime() - startTime;
  if (timeElapsed >= frameInterval) return true; // 超过 5ms 就让出
  return false;
}
\`\`\`

## 四、优先级调度

并发渲染引入了「优先级」概念。React 18 内部用 **lane 模型** 表示优先级——一个 32 位整数，每一位代表一种优先级。

大致优先级（从高到低）：

1. **同步优先级（SyncLane / SyncDefaultLane）**：必须立即处理，不可中断。如 \`flushSync\`、离散事件（click/input）的更新。
2. **连续事件优先级（ContinuousEventPriority）**：drag、scroll、mousemove 等。高优先级但可极短中断。
3. **默认优先级（DefaultLane）**：普通更新。
4. **Transition 优先级（TransitionLane）**：\`startTransition\` 标记的更新，可以被打断、延迟。
5. **空闲优先级（IdleLane）**：浏览器空闲时再处理。

调度器（Scheduler 包）维护一个按优先级排序的任务队列，每次从最高优先级取任务执行。高优先级任务可以插队，低优先级任务被挤出当前帧。

## 五、Fiber 架构基础

并发渲染建立在 **Fiber 架构**之上。Fiber 是 React 16 引入、React 18 充分发挥的虚拟 DOM 重构：

- 每个 React 元素对应一个 **Fiber 节点**，它是一个可变对象，记录组件类型、props、state、子节点、兄弟节点、副作用等信息。
- 整棵组件树构成一棵 **Fiber 树**。
- React 维护两棵 Fiber 树：\`current\`（当前屏幕上的）和 \`workInProgress\`（正在构建的），双缓冲让中断恢复成本极低。

Fiber 节点之间用 \`child\` / \`sibling\` / \`return\` 三个指针连接，构成可遍历的链表结构。渲染过程就是按特定顺序遍历这棵树（先子后兄再回父），在遍历中每个节点都可以是中断点。

\`\`\`text
        HostRoot (return: null)
           |
         child
           |
        App ──sibling──> SideBar
         |                  |
       child              child
         |                  |
       Header ──sibling──> List   ...
\`\`\`

## 六、并发渲染的两阶段

渲染被拆成两个明确阶段：

1. **Render 阶段（render phase）**：纯计算，可中断。遍历 Fiber 树，diff 出变更，构建副作用链表（\`flags\`）。这一阶段不能有副作用，因为可能被打断重来。
2. **Commit 阶段（commit phase）**：同步、不可中断。把副作用应用到 DOM，执行 \`useLayoutEffect\` 同步生命周期，然后异步执行 \`useEffect\`。

> 重要原则：render 阶段必须纯函数化，不要在里面写订阅、修改外部变量、发请求等副作用。StrictMode 的双调用就是在帮你发现这类问题。

## 七、并发渲染带来的能力

理解了上面的机制，就能明白 React 18 这些特性都建立在并发渲染之上：

- **startTransition / useTransition**：把更新标记为低优先级，可被打断。
- **useDeferredValue**：让某个值"慢半拍"更新，避免昂贵渲染阻塞输入。
- **Suspense + 流式 SSR**：服务端渲染可以暂停等待数据，先推送已就绪的部分。
- **选择性 hydration**： hydrate 过程可被用户交互打断并优先处理被点击的组件。

---

## 底层原理

**Fiber 树与双缓冲**：每个 Fiber 节点结构大致为 \`{ type, return, child, sibling, alternate, pendingProps, memoizedProps, memoizedState, updateQueue, flags, lanes, childLanes }\`。\`alternate\` 字段指向另一棵树的对应节点（current↔workInProgress）。中断恢复时，React 从 \`workInProgress\` 上次处理到的节点继续；若优先级变化导致重来，则基于 \`current\` 重新 clone 一棵 \`workInProgress\`。

**Lane 优先级模型**：lane 是 31 位整数（31 位是因为 JS 位运算把操作数当 32 位有符号整数）。每一位代表一个优先级，\`SyncLane = 0b0001\`、\`DefaultLane = 0b0100\`、\`TransitionLane\` 多位、\`IdleLane = 1 << 30\` 等。一个 Fiber 上同时可能有多个 lane（\`lanes\` 字段是位或结果），React 渲染时按从低位到高位（高优先级到低优先级）依次消费。位运算让"是否有更高优先级更新"的判断变成一次 \`&\` 操作，极快。

**shouldYield 时间切片检查**：调度器在每个工作循环开头记录 \`startTime\`，每处理完一个 Fiber 节点就调用 \`shouldYieldToHost\`，它比较 \`performance.now() - startTime\` 与 \`frameInterval\`（默认 5ms），超时就返回 true，循环 break，向 \`MessageChannel\` 投递下一个任务，把主线程让给浏览器。\`MessageChannel\` 而非 \`setTimeout\` 是为了更稳定的调度时序。

**优先级插队**：新更新进来时 \`scheduleUpdateOnFiber\` 把 lane 写入 \`root.pendingLanes\`，\`ensureRootIsScheduled\` 比较新旧任务的优先级，若新任务更高，则取消（取消即把旧任务的 \`callback\` 置 null）已排队的低优先级任务，调度新任务，并标记旧工作"作废"（下次 render 时跳过或重用已完成的子树）。

## 常见陷阱

- **在 render 阶段写副作用**：并发模式下 render 可能被调用多次（中断重来、StrictMode 双调用），副作用会重复执行。把副作用放进 effect。
- **误以为并发 = 多线程**：所有 JS 仍在主线程，长任务只是被切片，不能解决 CPU 密集型计算（如大量数学运算）的卡顿，那需要 Web Worker。
- **对优先级顺序想当然**：transition 内的更新并非"完全不渲染"，而是"低优先级、可中断"。它仍会被处理，只是时机靠后。
- **依赖 effect 的执行次数**：StrictMode 双调用 + 并发中断重来会让 effect 多次 setup/cleanup，必须保证 cleanup 完整。
- **在 commit 阶段阻塞**：useLayoutEffect 是同步执行的，里面做重活会卡掉一帧，应保持极轻。

## 性能提示

- **把可延迟的更新放进 transition**：搜索、过滤、切 tab 这类不必立即反馈的更新用 \`startTransition\` 包起来，让输入框保持丝滑。
- **大列表用虚拟滚动 + useDeferredValue**：并发渲染能切片，但节点太多时单帧 5ms 仍可能不够，配合虚拟化只渲染可视区。
- **避免在 render 里创建大对象**：每次 render 都 new 大数组/大对象会让每个切片都重做这份开销，用 useMemo 缓存。
- **拆分大组件**：Fiber 遍历以节点为单位中断，组件粒度越细，中断点越密，调度越灵活。但不要为拆而拆，平衡可读性。
- **监控长任务**：用 Performance 面板观察是否有超过 50ms 的长任务，若有，检查是否未用 transition 或 render 里有过重计算。
`,
    code: `// 用纯 JS 模拟并发渲染的"时间切片 + shouldYield 让出"机制

// ---------- 1. 模拟 Fiber 节点 ----------
function makeFiber(name, children = []) {
  return {
    name,
    child: children.length ? children[0] : null,
    sibling: null,
    return: null,
    // 把兄弟节点串起来，子节点的 return 指回父
    children,
  };
}

function linkFibers(parent) {
  for (let i = 0; i < parent.children.length; i++) {
    parent.children[i].return = parent;
    if (i < parent.children.length - 1) {
      parent.children[i].sibling = parent.children[i + 1];
    }
    linkFibers(parent.children[i]);
  }
}

// 构造一棵组件树：App -> [Header, List(50 项), Footer]
const listItems = [];
for (let i = 0; i < 50; i++) listItems.push(makeFiber("Item-" + i));
const list = makeFiber("List", listItems);
const header = makeFiber("Header");
const footer = makeFiber("Footer");
const root = makeFiber("App", [header, list, footer]);
linkFibers(root);

// ---------- 2. 时间切片参数 ----------
const FRAME_INTERVAL = 5; // 每个时间片 5ms
let startTime = 0;
let yieldedCount = 0;
let nextUnitOfWork = null; // 下一个要处理的 Fiber

function shouldYield() {
  return performance.now() - startTime >= FRAME_INTERVAL;
}

// 模拟渲染单个 Fiber 的耗时（用循环制造 CPU 开销）
function performWork(fiber) {
  let busy = 0;
  for (let i = 0; i < 500000; i++) busy += i; // 制造足够开销以触发 5ms 时间切片让出
  console.log("  render:", fiber.name);
}

// ---------- 3. 工作循环：可中断、可恢复 ----------
function workLoop() {
  startTime = performance.now();
  while (nextUnitOfWork !== null) {
    performWork(nextUnitOfWork);
    nextUnitOfWork = getNextUnitOfWork(nextUnitOfWork);
    if (nextUnitOfWork !== null && shouldYield()) {
      yieldedCount++;
      console.log(">>> 时间片用完，让出主线程（已让出 " + yieldedCount + " 次）");
      // 用 setTimeout 模拟"下一帧继续"
      setTimeout(workLoop, 0);
      return;
    }
  }
  console.log("=== 渲染完成，总让出次数:", yieldedCount, "===");
}

// 遍历顺序：先 child，再 sibling，最后 return
function getNextUnitOfWork(fiber) {
  if (fiber.child) return fiber.child;
  let node = fiber;
  while (node !== null) {
    if (node.sibling) return node.sibling;
    node = node.return;
  }
  return null;
}

// ---------- 4. 优先级插队演示 ----------
const lanes = {
  SyncLane: 0b0001,        // 最高，同步
  DefaultLane: 0b0100,     // 默认
  TransitionLane: 0b10000, // transition，低
};

function priorityOf(lane) {
  // lane 数值越小优先级越高（位越靠右）
  const bit = Math.log2(lane);
  return "lane 位 " + bit + "（数值越小优先级越高）";
}

console.log("========== 优先级模型 ==========");
console.log("SyncLane      ", priorityOf(lanes.SyncLane));
console.log("DefaultLane   ", priorityOf(lanes.DefaultLane));
console.log("TransitionLane", priorityOf(lanes.TransitionLane));
console.log("判断是否有更高优先级更新: (newLane & lowerLanes) !== 0");
console.log("  TransitionLane 是否被 SyncLane 插队:",
  (lanes.TransitionLane & (lanes.SyncLane)) !== 0 ? "是" : "否（用位掩码判断）");

console.log("\\n========== 时间切片渲染演示 ==========");
console.log("树结构: App -> [Header, List(50 Items), Footer]，共 53 个节点");
console.log("每个时间片预算 " + FRAME_INTERVAL + "ms\\n");

nextUnitOfWork = root.child; // 从第一个子节点开始
workLoop();

// ---------- 5. 演示可中断：模拟用户输入插队 ----------
setTimeout(() => {
  console.log("\\n========== 中断重来演示 ==========");
  // 模拟：低优先级渲染进行到一半，用户输入（SyncLane）插队
  // React 会取消当前 transition 渲染，立刻处理 sync 更新
  console.log("场景：List 过滤用 transition 渲染中... 用户突然输入");
  console.log("React 判定 SyncLane 优先级更高，取消当前 transition workInProgress，");
  console.log("立即开始 sync 渲染（输入框更新），之后再重新安排 transition。");
  console.log("\\n这就是并发渲染的核心价值：高优先级更新无需等待低优先级渲染跑完。");
}, 100);
`,
  },
  {
    id: "react18-start-transition",
    title: "startTransition",
    icon: "🎯",
    group: "并发渲染基础",
    content: `## 一、为什么需要 startTransition

在前端交互里，更新可以粗略分两类：

- **紧急更新（urgent update）**：用户直接感知、必须立刻反馈的更新。比如输入框里敲字、点击按钮、拖拽滑块。这类更新慢一拍，用户就会觉得"卡"。
- **非紧急更新（non-urgent update）**：因为前面的交互而触发的、可以慢一点呈现的更新。比如输入框输入后下方列表的过滤结果、切换 tab 后新页面的完整内容、图表数据重算。

传统 React 里，这两类更新走同一条同步通道，挤在一起。结果就是：输入框打一个字，触发了一次大列表过滤渲染，输入框被卡住几十毫秒甚至更久，打字体验极差。

\`startTransition\` 给了你一个**显式标记"这部分更新可以慢一点"**的 API。被它包住的更新会被赋予低优先级（TransitionLane），可以被打断、可以被延迟，让高优先级更新（输入框本身的 state）先走。

\`\`\`jsx
import { startTransition } from "react";

function handleChange(e) {
  // 紧急：输入框立刻更新
  setInputValue(e.target.value);

  // 非紧急：列表过滤结果可以慢一点
  startTransition(() => {
    setSearchQuery(e.target.value);
  });
}
\`\`\`

## 二、API 用法

\`\`\`jsx
startTransition(scope);
\`\`\`

- \`scope\`：一个同步函数，里面调用的 setState 会被标记为 transition。
- 没有返回值。它**不会**返回 Promise，因为 transition 内部是同步调度的，scope 执行完就结束。
- scope 里触发的更新会被分配 TransitionLane 优先级，进入并发调度的低优先级队列。

注意：\`startTransition\` 必须在事件回调或 effect 里同步调用，不能放进 \`setTimeout\` 回调之后再包（那样就脱离了当前的调度上下文）。

\`\`\`jsx
// ✅ 正确：在事件回调里同步包
function handleChange(e) {
  setInputValue(e.target.value);
  startTransition(() => {
    setSearchQuery(e.target.value);
  });
}

// ❌ 错误：异步包裹，scope 里的更新不会获得 transition 优先级
setTimeout(() => {
  startTransition(() => {
    setSearchQuery("...");
  });
}, 0);
\`\`\`

## 三、紧急更新 vs 非紧急更新

| 维度 | 紧急更新 | transition 更新 |
|------|----------|-----------------|
| 典型场景 | 输入框值、按钮点击、拖拽位置 | 列表过滤、tab 切换、图表重算 |
| 优先级 | SyncLane / ContinuousEvent | TransitionLane |
| 可被打断 | 否（同步）/ 极少 | 是，可被紧急更新打断重来 |
| 渲染时机 | 立即 | 当前帧或后续空闲 |
| 用户感知 | 必须"立刻"反馈 | 可接受"慢半拍" |

分离两类更新的核心收益：**输入响应永远不被重渲染拖累**。

## 四、与 useTransition 的关系

\`startTransition\` 是底层 API，只负责"标记"。如果你还想知道"transition 是否还在进行中"（用来显示加载态、禁用按钮），用 \`useTransition\`：

\`\`\`jsx
const [isPending, startTransition] = useTransition();
// isPending: boolean，transition 渲染期间为 true
// startTransition: 与全局 startTransition 同名，但绑定当前组件
\`\`\`

简单说：

- 只需要"标记低优先级"，不需要 pending 状态 → 用 \`import { startTransition } from "react"\`。
- 需要 pending 状态（显示 loading、按钮 disabled） → 用 \`useTransition\`。

\`useTransition\` 内部就是 \`startTransition\` + 一个 isPending state，下一章会详细讲。

## 五、典型适用场景

1. **搜索框过滤大列表**：输入框值紧急更新，过滤结果 transition 更新。
2. **切换 Tab**：当前 tab 高亮紧急，新 tab 内容渲染 transition。
3. **路由跳转**（配合 React Router v6.4+ / Next.js）：旧页面保留、新页面内容 transition 加载。
4. **图表/数据重算**：筛选条件变化触发的重渲染。
5. **拖拽过程中的依赖计算**：拖拽位置紧急，依赖该位置的其他元素 transition。

\`\`\`jsx
// Tab 切换示例
function Tabs({ tabs }) {
  const [active, setActive] = useState("home");
  return (
    <>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => {
            // 高亮立刻变（紧急）
            setActive(t.id);
            // 内容渲染走 transition
            startTransition(() => {
              setContent(t.content);
            });
          }}
        >
          {t.label}
        </button>
      ))}
    </>
  );
}
\`\`\`

## 六、startTransition 不能做什么

- **不会让 CPU 密集型计算变快**：它只改变"何时渲染"，不改变"渲染多快"。如果过滤逻辑本身要算 200ms，transition 只是让它不阻塞输入，但结果还是要等 200ms。
- **不能用于动画**：动画用 rAF 或 CSS transition 更合适。
- **不返回 Promise**：不能 \`await startTransition(...)\`。

---

## 底层原理

调用 \`startTransition(scope)\` 时，React 在执行 scope 像素做两件事：

1. 把当前 fiber 的 \`EventPriority\` 上下文设置为 \`DiscreteEventPriority\` 之外的低优先级，具体是把生成的 \`Update\` 对象的 lane 设为某个 \`TransitionLane\`。
2. scope 里的所有 setState 都会读到这个上下文，从而被分配 TransitionLane。

进入 \`scheduleUpdateOnFiber\` 后，TransitionLane 写入 \`root.pendingLanes\`，\`ensureRootIsScheduled\` 根据 lane 计算任务的优先级（transition 对应 \`NormalSchedulerPriority\` 偏低），交给 Scheduler 包。Scheduler 用 \`MessageChannel\` 调度任务，但 transition 任务可以在执行前被更高优先级任务（SyncLane）取消——只要新的 sync 更新进来，\`ensureRootIsScheduled\` 会比较新旧优先级，把 transition 任务的 callback 置 null，并标记当前 workInProgress 为"需要重新基于新 state 生成"。

渲染阶段，\`getWorkInProgressRootRenderLanes\` 只处理当前选定的 lane 子集。transition 渲染可能只 render 一半就被 shouldYield 打断，下一帧继续；若期间有紧急更新，旧 workInProgress 被丢弃，React 从 current 重新 clone 并先处理 sync lane，sync 提交后再重新调度 transition。这就是 transition "可中断、可重来"的完整链路。

## 常见陷阱

- **在异步回调里包 startTransition**：\`setTimeout\` / Promise then 里包 \`startTransition\` 看似能跑，但 scope 里的更新拿不到 transition 上下文（上下文是同步维护的），实际仍是默认优先级。要在事件回调里同步包。
- **把 setState 写在 scope 外**：\`startTransition(() => fn())\` 而 fn 内部再异步 setState，更新不在 scope 内，不会被标记。
- **期望 transition 立刻渲染完**：transition 可能延迟到下一帧甚至更久，若逻辑依赖"transition 完成后做 X"，用 \`useEffect\` 监听 state 变化，不能假设时序。
- **在 transition 里更新输入框值**：把 \`setInputValue\` 也放进 transition 会让输入框变卡，违背初衷。紧急的归紧急、非紧急的归 transition。
- **过度使用**：不是所有更新都该 transition。只在"重渲染可能阻塞输入"时用，滥用会让界面感觉"迟钝"。

## 性能提示

- **分离输入与结果**：搜索框模式（inputValue 紧急 + searchQuery transition）是最经典、收益最高的用法，几乎所有重列表场景都适用。
- **配合 Suspense 显示 fallback**：transition 渲染期间若组件 suspend，React 会保留旧 UI 直到新 UI 就绪（结合 \`useTransition\` 的 isPending 显示 loading）。
- **大列表先 transition 再虚拟化**：transition 解决"不阻塞输入"，虚拟化解决"单次渲染量太大"，两者叠加效果最佳。
- **路由级 transition**：React Router / Next.js 支持 \`viewTransitions\` 或 unstable_ViewTransition，把路由切换包进 transition，旧页面保留直到新页面就绪，避免白屏。
- **测量真实收益**：用 Performance 面板对比"有/无 transition"的输入响应时长，目标是把每次按键到屏幕响应控制在 50ms 内。
`,
    code: `// 用纯 JS 模拟 startTransition 的优先级分离机制
// 紧急更新立即执行；transition 更新延迟到"空闲"才提交

// ---------- 模拟调度器 ----------
const urgentQueue = [];   // 紧急更新队列（SyncLane，立即处理）
const transitionQueue = []; // transition 更新队列（TransitionLane，延迟处理）
let isFlushingTransition = false;

function scheduleUrgent(task) {
  urgentQueue.push(task);
  flushUrgent();
}

function scheduleTransition(task) {
  transitionQueue.push(task);
  // 用 setTimeout 模拟"延迟到下一帧/空闲"
  setTimeout(flushTransition, 0);
}

function flushUrgent() {
  while (urgentQueue.length) {
    const task = urgentQueue.shift();
    task();
  }
}

function flushTransition() {
  // 关键：flush transition 前，先把剩余 urgent 清空（紧急更新永远优先）
  flushUrgent();
  isFlushingTransition = true;
  while (transitionQueue.length) {
    const task = transitionQueue.shift();
    // 模拟 transition 渲染可被新的 urgent 更新打断
    task();
    // 每次 transition 任务后检查是否有 urgent 插队
    flushUrgent();
  }
  isFlushingTransition = false;
}

// ---------- 模拟组件状态 ----------
const comp = { inputValue: "", searchQuery: "" };
let renderLog = [];

function render() {
  renderLog.push("渲染：input='" + comp.inputValue + "' query='" + comp.searchQuery + "'");
}

// ---------- startTransition 实现 ----------
function startTransition(scope) {
  // 进入 transition 上下文：scope 内的 setState 走 transitionQueue
  inTransition = true;
  try {
    scope();
  } finally {
    inTransition = false;
  }
}
let inTransition = false;

function setState(updater) {
  if (inTransition) {
    scheduleTransition(() => {
      updater(comp);
      render();
    });
  } else {
    scheduleUrgent(() => {
      updater(comp);
      render();
    });
  }
}

// ---------- 演示：搜索框场景 ----------
console.log("========== 模拟用户连续输入 'abc' ==========");
function userTypes(value) {
  console.log("\\n用户输入: '" + value + "'");
  // 紧急：输入框立即更新
  setState(c => { c.inputValue = value; });
  // 非紧急：过滤结果 transition
  startTransition(() => {
    setState(c => { c.searchQuery = value; });
  });
}

renderLog = [];
userTypes("a");
userTypes("ab");
userTypes("abc");

// 等待所有 transition flush 完成
setTimeout(() => {
  console.log("\\n--- 渲染日志（顺序）---");
  renderLog.forEach((r, i) => console.log(i + 1 + ". " + r));

  console.log("\\n========== 分析 ==========");
  const urgentCount = renderLog.filter(r => !r.includes("query='") || r.split("query='")[1] === r.split("input='")[1]).length;
  console.log("紧急更新（inputValue）每次都立即渲染，输入框绝不卡顿。");
  console.log("transition 更新（searchQuery）被合并/延迟，最终只渲染最终值 'abc'，");
  console.log("中间的 'a' 'ab' 过滤结果被跳过，省掉昂贵的大列表渲染。");
  console.log("\\n这正是 startTransition 的价值：紧急更新与重渲染解耦。");
}, 50);
`,
  },
  {
    id: "react18-use-transition",
    title: "useTransition",
    icon: "🔄",
    group: "并发渲染基础",
    content: `## 一、useTransition 解决什么问题

\`startTransition\` 能标记低优先级更新，但它"发完即走"——你不知道 transition 还在渲染、还是已经结束。实际交互里，我们常常需要这个状态：

- transition 进行中，显示一个 loading spinner 或"加载中..."。
- 进行中把按钮 disabled，防止重复点击。
- 进行中显示旧内容 + 半透明遮罩，提示用户"正在切换"。

\`useTransition\` 就是 \`startTransition\` + 一个 \`isPending\` 状态的组合：

\`\`\`jsx
const [isPending, startTransition] = useTransition();
\`\`\`

- \`isPending\`：boolean，true 表示有 transition 更新还在渲染中。
- \`startTransition\`：与全局 \`startTransition\` 用法一致，但绑定当前组件，能正确触发 isPending 切换。

## 二、API 用法

\`\`\`jsx
import { useState, useTransition } from "react";

function SearchBox() {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    const value = e.target.value;
    setInputValue(value); // 紧急
    startTransition(() => {
      setSearchQuery(value); // 非紧急
    });
  }

  return (
    <>
      <input value={inputValue} onChange={handleChange} />
      {isPending && <span>过滤中...</span>}
      <List query={searchQuery} />
    </>
  );
}
\`\`\`

\`isPending\` 在 transition 开始时变 true，在 transition 渲染提交后变 false。注意：

- **isPending 切换本身是一次 state 更新**，会触发当前组件重渲染（显示 loading 文案）。
- transition 内的更新提交后，isPending 自动回到 false，组件再次渲染（loading 消失 + 新内容呈现）。

## 三、useTransition vs startTransition

| 维度 | \`startTransition\`（全局） | \`useTransition\`（Hook） |
|------|----------------------------|---------------------------|
| 来源 | \`import { startTransition } from "react"\` | \`const [, startTransition] = useTransition()\` |
| isPending | 不提供 | 提供 |
| 使用位置 | 任何地方（事件回调、effect、甚至组件外） | 只能在组件/Hook 内调用 |
| 触发重渲染 | 否（纯标记） | 是（isPending 变化触发） |
| 典型场景 | 不需要 loading 态 | 需要 loading 态 / disabled 控制 |

经验法则：**需要 loading 态就用 useTransition，不需要就用全局 startTransition**。

## 四、实战：搜索框 + 大列表

这是 useTransition 最经典的场景。下面是一个完整可用的实现思路：

\`\`\`jsx
function SearchableList({ items }) {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    // 假设 items 很大，过滤耗时
    return items.filter(it => it.toLowerCase().includes(query.toLowerCase()));
  }, [items, query]);

  return (
    <div>
      <input
        value={inputValue}
        onChange={e => {
          setInputValue(e.target.value); // 紧急：输入框立即响应
          startTransition(() => {
            setQuery(e.target.value);    // 非紧急：过滤结果慢半拍
          });
        }}
      />
      <span style={{ opacity: isPending ? 0.6 : 1 }}>
        {isPending ? "过滤中..." : "共 " + filtered.length + " 条"}
      </span>
      <ul style={{ opacity: isPending ? 0.7 : 1 }}>
        {filtered.slice(0, 50).map(it => <li key={it}>{it}</li>)}
      </ul>
    </div>
  );
}
\`\`\`

效果：

- 敲字时输入框立刻响应，丝滑。
- 列表过滤结果"慢半拍"更新，期间显示"过滤中..."且列表半透明。
- 如果用户连续敲字，旧的过滤结果会被打断（transition 可中断），只渲染最终值。

## 五、isPending 的精确语义

\`isPending\` 不是"过滤计算耗时"，而是"**React 还没把 transition 更新提交到屏幕**"。它涵盖的时间段：

- transition 内 setState 触发 → React 调度 transition 渲染。
- transition 渲染（可中断、可分片）→ 期间 isPending = true。
- 渲染提交（commit）→ isPending = false。

如果 transition 渲染被更高优先级更新打断重来，isPending 全程保持 true，直到最终提交。这就是为什么连续敲字时 loading 一直显示——前几次过滤结果都被打断了。

## 六、进阶用法

**配合 Suspense**：transition 内的组件如果 suspend（比如 fetch 数据），React 会保留旧 UI 并保持 isPending = true，直到新数据就绪。这避免了"旧内容消失 → 白屏 → 新内容"的闪烁。

\`\`\`jsx
<Suspense fallback={<Spinner />}>
  <Content id={tabId} />
</Suspense>
// 切换 tabId 时：
startTransition(() => setTabId(newId));
// Content 还在加载新数据 → 旧 Content 保留 + isPending 显示 loading
\`\`\`

**防抖式提交**：transition 的"可中断"特性天然实现了"只渲染最终值"的效果，类似防抖，但比手写防抖更准——它基于真实渲染完成时机而非固定延时。

---

## 底层原理

\`useTransition\` 内部是一个 \`useReducer\` + \`startTransition\` 的封装：

1. 调用 \`useTransition\` 时，React 在当前 fiber 上挂一个 \`transition\` 状态（\`pendingLanes\` 相关），返回 \`[isPending, startTransition]\`。
2. 调用返回的 \`startTransition(scope)\` 时，React 先把当前 fiber 的 \`EventPriority\` 设为 transition，并把本次 transition 对应的 lane 记录到 fiber 的 \`transitions\` 上。
3. scope 执行，setState 走 transition 通道，写入 \`root.pendingLanes\` 的 TransitionLane 位。
4. 同时，React 调度一次"更新 isPending 为 true"的同步更新（绑定到 transition 的开始）。
5. transition 渲染完成并 commit 后，React 调度一次"更新 isPending 为 false"的更新（绑定到 \`root\` 上该 transition lane 被 clear 的事件）。

isPending 的"true → false"由 \`root.transitionLanes\` 是否还有当前 mount 的 transition 决定：只要还有未提交的 transition，isPending 保持 true。这也是为什么一个 transition 被另一个打断时 isPending 不会闪烁回 false——只要还有未提交的 transition，isPending 保持 true。

\`useTransition\` 的 startTransition 与全局 \`startTransition\` 的区别：前者在调用时会把"当前 hook 实例"登记为 transition 的"owner"，从而能精确更新该实例的 isPending；全局 startTransition 没有 owner，无法触发任何组件的 isPending。

## 常见陷阱

- **把 isPending 当成数据加载态**：isPending 只表示"transition 渲染未提交"，不等同于"网络请求进行中"。两者可能重叠但不等同，别用它替代 \`loading\` state 里的请求状态。
- **在 isPending 期间隐藏输入框**：transition 不影响紧急更新，输入框应一直可输入。把 disabled 加到"触发 transition 的按钮"而非输入框。
- **期望 isPending 精确到单个 transition**：多次 \`startTransition\` 调用的 isPending 是合并的，只要有一个没提交就是 true。
- **在 startTransition scope 里做副作用**：scope 必须纯（只 setState），副作用放 effect。scope 可能因中断被多次执行。
- **忘记 isPending 切换会触发渲染**：isPending 变化会让当前组件重渲染，如果当前组件本身很重，会抵消 transition 收益。把重渲染部分拆到子组件。

## 性能提示

- **isPending 期间降低渲染负担**：transition 进行中可以渲染更少的列表项（如只渲染前 20 条），提交后再渲染全部，进一步缩短感知等待。
- **用 isPending 控制交互**：进行中禁用"切换 tab"按钮，避免叠加多个 transition 造成抖动。
- **搭配 useDeferredValue 处理派生值**：如果重型计算来自 props 派生而非 setState，用 \`useDeferredValue\` 比 useTransition 更直接（下一章讲）。
- **避免在 transition 内串行多次 setState**：多个 setState 在同一 scope 里会被批处理成一次渲染，但如果分散在多个 transition scope，会多次调度。尽量合并。
- **测量 isPending 持续时间**：若 isPending 长时间不归零，说明 transition 渲染一直被中断重来，需排查是否有持续不断的高优先级更新抢占。
`,
    code: `// 用纯 JS 模拟 useTransition 的 isPending 状态切换与延迟提交

// ---------- 模拟组件 ----------
function makeComponent() {
  return {
    state: { inputValue: "", query: "" },
    isPending: false,
    renderLog: [],
  };
}

function render(comp) {
  comp.renderLog.push({
    isPending: comp.isPending,
    inputValue: comp.state.inputValue,
    query: comp.state.query,
  });
}

// ---------- 模拟调度器：urgent vs transition ----------
const urgentTasks = [];
const transitionTasks = [];
let pendingTransitionCount = 0;

function scheduleUrgent(task) {
  urgentTasks.push(task);
  // urgent 立即在微任务里 flush
  Promise.resolve().then(flushUrgent);
}

function flushUrgent() {
  while (urgentTasks.length) urgentTasks.shift()();
}

function scheduleTransition(task, comp) {
  transitionTasks.push({ task, comp });
  pendingTransitionCount++;
  // transition 延迟调度
  setTimeout(flushTransition, 10);
}

function flushTransition() {
  // 提交前先清空 urgent（紧急永远优先）
  flushUrgent();
  while (transitionTasks.length) {
    const { task, comp } = transitionTasks.shift();
    task();
    pendingTransitionCount--;
    if (pendingTransitionCount === 0) {
      // 所有 transition 提交完成 → isPending 回 false
      comp.isPending = false;
      render(comp);
    }
  }
}

// ---------- useTransition 实现 ----------
function useTransition(comp) {
  function startTransition(scope) {
    // 进入 transition 上下文
    comp.isPending = true;
    render(comp); // isPending 变 true 触发一次渲染（显示 loading）
    // scope 内的 setState 走 transition 调度
    inTransition = true;
    try {
      scope();
    } finally {
      inTransition = false;
    }
  }
  return [() => comp.isPending, startTransition];
}

let inTransition = false;
function setState(comp, updater) {
  if (inTransition) {
    scheduleTransition(() => {
      updater(comp.state);
      // 注意：transition 的 render 在 flushTransition 完成、isPending 更新时统一做
    }, comp);
  } else {
    scheduleUrgent(() => {
      updater(comp.state);
      render(comp);
    });
  }
}

// ---------- 演示：搜索框 ----------
const comp = makeComponent();
const [isPending, startTransition] = useTransition(comp);

function userTypes(value) {
  console.log("\\n用户输入: '" + value + "'");
  // 紧急：输入框立即更新
  setState(comp, s => { s.inputValue = value; });
  // 非紧急：query 走 transition
  startTransition(() => {
    setState(comp, s => { s.query = value; });
  });
}

console.log("========== 模拟连续输入 a / ab / abc ==========");
userTypes("a");
userTypes("ab");
userTypes("abc");

// 等所有调度跑完
setTimeout(() => {
  console.log("\\n--- 渲染日志 ---");
  comp.renderLog.forEach((r, i) => {
    console.log((i + 1) + ". isPending=" + r.isPending +
      " input='" + r.inputValue + "' query='" + r.query + "'");
  });

  console.log("\\n========== 关键观察 ==========");
  console.log("1. 每次输入后，isPending 立刻变 true（loading 显示）");
  console.log("2. inputValue 每次都更新到最新（输入框丝滑）");
  console.log("3. query 只在最终 transition 提交时更新为 'abc'");
  console.log("4. 中间 'a'、'ab' 的 transition 被打断/合并，没有产生对应的渲染");
  console.log("5. 全部 transition 提交后，isPending 回到 false（loading 消失）");
}, 80);
`,
  },
  {
    id: "react18-use-deferred-value",
    title: "useDeferredValue",
    icon: "🐌",
    group: "并发渲染基础",
    content: `## 一、useDeferredValue 解决什么问题

\`useTransition\` 适合"我自己 setState、我自己控制何时算 transition"的场景。但有时候，重型渲染的来源是**父组件传下来的 props**——你没有 setState 的时机可以包，只能眼睁睁看着 props 一变，自己这棵重子树就同步重渲染。

典型场景：一个搜索框 + 一个很重的结果列表。状态在父组件，列表是子组件。父组件输入框值一变，子列表立刻同步重渲染，输入卡顿。你无法在子组件里用 \`startTransition\`，因为触发更新的不是你的 setState。

\`useDeferredValue\` 给了一个反向思路：**让子组件"主动选择"用一个"慢半拍"的值**。它返回一个延迟版本的目标值——当目标值快速变化时，deferred 值会"旧值多用一会儿"，让重渲染延后到空闲时再发生。

\`\`\`jsx
const deferredValue = useDeferredValue(value);
\`\`\`

## 二、API 用法

\`\`\`jsx
import { useState, useDeferredValue, useMemo } from "react";

function SearchResults({ query }) {
  // query 是父组件传来的，可能高频变化
  const deferredQuery = useDeferredValue(query);

  // 用 deferredQuery 做重型计算
  const filtered = useMemo(() => {
    return heavyFilter(deferredQuery);
  }, [deferredQuery]);

  const isStale = query !== deferredQuery;

  return (
    <ul style={{ opacity: isStale ? 0.6 : 1 }}>
      {filtered.map(it => <li key={it}>{it}</li>)}
    </ul>
  );
}
\`\`\`

要点：

- \`useDeferredValue(value)\` 接收一个值，返回它的"延迟版"。
- 当 value 变化时，deferred 值不一定立刻跟上，React 会在后台用新值安排一次低优先级渲染。
- 在新值渲染提交前，deferred 保持旧值，组件先用旧值渲染一次（高优先级，保证 UI 不卡）。
- 通过 \`value !== deferredValue\` 可以判断"是否在延迟中"，用来做视觉提示（半透明）。

## 三、与防抖节流的区别

传统优化这种场景的办法是防抖（debounce）或节流（throttle）。它们与 useDeferredValue 有本质区别：

| 维度 | 防抖/节流 | useDeferredValue |
|------|-----------|------------------|
| 控制对象 | 事件触发频率 | 渲染时机 |
| 时机判断 | 固定时间窗 | React 调度（基于帧/空闲） |
| 网络请求 | 适合（减少请求次数） | 不直接适用 |
| 渲染优化 | 间接（减少 setState 次数） | 直接（把渲染标低优先级） |
| 中间值 | 直接丢弃 | 旧值保留显示，新值后台算 |
| 配合并发渲染 | 否 | 是 |

**关键差异**：防抖是"延迟触发更新"，useDeferredValue 是"立即触发更新但延迟重型渲染"。对于输入框本身，防抖会让输入框也延迟（除非把输入框和过滤值分成两个 state），而 useDeferredValue 让输入框立刻更新、只让重型子树延迟。

两者也可以组合：网络请求用防抖减少请求次数，渲染用 useDeferredValue 减少渲染阻塞。

## 四、与 useTransition 的对比

\`useTransition\` 和 \`useDeferredValue\` 是同一底层机制（transition 优先级）的两种 API 风格：

| 维度 | \`useTransition\` | \`useDeferredValue\` |
|------|-------------------|----------------------|
| 视角 | "我触发更新" | "我接收值" |
| 控制 | 主动包 setState | 被动延迟接收的值 |
| isPending | 提供 | 不提供（用 \`v !== deferred\` 判断） |
| 适用 | 状态在本组件 | 值从父/props 来 |
| 粒度 | 一组 setState | 单个值 |

记忆口诀：

- **setState 在我这儿 → useTransition**
- **重渲染的值是别人传来的 → useDeferredValue**

两者可以共存甚至互补：父组件用 useTransition 标记低优先级更新，子组件再用 useDeferredValue 进一步延迟最重的派生计算。

## 五、实战：搜索结果列表

完整模式（父组件状态 + 子组件 deferred）：

\`\`\`jsx
function App() {
  const [query, setQuery] = useState("");
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <SearchResults query={query} />
    </>
  );
}

function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(
    () => bigFilter(deferredQuery),
    [deferredQuery]
  );
  const isStale = query !== deferredQuery;
  return (
    <ul style={{ opacity: isStale ? 0.5 : 1, transition: "opacity 0.2s" }}>
      {results.slice(0, 30).map(r => <li key={r}>{r}</li>)}
    </ul>
  );
}
\`\`\`

效果：输入框立即响应，列表先用旧 query 渲染（半透明），新 query 的过滤结果在后台算好后切换。

## 六、何时用哪个

- 输入框值和过滤值**在同一个组件**：用 \`useTransition\`，把过滤值的 setState 包起来。
- 输入框值和过滤值**分属父子组件**，且子组件重：用 \`useDeferredValue\` 在子组件里延迟 query。
- **网络请求**：用防抖，不要用 useDeferredValue（它不减少请求次数）。
- **派生计算非常重**（如大型图表）：useDeferredValue + useMemo 组合，让计算只在 deferred 值变化时跑。

---

## 底层原理

\`useDeferredValue\` 内部实现基于一个 \`useState\` + \`startTransition\`：

1. 首次渲染：\`deferred = value\`，记录到 fiber 的 hook 队列。
2. value 变化导致组件重渲染时，hook 读取新 value，与记录的 deferred 比较：
   - 若相同：直接返回 deferred（无延迟）。
   - 若不同：本次渲染**先用旧 deferred 渲染**（高优先级，让 UI 立刻反映其他紧急变化），同时在新值上调度一次 transition 渲染。
3. transition 渲染执行时，hook 内部 \`setState\` 把 deferred 更新为新 value，触发重渲染（这次是低优先级、可中断）。
4. 这次重渲染中 \`useMemo\` 等基于 deferred 的派生计算才重新执行，因此重型计算被推到 transition 渲染里，不阻塞紧急更新。
5. 若 transition 渲染期间 value 又变了，旧 transition 被打断，基于更新的 value 重新调度——所以 deferred "总是追赶最新值"，中间值会被跳过。

"旧值多用一会儿"的本质是：在紧急渲染里 deferred 仍是旧值，所以用 deferred 的派生计算（useMemo）不会重算；只有 transition 渲染里 deferred 才更新，派生计算才跑。这就是为什么 useDeferredValue 能把重型计算从紧急渲染路径中剥离。

\`value !== deferredValue\` 之所以能判断"是否 stale"，正是因为在紧急渲染里两者不同（value 已新、deferred 仍旧），在 transition 提交后两者相同。

## 常见陷阱

- **对网络请求用 useDeferredValue**：它只延迟渲染，不延迟函数调用。如果你在 effect 里基于 deferred 发请求，请求仍会按 deferred 变化频率发出，不会减少。请求频率控制用防抖。
- **deferred 用于输入框的 value**：把 \`<input value={deferredQuery}>\` 会让输入框本身延迟，违背初衷。deferred 只用在"派生渲染"上。
- **期望 deferred 立刻同步**：deferred 在第一次紧急渲染里是旧值，必须有 transition 渲染提交后才更新，存在一帧以上的延迟。
- **不配合 useMemo**：如果直接 \`const filtered = bigFilter(deferred)\` 而不用 useMemo，每次渲染都会重算，deferred 的延迟优化被抵消。
- **对依赖 effect 的逻辑用 deferred**：deferred 变化会触发 effect，但时序与 value 不同步，可能引起副作用重复执行。

## 性能提示

- **配合 useMemo 锁定派生计算**：\`useMemo(() => heavy(deferred), [deferred])\` 是标准组合，确保重型计算只在 deferred 真正变化时跑。
- **用 stale 状态做视觉降级**：\`opacity\`、\`pointer-events: none\` 等轻量 CSS 在 stale 期间应用，给用户"正在更新"的暗示而不增加渲染负担。
- **分级 deferred**：对一个值有多个不同重量的派生时，可以分别用 \`useDeferredValue\` 拿到不同延迟版本，最重的延迟最久，轻的接近实时。
- **与虚拟化叠加**：deferred 解决"何时渲染"，虚拟化解决"渲染多少"，叠加能把大列表交互做到丝滑。
- **测量 deferred 延迟**：用 Performance 面板看 \`value\` 变化到 \`deferred\` 变化的间隔，正常应在 1-2 帧内；若过长说明 transition 渲染被频繁打断，需检查是否有持续的高优先级更新。
`,
    code: `// 用纯 JS 模拟 useDeferredValue 的延迟更新机制
// 核心：紧急渲染里用旧 deferred，transition 渲染里才更新 deferred

// ---------- 模拟组件 ----------
function makeComponent() {
  return {
    value: "",          // 最新值（父组件传入）
    deferred: "",       // 延迟值（本组件维护）
    renderLog: [],
  };
}

// ---------- 模拟调度器 ----------
const urgentTasks = [];
const transitionTasks = [];

function scheduleUrgent(task) {
  urgentTasks.push(task);
  Promise.resolve().then(flushUrgent);
}
function flushUrgent() {
  while (urgentTasks.length) urgentTasks.shift()();
}
function scheduleTransition(task) {
  transitionTasks.push(task);
  setTimeout(flushTransition, 10);
}
function flushTransition() {
  flushUrgent();
  while (transitionTasks.length) {
    const t = transitionTasks.shift();
    // transition 任务可能被新 urgent 打断：每次执行前先 flush urgent
    t();
    flushUrgent();
  }
}

// ---------- 模拟 useMemo 缓存 ----------
let cachedQuery = null;
let cachedResult = null;
function heavyFilter(query) {
  // 模拟重型计算：用 deferred 的值做过滤
  if (cachedQuery === query) return cachedResult;
  console.log("  [heavyFilter] 执行重型计算，query='" + query + "'");
  let busy = 0;
  for (let i = 0; i < 500000; i++) busy += i; // 制造 CPU 开销
  cachedQuery = query;
  cachedResult = "结果(" + query + ")";
  return cachedResult;
}

// ---------- useDeferredValue 实现 ----------
function useDeferredValue(comp, newValue) {
  // 紧急渲染：先用旧 deferred，记录新 value
  comp.value = newValue;
  if (comp.deferred !== newValue) {
    // 调度一次 transition：在 transition 里把 deferred 更新为 newValue
    const target = newValue;
    scheduleTransition(() => {
      comp.deferred = target;
      render(comp, "transition");
    });
  }
  // 紧急渲染里返回旧 deferred（让重型计算不立即重跑）
  render(comp, "urgent");
  return comp.deferred;
}

function render(comp, phase) {
  const stale = comp.value !== comp.deferred;
  const result = heavyFilter(comp.deferred);
  comp.renderLog.push({
    phase,
    value: comp.value,
    deferred: comp.deferred,
    stale,
    result,
  });
  console.log("[" + phase + "] value='" + comp.value +
    "' deferred='" + comp.deferred +
    "' stale=" + stale + " -> " + result);
}

// ---------- 演示 ----------
const comp = makeComponent();
console.log("========== 模拟父组件连续传入新 query ==========");
console.log("（输入框值立即变，列表过滤结果延迟更新）\\n");

// 模拟父组件三次快速更新 query
function parentUpdates(value) {
  console.log("\\n父组件 setState: query = '" + value + "'");
  useDeferredValue(comp, value);
}

parentUpdates("a");
parentUpdates("ab");
parentUpdates("abc");

// 等所有调度完成
setTimeout(() => {
  console.log("\\n========== 分析 ==========");
  console.log("1. 紧急渲染（urgent）里 deferred 保持旧值，重型计算 heavyFilter 不会重跑");
  console.log("2. 只有 transition 渲染里 deferred 才更新，heavyFilter 才执行");
  console.log("3. 中间的 transition 被打断/合并，heavyFilter 只对最终值 'abc' 执行一次");
  console.log("4. stale 标志在紧急渲染里为 true（value 已新、deferred 仍旧），");
  console.log("   可用于显示半透明 loading 效果");
  console.log("\\n这正是 useDeferredValue 的核心：把重型派生计算从紧急渲染路径剥离，");
  console.log("让输入响应与重渲染解耦，且无需手动管理 setState 时机。");
}, 80);
`,
  },
];
