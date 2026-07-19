// =============================================================
// React 中使用 TypeScript 从入门到精通大全 —— 第一批章节
// -------------------------------------------------------------
// 覆盖：开篇（学习路线） + 第一部分 TypeScript 类型基础 上半
// 包含 6 个章节：preface + ch01 ~ ch05
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
  // 开篇：前言与学习路线
  // ============================================================
  {
    id: "tsx3-preface",
    group: "开篇",
    icon: "📖",
    title: "前言与学习路线",
    content: `# 前言：为什么你需要这本书

如果你正在写 React，又恰好用上了 TypeScript，那这本书就是写给你的。

React 是当下最主流的视图库，TypeScript 是当下最主流的前端类型系统。两者结合能让你在编译期就发现 80% 的低级错误——typo、字段写错、props 类型对不上、API 返回结构变了——这些原本要等到运行时才暴露的问题，在 IDE 红线提示下被提前解决。

但市面上的资料要么只讲 TypeScript 语法、脱离 React；要么只讲 React 用法、缺了类型系统的深度。本书的目标是 **把两者揉在一起讲**：每一个 TypeScript 概念都配 React 场景的 demo，每一个 React 模式都给出类型安全的写法。

## 本书面向谁

- **会 JS 但没系统学过 TS 的同学**：从类型注解开始，逐步到泛型、条件类型。
- **会 React 但没写过 TS+React 的同学**：从函数组件开始，到 Hooks、Context、状态管理、性能优化。
- **已经在用 TS+React 但想系统化补齐的同学**：可以直接跳到你不熟的章节，每章独立可读。
- **准备面试中高级前端的同学**：本书覆盖的知识点与社区主流面试题高度重合。

## 学习路线全景图

整本书分成 **13 个部分、82 章**。下表是鸟瞰图，前 4 部分是基础，建议按顺序读；后续可按需查阅。

| 部分 | 内容 | 章数 | 目标 |
| --- | --- | --- | --- |
| 第一部分 | TypeScript 类型基础 | 10 | 掌握所有基础类型与类型注解 |
| 第二部分 | TypeScript 类型进阶 | 8 | 泛型、条件类型、工具类型、模块 |
| 第三部分 | React + TS 工程基础 | 8 | JSX、函数组件、Props、forwardRef、Context |
| 第四部分 | 事件与表单 | 6 | 事件类型、受控/非受控、Hook Form、Zod |
| 第五部分 | Hooks 全解 | 12 | 所有内置 Hook + 自定义 Hook 设计 |
| 第六部分 | 性能优化 | 6 | memo、虚拟列表、Suspense、性能分析 |
| 第七部分 | 数据请求 | 6 | fetch、axios、SWR、TanStack Query |
| 第八部分 | 状态管理 | 5 | Context、Zustand、Redux Toolkit、Jotai |
| 第九部分 | 路由 | 4 | React Router v6、Next.js App Router |
| 第十部分 | 样式方案 | 4 | CSS Modules、Tailwind、styled-components |
| 第十一部分 | 测试 | 4 | Jest、RTL、Playwright |
| 第十二部分 | 工程化 | 5 | Vite、ESLint、CI/CD、Monorepo |
| 第十三部分 | 进阶主题 | 4 | RSC、i18n、a11y、装饰器 |

**核心建议**：每章看完后动手敲一遍 demo。**不要复制粘贴**——亲手敲一遍能记住 80%，复制粘贴只能记住 5%。

## 版本约定

为了避免你看到代码却跑不起来，本书所有示例都基于：

- **TypeScript 5.x**（5.0 引入 \`const\` 类型参数、\`satisfies\` 操作符、装饰器稳定等）
- **React 18**（并发渲染、Suspense、useTransition、useDeferredValue 已稳定）
- **Node.js 18+**（用于本地运行编译后的 JS）
- **Vite 5+**（脚手架，不绑定特定框架）

代码里所有 React 18 新 API 都会显式说明；TS 5 的新特性也会标注"这是 TS 5 才有"。

## 如何使用本书

**边读边敲型**（推荐）：

1. 读每章的"为什么"段落建立认知。
2. 跟着 \`tsx 代码块逐行注释理解。
3. 在沙箱里运行看输出，修改参数观察行为变化。

**先通读再精读型**：

1. 先把每章小结看一遍，画思维导图。
2. 回头精读具体章节，重点放在"为什么"和"权衡"。
3. 每章末尾的"避坑清单"是高频踩雷点，做笔记。

## 你的第一个 TS + React Demo

下面这段代码可以在 \`/api/run-ts\` 沙箱里直接运行。它展示了三件事：函数类型注解、编译期类型检查、React 函数组件。

\`\`\`tsx
// 第一个 demo：TypeScript + React 的最小可运行示例

// 1. 函数类型注解：参数和返回值都标注 number
//    好处：调用方传错类型时，TS 在编译期就报错
const add = (a: number, b: number): number => {
  return a + b; // + 在 number 上下文里是数值相加
};

console.log("add(1, 2) =", add(1, 2)); // 打印 3

// 2. 一个最简单的 React 函数组件
//    props 类型直接写在参数解构里，TS 5 推荐"内联类型"
function Welcome({ name }: { name: string }) {
  // 返回 JSX，沙箱使用 ReactJSX 模式，无需手动 import React
  return <div>欢迎来到 TS+React 的世界，{name}！</div>;
}

// 3. 挂载到 DOM
//    createRoot 是 React 18 的新 API（替代了老的 ReactDOM.render）
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root")!);
// ! 是非空断言：告诉 TS 这个元素一定存在
root.render(<Welcome name="学习者" />);
\`\`\`

如果上面这段代码你完全看不懂，没关系——前两章就会把这些概念拆开讲清楚。把它摆在这里，只是让你先看到"我们要走向哪里"。

## 三个里程碑

我把整本书拆成三个里程碑：

1. **读完前 4 部分后**：你能独立写一个类型安全的小型 React 应用（如 Todo List）。
2. **读完前 7 部分后**：你能从零搭建一个带数据请求、状态管理、性能优化的中型应用。
3. **读完整本书后**：你能主导团队级 React+TS 工程的架构设计、测试、CI/CD。

准备好了吗？我们开始。`
  },

  // ============================================================
  // ch01: 安装与第一个 TS 程序
  // ============================================================
  {
    id: "tsx3-ch01",
    group: "第一部分 TypeScript 类型基础",
    icon: "🚀",
    title: "ch01 安装与第一个 TS 程序",
    content: `# ch01 安装与第一个 TypeScript 程序

## 为什么从安装讲起

很多教程直接跳过"安装"这一步，但**安装和环境配置**是最容易踩坑的环节——你下载别人的项目跑不起来，90% 是版本或配置问题。这一章先把环境搭好，后面所有 demo 都能顺利运行。

## 1. 全局安装 TypeScript

TypeScript 是一个 npm 包，可以用 npm/pnpm/yarn 安装：

\`\`\`bash
# 全局安装：在任何目录都能用 tsc 命令
npm install -g typescript

# 查看版本：确认安装成功
tsc --version
# 输出类似：Version 5.4.5
\`\`\`

> **避坑提示**：全局安装方便学习，但**真实项目不要全局安装**——每个项目应该用本地 \`node_modules/.bin/tsc\`，版本跟着 \`package.json\` 走，避免不同项目版本冲突。

## 2. 创建第一个 TS 文件

打开终端，建一个文件夹，写第一个 TS 文件：

\`\`\`bash
mkdir ts-hello && cd ts-hello
echo 'const msg: string = "Hello TS"; console.log(msg);' > hello.ts
\`\`\`

\`hello.ts\` 里的内容：

\`\`\`ts
// hello.ts
// : string 是类型注解，告诉 TS 变量 msg 必须是字符串
const msg: string = "Hello TS";
console.log(msg); // 打印 Hello TS
\`\`\`

## 3. 编译为 JS 运行

浏览器和 Node 都不能直接运行 .ts 文件，必须先编译成 .js。用 \`tsc\` 命令：

\`\`\`bash
tsc hello.ts
# 这条命令会生成 hello.js
node hello.js
# 输出：Hello TS
\`\`\`

打开 \`hello.js\` 你会发现它就是：

\`\`\`js
// 编译后：类型注解被擦除
var msg = "Hello TS";
console.log(msg);
\`\`\`

**这就是 TypeScript 的本质**：它是 JavaScript 的"超集"，所有 TS 特性都在编译期处理完，编译产物就是纯 JS。运行时没有任何 TS 痕迹。

## 4. 看见类型检查的价值

把 \`hello.ts\` 改成下面这样，看看会发生什么：

\`\`\`ts
// 故意把数字赋给字符串变量
const msg: string = 123;
//              ^^^ ❌ 报错：不能将类型"number"分配给类型"string"
console.log(msg);
\`\`\`

运行 \`tsc hello.ts\` 时，你会看到编译错误，**.js 文件不会被生成**（除非加 \`--noEmitOnError false\`）。

这就是 TS 的核心价值：**在编译期就拦下类型错误**，而不是等到运行时才报错。

## 5. tsconfig.json：项目的类型配置

真实项目里你不会一个文件一个文件地 \`tsc\`，而是用 \`tsconfig.json\` 统一配置。

\`\`\`bash
# 在项目根目录初始化 tsconfig
tsc --init
\`\`\`

它会生成一个 \`tsconfig.json\`，默认长这样（精简版）：

\`\`\`json
{
  "compilerOptions": {
    "target": "es2016",          // 编译目标 JS 版本
    "module": "commonjs",        // 模块系统
    "strict": true,              // 开启所有严格检查（强烈建议保持）
    "esModuleInterop": true,     // 兼容 CJS/ESM 互导
    "skipLibCheck": true,        // 跳过 .d.ts 检查加速编译
    "forceConsistentCasingInFileNames": true
  }
}
\`\`\`

下面是最常用的几个选项（**先记住这些，后面会反复用到**）：

| 选项 | 作用 | 推荐值 |
| --- | --- | --- |
| \`target\` | 编译产物的 JS 版本 | \`ES2020\` 或更高 |
| \`module\` | 模块系统 | \`ESNext\`（前端）/ \`commonjs\`（Node） |
| \`strict\` | 开启所有严格模式 | \`true\`（必开） |
| \`jsx\` | JSX 处理模式 | \`react-jsx\`（React 17+） |
| \`esModuleInterop\` | CJS/ESM 互导 | \`true\` |
| \`noUnusedLocals\` | 报告未使用的变量 | \`true\` |
| \`noUncheckedIndexedAccess\` | 索引返回 T \\| undefined | \`true\`（强烈建议） |

## 6. 在 React 项目里用 TS

实际开发中你很少手写 \`tsconfig.json\`，脚手架会帮你配好。下面是创建 React+TS 项目的两种主流方式：

\`\`\`bash
# 方式 1：Vite（推荐，启动快）
npm create vite@latest my-app -- --template react-ts

# 方式 2：Next.js（带 SSR / 路由）
npx create-next-app@latest my-app --typescript
\`\`\`

创建好的 Vite 项目结构大致是：

\`\`\`
my-app/
├── src/
│   ├── App.tsx          # 根组件
│   ├── main.tsx         # 入口文件
│   └── vite-env.d.ts    # Vite 类型声明
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
\`\`\`

\`App.tsx\` 默认内容：

\`\`\`tsx
// App.tsx
import { useState } from "react";

// 函数组件：props 是空对象（暂时不接受 props）
function App() {
  const [count, setCount] = useState(0); // 状态：number 类型，TS 自动推断

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        count is {count}
      </button>
    </div>
  );
}

export default App;
\`\`\`

\`useState(0)\` 这里没有显式写类型，但 TS 能从初始值 \`0\` 推断出 \`count\` 是 \`number\`。这就是**类型推断**——能推断就不必手写。

## 7. tsx 与 ts 的区别

- \`.ts\`：纯 TS 文件，不能写 JSX
- \`.tsx\`：支持 JSX 的 TS 文件，用于 React 组件

> **避坑**：在 \`.tsx\` 文件里写 \`<T>\` 泛型时，TS 会以为你在写 JSX 标签。需要写成 \`<T,>\`（加个逗号）或者用函数声明代替箭头函数。

## 小结

- TypeScript = JavaScript + 类型注解，编译产物是纯 JS。
- 用 \`tsc\` 命令编译，用 \`tsconfig.json\` 配置项目。
- React+TS 项目用 Vite 模板 \`react-ts\` 创建最快。
- \`.ts\` 不支持 JSX，\`.tsx\` 才支持。

## 避坑清单

- ❌ 全局安装 tsc 用于项目（应该用本地依赖）
- ❌ 关掉 \`strict\` 模式逃避类型检查（应该补齐类型）
- ❌ 在 \`.ts\` 文件里写 JSX（应该用 \`.tsx\`）
- ❌ 不读 tsconfig 默认配置（应该理解每个常用选项）

下一章我们正式进入类型系统的核心：**原始类型与类型注解**。`
  },

  // ============================================================
  // ch02: 原始类型与类型注解
  // ============================================================
  {
    id: "tsx3-ch02",
    group: "第一部分 TypeScript 类型基础",
    icon: "🔢",
    title: "ch02 原始类型与类型注解",
    content: `# ch02 原始类型与类型注解

## 为什么先讲原始类型

原始类型（primitive types）是 TypeScript 类型系统的"原子"——所有复杂类型都由它们组合而成。掌握原始类型之后，你看 \`string\`、\`number\`、\`boolean\` 这些注解就像看中文一样自然。

## 1. JavaScript 的 7 种原始类型

JavaScript 有 7 种原始类型，TypeScript 全部支持：

| 类型 | 含义 | 示例 |
| --- | --- | --- |
| \`string\` | 字符串 | \`"hello"\` |
| \`number\` | 数字（整数+浮点） | \`42\`、\`3.14\` |
| \`boolean\` | 布尔值 | \`true\`、\`false\` |
| \`null\` | 空值 | \`null\` |
| \`undefined\` | 未定义 | \`undefined\` |
| \`symbol\` | 唯一标识符 | \`Symbol("id")\` |
| \`bigint\` | 大整数（>2^53） | \`123n\` |

注意：**TS 里的类型名都是小写**。\`String\`（大写）是 JS 的包装对象类型，不是字符串类型，初学者经常踩坑。

\`\`\`ts
// ❌ 错误：用了大写
const name: String = "Alice";   // 这是 JS 包装对象类型，几乎不用

// ✅ 正确：用小写
const name: string = "Alice";   // 这才是字符串类型
\`\`\`

## 2. 类型注解的两种写法

类型注解写在变量名后面，用冒号分隔：

\`\`\`ts
// 显式注解：明确告诉 TS 类型
let age: number = 18;
let name: string = "Alice";
let isOnline: boolean = true;

// 类型推断：TS 根据初始值推断类型
let count = 0;        // 推断为 number
let message = "hi";   // 推断为 string
let loading = false;  // 推断为 boolean
\`\`\`

**何时该显式注解，何时靠推断？**

- **变量声明**：能推断就别显式写，避免冗余。\`let count = 0\` 比 \`let count: number = 0\` 更简洁。
- **函数参数**：必须显式写，因为 TS 无法从调用方推断。
- **函数返回值**：通常靠推断，但公共 API 建议显式标注，避免实现意外返回错类型。

\`\`\`ts
// 函数参数必须注解
function greet(name: string): string {
  return "Hello, " + name;
}

// 返回值靠推断也行
function add(a: number, b: number) {
  return a + b; // 推断返回 number
}
\`\`\`

## 3. number：整数、浮点、负数、Infinity

\`number\` 涵盖所有 JS 数值，包括整数、浮点、负数、\`Infinity\`、\`NaN\`：

\`\`\`ts
let integer: number = 42;
let float: number = 3.14;
let negative: number = -10;
let infinity: number = Infinity;
let notANumber: number = NaN;

// 不同进制都支持
let binary: number = 0b1010;  // 二进制，等于 10
let octal: number = 0o744;    // 八进制，等于 484
let hex: number = 0xf00d;     // 十六进制，等于 61453
\`\`\`

## 4. string：单引号、双引号、模板字面量

\`\`\`ts
let single: string = 'hello';
let double: string = "world";
let template: string = \`hello \${double}\`; // 模板字面量可插值

// 注意：模板字面量是 ES6 特性，不是 TS 特性
// 但 TS 能检查插值变量的类型
let age: number = 18;
let msg: string = \`我 \${age} 岁\`; // ✅ age 是 number，可以插值
// let bad = \`我 \${age + "岁"}\`; // ❌ 报错：number + string 在 strict 下不允许
\`\`\`

## 5. boolean：只有 true 和 false

\`\`\`ts
let isOpen: boolean = true;
let isDone: boolean = false;

// 注意：truthy/falsy 值不是 boolean
let value = 0;
// let flag: boolean = value; // ❌ 报错：number 不能赋给 boolean

// 正确做法：显式比较
let flag: boolean = value === 0; // ✅
\`\`\`

## 6. null 与 undefined：两个"空"

\`null\` 表示"有意为之的空"，\`undefined\` 表示"未定义"。

\`\`\`ts
let nothing: null = null;
let notDefined: undefined = undefined;

// 严格模式下，null 和 undefined 只能赋给自己
// let x: null = undefined; // ❌ 报错
\`\`\`

但在 React 里，"可选状态"经常用 \`null\` 表示"还没有值"。例如：

\`\`\`tsx
// 一个 React 组件，loading 状态用 null 表示"未加载"
function UserAvatar({ user }: { user: { name: string } | null }) {
  // user 可能是 null，所以要先判空
  if (user === null) {
    return <div>加载中...</div>;
  }
  return <div>{user.name}</div>;
}
\`\`\`

## 7. symbol 与 bigint：两个"少见但有用"的类型

\`\`\`ts
// symbol：创建唯一标识符
const id1: symbol = Symbol("id");
const id2: symbol = Symbol("id");
console.log(id1 === id2); // false，每个 Symbol 都是唯一的

// bigint：处理超过 2^53 的大整数
const big: bigint = 9007199254740991n; // 数字后面加 n
const result: bigint = big * 2n; // bigint 运算必须用 bigint
\`\`\`

日常开发里 \`symbol\` 多用于内部 key，\`bigint\` 多用于金融场景或大数计算。

## 8. 数组：两种写法

\`\`\`ts
// 写法 1：类型 + []
let numbers: number[] = [1, 2, 3];
let names: string[] = ["Alice", "Bob"];

// 写法 2：泛型 Array<T>（两种等价）
let scores: Array<number> = [90, 85, 95];

// 推荐写法 1，更简洁
\`\`\`

## 9. React 场景：常见原始类型注解

\`\`\`tsx
// 组件 props 的原始类型
function PriceTag({ price, currency, inStock }: {
  price: number;        // 价格是数字
  currency: string;    // 货币代码是字符串
  inStock: boolean;     // 是否有库存
}) {
  return (
    <div>
      {currency} {price.toFixed(2)}
      {!inStock && <span style={{ color: "red" }}>缺货</span>}
    </div>
  );
}

// 使用：<PriceTag price={99.5} currency="¥" inStock={true} />
\`\`\`

## 小结

- TS 支持 JS 的 7 种原始类型：\`string\`、\`number\`、\`boolean\`、\`null\`、\`undefined\`、\`symbol\`、\`bigint\`。
- 类型名一律小写，大写的 \`String\` 是包装对象类型。
- 变量声明能靠推断就别显式写，函数参数必须显式写。
- 数组用 \`T[]\` 写法更简洁。

## 避坑清单

- ❌ 用大写 \`String\`、\`Number\`、\`Boolean\`（应该用小写）
- ❌ 把 truthy 值当 \`boolean\`（应该显式比较）
- ❌ 不注解函数参数（TS 没法推断）
- ❌ 用 \`Array<T>\` 觉得更高级（应该用 \`T[]\` 更简洁）

下一章我们看"复合类型"：数组、元组、枚举。`
  },

  // ============================================================
  // ch03: 数组、元组与枚举
  // ============================================================
  {
    id: "tsx3-ch03",
    group: "第一部分 TypeScript 类型基础",
    icon: "📦",
    title: "ch03 数组、元组与枚举",
    content: `# ch03 数组、元组与枚举

## 为什么把这些放一起

数组、元组、枚举都是"组合多个值"的类型。它们之间的差异不在于"能装几个值"，而在于**值是否同质、长度是否固定、是否带语义**。这一章我们把三者一次讲透。

## 1. 数组的两种声明方式

\`\`\`ts
// 写法 1：T[]（推荐）
let numbers: number[] = [1, 2, 3];
let users: string[] = ["Alice", "Bob"];

// 写法 2：Array<T>（等价，但更啰嗦）
let scores: Array<number> = [90, 85];

// 两种完全等价，团队风格统一选一个即可
\`\`\`

## 2. 数组的常见操作类型推断

\`\`\`ts
const numbers = [1, 2, 3, 4, 5];

// TS 能从 .map 的回调返回值推断出新数组的类型
const doubled = numbers.map(n => n * 2);       // number[]
const strings = numbers.map(n => n.toString()); // string[]
const first = numbers[0];   // number（注意：strict 下可能是 undefined，见下文）
const filtered = numbers.filter(n => n > 2);   // number[]
\`\`\`

## 3. noUncheckedIndexedAccess：索引访问的安全选项

默认情况下，\`numbers[0]\` 的类型是 \`number\`。但运行时它可能是 \`undefined\`（越界访问）：

\`\`\`ts
const numbers = [1, 2, 3];
const tenth = numbers[10]; // 默认类型是 number，但运行时是 undefined！

// 开启 noUncheckedIndexedAccess 后：
// const tenth: number | undefined
\`\`\`

**强烈推荐开启** \`noUncheckedIndexedAccess\`，让 TS 强制你处理"数组越界"的边界情况。

\`\`\`ts
// 开启后必须先判空
const arr: number[] = [1, 2, 3];
const first = arr[0]; // 类型是 number | undefined

if (first !== undefined) {
  console.log(first.toFixed(2)); // ✅ 这里 first 收窄为 number
}
\`\`\`

## 4. 元组 Tuple：固定长度+固定类型的数组

普通数组的所有元素同类型；**元组**的每个位置类型可以不同，长度也固定。

\`\`\`ts
// 元组：[string, number] 表示长度为 2，第一个 string，第二个 number
let pair: [string, number] = ["Alice", 18];

// ❌ 不能多不能少
// pair = ["Alice"];              // 报错：缺一个
// pair = ["Alice", 18, true];    // 报错：多一个
// pair = [18, "Alice"];           // 报错：类型顺序错

// 元组的应用场景：CSV 行、键值对、坐标点
const coordinate: [number, number] = [120.5, 30.2];
const csvRow: [string, number, boolean] = ["Alice", 18, true];
\`\`\`

## 5. 可选元素与剩余元素的元组

\`\`\`ts
// 第二个元素可选
let optional: [string, number?] = ["Alice"];
optional = ["Alice", 18];

// 剩余元素：[string, ...number[]]
let rest: [string, ...number[]] = ["scores", 90, 85, 95];
\`\`\`

## 6. 元组的陷阱：可变方法

\`\`\`ts
const pair: [string, number] = ["Alice", 18];

// 元组也是数组，可以调用 .push
pair.push("extra"); // ✅ 编译通过，但运行时变成 ["Alice", 18, "extra"]

// 这破坏了"固定长度"的约定，但 TS 没拦住
// 解决方案：用 readonly
const fixed: readonly [string, number] = ["Alice", 18];
// fixed.push("extra"); // ❌ 报错：readonly 元组不能 push
\`\`\`

## 7. 枚举 Enum：带名字的常量集合

当你需要一组相关的常量时，用枚举比用魔法数字好得多：

\`\`\`ts
// 数值枚举（默认）
enum Direction {
  Up,     // 0
  Down,   // 1
  Left,   // 2
  Right,  // 3
}

let dir: Direction = Direction.Up;
console.log(dir); // 0
\`\`\`

可以指定初始值，后面自动递增：

\`\`\`ts
enum Status {
  Pending = 100,
  Success,  // 101
  Failed,   // 102
}
\`\`\`

## 8. 字符串枚举（更常用）

\`\`\`ts
enum Role {
  Admin = "ADMIN",
  Editor = "EDITOR",
  Viewer = "VIEWER",
}

function canEdit(role: Role): boolean {
  return role === Role.Admin || role === Role.Editor;
}

console.log(canEdit(Role.Admin)); // true
\`\`\`

字符串枚举的好处：调试时打印 \`"ADMIN"\` 比 \`0\` 直观。

## 9. 枚举的常见替代品：联合字面量类型

枚举的缺点：编译后是真实对象，会增加产物体积。很多人改用"字面量联合类型 + 常量对象"：

\`\`\`ts
// 用 const 对象 + 联合类型替代 enum
const Role = {
  Admin: "ADMIN",
  Editor: "EDITOR",
  Viewer: "VIEWER",
} as const;

// 自动推导出联合类型 "ADMIN" | "EDITOR" | "VIEWER"
type Role = typeof Role[keyof typeof Role];

function canEdit(role: Role): boolean {
  return role === Role.Admin || role === Role.Editor;
}

canEdit("ADMIN");  // ✅
// canEdit("admin"); // ❌ 报错
\`\`\`

**这种写法在 React 项目里更流行**，原因有三：

1. 编译产物更小（不会被编译成对象）
2. 可读性接近 enum
3. 摇树优化（tree-shaking）更友好

## 10. React 场景：枚举与状态机

\`\`\`tsx
// 组件状态用字面量联合类型
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string }
  | { status: "error"; error: Error };

function DataDisplay({ state }: { state: RequestState }) {
  switch (state.status) {
    case "idle":
      return <div>请点击加载</div>;
    case "loading":
      return <div>加载中...</div>;
    case "success":
      return <div>{state.data}</div>;
    case "error":
      return <div>出错了：{state.error.message}</div>;
  }
}

// 使用：
// <DataDisplay state={{ status: "loading" }} />
// <DataDisplay state={{ status: "success", data: "hello" }} />
\`\`\`

这种"标签联合类型"（discriminated union）在 React 里非常常用，第 7 章会详细讲。

## 小结

- 数组用 \`T[]\` 声明；开启 \`noUncheckedIndexedAccess\` 让索引访问更安全。
- 元组 \`[T1, T2, ...]\` 适合固定长度、固定位置类型的场景。
- 枚举分数值枚举和字符串枚举，字符串枚举更直观。
- React 项目里更推荐"const 对象 + 联合字面量"替代 enum。

## 避坑清单

- ❌ 用 \`enum\` 又不开 \`const enum\` 导致产物变大
- ❌ 用元组但忘记 \`readonly\` 导致运行时被 push 破坏
- ❌ 索引访问数组不判空（应开启 \`noUncheckedIndexedAccess\`）
- ❌ 用魔法数字代替枚举（应该用语义化的名字）

下一章我们看"对象类型"——这是 React 组件 props 的核心。`
  },

  // ============================================================
  // ch04: 对象类型与 interface
  // ============================================================
  {
    id: "tsx3-ch04",
    group: "第一部分 TypeScript 类型基础",
    icon: "🧱",
    title: "ch04 对象类型与 interface",
    content: `# ch04 对象类型与 interface

## 为什么对象类型最重要

React 组件的 props、Hook 的返回值、API 的响应体——前端 90% 的数据都是对象。掌握对象类型，你就能写出类型安全的复杂业务代码。

## 1. 内联对象类型

最简单的对象类型直接写在变量后面：

\`\`\`ts
// 内联类型：描述一个用户对象
let user: { name: string; age: number } = {
  name: "Alice",
  age: 18,
};

// 字段必须存在，类型必须匹配
// user = { name: "Bob" };      // ❌ 缺 age
// user = { name: 1, age: 18 }; // ❌ name 不是 string
\`\`\`

## 2. 可选字段：?

\`\`\`ts
let user: { name: string; age?: number } = {
  name: "Alice",
  // age 可以不写
};

// 访问可选字段时，类型自动加上 | undefined
console.log(user.age); // 类型：number | undefined
console.log(user.age?.toFixed(2)); // 可选链：age 不存在时不报错
\`\`\`

## 3. 只读字段：readonly

\`\`\`ts
let user: { readonly id: number; name: string } = {
  id: 1,
  name: "Alice",
};

// user.id = 2; // ❌ 报错：只读字段不能修改
user.name = "Bob"; // ✅ 非只读字段可以修改
\`\`\`

\`readonly\` 只防"赋值"，不防"内部修改"：

\`\`\`ts
let user: { readonly tags: string[] } = { tags: ["a", "b"] };
// user.tags = [];     // ❌ 报错
user.tags.push("c");   // ✅ 通过：数组的 push 不触发 readonly 检查
\`\`\`

要真正不可变，需要 \`readonly\` 数组（\`readonly string[]\`）：

\`\`\`ts
let user: { readonly tags: readonly string[] } = { tags: ["a", "b"] };
// user.tags.push("c"); // ❌ 报错：readonly 数组不能 push
\`\`\`

## 4. interface：给对象类型起名字

内联类型重复写在多个地方很啰嗦。用 \`interface\` 给对象类型起名：

\`\`\`ts
// 定义 interface
interface User {
  id: number;
  name: string;
  age?: number;       // 可选
  readonly email: string; // 只读
}

// 复用：变量、函数参数、返回值都可以用 User
const alice: User = { id: 1, name: "Alice", email: "a@x.com" };
const bob: User = { id: 2, name: "Bob", age: 20, email: "b@x.com" };

function greet(user: User): string {
  return \`Hello, \${user.name}\`;
}
\`\`\`

## 5. interface 的扩展：extends

\`\`\`ts
// 基础 interface
interface Animal {
  name: string;
}

// 扩展：在 Animal 基础上加字段
interface Dog extends Animal {
  bark(): void;
}

const dog: Dog = {
  name: "Rex",
  bark() { console.log("Woof!"); },
};
\`\`\`

可以多继承：

\`\`\`ts
interface Pet {
  owner: string;
}

interface Dog extends Animal, Pet {
  bark(): void;
}
\`\`\`

## 6. interface 的"声明合并"

同名 interface 会自动合并：

\`\`\`ts
interface Window {
  customField: string;
}

interface Window {
  anotherField: number;
}

// 最终 Window 类型同时有 customField 和 anotherField
const w: Window = window as any;
console.log(w.customField, w.anotherField);
\`\`\`

这个特性在**给第三方库扩展类型**时很有用（后面 d.ts 章节会讲）。

## 7. 索引签名：动态字段名

当对象的字段名是动态的，用索引签名：

\`\`\`ts
interface Scores {
  [subject: string]: number; // 任意字符串字段都是 number
}

const math: Scores = { math: 90, english: 85 };
console.log(math["math"]); // 90

// 注意：索引签名会要求所有字段都符合
// interface User { id: number; [key: string]: string }
// ❌ 报错：id 是 number，但索引签名要求所有字段都是 string
\`\`\`

\`\`\`ts
// Record<Keys, Values> 是更现代的写法
type Scores2 = Record<string, number>;
const s: Scores2 = { math: 90, english: 85 };
\`\`\`

## 8. 函数类型：在对象里写函数

\`\`\`ts
interface User {
  name: string;
  // 方式 1：方法简写
  greet(): string;
  // 方式 2：属性式函数
  sayHi: (target: string) => string;
}

const alice: User = {
  name: "Alice",
  greet() { return \`Hi, I'm \${this.name}\`; },
  sayHi: (target) => \`Hi \${target}\`,
};
\`\`\`

两种写法的区别：方法简写的 \`this\` 类型不安全，属性式函数更严格。React 里两种都用，但**严格模式推荐属性式**。

## 9. React 场景：组件 props 的 interface

\`\`\`tsx
// 定义 props 类型
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary"; // 字面量联合
  disabled?: boolean;
}

function Button({ label, onClick, variant = "primary", disabled = false }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={\`btn btn-\${variant}\`}
    >
      {label}
    </button>
  );
}

// 使用：<Button label="保存" onClick={() => alert("已保存")} />
\`\`\`

## 10. interface 的常见模式：组合与扩展

\`\`\`ts
// 模式 1：基础 props + 组件专属 props
interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

interface DialogProps extends BaseProps {
  open: boolean;
  onClose: () => void;
}

// 模式 2：把一个 interface 的部分字段拿出来
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// 只用 name 和 email（后面会讲 Pick 工具类型）
type UserProfile = Pick<User, "name" | "email">;
// 等价于 { name: string; email: string }
\`\`\`

## 小结

- 对象类型用 \`interface\` 命名，可复用、可扩展。
- \`?\` 表示可选字段，\`readonly\` 表示只读字段。
- 索引签名 \`[key: string]: T\` 用于动态字段名，或用 \`Record<string, T>\`。
- React 组件 props 通常用 \`interface\` 定义，便于扩展和组合。

## 避坑清单

- ❌ 重复写内联对象类型（应该抽成 interface）
- ❌ 用 \`readonly\` 误以为对象内部不可变（应该用 \`readonly T[]\`）
- ❌ 在 \`strict\` 模式下还用方法简写 \`greet(): string\`（应该用属性式）
- ❌ 索引签名和具体字段冲突（应该让所有字段类型一致）

下一章我们对比 \`type\` 和 \`interface\`，看看什么时候该用哪个。`
  },

  // ============================================================
  // ch05: type vs interface
  // ============================================================
  {
    id: "tsx3-ch05",
    group: "第一部分 TypeScript 类型基础",
    icon: "⚖️",
    title: "ch05 type 与 interface 对比",
    content: `# ch05 type 与 interface 对比

## 为什么要专门讲这个

\`type\` 和 \`interface\` 都能描述对象类型，初学者经常纠结"该用哪个"。这一章把两者的差异、共同点、选型规则讲清楚，让你团队协作时不再为此争论。

## 1. 两者描述对象类型几乎等价

\`\`\`ts
// 用 interface
interface User {
  name: string;
  age: number;
}

// 用 type
type UserT = {
  name: string;
  age: number;
};

// 用法完全一样
const alice: User = { name: "Alice", age: 18 };
const bob: UserT = { name: "Bob", age: 20 };
\`\`\`

## 2. type 能描述的类型更多

\`interface\` 只能描述对象类型；\`type\` 能描述**任何**类型。

\`\`\`ts
// type 可以是原始类型的别名
type ID = string;
type Score = number;

// type 可以是联合类型
type Status = "idle" | "loading" | "success" | "error";

// type 可以是元组
type Pair = [string, number];

// type 可以是函数类型
type Handler = (event: string) => void;

// interface 都做不了上面这些
\`\`\`

## 3. 扩展方式不同

\`\`\`ts
// interface 用 extends 扩展
interface Animal {
  name: string;
}
interface Dog extends Animal {
  bark(): void;
}

// type 用 & 交叉扩展
type AnimalT = {
  name: string;
};
type DogT = AnimalT & {
  bark(): void;
};
\`\`\`

两者结果等价，但语法不同。

## 4. 声明合并：interface 独有

\`\`\`ts
// interface 同名会自动合并
interface Window {
  myProp: string;
}
interface Window {
  anotherProp: number;
}
// Window 现在同时有 myProp 和 anotherProp

// type 不能合并
type Foo = { a: string };
// type Foo = { b: number }; // ❌ 报错：重复声明
\`\`\`

**给第三方库扩展类型时，必须用 interface**（因为你要"合并"到库自带的类型上）：

\`\`\`ts
// 扩展 React 的 HTMLAttributes
interface MyDivProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary";
}
\`\`\`

## 5. 计算属性：type 独有

\`\`\`ts
// type 支持动态属性名（模板字面量类型）
type EventName = \`on\${Capitalize<string>}\`;
// 得到 "onXxx" 这样的字符串类型

// interface 不支持计算属性名
\`\`\`

## 6. 性能差异（编译速度）

在大型项目里，\`interface\` 比 \`type\` **编译速度更快**，因为：

- \`interface\` 是"开放"的（可合并），TS 缓存它的结构
- \`type\` 是"封闭"的（一次性定义），TS 需要展开类型

在 1 万行代码的项目里差异不明显，但 10 万行以上能用 \`interface\` 的地方尽量用 \`interface\`。

## 7. 选型规则：用哪个

**通用规则**：能 \`interface\` 就用 \`interface\`，需要描述非对象类型时才用 \`type\`。

| 场景 | 推荐 | 原因 |
| --- | --- | --- |
| 描述对象/类 | \`interface\` | 性能更好、可扩展 |
| 联合类型 | \`type\` | interface 做不到 |
| 元组 | \`type\` | interface 做不到 |
| 函数类型 | 两者都行，看团队 | 推荐 \`type\` |
| 给第三方库扩展类型 | \`interface\` | 必须靠声明合并 |
| 工具类型结果（Pick/Omit 等） | \`type\` | 必须用 type |

## 8. React 项目里的实战选择

\`\`\`tsx
// ✅ 推荐：组件 props 用 interface
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

function Button(props: ButtonProps) { /* ... */ }

// ✅ 推荐：联合状态用 type
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User }
  | { status: "error"; error: Error };

// ✅ 推荐：函数类型用 type
type EventHandler<T> = (event: React.SyntheticEvent<T>) => void;

// ✅ 推荐：工具类型结果用 type
type UserSummary = Pick<User, "id" | "name">;
\`\`\`

## 9. 团队约定示例

很多团队在 \`eslint\` 里强制约定，比如 \`@typescript-eslint/consistent-type-definitions\`：

\`\`\`json
// .eslintrc.json
{
  "rules": {
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"]
  }
}
\`\`\`

这条规则强制"对象类型必须用 interface"，非对象类型才用 type。如果你想这样，配 eslint 就好。

## 10. 不要纠结，写多了就有感觉

\`type\` 和 \`interface\` 选哪个不影响代码功能，只影响代码风格和编译性能。团队统一最重要。

## 小结

- \`interface\` 只描述对象类型，可扩展、可合并，编译性能好。
- \`type\` 能描述任何类型，包括联合、元组、函数、字面量。
- 选型规则：对象优先 interface，联合/工具类型用 type。
- 团队统一最重要，配 eslint 规则强制即可。

## 避坑清单

- ❌ 给第三方库扩展类型用 \`type\`（应该用 \`interface\` 才能合并）
- ❌ 描述联合类型用 \`interface\`（做不到，必须用 \`type\`）
- ❌ 在 \`type\` 上写 \`extends\`（语法错误，应该用 \`&\`）
- ❌ 团队里两种风格混用（应该配 eslint 统一）

下一章我们看"函数类型"——React 事件处理的核心。`
  },
];

export { chapters };
