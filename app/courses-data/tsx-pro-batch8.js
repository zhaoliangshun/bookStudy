// =============================================================
// TypeScript + React 全栈精通 - Batch 8: React 性能优化
// -------------------------------------------------------------
// 章节范围（共 5 章）：
//   49. tspro-memo          React.memo 与重渲染优化
//   50. tspro-memo-hooks    useMemo 与 useCallback 性能优化
//   51. tspro-lazy          React.lazy 与代码分割
//   52. tspro-profiler      Profiler 性能分析
//   53. tspro-strict-mode   StrictMode 与并发特性
//
// 代码运行环境：ts.transpileModule + jsx: ReactJSX + target ES2020
// 沙箱注入 react / react/jsx-runtime 的 mock，可写 JSX 语法
// =============================================================

export const chapters = [
  // =========================================================
  // 第四十九章：React.memo 与重渲染优化
  // =========================================================
  {
    id: "tspro-memo",
    group: "八、React 性能优化",
    icon: "⚡",
    title: "React.memo 与重渲染优化",
    content: `# 第四十九章：React.memo 与重渲染优化

## 49.1 为什么需要 memo

React 默认渲染策略很简单：**父组件渲染，所有子组件都跟着渲染**，不管 props 有没有变。

\`\`\`tsx
function App() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <ExpensiveList items={hugeList} />  {/* text 一变它就重渲染，但 props 根本没变 */}
    </div>
  );
}
\`\`\`

如果 \`ExpensiveList\` 渲染开销大，每次输入字符都卡顿，这就是典型的"无效重渲染"。\`React.memo\` 就是用来解决这个问题的。

## 49.2 React.memo 是什么

\`React.memo\` 是一个**高阶组件**：接收一个组件，返回一个被"记忆化"的新组件。新组件会在 props **没变化**时跳过重渲染。

\`\`\`tsx
const ExpensiveList = React.memo(function ExpensiveList(props) {
  return <ul>{props.items.map(i => <li key={i}>{i}</li>)}</ul>;
});
\`\`\`

效果：父组件渲染时，如果传给 \`ExpensiveList\` 的 props 跟上次**浅比较相同**，就直接复用上次的渲染结果，跳过本次渲染。

## 49.3 shallow compare（浅比较）

默认比较逻辑是**浅比较**：

\`\`\`tsx
function shallowEqual(prev, next) {
  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);
  if (prevKeys.length !== nextKeys.length) return false;
  return prevKeys.every(key => Object.is(prev[key], next[key]));
}
\`\`\`

注意：

- **基本类型**（string / number / boolean）：值相等就行
- **对象 / 数组 / 函数**：必须是**同一个引用**才算相等，内容相同不算
- 这就是为什么传 \`{a: 1}\` 每次都新建会让 memo 失效

\`\`\`tsx
// ❌ 每次渲染都新建对象，memo 失效
<Comp config={{ a: 1 }} />

// ✅ 用 useMemo 稳定引用
const config = useMemo(() => ({ a: 1 }), []);
<Comp config={config} />
\`\`\`

## 49.4 何时用 memo

符合以下任一条件，值得用 memo：

- 组件渲染开销大（大列表、复杂图表、富文本）
- 组件经常因父组件无关状态变化而重渲染
- props 较少且都是基本类型，容易稳定

## 49.5 何时不用 memo

\`\`\`tsx
// 1. 组件本身很轻：渲染成本比比较 props 还低
const Button = memo(({ label }) => <button>{label}</button>);  // 没必要

// 2. props 总是变：memo 比较永远返回 false，白比较
const Now = memo(() => <span>{Date.now()}</span>);  // 没意义

// 3. props 有大量不稳定引用：对象/函数每次都新建
<Comp data={data} onClick={() => {}} />  // memo 直接失效
\`\`\`

memo 不是免费的：每次渲染都要做一次 shallow compare，如果比较本身比渲染还贵，反而更慢。

## 49.6 自定义比较函数 areEqual

如果默认浅比较不够用，可以传第二个参数自定义比较：

\`\`\`tsx
const Comp = React.memo(Component, (prevProps, nextProps) => {
  // 返回 true 表示"相等，跳过渲染"
  // 返回 false 表示"不等，需要渲染"
  return prevProps.id === nextProps.id && prevProps.data.length === nextProps.data.length;
});
\`\`\`

注意：\`areEqual\` 的语义跟 \`shouldComponentUpdate\` **相反**——\`areEqual\` 返回 true 跳过渲染，\`shouldComponentUpdate\` 返回 true 触发渲染。

\`\`\`tsx
// 深比较示例：只有 data 内容真的变了才重渲染
const DeepComp = memo(Comp, (prev, next) => {
  return JSON.stringify(prev.data) === JSON.stringify(next.data);
});
// 注意：深比较开销大，慎用
\`\`\`

## 49.7 与 useMemo / useCallback 配合

memo 要生效，props 引用必须稳定。配合 useMemo（稳定对象/数组）和 useCallback（稳定函数）：

\`\`\`tsx
function App() {
  const [count, setCount] = useState(0);
  const items = useMemo(() => [1, 2, 3], []);          // 稳定数组
  const handleClick = useCallback(() => { /* ... */ }, []); // 稳定函数
  return <MemoList items={items} onClick={handleClick} />;
}
\`\`\`

**铁三角**：memo 子组件 + useMemo 传对象 + useCallback 传函数，缺一不可。

## 49.8 为什么不要无脑 memo

新手常犯的错：所有组件都包 \`memo\`。问题：

1. **比较成本**：每次都要 shallow compare，简单组件反而变慢
2. **维护成本**：props 加一个就要检查是否稳定，心智负担重
3. **虚假优化**：如果 props 总是不稳定，memo 完全没效果，纯增加代码
4. **掩盖问题**：把"父组件渲染过多"的根因藏起来，问题没真正解决

正确做法：**先测，再优化**。用 React DevTools Profiler 找到真正的瓶颈，再针对性 memo。

## 49.9 React.memo vs PureComponent vs shouldComponentUpdate

| 方式 | 适用 | 比较方式 |
|------|------|---------|
| \`React.memo\` | 函数组件 | 浅比较 props |
| \`PureComponent\` | 类组件 | 浅比较 props + state |
| \`shouldComponentUpdate\` | 类组件 | 完全自定义 |

新项目函数组件为主，基本只用 \`React.memo\`。

## 49.10 小结

- \`React.memo\` 是高阶组件，props 没变时跳过重渲染
- 默认浅比较：基本类型比值，对象比引用
- 用条件：渲染开销大、props 易稳定、确实有无效重渲染
- 自定义 \`areEqual\` 返回 true 表示相等（语义跟 shouldComponentUpdate 相反）
- 配合 useMemo / useCallback 才能真正生效
- 不要无脑 memo：先测再优化
`,
    code: `// =============================================================
// 第 49 章 demo：React.memo 与重渲染优化
// 模拟 memo 行为、shallow compare、自定义比较、重渲染次数对比
// =============================================================

// ---- 模拟 React 运行时 ----
// 渲染计数器：记录每个组件渲染了多少次
const renderCounts = {};
function markRender(name) {
  renderCounts[name] = (renderCounts[name] || 0) + 1;
}

// shallowEqual：React.memo 默认的浅比较
function shallowEqual(prev, next) {
  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);
  if (prevKeys.length !== nextKeys.length) return false;
  return prevKeys.every(k => Object.is(prev[k], next[k]));
}

// 模拟 React.memo：返回一个被记忆化的组件
function memo(Component, areEqual) {
  const compare = areEqual || shallowEqual;
  let lastProps = null;
  let lastResult = null;
  function Memoized(props) {
    if (lastProps && compare(lastProps, props)) {
      // props 没变，跳过渲染，复用上次结果
      return { _memoized: true, result: lastResult };
    }
    lastProps = props;
    lastResult = Component(props);
    return lastResult;
  }
  Memoized._isMemo = true;
  Memoized._displayName = 'memo(' + (Component.name || 'Anonymous') + ')';
  return Memoized;
}

function render(vnode) {
  if (vnode == null || vnode === false) return '';
  if (typeof vnode === 'string' || typeof vnode === 'number') return String(vnode);
  if (vnode._memoized) return render(vnode.result);  // memo 命中，复用
  if (typeof vnode.type === 'function') {
    return render(vnode.type(vnode.props));
  }
  return '<' + vnode.type + '>';
}

function h(type, props) {
  return { type, props: props || {} };
}

// ---- 1. 不用 memo：父渲染子也渲染 ----
console.log('=== 1. 不用 memo：父渲染子也渲染 ===');

function ChildNoMemo(props) {
  markRender('ChildNoMemo');
  return h('div', null, 'child: ' + props.value);
}

function Parent1(props) {
  markRender('Parent1');
  // 父组件因为 unrelated 变化重渲染，子组件 props.value 没变也会重渲染
  return h(ChildNoMemo, { value: props.value });
}

// 第一次渲染
render(h(Parent1, { value: 'hello', unrelated: 1 }));
// 父组件因 unrelated 变了重渲染（value 没变）
render(h(Parent1, { value: 'hello', unrelated: 2 }));

console.log('  Parent1 渲染次数:', renderCounts.Parent1);
console.log('  ChildNoMemo 渲染次数:', renderCounts.ChildNoMemo, '→ 即使 props 没变也重渲染');

// ---- 2. 用 memo：props 没变跳过子组件 ----
console.log('\\n=== 2. 用 memo：props 没变跳过 ===');

// 重置计数
renderCounts.Parent2 = 0;
renderCounts.ChildMemo = 0;

const ChildMemo = memo(function ChildMemo(props) {
  markRender('ChildMemo');
  return h('div', null, 'child: ' + props.value);
});

function Parent2(props) {
  markRender('Parent2');
  return h(ChildMemo, { value: props.value });
}

render(h(Parent2, { value: 'hello', unrelated: 1 }));
render(h(Parent2, { value: 'hello', unrelated: 2 }));  // value 没变

console.log('  Parent2 渲染次数:', renderCounts.Parent2);
console.log('  ChildMemo 渲染次数:', renderCounts.ChildMemo, '→ props 没变，跳过渲染');

// ---- 3. memo 失效：每次传新对象 ----
console.log('\\n=== 3. memo 失效：每次传新对象 ===');

renderCounts.ChildObj = 0;
const ChildObj = memo(function ChildObj(props) {
  markRender('ChildObj');
  return h('div', null, 'items: ' + props.items.length);
});

function Parent3(props) {
  markRender('Parent3');
  // 每次都新建数组，引用不同，memo 失效
  return h(ChildObj, { items: [1, 2, 3] });
}

render(h(Parent3, {}));
render(h(Parent3, {}));

console.log('  Parent3 渲染次数:', renderCounts.Parent3);
console.log('  ChildObj 渲染次数:', renderCounts.ChildObj, '→ 每次新引用，memo 失效');

// ---- 4. 自定义 areEqual：深比较内容 ----
console.log('\\n=== 4. 自定义 areEqual ===');

renderCounts.ChildDeep = 0;
const ChildDeep = memo(
  function ChildDeep(props) {
    markRender('ChildDeep');
    return h('div', null, 'data: ' + JSON.stringify(props.data));
  },
  (prev, next) => {
    // 自定义比较：内容相同就跳过
    return JSON.stringify(prev.data) === JSON.stringify(next.data);
  }
);

function Parent4(props) {
  markRender('Parent4');
  return h(ChildDeep, { data: { a: 1, b: 2 } });
}

render(h(Parent4, {}));
render(h(Parent4, {}));  // 内容相同

console.log('  Parent4 渲染次数:', renderCounts.Parent4);
console.log('  ChildDeep 渲染次数:', renderCounts.ChildDeep, '→ 自定义比较，内容相同跳过');

// ---- 5. areEqual 语义：返回 true 跳过 ----
console.log('\\n=== 5. areEqual 返回 true 表示相等 ===');

const ChildSemantics = memo(
  function (props) { return h('div', null, 'v=' + props.v); },
  (prev, next) => {
    const equal = prev.v === next.v;
    console.log('  [areEqual] prev.v=' + prev.v + ' next.v=' + next.v + ' → ' + equal + (equal ? '（跳过渲染）' : '（触发渲染）'));
    return equal;  // true = 相等，跳过
  }
);

render(h(ChildSemantics, { v: 1 }));
render(h(ChildSemantics, { v: 1 }));  // 相等，跳过
render(h(ChildSemantics, { v: 2 }));  // 不等，渲染

// ---- 6. memo + useMemo + useCallback 铁三角 ----
console.log('\\n=== 6. 铁三角：memo + useMemo + useCallback ===');

// 模拟 useMemo
function useMemo(factory, deps) {
  if (!useMemo._cache) useMemo._cache = [];
  const cache = useMemo._cache;
  const last = cache[0];
  if (!last || !deps.every((d, i) => Object.is(d, last.deps[i]))) {
    cache[0] = { value: factory(), deps };
  }
  return cache[0].value;
}

// 模拟 useCallback
function useCallback(fn, deps) {
  return useMemo(() => fn, deps);
}

renderCounts.IronChild = 0;
const IronChild = memo(function IronChild(props) {
  markRender('IronChild');
  return h('div', null, 'items=' + props.items.length + ' clicked=' + (props.onClick._count || 0));
});

function IronParent(props) {
  markRender('IronParent');
  // 用 useMemo 稳定 items 引用
  const items = useMemo(() => [1, 2, 3], []);
  // 用 useCallback 稳定 onClick 引用
  const onClick = useCallback(() => {}, []);
  return h(IronChild, { items, onClick });
}

render(h(IronParent, { unrelated: 1 }));
render(h(IronParent, { unrelated: 2 }));  // unrelated 变，但 items/onClick 稳定

console.log('  IronParent 渲染次数:', renderCounts.IronParent);
console.log('  IronChild 渲染次数:', renderCounts.IronChild, '→ 铁三角配合，子组件跳过');

// ---- 关键要点总结 ----
console.log('\\n=== React.memo 核心要点 ===');
console.log('1. memo 是高阶组件，props 没变时跳过重渲染');
console.log('2. 默认浅比较：基本类型比值，对象比引用');
console.log('3. 用条件：渲染开销大、props 易稳定');
console.log('4. areEqual 返回 true = 相等 = 跳过（与 shouldComponentUpdate 相反）');
console.log('5. 铁三角：memo + useMemo + useCallback 缺一不可');
console.log('6. 不要无脑 memo：先 Profiler 找瓶颈再优化');
`,
  },

  // =========================================================
  // 第五十章：useMemo 与 useCallback 性能优化
  // =========================================================
  {
    id: "tspro-memo-hooks",
    group: "八、React 性能优化",
    icon: "🚀",
    title: "useMemo 与 useCallback 性能优化",
    content: `# 第五十章：useMemo 与 useCallback 性能优化

## 50.1 为什么需要 useMemo / useCallback

React 函数组件每次渲染都会**重新执行整个函数体**：

- 函数里的所有变量、对象、数组、函数都是**新建**的
- 这些新引用传给子组件，会让 \`React.memo\` 失效
- 这些新引用传给 \`useEffect\` 的依赖数组，会让 effect 反复触发

\`\`\`tsx
function App() {
  // 每次渲染都新建一个数组
  const items = [1, 2, 3];
  // 每次渲染都新建一个函数
  const handleClick = () => console.log('click');

  // ❌ MemoList 是 memo 组件，但 items 每次都是新引用，memo 失效
  return <MemoList items={items} onClick={handleClick} />;

  // ❌ effect 每次都触发，因为 items 引用每次都变
  useEffect(() => {
    fetch('/api', { body: JSON.stringify(items) });
  }, [items]);
}
\`\`\`

\`useMemo\` 和 \`useCallback\` 就是为了**稳定引用**。

## 50.2 本质：缓存

两者本质都是"缓存上次的值"：

\`\`\`tsx
// useMemo：缓存一个值（对象/数组/计算结果）
const value = useMemo(() => factory(), [deps]);

// useCallback：缓存一个函数（语法糖，等价于 useMemo(() => fn, deps)）
const fn = useCallback(() => { /* ... */ }, [deps]);
\`\`\`

工作流程：

1. 第一次渲染：执行 factory，缓存结果，返回结果
2. 后续渲染：检查 deps 跟上次是否相同
3. 相同 → 直接返回缓存，跳过 factory
4. 不同 → 重新执行 factory，更新缓存

## 50.3 优化点 1：避免子组件重渲染

最常见的用途：传给 memo 子组件的 props 引用稳定。

\`\`\`tsx
function App() {
  const [count, setCount] = useState(0);

  // ✅ 用 useMemo 稳定 items 引用
  const items = useMemo(() => [1, 2, 3], []);

  // ✅ 用 useCallback 稳定 onClick 引用
  const handleClick = useCallback(() => {
    console.log('click');
  }, []);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <MemoList items={items} onClick={handleClick} />  {/* count 变化时不会重渲染 */}
    </div>
  );
}
\`\`\`

注意：**只有子组件用了 memo 才有意义**。子组件没 memo，props 稳定也没用，照样渲染。

## 50.4 优化点 2：避免 effect 反复触发

\`\`\`tsx
function App() {
  const [filter, setFilter] = useState('all');
  const items = useMemo(() => getFilteredItems(filter), [filter]);

  useEffect(() => {
    // 只有 filter 变了才重新 fetch
    // 如果 items 不稳定，每次渲染都会触发 fetch
    fetch('/api', { body: JSON.stringify(items) });
  }, [items]);

  return <List items={items} />;
}
\`\`\`

## 50.5 依赖数组的正确填法

**规则**：用到什么外部变量就放什么，不要漏，也别乱加。

\`\`\`tsx
function Comp({ a, b }) {
  // ✅ 用到 a 和 b，都放进去
  const value = useMemo(() => a + b, [a, b]);

  // ❌ 漏依赖：会用闭包里旧的 b
  const value2 = useMemo(() => a + b, [a]);

  // ❌ 多余依赖：c 不在 factory 里用到
  const value3 = useMemo(() => a + b, [a, b, c]);
}
\`\`\`

**ESLint 的 react-hooks/exhaustive-deps 规则**会自动检查，强烈建议开启。

## 50.6 何时不该用

新手容易"无脑 useMemo"，但 useMemo 本身也有成本：

\`\`\`tsx
// ❌ 简单计算：比 useMemo 自己的开销还小
const sum = useMemo(() => a + b, [a, b]);  // 没必要，直接 a + b

// ❌ 简单拼接：每次都新建字符串没区别
const name = useMemo(() => first + ' ' + last, [first, last]);

// ❌ 简单函数：没传给 memo 子组件或 effect
const handleClick = useCallback(() => setCount(c => c + 1), []);
// 这种场景下 useCallback 几乎没用，可以直接写
\`\`\`

判断标准：**这个值/函数会被用在 memo 子组件的 props、或 useEffect 依赖里吗？** 不会就别包。

## 50.7 bailout 失败的常见原因

用了 memo + useMemo/useCallback，子组件还是重渲染？常见原因：

### 1. children 是新 JSX

\`\`\`tsx
// ❌ children 是新对象，每次都新建
<MemoComp>
  <Child />  {/* 这里的 <Child /> 每次都是新元素 */}
</MemoComp>

// ✅ 把 children 提到外面，或让 MemoComp 不依赖 children
\`\`\`

### 2. 依赖数组不稳定

\`\`\`tsx
// ❌ deps 里放了对象，每次都是新引用
const value = useMemo(() => a + b.x, [a, b]);  // b 不稳定就白搭

// ✅ 用具体字段
const value = useMemo(() => a + b.x, [a, b.x]);
\`\`\`

### 3. 传了非 memo 的组件作为 props

\`\`\`tsx
// ❌ Comp 没 memo，传给父也没用
<MemoParent child={<Comp />} />  // <Comp /> 每次都是新元素
\`\`\`

### 4. context 变化

\`\`\`tsx
// 即使组件 memo 了，只要 useContext 读的 context 变了，组件还是会重渲染
const theme = useContext(ThemeContext);  // context 变 → 组件渲染
\`\`\`

\`React.memo\` 拦不住 context 变化——这是 React 故意的设计。

## 50.8 useMemo 的其他用途

除了稳定引用，useMemo 还能缓存**昂贵计算**：

\`\`\`tsx
function Comp({ data }) {
  // 排序一个大数组，开销大
  const sorted = useMemo(() => {
    return [...data].sort((a, b) => a.id - b.id);
  }, [data]);

  return <List items={sorted} />;
}
\`\`\`

判断要不要 useMemo：**这个计算的开销 > useMemo 自己的开销吗？** 大多数简单计算不需要。

## 50.9 useRef 也能稳定引用

如果值**永远不变**，用 useRef 比 useMemo 更直接：

\`\`\`tsx
// useMemo 版
const handler = useMemo(() => createHandler(), []);

// useRef 版（更明确表达"永远不变"）
const handlerRef = useRef(createHandler());
const handler = handlerRef.current;
\`\`\`

## 50.10 小结

- 本质都是"缓存"：useMemo 缓存值，useCallback 缓存函数
- 两个核心用途：避免子组件重渲染 + 避免 effect 反复触发
- 依赖数组：用到什么就放什么，开 ESLint 检查
- 不要无脑用：简单计算、没传给 memo 子组件/effect 依赖就别包
- bailout 失败：children 是新 JSX、依赖数组不稳定、context 变化
- 永远不变的值用 useRef 更合适
`,
    code: `// =============================================================
// 第 50 章 demo：useMemo 与 useCallback
// 模拟缓存机制、对比有无优化的重渲染、bailout 失败场景
// =============================================================

// ---- 渲染计数 ----
const renderCounts = {};
function markRender(name) {
  renderCounts[name] = (renderCounts[name] || 0) + 1;
}

// ---- 模拟 useMemo / useCallback ----
// 用一个全局栈模拟 hook 调用顺序
let hookIndex = 0;
const hookStates = [];

function useMemo(factory, deps) {
  const i = hookIndex++;
  const last = hookStates[i];
  // 没缓存 或 deps 变了 → 重新计算
  if (!last || !deps.every((d, idx) => Object.is(d, last.deps[idx]))) {
    const value = factory();
    hookStates[i] = { value, deps };
    return value;
  }
  return last.value;
}

function useCallback(fn, deps) {
  // useCallback 是 useMemo 的语法糖
  return useMemo(() => fn, deps);
}

// 模拟 memo
function memo(Component) {
  let lastProps = null;
  let lastResult = null;
  return function Memoized(props) {
    if (lastProps && shallowEqual(lastProps, props)) {
      return { _memoized: true, result: lastResult };
    }
    lastProps = props;
    lastResult = Component(props);
    return lastResult;
  };
}

function shallowEqual(prev, next) {
  const pk = Object.keys(prev);
  const nk = Object.keys(next);
  if (pk.length !== nk.length) return false;
  return pk.every(k => Object.is(prev[k], next[k]));
}

// 重置 hook（每次渲染前调用）
function resetHooks() { hookIndex = 0; }

function h(type, props) { return { type, props: props || {} }; }
function render(vnode) {
  if (vnode == null || vnode === false) return '';
  if (typeof vnode === 'string' || typeof vnode === 'number') return String(vnode);
  if (vnode._memoized) return render(vnode.result);
  if (typeof vnode.type === 'function') {
    resetHooks();
    return render(vnode.type(vnode.props));
  }
  return '<' + vnode.type + '>';
}

// ---- 1. 不用 useCallback：函数每次新建 ----
console.log('=== 1. 不用 useCallback ===');

const Child1 = memo(function Child1(props) {
  markRender('Child1');
  return h('div', null, 'child1');
});

function Parent1(props) {
  markRender('Parent1');
  // 每次渲染都新建函数
  const onClick = () => {};
  return h(Child1, { onClick });
}

render(h(Parent1, {}));
render(h(Parent1, {}));
console.log('  Parent1 渲染:', renderCounts.Parent1, ' Child1 渲染:', renderCounts.Child1);
console.log('  → onClick 每次新引用，memo 失效，子组件跟着渲染');

// ---- 2. 用 useCallback：函数引用稳定 ----
console.log('\\n=== 2. 用 useCallback ===');

renderCounts.Parent2 = 0;
renderCounts.Child2 = 0;
const Child2 = memo(function Child2(props) {
  markRender('Child2');
  return h('div', null, 'child2');
});

function Parent2(props) {
  markRender('Parent2');
  // useCallback 稳定引用
  const onClick = useCallback(() => {}, []);
  return h(Child2, { onClick });
}

render(h(Parent2, {}));
render(h(Parent2, {}));
console.log('  Parent2 渲染:', renderCounts.Parent2, ' Child2 渲染:', renderCounts.Child2);
console.log('  → onClick 引用稳定，子组件跳过渲染');

// ---- 3. useMemo 缓存昂贵计算 ----
console.log('\\n=== 3. useMemo 缓存计算 ===');

let computeCount = 0;

function ExpensiveComp(props) {
  // 模拟昂贵计算：用 useMemo 缓存
  const sorted = useMemo(() => {
    computeCount++;
    return [...props.data].sort();
  }, [props.data]);
  return h('div', null, 'sorted: ' + sorted.join(','));
}

render(h(ExpensiveComp, { data: [3, 1, 2] }));
render(h(ExpensiveComp, { data: [3, 1, 2] }));  // data 引用相同，跳过
console.log('  渲染两次，计算执行次数:', computeCount, '→ 引用相同，跳过计算');

// 但如果 data 每次都是新数组
computeCount = 0;
render(h(ExpensiveComp, { data: [3, 1, 2] }));
render(h(ExpensiveComp, { data: [3, 1, 2] }));  // 新引用，重新计算
console.log('  data 新引用，计算执行次数:', computeCount, '→ 引用变了，重新计算');

// ---- 4. useMemo 稳定对象引用 ----
console.log('\\n=== 4. useMemo 稳定对象 ===');

renderCounts.Child4 = 0;
const Child4 = memo(function Child4(props) {
  markRender('Child4');
  return h('div', null, 'config.a=' + props.config.a);
});

function Parent4(props) {
  markRender('Parent4');
  // 不用 useMemo：每次新对象
  // const config = { a: 1 };
  // 用 useMemo：引用稳定
  const config = useMemo(() => ({ a: 1 }), []);
  return h(Child4, { config });
}

render(h(Parent4, {}));
render(h(Parent4, {}));
console.log('  Parent4 渲染:', renderCounts.Parent4, ' Child4 渲染:', renderCounts.Child4);
console.log('  → config 引用稳定，子组件跳过');

// ---- 5. bailout 失败：children 是新 JSX ----
console.log('\\n=== 5. bailout 失败：children 新 JSX ===');

renderCounts.Child5 = 0;
const Child5 = memo(function Child5(props) {
  markRender('Child5');
  return h('div', null, 'child + ' + (props.children ? 'has children' : 'no children'));
});

function Parent5(props) {
  markRender('Parent5');
  // 每次都新建 children JSX
  return h(Child5, { children: h('span', null, 'inner') });
}

render(h(Parent5, {}));
render(h(Parent5, {}));
console.log('  Parent5 渲染:', renderCounts.Parent5, ' Child5 渲染:', renderCounts.Child5);
console.log('  → children 是新对象，memo 失效');

// ---- 6. 依赖数组的正确填法 ----
console.log('\\n=== 6. 依赖数组填法 ===');

function DepsDemo(props) {
  // ✅ 正确：用到 a, b 就都放
  const sum = useMemo(() => props.a + props.b, [props.a, props.b]);
  return h('div', null, 'sum=' + sum);
}

console.log('  正确：用到 a, b，依赖 [a, b]');
console.log('  ❌ 漏依赖：[a] → 用了旧 b（闭包陷阱）');
console.log('  ❌ 多余依赖：[a, b, c] → c 变也重算');
console.log('  → 开 ESLint react-hooks/exhaustive-deps 自动检查');

// ---- 7. useRef 稳定引用 ----
console.log('\\n=== 7. useRef 替代 useMemo ===');

let useRefCount = 0;
function useRef(initial) {
  // 简化：永远只初始化一次
  if (!useRef._value) useRef._value = { current: initial() };
  return useRef._value;
}

const stableHandler = useRef(() => { useRefCount++; });
console.log('  useRef 引用稳定：', stableHandler.current === stableHandler.current);
console.log('  适合"永远不变"的值，比 useMemo([]) 语义更明确');

// ---- 关键要点总结 ----
console.log('\\n=== useMemo / useCallback 核心要点 ===');
console.log('1. 本质都是缓存：useMemo 缓存值，useCallback 缓存函数');
console.log('2. 用途 1：传给 memo 子组件，避免无效重渲染');
console.log('3. 用途 2：作为 useEffect 依赖，避免 effect 反复触发');
console.log('4. 依赖数组：用到什么放什么，开 ESLint');
console.log('5. 不要无脑用：简单计算、没传给 memo/effect 就别包');
console.log('6. bailout 失败：children 新 JSX、依赖不稳定、context 变化');
console.log('7. 永远不变的值用 useRef 更合适');
`,
  },

  // =========================================================
  // 第五十一章：React.lazy 与代码分割
  // =========================================================
  {
    id: "tspro-lazy",
    group: "八、React 性能优化",
    icon: "📦",
    title: "React.lazy 与代码分割",
    content: `# 第五十一章：React.lazy 与代码分割

## 51.1 为什么需要代码分割

默认打包方式：所有 JS 打成一个 bundle。问题：

- 单页应用变大后，bundle 几 MB，**首屏加载慢**
- 用户访问首页，却下载了"个人中心""设置页"的代码——**浪费带宽**
- 改一行代码，整个 bundle 缓存失效——**缓存命中率低**

代码分割（Code Splitting）就是**把 bundle 拆成多个 chunk，按需加载**。

\`\`\`tsx
// 传统：所有代码打包在一起
import HeavyChart from './HeavyChart';  // 即使用户没看图表，也下载了

// 分割：用的时候才下载
const HeavyChart = lazy(() => import('./HeavyChart'));  // 首次渲染才下载
\`\`\`

## 51.2 React.lazy 是什么

\`React.lazy\` 是一个函数，接收一个返回 \`Promise<{ default: Component }>\` 的函数，返回一个"懒加载组件"。

\`\`\`tsx
import { lazy } from 'react';

const Settings = lazy(() => import('./Settings'));

function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <Settings />
    </Suspense>
  );
}
\`\`\`

- 首次渲染 \`<Settings />\` 时，\`import()\` 才执行，开始下载 chunk
- chunk 下载期间，组件"挂起"，Suspense 显示 fallback
- 下载完成后，组件就绪，Suspense 显示真实内容

## 51.3 Suspense + lazy 配合

\`lazy\` 组件**必须**配合 \`Suspense\` 使用，否则会报错：

\`\`\`tsx
// ❌ 没包 Suspense，首次渲染会抛错
const Comp = lazy(() => import('./Comp'));
<Comp />  // Error: A component suspended while responding to synchronous input

// ✅ 用 Suspense 包裹
<Suspense fallback={<Spinner />}>
  <Comp />
</Suspense>
\`\`\`

\`fallback\` 可以是任意 ReactNode：Spinner、Skeleton、文字、甚至 null。

## 51.4 lazy 的 TS 类型

\`\`\`tsx
// lazy 的签名
function lazy<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>
): LazyExoticComponent<T>;

// 用法 1：自动推断
const Comp = lazy(() => import('./Comp'));  // 类型从 default 推断

// 用法 2：显式指定
type CompProps = { title: string };
const Comp = lazy<React.ComponentType<CompProps>>(
  () => import('./Comp')
);
\`\`\`

注意：\`import()\` 返回的类型是 \`Promise<typeof module>\`，其中 \`default\` 是默认导出的组件。\`lazy\` 会自动从 \`default\` 取出来。

## 51.5 命名导出的处理

\`React.lazy\` 只支持默认导出（\`default\`）。如果组件是命名导出，要手动改写：

\`\`\`tsx
// NamedComp.ts
export function NamedComp() { /* ... */ }

// ❌ lazy 不识别命名导出
const Comp = lazy(() => import('./NamedComp'));  // default 是 undefined

// ✅ 手动包成 default
const Comp = lazy(() =>
  import('./NamedComp').then(mod => ({ default: mod.NamedComp }))
);
\`\`\`

## 51.6 嵌套 Suspense

多层 \`Suspense\` 让加载状态"局部化"：

\`\`\`tsx
<Suspense fallback={<PageLoader />}>
  <Header />  {/* 立即可见 */}
  <Suspense fallback={<MainLoader />}>
    <Main />  {/* Main 加载时，Header 还在 */}
  </Suspense>
  <Suspense fallback={<SidebarLoader />}>
    <Sidebar />
  </Suspense>
</Suspense>
\`\`\`

效果：Header 立即显示，Main 加载完才替换 MainLoader，互不影响。

## 51.7 按路由分割

最常见的代码分割方式：**每个路由组件懒加载**。

\`\`\`tsx
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const User = lazy(() => import('./pages/User'));

function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/user" element={<User />} />
      </Routes>
    </Suspense>
  );
}
\`\`\`

效果：用户访问 \`/\` 时只下载 Home 的 chunk，访问 \`/about\` 时才下载 About 的 chunk。

Next.js 等框架默认按路由分割，不需要手动 lazy。

## 51.8 错误处理

chunk 下载可能失败（网络问题、部署后旧链接失效），需要错误边界兜底：

\`\`\`tsx
<ErrorBoundary fallback={<div>加载失败，请刷新</div>}>
  <Suspense fallback={<Spinner />}>
    <LazyComp />
  </Suspense>
</ErrorBoundary>
\`\`\`

经典组合：\`ErrorBoundary\`（外）+ \`Suspense\`（内），加载中显示 spinner，失败显示 fallback。

\`\`\`tsx
// 封装一个 AsyncBoundary
function AsyncBoundary({ children, fallback, errorFallback }) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}

// 使用
<AsyncBoundary fallback={<Spinner />} errorFallback={<ErrorView />}>
  <LazyComp />
</AsyncBoundary>
\`\`\`

## 51.9 预加载（preload）

为了避免用户点击后才下载，可以**提前触发 import**：

\`\`\`tsx
// 鼠标 hover 时预加载
const Settings = lazy(() => import('./Settings'));

function NavItem() {
  return (
    <Link
      to="/settings"
      onMouseEnter={() => import('./Settings')}  // 预加载
    >
      设置
    </Link>
  );
}
\`\`\`

这样用户点击时，chunk 已经在下载或下载完了，体验更顺滑。

## 51.10 实际项目用法

- **路由级**：每个路由组件 lazy
- **大依赖**：图表库（echarts）、编辑器（monaco）按需加载
- **条件渲染**：弹窗里的复杂表单按需加载
- **预加载**：hover / idle 时预下载可能用到的 chunk

\`\`\`tsx
// 大依赖示例
const Editor = lazy(() => import('monaco-editor-react'));

function CodePage() {
  const [showEditor, setShowEditor] = useState(false);
  return (
    <div>
      <button onClick={() => setShowEditor(true)}>打开编辑器</button>
      {showEditor && (
        <Suspense fallback={<div>编辑器加载中...</div>}>
          <Editor />
        </Suspense>
      )}
    </div>
  );
}
\`\`\`

## 51.11 小结

- \`React.lazy\` 实现按需加载，首屏只下载必要代码
- 必须配合 \`Suspense\` 使用，挂起时显示 fallback
- TS 类型自动推断，命名导出要手动改写
- 嵌套 Suspense 让加载状态局部化
- 按路由分割是最常见的用法
- 配合错误边界处理加载失败
- hover / idle 预加载提升体验
`,
    code: `// =============================================================
// 第 51 章 demo：React.lazy 与代码分割
// 模拟 lazy 实现、Suspense、嵌套、错误处理、预加载
// =============================================================

// ---- 模拟 chunk 加载 ----
// 模拟一个 module registry：每个 import() 返回一个 chunk
const chunkRegistry = {
  './Settings': { default: function Settings(props) { return { type: 'div', props: {}, children: ['设置页：用户=' + (props.user || 'guest')] }; } },
  './Chart': { default: function Chart(props) { return { type: 'div', props: {}, children: ['图表：数据=' + JSON.stringify(props.data)] }; } },
  './Editor': { default: function Editor(props) { return { type: 'div', props: {}, children: ['富文本编辑器：value=' + props.value] }; } },
};

// 模拟 import()：异步加载
function fakeImport(path) {
  console.log('  [import] 开始下载 chunk: ' + path);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (chunkRegistry[path]) {
        console.log('  [import] chunk 下载完成: ' + path);
        resolve(chunkRegistry[path]);
      } else {
        reject(new Error('chunk 不存在: ' + path));
      }
    }, 20);
  });
}

function h(type, props, ...children) {
  // 把 children 同时挂到 props 上，模拟 React 行为
  const merged = Object.assign({}, props || {});
  if (children.length === 1) merged.children = children[0];
  else if (children.length > 1) merged.children = children;
  return { type, props: merged, children };
}

// ---- 模拟 lazy ----
function lazy(loader) {
  let cached = null;
  let promise = null;
  function LazyComponent(props) {
    if (cached) {
      // 已加载：调用真实组件
      return cached(props);
    }
    if (!promise) {
      // 触发加载
      promise = loader();
      promise.then(mod => {
        cached = mod.default;
        promise = null;
      }).catch(() => {
        // 加载失败：标记
        cached = null;
        promise = null;
      });
    }
    // 抛 Promise，让 Suspense 捕获
    throw promise;
  }
  LazyComponent._isLazy = true;
  LazyComponent._displayName = 'lazy';
  return LazyComponent;
}

// ---- 模拟 Suspense ----
function render(vnode, depth) {
  depth = depth || 0;
  // 处理数组（嵌套 children）
  if (Array.isArray(vnode)) {
    return vnode.map(v => render(v, depth)).join('');
  }
  if (vnode == null || vnode === false) return '';
  if (typeof vnode === 'string' || typeof vnode === 'number') return String(vnode);
  if (typeof vnode.type === 'function') {
    try {
      const result = vnode.type(vnode.props);
      return render(result, depth);
    } catch (e) {
      // 抛 Promise：挂起，向上抛给 Suspense
      throw e;
    }
  }
  if (vnode.type === 'Suspense') {
    try {
      // 注意：children 在 vnode.children，不是 vnode.props.children
      const inner = (vnode.children || []).map(c => render(c, depth + 1)).join('');
      return '<div class=suspense>' + inner + '</div>';
    } catch (promise) {
      if (promise && promise.then) {
        return '<div class=fallback>' + render(vnode.props.fallback) + '</div>';
      }
      throw promise;
    }
  }
  const inner = (vnode.children || []).map(c => render(c, depth + 1)).join('');
  return '<' + vnode.type + '>' + inner + '</' + vnode.type + '>';
}

// ---- 1. lazy + Suspense 基础 ----
console.log('=== 1. lazy + Suspense ===');

const LazySettings = lazy(() => fakeImport('./Settings'));

const tree1 = h('Suspense', {
  fallback: h('div', null, '⏳ 设置加载中...')
}, h(LazySettings, { user: 'Tom' }));

console.log('  首次渲染（挂起）：');
console.log('  ', render(tree1));

// 等 chunk 下载完
setTimeout(() => {
  console.log('\\n  chunk 加载完后渲染：');
  console.log('  ', render(tree1));
}, 30);

// ---- 2. 没包 Suspense 抛错 ----
console.log('\\n=== 2. 没包 Suspense 抛错 ===');

const LazyNoSuspense = lazy(() => fakeImport('./Chart'));
try {
  render(h(LazyNoSuspense, { data: [1, 2, 3] }));
} catch (e) {
  console.log('  抛错：', e.then ? 'Promise（需 Suspense 兜底）' : e.message);
}

// ---- 3. 嵌套 Suspense ----
console.log('\\n=== 3. 嵌套 Suspense ===');

const LazyChart = lazy(() => fakeImport('./Chart'));
const LazyEditor = lazy(() => fakeImport('./Editor'));

function Header() { return h('header', null, 'Header 立即可见'); }

const nested = h('Suspense', {
  fallback: h('div', null, '页面加载中')
}, [
  h(Header, {}),
  h('Suspense', { fallback: h('div', null, '图表加载中') }, h(LazyChart, { data: [1, 2] })),
  h('Suspense', { fallback: h('div', null, '编辑器加载中') }, h(LazyEditor, { value: 'hello' }))
]);

console.log('  首次渲染（Header 立即，其余 fallback）：');
console.log('  ', render(nested).replace(/></g, '>\\n  <'));

setTimeout(() => {
  console.log('\\n  所有 chunk 加载完：');
  console.log('  ', render(nested).replace(/></g, '>\\n  <'));
}, 40);

// ---- 4. 错误处理 ----
console.log('\\n=== 4. 错误处理 ===');

// 模拟错误边界
function ErrorBoundary(props) {
  try {
    const inner = render(props.children);
    return h('div', null, inner);
  } catch (e) {
    if (e && e.then) throw e;  // Promise 还是抛给上层
    return h('div', null, '❌ ' + (props.fallback || '加载失败'));
  }
}

// lazy 一个不存在的 chunk
const LazyFail = lazy(() => fakeImport('./NotExist'));

const treeWithError = h(ErrorBoundary, {
  fallback: '加载失败，请刷新页面'
}, h('Suspense', {
  fallback: h('div', null, '加载中...')
}, h(LazyFail, {})));

console.log('  首次渲染（挂起，显示 fallback）：');
console.log('  ', render(treeWithError));

setTimeout(() => {
  console.log('\\n  加载失败后：');
  console.log('  ', render(treeWithError));
}, 40);

// ---- 5. 命名导出处理 ----
console.log('\\n=== 5. 命名导出处理 ===');

// 模拟命名导出的模块
const namedMod = { NamedComp: function NamedComp(props) { return h('div', null, 'named: ' + props.value); } };
function importNamed() {
  return Promise.resolve(namedMod);
}

// ❌ 直接 lazy：default 是 undefined
const LazyBad = lazy(() => importNamed());

// ✅ 手动改写：把命名导出包成 default
const LazyGood = lazy(() => importNamed().then(mod => ({ default: mod.NamedComp })));

console.log('  ❌ 直接 lazy(() => import("./Named")) → default 是 undefined');
console.log('  ✅ lazy(() => import("./Named").then(m => ({ default: m.NamedComp })))');

// ---- 6. 预加载 ----
console.log('\\n=== 6. 预加载 ===');

const LazyPreload = lazy(() => fakeImport('./Editor'));

// 模拟用户 hover 时预加载
console.log('  用户 hover 触发预加载：');
fakeImport('./Editor');  // 提前下载

setTimeout(() => {
  console.log('  用户点击后渲染（chunk 已下载）：');
  const t = h('Suspense', { fallback: '加载中' }, h(LazyPreload, { value: 'preload' }));
  console.log('  ', render(t));
}, 30);

// ---- 7. 按路由分割示例 ----
console.log('\\n=== 7. 按路由分割 ===');

const routes = {
  '/': { component: lazy(() => fakeImport('./Settings')), props: { user: 'home' } },
  '/about': { component: lazy(() => fakeImport('./Chart')), props: { data: [1, 2] } },
};

function Router({ path }) {
  const route = routes[path];
  if (!route) return h('div', null, '404');
  const Comp = route.component;
  return h('Suspense', { fallback: h('div', null, '路由加载中') }, h(Comp, route.props));
}

console.log('  访问 / ：');
console.log('  ', render(h(Router, { path: '/' })));

setTimeout(() => {
  console.log('\\n  访问 /about ：');
  console.log('  ', render(h(Router, { path: '/about' })));
}, 40);

// ---- 关键要点总结 ----
setTimeout(() => {
  console.log('\\n=== React.lazy 核心要点 ===');
  console.log('1. lazy 实现按需加载，首屏只下载必要代码');
  console.log('2. 必须配合 Suspense，挂起时显示 fallback');
  console.log('3. TS 类型自动推断，命名导出要手动改写');
  console.log('4. 嵌套 Suspense 让加载状态局部化');
  console.log('5. 按路由分割是最常见的用法');
  console.log('6. 配合错误边界处理加载失败');
  console.log('7. hover / idle 预加载提升体验');
}, 80);
`,
  },

  // =========================================================
  // 第五十二章：Profiler 性能分析
  // =========================================================
  {
    id: "tspro-profiler",
    group: "八、React 性能优化",
    icon: "📊",
    title: "Profiler 性能分析",
    content: `# 第五十二章：Profiler 性能分析

## 52.1 为什么需要 Profiler

写代码时很难一眼看出哪里慢：

- 这个组件渲染要多久？
- 父组件渲染时哪些子组件跟着渲染了？
- 这次 state 更新触发了多少次渲染？
- memo 用了之后真的有效果吗？

凭感觉猜性能问题是不可靠的。**Profiler 就是给你"X 光"**——精确告诉你每个组件渲染了多久、为什么渲染。

## 52.2 React.Profiler API

React 提供了 \`<Profiler>\` 组件，用于测量子树的渲染耗时：

\`\`\`tsx
import { Profiler } from 'react';

function App() {
  return (
    <Profiler id="app" onRender={(id, phase, actualDuration) => {
      console.log(id, phase, actualDuration);
    }}>
      <YourTree />
    </Profiler>
  );
}
\`\`\`

\`Profiler\` 接收两个 props：

- \`id\`：字符串，标识这棵子树（用于多个 Profiler 区分）
- \`onRender\`：回调函数，每次子树渲染时调用

## 52.3 onRender 回调参数

\`onRender\` 会拿到很多信息：

\`\`\`tsx
function onRender(
  id: string,              // Profiler 的 id
  phase: 'mount' | 'update' | 'nested-update',  // 渲染阶段
  actualDuration: number,  // 本次渲染实际耗时（ms）
  baseDuration: number,    // 不 memo 时的理论耗时
  startTime: number,       // 开始时间
  commitTime: number,      // 提交时间
  interactions: Set        // 触发本次渲染的交互
) {
  console.log({ id, phase, actualDuration, baseDuration });
}
\`\`\`

## 52.4 phase：mount / update / nested-update

\`phase\` 表示这次渲染的类型：

| phase | 含义 |
|-------|------|
| \`mount\` | 组件首次挂载 |
| \`update\` | state/props 变化触发更新 |
| \`nested-update\` | 嵌套 Profiler 触发的更新 |

\`\`\`tsx
onRender={(id, phase, actualDuration) => {
  if (phase === 'mount') {
    console.log('首次挂载耗时：', actualDuration);
  } else if (phase === 'update') {
    console.log('更新耗时：', actualDuration);
  }
}}
\`\`\`

## 52.5 actualDuration vs baseDuration

两个时间指标容易混淆：

- \`actualDuration\`：**本次渲染实际耗时**，如果子组件 memo 命中跳过，这部分不计入
- \`baseDuration\`：**理论耗时**，假设没有任何 memo 优化，整棵子树重新渲染要多久

\`\`\`tsx
onRender={(id, phase, actualDuration, baseDuration) => {
  console.log('实际：', actualDuration, '理论：', baseDuration);
  // 如果 actualDuration << baseDuration，说明 memo 生效了
  // 如果 actualDuration ≈ baseDuration，说明 memo 没用或失效
}}
\`\`\`

通过对比这两个值，可以判断 memo 优化是否真的有效。

## 52.6 什么时候用 Profiler

- **排查卡顿**：用户反馈"操作卡"，用 Profiler 找出最慢的组件
- **验证优化**：加了 memo / useMemo 后，看 actualDuration 是否真的降了
- **监控性能**：上报到监控系统，跟踪性能趋势
- **比较实现**：两种写法哪个快，用 Profiler 量化

## 52.7 用 React DevTools Profiler

生产代码里手写 \`<Profiler>\` 比较繁琐。**React DevTools** 提供了图形化的 Profiler：

1. 装浏览器插件 React DevTools
2. 打开 DevTools 的 "Profiler" 标签
3. 点录制 → 操作页面 → 停止
4. 看 flamegraph（火焰图）：每个组件的渲染时间一目了然

DevTools Profiler 不需要改代码，是排查性能问题的首选工具。

## 52.8 常见性能瓶颈

Profiler 用多了会发现几个典型瓶颈：

### 1. 大列表渲染

\`\`\`tsx
// 渲染 10000 条数据，每条都是组件
{items.map(item => <Item key={item.id} data={item} />)}  // 慢
\`\`\`

优化：虚拟列表（react-window / react-virtualized），只渲染可见部分。

### 2. 内联函数 / 对象

\`\`\`tsx
// 每次渲染都新建，memo 子组件失效
<Comp onClick={() => {}} config={{ a: 1 }} />
\`\`\`

优化：useCallback + useMemo。

### 3. context 频繁变化

\`\`\`tsx
// 全局 theme context 变化，所有 useContext 都重渲染
const theme = useContext(ThemeContext);
\`\`\`

优化：拆分 context，把变化频繁和变化不频繁的分开。

### 4. 不必要的 state

\`\`\`tsx
// 把不影响渲染的数据放进了 state
const [refValue, setRefValue] = useState(null);  // 应该用 useRef
\`\`\`

优化：不影响渲染的值用 useRef。

### 5. 重计算

\`\`\`tsx
// 每次渲染都重新排序 10000 条
const sorted = [...data].sort(/* ... */);
\`\`\`

优化：useMemo 缓存。

## 52.9 Profiler 的开销

\`<Profiler>\` 本身有性能开销，**生产环境默认关闭**。需要在构建时显式开启：

\`\`\`tsx
// webpack / vite 配置
// __REACT_DEVTOOLS_GLOBAL_HOOK__ 之类的标记
// 或用 react-dom/profiling 替代 react-dom
\`\`\`

不要在生产环境无脑开 Profiler，只在需要性能监控时开启。

## 52.10 实战示例

\`\`\`tsx
function MeasureAll() {
  return (
    <Profiler id="app" onRender={(id, phase, actual, base) => {
      if (actual > 16) {  // 超过一帧
        console.warn('[' + id + '] ' + phase + ' 渲染慢：' + actual + 'ms');
      }
    }}>
      <Header />
      <Profiler id="main" onRender={onMainRender}>
        <Main />
      </Profiler>
      <Footer />
    </Profiler>
  );
}
\`\`\`

嵌套 Profiler：外层测整个 app，内层测关键模块，定位瓶颈到具体组件。

## 52.11 小结

- \`<Profiler>\` 测量子树渲染耗时，通过 \`onRender\` 回调拿数据
- \`phase\` 区分 mount / update / nested-update
- \`actualDuration\` vs \`baseDuration\`：实际耗时 vs 理论耗时，对比判断 memo 效果
- 排查性能问题首选 React DevTools Profiler（图形化、不改代码）
- 常见瓶颈：大列表、内联函数、频繁变化的 context、不必要的 state、重计算
- 生产环境开 Profiler 有开销，按需启用
`,
    code: `// =============================================================
// 第 52 章 demo：Profiler 性能分析
// 模拟 React.Profiler + onRender 回调、actualDuration vs baseDuration
// =============================================================

// ---- 模拟 React.Profiler ----
// 全局渲染记录
const profilerLog = [];

function Profiler(props) {
  // 模拟：渲染子树，记录耗时
  const start = Date.now();
  // 真实场景下，子树渲染会做工作
  let result;
  try {
    result = props.children;
  } finally {
    const actualDuration = Date.now() - start;
    // baseDuration 模拟：如果没有 memo，整棵子树重新渲染要多久
    const baseDuration = actualDuration + (props._memoSaved || 0);

    // 调用 onRender 回调
    if (props.onRender) {
      props.onRender(
        props.id,             // id
        props._phase || 'update',  // phase
        actualDuration,       // actualDuration
        baseDuration,         // baseDuration
        start,                // startTime
        Date.now(),           // commitTime
        new Set()             // interactions
      );
    }
  }
  return result;
}

function h(type, props, ...children) {
  // 把 children 同时挂到 props 上，模拟 React 行为
  const merged = Object.assign({}, props || {});
  if (children.length === 1) merged.children = children[0];
  else if (children.length > 1) merged.children = children;
  return { type, props: merged, children };
}

function render(vnode) {
  // 处理数组（嵌套 children）
  if (Array.isArray(vnode)) {
    return vnode.map(render).join('');
  }
  if (vnode == null || vnode === false) return '';
  if (typeof vnode === 'string' || typeof vnode === 'number') return String(vnode);
  if (typeof vnode.type === 'function') {
    return render(vnode.type(vnode.props));
  }
  if (vnode.type === 'Profiler') {
    // 特殊处理 Profiler
    const start = Date.now();
    let result;
    try {
      result = (vnode.props.children || []).map(render).join('');
    } finally {
      const actual = Date.now() - start;
      const base = actual + (vnode.props._memoSaved || 0);
      if (vnode.props.onRender) {
        vnode.props.onRender(
          vnode.props.id,
          vnode.props._phase || 'mount',
          actual,
          base,
          start,
          Date.now(),
          new Set()
        );
      }
    }
    return result;
  }
  const inner = (vnode.children || []).map(render).join('');
  return '<' + vnode.type + '>' + inner + '</' + vnode.type + '>';
}

// ---- 1. 基础用法：onRender 回调 ----
console.log('=== 1. 基础用法 ===');

function SlowComponent(props) {
  // 模拟一个渲染慢的组件
  let sum = 0;
  for (let i = 0; i < 1000000; i++) sum += i;
  return h('div', null, 'slow: ' + sum.toString().slice(0, 5));
}

const tree1 = h(Profiler, {
  id: 'app',
  _phase: 'mount',
  onRender: (id, phase, actual, base) => {
    console.log('  [onRender] id=' + id + ' phase=' + phase + ' actual=' + actual + 'ms base=' + base + 'ms');
  }
}, h(SlowComponent, {}));

console.log('  渲染结果：', render(tree1).slice(0, 50));

// ---- 2. phase 区分 mount 和 update ----
console.log('\\n=== 2. phase 区分 ===');

const phases = [];
function App2() {
  return h(Profiler, {
    id: 'app2',
    _phase: 'mount',
    onRender: (id, phase) => phases.push(phase)
  }, h('div', null, 'hello'));
}

render(h(App2, {}));
// 模拟更新
phases.length = 0;
const tree2 = h(Profiler, {
  id: 'app2',
  _phase: 'update',
  onRender: (id, phase) => phases.push(phase)
}, h('div', null, 'hello updated'));

render(tree2);

console.log('  phases:', phases.join(' → '));

// ---- 3. actualDuration vs baseDuration ----
console.log('\\n=== 3. actualDuration vs baseDuration ===');

// 模拟：使用 memo 节省了 10ms
const tree3 = h(Profiler, {
  id: 'memo-on',
  _phase: 'update',
  _memoSaved: 10,  // 模拟 memo 节省的耗时
  onRender: (id, phase, actual, base) => {
    console.log('  [memo 生效] actual=' + actual + 'ms base=' + base + 'ms → 节省 ' + (base - actual) + 'ms');
  }
}, h('div', null, 'memo 命中'));

render(tree3);

const tree4 = h(Profiler, {
  id: 'memo-off',
  _phase: 'update',
  _memoSaved: 0,  // memo 失效
  onRender: (id, phase, actual, base) => {
    console.log('  [memo 失效] actual=' + actual + 'ms base=' + base + 'ms → 没节省');
  }
}, h('div', null, 'memo 没用'));

render(tree4);

// ---- 4. 嵌套 Profiler ----
console.log('\\n=== 4. 嵌套 Profiler ===');

const nestedLog = [];
function NestedApp() {
  return h(Profiler, {
    id: 'outer',
    _phase: 'mount',
    onRender: (id, phase, actual) => nestedLog.push({ id, phase, actual, level: 'outer' })
  }, [
    h(Profiler, {
      id: 'header',
      _phase: 'mount',
      onRender: (id, phase, actual) => nestedLog.push({ id, phase, actual, level: 'inner' })
    }, h('header', null, 'Header')),
    h(Profiler, {
      id: 'main',
      _phase: 'mount',
      onRender: (id, phase, actual) => nestedLog.push({ id, phase, actual, level: 'inner' })
    }, h('main', null, 'Main'))
  ]);
}

render(h(NestedApp, {}));
console.log('  嵌套 Profiler 记录：');
nestedLog.forEach(l => {
  console.log('    id=' + l.id + ' phase=' + l.phase + ' actual=' + l.actual + 'ms (' + l.level + ')');
});

// ---- 5. 监控慢渲染 ----
console.log('\\n=== 5. 监控慢渲染（>16ms）===');

const slowThreshold = 16;
function onSlowRender(id, phase, actual) {
  if (actual > slowThreshold) {
    console.log('  ⚠️ [' + id + '] ' + phase + ' 渲染慢：' + actual + 'ms（超过 ' + slowThreshold + 'ms 阈值）');
  } else {
    console.log('  ✅ [' + id + '] ' + phase + ' 渲染正常：' + actual + 'ms');
  }
}

// 慢渲染：模拟
const slowTree = h(Profiler, {
  id: 'slow-page',
  _phase: 'mount',
  _memoSaved: 0,
  onRender: onSlowRender
}, h(SlowComponent, {}));

render(slowTree);

// 快渲染
const fastTree = h(Profiler, {
  id: 'fast-page',
  _phase: 'mount',
  _memoSaved: 0,
  onRender: onSlowRender
}, h('div', null, 'fast'));

render(fastTree);

// ---- 6. 常见瓶颈识别 ----
console.log('\\n=== 6. 常见瓶颈 ===');

console.log('  典型性能瓶颈：');
console.log('  1. 大列表渲染（10000 条）→ 用虚拟列表');
console.log('  2. 内联函数/对象 → memo 失效，用 useCallback/useMemo');
console.log('  3. context 频繁变化 → 拆分 context');
console.log('  4. 不必要的 state → 用 useRef');
console.log('  5. 重计算 → 用 useMemo 缓存');

// ---- 7. DevTools Profiler 概念 ----
console.log('\\n=== 7. React DevTools Profiler ===');

console.log('  生产排查首选：React DevTools Profiler');
console.log('  1. 装浏览器插件 React DevTools');
console.log('  2. 打开 DevTools 的 Profiler 标签');
console.log('  3. 点录制 → 操作页面 → 停止');
console.log('  4. 看 flamegraph（火焰图）：每个组件渲染时间');
console.log('  → 不需要改代码，排查问题首选');

// ---- 关键要点总结 ----
console.log('\\n=== Profiler 核心要点 ===');
console.log('1. <Profiler> 测量子树渲染耗时，onRender 回调拿数据');
console.log('2. phase 区分 mount / update / nested-update');
console.log('3. actualDuration 是实际耗时，baseDuration 是理论耗时');
console.log('4. 对比 actual/base 判断 memo 是否有效');
console.log('5. 排查首选 React DevTools Profiler（图形化）');
console.log('6. 常见瓶颈：大列表、内联函数、频繁 context、不必要 state、重计算');
console.log('7. 生产环境开 Profiler 有开销，按需启用');
`,
  },

  // =========================================================
  // 第五十三章：StrictMode 与并发特性
  // =========================================================
  {
    id: "tspro-strict-mode",
    group: "八、React 性能优化",
    icon: "🧪",
    title: "StrictMode 与并发特性",
    content: `# 第五十三章：StrictMode 与并发特性

## 53.1 为什么需要 StrictMode

React 在迭代过程中积累了一些**容易写错的模式**：

- 在 render 里执行副作用（修改全局变量、发请求）
- effect 不清理订阅 / 定时器
- ref 在 render 阶段就被赋值

这些代码"看起来能跑"，但在 React 的并发模式下会出 bug。**StrictMode 就是一个"严格检查器"**——在开发模式下故意触发这些坑，让你提前发现。

\`\`\`tsx
import { StrictMode } from 'react';

function App() {
  return (
    <StrictMode>
      <YourApp />
    </StrictMode>
  );
}
\`\`\`

## 53.2 StrictMode 是什么

\`<StrictMode>\` 是一个**只作用于开发模式**的包装组件，**不影响生产行为**。它会：

1. 双调用 render 函数（检测副作用）
2. 双调用 effect（检测清理逻辑）
3. 检查过时的 ref API
4. 检查过时的 context API
5. 检查过时的 findDOMNode
6. 警告不安全的生命周期

\`\`\`tsx
// 双调用：开发模式下会执行两次
function Comp() {
  console.log('render');  // 打印两次
  useEffect(() => {
    console.log('effect');  // 打印两次
    return () => console.log('cleanup');  // 也打印两次
  }, []);
  return <div>hello</div>;
}
\`\`\`

## 53.3 开发模式下的双调用

### 1. render 双调用

\`\`\`tsx
function Counter() {
  console.log('render');  // 开发：打印两次；生产：打印一次
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
\`\`\`

React 故意调用两次，**检测 render 函数是否纯**：

- 如果 render 里有副作用（比如 \`count++\` 全局变量、\`Math.random()\`），两次结果会不一致 → bug
- 如果 render 是纯函数，两次调用结果一样 → 没问题

### 2. effect 双调用

\`\`\`tsx
useEffect(() => {
  const id = setInterval(() => console.log('tick'), 1000);
  // ❌ 没清理：StrictMode 下会启动两个定时器
  // ✅ 清理：
  return () => clearInterval(id);
}, []);
\`\`\`

StrictMode 会执行：mount effect → cleanup effect → 再 mount effect。如果你没正确清理，资源会泄漏 → bug。

### 3. 为什么这样设计

React 18 引入并发渲染，组件可能被**中断、暂停、重启**。意味着：

- render 函数可能被调用多次（甚至没 commit）
- effect 可能被多次 setup 和 cleanup

如果你的代码不"纯"（有副作用、不清理资源），并发模式下会出 bug。StrictMode 提前帮你发现。

## 53.4 为什么 effect 会执行两次

正常流程：

\`\`\`
mount → setup effect → update → cleanup + setup → unmount → cleanup
\`\`\`

StrictMode 流程（开发模式）：

\`\`\`
mount → setup effect → cleanup effect → setup effect（再来一次）
\`\`\`

React 故意"假装"组件被卸载又重新挂载，验证你的 effect 清理逻辑：

- 订阅 / 定时器 / 事件监听：cleanup 必须正确清理
- fetch 请求：要支持 AbortController 取消
- DOM 操作：要幂等

\`\`\`tsx
useEffect(() => {
  const controller = new AbortController();
  fetch('/api', { signal: controller.signal })
    .then(res => res.json())
    .then(setData)
    .catch(e => {
      if (e.name === 'AbortError') return;  // 忽略取消
      throw e;
    });
  return () => controller.abort();  // 清理：取消请求
}, []);
\`\`\`

## 53.5 StrictMode 不影响生产

StrictMode 的所有行为**只在开发模式生效**：

- 生产构建会自动去掉 StrictMode 的检查
- 双调用在生产模式不会发生
- 性能开销为零

所以可以放心在根组件包 StrictMode：

\`\`\`tsx
// main.tsx / index.tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
\`\`\`

## 53.6 startTransition 简介

React 18 引入并发特性，\`startTransition\` 把更新标记为**非紧急**：

\`\`\`tsx
import { startTransition } from 'react';

function Search() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);

  const onChange = (e) => {
    setInput(e.target.value);  // 紧急：立即更新输入框
    startTransition(() => {
      setResults(filter(input));  // 非紧急：可以延迟更新结果
    });
  };

  return <><input value={input} onChange={onChange} /><List items={results} /></>;
}
\`\`\`

效果：

- 输入框立即响应，不会卡顿
- 搜索结果可以延迟渲染（如果计算慢）
- React 会在空闲时更新非紧急部分

## 53.7 useTransition

\`useTransition\` 是 \`startTransition\` 的 Hook 版本，多了 \`isPending\` 状态：

\`\`\`tsx
const [isPending, startTransition] = useTransition();

const onClick = () => {
  startTransition(() => {
    setTab('heavy');  // 非紧急更新
  });
};

return <button onClick={onClick}>{isPending ? '加载中...' : '切换'}</button>;
\`\`\`

适用场景：**用户主动触发的昂贵更新**（切 tab、改 filter、搜索）。

## 53.8 useDeferredValue

\`useDeferredValue\` 让一个值"延迟更新"：

\`\`\`tsx
function Search({ query }) {
  const deferredQuery = useDeferredValue(query);
  // query 立即更新，deferredQuery 延迟更新
  const results = useMemo(() => filter(deferredQuery), [deferredQuery]);
  return <List items={results} />;
}
\`\`\`

跟 \`useTransition\` 的区别：

- \`useTransition\`：从**触发更新**的角度（事件处理器里包）
- \`useDeferredValue\`：从**消费值**的角度（接收 prop 时延迟）

两者底层都是把更新标记为非紧急，让 React 优先处理高优先级更新。

## 53.9 并发特性与性能

并发特性让 React 更聪明地调度更新：

- **优先级**：用户输入优先于数据更新
- **可中断**：渲染到一半可以暂停，处理更高优先级任务
- **批量更新**：多个 state 更新合并成一次渲染

但**不会让单次渲染变快**——它是改善"感知性能"，让用户感觉更顺滑。

## 53.10 实战建议

### 1. 开发时包 StrictMode

\`\`\`tsx
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
\`\`\`

### 2. effect 必须正确清理

\`\`\`tsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);  // 必须有
}, []);
\`\`\`

### 3. 昂贵更新用 startTransition

\`\`\`tsx
const onClick = () => startTransition(() => setTab('heavy'));
\`\`\`

### 4. 第三方库的兼容

老版本 React 第三方库可能在 StrictMode 下报错（比如 react-router v5、老版 redux）。要么升级，要么暂时去掉 StrictMode。

## 53.11 小结

- StrictMode 是开发模式的严格检查器，不影响生产
- 双调用 render 和 effect：检测副作用、检测清理逻辑
- 双调用是为了并发渲染做准备
- effect 必须正确清理：定时器、订阅、fetch 用 AbortController
- \`startTransition\` / \`useTransition\`：把更新标记为非紧急
- \`useDeferredValue\`：延迟消费某个值
- 并发特性改善"感知性能"，不改善单次渲染速度
`,
    code: `// =============================================================
// 第 53 章 demo：StrictMode 与并发特性
// 模拟 StrictMode 双调用、effect 清理、startTransition
// =============================================================

// ---- 模拟 StrictMode ----
// 开发模式下：render 和 effect 都会执行两次
const isDev = true;

function StrictMode(props) {
  // StrictMode 本身不渲染额外 DOM，只是给子树打标记
  return { type: 'StrictMode', props, _isStrict: true };
}

function h(type, props, ...children) {
  // 把 children 同时挂到 props 上，模拟 React 行为
  const merged = Object.assign({}, props || {});
  if (children.length === 1) merged.children = children[0];
  else if (children.length > 1) merged.children = children;
  return { type, props: merged, children };
}

// 模拟渲染：StrictMode 下双调用
function render(vnode, options) {
  options = options || {};
  const strictMode = options.strictMode && isDev;
  // 处理数组（嵌套 children）
  if (Array.isArray(vnode)) {
    return vnode.map(v => render(v, options)).join('');
  }
  if (vnode == null || vnode === false) return '';
  if (typeof vnode === 'string' || typeof vnode === 'number') return String(vnode);
  if (typeof vnode.type === 'function') {
    // StrictMode 下双调用 render，然后递归渲染返回的 vnode
    if (strictMode) {
      // 第一次调用仅用于检测副作用，其注册的 effect 要丢弃
      const savedEffectLen = effectQueue.length;
      vnode.type(vnode.props);  // 第一次调用（检测副作用）
      effectQueue.length = savedEffectLen;  // 丢弃第一次的 effect
      return render(vnode.type(vnode.props), options);  // 第二次调用，递归渲染结果
    }
    return render(vnode.type(vnode.props), options);
  }
  if (vnode._isStrict || vnode.type === 'StrictMode') {
    // 递归渲染子树，开启 strict mode
    // props.children 可能是单个 vnode 或数组，统一成数组
    let kids = vnode.props.children != null ? vnode.props.children : vnode.children;
    if (!Array.isArray(kids)) kids = kids ? [kids] : [];
    return kids.map(c =>
      render(c, { strictMode: true })
    ).join('');
  }
  return '<' + vnode.type + '>' + (vnode.children || []).map(c => render(c, options)).join('') + '</' + vnode.type + '>';
}

// ---- 模拟 useEffect ----
// 用一个数组收集 effect
const effectQueue = [];
function useEffect(fn, deps) {
  effectQueue.push({ fn, deps });
}

function flushEffects() {
  // 模拟 StrictMode：mount → cleanup → mount
  // 注意：StrictMode 总是 setup→cleanup→setup，无论 effect 是否返回清理函数
  // 没返回清理函数时，cleanup 步骤相当于 no-op，但 setup 仍会执行两次 → 资源泄漏
  effectQueue.forEach(({ fn }) => {
    console.log('  [effect] setup');
    const cleanup = fn();
    if (isDev) {
      console.log('  [effect] cleanup（StrictMode 故意触发）');
      if (typeof cleanup === 'function') cleanup();  // 没清理函数就跳过这步
      console.log('  [effect] setup again');
      fn();  // 再 setup 一次（没清理的话这里就泄漏了）
    }
  });
  effectQueue.length = 0;
}

// ---- 1. StrictMode 基础：双调用 render ----
console.log('=== 1. StrictMode 双调用 render ===');

let renderCount = 0;
function Comp1(props) {
  renderCount++;
  console.log('  render #' + renderCount);
  return h('div', null, 'hello');
}

console.log('  开发模式（StrictMode）：');
render(h(StrictMode, {}, h(Comp1, {})), { strictMode: true });
console.log('  → render 调用次数：' + renderCount + '（开发模式双调用）');

console.log('\\n  生产模式（无 StrictMode 检查）：');
renderCount = 0;
// 模拟生产模式：直接调用一次（无双调用）
Comp1({});
console.log('  → render 调用次数：' + renderCount + '（生产模式单调用）');

// ---- 2. render 必须是纯函数 ----
console.log('\\n=== 2. render 必须是纯函数 ===');

let globalCounter = 0;
function ImpureComp() {
  // ❌ 副作用：修改全局变量
  globalCounter++;
  return h('div', null, 'global=' + globalCounter);
}

console.log('  不纯的 render（修改全局变量）：');
globalCounter = 0;
render(h(StrictMode, {}, h(ImpureComp, {})), { strictMode: true });
console.log('  → globalCounter=' + globalCounter + '（双调用导致副作用执行两次，bug！）');

function PureComp() {
  // ✅ 纯函数：只依赖 props，无副作用
  return h('div', null, 'pure');
}

console.log('  纯的 render（无副作用）：');
render(h(StrictMode, {}, h(PureComp, {})), { strictMode: true });
console.log('  → 双调用结果一致，无 bug');

// ---- 3. effect 双调用 ----
console.log('\\n=== 3. effect 双调用（StrictMode）===');

let timerId = null;
function TimerComp() {
  useEffect(() => {
    console.log('  启动定时器');
    timerId = 'timer-1';
    return () => {
      console.log('  清理定时器');
      timerId = null;
    };
  }, []);
  return h('div', null, 'timer');
}

render(h(StrictMode, {}, h(TimerComp, {})), { strictMode: true });
console.log('  触发 effect：');
flushEffects();
console.log('  → StrictMode 故意 setup → cleanup → setup，验证清理逻辑');

// ---- 4. 没清理的 effect 会泄漏 ----
console.log('\\n=== 4. 没清理的 effect 会泄漏 ===');

let leakCount = 0;
function LeakyComp() {
  useEffect(() => {
    leakCount++;  // ❌ 没清理
    console.log('  注册订阅 #' + leakCount);
  }, []);
  return h('div', null, 'leaky');
}

render(h(StrictMode, {}, h(LeakyComp, {})), { strictMode: true });
flushEffects();
console.log('  → 泄漏：订阅了 ' + leakCount + ' 次（应该只 1 次）');

// ---- 5. 正确清理的 effect ----
console.log('\\n=== 5. 正确清理的 effect ===');

let activeCount = 0;
function CleanComp() {
  useEffect(() => {
    activeCount++;
    console.log('  订阅（活跃：' + activeCount + '）');
    return () => {
      activeCount--;
      console.log('  退订（活跃：' + activeCount + '）');
    };
  }, []);
  return h('div', null, 'clean');
}

render(h(StrictMode, {}, h(CleanComp, {})), { strictMode: true });
flushEffects();
console.log('  → 最终活跃订阅：' + activeCount + '（正确，没泄漏）');

// ---- 6. fetch 用 AbortController 清理 ----
console.log('\\n=== 6. fetch 用 AbortController ===');

function FetchComp() {
  useEffect(() => {
    const controller = { aborted: false, abort() { this.aborted = true; } };
    // 模拟 fetch
    setTimeout(() => {
      if (controller.aborted) {
        console.log('  fetch 被取消，忽略结果');
      } else {
        console.log('  fetch 完成，更新 state');
      }
    }, 10);
    return () => controller.abort();  // 清理：取消
  }, []);
  return h('div', null, 'fetch');
}

console.log('  正确写法：');
console.log('  useEffect(() => {');
console.log('    const controller = new AbortController()');
console.log('    fetch(url, { signal: controller.signal })...');
console.log('    return () => controller.abort()');
console.log('  }, [])');

// ---- 7. startTransition 模拟 ----
console.log('\\n=== 7. startTransition ===');

// 模拟 startTransition：标记为非紧急
function startTransition(fn) {
  console.log('  [startTransition] 开始非紧急更新');
  // 标记当前更新为低优先级
  fn();
  console.log('  [startTransition] 非紧急更新已调度');
}

function SearchDemo() {
  let input = '';
  let results = [];
  const onChange = (val) => {
    input = val;  // 紧急：立即更新输入框
    console.log('  输入框立即更新：' + input);
    startTransition(() => {
      results = [val + '-1', val + '-2'];  // 非紧急：延迟更新结果
      console.log('  结果列表更新：' + JSON.stringify(results));
    });
  };
  return { input, results, onChange };
}

const search = SearchDemo();
search.onChange('hello');
console.log('  → 输入框立即响应，结果可以延迟更新');

// ---- 8. useTransition 概念 ----
console.log('\\n=== 8. useTransition ===');

console.log('  const [isPending, startTransition] = useTransition()');
console.log('  ');
console.log('  const onClick = () => {');
console.log('    startTransition(() => setTab("heavy"))');
console.log('  }');
console.log('  ');
console.log('  return <button>{isPending ? "加载中..." : "切换"}</button>');
console.log('  → isPending=true 时显示加载状态');

// ---- 9. useDeferredValue 概念 ----
console.log('\\n=== 9. useDeferredValue ===');

console.log('  function Search({ query }) {');
console.log('    const deferredQuery = useDeferredValue(query)');
console.log('    const results = useMemo(() => filter(deferredQuery), [deferredQuery])');
console.log('    return <List items={results} />');
console.log('  }');
console.log('  → query 立即更新，deferredQuery 延迟更新');
console.log('  → 让用户输入更顺滑');

// ---- 10. StrictMode 不影响生产 ----
console.log('\\n=== 10. StrictMode 不影响生产 ===');
console.log('  开发模式：双调用 render / effect，检测问题');
console.log('  生产模式：所有检查自动移除，零开销');
console.log('  → 放心在根组件包 StrictMode');

// ---- 关键要点总结 ----
console.log('\\n=== StrictMode 核心要点 ===');
console.log('1. StrictMode 是开发模式的严格检查器');
console.log('2. 双调用 render：检测副作用（render 必须纯）');
console.log('3. 双调用 effect：检测清理逻辑（必须正确清理）');
console.log('4. 双调用是为并发渲染做准备（render 可能被中断）');
console.log('5. effect 清理：定时器、订阅、fetch 用 AbortController');
console.log('6. startTransition：把更新标记为非紧急');
console.log('7. useDeferredValue：延迟消费某个值');
console.log('8. 不影响生产，零开销，放心用');
`,
  },
];
