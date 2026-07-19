// =============================================================
// TypeScript + React 全栈精通 - Batch 1: TS 基础类型系统
// =============================================================
// 覆盖 TypeScript 入门阶段最核心的 8 章：TS 是什么、基本类型、
// 数组与元组、枚举、联合与交叉、字面量类型、type vs interface、
// 类型断言与类型守卫。所有 demo 代码均可在 ts.transpileModule
// + target ES2020 + CommonJS 环境下直接运行。
// =============================================================

export const chapters = [
  {
    id: "tspro-intro",
    group: "一、TypeScript 基础类型系统",
    icon: "🌱",
    title: "TypeScript 是什么 & 为什么要学",
    content: `# TypeScript 是什么 & 为什么要学

## 一、为什么需要 TypeScript

JavaScript 是一门**动态弱类型**语言：变量没有类型约束，函数参数可以传任何东西，类型错误只有在运行时才暴露。小项目里这种灵活性很爽，项目一大就成了一场灾难。

\`\`\`js
// 纯 JS：一个看似无害的函数
function calculateTotal(price, quantity, discount) {
  return price * quantity - discount;
}

// 调用方可能这样写，运行时才发现错
calculateTotal('100', 2, '10'); // '100' * 2 - '10' = NaN
\`\`\`

TypeScript 的核心价值就一句话：**把错误从运行时提前到编译期**。让 IDE 在你敲完代码的瞬间就把潜在问题标红，而不是等到上线后被用户发现。

## 二、TypeScript vs JavaScript

| 维度 | JavaScript | TypeScript |
|------|-----------|-----------|
| 类型系统 | 动态类型，运行时确定 | 静态类型，编译期检查 |
| 错误发现时机 | 运行时 | 编译期（写代码时 IDE 就提示） |
| 类型标注 | 无 | 有，但可选（支持类型推断） |
| 浏览器支持 | 直接运行 | 需要编译（transpile）为 JS |
| 重构体验 | 容易改错 | 改一个类型，所有调用点都报错 |
| 大型项目协作 | 容易出 bug | 类型契约让协作更稳 |

**TypeScript 是 JavaScript 的超集**：所有合法的 JS 代码都是合法的 TS 代码。TS 只是额外加了一层类型标注，编译时这层标注会被擦除，最终产物还是 JS。

\`\`\`tsx
// 这段 JS 代码也是合法的 TS 代码
function add(a, b) {
  return a + b;
}

// TS 只是在此基础上加了类型标注
function addTyped(a: number, b: number): number {
  return a + b;
}
\`\`\`

> 类型标注是「写给编译器和 IDE 看的注释」，运行时会被完全擦除，不影响性能。

## 三、编译期错误 vs 运行时错误

这是 TS 价值的核心。看一个经典例子：

\`\`\`tsx
// 运行时错误：JS 中只有跑到这行才崩
function getUserName(id) {
  const user = users.find(u => u.id === id);
  return user.name; // 找不到时 user 是 undefined，访问 .name 直接崩
}

// 编译期错误：TS 直接告诉你这行有问题
function getUserNameTs(id: number): string {
  const user = users.find(u => u.id === id); // user: User | undefined
  return user.name; // ❌ TS 报错：user 可能是 undefined
}
\`\`\`

TS 把错误从「线上事故」变成「编辑器红线」，修复成本从「用户反馈 + 复现 + 排查」降到「看一眼提示改一行」。

| 错误类型 | 发现时机 | 修复成本 | 典型场景 |
|---------|---------|---------|---------|
| 语法错误 | 写代码时 | 极低 | IDE 高亮 |
| 类型错误 | 编译期 | 低 | TS 红线提示 |
| 运行时错误 | 运行时 | 高 | 复现 + 调试 |
| 线上 bug | 用户反馈 | 极高 | 复现 + 排查 + 紧急修复 |

## 四、TypeScript 在 React 项目中的价值

React 组件本质上就是函数，props 就是函数参数。没有 TS 时，props 的结构全靠注释和记忆，组件一多就乱套。

\`\`\`tsx
// 纯 JS：调用方根本不知道要传什么
function UserCard(props) {
  return <div>{props.name} - {props.age}</div>;
}

// 调用方可能传错
<UserCard name={123} age="twenty" />

// TS：props 结构是契约
type UserCardProps = {
  name: string;
  age: number;
};

function UserCard({ name, age }: UserCardProps) {
  return <div>{name} - {age}</div>;
}

// ❌ 调用方传错直接红线
<UserCard name={123} age="twenty" /> // Error: name 必须是 string
\`\`\`

在 React 项目里，TS 带来的收益至少有：

1. **Props 类型契约**：组件接口一目了然，调用方写错立刻报错。
2. **State 类型安全**：\`useState\` 的初始值类型会自动推断，\`setState\` 传错值会报错。
3. **Reducer 安全**：action 类型用联合类型约束，dispatch 错误 action 直接红线。
4. **Hook 参数**：\`useRef\`、\`useContext\` 等都有类型约束。
5. **API 响应**：fetch 拿到的数据有类型，访问不存在的字段会报错。
6. **重构不慌**：改一个 Props 字段，所有用到的地方自动标红，不用全局搜索。

## 五、类型推断：TS 不强制你处处写类型

很多场景下 TS 能根据上下文自动推断类型，不需要显式标注：

\`\`\`tsx
let count = 10;        // 推断为 number
let name = 'Alice';    // 推断为 string
let list = [1, 2, 3];  // 推断为 number[]

function add(a: number, b: number) {
  return a + b;        // 返回值自动推断为 number，不用写 : number
}
\`\`\`

**经验法则**：函数参数和返回值建议显式标注（更清晰、更安全），局部变量一般让 TS 推断（少写代码）。

## 六、TypeScript 的学习路线

1. **基础类型系统**（本批 8 章）：基本类型、数组、元组、枚举、联合/交叉、字面量、type/interface、断言与守卫。
2. **进阶类型**：泛型、条件类型、映射类型、infer、内置工具类型。
3. **类型编程**：类型递归、分布式条件类型、模板字面量类型。
4. **工程化**：tsconfig 配置、声明文件、模块解析、与构建工具集成。
5. **React + TS**：组件 Props、Hook 类型、Context、Refs、状态管理集成。

## 小结

- TS = JS + 静态类型，编译期擦除类型后还是 JS。
- 核心价值：**把错误从运行时提前到编译期**。
- 在 React 项目里：Props 契约、State 安全、Reducer 安全、API 响应类型化。
- 类型推断让 TS 不必处处写类型，关键位置标注即可。
- 学习路线：基础类型 → 进阶类型 → 类型编程 → 工程化 → React + TS。

下一章开始，我们从最基础的类型讲起。
`,
    code: `// TypeScript 入门 Demo：对比 JS 与 TS 写同一个函数时，TS 如何拦截错误
// 沙箱用 ts.transpileModule + target ES2020 + CommonJS 执行

// ===== 1. 纯 JS 风格：类型不约束，运行时才暴露问题 =====
// 这段代码在 TS 里也能跑，因为 JS 是 TS 的子集
function jsAdd(a, b) {
  // 没有类型标注，a 和 b 可以是任何东西
  return a + b;
}
console.log('jsAdd(1, 2) =', jsAdd(1, 2));      // 3
console.log("jsAdd(1, '2') =", jsAdd(1, '2'));  // '12'，字符串拼接，不是数学加法！

// ===== 2. TS 风格：加类型标注，编译期就拦截错误 =====
function tsAdd(a: number, b: number): number {
  // a 和 b 都必须是 number，返回值也是 number
  return a + b;
}
console.log('tsAdd(1, 2) =', tsAdd(1, 2));      // 3
// tsAdd(1, '2');  // ❌ 编译期报错：'2' 是 string，不能赋给 number

// ===== 3. 模拟一个常见的运行时 bug：访问 undefined 的属性 =====
type User = { id: number; name: string };
const users: User[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

// TS 风格：find 返回 User | undefined，TS 强制你处理 undefined
function getUserNameTs(id: number): string {
  const u = users.find(u => u.id === id); // u 的类型是 User | undefined
  if (u === undefined) {
    return 'unknown'; // 必须显式处理 undefined 分支
  }
  return u.name;
}
console.log('getUserNameTs(1) =', getUserNameTs(1));    // Alice
console.log('getUserNameTs(99) =', getUserNameTs(99));  // unknown

// ===== 4. 类型推断：很多场景不需要显式写类型 =====
const count = 10;          // TS 推断为 number
const message = 'hello';   // TS 推断为 string
const list = [1, 2, 3];    // TS 推断为 number[]
console.log('count =', count, '| message =', message, '| list =', list);

// ===== 5. React 场景模拟：Props 类型契约 =====
type UserCardProps = { name: string; age: number };

// 模拟一个 React 组件（这里用普通函数演示类型约束）
function renderUserCard(props: UserCardProps): string {
  return props.name + ' - ' + props.age + ' years old';
}
// 正确调用
console.log('renderUserCard =', renderUserCard({ name: 'Alice', age: 25 }));
// 错误调用会被 TS 拦截（这里注释掉，取消注释会编译报错）
// renderUserCard({ name: 123, age: 'twenty' }); // ❌ name 必须是 string

console.log('=== Demo 结束 ===');
`,
  },
  {
    id: "tspro-basic-types",
    group: "一、TypeScript 基础类型系统",
    icon: "📘",
    title: "TypeScript 基本类型全解",
    content: `# TypeScript 基本类型全解

## 一、为什么需要这么多基本类型

JS 本身就有 number、string、boolean、null、undefined 这些值，TS 在此基础上补全了 void、never、any、unknown 等类型，目的是**精确表达「值可能出现的状态」**。

类型越精确，TS 能帮你拦截的错误就越多。比如一个函数返回 \`never\`，TS 就知道这个函数后面的代码不会执行；一个变量是 \`unknown\`，TS 就强制你在用之前先收窄类型。

## 二、原始类型：number / string / boolean

\`\`\`tsx
let age: number = 25;
let price: number = 9.99;
let hex: number = 0xff;      // 十六进制
let big: bigint = 100n;      // bigint 是单独类型，不是 number

let name: string = 'Alice';
let greeting: string = \`Hello \${name}\`;  // 模板字符串也是 string

let isDone: boolean = true;
let hasError: boolean = false;
\`\`\`

> 注意：\`bigint\` 和 \`number\` 是两个独立类型，不能互相赋值，也不能混合运算。

## 三、null 与 undefined：两个独立的类型

\`\`\`tsx
let u: undefined = undefined;
let n: null = null;
\`\`\`

- \`undefined\`：变量声明了但没赋值。
- \`null\`：明确表示「空值」，需要主动赋值。

在默认配置（\`strictNullChecks: true\`）下，\`null\` 和 \`undefined\` **只能赋给它们自己或 \`void\`**，不能赋给其他类型。这是 TS 最有用的安全特性之一：

\`\`\`tsx
let name: string = 'Alice';
name = null;      // ❌ 报错：null 不能赋给 string
name = undefined; // ❌ 报错：undefined 不能赋给 string

// 如果确实可能为空，要用联合类型
let nameOrNull: string | null = 'Alice';
nameOrNull = null; // ✅ OK
\`\`\`

## 四、void：函数没有返回值

\`void\` 表示「函数不返回任何有意义的值」，通常用于副作用函数（打印、修改外部状态、发起请求等）。

\`\`\`tsx
function log(message: string): void {
  console.log(message);
  // 没有 return，或 return undefined
}

function saveUser(user: User): void {
  db.save(user); // 副作用：保存到数据库
}
\`\`\`

> \`void\` 和 \`undefined\` 的区别：\`void\` 表示「我不关心返回什么」，\`undefined\` 表示「返回值就是 undefined」。在函数返回类型上用 \`void\` 更准确。

## 五、never：永远不会有值

\`never\` 表示「这个值永远不会出现」，用于两种场景：

### 5.1 函数永远不会正常返回

\`\`\`tsx
// 抛异常：永远不会走到 return
function throwError(msg: string): never {
  throw new Error(msg);
}

// 死循环：永远不会结束
function infiniteLoop(): never {
  while (true) {}
}
\`\`\`

### 5.2 联合类型穷尽检查

\`\`\`tsx
type Shape = 'circle' | 'square';

function getArea(shape: Shape): number {
  switch (shape) {
    case 'circle': return Math.PI;
    case 'square': return 4;
    default:
      // shape 在这里被推断为 never
      // 如果将来给 Shape 加了 'triangle'，这里会报错
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
\`\`\`

这是 \`never\` 最实用的用法：**保证联合类型被完全处理**，新增成员时编译器自动提醒。

## 六、any：关闭类型检查

\`any\` 是 TS 的「逃生舱」，表示「任意类型」，等同于回到 JS 模式。用了 \`any\` 就等于放弃了 TS 的保护。

\`\`\`tsx
let anything: any = 1;
anything = 'hello';   // OK
anything = true;      // OK
anything.foo();       // OK（运行时崩，TS 不拦）
anything[0] = 'x';    // OK（TS 不拦）
\`\`\`

> **经验法则**：\`any\` 只在两种场景下用：1) 迁移老 JS 代码时临时过渡；2) 类型系统确实表达不了的极少数场景。其他情况一律避免。

## 七、unknown：类型安全的 any

\`unknown\` 是 TS 3.0 引入的「类型安全的 any」：它可以接收任何值，但**用之前必须先收窄类型**。

\`\`\`tsx
let value: unknown = 1;
value = 'hello';  // OK
value = true;     // OK

// 直接用会报错
value.toFixed();  // ❌ 报错：value 是 unknown，不能直接调用方法

// 必须先收窄
if (typeof value === 'number') {
  value.toFixed(); // ✅ OK，这里 value 被收窄为 number
}
\`\`\`

## 八、any vs unknown：关键区别

| 维度 | \`any\` | \`unknown\` |
|------|-------|----------|
| 能否接收任意值 | ✅ | ✅ |
| 能否直接访问属性 | ✅（不安全） | ❌（必须先收窄） |
| 能否赋给其他类型 | ✅（不安全） | ❌（只能赋给 any/unknown） |
| 安全性 | 不安全 | 安全 |
| 何时用 | 临时过渡、极少数场景 | 接收外部数据（API 响应、JSON.parse） |

\`\`\`tsx
// 典型场景：JSON.parse 返回 unknown，强制你验证后才用
const data: unknown = JSON.parse('{"name":"Alice"}');
// data.name;  // ❌ 报错
if (typeof data === 'object' && data !== null && 'name' in data) {
  console.log((data as { name: string }).name); // ✅ 安全
}
\`\`\`

## 九、基本类型速查表

| 类型 | 语义 | 典型场景 |
|------|------|---------|
| \`number\` | 数字 | 计数、价格、ID |
| \`string\` | 字符串 | 文本、名称、URL |
| \`boolean\` | 布尔 | 开关、状态 |
| \`null\` | 显式空值 | 「这里刻意没有值」 |
| \`undefined\` | 未定义 | 「这里还没赋值」 |
| \`void\` | 无返回值 | 副作用函数的返回类型 |
| \`never\` | 永不出现 | 抛异常、死循环、穷尽检查 |
| \`any\` | 任意（不安全） | 临时过渡 |
| \`unknown\` | 任意（安全） | 外部数据入口 |

## 小结

- \`number/string/boolean\` 是最基本的原始类型。
- \`null/undefined\` 在 \`strictNullChecks\` 下是独立类型，能拦截大量空值 bug。
- \`void\` 用于副作用函数的返回类型。
- \`never\` 用于抛异常、死循环、联合类型穷尽检查。
- \`any\` 是逃生舱，能不用就不用；\`unknown\` 是安全的 \`any\`，外部数据先用 \`unknown\` 接收再收窄。
`,
    code: `// TypeScript 基本类型全解 Demo
// 演示 number / string / boolean / null / undefined / void / never / any / unknown

// ===== 1. 原始类型：number / string / boolean =====
const age: number = 25;           // 数字类型，整数浮点都算
const price: number = 9.99;
const hex: number = 0xff;         // 十六进制也是 number
console.log('age =', age, '| price =', price, '| hex =', hex);

const name: string = 'Alice';     // 字符串类型
const greeting: string = 'Hello, ' + name + '!';  // 用 + 拼接
console.log('name =', name, '| greeting =', greeting);

const isDone: boolean = true;     // 布尔类型
const hasError: boolean = false;
console.log('isDone =', isDone, '| hasError =', hasError);

// ===== 2. null 与 undefined：两个独立类型 =====
// strictNullChecks 开启后，null/undefined 不能赋给其他类型
let u: undefined = undefined;
let n: null = null;
console.log('u =', u, '| n =', n);

// 联合类型：可能为 null 的场景
let nameOrNull: string | null = 'Alice';
nameOrNull = null;                // OK，因为类型是 string | null
console.log('nameOrNull =', nameOrNull);

// ===== 3. void：函数没有返回值 =====
function logMessage(msg: string): void {
  // void 表示「我不关心返回什么」，通常用于副作用函数
  console.log('[LOG]', msg);
  // 没有 return，或 return undefined 都算 void
}
logMessage('this is a void function');

// ===== 4. never：永远不会有值 =====
// 场景 1：抛异常，永远不会正常返回
function throwError(msg: string): never {
  throw new Error(msg);           // throw 之后代码不会执行
}

// 场景 2：死循环，永远不会结束
function infiniteLoop(): never {
  while (true) {
    // 死循环
    break; // 为了让 demo 能跑完，这里 break 一下，实际写 never 函数不要这样
  }
  // 这里实际不会执行，但 TS 要求返回 never
  throw new Error('unreachable');
}

// 场景 3：联合类型穷尽检查
type Shape = 'circle' | 'square';
function getArea(shape: Shape): number {
  switch (shape) {
    case 'circle':
      return Math.PI;             // 圆的面积
    case 'square':
      return 4;                   // 正方形面积（边长为 2）
    default:
      // shape 在这里被推断为 never，保证联合类型被完全处理
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
console.log('getArea(circle) =', getArea('circle'));
console.log('getArea(square) =', getArea('square'));

// ===== 5. any：关闭类型检查（逃生舱，慎用） =====
let anything: any = 1;
anything = 'hello';               // OK，any 接收任何值
anything = true;                  // OK
console.log('anything =', anything);

// ===== 6. unknown：类型安全的 any =====
let value: unknown = 1;
value = 'hello';                  // OK，unknown 接收任何值
value = true;                     // OK
console.log('value =', value);

// 直接用会报错，必须先收窄类型
if (typeof value === 'boolean') {
  // 这里 value 被收窄为 boolean
  console.log('value is boolean:', value);
}

// ===== 7. any vs unknown 的关键区别 =====
// any 可以直接赋给其他类型（不安全）
const fromAny: number = anything as number;  // OK，但运行时可能不是 number
console.log('fromAny =', fromAny);

// unknown 不能直接赋给其他类型，必须先收窄
// const fromUnknown: number = value;  // ❌ 报错
if (typeof value === 'boolean') {
  const fromUnknown: boolean = value;        // ✅ OK，已收窄
  console.log('fromUnknown =', fromUnknown);
}

console.log('=== Demo 结束 ===');
`,
  },
  {
    id: "tspro-array-tuple",
    group: "一、TypeScript 基础类型系统",
    icon: "📦",
    title: "数组与元组（Array / Tuple）",
    content: `# 数组与元组（Array / Tuple）

## 一、为什么需要专门的数组类型

JS 的数组可以装任何类型的东西，\`[1, 'hello', true]\` 也合法。但实际开发中，绝大多数数组都是「同质」的（全是 number 或全是 string）。TS 的数组类型就是用来约束「这个数组里只能放某一类东西」。

## 二、数组类型的两种写法

\`\`\`tsx
// 写法 1：T[] —— 最常用
let nums: number[] = [1, 2, 3];
let names: string[] = ['Alice', 'Bob'];

// 写法 2：Array<T> —— 泛型写法
let nums2: Array<number> = [1, 2, 3];
let names2: Array<string> = ['Alice', 'Bob'];
\`\`\`

两种写法完全等价，**推荐用 \`T[]\`**，更简洁。泛型写法 \`Array<T>\` 在某些复杂类型（如联合类型数组）里可读性更好：

\`\`\`tsx
// 联合类型数组：两种写法对比
let mixed: (number | string)[];        // T[] 写法，括号容易看漏
let mixed2: Array<number | string>;    // 泛型写法，更清晰
\`\`\`

## 三、数组操作与类型安全

\`\`\`tsx
const nums: number[] = [1, 2, 3];

nums.push(4);        // ✅ OK
nums.push('4');      // ❌ 报错：'4' 是 string

nums[0] = 10;        // ✅ OK
nums[0] = '10';      // ❌ 报错

const first: number = nums[0];  // ✅ 类型是 number
\`\`\`

> 注意：TS 不会检查数组越界。\`nums[100]\` 在 TS 里类型是 \`number\`（不是 \`number | undefined\`），但运行时是 \`undefined\`。开启 \`noUncheckedIndexedAccess\` 选项可以收紧这个检查。

## 四、只读数组：readonly

\`\`\`tsx
const nums: readonly number[] = [1, 2, 3];
// 或：const nums: ReadonlyArray<number> = [1, 2, 3];

nums.push(4);    // ❌ 报错：readonly 数组不能修改
nums[0] = 10;    // ❌ 报错
nums.length;     // ✅ OK，读可以
nums.map(x => x * 2);  // ✅ OK，map 返回新数组
\`\`\`

> \`const\` 和 \`readonly\` 的区别：\`const\` 锁的是变量绑定（不能重新赋值），\`readonly\` 锁的是数组内容（不能 push/pop/splice）。

## 五、元组（Tuple）：固定长度和类型的数组

元组是「**长度固定、每个位置类型已知**」的数组。和普通数组的区别：普通数组是「同质集合」，元组是「异质但结构固定」。

\`\`\`tsx
// 元组：长度固定为 3，类型依次是 string / number / boolean
const user: [string, number, boolean] = ['Alice', 25, true];

const name: string = user[0];    // ✅ 类型是 string
const age: number = user[1];     // ✅ 类型是 number
const active: boolean = user[2]; // ✅ 类型是 boolean

user[3];  // ❌ 报错：元组长度是 3，没有第 4 个
\`\`\`

元组最常见的用法是**表示固定结构的成对数据**：

\`\`\`tsx
// 坐标
type Point = [number, number];
const p: Point = [10, 20];

// 键值对
type Entry = [string, number];
const entries: Entry[] = [['a', 1], ['b', 2]];

// React 的 useState 返回值就是元组
// const [state, setState] = useState(0);  // 返回 [number, (n: number) => void]
\`\`\`

## 六、可选元素与剩余元素

\`\`\`tsx
// 可选元素：用 ? 标记
type UserTuple = [string, number, boolean?];
const u1: UserTuple = ['Alice', 25];        // ✅ 第三个可选
const u2: UserTuple = ['Alice', 25, true];  // ✅
const u3: UserTuple = ['Alice'];            // ❌ 缺第二个

// 剩余元素：用 ... 展开
type StringNumberBooleans = [string, number, ...boolean[]];
const s1: StringNumberBooleans = ['Alice', 25];              // ✅ 后面 0 个 boolean
const s2: StringNumberBooleans = ['Alice', 25, true];        // ✅ 后面 1 个 boolean
const s3: StringNumberBooleans = ['Alice', 25, true, false]; // ✅ 后面 2 个 boolean
\`\`\`

## 七、只读元组：readonly tuple

\`\`\`tsx
const user: readonly [string, number] = ['Alice', 25];
user[0] = 'Bob';  // ❌ 报错：readonly

// 更推荐用 as const 推断只读元组（见字面量类型章节）
const point = [10, 20] as const;  // readonly [10, 20]
\`\`\`

## 八、元组 vs 数组：何时用哪个

| 维度 | 数组 \`T[]\` | 元组 \`[A, B, C]\` |
|------|-----------|------------------|
| 长度 | 任意 | 固定（或有固定前缀） |
| 元素类型 | 同质 | 可异质 |
| 语义 | 「一堆同类的数据」 | 「一组结构固定的数据」 |
| 典型场景 | 列表、集合、配置项 | 坐标、键值对、函数返回多值 |
| 索引访问 | 类型统一 | 每个位置类型不同 |

**经验法则**：
- 数据是「同质列表」用数组。
- 数据是「固定结构」用元组。
- 元组超过 3-4 个元素时，建议改用 \`type\` 或 \`interface\` 定义对象，可读性更好。

\`\`\`tsx
// 元组超过 3 个元素，可读性下降，建议改用对象
// ❌ 不推荐：[string, number, boolean, string, number]
type BadUser = [string, number, boolean, string, number];

// ✅ 推荐：字段有名字，更清晰
type GoodUser = {
  name: string;
  age: number;
  active: boolean;
  email: string;
  score: number;
};
\`\`\`

## 小结

- 数组两种写法：\`T[]\`（推荐）和 \`Array<T>\`（复杂类型更清晰）。
- \`readonly\` 修饰的数组不能修改内容，但能读取和 map。
- 元组是「固定长度、固定类型」的数组，用于结构固定的数据。
- 元素超过 3-4 个时，改用对象类型更可读。
- React 的 \`useState\` 返回值就是元组：\`[state, setState]\`。
`,
    code: `// 数组与元组 Demo
// 演示 Array 和 Tuple 的用法

// ===== 1. 数组类型两种写法 =====
const nums: number[] = [1, 2, 3, 4, 5];              // T[] 写法，最常用
const nums2: Array<number> = [10, 20, 30];           // Array<T> 泛型写法
console.log('nums =', nums, '| nums2 =', nums2);

// 字符串数组
const names: string[] = ['Alice', 'Bob', 'Charlie'];
console.log('names =', names);

// ===== 2. 联合类型数组：装多种类型 =====
const mixed: (number | string)[] = [1, 'hello', 2, 'world'];
console.log('mixed =', mixed);

// ===== 3. 数组操作与类型安全 =====
const list: number[] = [1, 2, 3];
list.push(4);                          // ✅ OK，push 一个 number
// list.push('4');                     // ❌ 报错：'4' 是 string
console.log('list after push =', list);

list[0] = 100;                         // ✅ OK，索引赋值
console.log('list after set =', list);

// ===== 4. 只读数组：readonly =====
const readonlyNums: readonly number[] = [1, 2, 3];
// readonlyNums.push(4);              // ❌ 报错：readonly 不能修改
// readonlyNums[0] = 10;              // ❌ 报错
console.log('readonlyNums =', readonlyNums);
console.log('readonlyNums.length =', readonlyNums.length);  // ✅ 读可以
console.log('readonlyNums.map =', readonlyNums.map(x => x * 2));  // ✅ map 返回新数组

// ===== 5. 元组：固定长度和类型 =====
const user: [string, number, boolean] = ['Alice', 25, true];
// 每个位置类型已知，可以安全解构
const userName: string = user[0];
const userAge: number = user[1];
const userActive: boolean = user[2];
console.log('userName =', userName, '| userAge =', userAge, '| userActive =', userActive);
// user[3];  // ❌ 报错：元组长度是 3，没有第 4 个

// ===== 6. 元组解构 =====
const [n, a, active] = user;           // 解构时类型自动推断
console.log('destructured: name =', n, '| age =', a, '| active =', active);

// ===== 7. 元组的典型用法 =====
// 坐标
type Point = [number, number];
const p: Point = [10, 20];
console.log('point =', p);

// 键值对列表
type Entry = [string, number];
const entries: Entry[] = [['a', 1], ['b', 2], ['c', 3]];
console.log('entries =', entries);

// 模拟 React useState 返回值
function useState(initial: number): [number, (n: number) => void] {
  let state = initial;
  const setState = (n: number) => { state = n; };
  return [state, setState];
}
const [count, setCount] = useState(0);
console.log('useState count =', count);
setCount(5);
console.log('useState after setCount(5) =', count);  // 注意：这里还是 0，因为没有响应式

// ===== 8. 可选元素与剩余元素 =====
type UserTuple = [string, number, boolean?];
const u1: UserTuple = ['Alice', 25];           // 第三个可选
const u2: UserTuple = ['Bob', 30, true];       // 三个都有
console.log('u1 =', u1, '| u2 =', u2);

type StringNumberBooleans = [string, number, ...boolean[]];
const s1: StringNumberBooleans = ['Alice', 25];
const s2: StringNumberBooleans = ['Bob', 30, true, false];
console.log('s1 =', s1, '| s2 =', s2);

// ===== 9. 只读元组 =====
const readonlyUser: readonly [string, number] = ['Alice', 25];
// readonlyUser[0] = 'Bob';  // ❌ 报错：readonly
console.log('readonlyUser =', readonlyUser);

console.log('=== Demo 结束 ===');
`,
  },
  {
    id: "tspro-enum",
    group: "一、TypeScript 基础类型系统",
    icon: "🏷️",
    title: "枚举（enum）完整指南",
    content: `# 枚举（enum）完整指南

## 一、为什么需要枚举

JS 里表达「有限个常量」通常用字符串常量或对象：

\`\`\`js
const Status = { Pending: 'Pending', Success: 'Success', Failed: 'Failed' };
// 或：const status = 'pending' | 'success' | 'failed';
\`\`\`

写法零散，没有统一约束。TS 的 \`enum\` 就是为了**用一种结构化的方式定义一组命名常量**。

\`\`\`tsx
enum Status {
  Pending = 'Pending',
  Success = 'Success',
  Failed = 'Failed',
}

function handle(status: Status) {
  if (status === Status.Pending) { /* ... */ }
}
\`\`\`

## 二、数字枚举

不赋值时，TS 会自动从 0 开始递增：

\`\`\`tsx
enum Direction {
  Up,      // 0
  Down,    // 1
  Left,    // 2
  Right,   // 3
}

// 也可以手动指定起始值，后续自动递增
enum HttpStatus {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
}
\`\`\`

### 数字枚举的反向映射

数字枚举编译后会生成一个**双向映射**的对象，可以用值反查名字：

\`\`\`tsx
enum Direction { Up, Down, Left, Right }

Direction.Up;          // 0
Direction[0];          // 'Up'  ← 反向映射
Direction[Direction.Up]; // 'Up'
\`\`\`

编译后的 JS：

\`\`\`js
var Direction;
(function (Direction) {
  Direction[Direction['Up'] = 0] = 'Up';
  Direction[Direction['Down'] = 1] = 'Down';
  // ...
})(Direction || (Direction = {}));
\`\`\`

## 三、字符串枚举

字符串枚举每个成员必须显式赋值，没有自增：

\`\`\`tsx
enum Color {
  Red = 'RED',
  Green = 'GREEN',
  Blue = 'BLUE',
}

const c: Color = Color.Red;
console.log(c);  // 'RED'
\`\`\`

字符串枚举**没有反向映射**（编译后只有正向映射），因为字符串本身就是有意义的值。调试时输出 \`'RED'\` 比 \`0\` 更直观，所以**实际项目优先用字符串枚举**。

\`\`\`tsx
// 字符串枚举
Color.Red;        // 'RED'
Color['RED'];     // ❌ undefined，没有反向映射
\`\`\`

## 四、异构枚举（Heterogeneous Enum）

数字和字符串混用的枚举，**不推荐使用**，容易出 bug：

\`\`\`tsx
// ❌ 不推荐：数字和字符串混用
enum Mixed {
  No = 0,
  Yes = 'YES',
}
\`\`\`

> 经验法则：枚举要么全用数字，要么全用字符串。不要混用。

## 五、const enum：编译期内联

普通枚举编译后会生成一个对象。\`const enum\` 编译时会被**完全内联**，不会生成任何运行时代码：

\`\`\`tsx
const enum Direction {
  Up,
  Down,
}

const d = Direction.Up;
// 编译后直接变成：const d = 0;
\`\`\`

| 维度 | 普通 enum | const enum |
|------|----------|------------|
| 编译产物 | 生成一个对象 | 完全内联，无产物 |
| 反向映射 | 数字枚举有 | 没有 |
| 运行时能否访问 | 能 | 不能（已被内联替换） |
| 性能 | 多一次属性访问 | 直接用字面量 |
| 适用场景 | 需要运行时遍历枚举 | 只用作常量比较 |

> 注意：\`isolatedModules\` 模式下（如 Vite、Next.js 默认开启）\`const enum\` 会有兼容问题，新项目建议直接用普通枚举或「联合字面量类型 + as const 对象」替代。

## 六、计算成员

枚举成员的值可以是表达式（计算成员），但**计算成员后面的成员必须显式赋值**：

\`\`\`tsx
enum FileAccess {
  // 常量成员
  None = 0,
  Read = 1 << 1,    // 2，位运算
  Write = 1 << 2,   // 4
  ReadWrite = Read | Write,  // 6，引用其他成员
  // 计算成员
  G = '123'.length,  // 3，运行时计算
}
\`\`\`

## 七、枚举的常见用法

### 7.1 状态机

\`\`\`tsx
enum OrderStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
}

function canCancel(status: OrderStatus): boolean {
  return status === OrderStatus.Pending || status === OrderStatus.Paid;
}
\`\`\`

### 7.2 位标志（Bit Flags）

\`\`\`tsx
enum Permission {
  None = 0,
  Read = 1 << 0,    // 001 = 1
  Write = 1 << 1,   // 010 = 2
  Execute = 1 << 2, // 100 = 4
}

const p = Permission.Read | Permission.Write;  // 3 = 011
const canWrite = (p & Permission.Write) !== 0; // true
\`\`\`

## 八、枚举的替代方案：联合字面量类型

很多时候不需要枚举，用**字面量联合类型 + as const 对象**更轻量：

\`\`\`tsx
// 用对象 + as const 模拟枚举
const Status = {
  Pending: 'Pending',
  Success: 'Success',
  Failed: 'Failed',
} as const;

type Status = typeof Status[keyof typeof Status];  // 'Pending' | 'Success' | 'Failed'

function handle(status: Status) {
  if (status === Status.Pending) { /* ... */ }
}
\`\`\`

| 维度 | enum | 联合字面量 + as const |
|------|------|---------------------|
| 运行时存在 | 有（编译成对象） | 有（你写的对象） |
| 反向映射 | 数字枚举有 | 没有 |
| 工具类型支持 | 一般 | 更好（ keyof / Pick 等） |
| 摇树优化 | 一般 | 好 |
| 推荐场景 | 需要枚举语义、位标志 | 大多数场景 |

## 小结

- 数字枚举：自增，有反向映射；字符串枚举：需显式赋值，无反向映射，更易调试。
- \`const enum\` 编译期内联，但 \`isolatedModules\` 下有兼容问题，新项目慎用。
- 异构枚举（数字字符串混用）不推荐。
- 位标志枚举用位移运算组合权限。
- 很多场景可以用「联合字面量 + as const 对象」替代枚举，更轻量、工具类型更友好。
`,
    code: `// 枚举完整指南 Demo
// 演示数字枚举、字符串枚举、const enum、反向映射、计算成员

// ===== 1. 数字枚举：自增，从 0 开始 =====
enum Direction {
  Up,       // 0
  Down,     // 1
  Left,     // 2
  Right,    // 3
}
console.log('Direction.Up =', Direction.Up);       // 0
console.log('Direction.Down =', Direction.Down);   // 1

// 数字枚举的反向映射：可以用值反查名字
console.log('Direction[0] =', Direction[0]);       // 'Up'
console.log('Direction[Direction.Up] =', Direction[Direction.Up]); // 'Up'

// ===== 2. 手动指定起始值 =====
enum HttpStatus {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
}
console.log('HttpStatus.OK =', HttpStatus.OK);
console.log('HttpStatus.NotFound =', HttpStatus.NotFound);

// ===== 3. 字符串枚举：必须显式赋值，无反向映射 =====
enum Color {
  Red = 'RED',
  Green = 'GREEN',
  Blue = 'BLUE',
}
const c: Color = Color.Red;
console.log('Color.Red =', c);   // 'RED'
// Color['RED'];  // ❌ undefined，字符串枚举没有反向映射

// ===== 4. 枚举的典型用法：状态机 =====
enum OrderStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
}

function canCancel(status: OrderStatus): boolean {
  // 只有 Pending 或 Paid 状态可以取消
  return status === OrderStatus.Pending || status === OrderStatus.Paid;
}
console.log('canCancel(Pending) =', canCancel(OrderStatus.Pending));    // true
console.log('canCancel(Shipped) =', canCancel(OrderStatus.Shipped));    // false

function describeStatus(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.Pending: return 'waiting for payment';
    case OrderStatus.Paid: return 'paid, waiting for shipment';
    case OrderStatus.Shipped: return 'shipped, on the way';
    case OrderStatus.Delivered: return 'delivered';
    case OrderStatus.Cancelled: return 'cancelled';
  }
}
console.log('describeStatus(Paid) =', describeStatus(OrderStatus.Paid));

// ===== 5. 位标志枚举：用位移组合权限 =====
enum Permission {
  None = 0,
  Read = 1 << 0,     // 001 = 1
  Write = 1 << 1,    // 010 = 2
  Execute = 1 << 2,  // 100 = 4
}
const myPermission = Permission.Read | Permission.Write;  // 3 = 011
console.log('myPermission =', myPermission);
const canWrite = (myPermission & Permission.Write) !== 0;  // 检查是否有 Write 权限
const canExecute = (myPermission & Permission.Execute) !== 0;
console.log('canWrite =', canWrite, '| canExecute =', canExecute);

// ===== 6. 计算成员：枚举值可以是表达式 =====
enum FileAccess {
  None = 0,
  Read = 1 << 1,           // 2，位运算
  Write = 1 << 2,          // 4
  ReadWrite = Read | Write, // 6，引用其他成员
  Computed = 'abc'.length, // 3，运行时计算
}
console.log('FileAccess.Read =', FileAccess.Read);
console.log('FileAccess.ReadWrite =', FileAccess.ReadWrite);
console.log('FileAccess.Computed =', FileAccess.Computed);

// ===== 7. 枚举的替代方案：联合字面量 + as const 对象 =====
const Status = {
  Pending: 'Pending',
  Success: 'Success',
  Failed: 'Failed',
} as const;

type StatusType = typeof Status[keyof typeof Status];  // 'Pending' | 'Success' | 'Failed'

function handle(status: StatusType): string {
  if (status === Status.Pending) return 'loading...';
  if (status === Status.Success) return 'done!';
  return 'error';
}
console.log('handle(Pending) =', handle(Status.Pending));
console.log('handle(Success) =', handle(Status.Success));
console.log('handle(Failed) =', handle(Status.Failed));

// 遍历枚举的键
console.log('Status keys =', Object.keys(Status));
console.log('Status values =', Object.values(Status));

console.log('=== Demo 结束 ===');
`,
  },
  {
    id: "tspro-union-intersection",
    group: "一、TypeScript 基础类型系统",
    icon: "🔀",
    title: "联合类型与交叉类型",
    content: `# 联合类型与交叉类型

## 一、为什么需要联合和交叉

实际开发中，一个值的类型往往不是单一的：

- 一个变量可能是 \`string\` 也可能是 \`number\`。
- 一个对象既要有 \`User\` 的字段，又要有 \`Admin\` 的字段。

TS 用 \`|\`（联合）和 \`&\`（交叉）来表达这两种关系。这是 TS 类型系统的核心组合手段，几乎每天都会用到。

## 二、联合类型（Union）：「或」

联合类型表示「值可以是这些类型中的任意一个」。

\`\`\`tsx
let id: string | number;
id = 'abc';   // ✅ OK
id = 123;     // ✅ OK
id = true;    // ❌ 报错

// 函数参数：接收多种类型
function formatId(id: string | number): string {
  return 'ID-' + id;
}
\`\`\`

### 联合类型的常见场景

\`\`\`tsx
// 1. 多种可能的返回值
type Response = User | Error;

// 2. 多种状态
type State = 'idle' | 'loading' | 'success' | 'error';

// 3. 可选字段的简写
type User = { name: string; age: number | null };

// 4. 数组元素可以是多种类型
const list: (string | number)[] = [1, 'hello', 2, 'world'];
\`\`\`

## 三、联合类型如何收窄（Narrowing）

联合类型变量不能直接访问所有类型的共有方法，必须先收窄：

\`\`\`tsx
function process(value: string | number) {
  // value.toLowerCase();  // ❌ 报错：number 没有 toLowerCase
  // value.toFixed();      // ❌ 报错：string 没有 toFixed

  if (typeof value === 'string') {
    value.toUpperCase();   // ✅ 这里 value 是 string
  } else {
    value.toFixed(2);      // ✅ 这里 value 是 number
  }
}
\`\`\`

TS 的类型收窄机制会在条件分支里自动推断出更精确的类型。常用收窄手段：

1. \`typeof\`：判断原始类型。
2. \`instanceof\`：判断类的实例。
3. \`in\`：判断对象是否有某属性。
4. 自定义类型守卫（见后续章节）。

## 四、交叉类型（Intersection）：「且」

交叉类型表示「同时满足这些类型」，把多个类型合并成一个。

\`\`\`tsx
type User = { name: string; age: number };
type Admin = { role: 'admin'; permissions: string[] };

type AdminUser = User & Admin;
// 等价于 { name: string; age: number; role: 'admin'; permissions: string[] }

const admin: AdminUser = {
  name: 'Alice',
  age: 25,
  role: 'admin',
  permissions: ['read', 'write'],
};
\`\`\`

### 交叉类型的常见场景

\`\`\`tsx
// 1. 组合多个能力
type WithId = { id: number };
type WithTimestamp = { createdAt: Date; updatedAt: Date };
type Entity = WithId & WithTimestamp;

// 2. 扩展基础类型
type BaseUser = { name: string; age: number };
type UserWithEmail = BaseUser & { email: string };

// 3. React HOC 注入 props
type WithLoading = { loading: boolean };
type OwnProps = { data: string };
type Props = OwnProps & WithLoading;
\`\`\`

## 五、何时用联合，何时用交叉

| 场景 | 用什么 | 例子 |
|------|-------|------|
| 值可能是 A 或 B | 联合 \`A | B\` | \`string | number\` |
| 对象同时具备 A 和 B 的字段 | 交叉 \`A & B\` | \`User & Admin\` |
| 函数参数支持多种类型 | 联合 | \`id: string | number\` |
| 组合多个接口的能力 | 交叉 | \`WithId & WithTimestamp\` |
| 状态机 | 联合（字面量） | \`'idle' | 'loading' | 'done'\` |

**记忆口诀**：
- 联合是「或」，把类型范围**扩大**（满足任意一个即可）。
- 交叉是「且」，把类型范围**缩小**（必须全部满足）。

\`\`\`tsx
// 联合：范围扩大，能赋的值更多
type A = string | number;  // string 或 number 都行

// 交叉：范围缩小，要求更严格
type B = { name: string } & { age: number };  // 必须同时有 name 和 age
\`\`\`

## 六、交叉类型的常见坑

### 6.1 同名字段类型冲突

\`\`\`tsx
type A = { kind: 'a' };
type B = { kind: 'b' };
type C = A & B;
// C 的 kind 类型是 'a' & 'b' = never
// 因为没有任何字符串能同时是 'a' 和 'b'
const c: C = { kind: 'a' };  // ❌ 报错：kind 是 never
\`\`\`

### 6.2 函数参数的交叉不是你想的那样

\`\`\`tsx
type F1 = (x: { a: string }) => void;
type F2 = (x: { b: number }) => void;
type F = F1 & F2;

const f: F = (x) => {
  // x 的类型是 { a: string } & { b: number }
  // 必须同时有 a 和 b
  console.log(x.a, x.b);
};
f({ a: 'hello', b: 1 });  // ✅ 调用时要传所有参数的并集
\`\`\`

> 函数的交叉类型表示「这个函数能同时满足两个签名」，调用时参数要满足**所有签名的并集**。

### 6.3 联合类型的成员访问只能用「共有」部分

\`\`\`tsx
type Cat = { meow: () => void };
type Dog = { bark: () => void };

function speak(animal: Cat | Dog) {
  // animal.meow();  // ❌ 报错：Dog 没有 meow
  // animal.bark();  // ❌ 报错：Cat 没有 bark
}
\`\`\`

只有「所有成员都有」的属性才能直接访问。

## 七、联合类型与联合分发

联合类型在条件类型里会**分发**：

\`\`\`tsx
type ToArray<T> = T extends any ? T[] : never;

type R = ToArray<string | number>;
// 分发：ToArray<string> | ToArray<number> = string[] | number[]
// 不是 (string | number)[]
\`\`\`

想阻止分发，用方括号包裹：

\`\`\`tsx
type ToArrayNoDist<T> = [T] extends [any] ? T[] : never;
type R2 = ToArrayNoDist<string | number>;  // (string | number)[]
\`\`\`

## 八、实战：用联合 + 字面量做判别联合（Discriminated Union）

这是 TS 里最强大的模式之一，用「共有字段」做判别：

\`\`\`tsx
type Result =
  | { status: 'success'; data: string }
  | { status: 'error'; message: string };

function handle(result: Result) {
  if (result.status === 'success') {
    console.log(result.data);    // ✅ 收窄为 success 分支
  } else {
    console.log(result.message); // ✅ 收窄为 error 分支
  }
}
\`\`\`

判别联合在 React 里非常常用：状态机、异步请求结果、Redux action 都靠它。

## 小结

- 联合 \`A | B\`：值是 A 或 B，范围扩大。
- 交叉 \`A & B\`：值同时满足 A 和 B，范围缩小。
- 联合类型变量只能访问所有成员共有的属性。
- 联合类型要使用成员特有属性，必须先收窄（typeof/instanceof/in）。
- 交叉类型同名字段冲突会变成 \`never\`。
- 判别联合（带共有字段的联合）是最强大的 TS 模式之一。
`,
    code: `// 联合类型与交叉类型 Demo

// ===== 1. 联合类型：值可以是多种类型之一 =====
let id: string | number;
id = 'abc';                // ✅ OK
id = 123;                  // ✅ OK
// id = true;              // ❌ 报错：boolean 不在联合里
console.log('id =', id);

// 函数参数：接收多种类型
function formatId(id: string | number): string {
  // 用 String() 统一转换，避免类型问题
  return 'ID-' + id;
}
console.log('formatId("abc") =', formatId('abc'));
console.log('formatId(123) =', formatId(123));

// ===== 2. 联合类型如何收窄（Narrowing）=====
function process(value: string | number): string {
  // 直接用 value 的方法会报错，因为联合类型只能访问共有成员
  // value.toUpperCase();  // ❌ number 没有 toUpperCase
  // value.toFixed(2);     // ❌ string 没有 toFixed

  // 用 typeof 收窄
  if (typeof value === 'string') {
    return value.toUpperCase();   // ✅ 这里 value 是 string
  } else {
    return value.toFixed(2);      // ✅ 这里 value 是 number
  }
}
console.log('process("hello") =', process('hello'));  // HELLO
console.log('process(3.14159) =', process(3.14159));  // 3.14

// ===== 3. 联合类型只能访问共有成员 =====
type Cat = { meow: () => string; name: string };
type Dog = { bark: () => string; name: string };

function getAnimalName(animal: Cat | Dog): string {
  // animal.meow();  // ❌ 报错：Dog 没有 meow
  // animal.bark();  // ❌ 报错：Cat 没有 bark
  return animal.name;            // ✅ name 是共有字段，可以直接访问
}
console.log('cat name =', getAnimalName({ name: 'Kitty', meow: () => 'meow' }));
console.log('dog name =', getAnimalName({ name: 'Rex', bark: () => 'woof' }));

// ===== 4. 交叉类型：同时满足多个类型 =====
type User = { name: string; age: number };
type Admin = { role: string; permissions: string[] };

type AdminUser = User & Admin;
// 等价于 { name: string; age: number; role: string; permissions: string[] }

const admin: AdminUser = {
  name: 'Alice',
  age: 25,
  role: 'admin',
  permissions: ['read', 'write', 'delete'],
};
console.log('admin =', admin);

// ===== 5. 交叉类型：组合多个能力 =====
type WithId = { id: number };
type WithTimestamp = { createdAt: string; updatedAt: string };
type Entity = WithId & WithTimestamp;

const entity: Entity = {
  id: 1,
  createdAt: '2024-01-01',
  updatedAt: '2024-06-01',
};
console.log('entity =', entity);

// ===== 6. 联合 vs 交叉：何时用哪个 =====
// 联合：值可能是 A 或 B（范围扩大）
type StringOrNumber = string | number;
const a: StringOrNumber = 'hello';
const b: StringOrNumber = 42;
console.log('a =', a, '| b =', b);

// 交叉：值必须同时满足 A 和 B（范围缩小）
type NamedAndAged = { name: string } & { age: number };
const person: NamedAndAged = { name: 'Bob', age: 30 };
console.log('person =', person);

// ===== 7. 判别联合（Discriminated Union）：最强大的 TS 模式 =====
type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string }
  | { status: 'error'; message: string };

function describeState(state: RequestState): string {
  switch (state.status) {
    case 'idle':
      return 'waiting to start';           // state 收窄为 { status: 'idle' }
    case 'loading':
      return 'loading...';                 // state 收窄为 { status: 'loading' }
    case 'success':
      return 'done: ' + state.data;        // state 收窄为 success 分支，有 data
    case 'error':
      return 'error: ' + state.message;    // state 收窄为 error 分支，有 message
  }
}
console.log('idle:', describeState({ status: 'idle' }));
console.log('loading:', describeState({ status: 'loading' }));
console.log('success:', describeState({ status: 'success', data: 'hello' }));
console.log('error:', describeState({ status: 'error', message: 'timeout' }));

// ===== 8. 交叉类型的坑：同名字段冲突 =====
type A = { kind: 'a'; value: number };
type B = { kind: 'b'; value: string };
type AB = A & B;
// AB 的 kind 类型是 'a' & 'b' = never
// AB 的 value 类型是 number & string = never
// 实际上 AB 是不可实例化的（除非用 any 绕过）

// 演示：用判别联合替代交叉（正确做法）
type ABUnion = A | B;
function handleAB(x: ABUnion): string {
  if (x.kind === 'a') {
    return 'A value: ' + x.value;          // value 是 number
  } else {
    return 'B value: ' + x.value;          // value 是 string
  }
}
console.log('handleAB(A) =', handleAB({ kind: 'a', value: 42 }));
console.log('handleAB(B) =', handleAB({ kind: 'b', value: 'hello' }));

console.log('=== Demo 结束 ===');
`,
  },
  {
    id: "tspro-literal",
    group: "一、TypeScript 基础类型系统",
    icon: "🎯",
    title: "字面量类型与字面量联合",
    content: `# 字面量类型与字面量联合

## 一、什么是字面量类型

TS 不仅能用 \`string\`、\`number\` 这种宽泛类型，还能精确到**某一个具体的值**：

\`\`\`tsx
let x: 'hello';
x = 'hello';   // ✅ OK
x = 'world';   // ❌ 报错：只能是 'hello'

let y: 42;
y = 42;        // ✅ OK
y = 43;        // ❌ 报错

let z: true;
z = true;      // ✅ OK
z = false;     // ❌ 报错
\`\`\`

单个字面量类型本身没啥用（一个变量永远是同一个值，那为啥还要变量？）。**字面量类型真正的威力在于「联合」**。

## 二、字面量联合类型

把多个字面量用 \`|\` 连起来，表示「值只能在这几个里面选」：

\`\`\`tsx
type Status = 'idle' | 'loading' | 'success' | 'error';
type Direction = 'up' | 'down' | 'left' | 'right';
type Dice = 1 | 2 | 3 | 4 | 5 | 6;

let status: Status = 'idle';  // ✅ OK
status = 'loading';           // ✅ OK
status = 'done';              // ❌ 报错：'done' 不在联合里
\`\`\`

字面量联合是 TS 里**最实用的类型之一**，用来表达：

1. 状态机：\`'idle' | 'loading' | 'success' | 'error'\`
2. 配置项：\`'small' | 'medium' | 'large'\`
3. 事件名：\`'click' | 'hover' | 'focus'\`
4. 角色：\`'admin' | 'user' | 'guest'\`

## 三、字面量联合 vs string：区别在哪

\`\`\`tsx
// ❌ 用 string：太宽泛，无法收窄
function handleStatus(status: string) {
  if (status === 'idle') { /* ... */ }
  if (status === 'loading') { /* ... */ }
  // 漏写一个分支 TS 不会提醒
  // 写错分支名（'lodding'）TS 也不提醒
}

// ✅ 用字面量联合：精确，编译期检查
function handleStatus(status: 'idle' | 'loading' | 'success' | 'error') {
  if (status === 'idle') { /* ... */ }
  if (status === 'loading') { /* ... */ }
  // 漏写分支：通过 never 穷尽检查提醒（见下文）
  // 写错分支名：'lodding' ❌ 直接红线
}
\`\`\`

| 维度 | \`string\` | 字面量联合 \`'a' | 'b' | 'c'\` |
|------|---------|-------------------|
| 能赋的值 | 任意字符串 | 只能是列出的几个 |
| 拼写错误 | 运行时才发现 | 编译期就报错 |
| 分支完整性 | 无检查 | 可用 never 穷尽检查 |
| 自动补全 | 无 | IDE 会列出可选值 |
| 适用场景 | 真正任意文本 | 有限个选项 |

## 四、用字面量联合做状态机

\`\`\`tsx
type AppState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string }
  | { status: 'error'; message: string };

function render(state: AppState): string {
  switch (state.status) {
    case 'idle':
      return 'Click to start';
    case 'loading':
      return 'Loading...';
    case 'success':
      return 'Done: ' + state.data;       // ✅ 有 data
    case 'error':
      return 'Error: ' + state.message;   // ✅ 有 message
    default:
      const _exhaustive: never = state;   // 穷尽检查
      return _exhaustive;
  }
}
\`\`\`

这种「带判别字段的联合 + 字面量」叫做**判别联合（Discriminated Union）**，是 TS 里最强大的模式之一。新增一个状态分支时，\`never\` 检查会自动提醒你补全所有用到的地方。

## 五、数字字面量联合

\`\`\`tsx
type Dice = 1 | 2 | 3 | 4 | 5 | 6;
type HttpStatusCode = 200 | 201 | 400 | 404 | 500;
type LogLevel = 0 | 1 | 2 | 3;  // DEBUG=0, INFO=1, WARN=2, ERROR=3

function roll(d: Dice): Dice {
  return d;
}
roll(1);  // ✅
roll(7);  // ❌ 报错
\`\`\`

## 六、布尔字面量

\`\`\`tsx
type YesNo = true | false;  // 其实就是 boolean
type AlwaysTrue = true;     // 单个布尔字面量，偶尔有用
\`\`\`

> 单个 \`true\` 或 \`false\` 类型在泛型约束里偶尔会用到，日常开发很少用。

## 七、as const：把推断类型「锁」成字面量

默认情况下，TS 会把字符串、数字推断成宽泛类型：

\`\`\`tsx
const x = 'hello';      // 类型是 'hello'（const 自动是字面量）
let y = 'hello';        // 类型是 string（let 推断为宽泛类型）

const obj = { name: 'Alice', age: 25 };
// obj.name 的类型是 string，不是 'Alice'
// obj.age 的类型是 number，不是 25
\`\`\`

用 \`as const\` 可以让 TS 推断出字面量类型，并且把所有属性变成 \`readonly\`：

\`\`\`tsx
const obj = { name: 'Alice', age: 25 } as const;
// obj.name 的类型是 'Alice'
// obj.age 的类型是 25
// obj 是 { readonly name: 'Alice'; readonly age: 25 }

const arr = [1, 2, 3] as const;
// arr 的类型是 readonly [1, 2, 3]（只读元组）
// arr[0] = 10;  // ❌ 报错：readonly
\`\`\`

## 八、as const 的典型用法

### 8.1 替代枚举

\`\`\`tsx
const Status = {
  Idle: 'Idle',
  Loading: 'Loading',
  Success: 'Success',
  Error: 'Error',
} as const;

type Status = typeof Status[keyof typeof Status];
// 'Idle' | 'Loading' | 'Success' | 'Error'

function handle(status: Status) {
  if (status === Status.Idle) { /* ... */ }
}
\`\`\`

### 8.2 创建不可变配置

\`\`\`tsx
const CONFIG = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
} as const;
// CONFIG 的所有属性都是只读的，类型是字面量
\`\`\`

### 8.3 元组字面量

\`\`\`tsx
const point = [10, 20] as const;
// point 的类型是 readonly [10, 20]
// 不是 number[]
\`\`\`

## 九、模板字面量类型（简介）

TS 4.1+ 支持模板字面量类型，可以生成字符串字面量的组合：

\`\`\`tsx
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ApiEndpoint = \`/\${string}\`;
type EventName = \`on\${Capitalize<string>}\`;
\`\`\`

这个属于进阶内容，这里先了解，后续章节会详细讲。

## 小结

- 字面量类型：精确到某一个具体值。
- 字面量联合：值只能从列出的几个里选，是 TS 最实用的类型之一。
- 相比 \`string\`：编译期检查拼写、IDE 自动补全、可做穷尽检查。
- \`as const\` 让 TS 推断字面量类型，常用于配置对象、替代枚举、元组字面量。
- 判别联合 + 字面量 + never 检查 = 类型安全的状态机。
`,
    code: `// 字面量类型与字面量联合 Demo

// ===== 1. 单个字面量类型：值只能是这一个 =====
let hello: 'hello';
hello = 'hello';          // ✅ OK
// hello = 'world';       // ❌ 报错：只能是 'hello'
console.log('hello =', hello);

let answer: 42;
answer = 42;               // ✅ OK
// answer = 43;            // ❌ 报错
console.log('answer =', answer);

// ===== 2. 字面量联合类型：值只能从几个里选 =====
type Status = 'idle' | 'loading' | 'success' | 'error';
let status: Status = 'idle';   // ✅ OK
status = 'loading';            // ✅ OK
// status = 'done';            // ❌ 报错：'done' 不在联合里
console.log('status =', status);

type Direction = 'up' | 'down' | 'left' | 'right';
type Dice = 1 | 2 | 3 | 4 | 5 | 6;
const dice: Dice = 4;
console.log('dice =', dice);

// ===== 3. 字面量联合 vs string：编译期检查拼写 =====
function handleStatus(status: 'idle' | 'loading' | 'success' | 'error'): string {
  // 字面量联合让你写错分支名时立刻报错
  if (status === 'idle') return 'waiting';
  if (status === 'loading') return 'loading...';
  if (status === 'success') return 'done!';
  if (status === 'error') return 'failed';
  // 如果漏写分支或写错名字，TS 会通过 never 检查提醒
  const _exhaustive: never = status;
  return _exhaustive;
}
console.log('handleStatus(idle) =', handleStatus('idle'));
console.log('handleStatus(success) =', handleStatus('success'));

// ===== 4. 字面量联合做状态机：判别联合 =====
type AppState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string }
  | { status: 'error'; message: string };

function render(state: AppState): string {
  switch (state.status) {
    case 'idle':
      return 'Click to start';                 // state 收窄为 { status: 'idle' }
    case 'loading':
      return 'Loading...';                     // state 收窄为 { status: 'loading' }
    case 'success':
      return 'Done: ' + state.data;            // state 收窄为 success 分支，有 data
    case 'error':
      return 'Error: ' + state.message;        // state 收窄为 error 分支，有 message
    default:
      const _exhaustive: never = state;        // 穷尽检查：新增分支时会报错
      return _exhaustive;
  }
}
console.log('render(idle) =', render({ status: 'idle' }));
console.log('render(loading) =', render({ status: 'loading' }));
console.log('render(success) =', render({ status: 'success', data: 'hello' }));
console.log('render(error) =', render({ status: 'error', message: 'timeout' }));

// ===== 5. 数字字面量联合 =====
type HttpStatusCode = 200 | 201 | 400 | 404 | 500;
function describeHttp(code: HttpStatusCode): string {
  switch (code) {
    case 200: return 'OK';
    case 201: return 'Created';
    case 400: return 'Bad Request';
    case 404: return 'Not Found';
    case 500: return 'Internal Server Error';
  }
}
console.log('describeHttp(200) =', describeHttp(200));
console.log('describeHttp(404) =', describeHttp(404));

// ===== 6. as const：把推断类型锁成字面量 =====
// 不用 as const：推断为宽泛类型
const objWide = { name: 'Alice', age: 25 };
// objWide.name 类型是 string，objWide.age 类型是 number

// 用 as const：推断为字面量 + readonly
const objConst = { name: 'Alice', age: 25 } as const;
// objConst.name 类型是 'Alice'，objConst.age 类型是 25
// objConst.name = 'Bob';  // ❌ 报错：readonly
console.log('objConst =', objConst);

// 数组用 as const 变成只读元组
const arr = [1, 2, 3] as const;
// arr 类型是 readonly [1, 2, 3]
// arr.push(4);  // ❌ 报错：readonly
console.log('arr =', arr);

// ===== 7. as const 替代枚举 =====
const StatusConst = {
  Idle: 'Idle',
  Loading: 'Loading',
  Success: 'Success',
  Error: 'Error',
} as const;

type StatusType = typeof StatusConst[keyof typeof StatusConst];
// StatusType = 'Idle' | 'Loading' | 'Success' | 'Error'

function describe(s: StatusType): string {
  if (s === StatusConst.Idle) return 'waiting';
  if (s === StatusConst.Loading) return 'loading...';
  if (s === StatusConst.Success) return 'done';
  return 'error';
}
console.log('describe(Idle) =', describe(StatusConst.Idle));
console.log('describe(Success) =', describe(StatusConst.Success));
console.log('StatusConst keys =', Object.keys(StatusConst));

// ===== 8. as const 创建不可变配置 =====
const CONFIG = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
} as const;
// CONFIG 所有属性都是只读字面量
console.log('CONFIG =', CONFIG);

console.log('=== Demo 结束 ===');
`,
  },
  {
    id: "tspro-type-vs-interface",
    group: "一、TypeScript 基础类型系统",
    icon: "🤝",
    title: "type 别名 vs interface 接口",
    content: `# type 别名 vs interface 接口

## 一、为什么有两套语法

TS 有两种方式定义对象类型：\`type\` 和 \`interface\`。它们 90% 的场景能互换，但有几个关键区别。理解区别能帮你在不同场景选对的工具。

\`\`\`tsx
// type 别名
type User = {
  name: string;
  age: number;
};

// interface 接口
interface User2 {
  name: string;
  age: number;
}
\`\`\`

两者都能描述对象结构，编译后都会被擦除，运行时不占任何空间。

## 二、语法差异

### 2.1 定义对象

\`\`\`tsx
// type 用 = 赋值
type User = {
  name: string;
  age: number;
};

// interface 不用 =，直接写结构
interface User2 {
  name: string;
  age: number;
}
\`\`\`

### 2.2 扩展（继承）

\`\`\`tsx
// type 用 &（交叉）扩展
type Animal = { name: string };
type Dog = Animal & { bark: () => void };

// interface 用 extends 扩展
interface Animal2 { name: string }
interface Dog2 extends Animal2 {
  bark: () => void;
}
\`\`\`

### 2.3 实现与被实现

\`\`\`tsx
// class 都能 implements
class UserService implements User { /* ... */ }
class UserService2 implements User2 { /* ... */ }

// 但只有 interface 能「被 interface 继承」
interface A extends User2 { }  // ✅ OK
// type B = User2 & { }; // 这是交叉，不是 extends
\`\`\`

## 三、interface 独有能力：声明合并

\`interface\` 同名声明会**自动合并**，\`type\` 不行：

\`\`\`tsx
// interface 声明合并
interface Window {
  myCustomProp: string;
}
interface Window {
  anotherProp: number;
}
// 合并后：Window 有 myCustomProp 和 anotherProp

// type 不能同名重复声明
// type User = { name: string };
// type User = { age: number };  // ❌ 报错：重复标识符
\`\`\`

**声明合并的实际场景**：扩展第三方库的类型、扩展全局对象（如 \`Window\`、\`HTMLElement\`）。

\`\`\`tsx
// 给全局 Window 加自定义属性
declare global {
  interface Window {
    myAppConfig: { apiUrl: string };
  }
}
// 之后 window.myAppConfig 就有类型了
\`\`\`

## 四、type 独有能力：能定义任意类型

\`type\` 能定义联合、交叉、原始类型、元组等，\`interface\` 只能描述对象/函数形状：

\`\`\`tsx
// type 能定义这些，interface 不行
type ID = string | number;
type Status = 'idle' | 'loading' | 'done';
type Point = [number, number];
type Callback<T> = (value: T) => void;
type Pair<K, V> = { key: K; value: V };

// interface 只能描述对象/函数
interface User { name: string }
interface Fn { (x: number): string }
\`\`\`

## 五、何时用 type，何时用 interface

| 场景 | 推荐 | 原因 |
|------|------|------|
| 描述对象/类的形状 | interface | 更直观，能 extends，能声明合并 |
| 联合类型、交叉类型 | type | interface 表达不了 |
| 元组、原始类型别名 | type | interface 表达不了 |
| 扩展第三方库类型 | interface | 利用声明合并 |
| React 组件 Props | 都行，团队统一 | 一般 type 居多 |
| 工具类型（泛型 + 条件） | type | type 表达力更强 |

**通用建议**：
- 如果是 React 组件 Props、API 响应这种「纯对象结构」，\`interface\` 更合适（可扩展、可被 implements）。
- 如果需要联合、交叉、元组、工具类型，用 \`type\`。
- 团队统一最重要，选一种风格贯彻到底。

## 六、扩展：extends vs & 的细节

\`\`\`tsx
// interface extends：遇到冲突会报错
interface A { kind: string }
interface B extends A { kind: 'b' }  // ✅ OK，'b' 是 string 的子类型
interface C { kind: number }
interface D extends A, C { }  // ❌ 报错：kind 类型冲突

// type &：遇到冲突会变成 never
type TA = { kind: string }
type TB = { kind: 'b' }
type TC = TA & TB  // kind: string & 'b' = 'b'，OK

type TD = { kind: string }
type TE = { kind: number }
type TF = TD & TE  // kind: string & number = never，不报错但用不了
\`\`\`

> \`interface extends\` 更严格（冲突直接报错），\`type &\` 更宽松（冲突变成 never）。日常用 \`extends\` 更安全。

## 七、函数类型的两种写法

\`\`\`tsx
// type 写法
type Fn = (x: number, y: number) => number;
const add: Fn = (x, y) => x + y;

// interface 写法
interface Fn2 {
  (x: number, y: number): number;
}
const add2: Fn2 = (x, y) => x + y;
\`\`\`

函数类型推荐用 \`type\`，更简洁直观。

## 八、索引签名与可索引类型

\`\`\`tsx
// 两种写法都支持索引签名
type StringMap = { [key: string]: string };
interface StringMap2 {
  [key: string]: string;
}

const m: StringMap = { a: '1', b: '2' };
\`\`\`

## 九、性能差异（基本可忽略）

理论上 \`interface\` 在编译器内部有缓存优化，大量类型场景下比 \`type\` 略快。但实际项目里这点差异完全感知不到，**不要因为性能选其中一个**。

## 十、混合用法的常见模式

\`\`\`tsx
// 用 interface 定义对象结构，用 type 定义联合和工具类型
interface User {
  id: number;
  name: string;
  role: 'admin' | 'user' | 'guest';  // 字段用联合
}

type UserRole = User['role'];  // 用索引访问提取联合：'admin' | 'user' | 'guest'

// React 组件 Props 用 type 居多
type UserCardProps = {
  user: User;
  onSelect?: (user: User) => void;
};
\`\`\`

## 小结

- \`type\` 和 \`interface\` 90% 场景能互换。
- \`interface\` 独有：声明合并、\`extends\`、被 \`implements\`。
- \`type\` 独有：联合、交叉、元组、原始类型别名、工具类型。
- 对象结构优先 \`interface\`，联合/工具类型用 \`type\`，团队统一最重要。
- 函数类型推荐 \`type\`，更简洁。
- 性能差异可忽略，不要因此选型。
`,
    code: `// type 别名 vs interface 接口 Demo

// ===== 1. 基本定义：两种写法等价 =====
type UserType = {
  name: string;
  age: number;
};

interface UserInterface {
  name: string;
  age: number;
}

const u1: UserType = { name: 'Alice', age: 25 };
const u2: UserInterface = { name: 'Bob', age: 30 };
console.log('u1 =', u1, '| u2 =', u2);

// ===== 2. 扩展（继承）：type 用 &，interface 用 extends =====
type AnimalType = { name: string };
type DogType = AnimalType & { bark: () => string };

interface AnimalInterface {
  name: string;
}
interface DogInterface extends AnimalInterface {
  bark: () => string;
}

const dog1: DogType = { name: 'Rex', bark: () => 'woof' };
const dog2: DogInterface = { name: 'Max', bark: () => 'woof woof' };
console.log('dog1 =', dog1.name, dog1.bark());
console.log('dog2 =', dog2.name, dog2.bark());

// ===== 3. interface 独有：声明合并 =====
interface Window {
  myCustomProp: string;
}
interface Window {
  anotherProp: number;
}
// 合并后 Window 同时有 myCustomProp 和 anotherProp
// 演示：用局部 interface 模拟合并
interface Config {
  apiUrl: string;
}
interface Config {
  timeout: number;
}
// Config 现在等价于 { apiUrl: string; timeout: number }
const config: Config = { apiUrl: 'https://api.example.com', timeout: 5000 };
console.log('config =', config);

// type 不能同名重复声明
// type X = { a: number };
// type X = { b: number };  // ❌ 报错：重复标识符

// ===== 4. type 独有：定义联合、交叉、元组、原始类型 =====
// interface 表达不了这些
type ID = string | number;                        // 联合
type Status = 'idle' | 'loading' | 'done';        // 字面量联合
type Point = [number, number];                    // 元组
type Callback<T> = (value: T) => void;            // 泛型函数
type Pair<K, V> = { key: K; value: V };           // 泛型对象

const id: ID = 123;
const status: Status = 'loading';
const point: Point = [10, 20];
const cb: Callback<string> = (v) => console.log('callback:', v);
const pair: Pair<string, number> = { key: 'a', value: 1 };
console.log('id =', id, '| status =', status, '| point =', point);
console.log('pair =', pair);
cb('hello');

// ===== 5. 函数类型的两种写法 =====
type FnType = (x: number, y: number) => number;
interface FnInterface {
  (x: number, y: number): number;
}
const add1: FnType = (x, y) => x + y;
const add2: FnInterface = (x, y) => x + y;
console.log('add1(1, 2) =', add1(1, 2), '| add2(3, 4) =', add2(3, 4));

// ===== 6. 索引签名 =====
type StringMap = { [key: string]: string };
interface StringMap2 {
  [key: string]: string;
}
const m1: StringMap = { a: '1', b: '2' };
const m2: StringMap2 = { x: '10', y: '20' };
console.log('m1 =', m1, '| m2 =', m2);

// ===== 7. class implements：两种都能被实现 =====
interface LoggerInterface {
  log(msg: string): void;
}
type LoggerType = {
  log(msg: string): void;
};

class ConsoleLogger implements LoggerInterface {
  log(msg: string) { console.log('[Logger]', msg); }
}
class ConsoleLogger2 implements LoggerType {
  log(msg: string) { console.log('[Logger2]', msg); }
}
new ConsoleLogger().log('hello from interface');
new ConsoleLogger2().log('hello from type');

// ===== 8. 混合用法：interface 描述对象，type 提取联合 =====
interface User {
  id: number;
  name: string;
  role: 'admin' | 'user' | 'guest';
}
// 用索引访问类型从 User 提取 role 的联合
type UserRole = User['role'];  // 'admin' | 'user' | 'guest'

function describeRole(role: UserRole): string {
  switch (role) {
    case 'admin': return 'administrator with full access';
    case 'user': return 'regular user';
    case 'guest': return 'guest with limited access';
  }
}
console.log('describeRole(admin) =', describeRole('admin'));
console.log('describeRole(guest) =', describeRole('guest'));

// ===== 9. React 组件 Props 风格（用 type 居多）=====
type UserCardProps = {
  user: User;
  onSelect?: (user: User) => void;  // 可选回调
};

// 模拟一个组件函数
function UserCard(props: UserCardProps): string {
  let result = props.user.name + ' (' + props.user.role + ')';
  if (props.onSelect) {
    props.onSelect(props.user);
  }
  return result;
}
const card = UserCard({
  user: { id: 1, name: 'Alice', role: 'admin' },
  onSelect: (u) => console.log('selected:', u.name),
});
console.log('UserCard =', card);

console.log('=== Demo 结束 ===');
`,
  },
  {
    id: "tspro-assertion-guards",
    group: "一、TypeScript 基础类型系统",
    icon: "🛡️",
    title: "类型断言与类型守卫基础",
    content: `# 类型断言与类型守卫基础

## 一、为什么需要断言和守卫

TS 的类型推断不是万能的。有时候 TS 推断出的类型太宽泛（比如 \`unknown\`、\`HTMLElement | null\`），而你作为开发者知道在某个具体场景下类型是什么。这时需要**类型断言**或**类型守卫**来告诉 TS 更精确的类型。

两者的核心区别：

- **断言（assertion）**：「我说是啥就是啥」，TS 信任你，不验证。错了运行时崩。
- **守卫（guard）**：「我用代码证明它是啥」，TS 看你的判断逻辑来收窄类型。安全。

## 二、类型断言：as

\`\`\`tsx
// 基本语法：值 as 类型
const el = document.getElementById('app') as HTMLDivElement;
// TS 不再认为 el 是 HTMLElement | null，而是 HTMLDivElement

const value: unknown = 'hello';
const len = (value as string).length;
\`\`\`

### 断言的使用场景

\`\`\`tsx
// 1. DOM 操作：getElementById 返回 HTMLElement | null，但你确定它存在
const input = document.getElementById('name') as HTMLInputElement;
input.value = 'Alice';

// 2. 收窄 unknown / any
const data: unknown = JSON.parse('{"name":"Alice"}');
const user = data as { name: string };
console.log(user.name);

// 3. 联合类型收窄（不推荐，建议用守卫）
type Result = string | number;
const r: Result = 42;
const n = r as number;  // 不安全，如果 r 是 string 会出问题
\`\`\`

### 断言的危险

断言是**不安全**的，TS 不会验证：

\`\`\`tsx
const x = 'hello' as number;  // ❌ 报错：string 和 number 不兼容
const y = ('hello' as unknown) as number;  // ✅ 不报错，但运行时会出问题
y.toFixed();  // 运行时崩：y 是 string，没有 toFixed
\`\`\`

> 经验法则：\`as\` 断言只在「TS 推断不够精确，而你确定类型」时用。能用守卫就用守卫，断言是最后手段。

## 三、尖括号断言 <>

\`\`\`tsx
// 等价于 as 断言，但语法不同
const el = <HTMLDivElement>document.getElementById('app');
const value = <string>someUnknown;
\`\`\`

> 注意：在 \`.tsx\` 文件里**不能用 \`<>\` 断言**，因为会和 JSX 标签冲突。在 tsx 文件里一律用 \`as\`。\`<>\` 断言基本被淘汰，新代码都用 \`as\`。

## 四、非空断言：!

\`!\` 表示「我确定这不是 null/undefined」：

\`\`\`tsx
const el = document.getElementById('app')!;
// el 类型从 HTMLElement | null 变成 HTMLElement

function getUser(id: number): User | null { /* ... */ }
const user = getUser(1)!;  // 类型从 User | null 变成 User
user.name;  // ✅ OK
\`\`\`

### 非空断言的危险

\`\`\`tsx
const el = document.getElementById('not-exist')!;
el.innerHTML = 'hello';  // 运行时崩：el 是 null
\`\`\`

> 经验法则：\`!\` 能不用就不用。优先用 \`if (el)\` 显式判空，更安全。只有在你**绝对确定**值非空时才用 \`!\`。

## 五、类型守卫：typeof

\`typeof\` 用于判断原始类型，TS 会据此收窄：

\`\`\`tsx
function process(value: string | number) {
  if (typeof value === 'string') {
    value.toUpperCase();  // ✅ 这里 value 是 string
  } else {
    value.toFixed(2);     // ✅ 这里 value 是 number
  }
}
\`\`\`

\`typeof\` 能判断的类型：\`string\`、\`number\`、\`boolean\`、\`symbol\`、\`bigint\`、\`undefined\`、\`function\`、\`object\`。

> 注意：\`typeof null\` 是 \`'object'\`（JS 历史 bug），所以判断 null 要用 \`=== null\`。

## 六、类型守卫：instanceof

\`instanceof\` 用于判断类的实例：

\`\`\`tsx
class ErrorA extends Error { code = 1 }
class ErrorB extends Error { code = 2 }

function handleError(err: ErrorA | ErrorB) {
  if (err instanceof ErrorA) {
    err.code;  // ✅ 这里 err 是 ErrorA
  } else {
    err.code;  // ✅ 这里 err 是 ErrorB
  }
}

// 也适用于内置类
function processDate(x: Date | string) {
  if (x instanceof Date) {
    x.getTime();  // ✅ Date 方法
  } else {
    x.toUpperCase();  // ✅ string 方法
  }
}
\`\`\`

## 七、类型守卫：in

\`in\` 用于判断对象是否有某属性，常用于判别联合：

\`\`\`tsx
type Cat = { meow: () => void };
type Dog = { bark: () => void };

function speak(animal: Cat | Dog) {
  if ('meow' in animal) {
    animal.meow();  // ✅ 这里 animal 是 Cat
  } else {
    animal.bark();  // ✅ 这里 animal 是 Dog
  }
}

// 更典型的判别联合
type ApiResponse =
  | { status: 'success'; data: string }
  | { status: 'error'; message: string };

function handle(res: ApiResponse) {
  if ('data' in res) {
    console.log(res.data);     // ✅ 有 data
  } else {
    console.log(res.message);  // ✅ 有 message
  }
}
\`\`\`

## 八、判别联合 + switch 守卫

最常见的守卫模式，用「共有字段」做判别：

\`\`\`tsx
type State =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'success'; data: string }
  | { type: 'error'; error: Error };

function reducer(state: State): string {
  switch (state.type) {
    case 'idle':    return 'waiting';
    case 'loading': return 'loading...';
    case 'success': return 'done: ' + state.data;   // ✅ 有 data
    case 'error':   return 'error: ' + state.error.message;  // ✅ 有 error
  }
}
\`\`\`

这是 React + TS 里最常用的模式：Redux action、useReducer state、异步请求结果都用判别联合。

## 九、断言 vs 守卫：何时用哪个

| 维度 | 断言（as / !） | 守卫（typeof/instanceof/in） |
|------|--------------|---------------------------|
| 安全性 | 不安全（TS 不验证） | 安全（基于判断逻辑） |
| 代码量 | 简短 | 多几行 |
| 适用场景 | TS 推断不够、你确定类型 | 需要运行时判断收窄 |
| 出错时 | 运行时崩 | 编译期或运行时正确处理 |

**优先级**：守卫 > 断言。只在守卫写不了或太啰嗦时才用断言。

## 十、实战：处理 API 响应

\`\`\`tsx
// 安全做法：用守卫验证
function parseUser(data: unknown): User {
  if (typeof data !== 'object' || data === null) {
    throw new Error('invalid user');
  }
  if (!('name' in data) || !('age' in data)) {
    throw new Error('missing fields');
  }
  // 这里 data 类型已经被收窄，但 TS 推断还不够精确
  const obj = data as { name: unknown; age: unknown };
  if (typeof obj.name !== 'string' || typeof obj.age !== 'number') {
    throw new Error('invalid types');
  }
  return { name: obj.name, age: obj.age };  // ✅ 安全
}
\`\`\`

> 实际项目里推荐用 zod、io-ts 等运行时验证库，自动生成类型 + 验证逻辑，比手写守卫更安全。

## 小结

- **断言**：\`as\`、\`<>\`（tsx 不支持）、\`!\` 非空断言。不安全，TS 信任你。
- **守卫**：\`typeof\`、\`instanceof\`、\`in\`、\`switch\` 判别。安全，基于逻辑收窄。
- 优先用守卫，断言是最后手段。
- \`!\` 非空断言能不用就不用，显式判空更安全。
- 判别联合 + switch 是 React + TS 最常用的守卫模式。
- 处理外部数据（API、JSON.parse）推荐用 zod 等验证库。
`,
    code: `// 类型断言与类型守卫基础 Demo

// ===== 1. 类型断言 as：告诉 TS 更精确的类型 =====
const value: unknown = 'hello, typescript';
// value.length;  // ❌ 报错：unknown 不能直接访问属性
const strValue = value as string;     // 断言为 string
console.log('strValue.length =', strValue.length);

// 断言的典型场景：模拟 DOM 操作
// 实际 DOM 中 getElementById 返回 HTMLElement | null
// 这里用一个模拟函数演示
function getElement(id: string): HTMLElement | null {
  // 模拟：返回一个假对象
  if (id === 'app') {
    return { tagName: 'DIV' } as HTMLElement;
  }
  return null;
}
const el = getElement('app') as HTMLDivElement;  // 断言为更具体的类型
console.log('el.tagName =', el.tagName);

// ===== 2. 非空断言 !：断言不是 null/undefined =====
function findUser(id: number): { name: string } | null {
  if (id === 1) return { name: 'Alice' };
  return null;
}
// 用 ! 断言「我确定不是 null」
const user = findUser(1)!;             // 类型从 { name: string } | null 变成 { name: string }
console.log('user.name =', user.name);

// 注意：! 是不安全的，如果值真的是 null 会运行时崩
// const badUser = findUser(999)!;     // 运行时崩：Cannot read property 'name' of null
// 更安全的做法是显式判空
const safeUser = findUser(2);
if (safeUser !== null) {
  console.log('safeUser found:', safeUser.name);
} else {
  console.log('safeUser not found');
}

// ===== 3. 类型守卫 typeof：判断原始类型 =====
function process(value: string | number): string {
  // typeof 收窄：TS 根据判断自动推断更精确的类型
  if (typeof value === 'string') {
    return value.toUpperCase();        // ✅ 这里 value 是 string
  } else {
    return value.toFixed(2);           // ✅ 这里 value 是 number
  }
}
console.log('process("hello") =', process('hello'));   // HELLO
console.log('process(3.14159) =', process(3.14159));   // 3.14

// typeof 判断 undefined
function safeAccess(obj: { x?: number }): number {
  if (typeof obj.x === 'number') {
    return obj.x * 2;                  // ✅ 这里 obj.x 是 number
  }
  return 0;                            // obj.x 是 undefined
}
console.log('safeAccess({x:5}) =', safeAccess({ x: 5 }));
console.log('safeAccess({}) =', safeAccess({}));

// ===== 4. 类型守卫 instanceof：判断类的实例 =====
class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
  }
}
class NetworkError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

function handleError(err: ValidationError | NetworkError): string {
  // instanceof 收窄
  if (err instanceof ValidationError) {
    return 'Validation failed on field: ' + err.field;   // ✅ 有 field
  } else {
    return 'Network error with status: ' + err.statusCode; // ✅ 有 statusCode
  }
}
console.log('handleError(Validation) =', handleError(new ValidationError('email', 'invalid')));
console.log('handleError(Network) =', handleError(new NetworkError(404, 'not found')));

// 也适用于内置类
function formatDate(x: Date | string): string {
  if (x instanceof Date) {
    return x.toISOString();            // ✅ Date 方法
  } else {
    return x.toUpperCase();            // ✅ string 方法
  }
}
console.log('formatDate(Date) =', formatDate(new Date('2024-01-01')));
console.log('formatDate(string) =', formatDate('2024-01-01'));

// ===== 5. 类型守卫 in：判断对象是否有某属性 =====
type Cat = { meow: () => string; name: string };
type Dog = { bark: () => string; name: string };

function speak(animal: Cat | Dog): string {
  // in 收窄：判断对象是否有某属性
  if ('meow' in animal) {
    return animal.name + ': ' + animal.meow();   // ✅ 这里 animal 是 Cat
  } else {
    return animal.name + ': ' + animal.bark();   // ✅ 这里 animal 是 Dog
  }
}
console.log('speak(Cat) =', speak({ name: 'Kitty', meow: () => 'meow' }));
console.log('speak(Dog) =', speak({ name: 'Rex', bark: () => 'woof' }));

// in 用于判别联合
type ApiResponse =
  | { status: 'success'; data: string }
  | { status: 'error'; message: string };

function handleResponse(res: ApiResponse): string {
  if ('data' in res) {
    return 'OK: ' + res.data;           // ✅ 有 data
  } else {
    return 'FAIL: ' + res.message;      // ✅ 有 message
  }
}
console.log('handleResponse(success) =', handleResponse({ status: 'success', data: 'hello' }));
console.log('handleResponse(error) =', handleResponse({ status: 'error', message: 'timeout' }));

// ===== 6. 判别联合 + switch：React 最常用的守卫模式 =====
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'set'; payload: number }
  | { type: 'reset' };

function counterReducer(state: number, action: Action): number {
  switch (action.type) {
    case 'increment':
      return state + 1;                 // ✅ 收窄为 { type: 'increment' }
    case 'decrement':
      return state - 1;                 // ✅ 收窄为 { type: 'decrement' }
    case 'set':
      return action.payload;            // ✅ 收窄为 set 分支，有 payload
    case 'reset':
      return 0;                         // ✅ 收窄为 { type: 'reset' }
    default:
      const _exhaustive: never = action; // 穷尽检查
      return _exhaustive;
  }
}
console.log('increment:', counterReducer(5, { type: 'increment' }));
console.log('decrement:', counterReducer(5, { type: 'decrement' }));
console.log('set 100:', counterReducer(5, { type: 'set', payload: 100 }));
console.log('reset:', counterReducer(5, { type: 'reset' }));

// ===== 7. 断言 vs 守卫：安全性的对比 =====
const data: unknown = JSON.parse('{"name":"Alice","age":25}');

// ❌ 不安全做法：直接断言，不验证
const unsafeUser = data as { name: string; age: number };
console.log('unsafeUser =', unsafeUser);  // 运气好就 OK，运气不好运行时崩

// ✅ 安全做法：用守卫逐层验证
function parseUserSafe(data: unknown): { name: string; age: number } {
  if (typeof data !== 'object' || data === null) {
    throw new Error('data is not an object');
  }
  if (!('name' in data) || !('age' in data)) {
    throw new Error('missing name or age');
  }
  const obj = data as { name: unknown; age: unknown };
  if (typeof obj.name !== 'string') {
    throw new Error('name is not string');
  }
  if (typeof obj.age !== 'number') {
    throw new Error('age is not number');
  }
  return { name: obj.name, age: obj.age };  // ✅ 完全安全
}
console.log('safeUser =', parseUserSafe(data));

console.log('=== Demo 结束 ===');
`,
  },
];
