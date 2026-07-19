// =============================================================
// TSX 教程 - 第三批章节（第六部分 useState 深入，共 5 章）
// -------------------------------------------------------------
// 覆盖：useState 基础 / 更新机制 / 复杂状态 / 状态提升 / 常见陷阱
// 每章包含详细讲解 + 多个代码示例 + 可运行 demo
// =============================================================

const chapters = [
  // ===========================================================
  // 第 26 章：useState 基础
  // ===========================================================
  {
    id: "tsx2-ch26",
    group: "第六部分 useState 深入",
    icon: "📊",
    title: "第二十六章 useState 基础",
    content: `# useState 基础

\`useState\` 是 React 中最常用的 Hook——它让函数组件拥有"记忆"能力。本章从基础语法到各种 state 形式，再到惰性初始化，完整覆盖日常使用。

---

## 一、useState 的基本语法

\`\`\`tsx
import { useState } from "react";

// 语法：const [value, setValue] = useState(initialValue);
// 返回值是一个数组：[当前状态, 更新状态的函数]

function Counter() {
  // 1. 调用 useState，传入初始值 0
  // 2. 解构出 [count, setCount]
  //    - count: 当前状态（本次渲染时的快照）
  //    - setCount: 更新状态的函数
  const [count, setCount] = useState(0);

  return (
    <>
      <p>当前计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>重置</button>
    </>
  );
}
\`\`\`

**执行流程**：
1. 第一次渲染：\`count = 0\`，返回 JSX，浏览器显示 0
2. 用户点击 +1：调用 \`setCount(1)\`
3. React 调度更新：组件重新执行
4. 重新渲染：\`count = 1\`，显示 1

> 💡 **关键认知**：每次渲染都是函数的一次完整执行。\`const [count, setCount] = useState(0)\` 会**每次都执行**，但 React 内部"记住"了真正的状态值。**渲染时的 count 永远是当前快照**。

---

## 二、TypeScript 下的类型推断与显式标注

\`\`\`tsx
// 情况 1：初始值是字面量——自动推断
// 推断为 number（因为 0 是 number）
const [count, setCount] = useState(0);

// 情况 2：初始值是 null——自动推断
const [user, setUser] = useState(null);
// 类型：null（不是 User | null，因为没显式指定）

// 情况 3：显式指定类型
type User = { name: string; age: number };
const [user, setUser] = useState<User | null>(null);
// 类型：User | null

// 情况 4：复杂对象/联合类型
type Status = "idle" | "loading" | "success" | "error";
const [status, setStatus] = useState<Status>("idle");

// 情况 5：数组
const [list, setList] = useState<string[]>([]);
// 也可以：useState<Array<string>>([])
\`\`\`

**重要原则**：
- TypeScript 通常能从初始值推断出类型
- 当初始值是 \`null\`、\`undefined\`、空数组 \`[]\` 时，**必须显式指定类型**
- 否则类型会"窄化"成 \`null\` / \`never[]\`，后续无法添加内容

---

## 三、各种 state 形式

### 1. 基本类型（number / string / boolean）

\`\`\`tsx
function PrimitiveStates() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState(false);

  return (
    <>
      <p>{count} - {name} - {enabled ? "开启" : "关闭"}</p>
      <button onClick={() => setCount(count + 1)}>count+1</button>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={() => setEnabled(!enabled)}>切换</button>
    </>
  );
}
\`\`\`

### 2. 对象 state

\`\`\`tsx
type User = {
  name: string;
  age: number;
  email: string;
};

function ObjectState() {
  // 初始值用对象字面量
  const [user, setUser] = useState<User>({
    name: "张三",
    age: 25,
    email: "zhang@example.com",
  });

  // 修改单个字段：必须展开原对象
  // 错误：setUser({ name: "李四" }) 会丢失 age 和 email
  // 正确：setUser(prev => ({ ...prev, name: "李四" }))
  const updateName = (name: string) => {
    setUser((prev) => ({ ...prev, name }));
  };

  return (
    <>
      <p>{user.name}, {user.age}岁, {user.email}</p>
      <button onClick={() => updateName("李四")}>改名</button>
    </>
  );
}
\`\`\`

> ⚠️ **核心原则**：state 不可变更新。**永远不要直接修改原对象**，必须创建新对象。

### 3. 数组 state

\`\`\`tsx
function ArrayState() {
  // 显式指定数组元素类型为 string
  const [items, setItems] = useState<string[]>([]);

  // 添加：返回新数组
  const addItem = (item: string) => {
    setItems((prev) => [...prev, item]);
  };

  // 删除：filter 过滤
  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // 更新：map 替换
  const updateItem = (index: number, newVal: string) => {
    setItems((prev) => prev.map((v, i) => (i === index ? newVal : v)));
  };

  return (
    <>
      <button onClick={() => addItem(\`item-\${items.length}\`)}>添加</button>
      <ul>
        {items.map((item, i) => (
          <li key={i}>
            {item}
            <button onClick={() => updateItem(i, item + "*")}>改</button>
            <button onClick={() => removeItem(i)}>删</button>
          </li>
        ))}
      </ul>
    </>
  );
}
\`\`\`

### 4. 嵌套对象 / 嵌套数组

\`\`\`tsx
type AppState = {
  user: { name: string; profile: { bio: string; age: number } };
  posts: Array<{ id: number; title: string; tags: string[] }>;
};

function NestedState() {
  const [state, setState] = useState<AppState>({
    user: { name: "张三", profile: { bio: "前端工程师", age: 25 } },
    posts: [],
  });

  // 深层修改：逐层展开
  const updateBio = (bio: string) => {
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        profile: {
          ...prev.user.profile,
          bio,
        },
      },
    }));
  };

  return (
    <>
      <p>{state.user.name}: {state.user.profile.bio}</p>
      <button onClick={() => updateBio("更新后的简介")}>改 bio</button>
    </>
  );
}
\`\`\`

> 💡 **当嵌套很深**：考虑用 **useReducer**（第 28 章）或 **Immer** 库。

---

## 四、惰性初始化（Lazy Initialization）

当 state 的初始值需要**昂贵的计算**时（如从 localStorage 读、解析 JSON），用函数形式的初始值可以**避免每次渲染都执行**：

\`\`\`tsx
function LazyInit() {
  // ❌ 错误写法：每次渲染都会执行 JSON.parse
  // const [data, setData] = useState(JSON.parse(localStorage.getItem("data") || "{}"));

  // ✅ 正确写法：传入函数，只在挂载时执行一次
  const [data, setData] = useState(() => {
    // 这个函数只在组件首次渲染时调用
    const raw = localStorage.getItem("data");
    if (!raw) return { count: 0 };
    try {
      return JSON.parse(raw);
    } catch {
      return { count: 0 };
    }
  });

  // 数据变化时写回 localStorage（用 useEffect，见第七部分）
  React.useEffect(() => {
    localStorage.setItem("data", JSON.stringify(data));
  }, [data]);

  return (
    <>
      <p>count: {data.count}</p>
      <button onClick={() => setData({ count: data.count + 1 })}>+1</button>
    </>
  );
}
\`\`\`

**对比表**：

| 形式 | 何时执行 | 适用场景 |
| --- | --- | --- |
| \`useState(value)\` | **每次渲染** | 简单字面量 |
| \`useState(() => value)\` | **仅首次渲染** | 昂贵计算、读 localStorage、解析 JSON |

---

## 五、setState 的两种传参形式

\`\`\`tsx
function SetterForms() {
  const [count, setCount] = useState(0);

  // 形式 1：直接传新值
  const increment1 = () => setCount(count + 1);

  // 形式 2：传函数（基于上一次状态计算）
  const increment2 = () => setCount((prev) => prev + 1);

  // 两者的区别在连续调用时显现
  const handleTriple1 = () => {
    // 假设 count = 0
    setCount(count + 1);  // 1 (基于 0)
    setCount(count + 1);  // 1 (基于 0，不是 1！)
    setCount(count + 1);  // 1 (基于 0)
    // 结果：1
  };

  const handleTriple2 = () => {
    setCount((prev) => prev + 1);  // 0 + 1 = 1
    setCount((prev) => prev + 1);  // 1 + 1 = 2
    setCount((prev) => prev + 1);  // 2 + 1 = 3
    // 结果：3
  };

  return (
    <>
      <p>count: {count}</p>
      <button onClick={handleTriple1}>三次+1（直接传值）</button>
      <button onClick={handleTriple2}>三次+1（函数式）</button>
    </>
  );
}
\`\`\`

> 💡 **核心规则**：基于"上一次状态"计算新状态时，必须用函数形式。下一章会详细讲解。

---

## 六、完整 Demo：用户信息编辑器

\`\`\`tsx
// 完整 Demo：useState 综合应用
import React, { useState } from "react";

type User = {
  name: string;
  age: number;
  email: string;
  hobbies: string[];
};

function UserEditor() {
  // 1. 对象 state
  const [user, setUser] = useState<User>({
    name: "张三",
    age: 25,
    email: "zhang@example.com",
    hobbies: ["阅读", "运动"],
  });

  // 2. 字符串 state（输入框临时值）
  const [newHobby, setNewHobby] = useState("");

  // 修改单个字段——函数式更新保证连续调用不出错
  const updateField = <K extends keyof User>(field: K, value: User[K]) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  // 添加爱好
  const addHobby = () => {
    const trimmed = newHobby.trim();
    if (!trimmed) return;
    // 数组追加：返回新数组
    setUser((prev) => ({
      ...prev,
      hobbies: [...prev.hobbies, trimmed],
    }));
    setNewHobby("");  // 清空输入
  };

  // 删除爱好
  const removeHobby = (index: number) => {
    setUser((prev) => ({
      ...prev,
      hobbies: prev.hobbies.filter((_, i) => i !== index),
    }));
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>用户编辑器</h2>

      <div>
        <label>姓名：</label>
        <input
          value={user.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
      </div>

      <div>
        <label>年龄：</label>
        <input
          type="number"
          value={user.age}
          onChange={(e) => updateField("age", Number(e.target.value) || 0)}
        />
      </div>

      <div>
        <label>邮箱：</label>
        <input
          type="email"
          value={user.email}
          onChange={(e) => updateField("email", e.target.value)}
        />
      </div>

      <div>
        <label>添加爱好：</label>
        <input
          value={newHobby}
          onChange={(e) => setNewHobby(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addHobby()}
          placeholder="回车添加"
        />
        <button onClick={addHobby}>添加</button>
      </div>

      <h3>爱好列表</h3>
      <ul>
        {user.hobbies.map((h, i) => (
          <li key={i}>
            {h}
            <button onClick={() => removeHobby(i)}>删除</button>
          </li>
        ))}
      </ul>

      <details>
        <summary>当前 state</summary>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </details>
    </div>
  );
}

export default UserEditor;
\`\`\`

---

## 七、key 技巧：重置组件 state

\`\`\`tsx
function ResetDemo() {
  const [version, setVersion] = useState(0);

  return (
    <>
      {/* key 变化时，React 卸载旧组件、挂载新组件——state 全部重置 */}
      <UserEditor key={version} />
      <button onClick={() => setVersion((v) => v + 1)}>重置表单</button>
    </>
  );
}
\`\`\`

> 💡 **实战技巧**：用 \`key\` 重置组件是 React 官方推荐做法，比手动清空每个 state 更可靠。

---

## 小结

本章核心知识点：

1. **基本语法**：\`const [val, setVal] = useState(initial)\`
2. **类型标注**：初始值为 null/[] 时必须显式指定
3. **state 形式**：基本类型、对象、数组、嵌套结构都支持
4. **不可变更新**：永远创建新值，不用 mutation
5. **惰性初始化**：\`useState(() => expensive())\` 避免重复计算
6. **两种 setter**：直接传值 vs 函数式（基于 prev 计算）
7. **key 重置**：\`key={version}\` 是清空 state 的最简方法

下一章深入讲解 useState 的**更新机制**——批处理、闭包陷阱等核心概念。`,
  },
  // ===========================================================
  // 第 27 章：useState 更新机制
  // ===========================================================
  {
    id: "tsx2-ch27",
    group: "第六部分 useState 深入",
    icon: "🔄",
    title: "第二十七章 useState 更新机制",
    content: `# useState 更新机制

\`setState\` 看起来只是赋值，但内部机制远比想象中复杂。本章深入 React 状态更新的核心：批处理、闭包陷阱、stale state、引用相等性等。

---

## 一、状态更新是异步的

\`setState\` 不会立即更新 state，而是**调度一次更新**。当前渲染中的 state 仍是旧值：

\`\`\`tsx
function AsyncUpdate() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    // 同步执行：count 仍是旧值！
    console.log(count);  // 0
  };

  // React 调度更新 → 重新渲染 → 这次 console.log 才显示新值
  return <button onClick={handleClick}>{count}</button>;
}
\`\`\`

**为什么这样设计？**
- 如果 setState 立即生效，连续调用 3 次 setCount(+1) 会触发 3 次重渲染
- 异步批处理可以让 3 次更新合并成 1 次重渲染

---

## 二、批处理更新（Batching）

React 18+ 引入 **Automatic Batching**——同一事件回调中的所有 setState 都会被批处理：

\`\`\`tsx
function BatchingDemo() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);

  const handleClick = () => {
    // 三个 setState 不会触发三次重渲染
    // React 18+ 会合并成一次重渲染
    setA(1);
    setB(2);
    setC(3);
    // 渲染完成后：a=1, b=2, c=3，且只重渲染 1 次
  };

  return <button onClick={handleClick}>{a + b + c}</button>;
}
\`\`\`

> 💡 **React 18 之前**：只在 React 事件处理中批处理，setTimeout / Promise 中不批处理。React 18+ 全部场景都批处理。

---

## 三、闭包陷阱（Stale State）

**最常见的 useState 陷阱**：

\`\`\`tsx
function StaleState() {
  const [count, setCount] = useState(0);

  // 假设 1 秒后触发——会读到旧的 count
  const handleStale = () => {
    setTimeout(() => {
      console.log("1秒后的 count:", count);  // 永远是点击时的 count
    }, 1000);
  };

  // 解决方案：函数式更新
  const handleCorrect = () => {
    setTimeout(() => {
      setCount((prev) => {
        console.log("基于 prev:", prev);  // 拿到最新值
        return prev + 1;
      });
    }, 1000);
  };

  return (
    <>
      <p>count: {count}</p>
      <button onClick={handleStale}>闭包陷阱</button>
      <button onClick={handleCorrect}>正确写法</button>
    </>
  );
}
\`\`\`

**为什么会 stale？**
- 每次渲染都创建一个新的"闭包"，捕获那次的 \`count\`
- setTimeout 的回调捕获的是**点击时那次渲染的 count**
- 即使后续 count 变化，回调里的 count 仍是旧的

---

## 四、何时用函数式更新

\`\`\`tsx
function WhenToUseFunctional() {
  const [count, setCount] = useState(0);

  // ❌ 直接传值：在批处理中可能丢失更新
  const wrongWay = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    // React 看到三次 setCount(count + 1)，count 都是 0
    // 结果：count = 1（不是 3）
  };

  // ✅ 函数式更新：每次都基于最新值
  const rightWay = () => {
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
    // 依次：0+1=1, 1+1=2, 2+1=3
    // 结果：count = 3
  };

  return (
    <>
      <p>count: {count}</p>
      <button onClick={wrongWay}>错误（值=1）</button>
      <button onClick={rightWay}>正确（值=3）</button>
    </>
  );
}
\`\`\`

**判断标准**：

| 场景 | 推荐写法 | 原因 |
| --- | --- | --- |
| 新值与旧值无关（重置） | \`setValue(newVal)\` | 简单清晰 |
| 基于旧值计算（+1、+n） | \`setValue(prev => prev + n)\` | 避免 stale |
| 异步操作中更新 | \`setValue(prev => ...)\` | 闭包可能捕获旧值 |
| 对象/数组深更新 | \`setValue(prev => ({ ...prev, x }))\` | 保证基于最新 |
| 多次连续 setState | 函数式 | 否则会丢失 |

---

## 五、引用相等性与重渲染

useState 用 \`Object.is\` 比较新旧值。**如果引用没变，组件不会重渲染**：

\`\`\`tsx
function ReferenceEquality() {
  const [user, setUser] = useState({ name: "张三", age: 25 });

  // ❌ 直接 mutation：引用没变，不触发重渲染
  const wrongUpdate = () => {
    user.age += 1;  // 直接改原对象
    setUser(user);  // Object.is(user, user) === true，跳过更新
  };

  // ✅ 创建新对象：引用变化，触发重渲染
  const correctUpdate = () => {
    setUser((prev) => ({ ...prev, age: prev.age + 1 }));
  };

  return (
    <>
      <p>age: {user.age}</p>
      <button onClick={wrongUpdate}>错误（不更新）</button>
      <button onClick={correctUpdate}>正确（更新）</button>
    </>
  );
}
\`\`\`

> ⚠️ **重要规则**：React 通过 \`Object.is(prev, next)\` 判断是否更新。返回**相同引用**会被跳过；返回**新引用**才更新。

---

## 六、深层对象的更新

\`\`\`tsx
type State = {
  user: {
    name: string;
    profile: {
      bio: string;
      tags: string[];
    };
  };
};

function DeepUpdate() {
  const [state, setState] = useState<State>({
    user: {
      name: "张三",
      profile: { bio: "前端", tags: ["React", "TypeScript"] },
    },
  });

  // 修改 bio：每层都要展开
  const updateBio = (bio: string) => {
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        profile: {
          ...prev.user.profile,
          bio,
        },
      },
    }));
  };

  // 添加 tag：注意展开数组
  const addTag = (tag: string) => {
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        profile: {
          ...prev.user.profile,
          tags: [...prev.user.profile.tags, tag],
        },
      },
    }));
  };

  return (
    <>
      <p>name: {state.user.name}, bio: {state.user.profile.bio}</p>
      <p>tags: {state.user.profile.tags.join(", ")}</p>
      <button onClick={() => updateBio("更新")}>改 bio</button>
      <button onClick={() => addTag("Node")}>加 tag</button>
    </>
  );
}
\`\`\`

> 💡 **当嵌套很深**：用 **Immer**（\`produce(state, draft => { draft.x.y = ... })\`）让代码更简洁。

---

## 七、useState 的并发安全（Concurrent Mode）

React 18+ 在并发模式下，**渲染可能被中断并重做**。函数式更新天然支持：

\`\`\`tsx
function ConcurrentSafe() {
  const [count, setCount] = useState(0);

  // 函数式更新：每次都基于"真实最新状态"
  // 即使渲染被中断重做，也不会出错
  const handleClick = () => {
    setCount((prev) => prev + 1);
  };

  // 直接传值：在并发模式下可能丢失更新
  // 因为 React 可能丢弃过时的渲染
  const unsafeClick = () => {
    setCount(count + 1);  // 危险！
  };

  return <button onClick={handleClick}>{count}</button>;
}
\`\`\`

---

## 八、完整 Demo：计数器（覆盖所有更新机制）

\`\`\`tsx
// 完整 Demo：useState 更新机制综合
import React, { useState, useRef } from "react";

function UpdateMechanisms() {
  const [count, setCount] = useState(0);
  const [list, setList] = useState<number[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const renderCount = useRef(0);
  renderCount.current += 1;

  const addLog = (msg: string) => {
    setLogs((prev) => [\`[\${new Date().toLocaleTimeString()}] \${msg}\`, ...prev].slice(0, 8));
  };

  // 演示 1：直接传值 vs 函数式
  const demoDirect = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    addLog(\`直接传值三次+1：count 现在是 \${count}（渲染后）\`);
  };

  const demoFunctional = () => {
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
    addLog(\`函数式三次+1：count 现在是 \${count}（渲染后）\`);
  };

  // 演示 2：批处理
  const demoBatch = () => {
    setCount((c) => c + 1);
    setList((l) => [...l, count + 1]);
    setLogs((l) => [...l, "日志更新"]);
    addLog("三次 setState，React 18 会批处理为一次重渲染");
  };

  // 演示 3：闭包陷阱
  const demoClosure = () => {
    setTimeout(() => {
      // 这里捕获的 count 是点击时的值
      addLog(\`setTimeout 回调：count = \${count}（闭包捕获的旧值）\`);
    }, 1000);
  };

  // 演示 4：异步 setState（函数式）
  const demoAsyncCorrect = () => {
    setTimeout(() => {
      setCount((prev) => {
        addLog(\`异步函数式更新：基于 prev=\${prev} 计算\`);
        return prev + 10;
      });
    }, 500);
  };

  // 演示 5：引用相等
  const demoRefEquality = () => {
    // 创建新对象才能触发更新
    setList((prev) => [...prev, prev.length + 1]);
    addLog("添加元素，引用变化，触发重渲染");
  };

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h2>useState 更新机制 Demo</h2>
      <p>渲染次数: {renderCount.current}</p>
      <p>count: {count}</p>
      <p>list: [{list.join(", ")}]</p>

      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        <button onClick={demoDirect}>❌ 直接传值三次+1</button>
        <button onClick={demoFunctional}>✅ 函数式三次+1</button>
        <button onClick={demoBatch}>🔄 批处理演示</button>
        <button onClick={demoClosure}>⚠️ 闭包陷阱演示</button>
        <button onClick={demoAsyncCorrect}>✅ 异步函数式</button>
        <button onClick={demoRefEquality}>📌 引用相等</button>
        <button onClick={() => { setCount(0); setList([]); setLogs([]); }}>重置</button>
      </div>

      <h3>操作日志</h3>
      {logs.length === 0 ? (
        <p style={{ color: "#999" }}>暂无</p>
      ) : (
        <ul style={{ fontSize: 12, fontFamily: "monospace" }}>
          {logs.map((l, i) => <li key={i}>{l}</li>)}
        </ul>
      )}
    </div>
  );
}

export default UpdateMechanisms;
\`\`\`

---

## 小结

本章核心知识点：

1. **异步更新**：setState 调度更新，当前渲染的 state 是旧值
2. **批处理**：React 18+ 在所有场景都自动批处理，多次 setState 合并为一次重渲染
3. **闭包陷阱**：setTimeout / 异步回调中捕获的可能是旧 state
4. **函数式更新**：\`setCount(prev => prev + 1)\` 总是基于最新值，**推荐默认使用**
5. **引用相等**：返回相同引用会跳过更新；必须创建新对象/数组
6. **不可变更新**：用展开 \`{...obj}\`、\`[...arr]\` 创建新值
7. **并发安全**：函数式更新天然支持并发模式

下一章讲解**复杂状态管理**——useReducer、Immer、状态规范化等高级技巧。`,
  },
  // ===========================================================
  // 第 28 章：复杂状态管理
  // ===========================================================
  {
    id: "tsx2-ch28",
    group: "第六部分 useState 深入",
    icon: "🗂️",
    title: "第二十八章 复杂状态管理",
    content: `# 复杂状态管理

当 state 嵌套很深、字段多、互相依赖时，useState 容易写出冗长且易错的更新代码。本章介绍四种更优雅的方案：嵌套更新、Immer、状态规范化、useReducer。

---

## 一、嵌套对象的痛苦

\`\`\`tsx
// 当嵌套很深时，useState 写法非常痛苦
type State = {
  user: {
    profile: {
      settings: {
        theme: { mode: "light" | "dark"; color: string };
        notifications: { email: boolean; sms: boolean };
      };
    };
  };
};

const [state, setState] = useState<State>({ /* ... */ });

// 修改 theme.mode：展开 5 层！
const updateMode = (mode: "light" | "dark") => {
  setState((prev) => ({
    ...prev,
    user: {
      ...prev.user,
      profile: {
        ...prev.user.profile,
        settings: {
          ...prev.user.profile.settings,
          theme: {
            ...prev.user.profile.settings.theme,
            mode,
          },
        },
      },
    },
  }));
};
\`\`\`

> 💡 嵌套 3 层以上就该考虑其他方案。下面逐一介绍。

---

## 二、方案 1：拆分 useState

把独立的状态拆成多个 useState——最简单但有限制：

\`\`\`tsx
function SplitState() {
  // 优点：每个 state 独立，update 简单
  const [name, setName] = useState("张三");
  const [age, setAge] = useState(25);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // 缺点：无法一次性重置、跨字段联动麻烦
  return (
    <>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={age} onChange={(e) => setAge(Number(e.target.value))} />
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        切换主题
      </button>
    </>
  );
}
\`\`\`

**适用**：字段之间没有强关联，UI 各部分独立。

---

## 三、方案 2：Immer（强烈推荐）

Immer 让"看似 mutation"的代码实际产生不可变更新：

\`\`\`tsx
// npm i immer
import { produce } from "immer";

function ImmerDemo() {
  const [state, setState] = useState({
    user: {
      profile: {
        theme: { mode: "light" as "light" | "dark", color: "blue" },
      },
    },
  });

  // 直接 mutation 写法——实际产出的还是新对象
  const updateMode = (mode: "light" | "dark") => {
    setState(
      produce((draft) => {
        // draft 是 Proxy，可以像普通对象一样修改
        draft.user.profile.theme.mode = mode;
      })
    );
  };

  const updateColor = (color: string) => {
    setState(
      produce((draft) => {
        draft.user.profile.theme.color = color;
      })
    );
  };

  return (
    <>
      <p>主题: {state.user.profile.theme.mode} / {state.user.profile.theme.color}</p>
      <button onClick={() => updateMode(state.user.profile.theme.mode === "light" ? "dark" : "light")}>
        切换主题
      </button>
      <button onClick={() => updateColor("red")}>改红色</button>
    </>
  );
}
\`\`\`

> 💡 **Immer 的魔法**：\`draft\` 是 Proxy，对它的 mutation 会被记录，最后生成不可变的更新。代码看起来像命令式，实际是函数式。

### Immer 数组操作

\`\`\`tsx
function ImmerArray() {
  const [todos, setTodos] = useState([
    { id: 1, text: "学习 React", done: false },
    { id: 2, text: "学习 TypeScript", done: false },
  ]);

  // 切换 done
  const toggle = (id: number) => {
    setTodos(
      produce((draft) => {
        const todo = draft.find((t) => t.id === id);
        if (todo) todo.done = !todo.done;
      })
    );
  };

  // 添加
  const add = (text: string) => {
    setTodos(
      produce((draft) => {
        draft.push({ id: Date.now(), text, done: false });
      })
    );
  };

  // 删除
  const remove = (id: number) => {
    setTodos(
      produce((draft) => {
        const idx = draft.findIndex((t) => t.id === id);
        if (idx >= 0) draft.splice(idx, 1);
      })
    );
  };

  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>
          <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
          {t.text}
          <button onClick={() => remove(t.id)}>删</button>
        </li>
      ))}
    </ul>
  );
}
\`\`\`

---

## 四、方案 3：状态规范化（Normalization）

**思想**：把嵌套结构扁平化成"表 + id 引用"，类似关系数据库：

\`\`\`tsx
// ❌ 嵌套结构：更新某个 user 复杂
type NestedState = {
  posts: Array<{
    id: number;
    title: string;
    author: { id: number; name: string };
    comments: Array<{ id: number; text: string; user: { id: number; name: string } }>;
  }>;
};

// ✅ 规范化：拆成多张"表"
type NormalizedState = {
  users: Record<number, { id: number; name: string }>;
  posts: Record<number, { id: number; title: string; authorId: number }>;
  comments: Record<number, { id: number; text: string; userId: number; postId: number }>;
  postIds: number[];  // 保持顺序
};

const initial: NormalizedState = {
  users: { 1: { id: 1, name: "张三" }, 2: { id: 2, name: "李四" } },
  posts: {
    10: { id: 10, title: "文章 1", authorId: 1 },
    20: { id: 20, title: "文章 2", authorId: 2 },
  },
  comments: {
    100: { id: 100, text: "评论 1", userId: 2, postId: 10 },
  },
  postIds: [10, 20],
};

// 改一个用户名字——只改一个字段
const renameUser = (id: number, name: string) => {
  setState((prev) => ({
    ...prev,
    users: {
      ...prev.users,
      [id]: { ...prev.users[id], name },
    },
  }));
};
\`\`\`

**优势**：
- 更新单一实体只改一处
- 不会因对象引用问题导致不必要的重渲染
- 适合复杂数据流（Redux 直接采用这种模式）

---

## 五、方案 4：useReducer（强烈推荐）

\`useReducer\` 把 state 更新逻辑抽离到 reducer 函数，可读性、可测试性大幅提升：

\`\`\`tsx
import { useReducer } from "react";

// 1. 定义 state 类型
type State = {
  count: number;
  history: number[];
};

// 2. 定义 action 类型（discriminated union）
type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset" }
  | { type: "set"; payload: number };

// 3. reducer 函数：(state, action) => newState
// 纯函数：不修改 state，不调用外部 API，返回新 state
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return {
        count: state.count + 1,
        history: [...state.history, state.count + 1],
      };
    case "decrement":
      return {
        count: state.count - 1,
        history: [...state.history, state.count - 1],
      };
    case "reset":
      return { count: 0, history: [] };
    case "set":
      return { count: action.payload, history: [...state.history, action.payload] };
    default:
      return state;
  }
}

function ReducerDemo() {
  // 4. 使用 reducer
  const [state, dispatch] = useReducer(reducer, { count: 0, history: [] });

  return (
    <>
      <p>count: {state.count}</p>
      <p>history: [{state.history.join(", ")}]</p>
      <button onClick={() => dispatch({ type: "increment" })}>+1</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-1</button>
      <button onClick={() => dispatch({ type: "reset" })}>重置</button>
      <button onClick={() => dispatch({ type: "set", payload: 100 })}>设为100</button>
    </>
  );
}
\`\`\`

### useReducer vs useState 对比

| 维度 | useState | useReducer |
| --- | --- | --- |
| 适用规模 | 简单（1-3 字段） | 复杂（多个相关字段） |
| 更新方式 | \`setState(newVal)\` | \`dispatch({ type, payload })\` |
| 业务逻辑 | 散在事件处理 | 集中在 reducer |
| 测试性 | 需要 mock 整个组件 | reducer 是纯函数，单独可测 |
| TypeScript | 简单 | 需要 action 类型联合 |

### 何时切换到 useReducer？

- state 字段 ≥ 3 个
- 多个 state 互相影响，需要一起更新
- 同样的 state 更新会发生在多个地方
- 想集中管理更新逻辑（便于测试、调试）

---

## 六、Todo 应用：useReducer 实战

\`\`\`tsx
// 完整 Demo：useReducer 实现 Todo
import React, { useReducer, useState } from "react";

type Todo = { id: number; text: string; done: boolean };
type State = { todos: Todo[]; filter: "all" | "active" | "done" };
type Action =
  | { type: "add"; payload: string }
  | { type: "toggle"; payload: number }
  | { type: "remove"; payload: number }
  | { type: "setFilter"; payload: State["filter"] }
  | { type: "clearDone" };

const initial: State = { todos: [], filter: "all" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add":
      return {
        ...state,
        todos: [...state.todos, { id: Date.now(), text: action.payload, done: false }],
      };
    case "toggle":
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.payload ? { ...t, done: !t.done } : t
        ),
      };
    case "remove":
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.payload),
      };
    case "setFilter":
      return { ...state, filter: action.payload };
    case "clearDone":
      return {
        ...state,
        todos: state.todos.filter((t) => !t.done),
      };
    default:
      return state;
  }
}

function TodoApp() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [input, setInput] = useState("");

  // 派生状态——不存到 state 中
  const filtered = state.todos.filter((t) => {
    if (state.filter === "active") return !t.done;
    if (state.filter === "done") return t.done;
    return true;
  });

  const add = () => {
    if (!input.trim()) return;
    dispatch({ type: "add", payload: input.trim() });
    setInput("");
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Todo App (useReducer)</h2>

      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="输入待办"
        />
        <button onClick={add}>添加</button>
      </div>

      <div style={{ margin: "12px 0" }}>
        {(["all", "active", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => dispatch({ type: "setFilter", payload: f })}
            style={{
              fontWeight: state.filter === f ? "bold" : "normal",
              marginRight: 8,
            }}
          >
            {f === "all" ? "全部" : f === "active" ? "未完成" : "已完成"}
          </button>
        ))}
        <button onClick={() => dispatch({ type: "clearDone" })}>清除已完成</button>
      </div>

      <ul>
        {filtered.map((t) => (
          <li key={t.id}>
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => dispatch({ type: "toggle", payload: t.id })}
            />
            <span style={{ textDecoration: t.done ? "line-through" : "none" }}>
              {t.text}
            </span>
            <button onClick={() => dispatch({ type: "remove", payload: t.id })}>
              删
            </button>
          </li>
        ))}
      </ul>

      <p>
        总数: {state.todos.length} |
        完成: {state.todos.filter((t) => t.done).length} |
        显示: {filtered.length}
      </p>
    </div>
  );
}

export default TodoApp;
\`\`\`

---

## 七、四种方案对比

| 方案 | 适用 | 优点 | 缺点 |
| --- | --- | --- | --- |
| 拆分 useState | 字段独立、简单 | 最直接 | 无法联动、无法整体重置 |
| Immer | 中等嵌套、数组操作 | 代码简洁 | 引入依赖 |
| 状态规范化 | 复杂关系数据 | 更新高效 | 写起来繁琐 |
| useReducer | 多字段、复杂更新逻辑 | 集中管理、可测试 | 学习成本 |

---

## 小结

本章核心知识点：

1. **嵌套痛苦**：3 层以上嵌套就该考虑其他方案
2. **Immer**：\`produce\` + draft 让 mutation 写法产出不可变更新
3. **状态规范化**：把嵌套数据扁平化成表 + id 引用
4. **useReducer**：用 reducer 集中管理更新逻辑，便于测试
5. **discriminated union**：action 用 \`type\` 字段做联合类型
6. **派生状态**：filter 后的列表应该计算得出，不存为 state

下一章讲解**状态提升**——多个组件共享状态的经典模式。`,
  },
  // ===========================================================
  // 第 29 章：状态提升（Lifting State Up）
  // ===========================================================
  {
    id: "tsx2-ch29",
    group: "第六部分 useState 深入",
    icon: "⬆️",
    title: "第二十九章 状态提升 (Lifting State Up)",
    content: `# 状态提升 (Lifting State Up)

React 数据流是**单向**的——父 → 子。当多个组件需要共享 state 时，必须把 state **提升到最近的共同祖先**。本章深入讲解这个核心模式。

---

## 一、为什么需要状态提升？

**问题场景**：温度单位换算器，输入摄氏度会同步显示华氏度，但两者在不同组件中。

\`\`\`tsx
// ❌ 错误：兄弟组件各自管理 state，无法同步
function CelsiusInput() {
  const [c, setC] = useState("");
  return <input value={c} onChange={(e) => setC(e.target.value)} />;
}

function FahrenheitInput() {
  const [f, setF] = useState("");
  return <input value={f} onChange={(e) => setF(e.target.value)} />;
}

// 两个组件的 c 和 f 完全独立——输摄氏度华氏度不会更新
\`\`\`

**解决方案**：把 \`c\` 和 \`f\` 提升到父组件：

\`\`\`tsx
// ✅ 父组件管理 state，子组件变成受控
function TemperatureConverter() {
  const [celsius, setCelsius] = useState("");

  // 派生：摄氏度 → 华氏度
  const fahrenheit = celsius === "" ? "" : String(Number(celsius) * 1.8 + 32);

  return (
    <>
      <CelsiusInput value={celsius} onChange={setCelsius} />
      <FahrenheitInput value={fahrenheit} onChange={(f) => {
        // 反向：华氏度 → 摄氏度
        setCelsius(f === "" ? "" : String((Number(f) - 32) / 1.8));
      }} />
    </>
  );
}

// 子组件：纯受控
function CelsiusInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />;
}

function FahrenheitInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />;
}
\`\`\`

> 💡 **核心思想**：子组件**纯展示**（受控），所有数据由父组件管理。子组件通过 props 接收数据 + 回调函数。

---

## 二、状态提升的标准模式

### 模式 1：单一数据源

\`\`\`tsx
// 父组件：拥有 state
function Parent() {
  const [value, setValue] = useState("");

  return (
    <>
      {/* 通过 props 把 value 和 setter 传给子组件 */}
      <ChildA value={value} onChange={setValue} />
      <ChildB value={value} />
    </>
  );
}
\`\`\`

### 模式 2：派生 props

子组件根据父组件 state 计算展示值：

\`\`\`tsx
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Counter value={count} onIncrement={() => setCount(count + 1)} />
      <Display value={count} />
      {/* 也可以派生出其他值 */}
      <Status count={count} />
    </>
  );
}

function Status({ count }: { count: number }) {
  if (count === 0) return <p>请开始计数</p>;
  if (count > 10) return <p style={{ color: "red" }}>太多了！</p>;
  return <p>当前: {count}</p>;
}
\`\`\`

---

## 三、实战：购物车多组件联动

\`\`\`tsx
// 完整 Demo：状态提升——多个组件共享购物车
import React, { useState } from "react";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type Product = { id: number; name: string; price: number };

// 商品列表组件
function ProductList({
  products,
  onAdd,
}: {
  products: Product[];
  onAdd: (id: number) => void;
}) {
  return (
    <div>
      <h3>商品</h3>
      {products.map((p) => (
        <div key={p.id} style={{ marginBottom: 8 }}>
          {p.name} - ¥{p.price}
          <button onClick={() => onAdd(p.id)} style={{ marginLeft: 8 }}>加入购物车</button>
        </div>
      ))}
    </div>
  );
}

// 购物车组件
function Cart({
  items,
  onUpdateQty,
  onRemove,
}: {
  items: CartItem[];
  onUpdateQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
}) {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return (
    <div>
      <h3>购物车</h3>
      {items.length === 0 ? (
        <p>空</p>
      ) : (
        <>
          {items.map((i) => (
            <div key={i.id}>
              {i.name} - ¥{i.price} x
              <input
                type="number"
                value={i.quantity}
                min={1}
                onChange={(e) => onUpdateQty(i.id, Number(e.target.value))}
                style={{ width: 50, margin: "0 8px" }}
              />
              <button onClick={() => onRemove(i.id)}>删</button>
            </div>
          ))}
          <p><strong>总计: ¥{total.toFixed(2)}</strong></p>
        </>
      )}
    </div>
  );
}

// 父组件：拥有 cart state
function ShoppingApp() {
  const products: Product[] = [
    { id: 1, name: "苹果", price: 5 },
    { id: 2, name: "香蕉", price: 3 },
    { id: 3, name: "橘子", price: 4 },
  ];

  // 关键：cart state 提升到 ShoppingApp
  const [cart, setCart] = useState<CartItem[]>([]);

  // 添加到购物车
  const addToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setCart((prev) => {
      // 已有则数量 +1，没有则添加
      const exist = prev.find((i) => i.id === productId);
      if (exist) {
        return prev.map((i) =>
          i.id === productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // 更新数量
  const updateQty = (id: number, qty: number) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
    );
  };

  // 删除
  const remove = (id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <ProductList products={products} onAdd={addToCart} />
      <Cart items={cart} onUpdateQty={updateQty} onRemove={remove} />
    </div>
  );
}
\`\`\`

---

## 四、状态提升的原则

### 原则 1：找到最近的共同祖先

\`\`\`tsx
// A 和 B 都需要 X
//   A       B
//   |       |
//   Parent  (有 X 的 state)
//
// X 应该放在 Parent，A 和 B 都通过 props 接收

function Parent() {
  const [x, setX] = useState(0);
  return (
    <>
      <A value={x} onChange={setX} />
      <B value={x} />
    </>
  );
}
\`\`\`

### 原则 2：能不下放就不下放

\`\`\`tsx
// ❌ 过度提升：把简单组件的状态提升到顶层
function App() {
  const [inputValue, setInputValue] = useState("");  // 只在一个组件用
  return <ChildInput value={inputValue} onChange={setInputValue} />;
}

// ✅ 正确：本地 state 留在本组件
function ChildInput() {
  const [value, setValue] = useState("");
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}
\`\`\`

### 原则 3：避免逐层传递（Props Drilling）

\`\`\`tsx
// ❌ Props drilling：A → B → C → D 都要传 value
function A() {
  const [value, setValue] = useState("");
  return <B value={value} onChange={setValue} />;
}
function B({ value, onChange }: any) {
  return <C value={value} onChange={onChange} />;
}
function C({ value, onChange }: any) {
  return <D value={value} onChange={onChange} />;
}
function D({ value, onChange }: any) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />;
}

// ✅ 用 Context 解决（见 React 高级部分）
const ValueContext = createContext<{ value: string; setValue: (v: string) => void } | null>(null);
function App() {
  const [value, setValue] = useState("");
  return (
    <ValueContext.Provider value={{ value, setValue }}>
      <D />
    </ValueContext.Provider>
  );
}
function D() {
  const { value, setValue } = useContext(ValueContext);
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}
\`\`\`

> 💡 **判断标准**：超过 2 层传递就应该考虑 Context 或状态管理库（Redux / Zustand）。

---

## 五、可控 vs 非受控：受控组件的本质就是状态提升

\`\`\`tsx
// 父组件的 state 控制子组件——本质是状态提升
function Form() {
  const [name, setName] = useState("");

  return (
    // 子组件变成纯受控组件
    <input value={name} onChange={(e) => setName(e.target.value)} />
    //   ↑     ↑
    //   父state  父setter
  );
}
\`\`\`

> 💡 **洞察**：受控组件 = 状态在父组件 + 子组件通过 props 接收。理解了状态提升，受控组件就完全自然了。

---

## 六、完整 Demo：多过滤器列表（综合实战）

\`\`\`tsx
// 完整 Demo：状态提升——多过滤器联动
import React, { useState } from "react";

type Item = { id: number; name: string; category: string; price: number };

function FilterableList() {
  // 父组件管理：原始数据、过滤条件
  const allItems: Item[] = [
    { id: 1, name: "苹果", category: "水果", price: 5 },
    { id: 2, name: "香蕉", category: "水果", price: 3 },
    { id: 3, name: "白菜", category: "蔬菜", price: 2 },
    { id: 4, name: "猪肉", category: "肉类", price: 30 },
  ];

  // 状态全部在父组件
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState(100);

  // 派生：过滤后的列表
  const filtered = allItems.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (item.price > maxPrice) return false;
    if (keyword && !item.name.includes(keyword)) return false;
    return true;
  });

  const categories = Array.from(new Set(allItems.map((i) => i.category)));

  return (
    <div style={{ padding: 16 }}>
      <h2>商品过滤</h2>

      {/* 过滤器组件：纯受控 */}
      <FilterPanel
        keyword={keyword}
        onKeywordChange={setKeyword}
        category={category}
        onCategoryChange={setCategory}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
        categories={categories}
      />

      {/* 列表组件：纯受控 */}
      <ItemList items={filtered} />

      <p>共 {filtered.length} / {allItems.length} 项</p>
    </div>
  );
}

// 过滤器面板
function FilterPanel(props: {
  keyword: string;
  onKeywordChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  maxPrice: number;
  onMaxPriceChange: (v: number) => void;
  categories: string[];
}) {
  return (
    <div style={{ marginBottom: 12, padding: 8, background: "#f5f5f5" }}>
      <input
        placeholder="搜索名称"
        value={props.keyword}
        onChange={(e) => props.onKeywordChange(e.target.value)}
      />
      <select
        value={props.category}
        onChange={(e) => props.onCategoryChange(e.target.value)}
        style={{ marginLeft: 8 }}
      >
        <option value="all">全部分类</option>
        {props.categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <label style={{ marginLeft: 8 }}>
        最高价: {props.maxPrice}
        <input
          type="range"
          min={0}
          max={100}
          value={props.maxPrice}
          onChange={(e) => props.onMaxPriceChange(Number(e.target.value))}
        />
      </label>
    </div>
  );
}

// 列表组件
function ItemList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <p style={{ color: "#999" }}>无匹配项</p>;
  }
  return (
    <ul>
      {items.map((i) => (
        <li key={i.id}>
          {i.name} - {i.category} - ¥{i.price}
        </li>
      ))}
    </ul>
  );
}

export default FilterableList;
\`\`\`

**要点**：
- 所有 state 在父组件 \`FilterableList\`
- 子组件 \`FilterPanel\`、\`ItemList\` 都是纯受控
- 过滤逻辑在父组件通过派生计算
- 子组件只负责 UI 渲染

---

## 小结

本章核心知识点：

1. **核心思想**：兄弟组件共享 state → 提升到最近共同祖先
2. **单一数据源**：每个 state 由一个组件"拥有"，其他组件通过 props 接收
3. **受控组件本质**：状态在父 + props 传入 = 受控
4. **避免过度提升**：本地 state 留在本组件
5. **避免 drilling**：超过 2 层传递用 Context
6. **找到平衡点**：哪些 state 该提升、哪些该本地——靠经验判断

下一章讲解**useState 常见陷阱**——总结实战中容易犯的错误。`,
  },
  // ===========================================================
  // 第 30 章：useState 常见陷阱
  // ===========================================================
  {
    id: "tsx2-ch30",
    group: "第六部分 useState 深入",
    icon: "⚠️",
    title: "第三十章 useState 常见陷阱",
    content: `# useState 常见陷阱

本章汇总 useState 在实际开发中最常见的 10 个陷阱，附解决方案和原理分析。

---

## 一、陷阱 1：直接 mutation

\`\`\`tsx
// ❌ 错：直接修改原对象/数组
const [user, setUser] = useState({ name: "张三", age: 25 });
const [list, setList] = useState([1, 2, 3]);

const wrong1 = () => {
  user.age += 1;  // mutation
  setUser(user);  // 引用没变，不更新！
};

const wrong2 = () => {
  list.push(4);  // mutation
  setList(list);  // 引用没变，不更新！
};

// ✅ 对：创建新对象/数组
const correct1 = () => {
  setUser((prev) => ({ ...prev, age: prev.age + 1 }));
};

const correct2 = () => {
  setList((prev) => [...prev, 4]);
};
\`\`\`

> ⚠️ **原理**：React 用 \`Object.is\` 比较新旧值。相同引用 = 没变 = 跳过更新。

---

## 二、陷阱 2：闭包陷阱（stale state）

\`\`\`tsx
// ❌ 错：异步回调中读到旧 state
const [count, setCount] = useState(0);

const handleClick = () => {
  setTimeout(() => {
    setCount(count + 1);  // count 永远是点击时的值
  }, 1000);
};

// ✅ 对：函数式更新
const handleClickCorrect = () => {
  setTimeout(() => {
    setCount((prev) => prev + 1);  // 永远基于最新
  }, 1000);
};
\`\`\`

> 💡 **规则**：异步/事件订阅/定时器中更新 state，必须用函数式。

---

## 三、陷阱 3：useEffect 中依赖 state 却不更新

\`\`\`tsx
// ❌ 错：useEffect 依赖了一个不存在的 state
function Wrong() {
  const [count, setCount] = useState(0);
  // 这里读不到最新的 count
  useEffect(() => {
    const id = setInterval(() => {
      console.log(count);  // 永远是 0
    }, 1000);
    return () => clearInterval(id);
  }, []);  // 依赖空数组
}

// ✅ 对：函数式更新 + 正确的依赖
function Correct() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setCount((prev) => prev + 1);  // 每次 +1
    }, 1000);
    return () => clearInterval(id);
  }, []);  // 依赖空，因为用函数式更新
}
\`\`\`

> 💡 **规则**：用 \`setX(prev => ...)\` 替代直接读 state 是规避闭包陷阱的核武器。

---

## 四、陷阱 4：派生 state 存进 state

\`\`\`tsx
// ❌ 错：派生值（可以从其他 state 算出）存进 state
function Wrong({ items }: { items: number[] }) {
  const [count, setCount] = useState(items.length);  // 派生值！
  const [filtered, setFiltered] = useState(items.filter((i) => i > 0));  // 派生值！

  return <p>{count} - {filtered.length}</p>;
}

// ✅ 对：派生值在渲染时计算
function Correct({ items }: { items: number[] }) {
  const count = items.length;  // 直接算
  const filtered = items.filter((i) => i > 0);  // 直接算

  return <p>{count} - {filtered.length}</p>;
}
\`\`\`

> ⚠️ **为什么是错的？**
> 1. 当 props（items）变化时，存进 state 的派生值不会自动更新（除非手动 sync）
> 2. 双重数据源会导致不一致

---

## 五、陷阱 5：把昂贵的初始值当每次渲染都执行

\`\`\`tsx
// ❌ 错：每次渲染都执行 JSON.parse
const [data, setData] = useState(JSON.parse(localStorage.getItem("data") || "{}"));

// ✅ 对：函数形式只在挂载时执行
const [data, setData] = useState(() => {
  const raw = localStorage.getItem("data");
  return raw ? JSON.parse(raw) : {};
});
\`\`\`

> 💡 初始值用 \`() => expensive()\` 而不是直接传值。

---

## 六、陷阱 6：忘记 key 导致列表错乱

\`\`\`tsx
// ❌ 错：用 index 作为 key
const [items, setItems] = useState(["A", "B", "C"]);

return (
  <ul>
    {items.map((item, i) => (
      <li key={i}>{item}</li>  // 删除第一个后，index 对应的内容会错乱
    ))}
  </ul>
);

// ✅ 对：用稳定的 id
return (
  <ul>
    {items.map((item) => (
      <li key={item}>{item}</li>  // 用内容本身作为 key
    ))}
  </ul>
);
\`\`\`

> ⚠️ 用 \`index\` 当 key 在列表项会**增删/重排**时导致 React 复用错误的 DOM 节点。

---

## 七、陷阱 7：setState 后立即读取（异步更新）

\`\`\`tsx
// ❌ 错：setState 后立即读
const handle = () => {
  setCount(5);
  console.log(count);  // 仍是旧值！
  // 同步代码中 count 不会立即更新
};

// ✅ 对：函数式更新 / useEffect
const handle1 = () => {
  setCount(5);
  // 想要"5"用函数式
  setCount((prev) => {
    console.log(prev);  // 仍是旧值
    return 5;
  });
};

const handle2 = () => {
  setCount(5);
  // 想在新值生效后做某事，用 useEffect
};

useEffect(() => {
  console.log("count 变化了:", count);
}, [count]);
\`\`\`

---

## 八、陷阱 8：状态过多导致组件臃肿

\`\`\`tsx
// ❌ 错：一个组件有 10 个 useState
function Huge() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [c, setC] = useState("");
  // ... 10 个
}

// ✅ 方案 1：合并为对象
function Better1() {
  const [state, setState] = useState({ a: 0, b: 0, c: "" });
  const update = (patch: Partial<typeof state>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };
}

// ✅ 方案 2：useReducer
function Better2() {
  const [state, dispatch] = useReducer(reducer, initial);
}

// ✅ 方案 3：拆分组件
function Better3() {
  return (
    <>
      <SubA />
      <SubB />
      <SubC />
    </>
  );
}
\`\`\`

---

## 九、陷阱 9：在条件/循环中调用 useState

\`\`\`tsx
// ❌ 错：违反 Hooks 规则
function Wrong({ showInput }: { showInput: boolean }) {
  if (showInput) {
    const [value, setValue] = useState("");  // 条件 Hooks！
  }
  // 后续 hook 数量不稳定，会报 "Rendered fewer hooks than expected"
}

// ✅ 对：把所有 useState 提到顶部
function Correct({ showInput }: { showInput: boolean }) {
  const [value, setValue] = useState("");
  return showInput ? <input value={value} onChange={(e) => setValue(e.target.value)} /> : null;
}
\`\`\`

> ⚠️ **Hooks 规则**：只能在函数组件顶层、不能在条件/循环/嵌套函数中调用。

---

## 十、陷阱 10：异步 setState 的"竞态"

\`\`\`tsx
// ❌ 错：异步 setState 之间相互覆盖
const [search, setSearch] = useState("");

const handleSearch = async (keyword: string) => {
  const res1 = await fetch(\`/api/search?q=\${keyword}\`).then((r) => r.json());
  setSearch(res1.result);  // 假设用户快速输入了 3 次
  // 第二次请求返回更快，res1.result 会被 res2.result 覆盖
  // 最后 setSearch(res3.result)——但用户可能已经在看 res2
};

// ✅ 对：用 ignore 标记或 AbortController
const handleSearchSafe = async (keyword: string) => {
  let ignore = false;
  const res = await fetch(\`/api/search?q=\${keyword}\`).then((r) => r.json());
  if (!ignore) setSearch(res.result);
  return () => { ignore = true; };  // 下次请求前调用
};
\`\`\`

> 💡 **现代方案**：用 AbortController 中断旧请求（见 useEffect 章节）。

---

## 十一、完整 Demo：10 个陷阱一网打尽

\`\`\`tsx
// 完整 Demo：useState 陷阱综合
import React, { useState, useEffect, useRef } from "react";

function PitfallsDemo() {
  // ---------- 陷阱 1: mutation ----------
  const [user, setUser] = useState({ name: "张三", age: 25 });

  const wrongMutation = () => {
    user.age += 1;
    setUser(user);  // 不更新
  };
  const correctMutation = () => {
    setUser((prev) => ({ ...prev, age: prev.age + 1 }));
  };

  // ---------- 陷阱 2: 闭包 ----------
  const [count, setCount] = useState(0);
  const wrongClosure = () => {
    setTimeout(() => {
      setCount(count + 1);  // 用错旧值
    }, 500);
  };
  const correctClosure = () => {
    setTimeout(() => {
      setCount((c) => c + 1);  // 函数式
    }, 500);
  };

  // ---------- 陷阱 4: 派生 state ----------
  const [numbers] = useState([1, 2, 3, 4, 5]);
  // ❌ 派生
  // const [evenCount, setEvenCount] = useState(numbers.filter(n => n % 2 === 0).length);
  // ✅ 直接算
  const evenCount = numbers.filter((n) => n % 2 === 0).length;

  // ---------- 陷阱 5: 惰性初始化 ----------
  const [config, setConfig] = useState(() => {
    console.log("只在挂载时执行");
    return { theme: "light" };
  });

  // ---------- 陷阱 7: 立即读 ----------
  const [name, setName] = useState("");
  const handleName = () => {
    setName("李四");
    // 同步读：仍是旧值
    console.log("同步:", name);
  };
  // 异步读：effect 会在新值生效后触发
  useEffect(() => {
    if (name) console.log("effect:", name);
  }, [name]);

  // ---------- 渲染计数 ----------
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <div style={{ padding: 16 }}>
      <h2>useState 陷阱 Demo（渲染 {renderCount.current} 次）</h2>

      <h3>1. mutation 陷阱</h3>
      <p>user.age: {user.age}</p>
      <button onClick={wrongMutation}>❌ 错误（mutation）</button>
      <button onClick={correctMutation}>✅ 正确（不可变）</button>

      <h3>2. 闭包陷阱</h3>
      <p>count: {count}</p>
      <button onClick={wrongClosure}>❌ 闭包陷阱</button>
      <button onClick={correctClosure}>✅ 函数式</button>

      <h3>4. 派生 state</h3>
      <p>numbers: [{numbers.join(", ")}], 偶数: {evenCount}</p>
      <p>（直接计算，没存进 state）</p>

      <h3>5. 惰性初始化</h3>
      <p>config.theme: {config.theme}</p>

      <h3>7. 立即读 state</h3>
      <p>name: {name || "(空)"}</p>
      <button onClick={handleName}>设置 name = 李四</button>
      <p style={{ fontSize: 12, color: "#666" }}>看控制台：同步读到旧值，effect 读到新值</p>
    </div>
  );
}

export default PitfallsDemo;
\`\`\`

---

## 十二、陷阱速查表

| 陷阱 | 解决方案 |
| --- | --- |
| 直接 mutation | 用展开运算符创建新对象/数组 |
| 闭包陷阱 | \`setX(prev => ...)\` |
| 派生 state 存入 state | 渲染时直接计算 |
| 每次都执行昂贵初始值 | \`useState(() => expensive())\` |
| 用 index 当 key | 用稳定的 id |
| 忘记异步更新 | 用 useEffect / 函数式更新 |
| 状态过多 | useReducer / 拆分组件 |
| 条件/循环中调 Hooks | Hooks 必须在顶层 |
| 异步 setState 竞态 | AbortController / ignore flag |
| setState 后立即读 | 用 useEffect 监听 |

---

## 小结

本章总结了 10 个最常见的 useState 陷阱，核心要点：

1. **不可变更新**永远是第一原则
2. **函数式更新** \`setX(prev => ...)\` 解决闭包与并发问题
3. **派生值**不存进 state，渲染时计算
4. **惰性初始化**避免重复昂贵计算
5. **稳定 key**保证列表正确
6. **Hook 规则**必须遵守（顶层调用、只在 React 函数中）
7. **状态过多**用 useReducer / 拆分组件
8. **异步竞态**用 AbortController

至此"第六部分 useState 深入"全部完成。下一部分将进入**useEffect 深入**。`,
  },
];

export { chapters };
