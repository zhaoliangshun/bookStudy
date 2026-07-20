// =============================================================
// Vite 大全集（终极版）—— 第8批章节
// 第十部分 工程化 + 第十一部分 SSR/SSG（共 7 章）
// -------------------------------------------------------------
// 本批包含 7 章：
//   vite2-ch48 : 第四十八章 ESLint + Prettier
//   vite2-ch49 : 第四十九章 TypeScript 配置
//   vite2-ch50 : 第五十章 Tailwind CSS 集成
//   vite2-ch51 : 第五十一章 Vitest 单元测试
//   vite2-ch52 : 第五十二章 CI/CD 与 Docker
//   vite2-ch53 : 第五十三章 SSR 基础与原理
//   vite2-ch54 : 第五十四章 Vike 与 Astro
// =============================================================

export const chapters = [
  // =========================================================
  // 第四十八章：ESLint + Prettier
  // =========================================================
  {
    id: "vite2-ch48",
    group: "第十部分 工程化",
    icon: "🔍",
    title: "第四十八章 ESLint + Prettier",
    content: `## 为什么需要 ESLint + Prettier

项目一旦人多起来，代码风格就会乱：有人用单引号、有人用双引号、有人用 tab、有人用空格。**ESLint** 负责检查代码质量（未使用变量、隐式 any 等），**Prettier** 负责统一格式化（缩进、换行、引号）。两者配合，团队代码就像一个人写的。

> 一句话：**ESLint 管"对不对"，Prettier 管"好不好看"**。

---

## ESLint 9 Flat Config

ESLint 9 默认启用 **Flat Config**（扁平化配置），不再用 \`.eslintrc.*\` 那套继承式配置，改用 \`eslint.config.js\` 导出一个数组。

### 安装

\`\`\`bash
npm install -D eslint @eslint/js
\`\`\`

### 最小配置

\`\`\`js
// eslint.config.js
import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off'
    }
  }
]
\`\`\`

数组里每个对象是一个**配置块**，后面的会覆盖前面的。比老的继承式配置更直观。

---

## 集成 React 与 TypeScript

\`\`\`bash
npm install -D eslint-plugin-react @typescript-eslint/parser @typescript-eslint/eslint-plugin
\`\`\`

\`\`\`js
// eslint.config.js
import js from '@eslint/js'
import react from 'eslint-plugin-react'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    plugins: {
      react,
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...react.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'warn'
    },
    settings: { react: { version: 'detect' } }
  }
]
\`\`\`

---

## Prettier 集成

\`\`\`bash
npm install -D prettier eslint-config-prettier
\`\`\`

\`eslint-config-prettier\` 的作用是**关闭 ESLint 中所有与 Prettier 冲突的规则**（比如引号、分号），让 Prettier 全权负责格式。

\`\`\`js
// eslint.config.js（在数组最后追加）
import prettier from 'eslint-config-prettier'

export default [
  // ...其他配置
  prettier   // 必须放最后，关闭冲突规则
]
\`\`\`

### .prettierrc 配置

\`\`\`json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100,
  "tabWidth": 2
}
\`\`\`

---

## VS Code 配置

在 \`.vscode/settings.json\` 里：

\`\`\`json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": ["javascript", "typescript", "typescriptreact"]
}
\`\`\`

保存文件时自动格式化 + 自动修复 ESLint 问题。

---

## husky + lint-staged：提交前检查

光有 ESLint 不够，得保证提交到 Git 的代码都通过检查。\`husky\` 管理 Git hooks，\`lint-staged\` 只检查暂存区的文件（不检查整个项目，速度快）。

\`\`\`bash
npm install -D husky lint-staged
npx husky init    # 创建 .husky/ 目录
\`\`\`

\`\`\`bash
# .husky/pre-commit
npx lint-staged
\`\`\`

\`\`\`json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
\`\`\`

每次 \`git commit\` 时，只对改动的文件跑 ESLint + Prettier，不通过就拒绝提交。

---

## package.json scripts 汇总

\`\`\`json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
\`\`\`

---

## 下一章

代码风格统一了，下一章学习**TypeScript 配置**——tsconfig.json 每个字段都干啥用的。`,
    code: `// 演示：模拟 ESLint + Prettier 的工作流程
console.log("🔍 ESLint + Prettier 工作流");
console.log("=====================================");

// 模拟一份待检查的代码
const codeSample = [
  "const unused = 'hello'          // ESLint: 未使用变量警告",
  "let name='Tom'                  // Prettier: 修复为 let name = 'Tom'",
  "console.log(\"hi\");             // Prettier: 单引号、去分号",
  "function add(a, b){return a+b}  // Prettier: 加空格和花括号"
];

console.log("\\n📝 原始代码：");
codeSample.forEach(line => console.log("  " + line));

// 模拟 ESLint 检查
console.log("\\n🔎 ESLint 检查结果：");
const eslintIssues = [
  { file: "app.ts", line: 1, rule: "no-unused-vars", severity: "warn" },
  { file: "app.ts", line: 4, rule: "no-console", severity: "off" }
];
eslintIssues.forEach(i => {
  console.log(\`  \${i.severity.toUpperCase()} \${i.file}:\${i.line} \${i.rule}\`);
});

// 模拟 Prettier 格式化
console.log("\\n✨ Prettier 格式化后：");
const formatted = [
  "const unused = 'hello'",
  "let name = 'Tom'",
  "console.log('hi')",
  "function add(a, b) {\\n  return a + b\\n}"
];
formatted.forEach(line => console.log("  " + line));

// 模拟 lint-staged 只检查暂存区
console.log("\\n📦 lint-staged 工作流：");
const stagedFiles = ["src/App.tsx", "src/utils.ts"];
console.log("  暂存区文件:", stagedFiles.join(", "));
console.log("  → 只对这 2 个文件跑 eslint --fix + prettier --write");
console.log("  → 比检查全项目快 10 倍");

console.log("\\n✅ 团队代码风格统一，提交即规范");`,
  },

  // =========================================================
  // 第四十九章：TypeScript 配置
  // =========================================================
  {
    id: "vite2-ch49",
    group: "第十部分 工程化",
    icon: "📘",
    title: "第四十九章 TypeScript 配置",
    content: `## tsconfig.json 是什么

\`tsconfig.json\` 是 TypeScript 项目的配置文件，告诉 TS 编译器：把代码编译成什么版本、用哪种模块系统、哪些文件参与编译、路径怎么别名。

Vite 项目里通常有**两个 tsconfig**：

| 文件 | 作用 |
|------|------|
| \`tsconfig.json\` | 给应用代码用（src/ 下的 .ts/.tsx） |
| \`tsconfig.node.json\` | 给 Node 端配置文件用（vite.config.ts） |

---

## 典型 tsconfig.json

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
\`\`\`

---

## compilerOptions 核心字段

| 字段 | 作用 | 常用值 |
|------|------|--------|
| \`target\` | 编译目标 JS 版本 | \`ES2020\` / \`ESNext\` |
| \`module\` | 输出模块系统 | \`ESNext\` / \`CommonJS\` |
| \`moduleResolution\` | 模块解析策略 | \`bundler\`（Vite 推荐）/ \`node\` |
| \`jsx\` | JSX 处理方式 | \`react-jsx\`（React 17+）/ \`preserve\` |
| \`lib\` | 可用的类型库 | \`["ES2020", "DOM", "DOM.Iterable"]\` |
| \`strict\` | 开启所有严格检查 | \`true\`（强烈推荐） |
| \`noEmit\` | 不输出 JS（Vite 负责打包） | \`true\` |
| \`isolatedModules\` | 每个文件独立编译 | \`true\`（Vite 必须） |
| \`skipLibCheck\` | 跳过 .d.ts 类型检查 | \`true\`（加速） |

### 为什么 noEmit: true

Vite 用 esbuild 编译 TS，**不靠 tsc 打包**。\`tsconfig.json\` 只负责类型检查（\`tsc --noEmit\`），不输出文件。

### 为什么 isolatedModules: true

Vite 编译时**每个文件独立处理**，不能跨文件推断类型。开启此项后，TS 会警告你那些依赖跨文件推断的写法（比如 \`export {}\`  \`re-export\` 时必须显式标注 \`type\`）。

---

## paths 路径别名

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

这样写：

\`\`\`ts
// 原来
import Button from '../../../../components/Button'
// 现在
import Button from '@components/Button'
\`\`\`

⚠️ **tsconfig 的 paths 只让 TS 认识别名，运行时还要在 vite.config.ts 里配 alias**，否则 Vite 解析不了。

\`\`\`ts
// vite.config.ts
import path from 'path'
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
\`\`\`

---

## vite-env.d.ts：Vite 类型声明

\`\`\`ts
// src/vite-env.d.ts
/// <reference types="vite/client" />
\`\`\`

这一行让 TS 认识 Vite 特有的 API：

- \`import.meta.env\`：环境变量
- \`import.meta.glob\`：批量导入
- \`*.vue\` / \`*.svg\` 等资源的模块声明

### 自定义 ImportMetaEnv 类型

\`\`\`ts
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE: string
  readonly VITE_BUILD_TIME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
\`\`\`

这样 \`import.meta.env.VITE_API_BASE\` 就有类型提示了，输错变量名会报错。

---

## tsconfig.node.json

\`\`\`json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
\`\`\`

专门给 \`vite.config.ts\` 用，因为它运行在 Node 端，要的 lib 和应用代码不一样。\`composite: true\` 让它被主 tsconfig \`references\`。

---

## 类型检查脚本

Vite 开发时不做类型检查（用 esbuild 直接剥离类型），所以建议 CI 里加一个：

\`\`\`json
{
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}
\`\`\`

\`\`\`bash
npm run type-check   # 只检查类型，不输出文件
\`\`\`

可以加到 husky 的 pre-commit，或 CI 流水线里。

---

## 下一章

TS 配置清楚后，下一章学习**Tailwind CSS 集成**——Vite 里用 Tailwind 的正确姿势。`,
    code: `// 演示：解析 tsconfig.json 的关键字段
const tsconfig = {
  compilerOptions: {
    target: "ES2020",           // 编译目标 JS 版本
    module: "ESNext",           // 输出模块系统
    moduleResolution: "bundler",// 模块解析策略（Vite 推荐）
    jsx: "react-jsx",           // JSX 处理（React 17+ 新转换）
    lib: ["ES2020", "DOM", "DOM.Iterable"],
    strict: true,               // 开启所有严格检查
    noEmit: true,               // 不输出 JS（Vite 负责打包）
    isolatedModules: true,      // 每个文件独立编译（Vite 必须）
    skipLibCheck: true,         // 跳过 .d.ts 检查加速
    baseUrl: ".",
    paths: {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  },
  include: ["src"],
  references: [{ path: "./tsconfig.node.json" }]
};

console.log("📘 tsconfig.json 关键字段解析");
console.log("=====================================");
console.log("target:", tsconfig.compilerOptions.target, "← 编译目标 JS 版本");
console.log("module:", tsconfig.compilerOptions.module, "← 输出模块系统");
console.log("moduleResolution:", tsconfig.compilerOptions.moduleResolution, "← Vite 推荐 bundler");
console.log("jsx:", tsconfig.compilerOptions.jsx, "← React 17+ 新转换");
console.log("strict:", tsconfig.compilerOptions.strict, "← 开启所有严格检查");
console.log("noEmit:", tsconfig.compilerOptions.noEmit, "← 不输出 JS，只做类型检查");
console.log("isolatedModules:", tsconfig.compilerOptions.isolatedModules, "← Vite 必须");

console.log("\\n🔀 paths 路径别名：");
Object.entries(tsconfig.compilerOptions.paths).forEach(([k, v]) => {
  console.log(\`  \${k} → \${v[0]}\`);
});

console.log("\\n⚠️ 注意：tsconfig paths 只让 TS 认识别名");
console.log("   运行时还要在 vite.config.ts 里配 resolve.alias");
console.log("\\n💡 还需要 src/vite-env.d.ts 声明 vite/client 类型");`,
  },

  // =========================================================
  // 第五十章：Tailwind CSS 集成
  // =========================================================
  {
    id: "vite2-ch50",
    group: "第十部分 工程化",
    icon: "🎨",
    title: "第五十章 Tailwind CSS 集成",
    content: `## Tailwind 是什么

**Tailwind CSS** 是一个**原子化 CSS 框架**，提供 \`flex\`、\`p-4\`、\`text-lg\` 等工具类，直接在 HTML 里写样式，不写 CSS 文件。

\`\`\`html
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  按钮
</button>
\`\`\`

好处：不用纠结类名、不用切文件、改样式快、产物小（按需打包）。

---

## Tailwind v3 安装（稳定版）

\`\`\`bash
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p    # 生成 tailwind.config.js + postcss.config.js
\`\`\`

### postcss.config.js

\`\`\`js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
\`\`\`

### tailwind.config.js

\`\`\`js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#409eff'
      }
    }
  },
  plugins: []
}
\`\`\`

**content 字段最重要**：告诉 Tailwind 扫描哪些文件，按需生成对应的 CSS。扫不到的类名不会出现在产物里。

### 入口 CSS

\`\`\`css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
\`\`\`

在 \`main.ts\` 里 \`import './index.css'\` 即可。

---

## Tailwind v4 + @tailwindcss/vite

Tailwind v4 大幅简化：不需要 postcss 配置、不需要 content 字段（自动检测），用 Vite 插件直接接入。

\`\`\`bash
npm install -D tailwindcss @tailwindcss/vite
\`\`\`

\`\`\`ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss()]
})
\`\`\`

\`\`\`css
/* src/index.css */
@import "tailwindcss";
\`\`\`

就这样，没了。v4 用 CSS-first 配置：

\`\`\`css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-primary: #409eff;
  --font-display: "Inter", sans-serif;
}
\`\`\`

然后用 \`bg-primary\` / \`font-display\` 即可。

---

## JIT 模式（即时编译）

Tailwind v3 默认开启 **JIT（Just-In-Time）**，按需生成 CSS：

- 产物极小：只包含你用到的类
- 支持任意值：\`p-[13px]\` / \`text-[#1da1f2]\` / \`grid-cols-[200px_1fr]\`
- 支持变体组合：\`hover:focus:sm:bg-red-500\`

v4 更进一步，所有内容都是 JIT，没有 fallback 模式。

---

## 自定义主题

### v3 写法（JS 配置）

\`\`\`js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: { 500: '#409eff', 600: '#1677ff' }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      spacing: {
        '128': '32rem'
      }
    }
  }
}
\`\`\`

### v4 写法（CSS 配置）

\`\`\`css
@theme {
  --color-primary-500: #409eff;
  --color-primary-600: #1677ff;
  --font-sans: "Inter", system-ui, sans-serif;
  --spacing-128: 32rem;
}
\`\`\`

---

## 常用插件生态

| 插件 | 作用 |
|------|------|
| \`@tailwindcss/forms\` | 美化表单元素 |
| \`@tailwindcss/typography\` | 给 markdown / 富文本排版 |
| \`@tailwindcss/aspect-ratio\` | 固定宽高比 |
| \`@tailwindcss/line-clamp\` | 多行截断（v3.3 已内置）|
| \`tailwindcss-animate\` | 动画工具类 |

v3 用法：

\`\`\`js
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

export default {
  plugins: [forms, typography]
}
\`\`\`

---

## 常见坑

1. **content 没配好**：用到的类没生成 → 检查 \`content\` 路径是否覆盖了所有模板
2. **动态类名失效**：Tailwind 看不到 \`\\\`bg-\${color}-500\\\`\` 这种字符串拼接 → 用完整类名映射
3. **vite 缓存**：改了 tailwind.config.js 不生效 → 重启 dev server

\`\`\`js
// ❌ 错误：Tailwind 扫描不到
const color = isPrimary ? 'blue' : 'gray'
<div className={\\\`bg-\${color}-500\\\`}>x</div>

// ✅ 正确：完整类名
const cls = isPrimary ? 'bg-blue-500' : 'bg-gray-500'
<div className={cls}>x</div>
\`\`\`

---

## 下一章

样式搞定了，下一章学习**Vitest 单元测试**——Vite 官方的测试框架。`,
    code: `// 演示：Tailwind 类名解析（模拟）
console.log("🎨 Tailwind CSS 类名解析");
console.log("=====================================");

// 模拟 Tailwind 配置
const tailwindConfig = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { primary: { 500: "#409eff", 600: "#1677ff" } },
      spacing: { 128: "32rem" }
    }
  },
  plugins: ["forms", "typography"]
};

// 模拟从 HTML 收集类名
const usedClasses = new Set([
  "bg-blue-500", "hover:bg-blue-700", "text-white",
  "font-bold", "py-2", "px-4", "rounded",
  "bg-primary-500", "p-[13px]", "text-[#1da1f2]"
]);

// 模拟 JIT 生成 CSS
const cssMap = {
  "bg-blue-500": ".bg-blue-500 { background-color: #3b82f6; }",
  "hover:bg-blue-700": ".hover\\\\:bg-blue-700:hover { background-color: #1d4ed8; }",
  "text-white": ".text-white { color: #fff; }",
  "font-bold": ".font-bold { font-weight: 700; }",
  "py-2": ".py-2 { padding-top: .5rem; padding-bottom: .5rem; }",
  "px-4": ".px-4 { padding-left: 1rem; padding-right: 1rem; }",
  "rounded": ".rounded { border-radius: .25rem; }",
  "bg-primary-500": ".bg-primary-500 { background-color: #409eff; }",
  "p-[13px]": ".p-\\\\[13px\\\\] { padding: 13px; }",
  "text-[#1da1f2]": ".text-\\\\[\\\\#1da1f2\\\\] { color: #1da1f2; }"
};

console.log("\\n📄 扫描到的类名：");
console.log("  " + Array.from(usedClasses).join(" "));

console.log("\\n🔧 JIT 生成的 CSS（按需，未用到不生成）：");
const generated = [];
usedClasses.forEach(cls => {
  if (cssMap[cls]) {
    generated.push(cssMap[cls]);
    console.log("  ✅ " + cssMap[cls]);
  }
});

console.log("\\n📦 产物大小：仅 " + generated.length + " 条规则");
console.log("💡 未用到的类名（如 bg-red-500）不会出现在产物里");
console.log("💡 content 字段决定扫描哪些文件，必须配对");`,
  },

  // =========================================================
  // 第五十一章：Vitest 单元测试
  // =========================================================
  {
    id: "vite2-ch51",
    group: "第十部分 工程化",
    icon: "🧪",
    title: "第五十一章 Vitest 单元测试",
    content: `## Vitest 是什么

**Vitest** 是 Vite 团队官方出的单元测试框架，**与 Vite 共享配置**，开箱即用，速度极快。

> 一句话：**Vite 项目要写测试，首选 Vitest**。

### 与 Jest 的区别

| 维度 | Jest | Vitest |
|------|------|--------|
| 配置 | 独立 babel/jest 配置 | 直接复用 vite.config |
| 转译 | babel（慢）| esbuild（快 10 倍）|
| HMR | 无 | 支持测试文件热更新 |
| ESM | 需要配置 | 原生支持 |
| 生态 | 最丰富 | 兼容 Jest API，迁移成本低 |
| TypeScript | 需 ts-jest | 内置 |
| 浏览器 | jsdom | jsdom / happy-dom / 真浏览器 |

API 几乎和 Jest 一样：\`describe\` / \`it\` / \`expect\` / \`mock\` 都在，迁移时主要改 import。

---

## 安装与配置

\`\`\`bash
npm install -D vitest @vitest/ui
\`\`\`

\`\`\`ts
// vitest.config.ts（也可直接在 vite.config.ts 里加 test 字段）
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',     // 测试环境：node / jsdom / happy-dom
    globals: true,            // 不用 import describe/it/expect
    coverage: {
      provider: 'v8',         // 或 istanbul
      reporter: ['text', 'json', 'html']
    }
  }
})
\`\`\`

### package.json scripts

\`\`\`json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
\`\`\`

---

## describe / it / expect

\`\`\`ts
// src/utils/math.test.ts
import { describe, it, expect } from 'vitest'
import { add, divide } from './math'

describe('add', () => {
  it('1 + 1 = 2', () => {
    expect(add(1, 1)).toBe(2)
  })

  it('负数相加', () => {
    expect(add(-1, -2)).toBe(-3)
  })
})

describe('divide', () => {
  it('除以 0 抛错', () => {
    expect(() => divide(1, 0)).toThrow('除数不能为 0')
  })
})
\`\`\`

常用匹配器：

| 匹配器 | 用途 |
|--------|------|
| \`toBe(x)\` | 严格相等（===）|
| \`toEqual(obj)\` | 深度相等 |
| \`toContain(x)\` | 数组/字符串包含 |
| \`toHaveLength(n)\` | 长度 |
| \`toThrow(msg)\` | 抛错 |
| \`resolves\` / \`rejects\` | Promise 结果 |
| \`toHaveBeenCalled()\` | mock 被调用 |

---

## mock

\`\`\`ts
import { vi } from 'vitest'

// mock 整个模块
vi.mock('./api', () => ({
  fetchUser: vi.fn(() => Promise.resolve({ name: 'Tom' }))
}))

// mock 全局对象
vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({ json: () => ({ ok: true }) })
))

// spy：监听但不替换
const spy = vi.spyOn(console, 'log')
someFunc()
expect(spy).toHaveBeenCalledWith('hello')

// 每次 mock 返回不同值
const fn = vi.fn()
  .mockReturnValueOnce(1)
  .mockReturnValueOnce(2)
  .mockReturnValue(3)
\`\`\`

---

## snapshot 快照测试

\`\`\`ts
import { test, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Button } from './Button'

test('Button 渲染快照', () => {
  const { container } = render(<Button>Click me</Button>)
  expect(container.firstChild).toMatchInlineSnapshot(\`
    <button class="btn">Click me</button>
  \`)
})
\`\`\`

第一次运行生成快照，之后对比。UI 变了快照不一致就报错，\`vitest -u\` 更新快照。

---

## coverage 覆盖率

\`\`\`bash
npm install -D @vitest/coverage-v8
npm run test:coverage
\`\`\`

输出类似：

\`\`\`
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |   87.5  |    75.0  |   83.3  |   87.5  |
 math.ts  |   100   |    100   |   100   |   100   |
 utils.ts |   75.0  |    50.0  |   66.6  |   75.0  | 12-15
----------|---------|----------|---------|---------|-------------------
\`\`\`

---

## UI 模式（可视化测试）

\`\`\`bash
npm run test:ui
\`\`\`

打开浏览器可视化面板，看每个测试用例的状态、错误、覆盖率、时间线，比命令行友好得多。改代码时实时更新，强烈推荐开发时一直开着。

---

## watch 模式

\`\`\`bash
npm run test       # 默认 watch
\`\`\`

修改代码或测试文件，只重跑受影响的测试。比 Jest watch 更快，因为 Vite 的依赖图已经知道哪些测试和你的改动相关。

---

## 与 Vite 共享配置

\`\`\`ts
// vite.config.ts
import { defineConfig } from 'vitest/config'   // 注意是 vitest/config
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' }
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
})
\`\`\`

\`vitest/config\` 继承自 \`vite\` 的 \`defineConfig\`，所以一个文件管 dev / build / test 三件事，别名、插件都共享。

---

## 下一章

测试有了，下一章学习**CI/CD 与 Docker**——怎么把项目自动构建部署上线。`,
    code: `// 演示：模拟 Vitest 的测试运行
console.log("🧪 Vitest 测试运行模拟");
console.log("=====================================");

// 模拟一个待测函数
function add(a, b) { return a + b; }
function divide(a, b) {
  if (b === 0) throw new Error("除数不能为 0");
  return a / b;
}

// 模拟测试用例
const tests = [
  { name: "add: 1 + 1 = 2", fn: () => add(1, 1) === 2 },
  { name: "add: -1 + -2 = -3", fn: () => add(-1, -2) === -3 },
  { name: "divide: 6 / 2 = 3", fn: () => divide(6, 2) === 3 },
  { name: "divide: 除以 0 抛错", fn: () => {
    try { divide(1, 0); return false; }
    catch (e) { return e.message === "除数不能为 0"; }
  }}
];

// 运行测试
let passed = 0;
let failed = 0;
console.log("\\n▶ 运行 4 个测试...\\n");
tests.forEach((t, i) => {
  const ok = t.fn();
  const status = ok ? "✓ PASS" : "✗ FAIL";
  console.log(\`  \${status}  \${t.name}\`);
  if (ok) passed++; else failed++;
});

// 模拟覆盖率统计
console.log("\\n📊 测试覆盖率：");
const coverage = [
  { file: "math.ts", stmts: 100, branch: 100, lines: 100 },
  { file: "utils.ts", stmts: 75, branch: 50, lines: 75 }
];
coverage.forEach(c => {
  console.log(\`  \${c.file.padEnd(12)} Stmts: \${c.stmts}%  Branch: \${c.branch}%  Lines: \${c.lines}%\`);
});

console.log(\`\\n⏱️  总耗时: 234ms（Vite 共享配置，esbuild 转译超快）\`);
console.log(\`✅ \${passed} passed, \${failed} failed\`);
console.log("\\n💡 watch 模式：改代码只重跑受影响的测试");
console.log("💡 UI 模式：npm run test:ui 可视化面板");`,
  },

  // =========================================================
  // 第五十二章：CI/CD 与 Docker
  // =========================================================
  {
    id: "vite2-ch52",
    group: "第十部分 工程化",
    icon: "🚢",
    title: "第五十二章 CI/CD 与 Docker",
    content: `## 什么是 CI/CD

- **CI（持续集成）**：代码推到仓库后，自动跑 lint / test / build，发现问题早
- **CD（持续部署）**：CI 通过后，自动部署到测试 / 生产环境

Vite 项目的 CI/CD 典型流程：\`push → install → lint → test → build → deploy\`。

---

## GitHub Actions

在仓库根目录创建 \`.github/workflows/ci.yml\`：

\`\`\`yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci            # 用 lockfile 严格安装

      - run: npm run lint

      - run: npm run type-check

      - run: npm run test:run  # 非交互模式跑测试

      - run: npm run build

      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
\`\`\`

### 缓存优化

\`actions/setup-node\` 的 \`cache: 'npm'\` 会缓存 \`node_modules\`，第二次起 CI 装依赖从 30 秒降到 3 秒。

---

## Vercel / Netlify 自动部署

### Vercel

\`\`\`bash
npm i -g vercel
vercel        # 首次配置
vercel --prod # 部署生产
\`\`\`

或在 GitHub 仓库导入到 Vercel，自动每次 push 触发部署。Vercel 自动识别 Vite 项目，构建命令 \`vite build\`、产物目录 \`dist\`。

### Netlify

\`netlify.toml\`：

\`\`\`toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
\`\`\`

SPA 路由必须配置 fallback 到 \`index.html\`，否则刷新非根路径会 404。

---

## Dockerfile 编写

\`\`\`dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# nginx 托管静态文件
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

### 多阶段构建

上面用了**多阶段构建**：
1. 第一阶段 \`builder\`：装依赖、构建，产出 \`dist/\`
2. 第二阶段：只把 \`dist/\` 拷进 nginx 镜像

好处：最终镜像不含 \`node_modules\` / 源码，体积从 1GB 降到 30MB。

### .dockerignore

\`\`\`
node_modules
dist
.git
*.md
\`\`\`

避免把本地 \`node_modules\` 拷进镜像（应该用 \`npm ci\` 在镜像内重装）。

---

## nginx 配置

\`\`\`conf
# nginx.conf
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  # SPA 路由 fallback
  location / {
    try_files $uri $uri/ /index.html;
  }

  # 静态资源长缓存（hash 文件名）
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # index.html 不缓存
  location = /index.html {
    add_header Cache-Control "no-cache";
  }

  # gzip 压缩
  gzip on;
  gzip_types text/css application/javascript application/json;
}
\`\`\`

---

## 构建产物部署

### 静态托管（最简单）

\`npm run build\` 后把 \`dist/\` 上传到任意静态服务器：
- nginx / Apache
- 对象存储（OSS / S3 / COS）
- CDN

### 容器化部署

\`\`\`bash
docker build -t my-app .
docker run -d -p 80:80 my-app
\`\`\`

推到镜像仓库：

\`\`\`bash
docker tag my-app registry.example.com/my-app:v1
docker push registry.example.com/my-app:v1
\`\`\`

---

## 完整自动化流程

\`\`\`
开发者 push 代码
      │
      ▼
GitHub Actions 触发
      │
      ├─ install (npm ci)
      ├─ lint
      ├─ type-check
      ├─ test
      └─ build
            │
            ▼
      构建产物 / Docker 镜像
            │
            ├─ 推到镜像仓库
            └─ 部署到服务器 / K8s
                  │
                  ▼
            用户访问新版本
\`\`\`

---

## 下一章

部署会了，下一章进入 **SSR/SSG 部分**——先学 SSR 基础与 Vite SSR API。`,
    code: `// 演示：模拟 CI/CD 流水线
console.log("🚢 Vite 项目 CI/CD 流水线模拟");
console.log("=====================================");

// 模拟 CI 各阶段
const stages = [
  { name: "checkout",      duration: "2s",  status: "success" },
  { name: "install (npm ci)", duration: "3s",  status: "success", note: "lockfile 严格安装" },
  { name: "lint",          duration: "5s",  status: "success" },
  { name: "type-check",    duration: "8s",  status: "success" },
  { name: "test:run",      duration: "12s", status: "success", note: "Vitest 非交互模式" },
  { name: "build",         duration: "23s", status: "success", note: "vite build → dist/" },
  { name: "docker build",  duration: "45s", status: "success", note: "多阶段构建" },
  { name: "deploy",        duration: "10s", status: "success", note: "推镜像 + 滚动更新" }
];

let totalTime = 0;
console.log("\\n📋 流水线阶段：");
stages.forEach((s, i) => {
  const icon = s.status === "success" ? "✓" : "✗";
  const note = s.note ? "  ← " + s.note : "";
  console.log(\`  \${i + 1}. \${icon} \${s.name.padEnd(20)} \${s.duration.padStart(5)}\${note}\`);
  totalTime += parseInt(s.duration);
});

console.log(\`\\n⏱️  总耗时: \${totalTime}s\`);
console.log("✅ CI 通过，部署到生产");

// 模拟多阶段 Docker 构建
console.log("\\n🐳 Docker 多阶段构建产物：");
const dockerStages = [
  { stage: "builder",  size: "1.2GB", contents: "node_modules + 源码 + dist" },
  { stage: "runtime",  size: "32MB",  contents: "nginx + dist + nginx.conf" }
];
dockerStages.forEach(s => {
  console.log(\`  \${s.stage.padEnd(10)} \${s.size.padStart(7)}  \${s.contents}\`);
});

console.log("\\n💡 关键优化：");
console.log("  1. actions/setup-node cache: 'npm' 加速装依赖");
console.log("  2. 多阶段构建去掉 node_modules，镜像从 1.2GB → 32MB");
console.log("  3. 静态资源 hash 文件名 + nginx 长缓存");`,
  },

  // =========================================================
  // 第五十三章：SSR 基础与原理
  // =========================================================
  {
    id: "vite2-ch53",
    group: "第十一部分 SSR/SSG",
    icon: "🌀",
    title: "第五十三章 SSR 基础与原理",
    content: `## SSR vs CSR vs SSG

| 模式 | 全称 | 渲染时机 | 首屏速度 | SEO | 服务器压力 |
|------|------|----------|----------|-----|------------|
| **CSR** | Client-Side Rendering | 浏览器执行 JS 后渲染 | 慢（白屏一段时间）| 差 | 低（只发静态文件）|
| **SSR** | Server-Side Rendering | 服务器把 HTML 渲染好再返回 | 快 | 好 | 高（每次请求都渲染）|
| **SSG** | Static Site Generation | 构建时生成 HTML | 最快 | 好 | 低（纯静态）|

### 何时用哪种

- **CSR**：后台管理系统、需要登录的应用，对 SEO 不敏感
- **SSR**：电商、新闻、内容站，对 SEO 和首屏有要求
- **SSG**：博客、文档、营销页，内容更新不频繁

---

## Vite SSR API

Vite 内置 SSR 支持，提供三个核心 API：

### 1. createServer：创建 Vite 服务器

\`\`\`js
import { createServer } from 'vite'

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom'   // 不用 Vite 自带的 HTML 中间件
})
\`\`\`

### 2. ssrLoadModule：在服务端加载模块

\`\`\`js
// 加载 src/entry-server.tsx，得到 render 函数
const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')
const html = render(url)
\`\`\`

Vite 会自动处理模块图、HMR、依赖预构建，比手动用 esbuild 优雅得多。

### 3. transformIndexHtml：处理 index.html

\`\`\`js
const template = fs.readFileSync('index.html', 'utf-8')
const html = await vite.transformIndexHtml(url, template)
// 把渲染好的内容注入到 <div id="app"></div>
\`\`\`

---

## 最小 SSR 示例

### server.js（开发模式）

\`\`\`js
import fs from 'fs'
import express from 'express'
import { createServer } from 'vite'

const app = express()
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' })

app.use(vite.middlewares)   // 用 Vite 处理静态资源 + HMR

app.use('*', async (req, res) => {
  const url = req.originalUrl
  const template = await vite.transformIndexHtml(url, fs.readFileSync('index.html', 'utf-8'))
  const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')
  const appHtml = render(url)   // React/Vue 渲染出 HTML 字符串
  const html = template.replace('<!--app-html-->', appHtml)
  res.status(200).set('Content-Type', 'text/html').end(html)
})

app.listen(3000)
\`\`\`

### entry-server.tsx

\`\`\`tsx
import React from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

export function render(url) {
  return renderToString(<App />)
}
\`\`\`

\`renderToString\` 把 React 组件渲染成 HTML 字符串，注入到模板里返回给浏览器。

---

## 生产模式（不再用 Vite Dev Server）

生产环境用 \`vite build\` 打包两份产物：

\`\`\`js
// vite.config.ts
export default defineConfig({
  build: {
    outDir: 'dist/client',  // 客户端产物
    ssr: 'src/entry-server.tsx'  // 服务端入口
  }
})
\`\`\`

\`\`\`bash
vite build              # 客户端产物 → dist/client
vite build --ssr        # 服务端产物 → dist/server
\`\`\`

生产服务器直接 \`import\` 编译好的服务端 bundle，不再需要 Vite。

---

## vite-plugin-ssr 与 Vike

手写 SSR 太繁琐（要处理路由、数据预取、hydration），于是有了 \`vite-plugin-ssr\`（现已改名 **Vike**）封装这一切。下一章详细讲。

也可以直接用框架自带的 SSR：
- **Next.js**（React）
- **Nuxt**（Vue）
- **SvelteKit**（Svelte）

它们底层都是 Vite + SSR API。

---

## SSR 中的路由

CSR 用 \`react-router\` / \`vue-router\` 在浏览器里切换。SSR 时服务器也要知道当前 URL 对应哪个组件，否则渲染出来的 HTML 和客户端不一致，hydration 会失败。

\`\`\`tsx
// 简化版 SSR 路由
import { StaticRouter } from 'react-router-dom/server'

export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  )
}
\`\`\`

---

## SSR 中的数据预取

SSR 的一大优势：**服务器可以预先获取数据，渲染好带数据的 HTML**。用户看到的页面立刻就有内容，不用等 JS 加载 + 请求接口。

\`\`\`tsx
// 简化版：组件里声明数据需求
App.fetchData = async (url) => {
  const data = await fetch('https://api.example.com/data').then(r => r.json())
  return { data }
}

// server.js
const data = await App.fetchData(url)
const appHtml = render(url, data)   // 带数据渲染
const html = template
  .replace('<!--app-html-->', appHtml)
  .replace('<!--app-state-->', JSON.stringify(data))  // 数据顺手传给客户端
\`\`\`

---

## hydration（注水）

服务器返回的 HTML 是**纯 HTML**，没有事件绑定。浏览器加载 JS 后，React/Vue 把组件重新渲染一遍，**和已有 HTML 关联起来**，这个过程叫 \`hydration\`。

\`\`\`tsx
// entry-client.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const data = JSON.parse(document.getElementById('app-state').textContent)

ReactDOM.hydrateRoot(
  document.getElementById('app'),
  <App initialData={data} />
)
\`\`\`

注意是 \`hydrateRoot\` 不是 \`createRoot\`，它会复用已有 DOM 而不是重新创建。

---

## 下一章

SSR 原理清楚了，下一章学习 **Vike 与 Astro**——把 SSR 封装好的上层方案。`,
    code: `// 演示：SSR 流程模拟
console.log("🌀 SSR 渲染流程模拟");
console.log("=====================================");

// 模拟 React 组件
function App({ url, data }) {
  return \\\`<div class="app">
  <h1>欢迎</h1>
  <p>当前路径: \${url}</p>
  <p>数据: \${JSON.stringify(data)}</p>
</div>\\\`;
}

// 模拟 renderToString
function renderToString(component) {
  return component;
}

// 模拟 SSR 服务器
async function ssrHandler(url) {
  console.log("\\n📥 收到请求:", url);

  // 1. 数据预取
  console.log("  → 数据预取 fetch('https://api.example.com/data')");
  const data = await new Promise(resolve => {
    setTimeout(() => resolve({ user: "Tom", items: [1, 2, 3] }), 100);
  });
  console.log("  ← 获取到数据:", JSON.stringify(data));

  // 2. 渲染组件
  console.log("  → renderToString(<App />)");
  const appHtml = renderToString(App({ url, data }));
  console.log("  ← 渲染出 HTML（", appHtml.length, "字符）");

  // 3. 注入到模板
  const template = \`<!DOCTYPE html>
<html><body>
  <div id="app"><!--app-html--></div>
  <script>window.__INITIAL_STATE__ = <!--app-state--></script>
  <script type="module" src="/entry-client.js"></script>
</body></html>\`;

  const html = template
    .replace("<!--app-html-->", appHtml)
    .replace("<!--app-state-->", JSON.stringify(data));

  return html;
}

// 运行示例
ssrHandler("/users").then(html => {
  console.log("\\n📤 返回给浏览器的 HTML（带数据 + state）：");
  console.log(html);

  console.log("\\n💧 浏览器收到 HTML 后：");
  console.log("  1. 立即显示带内容的页面（首屏快、SEO 好）");
  console.log("  2. 加载 entry-client.js");
  console.log("  3. hydrateRoot 把 React 事件绑定到已有 DOM");
  console.log("  4. 之后切换路由走 CSR，体验丝滑");
});`,
  },

  // =========================================================
  // 第五十四章：Vike 与 Astro
  // =========================================================
  {
    id: "vite2-ch54",
    group: "第十一部分 SSR/SSG",
    icon: "🌌",
    title: "第五十四章 Vike 与 Astro",
    content: `## Vike 是什么

**Vike**（原名 \`vite-plugin-ssr\`）是一个**基于 Vite 的 SSR/SSG 框架**，把路由、数据预取、hydration 这些繁琐的事封装好，让你专注写业务。

> 一句话：**不想用 Next.js/Nuxt 这些"全家桶"，又想要 SSR 能力，就用 Vike**。

特点：
- 完全基于 Vite，配置和工具链一致
- 不绑定框架（React/Vue/Svelte 都支持）
- 文件路由 + 灵活配置
- SSR / SSG / SPA 三种模式可切换

---

## Vike 安装与使用

\`\`\`bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install vike
\`\`\`

\`\`\`ts
// vite.config.ts
import vike from 'vike/plugin'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [vike(), react()]
})
\`\`\`

\`\`\`ts
// server.js（开发入口）
import { createServer } from 'vite'
import vike from 'vike/plugin'

const vite = await createServer({
  server: { middlewareMode: true },
  plugins: [vike()]
})

// Vike 自带 SSR 中间件，不用手写
\`\`\`

---

## Vike 文件路由

\`\`\`
pages/
├── index              # → /
├── about              # → /about
├── users/
│   ├── index          # → /users
│   ├── @id            # → /users/:id（动态路由）
│   └── new            # → /users/new
└── *.page.tsx         # .page.tsx 后缀表示这是页面
\`\`\`

### 页面文件结构

\`\`\`tsx
// pages/index.page.tsx
export default Render

function Render() {
  return <div>首页</div>
}

// 数据预取（SSR 时执行）
export async function onBeforeRender() {
  const data = await fetch('https://api.example.com/data').then(r => r.json())
  return { PageProps: { data } }
}
\`\`\`

---

## SSR / SSG / SPA 模式切换

Vike 通过配置切换渲染模式：

### SSR（默认）

\`\`\`ts
// pages/index.page.tsx
export const server = true   // SSR
\`\`\`

### SSG（构建时静态化）

\`\`\`ts
// pages/index.page.tsx
export const prerender = true   // 构建时生成静态 HTML
\`\`\`

### SPA（纯客户端渲染）

\`\`\`ts
// pages/index.page.tsx
export const client = 'only'    // 不做 SSR
\`\`\`

可以**逐页配置**，比如首页 SSG、用户页 SSR、后台 SPA，一个项目混用三种模式。

---

## Astro 简介

**Astro** 是另一个流行的现代框架，主打**内容站点**（博客、文档、营销页）。核心理念：

> **默认零 JS，按需"水合"组件。**

\`\`\`bash
npm create astro@latest
\`\`\`

### .astro 文件

\`\`\`astro
---
// 组件脚本（构建时执行，类似 SSG）
const posts = await fetch('https://api.example.com/posts').then(r => r.json())
---

<html>
<body>
  <h1>博客</h1>
  <ul>
    {posts.map(p => <li>{p.title}</li>)}
  </ul>
</body>
</html>
\`\`\`

\`---\` 之间的代码**只构建时跑**，不会进客户端 bundle，所以页面默认零 JS。

---

## Islands 架构

Astro 的杀手锏：**Islands（岛屿）架构**。

页面大部分是静态 HTML（海洋），只有少数交互组件（岛屿）会加载 JS：

\`\`\`astro
---
import Counter from '../components/Counter.vue'
---

<!-- 静态部分：无 JS -->
<h1>首页</h1>
<p>这是静态内容，不会加载 JS。</p>

<!-- 交互岛屿：只有这个组件加载 JS -->
<Counter client:load />

<!-- 仅在可见时加载 -->
<Counter client:visible />

<!-- 仅在空闲时加载 -->
<Counter client:idle />
\`\`\`

| 指令 | 加载时机 |
|------|----------|
| \`client:load\` | 立即加载 |
| \`client:idle\` | 浏览器空闲时加载 |
| \`client:visible\` | 滚动到可见时加载 |
| \`client:media="(max-width: 768px)"\` | 匹配媒体查询时加载 |

结果：博客页面可能只有 10KB JS（仅评论区那个组件），而传统 SPA 整个应用 bundle 都得加载。

---

## Content Collections

Astro 内置 **Content Collections**，把 markdown / mdx / json 等内容文件做类型化管理：

\`\`\`
src/
└── content/
    └── blog/
        ├── post-1.md
        └── post-2.md
\`\`\`

\`\`\`ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string())
  })
})

export const collections = { blog }
\`\`\`

\`\`\`astro
---
import { getCollection } from 'astro:content'
const posts = await getCollection('blog')
---
\`\`\`

用 Zod 校验 frontmatter 类型，写错字段名构建时就报错，比手动 \`fs.readFile\` 强多了。

---

## Astro 与 Vite 的关系

**Astro 底层就是 Vite**。Astro 把自己写成一个 Vite 插件 + 一套约定（文件路由、Islands、Content Collections），底层构建、HMR、依赖预构建都用 Vite。

所以你在 Astro 项目里能用任何 Vite 插件、任何 Vite 配置、任何 npm 包，没有学习成本。

| 框架 | 定位 | 渲染模式 |
|------|------|----------|
| **Vite** | 构建工具 | 工具链 |
| **Vike** | Vite 上的 SSR 框架 | SSR / SSG / SPA |
| **Astro** | 内容站点框架 | 默认 SSG + Islands |
| **Next.js / Nuxt** | 全功能框架 | SSR / SSG / SPA / RSC |

---

## 选型建议

- **博客 / 文档 / 营销页**：Astro（Islands 架构、零 JS 默认）
- **想自己掌控 SSR，又不绑定框架**：Vike
- **要 React Server Components、API 路由**：Next.js
- **要 Vue 生态**：Nuxt

---

## 下一章

SSR/SSG 部分结束，下一章进入**第十二部分 高级特性**——从 Vite 的 Environment API 开始。`,
    code: `// 演示：Vike / Astro 渲染模式对比
console.log("🌌 Vike 与 Astro 渲染模式对比");
console.log("=====================================");

// 模拟 Vike 三种模式
const vikeModes = [
  {
    mode: "SSR",
    config: "server: true",
    when: "每次请求",
    seo: "好",
    speed: "快",
    useCase: "电商、新闻、动态内容"
  },
  {
    mode: "SSG",
    config: "prerender: true",
    when: "构建时",
    seo: "好",
    speed: "最快",
    useCase: "博客、文档、营销页"
  },
  {
    mode: "SPA",
    config: "client: 'only'",
    when: "浏览器",
    seo: "差",
    speed: "首屏慢",
    useCase: "后台管理系统"
  }
];

console.log("\\n📘 Vike 三种渲染模式（可逐页配置）：");
console.log("-".repeat(70));
console.log("模式    配置                    渲染时机    SEO  速度    适用场景");
vikeModes.forEach(m => {
  console.log(\`\${m.mode.padEnd(7)} \${m.config.padEnd(22)} \${m.when.padEnd(10)} \${m.seo.padEnd(4)} \${m.speed.padEnd(7)} \${m.useCase}\`);
});

// 模拟 Astro Islands
console.log("\\n🏝️  Astro Islands 架构（按需水合）：");
const islands = [
  { directive: "client:load",    when: "立即加载",        js: "1.2KB" },
  { directive: "client:idle",    when: "浏览器空闲时",    js: "1.2KB" },
  { directive: "client:visible", when: "滚动可见时",      js: "1.2KB" },
  { directive: "(无)",            when: "静态 HTML",       js: "0KB" }
];
console.log("-".repeat(50));
console.log("指令               加载时机              JS 大小");
islands.forEach(i => {
  console.log(\`\${i.directive.padEnd(18)} \${i.when.padEnd(20)} \${i.js}\`);
});

// 模拟页面 JS 体积对比
console.log("\\n📦 首页 JS 体积对比：");
const pageSizes = [
  { framework: "传统 SPA（React）", js: "150KB", reason: "整个应用 bundle" },
  { framework: "Astro（Islands）",   js: "10KB",  reason: "只有评论区水合" },
  { framework: "Astro（纯静态）",    js: "0KB",   reason: "无交互组件" }
];
pageSizes.forEach(p => {
  console.log(\`  \${p.framework.padEnd(25)} \${p.js.padStart(6)}  ← \${p.reason}\`);
});

console.log("\\n💡 Astro 底层就是 Vite，能用任何 Vite 插件");
console.log("💡 Vike（原 vite-plugin-ssr）适合自己掌控 SSR");`,
  },
];
