// =============================================================
// TSX 教程 - 第四批章节（第七部分 useEffect 深入，共 5 章）
// -------------------------------------------------------------
// 覆盖：useEffect 基础 / 依赖项 / 清理函数 / 数据请求 / 替代方案
// 每章包含详细讲解 + 多个代码示例 + 可运行 demo
// =============================================================

const chapters = [
  // ===========================================================
  // 第 31 章：useEffect 基础
  // ===========================================================
  {
    id: "tsx2-ch31",
    group: "第七部分 useEffect 深入",
    icon: "⚡",
    title: "第三十一章 useEffect 基础",
    content: `# useEffect 基础

\`useEffect\` 是 React 处理**副作用**的 Hook——数据请求、订阅、定时器、DOM 操作、事件监听都通过它。本章从基础语法到生命周期对应，再到清理函数，建立完整认知。

---

## 一、什么是副作用（Side Effect）？

**纯函数**：输入相同，输出相同，不影响外部世界。
**副作用函数**：除了返回值还做了其他事——改 DOM、发请求、记日志。

\`\`\`tsx
// 纯函数
function add(a: number, b: number) {
  return a + b;
}

// 副作用
function fetchUser() {
  fetch("/api/user");  // 发起网络请求
}
function changeTitle() {
  document.title = "新标题";  // 改 DOM
}
\`\`\`

React 组件的渲染函数本应是纯函数（输入 props/state → 输出 JSX），但实际应用需要副作用——这些就应该放在 \`useEffect\` 里。

---

## 二、useEffect 基本语法

\`\`\`tsx
import { useEffect } from "react";

useEffect(() => {
  // 副作用代码
  console.log("Effect ran");

  // 可选：返回清理函数
  return () => {
    console.log("Cleanup");
  };
}, [/* 依赖数组 */]);
\`\`\`

**参数**：
- 第一个参数：\`() => void | (() => void)\`——执行副作用，返回清理函数
- 第二个参数：依赖数组 \`[a, b, c]\`——决定何时重新执行

---

## 三、依赖数组的三种形式

### 1. 不传依赖数组——每次渲染都执行

\`\`\`tsx
function NoDeps() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // 每次渲染都执行：包括挂载 + 每次 state/props 变化
    console.log("渲染了", count);
  });  // 没有第二个参数

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
\`\`\`

> ⚠️ **几乎从不需要这种形式**。副作用应该在合适时机执行，不应该每次都跑。

### 2. 空依赖数组 \`[]\`——只在挂载时执行一次

\`\`\`tsx
function MountOnly() {
  useEffect(() => {
    // 只在组件挂载时执行一次
    console.log("组件挂载了");
    // 类似 class 组件的 componentDidMount
  }, []);  // 空依赖

  return <div>Hello</div>;
}
\`\`\`

**典型场景**：
- 一次性日志 / 埋点
- 订阅全局事件
- 初始化第三方库

### 3. 带依赖——依赖变化时执行

\`\`\`tsx
function WithDeps() {
  const [userId, setUserId] = useState(1);

  useEffect(() => {
    // 挂载时 + userId 变化时执行
    console.log("userId 变化:", userId);
    // 类似 componentDidMount + componentDidUpdate
  }, [userId]);  // 依赖 userId

  return <button onClick={() => setUserId(userId + 1)}>userId: {userId}</button>;
}
\`\`\`

---

## 四、对应 class 组件的生命周期

| useEffect | class 组件 |
| --- | --- |
| \`useEffect(() => {...}, [])\` | \`componentDidMount()\` |
| \`useEffect(() => {...}, [a, b])\` | \`componentDidUpdate(prevProps, prevState)\` + 检查 \`a\` / \`b\` |
| 清理函数 \`return () => {...}\` | \`componentWillUnmount()\` |
| 全部组合 | \`componentDidMount\` + \`componentDidUpdate\` + \`componentWillUnmount\` |

\`\`\`tsx
// class 组件版本
class UserClass extends React.Component {
  componentDidMount() {
    this.fetchUser(this.props.userId);
  }
  componentDidUpdate(prevProps: any) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchUser(this.props.userId);
    }
  }
  componentWillUnmount() {
    // 清理
  }
  fetchUser(id: number) { /* ... */ }
  render() { return <div>{this.props.userId}</div>; }
}

// hooks 版本——更简洁
function UserHooks({ userId }: { userId: number }) {
  useEffect(() => {
    fetchUser(userId);
  }, [userId]);  // 一行搞定两个生命周期

  return <div>{userId}</div>;
}
\`\`\`

> 💡 **React Hooks 的设计目标**：用 \`useEffect\` 统一处理"挂载 / 更新 / 卸载"三个生命周期，避免 class 组件中散落的逻辑。

---

## 五、清理函数（Cleanup Function）

\`useEffect\` 可以返回一个函数——**下次 effect 执行前**或**组件卸载时**调用：

\`\`\`tsx
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // 设置定时器
    const id = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    // 返回清理函数
    return () => {
      // 卸载时或下次 effect 执行前清除
      clearInterval(id);
    };
  }, []);  // 只挂载时设置，卸载时清除

  return <p>{seconds} 秒</p>;
}
\`\`\`

**清理函数的执行时机**：
- 组件卸载时
- 依赖变化、effect 重新执行**之前**

\`\`\`tsx
// 多个 effect 的清理顺序
function Multiple() {
  useEffect(() => {
    console.log("Effect A");
    return () => console.log("Cleanup A");
  });

  useEffect(() => {
    console.log("Effect B");
    return () => console.log("Cleanup B");
  });

  // 重新渲染时：
  // Cleanup B → Cleanup A → Effect A → Effect B
  // 卸载时：
  // Cleanup B → Cleanup A
}
\`\`\`

---

## 六、典型场景：4 个常见用法

### 场景 1：修改 document.title

\`\`\`tsx
function TitleUpdater({ name }: { name: string }) {
  useEffect(() => {
    // 副作用：改 title
    document.title = \`当前用户: \${name}\`;
  }, [name]);  // name 变化时更新

  return <p>用户: {name}</p>;
}
\`\`\`

### 场景 2：日志 / 埋点

\`\`\`tsx
function PageViewLogger({ pageName }: { pageName: string }) {
  useEffect(() => {
    // 挂载时上报
    console.log(\`[埋点] 进入页面: \${pageName}\`);

    return () => {
      // 卸载时上报
      console.log(\`[埋点] 离开页面: \${pageName}\`);
    };
  }, [pageName]);

  return <div>页面 {pageName}</div>;
}
\`\`\`

### 场景 3：DOM 操作

\`\`\`tsx
function FocusOnMount() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 挂载后聚焦
    inputRef.current?.focus();
  }, []);  // 只在挂载时执行

  return <input ref={inputRef} placeholder="自动聚焦" />;
}
\`\`\`

### 场景 4：第三方库集成

\`\`\`tsx
function Chart({ data }: { data: number[] }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    // 假设 echarts 是第三方图表库
    const chart = (window as any).echarts?.init(chartRef.current);
    chart?.setOption({ series: [{ data }] });

    return () => {
      chart?.dispose();  // 清理
    };
  }, [data]);  // data 变化时重绘

  return <div ref={chartRef} style={{ width: 600, height: 400 }} />;
}
\`\`\`

---

## 七、完整 Demo：useEffect 基础综合

\`\`\`tsx
// 完整 Demo：useEffect 基础综合
import React, { useState, useEffect, useRef } from "react";

function EffectBasics() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("张三");
  const [seconds, setSeconds] = useState(0);
  const [show, setShow] = useState(true);
  const renderCount = useRef(0);
  renderCount.current += 1;

  // ---------- 1. 无依赖：每次渲染都执行（演示用）----------
  useEffect(() => {
    console.log("【无依赖】每次渲染都跑");
  });

  // ---------- 2. 空依赖：只挂载时执行 ----------
  useEffect(() => {
    console.log("【空依赖】挂载时执行一次");
  }, []);

  // ---------- 3. 带依赖：依赖变化时执行 ----------
  useEffect(() => {
    console.log(\`【带依赖】name 变化: \${name}\`);
  }, [name]);

  // ---------- 4. 定时器 + 清理 ----------
  useEffect(() => {
    console.log("【定时器】启动");
    const id = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => {
      console.log("【定时器】清理");
      clearInterval(id);
    };
  }, []);  // 空依赖

  // ---------- 5. document.title ----------
  useEffect(() => {
    document.title = \`count=\${count} | \${seconds}s\`;
  }, [count, seconds]);

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h2>useEffect 基础 Demo</h2>
      <p>渲染次数: {renderCount.current}</p>

      <div>
        <button onClick={() => setCount(count + 1)}>count: {count}</button>
        <button onClick={() => setName(name === "张三" ? "李四" : "张三")} style={{ marginLeft: 8 }}>
          切换 name: {name}
        </button>
      </div>

      <p>定时器: {seconds}s</p>

      <div>
        <button onClick={() => setShow((s) => !s)}>{show ? "卸载" : "挂载"} Timer 组件</button>
        {show && <Timer />}
      </div>

      <p style={{ fontSize: 12, color: "#666", marginTop: 12 }}>
        💡 打开控制台查看 effect 执行时机
      </p>
    </div>
  );
}

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    console.log("【Timer 子组件】挂载");
    const id = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => {
      console.log("【Timer 子组件】卸载，清理定时器");
      clearInterval(id);
    };
  }, []);

  return <p>子组件 Timer: {seconds}s</p>;
}

export default EffectBasics;
\`\`\`

**实验步骤**：
1. 点击 "count +1" → 看控制台：只跑"无依赖"和带 name 依赖的不动
2. 点击 "切换 name" → 看"带依赖"是否触发
3. 切换 "卸载/挂载" → 看"清理"和"重新挂载"的日志

---

## 小结

本章核心知识点：

1. **副作用定义**：组件渲染外的操作（请求、DOM、定时器、订阅）
2. **基本语法**：\`useEffect(() => { effect; return cleanup; }, deps)\`
3. **三种依赖形式**：
   - 不传：每次渲染（几乎不用）
   - \`[]\`：仅挂载
   - \`[a, b]\`：依赖变化时
4. **生命周期对应**：\`useEffect\` 统一替代 \`componentDidMount\` + \`componentDidUpdate\`
5. **清理函数**：返回 \`() => {}\`——卸载或下次 effect 前调用
6. **典型场景**：修改 title、埋点日志、DOM 操作、第三方库

下一章深入**依赖数组**的细节——何时省略、eslint 规则、闭包陷阱。`,
  },
  // ===========================================================
  // 第 32 章：useEffect 依赖项
  // ===========================================================
  {
    id: "tsx2-ch32",
    group: "第七部分 useEffect 深入",
    icon: "📌",
    title: "第三十二章 useEffect 依赖项",
    content: `# useEffect 依赖项

依赖数组是 useEffect 中最容易出错的部分——少写、多写、漏写都会导致 bug。本章深入依赖项规则、闭包陷阱、eslint 插件。

---

## 一、依赖项规则：所有在 effect 内使用的外部值

\`\`\`tsx
function DependencyRule({ userId, onLoad }: { userId: number; onLoad: (id: number) => void }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // effect 内用了 userId 和 onLoad——必须加入依赖
    console.log(userId);
    onLoad(userId);
  }, [userId, onLoad]);  // ✅ 正确

  // ❌ 错：漏掉依赖——React 会报警告
  useEffect(() => {
    onLoad(userId);
  }, []);  // 闭包陷阱：userId 永远是初始值
}
\`\`\`

**规则**：effect 函数中**引用的所有外部值**（props / state / 上下文 / 全局变量）都应该列在依赖数组中。

---

## 二、依赖比较：Object.is

React 用 \`Object.is\` 比较每个依赖项：

\`\`\`tsx
function DepComparison({ value }: { value: number }) {
  // 每次 value 变化（Object.is 不同）时执行
  useEffect(() => {
    console.log("value:", value);
  }, [value]);

  // 对象/数组依赖——引用比较
  const [user] = useState({ name: "张三" });
  useEffect(() => {
    console.log("user:", user);
  }, [user]);  // user 引用不变，永远不重新执行
}
\`\`\`

**重要**：依赖是**浅比较**。对象内部属性变化不会触发。

---

## 三、对象/数组作为依赖的陷阱

\`\`\`tsx
// ❌ 错：每次渲染创建新对象，依赖"变化"了
function Wrong({ config }: { config: { theme: string } }) {
  useEffect(() => {
    applyConfig(config);
  }, [config]);  // 父组件每次传新对象 { theme: 'light' }，依赖永远变化
}

// 父组件
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>count: {count}</button>
      {/* 每次 setState 都创建新对象，effect 每次都重跑 */}
      <Child config={{ theme: "light" }} />
    </>
  );
}

// ✅ 方案 1：把对象字面量提到组件外（常量）
const CONFIG = { theme: "light" };
function Correct1({ config }: { config: { theme: string } }) {
  useEffect(() => {
    applyConfig(config);
  }, [config]);  // 引用稳定，不重跑
}

// ✅ 方案 2：依赖对象的某个字段
function Correct2({ config }: { config: { theme: string } }) {
  useEffect(() => {
    applyConfig(config);
  }, [config.theme]);  // 只依赖具体字段

  // 注意：可能需要配合 JSON.stringify 或 deep-equal
}

// ✅ 方案 3：useMemo 缓存
function Correct3({ config }: { config: { theme: string } }) {
  const memoConfig = useMemo(() => config, [config.theme]);
  useEffect(() => {
    applyConfig(memoConfig);
  }, [memoConfig]);
}
\`\`\`

---

## 四、函数依赖的陷阱

\`\`\`tsx
// 父组件
function Parent() {
  const [count, setCount] = useState(0);

  // 每次渲染都创建新函数
  const handleLoad = (id: number) => {
    console.log("Loaded", id, "when count is", count);
  };

  return <Child onLoad={handleLoad} />;
}

// 子组件
function Child({ onLoad }: { onLoad: (id: number) => void }) {
  useEffect(() => {
    onLoad(1);
  }, [onLoad]);  // 每次 Parent 重渲染都重新执行
}

// ✅ 方案 1：useCallback 缓存
function Parent() {
  const [count, setCount] = useState(0);
  const handleLoad = useCallback((id: number) => {
    console.log("Loaded", id, "when count is", count);
  }, [count]);  // count 变化时才更新引用
  return <Child onLoad={handleLoad} />;
}

// ✅ 方案 2：useRef 保存（仅在特定场景）
function BetterChild({ onLoad }: { onLoad: (id: number) => void }) {
  // 把 onLoad 存到 ref，永远是最新值
  const onLoadRef = useRef(onLoad);
  useEffect(() => { onLoadRef.current = onLoad; });

  useEffect(() => {
    onLoadRef.current(1);  // 调用最新的 onLoad
  }, []);  // 只挂载时执行一次
}
\`\`\`

---

## 五、什么时候可以"省略"依赖

绝大多数情况下**不应该省略依赖**。但有两种情况例外：

### 例外 1：依赖本身就是稳定常量

\`\`\`tsx
const EMPTY_ARR: never[] = [];  // 模块级常量

function Stable() {
  useEffect(() => {
    // eslint 会警告
  }, []);  // 这里应该用 EMPTY_ARR，但概念上确实只跑一次
}
\`\`\`

### 例外 2：函数式更新

\`\`\`tsx
function FunctionalUpdate({ id }: { id: number }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(\`/api/\${id}\`).then((r) => r.json()).then((d) => {
      setData(d);  // 用函数式更新更好
    });
  }, [id]);

  // 关键：setData 不需要加入依赖
  // React 保证 setState 函数引用稳定
}
\`\`\`

> ⚠️ **eslint 不会对 setState 报警告**——React 内置豁免。

---

## 六、eslint-plugin-react-hooks 规则

\`react-hooks/exhaustive-deps\` 规则会扫描 effect 内部用到的所有外部值，检查依赖数组是否完整。

\`\`\`json
// .eslintrc.json
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
\`\`\`

**常见警告与解决**：

\`\`\`tsx
// ⚠️ React Hook useEffect has a missing dependency: 'userId'
useEffect(() => {
  fetchUser(userId);
}, []);  // 警告：userId 没在依赖中

// ✅ 修复：加上 userId
useEffect(() => {
  fetchUser(userId);
}, [userId]);

// ⚠️ React Hook useEffect has an unnecessary dependency: 'count'
useEffect(() => {
  console.log("Mounted");
}, [count]);  // 警告：count 在 effect 中没用到

// ✅ 修复：去掉 count
useEffect(() => {
  console.log("Mounted");
}, []);
\`\`\`

**什么时候禁用规则**？几乎不应该。规则比人工判断更准。如果你认为需要禁用，往往是设计问题——把逻辑移到 event handler、提到组件外、用 useRef 等。

\`\`\`tsx
// 用 useRef 避免依赖
function AvoidDep() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  useEffect(() => { countRef.current = count; });  // 每次同步

  useEffect(() => {
    const id = setInterval(() => {
      console.log("Latest count:", countRef.current);  // 通过 ref 读最新值
    }, 1000);
    return () => clearInterval(id);
  }, []);  // 不需要依赖 count
}
\`\`\`

---

## 七、依赖变化的连锁反应

\`\`\`tsx
// 多个 effect 互相依赖——可能导致频繁执行
function Chain({ userId, postId }: { userId: number; postId: number }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  // 1. userId 变化 → 请求 user
  useEffect(() => {
    fetch(\`/api/users/\${userId}\`).then((r) => r.json()).then(setUser);
  }, [userId]);

  // 2. postId 变化 → 请求 posts
  useEffect(() => {
    fetch(\`/api/users/\${userId}/posts/\${postId}\`).then((r) => r.json()).then(setPosts);
  }, [userId, postId]);  // userId 变化也会触发

  // ❌ 问题：userId 变化会同时触发 1 和 2，可能浪费请求
  // ✅ 优化：拆分数据流
}
\`\`\`

> 💡 **最佳实践**：把请求数据**统一到一个 effect** 或用 SWR / React Query 等库。

---

## 八、完整 Demo：依赖项实战

\`\`\`tsx
// 完整 Demo：依赖项规则综合
import React, { useState, useEffect, useCallback, useRef } from "react";

function DepsDemo() {
  const [userId, setUserId] = useState(1);
  const [name, setName] = useState("张三");
  const [count, setCount] = useState(0);

  // ---------- 正确的依赖 ----------
  useEffect(() => {
    console.log(\`[1] userId 变化: \${userId}\`);
  }, [userId]);

  // ---------- 闭包陷阱演示 ----------
  useEffect(() => {
    const id = setInterval(() => {
      console.log(\`[2] 定时器: count = \${count}\`);
    }, 2000);
    return () => clearInterval(id);
  }, [count]);  // count 变化会重启定时器

  // ---------- 函数依赖 + useCallback ----------
  const handleLoad = useCallback((id: number) => {
    console.log(\`[3] 加载用户 \${id}，count=\${count}\`);
  }, [count]);  // count 变化才更新引用

  useEffect(() => {
    handleLoad(userId);
  }, [userId, handleLoad]);  // 必须包含 handleLoad

  // ---------- useRef 避免依赖 ----------
  const countRef = useRef(count);
  useEffect(() => { countRef.current = count; });  // 每次同步

  useEffect(() => {
    const id = setInterval(() => {
      console.log(\`[4] Ref 定时器: count = \${countRef.current}\`);
    }, 2000);
    return () => clearInterval(id);
  }, []);  // 空依赖，但通过 ref 读到最新值

  return (
    <div style={{ padding: 16 }}>
      <h2>依赖项 Demo</h2>
      <p>userId: {userId}, name: {name}, count: {count}</p>
      <button onClick={() => setUserId(userId + 1)}>userId+1</button>
      <button onClick={() => setName(name === "张三" ? "李四" : "张三")}>切换 name</button>
      <button onClick={() => setCount(count + 1)}>count+1</button>

      <p style={{ fontSize: 12, color: "#666", marginTop: 12 }}>
        💡 打开控制台：
        [1] 每次 userId 变化触发
        [2] 每次 count 变化重启定时器
        [3] userId 或 count 变化触发（受 handleLoad 引用影响）
        [4] 挂载时启动，每 2s 输出最新 count（ref 方案）
      </p>
    </div>
  );
}

export default DepsDemo;
\`\`\`

---

## 小结

本章核心知识点：

1. **依赖规则**：effect 内引用的所有外部值（props/state/函数）必须列入依赖
2. **浅比较**：用 \`Object.is\` 比较依赖项，引用变化才重跑
3. **对象/数组依赖**：注意父组件传新对象字面量导致频繁重跑
4. **函数依赖**：用 \`useCallback\` 缓存，或存到 ref 中
5. **函数式更新**：setState 引用稳定，不需要加入依赖
6. **eslint 规则**：\`react-hooks/exhaustive-deps\` 是必备工具
7. **useRef 救场**：把外部值存到 ref，可以在空依赖中读最新值
8. **链式 effect**：注意 effect 之间可能互相触发

下一章深入**清理函数**——订阅、定时器、事件监听的正确清理方式。`,
  },
  // ===========================================================
  // 第 33 章：useEffect 清理函数
  // ===========================================================
  {
    id: "tsx2-ch33",
    group: "第七部分 useEffect 深入",
    icon: "🧹",
    title: "第三十三章 useEffect 清理函数",
    content: `# useEffect 清理函数

不清理副作用 = 内存泄漏 + 状态错乱 + 莫名 bug。本章系统讲解 4 类副作用的清理模式。

---

## 一、清理函数的执行时机

\`\`\`tsx
function Timing() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);

  useEffect(() => {
    console.log("Effect A");
    return () => console.log("Cleanup A");
  }, [a]);

  useEffect(() => {
    console.log("Effect B");
    return () => console.log("Cleanup B");
  }, [b]);

  // 初始挂载：
  // Effect A → Effect B

  // setA(1) 触发 A 变化：
  // Cleanup A → Effect A
  // （B 不动）

  // 卸载时：
  // Cleanup A → Cleanup B
  // （按注册倒序）
}
\`\`\`

**规则**：
- 组件卸载时调用所有清理函数
- 依赖变化导致 effect 重跑时，先清理上一次的，再执行新的
- 多个 effect 的清理按**注册倒序**执行

---

## 二、模式 1：定时器清理

\`\`\`tsx
function TimerCleanup() {
  const [seconds, setSeconds] = useState(0);
  const [interval, setInterval] = useState(1000);

  useEffect(() => {
    console.log(\`创建定时器，间隔 \${interval}ms\`);
    const id = setInterval(() => {
      setSeconds((s) => s + 1);
    }, interval);

    // 清理：清除定时器
    return () => {
      console.log(\`清理定时器 \${id}\`);
      clearInterval(id);
    };
  }, [interval]);  // interval 变化时重启定时器

  return (
    <>
      <p>seconds: {seconds}</p>
      <button onClick={() => setInterval(1000)}>1秒</button>
      <button onClick={() => setInterval(500)}>0.5秒</button>
    </>
  );
}
\`\`\`

> ⚠️ **不清理的后果**：组件卸载后定时器仍在跑，每次回调都会调用 setSeconds——触发"Can't perform state update on unmounted component"警告或内存泄漏。

---

## 三、模式 2：事件监听清理

\`\`\`tsx
function ListenerCleanup() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // 监听全局事件
    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove);

    // 清理：移除监听
    return () => {
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);  // 只挂载时监听

  return <p>鼠标: ({position.x}, {position.y})</p>;
}
\`\`\`

> 💡 **常见错误**：在 effect 中 addEventListener 但没有 removeEventListener——每次组件重新创建监听器，监听器累积，内存泄漏。

---

## 四、模式 3：订阅清理

\`\`\`tsx
// 模拟一个简单的 pub-sub 系统
type Listener<T> = (data: T) => void;
class EventBus<T> {
  private listeners = new Set<Listener<T>>();
  subscribe(fn: Listener<T>) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  emit(data: T) {
    this.listeners.forEach((fn) => fn(data));
  }
}

const bus = new EventBus<{ message: string }>();

function SubscriptionCleanup() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // 订阅：返回一个反订阅函数
    const unsubscribe = bus.subscribe((data) => {
      setMessages((prev) => [...prev, data.message]);
    });

    // 清理：调用反订阅
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <>
      <button onClick={() => bus.emit({ message: \`hi-\${Date.now()}\` })}>发送</button>
      <ul>{messages.map((m, i) => <li key={i}>{m}</li>)}</ul>
    </>
  );
}
\`\`\`

> 💡 **大多数第三方库**（RxJS、MobX、WebSocket 客户端）的订阅 API 都返回 unsubscribe 函数。

---

## 五、模式 4：网络请求 + AbortController

\`\`\`tsx
function FetchCleanup() {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(1);

  useEffect(() => {
    // 创建 AbortController 用于取消请求
    const controller = new AbortController();

    setLoading(true);
    fetch(\`/api/users/\${userId}\`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          console.log("请求被取消");
        } else {
          console.error("请求失败:", err);
        }
        setLoading(false);
      });

    // 清理：取消请求
    return () => {
      controller.abort();
    };
  }, [userId]);  // userId 变化时取消旧请求，发起新请求

  return (
    <>
      <button onClick={() => setUserId((id) => id + 1)}>userId: {userId}</button>
      {loading ? "加载中..." : JSON.stringify(data)}
    </>
  );
}
\`\`\`

> 💡 **现代浏览器标准**：\`AbortController\` + \`signal\` 是取消 fetch 的标准方式。

---

## 六、模式 5：第三方库清理

\`\`\`tsx
function ThirdPartyLib() {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 假设 echarts 是第三方图表库
    const echarts = (window as any).echarts;
    if (!echarts) return;

    const chart = echarts.init(chartRef.current);
    chart.setOption({ title: { text: "销售数据" } });

    // 清理：销毁实例
    return () => {
      chart.dispose();
    };
  }, []);

  return <div ref={chartRef} style={{ width: 600, height: 400 }} />;
}
\`\`\`

---

## 七、清理函数的常见错误

### 错误 1：忘记返回清理函数

\`\`\`tsx
// ❌ 错：addEventListener 但没清理
useEffect(() => {
  const handler = () => console.log("click");
  window.addEventListener("click", handler);
  // 卸载时事件监听器仍存在——内存泄漏
}, []);

// ✅ 对
useEffect(() => {
  const handler = () => console.log("click");
  window.addEventListener("click", handler);
  return () => window.removeEventListener("click", handler);
}, []);
\`\`\`

### 错误 2：清理函数引用的不是同一个回调

\`\`\`tsx
// ❌ 错：两个不同的函数引用
useEffect(() => {
  window.addEventListener("resize", () => {
    console.log(window.innerWidth);
  });
  return () => {
    window.removeEventListener("resize", () => {
      console.log(window.innerWidth);
    });
  };
}, []);
// 两个箭头函数是不同的引用——removeEventListener 不会真正移除！

// ✅ 对：保存引用
useEffect(() => {
  const handler = () => console.log(window.innerWidth);
  window.addEventListener("resize", handler);
  return () => window.removeEventListener("resize", handler);
}, []);
\`\`\`

### 错误 3：清理逻辑不正确

\`\`\`tsx
// ❌ 错：清理时用错 id
useEffect(() => {
  let id = 0;
  id = setInterval(() => console.log("tick"), 1000);
  return () => {
    // ❌ 错：clearInterval(0) 不会清掉真正的定时器
    clearInterval(0);
  };
}, []);

// ✅ 对：闭包捕获正确 id
useEffect(() => {
  const id = setInterval(() => console.log("tick"), 1000);
  return () => clearInterval(id);
}, []);
\`\`\`

---

## 八、完整 Demo：综合清理

\`\`\`tsx
// 完整 Demo：4 种清理模式综合
import React, { useState, useEffect, useRef } from "react";

function CleanupShowcase() {
  const [show, setShow] = useState(true);
  return (
    <div style={{ padding: 16 }}>
      <h2>清理函数 Demo</h2>
      <button onClick={() => setShow((s) => !s)}>
        {show ? "卸载所有" : "挂载所有"}
      </button>
      {show && (
        <>
          <TimerExample />
          <MouseTracker />
          <NetworkFetcher />
        </>
      )}
    </div>
  );
}

// 示例 1：定时器
function TimerExample() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    console.log("[Timer] 启动");
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      console.log("[Timer] 清理");
      clearInterval(id);
    };
  }, []);
  return <p>定时器 tick: {tick}</p>;
}

// 示例 2：事件监听
function MouseTracker() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    console.log("[Mouse] 启动监听");
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => {
      console.log("[Mouse] 移除监听");
      window.removeEventListener("mousemove", handler);
    };
  }, []);
  return <p>鼠标: ({pos.x}, {pos.y})</p>;
}

// 示例 3：网络请求
function NetworkFetcher() {
  const [data, setData] = useState<unknown>(null);
  const [userId, setUserId] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    console.log(\`[Fetch] 发起请求 userId=\${userId}\`);

    // 模拟异步请求
    const timeoutId = setTimeout(() => {
      setData({ userId, name: \`User-\${userId}\` });
      console.log(\`[Fetch] 完成 userId=\${userId}\`);
    }, 1000);

    return () => {
      console.log(\`[Fetch] 取消 userId=\${userId}\`);
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [userId]);

  return (
    <>
      <button onClick={() => setUserId((id) => id + 1)}>userId: {userId}</button>
      <p>data: {JSON.stringify(data)}</p>
    </>
  );
}

export default CleanupShowcase;
\`\`\`

**实验步骤**：
1. 点击"卸载所有" → 控制台看到三组清理日志
2. 在 NetworkFetcher 中快速点击 userId → 看到旧的请求被取消

---

## 九、清理函数速查表

| 副作用类型 | 清理方式 |
| --- | --- |
| \`setInterval\` / \`setTimeout\` | \`clearInterval\` / \`clearTimeout\` |
| \`addEventListener\` | \`removeEventListener\`（同一个 handler 引用）|
| 订阅（库） | 调用返回的 unsubscribe |
| \`fetch\` | \`AbortController.abort()\` |
| WebSocket | \`socket.close()\` |
| 第三方库实例 | 调用 \`dispose()\` / \`destroy()\` |
| 定时动画 | \`cancelAnimationFrame()\` |
| IntersectionObserver | \`observer.disconnect()\` |

---

## 小结

本章核心知识点：

1. **清理时机**：卸载时 + 依赖变化导致 effect 重跑前
2. **多种清理模式**：
   - 定时器：\`clearInterval\` / \`clearTimeout\`
   - 事件监听：\`removeEventListener\`（同一引用）
   - 订阅：调用 unsubscribe
   - fetch：\`AbortController.abort()\`
3. **常见错误**：
   - 忘记清理
   - 清理的不是同一个引用
   - 清理时引用的变量已变化
4. **第三方库**：通常有 \`dispose()\` / \`destroy()\` / \`unsubscribe()\`

下一章**数据请求 useEffect**——处理真实业务中最常见的副作用。`,
  },
  // ===========================================================
  // 第 34 章：数据请求 useEffect
  // ===========================================================
  {
    id: "tsx2-ch34",
    group: "第七部分 useEffect 深入",
    icon: "🌐",
    title: "第三十四章 数据请求 useEffect",
    content: `# 数据请求 useEffect

数据请求是 useEffect 最常见的应用场景。本章从基础到加载/错误状态、竞态条件、AbortController，建立完整认知。

---

## 一、基础 fetch

\`\`\`tsx
import { useState, useEffect } from "react";

type User = { id: number; name: string; email: string };

function BasicFetch() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 简单的 fetch
    fetch("/api/user/1")
      .then((r) => r.json())
      .then((data) => setUser(data));
  }, []);  // 只挂载时请求

  return <pre>{JSON.stringify(user, null, 2)}</pre>;
}
\`\`\`

> 💡 **真实项目**：用 SWR / React Query / TanStack Query 等库更强大（缓存、重试、自动重验证等）。

---

## 二、加载 / 错误状态

请求需要跟踪**三个状态**：loading / success / error：

\`\`\`tsx
type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

function useFetch<T>(url: string) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // 每次新请求重置状态
    setState({ data: null, loading: true, error: null });

    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error(\`HTTP \${r.status}\`);
        return r.json();
      })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => setState({ data: null, loading: false, error: err.message }));
  }, [url]);

  return state;
}

// 使用
function UserProfile({ userId }: { userId: number }) {
  const { data, loading, error } = useFetch<User>(\`/api/users/\${userId}\`);

  if (loading) return <p>加载中...</p>;
  if (error) return <p>错误: {error}</p>;
  if (!data) return <p>无数据</p>;
  return <div>{data.name}</div>;
}
\`\`\`

---

## 三、依赖变化时重新请求

\`\`\`tsx
function UserPosts({ userId }: { userId: number }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 状态归零
    setPosts([]);
    setLoading(true);

    fetch(\`/api/users/\${userId}/posts\`)
      .then((r) => r.json())
      .then((d) => {
        setPosts(d);
        setLoading(false);
      });
  }, [userId]);  // userId 变化重新请求

  if (loading) return <p>加载中...</p>;
  return <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}
\`\`\`

---

## 四、竞态条件（Race Condition）

**问题**：用户快速切换 userId，旧请求可能后于新请求返回，导致显示旧数据。

\`\`\`tsx
// ❌ 错：竞态条件
function Buggy({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then((r) => r.json())
      .then((data) => setUser(data));
    // 问题：先发的请求后返回，会覆盖 setUser
  }, [userId]);

  return <p>{user?.name}</p>;
}
\`\`\`

**场景**：userId 快速从 1→2→3，请求 1 慢、请求 3 快。
1. 请求 1（userId=1）发出
2. 请求 2（userId=2）发出
3. 请求 3（userId=3）发出
4. 请求 3 先返回 → setUser(user3)
5. 请求 1 后返回 → setUser(user1) ❌ 显示了 user 1！

---

## 五、解决竞态：AbortController

\`\`\`tsx
function CorrectWithAbort({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 每次新 effect 创建独立的 controller
    const controller = new AbortController();
    setLoading(true);

    fetch(\`/api/users/\${userId}\`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          // 请求被取消——不需要处理
          return;
        }
        console.error(err);
        setLoading(false);
      });

    // 清理时取消旧请求
    return () => {
      controller.abort();
    };
  }, [userId]);

  return <p>{loading ? "加载中..." : user?.name}</p>;
}
\`\`\`

> 💡 **原理**：cleanup 函数在 userId 变化时立即调用，\`.abort()\` 取消上一次 fetch；后续即使返回也会被忽略。

---

## 六、解决竞态：ignore flag

\`\`\`tsx
function CorrectWithIgnore({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 标记本次 effect 是否"已过期"
    let ignore = false;

    fetch(\`/api/users/\${userId}\`)
      .then((r) => r.json())
      .then((data) => {
        // 如果 ignore 为 true，说明已经被新 effect 取代
        if (!ignore) setUser(data);
      });

    // 清理时设为 true
    return () => {
      ignore = true;
    };
  }, [userId]);

  return <p>{user?.name}</p>;
}
\`\`\`

> 💡 **AbortController vs ignore flag**：
> - AbortController：取消网络请求（节省带宽）
> - ignore flag：仅忽略结果（请求仍会完成）
> - 真实项目推荐 AbortController

---

## 七、async/await 写法

\`\`\`tsx
function AsyncAwait({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // effect 本身不能是 async（会返回 Promise<Promise<void>>）
    // 用 IIFE 包一层
    const controller = new AbortController();

    (async () => {
      try {
        const r = await fetch(\`/api/users/\${userId}\`, { signal: controller.signal });
        const data = await r.json();
        setUser(data);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error(err);
      }
    })();

    return () => controller.abort();
  }, [userId]);

  return <p>{user?.name}</p>;
}
\`\`\`

> ⚠️ **重要**：useEffect 回调**不能直接 async**——\`() => Promise<void>\` 与 React 期望的 \`() => void | cleanupFn\` 类型不匹配。

---

## 八、完整 Demo：完整数据请求组件

\`\`\`tsx
// 完整 Demo：数据请求综合
import React, { useState, useEffect } from "react";

type Post = { id: number; title: string; body: string };

// 模拟一个延迟不稳定的 API
function mockFetch(url: string, delay: number): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (url.includes("/posts/")) {
        const id = Number(url.split("/").pop());
        resolve({
          id,
          title: \`文章 \${id}\`,
          body: \`这是文章 \${id} 的内容\`,
        });
      } else {
        resolve({});
      }
    }, delay);
  });
}

function DataFetchingDemo() {
  const [postId, setPostId] = useState(1);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    // AbortController 解决竞态
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    // 模拟不同延迟
    const delay = Math.random() * 2000;
    const start = Date.now();

    mockFetch(\`/api/posts/\${postId}\`, delay)
      .then((data) => {
        // 检查是否被取消
        if (controller.signal.aborted) {
          console.log(\`请求 \${postId} 被取消\`);
          return;
        }
        const elapsed = Date.now() - start;
        setPost(data);
        setLoading(false);
        setHistory((h) => [\`✅ post \${postId} 加载完成（\${elapsed}ms）\`, ...h].slice(0, 5));
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setLoading(false);
      });

    setHistory((h) => [\`🔄 发起请求 post \${postId}（预计 \${Math.round(delay)}ms）\`, ...h].slice(0, 5));

    return () => {
      controller.abort();
    };
  }, [postId]);

  return (
    <div style={{ padding: 16 }}>
      <h2>数据请求 Demo</h2>

      <div>
        <button onClick={() => setPostId(1)} disabled={postId === 1}>文章 1</button>
        <button onClick={() => setPostId(2)} disabled={postId === 2}>文章 2</button>
        <button onClick={() => setPostId(3)} disabled={postId === 3}>文章 3</button>
      </div>

      <p>当前: postId = {postId}</p>

      <div style={{ background: "#f5f5f5", padding: 12, margin: "12px 0" }}>
        {loading && <p>加载中...</p>}
        {error && <p style={{ color: "red" }}>错误: {error}</p>}
        {post && !loading && (
          <>
            <h3>{post.title}</h3>
            <p>{post.body}</p>
          </>
        )}
      </div>

      <h3>请求历史</h3>
      <ul style={{ fontSize: 12 }}>
        {history.map((h, i) => <li key={i}>{h}</li>)}
      </ul>
    </div>
  );
}

export default DataFetchingDemo;
\`\`\`

**实验步骤**：
1. 快速点击 1 → 2 → 3 → 看历史：旧请求会被取消
2. 看 history 列表：观察哪些请求完成、哪些被取消

---

## 九、useEffect 数据请求 vs 专用库

| 维度 | useEffect | SWR / React Query |
| --- | --- | --- |
| 缓存 | 手动 | 自动 |
| 重新验证 | 手动 | 窗口聚焦、网络重连自动 |
| 重试 | 手动 | 内置 |
| 竞态处理 | AbortController | 自动 |
| 分页 / 无限滚动 | 自己写 | 钩子支持 |
| 乐观更新 | 复杂 | 内置 API |
| 性能 | 一般 | 优秀 |
| 体积 | 0 | ~5-15KB |

> 💡 **真实项目推荐**：用 SWR 或 React Query，useEffect 只用于简单 / 一次性请求。

---

## 小结

本章核心知识点：

1. **三状态**：loading / error / data，状态机式管理
2. **依赖请求**：\`[userId, ...]\` 触发重新请求
3. **竞态条件**：旧请求可能后于新请求返回
4. **解决方案**：
   - **AbortController**：取消旧请求（推荐）
   - **ignore flag**：忽略旧结果
5. **async 写法**：不能直接 async effect，用 IIFE
6. **生产推荐**：用 SWR / React Query 替代裸 useEffect

下一章**useEffect 替代方案**——什么情况下根本不该用 useEffect。`,
  },
  // ===========================================================
  // 第 35 章：useEffect 替代方案
  // ===========================================================
  {
    id: "tsx2-ch35",
    group: "第七部分 useEffect 深入",
    icon: "🆚",
    title: "第三十五章 useEffect 替代方案",
    content: `# useEffect 替代方案

新手最常见的错误是**过度使用 useEffect**——把本该在渲染时算的逻辑放进 effect，导致双重渲染、状态错乱、性能浪费。本章系统讲解 useEffect 的替代方案。

---

## 一、useEffect vs useLayoutEffect

\`\`\`tsx
import { useEffect, useLayoutEffect } from "react";

function Comparison() {
  useEffect(() => {
    // 默认行为：异步，在浏览器绘制之后执行
    // 大多数副作用用这个
    console.log("useEffect: 浏览器已经画完了");
  });

  useLayoutEffect(() => {
    // 同步：DOM 更新后、浏览器绘制前执行
    // 用于需要同步修改 DOM 避免闪烁的场景
    console.log("useLayoutEffect: DOM 更新完，浏览器还没画");
  });

  return <div>看控制台顺序</div>;
}
\`\`\`

**执行顺序**：
1. React 更新 DOM
2. \`useLayoutEffect\` 同步执行
3. 浏览器绘制（用户看到画面）
4. \`useEffect\` 异步执行

### 何时用 useLayoutEffect？

\`\`\`tsx
// 场景：测量 DOM 并立即调整位置
function Tooltip({ target, content }: { target: React.RefObject<HTMLElement>; content: string }) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    // 必须同步执行——否则用户先看到错位的 tooltip，再跳到正确位置
    if (!target.current || !tooltipRef.current) return;
    const targetRect = target.current.getBoundingClientRect();
    const tipRect = tooltipRef.current.getBoundingClientRect();
    setPosition({
      top: targetRect.bottom + window.scrollY,
      left: targetRect.left + targetRect.width / 2 - tipRect.width / 2,
    });
  }, [target]);

  return <div ref={tooltipRef} style={{ position: "absolute", ...position }}>{content}</div>;
}
\`\`\`

| 维度 | useEffect | useLayoutEffect |
| --- | --- | --- |
| 时机 | 浏览器绘制后（异步） | DOM 更新后、绘制前（同步） |
| 性能 | 不阻塞绘制 | 阻塞绘制（少量）|
| 用途 | 大多数副作用 | DOM 测量、避免闪烁 |
| SSR | 不会运行（兼容）| 会运行（需要 \`isClient\` 保护）|

> 💡 **99% 场景用 useEffect**。useLayoutEffect 仅在需要同步 DOM 修改避免闪烁时使用。

---

## 二、useEffect vs 事件处理

**核心原则**：响应**用户事件**的逻辑应该在**事件处理函数**中，不在 effect 中。

\`\`\`tsx
// ❌ 错：把"点击提交"的逻辑放进 effect
function Wrong() {
  const [name, setName] = useState("");
  const [submittedName, setSubmittedName] = useState("");

  useEffect(() => {
    if (name) {
      // 每次 name 变化都触发——包括自动填充、程序设置等
      setSubmittedName(name);
    }
  }, [name]);

  return <button onClick={() => setName("张三")}>提交</button>;
}

// ✅ 对：在事件处理中直接做
function Correct() {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    const value = "张三";
    setName(value);
    // 提交逻辑直接做
    submitToServer(value);
  };

  return <button onClick={handleSubmit}>提交</button>;
}
\`\`\`

### 何时该用 useEffect？

| 场景 | 推荐位置 |
| --- | --- |
| 响应用户点击/输入 | **事件处理** |
| 提交时发请求 | **事件处理** |
| 进入页面时拉数据 | useEffect（mount）|
| 数据变化时同步 | useEffect（依赖变化）|
| 定时刷新 | useEffect |
| 卸载时清理 | useEffect |

---

## 三、useEffect vs 派生状态

**最常见反模式**：把**可以计算**的值存进 state，导致双重数据源。

\`\`\`tsx
// ❌ 错：把派生值存进 state
function AntiPattern({ items }: { items: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [filtered, setFiltered] = useState<Item[]>([]);  // 派生值！

  useEffect(() => {
    setFiltered(items.filter((i) => i.active));
  }, [items]);  // 派生更新

  return <List items={filtered} />;
}

// 问题：
// 1. 双重渲染：先渲染空，再渲染过滤后
// 2. 数据不一致：items 和 filtered 可能错位
// 3. 性能浪费：多一次 setState

// ✅ 对：渲染时直接计算
function Good({ items }: { items: Item[] }) {
  const filtered = items.filter((i) => i.active);  // 派生
  return <List items={filtered} />;
}
\`\`\`

> 💡 **口诀**：能从 state/props 算出的值，**永远不要存进 state**。

### 当派生"昂贵"时

\`\`\`tsx
// 用 useMemo 缓存派生计算
function WithMemo({ items, keyword }: { items: Item[]; keyword: string }) {
  // 昂贵的过滤——只在 items 或 keyword 变化时重算
  const filtered = useMemo(() => {
    console.log("重新过滤");
    return items.filter((i) => i.name.includes(keyword));
  }, [items, keyword]);

  return <List items={filtered} />;
}
\`\`\`

---

## 四、useEffect 替代方案总结

### 1. 派生值 → 直接计算 / useMemo

\`\`\`tsx
// ❌ useEffect 同步派生
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(\`\${firstName} \${lastName}\`);
}, [firstName, lastName]);

// ✅ 渲染时计算
const fullName = \`\${firstName} \${lastName}\`;
\`\`\`

### 2. 事件响应 → 事件处理函数

\`\`\`tsx
// ❌ useEffect 响应事件
useEffect(() => {
  if (count > 10) alert("太多了");
}, [count]);

// ✅ 事件处理
const handleIncrement = () => {
  const newCount = count + 1;
  setCount(newCount);
  if (newCount > 10) alert("太多了");
};
\`\`\`

### 3. 重置 state → key prop

\`\`\`tsx
// ❌ useEffect 重置
function Form({ userId }: { userId: number }) {
  const [name, setName] = useState("");
  useEffect(() => {
    setName("");  // userId 变化时清空
  }, [userId]);
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}

// ✅ key 重置
function Form({ userId }: { userId: number }) {
  const [name, setName] = useState("");
  return <input key={userId} value={name} onChange={(e) => setName(e.target.value)} />;
}
// 父组件用 <Form key={userId} /> 即可
\`\`\`

### 4. 状态管理 → 状态管理库

\`\`\`tsx
// ❌ 多个组件共享状态，层层传 props + useEffect 同步
function App() {
  const [user, setUser] = useState(null);
  return (
    <Header user={user} setUser={setUser}>
      <Sidebar user={user}>
        <Profile user={user} />
      </Sidebar>
    </Header>
  );
}

// ✅ Context 或 Zustand
const UserContext = createContext(null);
function App() {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Header />
      <Sidebar>
        <Profile />
      </Sidebar>
    </UserContext.Provider>
  );
}
\`\`\`

### 5. 数据获取 → SWR / React Query

\`\`\`tsx
// ❌ useEffect 手写数据获取
function User({ id }: { id: number }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch(\`/api/users/\${id}\`).then((r) => r.json()).then((d) => {
      setUser(d);
      setLoading(false);
    });
  }, [id]);
  return loading ? "..." : user?.name;
}

// ✅ SWR
import useSWR from "swr";
function User({ id }: { id: number }) {
  const { data: user, isLoading } = useSWR(\`/api/users/\${id}\`, fetcher);
  return isLoading ? "..." : user?.name;
}
\`\`\`

### 6. 全局副作用 → 事件总线 / 状态管理

\`\`\`tsx
// ❌ 组件 A 改 state，effect 通知组件 B
function A() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    EventBus.emit("countChanged", count);
  }, [count]);
  return <button onClick={() => setCount(count + 1)}>+</button>;
}

// ✅ 直接在事件中触发
function A() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => {
      setCount(count + 1);
      EventBus.emit("countChanged", count + 1);
    }}>+</button>
  );
}
\`\`\`

---

## 五、何时**才**该用 useEffect？

根据 React 官方文档，\`useEffect\` 适用于**与外部系统同步**的场景：

| 场景 | 例子 |
| --- | --- |
| **订阅** | WebSocket、EventSource、第三方订阅 |
| **定时器** | setInterval、setTimeout |
| **DOM 操作** | 手动聚焦、滚动到某位置（同步用 useLayoutEffect）|
| **事件监听** | window.addEventListener |
| **第三方库集成** | ECharts、Mapbox、D3 |
| **数据获取** | 简单 / 一次性请求（生产推荐 SWR）|
| **同步到存储** | localStorage / IndexedDB |
| **日志 / 埋点** | 副作用型监控 |

**反模式**（不要用 useEffect）：

- 派生状态（应该直接计算）
- 响应用户事件（应该在事件处理）
- 组件间通信（应该用 props / context / 状态管理）
- 重置 state（应该用 key）

---

## 六、完整 Demo：何时用 / 不用 useEffect

\`\`\`tsx
// 完整 Demo：useEffect 正反对比
import React, { useState, useEffect, useMemo } from "react";

function EffectsWhenToUse() {
  const [firstName, setFirstName] = useState("张");
  const [lastName, setLastName] = useState("三");
  const [count, setCount] = useState(0);
  const [items] = useState([
    { id: 1, name: "苹果", active: true },
    { id: 2, name: "香蕉", active: false },
    { id: 3, name: "橘子", active: true },
  ]);

  // ---------- 反模式 1: 派生值存进 state ----------
  // ❌ 错
  // const [fullName, setFullName] = useState("");
  // useEffect(() => {
  //   setFullName(\`\${firstName} \${lastName}\`);
  // }, [firstName, lastName]);

  // ✅ 对：直接计算
  const fullName = \`\${firstName} \${lastName}\`;

  // ---------- 反模式 2: 事件响应放 effect ----------
  // ❌ 错
  // useEffect(() => {
  //   if (count > 5) alert("太多了");
  // }, [count]);

  // ✅ 对：事件处理中判断
  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    if (newCount > 5) {
      // 仍然可以 setTimeout 提示——但触发逻辑在事件中
      setTimeout(() => alert("太多了！"), 0);
    }
  };

  // ---------- 反模式 3: 派生列表存进 state ----------
  // ❌ 错：useEffect 中 setFiltered
  // ✅ 对：useMemo 或直接算
  const activeItems = useMemo(
    () => items.filter((i) => i.active),
    [items]
  );

  // ---------- 正确用法: 副作用 ----------
  // ✅ 挂载时记录日志
  useEffect(() => {
    console.log("组件挂载");
  }, []);

  // ✅ count 变化时上报（埋点）
  useEffect(() => {
    if (count > 0) console.log(\`[埋点] count = \${count}\`);
  }, [count]);

  // ✅ 模拟同步到 localStorage
  useEffect(() => {
    localStorage.setItem("fullName", fullName);
  }, [fullName]);

  return (
    <div style={{ padding: 16 }}>
      <h2>useEffect 何时用 / 不用</h2>

      <h3>1. 派生值（直接计算）</h3>
      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
      <p>fullName: {fullName}</p>

      <h3>2. 事件响应（在事件中做）</h3>
      <p>count: {count}</p>
      <button onClick={handleIncrement}>+1</button>

      <h3>3. 派生列表（useMemo 或直接算）</h3>
      <p>激活项: {activeItems.map((i) => i.name).join(", ")}</p>

      <h3>4. 副作用（useEffect）</h3>
      <p style={{ fontSize: 12, color: "#666" }}>
        打开控制台：
        - "组件挂载" 一次
        - count 变化时埋点
        - fullName 同步到 localStorage
      </p>
    </div>
  );
}

export default EffectsWhenToUse;
\`\`\`

---

## 小结

本章核心知识点：

1. **useLayoutEffect**：同步执行，DOM 更新后、绘制前——仅用于避免闪烁的同步 DOM 操作
2. **useEffect vs 事件**：响应用户事件放事件处理；只有 mount / 副作用才用 effect
3. **useEffect vs 派生**：派生值直接算或用 useMemo，不要存进 state
4. **替代方案**：
   - 派生值 → useMemo / 直接计算
   - 事件响应 → 事件处理函数
   - 重置 state → key prop
   - 组件通信 → Context / 状态管理
   - 数据获取 → SWR / React Query
5. **useEffect 适用场景**：订阅、定时器、事件监听、第三方库、日志、localStorage
6. **反模式**：派生值、事件响应、组件通信、state 重置——这些用 effect 都会导致 bug

至此"第七部分 useEffect 深入"全部完成。下一部分进入**useRef / useMemo / useCallback** 性能优化专题。`,
  },
];

export { chapters };
