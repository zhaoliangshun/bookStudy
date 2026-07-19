// =============================================================
// TypeScript 全解 · Batch 1：入门基础（共 5 章）
// -------------------------------------------------------------
// 本批是 TypeScript 全解教程的第一批，覆盖零基础入门的核心概念：
//   tsbook-what-is-ts       : TypeScript 是什么
//   tsbook-install-and-run  : 安装与运行
//   tsbook-basic-types      : 基础类型
//   tsbook-type-annotation  : 类型注解与类型推导
//   tsbook-var-let-const    : var/let/const 与作用域
//
// 风格：demo 驱动，每章都有可运行 TS 代码 + 详细中文注释。
// 运行环境：ts.transpileModule + target ES2020 + CommonJS。
// =============================================================

export const chapters = [
  // ============================================================
  // 第一章：TypeScript 是什么
  // ============================================================
  {
    id: "tsbook-what-is-ts",
    group: "入门基础",
    icon: "🟦",
    title: "TypeScript 是什么",
    content: `## TypeScript 是什么

### 一、一句话定义

**TypeScript（简称 TS）= JavaScript + 静态类型系统**。

它是微软 2012 年开源的一门语言，是 JavaScript 的**超集**：所有合法的 JS 代码都是合法的 TS 代码，TS 只是额外加了一层「类型标注」。

\`\`\`ts
// 这段 JS 代码也是合法的 TS 代码
function add(a, b) {
  return a + b;
}

// TS 只是在此基础上加了类型标注
function addTs(a: number, b: number): number {
  return a + b;
}
\`\`\`

> 类型标注是「写给编译器和 IDE 看的注释」，**运行时会被完全擦除**，最终产物还是 JS。

### 二、为什么需要 TypeScript

JavaScript 是一门**动态弱类型**语言：变量没有类型约束，函数参数可以传任何东西，类型错误只有在运行时才暴露。小项目里这种灵活性很爽，项目一大就成灾难。

\`\`\`js
// 纯 JS：一个看似无害的函数
function calculateTotal(price, quantity, discount) {
  return price * quantity - discount;
}

// 调用方可能这样写，运行时才发现错
calculateTotal('100', 2, '10'); // '100' * 2 - '10' = NaN
\`\`\`

TS 的核心价值就一句话：**把错误从运行时提前到编译期**。

| 维度 | JavaScript | TypeScript |
|------|-----------|-----------|
| 类型系统 | 动态类型，运行时确定 | 静态类型，编译期检查 |
| 错误发现时机 | 运行时 | 编译期（写代码时 IDE 就提示） |
| 类型标注 | 无 | 有，但可选（支持类型推导） |
| 浏览器支持 | 直接运行 | 需要编译为 JS |
| 重构体验 | 容易改错 | 改一个类型，所有调用点都报错 |
| 大型项目协作 | 容易出 bug | 类型契约让协作更稳 |

### 三、TS 的编译流程

浏览器和 Node.js 都**不能直接运行 TS**，必须先编译（官方叫 transpile，转译）成 JS：

\`\`\`
.ts 源文件
   │  tsc（TypeScript 编译器）
   ▼
.js 文件（类型标注被擦除）
   │  node / 浏览器
   ▼
运行结果
\`\`\`

关键点：

1. **类型检查只在编译期发生**。编译器扫描所有类型标注，发现类型不匹配就报错。
2. **编译产物是纯 JS**，没有任何类型信息（除非开启特殊选项）。
3. **运行时还是 JS 的行为**：TS 不会改变 JS 的语义，只是给你加了一道「写代码时的安检」。

\`\`\`ts
// 源代码（.ts）
const age: number = 18;
const name: string = "TS";

// 编译后（.js）—— 类型标注被擦除
const age = 18;
const name = "TS";
\`\`\`

### 四、TypeScript 与 JavaScript 的关系

可以用一张图概括：

\`\`\`
┌─────────────────────────────┐
│      TypeScript 范围         │
│  ┌───────────────────────┐  │
│  │  类型系统（TS 独有）   │  │
│  │  类型标注、接口、泛型   │  │
│  │  条件类型、工具类型...  │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │   JavaScript 全集      │  │
│  │   ES5 / ES6 / ES2024   │  │
│  │   所有 JS 语法和 API    │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
\`\`\`

- **JS 是 TS 的子集**：会 JS 就已经会一半 TS 了。
- **TS 向后兼容 JS**：你可以把现有的 \`.js\` 文件直接改名为 \`.ts\`，逐步加类型。
- **TS 跟随 ECMAScript 标准演进**：新的 JS 提案，TS 通常先支持。

### 五、谁在用 TypeScript

- 前端三大框架：Angular 默认 TS，React + Vue 都官方支持 TS。
- 后端：NestJS、Midway 等框架原生 TS。
- 工具链：VS Code 本身、Vite、Deno 都是 TS 写的。
- 大厂内部基建几乎全部 TS 化。

### 小结

- TS = JS + 静态类型系统，是 JS 的超集。
- 核心价值：**把错误从运行时提前到编译期**。
- 编译期擦除类型，运行时还是 JS。
- 学 TS 不用扔掉 JS 知识，是在 JS 上加一层保护。

下一章我们装好环境，亲手跑通第一段 TS 代码。`,
    code: `// 第一章 Demo：TS 是 JS 的超集，类型标注在编译时被擦除
// 沙箱执行：ts.transpileModule + target ES2020 + CommonJS

// ===== 1. 纯 JS 风格：没有任何类型标注，运行时才暴露问题 =====
function jsAdd(a, b) {
  // 没有类型约束，a/b 可以是任何值
  return a + b;
}
console.log("jsAdd(1, 2) =", jsAdd(1, 2));        // 3
console.log("jsAdd(1, '2') =", jsAdd(1, "2"));    // '12'：字符串拼接，不是数学加法！

// ===== 2. TS 风格：加类型标注，编译期就拦截错误 =====
function tsAdd(a: number, b: number): number {
  // a 和 b 都必须是 number，返回值也是 number
  return a + b;
}
console.log("tsAdd(1, 2) =", tsAdd(1, 2));        // 3
// tsAdd(1, "2"); // ❌ 编译期报错：'2' 是 string，不能赋给 number

// ===== 3. 变量声明带类型注解：编译时类型被擦除，运行时只剩值 =====
const age: number = 18;          // 显式标注为 number
const username: string = "TS";   // 显式标注为 string
const isOnline: boolean = true;  // 显式标注为 boolean
console.log("age =", age, "| username =", username, "| isOnline =", isOnline);

// ===== 4. 类型标注如何拦截潜在 bug：访问 undefined 的属性 =====
type User = { id: number; name: string };

const users: User[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

// TS 风格：find 返回 User | undefined，强制你处理 undefined 分支
function getUserName(id: number): string {
  const u = users.find((x) => x.id === id); // u: User | undefined
  if (u === undefined) {
    return "unknown"; // 必须显式处理 undefined 才能通过编译
  }
  return u.name;
}
console.log("getUserName(1) =", getUserName(1));    // Alice
console.log("getUserName(99) =", getUserName(99));  // unknown

// ===== 5. 演示编译产物：把上面的 TS 编译成 JS 会变成什么样 =====
// 编译后类型标注全部消失，只剩纯 JS：
//   function tsAdd(a, b) { return a + b; }
//   const age = 18;
//   const username = "TS";
// 运行时和写 JS 完全一样，没有额外开销
console.log("→ 类型标注仅在编译期存在，运行时被完全擦除");
`,
  },

  // ============================================================
  // 第二章：安装与运行
  // ============================================================
  {
    id: "tsbook-install-and-run",
    group: "入门基础",
    icon: "⚙️",
    title: "安装与运行",
    content: `## 安装与运行

TS 不能直接在浏览器或 Node.js 里跑，必须先编译成 JS。这一章讲清楚怎么装、怎么编译、怎么运行。

### 一、安装 TypeScript

TS 本质就是一个 npm 包 \`typescript\`，里面带一个编译器命令 \`tsc\`。

**1. 全局安装（学习阶段推荐）**

\`\`\`bash
npm install -g typescript
# 验证安装
tsc --version
\`\`\`

全局装完后命令行可以直接用 \`tsc\` 命令。

**2. 项目内安装（生产推荐）**

\`\`\`bash
npm install --save-dev typescript
npx tsc --version
\`\`\`

项目内安装的好处：**版本固定**，团队成员用的 TS 版本一致，不会因为本机全局版本不同导致编译行为不一致。

> 生产项目几乎都用项目内安装，全局安装只用于快速试语法。

### 二、tsc：编译单个文件

最直接的用法——把一个 \`.ts\` 文件编译成 \`.js\`：

\`\`\`bash
# 把 hello.ts 编译成 hello.js
tsc hello.ts

# 指定输出文件名
tsc hello.ts --outFile bundle.js

# 监听文件变化，自动重新编译
tsc hello.ts --watch
\`\`\`

举例，有这样一个 \`hello.ts\`：

\`\`\`ts
const msg: string = "Hello TS";
console.log(msg);
\`\`\`

执行 \`tsc hello.ts\` 后，同目录会生成 \`hello.js\`：

\`\`\`js
var msg = "Hello TS";
console.log(msg);
\`\`\`

类型标注 \`: string\` 被擦除，剩下的就是纯 JS。

### 三、ts-node：跳过编译直接运行

每次都先编译再运行太麻烦。\`ts-node\` 让你**直接运行 .ts 文件**，它在内存里编译、内存里执行，不产生 .js 文件。

\`\`\`bash
# 全局安装
npm install -g ts-node

# 直接运行 .ts
ts-node hello.ts

# 也可以用 npx
npx ts-node hello.ts
\`\`\`

学习阶段几乎都靠 \`ts-node\`，写完代码立刻能看结果。

### 四、tsconfig.json：项目配置文件

真实 TS 项目根目录都有一个 \`tsconfig.json\`，告诉 \`tsc\` 这些事：

- 哪些文件要编译（\`include\` / \`files\`）。
- 编译成哪个 JS 版本（\`target\`：ES5 / ES2020 / ESNext）。
- 用哪种模块系统（\`module\`：CommonJS / ESNext）。
- 严格模式开多大（\`strict\`：true 一次打开所有严格检查）。
- 输出到哪个目录（\`outDir\`）。

最简配置：

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "strict": true,
    "outDir": "./dist",
    "esModuleInterop": true
  },
  "include": ["src/**/*"]
}
\`\`\`

关键选项速查：

| 选项 | 作用 | 推荐值 |
| --- | --- | --- |
| \`target\` | 编译目标 JS 版本 | \`ES2020\` 起步 |
| \`module\` | 模块系统 | Node 用 \`CommonJS\`，前端用 \`ESNext\` |
| \`strict\` | 开启所有严格类型检查 | \`true\`（强烈推荐） |
| \`outDir\` | 编译产物目录 | \`./dist\` |
| \`esModuleInterop\` | 兼容 CommonJS 默认导入 | \`true\` |
| \`skipLibCheck\` | 跳过 .d.ts 类型检查（提速） | \`true\` |

> 一旦项目有 \`tsconfig.json\`，直接跑 \`tsc\` 不带参数，就会按配置编译整个项目。

### 五、inline tsconfig：单文件快速试

不想创建完整项目，只想跑一段 TS？可以用命令行参数内联配置：

\`\`\`bash
# 不写 tsconfig.json，直接指定关键选项
tsc hello.ts --target ES2020 --module CommonJS --strict --outDir ./dist

# ts-node 也支持内联
ts-node --compiler-options '{ "strict": true }' hello.ts
\`\`\`

本教程的沙箱就是用 \`ts.transpileModule\` + 内联配置直接运行单段代码的，原理跟 \`ts-node\` 类似。

### 六、TS 与 Deno / Bun 的关系

- **Deno**：作者 Ryan Dahl（也是 Node.js 作者）默认支持 TS，不需要编译——运行时内置了 TS 编译器。
- **Bun**：新一代 JS 运行时，同样原生支持 TS，启动速度极快。
- **Node.js**：从 Node 22.6 起有了实验性的 \`--experimental-strip-types\`，未来可能原生支持。

\`\`\`bash
# Deno 直接运行 .ts
deno run hello.ts

# Bun 直接运行 .ts
bun run hello.ts

# Node 实验性支持（22.6+）
node --experimental-strip-types hello.ts
\`\`\`

虽然运行时在演进，但**编译期类型检查 + IDE 集成**这套生态目前还是以 \`tsc\` 为核心。

### 小结

- 安装：\`npm i -g typescript\`（学习）或 \`npm i -D typescript\`（项目）。
- 编译：\`tsc file.ts\` 把 .ts 编译成 .js。
- 运行：\`ts-node file.ts\` 直接跑 .ts，不产生中间文件。
- 配置：\`tsconfig.json\` 控制编译选项，\`strict: true\` 必开。
- Deno / Bun 原生支持 TS，但 \`tsc\` 仍是类型检查核心。

下一章我们正式进入 TS 类型系统，先认识所有基础类型。`,
    code: `// 第二章 Demo：模拟 tsc 编译 + ts-node 运行 + inline tsconfig 的效果
// 沙箱用 ts.transpileModule 执行，等价于 ts-node 的内联模式

// ===== 1. 这段代码会被 ts.transpileModule 编译后再执行 =====
// 等价于命令行：ts-node --compiler-options '{ "strict": true }' hello.ts
const message: string = "Hello from TypeScript";
console.log("运行结果：", message);

// ===== 2. 模拟 tsc 编译单文件：演示「类型标注被擦除」 =====
// 源代码：
//   const count: number = 42;
//   function greet(name: string): string { return "hi " + name; }
// tsc 编译后产物（.js）：
//   const count = 42;
//   function greet(name) { return "hi " + name; }
const count: number = 42;
function greet(name: string): string {
  return "hi " + name;
}
console.log("count =", count, "| greet('TS') =", greet("TS"));

// ===== 3. inline tsconfig 等价配置（这里用注释说明） =====
// 命令行等价：
//   tsc hello.ts \\
//     --target ES2020 \\
//     --module CommonJS \\
//     --strict \\
//     --esModuleInterop \\
//     --outDir ./dist
// 沙箱默认配置：
//   target: ES2020, module: CommonJS, strict: true

// ===== 4. 严格模式（strict: true）拦截不安全代码 =====
function half(x: number): number {
  // strict 模式下函数必须有返回值，不能 undefined 穿透
  return x / 2;
}
console.log("half(10) =", half(10));

// ===== 5. 演示 ts-node 风格：直接执行、不产生 .js 文件 =====
// 这段代码不会在硬盘上生成 .js，全在内存里编译+执行
interface Point {
  x: number;
  y: number;
}

const p: Point = { x: 3, y: 4 };
const dist: number = Math.sqrt(p.x * p.x + p.y * p.y);
console.log("点", p, "到原点距离 =", dist);

// ===== 6. 验证编译产物：transpileModule 把 TS 转成 JS 的过程 =====
// 内部等价于：
//   ts.transpileModule(sourceCode, {
//     compilerOptions: { target: ES2020, module: CommonJS }
//   })
// 返回的 outputText 就是擦除类型后的 JS 代码，再交给 Node 执行
console.log("→ 沙箱用 ts.transpileModule 编译后直接运行，不生成 .js 文件");
`,
  },

  // ============================================================
  // 第三章：基础类型
  // ============================================================
  {
    id: "tsbook-basic-types",
    group: "入门基础",
    icon: "🔤",
    title: "基础类型",
    content: `## 基础类型

这一章把 TS 里所有基础类型一次讲清。每个类型都对应 JS 里的一个值类型，TS 只是给它一个名字用来标注。

### 一、原始类型（Primitives）

JS 有 7 种原始类型，TS 全部支持：

| TS 类型 | 对应 JS 值 | 示例 |
| --- | --- | --- |
| \`string\` | 字符串 | \`"hi"\`、\`'a'\`、\\\`多行\\\` |
| \`number\` | 数字（整数+浮点） | \`42\`、\`3.14\`、\`0xff\` |
| \`boolean\` | 布尔 | \`true\` / \`false\` |
| \`null\` | 空值 | \`null\` |
| \`undefined\` | 未定义 | \`undefined\` |
| \`symbol\` | 唯一值 | \`Symbol("id")\` |
| \`bigint\` | 大整数 | \`123n\` |

\`\`\`ts
let str: string = "hello";
let num: number = 42;
let flag: boolean = true;
let nothing: null = null;
let undef: undefined = undefined;
let sym: symbol = Symbol("id");
let big: bigint = 123n;
\`\`\`

### 二、null 与 undefined 的区别

这两个在 JS 里都表示「没有」，但语义不同：

- **\`undefined\`**：变量声明了但**没赋值**，或函数参数没传，或对象属性不存在。表示「**未初始化**」。
- **\`null\`**：开发者**主动赋的空值**，表示「这里现在没值，但是有意为之」。表示「**显式空**」。

\`\`\`ts
let a: string;            // 声明但未赋值
console.log(a);           // undefined

let b: string | null = null; // 显式赋空
\`\`\`

在 \`--strict\` 模式下，\`null\` 和 \`undefined\` **各自独立**，不能互相赋值：

\`\`\`ts
let x: string = undefined; // ❌ strict 模式报错
let y: string | undefined = undefined; // ✅
\`\`\`

### 三、Array 数组

两种等价写法：

\`\`\`ts
let nums: number[] = [1, 2, 3];        // 推荐：简洁
let strs: Array<string> = ["a", "b"];  // 泛型写法
\`\`\`

数组元素类型必须一致，混类型会报错（除非用联合类型）：

\`\`\`ts
let mixed: (number | string)[] = [1, "a", 2, "b"]; // ✅ 联合类型数组
\`\`\`

### 四、Tuple 元组

元组是**固定长度、固定类型**的数组，每个位置类型可以不同：

\`\`\`ts
let pair: [string, number] = ["Alice", 25];
//     索引0必须是string，索引1必须是number

let triple: [string, number, boolean] = ["OK", 200, true];
\`\`\`

> 元组适合表达「固定的结构化数据」，比如 HTTP 响应 \`[status, body]\`、坐标 \`[x, y]\`。但结构复杂时建议用对象或 \`interface\`。

### 五、enum 枚举

枚举用来给一组相关的常量起名字，避免到处写魔法数字：

\`\`\`ts
enum Color { Red, Green, Blue }
let c: Color = Color.Green;  // 1

enum Direction { Up = "UP", Down = "DOWN" }
let d: Direction = Direction.Up;  // "UP"
\`\`\`

枚举分两类：

- **数字枚举**：默认从 0 开始递增，可双向映射（\`Color[1] === "Green"\`）。
- **字符串枚举**：必须显式赋值，没有反向映射。

### 六、void

\`void\` 表示「没有返回值」，几乎只用在函数返回类型上：

\`\`\`ts
function log(msg: string): void {
  console.log(msg);
  // 不 return，或 return; 都算 void
}
\`\`\`

> 不要把 \`void\` 当变量类型——它只能装 \`undefined\`，没意义。

### 七、never：永远不会有值

\`never\` 表示「**永远不可能有值**」的类型。两种典型场景：

1. **函数永远抛错或死循环**：

\`\`\`ts
function fail(msg: string): never {
  throw new Error(msg);  // 永远不会正常返回
}

function infiniteLoop(): never {
  while (true) {}  // 永远不会返回
}
\`\`\`

2. **穷尽检查（exhaustive check）**：

\`\`\`ts
type Shape = "circle" | "square";

function area(s: Shape): number {
  switch (s) {
    case "circle": return Math.PI;
    case "square": return 1;
    default:
      // 如果以后加了新分支但忘了处理，这里会编译报错
      const _exhaustive: never = s;
      return _exhaustive;
  }
}
\`\`\`

\`never\` 是所有类型的子类型，但没有任何值能赋给它。

### 八、any：放弃类型检查

\`any\` 表示「任意类型」，等同于回到 JS 模式——**关闭对它的类型检查**：

\`\`\`ts
let x: any = 10;
x = "string";   // ✅ 不报错
x.foo();        // ✅ 不报错，运行时崩
\`\`\`

> \`any\` 是逃生舱，能不用就不用。用了 \`any\` 等于在那一行写 JS。

### 九、unknown：安全的 any

\`unknown\` 也是「任意类型」，但**类型安全**——不能直接用，必须先 narrowing：

\`\`\`ts
let x: unknown = JSON.parse('{"a":1}');

// x.a;  // ❌ 报错：unknown 不能直接访问属性
if (typeof x === "object" && x !== null && "a" in x) {
  console.log(x.a);  // ✅ 经过类型守卫才能用
}
\`\`\`

### any vs unknown 对比

| 维度 | \`any\` | \`unknown\` |
| --- | --- | --- |
| 接受任意值 | ✅ | ✅ |
| 直接读属性 | ✅（不安全） | ❌（必须先 narrowing） |
| 赋给其他类型 | ✅（污染） | ❌（除非先断言/守卫） |
| 推荐场景 | 临时逃生、迁移老代码 | 接收外部数据、JSON.parse |

> 经验：**凡是从外部进来的数据（API、JSON、用户输入），用 \`unknown\`**，强制做类型检查后再用。

### 小结

- 原始类型 7 个：string / number / boolean / null / undefined / symbol / bigint。
- 数组 \`T[]\`，元组固定长度，枚举给常量起名。
- \`void\` 表示函数无返回值，\`never\` 表示永远不返回。
- \`any\` 关闭检查，\`unknown\` 强制做检查——优先用 \`unknown\`。

下一章讲什么时候该手动写类型、什么时候让 TS 自己推。`,
    code: `// 第三章 Demo：TS 所有基础类型一次看完
// 沙箱执行：ts.transpileModule + target ES2020 + CommonJS

// ===== 1. 原始类型：string / number / boolean =====
const name: string = "TypeScript";       // 字符串
const version: number = 5.4;             // 数字（整数浮点都用 number）
const isAwesome: boolean = true;         // 布尔
console.log("[原始]", name, version, isAwesome);

// ===== 2. null 与 undefined：两者语义不同 =====
let notAssigned: string | undefined;     // 声明但未赋值 → undefined
notAssigned = undefined;
console.log("[undefined]", notAssigned);

let explicitNull: string | null = null;  // 显式赋空
console.log("[null]", explicitNull);

// ===== 3. symbol 与 bigint =====
const sym: symbol = Symbol("id");        // 唯一值，常做对象 key
const big: bigint = 9007199254740993n;   // 超过 Number.MAX_SAFE_INTEGER 的大整数
console.log("[symbol]", sym.toString(), "| [bigint]", big);

// ===== 4. Array 数组：两种等价写法 =====
const nums: number[] = [1, 2, 3, 4, 5];            // 推荐：T[] 写法
const strs: Array<string> = ["a", "b", "c"];       // 泛型写法
const mixed: (number | string)[] = [1, "a", 2];    // 联合类型数组
console.log("[Array]", nums, strs, mixed);

// ===== 5. Tuple 元组：固定长度、固定类型 =====
const pair: [string, number] = ["Alice", 25];      // [姓名, 年龄]
const triple: [string, number, boolean] = ["OK", 200, true];
console.log("[Tuple]", pair, triple);

// ===== 6. enum 枚举：给常量起名字 =====
enum Color { Red = 0, Green = 1, Blue = 2 }        // 数字枚举
enum Status { Success = "SUCCESS", Fail = "FAIL" } // 字符串枚举
const c: Color = Color.Green;
const s: Status = Status.Success;
console.log("[enum]", "Color =", c, "| Status =", s);

// ===== 7. void：函数无返回值 =====
function log(msg: string): void {
  // void 表示这个函数不返回有意义的值
  console.log("[void]", msg);
}
log("hello void");

// ===== 8. never：函数永远不会正常返回 =====
function fail(msg: string): never {
  // never：抛错后控制流不会继续
  throw new Error("[never] " + msg);
}
function infinite(): never {
  // never：死循环也不会返回
  while (true) { break; } // 这里 break 仅为演示，真实 never 函数不会 break
}

// ===== 9. 穷尽检查：用 never 保证 switch 分支完整 =====
type Shape = "circle" | "square";
function area(s: Shape): number {
  switch (s) {
    case "circle": return Math.PI;       // 圆面积占位
    case "square": return 1;             // 方面积占位
    default:
      // 如果以后 Shape 新增成员但忘了处理，这行编译报错
      const _exhaustive: never = s;
      return _exhaustive;
  }
}
console.log("[never 穷尽]", "circle area =", area("circle"));

// ===== 10. any：放弃类型检查（逃生舱，慎用） =====
const anything: any = 10;
const anything2: any = "string";
console.log("[any]", anything + anything2);  // 10string，类型被放弃

// ===== 11. unknown：安全的 any，必须先 narrowing 才能用 =====
const raw: unknown = JSON.parse('{"name":"TS","year":2012}');
// raw.name;  // ❌ unknown 不能直接读属性
if (typeof raw === "object" && raw !== null && "name" in raw) {
  // 经过类型守卫后才能安全访问
  const name2 = (raw as { name: string }).name;
  console.log("[unknown]", "name =", name2);
}
`,
  },

  // ============================================================
  // 第四章：类型注解与类型推导
  // ============================================================
  {
    id: "tsbook-type-annotation",
    group: "入门基础",
    icon: "🏷️",
    title: "类型注解与类型推导",
    content: `## 类型注解与类型推导

TS 的类型可以**手写**（注解），也可以**让编译器推**（推导）。这一章讲清楚什么时候写、什么时候不写。

### 一、类型注解（Type Annotation）

注解就是手动告诉 TS 这个变量是什么类型，语法是 \`: 类型\`：

\`\`\`ts
let x: string = "hi";          // 变量
function add(a: number, b: number): number {  // 参数 + 返回值
  return a + b;
}
const arr: number[] = [1, 2, 3];
\`\`\`

注解是「写给编译器看的契约」。一旦写了，TS 就按这个类型检查后续操作：

\`\`\`ts
let age: number = 18;
age = "20";  // ❌ 报错：string 不能赋给 number
\`\`\`

### 二、类型推导（Type Inference）

如果声明变量时**不写注解但有初始值**，TS 会根据初始值**自动推导**类型：

\`\`\`ts
let count = 10;        // 推导为 number
let name = "Alice";    // 推导为 string
let list = [1, 2, 3];  // 推导为 number[]

// count = "x";  // ❌ 推导后仍然受类型约束
\`\`\`

推导出来的类型和手写的效果**完全一样**，后续赋值还是受约束。

### 三、let vs const 的推导差异

这是 TS 最容易踩坑的点之一。

**\`let\` 推导为「宽类型」**：

\`\`\`ts
let x = "hi";   // 推导为 string（因为 let 可重新赋值）
x = "bye";      // ✅ 还是 string
\`\`\`

**\`const\` 推导为「字面量类型」**：

\`\`\`ts
const x = "hi"; // 推导为 "hi"（字面量类型，因为这个值不会再变）
// x = "bye";   // ❌ const 本身就不能重新赋值
\`\`\`

字面量类型就是把具体的值当成类型：

\`\`\`ts
const n = 42;       // 类型是 42（不是 number）
const flag = true;  // 类型是 true（不是 boolean）
\`\`\`

这个特性在联合类型里特别有用：

\`\`\`ts
type Direction = "up" | "down" | "left" | "right";
const d: Direction = "up";  // ✅ "up" 是 Direction 的成员
\`\`\`

### 四、最佳通用类型（Best Common Type）

当推导面对多个候选时，TS 会找一个「能涵盖所有值的最佳通用类型」：

\`\`\`ts
let arr = [1, 2, 3];           // 推导为 number[]
let mixed = [1, "a", true];    // 推导为 (number | string | boolean)[]
\`\`\`

但有时候推导不出来，需要你帮一把：

\`\`\`ts
class Dog { bark() {} }
class Cat { meow() {} }

// 推导为 (Dog | Cat)[]，但如果你想要 Animal[]，得显式标注
let pets: Animal[] = [new Dog(), new Cat()];
\`\`\`

### 五、什么时候写注解

**该写注解的场景**：

1. **函数参数**：调用方看不到初始值，必须显式标注。

\`\`\`ts
function greet(name: string) {  // ✅ 参数必须写
  console.log("hi " + name);
}
\`\`\`

2. **函数返回值**：复杂逻辑容易推错，显式标注能卡住实现。

\`\`\`ts
function parse(s: string): number {  // ✅ 显式返回类型
  return parseInt(s, 10);
}
\`\`\`

3. **变量类型不明确**：比如从 API、JSON、第三方库拿到的数据。

\`\`\`ts
const data: User = await fetchUser();  // ✅ 显式标注
\`\`\`

4. **想用更宽的类型**：比如想让变量接受多种类型。

\`\`\`ts
let id: string | number = 1;  // ✅ 联合类型必须显式
\`\`\`

### 六、什么时候让 TS 推导

**该推导的场景**：

1. **局部变量有明确初始值**：

\`\`\`ts
const count = 10;          // 不用写 : number
const name = "Alice";      // 不用写 : string
const list = [1, 2, 3];    // 不用写 : number[]
\`\`\`

2. **简单表达式结果**：

\`\`\`ts
const total = price * qty;  // 推导为 number，不用写
\`\`\`

3. **不暴露给外部的中间变量**：

\`\`\`ts
const upper = name.toUpperCase();  // 推导为 string
\`\`\`

> 经验法则：**接口（参数、返回值、导出变量）写注解，内部实现让推导**。这样代码既清晰又不啰嗦。

### 七、推导的局限

有些场景推导不出来或推得不准，必须显式：

\`\`\`ts
// 1. 没有初始值
let x;          // 推导为 any（strict 模式会警告）
let x: number;  // 必须显式

// 2. 函数返回类型推断太宽
function pick() {
  if (Math.random() > 0.5) return "a";
  return 1;  // 推断为 "a" | number，可能不是你想要的
}

// 3. 复杂泛型
const result = JSON.parse('{"a":1}');  // 推断为 any，最好显式 unknown + 守卫
\`\`\`

### 小结

- 注解语法 \`: 类型\`，推导靠初始值自动判断。
- \`let\` 推导为宽类型，\`const\` 推导为字面量类型。
- 函数参数、返回值、对外接口**必须**写注解。
- 局部变量、简单表达式**让 TS 推**。
- 推导不出来或推得太宽时，再显式标注。

下一章讲 \`var\` / \`let\` / \`const\` 的作用域差异，这是写 TS 的基本盘。`,
    code: `// 第四章 Demo：类型注解 vs 类型推导，let vs const 的推导差异
// 沙箱执行：ts.transpileModule + target ES2020 + CommonJS

// ===== 1. 手动注解：明确写出类型 =====
const username: string = "TypeScript";     // 显式标注 string
const version: number = 5.4;               // 显式标注 number
const isActive: boolean = true;            // 显式标注 boolean
console.log("[注解]", username, version, isActive);

// ===== 2. 类型推导：不写注解，TS 根据初始值自动判断 =====
const count = 10;        // 推导为 number（字面量推导到宽类型用 const 时是字面量 10）
const message = "hi";    // 推导为字面量类型 "hi"
const list = [1, 2, 3];  // 推导为 number[]
console.log("[推导]", count, message, list);

// ===== 3. let vs const：推导结果不同 =====
let x = "hello";         // let 推导为 string（宽类型，因为可重新赋值）
const y = "hello";       // const 推导为字面量类型 "hello"（值不会变）
x = "world";             // ✅ string 仍可接受 string
// y = "world";          // ❌ const 不能重新赋值
console.log("[let/const]", "let x =", x, "| const y =", y);

// ===== 4. 字面量类型在联合类型中的应用 =====
type Direction = "up" | "down" | "left" | "right";
function move(d: Direction): string {
  return "向 " + d + " 移动";
}
console.log("[字面量]", move("up"));   // ✅ "up" 是 Direction 成员
// move("north");  // ❌ "north" 不在联合里

// ===== 5. 函数参数必须显式注解（调用方看不到初始值） =====
function greet(name: string, age: number): string {
  // 参数 name/age 必须写类型，否则隐式 any（strict 模式报错）
  return \`你好 \${name}，\${age} 岁\`;
}
console.log("[函数注解]", greet("TS", 13));

// ===== 6. 返回值建议显式注解：卡住实现，避免推错 =====
function parse(s: string): number {
  // 显式标注返回 number，如果你不小心 return 了 string，编译期就报错
  return parseInt(s, 10);
}
console.log("[返回值]", parse("42"));

// ===== 7. 最佳通用类型：多类型数组推导为联合 =====
const mixed = [1, "a", true];   // 推导为 (number | string | boolean)[]
console.log("[最佳通用类型]", mixed);

// ===== 8. 推导不出来的场景：必须显式 =====
let later: number;              // 无初始值，必须显式声明类型
later = 100;
console.log("[无初始值]", later);

// ===== 9. 联合类型必须显式（推导推不出来） =====
let id: string | number = 1;    // 既可能是数字也可能是字符串
id = "ABC123";
console.log("[联合]", id);

// ===== 10. const 字面量推导 vs let 宽类型推导：完整对比 =====
const pi = 3.14159;             // 类型：3.14159（字面量）
let counter = 0;                // 类型：number（宽类型）
console.log("[完整对比]", "const pi =", pi, "| let counter =", counter);
`,
  },

  // ============================================================
  // 第五章：var/let/const 与作用域
  // ============================================================
  {
    id: "tsbook-var-let-const",
    group: "入门基础",
    icon: "🔒",
    title: "var/let/const 与作用域",
    content: `## var / let / const 与作用域

TS 完全继承 JS 的变量声明机制。\`var\` / \`let\` / \`const\` 三者的差异是写好 TS 代码的基本盘。

### 一、var 的历史与缺陷

\`var\` 是 ES5 时代唯一的声明方式，有几个臭名昭著的缺陷：

**1. 函数作用域，没有块作用域**

\`\`\`js
function f() {
  if (true) {
    var x = 1;
  }
  console.log(x);  // 1 —— x 跑出了 if 块
}
\`\`\`

**2. 变量提升（hoisting）**

\`\`\`js
console.log(x);  // undefined（不报错！x 被提升到顶部）
var x = 1;
\`\`\`

**3. 允许重复声明**

\`\`\`js
var x = 1;
var x = 2;  // 不报错，覆盖了
\`\`\`

**4. 全局变量挂到 window**

\`\`\`js
var g = 1;
console.log(window.g);  // 1 —— 污染全局对象
\`\`\`

这些缺陷在大型项目里是 bug 的温床，所以 ES6 引入了 \`let\` 和 \`const\`。

### 二、let：块级作用域的变量

\`let\` 修复了 \`var\` 的所有缺陷：

**1. 块级作用域**

\`\`\`ts
{
  let x = 1;
  console.log(x);  // 1
}
// console.log(x);  // ❌ x 不存在，块外访问不到
\`\`\`

**2. 暂时性死区（TDZ）**

\`let\` 声明的变量在声明语句执行前**不可访问**，这叫 Temporal Dead Zone：

\`\`\`ts
console.log(x);  // ❌ ReferenceError: Cannot access 'x' before initialization
let x = 1;
\`\`\`

TDZ 强制你「先声明后使用」，避免了 \`var\` 的提升陷阱。

**3. 不允许重复声明**

\`\`\`ts
let x = 1;
let x = 2;  // ❌ SyntaxError: Identifier 'x' has already been declared
\`\`\`

**4. 不挂到 window**

\`\`\`ts
let g = 1;
console.log(window.g);  // undefined
\`\`\`

### 三、const：不可重新赋值

\`const\` 在 \`let\` 的基础上加了一条：**声明时必须赋值，且不能重新赋值**。

\`\`\`ts
const pi = 3.14159;
// pi = 3;        // ❌ TypeError: Assignment to constant variable.
// const x;       // ❌ 必须初始化
\`\`\`

**注意：const 不等于「值不可变」**

\`const\` 冻结的是「绑定」，不是「值」。对象和数组的内部内容还是可以改：

\`\`\`ts
const arr = [1, 2, 3];
arr.push(4);     // ✅ 改的是数组内容，不是 arr 的绑定
// arr = [5];    // ❌ 重新赋值才报错

const obj = { x: 1 };
obj.x = 2;       // ✅ 改属性
// obj = {};     // ❌ 重新赋值才报错
\`\`\`

如果要真正冻结对象，用 \`Object.freeze\`：

\`\`\`ts
const frozen = Object.freeze({ x: 1 });
frozen.x = 2;    // 静默失败（strict 模式抛错）
\`\`\`

### 四、为什么默认用 const

ES6 之后的最佳实践是：**默认 const，需要重新赋值才用 let，永远不用 var**。

理由：

1. **const 表达意图**：声明即「这个值不会变」，读代码的人一眼就懂。
2. **减少 bug**：误改一个本不该改的变量，编译期就拦住。
3. **利于优化**：引擎知道绑定不变，可以做更激进的优化。
4. **配合 TS 类型推导**：const 推导出字面量类型，类型更精确。

\`\`\`ts
// ✅ 推荐：默认 const
const url = "https://api.example.com";
const config = { timeout: 5000 };

// 需要重新赋值时才用 let
let count = 0;
count++;
\`\`\`

### 五、循环里的 var vs let

经典面试题：循环闭包。

\`\`\`js
// var：所有定时器都拿到 5
for (var i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 0);  // 5 5 5 5 5
}

// let：每次迭代都是新的 i
for (let i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 0);  // 0 1 2 3 4
}
\`\`\`

\`let\` 在每次循环迭代都创建一个新的绑定，闭包捕获的是当前迭代的值。

### 六、var / let / const 对比表

| 特性 | \`var\` | \`let\` | \`const\` |
| --- | --- | --- | --- |
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 提升 | 是（值为 undefined） | 否（TDZ） | 否（TDZ） |
| 重复声明 | 允许 | 禁止 | 禁止 |
| 重新赋值 | 允许 | 允许 | **禁止** |
| 必须初始化 | 否 | 否 | **是** |
| 挂到 window | 是 | 否 | 否 |
| 推荐使用 | ❌ 不用 | 需要改时用 | ✅ 默认 |

### 小结

- \`var\` 有作用域、提升、重复声明三大缺陷，**永远不要用**。
- \`let\` 块级作用域 + TDZ，**需要重新赋值时用**。
- \`const\` 不可重新赋值，**默认首选**。
- \`const\` 冻结绑定不冻结值，对象内容仍可改。
- 循环闭包用 \`let\` 才能正确捕获每次迭代的值。

入门基础 5 章到这里就结束了。下一批我们进入「类型系统」，把 TS 的类型能力彻底讲透。`,
    code: `// 第五章 Demo：var / let / const 的作用域与重新赋值行为对比
// 沙箱执行：ts.transpileModule + target ES2020 + CommonJS

// ===== 1. var 的缺陷：函数作用域 + 变量提升 =====
function varDemo(): void {
  // var 声明被提升到函数顶部，但赋值不提升
  // console.log(x);  // 这里访问会得到 undefined（提升），不报错
  if (true) {
    var x = 1;          // var 是函数作用域，x 跑出 if 块
  }
  console.log("[var]", "if 块外仍能访问 x =", x);  // 1
}
varDemo();

// ===== 2. let 的改进：块级作用域 + TDZ =====
function letDemo(): void {
  if (true) {
    let y = 2;           // let 是块级作用域，y 只在 if 块内有效
    console.log("[let]", "if 块内 y =", y);
  }
  // console.log(y);    // ❌ 块外访问会报错：y is not defined
}
letDemo();

// ===== 3. const 的语义：不可重新赋值，但内容可变 =====
const pi: number = 3.14159;
// pi = 3;              // ❌ const 不能重新赋值
console.log("[const]", "pi =", pi);

// const 冻结的是绑定，不是值——数组内容可以改
const arr: number[] = [1, 2, 3];
arr.push(4);             // ✅ 改的是数组内容，不是 arr 的绑定
console.log("[const 内容可变]", arr);

// const 对象同理：属性可改，重新赋值不行
const obj: { x: number } = { x: 1 };
obj.x = 2;               // ✅ 改属性
console.log("[const 对象属性可改]", obj);

// ===== 4. 默认用 const：表达「这个值不会变」的意图 =====
const url: string = "https://api.example.com";   // 配置常量
const config: { timeout: number } = { timeout: 5000 };
console.log("[默认 const]", url, config);

// 需要重新赋值时才升级为 let
let counter: number = 0;
counter += 1;
counter += 1;
console.log("[需要 let]", "counter =", counter);

// ===== 5. 循环里的 var vs let：闭包捕获差异 =====
// var：所有定时器共享同一个 i（循环结束时 i = 5）
var varResults: number[] = [];
for (var i = 0; i < 3; i++) {
  varResults.push(i);    // 立即 push，避免定时器异步问题，但演示 var 行为
}
console.log("[循环 var]", varResults, "| 循环后 i =", i);  // i 跑出循环

// let：每次迭代都是新的绑定
let letResults: number[] = [];
for (let j = 0; j < 3; j++) {
  letResults.push(j);    // j 是块级作用域，每次迭代都是新值
}
// console.log(j);       // ❌ 块外访问不到 j
console.log("[循环 let]", letResults);

// ===== 6. 真正冻结对象：Object.freeze =====
const frozen: Readonly<{ x: number }> = Object.freeze({ x: 1 });
// frozen.x = 2;        // ❌ strict 模式抛 TypeError
console.log("[Object.freeze]", frozen, "→ 内容真的不可变");

// ===== 7. 重复声明：var 允许，let/const 禁止 =====
var dup = 1;
var dup = 2;             // ✅ var 允许重复声明（危险）
console.log("[var 重复声明]", "dup =", dup);

// let dup2 = 1;
// let dup2 = 2;        // ❌ SyntaxError: Identifier 'dup2' has already been declared

// ===== 8. 全局污染：var 挂 window，let/const 不挂 =====
// 浏览器环境下：
//   var g = 1;  →  window.g === 1  (污染全局对象)
//   let h = 1;  →  window.h === undefined (不污染)
// Node 环境没有 window，但 var 仍会污染 global（沙箱内不演示）
console.log("[全局污染]", "var 会污染全局对象，let/const 不会");
`,
  },
];
