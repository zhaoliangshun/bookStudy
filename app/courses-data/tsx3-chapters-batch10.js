// =============================================================
// React 中使用 TypeScript 从入门到精通大全 —— 第十批章节
// -------------------------------------------------------------
// 覆盖：第六部分 性能优化 全部 6 章
// 包含 6 个章节：ch45 ~ ch50
//
// 章节范围：
//   - ch45 React 渲染机制：虚拟 DOM、reconciliation、diff 算法、key 的作用、不可变更新的意义
//   - ch46 React.memo 与浅比较：memo 工作原理、浅比较边界、自定义 areEqual、memo 与 children 的坑
//   - ch47 虚拟列表 react-window：FixedSizeList/VariableSizeList、overscanCount、itemData 类型、横向滚动、动态高度
//   - ch48 代码分割与懒加载：React.lazy + Suspense、动态 import 类型、Suspense fallback、ErrorBoundary 兜底、路由级分割
//   - ch49 Suspense 与并发渲染：Suspense 工作原理、并发模式、useTransition 配合、SuspenseList（实验性）
//   - ch50 性能分析工具：React DevTools Profiler、why-did-you-render、记录火焰图、识别 wasted render、Performance API
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
  // ch45: React 渲染机制
  // ============================================================
  {
    id: "tsx3-ch45",
    group: "第六部分 性能优化",
    icon: "🔄",
    title: "ch45 React 渲染机制",
    content: `# ch45 React 渲染机制

## 为什么讲这个

性能优化的本质是减少"无意义的渲染"。但如果你连 React 是**怎么渲染**的、什么时候会**重新渲染**都搞不清楚，那 \`React.memo\`、\`useMemo\`、\`useCallback\` 这些工具你只是"照着抄"，永远不知道为什么要这么写。

这一章把 React 的渲染流水线讲透：虚拟 DOM、reconciliation、diff 算法、key、不可变更新的意义——五件事其实是一件事。

## 1. 渲染分两个阶段：render + commit

React 把一次更新拆成两个阶段：

- **Render 阶段**：计算"这次 UI 应该长什么样"。React 调用你的函数组件，对比新旧虚拟 DOM，找出变化。**这个阶段可以被打断、可以重做**（并发模式下）。
- **Commit 阶段**：把变化真正应用到真实 DOM。这个阶段是同步的，不能打断。

\`\`\`tsx
// 一个简单组件，演示"什么时候会重新 render"
function Counter() {
  // useState 返回 [状态, 设置函数]
  // 每次调用 setCount，React 都会让 Counter 重新执行一次
  const [count, setCount] = useState(0);

  // render 阶段：Counter 函数被重新调用，这里会重新执行
  console.log("Counter render", count);

  return (
    // commit 阶段：React 把变化的部分（count 的文本）更新到真实 DOM
    <button onClick={() => setCount(c => c + 1)}>
      clicked {count} times
    </button>
  );
}
\`\`\`

**关键认知**：状态变化 → 触发重新渲染 → React 调用你的组件函数 → 计算 diff → 提交 DOM。

## 2. 虚拟 DOM：用 JS 对象描述 UI

虚拟 DOM 就是一个普通 JS 对象，描述"这里应该有一个什么样的元素"。React 用 \`React.createElement\` 创建它，JSX 只是它的语法糖。

\`\`\`tsx
// 这段 JSX：
const element = <div className="box">Hello</div>;

// 编译后等价于：
const element = React.createElement(
  "div",                       // 标签名
  { className: "box" },        // 属性对象
  "Hello"                      // 子节点
);

// 最终得到的虚拟 DOM 对象大致是：
// {
//   type: "div",
//   props: { className: "box", children: "Hello" },
//   ...
// }
\`\`\`

虚拟 DOM 的核心价值不是"比真实 DOM 快"（其实它**更慢**），而是：

1. **声明式**：你写"UI 应该长什么样"，React 帮你算"怎么改 DOM"。
2. **跨平台**：虚拟 DOM 不绑定浏览器，react-native、react-three-fiber 都基于它。
3. **可 diff**：用 JS 对象做对比，比直接对比 DOM 节点便宜得多。

## 3. Reconciliation：协调新老虚拟 DOM

每次重新渲染，React 都会拿"新的虚拟 DOM 树"和"老的虚拟 DOM 树"做对比，找出差异——这个过程叫 **reconciliation**（协调）。

但对比两棵树理论上复杂度是 O(n³)，React 用了三个**启发式假设**把它降到 O(n)：

1. **不同类型的元素，直接替换整棵子树**。\`<div>\` 变 \`<span>\`？直接销毁 div 创建 span。
2. **同类型元素，保留 DOM 节点，只更新属性**。\`<div className="a">\` 变 \`<div className="b">\`？只改 className。
3. **列表子节点靠 \`key\` 标识身份**，不是靠位置。

\`\`\`tsx
// 假设 1：不同类型直接替换
function Demo({ as }: { as: "div" | "span" }) {
  // 当 as 从 "div" 变成 "span" 时
  // React 不会"把 div 改成 span"，而是销毁 div、创建 span
  // div 上的 ref、state、事件监听全部丢失
  const Tag = as;
  return <Tag>Hello</Tag>;
}

// 假设 2：同类型只更新属性
function Box({ color }: { color: string }) {
  // color 变化时，div 节点本身保留，只更新 style
  return <div style={{ background: color }}>box</div>;
}
\`\`\`

## 4. Diff 算法：列表必须有 key

当子节点是列表时，React 需要"找出哪些是新增的、哪些是删除的、哪些是移动的"。靠什么找？**靠 key**。

\`\`\`tsx
// ❌ 反面教材：不给 key（React 会用 index 作 key）
function BadList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item, index) => (
        // 用 index 当 key：当列表头部插入时，所有 key 都变了
        // React 以为整列都"换了"，导致整列重新创建
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

// ✅ 正确做法：用稳定唯一的 id 作 key
function GoodList({ items }: { items: { id: number; text: string }[] }) {
  return (
    <ul>
      {items.map(item => (
        // key 用稳定的 id：即使插入到头部，旧项的 key 不变
        // React 知道"它们没变，只是位置移动了"，只做 DOM 移动不重建
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
}
\`\`\`

**为什么不能用 index 当 key**？看这个经典场景：

\`\`\`tsx
// 假设列表是 [A, B, C]，每项都带一个输入框
// 用 index 当 key 时：A→0, B→1, C→2
// 现在头部插入 D，变成 [D, A, B, C]
// React 对比 key：D→0, A→1, B→2, C→3
// 它会以为"位置 0 的元素从 A 变成了 D"
// 于是复用同一个 DOM 节点，把文本改成 D
// 结果：用户在 A 的输入框里输入的内容，跑到 D 上了！
\`\`\`

## 5. Key 的完整 demo

\`\`\`tsx
import { useState } from "react";

interface Item {
  id: number;
  text: string;
}

// 一个完整的 demo：往头部插入新项，观察 key 的作用
function KeyDemo() {
  const [items, setItems] = useState<Item[]>([
    { id: 1, text: "苹果" },
    { id: 2, text: "香蕉" },
    { id: 3, text: "橙子" },
  ]);

  // 每点一次，在头部插入一个新项
  const addToHead = () => {
    const newItem = {
      id: Date.now(),   // 用时间戳保证 id 唯一
      text: \`新项 \${Math.random().toString(36).slice(2, 6)}\`,
    };
    setItems([newItem, ...items]);
  };

  return (
    <div>
      <button onClick={addToHead}>头部插入</button>
      <ul>
        {items.map(item => (
          // ✅ 用稳定的 id 作 key
          // React 复用旧 DOM 节点，只把新项插入到正确位置
          <li key={item.id}>
            {item.text}
            <input placeholder="输入测试" />
          </li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

试一下：在三个输入框里分别输入"1"、"2"、"3"，然后点"头部插入"。新项出现在头部，**原三项的输入内容不会丢**。如果换成 \`key={index}\`，输入内容会乱套。

## 6. 为什么必须不可变更新

React 判断"状态变没变"，靠的是 \`Object.is\` 比较。如果你直接修改对象，引用没变，React 以为没变化，**不会重新渲染**。

\`\`\`tsx
import { useState } from "react";

interface State {
  count: number;
}

function MutableBug() {
  const [state, setState] = useState<State>({ count: 0 });

  const badUpdate = () => {
    // ❌ 直接修改原对象
    state.count += 1;
    // 把同一个对象传给 setState
    setState(state);
    // React 用 Object.is 比较新老 state，发现引用一样
    // 它以为状态没变，不重新渲染
  };

  const goodUpdate = () => {
    // ✅ 创建新对象，保留旧值，覆盖要改的字段
    setState({ ...state, count: state.count + 1 });
    // 引用变了，React 知道要重新渲染
  };

  return (
    <div>
      <p>count = {state.count}</p>
      <button onClick={badUpdate}>坏更新（不生效）</button>
      <button onClick={goodUpdate}>好更新</button>
    </div>
  );
}
\`\`\`

数组同理：

\`\`\`tsx
// ❌ 直接 push：引用没变，React 不渲染
// items.push(newItem); setItems(items);

// ✅ 创建新数组
// setItems([...items, newItem]);
// setItems(items.filter(x => x !== target));
// setItems(items.map(x => x.id === id ? { ...x, done: true } : x));
\`\`\`

不可变更新的好处不止"让 React 知道变了"：

1. **可回溯**：保留旧状态，撤销/重做天然实现。
2. **可比较**：\`prev === next\` 一行就知道有没有变，比深比较便宜。
3. **可并发**：并发渲染下，正在渲染的状态不会被另一边偷偷改掉。

## 7. 渲染过程的小结

一图概括：

\`\`\`
setState → 调度更新 → 进入 render 阶段（可被打断）
                       ↓
                  调用函数组件
                       ↓
                  生成新虚拟 DOM
                       ↓
                  reconciliation（diff 新老树）
                       ↓
                  计算"需要改哪些 DOM"
                       ↓
              进入 commit 阶段（同步不可打断）
                       ↓
                  应用 DOM 变化
                       ↓
                  执行 useEffect / useLayoutEffect
\`\`\`

## 小结

- React 渲染分 render 阶段（可打断）和 commit 阶段（同步）。
- 虚拟 DOM 是描述 UI 的 JS 对象，价值是声明式 + 跨平台 + 可 diff。
- Reconciliation 用三个启发式假设把 diff 降到 O(n)：不同类型替换、同类型保留、靠 key 标识列表项。
- **列表必须用稳定唯一的 key**，绝对不要用 index。
- 状态更新必须**不可变**，否则 React 检测不到变化，不渲染。

## 避坑清单

- ❌ 用数组 index 当 key（应该用稳定唯一 id）
- ❌ 直接修改 state 对象/数组再 setState（应该创建新对象）
- ❌ 把 \`<div>\` 改成 \`<span>\` 还期望保留内部状态（不同类型直接替换）
- ❌ 在 render 阶段做副作用（应该在 useEffect 里做）
- ❌ 把虚拟 DOM 当作"性能优化手段"（它比直接操作 DOM 更慢，价值是声明式）

下一章我们看 \`React.memo\`——什么时候该用、什么时候是负优化。`
  },

  // ============================================================
  // ch46: React.memo 与浅比较
  // ============================================================
  {
    id: "tsx3-ch46",
    group: "第六部分 性能优化",
    icon: "🧊",
    title: "ch46 React.memo 与浅比较",
    content: `# ch46 React.memo 与浅比较

## 为什么讲这个

\`React.memo\` 是性能优化里被滥用最严重的 API。很多人一上来就给所有组件套 \`memo\`，结果发现性能反而变差——因为 memo 本身有成本，又没拦住几个渲染。

这一章讲 \`memo\` 的工作原理、浅比较的边界、自定义 areEqual、以及和 children 配合时的几个经典坑。

## 1. 默认行为：父渲染，子也跟着渲染

先看一个"没做任何优化"的场景：

\`\`\`tsx
import { useState } from "react";

// 一个昂贵的子组件：故意 console 模拟"重活"
function ExpensiveChild({ value }: { value: number }) {
  console.log("ExpensiveChild render");
  // 假装这里有一堆计算
  return <div>value = {value}</div>;
}

function Parent() {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);

  return (
    <div>
      {/* count 变化时，ExpensiveChild 也会重新渲染，即使它的 value 没变 */}
      <ExpensiveChild value={42} />
      <button onClick={() => setCount(c => c + 1)}>count: {count}</button>
      <button onClick={() => setOther(o => o + 1)}>other: {other}</button>
    </div>
  );
}
\`\`\`

点 \`count\` 或 \`other\`，控制台都会打印 \`ExpensiveChild render\`。**这就是默认行为**：父组件渲染时，所有子组件无论 props 变没变都跟着渲染。

为什么 React 这么设计？因为对比 props 也要成本，对大多数小组件来说，"直接渲染"比"对比 props 再决定渲染"更便宜。

## 2. React.memo：浅比较 props

\`React.memo\` 让组件在 props 没变时跳过重新渲染：

\`\`\`tsx
import { memo } from "react";

// 用 memo 包裹：props 没变就不渲染
const ExpensiveChild = memo(function ExpensiveChild({ value }: { value: number }) {
  console.log("ExpensiveChild render");
  return <div>value = {value}</div>;
});

function Parent() {
  const [count, setCount] = useState(0);
  return (
    <div>
      {/* value 永远是 42，count 变化时 ExpensiveChild 不会渲染 */}
      <ExpensiveChild value={42} />
      <button onClick={() => setCount(c => c + 1)}>count: {count}</button>
    </div>
  );
}
\`\`\`

现在点 \`count\`，控制台**不会再打印** \`ExpensiveChild render\`。memo 起作用了。

## 3. 浅比较的边界：对象、数组、函数都通不过

\`memo\` 默认做**浅比较**：对每个 prop 用 \`Object.is\` 比较。问题来了：

\`\`\`tsx
const Child = memo(function Child({ data, onClick }: {
  data: { value: number };
  onClick: () => void;
}) {
  console.log("Child render");
  return <div>{data.value}</div>;
});

function Parent() {
  const [count, setCount] = useState(0);

  // ❌ 每次渲染都创建新对象：Object.is 比较失败，memo 失效
  const data = { value: 42 };

  // ❌ 每次渲染都创建新函数：同样失效
  const handleClick = () => console.log("clicked");

  return (
    <div>
      <Child data={data} onClick={handleClick} />
      <button onClick={() => setCount(c => c + 1)}>count: {count}</button>
    </div>
  );
}
\`\`\`

每次 \`Parent\` 渲染，\`data\` 和 \`handleClick\` 都是新引用，memo 拦不住，子组件照样渲染。**这就是 memo 最常见的失效原因**。

## 4. 用 useMemo / useCallback 配合 memo

要让 memo 生效，必须保证传给子组件的 props 引用稳定：

\`\`\`tsx
import { memo, useMemo, useCallback, useState } from "react";

const Child = memo(function Child({ data, onClick }: {
  data: { value: number };
  onClick: () => void;
}) {
  console.log("Child render");
  return <button onClick={onClick}>{data.value}</button>;
});

function Parent() {
  const [count, setCount] = useState(0);

  // ✅ useMemo：依赖不变就返回同一引用
  const data = useMemo(() => ({ value: 42 }), []);

  // ✅ useCallback：依赖不变就返回同一函数
  const handleClick = useCallback(() => {
    console.log("clicked");
  }, []);

  return (
    <div>
      <Child data={data} onClick={handleClick} />
      <button onClick={() => setCount(c => c + 1)}>count: {count}</button>
    </div>
  );
}
\`\`\`

现在 \`count\` 变化时 \`Child\` 不会渲染。**memo + useMemo + useCallback 三件套必须配合使用**，缺一个就前功尽弃。

## 5. 自定义 areEqual：精确控制比较

如果 props 里有"内容相同但引用不同"的对象，默认浅比较会失效。可以传第二个参数自定义比较：

\`\`\`tsx
import { memo } from "react";

interface Props {
  data: { value: number };
  label: string;
}

// 自定义比较函数：返回 true 表示"相等不渲染"，false 表示"不等要渲染"
// 注意：和 shouldComponentUpdate 反过来！
function areEqual(prev: Props, next: Props): boolean {
  // 逐个字段深比较（这里"深"一层就够）
  return (
    prev.label === next.label &&
    prev.data.value === next.data.value
  );
}

const Child = memo(function Child({ data, label }: Props) {
  console.log("Child render");
  return <div>{label}: {data.value}</div>;
}, areEqual);
\`\`\`

**坑提醒**：返回值语义是"是否相等"（true = 跳过渲染），和类组件的 \`shouldComponentUpdate\`（true = 渲染）**正好相反**。第一次写很容易写反。

## 6. memo 与 children 的经典坑

这是一个非常隐蔽的坑：把 \`children\` 作为 prop 传给 memo 组件，几乎一定失效。

\`\`\`tsx
import { memo, useState } from "react";

const Card = memo(function Card({ children }: { children: React.ReactNode }) {
  console.log("Card render");
  return <div className="card">{children}</div>;
});

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      {/* ❌ 每次 App 渲染，<p>xxx</p> 都是新的 React element 对象 */}
      {/* Card 收到的 children prop 引用每次都不同，memo 失效 */}
      <Card>
        <p>Hello</p>
      </Card>
      <button onClick={() => setCount(c => c + 1)}>count: {count}</button>
    </div>
  );
}
\`\`\`

只要 \`App\` 重渲染，\`<p>Hello</p>\` 这个 element 就会被重新创建（新对象），传给 \`Card\` 的 \`children\` 引用变了，memo 就失效。

**解决思路**：把 children 提到外层变量并用 useMemo 包，或者把"不变化的内容"放进 memo 组件内部而不是当 children 传：

\`\`\`tsx
function App() {
  const [count, setCount] = useState(0);

  // ✅ 用 useMemo 缓存 children
  const content = useMemo(() => <p>Hello</p>, []);

  return (
    <div>
      <Card>{content}</Card>
      <button onClick={() => setCount(c => c + 1)}>count: {count}</button>
    </div>
  );
}
\`\`\`

## 7. 什么时候用 memo：判断准则

\`memo\` 不是越多越好。判断准则：

| 场景 | 用 memo？ |
| --- | --- |
| 组件渲染本身很便宜 | ❌ 不用，memo 的对比成本可能比直接渲染高 |
| 组件渲染很贵（大量计算/复杂列表） | ✅ 用 |
| 组件经常因为父组件无关状态变化而重渲染 | ✅ 用 |
| props 经常变化 | ❌ 用了也没用 |
| props 里有 children / 内联对象 / 内联函数 | ❌ 默认 memo 会失效，要先稳定 props |

**通用建议**：先用 Profiler（下一章讲）找出"真正慢的组件"，再针对性 memo。**不要预防性 memo**。

## 8. 一个完整的优化 demo

\`\`\`tsx
import { memo, useMemo, useState } from "react";

interface Item {
  id: number;
  name: string;
}

// 列表项：用 memo + 稳定 props
const ListItem = memo(function ListItem({ item, onSelect }: {
  item: Item;
  onSelect: (id: number) => void;
}) {
  console.log("ListItem render", item.id);
  return (
    <li>
      <span>{item.name}</span>
      <button onClick={() => onSelect(item.id)}>选</button>
    </li>
  );
});

function App() {
  const [items, setItems] = useState<Item[]>(
    Array.from({ length: 100 }, (_, i) => ({ id: i, name: \`项目 \${i}\` }))
  );
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // ✅ 用 useMemo 缓存过滤结果：keyword 不变就不重新过滤
  const filtered = useMemo(() => {
    console.log("filter running");
    return items.filter(item => item.name.includes(keyword));
  }, [items, keyword]);

  // ✅ useCallback 让 ListItem 的 onSelect 稳定
  const handleSelect = useCallback((id: number) => {
    setSelectedId(id);
  }, []);

  return (
    <div>
      <input
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        placeholder="搜索"
      />
      <p>已选: {selectedId}</p>
      <ul>
        {filtered.map(item => (
          <ListItem key={item.id} item={item} onSelect={handleSelect} />
        ))}
      </ul>
    </div>
  );
}
\`\`\`

这里 \`selectedId\` 变化时，\`App\` 重渲染，但 \`filtered\` 和 \`handleSelect\` 引用不变，所以 100 个 \`ListItem\` 都不会重渲染。这就是 memo + useMemo + useCallback 的标准用法。

## 小结

- 默认情况下，父渲染子也渲染，不论 props 变没变。
- \`React.memo\` 让组件在 props 浅比较相等时跳过渲染。
- 浅比较对"对象/数组/函数"类 prop 天然失效，必须配合 \`useMemo\`/\`useCallback\`。
- 自定义 \`areEqual\` 时注意返回值语义：true = 跳过渲染（和 \`shouldComponentUpdate\` 相反）。
- \`children\` 作为 prop 几乎一定破坏 memo，要特别处理。
- 不要预防性 memo，先用 Profiler 找慢点。

## 避坑清单

- ❌ 给所有组件套 memo（应该只给渲染昂贵的组件套）
- ❌ 用了 memo 但传内联对象/函数（应该配合 useMemo/useCallback）
- ❌ 自定义 areEqual 返回 true 表示"要渲染"（语义反了，应该是"相等跳过"）
- ❌ 把 children 传给 memo 组件还期望它能拦住（children 引用每次都变）
- ❌ 在 memo 组件里依赖外部可变变量（memo 只看 props，外部变量变了它感知不到）

下一章我们看真正的"长列表性能终结者"——react-window 虚拟列表。`
  },

  // ============================================================
  // ch47: 虚拟列表 react-window
  // ============================================================
  {
    id: "tsx3-ch47",
    group: "第六部分 性能优化",
    icon: "📜",
    title: "ch47 虚拟列表 react-window",
    content: `# ch47 虚拟列表 react-window

## 为什么讲这个

10000 条数据的列表，浏览器渲染直接卡死。原因不是 React 慢，而是 DOM 节点太多——每个节点都是真实 DOM，浏览器要为它布局、绘制、绑定事件。

虚拟列表的思路简单粗暴：**只渲染视口能看到的几行**。滚动时用 transform 把它们移到对应位置。1 万条数据，DOM 里始终只有十几行，性能就和 10 条一样。

react-window 是社区最成熟的虚拟列表库，这一章讲它的核心 API。

## 1. 安装与基本用法

\`\`\`bash
npm install react-window
# 配套类型（react-window 自带 d.ts，不用额外装）
\`\`\`

最常用的 API：\`FixedSizeList\`——所有项高度固定。

\`\`\`tsx
import { FixedSizeList } from "react-window";

// 每一行的渲染函数：是个 render prop
const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
  // index：当前项的索引（0 到 itemCount-1）
  // style：react-window 给的定位样式，必须原样套上去！
  // 不套 style 的话，所有项会叠在同一个位置
  return (
    <div style={style}>
      第 {index} 行
    </div>
  );
};

function App() {
  return (
    // FixedSizeList：固定高度的虚拟列表
    <FixedSizeList
      height={300}        // 视口高度（px）
      width="100%"        // 视口宽度（数字或百分比字符串）
      itemCount={10000}   // 总条数
      itemSize={35}       // 每行高度（px）
    >
      {Row}
    </FixedSizeList>
  );
}
\`\`\`

**关键点**：\`style\` 必须原样套到根元素上。react-window 用绝对定位 + \`transform\` 控制每行位置，你不能改也不能丢。

## 2. TypeScript 类型：ListChildComponentProps

react-window 提供了专门的 props 类型，避免你手写 \`{ index, style }\`：

\`\`\`tsx
import { FixedSizeList, ListChildComponentProps } from "react-window";

// 用 ListChildComponentProps<ItemData> 而不是手写类型
const Row = ({ index, style, data }: ListChildComponentProps<string[]>) => {
  // data 是通过 itemData 传进来的数据，类型由泛型决定
  return (
    <div style={style}>
      {data[index]}
    </div>
  );
};

function App() {
  const items = ["苹果", "香蕉", "橙子", /* ... 10000 项 */];
  return (
    <FixedSizeList
      height={300}
      width="100%"
      itemCount={items.length}
      itemSize={35}
      itemData={items}  // 通过 itemData 把数据传给 Row
    >
      {Row}
    </FixedSizeList>
  );
}
\`\`\`

用 \`itemData\` 比直接闭包读 \`items\` 好：当 \`items\` 变化时，react-window 会重新渲染所有可见行；如果用闭包，react-window 不知道数据变了。

## 3. overscanCount：预渲染缓冲区

\`\`\`tsx
<FixedSizeList
  height={300}
  width="100%"
  itemCount={10000}
  itemSize={35}
  overscanCount={5}  // 视口外多渲染 5 行做缓冲
>
  {Row}
</FixedSizeList>
\`\`\`

\`overscanCount\` 控制"视口外预渲染几行"。默认是 1。值越大滚动越顺滑，但 DOM 节点更多。

经验值：

- 普通列表：\`overscanCount={5}\` 足够。
- 快速滚动场景：调到 \`10\` 或 \`15\`，避免滚动时看到空白。

## 4. 滚动到指定位置：useRef + scrollToRef

\`\`\`tsx
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { useRef } from "react";

const Row = ({ index, style }: ListChildComponentProps) => (
  <div style={style}>第 {index} 行</div>
);

function App() {
  // FixedSizeList 的 ref 类型是 FixedSizeList（同名）
  // 它有 scrollToItem / scrollTo 方法
  const listRef = useRef<FixedSizeList>(null);

  const scrollTo500 = () => {
    // scrollToItem：滚动到指定 index
    listRef.current?.scrollToItem(500);
  };

  return (
    <div>
      <button onClick={scrollTo500}>跳到第 500 项</button>
      <FixedSizeList
        ref={listRef}
        height={300}
        width="100%"
        itemCount={10000}
        itemSize={35}
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}
\`\`\`

## 5. VariableSizeList：每项高度不同

固定高度用 \`FixedSizeList\`；高度变化用 \`VariableSizeList\`。需要提供一个 \`itemSize\` 函数：

\`\`\`tsx
import { VariableSizeList, ListChildComponentProps } from "react-window";

const items = [
  "短文本",
  "稍微长一点的文本",
  "这一行非常非常非常非常非常非常非常非常非常非常长，需要换行",
];

// itemSize 变成函数：根据 index 返回该行高度
const getItemSize = (index: number): number => {
  const text = items[index];
  // 简单估算：超过 10 个字算两行
  return text.length > 10 ? 60 : 35;
};

const Row = ({ index, style }: ListChildComponentProps) => (
  <div style={style}>{items[index]}</div>
);

function App() {
  return (
    <VariableSizeList
      height={300}
      width="100%"
      itemCount={items.length}
      itemSize={getItemSize}  // 注意：这里传函数
    >
      {Row}
    </VariableSizeList>
  );
}
\`\`\`

**坑**：如果运行时高度变化（比如异步加载图片撑高），要调用 \`resetAfterIndex\` 通知列表：

\`\`\`tsx
import { useRef } from "react";

const listRef = useRef<VariableSizeList>(null);

// 假设第 5 项的内容变了，高度也变了
const notifyResize = () => {
  // 从第 5 项开始重新测量
  listRef.current?.resetAfterIndex(5);
};
\`\`\`

\`VariableSizeList\` 没法自动知道项的高度变了，必须手动通知。这是它比 \`FixedSizeList\` 复杂的地方。

## 6. 横向滚动

横向列表只需要把 \`layout\` 设为 \`"horizontal"\`：

\`\`\`tsx
import { FixedSizeList, ListChildComponentProps } from "react-window";

const Card = ({ index, style }: ListChildComponentProps) => (
  // 注意：横向时 style 会带 translateX，不要覆盖
  <div style={{ ...style, border: "1px solid #ccc" }}>
    卡片 {index}
  </div>
);

function App() {
  return (
    <FixedSizeList
      layout="horizontal"  // 关键：横向布局
      height={120}         // 此时 height 是行高
      width={600}          // width 是视口宽度
      itemCount={50}
      itemSize={150}       // 此时是每项宽度
      horizontal={false}   // 旧版本用 horizontal，新版用 layout
    >
      {Card}
    </FixedSizeList>
  );
}
\`\`\`

横向滚动时 \`itemSize\` 表示宽度，\`height\` 表示行高——含义和纵向时**互换**。

## 7. 完整实战 demo：10000 条用户列表

\`\`\`tsx
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { useMemo, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
}

// 生成 10000 条假数据
function generateUsers(count: number): User[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: \`用户 \${i + 1}\`,
    email: \`user\${i + 1}@example.com\`,
  }));
}

// 行组件：每行展示一个用户
const UserRow = ({ index, style, data }: ListChildComponentProps<User[]>) => {
  const user = data[index];
  if (!user) return null;  // 防御性编程
  return (
    <div style={{
      ...style,
      display: "flex",
      alignItems: "center",
      borderBottom: "1px solid #eee",
      padding: "0 12px",
    }}>
      <span style={{ width: 60 }}>#{user.id}</span>
      <span style={{ flex: 1 }}>{user.name}</span>
      <span style={{ color: "#888" }}>{user.email}</span>
    </div>
  );
};

function UserList() {
  const [keyword, setKeyword] = useState("");
  const allUsers = useMemo(() => generateUsers(10000), []);

  // 搜索过滤
  const filtered = useMemo(() => {
    if (!keyword) return allUsers;
    return allUsers.filter(u => u.name.includes(keyword));
  }, [allUsers, keyword]);

  return (
    <div>
      <input
        placeholder="搜索用户名"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
      />
      <p>共 {filtered.length} 条</p>
      <FixedSizeList
        height={400}
        width="100%"
        itemCount={filtered.length}
        itemSize={40}
        itemData={filtered}
        overscanCount={5}
      >
        {UserRow}
      </FixedSizeList>
    </div>
  );
}
\`\`\`

试一下：10000 条数据滚动如丝般顺滑，搜索过滤也瞬间响应。这就是虚拟列表的威力。

## 小结

- 虚拟列表只渲染视口内的几行，1 万条数据 DOM 节点也只有十几个。
- \`FixedSizeList\` 用于固定高度，\`VariableSizeList\` 用于动态高度。
- \`style\` 必须原样套到每行根元素上，react-window 靠它定位。
- \`itemData\` 配合 \`ListChildComponentProps<T>\` 实现类型安全的数据传递。
- \`overscanCount\` 控制视口外预渲染行数，越大越顺滑但 DOM 越多。
- 横向滚动用 \`layout="horizontal"\`，\`itemSize\` 含义变成宽度。

## 避坑清单

- ❌ 不把 \`style\` 套到行根元素上（所有项会叠在同一位置）
- ❌ 在 Row 里用闭包读外部变量而不传 \`itemData\`（数据变了组件不知道）
- ❌ \`VariableSizeList\` 高度变化后不调用 \`resetAfterIndex\`（列表显示错乱）
- ❌ 给列表项加 \`key\`（react-window 自己管理 index，不需要 key）
- ❌ 在每行里跑昂贵计算（应该用 \`useMemo\` 缓存）

下一章我们看代码分割——把首屏 bundle 体积砍下来。`
  },

  // ============================================================
  // ch48: 代码分割与懒加载
  // ============================================================
  {
    id: "tsx3-ch48",
    group: "第六部分 性能优化",
    icon: "✂️",
    title: "ch48 代码分割与懒加载",
    content: `# ch48 代码分割与懒加载

## 为什么讲这个

你的应用代码越来越多：路由、图表库、富文本编辑器、Markdown 渲染器……全部打包成一个 \`bundle.js\`，用户首屏要下载 5MB，体验极差。

代码分割（Code Splitting）就是把一个大 bundle 拆成若干小 chunk，**按需加载**：首屏只加载必需的，其它等用户用到再加载。React 提供的武器是 \`React.lazy\` + \`Suspense\`。

## 1. 静态 import vs 动态 import

\`\`\`tsx
// 静态 import：打包时合并到主 bundle
import { HeavyChart } from "./HeavyChart";

// 动态 import：返回 Promise，运行时才加载该模块
const mod = await import("./HeavyChart");
const HeavyChart = mod.HeavyChart;
\`\`\`

打包工具（Webpack / Vite）看到 \`import()\` 会自动把目标模块拆成单独 chunk。这是代码分割的基础。

TypeScript 里动态 import 的类型是 \`Promise<typeof import("./HeavyChart")>\`：

\`\`\`tsx
// 类型推断：Promise<{ HeavyChart: React.FC<...>; default: ... }>
const modPromise = import("./HeavyChart");

// 配合 await 解构
async function load() {
  const { HeavyChart } = await import("./HeavyChart");
  // 这里的 HeavyChart 已经是真正的组件了
  return <HeavyChart />;
}
\`\`\`

## 2. React.lazy：把动态 import 包成组件

\`React.lazy\` 让你像用普通组件一样用动态 import：

\`\`\`tsx
import { lazy, Suspense } from "react";

// lazy 接受一个返回 Promise 的函数
// Promise 必须 resolve 成 { default: Component }
const HeavyChart = lazy(() => import("./HeavyChart"));

// 用法和普通组件一样
function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <HeavyChart />
    </Suspense>
  );
}
\`\`\`

**关键约束**：\`lazy\` 默认只支持 **default export** 的组件。如果你的组件是命名导出：

\`\`\`tsx
// HeavyChart.tsx
export function HeavyChart() { /* ... */ }  // ❌ 命名导出，lazy 不认
\`\`\`

要么改成默认导出：

\`\`\`tsx
// HeavyChart.tsx
export default function HeavyChart() { /* ... */ }
\`\`\`

要么在 import 时手动包装：

\`\`\`tsx
const HeavyChart = lazy(() =>
  import("./HeavyChart").then(mod => ({ default: mod.HeavyChart }))
);
\`\`\`

## 3. Suspense：处理加载态

\`Suspense\` 是 \`lazy\` 组件的"加载边界"。当 \`lazy\` 组件还没加载完时，Suspense 渲染 \`fallback\`：

\`\`\`tsx
import { lazy, Suspense } from "react";

const AdminPanel = lazy(() => import("./AdminPanel"));

function App() {
  return (
    <Suspense fallback={
      <div className="loading">
        <Spinner />
        正在加载管理后台...
      </div>
    }>
      <AdminPanel />
    </Suspense>
  );
}
\`\`\`

**fallback 可以是任意 ReactNode**，包括另一个组件：

\`\`\`tsx
<Suspense fallback={<Skeleton />}>
  <AdminPanel />
</Suspense>
\`\`\`

## 4. 嵌套 Suspense：精细化加载

Suspense 可以嵌套。内层 Suspense 的 fallback 只覆盖内层组件，外层不影响：

\`\`\`tsx
import { lazy, Suspense } from "react";

const Header = lazy(() => import("./Header"));
const Content = lazy(() => import("./Content"));
const Footer = lazy(() => import("./Footer"));

function App() {
  return (
    // 外层 Suspense：所有 lazy 组件共享
    <Suspense fallback={<div>整页加载中...</div>}>
      <Header />
      {/* 内层 Suspense：Content 没加载完时只显示这里的内容 fallback */}
      <Suspense fallback={<div>正文加载中...</div>}>
        <Content />
      </Suspense>
      <Footer />
    </Suspense>
  );
}
\`\`\`

实际项目里推荐：**每个路由页面套一层 Suspense，重要子模块再各自套**。

## 5. ErrorBoundary：兜底加载失败

\`lazy\` 组件加载失败（网络断了、chunk 被删了）会抛错。Suspense 不接错误，需要 \`ErrorBoundary\`：

\`\`\`tsx
import { Component, ReactNode } from "react";

// ErrorBoundary 必须用类组件（Hook 还没这个能力）
class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  // 子组件抛错时调用
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  // 错误日志可以放在 componentDidError 里
  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// 配合 lazy 使用
const HeavyChart = lazy(() => import("./HeavyChart"));

function App() {
  return (
    <ErrorBoundary fallback={<div>组件加载失败，请刷新重试</div>}>
      <Suspense fallback={<div>加载中...</div>}>
        <HeavyChart />
      </Suspense>
    </ErrorBoundary>
  );
}
\`\`\`

**生产环境必备**：用户网络不稳定，lazy 组件加载失败是常态。没 ErrorBoundary 整个页面会白屏。

## 6. 路由级分割：最常见的应用

把每个路由页面懒加载，是收益最大的分割方式——首屏只下载首页代码，其它页等点击再下：

\`\`\`tsx
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 每个路由页面都 lazy
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

function App() {
  return (
    <BrowserRouter>
      {/* 顶层一个 Suspense 兜住所有路由 */}
      <Suspense fallback={<div>页面加载中...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
\`\`\`

Next.js App Router 里更简单：默认就是路由级分割，不用手动 lazy。但**服务端组件和客户端组件**混用时要小心 \`"use client"\` 边界。

## 7. 组件级分割：按需加载

不是所有分割都要在路由层。一个"很重但不常用"的组件，单独 lazy 也合理：

\`\`\`tsx
import { lazy, Suspense, useState } from "react";

// 富文本编辑器 300KB，用户不点"编辑"就不加载
const RichEditor = lazy(() => import("./RichEditor"));

function App() {
  const [editing, setEditing] = useState(false);

  return (
    <div>
      {editing ? (
        // 用户点编辑才加载 RichEditor chunk
        <Suspense fallback={<div>编辑器加载中...</div>}>
          <RichEditor />
        </Suspense>
      ) : (
        <button onClick={() => setEditing(true)}>开始编辑</button>
      )}
    </div>
  );
}
\`\`\`

## 8. 预加载：让 lazy 组件提前加载

\`lazy\` 组件第一次渲染时才开始加载，可能让用户看到一闪而过的 fallback。可以在用户**悬停**时提前 import：

\`\`\`tsx
import { lazy, Suspense, useState } from "react";

const HeavyDialog = lazy(() => import("./HeavyDialog"));

function App() {
  const [open, setOpen] = useState(false);

  // 鼠标悬停到按钮上时，预加载 HeavyDialog chunk
  // 用户真正点击时，chunk 大概率已经下载完了
  const handleMouseEnter = () => {
    // 触发动态 import，结果会被浏览器和打包工具缓存
    void import("./HeavyDialog");
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={handleMouseEnter}
      >
        打开对话框
      </button>
      {open && (
        <Suspense fallback={<div>加载中...</div>}>
          <HeavyDialog onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
\`\`\`

这种"悬停预加载"在不增加首屏体积的前提下，让用户感知不到加载延迟。

## 小结

- 动态 \`import()\` 是代码分割的基础，打包工具自动拆 chunk。
- \`React.lazy\` 把动态 import 包成组件，**只支持 default export**。
- \`Suspense\` 是 lazy 组件的加载边界，渲染 \`fallback\`。
- \`ErrorBoundary\` 兜底加载失败，**生产环境必配**。
- 路由级分割收益最大，组件级分割适合"重但不常用"的组件。
- 悬停预加载能让 lazy 组件"秒开"。

## 避坑清单

- ❌ lazy 一个命名导出的组件不包装（应该手动 \`{ default: mod.X }\`）
- ❌ 用 lazy 不配 ErrorBoundary（加载失败会白屏）
- ❌ 给所有组件都 lazy（应该只 lazy 重的、不常用的）
- ❌ 在 fallback 里再 lazy 一个组件（嵌套 fallback 用户看不懂）
- ❌ 首屏关键路径用 lazy（首屏要优先加载，lazy 是为非首屏准备的）

下一章我们深入 Suspense，看它和并发渲染、useTransition 怎么配合。`
  },

  // ============================================================
  // ch49: Suspense 与并发渲染
  // ============================================================
  {
    id: "tsx3-ch49",
    group: "第六部分 性能优化",
    icon: "⚡",
    title: "ch49 Suspense 与并发渲染",
    content: `# ch49 Suspense 与并发渲染

## 为什么讲这个

React 18 最大的变化是**并发渲染**（Concurrent Rendering）。它不是新 API，而是一套机制：让 React 渲染过程可以被打断、可以重做、可以低优先级。

Suspense 是并发渲染的"门面"：让组件在等待数据时显示 fallback，**而不阻塞整个 UI**。配合 \`useTransition\` 可以让"重活"在后台慢慢做，用户操作依然丝滑。

这一章讲清楚 Suspense 怎么工作、并发模式解决了什么、useTransition 怎么配合。

## 1. Suspense 工作原理

Suspense 本质是一个"捕获 throw Promise 的边界"。子组件 throw 一个 Promise，Suspense 接住它，渲染 fallback；Promise resolve 后，Suspense 重新渲染子组件。

\`\`\`tsx
import { Suspense } from "react";

// 一个会"throw Promise"的组件
function AsyncName({ namePromise }: { namePromise: Promise<string> }) {
  // 这里直接同步读 promise 的结果
  // 第一次渲染：promise 没 resolve，throw 出去
  // Suspense 接住，渲染 fallback
  // promise resolve 后：React 重新渲染，这里拿到结果
  const name = use(namePromise);  // React 19 的 use Hook
  return <div>名字：{name}</div>;
}

// React 18 没 use Hook，得用第三方库（如 react-cache、SWR）
// 这里用 React 19 的 use 演示原理

function App() {
  const promise = fetch("/api/name").then(r => r.json());
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <AsyncName namePromise={promise} />
    </Suspense>
  );
}

// 注意：use Hook 来自 React 19，React 18 需要其它方案
import { use } from "react";
\`\`\`

核心机制是三步：

1. 子组件 throw 一个 Promise。
2. 最近的 Suspense 边界接住，渲染 fallback。
3. Promise resolve 后，React 重新渲染子组件。

## 2. 并发模式：渲染可被打断

React 17 之前，一次渲染一旦开始就必须做完——如果渲染耗时 100ms，这 100ms 内浏览器无法响应用户输入，卡顿就来了。

React 18 的并发模式下，**渲染是可中断的**：

- 用户输入到来时，React 暂停当前渲染，先处理输入。
- 优先级高的更新可以"插队"先渲染。
- 渲染结果"过期"了就丢弃重做。

\`\`\`tsx
// 开启并发模式：必须用 createRoot（不是老 ReactDOM.render）
import { createRoot } from "react-dom/client";

// ✅ React 18：自动开启并发模式
const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// ❌ React 17 的写法（已废弃，不能用并发特性）
// ReactDOM.render(<App />, document.getElementById("root"));
\`\`\`

**关键**：必须用 \`createRoot\`。如果还在用 \`ReactDOM.render\`，\`useTransition\`、\`useDeferredValue\`、Suspense for Data Fetching 全部失效。

## 3. useTransition：把更新标记为"低优先级"

\`useTransition\` 让你把某些更新标记为"非紧急"，用户输入等高优先级更新可以先插队：

\`\`\`tsx
import { useState, useTransition } from "react";

function SearchResults() {
  const [query, setQuery] = useState("");
  // isPending：过渡是否在进行中
  // startTransition：把里面的更新标记为低优先级
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 用户输入是高优先级，立即更新
    setQuery(e.target.value);

    // 搜索结果更新是低优先级，放到 transition 里
    // 大量过滤计算时，用户输入不会卡
    startTransition(() => {
      // 这里的 state 更新会标为低优先级
      setResults(filterHugeList(e.target.value));
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <span>搜索中...</span>}
      <ul>
        {results.map(r => <li key={r.id}>{r.name}</li>)}
      </ul>
    </div>
  );
}

// 假设有一个很大的列表要过滤
function filterHugeList(keyword: string) {
  // 模拟重活
  return Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: \`项 \${i}\`,
  })).filter(item => item.name.includes(keyword));
}

// 注意：results 需要单独用 useState 维护
import { useState } from "react";
const [results, setResults] = useState<{ id: number; name: string }[]>([]);
\`\`\`

**怎么判断该用 useTransition**：

- 输入框输入 → 输入立即响应，**搜索结果**用 transition 包。
- 切换 Tab → Tab 高亮立即响应，**新 Tab 内容**用 transition 包。
- 任何"用户操作触发昂贵渲染"的场景，把昂贵部分放 transition。

## 4. useDeferredValue：声明式的"低优先级"

\`useTransition\` 是命令式的（你主动包 \`startTransition\`）；\`useDeferredValue\` 是声明式的（你拿到一个"延迟版本"的值）：

\`\`\`tsx
import { useState, useDeferredValue, useMemo } from "react";

function SearchResults() {
  const [query, setQuery] = useState("");
  // deferredQuery 是 query 的"延迟版本"
  // 当 query 变化时，deferredQuery 不会立即变
  // 它会在"空闲时间"才更新
  const deferredQuery = useDeferredValue(query);

  // 用 deferredQuery 做昂贵计算
  const results = useMemo(() => {
    return filterHugeList(deferredQuery);
  }, [deferredQuery]);

  // 输入框用 query（立即响应）
  // 列表用 results（基于 deferredQuery，可延迟）
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ul>
        {results.map(r => <li key={r.id}>{r.name}</li>)}
      </ul>
    </div>
  );
}
\`\`\`

**useTransition vs useDeferredValue**：

- 你能控制 \`setState\` 的位置 → 用 \`useTransition\`。
- 你拿不到 \`setState\`（比如值来自 props）→ 用 \`useDeferredValue\`。

## 5. Suspense + useTransition：跳过 fallback

普通 Suspense 在切换时会显示 fallback。但有些场景你不想要 fallback——比如切换 Tab，宁愿保留旧内容也不显示"加载中"：

\`\`\`tsx
import { useState, useTransition, Suspense } from "react";
import { lazy } from "react";

const TabA = lazy(() => import("./TabA"));
const TabB = lazy(() => import("./TabB"));

function App() {
  const [tab, setTab] = useState<"a" | "b">("a");
  const [isPending, startTransition] = useTransition();

  const switchTab = (next: "a" | "b") => {
    // 切换 Tab 放进 transition
    // 关键：transition 内的 Suspense 不会显示 fallback
    // 而是保留当前内容，直到新内容加载完
    startTransition(() => {
      setTab(next);
    });
  };

  return (
    <div>
      <button onClick={() => switchTab("a")} disabled={isPending}>Tab A</button>
      <button onClick={() => switchTab("b")} disabled={isPending}>Tab B</button>
      <Suspense fallback={<div>加载中...</div>}>
        {tab === "a" ? <TabA /> : <TabB />}
      </Suspense>
    </div>
  );
}
\`\`\`

这是 React 18 的"transition + Suspense"协作：transition 内部触发的 Suspense 不切到 fallback，而是"等准备好再切"。用户体验是"切换瞬间完成"，比 fallback 闪烁好得多。

## 6. SuspenseList（实验性）：控制多个 Suspense 的展示顺序

当你有多个 Suspense 并存时，先加载完的先显示，可能让 UI 跳来跳去。\`SuspenseList\` 让你控制展示顺序：

\`\`\`tsx
import { SuspenseList, Suspense, lazy } from "react";

const Profile = lazy(() => import("./Profile"));
const Posts = lazy(() => import("./Posts"));
const Friends = lazy(() => import("./Friends"));

// ⚠️ SuspenseList 在 React 18 还是实验性 API
// 在 react@experimental 通道里可用
// 稳定通道可能不支持，谨慎使用
function App() {
  return (
    // revealOrder="forwards"：按顺序展示
    // 即使 Posts 先加载完，也要等 Profile 加载完才一起展示
    <SuspenseList revealOrder="forwards" tail="collapsed">
      <Suspense fallback={<div>加载 Profile...</div>}>
        <Profile />
      </Suspense>
      <Suspense fallback={<div>加载 Posts...</div>}>
        <Posts />
      </Suspense>
      <Suspense fallback={<div>加载 Friends...</div>}>
        <Friends />
      </Suspense>
    </SuspenseList>
  );
}
\`\`\`

\`revealOrder\` 三种值：

- \`"forwards"\`：按声明顺序展示（前面没好，后面好了也藏着）。
- \`"backwards"\`：反向。
- \`"together"\`：全部加载完一起展示。

**注意**：截至本书写作，SuspenseList 在 React 稳定通道仍未发布，生产环境慎用。

## 7. 一个完整 demo：搜索 + 高亮

\`\`\`tsx
import { useState, useTransition, useMemo } from "react";

interface Item {
  id: number;
  name: string;
}

// 生成 10000 条假数据
const ALL_ITEMS: Item[] = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: \`项目 \${String(i).padStart(5, "0")}\`,
}));

function App() {
  const [keyword, setKeyword] = useState("");
  const [highlight, setHighlight] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 输入框立即响应
    setKeyword(value);
    // 高亮和过滤放到 transition：低优先级
    startTransition(() => {
      setHighlight(value);
    });
  };

  // 用 highlight（低优先级）做过滤
  const filtered = useMemo(() => {
    if (!highlight) return ALL_ITEMS.slice(0, 100);
    return ALL_ITEMS.filter(item => item.name.includes(highlight)).slice(0, 100);
  }, [highlight]);

  return (
    <div>
      <input
        value={keyword}
        onChange={handleChange}
        placeholder="输入关键字"
      />
      {isPending && <span style={{ marginLeft: 8 }}>过滤中...</span>}
      <ul style={{ marginTop: 12 }}>
        {filtered.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

试一下：快速输入"12345"，输入框始终丝滑响应，过滤结果在后台慢慢追上。这就是并发渲染 + useTransition 的实际效果。

## 小结

- Suspense 本质是"接住 throw Promise 的边界"，渲染 fallback 等 Promise resolve。
- 并发模式必须用 \`createRoot\` 开启，老 \`ReactDOM.render\` 用不了。
- \`useTransition\` 把更新标为低优先级，高优先级更新可以插队。
- \`useDeferredValue\` 是声明式版本的 useTransition，适合拿不到 setState 的场景。
- \`Suspense + useTransition\` 协作：transition 内的 Suspense 不切 fallback，等准备好直接切。
- \`SuspenseList\` 控制多个 Suspense 展示顺序，但仍是实验性 API。

## 避坑清单

- ❌ 用 \`ReactDOM.render\` 期望并发特性生效（必须 \`createRoot\`）
- ❌ 把用户输入本身放进 transition（输入应该是高优先级，立即响应）
- ❌ 在 transition 里做副作用（transition 可能被打断重做，副作用会重复执行）
- ❌ 在生产环境用 SuspenseList（实验性，可能变更）
- ❌ 期望 useTransition 让所有渲染都变快（它只是让优先级更合理，不是变快）

下一章我们看性能分析工具——找到真正慢的地方再优化。`
  },

  // ============================================================
  // ch50: 性能分析工具
  // ============================================================
  {
    id: "tsx3-ch50",
    group: "第六部分 性能优化",
    icon: "🔬",
    title: "ch50 性能分析工具",
    content: `# ch50 性能分析工具

## 为什么讲这个

前面几章都在讲"怎么优化"。但优化之前你要先知道**慢在哪**。React 性能优化的第一原则是：**测量先于优化**。靠猜去 memo 一通，往往徒劳无功。

这一章讲四个工具：

1. **React DevTools Profiler**：官方火焰图，看每次渲染耗时。
2. **why-did-you-render**：第三方库，告诉你"为什么这个组件渲染了"。
3. **Performance API**：浏览器原生，记录用户操作全程的耗时。
4. **Chrome DevTools Performance**：通用的 JS / 渲染性能分析。

## 1. React DevTools：安装与基本用法

\`\`\`bash
# React DevTools 是浏览器扩展，不装包
# Chrome: 在 Chrome 应用商店搜 "React Developer Tools"
# Firefox: 在附加组件里搜
\`\`\`

安装后打开浏览器开发者工具，会看到 **Components** 和 **Profiler** 两个新 tab。

**Profiler 用法**：

1. 点 Profiler tab。
2. 点左上角圆形录制按钮（变红表示开始录制）。
3. 在页面上操作（点按钮、输入、滚动等）。
4. 再点一次录制按钮停止。
5. 看"提交"（commit）列表，每次 React 渲染就是一次 commit。

每次 commit 旁边会显示耗时和颜色：绿色快、黄色慢、红色非常慢。

## 2. 读懂火焰图

录制完成后，Profiler 显示火焰图：

- 横轴：每个组件渲染耗时。
- 纵轴：组件树层级（父在下、子在上）。
- 越宽 = 越慢。

**关键操作**：

- 鼠标悬停某个组件 → 显示它的渲染时间和"为什么渲染"。
- 点击某个组件 → 右侧栏显示 props/state 变化。
- 勾选 "Highlight updates" → 在组件树里高亮渲染过的组件。

\`\`\`tsx
// 一个用来测试的组件
import { useState } from "react";

function SlowComponent() {
  // 故意做点重活
  const start = performance.now();
  while (performance.now() - start < 30) {
    // 阻塞 30ms 模拟昂贵计算
  }
  return <div>slow</div>;
}

function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>count: {count}</button>
      <SlowComponent />
    </div>
  );
}
\`\`\`

在 Profiler 里点 \`count\` 按钮，你会看到 \`SlowComponent\` 每次都 30ms。这就是 wasted render——\`count\` 跟它无关，但它每次都重渲染。

## 3. "Why did this render?" 提示

Profiler 右侧栏有 **Why did this render?** 区域，列出触发渲染的原因：

- \`This component rendered because its props changed\`
- \`state changed: count (from 0 to 1)\`
- \`The parent component re-rendered\`

\`\`\`tsx
// 这个 demo 会触发"props changed"提示
function Child({ value }: { value: { n: number } }) {
  return <div>{value.n}</div>;
}

function App() {
  const [count, setCount] = useState(0);

  // ❌ 每次 App 渲染，value 都是新对象
  // Profiler 会显示 "props changed: value"
  // 这就是 memo 失效的根因
  const value = { n: 42 };

  return (
    <div>
      <Child value={value} />
      <button onClick={() => setCount(c => c + 1)}>count: {count}</button>
    </div>
  );
}
\`\`\`

这个提示是优化时的金矿——它直接告诉你"props 变了导致渲染"，你才知道该 \`useMemo\` 哪个 prop。

## 4. why-did-you-render：自动报告

第三方库 \`@welldone-software/why-did-you-render\` 会自动在控制台打印"为什么渲染了"：

\`\`\`bash
npm install --save-dev @welldone-software/why-did-you-render
\`\`\`

\`\`\`tsx
// 在项目入口（main.tsx / index.tsx）顶部
import React from "react";

// 只在开发环境启用（生产环境会拖性能）
if (process.env.NODE_ENV === "development") {
  const whyDidYouRender = require("@welldone-software/why-did-you-render");
  whyDidYouRender(React, {
    trackAllPureComponents: true,  // 追踪所有 React.memo 组件
  });
}

// 给组件加静态属性，启用追踪
const MyComponent = memo(function MyComponent(props: { value: number }) {
  return <div>{props.value}</div>;
});
MyComponent.whyDidYouRender = true;  // 启用追踪
\`\`\`

之后每次 \`MyComponent\` "不必要地"渲染时，控制台会打印：

\`\`\`
Re-rendered although props and state are the same.
Prev props: { value: 42 }
Next props: { value: 42 }
\`\`\`

注意：它只支持 React 18 之前的部分版本，使用前先看官方兼容表。

## 5. 浏览器 Performance API：精准测量 JS 耗时

\`performance.now()\` 精度比 \`Date.now()\` 高得多（微秒级）：

\`\`\`tsx
// 测量一段代码耗时
function measure(fn: () => void): number {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;  // 毫秒，小数级别精度
}

const elapsed = measure(() => {
  // 一段计算
  for (let i = 0; i < 10000; i++) {
    Math.sqrt(i);
  }
});
console.log(\`耗时 \${elapsed}ms\`);
\`\`\`

\`Performance.mark\` 和 \`Performance.measure\` 会在浏览器 Performance 面板里留下标记：

\`\`\`tsx
// 在关键位置打标记
function handleClick() {
  performance.mark("click-start");

  // 一段操作
  doSomething();

  performance.mark("click-end");
  // 测量两标记之间的耗时
  performance.measure("click-duration", "click-start", "click-end");

  // 读取测量结果
  const measures = performance.getEntriesByName("click-duration");
  console.log("耗时", measures[0].duration, "ms");
}
\`\`\`

这些标记会出现在 Chrome DevTools Performance 录制的火焰图里，方便你定位"用户点了一下到看到结果"中间哪段慢。

## 6. React Profiler API：编程式测量

React 自带 \`<Profiler>\` 组件，能在代码里接收每次渲染的耗时回调：

\`\`\`tsx
import { Profiler } from "react";

// onRender 回调签名
const onRender: ProfilerOnRenderCallback = (
  id,                 // Profiler 树的 id
  phase,              // "mount" | "update" | "nested-update"
  actualDuration,     // 本次渲染实际耗时
  baseDuration,       // 不 memo 时的估算耗时
  startTime,          // 开始时间戳
  commitTime          // 提交时间戳
) => {
  // 只在更新耗时 > 16ms（一帧）时上报
  if (actualDuration > 16) {
    console.log(\`[\${id}] \${phase} 耗时 \${actualDuration}ms\`);
    // 实际项目：上报到 Sentry / 自建埋点
  }
};

function App() {
  return (
    <Profiler id="App" onRender={onRender}>
      <YourContent />
    </Profiler>
  );
}

// 类型：React 19 直接 import
type ProfilerOnRenderCallback = React.ProfilerOnRenderCallback;
\`\`\`

**注意**：\`<Profiler>\` 在生产环境也有一定开销，建议只对关键模块开启，或者按环境变量条件开启。

## 7. Chrome DevTools Performance：通用分析

打开 Chrome DevTools → Performance tab → 录制 → 操作 → 停止，会得到一张火焰图：

- **Main**：主线程 JS 执行。看哪个函数耗时最长。
- **Rendering**：布局计算。
- **Painting**：绘制。

判断慢点的方法：

1. 火焰图里最宽的函数 = 最慢。
2. 主线程长任务（>50ms 灰条）会让用户感知卡顿。
3. 大量紫色 Layout / 绿色 Paint = DOM 操作太多。

\`\`\`tsx
// 故意制造性能问题，用 Performance 录制观察
function HeavyDemo() {
  const [items, setItems] = useState<number[]>([]);

  const addMillion = () => {
    // ❌ 反面教材：一次插入 100 万 DOM 节点
    // Performance 录制会显示超长 Long Task
    setItems(Array.from({ length: 1000000 }, (_, i) => i));
  };

  return (
    <div>
      <button onClick={addMillion}>插入 100 万</button>
      <ul>
        {items.map(i => <li key={i}>{i}</li>)}
      </ul>
    </div>
  );
}
\`\`\`

录一下这个 demo，你会看到主线程卡死几秒——这就是没用虚拟列表的代价（见 ch47）。

## 8. 完整 demo：定位 wasted render

\`\`\`tsx
import { useState, memo, useMemo } from "react";

interface Item {
  id: number;
  label: string;
}

// 假装这是个昂贵组件
const ExpensiveItem = memo(function ExpensiveItem({ item }: { item: Item }) {
  // 故意做点重活
  const start = performance.now();
  while (performance.now() - start < 2) {}  // 阻塞 2ms
  return <li>{item.label}</li>;
});

function App() {
  const [items] = useState<Item[]>(
    Array.from({ length: 50 }, (_, i) => ({ id: i, label: \`项 \${i}\` }))
  );
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // ❌ 这里没用 useMemo，每次 App 渲染都重新过滤
  // 用 Profiler 录制，会看到所有 ExpensiveItem 重渲染
  const filtered = items.filter(item => item.label.includes(keyword));

  return (
    <div>
      <input
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        placeholder="搜索"
      />
      <p>选中: {selectedId}</p>
      <ul>
        {filtered.map(item => (
          <li key={item.id} onClick={() => setSelectedId(item.id)}>
            <ExpensiveItem item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// 修复：把 filtered 用 useMemo 包，selectedId 变化时不再触发过滤
function AppFixed() {
  const [items] = useState<Item[]>(
    Array.from({ length: 50 }, (_, i) => ({ id: i, label: \`项 \${i}\` }))
  );
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // ✅ 关键：依赖 [items, keyword]，selectedId 变化时不重新过滤
  const filtered = useMemo(
    () => items.filter(item => item.label.includes(keyword)),
    [items, keyword]
  );

  return (
    <div>
      <input
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        placeholder="搜索"
      />
      <p>选中: {selectedId}</p>
      <ul>
        {filtered.map(item => (
          <li key={item.id} onClick={() => setSelectedId(item.id)}>
            <ExpensiveItem item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

打开 React DevTools Profiler，先录 \`App\`（点几个 li 看选中变化），再录 \`AppFixed\`。对比两次的渲染次数和耗时，你会直观看到 useMemo 的价值。

## 小结

- React DevTools Profiler 是首选工具，看每次 commit 耗时和原因。
- 火焰图里越宽的组件越慢，"Why did this render?" 直接指出渲染原因。
- why-did-you-render 自动报告"不必要的渲染"，开发阶段很有用。
- \`performance.now()\` 精度比 \`Date.now()\` 高，适合精准测量。
- \`<Profiler>\` 组件能编程式接收渲染回调，可用于线上埋点。
- Chrome Performance 面板看主线程长任务、布局、绘制开销。
- **优化前先测，测出真问题再改**。

## 避坑清单

- ❌ 不开 Profiler 就开始 memo（不知道哪里慢，瞎优化）
- ❌ 生产环境留 why-did-you-render（性能开销大）
- ❌ 用 \`Date.now()\` 测 JS 耗时（精度差，应该用 \`performance.now()\`）
- ❌ 录制 Profiler 时间太长（每次只录几秒，太多 commit 反而看不清）
- ❌ 只看渲染次数不看耗时（10 次便宜渲染 < 1 次昂贵渲染）
- ❌ 优化后不复测（要重新录制对比，确认真的快了）

至此，第六部分 性能优化 全部讲完。下一部分我们进入数据请求：fetch、axios、SWR、TanStack Query 的实战对比。`
  },
];

export { chapters };
