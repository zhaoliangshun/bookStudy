// =============================================================
// TypeScript 交互式教程 —— 第五批章节（共 6 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. ts-toolchain       — 安装与工具链
//   2. ts-compile-flow    — 编译流程深入
//   3. ts-literal-deep    — 字面量类型深入
//   4. ts-enum-deep       — 枚举深入
//   5. ts-tuple-deep      — 元组深入
//   6. ts-readonly-deep   — 只读深入
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（本批为 "基础补充"）
//   content : Markdown 格式的详细讲解（文字量是普通教程的 10 倍）
//   code    : 可运行、带详细中文注释的 TypeScript 示例代码
//
// 代码运行环境约束：
//   - 用户写的 TypeScript 先被 typescript 编译器转译为 JS
//     (target ES2020, module CommonJS, 支持装饰器, isolatedModules)
//   - 再在 Node.js vm 沙箱中运行，5 秒超时
//   - 仅可 require: fs, path, os, url, crypto, util, events, stream,
//     buffer, querystring, string_decoder, zlib, assert, timers
//   - 全局可用: console, process, Buffer, setTimeout, setInterval,
//     setImmediate, URL, TextEncoder, TextDecoder, Promise,
//     __dirname, __filename, require, module, exports
//   - 类型注解/interface/type/enum/泛型/装饰器都可用(转译器处理)
//   - 类型错误不会阻止运行(教程侧重运行结果)
//   - isolatedModules 下 const enum 当普通枚举处理
//   - 沙箱不能 require 本地文件，所以"工具链/编译流程"相关 demo
//     用纯字符串处理 + 自制简易转译器来模拟 tsc 行为
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：安装与工具链
  // =========================================================
  {
    id: "ts-toolchain",
    title: "安装与工具链",
    icon: "🛠️",
    group: "基础补充",
    content: `## 安装与工具链 (Toolchain)

写 TypeScript 代码离不开一套**工具链（Toolchain）**：编译器、运行时、编辑器、配置文件、调试器。理解这套工具链的每一个环节如何工作、如何选择、如何配置，是从"会写 TS"到"高效写 TS"的关键一步。本章将极其详细地讲解整个 TypeScript 工具链生态——从安装方式到 \`tsc\` 命令行参数，从 ts-node/tsx/Deno/Bun 等运行时到 VS Code 配置，从 tsconfig 到 watch 模式与增量编译，再到 source map 调试。

### 工具链全景图

一个完整的 TypeScript 工作流通常包含以下环节：

1. **编辑器**：VS Code（默认内置 TS 语言服务）、WebStorm、Neovim（配合 LSP）、Sublime 等。
2. **编译器**：\`tsc\`（官方编译器）、\`esbuild\`、\`swc\`、\`babel\`（配合 \`@babel/preset-typescript\`）。
3. **运行时**：Node.js（需先编译）、\`ts-node\`/\`tsx\`（Node 上直接跑 TS）、Deno、Bun（原生支持 TS）。
4. **打包器**：webpack（\`ts-loader\`）、Vite（esbuild + tsc 配合）、Rollup、esbuild。
5. **配置**：\`tsconfig.json\`（编译选项）、\`.vscode/settings.json\`（编辑器选项）。
6. **调试**：source map、VS Code 调试器、\`node --inspect\`。

理解每一环的职责，才能在出现问题时知道去哪里查。

### 安装 TypeScript

TypeScript 本身是一个 npm 包（\`typescript\`），它包含编译器 \`tsc\`、语言服务（供编辑器用）和类型声明文件。安装方式有两种：**全局安装**和**项目本地安装**。

#### 全局安装

\`\`\`bash
npm install -g typescript  # 全局安装依赖
# 或
yarn global add typescript  # yarn 命令
# 或
pnpm add -g typescript  # pnpm 命令
\`\`\`

安装后可以在任意目录使用 \`tsc\` 命令：

\`\`\`bash
tsc --version          # 查看版本
tsc hello.ts           # 编译单个文件
\`\`\`

**优点**：方便随手编译单文件、做实验。
**缺点**：不同项目可能依赖不同 TS 版本，全局版本会造成不一致。**生产项目不建议依赖全局 TS**，应使用项目本地安装锁定版本。

#### 项目本地安装（推荐）

\`\`\`bash
npm install --save-dev typescript  # 安装依赖
# 或
yarn add --dev typescript  # yarn 命令
# 或
pnpm add -D typescript  # pnpm 命令
\`\`\`

安装后 \`tsc\` 位于 \`node_modules/.bin/tsc\`，需要通过 \`npx tsc\`、\`yarn tsc\` 或在 \`package.json\` 的 scripts 中调用：

\`\`\`json
{
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  }
}
\`\`\`

然后运行 \`npm run build\`。这样每个项目的 TS 版本独立锁定在 \`package-lock.json\`/\`yarn.lock\` 中，团队成员、CI 环境都能得到一致的编译结果。

#### 包管理器对比：npm / yarn / pnpm

| 维度 | npm | yarn (classic) | pnpm |
| --- | --- | --- | --- |
| **安装速度** | 中等 | 较快 | 最快（硬链接复用） |
| **磁盘占用** | 高（每个项目独立副本） | 高 | 低（全局 store + 硬链接） |
| **node_modules 结构** | 扁平 | 扁平 | 符号链接 + 严格 |
| **幽灵依赖** | 有 | 有 | 无（结构严格） |
| **monorepo 支持** | workspaces | workspaces | workspace（更强） |
| **lockfile** | package-lock.json | yarn.lock | pnpm-lock.yaml |

pnpm 因为采用符号链接结构，能避免"幽灵依赖"（即未在 package.json 声明却能 require 的包），是当前社区越来越推崇的选择。

### tsc 命令行参数详解

\`tsc\` 是 TypeScript 官方编译器的命令行入口。它有上百个参数，这里讲解最常用的。

#### 基本编译

\`\`\`bash
tsc                        # 读取 tsconfig.json 编译整个项目
tsc hello.ts               # 编译单文件（忽略 tsconfig.json）
tsc file1.ts file2.ts      # 编译多个文件
\`\`\`

#### 输出控制

| 参数 | 说明 | 示例 |
| --- | --- | --- |
| \`--outDir <dir>\` | 输出目录 | \`tsc --outDir dist\` |
| \`--outFile <file>\` | 合并输出为单文件（仅 AMD/System 模块） | \`tsc --outFile bundle.js\` |
| \`--rootDir <dir>\` | 输入根目录（影响输出结构） | \`tsc --rootDir src\` |
| \`--sourceMap\` | 生成 .js.map | \`tsc --sourceMap\` |
| \`--declaration\` / \`-d\` | 生成 .d.ts | \`tsc -d\` |
| \`--removeComments\` | 移除注释 | \`tsc --removeComments\` |

#### 类型检查

| 参数 | 说明 |
| --- | --- |
| \`--noEmitOnError\` | 有错误时不输出文件 |
| \`--strict\` | 开启所有严格检查（等价于一组选项） |
| \`--noImplicitAny\` | 禁止隐式 any |
| \`--strictNullChecks\` | 严格空值检查 |
| \`--noUnusedLocals\` | 报告未使用的局部变量 |
| \`--noUnusedParameters\` | 报告未使用的参数 |
| \`--noImplicitReturns\` | 函数所有路径必须 return |

#### 模块与目标

| 参数 | 说明 |
| --- | --- |
| \`--target ES2020\` | 编译目标 JS 版本 |
| \`--module commonjs\` | 模块系统（commonjs/esnext/...） |
| \`--moduleResolution node\` | 模块解析策略 |
| \`--esModuleInterop\` | 兼容 CommonJS 默认导入 |
| \`--resolveJsonModule\` | 允许 import JSON |

#### 监听与增量

| 参数 | 说明 |
| --- | --- |
| \`--watch\` / \`-w\` | 监听文件变化自动重新编译 |
| \`--incremental\` | 增量编译，生成 \`.tsbuildinfo\` 缓存 |
| \`--build\` | 项目引用模式（配合 references） |

#### 查看帮助

\`\`\`bash
tsc --help                 # 查看所有参数
tsc --version              # 查看版本
tsc --showConfig           # 打印展开后的 tsconfig（含继承）
tsc --listFiles            # 列出编译涉及的所有文件
tsc --listFilesOnly        | 只列文件不编译  # 运行 TypeScript 编译器
\`\`\`

**重要**：命令行参数会**覆盖** tsconfig.json 中的同名字段。例如 \`tsc --target ES5\` 会覆盖 tsconfig 里的 \`target\`。但如果你直接 \`tsc 文件名\`，tsc 会**忽略 tsconfig.json**——这是一个常见陷阱。

### ts-node：在 Node 上直接运行 TS

\`ts-node\` 是一个让 Node.js 直接执行 \`.ts\` 文件的工具。它内部调用 TypeScript 编译器**在内存中编译**（不写磁盘），然后交给 Node 运行。

\`\`\`bash
npm install -D ts-node typescript  # 安装开发依赖
npx ts-node hello.ts       # 直接运行
npx ts-node                # 进入 REPL
\`\`\`

**工作原理**：

1. Node 的 \`Module._compile\` 钩子被 ts-node 接管。
2. 当 require 一个 \`.ts\` 文件时，ts-node 调用 TS 编译器把它转成 JS（在内存中）。
3. 把转译后的 JS 交给 Node 原生执行。

**适用场景**：开发期脚本、本地调试、单元测试（Jest/Mocha 配合 ts-node）。**不建议用于生产**——运行时编译有性能开销。

ts-node 的配置可以写在 tsconfig.json 的 \`ts-node\` 字段或单独配置文件中：

\`\`\`json
{
  "ts-node": {
    "transpileOnly": true,    // 只转译不类型检查，提速
    "compilerOptions": {
      "module": "commonjs"
    }
  }
}
\`\`\`

\`transpileOnly: true\` 会跳过类型检查，大幅提升启动速度，适合开发期。

### tsx：更快的 TS 运行时

\`tsx\` 是基于 \`esbuild\` 的 TS 运行时，比 ts-node 快一个数量级。它用 Go 编写的 esbuild 做转译，速度极快：

\`\`\`bash
npm install -D tsx  # 安装开发依赖
npx tsx hello.ts  # 通过 npx 执行命令
\`\`\`

\`tsx\` 同样是内存编译 + Node 执行，但转译用 esbuild（不做类型检查，只做语法转译），所以快。它正在逐渐取代 ts-node 成为开发期首选。

### Deno：原生支持 TS 的运行时

\`Deno\` 是 Node.js 之父 Ryan Dahl 创建的新一代运行时，**原生支持 TypeScript**——不需要任何编译步骤，直接运行 \`.ts\` 文件：

\`\`\`bash
deno run hello.ts  # 执行命令 deno
\`\`\`

Deno 内部用 V8 引擎 + Rust 编写的 \`swc\` 做转译。它会缓存编译结果，第二次运行很快。Deno 默认安全（需 \`--allow-read\` 等权限）、支持 URL 导入、内置测试与格式化工具。

### Bun：全能 JS/TS 运行时

\`Bun\` 是另一个新生代运行时（Zig 编写），同样**原生支持 TS**：

\`\`\`bash
bun run hello.ts  # 执行命令 bun
bun hello.ts  # 执行命令 bun
\`\`\`

Bun 的卖点是极致速度（启动快、运行快）、内置打包器、测试运行器、包管理器，目标是"一个工具搞定一切"。它内部用 \`zig\` + JavaScriptCore 引擎。

### VS Code TypeScript 配置

VS Code 内置了 TypeScript 语言服务（自带一个 TS 版本）。你可以：

1. **切换 TS 版本**：\`Ctrl/Cmd+Shift+P\` → "TypeScript: Select TypeScript Version"，可在"VS Code 内置版本"和"工作区版本"（\`node_modules/typescript\`）之间切换。建议选工作区版本以保持与命令行一致。
2. **配置项**（在 \`.vscode/settings.json\`）：

\`\`\`json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.suggest.autoImports": true,
  "typescript.format.enable": true
}
\`\`\`

3. **重构**：重命名符号、移动文件自动更新导入、提取函数/接口等，都依赖 TS 语言服务。

### tsconfig.json 快速上手

\`tsconfig.json\` 是 TypeScript 项目的配置文件，\`tsc\` 不带参数运行时会自动读取它。最简配置：

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
\`\`\`

关键字段：

- \`compilerOptions\`：编译选项（target/module/strict/...）。
- \`include\`：哪些文件参与编译（glob 模式）。
- \`exclude\`：排除哪些文件（默认排除 node_modules）。
- \`extends\`：继承另一个 tsconfig（复用配置）。
- \`references\`：项目引用（monorepo 拆分）。

更详细的 tsconfig 讲解见专门章节，本章只做快速入门。

### Watch 模式

\`tsc --watch\`（简写 \`-w\`）会监听源文件变化，自动增量重新编译。它在内存中保留上次的编译状态，只重编译变化的文件，速度比每次全量编译快很多。开发时通常开两个终端：一个 \`tsc -w\` 持续编译，一个跑应用。

### 增量编译

\`tsc --incremental\` 会生成 \`.tsbuildinfo\` 文件，记录每个文件的版本指纹和类型信息，下次编译时只处理变化的部分，并把类型检查结果部分复用。在大型项目（数千文件）中，增量编译能把"改一行重编译"的时间从几十秒降到几秒。

配合 \`--build\` 模式和项目引用（\`references\`），可以把大项目拆成多个子项目，各自独立增量编译，进一步提速。

### Source Map 与调试

\`--sourceMap\` 会让 tsc 在输出 \`.js\` 的同时生成 \`.js.map\` 文件，它记录了"编译后的 JS 行/列 → 原始 TS 行/列"的映射。调试器（VS Code、Chrome DevTools）读取 source map 后，能在断点时显示**原始 TS 源码**而不是编译后的 JS，让调试体验和直接写 JS 一样。

VS Code 调试 TS 的典型 \`launch.json\`：

\`\`\`json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug TS",
      "runtimeArgs": ["-r", "ts-node/register", "\${file}"],
      "sourceMaps": true,
      "outFiles": ["\${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
\`\`\`

### 本节代码演示

下面这段代码**模拟** tsc 的编译流程（用一个简易的"类型擦除器"演示 TS→JS 的转换）、模拟 ts-node 的"编译后执行"流程，并对比不同 \`target\` 下同一段代码的编译输出差异（如箭头函数、类、可选链在 ES5 vs ES2020 的差异）。由于沙箱不能真的调用 tsc，我们用字符串处理来还原这些行为，让你直观感受工具链的工作方式。`,
    code: `// ============================================================
// 第一章代码演示：TypeScript 工具链模拟
// ============================================================
// 由于沙箱里没有真正的 tsc，我们用字符串处理来"模拟"工具链的
// 关键行为：类型擦除、不同 target 的降级差异、ts-node 的执行流程。
// 这能让你直观理解工具链在做什么。

// ---- 1. 模拟 tsc 的类型擦除 ----
// tsc 把 TS 转成 JS 的核心动作之一就是"擦除类型注解"。
// 我们写一个简易的"转译器"，用正则近似还原这个过程。
console.log("========== 1. 模拟 tsc 类型擦除 ==========");

// 一段"TS 源码"（字符串形式）
const tsSource = [
  "let userName: string = \\"张三\\";",
  "let age: number = 28;",
  "function add(a: number, b: number): number {",
  "  return a + b;",
  "}",
  "interface Person { name: string; age: number; }",
  "const p: Person = { name: \\"李四\\", age: 30 };",
].join("\\n");

console.log("--- 原始 TS 源码 ---");
console.log(tsSource);

// 简易类型擦除函数（真实 tsc 用 AST 处理，这里用正则近似）
function transpileTypescript(source: string): string {
  let out = source;
  // 移除 interface ... { ... } 整块（含多行，非贪婪匹配花括号内容）
  out = out.replace(/interface\\s+\\w+\\s*\\{[\\s\\S]*?\\}/g, "// (interface 已被擦除)");
  // 移除变量名后的 :类型（如 : string / : number / : Person）
  out = out.replace(/:\\s*[A-Za-z_]\\w*(\\[\\])?\\s*(?==|;|,|\\))/g, " ");
  // 移除函数参数列表后的 ): 返回类型
  out = out.replace(/\\)\\s*:\\s*[A-Za-z_]\\w*/g, ")");
  return out;
}

const jsOutput = transpileTypescript(tsSource);
console.log("--- 擦除类型后的 JS（模拟 tsc 输出）---");
console.log(jsOutput);

// ---- 2. 模拟 ts-node 的"编译后执行"流程 ----
// ts-node 的核心：在内存里把 TS 编译成 JS，再交给 Node 执行。
// 我们用 Function 构造器模拟"拿一段 JS 字符串去执行"。
console.log("\\n========== 2. 模拟 ts-node 执行流程 ==========");

// 假装这是一段用户写的 TS（带类型注解）
const userTs = [
  "function greet(name: string): string {",
  "  return \\"你好，\\" + name + \\"！\\";",
  "}",
  "console.log(\\"ts-node 执行结果:\\", greet(\\"世界\\"));",
].join("\\n");

console.log("--- 用户写的 TS（带类型）---");
console.log(userTs);

// 步骤 A：内存中编译（擦除类型）
const compiledJs = transpileTypescript(userTs);
console.log("--- 步骤 A: 内存编译为 JS ---");
console.log(compiledJs);

// 步骤 B：把编译后的 JS 字符串交给"运行时"执行
console.log("--- 步骤 B: 交给运行时执行 ---");
// 用 new Function 执行编译后的代码（模拟 Node 运行 JS）
const runner = new Function(compiledJs);
runner(); // 输出: ts-node 执行结果: 你好，世界！

// ---- 3. 不同 target 的编译输出差异 ----
// target 决定了 tsc 把现代 JS 语法降级到哪个版本。
// 我们对比 ES5 和 ES2020 对同一段代码的编译结果。
console.log("\\n========== 3. 不同 target 的输出差异 ==========");

// 一段现代 JS 代码
const modernCode = [
  "const add = (a, b) => a + b;",            // 箭头函数
  "class Person {",                            // 类
  "  constructor(name) { this.name = name; }",
  "  greet() { return \\"Hi, \\" + this.name; }",
  "}",
  "const u = { name: \\"Tom\\" };",
  "console.log(u?.name);",                     // 可选链
].join("\\n");

// 模拟 ES2020 target：几乎原样保留（ES2020 已支持箭头/类/可选链）
function compileToES2020(code: string): string {
  return code; // ES2020 全部支持，原样输出
}

// 模拟 ES5 target：箭头→function，类→构造函数，可选链→三目
function compileToES5(code: string): string {
  let out = code;
  // 箭头函数 → function
  out = out.replace(
    /const\\s+(\\w+)\\s*=\\s*\\(([^)]*)\\)\\s*=>\\s*([^;]+);/g,
    "var $1 = function ($2) { return $3; };"
  );
  // 可选链 u?.name → (u == null ? undefined : u.name)
  out = out.replace(/(\\w+)\\?\\.(\\w+)/g, "($1 == null ? undefined : $1.$2)");
  // 类 → 构造函数 + 原型方法（简化处理）
  out = out.replace(
    /class\\s+(\\w+)\\s*\\{[\\s\\S]*?constructor\\(([^)]*)\\)\\s*\\{([^}]*)\\}[\\s\\S]*?(\\w+)\\(\\)\\s*\\{([^}]*)\\}\\s*\\}/g,
    "function $1($2) {$3}\\n$1.prototype.$4 = function() {$5};"
  );
  // const → var
  out = out.replace(/\\bconst\\b/g, "var");
  return out;
}

console.log("--- 原始现代代码 ---");
console.log(modernCode);

console.log("--- target: ES2020（原样保留）---");
console.log(compileToES2020(modernCode));

console.log("--- target: ES5（降级处理）---");
console.log(compileToES5(modernCode));

// ---- 4. watch 模式原理演示 ----
// tsc --watch 监听文件变化做增量编译。我们用伪代码演示其逻辑。
console.log("\\n========== 4. watch 模式原理演示 ==========");

// 模拟一个"文件系统"和"编译缓存"
const fakeFs: Record<string, string> = {
  "app.ts": "const x: number = 1;",
};
const compileCache: Record<string, string> = {};

function compileFile(filename: string): string {
  const source = fakeFs[filename];
  // 增量：如果内容没变，直接用缓存
  if (compileCache[filename] === source) {
    console.log("  [增量] " + filename + " 未变化，跳过编译");
    return "(cached)";
  }
  console.log("  [编译] " + filename + " 发生变化，重新编译");
  const result = transpileTypescript(source);
  compileCache[filename] = source; // 更新缓存指纹
  return result;
}

console.log("第一次编译（无缓存）:");
compileFile("app.ts");
console.log("第二次编译（内容未变，命中缓存）:");
compileFile("app.ts");
// 模拟文件被修改
console.log("修改 app.ts 后再编译:");
fakeFs["app.ts"] = "const x: number = 2;";
compileFile("app.ts");

// ---- 5. tsc 命令行参数演示 ----
console.log("\\n========== 5. 模拟 tsc 命令行解析 ==========");

// 模拟 tsc 解析命令行参数的过程
function parseTscArgs(args: string[]): Record<string, string | boolean> {
  const opts: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      // 布尔型参数（无值）
      if (["watch", "incremental", "sourceMap", "strict", "declaration"].includes(key)) {
        opts[key] = true;
      } else if (next && !next.startsWith("--")) {
        opts[key] = next; // 带值参数
        i++;
      } else {
        opts[key] = true;
      }
    } else {
      opts["_files"] = (opts["_files"] ? opts["_files"] + "," : "") + arg;
    }
  }
  return opts;
}

const fakeArgs = ["hello.ts", "--target", "ES2020", "--outDir", "dist", "--watch", "--strict"];
const parsed = parseTscArgs(fakeArgs);
console.log("模拟命令: tsc " + fakeArgs.join(" "));
console.log("解析结果:", JSON.stringify(parsed, null, 2));

// ---- 6. source map 概念演示 ----
console.log("\\n========== 6. source map 概念演示 ==========");

// source map 记录"编译后 JS 位置 → 原始 TS 位置"的映射
interface SourceMapMapping {
  jsLine: number;   // 编译后 JS 行号
  jsColumn: number; // 编译后 JS 列号
  tsLine: number;   // 原始 TS 行号
  tsColumn: number; // 原始 TS 列号
  source: string;   // 原始文件名
}

const mappings: SourceMapMapping[] = [
  { jsLine: 1, jsColumn: 0, tsLine: 3, tsColumn: 0, source: "hello.ts" },
  { jsLine: 2, jsColumn: 0, tsLine: 4, tsColumn: 2, source: "hello.ts" },
];

console.log("source map 映射表示例:");
mappings.forEach((m) => {
  console.log("  JS(" + m.jsLine + ":" + m.jsColumn + ") ← TS(" + m.tsLine + ":" + m.tsColumn + ") @" + m.source);
});
console.log("调试器据此在断点处显示原始 TS 源码而非编译后的 JS");

// ---- 7. 工具链选择决策树 ----
console.log("\\n========== 7. 工具链选择参考 ==========");
const decisions: Array<{ scenario: string; tool: string; reason: string }> = [
  { scenario: "本地随手编译单文件实验", tool: "tsc (全局)", reason: "无需项目结构" },
  { scenario: "生产项目构建", tool: "tsc (项目本地) + tsconfig", reason: "锁定版本、配置完整" },
  { scenario: "开发期跑 TS 脚本/测试", tool: "tsx 或 ts-node", reason: "免手动编译、快速迭代" },
  { scenario: "追求极致启动速度", tool: "tsx / Bun", reason: "esbuild/native 转译极快" },
  { scenario: "新项目想用现代运行时", tool: "Deno / Bun", reason: "原生 TS、内置工具链" },
  { scenario: "前端打包", tool: "Vite + esbuild", reason: "开发期 esbuild 秒级转译" },
];
decisions.forEach((d) => {
  console.log("  场景: " + d.scenario);
  console.log("    → 推荐: " + d.tool + "（" + d.reason + "）");
});

console.log("\\n工具链演示完成！理解工具链，写 TS 才能事半功倍。");`,
  },

  // =========================================================
  // 第二章：编译流程深入
  // =========================================================
  {
    id: "ts-compile-flow",
    title: "编译流程深入",
    icon: "⚙️",
    group: "基础补充",
    content: `## 编译流程深入 (Compilation Pipeline)

TypeScript 编译器（\`tsc\`）是一个相当复杂的程序——它要把一段 TS 源码经过多个阶段处理，最终输出 JS 代码、类型声明文件和 source map。理解这套编译流程，能让你在遇到奇怪的编译错误、性能问题、或是想自定义编译行为时，知道问题出在哪一环。本章将极其详细地拆解 TypeScript 编译器的四大阶段、AST、符号表、类型推断、类型擦除、声明文件生成、source map 原理、增量编译，以及 \`program\`/\`CompilerHost\`/\`SourceFile\` 等核心概念。

### 编译器整体架构

TypeScript 编译器内部大致结构（简化）：

\`\`\`
源码字符串
    ↓
[1] 解析 Parser        →  SourceFile (AST)
    ↓
[2] 绑定 Binder        →  SymbolTable（符号表）
    ↓
[3] 类型检查 Checker   →  类型错误诊断
    ↓
[4] 发射 Emitter       →  .js / .d.ts / .js.map
\`\`\`

整个过程由 \`program\` 对象协调，它持有所有源文件、编译选项、\`CompilerHost\`（文件系统抽象）等。每一阶段产出的数据结构是下一阶段的输入。

### 四大阶段详解

#### 阶段一：解析（Parse）

**输入**：源码字符串（每个文件一个）。
**输出**：\`SourceFile\` 对象，它既是 AST 的根节点，也记录了文件级别的信息（行号映射、注释等）。

解析分为两小步：

1. **扫描器（Scanner）**：把字符串切成一个个 \`Token\`（标记）。比如 \`let x: number = 1;\` 会被切成 \`let\` / \`x\` / \`:\` / \`number\` / \`=\` / \`1\` / \`;\` 这几个 token。扫描器还负责跳过空白、识别注释、处理字符串/数字字面量。
2. **解析器（Parser）**：根据 token 流按语法规则构建 AST（抽象语法树）。比如 \`let x = 1;\` 会被构建成 \`VariableStatement → VariableDeclarationList → VariableDeclaration(name=x, initializer=1)\`。

AST 是源码的树形结构表示，每个节点是一个 \`Node\` 对象，有 \`kind\`（节点类型，如 \`VariableDeclaration\`）、\`pos\`/\`end\`（在源码中的位置区间）、\`children\` 等字段。AST 让后续阶段能用结构化方式访问代码，而不是再去正则匹配字符串。

**这一阶段不做任何类型相关的事**——它只关心语法是否合法。如果代码有语法错误（如少了个括号），在这一阶段就会报"语法错误"。

#### 阶段二：绑定（Bind）

**输入**：每个文件的 AST。
**输出**：符号表（Symbol Table），每个 AST 节点上附加了 \`symbol\` 信息。

绑定的核心任务：**建立"声明"与"引用"之间的联系**。当你写：

\`\`\`ts
const x = 1;  // 声明常量 x
console.log(x);  // 控制台输出
\`\`\`

解析阶段会生成两个节点：一个 \`VariableDeclaration(x)\` 和一个 \`Identifier(x)\`（在 \`console.log(x)\` 里）。但解析阶段不知道这两个 \`x\` 是同一个东西——它只看到字符串 "x"。

绑定阶段会：

1. 遇到 \`const x\` 时，在当前作用域的符号表里注册一个 \`Symbol\`，名字为 \`x\`，指向声明节点。
2. 遇到引用 \`x\` 时，在作用域链中查找名字为 \`x\` 的 Symbol，把引用节点关联到这个 Symbol。

绑定后，编译器就知道"这个 \`x\` 引用的是哪个声明"。同时绑定阶段还计算每个节点的**类型流标记**（如 \`NodeFlags.AwaitContext\`），为类型检查做准备。

#### 阶段三：类型检查（Type Check）

**输入**：带符号表的 AST。
**输出**：类型诊断（错误列表），以及每个表达式的推断类型。

这是编译器最复杂的阶段。类型检查器（Checker）遍历 AST，对每个节点：

- **推断类型**：根据字面量、运算、函数返回值等推断表达式类型。
- **检查赋值兼容性**：如 \`let x: number = "hi"\` 会报错。
- **解析泛型**：展开泛型实例化、计算约束。
- **类型缩小**：在 \`if (typeof x === "string")\` 块内把 \`x\` 缩小为 string。
- **解析条件类型/映射类型**等高级类型构造。

类型检查的输出是**诊断（Diagnostic）列表**——每个错误包含位置、消息、错误码。如果你开了 \`noEmitOnError\`，有诊断错误时不会发射 JS。

**关键认知**：类型信息只存在于这一阶段。一旦检查完成，类型信息在发射阶段会被**完全丢弃**——运行时没有任何类型痕迹。

#### 阶段四：发射（Emit）

**输入**：AST + 编译选项。
**输出**：\`.js\`（可选 \`.d.ts\`、\`.js.map\`）。

发射器（Emitter）再次遍历 AST，对每个节点：

- **类型擦除**：去掉所有类型注解、interface/type/泛型参数。如 \`let x: number = 1\` → \`let x = 1\`，\`function f<T>(x: T): T\` → \`function f(x)\`。
- **语法降级**：根据 \`target\` 把现代语法转成目标版本（如 ES5 时把箭头函数、类、可选链降级）。
- **枚举/命名空间发射**：把 \`enum\` 转成普通对象，把 \`namespace\` 转成 IIFE。
- **生成 .d.ts**：如果开启 \`declaration\`，从 AST 提取类型信息生成声明文件。
- **生成 source map**：记录 JS 位置到 TS 位置的映射。

发射阶段**不做类型检查**——它只关心"如何把 AST 变成 JS 字符串"。这也是为什么 \`transpileModule\`（esbuild/swc 类似的"只转译不检查"模式）能快得多。

### AST 抽象语法树

AST 是编译器的核心数据结构。以 \`let x: number = 1 + 2;\` 为例，它的 AST 大致是：

\`\`\`
VariableStatement
└─ VariableDeclarationList
   └─ VariableDeclaration
      ├─ Identifier (x)
      └─ BinaryExpression (+)
         ├─ NumericLiteral (1)
         └─ NumericLiteral (2)
\`\`\`

每个节点有 \`kind\`（节点类型枚举）、\`pos\`/\`end\`（源码位置）、子节点。AST 是**树形**的——表达式嵌套在子节点里。

TypeScript 提供了 \`ts.factory\` API 来编程式构造 AST，\`ts.createPrinter\` 把 AST 打印回代码字符串。这是写自定义代码生成工具的基础。

### 符号表（Symbol Table）

符号表是"名字 → Symbol"的映射，按作用域分层（全局/模块/函数/块）。每个 \`Symbol\` 记录：

- \`name\`：符号名。
- \`declarations\`：所有声明该符号的节点（函数重载会有多个）。
- \`flags\`：符号标志（如 \`FunctionScopedVariable\`、\`Class\`、\`Enum\`）。

类型检查时，遇到一个标识符引用，编译器在符号表里查它的 Symbol，再从 Symbol 的声明节点推断类型。这是"名字解析"的核心。

### 类型推断算法

TypeScript 的类型推断遵循几个核心规则：

1. **字面量推断**：\`let x = 1\` 推断为 \`number\`（let 可变，所以宽化为 number）；\`const x = 1\` 推断为字面量 \`1\`（const 不可变）。
2. **最佳通用类型**：\`[1, 2, "a"]\` 推断为 \`(number | string)[]\`——找所有元素的"最佳通用类型"。
3. **上下文类型**：\`window.onclick = e => ...\` 中 \`e\` 被推断为 \`MouseEvent\`，因为赋值目标决定了类型。
4. **控制流分析**：在 \`if\`/\`switch\`/\`typeof\`/\`instanceof\` 等分支里缩小类型。

类型推断是**局部的**——它不看跨文件的控制流，只在一个函数/表达式范围内分析。

### 类型擦除原理

类型擦除是发射阶段的核心动作。具体规则：

- **变量/参数/返回值的 \`: 类型\`**：直接删除。
- **interface/type 别名**：整个声明删除（运行时不存在）。
- **泛型参数 \`<T>\`**：删除。
- **类型断言 \`x as T\`**：保留 \`x\`，删除 \`as T\`。
- **非空断言 \`x!\`**：删除 \`!\`。
- **enum**：**不擦除**，转成运行时对象（数值枚举有反向映射）。
- **namespace**：转成 IIFE 对象。
- **装饰器**：根据 \`experimentalDecorators\` 转成相应调用代码。

\`\`\`ts
// TS 源码
interface Person { name: string; }  // 定义接口 Person
function greet(p: Person): string { return p.name; }  // 定义函数 greet，参数: p: Person，返回 string
const enum Color { Red, Green }
let c = Color.Red;  // 声明变量 c

// 擦除类型后（ES2020 target）
function greet(p) { return p.name; }  // 定义函数 greet，参数: p
let Color = { Red: 0, Green: 1, 0: "Red", 1: "Green" }; // enum 保留为对象
let c = 0; // const enum 被内联（但 isolatedModules 下当普通 enum）
\`\`\`

**重要**：因为类型在运行时不存在，所以你不能用 \`instanceof\` 检查一个 \`interface\`，也不能在运行时读取类型注解。如果需要运行时的类型信息，得用 \`enum\`、class、或自定义"类型守卫函数"。

### 声明文件生成（.d.ts）

开启 \`declaration: true\` 后，tsc 会为每个 \`.ts\` 生成对应的 \`.d.ts\`。它包含：

- 导出的 \`interface\`/\`type\` 原样保留。
- 导出的函数/类/变量的**签名**（不含实现）。
- 移除所有私有成员和实现细节。

\`\`\`ts
// add.ts
export function add(a: number, b: number): number { return a + b; }  // 导出函数 add

// 生成的 add.d.ts
export declare function add(a: number, b: number): number;  // 导出 declare function
\`\`\`

\`.d.ts\` 让下游项目能获得类型提示，而不需要看 \`.ts\` 源码。发布 npm 包时通常同时发布 \`.js\` 和 \`.d.ts\`。

### Source Map 原理

source map 是一个 JSON 文件，关键字段：

- \`version\`：source map 规范版本（通常 3）。
- \`sources\`：原始 TS 文件路径数组。
- \`names\`：标识符数组（可选）。
- \`mappings\`：编码后的位置映射字符串（VLQ 编码）。
- \`file\`：生成的 JS 文件名。

\`mappings\` 字段用 VLQ（Variable Length Quantity）编码紧凑地记录"JS 的第几行第几列 → TS 的第几个文件第几行第几列 + 第几个名字"。调试器解码后就能在断点处把 JS 位置映射回 TS 位置，显示原始源码。

### 增量编译原理

\`--incremental\` 会在输出目录生成 \`.tsbuildinfo\` 文件，它记录：

- 每个源文件的**版本指纹**（通常是内容哈希或 mtime）。
- 每个文件的**类型检查结果**（部分可复用）。
- 文件之间的依赖关系（哪些文件引用了哪些类型）。

下次编译时：

1. 比对文件指纹，找出变化的文件。
2. 标记变化文件 + 依赖它们的所有文件为"脏"。
3. 只对脏文件重新解析/绑定/检查。
4. 复用未变化文件的检查结果。

在大型项目里，增量编译能从"几十秒全量"降到"几秒增量"，是开发体验的关键。\`--build\` 模式 + 项目引用（\`references\`）进一步把多个子项目串联起来增量编译。

### program / CompilerHost / SourceFile

这三个是编译器 API 的核心对象：

- **\`Program\`**：一次编译的顶层对象。持有所有 \`SourceFile\`、编译选项、\`CompilerHost\`。它协调四大阶段。
- **\`CompilerHost\`**：文件系统抽象。它提供 \`getSourceFile(filename)\`、\`writeFile(name, content)\`、\`fileExists()\`、\`readFile()\` 等方法。把"读文件/写文件"抽象出来，让编译器能运行在不同环境（真实磁盘 / 内存 / 自定义虚拟文件系统）。
- **\`SourceFile\`**：单个源文件的 AST 根节点 + 文件级信息（行号表、注释列表、\`fileName\`）。

通过 \`ts.createProgram(rootNames, options, host)\` 可以编程式创建一个 Program，然后 \`program.emit()\` 触发发射，\`program.getTypeChecker()\` 拿到类型检查器访问类型信息。这是写自定义编译工具（如自定义 lint 规则、文档生成器）的基础。

### 本节代码演示

下面我们用纯字符串处理**模拟**编译流程的几个关键环节：写一个简易 tokenizer + parser 把表达式解析成 AST、模拟类型擦除的过程、并展示不同 \`target\` 下同一段代码的编译输出差异。真实 tsc 用完整的 AST + 类型系统，这里用简化模型让你直观感受每一步在做什么。`,
    code: `// ============================================================
// 第二章代码演示：编译流程深入（模拟）
// ============================================================
// 真实 tsc 是几十万行代码，我们这里用简化模型还原它的四个阶段：
//   解析(Parse) → 绑定(Bind) → 类型检查(Check) → 发射(Emit)
// 让你直观看到每个阶段在做什么。

// ---- 1. 简易扫描器（Scanner）：源码字符串 → Token 流 ----
console.log("========== 1. 扫描器：源码 → Token 流 ==========");

// Token 类型枚举
type TokenType = "number" | "identifier" | "operator" | "punct" | "eof";

interface Token {
  type: TokenType;
  value: string;
  pos: number; // 在源码中的位置
}

// 一个简易的 tokenizer：识别数字、标识符、运算符、标点
function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const isDigit = (c: string) => c >= "0" && c <= "9";
  const isAlpha = (c: string) => (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";

  while (i < source.length) {
    const c = source[i];
    // 跳过空白
    if (c === " " || c === "\\t" || c === "\\n" || c === "\\r") {
      i++;
      continue;
    }
    // 数字字面量
    if (isDigit(c)) {
      let num = "";
      while (i < source.length && isDigit(source[i])) {
        num += source[i];
        i++;
      }
      tokens.push({ type: "number", value: num, pos: i - num.length });
      continue;
    }
    // 标识符 / 关键字
    if (isAlpha(c)) {
      let id = "";
      while (i < source.length && (isAlpha(source[i]) || isDigit(source[i]))) {
        id += source[i];
        i++;
      }
      tokens.push({ type: "identifier", value: id, pos: i - id.length });
      continue;
    }
    // 运算符
    if ("+-*/=".includes(c)) {
      tokens.push({ type: "operator", value: c, pos: i });
      i++;
      continue;
    }
    // 标点（括号、分号、冒号等）
    if "(){};:,".includes(c)) {
      tokens.push({ type: "punct", value: c, pos: i });
      i++;
      continue;
    }
    // 未识别字符直接跳过
    i++;
  }
  tokens.push({ type: "eof", value: "", pos: i });
  return tokens;
}

const sampleExpr = "let x = 1 + 2 * 3;";
console.log("源码:", sampleExpr);
const tokens = tokenize(sampleExpr);
console.log("Token 流:");
tokens.forEach((t) => {
  if (t.type !== "eof") console.log("  " + t.type + "(" + t.value + ") @pos=" + t.pos);
});

// ---- 2. 简易解析器（Parser）：Token 流 → AST ----
console.log("\\n========== 2. 解析器：Token 流 → AST ==========");

// AST 节点类型
interface AstNode {
  type: string;
  value?: string;
  children?: AstNode[];
}

// 极简解析器：只解析 "let 标识符 = 表达式;" 这种语句
// 表达式支持 + - * 数字
function parseStatement(tokens: Token[]): AstNode {
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  // 解析表达式（递归下降，支持优先级：* 高于 +）
  function parseExpr(): AstNode {
    return parseAdd();
  }
  function parseAdd(): AstNode {
    let left = parseMul();
    while (peek() && peek().type === "operator" && (peek().value === "+" || peek().value === "-")) {
      const op = next().value;
      const right = parseMul();
      left = { type: "BinaryOp", value: op, children: [left, right] };
    }
    return left;
  }
  function parseMul(): AstNode {
    let left = parsePrimary();
    while (peek() && peek().type === "operator" && (peek().value === "*" || peek().value === "/")) {
      const op = next().value;
      const right = parsePrimary();
      left = { type: "BinaryOp", value: op, children: [left, right] };
    }
    return left;
  }
  function parsePrimary(): AstNode {
    const t = next();
    if (t.type === "number") return { type: "NumberLiteral", value: t.value };
    if (t.type === "identifier") return { type: "Identifier", value: t.value };
    throw new Error("未预期的 token: " + t.value);
  }

  // 解析 let 标识符 = 表达式;
  const letTok = next(); // let
  const nameTok = next(); // 标识符
  const eqTok = next(); // =
  const expr = parseExpr();
  next(); // ;
  return {
    type: "VariableDeclaration",
    value: nameTok.value,
    children: [expr],
  };
}

const ast = parseStatement(tokens);
console.log("AST:");
console.log(JSON.stringify(ast, null, 2));

// 递归打印 AST（树形）
function printAst(node: AstNode, indent: string): void {
  let line = indent + node.type;
  if (node.value) line += " (" + node.value + ")";
  console.log(line);
  if (node.children) {
    node.children.forEach((c) => printAst(c, indent + "  "));
  }
}
printAst(ast, "");

// ---- 3. 简易求值（模拟"绑定+检查"后的执行）----
console.log("\\n========== 3. AST 求值（模拟绑定后的语义）==========");
function evalAst(node: AstNode): number {
  if (node.type === "NumberLiteral") return parseInt(node.value!, 10);
  if (node.type === "BinaryOp") {
    const left = evalAst(node.children![0]);
    const right = evalAst(node.children![1]);
    switch (node.value) {
      case "+": return left + right;
      case "-": return left - right;
      case "*": return left * right;
      case "/": return left / right;
    }
  }
  throw new Error("无法求值的节点: " + node.type);
}
console.log("求值 let x = 1 + 2 * 3; → x =", evalAst(ast.children![0]));

// ---- 4. 模拟类型擦除（发射阶段核心动作）----
console.log("\\n========== 4. 模拟类型擦除 ==========");

// 一段带类型注解的"TS 源码"
const tsCode = [
  "let count: number = 10;",
  "let name: string = \\"张三\\";",
  "function add(a: number, b: number): number {",
  "  return a + b;",
  "}",
  "interface User { id: number; name: string; }",
  "const u: User = { id: 1, name: \\"李四\\" };",
  "let maybe: string | null = null;",
].join("\\n");

console.log("--- 原始 TS 源码（带类型）---");
console.log(tsCode);

// 类型擦除函数（基于正则的近似实现，真实 tsc 走 AST）
function eraseTypes(source: string): string {
  let out = source;
  // 1. 删除 interface 声明块
  out = out.replace(/interface\\s+\\w+\\s*\\{[\\s\\S]*?\\}\\n?/g, "");
  // 2. 删除变量/参数后的 :类型（含联合类型 string | null）
  out = out.replace(/:\\s*[A-Za-z_][\\w\\s|&]*(\\[\\])?\\s*(?==|;|,|\\))/g, " ");
  // 3. 删除函数返回值类型 ): 类型
  out = out.replace(/\\)\\s*:\\s*[A-Za-z_][\\w\\[\\]]*/g, ")");
  return out.trim();
}

const erasedJs = eraseTypes(tsCode);
console.log("--- 类型擦除后的 JS ---");
console.log(erasedJs);
console.log("→ 注意：interface 整块消失，:类型 全部消失，运行时无类型痕迹");

// ---- 5. 不同 target 的编译输出对比 ----
console.log("\\n========== 5. 不同 target 编译差异 ==========");

const modernSrc = [
  "const double = (n) => n * 2;",
  "class Animal {",
  "  constructor(name) { this.name = name; }",
  "  speak() { return this.name + \\" 发声\\"; }",
  "}",
  "const a = { x: 1 };",
  "console.log(a?.x ?? 0);",
].join("\\n");

// ES2020 target：箭头、类、可选链、空值合并都原生支持，原样输出
function emitES2020(src: string): string {
  return src;
}

// ES5 target：降级箭头→function、类→构造函数、可选链→三元、?? → ||
function emitES5(src: string): string {
  let out = src;
  // const → var
  out = out.replace(/\\bconst\\b/g, "var").replace(/\\blet\\b/g, "var");
  // 箭头函数 → function
  out = out.replace(
    /(var|let|const)\\s+(\\w+)\\s*=\\s*\\(([^)]*)\\)\\s*=>\\s*([^;]+);/g,
    "$1 $2 = function ($3) { return $4; };"
  );
  // 可选链 a?.x → (a == null ? undefined : a.x)
  out = out.replace(/(\\w+)\\?\\.(\\w+)/g, "($1 == null ? undefined : $1.$2)");
  // 空值合并 a ?? b → (a !== null && a !== undefined ? a : b)
  out = out.replace(/(\\w+)\\s*\\?\\?\\s*(\\w+)/g, "($1 !== null && $1 !== undefined ? $1 : $2)");
  return out;
}

console.log("--- 原始现代代码 ---");
console.log(modernSrc);
console.log("--- target: ES2020（原样保留）---");
console.log(emitES2020(modernSrc));
console.log("--- target: ES5（语法降级）---");
console.log(emitES5(modernSrc));
console.log("→ ES5 输出体积更大、可读性更差，但兼容旧浏览器");

// ---- 6. 增量编译的"指纹"机制演示 ----
console.log("\\n========== 6. 增量编译指纹机制 ==========");

// 用 crypto 计算文件内容哈希作为"指纹"
import * as crypto from "crypto";

interface FileRecord {
  path: string;
  content: string;
  hash: string;
}

function makeHash(content: string): string {
  return crypto.createHash("md5").update(content).digest("hex").slice(0, 8);
}

// 模拟 .tsbuildinfo 里记录的"上次编译各文件指纹"
const lastBuild: Record<string, string> = {
  "a.ts": makeHash("export const a = 1;"),
  "b.ts": makeHash("import { a } from './a'; export const b = a + 1;"),
};

// 当前文件内容
const currentFiles: FileRecord[] = [
  { path: "a.ts", content: "export const a = 1;", hash: "" },
  { path: "b.ts", content: "import { a } from './a'; export const b = a + 2;", hash: "" }, // b 改了
];
currentFiles.forEach((f) => (f.hash = makeHash(f.content)));

console.log("增量编译判定:");
currentFiles.forEach((f) => {
  const changed = lastBuild[f.path] !== f.hash;
  console.log("  " + f.path + ": " + (changed ? "❌ 变化 → 重新编译" : "✅ 未变 → 跳过"));
});
// b.ts 变了，且 b 依赖 a，所以需要重编译 b；a 未变可跳过
console.log("→ 因 b.ts 依赖 a.ts，但 a.ts 未变，所以只重编译 b.ts");

// ---- 7. 四阶段总览可视化 ----
console.log("\\n========== 7. 编译四阶段总览 ==========");
const stages: Array<{ name: string; input: string; output: string; desc: string }> = [
  { name: "1. Parse(解析)", input: "源码字符串", output: "SourceFile(AST)", desc: "Scanner 切 token，Parser 构 AST" },
  { name: "2. Bind(绑定)", input: "AST", output: "符号表 SymbolTable", desc: "建立声明与引用的联系" },
  { name: "3. Check(检查)", input: "AST+符号表", output: "类型诊断", desc: "类型推断与兼容性检查" },
  { name: "4. Emit(发射)", input: "AST", output: ".js/.d.ts/.map", desc: "类型擦除+语法降级+写文件" },
];
stages.forEach((s) => {
  console.log("  " + s.name);
  console.log("    输入: " + s.input + " → 输出: " + s.output);
  console.log("    说明: " + s.desc);
});

console.log("\\n编译流程演示完成！理解这四个阶段，调试编译问题就有的放矢。");`,
  },

  // =========================================================
  // 第三章：字面量类型深入
  // =========================================================
  {
    id: "ts-literal-deep",
    title: "字面量类型深入",
    icon: "🎯",
    group: "基础补充",
    content: `## 字面量类型深入 (Literal Types)

**字面量类型（Literal Type）** 是 TypeScript 类型系统中最精细的工具之一——它把一个**具体的值**当作类型。比如 \`"hello"\` 不只是字符串，它本身就是一个类型；\`42\` 不只是数字，它也是一个类型。字面量类型让 TypeScript 能精确描述"这个变量只能是这几个固定值之一"，是构建状态机、路由系统、配置系统的基石。本章将极其详细地讲解字面量类型的方方面面：字符串/数字/布尔字面量、字面量联合、与枚举的对比、字面量收窄、\`as const\` 断言、在 API 设计中的应用、穷尽检查。

### 什么是字面量类型

在 TypeScript 中，每个**字面量值**都对应一个**字面量类型**：

\`\`\`ts
let x: "hello" = "hello";   // x 只能是字符串 "hello"
let n: 42 = 42;             // n 只能是数字 42
let b: true = true;         // b 只能是布尔 true
\`\`\`

单独使用字面量类型意义不大（一个变量只能取一个值，那直接用 const 就行了），它的威力在于**联合**——把多个字面量组合成"取值集合"：

\`\`\`ts
type Direction = "up" | "down" | "left" | "right";  // 定义类型别名 Direction
type Dice = 1 | 2 | 3 | 4 | 5 | 6;  // 定义类型别名 Dice，联合类型
type Answer = true | false;  // 定义类型别名 Answer，联合类型
\`\`\`

这样 \`Direction\` 类型的变量只能是这四个字符串之一，传别的值会编译报错。这就是字面量联合类型的核心价值——**用类型系统约束取值范围**。

### 字符串字面量类型

最常用的字面量类型。用字符串字面量的联合约束取值：

\`\`\`ts
type Theme = "light" | "dark" | "auto";  // 定义类型别名 Theme
type HttpStatus = "OK" | "Not Found" | "Server Error";  // 定义类型别名 HttpStatus
type ButtonSize = "small" | "medium" | "large";  // 定义类型别名 ButtonSize

function setTheme(t: Theme) { /* ... */ }  // 定义函数 setTheme，参数: t: Theme
setTheme("dark");     // ✅
// setTheme("blue");  // ❌ "blue" 不在 Theme 中
\`\`\`

字符串字面量类型相比 \`string\` 的优势：

1. **编译期捕获拼写错误**：\`setTheme("drak")\` 会立刻报错（拼错了 dark）。
2. **自动补全**：编辑器会列出所有合法值。
3. **自文档化**：类型本身就是取值清单。
4. **重构安全**：删掉一个值，所有引用处立刻报错。

### 数字字面量类型

数字也能作为字面量类型，常用于约束特定数值集合：

\`\`\`ts
type Dice = 1 | 2 | 3 | 4 | 5 | 6;  // 定义类型别名 Dice，联合类型
type Port = 80 | 443 | 8080 | 8443;  // 定义类型别名 Port，联合类型
type ExitCode = 0 | 1 | 2;  // 定义类型别名 ExitCode，联合类型

function roll(): Dice {  // 定义函数 roll，返回 Dice
  return Math.ceil(Math.random() * 6) as Dice; // 注意需断言
}
\`\`\`

数字字面量类型在描述协议、端口、状态码等场景很有用，但不如字符串字面量常用——因为数字的可读性较差（看到 \`2\` 不如看到 \`"error"\` 直观）。

### 布尔字面量类型

\`true\` 和 \`false\` 本身也是类型。布尔字面量类型用得少，因为 \`boolean\` 就是 \`true | false\` 的别名。但在某些场景下精确区分有意义：

\`\`\`ts
interface Config {  // 定义接口 Config
  debug: true;   // 强制为 true
  production: false;
}
\`\`\`

它更常作为 \`as const\` 推断的结果出现。

### 字面量联合类型

字面量类型最常见的用法是与联合类型 \`|\` 结合：

\`\`\`ts
type Status = "idle" | "loading" | "success" | "error";  // 定义类型别名 Status

function render(s: Status): string {  // 定义函数 render，参数: s: Status，返回 string
  switch (s) {  // switch 分支选择
    case "idle": return "等待开始";  // case 匹配分支
    case "loading": return "加载中...";  // case 匹配分支
    case "success": return "完成";  // case 匹配分支
    case "error": return "出错";  // case 匹配分支
  }
}
\`\`\`

\`switch\` 语句里，TypeScript 会根据 \`case\` 标签**自动收窄** \`s\` 的类型，每个分支里 \`s\` 是一个具体的字面量类型。这让分支逻辑既类型安全又简洁。

### 字面量类型与枚举的对比

字面量联合和枚举都能"约束取值集合"，但有关键差异：

| 维度 | 字面量联合 | 枚举 |
| --- | --- | --- |
| **运行时产物** | 无（纯类型，编译后消失） | 有（数值枚举生成对象） |
| **序列化** | 直接是字符串/数字，友好 | 数值枚举序列化成数字，不友好 |
| **可读性** | 值即类型，直观 | 名字→值映射，需查 |
| **反向映射** | 无 | 数值枚举有 |
| **重构重命名** | 需文本替换（IDE 支持） | 改一处全局生效 |
| **跨文件共享** | 需 export type | 需 export enum |
| **与 JSON 互操作** | 完美（值就是字符串） | 数值枚举与 JSON 不直观 |

**社区趋势**：新代码越来越多用**字符串字面量联合**代替字符串枚举，因为序列化友好、运行时零开销。但数值枚举在需要反向映射或"运行时对象"时仍有价值。

### 字面量收窄（Literal Narrowing）

TypeScript 会根据赋值和控制流自动收窄字面量类型：

\`\`\`ts
const x = "hello";   // x 的类型是 "hello"（字面量）
let y = "hello";     // y 的类型是 string（let 可变，宽化）

function f(s: "a" | "b") {  // 定义函数 f，参数: s: "a" | "b"
  if (s === "a") {  // 条件判断
    // 这里 s 被收窄为 "a"
  } else {
    // 这里 s 被收窄为 "b"
  }
}
\`\`\`

收窄规则：

1. **const 声明**：原始类型字面量收窄为字面量类型。
2. **let 声明**：宽化为对应的基础类型（string/number/boolean）。
3. **条件判断**：\`===\`/\`typeof\`/\`in\` 等会收窄。
4. **switch case**：每个分支收窄为对应字面量。

### const 断言 \`as const\`

\`as const\` 让一个值被推断为**最窄的字面量类型**，并把所有属性变 \`readonly\`：

\`\`\`ts
// 不用 as const
const config = { host: "localhost", port: 3000, ssl: false };  // 声明常量 config
// config 类型: { host: string; port: number; ssl: boolean }

// 用 as const
const config2 = { host: "localhost", port: 3000, ssl: false } as const;  // 声明常量 config2（注意：类型断言会绕过类型检查）
// config2 类型: { readonly host: "localhost"; readonly port: 3000; readonly ssl: false }
\`\`\`

\`as const\` 的常见用途：

1. **数组变只读元组**：\`[1, 2, 3] as const\` → \`readonly [1, 2, 3]\`（而不是 \`number[]\`）。
2. **对象属性变字面量**：让对象成为"配置常量"，每个值是字面量类型。
3. **生成字面量联合**：从一个数组推导字面量联合类型：

\`\`\`ts
const DIRECTIONS = ["up", "down", "left", "right"] as const;  // 声明常量 DIRECTIONS（注意：类型断言会绕过类型检查）
type Direction = typeof DIRECTIONS[number]; // "up" | "down" | "left" | "right"
\`\`\`

这个技巧很实用——**一处定义值，同时得到类型**，避免值和类型分离导致不同步。

### 字面量类型在 API 设计中的应用

#### 状态机

字面量联合天然适合描述状态机的状态：

\`\`\`ts
type State = "idle" | "loading" | "success" | "error";  // 定义类型别名 State
type Action = { type: "START" } | { type: "SUCCESS"; data: string } | { type: "FAIL"; error: string };  // 定义类型别名 Action，联合类型

function reducer(state: State, action: Action): State {  // 定义函数 reducer，参数: state: State, action: Action，返回 State
  switch (action.type) {  // switch 分支选择
    case "START": return state === "idle" ? "loading" : state;  // case 匹配分支
    case "SUCCESS": return state === "loading" ? "success" : state;  // case 匹配分支
    case "FAIL": return state === "loading" ? "error" : state;  // case 匹配分支
  }
}
\`\`\`

#### 路由系统

前端路由的路径、HTTP 方法都是固定的字面量集合：

\`\`\`ts
type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";  // 定义类型别名 Method
type Route = "/home" | "/about" | "/users/:id" | "/api/*";  // 定义类型别名 Route

function request(method: Method, route: Route) { /* ... */ }  // 定义函数 request，参数: method: Method, route: Route
request("GET", "/home"); // ✅
// request("GET", "/unknown"); // ❌
\`\`\`

#### 配置系统

配置项的取值往往是有限集合：

\`\`\`ts
type LogLevel = "debug" | "info" | "warn" | "error" | "off";  // 定义类型别名 LogLevel
type Env = "development" | "staging" | "production";  // 定义类型别名 Env

interface AppConfig {  // 定义接口 AppConfig
  env: Env;
  logLevel: LogLevel;
  port: 3000 | 8080 | 9090;
}
\`\`\`

字面量类型让配置项天然带校验——传错值编译期就拦下。

### 字面量类型的穷尽检查

结合 \`never\` 类型，可以确保所有字面量分支都被处理，避免遗漏：

\`\`\`ts
type Status = "idle" | "loading" | "success" | "error";  // 定义类型别名 Status

function assertNever(x: never): never {  // 定义函数 assertNever，参数: x: never，返回 never
  throw new Error("未处理的状态: " + x);  // 抛出 Error 异常
}

function handle(s: Status): string {  // 定义函数 handle，参数: s: Status，返回 string
  switch (s) {  // switch 分支选择
    case "idle": return "等待";  // case 匹配分支
    case "loading": return "加载";  // case 匹配分支
    case "success": return "成功";  // case 匹配分支
    case "error": return "失败";  // case 匹配分支
    default:  // 默认分支
      // 如果未来新增状态但忘了处理，这里 s 不是 never，编译报错
      return assertNever(s);  // 返回 assertNever(s)
  }
}
\`\`\`

这是大型项目维护的利器——新增一个状态后，所有用 \`assertNever\` 的地方都会报错，强制你补全处理。

### 模板字面量类型（Template Literal Types）

TypeScript 4.1 引入了**模板字面量类型**，用反引号语法构造字符串类型：

\`\`\`ts
type Greeting = \`hello \${string}\`;  // 定义类型别名 Greeting
let g: Greeting = "hello world"; // ✅
// let g2: Greeting = "hi world"; // ❌

type HttpMethod = "GET" | "POST";  // 定义类型别名 HttpMethod
type Endpoint = \`/api/\${string}\`;  // 定义类型别名 Endpoint
type Route = \`\${HttpMethod} \${Endpoint}\`; // "GET /api/..." | "POST /api/..."
\`\`\`

模板字面量类型能做非常强大的事，比如把对象类型的所有 key 转成大写：

\`\`\`ts
type UppercaseKeys<T> = { [K in keyof T as Uppercase<string & K>]: T[K] };  // 定义类型别名 UppercaseKeys，泛型参数 T，使用 keyof 取键的联合，映射类型（注意：类型断言会绕过类型检查）
\`\`\`

这是构建类型安全 DSL 的核心工具，本章只点到为止。

### 陷阱与最佳实践

1. **let 会宽化字面量**：\`let x = "a"\` 是 \`string\` 不是 \`"a"\`，要保留字面量用 \`const\` 或 \`as const\`。
2. **字符串枚举序列化问题**：如果数据要存 JSON/发请求，优先用字符串字面量联合而非数值枚举。
3. **避免过度字面量化**：把所有字符串都写成字面量联合会让类型难以维护，只在"取值集合稳定且有限"时用。
4. **配合 \`as const\` 实现"单一数据源"**：值和类型从同一处生成，避免不同步。
5. **穷尽检查用 \`never\`**：保证新增分支不被遗漏。

### 本节代码演示

下面用字面量类型实现三个完整的实战系统：状态机（带 reducer）、类型安全的路由系统、配置系统（含校验）。你会看到字面量类型如何让代码既灵活又安全。`,
    code: `// ============================================================
// 第三章代码演示：字面量类型深入
// ============================================================
// 演示字符串/数字/布尔字面量类型、字面量联合、as const、
// 状态机、路由系统、配置系统、穷尽检查。

// ---- 1. 字面量类型基础 ----
console.log("========== 1. 字面量类型基础 ==========");

// 字符串字面量联合
type Theme = "light" | "dark" | "auto";
// 数字字面量联合
type Dice = 1 | 2 | 3 | 4 | 5 | 6;
// 布尔字面量
type YesNo = true | false;

function applyTheme(theme: Theme): string {
  const map: Record<Theme, string> = {
    light: "☀️ 浅色主题",
    dark: "🌙 深色主题",
    auto: "🖥️ 跟随系统",
  };
  return map[theme];
}

function rollDice(): Dice {
  // 返回 1-6 的随机数，断言为 Dice 类型
  return Math.ceil(Math.random() * 6) as Dice;
}

console.log("主题 light:", applyTheme("light"));
console.log("主题 dark:", applyTheme("dark"));
console.log("主题 auto:", applyTheme("auto"));
console.log("掷骰子:", rollDice(), rollDice(), rollDice());

// ---- 2. as const 与字面量推导 ----
console.log("\\n========== 2. as const 与字面量推导 ==========");

// 不用 as const：属性是宽类型
const colors = ["red", "green", "blue"];
// colors 推断为 string[]

// 用 as const：变成只读元组，元素是字面量
const colorsConst = ["red", "green", "blue"] as const;
// colorsConst 推断为 readonly ["red", "green", "blue"]

// 从数组推导字面量联合类型（单一数据源）
const STATUSES = ["idle", "loading", "success", "error"] as const;
type Status = typeof STATUSES[number]; // "idle" | "loading" | "success" | "error"

console.log("STATUSES 数组:", STATUSES);
// 用推导出的类型
function describeStatus(s: Status): string {
  const labels: Record<Status, string> = {
    idle: "⏸️ 空闲",
    loading: "⏳ 加载中",
    success: "✅ 成功",
    error: "❌ 错误",
  };
  return labels[s];
}

STATUSES.forEach((s) => console.log("  " + s + " → " + describeStatus(s)));

// ---- 3. 完整状态机（reducer 模式）----
console.log("\\n========== 3. 字面量状态机 ==========");

// 状态：字面量联合
type FSMState = "idle" | "loading" | "success" | "error";
// 动作：可辨识联合（每个 action 有 type 字面量标签）
type FSMAction =
  | { type: "START" }
  | { type: "SUCCESS"; data: string }
  | { type: "FAIL"; error: string }
  | { type: "RESET" };

// reducer：根据 action.type 字面量收窄
function reducer(state: FSMState, action: Action): FSMState {
  switch (action.type) {
    case "START":
      // action 收窄为 { type: "START" }
      return state === "idle" ? "loading" : state;
    case "SUCCESS":
      // action 收窄为 { type: "SUCCESS"; data: string }，可访问 data
      console.log("    收到数据:", action.data);
      return state === "loading" ? "success" : state;
    case "FAIL":
      // action 收窄为 { type: "FAIL"; error: string }
      console.log("    错误信息:", action.error);
      return state === "loading" ? "error" : state;
    case "RESET":
      return "idle";
  }
}

// 简化类型别名（上面用 Action，定义为 FSMAction）
type Action = FSMAction;

// 模拟状态机运行
let state: FSMState = "idle";
console.log("初始状态:", state);

state = reducer(state, { type: "START" });
console.log("dispatch START →", state);

state = reducer(state, { type: "SUCCESS", data: "用户数据" });
console.log("dispatch SUCCESS →", state);

state = reducer(state, { type: "RESET" });
console.log("dispatch RESET →", state);

state = reducer(state, { type: "START" });
state = reducer(state, { type: "FAIL", error: "网络超时" });
console.log("dispatch START → FAIL →", state);

// ---- 4. 类型安全的路由系统 ----
console.log("\\n========== 4. 类型安全的路由系统 ==========");

// HTTP 方法字面量联合
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
// 路由路径字面量联合
type Route = "/home" | "/about" | "/users" | "/users/:id" | "/api/data";

// 路由处理函数签名：方法+路径字面量约束
type RouteHandler = (params: Record<string, string>) => string;

// 路由表：键是 "METHOD /path" 模板字面量
const routes: Record<string, RouteHandler> = {
  "GET /home": () => "🏠 首页内容",
  "GET /about": () => "ℹ️ 关于我们",
  "GET /users": () => "📋 用户列表",
  "GET /users/:id": (p) => "👤 用户详情 #" + p.id,
  "POST /api/data": () => "💾 数据已创建",
  "DELETE /users/:id": (p) => "🗑️ 已删除用户 #" + p.id,
};

// 路由匹配（带参数解析）
function dispatch(method: HttpMethod, path: string): string {
  // 把 "/users/123" 之类匹配到 "/users/:id"
  for (const route of Object.keys(routes)) {
    const [rMethod, rPath] = route.split(" ");
    if (rMethod !== method) continue;
    // 把 :id 转成正则
    const paramNames: string[] = [];
    const regexStr = rPath.replace(/:([A-Za-z_]\\w*)/g, (_, name) => {
      paramNames.push(name);
      return "([^/]+)";
    });
    const match = path.match(new RegExp("^" + regexStr + "$"));
    if (match) {
      const params: Record<string, string> = {};
      paramNames.forEach((n, i) => (params[n] = match[i + 1]));
      return "→ " + route + "\\n  " + routes[route](params);
    }
  }
  return "→ 404 未找到路由 " + method + " " + path;
}

console.log(dispatch("GET", "/home"));
console.log(dispatch("GET", "/users"));
console.log(dispatch("GET", "/users/42"));
console.log(dispatch("POST", "/api/data"));
console.log(dispatch("DELETE", "/users/7"));
console.log(dispatch("GET", "/unknown"));

// ---- 5. 配置系统（字面量约束 + 校验）----
console.log("\\n========== 5. 字面量配置系统 ==========");

type Env = "development" | "staging" | "production";
type LogLevel = "debug" | "info" | "warn" | "error" | "off";

interface AppConfig {
  env: Env;
  logLevel: LogLevel;
  port: 3000 | 8080 | 9090;
  features: {
    auth: true | false;        // 布尔字面量
    cache: true | false;
  };
}

// 配置预设（每个值都是合法字面量）
const prodConfig: AppConfig = {
  env: "production",
  logLevel: "error",
  port: 8080,
  features: { auth: true, cache: true },
};

const devConfig: AppConfig = {
  env: "development",
  logLevel: "debug",
  port: 3000,
  features: { auth: false, cache: false },
};

function describeConfig(c: AppConfig): string {
  const lines: string[] = [];
  lines.push("环境: " + c.env);
  lines.push("日志级别: " + c.logLevel);
  lines.push("端口: " + c.port);
  lines.push("认证模块: " + (c.features.auth ? "启用" : "禁用"));
  lines.push("缓存模块: " + (c.features.cache ? "启用" : "禁用"));
  return lines.join("\\n  ");
}

console.log("--- 生产配置 ---");
console.log("  " + describeConfig(prodConfig));
console.log("--- 开发配置 ---");
console.log("  " + describeConfig(devConfig));

// ---- 6. 穷尽检查（never 守卫）----
console.log("\\n========== 6. 穷尽检查 ==========");

type Color = "red" | "green" | "blue";

function assertNever(x: never): never {
  throw new Error("未处理的值: " + x);
}

function toHexCode(c: Color): string {
  switch (c) {
    case "red": return "#ff0000";
    case "green": return "#00ff00";
    case "blue": return "#0000ff";
    default:
      // 如果未来给 Color 新增颜色但忘了在这里加 case，
      // c 就不是 never 类型，编译期就会报错，强制你补全
      return assertNever(c);
  }
}

(["red", "green", "blue"] as Color[]).forEach((c) => {
  console.log("  " + c + " → " + toHexCode(c));
});

// ---- 7. 字面量收窄演示 ----
console.log("\\n========== 7. 字面量收窄 ==========");

// const 推断为字面量
const constStr = "hello"; // 类型: "hello"
// let 宽化为 string
let letStr = "hello"; // 类型: string
console.log("const 推断字面量:", constStr);
console.log("let 宽化为 string:", letStr);

// 条件收窄
type Result = { ok: true; data: string } | { ok: false; error: string };
function handleResult(r: Result): string {
  if (r.ok === true) {
    // r 收窄为 { ok: true; data: string }
    return "✅ " + r.data;
  } else {
    // r 收窄为 { ok: false; error: string }
    return "❌ " + r.error;
  }
}

console.log(handleResult({ ok: true, data: "操作成功" }));
console.log(handleResult({ ok: false, error: "权限不足" }));

// ---- 8. 模板字面量类型预览 ----
console.log("\\n========== 8. 模板字面量类型 ==========");

// 模板字面量类型：构造字符串类型
type Greeting = \`hello \${string}\`;
const g1: Greeting = "hello world";
const g2: Greeting = "hello typescript";
console.log("Greeting 类型示例:", g1, "/", g2);

// 用模板字面量生成事件名类型
type EventName = "click" | "hover";
type Handler = \`on\${Capitalize<EventName>}\`; // "onClick" | "onHover"
const handlers: Record<Handler, () => string> = {
  onClick: () => "点击事件触发",
  onHover: () => "悬停事件触发",
};
console.log("onClick:", handlers.onClick());
console.log("onHover:", handlers.onHover());

console.log("\\n字面量类型演示完成！它是构建精确类型系统的核心工具。");`,
  },

  // =========================================================
  // 第四章：枚举深入
  // =========================================================
  {
    id: "ts-enum-deep",
    title: "枚举深入",
    icon: "🔢",
    group: "基础补充",
    content: `## 枚举深入 (Enum Deep Dive)

**枚举（Enum）** 是 TypeScript 提供的一组命名常量的集合。它让你用友好的名字代替"魔法数字/字符串"，提升代码可读性。但枚举也是 TS 中争议最多的特性之一——它有多种形式（数值/字符串/异构/const），运行时会生成真实对象，与字面量联合有功能重叠。本章将极其详细地拆解枚举的每一种形态、运行时产物、与字面量联合的对比、以及位运算枚举（Flags）实现权限系统的实战。

### 数值枚举（Numeric Enum）

最常见的枚举形式。成员是数字，默认从 0 开始自动递增：

\`\`\`ts
enum Direction {  // 定义枚举 Direction
  Up,      // 0
  Down,    // 1
  Left,    // 2
  Right,   // 3
}
\`\`\`

#### 指定起始值

\`\`\`ts
enum HttpStatus {  // 定义枚举 HttpStatus
  OK = 200,  // 赋值 OK
  Created = 201,  // 赋值 Created
  NotFound = 404,  // 赋值 NotFound
  ServerError = 500,  // 赋值 ServerError
}
\`\`\`

#### 自动递增规则

指定了一个值后，后面的成员会从该值 +1 递增：

\`\`\`ts
enum E {  // 定义枚举 E
  A = 10,  // 赋值 A
  B,    // 11
  C,    // 12
  D = 100,  // 赋值 D
  E,    // 101
}
\`\`\`

#### 反向映射原理

数值枚举在运行时会生成一个**双向映射**的对象：

\`\`\`ts
enum Direction { Up, Down }  // 定义枚举 Direction
// 运行时生成：
const Direction = {  // 声明常量 Direction
  Up: 0,
  Down: 1,
  0: "Up",
  1: "Down",
};
\`\`\`

所以你既可以用名字取数值（\`Direction.Up\` → 0），也可以用数值取名字（\`Direction[0]\` → "Up"）。这在调试日志、把数据库存的数字还原成可读名时很有用。

反向映射的**原理**：编译器在生成枚举对象时，对每个数值成员额外写一条 \`Enum[Enum[name]] = name\` 的赋值。这是数值枚举独有的——字符串枚举没有。

### 字符串枚举（String Enum）

成员是字符串字面量：

\`\`\`ts
enum Color {  // 定义枚举 Color
  Red = "RED",  // 赋值 Red
  Green = "GREEN",  // 赋值 Green
  Blue = "BLUE",  // 赋值 Blue
}
\`\`\`

字符串枚举**没有反向映射**——\`Color["RED"]\` 是 \`undefined\`，不能从值取回名字。运行时生成的对象只有"名字→值"单方向：

\`\`\`ts
const Color = { Red: "RED", Green: "GREEN", Blue: "BLUE" };  // 声明常量 Color
\`\`\`

字符串枚举的优势：

1. **序列化友好**：\`JSON.stringify(Color.Red)\` 得到 \`"RED"\`，可读；数值枚举序列化成数字后意义不明。
2. **调试友好**：日志里看到 \`"RED"\` 比 \`0\` 直观。
3. **与 API/数据库互操作好**：很多 API 用字符串表示状态，字符串枚举天然契合。

劣势：没有反向映射；占用空间稍大（字符串比数字）。

### 异构枚举（Heterogeneous Enum）

数值和字符串混用：

\`\`\`ts
enum Mixed {  // 定义枚举 Mixed
  No = 0,  // 赋值 No
  Yes = "YES",  // 赋值 Yes
}
\`\`\`

**不推荐使用**——容易引起混淆，且反向映射行为不一致（数值有、字符串无）。一般只在迁移历史代码时遇到，新代码应避免。

### const enum

\`const enum\` 是一种特殊枚举，编译时会被**完全内联**成具体值，不生成枚举对象：

\`\`\`ts
const enum Direction { Up, Down }
const d = Direction.Up;  // 声明常量 d
// 编译后直接变成：
// const d = 0;
\`\`\`

**优点**：零运行时开销、产物体积更小。
**陷阱：isolatedModules 模式**：在 \`isolatedModules: true\`（Babel/esbuild/swc 等单文件转译器要求的模式）下，\`const enum\` **无法被内联**——因为单文件转译器看不到其他文件的 \`const enum\` 定义。TypeScript 5.0+ 在这种模式下会把 \`const enum\` 当作**普通枚举**处理（生成对象）。所以本教程的运行环境里，\`const enum\` 的行为和普通枚举一致。

社区对 \`const enum\` 的态度逐渐分化：为了兼容性，越来越多项目**避免使用 const enum**，改用字符串字面量联合 + \`as const\` 数组的方式。

### 计算成员枚举

枚举成员的值可以是**计算表达式**：

\`\`\`ts
enum FileAccess {  // 定义枚举 FileAccess
  None = 0,  // 赋值 None
  Read = 1 << 1,        // 2，位运算
  Write = 1 << 2,       // 4
  Execute = 1 << 3,     // 8
  All = Read | Write | Execute, // 14，组合
}
\`\`\`

计算成员枚举常用于**位运算权限系统**（见下文）。注意：计算成员没有反向映射（因为运行时才能算出值）。

### 枚举与字面量联合的对比

两者都能"约束取值集合"，但有关键差异：

| 维度 | enum | 字面量联合 |
| --- | --- | --- |
| **运行时产物** | 生成真实对象 | 无（纯类型） |
| **反向映射** | 数值枚举有 | 无 |
| **序列化** | 数值→数字（不直观）；字符串→字符串 | 直接是字面量值 |
| **重命名重构** | 改一处，全局生效 | 文本替换（IDE 支持但稍弱） |
| **跨文件共享** | export enum | export type |
| **可迭代** | 是（Object.keys/entries） | 否（类型无运行时） |
| **tree-shaking** | 较差（生成对象） | 好（无运行时） |
| **学习成本** | 需理解几种形式 | 直观 |
| **isolatedModules 兼容** | 普通枚举兼容；const enum 有问题 | 完全兼容 |

**选择建议**：

- 需要**运行时对象**（迭代、反向映射、动态查找）→ 用数值枚举或字符串枚举。
- 需要**位运算权限**→ 用数值枚举（计算成员）。
- 只需要**类型约束 + 序列化友好**→ 用字符串字面量联合。
- 跨工具链兼容性要求高（esbuild/swc/Babel）→ 避免用 const enum。

### 位运算枚举（Flags Enum）实现权限系统

这是数值枚举的经典应用。原理：每个权限对应一个**独立的二进制位**，用位运算组合/检查：

\`\`\`ts
enum Permission {  // 定义枚举 Permission
  None = 0,  // 赋值 None
  Read = 1 << 0,      // 0001 = 1
  Write = 1 << 1,     // 0010 = 2
  Delete = 1 << 2,    // 0100 = 4
  Share = 1 << 3,     // 1000 = 8
  All = Read | Write | Delete | Share, // 1111 = 15
}
\`\`\`

操作：

- **组合权限**：\`perm = Permission.Read | Permission.Write\`（位或）。
- **检查权限**：\`(perm & Permission.Read) !== 0\`（位与）。
- **添加权限**：\`perm |= Permission.Delete\`。
- **移除权限**：\`perm &= ~Permission.Delete\`。

位运算权限系统的优势：一个数字就能表示多种权限组合，存储紧凑（数据库一个 int 字段即可），查询高效（位与运算）。

### 枚举的运行时产物

不同枚举编译后的 JS：

\`\`\`ts
// 数值枚举
enum Num { A, B }  // 定义枚举 Num
// →
var Num;
(function (Num) {
  Num[Num["A"] = 0] = "A";
  Num[Num["B"] = 1] = "B";
})(Num || (Num = {}));

// 字符串枚举
enum Str { A = "a", B = "b" }  // 定义枚举 Str
// →
var Str;
(function (Str) {
  Str["A"] = "a";
  Str["B"] = "b";
})(Str || (Str = {}));

// const enum（非 isolatedModules）
const enum CE { A, B }
const x = CE.A;  // 声明常量 x
// → const x = 0;  （完全内联，无对象）
\`\`\`

数值枚举用 \`Num[Num["A"] = 0] = "A"\` 这种双赋值实现反向映射——先 \`Num["A"] = 0\`（名字→值），整体表达式返回 0，再 \`Num[0] = "A"\`（值→名字）。这是个巧妙的技巧。

### 陷阱与最佳实践

1. **不要用 const enum 跨文件**（除非确定不用 isolatedModules）：会被降级为普通枚举。
2. **避免异构枚举**：数值字符串混用易出 bug。
3. **数值枚举的"宽松"陷阱**：\`enum E { A = 1 }\` 时，\`let x: E = 2\` **居然不报错**——因为数值枚举类型对任意 number 都开放（历史原因）。可以用 \`[number]: string\` 索引检查规避。字符串枚举没这个问题。
4. **序列化考虑**：要存 JSON 的状态优先用字符串枚举或字面量联合。
5. **位运算用数值枚举**：权限系统、配置开关等用位运算枚举最自然。
6. **新项目考虑"无 enum"路线**：很多团队用 \`as const\` 对象 + 字面量联合代替 enum，运行时更干净。

### 本节代码演示

下面实现三个实战：位运算权限系统（Flags Enum）、HTTP 状态码枚举、对比枚举与字面量联合的运行时行为差异（反向映射、序列化、迭代）。`,
    code: `// ============================================================
// 第四章代码演示：枚举深入
// ============================================================
// 演示数值/字符串枚举、反向映射、const enum（isolatedModules
// 下当普通枚举）、位运算权限系统、枚举与字面量联合的对比。

// ---- 1. 数值枚举与反向映射 ----
console.log("========== 1. 数值枚举与反向映射 ==========");

enum Direction {
  Up,      // 0
  Down,    // 1
  Left,    // 2
  Right,   // 3
}

console.log("Direction.Up =", Direction.Up);
console.log("Direction.Down =", Direction.Down);
// 反向映射：数值 → 名字
console.log("Direction[0] =", Direction[0]);
console.log("Direction[3] =", Direction[3]);
// 运行时枚举对象长什么样
console.log("Direction 对象:", Direction);
// 注意：既有名字→值，也有值→名字（双向）

// 指定起始值 + 自动递增
enum HttpStatus {
  OK = 200,
  Created = 201,
  NotFound = 404,
  ServerError = 500,
}
console.log("\\nHttpStatus.OK =", HttpStatus.OK);
console.log("HttpStatus[404] =", HttpStatus[404]);

// ---- 2. 字符串枚举（无反向映射）----
console.log("\\n========== 2. 字符串枚举 ==========");

enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}

console.log("Color.Red =", Color.Red);
console.log("Color.Green =", Color.Green);
// 字符串枚举没有反向映射
console.log("Color['RED'] =", Color["RED"], "（字符串枚举无反向映射，得到 undefined）");
console.log("Color 对象:", Color);
// 注意：只有名字→值，没有值→名字

// ---- 3. const enum（isolatedModules 下当普通枚举）----
console.log("\\n========== 3. const enum ==========");

const enum Status {
  Active = 1,
  Inactive = 2,
  Pending = 3,
}
// 在 isolatedModules 模式下，const enum 被当作普通枚举处理
// （生成对象，而非内联为字面量）
const currentStatus: Status = Status.Active;
console.log("const enum Status.Active =", currentStatus);
console.log("（在 isolatedModules 下，const enum 行为同普通枚举，生成对象）");
// 这里能访问 Status 对象，说明它没被内联
console.log("Status 对象是否存在:", typeof Status !== "undefined" ? "是" : "否");

// ---- 4. 计算成员枚举 ----
console.log("\\n========== 4. 计算成员枚举 ==========");

enum BitFlags {
  None = 0,
  Bit0 = 1 << 0,    // 1
  Bit1 = 1 << 1,    // 2
  Bit2 = 1 << 2,    // 4
  Bit3 = 1 << 3,    // 8
  All = (1 << 4) - 1, // 15
}
console.log("BitFlags.None =", BitFlags.None);
console.log("BitFlags.Bit0 =", BitFlags.Bit0);
console.log("BitFlags.Bit1 =", BitFlags.Bit1);
console.log("BitFlags.Bit2 =", BitFlags.Bit2);
console.log("BitFlags.Bit3 =", BitFlags.Bit3);
console.log("BitFlags.All =", BitFlags.All);
// 计算成员没有反向映射
console.log("BitFlags[1] =", BitFlags[1], "（计算成员可能有反向映射，看是否是字面量）");

// ---- 5. 位运算权限系统（Flags Enum）----
console.log("\\n========== 5. 位运算权限系统 ==========");

enum Permission {
  None = 0,
  Read = 1 << 0,      // 0001 = 1
  Write = 1 << 1,     // 0010 = 2
  Delete = 1 << 2,    // 0100 = 4
  Share = 1 << 3,     // 1000 = 8
  All = (1 << 4) - 1, // 1111 = 15
}

// 工具函数：检查权限
function hasPermission(perm: Permission, check: Permission): boolean {
  // 位与：如果结果非 0，说明有该权限
  return (perm & check) === check;
}

// 工具函数：添加权限
function addPermission(perm: Permission, add: Permission): Permission {
  return (perm | add) as Permission;
}

// 工具函数：移除权限
function removePermission(perm: Permission, remove: Permission): Permission {
  // 位与 + 取反：清除对应位
  return (perm & ~remove) as Permission;
}

// 工具函数：权限转可读名
function permissionNames(perm: Permission): string[] {
  const names: string[] = [];
  if (perm & Permission.Read) names.push("读");
  if (perm & Permission.Write) names.push("写");
  if (perm & Permission.Delete) names.push("删");
  if (perm & Permission.Share) names.push("分享");
  return names.length ? names : ["无权限"];
}

// 演示：用户权限管理
let userPerm: Permission = Permission.None;
console.log("初始权限:", permissionNames(userPerm).join("+"), "（值 =", userPerm + "）");

userPerm = addPermission(userPerm, Permission.Read);
console.log("加读权限:", permissionNames(userPerm).join("+"), "（值 =", userPerm + "）");

userPerm = addPermission(userPerm, Permission.Write | Permission.Share);
console.log("加写+分享:", permissionNames(userPerm).join("+"), "（值 =", userPerm + "）");

console.log("有读权限?", hasPermission(userPerm, Permission.Read));
console.log("有删权限?", hasPermission(userPerm, Permission.Delete));

userPerm = removePermission(userPerm, Permission.Write);
console.log("移除写后:", permissionNames(userPerm).join("+"), "（值 =", userPerm + "）");

// 管理员：全部权限
let adminPerm: Permission = Permission.All;
console.log("管理员权限:", permissionNames(adminPerm).join("+"), "（值 =", adminPerm + "）");

// 二进制视图帮助理解
console.log("\\n二进制视图:");
console.log("  Read    =", Permission.Read.toString(2).padStart(4, "0"));
console.log("  Write   =", Permission.Write.toString(2).padStart(4, "0"));
console.log("  Delete  =", Permission.Delete.toString(2).padStart(4, "0"));
console.log("  Share   =", Permission.Share.toString(2).padStart(4, "0"));
console.log("  All     =", Permission.All.toString(2).padStart(4, "0"));
console.log("  userPerm=", userPerm.toString(2).padStart(4, "0"));

// ---- 6. HTTP 状态码枚举实战 ----
console.log("\\n========== 6. HTTP 状态码枚举 ==========");

enum HttpStatusCode {
  // 2xx 成功
  OK = 200,
  Created = 201,
  NoContent = 204,
  // 3xx 重定向
  MovedPermanently = 301,
  NotModified = 304,
  // 4xx 客户端错误
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  // 5xx 服务端错误
  InternalServerError = 500,
  BadGateway = 502,
  ServiceUnavailable = 503,
}

function describeStatus(code: HttpStatusCode): string {
  // 利用反向映射拿到名字
  const name = HttpStatusCode[code] || "Unknown";
  if (code >= 200 && code < 300) return "✅ " + name + "(" + code + "): 成功";
  if (code >= 300 && code < 400) return "↪️ " + name + "(" + code + "): 重定向";
  if (code >= 400 && code < 500) return "⚠️ " + name + "(" + code + "): 客户端错误";
  if (code >= 500) return "🔥 " + name + "(" + code + "): 服务端错误";
  return "❓ " + name + "(" + code + "): 未知";
}

const codes: HttpStatusCode[] = [
  HttpStatusCode.OK,
  HttpStatusCode.Created,
  HttpStatusCode.MovedPermanently,
  HttpStatusCode.BadRequest,
  HttpStatusCode.Unauthorized,
  HttpStatusCode.NotFound,
  HttpStatusCode.InternalServerError,
  HttpStatusCode.BadGateway,
];
codes.forEach((c) => console.log("  " + describeStatus(c)));

// 迭代枚举（数值枚举可迭代，注意过滤反向映射项）
console.log("\\n迭代 HttpStatusCode（只取数值键）:");
(Object.keys(HttpStatusCode) as unknown as string[])
  .filter((k) => typeof HttpStatusCode[k as unknown as HttpStatusCode] === "number")
  .forEach((k) => {
    const v = HttpStatusCode[k as unknown as HttpStatusCode];
    console.log("  " + k + " = " + v);
  });

// ---- 7. 枚举 vs 字面量联合：运行时对比 ----
console.log("\\n========== 7. 枚举 vs 字面量联合 ==========");

// 枚举版本
enum StateEnum {
  Idle = "IDLE",
  Loading = "LOADING",
  Success = "SUCCESS",
  Error = "ERROR",
}

// 字面量联合版本（无运行时产物）
type StateLiteral = "IDLE" | "LOADING" | "SUCCESS" | "ERROR";

// 对比 1：运行时产物
console.log("对比 1: 运行时产物");
console.log("  StateEnum 是真实对象:", typeof StateEnum, "→", JSON.stringify(StateEnum));
console.log("  StateLiteral 运行时不存在（纯类型）");

// 对比 2：序列化
console.log("\\n对比 2: 序列化（JSON.stringify）");
const enumState = StateEnum.Loading;
const literalState: StateLiteral = "LOADING";
console.log("  enum 序列化:", JSON.stringify({ state: enumState }));
console.log("  字面量序列化:", JSON.stringify({ state: literalState }));
console.log("  → 两者序列化结果一致（都是字符串值）");

// 对比 3：迭代能力
console.log("\\n对比 3: 迭代能力");
console.log("  enum 可迭代:");
Object.keys(StateEnum).forEach((k) => console.log("    " + k + " = " + StateEnum[k as unknown as keyof typeof StateEnum]));
console.log("  字面量联合不可迭代（运行时无对象）");
// 要迭代字面量联合，需配合 as const 数组
const STATE_VALUES = ["IDLE", "LOADING", "SUCCESS", "ERROR"] as const;
console.log("  但可用 as const 数组辅助迭代:");
STATE_VALUES.forEach((s) => console.log("    " + s));

// 对比 4：从值查名字
console.log("\\n对比 4: 从值反查名字");
console.log("  enum 字符串枚举无反向映射: StateEnum['LOADING'] =", StateEnum["LOADING" as unknown as keyof typeof StateEnum]);
// 字面量联合要自己维护映射表
const stateNames: Record<StateLiteral, string> = {
  IDLE: "Idle",
  LOADING: "Loading",
  SUCCESS: "Success",
  ERROR: "Error",
};
console.log("  字面量需自建映射表: stateNames['LOADING'] =", stateNames["LOADING"]);

// ---- 8. 异构枚举（不推荐，仅演示）----
console.log("\\n========== 8. 异构枚举（不推荐）==========");

enum MixedResult {
  No = 0,
  Yes = "YES",
}
console.log("MixedResult.No =", MixedResult.No, "（数值，有反向映射）");
console.log("MixedResult.Yes =", MixedResult.Yes, "（字符串，无反向映射）");
console.log("MixedResult[0] =", MixedResult[0], "（数值能反查名字）");
console.log("MixedResult['YES'] =", MixedResult["YES" as unknown as keyof typeof MixedResult], "（字符串不能反查）");
console.log("→ 异构枚举行为不一致，新代码应避免");

console.log("\\n枚举演示完成！理解每种枚举的运行时行为是关键。");`,
  },

  // =========================================================
  // 第五章：元组深入
  // =========================================================
  {
    id: "ts-tuple-deep",
    title: "元组深入",
    icon: "📋",
    group: "基础补充",
    content: `## 元组深入 (Tuple Deep Dive)

**元组（Tuple）** 是 TypeScript 中一种特殊的数组类型——它**已知长度**，且**每个位置的类型可以不同**。普通数组所有元素类型相同（\`number[]\`），而元组能精确描述"第一个是 string、第二个是 number、第三个是 boolean"这样的固定结构。元组在函数多返回值、CSV 行解析、React \`useState\` 返回值等场景极为常用。本章将极其详细地讲解元组的方方面面：定义、与数组的区别、标签元组、展开、只读元组、rest 参数、变长元组、解构。

### 元组定义

元组用 \`[Type1, Type2, ...]\` 语法定义：

\`\`\`ts
let pair: [string, number] = ["张三", 28];  // 声明变量 pair，类型 [string, number]
let triple: [string, number, boolean] = ["李四", 30, true];  // 声明变量 triple，类型 [string, number, boolean]
\`\`\`

元组本质是数组，但 TypeScript 在编译期会检查：

1. **长度**：赋值时元素个数必须匹配。
2. **每个位置的类型**：第 0 个必须是 string，第 1 个必须是 number，等等。

### 元组与数组的区别

| 维度 | 数组 \`T[]\` | 元组 \`[A, B, C]\` |
| --- | --- | --- |
| **长度** | 任意 | 固定（已知） |
| **元素类型** | 全部相同 | 每个位置可不同 |
| **索引访问类型** | \`T\` | 按位置不同 |
| **push/pop** | 类型安全 | 历史上有漏洞（见陷阱） |
| **典型场景** | 列表/集合 | 固定结构的多返回值 |

\`\`\`ts
let arr: number[] = [1, 2, 3];      // 任意长度，全 number
let tup: [number, string] = [1, "a"]; // 恰好 2 个，位置类型固定
arr.push(4);                          // ✅
// tup.push(3);                       // 严格模式下报错（长度固定）
\`\`\`

### 元组的长度与类型

元组类型不仅约束元素类型，还约束**长度**：

\`\`\`ts
let t: [string, number];
t = ["a", 1];      // ✅ 长度 2，类型匹配
// t = ["a"];      // ❌ 长度不够
// t = ["a", 1, 2]; // ❌ 长度超出
// t = [1, "a"];   // ❌ 位置类型不匹配
\`\`\`

访问越界元素在严格模式下会报错：

\`\`\`ts
let t: [string, number] = ["a", 1];  // 声明变量 t，类型 [string, number]
t[0];  // string
t[1];  // number
// t[2]; // ❌ 严格模式下：没有索引 2 的元素
\`\`\`

### 标签元组（Labeled Tuples）

TypeScript 4.0 引入了**标签元组**——给每个位置起个名字，提升可读性：

\`\`\`ts
// 无标签：看不出每个位置代表什么
function f(): [string, number, boolean] { /* ... */ }  // 定义函数 f，返回 [string, number, boolean]

// 有标签：清晰知道每个位置的含义
function getUserInfo(): [name: string, age: number, isActive: boolean] {  // 定义函数 getUserInfo，返回 [name: string, age: number, isActive: boolean]
  return ["张三", 28, true];  // 返回 ["张三", 28, true]
}
\`\`\`

标签不影响类型检查（\`[name: string, age: number]\` 和 \`[string, number]\` 类型相同），但极大提升代码可读性，尤其在函数返回多值时。**强烈建议所有元组都加标签**。

### 元组展开（Spread）

元组可以用 \`...\` 展开，展开后还是元组：

\`\`\`ts
type A = [string, number];  // 定义类型别名 A
type B = [boolean, ...A]; // [boolean, string, number]
type C = [...A, ...B];    // [string, number, boolean, string, number]
\`\`\`

元组展开让组合元组类型变得灵活，是变长元组的基础。

### 只读元组

\`\`\`ts
let ro: readonly [string, number] = ["a", 1];  // 声明变量 ro，类型 readonly [string, number]
// ro[0] = "b"; // ❌ 只读
// ro.push("c"); // ❌ 只读
\`\`\`

只读元组用 \`readonly\` 修饰，或等价的 \`Readonly<[string, number]>\`。\`as const\` 也会产生只读元组：

\`\`\`ts
const t = [1, "a"] as const; // readonly [1, "a"]
\`\`\`

只读元组能防止意外修改，是函数式编程和不可变数据的首选。

### 元组与 rest 参数

元组与函数的 rest 参数天然契合。用元组类型约束 rest 参数，能让"可变参数函数"获得精确类型：

\`\`\`ts
function f(...args: [string, number]): void {  // 定义函数 f，参数: ...args: [string, number]，返回 void
  args[0]; // string
  args[1]; // number
}
f("a", 1);     // ✅
// f("a");     // ❌
// f("a", 1, 2); // ❌
\`\`\`

这等价于 \`function f(a: string, b: number): void\`。元组类型的 rest 参数让"参数列表即元组"成为可能。

更强大的是 \`infer\` + 元组推断，能让函数根据元组类型生成参数列表，这是类型工具库（如 \`ts-toolbelt\`）的基础。

### 元组在函数参数中的应用：\`call\` 类型安全

\`\`\`ts
function call<T extends unknown[], R>(fn: (...args: T) => R, ...args: T): R {  // 定义函数 call，泛型 T extends unknown[], R，参数: fn: (...args: T
  return fn(...args);  // 返回 fn(...args)
}
call((a: string, b: number) => a + b, "x", 1); // ✅
// call((a: string, b: number) => a + b, "x");  // ❌ 参数不够
// call((a: string, b: number) => a + b, 1, 1); // ❌ 类型不对
\`\`\`

这里 \`T extends unknown[]\` 约束 \`T\` 为元组类型，让 \`args\` 和 \`fn\` 的参数列表类型绑定——这是类型安全的"函数调用器"。

### 元组与解构

元组解构按位置取值，每个变量的类型对应元组位置的类型：

\`\`\`ts
const t: [name: string, age: number] = ["张三", 28];  // 声明常量 t，类型 [name: string, age: number]
const [name, age] = t; // name: string, age: number
\`\`\`

元组解构比对象解构更简洁（不用写属性名），代价是依赖位置（可读性稍差）。在固定结构（如 \`useState\` 返回值）中很常用。

### 变长元组（Variadic Tuples）

TypeScript 4.0 引入变长元组——允许用泛型 \`...\` 展开未知元组：

\`\`\`ts
type Tail<T extends unknown[]> = T extends [unknown, ...infer Rest] ? Rest : never;  // 定义类型别名 Tail，泛型参数 T extends unknown[]，使用 infer 在条件类型中提取类型
type R = Tail<[string, number, boolean]>; // [number, boolean]

type Concat<A extends unknown[], B extends unknown[]> = [...A, ...B];  // 定义类型别名 Concat，泛型参数 A extends unknown[], B extends unknown[]
type C = Concat<[string], [number, boolean]>; // [string, number, boolean]
\`\`\`

变长元组让类型级编程能"操作元组本身"，是实现类型工具（\`Partial\` 元组版、元组 \`filter\`、元组 \`reverse\` 等）的基础。\`infer\` 关键字在这里大显身手。

### 元组推导

从已有元组派生新元组类型：

\`\`\`ts
// 把元组每个位置变成可选
type PartialTuple<T extends unknown[]> = {  // 定义类型别名 PartialTuple，泛型参数 T extends unknown[]
  [K in keyof T]: T[K] | undefined;
};

// 元组反转
type Reverse<T extends unknown[]> =
  T extends [infer Head, ...infer Rest] ? [...Reverse<Rest>, Head] : [];
\`\`\`

这是类型级元编程，本章只点到为止。

### 元组的运行时行为

元组在运行时**就是普通数组**——TypeScript 不生成任何特殊代码。类型检查只在编译期：

\`\`\`ts
let t: [string, number] = ["a", 1];  // 声明变量 t，类型 [string, number]
// 运行时 t 就是 ["a", 1]，一个普通数组
t.length; // 2
t[0];     // "a"
\`\`\`

所以元组的"长度固定"等约束是**编译期幻觉**——运行时你可以用任何 JS 手段绕过（\`(t as any).push(2)\`）。但只要遵守类型系统，编译期保护已经足够。

### 陷阱与最佳实践

1. **push 漏洞（历史）**：旧版 TS 允许对元组 \`push\`，绕过长度检查。新版本严格模式下已修复，但读老代码要注意。
2. **可读性**：无标签元组 \`[string, number, boolean]\` 可读性差，**总是加标签**。
3. **多返回值优先用元组**：当函数返回 2-3 个相关值时，元组比对象更简洁；超过 3 个或字段含义模糊时用对象。
4. **只读元组更安全**：默认加 \`readonly\`，需要修改时再去掉。
5. **rest 参数配元组**：让可变参数函数获得精确类型。
6. **CSV/行数据用元组**：每行列数固定、类型已知时，元组比对象数组更轻量。

### 本节代码演示

下面实现三个实战：类型安全的 \`useState\`（返回 \`[value, setter]\` 元组）、CSV 行解析为元组、元组解构与展开演示。`,
    code: `// ============================================================
// 第五章代码演示：元组深入
// ============================================================
// 演示元组定义、标签元组、只读元组、解构、展开、
// 类型安全 useState、CSV 行解析、变长元组概念。

// ---- 1. 元组基础 ----
console.log("========== 1. 元组基础 ==========");

// 无标签元组
let pair: [string, number] = ["张三", 28];
console.log("无标签元组:", pair);
console.log("  [0] 姓名:", pair[0], "（string）");
console.log("  [1] 年龄:", pair[1], "（number）");

// 标签元组（推荐，可读性更好）
let userInfo: [name: string, age: number, isActive: boolean] = ["李四", 30, true];
console.log("\\n标签元组:", userInfo);
console.log("  标签让每个位置含义清晰");

// 元组 vs 数组
let arr: number[] = [1, 2, 3, 4, 5];        // 任意长度
let tup: [string, number, boolean] = ["a", 1, true]; // 固定长度
console.log("\\n数组 number[]:", arr, "（任意长度）");
console.log("元组:", tup, "（固定 3 个元素）");

// ---- 2. 元组解构 ----
console.log("\\n========== 2. 元组解构 ==========");

const coord: [x: number, y: number, z: number] = [10, 20, 30];
// 按位置解构
const [x, y, z] = coord;
console.log("解构 [x, y, z] =", x, y, z);

// 忽略某些位置
const [first, , third] = coord;
console.log("忽略中间: [first, , third] =", first, third);

// rest 解构剩余
const [head, ...rest] = coord;
console.log("rest 解构: head =", head, "rest =", rest);

// 交换两个变量（经典用法）
let a: number = 1;
let b: number = 2;
[a, b] = [b, a];
console.log("交换后: a =", a, "b =", b);

// ---- 3. 只读元组 ----
console.log("\\n========== 3. 只读元组 ==========");

let ro: readonly [string, number] = ["只读", 100];
console.log("只读元组:", ro);
// ro[0] = "改";   // ❌ 编译错误：只读
// ro.push("x");  // ❌ 编译错误：只读
console.log("→ 只读元组不能修改元素和长度（编译期保护）");

// as const 产生只读字面量元组
const frozen = [1, "a", true] as const;
// frozen 的类型是 readonly [1, "a", true]
console.log("as const 元组:", frozen, "（每个位置都是字面量类型 + 只读）");
// frozen[0] = 2; // ❌ 只读

// ---- 4. 类型安全 useState（返回元组）----
console.log("\\n========== 4. 类型安全 useState ==========");

// React useState 的简化实现：返回 [当前值, setter函数] 元组
// 用元组而非对象，是因为解构简洁：const [count, setCount] = useState(0)

// 简易 useState 工厂
function useState<T>(initial: T): [T, (newValue: T) => void] {
  let value: T = initial;
  const setter = (newValue: T): void => {
    value = newValue;
    console.log("    setState: " + JSON.stringify(value));
  };
  // 返回元组 [当前值, setter]
  return [value, setter];
}

// 使用：解构出 count 和 setCount
const [count, setCount] = useState(0);
console.log("初始 count:", count);
setCount(10);
// 注意：这里演示元组返回，简化版未真正更新外部 count（真实 React 有重渲染机制）

const [name, setName] = useState("张三");
console.log("初始 name:", name);
setName("李四");

// 多种类型的状态
const [items, setItems] = useState<string[]>(["a", "b"]);
console.log("初始 items:", items);
setItems(["x", "y", "z"]);

console.log("→ useState 用元组返回 [value, setter]，解构语法简洁");

// ---- 5. CSV 行解析为元组 ----
console.log("\\n========== 5. CSV 行解析为元组 ==========");

// 定义 CSV 行的元组类型（每列类型已知）
type UserRow = [id: number, name: string, age: number, email: string];

// 解析一行 CSV 字符串为元组
function parseUserRow(line: string): UserRow {
  const fields = line.split(",");
  if (fields.length !== 4) {
    throw new Error("CSV 行必须有 4 列: " + line);
  }
  return [
    parseInt(fields[0], 10),  // id: number
    fields[1].trim(),         // name: string
    parseInt(fields[2], 10),  // age: number
    fields[3].trim(),         // email: string
  ];
}

// 格式化元组为可读字符串（用解构）
function formatUserRow(row: UserRow): string {
  const [id, name, age, email] = row;
  return "用户#" + id + " " + name + "（" + age + "岁）邮箱: " + email;
}

const csvLines = [
  "1,张三,28,zhangsan@example.com",
  "2,李四,35,lisi@example.com",
  "3,王五,22,wangwu@example.com",
];

console.log("解析 CSV 行为元组:");
csvLines.forEach((line) => {
  const row = parseUserRow(line);
  console.log("  " + formatUserRow(row));
  console.log("    元组类型: [id, name, age, email] =", JSON.stringify(row));
});

// ---- 6. 元组展开（Spread）----
console.log("\\n========== 6. 元组展开 ==========");

const part1: [string, number] = ["hello", 42];
const part2: [boolean, ...typeof part1] = [true, ...part1];
console.log("展开组合元组:", part2);

// 元组拼接
function concatTuples<A extends unknown[], B extends unknown[]>(
  a: [...A], b: [...B]
): [...A, ...B] {
  return [...a, ...b] as [...A, ...B];
}

const t1 = ["a", 1] as const;
const t2 = ["b", 2] as const;
const combined = concatTuples([10, 20], [30, 40, 50]);
console.log("concatTuples([10,20], [30,40,50]):", combined);

// ---- 7. 元组与 rest 参数 ----
console.log("\\n========== 7. 元组与 rest 参数 ==========");

// 用元组类型约束 rest 参数，获得精确的可变参数类型
function logTuple(...args: [message: string, level: number, timestamp: string]): void {
  const [message, level, timestamp] = args;
  const levelStr = level === 0 ? "INFO" : level === 1 ? "WARN" : "ERROR";
  console.log("  [" + timestamp + "] " + levelStr + ": " + message);
}

logTuple("系统启动", 0, "2024-01-01 08:00");
logTuple("磁盘空间不足", 1, "2024-01-01 09:00");
logTuple("服务崩溃", 2, "2024-01-01 10:00");

// 类型安全的函数调用器
function callFn<T extends unknown[], R>(fn: (...args: T) => R, ...args: T): R {
  return fn(...args);
}

const result1 = callFn((a: string, b: number) => a.repeat(b), "Hi", 3);
console.log("callFn 重复字符串:", result1);

const result2 = callFn((a: number, b: number, c: number) => a + b + c, 10, 20, 30);
console.log("callFn 三数求和:", result2);

// ---- 8. 变长元组概念演示（运行时模拟）----
console.log("\\n========== 8. 变长元组概念（运行时模拟）==========");

// 类型级的 Tail/Reverse 在运行时无法直接演示（纯类型操作）
// 但我们可以用运行时函数模拟对应行为

// 模拟 Tail<T>：去掉元组第一个元素
function tail<T extends unknown[]>(tuple: [unknown, ...T]): T {
  const [, ...rest] = tuple;
  return rest as T;
}
console.log("tail([1, 'a', true]):", tail([1, "a", true]));
console.log("tail(['x', 10, 20, 30]):", tail(["x", 10, 20, 30]));

// 模拟 Reverse<T>：反转元组
function reverse<T extends unknown[]>(tuple: [...T]): unknown[] {
  return [...tuple].reverse();
}
console.log("reverse([1, 2, 3]):", reverse([1, 2, 3]));
console.log("reverse(['a', 'b', 'c', 'd']):", reverse(["a", "b", "c", "d"]));

// 模拟元组 map：对每个元素应用函数
function mapTuple<T extends unknown[], R>(
  tuple: [...T],
  fn: (item: T[number], index: number) => R
): R[] {
  return tuple.map(fn);
}
console.log("mapTuple([1, 2, 3], x => x * 10):", mapTuple([1, 2, 3], (x) => x * 10));

// ---- 9. 元组作为函数多返回值 ----
console.log("\\n========== 9. 元组多返回值 ==========");

// 函数返回多个相关值，用元组比对象更简洁
function minMax(numbers: number[]): [min: number, max: number, avg: number] {
  let min = numbers[0];
  let max = numbers[0];
  let sum = 0;
  for (const n of numbers) {
    if (n < min) min = n;
    if (n > max) max = n;
    sum += n;
  }
  return [min, max, sum / numbers.length];
}

const stats = minMax([3, 1, 4, 1, 5, 9, 2, 6]);
const [min, max, avg] = stats;
console.log("minMax([3,1,4,1,5,9,2,6]):");
console.log("  最小值:", min);
console.log("  最大值:", max);
console.log("  平均值:", avg.toFixed(2));

// 对比：如果用对象返回，代码更长
// return { min, max, avg };
// const { min, max, avg } = minMax(...);  // 也要写字段名

console.log("→ 元组多返回值 + 解构，比对象更简洁");

// ---- 10. 元组陷阱演示 ----
console.log("\\n========== 10. 元组陷阱 ==========");

console.log("陷阱 1: 无标签元组可读性差");
const bad: [string, number, boolean] = ["x", 1, true];
console.log("  [string, number, boolean] =", bad, "→ 看不出每个位置含义");
const good: [name: string, age: number, isActive: boolean] = ["x", 1, true];
console.log("  [name, age, isActive] =", good, "→ 标签让含义清晰");

console.log("\\n陷阱 2: 元组运行时就是数组，类型保护是编译期的");
const tuple: [string, number] = ["a", 1];
console.log("  运行时 typeof:", Array.isArray(tuple) ? "Array" : typeof tuple);
console.log("  运行时 length:", tuple.length, "（可被运行时手段绕过，但编译期已保护）");

console.log("\\n陷阱 3: 越界访问");
const two: [string, number] = ["a", 1];
console.log("  two[0]:", two[0], "two[1]:", two[1]);
// two[2] 在严格模式下编译错误；运行时是 undefined
console.log("  two[2] (越界):", (two as unknown as unknown[])[2], "→ undefined");

console.log("\\n元组演示完成！它是固定结构数据的最佳容器。");`,
  },

  // =========================================================
  // 第六章：只读深入
  // =========================================================
  {
    id: "ts-readonly-deep",
    title: "只读深入",
    icon: "🔒",
    group: "基础补充",
    content: `## 只读深入 (Readonly Deep Dive)

**只读（Readonly）** 是 TypeScript 类型系统中保障数据不可变性的核心机制。不可变数据（Immutable Data）能避免大量"意外修改"导致的 bug——当数据不能被改，你就不用担心"谁动了它的状态"。本章将极其详细地讲解 \`readonly\` 修饰符、\`readonly\` 与 \`const\` 的区别、\`ReadonlyArray\`/\`ReadonlyMap\`/\`ReadonlySet\`、\`Readonly\` 工具类型、\`Object.freeze\` 运行时只读、\`readonly\` 在函数参数中的意义、不可变数据结构、深只读 \`DeepReadonly\`。

### readonly 修饰符

\`readonly\` 用在**对象属性**上，表示该属性只能在对象创建时赋值，之后不可修改：

\`\`\`ts
interface Point {  // 定义接口 Point
  readonly x: number;  // 类属性 x: number
  readonly y: number;  // 类属性 y: number
}
const p: Point = { x: 10, y: 20 };  // 声明常量 p，类型 Point
// p.x = 5; // ❌ 编译错误：只读属性
\`\`\`

\`readonly\` 是**编译期检查**——运行时该属性和普通属性没区别，可以被任何 JS 手段修改。它的价值在于：让编译器帮你拦截"意外修改"，并在类型层面表达"这个值不应该变"的意图。

### readonly vs const

这是最常见的混淆点：

| 维度 | \`readonly\` | \`const\` |
| --- | --- | --- |
| **作用对象** | 对象**属性** | **变量** |
| **保护什么** | 属性不能被重新赋值 | 变量绑定不能被重新赋值 |
| **能否保护内容** | 仅该层属性（不递归） | 不保护对象内容 |
| **运行时** | 无影响 | 无影响（变量声明） |

\`\`\`ts
const arr = [1, 2, 3];  // 声明常量 arr
arr = [4, 5, 6];   // ❌ const：变量不能重新赋值
arr.push(4);        // ✅ 但内容可以改！const 不保护内容

const roArr: readonly number[] = [1, 2, 3];  // 声明常量 roArr，类型 readonly number[]
// roArr.push(4);   // ❌ readonly：内容也不能改
\`\`\`

**核心认知**：\`const\` 保护"变量绑定"（不能重新赋值整个变量），\`readonly\` 保护"属性/元素"（不能修改内容）。两者互补，常一起用：\`const ro: readonly number[] = [...]\` 既不能重新赋值、也不能改内容。

### ReadonlyArray\<T\>

\`\`\`ts
let arr: ReadonlyArray<number> = [1, 2, 3];  // 声明变量 arr，类型 ReadonlyArray<number>
// arr.push(4);    // ❌ 没有 push
// arr[0] = 10;    // ❌ 没有索引赋值
// arr.length = 0; // ❌ 不能改 length
arr = [4, 5, 6];   // ✅ 但变量本身可以重新赋值（如果不是 const）
\`\`\`

\`ReadonlyArray<T>\` 是只读数组类型，等价于 \`readonly T[]\`。它移除了所有**变更方法**（\`push\`/\`pop\`/\`splice\`/\`sort\`/\`reverse\`/\`fill\` 等），只保留**读取方法**（\`map\`/\`filter\`/\`reduce\`/\`concat\`/\`slice\` 等）。

**关键**：\`ReadonlyArray\` 是**编译期**的——运行时它就是普通数组，有所有方法。但 TypeScript 不让你调用变更方法，从源头阻止修改。

### ReadonlyMap\<K, V\> / ReadonlySet\<T\>

类似地，Map 和 Set 有只读版本：

\`\`\`ts
const roMap: ReadonlyMap<string, number> = new Map([["a", 1]]);  // 声明常量 roMap，类型 ReadonlyMap<string, number>
// roMap.set("b", 2);  // ❌ 没有 set
roMap.get("a");        // ✅ 可以读

const roSet: ReadonlySet<number> = new Set([1, 2, 3]);  // 声明常量 roSet，类型 ReadonlySet<number>
// roSet.add(4);  // ❌ 没有 add
roSet.has(1);     // ✅ 可以查
\`\`\`

只读 Map/Set 移除了变更方法（\`set\`/\`delete\`/\`clear\`），保留读取方法。

### Readonly\<T\> 工具类型

\`Readonly<T>\` 是内置工具类型，把对象类型 \`T\` 的所有属性变成 \`readonly\`：

\`\`\`ts
interface Todo {  // 定义接口 Todo
  title: string;
  done: boolean;
}
type ReadonlyTodo = Readonly<Todo>;  // 定义类型别名 ReadonlyTodo
// 等价于 { readonly title: string; readonly done: boolean }
\`\`\`

\`Readonly<T>\` 的实现是映射类型：

\`\`\`ts
type Readonly<T> = {  // 定义类型别名 Readonly，泛型参数 T
  readonly [P in keyof T]: T[P];
};
\`\`\`

它遍历 \`T\` 的所有属性键 \`P\`，给每个加上 \`readonly\` 修饰符。注意 \`Readonly<T>\` **只做一层**——如果属性值是对象，该对象的属性不会被变只读（浅只读）。深只读需要 \`DeepReadonly\`（见下文）。

### Object.freeze 运行时只读

\`Object.freeze(obj)\` 是 JavaScript 原生方法，它在**运行时**冻结对象：

- 不能新增属性。
- 不能删除属性。
- 不能修改属性值。
- 不能修改属性描述符。
- 严格模式下违反会抛错；非严格模式静默失败。

\`\`\`ts
const obj = Object.freeze({ x: 1, y: 2 });  // 声明常量 obj
// obj.x = 10; // 严格模式抛错；非严格模式静默失败，obj.x 仍是 1
\`\`\`

\`Object.freeze\` 的返回值类型在 TS 中是 \`Readonly<T>\`——它同时提供运行时冻结和编译期只读类型。但注意 \`Object.freeze\` 是**浅冻结**——嵌套对象的属性仍可修改：

\`\`\`ts
const obj = Object.freeze({ nested: { x: 1 } });  // 声明常量 obj
obj.nested.x = 10; // ✅ 仍可改！因为只冻结了第一层
\`\`\`

要深冻结需递归调用 \`Object.freeze\`。

### readonly 在函数参数中的意义

函数参数加 \`readonly\` 能向调用者保证"我不会修改你的数据"：

\`\`\`ts
function sum(arr: readonly number[]): number {  // 定义函数 sum，参数: arr: readonly number[]，返回 number
  // arr.push(0); // ❌ 编译错误，无法修改
  return arr.reduce((a, b) => a + b, 0);  // 返回 arr.reduce((a, b) => a + b, 0)
}

const myArr = [1, 2, 3];  // 声明常量 myArr
sum(myArr); // 调用者确信 myArr 不会被改
\`\`\`

这是一个重要的**契约**——用类型表达"只读意图"，调用方可以放心传入自己的数据而不担心被篡改。在函数式编程、React 状态管理（reducer 必须返回新状态而非修改原状态）等场景，\`readonly\` 参数是默认选择。

### 不可变数据结构（Immutable Data Structures）

不可变数据结构是指**一旦创建就不能被修改**的数据。要"改变"它，只能创建一个**新副本**（带修改）。例如：

\`\`\`ts
// 可变更新（修改原对象）
const obj = { count: 1 };  // 声明常量 obj
obj.count = 2; // 原对象被改

// 不可变更新（返回新对象）
const obj2 = { count: 1 };  // 声明常量 obj2
const obj3 = { ...obj2, count: 2 }; // obj2 不变，obj3 是新对象
\`\`\`

不可变更新的好处：

1. **可预测**：数据不会被意外修改，bug 更少。
2. **可回溯**：保留旧版本，支持撤销/重做、时间旅行调试。
3. **引用比较**：\`prev === next\` 即可判断数据是否变化（React 性能优化、Redux 优化）。
4. **并发安全**：多线程/协程不会因共享数据竞争而错乱。

### Immutable.js 概念

\`Immutable.js\` 是 Facebook 出品的不可变数据结构库，提供 \`Map\`/\`List\`/\`Set\` 等持久化数据结构。它的核心是**结构共享**——更新时只复制变化的部分，旧结构共享未变部分，从而避免深拷贝的昂贵开销。

例如更新一个 1000 元素 List 的第 5 个元素，Immutable.js 只会创建少量新节点（树状结构），其余 999 个元素与原 List 共享。这让不可变更新接近 O(log N) 而非 O(N)。

现代 TypeScript 项目越来越多用**原生 spread + readonly 类型**而非 Immutable.js，因为：

- 原生 spread 语法够简洁。
- \`readonly\` 类型能编译期保护。
- 免去第三方库依赖和额外学习成本。

但在性能敏感场景（巨型列表频繁更新），Immutable.js 仍有价值。

### 深只读 DeepReadonly

\`Readonly<T>\` 是浅只读——只把第一层属性变 readonly，嵌套对象的属性仍可改：

\`\`\`ts
interface Nested { a: { b: number } }  // 定义接口 Nested
type R = Readonly<Nested>;  // 定义类型别名 R
const r: R = { a: { b: 1 } };  // 声明常量 r，类型 R
r.a.b = 2; // ✅ 仍可改！因为只 readonly 了第一层
\`\`\`

要实现**深只读**（所有层都 readonly），需自定义 \`DeepReadonly\` 工具类型：

\`\`\`ts
type DeepReadonly<T> = {  // 定义类型别名 DeepReadonly，泛型参数 T
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
\`\`\`

它递归地把每个属性变 readonly。这样 \`DeepReadonly<Nested>\` 的 \`a.b\` 也变成 readonly，无法修改。

**陷阱**：\`DeepReadonly\` 递归可能遇到函数、数组、Map 等特殊情况。生产级实现需更复杂（处理函数不递归、数组转 \`readonly T[]\`、Map 转 \`ReadonlyMap\` 等）。本节代码会给出一个改进版。

### readonly 与可变性权衡

并非所有数据都该只读：

- **配置、常量、API 响应**：应该只读，防止意外修改。
- **正在构建的数据（builder 模式）**：可变更高效。
- **性能敏感的局部计算**：可变更快。

合理做法：**边界只读，内部可变**。函数参数默认 readonly，函数内部可以拷贝后修改，返回时再转为 readonly。

### 陷阱与最佳实践

1. **readonly 是浅层的**：要深只读用 \`DeepReadonly\`。
2. **readonly 不阻止运行时修改**：要运行时保护用 \`Object.freeze\`。
3. **readonly 数组仍可被 \`as\` 绕过**：\`arr as number[]\` 后能改，但破坏了类型安全。
4. **ReadonlyArray 向普通数组赋值**：\`const a: number[] = roArr\` 会报错（只读数组不能赋给可变数组），这是正确的安全设计。
5. **不可变更新用 spread**：\`{ ...obj, key: newVal }\` 是惯用法。
6. **Redux/React 状态必须不可变**：reducer 返回新对象，不能改原状态。

### 本节代码演示

下面实现 \`DeepReadonly\` 工具类型、对比 \`readonly\` 与 \`Object.freeze\` 的运行时行为、演示不可变数据更新模式（spread/更新数组/更新嵌套对象）。你会看到编译期只读与运行时冻结的差异。`,
    code: `// ============================================================
// 第六章代码演示：只读深入
// ============================================================
// 演示 readonly 修饰符、ReadonlyArray、Readonly<T>、
// Object.freeze 运行时冻结、DeepReadonly、不可变更新模式。

// ---- 1. readonly 修饰符 ----
console.log("========== 1. readonly 修饰符 ==========");

interface Point {
  readonly x: number;
  readonly y: number;
}
const p: Point = { x: 10, y: 20 };
console.log("只读点:", p);
// p.x = 5; // ❌ 编译错误：只读属性不能修改
console.log("→ readonly 是编译期检查，运行时仍是普通属性");

// 对比：非只读属性可改
interface MutablePoint {
  x: number;
  y: number;
}
const mp: MutablePoint = { x: 1, y: 2 };
mp.x = 100; // ✅ 可改
console.log("可变点改后:", mp);

// ---- 2. readonly vs const ----
console.log("\\n========== 2. readonly vs const ==========");

// const 保护"变量绑定"：不能重新赋值整个变量
const arr1 = [1, 2, 3];
// arr1 = [4, 5, 6]; // ❌ const 不能重新赋值
arr1.push(4); // ✅ 但内容可改！const 不保护内容
console.log("const 数组 push 后:", arr1, "（const 不保护内容）");

// readonly 保护"内容"：不能修改元素
const arr2: readonly number[] = [1, 2, 3];
// arr2.push(4);  // ❌ readonly 不能 push
// arr2[0] = 10;  // ❌ readonly 不能索引赋值
console.log("readonly 数组:", arr2, "（readonly 保护内容不可改）");
console.log("→ 最佳实践: const + readonly 双重保护");

// ---- 3. ReadonlyArray<T> ----
console.log("\\n========== 3. ReadonlyArray<T> ==========");

let roArr: ReadonlyArray<number> = [10, 20, 30];
console.log("ReadonlyArray:", roArr);
// roArr.push(40);   // ❌ 没有 push 方法
// roArr[0] = 99;    // ❌ 没有索引赋值
// roArr.length = 0; // ❌ 不能改 length
console.log("可读方法 map:", roArr.map((n) => n * 2));
console.log("可读方法 filter:", roArr.filter((n) => n > 15));
console.log("可读方法 reduce:", roArr.reduce((a, b) => a + b, 0));
console.log("可读方法 slice:", roArr.slice(0, 2));
console.log("可读方法 concat:", roArr.concat([40, 50]));

// 等价写法：readonly T[]
let roArr2: readonly number[] = [1, 2, 3];
console.log("readonly number[] 等价写法:", roArr2);

// 陷阱：只读数组不能赋给可变数组（安全设计）
let mutableArr: number[] = [1, 2];
// mutableArr = roArr; // ❌ 不能把只读赋给可变
console.log("→ 只读数组不能赋给可变数组（防止后续修改）");

// ---- 4. ReadonlyMap / ReadonlySet ----
console.log("\\n========== 4. ReadonlyMap / ReadonlySet ==========");

const roMap: ReadonlyMap<string, number> = new Map([
  ["a", 1],
  ["b", 2],
]);
// roMap.set("c", 3); // ❌ 没有 set 方法
console.log("ReadonlyMap get('a'):", roMap.get("a"));
console.log("ReadonlyMap size:", roMap.size);
console.log("ReadonlyMap 遍历:");
roMap.forEach((v, k) => console.log("  " + k + " = " + v));

const roSet: ReadonlySet<number> = new Set([1, 2, 3]);
// roSet.add(4); // ❌ 没有 add 方法
console.log("\\nReadonlySet has(2):", roSet.has(2));
console.log("ReadonlySet size:", roSet.size);

// ---- 5. Readonly<T> 工具类型 ----
console.log("\\n========== 5. Readonly<T> 工具类型 ==========");

interface Todo {
  title: string;
  done: boolean;
  tags: string[];
}
// Readonly<T> 把所有属性变 readonly
type ReadonlyTodo = Readonly<Todo>;
const rt: ReadonlyTodo = { title: "学习 TS", done: false, tags: ["ts", "type"] };
// rt.title = "改"; // ❌ readonly
console.log("Readonly<Todo>:", rt);
// 但注意：tags 是数组，Readonly 只让 tags 属性 readonly（不能重新赋值 tags）
// tags 数组本身仍是可变的（浅只读）
rt.tags.push("new"); // ✅ 仍可改！因为 Readonly 是浅层的
console.log("浅只读陷阱: tags 仍可 push →", rt.tags);
console.log("→ Readonly<T> 是浅只读，嵌套对象/数组仍可改");

// ---- 6. Object.freeze 运行时冻结 ----
console.log("\\n========== 6. Object.freeze 运行时冻结 ==========");

// Object.freeze 在运行时真正冻结对象
const frozen = Object.freeze({ x: 1, y: 2, nested: { z: 3 } });
console.log("冻结对象:", frozen);

// 尝试修改（非严格模式下静默失败，不会抛错也不会改）
try {
  // 用 any 绕过编译期检查，演示运行时行为
  (frozen as any).x = 999;
} catch (e) {
  console.log("严格模式下抛错:", (e as Error).message);
}
console.log("尝试改 frozen.x 后:", frozen.x, "（运行时冻结生效，值未变）");

// 但 Object.freeze 是浅冻结
try {
  (frozen as any).nested.z = 888;
} catch (e) {
  console.log("嵌套修改抛错:", (e as Error).message);
}
console.log("浅冻结陷阱: frozen.nested.z 仍可改 →", frozen.nested.z);
console.log("→ Object.freeze 是浅冻结，嵌套对象未被冻结");

// 检查是否冻结
console.log("frozen 是否被冻结:", Object.isFrozen(frozen));
console.log("frozen.nested 是否被冻结:", Object.isFrozen(frozen.nested));

// ---- 7. 深冻结（递归 Object.freeze）----
console.log("\\n========== 7. 深冻结实现 ==========");

function deepFreeze<T>(obj: T): T {
  // 先冻结自身
  Object.freeze(obj);
  // 递归冻结所有属性值为对象的属性
  Object.getOwnPropertyNames(obj).forEach((name) => {
    const value = (obj as any)[name];
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });
  return obj;
}

const deepFrozen = deepFreeze({ a: 1, nested: { b: 2, deep: { c: 3 } } });
console.log("深冻结对象:", JSON.stringify(deepFrozen));
console.log("顶层冻结:", Object.isFrozen(deepFrozen));
console.log("nested 冻结:", Object.isFrozen(deepFrozen.nested));
console.log("deep 冻结:", Object.isFrozen(deepFrozen.nested.deep));

try {
  (deepFrozen as any).nested.deep.c = 999;
} catch (e) {
  console.log("尝试改深层属性抛错:", (e as Error).message);
}
console.log("深冻结后 nested.deep.c 不可改 →", deepFrozen.nested.deep.c);

// ---- 8. DeepReadonly 工具类型（编译期深只读）----
console.log("\\n========== 8. DeepReadonly 工具类型 ==========");

// DeepReadonly: 递归把所有层属性变 readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function  // 函数不递归（保持原样）
      ? T[P]
      : DeepReadonly<T[P]>   // 对象递归
    : T[P];                  // 原始类型保持
};

interface NestedConfig {
  server: {
    host: string;
    port: number;
    options: {
      timeout: number;
      retry: boolean;
    };
  };
  features: string[];
  log: (msg: string) => void;
}

// 用 DeepReadonly 包裹，所有层都只读
const config: DeepReadonly<NestedConfig> = {
  server: {
    host: "localhost",
    port: 8080,
    options: { timeout: 5000, retry: true },
  },
  features: ["auth", "cache"],
  log: (msg: string) => console.log("  [LOG] " + msg),
};

// 以下都是编译错误（运行时不报错，因为 readonly 是编译期）：
// config.server.host = "x";        // ❌
// config.server.options.timeout = 0; // ❌
// config.features.push("x");       // ❌
console.log("DeepReadonly 配置:", JSON.stringify(config.server));
config.log("DeepReadonly 中的函数仍可调用");
console.log("→ DeepReadonly 在编译期保护所有层，运行时无开销");

// 对比：Readonly<NestedConfig> 只保护第一层
const shallow: Readonly<NestedConfig> = {
  server: { host: "h", port: 1, options: { timeout: 1, retry: true } },
  features: [],
  log: () => {},
};
// shallow.server = {...}; // ❌ 第一层保护
shallow.server.host = "changed"; // ✅ 第二层仍可改！
console.log("浅 Readonly 仍可改深层:", shallow.server.host);

// ---- 9. readonly 在函数参数中的意义 ----
console.log("\\n========== 9. readonly 函数参数 ==========");

// 函数声明不会修改入参数组 → 用 readonly number[]
function sum(arr: readonly number[]): number {
  // arr.push(0); // ❌ 编译错误，无法修改
  return arr.reduce((a, b) => a + b, 0);
}

function average(arr: readonly number[]): number {
  if (arr.length === 0) return 0;
  return sum(arr) / arr.length;
}

const myNumbers = [10, 20, 30, 40];
console.log("sum(myNumbers):", sum(myNumbers));
console.log("average(myNumbers):", average(myNumbers));
console.log("调用后 myNumbers 未被修改:", myNumbers, "（readonly 保证）");

// 不可变更新函数：返回新数组而非修改原数组
function addItem(arr: readonly number[], item: number): number[] {
  return [...arr, item]; // spread 创建新数组
}
function removeItem(arr: readonly number[], index: number): number[] {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}
const original = [1, 2, 3];
const added = addItem(original, 4);
const removed = removeItem(original, 1);
console.log("原数组:", original, "（不变）");
console.log("addItem 后:", added, "（新数组）");
console.log("removeItem(1) 后:", removed, "（新数组）");

// ---- 10. 不可变数据更新模式 ----
console.log("\\n========== 10. 不可变更新模式 ==========");

interface AppState {
  user: { name: string; age: number };
  items: string[];
  count: number;
}

const state: AppState = {
  user: { name: "张三", age: 28 },
  items: ["a", "b"],
  count: 0,
};

// 模式 1: 更新顶层属性
const state1: AppState = { ...state, count: state.count + 1 };
console.log("更新 count:", state1.count, "（原 state.count 仍为", state.count + "）");

// 模式 2: 更新嵌套对象（需多层 spread）
const state2: AppState = {
  ...state,
  user: { ...state.user, age: 29 },
};
console.log("更新嵌套 user.age:", state2.user.age, "（原", state.user.age + "）");

// 模式 3: 数组添加元素
const state3: AppState = { ...state, items: [...state.items, "c"] };
console.log("添加 items:", state3.items);

// 模式 4: 数组更新指定索引
const state4: AppState = {
  ...state,
  items: state.items.map((item, i) => (i === 0 ? "X" : item)),
};
console.log("更新 items[0]:", state4.items);

// 模式 5: 数组删除元素
const state5: AppState = {
  ...state,
  items: state.items.filter((_, i) => i !== 1),
};
console.log("删除 items[1]:", state5.items);

// 验证原 state 完全未变
console.log("\\n原 state 未被任何更新影响:");
console.log("  user:", JSON.stringify(state.user));
console.log("  items:", state.items);
console.log("  count:", state.count);
console.log("→ 不可变更新的核心：永远返回新对象，原对象保持不变");

// ---- 11. 引用比较优势 ----
console.log("\\n========== 11. 引用比较（不可变数据优势）==========");

// 不可变数据可用 === 快速判断是否变化
const prev: AppState = { user: { name: "A", age: 1 }, items: [], count: 0 };
const next1: AppState = { ...prev }; // 浅拷贝（结构相同但新引用）
const next2: AppState = prev; // 同一引用

console.log("prev === next1（新对象）:", prev === next1, "→ 引用不同，视为已变化");
console.log("prev === next2（同对象）:", prev === next2, "→ 引用相同，视为未变化");
console.log("→ React.memo/Redux 用引用比较优化性能，依赖不可变更新");

// 可变更新的问题：引用不变，比较失效
const badNext = prev;
badNext.count = 999;
console.log("可变更新后 prev === badNext:", prev === badNext, "→ 引用相同但内容已变，比较失效！");
console.log("prev.count:", prev.count, "（被意外修改）");

console.log("\\n只读演示完成！不可变数据是构建可靠应用的核心范式。");`,
  },
];