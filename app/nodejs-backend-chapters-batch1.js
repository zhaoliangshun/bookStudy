export const chapters = [
  {
    id: "nb-intro",
    group: "开篇：为什么选择Node.js做后端",
    icon: "🚀",
    title: "Node.js Web后端开发：从零到生产",
    content: `# Node.js Web后端开发：从零到生产

欢迎来到《Node.js Web后端开发实战》！这是一本面向实战的教程，我们将从最基础的概念开始，一步步构建出可以部署到生产环境的完整后端服务。

---

## 为什么选择Node.js做后端开发？

在开始写代码之前，我们先思考一个问题：**后端语言那么多，Java、Python、Go、PHP...为什么选Node.js？**

### 1. 统一的语言栈：JavaScript全栈

如果你已经会写前端JavaScript，那么学习Node.js后端的成本极低——你不需要再学一门新语言。同一个开发者可以同时写前端和后端，这就是所谓的"全栈开发"。

- 前后端共享代码逻辑（比如表单验证规则）
- 数据结构可以直接复用（JSON原生支持）
- 团队技术栈统一，沟通成本低

### 2. 非阻塞I/O与高并发性能

Node.js基于Chrome V8引擎，采用**事件驱动、非阻塞I/O模型**。这意味着：

- 单线程处理大量并发连接，没有线程切换开销
- I/O操作（数据库查询、文件读写、网络请求）不会阻塞主线程
- 特别适合I/O密集型应用（大部分Web应用都是）

举个例子：一个传统的Java Web服务器，每个请求占用一个线程。如果有1000个并发请求都在等数据库响应，就有1000个线程在"睡觉"，线程切换和内存开销很大。而Node.js只用一个线程，在等待数据库的时候可以去处理其他请求，等数据库返回了再回来处理回调。

### 3. 世界上最大的包生态：npm

npm是全球最大的开源包管理器，拥有超过200万个包。你能想到的几乎任何功能：
- Web框架：Express、Koa、NestJS、Fastify
- 数据库驱动：mysql2、pg、mongodb、mongoose
- 身份认证：jsonwebtoken、passport、bcrypt
- 工具库：lodash、dayjs、axios
- ...都有现成的包可以直接用

### 4. 活跃的社区和大厂背书

Node.js被几乎所有大厂使用：Netflix、Uber、PayPal、LinkedIn、淘宝、腾讯...这意味着：
- 遇到问题很容易搜到解决方案
- 长期维护有保障
- 最佳实践和资料非常丰富

---

## Node.js适合做什么？不适合做什么？

### ✅ 适合的场景

1. **Web API服务**：RESTful API、GraphQL服务
2. **实时应用**：聊天室、实时协作、在线游戏（WebSocket支持极好）
3. **微服务**：轻量、启动快，适合容器化部署
4. **BFF层**：Backend For Frontend，为前端聚合接口
5. **工具类服务**：构建工具、CI/CD脚本、命令行工具
6. **流式处理**：文件上传下载、实时数据处理

### ❌ 不适合的场景

1. **CPU密集型计算**：视频编码、图像处理、复杂数学运算（单线程会阻塞）
2. **内存需求极大的应用**：大型数据分析、科学计算
3. **需要强类型和极致性能的底层系统**：操作系统、数据库内核

记住：**没有最好的语言，只有最合适的场景**。Node.js在Web后端开发这个领域是非常优秀的选择。

---

## 本教程的学习路径

我们将按照以下顺序循序渐进学习：

### 第一部分：基础篇
- 开发环境搭建
- Node.js模块系统与npm
- 原生HTTP模块实现服务器
- 异步编程：回调、Promise、async/await

### 第二部分：Express框架核心
- Express快速入门
- 中间件原理与实践
- 路由设计与参数处理
- 请求与响应对象详解

### 第三部分：数据库实战
- MySQL关系型数据库操作
- MongoDB文档数据库操作
- ORM/ODM使用：Sequelize与Mongoose
- 数据库事务与性能优化

### 第四部分：工程化与安全
- 错误处理与日志系统
- 身份认证：JWT、Session、OAuth
- 输入验证与安全防护
- 文件上传与处理

### 第五部分：项目实战
- RESTful API设计规范
- 完整博客系统API开发
- 单元测试与集成测试
- 接口文档自动生成

### 第六部分：部署与运维
- 进程管理：PM2
- 反向代理：Nginx
- Docker容器化部署
- 性能监控与优化

---

## 学习方法建议

### 1. 动手写，不要只看
每个章节都有完整的可运行代码示例。**一定要亲自敲一遍、运行一遍**。看懂了和写出来了是完全两回事。

### 2. 故意搞破坏
写完代码后，试试传错参数、故意写错配置、不按照约定调用...看看会发生什么？理解错误信息也是学习的一部分。

### 3. 阅读文档
遇到不懂的地方，第一时间去看官方文档：[nodejs.org](https://nodejs.org) 和 [expressjs.com](https://expressjs.com)。官方文档永远是最权威的。

### 4. 做项目
光学不练假把式。学完基础后一定要自己做一个完整的项目，比如博客系统、待办清单API、简单的电商后端...只有做完整项目才能把知识串起来。

准备好了吗？让我们开始搭建开发环境！
`,
    code: `// ============================================
// 开篇：验证Node.js环境，打印系统信息
// ============================================

// 导入Node.js内置模块
// os模块提供操作系统相关的实用方法
const os = require('os');
// process对象提供当前Node.js进程的信息和控制
const process = require('process');

console.log('========================================');
console.log('  🎉 欢迎来到 Node.js Web后端开发！');
console.log('========================================');
console.log('');

// 1. 打印Node.js版本
// process.version返回Node.js版本字符串，如'v20.10.0'
console.log('📦 Node.js版本:', process.version);

// 2. 打印V8引擎版本
// process.versions包含多个依赖库的版本
console.log('🔧 V8引擎版本:', process.versions.v8);

// 3. 打印操作系统信息
// os.platform()返回操作系统平台：'darwin'(macOS), 'win32'(Windows), 'linux'等
console.log('💻 操作系统:', os.platform(), os.arch());

// 4. 打印CPU信息
// os.cpus()返回CPU核心信息数组
const cpus = os.cpus();
console.log('⚡ CPU核心数:', cpus.length, '核');
console.log('   CPU型号:', cpus[0].model.trim());

// 5. 打印内存信息
// os.totalmem()返回总内存字节数，os.freemem()返回空闲内存
// 1GB = 1024 * 1024 * 1024 字节
const totalMemGB = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
const freeMemGB = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
console.log('🧠 总内存:', totalMemGB, 'GB，空闲:', freeMemGB, 'GB');

// 6. 打印工作目录
// process.cwd()返回当前工作目录（你在哪个目录执行的node命令）
console.log('📂 当前工作目录:', process.cwd());

// 7. 打印环境变量中的PATH（取前几个）
// process.env包含所有环境变量
const pathEntries = process.env.PATH.split(path.delimiter || ':').slice(0, 5);
console.log('🛤️  PATH环境变量（前5项）:');
pathEntries.forEach((p, i) => console.log('   ', i + 1 + '.', p));

console.log('');
console.log('✅ 你的Node.js环境已经就绪！');
console.log('👉 下一章我们开始正式学习，先从模块系统和npm开始。');

// 小测试：用Node.js写一个最简单的HTTP服务器预告
// 我们会在后面详细讲解，这里先感受一下
const http = require('http');

// 创建一个简单的HTTP服务器（仅作演示，不实际启动）
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Hello Node.js Backend!');
});

console.log('');
console.log('💡 预览：这是一个最简单的HTTP服务器代码，');
console.log('   短短几行就能启动一个Web服务，这就是Node.js的魅力！');
console.log('   后面的章节我们会详细讲解每一行的含义。');
`
  },
  {
    id: "nb-env-setup",
    group: "第一部分：基础篇",
    icon: "⚙️",
    title: "开发环境搭建与Node.js基础",
    content: `# 开发环境搭建与Node.js基础

工欲善其事，必先利其器。本章我们来搭建Node.js开发环境，并了解Node.js的一些基础概念。

---

## 一、安装Node.js

### 方式一：官网安装包（推荐新手）

1. 访问 [nodejs.org](https://nodejs.org/)
2. 下载**LTS（长期支持版）**——LTS版本更稳定，适合生产环境
3. Current版本是最新版，包含新特性但可能有未修复的bug
4. 双击安装包，一路下一步即可

安装完成后，打开终端（Windows是CMD或PowerShell，macOS/Linux是Terminal），输入：

\`\`\`bash
node -v
npm -v
\`\`\`

如果能看到版本号，说明安装成功了。

### 方式二：版本管理工具（推荐开发者）

**为什么需要版本管理？**
- 不同项目可能需要不同版本的Node.js
- 想尝试新版本但不想影响现有环境
- 可以随时切换版本

推荐工具：
- **macOS/Linux**: nvm (Node Version Manager)
- **Windows**: nvm-windows

安装nvm后：
\`\`\`bash
nvm install 20        # 安装Node.js 20
nvm use 20            # 切换到20版本
nvm install 18        # 安装Node.js 18
nvm use 18            # 切换到18版本
nvm ls                # 列出已安装的版本
\`\`\`

---

## 二、选择编辑器：VS Code

强烈推荐使用 **Visual Studio Code (VS Code)**，它是微软开发的免费开源编辑器，对Node.js/JavaScript支持极好。

下载地址：[code.visualstudio.com](https://code.visualstudio.com/)

推荐安装的插件：
1. **ESLint**：代码检查和规范提示
2. **Prettier**：代码自动格式化
3. **JavaScript and TypeScript Nightly**：更好的JS/TS支持
4. **Node.js Modules Intellisense**：模块自动补全
5. **Thunder Client** 或 **REST Client**：直接在编辑器里测试API
6. **GitLens**：Git增强工具

---

## 三、Node.js基础概念

### 1. REPL：交互式运行环境

在终端直接输入 \`node\` 回车，就进入了REPL（Read-Eval-Print Loop，读取-求值-输出循环）。你可以在这里直接写JavaScript代码，即时看到结果：

\`\`\`javascript
> 1 + 1
2
> const name = 'Node.js'
undefined
> console.log('Hello', name)
Hello Node.js
undefined
> .exit  // 退出REPL
\`\`\`

REPL很适合快速测试小段代码、试验API。

### 2. 运行JavaScript文件

创建一个 \`hello.js\` 文件：
\`\`\`javascript
console.log('Hello World!');
\`\`\`

在终端执行：
\`\`\`bash
node hello.js
\`\`\`

就能看到输出：\`Hello World!\`

### 3. Node.js全局对象

浏览器中有 \`window\` 全局对象，Node.js中有：

- **global**：全局命名空间对象（Node.js中）
- **globalThis**：ES2020引入的统一全局对象（浏览器和Node.js都可用）
- **process**：当前进程对象，包含环境变量、命令行参数等
- **console**：控制台输出，和浏览器类似
- **__dirname**：当前文件所在目录的绝对路径（字符串）
- **__filename**：当前文件的绝对路径（字符串）
- **Buffer**：用于处理二进制数据
- **setTimeout/setInterval/setImmediate**：定时器函数

注意：在ES模块（.mjs或package.json中type:"module"）中，\`__dirname\`和\`__filename\`是不存在的。

---

## 四、package.json：项目的配置文件

每个Node.js项目根目录都有一个 \`package.json\` 文件，它是项目的"身份证"，记录了：

- 项目名称、版本、描述
- 依赖包列表（dependencies和devDependencies）
- 脚本命令（scripts）
- 其他配置（入口文件、作者、协议等）

### 初始化package.json

在项目目录执行：
\`\`\`bash
npm init
\`\`\`

它会问你一系列问题，一路回车用默认值也可以。或者加 \`-y\` 参数跳过提问直接生成：
\`\`\`bash
npm init -y
\`\`\`

生成的package.json大概长这样：
\`\`\`json
{
  "name": "my-project",
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

### 安装依赖包

\`\`\`bash
npm install express    # 安装express，保存到dependencies
npm i express          # 简写
npm i -D nodemon       # 安装到devDependencies（开发依赖）
npm i -g typescript    # 全局安装
\`\`\`

- **dependencies**：生产环境需要的包，比如express、数据库驱动
- **devDependencies**：只在开发时需要的包，比如测试框架、代码检查工具、热重载工具

---

## 五、常用npm命令速查

| 命令 | 作用 |
|------|------|
| \`npm init -y\` | 快速初始化package.json |
| \`npm install <pkg>\` 或 \`npm i <pkg>\` | 安装包并保存到dependencies |
| \`npm i -D <pkg>\` | 安装到devDependencies |
| \`npm i -g <pkg>\` | 全局安装 |
| \`npm i\` | 根据package.json安装所有依赖 |
| \`npm uninstall <pkg>\` | 卸载包 |
| \`npm update\` | 更新所有包 |
| \`npm run <script>\` | 执行package.json中scripts里定义的脚本 |
| \`npm ls\` | 查看已安装的包 |

---

## 六、第一个Node.js程序：不只是Hello World

让我们写一个稍微有趣一点的程序，感受一下Node.js能做什么。

本章的代码示例包含了：
1. 打印系统信息
2. 命令行参数解析
3. 简单的文件读写
4. 模块导入演示

运行方法：保存为 \`first-program.js\`，然后 \`node first-program.js\`，也可以传参数试试：\`node first-program.js Alice\`
`,
    code: `// ============================================
// 第一个Node.js程序：综合演示
// 运行方式：node first-program.js [你的名字]
// ============================================

// 1. 导入内置模块
// fs模块用于文件系统操作（File System）
const fs = require('fs');
// path模块用于处理文件路径
const path = require('path');

// 2. 获取命令行参数
// process.argv是一个数组，包含命令行参数
// process.argv[0]是node可执行文件路径
// process.argv[1]是当前执行的脚本路径
// process.argv[2]及以后才是用户传入的参数
const args = process.argv.slice(2);
const userName = args[0] || '开发者';

console.log('');
console.log('👋 欢迎你，' + userName + '！');
console.log('这是你的第一个Node.js程序。');
console.log('');

// 3. 打印当前日期时间
const now = new Date();
console.log('📅 当前时间:', now.toLocaleString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  weekday: 'long'
}));

// 4. __dirname 和 __filename
// __dirname是当前脚本所在目录的绝对路径
// __filename是当前脚本文件的绝对路径
console.log('');
console.log('📁 脚本所在目录:', __dirname);
console.log('📄 脚本文件路径:', __filename);

// 5. path模块演示：拼接路径
// path.join()智能拼接路径，自动处理斜杠问题
const logDir = path.join(__dirname, 'logs');
const logFile = path.join(logDir, 'app.log');
console.log('📝 日志目录路径:', logDir);
console.log('📋 日志文件路径:', logFile);

// 6. 同步创建目录（如果不存在）
// existsSync检查路径是否存在，mkdirSync同步创建目录
// recursive: true表示如果父目录不存在也一并创建
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
  console.log('✅ 创建了logs目录');
} else {
  console.log('ℹ️  logs目录已存在');
}

// 7. 写入日志文件
// writeFileSync同步写入文件：第一个参数是路径，第二个是内容，第三个是编码
const logMessage = \`[\${now.toISOString()}] 用户\${userName}运行了程序\\n\`;
fs.writeFileSync(logFile, logMessage, { flag: 'a', encoding: 'utf8' });
console.log('💾 日志已写入到', logFile);

// 8. 读取并显示日志文件内容（如果有）
try {
  // readFileSync同步读取文件，返回Buffer，指定utf8编码返回字符串
  const logContent = fs.readFileSync(logFile, 'utf8');
  const lines = logContent.trim().split('\\n');
  console.log('');
  console.log('📜 历史日志（共' + lines.length + '条）:');
  // 只显示最近5条
  lines.slice(-5).forEach((line, i) => {
    console.log('   ', (lines.length - Math.min(5, lines.length) + i + 1) + '.', line);
  });
} catch (err) {
  console.log('⚠️  读取日志文件失败:', err.message);
}

// 9. 演示异步操作（非阻塞）
// setTimeout是异步的，它不会阻塞后面的代码执行
console.log('');
console.log('⏳ 演示异步非阻塞特性：');
console.log('   这行先打印');

setTimeout(() => {
  console.log('   2秒后...这行才打印，但中间的代码不会被阻塞！');
  console.log('');
  console.log('🎉 程序执行完毕！');
  console.log('👉 你已成功运行第一个Node.js程序！');
  console.log('   下一章我们深入学习模块系统和npm包管理。');
}, 2000);

console.log('   这行在setTimeout之后，但先打印出来！');
console.log('   这就是非阻塞I/O的魔力——等待定时器的时候，');
console.log('   主线程可以继续执行后面的代码。');

// 小练习：
// 1. 试试修改userName，传入不同的名字运行
// 2. 多次运行程序，看看logs/app.log里的日志是不是在累积
// 3. 试试删除logs目录，看它会不会自动重建
// 4. 思考：为什么setTimeout里面的代码最后执行？
`
  },
  {
    id: "nb-module-system",
    group: "第一部分：基础篇",
    icon: "📦",
    title: "模块系统：CommonJS与npm包管理",
    content: `# 模块系统：CommonJS与npm包管理

模块化是任何大型项目的基础。如果所有代码都写在一个文件里，那会是灾难——难以维护、难以复用、命名冲突。Node.js使用模块系统来组织代码，每个文件就是一个模块。

---

## 一、为什么需要模块化？

想象一下，如果没有模块化：
- 所有JS文件都在全局作用域，变量名很容易冲突
- 依赖关系混乱，不知道哪个文件先加载
- 无法复用代码，只能复制粘贴
- 大文件难以阅读和维护

模块化解决了这些问题：
1. **隔离作用域**：每个模块有自己的作用域，不会污染全局
2. **明确依赖**：通过require/import明确声明依赖哪些模块
3. **代码复用**：一个模块写好，到处都能用
4. **可维护性**：按功能拆分文件，结构清晰

---

## 二、CommonJS模块系统：require/module.exports

Node.js最初采用的是**CommonJS**规范，这是Node.js默认的模块系统。你看到的 \`require()\` 和 \`module.exports\` 就是CommonJS。

### 1. 导出模块：module.exports 和 exports

每个模块内部都有一个 \`module\` 对象，代表当前模块。\`module.exports\` 是模块对外暴露的接口，其他文件require这个模块时，拿到的就是module.exports的值。

\`\`\`javascript
// math.js - 一个简单的数学工具模块

// 方式1：给module.exports赋值一个对象
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

// 把要暴露的方法挂在exports上
module.exports = {
  add,
  subtract,
  PI: 3.14159
};

// 方式2：逐个添加属性（也可以用exports这个快捷方式）
// exports.add = add;
// exports.subtract = subtract;
// exports.PI = 3.14159;

// 注意：exports是module.exports的引用，
// 所以不能直接给exports赋值：exports = {...}，
// 这样只会切断exports和module.exports的联系，不会真的导出。
\`\`\`

### 2. 引入模块：require()

\`\`\`javascript
// app.js - 使用math模块

// require()函数用于引入模块
// 1. 引入自己写的模块（文件路径，./表示当前目录）
const math = require('./math.js');  // .js后缀可以省略：require('./math')

console.log(math.add(1, 2));       // 3
console.log(math.subtract(5, 3));  // 2
console.log(math.PI);              // 3.14159

// 也可以解构赋值
const { add, PI } = require('./math');
console.log(add(10, 20));          // 30
\`\`\`

### 3. require()的查找规则

当你写 \`require('xxx')\` 时，Node.js按以下顺序查找：

1. **核心模块**：如果xxx是Node.js内置模块名（如http、fs、path），直接返回核心模块，优先级最高
2. **路径模块**：如果以\`./\`、\`../\`、\`/\`开头，当作文件/目录路径查找：
   - 先找 exact 文件：xxx
   - 再找 xxx.js、xxx.json、xxx.node
   - 如果是目录，找目录下的package.json的main字段指定的文件
   - 如果没有package.json，找目录下的index.js
3. **node_modules**：如果不是路径也不是核心模块，从当前目录的node_modules开始，逐级向上查找node_modules/xxx
4. **全局模块**：如果都找不到，查找全局安装的模块
5. 最终找不到，抛出 \`MODULE_NOT_FOUND\` 错误

### 4. 模块加载机制

- **模块会被缓存**：第一次require后模块会被缓存，后续require同一个模块直接返回缓存的exports对象，不会重复执行模块代码
- **模块是同步加载的**：require是同步操作，这也是为什么CommonJS模块适合服务端而不适合浏览器（浏览器需要异步加载）
- **每个模块只加载一次**：单例模式

---

## 三、ES Modules：import/export（现代标准）

ES Modules（ESM）是ES6（ES2015）引入的官方模块标准，现在Node.js也完全支持了。

### 启用ESM的两种方式：

1. 文件后缀用 \`.mjs\`
2. 在package.json中加 \`"type": "module"\`，这样所有.js文件都被当作ESM

### 基本语法：

\`\`\`javascript
// math.mjs
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }
export const PI = 3.14159;

export default function multiply(a, b) { return a * b; }
\`\`\`

\`\`\`javascript
// app.mjs
import multiply, { add, subtract, PI } from './math.mjs';

console.log(add(1, 2));
console.log(multiply(3, 4));
\`\`\`

### CommonJS vs ESM 对比

| 特性 | CommonJS | ESM |
|------|----------|-----|
| 语法 | require()/module.exports | import/export |
| 加载方式 | 同步加载 | 异步加载 |
| 静态分析 | 困难（动态require） | 支持（静态import） |
| Tree Shaking | 不支持 | 支持 |
| __dirname/__filename | 有 | 没有（需用import.meta.url） |
| 使用环境 | Node.js默认 | 浏览器和现代Node.js |

**建议**：新项目建议使用ESM，这是未来的标准。但本教程为了兼容性和广泛的npm生态支持，主要使用CommonJS（因为大量Node.js后端代码还是用CommonJS写的）。

---

## 四、npm详解：包管理的艺术

npm（Node Package Manager）是Node.js的包管理工具，随Node.js一起安装。它不只是装包那么简单——它是整个Node.js生态的基石。

### 1. 安装包的语义化版本（SemVer）

package.json中依赖版本号看起来像这样：\`"express": "^4.18.2"\`，这是什么意思？

版本号格式：**主版本号.次版本号.修订号**（MAJOR.MINOR.PATCH）
- **MAJOR**：不兼容的API修改（ breaking changes ）
- **MINOR**：向下兼容的功能性新增
- **PATCH**：向下兼容的问题修复

版本前缀：
- **^4.18.2**：兼容4.x.x，不改变主版本（最常用）
- **~4.18.2**：兼容4.18.x，不改变主版本和次版本
- **4.18.2**：精确版本
- **>=4.18.0**：大于等于某个版本
- ***：任意版本（不推荐）

### 2. package.json vs package-lock.json

- **package.json**：你声明的依赖，版本范围
- **package-lock.json**：npm自动生成的，记录实际安装的精确版本，保证所有人安装的依赖版本完全一致

**重要**：package-lock.json一定要提交到Git仓库！不要在.gitignore里忽略它！

### 3. node_modules目录

执行npm install后，所有依赖会被下载到项目根目录的node_modules文件夹里。

- node_modules通常体积很大，不要提交到Git（要加入.gitignore）
- npm install时如果有package-lock.json，优先按照lock文件安装
- 不要手动修改node_modules里的任何东西！

### 4. 常用npm包分类

#### Web框架
- **express**：最流行、最经典的Web框架
- **koa**：Express团队开发的下一代框架，更轻量
- **fastify**：高性能Web框架，比Express快
- **nestjs**：企业级框架，TypeScript友好，类似Spring

#### 数据库相关
- **mysql2**：MySQL驱动，支持Promise
- **pg**：PostgreSQL驱动
- **mongodb**/ **mongoose**：MongoDB驱动和ODM
- **sequelize**：关系型数据库ORM
- **prisma**：新一代ORM，类型安全

#### 工具类
- **lodash**：工具函数库
- **dayjs**/ **date-fns**：日期处理（moment已不推荐）
- **axios**：HTTP客户端
- **dotenv**：环境变量加载
- **uuid**：生成唯一ID
- **bcryptjs**：密码加密

#### 中间件/安全
- **cors**：跨域处理
- **helmet**：安全HTTP头
- **jsonwebtoken**：JWT认证
- **morgan**：HTTP请求日志
- **express-validator**/ **joi**/ **zod**：数据验证

#### 开发工具
- **nodemon**：代码修改自动重启服务
- **jest**/ **mocha**：测试框架
- **eslint**：代码检查
- **prettier**：代码格式化
- **pm2**：生产进程管理

---

## 五、自己开发一个npm包（模块）

我们来动手写一个自己的工具模块，体验模块化开发。
`,
    code: `// ============================================
// 模块系统演示：一个完整的字符串工具模块
// 本文件是主程序，string-utils.js是工具模块
// ============================================

// 注意：为了能在沙箱中直接运行，我们在这里内联定义模块代码，
// 实际开发时应该把stringUtils放到单独的string-utils.js文件中

// ---------- 模拟 string-utils.js 模块开始 ----------
// 这部分实际项目中应该在单独文件里
const stringUtilsModule = (() => {
  // 私有函数（不会导出，外部访问不到）
  // 模块作用域内的函数和变量都是私有的，这就是模块隔离！
  function isString(str) {
    return typeof str === 'string' || str instanceof String;
  }

  function isEmpty(str) {
    return !str || str.trim().length === 0;
  }

  // 公开方法，会通过module.exports导出
  function capitalize(str) {
    if (!isString(str) || isEmpty(str)) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  function reverse(str) {
    if (!isString(str)) return '';
    return str.split('').reverse().join('');
  }

  function truncate(str, maxLength, suffix = '...') {
    if (!isString(str)) return '';
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
  }

  function toCamelCase(str) {
    if (!isString(str)) return '';
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
  }

  function toKebabCase(str) {
    if (!isString(str)) return '';
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  function countWords(str) {
    if (!isString(str) || isEmpty(str)) return 0;
    return str.trim().split(/\s+/).length;
  }

  function randomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  function stripHtml(str) {
    if (!isString(str)) return '';
    return str.replace(/<[^>]*>/g, '');
  }

  // 导出对象
  return {
    capitalize,
    reverse,
    truncate,
    toCamelCase,
    toKebabCase,
    countWords,
    randomString,
    stripHtml,
    // 可以暴露版本信息等元数据
    version: '1.0.0'
  };
})();
// ---------- 模拟 string-utils.js 模块结束 ----------

// 实际项目中这里是：const stringUtils = require('./string-utils');
const stringUtils = stringUtilsModule;

console.log('========================================');
console.log('  📦 自定义模块演示：string-utils');
console.log('========================================');
console.log('');

// 测试各个工具函数
console.log('🔤 capitalize: 首字母大写');
console.log('   "hello world" →', stringUtils.capitalize('hello world'));
console.log('   "JAVASCRIPT" →', stringUtils.capitalize('JAVASCRIPT'));
console.log('');

console.log('🔄 reverse: 字符串反转');
console.log('   "Node.js" →', stringUtils.reverse('Node.js'));
console.log('   "abcdef" →', stringUtils.reverse('abcdef'));
console.log('');

console.log('✂️  truncate: 截断字符串');
const longText = '这是一段很长很长的文字，需要截断显示';
console.log('   原文:', longText);
console.log('   截断到10字:', stringUtils.truncate(longText, 10));
console.log('');

console.log('🐫 toCamelCase: 转驼峰命名');
console.log('   "hello world" →', stringUtils.toCamelCase('hello world'));
console.log('   "user-name" →', stringUtils.toCamelCase('user-name'));
console.log('   "background_color" →', stringUtils.toCamelCase('background_color'));
console.log('');

console.log('🍢 toKebabCase: 转烤串命名');
console.log('   "helloWorld" →', stringUtils.toKebabCase('helloWorld'));
console.log('   "Hello World" →', stringUtils.toKebabCase('Hello World'));
console.log('   "backgroundColor" →', stringUtils.toKebabCase('backgroundColor'));
console.log('');

console.log('🔢 countWords: 统计单词数');
console.log('   "Hello Node.js World" →', stringUtils.countWords('Hello Node.js World'), '个词');
console.log('   "" →', stringUtils.countWords(''), '个词');
console.log('');

console.log('🎲 randomString: 生成随机字符串');
console.log('   8位随机串:', stringUtils.randomString(8));
console.log('   16位随机串:', stringUtils.randomString(16));
console.log('');

console.log('🧹 stripHtml: 去除HTML标签');
const htmlStr = '<p>Hello <strong>Node.js</strong> <em>Backend</em></p>';
console.log('   原HTML:', htmlStr);
console.log('   去除后:', stringUtils.stripHtml(htmlStr));
console.log('');

console.log('📌 模块版本:', stringUtils.version);
console.log('');

// 模块化开发要点总结：
console.log('💡 模块化要点回顾：');
console.log('   1. 每个文件是一个模块，有独立作用域');
console.log('   2. module.exports对外暴露接口');
console.log('   3. require()引入其他模块');
console.log('   4. 核心模块（fs、path、http等）直接require名字即可');
console.log('   5. 自己写的模块用路径（./xxx）require');
console.log('   6. npm安装的包直接require包名');
console.log('   7. 模块首次加载后会缓存');
console.log('');
console.log('👉 下一章我们开始学习HTTP服务，正式进入Web后端开发！');

// 小练习：
// 1. 把stringUtils的代码单独放到string-utils.js文件
// 2. 用require('./string-utils')引入，验证和演示效果一样
// 3. 尝试给stringUtils添加一个新方法，比如palindrome（判断是否回文）
// 4. 试着npm install一个第三方包（比如lodash），然后require进来使用
`
  }
];
