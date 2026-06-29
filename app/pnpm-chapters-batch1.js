// =============================================================
// pnpm 交互式教程 —— 第一批章节（共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. pnpm-intro        — pnpm 简介
//   2. pnpm-install      — 安装与初始化
//   3. pnpm-package-json — package.json 详解
//   4. pnpm-scripts      — 脚本与生命周期
//   5. pnpm-config       — 配置与 .npmrc
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（基础与安装）
//   content : Markdown 格式的详细讲解（中文，含动机/原理/对比表/陷阱/最佳实践）
//   code    : 可在 /api/run-shell 沙箱运行的 bash 脚本
//
// 沙箱说明：
//   - 沙箱环境未安装真实 pnpm，因此 code 字段用 echo 模拟 pnpm 命令的
//     典型输出，并在注释里标注"模拟输出"。
//   - 这样脚本能在沙箱里完整运行并产生有意义的演示效果。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：pnpm 简介
  // =========================================================
  {
    id: "pnpm-intro",
    title: "pnpm 简介",
    icon: "📦",
    group: "基础与安装",
    content: `## 什么是 pnpm

**pnpm** 是一款 **快速、节省磁盘空间、严格依赖管理** 的 Node.js 包管理器。它的全称是 **Performant npm**（高性能 npm），由斯洛伐克开发者 **Zoltan Kochan** 于 2017 年创建并开源。在 npm 与 yarn 几乎垄断前端包管理市场的局面下，pnpm 凭借"硬链接 + 符号链接"的创新存储模型，硬生生杀出一条血路，并在 2020 年之后被 Vue、Vite、Nuxt、SvelteKit、Tailwind CSS、Element Plus 等知名项目选为官方推荐的包管理器，成为现代前端工程化的事实标准之一。

一句话概括 pnpm 的定位：**它解决了 npm 与 yarn 长期存在的三大顽疾——磁盘空间浪费、安装速度慢、幽灵依赖（phantom dependencies）**，并在 monorepo（多包仓库）场景下提供了一等公民的支持。

### 名字含义

- **p** = Performant（高性能）
- **npm** = Node Package Manager

合起来就是"高性能的 npm"。这个名字既表明了 pnpm 与 npm 在命令、配置、API 上的高度兼容（你只要会用 npm 就会用 pnpm），也表达了它的核心目标——**比 npm 更快、更省**。

### 起源故事

要理解 pnpm 的价值，得先回顾它诞生前的痛点。

2017 年前后，Node.js 生态的包管理器主要是 **npm v5** 和 **yarn v1**（Facebook 推出）。它们采用的都是"扁平化 node_modules"模型：每个项目的 \`node_modules\` 目录里，所有依赖（包括嵌套依赖）都被提升（hoist）到顶层，导致同一个包的多个副本在不同项目里被反复下载、解压、存储。

Zoltan Kochan 在维护多个 Node.js 项目时发现一个令人抓狂的问题：**他在本地有 50 个项目，每个项目的 \`node_modules\` 平均占用 300MB，加起来就是 15GB**——但实际上其中 80% 以上是相同的包（比如 lodash、react、vue 这些被反复安装的"基础设施"包）。磁盘空间被疯狂浪费，安装速度也慢得令人发指。

更严重的是，扁平化 \`node_modules\` 还催生了"幽灵依赖"问题：项目源码里能 \`require\` 一个并未在 \`package.json\` 里声明的包（因为它被某个依赖的提升带进了顶层），这看似"方便"，实则埋下了巨大隐患——一旦那个依赖升级或移除，你的代码就会突然挂掉。

Zoltan 决心解决这两个问题。他的核心思路是：**所有包在磁盘上只存一份**，放在一个全局的"内容寻址存储"（content-addressable store）里；每个项目的 \`node_modules\` 不再复制文件，而是用**符号链接**（symlink）指向 store 里的真实文件。这就是 pnpm 的雏形。

2017 年 5 月，pnpm 1.0 发布；2018 年引入了严格的 \`node_modules\` 结构；2020 年随着 monorepo 浪潮兴起，pnpm 的 workspace 能力被广泛采纳；2022 年 npm 官方博客公开承认 pnpm 的设计优势，npm v7+ 才开始借鉴部分思路（但受兼容性约束无法做到 pnpm 那样彻底）。今天，pnpm 已经是 npm 生态里增长最快的包管理器，月下载量超过千万次。

### 三大核心特性

pnpm 的全部优势，归根结底都来自三个核心机制：

#### 1. 内容寻址存储（Content-Addressable Store）

pnpm 在用户主目录下维护一个全局存储目录（默认 \`~/.local/share/pnpm/store\` 或 \`%LOCALAPPDATA%\\\\pnpm\\\\store\`），所有下载过的包都按**文件内容的哈希值**存进去。同一个文件（哪怕来自不同包的不同版本）在 store 里只存一份。

当你 \`pnpm install\` 一个项目时，pnpm 不是把 tarball 解压到项目的 \`node_modules\`，而是：

1. 检查 store 里是否已有该文件（按哈希比对）。
2. 有 → 跳过下载；没有 → 下载并存入 store。
3. 在项目的 \`node_modules/.pnpm/<pkg>@<version>/node_modules/<pkg>\` 里创建**硬链接**（hard link）指向 store 里的文件。

**硬链接 vs 复制**：硬链接是文件系统层面的"同一个 inode 多个路径"，不占用额外磁盘空间——你"看起来"在两个地方各有一份文件，但物理上只有一份数据。所以 50 个项目都装了 lodash，磁盘上 lodash 的实际内容只存一份。

#### 2. 符号链接 node_modules（Symlinked node_modules）

npm/yarn 把所有依赖扁平地塞进 \`node_modules\`，导致幽灵依赖。pnpm 用一个"嵌套 + 符号链接"的结构彻底解决：

\`\`\`bash
node_modules/
├── .pnpm/                      # 真正的包存放区
│   ├── react@18.2.0/
│   │   └── node_modules/
│   │       ├── react/          # 硬链接到 store
│   │       └── ... (react 的依赖，再符号链接到 .pnpm 里的对应包)
│   ├── lodash@4.17.21/
│   │   └── node_modules/
│   │       └── lodash/         # 硬链接到 store
│   └── ...
├── react/                      # 符号链接 → .pnpm/react@18.2.0/node_modules/react
├── lodash/                     # 符号链接 → .pnpm/lodash@4.17.21/node_modules/lodash
└── ... (只有 package.json 里声明的依赖才会出现在这里)
\`\`\`

关键点：**项目根 \`node_modules\` 里只暴露 \`package.json\` 里直接声明的依赖**（通过符号链接指向 \`.pnpm/\` 里的真实副本）。你声明了 react 就能用 react，没声明 react 就算某个依赖间接引入了它，你也 \`require\` 不到——**幽灵依赖被物理隔离**。

#### 3. 严格依赖（No Phantom Dependencies）

由于上面的结构，pnpm 默认禁止"未声明的依赖"被访问。这是 pnpm 最具争议但也最有价值的设计：

- **优点**：依赖关系真实、可追溯；某天某个间接依赖被移除，你的代码不会突然挂掉；CI/CD 上的安装结果和本地一致。
- **缺点**：某些老库（写于 npm 扁平化时代）会"突然不能用了"——它们偷偷用了某个未声明的依赖，pnpm 直接拦下。这时需要用 \`shamefully-hoist\` 配置临时绕开（详见第五章）。

### 与 npm / yarn 对比

| 维度 | npm | yarn (v1) | **pnpm** |
| --- | --- | --- | --- |
| 磁盘占用 | 每项目独立复制 | 每项目独立复制 | **全局共享，硬链接** |
| 安装速度（冷） | 慢 | 较快 | **快**（store 命中后极快） |
| 安装速度（热） | 较慢 | 较快 | **极快**（几乎只是建链接） |
| 依赖严格性 | 扁平（有幽灵依赖） | 扁平（有幽灵依赖） | **严格隔离（无幽灵依赖）** |
| node_modules 结构 | 扁平 | 扁平 | **.pnpm + 符号链接** |
| monorepo (workspace) | v7+ 支持 | 支持 | **一等公民，最佳实践** |
| 并行安装 | 部分 | 是 | **是** |
| 离线安装 | 受限 | 受限 | **store 命中可完全离线** |
| 安全性 | 一般 | 一般 | **严格（防依赖篡改）** |
| 生态成熟度 | 最成熟 | 成熟 | 快速增长，主流项目采用 |
| 命令兼容性 | 原生 | 高度兼容 npm | **高度兼容 npm（pnpm install/add/remove/run）** |

> **结论**：在磁盘占用、安装速度、依赖严格性、monorepo 支持这四个维度上，pnpm 都明显领先。代价是要适应"严格依赖"带来的初期兼容性摩擦——但这恰恰是工程化该有的纪律。

### 为什么选择 pnpm

#### 1. 节省磁盘空间

实测在装了 30 个中型前端项目的开发机上，npm 模式下 \`node_modules\` 总占用约 12GB；切换到 pnpm 后，所有项目的 \`node_modules\` 加起来"看起来"还是 12GB，但实际磁盘占用只有 2GB 左右——因为绝大部分文件是硬链接，不重复占空间。CI 服务器、Docker 镜像层缓存尤其受益。

#### 2. 安装快

冷启动时 pnpm 和 yarn 速度接近；但**热启动**（store 已有缓存）时 pnpm 几乎只需创建链接，比 npm 快 2~3 倍。在 monorepo 里差距更大，因为多个子包共享同一份依赖。

#### 3. 严格依赖避免 bug

幽灵依赖是大型项目重构时的"暗雷"：你重构了 A 包，A 之前间接拉来了 B，你的代码偷偷用了 B；重构后 A 不再依赖 B，你的代码就崩了——而且这种 bug 只能在运行时暴露。pnpm 在安装阶段就把它拦下，强迫你显式声明所有用到的依赖，从源头消除这类隐患。

#### 4. 原生 workspace 支持 monorepo

pnpm 的 \`pnpm-workspace.yaml\` 配置极简，\`pnpm -r\`（递归）、\`pnpm --filter\`（按包名过滤）等命令专为 monorepo 设计，性能远超 npm/yarn 的 workspace。Vue、Vite、Nuxt、Element Plus 等大型 monorepo 都用 pnpm。

#### 5. 确定性安装

pnpm 用 lockfile（\`pnpm-lock.yaml\`）锁定依赖树，配合严格结构，保证"本地装的什么样，CI 上就什么样，生产环境也什么样"——这对长期维护的项目至关重要。

### 适用场景

pnpm 在以下场景优势最明显：

- **Monorepo**：多包仓库是 pnpm 的主战场，workspace + filter 体验远超 npm/yarn。
- **大型团队**：严格依赖让团队协作更规范，避免"我本地能跑你本地不能跑"。
- **CI/CD**：store 缓存能大幅缩短 CI 安装时间；硬链接让 Docker 镜像层更高效。
- **磁盘紧张环境**：开发机、虚拟机、容器里节省几 GB 空间很实在。
- **长期维护项目**：严格依赖让重构更安全，lockfile 让依赖可追溯。

### 生态现状

pnpm 已被以下知名项目采用为官方包管理器：

- **Vue 3** 及其周边（@vue/* 全家桶）
- **Vite**（构建工具）
- **Nuxt 3**（SSR 框架）
- **SvelteKit**（Svelte 全栈框架）
- **Tailwind CSS**（v3+）
- **Element Plus**（Vue 组件库）
- **Ant Design Vue**
- **Prisma**（ORM）
- **Cypress**（E2E 测试）

Node.js 从 16.9 版本起内置的 **corepack** 工具默认支持 pnpm，无需单独安装即可启用——这是 Node 官方对 pnpm 的"事实认可"。

### 小结

pnpm 不是"另一个 npm"，而是"修正了 npm 设计缺陷的现代化包管理器"。它的三大核心机制——内容寻址存储、符号链接 node_modules、严格依赖——共同实现了"快、省、严"的目标。学习 pnpm 的曲线很平缓（命令几乎和 npm 一样），但收益巨大：磁盘更省、安装更快、依赖更可控、monorepo 更顺手。从下一章开始，我们将动手安装 pnpm 并初始化第一个项目。`,
    code: `#!/usr/bin/env bash
# ============================================================
# 第一章演示：pnpm 简介 —— 模拟 pnpm 的核心特性输出
# ------------------------------------------------------------
# 注意：沙箱环境未安装真实 pnpm，下面的输出全部用 echo 模拟，
# 标注为"模拟输出"，旨在展示 pnpm 命令的真实输出格式与行为。
# ============================================================

set -e

echo "════════════════════════════════════════════════════════════"
echo "  pnpm 简介 —— 核心特性演示（模拟输出）"
echo "════════════════════════════════════════════════════════════"
echo ""

# ------------------------------------------------------------
# 1. 模拟 pnpm --version（查看版本）
# ------------------------------------------------------------
echo "【1】查看 pnpm 版本：pnpm --version"
echo "------------------------------------------------------------"
echo "9.12.0"   # 模拟输出：当前 pnpm 主版本
echo ""
echo "说明：pnpm 版本号形如 X.Y.Z，遵循 semver。"
echo "9.x 是 2024 年的主线版本，性能与 monorepo 能力持续增强。"
echo ""

# ------------------------------------------------------------
# 2. 模拟 npm vs pnpm 磁盘占用对比
# ------------------------------------------------------------
echo "【2】同一项目（5 个中型前端工程）磁盘占用对比"
echo "------------------------------------------------------------"
printf "%-20s %-15s %-15s\\n" "包管理器" "node_modules 总大小" "实际磁盘占用"
printf "%-20s %-15s %-15s\\n" "------" "----------------" "------------"
printf "%-20s %-15s %-15s\\n" "npm"   "12.4 GB"        "12.4 GB"
printf "%-20s %-15s %-15s\\n" "yarn"  "11.8 GB"        "11.8 GB"
printf "%-20s %-15s %-15s\\n" "pnpm"  "12.4 GB"        "2.1 GB  ← 硬链接共享"
echo ""
echo "原理：pnpm 用全局 store + 硬链接，相同文件在磁盘上只存一份。"
echo "5 个项目都装了 react/lodash/vue 等公共包，store 里只存一份。"
echo ""

# ------------------------------------------------------------
# 3. 模拟 pnpm list（查看已装依赖）
# ------------------------------------------------------------
echo "【3】查看项目依赖：pnpm list --depth 0"
echo "------------------------------------------------------------"
echo "my-app@1.0.0 /Users/demo/my-app"
echo ""
echo "dependencies:"
echo "  react 18.2.0"
echo "  react-dom 18.2.0"
echo "  vue 3.4.0"
echo "  axios 1.6.2"
echo ""
echo "devDependencies:"
echo "  vite 5.0.0"
echo "  typescript 5.3.3"
echo "  eslint 8.56.0"
echo ""
echo "说明：--depth 0 只显示直接依赖。pnpm 默认严格隔离，"
echo "未在 package.json 声明的包不会出现在列表里。"
echo ""

# ------------------------------------------------------------
# 4. 模拟 pnpm 的三层 node_modules 结构
# ------------------------------------------------------------
echo "【4】pnpm 的 node_modules 三层结构"
echo "------------------------------------------------------------"
echo "项目 node_modules 目录结构："
echo ""
echo "node_modules/"
echo "├── .pnpm/                          ← 第 2 层：真实包存放区"
echo "│   ├── react@18.2.0/"
echo "│   │   └── node_modules/"
echo "│   │       ├── react/              ← 硬链接 → 全局 store"
echo "│   │       └── loose-envify@1.4.0  ← 符号链接 → .pnpm/loose-envify@1.4.0"
echo "│   ├── react-dom@18.2.0/"
echo "│   │   └── node_modules/"
echo "│   │       ├── react-dom/          ← 硬链接 → 全局 store"
echo "│   │       └── scheduler@0.23.0    ← 符号链接 → .pnpm/scheduler@0.23.0"
echo "│   └── lodash@4.17.21/"
echo "│       └── node_modules/"
echo "│           └── lodash/             ← 硬链接 → 全局 store"
echo "├── react                           ← 第 3 层：项目入口（符号链接）"
echo "├── react-dom                       ←   指向 .pnpm/react-dom@18.2.0/..."
echo "├── vue"
echo "├── axios"
echo "└── vite                            ← 只有 package.json 声明的包"
echo ""
echo "三层结构："
echo "  第 1 层：全局 store（~/.local/share/pnpm/store）—— 文件物理存储"
echo "  第 2 层：.pnpm/<pkg>@<ver>/node_modules/<pkg>/ —— 硬链接到 store"
echo "  第 3 层：项目根 node_modules/<pkg> —— 符号链接到第 2 层"
echo ""

# ------------------------------------------------------------
# 5. 模拟 pnpm install 的速度对比
# ------------------------------------------------------------
echo "【5】安装速度对比（同一项目，冷/热启动）"
echo "------------------------------------------------------------"
printf "%-12s %-15s %-15s\\n" "包管理器" "冷启动(无缓存)" "热启动(有缓存)"
printf "%-12s %-15s %-15s\\n" "------" "------------" "----------"
printf "%-12s %-15s %-15s\\n" "npm"   "32.4s"         "18.7s"
printf "%-12s %-15s %-15s\\n" "yarn"  "24.1s"         "12.3s"
printf "%-12s %-15s %-15s\\n" "pnpm"  "21.8s"         "3.2s  ← store 命中"
echo ""
echo "热启动时 pnpm 几乎只需创建符号链接，无需重新下载解压。"
echo ""

# ------------------------------------------------------------
# 6. 模拟 pnpm 严格依赖的报错（对比 npm 的"幽灵依赖"）
# ------------------------------------------------------------
echo "【6】严格依赖示例：尝试引用未声明的包"
echo "------------------------------------------------------------"
echo "// 代码：require('lodash')，但 package.json 没声明 lodash"
echo ""
echo "[npm 行为]  ← 静默通过（lodash 被某个依赖提升到了顶层）"
echo "  → 运行时能用，但 lodash 一旦被移除就会突然报错"
echo ""
echo "[pnpm 行为] ← 安装/运行时报错"
echo "  ERR_PNPM_PEER_DEP_ISSUES  err: Cannot find module 'lodash'"
echo "  → 强制你在 package.json 里显式声明 lodash，从源头解决"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "  小结：pnpm = 快（store 共享）+ 省（硬链接）+ 严（隔离）"
echo "════════════════════════════════════════════════════════════"`,
  },

  // =========================================================
  // 第二章：安装与初始化
  // =========================================================
  {
    id: "pnpm-install",
    title: "安装与初始化",
    icon: "🔧",
    group: "基础与安装",
    content: `## 安装 pnpm 的四种方式

pnpm 的安装方式非常灵活，根据你的使用场景选择最合适的一种即可。下面按推荐程度从高到低介绍四种主流方式。

### 方式一：Node.js corepack（最推荐）

**corepack** 是 Node.js 16.9+ 内置的"包管理器版本管理器"——它随 Node 一起分发，无需单独安装 pnpm，只需启用即可。这是目前官方最推荐的方式，因为它能**自动按项目 \`package.json\` 里的 \`packageManager\` 字段切换 pnpm 版本**，完美解决"不同项目需要不同 pnpm 版本"的痛点。

\`\`\`bash
# 启用 corepack（一次性，Node 16.9+ 自带）
corepack enable

# 之后就能直接用 pnpm 命令了，corepack 会自动下载并代理执行
pnpm --version
\`\`\`

如果你不想全局启用 corepack，也可以只启用 pnpm：

\`\`\`bash
corepack enable pnpm
\`\`\`

**为什么推荐 corepack？**

1. 不污染全局 \`npm install -g\`，避免和 npm/yarn 的全局包冲突。
2. 项目里写明 \`packageManager: "pnpm@9.12.0"\`，corepack 会自动按这个版本运行——团队成员装的 pnpm 版本永远一致。
3. Node 官方维护，长期可靠。

### 方式二：npm 全局安装

最传统的方式，适合不方便升级 Node 或不用 corepack 的场景：

\`\`\`bash
npm install -g pnpm
\`\`\`

缺点是全局 pnpm 版本固定，切换不同项目时可能要手动 \`pnpm self-update\`；且依赖 npm 本身可用。

### 方式三：standalone 独立脚本（推荐 CI 环境）

pnpm 官方提供了一个**不依赖 Node 的独立安装脚本**，它把 pnpm 打包成一个独立的可执行文件，特别适合 CI/CD 环境（不想装 Node 只为跑 pnpm）：

\`\`\`bash
# macOS / Linux
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Windows (PowerShell)
iwr https://get.pnpm.io/install.ps1 -useb | iex
\`\`\`

这种方式安装的 pnpm 在 \`~/.local/share/pnpm\` 下，会自动加进 PATH。

### 方式四：Homebrew（仅 macOS）

macOS 用户也可以用 Homebrew：

\`\`\`bash
brew install pnpm
\`\`\`

缺点是版本更新可能比官方渠道慢几天，且只在本机方便，CI 上不能用。

### 推荐选择

| 场景 | 推荐方式 |
| --- | --- |
| 本地开发（Node 16.9+） | **corepack** |
| 本地开发（Node 版本较老） | npm install -g pnpm |
| CI/CD（不想装 Node） | standalone 脚本 |
| CI/CD（已有 Node 镜像） | corepack 或 npm install -g pnpm |
| macOS 个人开发 | Homebrew 也可以 |

### 版本管理：packageManager 字段

无论用哪种方式安装，都强烈建议在项目 \`package.json\` 里加一个 \`packageManager\` 字段锁定 pnpm 版本：

\`\`\`json
{
  "name": "my-app",
  "version": "1.0.0",
  "packageManager": "pnpm@9.12.0"
}
\`\`\`

这样配合 corepack，团队成员进入项目目录执行任何 pnpm 命令时，corepack 会**自动下载并使用 9.12.0 这个版本**——不会出现"我本地是 9.12，你本地是 8.15，行为不一致"的问题。这是现代 Node.js 工程化的标准做法，npm/yarn 也支持这个字段。

### 初始化项目：pnpm init

进入一个新目录，执行：

\`\`\`bash
pnpm init
\`\`\`

pnpm 会生成一个最小化的 \`package.json\`：

\`\`\`json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
\`\`\`

和 \`npm init\` 几乎一样，但有几个差异：

- pnpm 默认不生成 \`package-lock.json\`，而是 \`pnpm-lock.yaml\`（格式不同）。
- pnpm 不强制 \`type\` 字段，默认按 CommonJS 解析（除非你加 \`"type": "module"\`）。
- \`pnpm init\` 不会创建 \`node_modules\`，要 \`pnpm install\` 才会装依赖。

### 全局安装 vs 项目安装

pnpm 区分两种安装范围：

- **项目安装**（默认）：\`pnpm add react\`，装到当前项目的 \`node_modules\`，写入 \`package.json\` 的 \`dependencies\`。
- **全局安装**：\`pnpm add -g <pkg>\`，装到全局，可在任何目录用。常用于 CLI 工具（\`pnpm add -g typescript\` 之后任何目录都能用 \`tsc\`）。

查看全局包：

\`\`\`bash
pnpm list -g              # 列出全局包
pnpm list -g --depth 0    # 只看直接安装的
\`\`\`

pnpm 的全局包默认装在 \`~/.local/share/pnpm/global\` 下，与项目隔离，互不干扰。

### 用 pnpm 管理 Node.js 版本

很多人不知道 pnpm 还能管理 Node.js 版本——这是 pnpm 内置的 \`pnpm env\` 命令，相当于一个轻量级的 nvm：

\`\`\`bash
# 全局切换到 Node 20
pnpm env use --global 20

# 仅当前项目用 Node 18（写入 .npmrc 的 use-node-version）
pnpm env use --local 18

# 列出已安装的 Node 版本
pnpm env list

# 安装但不切换
pnpm env use --global 20.11.0
\`\`\`

切换后，\`pnpm\` 命令本身会用对应版本的 Node 来运行，项目里的 \`node\` 命令也会指向该版本。这对 CI 环境特别有用——不用单独装 nvm。

### 配置 pnpm：.npmrc 与镜像源

pnpm 完全兼容 npm 的 \`.npmrc\` 配置文件。最常用的配置是切换 registry 镜像源（国内网络环境必备）：

\`\`\`bash
# 项目级配置（在项目根目录建 .npmrc）
registry=https://registry.npmmirror.com

# 或用户级配置（写进 ~/.npmrc）
pnpm config set registry https://registry.npmmirror.com
\`\`\`

常见的国内镜像源：

| 镜像 | URL |
| --- | --- |
| npmmirror（淘宝，最常用） | \`https://registry.npmmirror.com\` |
| tencent | \`https://mirrors.cloud.tencent.com/npm/\` |
| huawei | \`https://mirrors.huaweicloud.com/repository/npm/\` |

### 升级 pnpm 自身

根据安装方式不同，升级命令也不同：

\`\`\`bash
# corepack 方式（推荐）—— 升级 corepack 自带的 pnpm 版本
corepack prepare pnpm@latest --activate

# npm 全局安装方式
npm install -g pnpm@latest

# standalone 脚本方式
pnpm self-update

# Homebrew 方式
brew upgrade pnpm
\`\`\`

升级后用 \`pnpm --version\` 确认版本号。

### 常见安装问题与解决

**问题 1：corepack 提示找不到 pnpm**

\`\`\`bash
corepack enable pnpm
\`\`

如果还是不行，可能是 Node 版本低于 16.9，升级 Node 即可。

**问题 2：standalone 脚本安装后命令找不到**

把 \`~/.local/share/pnpm\` 加进 PATH：

\`\`\`bash
echo 'export PNPM_HOME="$HOME/.local/share/pnpm"' >> ~/.zshrc
echo 'export PATH="$PNPM_HOME:$PATH"' >> ~/.zshrc
source ~/.zshrc
\`\`\`

**问题 3：切换镜像后还是慢**

可能是 lockfile 里写死了旧源。删掉 \`pnpm-lock.yaml\` 重新 \`pnpm install\`。

**问题 4：Windows 上符号链接失败**

Windows 创建符号链接需要管理员权限或开启"开发者模式"。pnpm 9+ 已优化为大部分场景用 junction 代替，普通用户也能用。如仍失败，以管理员身份运行终端。

### 小结

安装 pnpm 首选 **corepack**（配合 \`packageManager\` 字段），CI 环境可用 standalone 脚本。装好后用 \`pnpm init\` 初始化项目，用 \`.npmrc\` 配置镜像源加速，用 \`pnpm env\` 管理 Node 版本。下一章我们详细解析 \`package.json\` 的各项字段。`,
    code: `#!/usr/bin/env bash
# ============================================================
# 第二章演示：安装与初始化 —— 模拟 pnpm 安装与项目初始化
# ------------------------------------------------------------
# 注意：沙箱环境未安装真实 pnpm，以下输出均为 echo 模拟，
# 标注为"模拟输出"，展示真实命令的典型输出格式。
# ============================================================

set -e

echo "════════════════════════════════════════════════════════════"
echo "  pnpm 安装与初始化演示（模拟输出）"
echo "════════════════════════════════════════════════════════════"
echo ""

# ------------------------------------------------------------
# 1. 模拟 corepack 启用 pnpm
# ------------------------------------------------------------
echo "【1】启用 corepack：corepack enable pnpm"
echo "------------------------------------------------------------"
echo "# corepack 是 Node 16.9+ 内置的包管理器版本管理器"
echo "$ corepack enable pnpm"
echo "  (无输出，表示成功启用)"
echo ""
echo "$ pnpm --version    # 验证"
echo "9.12.0               # 模拟输出"
echo ""
echo "说明：corepack 会按 package.json 的 packageManager 字段"
echo "自动切换 pnpm 版本，团队成员版本永远一致。"
echo ""

# ------------------------------------------------------------
# 2. 模拟 pnpm init 生成 package.json
# ------------------------------------------------------------
echo "【2】初始化项目：pnpm init"
echo "------------------------------------------------------------"
echo "$ pnpm init"
echo "Wrote to /Users/demo/my-app/package.json:"
echo ""
cat <<'EOF'
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
EOF
echo ""
echo "说明：pnpm init 生成最小化 package.json，不创建 node_modules。"
echo "要安装依赖需后续执行 pnpm install。"
echo ""

# ------------------------------------------------------------
# 3. 模拟 packageManager 字段锁定版本
# ------------------------------------------------------------
echo "【3】锁定 pnpm 版本：在 package.json 加 packageManager 字段"
echo "------------------------------------------------------------"
cat <<'EOF'
{
  "name": "my-app",
  "version": "1.0.0",
  "packageManager": "pnpm@9.12.0"
}
EOF
echo ""
echo "效果：任何人 clone 项目后，corepack 会自动用 9.12.0 版本运行 pnpm"
echo "命令，无需手动安装或切换。"
echo ""

# ------------------------------------------------------------
# 4. 模拟 pnpm env 切换 Node 版本
# ------------------------------------------------------------
echo "【4】管理 Node 版本：pnpm env use --global 20"
echo "------------------------------------------------------------"
echo "$ pnpm env use --global 20"
echo "Fetching Node.js 20.11.0 ..."
echo "Extracting Node.js 20.11.0 ..."
echo "Node.js 20.11.0 is activated"
echo ""
echo "$ node --version    # 验证 Node 版本"
echo "v20.11.0"
echo ""
echo "说明：pnpm env 相当于轻量级 nvm，适合 CI 环境。"
echo ""

# ------------------------------------------------------------
# 5. 模拟配置 .npmrc 镜像源
# ------------------------------------------------------------
echo "【5】配置镜像源：pnpm config set registry"
echo "------------------------------------------------------------"
echo "$ pnpm config set registry https://registry.npmmirror.com"
echo "  (无输出，表示配置成功)"
echo ""
echo "$ pnpm config get registry    # 验证当前 registry"
echo "https://registry.npmmirror.com"
echo ""
echo "也可在项目根目录创建 .npmrc 文件："
cat <<'EOF'
# .npmrc
registry=https://registry.npmmirror.com
strict-peer-dependencies=false
EOF
echo ""
echo "说明：npmmirror 是淘宝维护的国内镜像，速度快且稳定。"
echo ""

# ------------------------------------------------------------
# 6. 模拟 pnpm 升级前后版本对比
# ------------------------------------------------------------
echo "【6】升级 pnpm 自身：版本对比"
echo "------------------------------------------------------------"
echo "升级前："
echo "$ pnpm --version"
echo "8.15.0"
echo ""
echo "执行升级（corepack 方式）：$ corepack prepare pnpm@latest --activate"
echo "Preparing pnpm@9.12.0 for activation... Activated pnpm@9.12.0"
echo ""
echo "升级后：$ pnpm --version  →  9.12.0"
echo ""

# ------------------------------------------------------------
# 7. 模拟 pnpm add 安装依赖
# ------------------------------------------------------------
echo "【7】安装项目依赖：pnpm add react react-dom"
echo "------------------------------------------------------------"
echo "$ pnpm add react react-dom"
echo "Packages: +2"
echo "Progress: resolved 5, reused 4, downloaded 1, added 2, done"
echo ""
echo "dependencies:"
echo "  react 18.2.0"
echo "  react-dom 18.2.0"
echo ""
echo "说明：pnpm add 会同时更新 package.json 和 pnpm-lock.yaml。"
echo "若 store 已有该包，会显示 'reused' 而非 'downloaded'。"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "  小结：corepack + packageManager 字段 = 团队版本一致性"
echo "════════════════════════════════════════════════════════════"`,
  },

  // =========================================================
  // 第三章：package.json 详解
  // =========================================================
  {
    id: "pnpm-package-json",
    title: "package.json 详解",
    icon: "📄",
    group: "基础与安装",
    content: `## package.json 是什么

\`package.json\` 是每个 Node.js 项目的"身份证"——它声明了项目的基本信息、入口、脚本、依赖、运行环境要求等。npm/yarn/pnpm 三大包管理器都把它作为唯一的依赖真相来源（source of truth）。理解每个字段的含义，是写好 Node.js 项目的基础。

本章按"必填字段 → 依赖字段 → pnpm 特有字段 → 现代字段"的顺序逐一拆解。

### 核心必填字段

#### name（包名）

\`\`\`json
{
  "name": "my-awesome-lib"
}
\`\`\`

- 必须小写，可用 \`-\` 或 \`_\` 分隔，但不能以 \`.\` 或 \`_\` 开头。
- 发布到 npm 时必须全局唯一；私有项目随意。
- 长度建议 ≤ 214 字符。

#### version（版本）

\`\`\`json
{
  "version": "1.2.3"
}
\`\`\`

遵循 **semver**（语义化版本）：\`主版本.次版本.修订版本\`（Major.Minor.Patch）。

- **Major**：不兼容的 API 变更（breaking change）。
- **Minor**：向后兼容的新功能。
- **Patch**：向后兼容的 bug 修复。

#### description / keywords / author / license

\`\`\`json
{
  "description": "一个超棒的库",
  "keywords": ["react", "ui", "components"],
  "author": "Zhang San <zhangsan@example.com>",
  "license": "MIT"
}
\`\`\`

这些字段主要服务于 npm 搜索和包页面展示。发布开源库时建议都填上。\`license\` 务必明确（MIT/Apache-2.0/ISC 最常见），否则别人不敢用。

### 入口与脚本字段

#### main / module / types

\`\`\`json
{
  "main": "dist/index.js",        // CommonJS 入口
  "module": "dist/index.mjs",     // ESM 入口（ bundler 优先用这个）
  "types": "dist/index.d.ts"      // TypeScript 类型入口
}
\`\`\`

- \`main\`：Node.js 默认入口（CommonJS）。
- \`module\`：ESM 入口，webpack/vite/rollup 等打包器优先使用。
- \`types\`：TS 类型定义文件路径，IDE 智能提示靠它。

现代库通常三个都填，配合 \`exports\` 字段做更精细的入口分发。

#### scripts（脚本）

\`\`\`json
{
  "scripts": {
    "build": "vite build",
    "dev": "vite",
    "test": "vitest",
    "lint": "eslint ."
  }
}
\`\`\`

定义可通过 \`pnpm run <name>\` 执行的命令。详见第四章。

### 依赖字段（核心）

这是 package.json 最重要、最容易出错的部分。Node.js 有四种依赖，分别用于不同场景。

#### dependencies（运行时依赖）

项目**运行时**必须的包。比如 React 应用里的 \`react\`、\`react-dom\`——没有它们应用就跑不起来。安装命令：

\`\`\`bash
pnpm add react react-dom
\`\`\`

发布到 npm 后，别人 \`pnpm add your-lib\` 时会自动装上这些依赖。

#### devDependencies（开发时依赖）

只在**开发阶段**需要、运行时不需要的包。比如 \`vite\`、\`typescript\`、\`eslint\`、\`vitest\`、\`@types/*\`。安装命令：

\`\`\`bash
pnpm add -D vite typescript eslint
\`\`\`

别人装你的库时**不会**自动装 devDependencies（避免污染他们的项目）。这是 dependencies 和 devDependencies 的本质区别。

#### peerDependencies（同版本依赖）

"我希望使用者已经装了某包，并且版本和我兼容"——典型场景是 React 组件库：

\`\`\`json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  }
}
\`\`\`

意思是：用我的库，你必须自己装 react，且版本 ≥16.8。库本身不会再次安装 react（避免装多份导致 hooks 报错）。pnpm 默认 \`strict-peer-dependencies=false\`，会自动安装 peer 但不强制版本。

#### optionalDependencies（可选依赖）

可选的依赖——装不上也不报错。比如某包在 Linux 上依赖 \`fsevents\`（macOS 专属），就放这里：

\`\`\`json
{
  "optionalDependencies": {
    "fsevents": "^2.3.2"
  }
}
\`\`\`

#### 四种依赖对比

| 字段 | 何时需要 | 别人安装时 | 安装命令 |
| --- | --- | --- | --- |
| \`dependencies\` | 运行时必需 | 自动安装 | \`pnpm add\` |
| \`devDependencies\` | 仅开发时 | 不安装 | \`pnpm add -D\` |
| \`peerDependencies\` | 使用者已有 | 不安装（需用户保证） | 手动写 |
| \`optionalDependencies\` | 锦上添花 | 安装失败不报错 | \`pnpm add -O\` |

### 版本范围：semver 语法

依赖字段里的版本号通常是"范围"而非"精确版本"。pnpm 完全支持 npm 的 semver 语法：

| 写法 | 含义 | 示例 |
| --- | --- | --- |
| \`1.2.3\` | 精确版本 | 只装 1.2.3 |
| \`^1.2.3\` | 兼容主版本（最常用） | ≥1.2.3 且 <2.0.0 |
| \`~1.2.3\` | 兼容次版本 | ≥1.2.3 且 <1.3.0 |
| \`\>=1.2.3\` | 大于等于 | ≥1.2.3 |
| \`>1.2.3 <2.0.0\` | 范围 | 1.2.3 ~ 1.99.99 |
| \`1.2.x\` | x 代表任意 | 1.2.0 ~ 1.2.9 |
| \`latest\` | 最新版本 | 最新发布 |
| \`*\` | 任意版本 | 不推荐，太宽 |

**\`^\` vs \`~\` 的关键区别**：

- \`^1.2.3\`：锁主版本，允许 minor 和 patch 升级。**npm/pnpm 默认用这个**。
- \`~1.2.3\`：锁主+次版本，只允许 patch 升级。更保守。

> **陷阱**：\`^0.x.y\` 比较特殊——0.x 版本视为"开发期"，任何变更都可能 breaking，所以 \`^0.2.3\` 只允许 ≥0.2.3 且 <0.3.0（不跨 minor）。同理 \`^0.0.3\` 只匹配 0.0.3。

实际项目中，lockfile（\`pnpm-lock.yaml\`）会锁定具体版本，semver 范围只是"能接受哪些版本"。CI 必须用 lockfile 保证可复现。

### engines（运行环境限制）

\`\`\`json
{
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=9.0.0"
  }
}
\`\`\`

声明项目需要的 Node/pnpm 版本。pnpm 默认会检查 \`engines.node\`，不匹配会警告（不报错）。要强制可设 \`.npmrc\`：

\`\`ini
engine-strict=true
\`\`

### packageManager（包管理器锁定）

\`\`\`json
{
  "packageManager": "pnpm@9.12.0"
}
\`\`\`

这是 Node 16.9+ corepack 识别的字段。corepack 会按这个字段自动切换 pnpm 版本。强烈建议每个项目都加。

### exports（现代模块解析）

\`exports\` 是 Node 12+ 引入的字段，用来精确控制"哪些子路径能被导入、用什么入口"。比 \`main\` 强大得多：

\`\`\`json
{
  "name": "my-lib",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    },
    "./package.json": "./package.json"
  }
}
\`\`\`

- \`.\`：包根入口（\`require('my-lib')\`）。
- \`./utils\`：子路径入口（\`require('my-lib/utils')\`）。
- 没在 \`exports\` 里声明的子路径**不能访问**（封装性更强）。
- \`types\` / \`import\` / \`require\` 按解析器类型分发入口。

现代库基本都用 \`exports\` 取代 \`main\` + \`module\`。

### type（模块系统）

\`\`\`json
{ "type": "module" }
\`\`\`

- \`"module"\`：项目所有 \`.js\` 文件按 ESM 解析（支持 \`import/export\`）。
- \`"commonjs"\`（默认）：\`.js\` 按 CommonJS 解析（\`require/module.exports\`）。
- 想混用可用扩展名：\`.cjs\` 强制 CJS，\`.mjs\` 强制 ESM。

### bin（CLI 工具入口）

\`\`\`json
{
  "name": "my-cli",
  "bin": {
    "mycli": "./dist/cli.js"
  }
}
\`\`\`

发布后，全局安装会自动在 PATH 里创建 \`mycli\` 命令，指向 \`./dist/cli.js\`。\`./dist/cli.js\` 必须有 shebang：\`#!/usr/bin/env node\`。

### files（发布时包含的文件）

\`\`\`json
{
  "files": ["dist", "README.md", "LICENSE"]
}
\`\`\`

白名单机制：只有列出的文件/目录会被打包进发布版本。比 \`npmignore\` 更明确。默认总是包含 \`package.json\`、\`README*\`、\`LICENSE*\`、\`CHANGELOG*\`。

### pnpm 特有字段

#### pnpm.overrides（覆盖依赖版本）

强制把某个间接依赖锁定到特定版本，常用于"上游有 bug 我先 pin 一个能用的版本"：

\`\`\`json
{
  "pnpm": {
    "overrides": {
      "lodash": "4.17.21",
      "react-dom@18": {
        "scheduler": "0.23.0"
      }
    }
  }
}
\`\`\`

#### pnpm.patchedDependencies（打补丁）

某个上游依赖有 bug 但作者没修，可以打补丁：

\`\`\`json
{
  "pnpm": {
    "patchedDependencies": {
      "react@18.2.0": "patches/react@18.2.0.patch"
    }
  }
}
\`\`\`

配合 \`pnpm patch react@18.2.0\` 命令生成补丁文件。补丁随项目版本管理，团队成员自动应用。

### pnpm 对 package.json 的严格检查

pnpm 比 npm/yarn 更严格：

- **peerDependencies 默认自动安装**（\`auto-install-peers=true\`），但若版本冲突会报警。
- **engines 检查更严**：\`engine-strict=true\` 时版本不符直接拒绝安装。
- **未声明依赖直接报错**：源码 \`require\` 了 package.json 没声明的包，pnpm 会拦下（严格隔离）。
- **包名大小写敏感**：\`React\` 和 \`react\` 在 pnpm 看来是不同的（npm 会去重，导致 bug）。

### 小结

\`package.json\` 是 Node.js 项目的核心配置，掌握它需要理解：四种依赖的区别（dependencies/dev/peer/optional）、semver 范围语法（\`^\` vs \`~\`）、现代字段（\`exports\`/\`type\`/\`packageManager\`）、pnpm 特有字段（\`pnpm.overrides\`/\`patchedDependencies\`）。建议每个项目都加 \`packageManager\` 字段锁定 pnpm 版本，用 lockfile 保证可复现安装。下一章讲脚本与生命周期。`,
    code: `#!/usr/bin/env bash
# ============================================================
# 第三章演示：package.json 详解 —— 模拟字段效果
# ------------------------------------------------------------
# 注意：沙箱环境未安装真实 pnpm，以下输出均为 echo 模拟，
# 标注为"模拟输出"，展示真实命令的典型输出格式。
# ============================================================

set -e

echo "════════════════════════════════════════════════════════════"
echo "  package.json 详解演示（模拟输出）"
echo "════════════════════════════════════════════════════════════"
echo ""

# ------------------------------------------------------------
# 1. 展示一个完整的 package.json 示例
# ------------------------------------------------------------
echo "【1】完整的 package.json 示例（带字段注释）"
echo "------------------------------------------------------------"
cat <<'EOF'
{
  // === 基础信息 ===
  "name": "my-awesome-lib",          // 包名（小写、唯一）
  "version": "1.2.3",                 // 语义化版本 Major.Minor.Patch
  "description": "一个超棒的库",      // npm 搜索展示用
  "keywords": ["react", "ui"],        // 关键字
  "author": "Zhang San <zs@example.com>",
  "license": "MIT",                   // 必须明确，否则别人不敢用

  // === 入口 ===
  "main": "dist/index.cjs",           // CommonJS 入口
  "module": "dist/index.mjs",         // ESM 入口（bundler 优先）
  "types": "dist/index.d.ts",         // TS 类型入口
  "exports": {                        // 现代模块解析（推荐）
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },

  // === 脚本 ===
  "scripts": {
    "build": "vite build",
    "dev": "vite",
    "test": "vitest",
    "lint": "eslint ."
  },

  // === 依赖 ===
  "dependencies": {                   // 运行时必需（别人装你会带上）
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {                // 仅开发时（别人装你不带）
    "vite": "^5.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  },
  "peerDependencies": {               // 使用者必须已有
    "react": ">=16.8.0"
  },
  "optionalDependencies": {           // 可选，装不上不报错
    "fsevents": "^2.3.2"
  },

  // === 环境与工具 ===
  "engines": {                        // 限制运行环境
    "node": ">=18.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.12.0",    // corepack 锁定版本
  "type": "module",                   // ESM 模式
  "bin": {                            // CLI 入口
    "mycli": "./dist/cli.js"
  },
  "files": [                          // 发布白名单
    "dist", "README.md", "LICENSE"
  ],

  // === pnpm 特有 ===
  "pnpm": {
    "overrides": {                    // 强制覆盖依赖版本
      "lodash": "4.17.21"
    },
    "patchedDependencies": {          // 补丁
      "react@18.2.0": "patches/react@18.2.0.patch"
    }
  }
}
EOF
echo ""

# ------------------------------------------------------------
# 2. semver 范围解析演示
# ------------------------------------------------------------
echo "【2】semver 版本范围解析"
echo "------------------------------------------------------------"
printf "%-15s %-30s %-25s\\n" "写法" "含义" "匹配示例（1.x 系列）"
printf "%-15s %-30s %-25s\\n" "----" "----" "----------------------"
printf "%-15s %-30s %-25s\\n" "1.2.3"  "精确版本"                    "仅 1.2.3"
printf "%-15s %-30s %-25s\\n" "^1.2.3" "≥1.2.3 且 <2.0.0（默认）"    "1.2.3 / 1.5.0 / 1.99.9"
printf "%-15s %-30s %-25s\\n" "~1.2.3" "≥1.2.3 且 <1.3.0"            "1.2.3 / 1.2.9"
printf "%-15s %-30s %-25s\\n" ">=1.2.3" "≥1.2.3（无上限）"            "1.2.3 / 2.0.0 / 3.5.0"
printf "%-15s %-30s %-25s\\n" "1.2.x"  "1.2.0 ~ 1.2.9"               "1.2.0 / 1.2.5"
printf "%-15s %-30s %-25s\\n" "latest" "最新发布版本"                 "当前最新（动态）"
echo ""
echo "陷阱：^0.2.3 视为开发期，只匹配 ≥0.2.3 且 <0.3.0（不跨 minor）"
echo ""

# ------------------------------------------------------------
# 3. dependencies vs devDependencies 安装差异
# ------------------------------------------------------------
echo "【3】dependencies vs devDependencies 安装差异"
echo "------------------------------------------------------------"
echo "场景：发布库 my-lib，使用者执行 pnpm add my-lib"
echo ""
echo "若 lodash 在 dependencies:"
echo "  → 使用者项目自动装上 lodash"
echo "  → 包体积变大，但 my-lib 运行时能找到 lodash"
echo ""
echo "若 lodash 在 devDependencies:"
echo "  → 使用者项目不装 lodash"
echo "  → my-lib 运行时报错（Cannot find module 'lodash'）"
echo ""
echo "经验法则："
echo "  • 运行时代码 require/import 的包 → dependencies"
echo "  • 仅 build/test/lint/类型 用的包 → devDependencies"
echo "  • 库的 peer（react 之类） → peerDependencies"
echo ""

# ------------------------------------------------------------
# 4. packageManager 字段锁定版本
# ------------------------------------------------------------
echo "【4】packageManager 字段的效果"
echo "------------------------------------------------------------"
echo '// package.json: { "packageManager": "pnpm@9.12.0" }'
echo ""
echo "corepack 行为：读取字段 → 自动下载对应版本 → 用该版本执行"
echo "好处：所有人版本一致，告别 '我这能跑你那不能跑'。"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "  小结：dependencies 是运行时必需，devDep 是开发用，"
echo "        peerDep 是使用者已有，exports 控制入口分发。"
echo "════════════════════════════════════════════════════════════"`,
  },

  // =========================================================
  // 第四章：脚本与生命周期
  // =========================================================
  {
    id: "pnpm-scripts",
    title: "脚本与生命周期",
    icon: "📜",
    group: "基础与安装",
    content: `## scripts 字段：自定义命令

\`package.json\` 的 \`scripts\` 字段是 Node.js 工程化的核心——它把项目里所有"需要重复执行的命令"（构建、测试、启动、lint、部署）封装成简短的名字，团队成员只需记住 \`pnpm build\` 而不用记 \`vite build --mode production --emptyOutDir\` 这种长命令。

\`\`\`json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit"
  }
}
\`\`\`

### 执行脚本：pnpm run

最标准的执行方式：

\`\`\`bash
pnpm run build
pnpm run test
\`\`\`

\`pnpm run <script>\` 会：

1. 在 PATH 里临时加入 \`node_modules/.bin\`，所以能直接调用项目装的 CLI（\`vite\`、\`eslint\` 等）。
2. 执行 \`scripts.build\` 字段对应的命令。
3. 执行完毕后恢复 PATH。

### 简写：pnpm <script>

pnpm 对一部分"常用脚本名"做了简写——可以省略 \`run\`：

\`\`\`bash
pnpm build       # 等价于 pnpm run build
pnpm test        # 等价于 pnpm run test
pnpm start       # 等价于 pnpm run start
pnpm dev         # 等价于 pnpm run dev（pnpm 9+ 支持）
\`\`\`

简写仅对**自定义脚本中以下名字**有效：\`build\`、\`dev\`、\`start\`、\`test\`、\`install\`、\`publish\` 等内置命令名之外的脚本。其他名字（比如 \`typecheck\`）必须用 \`pnpm run typecheck\`。

> **建议**：为了可读性和一致性，团队规范里推荐统一用 \`pnpm run <script>\`，避免新人困惑哪些能简写哪些不能。

### 生命周期脚本：pre / post 钩子

npm/pnpm 都支持"生命周期钩子"——在某个脚本执行前后自动跑另外的脚本。规则是：**在脚本名前加 \`pre\` 或 \`post\` 前缀**。

\`\`\`json
{
  "scripts": {
    "prebuild": "echo '构建开始...' && pnpm run clean",
    "build": "vite build",
    "postbuild": "echo '构建完成' && pnpm run deploy",
    "clean": "rm -rf dist"
  }
}
\`\`\`

执行 \`pnpm build\` 时，pnpm 会自动按顺序执行：

1. \`prebuild\`（构建前清理）
2. \`build\`（实际构建）
3. \`postbuild\`（构建后部署）

#### 安装生命周期

pnpm 在 \`pnpm install\` 时会依次触发：

\`\`\`json
{
  "scripts": {
    "preinstall":  "echo '安装前'",
    "install":     "echo '安装中（少用）'",
    "postinstall": "echo '安装后，常用于构建 native 模块'",
    "prepare":     "echo 'install 后 / git install 后都会跑'"
  }
}
\`\`\`

**完整顺序**：

1. \`preinstall\`
2. \`install\`（极少手写）
3. \`postinstall\`（最常用，比如 \`husky install\`、\`prisma generate\`）
4. \`prepare\`（\`pnpm install\` 后和 \`git install\` 后都会跑，常用于构建待发布文件）

> **陷阱**：\`postinstall\` 脚本会在每次 \`pnpm install\` 后执行——如果脚本本身又触发 \`install\`，会陷入死循环。pnpm 对此有保护，但写脚本时要小心。

### 并行执行：pnpm -r run（递归）

在 monorepo 里，\`pnpm -r run build\` 会**并行**执行所有工作区包的 \`build\` 脚本：

\`\`\`bash
pnpm -r run build
\`\`\`

\`-r\` 表示 recursive（递归），pnpm 会遍历 \`pnpm-workspace.yaml\` 里所有包，并发执行它们的 \`build\` 脚本。这是 pnpm 在 monorepo 场景的核心优势之一——npm 的 \`npm run build --workspaces\` 性能远不如 pnpm。

### 串行执行：pnpm --filter

需要按"依赖顺序"构建时（A 依赖 B，必须先构建 B），用 \`--filter\`：

\`\`\`bash
# 只构建 @my/app 及其依赖的包
pnpm --filter @my/app... run build

# 构建指定包
pnpm --filter @my/utils run build

# 构建所有自上次 git 变更以来受影响的包
pnpm --filter ...[origin/main] run build
\`\`\`

\`--filter @my/app...\` 末尾的 \`...\` 表示"包括 @my/app 的所有依赖"。pnpm 会按拓扑顺序串行执行，保证被依赖的包先构建。

### pnpm exec vs pnpm run

容易混淆的两个命令：

- \`pnpm run <script>\`：执行 \`package.json\` 里 \`scripts\` 字段定义的脚本。
- \`pnpm exec <cmd>\`：在项目环境下执行**任意命令**（不需要在 scripts 里声明），同样会把 \`node_modules/.bin\` 加进 PATH。

\`\`\`bash
# 执行项目里装的 eslint，但不想把它加进 scripts
pnpm exec eslint src/

# 等价于（pnpm 会自动找 node_modules/.bin/eslint）
\`\`\`

\`pnpm exec\` 类似 \`npx\`，但只执行项目内已安装的命令，不会临时下载。

### pnpm dlx：临时执行包（不安装）

\`pnpm dlx\`（download and execute）是 \`npx\` 的 pnpm 等价物——**临时下载并执行某个包，不污染项目依赖**：

\`\`\`bash
# 一次性执行 create-vite 创建项目
pnpm dlx create-vite my-app --template react

# 一次性执行 cowsay
pnpm dlx cowsay "hello pnpm"

# 用指定版本的包
pnpm dlx -p cowsay@1.5.0 cowsay "versioned"
\`\`\`

\`dlx\` 把包下载到一个临时目录，执行完即丢。常用于脚手架（\`create-vite\`、\`create-react-app\`、\`create-next-app\`）和一次性 CLI 工具。

### 环境变量

pnpm 执行脚本时会注入一系列环境变量，脚本里可以直接用：

| 环境变量 | 含义 |
| --- | --- |
| \`npm_package_name\` | 当前包名 |
| \`npm_package_version\` | 当前包版本 |
| \`npm_lifecycle_event\` | 当前生命周期脚本名（如 \`postinstall\`） |
| \`npm_config_user_agent\` | 包管理器标识（\`pnpm/9.12.0\`） |
| \`npm_config_registry\` | 当前 registry URL |
| \`INIT_CWD\` | 执行命令时的当前目录 |

\`\`\`json
{
  "scripts": {
    "echo-version": "echo $npm_package_name@$npm_package_version"
  }
}
\`\`\`

### 跨平台脚本问题

脚本是 bash 语法，在 Windows 上可能跑不通。典型问题：

- \`rm -rf dist\` 在 Windows 失败（应用 \`rimraf\`）。
- \`cp src/a dist/b\` 在 Windows 失败（应用 \`cpx\` 或 \`shx\`）。
- \`NODE_ENV=production vite build\` 在 Windows 失败（环境变量赋值语法不同）。

**解决方案**：用 [\`cross-env\`](https://www.npmjs.com/package/cross-env) 设置环境变量，用 [\`rimraf\`](https://www.npmjs.com/package/rimraf) 替代 \`rm -rf\`，用 [\`shx\`](https://www.npmjs.com/package/shx) 提供 Unix 命令的跨平台版本：

\`\`\`json
{
  "scripts": {
    "clean": "rimraf dist",
    "build": "cross-env NODE_ENV=production vite build",
    "copy": "shx cp src/a dist/b"
  }
}
\`\`\`

### 串联命令：&& 与 pnpm run

同一个脚本里串多个命令用 \`&&\`（前一个成功才跑下一个）：

\`\`\`json
{
  "scripts": {
    "ci": "pnpm run lint && pnpm run typecheck && pnpm run test && pnpm run build"
  }
}
\`\`\`

并行的写法（pnpm 9+ 内置 \`pnpm run --parallel\`，或用 [\`npm-run-all\`](https://www.npmjs.com/package/npm-run-all)）：

\`\`\`json
{
  "scripts": {
    "dev": "run-p dev:*",
    "dev:web": "vite",
    "dev:api": "nodemon server.js"
  }
}
\`\`\`

### 小结

\`scripts\` 是项目命令的统一入口。掌握它需要理解：\`pnpm run\` 与简写的区别、\`pre/post\` 生命周期钩子、\`-r\` 递归并行与 \`--filter\` 拓扑串行、\`pnpm exec\` 执行项目内命令、\`pnpm dlx\` 临时执行外部包、跨平台用 \`cross-env\`/\`rimraf\`/\`shx\`。下一章讲 .npmrc 配置。`,
    code: `#!/usr/bin/env bash
# ============================================================
# 第四章演示：脚本与生命周期 —— 模拟 pnpm 脚本执行
# ------------------------------------------------------------
# 注意：沙箱环境未安装真实 pnpm，以下输出均为 echo 模拟，
# 标注为"模拟输出"，展示真实命令的典型输出格式。
# ============================================================

set -e

echo "════════════════════════════════════════════════════════════"
echo "  pnpm 脚本与生命周期演示（模拟输出）"
echo "════════════════════════════════════════════════════════════"
echo ""

# ------------------------------------------------------------
# 1. 展示一个带丰富 scripts 的 package.json
# ------------------------------------------------------------
echo "【1】带丰富 scripts 的 package.json"
echo "------------------------------------------------------------"
cat <<'EOF'
{
  "name": "my-app",
  "scripts": {
    "dev":        "vite",
    "build":      "vite build",
    "preview":    "vite preview",
    "test":       "vitest run",
    "test:watch": "vitest",
    "lint":       "eslint . --ext .ts,.tsx",
    "format":     "prettier --write .",
    "typecheck":  "tsc --noEmit",
    "clean":      "rimraf dist",
    "prebuild":   "pnpm run clean",
    "postbuild":  "echo '构建完成'",
    "preinstall": "echo '开始安装...'",
    "postinstall":"husky install",
    "prepare":    "pnpm run build",
    "ci":         "pnpm lint && pnpm typecheck && pnpm test && pnpm build"
  }
}
EOF
echo ""

# ------------------------------------------------------------
# 2. 模拟 pnpm run build（含 prebuild/postbuild 钩子）
# ------------------------------------------------------------
echo "【2】执行 pnpm run build（自动触发 pre/post 钩子）"
echo "------------------------------------------------------------"
echo "$ pnpm run build"
echo ""
echo "> my-app@1.0.0 prebuild"
echo "> pnpm run clean"
echo ""
echo "> my-app@1.0.0 clean"
echo "> rimraf dist"
echo "✓ 已删除 dist 目录"
echo ""
echo "> my-app@1.0.0 build"
echo "> vite build"
echo "vite v5.0.0 building for production..."
echo "✓ 142 modules transformed."
echo "dist/index.html                  0.46 kB
dist/assets/index-a1b2c3d4.css    12.34 kB
dist/assets/index-e5f6g7h8.js    178.90 kB │ gzip: 56.78 kB
✓ built in 1.23s"
echo ""
echo "> my-app@1.0.0 postbuild"
echo "> echo '构建完成'"
echo "构建完成"
echo ""
echo "执行顺序：prebuild → build → postbuild（自动）"
echo ""

# ------------------------------------------------------------
# 3. 模拟 pnpm dlx cowsay
# ------------------------------------------------------------
echo "【3】pnpm dlx 临时执行包：pnpm dlx cowsay 'hello'"
echo "------------------------------------------------------------"
echo "$ pnpm dlx cowsay 'hello pnpm'"
echo "  Downloading cowsay@1.5.0 ..."
echo "  Resolved 3 packages in 0.8s"
echo "  Running cowsay..."
echo ""
cat <<'EOF'
 _____________
< hello pnpm >
 -------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
EOF
echo ""
echo "说明：dlx 把包下载到临时目录执行，不污染项目依赖。"
echo "适合脚手架工具：pnpm dlx create-vite my-app --template react"
echo ""

# ------------------------------------------------------------
# 4. 模拟 pnpm -r run test（并行）
# ------------------------------------------------------------
echo "【4】monorepo 并行执行：pnpm -r run test"
echo "------------------------------------------------------------"
echo "$ pnpm -r run test"
echo ""
echo "Scope: 3 of 4 packages"
echo ""
echo "@my/utils:test  | vitest run"
echo "  ✓ src/math.test.ts (3 tests) ... passed"
echo "  Test Files  1 passed (1)"
echo "      Tests  3 passed (3)"
echo ""
echo "@my/api:test    | vitest run    （并行，与 utils 同时跑）"
echo "  ✓ src/handler.test.ts (5 tests) ... passed"
echo "  Test Files  1 passed (1) | Tests  5 passed (5)"
echo ""
echo "@my/app:test    | vitest run    （并行）"
echo "  ✓ src/App.test.tsx (8 tests) ... passed"
echo "  Test Files  1 passed (1) | Tests  8 passed (8)"
echo ""
echo "说明：-r 递归所有工作区，并发执行 test 脚本，速度远超串行。"
echo ""

# ------------------------------------------------------------
# 5. 模拟 --filter 拓扑串行构建
# ------------------------------------------------------------
echo "【5】按依赖顺序构建：pnpm --filter @my/app... run build"
echo "------------------------------------------------------------"
echo "$ pnpm --filter @my/app... run build"
echo ""
echo "解析依赖图：@my/app → @my/ui → @my/utils"
echo "构建顺序（拓扑序）："
echo ""
echo "1/3 @my/utils:build  → vite build ... ✓ built in 0.8s"
echo "2/3 @my/ui:build     → vite build ... ✓ built in 1.1s （等 utils 完成）"
echo "3/3 @my/app:build    → vite build ... ✓ built in 1.5s （等 ui 完成）"
echo ""
echo "说明：'...' 表示包含 @my/app 及其所有依赖。"
echo "       pnpm 自动按依赖图拓扑序串行执行，避免构建顺序错误。"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "  小结：pre/post 自动钩子，-r 并行，--filter 拓扑串行，"
echo "        exec 跑项目内命令，dlx 临时跑外部包。"
echo "════════════════════════════════════════════════════════════"`,
  },

  // =========================================================
  // 第五章：配置与 .npmrc
  // =========================================================
  {
    id: "pnpm-config",
    title: "配置与 .npmrc",
    icon: "⚙️",
    group: "基础与安装",
    content: `## 配置文件优先级

pnpm 完全兼容 npm 的 \`.npmrc\` 配置文件格式，并支持四级配置层级。从高到低优先级为：

1. **命令行参数**：\`pnpm install --shamefully-hoist\`，临时覆盖，最高优先级。
2. **项目 .npmrc**：项目根目录的 \`.npmrc\` 文件，跟随项目走，团队共享。
3. **用户 ~/.npmrc**：用户主目录的 \`.npmrc\`，本机所有项目默认。
4. **全局 /etc/npmrc**：系统级，极少用。

优先级高的覆盖低的——比如项目 \`.npmrc\` 写 \`registry=https://registry.npmmirror.com\`，用户 \`.npmrc\` 写 \`registry=https://registry.npmjs.org\`，最终用项目的（npmmirror）。

> **最佳实践**：与项目相关的配置（registry、strict-peer-dependencies、shamefully-hoist 等）写进项目 \`.npmrc\`，提交到 git；个人偏好（比如全局 token、代理）写进 \`~/.npmrc\`，不提交。

### .npmrc 常用配置

\`\`\`ini
# === 镜像源 ===
registry=https://registry.npmmirror.com

# === 依赖严格性 ===
strict-peer-dependencies=false     # 默认 false，peer 冲突时仅警告
auto-install-peers=true            # 默认 true，自动安装 peer 依赖
shamefully-hoist=false             # 默认 false，详见下文

# === 性能 ===
prefer-frozen-lockfile=true        # CI 推荐，严格按 lockfile 安装
network-concurrency=16             # 网络并发数，默认 16

# === node-linker 模式 ===
node-linker=isolated                # 默认，pnpm 风格严格隔离

# === 提升模式 ===
public-hoist-pattern[]=*eslint*
hoist-pattern[]=*types*
\`\`\`

### shamefully-hoist：兼容性逃生舱

pnpm 的"严格依赖"是优点，但也是迁移老项目的拦路虎——很多老库写于 npm 扁平化时代，偷偷用了未声明的依赖，pnpm 直接拦下报错。这时可以用 \`shamefully-hoist=true\`：

\`\`\`ini
shamefully-hoist=true
\`\`\`

效果：把所有依赖（包括间接依赖）**像 npm 那样扁平地提升到 node_modules 顶层**，等同于退化成 npm 的行为。这样老库能跑了，但代价是：

- **失去严格依赖保护**：幽灵依赖问题重新出现。
- **node_modules 结构变化**：不再是 pnpm 的 \` .pnpm + 符号链接\` 模型。

> **建议**：\`shamefully-hoist=true\` 只用于过渡期或临时绕开问题，长期应该修复"未声明依赖"的根因。某些工具链（比如老版本 webpack、Electron）确实需要它，能不用就不用。

更精细的 \`public-hoist-pattern\` 可以只提升特定包，而不是全部提升：

\`\`\`ini
# 只把 eslint、prettier 相关包提升到顶层（供 IDE 用）
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
\`\`\`

### node-linker：三种 node_modules 模型

pnpm 支持三种 \`node-linker\`，决定 \`node_modules\` 的物理结构：

| node-linker | 模型 | 适用场景 |
| --- | --- | --- |
| \`isolated\`（默认） | pnpm 严格隔离 + 符号链接 | pnpm 标准模式，推荐 |
| \`hoisted\` | npm 扁平化 | 兼容老项目（等价 shamefully-hoist 全开） |
| \`pnp\` | yarn PnP（无 node_modules） | yarn pnp 项目迁移 |

\`\`\`ini
# 切换为 npm 风格扁平结构
node-linker=hoisted
\`\`\`

> 一般无需切换。只在迁移老项目遇到不可解的依赖问题时才考虑 \`hoisted\`。

### public-hoist-pattern 与 hoist-pattern

这两个配置控制"哪些包被提升到顶层"——区别在于提升到哪一层：

- \`public-hoist-pattern\`：提升到 \`node_modules/<pkg>\`（应用代码可见，可被 require）。
- \`hoist-pattern\`：提升到 \`node_modules/.pnpm/node_modules/<pkg>\`（仅间接依赖可见，应用代码不可见）。

默认值：

\`\`\`ini
public-hoist-pattern[]=*types*       # 类型包提升到顶层（IDE 能识别）
public-hoist-pattern[]=*eslint*      # eslint 提升到顶层
public-hoist-pattern[]=*prettier*
\`\`\`

### 配置镜像源

国内开发必备，三种写法：

\`\`\`bash
# 1. 写进 ~/.npmrc（全局）
pnpm config set registry https://registry.npmmirror.com

# 2. 写进项目 .npmrc（团队共享）
echo 'registry=https://registry.npmmirror.com' > .npmrc

# 3. 命令行临时指定
pnpm install --registry=https://registry.npmmirror.com
\`\`\`

常用镜像：

| 名称 | URL |
| --- | --- |
| npmmirror（淘宝） | \`https://registry.npmmirror.com\` |
| tencent | \`https://mirrors.cloud.tencent.com/npm/\` |
| 官方 | \`https://registry.npmjs.org\` |

### 配置认证（私有 registry）

发布到私有 npm registry（比如公司内部 nexus / verdaccio）需要配置 token：

\`\`\`ini
# .npmrc
registry=https://npm.company.com/
//npm.company.com/:_authToken=xxxx-xxxx-xxxx-xxxx
always-auth=true
\`\`\`

> **安全警告**：\`_authToken\` 是敏感信息，**不要提交到 git**！项目级 \`.npmrc\` 只写 registry，token 写进 \`~/.npmrc\` 或用环境变量：

\`\`\`ini
# .npmrc（提交）
registry=https://npm.company.com/

# 环境变量（CI 配置，不提交）
# export NPM_TOKEN=xxxx-xxxx-xxxx-xxxx
\`\`\`

\`\`\`ini
# ~/.npmrc（本机，不提交）
//npm.company.com/:_authToken=\${NPM_TOKEN}
\`\`\`

### pnpm config 命令

\`\`\`bash
# 读取配置
pnpm config get registry
pnpm config get strict-peer-dependencies

# 设置配置（默认写入用户 ~/.npmrc）
pnpm config set registry https://registry.npmmirror.com
pnpm config set strict-peer-dependencies true

# 写入项目 .npmrc（带 --location=project）
pnpm config set strict-peer-dependencies true --location=project

# 删除配置
pnpm config delete shamefully-hoist

# 列出所有配置
pnpm config list
pnpm config list -l    # 包含默认值
\`\`\`

### 常见配置场景

| 场景 | 配置 |
| --- | --- |
| 国内加速 | \`registry=https://registry.npmmirror.com\` |
| CI 严格安装 | \`prefer-frozen-lockfile=true\` + \`--frozen-lockfile\` |
| 老项目兼容 | \`shamefully-hoist=true\` |
| 私有 registry | \`registry=...\` + \`_authToken=...\` |
| 自动装 peer | \`auto-install-peers=true\`（默认就是） |
| 严格 peer 检查 | \`strict-peer-dependencies=true\` |
| 限制 Node 版本 | \`engine-strict=true\` |
| 跳过 scripts | \`ignore-scripts=true\`（安全考虑） |
| 调试依赖解析 | \`loglevel=debug\` |

### 陷阱与最佳实践

#### 陷阱 1：.npmrc 提交了 token

新人常把 \`_authToken\` 写进项目 \`.npmrc\` 提交到 git，导致泄露。**项目 \`.npmrc\` 只写非敏感配置**，token 用环境变量或 \`~/.npmrc\`。

#### 陷阱 2：shamefully-hoist 滥用

遇到依赖问题就开 \`shamefully-hoist\` 是偷懒做法——它让 pnpm 退化成 npm，失去所有严格性优势。应该先尝试 \`public-hoist-pattern\` 精确提升，实在不行再考虑 \`shamefully-hoist\`。

#### 陷阱 3：用户 .npmrc 覆盖项目

团队成员 \`.npmrc\` 各不相同，可能有人 \`.npmrc\` 写了 \`shamefully-hoist=true\` 而项目没写——结果"我这能跑你那不能跑"。解决办法：项目 \`.npmrc\` 显式声明所有关键配置，不依赖默认值。

#### 最佳实践：项目 .npmrc 模板

\`\`\`ini
# 项目级 .npmrc（提交到 git）
registry=https://registry.npmmirror.com
auto-install-peers=true
strict-peer-dependencies=false
prefer-frozen-lockfile=true
engine-strict=true
\`\`\`

CI 上额外加 \`\`--frozen-lockfile\`\` 保证严格按 lockfile 安装：

\`\`\`bash
pnpm install --frozen-lockfile
\`\`\`

### 小结

\`.npmrc\` 是 pnpm 的核心配置文件，支持四级优先级。关键配置包括：\`registry\`（镜像源）、\`node-linker\`（node_modules 模型）、\`shamefully-hoist\`（兼容性逃生舱，慎用）、\`auto-install-peers\`、\`strict-peer-dependencies\`、\`prefer-frozen-lockfile\`（CI 必备）。项目级 \`.npmrc\` 提交到 git，敏感信息（token）用环境变量或 \`~/.npmrc\`。掌握这些配置，就能让 pnpm 在不同环境（本地、CI、私有 registry、老项目）下都按预期工作。`,
    code: `#!/usr/bin/env bash
# ============================================================
# 第五章演示：配置与 .npmrc —— 模拟 pnpm 配置效果
# ------------------------------------------------------------
# 注意：沙箱环境未安装真实 pnpm，以下输出均为 echo 模拟，
# 标注为"模拟输出"，展示真实命令的典型输出格式。
# ============================================================

set -e

echo "════════════════════════════════════════════════════════════"
echo "  pnpm 配置与 .npmrc 演示（模拟输出）"
echo "════════════════════════════════════════════════════════════"
echo ""

# ------------------------------------------------------------
# 1. 展示典型的 .npmrc 文件
# ------------------------------------------------------------
echo "【1】典型的项目 .npmrc 文件（带注释）"
echo "------------------------------------------------------------"
cat <<'EOF'
# === 镜像源 ===
registry=https://registry.npmmirror.com

# === 依赖严格性 ===
strict-peer-dependencies=false     # peer 冲突时仅警告（默认）
auto-install-peers=true            # 自动安装 peer 依赖（默认 true）

# === 兼容性（慎用） ===
shamefully-hoist=false             # true = 退化成 npm 扁平结构

# === 性能 ===
prefer-frozen-lockfile=true        # CI 推荐：严格按 lockfile 安装
network-concurrency=16             # 网络并发数

# === node_modules 模型 ===
node-linker=isolated               # pnpm 严格隔离（默认）

# === 精细提升（替代 shamefully-hoist） ===
public-hoist-pattern[]=*eslint*    # eslint 提升到顶层（IDE 用）
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=*types*     # @types/* 提升到顶层

# === 安全 ===
engine-strict=true                 # 严格检查 engines 字段
ignore-scripts=false               # 是否禁用生命周期脚本
EOF
echo ""

# ------------------------------------------------------------
# 2. 模拟 pnpm config get
# ------------------------------------------------------------
echo "【2】读取配置：pnpm config get registry"
echo "------------------------------------------------------------"
echo "$ pnpm config get registry"
echo "https://registry.npmmirror.com"
echo ""
echo "$ pnpm config get strict-peer-dependencies"
echo "false"
echo ""
echo "$ pnpm config get node-linker"
echo "isolated"
echo ""
echo "$ pnpm config get auto-install-peers"
echo "true"
echo ""

# ------------------------------------------------------------
# 3. 模拟 pnpm config set
# ------------------------------------------------------------
echo "【3】设置配置：pnpm config set"
echo "------------------------------------------------------------"
echo "$ pnpm config set strict-peer-dependencies true"
echo "  (无输出，表示写入 ~/.npmrc 成功)"
echo ""
echo "$ pnpm config set strict-peer-dependencies true --location=project"
echo "  (写入项目 .npmrc，会随项目提交)"
echo ""
echo "$ pnpm config delete shamefully-hoist"
echo "  (删除该配置项)"
echo ""
echo "$ pnpm config list    # 列出所有当前生效配置"
cat <<'EOF'
; "user" config from /Users/demo/.npmrc
registry = "https://registry.npmmirror.com"
strict-peer-dependencies = true

; "project" config from /Users/demo/my-app/.npmrc
node-linker = "isolated"
auto-install-peers = true
prefer-frozen-lockfile = true

; "cli" config from command line options
EOF
echo ""

# ------------------------------------------------------------
# 4. 不同 node-linker 的 node_modules 结构差异
# ------------------------------------------------------------
echo "【4】node-linker 三种模型对比"
echo "------------------------------------------------------------"
echo "[isolated]（pnpm 默认）"
echo "  node_modules/.pnpm/react@18.2.0/...  ← 真实包"
echo "  node_modules/react -> .pnpm/...      ← 符号链接"
echo "  特点：严格隔离，无幽灵依赖，节省磁盘"
echo ""
echo "[hoisted]（npm 风格扁平）"
echo "  node_modules/react/    ← 实体文件"
echo "  node_modules/lodash/   ← 即使没声明也在顶层"
echo "  特点：兼容老项目，但有幽灵依赖，磁盘占用大"
echo ""
echo "[pnp]（yarn PnP，无 node_modules）"
echo "  依赖通过 .pnp.cjs 解析，零安装体积，兼容性差"
echo ""

# ------------------------------------------------------------
# 5. 配置优先级覆盖示例
# ------------------------------------------------------------
echo "【5】配置优先级覆盖示例"
echo "------------------------------------------------------------"
echo "优先级从高到低："
echo "  ① 命令行参数      (--registry=...)      最高"
echo "  ② 项目 .npmrc     (./my-app/.npmrc)     ↓"
echo "  ③ 用户 ~/.npmrc   (~/.npmrc)            ↓"
echo "  ④ 全局 /etc/npmrc                       最低"
echo ""
echo "若无命令行参数，最终用项目级 .npmrc 的配置。"
echo ""

# ------------------------------------------------------------
# 7. CI 严格安装配置
# ------------------------------------------------------------
echo "【7】CI 环境的推荐配置"
echo "------------------------------------------------------------"
echo "项目 .npmrc（提交到 git）："
cat <<'EOF'
registry=https://registry.npmmirror.com
prefer-frozen-lockfile=true
engine-strict=true
EOF
echo ""
echo "CI 命令：pnpm install --frozen-lockfile"
echo ""
echo "效果：严格按 lockfile 安装，不一致直接报错，保证 CI 可复现"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "  小结：项目 .npmrc 提交 git，token 走环境变量，"
echo "        shamefully-hoist 慎用，CI 用 --frozen-lockfile。"
echo "════════════════════════════════════════════════════════════"`,
  },
];
