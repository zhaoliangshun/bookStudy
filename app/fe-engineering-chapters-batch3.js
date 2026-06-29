// =============================================================
// 前端工程化教程 - 第 3 批章节（质量与现代化篇 5 章）
// -------------------------------------------------------------
// 覆盖代码质量保障与现代工程化实践：ESLint/Prettier、TypeScript、
// 自动化测试、CI/CD、Monorepo。是工程化的进阶实战篇章。
// =============================================================

export const chapters = [
  {
    id: "fe-eng-lint",
    group: "质量与现代化",
    icon: "🔍",
    title: "ESLint 与 Prettier：代码规范统一",
    content: `

# ESLint 与 Prettier：代码规范统一

## 一、为什么需要代码规范

### 1.1 代码风格冲突的代价

同一个项目里：

\`\`\`js
// A 写的
if(condition){
  doSomething();
}

// B 写的
if (condition) {
  doSomething();
}
\`\`\`

每个 diff 都混着风格改动，code review 浪费时间在「括号加不加空格」上。代码规范的目标是**让团队代码像一个人写的**，把精力放在逻辑而非格式上。

### 1.2 ESLint vs Prettier 的分工

两者职责完全不同：

| 工具 | 关注点 | 示例 |
|------|--------|------|
| ESLint | 代码**质量**与**风格约定** | 未用变量、隐式转换、no-debugger |
| Prettier | 代码**格式** | 缩进、引号、换行、行宽 |

**简记**：ESLint 找 bug，Prettier 管漂亮。

---

## 二、ESLint

### 2.1 安装与基本配置

\`\`\`bash
pnpm add -D eslint
npx eslint --init  # 交互式生成配置
\`\`\`

\`\`\`js
// .eslintrc.js
module.exports = {
  root: true,
  env: { browser: true, es2024: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',  // 关闭与 Prettier 冲突的规则
  ],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
  settings: { react: { version: 'detect' } },
};
\`\`\`

### 2.2 配置项详解

**env**：声明运行环境，启用对应全局变量

\`\`\`js
env: {
  browser: true,  // window、document
  node: true,     // require、module
  es2024: true,   // 顶层 await、Array.group
}
\`\`\`

**parser**：把源码解析成 AST 的工具

- 默认 \`espree\`（支持 ES2024）
- TypeScript 用 \`@typescript-eslint/parser\`
- Babel 用 \`@babel/eslint-parser\`

**plugins**：提供额外规则集，但**不自动启用**

\`\`\`js
plugins: ['@typescript-eslint']  // 提供 TS 规则，但要 extends 才生效
\`\`\`

**extends**：复用一套预设配置（推荐规则集合）

\`\`\`js
extends: [
  'eslint:recommended',                  // ESLint 官方推荐
  'plugin:@typescript-eslint/recommended', // TS 推荐
  'plugin:react/recommended',            // React 推荐
  'prettier',                            // 关闭与 Prettier 冲突的规则（放最后）
]
\`\`\`

**rules**：自定义规则，覆盖 extends 的默认

\`\`\`js
rules: {
  'rule-name': 'off' | 'warn' | 'error' | ['error', { options }],
}
\`\`\`

### 2.3 常用规则

\`\`\`js
rules: {
  // 错误预防
  'no-console': 'warn',                  // 警告 console
  'no-debugger': 'error',                // 禁止 debugger
  'no-undef': 'error',                   // 禁止未定义变量
  'no-unused-vars': 'error',             // 禁止未使用变量
  'no-redeclare': 'error',               // 禁止重复声明
  'no-unreachable': 'error',             // 禁止 return 后代码

  // 最佳实践
  'eqeqeq': ['error', 'always'],         // 必须用 ===
  'no-eval': 'error',                    // 禁用 eval
  'no-implicit-globals': 'error',        // 禁止隐式全局
  'prefer-const': 'error',               // 优先 const
  'no-var': 'error',                     // 禁用 var

  // ES6+
  'arrow-body-style': ['error', 'as-needed'],
  'prefer-template': 'error',            // 优先模板字符串
  'prefer-arrow-callback': 'error',      // 优先箭头函数

  // React
  'react/jsx-key': 'error',              // 列表必须有 key
  'react/no-direct-mutation-state': 'error',
  'react-hooks/rules-of-hooks': 'error', // Hook 规则
  'react-hooks/exhaustive-deps': 'warn', // 依赖完整性
}
\`\`\`

### 2.4 ESLint 9 的扁平配置（Flat Config）

ESLint 9 推出新的扁平配置（\`eslint.config.js\`），替代老式 \`.eslintrc\`：

\`\`\`js
// eslint.config.js（ESLint 9+）
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react },
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
\`\`\`

优势：

- 用 ESM 写，符合现代项目
- 配置是数组，更直观
- 不再有 \`extends\` 的复杂性

### 2.5 自动修复

ESLint 能自动修复格式类问题：

\`\`\`bash
# 检查所有文件
npx eslint src/

# 自动修复
npx eslint src/ --fix
\`\`\`

\`\`\`json
// package.json
{
  "scripts": {
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  }
}
\`\`\`

---

## 三、Prettier

### 3.1 安装与配置

\`\`\`bash
pnpm add -D prettier
\`\`\`

\`\`\`json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
\`\`\`

### 3.2 常用选项

| 选项 | 默认 | 推荐值 | 说明 |
|------|------|--------|------|
| \`printWidth\` | 80 | 100 | 行宽，超过自动换行 |
| \`tabWidth\` | 2 | 2 | 缩进空格数 |
| \`singleQuote\` | false | true | 用单引号 |
| \`semi\` | true | true | 行尾分号 |
| \`trailingComma\` | "all" | "es5" | 尾随逗号 |
| \`arrowParens\` | "always" | "always" | 箭头函数参数加括号 |
| \`endOfLine\` | "lf" | "lf" | 换行符（解决 Windows CRLF 问题）|

### 3.3 用法

\`\`\`bash
# 格式化所有文件
npx prettier --write src/

# 只检查不修改（用于 CI）
npx prettier --check src/

# 忽略文件 .prettierignore
node_modules
dist
pnpm-lock.yaml
\`\`\`

\`\`\`json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
\`\`\`

---

## 四、ESLint + Prettier 协同

### 4.1 冲突问题

ESLint 和 Prettier 都管格式，规则可能冲突：

- ESLint 要求「4 空格缩进」，Prettier 要求「2 空格」
- 运行时 ESLint 报错，Prettier 又把它改回去，循环

### 4.2 解决方案：eslint-config-prettier

\`eslint-config-prettier\` 关闭所有与 Prettier 冲突的 ESLint 规则：

\`\`\`bash
pnpm add -D eslint-config-prettier
\`\`\`

\`\`\`js
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',  // ← 必须放最后，关闭冲突规则
  ],
};
\`\`\`

注意：\`prettier\` 配置必须放在 extends 数组最后，才能正确覆盖前面规则。

### 4.3 工作流推荐

**方案 A：ESLint 负责 lint + Prettier 负责格式（推荐）**

\`\`\`json
{
  "scripts": {
    "lint": "eslint src/",
    "format": "prettier --write src/"
  }
}
\`\`\`

各自独立，简单清晰。

**方案 B：用 eslint-plugin-prettier 让 ESLint 调用 Prettier**

不推荐，会让 ESLint 慢，且官方也建议方案 A。

---

## 五、编辑器集成

### 5.1 VS Code 配置

装 Prettier 和 ESLint 插件，配置保存时自动修复：

\`\`\`json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": ["javascript", "typescript", "javascriptreact", "typescriptreact"]
}
\`\`\`

效果：保存文件时

1. ESLint 自动修复能修的（unused vars 等）
2. Prettier 自动格式化

### 5.2 与团队共享配置

把 \`.vscode/\`、\`.eslintrc\`、\`.prettierrc\` 都提交 git，团队所有人自动用同样配置。

---

## 六、Git Hooks 强制检查

### 6.1 Husky：管理 Git hooks

\`\`\`bash
pnpm add -D husky
pnpm exec husky init  # 创建 .husky/ 目录
\`\`\`

\`\`\`bash
# .husky/pre-commit
pnpm exec lint-staged
\`\`\`

### 6.2 lint-staged：只检查改动文件

直接对全项目跑 ESLint 慢，lint-staged 只检查 staged 文件：

\`\`\`bash
pnpm add -D lint-staged
\`\`\`

\`\`\`json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss,md,json}": ["prettier --write"]
  }
}
\`\`\`

提交时：

1. \`git commit\` 触发 \`pre-commit\` hook
2. Husky 执行 \`lint-staged\`
3. lint-staged 对 staged 文件跑 ESLint + Prettier
4. 失败则阻止提交

### 6.3 commitlint：约束提交信息

\`\`\`bash
pnpm add -D @commitlint/cli @commitlint/config-conventional
\`\`\`

\`\`\`js
// commitlint.config.js
module.exports = { extends: ['@commitlint/config-conventional'] };
\`\`\`

\`\`\`bash
# .husky/commit-msg
pnpm exec commitlint --edit $1
\`\`\`

约束提交格式：

\`\`\`
<type>(<scope>): <subject>

feat(auth): 添加 OAuth 登录
fix(cart): 修复结算金额计算错误
docs: 更新 README
\`\`\`

---

## 七、TypeScript ESLint

### 7.1 类型感知规则

\`@typescript-eslint\` 能利用类型信息做更深的检查：

\`\`\`js
// 推荐配置
extends: [
  'plugin:@typescript-eslint/recommended',
  'plugin:@typescript-eslint/recommended-requiring-type-checking',
],
parserOptions: {
  project: './tsconfig.json',  // 需要类型信息
},
\`\`\`

### 7.2 类型感知规则示例

\`\`\`js
rules: {
  // 禁止 await 非 Promise
  '@typescript-eslint/await-thenable': 'error',

  // 必须用 Promise<T> 而非 Promise.<T>
  '@typescript-eslint/promise-function-async': 'error',

  // 禁止 any
  '@typescript-eslint/no-explicit-any': 'warn',

  // 一致的类型导入
  '@typescript-eslint/consistent-type-imports': 'error',
}
\`\`\`

\`\`\`ts
// consistent-type-imports 强制
import type { User } from './types';   // 类型导入
import { getUsers } from './api';       // 值导入
\`\`\`

---

## 八、Stylelint：CSS 的 Lint

\`\`\`bash
pnpm add -D stylelint stylelint-config-standard
\`\`\`

\`\`\`json
// .stylelintrc.json
{
  "extends": "stylelint-config-standard",
  "rules": {
    "indentation": 2,
    "color-hex-length": "short",
    "declaration-block-no-duplicate-properties": true,
    "no-descending-specificity": null
  }
}
\`\`\`

\`\`\`json
{
  "scripts": {
    "stylelint": "stylelint \"src/**/*.{css,scss}\""
  }
}
\`\`\`

---

## 九、实际配置示例

### 9.1 现代 React + TS 项目完整配置

\`\`\`json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
\`\`\`

\`\`\`js
// eslint.config.js（ESLint 9 扁平配置）
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
    settings: { react: { version: 'detect' } },
  },
  prettier,  // 关闭与 Prettier 冲突的规则
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js'],
  }
);
\`\`\`

\`\`\`json
// package.json scripts
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css,scss}": ["prettier --write"]
  }
}
\`\`\`

---

## 十、小结

代码规范是工程化的「软实力」，关键点：

1. **ESLint 找 bug，Prettier 管格式**：职责分明
2. **extends vs plugins**：extends 启用规则集，plugins 只提供规则
3. **eslint-config-prettier**：关闭 ESLint 与 Prettier 的冲突规则
4. **Git Hooks 强制检查**：Husky + lint-staged 在提交时拦截
5. **commitlint 约束提交**：规范 commit message，便于生成 changelog
6. **编辑器集成**：保存自动修复，无感知执行
7. **新项目用 ESLint 9 扁平配置**：更现代、更简洁

下一章看 TypeScript——类型系统是代码质量保障的「重型武器」。
`,
  },
  {
    id: "fe-eng-ts",
    group: "质量与现代化",
    icon: "🔷",
    title: "TypeScript 工程化：类型、配置与最佳实践",
    content: `

# TypeScript 工程化：类型、配置与最佳实践

## 一、为什么用 TypeScript

### 1.1 类型系统的价值

JavaScript 是动态类型，运行时才暴露错误：

\`\`\`js
// JS：这个 bug 要到运行时才发现
function getUser(id) {
  return fetch('/api/users/' + id).then(r => r.json());
}
getUser({ name: 'Alice' });  // fetch '/api/users/[object Object]'
\`\`\`

TypeScript 在编译时就能发现：

\`\`\`ts
// TS：编译时直接报错
function getUser(id: number): Promise<User> {
  return fetch('/api/users/' + id).then(r => r.json());
}
getUser({ name: 'Alice' });  // ❌ Argument of type '{ name: string }' is not assignable to parameter of type 'number'
\`\`\`

### 1.2 TypeScript 的核心收益

1. **编译时错误检测**：80% 的 bug 在编译时就被抓住
2. **更好的 IDE 支持**：自动补全、跳转定义、重构安全
3. **代码即文档**：类型签名就是最好的 API 文档
4. **重构信心**：改一个接口，所有受影响的地方立即报错
5. **大型项目可维护**：类型系统让代码可理解、可演进

---

## 二、tsconfig.json 配置

### 2.1 基础配置

\`\`\`json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,

    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
\`\`\`

### 2.2 关键选项详解

**target**：编译目标 JS 版本

- \`ES2020\`：兼容性最好（Node 14、90%+ 浏览器）
- \`ES2022\`：用顶层 await、类字段
- \`ESNext\`：最新（要确认运行时支持）

**module / moduleResolution**

- \`module: "ESNext"\` + \`moduleResolution: "bundler"\`：现代打包器（Vite/Webpack 5+）
- \`module: "NodeNext"\`：Node.js ESM 项目
- \`module: "CommonJS"\`：老项目

**strict**：开启所有严格检查（推荐）

包含：

- \`noImplicitAny\`：禁止隐式 any
- \`strictNullChecks\`：null/undefined 必须显式处理
- \`strictFunctionTypes\`：函数类型严格协变
- \`strictBindCallApply\`：bind/call/apply 严格
- \`strictPropertyInitialization\`：类属性必须初始化
- \`alwaysStrict\`：输出 'use strict'

**isolatedModules + verbatimModuleSyntax**：与 Babel/SWC 兼容

\`\`\`ts
// isolatedModules: true
// 每个文件必须能独立转译（Babel/SWC 是单文件转译）

// verbatimModuleSyntax: true
// 区分类型导入和值导入，Babel 知道哪些可以删
import type { User } from './types';   // 类型，转译时删
import { useState } from 'react';       // 值，保留
\`\`\`

### 2.3 路径映射

\`\`\`json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
\`\`\`

\`\`\`ts
import { Button } from '@components/Button';
import { formatDate } from '@utils/date';
\`\`\`

⚠️ TypeScript 的路径映射只影响类型检查，**不影响打包**。还要在 Vite/Webpack 配置 alias。

### 2.4 多项目引用（Project References）

大型项目可拆成多个 TS 子项目，分别编译：

\`\`\`json
// tsconfig.json（根）
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
\`\`\`

\`\`\`json
// tsconfig.app.json（应用代码）
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist-app",
    "composite": true
  },
  "include": ["src"]
}
\`\`\`

---

## 三、类型基础

### 3.1 基本类型

\`\`\`ts
// 原始类型
let str: string = 'hello';
let num: number = 42;
let bool: boolean = true;
let nul: null = null;
let und: undefined = undefined;
let sym: symbol = Symbol();

// 数组
let nums: number[] = [1, 2, 3];
let strs: Array<string> = ['a', 'b'];

// 元组（固定长度数组）
let tuple: [string, number] = ['Alice', 28];

// 枚举
enum Color { Red, Green, Blue }
let c: Color = Color.Green;

// 字面量类型
let direction: 'left' | 'right' = 'left';

// 联合类型
let id: string | number = 123;
id = 'abc';

// 交叉类型
type User = { name: string } & { age: number };
\`\`\`

### 3.2 接口 vs 类型别名

\`\`\`ts
// interface
interface User {
  name: string;
  age: number;
  greet(): void;
}

// type
type User = {
  name: string;
  age: number;
  greet: () => void;
};
\`\`\`

**区别**：

- \`interface\` 可被 extends、可声明合并
- \`type\` 能用联合、交叉、条件类型

\`\`\`ts
// interface 可扩展
interface User { name: string }
interface User { age: number }  // 自动合并
// User 现在是 { name: string; age: number }

// type 能联合
type Status = 'idle' | 'loading' | 'success' | 'error';
\`\`\`

**推荐**：对象形状用 \`interface\`，联合/工具类型用 \`type\`。

### 3.3 泛型

\`\`\`ts
// 泛型函数
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
first([1, 2, 3]);       // T 推断为 number
first(['a', 'b']);      // T 推断为 string

// 泛型约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { name: 'Alice', age: 28 };
getProperty(user, 'name');  // string
getProperty(user, 'age');   // number

// 泛型默认值
interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
}
\`\`\`

---

## 四、高级类型技巧

### 4.1 工具类型（Utility Types）

\`\`\`ts
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Partial：所有属性可选
type PartialUser = Partial<User>;
// { id?: number; name?: string; ... }

// Required：所有属性必填
type RequiredUser = Required<User>;

// Pick：选部分属性
type UserBasic = Pick<User, 'id' | 'name'>;
// { id: number; name: string }

// Omit：排除属性
type UserWithoutId = Omit<User, 'id'>;

// Record：键值对
type UserMap = Record<string, User>;

// ReturnType：函数返回值类型
function getUser() { return { name: 'Alice' }; }
type User = ReturnType<typeof getUser>;  // { name: string }

// Parameters：函数参数类型
type Params = Parameters<typeof getUser>;  // []

// Awaited：解 Promise
type Data = Awaited<Promise<User>>;  // User
\`\`\`

### 4.2 条件类型

\`\`\`ts
// 如果 T 是数组，返回元素类型，否则返回 T
type ElementOf<T> = T extends (infer U)[] ? U : T;
type A = ElementOf<number[]>;   // number
type B = ElementOf<string>;     // string

// 排除
type T = Exclude<'a' | 'b' | 'c', 'a'>;  // 'b' | 'c'
type U = Extract<'a' | 'b' | 'c', 'a' | 'b'>;  // 'a' | 'b'
type N = NonNullable<string | null | undefined>;  // string
\`\`\`

### 4.3 映射类型

\`\`\`ts
// 把所有属性变成只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// 把所有属性变成可选
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// 移除 readonly
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// 自定义映射
type Stringify<T> = {
  [P in keyof T]: string;
};
type StringUser = Stringify<User>;  // 所有属性都变成 string
\`\`\`

### 4.4 模板字面量类型

\`\`\`ts
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Endpoint = \`/\${string}\`;

// 自动生成 API 路径类型
type ApiPath = \`\${HttpMethod} \${Endpoint}\`;
// "GET /xxx" | "POST /xxx" | ...

// 实战：类型安全的路由
type RouteParams<T extends string> =
  T extends \`\${string}:\${infer P}/\${string}\` ? P :
  T extends \`\${string}:\${infer P}\` ? P : never;

type P = RouteParams<'/users/:id/posts/:postId'>;  // 'id' | 'postId'
\`\`\`

---

## 五、类型守卫（Type Guards）

### 5.1 类型收窄

\`\`\`ts
function process(value: string | number) {
  if (typeof value === 'string') {
    value.toUpperCase();  // 这里 value 是 string
  } else {
    value.toFixed(2);     // 这里 value 是 number
  }
}
\`\`\`

### 5.2 自定义类型守卫

\`\`\`ts
interface Fish { swim: () => void }
interface Bird { fly: () => void }

// 用「value is Type」声明类型守卫
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim();   // 这里 pet 是 Fish
  } else {
    pet.fly();    // 这里 pet 是 Bird
  }
}
\`\`\`

### 5.3 in 操作符收窄

\`\`\`ts
type NetworkState = { state: 'loading' } | { state: 'failed'; error: string };

function logState(s: NetworkState) {
  if ('error' in s) {
    console.log(s.error);  // s 是 failed 状态
  } else {
    console.log('loading');  // s 是 loading 状态
  }
}
\`\`\`

---

## 六、TypeScript 与 React

### 6.1 组件 Props 类型

\`\`\`tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
}: ButtonProps) {
  return (
    <button
      className={\`btn btn-\${variant} btn-\${size}\`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
\`\`\`

### 6.2 useState 类型

\`\`\`tsx
// 自动推断
const [count, setCount] = useState(0);          // number
const [name, setName] = useState('Alice');      // string

// 显式指定（复杂类型或可能为 null）
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<string[]>([]);

// 惰性初始化
const [data, setData] = useState(() => loadInitialData());
\`\`\`

### 6.3 useRef 类型

\`\`\`tsx
// DOM 引用
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => {
  inputRef.current?.focus();
}, []);
return <input ref={inputRef} />;

// 可变值引用
const timerRef = useRef<number | null>(null);
useEffect(() => {
  timerRef.current = window.setInterval(() => {}, 1000);
  return () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
}, []);
\`\`\`

### 6.4 组件类型

\`\`\`tsx
// 函数组件类型
type ButtonProps = { children: React.ReactNode };
const Button: React.FC<ButtonProps> = ({ children }) => <button>{children}</button>;

// 实际上 React.FC 已经不推荐用（隐式 children 类型、不能泛型）
// 推荐：
function Button({ children }: ButtonProps) {
  return <button>{children}</button>;
}

// 泛型组件
function List<T>({ items, render }: { items: T[]; render: (item: T) => React.ReactNode }) {
  return <ul>{items.map((item, i) => <li key={i}>{render(item)}</li>)}</ul>;
}
\`\`\`

---

## 七、类型声明文件

### 7.1 .d.ts 文件

为 JS 库写类型声明：

\`\`\`ts
// my-lib.d.ts
declare module 'my-lib' {
  export function add(a: number, b: number): number;
  export const version: string;
  export class Calculator {
    constructor(initial: number);
    add(n: number): this;
    result(): number;
  }
}
\`\`\`

### 7.2 全局类型

\`\`\`ts
// global.d.ts
declare global {
  interface Window {
    myApp: {
      version: string;
    };
  }
}

export {};
\`\`\`

### 7.3 DefinitelyTyped

\`\`\`bash
# 给没有类型的 npm 包加类型
pnpm add -D @types/lodash @types/node
\`\`\`

\`@types/*\` 包来自 DefinitelyTyped，社区维护的类型声明集合。

### 7.4 类型入口（package.json）

发布 npm 包时声明类型入口：

\`\`\`json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
\`\`\`

---

## 八、TypeScript 实战建议

### 8.1 渐进式迁移

老 JS 项目可以渐进迁移：

1. 装 TypeScript，允许 JS 文件（\`allowJs: true\`）
2. 把 \`checkJs\` 设为 \`false\`，先不检查 JS
3. 逐个文件改成 \`.ts\`/\`.tsx\`
4. 逐步收紧 \`strict\` 选项

### 8.2 严格优先

新项目一开始就开 \`strict: true\`，避免后期「类型放任」习惯。

### 8.3 避免 any

\`any\` 关闭类型检查，是类型系统的逃生口。但用多了就失去 TS 的意义：

\`\`\`ts
// ❌ any
function processData(data: any) {
  return data.items.map(i => i.name);  // 任何错都不报
}

// ✅ unknown + 类型守卫
function processData(data: unknown) {
  if (typeof data === 'object' && data && 'items' in data) {
    return (data as { items: { name: string }[] }).items.map(i => i.name);
  }
  throw new Error('Invalid data');
}
\`\`\`

### 8.4 类型推断优先

不必处处显式标注，让 TS 推断：

\`\`\`ts
// ❌ 多余的标注
const x: number = 1 + 2;
function add(a: number, b: number): number { return a + b; }

// ✅ 推断
const x = 1 + 2;  // number
function add(a: number, b: number) { return a + b; }  // 返回类型自动推断
\`\`\`

只在以下情况显式标注：

- 函数公共 API（接口签名）
- 推断不够精确（如空数组 \`[]\` 推断为 \`never[]\`）
- 想强制约束实现

### 8.5 不要过度类型体操

复杂的条件类型、映射类型让人看不懂。维护性 > 巧妙性：

\`\`\`ts
// ❌ 过度聪明
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// ✅ 简单可读
interface ReadonlyUser {
  readonly id: number;
  readonly name: string;
}
\`\`\`

---

## 九、类型检查工作流

### 9.1 编辑器内检查

VS Code 自动实时检查，红色波浪线提示错误。

### 9.2 命令行检查

\`\`\`json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
\`\`\`

\`--noEmit\` 只检查不输出文件。CI 里跑这个，防止类型错误上线。

### 9.3 构建时检查

\`\`\`json
{
  "scripts": {
    "build": "tsc && vite build"
  }
}
\`\`\`

或者用 Vite 的插件 \`vite-plugin-checker\` 在开发时实时类型检查。

### 9.4 pre-commit 检查

\`\`\`json
{
  "lint-staged": {
    "*.{ts,tsx}": ["tsc --noEmit"]
  }
}
\`\`\`

提交前自动跑类型检查，挡住类型错误。

---

## 十、小结

TypeScript 是现代前端工程化的「基础设施」，关键点：

1. **strict: true 一开始就开**：避免类型放任习惯
2. **路径映射要双配置**：tsconfig + Vite/Webpack alias
3. **interface vs type**：对象用 interface，联合/工具类型用 type
4. **避免 any**：用 unknown + 类型守卫
5. **类型推断优先**：只在必要处显式标注
6. **类型导入分离**：\`import type\` 让构建工具能删除
7. **不要过度类型体操**：可读性 > 巧妙性
8. **CI 跑 tsc --noEmit**：防止类型错误上线

下一章看自动化测试——质量保障的最后一道防线。
`,
  },
  {
    id: "fe-eng-test",
    group: "质量与现代化",
    icon: "🧪",
    title: "自动化测试：单元、集成与端到端",
    content: `

# 自动化测试：单元、集成与端到端

## 一、为什么需要测试

### 1.1 没有测试的世界

每次改代码：

- 手动点遍所有功能，确认没崩
- 不敢重构，怕改了 A 坏了 B
- 半夜上线，第二天发现 bug，全员救火

测试的目标是**让代码可验证、可重构、可放心上线**。

### 1.2 测试金字塔

\`\`\`
         ╱╲
        ╱E2E╲         少量，慢，最接近用户
       ╱──────╲
      ╱ 集成测试 ╲     中等数量，中速
     ╱────────────╲
    ╱   单元测试     ╲   大量，快，覆盖率高
   ╱──────────────────╲
\`\`\`

- **单元测试**：测单个函数/组件，毫秒级
- **集成测试**：测多个模块协作，秒级
- **E2E 测试**：测真实用户流程，分钟级

比例：单元 70%、集成 20%、E2E 10%。

---

## 二、单元测试：Vitest

### 2.1 Vitest vs Jest

Vitest 是 Vite 生态的测试框架，与 Jest API 兼容：

| 特性 | Jest | Vitest |
|------|------|--------|
| 速度 | 慢 | 快（用 esbuild）|
| ESM 支持 | 实验性 | 原生支持 |
| 配置 | 独立 | 复用 vite.config |
| TypeScript | 需要 ts-jest | 原生支持 |
| Watch 模式 | 一般 | 极快（HMR）|

新项目优先 Vitest。

### 2.2 安装与配置

\`\`\`bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
\`\`\`

\`\`\`ts
// vite.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,                  // 用 describe/it/expect 不用 import
    environment: 'jsdom',           // DOM 环境
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
\`\`\`

\`\`\`ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
\`\`\`

### 2.3 第一个测试

\`\`\`ts
// src/utils/math.ts
export function add(a: number, b: number): number {
  return a + b;
}

export function divide(a: number, b: number): number {
  if (b === 0) throw new Error('除数不能为零');
  return a / b;
}
\`\`\`

\`\`\`ts
// src/utils/math.test.ts
import { describe, it, expect } from 'vitest';
import { add, divide } from './math';

describe('add', () => {
  it('两个正数相加', () => {
    expect(add(1, 2)).toBe(3);
  });

  it('负数相加', () => {
    expect(add(-1, -2)).toBe(-3);
  });
});

describe('divide', () => {
  it('正常除法', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it('除数为零应抛错', () => {
    expect(() => divide(1, 0)).toThrow('除数不能为零');
  });
});
\`\`\`

\`\`\`bash
pnpm test            # 运行所有测试
pnpm test -- --watch # watch 模式
pnpm test --coverage # 覆盖率
\`\`\`

### 2.4 测试结构：AAA 模式

\`\`\`ts
it('用户登录成功后返回 token', async () => {
  // Arrange（准备）
  const user = { username: 'alice', password: '123456' };
  mockFetch.mockResolvedValueOnce({ ok: true, json: () => ({ token: 'abc' }) });

  // Act（执行）
  const result = await login(user);

  // Assert（断言）
  expect(result.token).toBe('abc');
  expect(mockFetch).toHaveBeenCalledWith('/api/login', expect.objectContaining({
    method: 'POST',
  }));
});
\`\`\`

### 2.5 常用断言

\`\`\`ts
expect(value).toBe(other);          // 严格相等（===）
expect(value).toEqual(other);       // 深度相等（对象/数组）
expect(value).toBeTruthy();         // 真值
expect(value).toBeFalsy();          // 假值
expect(value).toBeNull();           // null
expect(value).toBeUndefined();      // undefined
expect(value).toBeDefined();        // 已定义
expect(array).toContain(item);      // 数组包含
expect(string).toMatch(/pattern/);  // 正则匹配
expect(fn).toThrow('error');        // 抛错
expect(fn).toHaveBeenCalled();      // 被调用
expect(fn).toHaveBeenCalledTimes(2);
expect(fn).toHaveBeenCalledWith(arg);
\`\`\`

---

## 三、Mock 与 Stub

### 3.1 为什么需要 Mock

测试不能依赖外部环境（网络、数据库、时间）。Mock 把这些依赖换成可控的替身。

### 3.2 Mock 模块

\`\`\`ts
// 假设有 api.ts
import { fetchUser } from './api';

// 测试时 mock 整个 api 模块
vi.mock('./api', () => ({
  fetchUser: vi.fn(),
}));

import { fetchUser } from './api';
import { getUserInfo } from './user-service';

it('getUserInfo 返回格式化后的用户信息', async () => {
  // 配置 mock 返回值
  fetchUser.mockResolvedValue({ id: 1, name: 'Alice', email: 'a@b.com' });

  const result = await getUserInfo(1);

  expect(result).toEqual({ id: 1, displayName: 'Alice' });
  expect(fetchUser).toHaveBeenCalledWith(1);
});
\`\`\`

### 3.3 Mock 全局对象

\`\`\`ts
// Mock fetch
global.fetch = vi.fn();
fetch.mockResolvedValue({ ok: true, json: () => ({ token: 'abc' }) });

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock 时间
vi.useFakeTimers();
vi.setSystemTime(new Date('2024-01-01'));
// 测试后恢复
vi.useRealTimers();
\`\`\`

### 3.4 Spy：监视真实函数

\`\`\`ts
import { debounce } from './utils';

it('debounce 在 300ms 内只执行一次', () => {
  const fn = vi.fn();
  const debounced = debounce(fn, 300);

  vi.useFakeTimers();

  debounced();
  debounced();
  debounced();

  vi.advanceTimersByTime(300);

  expect(fn).toHaveBeenCalledTimes(1);

  vi.useRealTimers();
});
\`\`\`

---

## 四、React 组件测试

### 4.1 Testing Library 哲学

Testing Library 不测组件实现细节（state、方法），而测**用户视角**：渲染了什么、用户交互后发生什么。

\`\`\`tsx
// Counter.tsx
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount(c => c + 1)}>加一</button>
    </div>
  );
}
\`\`\`

\`\`\`tsx
// Counter.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

it('点击按钮后计数增加', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  expect(screen.getByTestId('count')).toHaveTextContent('0');

  await user.click(screen.getByRole('button', { name: '加一' }));
  expect(screen.getByTestId('count')).toHaveTextContent('1');

  await user.click(screen.getByRole('button', { name: '加一' }));
  expect(screen.getByTestId('count')).toHaveTextContent('2');
});
\`\`\`

### 4.2 查询元素的方式

按优先级从高到低：

\`\`\`tsx
// 1. getByRole：最推荐，反映无障碍语义
screen.getByRole('button', { name: '提交' });

// 2. getByLabelText：表单字段
screen.getByLabelText('用户名');

// 3. getByPlaceholderText
screen.getByPlaceholderText('请输入');

// 4. getByText：通用文本
screen.getByText('登录');

// 5. getByDisplayValue：输入框当前值
screen.getByDisplayValue('Alice');

// 6. getByTestId：测试专用 ID（最后选择）
screen.getByTestId('count');
\`\`\`

优先用语义化查询，让测试更接近用户视角。

### 4.3 异步测试

\`\`\`tsx
it('加载用户列表', async () => {
  render(<UserList />);

  // 等待加载完成
  expect(screen.getByText('加载中...')).toBeInTheDocument();

  // 等待元素出现
  const user = await screen.findByText('Alice');
  expect(user).toBeInTheDocument();

  // 等待多个元素
  const items = await screen.findAllByRole('listitem');
  expect(items).toHaveLength(3);
});
\`\`\`

### 4.4 测试 Hooks

用 \`@testing-library/react\` 的 \`renderHook\`：

\`\`\`tsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

it('useCounter', () => {
  const { result } = renderHook(() => useCounter(0));

  expect(result.current.count).toBe(0);

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
\`\`\`

---

## 五、E2E 测试：Playwright

### 5.1 Playwright vs Cypress

| 特性 | Cypress | Playwright |
|------|---------|-----------|
| 浏览器 | Chromium 系 | Chromium/Firefox/WebKit |
| 多 tab | 不支持 | 支持 |
| 速度 | 较慢 | 快 |
| API | 简单 | 强大 |
| 跨域 | 限制 | 无限制 |

新项目优先 Playwright。

### 5.2 安装与配置

\`\`\`bash
pnpm create playwright
# 选择 TypeScript、测试目录、浏览器
\`\`\`

\`\`\`ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
\`\`\`

### 5.3 第一个 E2E 测试

\`\`\`ts
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('用户登录流程', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[name="username"]', 'alice');
  await page.fill('[name="password"]', '123456');
  await page.click('button[type="submit"]');

  // 等待跳转到首页
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('欢迎, Alice');
});
\`\`\`

### 5.4 推荐用语义选择器

\`\`\`ts
// ❌ 用 CSS 选择器，脆弱
await page.click('.btn-primary');

// ✅ 用角色和文本
await page.getByRole('button', { name: '登录' }).click();
await page.getByLabel('用户名').fill('alice');
await page.getByText('欢迎').waitFor();
\`\`\`

### 5.5 Visual Regression Testing

\`\`\`ts
test('首页截图', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('home.png');
});
\`\`\`

第一次跑会生成基准截图，之后每次对比，有差异则失败。能抓到 CSS 改动导致的视觉 bug。

---

## 六、测试覆盖率

### 6.1 查看覆盖率

\`\`\`bash
pnpm test --coverage
\`\`\`

输出：

\`\`\`
File          | % Stmts | % Branch | % Funcs | % Lines
--------------|---------|----------|---------|--------
src/utils.ts  |   100%  |   100%   |  100%   |  100%
src/api.ts    |    80%  |    75%   |   80%   |   80%
src/App.tsx   |    50%  |    40%   |   50%   |   50%
\`\`\`

### 6.2 覆盖率目标

- **70% 合格**：核心逻辑覆盖
- **80% 良好**：主要场景覆盖
- **90%+ 优秀**：但不必强求 100%

100% 覆盖率 ≠ 没有 bug，但低覆盖率一定有未测的代码。

### 6.3 在 CI 卡覆盖率

\`\`\`ts
// vite.config.ts
test: {
  coverage: {
    thresholds: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
}
\`\`\`

低于阈值 CI 失败。

---

## 七、TDD 测试驱动开发

### 7.1 Red-Green-Refactor

\`\`\`
1. Red：先写测试，失败（功能还没实现）
2. Green：写最少代码让测试通过
3. Refactor：重构代码，测试仍然通过
\`\`\`

### 7.2 示例

**Step 1：写测试（Red）**

\`\`\`ts
// fibonacci.test.ts
import { fib } from './fibonacci';

it('fib(0) = 0', () => expect(fib(0)).toBe(0));
it('fib(1) = 1', () => expect(fib(1)).toBe(1));
it('fib(10) = 55', () => expect(fib(10)).toBe(55));
\`\`\`

**Step 2：实现（Green）**

\`\`\`ts
// fibonacci.ts
export function fib(n: number): number {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}
\`\`\`

**Step 3：重构**（如果需要）

### 7.3 TDD 适用场景

- 算法、工具函数：清晰输入输出，TDD 高效
- 复杂业务逻辑：先想清楚测试用例，避免实现跑偏
- Bug 修复：先写复现 bug 的测试，再修复

**不适用**：

- UI 探索阶段：界面变化快，测试跟不上
- 简单 CRUD：测试成本高于收益

---

## 八、测试实战建议

### 8.1 测什么

- ✅ 测公共函数、复杂业务逻辑
- ✅ 测组件的关键交互（点击、输入、状态变化）
- ✅ 测边界情况（null、空数组、超长字符串）
- ✅ 测错误处理（抛错、降级）
- ❌ 不测第三方库（它们有自己的测试）
- ❌ 不测实现细节（私有方法、state 结构）
- ❌ 不测常量、纯赋值

### 8.2 测试命名

\`\`\`ts
// ❌ 含糊
it('测试', () => {});
it('test add', () => {});

// ✅ 描述行为
it('空数组返回 undefined', () => {});
it('用户名为空时显示错误提示', () => {});
it('点击删除按钮后调用 onDelete', () => {});
\`\`\`

### 8.3 一个测试只测一件事

\`\`\`ts
// ❌ 一个测多个行为
it('用户操作', () => {
  // 登录
  // 添加商品
  // 结算
  // 退出
});

// ✅ 拆分
it('登录成功后跳转首页', () => {});
it('添加商品到购物车', () => {});
it('结算时校验库存', () => {});
\`\`\`

### 8.4 测试数据管理

\`\`\`ts
// factories/fixtures 模式
function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    ...overrides,
  };
}

it('管理员可以删除用户', () => {
  const admin = createUser({ role: 'admin' });
  // ...
});

it('普通用户不能删除', () => {
  const user = createUser({ role: 'user' });
  // ...
});
\`\`\`

---

## 九、CI 集成

\`\`\`yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test --coverage
      - run: pnpm exec playwright test
      - uses: codecov/codecov-action@v3
\`\`\`

---

## 十、小结

自动化测试是质量保障的关键，关键点：

1. **测试金字塔**：单元多、E2E 少
2. **Vitest 替代 Jest**：快、原生 ESM、配置简单
3. **Testing Library**：测用户视角，不测实现细节
4. **Playwright 替代 Cypress**：跨浏览器、API 强大
5. **Mock 外部依赖**：网络、时间、存储
6. **覆盖率 80% 良好**：CI 卡阈值防退化
7. **TDD 适用算法/逻辑**：UI 探索阶段不必
8. **测试即文档**：好的测试名就是用例说明

下一章看 CI/CD——让代码自动从仓库到上线。
`,
  },
  {
    id: "fe-eng-cicd",
    group: "质量与现代化",
    icon: "🔄",
    title: "CI/CD 持续集成与部署",
    content: `

# CI/CD 持续集成与部署

## 一、CI/CD 是什么

### 1.1 三个概念

- **CI（Continuous Integration）**：持续集成。代码 push 后自动跑测试、lint、构建，确保集成不破坏主分支。
- **CD（Continuous Delivery）**：持续交付。CI 通过后自动打包成可发布产物。
- **CD（Continuous Deployment）**：持续部署。CDelivery 自动推到生产环境。

### 1.2 没 CI/CD 的世界

\`\`\`
开发写代码 → PR → 人肉 review → 合并 → 手动 build → 手动传服务器 → 手动重启
              ↑                    ↑                  ↑                ↑
           容易漏看 bug        忘记 build         传错文件          重启时机错
\`\`\`

CI/CD 把这些手动步骤自动化：

\`\`\`
push → CI 跑测试 → 通过 → 自动 build → 自动部署 → 通知团队
              ↓ 失败
            阻止合并 + 通知作者修复
\`\`\`

### 1.3 CI/CD 的价值

1. **早发现问题**：每次 push 都跑测试，问题在源头暴露
2. **可重复发布**：流程代码化，不会「上次怎么发的」
3. **减少人为错误**：自动化部署避免手抖
4. **快速迭代**：从天级发布 → 小时级发布

---

## 二、GitHub Actions 基础

### 2.1 工作流文件

GitHub Actions 用 YAML 配置，放在 \`.github/workflows/\`：

\`\`\`yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

      - name: Test
        run: pnpm test --coverage

      - name: Build
        run: pnpm build
\`\`\`

### 2.2 核心概念

**on**：触发条件

\`\`\`yaml
on:
  push:
    branches: [main]              # main 分支 push 时
  pull_request:                   # 任何 PR
  workflow_dispatch:              # 手动触发
  schedule:
    - cron: '0 2 * * *'           # 每天凌晨 2 点
\`\`\`

**jobs**：任务，并行执行（除非有 needs 依赖）

\`\`\`yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps: [...]
  build:
    needs: test                   # 等 test 完成才跑
    runs-on: ubuntu-latest
    steps: [...]
\`\`\`

**steps**：步骤，串行执行

\`\`\`yaml
steps:
  - uses: actions/checkout@v4    # 用别人写好的 action
  - run: pnpm install             # 直接跑命令
  - name: 自定义名字
    run: pnpm test
\`\`\`

### 2.3 矩阵构建

跨多个 Node 版本/操作系统测试：

\`\`\`yaml
jobs:
  test:
    runs-on: \${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
      - run: pnpm install
      - run: pnpm test
\`\`\`

会跑 3 × 3 = 9 个任务组合。

---

## 三、前端典型 CI 流程

### 3.1 完整流程

\`\`\`yaml
name: CI

on: [push, pull_request]

jobs:
  quality:
    name: Lint + Type + Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 8 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    name: Build
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
\`\`\`

### 3.2 缓存加速

\`\`\`yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'pnpm'    # 自动缓存 pnpm store
\`\`\`

二次构建从 60s 降到 15s。

### 3.3 并行执行

把不依赖的步骤拆成多个 job 并行：

\`\`\`yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps: [...]
  typecheck:
    runs-on: ubuntu-latest
    steps: [...]
  test:
    runs-on: ubuntu-latest
    steps: [...]
  build:
    needs: [lint, typecheck, test]
    runs-on: ubuntu-latest
    steps: [...]
\`\`\`

总耗时 = max(lint, typecheck, test) + build，而不是累加。

---

## 四、部署策略

### 4.1 静态站点部署

前端产物是静态文件，部署到 CDN 静态服务器：

**Vercel / Netlify（最省心）**：

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
\`\`\`

或直接连 Vercel 仓库，push 自动部署，无需 CI 配置。

**AWS S3 + CloudFront**：

\`\`\`yaml
- name: Upload to S3
  run: aws s3 sync dist/ s3://my-bucket --delete

- name: Invalidate CloudFront
  run: aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
\`\`\`

### 4.2 Docker 部署

\`\`\`dockerfile
# 多阶段构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

\`\`\`yaml
- name: Build Docker image
  run: docker build -t my-app:\${{ github.sha }} .

- name: Push to registry
  run: |
    docker login -u \${{ secrets.DOCKER_USER }} -p \${{ secrets.DOCKER_PASS }}
    docker push my-app:\${{ github.sha }}
\`\`\`

### 4.3 蓝绿部署

\`\`\`
当前线上跑 v1（蓝色）
↓
部署 v2（绿色）到新服务器，但流量还没切
↓
跑冒烟测试，确认 v2 健康
↓
流量切换：100% → v2
↓
观察一段时间，没问题就销毁 v1
\`\`\`

零停机部署，出问题秒回滚。

### 4.4 灰度发布（金丝雀发布）

\`\`\`
v2 部署后，先只让 1% 流量到 v2
↓
观察指标（错误率、性能）
↓
逐步 5% → 25% → 50% → 100%
↓
任何阶段出问题立即回滚
\`\`\`

适合高风险发布（大重构、新功能）。

---

## 五、环境管理

### 5.1 多环境部署

\`\`\`yaml
jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - run: pnpm build --mode staging
      - run: deploy-to-staging

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production    # GitHub 会要求人工审批
    steps:
      - run: pnpm build --mode production
      - run: deploy-to-prod
\`\`\`

### 5.2 GitHub Environments

在 GitHub repo Settings → Environments 配置：

- **staging**：自动部署
- **production**：需要人工 approval，限制分支

\`\`\`yaml
environment:
  name: production
  url: https://app.example.com
\`\`\`

\`environment: production\` 触发 GitHub 的审批流程，必须有人点 approve 才会执行后续步骤。

### 5.3 Secrets 管理

敏感信息（API key、密码、SSH key）放在 GitHub Secrets：

\`\`\`yaml
- name: Deploy
  run: ./deploy.sh
  env:
    DEPLOY_KEY: \${{ secrets.DEPLOY_KEY }}
    API_TOKEN: \${{ secrets.API_TOKEN }}
\`\`\`

在 Settings → Secrets and variables → Actions 配置，加密存储，日志里会自动 mask。

---

## 六、分支策略与发布流程

### 6.1 GitHub Flow（最简单）

\`\`\`
main 分支永远是可部署状态
↓
新功能从 main 拉分支：feature/login
↓
开发 + PR
↓
CI 跑测试，人 review
↓
合并到 main，自动部署
\`\`\`

适合：小型项目、持续部署。

### 6.2 Git Flow（复杂）

\`\`\`
main        ← 生产分支
develop     ← 开发分支
feature/*   ← 功能分支
release/*   ← 发布分支
hotfix/*    ← 紧急修复
\`\`\`

适合：版本发布、企业项目。

### 6.3 Trunk-Based Development

\`\`\`
所有人都往 main 提交
↓
短分支（< 24 小时）
↓
未完成功能用 feature flag 隐藏
↓
main 持续部署
\`\`\`

适合：高频发布的团队。

### 6.4 语义化版本与自动 changelog

用 \`standard-version\` 或 \`changesets\` 自动生成版本号和 changelog：

\`\`\`bash
pnpm add -D changesets
pnpm changeset init

# 改代码时记录变更
pnpm changeset
# 选择 patch/minor/major，写描述

# 发版时
pnpm changeset version    # 自动改 package.json + 生成 CHANGELOG.md
pnpm changeset publish    # 发布到 npm
\`\`\`

---

## 七、监控与告警

### 7.1 部署后监控

CI/CD 部署成功不代表没问题，要监控线上：

- **错误监控**：Sentry、Bugsnag
- **性能监控**：web-vitals 上报
- **业务监控**：核心转化率、错误率

### 7.2 错误上报

\`\`\`ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: __APP_VERSION__,  // 版本号，方便定位
});

// 自动捕获未处理异常
// 手动上报
try {
  riskyOperation();
} catch (e) {
  Sentry.captureException(e);
}
\`\`\`

### 7.3 回滚

部署出问题要能快速回滚：

\`\`\`yaml
- name: Rollback on failure
  if: failure()
  run: |
    aws s3 sync s3://my-bucket-prev/ s3://my-bucket/ --delete
    aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
\`\`\`

保留上一版本的产物，部署失败自动切回。

---

## 八、CI/CD 实战建议

### 8.1 流程要快

CI 跑 10 分钟以上，开发者就不愿意等：

- 缓存依赖（pnpm store）
- 并行执行（拆 jobs）
- 增量测试（只跑改动相关的测试）
- 用更快的 runner（自建 runner 比 GitHub-hosted 快）

### 8.2 失败要明确

\`\`\`yaml
- name: Test
  run: pnpm test
  if: always()    # 即使前面失败也跑（信息收集）
\`\`\`

失败时输出明确错误，附上日志链接。

### 8.3 不要在 CI 修 bug

CI 失败时，本地复现 → 修复 → 重新 push。不要在 CI 里调试。

### 8.4 保护主分支

GitHub Settings → Branches → Branch protection rules：

- 必须通过 CI 才能合并
- 必须 ≥ 1 个 review
- 禁止 force push
- 禁止删除 main

---

## 九、完整实战示例

\`\`\`yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:

env:
  NODE_VERSION: 20
  PNPM_VERSION: 8

jobs:
  # Job 1: 质量检查（PR 和 push 都跑）
  quality:
    name: Lint + Type + Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: \${{ env.PNPM_VERSION }} }
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test --coverage
      - uses: codecov/codecov-action@v3
        with: { files: ./coverage/coverage-final.json }

  # Job 2: 构建（依赖 quality）
  build:
    name: Build
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: \${{ env.PNPM_VERSION }} }
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7

  # Job 3: 部署到 staging（PR 时跑）
  deploy-staging:
    name: Deploy to Staging
    needs: build
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/download-artifact@v4
        with: { name: dist, path: dist }
      - name: Deploy
        run: |
          aws s3 sync dist/ s3://staging-bucket/pr-\${{ github.event.pull_request.number }} --delete
          echo "Preview: https://pr-\${{ github.event.pull_request.number }}.staging.example.com"

  # Job 4: 部署到 production（main 分支 + 人工审批）
  deploy-production:
    name: Deploy to Production
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.example.com
    steps:
      - uses: actions/download-artifact@v4
        with: { name: dist, path: dist }
      - name: Deploy
        run: |
          aws s3 sync dist/ s3://prod-bucket --delete
          aws cloudfront create-invalidation --distribution-id EXXX --paths "/*"
      - name: Notify
        uses: slackapi/slack-github-action@v1
        with:
          slack-message: "🚀 Production deployed: \${{ github.event.head_commit.message }}"
        env:
          SLACK_WEBHOOK_URL: \${{ secrets.SLACK_WEBHOOK }}
\`\`\`

---

## 十、小结

CI/CD 是工程化的「自动化枢纽」，关键点：

1. **CI 跑测试 + lint + build**：每次 push 自动验证
2. **缓存依赖**：CI 时间从分钟级到秒级
3. **并行 jobs**：拆分独立任务并行执行
4. **多环境**：staging 自动部署，production 人工审批
5. **Secrets 管理**：敏感信息不进代码
6. **蓝绿/灰度部署**：零停机、可回滚
7. **监控告警**：部署后监控线上错误率
8. **保护主分支**：必须通过 CI 才能合并

下一章看 Monorepo——管理多个相关包的现代方案。
`,
  },
  {
    id: "fe-eng-monorepo",
    group: "质量与现代化",
    icon: "🗂️",
    title: "Monorepo：多包管理与 Turborepo",
    content: `

# Monorepo：多包管理与 Turborepo

## 一、什么是 Monorepo

### 1.1 代码组织的三种模式

**单仓库单包（Single Repo, Single Package）**

\`\`\`
my-app/
└── 一个 package.json
\`\`\`

最常见，单个项目。

**多仓库（Multi-repo / Polyrepo）**

\`\`\`
github.com/company/web-app       ← 仓库 1
github.com/company/admin-panel   ← 仓库 2
github.com/company/ui-kit        ← 仓库 3
github.com/company/utils         ← 仓库 4
\`\`\`

每个项目独立仓库，独立发布。

**Monorepo（单仓库多包）**

\`\`\`
company-monorepo/
├── apps/
│   ├── web-app/        ← 包 1
│   ├── admin-panel/    ← 包 2
│   └── mobile-app/     ← 包 3
└── packages/
    ├── ui-kit/         ← 包 4
    ├── utils/          ← 包 5
    └── eslint-config/  ← 包 6
\`\`\`

多个包在同一个 git 仓库，但有各自的 \`package.json\`。

### 1.2 Monorepo 的优势

1. **代码共享简单**：utils 改了，所有 app 立即用到，不用发版
2. **原子提交**：一个 PR 同时改 utils 和 web-app，保证一致性
3. **统一工具链**：所有包共享 ESLint/Prettier/TS 配置
4. **依赖管理集中**：一个 lock 文件，版本统一
5. **易于重构**：跨包重构一个 PR 搞定

### 1.3 Monorepo 的挑战

1. **构建性能**：改一个包，不能把所有包都重新构建
2. **仓库体积**：clone 慢（用 sparse checkout 缓解）
3. **权限管理**：所有人都能看到所有代码（细粒度权限弱）
4. **工具复杂度**：需要专门的 monorepo 工具

---

## 二、Monorepo 工具演进

### 2.1 工具对比

| 工具 | 特点 | 适用 |
|------|------|------|
| Lerna | 最早的 monorepo 工具，已合并到 Nx | 老项目 |
| Yarn Workspaces | yarn 内置，基础能力 | 简单场景 |
| pnpm Workspaces | pnpm 内置，结合硬链接省磁盘 | **推荐** |
| Nx | 智能构建、依赖图、代码生成 | 大型企业 |
| Turborepo | Vercel 出品，专注构建加速 | **推荐** |

### 2.2 pnpm Workspaces + Turborepo：现代组合

- pnpm Workspaces：依赖管理（硬链接省磁盘、严格依赖）
- Turborepo：构建编排（缓存、并行、增量构建）

---

## 三、pnpm Workspaces

### 3.1 创建 workspace

\`\`\`bash
mkdir my-monorepo && cd my-monorepo
pnpm init
\`\`\`

\`\`\`yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
\`\`\`

\`\`\`json
// 根 package.json
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm -r dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint"
  }
}
\`\`\`

### 3.2 创建子包

\`\`\`bash
mkdir -p apps/web packages/ui
cd apps/web && pnpm init
cd packages/ui && pnpm init
\`\`\`

\`\`\`json
// apps/web/package.json
{
  "name": "@my-app/web",
  "version": "1.0.0",
  "dependencies": {
    "@my-monorepo/ui": "workspace:*",   ← 引用内部包
    "react": "^18.2.0"
  }
}
\`\`\`

\`\`\`json
// packages/ui/package.json
{
  "name": "@my-monorepo/ui",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "dependencies": {
    "react": "^18.2.0"
  }
}
\`\`\`

### 3.3 workspace:* 协议

\`\`\`json
{
  "dependencies": {
    "@my-monorepo/ui": "workspace:*",        // 任意版本（最新）
    "@my-monorepo/utils": "workspace:^1.0.0", // 1.0.0 以上
    "@my-monorepo/config": "workspace:~1.2.0" // 1.2.x
  }
}
\`\`\`

\`workspace:*\` 是 pnpm 特有协议，引用 workspace 内的包，不用先发布到 npm。

### 3.4 安装依赖

\`\`\`bash
# 在根目录一次性安装所有包的依赖
pnpm install

# 给特定包加依赖
pnpm --filter @my-app/web add axios

# 给所有包加依赖
pnpm -r add lodash

# 给根加开发依赖（共享工具）
pnpm add -D -w typescript eslint prettier
\`\`\`

### 3.5 在子包之间引用

\`\`\`ts
// packages/ui/src/Button.tsx
import React from 'react';
export function Button() { return <button>Click</button>; }

// packages/ui/src/index.ts
export { Button } from './Button';

// apps/web/src/App.tsx
import { Button } from '@my-monorepo/ui';   ← 直接引用，无需构建
function App() { return <Button />; }
\`\`\`

pnpm 用符号链接让 \`@my-monorepo/ui\` 指向 \`packages/ui\`，开发时直接读源码，无需先 build。

---

## 四、Turborepo

### 4.1 安装

\`\`\`bash
pnpm add -D -w turbo
\`\`\`

\`\`\`json
// 根 package.json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test"
  }
}
\`\`\`

### 4.2 turbo.json 配置

\`\`\`json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],     // 先 build 依赖的包
      "outputs": ["dist/**"]        // 缓存输出
    },
    "dev": {
      "cache": false,                // dev 不缓存
      "persistent": true             // 长期运行任务
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    }
  }
}
\`\`\`

\`^build\` 表示「先执行依赖包的 build」。Turborepo 自动分析包依赖图，按拓扑序执行。

### 4.3 增量构建

\`\`\`bash
# 只构建受影响的包
turbo build --filter=...[origin/main]

# 构建某个包及其依赖
turbo build --filter=@my-app/web...

# 构建 web 这个包，不包括依赖
turbo build --filter=@my-app/web
\`\`\`

改了一个 utils 包，\`turbo build --filter=...[origin/main]\` 只会构建 utils 和依赖它的 web，不会重新构建 admin。

### 4.4 远程缓存

本地缓存只对单人有用。Turborepo 支持远程缓存，团队共享：

\`\`\`bash
# 启用 Vercel 远程缓存（免费）
turbo login
turbo link

# 之后构建结果自动上传到远程
# 其他人构建同样代码直接拉缓存，秒级完成
\`\`\`

或自建远程缓存（用 Turborepo Remote Cache 自托管方案）。

### 4.5 并行执行

\`\`\`bash
turbo build  # 自动并行构建所有不互相依赖的包
\`\`\`

CPU 几核就并行几个任务，比串行 \`pnpm -r build\` 快几倍。

---

## 五、典型 Monorepo 结构

### 5.1 完整示例

\`\`\`bash
my-monorepo/
├── apps/                            # 应用（可部署的）
│   ├── web/                         # 主站
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── admin/                       # 后台管理
│   │   └── ...
│   └── mobile/                      # 移动端（React Native 等）
│       └── ...
├── packages/                        # 共享包
│   ├── ui/                          # UI 组件库
│   │   ├── src/
│   │   │   ├── Button/
│   │   │   ├── Modal/
│   │   │   └── index.ts
│   │   └── package.json
│   ├── utils/                       # 工具函数
│   ├── api-client/                  # API 封装
│   ├── types/                       # 共享类型
│   └── config/                      # 共享配置
│       ├── eslint/
│       ├── tsconfig/
│       └── tailwind/
├── .github/workflows/
├── turbo.json
├── pnpm-workspace.yaml
├── package.json                     # 根
└── tsconfig.base.json               # 共享 TS 配置
\`\`\`

### 5.2 共享配置包

\`\`\`json
// packages/config/tsconfig/base.json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
\`\`\`

\`\`\`json
// packages/config/tsconfig/react.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
}
\`\`\`

\`\`\`json
// apps/web/tsconfig.json
{
  "extends": "@my-monorepo/config/tsconfig/react.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
\`\`\`

所有包共享一份 TS 配置，改一处生效。

### 5.3 共享 ESLint 配置

\`\`\`js
// packages/config/eslint/index.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'prettier',
  ],
  rules: { /* ... */ },
};
\`\`\`

\`\`\`js
// apps/web/.eslintrc.js
module.exports = {
  extends: ['@my-monorepo/config/eslint'],
  // 项目特定规则
};
\`\`\`

---

## 六、跨包重构

Monorepo 最大的好处之一是跨包重构的安全。

### 6.1 改一个 API，所有调用方立即报错

\`\`\`ts
// packages/api-client/src/user.ts
export interface User {
  id: number;
  name: string;
  email: string;
}

// 改成
export interface User {
  id: number;
  displayName: string;   // ← name 改成 displayName
  email: string;
}
\`\`\`

\`\`\`ts
// apps/web/src/UserProfile.tsx
import { User } from '@my-monorepo/api-client';

function UserProfile({ user }: { user: User }) {
  return <h1>{user.name}</h1>;   // ← 立即报错：name 不存在
}
\`\`\`

\`\`\`ts
// apps/admin/src/UserList.tsx
import { User } from '@my-monorepo/api-client';

users.map(u => u.name)   // ← 也立即报错
\`\`\`

一个 PR 改完所有调用方，merge 后所有应用一致。多 repo 做不到。

### 6.2 原子提交

\`\`\`bash
git commit -m "refactor: User.name → displayName 跨应用改名

- packages/api-client: 改类型
- apps/web: 更新调用
- apps/admin: 更新调用
- packages/ui: 更新 UserCard 组件"
\`\`\`

一个 commit 同时改 4 个包，review 一次，merge 一次。

---

## 七、版本与发布

### 7.1 统一版本（Fixed Versioning）

所有包用同一版本号：

\`\`\`bash
v1.2.0
├── @my-app/web@1.2.0
├── @my-app/admin@1.2.0
└── @my-monorepo/ui@1.2.0
\`\`\`

适合：紧密耦合的包，一起发布。

### 7.2 独立版本（Independent Versioning）

每个包独立版本：

\`\`\`bash
├── @my-app/web@1.5.0
├── @my-app/admin@0.8.2
└── @my-monorepo/ui@2.1.0
\`\`\`

适合：松散的包，独立演进。

### 7.3 Changesets

最流行的 monorepo 发版工具：

\`\`\`bash
pnpm add -D -w @changesets/cli
pnpm changeset init
\`\`\`

\`\`\`bash
# 改完代码后记录变更
pnpm changeset
# ? 哪些包要发版？ → 选 @my-monorepo/ui
# ? 是 minor 还是 patch？ → minor
# ? 描述 → 添加 Button 组件

# 生成 .changeset/xxx.md
\`\`\`

\`\`\`markdown
<!-- .changeset/quick-dogs-smile.md -->
---
"@my-monorepo/ui": minor
---
添加 Button 组件
\`\`\`

发版时：

\`\`\`bash
pnpm changeset version
# 自动：
# 1. 改 packages/ui/package.json 的 version
# 2. 在 packages/ui/CHANGELOG.md 加条目
# 3. 删除 .changeset/xxx.md

pnpm changeset publish
# 自动：
# 1. build 所有要发布的包
# 2. 发布到 npm
# 3. 打 git tag
\`\`\`

### 7.4 配合 GitHub Actions 自动发版

\`\`\`yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          registry-url: 'https://registry.npmjs.org'

      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      - name: Create release PR or publish
        uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: \${{ secrets.NPM_TOKEN }}
\`\`\`

工作流：

1. 开发者 push 代码（含 \`.changeset/*.md\`）
2. CI 自动创建「Version Packages」PR，更新版本号和 changelog
3. 维护者 merge 这个 PR
4. CI 自动发布到 npm

---

## 八、Monorepo CI

### 8.1 增量 CI

只对受影响的包跑 CI：

\`\`\`yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }   # 拉取完整历史

      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }

      - run: pnpm install --frozen-lockfile

      - name: Build affected
        run: pnpm turbo build --filter=...[origin/main]
        # 只构建自上次 main 以来的改动影响的包

      - name: Test affected
        run: pnpm turbo test --filter=...[origin/main]
\`\`\`

### 8.2 远程缓存

\`\`\`yaml
- name: Setup Turbo Remote Cache
  run: |
    pnpm turbo login --token=\${{ secrets.TURBO_TOKEN }}
    pnpm turbo link --scope=\${{ vars.TURBO_TEAM }}

- name: Build
  run: pnpm turbo build --filter=...[origin/main]
\`\`\`

CI 缓存命中时直接复用构建产物，秒级完成。

---

## 九、何时不该用 Monorepo

### 9.1 不适合的场景

1. **包之间无关联**：不同业务线的项目硬塞一起，徒增复杂度
2. **权限需求严格**：不同团队不该互相看代码（用 multi-repo）
3. **单团队小项目**：只有一个应用，没有共享需求
4. **发版节奏差异大**：包 A 一天发 10 次，包 B 半年发一次，独立仓库更合适

### 9.2 迁移建议

从 multi-repo 迁移到 monorepo：

1. 先用一个新仓库作为 monorepo 容器
2. 用 \`git subtree add\` 把老仓库作为子目录引入（保留历史）
3. 调整 package.json，加 workspace 协议
4. 配置 Turborepo
5. CI/CD 迁移

不要一次性大爆炸迁移，分步走。

---

## 十、Monorepo 实战建议

### 10.1 包的粒度

- **不要过度拆**：每个文件一个包是反模式
- **按「发布单元」拆**：能独立发布的最小单元是一个包
- **应用 vs 库**：\`apps/\` 放可部署应用，\`packages/\` 放共享库

### 10.2 依赖管理

- **共享依赖放根**：TypeScript、ESLint 这些开发工具放根 \`devDependencies\`
- **运行时依赖各自管**：每个包声明自己实际用到的运行时依赖
- **统一版本**：用 \`pnpm.overrides\` 强制依赖版本一致

\`\`\`json
// 根 package.json
{
  "pnpm": {
    "overrides": {
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    }
  }
}
\`\`\`

### 10.3 不要循环依赖

\`\`\`
package A 依赖 B
package B 依赖 A   ← ❌ 循环依赖
\`\`\`

如果出现，说明拆分有问题，应该把循环部分抽到第三个包。

---

## 十一、结语：前端工程化的全景回顾

恭喜你完成了 15 章的前端工程化学习！回顾整个教程的脉络：

| 篇章 | 章节 | 核心能力 |
|------|------|----------|
| 基础概念 | 1-5 | 工程化思维、模块化、包管理、目录规范、环境统一 |
| 构建与打包 | 6-10 | Webpack、Vite、Babel、CSS 工程化、性能优化 |
| 质量与现代化 | 11-15 | ESLint、TypeScript、测试、CI/CD、Monorepo |

### 工程化的本质

前端工程化不是某个工具或技术，而是**用工程思维系统化地解决前端开发问题**。它追求的是：

1. **可复现**：同样的代码 + 同样的环境 = 同样的结果
2. **可维护**：代码可读、可测、可改、可扩展
3. **可协作**：规范统一、流程清晰、职责分明
4. **可交付**：从代码到上线是自动、可靠、快速的

### 持续学习

工程化的工具在快速演进，但核心思想稳定：

- 模块化思想 → 永远不会过时
- 静态分析（类型 + Lint）→ 越来越重要
- 自动化（测试 + CI/CD）→ 软件工程的基石
- 性能优化 → 用户体验的根本

学具体工具，更要学背后的「为什么」。新工具会替代旧工具，但「为什么要模块化」「为什么要测试」「为什么要持续集成」这些根本问题，值得每个工程师深入思考。

祝你在前端工程化之路上越走越远！🚀
`,
  },
];
