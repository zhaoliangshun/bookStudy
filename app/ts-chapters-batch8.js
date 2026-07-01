// =============================================================
// TypeScript 交互式教程 —— 第八批章节（共 6 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. ts-linting        — ESLint 与 Prettier
//   2. ts-testing        — 测试与类型测试
//   3. ts-debugging      — 调试技巧
//   4. ts-migration      — JS 到 TS 迁移指南
//   5. ts-react          — React + TypeScript
//   6. ts-node-advanced  — Node + TypeScript
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（工程化进阶）
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
//     setImmediate, URL, URLSearchParams, TextEncoder, TextDecoder,
//     Promise, __dirname, __filename, require, module, exports
//   - V8 内置对象(globalThis/Reflect/JSON/Math/Date/Map/Set/WeakMap
//     等)在 vm 上下文中也可用
//   - 沙箱不能 require 外部模块(react/express/jest/eslint 等)，所以
//     相关 demo 用对象字面量 + 接口来模拟这些库的类型设计与运行时行为
//   - 类型注解/interface/type/enum/泛型/装饰器都可用(转译器处理)
//   - 类型错误不会阻止运行(教程侧重运行结果)
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：ESLint 与 Prettier
  // =========================================================
  {
    id: "ts-linting",
    title: "ESLint 与 Prettier",
    icon: "🧹",
    group: "工程化进阶",
    content: `## ESLint 与 Prettier

代码风格与代码质量是工程化的两条主线。**ESLint** 负责代码质量与潜在错误检查（未使用变量、隐式 any、不可能的比较等），**Prettier** 负责代码格式化（缩进、引号、换行）。两者职责不同但容易冲突，TypeScript 项目里需要正确配置才能协同工作。本章极其详细地讲解在 TS 项目中如何配置 ESLint、Prettier，以及如何用 husky + lint-staged 在提交前自动检查、用 commitlint 规范提交信息。

### 1. 为什么需要代码检查

#### 代码质量 vs 代码风格

| 维度 | 代码质量（ESLint） | 代码风格（Prettier） |
| --- | --- | --- |
| 关注点 | bug、潜在错误、反模式 | 缩进、引号、换行、空格 |
| 是否影响运行 | 可能影响（如未使用变量、错误比较） | 不影响 |
| 是否可自动修复 | 部分（如未使用变量删除） | 全部 |
| 例子 | \`no-unused-vars\`、\`no-explicit-any\` | \`singleQuote\`、\`semi\` |
| 争论程度 | 低（基本都认同） | 高（个人偏好） |

团队协作中，如果没有统一规则，代码风格会混乱、潜在 bug 会累积。Lint 工具把"代码评审"中的机械检查自动化，让人专注于逻辑。

#### ESLint 的演进

ESLint 早期对 TS 支持不好，需要 \`typescript-eslint-parser\`。2019 年起官方维护 \`@typescript-eslint\` 项目，提供完整 TS 支持，成为 TS 项目的标准选择。TSLint（PALANTIR）已废弃，所有项目都迁移到了 ESLint + @typescript-eslint。

### 2. ESLint 在 TS 项目中的配置

#### 安装依赖

\`\`\`bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
\`\`\`

- \`@typescript-eslint/parser\`：把 TS 代码解析成 ESLint 能理解的 AST。
- \`@typescript-eslint/eslint-plugin\`：提供针对 TS 的规则（如 \`no-explicit-any\`）。

#### .eslintrc.js 完整配置

ESLint 9 推荐用扁平配置（\`eslint.config.js\`），但传统 \`.eslintrc.js\` 仍广泛使用。这里两种都展示。

\`\`\`js
// .eslintrc.js —— 传统配置
module.exports = {
  root: true,            // 防止 ESLint 继续向上查找配置
  parser: '@typescript-eslint/parser',  // 用 TS 解析器
  parserOptions: {
    project: './tsconfig.json', // 用于类型相关的规则
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    ecmaVersion: 2022,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier', // eslint-config-prettier，关闭与 Prettier 冲突的规则
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': 'error',
  },
};
\`\`\`

#### 扁平配置 eslint.config.js (ESLint 9+)

\`\`\`js
// eslint.config.js —— 扁平配置
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier, // 放最后，关闭冲突规则
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
);
\`\`\`

### 3. 常用规则详解

#### @typescript-eslint/no-explicit-any

禁止显式使用 \`any\`。\`any\` 关闭了类型检查，是类型安全的最大敌人。但有些场景（如迁移期、与动态 API 交互）确实需要，所以常用 \`warn\` 而非 \`error\`。

\`\`\`ts
// ❌ no-explicit-any
function process(data: any) { return data.x; }
// ✅ 用 unknown + 类型守卫
function process(data: unknown) {
  if (typeof data === 'object' && data && 'x' in data) return data.x;
}
\`\`\`

#### @typescript-eslint/no-unused-vars

检测未使用的变量。配合 \`argsIgnorePattern: '^_'\` 让以 \`_\` 开头的参数豁免（常见于占位参数）。

\`\`\`ts
// ❌
function add(a, b) { return a; } // b 未使用
// ✅
function add(a, _b) { return a; } // _b 显式表示不用
\`\`\`

#### @typescript-eslint/consistent-type-imports

强制类型导入用 \`import type\`。在 \`isolatedModules\` 下更安全。

\`\`\`ts
// ❌
import { Foo, Bar } from './types'; // Foo/Bar 都是类型，但用普通 import
// ✅
import type { Foo, Bar } from './types';
// ✅ 也可以混合
import { value, type Foo } from './mod';
\`\`\`

#### 其他高频规则

| 规则 | 作用 |
| --- | --- |
| \`@typescript-eslint/explicit-function-return-type\` | 强制函数标返回类型 |
| \`@typescript-eslint/no-non-null-assertion\` | 禁止 \`!\` 非空断言 |
| \`@typescript-eslint/no-floating-promises\` | Promise 必须 catch 或 await |
| \`@typescript-eslint/strict-boolean-expressions\` | 严格布尔判断（避免 \`if (x)\` 的隐式转换） |
| \`@typescript-eslint/naming-convention\` | 命名规范 |
| \`no-console\` | 禁止 console（生产代码） |

### 4. Prettier 配置

Prettier 只关心格式，不关心代码逻辑。安装 \`prettier\`，根目录放 \`.prettierrc\`。

\`\`\`json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
\`\`\`

| 选项 | 说明 | 示例值 |
| --- | --- | --- |
| \`semi\` | 末尾分号 | true |
| \`singleQuote\` | 单引号 | true |
| \`trailingComma\` | 尾随逗号 | "all" |
| \`printWidth\` | 单行最大宽度 | 100 |
| \`tabWidth\` | 缩进空格数 | 2 |
| \`arrowParens\` | 箭头函数参数括号 | "always" |

### 5. ESLint 与 Prettier 集成

ESLint 和 Prettier 有些规则会冲突（如 \`quotes\`、\`semi\`）。集成方案：

- \`eslint-config-prettier\`：关闭 ESLint 中所有与 Prettier 冲突的规则（推荐）。
- \`eslint-plugin-prettier\`：把 Prettier 作为 ESLint 规则运行（不推荐，让 Prettier 干自己的活更清晰）。

最佳实践：**ESLint 管质量，Prettier 管格式，用 eslint-config-prettier 关闭冲突**。在 \`extends\` 数组最后放 \`'prettier'\`，确保它的关闭生效。

### 6. husky + lint-staged 提交前检查

#### husky

husky 管理 git hooks，让你在 \`pre-commit\`、\`commit-msg\` 等钩子执行脚本。

\`\`\`bash
npx husky init
# 生成 .husky/pre-commit
\`\`\`

#### lint-staged

只对 git 暂存区（staged）的文件运行 lint，避免全量检查慢。

\`\`\`json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
\`\`\`

\`\`\`sh
# .husky/pre-commit
npx lint-staged
\`\`\`

这样每次 \`git commit\` 前会自动对改动的文件跑 ESLint + Prettier，失败则阻止提交。

### 7. commitlint 规范提交信息

commitlint 检查 commit message 是否符合规范（如 Conventional Commits）。

\`\`\`json
// package.json
{
  "commitlint": {
    "extends": ["@commitlint/config-conventional"]
  }
}
\`\`\`

规范格式：\`type(scope): subject\`，type 必须是 \`feat|fix|docs|style|refactor|test|chore\` 等。

\`\`\`sh
# .husky/commit-msg
npx --no -- commitlint --edit "$1"
\`\`\`

\`\`\`
✅ feat(auth): 添加登录功能
✅ fix(api): 修复用户列表分页 bug
❌ 修了个 bug                      # 缺 type
❌ feature: 添加功能                # type 不在允许列表
\`\`\`

### 8. 推荐规则集

| 规则集 | 说明 |
| --- | --- |
| \`eslint:recommended\` | ESLint 官方推荐（JS 通用） |
| \`plugin:@typescript-eslint/recommended\` | TS 通用推荐 |
| \`plugin:@typescript-eslint/recommended-requiring-type-checking\` | 需要类型信息的推荐（更严格） |
| \`plugin:@typescript-eslint/strict\` | 严格版 |
| \`plugin:react/recommended\` | React 项目 |
| \`plugin:react-hooks/recommended\` | React Hooks 规则 |
| \`prettier\` | 关闭与 Prettier 冲突的规则 |

### 9. 陷阱与最佳实践

1. **parserOptions.project 慢**：开启类型检查规则会让 ESLint 慢 3-10 倍，可用 \`@typescript-eslint/utils\` 优化或只在 CI 跑严格规则。
2. **eslint-config-prettier 必须放最后**：否则它关闭的规则会被后面的配置重新打开。
3. **不要用 eslint-plugin-prettier 报告格式错误**：让 Prettier 自动格式化，不要在 ESLint 里报。
4. **lint-staged 只检查改动文件**：全量检查在 CI 跑。
5. **规则级别**：\`off/warn/error\`，迁移期用 \`warn\` 让团队逐步适应。
6. **忽略文件 .eslintignore / .prettierignore**：忽略 \`dist\`、\`node_modules\`、\`coverage\` 等。

### 本章小结

ESLint 管质量，Prettier 管格式，husky + lint-staged 在提交前自动执行，commitlint 规范提交信息。四者配合形成完整的代码质量工作流。在 TS 项目中务必用 \`@typescript-eslint\` 而非 TSLint（已废弃）。

下面的代码 demo 用对象字面量展示完整的 \`.eslintrc.js\` / \`.prettierrc\` / \`lint-staged\` 配置，并模拟一个简易的 lint 检查器，演示常见规则的检测逻辑。`,
    code: `// ============================================================
// ESLint 与 Prettier —— 代码演示
// ------------------------------------------------------------
// 沙箱不能 require eslint/prettier/husky，所以用对象字面量展示
// 配置文件，并实现一个简易 lint 检查器演示规则的检测逻辑。
// ============================================================

// ---- 1. 完整的 .eslintrc.js 配置（对象字面量展示）----
console.log("========== 1. .eslintrc.js 配置 ==========");

// 模拟一份完整的 ESLint 配置
const eslintrc = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: ".",
    sourceType: "module",
    ecmaVersion: 2022,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier", // 必须放最后，关闭与 Prettier 冲突的规则
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
  ignorePatterns: ["dist/", "node_modules/", "coverage/", "*.config.js"],
};

console.log("ESLint parser:", eslintrc.parser);
console.log("extends 顺序（prettier 在最后）:", eslintrc.extends);
console.log("规则数量:", Object.keys(eslintrc.rules).length);
console.log("忽略目录:", eslintrc.ignorePatterns);

// ---- 2. .prettierrc 配置 ----
console.log("\\n========== 2. .prettierrc 配置 ==========");

const prettierConfig = {
  semi: true,            // 末尾分号
  singleQuote: true,     // 单引号
  trailingComma: "all",  // 尾随逗号
  printWidth: 100,       // 单行最大宽度
  tabWidth: 2,           // 缩进 2 空格
  arrowParens: "always", // 箭头函数参数总加括号 (x) => x
  endOfLine: "lf",       // 换行符用 LF
};

console.log("Prettier 配置:", JSON.stringify(prettierConfig, null, 2));

// 演示 Prettier 的格式化效果（模拟）
function mockPrettierFormat(code: string, config: typeof prettierConfig): string {
  // 真实 Prettier 会重新排版，这里只做简单模拟
  let result = code;
  if (config.singleQuote) {
    result = result.replace(/"/g, "'"); // 双引号变单引号
  }
  if (!config.semi) {
    result = result.replace(/;\\n/g, "\\n"); // 去分号
  }
  return result;
}

const beforeFormat = 'const x = "hello";';
const afterFormat = mockPrettierFormat(beforeFormat, prettierConfig);
console.log("格式化前:", beforeFormat);
console.log("格式化后:", afterFormat);

// ---- 3. lint-staged 配置 ----
console.log("\\n========== 3. lint-staged 配置 ==========");

const lintStagedConfig = {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css,scss}": ["prettier --write"],
};

console.log("lint-staged 配置:");
for (const pattern of Object.keys(lintStagedConfig)) {
  console.log("  " + pattern + " -> " + lintStagedConfig[pattern].join(" -> "));
}

// ---- 4. commitlint 配置 ----
console.log("\\n========== 4. commitlint 配置 ==========");

// Conventional Commits 允许的 type
const allowedTypes = ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"];
const commitPattern = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\\(.+\\))?: .{1,100}$/;

function checkCommitMessage(msg: string): { valid: boolean; reason: string } {
  if (!commitPattern.test(msg)) {
    // 提取可能的 type 帮助诊断
    const colonIdx = msg.indexOf(":");
    if (colonIdx === -1) {
      return { valid: false, reason: "缺少 type 前缀，应为 type(scope): subject" };
    }
    const typePart = msg.slice(0, colonIdx);
    const typeMatch = typePart.match(/^[a-z]+/);
    if (!typeMatch || !allowedTypes.includes(typeMatch[0])) {
      return { valid: false, reason: "type '" + (typeMatch ? typeMatch[0] : "?") + "' 不在允许列表: " + allowedTypes.join(", ") };
    }
    return { valid: false, reason: "格式错误，应为 type(scope): subject" };
  }
  return { valid: true, reason: "符合 Conventional Commits" };
}

const testMessages = [
  "feat(auth): 添加用户登录功能",
  "fix(api): 修复分页 bug",
  "修了个 bug",                    // ❌ 缺 type
  "feature: 添加功能",             // ❌ type 错误
  "docs(readme): 更新文档",        // ✅
];

for (const msg of testMessages) {
  const result = checkCommitMessage(msg);
  const mark = result.valid ? "✅" : "❌";
  console.log(mark + " '" + msg + "' -> " + result.reason);
}

// ---- 5. 简易 Lint 检查器（模拟 ESLint 规则检测）----
console.log("\\n========== 5. 简易 Lint 检查器 ==========");

// 定义规则接口
interface LintRule {
  name: string;
  level: "off" | "warn" | "error";
  check: (code: string) => string[]; // 返回违规信息数组
}

// 规则1: no-explicit-any —— 检测显式 any
const noExplicitAnyRule: LintRule = {
  name: "@typescript-eslint/no-explicit-any",
  level: "warn",
  check: function (code: string): string[] {
    const issues: string[] = [];
    // 简单匹配 : any 或 <any> 或 as any
    const lines = code.split("\\n");
    for (let i = 0; i < lines.length; i++) {
      if (/[:<]\\s*any\\b/.test(lines[i]) || /as\\s+any\\b/.test(lines[i])) {
        issues.push("第 " + (i + 1) + " 行: 显式使用了 any");
      }
    }
    return issues;
  },
};

// 规则2: no-unused-vars —— 检测声明但未使用的变量（简化版）
const noUnusedVarsRule: LintRule = {
  name: "@typescript-eslint/no-unused-vars",
  level: "error",
  check: function (code: string): string[] {
    const issues: string[] = [];
    // 匹配 const/let/var 声明，检查变量名在后续代码里是否出现
    const lines = code.split("\\n");
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/(?:const|let|var)\\s+(\\w+)/);
      if (match) {
        const varName = match[1];
        // 以 _ 开头的豁免
        if (varName.startsWith("_")) continue;
        // 检查除声明行外是否还出现
        const restCode = lines.slice(i + 1).join(" ");
        if (!restCode.includes(varName)) {
          issues.push("第 " + (i + 1) + " 行: 变量 '" + varName + "' 声明后未使用");
        }
      }
    }
    return issues;
  },
};

// 规则3: no-console —— 检测 console.log
const noConsoleRule: LintRule = {
  name: "no-console",
  level: "warn",
  check: function (code: string): string[] {
    const issues: string[] = [];
    const lines = code.split("\\n");
    for (let i = 0; i < lines.length; i++) {
      if (/console\\.log\\b/.test(lines[i])) {
        issues.push("第 " + (i + 1) + " 行: 不允许使用 console.log");
      }
    }
    return issues;
  },
};

// Linter 类：管理规则并执行检查
class SimpleLinter {
  private rules: LintRule[] = [];

  addRule(rule: LintRule): void {
    this.rules.push(rule);
  }

  lint(code: string): { rule: string; level: string; issues: string[] }[] {
    const results: { rule: string; level: string; issues: string[] }[] = [];
    for (const rule of this.rules) {
      if (rule.level === "off") continue;
      const issues = rule.check(code);
      if (issues.length > 0) {
        results.push({ rule: rule.name, level: rule.level, issues: issues });
      }
    }
    return results;
  }
}

// 使用 Linter
const linter = new SimpleLinter();
linter.addRule(noExplicitAnyRule);
linter.addRule(noUnusedVarsRule);
linter.addRule(noConsoleRule);

// 待检查的示例代码
const sampleCode = [
  "function process(data: any) {",
  "  const result = transform(data);",
  "  const temp = 123;",        // 未使用
  "  console.log(result);",     // 违反 no-console
  "  return result as any;",    // 违反 no-explicit-any
  "}",
].join("\\n");

console.log("待检查代码:");
console.log(sampleCode);
console.log("\\nLint 结果:");
const lintResults = linter.lint(sampleCode);
let errorCount = 0;
let warnCount = 0;
for (const r of lintResults) {
  for (const issue of r.issues) {
    const mark = r.level === "error" ? "❌ ERROR" : "⚠️  WARN ";
    console.log("  " + mark + " [" + r.rule + "] " + issue);
    if (r.level === "error") errorCount++;
    else warnCount++;
  }
}
console.log("\\n总计: " + errorCount + " error(s), " + warnCount + " warning(s)");
console.log(errorCount > 0 ? "❌ 提交被阻止（有 error）" : "✅ 可以提交（仅有 warn）");

// ---- 6. 模拟 husky pre-commit 流程 ----
console.log("\\n========== 6. 模拟 pre-commit 流程 ==========");

// 模拟 git 暂存的文件
const stagedFiles = [
  { path: "src/auth.ts", content: sampleCode },
  { path: "src/utils.ts", content: "export const add = (a: number, b: number) => a + b;" },
];

console.log("暂存文件:", stagedFiles.map(function (f) { return f.path; }).join(", "));

// 模拟 lint-staged: 只检查 .ts 文件
let allPassed = true;
for (const file of stagedFiles) {
  if (/\\.tsx?$/.test(file.path)) {
    const fileResults = linter.lint(file.content);
    const hasError = fileResults.some(function (r) { return r.level === "error"; });
    if (hasError) {
      console.log("  ❌ " + file.path + " 检查失败，提交被阻止");
      allPassed = false;
    } else {
      console.log("  ✅ " + file.path + " 检查通过");
    }
  }
}

if (allPassed) {
  console.log("\\n✅ 所有文件检查通过，允许提交！");
} else {
  console.log("\\n❌ pre-commit 检查失败，请修复后重试。");
  console.log("   提示: 运行 eslint --fix 自动修复，prettier --write 格式化");
}

console.log("\\nESLint 与 Prettier 章节演示完成！");`,
  },

  // =========================================================
  // 第二章：测试与类型测试
  // =========================================================
  {
    id: "ts-testing",
    title: "测试与类型测试",
    icon: "🧪",
    group: "工程化进阶",
    content: `## 测试与类型测试

测试是保障代码质量的最后一道防线。TypeScript 的类型系统在编译期捕获了大量错误，但运行时行为（如 API 响应、用户交互、副作用）仍需测试覆盖。本章极其详细地讲解 Jest/Vitest 配置 TS、测试结构、mock 与 spy、**类型测试**（TS 独有的测试维度）、快照测试、覆盖率、TDD 与测试金字塔。

### 1. 为什么需要测试

#### TS 类型检查 vs 测试

| 维度 | TS 类型检查 | 测试 |
| --- | --- | --- |
| 何时运行 | 编译期 | 运行时 |
| 检测什么 | 类型错误（参数类型、返回值） | 行为正确性（输出值、副作用） |
| 能否检测运行时错误 | 部分（null 检查） | 是 |
| 能否检测业务逻辑 | ❌ | ✅ |
| 成本 | 低（写类型注解） | 高（写测试用例） |

类型检查保证"你调用对了"，测试保证"它做对了"。两者互补，缺一不可。

#### 测试金字塔

\`\`\`
        ╱ E2E ╲        少而慢（端到端，模拟真实用户）
       ╱───────╲
      ╱ 集成测试 ╲      中等（多模块协作）
     ╱───────────╲
    ╱  单元测试    ╲    多而快（单个函数/类）
   ╱───────────────╲
\`\`\`

- **单元测试**：测试单个函数/类，隔离依赖，最快最多。
- **集成测试**：测试多个模块协作，如 API → 数据库。
- **E2E 测试**：模拟真实用户操作，最慢最贵，少量覆盖核心流程。

### 2. Jest 配置 TS

#### 方案一：ts-jest

ts-jest 用 TypeScript 编译器转译代码，最经典。

\`\`\`bash
npm install --save-dev jest ts-jest @types/jest
npx ts-jest config:init
\`\`\`

\`\`\`js
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageThreshold: { global: { branches: 80, functions: 80, lines: 80 } },
};
\`\`\`

#### 方案二：@swc/jest

swc 是 Rust 写的转译器，比 ts-jest 快 10-50 倍，适合大型项目。

\`\`\`js
// jest.config.js
module.exports = {
  transform: { '^.+\\\\.tsx?$': '@swc/jest' },
  testEnvironment: 'node',
};
\`\`\`

#### Jest 配置项详解

| 配置 | 说明 |
| --- | --- |
| \`preset\` | 预设（ts-jest） |
| \`testEnvironment\` | 运行环境（node/jsdom） |
| \`testMatch\` | 测试文件 glob |
| \`setupFilesAfterEach\` | 每个测试前运行的脚本 |
| \`collectCoverageFrom\` | 覆盖率统计范围 |
| \`coverageThreshold\` | 覆盖率门槛 |
| \`moduleNameMapper\` | 路径别名映射 |

### 3. Vitest 配置

Vitest 是 Vite 原生的测试框架，API 与 Jest 兼容，但更快（用 Vite 的转译管线），且原生支持 ESM。

\`\`\`ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'node',
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
    include: ['src/**/*.test.ts'],
  },
});
\`\`\`

| 对比 | Jest | Vitest |
| --- | --- | --- |
| 转译 | ts-jest/swc | Vite (esbuild) |
| ESM 支持 | 需配置 | 原生 |
| 速度 | 慢 | 快 |
| API | 事实标准 | 兼容 Jest |
| 适合 | 老项目/通用 | Vite 项目 |

### 4. 测试结构 describe / it / expect

\`\`\`ts
import { add } from './math';

describe('add 函数', () => {
  it('两数相加返回和', () => {
    expect(add(1, 2)).toBe(3);
  });
  it('处理负数', () => {
    expect(add(-1, -2)).toBe(-3);
  });
  it('不发生浮点误差', () => {
    expect(add(0.1, 0.2)).toBeCloseTo(0.3);
  });
});
\`\`\`

- \`describe\`：分组，可嵌套。
- \`it\`（别名 \`test\`）：单个测试用例。
- \`expect\`：断言，链式匹配器。

#### 常用匹配器

| 匹配器 | 说明 |
| --- | --- |
| \`.toBe(value)\` | 严格相等（===） |
| \`.toEqual(value)\` | 深度相等（对象） |
| \`.toBeNull() / toBeUndefined() / toBeDefined()\` | null/undefined 检查 |
| \`.toBeTruthy() / toBeFalsy()\` | 真假值 |
| \`.toHaveLength(n)\` | 长度 |
| \`.toContain(item)\` | 包含 |
| \`.toThrow(error?)\` | 抛错 |
| \`.toBeInstanceOf(Class)\` | 实例 |
| \`.toMatch(regexp)\` | 正则匹配 |
| \`.resolves / .rejects\` | Promise 断言 |

#### before/after 钩子

\`\`\`ts
beforeAll(() => { /* 所有测试前执行一次 */ });
afterAll(() => { /* 所有测试后执行一次 */ });
beforeEach(() => { /* 每个测试前执行 */ });
afterEach(() => { /* 每个测试后执行 */ });
\`\`\`

### 5. Mock 与 Spy

#### jest.fn() 创建 mock 函数

\`\`\`ts
const mockCallback = jest.fn();
[1, 2, 3].forEach(mockCallback);
expect(mockCallback).toHaveBeenCalledTimes(3);
expect(mockCallback).toHaveBeenCalledWith(2, 1, [1,2,3]);
\`\`\`

#### jest.spyOn 监视对象方法

\`\`\`ts
const spy = jest.spyOn(console, 'log');
doSomething();
expect(spy).toHaveBeenCalledWith('hello');
spy.mockRestore(); // 恢复
\`\`\`

#### jest.mock 模块 mock

\`\`\`ts
jest.mock('./api', () => ({
  fetchUser: jest.fn().mockResolvedValue({ id: 1, name: 'Tom' }),
}));
\`\`\`

### 6. 类型测试（TS 独有）

类型测试是验证"类型推导是否符合预期"。TS 编译期不做这个，需要专门工具。

#### expectTypeOf (vitest)

\`\`\`ts
import { expectTypeOf } from 'vitest';
import { add } from './math';

expectTypeOf(add).parameter(0).toMatchTypeOf<number>();
expectTypeOf(add).returns.toMatchTypeOf<number>();
expectTypeOf(add(1, 2)).toEqualTypeOf<number>();
\`\`\`

#### tsd

tsd 是专门的类型测试工具，在 \`.test-d.ts\` 文件里写类型断言：

\`\`\`ts
import { expectType } from 'tsd';
import { add } from './math';

expectType<number>(add(1, 2));
expectError(add('a', 'b')); // 期望这里类型错误
\`\`\`

#### 为什么要测类型

库作者尤其需要——确保 API 的类型签名正确，且错误用法会被类型系统拒绝。

\`\`\`ts
// 测试：错误用法应该被类型系统拒绝
expectType<never>(add('a', 'b' as never)); // 不应该能传入 string
\`\`\`

### 7. 快照测试

\`\`\`ts
it('配置快照', () => {
  expect(generateConfig()).toMatchInlineSnapshot(\`
    Object {
      "port": 3000,
      "host": "localhost",
    }
  \`);
});
\`\`\`

快照测试把输出序列化后与上次保存的快照对比。适合 UI 渲染、配置生成、序列化结果。**慎用**：快照变了不代表错了，需要人工 review。

### 8. 覆盖率

\`\`\`bash
jest --coverage
\`\`\`

覆盖率指标：
- **Line coverage**：执行到的代码行比例。
- **Branch coverage**：分支覆盖（if/else 两边都测到）。
- **Function coverage**：函数被调用比例。
- **Statement coverage**：语句覆盖。

| 指标 | 建议门槛 |
| --- | --- |
| 行覆盖 | 80% |
| 分支覆盖 | 75% |
| 函数覆盖 | 80% |

⚠️ 覆盖率高 ≠ 测试质量高。100% 行覆盖可能漏掉边界条件。

### 9. TDD（测试驱动开发）

TDD 流程：**Red → Green → Refactor**。

1. **Red**：先写测试，测试失败（功能还没实现）。
2. **Green**：写最少代码让测试通过。
3. **Refactor**：重构代码，保持测试通过。

TDD 的好处：迫使你先想清楚接口和行为，再写实现。适合复杂逻辑、算法、库 API 设计。

### 10. 测试最佳实践

1. **测试行为，不测试实现**：测"输出对不对"，不测"内部用了哪个变量"。
2. **每个测试独立**：不依赖执行顺序，用 beforeEach 重置状态。
3. **命名清晰**：\`it('当输入为空时返回 0')\` 而非 \`it('test1')\`。
4. **AAA 模式**：Arrange（准备）→ Act（执行）→ Assert（断言）。
5. **mock 谨慎**：mock 太多测试就失去意义，优先测真实逻辑。
6. **测试快**：单元测试毫秒级，慢测试会被跳过。

### 本章小结

测试是工程化的核心。Jest/Vitest 配合 TS 提供完整的测试方案，类型测试（expectTypeOf/tsd）是 TS 独有的维度。遵循测试金字塔，单元测试为主，集成/E2E 为辅。TDD 是高质量代码的方法论。

下面的代码 demo 模拟实现一个简易测试框架（describe/it/expect），演示类型测试的概念，并展示测试套件结构。`,
    code: `// ============================================================
// 测试与类型测试 —— 代码演示
// ------------------------------------------------------------
// 沙箱不能 require jest/vitest，所以从零实现一个简易测试框架，
// 演示 describe/it/expect/mock 的核心机制，并展示类型测试概念。
// ============================================================

// ---- 1. 实现简易测试框架 ----
console.log("========== 1. 简易测试框架 ==========");

// 测试结果类型
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

// 全局测试套件
let currentSuite: { name: string; tests: Array<() => void>; results: TestResult[] } | null = null;
const allSuites: { name: string; tests: Array<() => void>; results: TestResult[] }[] = [];

// describe: 创建测试分组
function describe(name: string, fn: () => void): void {
  const suite = { name: name, tests: [] as Array<() => void>, results: [] as TestResult[] };
  const prev = currentSuite;
  currentSuite = suite;
  fn(); // 收集 it 注册的测试
  currentSuite = prev;
  allSuites.push(suite);
}

// it: 注册一个测试用例
function it(name: string, fn: () => void): void {
  // 在注册时捕获当前 suite 的引用。若闭包直接引用可变的 currentSuite，
  // describe 结束后 currentSuite 会被还原为 null，运行测试时
  // currentSuite.results 会抛 "Cannot read properties of null"。
  const suite = currentSuite;
  if (suite) {
    suite.tests.push(function () {
      try {
        fn();
        suite.results.push({ name: name, passed: true });
      } catch (e) {
        suite.results.push({
          name: name,
          passed: false,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    });
  }
}

// expect: 断言工厂
function expect<T>(actual: T): {
  toBe: (expected: T) => void;
  toEqual: (expected: T) => void;
  toBeTruthy: () => void;
  toBeFalsy: () => void;
  toContain: (item: any) => void;
  toThrow: () => void;
} {
  return {
    toBe: function (expected: T): void {
      if (actual !== expected) {
        throw new Error("期望 " + JSON.stringify(actual) + " === " + JSON.stringify(expected));
      }
    },
    toEqual: function (expected: T): void {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error("期望深度相等: " + JSON.stringify(actual) + " vs " + JSON.stringify(expected));
      }
    },
    toBeTruthy: function (): void {
      if (!actual) throw new Error("期望真值, 得到 " + JSON.stringify(actual));
    },
    toBeFalsy: function (): void {
      if (actual) throw new Error("期望假值, 得到 " + JSON.stringify(actual));
    },
    toContain: function (item: any): void {
      if (Array.isArray(actual)) {
        if (!actual.includes(item)) {
          throw new Error("期望数组包含 " + JSON.stringify(item));
        }
      } else if (typeof actual === "string") {
        if (!actual.includes(item)) {
          throw new Error("期望字符串包含 " + JSON.stringify(item));
        }
      }
    },
    toThrow: function (): void {
      if (typeof actual !== "function") {
        throw new Error("toThrow 只能用于函数");
      }
      let threw = false;
      try {
        (actual as any)();
      } catch (e) {
        threw = true;
      }
      if (!threw) throw new Error("期望函数抛错, 但没有抛");
    },
  };
}

// 运行所有测试
function runAllTests(): void {
  let totalPassed = 0;
  let totalFailed = 0;
  for (const suite of allSuites) {
    console.log("\\n📋 " + suite.name);
    for (const test of suite.tests) {
      test();
    }
    for (const result of suite.results) {
      const mark = result.passed ? "  ✅" : "  ❌";
      console.log(mark + " " + result.name);
      if (!result.passed && result.error) {
        console.log("     " + result.error);
      }
      if (result.passed) totalPassed++;
      else totalFailed++;
    }
  }
  console.log("\\n📊 测试结果: " + totalPassed + " passed, " + totalFailed + " failed");
}

// ---- 2. 被测代码 ----
console.log("\\n========== 2. 被测函数 ==========");

function add(a: number, b: number): number {
  return a + b;
}
function divide(a: number, b: number): number {
  if (b === 0) throw new Error("除数不能为 0");
  return a / b;
}
function unique(arr: number[]): number[] {
  return Array.from(new Set(arr));
}
interface User {
  id: number;
  name: string;
}
function findUser(users: User[], id: number): User | undefined {
  return users.find(function (u) { return u.id === id; });
}

console.log("被测函数: add, divide, unique, findUser");

// ---- 3. 编写测试套件 ----
console.log("\\n========== 3. 编写测试套件 ==========");

describe("add 函数", function () {
  it("两正数相加", function () {
    expect(add(1, 2)).toBe(3);
  });
  it("负数相加", function () {
    expect(add(-1, -2)).toBe(-3);
  });
  it("加零不变", function () {
    expect(add(5, 0)).toBe(5);
  });
});

describe("divide 函数", function () {
  it("正常除法", function () {
    expect(divide(10, 2)).toBe(5);
  });
  it("除以 0 抛错", function () {
    expect(function () { divide(1, 0); }).toThrow();
  });
});

describe("unique 函数", function () {
  it("去重", function () {
    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
  });
  it("空数组", function () {
    expect(unique([])).toEqual([]);
  });
});

describe("findUser 函数", function () {
  const users: User[] = [
    { id: 1, name: "Tom" },
    { id: 2, name: "Jerry" },
  ];
  it("找到用户", function () {
    expect(findUser(users, 1)?.name).toBe("Tom");
  });
  it("找不到返回 undefined", function () {
    expect(findUser(users, 99)).toBeFalsy();
  });
});

// 运行测试
runAllTests();

// ---- 4. Mock 与 Spy 概念演示 ----
console.log("\\n========== 4. Mock 与 Spy ==========");

// 简易 mock 函数
function createMock<T extends (...args: any[]) => any>(impl?: T): {
  mock: (...args: Parameters<T>) => ReturnType<T>;
  calls: any[][];
  results: any[];
  mockReturnValue: (val: ReturnType<T>) => void;
  mockImplementation: (fn: T) => void;
} {
  const calls: any[][] = [];
  const results: any[] = [];
  let currentImpl = impl || (function () { return undefined as any; });
  let returnValue: any;
  let useReturnValue = false;
  const mock = function (...args: any[]): any {
    calls.push(args);
    let result: any;
    if (useReturnValue) {
      result = returnValue;
    } else {
      result = currentImpl(...args);
    }
    results.push(result);
    return result;
  } as any;
  return {
    mock: mock,
    calls: calls,
    results: results,
    mockReturnValue: function (val: ReturnType<T>): void {
      returnValue = val;
      useReturnValue = true;
    },
    mockImplementation: function (fn: T): void {
      currentImpl = fn;
      useReturnValue = false;
    },
  };
}

// 使用 mock
const mockCallback = createMock(function (x: number) { return x * 2; });
[1, 2, 3].forEach(function (x) { mockCallback.mock(x); });
console.log("mock 被调用次数:", mockCallback.calls.length);
console.log("mock 调用参数:", JSON.stringify(mockCallback.calls));
console.log("mock 返回值:", JSON.stringify(mockCallback.results));

// 改变 mock 返回值
mockCallback.mockReturnValue(999 as any);
console.log("改返回值后调用:", mockCallback.mock(5));

// ---- 5. 类型测试概念演示 ----
console.log("\\n========== 5. 类型测试概念 ==========");

// 类型测试验证"类型推导是否符合预期"
// 真实工具: vitest 的 expectTypeOf / tsd
// 这里用 TS 的条件类型模拟类型断言的概念

// 辅助类型：检查两个类型是否完全相同
type IsExact<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;

// 用类型变量"记录"类型测试结果（编译期存在，运行时擦除）
type Test1 = IsExact<ReturnType<typeof add>, number>; // 期望 true
type Test2 = IsExact<Parameters<typeof add>[0], number>; // 期望 true

// 运行时打印概念说明
console.log("类型测试（编译期执行，运行时擦除）:");
console.log("  expectTypeOf(add).returns.toMatchTypeOf<number>()");
console.log("  → 验证 add 的返回类型是 number ✓");
console.log("  expectTypeOf(add).parameter(0).toMatchTypeOf<number>()");
console.log("  → 验证 add 第一个参数类型是 number ✓");

// 模拟 tsd 的 expectError：错误用法应被类型系统拒绝
// 真实代码: expectError(add('a', 'b'));
console.log("  expectError(add('a', 'b'))");
console.log("  → 验证 add 不接受 string 参数 ✓（TS 编译期报错）");

// ---- 6. 快照测试概念 ----
console.log("\\n========== 6. 快照测试概念 ==========");

function generateConfig(): { port: number; host: string; debug: boolean } {
  return { port: 3000, host: "localhost", debug: false };
}

const snapshot = JSON.stringify(generateConfig(), null, 2);
const savedSnapshot = '{\\n  "port": 3000,\\n  "host": "localhost",\\n  "debug": false\\n}';

console.log("生成快照:");
console.log(snapshot);
if (snapshot === savedSnapshot) {
  console.log("✅ 快照匹配（与上次保存的一致）");
} else {
  console.log("❌ 快照不匹配，请 review 是否符合预期");
}

// ---- 7. 覆盖率概念 ----
console.log("\\n========== 7. 覆盖率概念 ==========");

// 模拟覆盖率统计
const coverage = {
  lines: { total: 100, covered: 92, pct: 92 },
  branches: { total: 20, covered: 15, pct: 75 },
  functions: { total: 10, covered: 9, pct: 90 },
  statements: { total: 100, covered: 92, pct: 92 },
};

console.log("覆盖率报告:");
console.log("  行覆盖: " + coverage.lines.pct + "% (" + coverage.lines.covered + "/" + coverage.lines.total + ")");
console.log("  分支覆盖: " + coverage.branches.pct + "% (" + coverage.branches.covered + "/" + coverage.branches.total + ")");
console.log("  函数覆盖: " + coverage.functions.pct + "% (" + coverage.functions.covered + "/" + coverage.functions.total + ")");

const thresholds = { lines: 80, branches: 75, functions: 80 };
let passed = true;
for (const key of Object.keys(thresholds) as Array<"lines" | "branches" | "functions">) {
  if (coverage[key].pct < thresholds[key]) {
    console.log("  ❌ " + key + " 覆盖率 " + coverage[key].pct + "% 低于门槛 " + thresholds[key] + "%");
    passed = false;
  } else {
    console.log("  ✅ " + key + " 覆盖率达标");
  }
}
console.log(passed ? "✅ 覆盖率门槛通过" : "❌ 覆盖率门槛未通过");

// ---- 8. TDD 流程演示 ----
console.log("\\n========== 8. TDD 流程 ==========");

console.log("TDD: Red → Green → Refactor");
console.log("  1. Red:   先写测试 it('fizzbuzz(3)=Fizz', ...) → 失败（功能没实现）");
console.log("  2. Green: 写最少代码让测试通过");
console.log("  3. Refactor: 重构，保持测试通过");

// 实现一个 fizzBuzz
function fizzBuzz(n: number): string {
  if (n % 15 === 0) return "FizzBuzz";
  if (n % 3 === 0) return "Fizz";
  if (n % 5 === 0) return "Buzz";
  return String(n);
}

// 用我们的框架测它
describe("fizzBuzz (TDD 成果)", function () {
  it("3 的倍数返回 Fizz", function () {
    expect(fizzBuzz(3)).toBe("Fizz");
  });
  it("5 的倍数返回 Buzz", function () {
    expect(fizzBuzz(5)).toBe("Buzz");
  });
  it("15 的倍数返回 FizzBuzz", function () {
    expect(fizzBuzz(15)).toBe("FizzBuzz");
  });
  it("其他返回数字字符串", function () {
    expect(fizzBuzz(7)).toBe("7");
  });
});

runAllTests();

console.log("\\n测试与类型测试章节演示完成！");`,
  },

  // =========================================================
  // 第三章：调试技巧
  // =========================================================
  {
    id: "ts-debugging",
    title: "调试技巧",
    icon: "🐛",
    group: "工程化进阶",
    content: `## 调试技巧

调试是程序员日常工作的核心。TypeScript 增加了一层"类型错误"的调试维度——除了运行时 bug，你还要处理编译期的类型错误。本章极其详细地讲解 source map 原理与配置、VS Code 调试 TS、Node.js inspect 模式、断点类型、类型错误调试技巧、运行时类型检查（zod/io-ts），以及常见类型错误信息解读。

### 1. Source Map 原理与配置

#### 什么是 source map

TypeScript 编译后会生成 JS 文件，但调试时你想看的是**原始 TS 代码**。source map 是一个 \`.map\` 文件，记录"编译后 JS 的每个位置"对应"原始 TS 的哪个位置"，让调试器能把断点映射回源码。

\`\`\`
app.ts (源码)  →  编译  →  app.js (运行) + app.js.map (映射)
                                   ↑
                          调试器读 .map 把运行时位置映射回 app.ts
\`\`\`

#### .map 文件结构

\`\`\`json
{
  "version": 3,
  "file": "app.js",
  "sourceRoot": "",
  "sources": ["../src/app.ts"],
  "names": ["greet", "name"],
  "mappings": "AAAA,SAASA..."
}
\`\`\`

- \`version\`：source map 版本（3）。
- \`sources\`：原始源文件路径。
- \`names\`：标识符列表。
- \`mappings\`：VLQ 编码的位置映射（核心）。

#### tsconfig 配置

\`\`\`json
{
  "compilerOptions": {
    "sourceMap": true,           // 生成 .map 文件
    "inlineSourceMap": false,    // 是否内联到 JS 注释
    "sourceRoot": "./src",       // 源文件根目录
    "mapRoot": "./maps",         // .map 根目录
    "inlineSources": false       // 是否把源码也内联进 .map
  }
}
\`\`\`

| 选项 | 说明 | 使用场景 |
| --- | --- | --- |
| \`sourceMap\` | 独立 .map 文件 | 开发 |
| \`inlineSourceMap\` | 内联到 JS | 单文件部署 |
| \`inlineSources\` | 源码内联到 map | 生产调试（保留源码） |

⚠️ **生产环境慎用 source map**：会把源码暴露给用户。可用 hidden source map（不引用，仅上传到错误监控服务如 Sentry）。

### 2. VS Code 调试 TypeScript

#### launch.json 配置

\`\`\`json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "调试当前 TS 文件",
      "runtimeArgs": ["-r", "ts-node/register", "\${file}"],
      "cwd": "\${workspaceFolder}",
      "sourceMaps": true,
      "outFiles": ["\${workspaceFolder}/dist/**/*.js"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "调试编译后的 JS",
      "program": "\${workspaceFolder}/dist/app.js",
      "sourceMaps": true,
      "outFiles": ["\${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
\`\`\`

#### 调试步骤

1. 在 TS 代码行号左侧点击，设置**断点**（红点）。
2. 按 F5 启动调试。
3. 程序在断点暂停，查看变量、调用栈、监视表达式。
4. F10 单步跳过、F11 单步进入、Shift+F11 跳出、F5 继续。

### 3. Node.js inspect 模式

不用 VS Code，直接命令行调试：

\`\`\`bash
node --inspect-brk dist/app.js
# 或调试 TS 源码
node --inspect-brk -r ts-node/register src/app.ts
\`\`\`

然后打开 Chrome \`chrome://inspect\`，点击 "inspect" 连接。 \`--inspect-brk\` 在第一行断住，\`--inspect\` 等断点。

### 4. 断点类型

| 断点类型 | 说明 | 用途 |
| --- | --- | --- |
| 普通断点 | 行号点击，无条件 | 通用 |
| 条件断点 | 右键 → Add Conditional Breakpoint | 循环里只在特定条件停 |
| 日志点 (Logpoint) | 不暂停，只输出日志 | 不能改代码的生产调试 |
| 函数断点 | 在函数入口断 | 不知函数在哪定义时 |
| 异常断点 | 抛异常时断 | 捕获未处理异常 |

#### 条件断点示例

调试循环时，只在 \`i === 50\` 时停下来：

\`\`\`ts
for (let i = 0; i < 1000; i++) {
  process(i); // 条件断点: i === 50
}
\`\`\`

### 5. 类型错误调试技巧

#### tsc --noEmit 只检查不输出

\`\`\`bash
npx tsc --noEmit
\`\`\`

只做类型检查，不生成 JS。CI 中常用。配合 \`--pretty\` 输出彩色错误。

#### IDE hover / quick info

鼠标悬停变量/函数，IDE 显示推导出的类型。这是日常最常用的调试手段——看到类型不符合预期，就找到了问题。

#### 类型断言辅助

不确定推导出的类型时，用"类型断言错误"强制查看：

\`\`\`ts
const x = someComplexExpression;
// 故意断言成 never，IDE 会报错并显示真实类型
const _check: never = x;
\`\`\`

#### satisfies 关键字

\`\`\`ts
const config = {
  port: 3000,
} satisfies { port: number }; // 既验证类型，又保留字面量类型推导
\`\`\`

### 6. 运行时类型检查

TS 类型在运行时被擦除，无法在运行时校验外部数据（如 API 响应、用户输入）。需要运行时类型检查库。

#### zod

\`\`\`ts
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof UserSchema>; // 从 schema 推导类型

const result = UserSchema.parse(unknownData); // 运行时校验，失败抛错
// 或 safeParse 不抛错
const safe = UserSchema.safeParse(unknownData);
if (safe.success) {
  safe.data; // 类型安全
} else {
  safe.error; // 错误详情
}
\`\`\`

zod 的核心价值：**一处定义，类型与校验同源**，避免类型和校验逻辑分离导致不一致。

#### io-ts

\`\`\`ts
import * as t from 'io-ts';
import { isRight } from 'fp-ts/Either';

const UserCodec = t.type({
  id: t.number,
  name: t.string,
});

const result = UserCodec.decode(unknownData);
if (isRight(result)) {
  result.right; // 类型安全
}
\`\`\`

#### ts-runtime-checks

编译期生成校验代码，无运行时依赖：

\`\`\`ts
import { Assert } from 'ts-runtime-checks';

function process(@Assert data: User) {
  // 编译期自动插入校验代码
}
\`\`\`

#### 对比

| 库 | 运行时依赖 | API 风格 | 体积 |
| --- | --- | --- | --- |
| zod | 有 | 链式 | 中 |
| io-ts | 有 + fp-ts | 函数式 | 大 |
| ts-runtime-checks | 无（编译生成） | 装饰器 | 小 |

### 7. 常见类型错误信息解读

#### TS2322: Type 'X' is not assignable to type 'Y'

最常见的错误。仔细读错误信息，它会显示两个类型的结构差异。

\`\`\`ts
let x: number = "string";
// TS2322: Type 'string' is not assignable to type 'number'.
\`\`\`

#### TS2339: Property 'X' does not exist on type 'Y'

访问了类型上不存在的属性。常见于联合类型未收窄：

\`\`\`ts
interface Cat { meow(): void }
interface Dog { bark(): void }
function speak(animal: Cat | Dog) {
  animal.meow(); // TS2339: Dog 没有 meow
}
// 解决: 用类型守卫收窄
if ('meow' in animal) animal.meow();
\`\`\`

#### TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'

函数参数类型不匹配。

#### TS2554: Expected N arguments, but got M

参数数量不对。

#### TS7006: Parameter 'X' implicitly has an 'any' type

隐式 any，开启 \`noImplicitAny\` 后报错。

#### TS18046: 'X' is of type 'unknown'

用了 \`unknown\` 类型的值却没先收窄。需要类型守卫或断言。

### 8. 调试最佳实践

1. **先复现**：稳定复现 bug 是调试的第一步。
2. **二分法**：注释掉一半代码，看 bug 是否还在，缩小范围。
3. **看错误堆栈**：从顶到底读，第一个用户代码帧通常是问题所在。
4. **小黄鸭调试**：向别人（或鸭子）解释代码，常能自己发现问题。
5. **git bisect**：用二分查找定位引入 bug 的 commit。
6. **加日志而非断点**：间歇性问题用日志点更可靠。

### 本章小结

调试分两类：**运行时 bug** 用断点/日志/source map，**类型错误** 用 tsc --noEmit / IDE hover / 类型断言辅助。运行时类型检查（zod）弥补 TS 类型擦除的不足，校验外部数据。读懂常见类型错误信息能极大提升排错效率。

下面的代码 demo 模拟 source map 的解析逻辑、实现简易运行时类型校验（模拟 zod），并演示常见类型错误的运行时表现。`,
    code: `// ============================================================
// 调试技巧 —— 代码演示
// ------------------------------------------------------------
// 沙箱不能 require zod/source-map，所以用对象字面量模拟 source
// map 结构，实现一个简易运行时类型校验器（模拟 zod），并演示常见
// 类型错误的运行时表现。
// ============================================================

// ---- 1. Source Map 概念与解析模拟 ----
console.log("========== 1. Source Map 解析模拟 ==========");

// 模拟一个真实的 source map 文件内容
interface SourceMap {
  version: number;
  file: string;
  sourceRoot?: string;
  sources: string[];
  names: string[];
  mappings: string;
}

// 模拟 TS 编译生成的 source map
const fakeSourceMap: SourceMap = {
  version: 3,
  file: "app.js",
  sourceRoot: "",
  sources: ["../src/app.ts", "../src/utils.ts"],
  names: ["greet", "name", "console", "log", "formatDate", "date"],
  // 真实 mappings 是 VLQ 编码，这里用简化表示
  mappings: "AAAA,SAASA,MAAMC;AACb,OAAOC,QAAQC,GAAG,CAACF;",
};

console.log("Source Map 内容:");
console.log(JSON.stringify(fakeSourceMap, null, 2));

// 简易 mappings 解析（真实用 VLQ 解码，这里简化为位置数组）
interface MappingEntry {
  generatedLine: number;
  generatedColumn: number;
  sourceIndex: number;
  sourceLine: number;
  sourceColumn: number;
  nameIndex?: number;
}

function parseMappings(map: SourceMap): MappingEntry[] {
  // 真实情况需要解码 VLQ base64 字符串
  // 这里返回模拟的解析结果
  return [
    { generatedLine: 1, generatedColumn: 0, sourceIndex: 0, sourceLine: 1, sourceColumn: 0, nameIndex: 0 },
    { generatedLine: 1, generatedColumn: 9, sourceIndex: 0, sourceLine: 1, sourceColumn: 9, nameIndex: 1 },
    { generatedLine: 2, generatedColumn: 2, sourceIndex: 0, sourceLine: 2, sourceColumn: 2, nameIndex: 2 },
  ];
}

const entries = parseMappings(fakeSourceMap);
console.log("\\n解析出的位置映射:");
for (const e of entries) {
  console.log(
    "  app.js:" + (e.generatedLine) + ":" + (e.generatedColumn) +
    " → " + fakeSourceMap.sources[e.sourceIndex] + ":" + (e.sourceLine) + ":" + (e.sourceColumn) +
    (e.nameIndex !== undefined ? " (name: " + fakeSourceMap.names[e.nameIndex] + ")" : "")
  );
}

// 模拟调试器：运行时报错时用 source map 定位源码
console.log("\\n模拟调试器定位错误:");
const errorLine = 2;
const errorCol = 2;
const matched = entries.find(function (e) { return e.generatedLine === errorLine && e.generatedColumn === errorCol; });
if (matched) {
  console.log("  运行时错误在 app.js:" + errorLine + ":" + errorCol);
  console.log("  Source Map 映射到源码: " + fakeSourceMap.sources[matched.sourceIndex] + ":" + matched.sourceLine);
  console.log("  → 调试器在此处显示原始 TS 代码");
}

// ---- 2. 简易运行时类型校验器（模拟 zod）----
console.log("\\n========== 2. 运行时类型校验器（模拟 zod）==========");

// 校验器接口
interface Validator<T> {
  parse(input: unknown): T;           // 校验，失败抛错
  safeParse(input: unknown): { success: boolean; data?: T; error?: string };
}

// 字符串校验器
function zString(): Validator<string> {
  return {
    parse: function (input: unknown): string {
      if (typeof input !== "string") {
        throw new Error("期望 string, 得到 " + typeof input);
      }
      return input;
    },
    safeParse: function (input: unknown) {
      if (typeof input !== "string") {
        return { success: false, error: "期望 string, 得到 " + typeof input };
      }
      return { success: true, data: input };
    },
  };
}

// 数字校验器
function zNumber(): Validator<number> {
  return {
    parse: function (input: unknown): number {
      if (typeof input !== "number" || isNaN(input)) {
        throw new Error("期望 number, 得到 " + typeof input);
      }
      return input;
    },
    safeParse: function (input: unknown) {
      if (typeof input !== "number" || isNaN(input)) {
        return { success: false, error: "期望 number, 得到 " + typeof input };
      }
      return { success: true, data: input };
    },
  };
}

// 布尔校验器
function zBoolean(): Validator<boolean> {
  return {
    parse: function (input: unknown): boolean {
      if (typeof input !== "boolean") {
        throw new Error("期望 boolean, 得到 " + typeof input);
      }
      return input;
    },
    safeParse: function (input: unknown) {
      if (typeof input !== "boolean") {
        return { success: false, error: "期望 boolean, 得到 " + typeof input };
      }
      return { success: true, data: input };
    },
  };
}

// 对象校验器工厂
function zObject<T extends Record<string, Validator<any>>>(
  shape: T
): Validator<{ [K in keyof T]: T[K] extends Validator<infer U> ? U : never }> {
  return {
    parse: function (input: unknown): any {
      if (typeof input !== "object" || input === null) {
        throw new Error("期望 object, 得到 " + typeof input);
      }
      const result: any = {};
      for (const key of Object.keys(shape) as Array<keyof T>) {
        const value = (input as any)[key];
        result[key] = shape[key].parse(value);
      }
      return result;
    },
    safeParse: function (input: unknown): any {
      if (typeof input !== "object" || input === null) {
        return { success: false, error: "期望 object, 得到 " + typeof input };
      }
      const result: any = {};
      for (const key of Object.keys(shape) as Array<keyof T>) {
        const value = (input as any)[key];
        const r = shape[key].safeParse(value);
        if (!r.success) {
          return { success: false, error: "字段 '" + String(key) + "': " + r.error };
        }
        result[key] = r.data;
      }
      return { success: true, data: result };
    },
  };
}

// 数组校验器
function zArray<T>(itemValidator: Validator<T>): Validator<T[]> {
  return {
    parse: function (input: unknown): T[] {
      if (!Array.isArray(input)) {
        throw new Error("期望 array, 得到 " + typeof input);
      }
      return input.map(function (item) { return itemValidator.parse(item); });
    },
    safeParse: function (input: unknown): any {
      if (!Array.isArray(input)) {
        return { success: false, error: "期望 array, 得到 " + typeof input };
      }
      const result: any[] = [];
      for (let i = 0; i < input.length; i++) {
        const r = itemValidator.safeParse(input[i]);
        if (!r.success) {
          return { success: false, error: "索引 " + i + ": " + r.error };
        }
        result.push(r.data);
      }
      return { success: true, data: result };
    },
  };
}

// 使用校验器定义 schema（模拟 zod）
const UserSchema = zObject({
  id: zNumber(),
  name: zString(),
  email: zString(),
  isActive: zBoolean(),
  tags: zArray(zString()),
});

// 类型从 schema 推导（模拟 z.infer）
type User = { id: number; name: string; email: string; isActive: boolean; tags: string[] };

console.log("定义 UserSchema，校验对象 { id, name, email, isActive, tags }");

// 测试合法数据
const validData = {
  id: 1,
  name: "Tom",
  email: "tom@example.com",
  isActive: true,
  tags: ["admin", "user"],
};
const validResult = UserSchema.safeParse(validData);
console.log("\\n合法数据校验:");
console.log("  success:", validResult.success);
if (validResult.success) {
  console.log("  data:", JSON.stringify(validResult.data));
  // 此时 data 类型安全，可当 User 使用
  const user: User = validResult.data;
  console.log("  作为 User 类型使用: name =", user.name);
}

// 测试非法数据
const invalidData = {
  id: "not a number",  // ❌ 应为 number
  name: "Tom",
  email: "tom@example.com",
  isActive: "yes",      // ❌ 应为 boolean
  tags: "not an array", // ❌ 应为 array
};
const invalidResult = UserSchema.safeParse(invalidData);
console.log("\\n非法数据校验:");
console.log("  success:", invalidResult.success);
if (!invalidResult.success) {
  console.log("  error:", invalidResult.error);
}

// ---- 3. 常见类型错误的运行时表现 ----
console.log("\\n========== 3. 常见类型错误的运行时表现 ==========");

// TS2322: Type 'string' is not assignable to type 'number'
console.log("[TS2322] 类型不匹配:");
console.log("  编译期: let x: number = 'string';  → 报错");
console.log("  运行时: TS 类型擦除，若绕过编译则:");
let x: any = "string"; // 用 any 绕过类型检查（模拟）
const numOp = (Number(x) * 2); // 运行时字符串 * 数字 → NaN
console.log("  'string' * 2 =", numOp, "（NaN，运行时错误）");

// TS2339: Property does not exist
console.log("\\n[TS2339] 属性不存在:");
interface Cat { meow(): void }
interface Dog { bark(): void }
function makeSound(animal: Cat | Dog): void {
  // 编译期 animal.meow() 报错（Dog 没有 meow）
  // 运行时若不收窄，可能在 Dog 上调用 meow → undefined is not a function
  if ("meow" in animal) {
    animal.meow();
    console.log("  类型守卫收窄后调用 meow ✓");
  } else {
    animal.bark();
    console.log("  类型守卫收窄后调用 bark ✓");
  }
}
makeSound({ meow: function () { console.log("  meow!"); } });
makeSound({ bark: function () { console.log("  bark!"); } } as any);

// TS18046: 'X' is of type 'unknown'
console.log("\\n[TS18046] unknown 类型:");
function processUnknown(data: unknown): string {
  // data.foo(); // 编译期报错：data 是 unknown
  // 必须先收窄
  if (typeof data === "string") {
    return data.toUpperCase();
  }
  if (typeof data === "number") {
    return String(data * 2);
  }
  return "unknown type";
}
console.log("  processUnknown('hello') =", processUnknown("hello"));
console.log("  processUnknown(21) =", processUnknown(21));

// ---- 4. 条件断点概念演示 ----
console.log("\\n========== 4. 条件断点概念 ==========");

// 模拟调试器在条件断点处只在条件满足时暂停
function debugLoop(): void {
  console.log("模拟循环 + 条件断点 (i === 5 时暂停):");
  for (let i = 0; i < 10; i++) {
    // 模拟条件断点: condition = (i === 5)
    const breakCondition = i === 5;
    if (breakCondition) {
      console.log("  🛑 条件断点命中: i =", i, "（此时可查看变量/调用栈）");
    }
    // 模拟日志点: 不暂停，只输出
    if (i === 3) {
      console.log("  📝 日志点: i =", i);
    }
  }
}
debugLoop();

// ---- 5. tsc --noEmit 概念 ----
console.log("\\n========== 5. tsc --noEmit 类型检查 ==========");

// 模拟 tsc --noEmit 的输出
const mockTscOutput = [
  "src/app.ts(12,5): error TS2322: Type 'string' is not assignable to type 'number'.",
  "src/app.ts(25,10): error TS2339: Property 'meow' does not exist on type 'Dog'.",
  "src/utils.ts(8,3): error TS7006: Parameter 'data' implicitly has an 'any' type.",
  "",
  "Found 3 errors in 2 files.",
];

console.log("模拟 $ npx tsc --noEmit 输出:");
for (const line of mockTscOutput) {
  console.log(line ? "  " + line : "");
}

// 解析错误位置
console.log("\\n解析错误位置:");
for (const line of mockTscOutput) {
  const match = line.match(/(.+?)\\((\\d+),(\\d+)\\): (error|warning) (TS\\d+): (.+)/);
  if (match) {
    console.log("  文件: " + match[1] + " 行 " + match[2] + " 列 " + match[3]);
    console.log("  级别: " + match[4] + " 代码: " + match[5]);
    console.log("  信息: " + match[6]);
    console.log("");
  }
}

// ---- 6. 调试技巧总结 ----
console.log("========== 6. 调试技巧速查 ==========");
console.log("运行时 bug:  断点 + 日志 + source map + Node inspect");
console.log("类型错误:    tsc --noEmit + IDE hover + 类型断言辅助");
console.log("运行时校验:  zod/io-ts 校验外部数据");
console.log("二分法:      注释一半代码缩小范围");
console.log("git bisect:  二分查找引入 bug 的 commit");

console.log("\\n调试技巧章节演示完成！");`,
  },

  // =========================================================
  // 第四章：JS 到 TS 迁移指南
  // =========================================================
  {
    id: "ts-migration",
    title: "JS 到 TS 迁移指南",
    icon: "🔄",
    group: "工程化进阶",
    content: `## JS 到 TS 迁移指南

把现有 JavaScript 项目迁移到 TypeScript 是许多团队面临的任务。直接全量重写风险大、周期长，**渐进式迁移**是业界公认的最佳策略。本章极其详细地讲解迁移策略（allowJs/checkJs/渐进式）、rename .js to .ts 的步骤、添加类型注解的顺序、处理第三方库 @types、JSDoc 到 TS 注解转换、常见陷阱、monorepo 迁移、迁移检查清单。

### 1. 迁移策略总览

#### 三种迁移路径

| 策略 | 做法 | 优点 | 缺点 | 适用 |
| --- | --- | --- | --- | --- |
| 全量重写 | 整个项目用 TS 重写 | 彻底 | 风险大、周期长 | 小项目/重写期 |
| 渐进式（推荐） | allowJs + 逐文件迁移 | 风险低、可迭代 | 长期混合 | 大多数项目 |
| JSDoc 增强 | 不改扩展名，用 JSDoc 加类型 | 零侵入 | 表达力有限 | 不能改扩展名的项目 |

**渐进式迁移**是主流选择：开启 \`allowJs\` 让 TS 与 JS 共存，逐个文件把 .js 改成 .ts 并补充类型，最终全量 TS。

#### 渐进式迁移的核心配置

\`\`\`json
{
  "compilerOptions": {
    "allowJs": true,           // 允许编译 .js 文件
    "checkJs": false,          // 是否检查 .js（初期关，后期开）
    "noImplicitAny": false,    // 初期关闭，逐步收紧
    "outDir": "./dist",
    "esModuleInterop": true
  },
  "include": ["src/**/*"]
}
\`\`\`

迁移初期：\`allowJs: true\` + \`checkJs: false\` + \`noImplicitAny: false\`，让 TS 接受现有 JS 而不报错。随着迁移推进，逐步开启严格选项。

### 2. 迁移步骤

#### 步骤一：基础设施

1. 安装 TS：\`npm install --save-dev typescript @types/node\`
2. 生成 tsconfig：\`npx tsc --init\`
3. 配置宽松选项（allowJs、noImplicitAny: false）。
4. 配置构建脚本：\`"build": "tsc"\`。

#### 步骤二：添加 @types

为第三方库安装类型声明：

\`\`\`bash
npm install --save-dev @types/lodash @types/express @types/jest
\`\`\`

如果一个库自带类型（package.json 有 \`"types"\` 字段），无需装 @types。

#### 步骤三：逐文件 rename .js → .ts

每次迁移一个文件：

1. 把 \`foo.js\` 重命名为 \`foo.ts\`。
2. 修复编译错误（先宽松，补充 \`any\` 也可以）。
3. 运行测试确保行为不变。
4. 提交。

⚠️ **一次只迁移一个文件**，不要批量改名后慢慢修——那样会在中间状态停留太久，难以回滚。

#### 步骤四：补充类型注解

迁移时优先给**公共 API**（导出的函数/类）补充类型，内部实现可以暂时用 \`any\`。

#### 步骤五：逐步收紧严格选项

\`\`\`json
{
  "compilerOptions": {
    "noImplicitAny": true,        // 第三阶段开启
    "strictNullChecks": true,     // 第四阶段开启
    "strict": true                // 最终目标
  }
}
\`\`\`

每开启一个严格选项，修复全量错误，再开下一个。

### 3. 添加类型注解的顺序

迁移一个函数时，按"参数 → 返回值 → 局部变量"的顺序补类型，效率最高：

\`\`\`js
// 原始 JS
function calculate(data, options) {
  const result = data.value * options.factor;
  return result;
}
\`\`\`

\`\`\`ts
// 第一步：参数类型
function calculate(
  data: { value: number },           // 参数
  options: { factor: number }        // 参数
) {
  const result = data.value * options.factor;
  return result;
}

// 第二步：返回值类型
function calculate(
  data: { value: number },
  options: { factor: number }
): number {                          // 返回值
  const result = data.value * options.factor;
  return result;
}

// 第三步：提取重复类型为接口
interface Data { value: number }
interface Options { factor: number }
function calculate(data: Data, options: Options): number {
  const result = data.value * options.factor;  // 局部变量类型由推导得出，无需显式
  return result;
}
\`\`\`

**局部变量优先用推导**，不要过度显式标注——\`const result = ...\` 的类型 TS 能推出，写出来是冗余。

### 4. 处理第三方库 @types

#### 自带类型的库

现代库（如 axios、zod）在 \`package.json\` 里有 \`"types"\` 字段，自带 .d.ts，无需额外安装。

\`\`\`json
// 库的 package.json
{
  "name": "axios",
  "types": "./index.d.ts"
}
\`\`\`

#### 需要 @types 的库

老库（如 lodash、express）自身没类型，需要安装 \`@types/xxx\`：

\`\`\`bash
npm install --save-dev @types/lodash @types/express
\`\`\`

\`@types\` 包来自 DefinitelyTyped 社区维护。

#### 没有类型的库

少数库既无自带类型也无 @types，需要自己写声明：

\`\`\`ts
// types/legacy-lib.d.ts
declare module 'legacy-lib' {
  export function doSomething(input: string): number;
  const _default: { doSomething: typeof doSomething };
  export default _default;
}
\`\`\`

#### 检查类型是否安装成功

\`\`\`bash
npx tsc --noEmit
\`\`\`

如果报 "Cannot find module 'xxx' or its corresponding type declarations"，说明类型没装好。

### 5. JSDoc 到 TS 注解转换

JSDoc 是 JS 的类型注释方式，TS 的 \`checkJs\` 能识别它。迁移时把 JSDoc 转成 TS 注解。

#### JSDoc 写法

\`\`\`js
/**
 * 计算两数之和
 * @param {number} a 第一个数
 * @param {number} b 第二个数
 * @returns {number} 和
 */
function add(a, b) {
  return a + b;
}

/** @type {{ name: string, age: number }} */
const user = { name: 'Tom', age: 18 };
\`\`\`

#### 转成 TS 注解

\`\`\`ts
/**
 * 计算两数之和
 */
function add(a: number, b: number): number {
  return a + b;
}

interface User { name: string; age: number }
const user: User = { name: 'Tom', age: 18 };
\`\`\`

#### JSDoc 到 TS 对照表

| JSDoc | TS |
| --- | --- |
| \`@param {number} a\` | \`a: number\` |
| \`@returns {string}\` | \`: string\` |
| \`@type {{ x: number }}\` | \`: { x: number }\` 或 interface |
| \`@typedef {Object} User\` | \`interface User\` |
| \`@type {Array<string>}\` | \`string[]\` |
| \`@type {string|null}\` | \`string \| null\` |

### 6. 常见陷阱

#### 陷阱1：any 滥用

迁移初期大量用 \`any\` 让代码编译通过，但 \`any\` 关闭了类型检查，等于没迁移。应：

- 公共 API 不用 \`any\`，用 \`unknown\` 或具体类型。
- 内部临时 \`any\` 标 TODO，逐步替换。

#### 陷阱2：类型过严导致运行时崩溃

\`\`\`ts
// 业务逻辑依赖隐式类型转换
function pad(n) { return n < 10 ? '0' + n : '' + n; }
// 迁移成：
function pad(n: number): string {
  return n < 10 ? '0' + n : '' + n;
}
// 看似没问题，但如果调用方传了字符串 '5'，运行时仍工作（JS 隐式转换）
// 但 TS 类型检查会报错 —— 需要审查所有调用方
\`\`\`

#### 陷阱3：循环依赖暴露

JS 里循环依赖靠运行时"懒加载"勉强工作，TS 严格检查下可能暴露类型错误（类型还没初始化）。需要重构解耦。

#### 陷阱4：默认导出与命名导出混淆

\`\`\`js
// JS: module.exports = foo
// TS 迁移时容易写成 export default foo
// 调用方 require('mod') 拿到的是 { default: foo }，行为变了
\`\`\`

迁移时保持导出方式与原 CommonJS 一致，或同步修改所有调用方。

#### 陷阱5：this 类型丢失

\`\`\`js
// JS
const obj = {
  count: 0,
  inc() { this.count++; }  // this 隐式
};
\`\`\`

\`\`\`ts
// TS
const obj = {
  count: 0,
  inc(this: { count: number }) { this.count++; }  // 显式 this 类型
};
\`\`\`

#### 陷阱6：window 全局变量

\`\`\`js
// JS
window.myGlobal = 123;
\`\`\`

\`\`\`ts
// TS 报错：Property 'myGlobal' does not exist on 'Window'
// 解决: 扩展 Window 接口
declare global {
  interface Window { myGlobal: number }
}
window.myGlobal = 123;
\`\`\`

### 7. Monorepo 迁移

#### 项目引用 Project References

大型 monorepo 用 TS 的 project references 分包编译：

\`\`\`json
// tsconfig.json (根)
{
  "files": [],
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/server" },
    { "path": "./packages/client" }
  ]
}
\`\`\`

\`\`\`json
// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "composite": true,        // 项目引用必须
    "declaration": true,
    "outDir": "./dist"
  }
}
\`\`\`

\`\`\`json
// packages/server/tsconfig.json
{
  "references": [{ "path": "../shared" }]
}
\`\`\`

#### 迁移顺序

1. 先迁移**叶子包**（无内部依赖的包，如 shared/utils）。
2. 再迁移**中间包**。
3. 最后迁移**应用包**（server/client）。

自底向上迁移，让上层包能立即享受下层包的类型。

### 8. 迁移检查清单

- [ ] 安装 typescript、@types/node
- [ ] 生成 tsconfig，配置 allowJs: true
- [ ] 安装所有第三方库的 @types
- [ ] 构建脚本支持 TS（tsc / ts-node）
- [ ] 测试框架支持 TS（ts-jest / @swc/jest）
- [ ] ESLint 配置 @typescript-eslint
- [ ] 逐文件迁移，每次一个 + 测试
- [ ] 公共 API 补充类型
- [ ] 开启 noImplicitAny
- [ ] 开启 strictNullChecks
- [ ] 开启 strict
- [ ] 移除 allowJs（全量 TS 后）

### 9. 迁移最佳实践

1. **小步快跑**：一次一个文件，频繁提交，易于回滚。
2. **测试先行**：迁移前确保有测试覆盖，迁移后跑测试验证。
3. **公共 API 优先**：导出的函数/类先补类型，内部实现后补。
4. **不追求一次完美**：先用 any 通过编译，留 TODO 逐步完善。
5. **统一团队规范**：迁移前约定好类型风格、any 使用策略。
6. **自动化工具**：用 \`ts-migrate\`（Airbnb 开源）批量转换。

### 本章小结

渐进式迁移是 JS → TS 的最佳路径：allowJs 让 JS/TS 共存，逐文件迁移，逐步收紧严格选项。添加类型按"参数 → 返回值 → 变量"顺序，公共 API 优先。警惕 any 滥用、循环依赖暴露、默认导出混淆等陷阱。monorepo 用 project references 自底向上迁移。

下面的代码 demo 演示同一功能的 JS 版与 TS 版对比、JSDoc 到 TS 注解的转换过程，以及迁移检查清单的运行时验证。`,
    code: `// ============================================================
// JS 到 TS 迁移指南 —— 代码演示
// ------------------------------------------------------------
// 演示同一功能的 JS 版与 TS 版对比、JSDoc 到 TS 注解转换、
// 迁移检查清单的运行时验证。代码本身是 TS，但通过注释展示
// JS 原貌与 TS 迁移后的差异。
// ============================================================

// ---- 1. 同一功能的 JS 版 vs TS 版对比 ----
console.log("========== 1. JS 版 vs TS 版对比 ==========");

// ============ 案例 A: 用户管理 ============
// --- JS 原始版本（注释展示）---
// /**
//  * 创建用户
//  * @param {Object} data 用户数据
//  * @param {string} data.name 姓名
//  * @param {number} data.age 年龄
//  * @returns {Object} 用户对象
//  */
// function createUser(data) {
//   if (!data.name) throw new Error('name required');
//   return { id: Math.random(), ...data, createdAt: new Date() };
// }
//
// const users = [];
// function findUser(id) {
//   return users.find(u => u.id === id);
// }

// --- TS 迁移版本 ---
// 第一步：定义接口（提取类型）
interface UserData {
  name: string;
  age: number;
  email?: string; // 可选属性
}

interface User {
  id: number;
  name: string;
  age: number;
  email?: string;
  createdAt: Date;
}

// 第二步：参数类型 + 返回值类型
function createUser(data: UserData): User {
  if (!data.name) throw new Error("name required");
  return {
    id: Math.random(),
    name: data.name,
    age: data.age,
    email: data.email,
    createdAt: new Date(),
  };
}

// 第三步：集合类型
const users: User[] = [];

function findUser(id: number): User | undefined {
  return users.find(function (u) { return u.id === id; });
}

// 使用
const user1 = createUser({ name: "Tom", age: 18, email: "tom@example.com" });
users.push(user1);
const found = findUser(user1.id);
console.log("案例 A: 创建用户 Tom");
console.log("  创建结果: name =", user1.name, "age =", user1.age);
console.log("  查找结果:", found ? "找到" : "未找到");

// ============ 案例 B: 计算器 ============
// --- JS 版 ---
// function calculate(a, b, op) {
//   switch (op) {
//     case 'add': return a + b;
//     case 'sub': return a - b;
//     default: throw new Error('unknown op');
//   }
// }

// --- TS 版：用字面量联合类型约束 op ---
type Operation = "add" | "sub" | "mul" | "div";

function calculate(a: number, b: number, op: Operation): number {
  switch (op) {
    case "add": return a + b;
    case "sub": return a - b;
    case "mul": return a * b;
    case "div":
      if (b === 0) throw new Error("除数不能为 0");
      return a / b;
  }
}

console.log("\\n案例 B: 计算器");
console.log("  calculate(10, 3, 'add') =", calculate(10, 3, "add"));
console.log("  calculate(10, 3, 'mul') =", calculate(10, 3, "mul"));
// calculate(10, 3, 'unknown'); // ❌ TS 编译期报错：'unknown' 不在 Operation 中
console.log("  → op 参数被字面量联合类型约束，传错值编译期就报错");

// ---- 2. JSDoc 到 TS 注解转换 ----
console.log("\\n========== 2. JSDoc 到 TS 注解转换 ==========");

// 展示转换对照
console.log("JSDoc → TS 转换对照:");
console.log("  @param {number} a          →  a: number");
console.log("  @param {string} name       →  name: string");
console.log("  @returns {boolean}         →  : boolean");
console.log("  @type {{ x: number }}      →  : { x: number }");
console.log("  @typedef {Object} User     →  interface User");
console.log("  @type {Array<string>}      →  string[]");
console.log("  @type {string|null}        →  string | null");

// 转换前的 JSDoc 版本（注释展示）
// /**
//  * 格式化日期
//  * @param {Date} date 日期
//  * @param {string} format 格式
//  * @returns {string} 格式化后的字符串
//  */
// function formatDate(date, format) {
//   const y = date.getFullYear();
//   const m = String(date.getMonth() + 1).padStart(2, '0');
//   return format.replace('YYYY', y).replace('MM', m);
// }

// 转换后的 TS 版本
type DateFormat = "YYYY-MM-DD" | "YYYY/MM/DD" | "MM-DD";

function formatDate(date: Date, format: DateFormat): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  switch (format) {
    case "YYYY-MM-DD": return y + "-" + m + "-" + d;
    case "YYYY/MM/DD": return y + "/" + m + "/" + d;
    case "MM-DD": return m + "-" + d;
  }
}

console.log("\\n转换后 formatDate 调用:");
console.log("  ", formatDate(new Date("2024-03-15"), "YYYY-MM-DD"));
console.log("  ", formatDate(new Date("2024-03-15"), "YYYY/MM/DD"));

// ---- 3. 渐进式迁移：allowJs 阶段演示 ----
console.log("\\n========== 3. 渐进式迁移阶段 ==========");

// 模拟 tsconfig 在不同阶段的配置
const tsconfigStages = [
  {
    stage: "阶段1: 接入 TS（最宽松）",
    config: {
      allowJs: true,
      checkJs: false,
      noImplicitAny: false,
      strictNullChecks: false,
      strict: false,
    },
  },
  {
    stage: "阶段2: 开启 noImplicitAny",
    config: {
      allowJs: true,
      checkJs: false,
      noImplicitAny: true,
      strictNullChecks: false,
      strict: false,
    },
  },
  {
    stage: "阶段3: 开启 strictNullChecks",
    config: {
      allowJs: true,
      checkJs: false,
      noImplicitAny: true,
      strictNullChecks: true,
      strict: false,
    },
  },
  {
    stage: "阶段4: 全量 strict",
    config: {
      allowJs: false,
      checkJs: false,
      noImplicitAny: true,
      strictNullChecks: true,
      strict: true,
    },
  },
];

for (const s of tsconfigStages) {
  console.log("\\n" + s.stage + ":");
  for (const key of Object.keys(s.config) as Array<keyof typeof s.config>) {
    console.log("  " + key + ": " + s.config[key]);
  }
}

// ---- 4. 第三方库 @types 处理演示 ----
console.log("\\n========== 4. 第三方库 @types 处理 ==========");

// 模拟三种情况
const libraries = [
  { name: "axios", hasBuiltinTypes: true, hasAtTypes: false, status: "自带类型，无需 @types" },
  { name: "lodash", hasBuiltinTypes: false, hasAtTypes: true, status: "需安装 @types/lodash" },
  { name: "legacy-lib", hasBuiltinTypes: false, hasAtTypes: false, status: "无类型，需自己写 declare module" },
];

for (const lib of libraries) {
  console.log("  " + lib.name + ": " + lib.status);
}

// 演示自己写声明（编译期存在，运行时擦除）
declare module "legacy-lib" {
  export function doSomething(input: string): number;
}

// 模拟使用（运行时用对象字面量代替真实模块）
const legacyLib = {
  doSomething: function (input: string): number {
    return input.length;
  },
};
console.log("  使用 legacy-lib.doSomething('hello') =", legacyLib.doSomething("hello"));

// ---- 5. 常见陷阱演示 ----
console.log("\\n========== 5. 常见陷阱演示 ==========");

// 陷阱1: any 滥用
console.log("陷阱1: any 滥用");
console.log("  ❌ function process(data: any) { return data.x; }  // 关闭类型检查");
console.log("  ✅ function process(data: unknown) {");
console.log("       if (typeof data === 'object' && data && 'x' in data) return data.x;");
console.log("     }");

function processSafe(data: unknown): unknown {
  if (typeof data === "object" && data !== null && "x" in data) {
    return (data as { x: unknown }).x;
  }
  return undefined;
}
console.log("  processSafe({ x: 42 }) =", processSafe({ x: 42 }));
console.log("  processSafe(null) =", processSafe(null));

// 陷阱2: 默认导出混淆
console.log("\\n陷阱2: 默认导出与 CommonJS 混淆");
console.log("  JS: module.exports = foo  →  require('mod') === foo");
console.log("  TS: export default foo   →  require('mod').default === foo");
console.log("  迁移时注意保持一致或同步改调用方");

// 陷阱3: window 全局变量
console.log("\\n陷阱3: 扩展全局 Window");
console.log("  JS:  window.myGlobal = 123;  // 直接挂");
console.log("  TS:  需先 declare global { interface Window { myGlobal: number } }");

// 模拟扩展全局（这里不真的扩展 window，沙箱没有 window）
interface GlobalApp {
  version: string;
  config: Record<string, unknown>;
}
const globalApp: GlobalApp = { version: "1.0.0", config: {} };
console.log("  扩展后 globalApp.version =", globalApp.version);

// ---- 6. 迁移检查清单 ----
console.log("\\n========== 6. 迁移检查清单 ==========");

const checklist: { item: string; done: boolean }[] = [
  { item: "安装 typescript、@types/node", done: true },
  { item: "生成 tsconfig，配置 allowJs: true", done: true },
  { item: "安装所有第三方库的 @types", done: true },
  { item: "构建脚本支持 TS (tsc/ts-node)", done: true },
  { item: "测试框架支持 TS (ts-jest)", done: true },
  { item: "ESLint 配置 @typescript-eslint", done: true },
  { item: "逐文件迁移，每次一个 + 测试", done: false },
  { item: "公共 API 补充类型", done: false },
  { item: "开启 noImplicitAny", done: false },
  { item: "开启 strictNullChecks", done: false },
  { item: "开启 strict", done: false },
  { item: "移除 allowJs（全量 TS）", done: false },
];

let doneCount = 0;
for (const c of checklist) {
  console.log("  [" + (c.done ? "x" : " ") + "] " + c.item);
  if (c.done) doneCount++;
}
console.log("\\n进度: " + doneCount + "/" + checklist.length + " (" + Math.round((doneCount / checklist.length) * 100) + "%)");

// ---- 7. monorepo 迁移顺序演示 ----
console.log("\\n========== 7. Monorepo 迁移顺序 ==========");

// 模拟 monorepo 结构
interface Package {
  name: string;
  dependencies: string[]; // 内部依赖
  migrated: boolean;
}

const monorepo: Package[] = [
  { name: "@app/shared", dependencies: [], migrated: true },        // 叶子包，先迁移
  { name: "@app/utils", dependencies: [], migrated: true },          // 叶子包，先迁移
  { name: "@app/api-client", dependencies: ["@app/shared"], migrated: true },  // 中间包
  { name: "@app/ui-components", dependencies: ["@app/utils", "@app/shared"], migrated: false }, // 中间包
  { name: "@app/server", dependencies: ["@app/api-client", "@app/shared"], migrated: false },   // 应用包
  { name: "@app/client", dependencies: ["@app/ui-components", "@app/api-client"], migrated: false }, // 应用包
];

console.log("Monorepo 包依赖与迁移状态:");
for (const pkg of monorepo) {
  const deps = pkg.dependencies.length > 0 ? pkg.dependencies.join(", ") : "（无）";
  console.log("  " + (pkg.migrated ? "✅" : "⬜") + " " + pkg.name + " ← " + deps);
}

console.log("\\n迁移顺序建议（自底向上）:");
const order = ["@app/shared", "@app/utils", "@app/api-client", "@app/ui-components", "@app/server", "@app/client"];
order.forEach(function (name, i) {
  console.log("  " + (i + 1) + ". " + name);
});

console.log("\\nJS 到 TS 迁移指南章节演示完成！");`,
  },

  // =========================================================
  // 第五章：React + TypeScript
  // =========================================================
  {
    id: "ts-react",
    title: "React + TypeScript",
    icon: "⚛️",
    group: "工程化进阶",
    content: `## React + TypeScript

React 与 TypeScript 是前端最流行的组合。TS 让 React 组件的 Props、状态、事件、Hook 都获得类型安全，极大减少运行时错误。本章极其详细地讲解组件 Props 类型、React.FC vs 函数组件、事件类型、Hook 泛型、useContext/forwardRef/HOC/自定义 Hook 类型、children/样式类型、React 18+ 类型变化。

### 1. 组件 Props 类型

#### 基本写法

\`\`\`tsx
// 定义 Props 接口
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;        // 可选
  variant: 'primary' | 'secondary';  // 字面量联合
}

// 解构 Props
function Button({ label, onClick, disabled, variant }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled} className={variant}>
      {label}
    </button>
  );
}
\`\`\`

#### 带 children 的 Props

\`\`\`tsx
interface CardProps {
  title: string;
  children: React.ReactNode;  // children 类型用 React.ReactNode
}

function Card({ title, children }: CardProps) {
  return <div><h2>{title}</h2>{children}</div>;
}
\`\`\`

\`React.ReactNode\` 是最宽松的 children 类型（包括 string、number、JSX、null、boolean、数组）。也可用 \`React.ReactElement\`（仅 JSX 元素）或 \`JSX.Element\`。

#### 带默认 Props

\`\`\`tsx
interface AlertProps {
  type?: 'info' | 'warning' | 'error';
  message: string;
}

// 默认值用解构默认值
function Alert({ type = 'info', message }: AlertProps) {
  return <div className={type}>{message}</div>;
}
\`\`\`

#### 泛型组件

\`\`\`tsx
// 泛型组件：列表组件，items 类型可变
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return <ul>{items.map(function (item) { return <li key={keyExtractor(item)}>{renderItem(item)}</li>; })}</ul>;
}

// 使用时泛型自动推导
<List items={[{ id: 1, name: 'Tom' }]} renderItem={function (x) { return <span>{x.name}</span>; }} keyExtractor={function (x) { return String(x.id); }} />
\`\`\`

### 2. React.FC vs 直接函数组件

\`\`\`tsx
// 写法一: React.FC
const Button: React.FC<ButtonProps> = function (props) {
  return <button>{props.label}</button>;
};

// 写法二: 直接函数（推荐）
function Button(props: ButtonProps) {
  return <button>{props.label}</button>;
}
\`\`\`

#### 区别

| 对比项 | React.FC | 直接函数 |
| --- | --- | --- |
| children 类型 | 隐式包含（React 18 前） | 需显式声明 |
| 返回类型 | 显式 ReactElement | 推导 |
| 泛型支持 | 较繁琐 | 直接 |
| 社区推荐 | ❌ 不推荐 | ✅ 推荐 |

**React 18 起 \`React.FC\` 不再隐式包含 children**，且它对泛型组件支持差。社区共识：**用直接函数组件**，不用 \`React.FC\`。

### 3. 事件类型

#### 常用事件类型

| 事件 | 类型 | 触发场景 |
| --- | --- | --- |
| \`React.ChangeEvent<HTMLInputElement>\` | input/select 变化 | 输入框 |
| \`React.MouseEvent<HTMLButtonElement>\` | 鼠标点击 | 按钮 |
| \`React.FormEvent<HTMLFormElement>\` | 表单提交 | form submit |
| \`React.KeyboardEvent<HTMLInputElement>\` | 键盘 | 输入框按键 |
| \`React.FocusEvent<HTMLInputElement>\` | 焦点 | blur/focus |

#### 使用示例

\`\`\`tsx
function Form() {
  const [value, setValue] = useState('');

  // onChange 事件类型
  const handleChange = function (e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);  // e.target 是 HTMLInputElement
  };

  // onClick 事件类型
  const handleClick = function (e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
  };

  // onSubmit 事件类型
  const handleSubmit = function (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log('submit', value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={value} onChange={handleChange} />
      <button onClick={handleClick}>提交</button>
    </form>
  );
}
\`\`\`

#### 事件类型为什么带泛型

\`React.ChangeEvent<T>\` 的 \`T\` 是触发事件的 DOM 元素类型。它决定 \`e.target\` 的类型——\`HTMLInputElement\` 有 \`value\` 属性，\`HTMLDivElement\` 没有。泛型让 \`e.target.value\` 类型安全。

### 4. Hook 泛型

#### useState

\`\`\`tsx
// 类型由初始值推导
const [count, setCount] = useState(0);          // number
const [name, setName] = useState('Tom');        // string

// 显式指定（初始值 null 时必须）
const [user, setUser] = useState<User | null>(null);

// 复杂状态
const [state, setState] = useState<{ loading: boolean; data?: User }>({ loading: true });
\`\`\`

#### useReducer

\`\`\`tsx
interface State { count: number }
type Action = { type: 'inc' } | { type: 'dec' } | { type: 'set'; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'inc': return { count: state.count + 1 };
    case 'dec': return { count: state.count - 1 };
    case 'set': return { count: action.payload };
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0 });
dispatch({ type: 'inc' });
dispatch({ type: 'set', payload: 10 });
// dispatch({ type: 'invalid' });  // ❌ 类型错误
\`\`\`

useReducer 的 Action 用 discriminated union（判别联合），\`type\` 字段做判别，switch 分支里 payload 类型自动收窄。

#### useRef

\`\`\`tsx
// 1. 引用 DOM 元素
const inputRef = useRef<HTMLInputElement>(null);
// 使用: inputRef.current?.focus()

// 2. 存可变值（不触发重渲染）
const timerRef = useRef<number | null>(null);
// 使用: timerRef.current = setTimeout(...)
\`\`\`

\`useRef\` 的泛型是 ref.current 的类型。DOM 元素 ref 初始值是 \`null\`。

### 5. useContext 类型

\`\`\`tsx
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggle: () => void;
}

// createContext 带类型，初始值 null 时用 | null
const ThemeContext = createContext<ThemeContextValue | null>(null);

// Provider
function App() {
  return <ThemeContext.Provider value={{ theme: 'light', toggle: function () {} }}><Child /></ThemeContext.Provider>;
}

// 消费时收窄 null
function Child() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('ThemeContext Provider 缺失');
  return <div>{ctx.theme}</div>;
}
\`\`\`

#### 自定义 useThemeContext（推荐模式）

\`\`\`tsx
function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext 必须在 ThemeProvider 内使用');
  return ctx;
}
\`\`\`

这样消费方不用每次手动收窄 null。

### 6. forwardRef 类型

\`\`\`tsx
interface InputProps {
  label: string;
}
// forwardRef<RefType, PropsType>
const FancyInput = forwardRef<HTMLInputElement, InputProps>(
  function (props, ref) {
    return <label>{props.label}<input ref={ref} /></label>;
  }
);

// 使用
const ref = useRef<HTMLInputElement>(null);
<FancyInput ref={ref} label="用户名" />;
\`\`\`

forwardRef 的两个泛型：第一个是 ref 的类型，第二个是 Props 类型。

### 7. HOC（高阶组件）类型

\`\`\`tsx
// HOC: 给组件注入 loading 状态
function withLoading<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & { loading: boolean }> {
  return function (props) {
    const { loading, ...rest } = props as { loading: boolean } & P;
    if (loading) return <div>Loading...</div>;
    return <Component {...rest as P} />;
  };
}

// 使用
const MyComponent: React.FC<{ data: string }> = function (props) {
  return <div>{props.data}</div>;
};
const MyComponentWithLoading = withLoading(MyComponent);
// Props 类型: { data: string; loading: boolean }
\`\`\`

HOC 的泛型 \`<P extends object>\` 保留原组件 Props，叠加新 Props。

### 8. 自定义 Hook 类型

\`\`\`tsx
// 自定义 Hook 返回值带类型
function useCounter(initial: number): {
  count: number;
  inc: () => void;
  dec: () => void;
  reset: () => void;
} {
  const [count, setCount] = useState(initial);
  return {
    count,
    inc: function () { setCount(function (c) { return c + 1; }); },
    dec: function () { setCount(function (c) { return c - 1; }); },
    reset: function () { setCount(initial); },
  };
}

// 使用
function Counter() {
  const { count, inc } = useCounter(0);
  return <button onClick={inc}>{count}</button>;
}
\`\`\`

自定义 Hook 的返回类型建议显式声明，避免推导出过宽的类型（如 \`number | undefined\`）。

### 9. 样式类型

#### inline style

\`\`\`tsx
const style: React.CSSProperties = {
  color: 'red',
  padding: 10,        // number 自动加 px
  margin: '8px',
};
<div style={style} />
\`\`\`

\`React.CSSProperties\` 是所有合法 CSS 属性的类型。

#### className

\`\`\`tsx
interface Props { className?: string }
<div className={props.className} />
\`\`\`

### 10. React 18+ 类型变化

#### children 不再隐式包含

React 18 起 \`React.FC\` 不再隐式包含 \`children\`，必须显式声明。这修复了"Props 类型没写 children 但能传"的歧义。

#### 自动 batching

React 18 自动批量更新，类型无变化。

#### 新 Hook

\`\`\`tsx
// useId: 生成唯一 id
const id = useId();  // string

// useSyncExternalStore: 订阅外部 store
const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?);
\`\`\`

#### useTransition

\`\`\`tsx
const [isPending, startTransition] = useTransition();
// startTransition: (callback: () => void) => void
\`\`\`

### 11. 陷阱与最佳实践

1. **不要用 React.FC**：用直接函数组件。
2. **children 用 React.ReactNode**：最宽松，覆盖所有可渲染值。
3. **事件类型带泛型**：\`ChangeEvent<HTMLInputElement>\` 决定 e.target 类型。
4. **useState 初始 null 要显式泛型**：\`useState<T | null>(null)\`。
5. **useReducer Action 用判别联合**：type 字段做判别，switch 收窄。
6. **forwardRef 注意泛型顺序**：\`forwardRef<Ref, Props>\`。
7. **HOC 用泛型保留 Props**：\`<P extends object>\`。
8. **自定义 Hook 显式返回类型**：避免推导过宽。

### 本章小结

React + TS 的核心是给 Props、状态、事件、Hook 都加上类型。用直接函数组件而非 React.FC，事件类型带泛型决定 e.target，useState/useReducer/useRef 正确使用泛型，useContext 配合自定义 Hook 收窄 null，forwardRef/HOC 注意泛型顺序。

下面的代码 demo 不依赖 React 运行时，用纯 TS 模拟组件 Props 定义、事件处理类型、自定义 Hook 类型，展示类型设计的思路。`,
    code: `// ============================================================
// React + TypeScript —— 代码演示
// ------------------------------------------------------------
// 沙箱不能 require react，所以用纯 TS 接口和类型模拟 React 的
// 类型系统，展示 Props、事件、Hook、HOC 的类型设计思路。
// 运行时用对象字面量模拟组件实例和 Hook 调用。
// ============================================================

// ---- 0. 模拟 React 类型系统 ----
console.log("========== 0. 模拟 React 类型 ==========");

// 模拟 React.ReactNode（可渲染的所有值）
type ReactNode = string | number | boolean | null | undefined | ReactElement | ReactNode[];
interface ReactElement {
  type: string | Function;
  props: Record<string, unknown>;
}

// 模拟 React.CSSProperties
type CSSProperties = Record<string, string | number>;

// 模拟事件类型（带泛型，泛型是 DOM 元素类型）
interface ChangeEvent<T> {
  target: T;
  currentTarget: T;
  type: string;
}
interface MouseEvent<T> {
  target: T;
  currentTarget: T;
  clientX: number;
  clientY: number;
  preventDefault: () => void;
}
interface FormEvent<T> {
  target: T;
  preventDefault: () => void;
}

// 模拟 HTMLInputElement（有 value 属性）
interface HTMLInputElement {
  value: string;
  name: string;
  type: string;
  focus: () => void;
}
interface HTMLButtonElement {
  disabled: boolean;
}
interface HTMLFormElement {
  action: string;
  method: string;
}

console.log("已模拟 React 类型系统（ReactNode / 事件类型 / DOM 元素）");

// ---- 1. 组件 Props 类型 ----
console.log("\\n========== 1. 组件 Props 类型 ==========");

// 基础 Props
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;            // 可选
  variant: "primary" | "secondary" | "danger";  // 字面量联合
}

// 带 children 的 Props
interface CardProps {
  title: string;
  children: ReactNode;
}

// 泛型组件 Props
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T) => string;
}

// 模拟组件函数（运行时用对象字面量返回"虚拟节点"）
function createElement(type: string | Function, props: Record<string, unknown>, ...children: ReactNode[]): ReactElement {
  return { type: type, props: { ...props, children: children } };
}

// Button 组件
function Button(props: ButtonProps): ReactElement {
  return createElement(
    "button",
    { onClick: props.onClick, disabled: props.disabled || false, className: props.variant },
    props.label
  );
}

// Card 组件
function Card(props: CardProps): ReactElement {
  return createElement("div", { className: "card" }, props.title, props.children);
}

// 泛型 List 组件
function List<T>(props: ListProps<T>): ReactElement {
  return createElement("ul", {}, ...props.items.map(props.renderItem));
}

// 使用
const btn = Button({ label: "点击我", onClick: function () { console.log("  按钮被点击"); }, variant: "primary" });
console.log("Button 渲染:", btn.type, "label =", (btn.props as any).children);

const card = Card({ title: "标题", children: "这是内容" });
console.log("Card 渲染:", card.type, "title =", (card.props as any).children[0]);

const list = List({
  items: [{ id: 1, name: "Tom" }, { id: 2, name: "Jerry" }],
  renderItem: function (item) { return item.name; },
  keyExtractor: function (item) { return String(item.id); },
});
console.log("List 渲染:", list.type, "items 数量 =", ((list.props as any).children as ReactNode[]).length);

// ---- 2. 事件类型演示 ----
console.log("\\n========== 2. 事件类型 ==========");

function FormComponent(): void {
  // 模拟 useState
  let value = "";

  // onChange: ChangeEvent<HTMLInputElement>
  const handleChange = function (e: ChangeEvent<HTMLInputElement>): void {
    value = e.target.value;  // e.target 是 HTMLInputElement，有 value
    console.log("  input 变化:", e.target.value);
  };

  // onClick: MouseEvent<HTMLButtonElement>
  const handleClick = function (e: MouseEvent<HTMLButtonElement>): void {
    e.preventDefault();
    console.log("  按钮点击，坐标:", e.clientX, e.clientY);
  };

  // onSubmit: FormEvent<HTMLFormElement>
  const handleSubmit = function (e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    console.log("  表单提交，value =", value);
  };

  // 模拟触发事件
  console.log("触发 onChange:");
  handleChange({ target: { value: "hello", name: "input", type: "text", focus: function () {} }, currentTarget: {} as any, type: "change" });

  console.log("触发 onClick:");
  handleClick({ target: { disabled: false }, currentTarget: {} as any, clientX: 100, clientY: 200, preventDefault: function () {} });

  console.log("触发 onSubmit:");
  handleSubmit({ target: { action: "/", method: "POST" }, preventDefault: function () {} });
}

FormComponent();

// ---- 3. useState / useReducer / useRef 泛型 ----
console.log("\\n========== 3. Hook 泛型 ==========");

// 模拟 useState
function useState<T>(initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  let state = initial;
  const setState = function (v: T | ((prev: T) => T)): void {
    if (typeof v === "function") {
      state = (v as (prev: T) => T)(state);
    } else {
      state = v;
    }
  };
  return [state, setState];
}

// 模拟 useReducer
type Action = { type: "inc" } | { type: "dec" } | { type: "set"; payload: number };
interface CounterState { count: number }

function reducer(state: CounterState, action: Action): CounterState {
  switch (action.type) {
    case "inc": return { count: state.count + 1 };
    case "dec": return { count: state.count - 1 };
    case "set": return { count: action.payload };
  }
}

function useReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initial: S
): [S, (action: A) => void] {
  let state = initial;
  const dispatch = function (action: A): void {
    state = reducer(state, action);
  };
  return [state, dispatch];
}

// 模拟 useRef
function useRef<T>(initial: T): { current: T } {
  return { current: initial };
}

// 使用 useState
const [count, setCount] = useState(0);
console.log("useState 推导类型: number, 初始 =", count);
setCount(5);
// setCount 修改内部 state（模拟）

// useState 带 null 显式泛型
interface User { id: number; name: string }
const [user, setUser] = useState<User | null>(null);
console.log("useState<User | null> 初始 =", user);

// useReducer
const [state, dispatch] = useReducer(reducer, { count: 0 });
dispatch({ type: "inc" });
dispatch({ type: "set", payload: 10 });
console.log("useReducer 演示: dispatch inc + set 10");
// dispatch({ type: 'invalid' }); // ❌ TS 编译期报错

// useRef 引用 DOM
const inputRef = useRef<HTMLInputElement | null>(null);
console.log("useRef<HTMLInputElement | null> 初始 =", inputRef.current);

// ---- 4. useContext 类型 ----
console.log("\\n========== 4. useContext 类型 ==========");

interface ThemeContextValue {
  theme: "light" | "dark";
  toggle: () => void;
}

// 模拟 createContext
const ThemeContext = {
  _value: null as ThemeContextValue | null,
  Provider: function (value: ThemeContextValue) { this._value = value; },
};

// 模拟 useContext
function useContext(ctx: typeof ThemeContext): ThemeContextValue | null {
  return ctx._value;
}

// 自定义 Hook：收窄 null
function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext 必须在 ThemeProvider 内使用");
  return ctx;
}

// 使用
ThemeContext.Provider({ theme: "light", toggle: function () { console.log("  切换主题"); } });
try {
  const ctx = useThemeContext();
  console.log("useThemeContext 获取: theme =", ctx.theme);
  ctx.toggle();
} catch (e) {
  console.log("错误:", (e as Error).message);
}

// ---- 5. forwardRef 类型 ----
console.log("\\n========== 5. forwardRef 类型 ==========");

interface InputProps {
  label: string;
}

// 模拟 forwardRef<RefType, PropsType>
function forwardRef<R, P>(
  render: (props: P, ref: { current: R | null }) => ReactElement
): { Component: (props: P) => ReactElement; ref: { current: R | null } } {
  const ref = { current: null as R | null };
  return {
    ref: ref,
    Component: function (props: P) { return render(props, ref); },
  };
}

const FancyInput = forwardRef<HTMLInputElement, InputProps>(
  function (props, ref) {
    console.log("  FancyInput 渲染, label =", props.label, "ref.current =", ref.current);
    return createElement("input", { ref: ref, label: props.label });
  }
);

const ref = useRef<HTMLInputElement | null>(null);
const inputEl = FancyInput.Component({ label: "用户名" });
console.log("forwardRef 组件渲染:", inputEl.type);

// ---- 6. HOC 类型 ----
console.log("\\n========== 6. HOC 类型 ==========");

// 模拟 withLoading HOC
function withLoading<P extends Record<string, unknown>>(
  Component: (props: P) => ReactElement
): (props: P & { loading: boolean }) => ReactElement {
  return function (props) {
    const { loading, ...rest } = props;
    if (loading) {
      console.log("  HOC: 显示 Loading");
      return createElement("div", {}, "Loading...");
    }
    return Component(rest as P);
  };
}

// 原始组件
function MyComponent(props: { data: string }): ReactElement {
  console.log("  MyComponent 渲染, data =", props.data);
  return createElement("div", {}, props.data);
}

// 包装后的组件
const MyComponentWithLoading = withLoading(MyComponent);

console.log("调用 withLoading(MyComponent):");
console.log("loading=true:");
MyComponentWithLoading({ data: "hello", loading: true });
console.log("loading=false:");
MyComponentWithLoading({ data: "hello", loading: false });

// ---- 7. 自定义 Hook 类型 ----
console.log("\\n========== 7. 自定义 Hook 类型 ==========");

// 自定义 useCounter Hook，显式返回类型
function useCounter(initial: number): {
  count: number;
  inc: () => void;
  dec: () => void;
  reset: () => void;
} {
  const [count, setCount] = useState(initial);
  return {
    count: count,
    inc: function () { setCount(function (c) { return c + 1; }); },
    dec: function () { setCount(function (c) { return c - 1; }); },
    reset: function () { setCount(initial); },
  };
}

// 使用自定义 Hook
const counter = useCounter(10);
console.log("useCounter(10) 初始 count =", counter.count);
counter.inc();
counter.inc();
console.log("两次 inc 后（模拟，state 内部变化）");

// ---- 8. 样式类型 ----
console.log("\\n========== 8. 样式类型 ==========");

const style: CSSProperties = {
  color: "red",
  padding: 10,        // number 自动加 px
  margin: "8px",
  fontSize: 14,
};
console.log("React.CSSProperties 样式对象:", JSON.stringify(style));

// ---- 9. React 18+ 类型变化 ----
console.log("\\n========== 9. React 18+ 类型变化 ==========");

console.log("React 18 变化:");
console.log("  1. React.FC 不再隐式包含 children（需显式声明）");
console.log("  2. 新增 useId(): string");
console.log("  3. 新增 useTransition(): [isPending, startTransition]");
console.log("  4. 新增 useSyncExternalStore(subscribe, getSnapshot)");

// 模拟 useId
let idCounter = 0;
function useId(): string {
  idCounter++;
  return ":r" + idCounter + ":";
}
console.log("  useId() =", useId());
console.log("  useId() =", useId());

// 模拟 useTransition
function useTransition(): [boolean, (cb: () => void) => void] {
  return [false, function (cb) { cb(); }];
}
const [isPending, startTransition] = useTransition();
console.log("  useTransition() isPending =", isPending);

console.log("\\nReact + TypeScript 章节演示完成！");`,
  },

  // =========================================================
  // 第六章：Node + TypeScript
  // =========================================================
  {
    id: "ts-node-advanced",
    title: "Node + TypeScript",
    icon: "🟢",
    group: "工程化进阶",
    content: `## Node + TypeScript

Node.js 是 TS 最常见的运行时之一（后端服务、CLI 工具、脚本）。在 Node 项目中正确配置 TS、用好 \`@types/node\`、为 http/express/fastify 写类型、设计中间件类型、处理数据库与环境变量类型，是后端 TS 工程化的核心。本章极其详细地讲解这些主题。

### 1. Node.js 项目 TS 配置

#### target / module / moduleResolution 选择

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2022",              // Node 18+ 支持的 ES 版本
    "module": "CommonJS",            // 或 Node16/NodeNext
    "moduleResolution": "Node",      // 或 Node16/NodeNext
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "types": ["node"]
  }
}
\`\`\`

#### target 选择

| target | 适用 Node 版本 | 说明 |
| --- | --- | --- |
| ES2018 | Node 10+ | 异步迭代 |
| ES2020 | Node 14+ | 可选链、空值合并 |
| ES2022 | Node 18+ | 顶层 await、类字段 |
| ESNext | 最新 | 实验特性 |

#### module 选择

| module | 说明 | 适用 |
| --- | --- | --- |
| CommonJS | 编译成 require/module.exports | 传统 Node |
| Node16/NodeNext | 遵循 Node 现代解析 | Node 12+ ESM |
| ES2020/ESNext | 编译成 ESM | 纯 ESM 项目 |

⚠️ \`module: NodeNext\` 时，\`.ts\` 文件要用 \`import x from './y.js'\`（写 .js 扩展名，TS 会解析到 .ts）。

#### 运行 TS 的方式

| 方式 | 命令 | 用途 |
| --- | --- | --- |
| tsc 编译 | \`tsc && node dist/app.js\` | 生产 |
| ts-node | \`ts-node src/app.ts\` | 开发 |
| tsx | \`tsx src/app.ts\` | 开发（更快） |
| node --loader | \`node --loader ts-node/esm src/app.ts\` | ESM |

### 2. @types/node 核心类型

#### process

\`\`\`ts
process.env.NODE_ENV;          // string | undefined
process.argv;                  // string[]
process.exit(0);               // 退出
process.on('exit', (code) => {});
process.stdout.write('hello');
\`\`\`

#### Buffer

\`\`\`ts
const buf: Buffer = Buffer.from('hello', 'utf8');
buf.length;                    // number
buf.toString('hex');           // string
Buffer.concat([buf1, buf2]);   // Buffer
\`\`\`

#### Stream

\`\`\`ts
import { Readable, Writable, Transform } from 'stream';

const readable: Readable = new Readable();
const writable: Writable = new Writable({
  write(chunk: Buffer, encoding: string, callback: () => void) { callback(); },
});
\`\`\`

#### EventEmitter

\`\`\`ts
import { EventEmitter } from 'events';

const ee: EventEmitter = new EventEmitter();
ee.on('data', (payload: unknown) => {});
ee.emit('data', { foo: 'bar' });
\`\`\`

#### http

\`\`\`ts
import http from 'http';

const server: http.Server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true }));
});

server.listen(3000);
\`\`\`

### 3. Express 类型

#### 安装

\`\`\`bash
npm install express @types/express
\`\`\`

#### 基本类型

\`\`\`ts
import express, { Request, Response, NextFunction, RequestHandler, Application } from 'express';

const app: Application = express();

// RequestHandler 类型
const logger: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.method, req.url);
  next();
};

app.use(logger);

app.get('/users/:id', (req: Request, res: Response) => {
  const id: string = req.params.id;        // 路径参数
  const q: string | undefined = req.query.q as string | undefined;  // 查询参数
  res.json({ id, q });
});

app.listen(3000);
\`\`\`

#### 自定义 Request 类型（扩展 req）

\`\`\`ts
// 扩展 Request，添加 user 字段
declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string; name: string };
  }
}

// 中间件注入 user
const authMiddleware: RequestHandler = (req, res, next) => {
  req.user = { id: '1', name: 'Tom' };  // 类型安全
  next();
};
\`\`\`

### 4. 中间件类型

#### RequestHandler

\`\`\`ts
type RequestHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;
\`\`\`

#### 错误处理中间件

\`\`\`ts
const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(500).json({ error: err.message });
};

app.use(errorHandler);
\`\`\`

错误处理中间件有 4 个参数（带 err），Express 据此识别。

### 5. Fastify 类型

Fastify 自带类型，无需 @types。

\`\`\`ts
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

const app: FastifyInstance = Fastify();

// 路由 schema（JSON Schema，运行时校验 + 类型推导）
app.get('/users/:id', {
  schema: {
    params: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
    response: {
      200: {
        type: 'object',
        properties: { id: { type: 'string' } },
      },
    },
  },
}, async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  return { id };
});
\`\`\`

Fastify 的 schema 同时用于运行时校验和类型推导，比 Express 更类型安全。

### 6. 数据库类型

#### Prisma

Prisma 根据 schema.prisma 自动生成类型：

\`\`\`ts
// schema.prisma
// model User {
//   id    Int    @id @default(autoincrement())
//   name  String
//   email String @unique
// }

import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

// User 类型自动生成，完全类型安全
const user: User = await prisma.user.create({
  data: { name: 'Tom', email: 'tom@example.com' },
});

const users: User[] = await prisma.user.findMany({
  where: { name: { contains: 'Tom' } },
});
\`\`\`

#### TypeORM

\`\`\`ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;
}

const repo = dataSource.getRepository(User);
const users: User[] = await repo.find({ where: { name: 'Tom' } });
\`\`\`

#### Mongoose

\`\`\`ts
import { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const User = model<IUser>('User', userSchema);

const user: IUser = new User({ name: 'Tom', email: 'tom@example.com' });
await user.save();
\`\`\`

#### 对比

| ORM | 类型生成方式 | 运行时校验 | 适合 |
| --- | --- | --- | --- |
| Prisma | schema 自动生成 | 自动 | 新项目 |
| TypeORM | 装饰器 + 实体类 | 部分 | 装饰器项目 |
| Mongoose | 手写 interface | schema | MongoDB |

### 7. 环境变量类型

环境变量 \`process.env\` 默认是 \`Record<string, string | undefined>\`，缺乏类型安全。用校验库确保必需变量存在：

\`\`\`ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number).default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
});

const env = envSchema.parse(process.env);
// env.NODE_ENV: 'development' | 'production' | 'test'
// env.PORT: number
// env.DATABASE_URL: string
\`\`\`

启动时校验，缺失或类型错误立即崩溃，避免运行时才发现配置问题。

### 8. CLI 工具开发

#### commander 类型

\`\`\`ts
import { Command } from 'commander';

const program = new Command();

program
  .name('mycli')
  .description('一个示例 CLI')
  .version('1.0.0');

program
  .command('greet <name>')
  .option('-u, --upper', '大写输出')
  .action((name: string, options: { upper?: boolean }) => {
    const msg = options.upper ? name.toUpperCase() : name;
    console.log('Hello, ' + msg);
  });

program.parse();
\`\`\`

#### inquirer 类型

\`\`\`ts
import inquirer from 'inquirer';

const answers = await inquirer.prompt<{ name: string; confirm: boolean }>([
  {
    type: 'input',
    name: 'name',
    message: '你的名字?',
  },
  {
    type: 'confirm',
    name: 'confirm',
    message: '确认继续?',
    default: true,
  },
]);

console.log(answers.name);  // 类型安全
console.log(answers.confirm);
\`\`\`

inquirer 的 \`prompt<T>\` 泛型决定 answers 的类型，让访问 answers.name 类型安全。

#### 9. 调试与部署

\`\`\`json
// package.json
{
  "scripts": {
    "dev": "tsx watch src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "lint": "eslint src/",
    "test": "jest"
  }
}
\`\`\`

### 9. 陷阱与最佳实践

1. **target 与 Node 版本对齐**：Node 18 用 ES2022，不要用 ESNext 生产。
2. **esModuleInterop 必开**：避免 CommonJS 互操作坑。
3. **@types/node 版本与 Node 版本一致**：避免用错 API。
4. **环境变量校验**：启动时用 zod 校验，避免运行时才发现配置错。
5. **Express 扩展 Request 用 declare module**：不要用 any。
6. **Prisma 优于 TypeORM**：类型自动生成，更安全。
7. **CLI 用 commander + inquirer**：类型支持好。

### 本章小结

Node + TS 的核心是正确配置 target/module、用好 @types/node、为 Express/Fastify 写中间件类型、用 Prisma 获得数据库类型安全、用 zod 校验环境变量。CLI 工具用 commander + inquirer 获得类型支持。

下面的代码 demo 用 TS 模拟 Express 路由类型系统、中间件链类型、请求处理，展示后端类型设计的思路。`,
    code: `// ============================================================
// Node + TypeScript —— 代码演示
// ------------------------------------------------------------
// 沙箱不能 require express/prisma/commander，所以用纯 TS 接口
// 模拟 Express 路由类型系统、中间件链类型、请求处理，并演示
// @types/node 核心类型、环境变量校验、CLI 类型设计。
// ============================================================

// ---- 1. @types/node 核心类型演示 ----
console.log("========== 1. @types/node 核心类型 ==========");

// process 类型（沙箱有 process）
console.log("process.platform:", process.platform);
console.log("process.version:", process.version);
console.log("process.argv:", JSON.stringify(process.argv));

// Buffer 类型（沙箱有 Buffer）
const buf: Buffer = Buffer.from("hello", "utf8");
console.log("Buffer.from('hello'):", buf.toString());
console.log("Buffer.length:", buf.length);
console.log("Buffer.toString('hex'):", buf.toString("hex"));

// 模拟 Stream 类型
interface Readable {
  read(): string | null;
  on(event: "data", cb: (chunk: string) => void): void;
  on(event: "end", cb: () => void): void;
}

// 模拟 EventEmitter
const { EventEmitter } = require("events");
const ee: any = new EventEmitter();
ee.on("data", function (payload: unknown) {
  console.log("EventEmitter 收到 data:", JSON.stringify(payload));
});
ee.emit("data", { foo: "bar" });

// ---- 2. 模拟 Express 类型系统 ----
console.log("\\n========== 2. 模拟 Express 类型 ==========");

// 模拟 Express 核心类型
interface Request {
  method: string;
  url: string;
  params: Record<string, string>;
  query: Record<string, string | undefined>;
  body: unknown;
  headers: Record<string, string | undefined>;
  user?: { id: string; name: string }; // 扩展字段
}

interface Response {
  status(code: number): Response;
  json(data: unknown): void;
  send(data: string): void;
  setHeader(name: string, value: string): Response;
}

interface NextFunction {
  (err?: Error): void;
}

// RequestHandler 类型（中间件签名）
type RequestHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;
// ErrorRequestHandler 类型（错误处理中间件）
type ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction) => void;

console.log("已定义 Express 核心类型: Request / Response / NextFunction / RequestHandler");

// ---- 3. 模拟 Express 应用与中间件链 ----
console.log("\\n========== 3. Express 应用与中间件链 ==========");

// 路由处理器类型
type RouteHandler = (req: Request, res: Response) => void;

// 模拟 Express Application
class ExpressApp {
  private middlewares: RequestHandler[] = [];
  private routes: { method: string; path: string; handler: RouteHandler }[] = [];
  private errorHandlers: ErrorRequestHandler[] = [];

  // 注册中间件
  use(middleware: RequestHandler): this {
    this.middlewares.push(middleware);
    return this;
  }

  // 注册错误处理中间件（4 参数）
  useErrorHandler(handler: ErrorRequestHandler): this {
    this.errorHandlers.push(handler);
    return this;
  }

  // 注册路由
  private addRoute(method: string, path: string, handler: RouteHandler): this {
    this.routes.push({ method: method, path: path, handler: handler });
    return this;
  }
  get(path: string, handler: RouteHandler): this { return this.addRoute("GET", path, handler); }
  post(path: string, handler: RouteHandler): this { return this.addRoute("POST", path, handler); }
  put(path: string, handler: RouteHandler): this { return this.addRoute("PUT", path, handler); }
  delete(path: string, handler: RouteHandler): this { return this.addRoute("DELETE", path, handler); }

  // 模拟处理请求（中间件链 + 路由匹配 + 错误处理）
  handleRequest(req: Request): { status: number; body: unknown } {
    let responseStatus = 200;
    let responseBody: unknown = null;
    const res: Response = {
      status: function (code: number) { responseStatus = code; return this; },
      json: function (data: unknown) { responseBody = data; },
      send: function (data: string) { responseBody = data; },
      setHeader: function () { return this; },
    };

    // 执行中间件链
    let middlewareIdx = 0;
    let middlewareError: Error | null = null;
    const runMiddlewares = (): void => {
      while (middlewareIdx < this.middlewares.length) {
        const mw = this.middlewares[middlewareIdx];
        middlewareIdx++;
        let calledNext = false;
        try {
          mw(req, res, function (err?: Error) {
            calledNext = true;
            if (err) middlewareError = err;
          });
        } catch (e) {
          middlewareError = e instanceof Error ? e : new Error(String(e));
          calledNext = true;
        }
        if (middlewareError) break;
        // 同步中间件若没调 next，视为结束（简化）
      }
    };
    runMiddlewares();

    // 如果中间件出错，走错误处理
    if (middlewareError) {
      for (const eh of this.errorHandlers) {
        eh(middlewareError, req, res, function () {});
        if (responseBody !== null) break;
      }
      if (responseBody === null) {
        responseStatus = 500;
        responseBody = { error: "Internal Server Error" };
      }
      return { status: responseStatus, body: responseBody };
    }

    // 匹配路由
    const route = this.routes.find(function (r) {
      return r.method === req.method && matchPath(r.path, req.url, req);
    });
    if (route) {
      try {
        route.handler(req, res);
      } catch (e) {
        responseStatus = 500;
        responseBody = { error: e instanceof Error ? e.message : String(e) };
      }
    } else {
      responseStatus = 404;
      responseBody = { error: "Not Found" };
    }
    return { status: responseStatus, body: responseBody };
  }
}

// 路径匹配（简化版，提取路径参数）
function matchPath(pattern: string, url: string, req: Request): boolean {
  const cleanUrl = url.split("?")[0];
  const patternParts = pattern.split("/").filter(Boolean);
  const urlParts = cleanUrl.split("/").filter(Boolean);
  if (patternParts.length !== urlParts.length) return false;
  req.params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      req.params[patternParts[i].slice(1)] = urlParts[i];
    } else if (patternParts[i] !== urlParts[i]) {
      return false;
    }
  }
  return true;
}

console.log("Express App 类与中间件链已实现");

// ---- 4. 使用 Express 应用 ----
console.log("\\n========== 4. Express 应用示例 ==========");

const app = new ExpressApp();

// 日志中间件
const loggerMiddleware: RequestHandler = function (req, _res, next) {
  console.log("  [日志]", req.method, req.url);
  next();
};

// 鉴权中间件（注入 req.user）
const authMiddleware: RequestHandler = function (req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    res.status(401).json({ error: "未授权" });
    return;
  }
  // 注入 user（类型安全，因为 Request 扩展了 user 字段）
  req.user = { id: "1", name: "Tom" };
  next();
};

// JSON 解析中间件
const jsonParser: RequestHandler = function (req, _res, next) {
  if (typeof req.body === "string" && req.body.length > 0) {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      // 解析失败保持原样
    }
  }
  next();
};

// 错误处理中间件
const errorHandler: ErrorRequestHandler = function (err, _req, res, _next) {
  console.log("  [错误处理]", err.message);
  res.status(500).json({ error: err.message });
};

// 注册中间件
app.use(loggerMiddleware);
app.use(jsonParser);
app.useErrorHandler(errorHandler);

// 路由: 公开
app.get("/", function (req, res) {
  res.json({ message: "Welcome to API", method: req.method });
});

// 路由: 需要鉴权
app.get("/users/:id", function (req, res) {
  // 路径参数类型安全
  const id: string = req.params.id;
  res.json({ id: id, name: "User " + id });
});

// 路由: POST 创建用户
app.post("/users", function (req, res) {
  const body = req.body as { name?: string; age?: number };
  if (!body.name) {
    res.status(400).json({ error: "name 必填" });
    return;
  }
  res.status(201).json({ id: Math.floor(Math.random() * 1000), name: body.name, age: body.age });
});

// 受保护路由（内联应用鉴权中间件，演示中间件复用）
app.get("/profile", function (req, res) {
  // 在路由内调用鉴权中间件（演示中间件复用模式）
  const token = req.headers["authorization"];
  if (!token) {
    res.status(401).json({ error: "未授权" });
    return;
  }
  // 注入 user（类型安全，因为 Request 扩展了 user 字段）
  req.user = { id: "1", name: "Tom" };
  res.json({ user: req.user });
});

console.log("已注册中间件 + 路由");

// ---- 5. 测试请求 ----
console.log("\\n========== 5. 测试请求 ==========");

function testRequest(method: string, url: string, body?: unknown, headers?: Record<string, string>): void {
  const req: Request = {
    method: method,
    url: url,
    params: {},
    query: {},
    body: body !== undefined ? body : {},
    headers: headers || {},
  };
  console.log("\\n请求:", method, url);
  const result = app.handleRequest(req);
  console.log("响应:", result.status, JSON.stringify(result.body));
}

// 测试各种请求
testRequest("GET", "/");
testRequest("GET", "/users/42");
testRequest("POST", "/users", JSON.stringify({ name: "Alice", age: 25 }), { "content-type": "application/json" });
testRequest("POST", "/users", JSON.stringify({ age: 25 }), { "content-type": "application/json" });
testRequest("GET", "/profile"); // 未授权
testRequest("GET", "/profile", {}, { authorization: "Bearer token123" }); // 已授权
testRequest("GET", "/not-exist"); // 404

// ---- 6. 环境变量类型校验（模拟 zod）----
console.log("\\n========== 6. 环境变量类型校验 ==========");

// 模拟环境变量校验器
interface EnvSchema {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
}

function validateEnv(raw: Record<string, string | undefined>): EnvSchema {
  const errors: string[] = [];
  // 校验 NODE_ENV
  const nodeEnv = raw.NODE_ENV;
  if (nodeEnv !== "development" && nodeEnv !== "production" && nodeEnv !== "test") {
    errors.push("NODE_ENV 必须是 development/production/test, 得到 " + nodeEnv);
  }
  // 校验 PORT（可转换）
  const portRaw = raw.PORT || "3000";
  const port = Number(portRaw);
  if (isNaN(port) || port < 0 || port > 65535) {
    errors.push("PORT 必须是 0-65535 的数字, 得到 " + portRaw);
  }
  // 校验 DATABASE_URL
  if (!raw.DATABASE_URL || !raw.DATABASE_URL.startsWith("postgres://")) {
    errors.push("DATABASE_URL 必须是 postgres:// 开头的 URL");
  }
  // 校验 JWT_SECRET
  if (!raw.JWT_SECRET || raw.JWT_SECRET.length < 32) {
    errors.push("JWT_SECRET 至少 32 字符");
  }
  if (errors.length > 0) {
    throw new Error("环境变量校验失败:\\n  " + errors.join("\\n  "));
  }
  return {
    NODE_ENV: nodeEnv as EnvSchema["NODE_ENV"],
    PORT: port,
    DATABASE_URL: raw.DATABASE_URL as string,
    JWT_SECRET: raw.JWT_SECRET as string,
  };
}

// 测试合法环境变量
const validEnv = {
  NODE_ENV: "production",
  PORT: "8080",
  DATABASE_URL: "postgres://localhost:5432/mydb",
  JWT_SECRET: "super-secret-key-at-least-32-chars!!",
};

console.log("合法环境变量:");
try {
  const env = validateEnv(validEnv);
  console.log("  ✅ 校验通过");
  console.log("  NODE_ENV:", env.NODE_ENV, "(类型: 联合字面量)");
  console.log("  PORT:", env.PORT, "(类型: number)");
  console.log("  DATABASE_URL:", env.DATABASE_URL.slice(0, 25) + "...");
} catch (e) {
  console.log("  ❌", (e as Error).message);
}

// 测试非法环境变量
const invalidEnv = {
  NODE_ENV: "staging",
  PORT: "99999",
  DATABASE_URL: "not-a-url",
  JWT_SECRET: "short",
};

console.log("\\n非法环境变量:");
try {
  validateEnv(invalidEnv);
} catch (e) {
  console.log("  ❌ 校验失败:");
  console.log("  " + (e as Error).message);
}

// ---- 7. CLI 工具类型设计（模拟 commander）----
console.log("\\n========== 7. CLI 工具类型设计 ==========");

// 模拟 Command 类型
interface CommandOption {
  flag: string;
  description: string;
  default?: unknown;
}

interface CLICommand {
  name: string;
  description: string;
  args: string[];
  options: CommandOption[];
  action: (args: string[], options: Record<string, unknown>) => void;
}

class CLIProgram {
  private commands: CLICommand[] = [];
  private name: string;
  private version: string;

  constructor(name: string, version: string) {
    this.name = name;
    this.version = version;
  }

  command(name: string, description: string): { option: (flag: string, desc: string, def?: unknown) => this; action: (fn: (args: string[], opts: Record<string, unknown>) => void) => CLIProgram; self: this } {
    const cmd: CLICommand = { name: name, description: description, args: [], options: [], action: function () {} };
    this.commands.push(cmd);
    const self = this;
    return {
      option: function (flag: string, desc: string, def?: unknown) {
        cmd.options.push({ flag: flag, description: desc, default: def });
        return this;
      },
      action: function (fn: (args: string[], opts: Record<string, unknown>) => void) {
        cmd.action = fn;
        return self;
      },
      self: self,
    } as any;
  }

  // 解析并执行
  parse(argv: string[]): void {
    console.log("CLI:", this.name, "v" + this.version);
    const cmdName = argv[0];
    const cmd = this.commands.find(function (c) { return c.name === cmdName; });
    if (!cmd) {
      console.log("可用命令:");
      for (const c of this.commands) {
        console.log("  " + c.name + " - " + c.description);
      }
      return;
    }
    const args = argv.slice(1);
    // 简化: options 从 --flag value 解析
    const opts: Record<string, unknown> = {};
    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith("--")) {
        const key = args[i].slice(2);
        const val = args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
        opts[key] = val;
        if (val !== true) i++;
      }
    }
    // 填充默认值
    for (const opt of cmd.options) {
      const key = opt.flag.split(",")[1] || opt.flag;
      const cleanKey = key.replace(/^-+/, "").trim();
      if (!(cleanKey in opts) && opt.default !== undefined) {
        opts[cleanKey] = opt.default;
      }
    }
    const positionalArgs = args.filter(function (a) { return !a.startsWith("--"); });
    cmd.action(positionalArgs, opts);
  }
}

// 创建 CLI 程序
const program = new CLIProgram("mycli", "1.0.0");

program.command("greet <name>", "问候某人")
  .option("-u, --upper", "大写输出", false)
  .action(function (args, opts) {
    const name: string = args[0] || "World";
    const upper: boolean = Boolean(opts.upper);
    const msg = upper ? name.toUpperCase() : name;
    console.log("Hello, " + msg + "!");
  });

program.command("calc <a> <b>", "计算两数")
  .option("-o, --op <op>", "运算符 add/sub/mul", "add")
  .action(function (args, opts) {
    const a = Number(args[0]);
    const b = Number(args[1]);
    const op = String(opts.op);
    let result: number;
    switch (op) {
      case "add": result = a + b; break;
      case "sub": result = a - b; break;
      case "mul": result = a * b; break;
      default: result = NaN;
    }
    console.log(a + " " + op + " " + b + " = " + result);
  });

// 执行 CLI 命令
console.log("");
program.parse(["greet", "Tom"]);
program.parse(["greet", "Tom", "--upper"]);
program.parse(["calc", "10", "3", "--op", "mul"]);
program.parse(["calc", "10", "3", "--op", "add"]);

// ---- 8. 数据库类型设计（模拟 Prisma）----
console.log("\\n========== 8. 数据库类型设计（模拟 Prisma）==========");

// 模拟 Prisma 自动生成的模型类型
interface UserModel {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

// 模拟 PrismaClient 的类型安全查询
class MockPrismaClient {
  private users: UserModel[] = [
    { id: 1, name: "Tom", email: "tom@example.com", createdAt: new Date() },
    { id: 2, name: "Jerry", email: "jerry@example.com", createdAt: new Date() },
  ];

  user = {
    // findMany 类型安全: where 字段必须是 UserModel 的字段
    findMany: (args: { where?: Partial<Record<keyof UserModel, unknown>> } = {}): UserModel[] => {
      if (!args.where) return this.users;
      return this.users.filter(function (u) {
        for (const key of Object.keys(args.where || {}) as Array<keyof UserModel>) {
          const cond = args.where?.[key];
          if (typeof cond === "object" && cond && "contains" in cond) {
            if (!String(u[key]).includes(String((cond as any).contains))) return false;
          } else if (u[key] !== cond) {
            return false;
          }
        }
        return true;
      });
    },
    // create: data 必须符合 Omit<UserModel, 'id' | 'createdAt'>
    create: (args: { data: { name: string; email: string } }): UserModel => {
      const newUser: UserModel = {
        id: this.users.length + 1,
        name: args.data.name,
        email: args.data.email,
        createdAt: new Date(),
      };
      this.users.push(newUser);
      return newUser;
    },
    // findUnique: 按 id 查
    findUnique: (args: { where: { id: number } }): UserModel | null => {
      return this.users.find(function (u) { return u.id === args.where.id; }) || null;
    },
  };
}

const prisma = new MockPrismaClient();

// 类型安全查询
const allUsers: UserModel[] = prisma.user.findMany();
console.log("所有用户:", allUsers.map(function (u) { return u.name; }).join(", "));

const tomUsers: UserModel[] = prisma.user.findMany({
  where: { name: { contains: "Tom" } as any },
});
console.log("name 含 Tom 的用户:", tomUsers.map(function (u) { return u.name; }));

const newUser: UserModel = prisma.user.create({
  data: { name: "Alice", email: "alice@example.com" },
});
console.log("创建用户:", newUser.name, "id =", newUser.id);

const found: UserModel | null = prisma.user.findUnique({ where: { id: 1 } });
console.log("查找 id=1:", found ? found.name : "未找到");

// ---- 9. Node + TS 配置总结 ----
console.log("\\n========== 9. Node + TS 配置总结 ==========");

const nodeTsConfig = {
  target: "ES2022",
  module: "CommonJS",
  moduleResolution: "Node",
  outDir: "./dist",
  rootDir: "./src",
  esModuleInterop: true,
  strict: true,
  skipLibCheck: true,
  types: ["node"],
};
console.log("推荐 tsconfig:", JSON.stringify(nodeTsConfig, null, 2));

console.log("\\nNode + TypeScript 章节演示完成！");`,
  },
];