// =============================================================
// React 中使用 TypeScript 从入门到精通大全 —— 第八批章节
// -------------------------------------------------------------
// 覆盖：第五部分 Hooks 全解（中段）
// 包含 4 个章节：ch36 ~ ch39
//
// 章节范围：
//   - ch36 useEffect 清理与依赖（清理时机 / Object.is / lint / 调试）
//   - ch37 useRef 进阶用法（可变 ref / timer / forwardRef / useImperativeHandle）
//   - ch38 useMemo 性能优化（工作原理 / 误用 / 依赖稳定 / React.memo 配合）
//   - ch39 useCallback 缓存函数（与 useMemo 关系 / 稳定引用 / 子组件重渲染）
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
  // ch36: useEffect 清理与依赖
  // ============================================================
  {
    id: "tsx3-ch36",
    group: "第五部分 Hooks 全解",
    icon: "🧹",
    title: "ch36 useEffect 清理与依赖",
    content: `# ch36 useEffect 清理与依赖

## 为什么讲这个

useEffect 是 React 里最容易踩坑的 Hook，没有之一。它能让你"在函数组件里做副作用"——订阅、定时器、事件监听、数据请求——但副作用几乎都伴随"清理"：订阅了要取消订阅、启动了定时器要清除、绑了事件要解绑。如果清理时机或依赖项写错，轻则内存泄漏，重则状态错乱、请求竞态、UI 闪烁。

上一章已经讲了 useEffect 的基础语法，这一章专攻**清理函数的执行时机**、**依赖项的对比算法**、**lint 规则**、**调试技巧**四个核心问题。看完之后你写 effect 不再凭感觉，而是能预测每一步的执行顺序。

## 1. useEffect 执行时机回顾

先快速回顾 useEffect 的三种依赖写法：

\`\`\`tsx
import { useEffect, useState } from "react";

function Demo() {
  const [count, setCount] = useState(0);

  // 写法 A：不传依赖数组 → 每次渲染后都执行
  useEffect(() => {
    console.log("每次渲染后都跑", count);
  });

  // 写法 B：传空数组 → 只在挂载后执行一次
  useEffect(() => {
    console.log("只在挂载时跑一次");
  }, []);

  // 写法 C：传依赖数组 → 挂载后 + 依赖变化后执行
  useEffect(() => {
    console.log("count 变化时跑", count);
  }, [count]);

  return <button onClick={() => setCount(c => c + 1)}>+1</button>;
}
\`\`\`

**执行时机**：所有 effect 都在**渲染提交到屏幕之后**才跑，不会阻塞页面绘制。这是 useEffect 与 useLayoutEffect 的关键区别（后者在 DOM 更新后、浏览器绘制前同步执行）。

## 2. 清理函数的执行时机

useEffect 的回调可以返回一个函数，这个函数就是"清理函数"。它的执行时机有两个：

1. **下一次 effect 执行前**：先清理上一次的 effect，再跑新的。
2. **组件卸载前**：最后一次 effect 的清理函数会在卸载时执行。

\`\`\`tsx
import { useEffect, useState } from "react";

function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // 启动定时器，每秒 +1
    const timer = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);

    // 返回清理函数：在下一次 effect 执行前 / 卸载前调用
    return () => {
      clearInterval(timer); // 必须清除，否则组件卸载后定时器还在跑
      console.log("timer cleared");
    };
  }, []); // 空依赖：挂载时启动一次，卸载时清理

  return <div>已经过了 {count} 秒</div>;
}
\`\`\`

**没有清理函数会发生什么**：组件卸载后定时器还在跑，每秒调用 \`setCount\`，React 会警告 \`Can't perform a state update on an unmounted component\`（React 18 已移除此警告，但内存泄漏依然存在）。

## 3. 依赖变化的清理时序演示

下面这个 demo 展示依赖变化时清理与新 effect 的执行顺序：

\`\`\`tsx
import { useEffect, useState } from "react";

// 模拟一个订阅函数：返回"取消订阅"的清理函数
function mockSubscribe(id: number, cb: (data: { name: string }) => void) {
  console.log(\`[effect] 订阅 user \${id}\`);
  // 模拟异步推送数据
  const timer = setTimeout(() => cb({ name: \`user-\${id}\` }), 100);
  return () => {
    console.log(\`[cleanup] 取消订阅 user \${id}\`);
    clearTimeout(timer);
  };
}

function UserProfile({ userId }: { userId: number }) {
  const [name, setName] = useState("");

  useEffect(() => {
    // 订阅当前 userId 的数据
    const unsubscribe = mockSubscribe(userId, data => {
      setName(data.name);
    });

    // 清理函数：取消订阅
    return unsubscribe;
  }, [userId]); // 依赖 userId：变化时重跑

  return <div>{name || "加载中..."}</div>;
}

// 父组件切换 userId
function App() {
  const [id, setId] = useState(1);
  return (
    <div>
      <UserProfile userId={id} />
      <button onClick={() => setId(i => i + 1)}>切换用户</button>
    </div>
  );
}
\`\`\`

点击"切换用户"把 \`userId\` 从 1 变到 2 时，控制台输出顺序是：

\`\`\`
[effect] 订阅 user 1
（点击切换）
[cleanup] 取消订阅 user 1   ← 先清理上一次
[effect] 订阅 user 2         ← 再执行新的
\`\`\`

这个顺序保证了"上一个副作用已经被妥善处理"，不会出现两个订阅同时活跃的脏状态。**记住这个顺序：cleanup → 新 effect**。

## 4. 依赖项对比：Object.is

React 怎么判断"依赖变了"？答案是用 \`Object.is\` 逐个比较新旧依赖。

\`\`\`ts
// Object.is 的行为：基本等同于 ===，但处理了两个边界
Object.is(1, 1);         // true
Object.is("a", "a");     // true
Object.is(NaN, NaN);     // true  （=== 会返回 false）
Object.is(0, -0);        // false （=== 会返回 true）
Object.is({}, {});       // false （引用不同）
Object.is([], []);       // false （引用不同）
\`\`\`

**关键**：对象和数组按**引用**比较，不按内容。这会导致一个常见 bug：

\`\`\`tsx
import { useEffect, useState } from "react";

function Bad({ fetchParams }: { fetchParams: { page: number } }) {
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    // 父组件每次渲染都传一个新对象 → Object.is 判断为不等 → effect 每次都跑
    fetch(\`/api?page=\${fetchParams.page}\`)
      .then(r => r.json())
      .then(setData);
  }, [fetchParams]); // ❌ 每次渲染都会重新触发请求

  return <div>{JSON.stringify(data)}</div>;
}

function Parent() {
  const [page, setPage] = useState(1);
  // 每次渲染 fetchParams 都是新对象字面量
  return <Bad fetchParams={{ page }} />;
}
\`\`\`

**两种解决方式**：

\`\`\`tsx
// 方式 1：把对象拆成原始类型依赖
function Good1({ page }: { page: number }) {
  useEffect(() => {
    fetch(\`/api?page=\${page}\`).then(r => r.json()).then(setData);
  }, [page]); // ✅ number 按值比较，稳定
}

// 方式 2：用 useMemo 在父层缓存对象
function Parent() {
  const [page, setPage] = useState(1);
  const fetchParams = useMemo(() => ({ page }), [page]); // ✅ page 不变时引用稳定
  return <Bad fetchParams={fetchParams} />;
}
\`\`\`

## 5. 依赖项 lint 规则

React 官方提供了 \`react-hooks/exhaustive-deps\` lint 规则，能自动检测"漏写依赖"和"多余依赖"。

\`\`\`tsx
import { useEffect } from "react";

function Demo({ id }: { id: number }) {
  useEffect(() => {
    // 这里用了 id，但依赖数组没写 id → lint 报警
    console.log("current id:", id);
  }, []); // ⚠️ React Hook useEffect has a missing dependency: 'id'
}
\`\`\`

启用方法（.eslintrc.json）：

\`\`\`json
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error"
  }
}
\`\`\`

**这个规则几乎一定要开**——它能在编译期拦下 80% 的 effect bug，比如"用了 props 但没写进依赖"、"用了过期的闭包变量"。

但 lint 也不是万能的，它只能检测"代码里写出来的依赖"，没法判断"对象引用是否稳定"。所以即使 lint 不报警，你也得自己想清楚对象/函数依赖会不会变。

## 6. 依赖项的三个常见陷阱

**陷阱 1：函数依赖**

\`\`\`tsx
function Bad({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    doSomething().then(onDone);
  }, [onDone]); // ❌ 父组件每次渲染都传新函数 → effect 每次都跑
}
\`\`\`

解决：让父组件用 \`useCallback\` 包裹 \`onDone\`（下一章详细讲），或者用 ref 保存最新函数。

**陷阱 2：对象/数组依赖**

见上文第 4 节，拆字段或用 \`useMemo\`。

**陷阱 3：把 setState 当依赖**

\`\`\`tsx
function Bad() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(0); // 重置
  }, [setCount]); // 多余：setCount 引用永远稳定
}
\`\`\`

React 保证 \`useState\` 返回的 setter 引用永远稳定，写不写进依赖都行。lint 不会报错，但写了显得不熟。**正确做法是写 \`[]\`**。

## 7. useEffect 调试技巧

**技巧 1：用 ref 保存"上一次的值"**

当你需要在 effect 里对比"新值和旧值"时：

\`\`\`tsx
import { useEffect, useRef, useState } from "react";

function CompareProps({ value }: { value: number }) {
  const prevRef = useRef(value); // 初始化为当前值

  useEffect(() => {
    console.log(\`prev=\${prevRef.current}, current=\${value}\`);
    prevRef.current = value; // 更新 ref，供下次 effect 读取
  }, [value]);

  return <div>{value}</div>;
}
\`\`\`

**技巧 2：用 console.log 看完整生命周期**

\`\`\`tsx
useEffect(() => {
  console.log("[mount/update] effect run");
  return () => {
    console.log("[cleanup] effect cleanup");
  };
}, [dep]);
\`\`\`

加日志能看到挂载 → 更新 → 卸载的完整流程，定位"effect 跑了几次"特别有用。

**技巧 3：React DevTools Profiler**

打开 Profiler 录制，能看到每个 effect 的执行时间。如果某个 effect 卡顿，会高亮显示。定位"长 effect"必备。

**技巧 4：用 useLayoutEffect 排查"闪烁"**

如果 UI 出现"先显示旧数据再跳到新数据"的闪烁，把 \`useEffect\` 临时换成 \`useLayoutEffect\` 看是否消失——如果消失了，说明需要同步更新 DOM。

## 小结

- 清理函数在"下一次 effect 执行前"和"组件卸载前"调用，顺序是 cleanup → 新 effect。
- 依赖项用 \`Object.is\` 比较，对象按引用比较——这是大部分 effect 频繁触发的根因。
- 开启 \`react-hooks/exhaustive-deps\` lint，几乎必开。
- 函数依赖用 useCallback 包裹，对象依赖用 useMemo 缓存，setState 不用写进依赖。

## 避坑清单

- ❌ 启动定时器/订阅后忘记 return 清理函数（必内存泄漏）
- ❌ 把对象/函数当依赖又不在父层做缓存（每次都触发）
- ❌ 关掉 exhaustive-deps lint 逃避警告（短期省事，长期 bug）
- ❌ 用 useEffect 做"派生状态"——能用普通变量算出来的就别用 effect
- ❌ 在 effect 里直接 \`setX(x + 1)\` 形成链式 effect（应该用函数式更新或合并状态）

下一章我们看 useRef 的进阶用法：可变 ref、forwardRef、useImperativeHandle。`
  },

  // ============================================================
  // ch37: useRef 进阶用法
  // ============================================================
  {
    id: "tsx3-ch37",
    group: "第五部分 Hooks 全解",
    icon: "📌",
    title: "ch37 useRef 进阶用法",
    content: `# ch37 useRef 进阶用法

## 为什么讲这个

很多同学对 useRef 的认知停留在"获取 DOM 节点"，其实它的能力远不止于此。useRef 是 React 里**唯一一个能跨渲染保存可变数据且不触发重渲染**的 Hook——这意味着所有"不希望触发渲染但要保留的数据"都应该用 ref 存：定时器句柄、AbortController、上一次的值、最新函数引用、外部库实例……

这一章把 useRef 的进阶用法讲透：可变 ref 与不可变 ref 的区别、保存定时器/AbortController、forwardRef 转发 ref 给子组件、useImperativeHandle 自定义暴露 API。学完之后你能写出"父组件调用子组件方法"的命令式交互。

## 1. ref 的本质：跨渲染的可变容器

先看 useRef 的最基础用法：

\`\`\`tsx
import { useRef, useState } from "react";

function Counter() {
  // ref 的 .current 是可变字段，改它不会触发重渲染
  const renderCount = useRef(0);
  renderCount.current++; // 每次渲染都 +1，但不触发渲染

  const [count, setCount] = useState(0);

  return (
    <div>
      <p>state: {count}</p>
      <p>本组件已渲染 {renderCount.current} 次</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  );
}
\`\`\`

**核心区别**：

- \`useState\`：改值 → 触发重渲染 → UI 更新。
- \`useRef\`：改 \`.current\` → **不触发重渲染** → UI 不变。

什么时候用 ref？记住一个判断标准：**"这个数据需要触发 UI 更新吗？"**——需要就用 state，不需要就用 ref。

## 2. 可变 ref vs 不可变 ref

useRef 有两种典型用法，对应两种类型写法：

\`\`\`tsx
import { useRef } from "react";

// 用法 1：可变 ref —— .current 会被反复修改
const timerRef = useRef<number | null>(null);
timerRef.current = setInterval(() => {}, 1000);
timerRef.current = setTimeout(() => {}, 1000); // 后面再改

// 用法 2：不可变 ref —— .current 只在挂载时设置一次（通常用于 DOM）
const divRef = useRef<HTMLDivElement>(null);
// divRef.current 由 React 在挂载时自动赋值，你几乎不会主动写它
\`\`\`

**类型注解的讲究**：

\`\`\`tsx
// 场景 A：ref 一定有值 → 用非空类型，初始值给 null 但类型不带 null
const inputRef = useRef<HTMLInputElement>(null!);
// null! 是"非空断言赋值"，告诉 TS"放心，运行时会有人填进去"
// 但更安全的写法是：

// 场景 B：ref 可能为 null → 类型带上 null，使用前判空
const inputRef = useRef<HTMLInputElement | null>(null);
const focus = () => {
  if (inputRef.current) {
    inputRef.current.focus(); // ✅ TS 知道这里非空
  }
};
\`\`\`

**推荐用场景 B**：类型更诚实，强制你处理 null 边界。

## 3. 保存 timer / AbortController

useRef 最常见的进阶用法是保存"副作用产生的句柄"，配合 useEffect 清理：

\`\`\`tsx
import { useEffect, useRef, useState } from "react";

function SearchBox() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string>("");

  // 用 ref 保存 AbortController，便于在 effect 清理时取消请求
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // 每次新请求前，取消上一次还在飞的请求
    abortRef.current?.abort();

    if (!query) {
      setResult("");
      return;
    }

    // 新建一个 AbortController 用于本次请求
    const controller = new AbortController();
    abortRef.current = controller;

    fetch(\`/api/search?q=\${query}\`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => setResult(data.text))
      .catch(err => {
        if (err.name === "AbortError") {
          console.log("请求被取消（正常）");
        } else {
          throw err;
        }
      });

    // 清理函数：组件卸载或下一次 effect 前取消请求
    return () => controller.abort();
  }, [query]);

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <p>结果：{result}</p>
    </div>
  );
}
\`\`\`

**这个模式解决两个问题**：

1. **请求竞态**：用户快速输入时，后发先至的旧请求会覆盖新结果——用 AbortController 取消旧请求。
2. **内存泄漏**：组件卸载后还在飞的请求回来调 setState——清理函数 abort 掉。

定时器也是一样的套路：

\`\`\`tsx
function Timer() {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      console.log("tick");
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return <div>定时器运行中</div>;
}
\`\`\`

> **类型小技巧**：浏览器里 \`setInterval\` 返回 \`number\`，但 Node 类型里返回 \`NodeJS.Timeout\`。用 \`ReturnType<typeof setInterval>\` 能自动适配两种环境。

## 4. forwardRef 转发 ref

默认情况下，函数组件**不接收 ref**——你写 \`<MyInput ref={...} />\` 时 ref 会被 React 拦下，不会出现在 props 里。要让子组件能接收父组件传来的 ref，必须用 \`forwardRef\` 包裹：

\`\`\`tsx
import { forwardRef, useRef } from "react";

// 用 forwardRef 包裹组件，第二参数是 ref
const FancyInput = forwardRef<HTMLInputElement, { label: string }>(
  (props, ref) => {
    return (
      <label>
        {props.label}
        {/* 把 ref 转发给内部的 input */}
        <input ref={ref} />
      </label>
    );
  }
);

// 父组件用法
function App() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.focus(); // 调用子组件内部 input 的 focus
  };

  return (
    <div>
      <FancyInput label="用户名" ref={inputRef} />
      <button onClick={handleClick}>聚焦输入框</button>
    </div>
  );
}
\`\`\`

**forwardRef 的泛型签名**：

\`\`\`ts
forwardRef<TRef, TProps>(render: (props: TProps, ref: Ref<TRef>) => ReactElement)
\`\`\`

- 第一个泛型 \`TRef\`：ref 指向的元素类型（如 \`HTMLInputElement\`）。
- 第二个泛型 \`TProps\`：组件自身的 props 类型。

> **避坑**：React 19 已经把 ref 当成普通 prop 传，不再需要 forwardRef。但目前主流项目还在 React 18，forwardRef 仍是必学。

## 5. useImperativeHandle 暴露 API

forwardRef 默认是把 ref 直接指向 DOM 元素，但有时你不想暴露整个 DOM——你想暴露一组**自定义的方法**给父组件调用。这就是 \`useImperativeHandle\` 的用途。

\`\`\`tsx
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

// 1. 定义对外暴露的 API 类型
export interface FancyInputHandle {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

// 2. 用 forwardRef + useImperativeHandle 暴露自定义 API
const FancyInput = forwardRef<FancyInputHandle, { placeholder?: string }>(
  (props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState("");

    // useImperativeHandle：自定义 ref.current 的内容
    // 第 3 参数是依赖数组，决定何时重新创建 handle 对象
    useImperativeHandle(
      ref,
      () => ({
        focus: () => inputRef.current?.focus(),
        clear: () => setValue(""),
        getValue: () => value,
      }),
      [value] // value 变化时重新创建 handle，保证 getValue 读到最新值
    );

    return (
      <input
        ref={inputRef}
        value={value}
        placeholder={props.placeholder}
        onChange={e => setValue(e.target.value)}
      />
    );
  }
);

// 3. 父组件用 ref 调用子组件方法
function App() {
  const inputRef = useRef<FancyInputHandle>(null);

  return (
    <div>
      <FancyInput ref={inputRef} placeholder="输入点啥" />
      <button onClick={() => inputRef.current?.focus()}>聚焦</button>
      <button onClick={() => inputRef.current?.clear()}>清空</button>
      <button onClick={() => alert(inputRef.current?.getValue())}>读取</button>
    </div>
  );
}
\`\`\`

**useImperativeHandle 的三个参数**：

1. \`ref\`：父组件传进来的 ref。
2. \`factory\`：返回"要挂到 ref.current 上的对象"的工厂函数。
3. \`deps\`：依赖数组——deps 变化时重新创建 handle 对象。

**为什么需要 deps**：如果 factory 里用了闭包变量（如 \`value\`），不写 deps 会让 handle 持有过期的 value。写 \`[value]\` 保证 value 变化时 handle 更新。

> **设计建议**：useImperativeHandle 是"命令式 API"的逃生口，能用声明式（props 驱动）就别用命令式。只在"父组件需要主动调用子组件方法"（如 focus、scrollTo、play）时使用。

## 6. ref 的常见误用

**误用 1：用 ref 触发渲染**

\`\`\`tsx
function Bad() {
  const countRef = useRef(0);
  return (
    <button onClick={() => {
      countRef.current++;
      console.log(countRef.current); // 数值变了，但 UI 不更新！
    }}>
      {countRef.current}  {/* 永远显示 0 */}
    </button>
  );
}
\`\`\`

**解决**：需要触发渲染的数据用 useState，不用 useRef。

**误用 2：在渲染过程中读写 ref**

\`\`\`tsx
function Bad({ value }: { value: number }) {
  const prevRef = useRef(value);

  // ❌ 错误：在渲染过程中写 ref
  // React 的并发模式下，渲染可能被打断重来，ref 会被多次写入
  prevRef.current = value;

  return <div>{prevRef.current}</div>;
}
\`\`\`

**解决**：写 ref 应该放在事件处理函数或 effect 里，不要在渲染过程中写。

**误用 3：用 ref 替代 props 传数据**

\`\`\`tsx
// ❌ 反模式：用 ref 在父子间传数据，绕过 React 数据流
const dataRef = useRef({});
<Child dataRef={dataRef} />
\`\`\`

**解决**：数据流走 props/state，ref 只用于"不触发渲染的可变存储"。

## 小结

- useRef 是跨渲染的可变容器，改 \`.current\` 不触发渲染。
- 判断标准："这个数据需要触发 UI 更新吗？"——需要用 state，不需要用 ref。
- 保存定时器/AbortController 是 ref 的经典用法，配合 useEffect 清理。
- forwardRef 让子组件接收父组件的 ref，useImperativeHandle 自定义暴露 API。
- 不要在渲染过程中写 ref，不要用 ref 替代 props。

## 避坑清单

- ❌ 用 ref 存需要触发渲染的数据（应该用 useState）
- ❌ 在渲染过程中读写 ref（应该在事件/effect 里写）
- ❌ useRef<HTMLDivElement>(null!) 强行非空（应该用 \`HTMLDivElement | null\` 并判空）
- ❌ 滥用 useImperativeHandle 把所有内部方法都暴露（只暴露必要的命令式 API）
- ❌ 忘记给 forwardRef 写泛型（应该显式标注 ref 类型和 props 类型）

下一章我们看 useMemo：性能优化的双刃剑。`
  },

  // ============================================================
  // ch38: useMemo 性能优化
  // ============================================================
  {
    id: "tsx3-ch38",
    group: "第五部分 Hooks 全解",
    icon: "⚡",
    title: "ch38 useMemo 性能优化",
    content: `# ch38 useMemo 性能优化

## 为什么讲这个

\`useMemo\` 是 React 性能优化最常用的 Hook，但也是最容易**过度使用**的 Hook。很多新手一上来就把所有变量都 useMemo 包起来，以为"缓存越多越快"——结果缓存本身的成本超过了计算成本，反而更慢。

这一章把 useMemo 的工作原理、**何时该用何时不用**、常见误用、依赖稳定性、与 React.memo 的配合讲清楚。看完之后你能判断"这段代码到底要不要 useMemo"，不再无脑加。

## 1. useMemo 工作原理

useMemo 接收两个参数：一个工厂函数和一个依赖数组。React 会在依赖变化时重新调用工厂函数，否则复用上次的结果。

\`\`\`tsx
import { useMemo, useState } from "react";

function Demo() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(2);

  // 只有 a 或 b 变化时才重新计算 a + b
  // 其他状态变化（如 c）不会触发重算
  const sum = useMemo(() => {
    console.log("重新计算 sum");
    return a + b;
  }, [a, b]);

  return <div>{sum}</div>;
}
\`\`\`

**底层逻辑**（伪代码）：

\`\`\`ts
// React 内部简化版
let memoizedValue;
let prevDeps;

function useMemo(factory, deps) {
  // 用 Object.is 逐个比较新旧 deps
  const depsChanged = !prevDeps || deps.some((d, i) => !Object.is(d, prevDeps[i]));

  if (depsChanged) {
    memoizedValue = factory(); // 重新计算
    prevDeps = deps;
  }
  return memoizedValue; // 否则复用旧值
}
\`\`\`

**关键事实**：useMemo 并不是"免费的缓存"。每次渲染 React 都要：

1. 创建新的 deps 数组。
2. 用 Object.is 逐个比较新旧 deps。
3. 如果没变，返回旧值；变了，调用 factory。

所以 **useMemo 本身有成本**——只有当 factory 的成本高于"对比 deps + 创建数组"的成本时，useMemo 才划算。

## 2. 何时该用 useMemo

**场景 1：计算确实昂贵**

\`\`\`tsx
function FilterableList({ items }: { items: number[] }) {
  const [query, setQuery] = useState("");

  // items 可能有 1 万条，filter + sort 是 O(n log n)
  // 这种计算该用 useMemo
  const filtered = useMemo(() => {
    return items
      .filter(n => n.toString().includes(query))
      .sort((a, b) => a - b);
  }, [items, query]);

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ul>{filtered.map(n => <li key={n}>{n}</li>)}</ul>
    </div>
  );
}
\`\`\`

**判断标准**：计算量 > 1ms，或者数据规模 > 1000 条，才考虑 useMemo。

**场景 2：稳定引用传给子组件**

\`\`\`tsx
function Parent() {
  const [count, setCount] = useState(0);
  const items = useMemo(() => [1, 2, 3], []); // 引用稳定

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      <span>{count}</span>
      <HeavyList items={items} />
    </div>
  );
}

// HeavyList 是个昂贵的子组件（假设用 React.memo 包了）
const HeavyList = React.memo(function HeavyList({ items }: { items: number[] }) {
  console.log("HeavyList render");
  return <ul>{items.map(n => <li key={n}>{n}</li>)}</ul>;
});
\`\`\`

如果不 useMemo，父组件每次 \`count\` 变化都会让 \`items\` 成为新数组，\`HeavyList\` 即使被 React.memo 包了也会重渲染。

**场景 3：作为其他 Hook 的依赖**

\`\`\`tsx
function Demo({ filter }: { filter: (n: number) => boolean }) {
  const [numbers, setNumbers] = useState([1, 2, 3]);

  // filtered 作为 useEffect 的依赖，必须稳定引用
  const filtered = useMemo(() => numbers.filter(filter), [numbers, filter]);

  useEffect(() => {
    console.log("filtered changed", filtered);
  }, [filtered]); // 如果 filtered 不稳定，effect 会无限触发
}
\`\`\`

## 3. 何时**不**该用 useMemo

**反例 1：计算很廉价**

\`\`\`tsx
function Bad({ a, b }: { a: number; b: number }) {
  // ❌ 加法 + 字符串拼接都是纳秒级，useMemo 反而更慢
  const sum = useMemo(() => a + b, [a, b]);
  const label = useMemo(() => \`\${a} + \${b}\`, [a, b]);
  return <div>{sum} {label}</div>;
}
\`\`\`

**经验法则**：如果一个计算能在 1ms 内完成，别用 useMemo。

**反例 2：每次都重新计算（依赖总是变）**

\`\`\`tsx
function Bad({ user }: { user: { name: string } }) {
  // ❌ user 每次都是新对象 → useMemo 等于没用
  const greeting = useMemo(() => \`Hello \${user.name}\`, [user]);
  return <div>{greeting}</div>;
}
\`\`\`

**反例 3：为了"防御性编程"乱用**

\`\`\`tsx
function Bad({ list }: { list: string[] }) {
  // ❌ 没有 Heavy 子组件，也没有传给其他 Hook，纯属浪费
  const upperList = useMemo(() => list.map(s => s.toUpperCase()), [list]);
  return <ul>{upperList.map(s => <li key={s}>{s}</li>)}</ul>;
}
\`\`\`

**记住**：useMemo 不是"加保险"，它有成本。能用就用，能不用就别用。

## 4. 常见误用

**误用 1：在 useMemo 里做副作用**

\`\`\`tsx
function Bad({ id }: { id: number }) {
  // ❌ useMemo 工厂函数里发请求——React 可能丢弃缓存重新执行，副作用会重复触发
  const data = useMemo(() => {
    fetch(\`/api/\${id}\`).then(r => r.json());
  }, [id]);
  return <div>{data}</div>;
}
\`\`\`

**解决**：副作用用 useEffect，不要用 useMemo。

**误用 2：依赖数组漏写**

\`\`\`tsx
function Bad({ a, b }: { a: number; b: number }) {
  // ❌ 漏写 b → b 变化时 filtered 不会更新 → 显示陈旧数据
  const result = useMemo(() => a * b, [a]);
  return <div>{result}</div>;
}
\`\`\`

**解决**：开 \`react-hooks/exhaustive-deps\` lint，让它帮你查。

**误用 3：用 useMemo 缓存 JSX**

\`\`\`tsx
function Bad({ items }: { items: number[] }) {
  // ⚠️ 这样写没错，但通常不如直接抽子组件清晰
  const list = useMemo(() => (
    <ul>{items.map(n => <li key={n}>{n}</li>)}</ul>
  ), [items]);
  return <div>{list}</div>;
}
\`\`\`

**更好的做法**：抽出 \`<List items={items} />\` 子组件 + React.memo。

## 5. 依赖项稳定性

useMemo 的依赖稳定性问题主要来自"对象"和"函数"两类：

\`\`\`tsx
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ 每次渲染都是新对象
  const config = { pageSize: 10, sort: "asc" };

  // useMemo 看到 config 变了 → 重新计算
  const data = useMemo(() => load(config), [config]);

  return <div>{count}</div>;
}
\`\`\`

**解决**：把 config 也用 useMemo 缓存起来。

\`\`\`tsx
function Parent() {
  const [count, setCount] = useState(0);

  // ✅ config 引用稳定
  const config = useMemo(() => ({ pageSize: 10, sort: "asc" }), []);

  const data = useMemo(() => load(config), [config]);
  return <div>{count}</div>;
}
\`\`\`

**更优雅的写法**：如果 config 是常量，直接提到组件外面：

\`\`\`tsx
// ✅ 模块级常量，永远稳定
const CONFIG = { pageSize: 10, sort: "asc" };

function Parent() {
  const data = useMemo(() => load(CONFIG), [CONFIG]); // 引用永远不变
  // ...
}
\`\`\`

## 6. 与 React.memo 配合

useMemo 真正发挥作用的场景是配合 \`React.memo\`。React.memo 让组件"props 不变就不重渲染"，但如果父组件传的 props 引用每次都变，memo 就形同虚设。

\`\`\`tsx
import { memo, useMemo, useState } from "react";

// 用 React.memo 包裹子组件
const ExpensiveItem = memo(function ExpensiveItem({ value }: { value: number }) {
  console.log("ExpensiveItem render", value);
  return <div>{value}</div>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [value, setValue] = useState(0);

  // ✅ value 是 number，按值比较，天然稳定
  // 但如果传对象/数组就必须 useMemo
  const config = useMemo(() => ({ value }), [value]);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>count +1</button>
      <span>{count}</span>
      <ExpensiveItem value={value} />
      {/* 如果 config 不 useMemo，count 变化时 ExpensiveItem 也会重渲染 */}
    </div>
  );
}
\`\`\`

**配合策略**：

1. 子组件用 \`React.memo\` 包裹。
2. 父组件传给子组件的"对象/数组/函数 props"用 \`useMemo\`/\`useCallback\` 缓存。
3. 原始类型（number、string、boolean）天然稳定，不用包。

**性能对比**（伪数据）：

| 优化方式 | 1 万条列表渲染时间 |
| --- | --- |
| 无优化 | 80ms |
| 仅 React.memo | 50ms（props 不稳定，效果有限） |
| React.memo + useMemo | 12ms |

## 7. useMemo 与 useDeferredValue 的取舍

React 18 引入了 \`useDeferredValue\`，可以延迟某个值的更新：

\`\`\`tsx
import { useDeferredValue, useMemo, useState } from "react";

function Search({ items }: { items: string[] }) {
  const [query, setQuery] = useState("");
  // 把 query 延迟一下，让输入框先响应
  const deferredQuery = useDeferredValue(query);

  // 配合 useMemo，在 deferredQuery 变化时才重算
  const filtered = useMemo(() => {
    return items.filter(item => item.includes(deferredQuery));
  }, [items, deferredQuery]);

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ul>{filtered.map(item => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}
\`\`\`

**取舍**：

- 数据计算昂贵 + 输入响应卡 → 用 \`useDeferredValue\` + \`useMemo\`。
- 只是普通计算 → 只用 \`useMemo\` 即可。

## 小结

- useMemo 在依赖变化时重算，否则复用旧值——但本身有成本。
- 该用的三个场景：昂贵计算、稳定引用传子组件、作为其他 Hook 依赖。
- 不该用的三个场景：廉价计算、依赖总变、防御性乱用。
- 配合 React.memo 时，对象/数组 props 必须 useMemo 缓存。
- 副作用不要写在 useMemo 里，用 useEffect。

## 避坑清单

- ❌ 给所有变量都套 useMemo（缓存成本可能超过计算成本）
- ❌ 在 useMemo 里做副作用（应该用 useEffect）
- ❌ 依赖数组漏写或乱写（开 exhaustive-deps lint）
- ❌ 把常量对象定义在组件里（应该提到模块级）
- ❌ 期望 useMemo"保证引用稳定"——React 文档明确说不保证，未来可能为节省内存丢弃缓存

下一章我们看 useCallback：useMemo 的"函数版兄弟"。`
  },

  // ============================================================
  // ch39: useCallback 缓存函数
  // ============================================================
  {
    id: "tsx3-ch39",
    group: "第五部分 Hooks 全解",
    icon: "🔗",
    title: "ch39 useCallback 缓存函数",
    content: `# ch39 useCallback 缓存函数

## 为什么讲这个

\`useCallback\` 是 \`useMemo\` 的"函数版兄弟"——专门用来缓存函数引用。它的作用看似简单，但在配合 \`React.memo\` 时威力巨大：它能让"传给子组件的回调函数"保持引用稳定，从而避免子组件无意义的重渲染。

这一章把 useCallback 与 useMemo 的关系、稳定引用的作用、配合子组件避免重渲染的完整模式、依赖项陷阱讲清楚。看完之后你能在"该用 useCallback 的场景"和"纯属多余的场景"之间准确判断。

## 1. useCallback 与 useMemo 的关系

\`\`\`ts
// useCallback 等价于这个 useMemo 写法
const handleClick = useCallback(() => {
  doSomething();
}, [dep]);

// 等价于
const handleClick = useMemo(() => {
  return () => doSomething();
}, [dep]);
\`\`\`

**本质上**：useCallback 就是 \`useMemo(() => fn, deps)\` 的语法糖。React 团队觉得"缓存函数"这个场景太常见，所以专门做了个 Hook。

为什么需要专门的 Hook 缓存函数？因为**函数每次重新创建都是新引用**：

\`\`\`tsx
function Demo() {
  // 每次渲染都创建一个新函数 → 引用每次都不同
  const handleClick = () => {
    console.log("clicked");
  };

  // useMemo 缓存的对象，引用稳定
  const stableObj = useMemo(() => ({}), []);

  console.log(handleRef === handleRef); // 但跨渲染比较就 false
}
\`\`\`

## 2. 稳定引用的作用

函数引用稳定有什么用？主要有三个场景：

**场景 1：作为子组件的 props**

\`\`\`tsx
import { memo, useState } from "react";

// 子组件用 memo 包裹：props 不变就不重渲染
const Button = memo(function Button({ onClick }: { onClick: () => void }) {
  console.log("Button render");
  return <button onClick={onClick}>点我</button>;
});

function Parent() {
  const [count, setCount] = useState(0);

  // ❌ 不用 useCallback：每次渲染都是新函数 → Button 每次都重渲染
  const handleClick = () => {
    console.log("clicked");
  };

  return (
    <div>
      <span>{count}</span>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      <Button onClick={handleClick} />
    </div>
  );
}
\`\`\`

每次点 +1，控制台都会打印 "Button render"——因为 \`handleClick\` 是新函数，React.memo 判断 props 变了。

**改成 useCallback**：

\`\`\`tsx
function Parent() {
  const [count, setCount] = useState(0);

  // ✅ useCallback 让函数引用稳定 → Button 不再重渲染
  const handleClick = useCallback(() => {
    console.log("clicked");
  }, []); // 空依赖：函数永远不变

  return (
    <div>
      <span>{count}</span>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      <Button onClick={handleClick} />
    </div>
  );
}
\`\`\`

现在点 +1 不再触发 Button 重渲染。

**场景 2：作为 useEffect 的依赖**

\`\`\`tsx
function Demo({ fetchUser }: { fetchUser: (id: number) => Promise<void> }) {
  const [id, setId] = useState(1);

  // ❌ 不用 useCallback：fetchUser 每次都是新引用 → effect 每次都跑
  useEffect(() => {
    fetchUser(id);
  }, [id, fetchUser]);
}
\`\`\`

让父组件把 fetchUser 用 useCallback 包起来，effect 才不会反复触发。

**场景 3：注册到外部库的事件回调**

\`\`\`tsx
function Demo() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // ✅ 稳定函数：addEventListener 不用反复解绑重绑
    const handler = () => console.log("scroll", count);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [count]); // count 变化时需要重新注册
}
\`\`\`

## 3. 避免子组件重渲染的完整模式

把 useCallback + React.memo 配合起来，是 React 性能优化的标准模式。下面是一个完整的"列表 + 项"组件：

\`\`\`tsx
import { memo, useCallback, useState } from "react";

// 子组件：单个 todo 项，用 memo 包裹
type TodoItemProps = {
  todo: { id: number; text: string; done: boolean };
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
};

const TodoItem = memo(function TodoItem({ todo, onToggle, onRemove }: TodoItemProps) {
  console.log("TodoItem render", todo.id);
  return (
    <li>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
      />
      <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
        {todo.text}
      </span>
      <button onClick={() => onRemove(todo.id)}>删除</button>
    </li>
  );
});

// 父组件：管理 todos
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: "学 TypeScript", done: false },
    { id: 2, text: "学 React", done: false },
    { id: 3, text: "学 Next.js", done: false },
  ]);
  const [text, setText] = useState("");

  // ✅ onToggle 用 useCallback 缓存
  // 用函数式更新避免依赖 todos，让函数引用永远稳定
  const onToggle = useCallback((id: number) => {
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    ));
  }, []); // 空依赖：函数引用永远稳定

  // ✅ onRemove 同样处理
  const onRemove = useCallback((id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  // 添加新 todo
  const handleAdd = () => {
    if (!text) return;
    setTodos(prev => [...prev, { id: Date.now(), text, done: false }]);
    setText("");
  };

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={handleAdd}>添加</button>
      <ul>
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onRemove={onRemove}
          />
        ))}
      </ul>
    </div>
  );
}
\`\`\`

**关键点**：

1. \`TodoItem\` 用 \`React.memo\` 包裹。
2. \`onToggle\` / \`onRemove\` 用 \`useCallback\` 包裹，且**用函数式更新**避免依赖 \`todos\`。
3. 因为函数引用稳定，只有被改的那个 \`TodoItem\` 会重渲染，其他项不会。

**对比效果**：如果不这么做，勾选一个 todo 会让所有 3 个 TodoItem 都重渲染（因为 \`todos\` 数组变了 + 函数引用变了）。优化后只有被勾选的那一项重渲染。

## 4. useCallback 的依赖项陷阱

**陷阱 1：依赖项漏写导致闭包过期**

\`\`\`tsx
function Bad({ userId }: { userId: number }) {
  const [logs, setLogs] = useState<string[]>([]);

  // ❌ 漏写 userId 依赖 → handleClick 永远用首次的 userId
  const handleClick = useCallback(() => {
    setLogs(prev => [...prev, \`clicked by \${userId}\`]);
  }, []); // 应该写 [userId]

  return <button onClick={handleClick}>记录</button>;
}
\`\`\`

**解决**：开 \`react-hooks/exhaustive-deps\` lint，它会强制你写全依赖。

**陷阱 2：依赖项过多导致引用频繁变化**

\`\`\`tsx
function Bad({ a, b, c, d }: { a: number; b: number; c: number; d: number }) {
  // 4 个依赖 → 任一变化函数都重建 → useCallback 失效
  const handleClick = useCallback(() => {
    console.log(a, b, c, d);
  }, [a, b, c, d]);
}
\`\`\`

**解决**：用 ref 保存最新值，让函数引用永远稳定：

\`\`\`tsx
import { useCallback, useRef } from "react";

function Good({ a, b, c, d }: { a: number; b: number; c: number; d: number }) {
  // 用 ref 保存最新的 props
  const latestRef = useRef({ a, b, c, d });
  latestRef.current = { a, b, c, d };

  // ✅ 函数引用永远稳定，但内部能读到最新的 props
  const handleClick = useCallback(() => {
    const { a, b, c, d } = latestRef.current;
    console.log(a, b, c, d);
  }, []);

  return <button onClick={handleClick}>记录</button>;
}
\`\`\`

**这种模式叫"latest ref pattern"**——适合"回调函数依赖太多但又需要稳定引用"的场景，比如传给第三方库的回调。

**陷阱 3：useCallback 包了 useState 的 setter（多余）**

\`\`\`tsx
function Bad() {
  const [count, setCount] = useState(0);

  // ❌ setCount 引用本来就稳定，useCallback 多余
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, [setCount]);
}
\`\`\`

**解决**：直接写 \`useCallback(() => setCount(c => c + 1), [])\`，setter 不用进依赖。

## 5. 何时**不**该用 useCallback

**反例 1：函数没传给子组件或 Hook**

\`\`\`tsx
function Bad() {
  const [count, setCount] = useState(0);

  // ❌ 这个函数只在自己组件里用，没有传出去 → useCallback 纯属多余
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return <button onClick={handleClick}>+1</button>;
}
\`\`\`

**解决**：直接写普通函数就行。

\`\`\`tsx
function Good() {
  const [count, setCount] = useState(0);
  const handleClick = () => setCount(c => c + 1);
  return <button onClick={handleClick}>+1</button>;
}
\`\`\`

**反例 2：子组件没用 React.memo**

\`\`\`tsx
function Parent() {
  // ❌ 子组件 Child 没用 memo 包，useCallback 没意义
  const handleClick = useCallback(() => {}, []);
  return <Child onClick={handleClick} />;
}

function Child({ onClick }: { onClick: () => void }) {
  // 没有 memo → 父组件渲染时 Child 必然重渲染
  return <button onClick={onClick}>x</button>;
}
\`\`\`

**判断标准**：useCallback 必须配合 React.memo（或 useRef/useEffect 依赖）才有意义。

**反例 3：依赖项每次都变**

\`\`\`tsx
function Bad({ data }: { data: { value: number } }) {
  // ❌ data 每次都是新对象 → useCallback 等于没用
  const handleClick = useCallback(() => {
    console.log(data.value);
  }, [data]);
}
\`\`\`

**解决**：在父层用 useMemo 缓存 data，或者用 latest ref pattern。

## 6. useCallback 与自定义 Hook

自定义 Hook 里返回函数时，**强烈建议用 useCallback 包裹**——因为使用者可能把返回的函数传给子组件或 useEffect 依赖：

\`\`\`tsx
import { useCallback, useState } from "react";

// 自定义 Hook：返回 toggle 函数
function useToggle(initial: boolean = false) {
  const [on, setOn] = useState(initial);

  // ✅ 用 useCallback 让返回的函数引用稳定
  // 这样使用者在 useEffect/useMemo 依赖里写 toggle 不会出问题
  const toggle = useCallback(() => {
    setOn(prev => !prev);
  }, []);

  const set = useCallback((value: boolean) => {
    setOn(value);
  }, []);

  return { on, toggle, set };
}

// 使用者
function Demo() {
  const { on, toggle } = useToggle(false);

  // ✅ toggle 引用稳定，effect 不会反复触发
  useEffect(() => {
    window.addEventListener("keydown", e => {
      if (e.key === "Enter") toggle();
    });
  }, [toggle]);
}
\`\`\`

**自定义 Hook 的经验法则**：返回的函数**一律**用 useCallback 包，返回的对象/数组**一律**用 useMemo 包。这是"防御性 API 设计"——你不知道使用者会怎么用，先保证引用稳定最安全。

## 小结

- useCallback 是 useMemo 的函数版语法糖，专门缓存函数引用。
- 三个使用场景：传给 memo 子组件、作为 useEffect 依赖、注册到外部库。
- 配合 React.memo 是性能优化标准模式，配合"函数式更新"让回调引用永远稳定。
- 不要滥用：没传出去的函数不用包，子组件没 memo 也不用包。
- 自定义 Hook 返回的函数建议一律 useCallback 包裹。

## 避坑清单

- ❌ 给所有函数都套 useCallback（缓存本身有成本）
- ❌ 子组件没用 React.memo 却用 useCallback 包回调（白费功夫）
- ❌ 漏写依赖导致闭包过期（开 exhaustive-deps lint）
- ❌ 把 setState 当依赖（setter 引用本来就稳定）
- ❌ 自定义 Hook 返回的函数不用 useCallback（使用者可能在 effect 里依赖它）

第五部分 Hooks 全解的中段就到这里。下一批我们会讲 useContext、useReducer、自定义 Hook 设计模式等内容。`
  },
];

export { chapters };
