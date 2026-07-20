// =============================================================
// TSX 童话镇 - 第 3 批：状态 hooks + 进阶 + 大冒险
// -------------------------------------------------------------
// 第 3 章：镇长的记事本（useState）
// 第 4 章：宝库管理员（useRef）
// 第 5 章：镇长府邸（useReducer）
// 第 6 章：公告板（useContext）
// 第 7 章：大冒险 - 建造城堡（综合实战）
// =============================================================

export const chapters = [
  // ===========================================================
  // 第 3 章：镇长的记事本
  // ===========================================================
  {
    id: "tsx-story-usestate",
    group: "居民篇：六位老朋友",
    icon: "📔",
    title: "镇长的记事本（useState）",
    content: `# 📔 第 3 章：镇长的记事本

> *童话镇的镇长有一本魔法记事本，无论何时翻开，写什么就有什么。这本记事本叫做 \`useState\`。*

---

## 🌟 故事开场

镇长需要记录小镇的各种"会变化的东西"——今天镇上有几棵树 🌳、告示板是开还是关、温度计多少度……这些数字随时会变，不能写死在石头上。

于是 TypeScript 老巫师给了镇长一本**魔法记事本**：

- 📖 翻开写一个值，记事本记下来
- ✏️ 想改值，必须用魔法笔 \`setXxx\`
- 🔔 每次改值，小镇会自动重新渲染

这本记事本就叫做 \`useState\`！

---

## 🪄 基础用法

\`\`\`tsx
import { useState } from "react";

function TownSquare() {
  // 📒 镇长翻开记事本，写下第一页
  const [trees, setTrees] = useState(0);   // 数字
  const [weather, setWeather] = useState<"sunny" | "rainy">("sunny");  // 字面量联合
  const [isOpen, setIsOpen] = useState(false);  // 布尔
  const [notice, setNotice] = useState<string | null>(null);  // 可能是 null

  return (
    <div>
      <p>镇上现在有 {trees} 棵树 🌳</p>
      <button onClick={() => setTrees(trees + 1)}>种一棵树</button>
      <p>今天天气：{weather}</p>
      <button onClick={() => setWeather(weather === "sunny" ? "rainy" : "sunny")}>
        切换天气
      </button>
    </div>
  );
}
\`\`\`

### 📐 签名解析

\`\`\`tsx
const [value, setValue] = useState<Type | undefined>(initialValue);
//       ↑      ↑              ↑                              ↑
//     当前值  修改函数     显式类型标注（可选）              初始值
\`\`\`

**小镇比喻**：
- \`value\` = 记事本当前页内容
- \`setValue\` = 魔法笔，用来写新值
- \`initialValue\` = 记事本第一页写什么

---

## 🧙 进阶 1：泛型标注类型

TypeScript 能从初始值推断类型，但有时候推断不出来（特别是 \`null\`），要显式标：

\`\`\`tsx
// ✅ 能推断
const [count, setCount] = useState(0);           // number
const [name, setName] = useState("Alice");        // string
const [list, setList] = useState<Item[]>([]);     // Item[]

// ❌ 推断不出来（null 没有类型信息）
const [user, setUser] = useState(null);  // user 类型是 null
//                              ↑ 这样写 setUser({...}) 会报错！

// ✅ 显式标注
const [user, setUser] = useState<User | null>(null);  // User | null
\`\`\`

---

## 🧙 进阶 2：函数式更新

如果新的值依赖旧的值，用 **prev** 函数更安全：

\`\`\`tsx
// ❌ 闭包陷阱：连续调用可能丢失
const [count, setCount] = useState(0);
const handleTriple = () => {
  setCount(count + 1);  // 旧值
  setCount(count + 1);  // 还是旧值
  setCount(count + 1);  // 还是旧值
  // 结果：count 只 +1
};

// ✅ 函数式更新：每次拿到最新值
const handleTriple = () => {
  setCount(prev => prev + 1);  // 最新值
  setCount(prev => prev + 1);  // 最新值 +1
  setCount(prev => prev + 1);  // 最新值 +1
  // 结果：count +3
};
\`\`\`

**小镇比喻**：\`count\` 就像"今天的人数"——\`count + 1\` 是"今天的人数加 1"，但如果今天的人数变了（中间有人加进来），\`count + 1\` 还是基于旧值。\`prev => prev + 1\` 是"今天的人数再加 1"，永远基于最新。

---

## 🧙 进阶 3：惰性初始化

如果初始值需要计算，用函数形式——只在第一次渲染时执行：

\`\`\`tsx
// ❌ 每次渲染都计算
const [data, setData] = useState(expensiveComputation());

// ✅ 只在第一次渲染时计算
const [data, setData] = useState(() => expensiveComputation());
\`\`\`

**小镇比喻**：\`useState(compute)\` 是"每次翻开记事本都要算一遍"；\`useState(() => compute)\` 是"只在第一次翻开时算一次，以后直接看记录"。

---

## 🧙 进阶 4：对象 / 数组更新

不能直接修改原对象，要**返回新对象**：

\`\`\`tsx
// ❌ 直接修改 React 检测不到
const [user, setUser] = useState({ name: "Alice", age: 20 });
user.age = 21;   // UI 不更新

// ✅ 返回新对象
setUser({ ...user, age: 21 });

// ✅ 数组
const [list, setList] = useState([1, 2, 3]);
setList([...list, 4]);          // 追加
setList(list.filter(i => i !== 2));  // 删除
setList(list.map(i => i === 2 ? 20 : i));  // 修改
\`\`\`

**小镇比喻**：React 是个"记忆大师"——它只记得对象的"地址"（引用）。你偷偷改了里面的内容，地址没变，它就以为没变。返回新对象是"建一栋新房子"，地址变了，它才知道。

---

## 📊 useState 速查表

| 场景 | 写法 | 注意 |
|------|------|------|
| 基本类型 | \`useState(0)\` | - |
| 数组 | \`useState<Item[]>([])\` | 增删改用新数组 |
| 对象 | \`useState<{a: number}>({a: 0})\` | 修改用新对象 |
| 可能为 null | \`useState<X \| null>(null)\` | 显式标注类型 |
| 初始值需要计算 | \`useState(() => compute())\` | 避免每次重算 |
| 依赖上次值 | \`setX(prev => prev + 1)\` | 避免闭包陷阱 |

---

## 🎬 小剧场：镇长的上午

> *早上 8 点，镇长翻开记事本，看到镇上 0 棵树。*
> *他按下"种一棵树"，记事本上变成 1。*
> *居民问"今天几度"，他翻到温度页，写 25。*
> *中午有人举报偷树，他记下"已处理"。*
> *下午种树节，他用 \`setTrees(prev => prev + 1)\` 连续点了 5 次，树变成了 5。*

---

## 📝 第 3 章小结

- 📒 \`useState\` = 魔法记事本，记小镇会变化的值
- 返回 \`[value, setValue]\` 元组
- 显式类型：\`useState<Type>(initial)\` 当推断不出来时
- 函数式更新：\`setValue(prev => ...)\` 避免闭包陷阱
- 惰性初始化：\`useState(() => compute())\` 避免每次重算
- 对象/数组必须返回新的，不能直接修改

> *下一章，去拜访宝库管理员——useRef！*`,

    code: `// 📔 TSX 童话镇 - 第 3 章 Demo：魔法记事本

// 模拟 React useState（一个全局 store + 订阅）
class MagicNotebook<T> {
  private listeners: Array<(v: T) => void> = [];
  constructor(private value: T) {}

  get value(): T { return this.value; }

  // 直接设置新值
  set = (newValue: T) => {
    this.value = newValue;
    this.listeners.forEach(fn => fn(this.value));
  };

  // 函数式更新
  update = (fn: (prev: T) => T) => {
    this.value = fn(this.value);
    this.listeners.forEach(l => l(this.value));
  };

  subscribe = (fn: (v: T) => void) => {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  };
}

// ============================================================
// 📒 1️⃣ 基础用法：种树计数
// ============================================================
const trees = new MagicNotebook(0);
console.log("=== 📒 1️⃣ 基础用法：种树 ===");
console.log(\`初始: \${trees.value} 棵树\`);
trees.set(1);
console.log(\`种了 1 棵: \${trees.value} 棵树\`);
trees.set(trees.value + 1);
console.log(\`又种了 1 棵: \${trees.value} 棵树\`);
console.log();

// ============================================================
// 🧙 2️⃣ 函数式更新：避免闭包陷阱
// ============================================================
const counter = new MagicNotebook(0);
console.log("=== 🧙 2️⃣ 函数式更新 ===");

// ❌ 直接 set 闭包陷阱
const trap = new MagicNotebook(0);
trap.set(trap.value + 1);  // 0+1=1
trap.set(trap.value + 1);  // 1+1=2
trap.set(trap.value + 1);  // 2+1=3
console.log(\`直接 set \${trap.value} 次: \${trap.value}（看似 3 次但都是基于最新值）\`);

// ✅ 函数式更新
const noTrap = new MagicNotebook(0);
noTrap.update(prev => prev + 1);
noTrap.update(prev => prev + 1);
noTrap.update(prev => prev + 1);
console.log(\`函数式 \${noTrap.value} 次: \${noTrap.value}\`);
console.log();

// ============================================================
// 🧙 3️⃣ 惰性初始化
// ============================================================
console.log("=== 🧙 3️⃣ 惰性初始化 ===");

// 模拟一个昂贵的计算
let computeCount = 0;
function expensiveComputation(): number[] {
  computeCount++;
  console.log(\`  💰 expensiveComputation 第 \${computeCount} 次执行\`);
  return Array.from({length: 1000}, (_, i) => i);
}

// ❌ 每次都计算
const notLazy = new MagicNotebook(expensiveComputation());
// ✅ 只算一次（这里用变量保存模拟）

let initData: number[] | null = null;
const lazy = new MagicNotebook<number[]>(
  // 用函数包装惰性初始化
  (() => initData ?? (initData = expensiveComputation()))()
);
console.log(\`computeCount = \${computeCount}（理论上应该只执行 1 次）\`);
console.log();

// ============================================================
// 🧙 4️⃣ 对象更新：必须返回新对象
// ============================================================
console.log("=== 🧙 4️⃣ 对象更新 ===");

const userBook = new MagicNotebook({ name: "Alice", age: 20 });
const oldUser = userBook.value;
userBook.set({ ...userBook.value, age: 21 });
console.log(\`原对象: \${JSON.stringify(oldUser)}\`);
console.log(\`新对象: \${JSON.stringify(userBook.value)}\`);
console.log(\`引用变化？\`, oldUser !== userBook.value);
console.log();

// ============================================================
// 🧙 5️⃣ 数组更新：增删改
// ============================================================
console.log("=== 🧙 5️⃣ 数组更新 ===");

const list = new MagicNotebook<number[]>([1, 2, 3]);
console.log(\`初始: \${JSON.stringify(list.value)}\`);

// 追加
list.set([...list.value, 4]);
console.log(\`追加 4: \${JSON.stringify(list.value)}\`);

// 删除
list.set(list.value.filter(i => i !== 2));
console.log(\`删除 2: \${JSON.stringify(list.value)}\`);

// 修改
list.set(list.value.map(i => i === 3 ? 30 : i));
console.log(\`3 -> 30: \${JSON.stringify(list.value)}\`);
console.log();

// ============================================================
// 📊 useState 速查表
// ============================================================
console.log("=== 📊 useState 速查表 ===");
console.log(\`| 场景          | 写法                              |\`);
console.log(\`| 数组          | setList([...list, item])         |\`);
console.log(\`| 对象          | setUser({...user, age: 21})      |\`);
console.log(\`| 可能为 null   | useState<User \\| null>(null)    |\`);
console.log(\`| 依赖旧值      | setX(prev => prev + 1)           |\`);
console.log(\`| 初始值要算    | useState(() => compute())        |\`);

console.log("\\n=== 📔 第 3 章结束 ===")`,
  },

  // ===========================================================
  // 第 4 章：宝库管理员（useRef）
  // ===========================================================
  {
    id: "tsx-story-useref",
    group: "居民篇：六位老朋友",
    icon: "🗝️",
    title: "宝库管理员（useRef）",
    content: `# 🗝️ 第 4 章：宝库管理员

> *童话镇上有一位宝库管理员，他掌管着镇长府的"暗格"——一个神奇的抽屉。外面的人看不到里面的东西，但你可以随时打开它、放东西、取东西。这个暗格叫做 \`useRef\`。*

---

## 🌟 故事开场

镇长有个秘密：他想记住"上次种树的时间戳"，但这个值**不需要触发重渲染**（只是记下来用）。用 useState 又会触发重渲染，太浪费。

TypeScript 老巫师说："用 \`useRef\`！它就像一个**暗格抽屉**：
- 🗝️ 抽屉里可以放任何东西
- 👀 放东西、拿东西不会通知任何人
- 📌 抽屉的钥匙 \`xxx.current\` 永远指向同一个抽屉（引用稳定）"

---

## 🪄 基础用法

\`\`\`tsx
import { useRef } from "react";

function TreeCounter() {
  // 🗝️ 镇长申请一个暗格抽屉
  const lastTreeTimeRef = useRef<number>(0);  // 显式类型为 number
  const treesRef = useRef(0);                  // 推断为 number

  const plantTree = () => {
    treesRef.current += 1;
    lastTreeTimeRef.current = Date.now();
    console.log(\`种了第 \${treesRef.current} 棵，时间: \${lastTreeTimeRef.current}\`);
  };

  return <button onClick={plantTree}>种树</button>;
}
\`\`\`

### 📐 签名解析

\`\`\`tsx
const ref = useRef<Type>(initialValue);
//              ↑       ↑
//          暗格钥匙  暗格里的初始值

ref.current;   // 打开抽屉，拿出东西
ref.current = x;  // 放东西进抽屉
\`\`\`

**小镇比喻**：
- \`ref\` = 抽屉的钥匙
- \`ref.current\` = 打开抽屉，拿出里面的东西
- 改 \`ref.current\` 不会让小镇重渲染（不像 useState）

---

## 🧙 进阶 1：操作 DOM 元素

\`useRef\` 最常见的用途是**获取 DOM 元素引用**：

\`\`\`tsx
function AutoFocusInput() {
  // 🗝️ 申请一个装 input 元素的抽屉
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    // 📌 current 类型是 HTMLInputElement | null
    //    TS 知道 input 有 .focus() 方法
    inputRef.current?.focus();   // 可选链：万一 ref 还没绑定呢
  };

  return (
    <>
      <input ref={inputRef} placeholder="点击按钮我会聚焦" />
      <button onClick={handleClick}>聚焦输入框</button>
    </>
  );
}
\`\`\`

**小镇比喻**：\`ref={inputRef}\` 是告诉 React"把这个 input 元素的钥匙存到我的暗格里"。

---

## 🧙 进阶 2：保存"不会变化但需要记住"的值

\`\`\`tsx
function StopWatch() {
  // 🗝️ 记录开始时间（不需要触发重渲染）
  const startTimeRef = useRef<number | null>(null);
  // 🗝️ 记录定时器 ID（用 ReturnType 拿到 setInterval 的类型）
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const start = () => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - (startTimeRef.current ?? 0));
    }, 100);
  };

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div>
      <p>已运行: {elapsed} ms</p>
      <button onClick={start}>开始</button>
      <button onClick={stop}>停止</button>
    </div>
  );
}
\`\`\`

---

## 🧙 进阶 3：保存上一次的值

\`\`\`tsx
function Counter() {
  const [count, setCount] = useState(0);
  // 🗝️ 记住上次的 count
  const prevCountRef = useRef(0);

  useEffect(() => {
    prevCountRef.current = count;  // 每次渲染后更新
  });

  return (
    <div>
      <p>当前: {count}, 上次: {prevCountRef.current}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
\`\`\`

---

## 📊 useState vs useRef

| 维度 | useState | useRef |
|------|----------|--------|
| 改值触发渲染？ | ✅ 是 | ❌ 否 |
| 返回 | \`[value, setValue]\` | \`{ current: value }\` |
| 主要用途 | 业务数据 | DOM 引用 / 缓存 |
| 异步读取最新值？ | ✅ 是 | ❌ 否（同步） |
| 类型 | 推断/泛型 | 必填泛型 |

**小镇比喻**：
- \`useState\` 是**公告板**——改了，全镇人都知道（重渲染）
- \`useRef\` 是**私人抽屉**——改了，只有你知道

---

## ⚠️ 常见错误

### 错误 1：拿 ref 当 state 用

\`\`\`tsx
// ❌ 改了 ref.current 但 UI 不更新
const countRef = useRef(0);
countRef.current = 1;   // UI 还是 0

// ✅ 改 state 才更新
const [count, setCount] = useState(0);
setCount(1);   // UI 变 1
\`\`\`

### 错误 2：忘记 .current

\`\`\`tsx
const inputRef = useRef<HTMLInputElement>(null);
inputRef.focus();           // ❌ inputRef 是 { current: ... }，没有 focus
inputRef.current?.focus();  // ✅
\`\`\`

### 错误 3：在 render 中读 ref.current

\`\`\`tsx
// ❌ render 中读 ref.current 会拿到旧值
function Bad() {
  const ref = useRef(0);
  ref.current = 1;  // render 中赋值有副作用！
  return <div>{ref.current}</div>;
}
\`\`\`

---

## 🎬 小剧场：宝库的三个抽屉

> *镇长府有三个宝库抽屉：*
> *🗝️ 抽屉 1（inputRef）：装 input 元素，需要时 focus 一下*
> *🗝️ 抽屉 2（timerRef）：装定时器 ID，停止时清掉*
> *🗝️ 抽屉 3（startTimeRef）：装开始时间戳，统计时长用*
> *每个抽屉的钥匙 \`xxx.current\` 永远指向同一个抽屉——不会换！*

---

## 📝 第 4 章小结

- 🗝️ \`useRef\` = 私人暗格抽屉，改值不触发渲染
- 主要用途：获取 DOM 引用 / 缓存值 / 存定时器 ID
- 必填泛型：\`useRef<Type>(initialValue)\`
- 访问值用 \`xxx.current\`
- DOM 元素类型：\`useRef<HTMLInputElement>(null)\`
- 不是 state 的替代品——需要触发渲染用 useState

> *下一章，去镇长府邸——useReducer！*`,

    code: `// 🗝️ TSX 童话镇 - 第 4 章 Demo：宝库管理员

// 模拟 useRef
class SecretDrawer<T> {
  // current 字段就是抽屉里的内容
  public current: T;
  constructor(initial: T) {
    this.current = initial;
  }
}

function useRef<T>(initial: T): SecretDrawer<T> {
  return new SecretDrawer(initial);
}

// ============================================================
// 🗝️ 1️⃣ 基础用法：保存时间戳
// ============================================================
console.log("=== 🗝️ 1️⃣ 基础用法 ===");

const lastTimeRef = useRef<number>(0);
const countRef = useRef(0);

countRef.current += 1;
lastTimeRef.current = Date.now();

console.log(\`计数: \${countRef.current}\`);
console.log(\`时间戳: \${lastTimeRef.current}\`);
console.log();

// ============================================================
// 🗝️ 2️⃣ DOM 引用模拟
// ============================================================
console.log("=== 🗝️ 2️⃣ DOM 引用 ===");

// 模拟一个 input 元素对象
class MockInputElement {
  focused = false;
  focus() { this.focused = true; }
  blur() { this.focused = false; }
  get value() { return this._value; }
  set value(v: string) { this._value = v; }
  private _value = "";
}

const inputRef = useRef<MockInputElement | null>(null);
console.log(\`初始 ref.current: \${inputRef.current}\`);

// 模拟 React 在挂载后赋值
const mockInput = new MockInputElement();
inputRef.current = mockInput;

console.log(\`挂载后 ref.current 类型: \${inputRef.current?.constructor.name}\`);
inputRef.current?.focus();
console.log(\`调用 .focus() 后 focused: \${inputRef.current?.focused}\`);
console.log();

// ============================================================
// 🗝️ 3️⃣ 存定时器 ID
// ============================================================
console.log("=== 🗝️ 3️⃣ 存定时器 ID ===");

const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

let tickCount = 0;
const intervalId = setInterval(() => {
  tickCount++;
  if (tickCount >= 3) {
    if (timerRef.current) clearInterval(timerRef.current);
    console.log(\`  ✅ 定时器已停止（id: \${intervalId}）\`);
  } else {
    console.log(\`  tick \${tickCount}\`);
  }
}, 10);
timerRef.current = intervalId;
console.log(\`保存的定时器 ID 已存入 timerRef.current\`);
console.log();

// ============================================================
// 🗝️ 4️⃣ 稳定引用：每次渲染都是同一个抽屉
// ============================================================
console.log("=== 🗝️ 4️⃣ 稳定引用 ===");

const stableRef = useRef<number>(0);
stableRef.current = 5;
console.log(\`第一次 current: \${stableRef.current}\`);
// 模拟重渲染
console.log(\`💡 同一个抽屉，current 始终保持\`);
console.log();

// ============================================================
// ⚠️ 错误演示
// ============================================================
console.log("=== ⚠️ 常见错误 ===");

// 错误 1：拿 ref 当 state
const badRef = useRef(0);
badRef.current = 1;
console.log("❌ 改了 ref.current 但 UI 不会重渲染（这是 useRef 的设计，不是 bug）");
console.log("✅ 触发渲染用 useState");
console.log();

console.log("=== 🗝️ 第 4 章结束 ===")`,
  },
];
