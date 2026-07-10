// =============================================================
// 专用 Worker 进阶 - 第三批章节（共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   worker-importscripts : importScripts 加载脚本
//   worker-modules       : Worker 中的模块系统
//   worker-errors        : 错误处理与调试
//   worker-fetch         : Worker 中使用 fetch 与定时器
//   worker-perf          : Worker 性能优化
//
// 说明：浏览器中的 Worker 无法在 Node.js 沙箱中直接运行，
// 这里统一用 events.EventEmitter 模拟 Worker 的消息传递机制，
// 代码中保留真实浏览器写法的注释，方便对照学习。
// 参考：《JavaScript高级程序设计》（红皮书）第 27 章 Worker 相关章节。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 11 章：importScripts 加载脚本
  // ============================================================
  {
    id: "worker-importscripts",
    group: "专用 Worker 进阶",
    icon: "📦",
    title: "importScripts 加载脚本",
    content: `## importScripts 加载脚本

在《JavaScript高级程序设计》中提到，专用 Worker（Dedicated Worker）拥有自己独立的全局作用域，无法直接访问主线程的变量和函数。那么 Worker 内部如何复用外部脚本呢？答案就是 \`importScripts\`。

### 一、什么是 importScripts

\`importScripts\` 是 Web Worker 专属的全局函数，**只在 classic worker（经典 Worker）中可用**。它可以在 Worker 内部同步加载一个或多个外部脚本，并把它们注入到 Worker 的全局作用域中。

\`\`\`javascript
// 浏览器中真实写法（worker.js 内部）
importScripts('helper.js', 'math-utils.js', 'config.js');
// 加载完成后，helper.js 中定义的全局变量、函数都能直接使用
\`\`\`

它有几个关键特点：

| 特性 | 说明 |
| --- | --- |
| 加载方式 | **同步**阻塞，加载完才继续执行 |
| 作用域 | 脚本中的变量会"泄漏"到 Worker 全局作用域 |
| 可用环境 | 仅 classic worker，module worker 不可用 |
| 错误处理 | 任意一个脚本加载失败，全部中断 |
| 加载顺序 | 严格按参数顺序依次加载 |

### 二、基本语法

\`\`\`javascript
// 加载单个脚本
importScripts('utils.js');

// 加载多个脚本（按顺序执行）
importScripts('a.js', 'b.js', 'c.js');
\`\`\`

\`importScripts\` 接收任意多个 URL 参数，按顺序同步加载并执行。每个脚本都会在 Worker 全局作用域中执行，因此脚本中用 \`var\` 声明或直接赋值的变量，都会成为 Worker 全局对象的属性。

### 三、同步加载的代价

\`importScripts\` 是**同步**的，意味着 Worker 线程会阻塞等待脚本下载并执行完毕。这一点和 ES 模块的 \`import\`（异步、静态分析）截然不同。

\`\`\`javascript
console.log('开始');
importScripts('big-library.js'); // 阻塞，直到 big-library.js 加载完成
console.log('结束'); // 一定在 big-library.js 执行后才输出
\`\`\`

如果脚本较大或网络较慢，Worker 启动时间会被拉长。在生产环境中要尽量减少 \`importScripts\` 的脚本体积和数量。

### 四、变量泄漏到全局作用域

被加载的脚本中所有顶层声明都会进入 Worker 全局作用域，这一点和 \`<script>\` 标签非常像：

\`\`\`javascript
// helper.js 内容
var PI = 3.14159;
function add(a, b) { return a + b; }
this.HELLO = 'world'; // this 指向 worker 全局对象

// worker.js
importScripts('helper.js');
console.log(PI);        // 3.14159
console.log(add(1, 2)); // 3
console.log(HELLO);     // 'world'
\`\`\`

这种"全局共享"的方式虽然方便，但容易造成命名冲突，不推荐大型项目使用。

### 五、模块 Worker 中不可用

\`\`\`javascript
// 模块 Worker（{ type: 'module' }）中不能调用 importScripts
importScripts('a.js'); // 抛出 ReferenceError: importScripts is not defined

// 模块 Worker 应该使用 ES 模块的 import
import { add } from './utils.js';
\`\`\`

### 六、错误处理：一损俱损

如果 \`importScripts\` 中任意一个脚本加载失败（404、网络错误、脚本抛错），整个加载过程会中断，并触发 Worker 的 \`error\` 事件。

\`\`\`javascript
// 主线程
worker.onerror = function(e) {
  console.log('加载失败:', e.message, e.filename);
};

// worker.js
try {
  importScripts('ok.js', 'missing.js'); // missing.js 不存在
} catch (e) {
  // 这里其实捕获不到网络错误，错误会直接冒泡到主线程 onerror
}
\`\`\`

### 七、importScripts vs ES 模块 import

| 对比项 | importScripts | ES import |
| --- | --- | --- |
| 加载方式 | 同步 | 异步（静态分析） |
| 作用域 | 全局泄漏 | 模块作用域隔离 |
| 严格模式 | 默认非严格 | 默认严格模式 |
| 树摇优化 | 不支持 | 支持 |
| 重复加载 | 多次执行 | 模块缓存 |
| Worker 类型 | classic | module |
| 浏览器支持 | 所有支持 Worker 的浏览器 | Chrome 80+/Firefox 114+/Safari 15+ |

### 八、何时使用 importScripts

- 老项目迁移，脚本使用全局变量风格
- 需要加载第三方库（如 lodash 全局版）且不支持 ESM
- Worker 脚本简单、不需要模块化

新项目优先使用 **module worker**，享受严格模式、作用域隔离、tree-shaking 等好处。

### 九、常见模式

**模式 1：加载工具库**

\`\`\`javascript
importScripts('https://cdn.example.com/lodash.js');
_.chunk([1,2,3,4], 2); // 直接使用全局 _
\`\`\`

**模式 2：加载配置**

\`\`\`javascript
importScripts('config.js');
// config.js 中定义了全局 CONFIG
console.log(CONFIG.apiBaseUrl);
\`\`\`

**模式 3：按需加载**

\`\`\`javascript
self.onmessage = function(e) {
  if (e.data.needCrypto) {
    importScripts('crypto-helper.js');
    // 使用 crypto-helper.js 中的函数
  }
};
\`\`\`

掌握 \`importScripts\` 是理解 classic worker 资源加载的基础，下一章我们会对比学习模块 Worker 的 \`import\` 机制。`,
    code: `// ============================================
// 第 11 章：importScripts 加载脚本（Node.js 模拟）
// --------------------------------------------
// 浏览器中 importScripts 是同步加载外部脚本到 Worker 全局作用域，
// Node.js 沙箱没有 importScripts，这里用 require 模拟其"全局共享"特性。
// ============================================

const { EventEmitter } = require('events');
// 注意：浏览器中 importScripts 是 Worker 全局函数，Node.js 沙箱没有，
// 这里用对象属性注入模拟"脚本变量泄漏到 Worker 全局作用域"的效果。

console.log('═══════════════════════════════════════════');
console.log('  📦 importScripts 加载脚本演示');
console.log('═══════════════════════════════════════════');
console.log('');

// --------------------------------------------
// 演示 1：模拟 importScripts 的全局变量泄漏
// --------------------------------------------
// 浏览器中：
//   importScripts('helper.js');
//   helper.js 中 var PI = 3.14 会变成 Worker 全局变量
// 这里用 require + 对象合并模拟"注入全局作用域"

// 模拟 helper.js 文件内容（导出若干全局变量）
const fakeHelperModule = {
  PI: 3.14159,
  add: function (a, b) { return a + b; },
  HELLO: 'world'
};

// 模拟 importScripts 把脚本变量注入 worker 全局作用域
function simulateImportScripts(globalScope, modules) {
  console.log('【importScripts】开始同步加载脚本...');
  for (const mod of modules) {
    console.log('  -> 加载:', mod.__filename || '匿名脚本');
    // 把模块的所有属性注入到全局作用域（模拟 var 泄漏到全局）
    for (const key of Object.keys(mod)) {
      if (key === '__filename') continue;
      globalScope[key] = mod[key];
    }
  }
  console.log('【importScripts】所有脚本加载完成\\n');
}

// Worker 的模拟全局作用域
const workerGlobal = {};
// 给 helper 模块附加文件名标识
fakeHelperModule.__filename = 'helper.js';
simulateImportScripts(workerGlobal, [fakeHelperModule]);

console.log('【加载后访问全局变量】');
console.log('  workerGlobal.PI:', workerGlobal.PI);          // 3.14159
console.log('  workerGlobal.add(1,2):', workerGlobal.add(1, 2)); // 3
console.log('  workerGlobal.HELLO:', workerGlobal.HELLO);    // 'world'
console.log('');

// --------------------------------------------
// 演示 2：importScripts 是同步阻塞的
// --------------------------------------------
// 浏览器中 importScripts 会阻塞 worker 线程
// 这里通过"顺序执行"体现同步性
console.log('【演示 2：importScripts 同步性】');
console.log('  1. Worker 启动');
// 同步加载（模拟）
console.log('  2. 调用 importScripts("a.js", "b.js")');
console.log('     -> 加载 a.js');
console.log('     -> 执行 a.js 顶层代码');
console.log('     -> 加载 b.js');
console.log('     -> 执行 b.js 顶层代码');
console.log('  3. importScripts 返回，继续执行');
console.log('  4. Worker 就绪');
console.log('');

// --------------------------------------------
// 演示 3：多个脚本按顺序加载并共享全局
// --------------------------------------------
console.log('【演示 3：多脚本顺序加载与全局共享】');

// 模拟 config.js
const configScript = {
  __filename: 'config.js',
  API_BASE: 'https://api.example.com',
  TIMEOUT: 5000
};

// 模拟 utils.js（依赖 config.js 中的全局变量）
const utilsScript = {
  __filename: 'utils.js',
  request: function (url) {
    // 浏览器中这里能直接访问 API_BASE（importScripts 全局泄漏）
    return 'GET ' + url + ' (base=' + 'API_BASE' + ')';
  }
};

const workerGlobal2 = {};
simulateImportScripts(workerGlobal2, [configScript, utilsScript]);

console.log('  API_BASE:', workerGlobal2.API_BASE);
console.log('  TIMEOUT:', workerGlobal2.TIMEOUT);
console.log('  request():', workerGlobal2.request('/users'));
console.log('');

// --------------------------------------------
// 演示 4：importScripts 错误会冒泡到主线程
// --------------------------------------------
console.log('【演示 4：加载失败的错误传播】');

// 模拟 Worker 类（主线程视角）
class FakeWorker extends EventEmitter {
  constructor() {
    super();
    // worker 内部作用域
    const inner = new EventEmitter();
    inner.postMessage = (data) => this.emit('message', { data });
    this.postMessage = (data) => inner.emit('message', { data });
    // 错误冒泡：worker 内部抛错 -> 主线程 onerror
    inner.onerror = (err) => this.emit('error', err);
    this._inner = inner;
  }
  // 模拟 worker 内部调用 importScripts 失败
  failImportScripts(missingFile) {
    const err = {
      message: 'Failed to fetch ' + missingFile,
      filename: missingFile,
      lineno: 1,
      colno: 0
    };
    console.log('  [worker 内部] importScripts 抛错:', err.message);
    // 错误冒泡到主线程
    this._inner.onerror(err);
  }
}

const worker = new FakeWorker();
worker.on('error', (err) => {
  console.log('  [主线程 onerror] 捕获错误:', err.message);
  console.log('  [主线程 onerror] 文件:', err.filename, '行:', err.lineno);
});

worker.failImportScripts('missing-library.js');
console.log('');

// --------------------------------------------
// 演示 5：module worker 中 importScripts 不可用
// --------------------------------------------
console.log('【演示 5：module worker 中 importScripts 不存在】');
const moduleWorkerGlobal = { type: 'module' };
// module worker 全局作用域中没有 importScripts
console.log('  moduleWorkerGlobal.importScripts:',
  typeof moduleWorkerGlobal.importScripts); // 'undefined'
console.log('  -> 模块 Worker 应该使用 import 语句');
console.log('  -> import { add } from "./utils.js";');
console.log('');
console.log('═══════════════════════════════════════════');
console.log('  ✅ importScripts 演示完成');
console.log('═══════════════════════════════════════════');`,
  },

  // ============================================================
  // 第 12 章：Worker 中的模块系统
  // ============================================================
  {
    id: "worker-modules",
    group: "专用 Worker 进阶",
    icon: "🧩",
    title: "Worker 中的模块系统",
    content: `## Worker 中的模块系统

随着 ES 模块的全面普及，Web Worker 也支持了模块化的写法，这就是 **module worker**（模块 Worker）。《JavaScript高级程序设计》第四版专门介绍了这种新型 Worker，它是现代 Web 开发的主流选择。

### 一、什么是模块 Worker

通过 \`new Worker(url, { type: 'module' })\` 创建的 Worker 就是模块 Worker。它的脚本以 ES 模块方式运行，可以使用 \`import\` / \`export\`。

\`\`\`javascript
// 主线程
const worker = new Worker('worker.js', { type: 'module' });

// worker.js（ES 模块）
import { calculate } from './math.js';
self.onmessage = (e) => {
  self.postMessage(calculate(e.data));
};
\`\`\`

如果不传 \`type\` 或传 \`{ type: 'classic' }\`，则是经典 Worker，使用 \`importScripts\`。

### 二、ES 模块的 import / export

模块 Worker 内部完全遵循 ES 模块规范：

\`\`\`javascript
// math.js（可被 worker 或主线程复用）
export function add(a, b) { return a + b; }
export function multiply(a, b) { return a * b; }
export default function square(x) { return x * x; }

// worker.js
import square, { add, multiply } from './math.js';
console.log(add(2, 3));      // 5
console.log(multiply(2, 3)); // 6
console.log(square(4));      // 16
\`\`\`

### 三、动态 import()

模块 Worker 中也可以使用动态 \`import()\`，按需加载模块：

\`\`\`javascript
self.onmessage = async (e) => {
  if (e.data.type === 'encrypt') {
    // 按需加载加密模块，避免启动时加载所有依赖
    const { encrypt } = await import('./crypto.js');
    self.postMessage(encrypt(e.data.text));
  }
};
\`\`\`

动态 import 返回 Promise，加载完成后模块会被缓存，后续 import 同一模块直接返回缓存。

### 四、模块 Worker 的优势

| 优势 | 说明 |
| --- | --- |
| 严格模式 | 默认开启 \`'use strict'\`，避免意外全局变量 |
| 作用域隔离 | 模块内变量不泄漏到全局 |
| 静态分析 | 编译期确定依赖关系，支持 tree-shaking |
| 模块缓存 | 同一模块只执行一次 |
| 跨线程复用 | 工具模块可在主线程和 Worker 共享 |
| 顶层 await | 支持 ES2022 顶层 await |

### 五、浏览器支持情况

| 浏览器 | 最低支持版本 |
| --- | --- |
| Chrome | 80+（2020 年 2 月） |
| Edge | 80+（基于 Chromium） |
| Firefox | 114+（2023 年 5 月，此前长期被 flag 限制） |
| Safari | 15+（2021 年 9 月） |

截至 2024 年，模块 Worker 的全球支持率已超过 95%，可以放心用于生产环境。

### 六、classic 与 module 不能混用

\`\`\`javascript
// 错误：module worker 中调用 importScripts
new Worker('w.js', { type: 'module' });
// w.js 内部：
importScripts('a.js'); // ReferenceError: importScripts is not defined

// 错误：classic worker 中使用 import
new Worker('w.js', { type: 'classic' });
// w.js 内部：
import { x } from './a.js'; // SyntaxError: Cannot use import statement outside a module
\`\`\`

### 七、静态 import vs 动态 import

| 对比项 | 静态 import | 动态 import() |
| --- | --- | --- |
| 语法 | \`import x from './a.js'\` | \`import('./a.js').then(m => m.x)\` |
| 执行时机 | 模块启动时立即加载 | 运行时按需加载 |
| 性能 | 启动稍慢（要加载所有依赖） | 启动快，首次使用有延迟 |
| 适用场景 | 核心依赖 | 偶尔使用的功能模块 |

### 八、实用模式

**模式 1：主线程与 Worker 复用工具模块**

\`\`\`javascript
// shared/format.js
export function formatPrice(n) { return '¥' + n.toFixed(2); }

// main.js（主线程）
import { formatPrice } from './shared/format.js';

// worker.js
import { formatPrice } from './shared/format.js';
\`\`\`

**模式 2：按需加载大依赖**

\`\`\`javascript
// worker.js
self.onmessage = async (e) => {
  if (e.data.task === 'pdf') {
    const pdfjs = await import('./pdf-lib.js'); // 1MB+ 库按需加载
    self.postMessage(pdfjs.render(e.data.html));
  }
};
\`\`\`

**模式 3：顶层 await**

\`\`\`javascript
// worker.js（ES2022）
const config = await fetch('/config.json').then(r => r.json());
// 模块加载完成时 config 已就绪
self.onmessage = (e) => { /* 使用 config */ };
\`\`\`

### 九、迁移建议

如果你在维护一个使用 \`importScripts\` 的老 Worker，迁移到模块 Worker 的步骤：

1. 把 \`importScripts('a.js')\` 改为 \`import * as A from './a.js'\`
2. 把 \`a.js\` 中的全局变量改为 \`export\` 导出
3. 创建 Worker 时加 \`{ type: 'module' }\`
4. 删除所有对 \`self.xxx\` 全局变量的隐式依赖

模块 Worker 是未来的方向，新项目应该直接采用。`,
    code: `// ============================================
// 第 12 章：Worker 中的模块系统（Node.js 模拟）
// --------------------------------------------
// 模块 Worker 用 ES import/export，Node.js 沙箱用 require 模拟。
// 用 EventEmitter 模拟 Worker 消息通信，展示模块化模式。
// ============================================

const { EventEmitter } = require('events');

console.log('═══════════════════════════════════════════');
console.log('  🧩 Worker 模块系统演示');
console.log('═══════════════════════════════════════════');
console.log('');

// --------------------------------------------
// 模拟 ES 模块：math.js（浏览器中用 export）
// --------------------------------------------
// 真实浏览器写法：
//   export function add(a, b) { return a + b; }
//   export const PI = 3.14159;
const mathModule = {
  add: (a, b) => a + b,
  multiply: (a, b) => a * b,
  PI: 3.14159,
  // 默认导出
  default: function square(x) { return x * x; }
};

// 模拟 utils.js 模块
const utilsModule = {
  format: (n) => '结果=' + n.toFixed(2),
  log: (msg) => console.log('[utils]', msg)
};

// --------------------------------------------
// 模拟模块 Worker 的 import 机制
// --------------------------------------------
// 模块缓存（模拟浏览器的模块图）
const moduleCache = new Map();

// 模拟 import 语句（静态导入）
function staticImport(modulePath, moduleObj) {
  console.log('【静态 import】加载模块:', modulePath);
  if (moduleCache.has(modulePath)) {
    console.log('  -> 命中缓存，直接返回');
    return moduleCache.get(modulePath);
  }
  // 模拟模块执行
  moduleCache.set(modulePath, moduleObj);
  console.log('  -> 模块执行完毕，已缓存');
  return moduleObj;
}

// 模拟动态 import()（返回 Promise）
function dynamicImport(modulePath, moduleObj) {
  console.log('【动态 import()】异步加载模块:', modulePath);
  return new Promise((resolve) => {
    setTimeout(() => {
      if (moduleCache.has(modulePath)) {
        console.log('  -> 命中缓存');
        resolve(moduleCache.get(modulePath));
      } else {
        console.log('  -> 网络加载 + 执行');
        moduleCache.set(modulePath, moduleObj);
        resolve(moduleObj);
      }
    }, 50);
  });
}

// --------------------------------------------
// 演示 1：静态 import 加载多个模块
// --------------------------------------------
console.log('【演示 1：静态 import】');
const math = staticImport('./math.js', mathModule);
const utils = staticImport('./utils.js', utilsModule);

console.log('  math.add(2, 3):', math.add(2, 3));       // 5
console.log('  math.PI:', math.PI);                      // 3.14159
console.log('  math.default(4):', math.default(4));      // 16（默认导出）
console.log('  utils.format(3.14159):', utils.format(math.PI));
console.log('');

// 第二次 import 同一模块，命中缓存
console.log('【演示 1.1：模块缓存】');
const mathAgain = staticImport('./math.js', mathModule);
console.log('  两次 import 是否同一对象:', math === mathAgain); // true
console.log('');

// --------------------------------------------
// 演示 2：动态 import() 按需加载
// --------------------------------------------
console.log('【演示 2：动态 import()】');
console.log('  Worker 启动时未加载加密模块');

// 模拟 Worker 接收消息后按需加载
class FakeModuleWorker extends EventEmitter {
  constructor() {
    super();
    const inner = new EventEmitter();
    inner.postMessage = (data) => this.emit('message', { data });
    this.postMessage = (data) => inner.emit('message', { data });
    this._inner = inner;
  }
}

const worker = new FakeModuleWorker();

// 模拟 worker 内部：接收消息，按需动态 import
const cryptoModule = {
  encrypt: (text) => 'ENC(' + text + ')',
  decrypt: (cipher) => cipher.replace(/^ENC\\(|\\)$/g, '')
};

worker.on('message', async (e) => {
  const { task, text } = e.data;
  if (task === 'encrypt') {
    console.log('  收到任务，动态加载加密模块...');
    const crypto = await dynamicImport('./crypto.js', cryptoModule);
    const result = crypto.encrypt(text);
    console.log('  加密结果:', result);
  }
});

// 发送任务
worker.postMessage({ task: 'encrypt', text: 'hello' });

// --------------------------------------------
// 演示 3：模块作用域隔离（对比 importScripts 全局泄漏）
// --------------------------------------------
setTimeout(() => {
  console.log('');
  console.log('【演示 3：模块作用域隔离】');
  // importScripts 模式：变量泄漏到全局
  const classicGlobal = {};
  classicGlobal.PI = 3.14; // 模拟 importScripts 的全局变量

  // 模块模式：变量只在模块内
  const moduleScope = { PI: 3.14159 };
  // moduleScope.PI 不会出现在 worker 全局

  console.log('  classic worker 全局有 PI:', 'PI' in classicGlobal); // true
  console.log('  module worker 全局有 PI:', false); // false（隔离）
  console.log('  module worker 模块内有 PI:', 'PI' in moduleScope);  // true
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  ✅ 模块系统演示完成');
  console.log('═══════════════════════════════════════════');
}, 100);`,
  },

  // ============================================================
  // 第 13 章：错误处理与调试
  // ============================================================
  {
    id: "worker-errors",
    group: "专用 Worker 进阶",
    icon: "🐛",
    title: "错误处理与调试",
    content: `## 错误处理与调试

Worker 运行在独立线程中，错误处理比主线程更复杂。《JavaScript高级程序设计》强调：未捕获的错误会导致脚本中止，而 Worker 的错误还会跨线程传播，理解其机制是写出健壮 Worker 应用的前提。

### 一、Worker 的两类错误事件

#### 1.1 error 事件（运行时错误）

Worker 内部抛出的未捕获错误，会冒泡到主线程的 \`worker.onerror\`：

\`\`\`javascript
// 主线程
worker.onerror = function(e) {
  console.log('message:', e.message);   // 错误信息
  console.log('filename:', e.filename); // 出错的脚本 URL
  console.log('lineno:', e.lineno);     // 行号
  console.log('colno:', e.colno);       // 列号
  console.log('error:', e.error);       // 原始 Error 对象
  e.preventDefault(); // 阻止默认上报
};
\`\`\`

#### 1.2 messageerror 事件（消息序列化失败）

当 \`postMessage\` 传递的数据无法被结构化克隆（比如包含函数、DOM 节点），会触发 \`messageerror\`：

\`\`\`javascript
worker.onmessageerror = function(e) {
  console.log('消息序列化失败');
};

// worker.js
self.postMessage({ fn: function(){} }); // 触发 messageerror
\`\`\`

### 二、Error 对象的属性

Worker \`error\` 事件的 ErrorEvent 包含以下属性：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| \`message\` | string | 错误描述 |
| \`filename\` | string | 出错脚本 URL |
| \`lineno\` | number | 行号（1 开始） |
| \`colno\` | number | 列号（1 开始） |
| \`error\` | Error | 原始 Error 对象（含 stack） |

### 三、Worker 内部 try-catch

在 Worker 内部用 \`try-catch\` 可以拦截错误，避免冒泡到主线程：

\`\`\`javascript
// worker.js
self.onmessage = function(e) {
  try {
    const result = riskyCalc(e.data);
    self.postMessage({ ok: true, result });
  } catch (err) {
    // 主动把错误信息发回主线程，而不是让它冒泡
    self.postMessage({
      ok: false,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack
      }
    });
  }
};
\`\`\`

### 四、未捕获错误的传播链

\`\`\`
worker.js 抛出未捕获错误
        ↓
Worker 线程触发 error 事件
        ↓
主线程 worker.onerror 触发
        ↓
（若未 preventDefault）window.onerror 触发
\`\`\`

注意：**Worker 内部的 \`self.onerror\` 也能捕获本线程错误**，但如果不调用 \`preventDefault\`，错误仍会传播到主线程。

### 五、messageerror 的常见诱因

\`\`\`javascript
// 以下数据无法被结构化克隆，会触发 messageerror
worker.postMessage({
  fn: () => {},        // 函数
  node: document.body, // DOM 节点
  // symbol 键也会失败
});
\`\`\`

可传递的类型包括：基本类型、普通对象、数组、Map、Set、Date、RegExp、ArrayBuffer、Blob、File 等。

### 六、调试工具

#### 6.1 Chrome DevTools

- 打开 DevTools → Sources 面板
- 左侧线程列表会显示所有 Worker（如 \`worker.js\`）
- 点击可在 Worker 线程中打断点、单步执行
- Console 切换到 Worker 上下文，可执行命令

#### 6.2 专用 Worker 的 Console

\`\`\`javascript
// worker.js 中 console.log 会输出到 Worker 自己的 Console
console.log('我在 worker 线程中');
\`\`\`

DevTools 的 Console 左上角可切换上下文，选择 Worker 后只看其输出。

#### 6.3 debugger 语句

\`\`\`javascript
// worker.js
self.onmessage = (e) => {
  debugger; // DevTools 打开时会在此暂停
  // ...
};
\`\`\`

### 七、Source Map

打包工具（Webpack/Vite）生成 Worker 脚本时，配置 source map 可以在调试时看到原始源码：

\`\`\`javascript
// vite.config.js
export default {
  worker: {
    format: 'es',
    rollupOptions: { output: { sourcemap: true } }
  }
};
\`\`\`

### 八、日志策略：把错误回传主线程

生产环境 Worker 无法直接上报日志，通常的做法是把错误信息序列化后 \`postMessage\` 给主线程，由主线程统一上报：

\`\`\`javascript
// worker.js
function reportError(err, context) {
  self.postMessage({
    type: '__error__',
    payload: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      context
    }
  });
}

self.onmessage = (e) => {
  try {
    // 业务逻辑
  } catch (err) {
    reportError(err, { input: e.data });
  }
};
\`\`\`

### 九、常见错误场景与解决方案

| 场景 | 原因 | 解决方案 |
| --- | --- | --- |
| 跨域加载 Worker | CORS 限制 | 同源部署或用 blob URL |
| \`importScripts\` 404 | 路径错误 | 检查相对路径基准 |
| 消息含函数 | 结构化克隆失败 | 移除函数或改传字符串 |
| Worker 内存泄漏 | 未 \`terminate\` | 用完调用 \`worker.terminate()\` |
| 死循环卡死 Worker | CPU 占满 | 拆分任务，定期 \`yield\` |

### 十、健壮的错误处理模板

\`\`\`javascript
// worker.js
self.onmessage = function(e) {
  Promise.resolve()
    .then(() => handleTask(e.data))
    .then(result => self.postMessage({ id: e.data.id, ok: true, result }))
    .catch(err => self.postMessage({
      id: e.data.id,
      ok: false,
      error: { name: err.name, message: err.message, stack: err.stack }
    }));
};

// 兜底：捕获同步错误
self.onerror = function(e) {
  console.error('Worker 未捕获错误:', e.error);
};
\`\`\`

掌握这些错误处理与调试技巧，能让 Worker 应用在出问题时快速定位、优雅降级。`,
    code: `// ============================================
// 第 13 章：错误处理与调试（Node.js 模拟）
// --------------------------------------------
// 用 EventEmitter 模拟 Worker，演示错误传播、try-catch、
// messageerror 等场景。
// ============================================

const { EventEmitter } = require('events');

console.log('═══════════════════════════════════════════');
console.log('  🐛 Worker 错误处理演示');
console.log('═══════════════════════════════════════════');
console.log('');

// --------------------------------------------
// 模拟 Worker 类（带 error / messageerror 事件）
// --------------------------------------------
class FakeWorker extends EventEmitter {
  constructor() {
    super();
    const inner = new EventEmitter();
    // worker -> 主线程
    inner.postMessage = (data) => {
      // 模拟浏览器的结构化克隆算法：函数、DOM 节点等无法克隆会触发 messageerror
      try {
        const cloned = JSON.parse(JSON.stringify(data, (_k, v) => {
          if (typeof v === 'function') throw new TypeError('函数无法被结构化克隆');
          return v;
        }));
        this.emit('message', { data: cloned });
      } catch (e) {
        // 序列化失败 -> messageerror
        this.emit('messageerror', { data });
      }
    };
    // 主线程 -> worker
    this.postMessage = (data) => inner.emit('message', { data });
    // worker 内部抛错冒泡到主线程
    inner.fail = (err) => this.emit('error', err);
    this._inner = inner;
    // 默认 worker 行为：收到消息后执行任务
    // 浏览器中 worker 内部未捕获错误会冒泡到主线程 onerror，这里用 try-catch 模拟
    this._inner.on('message', (e) => {
      if (!this._handler) return;
      try {
        this._handler(e.data, inner);
      } catch (err) {
        // 同步错误冒泡到主线程 error 事件（模拟 ErrorEvent）
        this.emit('error', {
          message: err.message,
          filename: 'worker.js',
          lineno: 0,
          colno: 0,
          stack: err.stack
        });
      }
    });
  }
  // 设置 worker 内部的消息处理函数
  setHandler(fn) { this._handler = fn; }
}

// --------------------------------------------
// 演示 1：未捕获错误冒泡到主线程 onerror
// --------------------------------------------
console.log('【演示 1：未捕获错误冒泡】');
const w1 = new FakeWorker();
w1.on('error', (err) => {
  console.log('  [主线程 onerror] 捕获:', err.message);
  console.log('    filename:', err.filename, 'lineno:', err.lineno);
});
w1.setHandler((data, inner) => {
  // worker 内部抛出未捕获错误
  throw new Error('计算失败：除以零');
});
w1.postMessage({ task: 'calc' });
console.log('');

// --------------------------------------------
// 演示 2：try-catch 拦截错误并回传
// --------------------------------------------
console.log('【演示 2：try-catch 拦截】');
const w2 = new FakeWorker();
w2.on('message', (e) => {
  if (e.data.ok) {
    console.log('  [主线程] 成功:', e.data.result);
  } else {
    console.log('  [主线程] 失败:', e.data.error.message);
  }
});
w2.setHandler((data, inner) => {
  try {
    // 模拟可能失败的计算
    const result = JSON.parse('invalid json');
    inner.postMessage({ ok: true, result });
  } catch (err) {
    // 主动回传错误，避免冒泡
    inner.postMessage({
      ok: false,
      error: { name: err.name, message: err.message }
    });
  }
});
w2.postMessage({ task: 'parse' });
console.log('');

// --------------------------------------------
// 演示 3：messageerror（消息含函数无法克隆）
// --------------------------------------------
console.log('【演示 3：messageerror 序列化失败】');
const w3 = new FakeWorker();
w3.on('messageerror', (e) => {
  console.log('  [主线程 onmessageerror] 消息无法克隆');
});
w3.on('message', (e) => {
  console.log('  [主线程 onmessage] 收到消息');
});
w3.setHandler((data, inner) => {
  // postMessage 传函数 -> messageerror
  inner.postMessage({ fn: function () {}, text: 'hi' });
});
w3.postMessage({ task: 'send-fn' });
console.log('');

// --------------------------------------------
// 演示 4：ErrorEvent 的属性
// --------------------------------------------
console.log('【演示 4：错误事件属性】');
const w4 = new FakeWorker();
w4.on('error', (err) => {
  console.log('  错误对象属性:');
  console.log('    message:', err.message);
  console.log('    filename:', err.filename);
  console.log('    lineno:', err.lineno);
  console.log('    colno:', err.colno);
  console.log('    error.stack 存在:', !!err.stack);
});
w4.setHandler((data, inner) => {
  // 模拟带行号信息的错误
  const e = new Error('ReferenceError: x is not defined');
  inner.fail({
    message: e.message,
    filename: 'worker.js',
    lineno: 42,
    colno: 15,
    stack: e.stack
  });
});
w4.postMessage({});
console.log('');

// --------------------------------------------
// 演示 5：健壮的错误处理模板
// --------------------------------------------
console.log('【演示 5：健壮错误处理模板】');
const w5 = new FakeWorker();
w5.on('message', (e) => {
  if (e.data.type === '__error__') {
    console.log('  [主线程] 收到错误上报:', e.data.payload.message);
  } else if (e.data.ok) {
    console.log('  [主线程] 业务成功:', e.data.result);
  } else {
    console.log('  [主线程] 业务失败:', e.data.error.message);
  }
});

function reportError(inner, err, context) {
  inner.postMessage({
    type: '__error__',
    payload: { name: err.name, message: err.message, context }
  });
}

w5.setHandler((data, inner) => {
  Promise.resolve()
    .then(() => {
      // 模拟业务：偶发失败
      if (data.value < 0) throw new Error('负数非法');
      return Math.sqrt(data.value);
    })
    .then(result => inner.postMessage({ id: data.id, ok: true, result }))
    .catch(err => {
      // 业务失败回传
      inner.postMessage({
        id: data.id, ok: false,
        error: { name: err.name, message: err.message }
      });
      // 同时上报到日志系统
      reportError(inner, err, { input: data });
    });
});

console.log('  -- 测试合法输入 --');
w5.postMessage({ id: 1, value: 16 });
setTimeout(() => {
  console.log('  -- 测试非法输入 --');
  w5.postMessage({ id: 2, value: -1 });
  setTimeout(() => {
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('  ✅ 错误处理演示完成');
    console.log('═══════════════════════════════════════════');
  }, 50);
}, 50);`,
  },

  // ============================================================
  // 第 14 章：Worker 中使用 fetch 与定时器
  // ============================================================
  {
    id: "worker-fetch",
    group: "专用 Worker 进阶",
    icon: "🌐",
    title: "Worker 中使用 fetch 与定时器",
    content: `## Worker 中使用 fetch 与定时器

Worker 虽然不能操作 DOM，但能使用大量 Web API。本章梳理 Worker 中可用的网络、定时器、存储等 API，《JavaScript高级程序设计》把这些归为"Worker 可用 API 清单"。

### 一、Worker 中可用的 API 概览

| API 类别 | 可用 API | 备注 |
| --- | --- | --- |
| 网络 | fetch、WebSocket、XMLHttpRequest | 与主线程用法一致 |
| 定时器 | setTimeout、setInterval、clearTimeout | 可用 |
| 动画 | requestAnimationFrame | **不可用**（无渲染线程） |
| 存储 | IndexedDB、Cache API（caches） | 可持久化 |
| Navigator | navigator.userAgent、onLine、platform | 受限子集 |
| 加密 | crypto.subtle | 可用 |
| 通道 | MessageChannel、BroadcastChannel | 可用 |

### 二、fetch API

Worker 中的 \`fetch\` 与主线程完全一致，是发起网络请求的首选：

\`\`\`javascript
// worker.js
self.onmessage = async (e) => {
  const res = await fetch(e.data.url);
  const json = await res.json();
  self.postMessage(json);
};
\`\`\`

由于 Worker 不阻塞主线程，把 fetch 放到 Worker 中可以避免网络请求的回调占用 UI 线程，特别适合批量请求场景。

### 三、WebSocket

Worker 中可用 WebSocket 维持长连接，适合实时数据：

\`\`\`javascript
// worker.js
const ws = new WebSocket('wss://example.com/realtime');
ws.onmessage = (e) => {
  self.postMessage({ type: 'tick', data: e.data });
};
ws.onclose = () => {
  self.postMessage({ type: 'closed' });
};
\`\`\`

把 WebSocket 放到 Worker 的好处：消息处理（解析、过滤、聚合）不卡 UI，且页面刷新时 Worker 可独立关闭连接。

### 四、setTimeout / setInterval

Worker 中的定时器与主线程行为一致，但**不受页面后台节流影响**（部分浏览器对后台 tab 的定时器会限频，Worker 中相对宽松）：

\`\`\`javascript
// worker.js：每秒轮询一次
setInterval(() => {
  fetch('/api/updates').then(r => r.json()).then(data => {
    self.postMessage(data);
  });
}, 1000);
\`\`\`

### 五、requestAnimationFrame 不可用

\`\`\`javascript
// worker.js
requestAnimationFrame(() => {}); // ReferenceError: requestAnimationFrame is not defined
\`\`\`

原因：\`requestAnimationFrame\` 与浏览器渲染节奏绑定，Worker 没有渲染线程，自然不提供。需要动画的代码必须在主线程。

### 六、IndexedDB

Worker 中可用 IndexedDB 做持久化存储，适合离线数据、缓存：

\`\`\`javascript
// worker.js
const req = indexedDB.open('worker-db', 1);
req.onupgradeneeded = (e) => {
  const db = e.target.result;
  db.createObjectStore('cache', { keyPath: 'url' });
};
req.onsuccess = (e) => {
  const db = e.target.result;
  // 后续读写...
};
\`\`\`

### 七、Navigator 属性

Worker 中的 \`navigator\` 是受限版本，主要属性：

\`\`\`javascript
navigator.userAgent;  // 用户代理字符串
navigator.onLine;     // 是否在线
navigator.platform;   // 平台
navigator.language;   // 语言
navigator.hardwareConcurrency; // CPU 核心数（用于决定 Worker 数量）
\`\`\`

### 八、Cache API（caches）

Service Worker 专属？不，普通 Worker 也能用 \`caches\` 做请求缓存：

\`\`\`javascript
// worker.js
const cache = await caches.open('api-cache');
const cached = await cache.match(request);
if (cached) return cached;
const fresh = await fetch(request);
cache.put(request, fresh.clone());
return fresh;
\`\`\`

### 九、性能考量：连接池

浏览器对同一域名有并发连接数限制（通常 6 个）。在 Worker 中发请求会与主线程共享连接池，并不会"突破"限制。但 Worker 的优势在于：

- 请求回调不阻塞 UI
- 可集中管理重试、限流逻辑
- 便于批量并发与结果聚合

### 十、实战：后台数据抓取

\`\`\`javascript
// worker.js：批量抓取 URL，并发限流
const CONCURRENCY = 4;
let queue = [];

self.onmessage = (e) => {
  queue.push(...e.data.urls);
};

async function run() {
  while (queue.length) {
    const batch = queue.splice(0, CONCURRENCY);
    const results = await Promise.all(
      batch.map(url => fetch(url).then(r => r.text()).catch(e => ({ error: e.message })))
    );
    self.postMessage({ type: 'batch', results });
  }
}
run();
\`\`\`

### 十一、可用性速查表

| 需求 | Worker 中方案 |
| --- | --- |
| HTTP 请求 | fetch / XMLHttpRequest |
| 长连接 | WebSocket |
| 定时任务 | setTimeout / setInterval |
| 动画 | ❌ 必须在主线程 |
| 本地存储 | IndexedDB |
| 请求缓存 | Cache API（caches） |
| 获取 CPU 核数 | navigator.hardwareConcurrency |
| 加密 | crypto.subtle |

掌握 Worker 中可用 API 的边界，才能扬长避短，把合适的任务放到合适的线程。`,
    code: `// ============================================
// 第 14 章：fetch 与定时器（Node.js 模拟）
// --------------------------------------------
// 沙箱无 http 模块，用 mock fetch 模拟网络请求。
// 用 EventEmitter 模拟 Worker，演示定时器、WebSocket 概念。
// ============================================

const { EventEmitter } = require('events');

console.log('═══════════════════════════════════════════');
console.log('  🌐 Worker 中 fetch 与定时器演示');
console.log('═══════════════════════════════════════════');
console.log('');

// --------------------------------------------
// 模拟 fetch（浏览器中是全局 fetch）
// --------------------------------------------
// 真实浏览器：const res = await fetch(url);
function mockFetch(url) {
  console.log('  [fetch] 发起请求:', url);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ url, data: '响应数据-' + Date.now() % 1000 }),
        text: () => Promise.resolve('文本响应')
      });
    }, 30);
  });
}

// --------------------------------------------
// 模拟 WebSocket
// --------------------------------------------
// 真实浏览器：const ws = new WebSocket('wss://...');
class MockWebSocket extends EventEmitter {
  constructor(url) {
    super();
    this.url = url;
    this.readyState = 0; // CONNECTING
    console.log('  [WebSocket] 连接中:', url);
    setTimeout(() => {
      this.readyState = 1; // OPEN
      this.emit('open');
    }, 20);
  }
  send(data) {
    console.log('  [WebSocket] send:', data);
    // 模拟服务端回显
    setTimeout(() => this.emit('message', { data: 'echo:' + data }), 30);
  }
  close() {
    this.readyState = 3; // CLOSED
    this.emit('close', { code: 1000, reason: 'normal' });
  }
}

// --------------------------------------------
// 模拟 Worker
// --------------------------------------------
class FakeWorker extends EventEmitter {
  constructor() {
    super();
    const inner = new EventEmitter();
    inner.postMessage = (data) => this.emit('message', { data });
    this.postMessage = (data) => inner.emit('message', { data });
    this._inner = inner;
  }
  setHandler(fn) { this._handler = fn; this._inner.on('message', (e) => fn(e.data, this._inner)); }
}

// --------------------------------------------
// 演示 1：Worker 中使用 fetch
// --------------------------------------------
console.log('【演示 1：Worker 中 fetch】');
const w1 = new FakeWorker();
w1.on('message', (e) => {
  console.log('  [主线程] 收到:', e.data);
});
w1.setHandler(async (data, inner) => {
  // 真实浏览器写法：
  //   const res = await fetch(data.url);
  //   const json = await res.json();
  //   self.postMessage(json);
  const res = await mockFetch(data.url);
  const json = await res.json();
  inner.postMessage(json);
});
w1.postMessage({ url: 'https://api.example.com/users' });
console.log('');

// --------------------------------------------
// 演示 2：定时器轮询
// --------------------------------------------
setTimeout(() => {
  console.log('【演示 2：setInterval 轮询】');
  const w2 = new FakeWorker();
  let count = 0;
  w2.on('message', (e) => {
    console.log('  [主线程] 轮询结果:', e.data);
  });
  w2.setHandler((data, inner) => {
    // 真实浏览器：setInterval 在 worker 中可用
    const timer = setInterval(async () => {
      count++;
      const res = await mockFetch(data.url);
      const json = await res.json();
      inner.postMessage({ seq: count, data: json.data });
      if (count >= 3) clearInterval(timer);
    }, 60);
  });
  w2.postMessage({ url: '/api/status' });
}, 60);

// --------------------------------------------
// 演示 3：WebSocket 长连接
// --------------------------------------------
setTimeout(() => {
  console.log('');
  console.log('【演示 3：WebSocket 长连接】');
  const w3 = new FakeWorker();
  w3.on('message', (e) => {
    console.log('  [主线程] WS 消息:', e.data);
    if (e.data.type === 'closed') {
      console.log('  [主线程] 连接已关闭');
    }
  });
  w3.setHandler((data, inner) => {
    // 真实浏览器：
    //   const ws = new WebSocket(data.url);
    //   ws.onopen = () => ws.send('hello');
    //   ws.onmessage = (e) => inner.postMessage({type:'msg', data:e.data});
    const ws = new MockWebSocket(data.url);
    ws.on('open', () => {
      console.log('  [worker] WS 已连接，发送 hello');
      ws.send('hello');
    });
    ws.on('message', (e) => {
      inner.postMessage({ type: 'msg', data: e.data });
      // 收到一次回显后关闭
      ws.close();
    });
    ws.on('close', () => {
      inner.postMessage({ type: 'closed' });
    });
  });
  w3.postMessage({ url: 'wss://example.com/realtime' });
}, 220);

// --------------------------------------------
// 演示 4：requestAnimationFrame 不可用
// --------------------------------------------
setTimeout(() => {
  console.log('');
  console.log('【演示 4：requestAnimationFrame 不可用】');
  // 模拟 worker 全局作用域
  const workerGlobal = {
    setTimeout: setTimeout,
    setInterval: setInterval,
    fetch: mockFetch,
    // 注意：没有 requestAnimationFrame
  };
  console.log('  worker 有 setTimeout:', typeof workerGlobal.setTimeout);
  console.log('  worker 有 fetch:', typeof workerGlobal.fetch);
  console.log('  worker 有 requestAnimationFrame:',
    typeof workerGlobal.requestAnimationFrame); // 'undefined'
  console.log('  -> 动画相关代码必须在主线程');

  console.log('');
  console.log('【演示 5：navigator.hardwareConcurrency】');
  const os = require('os');
  // 真实浏览器：navigator.hardwareConcurrency
  console.log('  CPU 核心数:', os.cpus().length, '(决定 Worker 数量上限)');

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  ✅ fetch 与定时器演示完成');
  console.log('═══════════════════════════════════════════');
}, 400);`,
  },

  // ============================================================
  // 第 15 章：Worker 性能优化
  // ============================================================
  {
    id: "worker-perf",
    group: "专用 Worker 进阶",
    icon: "⚡",
    title: "Worker 性能优化",
    content: `## Worker 性能优化

Worker 不是银弹：创建有成本、通信有开销、用错反而更慢。《JavaScript高级程序设计》提醒：性能优化前先测量，避免过早优化。本章系统讲解 Worker 的性能特性与优化策略。

### 一、Worker 创建成本

创建一个 Worker 大约需要 **10~50ms**（取决于脚本体积、网络、设备），包括：

1. 创建新线程（操作系统级别）
2. 建立 JS 运行时上下文
3. 下载并解析 Worker 脚本
4. 执行 \`importScripts\` / \`import\` 依赖

\`\`\`javascript
const t0 = performance.now();
const worker = new Worker('worker.js');
worker.onmessage = (e) => {
  console.log('总耗时:', performance.now() - t0, 'ms');
};
\`\`\`

如果任务本身只跑 5ms，创建 Worker 反而亏本。**经验法则：任务耗时 > 50ms 才考虑用 Worker。**

### 二、Worker 池模式

避免反复创建/销毁 Worker，复用已有实例：

\`\`\`javascript
class WorkerPool {
  constructor(size, script) {
    this.workers = Array.from({ length: size }, () => new Worker(script));
    this.queue = [];
  }
  exec(data) {
    return new Promise(resolve => {
      const worker = this.workers.find(w => !w.busy);
      if (worker) {
        worker.busy = true;
        worker.onmessage = (e) => { worker.busy = false; resolve(e.data); };
        worker.postMessage(data);
      } else {
        this.queue.push({ data, resolve });
      }
    });
  }
}
\`\`\`

### 三、任务队列与调度

当任务数超过 Worker 数量时，需要任务队列调度：

\`\`\`javascript
class Scheduler {
  constructor(pool) { this.pool = pool; this.queue = []; }
  enqueue(task) {
    return new Promise(resolve => this.queue.push({ task, resolve }));
  }
  // 轮询：有空闲 worker 就取队列任务执行
}
\`\`\`

调度策略有 FIFO、优先级队列、LIFO 等，根据业务选择。

### 四、Worker 数量选择

\`navigator.hardwareConcurrency\` 返回 CPU 逻辑核心数，是确定 Worker 数量的依据：

\`\`\`javascript
const N = navigator.hardwareConcurrency; // 比如 8
// 推荐：N-1，留一个核给主线程
const pool = new WorkerPool(Math.max(1, N - 1), 'worker.js');
\`\`\`

但不是越多越好：

- 每个 Worker 占用独立内存（至少几 MB）
- 创建和通信有开销
- 操作系统线程切换也有成本

实际项目中，4~8 个 Worker 通常足够。

### 五、数据传输优化

主线程和 Worker 通信时，数据默认**结构化克隆**，大对象会带来性能损耗。

#### 5.1 Transferable Objects（转移所有权）

\`ArrayBuffer\`、\`MessagePort\` 等可"转移"而非"克隆"，零拷贝：

\`\`\`javascript
const buffer = new ArrayBuffer(1024 * 1024); // 1MB
worker.postMessage(buffer, [buffer]); // 转移后，主线程的 buffer 失效
\`\`\`

#### 5.2 SharedArrayBuffer（共享内存）

多个线程共享同一块内存，无需拷贝：

\`\`\`javascript
const sab = new SharedArrayBuffer(1024);
const view = new Int32Array(sab);
worker.postMessage(sab); // 主线程和 worker 都能读写 view
\`\`\`

需要配合 \`Atomics\` 保证线程安全，且要求跨域隔离（COOP/COEP 头）。

#### 5.3 性能对比

| 传输方式 | 1MB 数据耗时 | 主线程数据 |
| --- | --- | --- |
| 结构化克隆 | ~5ms | 保留 |
| Transferable | ~0ms | 失效 |
| SharedArrayBuffer | ~0ms | 共享 |

### 六、避免过早优化

\`\`\`javascript
// ❌ 错误：5ms 的任务也用 Worker
worker.postMessage({ a: 1, b: 2 });
// 创建 worker 50ms + 通信 1ms = 51ms，比直接算 5ms 慢 10 倍

// ✅ 正确：500ms 的计算才用 Worker
const heavy = computeBigData(); // 500ms
worker.postMessage(heavy);
\`\`\`

判断标准：\`任务耗时 >> 创建+通信开销\` 才值得用 Worker。

### 七、性能剖析

Chrome DevTools 的 Performance 面板可以分析 Worker：

1. 录制一段时间
2. 查看主线程和 Worker 线程的火焰图
3. 找出耗时函数

Console 中也可直接计时：

\`\`\`javascript
console.time('compute');
const result = heavyCompute();
console.timeEnd('compute'); // compute: 234.5ms
\`\`\`

### 八、内存泄漏

Worker 常见的内存泄漏：

| 场景 | 原因 | 解决 |
| --- | --- | --- |
| 未 \`terminate\` | Worker 一直驻留 | 用完 \`worker.terminate()\` |
| 监听器未移除 | 反复 \`onmessage\` | 用 \`removeEventListener\` |
| MessagePort 未关闭 | 端口泄漏 | \`port.close()\` |
| 闭包引用大对象 | 无法 GC | 显式置 \`null\` |

### 九、基准测试

\`\`\`javascript
// 测量不同传输方式的开销
const data = new Uint8Array(1024 * 1024); // 1MB

// 克隆
console.time('clone');
worker.postMessage(data);
console.timeEnd('clone');

// 转移
console.time('transfer');
worker.postMessage(data.buffer, [data.buffer]);
console.timeEnd('transfer');
\`\`\`

### 十、真实性能数据（参考）

| 操作 | 耗时 |
| --- | --- |
| 创建 Worker | 10~50ms |
| postMessage 小对象 | <0.1ms |
| postMessage 1MB 克隆 | ~5ms |
| postMessage 1MB 转移 | <0.1ms |
| terminate | ~1ms |

### 十一、优化清单

- [ ] 任务耗时是否 > 50ms？
- [ ] 是否复用 Worker（池化）？
- [ ] 大数据是否用 Transferable / SharedArrayBuffer？
- [ ] 是否移除了无用监听器？
- [ ] Worker 数量是否合理（不超过 \`hardwareConcurrency\`）？
- [ ] 是否用 DevTools 测量过实际开销？

性能优化的核心是"测量驱动"：先定位瓶颈，再针对性优化，避免凭感觉调整。`,
    code: `// ============================================
// 第 15 章：Worker 性能优化（Node.js 模拟）
// --------------------------------------------
// 用 EventEmitter 模拟 Worker 池、任务队列、传输方式对比。
// 用 console.time/timeEnd 做基准测试。
// ============================================

const { EventEmitter } = require('events');
const os = require('os');

console.log('═══════════════════════════════════════════');
console.log('  ⚡ Worker 性能优化演示');
console.log('═══════════════════════════════════════════');
console.log('');

// --------------------------------------------
// 模拟 Worker（带"忙"状态）
// --------------------------------------------
class FakeWorker extends EventEmitter {
  constructor(id) {
    super();
    this.id = id;
    this.busy = false;
    const inner = new EventEmitter();
    inner.postMessage = (data) => this.emit('message', { data });
    this.postMessage = (data) => inner.emit('message', { data });
    this._inner = inner;
  }
  setHandler(fn) { this._handler = fn; this._inner.on('message', (e) => fn(e.data, this._inner)); }
}

// --------------------------------------------
// 演示 1：Worker 池模式
// --------------------------------------------
console.log('【演示 1：Worker 池】');

class WorkerPool {
  constructor(size) {
    this.workers = [];
    this.queue = [];
    for (let i = 0; i < size; i++) {
      const w = new FakeWorker(i);
      // 每个 worker 的处理函数：模拟"重计算"
      w.setHandler((data, inner) => {
        setTimeout(() => {
          inner.postMessage({ id: data.id, result: data.value * 2 });
        }, 20);
      });
      w.on('message', (e) => {
        w.busy = false;
        // 取队列中下一个任务
        if (this.queue.length) {
          const next = this.queue.shift();
          this._run(next.data, next.resolve);
        }
      });
      this.workers.push(w);
    }
  }
  exec(data) {
    return new Promise(resolve => {
      const idle = this.workers.find(w => !w.busy);
      if (idle) this._run(data, resolve);
      else this.queue.push({ data, resolve });
    });
  }
  _run(data, resolve) {
    // 找一个空闲 worker（exec 时已确认）
    const idle = this.workers.find(w => !w.busy);
    if (!idle) return;
    idle.busy = true;
    const handler = (e) => {
      resolve(e.data);
    };
    idle.once('message', handler);
    idle.postMessage(data);
  }
}

// 真实浏览器：navigator.hardwareConcurrency
const cpuCount = os.cpus().length;
const poolSize = Math.max(1, cpuCount - 1);
console.log('  CPU 核心数:', cpuCount, ' 池大小:', poolSize);
const pool = new WorkerPool(poolSize);

const tasks = Array.from({ length: 6 }, (_, i) => ({ id: i, value: i + 1 }));
console.log('  提交', tasks.length, '个任务...');
console.time('全部完成');
Promise.all(tasks.map(t => pool.exec(t))).then(results => {
  console.timeEnd('全部完成');
  console.log('  结果:', results);
  console.log('');

  // --------------------------------------------
  // 演示 2：数据传输方式对比
  // --------------------------------------------
  console.log('【演示 2：数据传输方式对比】');
  const size = 1024 * 1024; // 1MB

  // 模拟结构化克隆（深拷贝）
  const buf = Buffer.alloc(size);
  console.time('  clone(1MB)');
  const cloned = Buffer.from(buf); // 模拟克隆
  console.timeEnd('  clone(1MB)');

  // 模拟 Transferable（转移，零拷贝）
  console.time('  transfer(1MB)');
  const transferred = buf; // 直接引用，无拷贝
  console.timeEnd('  transfer(1MB)');

  // 模拟 SharedArrayBuffer（共享）
  console.time('  shared(1MB)');
  const shared = buf; // 共享引用
  console.timeEnd('  shared(1MB)');

  console.log('  -> 大数据传输优先用 Transferable / SharedArrayBuffer');
  console.log('');

  // --------------------------------------------
  // 演示 3：Worker 创建成本
  // --------------------------------------------
  console.log('【演示 3：Worker 创建 vs 复用】');

  // 模拟每次新建 Worker（含 10ms 创建开销）
  console.time('  新建 5 个 Worker');
  for (let i = 0; i < 5; i++) {
    const w = new FakeWorker(i);
    // 模拟创建开销
    const start = Date.now();
    while (Date.now() - start < 2) { /* busy wait 模拟开销 */ }
  }
  console.timeEnd('  新建 5 个 Worker');

  // 复用 Worker 池
  console.time('  复用池中 Worker');
  for (let i = 0; i < 5; i++) {
    pool.workers[0]; // 直接访问，无创建
  }
  console.timeEnd('  复用池中 Worker');
  console.log('  -> 池化复用显著降低开销');
  console.log('');

  // --------------------------------------------
  // 演示 4：任务耗时阈值判断
  // --------------------------------------------
  console.log('【演示 4：是否该用 Worker？】');
  function shouldUseWorker(taskMs) {
    const CREATE_COST = 30; // 创建成本 ms
    const COMM_COST = 1;    // 通信成本 ms
    return taskMs > (CREATE_COST + COMM_COST);
  }

  const cases = [
    { name: '排序 10 个数', ms: 0.5 },
    { name: '解析 JSON', ms: 2 },
    { name: '图片压缩', ms: 80 },
    { name: '大数据聚合', ms: 300 }
  ];
  cases.forEach(c => {
    const use = shouldUseWorker(c.ms);
    console.log('  ' + c.name + ' (' + c.ms + 'ms) -> ' +
      (use ? '✅ 用 Worker' : '❌ 主线程即可'));
  });
  console.log('');

  // --------------------------------------------
  // 演示 5：内存泄漏示例
  // --------------------------------------------
  console.log('【演示 5：内存泄漏与清理】');
  let leakyWorkers = [];
  // 错误：反复创建不销毁
  for (let i = 0; i < 3; i++) {
    leakyWorkers.push(new FakeWorker(i));
  }
  console.log('  创建了', leakyWorkers.length, '个 worker（未销毁）');
  // 正确：用完 terminate
  leakyWorkers.forEach(w => {
    w.removeAllListeners(); // 模拟 terminate
  });
  leakyWorkers = [];
  console.log('  清理后剩余:', leakyWorkers.length);
  console.log('  -> 经验：用完 Worker 一定 terminate / 移除监听器');

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  ✅ 性能优化演示完成');
  console.log('═══════════════════════════════════════════');
});`,
  },
];
