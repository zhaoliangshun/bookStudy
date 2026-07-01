// =============================================================
// TypeScript 新时代教程 —— 第一批章节（共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. ts2-intro         — TypeScript 新时代：为什么2026年你还需要TS
//   2. ts2-setup         — 现代化开发环境搭建
//   3. ts2-primitive     — 原始类型深度解析
//   4. ts2-array-tuple   — 数组与元组进阶
//   5. ts2-object-types  — 对象类型全解
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解（文字量是普通教程的 5 倍）
//   code    : 可运行、带详细中文注释的 TypeScript 示例代码
//
// 代码运行环境约束：
//   - 用户写的 TypeScript 先被 typescript 编译器转译为 JS
//     (target ES2020, module CommonJS, 支持装饰器)
//   - 再在 Node.js vm 沙箱中运行，5 秒超时
//   - 仅可 require: fs, path, os, url, crypto, util, events, stream,
//     buffer, querystring, string_decoder, zlib, assert, timers
//   - 全局可用: console, process, Buffer, setTimeout, setInterval,
//     setImmediate, URL, TextEncoder, TextDecoder, Promise,
//     __dirname, __filename, require, module, exports
//   - 类型注解/interface/type/enum/泛型/装饰器都可用(转译器处理)
//   - 类型错误不会阻止运行(教程侧重运行结果)
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：TypeScript 新时代：为什么2026年你还需要TS
  // =========================================================
  {
    id: "ts2-intro",
    title: "TypeScript 新时代：为什么2026年你还需要TS",
    icon: "📘",
    group: "基础入门",
    content: `## TypeScript 新时代：为什么2026年你还需要TS

### 一段传奇：从"小工具"到"行业标准"

回到2012年，彼时的前端世界和今天完全不同。jQuery 还在统治网页，Angular.js 刚刚崭露头角，React 还没有诞生，Node.js 也才发布了3年。JavaScript 虽然已经无处不在，但工程师们在大型项目中苦不堪言——一个简单的拼写错误可能要到上线后用户投诉才能发现，一次重构可能意味着数周的反复测试。正是在这种背景下，微软的 Anders Hejlsberg 团队发布了 TypeScript 的第一个公开版本。

起初，TypeScript 只是一个"小众工具"。许多开发者嘲笑它："写类型太麻烦了，JavaScript 就是该灵活！"、"这是微软的阴谋，想把 Java/C# 那套搬过来"。甚至在2014年，知名开发者 DHH（Ruby on Rails 之父）还公开表示"TypeScript 是解决了一个不存在的问题"。

然而时间证明了 Anders 的前瞻性。随着前端应用越来越复杂——单页应用（SPA）的兴起、微服务架构的普及、全栈开发的流行——JavaScript 的"灵活性"在大型项目中变成了"脆弱性"。TypeScript 的静态类型检查、卓越的IDE智能提示、安全的重构能力，逐渐成为现代工程化开发的标配。

### 2026年的TypeScript：不可撼动的王者地位

截至2026年，TypeScript 的地位已经无可争议。以下是几个关键数据：

- **Stack Overflow 2025 开发者调查**：TypeScript 在最受欢迎的语言中排名前3，超过70%的受访者表示"喜爱"或"想使用"TypeScript。
- **GitHub Octoverse 报告**：TypeScript 连续多年位列 GitHub 平台增长最快的语言之一，活跃仓库数量已超过纯 JavaScript 仓库。
- **npm 下载量**：TypeScript 编译器的周下载量超过1亿次，加上 @types/* 类型定义包，生态规模极其庞大。
- **框架生态**：React、Vue、Angular、Next.js、Nuxt、Svelte——所有主流前端框架都提供一流的 TypeScript 支持。其中 Next.js 15+ 和 Nuxt 3+ 甚至默认使用 TypeScript。
- **后端领域**：NestJS（基于TS的Node.js框架）、Deno（原生TS运行时）、Bun（原生TS支持）让TypeScript渗透到服务端。
- **企业采用**：Google、Meta、Microsoft、Amazon、Airbnb、Slack、Notion 等几乎所有科技巨头都在大规模使用 TypeScript。

### 为什么2026年你还需要学习TypeScript？

也许你会问："AI 编程助手已经很发达了，它不能帮我写代码吗？还需要我学类型系统吗？"

答案是：**AI 是工具，但理解类型系统是能力**。就像计算器不会让你不需要学数学一样，AI 编程助手不会让你不需要理解类型。理由如下：

1. **AI 生成的代码需要你审查**：如果你不理解类型系统，你无法判断AI生成的类型定义是否合理、是否有安全问题。
2. **类型设计是架构决策**：选择用 interface 还是 type、何时用泛型、如何设计类型层级——这些是架构层面的思考，AI 只能辅助，不能替代。
3. **调试类型错误需要专业知识**：当AI生成的代码出现类型错误时，你必须理解错误信息才能修复。
4. **团队协作和代码审查**：你必须能读懂同事（或AI）写的类型定义，才能进行有效的代码审查。

### TypeScript 5.x 的新时代特性

让我们快速回顾 TypeScript 5.x 系列带来的重要特性（截至2026年，TS 5.7+ 已经稳定）：

#### 装饰器正式化（TS 5.0+）

TypeScript 5.0 实现了 ECMAScript 的 Stage 3 装饰器提案，这是与旧版"实验性装饰器"完全不同的新实现：

\`\`\`ts
// 新的标准装饰器——更简洁、更强大
function logged(target: any, context: ClassMethodDecoratorContext) {
  const methodName = String(context.name);
  function replacementMethod(this: any, ...args: any[]) {
    console.log(\`调用 \${methodName}，参数: \${args}\`);
    return target.call(this, ...args);
  }
  return replacementMethod;
}

class Calculator {
  @logged
  add(a: number, b: number): number {
    return a + b;
  }
}
\`\`\`

#### const 类型参数（TS 5.0+）

\`\`\`ts
// 泛型参数前加 const，推断为最窄类型
function getConfig<const T extends readonly string[]>(keys: T): T {
  return keys;
}
const config = getConfig(["host", "port"]); // 类型是 readonly ["host", "port"]，而非 string[]
\`\`\`

#### 更好的类型收窄与控制流分析

TypeScript 5.x 的控制流分析能力大幅提升，能更精准地推断变量在条件分支中的类型变化。

#### 性能提升

TypeScript 5.x 的编译器速度比 4.x 提升了 10-25%，大型项目的编译体验更加流畅。

### TypeScript vs JavaScript：2026年的选择

到了2026年，这个问题的答案已经非常明确：

| 场景 | 推荐 |
| --- | --- |
| 个人小脚本、一次性工具 | JavaScript 足够 |
| 开源库、npm 包 | **强烈推荐 TypeScript** |
| 中大型 Web 应用 | **必须 TypeScript** |
| 后端服务 | **优先 TypeScript**（NestJS / Deno / Bun） |
| 原型快速验证 | JavaScript 可以，但 TS 的智能提示反而加速开发 |
| 团队协作项目 | **必须 TypeScript** |

### TypeScript 的局限性

客观地说，TypeScript 并非完美：

1. **编译步骤**：需要 tsc 或构建工具转译，增加了构建复杂度。
2. **类型体操**：过度使用高级类型（条件类型、映射类型、模板字面量类型）会让代码难以理解。
3. **类型定义维护成本**：当第三方库没有类型定义时，需要手动编写 \`.d.ts\` 文件。
4. **运行时没有类型保护**：类型在编译后完全消失，运行时无法检查类型。如果从外部 API 接收到数据，类型注解无法保证运行时安全——需要 zod、io-ts 等运行时验证库。

### 本节代码演示

下面这段代码展示了 TypeScript 在现代开发中的典型用法：类型注解、接口、泛型、类型收窄、以及一个模拟的 API 数据处理场景。它将向你展示 TypeScript 如何在编码阶段就帮你发现潜在问题。`,
    code: `// ============================================================
// 第一章代码演示：TypeScript 新时代全景体验
// ============================================================
// 说明：本演示展示 TypeScript 在现代开发中的典型用法。
// 运行时会先编译为 JS 再执行，类型注解在编译时被擦除。
// 但类型系统能帮你在写代码时获得智能提示、发现错误。

// ---- 1. 类型驱动开发：先定义类型，再写逻辑 ----
console.log("========== 1. 类型驱动开发 ==========");

// 先定义数据结构（类型即文档）
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// 再写函数——类型已经告诉你参数和返回值是什么
function formatUser(user: User): string {
  return \`[\${user.role}] \${user.name} <\${user.email}>\`;
}

function apiResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

// 模拟数据
const users: User[] = [
  { id: 1, name: "张三", email: "zhang@example.com", role: "admin", createdAt: "2025-01-15" },
  { id: 2, name: "李四", email: "li@example.com", role: "editor", createdAt: "2025-03-20" },
  { id: 3, name: "王五", email: "wang@example.com", role: "viewer", createdAt: "2025-06-01" },
];

console.log("用户列表:");
users.forEach((u) => console.log("  " + formatUser(u)));

// 模拟 API 调用
const response = apiResponse(users);
console.log("\\nAPI 响应状态:", response.success);
console.log("返回数据条数:", response.data.length);

// ---- 2. 类型收窄：安全处理联合类型 ----
console.log("\\n========== 2. 类型收窄 ==========");

// 联合类型：值可能是多种类型之一
type SearchResult = 
  | { type: "user"; user: User }
  | { type: "error"; code: number; message: string }
  | { type: "empty" };

function handleSearchResult(result: SearchResult): string {
  // 通过判别属性 type 进行类型收窄
  switch (result.type) {
    case "user":
      // 这里 result 被收窄为 { type: "user"; user: User }
      return "找到用户: " + result.user.name;
    case "error":
      // 这里 result 被收窄为 { type: "error"; code: number; message: string }
      return "搜索出错(" + result.code + "): " + result.message;
    case "empty":
      // 这里 result 被收窄为 { type: "empty" }
      return "没有找到匹配结果";
  }
}

const results: SearchResult[] = [
  { type: "user", user: users[0] },
  { type: "empty" },
  { type: "error", code: 503, message: "服务暂时不可用" },
];

results.forEach((r) => console.log("  " + handleSearchResult(r)));

// ---- 3. 泛型函数：灵活且类型安全 ----
console.log("\\n========== 3. 泛型实战 ==========");

// 泛型：让函数可以处理多种类型，同时保持类型安全
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

function lastElement<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    result[key] = obj[key];
  });
  return result;
}

console.log("第一个用户:", firstElement(users)?.name);
console.log("最后一个用户:", lastElement(users)?.name);

// 从对象中挑选指定属性
const picked = pick(users[0], ["name", "role"]);
console.log("挑选属性:", JSON.stringify(picked));

// 泛型可处理不同类型
const names = firstElement(["TypeScript", "JavaScript", "Python"]);
const nums = firstElement([10, 20, 30]);
console.log("泛型处理字符串:", names);
console.log("泛型处理数字:", nums);

// ---- 4. 实用类型工具：Partial, Readonly, Pick, Omit ----
console.log("\\n========== 4. 实用类型工具 ==========");

// Partial<T>: 所有属性变为可选
function updateUser(id: number, changes: Partial<User>): User {
  // 模拟更新：合并原数据和变更
  const original = users.find((u) => u.id === id) || users[0];
  const updated = { ...original, ...changes };
  return updated;
}

const updated = updateUser(1, { name: "张三(已改名)", role: "editor" });
console.log("Partial 更新:", formatUser(updated));

// Omit<T, K>: 排除指定属性
type UserWithoutId = Omit<User, "id">;
const newUserData: UserWithoutId = {
  name: "新用户",
  email: "new@example.com",
  role: "viewer",
  createdAt: new Date().toISOString().split("T")[0],
};
console.log("Omit 排除 id:", JSON.stringify(newUserData));

// ---- 5. 条件类型简单演示 ----
console.log("\\n========== 5. 条件类型 ==========");

// 条件类型：根据类型条件选择不同的类型
type IsString<T> = T extends string ? "是字符串" : "不是字符串";

function checkType<T>(value: T): IsString<T> {
  // 条件类型只在编译期生效，运行时需要手动判断
  if (typeof value === "string") {
    return "是字符串" as IsString<T>;
  }
  return "不是字符串" as IsString<T>;
}

console.log("checkType('hello'):", checkType("hello"));
console.log("checkType(42):", checkType(42));
console.log("checkType(true):", checkType(true));

// ---- 6. 模拟真实场景：数据处理管道 ----
console.log("\\n========== 6. 数据处理管道 ==========");

// 定义处理步骤
interface DataTransform<T, U> {
  name: string;
  transform: (input: T) => U;
}

// 组合多个转换步骤
function pipe<T>(
  initial: T,
  transforms: DataTransform<any, any>[]
): unknown {
  let value: unknown = initial;
  transforms.forEach((step) => {
    value = step.transform(value);
    console.log("  步骤 [" + step.name + "] 完成");
  });
  return value;
}

// 示例：处理用户数据
const pipeline: DataTransform<any, any>[] = [
  {
    name: "过滤活跃用户",
    transform: (users: User[]) => users.filter((u) => u.role !== "viewer"),
  },
  {
    name: "提取姓名",
    transform: (users: User[]) => users.map((u: User) => u.name),
  },
  {
    name: "排序",
    transform: (names: string[]) => [...names].sort(),
  },
];

const pipelineResult = pipe(users, pipeline);
console.log("\\n管道处理结果:", JSON.stringify(pipelineResult));

console.log("\\nTypeScript 新时代演示完成！");`,
  },

  // =========================================================
  // 第二章：现代化开发环境搭建
  // =========================================================
  {
    id: "ts2-setup",
    title: "现代化开发环境搭建",
    icon: "🔧",
    group: "基础入门",
    content: `## 现代化开发环境搭建

在开始编写 TypeScript 代码之前，搭建一个高效的开发环境至关重要。一个好的开发环境不仅能提升编码效率，还能在早期发现错误、保持代码风格一致、加速构建流程。本章将从头到尾带你搭建一个2026年的现代化 TypeScript 开发环境。

### 第一步：Node.js 版本选择与安装

TypeScript 编译器运行在 Node.js 之上，因此 Node.js 是开发环境的基础。截至2026年，推荐的 Node.js 版本策略如下：

- **生产环境（长期支持 LTS）**：使用最新的 LTS 版本，当前为 Node.js 22.x LTS。LTS 版本有30个月的维护期，适合生产环境部署。
- **开发环境**：可以使用最新的 Current 版本（Node.js 24.x），体验最新的语言特性和性能优化。

#### 安装 Node.js 的几种方式

1. **官方安装包**：从 nodejs.org 下载 macOS / Windows / Linux 的安装包，简单直接。
2. **Node.js 版本管理器（推荐）**：

\`\`\`bash
# nvm (Node Version Manager) — 最流行的版本管理器
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
nvm install 22        # 安装最新 LTS
nvm use 22            # 切换到该版本
nvm alias default 22  # 设为默认版本

# fnm (Fast Node Manager) — 更快的 Rust 实现
brew install fnm      # macOS
fnm install 22
fnm use 22
\`\`\`

3. **Volta**：一个现代化的 Node.js 版本管理器，项目级别的版本锁定：

\`\`\`bash
curl https://get.volta.sh | bash
volta install node@22
volta pin node@22      # 在项目中锁定版本
\`\`\`

### 第二步：包管理器的选择

2026年的包管理器生态已经非常成熟，三个主流选择各有优劣：

| 特性 | npm | pnpm | Yarn |
| --- | --- | --- | --- |
| **安装速度** | 中等 | 极快 | 快 |
| **磁盘效率** | 低（每个项目独立副本） | 极高（全局存储 + 硬链接） | 中等 |
| **node_modules 结构** | 扁平化（有幽灵依赖风险） | 严格隔离（无幽灵依赖） | 即插即用（PnP） |
| **monorepo 支持** | workspaces | workspaces（最强） | workspaces |
| **学习曲线** | 低 | 中 | 中 |

**推荐使用 pnpm**，原因如下：
1. **无幽灵依赖**：pnpm 的严格依赖隔离确保你只能访问 package.json 中声明的依赖，避免"意外可用"的依赖。
2. **磁盘效率**：全局仓库 + 硬链接，同一依赖在硬盘上只存一份。
3. **速度**：依赖解析和安装速度极快。
4. **monorepo 原生支持**：pnpm workspace 是管理 monorepo 的最佳工具之一。

\`\`\`bash
# 安装 pnpm
npm install -g pnpm

# 初始化项目
pnpm init

# 添加 TypeScript
pnpm add -D typescript
\`\`\`

### 第三步：VS Code 配置

Visual Studio Code 是 TypeScript 开发的"官方 IDE"——TypeScript 和 VS Code 都由微软开发，两者深度集成，开箱即用。

#### 必要的 VS Code 扩展

1. **内置 TypeScript 支持**：VS Code 自带 TypeScript 语言服务，无需额外安装。但建议在项目中使用工作区版本的 TypeScript（而非 VS Code 内置版本），确保团队一致：

\`\`\`json
// .vscode/settings.json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
\`\`\`

2. **推荐扩展**：
   - **Error Lens**：在代码行内直接显示错误和警告信息，无需悬停查看。
   - **Pretty TypeScript Errors**：把冗长的 TS 错误信息格式化为易读的形式。
   - **ESLint**：代码质量和风格检查。
   - **Prettier**：代码自动格式化。

#### VS Code 快捷键（提升 TS 开发效率）

- \`F12\`（或 \`Cmd+Click\`）：跳转到类型定义。
- \`Shift+F12\`：查找所有引用。
- \`F2\`：重命名符号（跨文件安全重命名）。
- \`F8\`：跳转到下一个错误。
- \`Ctrl+Space\`：触发智能提示。
- \`Ctrl+.\`（或 \`Cmd+.\`）：快速修复。

### 第四步：tsconfig.json 深度解析

\`tsconfig.json\` 是 TypeScript 项目的配置文件，它告诉 TypeScript 编译器如何处理你的代码。一个配置不当的 tsconfig.json 可能导致类型检查不严格、构建失败或性能问题。

#### 核心配置项详解

\`\`\`json
{
  "compilerOptions": {
    // === 目标与模块 ===
    "target": "ES2022",           // 编译目标 JS 版本
    "module": "ESNext",           // 模块系统
    "moduleResolution": "bundler", // 模块解析策略（2026年推荐）
    "lib": ["ES2022"],            // 包含的标准库类型

    // === 输出控制 ===
    "outDir": "./dist",           // 输出目录
    "rootDir": "./src",           // 源码根目录
    "declaration": true,          // 生成 .d.ts 类型声明文件
    "declarationMap": true,       // 生成声明文件的 source map
    "sourceMap": true,            // 生成 source map
    "noEmit": true,               // 只检查类型不生成文件（用于 lint 场景）

    // === 严格模式 ===
    "strict": true,               // 开启所有严格检查
    "noUncheckedIndexedAccess": true, // 索引访问包含 undefined
    "noUnusedLocals": true,       // 未使用的局部变量报错
    "noUnusedParameters": true,   // 未使用的参数报错
    "noFallthroughCasesInSwitch": true, // switch 穿透检查

    // === 模块解析 ===
    "esModuleInterop": true,      // 允许 import cjs 模块
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,    // 允许 import JSON 文件
    "isolatedModules": true,      // 确保每个文件都是独立模块

    // === 路径别名 ===
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    // === 其他 ===
    "skipLibCheck": true,         // 跳过 .d.ts 类型检查（加速）
    "forceConsistentCasingInFileNames": true // 文件名大小写一致
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
\`\`\`

#### strict 模式的重要性

\`"strict": true\` 是 TypeScript 最强大的配置之一。它相当于同时开启了以下所有选项：

- \`strictNullChecks\`：null 和 undefined 不能赋给其他类型。
- \`strictFunctionTypes\`：函数参数类型检查更严格。
- \`strictBindCallApply\`：bind/call/apply 的类型检查更严格。
- \`strictPropertyInitialization\`：类属性必须在声明或构造函数中初始化。
- \`noImplicitAny\`：禁止隐式的 any 类型。
- \`noImplicitThis\`：禁止隐式的 this 类型。
- \`alwaysStrict\`：在输出中加入 "use strict"。

**永远不要在生产项目中关闭 strict 模式**。它能在编译期捕获大量潜在 bug，投入产出比极高。

### 第五步：esbuild 与 swc——极速构建工具

传统的 \`tsc\` 编译器虽然功能齐全，但速度较慢——对于大型项目，一次完整的类型检查可能需要几十秒甚至几分钟。现代工具链通常采用"类型检查 + 快速转译"的分离策略：

#### esbuild

esbuild 是用 Go 语言编写的极速打包器，它的 TypeScript 转译速度比 tsc 快 10-100 倍。但注意：esbuild **只做转译，不做类型检查**。它直接把 TS 语法转换为 JS 语法，忽略类型注解。

\`\`\`bash
pnpm add -D esbuild

# 转译单个文件
pnpm exec esbuild src/index.ts --bundle --outfile=dist/bundle.js

# 构建配置：esbuild.config.js
\`\`\`

#### swc

swc 是用 Rust 语言编写的极速编译器，同样支持 TypeScript 转译。它的速度也非常快，常被用于替代 Babel 和 tsc 的转译步骤。

\`\`\`bash
pnpm add -D @swc/core @swc/cli
\`\`\`

#### 2026年的推荐工作流

在实践中，推荐的开发工作流是：

1. **开发时**：使用 esbuild/swc 做快速转译（热更新），同时用 \`tsc --noEmit --watch\` 做后台类型检查。
2. **构建时**：使用 esbuild/swc 做生产构建。
3. **CI/CD 中**：运行 \`tsc --noEmit\` 做严格的类型检查，确保类型安全。

现代框架（Next.js、Vite、Remix）都已经内置了这套"快速转译 + 类型检查"的工作流，开箱即用。

### 第六步：项目结构最佳实践

一个成熟的 TypeScript 项目通常遵循以下目录结构：

\`\`\`
my-project/
├── src/
│   ├── index.ts           # 入口文件
│   ├── components/        # 组件/模块
│   ├── services/          # 业务逻辑
│   ├── types/             # 共享类型定义
│   │   └── index.ts
│   ├── utils/             # 工具函数
│   └── config/            # 配置文件
├── tests/                 # 测试文件
├── dist/                  # 构建输出
├── node_modules/
├── tsconfig.json          # TypeScript 配置
├── package.json
├── .eslintrc.cjs          # ESLint 配置
├── .prettierrc            # Prettier 配置
├── .gitignore
└── README.md
\`\`\`

#### 关键原则

1. **类型定义集中管理**：在 \`src/types/\` 目录下定义共享接口和类型别名。
2. **一个文件做一件事**：遵循单一职责原则，每个文件专注一个模块。
3. **使用 barrel export**：在 \`index.ts\` 中统一导出，简化导入路径。
4. **路径别名**：用 \`@/*\` 替代 \`../../\` 相对路径，提高可读性。
5. **环境变量类型**：为 \`process.env\` 定义类型，确保环境变量访问类型安全。

### 第七步：ESLint + Prettier 代码规范

\`\`\`bash
# 安装 ESLint 和 TS 相关插件
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier

# 初始化 ESLint 配置
pnpm exec eslint --init
\`\`\`

推荐配置：
- 使用 \`@typescript-eslint/strict-type-checked\` 规则集，它包含大量 TypeScript 特定的代码质量规则。
- 集成 Prettier，避免 ESLint 和 Prettier 的规则冲突。
- 在 \`package.json\` 中添加 lint 脚本：\`"lint": "eslint src --ext .ts"\`。

### 本节代码演示

下面代码展示了一个完整的 TypeScript 项目配置骨架，包括类型定义文件、工具函数、以及一个简单的应用入口。你可以从中看到现代化 TS 项目的组织方式。`,
    code: `// ============================================================
// 第二章代码演示：现代化 TypeScript 项目结构
// ============================================================
// 说明：本节模拟一个规范化 TS 项目的代码组织方式，
// 展示类型定义、工具函数、应用逻辑的分离。

// ---- 1. 模拟 types/index.ts —— 共享类型定义 ----
console.log("========== 1. 类型定义层 ==========");

// 应用配置类型
interface AppConfig {
  name: string;
  version: string;
  debug: boolean;
  apiBaseUrl: string;
  features: {
    enableAnalytics: boolean;
    enableCache: boolean;
    maxRetryCount: number;
  };
}

// 通用分页类型
interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// 通用 API 返回类型
interface ApiResult<T> {
  code: number;
  data: T;
  message: string;
  pagination?: {
    total: number;
    current: number;
  };
}

// 用户实体类型
interface UserEntity {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isActive: boolean;
  roles: string[];
  metadata: Record<string, unknown>;
}

// 模拟项目配置
const appConfig: AppConfig = {
  name: "TypeScript Tutorial",
  version: "2.0.0",
  debug: true,
  apiBaseUrl: "https://api.example.com/v2",
  features: {
    enableAnalytics: true,
    enableCache: true,
    maxRetryCount: 3,
  },
};

console.log("应用名称:", appConfig.name);
console.log("版本号:", appConfig.version);
console.log("调试模式:", appConfig.debug);
console.log("API 地址:", appConfig.apiBaseUrl);
console.log("最大重试:", appConfig.features.maxRetryCount);

// ---- 2. 模拟 utils/logger.ts —— 工具函数层 ----
console.log("\\n========== 2. 工具函数层 ==========");

// 日志级别枚举
type LogLevel = "debug" | "info" | "warn" | "error";

// 日志工具类
class Logger {
  private context: string;
  private level: LogLevel;

  constructor(context: string, level: LogLevel = "info") {
    this.context = context;
    this.level = level;
  }

  private formatMessage(level: LogLevel, msg: string): string {
    const timestamp = new Date().toISOString().split("T")[1].slice(0, 8);
    return \`[\${timestamp}] [\${level.toUpperCase()}] [\${this.context}] \${msg}\`;
  }

  debug(msg: string): void {
    if (this.level === "debug") {
      console.log(this.formatMessage("debug", msg));
    }
  }

  info(msg: string): void {
    console.log(this.formatMessage("info", msg));
  }

  warn(msg: string): void {
    console.warn(this.formatMessage("warn", msg));
  }

  error(msg: string): void {
    console.error(this.formatMessage("error", msg));
  }
}

const logger = new Logger("App", "debug");
logger.info("应用初始化完成");
logger.debug("调试信息：配置加载成功");
logger.warn("警告：缓存已过期，将重新加载");

// 通用工具函数
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return \`\${year}-\${month}-\${day}\`;
}

function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

console.log("\\n工具函数测试:");
console.log("  今日日期:", formatDate(new Date()));
console.log("  JSON 解析成功:", safeJsonParse('{"name":"test"}', { name: "default" }));
console.log("  JSON 解析失败:", safeJsonParse("invalid", { name: "default" }));

// ---- 3. 模拟 services/userService.ts —— 业务逻辑层 ----
console.log("\\n========== 3. 业务逻辑层 ==========");

// 用户服务
class UserService {
  private users: UserEntity[] = [
    {
      id: "u-001",
      username: "zhangsan",
      displayName: "张三",
      avatar: "/avatars/zhangsan.png",
      isActive: true,
      roles: ["admin", "editor"],
      metadata: { department: "技术部", level: 5 },
    },
    {
      id: "u-002",
      username: "lisi",
      displayName: "李四",
      avatar: "/avatars/lisi.png",
      isActive: true,
      roles: ["editor"],
      metadata: { department: "产品部", level: 4 },
    },
    {
      id: "u-003",
      username: "wangwu",
      displayName: "王五",
      avatar: "/avatars/wangwu.png",
      isActive: false,
      roles: ["viewer"],
      metadata: { department: "运营部", level: 3 },
    },
  ];

  listUsers(params: PaginationParams): ApiResult<UserEntity[]> {
    const { page, pageSize, sortOrder } = params;
    let result = [...this.users];

    // 排序
    if (sortOrder === "asc") {
      result.sort((a, b) => a.displayName.localeCompare(b.displayName));
    } else if (sortOrder === "desc") {
      result.sort((a, b) => b.displayName.localeCompare(a.displayName));
    }

    // 分页
    const total = result.length;
    const start = (page - 1) * pageSize;
    const paged = result.slice(start, start + pageSize);

    return {
      code: 200,
      data: paged,
      message: "success",
      pagination: { total, current: page },
    };
  }

  getUserById(id: string): ApiResult<UserEntity | null> {
    const user = this.users.find((u) => u.id === id) || null;
    return {
      code: user ? 200 : 404,
      data: user,
      message: user ? "success" : "用户不存在",
    };
  }

  getActiveUsers(): UserEntity[] {
    return this.users.filter((u) => u.isActive);
  }

  getUserCountByRole(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.users.forEach((u) => {
      u.roles.forEach((role) => {
        counts[role] = (counts[role] || 0) + 1;
      });
    });
    return counts;
  }
}

const userService = new UserService();

// 测试分页
const page1 = userService.listUsers({ page: 1, pageSize: 2, sortOrder: "asc" });
console.log("分页查询(第1页, 每页2条):");
page1.data.forEach((u) => console.log("  [" + u.id + "] " + u.displayName));
console.log("  总数:", page1.pagination?.total);

// 测试单个查询
const user = userService.getUserById("u-001");
console.log("\\n查询用户 u-001:", user.data?.displayName);

// 测试活跃用户
const activeUsers = userService.getActiveUsers();
console.log("活跃用户:", activeUsers.map((u) => u.displayName).join(", "));

// 角色统计
const roleCounts = userService.getUserCountByRole();
console.log("角色统计:", JSON.stringify(roleCounts));

// ---- 4. 模拟 index.ts —— 应用入口 ----
console.log("\\n========== 4. 应用入口 ==========");

// 应用启动
async function bootstrap(): Promise<void> {
  logger.info("正在启动 " + appConfig.name + " v" + appConfig.version);

  // 模拟异步初始化
  console.log("  加载配置...");
  await delay(10);

  console.log("  初始化服务...");
  await delay(10);

  const totalUsers = userService.listUsers({ page: 1, pageSize: 100 }).pagination?.total;
  console.log("  加载了 " + totalUsers + " 个用户");

  logger.info("应用启动完成！");
}

// 运行应用入口
bootstrap().then(() => {
  console.log("\\n现代化 TS 项目结构演示完成！");
});`,
  },

  // =========================================================
  // 第三章：原始类型深度解析
  // =========================================================
  {
    id: "ts2-primitive",
    title: "原始类型深度解析",
    icon: "🔢",
    group: "基础入门",
    content: `## 原始类型深度解析

TypeScript 的原始类型（Primitive Types）是构建一切复杂类型的基石。虽然它们看起来简单，但每个都有深刻的设计考量和许多"坑"需要避开。本章将深入剖析每个原始类型，不仅讲"是什么"，更讲"为什么"和"怎么用"。

### 原始类型总览

JavaScript 有7种原始类型（按 ES2020 标准），TypeScript 为每种都提供了对应的类型注解：

| 原始类型 | TypeScript 类型 | 说明 |
| --- | --- | --- |
| string | \`string\` | 文本字符串 |
| number | \`number\` | 双精度浮点数（64位 IEEE 754） |
| boolean | \`boolean\` | 布尔值 true/false |
| bigint | \`bigint\` | 任意精度整数（ES2020） |
| symbol | \`symbol\` | 全局唯一标识符（ES2015） |
| null | \`null\` | 空值（故意设置为空） |
| undefined | \`undefined\` | 未定义（变量未赋值） |

注意：\`object\`、\`function\`、\`array\` 等是**引用类型**，不属于原始类型。原始类型是不可变的（immutable），按值传递而非按引用传递。

### 1. string 类型 —— 不只是"文本"

string 是 TypeScript 中最常用的类型之一。它支持三种字面量形式和模板字符串：

\`\`\`ts
let single: string = '单引号';
let double: string = "双引号";
let backtick: string = \`反引号（模板字符串）\`;
\`\`\`

#### 字符串的不可变性

JavaScript 中的字符串是不可变的——任何字符串操作都会返回新字符串，而非修改原字符串。这意味着：

\`\`\`ts
let s = "hello";
s.toUpperCase();      // 返回 "HELLO"，但 s 本身不变
console.log(s);       // 仍然是 "hello"
s = s.toUpperCase();  // 必须重新赋值
\`\`\`

#### 字符串字面量类型

TypeScript 支持将具体字符串值作为类型（字面量类型），这在约束参数时极为有用：

\`\`\`ts
// 仅接受这三个具体值
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
function request(url: string, method: HttpMethod): void {
  // method 只能是这四个值之一
}
\`\`\`

#### 模板字符串字面量类型（TS 4.1+）

TypeScript 4.1 引入了模板字符串字面量类型，这是类型系统的一大突破——你可以在类型层面进行字符串拼接：

\`\`\`ts
type EventName<T extends string> = \`on\${Capitalize<T>}\`;
type ClickEvent = EventName<"click">;  // "onClick"
type ChangeEvent = EventName<"change">; // "onChange"
\`\`\`

### 2. number 类型 —— 只有一种数字类型

TypeScript 和 JavaScript 一样，所有数字都是64位双精度浮点数（IEEE 754）。这意味着：
- 没有 int、float、double 之分——所有数字都是 number。
- 整数范围：\`Number.MIN_SAFE_INTEGER\`（-2^53+1）到 \`Number.MAX_SAFE_INTEGER\`（2^53-1）。
- 超出安全范围的整数需要使用 \`bigint\`。

#### 浮点数精度问题

这是 JavaScript/TypeScript 中最著名的陷阱之一：

\`\`\`ts
console.log(0.1 + 0.2);           // 0.30000000000000004（不是 0.3！）
console.log(0.1 + 0.2 === 0.3);   // false
\`\`\`

原因：0.1 和 0.2 在二进制浮点表示中是无限循环小数，截断后产生精度误差。解决方案：

1. **金额计算用整数（分）**：\`(10 + 20) / 100 = 0.3\`（用分做单位，最后再转元）。
2. **使用 \`Number.EPSILON\` 判断近似相等**：\`Math.abs(a - b) < Number.EPSILON\`。
3. **使用高精度库**：如 decimal.js、big.js 处理金融计算。

#### 特殊数值

\`\`\`ts
const inf = Infinity;      // 正无穷
const negInf = -Infinity;  // 负无穷
const nan = NaN;           // 非数值（Not a Number）
\`\`\`

\`NaN\` 是数字类型中唯一"不等于自己"的值：\`NaN === NaN\` 返回 \`false\`。要用 \`Number.isNaN()\` 来判断。

### 3. boolean 类型 —— 看似简单，实则微妙

boolean 类型只有 true 和 false 两个值。但要注意：

\`\`\`ts
// 小写 boolean 是原始类型，大写 Boolean 是构造函数对象
let isOk: boolean = true;        // ✅ 正确
let isBad: Boolean = new Boolean(true); // ⚠️ 避免！这是对象，不是原始值
\`\`\`

#### 真值（Truthy）和假值（Falsy）

JavaScript 中，以下值在布尔上下文中被视为 false：
- \`false\`、\`0\`、\`-0\`、\`""\`、\`null\`、\`undefined\`、\`NaN\`

其他所有值都是 true（包括空对象 \`{}\`、空数组 \`[]\`、字符串 \`"false"\`）。

TypeScript 不区分 truthy/falsy 和 boolean 类型——如果你用非 boolean 作为条件，编译器不会报错（除非开启 \`strictBooleanTypeChecks\`）。

### 4. bigint 类型 —— 处理超大整数

bigint 是 ES2020 引入的原始类型，用于表示任意精度的整数：

\`\`\`ts
// 两种创建方式
let big1: bigint = 9007199254740991n;  // 字面量后加 n
let big2: bigint = BigInt(123);         // BigInt 函数
let big3: bigint = BigInt("9007199254740991"); // 从字符串创建
\`\`\`

#### bigint 的限制

1. **不能与 number 混合运算**：\`big1 + 1\` 会报类型错误，必须用 \`big1 + 1n\`。
2. **不能使用 Math 对象**：\`Math.abs(big1)\` 报错，Math 只支持 number。
3. **JSON.stringify 不支持**：\`JSON.stringify({ x: 1n })\` 会抛出 TypeError。
4. **目标环境**：ES2020 及以上才支持，如果目标环境较旧需要 polyfill。

### 5. symbol 类型 —— 全局唯一标识符

symbol 是 ES2015 引入的原始类型，每个 symbol 值都是全局唯一的：

\`\`\`ts
let s1: symbol = Symbol("描述");
let s2: symbol = Symbol("描述");
console.log(s1 === s2); // false——即使描述相同，它们也是不同的
\`\`\`

#### symbol 的主要用途

1. **对象属性键**：避免属性名冲突。
2. **私有属性模拟**：使用 Symbol 作为键的属性不会被 for...in、Object.keys() 枚举。
3. **内置 Symbol（Well-known Symbols）**：如 \`Symbol.iterator\`（定义对象的迭代器）、\`Symbol.toStringTag\`（自定义 \`Object.prototype.toString()\` 的返回值）。

\`\`\`ts
// 唯一的 symbol 类型：unique symbol
const mySymbol: unique symbol = Symbol("唯一");
// unique symbol 是其自身的类型，只能由自己赋值
\`\`\`

\`unique symbol\` 是 TypeScript 特有的概念，表示一个"类型级别的唯一 symbol"。它只能由 \`const\` 声明或 \`Symbol()\` 调用创建，且只能赋给 \`typeof mySymbol\`。

### 6. null 和 undefined —— 亿万美金的问题

null 和 undefined 是 JavaScript 中两个容易混淆的值：
- \`undefined\`：变量已声明但未赋值，或函数没有返回值。
- \`null\`：空值，通常由开发者主动设置，表示"没有值"。

#### strictNullChecks 的影响

**这是 TypeScript 最重要的配置项之一**。当 \`strictNullChecks\` 开启时（强烈推荐）：

\`\`\`ts
let name: string = "张三";
// name = null;    // ❌ 错误：null 不能赋给 string
// name = undefined; // ❌ 错误：undefined 不能赋给 string

let nameOrNull: string | null = "张三"; // 必须显式包含 null
nameOrNull = null;  // ✅ 正确
\`\`\`

当 \`strictNullChecks\` 关闭时（默认情况下 TypeScript 是宽松的，但 \`strict: true\` 会开启它），null 和 undefined 可以赋给任何类型，这会导致大量运行时错误。

#### 防御性编程

处理可能为 null/undefined 的值时，推荐的做法：

\`\`\`ts
// 可选链 ?.  —— 安全访问深层属性
const name = user?.profile?.name;

// 空值合并 ?? —— 提供默认值
const displayName = user?.name ?? "匿名用户";

// 类型守卫 —— 主动检查
if (data !== null && data !== undefined) {
  // data 被收窄为具体类型
  console.log(data.length);
}
\`\`\`

### 7. 类型推断与原始类型

TypeScript 的类型推断在原始类型上表现非常智能：

\`\`\`ts
let x = 5;              // 推断为 number
let y = "hello";        // 推断为 string
let z = true;           // 推断为 boolean
const c = 5;            // 推断为 5（字面量类型，因为 const 不可变）
const s = "hello";      // 推断为 "hello"（字面量类型）
let arr = [1, 2, 3];   // 推断为 number[]
let tup = [1, "hi"];   // 推断为 (number | string)[]
\`\`\`

### 8. 包装对象类型 vs 原始类型

TypeScript 中，原始类型（小写）和其包装对象类型（大写）是不同的：

\`\`\`ts
let p: string = "hello";        // 原始类型
let w: String = new String("x"); // 包装对象类型（不推荐）

// 原始类型可以赋给包装对象类型（反之不行）
let s: string = "hello";
let S: String = s;  // ✅ 原始类型可以赋值给包装对象
// let p: string = S;  // ❌ 包装对象不能直接赋值给原始类型
\`\`\`

**始终使用小写的原始类型**（string、number、boolean、symbol、bigint），不要使用大写版本（String、Number、Boolean、Symbol、BigInt）。

### 本节代码演示

下面代码综合演示所有原始类型的特点、陷阱和最佳实践，建议你逐段运行并观察输出。`,
    code: `// ============================================================
// 第三章代码演示：原始类型深度解析
// ============================================================

// ---- 1. string 类型详解 ----
console.log("========== 1. string 类型详解 ==========");

// 三种声明方式
let s1: string = "单引号字符串";
let s2: string = "双引号字符串";
let s3: string = \`模板字符串：\${s1} 和 \${s2}\`;

console.log("s1:", s1);
console.log("s2:", s2);
console.log("s3:", s3);

// 字符串不可变性演示
let original: string = "hello";
let upper: string = original.toUpperCase();
console.log("原始字符串:", original);
console.log("toUpperCase 后:", upper);
console.log("原始字符串未变:", original === "hello");

// 字符串字面量类型
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
function sendRequest(url: string, method: HttpMethod): string {
  return \`发送 \${method} 请求到 \${url}\`;
}
console.log(sendRequest("/api/users", "GET"));
console.log(sendRequest("/api/users", "POST"));

// 模板字符串字面量类型（编译期特性，运行时展示）
type Prefix<T extends string> = \`prefix_\${T}\`;
// 这里没法在运行时展示模板字面量类型，但可以展示拼接效果
function makePrefix<T extends string>(key: T): string {
  return \`prefix_\${key}\`;
}
console.log("模板前缀:", makePrefix("user"));

// 常用字符串方法
let text: string = "  TypeScript is Awesome!  ";
console.log("trim:", text.trim());
console.log("toLowerCase:", text.toLowerCase());
console.log("includes 'Script':", text.includes("Script"));
console.log("startsWith '  Type':", text.startsWith("  Type"));
console.log("slice(2, 12):", text.slice(2, 12));
console.log("split:", text.trim().split(" "));

// ---- 2. number 类型详解 ----
console.log("\\n========== 2. number 类型详解 ==========");

// 各种进制
let dec: number = 42;          // 十进制
let hex: number = 0x2a;        // 十六进制
let bin: number = 0b101010;    // 二进制
let oct: number = 0o52;        // 八进制
console.log("十进制 42:", dec);
console.log("十六进制 0x2a:", hex);
console.log("二进制 0b101010:", bin);
console.log("八进制 0o52:", oct);
console.log("全部相等:", dec === hex && hex === bin && bin === oct);

// 浮点精度问题
console.log("\\n浮点精度陷阱:");
console.log("0.1 + 0.2 =", 0.1 + 0.2);
console.log("0.1 + 0.2 === 0.3:", 0.1 + 0.2 === 0.3);

// 解决方案1：使用 Number.EPSILON
function isApproximatelyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < Number.EPSILON;
}
console.log("EPSILON 判断:", isApproximatelyEqual(0.1 + 0.2, 0.3));

// 解决方案2：金额用整数（分）
function addMoney(yuan1: number, yuan2: number): number {
  const fen1 = Math.round(yuan1 * 100);
  const fen2 = Math.round(yuan2 * 100);
  return (fen1 + fen2) / 100;
}
console.log("分单位计算 0.1 + 0.2:", addMoney(0.1, 0.2));

// 特殊数值
console.log("\\n特殊数值:");
console.log("Number.MAX_SAFE_INTEGER:", Number.MAX_SAFE_INTEGER);
console.log("Number.MIN_SAFE_INTEGER:", Number.MIN_SAFE_INTEGER);
console.log("Number.MAX_VALUE:", Number.MAX_VALUE);
console.log("Infinity:", Infinity);
console.log("-Infinity:", -Infinity);

// NaN 的特性
let nan: number = NaN;
console.log("NaN === NaN:", nan === nan, "（NaN 不等于自己！）");
console.log("Number.isNaN(NaN):", Number.isNaN(NaN));
console.log("isNaN vs Number.isNaN:", isNaN(NaN), Number.isNaN(NaN));

// 安全整数检查
let bigNum: number = 9007199254740992;
console.log("安全整数? 9007199254740992:", Number.isSafeInteger(bigNum));

// ---- 3. boolean 类型详解 ----
console.log("\\n========== 3. boolean 类型详解 ==========");

let flag: boolean = true;
let negated: boolean = !flag;

console.log("flag:", flag);
console.log("!flag:", negated);

// 真值和假值演示
console.log("\\n假值（Falsy）检查:");
const falsyValues = [false, 0, -0, "", null, undefined, NaN, 0n];
falsyValues.forEach((v) => {
  // BigInt 无法被 JSON.stringify 序列化（会抛 TypeError），这里转成 "0n" 形式
  const vStr = typeof v === "bigint" ? v.toString() + "n" : JSON.stringify(v);
  console.log("  Boolean(" + vStr + ") =", Boolean(v));
});

console.log("\\n真值（Truthy）示例:");
const truthyValues = [true, 1, "hello", {}, [], "false", -1];
truthyValues.forEach((v) => {
  console.log("  Boolean(" + JSON.stringify(v) + ") =", Boolean(v));
});

// 短路求值
let username: string | null = null;
let displayName: string = username || "匿名用户";
console.log("\\n短路求值(||):", displayName);
username = "张三";
displayName = username || "匿名用户";
console.log("短路求值(有值):", displayName);

// ---- 4. bigint 类型详解 ----
console.log("\\n========== 4. bigint 类型详解 ==========");

let bigA: bigint = 9007199254740991n;      // 字面量
let bigB: bigint = BigInt(100);             // BigInt 函数
let bigC: bigint = BigInt("9007199254740991"); // 从字符串

console.log("bigA:", bigA);
console.log("bigB:", bigB);
console.log("bigC:", bigC);

// bigint 运算
console.log("bigA + bigB:", bigA + bigB);
console.log("bigA * 2n:", bigA * 2n);
console.log("bigA / 3n:", bigA / 3n, "（整数除法，截断小数）");
console.log("bigA % 100n:", bigA % 100n);

// 比较
console.log("bigA > bigB:", bigA > bigB);
console.log("bigA === 9007199254740991n:", bigA === 9007199254740991n);

// bigint 与 number 的区别
let num: number = 9007199254740991;
console.log("number 最大值:", num);
console.log("number 最大值 + 1:", num + 1, "（精度丢失！）");
console.log("bigint 最大值 + 1n:", bigA + 1n, "（精确！）");

// ---- 5. symbol 类型详解 ----
console.log("\\n========== 5. symbol 类型详解 ==========");

let symA: symbol = Symbol("标识A");
let symB: symbol = Symbol("标识A");  // 相同描述，不同 symbol
let symC: symbol = Symbol();         // 无描述

console.log("symA:", symA.toString());
console.log("symB:", symB.toString());
console.log("symC:", symC.toString());
console.log("symA === symB:", symA === symB, "（相同描述，符号不同）");

// Symbol 作为对象属性键
const ID = Symbol("id");
const user: Record<symbol, string> = {
  [ID]: "user_12345",
};
console.log("通过 Symbol 访问:", user[ID]);

// 内置 Well-known Symbols
let arr = [1, 2, 3];
console.log("Symbol.iterator:", arr[Symbol.iterator]);
console.log("Symbol.toStringTag:", ({}).toString());
// Symbol.species 演示
class MyArray extends Array {
  static get [Symbol.species]() {
    return Array;
  }
}

// unique symbol 的用法
const UNIQUE_KEY: unique symbol = Symbol("唯一键");
console.log("unique symbol:", UNIQUE_KEY.toString());

// ---- 6. null 与 undefined 详解 ----
console.log("\\n========== 6. null 与 undefined 详解 ==========");

let undef: undefined = undefined;
let nul: null = null;

console.log("undefined:", undef, "typeof:", typeof undef);
console.log("null:", nul, "typeof:", typeof nul, "（历史遗留 bug）");
console.log("null == undefined:", nul == undef, "（松懈相等为 true）");
console.log("null === undefined:", nul === undef, "（严格相等为 false）");

// 可选链 ?. 和空值合并 ??
interface Address {
  city?: string;
  street?: string;
}
interface Person {
  name: string;
  address?: Address;
}

function getCity(person: Person | null): string {
  // 可选链：安全访问深层属性
  return person?.address?.city ?? "未知城市";
}

const p1: Person = { name: "张三", address: { city: "北京", street: "长安街" } };
const p2: Person = { name: "李四", address: { city: "上海" } };
const p3: Person = { name: "王五" };

console.log("\\n可选链和空值合并:");
console.log("p1 城市:", getCity(p1));
console.log("p2 城市:", getCity(p2));
console.log("p3 城市:", getCity(p3));
console.log("null 城市:", getCity(null));

// ---- 7. 类型推断与原始类型 ----
console.log("\\n========== 7. 类型推断 ==========");

let inferredNum = 42;             // 推断为 number
let inferredStr = "hello";       // 推断为 string
let inferredBool = true;         // 推断为 boolean
let inferredArr = [1, 2, 3];     // 推断为 number[]

// const 推断为字面量类型
const constNum = 42;             // 推断为 42
const constStr = "hello";        // 推断为 "hello"

console.log("let 推断:", typeof inferredNum, typeof inferredStr, typeof inferredBool);
console.log("const 值:", constNum, constStr);

// 联合类型推断
let mixed = [1, "hello", true];  // 推断为 (string | number | boolean)[]
console.log("混合数组:", mixed);

// ---- 8. 包装对象 vs 原始类型 ----
console.log("\\n========== 8. 包装对象 vs 原始类型 ==========");

let primitive: string = "原始类型";
let wrapper: String = new String("包装对象");

console.log("typeof primitive:", typeof primitive);
console.log("typeof wrapper:", typeof wrapper);
console.log("primitive === wrapper:", primitive === wrapper.toString());

// 原始类型可以调用方法——JavaScript 自动装箱
console.log("原始类型调用方法:", primitive.toUpperCase());
console.log("原始类型访问 length:", primitive.length);

console.log("\\n原始类型深度解析完成！");`,
  },

  // =========================================================
  // 第四章：数组与元组进阶
  // =========================================================
  {
    id: "ts2-array-tuple",
    title: "数组与元组进阶",
    icon: "📊",
    group: "基础入门",
    content: `## 数组与元组进阶

数组和元组是 TypeScript 中处理集合数据最常用的类型。虽然它们看起来相似，但有着本质的不同：数组是所有元素同类型的动态集合，而元组是固定长度、每个位置有特定类型的"结构化集合"。掌握它们的高级用法，能让你在处理复杂数据结构时游刃有余。

### 数组类型：两种声明方式

TypeScript 提供了两种数组声明语法：

\`\`\`ts
// 方式一：T[] 语法（推荐，更简洁）
let list1: number[] = [1, 2, 3];
let list2: string[] = ["a", "b", "c"];

// 方式二：Array<T> 泛型语法
let list3: Array<number> = [1, 2, 3];
let list4: Array<string> = ["a", "b", "c"];
\`\`\`

两种方式完全等价，选择哪种取决于团队约定。但有一个例外：当使用 \`readonly\` 时，只能用 \`T[]\` 语法：

\`\`\`ts
let arr1: readonly number[] = [1, 2, 3];     // ✅
let arr2: ReadonlyArray<number> = [1, 2, 3];  // ✅
// let arr3: readonly Array<number> = [1, 2, 3]; // ❌ 语法错误
\`\`\`

### 只读数组（Readonly Arrays）

只读数组确保数组内容在创建后不会被修改。这是 TypeScript 为函数式编程和不可变数据提供的重要保障：

\`\`\`ts
const data: readonly number[] = [1, 2, 3];
// data.push(4);     // ❌ push 不存在
// data[0] = 99;     // ❌ 索引赋值不允许
// data.pop();       // ❌ pop 不存在
// data.sort();      // ❌ sort 会修改原数组，不允许
\`\`\`

只读数组只能使用不修改数组的方法：\`map\`、\`filter\`、\`reduce\`、\`concat\`、\`slice\`、\`find\`、\`includes\`、\`forEach\` 等。

#### 为什么要用只读数组？

1. **防止意外修改**：当你把数组传给其他函数时，可以确保它不会被意外修改。
2. **函数式编程**：不可变数据是函数式编程的基石。
3. **更好的类型推断**：\`readonly\` 数组能推断出更精确的类型。

\`\`\`ts
// 普通数组：类型是 number[]
const x = [1, 2, 3];  // 可修改

// 使用 as const：类型是 readonly [1, 2, 3]
const y = [1, 2, 3] as const;  // 完全不可变，且是元组类型
\`\`\`

### 数组的方法与类型推断

TypeScript 对数组方法的类型推断非常智能：

\`\`\`ts
const nums = [1, 2, 3, 4, 5];

// map: 根据回调推断返回类型
const doubled = nums.map((n) => n * 2);         // number[]
const strings = nums.map((n) => \`#\${n}\`);       // string[]

// filter: 不能收窄元素类型（这是 TS 的已知限制）
const evens = nums.filter((n) => n % 2 === 0);   // 仍是 number[]，不是字面量的联合

// 类型守卫 filter：手动收窄
const filtered: number[] = nums.filter((n): n is number => n > 2);
// 注意：上面的类型守卫实际上对 number 没用，但对于联合类型很有用
\`\`\`

#### 数组解构与类型

\`\`\`ts
const [first, second, ...rest] = [1, 2, 3, 4, 5];
// first: number, second: number, rest: number[]
\`\`\`

### 多维数组

\`\`\`ts
// 二维数组
let matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
];

// 三维数组
let cube: number[][][] = [
  [[1, 2], [3, 4]],
  [[5, 6], [7, 8]],
];
\`\`\`

### 元组（Tuple）基础

元组是 TypeScript 中最被低估的类型之一。它允许你定义一个**固定长度、每个位置有特定类型**的数组：

\`\`\`ts
// 基本元组：一个 string 后跟一个 number
let pair: [string, number] = ["张三", 28];

// 三元组
let triple: [string, number, boolean] = ["李四", 30, true];
\`\`\`

#### 元组 vs 数组

| 特性 | 数组 | 元组 |
| --- | --- | --- |
| 长度 | 动态可变 | 固定（编译期检查） |
| 元素类型 | 所有元素同类型 | 每个位置可不同 |
| 访问越界 | 运行时可能出错 | 编译期报错 |
| 典型场景 | 同类型集合（用户列表、数字序列） | 结构化数据（坐标、键值对、状态行） |

### 命名元组（Labeled Tuples）

TypeScript 4.0 引入了命名元组，允许你为每个位置指定标签——这使得元组的语义更加清晰，IDE 的智能提示也更加友好：

\`\`\`ts
// 普通元组：只能通过索引访问，没有语义
let point1: [number, number] = [100, 200];

// 命名元组：每个位置有标签，IDE 提示更友好
let point2: [x: number, y: number] = [100, 200];

// 复杂命名元组
let user: [id: number, name: string, isActive: boolean] = [1, "张三", true];
\`\`\`

命名元组不改变运行时行为，但极大地提升了代码可读性和开发体验。在 IDE 中悬停时，你会看到标签名而非匿名类型。

### 可变元组（Variadic Tuples）

TypeScript 4.0 还引入了可变元组类型，允许在元组中使用展开运算符（...）：

\`\`\`ts
// 任意数量的 string 后面跟一个 number
type StringsThenNumber = [...string[], number];
let data: StringsThenNumber = ["a", "b", "c", 42];

// 前面固定 + 中间可变 + 后面固定
type Mixed = [string, ...number[], boolean];
let m1: Mixed = ["hello", true];
let m2: Mixed = ["hello", 1, 2, 3, true];
\`\`\`

#### 元组拼接

\`\`\`ts
// 将两个元组拼接成一个新元组类型
type Concat<T extends unknown[], U extends unknown[]> = [...T, ...U];
type Result = Concat<[string, number], [boolean]>;  // [string, number, boolean]
\`\`\`

### 带剩余元素的元组（Tuple with Rest Elements）

\`\`\`ts
// 至少一个 string，后面可以跟任意数量的 number
type AtLeastOneString = [string, ...number[]];
let a: AtLeastOneString = ["hello"];
let b: AtLeastOneString = ["hello", 1, 2, 3];

// 可选元素在剩余元素之前
type OptionalThenRest = [string, number?, ...boolean[]];
let c: OptionalThenRest = ["hello"];
let d: OptionalThenRest = ["hello", 42];
let e: OptionalThenRest = ["hello", 42, true, false];
\`\`\`

### 元组的高级用法

#### 函数参数类型推断

元组与函数参数有着天然的对应关系：

\`\`\`ts
// 从元组推断函数参数类型
type Args = [string, number, boolean];
function myFunc(...args: Args): void {
  const [a, b, c] = args;
  // a: string, b: number, c: boolean
}
\`\`\`

#### 使用 as const 创建只读元组

\`\`\`ts
const colors = ["red", "green", "blue"] as const;
// 类型：readonly ["red", "green", "blue"]
// 既是元组，又是只读，还是字面量类型！
\`\`\`

#### 元组与数组的相互转换

\`\`\`ts
// 数组 → 元组（需要断言，因为数组长度不确定）
let arr = [1, "hello"];
let tup = arr as [number, string];  // 不安全的断言

// 元组 → 数组（自动，因为元组是数组的子类型）
let tup2: [number, string] = [1, "hello"];
let arr2: (number | string)[] = tup2;  // ✅ 自动
\`\`\`

### 常见陷阱

1. **元组的 push 问题**：元组虽然声明了固定长度，但 push 方法仍然存在（运行时数组的方法），在 TypeScript 的某些版本中可能允许 push 额外的元素。这是历史遗留问题，使用只读元组可以避免。

2. **数组长度的不确定性**：\`T[]\` 类型对长度没有任何约束，无法表达"恰好3个元素的数组"这种需求——这是元组的领域。

3. **解构的类型推断**：从数组解构出的变量类型是正确的，但需要注意空数组或越界访问。

### 本节代码演示

下面代码演示了数组的各种操作、只读数组、元组的基本和高级用法，以及命名元组和可变元组的效果。`,
    code: `// ============================================================
// 第四章代码演示：数组与元组进阶
// ============================================================

// ---- 1. 数组声明与基本操作 ----
console.log("========== 1. 数组声明与基本操作 ==========");

// 两种声明方式
let nums1: number[] = [10, 20, 30, 40, 50];
let nums2: Array<number> = [60, 70, 80];

console.log("T[] 语法:", nums1);
console.log("Array<T> 语法:", nums2);

// 数组常用方法
console.log("\\n数组方法:");
console.log("  map:", nums1.map((n) => n * 2));
console.log("  filter:", nums1.filter((n) => n > 25));
console.log("  reduce:", nums1.reduce((sum, n) => sum + n, 0));
console.log("  find:", nums1.find((n) => n > 25));
console.log("  includes:", nums1.includes(30));
console.log("  slice:", nums1.slice(1, 3));
console.log("  concat:", nums1.concat(nums2));
console.log("  join:", nums1.join(" - "));

// 展开运算符
let combined = [0, ...nums1, 100];
console.log("\\n展开合并:", combined);

// 解构
let [first, second, ...rest] = nums1;
console.log("解构 first:", first, "second:", second, "rest:", rest);

// ---- 2. 只读数组 ----
console.log("\\n========== 2. 只读数组 ==========");

// 只读数组
const readonlyNums: readonly number[] = [1, 2, 3, 4, 5];
const readonlyNums2: ReadonlyArray<number> = [6, 7, 8];

console.log("readonly number[]:", readonlyNums);
console.log("ReadonlyArray<number>:", readonlyNums2);

// 只读数组可以使用不修改原数组的方法
console.log("  map:", readonlyNums.map((n) => n * 10));
console.log("  filter:", readonlyNums.filter((n) => n % 2 === 0));
console.log("  slice:", readonlyNums.slice(0, 3));
console.log("  includes:", readonlyNums.includes(3));
console.log("  find:", readonlyNums.find((n) => n > 3));

// as const 创建只读元组
const statusCodes = [200, 404, 500] as const;
// 类型：readonly [200, 404, 500]
console.log("\\nas const 元组:", statusCodes);
console.log("  类型: readonly [200, 404, 500]");

// 对比：不用 as const 是普通数组
const normalCodes = [200, 404, 500];
// 类型：number[]
console.log("普通数组:", normalCodes);
console.log("  类型: number[]");

// ---- 3. 多维数组 ----
console.log("\\n========== 3. 多维数组 ==========");

// 二维数组
let matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

console.log("二维矩阵:");
matrix.forEach((row, i) => {
  console.log("  第" + (i + 1) + "行:", row);
});

// 访问元素
console.log("matrix[1][2] =", matrix[1][2]); // 6

// 矩阵转置
function transpose(m: number[][]): number[][] {
  const rows = m.length;
  const cols = m[0].length;
  const result: number[][] = [];
  for (let j = 0; j < cols; j++) {
    result[j] = [];
    for (let i = 0; i < rows; i++) {
      result[j][i] = m[i][j];
    }
  }
  return result;
}

console.log("\\n转置后:");
transpose(matrix).forEach((row, i) => {
  console.log("  第" + (i + 1) + "行:", row);
});

// ---- 4. 元组基础 ----
console.log("\\n========== 4. 元组基础 ==========");

// 基本元组
let pair: [string, number] = ["张三", 28];
let triple: [string, number, boolean] = ["李四", 30, true];

console.log("二元组:", pair);
console.log("  姓名:", pair[0], "年龄:", pair[1]);
console.log("三元组:", triple);

// 元组解构
let [name, age, active] = triple;
console.log("解构:", name, age, active);

// 元组数组：一个由元组组成的数组
let userList: [string, number][] = [
  ["张三", 28],
  ["李四", 30],
  ["王五", 25],
];

console.log("\\n元组数组:");
userList.forEach(([name, age]) => {
  console.log("  " + name + "(" + age + "岁)");
});

// ---- 5. 命名元组（Labeled Tuples）----
console.log("\\n========== 5. 命名元组 ==========");

// 命名元组：每个位置有标签
let point: [x: number, y: number] = [100, 200];
let userInfo: [id: number, name: string, email: string] = [
  1, "张三", "zhang@example.com",
];

console.log("point:", point, "x=" + point[0], "y=" + point[1]);
console.log("userInfo:", userInfo);

// 命名元组数组
let products: [id: number, name: string, price: number, stock: number][] = [
  [1, "笔记本电脑", 5999, 100],
  [2, "机械键盘", 899, 500],
  [3, "显示器", 2499, 200],
];

console.log("\\n产品列表:");
products.forEach(([id, name, price, stock]) => {
  console.log(
    \`  #\${id} \${name} — ¥\${price}（库存: \${stock}）\`
  );
});

// ---- 6. 可变元组（Variadic Tuples）----
console.log("\\n========== 6. 可变元组 ==========");

// 任意数量的 string 后面跟一个 number
type StringsThenNumber = [...string[], number];
let v1: StringsThenNumber = ["a", 42];
let v2: StringsThenNumber = ["a", "b", "c", "d", 42];

console.log("v1:", v1);
console.log("v2:", v2);

// 前面固定 + 中间可变 + 后面固定
type FixedMixed = [string, ...number[], boolean];
let fm1: FixedMixed = ["hello", true];
let fm2: FixedMixed = ["hello", 1, 2, 3, true];

console.log("fm1:", fm1);
console.log("fm2:", fm2);

// 元组拼接函数
function concat<T extends unknown[], U extends unknown[]>(
  a: [...T],
  b: [...U]
): [...T, ...U] {
  return [...a, ...b] as [...T, ...U];
}

let c1 = concat([1, 2], ["a", "b"]);
let c2 = concat(["hello", 42], [true, false]);
console.log("concat([1,2], ['a','b']):", c1);
console.log("concat(['hello',42], [true,false]):", c2);

// ---- 7. 带剩余元素的元组 ----
console.log("\\n========== 7. 带剩余元素的元组 ==========");

// 至少一个 string
type AtLeastOneString = [string, ...number[]];
let r1: AtLeastOneString = ["hello"];
let r2: AtLeastOneString = ["hello", 1, 2, 3];

console.log("r1:", r1);
console.log("r2:", r2);

// 可选元素 + 剩余元素
type OptionalThenRest = [string, number?, ...boolean[]];
let o1: OptionalThenRest = ["hello"];
let o2: OptionalThenRest = ["hello", 42];
let o3: OptionalThenRest = ["hello", 42, true, false, true];

console.log("o1:", o1);
console.log("o2:", o2);
console.log("o3:", o3);

// ---- 8. 元组实战：模拟 CSV 解析 ----
console.log("\\n========== 8. 元组实战：CSV 解析 ==========");

// CSV 行：name, age, city
type CsvRow = [string, number, string];

function parseCsv(data: string): CsvRow[] {
  const lines = data.trim().split("\\n");
  return lines.map((line) => {
    const [name, ageStr, city] = line.split(",").map((s) => s.trim());
    return [name, parseInt(ageStr, 10), city] as CsvRow;
  });
}

function printCsv(data: CsvRow[]): void {
  data.forEach(([name, age, city], i) => {
    console.log(\`  第\${i + 1}行: \${name}, \${age}岁, 来自\${city}\`);
  });
}

const csvData = \`张三,28,北京
李四,30,上海
王五,25,深圳\`;

const parsed = parseCsv(csvData);
printCsv(parsed);

// 统计
const totalAge = parsed.reduce((sum, [, age]) => sum + age, 0);
console.log("  平均年龄:", (totalAge / parsed.length).toFixed(1));

console.log("\\n数组与元组进阶演示完成！");`,
  },

  // =========================================================
  // 第五章：对象类型全解
  // =========================================================
  {
    id: "ts2-object-types",
    title: "对象类型全解",
    icon: "🏗️",
    group: "基础入门",
    content: `## 对象类型全解

对象是 JavaScript 中最核心的数据结构，TypeScript 为它提供了丰富而强大的类型描述能力。从简单的对象字面量类型到复杂的索引签名、交叉类型、结构化类型系统，本章将全面覆盖 TypeScript 中对象类型的所有重要概念。

### 对象类型语法

TypeScript 有三种方式描述对象类型：

\`\`\`ts
// 1. 匿名对象类型（直接在变量后写）
let user: { name: string; age: number } = { name: "张三", age: 28 };

// 2. interface（推荐用于对象形状）
interface User {
  name: string;
  age: number;
}

// 3. type 别名
type UserType = {
  name: string;
  age: number;
};
\`\`\`

三种方式的核心差异在于：interface 支持声明合并和 extends，type 支持联合/交叉/条件类型，匿名类型适合一次性使用。

### 可选属性（Optional Properties）

在属性名后加 \`?\` 表示该属性可选，对象可以不包含它：

\`\`\`ts
interface Config {
  host: string;
  port: number;
  timeout?: number;  // 可选
  retry?: boolean;    // 可选
}

const c1: Config = { host: "localhost", port: 3000 };           // ✅
const c2: Config = { host: "localhost", port: 3000, timeout: 5000 }; // ✅
\`\`\`

#### 可选属性的实际类型

可选属性在类型层面等价于 \`类型 | undefined\`。也就是说，\`timeout?: number\` 等价于 \`timeout: number | undefined\`。但有一个细微差别：

\`\`\`ts
interface A { x?: number; }       // x 可选
interface B { x: number | undefined; }  // x 必须存在，但值可以是 undefined

const a: A = {};   // ✅ x 可选，可以不写
const b: B = {};   // ❌ 缺少属性 x（虽然值可以是 undefined，但属性必须存在！）
const b2: B = { x: undefined };  // ✅ 必须显式提供 x
\`\`\`

### 只读属性（Readonly Properties）

\`readonly\` 修饰符让属性在对象创建后不能被修改：

\`\`\`ts
interface Point {
  readonly x: number;
  readonly y: number;
}

const p: Point = { x: 10, y: 20 };
// p.x = 5;  // ❌ 编译期错误：只读属性不能修改
\`\`\`

**重要**：\`readonly\` 只是编译期检查，运行时无法阻止修改。如果你把对象传给不接受 \`readonly\` 的函数，该函数可以修改属性：

\`\`\`ts
function mutate(point: { x: number; y: number }) {
  point.x = 999;  // 运行时有效！
}
mutate(p);  // ✅ 类型兼容（readonly 可以赋给非 readonly）
console.log(p.x);  // 999 —— 运行时被修改了
\`\`\`

这体现了 TypeScript 的结构化类型系统：\`readonly { x: number }\` 是 \`{ x: number }\` 的子类型，因为前者比后者更"严格"（你只能做更少的事）。

#### Readonly 工具类型

TypeScript 内置了 \`Readonly<T>\` 工具类型，可以将所有属性变为只读：

\`\`\`ts
interface User {
  name: string;
  age: number;
}
type ReadonlyUser = Readonly<User>;
// { readonly name: string; readonly age: number; }
\`\`\`

### 索引签名（Index Signatures）

当你不知道对象会有哪些属性名，但知道属性值的类型时，用索引签名：

\`\`\`ts
// 任意字符串键，值为 string
interface StringMap {
  [key: string]: string;
}

// 任意数字键，值为 string
interface NumberMap {
  [index: number]: string;
}
\`\`\`

#### 索引签名的类型约束

索引签名的值类型必须是所有声明属性的值类型的超类型：

\`\`\`ts
interface Example {
  name: string;             // name 是 string
  // [key: string]: number; // ❌ 错误！name 是 string 但索引签名要求 number
  [key: string]: string | number; // ✅ 索引签名的值类型包含了 name 的 string 类型
}
\`\`\`

#### 同时使用字符串和数字索引签名

\`\`\`ts
interface Dictionary {
  [key: string]: string;    // 字符串索引
  [index: number]: string;  // 数字索引——值的类型必须是字符串索引的子类型
}
\`\`\`

数字索引的值类型必须是字符串索引值类型的子类型，因为 JavaScript 在访问 \`obj[0]\` 时会自动转换为 \`obj["0"]\`。

### 交叉类型（Intersection Types）

交叉类型用 \`&\` 将多个类型合并为一个，新类型拥有所有类型的所有属性：

\`\`\`ts
type Person = { name: string; age: number };
type Employee = { employeeId: number; department: string };
type EmployeePerson = Person & Employee;

const emp: EmployeePerson = {
  name: "张三",
  age: 30,
  employeeId: 1001,
  department: "技术部",
};
\`\`\`

#### 交叉类型的冲突处理

如果交叉的两个类型有同名但类型不兼容的属性，结果类型中该属性为 \`never\`：

\`\`\`ts
type A = { x: string };
type B = { x: number };
type C = A & B;
// C 的 x 类型是 string & number，即 never
// 你无法创建 C 类型的值，因为没有值同时是 string 和 number
\`\`\`

#### 交叉类型的实际应用

交叉类型常用于"混入（Mixin）"模式，给对象附加能力：

\`\`\`ts
type WithTimestamp = { createdAt: Date; updatedAt: Date };
type WithId = { id: string };

// 给任意类型附加时间戳和ID
type Entity<T> = T & WithId & WithTimestamp;
\`\`\`

### 多余属性检查（Excess Property Checking）

这是 TypeScript 中一个容易让人困惑的特性。当你直接将对象字面量赋值给一个有类型的变量时，TypeScript 会检查是否有多余属性：

\`\`\`ts
interface Point {
  x: number;
  y: number;
}

const p: Point = { x: 10, y: 20, z: 30 }; // ❌ 错误！z 是多余属性
// 但通过中间变量，可以绕过检查：
const temp = { x: 10, y: 20, z: 30 };
const p2: Point = temp;  // ✅ 通过！因为结构化类型
\`\`\`

#### 为什么存在多余属性检查？

这个检查是 TypeScript 有意为之的"实用主义"特性。它防止了一个常见的错误：你本想创建一个 \`Point\` 对象，但不小心多写了一个属性。如果 TypeScript 不检查，这个属性会被静默忽略，可能导致 bug。

但结构化类型系统理论上允许"更大的结构赋给更小的结构"（鸭子类型），所以通过中间变量赋值时不会报错。这是 TypeScript 在"实用安全性"和"理论一致性"之间的权衡。

### 结构化类型系统（Structural Typing）

这是 TypeScript 最核心的类型兼容性规则。与 Java/C# 的**名义类型（Nominal Typing）**不同，TypeScript 使用**结构化类型**：只要两个类型的结构（形状）匹配，就认为它们兼容，不管名字是否相同。

\`\`\`ts
interface Point2D { x: number; y: number; }
interface Coordinate { x: number; y: number; }

const p: Point2D = { x: 1, y: 2 };
const c: Coordinate = p;  // ✅ 在 TS 中合法！结构相同即可赋值
// 在 Java/C# 中这会报错，因为类型名不同
\`\`\`

#### 结构化类型的优势

1. **与 JavaScript 的鸭子类型一致**："如果它走起路来像鸭子，叫起来像鸭子，那它就是鸭子"。
2. **不依赖类型声明的位置**：两个独立的库定义了相同结构的接口，它们天然兼容。
3. **测试更简单**：mock 对象只需要满足结构，不需要实现特定接口。

#### 结构化类型的陷阱

有时你可能希望"类型品牌"来区分结构相同但语义不同的类型：

\`\`\`ts
type UserId = string;   // 语义上是用户ID
type PostId = string;   // 语义上是帖子ID

// 两者都是 string，可以互相赋值——可能导致 bug
let userId: UserId = "user-123";
let postId: PostId = userId;  // ✅ 类型安全，但语义错误
\`\`\`

解决方案是用**品牌类型（Branded Types）**：

\`\`\`ts
type Brand<T, B> = T & { __brand: B };
type UserId = Brand<string, "UserId">;
type PostId = Brand<string, "PostId">;
\`\`\`

### 对象类型的常用技巧

#### 1. 使用 Pick 和 Omit 操作对象类型

\`\`\`ts
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// 只取部分属性
type PublicUser = Pick<User, "id" | "name" | "email">;

// 排除某些属性
type UserWithoutPassword = Omit<User, "password">;
\`\`\`

#### 2. 使用 Partial 和 Required

\`\`\`ts
// 所有属性变为可选
type PartialUser = Partial<User>;

// 所有属性变为必需（去除可选标记）
type RequiredUser = Required<Partial<User>>;
\`\`\`

#### 3. 使用 Record 创建映射类型

\`\`\`ts
// 键为 string，值为 number
type ScoreMap = Record<string, number>;

// 键为固定字符串，值为 User
type UserMap = Record<"admin" | "editor" | "viewer", User>;
\`\`\`

### 本节代码演示

下面代码综合演示了对象类型的所有核心概念：可选属性、只读属性、索引签名、交叉类型、多余属性检查、结构化类型、以及各种工具类型的使用。`,
    code: `// ============================================================
// 第五章代码演示：对象类型全解
// ============================================================

// ---- 1. 对象类型基本语法 ----
console.log("========== 1. 对象类型基本语法 ==========");

// 匿名对象类型
let user1: { name: string; age: number } = { name: "张三", age: 28 };

// interface
interface User {
  name: string;
  age: number;
  email: string;
}

// type 别名
type UserAlias = {
  name: string;
  age: number;
  email: string;
};

let user2: User = { name: "李四", age: 30, email: "lisi@example.com" };
let user3: UserAlias = { name: "王五", age: 25, email: "wangwu@example.com" };

console.log("匿名类型:", JSON.stringify(user1));
console.log("interface:", JSON.stringify(user2));
console.log("type别名:", JSON.stringify(user3));

// ---- 2. 可选属性 ----
console.log("\\n========== 2. 可选属性 ==========");

interface Config {
  host: string;
  port: number;
  timeout?: number;    // 可选
  retry?: boolean;     // 可选
  debug?: boolean;     // 可选
}

const c1: Config = { host: "localhost", port: 3000 };
const c2: Config = { host: "localhost", port: 3000, timeout: 5000, retry: true };
const c3: Config = { host: "localhost", port: 8080, debug: true };

console.log("最小配置:", JSON.stringify(c1));
console.log("完整配置:", JSON.stringify(c2));
console.log("debug配置:", JSON.stringify(c3));

// 可选属性的实际类型是 T | undefined
function getTimeout(cfg: Config): number {
  return cfg.timeout ?? 3000;  // 空值合并提供默认值
}
console.log("c1 timeout:", getTimeout(c1));
console.log("c2 timeout:", getTimeout(c2));

// 可选属性 vs 必需属性 + undefined
interface A {
  x?: number;                // 可选：可以不写
}
interface B {
  x: number | undefined;     // 必需：必须写（可以是 undefined）
}

const a: A = {};                  // ✅ 可以不写 x
const b: B = { x: undefined };    // ✅ 必须写 x
// const b2: B = {};              // ❌ 缺少 x
console.log("可选属性可省略:", JSON.stringify(a));
console.log("必须属性需要显式:", JSON.stringify(b));

// ---- 3. 只读属性 ----
console.log("\\n========== 3. 只读属性 ==========");

interface Point {
  readonly x: number;
  readonly y: number;
}

const p: Point = { x: 10, y: 20 };
console.log("初始点:", p);

// Readonly 工具类型
interface MutableUser {
  name: string;
  age: number;
  email: string;
}

type ReadonlyUser = Readonly<MutableUser>;
const roUser: ReadonlyUser = { name: "只读用户", age: 99, email: "ro@example.com" };
console.log("只读用户:", JSON.stringify(roUser));

// 结构化类型：readonly 可以赋给非 readonly
function mutatePoint(pt: { x: number; y: number }): void {
  pt.x = 999;
}
const rp: Point = { x: 10, y: 20 };
console.log("修改前:", rp.x);
mutatePoint(rp);  // readonly 类型兼容于非 readonly 类型
console.log("修改后:", rp.x, "（注意：readonly 只在编译期检查）");

// ---- 4. 索引签名 ----
console.log("\\n========== 4. 索引签名 ==========");

// 字符串索引签名
interface StringMap {
  [key: string]: string;
}

const colorMap: StringMap = {
  red: "#ff0000",
  green: "#00ff00",
  blue: "#0000ff",
  black: "#000000",
};

console.log("颜色映射:");
console.log("  red:", colorMap.red);
console.log("  green:", colorMap.green);
console.log("  blue:", colorMap.blue);
console.log("  black:", colorMap["black"]);

// 数字索引签名
interface NumberArray {
  [index: number]: string;
}

const names: NumberArray = {
  0: "张三",
  1: "李四",
  2: "王五",
};
console.log("\\n数字索引:");
for (let i = 0; i < 3; i++) {
  console.log("  names[" + i + "]:", names[i]);
}

// 联合索引签名
interface MixedIndex {
  [key: string]: string | number;
  name: string;     // ✅ string 是 string | number 的子类型
  count: number;    // ✅ number 是 string | number 的子类型
}

const mix: MixedIndex = { name: "测试", count: 42 };
console.log("\\n混合索引:", JSON.stringify(mix));

// ---- 5. 交叉类型 ----
console.log("\\n========== 5. 交叉类型 ==========");

// 合并两个类型
type HasName = { name: string };
type HasAge = { age: number };
type HasEmail = { email: string };

type Person = HasName & HasAge & HasEmail;

const person: Person = { name: "张三", age: 28, email: "zhang@example.com" };
console.log("交叉类型 Person:", JSON.stringify(person));

// Mixin 模式：给任意类型附加能力
type WithTimestamp = { createdAt: string; updatedAt: string };
type WithId = { id: string };

type Entity<T> = T & WithId & WithTimestamp;

type Article = Entity<{ title: string; content: string }>;
type Comment = Entity<{ articleId: string; body: string }>;

const article: Article = {
  id: "art-001",
  title: "TypeScript 对象类型",
  content: "结构化类型系统是...",
  createdAt: "2026-01-01",
  updatedAt: "2026-06-01",
};

const comment: Comment = {
  id: "cmt-001",
  articleId: "art-001",
  body: "好文章，学习了！",
  createdAt: "2026-06-15",
  updatedAt: "2026-06-15",
};

console.log("\\nMixin 模式:");
console.log("  Article:", JSON.stringify(article));
console.log("  Comment:", JSON.stringify(comment));

// 交叉类型冲突：同名属性类型不兼容会变成 never
// 演示：运行时无法创建冲突类型，但可以展示理论上会发生什么
console.log("\\n交叉类型冲突: 同名属性类型不兼容 → never（无法创建值）");

// ---- 6. 多余属性检查 ----
console.log("\\n========== 6. 多余属性检查 ==========");

interface Rectangle {
  width: number;
  height: number;
}

// 直接赋值对象字面量：多余属性检查
// const rect: Rectangle = { width: 100, height: 200, color: "red" }; // ❌

// 通过中间变量赋值：绕过检查
const temp = { width: 100, height: 200, color: "red" };
const rect: Rectangle = temp;  // ✅ 结构化类型允许
console.log("通过中间变量:", JSON.stringify(rect));
console.log("（多余属性 color 被保留在运行时，但类型层面不可见）");

// 正确做法：使用索引签名接收额外属性
interface FlexibleRectangle {
  width: number;
  height: number;
  [key: string]: unknown;  // 允许任意额外属性
}
const flexRect: FlexibleRectangle = { width: 100, height: 200, color: "red" };
console.log("索引签名接收额外属性:", JSON.stringify(flexRect));

// ---- 7. 结构化类型系统 ----
console.log("\\n========== 7. 结构化类型系统 ==========");

interface Point2D {
  x: number;
  y: number;
}

interface Coordinate {
  x: number;
  y: number;
}

// 两个不同名字的接口，结构相同，可以互相赋值
const p2d: Point2D = { x: 10, y: 20 };
const coord: Coordinate = p2d;  // ✅ 结构相同即可
console.log("Point2D:", JSON.stringify(p2d));
console.log("Coordinate:", JSON.stringify(coord));
console.log("它们兼容:", JSON.stringify(p2d) === JSON.stringify(coord));

// 子类型关系：属性多的可以赋给属性少的
interface Point3D {
  x: number;
  y: number;
  z: number;
}

const p3d: Point3D = { x: 1, y: 2, z: 3 };
const p2d2: Point2D = p3d;  // ✅ Point3D 是 Point2D 的子类型（有更多属性）
console.log("3D Point:", JSON.stringify(p3d));
console.log("赋给 2D Point:", JSON.stringify(p2d2));

// 函数参数的结构化类型
function printPoint(pt: Point2D): void {
  console.log("  Point(" + pt.x + ", " + pt.y + ")");
}

printPoint({ x: 5, y: 10 });  // Point2D
printPoint(p3d);                // Point3D（兼容）

// ---- 8. 对象类型工具：Pick, Omit, Partial, Record ----
console.log("\\n========== 8. 对象类型工具 ==========");

interface FullUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
}

// Pick: 挑选部分属性
type PublicUser = Pick<FullUser, "id" | "name" | "email" | "role">;
const publicUser: PublicUser = {
  id: 1,
  name: "张三",
  email: "zhang@example.com",
  role: "admin",
};
console.log("Pick(公开属性):", JSON.stringify(publicUser));

// Omit: 排除某些属性
type UserWithoutPassword = Omit<FullUser, "password">;
const safeUser: UserWithoutPassword = {
  id: 2,
  name: "李四",
  email: "li@example.com",
  role: "editor",
  createdAt: "2026-01-01",
};
console.log("Omit(排除密码):", JSON.stringify(safeUser));

// Partial: 所有属性变为可选
type PartialUser = Partial<FullUser>;
const partial: PartialUser = { name: "部分更新" };
console.log("Partial(部分更新):", JSON.stringify(partial));

// Record: 创建映射类型
type ScoreMap = Record<string, number>;
const scores: ScoreMap = {
  math: 95,
  english: 88,
  science: 92,
};
console.log("Record(成绩映射):", JSON.stringify(scores));

// Record 与固定键
type Role = "admin" | "editor" | "viewer";
type RolePermissions = Record<Role, string[]>;
const permissions: RolePermissions = {
  admin: ["create", "read", "update", "delete"],
  editor: ["create", "read", "update"],
  viewer: ["read"],
};
console.log("Record(角色权限):", JSON.stringify(permissions));

// ---- 9. 对象遍历与类型守卫 ----
console.log("\\n========== 9. 对象遍历与类型守卫 ==========");

// 遍历对象属性
const product = {
  id: "prod-001",
  name: "机械键盘",
  price: 899,
  stock: 200,
  category: "电子产品",
};

console.log("对象遍历:");
// 使用 Object.entries
Object.entries(product).forEach(([key, value]) => {
  console.log(\`  \${key}: \${value} (类型: \${typeof value})\`);
});

// 对象过滤：只保留数字类型的属性
function filterByType<T extends Record<string, unknown>>(
  obj: T,
  type: string
): Partial<T> {
  const result: Partial<T> = {};
  (Object.keys(obj) as Array<keyof T>).forEach((key) => {
    if (typeof obj[key] === type) {
      result[key] = obj[key];
    }
  });
  return result;
}

const numberProps = filterByType(product, "number");
console.log("\\n只保留 number 属性:", JSON.stringify(numberProps));

console.log("\\n对象类型全解演示完成！");`,
  },
];