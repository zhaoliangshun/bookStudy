// =============================================================
// TypeScript + React 从入门到精通大全 —— 第一批章节
// -------------------------------------------------------------
// 覆盖：开篇（学习路线） + 第一部分 TypeScript 类型基础
// 包含 6 个章节：preface + ch01 ~ ch05
//
// 风格定位：
//   - 不堆砌语法罗列，每节都从一个真实开发痛点出发
//   - 每个代码 demo 都配套"为什么这样写"的逐行注释
//   - 所有 demo 都通过 /api/run-ts 沙箱实际可运行
//
// 运行环境：
//   - TypeScript 5.x（esModuleInterop、strict 等）
//   - React 18（运行时由沙箱注入 react / react-dom）
//   - 沙箱使用 ts.transpileModule，target=ES2020, module=CommonJS, jsx=ReactJSX
// =============================================================

const chapters = [
  // ============================================================
  // 开篇：前言与学习路线
  // ============================================================
  {
    id: "tsx2-preface",
    group: "开篇",
    icon: "📖",
    title: "前言与学习路线",
    content: `# 前言：为什么写这本书

欢迎来到《TypeScript + React 从入门到精通大全》。写这本书的目的很朴素：在企业级前端开发里，**TypeScript 与 React 几乎是"标配组合拳"**——React 负责视图层的高效组织，TypeScript 负责把"运行时才暴露的错误"提前到编译期。但市面上的教材要么太浅（只教语法不讲设计），要么太碎（博客零散、不成体系），所以我尝试用一本完整的书帮你打通从"会写"到"会设计"的全链路。

本书假设你已经熟悉 JavaScript 基础（变量、函数、对象、数组、ES6+ 语法），对前端工程化（npm、模块化、构建工具）有基本概念。如果你对这些还很陌生，建议先补齐基础再回来，否则一些讨论会显得跳跃。

## 本书面向谁

下面这几类读者是这本书的主要目标人群：

- **刚学完 JS 基础想转 TS/React 的同学**：你会从最基础的类型语法开始，到能独立写中型 React 应用。
- **已经在用 React 但没系统学过 TS 的开发者**：你会补齐类型系统，特别是泛型、条件类型、模板字面量类型这些"高级但实用"的特性。
- **负责团队代码质量的 TL/架构师**：你会看到大量真实项目里"为什么这样设计"的理由，而不只是 API 列表。
- **准备面试中高级前端岗的朋友**：本书覆盖的题型与社区主流面试题高度重合。

## 学习路线全景图

我把整本书分成 16 个部分、82 章。下表是鸟瞰式地图，**前 5 部分构成"基础篇"**，建议你按顺序读；后续部分可以按需查阅。

| 部分 | 内容 | 章节 | 目标 |
| --- | --- | --- | --- |
| 第一部分 | TypeScript 类型基础 | 5 | 掌握所有基础类型，能写出类型安全的简单函数 |
| 第二部分 | TypeScript 类型进阶 | 5 | 掌握泛型、联合/交叉、内置工具类型 |
| 第三部分 | React 组件基础 | 5 | 能写函数组件、理解 JSX 与渲染机制 |
| 第四部分 | Props 与组件组合 | 5 | 设计可复用的组件 API（组合、forwardRef、错误边界） |
| 第五部分 | 事件与受控组件 | 5 | 完整处理用户输入、事件冒泡 |
| 第六部分 | useState 深入 | 5 | 理解状态更新机制、批处理、闭包陷阱 |
| 第七部分 | useEffect 深入 | 5 | 搞清副作用、清理函数、依赖项的本质 |
| 第八部分 | useRef / useMemo / useCallback | 5 | 学会性能优化与命令式引用 |
| 第九部分 | useReducer / useContext / 自定义 Hook | 5 | 管理复杂状态与跨组件通信 |
| 第十部分 | 高级 Hooks | 5 | useId、useTransition、useDeferredValue 等 |
| 第十一部分 | 性能优化 | 5 | React.memo、懒加载、虚拟列表 |
| 第十二部分 | 数据请求 | 5 | 封装请求层、Suspense 数据获取 |
| 第十三部分 | 表单与校验 | 5 | 受控/非受控表单、错误处理 |
| 第十四部分 | 路由与状态管理 | 5 | React Router、Zustand、Redux Toolkit |
| 第十五部分 | 样式与 UI 库 | 5 | CSS Modules、Tailwind、组件库选型 |
| 第十六部分 | 测试与工程化 | 7 | Jest、Testing Library、CI、Monorepo |

**核心建议**：不要试图一次性学完。每个部分都动手写 3-5 个真实 demo，比单纯阅读 10 遍更有效。

## 版本约定

为了避免你看到代码却跑不起来，本书所有示例都基于以下版本：

- **TypeScript 5.x**（5.0 之后引入了 \`const\` 类型参数、模板字面量类型增强等特性，本书会用到）
- **React 18**（并发渲染、Suspense、useTransition 等 API 都在 18 正式可用）
- **Node.js 18+**（用于本地运行编译后的 JS）
- **Vite / Next.js 14+**（任选其一作为脚手架，本书示例不绑定特定脚手架）

代码里所有 React 18 的新 API（如 \`useId\`、\`useDeferredValue\`）都会有显式说明；TS 4.x 时代的语法（如老的 \`import type\` 写法）我会用注释提醒你"如果用更老版本请按提示调整"。

## 如何使用本书

如果你偏好"边读边敲"：

1. 先读每一章的"为什么"和"对比表"建立认知。
2. 跟着每个 \`\`\`tsx 代码块逐行注释理解，**不要直接复制**——亲手敲一遍能记住 80% 以上。
3. 在沙箱里运行看输出，再尝试修改参数观察行为变化。

如果你偏好"先通读再精读"：

1. 先把每一章的小结看一遍，画出思维导图。
2. 再回头精读具体章节，重点放在"为什么"和"权衡"上。
3. 每一章末尾的"避坑清单"是真实项目里高频踩雷点，建议做笔记。

## 快速开始：你的第一个 TS + React Demo

下面这个 demo 可以在我们提供的 \`/api/run-ts\` 沙箱里直接运行。沙箱用 \`ts.transpileModule\` 把 TS 编译成 ES2020 + CommonJS，JSX 用 \`ReactJSX\` 模式。

\`\`\`tsx
// 第一个 demo：证明 TypeScript 能在编译期捕获错误
// 我们定义一个简单的加法函数，并故意传入错误类型看会发生什么

// 函数注解：(a: number, b: number) => number
// 含义：接收两个 number，返回 number
// 这是 TS 函数类型的最简形式
const add = (a: number, b: number): number => {
  // 严格模式下，a 和 b 都被收窄为 number，不能是 string
  return a + b; // + 在 number 上下文里是数值相加
};

// 正确调用：传入两个 number，TS 满意
const ok = add(1, 2); // ok: number，值为 3

// 错误调用：把字符串传给 number 参数
// 取消下面这一行的注释，TS 会在编译时报错
// const bad = add("1", 2); // ❌ 类型 'string' 不能赋给类型 'number'

// 输出结果，让我们确认运行期也对
console.log("add(1, 2) =", ok); // 打印 3

// 再展示一个 React 组件：最简单的函数组件
// 注意：函数组件在 TS 里是 (props) => ReactElement | null
function Hello(props: { name: string }): any {
  // 返回 JSX。沙箱用 ReactJSX 模式，所以可以直接写 <div>
  // 真实项目里应该返回 ReactElement，但沙箱不做严格类型检查
  return <div>你好，{props.name}！</div>;
}

// 渲染输出：把组件挂到 root
// React 18 的 createRoot API
import React from "react"; // 显式导入，沙箱里 react 是预装的
import { createRoot } from "react-dom/client"; // 客户端入口 API

// 创建挂载点
const root = createRoot(document.getElementById("root")!);
// 把组件渲染进去，name 传 "TypeScript"
// ! 是非空断言，告诉 TS 这个元素一定存在
root.render(<Hello name="TypeScript" />);

// 上面这行执行后，页面上会显示"你好，TypeScript！"
\`\`\`

上面的代码同时展示了三件事：

1. **TS 函数类型注解**：\`(a: number, b: number) => number\` 是函数类型签名。
2. **TS 编译期错误**：把字符串传给 \`add\` 会被编译器拦下。
3. **React 函数组件**：\`Hello\` 接收 \`name\` prop，返回 JSX。

如果你是第一次见这些语法，不必担心——前两章就会把它们讲清楚。我把它们摆在这里，只是为了让你在开始之前先看到"我们要走向哪里"。

## 阅读建议：三个里程碑

我把整本书拆成三个里程碑，每个里程碑结束时你应该能独立完成对应项目：

### 里程碑 1（第一 ~ 二部分）：TS 类型基础过关
**自测项目**：写一个 \`Result<T, E>\` 工具类型与一组相关函数（\`ok\`、\`err\`、\`map\`、\`flatMap\`），用 TS 严格模式编译通过。

### 里程碑 2（第三 ~ 四部分）：能写可复用 React 组件
**自测项目**：写一个 \`<Modal>\` 组件，支持受控/非受控两种用法，props 完整带类型定义。

### 里程碑 3（第五 ~ 十一部分）：能写中型应用
**自测项目**：写一个 todo 应用，包含路由、状态管理、本地存储、性能优化，TS 严格模式零错误。

> 如果你跟着本书走完三个里程碑，你应该已经具备**独立承担中型 React 项目**的能力。

## 本书不会讲什么

明确告诉你这本书不覆盖的内容，避免浪费时间：

- **HTML / CSS 基础**：默认你已经掌握。
- **JavaScript 基础语法**：包括闭包、原型、async/await、模块化等。
- **后端开发**：Node.js、数据库、API 设计等只在涉及"前后端协作"时简单提及。
- **非常深的 TS 类型体操**：本书聚焦"实用"层级，不会为了炫技写几百行类型推导。
- **旧版 React API**：如 \`componentWillMount\`、\`legacy context\` 等。

## 小结

- 本书是 82 章的 TS + React 系统教程，分 16 个部分。
- 假设读者已有 JS 基础，目标人群涵盖初中高级前端开发者。
- 所有示例基于 TS 5.x + React 18，运行在 /api/run-ts 沙箱里。
- 推荐的学习方式是"边读边敲 + 总结 + 自测项目"。
- 全书分三个里程碑，每个里程碑对应一个自测项目来验证掌握程度。

接下来，我们正式进入 TypeScript 类型基础的学习。
`,
  },

  // ============================================================
  // 第一章：TypeScript 快速上手
  // ============================================================
  {
    id: "tsx2-ch01",
    group: "第一部分 TypeScript 类型基础",
    icon: "🚀",
    title: "第一章 TypeScript 快速上手",
    content: `# 第一章 TypeScript 快速上手

TypeScript（简称 TS）是由微软开发并维护的**JavaScript 超集**。它在 JS 的基础上增加了一套静态类型系统，最终会被编译（transpile）成普通 JS 运行。2012 年首次发布，如今已经成长为前端生态的事实标准之一，VSCode、Vite、Next.js、Vue 3 等明星项目都重度使用 TS。

## 1.1 什么是 TypeScript

很多人会把 TS 和"另一种语言"画等号，这是误解。**TS 的本质是 JS + 类型 + 编译时类型检查**。它不引入新的运行时（runtime）能力，所有 TS 代码最终都变成 JS 执行。

更精确地说，TS 做了三件事：

1. **给 JS 加了一套静态类型系统**——变量、函数参数、返回值都可以标注类型。
2. **提供了一个编译器（tsc）**——把 TS 编译成 JS，并检查类型错误。
3. **兼容所有 JS 代码**——任何 \`.js\` 文件都可以重命名为 \`.ts\`，TS 不会拒绝它。

第三点非常重要：意味着你**可以渐进式迁移**一个老项目到 TS，不会一夜之间需要把所有代码重写。

## 1.2 为什么用 TypeScript

最直接的答案是：**把运行时错误提前到编译期**。但这样说太抽象，我们看几个真实场景。

### 场景 A：拼写错误的属性名

\`\`\`tsx
// 纯 JS：运行时才发现 undefined
const user = { name: "张三", age: 30 };
console.log(user.naem); // undefined，打印不报错但结果错误

// 加 TS：编译期就报错
const user2: { name: string; age: number } = { name: "张三", age: 30 };
// console.log(user2.naem); // ❌ Property 'naem' does not exist
\`\`\`

为什么？因为 TS 在编译时已经知道 \`user2\` 上有哪些属性，\`naem\` 不在白名单里就直接拒绝。

### 场景 B：函数传错参数类型

\`\`\`tsx
// 纯 JS：运行到这一行才崩
function greet(name) {
  return "Hello, " + name.toUpperCase();
}
greet(123); // 运行时崩溃：name.toUpperCase is not a function

// 加 TS：编辑器里就划红线
function greet2(name: string): string {
  return "Hello, " + name.toUpperCase();
}
// greet2(123); // ❌ Argument of type 'number' is not assignable to parameter of type 'string'
\`\`\`

### 场景 C：IDE 智能补全

类型信息让 IDE 知道一个对象有哪些方法、属性可以调用，**补全速度提升数倍**。这是日常开发里最"润物细无声"的好处。

| 维度 | JavaScript | TypeScript |
| --- | --- | --- |
| 错误发现时机 | 运行时 | 编译时（编辑器） |
| 类型提示 | 无，靠 JSDoc | 完整，IDE 原生支持 |
| 重构安全性 | 靠搜索替换 | 编译器保证引用安全 |
| 学习成本 | 低 | 中（要学类型系统） |
| 编译步骤 | 无 | 需要 tsc 或构建工具 |
| 生态兼容 | 100% | 通过类型定义文件（.d.ts）支持 |

## 1.3 安装与编译

安装 TS 编译器最简单的方式是用 npm（Node.js 自带）：

\`\`\`bash
# 全局安装（不推荐污染全局）
npm install -g typescript

# 推荐：项目内安装为开发依赖
npm install -D typescript

# 查看版本
npx tsc --version
\`\`\`

我们用 \`npx tsc\` 而不是直接 \`tsc\`，是为了让命令在项目目录的 \`node_modules\` 里查找，确保版本一致。

写一个最简单的 \`hello.ts\` 文件，然后编译：

\`\`\`tsx
// hello.ts
// 演示一个最简单的 TS 文件
// 末尾用 console.log 打印结果，沙箱里可以看到输出

// 给变量标注类型：string
const greeting: string = "Hello, TypeScript!";

// 给函数参数和返回值标注类型
const shout = (msg: string): string => {
  // 转大写后返回
  return msg.toUpperCase();
};

// 调用并打印
console.log(greeting); // "Hello, TypeScript!"
console.log(shout("hi")); // "HI"
\`\`\`

编译运行：

\`\`\`bash
# 把 hello.ts 编译成 hello.js
npx tsc hello.ts

# 编译后再用 node 运行
node hello.js
\`\`\`

## 1.4 tsconfig.json 基础

真实项目里我们不会一个文件一个文件地编译，而是用 \`tsconfig.json\` 配置整个项目。在项目根目录运行：

\`\`\`bash
npx tsc --init
\`\`\`

会生成一份默认配置。下面是一份**精挑细选**的常用配置，适合大多数项目起步：

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",          // 编译目标 JS 版本
    "module": "ESNext",          // 模块系统：ESNext/CommonJS
    "moduleResolution": "Bundler",// 解析策略：现代打包器推荐
    "strict": true,              // 开启严格模式（强烈推荐）
    "esModuleInterop": true,     // 允许 default import 语法
    "skipLibCheck": true,        // 跳过 .d.ts 检查，加快编译
    "jsx": "react-jsx",          // React 17+ 新 JSX 转换
    "isolatedModules": true,     // 每个文件可独立编译（Vite/esbuild 需要）
    "resolveJsonModule": true,   // 允许 import JSON
    "noUnusedLocals": true,      // 未使用的局部变量报错
    "noUnusedParameters": true,  // 未使用的参数报错
    "noFallthroughCasesInSwitch": true, // switch 漏 break 报错
    "forceConsistentCasingInFileNames": true, // 文件名大小写敏感
    "outDir": "./dist",          // 编译产物输出目录
    "rootDir": "./src"           // 源码根目录
  },
  "include": ["src/**/*"],       // 包含哪些文件
  "exclude": ["node_modules", "dist"]
}
\`\`\`

几个最关键的字段解释一下：

- **\`strict: true\`**：开启一整套严格检查（包含 \`strictNullChecks\`、\`noImplicitAny\` 等），是 TS 类型安全的基石。新项目**务必开启**。
- **\`target\`**：编译成哪一版 JS。越老兼容性越好但语法越啰嗦；现代项目一般选 \`ES2020\` 或 \`ES2022\`。
- **\`module\`**：编译产物的模块系统。配合 Vite/Webpack 用 \`ESNext\`，配合 Node.js 用 \`CommonJS\`。
- **\`jsx\`**：如果用 React 17+ 的新 JSX 转换（不需 \`import React\`），写 \`react-jsx\`；老项目用 \`react\`。

## 1.5 第一个完整 Demo

下面是一个稍微复杂一点的 demo，演示 TS 的核心能力。**注意每一行的注释**——这是本书的风格：不只告诉你"是什么"，更告诉你"为什么"。

\`\`\`tsx
// 第一章综合 demo
// 演示：类型注解、联合类型、类型守卫、函数重载
// 这个文件会展示 TS 在真实业务里最常见的几种用法

// 1. 基础类型注解
// username 是 string，age 是 number
const username: string = "张三";
const age: number = 25;

// 2. 联合类型
// 变量可以同时是 string 或 number
// 用 | 分隔多个类型
let phoneOrEmail: string | number = "13800138000";
phoneOrEmail = 13800138000; // 合法
// phoneOrEmail = true;       // ❌ 报错：boolean 不在联合里

// 3. 数组类型
// 两种写法等价：number[] 是 Array<number> 的简写
const scores: number[] = [95, 87, 76];
const names: Array<string> = ["Alice", "Bob"];

// 4. 函数类型注解
// 参数和返回值都标了类型
function calcTotal(items: number[]): number {
  // reduce 累加，初值 0 也必须是 number
  return items.reduce((sum, n) => sum + n, 0);
}

// 5. 类型守卫（type guard）
// typeof 在 TS 里不只是 JS 的运行期运算符，还是类型收窄工具
function format(value: string | number): string {
  // 在 if 分支里，value 被自动收窄为 string
  if (typeof value === "string") {
    return value.trim(); // 这里 .trim() 是 string 的方法，TS 知道
  }
  // 在 else 分支里，value 被自动收窄为 number
  return value.toFixed(2); // 这里 .toFixed() 是 number 的方法
}

// 6. 函数重载
// 先声明多个"调用签名"，再写一个实现签名
// TS 用第一个匹配的重载决定返回类型
function combine(a: string, b: string): string;
function combine(a: number, b: number): number;
function combine(a: any, b: any): any {
  // 实现签名必须兼容所有重载
  // 用 typeof 在运行时再分情况
  if (typeof a === "string" && typeof b === "string") {
    return a + b; // 字符串拼接
  }
  return a + b; // 数值相加
}

// 调用时 TS 根据重载决定返回类型
const r1 = combine("a", "b"); // r1: string
const r2 = combine(1, 2);     // r2: number

// 7. 打印输出验证
console.log(username, age);
console.log(format(3.14159));  // "3.14"
console.log(r1, r2);            // "ab" 3
\`\`\`

把这段代码保存为 \`demo.ts\`，运行 \`npx tsc demo.ts && node demo.js\`，就能看到输出。**所有这些语法在 /api/run-ts 沙箱里同样可运行**。

## 1.6 常见误区

新人上手 TS 容易踩的几个坑：

### 误区 1：把 \`any\` 当万能解药

\`\`\`tsx
// 反面示例：用 any 逃过类型检查
function parse(input: any): any {
  return JSON.parse(input);
}
const result = parse('{"x":1}');
result.x.toFixed(2); // 不报错，但运行时会崩：toFixed is not a function
\`\`\`

\`any\` 相当于"关闭 TS 检查"，**短期方便、长期埋雷**。第三章会讲更安全的 \`unknown\`。

### 误区 2：把 \`strict\` 关掉

很多新手嫌 \`strict: true\` 报错太多就关了。这等于放弃了 TS 90% 的价值。**正确做法是学着让代码通过严格模式**——前几次会痛苦，但一个月后你会发现 bug 数量大幅下降。

### 误区 3：在 .d.ts 里手写类型

如果项目用了第三方库，**优先安装它的 \`@types/xxx\` 包**，不要手写 \`.d.ts\`。只有当库没提供类型时再手写。

## 小结

- TypeScript 是 JS 的超集，核心价值是**把运行时错误提前到编译期**。
- 安装用 \`npm install -D typescript\`，编译用 \`npx tsc\`。
- \`tsconfig.json\` 是项目级配置，**务必开启 \`strict: true\`**。
- 常用语法：类型注解、联合类型、类型守卫、函数重载。
- 切忌滥用 \`any\`，它会让 TS 形同虚设。
- 本书所有 demo 都基于 \`/api/run-ts\` 沙箱可直接运行。
`,
  },

  // ============================================================
  // 第二章：基础类型与字面量类型
  // ============================================================
  {
    id: "tsx2-ch02",
    group: "第一部分 TypeScript 类型基础",
    icon: "📦",
    title: "第二章 基础类型与字面量类型",
    content: `# 第二章 基础类型与字面量类型

本章是 TS 类型系统的"词汇表"。你写 TS 代码时遇到的 80% 类型问题，都能从本章找到答案。我们会系统过一遍所有基础类型，并着重讲**字面量类型**（literal types）这个"看似简单、实则高频"的概念。

## 2.1 原始类型：JS 七种 + TS 增强

TS 完整支持 JS 的七种原始类型，并在它们基础上增加了两种"无值"类型。

### 2.1.1 \`string\`：字符串

\`\`\`tsx
// 三种写法都合法
const a: string = "hello";  // 双引号
const b: string = 'world';  // 单引号
const c: string = \`hi\${a}\`; // 模板字符串
\`\`\`

字符串最常见的坑是 \`null\` / \`undefined\`。严格模式下，\`string\` 不包括它们：

\`\`\`tsx
let s: string = "abc";
// s = null;   // ❌ 严格模式下报错
// s = undefined; // ❌ 严格模式下报错
\`\`\`

如果允许为空，**用联合类型 \`string | null\`**，不要关闭 \`strict\`。

### 2.1.2 \`number\`：数字

\`\`\`tsx
// 支持十进制、二进制、八进制、十六进制
const dec: number = 42;       // 十进制
const bin: number = 0b101010; // 二进制，等于 42
const oct: number = 0o52;     // 八进制，等于 42
const hex: number = 0x2a;     // 十六进制，等于 42
const float: number = 3.14;   // 浮点数
const neg: number = -1;       // 负数

// 特殊值
const inf: number = Infinity;
const nan: number = NaN;
\`\`\`

注意 \`NaN\` 是 \`number\` 类型——这是 IEEE 754 标准规定的。如果想区分"非数字"，用 \`Number.isNaN()\` 运行时检查。

### 2.1.3 \`boolean\`：布尔值

\`\`\`tsx
const isDone: boolean = false;
const isOk: boolean = true;

// 常见错误：用 0/1 当 boolean
// const bad: boolean = 1; // ❌ Type 'number' is not assignable to 'boolean'
\`\`\`

### 2.1.4 \`null\` 与 \`undefined\`：空值

这两个类型在 TS 里有特殊地位，因为默认 \`strictNullChecks\` 开启时，它们**不能赋给其他类型**。

\`\`\`tsx
// 单独使用：只能是它自己
const n: null = null;
const u: undefined = undefined;

// 严格模式下，下面会报错
// const s: string = null; // ❌

// 必须显式联合
const maybe: string | null = Math.random() > 0.5 ? "ok" : null;
\`\`\`

\`null\` 和 \`undefined\` 的语义区别：

- \`null\`：表示"有意为之的空"——比如查询数据库没找到，主动返回 \`null\`。
- \`undefined\`：表示"未赋值"——比如函数没写 return、对象没这个属性。

### 2.1.5 \`void\`：无返回值

\`\`\`tsx
// void 通常用于函数返回值
function log(msg: string): void {
  console.log(msg);
  // 不写 return 或 return; 都不报错
}

// 调用者拿到的也是 void
const result = log("hi"); // result: void
\`\`\`

\`void\` 不是"没有类型"的意思，它**专门表示"无意义的返回值"**。

### 2.1.6 \`never\`：永不返回

\`never\` 是 TS 最特殊的类型——它表示"这个值永远不会出现"。

\`\`\`tsx
// 场景 1：函数抛出异常，永不返回
function throwError(msg: string): never {
  throw new Error(msg);
}

// 场景 2：无限循环
function loopForever(): never {
  while (true) {
    // ...
  }
}

// 场景 3：穷尽性检查
// 当所有分支都被覆盖，default 永远走不到
function exhaustive(x: never): never {
  throw new Error("unhandled case: " + x);
}

type Status = "ok" | "err";
function handle(s: Status) {
  if (s === "ok") return "✓";
  if (s === "err") return "✗";
  // 这里 s 已经是 never
  return exhaustive(s);
}
\`\`\`

\`never\` 是**所有类型的子类型**——它可以赋给任何类型，但反过来不行。这在类型推导时很关键。

### 2.1.7 特殊类型 \`any\` 和 \`unknown\`

这两个类型将在 2.3 节详细对比，这里先给定义：

- \`any\`：跳过所有类型检查
- \`unknown\`：使用前必须先 narrow（收窄）

## 2.2 字面量类型（Literal Types）

字面量类型是 TS 的"杀手锏"——它把一个具体的值当成类型。

### 2.2.1 字符串字面量

\`\`\`tsx
// 字符串字面量类型
// 看起来像字符串，但实际类型是 "red"，不是 string
const color: "red" = "red";
// color = "blue"; // ❌ Type '"blue"' is not assignable to type '"red"'
\`\`\`

单看意义不大，**配合联合才有威力**：

\`\`\`tsx
// 限定参数只能是这几个字符串之一
function setTheme(theme: "light" | "dark" | "auto") {
  // 函数体里 theme 一定是这三个之一
  if (theme === "auto") {
    // 走自动判断逻辑
  }
}

// 调用时 TS 会校验
setTheme("light"); // ✓
setTheme("blue");  // ❌
\`\`\`

这种"枚举式字符串"在 API 设计里非常常见。比如按钮的 \`variant: "primary" | "secondary" | "danger"\`、HTTP 方法、排序方向等。

### 2.2.2 数字字面量

\`\`\`tsx
// 数字字面量类型：具体某个数字
const port: 8080 = 8080;

// 联合：限定可接受的 HTTP 状态码
type StatusCode = 200 | 301 | 404 | 500;
function handleStatus(code: StatusCode) {
  // 只可能取这些值
}
\`\`\`

数字字面量类型比字符串用得少，**但可以用来定义"魔法数字"**。

### 2.2.3 布尔字面量

布尔字面量类型其实就是 \`true\` 和 \`false\` 本身。一般直接用 \`boolean\`，但在某些类型推导场景下会出现：

\`\`\`tsx
// 当联合里出现 boolean，TS 会自动转成 true | false
const flag: boolean = true;
// flag 的类型是 boolean（true | false 的简写）
\`\`\`

## 2.3 \`any\` vs \`unknown\`：初学者最常问的对比

这是新人 100% 会问的问题。

### 2.3.1 \`any\`：关掉类型检查

\`\`\`tsx
let a: any = 1;
a.foo.bar.baz(); // 不报错
a = "hello";
a[0][1][2];      // 不报错
\`\`\`

\`any\` 等于"这个值的类型我不在乎"，**所有操作都被允许**。它常用于：
- 迁移老 JS 代码到 TS
- 临时绕过复杂类型
- 第三方库没提供类型

### 2.3.2 \`unknown\`：必须先收窄

\`\`\`tsx
let u: unknown = 1;
// u.toFixed();   // ❌ Object is of type 'unknown'
// u.toUpperCase(); // ❌

// 必须先收窄才能用
if (typeof u === "number") {
  u.toFixed(2); // ✓ TS 知道 u 是 number
}
\`\`\`

### 2.3.3 何时用哪个

| 场景 | 推荐 | 原因 |
| --- | --- | --- |
| 函数参数 \`JSON.parse\` 返回值 | \`unknown\` | 解析结果可能是任意类型，调用方必须验证 |
| 第三方库没类型 | \`any\`（临时）+ \`declare module\` | 临时的类型缺口 |
| 你确实不在乎类型 | \`any\` | 极少使用 |
| 函数 try/catch 里的 error | \`unknown\`（TS 4.4+） | 默认就是 unknown，强制你处理 |

**金科玉律**：能 \`unknown\` 就不 \`any\`。

## 2.4 类型注解 vs 类型推断

TS 不会强迫你每个地方都写类型——它**会根据上下文推断**。

\`\`\`tsx
// 显式注解
const x: number = 1;

// 类型推断
const y = 1; // y 自动推断为 number
\`\`\`

**最佳实践**：

- 简单变量：让 TS 自己推断，不要重复标注
- 函数参数和返回值：必须显式标注（推断不出）
- 复杂对象字面量：标注一次胜过注释一百行

\`\`\`tsx
// 推荐：简单变量让 TS 推断
const count = 0;          // 自动 number
const message = "hi";     // 自动 string

// 推荐：函数签名显式标注
function parse(input: string): number {
  return Number(input);
}

// 推荐：对象用 interface 或 type（见第四章）
type User = { name: string; age: number };
const u: User = { name: "张三", age: 30 };
\`\`\`

## 2.5 综合 Demo：API 响应类型

我们把本章所有类型组合起来，写一个真实场景的 demo。

\`\`\`tsx
// 第二章综合 demo：API 响应处理
// 演示：原始类型、字面量类型、unknown、类型守卫

// 1. 用字面量联合定义请求状态
// 优点：编辑器自动补全，避免拼错字符串
type RequestStatus = "idle" | "loading" | "success" | "error";

// 2. 模拟从后端拿到的数据
// unknown 比 any 安全：调用方必须先验证才能用
function fetchData(url: string): unknown {
  // 真实项目里这里会调 fetch
  // 沙箱里我们直接返回一个对象模拟
  if (url.startsWith("/api/user")) {
    return { id: 1, name: "张三" };
  }
  return null;
}

// 3. 解析函数：必须用类型守卫验证 unknown
// 这里用"自定义类型谓词"
function isUser(data: unknown): data is { id: number; name: string } {
  // 运行时检查：data 是不是对象、属性对不对
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "name" in data &&
    typeof (data as any).id === "number" &&
    typeof (data as any).name === "string"
  );
}

// 4. 业务函数：处理加载状态
function render(status: RequestStatus, data: unknown): string {
  // 类型守卫
  if (status === "loading") return "加载中…";
  if (status === "error") return "出错了";
  if (status === "idle") return "未开始";
  // status 现在被收窄为 "success"
  if (isUser(data)) {
    // data 在这个分支里是 { id: number; name: string }
    return \`欢迎，\${data.name}（id: \${data.id}）\`;
  }
  return "数据格式不对";
}

// 5. 演示运行
console.log(render("loading", null));   // "加载中…"
console.log(render("success", { id: 1, name: "张三" })); // "欢迎，张三（id: 1）"
console.log(render("success", { foo: 1 })); // "数据格式不对"
console.log(render("error", null));      // "出错了"

// 6. never 类型的妙用：穷尽性检查
// 如果未来给 RequestStatus 加了新状态，下面会立刻报错
function assertNever(x: never): never {
  throw new Error("Unexpected: " + x);
}

function describeStatus(s: RequestStatus): string {
  switch (s) {
    case "idle": return "空闲";
    case "loading": return "加载中";
    case "success": return "成功";
    case "error": return "失败";
    // 如果上面漏了某个 case，这里 s 不是 never，会报错
    default: return assertNever(s);
  }
}

console.log(describeStatus("success")); // "成功"

// 7. void 的常见用法：事件回调
type ClickHandler = (e: { x: number; y: number }) => void;
const handler: ClickHandler = (e) => {
  // 返回值被忽略
  console.log("clicked at", e.x, e.y);
};
handler({ x: 10, y: 20 });
\`\`\`

## 小结

- 基础类型包括 \`string\`、\`number\`、\`boolean\`、\`null\`、\`undefined\`、\`void\`、\`never\`、\`bigint\`、\`symbol\`。
- \`void\` 用于无返回值函数，\`never\` 用于永不返回（异常/无限循环）和穷尽性检查。
- **字面量类型**是 TS 的"杀手锏"，把具体值当类型，配合联合做枚举式 API。
- \`any\` 关闭类型检查，\`unknown\` 强制收窄；**能用 \`unknown\` 就不用 \`any\`**。
- 简单变量让 TS 推断，函数签名必须显式标注。
- 严格模式下 \`null\`/\`undefined\` 不能赋给其他类型，需要联合。
- 类型守卫（\`typeof\` / \`in\` / 自定义谓词）是处理 \`unknown\` 的标准武器。
`,
  },

  // ============================================================
  // 第三章：数组与元组
  // ============================================================
  {
    id: "tsx2-ch03",
    group: "第一部分 TypeScript 类型基础",
    icon: "📊",
    title: "第三章 数组与元组",
    content: `# 第三章 数组与元组

数组是 JS 里最高频的数据结构，TS 给它提供了非常精细的类型系统。本章我们从"数组的多种写法"开始，扩展到**元组**（tuple）这个 JS 没有、TS 独有的特性，最后讲**只读数组**和**多维数组**的工程实践。

## 3.1 数组类型：五种写法

TS 给数组定义了至少五种声明方式。初学者不必全记住，但**理解每种写法的场景**会让你读别人代码时不困惑。

### 3.1.1 \`T[]\`：最常用

\`\`\`tsx
// 元素都是 number
const nums: number[] = [1, 2, 3];

// 元素都是 string
const strs: string[] = ["a", "b"];

// 混合：用联合
const mixed: (string | number)[] = [1, "a", 2, "b"];
\`\`\`

注意 \`(string | number)[]\` 必须加括号——否则 TS 会解析成 \`string | number[]\`，意思变成"string 或者 number 数组"。

### 3.1.2 \`Array<T>\`：泛型写法

\`\`\`tsx
// 等价于 number[]
const nums: Array<number> = [1, 2, 3];

// 复杂类型用泛型更清晰
const pairs: Array<[string, number]> = [["age", 30], ["score", 95]];
\`\`\`

两种写法完全等价，**个人偏好 + 团队约定**决定选哪个。本书示例用 \`T[]\`，因为更简洁。

### 3.1.3 接口形式：实际不用

\`\`\`tsx
// 数组本身是 Array<T> 的实例
// 下面这种写法合法但极少使用
interface MyArray extends Array<number> {}
const arr: MyArray = [1, 2, 3];
\`\`\`

这是为了"完整性"列出来，**实际开发别这么写**。

### 3.1.4 函数返回值推导

\`\`\`tsx
// 函数返回数组，让 TS 推断
function makeRange(start: number, end: number) {
  const result: number[] = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result; // TS 推断返回类型为 number[]
}

console.log(makeRange(1, 5)); // [1, 2, 3, 4, 5]
\`\`\`

### 3.1.5 字面量数组

\`\`\`tsx
// 用 as const 锁定具体值
const directions = ["up", "down", "left", "right"] as const;
// 类型：readonly ["up", "down", "left", "right"]
// 元素只能是这四个字符串之一
\`\`\`

## 3.2 数组方法与类型

TS 知道所有数组方法（\`map\`、\`filter\`、\`reduce\`、\`forEach\` 等）的签名，IDE 会自动给出补全和类型提示。这里给几个**容易踩坑**的例子。

### 3.2.1 \`map\` 的回调返回类型

\`\`\`tsx
const nums = [1, 2, 3];

// map 的回调返回 string，所以结果数组是 string[]
const strs = nums.map(n => \`\${n}号\`); // strs: string[]

// map 的回调返回 number，结果还是 number[]
const doubled = nums.map(n => n * 2); // doubled: number[]

// map 的回调返回某种类型，结果就是对应类型的数组
const bools = nums.map(n => n > 1); // bools: boolean[]
\`\`\`

### 3.2.2 \`filter\` 的类型谓词

\`\`\`tsx
const mixed: (string | number)[] = [1, "a", 2, "b"];

// 普通 filter：类型不变（TS 不会收窄）
const filtered = mixed.filter(x => typeof x === "string");
// filtered: (string | number)[] ❌ 仍然是联合类型

// 用类型谓词：让 TS 收窄
const strings = mixed.filter((x): x is string => typeof x === "string");
// strings: string[] ✓
\`\`\`

**\`x is string\` 是类型谓词**，告诉 TS"如果这个函数返回 true，参数 x 的类型就是 string"。

### 3.2.3 \`reduce\` 的初值决定结果类型

\`\`\`tsx
const nums = [1, 2, 3, 4];

// 初值是 0（number），所以累加结果是 number
const sum = nums.reduce((acc, n) => acc + n, 0); // sum: number

// 初值是 ""（string），所以结果是 string
const concat = nums.reduce((acc, n) => acc + n, ""); // concat: string
\`\`\`

## 3.3 元组（Tuple）：固定长度、固定类型

JS 数组的弱点是"长度和元素类型都不确定"。TS 引入**元组**（tuple）来表达"我知道这个数组恰好 N 个，每个位置类型是什么"。

### 3.3.1 基本元组

\`\`\`tsx
// 二元组：第一个是 string，第二个是 number
const pair: [string, number] = ["age", 30];

// 三元组
const triple: [string, number, boolean] = ["张三", 30, true];

// 越界访问会报错
// pair[2] = "extra"; // ❌ 长度必须是 2
// pair[0] = 100;     // ❌ 第 0 位必须是 string
\`\`\`

元组和数组的对比：

| 特性 | \`Array<T>\` | \`[T1, T2]\` |
| --- | --- | --- |
| 长度 | 任意 | 固定 |
| 元素类型 | 全部 T | 每位不同 |
| 越界 | 不报错 | 报错（除非有 rest） |
| 常见场景 | 列表 | 异构数据、临时打包 |

### 3.3.2 可选元素

元组允许末尾有可选元素，用 \`?\`：

\`\`\`tsx
// 第三位可以不存在
const entry: [string, number, boolean?] = ["age", 30];
// 也可以三个都填
const full: [string, number, boolean?] = ["age", 30, true];
\`\`\`

### 3.3.3 rest 元组

\`\`\`tsx
// 第一个是 string，后面跟任意个 number
type StringNums = [string, ...number[]];

const a: StringNums = ["hi", 1, 2, 3];
const b: StringNums = ["hi"]; // 也合法

// 限定至少 1 个
type OnePlusNums = [number, ...number[]];
const c: OnePlusNums = [1];          // ✓
const d: OnePlusNums = [1, 2, 3];    // ✓
\`\`\`

rest 元组在 React 组件 props 推导时非常有用——\`React.forwardRef\` 的类型推导就基于此。

### 3.3.4 命名元组

TS 4.0+ 支持给元组元素起名字，**只影响编辑器提示和 hover**，不影响运行时：

\`\`\`tsx
// 给每个位置起名字，可读性大大提升
type UserTuple = [name: string, age: number, active: boolean];

const u: UserTuple = ["张三", 30, true];
// 悬停 u[0] 会显示"name: string"
\`\`\`

### 3.3.5 元组的常见用法

**用法 1：函数返回多个值**

\`\`\`tsx
// 不用元组就只能返回对象，更啰嗦
function divmod(a: number, b: number): [number, number] {
  return [Math.floor(a / b), a % b];
}

const [quotient, remainder] = divmod(10, 3); // [3, 1]
\`\`\`

**用法 2：React 18 的 useState**

\`\`\`tsx
// React 的 useState 返回的就是元组
// const [count, setCount] = useState(0);
// 类型：[number, Dispatch<SetStateAction<number>>]
\`\`\`

**用法 3：键值对**

\`\`\`tsx
// 模拟 Map 的条目
const entries: [string, number][] = [
  ["a", 1],
  ["b", 2],
];

// 还原成对象
const obj = Object.fromEntries(entries); // { a: 1, b: 2 }
\`\`\`

## 3.4 只读数组与只读元组

\`mutable\`（可变）是 JS 数组的默认行为，但很多场景下我们想防止意外修改。

### 3.4.1 \`readonly T[]\` 与 \`ReadonlyArray<T>\`

\`\`\`tsx
// 只读数组：不能用 push、pop、splice 等
const nums: readonly number[] = [1, 2, 3];
// nums.push(4);   // ❌ Property 'push' does not exist
// nums[0] = 100;  // ❌ Index signature in type 'readonly number[]' only permits reading

// 等价写法
const nums2: ReadonlyArray<number> = [1, 2, 3];
\`\`\`

只读数组**不是**不可变数组——你仍然可以通过原始引用修改：

\`\`\`tsx
const mutable: number[] = [1, 2, 3];
const readonly: readonly number[] = mutable;
// readonly.push(4);  // ❌ TS 报错
mutable.push(4);       // ✓
console.log(readonly); // [1, 2, 3, 4] 真的变了
\`\`\`

**\`readonly\` 只是类型层面的保护**，运行时不强制。如果需要深层次不可变，用 \`as const\` + \`Object.freeze\`。

### 3.4.2 \`readonly\` 元组

\`\`\`tsx
const point: readonly [number, number] = [10, 20];
// point[0] = 0;  // ❌
\`\`\`

### 3.4.3 \`as const\`：最严格的不可变

\`\`\`tsx
// as const 把整个对象/数组变成 readonly + 字面量
const config = {
  api: "https://api.example.com",
  retries: 3,
  methods: ["GET", "POST"] as const,
} as const;

// 类型推断：
// {
//   readonly api: "https://api.example.com";
//   readonly retries: 3;
//   readonly methods: readonly ["GET", "POST"];
// }

// 全部 readonly，每个字段都是字面量
// config.api = "other";     // ❌
\`\`\`

\`as const\` 在配置文件、路由表、状态机定义里非常常用。

## 3.5 多维数组

\`\`\`tsx
// 二维数组：每个元素是 number[]
const matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

// 三维数组：number[][][]
const cube: number[][][] = [[[1]]];

// 类型别名让多维更可读
type Grid = number[][];
const grid: Grid = [
  [0, 1],
  [1, 0],
];
\`\`\`

**注意**：多维数组在 JS 里其实是"数组的数组"，**子数组长度可以不一致**。如果需要严格矩阵，**用元组**：

\`\`\`tsx
// 3x3 矩阵，每个子数组必须是长度为 3 的元组
type Matrix3x3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number],
];

const m: Matrix3x3 = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
// m[0][0] = "a";  // ❌
\`\`\`

## 3.6 数组解构的类型推导

\`\`\`tsx
// 解构时 TS 会保留元组类型信息
const tuple: [string, number, boolean] = ["a", 1, true];
const [a, b, c] = tuple;
// a: string, b: number, c: boolean ✓

// 跳过元素
const [, second] = tuple; // second: number

// 默认值（元素可能是 undefined）
const arr: (number | undefined)[] = [1, undefined, 3];
const [x = 0, y = 0, z = 0] = arr;
// 注意：解构默认值只在元素是 undefined 时生效
\`\`\`

## 3.7 综合 Demo：购物车数据

\`\`\`tsx
// 第三章综合 demo：购物车
// 演示：数组、元组、as const、只读

// 1. 商品类型
type Product = {
  readonly id: string;     // 商品 ID 不可变
  name: string;
  price: number;
  tags: string[];          // 标签数组
};

// 2. 购物车条目：用元组表达 [商品, 数量]
// 用命名元组让悬停提示更清晰
type CartItem = [product: Product, quantity: number];

// 3. 创建一些商品
const apple: Product = { id: "p1", name: "苹果", price: 5, tags: ["水果", "新鲜"] };
const book: Product = { id: "p2", name: "TypeScript 书", price: 89, tags: ["书籍"] };

// 4. 购物车：CartItem 数组
const cart: CartItem[] = [
  [apple, 3],     // 3 个苹果
  [book, 1],      // 1 本书
];

// 5. 计算总价
function total(items: readonly CartItem[]): number {
  // readonly 数组：可以用 for...of、reduce，但不能用 push
  return items.reduce((sum, [product, qty]) => sum + product.price * qty, 0);
}
console.log("总价：", total(cart)); // 5*3 + 89*1 = 104

// 6. 找出所有标签
function allTags(items: readonly CartItem[]): string[] {
  const result: string[] = [];
  for (const [p] of items) {
    // 解构只取第一个元素（商品）
    for (const tag of p.tags) {
      if (!result.includes(tag)) result.push(tag);
    }
  }
  return result;
}
console.log("所有标签：", allTags(cart)); // ["水果", "新鲜", "书籍"]

// 7. 订单状态：用字面量联合
type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

// 8. 订单记录
type Order = {
  id: string;
  items: readonly CartItem[];  // 订单条目不可变
  status: OrderStatus;
  createdAt: number;
};

const order: Order = {
  id: "o1",
  items: cart,
  status: "paid",
  createdAt: Date.now(),
};

// 9. 状态描述函数
function describeStatus(s: OrderStatus): string {
  switch (s) {
    case "pending": return "待支付";
    case "paid": return "已支付";
    case "shipped": return "已发货";
    case "delivered": return "已送达";
    case "cancelled": return "已取消";
  }
}

console.log("订单状态：", describeStatus(order.status)); // "已支付"

// 10. 用 as const 定义路由表
const routes = [
  { path: "/", name: "首页" },
  { path: "/cart", name: "购物车" },
  { path: "/checkout", name: "结算" },
] as const;

// routes 是 readonly 元组数组，每个字面量都被锁定
// routes[0].path = "/home";  // ❌
\`\`\`

## 小结

- 数组有两种基础写法：\`T[]\` 和 \`Array<T>\`，完全等价。
- \`map\` / \`filter\` / \`reduce\` 都有精确类型签名，**用类型谓词让 filter 收窄**。
- **元组**是固定长度、固定类型位置的数组，用 \`[T1, T2, ...]\` 声明。
- 元组支持可选元素、rest 元素、命名元素，灵活度比想象中高。
- \`readonly T[]\` / \`ReadonlyArray<T>\` 提供类型层面的只读保护。
- \`as const\` 是最严格的不可变形式，把所有字段锁成字面量。
- 多维数组用嵌套表示，但需要"严格矩阵"时用嵌套元组。
- 元组在 React hooks 返回值、多返回值函数、键值对场景里非常常用。
`,
  },

  // ============================================================
  // 第四章：对象类型与接口
  // ============================================================
  {
    id: "tsx2-ch04",
    group: "第一部分 TypeScript 类型基础",
    icon: "🏛️",
    title: "第四章 对象类型与接口",
    content: `# 第四章 对象类型与接口

JS 里"对象"无处不在——\`.{}\`、\`Object.create\`、class 实例、JSON 数据全是对象。TS 提供了三种描述对象形状的方式：**对象类型字面量**、**\`interface\`**、**\`type\`**。本章我们讲前两者，type 与 interface 的对比留到第八章。

## 4.1 对象类型字面量

最直接的写法是"对象字面量样式 + 类型注解"：

\`\`\`tsx
// 用 { field: type } 直接描述形状
const user: { name: string; age: number } = {
  name: "张三",
  age: 30,
};

// 缺属性会报错
// const u2: { name: string; age: number } = { name: "李四" };
// ❌ Property 'age' is missing

// 多余属性也会报错
// const u3: { name: string; age: number } = { name: "王五", age: 20, gender: "M" };
// ❌ Object literal may only specify known properties
\`\`\`

**注意"多余属性检查"**：直接传给变量的对象字面量，多余字段会报错；但如果先赋值给一个变量再传，TS 不检查（认为是"动态来源"）：

\`\`\`tsx
const config = { name: "李四", age: 20, gender: "M" };
const u4: { name: string; age: number } = config; // ✓（绕过了检查）
\`\`\`

这是个微妙但重要的细节——日常开发里会碰到。

## 4.2 接口（Interface）：对象的"契约"

对象字面量只能写一次形状，**重复使用就用 \`interface\`**。它的本质是"给对象类型起个名字"。

### 4.2.1 基本声明

\`\`\`tsx
// 用 interface 关键字定义一个对象形状
interface User {
  name: string;
  age: number;
}

// 像用类型一样用 User
const u1: User = { name: "张三", age: 30 };
const u2: User = { name: "李四", age: 25 };
\`\`\`

**接口命名约定**：首字母大写、驼峰式。React 组件 props 习惯加 \`Props\` 后缀（\`ButtonProps\`、\`ModalProps\`）。

### 4.2.2 可选属性

\`\`\`tsx
// 字段名后加 ? 表示可选
interface User {
  name: string;
  age?: number; // 可以不写
}

const u1: User = { name: "张三" };        // ✓
const u2: User = { name: "李四", age: 30 }; // ✓

// 读取时 TS 知道 age 可能是 undefined
function greet(u: User) {
  console.log(u.name);
  // u.age.toFixed(2);  // ❌ age 可能是 undefined
  if (u.age !== undefined) {
    u.age.toFixed(2); // ✓
  }
}
\`\`\`

### 4.2.3 只读属性

\`\`\`tsx
// readonly 标记的属性只能在初始化时赋值
interface Point {
  readonly x: number;
  readonly y: number;
}

const p: Point = { x: 1, y: 2 };
// p.x = 10;  // ❌ Cannot assign to 'x' because it is a read-only property
\`\`\`

\`readonly\` 是**编译期**的，运行时不阻止修改。和数组的 \`readonly\` 一样，需要 \`Object.freeze\` 才真不可变。

### 4.2.4 索引签名（Index Signature）

当对象的"键"是动态的（不确定有多少个），用索引签名：

\`\`\`tsx
// 任意 string 键，值是 number
interface StringNumberMap {
  [key: string]: number;
}

const ages: StringNumberMap = {
  张三: 30,
  李四: 25,
  // 任何字符串键都接受
};
ages["王五"] = 28;
ages["count"] = 100;
\`\`\`

**常见模式**：
- \`{ [key: string]: T }\`：所有键都是 \`T\`
- \`{ [key: number]: T }\`：类似数组
- 配合已知字段：\`{ name: string; [key: string]: any }\`

### 4.2.5 混合已知属性 + 索引签名

\`\`\`tsx
// 已知字段 + 任意其他字段
interface Config {
  api: string;        // 必填的已知字段
  retries: number;
  [key: string]: unknown; // 其他字段类型任意
}

const c1: Config = {
  api: "https://api.example.com",
  retries: 3,
  timeout: 5000, // 合法（走索引签名）
};
\`\`\`

**注意**：已知字段的类型必须兼容索引签名的类型，否则会冲突。

## 4.3 继承（extends）：接口复用

接口可以互相继承，构建出层次化的类型系统。

### 4.3.1 单继承

\`\`\`tsx
// 基础接口
interface Animal {
  name: string;
  age: number;
}

// 子接口扩展父接口
interface Dog extends Animal {
  breed: string; // 狗特有：品种
}

const d: Dog = {
  name: "旺财",
  age: 3,
  breed: "柴犬",
};
\`\`\`

### 4.3.2 多继承

\`\`\`tsx
// 多个父接口
interface Name {
  name: string;
}
interface Age {
  age: number;
}
interface User extends Name, Age {
  email: string;
}

const u: User = {
  name: "张三",
  age: 30,
  email: "zhangsan@example.com",
};
\`\`\`

### 4.3.3 接口继承 type

\`\`\`tsx
// 反过来：type 也可以从 interface 继承
type Person = { name: string } & { age: number };
// 等价于 { name: string; age: number }
\`\`\`

但 \`interface extends type\` 也合法（TS 2.2+）：

\`\`\`tsx
type WithTimestamps = { createdAt: number; updatedAt: number };
interface Article extends WithTimestamps {
  id: string;
  title: string;
}
\`\`\`

## 4.4 声明合并（Declaration Merging）

interface 有一个独特的特性：**同名 interface 会自动合并**。这是给"扩展第三方库类型"用的，要小心用。

### 4.4.1 基本合并

\`\`\`tsx
// 同一个名字的 interface 会被合并
interface Box {
  width: number;
  height: number;
}
interface Box {
  depth: number;
  color?: string;
}

// 最终 Box 等价于：
// interface Box { width: number; height: number; depth: number; color?: string; }
const b: Box = {
  width: 10,
  height: 20,
  depth: 30,
};
\`\`\`

**注意冲突规则**：相同字段的类型必须一致，否则会报错。

### 4.4.2 真实场景：扩展第三方库

\`\`\`tsx
// 假设某个第三方库导出了 Window 接口
// 我们想给它添加一个自定义属性
interface Window {
  MY_GLOBAL_TOOL: {
    track: (event: string) => void;
  };
}

// 现在所有 window.MY_GLOBAL_TOOL 调用都合法
window.MY_GLOBAL_TOOL.track("init");
\`\`\`

### 4.4.3 合并 vs 继承

| 特性 | 合并（同名 interface） | 继承（\`extends\`） |
| --- | --- | --- |
| 关系 | 同一个接口分多次声明 | 子接口继承父接口 |
| 命名 | 必须同名 | 不同名 |
| 用途 | 给现有类型加字段 | 构建新类型 |

## 4.5 方法类型

接口里描述方法有三种写法：

\`\`\`tsx
// 写法 1：方法签名（推荐）
interface User {
  greet(msg: string): string;
}

// 写法 2：函数属性
interface User2 {
  greet: (msg: string) => string;
}

// 写法 3：带 this 类型（少见）
interface User3 {
  greet(this: User3, msg: string): string;
}
\`\`\`

**写法 1 和写法 2 大部分情况等价**，但有个微妙区别：写法 1 不允许把方法单独赋值给变量，写法 2 可以：

\`\`\`tsx
const u1: User = {
  greet: (m) => "hi", // 实际上写法 1 也接受这种实现
};

// 写法 1 的"方法"在严格模式下不会被解构成独立函数
// u1.greet;  // 类型是 (msg: string) => string
\`\`\`

## 4.6 接口与 class 的关系

\`implements\` 关键字让 class 实现接口：

\`\`\`tsx
// 定义一个形状
interface Flyable {
  fly(): void;
}

// 类实现接口
class Bird implements Flyable {
  // 必须实现 fly 方法
  fly() {
    console.log("flying...");
  }
}

class Airplane implements Flyable {
  fly() {
    console.log("jet flying...");
  }
}
\`\`\`

**一个 class 可以实现多个 interface**：

\`\`\`tsx
interface Swimmable {
  swim(): void;
}
interface Flyable2 {
  fly(): void;
}

class Duck implements Swimmable, Flyable2 {
  swim() { console.log("swimming"); }
  fly() { console.log("flying"); }
}
\`\`\`

这正是 TS 在做"鸭子类型"——你不必继承某个抽象类，只要形状对就行。

## 4.7 综合 Demo：电商系统模型

\`\`\`tsx
// 第四章综合 demo：电商领域模型
// 演示：接口、可选/只读、继承、声明合并

// 1. 基础实体接口
interface BaseEntity {
  readonly id: string;       // ID 不可变
  readonly createdAt: number; // 创建时间不可变
  updatedAt: number;          // 更新时间可变
}

// 2. 用户
interface User extends BaseEntity {
  name: string;
  email: string;
  avatar?: string; // 可选：头像
  role: "admin" | "member"; // 字面量联合
}

// 3. 商品
interface Product extends BaseEntity {
  name: string;
  price: number;
  stock: number;
  tags: readonly string[]; // 标签只读
}

// 4. 订单状态
type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

// 5. 订单
interface Order extends BaseEntity {
  userId: string;
  items: readonly {
    productId: string;
    quantity: number;
    priceAtPurchase: number; // 下单时价格快照
  }[];
  status: OrderStatus;
  total: number;
}

// 6. 用接口描述 API 响应
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {                  // 失败时有 error
    code: number;
    message: string;
  };
  meta?: {                   // 可选：分页等元信息
    page: number;
    total: number;
  };
}

// 7. 模拟数据
const product: Product = {
  id: "p1",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  name: "机械键盘",
  price: 599,
  stock: 100,
  tags: ["外设", "机械"],
};

const order: Order = {
  id: "o1",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  userId: "u1",
  status: "paid",
  total: 599,
  items: [
    { productId: "p1", quantity: 1, priceAtPurchase: 599 },
  ],
};

// 8. 包装响应
const res: ApiResponse<Order> = {
  success: true,
  data: order,
};

const errRes: ApiResponse<Order> = {
  success: false,
  data: null as any, // 这里简写，实际应该用完整的错误处理
  error: { code: 404, message: "订单不存在" },
};

// 9. 业务函数：只接受满足接口的对象
function printOrder(o: Order) {
  console.log(\`订单 \${o.id}：\${o.total} 元（\${o.status}）\`);
  for (const item of o.items) {
    console.log(\`  - \${item.productId} x \${item.quantity}\`);
  }
}

printOrder(order);

// 10. 工具函数：从商品创建订单条目
function createOrderItem(p: Product, qty: number) {
  // 返回的对象类型自动推导
  return {
    productId: p.id,
    quantity: qty,
    priceAtPurchase: p.price, // 锁定价格
  };
}

const item = createOrderItem(product, 2);
console.log("下单条目：", item);

// 11. 声明合并演示：扩展 Window
// 在实际项目里这会写在 .d.ts 文件里
interface Window {
  __APP_CONFIG__: {
    version: string;
    env: "dev" | "prod";
  };
}

// 现在 window.__APP_CONFIG__ 合法
const v = window.__APP_CONFIG__?.version ?? "unknown";
console.log("版本：", v);
\`\`\`

## 小结

- **对象类型字面量** \`{ a: string; b: number }\` 适合描述一次性形状。
- **\`interface\`** 给对象类型起名字，支持继承、声明合并、类实现。
- 可选属性用 \`?\`，只读属性用 \`readonly\`。
- **索引签名** \`[key: string]: T\` 描述动态键对象。
- 接口支持单继承、多继承，也能继承 type。
- **声明合并**是 interface 独有特性，适合扩展第三方库。
- 类用 \`implements\` 实现接口，可同时实现多个。
- 对象字面量有"多余属性检查"，赋值给变量再传会绕过它。
`,
  },

  // ============================================================
  // 第五章：函数类型
  // ============================================================
  {
    id: "tsx2-ch05",
    group: "第一部分 TypeScript 类型基础",
    icon: "🔧",
    title: "第五章 函数类型",
    content: `# 第五章 函数类型

函数是 JS 一等公民，也是 TS 类型系统的核心。**所有可调用对象**——普通函数、箭头函数、class 方法、构造函数、回调函数——都能被精确描述。本章我们从函数声明的类型开始，覆盖参数、返回值、重载、this、void/never 等所有常用模式。

## 5.1 函数声明的类型注解

### 5.1.1 命名函数

\`\`\`tsx
// 给参数和返回值都加类型
function add(a: number, b: number): number {
  return a + b;
}

// 调用时 TS 校验参数
add(1, 2);      // ✓
add("1", 2);    // ❌ Argument of type 'string' is not assignable
add(1);         // ❌ Expected 2 arguments, but got 1
\`\`\`

### 5.1.2 箭头函数

\`\`\`tsx
// 显式标注
const add = (a: number, b: number): number => a + b;

// 完整类型 + 实现
const greet: (name: string) => string = (name) => \`Hi, \${name}\`;

// 推断：参数和返回值可省略，让 TS 推断
const square = (x: number) => x * x; // 推断返回 number
\`\`\`

### 5.1.3 函数类型作为"签名"

\`\`\`tsx
// (a: number, b: number) => number 是函数类型
type MathOp = (a: number, b: number) => number;

// 用类型别名声明"接受两个数返回一数"的函数
const sub: MathOp = (a, b) => a - b;
const mul: MathOp = (a, b) => a * b;

console.log(sub(10, 3)); // 7
console.log(mul(10, 3)); // 30
\`\`\`

## 5.2 参数类型

### 5.2.1 必选参数

默认所有参数必选，调用时少传就报错。

### 5.2.2 可选参数 \`?\`

\`\`\`tsx
// 第二个参数可选
function greet(name: string, greeting?: string): string {
  // 可选参数类型自动是 T | undefined
  return \`\${greeting ?? "Hello"}, \${name}\`;
}

greet("张三");            // "Hello, 张三"
greet("张三", "Hi");      // "Hi, 张三"
greet("张三", undefined); // "Hello, 张三"
\`\`\`

**注意**：可选参数必须放在必选参数之后。

### 5.2.3 默认参数

\`\`\`tsx
// 有默认值的参数 TS 自动推断为可选
function greet(name: string, greeting: string = "Hello"): string {
  return \`\${greeting}, \${name}\`;
}

// 调用时少传会用默认值
greet("张三");        // "Hello, 张三"
greet("张三", "Hi");  // "Hi, 张三"
\`\`\`

**\`?\` 和默认值选哪个**：

- \`?\`：调用方传 \`undefined\` 跟不传等价，且参数类型是 \`T | undefined\`。
- 默认值：调用方少传时用默认值，类型仍然是 \`T\`。

### 5.2.4 Rest 参数

\`\`\`tsx
// ...rest 收集多余参数
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3, 4); // 10
\`\`\`

Rest 元素也可以是元组类型（用于 React 事件等场景）：

\`\`\`tsx
// 第一个是 string，后面任意 string
function tag(name: string, ...rest: string[]): string {
  return \`<\${name}\${rest.map(s => \` \${s}\`).join("")}>\`;
}
console.log(tag("div", "class=x", "id=y")); // "<div class=x id=y>"
\`\`\`

## 5.3 返回值类型

### 5.3.1 显式返回类型

\`\`\`tsx
// 推荐：函数声明显式标注返回值
function parseNum(s: string): number {
  return Number(s);
}
\`\`\`

**什么时候必须显式标注**：

- 公共 API（export 的函数）
- 递归函数（TS 可能推不出）
- 复杂推导失败的场景

### 5.3.2 隐式返回 undefined

\`\`\`tsx
// 不写 return 实际返回 undefined
function log(msg: string) {
  console.log(msg);
}

// 等价于：function log(msg: string): undefined
// 但更推荐显式标 void
function log2(msg: string): void {
  console.log(msg);
}
\`\`\`

### 5.3.3 void vs never

| 特性 | \`void\` | \`never\` |
| --- | --- | --- |
| 含义 | 函数正常返回（无意义值） | 函数永不返回（异常/无限循环） |
| 常见用法 | 回调、setter、事件处理器 | 抛错、穷尽性检查 |
| 调用方 | 可以调用，不取返回值 | 后面代码不可达 |

\`\`\`tsx
function log(msg: string): void {
  console.log(msg);
}

function throwErr(msg: string): never {
  throw new Error(msg);
}

function loop(): never {
  while (true) { /* ... */ }
}
\`\`\`

## 5.4 函数重载（Overloads）

**重载**让你为同一个函数声明多种调用签名，TS 会根据参数选择对应的返回类型。

### 5.4.1 基本重载

\`\`\`tsx
// 重载签名：先写多种调用方式
function combine(a: string, b: string): string;
function combine(a: number, b: number): number;
// 实现签名：所有重载的"最宽泛"形式
function combine(a: any, b: any): any {
  if (typeof a === "string") return a + b;
  return a + b;
}

// TS 根据参数类型决定返回类型
const r1 = combine("a", "b"); // r1: string
const r2 = combine(1, 2);     // r2: number
\`\`\`

### 5.4.2 重载顺序：先精确后宽泛

\`\`\`tsx
// 错误顺序：宽泛的在前面，精确的永远到不了
function f(x: any): number;
function f(x: string): string;  // 永远到不了
function f(x: any): any { return x; }

// 正确顺序：精确的先
function g(x: string): string;
function g(x: number): number;
function g(x: any): any { return x; }
\`\`\`

### 5.4.3 元组重载（高级）

\`\`\`tsx
// 长度不同的元组重载
function pad(input: string): [string, number];
function pad(input: string, length: number, char: string): string;
function pad(input: string, length?: number, char?: string): any {
  if (length === undefined) return [input, input.length];
  return input.padStart(length, char ?? " ");
}

const [str, len] = pad("hi");  // 解构：[string, number]
const padded = pad("hi", 5, "*"); // string
\`\`\`

## 5.5 this 参数

JS 里 \`this\` 是个老大难。TS 让你在参数列表第一个位置声明 \`this\` 的类型：

\`\`\`tsx
// this 参数：必须是第一个，名字必须是 this
interface User {
  name: string;
  greet(this: User, prefix: string): string;
}

const u: User = {
  name: "张三",
  greet(prefix) {
    // 这里 this 类型是 User（不是 any）
    return \`\${prefix}, \${this.name}\`;
  },
};

u.greet("Hi"); // "Hi, 张三"

// 解构后会丢失 this 类型
// const greetFn = u.greet;
// greetFn("Hi");  // ❌ this 是 undefined

// 用 bind 修复
const greetBound = u.greet.bind(u);
console.log(greetBound("Hi")); // "Hi, 张三"
\`\`\`

## 5.6 函数类型的常见模式

### 5.6.1 回调函数

\`\`\`tsx
// 给回调加类型
type Callback<T> = (value: T) => void;

function forEach<T>(arr: T[], cb: Callback<T>): void {
  for (const item of arr) cb(item);
}

forEach([1, 2, 3], (n) => console.log(n * 2)); // 2 4 6
\`\`\`

### 5.6.2 异步函数

\`\`\`tsx
// 返回 Promise<T> 的函数
async function fetchUser(id: string): Promise<{ name: string }> {
  // 真实项目里调 fetch
  return { name: "张三" };
}

// 等价写法（不用 async 关键字）
function fetchUser2(id: string): Promise<{ name: string }> {
  return Promise.resolve({ name: "李四" });
}
\`\`\`

### 5.6.3 构造函数签名

\`\`\`tsx
// 用 new 描述构造函数
type UserConstructor = new (name: string) => { name: string };

// 实际使用：class
class User {
  constructor(public name: string) {}
}

const ctor: UserConstructor = User;
const u = new ctor("张三");
console.log(u.name); // "张三"
\`\`\`

### 5.6.4 函数重载 vs 联合类型

\`\`\`tsx
// 联合类型：一个函数
function f1(x: string | number): string | number {
  return x;
}

// 重载：分情况
function f2(x: string): string;
function f2(x: number): number;
function f2(x: any): any { return x; }

const a = f1("hi"); // a: string | number（用时还得 narrow）
const b = f2("hi"); // b: string（直接是 string）
\`\`\`

**选哪个**：如果调用方要根据入参类型得到不同返回类型，**用重载**。否则联合类型更简洁。

## 5.7 参数解构与默认值

\`\`\`tsx
// 对象解构 + 类型注解
function greet({ name, age }: { name: string; age: number }): string {
  return \`\${name}, \${age}岁\`;
}
greet({ name: "张三", age: 30 });

// 嵌套解构
function process({ user: { name } }: { user: { name: string } }): string {
  return name;
}

// 用 interface 让签名更清晰
interface GreetInput {
  name: string;
  age?: number;
  greeting?: string;
}

function greet2({ name, age = 18, greeting = "Hello" }: GreetInput): string {
  return \`\${greeting}, \${name}（\${age}岁）\`;
}
console.log(greet2({ name: "张三" }));            // "Hello, 张三（18岁）"
console.log(greet2({ name: "李四", age: 25 }));   // "Hello, 李四（25岁）"
\`\`\`

## 5.8 综合 Demo：组合式工具库

\`\`\`tsx
// 第五章综合 demo：实现一个 lodash 风格工具库
// 演示：函数类型、泛型、重载、可选/默认/rest 参数

// 1. 工具：map
// 重载：保留 readonly 性质
function map<T, U>(arr: readonly T[], fn: (item: T, index: number) => U): U[];
function map<T, U>(arr: readonly T[], fn: (item: T) => U): U[] {
  const result: U[] = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i], i));
  }
  return result;
}

const nums = [1, 2, 3];
const doubled = map(nums, n => n * 2); // [2, 4, 6]
const indexed = map(nums, (n, i) => \`\${i}:\${n}\`); // ["0:1", "1:2", "2:3"]
console.log(doubled, indexed);

// 2. 工具：filter
// 用类型谓词收窄
function filter<T>(arr: readonly T[], pred: (item: T) => boolean): T[] {
  const result: T[] = [];
  for (const item of arr) {
    if (pred(item)) result.push(item);
  }
  return result;
}

const evens = filter(nums, n => n % 2 === 0);
console.log(evens); // [2]

// 3. 工具：reduce
function reduce<T, U>(arr: readonly T[], fn: (acc: U, cur: T) => U, init: U): U {
  let acc = init;
  for (const item of arr) acc = fn(acc, item);
  return acc;
}

const sum = reduce(nums, (acc, n) => acc + n, 0);
console.log(sum); // 6

// 4. 工具：chunk
// 把数组切成指定大小的块
function chunk<T>(arr: readonly T[], size: number): T[][] {
  if (size <= 0) throw new Error("size must be positive");
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
console.log(chunk([1, 2, 3, 4, 5], 2)); // [[1,2],[3,4],[5]]

// 5. 工具：debounce
// 节流函数
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const onResize = debounce((w: number, h: number) => {
  console.log(\`resize to \${w}x\${h}\`);
}, 100);
onResize(800, 600);
// 100ms 内多次调用只会执行最后一次

// 6. 工具：compose
// 函数组合：从右到左执行
function compose<A, B, C>(
  f: (b: B) => C,
  g: (a: A) => B
): (a: A) => C {
  return (a: A) => f(g(a));
}

// 多个函数的组合
function composeMany<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
}

const add1 = (x: number) => x + 1;
const double = (x: number) => x * 2;
const f = composeMany(add1, double); // 先 double 再 add1
console.log(f(3)); // 7 (3*2 + 1)

// 7. 工具：once
function once<T extends (...args: any[]) => any>(fn: T): T {
  let called = false;
  let result: ReturnType<T>;
  return ((...args: any[]) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  }) as T;
}

const init = once(() => {
  console.log("init once");
  return 42;
});
console.log(init()); // 打印并返回 42
console.log(init()); // 不打印，返回 42

// 8. 类型谓词工具
// 自定义"非空"过滤
function notNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

const maybeNums: (number | null)[] = [1, null, 2, null, 3];
const onlyNums = maybeNums.filter(notNull); // number[]
console.log(onlyNums); // [1, 2, 3]
\`\`\`

## 小结

- 函数类型签名：\`(a: T1, b: T2) => T3\`，参数和返回值都可省略让 TS 推断。
- 参数：必选、可选 \`?\`、默认值、rest \`...args: T[]\`。
- 返回值：可显式标注，\`void\` 表示无意义值，\`never\` 表示永不返回。
- **重载**让不同参数对应不同返回类型，顺序是先精确后宽泛。
- \`this\` 参数让 TS 知道方法体内的 \`this\` 类型。
- **泛型函数**让参数和返回类型"绑定"，是编写通用工具的关键。
- 对象解构 + interface 让复杂参数签名更可读。
- 函数作为一等公民：回调、Promise 返回、构造函数、组合式 API 都基于函数类型。
`,
  },
];

export { chapters };
