// =============================================================
// TSX 教程 - 第五批章节（第八部分 useRef / useMemo / useCallback，共 5 章）
// -------------------------------------------------------------
// 覆盖：useRef 基础 / useRef 高级 / useMemo / useCallback / React.memo
// 每章包含详细讲解 + 多个代码示例 + 可运行 demo
// =============================================================

const chapters = [
  // ===========================================================
  // 第 36 章：useRef 基础
  // ===========================================================
  {
    id: "tsx2-ch36",
    group: "第八部分 useRef / useMemo / useCallback",
    icon: "📍",
    title: "第三十六章 useRef 基础",
    content: `# useRef 基础

\`useRef\` 是 React 提供的"盒子" Hook——它返回一个**跨渲染保持**的可变容器。本章从基础到访问 DOM，建立完整认知。

---

## 一、useRef 的本质

\`\`\`tsx
import { useRef } from "react";

const ref = useRef(initialValue);
// ref 的类型：{ current: T }
// 关键：ref 对象在组件整个生命周期中保持同一个引用
\`\`\`

**两大核心特性**：

1. **跨渲染持久**：组件重渲染时，\`ref.current\` 仍是上次的值
2. **不触发重渲染**：修改 \`ref.current\` **不会**导致组件重新渲染（与 useState 关键区别）

\`\`\`tsx
function RefVsState() {
  const [stateCount, setStateCount] = useState(0);
  const refCount = useRef(0);

  const handleState = () => setStateCount(stateCount + 1);  // 触发重渲染
  const handleRef = () => {
    refCount.current += 1;
    // refCount 变化不触发重渲染——但值确实改了
    console.log("ref:", refCount.current);
  };

  return (
    <>
      <p>state: {stateCount} (重渲染时会显示新值)</p>
      <p>ref: {refCount.current} (永远显示 render 时的快照)</p>
      <button onClick={handleState}>+ state</button>
      <button onClick={handleRef}>+ ref</button>
    </>
  );
}
\`\`\`

> 💡 **核心区别**：
> - \`useState\`：state 变化 → 触发重渲染 → UI 更新
> - \`useRef\`：ref 变化 → 不重渲染 → 仅控制台 / 调试可见

---

## 二、useRef 访问 DOM

最常见的用法——获取 DOM 节点的引用：

\`\`\`tsx
import { useRef } from "react";

function FocusInput() {
  // 泛型指定 ref 指向的 DOM 类型
  // 初始值传 null——挂载前 ref 还没绑定
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    // 可选链 ?.：挂载前 ref.current 是 null
    inputRef.current?.focus();
  };

  const handleSelect = () => {
    inputRef.current?.select();  // 全选
  };

  return (
    <>
      <input ref={inputRef} placeholder="自动聚焦" />
      <button onClick={handleFocus}>聚焦</button>
      <button onClick={handleSelect}>全选</button>
    </>
  );
}
\`\`\`

**执行流程**：
1. 组件挂载前：\`inputRef.current === null\`
2. 渲染时 React 看到 \`ref={inputRef}\`，挂载后设置 \`inputRef.current = <input DOM>\`
3. 点击按钮时 \`inputRef.current?.focus()\` 操作真实 DOM

---

## 三、TypeScript 类型注解

\`\`\`tsx
// 1. 普通元素
const divRef = useRef<HTMLDivElement>(null);
const buttonRef = useRef<HTMLButtonElement>(null);
const inputRef = useRef<HTMLInputElement>(null);
const formRef = useRef<HTMLFormElement>(null);
const textareaRef = useRef<HTMLTextAreaElement>(null);
const selectRef = useRef<HTMLSelectElement>(null);

// 2. 用泛型显式指定 ref 元素类型
function TextInput() {
  const ref = useRef<HTMLInputElement>(null);
  // ref.current 自动推断为 HTMLInputElement | null
  return <input ref={ref} />;
}

// 3. 类组件实例
class MyComp extends React.Component<{ name: string }> {}
const compRef = useRef<MyComp>(null);
// 访问：compRef.current?.someMethod()
\`\`\`

> 💡 **可选链必不可少**：\`inputRef.current?.value\`——\`.current\` 在挂载前是 null，访问属性会运行时报错。

---

## 四、典型 DOM 操作场景

### 场景 1：自动聚焦

\`\`\`tsx
function AutoFocus() {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 挂载后自动聚焦
    ref.current?.focus();
  }, []);

  return <input ref={ref} placeholder="自动聚焦" />;
}
\`\`\`

### 场景 2：滚动到某元素

\`\`\`tsx
function ScrollDemo() {
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <button onClick={scrollToTop}>到顶部</button>
      <button onClick={scrollToBottom}>到底部</button>
      <div
        ref={listRef}
        style={{ height: 200, overflow: "auto", border: "1px solid #ccc" }}
      >
        {Array.from({ length: 50 }, (_, i) => (
          <p key={i}>Item {i}</p>
        ))}
      </div>
    </>
  );
}
\`\`\`

### 场景 3：测量元素尺寸

\`\`\`tsx
function Measure() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const measure = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });
  };

  return (
    <>
      <button onClick={measure}>测量</button>
      <div ref={ref} style={{ padding: 20, background: "#f0f0f0" }}>
        内容
      </div>
      <p>尺寸: {size.width} x {size.height}</p>
    </>
  );
}
\`\`\`

### 场景 4：媒体播放控制

\`\`\`tsx
function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const play = () => videoRef.current?.play();
  const pause = () => videoRef.current?.pause();
  const restart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  return (
    <>
      <video ref={videoRef} src="/video.mp4" style={{ width: 400 }} />
      <button onClick={play}>播放</button>
      <button onClick={pause}>暂停</button>
      <button onClick={restart}>重播</button>
    </>
  );
}
\`\`\`

---

## 五、useRef 存任意值

\`useRef\` 不只能存 DOM——任何跨渲染需要保持的可变值都行：

\`\`\`tsx
function AnyValue() {
  // 存计数器（但不需要触发 UI 更新）
  const clickCount = useRef(0);
  // 存定时器 id
  const timerId = useRef<number | null>(null);
  // 存上一次的值
  const prevValue = useRef<number>(0);
  // 存任意对象
  const config = useRef({ theme: "light" });

  return (
    <button
      onClick={() => {
        clickCount.current += 1;
        console.log("点击次数:", clickCount.current);
      }}
    >
      点击
    </button>
  );
}
\`\`\`

> 💡 **当 ref 存"非 DOM"值时**：通常配合 useEffect 或事件处理使用。**不能**直接渲染 ref.current 看到最新值（因为不重渲染）。

---

## 六、useState vs useRef 对比

| 维度 | useState | useRef |
| --- | --- | --- |
| 触发重渲染 | ✅ 是 | ❌ 否 |
| 跨渲染保持 | ✅ 是 | ✅ 是 |
| 直接 mutation | ❌ 不可变更新 | ✅ 可以改 \`.current\` |
| 适合存储 | UI 状态 | DOM、定时器 ID、上次值 |
| 在 JSX 中显示 | \`{value}\` | \`{ref.current}\` 但不会自动更新 |

\`\`\`tsx
// 用 state 显示数据；用 ref 存"幕后"数据
function Both() {
  const [count, setCount] = useState(0);  // 显示用
  const lastClickTime = useRef<number>(0);  // 不显示

  return (
    <button
      onClick={() => {
        setCount(count + 1);
        lastClickTime.current = Date.now();  // 记录，不显示
      }}
    >
      点击 {count} 次
    </button>
  );
}
\`\`\`

---

## 七、完整 Demo：useRef 基础综合

\`\`\`tsx
// 完整 Demo：useRef 基础综合
import React, { useRef, useState, useEffect } from "react";

function RefBasics() {
  // ---------- 1. DOM 引用 ----------
  const nameInputRef = useRef<HTMLInputElement>(null);
  const bioTextareaRef = useRef<HTMLTextAreaElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ---------- 2. 任意值引用 ----------
  const renderCount = useRef(0);
  renderCount.current += 1;  // 每次渲染 +1

  const clickHistory = useRef<number[]>([]);
  const lastClickTimeRef = useRef<number>(0);

  // ---------- 3. 显示用 state ----------
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isPlaying, setIsPlaying] = useState(false);

  // ---------- 操作函数 ----------
  const focusName = () => nameInputRef.current?.focus();
  const selectAll = () => {
    nameInputRef.current?.select();
  };
  const clearBio = () => {
    if (bioTextareaRef.current) {
      bioTextareaRef.current.value = "";
    }
  };
  const measureBox = () => {
    if (boxRef.current) {
      const r = boxRef.current.getBoundingClientRect();
      setSize({ width: Math.round(r.width), height: Math.round(r.height) });
    }
  };
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };
  const recordClick = () => {
    const now = Date.now();
    clickHistory.current.push(now);
    lastClickTimeRef.current = now;
    console.log(\`第 \${clickHistory.current.length} 次点击\`);
  };

  // 自动聚焦
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h2>useRef 基础 Demo</h2>
      <p>渲染次数: {renderCount.current}（不显示在 UI，但确实在加）</p>

      <h3>1. DOM 操作</h3>
      <input ref={nameInputRef} placeholder="姓名" />
      <button onClick={focusName}>聚焦</button>
      <button onClick={selectAll}>全选</button>

      <h3>2. 测量元素</h3>
      <div
        ref={boxRef}
        style={{
          width: 200,
          height: 100,
          background: "#e3f2fd",
          padding: 16,
          margin: "8px 0",
        }}
      >
        测量我
      </div>
      <button onClick={measureBox}>测量</button>
      {size.width > 0 && <p>尺寸: {size.width} x {size.height}</p>}

      <h3>3. 修改 uncontrolled 值</h3>
      <textarea ref={bioTextareaRef} defaultValue="默认值" rows={3} />
      <button onClick={clearBio}>清空</button>

      <h3>4. 媒体控制</h3>
      <video
        ref={videoRef}
        src="data:video/mp4;base64,AAAA"
        style={{ width: 200, background: "#000" }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button onClick={togglePlay}>{isPlaying ? "暂停" : "播放"}</button>

      <h3>5. 任意值 ref</h3>
      <button onClick={recordClick}>记录点击（看控制台）</button>
      <p>最近点击: {new Date(lastClickTimeRef.current || 0).toLocaleTimeString() || "（无）"}</p>
    </div>
  );
}

export default RefBasics;
\`\`\`

---

## 小结

本章核心知识点：

1. **useRef 本质**：返回 \`{ current: T }\` 的可变容器，跨渲染保持
2. **关键特性**：
   - 修改 \`.current\` **不触发重渲染**
   - 同一个 ref 对象在组件整个生命周期保持
3. **访问 DOM**：\`ref\` prop + \`useRef<HTMLElement>(null)\`
4. **TypeScript**：泛型指定元素类型，\`?.\` 可选链防 null
5. **存任意值**：定时器 ID、上次值、计数器等
6. **state vs ref**：
   - state：UI 状态，会触发重渲染
   - ref：幕后数据，不触发重渲染

下一章深入**useRef 高级用法**——存上次值、回调 ref、forwardRef 等。`,
  },
  // ===========================================================
  // 第 37 章：useRef 高级用法
  // ===========================================================
  {
    id: "tsx2-ch37",
    group: "第八部分 useRef / useMemo / useCallback",
    icon: "🎯",
    title: "第三十七章 useRef 高级用法",
    content: `# useRef 高级用法

本章深入 useRef 的进阶模式：存上次值、定时器、回调 ref、forwardRef 等——这些是真实项目的核心技巧。

---

## 一、存上一次的值

\`useRef\` 配合 \`useEffect\` 可以追踪**上一次**的 props 或 state：

\`\`\`tsx
import { useState, useEffect, useRef } from "react";

function usePrevious<T>(value: T): T | undefined {
  // 创建一个 ref 存上次值
  const ref = useRef<T>();

  // 每次 value 变化时，effect 中更新 ref.current
  useEffect(() => {
    ref.current = value;
  }, [value]);

  // 返回的是"上一次"的值（首次是 undefined）
  return ref.current;
}

function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <>
      <p>当前: {count}, 上次: {prevCount ?? "(无)"}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </>
  );
}
\`\`\`

**原理**：
- 首次渲染：\`ref.current = undefined\`，返回 \`undefined\`
- 第二次渲染前（count 变成 1）：effect 先跑，\`ref.current = 1\`
- 第二次渲染时：返回的是 effect 设置过的 \`ref.current\`，也就是上次的 1
- 但这次渲染时，\`useState(1)\` 的 count 是新值 1，返回的 prevCount 是 0

> 💡 这个 hook 是对比 props/state 变化的常用工具。

---

## 二、存定时器 ID / 请求控制器

\`\`\`tsx
function TimerWithRef() {
  const [seconds, setSeconds] = useState(0);
  // 用 ref 存定时器 id
  const intervalRef = useRef<number | null>(null);

  const start = () => {
    if (intervalRef.current) return;  // 防止重复启动
    intervalRef.current = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 卸载时清理
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <>
      <p>seconds: {seconds}</p>
      <button onClick={start}>开始</button>
      <button onClick={stop}>停止</button>
    </>
  );
}
\`\`\`

> 💡 **为什么用 ref 而不是 useState？** timer ID 是"幕后数据"，存进 state 会触发重渲染。ref 更合适。

---

## 三、解决 stale state 的 ref 技巧

\`\`\`tsx
function StaleFreeTimer() {
  const [count, setCount] = useState(0);

  // ref 永远存最新 count
  const countRef = useRef(count);
  useEffect(() => {
    countRef.current = count;  // 每次 count 变化同步到 ref
  });

  useEffect(() => {
    // 闭包中读 ref 而不是 state
    const id = setInterval(() => {
      // 用函数式 setState 也行，但 ref 更直接
      setCount((c) => c + 1);
      // 或者：countRef.current += 1; 但这不触发 UI 更新
    }, 1000);
    return () => clearInterval(id);
  }, []);  // 空依赖——避免每次 count 变化重启定时器

  return <p>{count}</p>;
}
\`\`\`

> 💡 **核心模式**：在 effect 中 \`ref.current = value\` 同步最新值，effect 内用 ref 读取——既不重置 effect，又能拿到最新值。

---

## 四、回调 ref（Callback Ref）

有些场景需要"动态创建 ref"或"通知父组件"——用**回调 ref**（一个函数）：

\`\`\`tsx
// 1. 基础：函数作为 ref
function CallbackRefBasic() {
  const [height, setHeight] = useState(0);

  // 回调 ref：元素挂载时调用，卸载时传 null
  const measureRef = (node: HTMLDivElement | null) => {
    if (node) {
      setHeight(node.getBoundingClientRect().height);
    }
  };

  return (
    <>
      <div ref={measureRef} style={{ padding: 20, background: "#f0f0f0" }}>
        内容
      </div>
      <p>高度: {height}</p>
    </>
  );
}

// 2. 通知父组件：传 ref 给子组件
function Parent() {
  const [childHeight, setChildHeight] = useState(0);

  return (
    <>
      <Child onMount={(node) => {
        if (node) setChildHeight(node.getBoundingClientRect().height);
      }} />
      <p>子组件高度: {childHeight}</p>
    </>
  );
}

function Child({ onMount }: { onMount: (node: HTMLDivElement | null) => void }) {
  return <div ref={onMount}>Child</div>;
}
\`\`\`

> 💡 **回调 ref vs 对象 ref**：
> - 对象 ref：用 \`useRef\` + \`ref\` prop
> - 回调 ref：直接传函数，React 在挂载/卸载时调用
> - 回调 ref 更灵活（可以传参、通知父组件、做测量）

### 进阶：useCallback 包装的回调 ref

\`\`\`tsx
function StableCallbackRef() {
  const [height, setHeight] = useState(0);

  // 用 useCallback 包装，避免每次渲染创建新函数
  // 不包装会导致子组件误以为 ref 变化，重复挂载
  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setHeight(node.getBoundingClientRect().height);
    }
  }, []);

  return (
    <>
      <div ref={measureRef}>内容</div>
      <p>高度: {height}</p>
    </>
  );
}
\`\`\`

---

## 五、useImperativeHandle + forwardRef

默认情况下，父组件通过 ref 拿不到子组件的**自定义方法**。\`useImperativeHandle\` 配合 \`forwardRef\` 可以暴露特定 API：

\`\`\`tsx
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

// 1. 先定义 ref 的类型（TypeScript）
type InputRef = {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
};

// 2. 子组件用 forwardRef 包裹，ref 作为第二参数
const FancyInput = forwardRef<InputRef, { placeholder?: string }>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    clear: () => {
      if (inputRef.current) inputRef.current.value = "";
    },
    getValue: () => {
      return inputRef.current?.value ?? "";
    },
  }));

  return <input ref={inputRef} placeholder={props.placeholder} />;
});

// 3. 父组件使用
function App() {
  const inputRef = useRef<InputRef>(null);

  const handleFocus = () => inputRef.current?.focus();
  const handleClear = () => inputRef.current?.clear();
  const handleGetValue = () => {
    alert("当前值: " + inputRef.current?.getValue());
  };

  return (
    <>
      <FancyInput ref={inputRef} placeholder="受控" />
      <button onClick={handleFocus}>聚焦</button>
      <button onClick={handleClear}>清空</button>
      <button onClick={handleGetValue}>取值</button>
    </>
  );
}
\`\`\`

**完整签名说明**：
- \`forwardRef<RefType, PropsType>((props, ref) => ...)\`——泛型先 ref 后 props
- \`useImperativeHandle(ref, () => apiObject)\`——定义暴露的 API
- 父组件用 \`useRef<RefType>(null)\` 拿到，调用 \`ref.current?.xxx()\`

---

## 六、useRef 实现自定义 hook

\`\`\`tsx
// 自定义 hook：跟踪组件是否首次渲染
function useIsFirstRender(): boolean {
  const isFirst = useRef(true);
  if (isFirst.current) {
    isFirst.current = false;
    return true;  // 首次返回 true
  }
  return false;  // 后续返回 false
}

// 使用
function Demo() {
  const isFirst = useIsFirstRender();
  return <p>{isFirst ? "首次渲染" : "非首次"}</p>;
}

// 自定义 hook：拿到最新 state 给异步回调用
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

// 使用：setTimeout 中读最新 count
function Timer() {
  const [count, setCount] = useState(0);
  const latestCount = useLatest(count);

  useEffect(() => {
    const id = setInterval(() => {
      console.log("最新 count:", latestCount.current);
    }, 1000);
    return () => clearInterval(id);
  }, []);  // 空依赖——但通过 latestCount.current 读最新

  return <button onClick={() => setCount(count + 1)}>count: {count}</button>;
}
\`\`\`

---

## 七、完整 Demo：useRef 高级用法综合

\`\`\`tsx
// 完整 Demo：useRef 高级用法综合
import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";

// ---------- 1. usePrevious 演示 ----------
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}

function PreviousDemo() {
  const [name, setName] = useState("");
  const prevName = usePrevious(name);
  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="输入看上次值" />
      <p>当前: "{name || "(空)"}", 上次: "{prevName ?? "(无)"}"</p>
    </div>
  );
}

// ---------- 2. forwardRef + useImperativeHandle ----------
type CounterRef = {
  increment: () => void;
  reset: () => void;
  getCount: () => number;
};

const FancyCounter = forwardRef<CounterRef, { initial?: number }>((props, ref) => {
  const [count, setCount] = useState(props.initial ?? 0);

  useImperativeHandle(ref, () => ({
    increment: () => setCount((c) => c + 1),
    reset: () => setCount(props.initial ?? 0),
    getCount: () => count,
  }));

  return <p>计数: {count}</p>;
});

function ForwardRefDemo() {
  const counterRef = useRef<CounterRef>(null);

  return (
    <div>
      <FancyCounter ref={counterRef} initial={10} />
      <button onClick={() => counterRef.current?.increment()}>外部 +1</button>
      <button onClick={() => counterRef.current?.reset()}>外部重置</button>
      <button onClick={() => alert("值: " + counterRef.current?.getCount())}>读值</button>
    </div>
  );
}

// ---------- 3. 回调 ref 测量 ----------
function CallbackRefDemo() {
  const [sizes, setSizes] = useState<Array<{ w: number; h: number }>>([]);

  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const r = node.getBoundingClientRect();
      setSizes((prev) => [...prev, { w: Math.round(r.width), h: Math.round(r.height) }]);
    }
  }, []);

  return (
    <div>
      <div
        ref={measureRef}
        style={{ width: 200, height: 100, background: "#ffeb3b", padding: 8 }}
      >
        测量这个 div（每次渲染都测量）
      </div>
      <p>历史: {JSON.stringify(sizes.slice(-3))}</p>
    </div>
  );
}

// ---------- 4. 主组件 ----------
function AdvancedRefDemo() {
  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h2>useRef 高级 Demo</h2>

      <h3>1. usePrevious（追踪上次值）</h3>
      <PreviousDemo />

      <h3>2. forwardRef + useImperativeHandle（暴露 API）</h3>
      <ForwardRefDemo />

      <h3>3. 回调 ref（动态测量）</h3>
      <CallbackRefDemo />
    </div>
  );
}

export default AdvancedRefDemo;
\`\`\`

---

## 八、useRef 速查表

| 场景 | 模式 |
| --- | --- |
| DOM 访问 | \`useRef<HTMLInputElement>(null)\` + \`ref\` prop |
| 存上次值 | \`useRef\` + \`useEffect\` 同步 |
| 存定时器 ID | \`useRef<number>\` |
| 跨渲染数据（不显示）| \`useRef\` |
| 避免 stale 闭包 | \`ref.current = value\` 同步 + effect 内用 ref |
| 测量元素 | 回调 ref + \`getBoundingClientRect\` |
| 暴露子组件方法 | \`forwardRef\` + \`useImperativeHandle\` |
| 自定义 hook | \`usePrevious\`、\`useLatest\`、\`useIsFirstRender\` |

---

## 小结

本章核心知识点：

1. **usePrevious**：\`useRef + useEffect\` 追踪上次值
2. **存定时器 ID**：防止 stale，比 useState 更合适
3. **stale 闭包解决**：effect 中同步 \`ref.current\`
4. **回调 ref**：函数式 ref，可以传参、通知、测量
5. **forwardRef + useImperativeHandle**：父组件调用子组件方法
6. **自定义 hook**：\`usePrevious\`、\`useLatest\`、\`useIsFirstRender\`

下一章 **useMemo**——昂贵计算的缓存机制。`,
  },
  // ===========================================================
  // 第 38 章：useMemo
  // ===========================================================
  {
    id: "tsx2-ch38",
    group: "第八部分 useRef / useMemo / useCallback",
    icon: "💾",
    title: "第三十八章 useMemo",
    content: `# useMemo

\`useMemo\` 用来**缓存计算结果**——只有依赖变化时才重新计算。本章从基础到合理使用，建立性能优化的正确认知。

---

## 一、useMemo 基本语法

\`\`\`tsx
import { useMemo } from "react";

const memoizedValue = useMemo(
  () => computeExpensiveValue(a, b),
  [a, b]  // 依赖
);
// 语义：仅当 a 或 b 变化时才重算 computeExpensiveValue
\`\`\`

**返回**：缓存的计算结果
**参数 1**：计算函数
**参数 2**：依赖数组（与 useEffect 类似）

---

## 二、useMemo 解决什么问题？

### 场景 1：避免昂贵计算

\`\`\`tsx
function Expensive({ numbers }: { numbers: number[] }) {
  const [count, setCount] = useState(0);

  // ❌ 错：每次渲染都重新排序（即使 numbers 没变）
  const sorted = numbers.sort((a, b) => a - b);

  // ✅ 对：用 useMemo 缓存排序结果
  const sortedMemo = useMemo(() => {
    console.log("重新排序");
    return [...numbers].sort((a, b) => a - b);
  }, [numbers]);  // 只有 numbers 变化才重算

  return (
    <>
      <p>排序: {sortedMemo.join(", ")}</p>
      <button onClick={() => setCount(count + 1)}>count: {count}</button>
      {/* 点 count 时不触发重排序 */}
    </>
  );
}
\`\`\`

### 场景 2：避免引用变化导致子组件重渲染

\`\`\`tsx
const Child = React.memo(function Child({ config }: { config: { theme: string } }) {
  console.log("Child 渲染");
  return <p>主题: {config.theme}</p>;
});

function Parent() {
  const [count, setCount] = useState(0);

  // ❌ 错：每次渲染都创建新对象，Child 每次都重渲染
  const config = { theme: "light" };

  // ✅ 对：useMemo 缓存，引用稳定
  const configMemo = useMemo(() => ({ theme: "light" }), []);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>count: {count}</button>
      <Child config={configMemo} />  {/* count 变化不触发 Child 重渲染 */}
    </>
  );
}
\`\`\`

---

## 三、useMemo 与 useEffect 依赖

\`useMemo\` 内部可以用其他 state/props，但**必须都加入依赖**：

\`\`\`tsx
function Deps({ userId, postId }: { userId: number; postId: number }) {
  const [extra, setExtra] = useState(0);

  // 计算 user 的总积分
  const userScore = useMemo(() => {
    // 模拟基于 userId + extra 的计算
    return userId * 10 + extra;
  }, [userId, extra]);  // userId 或 extra 变化重算

  return (
    <>
      <p>用户 {userId} 分数: {userScore}</p>
      <button onClick={() => setExtra(extra + 1)}>extra: {extra}</button>
    </>
  );
}
\`\`\`

---

## 四、何时该用 useMemo

### 应该用

| 场景 | 原因 |
| --- | --- |
| 昂贵计算（排序、过滤、复杂对象构建）| 避免重复计算 |
| 引用稳定性（传给 React.memo 子组件的对象/数组）| 避免子组件不必要的重渲染 |
| 引用稳定性（用作 useEffect / useCallback 依赖）| 避免下游连锁触发 |
| 防止每次渲染创建大对象 | 减轻 GC 压力 |

### 不应该用

\`\`\`tsx
// ❌ 反模式 1：缓存简单计算
const a = 1;
const b = 2;
const sum = useMemo(() => a + b, [a, b]);  // 比 a + b 更慢（多了 hook 开销）

// ❌ 反模式 2：缓存只在本组件用的值
const [name, setName] = useState("");
const upperName = useMemo(() => name.toUpperCase(), [name]);
// useMemo 本身有开销——简单字符串处理反而更慢

// ❌ 反模式 3：依赖写错
const value = useMemo(() => compute(a, b), [a]);  // 漏 b
\`\`\`

> 💡 **金科玉律**：\`useMemo\` 是**优化**，不是**正确性保证**。先写出能跑的代码，性能问题出现时再加 useMemo。

---

## 五、useMemo 性能开销

\`useMemo\` 本身也有成本：
- 每次渲染需要比较依赖数组（浅比较）
- 闭包存储旧值
- 极简计算反而更慢

\`\`\`tsx
// 测量 useMemo 的成本
function Test() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);

  // ❌ 没有 useMemo
  const direct = { value: a + b };

  // ✅ 有 useMemo
  const memoized = useMemo(() => ({ value: a + b }), [a, b]);

  // 通常：直接计算更快（除非计算真的很昂贵）
}
\`\`\`

---

## 六、useMemo 实战：过滤 + 排序

\`\`\`tsx
type Item = { id: number; name: string; price: number; active: boolean };

function ItemList({ items, keyword, sortBy }: {
  items: Item[];
  keyword: string;
  sortBy: "name" | "price";
}) {
  // 缓存过滤结果
  const filtered = useMemo(() => {
    console.log("过滤");
    return items.filter((i) => i.name.includes(keyword));
  }, [items, keyword]);

  // 缓存排序结果——基于已过滤的列表
  const sorted = useMemo(() => {
    console.log("排序");
    return [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return a.price - b.price;
    });
  }, [filtered, sortBy]);

  return (
    <ul>
      {sorted.map((i) => <li key={i.id}>{i.name} - ¥{i.price}</li>)}
    </ul>
  );
}
\`\`\`

> 💡 **多步骤缓存**：每个 \`useMemo\` 只缓存一步操作；按依赖链自动级联。

---

## 七、useMemo 与 React.memo 配合

\`useMemo\` 的核心价值是**保持引用稳定**，让 \`React.memo\` 子组件不重渲染：

\`\`\`tsx
// 子组件用 React.memo
const Item = React.memo(function Item({ item, onClick }: {
  item: Item;
  onClick: (id: number) => void;
}) {
  console.log("Item 渲染:", item.id);
  return <li onClick={() => onClick(item.id)}>{item.name}</li>;
});

function Parent() {
  const [items] = useState([
    { id: 1, name: "A" },
    { id: 2, name: "B" },
  ]);
  const [selected, setSelected] = useState<number | null>(null);

  // useCallback 缓存函数（下一章）
  const handleClick = useCallback((id: number) => setSelected(id), []);

  // 即使不用 useMemo 缓存 items，子组件引用也没变（因为是 useState 初始值）
  // 但如果 items 是父组件计算出来的：
  const processed = useMemo(() =>
    items.map((i) => ({ ...i, processed: true })),
    [items]
  );

  return (
    <>
      <p>选中: {selected ?? "无"}</p>
      <ul>
        {processed.map((item) => (
          // key + 稳定引用 + useCallback = 子组件不重渲染
          <Item key={item.id} item={item} onClick={handleClick} />
        ))}
      </ul>
    </>
  );
}
\`\`\`

**完整链路**：
1. 父组件 \`selected\` 变化（不影响 items）
2. \`useMemo\` 返回缓存的 \`processed\`（引用不变）
3. \`useCallback\` 返回缓存的 \`handleClick\`（引用不变）
4. \`Item\` 的 \`item\` 和 \`onClick\` 都没变
5. \`React.memo\` 比较浅相等 → \`Item\` **不重渲染**

---

## 八、完整 Demo：useMemo 综合

\`\`\`tsx
// 完整 Demo：useMemo 综合应用
import React, { useState, useMemo, useCallback } from "react";

type Item = { id: number; name: string; price: number };

const Item = React.memo(function Item({ item, onClick }: {
  item: Item;
  onClick: (id: number) => void;
}) {
  console.log(\`[Item \${item.id}] 渲染\`);
  return (
    <li onClick={() => onClick(item.id)} style={{ cursor: "pointer" }}>
      {item.name} - ¥{item.price}
    </li>
  );
});

function MemoDemo() {
  const [items] = useState<Item[]>([
    { id: 1, name: "苹果", price: 5 },
    { id: 2, name: "香蕉", price: 3 },
    { id: 3, name: "橘子", price: 4 },
    { id: 4, name: "西瓜", price: 20 },
  ]);

  const [keyword, setKeyword] = useState("");
  const [maxPrice, setMaxPrice] = useState(100);
  const [sortBy, setSortBy] = useState<"name" | "price">("name");
  const [selected, setSelected] = useState<number | null>(null);
  const [otherCount, setOtherCount] = useState(0);

  // ---------- 1. 缓存过滤结果 ----------
  const filtered = useMemo(() => {
    console.log("【过滤】");
    return items.filter((i) =>
      i.name.includes(keyword) && i.price <= maxPrice
    );
  }, [items, keyword, maxPrice]);

  // ---------- 2. 缓存排序结果 ----------
  const sorted = useMemo(() => {
    console.log("【排序】");
    return [...filtered].sort((a, b) =>
      sortBy === "name"
        ? a.name.localeCompare(b.name)
        : a.price - b.price
    );
  }, [filtered, sortBy]);

  // ---------- 3. 缓存统计 ----------
  const stats = useMemo(() => {
    console.log("【统计】");
    return {
      count: sorted.length,
      total: sorted.reduce((sum, i) => sum + i.price, 0),
      avg: sorted.length ? sorted.reduce((s, i) => s + i.price, 0) / sorted.length : 0,
    };
  }, [sorted]);

  // ---------- 4. 缓存回调（下一章详解）----------
  const handleClick = useCallback((id: number) => setSelected(id), []);

  return (
    <div style={{ padding: 16 }}>
      <h2>useMemo Demo</h2>
      <p>选中: {selected ?? "无"}</p>

      <div>
        <input
          placeholder="搜索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <label>
          最高价: {maxPrice}
          <input
            type="range"
            min={0}
            max={30}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
        </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "name" | "price")}>
          <option value="name">按名称</option>
          <option value="price">按价格</option>
        </select>
      </div>

      <h3>商品列表（{stats.count} 项，总 ¥{stats.total}，均价 ¥{stats.avg.toFixed(1)}）</h3>
      <ul>
        {sorted.map((i) => (
          <Item key={i.id} item={i} onClick={handleClick} />
        ))}
      </ul>

      <h3>其他 state（不影响商品列表）</h3>
      <button onClick={() => setOtherCount(otherCount + 1)}>
        otherCount: {otherCount}
      </button>
      <p style={{ fontSize: 12, color: "#666" }}>
        💡 点 otherCount 时：列表不重新过滤/排序（控制台没日志）
        💡 打开控制台看 Item 是否在重渲染
      </p>
    </div>
  );
}

export default MemoDemo;
\`\`\`

**实验步骤**：
1. 输入关键字、改 maxPrice、排序方式 → 看控制台日志
2. 点 otherCount → 不应有"过滤"、"排序"、"统计"日志
3. 选中商品 → Item 也不应重渲染（因为 props 没变）

---

## 小结

本章核心知识点：

1. **基本语法**：\`useMemo(() => compute(...), [deps])\`
2. **核心价值**：
   - 缓存昂贵计算
   - 保持引用稳定，配合 React.memo / useEffect / useCallback
3. **何时用**：
   - 确实昂贵的计算
   - 需要稳定引用的对象/数组
   - 传给子组件的派生数据
4. **何时不用**：
   - 简单计算
   - 只在本组件用、不传出去
   - 依赖写错时（缓存失效）
5. **useMemo 是优化而非正确性**：先写对，再加 memo
6. **多步骤缓存**：链式 \`useMemo\`，每步只缓存自己的依赖

下一章 **useCallback**——函数引用的缓存。`,
  },
  // ===========================================================
  // 第 39 章：useCallback
  // ===========================================================
  {
    id: "tsx2-ch39",
    group: "第八部分 useRef / useMemo / useCallback",
    icon: "🔁",
    title: "第三十九章 useCallback",
    content: `# useCallback

\`useCallback\` 是 \`useMemo\` 的特例——专门用于**缓存函数引用**。本章从基础到 React.memo 配合，建立完整认知。

---

## 一、useCallback 基本语法

\`\`\`tsx
import { useCallback } from "react";

const memoizedFn = useCallback(
  (...args) => {
    // 函数体
  },
  [a, b]  // 依赖
);
// 语义：仅当 a 或 b 变化时，才返回新函数；否则返回缓存的同一个函数
\`\`\`

**本质**：\`useCallback(fn, deps)\` ≈ \`useMemo(() => fn, deps)\`

\`\`\`tsx
// 这两个等价
const fn1 = useCallback(() => doSomething(a, b), [a, b]);
const fn2 = useMemo(() => () => doSomething(a, b), [a, b]);
\`\`\`

---

## 二、为什么需要缓存函数？

\`\`\`tsx
function WithoutCallback() {
  const [count, setCount] = useState(0);

  // 每次渲染都创建新函数
  const handleClick = () => {
    console.log("Clicked at count =", count);
  };

  return <Child onClick={handleClick} />;
}

// 子组件用 React.memo
const Child = React.memo(function Child({ onClick }: { onClick: () => void }) {
  console.log("Child 渲染");
  return <button onClick={onClick}>Click</button>;
});

// 问题：count 变化时
// 1. Parent 重新渲染
// 2. handleClick 是新函数（引用不同）
// 3. Child 的 onClick prop 引用变了
// 4. React.memo 浅比较失败
// 5. Child 不必要地重渲染
\`\`\`

**用 useCallback 解决**：

\`\`\`tsx
function WithCallback() {
  const [count, setCount] = useState(0);

  // ✅ 缓存函数：count 变化才更新引用
  const handleClick = useCallback(() => {
    console.log("Clicked at count =", count);
  }, [count]);  // count 变化时 handleClick 才更新

  return <Child onClick={handleClick} />;
}
\`\`\`

---

## 三、useCallback 依赖项

依赖项决定**函数何时更新**：

\`\`\`tsx
function Deps({ userId, onComplete }: { userId: number; onComplete: (id: number) => void }) {
  // 情况 1：无依赖——空数组，函数永远不变
  const handler1 = useCallback(() => {
    console.log("Hello");
  }, []);

  // 情况 2：依赖 props
  const handler2 = useCallback(() => {
    console.log("userId:", userId);
  }, [userId]);

  // 情况 3：依赖其他函数
  const handler3 = useCallback(() => {
    onComplete(userId);
  }, [userId, onComplete]);  // onComplete 变化也要更新

  return <div>...</div>;
}
\`\`\`

> ⚠️ **闭包陷阱**：依赖项是函数捕获的"外部值"。漏写依赖会导致函数内读到旧值。

---

## 四、useCallback 核心场景

### 场景 1：React.memo 子组件

\`\`\`tsx
const Child = React.memo(function Child({ onClick, onDelete }: {
  onClick: () => void;
  onDelete: (id: number) => void;
}) {
  return (
    <>
      <button onClick={onClick}>Click</button>
      <button onClick={() => onDelete(1)}>Delete</button>
    </>
  );
});

function Parent() {
  const [count, setCount] = useState(0);

  // 必须 useCallback，否则 Child 每次都重渲染
  const handleClick = useCallback(() => {
    console.log("Click");
  }, []);

  const handleDelete = useCallback((id: number) => {
    console.log("Delete", id);
  }, []);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>count: {count}</button>
      <Child onClick={handleClick} onDelete={handleDelete} />
    </>
  );
}
\`\`\`

### 场景 2：useEffect 依赖函数

\`\`\`tsx
function TimerWithCb() {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);

  // handleTick 引用稳定，effect 只挂载时跑一次
  const handleTick = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  useEffect(() => {
    const id = setInterval(handleTick, 1000);
    return () => clearInterval(id);
  }, [handleTick]);  // handleTick 不变 → effect 不重启

  return <p>{count}</p>;
}
\`\`\`

### 场景 3：useMemo 依赖函数

\`\`\`tsx
function DataProcess() {
  const [data] = useState([1, 2, 3, 4, 5]);
  const [multiplier, setMultiplier] = useState(2);

  // 缓存的 transform 函数
  const transform = useCallback((n: number) => n * multiplier, [multiplier]);

  // 缓存的处理结果
  const result = useMemo(() => {
    return data.map(transform);
  }, [data, transform]);  // transform 引用稳定

  return <p>{result.join(", ")}</p>;
}
\`\`\`

### 场景 4：自定义 hook 返回函数

\`\`\`tsx
// 自定义 hook
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  // 返回稳定的 toggle 函数
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle] as const;
}

// 使用
function Demo() {
  const [open, toggleOpen] = useToggle(false);
  return <button onClick={toggleOpen}>{open ? "开" : "关"}</button>;
}
\`\`\`

---

## 五、useCallback 性能成本

\`useCallback\` 不是免费的：

\`\`\`tsx
// useCallback 内部需要：
// 1. 比较依赖数组（浅比较 N 个值）
// 2. 存储/检索缓存的函数引用
// 3. 维护闭包

// 对比"不缓存"：
const fn = () => doSomething();  // 直接创建新函数，零开销
\`\`\`

**什么时候不用 useCallback**：
- 简单组件（无 React.memo 子组件）——增加开销
- 不传给子组件的函数
- 内部事件处理（如 \`onClick={() => ...}\`）——传递的函数本来就是临时的

\`\`\`tsx
// ❌ 不该用：内部事件处理
function Wrong() {
  const [count, setCount] = useState(0);
  // 这里 useCallback 没必要——onClick 不传给子组件
  const handleClick = useCallback(() => setCount(count + 1), [count]);
  return <button onClick={handleClick}>+</button>;
  // 实际上 <button> 不在乎引用稳定性
}

// ✅ 简化：直接 inline
function Right() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>+</button>;
}
\`\`\`

---

## 六、useCallback vs useMemo vs 直接定义

| 场景 | 推荐 |
| --- | --- |
| 函数传给 React.memo 子组件 | useCallback |
| 函数用作 useEffect / useMemo 依赖 | useCallback |
| 简单计算 / 单值 | useMemo |
| 派生对象 / 数组传给子组件 | useMemo |
| 不传出去、不依赖 | 直接 inline |

---

## 七、useCallback 与闭包陷阱

\`\`\`tsx
function ClosureDemo() {
  const [count, setCount] = useState(0);

  // ❌ 闭包陷阱：永远 count = 0
  const wrong = useCallback(() => {
    console.log(count);
  }, []);  // 空依赖，函数体内 count 永远是初始值

  // ✅ 方案 1：依赖 count
  const correct1 = useCallback(() => {
    console.log(count);
  }, [count]);  // count 变化时函数更新

  // ✅ 方案 2：函数式更新
  const correct2 = useCallback(() => {
    setCount((c) => {
      console.log(c);  // 函数式更新永远拿最新
      return c + 1;
    });
  }, []);  // 引用永久稳定

  return (
    <>
      <p>count: {count}</p>
      <button onClick={wrong}>错（永远 0）</button>
      <button onClick={correct1}>对（依赖 count）</button>
      <button onClick={correct2}>对（函数式更新）</button>
    </>
  );
}
\`\`\`

> 💡 **金科玉律**：能用函数式更新（\`setX(prev => ...)\`）就不要把 state 放进 useCallback 依赖。

---

## 八、完整 Demo：useCallback 综合

\`\`\`tsx
// 完整 Demo：useCallback 综合
import React, { useState, useCallback, memo } from "react";

// 子组件用 memo
const Child = memo(function Child({ id, value, onIncrement, onDelete }: {
  id: number;
  value: number;
  onIncrement: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  console.log(\`[Child \${id}] 渲染\`);
  return (
    <div style={{ padding: 8, border: "1px solid #ccc", margin: 4 }}>
      <span>ID={id}, 值={value}</span>
      <button onClick={() => onIncrement(id)} style={{ marginLeft: 8 }}>+1</button>
      <button onClick={() => onDelete(id)} style={{ marginLeft: 8 }}>删</button>
    </div>
  );
});

function CallbackDemo() {
  const [counters, setCounters] = useState([
    { id: 1, value: 0 },
    { id: 2, value: 0 },
    { id: 3, value: 0 },
  ]);
  const [unrelated, setUnrelated] = useState(0);

  // useCallback：依赖空，函数永久稳定
  const handleIncrement = useCallback((id: number) => {
    // 函数式更新——不需要把 counters 加进依赖
    setCounters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, value: c.value + 1 } : c))
    );
  }, []);

  // useCallback：依赖空，函数永久稳定
  const handleDelete = useCallback((id: number) => {
    setCounters((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>useCallback Demo</h2>

      <p>无关 state: {unrelated}</p>
      <button onClick={() => setUnrelated(unrelated + 1)}>改无关 state</button>

      <h3>计数器列表</h3>
      {counters.map((c) => (
        <Child
          key={c.id}
          id={c.id}
          value={c.value}
          onIncrement={handleIncrement}
          onDelete={handleDelete}
        />
      ))}

      <p style={{ fontSize: 12, color: "#666" }}>
        💡 打开控制台：
        - 点"+1"：只有被点的 Child 渲染（其他因为 props 没变）
        - 点"改无关 state"：所有 Child 都不应该渲染（onIncrement/onDelete 引用稳定）
      </p>
    </div>
  );
}

export default CallbackDemo;
\`\`\`

**实验步骤**：
1. 点某个 Child 的 "+1" → 控制台看到"该 Child 渲染"，其他 Child 不渲染
2. 点 "改无关 state" → 看到 3 个 Child 都不渲染（因 onIncrement/onDelete 引用稳定）

---

## 九、useCallback 决策树

\`\`\`
传给 React.memo 子组件？
├─ 是 → 内部用了 state？
│       ├─ 是 → useCallback(..., [state]) 或 useCallback + 函数式更新
│       └─ 否 → useCallback(..., [])
└─ 否 → 用作 useEffect / useMemo 依赖？
        ├─ 是 → useCallback(..., [...deps])
        └─ 否 → 直接 inline
\`\`\`

---

## 小结

本章核心知识点：

1. **基本语法**：\`useCallback(fn, deps)\` ≈ \`useMemo(() => fn, deps)\`
2. **核心价值**：保持函数引用稳定
3. **典型场景**：
   - 配合 React.memo 子组件
   - 作为 useEffect / useMemo 依赖
   - 自定义 hook 返回函数
4. **何时不用**：
   - 简单组件
   - 不传出去的内部函数
5. **函数式更新**：\`setX(prev => ...)\` 优于把 state 加进依赖
6. **闭包陷阱**：依赖决定函数体内的"外部快照"

下一章 **React.memo**——组件级 memoization。`,
  },
  // ===========================================================
  // 第 40 章：React.memo 与渲染优化
  // ===========================================================
  {
    id: "tsx2-ch40",
    group: "第八部分 useRef / useMemo / useCallback",
    icon: "🧊",
    title: "第四十章 React.memo 与渲染优化",
    content: `# React.memo 与渲染优化

\`React.memo\` 是组件级别的 memoization——只有 props 变化时才重渲染。本章系统讲解它的用法、坑点、与 useCallback/useMemo 的配合。

---

## 一、React.memo 基本用法

\`\`\`tsx
import React from "react";

// 基础组件
function MyComponent({ name, age }: { name: string; age: number }) {
  return <p>{name}, {age}</p>;
}

// 用 memo 包装
const MemoizedComponent = React.memo(MyComponent);

// props 浅比较：name 和 age 都没变时跳过重渲染
\`\`\`

\`\`\`tsx
// 简化：HOC 风格
const MyComponent = React.memo(function MyComponent({ name }: { name: string }) {
  return <p>{name}</p>;
});
\`\`\`

> 💡 **核心**：\`React.memo\` 对 props 做**浅比较**（\`Object.is\`）。与 \`PureComponent\` 类似。

---

## 二、为什么需要 React.memo？

**问题场景**：父组件频繁重渲染（即使与子组件无关），子组件也会被迫重渲染。

\`\`\`tsx
function WithoutMemo() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>count: {count}</button>
      {/* 每次 count 变化，Expensive 子组件都重渲染——即使它不依赖 count */}
      <Expensive name="张三" />
    </>
  );
}

function Expensive({ name }: { name: string }) {
  console.log("Expensive 渲染");
  // 假设这里有昂贵计算
  return <p>{name}</p>;
}
\`\`\`

**用 React.memo 解决**：

\`\`\`tsx
const Expensive = React.memo(function Expensive({ name }: { name: string }) {
  console.log("Expensive 渲染");
  return <p>{name}</p>;
});

function WithMemo() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>count: {count}</button>
      {/* count 变化，Expensive 的 name 没变 → 不重渲染 */}
      <Expensive name="张三" />
    </>
  );
}
\`\`\`

---

## 三、自定义比较函数

默认是浅比较。如果 props 是复杂对象，可以传自定义比较函数：

\`\`\`tsx
type User = { id: number; name: string; profile: { bio: string } };

const UserCard = React.memo(
  function UserCard({ user }: { user: User }) {
    return <p>{user.name} - {user.profile.bio}</p>;
  },
  // 第二个参数：自定义比较
  (prevProps, nextProps) => {
    // 返回 true = 不重渲染；返回 false = 重渲染
    return (
      prevProps.user.id === nextProps.user.id &&
      prevProps.user.name === nextProps.user.name &&
      prevProps.user.profile.bio === nextProps.user.profile.bio
    );
  }
);
\`\`\`

> ⚠️ **复杂 props 不推荐自定义比较**：用 \`useMemo\` 缓存对象引用比自定义比较更简洁。

---

## 四、React.memo 三大坑点

### 坑点 1：每次创建新对象/函数作为 prop

\`\`\`tsx
// ❌ 错：每次渲染都创建新对象，memo 失效
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <Child config={{ theme: "light" }} />  // 每次新对象
  );
}

const Child = React.memo(function Child({ config }: { config: { theme: string } }) {
  console.log("Child 渲染");
  return <p>{config.theme}</p>;
});

// ✅ 解决 1：useMemo 缓存
function Parent() {
  const [count, setCount] = useState(0);
  const config = useMemo(() => ({ theme: "light" }), []);
  return <Child config={config} />;
}

// ✅ 解决 2：提取常量
const CONFIG = { theme: "light" };
function Parent() {
  return <Child config={CONFIG} />;
}
\`\`\`

### 坑点 2：每次创建新函数作为 prop

\`\`\`tsx
// ❌ 错：每次渲染创建新函数
function Parent() {
  return <Child onClick={() => console.log("click")} />;
}

// ✅ 用 useCallback
function Parent() {
  const handleClick = useCallback(() => console.log("click"), []);
  return <Child onClick={handleClick} />;
}
\`\`\`

### 坑点 3：与 useState 配合时函数式更新

\`\`\`tsx
// ✅ 用函数式更新可以让 useCallback 永久稳定
function Parent() {
  const [count, setCount] = useState(0);

  // 函数式更新：不依赖 count
  const handleAdd = useCallback(() => {
    setCount((c) => c + 1);
  }, []);  // 空依赖——永久稳定

  return <Child onAdd={handleAdd} />;
}
\`\`\`

---

## 五、React.memo 适用场景

### 适合用

| 场景 | 理由 |
| --- | --- |
| 子组件渲染昂贵 | 避免不必要重渲染 |
| 列表项组件 | 大列表性能关键 |
| props 稳定（基本类型）| 浅比较就能拦截 |
| 配合 useCallback / useMemo | 完整优化链路 |

### 不适合用

| 场景 | 理由 |
| --- | --- |
| 简单组件 | memo 开销 > 渲染开销 |
| props 频繁变化 | memo 永远不命中 |
| 子组件经常重渲染 | memo 没意义 |

---

## 六、完整性能优化链路

\`\`\`tsx
// 完整示例：父组件 + 子组件 + 数据处理
import React, { useState, useMemo, useCallback, memo } from "react";

type Item = { id: number; name: string; price: number };

// 子组件 memo
const ItemRow = memo(function ItemRow({ item, onDelete, onUpdate }: {
  item: Item;
  onDelete: (id: number) => void;
  onUpdate: (id: number, delta: number) => void;
}) {
  console.log(\`[Item \${item.id}] 渲染\`);
  return (
    <li>
      {item.name} - ¥{item.price}
      <button onClick={() => onUpdate(item.id, 1)}>+1</button>
      <button onClick={() => onUpdate(item.id, -1)}>-1</button>
      <button onClick={() => onDelete(item.id)}>删</button>
    </li>
  );
});

function OptimizedList() {
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: "苹果", price: 5 },
    { id: 2, name: "香蕉", price: 3 },
  ]);
  const [filter, setFilter] = useState("");

  // 1. useCallback + 函数式更新：handleDelete 永久稳定
  const handleDelete = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleUpdate = useCallback((id: number, delta: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, price: i.price + delta } : i))
    );
  }, []);

  // 2. useMemo 过滤——基于 items 和 filter
  const filtered = useMemo(() => {
    console.log("过滤");
    return items.filter((i) => i.name.includes(filter));
  }, [items, filter]);

  return (
    <div>
      <input
        placeholder="过滤"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <ul>
        {filtered.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </ul>
    </div>
  );
}
\`\`\`

**优化点**：
1. \`ItemRow\` 用 \`memo\` —— props 没变不渲染
2. \`handleDelete\`/\`handleUpdate\` 用 \`useCallback\` —— 函数引用稳定
3. \`filtered\` 用 \`useMemo\` —— 派生引用稳定
4. setState 用函数式更新 —— useCallback 永久空依赖

---

## 七、React.memo 与 children

\`\`\`tsx
// ❌ 错：children 是新的 JSX 元素
const Card = React.memo(function Card({ children }: { children: React.ReactNode }) {
  console.log("Card 渲染");
  return <div className="card">{children}</div>;
});

function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>count: {count}</button>
      {/* Card 的 children 每次是新 JSX 元素，memo 失效 */}
      <Card>
        <p>内容</p>
      </Card>
    </>
  );
}

// 解决：把 children 作为 props 不行——但可以用 useMemo 缓存
function Better() {
  const [count, setCount] = useState(0);
  // 用 useMemo 缓存 JSX
  const content = useMemo(() => <p>内容</p>, []);
  return <Card>{content}</Card>;
}
\`\`\`

> 💡 **更常见**：把内容作为 prop（而非 children）来保持稳定。

---

## 八、性能分析工具

### 1. React DevTools Profiler

\`\`\`
// 安装 React DevTools 后
// 1. 打开 Profiler 标签
// 2. 点击录制
// 3. 操作页面
// 4. 查看哪些组件渲染了、用时多少
\`\`\`

### 2. 为什么渲染了？（why-did-you-render）

\`\`\`bash
npm install @welldone-software/why-did-you-render
\`\`\`

\`\`\`tsx
// wdyr.ts
import React from "react";
import whyDidYouRender from "@welldone-software/why-did-you-render";
whyDidYouRender(React, {
  trackAllPureComponents: true,
});
\`\`\`

启用后会**在控制台警告**：哪些组件没必要渲染、props 哪里变了。

---

## 九、完整 Demo：React.memo 优化前后对比

\`\`\`tsx
// 完整 Demo：React.memo 性能优化
import React, { useState, useCallback, memo, useMemo } from "react";

// 普通组件（无 memo）
function NormalChild({ value }: { value: number }) {
  console.log(\`[NormalChild \${value}] 渲染\`);
  return <p>Normal {value}</p>;
}

// memo 组件
const MemoChild = memo(function MemoChild({ value }: { value: number }) {
  console.log(\`[MemoChild \${value}] 渲染\`);
  return <p>Memo {value}</p>;
});

function MemoVsNormal() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);

  return (
    <div style={{ padding: 16 }}>
      <h2>React.memo 优化对比</h2>
      <button onClick={() => setA(a + 1)}>A: {a}</button>
      <button onClick={() => setB(b + 1)}>B: {b}</button>

      <h3>普通组件</h3>
      <p>改 B 时：A、B 都会重渲染</p>
      <NormalChild value={1} />
      <NormalChild value={2} />

      <h3>React.memo 组件</h3>
      <p>改 B 时：只有 value=2 的 MemoChild 渲染（因为传的是 prop 1, 2 不变）</p>
      <MemoChild value={1} />
      <MemoChild value={2} />

      <p style={{ fontSize: 12, color: "#666" }}>
        💡 打开控制台：改 A/B 看渲染日志
      </p>
    </div>
  );
}

// ---------- 配合 useCallback 演示 ----------
const SmartChild = memo(function SmartChild({ onClick }: { onClick: () => void }) {
  console.log("[SmartChild] 渲染");
  return <button onClick={onClick}>Smart</button>;
});

function WithCallback() {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);

  // 用 useCallback：函数引用稳定
  const handleClick = useCallback(() => {
    console.log("Click at count:", count);
  }, [count]);

  // ❌ 对比：每次创建新函数
  const handleClickInline = () => {
    console.log("Click at count:", count);
  };

  return (
    <div>
      <h3>useCallback 配合</h3>
      <p>other: {other}</p>
      <button onClick={() => setOther(other + 1)}>改 other</button>

      <p>useCallback（引用稳定）：</p>
      <SmartChild onClick={handleClick} />

      <p>inline 箭头（每次新函数）：</p>
      <SmartChild onClick={handleClickInline} />
    </div>
  );
}

function FinalDemo() {
  return (
    <div>
      <MemoVsNormal />
      <hr />
      <WithCallback />
    </div>
  );
}

export default FinalDemo;
\`\`\`

**实验步骤**：
1. 反复点 "A" / "B"：看控制台哪些组件渲染
2. 普通组件：每次都渲染两个
3. Memo 组件：只有 value 匹配的那个渲染
4. 改 other：useCallback 那行 SmartChild 不渲染，inline 那行渲染

---

## 十、性能优化决策流程

\`\`\`
性能问题？
├─ 否 → 不用优化
└─ 是 → 用 Profiler 找出瓶颈
        ├─ 组件本身渲染昂贵
        │   └─ 考虑拆分 / React.memo
        ├─ props 引用不稳定
        │   └─ useMemo / useCallback
        ├─ 计算昂贵
        │   └─ useMemo
        └─ 状态提升过高
            └─ 下放 state / 拆分组件
\`\`\`

> 💡 **金科玉律**：**不要过早优化**。先测量，再优化。

---

## 小结

本章核心知识点：

1. **React.memo 基础**：\`React.memo(Component)\`——浅比较 props 拦截不必要的重渲染
2. **自定义比较**：第二个参数传 \`(prev, next) => boolean\`，但通常不推荐
3. **三大坑点**：
   - 新对象 prop → 用 useMemo / 常量
   - 新函数 prop → 用 useCallback
   - 闭包陷阱 → 函数式更新
4. **优化链路**：memo + useCallback + useMemo + 函数式更新
5. **慎用**：简单组件不需要 memo，开销可能更大
6. **测量先行**：用 Profiler 找瓶颈，再优化
7. **不要过早优化**：先写对，再加 memo

至此"第八部分 useRef / useMemo / useCallback"全部完成。`,
  },
];

export { chapters };
