// =============================================================
// TSX 童话镇 - 第 4 批：复杂状态 + 大冒险
// -------------------------------------------------------------
// 第 5 章：镇长府邸（useReducer）
// 第 6 章：公告板（useContext）
// 第 7 章：大冒险 - 建造城堡（综合实战）
// =============================================================

export const chapters = [
  // ===========================================================
  // 第 5 章：镇长府邸（useReducer）
  // ===========================================================
  {
    id: "tsx-story-usereducer",
    group: "契约篇：魔法的语言",
    icon: "🎛️",
    title: "镇长府邸（useReducer）",
    content: `# 🎛️ 第 5 章：镇长府邸

> *镇长府邸很大，里面有一位"管家"——他手里拿着一本厚厚的《变化法典》。每次镇长想改什么，他不直接动手，而是查法典、按规矩来。这个管家就叫做 \`useReducer\`。*

---

## 🌟 故事开场

镇长府邸管理着很多事：税收、告示、守卫排班……用 \`useState\` 一个一个管，setter 太多，容易乱。

TypeScript 老巫师说："给你一个**管家** \`useReducer\`。你要改什么，发一个'指令'给管家，管家查《变化法典》（reducer 函数），按规矩返回新状态。"

\`\`\`tsx
import { useReducer } from "react";

// 📖《变化法典》：每条规则说"做什么 → 状态怎么变"
function treasureReducer(state, action) {
  switch (action.type) {
    case "挖到金币": return { ...state, gold: state.gold + 10 };
    case "花掉金币": return { ...state, gold: state.gold - 5 };
    case "种树": return { ...state, trees: state.trees + 1 };
    default: return state;
  }
}

function Treasurer() {
  const [state, dispatch] = useReducer(treasureReducer, { gold: 0, trees: 0 });
  //      ↑ 当前状态   ↑ 发指令的邮差

  return (
    <div>
      <p>💰 {state.gold} 金币, 🌳 {state.trees} 棵树</p>
      <button onClick={() => dispatch({ type: "挖到金币" })}>挖矿</button>
      <button onClick={() => dispatch({ type: "种树" })}>种树</button>
    </div>
  );
}
\`\`\`

**小镇比喻**：
- \`state\` = 镇长府邸的现状
- \`dispatch\` = 给管家发指令的邮差
- \`reducer\` = 《变化法典》，写明每种指令怎么处理
- \`action\` = 一封信，写着 type（指令类型）和 payload（附加数据）

---

## 🧙 进阶 1：判别联合类型（Discriminated Union）

\`action\` 是个对象，最佳实践是用**判别联合**——\`type\` 字段作判别符：

\`\`\`tsx
// 📖 每种 action 是独立的"信"
type TreasureAction =
  | { type: "挖到金币"; amount: number }       // 带数量
  | { type: "花掉金币"; cost: number; item: string }  // 带价格和物品
  | { type: "种树"; species: string };          // 带树种
  | { type: "重置" };                           // 无附加数据

function treasureReducer(state: TreasureState, action: TreasureAction): TreasureState {
  switch (action.type) {
    case "挖到金币":
      // 这里 action 被收窄为 { type: "挖到金币"; amount: number }
      return { ...state, gold: state.gold + action.amount };  // ✅ 能用 amount

    case "种树":
      return { ...state, trees: state.trees + 1, lastSpecies: action.species };

    case "重置":
      return initialState;

    default: {
      // 穷尽性检查：如果将来加了 action 但忘了 case，TS 会报错
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
\`\`\`

**小镇比喻**：每封信都贴了不同颜色的邮票，邮差一看邮票就知道送去哪个部门。\`type\` 字段就是那枚邮票。

---

## 🧙 进阶 2：TypeScript 自动收窄

在 \`case "挖到金币":\` 分支里，TS 知道 \`action.type\` 只能是 \`"挖到金币"\`，所以自动把 \`action\` 收窄为 \`{ type: "挖到金币"; amount: number }\`：

\`\`\`tsx
case "挖到金币":
  return { ...state, gold: state.gold + action.amount };
  //                                 ^^^^^^^^^^^^^
  //                  TS 自动收窄，能直接用 amount

case "花掉金币":
  console.log(\`花了 \${action.cost} 金币买 \${action.item}\`);
  //                                 ^^^^^^^^^^^^^^^^^^
  //                  TS 收窄到 cost/item 都有
  return { ...state, gold: state.gold - action.cost };
\`\`\`

如果在某个 case 里访问别的 case 的字段，TS 会立刻报错——**编译器替你保证不会用错字段**。

---

## 🧙 进阶 3：穷尽性检查

\`default\` 分支里的 \`const _exhaustive: never = action;\`：

\`\`\`tsx
type TreasureAction = { type: "A" } | { type: "B" } | { type: "C" };

function reducer(state: State, action: TreasureAction): State {
  switch (action.type) {
    case "A": return stateA;
    case "B": return stateB;
    // ❌ 漏了 case "C"
    default: {
      const _exhaustive: never = action;  // ❌ TypeScript 编译报错！
      //                              ^^^^^^
      //    因为 action 此时是 { type: "C" }，不是 never
      return _exhaustive;
    }
  }
}
\`\`\`

**小镇比喻**：穷尽性检查是"清点员"——你列了 A 和 B，但忘了 C，他立刻提醒你"C 还没处理呢！"。

---

## 📊 useState vs useReducer

| 场景 | 推荐 | 理由 |
|------|------|------|
| 单个独立状态 | \`useState\` | 简单直接 |
| 2-3 个相关状态 | \`useState\` | 还能 hold 住 |
| 状态间强联动 | \`useReducer\` | 集中管理 |
| 多种操作改同一状态 | \`useReducer\` | action 列表清晰 |
| 状态转换有复杂规则 | \`useReducer\` | reducer 可独立测试 |
| 状态转换像"状态机" | \`useReducer\` | 多种动作驱动 |

**口诀**：状态像"机器"（多种动作驱动状态机）用 reducer；状态像"变量"用 state。

---

## 🎬 小剧场：管家的一天

> *清晨，邮差送来一封信："type: 挖到金币, amount: 100"。管家翻开法典，找到对应规则，金币 +100。*
> *中午，邮差送来："type: 买种子, cost: 5, item: 橡树"。管家扣 5 金币，加 1 棵橡树。*
> *下午，邮差送来："type: 重置"。管家翻开"重置"规则，把所有东西清零。*

---

## 📝 第 5 章小结

- 🎛️ \`useReducer\` = 管家 + 邮差 + 变化法典
- \`state\` 当前状态，\`dispatch\` 发指令，\`reducer\` 规定每种指令的处理
- Action 用判别联合，\`type\` 作判别符
- TS 在 \`case\` 分支自动收窄
- \`default\` 用 \`never\` 做穷尽性检查
- reducer 必须是纯函数，永远返回新对象

> *下一章，去公告板——useContext！*`,

    code: `// 🎛️ TSX 童话镇 - 第 5 章 Demo：管家 + 变化法典

// ============================================================
// 📖 1️⃣ State 和 Action 的判别联合类型
// ============================================================
type TreasureState = {
  gold: number;
  trees: number;
  lastSpecies: string;
};

type TreasureAction =
  | { type: "挖到金币"; amount: number }
  | { type: "花掉金币"; cost: number; item: string }
  | { type: "种树"; species: string }
  | { type: "重置" };

const initialState: TreasureState = { gold: 0, trees: 0, lastSpecies: "" };

// ============================================================
// 🎛️ 2️⃣ Reducer 函数：变化法典
// ============================================================
function treasureReducer(state: TreasureState, action: TreasureAction): TreasureState {
  switch (action.type) {
    case "挖到金币":
      // TS 收窄：action 是 { type: "挖到金币"; amount: number }
      return { ...state, gold: state.gold + action.amount };

    case "花掉金币":
      // TS 收窄：action 有 cost 和 item
      console.log(\`  📝 买了 \${action.item}（-\${action.cost} 金币）\`);
      return { ...state, gold: state.gold - action.cost };

    case "种树":
      return { ...state, trees: state.trees + 1, lastSpecies: action.species };

    case "重置":
      return { ...initialState };

    default: {
      // 穷尽性检查
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

// ============================================================
// 🎬 3️⃣ 模拟 useReducer 和 dispatch
// ============================================================
let currentState: TreasureState = initialState;

function dispatch(action: TreasureAction) {
  currentState = treasureReducer(currentState, action);
  return currentState;
}

console.log("=== 🎛️ 镇长府邸 Demo ===\\n");

console.log("--- 初始状态 ---");
console.log(dispatch({ type: "重置" }));
console.log();

console.log("--- 挖到金币 +100 ---");
console.log(dispatch({ type: "挖到金币", amount: 100 }));
console.log();

console.log("--- 又挖到 +50 ---");
console.log(dispatch({ type: "挖到金币", amount: 50 }));
console.log();

console.log("--- 买橡树种子 -5 ---");
console.log(dispatch({ type: "花掉金币", cost: 5, item: "橡树种子" }));
console.log();

console.log("--- 种一棵橡树 ---");
console.log(dispatch({ type: "种树", species: "橡树" }));
console.log();

console.log("--- 买苹果种子 -3 ---");
console.log(dispatch({ type: "花掉金币", cost: 3, item: "苹果种子" }));
console.log();

console.log("--- 种苹果树 ---");
console.log(dispatch({ type: "种树", species: "苹果" }));
console.log();

console.log("--- 重置 ---");
console.log(dispatch({ type: "重置" }));
console.log();

console.log("=== 🎛️ 第 5 章结束 ===")`,
  },

  // ===========================================================
  // 第 6 章：公告板（useContext）
  // ===========================================================
  {
    id: "tsx-story-usecontext",
    group: "契约篇：魔法的语言",
    icon: "📋",
    title: "公告板（useContext）",
    content: `# 📋 第 6 章：公告板

> *童话镇上有一块巨大的公告板，位于镇中心广场。所有重要的公共信息（今天的主题色、镇长公告、活动……）都贴在上面。任何居民只要走到广场，都能看到。这个公告板就叫做 \`Context\`。*

---

## 🌟 故事开场

镇长有个问题：所有房子（组件）都需要知道"今天的主题色"——客厅、厨房、卧室都要按这个色刷墙。如果用 props 一层层传，**太累了**：

\`\`\`tsx
<App theme={theme}>
  <Header theme={theme}>
    <Nav theme={theme}>
      <Menu theme={theme}>...</Menu>
    </Nav>
  </Header>
</App>
\`\`\`

TypeScript 老巫师说："建一块**公告板**！在顶层放（Provider），所有房子（组件）只要走进广场就能看到（useContext）。"

---

## 🪄 三步建公告板

### 步骤 1️⃣：创建 Context

\`\`\`tsx
import { createContext } from "react";

// 📋 在镇中心建一块公告板
type Theme = { color: "light" | "dark"; primary: string };
const ThemeContext = createContext<Theme | null>(null);
//                                            ↑
//                              默认 null（找不到时）
\`\`\`

**小镇比喻**：\`createContext\` 是"在广场上钉一块公告板"，并约定上面贴的内容是什么类型。

### 步骤 2️⃣：顶层放 Provider

\`\`\`tsx
function App() {
  const [theme, setTheme] = useState<Theme>({ color: "light", primary: "blue" });

  return (
    // 📋 把值贴在公告板上
    <ThemeContext.Provider value={theme}>
      <Header />
      <Main />
      <Footer />
    </ThemeContext.Provider>
  );
}
\`\`\`

**小镇比喻**：\`Provider\` 是"镇长亲自把告示贴到公告板上"。

### 步骤 3️⃣：任意子组件读

\`\`\`tsx
import { useContext } from "react";

function Button() {
  // 📋 走到广场，读公告板
  const theme = useContext(ThemeContext);
  if (!theme) return null;   // 万一没 Provider 呢？

  return <button style={{ background: theme.primary }}>按钮</button>;
}
\`\`\`

**小镇比喻**：\`useContext\` 是"走到广场，抄下公告"。

---

## 🧙 进阶 1：带更新函数的 Context

如果想让任何子组件都能改 theme（不只顶层）：

\`\`\`tsx
// 📋 公告板约定：传一个含 theme 和 setTheme 的对象
type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function App() {
  const [theme, setTheme] = useState<Theme>({ color: "light", primary: "blue" });

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Header />
    </ThemeContext.Provider>
  );
}

function ThemeSwitcher() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return null;

  return (
    <button onClick={() => ctx.setTheme({ color: "dark", primary: "red" })}>
      切到暗色
    </button>
  );
}
\`\`\`

**小镇比喻**：公告板上不只贴"告示"，还贴"申请表"——想改告示的居民填表申请，镇长审批。

---

## 🧙 进阶 2：自定义 Hook 包装 useContext

直接用 \`useContext\` 每次都要检查 null，烦。包成一个 hook：

\`\`\`tsx
// 🎁 自定义 Hook：自带 null 检查
function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme 必须在 ThemeContext.Provider 内使用！");
  return ctx;
}

// 用法：超简洁
function Button() {
  const { theme, setTheme } = useTheme();
  return <button style={{ background: theme.primary }}>按钮</button>;
}
\`\`\`

**小镇比喻**：与其每次去广场看公告，不如在每家门口装个"魔法传声筒"——一喊就把公告传过来。

---

## 🧙 进阶 3：多个 Context 嵌套

\`\`\`tsx
const ThemeContext = createContext<Theme | null>(null);
const UserContext = createContext<User | null>(null);

function App() {
  return (
    <ThemeContext.Provider value={theme}>
      <UserContext.Provider value={user}>
        <Header />
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}

function Header() {
  const theme = useContext(ThemeContext);
  const user = useContext(UserContext);
  // ...
}
\`\`\`

---

## 📊 何时用 Context

| 场景 | 推荐 | 理由 |
|------|------|------|
| 跨多层的全局数据 | ✅ Context | 避免 prop drilling |
| 主题、用户信息、locale | ✅ Context | 整个 app 都需要 |
| 父子组件直接传 | ❌ 用 props | 不必绕一圈 |
| 高频变化的状态 | ⚠️ 慎用 | 任何 Provider 变化，所有消费者都重渲染 |

**小镇口诀**：公告板适合"全镇公告"（主题、用户），不适合"邻居间私聊"（父子 props 就行）。

---

## ⚠️ 常见错误

### 错误 1：忘记 Provider

\`\`\`tsx
// ❌ 没有 Provider，useContext 拿到 null
function App() {
  return <Button />;  // 没用 Provider 包！
}

function Button() {
  const theme = useContext(ThemeContext);  // null
  return <button>{theme?.color}</button>;  // 啥也没有
}
\`\`\`

### 错误 2：传整个对象导致过度重渲染

\`\`\`tsx
// ❌ 每次渲染都创建新对象，所有消费者都重渲染
<ThemeContext.Provider value={{ theme, setTheme }}>

// ✅ 用 useMemo 稳定引用
const value = useMemo(() => ({ theme, setTheme }), [theme]);
<ThemeContext.Provider value={value}>
\`\`\`

---

## 🎬 小剧场：公告板的一天

> *清晨，镇长把今天的"蓝色主题"贴到公告板。*
> *9 点，Button 先生走到广场看到"蓝色"，把按钮刷成蓝色。*
> *10 点，Menu 小姐走到广场看到"蓝色"，把菜单高亮也改蓝色。*
> *中午，ThemeSwitcher 把公告板改成"红色主题"，所有组件瞬间变红。*
> *下午 5 点，镇长撕下公告板（unmount），所有组件读不到了。*

---

## 📝 第 6 章小结

- 📋 Context = 镇中心公告板
- 三步：\`createContext\` → \`Provider\` → \`useContext\`
- 适合"全镇公告"（主题、用户）
- 配套 useMemo 防止过度重渲染
- 包成自定义 Hook 更简洁

> *下一章，建造大城堡——综合实战！*`,

    code: `// 📋 TSX 童话镇 - 第 6 章 Demo：公告板

// 模拟 React Context
class BulletinBoard<T> {
  private value: T;
  private listeners: Array<() => void> = [];
  constructor(initial: T) { this.value = initial; }

  setValue(newValue: T) {
    this.value = newValue;
    this.listeners.forEach(fn => fn());
  }

  getValue(): T { return this.value; }
}

function createContext<T>(defaultValue: T) {
  return {
    Provider: class {
      constructor(public value: T) {}
    },
    Consumer: class {
      constructor(public children: (value: T) => unknown) {}
    },
    _board: new BulletinBoard(defaultValue),
  };
}

// ============================================================
// 📋 1️⃣ 创建 Context
// ============================================================
type Theme = { color: "light" | "dark"; primary: string };

const ThemeContext = createContext<Theme | null>(null);
console.log("=== 📋 1️⃣ Context 创建 ===");
console.log("已创建 ThemeContext，类型: Theme | null");
console.log();

// ============================================================
// 📋 2️⃣ Provider 提供值
// ============================================================
console.log("=== 📋 2️⃣ Provider 提供值 ===");

const lightTheme: Theme = { color: "light", primary: "blue" };
const darkTheme: Theme = { color: "dark", primary: "red" };

// 模拟 Provider 包裹
ThemeContext._board.setValue(lightTheme);
console.log("挂载 Provider，value =", ThemeContext._board.getValue());
console.log();

// ============================================================
// 📋 3️⃣ useContext 读取
// ============================================================
console.log("=== 📋 3️⃣ useContext 读取 ===");

function useContext<T>(ctx: { _board: BulletinBoard<T> }): T {
  return ctx._board.getValue();
}

const currentTheme = useContext(ThemeContext);
console.log("子组件读到的 theme:", currentTheme);

if (currentTheme) {
  console.log(\`  主题色: \${currentTheme.color}, 主色: \${currentTheme.primary}\`);
}
console.log();

// ============================================================
// 📋 4️⃣ 切换主题
// ============================================================
console.log("=== 📋 4️⃣ 切换主题 ===");

ThemeContext._board.setValue(darkTheme);
console.log("调用 setValue(darkTheme) 后，子组件读到的 theme:", useContext(ThemeContext));
console.log();

ThemeContext._board.setValue(lightTheme);
console.log("切回 light:", useContext(ThemeContext));
console.log();

// ============================================================
// 🎁 5️⃣ 自定义 Hook 包装
// ============================================================
console.log("=== 🎁 5️⃣ 自定义 Hook 包装 ===");

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("❌ useTheme 必须在 Provider 内使用！");
  }
  return ctx;
}

try {
  const theme1 = useTheme();
  console.log(\`✅ useTheme() 返回: color=\${theme1.color}, primary=\${theme1.primary}\`);
} catch (e) {
  console.log(\`❌ \${(e as Error).message}\`);
}
console.log();

console.log("=== 📋 第 6 章结束 ===")`,
  },

  // ===========================================================
  // 第 7 章：大冒险——建造城堡（综合实战）
  // ===========================================================
  {
    id: "tsx-story-final-adventure",
    group: "大冒险：建造城堡",
    icon: "🏰",
    title: "大冒险：建造一座童话城堡（综合实战）",
    content: `# 🏰 第 7 章：大冒险——建造一座童话城堡

> *恭喜你！学完了 TSX 童话镇所有的基础知识。现在，是时候用它们建造一座真正的大城堡了！*

---

## 🎯 任务

综合运用前面学到的所有 hooks，建造一个**童话城堡管理面板**，包含：

- 🏰 城堡列表（useState 数组）
- ➕ 加城堡（事件 + 状态更新）
- 🎨 切换主题（useContext）
- 🗝️ 城堡详情（forwardRef + useImperativeHandle）
- 📊 统计信息（useReducer）

---

## 🏗️ 城堡蓝图

\`\`\`tsx
// 🏰 1. 类型契约：每栋城堡的样子
type Castle = {
  id: number;
  name: string;
  size: number;          // 占地（亩）
  guards: number;        // 守卫数
  hasTower: boolean;     // 有没有塔楼
};

type CastleAction =
  | { type: "addCastle"; castle: Castle }
  | { type: "removeCastle"; id: number }
  | { type: "renameCastle"; id: number; newName: string };

// 🏰 2. Reducer：城堡变化法典
function castleReducer(state: Castle[], action: CastleAction): Castle[] {
  switch (action.type) {
    case "addCastle":
      return [...state, action.castle];
    case "removeCastle":
      return state.filter(c => c.id !== action.id);
    case "renameCastle":
      return state.map(c => c.id === action.id ? { ...c, name: action.newName } : c);
    default: {
      const _: never = action;
      return _;
    }
  }
}
\`\`\`

---

## 🎨 主题公告板

\`\`\`tsx
// 🎨 Context：公告板
type Theme = { color: "light" | "dark"; primary: string };
const ThemeContext = createContext<Theme>({ color: "light", primary: "blue" });

function useTheme() {
  return useContext(ThemeContext);
}
\`\`\`

---

## 🏰 城堡组件

\`\`\`tsx
// 🏰 城堡展示组件
function CastleCard({ castle }: { castle: Castle }) {
  const theme = useTheme();
  return (
    <div style={{ border: \`2px solid \${theme.primary}\` }}>
      <h3>{castle.name}</h3>
      <p>占地: {castle.size} 亩</p>
      <p>守卫: {castle.guards} 人</p>
      {castle.hasTower && <p>🏰 有塔楼！</p>}
    </div>
  );
}
\`\`\`

---

## ➕ 加城堡表单

\`\`\`tsx
function AddCastleForm() {
  const [name, setName] = useState("");
  const [size, setSize] = useState(10);
  const [guards, setGuards] = useState(5);
  const [hasTower, setHasTower] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    // dispatch: 加城堡
    console.log(\`添加城堡: \${name}, \${size} 亩, \${guards} 守卫\`);
    setName("");  // 清空表单
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="城堡名" />
      <input type="number" value={size} onChange={(e) => setSize(+e.target.value)} />
      <input type="number" value={guards} onChange={(e) => setGuards(+e.target.value)} />
      <label><input type="checkbox" checked={hasTower} onChange={(e) => setHasTower(e.target.checked)} /> 有塔楼</label>
      <button type="submit">加城堡</button>
    </form>
  );
}
\`\`\`

---

## 📊 统计信息

\`\`\`tsx
function CastleStats({ castles }: { castles: Castle[] }) {
  const totalSize = castles.reduce((sum, c) => sum + c.size, 0);
  const totalGuards = castles.reduce((sum, c) => sum + c.guards, 0);
  const withTower = castles.filter(c => c.hasTower).length;

  return (
    <div>
      <h3>📊 统计</h3>
      <p>总城堡: {castles.length}</p>
      <p>总占地: {totalSize} 亩</p>
      <p>总守卫: {totalGuards} 人</p>
      <p>有塔楼: {withTower}</p>
    </div>
  );
}
\`\`\`

---

## 🏠 主应用

\`\`\`tsx
function App() {
  const [theme, setTheme] = useState<Theme>({ color: "light", primary: "blue" });
  const [castles, dispatch] = useReducer(castleReducer, []);

  return (
    <ThemeContext.Provider value={theme}>
      <div className={\`app theme-\${theme.color}\`}>
        <button onClick={() => setTheme(t => ({ ...t, color: t.color === "light" ? "dark" : "light" }))}>
          切换 {theme.color === "light" ? "暗" : "亮"} 色
        </button>

        <AddCastleForm />
        <CastleStats castles={castles} />

        {castles.map(c => (
          <CastleCard key={c.id} castle={c} />
        ))}
      </div>
    </ThemeContext.Provider>
  );
}
\`\`\`

---

## 🎬 小剧场：城堡建成

> *镇长（你）建好了公告板（Context），建好了城堡列表（useReducer），建好了加城堡表单（useState），建好了统计面板（数组方法），建好了主题切换（setState）。*
> *所有东西都连起来了！童话镇最大的城堡，终于落成了！*

---

## 📝 第 7 章小结

你用到了 TSX 童话镇的所有基础知识：

- 📜 **类型契约** \`type\` / \`interface\`（第 1 章）
- 👶 **children**（第 1 章）
- 📨 **事件处理**（第 2 章）
- 📔 **useState**（第 3 章）
- 🗝️ **useRef**（第 4 章）
- 🎛️ **useReducer + 判别联合**（第 5 章）
- 📋 **useContext**（第 6 章）

**恭喜毕业！你已经从 TSX 童话镇的"初学者"成长为"城堡建造者"！** 🎓

> *🎵 "童话镇的居民们，今天我们毕业啦！" — 童话镇民谣*`,

    code: `// 🏰 TSX 童话镇 - 第 7 章 Demo：建造大城堡

// ============================================================
// 🏰 1. 类型契约
// ============================================================
type Castle = {
  id: number;
  name: string;
  size: number;
  guards: number;
  hasTower: boolean;
};

type Theme = { color: "light" | "dark"; primary: string };

// ============================================================
// 🎛️ 2. Reducer + 判别联合
// ============================================================
type CastleAction =
  | { type: "addCastle"; castle: Castle }
  | { type: "removeCastle"; id: number }
  | { type: "renameCastle"; id: number; newName: string };

let castles: Castle[] = [];

function dispatch(action: CastleAction) {
  switch (action.type) {
    case "addCastle":
      castles = [...castles, action.castle];
      break;
    case "removeCastle":
      castles = castles.filter(c => c.id !== action.id);
      break;
    case "renameCastle":
      castles = castles.map(c => c.id === action.id ? { ...c, name: action.newName } : c);
      break;
    default: {
      const _: never = action;
      console.log(\`_ = \${_}\`);
    }
  }
}

// ============================================================
// ➕ 3. 加城堡
// ============================================================
console.log("=== ➕ 加城堡 ===");

dispatch({ type: "addCastle", castle: { id: 1, name: "天鹅堡", size: 100, guards: 20, hasTower: true } });
dispatch({ type: "addCastle", castle: { id: 2, name: "玫瑰堡", size: 50, guards: 10, hasTower: false } });
dispatch({ type: "addCastle", castle: { id: 3, name: "龙塔", size: 80, guards: 30, hasTower: true } });
console.log(\`已添加 \${castles.length} 座城堡\`);
castles.forEach(c => console.log(\`  \${c.id}. \${c.name}（\${c.size}亩，\${c.guards}守卫）\${c.hasTower ? " 🏰" : ""}\`));
console.log();

// ============================================================
// ✏️ 4. 重命名
// ============================================================
console.log("=== ✏️ 重命名 ===");
dispatch({ type: "renameCastle", id: 2, newName: "玫瑰园" });
const c2 = castles.find(c => c.id === 2);
console.log(\`id=2 重命名为: \${c2?.name}\`);
console.log();

// ============================================================
// 🗑️ 5. 删除
// ============================================================
console.log("=== 🗑️ 删除 ===");
dispatch({ type: "removeCastle", id: 1 });
console.log(\`删除 id=1 后剩余: \${castles.length} 座\`);
castles.forEach(c => console.log(\`  \${c.id}. \${c.name}\`));
console.log();

// ============================================================
// 📊 6. 统计
// ============================================================
console.log("=== 📊 统计 ===");
const totalSize = castles.reduce((sum, c) => sum + c.size, 0);
const totalGuards = castles.reduce((sum, c) => sum + c.guards, 0);
const withTower = castles.filter(c => c.hasTower).length;

console.log(\`总城堡: \${castles.length}\`);
console.log(\`总占地: \${totalSize} 亩\`);
console.log(\`总守卫: \${totalGuards} 人\`);
console.log(\`有塔楼: \${withTower}\`);
console.log();

// ============================================================
// 🎨 7. 主题切换（useContext 模拟）
// ============================================================
console.log("=== 🎨 主题切换 ===");

let currentTheme: Theme = { color: "light", primary: "blue" };
function setTheme(t: Theme) { currentTheme = t; }

console.log(\`当前主题: \${currentTheme.color}, 主色: \${currentTheme.primary}\`);
setTheme({ color: "dark", primary: "red" });
console.log(\`切换后: \${currentTheme.color}, 主色: \${currentTheme.primary}\`);
console.log();

// ============================================================
// 🎓 毕业
// ============================================================
console.log("=== 🎓 毕业 ===");
console.log("你已学完所有章节：");
console.log("  ✅ 第 1 章：Props 魔法契约");
console.log("  ✅ 第 2 章：电报员小屋（事件）");
console.log("  ✅ 第 3 章：镇长的记事本（useState）");
console.log("  ✅ 第 4 章：宝库管理员（useRef）");
console.log("  ✅ 第 5 章：镇长府邸（useReducer）");
console.log("  ✅ 第 6 章：公告板（useContext）");
console.log("  ✅ 第 7 章：大冒险（综合实战）");
console.log();
console.log("🎉 恭喜从 TSX 童话镇毕业！")`,
  },
];
