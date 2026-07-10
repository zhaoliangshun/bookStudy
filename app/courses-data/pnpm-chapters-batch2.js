// =============================================================
// pnpm 交互式教程 —— 第二批章节（共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. pnpm-dependencies  — 依赖管理
//   2. pnpm-workspace     — 工作区与 Monorepo
//   3. pnpm-overrides     — 依赖覆盖与补丁
//   4. pnpm-cache         — 缓存与 Store
//   5. pnpm-publish       — 发布与部署
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细中文讲解（4000+ 字，含动机/原理/命令详解/对比表/陷阱/最佳实践/小结）
//   code    : 可在 /api/run-shell 沙箱运行的 bash 脚本（用 echo 模拟 pnpm 输出）
//
// code 字段说明：
//   - 沙箱环境未安装 pnpm，所以 code 不能直接执行 pnpm 命令
//   - 用 echo/printf 模拟 pnpm 命令的真实输出样式
//   - 注释里会标注"模拟输出"，便于读者区分
//   - 这样代码能在沙箱里运行并产生有意义的输出
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：依赖管理
  // =========================================================
  {
    id: "pnpm-dependencies",
    title: "依赖管理",
    icon: "📥",
    group: "依赖管理与工作区",
    content: `## 依赖管理：pnpm 的核心战场

在前端工程化里，**依赖管理**是所有问题的源头——一个项目动辄几百上千个依赖，每个依赖又有自己的依赖，层层嵌套形成庞大的"依赖树"。如何高效、安全、可复现地管理这棵树，直接决定了项目的可维护性。pnpm 把这件事做到了极致，本章深入讲解 pnpm 的依赖管理命令、严格依赖模型，以及它如何解决 npm/yarn 时代的"幽灵依赖"痼疾。

### 一、为什么依赖管理是前端工程的"老大难"

#### 1. 依赖爆炸

现代前端项目的依赖数量远超直觉。一个看似简单的 Next.js 项目，\`node_modules\` 里往往躺着 **800~2000 个包**。原因：每个包又会拉进自己的依赖，呈指数级膨胀。比如 \`react\` 本身只有几个文件，但加上 \`scheduler\`、各种 \`babel\` 插件、\`webpack\` 链路，瞬间膨胀到上千个包。

#### 2. 依赖地狱的典型症状

| 症状 | 表现 | 后果 |
| --- | --- | --- |
| **幽灵依赖** | 项目里能用没在 package.json 声明的包 | 升级/删除某个包后突然报错 |
| **版本冲突** | A 要 lodash@4，B 要 lodash@3 | 行为不一致、bundle 变大 |
| **磁盘占用** | 每个项目都拷一份 node_modules | 10 个项目占几十 GB |
| **安装慢** | 每次都要重新下载 | CI 时间长、新人上手慢 |
| **不可复现** | 同一 package.json 装出不同结果 | "我这能跑"的经典甩锅 |

pnpm 针对这些问题逐一击破：**用符号链接结构消灭幽灵依赖、用内容寻址 store 节省磁盘、用 lockfile 保证复现**。

### 二、pnpm add：添加依赖

\`pnpm add <pkg>\` 是添加依赖的主命令，对应 npm 的 \`npm install <pkg>\`。

#### 基本用法

\`\`\`bash
# 添加生产依赖（写入 dependencies）
pnpm add express

# 添加开发依赖（写入 devDependencies）
pnpm add -D vitest
pnpm add --save-dev typescript

# 添加可选依赖（写入 optionalDependencies）
pnpm add -O fsevents
pnpm add --save-optional fsevents

# 精确版本（不写 ^ 前缀，写入精确版本号）
pnpm add -E lodash
pnpm add --save-exact lodash@4.17.21

# 添加全局工具
pnpm add -g pm2
pnpm add --global typescript
\`\`\`

#### 常用 flag 对比

| flag | 缩写 | 写入字段 | 版本前缀 | 典型用途 |
| --- | --- | --- | --- | --- |
| （无） | — | dependencies | \`^\` | 运行时依赖（express、react） |
| \`--save-dev\` | \`-D\` | devDependencies | \`^\` | 构建测试工具（vite、vitest、eslint） |
| \`--save-optional\` | \`-O\` | optionalDependencies | \`^\` | 可选功能（fsevents、平台特定包） |
| \`--save-exact\` | \`-E\` | 对应字段 | 无（精确） | 锁死版本避免 ^ 漂移 |
| \`--global\` | \`-g\` | 全局 | — | 安装 CLI 工具 |

#### 指定版本

\`\`\`bash
pnpm add react@18.2.0          # 精确版本
pnpm add react@^18             # 兼容版本（>=18 <19）
pnpm add react@next            # next 标签
pnpm add react@beta            # beta 标签
pnpm add github:user/repo      # 从 GitHub 安装
pnpm add ./local-pkg           # 本地路径
\`\`\`

> ⚠️ **陷阱**：\`pnpm add react@18\` 不会装 18.2.0，而是装 18.x 里最高的版本（可能是 18.99）。要精确就写完整版本号或加 \`-E\`。

#### 添加多个包

\`\`\`bash
pnpm add lodash dayjs axios    # 一次添加多个
\`\`\`

### 三、pnpm install：安装所有依赖

\`pnpm install\`（简写 \`pnpm i\`）根据 \`package.json\` 和 \`pnpm-lock.yaml\` 安装所有依赖。这是最常用、也最需要理解 flag 的命令。

#### 关键 flag

| flag | 含义 | 适用场景 |
| --- | --- | --- |
| \`--frozen-lockfile\` | 严格按 lockfile 安装，不更新 | **CI/CD 必用**，保证可复现 |
| \`--force\` | 忽略缓存，重新安装 | 排查奇怪的安装问题 |
| \`--offline\` | 只用本地 store，不联网 | 离线环境、验证缓存 |
| \`--prefer-offline\` | 优先用缓存，缺失才联网 | 加速安装 |
| \`--prod\` / \`--production\` | 只装 dependencies，跳过 dev | 生产镜像构建 |
| \`--shamefully-hoist\` | 把依赖提升到顶层（兼容旧工具） | 兼容老 webpack/eslint 配置 |

#### CI 场景：--frozen-lockfile

\`\`\`bash
pnpm install --frozen-lockfile
\`\`\`

这个 flag 是 CI 的标配。它的行为：

1. 严格按 \`pnpm-lock.yaml\` 安装，**不会修改 lockfile**。
2. 如果 \`package.json\` 和 lockfile 不一致（比如有人改了 package.json 但忘了提交 lockfile），**直接报错退出**。

这保证了 CI 构建的可复现性——同样的 lockfile 一定装出同样的依赖树。**绝不要在 CI 里用 \`pnpm install\`（不带 flag）**，否则 lockfile 可能被偷偷修改，埋下"线上和本地不一致"的雷。

#### 本地开发：默认 install

本地开发直接 \`pnpm install\` 即可。pnpm 会：

1. 读取 \`pnpm-lock.yaml\`，尽量复用已解析的版本。
2. 如果 \`package.json\` 有新依赖或版本变化，更新 lockfile。
3. 从全局 store 硬链接到项目的 \`.pnpm\` 目录，再符号链接到 \`node_modules\`。

### 四、pnpm remove / pnpm update

#### pnpm remove（简写 pnpm rm）

\`\`\`bash
pnpm remove lodash              # 移除依赖
pnpm remove -D typescript       # 移除开发依赖
pnpm remove -g pm2              # 移除全局工具
pnpm remove lodash --filter web-app   # 在指定工作区移除
\`\`\`

移除会同步更新 \`package.json\` 和 \`pnpm-lock.yaml\`，并清理 \`node_modules\` 里的符号链接。

#### pnpm update（简写 pnpm up）

\`\`\`bash
pnpm update                     # 更新所有依赖（在 semver 范围内）
pnpm update lodash              # 只更新 lodash
pnpm update --latest            # 跨大版本更新（突破 ^ 限制）
pnpm update -L lodash           # 同上，简写
pnpm update --interactive       # 交互式选择要更新的包
pnpm update -i                  # 同上
pnpm update --recursive         # 在所有工作区更新
pnpm update -r                  # 同上
\`\`\`

**\`update\` vs \`update --latest\`** 的区别是高频混淆点：

| 命令 | 行为 | 版本范围 |
| --- | --- | --- |
| \`pnpm up\` | 在 package.json 声明的 semver 范围内升级 | \`^4.17.0\` → \`4.17.21\`（不跨大版本） |
| \`pnpm up -L\` | 突破 semver 范围，升到最新 | \`^4.17.0\` → \`5.0.0\`（跨大版本，会改 package.json） |

> ⚠️ **陷阱**：\`pnpm up -L\` 会修改 package.json 里的版本号，可能引入破坏性变更。生产项目升级大版本前一定要看 CHANGELOG 和跑测试。

### 五、pnpm why：追踪依赖链路

\`pnpm why <pkg>\` 回答一个关键问题：**"我明明没装这个包，为什么它在 node_modules 里？"** 它会展示某个包是被谁、通过什么链路引进来的。

\`\`\`bash
pnpm why react
\`\`\`

典型输出：

\`\`\`bash
react 18.2.0
└─ web-app
   └─ next 14.0.0
      └─ react 18.2.0
\`\`\`

这表示 \`react\` 是被 \`next\` 拉进来的。当你发现一个可疑的包想追根溯源，或者要移除某个包却担心影响别人，\`pnpm why\` 是必备工具。

支持在指定工作区查询：

\`\`\`bash
pnpm why lodash --filter web-app
\`\`\`

### 六、pnpm list / pnpm outdated / pnpm audit

#### pnpm list（简写 pnpm ls）

\`\`\`bash
pnpm list                    # 列出直接依赖
pnpm list --depth 2          # 列出 2 层深度的依赖树
pnpm list --depth Infinity   # 列出完整依赖树
pnpm list --json             # JSON 格式输出（脚本友好）
pnpm list --filter web-app   # 在指定工作区列出
pnpm list --recursive        # 列出所有工作区的依赖
pnpm list -r                 # 同上
\`\`\`

#### pnpm outdated

检查哪些依赖有新版本可升级：

\`\`\`bash
pnpm outdated
pnpm outdated --long         # 显示详细信息
pnpm outdated lodash         # 只检查指定包
\`\`\`

输出表格会列出 \`Current\`（当前）、\`Wanted\`（semver 范围内最新）、\`Latest\`（最新发布）三列，帮你判断能不能安全升级。

#### pnpm audit

检查已知安全漏洞：

\`\`\`bash
pnpm audit                   # 检查并报告漏洞
pnpm audit --fix             # 尝试自动修复（升级到修复版本）
pnpm audit --json            # JSON 输出
\`\`\`

> ⚠️ **陷阱**：\`pnpm audit\` 默认对比 \`package.json\` 声明的版本，而 pnpm 的严格结构可能让你实际并没真正受影响。看到漏洞先别慌，用 \`pnpm why\` 确认漏洞包是否真的在你运行的代码路径上。

### 七、pnpm 的严格依赖模型：.pnpm 目录与符号链接

这是 pnpm 区别于 npm/yarn 的**最核心创新**，必须彻底理解。

#### npm/yarn 的"扁平化"结构

npm v3+ 和 yarn 默认把所有依赖**提升（hoist）到 node_modules 顶层**：

\`\`\`
node_modules/
├── express          ← 顶层（hoist）
├── lodash           ← 顶层（hoist）
├── body-parser/
│   └── node_modules/
│       └── lodash   ← 冲突版本才嵌套
\`\`\`

这种结构简单，但有个致命问题：**你的代码能 require 任何被提升到顶层的包，哪怕你没在 package.json 里声明它**。这就是"幽灵依赖"。

#### pnpm 的"严格"结构

pnpm 把依赖放在 \`.pnpm\` 目录里，按 \`包名@版本\` 命名，再用**符号链接**组织依赖关系。你的 \`node_modules\` 里只有你**直接声明**的依赖：

\`\`\`
node_modules/
├── express → .pnpm/express@4.18.2/node_modules/express   ← 符号链接
├── .pnpm/
│   ├── express@4.18.2/
│   │   └── node_modules/
│   │       ├── express          ← 真实文件
│   │       ├── body-parser → ../../body-parser@1.20.1/...  ← 符号链接
│   │       └── qs → ../../qs@6.11.0/...
│   ├── body-parser@1.20.1/
│   │   └── node_modules/...
│   └── qs@6.11.0/
│       └── node_modules/...
\`\`\`

关键点：

1. **你的 node_modules 顶层只有你声明的依赖**（express），没声明的包你 require 不到。
2. **每个包自己的依赖在它专属的 \`.pnpm/包名@版本/node_modules/\` 下**，通过符号链接指向其他 \`.pnpm/包名@版本/\`。
3. **同一个包的不同版本各自独立目录**，互不干扰。

### 八、幽灵依赖问题与 pnpm 如何避免

#### 什么是幽灵依赖

假设你只声明了 \`express\`，但 \`express\` 依赖了 \`qs\`。在 npm 的扁平结构下，\`qs\` 被提升到顶层，你的代码可以 \`require('qs')\` 而不报错——尽管你从没在 package.json 声明过 \`qs\`。

#### 幽灵依赖的危害

1. **删除 express 后 qs 也消失**：你的代码突然 \`Cannot find module 'qs'\`。
2. **express 升级后不再依赖 qs**：同样的报错。
3. **换用其他包管理器**：依赖结构变化，幽灵依赖暴露。
4. **团队协作**：别人 clone 你的项目装不上，因为 package.json 漏了声明。

#### pnpm 如何避免

pnpm 的严格结构让你**只能 require 声明过的包**。如果你 require 一个没声明的包，即使它作为别人的子依赖存在于 \`.pnpm\` 里，也会报 \`Cannot find module\`。这强制你把所有用到的依赖显式声明，从源头消灭幽灵依赖。

> 💡 **迁移老项目时的坑**：从 npm/yarn 迁移到 pnpm，老代码里可能有一堆幽灵依赖会暴露成报错。可以用 \`--shamefully-hoist\` 临时兼容，但**长期一定要补全 package.json 声明**，别依赖这个 flag。

### 九、peer 依赖处理

#### 什么是 peer 依赖

\`peerDependencies\` 表示"我需要宿主项目提供某个包"。比如 React 组件库声明 \`peerDependencies: { react: "^18" }\`，意思是"我适配 React 18，你得自己装 react"。

#### auto-install-peers 配置

pnpm 默认 **不会自动安装 peer 依赖**（和 npm v7+ 不同），这常常让新手困惑。可以通过配置开启：

\`\`\`ini
# .npmrc
auto-install-peers=true
\`\`\`

开启后，pnpm 会自动安装缺失的 peer 依赖。pnpm v8+ 默认就是 \`true\`，但老版本默认 \`false\`，升级时要留意。

#### peer 依赖冲突

如果 A 要 react@17，B 要 react@18，pnpm 默认会报错（因为 peer 不允许多版本）。解决：

1. 用 \`pnpm.overrides\` 强制统一版本（见覆盖章节）。
2. 在 \`.npmrc\` 设 \`strict-peer-dependencies=false\` 忽略警告（不推荐，可能运行时崩）。

### 十、对比表：pnpm vs npm vs yarn

| 维度 | pnpm | npm | yarn (classic) |
| --- | --- | --- | --- |
| **磁盘占用** | 极小（全局 store 共享） | 大（每项目拷贝） | 大 |
| **安装速度** | 快（硬链接） | 慢 | 中 |
| **幽灵依赖** | 不存在 | 存在 | 存在 |
| **依赖结构** | 符号链接 + .pnpm | 扁平 hoist | 扁平 hoist |
| **lockfile** | pnpm-lock.yaml | package-lock.json | yarn.lock |
| **工作区** | 原生支持 | 实验性 | 原生支持 |
| **离线安装** | 支持 | 弱 | 支持 |
| **安全性** | 高（严格） | 中 | 中 |

### 十一、最佳实践与陷阱

#### 最佳实践

1. **CI 必用 \`--frozen-lockfile\`**：保证可复现，防止 lockfile 被篡改。
2. **lockfile 必须提交到 git**：它是可复现的保证。
3. **生产镜像用 \`--prod\`**：只装运行时依赖，镜像更小更安全。
4. **定期 \`pnpm audit\` + \`pnpm outdated\`**：主动发现漏洞和过时依赖。
5. **新项目别用 \`--shamefully-hoist\`**：补全声明才是正道。

#### 常见陷阱

1. **\`pnpm up\` 不跨大版本**：想升大版本要用 \`-L\`。
2. **\`pnpm add -g\` 装的工具找不到**：检查 \`pnpm config get global-bin-dir\` 是否在 PATH。
3. **老项目迁移报 \`Cannot find module\`**：是幽灵依赖暴露，补全声明或临时用 \`--shamefully-hoist\`。
4. **peer 依赖警告**：理解是版本不匹配，用 \`pnpm why\` 排查，必要时用 overrides 统一。

### 十二、本章小结

- \`pnpm add\` 添加依赖，\`-D\`/\`-O\`/\`-E\`/\`-g\` 控制写入位置和版本精度。
- \`pnpm install\` 装所有依赖，CI 用 \`--frozen-lockfile\`，离线用 \`--offline\`。
- \`pnpm remove\` 移除，\`pnpm update\` 升级（\`-L\` 跨大版本）。
- \`pnpm why\` 追踪依赖链路，\`pnpm list\` 列树，\`pnpm outdated\`/\`audit\` 查过时和漏洞。
- pnpm 的核心创新是 **\`.pnpm\` 目录 + 符号链接** 的严格结构，从源头消灭幽灵依赖。
- peer 依赖用 \`auto-install-peers\` 配置，冲突时用 overrides 统一。

下一章我们进入 pnpm 的另一大杀器——工作区与 Monorepo。`,
    code: `#!/usr/bin/env bash
# ============================================================
# 第一章演示：pnpm 依赖管理命令模拟
# ------------------------------------------------------------
# 注意：本沙箱环境未安装 pnpm，下面的输出都是用 echo 模拟的，
#       用来展示真实 pnpm 命令的输出样式，便于理解。
#       标注"模拟输出"的段落是 echo 打印的，并非真正执行。
# ============================================================

set -e

echo "============================================================"
echo "  pnpm 依赖管理命令模拟演示"
echo "============================================================"
echo ""

# ------------------------------------------------------------
# 1. 模拟 pnpm add express（添加生产依赖）
# ------------------------------------------------------------
echo "【命令】pnpm add express"
echo "（模拟输出）"
echo "--------------------------------------------"
echo "Progress: resolved 95, reused 89, downloaded 6, added 1, done"
echo ""
echo "dependencies:"
echo "+ express 4.18.2"
echo ""
echo "Done in 2.3s"
echo ""

# 展示 package.json 变化（用 heredoc 模拟文件内容）
echo "package.json 中 dependencies 字段更新为："
cat <<'EOF'
{
  "name": "my-app",
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF
echo ""
echo "------------------------------------------------------------"
echo ""

# ------------------------------------------------------------
# 2. 模拟 pnpm add -D vitest（添加开发依赖）
# ------------------------------------------------------------
echo "【命令】pnpm add -D vitest"
echo "（模拟输出）"
echo "--------------------------------------------"
echo "Progress: resolved 42, reused 40, downloaded 2, added 1, done"
echo ""
echo "devDependencies:"
echo "+ vitest 1.2.0"
echo ""
echo "Done in 1.8s"
echo ""

# ------------------------------------------------------------
# 3. 模拟 pnpm install --frozen-lockfile（CI 场景）
# ------------------------------------------------------------
echo "【命令】pnpm install --frozen-lockfile    # CI 场景必用"
echo "（模拟输出）"
echo "--------------------------------------------"
echo "Lockfile is up to date, resolution step is skipped"
echo "Progress: resolved 1240, reused 1240, downloaded 0, added 1240"
echo ""
echo "Done in 4.1s"
echo ""
echo "说明：--frozen-lockfile 严格按 pnpm-lock.yaml 安装，"
echo "      如果 package.json 与 lockfile 不一致会直接报错。"
echo ""

# ------------------------------------------------------------
# 4. 模拟 pnpm why react（查看依赖链路）
# ------------------------------------------------------------
echo "【命令】pnpm why react"
echo "（模拟输出）"
echo "--------------------------------------------"
cat <<'EOF'
react 18.2.0
└─ web-app
   └─ next 14.0.0
      └─ react 18.2.0

Found 1 match in /app
EOF
echo ""
echo "说明：react 是被 next 间接拉进来的依赖。"
echo ""

# ------------------------------------------------------------
# 5. 模拟 pnpm list --depth 2（树状结构）
# ------------------------------------------------------------
echo "【命令】pnpm list --depth 2"
echo "（模拟输出）"
echo "--------------------------------------------"
cat <<'EOF'
my-app /app
├─ express 4.18.2
│  ├─ body-parser 1.20.1
│  ├─ cookie-parser 1.4.6
│  └─ qs 6.11.0
├─ vitest 1.2.0
│  ├─ vite 5.0.0
│  └─ chai 4.3.0
└─ axios 1.6.0
EOF
echo ""
echo "说明：--depth 2 表示展开到第 2 层依赖。"
echo ""

# ------------------------------------------------------------
# 6. 模拟 pnpm 的 .pnpm 目录结构（符号链接）
# ------------------------------------------------------------
echo "【命令】ls -la node_modules/.pnpm | head -20"
echo "（模拟输出，展示 pnpm 的严格依赖结构）"
echo "--------------------------------------------"
cat <<'EOF'
total 0
drwxr-xr-x  express@4.18.2
drwxr-xr-x  body-parser@1.20.1
drwxr-xr-x  qs@6.11.0
drwxr-xr-x  vitest@1.2.0
drwxr-xr-x  vite@5.0.0
EOF
echo ""
echo "node_modules 顶层（只有直接声明的依赖，是符号链接）："
cat <<'EOF'
lrwxr-xr-x  express -> .pnpm/express@4.18.2/node_modules/express
lrwxr-xr-x  vitest  -> .pnpm/vitest@1.2.0/node_modules/vitest
lrwxr-xr-x  axios   -> .pnpm/axios@1.6.0/node_modules/axios
EOF
echo ""
echo "说明：.pnpm 目录按 包名@版本 存放真实文件；"
echo "      node_modules 顶层只放你声明的依赖（符号链接）。"
echo "      没声明的包你 require 不到 —— 这就是 pnpm 消灭幽灵依赖的关键。"
echo ""

# ------------------------------------------------------------
# 7. 模拟 pnpm outdated（检查过时依赖）
# ------------------------------------------------------------
echo "【命令】pnpm outdated"
echo "（模拟输出）"
echo "--------------------------------------------"
printf "%-15s %-12s %-12s %-12s\\n" "Package" "Current" "Wanted" "Latest"
printf "%-15s %-12s %-12s %-12s\\n" "express" "4.18.2" "4.19.2" "5.0.0"
printf "%-15s %-12s %-12s %-12s\\n" "axios" "1.6.0" "1.6.2" "1.7.0"
printf "%-15s %-12s %-12s %-12s\\n" "vitest" "1.2.0" "1.4.0" "1.4.0"
echo ""
echo "说明：Wanted=semver 范围内可升；Latest=最新发布（可能跨大版本）。"
echo ""

# ------------------------------------------------------------
# 8. 模拟 pnpm audit（安全漏洞检查）
# ------------------------------------------------------------
echo "【命令】pnpm audit"
echo "（模拟输出）"
echo "--------------------------------------------"
echo "1 vulnerabilities found"
echo "Severity: moderate"
echo "  Package: lodash@4.17.20"
echo "  Issue: Prototype Pollution"
echo "  Fix: upgrade to lodash@4.17.21"
echo ""
echo "Done in 0.8s"
echo ""

echo "============================================================"
echo "  演示结束。以上输出均为模拟，真实环境请安装 pnpm 后执行。"
echo "============================================================"`,
  },

  // =========================================================
  // 第二章：工作区与 Monorepo
  // =========================================================
  {
    id: "pnpm-workspace",
    title: "工作区与 Monorepo",
    icon: "🏗️",
    group: "依赖管理与工作区",
    content: `## 工作区与 Monorepo：pnpm 的另一大杀器

当项目从"单个应用"成长为"多个互相依赖的子项目"时（比如一个前端框架 + 配套的 CLI + 文档站 + 示例项目），把它们拆成多个 git 仓库会带来无尽的跨仓协调成本。**Monorepo（单仓多包）** 是解决这个问题的工程范式，而 pnpm workspace 是当前最优秀的 monorepo 方案之一。本章深入讲解 pnpm 工作区的配置、跨包操作、依赖顺序执行，以及 pnpm 9.5+ 新增的 catalogs 特性。

### 一、什么是 Monorepo

#### 1. 多仓（Polyrepo）vs 单仓（Monorepo）

**Polyrepo（传统多仓）**：每个子项目一个 git 仓库。改一个共享组件，要：在组件仓提 PR → 发版 → 在应用仓升级依赖 → 再提 PR。一次改动跨多个仓库，节奏割裂。

**Monorepo（单仓多包）**：所有子项目放在一个 git 仓库里，分成多个子目录（称为"包"或"工作区"）。改共享组件直接改源码，所有应用立刻看到变化，无需发版。Babel、React、Vue、Next.js、Vite 等知名项目都是 monorepo。

#### 2. Monorepo 的核心收益

| 收益 | 说明 |
| --- | --- |
| **原子提交** | 一次提交同时改组件和应用，保证一致性 |
| **代码共享** | 共享工具、配置、类型定义，零成本复用 |
| **统一工具链** | 一套 ESLint/TS/CI 配置覆盖所有包 |
| **简化协作** | 不用频繁发版和跨仓升级 |
| **依赖去重** | 多个包共享同一份 react/webpack，磁盘和 bundle 都省 |

#### 3. Monorepo 的代价

- 仓库体积大，clone 慢（可用 sparse checkout 缓解）。
- CI 要按"受影响的包"增量构建，配置复杂。
- 权限管理粗（所有人能看所有包）。

### 二、pnpm workspace 创建

#### 1. pnpm-workspace.yaml

在仓库根目录创建 \`pnpm-workspace.yaml\`，声明哪些目录是工作区：

\`\`\`yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"      # packages/ 下的每个子目录是一个包
  - "apps/*"          # apps/ 下的每个子目录是一个包
  - "docs"            # 单独指定目录
  - "tools/*"
\`\`\`

支持 glob 通配符。\`packages/*\` 表示 \`packages/utils\`、\`packages/ui\`、\`packages/core\` 都各自是一个工作区包。

#### 2. 目录结构示例

\`\`\`
my-monorepo/
├── pnpm-workspace.yaml      ← 工作区声明
├── package.json             ← 根 package.json（通常只放 devDependencies 和脚本）
├── pnpm-lock.yaml           ← 整个 monorepo 共用一个 lockfile
├── packages/
│   ├── shared-ui/
│   │   └── package.json     ← name: "@my-org/shared-ui"
│   ├── utils/
│   │   └── package.json     ← name: "@my-org/utils"
│   └── core/
│       └── package.json     ← name: "@my-org/core"
└── apps/
    ├── web-app/
    │   └── package.json     ← name: "web-app"
    └── docs/
        └── package.json     ← name: "docs"
\`\`\`

#### 3. 根 package.json

根 \`package.json\` 通常不放业务代码，只放：

\`\`\`json
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "build": "pnpm -r run build",
    "test": "pnpm -r run test",
    "lint": "pnpm -r run lint"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "eslint": "^8.0.0"
  }
}
\`\`\`

\`"private": true\` 表示根包不会被发布到 npm（它只是个组织容器）。

#### 4. 一次安装所有包的依赖

在根目录运行 \`pnpm install\`，pnpm 会：

1. 读取 \`pnpm-workspace.yaml\` 找到所有工作区包。
2. 收集每个包的 \`package.json\` 依赖。
3. **共用一个 \`pnpm-lock.yaml\`**，统一解析版本。
4. 在每个包的目录下创建 \`node_modules\`，但底层共享全局 store。

这是 pnpm 比 npm/yarn 强的地方——**天然支持 monorepo，无需额外工具**。

### 三、--filter：精确操作指定工作区

\`--filter\` 是 monorepo 里**最重要**的 flag，它让你精准选择要在哪个（或哪些）工作区执行命令。

#### 选择器语法

\`\`\`bash
# 按包名选择
pnpm --filter web-app run build

# 按 glob 选择
pnpm --filter "@my-org/*" run build

# 按目录路径选择
pnpm --filter ./apps/web-app run build

# 选择某个包及其所有依赖（含传递依赖）
pnpm --filter web-app... run build

# 选择某个包及其所有依赖者（依赖它的包）
pnpm --filter ...web-app run build

# 选择自上次提交以来有改动的包
pnpm --filter "...\[origin/main\]" run build
\`\`\`

#### ... 的含义（依赖顺序）

这是最容易被忽略但极强大的特性：

| 选择器 | 含义 |
| --- | --- |
| \`--filter web-app\` | 只选 web-app 自己 |
| \`--filter web-app...\` | 选 web-app **及其所有依赖**（先建依赖，再建 web-app） |
| \`--filter ...web-app\` | 选 web-app **及其所有依赖者**（依赖 web-app 的包） |

举例：\`shared-ui\` 被 \`web-app\` 依赖。

- \`pnpm --filter web-app... run build\` 会按依赖顺序构建：先 \`shared-ui\`，再 \`web-app\`。这正好是构建顺序——必须先构建被依赖的包，主包才能用上最新的产物。
- \`pnpm --filter ...shared-ui run test\` 会测试 \`shared-ui\` 和所有依赖它的包（确保改 shared-ui 没破坏下游）。

### 四、给工作区添加依赖

#### 1. 给指定工作区添加外部依赖

\`\`\`bash
# 给 web-app 添加 react
pnpm --filter web-app add react

# 给所有工作区添加 lodash（每个包都装一份）
pnpm -r add lodash

# 给匹配的工作区添加
pnpm --filter "@my-org/*" add dayjs
\`\`\`

#### 2. 添加本地工作区包为依赖（--workspace）

monorepo 内部包互相依赖是核心场景。用 \`--workspace\` 标记这是本地包，pnpm 会用符号链接而不是从 registry 下载：

\`\`\`bash
# 在 web-app 里依赖 shared-ui
pnpm --filter web-app add @my-org/shared-ui --workspace

# 用相对路径也行
pnpm --filter web-app add ../packages/shared-ui
\`\`\`

添加后，\`web-app\` 的 \`package.json\` 里会写：

\`\`\`json
{
  "dependencies": {
    "@my-org/shared-ui": "workspace:*"
  }
}
\`\`\`

\`workspace:*\` 是 pnpm 的特殊协议，表示"始终用本地工作区版本"。还支持：

- \`workspace:*\` —— 用本地任意版本
- \`workspace:^1.0.0\` —— 本地版本需满足 ^1.0.0
- \`workspace:~\` —— 本地版本需满足 ~当前版本
- \`workspace:^\` —— 本地版本需满足 ^当前版本

#### 3. 发布时自动替换

发布包时，pnpm 会自动把 \`workspace:*\` 替换成实际版本号（比如 \`^1.2.0\`），保证发布的包能被外部正常安装。这是 pnpm 比 yarn classic 优秀的地方——无需手动维护版本。

### 五、跨工作区执行脚本

#### 1. pnpm -r run（递归执行）

\`\`\`bash
# 在所有工作区执行 build 脚本
pnpm -r run build

# 同义：--recursive
pnpm --recursive run build

# 在所有工作区执行测试
pnpm -r run test
\`\`\`

pnpm 会**并行**执行（默认按 CPU 核数并发），速度比串行快得多。如果需要串行，加 \`--workspace-concurrency 1\`。

#### 2. 配合 --filter 精确执行

\`\`\`bash
# 只构建 web-app 及其依赖
pnpm --filter web-app... run build

# 测试所有依赖 shared-ui 的包（确保改动没破坏下游）
pnpm --filter ...shared-ui run test

# 只跑有改动的包的测试（CI 增量场景）
pnpm --filter "...\[origin/main\]" run test
\`\`\`

#### 3. 拓扑排序与并行

pnpm 会自动分析工作区依赖关系，**按拓扑顺序**执行：

- \`build\` 这类有依赖关系的脚本：先构建被依赖的包，再构建依赖者。
- \`test\` 这类无依赖的脚本：并行执行，互不等待。

pnpm 默认能识别 \`build\` 的依赖顺序，但对自定义脚本名（如 \`compile\`）需要通过 \`pnpm.runBeforeBuild\` 或显式 \`--filter ...\` 控制。

### 六、catalogs：统一版本管理（pnpm 9.5+）

#### 1. 问题：版本漂移

monorepo 里多个包都依赖 \`react\`，每个包的 \`package.json\` 各写各的版本（\`^18.0.0\`、\`^18.2.0\`、\`^18.1.0\`），时间一长版本不统一，构建结果不一致。

#### 2. catalogs 解决方案

pnpm 9.5+ 引入 \`catalogs\`，在 \`pnpm-workspace.yaml\` 里集中声明版本，包里用 \`catalog:\` 协议引用：

\`\`\`yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
  - "apps/*"

catalogs:
  react18:
    react: 18.2.0
    react-dom: 18.2.0
  testing:
    vitest: 1.4.0
\`\`\`

在包的 \`package.json\` 里：

\`\`\`json
{
  "dependencies": {
    "react": "catalog:react18",
    "react-dom": "catalog:react18"
  },
  "devDependencies": {
    "vitest": "catalog:testing"
  }
}
\`\`\`

这样所有包的 react 版本都指向 catalog 里声明的 \`18.2.0\`，要升级只需改 catalog 一处，所有包同步更新。

> 💡 catalogs 比 \`pnpm.overrides\` 更优雅——overrides 是"强制覆盖"，catalogs 是"集中声明 + 自愿引用"，语义更清晰。

### 七、pnpm import：从 npm/yarn 迁移

已有项目从 npm/yarn 迁移到 pnpm，用 \`pnpm import\` 转换 lockfile：

\`\`\`bash
# 从 package-lock.json 或 yarn.lock 导入
pnpm import

# 然后正常安装
pnpm install
\`\`\`

\`pnpm import\` 会读取 \`package-lock.json\` 或 \`yarn.lock\`，尽量还原原本解析的版本，生成 \`pnpm-lock.yaml\`，避免迁移时版本漂移。

### 八、对比 npm workspaces / yarn workspaces / lerna

| 维度 | pnpm workspace | npm workspaces | yarn workspaces | lerna |
| --- | --- | --- | --- | --- |
| **依赖结构** | 符号链接（严格） | 扁平 hoist | 扁平 hoist | 依赖底层包管理器 |
| **磁盘占用** | 极小 | 大 | 大 | 大 |
| **幽灵依赖** | 不存在 | 存在 | 存在 | 存在 |
| **--filter 选择器** | 强大（支持依赖图） | 弱（只能按名） | 弱 | 强（lerna exec --scope） |
| **增量构建** | 原生支持（...\[origin/main\]） | 不支持 | 不支持 | 支持（--since） |
| ** catalogs 版本统一** | 支持（9.5+） | 不支持 | 不支持 | 不支持 |
| **学习曲线** | 中 | 低 | 低 | 高 |
| **维护状态** | 活跃 | 活跃 | berry 活跃 | 基本停滞 |

**结论**：pnpm workspace 是当前最优秀的 monorepo 方案——结构严格、filter 强大、磁盘友好。Lerna 已基本被 nx/turbo + pnpm 取代，新项目不要再选 lerna。

### 九、实战：搭建一个 monorepo

需求：\`shared-ui\`（组件库）+ \`web-app\`（应用，依赖 shared-ui）+ \`docs\`（文档站，依赖 shared-ui）。

\`\`\`bash
# 1. 初始化
mkdir my-monorepo && cd my-monorepo
pnpm init
# 把 package.json 设为 "private": true

# 2. 创建工作区声明
cat > pnpm-workspace.yaml <<'EOF'
packages:
  - "packages/*"
  - "apps/*"
EOF

# 3. 创建子包
mkdir -p packages/shared-ui apps/web-app apps/docs
cd packages/shared-ui && pnpm init && cd ../..
cd apps/web-app && pnpm init && cd ../..
cd apps/docs && pnpm init && cd ../..

# 4. 在子包的 package.json 里改 name
# packages/shared-ui/package.json: "name": "@my-org/shared-ui"
# apps/web-app/package.json: "name": "web-app"
# apps/docs/package.json: "name": "docs"

# 5. 让 web-app 依赖 shared-ui
pnpm --filter web-app add @my-org/shared-ui --workspace

# 6. 一次安装所有依赖
pnpm install

# 7. 按依赖顺序构建
pnpm --filter web-app... run build
\`\`\`

完成后，\`web-app/node_modules/@my-org/shared-ui\` 是指向 \`packages/shared-ui\` 的符号链接。你改 \`shared-ui\` 源码，\`web-app\` 立刻看到变化，无需发版。

### 十、最佳实践与陷阱

#### 最佳实践

1. **根 package.json 只放共享工具**（typescript、eslint、prettier），业务依赖放各子包。
2. **用 \`workspace:*\` 协议**引用本地包，发布时 pnpm 自动替换版本。
3. **CI 用 \`--filter ...\[origin/main\]\`** 做增量构建，只测受影响的包。
4. **统一版本用 catalogs**（pnpm 9.5+），避免版本漂移。
5. **构建用 \`--filter pkg...\`** 保证依赖顺序。

#### 常见陷阱

1. **包名重复**：两个包 \`name\` 一样会导致 \`--filter\` 失效。
2. **忘记 \`--workspace\`**：\`pnpm add @my-org/shared-ui\` 不带 \`--workspace\` 会去 registry 找，报错。
3. **循环依赖**：A 依赖 B，B 又依赖 A，pnpm 会报错。要重构拆分。
4. **node_modules 提升问题**：某些老工具（如老 webpack）找不到 pnpm 的符号链接结构，用 \`--shamefully-hoist\` 或 \`node-linker=hoisted\` 临时兼容。

### 十一、本章小结

- Monorepo 用单仓多包解决跨仓协调，pnpm workspace 是当前最优方案。
- \`pnpm-workspace.yaml\` 声明工作区，\`pnpm install\` 一次装全所有包。
- \`--filter\` 是核心 flag，支持包名、glob、路径、依赖图（\`...\`）、改动检测。
- \`--workspace\` 协议引用本地包，\`workspace:*\` 自动管理版本。
- \`pnpm -r\` 递归执行，自动拓扑排序 + 并行。
- catalogs（9.5+）统一版本声明，比 overrides 更优雅。
- \`pnpm import\` 从 npm/yarn 平滑迁移。

下一章讲如何用 overrides 和 patch 修复依赖问题。`,
    code: `#!/usr/bin/env bash
# ============================================================
# 第二章演示：pnpm 工作区与 Monorepo 命令模拟
# ------------------------------------------------------------
# 注意：本沙箱环境未安装 pnpm，输出均为 echo 模拟。
# ============================================================

set -e

echo "============================================================"
echo "  pnpm 工作区与 Monorepo 模拟演示"
echo "============================================================"
echo ""

# ------------------------------------------------------------
# 1. 展示 pnpm-workspace.yaml 内容
# ------------------------------------------------------------
echo "【文件】pnpm-workspace.yaml"
echo "（模拟文件内容）"
echo "--------------------------------------------"
cat <<'EOF'
packages:
  - "packages/*"
  - "apps/*"
  - "docs"

catalogs:
  react18:
    react: 18.2.0
    react-dom: 18.2.0
EOF
echo ""
echo "说明：packages 声明工作区目录；catalogs 集中管理版本（pnpm 9.5+）。"
echo ""

# ------------------------------------------------------------
# 2. 展示 monorepo 目录结构
# ------------------------------------------------------------
echo "【目录结构】monorepo 布局"
echo "（模拟 tree 输出）"
echo "--------------------------------------------"
cat <<'EOF'
my-monorepo/
├── pnpm-workspace.yaml
├── package.json          (private: true)
├── pnpm-lock.yaml        (整个 monorepo 共用)
├── packages/
│   ├── shared-ui/        (@my-org/shared-ui)
│   │   └── package.json
│   └── utils/            (@my-org/utils)
│       └── package.json
└── apps/
    ├── web-app/          (依赖 shared-ui)
    │   └── package.json
    └── docs/             (依赖 shared-ui)
        └── package.json
EOF
echo ""

# ------------------------------------------------------------
# 3. 模拟 pnpm --filter web-app add react
# ------------------------------------------------------------
echo "【命令】pnpm --filter web-app add react"
echo "（模拟输出）"
echo "--------------------------------------------"
echo "Filtering: web-app"
echo "Progress: resolved 12, reused 10, downloaded 2, added 1, done"
echo ""
echo "apps/web-app"
echo "+ react 18.2.0"
echo ""
echo "Done in 1.9s"
echo ""
echo "说明：--filter web-app 只在 web-app 工作区添加 react。"
echo ""

# ------------------------------------------------------------
# 4. 模拟添加本地工作区包为依赖
# ------------------------------------------------------------
echo "【命令】pnpm --filter web-app add @my-org/shared-ui --workspace"
echo "（模拟输出）"
echo "--------------------------------------------"
echo "Progress: resolved 5, reused 5, downloaded 0, added 1, done"
echo ""
echo "apps/web-app"
echo "+ @my-org/shared-ui 1.0.0"
echo ""
echo "Done in 0.6s"
echo ""
echo "web-app/package.json 中依赖写为："
cat <<'EOF'
{
  "dependencies": {
    "@my-org/shared-ui": "workspace:*"
  }
}
EOF
echo ""
echo "说明：workspace:* 是本地协议，发布时 pnpm 自动替换为实际版本号。"
echo ""

# ------------------------------------------------------------
# 5. 模拟 pnpm -r run build（递归并行构建）
# ------------------------------------------------------------
echo "【命令】pnpm -r run build    # 在所有工作区并行构建"
echo "（模拟输出，注意是并行执行）"
echo "--------------------------------------------"
echo "Scope: 3 of 3 workspace projects"
echo ""
echo "utils   build$ tsc"
echo "shared-ui build$ tsc"
echo "utils   build: Done"
echo "shared-ui build: Done"
echo "web-app build$ next build"
echo "web-app build: Done"
echo ""
echo "Done in 12.4s"
echo ""
echo "说明：-r 递归执行；pnpm 自动并行，被依赖的包先完成。"
echo ""

# ------------------------------------------------------------
# 6. 模拟 pnpm --filter web-app... run build（依赖顺序）
# ------------------------------------------------------------
echo "【命令】pnpm --filter web-app... run build"
echo "（模拟输出，... 表示包含 web-app 的所有依赖）"
echo "--------------------------------------------"
echo "Scope: 3 of 3 workspace projects"
echo ""
echo "执行顺序（按拓扑排序）："
echo "  1. @my-org/utils       (被依赖，先构建)"
echo "  2. @my-org/shared-ui   (依赖 utils，后构建)"
echo "  3. web-app             (依赖 shared-ui，最后构建)"
echo ""
echo "utils       build$ tsc"
echo "utils       build: Done (1.2s)"
echo "shared-ui   build$ tsc"
echo "shared-ui   build: Done (2.1s)"
echo "web-app     build$ next build"
echo "web-app     build: Done (8.3s)"
echo ""
echo "Done in 11.6s"
echo ""
echo "说明：... 后缀让 pnpm 自动按依赖顺序构建。"
echo "      这是 monorepo 构建的核心技巧。"
echo ""

# ------------------------------------------------------------
# 7. 模拟增量构建（只构建有改动的包）
# ------------------------------------------------------------
echo "【命令】pnpm --filter '...[origin/main]' run test"
echo "（模拟输出，只测试自上次提交以来受影响的包）"
echo "--------------------------------------------"
echo "Scope: 2 of 3 workspace projects (skipped utils)"
echo ""
echo "shared-ui test$ vitest run"
echo "shared-ui test: 12 passed (0.8s)"
echo "web-app     test$ vitest run"
echo "web-app     test: 34 passed (2.1s)"
echo ""
echo "Done in 3.0s"
echo ""
echo "说明：...[origin/main] 只选自 origin/main 以来有改动的包及其下游。"
echo "      CI 用这个做增量测试，大幅节省时间。"
echo ""

# ------------------------------------------------------------
# 8. 模拟 catalogs 统一版本
# ------------------------------------------------------------
echo "【特性】catalogs 统一版本管理（pnpm 9.5+）"
echo "（模拟展示）"
echo "--------------------------------------------"
echo "pnpm-workspace.yaml 声明："
cat <<'EOF'
catalogs:
  react18:
    react: 18.2.0
    react-dom: 18.2.0
EOF
echo ""
echo "各包 package.json 引用："
cat <<'EOF'
{
  "dependencies": {
    "react": "catalog:react18",
    "react-dom": "catalog:react18"
  }
}
EOF
echo ""
echo "说明：所有包的 react 版本指向 catalog 声明的 18.2.0。"
echo "      升级时只改 catalog 一处，所有包同步。"
echo ""

# ------------------------------------------------------------
# 9. 模拟 pnpm install（整个 monorepo）
# ------------------------------------------------------------
echo "【命令】pnpm install    # 在根目录安装所有工作区依赖"
echo "（模拟输出）"
echo "--------------------------------------------"
echo "Scope: 4 of 5 workspace projects"
echo "Progress: resolved 856, reused 856, downloaded 0, added 856"
echo ""
echo "packages/shared-ui   + react 18.2.0 (catalog:react18)"
echo "apps/web-app         + next 14.0.0"
echo "apps/web-app         + @my-org/shared-ui 1.0.0 (workspace)"
echo ""
echo "Done in 5.2s"
echo ""

echo "============================================================"
echo "  演示结束。以上输出均为模拟，真实环境请安装 pnpm 后执行。"
echo "============================================================"`,
  },

  // =========================================================
  // 第三章：依赖覆盖与补丁
  // =========================================================
  {
    id: "pnpm-overrides",
    title: "依赖覆盖与补丁",
    icon: "🔧",
    group: "依赖管理与工作区",
    content: `## 依赖覆盖与补丁：当依赖"不听话"时怎么办

理想情况下，依赖装好就能用。但现实里你会遇到两类头疼问题：**版本不对**（某个传递依赖的版本有 bug 或冲突）和**代码不对**（某个依赖有个小 bug，但作者还没修，或已停止维护）。pnpm 提供两个针对性武器：\`pnpm.overrides\`（强制覆盖依赖版本）和 \`pnpm patch\`（给依赖打补丁修改代码）。本章深入讲解两者的语法、适用场景和陷阱。

### 一、两类依赖问题的本质

#### 1. 版本问题

场景：你的项目依赖 \`A@1.0.0\`，\`A\` 又依赖 \`lodash@4.17.20\`（有原型污染漏洞）。你没法直接升级 \`lodash\`，因为它是 \`A\` 的传递依赖，不归你管。\`pnpm up lodash\` 也不会动它（不在你的 package.json 里）。

这时需要 **强制覆盖版本**——不管谁依赖 lodash，统统用安全的 \`4.17.21\`。这就是 \`pnpm.overrides\` 的用途。

#### 2. 代码问题

场景：你依赖的 \`old-lib@1.2.0\` 有个 bug——某个函数在边界条件下返回 NaN。作者两年没更新了，PR 也没人理。你不想 fork 整个库，也不想换库。你想**直接改 node_modules 里的那几行代码**。

这就是 \`pnpm patch\` 的用途——生成一个补丁文件，记录你对依赖的修改，每次安装时自动应用。

#### 3. overrides vs patch：怎么选

| 问题类型 | 工具 | 改的是 |
| --- | --- | --- |
| 版本不对（想换版本） | \`pnpm.overrides\` | 依赖的**版本号** |
| 代码不对（想改逻辑） | \`pnpm patch\` | 依赖的**源代码** |

一句话：**overrides 改版本，patch 改代码**。两者不互斥，可以组合使用。

### 二、pnpm.overrides：强制覆盖依赖版本

#### 1. 基本语法

在 \`package.json\` 里加 \`pnpm.overrides\` 字段：

\`\`\`json
{
  "pnpm": {
    "overrides": {
      "lodash": "4.17.21"
    }
  }
}
\`\`\`

这表示：**整个项目里所有的 lodash，不管谁依赖它、声明什么版本，统统用 4.17.21**。安装后 \`pnpm why lodash\` 会显示所有 lodash 都指向 4.17.21。

#### 2. 三种覆盖语法

pnpm.overrides 支持三种粒度：

**① 全局覆盖**（所有引用都覆盖）：

\`\`\`json
{
  "pnpm": {
    "overrides": {
      "lodash": "4.17.21"
    }
  }
}
\`\`\`

**② 按父包覆盖**（只在某个包依赖它时覆盖）：

\`\`\`json
{
  "pnpm": {
    "overrides": {
      "some-library>lodash": "4.17.21"
    }
  }
}
\`\`\`

这表示：**只有 some-library 依赖的 lodash 被覆盖**，其他包的 lodash 不受影响。语法是 \`父包>子包\`。

**③ 嵌套覆盖**（更精确的层级控制）：

\`\`\`json
{
  "pnpm": {
    "overrides": {
      "some-library": {
        "lodash": "4.17.21"
      }
    }
  }
}
\`\`\`

效果同 ②，只是写法不同。还可以更深层：

\`\`\`json
{
  "pnpm": {
    "overrides": {
      "some-library": {
        "another-lib": {
          "lodash": "4.17.21"
        }
      }
    }
  }
}
\`\`\`

这表示只有 \`some-library → another-lib → lodash\` 这条链路上的 lodash 被覆盖。

#### 3. 三种语法对比

| 语法 | 覆盖范围 | 示例 |
| --- | --- | --- |
| \`"lodash": "4.17.21"\` | 全局所有 lodash | 全部统一版本 |
| \`"A>lodash": "4.17.21"\` | 仅 A 依赖的 lodash | 精确修复某个包 |
| 嵌套对象 | 多层链路精确控制 | 复杂依赖树修复 |

#### 4. 实战：强制统一 React 版本

monorepo 里多个包可能间接依赖不同版本的 react，导致 hooks 报错（"Invalid hook call"）。用 overrides 统一：

\`\`\`json
{
  "pnpm": {
    "overrides": {
      "react": "18.2.0",
      "react-dom": "18.2.0"
    }
  }
}
\`\`\`

安装后所有 react/react-dom 都是 18.2.0，hooks 问题消失。

#### 5. overrides 的陷阱

1. **可能引入不兼容**：把 lodash 从 3 强制覆盖到 4，依赖 lodash@3 的包可能直接崩。覆盖前要看 CHANGELOG。
2. **不要覆盖太底层**：覆盖 \`react\` 风险可控，覆盖 \`lodash\` 风险中等，覆盖 \`chalk\` 这种工具库相对安全。覆盖前用 \`pnpm why\` 看影响范围。
3. **lockfile 会变化**：overrides 会改写 lockfile，团队所有成员都要用同一份 package.json。
4. **过度使用掩盖问题**：如果经常用 overrides，说明依赖本身有问题，长期要考虑换库或升级。

### 三、pnpm patch：给依赖打补丁

#### 1. 为什么需要 patch

\`pnpm.overrides\` 只能换版本，不能改代码。但有些场景：

- 第三方库有 bug，作者没修。
- 库已停止维护，没人合并 PR。
- 你只想改一行代码，不想 fork 整个库。
- 你需要适配内部 API，但不想等作者发版。

\`pnpm patch\` 让你**安全地修改 node_modules 里的包**，并把修改持久化为补丁文件，每次安装自动应用。

#### 2. patch 的工作流程

\`\`\`bash
# 第 1 步：生成可编辑的临时副本
pnpm patch lodash@4.17.21
# 输出：You can now edit the following folder: /tmp/xxxxx-lodash

# 第 2 步：手动编辑临时目录里的文件
# 比如 vim /tmp/xxxxx-lodash/lodash.js，修改有 bug 的那行

# 第 3 步：提交补丁
pnpm patch-commit /tmp/xxxxx-lodash
# 这会生成 patches/lodash@4.17.21.patch 文件，
# 并在 package.json 里写入 patchedDependencies
\`\`\`

#### 3. patchedDependencies 字段

\`pnpm patch-commit\` 后，\`package.json\` 会多出：

\`\`\`json
{
  "pnpm": {
    "patchedDependencies": {
      "lodash@4.17.21": "patches/lodash@4.17.21.patch"
    }
  }
}
\`\`\`

这告诉 pnpm：安装 lodash@4.17.21 后，要应用 \`patches/lodash@4.17.21.patch\` 这个补丁。补丁文件本身要提交到 git，团队所有人 clone 后都能自动应用。

#### 4. 补丁文件长什么样

补丁是标准 unified diff 格式：

\`\`\`diff
diff --git a/lodash.js b/lodash.js
index 1234567..89abcde 100644
--- a/lodash.js
+++ b/lodash.js
@@ -123,7 +123,7 @@
 function someFunc(obj) {
-  return obj.value;          // 原代码（有 bug）
+  return obj.value == null ? 0 : obj.value;  // 修复后
 }
\`\`\`

#### 5. 实战：用 patch 修复第三方库 bug

假设 \`old-lib@1.2.0\` 的 \`parse\` 函数在收到空字符串时崩溃：

\`\`\`bash
# 1. 生成可编辑副本
pnpm patch old-lib@1.2.0
# 输出：You can now edit the following folder: /tmp/abc123-old-lib

# 2. 编辑修复
# vim /tmp/abc123-old-lib/parse.js
# 把 function parse(s) { return s.length; }
# 改成 function parse(s) { return s ? s.length : 0; }

# 3. 提交补丁
pnpm patch-commit /tmp/abc123-old-lib
# 生成 patches/old-lib@1.2.0.patch
# package.json 自动写入 patchedDependencies

# 4. 提交到 git
git add patches/ package.json pnpm-lock.yaml
git commit -m "fix: patch old-lib parse() for empty string"
\`\`\`

之后每次 \`pnpm install\`，pnpm 都会自动应用这个补丁。团队成员、CI 都能享受到修复。

#### 6. patch 的陷阱

1. **升级包后补丁可能失效**：补丁是基于特定版本的代码生成的。如果 \`old-lib\` 升级到 1.3.0，代码变了，补丁可能 apply 失败。这时要重新 \`pnpm patch old-lib@1.3.0\` 生成新补丁。
2. **补丁要和版本绑定**：\`patchedDependencies\` 的 key 是 \`包名@版本\`，版本变了补丁不会自动迁移。
3. **不要打大补丁**：如果改动巨大，说明该 fork 或换库了，patch 只适合小修小补。
4. **补丁不跨平台**：某些补丁可能依赖平台特定行为（如路径分隔符），要测试多平台。
5. **审查补丁内容**：补丁文件要 code review，和审查业务代码一样——它在修改第三方代码，风险不低。

### 四、overrides 与 patch 的组合使用

两者可以同时用。典型组合：

- 用 \`overrides\` 把有漏洞的 lodash 统一到 4.17.21。
- 用 \`patch\` 给某个停止维护的库打安全修复补丁。

\`\`\`json
{
  "pnpm": {
    "overrides": {
      "lodash": "4.17.21"
    },
    "patchedDependencies": {
      "old-lib@1.2.0": "patches/old-lib@1.2.0.patch"
    }
  }
}
\`\`\`

### 五、对比其他方案

| 方案 | 工具 | 优点 | 缺点 |
| --- | --- | --- | --- |
| **pnpm.overrides** | pnpm 原生 | 简单、声明式 | 只能换版本 |
| **pnpm patch** | pnpm 原生 | 能改代码、版本绑定 | 升级包可能失效 |
| **fork + 改名发布** | git + npm | 完全可控 | 维护成本高 |
| **patch-package** | 第三方工具 | 老牌、生态广 | 需额外依赖，pnpm 9 后有兼容问题 |
| ** resolutions (yarn)** | yarn | 类似 overrides | yarn 专属 |

pnpm 9+ 推荐用原生 \`pnpm patch\` 替代第三方的 \`patch-package\`，因为原生方案和 pnpm 的符号链接结构深度集成，更可靠。

### 六、最佳实践与陷阱

#### 最佳实践

1. **overrides 优先用于安全修复**：发现漏洞版本，用 overrides 强制升到修复版本。
2. **patch 用于小修小补**：几行代码的修复用 patch，大改用 fork。
3. **补丁文件提交 git**：\`patches/\` 目录和 \`package.json\` 都要提交。
4. **定期复查**：overrides 和 patch 都是"技术债"，作者修复后要记得移除。
5. **CI 验证补丁**：CI 里 \`pnpm install\` 如果补丁应用失败会报错，能及时发现问题。

#### 常见陷阱

1. **overrides 覆盖后崩溃**：版本跨度太大，API 不兼容。覆盖前测一遍。
2. **patch 升级后失效**：包升级触发补丁冲突，要重新生成。
3. **monorepo 的 overrides 位置**：overrides 要放在**根 package.json**，放子包里不生效。
4. **忘记提交 patch 文件**：只提交了 package.json 没提交 \`patches/\`，别人装不上。

### 七、本章小结

- \`pnpm.overrides\` 强制覆盖依赖版本，用于版本修复/统一。
- overrides 三种语法：全局、按父包（\`A>lodash\`）、嵌套对象。
- \`pnpm patch\` + \`pnpm patch-commit\` 给依赖打代码补丁，\`patchedDependencies\` 记录映射。
- 补丁文件提交 git，团队和 CI 自动应用。
- overrides 改版本，patch 改代码，可组合使用。
- 陷阱：overrides 可能不兼容，patch 升级包后可能失效。

下一章讲 pnpm 的缓存与 store 机制。`,
    code: `#!/usr/bin/env bash
# ============================================================
# 第三章演示：pnpm 依赖覆盖与补丁命令模拟
# ------------------------------------------------------------
# 注意：本沙箱环境未安装 pnpm，输出均为 echo 模拟。
# ============================================================

set -e

echo "============================================================"
echo "  pnpm 依赖覆盖与补丁模拟演示"
echo "============================================================"
echo ""

# ------------------------------------------------------------
# 1. 展示 pnpm.overrides 配置（package.json 片段）
# ------------------------------------------------------------
echo "【配置】package.json 中的 pnpm.overrides"
echo "（模拟文件内容，强制覆盖依赖版本）"
echo "--------------------------------------------"
cat <<'EOF'
{
  "name": "my-app",
  "dependencies": {
    "some-library": "^1.0.0"
  },
  "pnpm": {
    "overrides": {
      "lodash": "4.17.21",
      "react": "18.2.0",
      "react-dom": "18.2.0"
    }
  }
}
EOF
echo ""
echo "说明：所有 lodash 都用 4.17.21，所有 react 都用 18.2.0。"
echo "      不管谁传递依赖它们，版本都被强制覆盖。"
echo ""

# ------------------------------------------------------------
# 2. 展示 overrides 三种语法的对比
# ------------------------------------------------------------
echo "【对比】overrides 三种语法粒度"
echo "（模拟展示）"
echo "--------------------------------------------"
echo "语法 1：全局覆盖"
cat <<'EOF'
"overrides": {
  "lodash": "4.17.21"
}
EOF
echo "-> 所有 lodash 都用 4.17.21"
echo ""
echo "语法 2：按父包覆盖"
cat <<'EOF'
"overrides": {
  "some-library>lodash": "4.17.21"
}
EOF
echo "-> 仅 some-library 依赖的 lodash 被覆盖"
echo ""
echo "语法 3：嵌套对象"
cat <<'EOF'
"overrides": {
  "some-library": {
    "lodash": "4.17.21"
  }
}
EOF
echo "-> 效果同语法 2，写法不同"
echo ""

# ------------------------------------------------------------
# 3. 模拟 pnpm patch lodash 的流程
# ------------------------------------------------------------
echo "【命令】pnpm patch lodash@4.17.21"
echo "（模拟输出，生成可编辑的临时副本）"
echo "--------------------------------------------"
echo "Resolution:"
echo "  lodash@4.17.21"
echo ""
echo "You can now edit the following folder:"
echo "  /tmp/pnpm-patch-1a2b3c-lodash"
echo ""
echo "Once you're done with your changes, run:"
echo "  pnpm patch-commit /tmp/pnpm-patch-1a2b3c-lodash"
echo ""
echo "说明：pnpm 把 lodash@4.17.21 拷到临时目录，"
echo "      你可以编辑里面的文件来修复 bug。"
echo ""

# ------------------------------------------------------------
# 4. 模拟编辑临时目录
# ------------------------------------------------------------
echo "【操作】手动编辑临时目录里的文件"
echo "（模拟编辑过程）"
echo "--------------------------------------------"
echo "$ vim /tmp/pnpm-patch-1a2b3c-lodash/lodash.js"
echo ""
echo "修改前（有 bug）："
echo "  function safeGet(obj) {"
echo "    return obj.value;"
echo "  }"
echo ""
echo "修改后（修复）："
echo "  function safeGet(obj) {"
echo "    return obj && obj.value != null ? obj.value : undefined;"
echo "  }"
echo ""

# ------------------------------------------------------------
# 5. 模拟 pnpm patch-commit
# ------------------------------------------------------------
echo "【命令】pnpm patch-commit /tmp/pnpm-patch-1a2b3c-lodash"
echo "（模拟输出，提交补丁）"
echo "--------------------------------------------"
echo "Generating patch..."
echo "  patches/lodash@4.17.21.patch"
echo ""
echo "Updating package.json..."
echo "  + pnpm.patchedDependencies.lodash@4.17.21"
echo ""
echo "Done in 0.4s"
echo ""

# ------------------------------------------------------------
# 6. 展示 patchedDependencies 字段
# ------------------------------------------------------------
echo "【结果】package.json 中新增 patchedDependencies"
echo "（模拟文件内容）"
echo "--------------------------------------------"
cat <<'EOF'
{
  "pnpm": {
    "patchedDependencies": {
      "lodash@4.17.21": "patches/lodash@4.17.21.patch"
    }
  }
}
EOF
echo ""
echo "说明：key 是 包名@版本，value 是补丁文件路径。"
echo "      每次 pnpm install 都会自动应用这个补丁。"
echo ""

# ------------------------------------------------------------
# 7. 展示补丁文件内容
# ------------------------------------------------------------
echo "【文件】patches/lodash@4.17.21.patch"
echo "（模拟补丁文件，unified diff 格式）"
echo "--------------------------------------------"
cat <<'EOF'
diff --git a/lodash.js b/lodash.js
index 1234567..89abcde 100644
--- a/lodash.js
+++ b/lodash.js
@@ -456,7 +456,7 @@
 function safeGet(obj) {
-  return obj.value;
+  return obj && obj.value != null ? obj.value : undefined;
 }

 module.exports = { safeGet };
EOF
echo ""

# ------------------------------------------------------------
# 8. 模拟组合使用 overrides + patch
# ------------------------------------------------------------
echo "【组合】overrides + patch 同时使用"
echo "（模拟 package.json 完整配置）"
echo "--------------------------------------------"
cat <<'EOF'
{
  "name": "my-app",
  "dependencies": {
    "some-library": "^1.0.0",
    "old-lib": "^1.2.0"
  },
  "pnpm": {
    "overrides": {
      "lodash": "4.17.21"
    },
    "patchedDependencies": {
      "old-lib@1.2.0": "patches/old-lib@1.2.0.patch"
    }
  }
}
EOF
echo ""
echo "说明：overrides 把 lodash 统一到安全版本；"
echo "      patch 给 old-lib 打 bug 修复补丁。两者互不冲突。"
echo ""

# ------------------------------------------------------------
# 9. 模拟 pnpm install 应用补丁
# ------------------------------------------------------------
echo "【命令】pnpm install    # 应用补丁"
echo "（模拟输出）"
echo "--------------------------------------------"
echo "Progress: resolved 320, reused 320, downloaded 0, added 320"
echo ""
echo "Applying patches:"
echo "  [ok] old-lib@1.2.0 -> patches/old-lib@1.2.0.patch"
echo "  [ok] lodash@4.17.21 -> patches/lodash@4.17.21.patch"
echo ""
echo "Done in 3.1s"
echo ""
echo "说明：install 时自动应用所有补丁，无需额外命令。"
echo ""

# ------------------------------------------------------------
# 10. 模拟补丁失效警告
# ------------------------------------------------------------
echo "【陷阱】升级包后补丁可能失效"
echo "（模拟输出，补丁冲突时的报错）"
echo "--------------------------------------------"
echo "ERROR: Failed to apply patch old-lib@1.2.0"
echo "  patches/old-lib@1.2.0.patch"
echo ""
echo "Reason: patch context does not match (file changed in 1.3.0)"
echo ""
echo "解决：重新生成补丁"
echo "  1. pnpm patch old-lib@1.3.0"
echo "  2. 重新编辑修复"
echo "  3. pnpm patch-commit <tmp-dir>"
echo "  4. 更新 patchedDependencies 里的版本号"
echo ""

echo "============================================================"
echo "  演示结束。以上输出均为模拟，真实环境请安装 pnpm 后执行。"
echo "============================================================"`,
  },

  // =========================================================
  // 第四章：缓存与 Store
  // =========================================================
  {
    id: "pnpm-cache",
    title: "缓存与 Store",
    icon: "💾",
    group: "依赖管理与工作区",
    content: `## 缓存与 Store：pnpm 又快又省的底层秘密

pnpm 为什么比 npm/yarn 快那么多、还省那么多磁盘？答案藏在一个叫**内容寻址存储（content-addressable store）**的机制里。这是 pnpm 区别于其他包管理器的底层秘密，也是它能在 monorepo 和 CI 场景下大幅加速的根本原因。本章深入讲解 pnpm 的 store 机制、硬链接与符号链接的协作、CI 缓存策略，以及离线安装。

### 一、npm/yarn 的缓存方式：为什么又慢又占地方

要理解 pnpm store 的优势，先看 npm/yarn 是怎么"缓存"的。

#### npm 的方式：每项目拷贝一份

npm v3+ 默认把依赖**完整拷贝**到每个项目的 \`node_modules\`。它确实有个 \`~/.npm\` 缓存目录，但那个缓存只是"下载过的 tarball"——安装时还是要**解压、拷贝**到项目里。

后果：

1. **磁盘爆炸**：10 个项目都用 react，\`node_modules\` 里就有 10 份 react 的完整拷贝。
2. **安装慢**：即使缓存命中，也要解压 + 拷贝上千个文件，IO 开销大。
3. **跨项目无法共享**：项目 A 装好的 react，项目 B 重新装还要拷一遍。

一个典型中型前端项目 \`node_modules\` 300~500MB，10 个项目就是 3~5GB，全是重复内容。

### 二、pnpm 的内容寻址存储（Content-Addressable Store）

#### 1. 核心思想：按内容哈希存一份

pnpm 在全局维护一个 **store 目录**，里面按**文件内容的哈希值**存储文件。同一个文件（内容相同）在 store 里只存一份，不管它来自哪个包、被多少项目引用。

工作流程：

1. pnpm 下载一个包的 tarball。
2. 解压后，逐个文件计算哈希（SHA512）。
3. 把每个文件存到 \`store/v3/files/<哈希前两位>/<完整哈希>\`。
4. 项目安装时，从 store **硬链接**到项目的 \`.pnpm\` 目录（不拷贝内容）。

因为哈希相同的就是同一份文件，所以：

- 10 个项目都用 react → store 里只有 1 份 react 的文件 → 每个项目通过硬链接引用，**零拷贝**。
- 升级 react 到新版本 → 只有变化的文件被加进 store，没变的文件复用。

#### 2. 内容寻址的优势

| 优势 | 说明 |
| --- | --- |
| **去重** | 全局只存一份相同内容的文件 |
| **零拷贝安装** | 硬链接不复制文件内容，秒装 |
| **磁盘极省** | 10 个项目共享一份 store |
| **校验完整性** | 哈希对不上就报错，防止损坏 |
| **跨项目共享** | 任何项目装过的包，新项目直接复用 |

#### 3. 类比

- npm 的缓存像"每个厨房都备一套完整的调料"——10 个厨房 10 套盐。
- pnpm 的 store 像"楼下的中央调料仓"——所有厨房共用一套盐，用硬链接"取用"，不实际搬动。

### 三、store 位置与相关命令

#### 1. store 默认位置

- **Linux/macOS**：\`~/.local/share/pnpm/store\`（遵循 XDG 规范）
- **Windows**：\`%LOCALAPPDATA%\\pnpm\\store\`

可通过环境变量 \`PNPM_HOME\` 或 \`store-dir\` 配置修改：

\`\`\`ini
# .npmrc
store-dir=/data/pnpm-store
\`\`\`

#### 2. pnpm store path：查看 store 位置

\`\`\`bash
pnpm store path
# 输出：/Users/you/.local/share/pnpm/store/v3
\`\`\`

#### 3. pnpm store status：检查完整性

\`\`\`bash
pnpm store status
# 输出：No packages marked for removal found
# 或：3 packages are marked for removal
\`\`\`

这个命令检查 store 里有没有"被标记删除但还没删"的包，以及有没有损坏的文件。如果怀疑 store 出问题，先跑这个。

#### 4. pnpm store prune：清理未引用的包

\`\`\`bash
pnpm store prune
\`\`\`

随着项目删除、依赖升级，store 里会积累一些"没人再引用"的孤儿文件。\`prune\` 会清理它们，释放磁盘。

> ⚠️ **prune 不会删正在被某项目引用的文件**，安全可放心跑。但它也不会删"虽然现在没引用，但可能将来会被装回来"的文件——这是为了下次安装能命中缓存。要彻底清理，加 \`--force\`（慎用，会让下次安装重新下载）。

#### 5. pnpm store add：手动添加包到 store

\`\`\`bash
pnpm store add express@4.18.2
\`\`\`

预下载某个包到 store，但不安装到项目。适合离线环境预热，或 CI 预热缓存。

### 四、硬链接 vs 符号链接：两层链接的协作

pnpm 用了**两种链接**配合，这是它结构的精髓，必须分清。

#### 1. 硬链接（hard link）

- **store → 项目 .pnpm**：pnpm 从 store **硬链接**文件到项目的 \`.pnpm/包名@版本/node_modules/包名/\`。
- 硬链接是文件系统级别的"同一个文件多个路径"——两个路径指向**同一份磁盘数据**，不复制内容。
- 删除任一路径，另一个仍可用；改一个，另一个也变（因为是同一份数据）。
- **限制**：硬链接不能跨文件系统（store 和项目必须在同一磁盘分区）。

#### 2. 符号链接（symbolic link / symlink）

- **.pnpm → node_modules**：项目的 \`node_modules/包名\` 是指向 \`.pnpm/包名@版本/node_modules/包名\` 的**符号链接**。
- 符号链接是"快捷方式"——一个路径指向另一个路径。
- 可以跨文件系统、可以指向目录。
- Node.js 的 require 解析会跟随符号链接。

#### 3. 两层协作的完整路径

假设你 \`pnpm add express\`：

\`\`\`
node_modules/express                        ← 符号链接
  ↓ 指向
.pnpm/express@4.18.2/node_modules/express  ← 真实文件（通过硬链接到 store）
  ↓ 硬链接到
~/.local/share/pnpm/store/v3/files/ab/cdef...  ← 全局 store 里的真实数据
\`\`\`

这样的好处：

1. **store 是唯一真实数据源**——所有项目共享，零重复。
2. **每个项目的 .pnpm 是 store 的"视图"**——通过硬链接零拷贝构建。
3. **node_modules 是 .pnpm 的"门面"**——通过符号链接组织依赖关系，实现严格结构。

#### 4. 为什么不用全硬链接或全符号链接？

- 全硬链接：硬链接不能指向目录（只能指向文件），无法表达"包"这种目录结构。所以 \`node_modules/express\` 这种目录链接必须用符号链接。
- 全符号链接：符号链接如果指到 store，每次访问都要"穿透"到 store，性能不如硬链接；而且 store 里的文件是扁平的（按哈希命名），符号链接无法直接还原包的目录结构。所以 store 到 .pnpm 这层用硬链接（性能 + 还原结构）。

### 五、跨项目共享：节省磁盘的实战

假设你有 5 个项目，每个都用 react@18.2.0 + next@14.0.0 + 一堆通用库。

| 方案 | 磁盘占用 | 安装速度 |
| --- | --- | --- |
| npm（每项目拷贝） | 5 × 400MB = **2GB** | 慢（每次解压拷贝） |
| pnpm（store 共享） | **400MB**（store 一份 + 各项目硬链接几乎零占用） | 快（硬链接秒装） |

实测：pnpm 装 5 个相似项目，磁盘占用是 npm 的 **1/5 ~ 1/10**，安装速度是 npm 的 **2~3 倍**。

### 六、CI 缓存策略：加速 CI 安装

CI 环境（GitHub Actions / GitLab CI）每次都是全新机器，pnpm install 每次从头下载会很慢。缓存 store 目录能大幅加速。

#### 1. GitHub Actions 缓存 store

\`\`\`yaml
# .github/workflows/ci.yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm          # 关键：缓存 pnpm store
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
\`\`\`

\`cache: pnpm\` 会让 setup-node 自动缓存 pnpm 的 store 目录。首次运行填充缓存，后续运行命中缓存，\`pnpm install\` 几乎秒级完成（只需硬链接 + 解析 lockfile）。

#### 2. 手动缓存（非 GitHub Actions）

\`\`\`yaml
# 通用 CI：缓存 store 路径
cache:
  key: pnpm-store-$\{{ hashFiles('pnpm-lock.yaml') }}
  paths:
    - ~/.local/share/pnpm/store
before_script:
  - pnpm install --frozen-lockfile
\`\`\`

缓存 key 用 \`pnpm-lock.yaml\` 的哈希——lockfile 不变就命中缓存，变了就重建。

#### 3. 缓存命中率优化

- **lockfile 提交到 git**：CI 才能根据它判断缓存。
- **用 \`--frozen-lockfile\`**：保证 lockfile 不被改，缓存 key 稳定。
- **不要缓存 node_modules**：缓存 store 就够了，node_modules 由 store 硬链接生成，比缓存它更快更省。

### 七、offline 安装

#### 1. pnpm install --offline

\`\`\`bash
pnpm install --offline
\`\`\`

只用本地 store，**完全不联网**。如果 store 里缺某个包，直接报错而不是下载。适合：

- 离线环境（飞机、内网）。
- 验证 store 是否完整（缺包会立刻暴露）。

#### 2. pnpm install --prefer-offline

\`\`\`bash
pnpm install --prefer-offline
\`\`\`

优先用 store，缺失才联网。比 \`--offline\` 宽容，日常开发推荐加进 npm script 加速。

### 八、virtual store：每个项目的 .pnpm 是 store 的视图

每个项目的 \`.pnpm\` 目录被称为 **virtual store**——它是全局 store 在这个项目里的"视图"。

- 全局 store：按文件哈希扁平存储，所有项目共享。
- 项目 .pnpm：按 \`包名@版本\` 组织目录，通过硬链接引用 store 里的文件。

这样设计的好处：

1. **项目隔离**：每个项目的依赖结构独立，互不影响（不像 npm 全局 hoist 会互相污染）。
2. **共享底层**：所有 .pnpm 都硬链接到同一个 store，零重复。
3. **可复现**：lockfile 锁定了 .pnpm 的结构，任何机器装出来都一样。

### 九、store 与 npm cache 的区别

| 维度 | pnpm store | npm cache (\`~/.npm\`) |
| --- | --- | --- |
| **存储内容** | 解压后的文件（按哈希去重） | 下载的 tarball（压缩包） |
| **去重粒度** | 文件级（同一文件全局一份） | 包级（同版本包一份 tarball） |
| **安装时** | 硬链接（零拷贝） | 解压 + 拷贝（有 IO 开销） |
| **跨项目共享** | 是（硬链接） | 否（每项目独立拷贝） |
| **完整性校验** | 哈希校验每个文件 | 只校验 tarball 整体 |
| **清理命令** | \`pnpm store prune\` | \`npm cache clean --force\` |

### 十、最佳实践与陷阱

#### 最佳实践

1. **CI 缓存 store**：用 \`cache: pnpm\` 或手动缓存 store 目录，CI 安装提速 5~10 倍。
2. **定期 \`pnpm store prune\`**：清理孤儿文件，释放磁盘（每月跑一次即可）。
3. **lockfile 提交 git**：CI 缓存 key 依赖它。
4. **离线场景用 \`--offline\`**：内网/飞机上开发。
5. **store 放在快速磁盘**：SSD 上 store 性能远好于 HDD，大项目差距明显。

#### 常见陷阱

1. **跨文件系统硬链接失败**：store 和项目在不同分区，硬链接会失败。解决：把 store 配置到项目所在分区（\`store-dir\`）。
2. **Docker 里 store 不共享**：每个容器独立，跨 build 缓存要用 BuildKit 的 cache mount。
3. **prune 删了"将来要用"的包**：默认 prune 保守，加 \`--force\` 才激进删。一般不需要 \`--force\`。
4. **store 损坏**：极少见，如果发生，\`pnpm store status\` 能检测，极端情况删 store 重装。
5. **node_modules 跨平台不通用**：硬链接是文件系统级的，Windows 的 node_modules 不能拷到 Linux 用。

### 十一、本章小结

- pnpm 用**内容寻址 store** 全局去重存储，相同文件只存一份。
- store 默认在 \`~/.local/share/pnpm/store\`，可用 \`pnpm store path\` 查看。
- \`pnpm store status\` 检查完整性，\`pnpm store prune\` 清理孤儿文件。
- 两层链接：**store → 项目 .pnpm 用硬链接**（零拷贝），**.pnpm → node_modules 用符号链接**（组织依赖）。
- 跨项目共享 store，磁盘占用是 npm 的 1/5~1/10。
- CI 缓存 store 目录（\`cache: pnpm\`）大幅加速安装。
- \`--offline\` 纯本地安装，\`--prefer-offline\` 优先本地。
- 每个项目的 \`.pnpm\` 是 virtual store，全局 store 的视图。

下一章讲 pnpm 的发布与部署。`,
    code: `#!/usr/bin/env bash
# ============================================================
# 第四章演示：pnpm 缓存与 Store 命令模拟
# ------------------------------------------------------------
# 注意：本沙箱环境未安装 pnpm，输出均为 echo 模拟。
# ============================================================

set -e

echo "============================================================"
echo "  pnpm 缓存与 Store 模拟演示"
echo "============================================================"
echo ""

# ------------------------------------------------------------
# 1. 模拟 pnpm store path
# ------------------------------------------------------------
echo "【命令】pnpm store path"
echo "（模拟输出，查看全局 store 位置）"
echo "--------------------------------------------"
echo "/Users/you/.local/share/pnpm/store/v3"
echo ""
echo "说明：所有项目共享这个全局 store，按文件哈希去重存储。"
echo ""

# ------------------------------------------------------------
# 2. 展示 store 目录结构
# ------------------------------------------------------------
echo "【目录】store 内部结构"
echo "（模拟 tree 输出，按哈希前两位分桶）"
echo "--------------------------------------------"
cat <<'EOF'
~/.local/share/pnpm/store/
└── v3/
    └── files/
        ├── ab/
        │   ├── cdef0123...   ← 某个文件的完整哈希
        │   └── 12345678...
        ├── 9f/
        │   └── 8765abcd...
        └── ...
EOF
echo ""
echo "说明：files/ 下按哈希前两位分桶，文件名是完整哈希。"
echo "      相同内容（同哈希）的文件全局只存一份。"
echo ""

# ------------------------------------------------------------
# 3. 模拟 pnpm store status
# ------------------------------------------------------------
echo "【命令】pnpm store status"
echo "（模拟输出，检查 store 完整性）"
echo "--------------------------------------------"
echo "No packages marked for removal found"
echo ""
echo "说明：如果 store 里有损坏或被标记删除的包，会在这里报告。"
echo ""

# ------------------------------------------------------------
# 4. 模拟 pnpm store prune
# ------------------------------------------------------------
echo "【命令】pnpm store prune"
echo "（模拟输出，清理未引用的孤儿文件）"
echo "--------------------------------------------"
echo "Pruning store...
Removed 42 unused packages
Removed 1560 unused files
Freed 128.3 MB"
echo ""
echo "说明：prune 删除没被任何项目引用的文件，安全可放心跑。"
echo "      不会删正在被项目引用的文件。"
echo ""

# ------------------------------------------------------------
# 5. 展示硬链接 + 符号链接的存储结构
# ------------------------------------------------------------
echo "【结构】两层链接协作：store -> .pnpm -> node_modules"
echo "（模拟展示依赖的链接路径）"
echo "--------------------------------------------"
echo "假设执行了 pnpm add express，依赖的完整链接路径："
echo ""
cat <<'EOF'
node_modules/express                         [符号链接]
    |
    v 指向
.pnpm/express@4.18.2/node_modules/express   [真实文件，硬链接到 store]
    |
    v 硬链接到
~/.local/share/pnpm/store/v3/files/ab/cdef0123...   [全局 store 真实数据]
EOF
echo ""
echo "关键："
echo "  - store -> .pnpm：硬链接（零拷贝，同一份磁盘数据）"
echo "  - .pnpm -> node_modules：符号链接（组织依赖关系）"
echo ""

# ------------------------------------------------------------
# 6. 展示 .pnpm 目录结构
# ------------------------------------------------------------
echo "【目录】项目 .pnpm（virtual store）"
echo "（模拟 ls node_modules/.pnpm 输出）"
echo "--------------------------------------------"
cat <<'EOF'
node_modules/.pnpm/
├── express@4.18.2/
│   └── node_modules/
│       ├── express/          (真实文件，硬链接自 store)
│       ├── body-parser -> ../../body-parser@1.20.1/...  (符号链接)
│       └── qs -> ../../qs@6.11.0/...                     (符号链接)
├── body-parser@1.20.1/
│   └── node_modules/...
└── qs@6.11.0/
    └── node_modules/...
EOF
echo ""

# ------------------------------------------------------------
# 7. 对比 pnpm store 与 npm cache 的磁盘占用
# ------------------------------------------------------------
echo "【对比】5 个相似项目的磁盘占用"
echo "（模拟数据，对比 npm 和 pnpm）"
echo "--------------------------------------------"
printf "%-25s %-15s %-15s\\n" "方案" "磁盘占用" "安装速度"
printf "%-25s %-15s %-15s\\n" "npm（每项目拷贝）" "5 x 400MB" "慢（解压拷贝）"
printf "%-25s %-15s %-15s\\n" "pnpm（store 共享）" "~400MB" "快（硬链接秒装）"
echo ""
echo "说明：pnpm store 让 5 个项目共享一份文件，磁盘省 5~10 倍。"
echo ""

# ------------------------------------------------------------
# 8. 模拟 offline 安装
# ------------------------------------------------------------
echo "【命令】pnpm install --offline"
echo "（模拟输出，只用本地 store 不联网）"
echo "--------------------------------------------"
echo "Progress: resolved 320, reused 320, downloaded 0, added 320"
echo "Done in 1.2s"
echo ""
echo "说明：--offline 完全不联网，缺包直接报错。"
echo "      适合离线环境或验证 store 完整性。"
echo ""

# ------------------------------------------------------------
# 9. 展示 CI 缓存配置（GitHub Actions）
# ------------------------------------------------------------
echo "【配置】GitHub Actions 缓存 pnpm store"
echo "（模拟 .github/workflows/ci.yml 片段）"
echo "--------------------------------------------"
cat <<'EOF'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm          # 关键：缓存 pnpm store
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
EOF
echo ""
echo "说明：cache: pnpm 自动缓存 store 目录。"
echo "      首次运行填充缓存，后续命中缓存秒级安装。"
echo ""

# ------------------------------------------------------------
# 10. 展示通用 CI 手动缓存配置
# ------------------------------------------------------------
echo "【配置】通用 CI 手动缓存 store"
echo "（模拟 .gitlab-ci.yml 片段）"
echo "--------------------------------------------"
cat <<'EOF'
cache:
  key: pnpm-store-$CI_COMMIT_REF_SLUG
  paths:
    - ~/.local/share/pnpm/store
before_script:
  - pnpm install --frozen-lockfile
EOF
echo ""
echo "说明：缓存 key 用分支或 lockfile 哈希，lockfile 不变就命中。"
echo ""

# ------------------------------------------------------------
# 11. 模拟 store 跨文件系统问题
# ------------------------------------------------------------
echo "【陷阱】store 跨文件系统硬链接失败"
echo "（模拟报错）"
echo "--------------------------------------------"
echo "ERROR: Unable to create hard link"
echo "  /Users/you/.local/share/pnpm/store/v3/files/... ->"
echo "  /Volumes/external/project/.pnpm/express@4.18.2/..."
echo ""
echo "Reason: cross-device link not permitted"
echo ""
echo "解决：把 store 配置到项目所在分区"
echo "  # .npmrc"
echo "  store-dir=/Volumes/external/pnpm-store"
echo ""

echo "============================================================"
echo "  演示结束。以上输出均为模拟，真实环境请安装 pnpm 后执行。"
echo "============================================================"`,
  },

  // =========================================================
  // 第五章：发布与部署
  // =========================================================
  {
    id: "pnpm-publish",
    title: "发布与部署",
    icon: "🚀",
    group: "依赖管理与工作区",
    content: `## 发布与部署：把包送到用户手里

写完一个库，下一步就是发布到 npm registry 让别人能用。发布看似简单（一条命令），实则暗藏无数坑：包内容控制、版本管理、认证、2FA、CI 自动发布、monorepo 多包发布……本章系统讲解 pnpm 的发布流程、版本管理、changesets 集成和 CI/CD 自动化，帮你避开发布路上的所有雷。

### 一、pnpm publish：发布包到 registry

#### 1. 基本发布

\`\`\`bash
pnpm publish
\`\`\`

执行后 pnpm 会：

1. 检查当前目录是否是个合法的包（有 package.json 且 name/version 合法）。
2. 运行 \`prepublishOnly\` 脚本（如果定义了，常用来跑测试 + 构建）。
3. 把要发布的文件打包成 tarball。
4. 上传到 registry（默认 npmjs.com）。
5. 注册新版本。

#### 2. --access public：发布公开 scoped 包

scoped 包（名字带 \`@scope/\`，如 \`@my-org/utils\`）默认发布为 **restricted（私有付费）**。要发布为公开免费包，必须加 \`--access public\`：

\`\`\`bash
pnpm publish --access public
\`\`\`

非 scoped 包（如 \`lodash\`）不需要这个 flag，它默认就是公开的。

> ⚠️ **常见坑**：scoped 包忘了加 \`--access public\`，会报错 \`You need a paid account to perform this action\`，因为 npm 把 scoped 包默认当成私有付费包。

#### 3. --tag：发布预发布版本

npm 用 **dist-tag（分发标签）** 区分不同发布通道。默认标签是 \`latest\`（\`npm install pkg\` 装的就是 latest）。

\`\`\`bash
# 发布 beta 版本到 beta 标签
pnpm publish --tag beta

# 发布 next 预览版到 next 标签
pnpm publish --tag next
\`\`\`

用户用 \`npm install pkg@beta\` 装 beta 版，\`npm install pkg@next\` 装 next 版，互不影响。正式版用 \`pnpm publish\`（默认 latest）。

#### 4. --no-git-checks：跳过 git 检查

pnpm publish 默认会检查：

- 当前分支是否干净（无未提交改动）。
- 当前分支是否已推送到远程。
- 是否在正确的分支（默认期望 main/master）。

CI 自动发布时这些检查可能干扰，用 \`--no-git-checks\` 跳过：

\`\`\`bash
pnpm publish --no-git-checks
\`\`\`

#### 5. --dry-run：试运行不真发布

\`\`\`bash
pnpm publish --dry-run
\`\`\`

模拟整个发布流程，但**不上传到 registry**。会打印出将要发布的文件列表、版本号、tarball 大小。发布前必跑一遍，确认发布内容正确。

### 二、pnpm pack：预览打包内容

\`pnpm pack\` 把包打成 tarball（.tgz），但不发布，留在本地。这是发布前最重要的检查工具。

\`\`\`bash
pnpm pack
# 生成 my-package-1.0.0.tgz
\`\`\`

#### 查看 tarball 内容

\`\`\`bash
tar -tzf my-package-1.0.0.tgz
# 输出包内所有文件列表
\`\`\`

这能确认：

- 该发的文件（dist/、package.json、README）都在。
- 不该发的文件（src/、test/、.env）没混进去。

> 💡 **强烈建议**：每次发布前 \`pnpm pack\` + 检查内容列表，防止把源码、测试、密钥发到 npm（一旦发出，即使 unpublish 也可能已被缓存）。

### 三、.npmignore vs files 字段：控制发布内容

发布到 npm 的包，不该包含所有项目文件。有两种方式控制"哪些文件被发布"：

#### 1. files 字段（推荐）

在 \`package.json\` 里用 \`files\` 白名单声明要发布的文件：

\`\`\`json
{
  "files": [
    "dist",
    "lib",
    "README.md",
    "LICENSE"
  ]
}
\`\`\`

只有列出的文件/目录会被打包。这是**白名单**方式，更安全（默认不发，显式声明才发）。

**始终被包含的文件**（不受 files 控制）：\`package.json\`、\`README\`、\`LICENSE/LICENCE\`、\`CHANGELOG\`。

**始终被排除的文件**：\`.git\`、\`node_modules\`、\`.npmrc\`、\`npm-debug.log\`。

#### 2. .npmignore（黑名单）

在项目根目录创建 \`.npmignore\`，声明要排除的文件：

\`\`\`
src/
test/
*.test.js
.env
.editorconfig
\`\`\`

这是**黑名单**方式，默认全发，显式排除才不发。

#### 3. files vs .npmignore 对比

| 维度 | \`files\` 字段 | \`.npmignore\` |
| --- | --- | --- |
| 模式 | 白名单（默认不发） | 黑名单（默认全发） |
| 安全性 | 高（漏发不会泄露） | 低（漏排会泄露） |
| 维护 | 加新目录要记得加 | 加新目录默认不发（除非排除） |
| 推荐 | **推荐** | 不推荐（除非老项目迁移） |

> ⚠️ **最佳实践**：用 \`files\` 白名单。\`.npmignore\` 是黑名单，一旦加新文件忘了排除，可能把 \`src/\` 或 \`.env\` 发出去。npm 历史上多次发生密钥泄露事件，都是 .npmignore 漏排导致。

### 四、pnpm -r publish：发布所有工作区包

monorepo 里要发布多个包，用 \`-r\` 递归：

\`\`\`bash
# 发布所有工作区包
pnpm -r publish --access public

# 配合 --filter 精确发布
pnpm --filter @my-org/* publish --access public

# 跳过 git 检查（CI 用）
pnpm -r publish --access public --no-git-checks
\`\`\`

pnpm 会遍历所有工作区包，逐个发布。注意：

1. 只有 \`"private": false\` 的包才会被发布（\`private: true\` 的根包和应用包会被跳过）。
2. \`workspace:*\` 协议会自动替换成实际版本号。
3. 如果某个包版本已存在，会报错跳过（不会中断其他包的发布）。

### 五、pnpm version：管理版本号

#### 1. 升级版本

\`\`\`bash
pnpm version patch      # 1.0.0 -> 1.0.1（修 bug）
pnpm version minor      # 1.0.0 -> 1.1.0（加功能，向后兼容）
pnpm version major      # 1.0.0 -> 2.0.0（破坏性变更）
pnpm version 1.5.0      # 直接设成指定版本
\`\`\`

执行后会：

1. 修改 \`package.json\` 的 \`version\` 字段。
2. 创建一个 git commit（消息默认是版本号，如 \`v1.0.1\`）。
3. 创建一个 git tag（如 \`v1.0.1\`）。

#### 2. 预发布版本

\`\`\`bash
pnpm version prerelease     # 1.0.0 -> 1.0.0-0
pnpm version prerelease     # 1.0.0-0 -> 1.0.0-1
pnpm version prerelease --preid beta   # 1.0.0 -> 1.0.0-beta.0
\`\`\`

预发布版本配合 \`--tag beta\` 发布：

\`\`\`bash
pnpm version prerelease --preid beta
pnpm publish --tag beta --access public
\`\`\`

#### 3. --no-git-tag-version：不创建 git 提交

CI 自动发布时不想让 pnpm 自动提交，加 \`--no-git-tag-version\`：

\`\`\`bash
pnpm version patch --no-git-tag-version
\`\`\`

只改 \`package.json\`，不动 git。

### 六、changesets：管理版本和 changelog

手动管理 monorepo 多包版本和 changelog 是噩梦——改了 A 要升 A 的版本、写 A 的 changelog、还要更新依赖 A 的 B 的版本……[changesets](https://github.com/changesets/changesets) 是社区主流方案，pnpm 项目里广泛使用。

#### 1. 工作流程

\`\`\`bash
# 安装 changesets
pnpm add -Dw @changesets/cli
pnpm changeset init

# 每次开发完，记录"这次改了什么"
pnpm changeset
# 交互式选择：改了哪些包、版本升级类型（patch/minor/major）、写了什么 changelog
# 生成 .changeset/xxx.md 文件

# 发布前：消费所有 changeset，升版本 + 生成 CHANGELOG.md
pnpm changeset version

# 发布
pnpm -r publish --access public
\`\`\`

#### 2. changeset 文件长什么样

\`\`\`markdown
---
"@my-org/shared-ui": minor
"@my-org/utils": patch
---

Added a new Button component to shared-ui; fixed a typo in utils.
\`\`\`

这表示：\`shared-ui\` 升 minor，\`utils\` 升 patch，对应的 changelog 条目是那行描述。\`changeset version\` 会消费它，更新各包版本和 CHANGELOG.md。

#### 3. CI 自动发布

changesets 提供 \`changesets/action\` GitHub Action，能自动在 PR 合并后发版：

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
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - uses: changesets/action@v1
        with:
          publish: pnpm -r publish --access public --no-git-checks
        env:
          NPM_TOKEN: $\{{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: $\{{ secrets.GITHUB_TOKEN }}
\`\`\`

工作方式：开发者提 PR 时附带 changeset；PR 合并后，Action 自动消费 changeset、升版本、生成 changelog、发布到 npm、创建 GitHub Release。全自动，开发者无需手动发版。

### 七、发布流程：version → pack → publish

完整的人工发布流程：

\`\`\`bash
# 1. 确认测试通过
pnpm test

# 2. 构建
pnpm build

# 3. 升版本（会改 package.json + 创建 git tag）
pnpm version minor

# 4. 预览打包内容（检查别误发文件）
pnpm pack
tar -tzf *.tgz

# 5. 推送 tag 和代码
git push --follow-tags

# 6. 发布
pnpm publish --access public

# 7. 清理 tgz
rm *.tgz
\`\`\`

### 八、CI/CD 自动发布：GitHub Actions

把上面的流程自动化到 CI，每次打 tag 自动发布：

\`\`\`yaml
# .github/workflows/publish.yml
name: Publish
on:
  push:
    tags: ['v*']
jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          registry-url: https://registry.npmjs.org
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm publish --access public --no-git-checks
        env:
          NODE_AUTH_TOKEN: $\{{ secrets.NPM_TOKEN }}
\`\`\`

关键点：

- \`registry-url: https://registry.npmjs.org\` 让 setup-node 配置好 \`.npmrc\` 的认证。
- \`NODE_AUTH_TOKEN\` 环境变量携带 npm token（在 GitHub Secrets 里配置）。
- \`--no-git-checks\` 因为 CI 的 git 状态和本地不同。

发布流程变成：本地 \`pnpm version minor && git push --follow-tags\` → CI 自动构建+发布。

### 九、私有 registry 发布：.npmrc 配置认证

发布到公司私有 registry（如 Verdaccio、Nexus、GitHub Packages），要在 \`.npmrc\` 配置认证：

\`\`\`ini
# .npmrc
@my-org:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}
\`\`\`

- \`@my-org:registry=...\`：\`@my-org\` scope 的包发到指定 registry。
- \`//npm.pkg.github.com/:_authToken=...\`：该 registry 的认证 token。

> ⚠️ **安全**：token 不要硬编码进 \`.npmrc\` 提交到 git。用环境变量（\`$\{GITHUB_TOKEN\}\`），让 pnpm 在运行时替换。本地开发用 \`~/.npmrc\`（用户级，不进项目）。

### 十、常见发布问题

#### 1. 版本已存在

\`\`\`bash
ERROR: You cannot publish over the previously published version '1.2.0'
\`\`\`

npm registry 不允许覆盖已发布的版本。解决：升版本号再发。

#### 2. 权限不足

\`\`\`bash
ERROR: You do not have permission to publish 'lodash'
\`\`\`

包名被别人占了，或你没这个包的发布权限。解决：换包名（加 scope），或让包主给你权限。

#### 3. 2FA（两步验证）

npm 支持对发布开启 2FA。开启后发布要输入验证码。CI 自动发布要配置 **access token + automation 模式**：

- 在 npm 网站生成 \`Automation\` 类型的 token（不受 2FA 限制）。
- 把 token 配置到 CI 的 \`NODE_AUTH_TOKEN\`。

#### 4. 发布了不该发的文件

\`\`\`bash
# 24 小时内可以 unpublish
npm unpublish my-package@1.0.0

# 超过 24 小时只能发更高版本修复
\`\`\`

npm 规则：发布 72 小时内可 unpublish 单个版本；超过则不可撤回（防止依赖链断裂）。**所以发布前 \`pnpm pack\` 检查内容至关重要**。

### 十一、最佳实践与陷阱

#### 最佳实践

1. **用 \`files\` 白名单**控制发布内容，别用 .npmignore。
2. **发布前 \`pnpm pack\` 检查**，确认没误发源码/密钥。
3. **\`--dry-run\` 试运行**，CI 改动后先空跑。
4. **CI 自动发布**用 changesets 或 tag 触发，避免人工出错。
5. **token 用环境变量**，绝不硬编码进 git。
6. **scoped 包加 \`--access public\`**，避免默认私有报错。

#### 常见陷阱

1. **忘加 \`--access public\`**：scoped 包报"需要付费账户"。
2. **\`files\` 漏了 dist**：发布的包没有构建产物，用户装了用不了。
3. **版本号忘了升**：直接 \`pnpm publish\` 报"版本已存在"。
4. **token 权限错**：用 publish token 当 automation token，CI 卡在 2FA。
5. **monorepo 发布顺序**：被依赖的包要先发，否则依赖者装不上。changesets 自动处理顺序。

### 十二、本章小结

- \`pnpm publish\` 发布包，\`--access public\` 公开 scoped 包，\`--tag beta\` 发预发布版。
- \`pnpm pack\` 预览打包内容，发布前必查。
- \`files\` 字段（白名单）控制发布内容，优于 \`.npmignore\`（黑名单）。
- \`pnpm -r publish\` 发布所有工作区包，\`workspace:*\` 自动替换版本。
- \`pnpm version\` 管理版本号（patch/minor/major/prerelease）。
- changesets 管理 monorepo 版本和 changelog，配合 GitHub Action 全自动发布。
- CI 自动发布用 \`registry-url\` + \`NODE_AUTH_TOKEN\` 配置认证。
- 私有 registry 用 \`.npmrc\` 配置 scope + token（环境变量）。
- 常见问题：版本已存在、权限不足、2FA、误发文件（72 小时内可 unpublish）。

至此，pnpm 教程第二批 5 章结束。从依赖管理、工作区、覆盖补丁、缓存 store 到发布部署，你已经掌握了 pnpm 的核心工程能力。`,
    code: `#!/usr/bin/env bash
# ============================================================
# 第五章演示：pnpm 发布与部署命令模拟
# ------------------------------------------------------------
# 注意：本沙箱环境未安装 pnpm，输出均为 echo 模拟。
# ============================================================

set -e

echo "============================================================"
echo "  pnpm 发布与部署模拟演示"
echo "============================================================"
echo ""

# ------------------------------------------------------------
# 1. 模拟 pnpm pack（预览打包内容）
# ------------------------------------------------------------
echo "【命令】pnpm pack"
echo "（模拟输出，打包但不发布）"
echo "--------------------------------------------"
echo "my-package-1.0.0.tgz"
echo "package size: 12.3 kB"
echo "unpacked size: 48.6 kB"
echo "shasum: 1a2b3c4d5e6f..."
echo ""
echo "说明：pack 把包打成 .tgz，留在本地不发布。"
echo "      发布前用它检查打包内容是否正确。"
echo ""

# ------------------------------------------------------------
# 2. 展示 tarball 内容列表
# ------------------------------------------------------------
echo "【检查】tar -tzf my-package-1.0.0.tgz"
echo "（模拟输出，查看包内文件列表）"
echo "--------------------------------------------"
cat <<'EOF'
package/package.json
package/README.md
package/LICENSE
package/dist/index.js
package/dist/index.d.ts
package/lib/utils.js
EOF
echo ""
echo "说明：确认该发的 dist/lib/README 都在，"
echo "      不该发的 src/test/.env 没混进去。"
echo ""

# ------------------------------------------------------------
# 3. 展示 .npmignore 示例
# ------------------------------------------------------------
echo "【文件】.npmignore（黑名单方式，不推荐）"
echo "（模拟文件内容）"
echo "--------------------------------------------"
cat <<'EOF'
src/
test/
*.test.js
*.spec.js
.env
.env.local
.editorconfig
.vscode/
.github/
EOF
echo ""
echo "警告：.npmignore 是黑名单，加新文件忘了排除可能泄露源码/密钥。"
echo ""

# ------------------------------------------------------------
# 4. 展示 files 字段（推荐方式）
# ------------------------------------------------------------
echo "【文件】package.json 中的 files 字段（白名单，推荐）"
echo "（模拟文件内容）"
echo "--------------------------------------------"
cat <<'EOF'
{
  "name": "my-package",
  "version": "1.0.0",
  "files": [
    "dist",
    "lib",
    "README.md",
    "LICENSE"
  ]
}
EOF
echo ""
echo "说明：files 是白名单，只有列出的文件/目录会被发布。"
echo "      始终包含：package.json / README / LICENSE / CHANGELOG"
echo "      始终排除：.git / node_modules / .npmrc"
echo ""

# ------------------------------------------------------------
# 5. 模拟 pnpm publish
# ------------------------------------------------------------
echo "【命令】pnpm publish --access public"
echo "（模拟输出，发布 scoped 包到 npm）"
echo "--------------------------------------------"
echo "npm notice
npm notice package: my-package@1.0.0
npm notice === Tarball Contents ===
npm notice 1.2kB  package.json
npm notice 5.4kB  dist/index.js
npm notice 2.1kB  dist/index.d.ts
npm notice 3.0kB  README.md
npm notice 1.0kB  LICENSE
npm notice === Tarball Details ===
npm notice name:          my-package
npm notice version:       1.0.0
npm notice filename:      my-package-1.0.0.tgz
npm notice package size:  12.3 kB
npm notice unpacked size: 48.6 kB
npm notice total files:   5
npm notice
my-package@1.0.0"
echo ""
echo "+ my-package@1.0.0"
echo "Done in 6.7s"
echo ""

# ------------------------------------------------------------
# 6. 模拟 pnpm publish --tag beta（预发布）
# ------------------------------------------------------------
echo "【命令】pnpm publish --tag beta --access public"
echo "（模拟输出，发布到 beta 标签）"
echo "--------------------------------------------"
echo "+ my-package@1.1.0-beta.0"
echo "Done in 5.2s"
echo ""
echo "说明：用户用 npm install my-package@beta 安装 beta 版。"
echo "      不影响 latest（正式版），互不干扰。"
echo ""

# ------------------------------------------------------------
# 7. 模拟 pnpm version patch
# ------------------------------------------------------------
echo "【命令】pnpm version patch"
echo "（模拟输出，升级 patch 版本号）"
echo "--------------------------------------------"
echo "v1.0.1"
echo ""
echo "说明：1.0.0 -> 1.0.1（修 bug）。"
echo "      会自动：改 package.json + 创建 git commit + 创建 git tag。"
echo ""

# ------------------------------------------------------------
# 8. 展示 version 升级规则
# ------------------------------------------------------------
echo "【对比】版本号升级规则（语义化版本 semver）"
echo "（模拟展示）"
echo "--------------------------------------------"
printf "%-15s %-12s %-12s %s\\n" "命令" "变化" "示例" "用途"
printf "%-15s %-12s %-12s %s\\n" "version patch" "x.y.Z" "1.0.0->1.0.1" "修 bug"
printf "%-15s %-12s %-12s %s\\n" "version minor" "x.Y.0" "1.0.0->1.1.0" "加功能(兼容)"
printf "%-15s %-12s %-12s %s\\n" "version major" "X.0.0" "1.0.0->2.0.0" "破坏性变更"
printf "%-15s %-12s %-12s %s\\n" "version prerelease" "预发布" "1.0.0->1.0.0-0" "预览版"
echo ""

# ------------------------------------------------------------
# 9. 模拟 pnpm -r publish（monorepo 多包发布）
# ------------------------------------------------------------
echo "【命令】pnpm -r publish --access public --no-git-checks"
echo "（模拟输出，发布所有工作区包）"
echo "--------------------------------------------"
echo "@my-org/utils       1.0.0  -> published"
echo "@my-org/shared-ui   1.2.0  -> published"
echo "@my-org/core        0.5.0  -> published"
echo ""
echo "Done in 12.3s"
echo ""
echo "说明：-r 递归发布所有非 private 工作区包。"
echo "      workspace:* 协议自动替换为实际版本号。"
echo "      版本已存在的包会跳过，不中断其他包。"
echo ""

# ------------------------------------------------------------
# 10. 展示 changesets 工作流
# ------------------------------------------------------------
echo "【流程】changesets 管理 monorepo 版本和 changelog"
echo "（模拟工作流）"
echo "--------------------------------------------"
echo "1. 开发完记录 changeset："
echo "   $ pnpm changeset"
echo "   交互选择：改了哪些包 / 升级类型 / changelog 描述"
echo ""
echo "生成的 .changeset/spicy-cats.md："
cat <<'EOF'
---
"@my-org/shared-ui": minor
"@my-org/utils": patch
---

Added Button component to shared-ui; fixed typo in utils.
EOF
echo ""
echo "2. 发布前消费 changeset 升版本 + 生成 CHANGELOG："
echo "   $ pnpm changeset version"
echo "   -> shared-ui: 1.1.0 -> 1.2.0 (minor)"
echo "   -> utils:     1.0.0 -> 1.0.1 (patch)"
echo "   -> 生成/更新 各包 CHANGELOG.md"
echo ""
echo "3. 发布："
echo "   $ pnpm -r publish --access public"
echo ""

# ------------------------------------------------------------
# 11. 展示 GitHub Actions 自动发布配置
# ------------------------------------------------------------
echo "【配置】GitHub Actions tag 触发自动发布"
echo "（模拟 .github/workflows/publish.yml）"
echo "--------------------------------------------"
cat <<'EOF'
name: Publish
on:
  push:
    tags: ['v*']
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          registry-url: https://registry.npmjs.org
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm publish --access public --no-git-checks
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}
EOF
echo ""
echo "说明：本地 pnpm version + git push --follow-tags 后，"
echo "      CI 自动构建并发布。NODE_AUTH_TOKEN 在 Secrets 配置。"
echo ""

# ------------------------------------------------------------
# 12. 展示私有 registry 配置
# ------------------------------------------------------------
echo "【配置】发布到私有 registry（.npmrc）"
echo "（模拟 .npmrc 内容）"
echo "--------------------------------------------"
cat <<'EOF'
@my-org:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}
EOF
echo ""
echo "说明：@my-org scope 的包发到 GitHub Packages。"
echo "      token 用环境变量，绝不硬编码进 git。"
echo ""

# ------------------------------------------------------------
# 13. 模拟常见发布错误
# ------------------------------------------------------------
echo "【陷阱】常见发布错误"
echo "（模拟报错信息）"
echo "--------------------------------------------"
echo "错误 1：版本已存在"
echo "  ERROR: cannot publish over the previously published version '1.2.0'"
echo "  解决：升版本号再发"
echo ""
echo "错误 2：scoped 包忘加 --access public"
echo "  ERROR: You need a paid account to perform this action"
echo "  解决：pnpm publish --access public"
echo ""
echo "错误 3：权限不足"
echo "  ERROR: You do not have permission to publish 'lodash'"
echo "  解决：换包名（加 scope）或让包主授权"
echo ""
echo "错误 4：2FA 拦截 CI"
echo "  解决：npm 网站生成 Automation 类型 token（不受 2FA 限制）"
echo ""

echo "============================================================"
echo "  演示结束。以上输出均为模拟，真实环境请安装 pnpm 后执行。"
echo "============================================================"`,
  },
];
