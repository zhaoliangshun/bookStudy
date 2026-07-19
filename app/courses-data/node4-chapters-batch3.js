export const chapters = [
  {
    id: 'n4-events',
    group: '第二部分 核心模块',
    icon: '📢',
    title: 'events 模块：事件驱动编程的核心',
    content: `## 📢 events 模块：事件驱动编程的核心

Node.js 的核心设计哲学之一是**事件驱动**和**非阻塞 I/O**，而 \`events\` 模块就是实现这一理念的基础。几乎所有 Node.js 的核心模块都继承自 \`EventEmitter\` 类，它是 Node.js 异步事件处理的基石。

### EventEmitter 类

\`EventEmitter\` 是一个用于发布-订阅模式的类，它允许对象：
- **发射（emit）** 命名事件
- **监听（listen）** 并响应事件
- 管理监听器的生命周期

在 Node.js 中，你几乎不需要自己从头实现事件机制，\`events\` 模块已经提供了完整的解决方案。

### 核心方法详解

| 方法 | 说明 |
|------|------|
| \`on(event, listener)\` | 添加一个持续监听的监听器（别名：\`addListener\`） |
| \`once(event, listener)\` | 添加一个只执行一次的监听器 |
| \`off(event, listener)\` | 移除指定的监听器（别名：\`removeListener\`） |
| \`removeAllListeners([event])\` | 移除所有监听器，或指定事件的所有监听器 |
| \`emit(event, ...args)\` | 触发事件，传递参数给监听器 |
| \`listeners(event)\` | 返回指定事件的监听器数组 |
| \`listenerCount(event)\` | 返回指定事件的监听器数量 |
| \`eventNames()\` | 返回所有已注册的事件名数组 |
| \`setMaxListeners(n)\` | 设置最大监听器数量（默认10） |

### ⚠️ error 事件：必须监听！

这是最重要的规则之一：**如果 EventEmitter 发射了 \`error\` 事件但没有监听器，Node.js 会直接抛出错误并退出进程！**

所以，每当你使用 EventEmitter（或继承自它的对象，如流、HTTP 服务器等），都应该始终监听 \`error\` 事件。

### MaxListeners 警告

默认情况下，如果一个事件添加超过 10 个监听器，Node.js 会打印警告。这通常意味着内存泄漏，但如果你确实需要更多监听器，可以用 \`setMaxListeners(0)\`（0表示无限制）或设置一个合理的数值。

### 继承 EventEmitter

在实际开发中，你通常不会直接使用 EventEmitter 实例，而是**继承**它来创建自己的类。这是 Node.js 中最常见的模式之一。

### EventEmitter vs 回调函数

| 特性 | EventEmitter | 回调函数 |
|------|--------------|----------|
| 多响应 | 一个事件可以有多个监听器 | 一个操作通常只有一个回调 |
| 解耦 | 发布者和订阅者完全解耦 | 调用者和被调用者紧密耦合 |
| 适用场景 | 可能发生多次、多监听者的事件 | 一次性完成的操作 |
| 数据流 | 适合数据流式处理（如流） | 适合单次结果返回 |

### 🚨 内存泄漏问题

事件监听器如果不及时移除，会导致内存泄漏。常见场景：
1. 在循环中反复添加监听器但不清理
2. 闭包引用了外部大对象
3. 长生命周期对象上监听短生命周期对象的事件

**最佳实践：**
- 使用 \`once()\` 替代 \`on()\`（如果只需要响应一次）
- 在不需要时显式调用 \`removeListener()\` 或 \`removeAllListeners()\`
- 注意 MaxListeners 警告

### Node.js 核心中的 EventEmitter

几乎所有核心模块都使用 EventEmitter：
- **Streams**：\`data\`, \`end\`, \`error\`, \`close\` 等事件
- **HTTP**：\`request\`, \`response\`, \`connection\` 等事件
- **net.Socket**：\`connect\`, \`data\`, \`end\`, \`timeout\` 等事件
- **fs.FSWatcher**：\`change\`, \`error\` 事件
- **child_process**：\`exit\`, \`close\`, \`message\` 等事件

### 💡 实用技巧

1. **事件名使用常量**：避免拼写错误
2. **同步执行监听器**：\`emit()\` 是同步调用所有监听器的
3. **异步监听器**：如果监听器是异步的，EventEmitter 不会等待它完成
4. **监听器中的 this**：在普通函数中，\`this\` 指向 EventEmitter 实例
`,
    code: `// ============================================
// 示例1：EventEmitter 基础用法
// ============================================

const { EventEmitter } = require('events');

// 创建一个 EventEmitter 实例
const myEmitter = new EventEmitter();

// 使用 on() 添加持续监听的监听器
// 第一个参数是事件名，第二个是回调函数
myEmitter.on('greet', (name) => {
  console.log(\`你好，\${name}！这是第一个监听器\`);
});

// 可以为同一个事件添加多个监听器
myEmitter.on('greet', (name) => {
  console.log(\`欢迎，\${name}！这是第二个监听器\`);
});

// emit() 触发事件，可以传递任意参数
console.log('--- 触发 greet 事件 ---');
myEmitter.emit('greet', '张三');

// 使用 once() 添加只执行一次的监听器
myEmitter.once('oneTime', () => {
  console.log('这个消息只会出现一次！');
});

console.log('\\n--- 第一次触发 oneTime 事件 ---');
myEmitter.emit('oneTime');
console.log('--- 第二次触发 oneTime 事件（不会有输出） ---');
myEmitter.emit('oneTime');

// 查看已注册的事件名
console.log('\\n已注册的事件名:', myEmitter.eventNames());
console.log('greet 事件的监听器数量:', myEmitter.listenerCount('greet'));


// ============================================
// 示例2：error 事件处理（必须监听！）
// ============================================

const safeEmitter = new EventEmitter();

// 必须监听 error 事件，否则程序会崩溃！
safeEmitter.on('error', (err) => {
  console.error('捕获到错误:', err.message);
});

// 触发 error 事件
safeEmitter.emit('error', new Error('这是一个测试错误'));
console.log('程序继续运行，没有崩溃！');


// ============================================
// 示例3：移除监听器
// ============================================

const emitter = new EventEmitter();

// 注意：要移除监听器，必须保存对回调函数的引用
const callback1 = () => {
  console.log('回调1被调用');
};

const callback2 = () => {
  console.log('回调2被调用');
};

emitter.on('test', callback1);
emitter.on('test', callback2);

console.log('\\n--- 移除前，监听器数量:', emitter.listenerCount('test'));
emitter.emit('test');

// 使用 off() 移除特定监听器
emitter.off('test', callback1);
console.log('--- 移除 callback1 后，监听器数量:', emitter.listenerCount('test'));
emitter.emit('test');

// 移除所有监听器
emitter.removeAllListeners('test');
console.log('--- 移除所有后，监听器数量:', emitter.listenerCount('test'));


// ============================================
// 示例4：自定义类继承 EventEmitter
// ============================================

class Server extends EventEmitter {
  constructor(port) {
    super(); // 必须调用父类构造函数
    this.port = port;
  }

  start() {
    console.log(\`服务器正在启动，端口: \${this.port}\`);
    
    // 模拟启动过程
    setTimeout(() => {
      this.emit('start', { port: this.port, time: new Date() });
    }, 100);
  }

  request(data) {
    // 模拟请求处理
    setTimeout(() => {
      this.emit('request', data);
      this.emit('response', { status: 200, data: '响应数据' });
    }, 50);
  }
}

// 使用自定义的 EventEmitter 类
const server = new Server(3000);

// 监听各种事件
server.on('start', (info) => {
  console.log('\\n✅ 服务器已启动:', info);
});

server.on('request', (data) => {
  console.log('收到请求:', data);
});

server.on('response', (res) => {
  console.log('发送响应:', res);
});

// 别忘了 error 事件！
server.on('error', (err) => {
  console.error('服务器错误:', err);
});

server.start();
server.request({ method: 'GET', url: '/api/users' });

// 设置最大监听器数量（0表示无限制）
server.setMaxListeners(20);


// ============================================
// 示例5：演示监听器的同步执行特性
// ============================================

const syncEmitter = new EventEmitter();

syncEmitter.on('order', () => {
  console.log('\\n监听器1开始');
  // 即使这里有同步操作，也是按顺序执行
  for (let i = 0; i < 1000000; i++) {} // 模拟耗时同步操作
  console.log('监听器1结束');
});

syncEmitter.on('order', () => {
  console.log('监听器2开始');
  console.log('监听器2结束');
});

console.log('\\n--- 触发事件前 ---');
syncEmitter.emit('order');
console.log('--- 触发事件后 ---');
console.log('注意：emit() 是同步的，所有监听器执行完才会继续！');
`,
  },
  {
    id: 'n4-stream-basics',
    group: '第二部分 核心模块',
    icon: '🌊',
    title: 'Stream 基础：流的概念与可读流',
    content: `## 🌊 Stream 基础：流的概念与可读流

流（Stream）是 Node.js 中处理数据的核心概念之一。它是一种**有序的、有起点和终点的数据流**，允许你逐块（chunk）处理数据，而不是一次性将所有数据加载到内存中。

### 为什么需要流？

想象一下，你需要读取一个 10GB 的文件：
- **不使用流**（\`fs.readFile\`）：需要将整个 10GB 加载到内存中，可能导致内存溢出
- **使用流**：每次只读取一小块数据（如 64KB），内存占用始终保持在很低的水平

流的优势：
1. **内存效率**：不需要加载全部数据到内存
2. **时间效率**：可以立即开始处理数据，而不需要等待全部数据到达
3. **组合性**：可以通过管道（pipe）将多个流组合起来

### 四种流类型

Node.js 中有四种基本的流类型：

| 类型 | 说明 | 例子 |
|------|------|------|
| **Readable（可读流）** | 数据可以从中读取（数据源） | fs.createReadStream, HTTP 响应 |
| **Writable（可写流）** | 数据可以写入其中（数据目的地） | fs.createWriteStream, HTTP 请求 |
| **Duplex（双工流）** | 既可读又可写 | net.Socket（TCP 套接字） |
| **Transform（转换流）** | 数据在读写过程中可以修改或转换 | zlib.createGzip（压缩） |

### 可读流（Readable）

可读流是数据的来源，它有两种模式：

#### 1. Flowing Mode（流动模式）
数据自动从底层系统读取，并通过事件尽快提供给应用程序。
- 监听 \`data\` 事件后进入流动模式
- 数据会源源不断地通过 \`data\` 事件推送过来

#### 2. Paused Mode（暂停模式）
必须显式调用 \`stream.read()\` 来读取数据块。
- 这是默认模式
- 调用 \`pause()\` 可以切换回暂停模式
- 调用 \`resume()\` 可以切换回流动模式

### 可读流的关键事件

| 事件 | 说明 |
|------|------|
| \`data\` | 当有数据块可用时触发（进入流动模式） |
| \`end\` | 当没有更多数据可读时触发 |
| \`error\` | 读取过程中发生错误时触发 |
| \`close\` | 流关闭时触发 |
| \`readable\` | 有数据可读取时触发（暂停模式） |

### pipe() 方法：管道的魔力

\`readable.pipe(writable)\` 是流的核心方法，它：
1. 将可读流的数据自动写入可写流
2. **自动处理背压（backpressure）**（下一章详细讲）
3. 自动管理流的流速
4. 当可读流结束时，自动结束可写流

可以链式调用：\`a.pipe(b).pipe(c).pipe(d)\`

### 重要选项

- **encoding**：指定编码（如 \`'utf8'\`），否则数据是 Buffer
- **highWaterMark**：内部缓冲区的大小（默认 64KB 对于二进制，16KB 对于对象模式）
- **start/end**：读取文件的字节范围
- **objectMode**：是否允许流处理 JavaScript 对象（而不只是 Buffer/String）

### 💡 流的状态

可读流有几个重要的状态属性：
- \`readableFlowing\`：当前是否在流动模式（null/true/false）
- \`readableHighWaterMark\`：highWaterMark 值
- \`readableLength\`：缓冲区中当前的数据量
`,
    code: `// ============================================
// 示例1：使用 fs.createReadStream 读取文件
// ============================================

const fs = require('fs');
const path = require('path');

// 创建一个大测试文件用于演示
const testFile = path.join(__dirname, 'large-test.txt');
// 写入一些测试数据
fs.writeFileSync(testFile, '这是第一行文本\\n'.repeat(1000));

// 创建可读流
// highWaterMark 设置每次读取的数据块大小（这里用小值便于演示）
const readable = fs.createReadStream(testFile, {
  encoding: 'utf8',
  highWaterMark: 100 // 每次读取100字节
});

let chunkCount = 0;

// data 事件：每当有数据块可读时触发
readable.on('data', (chunk) => {
  chunkCount++;
  console.log(\`--- 收到第 \${chunkCount} 块数据 ---'\`);
  console.log(\`数据长度: \${chunk.length} 字节\`);
  console.log(\`数据片段: "\${chunk.substring(0, 50)}..."\`);
  console.log();
});

// end 事件：所有数据读取完毕时触发
readable.on('end', () => {
  console.log(\`✅ 文件读取完成！总共读取了 \${chunkCount} 个数据块\`);
  // 清理测试文件
  fs.unlinkSync(testFile);
});

// error 事件：必须处理错误！
readable.on('error', (err) => {
  console.error('❌ 读取错误:', err.message);
});


// ============================================
// 示例2：比较 readFile 和 createReadStream 的内存使用
// ============================================

const memoryTestFile = path.join(__dirname, 'memory-test.txt');
// 创建一个相对较大的测试文件
const largeContent = 'A'.repeat(1024 * 1024); // 1MB
fs.writeFileSync(memoryTestFile, largeContent);

// 先记录初始内存
const initialMemory = process.memoryUsage().heapUsed;
console.log('\\n=== 内存对比测试 ===');
console.log(\`初始内存使用: \${(initialMemory / 1024 / 1024).toFixed(2)} MB\`);

// 方法1：使用 readFile（一次性加载）
fs.readFile(memoryTestFile, 'utf8', (err, data) => {
  if (err) throw err;
  const memAfterReadFile = process.memoryUsage().heapUsed;
  console.log(\`readFile 后内存: \${(memAfterReadFile / 1024 / 1024).toFixed(2)} MB\`);
  console.log(\`readFile 内存增量: \${((memAfterReadFile - initialMemory) / 1024 / 1024).toFixed(2)} MB\`);
  
  // 清理
  fs.unlinkSync(memoryTestFile);
});

// 方法2：使用流（逐块处理）
const streamForMemory = fs.createReadStream(memoryTestFile, { highWaterMark: 64 * 1024 });
streamForMemory.on('data', (chunk) => {
  // 在这里处理数据，内存始终保持在较低水平
  // console.log('处理数据块...');
});
streamForMemory.on('end', () => {
  const memAfterStream = process.memoryUsage().heapUsed;
  console.log(\`stream 处理后内存: \${(memAfterStream / 1024 / 1024).toFixed(2)} MB\`);
});


// ============================================
// 示例3：流动模式 vs 暂停模式
// ============================================

const pauseTestFile = path.join(__dirname, 'pause-test.txt');
fs.writeFileSync(pauseTestFile, '行1\\n行2\\n行3\\n行4\\n行5\\n');

const pauseStream = fs.createReadStream(pauseTestFile, { encoding: 'utf8', highWaterMark: 5 });

console.log('\\n=== 流动模式演示 ===');
// 默认是暂停模式，一旦监听 data 事件就进入流动模式
pauseStream.on('data', (chunk) => {
  console.log('data事件:', JSON.stringify(chunk));
});

pauseStream.on('end', () => {
  console.log('流动模式读取结束');
  
  // 演示暂停模式
  const pausedStream = fs.createReadStream(pauseTestFile, { encoding: 'utf8', highWaterMark: 5 });
  
  console.log('\\n=== 暂停模式演示（使用 readable 事件和 read()）===');
  
  pausedStream.on('readable', () => {
    let chunk;
    // 使用 read() 手动读取数据
    // 不传参数表示读取所有可用数据，传数字表示读取指定字节数
    while ((chunk = pausedStream.read(3)) !== null) {
      console.log('read() 获取:', JSON.stringify(chunk));
    }
  });
  
  pausedStream.on('end', () => {
    console.log('暂停模式读取结束');
    fs.unlinkSync(pauseTestFile);
  });
});


// ============================================
// 示例4：pipe() 方法基础
// ============================================

const pipeSource = path.join(__dirname, 'pipe-source.txt');
const pipeDest = path.join(__dirname, 'pipe-dest.txt');
fs.writeFileSync(pipeSource, '这是通过管道复制的文本！\\n第二行\\n第三行\\n');

console.log('\\n=== pipe() 管道演示 ===');

// 创建可读流（源）
const source = fs.createReadStream(pipeSource);
// 创建可写流（目标）
const dest = fs.createWriteStream(pipeDest);

// 使用 pipe() 连接两个流
// 这会自动处理背压、数据流动、错误等
source.pipe(dest);

dest.on('finish', () => {
  console.log('✅ 管道复制完成！');
  console.log('目标文件内容:', fs.readFileSync(pipeDest, 'utf8'));
  
  // 清理
  fs.unlinkSync(pipeSource);
  fs.unlinkSync(pipeDest);
});

// 错误处理
source.on('error', (err) => console.error('源错误:', err));
dest.on('error', (err) => console.error('目标错误:', err));


// ============================================
// 示例5：不指定 encoding 时，数据是 Buffer
// ============================================

const bufferTestFile = path.join(__dirname, 'buffer-test.txt');
fs.writeFileSync(bufferTestFile, '你好，世界！');

const bufferStream = fs.createReadStream(bufferTestFile);

setTimeout(() => {
  console.log('\\n=== Buffer 数据演示 ===');
  
  bufferStream.on('data', (chunk) => {
    console.log('数据类型:', chunk instanceof Buffer ? 'Buffer' : typeof chunk);
    console.log('Buffer 内容:', chunk);
    console.log('转换为字符串:', chunk.toString('utf8'));
  });
  
  bufferStream.on('end', () => {
    fs.unlinkSync(bufferTestFile);
  });
}, 500);
`,
  },
  {
    id: 'n4-stream-advanced',
    group: '第二部分 核心模块',
    icon: '🔄',
    title: 'Stream 进阶：可写流、双工流与管道',
    content: `## 🔄 Stream 进阶：可写流、双工流与管道

在上一章我们学习了可读流的基础，本章将深入学习可写流、双工流、转换流，以及流编程中最重要的概念——**背压（Backpressure）**。

### 可写流（Writable）

可写流是数据的目的地，你可以将数据写入其中。

#### 核心方法

| 方法 | 说明 |
|------|------|
| \`write(chunk)\` | 写入数据块，返回布尔值表示是否可以继续写入 |
| \`end([chunk])\` | 结束写入，可选写入最后一块数据 |
| \`setDefaultEncoding(encoding)\` | 设置默认编码 |
| \`cork()/uncork()\` | 缓冲写入，uncork 时一次性输出 |

#### 核心事件

| 事件 | 说明 |
|------|------|
| \`drain\` | 当 writable.write() 返回 false 后，缓冲区清空时触发 |
| \`finish\` | 调用 end() 且所有数据已写入底层系统时触发 |
| \`error\` | 写入或管道出错时触发 |
| \`close\` | 流关闭时触发 |
| \`pipe\` | 当 readable.pipe() 连接到这个可写流时触发 |
| \`unpipe\` | 当 unpipe() 被调用时触发 |

### 🚨 背压（Backpressure）：流的关键机制

这是流编程中**最重要**的概念！

**问题场景**：如果写入速度跟不上读取速度会怎样？
- 数据会在内存中堆积
- 可能导致内存溢出
- 性能严重下降

**背压机制**：
1. 当 \`writable.write(chunk)\` 返回 \`false\` 时，表示缓冲区已满
2. 此时应该停止从可读流读取数据
3. 当可写流处理完缓冲区数据后，会触发 \`drain\` 事件
4. 这时可以继续写入数据

**好消息**：\`pipe()\` 方法自动处理背压！但如果你手动使用 \`write()\`，就必须自己处理。

### Duplex（双工流）

双工流同时实现了 Readable 和 Writable 接口：
- \`net.Socket\`（TCP 连接）是最典型的双工流
- 可以同时读写数据
- 读和写是独立的两个缓冲区

### Transform（转换流）

转换流是一种特殊的 Duplex 流，输出是输入的转换结果：
- 它本质上是一个流经过滤器/转换器
- 常见例子：
  - \`zlib.createGzip()\`：压缩数据
  - \`zlib.createGunzip()\`：解压数据
  - \`crypto.createCipheriv()\`：加密

自定义转换流需要：
1. 继承 \`Transform\` 类
2. 实现 \`_transform(chunk, encoding, callback)\` 方法
3. 可选实现 \`_flush(callback)\` 方法处理剩余数据

### Object Mode（对象模式）

默认情况下，流只处理 Buffer 和 String。对象模式允许流处理 JavaScript 对象：
- 设置 \`objectMode: true\`
- 不再受 highWaterMark 字节数限制（改为对象个数）
- 常见于 Gulp、数据库驱动等场景

### pipeline() vs pipe()

虽然 \`pipe()\` 很方便，但它有一个问题：**错误不会沿着管道传播**，如果其中一个流出错，其他流不会自动关闭，可能导致内存泄漏。

Node.js 10+ 提供了 \`stream.pipeline()\` 方法：
- 自动处理错误转发
- 出错时自动销毁所有流
- 成功完成时调用回调
- 支持 Promise（\`stream/promises\` 中的 \`pipeline\`）

### 💡 最佳实践

1. **优先使用 pipeline()** 而不是手动 pipe() 链
2. **始终处理 error 事件**
3. 自定义流时使用简化的构造函数方式
4. 注意背压，不要忽略 write() 的返回值
`,
    code: `// ============================================
// 示例1：可写流基础 - write() 与 end()
// ============================================

const fs = require('fs');
const path = require('path');

const writableFile = path.join(__dirname, 'writable-test.txt');

// 创建可写流
const writable = fs.createWriteStream(writableFile, {
  encoding: 'utf8'
});

// write() 写入数据
// 返回值：true 表示可以继续写入，false 表示缓冲区已满（背压）
const canWriteMore = writable.write('第一行数据\\n');
console.log('可以继续写入吗？', canWriteMore);

writable.write('第二行数据\\n');
writable.write('第三行数据\\n');

// end() 表示写入完成，可选地写入最后一块数据
writable.end('最后一行数据\\n');

// finish 事件：所有数据写入完成
writable.on('finish', () => {
  console.log('\\n✅ 所有数据已写入文件');
  console.log('文件内容：');
  console.log(fs.readFileSync(writableFile, 'utf8'));
});

writable.on('error', (err) => {
  console.error('写入错误:', err);
});


// ============================================
// 示例2：演示背压（Backpressure）和 drain 事件
// ============================================

const backpressureFile = path.join(__dirname, 'backpressure-test.txt');
const backpressureStream = fs.createWriteStream(backpressureFile);

console.log('\\n=== 背压演示 ===');

let i = 0;
const maxWrites = 100000;

// 写入大量数据触发背压
function writeLotsOfData() {
  let canContinue = true;
  
  while (i < maxWrites && canContinue) {
    i++;
    const data = \`数据行 \${i}\\n\`;
    // write() 返回 false 时停止写入，等待 drain
    canContinue = backpressureStream.write(data);
    
    if (i === 1 || i % 20000 === 0) {
      console.log(\`写入 \${i} 行，缓冲区状态: \${canContinue ? '可继续' : '已满，等待drain'}\`);
    }
  }
  
  if (i < maxWrites) {
    // 缓冲区满了，等待 drain 事件后继续
    console.log('等待 drain 事件...');
    backpressureStream.once('drain', () => {
      console.log('drain 触发！继续写入...');
      writeLotsOfData();
    });
  } else {
    // 写完了
    backpressureStream.end();
  }
}

writeLotsOfData();

backpressureStream.on('finish', () => {
  console.log('✅ 背压演示完成，写入', i, '行');
  fs.unlinkSync(backpressureFile);
});


// ============================================
// 示例3：pipe() 文件复制（对比 readFile 的内存优势）
// ============================================

const copySource = path.join(__dirname, 'copy-source.txt');
const copyDest = path.join(__dirname, 'copy-dest.txt');

// 创建一个稍大的源文件
fs.writeFileSync(copySource, '复制测试内容\\n'.repeat(10000));

console.log('\\n=== 使用 pipe() 复制文件 ===');
const start = Date.now();

const readStream = fs.createReadStream(copySource);
const writeStream = fs.createWriteStream(copyDest);

readStream.pipe(writeStream);

writeStream.on('finish', () => {
  console.log(\`✅ 复制完成！耗时: \${Date.now() - start}ms\`);
  console.log(\`源文件大小: \${fs.statSync(copySource).size} 字节\`);
  console.log(\`目标文件大小: \${fs.statSync(copyDest).size} 字节\`);
  
  fs.unlinkSync(copySource);
  fs.unlinkSync(copyDest);
});


// ============================================
// 示例4：zlib 压缩 - Transform 流的实际应用
// ============================================

const zlib = require('zlib');

const gzipSource = path.join(__dirname, 'gzip-source.txt');
const gzipDest = path.join(__dirname, 'gzip-dest.txt.gz');

fs.writeFileSync(gzipSource, '这是需要压缩的文本内容\\n'.repeat(500));

console.log('\\n=== 使用 gzip 压缩文件 ===');
console.log(\`原始文件大小: \${fs.statSync(gzipSource).size} 字节\`);

// 创建 gzip 压缩转换流
const gzip = zlib.createGzip();
const sourceStream = fs.createReadStream(gzipSource);
const gzipWriteStream = fs.createWriteStream(gzipDest);

// 管道：源 -> gzip压缩 -> 目标文件
sourceStream.pipe(gzip).pipe(gzipWriteStream);

gzipWriteStream.on('finish', () => {
  console.log(\`✅ 压缩完成！压缩后大小: \${fs.statSync(gzipDest).size} 字节\`);
  
  // 演示解压
  console.log('\\n=== 解压文件 ===');
  const gunzip = zlib.createGunzip();
  const unzipDest = path.join(__dirname, 'gzip-unzipped.txt');
  const unzipWrite = fs.createWriteStream(unzipDest);
  
  fs.createReadStream(gzipDest)
    .pipe(gunzip)
    .pipe(unzipWrite);
  
  unzipWrite.on('finish', () => {
    console.log('✅ 解压完成！');
    
    // 清理
    fs.unlinkSync(gzipSource);
    fs.unlinkSync(gzipDest);
    fs.unlinkSync(unzipDest);
  });
});


// ============================================
// 示例5：自定义 Transform 流（大写转换）
// ============================================

const { Transform } = require('stream');

// 创建自定义转换流：将输入转换为大写
class UpperCaseTransform extends Transform {
  constructor(options) {
    super(options);
  }
  
  // 必须实现 _transform 方法
  _transform(chunk, encoding, callback) {
    // chunk 是输入数据
    // callback(error, transformedChunk) 用于返回结果
    try {
      const upperChunk = chunk.toString().toUpperCase();
      this.push(upperChunk); // 将转换后的数据推入输出队列
      callback(); // 没有错误时调用 callback()
    } catch (err) {
      callback(err);
    }
  }
  
  // 可选：_flush 在所有数据处理完后调用
  _flush(callback) {
    this.push('\\n--- 转换结束 ---\\n');
    callback();
  }
}

const transformTestFile = path.join(__dirname, 'transform-test.txt');
const transformOutFile = path.join(__dirname, 'transform-out.txt');
fs.writeFileSync(transformTestFile, 'hello world\\nthis is node.js\\nstreams are awesome!');

console.log('\\n=== 自定义转换流（大写转换）===');

const upperCaseTransformer = new UpperCaseTransform();

fs.createReadStream(transformTestFile, { encoding: 'utf8' })
  .pipe(upperCaseTransformer)
  .pipe(fs.createWriteStream(transformOutFile));

upperCaseTransformer.on('finish', () => {
  console.log('转换后的内容：');
  console.log(fs.readFileSync(transformOutFile, 'utf8'));
  
  fs.unlinkSync(transformTestFile);
  fs.unlinkSync(transformOutFile);
});


// ============================================
// 示例6：pipeline() 安全管道
// ============================================

const { pipeline } = require('stream');
// Node 15+ 也可以使用 promise 版本：const { pipeline } = require('stream/promises');

const pipelineSource = path.join(__dirname, 'pipeline-source.txt');
const pipelineDest = path.join(__dirname, 'pipeline-dest.txt.gz');

fs.writeFileSync(pipelineSource, 'pipeline 测试数据\\n'.repeat(1000));

setTimeout(() => {
  console.log('\\n=== pipeline() 安全管道演示 ===');
  
  // pipeline 自动处理错误和清理
  pipeline(
    fs.createReadStream(pipelineSource),
    zlib.createGzip(),
    fs.createWriteStream(pipelineDest),
    (err) => {
      if (err) {
        console.error('管道失败:', err);
      } else {
        console.log('✅ pipeline 成功完成！');
        console.log(\`压缩后大小: \${fs.statSync(pipelineDest).size} 字节\`);
        
        fs.unlinkSync(pipelineSource);
        fs.unlinkSync(pipelineDest);
        fs.unlinkSync(writableFile);
      }
    }
  );
}, 300);
`,
  },
  {
    id: 'n4-crypto',
    group: '第二部分 核心模块',
    icon: '🔐',
    title: 'crypto 模块：加密与安全',
    content: `## 🔐 crypto 模块：加密与安全

\`crypto\` 模块是 Node.js 中用于加密和解密的核心模块，它封装了 OpenSSL 的功能，提供了包括哈希、HMAC、加密、解密、签名、验证等一整套密码学功能。

### 密码学基础概念

在开始之前，了解几个核心概念：
- **哈希（Hash）**：将任意长度数据映射为固定长度值，不可逆
- **HMAC**：基于哈希的消息认证码，使用密钥验证完整性
- **对称加密**：加密和解密使用**同一个密钥**（如 AES）
- **非对称加密**：公钥加密、私钥解密，或私钥签名、公钥验证（如 RSA）
- **数字签名**：证明消息未被篡改且来自特定发送者

### Hash（哈希）

哈希函数的特点：
1. **确定性**：相同输入永远产生相同输出
2. **快速计算**：计算速度快
3. **不可逆**：无法从哈希值反推原始数据
4. **雪崩效应**：输入微小变化导致输出巨大变化
5. **抗碰撞**：很难找到两个不同输入产生相同输出

**常见算法**：MD5（不安全，仅用于校验）、SHA-256、SHA-512

⚠️ **重要**：MD5 和 SHA 系列**绝对不能**用于存储密码！它们太快了，容易被暴力破解。

### HMAC（哈希消息认证码）

HMAC 使用哈希函数和一个密钥来生成消息认证码：
- 验证数据完整性
- 验证消息真实性
- 需要通信双方共享密钥

### 对称加密（AES）

AES（高级加密标准）是最常用的对称加密算法：
- **AES-256-CBC**：经典模式，需要 IV（初始化向量）
- **AES-256-GCM**：认证加密模式，更安全，提供完整性验证

⚠️ **注意事项**：
- 密钥长度必须是 128、192 或 256 位
- IV 必须是随机的，不需要保密，但每次加密都应该不同
- GCM 模式会产生认证标签，解密时需要验证

### 非对称加密（RSA）

RSA 使用一对密钥：
- **公钥**：可以公开，用于加密和验证签名
- **私钥**：必须保密，用于解密和签名

适用场景：
- 密钥交换
- 数字签名
- 小数据加密（不适合大数据，速度慢）

### 密码哈希：scrypt 和 pbkdf2

为什么不能用 MD5/SHA 存密码？
1. 它们计算太快，攻击者可以每秒尝试数十亿个密码
2. 没有盐值（salt）的话，相同密码有相同哈希
3. 彩虹表攻击很有效

正确的密码哈希方案：
- **scrypt**：内存密集型算法，抗硬件攻击
- **pbkdf2**：基于密码的密钥派生函数，多次迭代
- **bcrypt/argon2**（需要第三方库）

共同点：都需要 salt（随机盐）和大量计算。

### 随机数生成

密码学安全的随机数非常重要：
- \`crypto.randomBytes(size)\`：生成随机字节
- \`crypto.randomUUID()\`：生成符合 RFC 4122 的 v4 UUID
- \`crypto.randomInt([min, ]max)\`：生成随机整数

⚠️ **永远不要**用 \`Math.random()\` 做安全相关的事情！

### Timing Safe Comparison

\`crypto.timingSafeEqual(a, b)\` 用于恒定时间比较：
- 普通的 \`===\` 比较一旦发现不匹配就会立即返回，攻击者可以通过测量时间差异推断内容
- timingSafeEqual 始终比较全部内容，时间与数据无关
- 用于比较 HMAC、密码哈希、认证标签等敏感数据
`,
    code: `// ============================================
// 示例1：Hash（哈希）- MD5, SHA-256, SHA-512
// ============================================

const crypto = require('crypto');

const text = 'Hello, Node.js Crypto!';

// 创建 Hash 对象，指定算法
// 常见算法：md5, sha256, sha512
const md5Hash = crypto.createHash('md5');
const sha256Hash = crypto.createHash('sha256');
const sha512Hash = crypto.createHash('sha512');

// update() 添加数据，可以多次调用
md5Hash.update(text);
sha256Hash.update(text);
sha512Hash.update(text);

// digest() 输出结果
// 参数：'hex'（十六进制）, 'base64', 'latin1'
const md5Result = md5Hash.digest('hex');
const sha256Result = sha256Hash.digest('hex');
const sha512Result = sha512Hash.digest('hex');

console.log('=== Hash 演示 ===');
console.log('原文:', text);
console.log('MD5:', md5Result, '(长度:', md5Result.length, ')');
console.log('SHA-256:', sha256Result, '(长度:', sha256Result.length, ')');
console.log('SHA-512:', sha512Result, '(长度:', sha512Result.length, ')');

// 演示雪崩效应：微小变化导致完全不同的哈希
const text2 = 'Hello, Node.js Crypto'; // 少了一个感叹号
const sha256Changed = crypto.createHash('sha256').update(text2).digest('hex');
console.log('\\n雪崩效应演示（少一个感叹号）:');
console.log('原SHA-256: ', sha256Result);
console.log('改后SHA-256:', sha256Changed);

// 检查文件完整性的例子
const fs = require('fs');
const path = require('path');
const testFile = path.join(__dirname, 'hash-test.txt');
fs.writeFileSync(testFile, '这是一个测试文件');

const fileHash = crypto.createHash('sha256');
const fileStream = fs.createReadStream(testFile);
fileStream.on('data', (chunk) => fileHash.update(chunk));
fileStream.on('end', () => {
  console.log('\\n文件 SHA-256:', fileHash.digest('hex'));
  fs.unlinkSync(testFile);
});


// ============================================
// 示例2：HMAC 消息认证码
// ============================================

console.log('\\n=== HMAC 演示 ===');

const secretKey = 'my-secret-key-12345';
const message = '需要认证的消息内容';

// 创建 HMAC，需要算法和密钥
const hmac = crypto.createHmac('sha256', secretKey);
hmac.update(message);
const hmacResult = hmac.digest('hex');

console.log('消息:', message);
console.log('密钥:', secretKey);
console.log('HMAC-SHA256:', hmacResult);

// 验证：接收方用相同密钥计算 HMAC，比较是否一致
function verifyHMAC(message, receivedHMAC, key) {
  const expectedHMAC = crypto.createHmac('sha256', key)
    .update(message)
    .digest();
  
  // 使用 timingSafeEqual 防止时序攻击
  const receivedBuffer = Buffer.from(receivedHMAC, 'hex');
  return crypto.timingSafeEqual(expectedHMAC, receivedBuffer);
}

console.log('验证结果（正确密钥）:', verifyHMAC(message, hmacResult, secretKey));
console.log('验证结果（错误密钥）:', verifyHMAC(message, hmacResult, 'wrong-key'));


// ============================================
// 示例3：AES-256-GCM 对称加密（推荐模式）
// ============================================

console.log('\\n=== AES-256-GCM 加密/解密 ===');

// 加密函数
function encrypt(plainText, password) {
  // AES-256 需要 32 字节密钥，使用 scrypt 从密码派生
  // 16 字节的初始化向量 IV（GCM 推荐）
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // GCM 模式生成认证标签，解密时需要
  const authTag = cipher.getAuthTag();
  
  // 返回 IV + 认证标签 + 密文
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encryptedData: encrypted
  };
}

// 解密函数
function decrypt(encryptedObj, password) {
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = Buffer.from(encryptedObj.iv, 'hex');
  const authTag = Buffer.from(encryptedObj.authTag, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

const secretMessage = '这是一条需要加密的秘密消息！Hello World!';
const password = 'my-secure-password';

const encrypted = encrypt(secretMessage, password);
console.log('原文:', secretMessage);
console.log('加密结果:', encrypted);

const decrypted = decrypt(encrypted, password);
console.log('解密后:', decrypted);

try {
  decrypt(encrypted, 'wrong-password');
} catch (e) {
  console.log('\\n使用错误密码解密失败（认证失败）:', e.message);
}


// ============================================
// 示例4：密码哈希 - scrypt（正确的密码存储方式）
// ============================================

console.log('\\n=== 密码哈希 (scrypt) ===');

// 哈希密码（注册时）
async function hashPassword(password) {
  // 生成随机盐（16字节）
  const salt = crypto.randomBytes(16).toString('hex');
  
  return new Promise((resolve, reject) => {
    // scrypt 是计算密集型，异步版本不阻塞事件循环
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      // 存储格式：salt:hash
      resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
}

// 验证密码（登录时）
async function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      // 使用 timingSafeEqual 比较
      resolve(crypto.timingSafeEqual(
        Buffer.from(hash, 'hex'),
        derivedKey
      ));
    });
  });
}

// 演示
(async () => {
  const userPassword = 'user-password-123';
  
  const hashed = await hashPassword(userPassword);
  console.log('哈希后的密码（存储到数据库）:', hashed);
  
  console.log('验证正确密码:', await verifyPassword(userPassword, hashed));
  console.log('验证错误密码:', await verifyPassword('wrong-password', hashed));
})();


// ============================================
// 示例5：RSA 非对称加密 - 签名与验证
// ============================================

console.log('\\n=== RSA 密钥对生成、签名与验证 ===');

// 生成 RSA 密钥对
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

console.log('公钥（PEM格式，前100字符）:', publicKey.substring(0, 100) + '...');
console.log('私钥已生成（保密！）');

const signData = '需要签名的重要文档';

// 用私钥签名
const signer = crypto.createSign('SHA256');
signer.update(signData);
const signature = signer.sign(privateKey, 'hex');

console.log('\\n签名:', signature);

// 用公钥验证
const verifier = crypto.createVerify('SHA256');
verifier.update(signData);
const isVerified = verifier.verify(publicKey, signature, 'hex');

console.log('验证结果:', isVerified ? '✅ 签名有效' : '❌ 签名无效');

// 数据被篡改的情况
verifier.update('篡改后的数据');
const isTampered = crypto.createVerify('SHA256')
  .update('被篡改的数据')
  .verify(publicKey, signature, 'hex');
console.log('篡改后验证:', isTampered ? '有效' : '❌ 检测到篡改！');


// ============================================
// 示例6：安全随机数与 UUID
// ============================================

setTimeout(() => {
  console.log('\\n=== 安全随机数生成 ===');
  
  // 生成随机字节（用于令牌、密钥等）
  const randomToken = crypto.randomBytes(32).toString('hex');
  console.log('32字节随机令牌（hex）:', randomToken);
  console.log('令牌长度:', randomToken.length, '字符');
  
  // 生成 URL 安全的 base64 令牌
  const urlSafeToken = crypto.randomBytes(32).toString('base64url');
  console.log('URL安全令牌:', urlSafeToken);
  
  // 生成 UUID v4
  const uuid1 = crypto.randomUUID();
  const uuid2 = crypto.randomUUID();
  console.log('\\nUUID 1:', uuid1);
  console.log('UUID 2:', uuid2);
  
  // 随机整数 [min, max)
  const randomInt = crypto.randomInt(1, 101);
  console.log('1-100随机整数:', randomInt);
  
  console.log('\\n⚠️ 重要：永远不要用 Math.random() 处理安全相关内容！');
}, 500);
`,
  },
  {
    id: 'n4-url-querystring',
    group: '第二部分 核心模块',
    icon: '🔗',
    title: 'url 与 querystring：解析网址和查询参数',
    content: `## 🔗 url 与 querystring：解析网址和查询参数

在 Web 开发中，处理 URL 和查询参数是最常见的任务之一。Node.js 提供了两个核心模块：
- \`url\`：解析和格式化 URL
- \`querystring\`：解析和格式化查询字符串

### URL 的结构

一个完整的 URL 包含以下部分：

\`\`\`
  https://user:p***@example.com:8080/path/to/page?foo=bar&baz=qux#section
  ───────  ────────────── ─────────── ──── ─────────── ─────────────── ───────
  protocol    auth          host      port  pathname      search        hash
                        ─────────────────
                           hostname
\`\`\`

### 新 URL API vs 旧的 url.parse()

Node.js 有两套 URL 处理 API：

| 特性 | 新 URL()（WHATWG API） | url.parse()（传统） |
|------|----------------------|---------------------|
| 标准 | 浏览器标准，跨平台一致 | Node.js 特有 |
| 推荐 | ✅ 推荐使用 | ❌ 仅用于维护旧代码 |
| 解析 | 更严格，遵循标准 | 更宽松，容错性高 |
| searchParams | ✅ 有 URLSearchParams | ❌ 需要自己解析 query |

**最佳实践**：新项目一律使用 \`new URL()\`！

### URL 类的属性

| 属性 | 说明 | 示例值 |
|------|------|--------|
| \`href\` | 完整 URL 字符串 | 'https://example.com:8080/path?a=1#hash' |
| \`origin\` | 源（protocol + host） | 'https://example.com:8080' |
| \`protocol\` | 协议 | 'https:' |
| \`host\` | 主机（含端口） | 'example.com:8080' |
| \`hostname\` | 主机名（不含端口） | 'example.com' |
| \`port\` | 端口 | '8080' |
| \`pathname\` | 路径 | '/path/to/page' |
| \`search\` | 查询字符串（含?） | '?foo=bar&baz=qux' |
| \`searchParams\` | URLSearchParams 对象 | 见下文 |
| \`hash\` | 哈希片段（含#） | '#section' |
| \`username/password\` | 认证信息 | 'user' / 'pass' |

### URLSearchParams：强大的查询参数处理

\`URLSearchParams\` 是处理查询字符串的强大工具，不需要引入 \`querystring\` 模块。

#### 核心方法

| 方法 | 说明 |
|------|------|
| \`get(key)\` | 获取第一个值 |
| \`getAll(key)\` | 获取所有值（用于多值参数） |
| \`set(key, value)\` | 设置值（会覆盖已存在的） |
| \`append(key, value)\` | 追加值（不覆盖） |
| \`delete(key)\` | 删除参数 |
| \`has(key)\` | 检查是否存在 |
| \`toString()\` | 转换为查询字符串 |
| \`entries()/keys()/values()\` | 迭代器方法 |
| \`sort()\` | 按键名排序 |
| \`forEach(callback)\` | 遍历所有参数 |

### querystring 模块

虽然新代码推荐使用 URLSearchParams，但 \`querystring\` 在某些场景仍有用：
- 处理表单编码 \`application/x-www-form-urlencoded\`
- 处理旧代码
- 与旧模块兼容

主要方法：\`querystring.parse()\`, \`querystring.stringify()\`, \`querystring.escape()\`, \`querystring.unescape()\`

### 💡 常见使用场景

1. **HTTP 服务器中解析请求 URL**：获取 pathname 做路由，获取 searchParams 做查询
2. **构建 API URL**：程序化构造带参数的 URL
3. **解析重定向 URL**：提取回调地址的参数
4. **相对路径解析**：\`new URL('../path', baseUrl)\` 解析相对 URL

### ⚠️ 常见陷阱

1. URL 构造函数的第二个参数是 base URL，用于解析相对 URL
2. \`search\` 属性包含开头的 \`?\`，\`pathname\` 以 \`/\` 开头
3. 重复参数要用 \`getAll()\` 而不是 \`get()\`
4. \`searchParams\` 是 URLSearchParams 实例，不是普通对象
5. 编码问题：URL API 自动处理编码，不要手动 encodeURIComponent
`,
    code: `// ============================================
// 示例1：URL 解析基础
// ============================================

const { URL } = require('url');

const urlString = 'https://user:p***@www.example.com:8080/path/to/page?category=books&page=2&sort=desc#section-2';

// 创建 URL 对象
const url = new URL(urlString);

console.log('=== URL 解析演示 ===');
console.log('完整 URL (href):', url.href);
console.log('源 (origin):', url.origin);
console.log('协议 (protocol):', url.protocol);
console.log('用户名 (username):', url.username);
console.log('密码 (password):', url.password);
console.log('主机 (host):', url.host);
console.log('主机名 (hostname):', url.hostname);
console.log('端口 (port):', url.port);
console.log('路径 (pathname):', url.pathname);
console.log('查询字符串 (search):', url.search);
console.log('哈希 (hash):', url.hash);


// ============================================
// 示例2：URLSearchParams 操作查询参数
// ============================================

console.log('\\n=== URLSearchParams 演示 ===');

const apiUrl = new URL('https://api.example.com/search');
const params = apiUrl.searchParams;

// 设置参数
params.set('q', 'nodejs tutorial');
params.set('page', '1');
params.set('limit', '20');

// append 可以添加重复参数（多值）
params.append('tag', 'javascript');
params.append('tag', 'nodejs');
params.append('tag', 'backend');

console.log('构建的 URL:', apiUrl.toString());
console.log();

// 获取参数
console.log('q:', params.get('q'));
console.log('page:', params.get('page'));
console.log('所有 tag:', params.getAll('tag'));
console.log('是否存在 author?', params.has('author'));

// 遍历参数
console.log('\\n所有参数:');
for (const [key, value] of params.entries()) {
  console.log(\`  \${key}: \${value}\`);
}

// 修改参数
params.set('page', '2');
params.delete('limit');
console.log('\\n修改 page 并删除 limit 后:', apiUrl.search);

// forEach 遍历
console.log('\\nforEach 遍历:');
params.forEach((value, key) => {
  console.log(\`  \${key} = \${value}\`);
});

// 排序
params.sort();
console.log('\\n排序后:', params.toString());


// ============================================
// 示例3：程序化构建 URL
// ============================================

console.log('\\n=== 构建 URL ===');

function buildApiUrl(baseUrl, path, queryParams) {
  const url = new URL(path, baseUrl);
  
  Object.entries(queryParams || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // 数组参数使用 append
      value.forEach(v => url.searchParams.append(key, v));
    } else {
      url.searchParams.set(key, value);
    }
  });
  
  return url.toString();
}

const constructedUrl = buildApiUrl('https://api.example.com', '/v1/users', {
  page: 1,
  perPage: 10,
  fields: ['id', 'name', 'email'],
  sort: 'createdAt',
  order: 'desc'
});

console.log('构建的 API URL:', constructedUrl);


// ============================================
// 示例4：相对 URL 解析
// ============================================

console.log('\\n=== 相对 URL 解析 ===');

const base = 'https://example.com/blog/2024/article.html';

console.log('基础 URL:', base);
console.log('../about:', new URL('../about', base).href);
console.log('./comments:', new URL('./comments', base).href);
console.log('/contact:', new URL('/contact', base).href);
console.log('//cdn.example.com/lib.js:', new URL('//cdn.example.com/lib.js', base).href);
console.log('?page=2:', new URL('?page=2', base).href);
console.log('#comments:', new URL('#comments', base).href);


// ============================================
// 示例5：querystring 模块
// ============================================

const querystring = require('querystring');

console.log('\\n=== querystring 模块 ===');

// 解析查询字符串
const qs = 'foo=bar&baz=qux&baz=quux&corge=';
const parsed = querystring.parse(qs);
console.log('解析结果:', parsed);
console.log('baz (数组):', parsed.baz);

// 字符串化
const stringified = querystring.stringify({ 
  foo: 'bar', 
  baz: ['qux', 'quux'],
  hello: 'world'
});
console.log('字符串化:', stringified);

// 自定义分隔符
const customQs = querystring.stringify({ a: 1, b: 2 }, ';', ':');
console.log('自定义分隔符:', customQs);

// 转义/反转义
const escaped = querystring.escape('你好 世界!');
const unescaped = querystring.unescape(escaped);
console.log('转义:', escaped);
console.log('反转义:', unescaped);


// ============================================
// 示例6：在 HTTP 服务器中使用 URL 解析
// ============================================

const http = require('http');

const server = http.createServer((req, res) => {
  // 解析请求 URL（需要传入 base 参数才能正确解析）
  const baseUrl = \`http://\${req.headers.host}\`;
  const parsedUrl = new URL(req.url, baseUrl);
  
  console.log('\\n收到请求:');
  console.log('方法:', req.method);
  console.log('路径:', parsedUrl.pathname);
  console.log('查询参数:');
  parsedUrl.searchParams.forEach((value, key) => {
    console.log(\`  \${key} = \${value}\`);
  });
  
  // 简单路由示例
  if (parsedUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('首页！访问 /search?q=关键词 来搜索');
  } else if (parsedUrl.pathname === '/search') {
    const keyword = parsedUrl.searchParams.get('q') || '空';
    const page = parsedUrl.searchParams.get('page') || '1';
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      keyword: keyword,
      page: parseInt(page),
      results: []
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// 注意：这里只是演示，服务器不实际启动
console.log('\\n=== HTTP 服务器 URL 解析示例 ===');
console.log('在实际 HTTP 服务器中使用 new URL(req.url, base) 来解析请求 URL');

server.close();


// ============================================
// 示例7：解析 URL 中的各种特殊情况
// ============================================

console.log('\\n=== 特殊情况处理 ===');

// 没有值的参数
const url1 = new URL('https://example.com?foo&bar=&baz=123');
console.log('无值参数 foo:', url1.searchParams.get('foo'));
console.log('空值参数 bar:', url1.searchParams.get('bar'));

// 编码处理
const url2 = new URL('https://example.com/search');
url2.searchParams.set('q', 'Node.js 教程');
console.log('\\n自动编码中文:', url2.toString());
console.log('自动解码:', url2.searchParams.get('q'));

// + 号和空格的处理（URLSearchParams 和 querystring 的区别）
const url3 = new URL('https://example.com?text=hello+world');
console.log('\\nURLSearchParams 中 + 被解码为:', url3.searchParams.get('text'));
console.log('querystring 中 + 被解码为:', querystring.parse('text=hello+world').text);

// hash 中的查询参数不会被解析
const url4 = new URL('https://example.com/path#fragment?foo=bar');
console.log('\\nhash 中的参数不会进入 searchParams');
console.log('hash:', url4.hash);
console.log('search:', url4.search);
`,
  },
  {
    id: 'n4-http-server',
    group: '第二部分 核心模块',
    icon: '🌐',
    title: 'http 模块：创建 Web 服务器',
    content: `## 🌐 http 模块：创建 Web 服务器

\`http\` 模块是 Node.js 内置的 HTTP 服务器和客户端实现。虽然现在很多人使用 Express、Koa 等框架，但理解原生 \`http\` 模块是掌握 Node.js Web 开发的基础。

### HTTP 基础回顾

HTTP 是基于请求-响应模型的协议：
1. 客户端（浏览器）发送 HTTP 请求
2. 服务器处理请求
3. 服务器返回 HTTP 响应

请求包含：方法（GET/POST/...）、URL、请求头、请求体
响应包含：状态码、响应头、响应体

### 创建服务器

使用 \`http.createServer([requestListener])\` 创建服务器：
- \`requestListener\` 是每个请求都会调用的回调，接收 \`(req, res)\`
- \`req\`：http.IncomingMessage，请求对象
- \`res\`：http.ServerResponse，响应对象

服务器需要调用 \`server.listen(port)\` 开始监听端口。

### 请求对象 (req)

| 属性/方法 | 说明 |
|-----------|------|
| \`req.method\` | HTTP 方法（'GET', 'POST', 'PUT', 'DELETE' 等） |
| \`req.url\` | 请求的 URL（路径+查询字符串，不含域名） |
| \`req.headers\` | 请求头对象（键都是小写的！） |
| \`req.httpVersion\` | HTTP 版本 |
| \`req.on('data')\` | 接收请求体数据块 |
| \`req.on('end')\` | 请求体接收完毕 |

### 响应对象 (res)

| 方法/属性 | 说明 |
|-----------|------|
| \`res.writeHead(statusCode, [statusMessage], [headers])\` | 写入响应头（一次性） |
| \`res.setHeader(name, value)\` | 设置单个响应头 |
| \`res.getHeader(name)\` | 获取已设置的响应头 |
| \`res.removeHeader(name)\` | 移除响应头 |
| \`res.statusCode\` | 设置/获取状态码 |
| \`res.write(chunk)\` | 写入响应体数据（可以多次调用） |
| \`res.end([data])\` | 结束响应，必须调用！ |

### Content-Type 详解

这是最重要的响应头之一，告诉客户端如何解析内容：
- \`text/plain; charset=utf-8\`：纯文本
- \`text/html; charset=utf-8\`：HTML 文档
- \`application/json; charset=utf-8\`：JSON 数据
- \`text/css\`：CSS 文件
- \`application/javascript\`：JavaScript 文件
- \`image/png\`、\`image/jpeg\`：图片

### 常用 HTTP 状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| **200** | OK | 请求成功 |
| **201** | Created | 资源创建成功（POST） |
| **204** | No Content | 成功但无返回内容 |
| **301** | Moved Permanently | 永久重定向 |
| **302** | Found | 临时重定向 |
| **400** | Bad Request | 客户端请求错误 |
| **401** | Unauthorized | 未认证 |
| **403** | Forbidden | 禁止访问 |
| **404** | Not Found | 资源不存在 |
| **405** | Method Not Allowed | 方法不允许 |
| **500** | Internal Server Error | 服务器内部错误 |

### 手动路由

原生 http 模块没有路由系统，需要自己根据 \`req.method\` 和 \`req.url\` 来判断：
1. 解析 URL 获取 pathname
2. 匹配 method 和 pathname
3. 找不到则返回 404

### 解析请求体

POST/PUT 请求通常有请求体（body）：
- 请求体通过 \`data\` 事件分块接收
- 需要拼接所有 data 块
- 在 \`end\` 事件中处理完整数据
- 根据 Content-Type 解析（JSON、表单等）

### ⚠️ 常见陷阱

1. **必须调用 res.end()**：否则请求会一直挂起
2. **headers 必须在 write 之前设置**：一旦 write 就不能再改 headers
3. **别忘了 charset=utf-8**：否则中文会乱码
4. **req.headers 键都是小写**：\`req.headers['content-type']\` 而不是 Content-Type
5. **请求体必须监听 data/end 来接收**：否则 body 会丢失
`,
    code: `// ============================================
// 示例1：最简单的 HTTP 服务器
// ============================================

const http = require('http');
const { URL } = require('url');

// 创建服务器
const server = http.createServer((req, res) => {
  // 这个回调会在每个请求时执行
  console.log(\`收到请求: \${req.method} \${req.url}\`);
  
  // 设置响应头
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  
  // 写入响应内容
  res.write('你好，Node.js HTTP 服务器！\\n');
  res.write('当前时间: ' + new Date().toLocaleString());
  
  // 结束响应（必须调用！）
  res.end();
});

// 监听端口
const PORT = 3000;
server.listen(PORT, () => {
  console.log(\`服务器运行在 http://localhost:\${PORT}/\`);
  console.log('注意：此服务器会继续运行，按 Ctrl+C 停止');
});


// ============================================
// 示例2：完整的 RESTful API 服务器（演示代码）
// ============================================

// 注意：这部分代码展示更完整的服务器结构
// 在实际运行时，我们只启动一个服务器

const users = [
  { id: 1, name: '张三', email: 'z***@example.com' },
  { id: 2, name: '李四', email: 'l***@example.com' }
];

function createApiServer() {
  return http.createServer((req, res) => {
    // 解析 URL
    const baseUrl = \`http://\${req.headers.host}\`;
    const parsedUrl = new URL(req.url, baseUrl);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    
    // 统一设置 JSON 响应头
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    // 简单路由
    if (pathname === '/' && method === 'GET') {
      // 首页
      res.writeHead(200);
      res.end(JSON.stringify({
        message: '欢迎使用用户管理 API',
        endpoints: {
          'GET /users': '获取用户列表',
          'GET /users/:id': '获取单个用户',
          'POST /users': '创建用户',
          'PUT /users/:id': '更新用户',
          'DELETE /users/:id': '删除用户'
        }
      }));
    } else if (pathname === '/users' && method === 'GET') {
      // 获取用户列表
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: users,
        total: users.length
      }));
    } else if (pathname.match(/^\\/users\\/\\d+$/) && method === 'GET') {
      // 获取单个用户
      const id = parseInt(pathname.split('/')[2]);
      const user = users.find(u => u.id === id);
      
      if (user) {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: user }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, message: '用户不存在' }));
      }
    } else if (pathname === '/users' && method === 'POST') {
      // 创建用户 - 需要解析请求体
      let body = '';
      
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const newUser = JSON.parse(body);
          newUser.id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
          
          if (!newUser.name || !newUser.email) {
            res.writeHead(400);
            res.end(JSON.stringify({ success: false, message: 'name 和 email 是必填字段' }));
            return;
          }
          
          users.push(newUser);
          res.writeHead(201);
          res.end(JSON.stringify({ success: true, data: newUser }));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, message: 'JSON 解析失败' }));
        }
      });
    } else {
      // 404
      res.writeHead(404);
      res.end(JSON.stringify({ success: false, message: 'Not Found' }));
    }
  });
}


// ============================================
// 示例3：提供 HTML 页面
// ============================================

function createHtmlServer() {
  return http.createServer((req, res) => {
    const html = \`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Node.js 原生 HTTP 服务器</title>
  <style>
    body {
      font-family: -apple-system, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 { color: #333; }
    .info {
      background: #e8f4fd;
      padding: 15px;
      border-radius: 4px;
      border-left: 4px solid #2196F3;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>👋 你好，Node.js！</h1>
    <p>这是一个由原生 http 模块提供的 HTML 页面。</p>
    <div class="info">
      <p><strong>请求方法:</strong> \${req.method}</p>
      <p><strong>请求路径:</strong> \${req.url}</p>
      <p><strong>服务器时间:</strong> \${new Date().toLocaleString()}</p>
    </div>
    <h2>请求头信息：</h2>
    <pre>\${JSON.stringify(req.headers, null, 2)}</pre>
  </div>
</body>
</html>\`;
    
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    });
    res.end(html);
  });
}


// ============================================
// 示例4：请求体解析的通用模式
// ============================================

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString();
      const contentType = req.headers['content-type'] || '';
      
      try {
        if (contentType.includes('application/json')) {
          resolve(body ? JSON.parse(body) : {});
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          const { URLSearchParams } = require('url');
          const params = new URLSearchParams(body);
          const result = {};
          for (const [key, value] of params) {
            result[key] = value;
          }
          resolve(result);
        } else {
          resolve(body);
        }
      } catch (e) {
        reject(e);
      }
    });
    
    req.on('error', reject);
  });
}

console.log('\\n=== parseBody 工具函数说明 ===');
console.log('parseBody(req) 返回 Promise，解析请求体：');
console.log('- application/json -> JavaScript 对象');
console.log('- application/x-www-form-urlencoded -> JavaScript 对象');
console.log('- 其他 -> 原始字符串');


// ============================================
// 示例5：发送不同类型的响应
// ============================================

function sendResponse(res, statusCode, data, type = 'json') {
  const types = {
    json: 'application/json; charset=utf-8',
    html: 'text/html; charset=utf-8',
    text: 'text/plain; charset=utf-8'
  };
  
  res.writeHead(statusCode, {
    'Content-Type': types[type] || types.json
  });
  
  if (type === 'json') {
    res.end(JSON.stringify(data));
  } else {
    res.end(data);
  }
}

console.log('\\n=== sendResponse 辅助函数 ===');
console.log('统一处理响应发送，自动设置 Content-Type');
console.log('支持 json, html, text 类型');


// 关闭之前启动的服务器
setTimeout(() => {
  server.close();
  console.log('\\n演示服务器已关闭');
}, 1000);
`,
  },
  {
    id: 'n4-http-client',
    group: '第二部分 核心模块',
    icon: '📡',
    title: 'http/https 模块：发起 HTTP 请求',
    content: `## 📡 http/https 模块：发起 HTTP 请求

除了创建服务器，\`http\` 和 \`https\` 模块还可以作为**客户端**发起 HTTP/HTTPS 请求。这在调用外部 API、下载文件、爬虫等场景中非常有用。

### http.get() vs http.request()

有两种主要方式发起请求：

| 方法 | 说明 | 适用场景 |
|------|------|----------|
| \`http.get(options, callback)\` | 简化版 GET 请求 | 简单的 GET 请求，自动调用 req.end() |
| \`http.request(options, callback)\` | 完整功能的请求 | POST/PUT/DELETE、自定义 headers、更多控制 |

⚠️ **重要**：\`http.request()\` 必须调用 \`req.end()\` 来完成请求发送！

### 请求选项 (options)

| 选项 | 说明 |
|------|------|
| \`hostname\` | 服务器主机名/域名（不要写 http://） |
| \`port\` | 端口（http 默认80，https 默认443） |
| \`path\` | 路径+查询字符串，如 '/api/users?page=1' |
| \`method\` | HTTP 方法，默认 'GET' |
| \`headers\` | 请求头对象 |
| \`auth\` | 认证信息，'user:password' |

也可以传入 URL 字符串作为第一个参数（Node 10+）。

### 处理响应

回调函数接收一个 \`res\`（IncomingMessage）对象，这是一个**可读流**：
- \`res.statusCode\`：HTTP 状态码
- \`res.headers\`：响应头
- 监听 \`data\` 事件接收数据块
- 监听 \`end\` 事件接收完毕
- 可以用 \`pipe()\` 将响应流直接写入文件或其他流

### https 模块

\`https\` 模块与 \`http\` API 完全一致，只是：
- 用于 HTTPS 请求
- 默认端口 443
- 选项中可以加 \`rejectUnauthorized: false\`（不推荐用于生产！）跳过证书验证

### 处理 POST 请求

发送 POST/PUT 请求时需要：
1. 设置 \`method: 'POST'\`
2. 设置 \`Content-Type\` 请求头
3. 设置 \`Content-Length\`（或者使用 chunked 传输编码）
4. 使用 \`req.write(data)\` 写入请求体
5. 调用 \`req.end()\`

### 错误处理

HTTP 请求可能出现的错误：
1. **网络错误**：DNS 失败、连接超时、连接重置等（监听 \`error\` 事件）
2. **HTTP 错误状态码**：404、500 等（需要检查 \`res.statusCode\`）
3. **超时**：使用 \`req.setTimeout()\` 或 AbortController

⚠️ **注意**：收到 4xx/5xx 状态码不算 error 事件！必须手动检查 statusCode。

### 重定向处理

http 模块**不会自动跟随重定向**（不像浏览器或 fetch）。需要：
1. 检查状态码是否是 301/302/303/307/308
2. 获取 \`Location\` 响应头
3. 向新地址重新发起请求

### Promise 封装

原生 API 是回调风格的，实际项目中通常会封装成 Promise 使用。

### 💡 实用技巧

1. 对于 JSON API，拼接响应数据后用 \`JSON.parse()\` 解析
2. 下载大文件时直接 \`pipe()\` 到文件流，节省内存
3. 记得总是监听 error 事件
4. 设置超时防止请求永远挂起
5. 注意 http 和 https 是两个不同模块！
`,
    code: `// ============================================
// 示例1：简单的 GET 请求
// ============================================

const http = require('http');
const https = require('https');

console.log('=== GET 请求演示 ===');

// 使用 https.get() 发起 GET 请求
https.get('https://jsonplaceholder.typicode.com/posts/1', (res) => {
  console.log('状态码:', res.statusCode);
  console.log('响应头:', res.headers['content-type']);
  
  let data = '';
  
  // 接收数据块
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  // 数据接收完毕
  res.on('end', () => {
    console.log('\\n响应数据:');
    const parsed = JSON.parse(data);
    console.log(JSON.stringify(parsed, null, 2));
  });
  
}).on('error', (err) => {
  console.error('请求出错:', err.message);
});


// ============================================
// 示例2：使用 http.request() 完整控制
// ============================================

setTimeout(() => {
  console.log('\\n=== http.request() 演示 ===');
  
  const options = {
    hostname: 'jsonplaceholder.typicode.com',
    port: 443,
    path: '/posts',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Node.js HTTP Client'
    }
  };
  
  const req = https.request(options, (res) => {
    console.log('状态码:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const posts = JSON.parse(data);
      console.log(\`获取到 \${posts.length} 篇文章\`);
      console.log('前3篇标题:');
      posts.slice(0, 3).forEach((post, i) => {
        console.log(\`  \${i + 1}. \${post.title}\`);
      });
    });
  });
  
  req.on('error', (err) => {
    console.error('请求错误:', err);
  });
  
  // 必须调用 end() 表示请求发送完成！
  req.end();
}, 1000);


// ============================================
// 示例3：POST 请求发送 JSON 数据
// ============================================

setTimeout(() => {
  console.log('\\n=== POST JSON 请求 ===');
  
  const postData = JSON.stringify({
    title: 'Node.js 教程',
    body: '这是一篇关于 Node.js 的文章',
    userId: 1
  });
  
  const options = {
    hostname: 'jsonplaceholder.typicode.com',
    port: 443,
    path: '/posts',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = https.request(options, (res) => {
    console.log('POST 状态码:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('创建的资源:', JSON.parse(data));
    });
  });
  
  req.on('error', (err) => console.error(err));
  
  // 写入请求体
  req.write(postData);
  req.end();
}, 2000);


// ============================================
// 示例4：下载文件（使用 pipe() 流式处理）
// ============================================

const fs = require('fs');
const path = require('path');

setTimeout(() => {
  console.log('\\n=== 流式下载文件 ===');
  
  const downloadUrl = 'https://jsonplaceholder.typicode.com/posts';
  const downloadPath = path.join(__dirname, 'downloaded-posts.json');
  
  https.get(downloadUrl, (res) => {
    if (res.statusCode !== 200) {
      console.error('下载失败，状态码:', res.statusCode);
      res.resume(); // 消费响应数据
      return;
    }
    
    const fileStream = fs.createWriteStream(downloadPath);
    // pipe 直接将响应流写入文件，内存占用极低！
    res.pipe(fileStream);
    
    fileStream.on('finish', () => {
      fileStream.close();
      const stats = fs.statSync(downloadPath);
      console.log(\`✅ 文件下载完成: \${downloadPath}\`);
      console.log(\`文件大小: \${stats.size} 字节\`);
      
      // 清理
      fs.unlinkSync(downloadPath);
    });
  }).on('error', (err) => {
    console.error('下载错误:', err);
    if (fs.existsSync(downloadPath)) {
      fs.unlinkSync(downloadPath);
    }
  });
}, 3000);


// ============================================
// 示例5：封装成 Promise 和 async/await
// ============================================

// Promise 版本的 http 请求
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    // 判断是 http 还是 https
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || 10000
    }, (res) => {
      const chunks = [];
      
      res.on('data', (chunk) => chunks.push(chunk));
      
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        
        // 处理 HTTP 错误状态码
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(\`HTTP \${res.statusCode}: \${body}\`));
          return;
        }
        
        // 尝试解析 JSON
        let parsedBody = body;
        const contentType = res.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          try {
            parsedBody = JSON.parse(body);
          } catch (e) {
            // 解析失败返回原始字符串
          }
        }
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsedBody
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    
    // 写入请求体
    if (options.body) {
      const bodyData = typeof options.body === 'string' 
        ? options.body 
        : JSON.stringify(options.body);
      req.write(bodyData);
    }
    
    req.end();
  });
}

// async/await 使用示例
setTimeout(async () => {
  console.log('\\n=== Promise 封装版本 ===');
  
  try {
    // GET 请求
    const result = await httpRequest('https://jsonplaceholder.typicode.com/users/1');
    console.log('GET 用户信息成功:');
    console.log('用户名:', result.body.name);
    console.log('邮箱:', result.body.email);
    console.log('网站:', result.body.website);
    
  } catch (err) {
    console.error('请求失败:', err.message);
  }
}, 4000);


// ============================================
// 示例6：处理超时和错误
// ============================================

setTimeout(() => {
  console.log('\\n=== 超时和错误处理演示 ===');
  
  // 使用不存在的域名演示错误
  const badReq = http.get('http://this-domain-does-not-exist-123456.com', (res) => {
    // 不会执行到这里
  });
  
  badReq.on('error', (err) => {
    console.log('网络错误（预期的）:', err.code);
  });
  
  // 超时示例
  const options = {
    hostname: 'httpbin.org',
    path: '/delay/5', // 延迟5秒响应
    timeout: 2000 // 2秒超时
  };
  
  // 注意：httpbin.org 是测试用的，这里可能无法访问
  // 展示一下 API 用法即可
  console.log('超时设置: req.setTimeout(ms)');
  console.log('超时后会触发 timeout 事件');
}, 5000);


console.log('\\n请求已发起，请稍候...');
`,
  },
  {
    id: 'n4-net-dns',
    group: '第二部分 核心模块',
    icon: '🔌',
    title: 'net 与 dns：TCP 服务器与域名解析',
    content: `## 🔌 net 与 dns：TCP 服务器与域名解析

\`net\` 模块提供了底层的 TCP 网络编程能力，HTTP 模块就是构建在它之上的。\`dns\` 模块则用于域名解析。

### TCP 基础

TCP（传输控制协议）是一种面向连接的、可靠的、基于字节流的传输层协议：
- **面向连接**：通信前需要先建立连接（三次握手）
- **可靠传输**：保证数据按序到达，丢失重传
- **字节流**：数据是连续的字节流，没有消息边界

HTTP 协议就是基于 TCP 的。

### net.createServer()

创建 TCP 服务器：
\`\`\`javascript
const server = net.createServer((socket) => {
  // 有新连接时回调，socket 是 net.Socket 实例（双工流）
});
server.listen(port);
\`\`\`

### net.Socket（套接字）

Socket 代表一个 TCP 连接，它是一个 Duplex 流（可读可写）：

| 事件 | 说明 |
|------|------|
| \`connect\` | 连接建立成功（客户端） |
| \`data\` | 收到数据 |
| \`end\` | 对方关闭连接（FIN 包） |
| \`close\` | 连接完全关闭 |
| \`error\` | 发生错误 |
| \`timeout\` | 连接超时 |

| 方法 | 说明 |
|------|------|
| \`socket.write(data)\` | 发送数据 |
| \`socket.end([data])\` | 半关闭连接（发送 FIN） |
| \`socket.destroy()\` | 强制销毁连接 |
| \`socket.pipe()\` | 管道操作 |
| \`socket.setTimeout()\` | 设置超时 |
| \`socket.setEncoding()\` | 设置编码 |

| 属性 | 说明 |
|------|------|
| \`socket.remoteAddress\` | 远程 IP 地址 |
| \`socket.remotePort\` | 远程端口 |
| \`socket.localAddress\` | 本地 IP |
| \`socket.localPort\` | 本地端口 |
| \`socket.bytesRead/bytesWritten\` | 已读写字节数 |

### TCP 粘包问题

TCP 是字节流协议，没有消息边界：
- 多次 \`write()\` 的数据可能被合并成一个包发送（Nagle 算法）
- 一个大数据包可能被拆分成多个包接收
- 解决方法：使用分隔符、固定长度、或长度前缀协议

### DNS 模块

\`dns\` 模块提供域名解析功能：

#### dns.lookup()
- 使用操作系统底层的 DNS 解析（和 ping、浏览器等系统工具一致）
- 支持 \`/etc/hosts\` 文件
- 默认返回 IPv4 地址
- **异步但在 libuv 线程池运行**

#### dns.resolve*()
- 直接连接 DNS 服务器进行解析
- 不使用系统配置（不读 hosts 文件）
- 支持各种记录类型：A、AAAA、MX、TXT、NS、CNAME 等
- **始终使用网络进行 DNS 查询**

| 方法 | 记录类型 | 说明 |
|------|----------|------|
| \`dns.resolve4()\` | A | IPv4 地址 |
| \`dns.resolve6()\` | AAAA | IPv6 地址 |
| \`dns.resolveMx()\` | MX | 邮件交换记录 |
| \`dns.resolveTxt()\` | TXT | 文本记录 |
| \`dns.resolveNs()\` | NS | 域名服务器 |
| \`dns.resolveCname()\` | CNAME | 别名记录 |
| \`dns.reverse()\` | PTR | 反向解析（IP→域名） |

还有 Promise 版本：\`const dns = require('dns/promises');\`

### 💡 常见应用

1. **自定义 TCP 协议**：游戏服务器、消息推送、RPC
2. **端口检查**：检测端口是否被占用
3. **内网服务**：内网服务间通信
4. **域名解析**：预解析、批量解析、监控
5. **反向代理**：负载均衡、代理服务器
`,
    code: `// ============================================
// 示例1：TCP Echo 服务器
// ============================================

const net = require('net');

console.log('=== TCP Echo 服务器演示 ===');

// 创建 TCP 服务器
const tcpServer = net.createServer((socket) => {
  // 有客户端连接进来
  const clientAddr = \`\${socket.remoteAddress}:\${socket.remotePort}\`;
  console.log(\`\n[新连接] 客户端 \${clientAddr} 已连接\`);
  console.log(\`当前连接数: \${tcpServer.connections}\`);
  
  // 欢迎消息
  socket.write('欢迎连接到 Echo 服务器！输入消息，我会原样返回。输入 "quit" 退出。\\n');
  
  // 收到客户端数据
  socket.on('data', (data) => {
    const message = data.toString().trim();
    console.log(\`[收到] \${clientAddr}: \${message}\`);
    
    if (message.toLowerCase() === 'quit') {
      socket.write('再见！\\n');
      socket.end();
      return;
    }
    
    // Echo：原样返回
    socket.write(\`Echo: \${message}\\n\`);
  });
  
  // 客户端关闭连接
  socket.on('end', () => {
    console.log(\`[断开] \${clientAddr} 已断开连接\`);
  });
  
  // 连接关闭
  socket.on('close', () => {
    console.log(\`[关闭] 连接已关闭，当前连接数: \${tcpServer.connections}\`);
  });
  
  // 错误处理
  socket.on('error', (err) => {
    console.error(\`[错误] \${clientAddr}:\`, err.message);
  });
});

// 监听端口
const TCP_PORT = 8124;
tcpServer.listen(TCP_PORT, () => {
  console.log(\`TCP 服务器监听端口 \${TCP_PORT}\`);
  console.log(\`你可以使用 \`telnet localhost \${TCP_PORT}\` 测试\`);
});


// ============================================
// 示例2：TCP 客户端
// ============================================

setTimeout(() => {
  console.log('\\n=== TCP 客户端演示 ===');
  
  // 连接到刚才的服务器
  const client = net.createConnection({ port: TCP_PORT }, () => {
    console.log('客户端已连接到服务器');
    client.write('你好，服务器！我是客户端。');
  });
  
  client.on('data', (data) => {
    console.log('客户端收到:', data.toString().trim());
    
    // 发送第二条消息后退出
    if (data.toString().includes('你好')) {
      setTimeout(() => {
        client.write('quit');
      }, 100);
    }
  });
  
  client.on('end', () => {
    console.log('客户端：服务器已断开连接');
  });
  
  client.on('error', (err) => {
    console.log('客户端错误（如果服务器没启动）:', err.code);
  });
  
}, 500);


// ============================================
// 示例3：简单的 TCP 聊天服务器（广播）
// ============================================

function createChatServer(port) {
  const clients = new Set();
  
  const chatServer = net.createServer((socket) => {
    let username = '用户' + Math.floor(Math.random() * 1000);
    clients.add(socket);
    
    // 广播函数：向所有客户端发送消息
    function broadcast(message, except) {
      clients.forEach((client) => {
        if (client !== except && !client.destroyed) {
          client.write(message);
        }
      });
    }
    
    socket.write(\`欢迎进入聊天室！你的昵称是 \${username}\\n\`);
    broadcast(\`🔔 \${username} 加入了聊天室\\n\`, socket);
    
    socket.on('data', (data) => {
      const message = data.toString().trim();
      
      if (message.startsWith('/nick ')) {
        // 改名命令
        const newName = message.substring(6).trim();
        broadcast(\`📝 \${username} 改名为 \${newName}\\n\`);
        username = newName;
        socket.write(\`✅ 你已改名为 \${username}\\n\`);
      } else if (message === '/quit') {
        socket.end();
      } else {
        broadcast(\`[\${username}]: \${message}\\n\`);
      }
    });
    
    socket.on('end', () => {
      clients.delete(socket);
      broadcast(\`🔔 \${username} 离开了聊天室\\n\`);
    });
    
    socket.on('error', () => {
      clients.delete(socket);
    });
  });
  
  return chatServer;
}

// 聊天服务器只展示代码，不实际启动
console.log('\\n=== TCP 聊天服务器代码说明 ===');
console.log('功能：多客户端广播、/nick 改名、/quit 退出');
console.log('已写好 createChatServer() 函数供参考');


// ============================================
// 示例4：端口检查工具
// ============================================

function checkPort(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const tester = net.createConnection({ port, host });
    
    tester.once('connect', () => {
      tester.end();
      resolve({ port, inUse: true });
    });
    
    tester.once('error', (err) => {
      resolve({ port, inUse: false, error: err.code });
    });
  });
}

console.log('\\n=== 端口检查 ===');
checkPort(TCP_PORT).then(result => {
  console.log(\`端口 \${result.port}:\`, result.inUse ? '已被占用' : '可用');
});

setTimeout(() => {
  // 关闭演示服务器
  tcpServer.close();
  console.log('TCP 演示服务器已关闭');
}, 2000);


// ============================================
// 示例5：DNS 解析
// ============================================

const dns = require('dns');
// Promise 版本
const dnsPromises = require('dns/promises');

setTimeout(async () => {
  console.log('\\n=== DNS 解析演示 ===');
  
  const domain = 'example.com';
  
  // dns.lookup: 使用系统解析（包括 hosts 文件）
  console.log('\\n--- dns.lookup() (系统解析) ---');
  dns.lookup(domain, (err, address, family) => {
    if (err) {
      console.log('lookup 失败:', err.message);
    } else {
      console.log(\`\${domain} -> IP: \${address}, IPv\${family}\`);
    }
  });
  
  // dns.resolve4: 直接查 DNS，返回 A 记录
  console.log('\\n--- dns.resolve4() (DNS A记录) ---');
  try {
    const addresses = await dnsPromises.resolve4(domain);
    console.log(\`A 记录:\`, addresses);
  } catch (e) {
    console.log('resolve4 失败:', e.message);
  }
  
  // 解析 MX 记录（邮件服务器）
  console.log('\\n--- dns.resolveMx() (MX 邮件记录) ---');
  try {
    const mxRecords = await dnsPromises.resolveMx('qq.com');
    console.log('MX 记录:');
    mxRecords.forEach((record, i) => {
      console.log(\`  \${i + 1}. 优先级 \${record.priority}: \${record.exchange}\`);
    });
  } catch (e) {
    console.log('resolveMx 失败:', e.message);
  }
  
  // 反向解析（IP -> 域名）
  console.log('\\n--- dns.reverse() (反向解析) ---');
  dns.reverse('8.8.8.8', (err, hostnames) => {
    if (err) {
      console.log('reverse 失败:', err.message);
    } else {
      console.log('8.8.8.8 的域名:', hostnames);
    }
  });
  
  // dns.lookup vs dns.resolve 的区别
  console.log('\\n--- dns.lookup vs dns.resolve 区别 ---');
  console.log('dns.lookup: 使用 OS 解析，读取 hosts，可能返回系统配置的地址');
  console.log('dns.resolve*: 直接查询 DNS 服务器，不读 hosts 文件');
  
}, 3000);
`,
  },
  {
    id: 'n4-zlib',
    group: '第二部分 核心模块',
    icon: '🗜️',
    title: 'zlib 压缩：gzip/deflate 与数据压缩',
    content: `## 🗜️ zlib 压缩：gzip/deflate 与数据压缩

\`zlib\` 模块提供了数据压缩功能，基于 Gzip、Deflate/Inflate、以及 Brotli 算法。压缩在 Web 开发中无处不在：
- HTTP 响应压缩（节省带宽）
- 文件压缩存储
- 数据传输减少体积

### 为什么需要压缩？

压缩的好处：
1. **减少带宽占用**：文本文件通常能压缩 60-80%
2. **加快传输速度**：文件更小，下载更快
3. **节省存储空间**：日志、备份文件压缩后更小
4. **改善用户体验**：网页加载更快

代价：需要 CPU 时间进行压缩和解压。

### 支持的压缩算法

| 算法 | 说明 | 特点 |
|------|------|------|
| **Gzip** | GNU zip 格式 | 最通用，HTTP 压缩首选，有校验和 |
| **Deflate** | 原始 deflate 流 | 比 gzip 略小（没有 gzip 头） |
| **Brotli** | Google 开发的现代算法 | 压缩率比 gzip 高 15-25%，较新 |
| **Zlib** | zlib 格式 | 和 deflate 类似但有头和校验 |

### 两种使用方式

zlib 提供两种风格的 API：

#### 1. 简单 API（Buffer/字符串到 Buffer）
一次性压缩/解压整个缓冲区，适合小数据：
- \`zlib.gzip(buf, callback)\`
- \`zlib.gunzip(buf, callback)\`
- \`zlib.deflate(buf, callback)\`
- \`zlib.inflate(buf, callback)\`
- \`zlib.brotliCompress(buf, callback)\`
- 也有相应的 Sync 版本：\`gzipSync\`, \`gunzipSync\` 等

#### 2. Stream API（流式压缩/解压）
基于流的压缩，适合大文件或 HTTP 场景：
- \`zlib.createGzip()\`
- \`zlib.createGunzip()\`
- \`zlib.createDeflate()\`
- \`zlib.createInflate()\`
- \`zlib.createBrotliCompress()\`
- \`zlib.createBrotliDecompress()\`

### 压缩级别

大多数算法支持 1-9 的压缩级别：
- **1（Z_BEST_SPEED）**：最快，压缩率最低
- **6（Z_DEFAULT_COMPRESSION）**：默认，速度和压缩率平衡
- **9（Z_BEST_COMPRESSION）**：最高压缩率，最慢

还有几个特殊值：
- **0（Z_NO_COMPRESSION）**：不压缩
- **-1（Z_DEFAULT）**：默认级别（相当于6）

### HTTP 压缩

HTTP 压缩的工作流程：

1. 客户端请求时带 \`Accept-Encoding: gzip, deflate, br\` 头，表示支持的压缩算法
2. 服务器选择一种算法压缩响应，返回时带 \`Content-Encoding: gzip\` 头
3. 客户端根据 Content-Encoding 解压

⚠️ **注意**：
- 不要压缩已经压缩过的内容（JPEG、PNG、ZIP、MP4 等）
- 小文件压缩后可能反而变大（因为 gzip 头等开销）
- 压缩需要 CPU，高流量服务器要权衡 CPU 开销

### 💡 最佳实践

1. **大文件/HTTP 传输使用流式 API**：内存效率高
2. **静态文件预压缩**：提前压缩好 .gz/.br 文件，服务器直接发送
3. **选择合适的压缩级别**：动态内容用较低级别追求速度，静态文件用较高级别
4. **Brotli 优先于 Gzip**：如果客户端支持，Brotli 压缩率更好
5. **记得处理错误**：解压不完整或损坏的数据会抛出错误
`,
    code: `// ============================================
// 示例1：简单 Buffer 压缩/解压
// ============================================

const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

console.log('=== Buffer 压缩/解压演示 ===');

// 创建一些可压缩的文本数据
const text = '这是一段需要压缩的文本。\\n'.repeat(1000);
const textBuffer = Buffer.from(text, 'utf8');

console.log(\`原始数据大小: \${textBuffer.length} 字节\`);

// Gzip 压缩（同步版本）
const gzipped = zlib.gzipSync(textBuffer);
console.log(\`Gzip 压缩后: \${gzipped.length} 字节\`);
console.log(\`压缩率: \${((1 - gzipped.length / textBuffer.length) * 100).toFixed(1)}%\`);

// Gzip 解压
const gunzipped = zlib.gunzipSync(gzipped);
console.log(\`解压后大小: \${gunzipped.length} 字节\`);
console.log(\`解压后与原数据一致: \${gunzipped.equals(textBuffer)}\`);

// Deflate 压缩
const deflated = zlib.deflateSync(textBuffer);
console.log(\`\\nDeflate 压缩后: \${deflated.length} 字节\`);

// Brotli 压缩（通常压缩率最高）
const brotlied = zlib.brotliCompressSync(textBuffer);
console.log(\`Brotli 压缩后: \${brotlied.length} 字节\`);


// ============================================
// 示例2：压缩级别对比
// ============================================

console.log('\\n=== 压缩级别对比 ===');

const testData = Buffer.from('Node.js zlib module compression test '.repeat(500));

console.log('原始大小:', testData.length, '字节\\n');
console.log('级别 | 压缩后大小 | 压缩率');
console.log('-----|-----------|-------');

for (let level = 1; level <= 9; level++) {
  const compressed = zlib.gzipSync(testData, { level: level });
  const ratio = ((1 - compressed.length / testData.length) * 100).toFixed(1);
  const marker = level === 6 ? ' (默认)' : '';
  console.log(\`  \${level}  | \${String(compressed.length).padStart(8)}  | \${ratio}%\${marker}\`);
}


// ============================================
// 示例3：流式压缩文件（gzip）
// ============================================

console.log('\\n=== 流式文件压缩 ===');

// 创建测试文件
const sourceFile = path.join(__dirname, 'zlib-source.txt');
const gzipFile = path.join(__dirname, 'zlib-source.txt.gz');
const ungzFile = path.join(__dirname, 'zlib-ungz.txt');

fs.writeFileSync(sourceFile, '这是用于流式压缩测试的文本内容。\\n'.repeat(2000));

console.log(\`源文件大小: \${fs.statSync(sourceFile).size} 字节\`);

// 使用 pipeline 安全地进行流式压缩
const { pipeline } = require('stream');

// 压缩：源 -> gzip -> 压缩文件
const gzip = zlib.createGzip({ level: 6 });
const source = fs.createReadStream(sourceFile);
const gzDest = fs.createWriteStream(gzipFile);

pipeline(source, gzip, gzDest, (err) => {
  if (err) {
    console.error('压缩失败:', err);
    return;
  }
  
  console.log(\`压缩后文件大小: \${fs.statSync(gzipFile).size} 字节\`);
  
  // 解压：压缩文件 -> gunzip -> 目标文件
  const gunzip = zlib.createGunzip();
  const gzSource = fs.createReadStream(gzipFile);
  const ungzDest = fs.createWriteStream(ungzFile);
  
  pipeline(gzSource, gunzip, ungzDest, (err) => {
    if (err) {
      console.error('解压失败:', err);
      return;
    }
    
    console.log(\`解压后大小: \${fs.statSync(ungzFile).size} 字节\`);
    
    // 验证一致性
    const original = fs.readFileSync(sourceFile);
    const uncompressed = fs.readFileSync(ungzFile);
    console.log(\`解压后与原文件一致: \${original.equals(uncompressed)}\`);
    
    // 清理
    fs.unlinkSync(sourceFile);
    fs.unlinkSync(gzipFile);
    fs.unlinkSync(ungzFile);
  });
});


// ============================================
// 示例4：异步 API 与 Promise
// ============================================

const { promisify } = require('util');
const gzipAsync = promisify(zlib.gzip);
const gunzipAsync = promisify(zlib.gunzip);

setTimeout(async () => {
  console.log('\\n=== Promise 风格异步压缩 ===');
  
  try {
    const original = '使用 promisify 包装的异步压缩';
    const compressed = await gzipAsync(original);
    const decompressed = await gunzipAsync(compressed);
    
    console.log('原始:', original);
    console.log('压缩后:', compressed.length, '字节');
    console.log('解压:', decompressed.toString());
  } catch (err) {
    console.error('压缩错误:', err);
  }
}, 300);


// ============================================
// 示例5：HTTP 响应压缩（中间件模式）
// ============================================

const http = require('http');

// 创建一个带 gzip 压缩的 HTTP 服务器
function createCompressionServer() {
  return http.createServer((req, res) => {
    const acceptEncoding = req.headers['accept-encoding'] || '';
    
    // 准备响应数据
    const responseData = JSON.stringify({
      message: '这是一个带 gzip 压缩的响应',
      timestamp: new Date().toISOString(),
      data: Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: \`项目 \${i}\`,
        description: '这是一段较长的描述文本用于测试压缩效果'
      }))
    });
    
    // 检查客户端是否支持 gzip
    if (acceptEncoding.includes('gzip')) {
      console.log('\\n使用 gzip 压缩响应');
      
      // 设置响应头
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Encoding': 'gzip'
      });
      
      // 压缩并发送
      zlib.gzip(responseData, (err, compressed) => {
        if (err) {
          res.end(responseData); // 压缩失败则发送原始数据
        } else {
          console.log(\`原始: \${responseData.length} 字节 -> 压缩: \${compressed.length} 字节\`);
          res.end(compressed);
        }
      });
    } else {
      console.log('客户端不支持 gzip，发送未压缩数据');
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8'
      });
      res.end(responseData);
    }
  });
}

console.log('\\n=== HTTP gzip 压缩中间件说明 ===');
console.log('压缩中间件工作流程:');
console.log('1. 检查 Accept-Encoding 请求头');
console.log('2. 如果支持 gzip/br，压缩响应并设置 Content-Encoding');
console.log('3. 客户端根据 Content-Encoding 自动解压');


// ============================================
// 示例6：内存中的数据压缩
// ============================================

setTimeout(() => {
  console.log('\\n=== 内存数据压缩 ===');
  
  // 模拟一个需要压缩存储的对象
  const largeObject = {
    users: Array.from({ length: 500 }, (_, i) => ({
      id: i,
      name: \`用户\${i}\`,
      email: \`user\${i}@example.com\`,
      createdAt: new Date().toISOString(),
      profile: '这是用户资料'.repeat(20)
    }))
  };
  
  const jsonString = JSON.stringify(largeObject);
  const jsonBuffer = Buffer.from(jsonString);
  
  // 压缩
  const compressed = zlib.gzipSync(jsonBuffer);
  
  console.log(\`JSON 字符串大小: \${jsonBuffer.length} 字节\`);
  console.log(\`Gzip 压缩后: \${compressed.length} 字节\`);
  console.log(\`节省空间: \${((1 - compressed.length / jsonBuffer.length) * 100).toFixed(1)}%\`);
  
  // 可以将压缩后的数据存入 Redis、数据库等，节省空间
  
  // 解压还原
  const restored = JSON.parse(zlib.gunzipSync(compressed).toString());
  console.log(\`\\n解压后用户数量: \${restored.users.length}\`);
  console.log('压缩/解压完整数据验证通过！');
}, 500);
`,
  },
  {
    id: 'n4-child-process',
    group: '第二部分 核心模块',
    icon: '👶',
    title: 'child_process：调用外部程序与子进程',
    content: `## 👶 child_process：调用外部程序与子进程

\`child_process\` 模块允许你在 Node.js 中启动和控制外部进程、系统命令、或其他 Node.js 子程序。这是 Node.js 与操作系统交互、调用系统工具、利用多 CPU 核心的关键模块。

### 四个核心方法

| 方法 | 缓冲/流式 | Shell | 适用场景 |
|------|----------|-------|----------|
| \`exec\` | 缓冲输出 | 有（shell） | 简单命令，小输出，需要 shell 语法（管道、重定向） |
| \`execFile\` | 缓冲输出 | 无 | 直接执行程序，更安全，小输出 |
| \`spawn\` | 流式输出 | 默认无 | 长时间运行进程，大输出，需要实时处理 |
| \`fork\` | 流式输出 | 无 | 专门派生 Node.js 子进程，自带 IPC 通信 |

所有方法都有对应的 **Sync** 同步版本：\`execSync\`, \`execFileSync\`, \`spawnSync\`。

### exec() 详解

\`exec(command[, options], callback)\`
- 创建一个 shell 来执行命令
- 命令完成后将 stdout/stderr 缓冲到内存
- 适合简单、输出不大的命令
- ⚠️ **安全警告**：如果命令包含用户输入，存在 shell 注入风险！

回调参数：\`(error, stdout, stderr)\`

### execFile() 详解

\`execFile(file[, args][, options], callback)\`
- 直接执行指定的可执行文件，**不经过 shell**
- 参数通过数组传递，更安全
- 没有 shell 就不能使用管道、重定向、通配符等 shell 语法
- 如果需要 shell 特性，可以设置 \`{ shell: true }\`

### spawn() 详解

\`spawn(command[, args][, options])\`
- **流式**处理输出，stdout 和 stderr 是流
- 最通用、最灵活
- 适合：
  - 长时间运行的命令（如监控、编译）
  - 输出很大的命令
  - 需要实时处理输出
- 返回 ChildProcess 对象
- 默认没有 shell，需要 \`shell: true\` 才能用 shell 语法

### fork() 详解

\`fork(modulePath[, args][, options])\`
- spawn 的特殊版本，专门用于创建新的 Node.js 进程
- 自动建立 **IPC（进程间通信）通道**
- 父进程和子进程可以通过 \`send()\` 和 \`message\` 事件通信
- 每个子进程是独立的 V8 实例
- 用于 CPU 密集型任务（避免阻塞主事件循环）

### 常用选项

| 选项 | 说明 |
|------|------|
| \`cwd\` | 子进程工作目录 |
| \`env\` | 环境变量（默认 process.env） |
| \`encoding\` | 输出编码，默认 'buffer'，设为 'utf8' 得到字符串 |
| \`shell\` | 是否用 shell 执行（spawn/execFile 默认 false） |
| \`timeout\` | 超时（毫秒），超时后发送 killSignal |
| \`maxBuffer\` | stdout/stderr 最大缓冲大小，默认 1MB |
| \`killSignal\` | 超时或退出时发送的信号，默认 'SIGTERM' |
| \`uid/gid\` | 设置子进程的用户/组 ID |
| \`stdio\` | stdio 配置（见下文） |

### ChildProcess 对象

| 事件 | 说明 |
|------|------|
| \`exit\` | 进程退出（code, signal），此时 stdio 可能还开着 |
| \`close\` | 进程结束且 stdio 已关闭 |
| \`error\` | 进程无法创建、无法杀死等错误 |
| \`message\` | fork() 子进程发送消息时（IPC） |
| \`disconnect\` | IPC 通道断开时 |

| 方法/属性 | 说明 |
|-----------|------|
| \`child.stdin\` | 子进程标准输入（可写流） |
| \`child.stdout\` | 子进程标准输出（可读流） |
| \`child.stderr\` | 子进程标准错误（可读流） |
| \`child.pid\` | 子进程 PID |
| \`child.kill([signal])\` | 发送信号杀死进程 |
| \`child.send(message)\` | 向 fork 子进程发送消息 |
| \`child.disconnect()\` | 关闭 IPC 通道 |

### 🚨 安全警告：Shell 注入

永远不要把用户输入直接拼接到 exec 命令中！

\`\`\`javascript
// ❌ 危险！用户输入 "; rm -rf /" 会造成灾难
exec('ls ' + userInput);

// ✅ 安全：使用 execFile 传参数数组
execFile('ls', [userInput], { shell: false });
\`\`\`

### stdio 选项详解

- **'pipe'**（默认）：创建管道，通过 child.stdin/stdout/stderr 访问
- **'inherit'**：使用父进程的 stdio（子进程直接输出到控制台）
- **'ignore'**：忽略/dev/null
- 也可以传入文件描述符数组精细控制

### 💡 最佳实践

1. **优先使用 spawn/execFile**，而不是 exec（更安全）
2. **exec 永远不要拼接用户输入**
3. **长时间运行进程用 spawn**，实时处理输出
4. **CPU 密集任务用 fork**，避免阻塞主线程
5. **始终监听 error 事件**
6. **同步方法只用于启动时脚本**，不要在请求处理中使用
`,
    code: `// ============================================
// 示例1：exec() - 执行简单命令
// ============================================

const { exec, execSync, execFile, spawn, fork } = require('child_process');
const path = require('path');

console.log('=== exec() 演示 ===');

// 跨平台的命令（Windows 和 Unix 都有 ls/dir 的问题，这里用 node 自身的命令）
// 注意：实际使用时要考虑跨平台兼容性

// exec: 启动 shell 执行命令，缓冲所有输出
// Windows 下用 'dir'，Unix 下用 'ls'
const isWindows = process.platform === 'win32';
const listCommand = isWindows ? 'dir' : 'ls -la';

exec(listCommand, { encoding: 'utf8' }, (error, stdout, stderr) => {
  if (error) {
    console.error('exec 错误:', error.message);
    return;
  }
  
  if (stderr) {
    console.error('stderr:', stderr);
  }
  
  console.log('目录列表（前300字符）:');
  console.log(stdout.substring(0, 300));
});


// ============================================
// 示例2：execSync() 同步版本
// ============================================

setTimeout(() => {
  console.log('\\n=== execSync() 同步演示 ===');
  
  try {
    // 同步执行：会阻塞事件循环！
    // 适合启动时、CLI 工具，不适合服务器请求处理
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    
    console.log('Node 版本:', nodeVersion);
    console.log('npm 版本:', npmVersion);
  } catch (err) {
    console.error('执行失败:', err.message);
  }
}, 300);


// ============================================
// 示例3：execFile() - 不使用 shell，更安全
// ============================================

setTimeout(() => {
  console.log('\\n=== execFile() 演示 ===');
  
  // 直接执行 node 命令，不通过 shell
  // 参数通过数组传递，避免 shell 注入
  execFile(process.execPath, // node 可执行文件路径
    ['--version'], 
    { encoding: 'utf8' },
    (error, stdout, stderr) => {
      if (error) {
        console.error('execFile 错误:', error);
        return;
      }
      console.log('execFile 执行 node --version:', stdout.trim());
    }
  );
}, 500);


// ============================================
// 示例4：spawn() - 流式输出，长时间运行进程
// ============================================

setTimeout(() => {
  console.log('\\n=== spawn() 演示 ===');
  
  // spawn 适合：
  // - 长时间运行的命令
  // - 输出很大的命令
  // - 需要实时处理输出的场景
  
  // 用 node 执行一个简单的脚本，避免平台问题
  const script = \`
    for (let i = 1; i <= 5; i++) {
      console.log('子进程输出第', i, '行');
    }
  \`;
  
  // 或者执行系统命令（ping 是跨平台的好例子）
  const pingArgs = isWindows 
    ? ['-n', '3', '127.0.0.1']
    : ['-c', '3', '127.0.0.1'];
  
  console.log('执行 ping 命令（spawn 流式输出）:');
  
  const child = spawn('ping', pingArgs, {
    // stdio: 'inherit' 让子进程直接使用父进程的控制台
    // 这里用 'pipe' 手动处理输出
    stdio: 'pipe'
  });
  
  // stdout 和 stderr 是可读流，可以实时处理数据
  child.stdout.on('data', (data) => {
    console.log('[stdout]', data.toString().trim());
  });
  
  child.stderr.on('data', (data) => {
    console.log('[stderr]', data.toString().trim());
  });
  
  child.on('close', (code) => {
    console.log(\`子进程退出，退出码: \${code}\`);
  });
  
  child.on('error', (err) => {
    console.error('子进程错误:', err);
  });
}, 700);


// ============================================
// 示例5：spawn() - 管道操作
// ============================================

setTimeout(() => {
  console.log('\\n=== spawn 管道操作（类似 shell 的 | 管道）===');
  
  // 模拟: find . -name "*.js" | head -5
  // 由于跨平台问题，这里用 node 脚本演示管道概念
  
  // 子进程1：生产数据
  const producer = spawn(process.execPath, ['-e', \`
    for (let i = 1; i <= 10; i++) {
      console.log('file' + i + '.js');
    }
  \`]);
  
  // 子进程2：处理数据（取前5行）
  const head = spawn(process.execPath, ['-e', \`
    let lines = [];
    process.stdin.on('data', (data) => {
      lines = lines.concat(data.toString().trim().split('\\n'));
    });
    process.stdin.on('end', () => {
      lines.slice(0, 5).forEach(l => console.log(l));
    });
  \`]);
  
  // 将 producer 的 stdout 通过管道连接到 head 的 stdin
  producer.stdout.pipe(head.stdin);
  
  head.stdout.on('data', (data) => {
    console.log('前5个文件:');
    console.log(data.toString());
  });
  
  head.on('close', () => {
    console.log('管道处理完成');
  });
  
}, 2500);


// ============================================
// 示例6：fork() - Node.js 子进程与 IPC
// ============================================

setTimeout(() => {
  console.log('\\n=== fork() IPC 通信演示 ===');
  
  // 创建一个临时的子进程脚本
  const childScript = path.join(__dirname, 'child-script.js');
  const fs = require('fs');
  
  // 写入子进程脚本
  fs.writeFileSync(childScript, \`
// 这是子进程代码
let count = 0;

// 监听父进程消息
process.on('message', (msg) => {
  console.log('子进程收到:', msg);
  
  if (msg.type === 'calculate') {
    // 模拟 CPU 密集计算
    let result = 0;
    for (let i = 0; i < msg.n; i++) {
      result += i;
    }
    
    // 发送结果回父进程
    process.send({
      type: 'result',
      input: msg.n,
      result: result,
      pid: process.pid
    });
  } else if (msg.type === 'exit') {
    process.exit(0);
  }
});

// 告诉父进程我准备好了
process.send({ type: 'ready', pid: process.pid });
\`);
  
  // fork 子进程
  const child = fork(childScript);
  
  child.on('message', (msg) => {
    console.log('父进程收到消息:', msg);
    
    if (msg.type === 'ready') {
      console.log('子进程已就绪，发送计算任务...');
      
      // 发送计算任务到子进程
      child.send({ type: 'calculate', n: 1000000 });
      
      setTimeout(() => {
        // 发送多个任务
        child.send({ type: 'calculate', n: 5000000 });
        
        setTimeout(() => {
          child.send({ type: 'exit' });
        }, 500);
      }, 500);
    }
  });
  
  child.on('exit', (code) => {
    console.log(\`子进程退出，退出码: \${code}\`);
    // 清理临时文件
    fs.unlinkSync(childScript);
  });
  
  child.on('error', (err) => {
    console.error('子进程错误:', err);
    if (fs.existsSync(childScript)) {
      fs.unlinkSync(childScript);
    }
  });
  
}, 4000);


// ============================================
// 示例7：安全注意事项 - exec 与 execFile 对比
// ============================================

setTimeout(() => {
  console.log('\\n=== 安全警告演示 ===');
  
  console.log('⚠️  SHELL 注入风险:');
  console.log('❌ exec("ls " + userInput) 是危险的！');
  console.log('   如果 userInput 是 "; rm -rf /" 或 "&& format c:" 会出问题');
  console.log('');
  console.log('✅ 安全的做法:');
  console.log('   1. 使用 execFile(file, [args]) - 参数不经过 shell');
  console.log('   2. 如果必须用 shell，严格验证/转义用户输入');
  console.log('   3. spawn 默认也不用 shell，更安全');
  console.log('');
  
  // 选项示例
  console.log('常用选项:');
  console.log('- cwd: 子进程工作目录');
  console.log('- env: 环境变量');
  console.log('- timeout: 超时（毫秒）');
  console.log('- maxBuffer: 最大输出缓冲（默认1MB）');
  console.log('- shell: true/false 是否使用 shell');
  
}, 6000);
`,
  },
];
