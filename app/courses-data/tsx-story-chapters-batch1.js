// =============================================================
// TSX 童话镇 - 第 1 批：序章 + 第 1 章
// -------------------------------------------------------------
// 序章：小镇的诞生（Props 魔法契约）
// 第 1 章：居民们的"孩子"（Children 包裹学）
// =============================================================

export const chapters = [
  // ===========================================================
  // 序章：小镇的诞生
  // ===========================================================
  {
    id: "tsx-story-prologue",
    group: "序章：初入小镇",
    icon: "🏘️",
    title: "序章：小镇的诞生（Props 魔法契约）",
    content: `# 🏘️ 序章：小镇的诞生

> *"很久很久以前，有一座叫做 React 的小镇……"*

欢迎来到 **TSX 童话镇**！在这座小镇上，每个组件都是一栋房子，每种类型都是一份"魔法契约"。读完这个故事，你会比看十篇技术博客更懂 TSX。

---

## 🌅 小镇故事

React 小镇最初只有几栋木头房子——一个 \`<div>\`、一个 \`<button>\`、一个 \`<input>\`。它们都很简陋，搬来搬去也变不出花样。

直到有一天，一位叫做 **TypeScript 老巫师** 来到了镇上。他在每栋房子的门口贴了一张**魔法契约**——契约上写着这栋房子能接收什么礼物、需要什么礼物。

从此以后，谁想搬进新礼物给房子，契约会自动检查：

- 😱 没带礼物？契约大喊"你缺了 label！"
- 😱 礼物不对？契约大喊"我要的是 string，你给我 number 干嘛！"
- 😱 礼物太多？契约大喊"我家塞不下！"

这张契约，就叫做 **Props**（Property，财产清单）。TypeScript 让我们在**搬家之前**（编译期）就能发现错误。

---

## 📜 第一张契约：type 写法

最常见的契约写法是用 \`type\`。下面这栋叫 \`Button\` 的小房子，契约写的是：

\`\`\`tsx
// 📜 魔法契约：Button 这栋房子能接收三样礼物
type ButtonProps = {
  label: string;                          // 必带：房子的名字
  size?: "sm" | "md" | "lg";              // 可选：房子只有这三种尺寸
  onClick?: () => void;                   // 可选：敲门时的回应
};

function Button({ label, size = "md", onClick }: ButtonProps) {
  return (
    <button onClick={onClick} className={\`btn btn-\${size}\`}>
      {label}
    </button>
  );
}
\`\`\`

📖 **小镇词典**：
- \`?\` 就像契约上画了个圈 ⭕——"没有也行"
- \`"sm" | "md" | "lg"\` 就像一份菜单——只能从这三道菜里点
- \`() => void\` 就像"按门铃的动作"——按下后不返回任何东西

---

## 📜 第二张契约：interface 写法

\`interface\` 是另一种契约写法，长得跟 \`type\` 很像：

\`\`\`tsx
// 🏠 基础房子契约
interface BaseHouseProps {
  name: string;
  size: number;
}

// 🏰 城堡在基础房子上扩建
interface CastleProps extends BaseHouseProps {
  hasTower: boolean;       // 城堡特有：有没有塔楼
  guards: number;          // 城堡特有：守卫数量
}

function Castle({ name, size, hasTower, guards }: CastleProps) {
  return (
    <div className="castle">
      <h1>{name} 城堡</h1>
      <p>占地 {size} 亩</p>
      {hasTower && <p>🏰 有塔楼！</p>}
      <p>👮 守卫: {guards} 人</p>
    </div>
  );
}
\`\`\`

✨ \`extends\` 就像"在我家旁边加盖一层"——把父契约的全部字段继承下来。

---

## 🤔 type 还是 interface？

| 场景 | 推荐 | 小镇比喻 |
|------|------|---------|
| 写普通组件契约 | \`type\` | 一张便签，简单够用 |
| 要在父契约上扩建 | \`interface\` | 房子加盖，层层叠叠 |
| 想做"A 或 B"的联合 | \`type\` | 菜单"二选一"，interface 写不了 |
| 第三方库想追加字段 | \`interface\` | 公告栏，谁都能贴告示 |

**小镇口诀**：能用 \`type\` 就用 \`type\`，要"联合"只能用 \`type\`，要"扩展"用 \`interface\`。

---

## 🎁 三个常用小礼物

### ① 继承 HTML 原生属性

有时候你想让组件能接收 \`className\`、\`style\`、\`onClick\` 这些 HTML 自带属性。不用手写，用 \`React.ComponentProps\` 复制一份原 HTML 标签的契约：

\`\`\`tsx
// 🔮 复制 <button> 原生契约，再追加一个 variant
type FancyButtonProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "ghost";
};

function FancyButton({ variant = "primary", ...rest }: FancyButtonProps) {
  return <button className={\`fancy-\${variant}\`} {...rest} />;
}

// ✅ 可以传任意 <button> 原生属性 + variant
<FancyButton variant="primary" onClick={() => {}} type="submit" />
\`\`\`

**小镇比喻**：相当于请来了"原生 button 大师"做顾问，TA 会什么你就会什么。

### ② 字面量联合 = 三道菜菜单

\`\`\`tsx
// 😋 餐厅只做这三种菜，不能点别的
type Flavor = "spicy" | "sweet" | "salty";
\`\`\`

比 \`string\` 严格——拼错一个字就报错，防止"明明是 'spicy'，写成了 'spiece'"这种 bug。

### ③ 可选 prop + 默认值

\`\`\`tsx
type InputProps = {
  value: string;
  placeholder?: string;   // 可选
};

function Input({ value, placeholder = "请输入..." }: InputProps) {
  return <input value={value} placeholder={placeholder} />;
}
\`\`\`

---

## 🎬 小剧场：搬家的故事

\`\`\`tsx
// 🏠 已经有了一栋 House 组件
type HouseProps = { color: string; floors: number };

function House({ color, floors }: HouseProps) {
  return <div style={{ color }}>我有 {floors} 层楼</div>;
}

// 🚚 居民张三要搬家进去——契约检查通过
<House color="red" floors={3} />

// 😱 李四忘了带 color——契约大喊："你缺了 color！"
<House floors={3} />

// 😱 王五带错了类型——契约大喊："color 必须是 string！"
<House color={123} floors={3} />
\`\`\`

这就是 TypeScript 给你的礼物：**把运行时的崩溃，提前到写代码时**。

---

## 📝 序章小结

- 📜 **Props** = 房子的"魔法契约"，规定能接收什么礼物
- \`type\` 和 \`interface\` 是写契约的两种笔
- \`?\` 表示"可以不带"
- 字面量联合 = 只能从固定菜单里点
- \`React.ComponentProps<"标签">\` 复制 HTML 原生契约
- TypeScript 在写代码时就帮你检查契约，**不用等到运行才报错**

下一章，我们去拜访小镇上的几位居民——children、events、useState、useRef！

> *🎵 "小镇的居民都很忙，每个人都有自己的魔法……" — 童话镇民谣*`,

    code: `// 🏘️ TSX 童话镇 - 序章 Demo
// 不依赖 React 渲染，用纯逻辑模拟"魔法契约"如何工作

// ============================================================
// 📜 1. 房子的魔法契约（type 写法）
// ============================================================
type HouseProps = {
  name: string;                  // 必带：房子的名字
  color: string;                 // 必带：颜色
  floors: number;                // 必带：层数
  hasGarden?: boolean;           // 可选：有没有花园
};

// TypeScript 在编译期会检查类型，但运行时类型被擦除。
// 我们用校验函数模拟"契约"的检查效果——
function checkHouseContract(props: HouseProps): string {
  if (!props.name) throw new Error("❌ 契约：缺少 name！");
  if (!props.color) throw new Error("❌ 契约：缺少 color！");
  if (props.floors < 1) throw new Error("❌ 契约：floors 至少为 1！");
  return \`✅ 契约通过！\${props.name}（\${props.color}色，\${props.floors} 层）\${props.hasGarden ? " + 花园" : ""}\`;
}

// ============================================================
// 📜 2. interface 写法 + extends 继承
// ============================================================
interface BaseBuildingProps {
  name: string;
  location: string;
}

interface CastleProps extends BaseBuildingProps {
  hasTower: boolean;     // 城堡特有
  guards: number;        // 守卫数量
}

function buildCastle(props: CastleProps): string {
  const tower = props.hasTower ? "🏰 有塔楼" : "🏠 没塔楼";
  return \`[\${props.name}] 位于 \${props.location}，\${tower}，守卫 \${props.guards} 人\`;
}

// ============================================================
// 📜 3. 字面量联合 = 菜单
// ============================================================
type Magic = "fire" | "ice" | "wind";   // 只能从三种魔法里选
type Spell = { name: string; power: Magic; damage: number };

const spellBook: Record<Magic, Spell> = {
  fire: { name: "🔥 火焰术", power: "fire", damage: 30 },
  ice:  { name: "❄️ 冰冻术", power: "ice",  damage: 20 },
  wind: { name: "🌪️ 风暴术", power: "wind", damage: 25 },
};

// ============================================================
// 🎬 4. 演示
// ============================================================
console.log("=== 🏘️ TSX 童话镇 序章 Demo ===\\n");

console.log("--- 📜 契约检查 ---");
console.log(checkHouseContract({ name: "玫瑰小屋", color: "red", floors: 2, hasGarden: true }));
console.log(checkHouseContract({ name: "蓝色小楼", color: "blue", floors: 1 }));
console.log();

console.log("--- 🏰 城堡继承 ---");
console.log(buildCastle({ name: "天鹅堡", location: "阿尔卑斯山", hasTower: true, guards: 12 }));
console.log();

console.log("--- 📖 魔法书 ---");
(Object.keys(spellBook) as Magic[]).forEach((magic) => {
  const spell = spellBook[magic];
  console.log(\`  \${spell.name.padEnd(8)} 威力: \${spell.damage}\`);
});
console.log();

console.log("--- ❌ 契约失败的演示 ---");
try {
  // 模拟传错参数（TypeScript 编译期会拦截）
  // @ts-expect-error 故意传错类型
  checkHouseContract({ name: "破屋", color: 123, floors: 0 });
} catch (e) {
  console.log(\`捕获: \${(e as Error).message}\`);
  console.log("💡 TypeScript 在写代码时就会标红：color 必须是 string，不能传 number");
}
console.log();

console.log("--- ✨ 字面量联合的魅力 ---");
// @ts-expect-error 故意写错魔法名
const wrongSpell: Magic = "lightning";
console.log(\`如果你写 'lightning' 而不是 'fire'，TypeScript 会立刻报错：\`);
console.log(\`💡 Type '"lightning"' is not assignable to type 'Magic'\`);
console.log();

console.log("=== 🎬 序章结束，下一章去拜访居民们 ===")`,
  },

  // ===========================================================
  // 第 1 章：居民们的"孩子"
  // ===========================================================
  {
    id: "tsx-story-children",
    group: "序章：初入小镇",
    icon: "👶",
    title: '居民们的"孩子"（Children 包裹学）',
    content: `# 👶 第 1 章：居民们的"孩子"

> *每一栋 React 房子都可以收养一个"孩子"——它不用写在契约里，写在标签中间就行。这个孩子就是 \`children\`。*

---

## 🌟 故事开场

在 TSX 童话镇上，每栋房子都有一扇"魔法门"。你可以往门里塞任何东西：一只小狗 🐶、一本书 📖、或者另一栋小房子 🏠。这个被塞进去的东西，就叫做 \`children\`。

\`\`\`tsx
<Card title="童话镇">
  <p>欢迎来到小镇！</p>
  <Button>点我</Button>
</Card>
\`\`\`

注意 \`<Button>点我</Button>\` 中间的"点我"——它没有作为 prop 传，而是写在标签里面。它就是 \`children\`！

---

## 🎁 孩子有 6 种形态

### 1️⃣ 字符串孩子（最简单）

\`\`\`tsx
<Card>这是纯文字</Card>
// Card 组件内：{children} 渲染为"这是纯文字"
\`\`\`

### 2️⃣ JSX 元素孩子（最常见）

\`\`\`tsx
<Card>
  <h1>标题</h1>
  <p>正文</p>
</Card>
\`\`\`

### 3️⃣ 数组孩子（列表常用）

\`\`\`tsx
<Card>
  {users.map(u => <div key={u.id}>{u.name}</div>)}
</Card>
\`\`\`

### 4️⃣ 函数孩子（最神奇！）

\`\`\`tsx
<DataList items={users}>
  {(user) => <div>{user.name}</div>}
</DataList>
\`\`\`

**小镇比喻**：函数孩子就像"信使"——父亲（DataList）把数据（user）交给信使，信使把数据装扮成想要的形状再送回来。

### 5️⃣ 数字/布尔孩子

\`\`\`tsx
<Card>{count}</Card>      // 数字
<Card>{isOpen && "开"}</Card>  // 布尔
\`\`\`

### 6️⃣ 啥也没有

\`\`\`tsx
<Card />    // children 是 undefined
\`\`\`

---

## 📜 在契约里给"孩子"定类型

每栋房子（组件）的契约（Props）里都可以写明"我想要什么形态的孩子"：

### 形态 A：\`React.ReactNode\`（99% 用这个）

\`\`\`tsx
// 🏠 Card 房子：什么孩子都收
type CardProps = {
  title: string;
  children: React.ReactNode;  // 字符串/数字/JSX/数组/null/undefined 都行
};

function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}
\`\`\`

**小镇比喻**：Card 是个**幼儿园老师**——什么孩子都收，最宽容。

### 形态 B：\`React.ReactElement\`（挑剔的保姆）

\`\`\`tsx
// 🏠 Tooltip 房子：只收单个 JSX 元素孩子
type TooltipProps = {
  content: string;
  children: React.ReactElement;  // 必须是单个 JSX，不能是字符串
};

function Tooltip({ content, children }: TooltipProps) {
  return (
    <span className="tooltip">
      {children}
      <span className="tip">{content}</span>
    </span>
  );
}

// ✅ 正确
<Tooltip content="提示"><button>悬停我</button></Tooltip>

// ❌ 报错：字符串不是 ReactElement
<Tooltip content="提示">纯文字</Tooltip>
\`\`\`

**小镇比喻**：Tooltip 是个**挑剔的保姆**——只收"完整的小孩"（JSX 元素），不要"光秃秃的纸条"（字符串）。

### 形态 C：函数孩子（最强大）

\`\`\`tsx
// 🏠 DataList 房子：把数据当信交给孩子函数
type DataListProps<T> = {
  items: T[];
  children: (item: T, index: number) => React.ReactNode;
};

function DataList<T>({ items, children }: DataListProps<T>) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i}>{children(item, i)}</div>
      ))}
    </div>
  );
}
\`\`\`

**小镇比喻**：DataList 是个**图书管理员**——TA 把每一本书（item）交给借书人（children 函数），借书人决定怎么展示这本书。

---

## 📊 三种孩子类型对比

| 类型 | 接受 | 小镇比喻 | 用得频率 |
|------|------|---------|---------|
| \`React.ReactNode\` | 什么都收 | 慈祥的幼儿园老师 | ⭐⭐⭐⭐⭐ 99% |
| \`React.ReactElement\` | 单个 JSX 元素 | 挑剔的保姆 | ⭐⭐ |
| 函数 | 自定义渲染 | 信使 | ⭐⭐⭐ |

---

## 🧙 高级魔法：孩子必须存在

\`\`\`tsx
type Props = { children: React.ReactNode };   // 可以没有
type Props2 = { children: React.ReactElement };  // 必须有（但 ReactElement 本身允许 undefined？不允许！）
\`\`\`

如果想强制必须有 children 又要兼容字符串等，写：

\`\`\`tsx
type Props = { children: React.ReactNode };  // 类型上允许 undefined
// 运行时检查
if (!props.children) throw new Error("必须传 children！");
\`\`\`

---

## 🎬 小剧场：Card 家族

\`\`\`tsx
// 卡片 1：文字孩子
<Card>今天天气真好！</Card>

// 卡片 2：JSX 孩子
<Card>
  <h1>童话镇日报</h1>
  <p>第 1 版：镇长今天种了一棵树</p>
</Card>

// 卡片 3：列表孩子
<Card>
  {["苹果", "香蕉", "橘子"].map(f => <li key={f}>{f}</li>)}
</Card>

// 卡片 4：函数孩子
<Card>
  {(name) => <h1>你好，{name}！</h1>}
</Card>
\`\`\`

---

## 📝 第 1 章小结

- 👶 \`children\` 是写在 JSX 标签中间的特殊 prop
- 🎁 它可以是字符串、JSX、数组、数字、布尔、甚至函数
- \`React.ReactNode\` 啥都收，是默认首选
- \`React.ReactElement\` 只收单个 JSX 元素
- 函数 children 用来做"传数据给调用方渲染"
- 99% 场景用 \`React.ReactNode\`

> *下一章，去电报员小屋学习事件处理！*`,

    code: `// 👶 TSX 童话镇 - 第 1 章 Demo：六种"孩子"形态

// ============================================================
// 🎁 模拟 React.ReactNode 类型（运行时就是 unknown）
// ============================================================
type ReactNode = unknown;

// 形态 1️⃣ 字符串孩子
function renderStringChild(): string {
  const children: ReactNode = "这是纯文字孩子";
  return String(children);
}

// 形态 2️⃣ JSX 元素孩子（这里用对象模拟）
function renderJsxChild(): string {
  const children: ReactNode = { type: "button", props: { children: "点我" } };
  return "<button>点我</button>（JSX 对象）";
}

// 形态 3️⃣ 数组孩子
function renderArrayChild(): string {
  const children: ReactNode = ["🍎", "🍌", "🍊"];
  return children.map(f => String(f)).join(" ");
}

// 形态 4️⃣ 数字/布尔孩子
function renderNumberChild(): string {
  const count: ReactNode = 42;
  const flag: ReactNode = true;
  return \`数字: \${count}，布尔: \${flag}\`;
}

// 形态 5️⃣ 函数孩子
function renderFunctionChild(): string {
  // 函数 children 接收数据，返回渲染结果
  const children = (item: { name: string; age: number }) =>
    \`<div>👤 \${item.name}（\${item.age}岁）</div>\`;

  const data = { name: "张三", age: 25 };
  return children(data);
}

// 形态 6️⃣ 没有孩子
function renderNoChild(): string {
  const children: ReactNode = undefined;
  return \`children 是 \${children}\`;
}

// ============================================================
// 📊 模拟"挑剔的保姆" vs "慈祥的老师"
// ============================================================
// ReactElement 类型：必须是单个 JSX 对象
interface ReactElement {
  type: string;
  props: Record<string, unknown>;
}

function pickyBabysitter(child: ReactElement): string {
  return \`挑剔保姆：收下了 \${child.type}\`;
}

function kindTeacher(child: ReactNode): string {
  return \`慈祥老师：收下了 [\${typeof child}]\`;
}

// ============================================================
// 🎬 演示
// ============================================================
console.log("=== 👶 六种孩子形态 ===\\n");

console.log("1️⃣  字符串孩子:", renderStringChild());
console.log("2️⃣  JSX 元素孩子:", renderJsxChild());
console.log("3️⃣  数组孩子:", renderArrayChild());
console.log("4️⃣  数字/布尔孩子:", renderNumberChild());
console.log("5️⃣  函数孩子:", renderFunctionChild());
console.log("6️⃣  没有孩子:", renderNoChild());
console.log();

console.log("=== 🏠 慈祥老师 vs 挑剔保姆 ===\\n");
const jsxChild: ReactElement = { type: "button", props: { children: "点我" } };
const strChild: ReactNode = "纯文字";

console.log("给慈祥老师（ReactNode）：");
console.log("  ", kindTeacher(jsxChild));
console.log("  ", kindTeacher(strChild));
console.log();

console.log("给挑剔保姆（ReactElement）：");
console.log("  ", pickyBabysitter(jsxChild));
console.log("  ❌ 挑剔保姆会拒绝字符串：'纯文字' is not assignable to ReactElement");
console.log();

console.log("=== ✨ 童话口诀 ===");
console.log("  默认用 ReactNode，挑剔用 ReactElement，函数孩子最强大")`,
  },
];
