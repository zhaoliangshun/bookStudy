export const chapters = [
  {
    id: "n4-npm",
    group: "第一部分 入门基础",
    icon: "📦",
    title: "npm 包管理器：安装、管理与发布",
    content: `# npm 包管理器：安装、管理与发布

npm（Node Package Manager）是 Node.js 的默认包管理器，也是全球最大的开源软件注册表。掌握 npm 是 Node.js 开发的必备技能。

---

## 一、什么是 npm？

npm 由三个核心部分组成：

1. **CLI 命令行工具**：开发者在终端使用的 \`npm\` 命令
2. **注册表（Registry）**：存放 JavaScript 包的大型公共数据库
3. **网站**：[npmjs.com](https://www.npmjs.com) 用于搜索、查看包信息

> 💡 **类比理解**：如果把 Node.js 开发比作"做饭"，npm 就是"生鲜超市"——你不需要自己种蔬菜、养牲畜（从零写所有代码），直接从超市采购现成的食材（开源包），回家加工组合即可。

npm 随 Node.js 一起安装，安装完 Node.js 就自动有了 npm。

---

## 二、npm install：安装包的各种姿势

\`npm install\`（可简写为 \`npm i\`）是最常用的命令。

### 2.1 本地安装 vs 全局安装

| 类型 | 命令 | 安装位置 | 使用场景 |
|------|------|----------|----------|
| **本地安装** | \`npm install <pkg>\` | 当前项目 \`node_modules\` | 项目依赖的库（如 express、lodash） |
| **全局安装** | \`npm install -g <pkg>\` | 系统全局目录 | 命令行工具（如 nodemon、create-react-app） |

\`\`\`bash
# 本地安装 express 到当前项目
npm install express

# 全局安装 nodemon（到处可用）
npm install -g nodemon

# 查看全局安装位置
npm root -g
\`\`\`

### 2.2 生产依赖 vs 开发依赖

安装包时要区分依赖类型：

| 命令 | 写入位置 | 说明 |
|------|----------|------|
| \`npm install <pkg>\` | \`dependencies\` | 生产环境需要的包（如 Web 框架） |
| \`npm install -D <pkg>\` | \`devDependencies\` | 仅开发/构建需要的包（如测试框架、打包工具） |
| \`npm install -O <pkg>\` | \`optionalDependencies\` | 可选依赖，安装失败不影响 |
| \`npm install --no-save\` | 不写入 | 临时安装，不记录到 package.json |

\`\`\`bash
npm install express          # 生产依赖
npm install -D jest          # 开发依赖（测试框架）
npm install -D typescript    # 开发依赖（TS 编译器）
\`\`\`

### 2.3 安装指定版本

\`\`\`bash
# 安装最新版本
npm install lodash

# 安装精确版本
npm install lodash@4.17.21

# 安装指定大版本的最新版
npm install lodash@4

# 安装指定 tag（如 beta、next）
npm install react@beta
\`\`\`

---

## 三、语义化版本（SemVer）

npm 使用语义化版本号，格式为：\`主版本号.次版本号.补丁版本号\`

| 版本位 | 名称 | 递增时机 | 示例 |
|--------|------|----------|------|
| **主版本（Major）** | X.y.z | 不兼容的 API 变更 | 1.0.0 → 2.0.0 |
| **次版本（Minor）** | x.Y.z | 向后兼容的功能新增 | 1.2.0 → 1.3.0 |
| **补丁版本（Patch）** | x.y.Z | 向后兼容的问题修复 | 1.2.3 → 1.2.4 |

### 3.1 版本范围符号

| 符号 | 含义 | 示例 | 匹配版本 |
|------|------|------|----------|
| 无符号 | 精确版本 | \`1.2.3\` | 只能是 1.2.3 |
| \`^\` | 兼容更新（不改变最左非零位） | \`^1.2.3\` | ≥1.2.3 且 <2.0.0 |
| \`~\` | 补丁级别更新 | \`~1.2.3\` | ≥1.2.3 且 <1.3.0 |
| \`>\` / \`>=\` / \`<\` / \`<=\` | 比较 | \`>=1.2.0\` | 大于等于 1.2.0 |
| \`*\` / \`x\` | 通配符 | \`1.2.x\` | 1.2.0 ~ 1.2.999 |
| \`-\` | 范围 | \`1.2.0 - 1.4.0\` | 闭区间 |
| \`||\` | 或 | \`^1 \|\| ^2\` | 1.x 或 2.x |

> ⚠️ **^ 的特殊行为**：对于 0.x.y 版本，\`^\` 只允许补丁更新，因为 0.x 表示"开发中"，API 可能随时变。例如 \`^0.2.3\` 等价于 \`>=0.2.3 <0.3.0\`。

---

## 四、package-lock.json 的作用

执行 \`npm install\` 后会自动生成/更新 \`package-lock.json\`，这个文件至关重要：

### 4.1 为什么需要 lock 文件？

package.json 中用 \`^1.2.3\` 这样的范围，不同时间安装可能得到不同版本。lock 文件做的事情：

1. **锁定依赖版本**：精确记录每个包安装的版本号
2. **记录依赖树**：记录包的依赖关系和完整性哈希
3. **保证一致性**：团队所有人、CI 环境安装的依赖完全一致

> 💡 **最佳实践**：package-lock.json **必须提交**到 Git 仓库！不要在 .gitignore 中忽略它。

### 4.2 node_modules 结构：扁平化与依赖提升

npm v3+ 采用**扁平化**结构安装依赖：

\`\`\`
node_modules/
├── express/          # 顶层安装，多个包依赖同一版本时提升
├── lodash/
├── accepts/          # express 依赖的包，也提升到顶层
├── ...
└── .package-lock.json
\`\`\`

**依赖提升（Hoisting）**：如果多个包依赖同一个包的兼容版本，npm 会把它提升到顶层 node_modules，避免重复安装。但如果版本不兼容，则嵌套安装在对应包的 node_modules 中。

---

## 五、常用 npm 命令

### 5.1 查看与更新

\`\`\`bash
# 查看已安装的包（顶层）
npm ls --depth=0

# 查看全局安装的包
npm ls -g --depth=0

# 查看哪些包已过时
npm outdated

# 更新包（遵循 semver 范围）
npm update lodash

# 更新到最新版本（忽略 semver 范围）
npm install lodash@latest
\`\`\`

### 5.2 卸载包

\`\`\`bash
# 卸载本地包，同时从 dependencies 移除
npm uninstall lodash

# 卸载开发依赖
npm uninstall -D jest

# 卸载全局包
npm uninstall -g nodemon
\`\`\`

### 5.3 npm ci：CI/CD 专用安装命令

\`npm ci\` 用于持续集成/生产环境，它比 \`npm install\` 更严格可靠：

- 严格按照 package-lock.json 安装，不修改 lock 文件
- 如果 package.json 与 lock 文件不一致，直接报错
- 安装前会删除 node_modules
- 速度更快，因为跳过了版本解析

\`\`\`bash
# CI/CD 脚本中使用
npm ci
\`\`\`

> 💡 **什么时候用 npm ci？** Docker 构建、Jenkins/GitHub Actions 流水线、生产部署时都应该用 \`npm ci\`。

---

## 六、npx：一键执行包命令

\`npx\` 是 npm v5.2+ 自带的工具，用于执行 npm 包中的二进制文件。

### 6.1 为什么需要 npx？

以前要运行项目本地安装的工具，要么写在 npm scripts 里，要么用长长的路径：

\`\`\`bash
# 以前：要调用本地安装的 jest
./node_modules/.bin/jest

# 或者在 package.json scripts 里配
"test": "jest"
\`\`\`

npx 让这变得简单：

\`\`\`bash
# 自动查找本地 node_modules/.bin 或临时下载执行
npx jest

# 不需要全局安装 create-react-app，直接运行
npx create-react-app my-app

# 指定版本运行
npx node@14 -e "console.log(process.version)"
\`\`\`

---

## 七、yarn 和 pnpm 简介

npm 不是唯一的选择，社区还有两个流行的包管理器：

| 特性 | npm | yarn | pnpm |
|------|-----|------|------|
| **锁文件** | package-lock.json | yarn.lock | pnpm-lock.yaml |
| **安装速度** | 一般 | 快（并行下载、缓存） | 很快（硬链接、内容寻址） |
| **磁盘占用** | 高（每个项目一份） | 高 | 低（全局 store 硬链接共享） |
| **node_modules 结构** | 扁平 | 扁平 | 非扁平（严格隔离） |
| **Monorepo 支持** | workspaces | workspaces | workspaces（原生强） |

> 💡 **如何选择？** 新手先用 npm；项目大了或 monorepo 可以考虑 pnpm（节省磁盘、更快、幽灵依赖问题解决得好）。
`,
    code: `// ============================================
// npm 包管理器实用操作演示
// 注意：本脚本使用 child_process 模拟常用 npm 命令操作
// 实际使用时请在终端直接运行 npm 命令
// ============================================

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 辅助函数：执行命令并打印结果
function run(cmd, options = {}) {
  console.log(\`\\n$ \${cmd}\`);
  try {
    const result = execSync(cmd, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      ...options 
    });
    if (result) console.log(result.trim());
    return result;
  } catch (e) {
    console.log('(命令执行结果:', e.message?.split('\\n')[0] + ')');
    return null;
  }
}

// ============ demo 1: 查看 npm 基本信息 ============
console.log('=== Demo 1: npm 基本信息 ===');
run('npm --version');
run('node --version');
run('npm config get registry');
run('npm root -g');

// ============ demo 2: 创建临时项目演示 package.json 操作 ============
console.log('\\n=== Demo 2: 创建项目模拟 npm 操作 ===');

const tmpDir = path.join(os.tmpdir(), 'npm-demo-' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });
console.log('临时项目目录:', tmpDir);

// 保存当前目录，稍后切换回来
const originalDir = process.cwd();
process.chdir(tmpDir);

// 初始化 package.json（用 -y 默认配置）
console.log('\\n--- 初始化 package.json ---');
run('npm init -y');

// 读取并显示生成的 package.json
const pkgPath = path.join(tmpDir, 'package.json');
let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
console.log('\\n初始 package.json 内容:');
console.log(JSON.stringify(pkg, null, 2));

// ============ demo 3: 安装生产依赖和开发依赖 ============
console.log('\\n=== Demo 3: 安装依赖 ===');
console.log('（演示：安装一个小型生产依赖和开发依赖）');

// 安装 is-odd 作为生产依赖（非常小的包）
run('npm install is-odd', { timeout: 30000 });

// 安装 semver 作为开发依赖
run('npm install -D semver', { timeout: 30000 });

// 重新读取 package.json 查看依赖字段
pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
console.log('\\n安装后的 dependencies:', pkg.dependencies);
console.log('安装后的 devDependencies:', pkg.devDependencies);

// ============ demo 4: 演示 semver 版本匹配 ============
console.log('\\n=== Demo 4: SemVer 语义化版本演示 ===');

try {
  const semver = require(path.join(tmpDir, 'node_modules', 'semver'));
  
  const testVersions = ['1.2.3', '1.2.4', '1.3.0', '2.0.0', '0.2.5', '0.3.0'];
  const ranges = ['^1.2.3', '~1.2.3', '1.2.x', '>=1.2.0 <2.0.0', '^0.2.3'];
  
  console.log('版本范围匹配演示:');
  console.log('-'.repeat(70));
  
  for (const range of ranges) {
    const matches = testVersions.filter(v => semver.satisfies(v, range));
    console.log(\`范围 \${range.padEnd(18)} 匹配:\`, matches.join(', '));
  }
  
  // 演示主要版本比较
  console.log('\\n版本比较:');
  console.log('semver.gt("2.0.0", "1.9.9"):', semver.gt('2.0.0', '1.9.9'));
  console.log('semver.major("1.2.3"):', semver.major('1.2.3'));
  console.log('semver.minor("1.2.3"):', semver.minor('1.2.3'));
  console.log('semver.patch("1.2.3"):', semver.patch('1.2.3'));
  
  // 版本递增
  console.log('\\n版本递增(bump):');
  console.log('patch 升级:', semver.inc('1.2.3', 'patch'));
  console.log('minor 升级:', semver.inc('1.2.3', 'minor'));
  console.log('major 升级:', semver.inc('1.2.3', 'major'));
} catch (e) {
  console.log('semver 包加载演示跳过（需要网络安装）');
}

// ============ demo 5: 使用已安装的包 ============
console.log('\\n=== Demo 5: 使用安装的 npm 包 ===');
try {
  const isOdd = require(path.join(tmpDir, 'node_modules', 'is-odd'));
  console.log('is-odd 包演示:');
  for (let i = 0; i <= 5; i++) {
    console.log(\`  \${i} 是奇数吗?\`, isOdd(i));
  }
} catch (e) {
  console.log('is-odd 包演示跳过');
}

// ============ demo 6: 查看 package-lock.json 结构 ============
console.log('\\n=== Demo 6: package-lock.json 结构 ===');
const lockPath = path.join(tmpDir, 'package-lock.json');
if (fs.existsSync(lockPath)) {
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  console.log('lockfileVersion:', lock.lockfileVersion);
  console.log('记录的包数量:', Object.keys(lock.packages || {}).length);
  console.log('\\n依赖树中包含的包（部分）:');
  let count = 0;
  for (const pkgPath of Object.keys(lock.packages || {})) {
    if (pkgPath && count < 8) {
      const info = lock.packages[pkgPath];
      console.log(\`  \${pkgPath.replace('node_modules/', '')}@\${info.version}\`);
      count++;
    }
  }
}

// ============ demo 7: npm ls 查看依赖树 ============
console.log('\\n=== Demo 7: npm 依赖列表 ===');
run('npm ls --depth=1');

// ============ demo 8: 检查过时包 ============
console.log('\\n=== Demo 8: 检查过时包 ===');
run('npm outdated');

// ============ demo 9: 模拟 node_modules 扁平化结构 ============
console.log('\\n=== Demo 9: node_modules 目录结构（扁平化）===');
const nmPath = path.join(tmpDir, 'node_modules');
if (fs.existsSync(nmPath)) {
  const packages = fs.readdirSync(nmPath).filter(f => !f.startsWith('.'));
  console.log(\`node_modules 顶层有 \${packages.length} 个目录:\`);
  packages.slice(0, 10).forEach(p => {
    try {
      const pjPath = path.join(nmPath, p, 'package.json');
      if (fs.existsSync(pjPath)) {
        const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
        console.log(\`  📦 \${p}@\${pj.version}\`);
      }
    } catch (e) {}
  });
  if (packages.length > 10) {
    console.log(\`  ... 还有 \${packages.length - 10} 个包\`);
  }
}

// ============ demo 10: npx 演示 ============
console.log('\\n=== Demo 10: npx 命令演示 ===');
console.log('npx 可以:');
console.log('  1. 运行本地 node_modules/.bin 中的命令');
console.log('  2. 临时下载并执行包（不用全局安装）');
console.log('  3. 测试不同版本的包');
run('npx --version');

// 清理临时目录
process.chdir(originalDir);
setTimeout(() => {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    console.log('\\n🧹 临时目录已清理');
  } catch (e) {}
}, 500);

console.log('\\n💡 npm 常用命令速查:');
console.log('  npm install / npm i    - 安装所有依赖');
console.log('  npm i <pkg>            - 安装生产依赖');
console.log('  npm i -D <pkg>         - 安装开发依赖');
console.log('  npm i -g <pkg>         - 全局安装');
console.log('  npm uninstall <pkg>    - 卸载');
console.log('  npm update <pkg>       - 更新');
console.log('  npm outdated           - 查看过时包');
console.log('  npm ls                 - 查看已安装包');
console.log('  npm ci                 - CI 环境严格安装');
console.log('  npx <cmd>              - 执行包命令');
`
  },
  {
    id: "n4-package-json",
    group: "第一部分 入门基础",
    icon: "📄",
    title: "package.json 详解：项目的身份证",
    content: `# package.json 详解：项目的身份证

每个 Node.js 项目（包）的根目录都有一个 \`package.json\` 文件，它就像是项目的"身份证"——记录项目的名称、版本、依赖、脚本等所有元信息。

---

## 一、为什么需要 package.json？

想象一下：
- 你从 GitHub 克隆了一个项目，怎么知道它依赖哪些包？
- 怎么运行项目？怎么启动开发服务器？怎么跑测试？
- 你写了一个工具想分享给别人，怎么告诉别人你的项目叫什么、怎么安装？

package.json 回答了所有这些问题。它是项目的入口和说明书。

### 初始化 package.json

\`\`\`bash
# 交互式创建，回答一系列问题
npm init

# 一键生成默认配置（推荐快速开始）
npm init -y
\`\`\`

---

## 二、核心字段详解

### 2.1 基础标识字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| \`name\` | string | ✅ 发布时必填 | 包名，全小写，不能有空格 |
| \`version\` | string | ✅ 发布时必填 | 语义化版本号，如 "1.2.3" |
| \`description\` | string | - | 包的简短描述，便于搜索 |
| \`keywords\` | string[] | - | 关键词数组，npm 搜索用 |
| \`homepage\` | string | - | 项目主页 URL |
| \`license\` | string | - | 开源协议（MIT, ISC, Apache-2.0 等） |

\`\`\`json
{
  "name": "my-awesome-app",
  "version": "1.0.0",
  "description": "一个超棒的 Node.js 应用",
  "keywords": ["nodejs", "web", "api"],
  "license": "MIT"
}
\`\`\`

> 💡 **name 命名规则**：
> - 长度 ≤ 214 字符
> - 不能以点或下划线开头
> - 大写字母会被自动转小写
> - 可以加 scope，如 \`@vue/cli\`（组织包）

### 2.2 入口字段

| 字段 | 说明 | 适用环境 |
|------|------|----------|
| \`main\` | CommonJS 入口文件，默认 \`index.js\` | Node.js (CJS) |
| \`module\` | ES Module 入口文件 | 打包工具（webpack/Rollup） |
| \`type\` | \`"module"\` 启用 ESM，\`"commonjs"\`（默认） | Node.js |
| \`exports\` | 更强大的入口定义（条件导出）| Node.js 12+ |
| \`types\` / \`typings\` | TypeScript 类型声明文件入口 | TypeScript |
| \`bin\` | 命令行工具入口映射 | CLI 工具 |

\`\`\`json
{
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "type": "module",
  "types": "dist/index.d.ts",
  "bin": {
    "mytool": "./bin/cli.js"
  }
}
\`\`\`

> ⚠️ **重要**：设置 \`"type": "module"\` 后，项目中所有 \`.js\` 文件会被当作 ESM 处理。如果某个文件需要 CJS，改后缀为 \`.cjs\`。

### 2.3 files 字段：控制发布内容

\`files\` 是一个文件/目录数组，只有列出的内容才会被发布到 npm 注册表：

\`\`\`json
{
  "files": ["dist", "bin", "README.md"]
}
\`\`\`

总是被包含的文件：\`package.json\`、\`README\`、\`LICENSE\`、\`main\` 字段指向的文件
总是被忽略的文件：\`.git\`、\`node_modules\`、\`.npmignore\` 中列出的

---

## 三、依赖字段详解

这是 package.json 中最重要的部分之一。

### 3.1 dependencies vs devDependencies

| 字段 | 安装时机 | 何时需要 | 示例 |
|------|----------|----------|------|
| \`dependencies\` | \`npm install <pkg>\` | **生产环境**运行需要的代码 | express, react, lodash, axios |
| \`devDependencies\` | \`npm install -D <pkg>\` | 仅**开发/构建**时需要 | jest, eslint, typescript, webpack |
| \`peerDependencies\` | 需要宿主环境提供 | 插件开发，要求用户安装特定版本 | react 组件库要求 react >= 17 |
| \`optionalDependencies\` | 安装失败不报错 | 可选增强功能 | 某些平台特定的原生模块 |
| \`bundledDependencies\` | 打包时捆绑 | 发布时包含第三方包 | 特殊场景使用 |

> 💡 **怎么判断放哪里？** 问自己：如果我 \`npm install --production\`（只装生产依赖），代码还能跑吗？如果不能，那包就应该在 dependencies 里。

### 3.2 peerDependencies 示例

开发 React 组件库时：

\`\`\`json
{
  "name": "my-react-component",
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  }
}
\`\`\`

这表示："你用我的组件库，你得自己装 React，版本得是 16.8 以上"。这样避免组件库和用户项目安装两份 React。

---

## 四、scripts 字段：自动化任务入口

\`scripts\` 定义可运行的命令脚本，是项目自动化的核心：

\`\`\`json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "webpack --mode production",
    "test": "jest",
    "lint": "eslint src/",
    "clean": "rm -rf dist"
  }
}
\`\`\`

运行方式：\`npm run <脚本名>\`（start/test/stop/restart 可省略 run）

\`\`\`bash
npm start
npm run dev
npm run build
npm test
\`\`\`

npm scripts 有很多强大的特性，下一章节专门讲解。

---

## 五、其他实用字段

### 5.1 engines：指定 Node.js 版本要求

\`\`\`json
{
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
\`\`\`

### 5.2 repository：代码仓库信息

\`\`\`json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/user/repo.git"
  }
}
\`\`\`

### 5.3 author / contributors：作者信息

\`\`\`json
{
  "author": "张三 <zhangsan@example.com> (https://zhangsan.dev)",
  "contributors": [
    "李四 <lisi@example.com>"
  ]
}
\`\`\`

### 5.4 private：防止意外发布

\`\`\`json
{
  "private": true
}
\`\`\`

设为 \`true\` 后，\`npm publish\` 会拒绝发布，防止私有项目不小心公开。

### 5.5 config：脚本可用的配置变量

\`\`\`json
{
  "config": {
    "port": 3000
  },
  "scripts": {
    "start": "node server.js"
  }
}
\`\`\`

脚本中可通过 \`npm_package_config_port\` 环境变量访问。

---

## 六、完整 package.json 示例

这是一个典型的 Node.js Web 服务项目的 package.json：

\`\`\`json
{
  "name": "user-service",
  "version": "1.0.0",
  "description": "用户管理微服务",
  "main": "src/index.js",
  "type": "commonjs",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest --coverage",
    "lint": "eslint src/",
    "build": "echo 'No build step required'"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "nodemon": "^2.0.0",
    "eslint": "^8.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": ["microservice", "user", "api"],
  "author": "开发团队",
  "license": "MIT",
  "private": true
}
\`\`\`
`,
    code: `// ============================================
// package.json 字段详解与程序化操作演示
// ============================================

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== package.json 全字段详解演示 ===\\n');

// ============ demo 1: 程序化创建一个完整的 package.json ============
console.log('--- Demo 1: 创建完整 package.json ---');

const completePkg = {
  name: 'nodejs-tutorial-demo',
  version: '1.0.0',
  description: 'Node.js 教程演示项目 - 完整 package.json 示例',
  keywords: ['nodejs', 'tutorial', 'demo', 'learning'],
  homepage: 'https://github.com/example/nodejs-tutorial#readme',
  bugs: {
    url: 'https://github.com/example/nodejs-tutorial/issues'
  },
  license: 'MIT',
  author: {
    name: 'Node.js 学习者',
    email: 'learner@example.com',
    url: 'https://example.com'
  },
  contributors: [
    '贡献者A <a@example.com>',
    '贡献者B <b@example.com>'
  ],
  main: 'dist/index.cjs.js',
  module: 'dist/index.esm.js',
  types: 'dist/index.d.ts',
  type: 'commonjs',
  exports: {
    '.': {
      require: './dist/index.cjs.js',
      import: './dist/index.esm.js',
      types: './dist/index.d.ts'
    },
    './utils': './dist/utils.js'
  },
  bin: {
    'mydemo': './bin/cli.js'
  },
  files: [
    'dist',
    'bin',
    'README.md',
    'LICENSE'
  ],
  scripts: {
    start: 'node src/index.js',
    dev: 'nodemon src/index.js',
    build: 'rollup -c',
    test: 'jest --coverage',
    'test:watch': 'jest --watch',
    lint: 'eslint src/ --ext .js',
    'lint:fix': 'eslint src/ --fix',
    clean: 'rimraf dist',
    prepublishOnly: 'npm run clean && npm run build'
  },
  dependencies: {
    express: '^4.18.2',
    cors: '^2.8.5',
    dotenv: '^16.3.1',
    lodash: '~4.17.21'
  },
  devDependencies: {
    jest: '^29.7.0',
    nodemon: '^3.0.1',
    eslint: '^8.52.0',
    rollup: '^4.6.0'
  },
  peerDependencies: {
    node: '>=16.0.0'
  },
  engines: {
    node: '>=18.0.0',
    npm: '>=9.0.0'
  },
  os: ['darwin', 'linux', 'win32'],
  cpu: ['x64', 'arm64'],
  private: false,
  repository: {
    type: 'git',
    url: 'git+https://github.com/example/nodejs-tutorial.git'
  },
  config: {
    port: 3000,
    env: 'development'
  }
};

console.log('完整 package.json 结构:');
console.log(JSON.stringify(completePkg, null, 2));

// ============ demo 2: 逐字段详细解释 ============
console.log('\\n--- Demo 2: 各字段含义分类解释 ---');

const fieldExplanations = {
  '===== 标识类字段 =====': '',
  name: '包名，全小写无空格，发布到 npm 必须唯一',
  version: '语义化版本号 (MAJOR.MINOR.PATCH)',
  description: '简短描述，npm 搜索结果中显示',
  keywords: '关键词数组，帮助用户在 npm 搜索到你的包',
  homepage: '项目主页 URL',
  license: '开源协议: MIT/ISC/Apache-2.0/GPL 等',
  '': '',
  '===== 作者信息字段 =====': '',
  author: '主要作者（字符串或对象）',
  contributors: '贡献者列表数组',
  repository: '代码仓库地址（type + url）',
  bugs: 'Bug 反馈地址',
  ' ': '',
  '===== 入口字段 =====': '',
  main: 'CommonJS 规范入口文件，require() 找的就是它',
  module: 'ES Module 入口，供打包工具使用的 ESM 版本',
  type: '"module" 启用 ESM，"commonjs" (默认) 使用 CJS',
  exports: '条件导出映射（Node 12+），比 main 更灵活强大',
  types: 'TypeScript 类型声明文件 (.d.ts) 入口',
  bin: 'CLI 工具命令名到脚本文件的映射',
  files: '发布到 npm 时包含的文件/目录白名单',
  '  ': '',
  '===== 依赖字段 =====': '',
  dependencies: '生产依赖：应用运行时必需的包',
  devDependencies: '开发依赖：仅开发/构建/测试需要的包',
  peerDependencies: '同伴依赖：要求宿主环境提供的包（如插件）',
  optionalDependencies: '可选依赖：安装失败不影响整体安装',
  bundledDependencies: '打包依赖：发布时捆绑在一起的包',
  '   ': '',
  '===== 脚本与配置 =====': '',
  scripts: 'npm scripts 命令别名定义',
  config: 'npm scripts 可访问的配置变量',
  engines: '要求的 Node.js/npm 版本',
  os: '支持的操作系统',
  cpu: '支持的 CPU 架构',
  private: 'true = 禁止 npm publish，防止私有包意外发布'
};

for (const [field, desc] of Object.entries(fieldExplanations)) {
  if (field.trim().startsWith('=====')) {
    console.log('\\n' + field);
  } else if (field.trim() === '') {
    console.log('');
  } else {
    console.log(\`  \${field.padEnd(25)} - \${desc}\`);
  }
}

// ============ demo 3: 读取和分析当前项目的 package.json ============
console.log('\\n--- Demo 3: 读取当前环境的 package.json ---');

function tryReadPkg(dir) {
  try {
    const pjPath = path.join(dir, 'package.json');
    if (fs.existsSync(pjPath)) {
      return JSON.parse(fs.readFileSync(pjPath, 'utf8'));
    }
  } catch (e) {}
  return null;
}

// 从当前目录向上查找 package.json
let currentDir = __dirname;
let foundPkg = null;
for (let i = 0; i < 5; i++) {
  foundPkg = tryReadPkg(currentDir);
  if (foundPkg) break;
  currentDir = path.dirname(currentDir);
}

if (foundPkg) {
  console.log('找到 package.json 在:', currentDir);
  console.log('项目名:', foundPkg.name);
  console.log('版本:', foundPkg.version);
  console.log('描述:', foundPkg.description || '(无)');
  console.log('License:', foundPkg.license || '(未指定)');
  console.log('是否私有:', foundPkg.private ? '是（禁止发布）' : '否');
  
  if (foundPkg.dependencies) {
    console.log('\\n生产依赖数量:', Object.keys(foundPkg.dependencies).length);
    console.log('生产依赖列表（前8个）:');
    Object.entries(foundPkg.dependencies).slice(0, 8).forEach(([name, ver]) => {
      console.log(\`  - \${name}: \${ver}\`);
    });
  }
  
  if (foundPkg.devDependencies) {
    console.log('\\n开发依赖数量:', Object.keys(foundPkg.devDependencies).length);
  }
  
  if (foundPkg.scripts) {
    console.log('\\n可用 npm scripts:');
    Object.entries(foundPkg.scripts).forEach(([name, cmd]) => {
      console.log(\`  npm run \${name.padEnd(15)} → \${cmd.length > 50 ? cmd.slice(0, 50) + '...' : cmd}\`);
    });
  }
} else {
  console.log('未找到 package.json（在 demos 目录中运行）');
}

// ============ demo 4: 依赖类型判断练习 ============
console.log('\\n--- Demo 4: 依赖分类小测试（你能分对吗？）---');

const dependencyQuiz = [
  { pkg: 'express', answer: 'dependencies', reason: 'Web 框架，生产运行需要' },
  { pkg: 'jest', answer: 'devDependencies', reason: '测试框架，只在测试时用' },
  { pkg: 'react', answer: 'dependencies', reason: '前端框架，运行时需要' },
  { pkg: 'typescript', answer: 'devDependencies', reason: 'TS 编译器，构建完就不需要了' },
  { pkg: 'eslint', answer: 'devDependencies', reason: '代码检查工具，开发时用' },
  { pkg: 'axios', answer: 'dependencies', reason: 'HTTP 客户端，运行时发请求需要' },
  { pkg: 'webpack', answer: 'devDependencies', reason: '打包工具，只在构建时用' },
  { pkg: 'react-dom', answer: 'dependencies', reason: 'React DOM 渲染，运行需要' },
  { pkg: 'nodemon', answer: 'devDependencies', reason: '开发时自动重启，生产不用' }
];

dependencyQuiz.forEach(({ pkg, answer, reason }) => {
  console.log(\`  📦 \${pkg.padEnd(15)} → \${answer.padEnd(20)} 💡 \${reason}\`);
});

// ============ demo 5: 编写临时 package.json 验证字段 ============
console.log('\\n--- Demo 5: 验证 package.json 字段验证规则 ---');

const tmpDir = path.join(os.tmpdir(), 'pkg-json-demo-' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

// 测试 name 字段规则
const testCases = [
  { name: 'valid-package', desc: '合法名称（短横线分隔）' },
  { name: '@scope/package', desc: 'Scoped Package（组织包）' },
  { name: 'package_name', desc: '下划线也可以' },
  { name: 'package123', desc: '包含数字' },
];

console.log('合法包名示例:');
testCases.forEach(tc => {
  const testPkg = { name: tc.name, version: '1.0.0' };
  fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(testPkg, null, 2));
  console.log(\`  ✅ "\${tc.name}" - \${tc.desc}\`);
});

// 版本号格式演示
console.log('\\n版本号格式（SemVer）:');
const versions = [
  { v: '1.0.0', desc: '正式发布版' },
  { v: '0.1.0', desc: '初始开发版（0.x 表示开发中）' },
  { v: '1.0.0-beta.1', desc: 'Beta 预发布版' },
  { v: '1.0.0-alpha.2', desc: 'Alpha 测试版' },
  { v: '2.0.0-rc.1', desc: 'Release Candidate 候选版' }
];
versions.forEach(({ v, desc }) => {
  console.log(\`  \${v.padEnd(18)} - \${desc}\`);
});

// 清理临时目录
setTimeout(() => {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (e) {}
}, 300);

console.log('\\n✅ package.json 是 Node.js 项目的核心配置文件！');
console.log('💡 记住：');
console.log('  1. name + version 是发布时必填的');
console.log('  2. dependencies 是生产依赖，devDependencies 是开发依赖');
console.log('  3. type: "module" 启用 ESM');
console.log('  4. private: true 防止意外发布');
console.log('  5. files 控制哪些文件被发布到 npm');
`
  },
  {
    id: "n4-npm-scripts",
    group: "第一部分 入门基础",
    icon: "🔧",
    title: "npm scripts：自动化任务的入口",
    content: `# npm scripts：自动化任务的入口

npm scripts 是 package.json 中最实用的功能之一，它让你用简单的命令运行复杂的任务流程，是项目自动化的基石。

---

## 一、npm scripts 是什么？

在 package.json 的 \`scripts\` 字段中，你可以定义命令别名：

\`\`\`json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "build": "webpack --mode production"
  }
}
\`\`\`

然后通过 \`npm run <脚本名>\` 运行：

\`\`\`bash
npm start        # 等价于 node index.js
npm run dev      # 等价于 nodemon index.js
npm run build    # 等价于 webpack --mode production
\`\`\`

> 💡 **类比理解**：npm scripts 就像是电视遥控器的快捷按钮——你不需要记住复杂的操作码，只需要按"开机"、"换台"、"调音量"这些预设的按钮就行。

### 特殊的脚本名

有几个脚本名可以省略 \`run\`：

| 命令 | 完整写法 | 说明 |
|------|----------|------|
| \`npm start\` | \`npm run start\` | 启动应用 |
| \`npm test\` | \`npm run test\` | 运行测试 |
| \`npm stop\` | \`npm run stop\` | 停止应用 |
| \`npm restart\` | 自动运行 stop + restart + start | 重启应用 |

---

## 二、PATH 环境变量：node_modules/.bin 的魔法

你可能会好奇：本地安装的包（比如 webpack、jest）并没有全局安装，为什么在 scripts 里可以直接用命令名？

**答案**：npm 运行脚本时，会自动把 \`node_modules/.bin\` 加入到 PATH 的最前面！

\`\`\`json
{
  "scripts": {
    "build": "webpack"
  }
}
\`\`\`

npm 实际执行的是：\`./node_modules/.bin/webpack\`

这意味着：
- ✅ 不需要全局安装工具
- ✅ 不同项目可以使用不同版本的同一工具
- ✅ 团队成员使用工具版本一致

> ⚠️ **为什么不能直接在终端用 webpack？** 因为终端的 PATH 里没有 node_modules/.bin。要么用 \`npx webpack\`，要么用 \`npm run build\`。

---

## 三、生命周期钩子：pre 和 post

npm scripts 支持 pre/post 前缀自动执行前置/后置任务：

\`\`\`json
{
  "scripts": {
    "prebuild": "echo '构建前清理...' && rimraf dist",
    "build": "webpack --mode production",
    "postbuild": "echo '构建完成！' && ls -la dist/"
  }
}
\`\`\`

当你运行 \`npm run build\` 时，npm 自动按顺序执行：
1. \`prebuild\`（如果存在）
2. \`build\`
3. \`postbuild\`（如果存在）

### 内置生命周期事件

npm 还有一些内置的生命周期钩子，在特定时机自动触发：

\`\`\`json
{
  "scripts": {
    "prepare": "npm run build",
    "prepublishOnly": "npm test && npm run lint",
    "preinstall": "echo '开始安装依赖...'",
    "postinstall": "echo '依赖安装完成！'"
  }
}
\`\`\`

常用钩子：
- \`prepare\`：发布前和 \`npm install\` 后运行（最常用）
- \`prepublishOnly\`：发布前运行（运行测试、lint）
- \`postinstall\`：依赖安装完成后运行

---

## 四、传参和环境变量

### 4.1 给脚本传参数

在命令名后面加 \`--\`，后面的参数会传递给实际命令：

\`\`\`json
{
  "scripts": {
    "dev": "nodemon server.js",
    "test": "jest"
  }
}
\`\`\`

\`\`\`bash
# 给 jest 传递 --watch 参数
npm run test -- --watch

# 等价于 jest --watch

# 传端口号给开发服务器
PORT=8080 npm run dev
\`\`\`

### 4.2 环境变量

npm 会自动设置很多以 \`npm_package_\` 开头的环境变量，可以在脚本/代码中访问：

| 环境变量 | 对应 package.json 字段 |
|----------|------------------------|
| \`npm_package_name\` | name 字段 |
| \`npm_package_version\` | version 字段 |
| \`npm_package_config_port\` | config.port 字段 |
| \`npm_lifecycle_event\` | 当前正在运行的脚本名 |

**在 Node.js 代码中访问**：

\`\`\`javascript
console.log(process.env.npm_package_name);     // 包名
console.log(process.env.npm_package_version);  // 版本
\`\`\`

**跨平台设置环境变量**：

Windows 和 macOS/Linux 设置环境变量语法不同，推荐用 \`cross-env\` 包：

\`\`\`bash
npm install -D cross-env
\`\`\`

\`\`\`json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development PORT=3000 node server.js",
    "build": "cross-env NODE_ENV=production webpack"
  }
}
\`\`\`

---

## 五、运行多个脚本

### 5.1 串行执行（&&）

前一个命令成功才执行下一个：

\`\`\`json
{
  "scripts": {
    "build": "npm run clean && npm run compile && npm run minify"
  }
}
\`\`\`

### 5.2 并行执行（& / npm-run-all）

Linux/macOS 用 \`&\` 后台运行，但 Windows 不支持。推荐用 \`npm-run-all\`：

\`\`\`bash
npm install -D npm-run-all
\`\`\`

\`\`\`json
{
  "scripts": {
    "dev": "run-p dev:server dev:client watch:css",
    "build": "run-s clean lint test build:*",
    "dev:server": "nodemon server.js",
    "dev:client": "webpack serve",
    "watch:css": "tailwindcss -w"
  }
}
\`\`\`

- \`run-p\` = run parallel（并行执行）
- \`run-s\` = run sequential（串行执行）
- 支持通配符 \`build:*\`

---

## 六、常用脚本模式模板

这是一个全功能项目的 scripts 配置参考：

\`\`\`json
{
  "scripts": {
    "start": "node dist/index.js",
    "dev": "cross-env NODE_ENV=development nodemon src/index.js",
    "build": "run-s clean build:ts build:assets",
    "build:ts": "tsc",
    "build:assets": "cp -r src/public dist/public",
    "clean": "rimraf dist",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/ --ext .ts,.js",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/"
  }
}
\`\`\`

---

## 七、跨平台注意事项

| 问题 | macOS/Linux | Windows 替代 | 跨平台方案 |
|------|-------------|--------------|------------|
| 设置环境变量 | \`FOO=bar cmd\` | \`set FOO=bar&& cmd\` | cross-env |
| 删除目录 | \`rm -rf dist\` | \`rmdir /s/q dist\` | rimraf |
| 创建目录 | \`mkdir -p dist\` | \`mkdir dist\` | mkdirp |
| 复制文件 | \`cp -r a b\` | \`xcopy /e a b\` | cpy / shx |
| 并行执行 | \`cmd1 & cmd2\` | \`start cmd1\` | npm-run-all |
| 环境变量 | \`$VAR\` | \`%VAR%\` | 使用 process.env 在代码中访问 |

> 💡 **最佳实践**：如果你的团队有 Windows 用户，或者要发布开源包，尽量使用跨平台方案，避免直接写 shell 特定语法。
`,
    code: `// ============================================
// npm scripts 功能演示脚本
// 本脚本模拟并演示 npm scripts 的各种特性
// ============================================

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== npm Scripts 全面演示 ===\\n');

// ============ demo 1: 创建临时项目演示 npm scripts ============
const tmpDir = path.join(os.tmpdir(), 'npm-scripts-demo-' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });
console.log('临时项目目录:', tmpDir);

// 创建 package.json 定义各种 scripts
const pkgJson = {
  name: 'npm-scripts-demo',
  version: '1.0.0',
  description: 'npm scripts 演示项目',
  scripts: {
    hello: 'node -e "console.log(\'👋 Hello from npm script!\')"',
    "greet:name": 'node -e "console.log(\'你好，\' + (process.env.npm_config_name || \'朋友\') + \'!\')"',
    info: 'node -e "console.log(\'项目名:\', process.env.npm_package_name); console.log(\'版本:\', process.env.npm_package_version)"',
    "prebuild": 'node -e "console.log(\'🔨 [prebuild] 清理构建产物...\')"',
    build: 'node -e "console.log(\'🏗️  [build] 正在构建项目...\')"',
    "postbuild": 'node -e "console.log(\'✅ [postbuild] 构建完成！\')"',
    "pretest": 'node -e "console.log(\'🧪 [pretest] 准备测试环境...\')"',
    test: 'node -e "console.log(\'✅ [test] 测试通过！\')"',
    serial: 'node -e "console.log(\'Step 1\')" && node -e "console.log(\'Step 2\')" && node -e "console.log(\'Step 3\')"',
    env: 'node -e "console.log(\'NODE_ENV:\', process.env.NODE_ENV || \'not set\')"',
    "say:hello": 'node -e "console.log(\'Hello!\')"',
    "say:bye": 'node -e "console.log(\'Goodbye!\')"',
    "say:all": 'npm run say:hello && npm run say:bye',
    platform: 'node -e "console.log(\'运行平台:\', process.platform)"',
    lifecycle: 'node -e "console.log(\'当前生命周期:\', process.env.npm_lifecycle_event)"',
    args: 'node -e "console.log(\'收到参数:\', process.argv.slice(2))"'
  },
  config: {
    greeting: '欢迎使用 npm scripts！'
  }
};

fs.writeFileSync(
  path.join(tmpDir, 'package.json'),
  JSON.stringify(pkgJson, null, 2)
);

const originalDir = process.cwd();
process.chdir(tmpDir);

// 辅助函数
function runScript(scriptName, desc) {
  console.log(\`\\n--- \${desc} ---\\n\`);
  console.log(\`$ npm run \${scriptName}\`);
  try {
    const output = execSync(\`npm run \${scriptName} --silent\`, {
      encoding: 'utf8',
      stdio: 'pipe',
      env: { ...process.env }
    });
    console.log(output);
  } catch (e) {
    console.log(e.stdout?.toString() || e.message);
  }
}

// ============ demo 2: 基本脚本运行 ============
console.log('\\n=== 2. 基本脚本运行 ===');
runScript('hello', '最简单的 script');

// ============ demo 3: 访问 package.json 字段 ============
console.log('\\n=== 3. 通过 npm_package_* 环境变量访问 package.json ===');
runScript('info', '访问 name 和 version');

// ============ demo 4: pre/post 生命周期钩子 ============
console.log('\\n=== 4. Pre/Post 生命周期钩子自动执行 ===');
console.log('（运行 build 时会自动按顺序执行 prebuild → build → postbuild）');
runScript('build', '演示完整 build 生命周期');

// ============ demo 5: 生命周期事件名称 ============
console.log('\\n=== 5. npm_lifecycle_event 当前脚本名 ===');
runScript('lifecycle', '查看当前正在执行的脚本名');

// ============ demo 6: 串行执行多个命令 ============
console.log('\\n=== 6. && 串行执行（前一个成功才执行下一个）===');
runScript('serial', '按顺序执行三个步骤');

// ============ demo 7: 脚本之间互相调用 ============
console.log('\\n=== 7. 脚本中调用其他脚本 ===');
runScript('say:all', '一个脚本调用多个其他脚本');

// ============ demo 8: 传递参数 ============
console.log('\\n=== 8. 给脚本传递参数 ===');
console.log('\\n--- 通过 npm_config_* 传参 ---');
console.log('$ npm run greet:name --name=张三');
try {
  const output = execSync('npm run greet:name --name=张三 --silent', {
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log(output);
} catch (e) {
  console.log(e.stdout?.toString());
}

console.log('\\n--- 通过 -- 传参给脚本 ---');
console.log('$ npm run args -- --foo --bar=value hello');
try {
  const output = execSync('npm run args -- --foo --bar=value hello --silent', {
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log(output);
} catch (e) {
  console.log(e.stdout?.toString());
}

// ============ demo 9: 环境变量 ============
console.log('\\n=== 9. 环境变量演示 ===');
console.log('\\n--- 默认 NODE_ENV ---');
runScript('env', '查看默认环境变量');

// 跨平台设置环境变量（在脚本命令中设置）
console.log('\\n--- 设置 NODE_ENV=production ---');
const envPkg = {
  ...pkgJson,
  scripts: {
    ...pkgJson.scripts,
    "env:prod": process.platform === 'win32' 
      ? 'set NODE_ENV=production&& node -e "console.log(\'NODE_ENV:\', process.env.NODE_ENV)"'
      : 'NODE_ENV=production node -e "console.log(\'NODE_ENV:\', process.env.NODE_ENV)"'
  }
};
fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(envPkg, null, 2));
runScript('env:prod', '设置 NODE_ENV=production');

// ============ demo 10: 平台检测 ============
console.log('\\n=== 10. 平台信息 ===');
runScript('platform', '检测当前运行平台');

// ============ demo 11: node_modules/.bin PATH 演示 ============
console.log('\\n=== 11. node_modules/.bin PATH 机制演示 ===');
console.log('npm 运行脚本时，会自动将 node_modules/.bin 加入 PATH');
console.log('这样本地安装的工具可以直接用命令名调用\\n');

// 创建一个模拟的"命令行工具"
const binDir = path.join(tmpDir, 'node_modules', '.bin');
fs.mkdirSync(binDir, { recursive: true });

// 创建一个模拟的 mytool 脚本
const mytoolContent = process.platform === 'win32' 
  ? \`@echo off\\necho 🛠️  mytool 运行成功！\\necho 参数: %*\`
  : \`#!/usr/bin/env node\\nconsole.log('🛠️  mytool 运行成功！');\\nconsole.log('参数:', process.argv.slice(2).join(' '));\\n\`;

const mytoolPath = path.join(binDir, process.platform === 'win32' ? 'mytool.cmd' : 'mytool');
fs.writeFileSync(mytoolPath, mytoolContent);
if (process.platform !== 'win32') {
  fs.chmodSync(mytoolPath, '755');
}

// 添加到 scripts
const binPkg = {
  ...envPkg,
  scripts: {
    ...envPkg.scripts,
    mytool: 'mytool --from-npm-script'
  }
};
fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(binPkg, null, 2));

runScript('mytool', '调用 node_modules/.bin 中的 mytool');

// ============ demo 12: 常用 npm scripts 模板总结 ============
console.log('\\n=== 常用 npm scripts 模板参考 ===');

const scriptTemplates = {
  '基础命令': {
    start: 'node src/index.js',
    dev: 'nodemon src/index.js',
    build: 'echo "build project"',
    clean: 'rimraf dist'
  },
  '测试相关': {
    test: 'jest',
    'test:watch': 'jest --watch',
    'test:coverage': 'jest --coverage'
  },
  '代码质量': {
    lint: 'eslint src/',
    'lint:fix': 'eslint src/ --fix',
    format: 'prettier --write "src/**/*.{js,ts}"'
  },
  '多命令执行': {
    'build:all': 'npm run clean && npm run build:ts && npm run build:assets',
    dev: 'run-p dev:server dev:client'
  },
  '环境变量': {
    dev: 'cross-env NODE_ENV=development node server.js',
    start: 'cross-env NODE_ENV=production node server.js'
  }
};

for (const [category, scripts] of Object.entries(scriptTemplates)) {
  console.log(\`\\n📋 \${category}:\`);
  for (const [name, cmd] of Object.entries(scripts)) {
    console.log(\`  "\${name}": "\${cmd}"\`);
  }
}

// ============ demo 13: npm scripts 执行顺序总结 ============
console.log('\\n=== npm scripts 执行顺序总结 ===');
console.log(\`
当你运行 npm run xxx，npm 会：
1. 将 ./node_modules/.bin 加入 PATH
2. 设置所有 npm_package_* 环境变量
3. 按顺序执行:
   - prexxx（如果存在）
   - xxx
   - postxxx（如果存在）
4. 任何一步出错（非0退出码），立即终止后续执行
\`);

console.log('\\n💡 npm scripts 最佳实践:');
console.log('  1. 用 rimraf/cross-env 等跨平台工具保证 Windows 兼容');
console.log('  2. 复杂脚本拆分，一个脚本只做一件事');
console.log('  3. 利用 pre/post 钩子组织构建流程');
console.log('  4. 用 npm-run-all 处理复杂的并行/串行任务');
console.log('  5. 本地安装工具，不要依赖全局安装');
console.log('  6. 通过 npm run 不带参数查看所有可用脚本');

// 清理
process.chdir(originalDir);
setTimeout(() => {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (e) {}
}, 500);
`
  },
  {
    id: "n4-debug",
    group: "第一部分 入门基础",
    icon: "🐛",
    title: "调试技巧：从 console 到 Inspector",
    content: `# 调试技巧：从 console 到 Inspector

调试是程序员的日常工作。掌握 Node.js 的调试技巧，能让你快速定位问题、理解代码执行流程，开发效率翻倍。

---

## 一、console 大全：不只是 console.log

大多数人只用 \`console.log\`，但 console 对象有很多实用方法，能让调试输出更清晰、更高效。

### 1.1 基础输出方法

| 方法 | 作用 | 典型场景 |
|------|------|----------|
| \`console.log()\` | 普通输出 | 一般调试信息 |
| \`console.info()\` | 信息输出（同 log） | 提示性信息 |
| \`console.warn()\` | 警告输出（黄色） | 警告但不致命的问题 |
| \`console.error()\` | 错误输出（红色） | 错误信息、异常 |
| \`console.debug()\` | 调试输出 | 详细调试信息 |

\`\`\`javascript
console.log('普通日志');
console.warn('警告：内存使用过高');
console.error('错误：数据库连接失败');
\`\`\`

### 1.2 console.dir：深度查看对象

\`console.dir()\` 可以以更友好的格式显示对象，还支持深度选项：

\`\`\`javascript
const deepObj = { a: { b: { c: { d: 'hello' } } } };

console.log(deepObj);  // 可能显示 [Object]
console.dir(deepObj, { depth: null, colors: true });  // 完整显示，带颜色
\`\`\`

### 1.3 console.table：表格化输出数组/对象

当数据是数组或对象列表时，用 table 一目了然：

\`\`\`javascript
const users = [
  { id: 1, name: '张三', age: 25 },
  { id: 2, name: '李四', age: 30 },
  { id: 3, name: '王五', age: 28 }
];

console.table(users);
// 还可以指定显示哪些列
console.table(users, ['name', 'age']);
\`\`\`

### 1.4 console.time 计时

测量代码执行时间：

\`\`\`javascript
console.time('排序耗时');
const arr = Array(1000000).fill(0).map(() => Math.random());
arr.sort();
console.timeEnd('排序耗时');  // 输出: 排序耗时: 42.345ms
\`\`\`

还支持嵌套计时：\`console.timeLog()\` 可在计时过程中打标记。

### 1.5 console.count 计数

统计某段代码执行了多少次：

\`\`\`javascript
function handleRequest(user) {
  console.count('请求次数');
  console.count(\`用户类型: \${user.role}\`);
}
handleRequest({ role: 'admin' });
handleRequest({ role: 'user' });
handleRequest({ role: 'admin' });
console.countReset('请求次数');  // 重置计数器
\`\`\`

### 1.6 console.group 分组输出

把相关日志分组显示，支持嵌套：

\`\`\`javascript
console.group('用户信息');
console.log('姓名: 张三');
console.log('年龄: 25');
console.group('地址');
console.log('省份: 浙江');
console.log('城市: 杭州');
console.groupEnd();
console.groupEnd();
\`\`\`

### 1.7 console.trace 打印调用栈

想知道一个函数是"被谁调用的"？用 trace：

\`\`\`javascript
function calledByWhom() {
  console.trace('调用栈追踪');
}
function middle() { calledByWhom(); }
function top() { middle(); }
top();
\`\`\`

### 1.8 console.assert 断言

条件不成立时才输出错误：

\`\`\`javascript
const user = null;
console.assert(user, 'user 不能为 null！');  // 条件为 false，输出 Assertion failed
\`\`\`

---

## 二、Node.js Inspector：Chrome DevTools 调试

### 2.1 启动调试模式

\`\`\`bash
# 启动调试模式，监听默认端口 9229
node --inspect app.js

# 启动时在第一行就断点（调试启动代码）
node --inspect-brk app.js

# 指定端口
node --inspect=9230 app.js
\`\`\`

启动后会看到类似输出：

\`\`\`
Debugger listening on ws://127.0.0.1:9229/...
For help, see: https://nodejs.org/en/docs/inspector
\`\`\`

### 2.2 在 Chrome DevTools 中调试

1. 打开 Chrome 浏览器，地址栏输入 \`chrome://inspect\`
2. 点击 "Open dedicated DevTools for Node"
3. 你的 Node.js 程序会出现在 Remote Target 列表中
4. 点击 "inspect" 即可打开调试界面

DevTools 功能：
- **断点（Breakpoints）**：点击行号设置断点，代码执行到这里暂停
- **Step over（F10）**：执行下一行，不进入函数
- **Step into（F11）**：进入函数内部
- **Step out（Shift+F11）**：跳出当前函数
- **Resume（F8）**：继续执行
- **Watch**：添加监控表达式
- **Call Stack**：查看调用栈
- **Scope**：查看当前作用域变量
- **Console**：在暂停位置执行代码

---

## 三、VS Code 调试（最推荐）

VS Code 内置了 Node.js 调试器，无需离开编辑器。

### 3.1 一键调试

最简单的方式：打开要调试的文件，按 \`F5\`，选择 "Node.js" 环境即可。

### 3.2 launch.json 配置

在项目根目录创建 \`.vscode/launch.json\`：

\`\`\`json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "启动程序",
      "program": "\${workspaceFolder}/src/index.js",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "attach",
      "name": "附加到进程",
      "port": 9229
    },
    {
      "type": "node",
      "request": "launch",
      "name": "nodemon 调试",
      "runtimeExecutable": "nodemon",
      "program": "\${workspaceFolder}/src/index.js",
      "restart": true
    }
  ]
}
\`\`\`

配置类型：
- **launch**：直接启动并调试程序
- **attach**：附加到已运行的调试进程（先 --inspect 启动，再 attach）

---

## 四、debugger 语句

在代码中插入 \`debugger\` 语句，程序执行到这里时会自动暂停（如果调试器已连接）：

\`\`\`javascript
function calculateTotal(orders) {
  let total = 0;
  for (const order of orders) {
    total += order.amount;
    debugger;  // 这里会暂停
  }
  return total;
}
\`\`\`

> ⚠️ **注意**：生产环境记得删掉 debugger 语句，或者用构建工具自动移除。

---

## 五、常见调试模式

### 5.1 二分法定位 Bug

不知道 Bug 在哪？用"二分法"：
1. 在代码中间加 console.log 或断点
2. 如果中间值正确，Bug 在后面；如果错误，Bug 在前面
3. 重复以上步骤，逐步缩小范围

### 5.2 重现问题

调试的第一步是**稳定重现**问题。如果问题是随机出现的，注意：
- 竞态条件（异步操作顺序）
- 未初始化的变量
- 缓存数据
- 环境差异

### 5.3 日志策略

- 关键节点打日志（请求入口、数据库操作、外部调用）
- 使用结构化日志（JSON 格式方便检索）
- 日志级别：error/warn/info/debug
- 生产环境不要打敏感信息

---

## 六、调试工具总结

| 工具/方法 | 适用场景 | 优点 | 缺点 |
|-----------|----------|------|------|
| console.log | 快速查看变量值 | 最简单、零配置 | 侵入式、需删改代码 |
| debugger 语句 | 明确的断点位置 | 精准 | 需要调试器连接 |
| Chrome DevTools | 复杂调试、性能分析 | 功能强大 | 需要打开浏览器 |
| VS Code Debugger | 日常开发 | 集成在编辑器 | 需要简单配置 |
| --inspect-brk | 调试启动代码 | 从第一行断住 | 需要 attach |
`,
    code: `// ============================================
// Node.js 调试技巧全面演示
// 运行方式：node --inspect 本文件.js 可配合调试器
// ============================================

// ============ demo 1: console 各方法演示 ============
console.log('=== 1. Console 方法大全 ===\\n');

// 1.1 基础输出
console.log('--- 基础输出 ---');
console.log('console.log() - 普通日志');
console.info('console.info() - 信息日志');
console.warn('console.warn() - 警告信息（黄色）');
console.error('console.error() - 错误信息（红色）');
console.debug('console.debug() - 调试信息');

// 1.2 console.dir 深度显示对象
console.log('\\n--- console.dir 深度对象查看 ---');
const nestedObj = {
  level1: {
    level2: {
      level3: {
        level4: {
          message: '深层嵌套的值',
          data: [1, 2, 3, 4, 5]
        }
      }
    }
  }
};
console.log('普通 log 输出:');
console.log(nestedObj);
console.log('\\ndir 设置 depth:null 显示全部:');
console.dir(nestedObj, { depth: null, colors: true });

// 1.3 console.table 表格输出
console.log('\\n--- console.table 表格化输出 ---');
const students = [
  { id: 1, name: '张三', age: 20, major: '计算机', score: 92 },
  { id: 2, name: '李四', age: 21, major: '数学', score: 88 },
  { id: 3, name: '王五', age: 19, major: '物理', score: 95 },
  { id: 4, name: '赵六', age: 22, major: '化学', score: 85 }
];
console.log('完整表格:');
console.table(students);
console.log('\\n只显示指定列:');
console.table(students, ['name', 'major', 'score']);

// 1.4 console.time/timeEnd 计时
console.log('\\n--- console.time 性能计时 ---');
console.time('数组排序 100万条');
const bigArray = Array(1000000).fill(0).map(() => Math.random());
const sorted = bigArray.sort((a, b) => a - b);
console.timeEnd('数组排序 100万条');

// 分段计时
console.time('外层循环');
for (let i = 0; i < 3; i++) {
  console.timeLog('外层循环', \`第 \${i + 1} 次迭代\`);
  console.time('内层操作');
  let sum = 0;
  for (let j = 0; j < 100000; j++) sum += j;
  console.timeEnd('内层操作');
}
console.timeEnd('外层循环');

// 1.5 console.count 计数
console.log('\\n--- console.count 计数器 ---');
function processRequest(reqType) {
  console.count('总请求数');
  console.count(\`请求类型: \${reqType}\`);
}
processRequest('GET');
processRequest('POST');
processRequest('GET');
processRequest('GET');
processRequest('POST');
console.log('重置 GET 计数器...');
console.countReset('请求类型: GET');
processRequest('GET');

// 1.6 console.group 分组
console.log('\\n--- console.group 分组输出 ---');
console.group('===== 用户模块 =====');
console.log('加载用户配置...');
console.log('连接用户数据库...');
console.group('权限检查');
console.log('检查角色: admin');
console.log('权限验证通过');
console.groupEnd();
console.log('用户模块初始化完成');
console.groupEnd();

console.group('===== 订单模块 =====');
console.log('加载订单服务...');
console.groupEnd();

// 1.7 console.assert 断言
console.log('\\n--- console.assert 断言 ---');
const config = { port: 3000, host: 'localhost' };
console.assert(config.port > 0 && config.port < 65536, '端口必须在 1-65535 之间');
console.assert(config.dbUrl, 'dbUrl 必须配置！（这个断言会失败）');

// 1.8 console.trace 调用栈
console.log('\\n--- console.trace 调用栈追踪 ---');
function getData() {
  processData();
}
function processData() {
  validateData();
}
function validateData() {
  console.trace('validateData 是从哪里被调用的？');
  console.log('（↑ 上面显示了完整的调用链）');
}
getData();

// ============ demo 2: 格式化字符串 ============
console.log('\\n=== 2. printf 风格格式化输出 ===');
// %s = 字符串
// %d/%i = 整数
// %f = 浮点数
// %o = 对象
// %c = CSS 样式（浏览器中）
// %% = 百分号
console.log('Hello, %s! 你有 %d 条新消息。', 'Node.js', 5);
console.log('圆周率 ≈ %f', Math.PI);
console.log('数值: %i', 42.9);
console.log('对象: %o', { a: 1, b: 2 });

// ============ demo 3: 模拟调试场景 ============
console.log('\\n=== 3. 常见调试场景演练 ===');

// 3.1 追踪函数执行流程
console.log('\\n--- 追踪函数执行 ---');
function fibonacci(n, depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(\`\${indent}fib(\${n}) 开始计算\`);
  
  if (n <= 1) {
    console.log(\`\${indent}fib(\${n}) = \${n} (base case)\`);
    return n;
  }
  
  const result = fibonacci(n - 1, depth + 1) + fibonacci(n - 2, depth + 1);
  console.log(\`\${indent}fib(\${n}) = \${result}\`);
  return result;
}
console.log('斐波那契(5) =', fibonacci(5));

// 3.2 检查对象引用问题
console.log('\\n--- 对象引用调试 ---');
function updateUser(user) {
  user.name = '改名了';  // 这会修改原对象！
  return user;
}
const original = { name: '原名', age: 25 };
console.log('调用前 original:', { ...original });
const updated = updateUser(original);
console.log('调用后 original:', original);  // 被修改了！
console.log('updated === original:', updated === original);  // true，同一引用

// 3.3 异步代码调试
console.log('\\n--- 异步代码执行顺序（常见困惑点）---');
console.log('1. 同步代码开始');
setTimeout(() => {
  console.log('4. setTimeout 回调执行（宏任务）');
}, 0);
Promise.resolve().then(() => {
  console.log('3. Promise.then 执行（微任务）');
});
console.log('2. 同步代码结束');
// 输出顺序：1 → 2 → 3 → 4

// ============ demo 4: 错误堆栈分析 ============
console.log('\\n=== 4. Error Stack 错误堆栈分析 ===');
function level1() { level2(); }
function level2() { level3(); }
function level3() {
  const err = new Error('这是一个演示错误');
  console.log('错误消息:', err.message);
  console.log('\\n错误堆栈（从下往上看，最下面是最早调用）:');
  const stackLines = err.stack.split('\\n');
  stackLines.forEach((line, i) => {
    console.log(\`  \${i}: \${line}\`);
  });
}
try {
  level1();
} catch (e) {}

// ============ demo 5: 条件日志与调试工具函数 ============
console.log('\\n=== 5. 实用调试工具函数 ===');

// 带标签的日志
function createLogger(namespace) {
  return {
    log: (...args) => console.log(\`[\${namespace}]\`, ...args),
    warn: (...args) => console.warn(\`[\${namespace}]\`, ...args),
    error: (...args) => console.error(\`[\${namespace}]\`, ...args),
    dir: (obj) => {
      console.log(\`[\${namespace}]\`);
      console.dir(obj, { depth: null, colors: true });
    }
  };
}

const dbLogger = createLogger('DB');
dbLogger.log('数据库连接成功');
dbLogger.warn('查询较慢，建议加索引');

// 检查类型
function inspect(value, label = '值') {
  console.log(\`\\n--- inspect: \${label} ---\`);
  console.log('值:', value);
  console.log('类型:', typeof value);
  console.log('是数组吗:', Array.isArray(value));
  console.log('是 null:', value === null);
  console.log('构造函数:', value?.constructor?.name);
  if (typeof value === 'object' && value !== null) {
    console.log('属性:', Object.keys(value));
  }
}

inspect([1, 2, 3], '数组');
inspect({ name: 'test' }, '对象');
inspect(null, 'null');

// ============ demo 6: debugger 语句（需要调试器连接才生效）===========
console.log('\\n=== 6. debugger 语句演示 ===');
console.log('提示：运行 node --inspect-brk debug-demo.js 连接调试器');
console.log('然后会在 debugger 语句处暂停\\n');

function buggyFunction(arr) {
  let sum = 0;
  for (let i = 0; i <= arr.length; i++) {  // Bug: 应该是 i < arr.length
    // debugger;  // 取消注释后调试器会在这里暂停
    sum += arr[i];
  }
  return sum;
}

// 这个函数有 bug！最后会是 NaN
// const result = buggyFunction([1, 2, 3]);
// console.log('buggyFunction 结果:', result);
console.log('（取消 debugger 注释并使用 --inspect 运行可以断点调试）');

console.log('\\n✅ 调试技巧演示完成！');
console.log('💡 调试心法:');
console.log('  1. 先稳定重现 Bug');
console.log('  2. 用 console 缩小问题范围');
console.log('  3. 用断点查看运行时变量');
console.log('  4. 检查异步代码执行顺序');
console.log('  5. 注意对象引用副作用');
`
  },
  {
    id: "n4-error-handling",
    group: "第一部分 入门基础",
    icon: "❌",
    title: "错误处理：让程序健壮运行",
    content: `# 错误处理：让程序健壮运行

没有人能写出完美无缺的代码。优秀的程序不是没有错误，而是出现错误时能妥善处理——不崩溃、给用户有用的提示、记录日志方便排查。错误处理是专业 Node.js 开发者的必修课。

---

## 一、JavaScript 内置错误类型

JavaScript 有几种内置的错误类型，了解它们能快速定位问题：

| 错误类型 | 触发场景 | 示例 |
|----------|----------|------|
| \`SyntaxError\` | 语法错误（代码解析不了） | \`var a = ;\` |
| \`ReferenceError\` | 引用不存在的变量 | \`console.log(undefinedVar)\` |
| \`TypeError\` | 值类型不对 | \`null.toString()\` |
| \`RangeError\` | 值超出合法范围 | 递归死循环导致栈溢出 |
| \`URIError\` | encodeURI/decodeURI 错误 | \`decodeURI('%')\` |
| \`EvalError\` | eval 错误（已废弃） | - |
| \`Error\` | 通用基础错误 | \`new Error('出错了')\` |

\`\`\`javascript
// SyntaxError - 代码根本无法执行
// console.log('hello';  // 少了右括号

// ReferenceError
// console.log(notDefinedVariable);  // 引用不存在的变量

// TypeError
const n = null;
// n.toString();  // Cannot read properties of null

// RangeError
function inf() { inf(); }
// inf();  // Maximum call stack size exceeded
\`\`\`

---

## 二、Error 对象详解

\`throw\` 可以抛出任何值，但最佳实践是抛出 \`Error\` 对象（或子类），因为它包含：

| 属性 | 说明 |
|------|------|
| \`message\` | 错误消息 |
| \`name\` | 错误类型名称（如 "TypeError"） |
| \`stack\` | 调用栈字符串（调试用）|
| \`cause\` | 导致此错误的原始错误（ES2022）|

\`\`\`javascript
const err = new Error('连接数据库失败', { cause: new Error('连接超时') });
console.log(err.message);  // 连接数据库失败
console.log(err.name);     // Error
console.log(err.cause);    // 原始错误
console.log(err.stack);    // 完整堆栈
\`\`\`

---

## 三、throw 语句与 try/catch/finally

### 3.1 抛出错误

\`\`\`javascript
function divide(a, b) {
  if (b === 0) {
    throw new Error('除数不能为 0');
  }
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('参数必须是数字');
  }
  return a / b;
}
\`\`\`

### 3.2 try/catch 捕获错误

\`\`\`javascript
try {
  // 可能出错的代码
  const result = divide(10, 0);
  console.log(result);
} catch (err) {
  // 出错后执行这里
  console.error('出错了:', err.message);
} finally {
  // 无论对错都会执行（可选）
  console.log('计算结束');
}
\`\`\`

### 3.3 finally 的用途

\`finally\` 子句不管有没有出错都会执行，常用于：
- 关闭文件/数据库连接
- 释放资源
- 清理状态
- 隐藏 loading 提示

\`\`\`javascript
let connection;
try {
  connection = openDB();
  connection.query('SELECT ...');
} catch (err) {
  console.error('查询失败:', err);
} finally {
  if (connection) connection.close();  // 确保连接关闭
}
\`\`\`

> ⚠️ **注意**：try/catch 是**同步**的！它**不能**直接捕获异步回调中的错误。

---

## 四、异步错误处理

### 4.1 Error-first 回调风格（Node.js 传统约定）

Node.js 早期的异步 API 约定：回调函数第一个参数是 error，第二个是结果。

\`\`\`javascript
const fs = require('fs');

fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('读取失败:', err.message);
    return;
  }
  console.log('文件内容:', data);
});
\`\`\`

**规则**：
- 第一个参数 \`err\`：成功时是 \`null\`，失败时是 Error 对象
- 回调中必须先检查 err
- 出错后要 return，不要继续执行后面的成功逻辑

### 4.2 Promise 错误处理：.catch()

\`\`\`javascript
const fs = require('fs/promises');

fs.readFile('not-exist.txt')
  .then(data => console.log(data))
  .catch(err => console.error('读取失败:', err.message));
\`\`\`

### 4.3 async/await 错误处理：try/catch

\`\`\`javascript
async function readConfig() {
  try {
    const data = await fs.readFile('config.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('配置文件不存在，使用默认配置');
      return { port: 3000 };
    }
    throw err;  // 其他错误继续抛出
  }
}
\`\`\`

---

## 五、操作错误 vs 程序错误

| 类型 | 说明 | 处理方式 |
|------|------|----------|
| **操作错误（Operational Errors）** | 运行时可预期的问题：文件不存在、网络超时、权限不足、用户输入非法 | 妥善处理：返回错误、重试、降级 |
| **程序错误（Programmer Errors）** | 代码本身的 Bug：传错参数类型、null 引用、逻辑错误 | 修复代码，加校验，开发阶段尽早发现 |

> 💡 **关键认知**：操作错误不是 Bug，是正常运行中可能发生的情况；程序错误是 Bug，应该通过修改代码解决。

---

## 六、自定义错误类

创建自定义错误类型，方便区分不同错误，做差异化处理：

\`\`\`javascript
class AppError extends Error {
  constructor(message, code = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, field) {
    super(message, 400);
    this.field = field;
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(\`\${resource} 不存在\`, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor() {
    super('未授权访问', 401);
  }
}

// 使用
function getUser(id) {
  if (!id) throw new ValidationError('用户 ID 不能为空', 'id');
  const user = db.find(u => u.id === id);
  if (!user) throw new NotFoundError('用户');
  return user;
}
\`\`\`

---

## 七、错误处理最佳实践

1. **始终使用 Error 对象**：不要 throw 字符串或数字
2. **同步错误用 try/catch**：不能捕获异步错误
3. **异步错误用 Promise.catch 或 await try/catch**
4. **错误早抛出，晚捕获**：底层抛错，上层统一处理
5. **error 事件必须监听**：EventEmitter 的 error 事件无监听会直接崩溃
6. **Promise 不要 unhandledRejection**：每个 Promise 链结尾要有 catch
7. **记录详细错误日志**：stack、时间、请求 ID、用户信息
8. **不要吞掉错误**：catch 后不处理等于没捕获
9. **区分错误类型**：用自定义错误类
10. **进程级错误兜底**：uncaughtException, unhandledRejection

### 未捕获异常兜底

\`\`\`javascript
// 不要作为常规错误处理手段，仅作为最后防线
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  process.exit(1);  // 崩溃后重启是安全做法
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise rejection:', reason);
});
\`\`\`
`,
    code: `// ============================================
// Node.js 错误处理全面演示
// ============================================

console.log('=== Node.js 错误处理详解 ===\\n');

// ============ demo 1: 各种内置错误类型 ============
console.log('--- Demo 1: 内置错误类型 ---');

const errorTypes = [
  { name: 'SyntaxError', desc: '语法错误（代码解析阶段）' },
  { name: 'ReferenceError', desc: '引用未定义变量' },
  { name: 'TypeError', desc: '值类型不符合预期' },
  { name: 'RangeError', desc: '值不在合法范围内' },
  { name: 'URIError', desc: 'URI 编码/解码错误' },
  { name: 'Error', desc: '通用基础错误' }
];

errorTypes.forEach(e => {
  console.log(\`  📌 \${e.name.padEnd(18)} - \${e.desc}\`);
});

// 安全演示各种错误
function triggerError(type) {
  try {
    switch (type) {
      case 'ReferenceError':
        return undefinedVariable;
      case 'TypeError':
        return null.someMethod();
      case 'RangeError':
        (function recurse() { recurse(); })();
        break;
      case 'URIError':
        return decodeURIComponent('%');
    }
  } catch (err) {
    return err;
  }
}

console.log('\\n实际触发并捕获各种错误:');
['ReferenceError', 'TypeError', 'URIError'].forEach(type => {
  const err = triggerError(type);
  if (err) {
    console.log(\`  ✅ \${err.name}: \${err.message.slice(0, 60)}\`);
  }
});

// ============ demo 2: Error 对象属性 ============
console.log('\\n--- Demo 2: Error 对象属性 ---');

function exampleFunction() {
  const error = new Error('数据库连接超时');
  error.code = 'DB_TIMEOUT';
  error.statusCode = 503;
  error.details = { host: 'localhost', port: 5432 };
  return error;
}

const err = exampleFunction();
console.log('Error 对象属性:');
console.log('  message:', err.message);
console.log('  name:', err.name);
console.log('  code:', err.code);
console.log('  stack 前3行:');
err.stack.split('\\n').slice(0, 4).forEach(line => {
  console.log('    ', line.trim());
});

// ES2022 cause 属性
console.log('\\n错误链（cause 属性演示）:');
try {
  try {
    throw new Error('连接被拒绝');
  } catch (cause) {
    throw new Error('用户查询失败', { cause });
  }
} catch (err) {
  console.log('  外层错误:', err.message);
  console.log('  原始原因:', err.cause?.message);
}

// ============ demo 3: throw 与 try/catch/finally ============
console.log('\\n--- Demo 3: throw, try/catch/finally 完整流程 ---');

function divide(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('参数必须是数字类型');
  }
  if (b === 0) {
    throw new Error('除数不能为零');
  }
  if (b < 0) {
    throw new RangeError('除数暂不支持负数（演示用）');
  }
  return a / b;
}

// 测试各种情况
const testCases = [
  { a: 10, b: 2, expect: '成功' },
  { a: 10, b: 0, expect: '除零错误' },
  { a: '10', b: 2, expect: '类型错误' },
  { a: 10, b: -2, expect: '范围错误' }
];

testCases.forEach(({ a, b, expect }) => {
  try {
    const result = divide(a, b);
    console.log(\`  divide(\${a}, \${b}) = \${result}  (\${expect})\`);
  } catch (err) {
    console.log(\`  divide(\${a}, \${b}) → ❌ \${err.name}: \${err.message}  (\${expect})\`);
  } finally {
    // console.log('  (finally 总是执行)');
  }
});

// ============ demo 4: finally 资源清理演示 ============
console.log('\\n--- Demo 4: finally 资源清理 ---');

// 模拟一个需要关闭的资源
class FakeConnection {
  constructor(name) {
    this.name = name;
    this.isOpen = true;
    console.log(\`  📡 \${name} 连接已打开\`);
  }
  query(sql) {
    if (!this.isOpen) throw new Error('连接已关闭');
    if (sql.includes('ERROR')) throw new Error('SQL 语法错误');
    return [{ id: 1 }, { id: 2 }];
  }
  close() {
    this.isOpen = false;
    console.log(\`  🔌 \${this.name} 连接已关闭\`);
  }
}

function executeQuery(sql, shouldFail = false) {
  const conn = new FakeConnection('DB');
  try {
    console.log(\`  执行查询: \${sql}\`);
    const result = conn.query(shouldFail ? sql + ' ERROR' : sql);
    console.log(\`  查询成功，返回 \${result.length} 条记录\`);
    return result;
  } catch (err) {
    console.log(\`  ❌ 查询失败: \${err.message}\`);
    throw err;
  } finally {
    conn.close();  // 无论成功失败都关闭连接！
  }
}

console.log('正常查询:');
try {
  executeQuery('SELECT * FROM users');
} catch (e) {}

console.log('\\n出错的查询（finally 仍然关闭连接）:');
try {
  executeQuery('SELECT * FROM', true);
} catch (e) {}

// ============ demo 5: 自定义错误类 ============
console.log('\\n--- Demo 5: 自定义错误类 ---');

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;  // 标记为可预期的操作错误
    Error.captureStackTrace(this, this.constructor);
  }
  
  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        statusCode: this.statusCode
      }
    };
  }
}

class ValidationError extends AppError {
  constructor(message, field) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

class NotFoundError extends AppError {
  constructor(resource, id) {
    super(\`\${resource} (id=\${id}) 不存在\`, 404, 'NOT_FOUND');
    this.resource = resource;
    this.resourceId = id;
  }
}

class AuthenticationError extends AppError {
  constructor(message = '请先登录') {
    super(message, 401, 'AUTH_REQUIRED');
  }
}

class PermissionError extends AppError {
  constructor(action = '此操作') {
    super(\`没有权限执行\${action}\`, 403, 'PERMISSION_DENIED');
  }
}

// 模拟 Web 应用错误处理
function handleAPIRequest(endpoint, userId, data) {
  console.log(\`\\n  请求: \${endpoint}, 用户ID: \${userId}\`);
  
  try {
    if (!userId) {
      throw new AuthenticationError();
    }
    
    if (endpoint === '/api/admin' && userId !== 1) {
      throw new PermissionError('访问管理后台');
    }
    
    if (endpoint === '/api/users') {
      if (!data || !data.name) {
        throw new ValidationError('用户名不能为空', 'name');
      }
      if (data.id && data.id > 1000) {
        throw new NotFoundError('用户', data.id);
      }
      return { success: true, data: { id: data.id || 1, name: data.name } };
    }
    
    throw new NotFoundError('接口', endpoint);
  } catch (err) {
    if (err instanceof AppError) {
      console.log(\`  ❌ [\${err.code}] \${err.message} (HTTP \${err.statusCode})\`);
      return err.toJSON();
    }
    console.log(\`  💥 未知错误: \${err.message}\`);
    return { error: { message: '服务器内部错误' } };
  }
}

handleAPIRequest('/api/users', 1, { name: '张三' });  // 成功
handleAPIRequest('/api/users', null, {});  // 未登录
handleAPIRequest('/api/admin', 2, {});  // 无权限
handleAPIRequest('/api/users', 1, {});  // 验证失败
handleAPIRequest('/api/users', 1, { id: 9999, name: 'X' });  // 不存在
handleAPIRequest('/api/unknown', 1, {});  // 接口不存在

// ============ demo 6: Error-first 回调 ============
console.log('\\n--- Demo 6: Error-first 回调模式 ---');

// 模拟 Node.js 风格的异步函数
function readConfigFile(path, callback) {
  setTimeout(() => {
    if (!path) {
      callback(new TypeError('路径不能为空'));
      return;
    }
    if (path === 'not-exist.json') {
      const err = new Error(\`文件不存在: \${path}\`);
      err.code = 'ENOENT';
      callback(err);
      return;
    }
    // 成功时 err 为 null
    callback(null, { port: 3000, host: 'localhost' });
  }, 100);
}

// 正确的 error-first 回调用法
readConfigFile('config.json', (err, config) => {
  if (err) {
    console.log('  读取失败:', err.message);
    return;  // 必须 return，不继续执行
  }
  console.log('  读取成功，配置:', config);
});

readConfigFile('not-exist.json', (err, config) => {
  if (err) {
    console.log('  读取失败:', err.message, '(code:', err.code + ')');
    return;
  }
  console.log('  不应该执行到这里');
});

// ============ demo 7: Promise 和 async/await 错误处理 ============
console.log('\\n--- Demo 7: Promise/async-await 错误处理 ---');

// Promise 链的错误传播
function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id <= 0) {
        reject(new ValidationError('用户ID无效', 'id'));
        return;
      }
      if (id === 404) {
        reject(new NotFoundError('用户', id));
        return;
      }
      resolve({ id, name: \`用户\${id}\`, email: \`user\${id}@example.com\` });
    }, 100);
  });
}

// .then/.catch 方式
fetchUser(404)
  .then(user => console.log('  .then 用户:', user.name))
  .catch(err => console.log('  .catch 捕获:', err.name, '-', err.message));

// async/await try/catch 方式
async function loadUser(id) {
  try {
    const user = await fetchUser(id);
    console.log('  await 用户:', user.name);
    return user;
  } catch (err) {
    if (err instanceof NotFoundError) {
      console.log('  用户不存在，返回默认用户');
      return { id: 0, name: '访客' };
    }
    if (err instanceof ValidationError) {
      console.log('  参数验证失败:', err.message);
      throw err;
    }
    throw err;
  }
}

loadUser(1).then(u => console.log('  loadUser(1) 结果:', u.name));
loadUser(404).then(u => console.log('  loadUser(404) 降级为:', u.name));

// ============ demo 8: 错误处理最佳实践总结 ============
console.log('\\n--- Demo 8: 错误处理最佳实践 ---');

const bestPractices = [
  { icon: '✅', text: '始终 throw Error 对象，不要 throw 字符串/数字' },
  { icon: '✅', text: '错误早抛出，晚捕获（底层抛，上层统一处理）' },
  { icon: '✅', text: '用自定义错误类区分错误类型' },
  { icon: '✅', text: 'error-first 回调先检查 err 并 return' },
  { icon: '✅', text: 'Promise 链末尾必须有 .catch()' },
  { icon: '✅', text: 'EventEmitter 必须监听 error 事件' },
  { icon: '✅', text: 'finally 中清理资源（关闭连接、文件等）' },
  { icon: '✅', text: '记录错误日志（包含 stack、上下文）' },
  { icon: '❌', text: '不要空 catch：catch(e) {} 等于吞掉错误' },
  { icon: '❌', text: '不要用 try/catch 包裹大段代码而不分类型处理' },
  { icon: '❌', text: '不要把所有错误都当"异常"：非法输入是可预期的' }
];

bestPractices.forEach(p => {
  console.log(\`  \${p.icon} \${p.text}\`);
});

console.log('\\n✅ 错误处理演示完成！');
console.log('💡 记住：健壮的程序不是不出错，而是出错了不崩溃、有提示、可排查。');
`
  },
  {
    id: "n4-cli-practice",
    group: "第一部分 入门基础",
    icon: "🛠️",
    title: "实战：命令行工具开发",
    content: `# 实战：命令行工具开发

Node.js 非常适合开发命令行工具（CLI, Command Line Interface）。我们熟悉的 npm、webpack、vite、create-react-app、eslint 等都是用 Node.js 写的 CLI 工具。本章从零开发一个功能完整的待办事项 CLI。

---

## 一、CLI 工具基础概念

命令行工具的核心能力：

1. **解析命令行参数**：用户输入的命令和选项
2. **读取输入**：键盘交互输入（如确认、选择）
3. **输出彩色文本**：让输出更美观易读
4. **文件读写**：持久化数据
5. **帮助信息**：告诉用户怎么用

### 1.1 process.argv：参数数组

这是获取命令行参数最基础的方式：

\`\`\`bash
node mycli.js add "买牛奶" --priority=high
\`\`\`

\`process.argv\` 是一个数组：
- \`argv[0]\`：node 可执行文件路径
- \`argv[1]\`：脚本文件路径
- \`argv[2...]\`：用户传入的参数

所以上例会得到：\`['node', '/path/mycli.js', 'add', '买牛奶', '--priority=high']\`

---

## 二、ANSI 转义码：彩色输出

在终端中输出彩色文字不需要任何库，使用 ANSI 转义序列即可：

| 代码 | 效果 | 代码 | 效果 |
|------|------|------|------|
| \`\\x1b[30m\` | 黑色 | \`\\x1b[90m\` | 灰色 |
| \`\\x1b[31m\` | 红色 | \`\\x1b[91m\` | 亮红 |
| \`\\x1b[32m\` | 绿色 | \`\\x1b[92m\` | 亮绿 |
| \`\\x1b[33m\` | 黄色 | \`\\x1b[93m\` | 亮黄 |
| \`\\x1b[34m\` | 蓝色 | \`\\x1b[94m\` | 亮蓝 |
| \`\\x1b[35m\` | 紫色 | \`\\x1b[36m\` | 青色 |
| \`\\x1b[0m\` | 重置颜色 | \`\\x1b[1m\` | 粗体 |
| \`\\x1b[4m\` | 下划线 | \`\\x1b[7m\` | 反色 |

\`\`\`javascript
const colors = {
  reset: '\\x1b[0m',
  red: '\\x1b[31m',
  green: '\\x1b[32m',
  yellow: '\\x1b[33m',
  blue: '\\x1b[34m',
  cyan: '\\x1b[36m',
  gray: '\\x1b[90m',
  bold: '\\x1b[1m'
};

console.log(colors.green + '成功！' + colors.reset);
console.log(colors.red + colors.bold + '错误！' + colors.reset);
\`\`\`

---

## 三、readline 模块：交互式输入

Node.js 内置的 \`readline\` 模块可以逐行读取用户输入：

\`\`\`javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('你叫什么名字？', (answer) => {
  console.log(\`你好，\${answer}！\`);
  rl.close();
});
\`\`\`

如果需要问多个问题，可以封装成 Promise：

\`\`\`javascript
function ask(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function main() {
  const name = await ask('姓名: ');
  const age = await ask('年龄: ');
  console.log(\`\${name}，\${age}岁\`);
  rl.close();
}
\`\`\`

---

## 四、CLI 工具的 package.json 配置

要让你的工具能像命令一样运行，需要配置 \`bin\` 字段：

\`\`\`json
{
  "name": "my-todo-cli",
  "version": "1.0.0",
  "bin": {
    "todo": "./bin/index.js"
  }
}
\`\`\`

脚本文件开头需要加 shebang：

\`\`\`javascript
#!/usr/bin/env node

// 上面这行告诉系统用 node 来执行这个文件
console.log('Hello CLI!');
\`\`\`

然后 \`npm link\` 就可以全局使用 \`todo\` 命令了。

---

## 五、实战：功能完整的 Todo CLI

我们要开发的待办工具支持：

| 命令 | 功能 |
|------|------|
| \`todo add "任务内容"\` | 添加待办 |
| \`todo list\` | 列出所有待办 |
| \`todo done <id>\` | 标记完成 |
| \`todo delete <id>\` | 删除待办 |
| \`todo clear\` | 清空所有已完成 |
| \`todo interactive\` | 交互模式 |
| \`todo help\` | 显示帮助 |

功能要点：
- 数据持久化到用户主目录
- 彩色输出
- 优先级标记
- 帮助信息
- 错误提示
- 交互式添加任务
`,
    code: `#!/usr/bin/env node
// ============================================
// 实战：完整功能的 Todo CLI 命令行工具
// 运行方式：node 本文件.js <command> [args]
// ============================================

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// ============ 1. ANSI 颜色配置 ============
const c = {
  reset: '\\x1b[0m',
  bold: '\\x1b[1m',
  dim: '\\x1b[2m',
  red: '\\x1b[31m',
  green: '\\x1b[32m',
  yellow: '\\x1b[33m',
  blue: '\\x1b[34m',
  magenta: '\\x1b[35m',
  cyan: '\\x1b[36m',
  white: '\\x1b[37m',
  gray: '\\x1b[90m',
  bgRed: '\\x1b[41m',
  bgGreen: '\\x1b[42m',
  bgYellow: '\\x1b[43m',
  bgBlue: '\\x1b[44m'
};

// 辅助函数：彩色输出
const color = (text, colorCode) => colorCode + text + c.reset;
const success = (t) => console.log(c.green + '✓ ' + c.reset + t);
const error = (t) => console.log(c.red + '✗ ' + c.reset + t);
const info = (t) => console.log(c.cyan + 'ℹ ' + c.reset + t);
const warn = (t) => console.log(c.yellow + '⚠ ' + c.reset + t);

// ============ 2. 数据存储 ============
const DATA_DIR = path.join(os.homedir(), '.todo-cli');
const DATA_FILE = path.join(DATA_DIR, 'todos.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadTodos() {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    error('数据文件损坏，将重新创建');
  }
  return [];
}

function saveTodos(todos) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

// ============ 3. 待办事项管理逻辑 ============
function addTodo(text, priority = 'normal') {
  const todos = loadTodos();
  const newTodo = {
    id: todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1,
    text,
    done: false,
    priority,
    createdAt: new Date().toISOString(),
    completedAt: null
  };
  todos.push(newTodo);
  saveTodos(todos);
  return newTodo;
}

function listTodos(showAll = true) {
  const todos = loadTodos();
  if (todos.length === 0) {
    info('暂无待办事项，使用 ' + color('todo add "任务内容"', c.cyan) + ' 添加');
    return [];
  }
  
  const filtered = showAll ? todos : todos.filter(t => !t.done);
  
  console.log('\\n' + c.bold + c.cyan + '📋 待办事项列表' + c.reset);
  console.log(c.dim + '─'.repeat(60) + c.reset);
  
  filtered.forEach(todo => {
    const status = todo.done 
      ? c.green + '✓' + c.reset 
      : c.yellow + '○' + c.reset;
    
    const priorityColors = {
      high: c.red + '(!) ' + c.reset,
      normal: '',
      low: c.gray + '(·) ' + c.reset
    };
    const priorityStr = priorityColors[todo.priority] || '';
    
    const textColor = todo.done ? c.dim : c.white;
    const textStr = todo.done 
      ? c.dim + c.strikethrough + todo.text + c.reset
      : textColor + todo.text + c.reset;
    
    const dateStr = c.gray + new Date(todo.createdAt).toLocaleDateString('zh-CN') + c.reset;
    
    console.log(\` \${status} \${c.bold}#\${todo.id}\${c.reset} \${priorityStr}\${textStr} \${dateStr}\`);
  });
  
  const doneCount = todos.filter(t => t.done).length;
  const totalCount = todos.length;
  console.log(c.dim + '─'.repeat(60) + c.reset);
  console.log(\` \${c.gray}共 \${totalCount} 项，已完成 \${doneCount} 项，待完成 \${totalCount - doneCount} 项\${c.reset}\\n\`);
  
  return filtered;
}

function markDone(id) {
  const todos = loadTodos();
  const todo = todos.find(t => t.id === id);
  if (!todo) {
    error(\`找不到 ID 为 \${id} 的待办事项\`);
    return false;
  }
  todo.done = true;
  todo.completedAt = new Date().toISOString();
  saveTodos(todos);
  success(\`已完成: \${todo.text}\`);
  return true;
}

function deleteTodo(id) {
  const todos = loadTodos();
  const idx = todos.findIndex(t => t.id === id);
  if (idx === -1) {
    error(\`找不到 ID 为 \${id} 的待办事项\`);
    return false;
  }
  const deleted = todos.splice(idx, 1)[0];
  saveTodos(todos);
  success(\`已删除: \${deleted.text}\`);
  return true;
}

function clearCompleted() {
  const todos = loadTodos();
  const completed = todos.filter(t => t.done);
  const remaining = todos.filter(t => !t.done);
  saveTodos(remaining);
  success(\`已清理 \${completed.length} 条已完成事项\`);
}

// ============ 4. 交互式输入 ============
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function ask(rl, question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer.trim());
    });
  });
}

async function interactiveMode() {
  const rl = createInterface();
  
  console.log(c.bold + c.cyan + '\\n🎯 Todo CLI 交互模式' + c.reset);
  console.log(c.gray + '输入命令: add / list / done / delete / clear / quit\\n' + c.reset);
  
  while (true) {
    const cmd = await ask(rl, c.bold + 'todo> ' + c.reset);
    
    if (!cmd || cmd === 'quit' || cmd === 'exit' || cmd === 'q') {
      console.log('再见！');
      rl.close();
      break;
    }
    
    const parts = cmd.split(/\\s+/);
    const command = parts[0];
    
    switch (command) {
      case 'add': {
        let text = parts.slice(1).join(' ');
        if (!text) {
          text = await ask(rl, '  任务内容: ');
        }
        if (text) {
          const prio = await ask(rl, '  优先级 (high/normal/low, 默认normal): ');
          const priority = ['high', 'normal', 'low'].includes(prio) ? prio : 'normal';
          addTodo(text, priority);
          success('添加成功！');
        }
        break;
      }
      case 'list':
      case 'ls':
        listTodos();
        break;
      case 'done': {
        const id = parseInt(parts[1] || await ask(rl, '  完成的任务 ID: '));
        if (id) markDone(id);
        break;
      }
      case 'delete':
      case 'rm': {
        const id = parseInt(parts[1] || await ask(rl, '  要删除的任务 ID: '));
        if (id) deleteTodo(id);
        break;
      }
      case 'clear':
        clearCompleted();
        break;
      case 'help':
      case '?':
        printHelp();
        break;
      default:
        if (cmd.trim()) {
          warn(\`未知命令: \${command}，输入 help 查看帮助\`);
        }
    }
  }
}

// ============ 5. 帮助信息 ============
function printHelp() {
  console.log(\`
\${c.bold}\${c.cyan}📦 Todo CLI - 命令行待办事项管理工具\${c.reset}

\${c.bold}用法:\${c.reset}
  todo <command> [arguments]

\${c.bold}命令:\${c.reset}
  \${c.green}add\${c.reset} "任务内容" [-p high|normal|low]   添加待办事项
  \${c.green}list\${c.reset} [--pending]                       列出所有待办
  \${c.green}done\${c.reset} <id>                              标记待办为已完成
  \${c.green}delete\${c.reset} <id>                           删除待办事项
  \${c.green}clear\${c.reset}                                清空所有已完成的待办
  \${c.green}interactive\${c.reset}                           进入交互模式
  \${c.green}help\${c.reset}                                 显示此帮助信息

\${c.bold}示例:\${c.reset}
  todo add "学习 Node.js" -p high
  todo list
  todo done 1
  todo delete 2
  todo interactive

\${c.bold}数据位置:\${c.reset} \${c.gray}\${DATA_FILE}\${c.reset}
\`);
}

// ============ 6. 参数解析 ============
function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0] || 'help';
  const positional = [];
  const options = {};
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('-p') || arg === '--priority') {
      options.priority = args[i + 1] || 'normal';
      i++;
    } else if (arg === '--pending' || arg === '-P') {
      options.pending = true;
    } else if (!arg.startsWith('-')) {
      positional.push(arg);
    }
  }
  
  return { command, args: positional, options };
}

// ============ 7. 主程序 ============
function main() {
  const { command, args, options } = parseArgs(process.argv);
  
  switch (command) {
    case 'add': {
      const text = args.join(' ');
      if (!text) {
        error('请提供待办内容: ' + color('todo add "任务内容"', c.cyan));
        process.exit(1);
      }
      const priority = options.priority || 'normal';
      if (!['high', 'normal', 'low'].includes(priority)) {
        error('优先级只能是 high, normal, low');
        process.exit(1);
      }
      const todo = addTodo(text, priority);
      success(\`已添加 #\${todo.id}: \${todo.text}\`);
      break;
    }
    
    case 'list':
    case 'ls':
      listTodos(!options.pending);
      break;
    
    case 'done':
    case 'complete': {
      const id = parseInt(args[0]);
      if (!id) {
        error('请提供待办 ID: ' + color('todo done <id>', c.cyan));
        process.exit(1);
      }
      markDone(id);
      break;
    }
    
    case 'delete':
    case 'rm':
    case 'remove': {
      const id = parseInt(args[0]);
      if (!id) {
        error('请提供待办 ID: ' + color('todo delete <id>', c.cyan));
        process.exit(1);
      }
      deleteTodo(id);
      break;
    }
    
    case 'clear':
      clearCompleted();
      break;
    
    case 'interactive':
    case 'i':
      interactiveMode();
      return;  // 不退出，等待交互
    
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;
    
    default:
      error(\`未知命令: \${command}\`);
      info('输入 ' + color('todo help', c.cyan) + ' 查看可用命令');
      process.exit(1);
  }
}

// ============ 如果直接运行此文件，执行主程序 ============
if (require.main === module) {
  main();
}

// 导出函数供测试
module.exports = { addTodo, listTodos, markDone, deleteTodo, clearCompleted, loadTodos, saveTodos, DATA_FILE };
`
  },
  {
    id: "n4-buffer",
    group: "第二部分 核心模块",
    icon: "💾",
    title: "Buffer：二进制数据处理",
    content: `# Buffer：二进制数据处理

JavaScript 在 ES6 之前没有处理二进制数据的原生能力。Node.js 创建了 \`Buffer\` 类来操作二进制数据流，这是 Node.js 核心模块的重要基础。在处理文件 I/O、网络传输、加密、图片处理时都会用到 Buffer。

---

## 一、为什么需要 Buffer？

在浏览器中，JavaScript 主要处理文本、DOM 这些"人类可读"的数据。但在服务器端，我们经常要和"字节"打交道：

- **读写文件**：图片、视频、压缩包都是二进制文件
- **网络通信**：TCP 流传输的是二进制数据
- **加密解密**：加密算法操作字节级数据
- **编码转换**：UTF-8、GBK、Base64、Hex 之间互转

> 💡 **类比理解**：如果字符串是"包装好的礼盒"，Buffer 就是礼盒里装的"原材料"。当你在网络上传输数据或读写文件时，数据最终都是 0 和 1 的字节流，Buffer 就是让你操作这些原始字节的工具。

Buffer 类似于整数数组，但它对应 V8 堆外的**固定大小**原始内存分配。Buffer 的大小在创建时确定，无法调整。

---

## 二、创建 Buffer

### 2.1 Buffer.from() - 从已有数据创建

最安全、最推荐的方式：

\`\`\`javascript
// 从字符串创建
const buf1 = Buffer.from('Hello, Node.js');

// 从数组创建（每个元素是字节值 0-255）
const buf2 = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]);

// 从另一个 Buffer 创建（复制）
const buf3 = Buffer.from(buf1);

// 从字符串 + 指定编码创建
const buf4 = Buffer.from('你好', 'utf8');
\`\`\`

### 2.2 Buffer.alloc() - 创建指定大小的已初始化 Buffer

创建时会用 0 填充内存，安全但稍慢：

\`\`\`javascript
// 创建 10 字节的 Buffer，填充 0
const buf1 = Buffer.alloc(10);

// 创建 10 字节，用 0x1 填充
const buf2 = Buffer.alloc(10, 1);

// 创建 5 字节，填充满 'a'
const buf3 = Buffer.alloc(5, 'a', 'utf8');
\`\`\`

### 2.3 Buffer.allocUnsafe() - 快速但不干净

创建时**不初始化内存**，可能包含旧数据，需要手动 fill 或 write：

\`\`\`javascript
// 快，但 buf 中可能有敏感旧数据
const buf = Buffer.allocUnsafe(10);
buf.fill(0);  // 手动清零才安全
\`\`\`

> ⚠️ **安全警告**：\`allocUnsafe\` 虽然快，但新创建的 Buffer 可能包含之前内存中的敏感数据。如果要把 Buffer 返回给用户，一定要先 fill 或 write 覆盖，否则有内存泄漏风险！

> ❌ **废弃的 API**：\`new Buffer()\` 构造函数因为安全性问题已废弃，请使用 \`Buffer.from()\`、\`Buffer.alloc()\`、\`Buffer.allocUnsafe()\`。

---

## 三、写入和读取数据

### 3.1 写入数据

\`\`\`javascript
const buf = Buffer.alloc(20);

// write(string[, offset[, length]][, encoding])
const len = buf.write('Hello World');
console.log('写入了', len, '字节');

// 从偏移量 11 开始写入
buf.write(' Node.js!', 11);
\`\`\`

### 3.2 读取数据

\`\`\`javascript
// toString() 转字符串
console.log(buf.toString());        // 'Hello World Node.js!'
console.log(buf.toString('utf8', 0, 5));  // 'Hello'
console.log(buf.toString('hex'));   // 十六进制
console.log(buf.toString('base64')); // Base64 编码

// toJSON()
console.log(buf.toJSON());  // { type: 'Buffer', data: [72, 101, ...] }
\`\`\`

### 3.3 按偏移量读写数值

Buffer 支持按位置读写不同精度的整数、浮点数：

\`\`\`javascript
const buf = Buffer.alloc(8);

// 写入：write<Type>(value, offset[, endian])
buf.writeUInt8(0x12, 0);       // 偏移 0 写入 1 字节无符号整数
buf.writeUInt16BE(0x1234, 1);  // 偏移 1 写入 2 字节大端序
buf.writeUInt32LE(0x12345678, 3); // 偏移 3 写入 4 字节小端序
buf.writeDoubleBE(3.14, 7);    // 偏移 7 写入 8 字节双精度浮点数

// 读取
console.log(buf.readUInt8(0));
console.log(buf.readUInt16BE(1));
// BE = Big Endian（大端）, LE = Little Endian（小端）
\`\`\`

---

## 四、Buffer 常用方法

### 4.1 拼接 concat()

\`\`\`javascript
const buf1 = Buffer.from('Hello');
const buf2 = Buffer.from(' ');
const buf3 = Buffer.from('World');
const combined = Buffer.concat([buf1, buf2, buf3]);
console.log(combined.toString());  // 'Hello World'

// 指定总长度
const fixed = Buffer.concat([buf1, buf3], 7);  // 取前 7 字节
\`\`\`

### 4.2 切片 slice()

\`\`\`javascript
const buf = Buffer.from('Hello World');
const sub = buf.slice(0, 5);  // 'Hello'
console.log(sub.toString());

// ⚠️ 注意：slice 返回的是新 Buffer，但与原 Buffer **共享内存**！
sub.write('h');  // 这会修改 buf！
console.log(buf.toString());  // 'hello World'（H 变成小写了！）
\`\`\`

如果要独立副本，用 \`Buffer.from(buf.slice(...))\` 或 \`buf.subarray()\` 然后复制。

### 4.3 复制 copy()

\`\`\`javascript
const buf1 = Buffer.from('Hello');
const buf2 = Buffer.alloc(5);
buf1.copy(buf2);  // 把 buf1 复制到 buf2
buf2[0] = 0x68;   // 修改 buf2 不影响 buf1
console.log(buf1.toString());  // 'Hello'（不受影响）
\`\`\`

### 4.4 比较与查找

\`\`\`javascript
const buf1 = Buffer.from('ABC');
const buf2 = Buffer.from('ABD');
const buf3 = Buffer.from('ABC');

buf1.equals(buf3);   // true，内容相同
buf1.compare(buf2);  // -1（buf1 < buf2）
buf1.compare(buf3);  // 0（相等）
buf2.compare(buf1);  // 1（buf2 > buf1）

// 查找
const buf = Buffer.from('Hello World Hello');
buf.indexOf('World');   // 6
buf.indexOf('Hello', 6); // 12（从位置6开始找）
buf.includes('World');  // true
buf.lastIndexOf('Hello'); // 12
\`\`\`

### 4.5 长度与填充

\`\`\`javascript
const buf = Buffer.alloc(10);
console.log(buf.length);  // 10（字节长度）

// fill 填充
buf.fill(0x41);  // 全部填充 'A' (0x41 是 A 的 ASCII 码)
console.log(buf.toString());  // 'AAAAAAAAAA'

// 填充指定范围
buf.fill('B', 2, 5);  // 偏移2到5填B
console.log(buf.toString());  // 'AABBBAAAAA'
\`\`\`

---

## 五、Buffer 与 TypedArray 的关系

Node.js Buffer 是 JavaScript Uint8Array 的子类（TypedArray），但做了扩展优化：

| 特性 | Uint8Array | Buffer |
|------|------------|--------|
| 元素大小 | 1 字节 | 1 字节 |
| 编码处理 | ❌ | ✅ 支持多种编码 |
| 网络字节序 | ❌ | ✅ 16/32/64位读写 |
| allocUnsafe | ❌ | ✅ |
| 跨 Node.js 版本 | ✅ | ✅ |

\`\`\`javascript
const buf = Buffer.from('hello');
console.log(buf instanceof Uint8Array);  // true

// 可以从 TypedArray 创建
const arr = new Uint8Array([104, 101, 108, 108, 111]);
const buf2 = Buffer.from(arr);
console.log(buf2.toString());  // 'hello'
\`\`\`

---

## 六、字符编码

Node.js Buffer 支持多种字符编码：

| 编码 | 说明 |
|------|------|
| \`'utf8'\` | UTF-8，多字节 Unicode，默认编码 |
| \`'utf16le'\` | UTF-16 小端序 |
| \`'latin1'\` / \`'binary'\` | ISO-8859-1，单字节编码 |
| \`'ascii'\` | 7位 ASCII |
| \`'base64'\` | Base64 编码 |
| \`'hex'\` | 十六进制，每个字节编为2字符 |
| \`'ucs2'\` | 'utf16le' 别名 |

### 6.1 编码转换实战

**字符串 ↔ Buffer ↔ Base64 ↔ Hex：**

\`\`\`javascript
const str = '你好，Node.js！';

// 字符串 → Buffer
const buf = Buffer.from(str, 'utf8');
console.log('UTF-8 Buffer 字节数:', buf.length);  // 中文占3字节/字

// Buffer → Base64
const base64 = buf.toString('base64');
console.log('Base64:', base64);

// Base64 → Buffer → 字符串
const decoded = Buffer.from(base64, 'base64').toString('utf8');
console.log('解码:', decoded);

// Hex 编码
const hex = buf.toString('hex');
console.log('Hex:', hex);
const fromHex = Buffer.from(hex, 'hex').toString('utf8');
\`\`\`

### 6.2 中文编码注意事项

- UTF-8 下中文字符占 **3 字节**，emoji 占 4 字节
- 不要假设"1字符 = 1字节"，\`buf.length\` 是字节数不是字符数
- 切片时如果切到 UTF-8 多字节字符中间，会产生乱码

---

## 七、Buffer 典型使用场景

1. **文件 I/O**：fs.readFile 返回的 data 默认是 Buffer
2. **网络通信**：TCP socket 的 data 事件是 Buffer
3. **加密解密**：crypto 模块输入输出都是 Buffer
4. **图片/视频处理**：二进制媒体文件
5. **流式处理**：Stream 中的 chunk 是 Buffer
6. **编码转换**：UTF-8 / GBK / Base64 互转
`,
    code: `// ============================================
// Buffer 全面操作演示
// ============================================

console.log('=== Buffer 二进制数据处理演示 ===\\n');

// ============ demo 1: 创建 Buffer ============
console.log('--- Demo 1: 创建 Buffer 的各种方式 ---');

// 1.1 从字符串创建
const bufFromString = Buffer.from('Hello, Node.js Buffer!');
console.log('从字符串创建:', bufFromString.toString());
console.log('  字节长度:', bufFromString.length);
console.log('  第一个字节:', bufFromString[0], '→ 字符:', String.fromCharCode(bufFromString[0]));

// 1.2 从字节数组创建
const bufFromArray = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
console.log('\\n从字节数组创建:', bufFromArray.toString());
console.log('  十六进制:', bufFromArray.toString('hex'));

// 1.3 从另一个 Buffer 创建（复制）
const original = Buffer.from('original');
const copy = Buffer.from(original);
copy[0] = 0x4f; // O
console.log('\\n原 Buffer:', original.toString(), '(不受影响)');
console.log('复制 Buffer:', copy.toString());

// 1.4 alloc 创建指定大小
const allocBuf = Buffer.alloc(10);
console.log('\\nalloc(10) 初始内容:', allocBuf);
console.log('  全部是 0:', allocBuf.every(b => b === 0));

// 1.5 alloc 指定填充值
const filled = Buffer.alloc(8, 0x41);
console.log('\\nalloc(8, 0x41) 填充 A:', filled.toString());

// ============ demo 2: 写入和读取 ============
console.log('\\n--- Demo 2: 写入和读取数据 ---');

const writeBuf = Buffer.alloc(50);
let offset = 0;

// write 返回写入的字节数
offset += writeBuf.write('Hello, ');
console.log('写入 Hello, 后，偏移量:', offset);
offset += writeBuf.write('世界!', offset);
console.log('写入 世界! 后，偏移量:', offset);
console.log('当前内容:', writeBuf.toString('utf8', 0, offset));

// 使用 toString 截取
console.log('\\n截取前5字节:', writeBuf.toString('utf8', 0, 5));

// toJSON
const json = writeBuf.toJSON();
console.log('\\ntoJSON() type:', json.type);
console.log('toJSON() data 前20字节:', json.data.slice(0, 20));

// ============ demo 3: 数值读写（端序）============
console.log('\\n--- Demo 3: 整数/浮点数读写（端序）---');

const numBuf = Buffer.alloc(16);
// 写入不同数值
numBuf.writeUInt8(0xFF, 0);           // 1字节无符号
numBuf.writeInt8(-1, 1);              // 1字节有符号
numBuf.writeUInt16BE(0x1234, 2);      // 2字节大端序
numBuf.writeUInt16LE(0x1234, 4);      // 2字节小端序
numBuf.writeUInt32BE(0xDEADBEEF, 6);  // 4字节大端
numBuf.writeDoubleBE(3.1415926535, 10); // 8字节浮点

console.log('UInt8 @0:', numBuf.readUInt8(0).toString(16));
console.log('Int8 @1:', numBuf.readInt8(1));
console.log('UInt16BE @2:', numBuf.readUInt16BE(2).toString(16));
console.log('UInt16LE @4:', numBuf.readUInt16LE(4).toString(16));
console.log('UInt32BE @6:', numBuf.readUInt32BE(6).toString(16));
console.log('DoubleBE @10:', numBuf.readDoubleBE(10).toFixed(6));

// 大端 vs 小端演示
const endian = Buffer.alloc(4);
endian.writeUInt32BE(0x12345678, 0);
console.log('\\n大端序(BE) 0x12345678:', Array.from(endian).map(b => b.toString(16).padStart(2, '0')).join(' '));
endian.writeUInt32LE(0x12345678, 0);
console.log('小端序(LE) 0x12345678:', Array.from(endian).map(b => b.toString(16).padStart(2, '0')).join(' '));
console.log('(大端高位在前，小端低位在前 - 网络协议通常用大端)');

// ============ demo 4: 拼接、切片、复制 ============
console.log('\\n--- Demo 4: concat, slice, copy ---');

const part1 = Buffer.from('你好');
const part2 = Buffer.from(', ');
const part3 = Buffer.from('World');
const part4 = Buffer.from('!');
const combined = Buffer.concat([part1, part2, part3, part4]);
console.log('concat 拼接结果:', combined.toString());

// slice 切片（共享内存！）
const sliceBuf = Buffer.from('Hello World');
const helloSlice = sliceBuf.slice(0, 5);
console.log('\\nslice(0,5):', helloSlice.toString());
helloSlice[0] = 0x68; // h
console.log('修改 slice 后原 Buffer:', sliceBuf.toString(), '(被修改了！)');

// 安全复制（不共享内存）
const safeCopy = Buffer.alloc(5);
Buffer.from('Hello').copy(safeCopy);
safeCopy[0] = 0x68;
console.log('\\ncopy 方式，原 Buffer 不受影响');

// ============ demo 5: 比较和查找 ============
console.log('\\n--- Demo 5: 比较与查找 ---');

const a = Buffer.from('ABC');
const b = Buffer.from('ABD');
const a2 = Buffer.from('ABC');

console.log('ABC equals ABC:', a.equals(a2));
console.log('ABC compare ABD:', a.compare(b), '(-1=前者小,0=相等,1=前者大)');

const sentence = Buffer.from('Node.js is great, Node.js is fast');
console.log('\\n查找第一个 Node.js:', sentence.indexOf('Node.js'));
console.log('从位置10找 Node.js:', sentence.indexOf('Node.js', 10));
console.log('包含 great?:', sentence.includes('great'));
console.log('最后出现 is:', sentence.lastIndexOf('is'));

// ============ demo 6: 编码转换 ============
console.log('\\n--- Demo 6: 编码转换（UTF-8, Base64, Hex）---');

const chinese = '你好，Node.js！🚀';
const utf8Buf = Buffer.from(chinese, 'utf8');

console.log('原字符串:', chinese);
console.log('UTF-8 字节数:', utf8Buf.length, '(中文3字节,emoji4字节)');
console.log('字符数:', [...chinese].length);

// Base64 编解码
const base64Str = utf8Buf.toString('base64');
console.log('\\nBase64:', base64Str);
const fromBase64 = Buffer.from(base64Str, 'base64').toString('utf8');
console.log('Base64 解码:', fromBase64);

// Hex 编解码
const hexStr = utf8Buf.toString('hex');
console.log('\\nHex:', hexStr);
const fromHex = Buffer.from(hexStr, 'hex').toString('utf8');
console.log('Hex 解码:', fromHex);

// 编码一致性验证
console.log('\\n编解码一致:', fromBase64 === chinese && fromHex === chinese);

// ============ demo 7: UTF-8 切片陷阱 ============
console.log('\\n--- Demo 7: UTF-8 切片陷阱演示 ---');

const cnBuf = Buffer.from('你好世界');
console.log('原 Buffer:', cnBuf.toString());
console.log('正确 slice(0,3):', cnBuf.slice(0, 3).toString(), '(一个汉字3字节)');
// 切到字符中间会乱码
console.log('错误 slice(0,2):', cnBuf.slice(0, 2).toString(), '(切到了汉字中间！)');

// 如何安全切片：不要在字节层面切 UTF-8 字符串
const str = cnBuf.toString();
console.log('安全方式（先转字符串再切）:', str.slice(0, 2));

// ============ demo 8: Buffer 遍历和修改 ============
console.log('\\n--- Demo 8: 遍历与修改 Buffer ---');

const iterBuf = Buffer.from('Hello Buffer!');
console.log('遍历每个字节:');
for (let i = 0; i < iterBuf.length; i++) {
  if (i < 6 || i >= iterBuf.length - 1) {
    console.log(\`  [\${i}]: 0x\${iterBuf[i].toString(16).padStart(2,'0')} '\${String.fromCharCode(iterBuf[i])}'\`);
  } else if (i === 6) {
    console.log('  ...');
  }
}

// 将字符串转为大写（ASCII）
const toUpper = Buffer.from('hello world');
for (let i = 0; i < toUpper.length; i++) {
  if (toUpper[i] >= 0x61 && toUpper[i] <= 0x7A) {
    toUpper[i] -= 0x20; // 小写→大写相差32
  }
}
console.log('\\n转大写:', toUpper.toString());

// fill 填充
const fillBuf = Buffer.alloc(20);
fillBuf.write('Hello');
console.log('\\nfill 前:', fillBuf.toString());
fillBuf.fill(0); // 清零
console.log('fill(0) 后:', fillBuf.toString(), '(全是0字节)');

console.log('\\n✅ Buffer 演示完成！');
console.log('💡 Buffer 要点:');
console.log('  1. Buffer 是固定大小的二进制内存块');
console.log('  2. 用 Buffer.from/Buffer.alloc 创建，不用 new Buffer()');
console.log('  3. slice 共享内存，独立副本用 Buffer.from()');
console.log('  4. 注意 UTF-8 多字节字符不要在字节层面切片');
console.log('  5. BE=大端(网络序), LE=小端(主机序)');
`
  },
  {
    id: "n4-fs",
    group: "第二部分 核心模块",
    icon: "📁",
    title: "fs 文件系统：读写文件的艺术",
    content: `# fs 文件系统：读写文件的艺术

文件系统操作是后端开发最基础的能力之一。Node.js 的 \`fs\` 模块提供了全面的文件 I/O 能力，支持同步、异步回调、Promise 三种风格，满足不同场景需求。

---

## 一、fs 模块三种风格

fs 模块几乎所有 API 都有三种形式，理解它们的区别至关重要：

| 风格 | 后缀 | 阻塞线程？ | 返回值 | 适用场景 |
|------|------|------------|--------|----------|
| **同步 (Sync)** | \`fs.xxxSync\` | ✅ 阻塞 | 直接返回结果 | 启动时加载配置、CLI 脚本 |
| **异步回调** | \`fs.xxx\` | ❌ 非阻塞 | 回调函数返回 | 传统 Node.js 风格 |
| **Promise** | \`fs/promises.xxx\` | ❌ 非阻塞 | Promise | async/await 现代写法（推荐） |

> 💡 **为什么推荐 Promise 风格？** 回调风格容易产生"回调地狱"，而 async/await 让异步代码像同步一样清晰易读。

\`\`\`javascript
// 同步
const fs = require('fs');
const data = fs.readFileSync('file.txt', 'utf8');

// 异步回调
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// Promise 风格（推荐！）
const fs = require('fs/promises');
async function read() {
  const data = await fs.readFile('file.txt', 'utf8');
}
\`\`\`

---

## 二、读取文件

### 2.1 一次性读取：readFile

适合读取小文件，把整个文件内容读入内存：

\`\`\`javascript
const fs = require('fs/promises');

// 读取为 Buffer（默认）
const buf = await fs.readFile('image.png');
console.log(buf instanceof Buffer);  // true

// 指定编码读取为字符串
const text = await fs.readFile('note.txt', 'utf8');
\`\`\`

### 2.2 流式读取：createReadStream

对于大文件（如 GB 级日志、视频），不能一次性读入内存，要用流：

\`\`\`javascript
const fs = require('fs');
const stream = fs.createReadStream('big-file.log', { encoding: 'utf8' });

stream.on('data', chunk => {
  console.log('收到一块数据:', chunk.length, '字节');
});
stream.on('end', () => console.log('读取完成'));
stream.on('error', err => console.error('出错:', err));
\`\`\`

---

## 三、写入文件

### 3.1 一次性写入：writeFile

\`\`\`javascript
const fs = require('fs/promises');

// 写入字符串（会覆盖原文件）
await fs.writeFile('output.txt', 'Hello World\\n', 'utf8');

// 追加内容（flag: 'a'）
await fs.writeFile('log.txt', '新日志行\\n', { flag: 'a' });

// 写入 Buffer（二进制数据）
const buf = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
await fs.writeFile('binary.dat', buf);
\`\`\`

### 3.2 追加文件：appendFile

\`\`\`javascript
await fs.appendFile('log.txt', '追加一行\\n');
// 等价于 writeFile 加 flag: 'a'
\`\`\`

### 3.3 流式写入：createWriteStream

适合写入大文件、网络数据落盘：

\`\`\`javascript
const writeStream = fs.createWriteStream('output.txt');
writeStream.write('第一行\\n');
writeStream.write('第二行\\n');
writeStream.end();
\`\`\`

---

## 四、目录操作

| 操作 | 同步方法 | 异步方法 | 说明 |
|------|----------|----------|------|
| 创建目录 | \`mkdirSync\` | \`mkdir\` | recursive:true 递归创建 |
| 读取目录 | \`readdirSync\` | \`readdir\` | withFileTypes:true 获取类型 |
| 删除目录 | \`rmdirSync\` | \`rmdir\` | rm 更通用 |
| 删除 | \`rmSync\` | \`rm\` | recursive:true 递归删除 |
| 重命名 | \`renameSync\` | \`rename\` | 移动/重命名 |
| 复制 | \`cpSync\` | \`cp\` | recursive:true 复制目录 |

\`\`\`javascript
const fs = require('fs/promises');

// 递归创建目录
await fs.mkdir('a/b/c', { recursive: true });

// 读取目录
const files = await fs.readdir('.', { withFileTypes: true });
for (const f of files) {
  console.log(f.isDirectory() ? '[DIR]' : '[FILE]', f.name);
}

// 递归删除（危险！）
await fs.rm('temp', { recursive: true, force: true });

// 复制目录
await fs.cp('src', 'dist', { recursive: true });
\`\`\`

---

## 五、文件信息与权限

### 5.1 stat：获取文件信息

\`\`\`javascript
const stat = await fs.stat('file.txt');
console.log('大小:', stat.size, '字节');
console.log('是文件?:', stat.isFile());
console.log('是目录?:', stat.isDirectory());
console.log('创建时间:', stat.birthtime);
console.log('修改时间:', stat.mtime);
\`\`\`

### 5.2 access：检查权限

\`\`\`javascript
const fs = require('fs/promises');
const { constants } = require('fs');

try {
  await fs.access('secret.txt', constants.R_OK | constants.W_OK);
  console.log('可以读写');
} catch {
  console.log('无权访问');
}
\`\`\`

权限常量：\`R_OK\`(读), \`W_OK\`(写), \`X_OK\`(执行), \`F_OK\`(存在)

### 5.3 chmod/chown

\`\`\`javascript
await fs.chmod('script.sh', 0o755);  // rwxr-xr-x
// chown 需要 root 权限
\`\`\`

---

## 六、文件监视：fs.watch

监视文件/目录变化，常用于热重载、配置热更新：

\`\`\`javascript
const fs = require('fs');

const watcher = fs.watch('config.json', (eventType, filename) => {
  console.log(\`事件类型: \${eventType}, 文件: \${filename}\`);
  console.log('配置文件变化，重新加载...');
});

// 停止监视
// watcher.close();
\`\`\`

> ⚠️ **注意**：fs.watch 在不同平台行为有差异，且可能触发多次事件，实际项目中建议加防抖。

---

## 七、⚠️ 路径遍历安全漏洞

这是文件操作最常见的安全漏洞！

**危险代码**：
\`\`\`javascript
const path = require('path');
const userFile = req.query.file;  // 用户输入，如 "../../etc/passwd"
// ❌ 危险！用户可以通过 ../ 访问任意文件
const data = await fs.readFile(\`./user-files/\${userFile}\`);
\`\`\`

**安全写法**：
\`\`\`javascript
const baseDir = path.resolve('./user-files');
const filePath = path.resolve(baseDir, userFile);
// 确保最终路径在 baseDir 内！
if (!filePath.startsWith(baseDir + path.sep) && filePath !== baseDir) {
  throw new Error('非法路径');
}
\`\`\`

---

## 八、临时目录

操作系统有专门的临时目录，适合放临时文件：

\`\`\`javascript
const os = require('os');
const path = require('path');
const fs = require('fs/promises');

const tmpDir = os.tmpdir();
const tmpFile = path.join(tmpDir, 'my-app-' + Date.now() + '.tmp');
await fs.writeFile(tmpFile, '临时数据');
// 用完记得删！
\`\`\`
`,
    code: `// ============================================
// fs 文件系统综合演示
// ============================================

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const os = require('os');

console.log('=== fs 文件系统模块演示 ===\\n');

// 创建临时工作目录
const workDir = path.join(os.tmpdir(), 'fs-demo-' + Date.now());
fs.mkdirSync(workDir, { recursive: true });
console.log('工作目录:', workDir);

// ============ demo 1: 写入文件 ============
console.log('\\n--- Demo 1: 写入文件 ---');

// 1.1 writeFileSync 同步写入
const filePath = path.join(workDir, 'hello.txt');
fs.writeFileSync(filePath, 'Hello, Node.js fs 模块！\\n这是第一行内容\\n');
console.log('同步写入:', filePath);

// 1.2 appendFileSync 追加
fs.appendFileSync(filePath, '这是追加的第二行\\n');
fs.appendFileSync(filePath, '这是追加的第三行\\n');
console.log('追加了 2 行内容');

// 1.3 写入多行内容
const lines = [
  '# 配置文件示例',
  'port=3000',
  'host=localhost',
  'debug=true',
  ''
].join('\\n');
const configPath = path.join(workDir, 'config.ini');
fs.writeFileSync(configPath, lines);
console.log('写入配置文件:', configPath);

// 写入二进制数据
const binPath = path.join(workDir, 'binary.bin');
const binData = Buffer.alloc(256);
for (let i = 0; i < 256; i++) binData[i] = i;
fs.writeFileSync(binPath, binData);
console.log('写入 256 字节二进制文件');

// ============ demo 2: 读取文件 ============
console.log('\\n--- Demo 2: 读取文件 ---');

// 2.1 同步读取为字符串
const content = fs.readFileSync(filePath, 'utf8');
console.log('hello.txt 内容:');
console.log(content);

// 2.2 读取为 Buffer（二进制）
const binRead = fs.readFileSync(binPath);
console.log('binary.bin 前 16 字节 (hex):', binRead.slice(0, 16).toString('hex'));

// 2.3 读取部分内容（offset/length）
const buf = Buffer.alloc(5);
const fd = fs.openSync(configPath, 'r');
fs.readSync(fd, buf, 0, 5, 0);  // 从位置0读5字节
fs.closeSync(fd);
console.log('config.ini 前 5 字节:', buf.toString());

// ============ demo 3: 文件信息 stat ============
console.log('\\n--- Demo 3: 文件信息 (stat) ---');
const stat = fs.statSync(filePath);
console.log('文件大小:', stat.size, '字节');
console.log('是文件:', stat.isFile());
console.log('是目录:', stat.isDirectory());
console.log('是符号链接:', stat.isSymbolicLink());
console.log('创建时间:', stat.birthtime.toLocaleString('zh-CN'));
console.log('修改时间:', stat.mtime.toLocaleString('zh-CN'));
console.log('访问时间:', stat.atime.toLocaleString('zh-CN'));

// ============ demo 4: 目录操作 ============
console.log('\\n--- Demo 4: 目录操作 ---');

// 创建多级目录
const nestedDir = path.join(workDir, 'a', 'b', 'c', 'd');
fs.mkdirSync(nestedDir, { recursive: true });
console.log('递归创建目录:', nestedDir);

// 在各层创建文件
fs.writeFileSync(path.join(workDir, 'root.txt'), '根目录文件');
fs.writeFileSync(path.join(workDir, 'a', 'a.txt'), 'A 目录');
fs.writeFileSync(path.join(workDir, 'a', 'b', 'b.txt'), 'B 目录');

// 读取目录（withFileTypes 获取类型信息）
console.log('\\n递归目录结构:');
function listDir(dir, indent = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      console.log(\`\${indent}📁 \${entry.name}/\`);
      listDir(fullPath, indent + '  ');
    } else {
      const size = fs.statSync(fullPath).size;
      console.log(\`\${indent}📄 \${entry.name} (\${size} bytes)\`);
    }
  }
}
listDir(workDir);

// ============ demo 5: 复制、重命名、删除 ============
console.log('\\n--- Demo 5: 复制/重命名/删除 ---');

// 复制文件
const copyPath = path.join(workDir, 'hello-copy.txt');
fs.copyFileSync(filePath, copyPath);
console.log('复制文件:', path.basename(copyPath));

// 重命名
const renamePath = path.join(workDir, 'hello-renamed.txt');
fs.renameSync(copyPath, renamePath);
console.log('重命名为:', path.basename(renamePath));

// 删除文件
fs.unlinkSync(renamePath);
console.log('已删除重命名文件');

// 复制目录（recursive）
const srcDir = path.join(workDir, 'a');
const destDir = path.join(workDir, 'a-copy');
fs.cpSync(srcDir, destDir, { recursive: true });
console.log('递归复制目录 a -> a-copy');

// ============ demo 6: 权限检查 ============
console.log('\\n--- Demo 6: 权限检查 (access) ---');
const { constants } = fs;

function checkAccess(filePath) {
  const checks = [
    { const: constants.F_OK, name: '存在' },
    { const: constants.R_OK, name: '可读' },
    { const: constants.W_OK, name: '可写' }
  ];
  const results = [];
  for (const c of checks) {
    try {
      fs.accessSync(filePath, c.const);
      results.push('✅' + c.name);
    } catch {
      results.push('❌' + c.name);
    }
  }
  return results.join(' ');
}

console.log('hello.txt 权限:', checkAccess(filePath));
console.log('not-exist.txt 权限:', checkAccess(path.join(workDir, 'not-exist.txt')));

// ============ demo 7: 路径遍历安全检查 ============
console.log('\\n--- Demo 7: 路径遍历安全演示 ---');

function safeResolve(baseDir, userInput) {
  const resolved = path.resolve(baseDir, userInput);
  // 关键安全检查：最终路径必须在 baseDir 内！
  const normalizedBase = path.resolve(baseDir) + path.sep;
  if (!resolved.startsWith(normalizedBase) && resolved !== path.resolve(baseDir)) {
    throw new Error(\`非法路径访问: \${userInput}\`);
  }
  return resolved;
}

const safeBase = path.join(workDir, 'user-files');
fs.mkdirSync(safeBase, { recursive: true });
fs.writeFileSync(path.join(safeBase, 'note.txt'), '用户笔记内容');

try {
  const safe = safeResolve(safeBase, 'note.txt');
  console.log('合法访问 note.txt:', path.basename(safe));
  const attack = safeResolve(safeBase, '../../etc/passwd');
  console.log('攻击成功?', attack);
} catch (e) {
  console.log('🚫 路径攻击被拦截:', e.message);
}

// ============ demo 8: Promise 风格 (async/await) ============
console.log('\\n--- Demo 8: fs/promises 异步风格 ---');

async function asyncDemo() {
  const asyncFile = path.join(workDir, 'async-demo.txt');
  
  // async/await 写入
  await fsp.writeFile(asyncFile, '这是通过 fs/promises 写入的内容\\n');
  console.log('Promise 风格写入成功');
  
  // async/await 读取
  const content = await fsp.readFile(asyncFile, 'utf8');
  console.log('Promise 风格读取:', content.trim());
  
  // stat
  const stat = await fsp.stat(asyncFile);
  console.log('文件大小:', stat.size);
}

asyncDemo().catch(console.error);

// ============ demo 9: 流式读写 ============
console.log('\\n--- Demo 9: Stream 流式读写（大文件用）---');

const readStreamPath = path.join(workDir, 'stream-read.txt');
const writeStreamPath = path.join(workDir, 'stream-write.txt');

// 先创建一个测试文件
const streamContent = Array(100).fill('这是测试行\\n').join('');
fs.writeFileSync(readStreamPath, streamContent);
console.log('创建测试文件，大小:', fs.statSync(readStreamPath).size, '字节');

// 流式复制
let chunkCount = 0;
let totalBytes = 0;
const rs = fs.createReadStream(readStreamPath);
const ws = fs.createWriteStream(writeStreamPath);

rs.on('data', (chunk) => {
  chunkCount++;
  totalBytes += chunk.length;
});
rs.on('end', () => {
  console.log(\`流式读取完成: \${chunkCount} 个 chunk, 共 \${totalBytes} 字节\`);
  console.log('复制文件大小一致:', fs.statSync(readStreamPath).size === fs.statSync(writeStreamPath).size);
});
rs.pipe(ws);  // pipe 自动连接读→写

// ============ 清理 ============
setTimeout(() => {
  try {
    fs.rmSync(workDir, { recursive: true, force: true });
    console.log('\\n🧹 临时目录已清理');
  } catch (e) {}
}, 500);

console.log('\\n✅ fs 模块演示完成！');
console.log('💡 fs 最佳实践:');
console.log('  1. 大文件用 Stream，小文件用 readFile/writeFile');
console.log('  2. 优先使用 fs/promises + async/await');
console.log('  3. 注意路径遍历安全，永远校验用户输入的路径');
console.log('  4. 操作目录用 recursive:true 避免 ENOENT 错误');
console.log('  5. 临时文件用完记得删除');
`
  },
  {
    id: "n4-path",
    group: "第二部分 核心模块",
    icon: "🛤️",
    title: "path 模块：路径处理的瑞士军刀",
    content: `# path 模块：路径处理的瑞士军刀

路径处理是日常开发中最常用的操作之一。拼接路径、提取文件名、获取扩展名、处理跨平台差异——这些看似简单的事情，如果手动拼接字符串很容易出错。Node.js 内置的 \`path\` 模块就是专门解决这些问题的。

---

## 一、为什么需要 path 模块？

你可能觉得路径拼接很简单：\`dir + '/' + file\`，但实际问题很多：

| 问题 | 手动拼接的坑 |
|------|-------------|
| Windows 用 \`\\\`，macOS/Linux 用 \`/\` | 跨平台路径分隔符不一致 |
| 多余的斜杠 | \`a//b\`、\`a/b/\` 等不规范路径 |
| \`..\` 和 \`.\` | 需要解析相对路径 |
| 根目录问题 | \`/\`、\`C:\\\\\` 处理方式不同 |

> 💡 **类比理解**：path 模块就像是路径界的"智能翻译官"——不管你在什么操作系统，不管输入路径多乱，它都能帮你整理成规范、正确的路径。

---

## 二、最容易混淆：path.join() vs path.resolve()

这两个方法是面试高频考点，也是最容易用错的，务必搞清楚！

### 2.1 path.join()：片段拼接

\`path.join()\` 只是简单地把路径片段**连接**在一起，然后规范化：

\`\`\`javascript
const path = require('path');

path.join('/a', 'b', 'c');     // '/a/b/c'
path.join('/a', '/b/', 'c');   // '/a/b/c'（自动处理斜杠）
path.join('a', 'b', '..', 'c'); // 'a/c'（解析 ..）
path.join('a', './b', 'c/');  // 'a/b/c'（规范化）
\`\`\`

**特点**：
- 只是拼接和规范化
- 如果第一个参数不是绝对路径，结果也是相对路径
- 不会自动加当前工作目录

### 2.2 path.resolve()：解析为绝对路径

\`path.resolve()\` 把路径片段**从右往左**解析，直到构造出一个绝对路径：

\`\`\`javascript
// 假设当前工作目录是 /Users/zhaoliangshun/project
path.resolve('a', 'b');           // '/Users/zhaoliangshun/project/a/b'
path.resolve('/a', 'b', 'c');     // '/a/b/c'（遇到 /a 已经是绝对路径，停止解析）
path.resolve('a', '/b', 'c');     // '/b/c'（/b 是绝对路径，a 被忽略）
path.resolve();                    // 返回当前工作目录（等价于 process.cwd()）
\`\`\`

**关键区别**：

| 特性 | path.join() | path.resolve() |
|------|-------------|----------------|
| 结果是否一定是绝对路径？ | ❌ 不一定 | ✅ 一定是 |
| 处理方式 | 从左到右拼接 | 从右到左解析，遇到根就停 |
| 无参数时返回 | '.'（当前目录） | 工作目录绝对路径 |
| 相对路径处理 | 保持相对 | 相对于 process.cwd() 解析 |

> ⚠️ **最佳实践**：
> - 拼接已知的路径片段用 \`path.join()\`
> - 需要绝对路径（比如找配置文件、写日志）用 \`path.resolve()\`
> - 不要手动用 \`+\` 拼接路径！

---

## 三、路径解析方法

### 3.1 获取路径各部分

\`\`\`javascript
const filePath = '/home/user/docs/report.pdf';

path.basename(filePath);       // 'report.pdf'（文件名+扩展名）
path.basename(filePath, '.pdf'); // 'report'（去掉指定扩展名）
path.dirname(filePath);        // '/home/user/docs'（目录部分）
path.extname(filePath);        // '.pdf'（扩展名，带点）
\`\`\`

### 3.2 path.parse()：解析为对象

一次性把路径拆成所有组成部分：

\`\`\`javascript
const parsed = path.parse('/home/user/docs/report.pdf');
// 返回:
// {
//   root: '/',
//   dir: '/home/user/docs',
//   base: 'report.pdf',
//   ext: '.pdf',
//   name: 'report'
// }
\`\`\`

### 3.3 path.format()：从对象生成路径

\`parse()\` 的反向操作：

\`\`\`javascript
path.format({
  dir: '/home/user/docs',
  name: 'report',
  ext: '.pdf'
});
// '/home/user/docs/report.pdf'
\`\`\`

---

## 四、路径规范化与相对路径

### 4.1 path.normalize()：规范化路径

处理 \`..\`、\`.\`、多余斜杠：

\`\`\`javascript
path.normalize('/a/b/../c//d/./e');  // '/a/c/d/e'
path.normalize('a//b///c');          // 'a/b/c'
\`\`\`

### 4.2 path.relative()：获取相对路径

计算从 from 到 to 的相对路径：

\`\`\`javascript
path.relative('/a/b/c', '/a/d/e');  // '../../d/e'
path.relative('/data/project', '/data/project/src/index.js'); // 'src/index.js'
\`\`\`

### 4.3 path.isAbsolute()：判断是否绝对路径

\`\`\`javascript
path.isAbsolute('/a/b');    // true（macOS/Linux）
path.isAbsolute('C:\\\\a');  // true（Windows）
path.isAbsolute('a/b');     // false
path.isAbsolute('./a');     // false
\`\`\`

---

## 五、跨平台常量

path 模块提供了平台相关的常量：

| 常量 | macOS/Linux | Windows | 说明 |
|------|-------------|---------|------|
| \`path.sep\` | \`'/'\` | \`'\\\\'\` | 路径分隔符 |
| \`path.delimiter\` | \`':'\` | \`';'\` | PATH 环境变量分隔符 |

\`\`\`javascript
// 拆分 PATH 环境变量（跨平台）
process.env.PATH.split(path.delimiter);

// 拼接路径（跨平台）
const fullPath = ['src', 'utils', 'file.js'].join(path.sep);
\`\`\`

> ⚠️ **注意**：如果你在 Windows 上写代码用 \`'/\`，代码在 Linux 上可能没问题（Node 会做一定兼容），但反过来不一定。最安全的方式是始终用 path 模块处理路径。

---

## 六、ESM 中的路径问题：__dirname 替代方案

在 CommonJS 中我们经常用 \`__dirname\`（当前文件所在目录）和 \`__filename\`（当前文件路径），但 ESM 中这两个变量不存在了！

### 6.1 ESM 中获取等效值

\`\`\`javascript
// ESM 中没有 __dirname/__filename，需要这样获取：
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
\`\`\`

### 6.2 常见模式

\`\`\`javascript
// 读取同目录下的配置文件（CJS 和 ESM 通用写法）
const configPath = path.join(__dirname, 'config.json');
const config = require(configPath); // 或 fs.readFile

// 向上找项目根目录（比如找最近的 package.json）
function findProjectRoot(startDir) {
  let dir = startDir;
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return startDir;
}
\`\`\`

---

## 七、⚠️ 路径遍历安全（再次强调）

结合 fs 模块时，路径安全至关重要！

\`\`\`javascript
// ❌ 危险写法：用户输入可能包含 ../../ 跳出目录
const userFile = req.query.file;
fs.readFile(path.join(USER_DIR, userFile));  // 可能被绕过！

// ✅ 安全写法：resolve 后检查前缀
const safeBase = path.resolve(USER_DIR);
const targetPath = path.resolve(safeBase, userFile);
if (!targetPath.startsWith(safeBase + path.sep)) {
  throw new Error('非法路径访问！');
}
fs.readFile(targetPath);
\`\`\`

> ⚠️ **为什么 join 也危险？** 因为 \`path.join('/a/b', '../c')\` 结果是 \`/a/c\`，还是会跳出目录。必须用 \`path.resolve\` 后检查是否在预期目录内！
`,
    code: `// ============================================
// path 模块全面演示
// ============================================

const path = require('path');
const os = require('os');

console.log('=== path 路径处理模块演示 ===\\n');

// ============ demo 1: path.join vs path.resolve 核心区别 ============
console.log('--- Demo 1: path.join() vs path.resolve() ---');

console.log('当前工作目录 (process.cwd()):', process.cwd());
console.log('');

// join 只是拼接
console.log('path.join() - 片段拼接:');
console.log('  join("/a", "b", "c"):', path.join('/a', 'b', 'c'));
console.log('  join("a", "b", "../c"):', path.join('a', 'b', '../c'));
console.log('  join("a", "./b", "c/"):', path.join('a', './b', 'c/'));
console.log('  join():', JSON.stringify(path.join())); // '.'

console.log('');
// resolve 解析为绝对路径
console.log('path.resolve() - 解析为绝对路径:');
console.log('  resolve("a", "b"):', path.resolve('a', 'b'));
console.log('  resolve("/a", "b", "c"):', path.resolve('/a', 'b', 'c'));
console.log('  resolve("a", "/b", "c"):', path.resolve('a', '/b', 'c'));
console.log('  resolve():', path.resolve()); // 同 process.cwd()

console.log('');
console.log('💡 关键区别总结:');
console.log('  join = 把片段拼起来 + 规范化');
console.log('  resolve = 从右往左拼，直到拼出绝对路径');

// ============ demo 2: basename, dirname, extname ============
console.log('\\n--- Demo 2: 获取路径各部分 ---');

const testPaths = [
  '/home/user/documents/report.pdf',
  'C:\\\\Users\\\\Admin\\\\photo.jpg',
  '../src/utils/helper.ts',
  'noextfile',
  '/path/to/file.with.multiple.dots.txt'
];

testPaths.forEach(p => {
  console.log(\`\\n路径: "\${p}"\`);
  console.log(\`  basename (完整文件名): "\${path.basename(p)}"\`);
  const ext = path.extname(p);
  console.log(\`  extname (扩展名): "\${ext}"\`);
  if (ext) {
    console.log(\`  basename 去扩展名: "\${path.basename(p, ext)}"\`);
  }
  console.log(\`  dirname (目录部分): "\${path.dirname(p)}"\`);
});

// ============ demo 3: parse 和 format ============
console.log('\\n--- Demo 3: parse() 解析路径为对象 ---');

const samplePath = '/Users/dev/my-project/src/app.js';
const parsed = path.parse(samplePath);
console.log('解析路径:', samplePath);
console.log('');
Object.entries(parsed).forEach(([key, value]) => {
  console.log(\`  \${key.padEnd(8)}: "\${value}"\`);
});

console.log('\\nformat() 反向操作 - 从对象还原路径:');
const reconstructed = path.format(parsed);
console.log('  还原结果:', reconstructed);
console.log('  是否一致:', reconstructed === samplePath);

// ============ demo 4: normalize, relative, isAbsolute ============
console.log('\\n--- Demo 4: 规范化与相对路径 ---');

console.log('normalize() 规范化混乱路径:');
const messyPaths = [
  '/a//b///c/d/../e',
  'a/b/./c/../d',
  '/foo/bar/../../baz'
];
messyPaths.forEach(p => {
  console.log(\`  "\${p}" → "\${path.normalize(p)}"\`);
});

console.log('\\nrelative() 计算相对路径:');
const relativeTests = [
  ['/a/b/c', '/a/d/e'],
  ['/data/project', '/data/project/src/index.js'],
  ['/home/user/docs', '/etc/config']
];
relativeTests.forEach(([from, to]) => {
  console.log(\`  from "\${from}"\`);
  console.log(\`    to  "\${to}"\`);
  console.log(\`    →   "\${path.relative(from, to)}"\`);
});

console.log('\\nisAbsolute() 判断是否绝对路径:');
[
  '/usr/local/bin',
  'C:\\\\Windows',
  './relative',
  '../parent',
  'just-a-name'
].forEach(p => {
  console.log(\`  "\${p}" → \${path.isAbsolute(p) ? '✅ 绝对路径' : '❌ 相对路径'}\`);
});

// ============ demo 5: 跨平台常量 ============
console.log('\\n--- Demo 5: 跨平台常量 ---');
console.log('当前平台:', process.platform);
console.log('path.sep (路径分隔符):', JSON.stringify(path.sep));
console.log('path.delimiter (PATH分隔符):', JSON.stringify(path.delimiter));

// 演示 PATH 解析
console.log('\\n解析 PATH 环境变量（前5项）:');
const pathEntries = process.env.PATH.split(path.delimiter).slice(0, 5);
pathEntries.forEach((p, i) => {
  console.log(\`  [\${i}]\`, p);
});

// ============ demo 6: __dirname 与常用路径模式 ============
console.log('\\n--- Demo 6: 常用路径模式 ---');

console.log('__dirname (当前文件目录):', __dirname);
console.log('__filename (当前文件路径):', __filename);

// 常用：拼接同目录下的文件
const siblingFile = path.join(__dirname, 'sibling.txt');
console.log('\\n同目录文件路径:', siblingFile);

// 常用：向上一级
const parentDir = path.join(__dirname, '..');
console.log('上级目录:', path.resolve(parentDir));

// 模拟找项目根目录（找 package.json）
function findProjectRoot(startDir) {
  let dir = startDir;
  const root = path.parse(dir).root;
  while (true) {
    try {
      const pkgPath = path.join(dir, 'package.json');
      if (require('fs').existsSync(pkgPath)) {
        return dir;
      }
      if (dir === root) break;
      dir = path.dirname(dir);
    } catch (e) {
      break;
    }
  }
  return startDir;
}

const projectRoot = findProjectRoot(__dirname);
console.log('\\n项目根目录（含 package.json）:', projectRoot);

// ============ demo 7: 路径遍历安全检查 ============
console.log('\\n--- Demo 7: 路径安全（防止路径遍历攻击）---');

function safePathJoin(baseDir, userInput) {
  const base = path.resolve(baseDir);
  const target = path.resolve(base, userInput);
  // 关键：必须检查 target 在 base 内部！
  if (!target.startsWith(base + path.sep) && target !== base) {
    throw new Error(\`🚫 非法路径尝试: "\${userInput}" (试图访问 \${target})\`);
  }
  return target;
}

const PUBLIC_DIR = path.join(__dirname, 'public');
console.log('安全基目录:', PUBLIC_DIR);

const safeInputs = ['index.html', 'css/style.css', './js/app.js'];
console.log('\\n合法路径测试:');
safeInputs.forEach(input => {
  try {
    const safe = safePathJoin(PUBLIC_DIR, input);
    console.log(\`  ✅ "\${input}" → OK\`);
  } catch (e) {
    console.log(\`  ❌ "\${input}" → \${e.message}\`);
  }
});

const maliciousInputs = [
  '../../etc/passwd',
  '../../../secret.txt',
  '/etc/shadow'
];
console.log('\\n🚨 恶意路径测试（应该全部被拦截）:');
maliciousInputs.forEach(input => {
  try {
    safePathJoin(PUBLIC_DIR, input);
    console.log(\`  ⚠️  "\${input}" → 未拦截！（严重安全问题）\`);
  } catch (e) {
    console.log(\`  🚫 "\${input}" → 已拦截\`);
  }
});

// ============ demo 8: ESM __dirname 模拟 ============
console.log('\\n--- Demo 8: ESM 中获取 __dirname 的方法 ---');
console.log(\`
ESM 中没有内置 __dirname，需要这样写:

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
\`);

// ============ demo 9: 综合练习：路径批处理 ============
console.log('--- Demo 9: 路径批处理实战 ---');

const files = [
  '/project/src/index.js',
  '/project/src/utils/helper.js',
  '/project/src/components/App.jsx',
  '/project/public/favicon.ico',
  '/project/package.json',
  '/project/README.md'
];

console.log('\\n文件路径分析:');
const srcDir = path.join('/project', 'src');
files.forEach(f => {
  const ext = path.extname(f);
  const name = path.basename(f, ext);
  const inSrc = f.startsWith(srcDir + path.sep);
  const type = ext === '.js' || ext === '.jsx' ? '📜 源码' :
               ext === '.json' ? '⚙️  配置' :
               ext === '.md' ? '📖 文档' : '📦 其他';
  console.log(\`  \${type} \${name.padEnd(12)} [\${ext.padEnd(5)}] \${inSrc ? '(src内)' : ''}\`);
});

console.log('\\n✅ path 模块演示完成！');
console.log('💡 path 模块口诀:');
console.log('  1. 拼路径用 join，要绝对路径用 resolve');
console.log('  2. 文件名 basename，目录 dirname，扩展名 extname');
console.log('  3. 永远不要手动字符串拼接路径！');
console.log('  4. 处理用户输入路径必须做安全检查！');
console.log('  5. ESM 中用 fileURLToPath + dirname 获取 __dirname');
`
  },
  {
    id: "n4-os",
    group: "第二部分 核心模块",
    icon: "💻",
    title: "os 模块：获取系统信息",
    content: `# os 模块：获取系统信息

\`os\` 模块是 Node.js 与操作系统交互的桥梁。它能让你获取 CPU、内存、网络、用户、平台等各种系统信息，是开发跨平台工具、系统监控、运维脚本的基础。

---

## 一、为什么需要 os 模块？

在开发中我们经常需要：
- 判断当前运行在什么操作系统（Windows/macOS/Linux）
- 获取 CPU 核心数来决定并发数
- 知道内存够不够，要不要限流
- 获取用户主目录来存放配置文件
- 获取本机 IP 地址
- 找到系统临时目录放临时文件
- 获取系统换行符（跨平台兼容）

> 💡 **类比理解**：os 模块就像是 Node.js 给你的"体检报告"——你能随时了解当前运行环境的健康状况和基本信息，然后根据这些信息做出决策。

---

## 二、平台与架构信息

### 2.1 os.platform()：操作系统平台

返回当前平台标识：

| 返回值 | 系统 |
|--------|------|
| \`'darwin'\` | macOS |
| \`'win32'\` | Windows（64位也是 win32）|
| \`'linux'\` | Linux |
| \`'aix'\` | IBM AIX |
| \`'freebsd'\` | FreeBSD |

\`\`\`javascript
const os = require('os');
const platform = os.platform();

if (platform === 'darwin') {
  console.log('这是 macOS 系统');
} else if (platform === 'win32') {
  console.log('这是 Windows 系统');
} else if (platform === 'linux') {
  console.log('这是 Linux 系统');
}
\`\`\`

### 2.2 其他系统信息

\`\`\`javascript
os.arch();      // CPU 架构: 'x64', 'arm64', 'ia32' 等
os.type();      // 系统类型: 'Darwin', 'Windows_NT', 'Linux'
os.release();   // 内核版本号
os.version();   // 系统版本字符串（更详细）
os.machine();   // 机器类型
os.hostname();  // 主机名
\`\`\`

---

## 三、CPU 信息

### 3.1 os.cpus()：CPU 详情

返回每个逻辑 CPU 核心的信息：

\`\`\`javascript
const cpus = os.cpus();
console.log('CPU 核心数:', cpus.length);

cpus.forEach((cpu, i) => {
  console.log(\`核心 \${i}: \${cpu.model.trim()}\`);
  console.log(\`  速度: \${cpu.speed} MHz\`);
  // times 是 CPU 各状态耗时（毫秒）
  console.log(\`  用户态: \${cpu.times.user}ms\`);
  console.log(\`  系统态: \${cpu.times.sys}ms\`);
  console.log(\`  空闲: \${cpu.times.idle}ms\`);
});
\`\`\`

> 💡 **实用技巧**：\`os.cpus().length\` 是逻辑核心数（包括超线程），这通常是你设置 Worker 池、并发任务数的依据。

### 3.2 简单 CPU 使用率计算

\`\`\`javascript
function getCPUUsage() {
  const cpus1 = os.cpus();
  const start = Date.now();
  
  // 等待 100ms
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
  
  const cpus2 = os.cpus();
  const end = Date.now();
  
  let totalIdle = 0, totalTick = 0;
  for (let i = 0; i < cpus1.length; i++) {
    const c1 = cpus1[i].times;
    const c2 = cpus2[i].times;
    for (const type in c1) {
      totalTick += c2[type] - c1[type];
    }
    totalIdle += c2.idle - c1.idle;
  }
  
  const usage = 1 - totalIdle / totalTick;
  return (usage * 100).toFixed(1) + '%';
}
\`\`\`

---

## 四、内存信息

\`\`\`javascript
os.totalmem();  // 总内存（字节）
os.freemem();   // 空闲内存（字节）

// 转换为 GB 更直观
const totalGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
const freeGB = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
const usedGB = (totalGB - freeGB).toFixed(2);
const usagePercent = ((1 - os.freemem() / os.totalmem()) * 100).toFixed(1);

console.log(\`总内存: \${totalGB} GB\`);
console.log(\`已使用: \${usedGB} GB (\${usagePercent}%)\`);
console.log(\`可用: \${freeGB} GB\`);
\`\`\`

> 💡 **常见用法**：内存不足时拒绝处理大任务，或者打印日志方便排查 OOM 问题。

---

## 五、目录与用户信息

### 5.1 重要目录路径

| 方法 | 用途 | 示例（macOS） |
|------|------|---------------|
| \`os.homedir()\` | 用户主目录 | \`/Users/zhaoliangshun\` |
| \`os.tmpdir()\` | 系统临时目录 | \`/var/folders/.../T\` |

\`\`\`javascript
const os = require('os');
const path = require('path');

// 放用户配置的最佳位置
const configDir = path.join(os.homedir(), '.my-app');
// /Users/zhaoliangshun/.my-app

// 临时文件
const tmpFile = path.join(os.tmpdir(), 'my-app-' + Date.now() + '.tmp');
\`\`\`

> ⚠️ **注意**：临时目录里的文件可能被系统随时清理，重要数据一定要放到持久化位置！

### 5.2 os.userInfo()：当前用户信息

\`\`\`javascript
const user = os.userInfo();
// 返回:
// {
//   uid: 501,           // 用户 ID（Windows 为 -1）
//   gid: 20,            // 组 ID（Windows 为 -1）
//   username: 'zhaoliangshun',
//   homedir: '/Users/zhaoliangshun',
//   shell: '/bin/zsh'   // Windows 为 null
// }
\`\`\`

---

## 六、网络接口信息

\`os.networkInterfaces()\` 是获取本机 IP 地址的标准方法：

\`\`\`javascript
const nets = os.networkInterfaces();
const ips = [];

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // 跳过内部（回环）地址，只取 IPv4
    if (!net.internal && net.family === 'IPv4') {
      ips.push({
        interface: name,
        address: net.address,
        netmask: net.netmask,
        mac: net.mac
      });
    }
  }
}

console.log('本机 IPv4 地址:');
ips.forEach(ip => {
  console.log(\`  \${ip.interface}: \${ip.address} (MAC: \${ip.mac})\`);
});
\`\`\`

典型输出可能是：
- \`lo0\`: 127.0.0.1（回环）
- \`en0\`: 192.168.1.100（Wi-Fi/局域网）
- \`eth0\`: 10.0.0.5（Linux 有线网卡）

---

## 七、跨平台常量：os.EOL

不同操作系统换行符不一样：

| 系统 | 换行符 |
|------|--------|
| macOS/Linux | \`\\n\` (LF) |
| Windows | \`\\r\\n\` (CRLF) |

\`os.EOL\` 会返回当前系统的正确换行符：

\`\`\`javascript
// ❌ 不要硬编码换行符，Windows 上可能出问题
fs.writeFileSync('file.txt', 'line1\\nline2\\n');

// ✅ 用 os.EOL 跨平台兼容
const EOL = os.EOL;
fs.writeFileSync('file.txt', 'line1' + EOL + 'line2' + EOL);
\`\`\`

> ⚠️ **实际开发建议**：大多数情况下（代码文件、JSON、HTTP响应）使用 \`\\n\` 没问题。只有当你生成 Windows 用户要直接用记事本打开的文本文件时，才需要考虑 \`\\r\\n\`。

---

## 八、运行时间与负载

\`\`\`javascript
os.uptime();  // 系统运行时间（秒）
os.loadavg(); // 1/5/15 分钟平均负载（Linux/macOS 有效，Windows 返回 [0,0,0]）
\`\`\`

\`\`\`javascript
// 格式化系统运行时间
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return \`\${days}天 \${hours}小时 \${mins}分钟\`;
}

console.log('系统已运行:', formatUptime(os.uptime()));
const [load1, load5, load15] = os.loadavg();
console.log(\`负载: 1分钟=\${load1.toFixed(2)}, 5分钟=\${load5.toFixed(2)}, 15分钟=\${load15.toFixed(2)}\`);
\`\`\`

> 💡 **loadavg 怎么看？** 负载值除以 CPU 核心数，如果 >1 说明系统繁忙，<1 说明有空闲。

---

## 九、os 模块典型应用场景

1. **跨平台脚本**：根据 platform 执行不同命令
2. **并发控制**：根据 CPU 核心数设置 Worker/线程池大小
3. **系统监控面板**：仪表盘展示 CPU、内存、运行时间
4. **配置文件位置**：homedir() 存放用户配置
5. **临时文件**：tmpdir() 存放临时数据
6. **网络服务**：networkInterfaces() 获取本机 IP 用于监听
7. **日志调试**：记录系统信息方便排查环境问题
`,
    code: `// ============================================
// os 模块系统信息全面演示
// ============================================

const os = require('os');
const path = require('path');

console.log('=== os 模块系统信息演示 ===\\n');

// ============ demo 1: 平台与系统基本信息 ============
console.log('--- Demo 1: 系统基本信息 ---');

const platformMap = {
  darwin: '🍎 macOS',
  win32: '🪟 Windows',
  linux: '🐧 Linux',
  aix: 'IBM AIX',
  freebsd: 'FreeBSD',
  sunos: 'SunOS'
};

console.log('操作系统:', platformMap[os.platform()] || os.platform());
console.log('系统类型:', os.type());
console.log('内核版本:', os.release());
console.log('CPU 架构:', os.arch());
console.log('主机名:', os.hostname());
console.log('主目录:', os.homedir());
console.log('临时目录:', os.tmpdir());

// ============ demo 2: CPU 信息 ============
console.log('\\n--- Demo 2: CPU 信息 ---');

const cpus = os.cpus();
console.log(\`逻辑 CPU 核心数: \${cpus.length}\`);

if (cpus.length > 0) {
  console.log('CPU 型号:', cpus[0].model.trim());
  console.log('主频:', cpus[0].speed, 'MHz');
}

// 计算总体 CPU 时间分配
let totalUser = 0, totalSys = 0, totalIdle = 0, totalIrq = 0;
cpus.forEach(cpu => {
  totalUser += cpu.times.user;
  totalSys += cpu.times.sys;
  totalIdle += cpu.times.idle;
  totalIrq += cpu.times.irq;
});
const totalAll = totalUser + totalSys + totalIdle + totalIrq;

console.log('\\nCPU 累计时间分布（从启动至今）:');
console.log(\`  用户态: \${(totalUser / totalAll * 100).toFixed(1)}%\`);
console.log(\`  系统态: \${(totalSys / totalAll * 100).toFixed(1)}%\`);
console.log(\`  空闲:   \${(totalIdle / totalAll * 100).toFixed(1)}%\`);

// ============ demo 3: 内存信息 ============
console.log('\\n--- Demo 3: 内存信息 ---');

const bytesToGB = (bytes) => (bytes / 1024 / 1024 / 1024).toFixed(2);
const bytesToMB = (bytes) => Math.round(bytes / 1024 / 1024);

const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
const memUsagePercent = (usedMem / totalMem * 100).toFixed(1);

console.log(\`总内存: \${bytesToGB(totalMem)} GB\`);
console.log(\`已使用: \${bytesToGB(usedMem)} GB (\${memUsagePercent}%)\`);
console.log(\`可用:   \${bytesToGB(freeMem)} GB\`);

// 简易内存使用条
const barLength = 30;
const usedBars = Math.round(barLength * usedMem / totalMem);
const freeBars = barLength - usedBars;
const memBar = '█'.repeat(usedBars) + '░'.repeat(freeBars);
console.log(\`[\${memBar}] \${memUsagePercent}%\`);

// ============ demo 4: 当前用户信息 ============
console.log('\\n--- Demo 4: 当前用户信息 ---');

const userInfo = os.userInfo();
console.log('用户名:', userInfo.username);
console.log('用户主目录:', userInfo.homedir);
console.log('用户 Shell:', userInfo.shell || '(Windows 无)');
console.log('UID:', userInfo.uid, 'GID:', userInfo.gid);

// ============ demo 5: 网络接口信息 ============
console.log('\\n--- Demo 5: 网络接口 ---');

const nets = os.networkInterfaces();
const addresses = [];

for (const [iface, addrs] of Object.entries(nets)) {
  for (const addr of addrs) {
    addresses.push({
      iface,
      ...addr
    });
  }
}

// 分类显示
console.log('\\n🌐 IPv4 地址:');
addresses.filter(a => a.family === 'IPv4').forEach(a => {
  const internal = a.internal ? ' (回环/内部)' : '';
  console.log(\`  \${a.iface.padEnd(8)}: \${a.address}\${internal}\`);
});

console.log('\\n📡 MAC 地址:');
const seenMacs = new Set();
addresses.forEach(a => {
  if (a.mac && a.mac !== '00:00:00:00:00:00' && !seenMacs.has(a.mac)) {
    seenMacs.add(a.mac);
    console.log(\`  \${a.iface.padEnd(8)}: \${a.mac}\`);
  }
});

// ============ demo 6: 系统运行时间与负载 ============
console.log('\\n--- Demo 6: 运行时间与负载 ---');

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(\`\${d}天\`);
  if (h > 0) parts.push(\`\${h}小时\`);
  if (m > 0) parts.push(\`\${m}分钟\`);
  parts.push(\`\${s}秒\`);
  return parts.join(' ');
}

console.log('系统已运行:', formatUptime(os.uptime()));
console.log('Node 进程已运行:', formatUptime(process.uptime()));

const [load1, load5, load15] = os.loadavg();
const cpuCount = cpus.length;
console.log('\\n平均负载 (1/5/15分钟):', load1.toFixed(2), '/', load5.toFixed(2), '/', load15.toFixed(2));
if (os.platform() !== 'win32') {
  console.log(\`(每核心负载阈值约为 1.0，当前 \${cpuCount} 核心)\`);
}

// ============ demo 7: 换行符与行尾结束符 ============
console.log('\\n--- Demo 7: os.EOL 跨平台换行符 ---');
console.log('当前平台换行符 (os.EOL):', JSON.stringify(os.EOL));
console.log('');
console.log('不同平台换行符:');
console.log('  macOS/Linux: \\\\n (LF, 0x0A)');
console.log('  Windows:     \\\\r\\\\n (CRLF, 0x0D0A)');
console.log('  老版 Mac:    \\\\r (CR, 已少见)');

// ============ demo 8: 实用场景演示 ============
console.log('\\n--- Demo 8: 典型应用场景 ---');

// 场景1: 根据平台选择命令
function getOpenCommand() {
  const platform = os.platform();
  if (platform === 'darwin') return 'open';
  if (platform === 'win32') return 'start';
  return 'xdg-open'; // linux
}
console.log('打开浏览器/文件命令:', getOpenCommand());

// 场景2: 推荐 Worker 线程数（CPU核心数-1，留一个给主进程）
const recommendedWorkers = Math.max(1, cpus.length - 1);
console.log('推荐 Worker 线程数:', recommendedWorkers, '(CPU核心数-1)');

// 场景3: 应用配置目录
const appConfigDir = path.join(os.homedir(), '.my-node-app');
console.log('用户配置目录建议:', appConfigDir);

// 场景4: 临时文件
const tmpFile = path.join(os.tmpdir(), \`upload-\${Date.now()}-\${Math.random().toString(36).slice(2)}.tmp\`);
console.log('临时文件示例:', tmpFile);

// 场景5: 简易系统状态面板
console.log('\\n--- 系统状态速览 ---');
console.log(\`
┌─────────────────────────────────────┐
│         🖥️  系统信息面板             │
├─────────────────────────────────────┤
│ 平台:     \${platformMap[os.platform()]?.padEnd(22)}│
│ CPU核心:  \${String(cpus.length + ' 核').padEnd(22)}│
│ 内存:     \${bytesToGB(totalMem) + ' GB'.padEnd(22)}│
│ 内存使用: \${(memUsagePercent + '%').padEnd(22)}│
│ 运行时间: \${formatUptime(os.uptime()).padEnd(22)}│
│ 主机名:   \${os.hostname().padEnd(22)}│
│ 用户:     \${userInfo.username.padEnd(22)}│
└─────────────────────────────────────┘
\`);

// ============ demo 9: os.constants 信号与错误码 ============
console.log('--- Demo 9: os.constants ---');
console.log('os.constants 包含信号常量和错误码常量');
console.log('常用信号（用于 process.kill）:');
const signals = ['SIGINT', 'SIGTERM', 'SIGKILL', 'SIGHUP', 'SIGUSR1', 'SIGUSR2'];
signals.forEach(sig => {
  if (os.constants.signals[sig] !== undefined) {
    console.log(\`  \${sig.padEnd(10)} = \${os.constants.signals[sig]}\`);
  }
});

console.log('\\n✅ os 模块演示完成！');
console.log('💡 os 模块常用场景:');
console.log('  1. 跨平台脚本：os.platform() 判断系统');
console.log('  2. 并发优化：os.cpus().length 设置并发数');
console.log('  3. 配置路径：path.join(os.homedir(), ".app")');
console.log('  4. 临时文件：path.join(os.tmpdir(), ...)');
console.log('  5. 网络服务：os.networkInterfaces() 获取 IP');
console.log('  6. 换行符：os.EOL 跨平台兼容');
console.log('  7. 监控面板：内存/CPU/运行时间状态展示');
`
  }
];

