// =============================================================
// React 中使用 TypeScript 从入门到精通大全 —— 第十六批章节（最后一批）
// -------------------------------------------------------------
// 覆盖：第十二部分 工程化（末尾 5 章） + 第十三部分 进阶主题（4 章） + 结尾
// 包含 10 个章节：ch74 ~ ch82 + tsx3-epilogue
//
// 风格定位：
//   - 每章都从"为什么需要"切入，再讲"怎么用"
//   - 每段代码都配套逐行注释，注释里讲透"为什么这样写"
//   - 工程化章节贴近真实团队协作场景，进阶章节贴近前沿实践
//   - 语言简洁、直击要点，避免堆砌
//
// 运行环境：
//   - TypeScript 5.x（strict、esModuleInterop 等默认开启）
//   - React 18（沙箱注入 react / react-dom）
//   - 沙箱使用 ts.transpileModule，target=ES2020, module=CommonJS, jsx=ReactJSX
// =============================================================

const chapters = [
  // ============================================================
  // ch74: Vite + TS 配置
  // ============================================================
  {
    id: "tsx3-ch74",
    group: "第十二部分 工程化",
    icon: "⚡",
    title: "ch74 Vite + TS 配置",
    content: `# ch74 Vite + TS 配置

## 为什么讲 Vite 配置

Vite 已经是 React + TS 项目的事实标准脚手架——启动快、HMR 秒级、配置量小。但"开箱即用"不等于"不用配"。中大型项目里你迟早要面对这些问题：路径别名怎么配、环境变量怎么获得类型、生产构建怎么分包、开发代理怎么转发后端接口。这一章把 Vite + TS 的核心配置讲透，让你能独立搭一个生产级工程。

## 1. 最小 vite.config.ts

\`\`\`ts
// vite.config.ts
// 导入 defineConfig：它给配置对象提供 TS 类型提示，避免写错字段名
import { defineConfig } from "vite";
// 导入 React 插件：让 Vite 能解析 JSX、Fast Refresh
import react from "@vitejs/plugin-react";

// defineConfig 包一层后，IDE 会有完整的字段补全
export default defineConfig({
  plugins: [react()], // 启用 React 插件，含 Fast Refresh
  server: {
    port: 5173,        // 开发服务器端口
    open: true,        // 启动时自动打开浏览器
  },
});
\`\`\`

\`defineConfig\` 不是必须的，但**强烈建议用**——它给配置对象套上 TS 类型，写错字段名会立刻报红。

## 2. 路径别名 alias

JS 项目里写 \`import Button from "../../../components/Button"\` 让人崩溃。配 alias 后可以写 \`@/components/Button\`。

\`\`\`ts
// vite.config.ts
import { defineConfig } from "vite";
import path from "node:path"; // Node 内置 path 模块，处理路径拼接

export default defineConfig({
  resolve: {
    alias: {
      // 把 @ 指向 src 目录，import 路径从相对变绝对
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
\`\`\`

**坑**：Vite 的 alias 只解决运行时，TS 编译器不认识 \`@\`。必须在 \`tsconfig.json\` 里同步配置：

\`\`\`json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",                       // 基准路径
    "paths": {
      "@/*": ["src/*"]                    // 把 @/* 映射到 src/*
    }
  }
}
\`\`\`

两边都配好，IDE 跳转和编译器才能同时识别 \`@\`。

## 3. 环境变量与类型

Vite 把 \`.env\` 文件里的变量注入 \`import.meta.env\`，但默认全是 \`string | undefined\`，没有自定义键的类型。需要扩展类型：

\`\`\`bash
# .env 文件
VITE_API_BASE=https://api.example.com
VITE_ENABLE_MOCK=true
\`\`\`

\`\`\`ts
// src/vite-env.d.ts
/// <reference types="vite/client" />

// 用 interface 合并 ImportMetaEnv，给自定义变量加类型
interface ImportMetaEnv {
  readonly VITE_API_BASE: string;        // 接口基址
  readonly VITE_ENABLE_MOCK: boolean;    // 是否启用 mock（注意是 string，需断言）
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
\`\`\`

\`\`\`ts
// 业务代码里就能拿到类型提示
const apiBase = import.meta.env.VITE_API_BASE;    // 类型：string
// 注意：.env 里的值都是字符串，"true" 不会自动变 boolean
const enableMock = import.meta.env.VITE_ENABLE_MOCK === "true";
\`\`\`

## 4. 开发代理：转发后端接口

前端跑在 5173，后端跑在 8080，浏览器会拦跨域请求。配 \`server.proxy\` 让 Vite 帮你转发：

\`\`\`ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      // 所有 /api 开头的请求都转发到后端
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,               // 改 Host 头，避免后端校验失败
        rewrite: (p) => p.replace(/^\\/api/, ""), // 把 /api 去掉再转发
      },
    },
  },
});
\`\`\`

配完后 \`fetch("/api/users")\` 实际请求的是 \`http://localhost:8080/users\`，浏览器看到的是同源，无跨域。

## 5. 构建优化：分包与产物分析

默认 Vite 把所有依赖打进一个 chunk，大项目里这会让首屏慢。配 \`build.rollupOptions\` 手动分包：

\`\`\`ts
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // manualChunks 把指定模块单独打包
        manualChunks: {
          // react 全家桶单独打，hash 稳定，缓存命中率高
          "react-vendor": ["react", "react-dom"],
          // 路由单独打
          "router-vendor": ["react-router-dom"],
          // 大型第三方库单独打
          "chart-vendor": ["echarts", "echarts-for-react"],
        },
      },
    },
    // 关闭 sourcemap 减小产物体积（生产环境按需开启）
    sourcemap: false,
    // 警告产物超过 500KB 的 chunk
    chunkSizeWarningLimit: 500,
  },
});
\`\`\`

要看产物到底多大，装 \`rollup-plugin-visualizer\`：

\`\`\`ts
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,                       // 构建后自动打开可视化报告
      filename: "dist/stats.html",      // 报告输出位置
    }),
  ],
});
\`\`\`

跑完 \`npm run build\` 会弹出一张饼图，每个 chunk 多大一目了然。

## 6. React 组件 demo：用 alias + env 的真实组件

\`\`\`tsx
// src/components/ApiButton.tsx
// 演示 alias 和 env 在组件里的用法
import { useState } from "react";
// 用 @ 别名导入，而不是 ../../../
import { Loading } from "@/components/Loading";

interface ApiButtonProps {
  // 业务接口路径，比如 "/users"
  path: string;
  label: string;
}

export function ApiButton({ path, label }: ApiButtonProps) {
  const [loading, setLoading] = useState(false);
  // 用环境变量拼完整 URL，类型是 string，不是 any
  const url = \`\${import.meta.env.VITE_API_BASE}\${path}\`;

  const handleClick = async () => {
    setLoading(true);
    try {
      // 真实请求后端接口
      const res = await fetch(url);
      const data = await res.json();
      console.log("响应数据：", data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? <Loading /> : label}
    </button>
  );
}
\`\`\`

## 小结

- \`defineConfig\` 给配置对象类型提示，强烈建议用。
- alias 在 Vite 和 tsconfig 两边都要配，缺一不可。
- 自定义环境变量要扩展 \`ImportMetaEnv\` 接口才能获得类型。
- \`server.proxy\` 解决开发期跨域，\`build.rollupOptions\` 控制分包。
- 用 \`rollup-plugin-visualizer\` 看产物体积分布。

## 避坑清单

- ❌ 只在 Vite 配 alias，没在 tsconfig 配（IDE 报错找不到模块）
- ❌ 把敏感密钥写进 \`VITE_\` 开头的变量（会被打进产物，泄漏给前端）
- ❌ 把所有依赖打成一个 chunk（首屏慢，缓存命中率低）
- ❌ 不区分 \`.env\` / \`.env.development\` / \`.env.production\`（环境串味）

下一章我们讲 ESLint + Prettier，把代码风格统一到团队级别。`
  },

  // ============================================================
  // ch75: ESLint + Prettier
  // ============================================================
  {
    id: "tsx3-ch75",
    group: "第十二部分 工程化",
    icon: "🧹",
    title: "ch75 ESLint + Prettier",
    content: `# ch75 ESLint + Prettier

## 为什么讲这个

一个人写代码风格再好也扛不住团队五个人五种风格——有人用单引号、有人用双引号；有人加分号、有人不加分号；有人 \`any\` 满天飞、有人严格类型。代码审查里 80% 的争论都跟风格有关。ESLint + Prettier + husky 这套组合能把风格问题在提交前自动修掉，让代码审查只讨论业务逻辑。

## 1. ESLint 9 的 flat config

ESLint 9 默认启用 flat config（\`eslint.config.js\`），老的 \`.eslintrc.json\` 已经废弃。新项目的配置文件长这样：

\`\`\`js
// eslint.config.js
// flat config：导出一个数组，每个元素是一组规则
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  // 第一组：JS 推荐规则
  js.configs.recommended,
  // 第二组：TS 推荐规则（带类型信息的严格版）
  ...tseslint.configs.strictTypeChecked,
  // 第三组：项目配置
  {
    languageOptions: {
      parserOptions: {
        projectService: true,            // 让 TS ESLint 用项目里的 tsconfig
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // React Hooks 规则：必须按顺序调用、依赖数组要全
      ...reactHooks.configs.recommended.rules,
      // HMR 时只允许 export 组件，不允许 export 常量
      "react-refresh/only-export-components": "warn",
      // 业务里禁用 any，强制写类型
      "@typescript-eslint/no-explicit-any": "error",
    },
  }
);
\`\`\`

flat config 比 \`.eslintrc\` 清晰——所有规则在一个文件里、按顺序生效、不再有 \`extends\` 链。

## 2. typescript-eslint 的关键规则

\`\`\`js
// eslint.config.js 片段
rules: {
  // 禁用 any，逼迫你写真实类型
  "@typescript-eslint/no-explicit-any": "error",
  // 未使用变量报错（默认是警告）
  "@typescript-eslint/no-unused-vars": [
    "error",
    {
      argsIgnorePattern: "^_",          // 参数名以 _ 开头的不报错
      varsIgnorePattern: "^_",
    },
  ],
  // 必须用类型导入：import type { User } from "./types"
  "@typescript-eslint/consistent-type-imports": "error",
  // Promise 必须 await 或 return，不能丢
  "@typescript-eslint/no-floating-promises": "error",
  // 禁止非空断言 !，强制用类型守卫
  "@typescript-eslint/no-non-null-assertion": "warn",
}
\`\`\`

\`consistent-type-imports\` 这条特别有用——它强制类型导入和值导入分离，配合 \`verbatimModuleSyntax\` 让编译产物更干净。

## 3. Prettier 集成

Prettier 只管格式化（空格、换行、引号），不管逻辑。和 ESLint 配合要装 \`eslint-config-prettier\` 关掉 ESLint 里跟格式相关的规则：

\`\`\`json
// .prettierrc.json
{
  "semi": true,                 // 末尾分号
  "singleQuote": true,          // 单引号
  "trailingComma": "all",       // 多行末尾加逗号
  "printWidth": 80,             // 单行最长 80 字符
  "tabWidth": 2,                // 缩进 2 空格
  "arrowParens": "always"       // 箭头函数参数必加括号：(x) => x
}
\`\`\`

\`\`\`js
// eslint.config.js
import prettier from "eslint-config-prettier";

export default tseslint.config(
  // ...其他配置
  // 最后一定要放 prettier，关掉所有冲突规则
  prettier
);
\`\`\`

**关键**：prettier 配置必须放在数组最后，否则会被后面的规则覆盖。

## 4. husky + lint-staged：提交前自动修

光配 ESLint 不够，得保证每次 commit 都跑一遍。用 husky 注册 git hook，用 lint-staged 只检查暂存区文件：

\`\`\`bash
# 安装
pnpm add -D husky lint-staged

# 初始化 husky
npx husky init
# 这会在 .husky/ 下生成 pre-commit 文件
\`\`\`

\`\`\`bash
# .husky/pre-commit
pnpm exec lint-staged
\`\`\`

\`\`\`json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",          // 自动修复 lint 问题
      "prettier --write"       // 自动格式化
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
\`\`\`

配好后，你 \`git commit\` 时会自动跑 eslint --fix 和 prettier --write，有错就拦下来。

## 5. commitlint：规范 commit message

团队 commit message 五花八门（"fix bug"、"update"、"aaa"）会让 changelog 没法生成。用 commitlint 强制走 Angular 规范：

\`\`\`bash
pnpm add -D @commitlint/cli @commitlint/config-conventional
\`\`\`

\`\`\`js
// commitlint.config.js
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // type 必须是这几个之一
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "test", "chore", "perf"],
    ],
    // header 最长 72 字符
    "header-max-length": [2, "always", 72],
  },
};
\`\`\`

\`\`\`bash
# .husky/commit-msg
pnpm exec commitlint --edit $1
\`\`\`

现在你写 \`git commit -m "update"\` 会被拦下，必须写 \`fix: 修复登录跳转问题\` 才能提交。

## 6. React 组件 demo：ESLint 修复前后对比

\`\`\`tsx
// ❌ 修复前：ESLint 会报一堆错
import React, { useState } from "react";

// any 满天飞，类型形同虚设
function UserCard(props: any) {
  const [data, setData] = useState<any>(null);

  // Promise 没 await，可能有未捕获错误
  const load = () => {
    fetch("/api/users/" + props.id)
      .then(res => res.json())
      .then(d => setData(d));
  };

  // 没用的变量
  const unused = "no one uses me";

  return <div onClick={load}>{data?.name}</div>;
}
\`\`\`

\`\`\`tsx
// ✅ 修复后：类型完整、Promise 有 await、无用变量删掉
import { useState } from "react";             // 删掉没用的 React 默认导入
import type { User } from "@/types";          // 用 import type 导类型

interface UserCardProps {
  id: string;
}

export function UserCard({ id }: UserCardProps) {
  // 显式标注状态类型，避免 null 误用
  const [data, setData] = useState<User | null>(null);

  // async 函数自动返回 Promise，规则不再报警
  const load = async () => {
    const res = await fetch(\`/api/users/\${id}\`); // 模板字符串更清晰
    const d: User = await res.json();
    setData(d);
  };

  return (
    <div onClick={load} role="button" tabIndex={0}>
      {data?.name ?? "加载中"}
    </div>
  );
}
\`\`\`

## 小结

- ESLint 9 默认 flat config（\`eslint.config.js\`），抛弃 \`.eslintrc\`。
- \`typescript-eslint\` 的 \`strictTypeChecked\` 是严格模式推荐起点。
- Prettier 只管格式，要放配置数组最后避免冲突。
- husky + lint-staged 把检查推到 commit 前，避免污染远端。
- commitlint 让 commit message 规范化，方便后续生成 changelog。

## 避坑清单

- ❌ 用 ESLint 8 老的 \`.eslintrc.json\`（应该迁到 flat config）
- ❌ ESLint 和 Prettier 配置冲突（应该用 \`eslint-config-prettier\` 关掉冲突项）
- ❌ husky 配好后没在 \`.husky/pre-commit\` 里调 lint-staged
- ❌ commitlint 规则太严（团队受不了会绕过，建议先 warn 再 error）

下一章我们讲 CI/CD，把这套检查推到云端自动化。`
  },

  // ============================================================
  // ch76: CI/CD 与 GitHub Actions
  // ============================================================
  {
    id: "tsx3-ch76",
    group: "第十二部分 工程化",
    icon: "🔄",
    title: "ch76 CI/CD 与 GitHub Actions",
    content: `# ch76 CI/CD 与 GitHub Actions

## 为什么讲这个

本地配好 husky 不代表团队所有人都跑——有人会 \`--no-verify\` 跳过、有人忘了装依赖。**真正能拦住问题的最后一道防线是 CI**：代码推到 GitHub 后，云端机器自动跑 lint / test / build，任何一项失败都不让合并。这一章讲怎么用 GitHub Actions 搭一套 React + TS 项目的 CI/CD。

## 1. 最小 workflow 文件

GitHub Actions 的配置放在 \`.github/workflows/\` 目录下，\`.yml\` 文件：

\`\`\`yaml
# .github/workflows/ci.yml
name: CI                            # 工作流名字，GitHub UI 上显示

# 触发条件：推到 main 分支或开 PR 时跑
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest          # 用 Ubuntu 最新版跑（免费额度内）
    steps:
      # 第 1 步：拉代码
      - uses: actions/checkout@v4
      # 第 2 步：装 Node 20
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      # 第 3 步：装依赖
      - run: pnpm install --frozen-lockfile
      # 第 4 步：跑 lint
      - run: pnpm lint
      # 第 5 步：跑类型检查
      - run: pnpm exec tsc --noEmit
      # 第 6 步：跑测试
      - run: pnpm test
      # 第 7 步：跑构建
      - run: pnpm build
\`\`\`

这个最小配置已经能拦住 80% 的问题：类型错误、lint 失败、测试失败、构建失败。

## 2. 缓存 node_modules 加速

每次 CI 都重新装依赖慢得要命。用 \`setup-node\` 自带的缓存：

\`\`\`yaml
# .github/workflows/ci.yml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: "pnpm"                   # 自动缓存 pnpm 全局存储
\`\`\`

第一次跑可能 3 分钟，第二次开始 1 分钟以内。**这一行配置能省 50% 时间**。

如果用 npm，写 \`cache: "npm"\`；用 yarn 写 \`cache: "yarn"\`。

## 3. 并行跑多个 job

把 lint、test、build 拆成并行 job，能进一步压时间：

\`\`\`yaml
# .github/workflows/ci.yml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build

  # 一个汇总 job：上面三个都过了才能合并
  check:
    needs: [lint, test, build]      # 等三个并行 job 都完成
    runs-on: ubuntu-latest
    steps:
      - run: echo "All checks passed"
\`\`\`

在 GitHub PR 页面会显示三个绿色勾，比串行跑快很多。

## 4. 用 reusable workflow 复用

每个项目都写一遍"装 Node + 装依赖"太啰嗦。抽成一个可复用的 workflow：

\`\`\`yaml
# .github/workflows/setup.yml
on:
  workflow_call: {}                  // 声明可被其他 workflow 调用

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
\`\`\`

主 workflow 里调：

\`\`\`yaml
jobs:
  lint:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: ./.github/workflows/setup.yml
      - run: pnpm lint
\`\`\`

## 5. 部署阶段：Vercel 自动部署

Vercel 部署最简单——绑 GitHub 仓库后，推 main 自动部署。但如果你想在 CI 里手动触发 Vercel 部署（比如想跑完测试再发）：

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    # 只有 CI 全过了才部署
    needs: [lint, test, build]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      # 用 Vercel 官方 action 部署
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}    # 在 GitHub Secrets 里配
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"                         # 部署到生产环境
\`\`\`

## 6. React 组件 demo：CI 状态徽章组件

\`\`\`tsx
// src/components/CIBadge.tsx
// 演示在页面里展示 GitHub Actions 状态
interface CIBadgeProps {
  owner: string;       // GitHub 仓库 owner
  repo: string;        // 仓库名
  branch?: string;     // 分支名，默认 main
}

export function CIBadge({ owner, repo, branch = "main" }: CIBadgeProps) {
  // 用 GitHub 的 status 徽章图：直接拼 URL 拿到 SVG
  const imgUrl = \`https://github.com/\${owner}/\${repo}/actions/workflows/ci.yml/badge.svg?branch=\${branch}\`;
  // 点击跳转到 Actions 页面
  const linkUrl = \`https://github.com/\${owner}/\${repo}/actions?query=branch:\${branch}\`;

  return (
    <a href={linkUrl} target="_blank" rel="noopener noreferrer">
      <img src={imgUrl} alt="CI Status" />
    </a>
  );
}

// 使用：<CIBadge owner="myteam" repo="my-app" />
\`\`\`

## 小结

- 最小 CI：lint + tsc + test + build，能拦 80% 问题。
- \`setup-node\` 的 \`cache\` 选项能省一半时间。
- 拆并行 job + 汇总 check，PR 页面更清晰。
- Vercel 部署最省事，手动部署用 \`vercel-action\`。
- 敏感 token 必须放 GitHub Secrets，不能写进 yml。

## 避坑清单

- ❌ 不缓存依赖，每次 CI 都 3 分钟起步
- ❌ 把 token 写进 yml（应该用 \`secrets.XXX\`）
- ❌ 只跑 build 不跑 test（构建过了不代表功能正常）
- ❌ deploy 不依赖 check（应该用 \`needs:\` 让 deploy 等所有检查通过）

下一章我们讲 Monorepo 与 pnpm workspace。`
  },

  // ============================================================
  // ch77: Monorepo 与 pnpm
  // ============================================================
  {
    id: "tsx3-ch77",
    group: "第十二部分 工程化",
    icon: "📦",
    title: "ch77 Monorepo 与 pnpm",
    content: `# ch77 Monorepo 与 pnpm

## 为什么讲 Monorepo

业务做大后你会发现：后台管理系统、用户端 H5、内部组件库、内部工具函数——四个项目各自一份代码，复制粘贴满天飞。改一个 bug 要在四个仓库里同步，痛苦。Monorepo 把这些项目放进一个仓库，用工具管理依赖关系，改一处全仓库同步。这一章讲 pnpm workspace + Turborepo 的标准搭法。

## 1. pnpm-workspace.yaml：定义包结构

\`\`\`yaml
# pnpm-workspace.yaml
# 列出所有包的目录，支持 glob
packages:
  - "apps/*"           # apps/web、apps/admin、apps/h5
  - "packages/*"       # packages/ui、packages/utils、packages/config
\`\`\`

目录结构长这样：

\`\`\`
my-monorepo/
├── apps/
│   ├── web/                 # 用户端
│   ├── admin/               # 后台
│   └── h5/                  # 移动端
├── packages/
│   ├── ui/                  # 共享 UI 组件库
│   ├── utils/               # 共享工具函数
│   └── tsconfig/            # 共享 tsconfig
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
\`\`\`

## 2. 包间依赖：workspace 协议

\`apps/web\` 想用 \`packages/ui\`，在 \`apps/web/package.json\` 里写：

\`\`\`json
{
  "name": "@my-org/web",
  "dependencies": {
    "@my-org/ui": "workspace:*",        // 用 workspace: 协议
    "@my-org/utils": "workspace:^1.0.0"
  }
}
\`\`\`

\`workspace:\*\` 表示"用本地 workspace 的版本"，发版时 pnpm 会自动替换成真实版本号。

## 3. 共享 tsconfig

每个 app 都配一份 tsconfig 太啰嗦。抽到 \`packages/tsconfig\`：

\`\`\`json
// packages/tsconfig/base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "noUncheckedIndexedAccess": true
  }
}
\`\`\`

\`\`\`json
// packages/tsconfig/react.json
{
  "extends": "./base.json",            // 继承 base
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ES2022"]
  }
}
\`\`\`

子包里引用：

\`\`\`json
// apps/web/tsconfig.json
{
  "extends": "@my-org/tsconfig/react.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
\`\`\`

\`@my-org/tsconfig\` 要在 \`packages/tsconfig/package.json\` 里声明名字：

\`\`\`json
{
  "name": "@my-org/tsconfig",
  "version": "0.0.0"
}
\`\`\`

## 4. Turborepo：并行构建

10 个包串行 build 慢得要命。Turborepo 自动分析依赖图、并行跑、缓存结果。

\`\`\`bash
pnpm add -Dw turbo        # -w 表示装到根目录
\`\`\`

\`\`\`json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],         // ^ 表示先 build 依赖的包
      "outputs": ["dist/**"]           // 缓存 dist 目录
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {},
    "dev": {
      "cache": false,                  // dev 不缓存
      "persistent": true               // 长期运行任务
    }
  }
}
\`\`\`

跑命令：

\`\`\`bash
pnpm turbo build              # 并行构建所有包
pnpm turbo build --filter=@my-org/web   # 只构建 web 包
pnpm turbo dev                # 并行启动所有 app 的 dev server
\`\`\`

第一次跑 build 用 60 秒，第二次相同输入只要 2 秒（直接读缓存）。

## 5. 变更集 Changesets：自动发版

Monorepo 里手动发版是噩梦——改了 \`packages/utils\`，哪些包依赖它？版本号怎么升？Changesets 帮你自动搞定。

\`\`\`bash
pnpm add -Dw @changesets/cli
pnpm changeset init
\`\`\`

每次写完代码，跑：

\`\`\`bash
pnpm changeset
\`\`\`

会问你三个问题：
1. 哪些包变了？
2. 是 patch / minor / major？
3. 改了啥（写描述）？

它会在 \`.changeset/\` 下生成一个 markdown 文件，提交它。

发版时跑：

\`\`\`bash
pnpm changeset version      # 根据 changeset 更新版本号和 changelog
pnpm changeset publish      # 发布到 npm
\`\`\`

## 6. React 组件 demo：共享 UI 包

\`\`\`tsx
// packages/ui/src/Button.tsx
// 这是 monorepo 里 packages/ui 的一个组件，被多个 app 共享
import type { ButtonHTMLAttributes } from "react";

// 用 & 交叉扩展原生 button 属性，保留所有原生能力
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest                  // 把剩下的 onClick、disabled 等透传给原生 button
}: ButtonProps) {
  // 拼类名：基础类 + variant 类 + size 类 + 业务传入的 className
  const classes = [
    "btn",
    \`btn-\${variant}\`,
    \`btn-\${size}\`,
    className,
  ].filter(Boolean).join(" ");

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
\`\`\`

\`\`\`ts
// packages/ui/src/index.ts
// 统一出口，方便外部导入
export { Button } from "./Button";
export type { ButtonProps } from "./Button";
\`\`\`

\`\`\`tsx
// apps/web/src/App.tsx
// 在 web app 里用共享 Button
import { Button } from "@my-org/ui";

export default function App() {
  return (
    <Button
      variant="primary"
      onClick={() => alert("点击了")}
    >
      点我
    </Button>
  );
}
\`\`\`

## 小结

- pnpm-workspace.yaml 定义包结构，\`workspace:\` 协议声明内部依赖。
- 共享 tsconfig 抽到 \`packages/tsconfig\`，子包 extends。
- Turborepo 并行 + 缓存，构建速度提升 10 倍。
- Changesets 自动管理版本号和 changelog，发版不抓狂。

## 避坑清单

- ❌ 用 npm/yarn 跑 monorepo（应该用 pnpm，硬链接节省空间）
- ❌ 包之间循环依赖（A 依赖 B、B 又依赖 A）
- ❌ 改了共享包不跑所有 app 的测试（应该用 turbo 跑全量）
- ❌ 不用 changesets 手动改版本号（容易漏改、容易冲突）

下一章我们讲部署与生产优化。`
  },

  // ============================================================
  // ch78: 部署与生产优化
  // ============================================================
  {
    id: "tsx3-ch78",
    group: "第十二部分 工程化",
    icon: "🚀",
    title: "ch78 部署与生产优化",
    content: `# ch78 部署与生产优化

## 为什么讲这个

本地跑得飞快不代表生产环境飞快——首屏 3 秒、交互卡顿、内存泄漏，这些问题只有上线后才暴露。这一章讲 build 产物怎么分析、分包策略怎么定、SSR/SSG 怎么取舍、CDN 怎么配、运行时性能怎么监控。看完后你能让一个普通 React 应用快 50% 以上。

## 1. build 产物分析

Vite 默认不告诉你产物多大。装 \`rollup-plugin-visualizer\` 看饼图：

\`\`\`ts
// vite.config.ts
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "dist/stats.html",
      open: true,
      // gzip 压缩后的体积，更贴近用户实际下载大小
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
\`\`\`

跑完 \`pnpm build\` 会弹出饼图。常见问题：
- 某个第三方库占了 50%（考虑替代或懒加载）
- moment.js 占了 200KB（换 dayjs，60 倍体积差）
- 整个应用打成一个 chunk（配 manualChunks 分包）

## 2. 分包策略 manualChunks

\`\`\`ts
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 把 node_modules 里的依赖按类别分包
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "react-vendor";
            if (id.includes("react-router")) return "router-vendor";
            if (id.includes("echarts")) return "chart-vendor";
            if (id.includes("@tanstack")) return "query-vendor";
            return "vendor";                  // 其他第三方统一打包
          }
        },
      },
    },
  },
});
\`\`\`

**关键原则**：
- 频繁变动的业务代码单独打（hash 经常变）
- 不常变动的依赖单独打（hash 稳定，缓存命中率高）
- 大型库单独打（按需懒加载）

## 3. 懒加载：路由级 code splitting

\`\`\`tsx
// src/App.tsx
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// 用 lazy 懒加载页面组件，会自动生成独立 chunk
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

export default function App() {
  return (
    // Suspense 包一层，加载时显示 fallback
    <Suspense fallback={<div>加载中...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
}
\`\`\`

用户访问 \`/\` 时只下载 Home 的 chunk，访问 \`/about\` 才下载 About 的 chunk，首屏体积能砍 60% 以上。

## 4. SSR / SSG 取舍

| 方案 | 适合场景 | 缺点 |
| --- | --- | --- |
| CSR（纯前端） | 后台管理系统 | 首屏慢、SEO 差 |
| SSR（每次请求渲染） | 电商、内容站 | 服务器压力大 |
| SSG（构建时渲染） | 博客、文档站 | 内容更新要重新构建 |
| ISR（增量静态生成） | 大型内容站 | 配置复杂 |

**React 18 的建议**：用 Server Components + Streaming SSR，结合 SSR 的实时性和 CSR 的轻量。

## 5. CDN 配置

把静态资源传到 CDN，加 \`\`<base>\`\` 标签或 Vite 的 \`base\` 选项：

\`\`\`ts
// vite.config.ts
export default defineConfig({
  // 所有静态资源 URL 前加 CDN 域名
  base: "https://cdn.example.com/my-app/",
});
\`\`\`

构建后 \`index.html\` 里的资源引用变成 \`https://cdn.example.com/my-app/assets/index-xxx.js\`，用户从离自己最近的 CDN 节点下载。

**Nginx 静态资源缓存策略**：

\`\`\`nginx
# 带 hash 的资源永久缓存
location ~* \\.(js|css|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# index.html 不能缓存（否则用户拿不到新版本）
location = /index.html {
  add_header Cache-Control "no-cache";
}
\`\`\`

\`immutable\` 让浏览器永远不重新下载带 hash 的资源——文件改了 hash 会变，URL 也变，自然拿到新版本。

## 6. 运行时性能监控：Web Vitals

用 \`web-vitals\` 库采集 LCP / FID / CLS 等核心指标：

\`\`\`ts
// src/main.tsx
import { onLCP, onFID, onCLS, onINP } from "web-vitals";

// LCP：最大内容绘制时间，<2.5s 为佳
onLCP((metric) => sendToAnalytics("LCP", metric.value));
// INP：交互到下一帧延迟，<200ms 为佳（替代 FID）
onINP((metric) => sendToAnalytics("INP", metric.value));
// CLS：累计布局偏移，<0.1 为佳
onCLS((metric) => sendToAnalytics("CLS", metric.value));

function sendToAnalytics(name: string, value: number) {
  // 上报到后端，用 navigator.sendBeacon 不阻塞页面
  navigator.sendBeacon("/api/metrics", JSON.stringify({ name, value }));
}
\`\`\`

## 7. React 组件 demo：性能监控 Hook

\`\`\`tsx
// src/hooks/useRenderTracker.ts
// 演示一个监控组件渲染次数的 Hook
import { useEffect, useRef, useState } from "react";

interface RenderStats {
  renderCount: number;       // 总渲染次数
  lastRenderTime: number;    // 上次渲染时间戳
}

export function useRenderTracker(componentName: string): RenderStats {
  const countRef = useRef(0);
  const [stats, setStats] = useState<RenderStats>({
    renderCount: 0,
    lastRenderTime: Date.now(),
  });

  useEffect(() => {
    countRef.current += 1;
    const now = Date.now();
    // 如果 1 秒内渲染超过 5 次，告警
    if (countRef.current > 5 && now - stats.lastRenderTime < 1000) {
      console.warn(
        \`[\${componentName}] 渲染过于频繁：\${countRef.current} 次/秒\`
      );
    }
    setStats({ renderCount: countRef.current, lastRenderTime: now });
  });

  return stats;
}

// 使用：
function MyComponent({ data }: { data: unknown }) {
  const stats = useRenderTracker("MyComponent");
  // 开发环境显示渲染次数，便于发现性能问题
  if (process.env.NODE_ENV === "development") {
    console.log("MyComponent 渲染次数：", stats.renderCount);
  }
  return <div>{JSON.stringify(data)}</div>;
}
\`\`\`

## 小结

- 用 \`rollup-plugin-visualizer\` 看产物体积分布。
- manualChunks 按依赖类别分包，业务代码和依赖分离。
- 路由级 \`lazy\` + \`Suspense\` 实现按需加载。
- SSR/SSG/ISR 按业务场景选，没有银弹。
- CDN + immutable 缓存让静态资源加载飞快。
- Web Vitals 监控真实用户体验。

## 避坑清单

- ❌ 不开 gzip/brotli 压缩（产物大 70%）
- ❌ 业务代码和依赖打成一个 chunk（缓存命中率低）
- ❌ index.html 也永久缓存（用户拿不到新版本）
- ❌ 只看本地性能不看生产 Web Vitals（本地不代表用户）

下一章进入第十三部分，讲 React Server Components。`
  },

  // ============================================================
  // ch79: React Server Components（RSC）
  // ============================================================
  {
    id: "tsx3-ch79",
    group: "第十三部分 进阶主题",
    icon: "🌐",
    title: "ch79 React Server Components",
    content: `# ch79 React Server Components（RSC）

## 为什么讲 RSC

React Server Components 是 React 18 + Next.js App Router 时代的核心特性——组件能在服务端运行，直接读数据库、调内部 API，**不打包进客户端 JS**。一个数据列表页用 RSC 实现，客户端 JS 体积能从 200KB 砍到 5KB。但 RSC 不是"取代"客户端组件，两者配合才能用对。这一章把 RSC 的边界、用法、与 Suspense 的配合讲清楚。

## 1. "use client" 与 "use server" 的边界

\`\`\`tsx
// app/page.tsx
// 默认是 Server Component，不需要写 "use server"
// 它在服务端运行，能直接读数据库、读文件

import { db } from "@/lib/db";
import { UserList } from "./UserList";

// async 函数组件：只有 Server Component 能这样写
export default async function Page() {
  // 直接在组件里 await 数据库查询，不需要 useEffect
  const users = await db.user.findMany();

  // 把数据传给客户端组件
  return <UserList users={users} />;
}
\`\`\`

\`\`\`tsx
// app/UserList.tsx
"use client";                          // 这一行声明：这是客户端组件

import { useState } from "react";

interface UserListProps {
  users: { id: number; name: string }[];
}

export function UserList({ users }: UserListProps) {
  const [filter, setFilter] = useState("");    // 客户端组件才能用 useState

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="搜索用户"
      />
      <ul>
        {filtered.map(u => <li key={u.id}>{u.name}</li>)}
      </ul>
    </div>
  );
}
\`\`\`

**核心规则**：
- 默认是 Server Component，加 \`"use client"\` 才变客户端组件。
- 客户端组件能用 useState / useEffect / onClick。
- 服务端组件能 async、能读数据库、能用 server-only 库。
- 服务端组件不能 import 客户端组件的 hook。

## 2. Server-only 代码：隔离敏感逻辑

数据库连接、密钥、内部 API 这些代码绝不能进客户端 bundle。用 \`server-only\` 包强制隔离：

\`\`\`bash
pnpm add server-only
\`\`\`

\`\`\`ts
// lib/db.ts
import "server-only";                  // 这一行让客户端 import 时直接报错

import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();
// 即使有人误把 db import 到客户端组件，构建会立刻失败
\`\`\`

对应的 \`client-only\`：

\`\`\`ts
// lib/window-size.ts
import "client-only";                  // 这个 Hook 只能在客户端用

import { useState, useEffect } from "react";

export function useWindowSize() {
  // window 在 SSR 时不存在，必须只在客户端跑
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}
\`\`\`

## 3. Server Actions："use server"

客户端组件想触发服务端逻辑，不用写 API。直接用 Server Action：

\`\`\`tsx
// app/actions.ts
"use server";                          // 这个文件里所有 export 都是 Server Action

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  // 直接操作数据库
  await db.user.create({ data: { name } });
  // 刷新首页缓存，让新数据立刻显示
  revalidatePath("/");
}
\`\`\`

\`\`\`tsx
// app/page.tsx
import { createUser } from "./actions";

export default function Page() {
  return (
    // form 的 action 直接接 Server Action，无 JS 也能提交
    <form action={createUser}>
      <input name="name" placeholder="用户名" />
      <button type="submit">添加</button>
    </form>
  );
}
\`\`\`

表单提交不需要 \`onSubmit\`、不需要 \`fetch\`、不需要 \`useState\`——一个 form + 一个 Server Action 就够了。

## 4. 与 Suspense 配合：流式渲染

数据慢的组件用 Suspense 包，让快的内容先显示：

\`\`\`tsx
// app/dashboard/page.tsx
import { Suspense } from "react";
import { db } from "@/lib/db";

// 慢组件：查最近 30 天的订单
async function RecentOrders() {
  const orders = await db.order.findMany({
    where: { createdAt: { gt: new Date(Date.now() - 30 * 86400_000) } },
  });
  return (
    <ul>
      {orders.map(o => <li key={o.id}>订单 {o.id}：¥{o.amount}</li>)}
    </ul>
  );
}

// 快组件：读静态配置
function Welcome() {
  return <h1>欢迎回来</h1>;
}

export default function Dashboard() {
  return (
    <div>
      <Welcome />                       {/* 立刻显示 */}
      <Suspense fallback={<div>加载订单中...</div>}>
        <RecentOrders />                {/* 数据回来再显示 */}
      </Suspense>
    </div>
  );
}
\`\`\`

Next.js 会先发送 \`<Welcome>\` 的 HTML，\`<RecentOrders>\` 数据回来后再流式追加。用户看到内容的时间从"等所有数据"变成"等最快的数据"。

## 5. 数据获取：fetch 的高级用法

RSC 里 \`fetch\` 被扩展了，支持缓存控制：

\`\`\`tsx
// app/products/page.tsx
// 这个页面每 60 秒重新生成一次
async function getProducts() {
  const res = await fetch("https://api.example.com/products", {
    // next.revalidate：60 秒内复用缓存，超时后台重新生成
    next: { revalidate: 60 },
  });
  return res.json();
}

// 动态数据：每次请求都重新拉
async function getUser(id: string) {
  const res = await fetch(\`https://api.example.com/users/\${id}\`, {
    // cache: 'no-store' 表示完全不缓存，每次都重新请求
    cache: "no-store",
  });
  return res.json();
}

export default async function Page({ params }: { params: { id: string } }) {
  const [products, user] = await Promise.all([
    getProducts(),
    getUser(params.id),
  ]);
  return (
    <div>
      <h1>欢迎，{user.name}</h1>
      <ProductList products={products} />
    </div>
  );
}
\`\`\`

## 6. React 组件 demo：混合组件

\`\`\`tsx
// app/blog/[slug]/page.tsx
// 演示 Server Component + Client Component 协作
import { Suspense } from "react";
import { db } from "@/lib/db";
import { LikeButton } from "./LikeButton";
import { CommentForm } from "./CommentForm";

interface PageProps {
  params: { slug: string };
}

// Server Component：读数据库拿文章
export default async function BlogPost({ params }: PageProps) {
  const post = await db.post.findUnique({
    where: { slug: params.slug },
    include: { comments: true },
  });

  if (!post) return <div>文章不存在</div>;

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>

      {/* 客户端组件：点赞按钮需要交互 */}
      <LikeButton postId={post.id} initialLikes={post.likeCount} />

      <h2>评论</h2>
      <ul>
        {post.comments.map(c => (
          <li key={c.id}>{c.content}</li>
        ))}
      </ul>

      {/* 客户端组件：评论表单 */}
      <CommentForm postId={post.id} />
    </article>
  );
}
\`\`\`

\`\`\`tsx
// app/blog/[slug]/LikeButton.tsx
"use client";
import { useState } from "react";
import { likePost } from "../actions";

interface LikeButtonProps {
  postId: number;
  initialLikes: number;
}

export function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    setPending(true);
    // 调 Server Action，不用写 fetch
    await likePost(postId);
    setLikes(l => l + 1);
    setPending(false);
  };

  return (
    <button onClick={handleClick} disabled={pending}>
      👍 {likes} {pending && "（提交中）"}
    </button>
  );
}
\`\`\`

## 小结

- 默认 Server Component，加 \`"use client"\` 才是客户端组件。
- \`server-only\` / \`client-only\` 强制隔离敏感代码。
- Server Actions 让表单提交不用写 API。
- Suspense 包慢组件，实现流式渲染。
- \`fetch\` 的 \`next.revalidate\` / \`cache\` 控制缓存策略。

## 避坑清单

- ❌ Server Component 里用 \`useState\`（违反规则，应该加 \`"use client"\`）
- ❌ 把数据库连接直接 import 到客户端组件（应该用 \`server-only\` 拦截）
- ❌ 在 RSC 里写 \`useEffect\`（Server Component 没有 effect）
- ❌ 不用 Suspense 包慢组件（用户看到白屏直到所有数据回来）

下一章我们讲装饰器与元数据。`
  },

  // ============================================================
  // ch80: 装饰器与元数据
  // ============================================================
  {
    id: "tsx3-ch80",
    group: "第十三部分 进阶主题",
    icon: "🎨",
    title: "ch80 装饰器与元数据",
    content: `# ch80 装饰器与元数据

## 为什么讲装饰器

装饰器（Decorator）是 TS 给类、方法、属性加"元编程"能力的语法。NestJS、TypeORM、class-validator、reflect-metadata 全靠它。虽然 React 函数组件时代用得少，但**任何写后端 / 写 ORM / 写依赖注入的 TS 代码都绕不开它**。TS 5 已经把装饰器稳定下来，这一章把用法和元数据讲透。

## 1. 开启装饰器

TS 5 之前要开 \`experimentalDecorators\`，TS 5 之后官方装饰器提案已稳定，但元数据相关功能仍需要老开关。在 tsconfig 里：

\`\`\`json
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,        // 启用老版装饰器（社区主流）
    "emitDecoratorMetadata": true          // 自动把类型信息写入元数据
  }
}
\`\`\`

两个都开。NestJS / TypeORM 等生态都依赖老开关。

## 2. 类装饰器

类装饰器接收构造函数，返回新构造函数或修改原构造函数：

\`\`\`ts
// 一个最简单的类装饰器：给类打标签
function Loggable(target: Function) {
  // target 是被装饰的类本身
  console.log(\`类 \${target.name} 被装饰了\`);
  // 给类挂一个静态属性
  (target as any).isLoggable = true;
}

@Loggable
class UserService {
  // 类被定义时，装饰器立即执行
  // 控制台打印："类 UserService 被装饰了"
}

console.log(UserService.isLoggable);   // true
\`\`\`

带参数的装饰器（工厂函数）：

\`\`\`ts
// 装饰器工厂：返回真正的装饰器
function Controller(prefix: string) {
  return function (target: Function) {
    // 把 prefix 挂到类的元数据上
    (target as any).prefix = prefix;
  };
}

@Controller("/api/users")
class UserController {}

console.log(UserController.prefix);   // "/api/users"
\`\`\`

NestJS 的 \`@Controller("/api/users")\` 就是这种模式。

## 3. 方法装饰器

方法装饰器接收三个参数：目标对象、方法名、属性描述符：

\`\`\`ts
// 方法装饰器：自动 log 入参和返回值
function Log(
  target: any,                    // 类的 prototype
  propertyKey: string,            // 方法名
  descriptor: PropertyDescriptor  // 描述符，包含 value（函数本体）
) {
  const original = descriptor.value;     // 保存原方法

  // 替换为新函数
  descriptor.value = function (...args: unknown[]) {
    console.log(\`调用 \${propertyKey}，参数：\`, args);
    const result = original.apply(this, args);    // 调原方法
    console.log(\`返回值：\`, result);
    return result;
  };
}

class Calculator {
  @Log
  add(a: number, b: number) {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(1, 2);
// 输出：
//   调用 add，参数： [1, 2]
//   返回值： 3
\`\`\`

## 4. 属性装饰器

\`\`\`ts
// 属性装饰器：标记必填字段
function Required(target: any, propertyKey: string) {
  // 把必填字段名记录到类的 __required__ 数组
  const required = target.__required__ ?? [];
  required.push(propertyKey);
  target.__required__ = required;
}

class CreateUserDTO {
  @Required
  name: string;

  @Required
  email: string;

  // 不加 @Required，是可选的
  age?: number;
}
\`\`\`

class-validator 的 \`@IsString()\`、\`@IsEmail()\` 就是这种模式。

## 5. reflect-metadata：读写元数据

\`\`\`bash
pnpm add reflect-metadata
\`\`\`

\`\`\`ts
// 必须在入口文件 import 一次
import "reflect-metadata";

// 定义元数据的 key
const METADATA_KEY = "design:paramtypes";

// 用 Reflect.defineMetadata 写元数据
function ApiMethod(path: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata("api:path", path, target, propertyKey);
  };
}

// 用 Reflect.getMetadata 读元数据
class UserApi {
  @ApiMethod("/users/:id")
  getUser() {}
}

const path = Reflect.getMetadata("api:path", UserApi.prototype, "getUser");
console.log(path);    // "/users/:id"
\`\`\`

## 6. 自动类型元数据

开了 \`emitDecoratorMetadata\` 后，TS 自动把参数类型、返回类型写入元数据。NestJS 的依赖注入就靠它：

\`\`\`ts
import "reflect-metadata";

class UserService {
  findById(id: number) { return { id, name: "Alice" }; }
}

class UserController {
  // 构造函数参数类型会被 TS 自动写入元数据
  constructor(private userService: UserService) {}
}

// 拿到构造函数的参数类型
const paramTypes = Reflect.getMetadata(
  "design:paramtypes",
  UserController
);
console.log(paramTypes);    // [UserService]
// NestJS 看到这个就能 new UserService() 注入进去
\`\`\`

## 7. React 组件 demo：用装饰器做 HOC

虽然 React 函数组件时代不流行用装饰器，但在 class 组件里 HOC 用装饰器语法很优雅：

\`\`\`tsx
// 演示装饰器在 React class 组件里的用法（了解即可，新项目用函数组件）
import React from "react";

// HOC：给组件加 loading 状态
function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return class extends React.Component<P & { loading: boolean }> {
    render() {
      const { loading, ...rest } = this.props as { loading: boolean };
      return loading ? (
        <div>加载中...</div>
      ) : (
        <WrappedComponent {...(rest as P)} />
      );
    }
  };
}

// 用装饰器语法应用 HOC
@withLoading
class UserList extends React.Component<{ users: string[]; loading: boolean }> {
  render() {
    return (
      <ul>
        {this.props.users.map(u => <li key={u}>{u}</li>)}
      </ul>
    );
  }
}

// 等价于：const UserList = withLoading(class UserList extends ...)
\`\`\`

**注意**：函数组件不能用装饰器（装饰器只能修饰 class 和类成员）。新项目用 HOC 时直接调函数即可。

## 小结

- 装饰器需要开 \`experimentalDecorators\` 和 \`emitDecoratorMetadata\`。
- 类装饰器接 \`Function\`，方法装饰器接 \`(target, key, descriptor)\`。
- \`reflect-metadata\` 提供元数据读写，是 NestJS / TypeORM 的基石。
- \`emitDecoratorMetadata\` 让 TS 自动写入类型信息，实现依赖注入。
- React 函数组件时代用得少，但读后端代码绕不开。

## 避坑清单

- ❌ 不开 \`emitDecoratorMetadata\`（NestJS 依赖注入会失效）
- ❌ 在函数组件上用 \`@Decorator\`（语法错误，只能修饰 class）
- ❌ 装饰器里直接调 \`this.xxx\`（this 指向可能错乱，用 \`original.apply(this, args)\`）
- ❌ 用新版官方装饰器语法却依赖老版元数据（生态还没完全迁移）

下一章我们讲国际化 i18n。`
  },

  // ============================================================
  // ch81: 国际化 i18n
  // ============================================================
  {
    id: "tsx3-ch81",
    group: "第十三部分 进阶主题",
    icon: "🌍",
    title: "ch81 国际化 i18n",
    content: `# ch81 国际化 i18n

## 为什么讲 i18n

产品做大了都要出海——国内版本叫"用户"，英文版本叫"User"；中文显示"100 元"，美国显示"$100.00"；阿拉伯语甚至要从右往左排。一套代码支持多语言就叫国际化（i18n）。React 生态里 \`react-i18next\` 是事实标准，这一章讲怎么集成、怎么写类型安全的多语言、怎么处理复数和日期格式化。

## 1. 安装与初始化

\`\`\`bash
pnpm add i18next react-i18next
\`\`\`

\`\`\`ts
// src/i18n/index.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 翻译资源：两种语言，每种分成几个命名空间
const resources = {
  zh: {
    common: {
      welcome: "欢迎",
      login: "登录",
      logout: "退出",
    },
    user: {
      profile: "个人资料",
      count: "您有 {{count}} 条消息",
    },
  },
  en: {
    common: {
      welcome: "Welcome",
      login: "Log in",
      logout: "Log out",
    },
    user: {
      profile: "Profile",
      count: "You have {{count}} messages",
    },
  },
};

// 初始化 i18next
i18n.use(initReactI18next).init({
  resources,
  lng: "zh",                          // 默认语言
  fallbackLng: "en",                  // 缺翻译时回退到英文
  defaultNS: "common",                // 默认命名空间
  interpolation: {
    escapeValue: false,               // React 已经防 XSS，不需要转义
  },
});

export default i18n;
\`\`\`

\`\`\`tsx
// src/main.tsx
import "./i18n";                       // 副作用导入：初始化 i18n
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);
\`\`\`

## 2. 命名空间：按模块拆分翻译

业务大了翻译文件几千行，全堆一个文件没法维护。用命名空间按模块拆：

\`\`\`
src/i18n/
├── index.ts
└── locales/
    ├── zh/
    │   ├── common.json
    │   ├── user.json
    │   └── order.json
    └── en/
        ├── common.json
        ├── user.json
        └── order.json
\`\`\`

\`\`\`json
// locales/zh/user.json
{
  "profile": "个人资料",
  "settings": "设置",
  "count_one": "您有 {{count}} 条消息",
  "count_other": "您有 {{count}} 条消息"
}
\`\`\`

\`\`\`ts
// src/i18n/index.ts
import zhCommon from "./locales/zh/common.json";
import zhUser from "./locales/zh/user.json";
import enCommon from "./locales/en/common.json";
import enUser from "./locales/en/user.json";

i18n.use(initReactI18next).init({
  resources: {
    zh: { common: zhCommon, user: zhUser },
    en: { common: enCommon, user: enUser },
  },
  // ...
});
\`\`\`

## 3. useTranslation 的类型安全

\`react-i18next\` 默认返回 \`string\`，但如果你写错 key 它不报错。配 \`i18next\` 类型增强：

\`\`\`ts
// src/i18n/react-i18next.d.ts
import "react-i18next";
import type zhCommon from "./locales/zh/common.json";
import type zhUser from "./locales/zh/user.json";

// 把中文资源作为类型"模板"
declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof zhCommon;
      user: typeof zhUser;
    };
  }
}
\`\`\`

配完后，写错 key 会有 TS 报错：

\`\`\`tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  // ✅ 类型安全：key 必须在 resources 里存在
  const welcome = t("welcome");            // "欢迎" / "Welcome"
  const profile = t("user:profile");       // 跨命名空间用 "ns:key"

  // ❌ 报错：key 不存在
  // const bad = t("nonexistent");

  return <h1>{welcome}</h1>;
}
\`\`\`

## 4. 插值与复数

\`\`\`tsx
function MessageCount({ count }: { count: number }) {
  const { t } = useTranslation("user");

  // 插值：用 {{count}} 占位
  return <p>{t("count", { count })}</p>;
  // 中文：您有 5 条消息
  // 英文：You have 5 messages
}

// 复数规则：英文有 one/other，中文只有 other
// 在 locales/en/user.json：
//   "count_one": "You have {{count}} message",
//   "count_other": "You have {{count}} messages"
// i18next 自动按 count 选 one 或 other
\`\`\`

不同语言的复数规则不同：
- 中文：只有 \`other\`
- 英文：\`one\` / \`other\`
- 阿拉伯语：\`zero\` / \`one\` / \`two\` / \`few\` / \`many\` / \`other\`（6 种！）

i18next 内置 CLDR 规则，你只要把所有变体的翻译写全。

## 5. 日期与数字格式化

\`\`\`ts
// 用原生 Intl API，不用装额外库
const date = new Date("2026-07-19");

// 中文格式
console.log(
  new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
);    // "2026年7月19日"

// 英文格式
console.log(
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
);    // "July 19, 2026"

// 货币格式
console.log(
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
  }).format(99.5)
);    // "¥99.50"

console.log(
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(99.5)
);    // "$99.50"
\`\`\`

## 6. React 组件 demo：可切换语言的 Header

\`\`\`tsx
// src/components/Header.tsx
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";

interface HeaderProps {
  // 切换语言的回调
  onSwitchLang?: (lang: string) => void;
}

export function Header({ onSwitchLang }: HeaderProps) {
  // useTranslation 拿到 t 函数和 i18n 实例
  const { t, i18n } = useTranslation();

  // 切换语言
  const switchLang = (lang: string) => {
    i18n.changeLanguage(lang);
    onSwitchLang?.(lang);
  };

  return (
    <header style={{ display: "flex", gap: 16, padding: 16 }}>
      <h1>{t("welcome")}</h1>
      <button onClick={() => switchLang("zh")}>中文</button>
      <button onClick={() => switchLang("en")}>English</button>
    </header>
  );
}

// 配合一个完整页面：
function App() {
  return (
    <div>
      <Header />
      <main>
        <p>{t("user:profile")}</p>
      </main>
    </div>
  );

  // 这里省略 t 的获取，实际需要在组件内调 useTranslation
  function t(key: string): ReactNode { return key; }
}
\`\`\`

## 小结

- \`react-i18next\` 是 React 国际化的事实标准。
- 用命名空间按模块拆分翻译文件，避免巨型 JSON。
- 配 \`CustomTypeOptions\` 让 \`t()\` 函数获得类型安全。
- 复数靠 \`_one\` / \`_other\` 等后缀，i18next 自动按 CLDR 规则选择。
- 日期 / 数字用原生 \`Intl\` API，不需要额外库。

## 避坑清单

- ❌ 把所有翻译堆在一个 JSON 文件（应该按命名空间拆分）
- ❌ 不配 \`CustomTypeOptions\`（写错 key 不报错）
- ❌ 用 \`moment.js\` 做日期格式化（应该用 \`Intl\` 或 \`dayjs\`）
- ❌ 中文版本只写 \`other\` 却误以为英文也只用一个（英文有 one/other 之分）

下一章我们讲无障碍 a11y。`
  },

  // ============================================================
  // ch82: 无障碍 a11y
  // ============================================================
  {
    id: "tsx3-ch82",
    group: "第十三部分 进阶主题",
    icon: "♿",
    title: "ch82 无障碍 a11y",
    content: `# ch82 无障碍 a11y

## 为什么讲 a11y

a11y（accessibility 的缩写，a 开头 y 结尾中间 11 个字母）指"无障碍"。中文开发者经常忽略它，觉得"我用户又没有视障人士"。但 a11y 不只是给残障人士用——手机用户键盘输入不便、车载屏幕只能语音操作、临时手受伤的人——所有人都会从 a11y 受益。欧美市场法务要求产品必须符合 WCAG 标准，不符合会被起诉。这一章讲 React 项目里 a11y 的核心实践。

## 1. 语义化 HTML 是基础

别用 \`<div onClick>\` 当按钮，用 \`<button>\`：

\`\`\`tsx
// ❌ 错误：div 当按钮
function BadButton({ onClick }: { onClick: () => void }) {
  return (
    <div onClick={onClick} className="btn">
      点击
    </div>
  );
  // 问题：
  //   - 键盘 Tab 跳不到
  //   - 回车键不触发
  //   - 屏幕阅读器念成"点击"而不是"按钮"
}

// ✅ 正确：用原生 button
function GoodButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="btn">
      点击
    </button>
  );
  // 原生 button 自带：
  //   - Tab 可聚焦
  //   - 回车 / 空格触发
  //   - 屏幕阅读器念"按钮"
}
\`\`\`

类似地：用 \`<nav>\` 包导航、\`<main>\` 包主内容、\`<aside>\` 包侧边栏、\`<h1>-<h6>\` 表示标题层级。屏幕阅读器靠这些标签导航。

## 2. aria-* 属性

\`aria-*\` 属性补充语义。最常用的几个：

| 属性 | 用途 | 示例 |
| --- | --- | --- |
| \`aria-label\` | 给无文字元素加标签 | \`<button aria-label="关闭">×</button>\` |
| \`aria-labelledby\` | 用另一个元素的 id 当标签 | 关联标题和内容 |
| \`aria-describedby\` | 用另一个元素的 id 当描述 | 表单字段加说明 |
| \`aria-hidden\` | 对屏幕阅读器隐藏 | 装饰性图标 |
| \`aria-expanded\` | 折叠状态 | 折叠菜单 |
| \`aria-live\` | 实时区域（动态内容） | Toast 通知 |

\`\`\`tsx
function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}           // 给按钮加无障碍名字
    >
      {children}                    {/* 装饰性图标 */}
    </button>
  );
}

// 使用：图标按钮，屏幕阅读器念"搜索"
<IconButton label="搜索" onClick={() => {}}>
  <SearchIcon aria-hidden="true" />  {/* 图标本身不需要念出来 */}
</IconButton>
\`\`\`

## 3. role 属性：覆盖默认角色

原生 HTML 已经有默认 role（\`<button>\` 是 \`role="button"\`）。**不要乱加 role**，优先用语义化标签。只有自定义组件无法用原生标签时才用 role：

\`\`\`tsx
// 自定义下拉菜单，必须手动加 role
function Dropdown({ items }: { items: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}            {/* 告诉辅助技术展开状态 */}
        aria-haspopup="menu"            {/* 提示有弹出菜单 */}
      >
        菜单
      </button>

      {open && (
        <ul role="menu">                {/* 声明这是菜单 */}
          {items.map(item => (
            <li key={item} role="menuitem">     {/* 菜单项 */}
              <button onClick={() => setOpen(false)}>{item}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
\`\`\`

## 4. focus 管理

打开模态框时，焦点应该跳到模态框里；关闭时回到触发按钮。这是 a11y 最容易踩坑的点：

\`\`\`tsx
import { useEffect, useRef } from "react";

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      // 记住当前焦点，关闭后要还回去
      previousFocus.current = document.activeElement as HTMLElement;
      // 把焦点移到模态框
      dialogRef.current?.focus();
    } else if (previousFocus.current) {
      // 关闭后还焦点
      previousFocus.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}                    {/* 容器可聚焦但不在 Tab 序列里 */}
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      style={{ position: "fixed", inset: 0, background: "white", padding: 24 }}
    >
      <button onClick={onClose} aria-label="关闭">×</button>
      {children}
    </div>
  );
}
\`\`\`

## 5. 键盘导航：陷阱与解决

模态框打开时，Tab 键不能跑到背景里。这叫"focus trap"。手动实现复杂，推荐用 \`react-focus-lock\`：

\`\`\`tsx
import FocusLock from "react-focus-lock";

function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <FocusLock returnFocus>            {/* 自动 trap 焦点，关闭后还焦点 */}
      <div role="dialog" aria-modal="true">
        <button onClick={onClose} aria-label="关闭">×</button>
        {children}
      </div>
    </FocusLock>
  );
}
\`\`\`

## 6. eslint-plugin-jsx-a11y：静态检查

很多 a11y 问题能在写代码时就被发现。装这个 ESLint 插件：

\`\`\`bash
pnpm add -D eslint-plugin-jsx-a11y
\`\`\`

\`\`\`js
// eslint.config.js
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  {
    plugins: {
      "jsx-a11y": jsxA11y,
    },
    rules: {
      // 启用所有推荐规则
      ...jsxA11y.configs.recommended.rules,
      // 强制 img 有 alt
      "jsx-a11y/alt-text": "error",
      // 不允许用 div 当按钮
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      // 表单 label 必须关联 input
      "jsx-a11y/label-has-associated-control": "error",
    },
  },
];
\`\`\`

写 \`<div onClick>\` 会被立刻报红，逼迫你用 \`<button>\`。

## 7. React 组件 demo：完整可访问的模态框

\`\`\`tsx
// src/components/AccessibleModal.tsx
import { useEffect, useRef, useState } from "react";
import FocusLock from "react-focus-lock";

interface AccessibleModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function AccessibleModal({
  open,
  title,
  onClose,
  children,
}: AccessibleModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // ESC 键关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <FocusLock returnFocus>
      {/* 背景遮罩，点击关闭 */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
        }}
      />
      {/* 模态框本体 */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white",
          padding: 24,
          maxWidth: 400,
        }}
      >
        <h2 id="modal-title">{title}</h2>
        <div>{children}</div>
        <button onClick={onClose} aria-label="关闭对话框">
          关闭
        </button>
      </div>
    </FocusLock>
  );
}
\`\`\`

## 小结

- 优先用语义化 HTML（\`<button>\` / \`<nav>\` / \`<main>\`），别用 div 当交互元素。
- \`aria-*\` 属性补充语义，但不要乱加，原生标签已经有的别重复。
- 模态框必须做 focus 管理：打开 trap 焦点、关闭还焦点。
- 键盘导航是 a11y 的硬性要求，所有交互必须能用键盘完成。
- \`eslint-plugin-jsx-a11y\` 在写代码时就拦住问题。

## 避坑清单

- ❌ 用 \`<div onClick>\` 当按钮（应该用 \`<button>\`）
- ❌ \`<img>\` 不写 \`alt\`（应该写有意义的描述或留空 \`alt=""\`）
- ❌ 模态框打开后焦点跑背景（应该用 \`FocusLock\`）
- ❌ 只用鼠标测试，不试键盘（应该用 Tab / Enter / Esc 测试所有交互）

下一章是结语，回顾全书并推荐进阶路线。`
  },

  // ============================================================
  // 结语：结语与下一步
  // ============================================================
  {
    id: "tsx3-epilogue",
    group: "结尾",
    icon: "🎓",
    title: "结语与下一步",
    content: `# 结语：你已经走完了完整旅程

恭喜你读到了最后。从第一章的 \`const msg: string = "Hello TS"\` 到第八十二章的 a11y 模态框，你走完了从"看不懂类型注解"到"能搭一套生产级 React+TS 工程"的完整旅程。

## 全书回顾

我们一共走了 **13 个部分、82 章**：

| 部分 | 核心收获 |
| --- | --- |
| 第一部分 类型基础 | 原始类型、对象、元组、枚举、type vs interface |
| 第二部分 类型进阶 | 泛型、条件类型、工具类型、模块、声明合并 |
| 第三部分 React 工程基础 | JSX、函数组件、Props、forwardRef、Context |
| 第四部分 事件与表单 | 事件类型、受控/非受控、Hook Form、Zod 校验 |
| 第五部分 Hooks 全解 | 所有内置 Hook + 自定义 Hook 设计模式 |
| 第六部分 性能优化 | memo、useMemo、虚拟列表、Suspense、Profiler |
| 第七部分 数据请求 | fetch、axios、SWR、TanStack Query |
| 第八部分 状态管理 | Context、Zustand、Redux Toolkit、Jotai |
| 第九部分 路由 | React Router v6、Next.js App Router |
| 第十部分 样式方案 | CSS Modules、Tailwind、styled-components |
| 第十一部分 测试 | Jest、RTL、Playwright |
| 第十二部分 工程化 | Vite、ESLint、CI/CD、Monorepo、生产优化 |
| 第十三部分 进阶主题 | RSC、装饰器、i18n、a11y |

**三个里程碑你都达到了**：
1. 读完前 4 部分后，能独立写类型安全的小型 React 应用。
2. 读完前 7 部分后，能从零搭一个带数据请求、状态管理、性能优化的中型应用。
3. 读完整本书后，能主导团队级 React+TS 工程的架构、测试、CI/CD。

## 进阶学习路线

读完这本书不是终点，是起点。下面是三条进阶方向，按兴趣选一条深耕。

### 方向一：源码阅读

读懂主流库的源码能让你对 React / TS 的理解再上一个台阶。推荐顺序（从易到难）：

1. **zustand**（约 1000 行）：最简单的状态管理库，读完后你会理解"状态就是个 subscribe + notify"。
2. **react-router**（约 5000 行）：理解 SPA 路由的本质是 history API + 监听 popstate。
3. **React 本体**：从 \`react.reconciler\` 包开始，理解 Fiber 架构、调度器、双缓冲。
4. **Next.js**：理解 SSR / RSC 的实现机制。

读源码的方法：不要从头读，找一个你想搞懂的功能点，用 \`Grep\` 找到入口，逆着调用链往上读。读不懂就先放一放，跳过细节看主线。

### 方向二：参与开源

给开源项目提 PR 是提升最快的方式。推荐入口：

- **React 文档翻译**：react.dev 的中文翻译一直缺人，从校对单页开始。
- **小型工具库**：找 \`good first issue\` 标签的 issue，从改文档 / 修小 bug 开始。
- **TypeScript 本身**：TS 仓库有 \`help wanted\` 标签，可以提类型定义的 PR。

参与开源的关键：**不要等"完全准备好"**。先 fork、先跑测试、先提一个不完美的 PR，社区会给你反馈，比闷头学半年进步还快。

### 方向三：系统设计

中高级前端面试常考"前端系统设计"——给你一个产品需求，让你设计前端架构。推荐练手题目：

- 设计一个类似 Notion 的协同编辑器（CRDT、WebSocket、虚拟滚动）。
- 设计一个大型电商首页（SSR、CDN、性能预算、灰度发布）。
- 设计一个低代码平台（DSL、渲染器、插件系统）。

练系统设计的关键：**画图**。把组件树、数据流、模块边界都画出来，用图说话比文字更清晰。

## 推荐书单

读完本书后，下面这些书可以填补不同方向的知识空白：

### TypeScript 深度

- **《Effective TypeScript》** Dan Vanderkam：62 条具体建议，让你写出更地道的 TS。
- **《Programming TypeScript》** Boris Cherny：O'Reilly 出品，覆盖类型系统全貌。

### React 进阶

- **《React 设计原理》** 卡颂：从源码角度讲 React，中文作者里讲得最透的。
- **《React in Action》** Mark Tielens Thomas：偏实战，配合本书食用。

### JavaScript 经典

- **《你不知道的 JavaScript》** Kyle Simpson：三卷本，把闭包、原型、异步讲到底。
- **《JavaScript 语言精粹》** Douglas Crockford：薄薄一本，但句句精华。

### 工程化与架构

- **《重构：改善既有代码的设计》** Martin Fowler：教你如何把烂代码变成好代码。
- **《领域驱动设计》** Eric Evans：前端做大后必须懂 DDD，否则业务模型会乱。

### 软技能

- **《代码整洁之道》** Robert C. Martin：写给人看的代码才是好代码。
- **《程序员修炼之道》** Andy Hunt & Dave Thomas：20 周年版，理念永不过时。

## 推荐博客与订阅

| 资源 | 类型 | 价值 |
| --- | --- | --- |
| [react.dev](https://react.dev) | 官方文档 | 第一手权威资料 |
| [typescriptlang.org](https://www.typescriptlang.org) | 官方文档 | TS 的所有特性都有 Playground |
| [Dan Abramov 的博客](https://overreacted.io) | 个人博客 | React 核心维护者的思考 |
| [Kent C. Dodds 的博客](https://kentcdodds.com) | 个人博客 | 测试和 Epic React 作者 |
| [Josh W. Comeau 的博客](https://www.joshwcomeau.com) | 个人博客 | CSS 动画和交互设计 |
| [马克飞象前端周报](https://weekly.innovation-js.com) | 周报 | 中文社区精选 |

## 还要保持的习惯

读书不是终点，**保持持续学习**才是：

1. **每周读一篇技术文章**：上面那些博客任选。
2. **每月写一篇笔记**：把学到的总结成自己的话，写出来才算真懂。
3. **每季度做一个项目**：用学到的新东西做点小项目，比如给本书的某个 demo 加点功能。
4. **每年复盘一次**：回头看自己一年前的代码，发现"怎么写得这么烂"说明你进步了。

## 最后的话

技术更新很快，但底层原理很稳——TypeScript 的类型系统、React 的"UI = f(state)"哲学、HTTP 的请求响应模型，这些十年内不会变。你只要把基础打牢，新框架（Solid、Qwik、Astro）新工具（Bun、Turbopack）新范式（RSC、Islands）都是换皮不换骨。

读到这里你已经超过 90% 的同行了。接下来靠**实践**——去写、去踩坑、去重构、去分享。

祝你写出更多好代码，少写烂代码。我们江湖再见。

—— 全书完 ——`
  },
];

export { chapters };
