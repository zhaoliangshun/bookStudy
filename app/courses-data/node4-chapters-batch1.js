export const chapters = [
  {
    id: "n4-intro",
    group: "第一部分 入门基础",
    icon: "🟢",
    title: "Node.js 是什么：初识 JavaScript 服务端运行时",
    content: `# Node.js 是什么：初识 JavaScript 服务端运行时

## 一、Node.js 的诞生与本质

Node.js 是一个基于 **Chrome V8 引擎** 的 JavaScript 运行时环境，让 JavaScript 能够脱离浏览器在服务器端运行。

### 1.1 历史背景

- **2009年**：Ryan Dahl 在欧洲 JSConf 上首次发布 Node.js
- **2010年**：npm 包管理器诞生，形成了庞大的生态系统
- **2014年**：Node.js 爆发创始人纠纷，随后分叉出 io.js
- **2015年**：Node.js 基金会成立，Node.js 与 io.js 合并，发布 Node.js 4.0
- **至今**：Node.js 已成为全球最流行的服务端技术之一

### 1.2 核心特点

| 特性 | 说明 |
|------|------|
| **单线程** | 主线程是单线程的，通过事件循环处理并发 |
| **非阻塞 I/O** | I/O 操作不会阻塞主线程，采用异步回调方式 |
| **事件驱动** | 通过事件和回调函数来处理异步操作 |
| **跨平台** | 可在 Windows、macOS、Linux 等系统上运行 |

### 1.3 V8 引擎是什么？

V8 是 Google 开发的开源 JavaScript 引擎，用 C++ 编写，用于 Chrome 浏览器和 Node.js。它负责：
- 将 JavaScript 代码编译成机器码（而非解释执行）
- 管理内存（垃圾回收）
- 提供运行时环境

> 💡 **类比理解**：如果 JavaScript 是"汽油"，那么 V8 引擎就是"发动机"，Node.js 就是整辆"汽车"，让你能在公路（服务器）上飞驰。

---

## 二、Node.js vs 浏览器 JavaScript

浏览器和 Node.js 都运行 JavaScript，但环境差异很大：

### 2.1 全局对象差异

| 环境 | 全局对象 | API 举例 |
|------|----------|----------|
| 浏览器 | \`window\` | DOM、BOM、fetch、alert、document |
| Node.js | \`global\` / \`globalThis\` | fs、path、http、process、Buffer |

### 2.2 能力差异

- **浏览器**：专注于页面交互，受沙箱安全限制，无法直接访问文件系统
- **Node.js**：拥有完整的操作系统权限，可以读写文件、监听端口、发起网络请求

### 2.3 共同之处

- 都使用 V8 引擎（或其他 JS 引擎）解析执行 JavaScript
- 都支持 ES6+ 语法（let/const、箭头函数、Promise、async/await 等）
- 都有事件循环机制

---

## 三、安装 Node.js

### 3.1 推荐方式：使用 nvm（Node Version Manager）

nvm 是管理 Node.js 版本的最佳工具，可以在同一台机器上安装和切换多个版本：

\`\`\`bash
# macOS/Linux 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Windows 推荐使用 nvm-windows

# 安装完成后，安装最新 LTS 版本
nvm install --lts

# 使用最新 LTS 版本
nvm use --lts
\`\`\`

### 3.2 直接下载安装

也可以去 [官网](https://nodejs.org/) 下载安装包，推荐选择 **LTS（长期支持版）**。

### 3.3 验证安装

安装完成后，打开终端执行：

\`\`\`bash
node --version    # 查看 Node.js 版本
npm --version     # 查看 npm 版本
\`\`\`

---

## 四、第一个 Node.js 程序

### 4.1 Hello World

创建文件 \`hello.js\`：

\`\`\`javascript
console.log('Hello, Node.js!');
\`\`\`

在终端运行：

\`\`\`bash
node hello.js
\`\`\`

### 4.2 node 命令的常用参数

| 参数 | 作用 |
|------|------|
| \`-v\`, \`--version\` | 显示版本号 |
| \`-h\`, \`--help\` | 显示帮助信息 |
| \`-e\` | 直接执行代码字符串：\`node -e "console.log(1+1)"\` |
| \`-p\` | 执行并打印结果：\`node -p "process.platform"\` |
| \`--inspect\` | 启用调试模式 |

---

## 五、Node.js 能做什么？

1. **Web 服务器**：构建 API 服务、网站后端（Express、Koa、NestJS）
2. **命令行工具**：webpack、vite、create-react-app、vue-cli 等
3. **桌面应用**：Electron（VS Code、Discord 都是用它写的）
4. **脚本工具**：自动化脚本、构建工具、爬虫
5. **实时应用**：聊天室、在线协作工具、游戏服务器（Socket.io）
6. **微服务与 Serverless**：轻量级、高并发场景
`,
    code: `// ============================================
// Node.js 入门第一个程序
// 运行方式：node 文件名.js
// ============================================

// --- Demo 1：输出基本信息 ---
console.log('=== Node.js 基本信息 ===');
console.log('欢迎来到 Node.js 的世界！\\n');

// 获取 Node.js 版本
console.log('Node.js 版本:', process.version);

// 获取运行平台（darwin=macOS, win32=Windows, linux=Linux）
console.log('运行平台:', process.platform);

// 获取系统架构（x64, arm64 等）
console.log('系统架构:', process.arch);

// 获取当前工作目录
console.log('当前工作目录:', process.cwd());

// --- Demo 2：使用内置模块 os 获取更多系统信息 ---
// 引入 Node.js 内置的 os 模块
const os = require('os');

console.log('\\n=== 系统详细信息 ===');
console.log('操作系统类型:', os.type());
console.log('操作系统版本:', os.release());
console.log('主机名:', os.hostname());
console.log('CPU 架构:', os.machine());
console.log('CPU 核心数:', os.cpus().length);
console.log('CPU 型号:', os.cpus()[0].model);
console.log('总内存:', (os.totalmem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('可用内存:', (os.freemem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('系统启动时间:', (os.uptime() / 3600).toFixed(2), '小时');

// --- Demo 3：当前用户信息和路径分隔符 ---
const path = require('path');

console.log('\\n=== 用户与路径信息 ===');
console.log('当前用户主目录:', os.homedir());
console.log('临时文件目录:', os.tmpdir());
console.log('路径分隔符:', path.sep);
console.log('环境变量 PATH 分隔符:', path.delimiter);

// --- Demo 4：第一个简单的 HTTP 服务器 ---
const http = require('http');

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  // 设置响应头
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  // 发送响应内容
  res.end('Hello from Node.js 服务器！\\n访问时间: ' + new Date().toLocaleString('zh-CN'));
});

// 监听 3000 端口
const PORT = 3000;
server.listen(PORT, () => {
  console.log('\\n=== HTTP 服务器已启动 ===');
  console.log(\`服务器运行在 http://localhost:\${PORT}/\`);
  console.log('打开浏览器访问上面的地址就能看到效果！');
  console.log('按 Ctrl+C 停止服务器');
});

// 注意：运行此文件后服务器会一直启动，这只是演示
// 如果不想启动服务器，可以注释掉上面 server.listen 那部分代码
`
  },
  {
    id: "n4-js-review",
    group: "第一部分 入门基础",
    icon: "📝",
    title: "JavaScript 基础回顾：Node.js 开发必备语法",
    content: `# JavaScript 基础回顾：Node.js 开发必备语法

Node.js 使用现代 JavaScript 语法（ES6+），本章我们回顾开发中最常用、最核心的语法特性。这些是你日常写 Node.js 代码的基石，务必熟练掌握。

---

## 一、变量声明：var、let、const 的区别

这是 JavaScript 历史上一个重要的演进，Node.js 开发中我们几乎不再使用 \`var\`。

### 1.1 作用域差异

| 关键字 | 作用域 | 是否可重复声明 | 是否可重新赋值 | 是否变量提升 |
|--------|--------|----------------|----------------|--------------|
| \`var\` | 函数作用域 | ✅ 是 | ✅ 是 | ✅ 是（值为 undefined） |
| \`let\` | 块级作用域 | ❌ 否 | ✅ 是 | ❌ 暂时性死区 |
| \`const\` | 块级作用域 | ❌ 否 | ❌ 否（引用类型内部可改） | ❌ 暂时性死区 |

### 1.2 最佳实践

- **默认使用 \`const\`**：除非你明确知道变量需要重新赋值
- **需要重新赋值时用 \`let\`**：例如循环计数器
- **永远不要用 \`var\`**：它有太多历史遗留问题

> ⚠️ **注意**：\`const\` 保证的是"引用不变"，不是"值不可变"。对于对象/数组，你仍然可以修改内部的属性或元素。

---

## 二、数据类型

JavaScript 共有 **8 种数据类型**，分为原始类型和引用类型：

### 2.1 原始类型（7种）

| 类型 | 说明 | typeof 结果 |
|------|------|-------------|
| \`string\` | 字符串 | "string" |
| \`number\` | 数字（整数、浮点数、NaN、Infinity） | "number" |
| \`boolean\` | 布尔值（true/false） | "boolean" |
| \`undefined\` | 未定义 | "undefined" |
| \`null\` | 空值 | "object"（这是历史bug） |
| \`symbol\` | 唯一值（ES6） | "symbol" |
| \`bigint\` | 大整数（ES2020） | "bigint" |

### 2.2 引用类型

- **Object**（包括普通对象、数组、函数、日期、正则等）
- \`typeof\` 对数组返回 "object"，对函数返回 "function"

### 2.3 typeof 运算符注意事项

\`\`\`javascript
typeof null === 'object';        // true，历史遗留问题
typeof [] === 'object';          // true，数组也是对象
typeof function(){} === 'function'; // true
typeof NaN === 'number';         // true
\`\`\`

要准确判断类型可以使用：
- \`Array.isArray()\` 判断数组
- \`Object.prototype.toString.call()\` 准确获取类型
- \`instanceof\` 判断实例

---

## 三、模板字符串（Template Literals）

使用反引号 \` \` 创建字符串，支持：

### 3.1 多行字符串

\`\`\`javascript
const multiLine = \`第一行
第二行
第三行\`;
\`\`\`

### 3.2 插值表达式

\`\`\`javascript
const name = 'Node.js';
const message = \`Hello, \${name}!\`; // "Hello, Node.js!"
\`\`\`

### 3.3 标签模板（Tagged Templates）

可以用函数"处理"模板字符串，styled-components 等库就用了这个特性。

---

## 四、解构赋值（Destructuring）

解构是从数组或对象中提取值并赋给变量的简洁语法。

### 4.1 对象解构

\`\`\`javascript
const user = { name: '张三', age: 25, city: '北京' };

// 基本解构
const { name, age } = user;

// 重命名
const { name: userName, age: userAge } = user;

// 设置默认值
const { name, gender = '男' } = user;

// 嵌套解构
const { address: { city } } = { address: { city: '上海' } };
\`\`\`

### 4.2 数组解构

\`\`\`javascript
const arr = [1, 2, 3];
const [a, b, c] = arr;

// 跳过元素
const [first, , third] = arr;

// 剩余元素
const [head, ...tail] = arr; // tail = [2, 3]

// 交换变量（经典用法）
let x = 1, y = 2;
[x, y] = [y, x];
\`\`\`

### 4.3 函数参数解构

\`\`\`javascript
function printUser({ name, age }) {
  console.log(\`\${name} 今年 \${age} 岁\`);
}
\`\`\`

---

## 五、展开/剩余运算符（...）

三个点 \`...\` 在不同场景下有两种作用：

### 5.1 展开运算符（Spread）

把数组/对象"展开"：

\`\`\`javascript
// 数组合并
const arr1 = [1, 2];
const arr2 = [3, 4];
const combined = [...arr1, ...arr2]; // [1, 2, 3, 4]

// 对象合并（浅拷贝）
const obj1 = { a: 1 };
const obj2 = { b: 2 };
const merged = { ...obj1, ...obj2 }; // { a: 1, b: 2 }

// 字符串转数组
const chars = [...'hello']; // ['h', 'e', 'l', 'l', 'o']
\`\`\`

### 5.2 剩余运算符（Rest）

把剩余的元素"收集"起来：

\`\`\`javascript
// 函数剩余参数
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3); // [1, 2, 3]

// 解构剩余
const [first, ...rest] = [1, 2, 3, 4];
const { a, ...others } = { a: 1, b: 2, c: 3 };
\`\`\`

---

## 六、箭头函数

箭头函数是 ES6 引入的更简洁的函数写法。

### 6.1 基本语法

\`\`\`javascript
// 传统函数
const add = function(a, b) {
  return a + b;
};

// 箭头函数
const add = (a, b) => {
  return a + b;
};

// 单表达式可省略大括号和 return
const add = (a, b) => a + b;

// 单个参数可省略括号
const square = x => x * x;
\`\`\`

### 6.2 箭头函数 vs 普通函数的关键区别

| 特性 | 普通函数 | 箭头函数 |
|------|----------|----------|
| \`this\` | 调用时确定 | **定义时确定**，继承外层 this |
| \`arguments\` | 有 | 没有（用 rest 参数替代） |
| \`new\` 调用 | 可以作为构造函数 | **不能**用 new 调用 |
| \`prototype\` | 有 | 没有 |

> 💡 **最重要的一点**：箭头函数不绑定自己的 \`this\`，它会从外层作用域"继承"this。这在回调函数中特别有用，可以避免 \`const self = this\` 或 \`.bind(this)\` 这样的写法。

---

## 七、对象简写语法

ES6 提供了更简洁的对象字面量写法：

\`\`\`javascript
const name = '张三';
const age = 25;

// ES5 写法
const user = {
  name: name,
  age: age,
  sayHello: function() { ... }
};

// ES6 简写
const user = {
  name,  // 等同于 name: name
  age,   // 等同于 age: age
  sayHello() { ... }  // 方法简写
};
\`\`\`

---

## 八、可选链（?.）与空值合并（??）

ES2020 新增的两个极其实用的运算符。

### 8.1 可选链 ?.

安全地访问深层嵌套属性，不用再写一长串 \`&&\` 判断：

\`\`\`javascript
// 以前的写法
const city = user && user.address && user.address.city;

// 现在的写法
const city = user?.address?.city;

// 如果中间某个值是 null/undefined，直接返回 undefined，不会报错
\`\`\`

还可用于：
- \`obj?.method?.()\` - 可选函数调用
- \`arr?.[0]\` - 可选数组访问

### 8.2 空值合并运算符 ??

只在左侧是 \`null\` 或 \`undefined\` 时才使用右侧的默认值：

\`\`\`javascript
const value = null ?? '默认值'; // '默认值'
const value2 = 0 ?? '默认值';   // 0（因为 0 不是 null/undefined）
const value3 = '' ?? '默认值';  // ''（空字符串也不是）

// 对比 || 运算符
const value4 = 0 || '默认值';   // '默认值'（0 是 falsy 值）
\`\`\`

> ⚠️ **区别**：\`||\` 会在所有 falsy 值（0, '', false, NaN, null, undefined）时取右侧；\`??\` 只在 null/undefined 时取右侧。

---

## 九、其他常用语法

### 9.1 for...of 循环

遍历数组、字符串、Map、Set 等可迭代对象：

\`\`\`javascript
for (const item of [1, 2, 3]) {
  console.log(item);
}
\`\`\`

### 9.2 Array 常用方法

| 方法 | 作用 | 是否改变原数组 |
|------|------|----------------|
| \`map()\` | 转换每个元素，返回新数组 | ❌ |
| \`filter()\` | 过滤元素，返回新数组 | ❌ |
| \`reduce()\` | 累积计算，返回单值 | ❌ |
| \`forEach()\` | 遍历每个元素 | ❌ |
| \`find()\` | 找第一个满足条件的元素 | ❌ |
| \`some()\` | 是否有元素满足条件 | ❌ |
| \`every()\` | 是否所有元素满足条件 | ❌ |
| \`includes()\` | 是否包含某元素 | ❌ |
| \`push/pop/shift/unshift\` | 增删元素 | ✅ |
| \`splice()\` | 插入/删除/替换 | ✅ |
| \`slice()\` | 截取子数组 | ❌ |

### 9.3 Promise 与 async/await

这是异步编程的核心，我们会在后面的章节深入讲解。
`,
    code: `// ============================================
// JavaScript 基础语法综合演示
// ============================================

console.log('=== 1. let/const 演示 ===');
// 块级作用域演示
{
  var a = 1;
  let b = 2;
  const c = 3;
}
console.log('var 在块外可以访问:', a); // 1
// console.log(b); // 报错，b is not defined
// console.log(c); // 报错，c is not defined

// const 对象内部可以修改
const user = { name: '张三' };
user.name = '李四';
user.age = 25;
console.log('const 对象可修改属性:', user);

// const 数组也可以修改元素
const arr = [1, 2, 3];
arr.push(4);
console.log('const 数组可修改元素:', arr);
// arr = [5, 6]; // 报错，不能重新赋值

// --- Demo 分割线 ---

console.log('\\n=== 2. 数据类型与 typeof ===');
const types = {
  str: 'hello',
  num: 42,
  bool: true,
  undef: undefined,
  nul: null,
  sym: Symbol('id'),
  bigint: 9007199254740993n,
  arr: [1, 2, 3],
  obj: { key: 'value' },
  func: function() {}
};
for (const [key, val] of Object.entries(types)) {
  console.log(\`typeof \${key}:\`, typeof val);
}
console.log('Array.isArray([1,2,3]):', Array.isArray([1, 2, 3]));
console.log('null === null:', null === null);

// --- Demo 分割线 ---

console.log('\\n=== 3. 模板字符串 ===');
const name = 'Node.js';
const version = 20;
const template = \`欢迎学习 \${name}！
当前版本是 v\${version}
1 + 1 = \${1 + 1}\`;
console.log(template);

// --- Demo 分割线 ---

console.log('\\n=== 4. 解构赋值 ===');
// 对象解构
const person = { userName: '王五', age: 30, city: '深圳', job: '程序员' };
const { userName, age: personAge, ...restInfo } = person;
console.log('解构重命名:', userName, personAge);
console.log('剩余属性:', restInfo);

// 数组解构与交换
let x = 10, y = 20;
console.log('交换前:', x, y);
[x, y] = [y, x];
console.log('交换后:', x, y);

// 函数参数解构默认值
function createServer({ host = 'localhost', port = 3000 } = {}) {
  console.log(\`服务器地址: http://\${host}:\${port}\`);
}
createServer({ port: 8080 });
createServer();

// --- Demo 分割线 ---

console.log('\\n=== 5. 展开运算符 ... ===');
// 数组合并与浅拷贝
const arr1 = [1, 2, 3];
const arr2 = [4, 5];
const combined = [0, ...arr1, ...arr2, 6];
console.log('数组合并:', combined);
const arrCopy = [...arr1];
arrCopy[0] = 999;
console.log('原数组不受影响:', arr1);

// 对象合并
const defaults = { timeout: 5000, retry: 3 };
const custom = { retry: 5, debug: true };
const config = { ...defaults, ...custom };
console.log('对象合并(后者覆盖前者):', config);

// 剩余参数
function multiply(multiplier, ...nums) {
  return nums.map(n => n * multiplier);
}
console.log('剩余参数:', multiply(2, 1, 2, 3, 4));

// --- Demo 分割线 ---

console.log('\\n=== 6. 箭头函数与 this ===');
// 箭头函数简洁写法
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log('map:', doubled);
console.log('filter:', evens);
console.log('reduce sum:', sum);

// 箭头函数继承外层 this
const counter = {
  count: 0,
  start() {
    // 普通函数作为回调，this 会丢失
    setInterval(function() {
      // this 在这里不是 counter 对象
      // console.log(this.count); // NaN
    }, 1000);
    
    // 箭头函数继承外层 this（即 counter 对象）
    setInterval(() => {
      this.count++;
      // console.log('计数:', this.count);
    }, 1000);
  }
};
console.log('箭头函数可以正确捕获 this（setTimeout 示例见代码）');

// --- Demo 分割线 ---

console.log('\\n=== 7. 对象简写 ===');
const id = 1001;
const title = 'JavaScript 教程';
const price = 99;

const book = {
  id,
  title,
  price,
  getInfo() {
    return \`《\${this.title}》 价格: ¥\${this.price}\`;
  }
};
console.log(book.getInfo());

// --- Demo 分割线 ---

console.log('\\n=== 8. 可选链 ?. 与空值合并 ?? ===');
const data = {
  user: {
    profile: {
      // address: { city: '杭州' }
    }
  }
};

// 安全访问，不会报错
console.log('安全访问深层属性:', data?.user?.profile?.address?.city);

// ?? 只在 null/undefined 时用默认值
console.log('null ?? 默认:', null ?? '默认值');
console.log('0 ?? 默认:', 0 ?? '默认值');
console.log('空字符串 ?? 默认:', '' ?? '默认值');
console.log('false ?? 默认:', false ?? '默认值');
console.log('|| 对比 0:', 0 || '默认值');

// --- Demo 分割线 ---

console.log('\\n=== 9. 数组方法链 ===');
const orders = [
  { id: 1, amount: 100, status: 'paid' },
  { id: 2, amount: 200, status: 'pending' },
  { id: 3, amount: 150, status: 'paid' },
  { id: 4, amount: 300, status: 'cancelled' }
];

// 找出已支付订单的金额总和
const paidTotal = orders
  .filter(o => o.status === 'paid')
  .map(o => o.amount)
  .reduce((sum, amt) => sum + amt, 0);
console.log('已支付订单总金额:', paidTotal);

// 找出第一个金额大于 180 的订单
const bigOrder = orders.find(o => o.amount > 180);
console.log('大额订单:', bigOrder);

console.log('\\n✅ JavaScript 基础语法回顾完毕！');
`
  },
  {
    id: "n4-repl",
    group: "第一部分 入门基础",
    icon: "💻",
    title: "REPL 交互式环境：快速验证代码的利器",
    content: `# REPL 交互式环境：快速验证代码的利器

REPL 是 Node.js 自带的一个交互式编程环境，是学习和调试 JavaScript 的绝佳工具。

---

## 一、什么是 REPL？

REPL 是四个单词的缩写：

- **R**ead（读取）：读取用户输入的代码
- **E**val（执行）：执行读取到的代码
- **P**rint（打印）：打印执行结果
- **L**oop（循环）：循环等待下一次输入

> 💡 **类比理解**：REPL 就像是 JavaScript 的"草稿本"，你可以随时输入一小段代码，立即看到结果，就像在计算器上做算术题一样即时反馈。

---

## 二、启动与基本使用

### 2.1 启动 REPL

打开终端，直接输入：

\`\`\`bash
node
\`\`\`

你会看到类似这样的提示符：

\`\`\`
Welcome to Node.js v20.x.x.
Type ".help" for more information.
>
\`\`\`

这表示你已经进入了 REPL 环境。

### 2.2 基本使用

在 \`>\` 后面输入任意 JavaScript 表达式，按回车立即执行：

\`\`\`javascript
> 1 + 2
3
> 'Hello, ' + 'REPL!'
'Hello, REPL!'
> const x = 10;
undefined
> x * 5
50
\`\`\`

注意：\`const x = 10;\` 返回 \`undefined\`，这是因为变量声明语句本身没有返回值。

---

## 三、特殊命令（点命令）

REPL 提供了一系列以点 \`.\` 开头的特殊命令：

### 3.1 .help - 查看帮助

输入 \`.help\` 可以看到所有可用命令：

\`\`\`
> .help
.break    Sometimes you get stuck, this gets you out
.clear    Alias for .break
.editor   Enter editor mode
.exit     Exit the REPL
.help     Print this help message
.load     Load JS from a file into the REPL session
.save     Save all evaluated commands in this REPL session to a file
\`\`\`

### 3.2 .break / .clear - 跳出多行输入

如果你正在输入多行代码（比如一个函数），想取消重新来，按 \`Ctrl+C\` 或输入 \`.break\` / \`.clear\` 即可跳出。

### 3.3 .exit - 退出 REPL

退出 REPL 环境，也可以按两次 \`Ctrl+C\` 或 \`Ctrl+D\`。

### 3.4 .editor - 编辑器模式

输入 \`.editor\` 进入简易编辑器模式，可以粘贴或输入多行代码：

\`\`\`
> .editor
// 进入编辑模式（Ctrl+D 完成，Ctrl+C 取消）
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

fibonacci(10)
// 按 Ctrl+D 执行
55
\`\`\`

### 3.5 .save - 保存会话到文件

把当前 REPL 会话中输入的所有代码保存到文件：

\`\`\`
> .save ./my-repl-session.js
\`\`\`

### 3.6 .load - 加载文件到 REPL

把一个 JS 文件加载到当前 REPL 会话中执行：

\`\`\`
> .load ./some-script.js
\`\`\`

---

## 四、实用技巧

### 4.1 _ 变量：上一次的结果

在 REPL 中，特殊变量 \`_\`（下划线）保存着上一次表达式执行的结果：

\`\`\`javascript
> 10 + 20
30
> _ * 2
60
> _ + 5
65
> const arr = [1, 2, 3]
undefined
> arr.map(x => x * 10)
[10, 20, 30]
> _.reduce((a, b) => a + b)
60
\`\`\`

这个特性非常方便，可以基于上一步结果继续计算。

### 4.2 多行输入

REPL 会自动识别不完整的表达式并进入多行模式：

\`\`\`javascript
> function add(a, b) {
... return a + b;
... }
undefined
> add(3, 4)
7
\`\`\`

看到 \`...\` 提示符表示 REPL 正在等待你完成输入。

### 4.3 Tab 自动补全

按 \`Tab\` 键可以自动补全：
- 变量名、函数名
- 对象的属性和方法
- 全局对象的 API

\`\`\`javascript
> proc<Tab>
process      proc?
> process.ver<Tab>
process.version     process.versions
\`\`\`

按两次 Tab 会列出所有可能的补全选项。

### 4.4 访问全局对象

REPL 中可以直接访问所有 Node.js 全局对象和内置模块，无需 require：

\`\`\`javascript
> process.version
'v20.x.x'
> os.platform()
ReferenceError: os is not defined
// os 不是全局对象，需要 require
> const os = require('os')
undefined
> os.platform()
'darwin'
\`\`\`

> 💡 实际上，某些 REPL 环境下内置模块也可以直接访问，但为了代码可移植性，正式代码中请务必 require。

### 4.5 上下方向键 - 历史命令

按 ↑ 键可以浏览之前输入过的命令，按 ↓ 键往下翻。

---

## 五、REPL 中可用的全局变量

REPL 默认注入了一些常用的全局对象：

| 全局对象 | 说明 |
|----------|------|
| \`global\` / \`globalThis\` | 全局命名空间对象 |
| \`process\` | 进程对象，包含运行时信息 |
| \`console\` | 控制台输出 |
| \`Buffer\` | 二进制数据处理类 |
| \`setTimeout/setInterval\` | 定时器函数 |
| \`__dirname\` / \`__filename\` | ❌ REPL 中没有这两个变量 |
| \`module\` / \`require\` | ✅ REPL 中可以使用 require |

---

## 六、REPL 的典型使用场景

1. **快速验证想法**：想到一个算法或 API 用法，马上打开 REPL 试一下
2. **调试代码片段**：某段代码不确定对不对，贴进 REPL 跑跑看
3. **学习 Node.js API**：边查文档边在 REPL 中实验
4. **快速计算**：当作计算器使用，计算一些数值
5. **检查数据格式**：粘贴一段 JSON 进去看看解析结果

> ⚠️ **注意**：REPL 只是"草稿本"，正式的代码应该写在 .js 文件中。REPL 中的变量在退出后就丢失了。

---

## 七、自定义 REPL（进阶）

你甚至可以用代码创建自己定制化的 REPL 环境，Node.js 提供了 \`repl\` 模块可以实现这个功能。我们后面的章节会涉及。
`,
    code: `// ============================================
// REPL 特性演示脚本
// 注意：本脚本演示 REPL 中的各种操作
// 真正体验 REPL 需要在终端输入 "node" 进入交互环境
// 本文件中的代码等价于在 REPL 中逐行输入的内容
// ============================================

console.log('=== REPL 基础操作演示（代码版）===\\n');

// 在 REPL 中，你输入表达式后立即看到结果
// 这里我们用 console.log 模拟打印结果

// --- Demo 1：基本运算 ---
console.log('--- 1. 基本表达式 ---');
console.log('1 + 2 =', 1 + 2);
console.log('"Hello" + " Node.js" =', 'Hello' + ' Node.js');
console.log('Math.PI =', Math.PI);
console.log('Math.sqrt(16) =', Math.sqrt(16));

// --- Demo 2：变量与函数定义 ---
console.log('\\n--- 2. 定义变量和函数 ---');
const name = 'Node.js REPL';
const greet = (n) => \`你好，\${n}！\`;
console.log('变量 name =', name);
console.log('greet(name) =', greet(name));

// 模拟 _ 变量的行为
let _;
_ = 10 + 20;
console.log('\\n_ 保存上一次结果:', _);
_ = _ * 2;
console.log('_ * 2 =', _);
_ = _ + 5;
console.log('_ + 5 =', _);

// --- Demo 3：多行函数示例 ---
console.log('\\n--- 3. 多行函数（REPL 中自动识别续行）---');
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
console.log('factorial(5) =', factorial(5));
console.log('factorial(10) =', factorial(10));

// --- Demo 4：对象探索与 Tab 补全模拟 ---
console.log('\\n--- 4. 对象探索（Tab 补全常用）---');
const sampleObj = {
  id: 1,
  name: '测试对象',
  data: [1, 2, 3],
  sayHi() { return 'Hi!'; },
  nested: {
    deep: '深层值'
  }
};
console.log('Object.keys(sampleObj):', Object.keys(sampleObj));
console.log('sampleObj 的所有属性名可以通过 Tab 键补全');
console.log('sampleObj.nested.deep =', sampleObj.nested.deep);

// --- Demo 5：使用内置模块（REPL 中直接 require）---
console.log('\\n--- 5. REPL 中使用 require 加载模块 ---');
const os = require('os');
const path = require('path');

console.log('os.hostname() =', os.hostname());
console.log('os.cpus().length =', os.cpus().length, '核');
console.log('path.join("a", "b", "c.txt") =', path.join('a', 'b', 'c.txt'));

// --- Demo 6：探索 process 对象 ---
console.log('\\n--- 6. process 对象探索 ---');
console.log('process.version =', process.version);
console.log('process.platform =', process.platform);
console.log('process.versions.node =', process.versions.node);
console.log('process.versions.v8 =', process.versions.v8);

// --- Demo 7：JSON 解析（REPL 中常用）---
console.log('\\n--- 7. JSON 数据处理 ---');
const jsonStr = '{"name":"张三","age":25,"skills":["JS","Node.js"]}';
const parsed = JSON.parse(jsonStr);
console.log('解析 JSON:', parsed);
console.log('JSON.stringify(parsed) =', JSON.stringify(parsed));
console.log('格式化 JSON:\\n' + JSON.stringify(parsed, null, 2));

// --- Demo 8：.editor 模式示例（在 REPL 中输入 .editor 后粘贴以下代码）---
console.log('\\n--- 8. .editor 模式适合粘贴多行代码 ---');
console.log('在 REPL 中输入 .editor 可以粘贴大段代码，例如：');
console.log(\`
// .editor 模式下可以输入：
class Calculator {
  constructor() {
    this.result = 0;
  }
  add(n) { this.result += n; return this; }
  subtract(n) { this.result -= n; return this; }
  multiply(n) { this.result *= n; return this; }
  getResult() { return this.result; }
}

const calc = new Calculator();
calc.add(10).multiply(2).subtract(5);
// 按 Ctrl+D 得到结果
\`);

// 实际执行一下
class Calculator {
  constructor() { this.result = 0; }
  add(n) { this.result += n; return this; }
  subtract(n) { this.result -= n; return this; }
  multiply(n) { this.result *= n; return this; }
  getResult() { return this.result; }
}
const calc = new Calculator();
console.log('链式调用结果:', calc.add(10).multiply(2).subtract(5).getResult());

// --- Demo 9：REPL 特殊命令总结 ---
console.log('\\n=== REPL 特殊命令总结 ===');
console.log('.help     - 显示帮助');
console.log('.editor   - 进入编辑器模式，粘贴多行代码');
console.log('.save f.js - 保存当前会话到文件');
console.log('.load f.js - 加载文件到当前会话');
console.log('.break    - 中断当前输入（Ctrl+C）');
console.log('.clear    - 清除上下文（同 .break）');
console.log('.exit     - 退出 REPL（也可按 Ctrl+D 或两次 Ctrl+C）');
console.log('↑↓ 方向键  - 浏览历史命令');
console.log('Tab 键     - 自动补全');
console.log('_ 变量     - 保存上一次表达式的结果');

console.log('\\n💡 提示：请打开终端输入 "node" 亲自体验 REPL！');
`
  },
  {
    id: "n4-commonjs",
    group: "第一部分 入门基础",
    icon: "📦",
    title: "CommonJS 模块系统：require 与 module.exports",
    content: `# CommonJS 模块系统：require 与 module.exports

模块系统是 Node.js 最核心的特性之一。Node.js 采用 CommonJS 规范来组织代码，让我们能够把大型程序拆分成一个个小文件。

---

## 一、为什么需要模块？

想象一下，如果所有代码都写在一个文件里：
- 几千行甚至几万行代码，难以维护
- 变量都在全局作用域，容易命名冲突
- 无法复用代码
- 难以定位 bug

模块系统解决了这些问题：
- ✅ **代码拆分**：每个文件是一个模块，职责单一
- ✅ **作用域隔离**：每个模块有自己的作用域，变量不会污染全局
- ✅ **代码复用**：一个模块写好后可以在多处引用
- ✅ **依赖管理**：明确声明依赖关系

> 💡 **类比理解**：模块就像是乐高积木。每一块积木（模块）形状功能各异，但通过标准化的接口（require/exports）组合在一起，就能搭建出复杂的模型（应用程序）。

---

## 二、require() 函数

\`require()\` 是 CommonJS 中用来导入模块的函数。

### 2.1 require 的基本用法

\`\`\`javascript
// 引入内置模块
const fs = require('fs');
const path = require('path');

// 引入本地模块（注意路径必须以 ./ 或 ../ 开头）
const myModule = require('./my-module');
const utils = require('../utils/index');

// 引入 node_modules 中的第三方包
// const express = require('express');
\`\`\`

### 2.2 require 的路径解析规则

当你调用 \`require(x)\` 时，Node.js 按以下顺序解析：

1. **核心模块**（如 \`fs\`, \`path\`, \`http\`）：直接返回内置模块，优先级最高
2. **路径开头**为 \`./\` \`../\` \`/\`：当作文件路径查找
   - 先找 exact 文件：\`x\`
   - 依次尝试加扩展名：\`x.js\`, \`x.json\`, \`x.node\`
   - 如果是目录，找 \`x/package.json\` 中的 \`main\` 字段
   - 如果没有 package.json，找 \`x/index.js\`
3. **node_modules**：从当前目录开始向上逐级查找 \`node_modules\` 目录

### 2.3 require 是同步的！

重要特点：\`require\` 是**同步**加载模块的。模块在第一次被 require 时执行，之后会被缓存。

---

## 三、module.exports 与 exports

每个模块内部都有一个特殊的对象 \`module\`，代表当前模块本身。\`module.exports\` 是这个模块对外导出的内容。

### 3.1 module.exports - 真正的导出对象

\`\`\`javascript
// math.js
function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }

// 导出一个对象
module.exports = {
  add,
  subtract,
  PI: 3.14159
};
\`\`\`

\`\`\`javascript
// main.js
const math = require('./math');
console.log(math.add(1, 2));      // 3
console.log(math.PI);             // 3.14159
\`\`\`

### 3.2 exports - 一个便捷的别名

为了方便，Node.js 提供了 \`exports\` 变量，它初始时指向 \`module.exports\`：

\`\`\`javascript
// 这样写是可以的，给 exports 添加属性
exports.add = function(a, b) { return a + b; };
exports.subtract = function(a, b) { return a - b; };
\`\`\`

### 3.3 ⚠️ 经典陷阱：不能直接给 exports 赋值！

\`\`\`javascript
// ❌ 错误！这样写 exports 不再指向 module.exports，导出会失效！
exports = {
  add: function() { ... },
  subtract: function() { ... }
};

// ✅ 正确：如果要导出整个对象，必须用 module.exports
module.exports = {
  add: function() { ... },
  subtract: function() { ... }
};

// ✅ 正确：给 exports 添加属性没问题
exports.add = function() { ... };
\`\`\`

**记忆要点**：require 返回的永远是 \`module.exports\` 指向的对象，而不是 \`exports\`。\`exports\` 只是一个快捷方式，如果你把它指向了新对象，就和 module.exports 断开关联了。

### 3.4 导出单个函数/类

你也可以导出一个函数或类，而不是对象：

\`\`\`javascript
// logger.js
module.exports = function log(message) {
  console.log(\`[\${new Date().toISOString()}] \${message}\`);
};

// 使用
const log = require('./logger');
log('Hello');
\`\`\`

---

## 四、模块缓存

模块在第一次被 require 后会被**缓存**起来，后续的 require 不会重新执行模块代码，而是直接返回缓存的对象。

\`\`\`javascript
// counter.js
let count = 0;
module.exports = {
  increment() { count++; },
  getCount() { return count; }
};

// main.js
const c1 = require('./counter');
c1.increment();
c1.increment();
const c2 = require('./counter'); // 不会重新执行 counter.js！
console.log(c2.getCount()); // 2，而不是 0！c1 和 c2 指向同一个对象
\`\`\`

### 4.1 清除缓存

缓存保存在 \`require.cache\` 对象中，你可以手动删除它来强制重新加载：

\`\`\`javascript
delete require.cache[require.resolve('./counter')];
const counter3 = require('./counter'); // 重新加载
\`\`\`

> ⚠️ 注意：生产环境中一般不要清除缓存，这主要用于开发工具或热重载场景。

---

## 五、模块包装器

Node.js 在执行模块代码之前，会把它包装在一个函数中：

\`\`\`javascript
(function(exports, require, module, __filename, __dirname) {
  // 你的模块代码实际上在这里！
  // 这就是为什么 require/exports/module/__dirname 能直接使用，
  // 以及为什么顶层 var 不会成为全局变量
});
\`\`\`

这就是为什么：
- 每个模块有自己的作用域
- \`exports\`, \`require\`, \`module\`, \`__filename\`, \`__dirname\` 这些变量"凭空出现"在每个模块中

---

## 六、__dirname 和 __filename

每个模块都有这两个特殊变量：

| 变量 | 含义 |
|------|------|
| \`__dirname\` | 当前模块所在目录的**绝对路径** |
| \`__filename\` | 当前模块文件的**绝对路径** |

\`\`\`javascript
console.log(__dirname);  // 例如 /Users/zhaoliangshun/my-project
console.log(__filename); // 例如 /Users/zhaoliangshun/my-project/app.js
\`\`\`

> ⚠️ **常见误区**：\`__dirname\` 不是当前工作目录！当前工作目录用 \`process.cwd()\` 获取。

---

## 七、循环依赖

CommonJS 模块可以循环引用（A require B，B 又 require A），Node.js 会做特殊处理，但结果可能出乎意料。

### 7.1 循环依赖发生了什么？

假设有 a.js 和 b.js：

\`\`\`javascript
// a.js
console.log('a 开始执行');
exports.done = false;
const b = require('./b');
console.log('在 a 中，b.done =', b.done);
exports.done = true;
console.log('a 执行完毕');

// b.js
console.log('b 开始执行');
exports.done = false;
const a = require('./a'); // 这里 a 还没执行完，拿到的是"未完成"的 exports
console.log('在 b 中，a.done =', a.done);
exports.done = true;
console.log('b 执行完毕');
\`\`\`

运行结果：
\`\`\`
a 开始执行
b 开始执行
在 b 中，a.done = false  ← b 拿到的是 a 的部分导出！
b 执行完毕
在 a 中，b.done = true
a 执行完毕
\`\`\`

### 7.2 如何避免循环依赖？

- 重构代码，提取公共模块
- 延迟 require（在函数内部 require 而不是顶层）
- 尽量避免循环依赖的设计

---

## 八、CommonJS 最佳实践

1. **模块顶部 require**：把所有 require 放在文件最前面
2. **const 声明**：用 \`const mod = require('mod')\`，不要重新赋值
3. **解构导入**：\`const { readFile } = require('fs')\`
4. **一个入口，多个出口**：通过 index.js 统一导出
5. **避免全局变量**：永远不要往 global 上挂东西
6. **区分模块类型**：核心模块 / 文件模块 / 第三方包
`,
    code: `// ============================================
// CommonJS 模块系统综合演示
// 注意：本文件演示 CommonJS 的各种用法
// 因为模块需要多个文件才能完整演示 require 关系，
// 这里我们创建临时模块来模拟，或者用内联方式说明
// ============================================

const fs = require('fs');
const path = require('path');
const os = require('os');
const Module = require('module');

console.log('=== 1. 模块包装器演示 ===');
// Node.js 内部会把模块包装在一个函数里
// 我们可以通过 module.constructor.wrap 看到包装器源码
console.log('模块包装器函数开头:', Module.wrap.toString().slice(0, 200) + '...');

console.log('\\n当前模块 __filename:', __filename);
console.log('当前模块 __dirname:', __dirname);
console.log('module.id:', module.id);
console.log('module.paths:', module.paths);

// --- Demo 分割线 ---

console.log('\\n=== 2. 创建临时文件演示模块导出模式 ===');

// 创建临时目录来存放示例模块
const tmpDir = path.join(os.tmpdir(), 'nodejs-commonjs-demo-' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

// --- Demo 2.1：导出对象（给 exports 添加属性）---
const math1Content = \`
// math1.js - 使用 exports.xxx 方式导出
exports.add = function(a, b) {
  return a + b;
};
exports.subtract = function(a, b) {
  return a - b;
};
exports.PI = 3.14159265359;
exports.multiply = (a, b) => a * b;
\`;
const math1Path = path.join(tmpDir, 'math1.js');
fs.writeFileSync(math1Path, math1Content);
const math1 = require(math1Path);
console.log('math1.add(2, 3) =', math1.add(2, 3));
console.log('math1.multiply(4, 5) =', math1.multiply(4, 5));
console.log('math1.PI =', math1.PI);

// --- Demo 2.2：用 module.exports 导出整个对象 ---
const math2Content = \`
// math2.js - 使用 module.exports = {} 导出
function divide(a, b) {
  if (b === 0) throw new Error('除数不能为0');
  return a / b;
}
function mod(a, b) {
  return a % b;
}
module.exports = {
  divide,
  mod,
  VERSION: '1.0.0'
};
\`;
const math2Path = path.join(tmpDir, 'math2.js');
fs.writeFileSync(math2Path, math2Content);
const math2 = require(math2Path);
console.log('\\nmath2.divide(10, 3) =', math2.divide(10, 3).toFixed(4));
console.log('math2.mod(10, 3) =', math2.mod(10, 3));
console.log('math2.VERSION =', math2.VERSION);

// --- Demo 2.3：导出单个函数 ---
const loggerContent = \`
// logger.js - 导出一个函数
module.exports = function log(message, level = 'INFO') {
  const timestamp = new Date().toLocaleTimeString('zh-CN');
  const colors = {
    INFO: '\\x1b[36m',
    WARN: '\\x1b[33m',
    ERROR: '\\x1b[31m',
    RESET: '\\x1b[0m'
  };
  console.log(colors[level] + '[' + timestamp + '] [' + level + '] ' + message + colors.RESET);
};
\`;
const loggerPath = path.join(tmpDir, 'logger.js');
fs.writeFileSync(loggerPath, loggerContent);
const logger = require(loggerPath);
logger('这是一条日志消息');
logger('这是警告', 'WARN');

// --- Demo 分割线 ---

console.log('\\n=== 3. 模块缓存演示 ===');
const counterContent = \`
// counter.js
let count = 0;
console.log('  [counter.js 正在执行初始化]');
module.exports = {
  increment() { count++; },
  getCount() { return count; },
  reset() { count = 0; }
};
\`;
const counterPath = path.join(tmpDir, 'counter.js');
fs.writeFileSync(counterPath, counterContent);

console.log('第一次 require counter:');
const c1 = require(counterPath);
c1.increment();
c1.increment();
console.log('c1.getCount() =', c1.getCount());

console.log('第二次 require counter（不会重新执行）:');
const c2 = require(counterPath);
console.log('c2.getCount() =', c2.getCount(), '(拿到的是缓存！)');
console.log('c1 === c2:', c1 === c2);

console.log('清除缓存后重新 require:');
delete require.cache[counterPath];
const c3 = require(counterPath);
console.log('c3.getCount() =', c3.getCount(), '(重新加载，count 从0开始)');

// --- Demo 分割线 ---

console.log('\\n=== 4. exports 赋值陷阱演示 ===');
const badExportsContent = \`
// bad-exports.js - 错误的写法
exports = {
  hello: function() { return 'Hello!'; },
  value: 42
};
// 上面直接给 exports 赋值，断开了和 module.exports 的联系
// module.exports 仍然是原来的空对象！
\`;
const badPath = path.join(tmpDir, 'bad-exports.js');
fs.writeFileSync(badPath, badExportsContent);
const badMod = require(badPath);
console.log('错误写法导出的结果:', badMod); // {} 空对象！
console.log('badMod.hello:', badMod.hello); // undefined

const goodExportsContent = \`
// good-exports.js - 正确的写法
module.exports = {
  hello: function() { return 'Hello!'; },
  value: 42
};
\`;
const goodPath = path.join(tmpDir, 'good-exports.js');
fs.writeFileSync(goodPath, goodExportsContent);
const goodMod = require(goodPath);
console.log('正确写法导出的结果:', goodMod);
console.log('goodMod.hello():', goodMod.hello());

// --- Demo 分割线 ---

console.log('\\n=== 5. 循环依赖演示 ===');
const aContent = \`
console.log('    a.js 开始执行');
exports.done = false;
exports.name = 'module A';
const b = require('./circular-b');
console.log('    在 a.js 中，b.done =', b.done, ', b.name =', b.name);
exports.done = true;
console.log('    a.js 执行完毕');
\`;
const bContent = \`
console.log('    b.js 开始执行');
exports.done = false;
exports.name = 'module B';
const a = require('./circular-a');
console.log('    在 b.js 中，a.done =', a.done, ', a.name =', a.name);
exports.done = true;
console.log('    b.js 执行完毕');
\`;
const aPath = path.join(tmpDir, 'circular-a.js');
const bPath = path.join(tmpDir, 'circular-b.js');
fs.writeFileSync(aPath, aContent);
fs.writeFileSync(bPath, bContent);
// 清除可能存在的缓存
delete require.cache[aPath];
delete require.cache[bPath];
console.log('加载循环依赖模块 circular-a:');
const circularA = require(aPath);
console.log('最终 circularA.done =', circularA.done);

// --- Demo 分割线 ---

console.log('\\n=== 6. require 解析顺序演示 ===');
console.log('require 解析优先级:');
console.log('1. 核心内置模块（fs, path, http 等）- 最高优先级');
console.log('2. 以 ./ ../ / 开头的文件路径');
console.log('3. node_modules 目录（逐级向上查找）');
console.log('');
console.log('文件查找顺序:');
console.log('1. 精确文件名');
console.log('2. 加上 .js 扩展名');
console.log('3. 加上 .json 扩展名');
console.log('4. 加上 .node 扩展名');
console.log('5. 如果是目录，查找 package.json 的 main 字段');
console.log('6. 如果没有 package.json，查找 index.js');

// 查看 require.resolve 解析的路径
console.log('\\nrequire.resolve("fs") =', require.resolve('fs'));
console.log('require.resolve("path") =', require.resolve('path'));

// --- Demo 分割线 ---

console.log('\\n=== 7. JSON 模块加载 ===');
const jsonContent = JSON.stringify({
  name: 'commonjs-demo',
  version: '1.0.0',
  description: 'CommonJS 演示项目',
  author: 'Node.js 学习者'
}, null, 2);
const jsonPath = path.join(tmpDir, 'package.json');
fs.writeFileSync(jsonPath, jsonContent);
const pkg = require(jsonPath); // require 可以直接加载 JSON！
console.log('加载的 JSON 内容:', pkg);

// 清理临时文件
setTimeout(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}, 100);

console.log('\\n✅ CommonJS 模块系统演示完成！');
`
  },
  {
    id: "n4-esm",
    group: "第一部分 入门基础",
    icon: "🔄",
    title: "ES Modules：import/export 现代模块规范",
    content: `# ES Modules：import/export 现代模块规范

ES Modules（简称 ESM）是 JavaScript 官方的标准化模块系统，从 ES6（ES2015）开始引入，现在已经成为 Node.js 和浏览器的通用模块方案。

---

## 一、CommonJS vs ESM：为什么需要 ESM？

CommonJS 是 Node.js 特有的模块规范，而 ESM 是语言标准。两者的核心差异：

| 特性 | CommonJS | ES Modules |
|------|----------|------------|
| **语法** | \`require()\` / \`module.exports\` | \`import\` / \`export\` |
| **加载方式** | 同步加载 | 异步加载（顶层） |
| **静态分析** | 动态，难以静态分析 | **静态**，可在编译时分析依赖 |
| **Tree Shaking** | 难以支持 | ✅ 原生支持 |
| **顶层 this** | 指向当前模块 | \`undefined\` |
| **执行时机** | 运行时加载 | 编译时确定接口 |
| **浏览器支持** | 不支持（需要打包工具） | ✅ 原生支持（<script type="module">） |
| **顶级 await** | ❌ 不支持 | ✅ 支持 |

> 💡 **为什么静态结构很重要？** 因为静态结构让打包工具（如 webpack、Rollup）可以在构建时分析出哪些代码被用到了、哪些没用到（Tree Shaking），从而删除未使用的代码，减小包体积。

---

## 二、如何启用 ESM？

Node.js 默认使用 CommonJS，你需要通过以下方式告诉 Node.js 使用 ESM：

### 方式一：package.json 中设置 type: "module"（推荐）

在项目根目录的 package.json 中添加：

\`\`\`json
{
  "type": "module"
}
\`\`\`

设置后，项目中所有 \`.js\` 文件都会被当作 ESM 处理。

### 方式二：使用 .mjs 扩展名

将文件保存为 \`.mjs\` 后缀，Node.js 会始终把它当作 ESM 处理，不管 package.json 怎么写。

> 对应的，如果设置了 \`"type": "module"\`，但某个文件想用 CommonJS，可以命名为 \`.cjs\`。

### 方式三：命令行参数（较少用）

\`\`\`bash
node --input-type=module -e "import('./mod.mjs')"
\`\`\`

---

## 三、export：导出模块内容

ESM 提供了两种导出方式：**命名导出**和**默认导出**。

### 3.1 命名导出（Named Exports）

可以导出多个命名的值：

\`\`\`javascript
// math.js
// 方式1：在声明时导出
export const PI = 3.14159;
export function add(a, b) {
  return a + b;
}
export class Calculator {
  // ...
}

// 方式2：统一导出（推荐，清晰看到导出了什么）
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
export { subtract, multiply };
\`\`\`

### 3.2 默认导出（Default Export）

每个模块可以有**一个**默认导出：

\`\`\`javascript
// logger.js
export default function log(message) {
  console.log(message);
}

// 或者
class Logger {
  // ...
}
export default Logger;
\`\`\`

一个模块可以同时有命名导出和默认导出。

### 3.3 重命名导出

导出时可以用 \`as\` 重命名：

\`\`\`javascript
const internalValue = 42;
export { internalValue as VALUE };

// 还可以转发其他模块的导出
export { add, subtract } from './math.js';
export * from './utils.js'; // 转发所有命名导出
export { default as Logger } from './logger.js';
\`\`\`

---

## 四、import：导入模块

### 4.1 导入命名导出

\`\`\`javascript
import { add, PI } from './math.js';
console.log(add(1, 2)); // 3
console.log(PI); // 3.14159
\`\`\`

### 4.2 导入默认导出

\`\`\`javascript
import log from './logger.js';
log('Hello!');
\`\`\`

### 4.3 同时导入默认和命名导出

\`\`\`javascript
import Logger, { format } from './logger.js';
\`\`\`

### 4.4 重命名导入

\`\`\`javascript
import { add as mathAdd, PI as MathPI } from './math.js';
\`\`\`

### 4.5 命名空间导入

把所有导出加载到一个对象上：

\`\`\`javascript
import * as math from './math.js';
math.add(1, 2);
math.PI;
math.subtract(5, 3);
\`\`\`

### 4.6 仅导入副作用

有些模块只是为了执行副作用（比如添加 polyfill），不需要导入具体值：

\`\`\`javascript
import './polyfills.js';
\`\`\`

---

## 五、ESM 中的重要区别

### 5.1 没有 __dirname 和 __filename！

ESM 中不存在 \`__dirname\` 和 \`__filename\`，需要通过 \`import.meta.url\` 自己构造：

\`\`\`javascript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
\`\`\`

\`import.meta.url\` 返回当前模块的 file:// URL，例如 \`file:///Users/xxx/project/app.js\`。

### 5.2 没有 require、exports、module.exports

这些都是 CommonJS 的变量，在 ESM 中不存在。要用 import/export。

### 5.3 不能导入 JSON 文件（直接 import）

ESM 中直接 \`import config from './config.json'\` 默认是不支持的，需要用：

\`\`\`javascript
import { readFileSync } from 'fs';
const config = JSON.parse(readFileSync('./config.json', 'utf8'));

// 或者用 import assertions（实验性）
// import config from './config.json' assert { type: 'json' };
\`\`\`

### 5.4 顶层 await

ESM 支持在模块顶层使用 await，不需要包裹在 async 函数中：

\`\`\`javascript
// top-level-await.js
const data = await fetch('https://api.example.com/data');
const json = await data.json();
export { json };
\`\`\`

> 💡 顶层 await 会让模块变成"异步模块"，导入它的模块会等待它执行完毕。

---

## 六、动态 import()

除了顶层的静态 \`import\`，ESM 还支持动态导入：

\`\`\`javascript
// 动态导入，返回 Promise
const { add } = await import('./math.js');

// 常用于按需加载
if (needFeature) {
  const feature = await import('./feature.js');
  feature.init();
}
\`\`\`

动态 import 可以在 CommonJS 中使用，也可以在非模块环境中使用（返回 Promise）。

---

## 七、CommonJS 与 ESM 互操作

### 7.1 在 ESM 中导入 CommonJS

\`\`\`javascript
// ESM 中导入 CommonJS 模块
import pkg from 'commonjs-package'; // 默认导入对应 module.exports
import { someMethod } from 'commonjs-package'; // 如果是对象，也可以解构，但不稳定
\`\`\`

ESM 可以导入 CommonJS 模块，CommonJS 的 \`module.exports\` 会作为 ESM 的默认导出。

### 7.2 在 CommonJS 中导入 ESM

CommonJS 不能用 \`require()\` 直接导入 ESM 模块（因为 ESM 可能是异步的），必须用动态 import()：

\`\`\`javascript
// CommonJS 中
async function main() {
  const { default: esmModule, namedExport } = await import('esm-module');
}
\`\`\`

### 7.3 互操作最佳实践

- 新项目优先使用 ESM
- 如果要发布 npm 包，建议同时提供 CJS 和 ESM 双入口（使用 package.json 的 \`exports\` 字段）

---

## 八、package.json 中的 exports 字段

\`exports\` 字段是现代 Node.js 定义包入口的推荐方式，比旧的 \`main\` 字段更强大：

\`\`\`json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  }
}
\`\`\`
`,
    code: `// ============================================
// 注意：本文件是 .js 文件，如果当前项目不是 type: module
// 直接写 import/export 会报错。
// 这里我们用动态 import() 和创建临时 .mjs 文件的方式来演示 ESM 特性
// ============================================

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== ES Modules (ESM) 综合演示 ===\\n');

// 创建临时目录存放我们的 ESM 示例文件
const tmpDir = path.join(os.tmpdir(), 'nodejs-esm-demo-' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

// --- Demo 1：命名导出 ---
console.log('--- 1. 命名导出（Named Exports）---');
const mathEsm = \`
// math.mjs - 命名导出演示
// 方式1：声明时直接导出
export const PI = 3.14159265359;
export const E = 2.71828182846;

export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// 方式2：声明后统一导出（更清晰）
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;
export { multiply, divide };

export class Calculator {
  constructor() {
    this.result = 0;
  }
  add(n) { this.result += n; return this; }
  subtract(n) { this.result -= n; return this; }
  getResult() { return this.result; }
}
\`;
const mathPath = path.join(tmpDir, 'math.mjs');
fs.writeFileSync(mathPath, mathEsm);

// --- Demo 2：默认导出 ---
const loggerEsm = \`
// logger.mjs - 默认导出演示
const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

function formatTime() {
  return new Date().toLocaleTimeString('zh-CN');
}

// 默认导出一个函数
export default function log(message, level = 'INFO') {
  const prefix = '[' + formatTime() + '] [' + level + ']';
  console.log(prefix, message);
}

// 同时可以有命名导出
export { LOG_LEVELS };
\`;
const loggerPath = path.join(tmpDir, 'logger.mjs');
fs.writeFileSync(loggerPath, loggerEsm);

// --- Demo 3：导入演示脚本 ---
const importDemo = \`
// import-demo.mjs - 各种 import 语法演示

// 1. 导入命名导出
import { add, subtract, PI, Calculator } from './math.mjs';
console.log('add(2, 3) =', add(2, 3));
console.log('subtract(10, 4) =', subtract(10, 4));
console.log('PI =', PI);

const calc = new Calculator();
console.log('Calculator 链式调用:', calc.add(10).subtract(3).getResult());

// 2. 重命名导入
import { multiply as mul, divide as div } from './math.mjs';
console.log('multiply(4, 5) =', mul(4, 5));
console.log('divide(20, 4) =', div(20, 4));

// 3. 命名空间导入
import * as math from './math.mjs';
console.log('\\n命名空间导入 math.PI =', math.PI);
console.log('math.multiply(6, 7) =', math.multiply(6, 7));

// 4. 导入默认导出
import log from './logger.mjs';
log('这是通过默认导出导入的 logger');

// 5. 同时导入默认和命名导出
import defaultLog, { LOG_LEVELS } from './logger.mjs';
console.log('\\nLOG_LEVELS:', LOG_LEVELS);
defaultLog('同时导入默认和命名导出成功！', 'WARN');
\`;
const importDemoPath = path.join(tmpDir, 'import-demo.mjs');
fs.writeFileSync(importDemoPath, importDemo);

// 执行 import-demo.mjs
console.log('执行 import-demo.mjs:');
const { execSync } = require('child_process');
try {
  const output = execSync(\`node "\${importDemoPath}"\`, { encoding: 'utf8' });
  console.log(output);
} catch (e) {
  console.log('执行输出:', e.stdout);
  if (e.stderr) console.log('错误:', e.stderr);
}

// --- Demo 4：import.meta.url 替代 __dirname ---
console.log('--- 2. import.meta.url 与 __dirname ---');
const metaDemo = \`
// meta-demo.mjs - import.meta.url 演示
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('import.meta.url:', import.meta.url);
console.log('__filename (构造的):', __filename);
console.log('__dirname (构造的):', __dirname);
console.log('path.join 示例:', join(__dirname, 'subdir', 'file.txt'));
\`;
const metaDemoPath = path.join(tmpDir, 'meta-demo.mjs');
fs.writeFileSync(metaDemoPath, metaDemo);
const metaOutput = execSync(\`node "\${metaDemoPath}"\`, { encoding: 'utf8' });
console.log(metaOutput);

// --- Demo 5：顶级 await（Top-level await）---
console.log('--- 3. 顶级 await（Top-level await）---');
const awaitDemo = \`
// top-level-await.mjs - 顶级 await 演示
console.log('开始执行顶级 await 演示...');

// 模拟异步操作（比如读取文件、网络请求）
function delay(ms, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

// 顶级 await - 不需要 async 函数包裹！
console.log('等待 100ms...');
const result1 = await delay(100, '第一步完成');
console.log(result1);

console.log('再等待 100ms...');
const result2 = await delay(100, '第二步完成');
console.log(result2);

// 可以直接 await 动态导入
const math = await import('./math.mjs');
console.log('动态 import math.add(100, 200) =', math.add(100, 200));

export const finalResult = result2 + ' - 所有异步操作完成';
\`;
const awaitDemoPath = path.join(tmpDir, 'top-level-await.mjs');
fs.writeFileSync(awaitDemoPath, awaitDemo);
const awaitOutput = execSync(\`node "\${awaitDemoPath}"\`, { encoding: 'utf8' });
console.log(awaitOutput);

// --- Demo 6：动态 import() ---
console.log('--- 4. 动态 import() ---');
const dynamicDemo = \`
// dynamic-import.mjs - 动态导入演示
console.log('动态 import 演示');

// 条件加载
const needMath = true;
if (needMath) {
  console.log('按需加载 math 模块...');
  const { add, PI } = await import('./math.mjs');
  console.log('动态加载后 add(50, 60) =', add(50, 60));
  console.log('动态加载后 PI =', PI);
}

// 动态导入也可以在 CommonJS 中使用！
console.log('动态 import 返回的是 Promise，可以用 .then()');
import('./logger.mjs').then(({ default: logger }) => {
  logger('通过 .then() 方式调用动态导入的模块');
});

// 等待一下让上面的 setTimeout 日志打完
await new Promise(r => setTimeout(r, 50));
\`;
const dynamicDemoPath = path.join(tmpDir, 'dynamic-import.mjs');
fs.writeFileSync(dynamicDemoPath, dynamicDemo);
const dynamicOutput = execSync(\`node "\${dynamicDemoPath}"\`, { encoding: 'utf8' });
console.log(dynamicOutput);

// --- Demo 7：模块转发（Re-export）---
console.log('--- 5. 模块转发（Re-export）---');
const reexportIndex = \`
// reexport-index.mjs - 统一导出入口
// 方式1：转发特定导出
export { add, subtract, PI } from './math.mjs';

// 方式2：转发所有命名导出（不包括默认导出）
export * from './math.mjs';

// 方式3：转发默认导出并重命名
export { default as log } from './logger.mjs';
\`;
const indexPath = path.join(tmpDir, 'reexport-index.mjs');
fs.writeFileSync(indexPath, reexportIndex);

const reexportDemo = \`
import { add, PI, log, multiply } from './reexport-index.mjs';
console.log('从统一入口导入 add:', add(1000, 2000));
console.log('从统一入口导入 PI:', PI);
console.log('从统一入口导入 multiply:', multiply(3, 33));
log('从统一入口导入的 log 函数正常工作！');
\`;
const reexportDemoPath = path.join(tmpDir, 'reexport-demo.mjs');
fs.writeFileSync(reexportDemoPath, reexportDemo);
const reexportOutput = execSync(\`node "\${reexportDemoPath}"\`, { encoding: 'utf8' });
console.log(reexportOutput);

// --- Demo 8：ESM 与 CJS 差异总结 ---
console.log('--- 6. ESM vs CommonJS 主要差异 ---');
console.log('┌─────────────────────┬──────────────────┬──────────────────┐');
console.log('│ 特性                │ CommonJS         │ ES Modules       │');
console.log('├─────────────────────┼──────────────────┼──────────────────┤');
console.log('│ 导入语法            │ require()        │ import           │');
console.log('│ 导出语法            │ module.exports   │ export           │');
console.log('│ 加载方式            │ 同步             │ 异步（可异步）   │');
console.log('│ 顶级 await          │ ❌ 不支持        │ ✅ 支持          │');
console.log('│ Tree Shaking        │ 困难             │ 原生支持         │');
console.log('│ __dirname/__filename│ ✅ 有            │ ❌ 需要自己构造  │');
console.log('│ this (顶层)         │ module.exports   │ undefined        │');
console.log('│ 严格模式            │ 默认不启用       │ 默认启用         │');
console.log('│ 浏览器原生支持      │ ❌               │ ✅ <script type="module">');
console.log('└─────────────────────┴──────────────────┴──────────────────┘');

// 清理临时文件
setTimeout(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}, 100);

console.log('\\n💡 提示：ESM 是 JavaScript 的官方模块标准，新项目推荐使用！');
console.log('✅ ES Modules 演示完成！');
`
  },
  {
    id: "n4-global-process",
    group: "第一部分 入门基础",
    icon: "🌍",
    title: "全局对象与 process：Node.js 的运行时环境",
    content: `# 全局对象与 process：Node.js 的运行时环境

Node.js 提供了一些全局可用的对象和变量，其中最重要的是 \`process\`，它代表当前运行的 Node.js 进程。

---

## 一、全局对象

### 1.1 globalThis：标准的全局对象

\`globalThis\` 是 ES2020 引入的标准全局对象，在任何环境（浏览器、Node.js、Web Worker）都指向全局作用域：

| 环境 | globalThis 指向 |
|------|----------------|
| 浏览器 | \`window\` |
| Node.js | \`global\` |
| Web Worker | \`self\` |

### 1.2 global：Node.js 专属全局对象

Node.js 中 \`global\` 是全局命名空间对象，类似于浏览器的 \`window\`。

> ⚠️ **最佳实践：不要使用全局变量！** 往 \`global\` 上挂载属性会造成命名冲突、依赖隐式、难以测试。模块系统已经帮我们解决了作用域问题，不要回到全局变量的老路。

### 1.3 Node.js 中的全局变量

| 变量 | 说明 | 可用范围 |
|------|------|----------|
| \`process\` | 当前进程对象 | ✅ 全局 |
| \`console\` | 控制台输出 | ✅ 全局 |
| \`Buffer\` | 二进制数据处理类 | ✅ 全局 |
| \`setTimeout/setInterval/setImmediate\` | 定时器 | ✅ 全局 |
| \`clearTimeout/clearInterval/clearImmediate\` | 清除定时器 | ✅ 全局 |
| \`__dirname\` | 当前模块目录路径 | ❌ 仅 CommonJS 模块内 |
| \`__filename\` | 当前模块文件路径 | ❌ 仅 CommonJS 模块内 |
| \`require/module/exports\` | CommonJS 模块API | ❌ 仅 CommonJS 模块内 |

---

## 二、process 对象深度解析

\`process\` 对象是 Node.js 的核心，提供了当前 Node.js 进程的信息和控制能力。

### 2.1 版本与环境信息

| 属性 | 说明 |
|------|------|
| \`process.version\` | Node.js 版本字符串，如 'v20.0.0' |
| \`process.versions\` | 包含各组件版本（node, v8, uv, zlib 等） |
| \`process.platform\` | 运行平台：'darwin'(macOS), 'win32', 'linux' |
| \`process.arch\` | CPU 架构：'x64', 'arm64' 等 |
| \`process.release\` | 发布信息（lts 版本名称等） |

### 2.2 process.env：环境变量

\`process.env\` 是一个包含用户环境信息的对象，常用于配置应用。

\`\`\`javascript
// 读取环境变量
console.log(process.env.NODE_ENV); // 'production' / 'development'
console.log(process.env.PATH);     // 系统 PATH
console.log(process.env.HOME);     // 用户主目录
console.log(process.env.USER);     // 当前用户名

// 设置环境变量（仅当前进程有效）
process.env.PORT = '3000';
\`\`\`

**使用场景**：
- 区分开发/测试/生产环境（\`NODE_ENV\`）
- 配置端口、数据库连接地址
- 存储敏感信息（API Key、密钥）—— 不要硬编码在代码里！

### 2.3 process.argv：命令行参数

\`process.argv\` 是一个数组，包含启动 Node.js 进程时的命令行参数。

\`\`\`bash
node app.js arg1 arg2 --port=3000
\`\`\`

\`process.argv\` 的值：
- \`argv[0]\` - node 可执行文件路径
- \`argv[1]\` - 正在执行的脚本路径
- \`argv[2+]\` - 用户传入的参数

\`\`\`javascript
console.log(process.argv);
// [
//   '/usr/local/bin/node',
//   '/path/to/app.js',
//   'arg1',
//   'arg2',
//   '--port=3000'
// ]
\`\`\`

### 2.4 process.cwd() vs __dirname

| 方法/变量 | 含义 |
|-----------|------|
| \`process.cwd()\` | **当前工作目录**（执行 node 命令时所在的目录） |
| \`__dirname\` | **当前脚本文件所在目录**（文件的绝对路径） |

这两个经常搞混！cwd 可以改变（\`process.chdir()\`），但 __dirname 是固定的。

### 2.5 进程退出

\`\`\`javascript
// 退出进程，参数是退出码（0 表示成功，非0表示错误）
process.exit(0);       // 正常退出
process.exit(1);       // 异常退出

// 设置退出码，等进程自然退出
process.exitCode = 1;

// 监听进程退出事件
process.on('exit', (code) => {
  console.log('进程即将退出，退出码:', code);
  // 这里只能执行同步操作！
});
\`\`\`

### 2.6 process.nextTick()

\`process.nextTick()\` 将回调函数放到"当前执行栈末尾、下一次事件循环之前"执行：

\`\`\`javascript
console.log('1');
process.nextTick(() => {
  console.log('3 - nextTick');
});
console.log('2');
// 输出顺序：1, 2, 3 - nextTick
\`\`\`

nextTick 的回调优先级高于 Promise microtask，高于 setTimeout。

### 2.7 标准输入输出流

| 属性 | 说明 | 对应系统流 |
|------|------|------------|
| \`process.stdin\` | 标准输入流（可读） | stdin (fd 0) |
| \`process.stdout\` | 标准输出流（可写） | stdout (fd 1) |
| \`process.stderr\` | 标准错误流（可写） | stderr (fd 2) |

\`console.log\` 内部就是写 \`process.stdout\`，\`console.error\` 写 \`process.stderr\`。

### 2.8 进程事件

\`process\` 是 EventEmitter 实例，可以监听重要事件：

\`\`\`javascript
// 捕获未处理的异常（防止进程崩溃）
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  // 记录日志后优雅退出
  process.exit(1);
});

// 捕获未处理的 Promise rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise rejection:', reason);
});

// 进程退出
process.on('exit', (code) => { /* ... */ });

// 接收到信号（如 Ctrl+C 发送 SIGINT）
process.on('SIGINT', () => {
  console.log('收到 Ctrl+C，优雅退出...');
  process.exit(0);
});
\`\`\`

### 2.9 性能与资源使用

| 方法 | 说明 |
|------|------|
| \`process.memoryUsage()\` | 返回内存使用情况（rss, heapTotal, heapUsed, external） |
| \`process.uptime()\` | 进程已运行秒数 |
| \`process.hrtime()\` / \`process.hrtime.bigint()\` | 高精度计时（纳秒级） |
| \`process.cpuUsage()\` | CPU 使用时间 |

---

## 三、console 对象详解

console 不止有 \`log\`，还有很多实用方法：

| 方法 | 作用 |
|------|------|
| \`console.log()\` | 普通输出 |
| \`console.info()\` | 信息输出（同 log） |
| \`console.warn()\` | 警告输出（黄色） |
| \`console.error()\` | 错误输出（红色） |
| \`console.dir(obj, {depth: null})\` | 深度打印对象 |
| \`console.table(data)\` | 以表格形式打印数组/对象 |
| \`console.time(label)\` / \`console.timeEnd(label)\` | 计时 |
| \`console.trace()\` | 打印调用栈 |
| \`console.assert(condition, msg)\` | 条件不成立时输出错误 |
| \`console.count(label)\` | 计数器 |
| \`console.group()\` / \`console.groupEnd()\` | 分组缩进 |
`,
    code: `// ============================================
// process 对象与全局对象综合演示
// ============================================

const os = require('os');
const path = require('path');

console.log('=== 1. process 基本信息 ===\\n');
console.log('Node.js 版本:', process.version);
console.log('运行平台:', process.platform, '(darwin=macOS, win32=Windows, linux=Linux)');
console.log('系统架构:', process.arch);
console.log('进程 PID:', process.pid);
console.log('进程标题:', process.title);
console.log('Node.js 执行路径:', process.execPath);

console.log('\\n详细版本信息:');
console.log('  - Node.js:', process.versions.node);
console.log('  - V8 引擎:', process.versions.v8);
console.log('  - libuv:', process.versions.uv);
console.log('  - zlib:', process.versions.zlib);
console.log('  - OpenSSL:', process.versions.openssl);

// --- Demo 分割线 ---

console.log('\\n=== 2. process.env 环境变量 ===');
// 常用环境变量
console.log('NODE_ENV:', process.env.NODE_ENV || '(未设置，通常开发环境不设置)');
console.log('PATH 第一项:', process.env.PATH.split(path.delimiter)[0]);
console.log('用户主目录 (HOME):', process.env.HOME || process.env.USERPROFILE);
console.log('当前用户:', process.env.USER || process.env.USERNAME);
console.log('操作系统临时目录:', process.env.TMPDIR || process.env.TEMP);

// 设置当前进程的环境变量
process.env.DEMO_VAR = '这是演示用的环境变量';
console.log('自定义环境变量 DEMO_VAR:', process.env.DEMO_VAR);

console.log('\\n💡 提示: 环境变量常用于区分环境、配置敏感信息');
console.log('   启动时设置: NODE_ENV=production PORT=8080 node app.js');

// --- Demo 分割线 ---

console.log('\\n=== 3. process.argv 命令行参数 ===');
console.log('argv 数组长度:', process.argv.length);
process.argv.forEach((arg, index) => {
  console.log(\`  argv[\${index}]:\`, arg);
});

// 解析自定义参数
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      args[key] = value || true;
    }
  }
  return args;
}
const args = parseArgs(process.argv);
console.log('\\n解析后的参数:', args);

// --- Demo 分割线 ---

console.log('\\n=== 4. cwd() vs __dirname 对比 ===');
console.log('process.cwd() 当前工作目录:', process.cwd());
console.log('__dirname 脚本所在目录:', __dirname);
console.log('__filename 脚本完整路径:', __filename);
console.log('');
console.log('⚠️  重要区别:');
console.log('  - cwd() 是你执行 node 命令时所在的目录（可以改变）');
console.log('  - __dirname 是当前 .js 文件所在目录（固定不变）');
console.log('  - 读取文件时，如果路径是相对的，是相对于 cwd() 而非 __dirname！');
console.log('  - 建议: 用 path.join(__dirname, "file.txt") 来获取可靠的文件路径');

// --- Demo 分割线 ---

console.log('\\n=== 5. process.nextTick() 微任务演示 ===');
console.log('演示异步执行顺序:');

console.log('  [1] 同步代码开始');

setTimeout(() => {
  console.log('  [5] setTimeout 回调（宏任务）');
}, 0);

process.nextTick(() => {
  console.log('  [3] process.nextTick 回调');
  process.nextTick(() => {
    console.log('  [4] nextTick 内部的 nextTick');
  });
});

Promise.resolve().then(() => {
  console.log('  [4] Promise microtask 回调');
});

setImmediate(() => {
  console.log('  [6] setImmediate 回调');
});

console.log('  [2] 同步代码结束');
console.log('  ↓ 事件循环接下来处理...');

// --- Demo 分割线 ---

console.log('\\n=== 6. 内存和性能信息 ===');
const mem = process.memoryUsage();
console.log('内存使用情况:');
console.log('  - rss (常驻集大小):', (mem.rss / 1024 / 1024).toFixed(2), 'MB');
console.log('  - heapTotal (堆总大小):', (mem.heapTotal / 1024 / 1024).toFixed(2), 'MB');
console.log('  - heapUsed (已用堆):', (mem.heapUsed / 1024 / 1024).toFixed(2), 'MB');
console.log('  - external (外部内存):', (mem.external / 1024 / 1024).toFixed(2), 'MB');

console.log('\\n进程已运行时间:', process.uptime().toFixed(2), '秒');
console.log('系统内存总量:', (os.totalmem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('系统可用内存:', (os.freemem() / 1024 / 1024 / 1024).toFixed(2), 'GB');

// 高精度计时
const start = process.hrtime.bigint();
let sum = 0;
for (let i = 0; i < 1000000; i++) {
  sum += Math.sqrt(i);
}
const end = process.hrtime.bigint();
console.log('\\n计算结果:', sum.toFixed(2));
console.log('计算耗时:', (end - start) / 1000000n, '毫秒');

// --- Demo 分割线 ---

console.log('\\n=== 7. console 高级方法演示 ===');

// console.dir 深度打印对象
const deepObj = {
  level1: {
    level2: {
      level3: {
        value: '深层数据',
        arr: [1, 2, [3, 4]]
      }
    }
  }
};
console.log('\\nconsole.log 打印对象:');
console.log(deepObj);
console.log('\\nconsole.dir 深度打印 (depth: null):');
console.dir(deepObj, { depth: null, colors: true });

// console.table 表格打印
console.log('\\nconsole.table 表格形式:');
const users = [
  { id: 1, name: '张三', age: 25, city: '北京' },
  { id: 2, name: '李四', age: 30, city: '上海' },
  { id: 3, name: '王五', age: 28, city: '深圳' }
];
console.table(users);

// console.time 计时
console.log('\\nconsole.time/timeEnd 计时:');
console.time('sort-array');
const bigArr = Array(100000).fill(0).map(() => Math.random());
bigArr.sort();
console.timeEnd('sort-array');

// console.count 计数器
console.log('\\nconsole.count 计数器:');
function greet(name) {
  console.count('greet 调用次数');
  return 'Hello, ' + name;
}
greet('Alice');
greet('Bob');
greet('Charlie');
console.countReset('greet 调用次数');
console.log('计数器重置后:');
greet('Dave');

// console.assert 断言
console.log('\\nconsole.assert 断言:');
console.assert(1 + 1 === 2, '1+1 应该等于2（这句话不会打印）');
console.assert(1 + 1 === 3, '1+1 不等于3！（断言失败会打印）');

// console.trace 调用栈
console.log('\\nconsole.trace 调用栈:');
function funcA() { funcB(); }
function funcB() { funcC(); }
function funcC() { console.trace('调用栈追踪:'); }
funcA();

// console.group 分组
console.log('\\nconsole.group 分组:');
console.group('第一组');
console.log('组内内容 1');
console.log('组内内容 2');
console.group('嵌套组');
console.log('嵌套内容');
console.groupEnd();
console.groupEnd();
console.log('组外内容');

// --- Demo 分割线 ---

console.log('\\n=== 8. stdin/stdout 交互演示 ===');
console.log('process.stdin 是标准输入流（键盘输入）');
console.log('process.stdout 是标准输出流');
console.log('');
console.log('console.log = 写入 process.stdout + 换行');
console.log('console.error = 写入 process.stderr + 换行');

// 直接写入 stdout（无换行）
process.stdout.write('这是直接写入 stdout 的文字...');
process.stdout.write('还是同一行！\\n');

// 简单的 stdout 动画演示（旋转指示器）
console.log('\\n stdout 可以实现简单的 CLI 动画（如加载指示器）');
const spinner = ['|', '/', '-', '\\\\'];
let spinIdx = 0;
const spinInterval = setInterval(() => {
  process.stdout.write('\\r加载中 ' + spinner[spinIdx] + '  ');
  spinIdx = (spinIdx + 1) % spinner.length;
}, 100);

setTimeout(() => {
  clearInterval(spinInterval);
  process.stdout.write('\\r加载完成! ✅   \\n');
  
  console.log('\\n=== 9. 进程事件 ===');
  console.log('process 是 EventEmitter，可以监听事件:');
  console.log('  - exit: 进程退出时');
  console.log('  - uncaughtException: 未捕获异常');
  console.log('  - unhandledRejection: 未处理的 Promise rejection');
  console.log('  - SIGINT: 收到 Ctrl+C 信号');
  console.log('  - SIGTERM: 收到终止信号');
  
  console.log('\\n✅ process 和全局对象演示完成！');
  console.log('');
  console.log('📚 本章重点回顾:');
  console.log('  1. process.env 读取环境变量');
  console.log('  2. process.argv 解析命令行参数');
  console.log('  3. cwd() 是工作目录，__dirname 是文件目录');
  console.log('  4. process.nextTick() 优先级高于 Promise');
  console.log('  5. uncaughtException 捕获全局异常');
  console.log('  6. console.table/time/dir 等高级方法很实用');
}, 800);
`
  }
];
