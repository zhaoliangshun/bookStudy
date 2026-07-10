// =============================================================
// Node.js 运行原理教程（noderun）第 4 批章节
// -------------------------------------------------------------
// 内容：第 13-16 章
//   第 13 章 nr-esm-vs-cjs : ESM 与 CJS 两种模块系统的本质区别
//   第 14 章 nr-buffer     : Buffer 二进制数据基石
//   第 15 章 nr-stream     : Stream 流与背压原理
//   第 16 章 nr-fs         : 文件系统 fs 原理
// 每章包含 content（Markdown 讲解）和 code（可运行 demo）。
// =============================================================

export const chapters = [
  {
    id: "nr-esm-vs-cjs",
    group: "第三部分 模块系统原理",
    icon: "🔀",
    title: "ES Modules 与 CommonJS：两种模块系统的本质区别",
    content: `
## 两种模块系统的来历

在 Node.js 的世界里，模块系统一直存在"两套标准"并存的局面。理解它们的差异，是深入 Node.js 模块机制的第一步。

**CommonJS（简称 CJS）** 是 Node.js 原生的模块系统，诞生于 2009 年。它使用 \`require()\` 引入模块，用 \`module.exports\` 导出模块。它的特点是**同步加载**——遇到 \`require\` 时会停下来，把目标文件读进来、执行完，再继续往下走。依赖关系是在**运行时**才确定的，你可以把 \`require\` 写在 \`if\` 分支里，根据条件动态加载。

**ES Modules（简称 ESM）** 是 JavaScript 官方标准模块系统，由 ES6（ES2015）正式确立。它使用 \`import\` 引入，用 \`export\` 导出。它的核心特点是**静态加载**——所有 \`import\` 必须写在文件顶层，不能放在 \`if\` 里，编译时就能确定整个模块的依赖关系图。

## 核心区别对比

下面这两套系统的核心区别，逐条对比：

1. **加载时机**：CJS 是运行时加载（动态），遇到 \`require\` 才去读文件；ESM 是编译时确定（静态），代码还没执行，引擎就已经分析出了依赖树。
2. **this 指向**：CJS 模块顶层的 \`this\` 等于 \`module.exports\`（默认是空对象）；ESM 模块顶层的 \`this\` 是 \`undefined\`。
3. **\`__dirname\` / \`__filename\`**：CJS 有这两个全局变量，分别表示"当前文件所在目录"和"当前文件绝对路径"；ESM 没有这两个变量，需要用 \`import.meta.url\` 自己转换。
4. **\`require\` / \`module\`**：CJS 有 \`require\`、\`module\`、\`exports\` 这些"全局变量"（其实是模块包装函数注入的参数）；ESM 没有这些。
5. **导出方式**：CJS 导出的是**值的拷贝**（对基本类型是拷贝，对对象是引用拷贝）；ESM 导出的是**值的实时绑定（live binding）**。
6. **顶层 await**：CJS 不支持顶层 \`await\`（必须包在 async 函数里）；ESM 支持（在模块顶层直接写 \`await\`）。
7. **循环依赖处理**：CJS 遇到循环依赖时，会拿到"执行到一半"的不完整 \`exports\`；ESM 因为有 live binding，循环引用时能拿到最终值。

## live binding 是什么意思

这是 ESM 最容易被忽略、却最重要的特性。所谓 live binding（实时绑定），指的是：**ESM 导出的不是一个值的快照，而是一个"引用绑定"**。模块内部修改了这个变量，引入方也能立刻看到最新值。

举个最常见的例子：模块 A 导出一个计数器变量 \`count\` 和一个 \`increment\` 函数；模块 B 引入它们并调用 \`increment()\`。如果是 ESM，B 再读 \`count\` 会看到更新后的值；如果是 CJS，B 读到的 \`count\` 永远是初始值（因为它是值的拷贝）。

## Node.js 如何区分两种模块

Node.js 判断一个 \`.js\` 文件是 CJS 还是 ESM，主要看两处：

- **package.json 的 "type" 字段**：\`"type": "commonjs"\`（默认）按 CJS 处理；\`"type": "module"\` 按 ESM 处理。
- **文件扩展名**：\`.mjs\` 强制按 ESM 处理（无论 package.json 怎么写）；\`.cjs\` 强制按 CJS 处理。

## 寄信 vs 打电话的类比

理解 live binding 与值拷贝，可以用"寄信 vs 打电话"来类比：

- **CJS 是寄信**：你写信时把内容复制一份寄出去，对方收到后，你修改原稿，对方看不到变化（基本类型就是这种情况）。
- **ESM 是打电话**：双方建立的是实时连接，你这边说话对方立刻就能听到，变量改了对方立刻能看到最新值。

## 日常开发启示

1. **为什么 ESM 支持 Tree Shaking**：因为 ESM 是静态分析，打包工具（如 webpack、Rollup、Vite）在编译阶段就能知道哪些导出没被使用，直接删掉。CJS 是运行时加载，工具无法静态判断，所以无法 Tree Shaking。
2. **为什么现代项目推荐用 ESM**：静态分析带来更好的优化、更好的 IDE 提示、更符合 JS 语言标准。
3. **混用时的注意事项**：CJS 中不能直接 \`require()\` 一个 ESM 模块（会报错），需要用动态 \`import()\`；ESM 中可以 \`import\` 一个 CJS 模块，但只能拿到 \`module.exports\` 这个默认导出。

掌握这两套模块系统的差异，能帮助你理解很多"为什么这么写不行"的问题，也是阅读 Node.js 现代 JavaScript 代码的必备知识。
`,
    code: `
// ========== 1. CJS 值拷贝 vs ESM live binding（用对象模拟） ==========
// 由于沙箱环境无法真正切换模块类型，这里用"闭包对象"模拟两种行为差异

// 模拟 CJS 的"值拷贝"行为
// 模块 A：导出一个数字 count 和一个修改函数
function createCjsLikeModule() {
  let count = 0;  // 模块内部状态
  function increment() {
    count++;
  }
  // CJS 导出"值的拷贝"——基本类型被复制一份
  return {
    count: count,           // 这里是 0 的拷贝，之后不会变
    increment: increment,   // 函数是引用，能改内部 count
  };
}

const cjsMod = createCjsLikeModule();
console.log('=== CJS 值拷贝演示 ===');
console.log('初始 count:', cjsMod.count);   // 0
cjsMod.increment();
cjsMod.increment();
console.log('调用两次 increment 后 count:', cjsMod.count);  // 仍然是 0！
console.log('（CJS 中基本类型是拷贝，外部看不到内部变化）');

// 模拟 ESM 的"live binding"行为
// 用 getter 实现"实时绑定"效果
function createEsmLikeModule() {
  let count = 0;
  function increment() {
    count++;
  }
  // ESM 导出的是"绑定"——读取时回去查模块内部的最新值
  return {
    get count() { return count; },  // 每次 read 都拿最新值
    increment: increment,
  };
}

const esmMod = createEsmLikeModule();
console.log('\\n=== ESM live binding 演示 ===');
console.log('初始 count:', esmMod.count);   // 0
esmMod.increment();
esmMod.increment();
console.log('调用两次 increment 后 count:', esmMod.count);  // 2！
console.log('（ESM 中导出是实时绑定，外部能看到内部变化）');

// ========== 2. 动态 import() 的用法 ==========
console.log('\\n=== 动态 import() 演示 ===');
// import() 返回一个 Promise，可以在运行时按需加载模块
// 这里用内置模块演示（不需要真实文件）
async function demoDynamicImport() {
  console.log('开始动态加载模块...');
  // 动态 import 内置模块（如 path）
  const pathModule = await import('path');
  console.log('动态加载成功，path.join:', pathModule.join('a', 'b', 'c'));
  console.log('动态加载的模块是一个对象:', typeof pathModule);
}
await demoDynamicImport();

// ========== 3. CJS 与 ESM 的 this / __dirname 差异 ==========
console.log('\\n=== this 与全局变量差异 ===');

// CJS 模块顶层 this === module.exports（默认是空对象 {}）
// 这里用模块作用域的 this 来演示（沙箱中 this 不一定是 {}，但概念一致）
console.log('当前作用域 this:', typeof this);

// ESM 模块顶层 this === undefined
// 下面模拟 ESM 中的行为
function esmTopLevel() {
  'use strict';  // ESM 默认严格模式
  return this;   // 严格模式下函数 this 是 undefined
}
console.log('ESM 模拟 this（严格模式）:', esmTopLevel());

// CJS 中有 __dirname / __filename
// ESM 中需要用 import.meta.url 转换：
// import { fileURLToPath } from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
console.log('CJS 的 __dirname 在 ESM 中需用 import.meta.url 替代');
console.log('（沙箱中可能没有 __dirname，但概念是这样的）');

// ========== 4. 顶层 await 演示（ESM 特性） ==========
console.log('\\n=== 顶层 await 演示 ===');
// ESM 中可以直接在顶层写 await，不需要包 async 函数
// 这里模拟一个异步操作
function fakeAsyncOp() {
  return new Promise((resolve) => {
    setTimeout(() => resolve('异步结果'), 100);
  });
}

// 在 ESM 模块顶层可以直接 await
const result = await fakeAsyncOp();
console.log('顶层 await 拿到结果:', result);
console.log('（CJS 中顶层不能用 await，必须包在 async 函数里）');

// ========== 5. 模块类型判断逻辑 ==========
console.log('\\n=== Node.js 判断模块类型的逻辑 ===');
function detectModuleType(filename, packageType) {
  // 文件扩展名优先级最高
  if (filename.endsWith('.mjs')) return 'ESM (扩展名 .mjs 强制)';
  if (filename.endsWith('.cjs')) return 'CJS (扩展名 .cjs 强制)';
  // .js 文件看 package.json 的 type 字段
  if (filename.endsWith('.js')) {
    return packageType === 'module' ? 'ESM (package.json type=module)' : 'CJS (package.json type=commonjs)';
  }
  return '未知';
}

console.log(detectModuleType('app.mjs', 'commonjs'));   // ESM
console.log(detectModuleType('app.cjs', 'module'));     // CJS
console.log(detectModuleType('app.js', 'module'));      // ESM
console.log(detectModuleType('app.js', 'commonjs'));    // CJS
`
  },
  {
    id: "nr-buffer",
    group: "第四部分 核心模块与底层机制",
    icon: "🧱",
    title: "Buffer：Node.js 的二进制数据基石",
    content: `
## 为什么需要 Buffer

JavaScript 这门语言最初是为浏览器设计的，它原生只擅长处理"文本"和"DOM"。早期的 JS 完全没有处理**二进制数据**的机制——你要读写一个图片文件、解析一段 TCP 数据包、处理一个 zip 压缩流，JS 都束手无策。

但 Node.js 的定位是"服务器端 JS"，它必须能读写文件、操作网络、处理数据库二进制字段。于是 Node.js 在 V8 引擎之外，引入了一个全局类：**Buffer**，专门用来存放和操作原始二进制数据。

## Buffer 是什么

简单说，Buffer 就是**一段固定长度的内存区域**，里面存的是原始的字节（byte）。每个字节是 8 位，取值范围 0~255。你可以把它想象成 C 语言的 \`char[]\` 数组，只不过它是由 Node.js 管理、在 V8 堆外分配的内存。

Buffer 是 Node.js 的**全局对象**，不需要 \`require\` 就能用。它是处理所有二进制数据的基础——\`fs.readFile\` 默认返回 Buffer，HTTP 请求体也是 Buffer，\`crypto\` 加密的结果还是 Buffer。

## Buffer 的内存分配机制

Node.js 分配 Buffer 用了一套很巧妙的"池化"机制，目的是减少频繁向操作系统申请内存的开销：

- **8KB 以下的 Buffer**：从一个**预分配的 8KB 内存池**（叫 slab）中切出一块来用。多个小 Buffer 共享同一个 slab，避免每个小 Buffer 都向系统申请一次内存。
- **8KB 以上的 Buffer**：直接向操作系统申请一块独立内存，不进池子。

这个 8KB 的池子叫 slab。它本质上是 Node.js 内部维护的一个 \`ArrayBuffer\`，小 Buffer 都是从它身上"切"出来的视图（view）。

## Buffer 与 TypedArray 的关系

ES6 引入了 TypedArray（如 \`Uint8Array\`、\`Int32Array\`），让 JS 也能操作二进制数据。Node.js 的 Buffer 其实**就是 \`Uint8Array\` 的子类**，底层共享同一块 \`ArrayBuffer\`。

这意味着：Buffer 上能用的方法（\`slice\`、\`set\` 等）都来自 TypedArray；同时 Node.js 给 Buffer 加了很多方便方法（\`toString\`、\`write\`、\`concat\`、\`indexOf\` 等），让它更适合处理文本和编码。

## 编码（Encoding）

同样的二进制数据，可以有多种"解读方式"，这就是编码。Buffer 支持的常见编码有：

- **utf8**（默认）：Unicode 文本，中英文都能表示。
- **ascii**：纯英文，每个字节对应一个字符。
- **base64**：把二进制数据编码成纯文本（常见于图片转文本传输）。
- **hex**：每个字节转成两个十六进制字符（如 255 → "ff"）。
- **latin1**：单字节编码，每个字节一个字符。

同一个 Buffer，用不同编码 \`toString\` 出来结果完全不同。理解编码，是避免"中文乱码"问题的关键。

## 常见操作

- **分配**：\`Buffer.alloc(size)\` 分配指定大小并清零；\`Buffer.from(str, encoding)\` 从字符串创建。
- **拼接**：\`Buffer.concat([buf1, buf2])\` 把多个 Buffer 拼成一个。
- **转换**：\`buf.toString(encoding)\` 转字符串；\`buf.toJSON()\` 转 JSON。

## alloc vs allocUnsafe

这两个方法很容易踩坑：

- \`Buffer.alloc(size)\`：分配内存**并且把每个字节都写成 0**，安全，但稍慢。
- \`Buffer.allocUnsafe(size)\`：分配内存但**不清零**，里面可能残留上一个程序留下的旧数据，**可能泄露敏感信息**，但更快。

Node.js 内部为了性能大量使用 \`allocUnsafe\`，但用户代码应该优先用 \`alloc\`，除非你确定会立刻把每个字节都覆盖掉。

## 仓库货架的类比

理解 Buffer 和 slab 机制，可以用"仓库货架"来类比：

- Buffer 是仓库里**固定大小的货架**，每个货架放固定数量的箱子（字节）。
- **小货架**（<8KB）从**公共货架区**（slab 池）划拨，多个小货架共享一个公共区，省得每次都建新仓库。
- **大货架**（>8KB）单独建一个独立仓库，因为太大不适合和别人拼。

\`allocUnsafe\` 就像从公共区划拨一个货架但**没擦干净**——可能还留着上一个用户的货物清单（旧数据），用 \`alloc\` 就是擦干净再给你。

## 日常开发启示

1. **处理文件/网络数据时用 Buffer 而不是字符串**：避免编码问题，尤其是二进制文件（图片、视频）千万别用字符串读。
2. **永远用 \`Buffer.alloc\` 而不是 \`Buffer.allocUnsafe\`**：除非你 100% 确定会立刻覆盖每个字节，否则可能泄露旧数据。
3. **拼接 Buffer 用 \`Buffer.concat\`**：比字符串拼接更高效，也避免编码截断问题（中文字符跨字节会被截断）。
4. **理解 Buffer 是 Uint8Array 子类**：意味着你可以把它传给任何接受 TypedArray 的 API（如 \`crypto.subtle\`）。

Buffer 是 Node.js 处理一切二进制数据的基础，理解它，你就理解了 Node.js 的"数据底座"。
`,
    code: `
// ========== 1. 创建 Buffer 的多种方式 ==========
console.log('=== 1. 创建 Buffer 的多种方式 ===');

// 1.1 alloc：分配并清零（安全）
const buf1 = Buffer.alloc(5);
console.log('Buffer.alloc(5):', buf1);              // <Buffer 00 00 00 00 00>
console.log('转字符串:', buf1.toString());           // （空字符串，因为全是 0）

// 1.2 allocUnsafe：分配不清零（不安全，可能含旧数据）
const bufUnsafe = Buffer.allocUnsafe(5);
console.log('Buffer.allocUnsafe(5):', bufUnsafe);    // 可能含随机旧数据

// 1.3 from：从字符串创建
const buf2 = Buffer.from('Hello', 'utf8');
console.log("Buffer.from('Hello'):", buf2);          // <Buffer 48 65 6c 6c 6f>
console.log('字节数:', buf2.length);                 // 5

// 1.4 from：从数组创建（每个元素是一个字节，0-255）
const buf3 = Buffer.from([72, 101, 108, 108, 111]);
console.log('Buffer.from([72,101,...]):', buf3.toString());  // "Hello"

// 1.5 中文 Buffer（utf8 下一个汉字占 3 字节）
const buf4 = Buffer.from('你好', 'utf8');
console.log("'你好' 的 Buffer:", buf4);              // 6 字节
console.log("'你好' 字节数:", buf4.length);           // 6（不是 2！）

// ========== 2. 读写操作 ==========
console.log('\\n=== 2. 读写操作 ===');

const buf = Buffer.alloc(8);
// 写入字符串（返回写入的字节数）
const written = buf.write('ABC', 0, 'utf8');
console.log('write 返回写入字节数:', written);       // 3
console.log('写入后 buf:', buf);                     // <Buffer 41 42 43 00 ...>

// 直接写一个字节（UInt8）
buf.writeUInt8(255, 3);
console.log('在第3位写入255:', buf);                 // <Buffer 41 42 43 ff ...>

// 读取单个字节
console.log('读取第0位 UInt8:', buf.readUInt8(0));   // 65 = 'A'
console.log('读取第3位 UInt8:', buf.readUInt8(3));   // 255

// 读取并转字符
console.log('第0位对应的字符:', String.fromCharCode(buf.readUInt8(0)));  // 'A'

// ========== 3. 编码转换 ==========
console.log('\\n=== 3. 编码转换 ===');

const text = 'Node.js 真有趣';
const utf8Buf = Buffer.from(text, 'utf8');
console.log('原文:', text);
console.log('utf8 编码字节:', utf8Buf);
console.log('utf8 解码:', utf8Buf.toString('utf8'));

// 转 base64（把二进制编码成纯文本，常见于图片传输）
const base64Str = utf8Buf.toString('base64');
console.log('base64 编码:', base64Str);
console.log('base64 解码:', Buffer.from(base64Str, 'base64').toString('utf8'));

// 转 hex（每个字节转两个十六进制字符）
const hexStr = utf8Buf.toString('hex');
console.log('hex 编码:', hexStr);
console.log('hex 解码:', Buffer.from(hexStr, 'hex').toString('utf8'));

// ========== 4. Buffer.concat 拼接 ==========
console.log('\\n=== 4. Buffer.concat 拼接 ===');

// 模拟流式接收数据，分块到达
const chunk1 = Buffer.from('Hello, ');
const chunk2 = Buffer.from('世界!');
const chunk3 = Buffer.from(' 🌊');

// 用 concat 拼接（比字符串拼接更高效，避免编码问题）
const combined = Buffer.concat([chunk1, chunk2, chunk3]);
console.log('拼接后:', combined.toString('utf8'));
console.log('总长度:', combined.length);

// concat 第二个参数可指定总长度（截断）
const truncated = Buffer.concat([chunk1, chunk2, chunk3], 7);
console.log('指定总长度 7:', truncated.toString('utf8'));

// ========== 5. Buffer 是 Uint8Array 的子类 ==========
console.log('\\n=== 5. Buffer 是 Uint8Array 的子类 ===');

const myBuf = Buffer.from([1, 2, 3, 4, 5]);
console.log('instanceof Uint8Array:', myBuf instanceof Uint8Array);  // true
console.log('instanceof Buffer:', myBuf instanceof Buffer);          // true

// 可以共享 ArrayBuffer
const arrBuf = myBuf.buffer;  // 底层的 ArrayBuffer
console.log('底层 ArrayBuffer 字节长度:', arrBuf.byteLength);

// 用 Uint8Array 视图操作同一块内存
const view = new Uint8Array(arrBuf);
view[0] = 99;
console.log('通过 Uint8Array 修改后，Buffer 第一字节:', myBuf[0]);    // 99（同步变化）

// ========== 6. 模拟 slab 池机制（示意） ==========
console.log('\\n=== 6. slab 池机制示意 ===');

// 模拟 Node.js 的 8KB 池
const POOL_SIZE = 8192;
const pool = Buffer.allocUnsafe(POOL_SIZE);  // 公共池
let poolOffset = 0;

// 自定义小 Buffer 分配器
function allocFromPool(size) {
  if (size > POOL_SIZE) {
    // 超大 Buffer 直接独立分配
    console.log(\`  申请 \${size} 字节 → 超过池大小，独立分配\`);
    return Buffer.allocUnsafe(size);
  }
  // 从池中切一块
  const start = poolOffset;
  poolOffset += size;
  console.log(\`  申请 \${size} 字节 → 从池中切 [\${start}, \${poolOffset})\`);
  return pool.slice(start, poolOffset);
}

console.log('分配三个小 Buffer：');
allocFromPool(10);
allocFromPool(20);
allocFromPool(100);
console.log(\`池已用: \${poolOffset} / \${POOL_SIZE} 字节\`);
console.log('（多个小 Buffer 共享一个 8KB 池，减少系统调用）');
`
  },
  {
    id: "nr-stream",
    group: "第四部分 核心模块与底层机制",
    icon: "🌊",
    title: "Stream 流：管道与背压原理",
    content: `
## 为什么需要 Stream

想象这样一个场景：你要把一个 10GB 的视频文件从磁盘读出来再写到另一个位置。如果用 \`fs.readFile\`，它会**一次性**把整个 10GB 读进内存——结果内存直接爆炸，程序崩溃。

Stream 就是为解决这个问题而生的。它的核心思想是：**不要一次性把所有数据读进内存，而是一点一点地"流"过去**。无论数据总量是 1KB 还是 10GB，内存占用始终是恒定的（只占当前那一小块缓冲区）。这就是所谓的"分块处理"。

Stream 的应用场景非常广：大文件读写、HTTP 请求/响应、TCP 网络通信、gzip 压缩、加密转换……几乎所有"持续产生数据"的场景都用 Stream。

## Stream 的四种类型

Node.js 的 Stream 分为四类：

1. **Readable（可读流）**：数据来源，可以从中"读"数据。典型例子：\`fs.createReadStream\`、HTTP 请求体（\`req\`）、\`process.stdin\`。
2. **Writable（可写流）**：数据去向，可以往里"写"数据。典型例子：\`fs.createWriteStream\`、HTTP 响应体（\`res\`）、\`process.stdout\`。
3. **Duplex（双工流）**：既可读又可写，读写互不干扰（两个独立的通道）。典型例子：TCP socket、WebSocket。
4. **Transform（转换流）**：读入数据、处理一下、再写出。读写是关联的（同一个通道）。典型例子：\`zlib.createGzip()\`（压缩）、\`crypto.createCipheriv()\`（加密）。

## Stream 的两种工作模式

Readable 流有两种工作模式：

- **流动模式（flowing）**：数据源源不断地自动往外冒，触发 \`data\` 事件。像打开水龙头，水自己流。
- **暂停模式（paused）**：数据停在缓冲区里，需要你手动调 \`read()\` 才能取下一块。像水龙头关着，你按一下出一点。

默认创建的 Readable 是暂停模式。调 \`on('data')\` 或 \`resume()\` 会切到流动模式；调 \`pause()\` 切回暂停模式。

## pipe 管道的原理

\`readable.pipe(writable)\` 是 Stream 最方便的用法：它把可读流的数据**自动**写入可写流，直到可读流结束。背后它做了三件事：

1. 监听可读流的 \`data\` 事件，拿到数据就调 \`writable.write()\`。
2. 监听可读流的 \`end\` 事件，调 \`writable.end()\` 关闭可写流。
3. **自动处理背压**（这是 pipe 最大的价值）。

一行 \`pipe\` 就能完成"边读边写"的复杂工作，是 Node.js 流式处理的精髓。

## 背压（Backpressure）问题

这是 Stream 最核心、也最容易被忽视的问题。

想象一个场景：可读流（生产者）每秒能产生 100MB 数据，但可写流（消费者）每秒只能写入 10MB。生产者写得快、消费者写得慢，数据就在可写流的内部缓冲区里越堆越多，**最终内存爆炸**——这就是背压问题。

"背压"这个词来自流体力学：水管里下游堵了，压力会反向传到上游。在 Stream 里就是：消费者处理不过来，压力要反传给生产者，让生产者暂停一会儿。

## 背压的处理机制

Node.js 的处理方式很优雅：

- \`writable.write(chunk)\` 会返回一个布尔值：
  - 返回 \`true\`：可写流还能处理，继续写。
  - 返回 \`false\`：可写流的内部缓冲区超过 \`highWaterMark\`（高水位线），表示"我处理不过来了"。
- 当 \`write\` 返回 \`false\` 时，可读流应该调 \`pause()\` 暂停读取。
- 等可写流把缓冲区排空，会触发 \`drain\` 事件，此时可读流再调 \`resume()\` 恢复读取。

**pipe 内部就实现了这套逻辑**，所以用 \`pipe\` 时背压是自动处理的。但如果你手动监听 \`data\` 事件来写数据，就必须自己实现背压控制，否则就可能内存暴涨。

## 水管类比

理解 Stream 和背压，用"水管"来类比最直观：

- **Stream 是水管**，数据是水流。
- **Readable 是水龙头**（水源），**Writable 是排水口**（去处）。
- **背压**是排水口堵了（消费者慢），水龙头应该关小（暂停生产），否则水会溢出来（内存暴涨）。
- **pipe 是把水龙头直接接到排水口**，并且装了一个"自动阀门"——排水口堵了自动关水龙头，疏通了再打开。

## 日常开发启示

1. **处理大文件用 Stream 而不是 \`readFile/writeFile\`**：避免一次性读进内存。
2. **HTTP 请求/响应本身就是 Stream**：\`req\` 是 Readable，\`res\` 是 Writable，可以用 \`pipe\` 高效转发。
3. **理解背压有助于排查"内存暴涨"**：如果你的服务在处理大流量时内存飙升，多半是背压没处理好——手动 \`on('data')\` 忘了 \`pause\`，或者 Transform 流处理太慢。
4. **用 \`pipeline\` 替代 \`pipe\`**：\`stream.pipeline\` 能正确处理错误传播和资源清理，比 \`pipe\` 更安全。

Stream 是 Node.js 最强大也最容易被低估的特性。掌握它，你就能写出高性能、低内存占用的数据处理程序。
`,
    code: `
// ========== 1. 自定义 Readable 流（简化版） ==========
console.log('=== 1. 自定义 Readable 流（简化版） ===');

// 用 EventEmitter 模拟一个可读流
const { EventEmitter } = require('events');

class SimpleReadable extends EventEmitter {
  constructor(data) {
    super();
    this.data = data;       // 数据块数组
    this.index = 0;
    this.paused = false;
  }
  start() {
    // 模拟流动模式：每隔几毫秒推一块数据
    this.timer = setInterval(() => {
      if (this.paused) return;       // 背压时暂停
      if (this.index >= this.data.length) {
        this.emit('end');            // 数据读完
        clearInterval(this.timer);
        return;
      }
      this.emit('data', this.data[this.index++]);
    }, 5);
  }
  pause() { this.paused = true; }
  resume() { this.paused = false; }
}

// 创建一个可读流：5 个数据块
const chunks = ['chunk1-', 'chunk2-', 'chunk3-', 'chunk4-', 'chunk5-'];
const readable = new SimpleReadable(chunks);

readable.on('data', (chunk) => {
  console.log('读到:', chunk);
});
readable.on('end', () => {
  console.log('（流结束）');
});
readable.start();

// ========== 2. pipe 的简化实现（含背压控制） ==========
console.log('\\n=== 2. pipe 简化实现（含背压控制） ===');

// 模拟一个可写流
class SimpleWritable extends EventEmitter {
  constructor() {
    super();
    this.buffer = [];            // 内部缓冲区
    this.highWaterMark = 3;      // 高水位线（缓冲区超过这个值就该暂停）
    this.draining = false;
  }
  write(chunk) {
    this.buffer.push(chunk);
    // 返回 false 表示"处理不过来了，请暂停"
    const shouldPause = this.buffer.length > this.highWaterMark;
    if (shouldPause) {
      console.log(\`  [Writable] 缓冲区 \${this.buffer.length} > \${this.highWaterMark}，返回 false（背压）\`);
      // 模拟慢速消费：1 秒后排空
      if (!this.draining) {
        this.draining = true;
        setTimeout(() => {
          const drained = this.buffer.splice(0);  // 排空
          console.log(\`  [Writable] 排空 \${drained.length} 块，触发 drain\`);
          this.draining = false;
          this.emit('drain');
        }, 30);
      }
      return false;
    }
    return true;
  }
  end() {
    console.log('  [Writable] end() 被调用，剩余:', this.buffer.length, '块');
    this.emit('finish');
  }
}

// 手写简化版 pipe：把 readable 的数据自动写入 writable
function simplePipe(source, dest) {
  let paused = false;

  source.on('data', (chunk) => {
    const ok = dest.write(chunk);
    if (!ok && !paused) {
      // 背压：暂停读取
      console.log('  [pipe] 收到 false，暂停读取');
      source.pause();
      paused = true;
    }
  });

  dest.on('drain', () => {
    // 缓冲区排空，恢复读取
    console.log('  [pipe] 收到 drain，恢复读取');
    source.resume();
    paused = false;
  });

  source.on('end', () => {
    dest.end();
  });

  return dest;
}

// 演示：快速生产、慢速消费，观察背压
const fastData = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const src = new SimpleReadable(fastData);
const dst = new SimpleWritable();

console.log('启动 pipe，观察背压现象：');
simplePipe(src, dst);
src.start();

// ========== 3. 用 Node.js 内置 Stream 演示 ==========
console.log('\\n=== 3. 用内置 Stream 演示（异步，需等上面结束） ===');

// 延时执行，避免和上面混在一起
setTimeout(() => {
  const { Readable, Writable, pipeline } = require('stream');

  // 自定义 Readable：产生 0-4 五个数字
  const counter = Readable.from([0, 1, 2, 3, 4].map(n => String(n)));

  // 自定义 Writable：打印每个 chunk
  const printer = new Writable({
    write(chunk, encoding, callback) {
      console.log('  内置 Writable 收到:', chunk.toString());
      callback();
    }
  });

  // 用 pipeline 连接（比 pipe 更安全，自动处理错误）
  pipeline(counter, printer, (err) => {
    if (err) console.error('  pipeline 出错:', err);
    else console.log('  pipeline 完成');
  });
}, 200);

// ========== 4. 模拟背压导致的内存堆积 ==========
console.log('\\n=== 4. 背压未处理时的内存堆积示意 ===');

function demoNoBackpressure() {
  let memoryGrowth = 0;        // 模拟内存增长
  let processed = 0;
  let produced = 0;

  // 生产者：每 1ms 产生 1 块
  const producer = setInterval(() => {
    produced++;
    memoryGrowth++;            // 数据堆进缓冲区
    if (produced >= 20) clearInterval(producer);
  }, 1);

  // 消费者：每 10ms 才消费 1 块（慢）
  const consumer = setInterval(() => {
    if (memoryGrowth > 0) {
      memoryGrowth--;          // 消费掉一块
      processed++;
    }
    if (processed >= 20) {
      clearInterval(consumer);
      console.log(\`  生产 \${produced} 块，消费 \${processed} 块\`);
      console.log(\`  峰值堆积: \${memoryGrowth} 块（如果不处理背压，内存会涨到这里）\`);
    }
  }, 10);
}
demoNoBackpressure();

console.log('（观察上面：生产快、消费慢 → 数据堆积 → 必须用背压控制）');
`
  },
  {
    id: "nr-fs",
    group: "第四部分 核心模块与底层机制",
    icon: "📁",
    title: "文件系统 fs 原理：同步、异步与底层 IO",
    content: `
## fs 模块的三种 API 风格

Node.js 的 \`fs\` 模块是操作文件系统的核心模块，它提供了**三种风格**的 API 来完成同一件事：

1. **同步 API**（如 \`readFileSync\`）：调用后**阻塞主线程**，等磁盘操作完成才返回结果。命名上都有 \`Sync\` 后缀。
2. **回调异步 API**（如 \`readFile\`）：调用后立刻返回，不阻塞；磁盘操作完成后再调用你传入的回调函数。
3. **Promise 异步 API**（如 \`fs.promises.readFile\`）：返回一个 Promise，配合 \`async/await\` 使用，代码风格更现代。

这三种 API 做的事情完全一样，区别只在于"调用方怎么拿到结果"。

## 为什么有同步 API

Node.js 一直强调"不要阻塞事件循环"，那为什么还要提供同步 API？主要是为了**启动阶段**的便利。

比如应用启动时要加载配置文件（\`config.json\`）、读取 SSL 证书、加载字典数据——这些操作在服务**还没开始接受请求**之前发生，阻塞一下没什么影响，而且同步代码写起来最简单、最直观。一旦服务启动完成、开始处理请求，就绝对不能再用同步 API 了。

## 异步 IO 的底层原理

这是 Node.js 最精妙的部分。当你在 JS 里调用 \`fs.readFile\` 时，背后发生了这些事：

1. **JS 层**：调用 \`fs.readFile(path, callback)\`，Node.js 把这个 IO 请求包装好，交给底层的 \`libuv\`。
2. **libuv 层**：libuv 是 Node.js 的事件循环库。它知道**磁盘 IO 是阻塞操作**（不像网络 IO 可以用 epoll/kqueue 异步），所以它把磁盘读写任务**丢给线程池**（默认 4 个线程）。
3. **线程池**：某个工作线程拿到任务，执行真正的 \`read()\` 系统调用，阻塞地等磁盘返回数据。
4. **完成通知**：磁盘数据读回来后，工作线程把结果交给 libuv。
5. **事件循环**：libuv 在事件循环的某个阶段（poll 阶段）检测到这个 IO 完成了，就把"完成"事件加到队列里。
6. **回调执行**：事件循环回到 JS 层时，执行你当初传的 \`callback\`，拿到的就是文件内容。

**关键理解**：磁盘 IO 本身是阻塞的，Node.js 用**线程池**来"挡"这个阻塞——JS 主线程不阻塞，阻塞的是后台的工作线程。这就是为什么 Node.js 号称"异步非阻塞"，但其实底层对磁盘 IO 用了线程。

## 文件描述符（File Descriptor）

操作系统用一个**整数**来表示"一个打开的文件"（或 socket、管道等），这个整数叫**文件描述符（fd）**。

- 进程每打开一个文件，操作系统就给它分配一个 fd（从 0 开始）。
- 0、1、2 默认被占用：0 是 stdin、1 是 stdout、2 是 stderr。
- 你打开的第一个文件 fd 通常是 3。
- 所有 fs 操作底层都基于 fd：\`fs.open\` 拿到 fd，\`fs.read(fd, ...)\` 读写，\`fs.close(fd)\` 关闭。

Node.js 的 \`fs.readFile\` 内部其实就是"打开 → 读 → 关闭"三步的封装。如果你要多次读写同一个文件，手动用 \`open\` + \`read\` + \`close\` 比 \`readFile\` 更高效。

## 图书馆类比

理解同步、异步和线程池，用"图书馆"来类比最贴切：

- **同步 API**：你亲自去图书馆找书。你得在书架前等找到才能做别的，整个过程被"阻塞"。
- **回调异步 API**：你委托图书管理员去找书，把你的电话（callback）留给他。你立刻能去做别的，管理员找到了打电话通知你。
- **线程池**：图书管理员团队（默认 4 个人）。同时最多 4 个找书任务在并行处理；第 5 个任务得排队等。

\`fs.readFile\` 不阻塞 JS 主线程，因为"找书"的活儿交给了图书管理员（工作线程），主线程只是去图书馆柜台登个记就走了。

## 日常开发启示

1. **生产环境绝对不要用同步 API**：会阻塞事件循环，所有请求都被卡住。同步 API 只适合启动阶段。
2. **理解线程池机制**：默认 4 个线程，意味着同时进行的磁盘 IO 最多 4 个。如果你的服务有大量文件操作，可能打满线程池，导致"明明是异步的，却感觉变慢了"。可以通过 \`UV_THREADPOOL_SIZE\` 环境变量调大。
3. **用 \`fs.promises\` 配合 \`async/await\` 是最佳实践**：代码可读性接近同步，但实际是异步的，不阻塞主线程。
4. **大量小文件操作要批量并发**：用 \`Promise.all\` 并发处理多个文件，但要注意控制并发数（避免打满线程池或耗尽 fd）。

理解 fs 的三种 API 风格和底层线程池机制，你就能写出既高效又可维护的文件处理代码，也能在遇到"IO 卡顿"时知道从哪里排查。
`,
    code: `
// ========== 1. 三种 API 风格对比 ==========
console.log('=== 1. 三种 API 风格对比 ===');

const fs = require('fs');
const path = require('path');
const os = require('os');

// 准备一个临时测试文件
const tmpFile = path.join(os.tmpdir(), 'noderun-fs-demo.txt');
fs.writeFileSync(tmpFile, 'Hello, Node.js fs!');

// 1.1 同步 API：阻塞，直接返回结果
console.log('\\n--- 同步 readFileSync ---');
const syncContent = fs.readFileSync(tmpFile, 'utf8');
console.log('同步读取结果:', syncContent);

// 1.2 回调异步 API：不阻塞，结果在回调里
console.log('\\n--- 回调 readFile ---');
fs.readFile(tmpFile, 'utf8', (err, data) => {
  if (err) return console.error('出错:', err);
  console.log('回调读取结果:', data);
});

// 1.3 Promise 异步 API：返回 Promise，配合 async/await
console.log('\\n--- Promise fs.promises.readFile ---');
async function promiseRead() {
  const data = await fs.promises.readFile(tmpFile, 'utf8');
  console.log('Promise 读取结果:', data);
}
promiseRead();

// ========== 2. 文件描述符（fd）的使用 ==========
console.log('\\n=== 2. 文件描述符（fd）的使用 ===');

// 手动 open → read → close，能看到 fd 是个整数
const fd = fs.openSync(tmpFile, 'r');
console.log('打开文件得到的 fd:', fd);   // 通常是 3 或更大的整数
console.log('（0=stdin, 1=stdout, 2=stderr，所以新 fd 从 3 开始）');

// 用 fd 读取（需要先分配 Buffer）
const readBuf = Buffer.alloc(20);
const bytesRead = fs.readSync(fd, readBuf, 0, 20, 0);  // 从位置 0 读 20 字节
console.log('实际读取字节数:', bytesRead);
console.log('读到的内容:', readBuf.toString('utf8', 0, bytesRead));

// 用完必须关闭，否则会泄露 fd
fs.closeSync(fd);
console.log('已关闭 fd');

// ========== 3. 大量文件操作的并发（用 setTimeout 模拟 IO） ==========
console.log('\\n=== 3. 大量文件操作的并发 ===');

// 模拟：同时发起 5 个文件读取，观察完成顺序
async function concurrentRead() {
  // 先创建 5 个临时文件
  const files = [];
  for (let i = 0; i < 5; i++) {
    const f = path.join(os.tmpdir(), \`noderun-concurrent-\${i}.txt\`);
    fs.writeFileSync(f, \`文件 \${i} 的内容\`);
    files.push(f);
  }

  console.log('同时发起 5 个 readFile：');
  const start = Date.now();

  // 方式 A：串行（一个接一个，慢）
  // for (const f of files) {
  //   await fs.promises.readFile(f, 'utf8');
  // }

  // 方式 B：并发（同时发起，快）—— 推荐做法
  await Promise.all(files.map(async (f, i) => {
    const content = await fs.promises.readFile(f, 'utf8');
    console.log(\`  [\${i}] 完成: \${content}（耗时 \${Date.now() - start}ms）\`);
  }));

  console.log(\`全部完成，总耗时 \${Date.now() - start}ms\`);

  // 清理
  files.forEach(f => fs.unlinkSync(f));
}
concurrentRead();

// ========== 4. async/await 读写文件的最佳实践 ==========
console.log('\\n=== 4. async/await 最佳实践 ===');

async function bestPractice() {
  const targetFile = path.join(os.tmpdir(), 'noderun-best-practice.txt');

  try {
    // 写入
    await fs.promises.writeFile(targetFile, '第一行内容\\n', 'utf8');
    console.log('写入完成');

    // 追加（用 flag: 'a'）
    await fs.promises.appendFile(targetFile, '第二行内容\\n', 'utf8');
    console.log('追加完成');

    // 读取
    const content = await fs.promises.readFile(targetFile, 'utf8');
    console.log('读取结果:');
    console.log(content);

    // 获取文件信息
    const stats = await fs.promises.stat(targetFile);
    console.log('文件大小:', stats.size, '字节');
    console.log('是否文件:', stats.isFile());
    console.log('是否目录:', stats.isDirectory());
    console.log('创建时间:', stats.birthtime.toLocaleString());

  } catch (err) {
    console.error('操作失败:', err.message);
  } finally {
    // 清理
    try { await fs.promises.unlink(targetFile); } catch (e) {}
  }
}
bestPractice();

// ========== 5. 线程池机制说明 ==========
console.log('\\n=== 5. 线程池机制说明 ===');
console.log('fs.readFile 底层流程:');
console.log('  1. JS 调用 fs.readFile(path, callback)');
console.log('  2. Node.js 把请求交给 libuv');
console.log('  3. libuv 把磁盘读写任务丢给线程池（默认 4 线程）');
console.log('  4. 工作线程执行阻塞的 read() 系统调用');
console.log('  5. 读取完成后，libuv 通过事件循环通知主线程');
console.log('  6. 主线程执行 callback');
console.log('\\n线程池大小可通过 UV_THREADPOOL_SIZE 环境变量调整:');
console.log('  默认:', process.env.UV_THREADPOOL_SIZE || 4);
console.log('  （大量文件操作时可调大，如 UV_THREADPOOL_SIZE=16）');

// ========== 6. 演示同步阻塞 vs 异步非阻塞 ==========
console.log('\\n=== 6. 同步阻塞 vs 异步非阻塞 ===');

// 异步 IO 期间，主线程可以做别的事
console.log('发起异步 readFile 后，主线程立刻继续执行：');
fs.readFile(tmpFile, 'utf8', (err, data) => {
  console.log('  （异步回调执行）读到:', data);
});
console.log('这行会先打印（主线程没被阻塞）');
console.log('同步 API 则会卡住主线程直到完成');

// 清理
setTimeout(() => {
  try { fs.unlinkSync(tmpFile); } catch (e) {}
  console.log('\\n（演示文件已清理）');
}, 100);
`
  }
];
