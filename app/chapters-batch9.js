// =============================================================
// Node.js 交互式教程 —— 第九批章节（工程化组，共 6 章）
// =============================================================

export const chapters = [

  {
    id: 'node-npm-scripts',
    group: '工程化',
    icon: '⚡',
    title: 'npm 脚本与生命周期',
    content: `## npm 脚本与生命周期全面指南

npm（Node Package Manager）不仅是包管理工具，更是 Node.js 项目的**任务运行器**和**构建工具核心**。通过 package.json 的 scripts 字段，你可以用统一的命令管理项目的所有开发任务。

### scripts 字段基础

package.json 中的 scripts 字段是一个键值对对象，键是命令名，值是要执行的 shell 命令。定义好的脚本通过 \`npm run <脚本名>\` 执行。

\`\`\`json
{
  "scripts": {
    "start": "node index.js",
    "build": "webpack --mode production",
    "test": "jest --coverage",
    "lint": "eslint src/ --fix"
  }
}
\`\`\`

### 内置生命周期脚本

npm 有一些特殊命名的脚本，它们会在特定事件发生时自动触发：

| 脚本名 | 触发时机 |
| --- | --- |
| **prepublish** | 打包上传前（npm publish 之前） |
| **prepare** | 安装依赖后、打包前（npm install 后 / npm publish 前） |
| **prepublishOnly** | 仅 npm publish 前（不在 npm install 时触发） |
| **prepack** | 打包成 tarball 前 |
| **postpack** | 打包成 tarball 后 |
| **preinstall** | 安装依赖前 |
| **postinstall** | 安装依赖后 |

### pre/post 钩子机制

npm 的强大之处在于 **pre/post 钩子**。任何脚本都可以有对应的 pre 和 post 版本：

\`\`\`json
{
  "scripts": {
    "prebuild": "npm run lint",
    "build": "webpack --mode production",
    "postbuild": "node scripts/copy-assets.js",
    "pretest": "npm run lint",
    "test": "jest",
    "posttest": "node scripts/report.js"
  }
}
\`\`\`

执行 \`npm run build\` 时，npm 会按顺序运行：prebuild → build → postbuild。任何一个步骤失败（非零退出码），后续步骤不会执行。

### npm publish 全流程生命周期

执行 \`npm publish\` 时的完整生命周期顺序：

1. **prepublishOnly** — 发布前检查（运行测试、lint）
2. **prepack** — 打包前准备
3. **prepare** — （如果存在）构建准备
4. **postpack** — 打包后处理
5. **publish** — 上传到 registry
6. **postpublish** — 发布后通知

### 环境变量在脚本中

在 npm scripts 中可以直接使用环境变量。npm 自动注入 \`npm_package_*\` 前缀的变量，可以读取 package.json 中的任何字段：

\`\`\`bash
# 读取 package.json 版本号
echo "版本: $npm_package_version"

# 读取自定义字段
echo "作者: $npm_package_author"
\`\`\`

### npx 使用

\`npx\` 是 npm 5.2+ 内置的命令，用于执行本地或远程的 npm 包：

- \`npx create-react-app my-app\` — 执行远程包（不安装）
- \`npx eslint --fix\` — 优先执行本地 node_modules/.bin/ 中的版本
- \`npx --no-install jest\` — 只执行本地版本，不存在则报错

### 跨平台脚本

不同操作系统的 shell 命令不同（如 Linux 用 \`rm -rf\`，Windows 用 \`rd /s /q\`）。解决方案：

- 使用 **cross-env** 设置环境变量：\`cross-env NODE_ENV=production node server.js\`
- 使用 **rimraf** 代替 \`rm -rf\`：\`rimraf dist\`
- 使用 **shx** 提供跨平台 shell 命令：\`shx cp -r src dist\`

### 常用脚本组合

\`\`\`json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development nodemon index.js",
    "start": "cross-env NODE_ENV=production node index.js",
    "build": "npm run clean && npm run build:js && npm run build:css",
    "clean": "rimraf dist",
    "build:js": "webpack --mode production",
    "build:css": "postcss src/styles.css -o dist/styles.css",
    "test": "jest --coverage --ci",
    "test:watch": "jest --watch",
    "lint": "eslint src/ --ext .js,.ts",
    "lint:fix": "npm run lint -- --fix",
    "format": "prettier --write 'src/**/*.{js,ts,json}'",
    "validate": "npm run lint && npm run test",
    "prepare": "husky install"
  }
}
\`\`\`

\`&&\` 串联执行（前一个成功才执行下一个），\`&\` 并行执行（同时运行）。

下面代码读取和解析 package.json 的 scripts 字段，演示脚本执行和生命周期概念。`,
    code: `// ============================================================
// 第一章代码演示：npm 脚本执行与生命周期模拟
// ============================================================
// 用 fs 读取和解析 package.json 的 scripts 字段，
// 演示脚本执行顺序、pre/post 钩子、环境变量等核心概念。

var fs = require("fs");
var path = require("path");

// ============================================================
// 演示 1：读取并解析 package.json 的 scripts 字段
// ============================================================
console.log("===== 演示 1：读取 package.json scripts =====");

// 模拟一个完整的 package.json
var pkgJson = {
  name: "my-node-app",
  version: "1.2.3",
  author: "张三",
  scripts: {
    start: "cross-env NODE_ENV=production node index.js",
    dev: "cross-env NODE_ENV=development nodemon index.js",
    build: "npm run clean && npm run build:js && npm run build:css",
    clean: "rimraf dist",
    "build:js": "webpack --mode production",
    "build:css": "postcss src/styles.css -o dist/styles.css",
    test: "jest --coverage --ci",
    "test:watch": "jest --watch",
    lint: "eslint src/ --ext .js,.ts",
    "lint:fix": "npm run lint -- --fix",
    format: 'prettier --write "src/**/*.{js,ts,json}"',
    validate: "npm run lint && npm run test",
    prebuild: "npm run lint",
    postbuild: "node scripts/notify.js",
    pretest: "npm run lint",
    prepare: "husky install",
  },
};

// 将模拟的 package.json 写入临时文件
var tmpDir = path.join(require("os").tmpdir(), "npm-scripts-demo-" + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });
var pkgPath = path.join(tmpDir, "package.json");
fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2));

// 读取并解析 scripts
var raw = fs.readFileSync(pkgPath, "utf8");
var parsed = JSON.parse(raw);
var scripts = parsed.scripts;

console.log("项目: " + parsed.name + " v" + parsed.version);
console.log("作者: " + parsed.author);
console.log("\\n可用脚本 (" + Object.keys(scripts).length + " 个):");
console.log("-".repeat(50));

Object.keys(scripts).forEach(function (key) {
  console.log("  " + key.padEnd(20) + " → " + scripts[key]);
});

// 清理临时文件
try { fs.unlinkSync(pkgPath); fs.rmdirSync(tmpDir); } catch (e) {}

// ============================================================
// 演示 2：pre/post 钩子执行顺序模拟
// ============================================================
console.log("\\n===== 演示 2：pre/post 钩子执行顺序 =====");

function ScriptRunner() {
  this.scripts = {};
  this.executionLog = [];
}

ScriptRunner.prototype.register = function (name, fn) {
  this.scripts[name] = fn;
};

ScriptRunner.prototype.run = function (name) {
  var self = this;
  // 检查是否有 pre 钩子
  var preName = "pre" + name;
  if (self.scripts[preName]) {
    console.log("  [生命周期] 执行 pre 钩子: " + preName);
    self.scripts[preName]();
  }

  // 执行主脚本
  console.log("  [生命周期] 执行主脚本: " + name);
  if (self.scripts[name]) {
    var result = self.scripts[name]();
    self.executionLog.push({ script: name, status: "success" });
  } else {
    console.log("    ⚠ 脚本 " + name + " 未定义");
    self.executionLog.push({ script: name, status: "missing" });
  }

  // 检查是否有 post 钩子
  var postName = "post" + name;
  if (self.scripts[postName]) {
    console.log("  [生命周期] 执行 post 钩子: " + postName);
    self.scripts[postName]();
  }
};

// 模拟实际的脚本函数
var runner = new ScriptRunner();

runner.register("prebuild", function () {
  console.log("    → 运行 ESLint 代码检查...");
  console.log("    ✓ 代码检查通过 (0 errors)");
});

runner.register("build", function () {
  console.log("    → 清理旧构建产物...");
  console.log("    → 编译 JavaScript...");
  console.log("    → 编译 CSS...");
  console.log("    ✓ 构建完成");
});

runner.register("postbuild", function () {
  console.log("    → 复制静态资源到 dist/");
  console.log("    → 发送构建通知");
  console.log("    ✓ 后置任务完成");
});

runner.register("pretest", function () {
  console.log("    → 运行代码检查...");
  console.log("    ✓ 检查通过");
});

runner.register("test", function () {
  console.log("    → 运行单元测试 (5 suites, 23 tests)...");
  console.log("    ✓ 23 通过, 0 失败");
});

runner.register("posttest", function () {
  console.log("    → 生成测试覆盖率报告");
  console.log("    ✓ 覆盖率: 92%");
});

console.log("\\n--- 执行 npm run build ---");
runner.run("build");

console.log("\\n--- 执行 npm run test ---");
runner.run("test");

console.log("\\n--- 执行 npm run deploy (无预定义脚本) ---");
runner.run("deploy");

// ============================================================
// 演示 3：npm publish 完整生命周期模拟
// ============================================================
console.log("\\n===== 演示 3：npm publish 生命周期 =====");

function PublishPipeline() {
  this.steps = [];
  this.currentStep = 0;
}

PublishPipeline.prototype.addStep = function (name, fn) {
  this.steps.push({ name: name, fn: fn });
};

PublishPipeline.prototype.execute = function () {
  console.log("npm publish 生命周期流程:");
  for (var i = 0; i < this.steps.length; i++) {
    var step = this.steps[i];
    console.log("  " + (i + 1) + ". " + step.name);
    if (step.fn) {
      var result = step.fn();
      if (result === false) {
        console.log("    ✗ 失败！发布流程终止");
        return false;
      }
    }
  }
  console.log("\\n  ✓ npm publish 完成！");
  return true;
};

var pipeline = new PublishPipeline();

pipeline.addStep("prepublishOnly — 发布前检查", function () {
  console.log("    → 运行测试...");
  console.log("    → 运行 lint...");
  console.log("    ✓ 检查通过");
  return true;
});

pipeline.addStep("prepack — 打包前准备", function () {
  console.log("    → 执行构建...");
  console.log("    ✓ 构建完成");
  return true;
});

pipeline.addStep("prepare — 构建准备", function () {
  console.log("    → 安装 husky 钩子...");
  console.log("    ✓ 已准备");
  return true;
});

pipeline.addStep("postpack — 打包后处理", function () {
  console.log("    → 生成 tarball...");
  console.log("    ✓ 包大小: 45.2 KB");
  return true;
});

pipeline.addStep("publish — 上传到 registry", function () {
  console.log("    → 上传到 https://registry.npmjs.org/");
  console.log("    ✓ 上传成功");
  return true;
});

pipeline.addStep("postpublish — 发布后通知", function () {
  console.log("    → 发送 Slack 通知...");
  console.log("    → 更新 CHANGELOG...");
  console.log("    ✓ 通知完成");
  return true;
});

pipeline.execute();

// ============================================================
// 演示 4：环境变量在脚本中的使用
// ============================================================
console.log("\\n===== 演示 4：环境变量注入 =====");

// npm 自动注入的变量
var npmEnv = {
  npm_package_name: "my-node-app",
  npm_package_version: "1.2.3",
  npm_package_author: "张三",
  npm_package_scripts_build: "webpack --mode production",
  npm_package_scripts_test: "jest --coverage",
  npm_lifecycle_event: "build",
  npm_config_registry: "https://registry.npmjs.org/",
  npm_node_execpath: process.execPath,
  INIT_CWD: "/home/user/projects/my-node-app",
};

console.log("npm 自动注入的环境变量:");
console.log("  npm_package_name       = " + npmEnv.npm_package_name);
console.log("  npm_package_version    = " + npmEnv.npm_package_version);
console.log("  npm_package_author     = " + npmEnv.npm_package_author);
console.log("  npm_lifecycle_event    = " + npmEnv.npm_lifecycle_event);
console.log("  npm_config_registry    = " + npmEnv.npm_config_registry);
console.log("  npm_node_execpath      = " + npmEnv.npm_node_execpath);

console.log("\\n脚本中使用环境变量示例:");
console.log('  echo "当前版本: $npm_package_version"');
console.log('  echo "当前事件: $npm_lifecycle_event"');
console.log('  if [ "$npm_lifecycle_event" = "build" ]; then');
console.log('    echo "正在构建..."');
console.log('  fi');

// ============================================================
// 演示 5：npx 行为模拟
// ============================================================
console.log("\\n===== 演示 5：npx 行为模拟 =====");

function NPX(command) {
  console.log("npx " + command);

  // 模拟本地 node_modules/.bin 查找
  var localBinDir = path.join(process.cwd(), "node_modules", ".bin");
  var parts = command.split(/\s+/);
  var binName = parts[0];
  var args = parts.slice(1).join(" ");

  var localPath = path.join(localBinDir, binName);
  if (fs.existsSync(localPath)) {
    console.log("  → 执行本地版本: " + localPath);
    return { source: "local", path: localPath };
  }

  // 模拟远程下载执行
  console.log("  → 本地未找到，下载并执行远程版本...");
  console.log("  → 临时安装 " + binName + " 到缓存目录");
  return { source: "remote", cached: true };
}

console.log("测试 npx 行为:");
console.log("");

// 模拟有 node_modules/.bin 的情况
var tmpBinDir = path.join(require("os").tmpdir(), "npx-demo", "node_modules", ".bin");
fs.mkdirSync(tmpBinDir, { recursive: true });
fs.writeFileSync(path.join(tmpBinDir, "eslint"), "#!/usr/bin/env node\\n");

// 使用临时目录作为 cwd 来模拟
var originalCwd = process.cwd;
// 此处仅演示概念，直接输出模拟结果
console.log("npx eslint --fix");
console.log("  → 执行本地版本: node_modules/.bin/eslint");

console.log("\\nnpx create-react-app my-app");
console.log("  → 本地未找到 create-react-app");
console.log("  → 下载并执行远程版本...");

console.log("\\nnpx --no-install tsc");
console.log("  → 仅查找本地版本，不存在则报错");

// 清理
try { fs.unlinkSync(path.join(tmpBinDir, "eslint")); } catch (e) {}
try { fs.rmdirSync(tmpBinDir); } catch (e) {}
try { fs.rmdirSync(path.join(require("os").tmpdir(), "npx-demo", "node_modules")); } catch (e) {}
try { fs.rmdirSync(path.join(require("os").tmpdir(), "npx-demo")); } catch (e) {}

// ============================================================
// 演示 6：跨平台脚本兼容性
// ============================================================
console.log("\\n===== 演示 6：跨平台脚本兼容 =====");

var platform = process.platform;
console.log("当前平台: " + platform + " (" + (platform === "win32" ? "Windows" : platform === "darwin" ? "macOS" : "Linux") + ")");

var crossPlatformExamples = {
  "设置环境变量": {
    "Unix": "NODE_ENV=production node index.js",
    "Windows": 'set NODE_ENV=production && node index.js',
    "跨平台方案": 'cross-env NODE_ENV=production node index.js',
  },
  "删除目录": {
    "Unix": "rm -rf dist",
    "Windows": "rd /s /q dist",
    "跨平台方案": "rimraf dist",
  },
  "复制文件": {
    "Unix": "cp -r src/assets dist/assets",
    "Windows": "xcopy /E /I src\\assets dist\\assets",
    "跨平台方案": "shx cp -r src/assets dist/assets",
  },
  "创建目录": {
    "Unix": "mkdir -p dist/css",
    "Windows": "mkdir dist\\css",
    "跨平台方案": "mkdirp dist/css",
  },
};

Object.keys(crossPlatformExamples).forEach(function (task) {
  console.log("\\n" + task + ":");
  var ex = crossPlatformExamples[task];
  console.log("  Unix:      " + ex["Unix"]);
  console.log("  Windows:   " + ex["Windows"]);
  console.log("  推荐方案:  " + ex["跨平台方案"]);
});

// ============================================================
// 演示 7：构建任务组合
// ============================================================
console.log("\\n===== 演示 7：常用脚本组合流程 =====");

function TaskRunner() {
  this.tasks = [];
  this.log = [];
}

TaskRunner.prototype.task = function (name, fn) {
  this.tasks.push({ name: name, fn: fn });
};

TaskRunner.prototype.runAll = function () {
  var self = this;
  console.log("执行构建流水线:");
  self.tasks.forEach(function (t, i) {
    console.log("\\n  [" + (i + 1) + "/" + self.tasks.length + "] " + t.name);
    var start = Date.now();
    t.fn();
    var elapsed = Date.now() - start;
    console.log("  ✓ 完成 (" + elapsed + "ms)");
  });
  console.log("\\n✓ 所有任务完成！");
};

var tasks = new TaskRunner();

tasks.task("代码检查 (lint)", function () {
  console.log("    → ESLint 检查 src/ 目录...");
  console.log("    ✓ 0 errors, 0 warnings");
});

tasks.task("清理旧构建 (clean)", function () {
  console.log("    → 删除 dist/ 目录...");
  console.log("    ✓ 清理完成");
});

tasks.task("编译 JS (build:js)", function () {
  console.log("    → Webpack 打包...");
  console.log("    ✓ main.js (128 KB), vendor.js (356 KB)");
});

tasks.task("编译 CSS (build:css)", function () {
  console.log("    → PostCSS 处理...");
  console.log("    ✓ styles.css (24 KB)");
});

tasks.task("复制静态资源", function () {
  console.log("    → 复制 images/ 到 dist/...");
  console.log("    ✓ 5 个文件已复制");
});

tasks.task("运行测试 (test)", function () {
  console.log("    → 运行 23 个测试用例...");
  console.log("    ✓ 23 通过, 覆盖率 92%");
});

tasks.runAll();

console.log("\\n===== npm 脚本与生命周期演示完成 =====");`,
  },

  {
    id: 'node-semver',
    group: '工程化',
    icon: '📌',
    title: '语义化版本与依赖管理',
    content: `## 语义化版本与依赖管理深入解析

语义化版本（Semantic Versioning，简称 SemVer）是 Node.js 生态中依赖管理的基石。它定义了一套版本号规则，让开发者能够理解版本变更的影响范围。

### SemVer 规范

版本号格式：**MAJOR.MINOR.PATCH**（主版本.次版本.修订版本）

- **MAJOR（主版本号）**：不兼容的 API 修改，升级后可能破坏现有代码
- **MINOR（次版本号）**：向后兼容的功能新增，升级后不会有破坏
- **PATCH（修订版本号）**：向后兼容的 Bug 修复，升级最安全

此外还有预发布版本和构建元数据：

\`\`\`
1.0.0-alpha.1    // 预发布（alpha）
1.0.0-beta.2     // 预发布（beta）
1.0.0-rc.1       // 候选发布（release candidate）
1.0.0+build.2024 // 构建元数据（不影响版本比较）
\`\`\`

### 版本范围语法

在 package.json 的 dependencies 中，版本号前面的符号表示允许的更新范围：

| 符号 | 含义 | 示例 | 匹配范围 |
| --- | --- | --- | --- |
| **^** (caret) | 兼容的更新 | ^1.2.3 | >=1.2.3 <2.0.0 |
| **~** (tilde) | 约等于 | ~1.2.3 | >=1.2.3 <1.3.0 |
| **\*** | 任意版本 | * | 全部 |
| **>=** | 大于等于 | >=1.2.3 | 1.2.3 及以上 |
| **<** | 小于 | <2.0.0 | 2.0.0 以下 |
| **x** | 通配符 | 1.2.x | 1.2.0 到 1.2.999... |
| **||** | 或 | 1.2.3 || 2.0.0 | 两个版本之一 |

**默认行为**：npm install 默认使用 ^ 前缀。这意味着 \`npm install express\` 会写入 \`"express": "^4.18.2"\`，允许自动更新到 4.x 的最新版本。

### npm 包管理命令

| 命令 | 用途 |
| --- | --- |
| **npm install** | 安装所有依赖（读取 package.json） |
| **npm install <pkg>** | 安装并添加到 dependencies |
| **npm install <pkg> --save-dev** | 安装并添加到 devDependencies |
| **npm install <pkg> --save-peer** | 安装并添加到 peerDependencies |
| **npm update** | 更新所有依赖到允许的最新版本 |
| **npm ci** | 清洁安装（严格按 package-lock.json，用于 CI） |
| **npm audit** | 检查依赖中的安全漏洞 |
| **npm audit fix** | 自动修复兼容的安全漏洞 |
| **npm outdated** | 列出需要更新的依赖 |
| **npm uninstall <pkg>** | 卸载依赖 |

### 依赖类型详解

- **dependencies**：生产环境必需的依赖，会被部署到生产环境
- **devDependencies**：仅开发时需要（测试框架、构建工具、lint 工具），\`npm install --production\` 不会安装它们
- **peerDependencies**：宿主环境应提供的依赖（如插件依赖宿主框架），npm 7+ 会自动安装
- **optionalDependencies**：可选依赖，安装失败不影响整体安装
- **bundledDependencies**：打包时包含在 tarball 中的依赖

### 锁定文件

**package-lock.json**（npm）和 **yarn.lock**（yarn）记录了依赖树的精确版本。关键作用：确保团队成员和 CI 环境安装完全相同的依赖版本、锁定间接依赖的版本、加速安装（跳过版本解析）。

### npm 缓存

npm 将下载的包缓存在本地（默认 ~/.npm 目录），下次安装相同版本时直接从缓存读取，大幅提升安装速度。\`npm cache clean --force\` 可清理缓存。

下面代码实现一个完整的 semver 版本解析器，支持版本比较和范围匹配。`,
    code: `// ============================================================
// 第二章代码演示：semver 版本解析器实现
// ============================================================
// 从零实现完整的 semver 版本解析器，支持版本解析、
// 比较、范围匹配（^, ~, >=, <=, || 等）。

// ============================================================
// 演示 1：版本号解析
// ============================================================
console.log("===== 演示 1：版本号解析 =====");

function parseVersion(version) {
  // 分离构建元数据
  var buildIdx = version.indexOf("+");
  var build = buildIdx !== -1 ? version.slice(buildIdx + 1) : "";
  var core = buildIdx !== -1 ? version.slice(0, buildIdx) : version;

  // 分离预发布标识
  var preIdx = core.indexOf("-");
  var preRelease = preIdx !== -1 ? core.slice(preIdx + 1).split(".") : [];
  var main = preIdx !== -1 ? core.slice(0, preIdx) : core;

  var parts = main.split(".");
  return {
    major: parseInt(parts[0]) || 0,
    minor: parseInt(parts[1]) || 0,
    patch: parseInt(parts[2]) || 0,
    preRelease: preRelease,
    build: build,
    raw: version,
  };
}

var testVersions = [
  "1.2.3",
  "2.0.0",
  "0.1.0",
  "1.0.0-alpha.1",
  "1.0.0-beta.2",
  "1.0.0-rc.1",
  "2.1.0+build.2024",
  "1.0.0-alpha.1+build.001",
];

console.log("版本号解析结果:");
console.log("原始版本".padEnd(30) + "主版本".padEnd(10) + "次版本".padEnd(10) + "修订版".padEnd(10) + "预发布");
console.log("-".repeat(80));

testVersions.forEach(function (v) {
  var p = parseVersion(v);
  var pre = p.preRelease.length > 0 ? p.preRelease.join(".") : "—";
  console.log(
    p.raw.padEnd(30) +
    String(p.major).padEnd(10) +
    String(p.minor).padEnd(10) +
    String(p.patch).padEnd(10) +
    pre
  );
});

// ============================================================
// 演示 2：版本比较
// ============================================================
console.log("\\n===== 演示 2：版本比较 =====");

function compareIdentifiers(a, b) {
  // 数字标识符比较数值
  var aNum = /^\\d+\$/.test(a);
  var bNum = /^\\d+\$/.test(b);
  if (aNum && bNum) return parseInt(a) - parseInt(b);
  if (aNum) return -1;  // 数字 < 字符串
  if (bNum) return 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

function comparePreRelease(a, b) {
  if (a.length === 0 && b.length === 0) return 0;
  if (a.length === 0) return 1;   // 无预发布 > 有预发布
  if (b.length === 0) return -1;
  var maxLen = Math.max(a.length, b.length);
  for (var i = 0; i < maxLen; i++) {
    if (i >= a.length) return -1;
    if (i >= b.length) return 1;
    var cmp = compareIdentifiers(a[i], b[i]);
    if (cmp !== 0) return cmp;
  }
  return 0;
}

function compareVersions(v1, v2) {
  var a = parseVersion(v1);
  var b = parseVersion(v2);

  if (a.major !== b.major) return a.major > b.major ? 1 : -1;
  if (a.minor !== b.minor) return a.minor > b.minor ? 1 : -1;
  if (a.patch !== b.patch) return a.patch > b.patch ? 1 : -1;

  return comparePreRelease(a.preRelease, b.preRelease);
}

function gt(v1, v2) { return compareVersions(v1, v2) > 0; }
function gte(v1, v2) { return compareVersions(v1, v2) >= 0; }
function lt(v1, v2) { return compareVersions(v1, v2) < 0; }
function lte(v1, v2) { return compareVersions(v1, v2) <= 0; }
function eq(v1, v2) { return compareVersions(v1, v2) === 0; }

var comparisons = [
  ["1.2.3", "2.0.0"],
  ["1.2.3", "1.2.3"],
  ["1.2.3", "1.2.4"],
  ["1.0.0", "1.0.0-alpha.1"],
  ["1.0.0-beta.2", "1.0.0-beta.1"],
  ["1.0.0-rc.1", "1.0.0-beta.2"],
  ["2.0.0", "1.999.999"],
];

console.log("版本比较结果:");
console.log("版本A".padEnd(20) + "版本B".padEnd(20) + "结果");
console.log("-".repeat(55));

comparisons.forEach(function (pair) {
  var cmp = compareVersions(pair[0], pair[1]);
  var symbol = cmp > 0 ? ">" : cmp < 0 ? "<" : "=";
  console.log(pair[0].padEnd(20) + pair[1].padEnd(20) + pair[0] + " " + symbol + " " + pair[1]);
});

// ============================================================
// 演示 3：版本范围匹配
// ============================================================
console.log("\\n===== 演示 3：版本范围匹配 =====");

function satisfies(version, range) {
  var v = parseVersion(version);
  var r = range.trim();

  // 处理 || 逻辑
  if (r.indexOf("||") !== -1) {
    var orParts = r.split("||");
    for (var i = 0; i < orParts.length; i++) {
      if (satisfies(version, orParts[i].trim())) return true;
    }
    return false;
  }

  // 处理空格分隔的多个条件（AND）
  var parts = r.split(/\s+/);
  for (var j = 0; j < parts.length; j++) {
    if (!satisfiesSingle(version, parts[j])) return false;
  }
  return true;
}

function satisfiesSingle(version, range) {
  var v = parseVersion(version);

  // 精确版本: 1.2.3
  if (/^\\d+\\.\\d+\\.\\d+\$/.test(range)) {
    return eq(version, range);
  }

  // Caret 范围: ^1.2.3
  if (range[0] === "^") {
    var base = parseVersion(range.slice(1));
    var upper = {
      major: base.major === 0 ? (base.minor === 0 ? 0 : base.minor) : base.major + 1,
      minor: base.major === 0 ? (base.minor === 0 ? base.patch + 1 : 0) : 0,
      patch: base.major === 0 ? (base.minor === 0 ? 0 : 0) : 0,
      preRelease: [],
      build: "",
    };
    var upperStr = upper.major + "." + upper.minor + "." + upper.patch;
    return gte(version, range.slice(1)) && lt(version, upperStr);
  }

  // Tilde 范围: ~1.2.3
  if (range[0] === "~") {
    var base = parseVersion(range.slice(1));
    var upperStr = base.major + "." + (base.minor + 1) + ".0";
    return gte(version, range.slice(1)) && lt(version, upperStr);
  }

  // >=, <=, >, <
  var opMatch = range.match(/^(>=|<=|>|<)(.+)/);
  if (opMatch) {
    var op = opMatch[1];
    var target = opMatch[2];
    if (op === ">=") return gte(version, target);
    if (op === "<=") return lte(version, target);
    if (op === ">") return gt(version, target);
    if (op === "<") return lt(version, target);
  }

  // 通配符: 1.x, 1.2.x
  if (range.indexOf("x") !== -1 || range.indexOf("*") !== -1) {
    var parts = range.replace(/\\*/g, "x").split(".");
    return (
      (parts[0] === "x" || parseInt(parts[0]) === v.major) &&
      (parts[1] === "x" || parts[1] === undefined || parseInt(parts[1]) === v.minor) &&
      (parts[2] === "x" || parts[2] === undefined || parseInt(parts[2]) === v.patch)
    );
  }

  return eq(version, range);
}

// 测试各种范围匹配
var testCases = [
  { version: "1.2.3", range: "^1.2.3", expected: true },
  { version: "1.9.9", range: "^1.2.3", expected: true },
  { version: "2.0.0", range: "^1.2.3", expected: false },
  { version: "0.2.3", range: "^0.2.3", expected: true },
  { version: "0.3.0", range: "^0.2.3", expected: false },
  { version: "1.2.3", range: "~1.2.3", expected: true },
  { version: "1.2.9", range: "~1.2.3", expected: true },
  { version: "1.3.0", range: "~1.2.3", expected: false },
  { version: "1.2.3", range: ">=1.2.0", expected: true },
  { version: "1.0.0", range: ">=1.2.0", expected: false },
  { version: "1.5.0", range: ">=1.2.0 <2.0.0", expected: true },
  { version: "2.0.0", range: ">=1.2.0 <2.0.0", expected: false },
  { version: "1.2.0", range: "1.2.0 || 2.0.0", expected: true },
  { version: "2.0.0", range: "1.2.0 || 2.0.0", expected: true },
  { version: "1.5.0", range: "1.2.0 || 2.0.0", expected: false },
  { version: "1.2.5", range: "1.2.x", expected: true },
  { version: "1.3.0", range: "1.2.x", expected: false },
  { version: "1.0.0-alpha.1", range: "^1.0.0", expected: false },
];

console.log("版本范围匹配测试:");
console.log("版本".padEnd(20) + "范围".padEnd(25) + "预期".padEnd(8) + "实际".padEnd(8) + "结果");
console.log("-".repeat(70));

var passed = 0;
var failed = 0;

testCases.forEach(function (tc) {
  var actual = satisfies(tc.version, tc.range);
  var status = actual === tc.expected ? "✓" : "✗";
  if (actual === tc.expected) passed++; else failed++;
  console.log(
    tc.version.padEnd(20) +
    tc.range.padEnd(25) +
    String(tc.expected).padEnd(8) +
    String(actual).padEnd(8) +
    status
  );
});

console.log("\\n测试结果: " + passed + " 通过, " + failed + " 失败");

// ============================================================
// 演示 4：依赖版本解析（模拟 package.json）
// ============================================================
console.log("\\n===== 演示 4：依赖版本解析 =====");

var mockPackageJson = {
  dependencies: {
    express: "^4.18.2",
    lodash: "~4.17.21",
    axios: ">=1.4.0",
    "body-parser": "1.20.2",
    chalk: "^5.3.0",
  },
  devDependencies: {
    jest: "^29.7.0",
    eslint: "~8.50.0",
    prettier: "^3.0.3",
    webpack: "5.x",
  },
  peerDependencies: {
    react: "^18.0.0",
    "react-dom": "^18.0.0",
  },
};

function analyzeDependencies(deps, type) {
  console.log("\\n" + type + ":");
  Object.keys(deps).forEach(function (name) {
    var range = deps[name];
    var meaning = "精确版本";
    if (range[0] === "^") meaning = "兼容更新 (^)";
    else if (range[0] === "~") meaning = "约等于更新 (~)";
    else if (range[0] === ">" || range[0] === "<") meaning = "条件范围";
    else if (range.indexOf("x") !== -1) meaning = "通配符";

    console.log("  " + name.padEnd(20) + range.padEnd(15) + " → " + meaning);
  });
}

analyzeDependencies(mockPackageJson.dependencies, "生产依赖 (dependencies)");
analyzeDependencies(mockPackageJson.devDependencies, "开发依赖 (devDependencies)");
analyzeDependencies(mockPackageJson.peerDependencies, "同伴依赖 (peerDependencies)");

// ============================================================
// 演示 5：npm install 与 ci 的区别
// ============================================================
console.log("\\n===== 演示 5：npm install vs npm ci =====");

console.log("npm install 行为:");
console.log("  → 读取 package.json 中的版本范围");
console.log("  → 解析到满足范围的最新版本");
console.log("  → 更新 package-lock.json");
console.log("  → 安装依赖到 node_modules/");
console.log("  → 适用于开发环境");

console.log("\\nnpm ci 行为:");
console.log("  → 严格按 package-lock.json 安装");
console.log("  → 如果 lock 文件与 package.json 不匹配则报错");
console.log("  → 先删除 node_modules/ 再安装（清洁安装）");
console.log("  → 不修改 package-lock.json");
console.log("  → 适用于 CI/CD 环境");

console.log("\\n关键区别:");
console.log("  特性".padEnd(20) + "npm install".padEnd(20) + "npm ci");
console.log("  " + "-".repeat(60));
console.log("  " + "依赖来源".padEnd(20) + "package.json".padEnd(20) + "package-lock.json");
console.log("  " + "修改lock文件".padEnd(20) + "是".padEnd(20) + "否");
console.log("  " + "安装速度".padEnd(20) + "较慢".padEnd(20) + "更快");
console.log("  " + "确定性".padEnd(20) + "较低".padEnd(20) + "高");
console.log("  " + "使用场景".padEnd(20) + "开发环境".padEnd(20) + "CI/CD");

// ============================================================
// 演示 6：npm audit 安全审计模拟
// ============================================================
console.log("\\n===== 演示 6：npm audit 安全审计 =====");

var mockAuditResults = [
  { package: "lodash", current: "4.17.20", patched: ">=4.17.21", severity: "high", title: "原型污染漏洞", cve: "CVE-2020-8203" },
  { package: "axios", current: "1.2.0", patched: ">=1.4.0", severity: "moderate", title: "SSRF 漏洞", cve: "CVE-2023-26159" },
  { package: "express", current: "4.17.1", patched: ">=4.18.0", severity: "low", title: "拒绝服务", cve: "CVE-2022-24999" },
];

var severityColors = { critical: "🔴", high: "🟠", moderate: "🟡", low: "🟢" };

console.log("npm audit 报告:");
console.log("发现 " + mockAuditResults.length + " 个安全漏洞:");
console.log("");

mockAuditResults.forEach(function (r) {
  console.log("  " + (severityColors[r.severity] || "⚪") + " [" + r.severity.toUpperCase() + "] " + r.package);
  console.log("    当前版本: " + r.current + " → 修复版本: " + r.patched);
  console.log("    描述: " + r.title + " (" + r.cve + ")");
  console.log("");
});

console.log("建议操作:");
console.log("  → npm audit fix        自动修复兼容的漏洞");
console.log("  → npm audit fix --force 强制修复（可能包含破坏性更新）");
console.log("  → 手动更新无法自动修复的依赖");

// ============================================================
// 演示 7：npm 缓存机制
// ============================================================
console.log("\\n===== 演示 7：npm 缓存机制 =====");

var os = require("os");
var npmCacheDir = path.join(os.homedir(), ".npm");

console.log("npm 缓存目录: " + npmCacheDir);
console.log("\\n缓存结构:");
console.log("  ~/.npm/");
console.log("    ├── _cacache/          ← 内容寻址缓存（npm 5+）");
console.log("    │   ├── content-v2/    ← 包内容（按 sha512 哈希存储）");
console.log("    │   └── index-v5/      ← 元数据索引");
console.log("    └── _logs/             ← 安装日志");

console.log("\\n缓存命令:");
console.log("  npm cache ls             列出缓存内容");
console.log("  npm cache verify         验证缓存完整性");
console.log("  npm cache clean --force  清空缓存");
console.log("\\n缓存策略:");
console.log("  → npm install 时先查缓存，命中则直接使用");
console.log("  → 离线安装: npm install --prefer-offline");
console.log("  → 缓存最大保存时间: 默认无限期");

console.log("\\n===== 语义化版本演示完成 =====");`,
  },

  {
    id: 'node-eslint',
    group: '工程化',
    icon: '✨',
    title: '代码规范与格式化',
    content: `## 代码规范与格式化完全指南

代码规范（Linting）和代码格式化（Formatting）是保证项目代码质量和一致性的两大基石。虽然它们有重叠，但职责不同：Linting 关注代码**质量**和**潜在错误**，Formatting 关注代码**风格**一致性。

### ESLint 核心概念

ESLint 是 JavaScript 生态中最流行的静态代码分析工具。它通过**规则**检查代码，每条规则有 3 种严重级别：

- **"off"** 或 **0**：关闭规则
- **"warn"** 或 **1**：警告（不影响退出码）
- **"error"** 或 **2**：错误（非零退出码，CI 中会失败）

ESLint 配置文件（.eslintrc.js / .eslintrc.json / eslint.config.js）的核心字段：

\`\`\`javascript
// .eslintrc.js 配置示例
module.exports = {
  root: true,          // 停止向上查找配置
  env: {               // 运行环境（预定义全局变量）
    browser: true,
    node: true,
    es2022: true,
  },
  extends: [           // 继承配置（优先级从低到高）
    'eslint:recommended',
    'plugin:react/recommended',
  ],
  plugins: ['react', 'import'],  // 插件
  parserOptions: {     // 解析器选项
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {             // 自定义规则（覆盖继承的规则）
    'no-var': 'error',
    'prefer-const': 'error',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'indent': ['error', 2],
    'no-console': 'warn',
  },
  overrides: [         // 针对特定文件的覆盖配置
    {
      files: ['*.test.js'],
      env: { jest: true },
    },
  ],
};
\`\`\`

### Prettier 格式化

Prettier 是"Opinionated Code Formatter"——它强制统一的代码风格，几乎不提供配置选项。这是它的设计哲学：停止争论风格，直接使用 Prettier 的默认配置。

\`\`\`json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always"
}
\`\`\`

### ESLint + Prettier 集成

ESLint 和 Prettier 的职责有重叠（如缩进、引号、分号）。为避免冲突，使用以下配置：

1. **eslint-config-prettier**：关闭 ESLint 中与 Prettier 冲突的规则
2. **eslint-plugin-prettier**：将 Prettier 作为 ESLint 规则运行

\`\`\`javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',  // 必须放最后
  ],
};
\`\`\`

### 常见 ESLint 规则详解

| 规则 | 说明 | 推荐 |
| --- | --- | --- |
| **no-var** | 禁止 var，推荐 let/const | error |
| **prefer-const** | 从不修改的变量应声明为 const | error |
| **no-unused-vars** | 禁止未使用的变量 | warn |
| **no-console** | 生产代码不应有 console.log | warn |
| **eqeqeq** | 强制 === 和 !== | error |
| **no-eval** | 禁止 eval() | error |
| **semi** | 强制分号 | error |
| **quotes** | 强制引号风格 | error |
| **indent** | 强制缩进 | error |
| **camelcase** | 强制驼峰命名 | error |
| **max-len** | 最大行长度 | warn |

### EditorConfig

.editorconfig 是跨编辑器的基础配置，优先级低于 ESLint/Prettier：

\`\`\`
root = true
[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
\`\`\`

### lint-staged 提交前检查

lint-staged 只对 Git 暂存区的文件运行 lint 和格式化，大幅提升提交前检查的速度：

\`\`\`json
{
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
\`\`\`

下面代码实现一个代码风格检查器，检查常见规范问题（缩进、命名、分号、引号、var 使用等）。`,
    code: `// ============================================================
// 第三章代码演示：代码风格检查器实现
// ============================================================
// 实现一个简单的代码风格检查器，检查常见规范问题：
// 缩进、命名、分号、引号、var 使用、console.log 等。

// ============================================================
// 演示 1：代码风格检查器核心实现
// ============================================================
console.log("===== 演示 1：代码风格检查器 =====");

function LintRule(id, severity, message, check) {
  this.id = id;
  this.severity = severity; // "error" | "warn" | "off"
  this.message = message;
  this.check = check;
}

function StyleLinter() {
  this.rules = [];
  this.results = [];
}

StyleLinter.prototype.addRule = function (rule) {
  this.rules.push(rule);
};

StyleLinter.prototype.lint = function (code) {
  var self = this;
  self.results = [];
  var lines = code.split("\\n");

  self.rules.forEach(function (rule) {
    if (rule.severity === "off") return;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var issue = rule.check(line, i + 1, lines);
      if (issue) {
        self.results.push({
          line: i + 1,
          column: issue.column || 0,
          severity: rule.severity,
          ruleId: rule.id,
          message: issue.message || rule.message,
          source: line.trim(),
        });
      }
    }
  });

  return self.results;
};

StyleLinter.prototype.formatResults = function () {
  var errors = this.results.filter(function (r) { return r.severity === "error"; });
  var warnings = this.results.filter(function (r) { return r.severity === "warn"; });

  console.log("\\n检查结果: " + errors.length + " 个错误, " + warnings.length + " 个警告");

  if (this.results.length === 0) {
    console.log("✓ 所有代码规范检查通过！");
    return;
  }

  this.results.forEach(function (r) {
    var icon = r.severity === "error" ? "✗" : "⚠";
    console.log("  " + icon + " 第" + r.line + "行: " + r.message + " [" + r.ruleId + "]");
    console.log("    " + r.source);
  });
};

// 创建检查器实例
var linter = new StyleLinter();

// 规则 1：禁止使用 var
linter.addRule(new LintRule("no-var", "error", "禁止使用 var，请使用 let 或 const", function (line, lineNum) {
  if (/\\bvar\\s+/.test(line)) {
    return { message: "发现 var 声明，请使用 let 或 const 替代" };
  }
  return null;
}));

// 规则 2：强制使用 const（简单判断：let 声明的变量如果没有被重新赋值，应使用 const）
linter.addRule(new LintRule("prefer-const", "warn", "推荐使用 const", function (line, lineNum, lines) {
  if (/\\blet\\s+(\\w+)/.test(line)) {
    var varName = line.match(/\\blet\\s+(\\w+)/)[1];
    var reassigned = false;
    for (var i = lineNum; i < lines.length; i++) {
      if (new RegExp("\\\\b" + varName + "\\\\s*=").test(lines[i]) && !new RegExp("\\\\blet\\\\s+" + varName).test(lines[i])) {
        reassigned = true;
        break;
      }
    }
    if (!reassigned) {
      return { message: "变量 '" + varName + "' 未被重新赋值，建议使用 const" };
    }
  }
  return null;
}));

// 规则 3：检查缩进（2空格）
linter.addRule(new LintRule("indent", "error", "缩进应为 2 个空格", function (line, lineNum) {
  var leading = line.match(/^(\\s*)/)[1];
  // 空行和只有空格的行不检查
  if (line.trim() === "") return null;
  // 检查是否混用了 tab
  if (leading.indexOf("\\t") !== -1) {
    return { message: "发现 Tab 缩进，请使用空格（2个空格）" };
  }
  // 检查缩进是否为2的倍数
  if (leading.length % 2 !== 0) {
    return { message: "缩进应为 2 的倍数，当前: " + leading.length + " 个空格" };
  }
  return null;
}));

// 规则 4：检查分号
linter.addRule(new LintRule("semi", "error", "语句末尾需要分号", function (line, lineNum) {
  var trimmed = line.trim();
  // 跳过空行、注释、块语句
  if (trimmed === "" || trimmed[0] === "/" || trimmed[0] === "*") return null;
  if (trimmed[trimmed.length - 1] === "{" || trimmed[trimmed.length - 1] === "}" || trimmed[trimmed.length - 1] === ":") return null;
  if (trimmed[trimmed.length - 1] === ",") return null;
  if (trimmed[trimmed.length - 1] !== ";") {
    return { message: "语句末尾缺少分号" };
  }
  return null;
}));

// 规则 5：禁止 console.log
linter.addRule(new LintRule("no-console", "warn", "生产代码中应避免 console.log", function (line) {
  if (/console\\.log/.test(line)) {
    return { message: "发现 console.log，生产代码中请移除" };
  }
  return null;
}));

// 规则 6：检查命名规范（驼峰）
linter.addRule(new LintRule("camelcase", "warn", "变量名应使用驼峰命名", function (line) {
  var match = line.match(/\\b(?:let|const|var)\\s+(\\w+)/);
  if (match) {
    var name = match[1];
    if (name.indexOf("_") !== -1 && !/^[A-Z_]+$/.test(name)) {
      return { message: "变量名 '" + name + "' 应为驼峰命名 (camelCase)" };
    }
  }
  return null;
}));

// 规则 7：禁止 eval
linter.addRule(new LintRule("no-eval", "error", "禁止使用 eval()", function (line) {
  if (/\\beval\\s*\\(/.test(line)) {
    return { message: "禁止使用 eval()，存在安全风险" };
  }
  return null;
}));

// 规则 8：检查引号一致性
linter.addRule(new LintRule("quotes", "warn", "字符串应使用单引号", function (line) {
  if (/"[^"]*"/.test(line) && !line.match(/require\\s*\\(/)) {
    return { message: "建议使用单引号而非双引号" };
  }
  return null;
}));

// ============================================================
// 演示 2：测试代码检查
// ============================================================
console.log("\\n--- 测试代码示例 ---");

var testCode = [
  "var name = 'hello'",
  "var oldVersion = 1",
  "  let x = 1",
  'let user_name = "张三"',
  "console.log(user_name)",
  "let y = 2",
  "  y = 3",
  "let z = 3",
  "  let result = x + y + z",
  "  return result",
  "eval('x + y')",
  "  let _temp = 42",
  "  console.log(_temp)",
].join("\\n");

console.log("待检查代码:");
console.log(testCode.split("\\n").map(function (line, i) { return "  " + (i + 1) + ": " + line; }).join("\\n"));

var results = linter.lint(testCode);
linter.formatResults();

// ============================================================
// 演示 3：Prettier 格式化概念模拟
// ============================================================
console.log("\\n===== 演示 2：Prettier 格式化概念 =====");

function PrettierSimulator() {
  this.config = {
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    printWidth: 80,
    trailingComma: "es5",
    bracketSpacing: true,
  };
}

PrettierSimulator.prototype.format = function (code) {
  var c = this.config;
  var lines = code.split("\\n");
  var result = [];

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    // 替换双引号为单引号
    if (c.singleQuote) {
      line = line.replace(/"([^"]*)"/g, function (match, content) {
        if (content.indexOf("'") !== -1) return match; // 包含单引号则不替换
        return "'" + content + "'";
      });
    }

    // 添加分号
    if (c.semi) {
      var trimmed = line.trim();
      if (trimmed && trimmed[trimmed.length - 1] !== ";" &&
          trimmed[trimmed.length - 1] !== "{" &&
          trimmed[trimmed.length - 1] !== "}" &&
          trimmed[trimmed.length - 1] !== ":" &&
          trimmed.indexOf("//") === -1) {
        line = line + ";";
      }
    }

    // 括号间距
    if (c.bracketSpacing) {
      line = line.replace(/\\{([^\\s])/g, "{ $1");
      line = line.replace(/([^\\s])\\}/g, "$1 }");
    }

    result.push(line);
  }
  return result.join("\\n");
};

var prettier = new PrettierSimulator();

var uglyCode = [
  'const obj={name:"张三",age:28}',
  'function add(a,b){return a+b}',
  'let x = "hello world"',
  'if(x){console.log("ok")}',
].join("\\n");

console.log("格式化前:");
console.log(uglyCode);

console.log("\\n格式化后:");
var formatted = prettier.format(uglyCode);
console.log(formatted);

// ============================================================
// 演示 4：ESLint + Prettier 集成配置
// ============================================================
console.log("\\n===== 演示 3：ESLint + Prettier 集成 =====");

console.log("ESLint 和 Prettier 的职责划分:");
console.log("");
console.log("ESLint 负责（代码质量）:");
console.log("  → no-var: 禁止 var");
console.log("  → no-unused-vars: 未使用变量");
console.log("  → no-undef: 未定义变量");
console.log("  → eqeqeq: 强制 === ");
console.log("  → no-eval: 禁止 eval");
console.log("  → no-console: 禁止 console");
console.log("  → prefer-const: 推荐 const");
console.log("");
console.log("Prettier 负责（代码风格）:");
console.log("  → 缩进（2空格 vs 4空格 vs Tab）");
console.log("  → 分号（有 vs 无）");
console.log("  → 引号（单引号 vs 双引号）");
console.log("  → 行宽（80 vs 100 vs 120）");
console.log("  → 尾逗号（有 vs 无）");
console.log("  → 括号间距（{ a } vs {a}）");
console.log("");
console.log("集成方案:");
console.log("  1. eslint-config-prettier 关闭 ESLint 的格式规则");
console.log("  2. eslint-plugin-prettier 将 Prettier 作为 ESLint 规则");
console.log("  3. 在 .eslintrc.js extends 最后加上 'plugin:prettier/recommended'");

// ============================================================
// 演示 5：EditorConfig 生成
// ============================================================
console.log("\\n===== 演示 4：EditorConfig 配置 =====");

var editorConfig = [
  "# EditorConfig 跨编辑器配置",
  "root = true",
  "",
  "[*]",
  "indent_style = space",
  "indent_size = 2",
  "end_of_line = lf",
  "charset = utf-8",
  "trim_trailing_whitespace = true",
  "insert_final_newline = true",
  "",
  "[*.md]",
  "trim_trailing_whitespace = false",
  "",
  "[Makefile]",
  "indent_style = tab",
].join("\\n");

console.log(".editorconfig 内容:");
console.log(editorConfig);

console.log("\\n配置说明:");
console.log("  → indent_style: 缩进风格（space/tab）");
console.log("  → indent_size: 缩进大小");
console.log("  → end_of_line: 换行符（lf/crlf/cr）");
console.log("  → charset: 文件编码");
console.log("  → trim_trailing_whitespace: 删除行尾空白");
console.log("  → insert_final_newline: 文件末尾插入空行");

// ============================================================
// 演示 6：lint-staged 配置
// ============================================================
console.log("\\n===== 演示 5：lint-staged 配置 =====");

var lintStagedConfig = {
  "*.js": ["eslint --fix", "prettier --write"],
  "*.{jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css,scss}": ["prettier --write"],
  "*.{yml,yaml}": ["prettier --write"],
};

console.log("lint-staged 配置（package.json 中）:");
console.log(JSON.stringify(lintStagedConfig, null, 2));

console.log("\\nlint-staged 工作流程:");
console.log("  1. git add 暂存文件");
console.log("  2. git commit 触发 husky pre-commit 钩子");
console.log("  3. lint-staged 只检查暂存区文件");
console.log("  4. 对匹配的文件运行配置的命令");
console.log("  5. 检查通过则提交，失败则阻止提交");

console.log("\\n优点:");
console.log("  → 只检查变更的文件，速度快");
console.log("  → 自动修复格式问题");
console.log("  → 阻止不符合规范的代码进入仓库");

console.log("\\n===== 代码规范与格式化演示完成 =====");`,
  },

  {
    id: 'node-git-hooks',
    group: '工程化',
    icon: '🪝',
    title: 'Git Hooks 与自动化',
    content: `## Git Hooks 与自动化深入解析

Git Hooks 是 Git 提供的**自动化触发机制**，在特定 Git 事件发生时自动执行自定义脚本。结合 Husky、lint-staged 和 commitlint 等工具，可以构建完整的代码质量控制流水线。

### Git Hooks 工作原理

Git 仓库的 \`.git/hooks/\` 目录下存放钩子脚本。默认情况下有 \`.sample\` 后缀的示例文件，去掉 \`.sample\` 后缀即可激活。钩子分为客户端钩子和服务端钩子：

**客户端钩子**（开发者本地触发）：

| 钩子 | 触发时机 | 典型用途 |
| --- | --- | --- |
| **pre-commit** | 提交前，输入 commit message 前 | 代码检查、格式化 |
| **prepare-commit-msg** | 准备 commit message 时 | 自动生成消息模板 |
| **commit-msg** | 输入 commit message 后 | 验证提交信息格式 |
| **post-commit** | 提交完成后 | 通知、日志 |
| **pre-push** | 推送到远程前 | 运行测试、安全检查 |
| **pre-rebase** | rebase 操作前 | 防止危险操作 |

**服务端钩子**（服务器端触发）：

| 钩子 | 触发时机 | 典型用途 |
| --- | --- | --- |
| **pre-receive** | 接收推送前 | 权限检查、CI 触发 |
| **update** | 更新每个分支时 | 分支保护 |
| **post-receive** | 接收推送后 | 部署、通知 |

### Husky 配置

Husky 是 Git Hooks 的管理工具，解决手动维护 \`.git/hooks/\` 的痛点。Husky 将钩子配置存储在项目中，团队成员 \`npm install\` 后自动安装。

\`\`\`bash
# 安装 Husky
npm install husky --save-dev
npx husky install

# 添加 pre-commit 钩子
npx husky add .husky/pre-commit "npm run lint-staged"
npx husky add .husky/commit-msg "npx --no -- commitlint --edit \$1"
npx husky add .husky/pre-push "npm test"
\`\`\`

### lint-staged

lint-staged 只对 Git 暂存区的文件运行检查，避免全量扫描：

\`\`\`json
{
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
\`\`\`

### commitlint 约定式提交

commitlint 强制团队遵循统一的提交信息格式。最常用的是 **Conventional Commits** 规范：

\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

**type 类型**：

| 类型 | 说明 |
| --- | --- |
| **feat** | 新功能 |
| **fix** | Bug 修复 |
| **docs** | 文档变更 |
| **style** | 代码格式（不影响逻辑） |
| **refactor** | 重构 |
| **perf** | 性能优化 |
| **test** | 测试相关 |
| **chore** | 构建/工具变更 |
| **ci** | CI 配置变更 |
| **build** | 构建系统变更 |

示例：\`feat(auth): add JWT token refresh mechanism\`、\`fix(api): resolve race condition in user creation\`。

### 自动化检查流水线

完整的 Git 提交检查流程：

1. **git add** — 暂存变更文件
2. **pre-commit** — lint-staged 运行 ESLint + Prettier
3. **commit-msg** — commitlint 验证提交信息格式
4. **pre-push** — 运行测试套件
5. **CI/CD** — 远程运行完整检查

### CI 中的 Hooks

在 CI/CD 环境中，除了 Git Hooks，还应配置：

- 完整 ESLint 检查（不只是暂存文件）
- 完整测试套件 + 覆盖率
- 安全审计（npm audit）
- 构建验证
- 类型检查（TypeScript）

下面代码模拟完整的 Git Hooks 流程，实现 pre-commit 检查和 commit message 验证。`,
    code: `// ============================================================
// 第四章代码演示：Git Hooks 流程模拟
// ============================================================
// 模拟 Git Hooks 完整流程，实现 pre-commit 检查
// (ESLint + Prettier 风格检查) 和 commit message 验证。

var crypto = require("crypto");

// ============================================================
// 演示 1：Git Hooks 类型与触发时机
// ============================================================
console.log("===== 演示 1：Git Hooks 类型 =====");

var GIT_HOOKS = {
  client: [
    { name: "pre-commit", trigger: "提交前", description: "代码检查、格式化、lint-staged" },
    { name: "prepare-commit-msg", trigger: "准备提交信息时", description: "自动生成 commit message 模板" },
    { name: "commit-msg", trigger: "输入提交信息后", description: "验证提交信息格式（commitlint）" },
    { name: "post-commit", trigger: "提交完成后", description: "通知、日志记录" },
    { name: "pre-push", trigger: "推送到远程前", description: "运行测试、安全检查" },
    { name: "pre-rebase", trigger: "rebase 前", description: "防止危险的 rebase 操作" },
  ],
  server: [
    { name: "pre-receive", trigger: "接收推送前", description: "权限检查、触发 CI" },
    { name: "update", trigger: "更新分支时", description: "分支保护规则" },
    { name: "post-receive", trigger: "接收推送后", description: "自动部署、通知" },
  ],
};

console.log("客户端钩子 (Client-side Hooks):");
console.log("钩子名称".padEnd(25) + "触发时机".padEnd(18) + "典型用途");
console.log("-".repeat(70));
GIT_HOOKS.client.forEach(function (h) {
  console.log(h.name.padEnd(25) + h.trigger.padEnd(18) + h.description);
});

console.log("\\n服务端钩子 (Server-side Hooks):");
GIT_HOOKS.server.forEach(function (h) {
  console.log(h.name.padEnd(25) + h.trigger.padEnd(18) + h.description);
});

// ============================================================
// 演示 2：pre-commit 钩子模拟（代码检查）
// ============================================================
console.log("\\n===== 演示 2：pre-commit 钩子 =====");

function PreCommitChecker() {
  this.checks = [];
  this.results = [];
}

PreCommitChecker.prototype.addCheck = function (name, fn) {
  this.checks.push({ name: name, fn: fn });
};

PreCommitChecker.prototype.run = function (stagedFiles) {
  var self = this;
  self.results = [];
  console.log("[pre-commit] 检查 " + stagedFiles.length + " 个暂存文件...\\n");

  var allPassed = true;
  self.checks.forEach(function (check) {
    var result = check.fn(stagedFiles);
    self.results.push({ check: check.name, passed: result.passed, message: result.message });
    console.log("  " + (result.passed ? "✓" : "✗") + " " + check.name + ": " + result.message);
    if (!result.passed) allPassed = false;
  });

  console.log("\\n[pre-commit] 结果: " + (allPassed ? "✓ 通过，允许提交" : "✗ 失败，提交被阻止"));
  return allPassed;
};

// 模拟暂存文件
var stagedFiles = [
  { name: "src/index.js", content: "var x = 1;\\nconsole.log('hello')\\nlet result = x + 2" },
  { name: "src/utils.js", content: "function add(a,b){return a+b}\\nconst name = 'test'" },
  { name: "src/styles.css", content: ".button {  color: red;  }\\n.text{font-size:14px}" },
];

// 创建 pre-commit 检查器
var preCommit = new PreCommitChecker();

// 检查 1：ESLint 风格检查
preCommit.addCheck("ESLint 检查", function (files) {
  var issues = [];
  files.forEach(function (file) {
    if (!file.name.endsWith(".js")) return;
    var lines = file.content.split("\\n");
    lines.forEach(function (line, i) {
      if (/\\bvar\\s+/.test(line)) {
        issues.push(file.name + ":" + (i + 1) + " — 禁止使用 var");
      }
      if (/console\\.log/.test(line)) {
        issues.push(file.name + ":" + (i + 1) + " — 发现 console.log");
      }
    });
  });

  if (issues.length > 0) {
    return { passed: false, message: "发现 " + issues.length + " 个问题: " + issues.join("; ") };
  }
  return { passed: true, message: "检查通过" };
});

// 检查 2：Prettier 格式检查
preCommit.addCheck("Prettier 格式化", function (files) {
  var issues = [];
  files.forEach(function (file) {
    if (!file.name.endsWith(".js")) return;
    var lines = file.content.split("\\n");
    lines.forEach(function (line, i) {
      // 检查缩进
      if (line.trim() && line.match(/^\\s{4}/) && !line.match(/^\\s{2}[^\\s]/)) {
        issues.push(file.name + ":" + (i + 1) + " — 缩进应为 2 空格");
      }
      // 检查分号
      var trimmed = line.trim();
      if (trimmed && trimmed[trimmed.length - 1] !== ";" &&
          trimmed[trimmed.length - 1] !== "{" &&
          trimmed[trimmed.length - 1] !== "}") {
        issues.push(file.name + ":" + (i + 1) + " — 缺少分号");
      }
    });
  });

  if (issues.length > 0) {
    return { passed: false, message: "格式问题: " + issues.join("; ") };
  }
  return { passed: true, message: "格式正确" };
});

// 检查 3：检查是否有调试代码
preCommit.addCheck("调试代码检查", function (files) {
  var issues = [];
  files.forEach(function (file) {
    if (file.content.indexOf("debugger") !== -1) {
      issues.push(file.name + " — 发现 debugger 语句");
    }
    if (file.content.indexOf("TODO") !== -1) {
      issues.push(file.name + " — 发现 TODO 注释");
    }
  });
  if (issues.length > 0) {
    return { passed: false, message: issues.join("; ") };
  }
  return { passed: true, message: "无调试代码" };
});

// 执行 pre-commit 检查
preCommit.run(stagedFiles);

// ============================================================
// 演示 3：commit-msg 钩子（约定式提交验证）
// ============================================================
console.log("\\n===== 演示 3：commit-msg 钩子 =====");

function CommitMsgValidator() {
  this.rules = [];
}

CommitMsgValidator.prototype.addRule = function (name, fn) {
  this.rules.push({ name: name, fn: fn });
};

CommitMsgValidator.prototype.validate = function (message) {
  var self = this;
  console.log("[commit-msg] 验证提交信息: \\"" + message + "\\"\\n");

  var allPassed = true;
  self.rules.forEach(function (rule) {
    var result = rule.fn(message);
    console.log("  " + (result.passed ? "✓" : "✗") + " " + rule.name + ": " + result.message);
    if (!result.passed) allPassed = false;
  });

  console.log("\\n[commit-msg] 结果: " + (allPassed ? "✓ 格式正确" : "✗ 格式错误"));
  return allPassed;
};

var commitlint = new CommitMsgValidator();

// 规则 1：检查格式 <type>(<scope>): <subject>
commitlint.addRule("格式检查", function (msg) {
  var pattern = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\\(.+\\))?: .+/;
  if (pattern.test(msg)) {
    return { passed: true, message: "格式正确" };
  }
  return {
    passed: false,
    message: "格式应为: <type>(<scope>): <subject>\\n" +
      "    有效 type: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert"
  };
});

// 规则 2：subject 不能为空
commitlint.addRule("主题检查", function (msg) {
  var match = msg.match(/^[^(]+(?:\\([^)]+\\))?: (.+)/);
  if (!match) return { passed: false, message: "无法解析主题" };
  var subject = match[1].trim();
  if (subject.length === 0) {
    return { passed: false, message: "主题（subject）不能为空" };
  }
  if (subject.length > 72) {
    return { passed: false, message: "主题超过 72 字符限制（当前: " + subject.length + "）" };
  }
  return { passed: true, message: "主题: \\"" + subject + "\\" (" + subject.length + " 字符)" };
});

// 规则 3：主题首字母小写
commitlint.addRule("大小写检查", function (msg) {
  var match = msg.match(/^[^(]+(?:\\([^)]+\\))?: (.+)/);
  if (!match) return { passed: false, message: "无法解析主题" };
  var subject = match[1].trim();
  if (subject[0] && subject[0] !== subject[0].toLowerCase()) {
    return { passed: false, message: "主题首字母应为小写" };
  }
  return { passed: true, message: "大小写正确" };
});

// 规则 4：主题不以句号结尾
commitlint.addRule("结尾检查", function (msg) {
  var match = msg.match(/^[^(]+(?:\\([^)]+\\))?: (.+)/);
  if (!match) return { passed: false, message: "无法解析主题" };
  var subject = match[1].trim();
  if (subject[subject.length - 1] === ".") {
    return { passed: false, message: "主题不应以句号结尾" };
  }
  return { passed: true, message: "结尾正确" };
});

// 测试各种提交信息
var testMessages = [
  "feat(auth): add JWT token refresh mechanism",
  "fix: resolve race condition",
  "docs(readme): update installation guide",
  "Add new feature",
  "feat: ",
  "feat: This is a very long commit message that exceeds the maximum allowed length of seventy-two characters",
  "FIX: uppercase first letter",
  "feat: fixed bug.",
];

console.log("测试提交信息:");
testMessages.forEach(function (msg) {
  console.log("\\n--- 测试: \\"" + msg + "\\" ---");
  commitlint.validate(msg);
});

// ============================================================
// 演示 4：pre-push 钩子（运行测试）
// ============================================================
console.log("\\n===== 演示 4：pre-push 钩子 =====");

function PrePushChecker() {
  this.tests = [];
}

PrePushChecker.prototype.addTest = function (name, fn) {
  this.tests.push({ name: name, fn: fn });
};

PrePushChecker.prototype.run = function () {
  console.log("[pre-push] 推送前检查...\\n");

  var passed = 0;
  var failed = 0;
  var results = [];

  this.tests.forEach(function (test) {
    var result = test.fn();
    results.push({ name: test.name, passed: result.passed, message: result.message });
    console.log("  " + (result.passed ? "✓" : "✗") + " " + test.name + ": " + result.message);
    if (result.passed) passed++; else failed++;
  });

  console.log("\\n[pre-push] 测试: " + passed + " 通过, " + failed + " 失败");
  console.log("结果: " + (failed === 0 ? "✓ 允许推送" : "✗ 推送被阻止"));
  return failed === 0;
};

var prePush = new PrePushChecker();

prePush.addTest("单元测试", function () {
  return { passed: true, message: "23 个测试全部通过" };
});

prePush.addTest("集成测试", function () {
  return { passed: true, message: "5 个集成测试通过" };
});

prePush.addTest("安全审计", function () {
  return { passed: true, message: "无高危漏洞" };
});

prePush.addTest("构建验证", function () {
  return { passed: true, message: "构建成功 (128 KB)" };
});

prePush.run();

// ============================================================
// 演示 5：完整 Git 提交流程
// ============================================================
console.log("\\n===== 演示 5：完整提交流程 =====");

function GitWorkflow() {
  this.hooks = {};
  this.log = [];
}

GitWorkflow.prototype.registerHook = function (name, fn) {
  this.hooks[name] = fn;
};

GitWorkflow.prototype.runHook = function (name) {
  if (this.hooks[name]) {
    console.log("\\n[" + name + "] 执行中...");
    return this.hooks[name]();
  }
  return true;
};

GitWorkflow.prototype.commit = function (message) {
  console.log("===== Git 提交流程开始 =====");

  // 模拟暂存文件
  console.log("\\n1. git add — 暂存变更文件");
  var stagedFiles = [
    { name: "src/feature.js", content: "const x = 1;" },
    { name: "test/feature.test.js", content: "test('feature', () => {});" },
  ];
  console.log("   暂存了 " + stagedFiles.length + " 个文件: " + stagedFiles.map(function (f) { return f.name; }).join(", "));

  // pre-commit 钩子
  console.log("\\n2. pre-commit 钩子");
  if (!this.runHook("pre-commit")) {
    console.log("\\n✗ 提交失败: pre-commit 检查未通过");
    return false;
  }

  // commit-msg 钩子
  console.log("\\n3. commit-msg 钩子");
  if (!this.runHook("commit-msg")) {
    console.log("\\n✗ 提交失败: commit message 格式不正确");
    return false;
  }

  // 模拟提交
  console.log("\\n4. git commit — 创建提交");
  var commitHash = crypto.createHash("sha1").update(message + Date.now()).digest("hex").slice(0, 7);
  console.log("   提交成功 [" + commitHash + "] " + message);

  // post-commit 钩子
  console.log("\\n5. post-commit 钩子");
  this.runHook("post-commit");

  console.log("\\n===== 提交流程完成 =====");
  return true;
};

var workflow = new GitWorkflow();

workflow.registerHook("pre-commit", function () {
  console.log("   → lint-staged: ESLint 检查...");
  console.log("   ✓ 0 errors, 0 warnings");
  console.log("   → lint-staged: Prettier 格式化...");
  console.log("   ✓ 格式正确");
  return true;
});

workflow.registerHook("commit-msg", function () {
  var msg = "feat(api): add user authentication endpoint";
  console.log("   → commitlint: 验证提交信息...");
  console.log("   ✓ 格式正确: \\"" + msg + "\\"");
  return true;
});

workflow.registerHook("post-commit", function () {
  console.log("   → 记录提交日志");
  console.log("   → 更新本地变更统计");
  return true;
});

workflow.commit("feat(api): add user authentication endpoint");

// ============================================================
// 演示 6：Husky 配置生成
// ============================================================
console.log("\\n===== 演示 6：Husky 配置 =====");

console.log("Husky 安装与配置流程:");
console.log("");
console.log("  1. npm install husky --save-dev");
console.log("  2. npx husky install");
console.log("  3. 在 package.json 中添加 prepare 脚本:");
console.log('     "prepare": "husky install"');
console.log("");
console.log("  4. 添加 Git Hooks:");
console.log("     npx husky add .husky/pre-commit \\"npx lint-staged\\"");
console.log("     npx husky add .husky/commit-msg \\"npx --no -- commitlint --edit \\$1\\"");
console.log("     npx husky add .husky/pre-push \\"npm test\\"");
console.log("");
console.log(".husky/ 目录结构:");
console.log("  .husky/");
console.log("    ├── _/");
console.log("    │   └── husky.sh          ← 核心脚本");
console.log("    ├── pre-commit             ← pre-commit 钩子");
console.log("    ├── commit-msg             ← commit-msg 钩子");
console.log("    └── pre-push               ← pre-push 钩子");

console.log("\\n\\n===== Git Hooks 演示完成 =====");`,
  },

  {
    id: 'node-docker',
    group: '工程化',
    icon: '🐳',
    title: 'Docker 容器化',
    content: `## Docker 容器化 Node.js 应用

Docker 是一种容器化技术，它将应用及其依赖打包成一个轻量级、可移植的容器，确保在任何环境中都能一致运行。对于 Node.js 应用，Docker 解决了"在我机器上能跑"的问题。

### Docker 核心概念

- **镜像（Image）**：只读模板，包含运行应用所需的一切（代码、运行时、库、环境变量）
- **容器（Container）**：镜像的运行实例，轻量级、隔离的进程
- **Dockerfile**：构建镜像的文本文件，包含一系列指令
- **Docker Compose**：多容器应用编排工具
- **Registry**：镜像仓库（Docker Hub、私有 Registry）

### Dockerfile 编写

Dockerfile 是构建 Node.js 应用镜像的蓝图。关键指令：

\`\`\`dockerfile
# 基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 lock 文件（利用 Docker 缓存层）
COPY package*.json ./

# 安装依赖（仅生产依赖）
RUN npm ci --only=production

# 复制源代码
COPY . .

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodejs -u 1001
USER nodejs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# 启动命令
CMD ["node", "index.js"]
\`\`\`

### 多阶段构建

多阶段构建将构建环境和运行环境分离，大幅减小最终镜像体积：

\`\`\`dockerfile
# 第一阶段：构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 第二阶段：运行
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
USER node
CMD ["node", "dist/index.js"]
\`\`\`

### .dockerignore

类似 .gitignore，排除不需要的文件，减少构建上下文大小：

\`\`\`
node_modules
npm-debug.log
.git
.gitignore
.env
.DS_Store
coverage
dist
README.md
\`\`\`

### Docker Compose

用于管理多容器应用（如 Node.js + Redis + PostgreSQL）：

\`\`\`yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:pass@db:5432/mydb
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
\`\`\`

### Node.js 容器最佳实践

- **非 root 用户**：创建专用用户运行应用，避免安全风险
- **健康检查**：HEALTHCHECK 指令让 Docker 监控应用状态
- **信号处理**：正确处理 SIGTERM 和 SIGINT，实现优雅关闭
- **镜像优化**：使用 Alpine 版本（~50MB vs ~900MB）、多阶段构建、精简依赖
- **日志管理**：输出到 stdout/stderr，由 Docker 日志驱动收集
- **环境变量**：通过环境变量配置，不要硬编码

下面代码用 fs 模拟 Dockerfile 生成和镜像构建概念，演示多阶段构建流程。`,
    code: `// ============================================================
// 第五章代码演示：Docker 容器化概念模拟
// ============================================================
// 用 fs 模拟 Dockerfile 生成、镜像构建和多阶段构建流程。

var fs = require("fs");
var path = require("path");
var os = require("os");

// ============================================================
// 演示 1：Dockerfile 生成器
// ============================================================
console.log("===== 演示 1：Dockerfile 生成器 =====");

function DockerfileGenerator() {
  this.lines = [];
}

DockerfileGenerator.prototype.from = function (image, alias) {
  var line = "FROM " + image;
  if (alias) line += " AS " + alias;
  this.lines.push(line);
  return this;
};

DockerfileGenerator.prototype.workdir = function (dir) {
  this.lines.push("WORKDIR " + dir);
  return this;
};

DockerfileGenerator.prototype.copy = function (src, dest) {
  this.lines.push("COPY " + src + " " + dest);
  return this;
};

DockerfileGenerator.prototype.run = function (cmd) {
  this.lines.push("RUN " + cmd);
  return this;
};

DockerfileGenerator.prototype.expose = function (port) {
  this.lines.push("EXPOSE " + port);
  return this;
};

DockerfileGenerator.prototype.env = function (key, value) {
  this.lines.push("ENV " + key + "=" + value);
  return this;
};

DockerfileGenerator.prototype.user = function (user) {
  this.lines.push("USER " + user);
  return this;
};

DockerfileGenerator.prototype.cmd = function (cmd) {
  if (Array.isArray(cmd)) {
    this.lines.push("CMD [" + cmd.map(function (c) { return '"' + c + '"'; }).join(", ") + "]");
  } else {
    this.lines.push("CMD " + cmd);
  }
  return this;
};

DockerfileGenerator.prototype.healthcheck = function (options, cmd) {
  var opts = options || {};
  var flags = [];
  if (opts.interval) flags.push("--interval=" + opts.interval);
  if (opts.timeout) flags.push("--timeout=" + opts.timeout);
  if (opts.startPeriod) flags.push("--start-period=" + opts.startPeriod);
  if (opts.retries) flags.push("--retries=" + opts.retries);
  this.lines.push("HEALTHCHECK " + flags.join(" ") + " \\\\");
  this.lines.push("  CMD " + cmd);
  return this;
};

DockerfileGenerator.prototype.label = function (key, value) {
  this.lines.push("LABEL " + key + '="' + value + '"');
  return this;
};

DockerfileGenerator.prototype.comment = function (text) {
  this.lines.push("# " + text);
  return this;
};

DockerfileGenerator.prototype.build = function () {
  return this.lines.join("\\n");
};

// 生成生产级 Dockerfile
var dockerfile = new DockerfileGenerator();

dockerfile
  .comment("===== Node.js 生产环境 Dockerfile =====")
  .comment("多阶段构建: 第一阶段构建，第二阶段运行")
  .comment("")
  .comment("--- 第一阶段: 构建阶段 ---")
  .from("node:20-alpine", "builder")
  .workdir("/app")
  .copy("package*.json", "./")
  .run("npm ci")
  .copy(".", ".")
  .run("npm run build")
  .comment("")
  .comment("--- 第二阶段: 运行阶段 ---")
  .from("node:20-alpine", "production")
  .workdir("/app")
  .env("NODE_ENV", "production")
  .copy("--from=builder /app/dist", "./dist")
  .copy("--from=builder /app/node_modules", "./node_modules")
  .copy("--from=builder /app/package*.json", "./")
  .comment("创建非 root 用户")
  .run("addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs")
  .user("nodejs")
  .expose("3000")
  .healthcheck(
    { interval: "30s", timeout: "3s", startPeriod: "5s", retries: "3" },
    "wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1"
  )
  .label("maintainer", "dev-team@example.com")
  .label("version", "1.0.0")
  .cmd(["node", "dist/index.js"]);

var generatedDockerfile = dockerfile.build();
console.log(generatedDockerfile);

// 写入临时文件
var tmpDir = path.join(os.tmpdir(), "docker-demo-" + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });
var dockerfilePath = path.join(tmpDir, "Dockerfile");
fs.writeFileSync(dockerfilePath, generatedDockerfile);
console.log("\\nDockerfile 已生成: " + dockerfilePath);

// ============================================================
// 演示 2：.dockerignore 生成
// ============================================================
console.log("\\n===== 演示 2：.dockerignore 生成 =====");

var dockerignore = [
  "# 依赖目录",
  "node_modules",
  "",
  "# 日志",
  "npm-debug.log*",
  "yarn-debug.log*",
  "yarn-error.log*",
  "",
  "# Git",
  ".git",
  ".gitignore",
  ".gitattributes",
  "",
  "# 环境变量",
  ".env",
  ".env.local",
  ".env.*.local",
  "",
  "# 系统文件",
  ".DS_Store",
  "Thumbs.db",
  "",
  "# 构建产物",
  "dist",
  "build",
  "coverage",
  ".nyc_output",
  "",
  "# IDE",
  ".vscode",
  ".idea",
  "*.swp",
  "*.swo",
  "",
  "# 文档",
  "README.md",
  "CHANGELOG.md",
  "LICENSE",
  "",
  "# 测试",
  "test",
  "tests",
  "__tests__",
  "*.test.js",
  "*.spec.js",
].join("\\n");

var dockerignorePath = path.join(tmpDir, ".dockerignore");
fs.writeFileSync(dockerignorePath, dockerignore);
console.log(dockerignore);
console.log("\\n.dockerignore 已生成: " + dockerignorePath);

// ============================================================
// 演示 3：镜像构建流程模拟
// ============================================================
console.log("\\n===== 演示 3：镜像构建流程模拟 =====");

function ImageBuilder(dockerfileContent) {
  this.steps = dockerfileContent.split("\\n").filter(function (line) {
    return line.trim() && !line.trim().startsWith("#");
  });
  this.layers = [];
  this.totalSize = 0;
}

ImageBuilder.prototype.build = function () {
  var self = this;
  console.log("开始构建 Docker 镜像...\\n");

  var stepNum = 0;
  self.steps.forEach(function (step) {
    stepNum++;
    var parts = step.split(/\s+/);
    var instruction = parts[0];
    var args = parts.slice(1).join(" ");

    console.log("Step " + stepNum + "/" + self.steps.length + " : " + instruction + " " + args);

    // 模拟各指令的行为
    switch (instruction) {
      case "FROM":
        var image = args.replace(" AS " + args.split(" AS ")[1] || "", "").trim();
        var size = image.indexOf("alpine") !== -1 ? 50 : 900;
        self.layers.push({ instruction: "FROM", detail: image, size: size });
        self.totalSize += size;
        console.log("  → 拉取基础镜像: " + image + " (" + size + " MB)");
        break;

      case "WORKDIR":
        console.log("  → 设置工作目录: " + args);
        break;

      case "COPY":
        self.layers.push({ instruction: "COPY", detail: args, size: 5 });
        self.totalSize += 5;
        console.log("  → 复制文件: " + args + " (+5 MB)");
        break;

      case "RUN":
        self.layers.push({ instruction: "RUN", detail: args.slice(0, 40) + "...", size: 15 });
        self.totalSize += 15;
        console.log("  → 执行命令: " + args.slice(0, 50) + "... (+15 MB)");
        break;

      case "ENV":
        console.log("  → 设置环境变量: " + args);
        break;

      case "EXPOSE":
        console.log("  → 暴露端口: " + args);
        break;

      case "USER":
        console.log("  → 切换用户: " + args);
        break;

      case "HEALTHCHECK":
        console.log("  → 设置健康检查");
        break;

      case "CMD":
        console.log("  → 设置启动命令: " + args);
        break;

      case "LABEL":
        console.log("  → 添加标签: " + args);
        break;

      default:
        console.log("  → 执行: " + instruction);
    }
  });

  console.log("\\n镜像构建完成！");
  console.log("镜像层数: " + self.layers.length);
  console.log("镜像大小: " + self.totalSize + " MB");
};

var builder = new ImageBuilder(generatedDockerfile);
builder.build();

// ============================================================
// 演示 4：多阶段构建对比
// ============================================================
console.log("\\n===== 演示 4：多阶段构建 vs 单阶段构建 =====");

var comparison = {
  singleStage: {
    description: "单阶段构建（所有内容在一个镜像中）",
    dockerfile: [
      "FROM node:20",
      "WORKDIR /app",
      "COPY . .",
      "RUN npm ci",
      "RUN npm run build",
      'CMD ["node", "dist/index.js"]',
    ],
    layers: [
      { name: "基础镜像", size: 900 },
      { name: "源代码", size: 5 },
      { name: "node_modules (含 devDeps)", size: 350 },
      { name: "构建产物", size: 8 },
      { name: "构建工具残留", size: 120 },
    ],
    totalSize: 1383,
    problems: [
      "包含 devDependencies（jest, eslint, webpack 等）",
      "包含源代码和构建工具",
      "镜像体积大，部署慢",
      "攻击面大（更多不必要的包）",
    ],
  },
  multiStage: {
    description: "多阶段构建（构建和运行分离）",
    dockerfile: [
      "FROM node:20-alpine AS builder",
      "WORKDIR /app",
      "COPY package*.json ./",
      "RUN npm ci",
      "COPY . .",
      "RUN npm run build",
      "",
      "FROM node:20-alpine",
      "WORKDIR /app",
      "COPY --from=builder /app/dist ./dist",
      "COPY --from=builder /app/node_modules ./node_modules",
      "COPY --from=builder /app/package*.json ./",
      'CMD ["node", "dist/index.js"]',
    ],
    layers: [
      { name: "Alpine 基础镜像", size: 50 },
      { name: "生产 node_modules", size: 45 },
      { name: "构建产物 (dist)", size: 8 },
    ],
    totalSize: 103,
    advantages: [
      "仅包含生产依赖",
      "不包含源代码和构建工具",
      "使用 Alpine 基础镜像（~50MB）",
      "镜像体积小，部署快",
      "安全性高（攻击面小）",
    ],
  },
};

console.log("单阶段构建:");
console.log("  镜像大小: " + comparison.singleStage.totalSize + " MB");
console.log("  层详情:");
comparison.singleStage.layers.forEach(function (l) {
  console.log("    " + l.name.padEnd(30) + l.size + " MB");
});
console.log("  问题:");
comparison.singleStage.problems.forEach(function (p) {
  console.log("    ✗ " + p);
});

console.log("\\n多阶段构建:");
console.log("  镜像大小: " + comparison.multiStage.totalSize + " MB");
console.log("  层详情:");
comparison.multiStage.layers.forEach(function (l) {
  console.log("    " + l.name.padEnd(30) + l.size + " MB");
});
console.log("  优势:");
comparison.multiStage.advantages.forEach(function (a) {
  console.log("    ✓ " + a);
});

console.log("\\n体积对比: " + comparison.singleStage.totalSize + " MB → " + comparison.multiStage.totalSize + " MB");
console.log("减少了: " + Math.round((1 - comparison.multiStage.totalSize / comparison.singleStage.totalSize) * 100) + "%");

// ============================================================
// 演示 5：Docker Compose 配置生成
// ============================================================
console.log("\\n===== 演示 5：Docker Compose 配置 =====");

function ComposeGenerator() {
  this.services = {};
  this.volumes = {};
  this.networks = {};
}

ComposeGenerator.prototype.addService = function (name, config) {
  this.services[name] = config;
  return this;
};

ComposeGenerator.prototype.build = function () {
  var lines = ['version: "3.8"', "", "services:"];
  var self = this;

  Object.keys(self.services).forEach(function (name) {
    lines.push("  " + name + ":");
    var svc = self.services[name];
    if (svc.build) lines.push("    build: " + svc.build);
    if (svc.image) lines.push("    image: " + svc.image);
    if (svc.ports) {
      lines.push("    ports:");
      svc.ports.forEach(function (p) { lines.push('      - "' + p + '"'); });
    }
    if (svc.environment) {
      lines.push("    environment:");
      Object.keys(svc.environment).forEach(function (k) {
        lines.push("      - " + k + "=" + svc.environment[k]);
      });
    }
    if (svc.depends_on) {
      lines.push("    depends_on:");
      svc.depends_on.forEach(function (d) { lines.push("      - " + d); });
    }
    if (svc.volumes) {
      lines.push("    volumes:");
      svc.volumes.forEach(function (v) { lines.push('      - "' + v + '"'); });
    }
    if (svc.restart) lines.push("    restart: " + svc.restart);
    if (svc.healthcheck) {
      lines.push("    healthcheck:");
      lines.push("      test: " + JSON.stringify(svc.healthcheck.test));
      lines.push("      interval: " + svc.healthcheck.interval);
      lines.push("      timeout: " + svc.healthcheck.timeout);
      lines.push("      retries: " + svc.healthcheck.retries);
    }
    lines.push("");
  });

  if (Object.keys(self.volumes).length > 0) {
    lines.push("volumes:");
    Object.keys(self.volumes).forEach(function (v) {
      lines.push("  " + v + ":");
    });
  }

  return lines.join("\\n");
};

var compose = new ComposeGenerator();

compose
  .addService("app", {
    build: ".",
    ports: ["3000:3000"],
    environment: {
      NODE_ENV: "production",
      DATABASE_URL: "postgres://user:password@db:5432/myapp",
      REDIS_URL: "redis://redis:6379",
    },
    depends_on: ["db", "redis"],
    restart: "unless-stopped",
    healthcheck: {
      test: ["CMD", "wget", "--spider", "http://localhost:3000/health"],
      interval: "30s",
      timeout: "3s",
      retries: 3,
    },
  })
  .addService("db", {
    image: "postgres:16-alpine",
    ports: ["5432:5432"],
    environment: {
      POSTGRES_USER: "user",
      POSTGRES_PASSWORD: "password",
      POSTGRES_DB: "myapp",
    },
    volumes: ["pgdata:/var/lib/postgresql/data"],
    restart: "unless-stopped",
  })
  .addService("redis", {
    image: "redis:7-alpine",
    ports: ["6379:6379"],
    volumes: ["redisdata:/data"],
    restart: "unless-stopped",
  });

compose.volumes = { pgdata: {}, redisdata: {} };

var composeYml = compose.build();
console.log(composeYml);

var composePath = path.join(tmpDir, "docker-compose.yml");
fs.writeFileSync(composePath, composeYml);
console.log("docker-compose.yml 已生成: " + composePath);

// ============================================================
// 演示 6：Node.js 容器最佳实践
// ============================================================
console.log("\\n===== 演示 6：Node.js 容器最佳实践 =====");

var bestPractices = [
  {
    title: "使用非 root 用户",
    description: "默认容器以 root 运行，攻击者获得 root 权限可危害宿主机",
    dockerfile: "RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs\\nUSER nodejs",
  },
  {
    title: "健康检查",
    description: "让 Docker 知道应用是否正常运行，自动重启异常容器",
    dockerfile: "HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\\\\\n  CMD wget --spider http://localhost:3000/health || exit 1",
  },
  {
    title: "正确处理信号",
    description: "Node.js 应用应监听 SIGTERM/SIGINT，实现优雅关闭",
    code: "process.on('SIGTERM', () => { server.close(() => process.exit(0)); });",
  },
  {
    title: "使用 Alpine 镜像",
    description: "Alpine Linux 极小（~5MB），安全且减少攻击面",
    comparison: "node:20 (~900MB) vs node:20-alpine (~50MB) vs node:20-slim (~200MB)",
  },
  {
    title: "日志输出到 stdout/stderr",
    description: "Docker 日志驱动从 stdout/stderr 收集日志，不要写文件",
    code: "使用 console.log / console.error 而不是 fs.writeFile('app.log')",
  },
  {
    title: "环境变量配置",
    description: "通过环境变量配置应用，不要硬编码，支持不同环境",
    code: "const PORT = process.env.PORT || 3000;",
  },
  {
    title: "利用 Docker 层缓存",
    description: "先 COPY package.json，再 RUN npm ci，最后 COPY 源代码",
    explain: "package.json 不变时，npm ci 层会被缓存，大幅加速构建",
  },
];

bestPractices.forEach(function (bp, i) {
  console.log("\\n" + (i + 1) + ". " + bp.title);
  console.log("   " + bp.description);
  if (bp.dockerfile) console.log("   Dockerfile: " + bp.dockerfile.replace(/\\n/g, "\\n   "));
  if (bp.code) console.log("   代码: " + bp.code);
  if (bp.comparison) console.log("   对比: " + bp.comparison);
  if (bp.explain) console.log("   原理: " + bp.explain);
});

// 清理临时文件
try {
  fs.unlinkSync(dockerfilePath);
  fs.unlinkSync(dockerignorePath);
  fs.unlinkSync(composePath);
  fs.rmdirSync(tmpDir);
} catch (e) {}

console.log("\\n\\n===== Docker 容器化演示完成 =====");`,
  },

  {
    id: 'node-pm2',
    group: '工程化',
    icon: '🔧',
    title: 'PM2 进程管理',
    content: `## PM2 进程管理深入解析

PM2（Process Manager 2）是 Node.js 应用最流行的**生产级进程管理器**。它不仅守护进程不崩溃，还提供负载均衡、日志管理、零停机重载、监控等企业级功能。

### PM2 核心功能

| 功能 | 说明 |
| --- | --- |
| **进程守护** | 应用崩溃自动重启，确保 7x24 运行 |
| **集群模式** | 利用多核 CPU，负载均衡分发请求 |
| **日志管理** | 自动收集 stdout/stderr，支持日志轮转 |
| **零停机重载** | reload 逐个重启进程，不中断服务 |
| **监控面板** | 终端实时监控 CPU、内存、请求量 |
| **开机自启** | 系统重启后自动恢复进程 |
| **部署** | 内置部署系统（pm2 deploy） |

### 安装与基本使用

\`\`\`bash
# 全局安装
npm install pm2 -g

# 启动应用
pm2 start index.js --name "my-app"

# 查看进程列表
pm2 list

# 查看日志
pm2 logs

# 查看监控
pm2 monit

# 重启
pm2 restart my-app

# 停止
pm2 stop my-app

# 删除
pm2 delete my-app

# 保存当前进程列表（重启后恢复）
pm2 save
pm2 startup
\`\`\`

### ecosystem.config.js 配置

PM2 的配置文件（ecosystem.config.js）是生产部署的核心，它定义了所有需要管理的进程：

\`\`\`javascript
module.exports = {
  apps: [{
    name: 'my-app',
    script: './dist/index.js',
    instances: 'max',           // 使用所有 CPU 核心
    exec_mode: 'cluster',       // 集群模式
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080,
    },
    max_memory_restart: '500M', // 内存超限自动重启
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    kill_timeout: 5000,         // 优雅关闭超时
    listen_timeout: 3000,
  }],
};
\`\`\`

### 进程模式

- **fork 模式**：单进程，适合单核场景或开发环境
- **cluster 模式**：利用 Node.js cluster 模块，fork 多个工作进程，共享同一端口，PM2 自动负载均衡

### 日志管理

PM2 自动捕获 stdout 和 stderr，支持：
- 日志文件按应用分开存储
- 日志轮转（pm2-logrotate 插件）：按大小或时间自动分割
- 日志合并（merge_logs）：集群模式下合并所有进程日志
- 日志时间戳格式化

### 零停机重载（Zero-downtime Reload）

\`pm2 reload\` 实现零停机重启：逐个重启工作进程，任何时候至少有一个进程在运行。流程：启动新进程 → 等待新进程 ready → 关闭旧进程 → 重复直到所有进程更新。

### 监控面板

\`pm2 monit\` 和 PM2 Plus（Web 界面）提供实时监控：CPU 使用率、内存使用、堆内存、事件循环延迟、HTTP 请求速率、进程状态。

### 进程守护

PM2 自动检测进程崩溃并重启，支持配置：max_restarts（最大重启次数）、min_uptime（最小运行时间，低于此时间视为异常）、max_memory_restart（内存超限重启）。

下面代码用 fs 模拟 PM2 配置文件和进程管理，演示进程状态监控和日志轮转。`,
    code: `// ============================================================
// 第六章代码演示：PM2 进程管理模拟
// ============================================================
// 用 fs 模拟 PM2 配置文件和进程管理，演示进程状态
// 监控、日志轮转、零停机重载、集群模式等核心概念。

var fs = require("fs");
var path = require("path");
var os = require("os");
var EventEmitter = require("events").EventEmitter;

// ============================================================
// 演示 1：ecosystem.config.js 生成
// ============================================================
console.log("===== 演示 1：ecosystem.config.js 生成 =====");

function EcosystemGenerator() {
  this.apps = [];
}

EcosystemGenerator.prototype.addApp = function (config) {
  this.apps.push(config);
  return this;
};

EcosystemGenerator.prototype.build = function () {
  // 生成 PM2 生态配置文件内容
  var lines = ["module.exports = {"];
  lines.push("  apps: [");

  this.apps.forEach(function (app, index) {
    lines.push("    {");
    lines.push('      name: "' + (app.name || "app") + '",');
    lines.push('      script: "' + (app.script || "./index.js") + '",');
    if (app.instances !== undefined) lines.push("      instances: " + (app.instances === "max" ? '"max"' : app.instances) + ",");
    if (app.execMode) lines.push('      exec_mode: "' + app.execMode + '",');
    if (app.env) {
      lines.push("      env: {");
      Object.keys(app.env).forEach(function (key) {
        lines.push('        ' + key + ': "' + app.env[key] + '",');
      });
      lines.push("      },");
    }
    if (app.envProduction) {
      lines.push("      env_production: {");
      Object.keys(app.envProduction).forEach(function (key) {
        lines.push('        ' + key + ': "' + app.envProduction[key] + '",');
      });
      lines.push("      },");
    }
    if (app.maxMemoryRestart) lines.push('      max_memory_restart: "' + app.maxMemoryRestart + '",');
    if (app.errorFile) lines.push('      error_file: "' + app.errorFile + '",');
    if (app.outFile) lines.push('      out_file: "' + app.outFile + '",');
    if (app.logDateFormat) lines.push('      log_date_format: "' + app.logDateFormat + '",');
    if (app.mergeLogs !== undefined) lines.push("      merge_logs: " + app.mergeLogs + ",");
    if (app.autorestart !== undefined) lines.push("      autorestart: " + app.autorestart + ",");
    if (app.maxRestarts !== undefined) lines.push("      max_restarts: " + app.maxRestarts + ",");
    if (app.minUptime) lines.push('      min_uptime: "' + app.minUptime + '",');
    if (app.watch !== undefined) lines.push("      watch: " + app.watch + ",");
    if (app.killTimeout !== undefined) lines.push("      kill_timeout: " + app.killTimeout + ",");
    if (app.listenTimeout !== undefined) lines.push("      listen_timeout: " + app.listenTimeout + ",");
    lines.push("    }" + (index < this.apps.length - 1 ? "," : ""));
  });

  lines.push("  ],");
  lines.push("};");

  return lines.join("\\n");
};

var generator = new EcosystemGenerator();

generator.addApp({
  name: "api-server",
  script: "./dist/index.js",
  instances: "max",
  execMode: "cluster",
  env: { NODE_ENV: "development", PORT: "3000" },
  envProduction: { NODE_ENV: "production", PORT: "8080" },
  maxMemoryRestart: "500M",
  errorFile: "./logs/api-error.log",
  outFile: "./logs/api-out.log",
  logDateFormat: "YYYY-MM-DD HH:mm:ss Z",
  mergeLogs: true,
  autorestart: true,
  maxRestarts: 10,
  minUptime: "10s",
  watch: false,
  killTimeout: 5000,
  listenTimeout: 3000,
});

generator.addApp({
  name: "worker",
  script: "./workers/queue.js",
  instances: 2,
  execMode: "fork",
  env: { NODE_ENV: "production" },
  maxMemoryRestart: "300M",
  errorFile: "./logs/worker-error.log",
  outFile: "./logs/worker-out.log",
  autorestart: true,
  watch: false,
});

var config = generator.build();
console.log(config);

var tmpDir = path.join(os.tmpdir(), "pm2-demo-" + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });
var configPath = path.join(tmpDir, "ecosystem.config.js");
fs.writeFileSync(configPath, config);
console.log("\\necosystem.config.js 已生成: " + configPath);

// ============================================================
// 演示 2：进程状态监控
// ============================================================
console.log("\\n===== 演示 2：进程状态监控 =====");

function PM2ProcessManager() {
  EventEmitter.call(this);
  this.processes = new Map();
  this.nextId = 1;
  this.logs = [];
}

PM2ProcessManager.prototype = Object.create(EventEmitter.prototype);

PM2ProcessManager.prototype.start = function (config) {
  var id = this.nextId++;
  var proc = {
    id: id,
    name: config.name || "app-" + id,
    pid: Math.floor(Math.random() * 60000) + 1000,
    mode: config.execMode || "fork",
    status: "online",
    cpu: 0,
    memory: Math.floor(Math.random() * 50) + 20,
    uptime: 0,
    restarts: 0,
    unstableRestarts: 0,
    config: config,
    createdAt: new Date(),
  };
  this.processes.set(id, proc);
  this.logs.push({ time: new Date(), type: "info", message: '进程 "' + proc.name + '" (id:' + id + ") 已启动" });
  this.emit("start", proc);
  return proc;
};

PM2ProcessManager.prototype.stop = function (id) {
  var proc = this.processes.get(id);
  if (!proc) return false;
  proc.status = "stopped";
  this.logs.push({ time: new Date(), type: "info", message: '进程 "' + proc.name + '" (id:' + id + ") 已停止" });
  this.emit("stop", proc);
  return true;
};

PM2ProcessManager.prototype.restart = function (id) {
  var proc = this.processes.get(id);
  if (!proc) return false;
  proc.restarts++;
  proc.status = "online";
  proc.uptime = 0;
  proc.memory = Math.floor(Math.random() * 50) + 20;
  this.logs.push({ time: new Date(), type: "info", message: '进程 "' + proc.name + '" (id:' + id + ") 已重启 (第" + proc.restarts + "次)" });
  this.emit("restart", proc);
  return true;
};

PM2ProcessManager.prototype.list = function () {
  var self = this;
  console.log("PM2 进程列表:");
  console.log("┌────┬──────────────────┬────────┬────────┬──────┬────────┬──────────┬──────────┐");
  console.log("│ id │ name             │ mode   │ status │ cpu  │ memory │ uptime   │ restarts │");
  console.log("├────┼──────────────────┼────────┼────────┼──────┼────────┼──────────┼──────────┤");

  self.processes.forEach(function (p) {
    var statusIcon = p.status === "online" ? "●" : "○";
    console.log(
      "│ " + String(p.id).padEnd(2) +
      " │ " + p.name.padEnd(16) +
      " │ " + p.mode.padEnd(6) +
      " │ " + (statusIcon + " " + p.status).padEnd(6) +
      " │ " + String(p.cpu).padEnd(4) + "%" +
      " │ " + String(p.memory).padEnd(6) + "MB" +
      " │ " + formatUptime(p.uptime).padEnd(8) +
      " │ " + String(p.restarts).padEnd(8) +
      " │"
    );
  });
  console.log("└────┴──────────────────┴────────┴────────┴──────┴────────┴──────────┴──────────┘");
};

function formatUptime(seconds) {
  if (seconds < 60) return seconds + "s";
  if (seconds < 3600) return Math.floor(seconds / 60) + "m";
  if (seconds < 86400) return Math.floor(seconds / 3600) + "h";
  return Math.floor(seconds / 86400) + "d";
}

var pm2 = new PM2ProcessManager();

// 启动多个进程
var apiServer = pm2.start({ name: "api-server", execMode: "cluster", instances: 4 });
var worker = pm2.start({ name: "worker", execMode: "fork", instances: 2 });
var cron = pm2.start({ name: "cron-job", execMode: "fork" });

// 模拟一些运行时间
apiServer.uptime = 86400 * 3;  // 3天
apiServer.cpu = 2.5;
apiServer.restarts = 1;

worker.uptime = 3600 * 5;    // 5小时
worker.cpu = 0.8;

cron.uptime = 86400 * 7;     // 7天
cron.cpu = 0.1;
cron.memory = 35;

pm2.list();

// 模拟进程重启
console.log("\\n--- 模拟重启 api-server ---");
pm2.restart(apiServer.id);
apiServer.uptime = 120;

pm2.list();

// ============================================================
// 演示 3：cluster 模式 vs fork 模式
// ============================================================
console.log("\\n===== 演示 3：Cluster 模式 vs Fork 模式 =====");

var modes = {
  fork: {
    description: "单进程模式，简单直接",
    diagram: "客户端 → [单个 Node.js 进程] → 处理请求",
    pros: ["配置简单，适合开发环境", "单核场景足够", "调试方便"],
    cons: ["无法利用多核 CPU", "单点故障（进程崩溃后服务中断）", "并发能力受限"],
    useCase: "非关键服务、定时任务、开发环境",
  },
  cluster: {
    description: "利用 Node.js cluster 模块，多进程共享端口",
    diagram: "客户端 → PM2 负载均衡 → [进程1] [进程2] [进程3] [进程4]",
    pros: ["充分利用多核 CPU", "负载均衡（Round-Robin）", "单进程崩溃不影响其他进程", "零停机重载"],
    cons: ["内存不共享（需 Redis 管理 Session）", "每个进程独立内存（多份开销）", "调试稍复杂"],
    useCase: "生产环境、高并发 API 服务",
  },
};

Object.keys(modes).forEach(function (mode) {
  var m = modes[mode];
  console.log("\\n" + mode.toUpperCase() + " 模式:");
  console.log("  描述: " + m.description);
  console.log("  架构: " + m.diagram);
  console.log("  优点:");
  m.pros.forEach(function (p) { console.log("    ✓ " + p); });
  console.log("  缺点:");
  m.cons.forEach(function (c) { console.log("    ✗ " + c); });
  console.log("  适用: " + m.useCase);
});

// ============================================================
// 演示 4：零停机重载
// ============================================================
console.log("\\n===== 演示 4：零停机重载（Zero-downtime Reload）=====");

function ZeroDowntimeReload(processes) {
  this.processes = processes;
  this.newProcesses = [];
}

ZeroDowntimeReload.prototype.reload = function () {
  console.log("零停机重载流程:\\n");
  console.log("原始进程: " + this.processes.length + " 个实例运行中");

  var self = this;
  var totalSteps = this.processes.length * 2;

  this.processes.forEach(function (proc, i) {
    var step = i + 1;
    console.log("\\n  Step " + step + ": 启动新进程 (实例 " + (i + 1) + ")");
    console.log("    → 启动新的 " + proc.name + " 进程...");
    console.log("    → 等待新进程 ready (health check)...");
    console.log("    ✓ 新进程就绪 (PID: " + (proc.pid + 1000) + ")");

    console.log("  Step " + (step + self.processes.length) + ": 关闭旧进程 (实例 " + (i + 1) + ")");
    console.log("    → 发送 SIGTERM 信号给旧进程 PID:" + proc.pid);
    console.log("    → 等待旧进程优雅关闭...");
    console.log("    ✓ 旧进程已关闭");

    self.newProcesses.push({
      id: proc.id,
      pid: proc.pid + 1000,
      name: proc.name,
      status: "online",
    });
  });

  console.log("\\n重载完成！");
  console.log("总耗时: ~" + (this.processes.length * 2000) + "ms");
  console.log("停机时间: 0ms (零停机)");
  console.log("新进程: " + self.newProcesses.length + " 个实例运行中");

  var self = this;
  self.newProcesses.forEach(function (p) {
    console.log("  " + p.name + " (PID: " + p.pid + ") — " + p.status);
  });
};

var clusterProcesses = [
  { id: 1, pid: 10001, name: "api-server" },
  { id: 2, pid: 10002, name: "api-server" },
  { id: 3, pid: 10003, name: "api-server" },
  { id: 4, pid: 10004, name: "api-server" },
];

var reload = new ZeroDowntimeReload(clusterProcesses);
reload.reload();

// ============================================================
// 演示 5：日志轮转
// ============================================================
console.log("\\n===== 演示 5：日志轮转（Log Rotation）=====");

function LogRotator(logDir, maxSize, maxFiles) {
  this.logDir = logDir;
  this.maxSize = maxSize || 10 * 1024 * 1024; // 10MB
  this.maxFiles = maxFiles || 30;
  this.currentFile = null;
  this.currentSize = 0;
}

LogRotator.prototype.write = function (level, message) {
  var self = this;
  var timestamp = new Date().toISOString();
  var line = "[" + timestamp + "] [" + level.toUpperCase() + "] " + message;

  // 模拟日志写入
  self.currentSize += line.length;

  if (self.currentSize > self.maxSize) {
    self.rotate();
  }

  return line;
};

LogRotator.prototype.rotate = function () {
  console.log("  [日志轮转] 当前日志文件达到大小限制，执行轮转...");
  console.log("    → 重命名当前文件: app-out.log → app-out-1.log");
  console.log("    → 创建新的 app-out.log");
  console.log("    → 清理旧日志文件 (保留最近 " + this.maxFiles + " 个)");
  this.currentSize = 0;
};

LogRotator.prototype.getStatus = function () {
  return {
    logDir: this.logDir,
    currentSize: Math.round(this.currentSize / 1024) + " KB",
    maxSize: Math.round(this.maxSize / 1024 / 1024) + " MB",
    maxFiles: this.maxFiles,
  };
};

var rotator = new LogRotator("/var/log/myapp", 10 * 1024 * 1024, 30);

console.log("日志轮转配置:");
var status = rotator.getStatus();
console.log("  日志目录: " + status.logDir);
console.log("  当前大小: " + status.currentSize);
console.log("  最大大小: " + status.maxSize);
console.log("  保留文件: " + status.maxFiles + " 个");

console.log("\\n日志写入示例:");
var sampleLogs = [
  ["info", "应用启动成功，端口: 3000"],
  ["info", "数据库连接成功"],
  ["info", "GET /api/users 200 45ms"],
  ["warn", "内存使用率超过 80%"],
  ["error", "Redis 连接超时，正在重试..."],
  ["info", "POST /api/orders 201 120ms"],
  ["info", "GET /api/products 200 32ms"],
  ["error", "未捕获异常: TypeError: Cannot read property 'name'"],
];

sampleLogs.forEach(function (log) {
  var line = rotator.write(log[0], log[1]);
  console.log("  " + line);
});

console.log("\\n[日志轮转] 大小超过 10MB 时自动触发轮转");

// ============================================================
// 演示 6：进程自动重启与守护
// ============================================================
console.log("\\n===== 演示 6：进程自动重启与守护 =====");

function CrashDetector(pm2Instance) {
  this.pm2 = pm2Instance;
  this.crashCount = new Map();
  this.crashWindow = 60000; // 1分钟窗口
  this.maxCrashes = 10;
}

CrashDetector.prototype.simulateCrash = function (procId) {
  var proc = this.pm2.processes.get(procId);
  if (!proc) return;

  console.log("\\n⚠ 进程 " + proc.name + " (id:" + procId + ") 崩溃！");

  // 检查不稳定重启
  var key = procId;
  var now = Date.now();
  if (!this.crashCount.has(key)) {
    this.crashCount.set(key, []);
  }
  var times = this.crashCount.get(key);
  times.push(now);

  // 清理超过时间窗口的记录
  var windowStart = now - this.crashWindow;
  this.crashCount.set(key, times.filter(function (t) { return t > windowStart; }));

  var recentCrashes = this.crashCount.get(key).length;

  if (recentCrashes > this.maxCrashes) {
    console.log("  ✗ 进程 " + proc.name + " 在 " + (this.crashWindow / 1000) + "秒内崩溃 " + recentCrashes + " 次");
    console.log("  ✗ 超过最大重启次数 (" + this.maxCrashes + ")，进程已停止");
    this.pm2.stop(procId);
    return;
  }

  console.log("  → 自动重启进程...");
  this.pm2.restart(procId);
  console.log("  ✓ 进程已重启 (最近 " + (this.crashWindow / 1000) + "秒内崩溃 " + recentCrashes + " 次)");

  var remainder = this.maxCrashes - recentCrashes;
  if (remainder <= 3) {
    console.log("  ⚠ 警告: 剩余重启次数: " + remainder);
  }
};

CrashDetector.prototype.getCrashStats = function () {
  var stats = [];
  var self = this;
  this.crashCount.forEach(function (times, procId) {
    var proc = self.pm2.processes.get(procId);
    stats.push({
      name: proc ? proc.name : "未知",
      id: procId,
      recentCrashes: times.length,
      status: proc ? proc.status : "deleted",
    });
  });
  return stats;
};

var detector = new CrashDetector(pm2);

// 模拟多次崩溃
console.log("模拟进程崩溃与自动重启:");
for (var i = 0; i < 3; i++) {
  detector.simulateCrash(apiServer.id);
}

console.log("\\n崩溃统计:");
var stats = detector.getCrashStats();
stats.forEach(function (s) {
  console.log("  " + s.name + " (id:" + s.id + "): " + s.recentCrashes + " 次崩溃, 状态: " + s.status);
});

// ============================================================
// 演示 7：PM2 监控面板
// ============================================================
console.log("\\n===== 演示 7：PM2 监控面板 =====");

function MonitorPanel(pm2Instance) {
  this.pm2 = pm2Instance;
}

MonitorPanel.prototype.display = function () {
  console.log("┌─────────────────────────────────────────────────────────────┐");
  console.log("│  PM2 监控面板                                   按 Ctrl+C 退出 │");
  console.log("├─────────────────────────────────────────────────────────────┤");

  var self = this;
  var totalMem = 0;
  var totalCpu = 0;

  this.pm2.processes.forEach(function (p) {
    // 模拟实时数据
    p.cpu = parseFloat((Math.random() * 5).toFixed(1));
    p.memory = Math.floor(Math.random() * 30) + 30;
    totalCpu += p.cpu;
    totalMem += p.memory;

    var bar = "█".repeat(Math.floor(p.cpu * 2));
    console.log("│ " + p.name.padEnd(14) + "  CPU: " + String(p.cpu).padEnd(5) + "% " + bar.padEnd(12) + " MEM: " + String(p.memory).padEnd(4) + "MB  │");
  });

  console.log("├─────────────────────────────────────────────────────────────┤");
  console.log("│ 总计 CPU: " + String(totalCpu.toFixed(1)).padEnd(6) + "%  MEM: " + String(totalMem).padEnd(5) + "MB                            │");
  console.log("└─────────────────────────────────────────────────────────────┘");
};

var monitor = new MonitorPanel(pm2);
monitor.display();

console.log("\\nPM2 监控面板说明:");
console.log("  → pm2 monit         终端实时监控");
console.log("  → pm2 plus          基于 Web 的监控面板");
console.log("  → pm2 describe <id>  查看进程详细信息");
console.log("  → pm2 show <id>      查看进程元数据");

// ============================================================
// 演示 8：PM2 常用命令
// ============================================================
console.log("\\n===== 演示 8：PM2 常用命令速查 =====");

var pm2Commands = [
  { command: "pm2 start app.js --name my-app", description: "启动应用" },
  { command: "pm2 start ecosystem.config.js", description: "使用配置文件启动" },
  { command: "pm2 list", description: "查看所有进程" },
  { command: "pm2 logs", description: "查看实时日志" },
  { command: "pm2 logs --lines 100", description: "查看最近100行日志" },
  { command: "pm2 monit", description: "终端监控面板" },
  { command: "pm2 restart my-app", description: "重启应用" },
  { command: "pm2 reload my-app", description: "零停机重载" },
  { command: "pm2 stop my-app", description: "停止应用" },
  { command: "pm2 delete my-app", description: "删除应用" },
  { command: "pm2 save", description: "保存当前进程列表" },
  { command: "pm2 startup", description: "配置开机自启" },
  { command: "pm2 flush", description: "清空日志" },
  { command: "pm2 reloadLogs", description: "重载日志" },
  { command: "pm2 describe my-app", description: "查看进程详情" },
  { command: "pm2 reset my-app", description: "重置重启计数器" },
];

console.log("命令".padEnd(42) + "描述");
console.log("-".repeat(70));
pm2Commands.forEach(function (c) {
  console.log(c.command.padEnd(42) + c.description);
});

// 清理临时文件
try { fs.unlinkSync(configPath); fs.rmdirSync(tmpDir); } catch (e) {}

console.log("\\n\\n===== PM2 进程管理演示完成 =====");`,
  },
];

// 侧边栏分组顺序
export const chapterGroups = ['基础入门', '核心模块', '异步编程', '进阶实战', '工程化', '实战补充'];