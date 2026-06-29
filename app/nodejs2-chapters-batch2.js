export const chapters = [
  {
    id: "n2-stream-basic",
    title: "Stream 流基础与背压（Backpressure）",
    icon: "🌊",
    group: "第二部分 核心模块与源码原理",
    content: `# Stream 流基础与背压（Backpressure）

流（Stream）是 Node.js 中最核心、最强大，但也最容易被误解的概念之一。它是 Node.js 处理大文件、网络通信等 IO 密集场景的基石。理解流，是从"会用 Node.js"到"精通 Node.js"的关键一步。

## 什么是流？为什么需要流？

想象一下，你要把一桶水从A点运到B点。如果你选择"一次性把整桶水搬过去"，这就类似于我们用 \`fs.readFile\` 读取整个文件——所有数据必须全部加载到内存中，才能开始处理。如果文件是 10GB，你的内存可能根本装不下，程序直接崩溃。

但如果你用一根水管连接A和B，让水**源源不断地流过**，这就是流的思想。数据像水流一样，一小段一小段地通过管道，不需要在内存中保存全部数据。

**流的本质是数据的分块处理**。它把数据拆成一个个小的 chunk（块），逐块处理，处理完一块再处理下一块。这带来两个巨大的优势：

1. **内存效率**：不需要把所有数据一次性加载到内存。处理 10GB 文件可能只需要几十 KB 内存。
2. **时间效率**：可以边读取边处理，不需要等所有数据读完才开始。比如看在线视频，不需要等整部电影下载完就能开始看。

Node.js 中很多核心模块都基于流实现：
- HTTP 的请求（req）和响应（res）对象
- 文件系统的 \`fs.createReadStream\` 和 \`fs.createWriteStream\`
- zlib 压缩、crypto 加密
- 进程的 stdin/stdout/stderr

---

## 四种基础流类型

Node.js 的 stream 模块定义了四种基础流类型，所有流都是这四种之一的实例：

| 流类型 | 描述 | 例子 |
|--------|------|------|
| **Readable（可读流）** | 数据的来源，可以从中读取数据 | fs.createReadStream、http.IncomingMessage、process.stdin |
| **Writable（可写流）** | 数据的目的地，可以向其中写入数据 | fs.createWriteStream、http.ServerResponse、process.stdout |
| **Duplex（双工流）** | 既可读又可写，读写是独立的 | net.Socket（TCP socket） |
| **Transform（转换流）** | 特殊的 Duplex 流，输入经过变换后输出 | zlib.createGzip、crypto.createCipheriv |

可以这样理解：Readable 是"水龙头"，Writable 是"水池"，Duplex 是"又能进又能出的双向水管"，而 Transform 是"净水器"——水从一端进去，经过过滤后从另一端出来。

### Readable 流

Readable 流代表数据来源。它有两个核心方法：
- \`readable.pipe(destination)\`：自动把数据从可读流传到可写流
- \`readable.read([size])\`：手动从流中读取数据
- \`readable.push(chunk)\`：（在内部实现中）向流中添加数据

Readable 流会在内部维护一个缓冲区（buffer），用来存放还没被消费的数据。

### Writable 流

Writable 流代表数据目的地。核心方法：
- \`writable.write(chunk)\`：写入一块数据
- \`writable.end([chunk])\`：结束写入，可选地写入最后一块数据
- \`writable.cork()/uncork()\`：缓冲写入（批量写入时优化性能）

Writable 流同样有内部缓冲区，用来存放还没来得及真正写入底层的数据。

---

## 流的两种模式：Flowing vs Paused

Readable 流有两种工作模式，这是很多初学者困惑的地方。

### 1. Flowing Mode（流动模式）

在流动模式下，数据会**自动**从底层系统读取，并通过 EventEmitter 接口的事件尽可能快地提供给应用程序。简单说，就是"水自动往下流"，你只需要监听 \`data\` 事件接收数据。

进入流动模式的方式：
- 添加 \`data\` 事件监听器
- 调用 \`stream.pipe()\` 方法
- 调用 \`stream.resume()\` 方法

\`\`\`js
const fs = require('fs');
const readable = fs.createReadStream('large-file.txt');

// 添加 data 监听器，自动进入 flowing 模式
readable.on('data', (chunk) => {
  console.log(\`收到 \${chunk.length} 字节数据\`);
});

readable.on('end', () => {
  console.log('数据读取完毕');
});
\`\`\`

### 2. Paused Mode（暂停模式）

在暂停模式下，必须**显式调用** \`stream.read()\` 方法来从流中读取数据块。这是 Readable 流的默认模式。

\`\`\`js
const readable = fs.createReadStream('large-file.txt');

// 暂停模式，需要手动 read
readable.on('readable', () => {
  let chunk;
  // 循环读取，直到 read() 返回 null
  while ((chunk = readable.read()) !== null) {
    console.log(\`读取到 \${chunk.length} 字节\`);
  }
});
\`\`\`

### 模式切换

| 当前模式 | 切换到 Paused | 切换到 Flowing |
|----------|---------------|----------------|
| Paused | - | 调用 resume()、添加 data 事件、pipe() |
| Flowing | 调用 pause()（且没有 pipe）、移除所有 data 事件、unpipe() 所有目标 | - |

> **重要提示**：如果在 Flowing 模式下，你没有监听 \`data\` 事件，也没有 \`pipe()\` 到任何地方，**数据会丢失**！这是常见坑点。

---

## data 事件 vs read() 方法

这两种消费数据的方式有什么区别？什么时候用哪个？

### data 事件（Flowing 模式）

- 数据到达就触发，**自动推送**给你
- 使用简单，适合"来一块处理一块"的场景
- 如果处理速度跟不上，数据会在 Readable 的缓冲区堆积

### read() 方法（Paused 模式）

- 你**主动拉取**数据，需要多少读多少
- 更灵活，可以控制读取节奏
- 适合需要精确控制流量、背压处理的场景
- \`readable\` 事件表示"有数据可读了"，然后你在回调里循环 read

---

## 背压（Backpressure）——流的核心问题

背压是流处理中最重要的概念。如果你理解了背压，就理解了流为什么能工作得这么好。

### 什么是背压？

想象一下：你用漏斗往瓶子里灌水。如果水龙头开得太大，水灌得太快，漏斗下面的瓶口来不及流下去，水就会在漏斗里积起来，最终溢出。这就是生活中的"背压"——下游消费速度跟不上上游生产速度，导致数据积压。

在流的世界里，背压发生在：**可读流产生数据的速度 > 可写流消费数据的速度**。

### 背压是怎么产生的？

让我们看一个手动传输数据的例子（不使用 pipe）：

\`\`\`js
// 反例：不处理背压
readable.on('data', (chunk) => {
  writable.write(chunk); // 如果 write 返回 false 怎么办？
});
\`\`\`

当你调用 \`writable.write(chunk)\` 时：
1. 如果 Writable 的内部缓冲区还没满，数据放入缓冲区，\`write()\` 返回 \`true\`
2. 如果缓冲区满了（超过 \`highWaterMark\`），数据**仍然会被放入缓冲区**，但 \`write()\` 返回 \`false\`

这个 \`false\` 就是背压的信号！它告诉你："我已经吃不下了，你先别喂了！"

如果你不管这个 \`false\`，继续不停地 \`write()\`，缓冲区会越来越大，内存占用飙升，最后可能导致内存泄漏甚至程序崩溃。这正是很多新手用流时遇到的问题——以为用了流就自动内存高效，结果手动写 data 事件处理时没处理背压，内存照样爆。

### highWaterMark——水位线

\`highWaterMark\`（高水位线）是流的一个重要参数，它定义了内部缓冲区的阈值：
- 对于 Readable，当缓冲区大小达到 highWaterMark 时，它会停止从底层读取数据
- 对于 Writable，当缓冲区大小达到 highWaterMark 时，\`write()\` 返回 false

默认值是 16KB（16384 字节），对于 objectMode 流是 16 个对象。

注意：highWaterMark 不是硬性上限，只是一个警戒线。缓冲区可以超过这个值，只是超过后会发出信号让上游暂停。

### pipe() 如何自动处理背压？

\`pipe()\` 方法之所以好用，就是因为它**自动处理了背压**。它的内部逻辑大致是这样的：

\`\`\`js
// pipe 的简化实现原理
readable.on('data', (chunk) => {
  // 如果 write 返回 false，说明可写流缓冲区满了
  if (!writable.write(chunk)) {
    readable.pause(); // 暂停可读流，不再触发 data 事件
  }
});

// 当可写流缓冲区排空了，触发 drain 事件
writable.on('drain', () => {
  readable.resume(); // 恢复可读流，继续读取
});
\`\`\`

看到了吗？pipe 的核心就是这两步：
1. 当 \`write()\` 返回 false，调用 \`readable.pause()\` 暂停生产
2. 当可写流触发 \`drain\` 事件（缓冲区数据都写入底层了），调用 \`readable.resume()\` 恢复生产

这样就形成了一个完美的流量控制机制：下游快就多给点，下游慢就少给点，永远不会让数据积压太多。这就是流处理大文件不占内存的秘密！

### drain 事件

\`drain\` 事件是背压机制的另一半。当你调用 \`writable.write()\` 返回 false 后，当缓冲区里的数据都被真正写入底层、缓冲区再次"空"了的时候，就会触发 \`drain\` 事件，告诉你"我又准备好了，可以继续写了"。

如果你在手动处理流（不用 pipe），**必须**监听 drain 事件并在此时恢复写入，否则数据可能丢失或卡住。

---

## 为什么流可以处理大文件不占内存？

综合以上分析，流能高效处理大文件的原因有三点：

1. **分块处理**：数据被分成小块（默认 16KB），每次只处理一块，内存中永远只有一个或几个 chunk，而不是整个文件。

2. **背压机制**：通过 highWaterMark + pause/resume + drain 形成流量闭环，生产速度自动匹配消费速度，缓冲区永远不会无限增长。

3. **惰性读取**：Readable 流只有在数据被消费时才会从底层读取更多数据，不会提前把整个文件读进来。

对比一下：
- \`fs.readFile\`：把整个文件读入内存 → 内存占用 = 文件大小
- \`fs.createReadStream\`：每次读 16KB 到缓冲区 → 内存占用 ≈ 几十 KB（常数级）

无论文件是 1MB 还是 10GB，流处理的内存占用基本稳定。这就是流的威力。

---

## 流的事件全览

### Readable 流事件
- \`data\`：收到一块数据（Flowing 模式）
- \`end\`：数据读完，没有更多数据了
- \`error\`：读取出错
- \`close\`：流被关闭
- \`readable\`：有数据可读了（Paused 模式）
- \`pause\`：流被暂停
- \`resume\`：流被恢复

### Writable 流事件
- \`drain\`：缓冲区排空，可以继续写入
- \`finish\`：所有数据已写入底层（调用 end() 之后）
- \`error\`：写入出错
- \`close\`：流被关闭
- \`pipe\`：有可读流 pipe 到这个可写流
- \`unpipe\`：有可读流 unpipe 了这个可写流

掌握这些事件和背压机制，你就掌握了 Node.js 流的基础。`,
    code: `const { Readable, Writable } = require('stream');

console.log('=== Stream 基础与背压演示 ===\\n');

// 1. 创建一个简单的自定义 Readable 流
// 模拟一个产生数据的数据源（比如从文件/网络读取）
class CounterReadable extends Readable {
  constructor(options = {}) {
    super(options);
    this.maxCount = options.maxCount || 10;
    this.current = 0;
    console.log(\`[Readable] 创建，将产生 \${this.maxCount} 个数据块\\n\`);
  }

  // _read 是 Readable 流必须实现的内部方法
  // 当流需要更多数据时会调用这个方法
  _read(size) {
    if (this.current >= this.maxCount) {
      console.log('[Readable] 数据生产完毕，push(null) 结束流');
      this.push(null); // push(null) 表示数据结束
      return;
    }

    this.current++;
    const chunk = Buffer.from(\`数据块 #\${this.current}\\n\`);
    console.log(\`[Readable] 生产第 \${this.current} 块数据，大小: \${chunk.length} 字节\`);
    
    // push 数据到内部缓冲区
    const canContinue = this.push(chunk);
    console.log(\`[Readable] push() 返回: \${canContinue} (\${canContinue ? '缓冲区还没满，继续生产' : '缓冲区满了，应该暂停'})\`);
  }
}

// 2. 创建一个慢速的 Writable 流（模拟消费慢的场景，触发背压）
class SlowWritable extends Writable {
  constructor(options = {}) {
    super(options);
    this.delay = options.delay || 100; // 每块数据处理延迟
    this.chunkCount = 0;
  }

  // _write 是 Writable 流必须实现的内部方法
  _write(chunk, encoding, callback) {
    this.chunkCount++;
    console.log(\`  [Writable] 开始消费第 \${this.chunkCount} 块，大小: \${chunk.length} 字节\`);
    
    // 模拟异步慢操作（比如写入磁盘、网络发送）
    setTimeout(() => {
      console.log(\`  [Writable] 第 \${this.chunkCount} 块消费完毕\`);
      callback(); // 必须调用 callback 表示处理完成
    }, this.delay);
  }
}

// 3. 演示1：不使用 pipe，手动处理数据（展示背压问题）
console.log('===== 演示1：手动处理数据（会触发背压）=====');

const manualReadable = new CounterReadable({ maxCount: 5, highWaterMark: 100 });
const manualWritable = new SlowWritable({ delay: 200, highWaterMark: 50 });

let manualPaused = false;

manualReadable.on('data', (chunk) => {
  console.log(\`\\n[data事件] 收到数据块，写入 Writable...\`);
  const canWrite = manualWritable.write(chunk);
  
  if (!canWrite && !manualPaused) {
    console.log('[背压警告] writable.write() 返回 false！缓冲区满了，暂停 readable');
    manualReadable.pause();
    manualPaused = true;
  }
});

manualWritable.on('drain', () => {
  console.log('[drain事件] Writable 缓冲区排空了，恢复 readable\\n');
  manualPaused = false;
  manualReadable.resume();
});

manualReadable.on('end', () => {
  console.log('\\n[Readable end] 所有数据生产完毕，调用 writable.end()');
  manualWritable.end();
});

manualWritable.on('finish', () => {
  console.log('[Writable finish] 所有数据消费完毕\\n');
  
  // 演示2：使用 pipe() 自动处理背压
  console.log('===== 演示2：使用 pipe() 自动处理背压 =====');
  console.log('pipe() 内部自动处理 pause/resume/drain，使用简单\\n');
  
  const pipedReadable = new CounterReadable({ maxCount: 5, highWaterMark: 100 });
  const pipedWritable = new SlowWritable({ delay: 100, highWaterMark: 50 });
  
  // 这一行就搞定了！自动处理背压
  pipedReadable.pipe(pipedWritable);
  
  pipedWritable.on('finish', () => {
    console.log('\\n[Pipe完成] 数据通过 pipe 自动传输完成！\\n');
    console.log('===== 总结 =====');
    console.log('1. Readable 是数据源，Writable 是目的地');
    console.log('2. 两种模式：flowing(data事件) vs paused(read()方法)');
    console.log('3. 背压：生产 > 消费时，write()返回false，需要pause');
    console.log('4. drain事件：缓冲区空了，可以resume继续');
    console.log('5. pipe() 自动背压处理，生产环境优先用pipe/pipeline');
  });
});
`
  },
  {
    id: "n2-transform-stream",
    title: "自定义 Transform 流与管道",
    icon: "🔧",
    group: "第二部分 核心模块与源码原理",
    content: `# 自定义 Transform 流与管道

在上一章我们学习了流的基础和背压原理，本章我们深入学习 Transform 转换流，以及如何用 pipeline 优雅地处理流的错误和组合多个流。

## Transform 流是什么？

Transform（转换）流是一种特殊的 Duplex（双工）流，它的输入和输出是**相关联**的——输入端收到数据，经过某种变换处理后，从输出端输出。就像一个加工车间：原材料从一端进去，加工后的产品从另一端出来。

和普通 Duplex 流的区别：
- Duplex 流的读和写是独立的，像电话线（双向独立通信）
- Transform 流的写决定了读，像过滤器（输入经过处理变成输出）

Node.js 内置了很多实用的 Transform 流：
- **zlib**：压缩/解压（Gzip、Deflate、Brotli）
- **crypto**：加密/解密（Cipher、Decipher、Hash）
- **JSON 解析/序列化**（可自己实现）

---

## Transform 流的核心方法

实现一个自定义 Transform 流，需要继承 \`stream.Transform\` 类，并实现两个关键方法：

### 1. _transform(chunk, encoding, callback)

这是 Transform 流的核心处理方法，**必须实现**。每收到一块数据就会调用一次。

参数：
- \`chunk\`：输入的数据块（Buffer 或字符串，取决于 decodeStrings 选项）
- \`encoding\`：如果 chunk 是字符串，这是编码；如果是 Buffer，这个值可以忽略
- \`callback(err, transformedChunk)\`：回调函数，处理完成后必须调用
  - 第一个参数是错误对象（成功则传 null）
  - 第二个参数是转换后的数据（可选，也可以用 this.push() 推送）

调用 callback 时，可以传入转换后的数据：
\`\`\`js
_transform(chunk, encoding, callback) {
  const transformed = chunk.toString().toUpperCase();
  callback(null, transformed); // 直接通过 callback 输出转换后的数据
}
\`\`\`

等价于：
\`\`\`js
_transform(chunk, encoding, callback) {
  const transformed = chunk.toString().toUpperCase();
  this.push(transformed); // 也可以用 push
  callback();
}
\`\`\`

### 2. _flush(callback)

这是一个**可选**方法，在所有数据块都被 _transform 处理完之后、流结束之前调用。用于处理一些"收尾工作"，比如：
- 压缩流在最后需要写入一些收尾字节
- 你可能缓存了一部分数据需要最后输出
- 计算完整数据的校验和等

参数：
- \`callback(err)\`：处理完后调用，可以push最后剩余的数据

举个例子：如果你实现一个"在数据末尾追加总结信息"的流，就需要在 _flush 中 push 总结内容。

---

## 常见 Transform 场景

### 场景1：数据转换/处理

最典型的就是修改/过滤流经的数据：
- 大小写转换
- 数据格式转换（CSV → JSON）
- 敏感信息脱敏（手机号打码）
- 文本替换

### 场景2：压缩/解压

zlib 模块提供的 Gzip、Deflate、Brotli 都是 Transform 流。它们把原始数据转成压缩数据，或者反向解压。为什么压缩是 Transform？因为压缩算法需要维护内部状态（比如 Huffman 树、滑动窗口），每块数据的压缩依赖之前的数据，最后还需要 _flush 写出收尾数据。

\`\`\`js
const zlib = require('zlib');
const fs = require('fs');

// 压缩：读文件 → gzip压缩 → 写压缩文件
fs.createReadStream('input.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('input.txt.gz'));

// 解压：读压缩文件 → gunzip解压 → 写解压文件
fs.createReadStream('input.txt.gz')
  .pipe(zlib.createGunzip())
  .pipe(fs.createWriteStream('output.txt'));
\`\`\`

### 场景3：加密/解密

crypto 模块的 Cipher（加密）和 Decipher（解密）也是 Transform 流。同样，加密算法是有状态的（比如 CBC 模式需要前一个密文块），所以必须是 Transform。

\`\`\`js
const crypto = require('crypto');
const key = crypto.randomBytes(32); // AES-256 需要32字节密钥
const iv = crypto.randomBytes(16);  // 初始化向量

const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
\`\`\`

### 场景4：数据分割/聚合

比如按行分割文本流、把小块数据聚合成更大的块。

一个经典问题：如果你用流读取文本文件，data 事件的 chunk 可能刚好把一个中文字符切成两半，导致乱码。这时候可以用 StringDecoder 或者一个"缓冲到换行符才输出"的 Transform 流来解决。

---

## pipe 的问题：错误处理

\`pipe()\` 虽然好用，方便且自动处理背压，但它有一个严重的问题：**错误处理很麻烦**。

看看如果链条中间某个流出错会发生什么：

\`\`\`js
readable
  .pipe(transform1)
  .pipe(transform2)
  .pipe(writable);

// 你需要给每个流单独监听 error！
readable.on('error', handleErr);
transform1.on('error', handleErr);
transform2.on('error', handleErr);
writable.on('error', handleErr);
\`\`\`

更糟糕的是：如果其中一个流出错，它会**销毁自己**，但不会自动销毁链条上的其他流。这可能导致：
- 资源泄漏（文件句柄没关闭）
- 内存泄漏（其他流还在等待数据）
- 进程挂住（部分流还在运行）

这是 pipe 在生产环境使用时最大的坑——错误不会沿着管道传播，你必须给每个流单独加 error 监听，出错时还要手动销毁所有流。

---

## stream.pipeline() 来救场

Node.js 10+ 提供了 \`stream.pipeline()\` 方法（在更早版本是 \`require('stream').pipeline\`，现在也可以从 \`stream/promises\` 导入 promisify 版本），它完美解决了 pipe 的错误处理问题。

### pipeline 的优势

1. **统一错误处理**：只要有一个流出错，pipeline 会把错误传给回调，并且自动销毁所有流
2. **自动清理资源**：出错或完成时，正确关闭所有流（包括文件句柄）
3. **回调/Promise 支持**：传统回调形式，或用 \`stream/promises.pipeline\` 得到 Promise 版本
4. **正确处理 finish/end**：等待所有数据真正写入底层才完成

### pipeline 基本用法

\`\`\`js
const { pipeline } = require('stream');
const fs = require('fs');
const zlib = require('zlib');

// 回调风格
pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('input.txt.gz'),
  (err) => {
    if (err) {
      console.error('管道出错:', err);
    } else {
      console.log('管道成功完成！');
    }
  }
);
\`\`\`

Promise 风格（Node.js 15+，或用 util.promisify）：

\`\`\`js
const { pipeline } = require('stream/promises');

async function compressFile() {
  try {
    await pipeline(
      fs.createReadStream('input.txt'),
      zlib.createGzip(),
      fs.createWriteStream('input.txt.gz')
    );
    console.log('压缩完成');
  } catch (err) {
    console.error('压缩失败:', err);
  }
}
\`\`\`

### pipe vs pipeline 对比

| 特性 | pipe() | pipeline() |
|------|--------|------------|
| 自动背压 | ✅ 是 | ✅ 是 |
| 错误传播 | ❌ 需要每个流单独监听 | ✅ 统一错误处理 |
| 自动销毁流 | ❌ 出错时不销毁其他流 | ✅ 自动销毁所有流 |
| 回调/Promise | ❌ 返回目标流，靠事件 | ✅ 支持回调和Promise |
| 链式调用 | ✅ 可以 .pipe().pipe() | ❌ 参数数组形式 |
| 生产环境推荐 | ❌ 错误处理麻烦 | ✅ 强烈推荐 |

> **生产环境最佳实践**：优先使用 pipeline（或其 Promise 版本），避免直接使用 pipe。pipe 适合快速演示和简单脚本，pipeline 才是生产级别的选择。

---

## Stream 组合：构建处理管道

流的强大之处在于**可组合性**——你可以把多个小的 Transform 像搭乐高一样串起来，形成复杂的数据处理管道。每个 Transform 只做一件事，单一职责，然后通过 pipeline 组合起来。

比如处理一个上传的日志文件流程：
\`\`\`
读取文件 → 解压(gzip) → 解码(文本) → 按行分割 → 过滤错误行 → 解析JSON → 写入数据库
\`\`\`

每个环节都是一个独立的 Transform 流，各司其职，可以单独测试和复用。

---

## objectMode：对象模式的流

默认情况下，流操作的是 Buffer 或字符串（二进制数据模式）。但有时我们希望流直接传递 JavaScript 对象，比如读取一个 JSON 数组，每个对象作为一块数据。这时候可以用 \`objectMode: true\`。

在 objectMode 下：
- highWaterMark 表示对象的数量（默认16），不是字节数
- chunk 可以是任意 JS 值（除了 null，null 表示结束）
- 常用于处理 JSON、数据库记录等结构化数据

\`\`\`js
const { Readable, Transform } = require('stream');

// 对象模式的可读流：直接输出JS对象
const objReadable = Readable.from([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
]);

// 对象模式的转换流：处理对象
const filterTransform = new Transform({
  objectMode: true,
  transform(obj, encoding, callback) {
    if (obj.id > 1) {
      callback(null, obj);
    } else {
      callback(); // 过滤掉，不push
    }
  }
});
\`\`\`

---

## 自定义 Transform 的注意事项

1. **不要忘记调用 callback**：_transform 和 _flush 都必须调用 callback，否则流会卡住。

2. **注意 this.push() 的返回值**：和普通 Writable 一样，如果 push 返回 false，表示下游缓冲区满了，应该等 drain 事件（但 Transform 通常不需要手动处理，因为管道机制会处理）。

3. **正确处理编码**：如果流没有设置 \`decodeStrings: false\`，chunk 会被转成 Buffer。如果你要处理字符串，记得转成 \`chunk.toString()\`。

4. **避免在 _transform 中做同步重 CPU 操作**：这会阻塞事件循环！CPU 密集操作要考虑用 worker_threads 或者分批处理。

5. **错误处理**：如果 _transform 中出错，调用 \`callback(err)\`，pipeline 会捕获这个错误并清理整个管道。

掌握 Transform 流和 pipeline，你就能优雅地处理任何流式数据处理场景了。`,
    code: `const { Transform, Writable, Readable, pipeline } = require('stream');
const zlib = require('zlib');

console.log('=== Transform 流与管道演示 ===\\n');

// ========== 1. 实现一个大写转换 Transform 流 ==========
class UpperCaseTransform extends Transform {
  constructor(options = {}) {
    super(options);
    this.totalChunks = 0;
  }

  _transform(chunk, encoding, callback) {
    this.totalChunks++;
    console.log(\`[UpperCaseTransform] 处理第 \${this.totalChunks} 块，原始大小: \${chunk.length} 字节\`);
    
    try {
      // 将 Buffer 转成字符串，转大写，再转回 Buffer
      const upperChunk = chunk.toString().toUpperCase();
      console.log(\`[UpperCaseTransform] 转换完成，内容预览: "\${upperChunk.slice(0, 30).trim()}..."\`);
      
      // 推送转换后的数据
      callback(null, upperChunk);
    } catch (err) {
      callback(err);
    }
  }

  _flush(callback) {
    console.log(\`[UpperCaseTransform] _flush 调用，共处理 \${this.totalChunks} 块，追加尾信息\`);
    // 在最后追加一行总结（_flush 的典型用法）
    this.push(\\n--- 大写转换完成，共处理 \${this.totalChunks} 个数据块 ---\\n\`);
    callback();
  }
}

// ========== 2. 实现一个按行分割的 Transform 流 ==========
// 解决 chunk 可能截断字符或行的问题
class LineSplitTransform extends Transform {
  constructor(options = {}) {
    super({ ...options, readableObjectMode: true }); // 输出端是对象模式（每行一个对象/字符串）
    this.remaining = ''; // 保存上一次没处理完的"半行"
    this.lineCount = 0;
  }

  _transform(chunk, encoding, callback) {
    // 将新收到的 chunk 和上次剩余的拼接起来
    const text = this.remaining + chunk.toString();
    const lines = text.split('\\n');
    
    // 最后一个元素可能是不完整的行，留到下次
    this.remaining = lines.pop() || '';
    
    // push 所有完整的行
    for (const line of lines) {
      if (line.length > 0) {
        this.lineCount++;
        this.push({ lineNumber: this.lineCount, content: line });
      }
    }
    
    callback();
  }

  _flush(callback) {
    // 处理最后剩余的内容
    if (this.remaining.length > 0) {
      this.lineCount++;
      this.push({ lineNumber: this.lineCount, content: this.remaining });
    }
    console.log(\`[LineSplitTransform] _flush，共分割 \${this.lineCount} 行\`);
    callback();
  }
}

// ========== 3. 创建测试数据的 Readable 流 ==========
function createTestReadable() {
  const testContent = [
    'hello world',
    'node.js stream is powerful',
    'transform streams are fun',
    'backpressure is important',
    'pipeline handles errors gracefully',
    'use zlib for compression',
  ];
  
  return Readable.from(testContent.map((line, i) => Buffer.from(line + '\\n')));
}

// ========== 4. 演示：使用 pipeline 连接多个流 ==========
console.log('===== 演示：pipeline 组合多个 Transform 流 =====\\n');

const source = createTestReadable();
const upperTransform = new UpperCaseTransform();
const lineSplit = new LineSplitTransform();

// 一个最终的 Writable 来消费结果（打印每行）
const resultWritable = new Writable({
  objectMode: true, // 因为 LineSplit 输出对象，所以这里也要 objectMode
  write(lineObj, encoding, callback) {
    console.log(\`  [输出] 第\${lineObj.lineNumber}行: \${lineObj.content}\`);
    // 模拟一点处理延迟
    setTimeout(callback, 20);
  }
});

console.log('启动 pipeline...\\n');

pipeline(
  source,
  upperTransform,
  lineSplit,
  resultWritable,
  (err) => {
    if (err) {
      console.error('Pipeline 出错:', err);
    } else {
      console.log('\\n✅ Pipeline 成功完成！\\n');
      
      // ========== 5. 演示 zlib 压缩 Transform ==========
      console.log('===== 演示：zlib 压缩/解压 Transform =====\\n');
      
      const originalData = Buffer.from('这是一段需要压缩的数据，看看压缩后能小多少！'.repeat(20));
      console.log(\`原始数据大小: \${originalData.length} 字节\`);
      
      const dataSource = Readable.from([originalData]);
      const gzip = zlib.createGzip();
      const gunzip = zlib.createGunzip();
      
      let compressedData = [];
      let decompressedData = [];
      
      const collectCompressed = new Writable({
        write(chunk, enc, cb) {
          compressedData.push(chunk);
          cb();
        }
      });
      
      const collectDecompressed = new Writable({
        write(chunk, enc, cb) {
          decompressedData.push(chunk);
          cb();
        }
      });
      
      // 先压缩
      pipeline(
        Readable.from([originalData]),
        gzip,
        collectCompressed,
        (err) => {
          if (err) {
            console.error('压缩失败:', err);
            return;
          }
          
          const compressed = Buffer.concat(compressedData);
          console.log(\`压缩后大小: \${compressed.length} 字节\`);
          console.log(\`压缩率: \${((compressed.length / originalData.length) * 100).toFixed(1)}%\`);
          console.log('');
          
          // 再解压回来验证
          pipeline(
            Readable.from([compressed]),
            gunzip,
            collectDecompressed,
            (err) => {
              if (err) {
                console.error('解压失败:', err);
                return;
              }
              
              const final = Buffer.concat(decompressedData);
              console.log(\`解压后大小: \${final.length} 字节\`);
              console.log(\`数据一致: \${final.equals(originalData)}\`);
              console.log('');
              console.log('===== 总结 =====');
              console.log('1. 自定义 Transform 需要实现 _transform()，可选 _flush()');
              console.log('2. _transform 中用 callback(null, data) 或 this.push(data) 输出');
              console.log('3. _flush 在流结束前调用，用于收尾/输出剩余数据');
              console.log('4. objectMode 用于传递 JS 对象而非 Buffer');
              console.log('5. pipe() 错误处理差，生产环境用 pipeline()！');
              console.log('6. pipeline 自动处理背压、错误传播、资源清理');
            }
          );
        }
      );
    }
  }
);
`
  },
  {
    id: "n2-buffer",
    title: "Buffer 二进制数据处理深度解析",
    icon: "📦",
    group: "第二部分 核心模块与源码原理",
    content: `# Buffer 二进制数据处理深度解析

在 JavaScript 诞生初期，它主要运行在浏览器中，处理的是文本、DOM 这些"友好"的数据。但 Node.js 作为服务端运行时，每天都要和文件、网络、数据库打交道——这些场景下，数据本质上都是**二进制**的。为了让 JavaScript 能高效处理二进制数据，Node.js 引入了 Buffer 类。

Buffer 是 Node.js 开发者每天都会接触到，但很多人理解不深的核心模块。本章我们深入 Buffer 的本质、内存机制和常见坑点。

## Buffer 的本质：Uint8Array 的子类

很多人以为 Buffer 是 Node.js 独创的数据结构，其实不是。从 Node.js 6.x 开始，**Buffer 是 JavaScript 标准 Uint8Array 类型的子类**（TypedArray 的一种）。也就是说：

\`\`\`js
const buf = Buffer.from('hello');
console.log(buf instanceof Uint8Array); // true
\`\`\`

Uint8Array 是什么？它是 ES6 引入的 TypedArray（类型化数组）的一种，表示一个**8位无符号整数数组**——数组中每个元素是 0-255 之间的整数（也就是一个字节）。Buffer 在此基础上做了扩展，添加了很多方便操作二进制数据的方法。

**Buffer 是一段固定长度的内存区域**。一旦创建，大小不能改变（和 Array 不同）。这一点很好理解：你申请了一块内存来存二进制数据，这块内存大小确定了，就像数组在分配内存后不能随意改长度一样。

理解"一个 Buffer 就是一串字节"这个本质很重要。每个字节是 0-255 的值，它本身不包含编码信息——编码只是你"解释"这些字节的方式。

---

## Buffer 与字符编码

字节只是数字，文字是怎么变成字节的？这就是字符编码在起作用。Buffer 支持多种字符编码，常用的有：

| 编码 | 说明 | 一个字符占多少字节 |
|------|------|-------------------|
| **utf8** | 默认编码，Unicode 的实现，支持所有语言 | 1-4 字节（英文1字节，中文3字节） |
| **base64** | 用64个可打印字符表示二进制，常用于邮件、URL传二进制 | 约1.33字节 → 每3字节二进制转4字符 |
| **hex** | 十六进制表示，每个字节用两个hex字符(0-9a-f) | 2字符表示1字节 |
| **latin1** (binary) | ISO-8859-1，单字节编码，0-255每个值对应一个字符 | 1字节 |
| **ascii** | 7位ASCII，仅支持0-127 | 1字节（仅用7位） |
| **ucs2/utf16le** | UTF-16小端，每个字符2字节 | 2字节 |

### 编码转换示例

\`\`\`js
const buf = Buffer.from('你好', 'utf8');
console.log(buf.length); // 6（每个中文3字节）
console.log(buf.toString('hex')); // e4bda0e5a5bd（hex编码的字符串）
console.log(buf.toString('base64')); // 5L2g5aW9（base64编码）
\`\`\`

**关键理解**：Buffer 里存的永远是字节（数字）。调用 \`toString(encoding)\` 时，是按照指定编码把这些字节"解码"成字符串；调用 \`Buffer.from(str, encoding)\` 时，是按照指定编码把字符串"编码"成字节。

常见坑：如果你用错误的编码去解码 Buffer，就会得到乱码。比如用 utf8 解码 gbk 编码的中文，或者用 ascii 解码中文。

---

## Buffer 的内存分配：8KB Slab 机制

这是 Buffer 最有意思、也最能体现 Node.js 性能优化的部分。Buffer 的内存分配策略是理解它性能的关键。

### Buffer.alloc(size) vs Buffer.allocUnsafe(size) vs Buffer.from(data)

这三种创建 Buffer 的方式有重要区别：

**1. Buffer.alloc(size)**
- 创建一个**初始化**的 Buffer，所有字节都填充为 0
- 安全，不会包含旧数据
- 相对慢一点（需要清零内存）

**2. Buffer.allocUnsafe(size)**
- 创建一个**未初始化**的 Buffer，内存里可能有旧的敏感数据
- 更快（省去清零步骤）
- **不安全**：如果不写满就直接 toString()，可能泄露之前内存里的数据
- 所以叫 Unsafe

**3. Buffer.from(data)**
- 从已有数据（字符串/数组/Buffer）创建 Buffer
- 数据会被拷贝到新的 Buffer
- 安全可靠，最常用

\`\`\`js
const buf1 = Buffer.alloc(10);          // <Buffer 00 00 00 00 00 00 00 00 00 00>
const buf2 = Buffer.allocUnsafe(10);    // <Buffer 48 65 6c 6c 6f ...> 可能有旧数据
const buf3 = Buffer.from('hello');      // <Buffer 68 65 6c 6c 6f>
\`\`\`

> **安全提示**：永远不要把 allocUnsafe 创建的 Buffer 在没有完全填充的情况下直接返回给用户或发送到网络，可能泄露内存中的敏感数据（密码、密钥等）。

### 8KB Slab 预分配池

为了提高性能，Node.js 对**小 Buffer**（小于 4KB，也就是 Buffer.poolSize/2，Buffer.poolSize 默认是 8192）采用了 slab 分配机制。

什么是 slab？你可以理解为 Node.js 事先向操作系统申请了一块 8KB 大小的内存（像一个"内存池"），当你创建小 Buffer 时，直接在这个池子里"切一块"给你，而不是每次都向操作系统申请新内存。这避免了频繁的系统调用和内存碎片。

工作机制大致是这样：

1. Node.js 内部维护一个 8KB 的 pool（slab），初始时是空的
2. 当你创建一个小于 4KB 的 Buffer 时：
   - 如果当前 pool 剩余空间够用，就在 pool 里分配，移动指针
   - 如果不够用，就把当前 pool 剩余部分浪费掉，新建一个 8KB pool，在新 pool 里分配
3. 大于 4KB 的 Buffer，直接向 C++ 层申请单独的内存块，不使用 pool

这个机制有个重要后果：**多个小 Buffer 可能共享同一块底层内存**。这本身没什么问题，但如果你用 \`buf.buffer\` 拿到底层 ArrayBuffer，可能会拿到比 buf 本身大很多的内存区域。

\`\`\`js
const smallBuf = Buffer.from('test');
console.log(smallBuf.length);         // 4（buf的长度）
console.log(smallBuf.buffer.byteLength); // 8192（底层slab是8KB！）
\`\`\`

这是一个常见坑：如果你把 \`buf.buffer\` 直接传给其他 API（比如创建 TypedArray），可能会意外泄露整个 slab 的数据。正确做法是使用 \`buf.byteOffset\` 和 \`buf.length\` 来切出正确的切片，或者用 \`buf.subarray()\`。

---

## Buffer 的拼接问题：中文乱码之谜

这是流处理中极其常见的坑。让我用一个典型场景说明：

你用流读取一个中文文本文件，data 事件每次给你一个 chunk（Buffer）。你可能想把所有 chunk 拼成一个完整的字符串：

\`\`\`js
// 错误的写法！可能导致乱码
let data = '';
readable.on('data', (chunk) => {
  data += chunk; // 隐式调用 chunk.toString()
});
readable.on('end', () => {
  console.log(data); // 可能有乱码！
});
\`\`\`

为什么会乱码？问题在于：**chunk 是按字节划分的，而 utf8 中文字符占 3 个字节**。如果 chunk 的边界刚好把一个中文字符从中间切开——比如前一个 chunk 末尾有某个字的前 1 个字节，后一个 chunk 开头有这个字的后 2 个字节——那么对每个 chunk 单独 toString() 时，那个被切断的字就解码失败，变成乱码字符（\`\`\`）。

举个例子：
- "你"的 utf8 编码是三个字节：0xe4 0xbd 0xa0
- 假设 chunk1 末尾是 [0x68, 0x69, 0xe4]（e4是"你"的第一个字节）
- chunk2 开头是 [0xbd, 0xa0, 0x77, 0x6f]（bd a0是"你"的后两个字节）
- 当你 chunk1.toString() 时，末尾那个单独的 0xe4 无法构成完整字符，变成
- chunk2.toString() 时，开头的 0xbd 0xa0 也无法解码，也变成
- 拼接后就是乱码

### 正确解法1：把所有 chunk 收集成数组，最后一次性 concat

\`\`\`js
const chunks = [];
readable.on('data', (chunk) => {
  chunks.push(chunk); // 只收集Buffer，不转字符串
});
readable.on('end', () => {
  const fullBuf = Buffer.concat(chunks); // 最后拼成一个大Buffer
  const data = fullBuf.toString(); // 一次性解码，不会有截断问题
  console.log(data);
});
\`\`\`

这个方法简单有效，因为 Buffer.concat 把所有字节拼在一起，形成完整的字节序列，再一次性解码，自然不会有字符被切断的问题。缺点是你要把所有数据收集完才能开始处理——如果你想边接收边处理（流处理），这个方法就不行了。

### 正确解法2：使用 StringDecoder

Node.js 内置了 \`string_decoder\` 模块，就是专门为了解决这个问题设计的。StringDecoder 会自动缓存不完整的多字节字符，等下一个 chunk 到了再拼接起来解码：

\`\`\`js
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');

let data = '';
readable.on('data', (chunk) => {
  data += decoder.write(chunk); // StringDecoder 会处理不完整的字符
});
readable.on('end', () => {
  data += decoder.end(); // 最后把剩余的也输出
  console.log(data);
});
\`\`\`

StringDecoder 的原理很简单：每次 write(chunk) 时，它检查末尾几个字节是否是完整字符——如果不是，就把那几个不完整的字节缓存起来，不输出。下次 write 时把新 chunk 拼在缓存后面，再解码。这样你得到的永远是完整的字符串，没有乱码。

### 正确解法3：用 Transform 流按行分割

就像我们在上一章实现的 LineSplitTransform，在流层面解决分割问题，确保输出的都是完整的数据单元。

---

## Buffer 常用方法

- **Buffer.from() / Buffer.alloc()**：创建 Buffer
- **buf.toString(encoding)**：按编码转字符串
- **buf.length**：字节长度
- **buf[index]**：访问/修改单个字节（0-255）
- **buf.slice(start, end)** / **buf.subarray(start, end)**：切片（注意：slice 在旧版本是引用，subarray 也是引用，不是拷贝！）
- **Buffer.concat(list[, totalLength])**：拼接多个 Buffer
- **buf.copy(target[, targetStart[, sourceStart[, sourceEnd]]])**：拷贝数据到另一个 Buffer
- **buf.compare(otherBuffer)**：比较两个 Buffer
- **buf.equals(otherBuffer)**：判断两个 Buffer 内容是否完全相同
- **buf.indexOf(value)**：查找字节或字符串的位置
- **buf.fill(value)**：填充指定值

> **重要**：buf.slice() 和 buf.subarray() 返回的新 Buffer **引用同一块内存**！修改切片会影响原 Buffer。如果需要拷贝，用 Buffer.from(buf) 或 buf.copy()。

理解 Buffer 的内存分配和拼接乱码问题，你在处理文件和网络数据时就能避开 90% 的坑。`,
    code: `const { StringDecoder } = require('string_decoder');

console.log('=== Buffer 二进制数据处理深度解析 ===\\n');

// ========== 1. Buffer 的本质与创建 ==========
console.log('===== 1. Buffer 的本质与创建方式 =====');

const bufFromString = Buffer.from('Hello, 世界!');
console.log(\`从字符串创建: "\${bufFromString.toString()}"\`);
console.log(\`Buffer 长度: \${bufFromString.length} 字节\`);
console.log(\`是否是 Uint8Array 实例: \${bufFromString instanceof Uint8Array}\`);
console.log('Buffer 内容 (hex):', bufFromString.toString('hex'));
console.log('Buffer 内容 (base64):', bufFromString.toString('base64'));
console.log('');

// alloc vs allocUnsafe
const allocBuf = Buffer.alloc(8);
const allocUnsafeBuf = Buffer.allocUnsafe(8);
console.log(\`Buffer.alloc(8):\`, allocBuf);
console.log(\`Buffer.allocUnsafe(8):\`, allocUnsafeBuf, '(可能包含旧内存数据)');
console.log('');

// ========== 2. 编码转换 ==========
console.log('===== 2. 字符编码演示 =====');

const chinese = '你好Node.js';
const utf8Buf = Buffer.from(chinese, 'utf8');
console.log(\`原文: "\${chinese}"\`);
console.log(\`utf8 编码: \${utf8Buf.length} 字节, hex: \${utf8Buf.toString('hex')}\`);
console.log(\`转 base64: \${utf8Buf.toString('base64')}\`);
console.log(\`转 hex: \${utf8Buf.toString('hex')}\`);
console.log(\`转 latin1: "\${utf8Buf.toString('latin1')}" (中文乱码，因为latin1是单字节)\`);

// 从 base64 解码回来
const decodedFromBase64 = Buffer.from(utf8Buf.toString('base64'), 'base64');
console.log(\`从base64解码回来: "\${decodedFromBase64.toString()}"\`);
console.log('');

// ========== 3. 演示乱码问题 ==========
console.log('===== 3. Buffer 拼接乱码问题演示 =====');

// 构造一个"你好"的utf8字节序列: e4 bd a0 e5 a5 bd
const nihao = Buffer.from('你好');
console.log(\`"你好"的utf8字节: \${nihao.toString('hex')} (共\${nihao.length}字节，每个中文3字节)\`);

// 模拟流把它切成两块：第一块拿前4个字节（切断了"好"字）
// "你"是e4bda0，"好"的第一个字节是e5
const chunk1 = nihao.slice(0, 4); // 包含完整的"你" + "好"的1个字节
const chunk2 = nihao.slice(4);    // "好"的剩余2个字节

console.log(\`模拟chunk1（前4字节）: \${chunk1.toString('hex')}\`);
console.log(\`模拟chunk2（后2字节）: \${chunk2.toString('hex')}\`);
console.log('');

// ❌ 错误做法：每个chunk单独toString再拼接
const badResult = chunk1.toString() + chunk2.toString();
console.log(\`❌ 逐块toString拼接结果: "\${badResult}" (出现乱码!)\`);

// ✅ 正确做法1：先收集所有Buffer，最后concat再toString
const goodResult1 = Buffer.concat([chunk1, chunk2]).toString();
console.log(\`✅ Buffer.concat一次性解码结果: "\${goodResult1}"\`);

// ✅ 正确做法2：用StringDecoder
const decoder = new StringDecoder('utf8');
const goodResult2 = decoder.write(chunk1) + decoder.write(chunk2) + decoder.end();
console.log(\`✅ StringDecoder处理结果: "\${goodResult2}"\`);
console.log('');

// ========== 4. Slab 内存池演示 ==========
console.log('===== 4. 8KB Slab 内存池机制 =====');

const smallBuf1 = Buffer.from('a');
const smallBuf2 = Buffer.from('bb');
console.log(\`小Buffer length: \${smallBuf1.length}, \${smallBuf2.length}\`);
console.log(\`小Buffer底层ArrayBuffer大小: \${smallBuf1.buffer.byteLength} 字节 (8KB slab池)\`);
console.log(\`注意: buf.buffer是整个slab，不只是这个buf的内容!\`);

const largeBuf = Buffer.alloc(10000);
console.log(\`大Buffer(>4KB)底层ArrayBuffer大小: \${largeBuf.buffer.byteLength} 字节 (直接单独分配)\`);
console.log('');

// ========== 5. Buffer 常用操作 ==========
console.log('===== 5. Buffer 常用方法 =====');

const buf = Buffer.from('Hello World');
console.log(\`原内容: "\${buf.toString()}"\`);
console.log(\`第0字节: \${buf[0]} ('H'的ASCII码是72)\`);
console.log(\`indexOf('World'): \${buf.indexOf('World')}\`);

// 切片 - 注意 subarray 是引用共享！
const slice = buf.subarray(0, 5);
console.log(\`subarray(0,5): "\${slice.toString()}"\`);
slice[0] = 0x68; // 'h'
console.log(\`修改slice后原buf也变了: "\${buf.toString()}" (因为共享内存!)\`);

// 拷贝 - 创建独立副本
const copy = Buffer.from(buf);
copy[0] = 0x48; // 'H'
console.log(\`用Buffer.from()拷贝后修改不影响原buf: "\${buf.toString()}" vs "\${copy.toString()}"\`);

// 比较与相等
const buf1 = Buffer.from('abc');
const buf2 = Buffer.from('abc');
const buf3 = Buffer.from('abd');
console.log(\`\\nbuf1.equals(buf2): \${buf1.equals(buf2)}\`);
console.log(\`buf1.equals(buf3): \${buf1.equals(buf3)}\`);
console.log(\`buf1.compare(buf3): \${buf1.compare(buf3)} (负数表示buf1 < buf3)\`);

console.log('\\n===== 总结 =====');
console.log('1. Buffer 是 Uint8Array 子类，本质是固定长度的字节序列');
console.log('2. 编码决定字节如何解释为字符：utf8(默认), base64, hex');
console.log('3. allocUnsafe 快但不安全（有旧数据），alloc 安全清零但慢');
console.log('4. 小Buffer共享8KB slab内存池，buf.buffer可能比buf大');
console.log('5. 流拼接乱码问题：用 Buffer.concat 或 StringDecoder');
console.log('6. subarray/slice 是引用共享，要独立副本用 Buffer.from()');
`
  },
  {
    id: "n2-module-system",
    title: "模块系统与 require 原理",
    icon: "📦",
    group: "第二部分 核心模块与源码原理",
    content: `# 模块系统与 require 原理

Node.js 的模块系统是其代码组织的基础。从你写第一行 Node.js 代码开始，你就在用 \`require()\` 和 \`module.exports\`，但你真的理解它们背后是怎么工作的吗？CommonJS 模块是怎样被加载、编译、执行、缓存的？循环引用为什么不会导致死循环？__dirname 从哪来？

本章我们深入 Node.js CommonJS 模块系统的底层原理。

## CommonJS 模块规范

Node.js 采用的是 CommonJS 模块规范（ES Modules 是后来才支持的）。CommonJS 的核心思想很简单：
- 每个文件是一个模块，有自己独立的作用域
- 使用 \`require()\` 引入其他模块
- 使用 \`module.exports\` 或 \`exports\` 导出接口
- 模块加载是同步的

这和浏览器端早期的 AMD（RequireJS）不同，因为服务端本地文件读取很快，同步加载完全可行。

---

## require 的完整加载过程

当你调用 \`require('./some-module')\` 时，Node.js 内部经历了一系列步骤。理解这个流程是掌握模块系统的关键。

整个流程可以分为 5 个阶段：
1. 路径解析（Resolution）
2. 文件定位（Loading）
3. 模块包装（Wrapping）
4. 编译执行（Compilation）
5. 缓存（Caching）

我们逐一拆解。

---

### 阶段1：路径解析

require 接受一个模块标识符（module identifier），首先要解析成绝对路径。Node.js 把模块分为三类：

| 模块类型 | 标识符示例 | 查找方式 |
|----------|-----------|----------|
| **核心模块** | \`require('fs')\`、\`require('path')\` | Node.js 内置，直接返回核心模块（优先级最高） |
| **文件模块** | \`require('./utils')\`、\`require('../config')\`、\`require('/absolute/path')\` | 按相对/绝对路径查找，然后找文件 |
| **第三方模块（node_modules）** | \`require('express')\`、\`require('lodash')\` | 从当前目录开始向上遍历 node_modules |

#### 核心模块
核心模块是 Node.js 源码编译时就打包进二进制文件的模块。它们的加载速度最快，而且永远不会被同名的第三方模块覆盖——即使你在 node_modules 里装了一个叫 'fs' 的包，\`require('fs')\` 还是会返回核心模块。

#### 路径模块（./ ../ /）
如果标识符以 \`./\`、\`../\` 或 \`/\` 开头，Node.js 会把它当作相对路径或绝对路径的文件模块。
- \`./\` 表示相对于当前文件所在目录
- \`../\` 表示上一级目录
- \`/\` 表示绝对路径

#### node_modules 查找算法
对于既不是核心、也不是路径开头的标识符，Node.js 会从当前文件所在目录开始，逐层向上查找 node_modules 文件夹：

\`\`\`
/home/user/project/node_modules/express  →  有吗？有就用
/home/user/node_modules/express           →  没有就往上
/home/node_modules/express                 →  还没有
/node_modules/express                      →  根目录，还没有就报错 MODULE_NOT_FOUND
\`\`\`

这个算法你应该很熟悉——这就是 Node.js 模块可以"就近"依赖的基础，也是为什么同一项目中可能有多个版本的同一个包存在于不同层级的 node_modules。

---

### 阶段2：文件定位

确定了目录后，Node.js 需要找出具体是哪个文件。它会按以下顺序尝试补全扩展名：

1. 先看路径本身是不是一个文件（比如 \`./utils\`，看有没有叫 utils 的文件）
2. 加 \`.js\` 扩展名：找 \`./utils.js\`
3. 加 \`.json\` 扩展名：找 \`./utils.json\`
4. 加 \`.node\` 扩展名：找 \`./utils.node\`（C++ 扩展模块）
5. 如果都不是，尝试把它当目录：
   - 看目录下有没有 \`package.json\`，取里面的 \`main\` 字段作为入口
   - 如果没有 package.json 或 main 字段，找 \`./index.js\`
   - 找 \`./index.json\`
   - 找 \`./index.node\`
6. 都找不到，抛出 \`MODULE_NOT_FOUND\` 错误

\`\`\`js
require('./utils'); 
// 尝试顺序：
// 1. ./utils (如果是文件就直接加载)
// 2. ./utils.js
// 3. ./utils.json
// 4. ./utils.node
// 5. ./utils/package.json → main 字段
// 6. ./utils/index.js
// 7. ./utils/index.json
// 8. ./utils/index.node
// 9. 报错
\`\`\`

你可以通过 \`require.extensions\` 看到所有支持的扩展名（虽然官方不推荐修改它）。

---

### 阶段3：模块包装（Module Wrapper）

找到文件后，Node.js 会**先读取文件内容，然后把它包裹在一个函数里面**！这是一个非常关键的机制，很多人不知道。

你写的模块代码：
\`\`\`js
// utils.js
const a = 1;
module.exports = { a };
\`\`\`

Node.js 在执行前，会把它包装成这样：

\`\`\`js
(function(exports, require, module, __filename, __dirname) {
  // 你的代码在这里！
  const a = 1;
  module.exports = { a };
});
\`\`\`

哦！这一下子就解释了很多谜团：

1. **为什么模块里的变量是私有的？** 因为你的代码在一个函数作用域里，顶层的 \`var/const/let\` 不会污染全局。
2. **\`exports\`、\`require\`、\`module\` 从哪来的？** 它们不是全局变量！是这个包装函数的参数。
3. **\`__filename\` 和 \`__dirname\` 从哪来？** 同样是包装函数的参数！\`__filename\` 是当前模块的绝对路径，\`__dirname\` 是所在目录。

这个包装函数就是 Node.js 模块系统的核心魔法。Node.js 在加载模块时，会把文件内容读出来，头尾拼上函数的开头和结尾，然后用 \`vm\` 模块编译这个函数。

你甚至可以在模块里打印 \`arguments\` 看到这五个参数：
\`\`\`js
console.log(arguments.length); // 5
console.log(arguments[0] === exports); // true
console.log(arguments[1] === require); // true
console.log(arguments[2] === module); // true
\`\`\`

---

### 阶段4：编译执行

包装函数创建好之后，Node.js 会调用这个函数，传入五个参数：
- \`exports\`：module.exports 的引用（初始是空对象）
- \`require\`：用来加载其他模块的函数
- \`module\`：当前模块自身的引用（Module 对象）
- \`__filename\`：当前文件的绝对路径
- \`__dirname\`：当前文件所在目录的绝对路径

函数执行后，\`module.exports\` 的值就是这个模块导出的内容。其他模块 require 这个模块时，拿到的就是 module.exports。

不同扩展名的编译方式不同：
- **.js**：用上述 wrapper 包装后执行
- **.json**：读取文件后用 \`JSON.parse()\` 解析，直接赋给 module.exports
- **.node**：C++ 扩展，用 \`process.dlopen()\` 加载

---

### 阶段5：模块缓存（require.cache）

这是另一个关键点：**模块在第一次被加载后会被缓存**。也就是说，不管你 \`require()\` 同一个模块多少次，拿到的都是**同一个实例**，模块顶层代码只会执行一次。

\`\`\`js
// a.js
console.log('a.js 被执行了');
module.exports = { value: Math.random() };

// b.js
const a1 = require('./a');
const a2 = require('./a');
console.log(a1 === a2); // true！同一个对象
console.log(a1.value === a2.value); // true！Math.random()只执行了一次
\`\`\`

控制台只会打印一次 "a.js 被执行了"，因为第二次 require 直接从缓存拿，不会重新执行模块代码。

缓存存在哪里？存在 \`require.cache\` 对象里，key 是模块的绝对路径，value 是模块对象。你甚至可以手动操作缓存：

\`\`\`js
console.log(require.cache); // 所有已缓存的模块
delete require.cache[require.resolve('./a')]; // 从缓存删除，下次require会重新执行
const a3 = require('./a'); // 这次会重新执行a.js的代码
\`\`\`

缓存机制有两个重要影响：
1. **单例模式**：模块天然是单例的，所有地方 require 同一个模块拿到同一个对象。这对状态共享很有用，但也要小心意外的状态污染。
2. **循环引用可以被处理**：缓存让循环引用不会导致无限递归。

---

## exports vs module.exports 的区别

这是经典面试题：exports 和 module.exports 有什么区别？

记住一句话：**exports 只是 module.exports 的一个引用（初始时指向同一个对象），真正导出的是 module.exports**。

包装函数的参数是这样传入的（伪代码）：
\`\`\`js
const module = { exports: {} };
const exports = module.exports; // exports 指向同一个对象
// 执行你的模块代码...
// 函数执行后，返回 module.exports
\`\`\`

这意味着什么？

**情况1：给 exports 添加属性**（没问题）
\`\`\`js
exports.name = 'test';
exports.sayHi = function() {};
// module.exports 现在是 { name: 'test', sayHi: [Function] }
// ✅ 有效，因为 exports 和 module.exports 引用同一对象，你在给这个对象加属性
\`\`\`

**情况2：直接给 exports 赋值**（不生效！）
\`\`\`js
exports = { name: 'test' };
// ❌ 无效！你只是让 exports 这个变量指向了一个新对象，
// module.exports 仍然是原来的空对象！
\`\`\`

这就是为什么直接给 exports 赋值不会生效——你改变了局部变量 exports 的指向，但 module.exports 没动。

**情况3：给 module.exports 赋值**（正确）
\`\`\`js
module.exports = { name: 'test' };
// ✅ 有效，直接修改了 module.exports
\`\`\`

**最佳实践**：要么一直用 \`exports.xxx = ...\` 加属性，要么直接 \`module.exports = ...\` 整体导出，不要混着用，容易出问题。

---

## 循环引用的处理策略

循环引用（circular dependency）是指 A require B，同时 B require A。这在复杂项目中偶尔会出现。Node.js 如何处理而不会死循环？

答案还是**缓存**。我们看一个官方例子的变形：

\`\`\`js
// a.js
console.log('a 开始执行');
exports.done = false;
const b = require('./b.js'); // 这里加载b
console.log('在 a 中，b.done =', b.done);
exports.done = true;
console.log('a 执行完毕');

// b.js
console.log('b 开始执行');
exports.done = false;
const a = require('./a.js'); // 这里尝试加载a，但a还没执行完！
console.log('在 b 中，a.done =', a.done);
exports.done = true;
console.log('b 执行完毕');

// main.js
console.log('main 开始');
const a = require('./a.js');
const b = require('./b.js');
console.log('main 中，a.done =', a.done, 'b.done =', b.done);
\`\`\`

执行结果是什么？

\`\`\`
main 开始
a 开始执行
b 开始执行
在 b 中，a.done = false  ← 注意这里！b拿到的a是"未完成"的
b 执行完毕
在 a 中，b.done = true
a 执行完毕
main 中，a.done = true b.done = true
\`\`\`

关键在 \`在 b 中，a.done = false\`。为什么？因为当 b.js 执行到 \`require('./a.js')\` 时，a.js 还在执行中（它正在等待 b.js 加载完）。Node.js 发现 a.js 已经在缓存里了（虽然还没执行完），就直接把 a.js 当前**已执行部分**的 exports 对象（也就是 \`{ done: false }\`）返回给 b。

循环引用的处理策略是：**返回当前缓存中模块的 exports 对象（未完成版），而不是无限等待它执行完**。

这带来一个重要问题：如果你在模块顶层依赖另一个模块导出的值，而这个模块又反过来依赖你，你可能拿到一个不完整的 exports 对象。

如何避免循环引用的问题？
1. 架构层面尽量避免循环依赖，梳理模块关系
2. 如果无法避免，不要在模块顶层就使用对方模块的导出值，而是在函数内部再 require（延迟加载），确保两个模块都初始化完成后再调用
3. 导出的东西尽量放在 module.exports 上，并且在 require 其他模块之前就把需要导出的结构先挂好

---

## Module 对象的结构

每个模块内部的 \`module\` 对象长这样（关键属性）：

\`\`\`js
Module {
  id: '.',                    // 模块id，通常是绝对路径
  path: '/path/to/dir',       // 模块所在目录
  exports: {},                // 真正导出的东西
  filename: '/path/to/file.js', // 文件绝对路径，就是__filename
  loaded: false,              // 是否加载完成
  children: [Module],         // 这个模块require的其他模块
  paths: [/* node_modules 搜索路径 */],
  parent: Module | null       // 第一个require这个模块的模块
}
\`\`\`

注意：module.loaded 在模块完全执行完之前都是 false。这就是循环引用时能拿到"半成品"的原因——b 拿到 a 时，a.loaded 还是 false。

---

## require 的其他实用属性和方法

- **require.resolve(moduleName)**：解析模块路径，但不加载。返回模块的绝对路径（用来找位置、删缓存很有用）。
- **require.cache**：模块缓存对象，前面说过了。
- **require.main**：Node.js 进程直接运行的入口模块。可以用 \`require.main === module\` 判断当前文件是不是直接运行的入口（类似 Python 的 \`if __name__ === '__main__'\`）。

\`\`\`js
// 判断是否是主模块
if (require.main === module) {
  console.log('这个文件是直接运行的');
} else {
  console.log('这个文件是被其他模块 require 的');
}
\`\`\`

理解 CommonJS 模块的这些底层原理，你写 Node.js 代码时就会更有底气，遇到模块相关的问题也能快速定位。`,
    code: `console.log('=== 模块系统与 require 原理 ===\\n');

// ========== 注意：不能真的 require 外部文件，我们用代码模拟整个模块机制 ==========
console.log('===== 模拟 Module 包装函数与执行 =====\\n');

// 1. 模拟 Node.js 的 Module 对象和 require 机制
class Module {
  static cache = {};
  
  constructor(id, filename) {
    this.id = id;
    this.filename = filename;
    this.dirname = filename.substring(0, filename.lastIndexOf('/'));
    this.exports = {};
    this.loaded = false;
  }

  // 模拟 require：模块包装 + 缓存 + 执行
  static require(requestingModule, moduleId, fakeFileSystem) {
    // 简化的路径解析
    const filename = Module._resolveFilename(requestingModule, moduleId);
    console.log(\`[require] 尝试加载: \${moduleId} → 解析为: \${filename}\`);
    
    // 检查缓存！
    if (Module.cache[filename]) {
      console.log(\`[require] 缓存命中: \${filename}，直接返回 exports (loaded=\${Module.cache[filename].loaded})\`);
      return Module.cache[filename].exports;
    }
    
    // 创建新模块实例，先放入缓存（重要！为了处理循环引用）
    const mod = new Module(moduleId, filename);
    Module.cache[filename] = mod;
    console.log(\`[require] 缓存未命中，创建新模块并放入缓存\`);
    
    // 获取"文件内容"（我们的假文件系统里的函数）
    const moduleFactory = fakeFileSystem[filename];
    if (!moduleFactory) {
      throw new Error(\`Cannot find module '\${moduleId}'\`);
    }
    
    // 关键：调用包装函数！传入 exports, require, module, __filename, __dirname
    const dirname = mod.dirname;
    const requireFn = (id) => Module.require(mod, id, fakeFileSystem);
    
    console.log(\`[require] 执行模块包装函数，传入 (exports, require, module, __filename, __dirname)\`);
    moduleFactory.call(mod.exports, mod.exports, requireFn, mod, mod.filename, dirname);
    
    // 标记加载完成
    mod.loaded = true;
    console.log(\`[require] 模块 \${filename} 执行完毕，module.exports 已缓存\`);
    
    return mod.exports;
  }
  
  static _resolveFilename(requestingModule, moduleId) {
    if (moduleId.startsWith('./')) {
      const base = requestingModule ? requestingModule.dirname : '/app';
      return base + '/' + moduleId.substring(2);
    }
    return '/app/node_modules/' + moduleId;
  }
}

// ========== 创建我们的模拟文件系统 ==========
// 每个"文件"就是包装好后的模块函数
const fakeFileSystem = {};

// a.js - 模拟循环引用场景
fakeFileSystem['/app/a.js'] = function(exports, require, module, __filename, __dirname) {
  console.log('  [a.js] 开始执行');
  exports.done = false;
  exports.fromA = '我是A导出的值';
  
  console.log('  [a.js] 准备 require(b.js)...');
  const b = require('./b.js'); // 这里会加载b
  console.log('  [a.js] 从 require(b) 返回了，b.done =', b.done);
  
  exports.done = true;
  console.log('  [a.js] 执行完毕');
};

// b.js - 循环引用a
fakeFileSystem['/app/b.js'] = function(exports, require, module, __filename, __dirname) {
  console.log('    [b.js] 开始执行');
  exports.done = false;
  exports.fromB = '我是B导出的值';
  
  console.log('    [b.js] 准备 require(a.js)...');
  const a = require('./a.js'); // 尝试加载a，但a还没执行完！
  console.log('    [b.js] 从 require(a) 返回了，a.done =', a.done, '(拿到的是半成品！)');
  console.log('    [b.js] 此时能拿到 a.fromA:', a.fromA);
  
  exports.done = true;
  console.log('    [b.js] 执行完毕');
};

// main.js - 入口
fakeFileSystem['/app/main.js'] = function(exports, require, module, __filename, __dirname) {
  console.log('[main.js] 程序入口开始执行\\n');
  
  const a = require('./a.js');
  console.log('\\n[main.js] 第一次 require(a) 完成，a.done =', a.done);
  
  const b = require('./b.js');
  console.log('[main.js] require(b) 完成，b.done =', b.done);
  
  console.log('\\n[main.js] 再次 require(a)，验证缓存...');
  const a2 = require('./a.js');
  console.log('[main.js] a === a2:', a === a2, '(缓存生效，同一个对象)');
};

// 运行入口模块
console.log('===== 执行 main.js，演示循环引用与缓存 =====\\n');
try {
  Module.require(null, './main.js', fakeFileSystem);
} catch (e) {
  console.error('错误:', e.message);
}

// 2. 演示 exports vs module.exports 区别
console.log('\\n===== 演示 exports vs module.exports 区别 =====\\n');

// 模拟一个 exports.xxx 方式（正确）
const mod1 = { exports: {} };
const exports1 = mod1.exports;
exports1.name = '通过 exports 导出';
exports1.value = 123;
console.log('方式1: exports.xxx 添加属性');
console.log('  执行后 module.exports:', mod1.exports);

// 模拟直接给 exports 赋值（错误！）
const mod2 = { exports: {} };
let exports2 = mod2.exports;
exports2 = { name: '直接赋值给 exports', value: 456 }; // 改变了局部变量
console.log('\\n方式2: 直接 exports = {} 赋值（错误）');
console.log('  执行后 module.exports:', mod2.exports, '(空对象！因为 exports 是局部变量)');

// 模拟 module.exports = xxx（正确）
const mod3 = { exports: {} };
const exports3 = mod3.exports;
mod3.exports = { name: '直接赋值给 module.exports', value: 789 };
console.log('\\n方式3: module.exports = {} 整体导出（正确）');
console.log('  执行后 module.exports:', mod3.exports);

// 3. 演示 require.main === module 判断入口
console.log('\\n===== 演示 require.main === module 判断入口 =====');
const isMain = true; // 在本沙箱中我们直接运行，所以是true
console.log('require.main === module:', isMain);
console.log('这是模块判断自己是否是直接运行的入口的标准方式');
console.log('');

// 4. 真实查看当前模块的 module 对象信息（沙箱中实际存在的）
console.log('===== 当前模块实际信息 =====');
console.log('__filename 不存在于沙箱顶层（因为我们不是真正被require的模块）');
console.log('但我们可以看到在真实 Node.js 中:');
console.log('  - arguments.length 在模块中是5（wrapper的5个参数）');
console.log('  - require.cache 存在，包含所有已加载模块');
console.log('  - module 对象包含 exports, loaded, children, parent 等属性');

console.log('\\n===== 总结 =====');
console.log('1. require 过程：路径解析 → 文件定位 → 模块包装 → 编译执行 → 缓存');
console.log('2. 你的代码被包装在函数 (exports, require, module, __filename, __dirname) 里');
console.log('3. __dirname 和 __filename 不是全局变量，是包装函数参数');
console.log('4. 模块加载后缓存，多次require同一模块拿到同一个对象');
console.log('5. exports 是 module.exports 的引用，直接给exports赋值无效');
console.log('6. 循环引用时，返回模块当前已执行部分的exports（半成品）');
console.log('7. require.main === module 判断是否是入口文件');
`
  },
  {
    id: "n2-path-module",
    title: "path 模块与路径处理最佳实践",
    icon: "🛤️",
    group: "第二部分 核心模块与源码原理",
    content: `# path 模块与路径处理最佳实践

处理文件路径是每个 Node.js 程序几乎必做的事情。你可能会说："路径不就是字符串拼接吗？有什么难的？"——错了，路径处理是跨平台开发中最容易踩坑的地方之一。Windows 和 POSIX（Linux/macOS）的路径分隔符不同、根目录表示不同、路径解析规则也有差异。自己手动拼路径，迟早会出 bug。

Node.js 内置的 \`path\` 模块就是专门来解决这些问题的。本章我们学习 path 模块的核心 API，以及一个最常见的面试题/坑点：\`path.join\` 和 \`path.resolve\` 到底有什么区别？

## 为什么不能自己拼接路径？

先看几个手动拼接路径可能出问题的场景：

\`\`\`js
// 问题1：分隔符跨平台不一致
const filePath = dir + '\\\\' + file; // Windows 用 \\ 
const filePath = dir + '/' + file;   // Linux/macOS 用 /
// 你怎么知道代码运行在哪个平台？

// 问题2：多出来的斜杠
const base = '/home/user/';
const file = 'data.txt';
base + file; // '/home/user//data.txt' 双斜杠，虽然大多数系统能容忍，但不规范

// 问题3：.. 和 . 处理
const path = '/home/user/project/../data.txt';
// 期望是 /home/user/data.txt，但你手动处理要写代码解析

// 问题4：Windows盘符
'C:\\\\Users\\\\' + 'name'; // Windows有盘符，逻辑不同
\`\`\`

\`path\` 模块帮你处理所有这些问题：统一处理不同平台分隔符、规范化多余斜杠、解析相对路径、处理 Windows 盘符。它是你操作路径的唯一正确选择。

---

## 跨平台：path.win32 vs path.posix

一个很重要但很多人不知道的点：path 模块的默认行为**取决于运行的操作系统**。也就是说，在 Windows 上 \`path.join()\` 按 Windows 规则（反斜杠分隔）工作，在 Linux/macOS 上按 POSIX 规则（正斜杠分隔）工作。

大多数时候这正是你想要的——在哪个平台就用哪个平台的路径规则。但有时候你需要**明确**处理某一种格式的路径（比如你在 Linux 上生成 Windows 路径，或者处理从其他系统传来的路径），这时候就需要：

- \`path.win32\`：强制使用 Windows 路径规则
- \`path.posix\`：强制使用 POSIX 路径规则

这两个对象上有和 \`path\` 完全一样的方法（join、resolve、basename 等），只是规则固定是 Windows 或 POSIX 的。

\`\`\`js
const path = require('path');

// 在 Linux/macOS 上：
path.join('a', 'b');     // 'a/b'
path.win32.join('a', 'b'); // 'a\\\\b'（强制Windows分隔符）
path.posix.join('a', 'b'); // 'a/b'

// path.sep：当前平台的路径分隔符
console.log(path.sep); // macOS/Linux: '/', Windows: '\\\\'

// path.delimiter：路径分隔符（PATH环境变量里的分隔符）
console.log(path.delimiter); // POSIX: ':', Windows: ';'
\`\`\`

经验法则：
- 如果你处理的是**本地文件系统的路径**（读写本地文件），直接用默认的 \`path\`
- 如果你处理的是**跨平台传输的路径**（比如 URL 路径、配置文件中的路径、zip包内路径），通常用 \`path.posix\`

---

## path.join([...paths]) vs path.resolve([...paths])

这是最容易搞混、面试最爱问的一组 API。我们直接说结论，再用例子说明。

### path.join()：路径拼接

\`path.join()\` 的作用很单纯：**把所有路径片段用平台特定分隔符连接起来，然后规范化结果**。

它的行为：
1. 用分隔符把所有参数拼在一起
2. 把路径中多余的斜杠去掉
3. 解析 \`..\`（上一级）和 \`.\`（当前目录）
4. **返回的结果是相对还是绝对，取决于输入是否有绝对路径开头**

它就像你在终端里 \`cd\` 时的路径拼接——只是把路径段拼起来，不考虑"当前工作目录"。

### path.resolve()：路径解析成绝对路径

\`path.resolve()\` 的作用是：**把路径序列解析成一个绝对路径**。它模拟了 cd 命令的行为：从左到右依次处理每个路径段，最后生成一个绝对路径。

它的行为：
1. 从左到右处理每个参数，像依次执行 \`cd\`
2. 如果处理完所有参数后还不是绝对路径，就**加上当前工作目录（cwd）**
3. 结果路径是规范化的（没有多余斜杠，.. 和 . 都被解析）
4. **返回的一定是绝对路径**（除非是空参，返回 cwd）
5. 如果某个参数是绝对路径（以 / 开头或盘符开头），之前的所有参数会被忽略

我们用一系列对比示例来理解：

\`\`\`js
const path = require('path');

// 示例1：普通拼接
path.join('a', 'b', 'c');       // 'a/b/c'（相对路径，只是拼接）
path.resolve('a', 'b', 'c');    // '/当前工作目录/a/b/c'（变成绝对路径！因为输入都是相对的）

// 示例2：有..
path.join('a', 'b', '..', 'c'); // 'a/c'（规范化了..）
path.resolve('a', 'b', '..', 'c'); // '/cwd/a/c'（同样处理..，但最终是绝对的）

// 示例3：遇到绝对路径
path.join('a', '/b', 'c');      // '/b/c'（/b是绝对路径，join仍然拼，但/a/b中的/a被覆盖？）
                               // 实际：join的结果是 'a/b/c'，join对绝对路径开头的处理和resolve不同！
path.resolve('a', '/b', 'c');   // '/b/c'（/b是绝对路径，前面的a被丢弃！像cd /b）

// 示例4：__dirname 的常见用法
path.join(__dirname, 'views', 'index.html');  // 拼出当前文件下的views/index.html
path.resolve(__dirname, 'views', 'index.html'); // 同样结果！因为__dirname本身是绝对路径
\`\`\`

等一下，这里有个关键点：**当第一个参数（或中间某个参数）是绝对路径时，join 和 resolve 的行为不同**。

\`path.resolve\` 遇到一个绝对路径（以 / 开头），就像 \`cd\` 到那个绝对路径，**之前的路径全部丢弃**。这很像命令行里的行为：\`cd a\` 然后 \`cd /b\`，你最终在 \`/b\`，而不是 \`/a/b\`。

\`path.join\` 则是简单拼接，不会因为遇到 / 开头就丢弃前面的（除了第一个如果带 / 会保留根）。不对，实际测试：
- \`path.join('a', '/b', 'c')\` 在 POSIX 下结果是 \`a/b/c\`（/b 的 / 被当成分隔符处理了）
- \`path.resolve('a', '/b', 'c')\` 结果是 \`/b/c\`（/b 是绝对路径，重置了起点）

### 一句话区分

- **join 就是简单拼接+规范化，返回什么路径（相对/绝对）由输入决定**
- **resolve 一定返回绝对路径，模拟 cd 的行为，遇到绝对路径会重置**
- **和 __dirname 搭配使用，两者效果相同**（因为 __dirname 本身是绝对路径，resolve 不会再额外加 cwd）

### 什么时候用哪个？

| 场景 | 推荐 |
|------|------|
| 拼接已知目录下的子文件/子目录 | join 或 resolve + __dirname |
| 你需要最终一定得到绝对路径 | resolve |
| 你想保留相对路径结果 | join |
| 处理用户传入的路径，要解析成绝对路径 | resolve（比如用户给的相对路径要基于cwd找文件） |
| URL 路径拼接 | posix.join（因为 URL 总是 / 分隔） |

---

## path.normalize(path)

normalize 用于规范化一个路径字符串，处理：
- 多余的斜杠（\`//\` → \`/\`）
- 路径中的 \`.\`（当前目录）
- 路径中的 \`..\`（上一级）
- 末尾的斜杠保留

\`\`\`js
path.normalize('/foo/bar//baz/asdf/quux/..'); // '/foo/bar/baz/asdf'
path.normalize('a/./b/../c/d'); // 'a/c/d'
\`\`\`

其实 join 和 resolve 内部都会调用 normalize，所以你通常不需要手动调 normalize，除非你只需要规范化而不做拼接。

---

## path.basename(path[, ext])

返回路径的最后一部分（文件名部分），可选地去掉扩展名。

\`\`\`js
path.basename('/foo/bar/baz.txt');          // 'baz.txt'
path.basename('/foo/bar/baz.txt', '.txt');  // 'baz'
path.basename('/foo/bar/baz.txt', '.html'); // 'baz.txt'（扩展名不匹配就不去掉）
path.basename('/foo/bar/');                 // 'bar'（末尾斜杠会被忽略）
\`\`\`

## path.dirname(path)

返回路径的目录部分（和 basename 互补）。

\`\`\`js
path.dirname('/foo/bar/baz.txt'); // '/foo/bar'
path.dirname('/foo/bar/');         // '/foo'
path.dirname('baz.txt');           // '.'（当前目录）
\`\`\`

## path.extname(path)

返回路径的扩展名（最后一个 . 到结尾），如果没有扩展名返回空字符串。

\`\`\`js
path.extname('index.html');    // '.html'
path.extname('index.coffee.md'); // '.md'（最后一个点）
path.extname('index.');        // '.'（点在最后）
path.extname('index');         // ''（没有点）
path.extname('.gitignore');    // ''（点在开头不算扩展名！）
\`\`\`

注意：\`.gitignore\` 这种点开头的"隐藏文件"，extname 返回空字符串，因为点是第一个字符。

---

## path.parse(path) 和 path.format(pathObject)

这两个是互逆操作，用于把路径拆解成组成部分，或者从各部分拼成路径。

\`path.parse()\` 返回一个对象，包含：
- **root**：根目录（如 \`/\` 或 \`C:\\\\\`）
- **dir**：目录部分（= dirname，包含 root）
- **base**：完整文件名（= basename，name + ext）
- **name**：文件名（不含扩展名）
- **ext**：扩展名（含点）

\`\`\`js
path.parse('/home/user/file.txt');
// {
//   root: '/',
//   dir: '/home/user',
//   base: 'file.txt',
//   name: 'file',
//   ext: '.txt'
// }
\`\`\`

Windows 示例：
\`\`\`js
path.win32.parse('C:\\\\Users\\\\name\\\\doc.pdf');
// { root: 'C:\\\\', dir: 'C:\\\\Users\\\\name', base: 'doc.pdf', name: 'doc', ext: '.pdf' }
\`\`\`

\`path.format()\` 则是反过来，从一个对象构建路径字符串。

---

## path.isAbsolute(path)

判断路径是否是绝对路径。

\`\`\`js
path.isAbsolute('/foo/bar');  // true（POSIX）
path.isAbsolute('foo/bar');   // false
path.win32.isAbsolute('C:\\\\foo'); // true（Windows）
path.win32.isAbsolute('\\\\server\\\\share'); // true（UNC路径）
\`\`\`

## path.relative(from, to)

返回从 from 到 to 的**相对路径**。如果两个路径分别在不同根（比如不同盘符），返回 to 本身。

\`\`\`js
path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb');
// '../../impl/bbb'
\`\`\`

这个在生成相对路径链接、import 路径时很有用。

---

## 路径处理最佳实践

1. **永远用 path 模块拼接路径**，永远不要写 \`dir + '/' + file\`。
2. **拼接用户路径或需要绝对路径时用 path.resolve**。
3. **基于 __dirname 拼路径，join 或 resolve 都可以**，习惯用法是 \`path.join(__dirname, '..', 'config')\`。
4. **处理 URL 路径（不是文件路径）用 path.posix**，因为 URL 永远是 / 分隔。
5. **跨平台生成路径时考虑目标平台**，不要假设分隔符是 /。
6. **不要硬编码 \`/\` 或 \`\\\\\`**，用 \`path.sep\` 获取当前平台分隔符。
7. **用 path.basename/dirname/extname/parse 拆解路径**，不要自己写正则分割字符串。
8. **注意 path.basename 在 Windows 上处理 POSIX 路径的坑**——如果路径是 / 分隔但在 Windows 上运行，可能结果不对，这种场景用 path.posix.basename。

掌握 path 模块的这些 API 和区别，你的代码在跨平台时就不会出路径问题了。`,
    code: `const path = require('path');

console.log('=== path 模块与路径处理最佳实践 ===\\n');

console.log('当前平台:', process.platform);
console.log('默认路径分隔符 (path.sep):', JSON.stringify(path.sep));
console.log('PATH 分隔符 (path.delimiter):', JSON.stringify(path.delimiter));
console.log('');

// ========== 1. join vs resolve 核心对比 ==========
console.log('===== 1. path.join() vs path.resolve() 核心对比 =====\\n');

const testCases = [
  ['a', 'b', 'c'],
  ['a', 'b', '..', 'c'],
  ['/foo', 'bar', 'baz'],
  ['foo', '/bar', 'baz'],
  ['/foo', '/bar', 'baz'],
  ['.', 'a', 'b'],
  ['a/b/c', '../', '../d'],
];

console.log('输入参数'.padEnd(35), 'join()结果'.padEnd(28), 'resolve()结果');
console.log('-'.repeat(90));

for (const args of testCases) {
  const joinResult = path.posix.join(...args); // 用posix确保输出一致
  const resolveResult = path.posix.resolve(...args);
  console.log(
    args.join(',').padEnd(35),
    joinResult.padEnd(28),
    resolveResult
  );
}

console.log('\\n【关键结论】');
console.log('1. join() 只是拼接+规范化，结果可能是相对路径');
console.log('2. resolve() 模拟 cd 行为，一定返回绝对路径');
console.log('3. resolve() 遇到绝对路径(以/开头)会丢弃前面的路径');
console.log('4. join() 只是简单拼接，不会"重置"到根');
console.log('');

// ========== 2. 模拟 __dirname 场景 ==========
console.log('===== 2. 实际使用：与 __dirname 拼接（模拟）=====\\n');

const fakeDirname = '/home/user/my-project';
console.log('当前文件所在目录 (__dirname):', fakeDirname);
console.log('');

console.log('path.join(__dirname, "views", "index.html"):');
console.log(' →', path.posix.join(fakeDirname, 'views', 'index.html'));
console.log('');
console.log('path.resolve(__dirname, "views", "index.html"):');
console.log(' →', path.posix.resolve(fakeDirname, 'views', 'index.html'));
console.log('');
console.log('→ 因为__dirname本身是绝对路径，join和resolve结果相同！');
console.log('');

// 上一级目录的常见用法
console.log('path.join(__dirname, "..", "config", "db.js"):');
console.log(' →', path.posix.join(fakeDirname, '..', 'config', 'db.js'));
console.log('');

// ========== 3. path.win32 vs path.posix 对比 ==========
console.log('===== 3. 跨平台：win32 vs posix 对比 =====\\n');

const demoPath = ['users', 'name', 'documents', 'file.txt'];
console.log('路径段:', demoPath);
console.log('path.posix.join:', path.posix.join(...demoPath), '  (用/分隔)');
console.log('path.win32.join:', path.win32.join(...demoPath), '  (用\\\\分隔)');
console.log('');

// Windows 盘符处理
console.log('Windows 路径解析:');
console.log('path.win32.resolve("C:\\\\Users", "docs", "a.txt"):');
console.log(' →', path.win32.resolve('C:\\\\Users', 'docs', 'a.txt'));
console.log('');

// ========== 4. basename, dirname, extname ==========
console.log('===== 4. basename / dirname / extname =====\\n');

const paths = [
  '/home/user/projects/app/index.html',
  '/foo/bar/baz.min.js',
  '/data/readme.md',
  '/var/log/',
  '.gitignore',
  'noext',
  'photo.tar.gz',
];

console.log('路径'.padEnd(42), 'basename'.padEnd(18), 'dirname'.padEnd(22), 'extname');
console.log('-'.repeat(95));

for (const p of paths) {
  console.log(
    p.padEnd(42),
    path.posix.basename(p).padEnd(18),
    path.posix.dirname(p).padEnd(22),
    path.posix.extname(p)
  );
}

console.log('\\n注意点：');
console.log('- .gitignore 的 extname 是 "" (点在开头不算扩展名)');
console.log('- photo.tar.gz 的 extname 是 .gz (只认最后一个点)');
console.log('- 末尾/不影响basename: /var/log/ 的basename是log');
console.log('');

// basename 带扩展名参数
console.log('basename 带 ext 参数演示:');
const fullPath = '/site/assets/style.css';
console.log(\`path.basename("\${fullPath}")           = "\${path.posix.basename(fullPath)}"\`);
console.log(\`path.basename("\${fullPath}", ".css")   = "\${path.posix.basename(fullPath, '.css')}"\`);
console.log(\`path.basename("\${fullPath}", ".html")  = "\${path.posix.basename(fullPath, '.html')}"\`);
console.log('');

// ========== 5. path.parse 路径解析 ==========
console.log('===== 5. path.parse() 路径拆解 =====\\n');

const parseDemo = '/home/user/projects/node-app/package.json';
const parsed = path.posix.parse(parseDemo);
console.log(\`解析路径: "\${parseDemo}"\`);
console.log('');
console.log('解析结果:');
console.log('  root:', JSON.stringify(parsed.root));
console.log('  dir :', JSON.stringify(parsed.dir));
console.log('  base:', JSON.stringify(parsed.base));
console.log('  name:', JSON.stringify(parsed.name));
console.log('  ext :', JSON.stringify(parsed.ext));
console.log('');
console.log('关系: dir = dirname(base的父路径) = root + 中间目录');
console.log('      base = basename = name + ext');
console.log('');

// ========== 6. path.relative 相对路径 ==========
console.log('===== 6. path.relative() 计算相对路径 =====\\n');

const relativePairs = [
  ['/data/test/aaa', '/data/impl/bbb'],
  ['/a/b/c/d', '/a/x/y'],
  ['/foo', '/foo/bar/baz'],
];

for (const [from, to] of relativePairs) {
  console.log(\`从 "\${from}" 到 "\${to}"\`);
  console.log(\`  相对路径: "\${path.posix.relative(from, to)}"\`);
  console.log('');
}

// ========== 7. isAbsolute ==========
console.log('===== 7. isAbsolute() 判断绝对路径 =====\\n');
[
  '/home/user',
  './relative',
  '../parent',
  'foo/bar',
  'C:\\\\Windows',
].forEach(p => {
  console.log(\`POSIX "\${p.padEnd(18)}": \${path.posix.isAbsolute(p)}\`);
});

console.log('');
console.log('===== 总结 =====');
console.log('1. 永远不要手动拼路径，用path模块处理跨平台问题');
console.log('2. path.join() 拼接+规范化，path.resolve() 解析为绝对路径');
console.log('3. join和__dirname搭、resolve和相对路径搭，结果等价如果__dirname开头');
console.log('4. path.win32 / path.posix 可以强制指定平台规则');
console.log('5. basename取文件名，dirname取目录，extname取扩展名');
console.log('6. parse()把路径拆成root/dir/base/name/ext五部分');
console.log('7. isAbsolute()判断是否绝对路径，relative()算两个路径间的相对路径');
`
  },
  {
    id: "n2-fs-module",
    title: "fs 文件系统模块深度使用",
    icon: "📁",
    group: "第二部分 核心模块与源码原理",
    content: `# fs 文件系统模块深度使用

文件系统操作是 Node.js 最常用的功能之一：读写配置文件、处理上传文件、日志记录、数据持久化……都离不开 fs 模块。fs 模块是 Node.js 对标准 POSIX 文件操作函数的封装，但它有自己独特的"三副面孔"——同步、异步回调、Promise API——初学者常被搞混。

本章我们深入 fs 模块的各种用法、文件描述符、权限控制，以及大文件操作的正确姿势。

## fs 的三种调用方式

Node.js 的 fs 模块几乎对每个操作都提供了三种风格的 API，这是 fs 模块最显著的特点：

| 风格 | 示例 | 特点 |
|------|------|------|
| **同步（Synchronous）** | \`fs.readFileSync(path)\` | 阻塞事件循环，直到 IO 完成，直接返回结果，抛出异常 |
| **异步回调（Callback）** | \`fs.readFile(path, callback)\` | 非阻塞，完成后调用回调函数，第一个参数是 error |
| **Promise** | \`fs.promises.readFile(path)\` | 非阻塞，返回 Promise，可用 async/await（Node.js 10+） |

### 1. 同步 API：名字带 Sync 后缀

同步 API 名字里都有 \`Sync\`，它们**阻塞当前线程**直到操作完成。在 Node.js 这种单线程事件循环模型中，这意味着操作期间整个程序无法响应其他事件。

\`\`\`js
const fs = require('fs');
try {
  const data = fs.readFileSync('/path/to/file.txt', 'utf8');
  console.log(data);
} catch (err) {
  console.error('读取失败:', err);
}
\`\`\`

**什么时候用同步 API？**
- **启动阶段**：服务器启动时读取配置文件，阻塞一下没关系，启动完再处理请求
- **简单 CLI 工具**：命令行脚本不在乎阻塞，同步代码写起来简单
- **极少被调用的代码路径**：偶尔执行一次的管理操作

**不要在请求处理回调中用同步 API**——比如在 Express 的路由处理器里调用 readFileSync，会阻塞整个服务器，所有请求都要等这个文件读完才能处理。高并发下这是灾难。

### 2. 异步回调 API：传统 Node.js 风格

这是 Node.js 最早的异步风格，最后一个参数是回调函数，回调的第一个参数是 error（Node.js 约定）。

\`\`\`js
fs.readFile('/path/to/file.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('读取失败:', err);
    return;
  }
  console.log(data);
});
\`\`\`

回调风格的问题是"回调地狱"——多个顺序异步操作会嵌套很深：
\`\`\`js
fs.readFile('a.txt', (err, a) => {
  fs.readFile('b.txt', (err, b) => {
    fs.readFile('c.txt', (err, c) => {
      // 三层嵌套了...
    });
  });
});
\`\`\`

现在更推荐用 Promise API。

### 3. Promise API：现代写法

从 Node.js 10 开始，fs 提供了 \`fs.promises\`（Node.js 14 之前也可以用 \`require('fs').promises\`），返回 Promise，可以配合 async/await 使用，代码简洁清晰。

\`\`\`js
const fsp = require('fs').promises;

async function readConfig() {
  try {
    const data = await fsp.readFile('/path/to/config.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('读取配置失败:', err);
    throw err;
  }
}
\`\`\`

也可以从 \`fs/promises\` 导入（Node.js 14+）：
\`\`\`js
const fsp = require('fs/promises');
\`\`\`

**生产环境推荐用 Promise API + async/await**，代码可读性最好，错误处理也最自然。

---

## 文件描述符（File Descriptor）

在操作系统层面，所有文件操作都是通过**文件描述符**（file descriptor，简称 fd）进行的。文件描述符是一个非负整数，当你打开一个文件时，操作系统返回一个 fd，后续的 read/write/close 操作都用这个 fd 来指代这个文件。

Node.js 的高层 API（如 readFile/writeFile）在内部帮你处理了 fd 的 open→操作→close 流程。但如果你需要更精细的控制（比如随机读写、部分读取、操作文件权限），就需要直接操作 fd。

### 常见 fd
- **0**：标准输入（stdin）
- **1**：标准输出（stdout）
- **2**：标准错误（stderr）

这三个 fd 在进程启动时就已经打开了。console.log 本质上就是往 fd=1 写数据。

### 手动操作 fd 的流程

\`\`\`js
const fs = require('fs');

// 1. 打开文件，获取fd
const fd = fs.openSync('/path/to/file', 'r'); // 'r'表示只读

// 2. 创建Buffer接收数据
const buf = Buffer.alloc(1024);

// 3. 读取数据到buffer
// 参数：fd, buffer, buffer偏移, 读取字节数, 文件读取起始位置
const bytesRead = fs.readSync(fd, buf, 0, 100, 0);
console.log(\`读取了\${bytesRead}字节\`);

// 4. **一定要关闭文件描述符！** 否则会泄漏文件句柄
fs.closeSync(fd);
\`\`\`

⚠️ **重要**：手动打开 fd 后，**一定要记得 close**！文件句柄是有限资源（默认进程打开文件数通常是 1024 或 65535），如果只开不关，很快就会耗尽，导致 "too many open files" 错误。用 fs.open 一定要配套 try/finally 保证 close：

\`\`\`js
const fd = fs.openSync(filepath, 'r');
try {
  // 操作fd
} finally {
  fs.closeSync(fd); // 无论是否出错都关闭
}
\`\`\`

### 文件打开标志（flags）

打开文件时第二个参数是 flags，控制文件打开模式：

| Flag | 含义 | 文件不存在时 |
|------|------|-------------|
| **'r'** | 只读 | 报错 |
| **'r+'** | 读写 | 报错 |
| **'w'** | 只写 | 创建文件 |
| **'w+'** | 读写 | 创建文件 |
| **'a'** | 追加写（在末尾） | 创建文件 |
| **'a+'** | 读取+追加 | 创建文件 |
| **'wx'/'w+x'** | 类似w但排他（存在则报错） | - |

注意 'w' 标志会**清空原有文件内容**！如果你不想清空，用 'a' 追加或者 'r+' 读写。

---

## 文件权限（mode）

Linux/Unix 系统每个文件有权限位，控制谁能读、写、执行。fs 操作中常见的 mode 参数就是这个。

权限用三个八进制数字表示，分别对应：
- 第一位：文件所有者（user/owner）
- 第二位：用户组（group）
- 第三位：其他人（others）

每一位是三个权限位的和：
- **4**：读权限（r）
- **2**：写权限（w）
- **1**：执行权限（x）

常见权限：
| mode | 含义 |
|------|------|
| 0o666 | 所有人可读写（文件默认，umask会影响最终权限） |
| 0o644 | 所有者读写，其他人只读（最常见） |
| 0o755 | 所有者读写执行，其他人读执行（目录、可执行文件） |
| 0o777 | 所有人所有权限（危险，不推荐） |

注意：实际创建文件时，最终权限是 mode & ~umask。umask 通常是 0o022，所以如果你传 0o666，实际文件权限是 0o644。

### fs.constants

fs 模块导出了 \`fs.constants\` 对象，包含各种常量：

\`\`\`js
const fs = require('fs');

// 文件访问权限常量
fs.constants.R_OK; // 是否可读
fs.constants.W_OK; // 是否可写
fs.constants.X_OK; // 是否可执行
fs.constants.F_OK; // 文件是否存在

// 检查文件是否存在且可读
try {
  fs.accessSync('/path/to/file', fs.constants.R_OK);
  console.log('文件可读');
} catch {
  console.log('文件不可读或不存在');
}
\`\`\`

注意：不要用 \`fs.existsSync\` 检查文件存在性然后再读写——这是 TOCTOU（time-of-check time-of-use）竞态条件。正确做法是直接读写文件，处理不存在的错误。existsSync 只在文件不影响后续操作时用（比如检查某个锁文件是否存在）。

---

## 文件信息：fs.stat / fs.fstat

调用 \`fs.stat(path)\` 或 \`fs.fstat(fd)\` 可以获取文件的元信息，返回一个 \`fs.Stats\` 对象：

\`\`\`js
const stats = fs.statSync('/path/to/file');
stats.isFile();         // 是否是普通文件
stats.isDirectory();    // 是否是目录
stats.isSymbolicLink(); // 是否是符号链接（软链接）
stats.size;             // 文件大小（字节）
stats.atime;            // 最后访问时间
stats.mtime;            // 最后修改时间
stats.ctime;            // 最后状态改变时间（权限、所有者等变化）
stats.birthtime;        // 创建时间
stats.mode;             // 权限和文件类型位
stats.uid;              // 所有者用户ID
stats.gid;              // 所属组ID
\`\`\`

lstat 和 stat 的区别：stat 会跟随符号链接（读取链接指向的文件信息），lstat 返回链接本身的信息。

---

## 目录操作

- **fs.mkdir(path[, options], callback)**：创建目录
  - \`recursive: true\` 可以递归创建多层目录（类似 \`mkdir -p\`）
- **fs.readdir(path)**：读取目录下的文件列表
- **fs.rmdir(path)**：删除空目录
- **fs.rm(path, { recursive: true })**：递归删除目录和内容（Node.js 14.14+，替代旧的 rm -rf）
- **fs.rename(oldPath, newPath)**：重命名/移动文件或目录

---

## fs.watch 的注意事项

\`fs.watch()\` 监听文件/目录的变化（修改、重命名、删除）。API 很简单，但坑很多：

1. **跨平台不一致**：macOS 用 FSEvents，Linux 用 inotify，Windows 用 ReadDirectoryChangesW，行为差异大。
2. **可能重复触发**：一次修改可能触发多个事件。
3. **递归监听不可靠**：\`recursive: true\` 只在 macOS 和 Windows 上原生支持，Linux 上需要自己递归 watch 子目录。
4. **有些编辑器保存时触发 rename 事件**：比如写文件时先写临时文件再 rename，导致监听到 rename 而不是 change。
5. **不保证稳定性**：文档明确说 fs.watch 是"best effort"的，不保证所有场景都能监听到。

生产环境需要稳定文件监听，通常用 **chokidar** 这个第三方库，它封装了 fs.watch 和轮询，处理了各种跨平台坑。

---

## 大文件复制的正确方式：用流

新手常犯的错误：用 readFile 读整个文件到内存，再用 writeFile 写出去。对于大文件，这会导致内存暴涨。

**正确方式是用流（Stream）**：

\`\`\`js
const fs = require('fs');

// 方式1：pipe（简单场景）
fs.createReadStream('source.zip')
  .pipe(fs.createWriteStream('dest.zip'));

// 方式2：pipeline（推荐，错误处理完整）
const { pipeline } = require('stream/promises');
await pipeline(
  fs.createReadStream('source.zip'),
  fs.createWriteStream('dest.zip')
);
\`\`\`

或者更简单，Node.js 18.13+ 有 \`fs.cp()\` 方法可以直接复制文件/目录。但理解背后的流原理更重要。

为什么用流复制大文件不占内存？因为数据以小块（默认 64KB，见 createReadStream 的 highWaterMark）流动，内存里同时只有一个或几个 chunk，再加上背压机制自动控制速度。复制 10GB 文件内存占用也是几十 KB 级别。

---

## 常用 fs API 速查

| 操作 | 同步 | 异步Promise |
|------|------|-------------|
| 读文件 | readFileSync | promises.readFile |
| 写文件 | writeFileSync | promises.writeFile |
| 追加内容 | appendFileSync | promises.appendFile |
| 删除文件 | unlinkSync | promises.unlink |
| 重命名/移动 | renameSync | promises.rename |
| 创建目录 | mkdirSync | promises.mkdir |
| 读目录 | readdirSync | promises.readdir |
| 删除目录/文件 | rmSync | promises.rm |
| 文件信息 | statSync | promises.stat |
| 改变权限 | chmodSync | promises.chmod |
| 创建读流 | createReadStream | (是流，无同步版本) |
| 创建写流 | createWriteStream | (是流，无同步版本) |

最后提醒：生产环境永远记得处理 fs 操作的错误！磁盘满了、权限不够、文件不存在、父目录不存在……这些都是常见的失败场景，必须 catch 处理。`,
    code: `const fs = require('fs');
const os = require('os');
const path = require('path');

console.log('=== fs 文件系统模块深度使用 ===\\n');

// 注意：我们不真的写磁盘，只演示API结构和只读/虚拟操作

// ========== 1. 三种 API 风格对比 ==========
console.log('===== 1. fs 三种调用方式对比 =====\\n');

console.log('fs 模块导出的 API 类型:');
console.log('- 同步API: 函数名带 Sync 后缀，如 fs.readFileSync()');
console.log('- 回调API: 传统Node风格，如 fs.readFile(path, cb)');
console.log('- Promise API: fs.promises.readFile()，配合async/await');
console.log('');

// 展示 fs.promises 对象
console.log('fs.promises 上常用的Promise方法:');
const promiseMethods = Object.keys(fs.promises).filter(k => 
  !k.startsWith('_') && typeof fs.promises[k] === 'function'
).slice(0, 15);
console.log(' ', promiseMethods.join(', '));
console.log('');

// ========== 2. 文件路径与系统信息 ==========
console.log('===== 2. 系统临时目录与路径信息 =====\\n');

const tmpDir = os.tmpdir();
console.log('操作系统临时目录 (os.tmpdir()):', tmpDir);
console.log('用户主目录 (os.homedir()):', os.homedir());
console.log('');

// 用 path 构造一个假的演示路径（不真的创建）
const demoFilePath = path.join(tmpDir, 'nodejs-fs-demo.txt');
console.log('演示文件路径:', demoFilePath);
console.log('路径是否绝对:', path.isAbsolute(demoFilePath));
console.log('');

// ========== 3. 文件描述符概念 ==========
console.log('===== 3. 文件描述符（fd）概念 =====\\n');
console.log('标准输入 fd: 0 (process.stdin.fd =', process.stdin.fd, ')');
console.log('标准输出 fd: 1 (process.stdout.fd =', process.stdout.fd, ')');
console.log('标准错误 fd: 2 (process.stderr.fd =', process.stderr.fd, ')');
console.log('');

// ========== 4. 文件打开标志 flags ==========
console.log('===== 4. 文件打开标志（flags）=====\\n');
const flagsTable = [
  ['r', '只读，文件不存在则报错'],
  ['r+', '读写，文件不存在则报错'],
  ['w', '只写，不存在创建，存在清空'],
  ['w+', '读写，不存在创建，存在清空'],
  ['a', '追加写，不存在创建，在末尾追加'],
  ['a+', '读+追加，不存在创建'],
  ['wx', '类似w，但是排他模式（存在则失败）'],
];
console.log('Flag'.padEnd(8), '含义');
console.log('-'.repeat(50));
for (const [flag, desc] of flagsTable) {
  console.log(flag.padEnd(8), desc);
}
console.log('');
console.log('⚠️  注意: "w" 标志会清空文件原有内容！');
console.log('⚠️  注意: 手动 open 后必须 close，否则文件句柄泄漏！');
console.log('');

// ========== 5. 文件权限 mode ==========
console.log('===== 5. 文件权限（mode）=====\\n');
const modeTable = [
  [0o644, 'rw-r--r--', '所有者读写，其他人只读（普通文件推荐）'],
  [0o755, 'rwxr-xr-x', '所有者读写执行，其他人读执行（目录/可执行）'],
  [0o600, 'rw-------', '仅所有者读写（敏感文件如密钥）'],
  [0o777, 'rwxrwxrwx', '所有人所有权限（危险，不推荐）'],
];
console.log('八进制'.padEnd(10), '符号表示'.padEnd(15), '含义');
console.log('-'.repeat(60));
for (const [mode, symbol, desc] of modeTable) {
  console.log(
    ('0o' + mode.toString(8)).padEnd(10),
    symbol.padEnd(15),
    desc
  );
}
console.log('');
console.log('权限位: r=4(读), w=2(写), x=1(执行)');
console.log('实际权限 = mode & ~umask（umask通常0o022，会去掉其他人的写权限）');
console.log('');

// ========== 6. fs.constants 常量 ==========
console.log('===== 6. fs.constants 文件系统常量 =====\\n');
console.log('文件访问检查常量:');
console.log('  F_OK =', fs.constants.F_OK, '(文件存在)');
console.log('  R_OK =', fs.constants.R_OK, '(可读)');
console.log('  W_OK =', fs.constants.W_OK, '(可写)');
console.log('  X_OK =', fs.constants.X_OK, '(可执行)');
console.log('');

// ========== 7. 安全演示：只读访问检查（不修改系统） ==========
console.log('===== 7. 文件访问检查（只读，不修改）=====\\n');

// 检查临时目录是否可访问（应该总是存在且可读写）
try {
  fs.accessSync(tmpDir, fs.constants.R_OK | fs.constants.W_OK);
  console.log('✅ 临时目录存在且可读写:', tmpDir);
} catch (err) {
  console.log('❌ 临时目录不可访问:', err.message);
}

// 演示：构造一个项目路径示例（沙箱中用临时目录模拟）
// 在真实环境中你会用 __dirname 拼接路径，这里用 tmpDir 演示
const demoProjectPath = path.join(tmpDir, 'demo-project', 'package.json');
console.log('演示项目文件路径（模拟 __dirname 拼接）:', demoProjectPath);
const currentModulePath = demoProjectPath;
try {
  fs.accessSync(currentModulePath, fs.constants.R_OK);
  console.log('✅ 路径可读');
} catch {
  console.log('ℹ️  路径不存在（沙箱环境正常）');
}
console.log('');

// ========== 8. fs.Stats 结构展示 ==========
console.log('===== 8. fs.Stats 文件元信息结构 =====\\n');
console.log('调用 fs.statSync(path) 返回 Stats 对象，包含:');
const statsProps = [
  'size',        // 文件大小
  'mode',        // 权限和文件类型
  'nlink',       // 硬链接数
  'uid',         // 用户ID
  'gid',         // 组ID
  'atimeMs',     // 访问时间
  'mtimeMs',     // 修改时间
  'ctimeMs',     // 改变时间
  'birthtimeMs', // 创建时间
];
console.log('属性:', statsProps.join(', '));
console.log('方法: isFile(), isDirectory(), isSymbolicLink(), isBlockDevice()...');
console.log('');

// 读取临时目录的stat信息（目录肯定存在）
try {
  const tmpStats = fs.statSync(tmpDir);
  console.log('临时目录 stat 信息:');
  console.log('  isDirectory():', tmpStats.isDirectory());
  console.log('  size:', tmpStats.size, '字节');
  console.log('  mtime:', tmpStats.mtime.toISOString());
} catch (e) {
  console.log('无法读取临时目录stat:', e.message);
}
console.log('');

// ========== 9. 大文件复制：流的正确方式 ==========
console.log('===== 9. 大文件处理：用流！=====\\n');

console.log('❌ 错误方式（大文件内存爆炸）:');
console.log('   const data = fs.readFileSync("big.iso"); // 10GB文件→10GB内存!');
console.log('   fs.writeFileSync("copy.iso", data);');
console.log('');
console.log('✅ 正确方式（流，内存恒定几十KB）:');
console.log('   const { pipeline } = require("stream/promises");');
console.log('   await pipeline(');
console.log('     fs.createReadStream("big.iso"),  // 每次读highWaterMark字节');
console.log('     fs.createWriteStream("copy.iso")  // 背压自动控制速度');
console.log('   );');
console.log('');
console.log('原理：createReadStream 默认 highWaterMark = 64KB');
console.log('      数据分块流动，内存中永远只有少量chunk');
console.log('      pipeline 自动处理背压、错误、资源清理');
console.log('');

// ========== 10. fs.watch 注意事项 ==========
console.log('===== 10. fs.watch 注意事项 =====\\n');
console.log('fs.watch 可以监听文件变化，但有很多坑：');
console.log('- 跨平台行为不一致（macOS FSEvents / Linux inotify / Windows）');
console.log('- 一次修改可能触发多次事件');
console.log('- 有些编辑器"保存"是rename而不是change');
console.log('- recursive: true 只在macOS/Windows原生支持');
console.log('- 官方明确说不保证100%可靠（best effort）');
console.log('- 生产环境稳定监听推荐第三方库: chokidar');
console.log('');

// ========== 11. 常用API速查表 ==========
console.log('===== 常用 fs API 速查 =====\\n');
console.log('操作'.padEnd(16), '同步'.padEnd(20), 'Promise(async/await)');
console.log('-'.repeat(60));
const apiTable = [
  ['读文件', 'readFileSync', 'promises.readFile'],
  ['写文件', 'writeFileSync', 'promises.writeFile'],
  ['追加文件', 'appendFileSync', 'promises.appendFile'],
  ['删除文件', 'unlinkSync', 'promises.unlink'],
  ['重命名', 'renameSync', 'promises.rename'],
  ['创建目录', 'mkdirSync', 'promises.mkdir'],
  ['读目录', 'readdirSync', 'promises.readdir'],
  ['删除', 'rmSync', 'promises.rm'],
  ['文件信息', 'statSync', 'promises.stat'],
  ['改权限', 'chmodSync', 'promises.chmod'],
];
for (const [op, sync, prom] of apiTable) {
  console.log(op.padEnd(16), sync.padEnd(20), prom);
}
console.log('');
console.log('===== 总结 =====');
console.log('1. fs有三种API：同步(Sync后缀)、回调、Promise(async/await推荐)');
console.log('2. 服务启动/CLI用同步，请求处理/高并发用异步');
console.log('3. 底层通过文件描述符fd操作，open后必须close防泄漏');
console.log('4. mode用八进制表示权限：r=4, w=2, x=1');
console.log('5. fs.constants提供各种访问检查常量');
console.log('6. 大文件读写必须用createReadStream/createWriteStream + pipeline');
console.log('7. fs.watch有跨平台坑，生产用chokidar');
console.log('8. 永远处理错误：磁盘满、权限不足、文件不存在...');
`
  },
  {
    id: "n2-crypto",
    title: "crypto 加密模块实战",
    icon: "🔐",
    group: "第二部分 核心模块与源码原理",
    content: `# crypto 加密模块实战

加密是现代应用不可缺少的部分：密码存储、数据加密传输、消息完整性校验、唯一ID生成、数字签名……Node.js 内置的 \`crypto\` 模块提供了完整的加密能力，它是对 OpenSSL（LibreSSL/BoringSSL）的封装，包含哈希、HMAC、对称加密、非对称加密、数字签名、随机数生成等全套密码学工具。

本章我们学习 crypto 模块的核心用法，以及密码存储、数据完整性校验等实战场景。

## 密码学基础概念快速复习

在讲具体API之前，我们快速梳理几个核心概念，这对理解crypto模块至关重要。

### 1. 哈希（Hash）算法——单向、不可逆

哈希算法把任意长度的输入数据变成固定长度的输出（摘要/digest）。关键特性：
- **单向**：从输入到哈希容易，从哈希反推输入几乎不可能（不可逆）
- **雪崩效应**：输入哪怕改一个字节，输出哈希完全不同
- **定长输出**：MD5输出128位(32hex字符)，SHA256输出256位(64hex字符)
- **确定性**：相同输入永远得到相同输出

常见哈希算法：
| 算法 | 输出长度 | 安全性 | 用途 |
|------|---------|--------|------|
| MD5 | 128位 | ❌ 已破解，碰撞容易 | 文件校验（非安全场景）、缓存key |
| SHA-1 | 160位 | ❌ 已破解，不推荐安全场景 | Git对象哈希（历史原因） |
| SHA-256 | 256位 | ✅ 安全 | 比特币、区块链、TLS、通用哈希 |
| SHA-512 | 512位 | ✅ 安全 | 高安全场景 |

> **碰撞问题**：碰撞是指两个不同输入产生相同哈希值。MD5 和 SHA-1 已经能被构造碰撞（王小云教授的工作），所以**不要用于安全场景**。SHA-256 目前没有可行的碰撞攻击。

哈希不是加密！加密是可逆的（有密钥能解密），哈希是不可逆的。

### 2. 消息认证码（HMAC）——带密钥的哈希

普通哈希只能验证"数据有没有被意外修改"，但无法防恶意篡改——因为攻击者可以同时修改数据和重新计算哈希。

HMAC（Hash-based Message Authentication Code）是**带密钥的哈希**：只有持有相同密钥的人，才能计算和验证相同的 HMAC 值。它用于：
- API 请求签名（防止参数被篡改）
- JWT 的签名部分
- 消息完整性和真实性验证

HMAC 用的还是哈希算法（SHA-256等），只是加入了密钥参与计算。

### 3. 对称加密——加解密用同一个密钥

对称加密用**同一个密钥**进行加密和解密。加密速度快，适合加密大量数据。

核心要素：
- **密钥（key）**：必须保密，通信双方都持有
- **初始化向量（IV）**：不需要保密，但每次加密必须不同（避免相同明文加密出相同密文）
- **加密模式**：ECB（不安全，相同块加密成相同结果）、CBC、GCM（推荐，认证加密）、CTR
- **填充（padding）**：分组密码需要数据长度是块大小整数倍

常用算法：**AES**（Advanced Encryption Standard），是目前最流行的对称加密标准。
- AES-128：密钥16字节
- AES-192：密钥24字节
- AES-256：密钥32字节

> **安全提示**：
> - 不要用 ECB 模式！相同明文块会产生相同密文块，泄露数据模式。
> - IV 必须是不可预测的（用 crypto.randomBytes 生成），并且每条消息唯一。
> - GCM 模式提供认证加密（AEAD），能同时验证完整性，推荐使用。

### 4. 非对称加密（公钥加密）——公钥加密，私钥解密

非对称加密用一对密钥：
- **公钥（public key）**：可以公开，任何人都能用它加密消息
- **私钥（private key）**：必须保密，只有持有者能用它解密

常用算法：RSA、ECC（椭圆曲线）。特点：
- 加密速度慢（比对称加密慢几个数量级）
- 适合加密小数据（如对称密钥本身）
- 实际应用中通常结合使用：用非对称加密交换对称密钥，然后用对称加密传输数据（HTTPS的TLS就是这样）

非对称加密的逆用就是**数字签名**：私钥签名（相当于"盖戳"），公钥验证（确认是你盖的）。

---

## crypto.createHash()：哈希计算

这是 crypto 最基础也最常用的 API 之一。

\`\`\`js
const crypto = require('crypto');

// 计算哈希
const hash = crypto.createHash('sha256')
  .update('hello world')  // 输入数据（可以多次调用update）
  .digest('hex');          // 输出格式: hex, base64, buffer

console.log(hash); // b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
\`\`\`

可以多次调用 \`update()\`，数据会被拼接起来，和一次性 update 全部数据结果一样，这在处理流式数据时很有用（比如大文件哈希）：

\`\`\`js
const hash = crypto.createHash('sha256');
hash.update('hello ');
hash.update('world');
console.log(hash.digest('hex') === crypto.createHash('sha256').update('hello world').digest('hex')); // true
\`\`\`

\`digest()\` 方法输出最终的哈希值，之后这个 Hash 对象就不能再用了（不能再 update）。\`digest()\` 参数是输出编码：
- \`'hex'\`：十六进制字符串（最常用，方便存储和传输）
- \`'base64'\`：base64 编码字符串
- 不传参数：返回 Buffer

---

## crypto.createHmac()：消息认证码

HMAC 用法和 Hash 几乎一样，只是多一个密钥参数：

\`\`\`js
const crypto = require('crypto');
const secret = 'my-secret-key';

const hmac = crypto.createHmac('sha256', secret)
  .update('message to authenticate')
  .digest('hex');

// 接收方用相同的secret重新计算，比对是否一致
\`\`\`

HMAC 和普通 Hash 的区别是，没有密钥就算你知道原始消息和算法，也算不出正确的 HMAC 值。这保证了消息确实是持有密钥的一方发出的，没有被篡改。

---

## 随机数生成：crypto.randomBytes 和 crypto.randomUUID

密码学安全的随机数非常重要——普通的 \`Math.random()\` 是伪随机数，可预测，绝对不能用于安全场景（生成密钥、token、验证码等）。

- **crypto.randomBytes(size[, callback])**：生成密码学安全的随机字节
- **crypto.randomUUID()**：生成符合 RFC 4122 版本 4 的随机 UUID（Node.js 14.17+）

\`\`\`js
// 生成32字节（256位）的随机密钥
const key = crypto.randomBytes(32);
console.log(key.toString('hex')); // 64个hex字符

// 生成UUID
const id = crypto.randomUUID();
console.log(id); // 如 '550e8400-e29b-41d4-a716-446655440000'
\`\`\`

随机数生成会收集系统熵（鼠标移动、键盘输入、网络IO等），系统熵不足时 randomBytes 可能会阻塞（启动时可能发生）。生产环境一般没问题。

---

## 密码存储的正确方式：加盐哈希

这是后端开发最常见的加密场景：用户密码怎么存数据库？

**绝对不要做的事**：
- ❌ 明文存储（拖库就完了）
- ❌ 用 MD5/SHA-256 直接哈希（彩虹表攻击，MD5 还能碰撞）
- ❌ 自己发明加密算法（你发明的一定有漏洞）

**正确的方式是加盐哈希**：
1. 注册时，给每个用户生成一个随机的 salt（盐）
2. 用慢哈希算法（bcrypt/scrypt/Argon2）对 password + salt 计算哈希
3. 把 salt 和哈希结果一起存到数据库
4. 登录时，取出 salt，用同样算法计算，比对哈希

**为什么需要盐？** 如果两个用户密码相同，不加盐的哈希值也相同，攻击者可以用"彩虹表"（预计算常见密码的哈希）快速反查。每个用户一个唯一的盐，彩虹表就失效了。

**为什么要用慢哈希？** 普通哈希（SHA-256）太快了，攻击者可以每秒暴力试几十亿个密码。bcrypt/scrypt/Argon2 是专门为密码哈希设计的"慢"算法，可调节工作因子，让一次哈希计算需要几毫秒到几百毫秒，暴力破解成本呈数量级上升。

Node.js 内置 \`crypto.scrypt()\` （基于 scrypt 算法），不用 bcrypt 原生模块也能安全存密码。流程：
1. 注册：\`salt = randomBytes(16)\` → \`hash = scrypt(password, salt, keyLength)\` → 存 salt 和 hash
2. 登录：取出 salt → \`hash = scrypt(inputPassword, salt, keyLength)\` → 比较两个 hash 是否相等（用 timingSafeEqual 防时序攻击）

---

## crypto.timingSafeEqual：时序安全比较

比较两个哈希值/密钥是否相等，不能直接用 \`==\` 或 \`===\` 或 \`buf1.equals(buf2)\`！为什么？因为这些比较在第一个不同字节就返回，攻击者可以通过测量响应时间来逐字节猜测正确值（时序攻击/timing attack）。

正确做法是用 \`crypto.timingSafeEqual(a, b)\`：不管是否相等，都比较固定的时长，防止时序攻击。注意：两个 Buffer 必须长度相同。

\`\`\`js
const a = crypto.randomBytes(32);
const b = crypto.randomBytes(32);
const areEqual = crypto.timingSafeEqual(a, b);
\`\`\`

---

## 对称加密演示：AES-256-GCM

AES-GCM 是目前推荐的认证加密模式，它不仅加密数据，还生成认证标签（authentication tag），解密时验证标签可以防止密文被篡改。

\`\`\`js
function encrypt(plaintext, key) {
  const iv = crypto.randomBytes(12); // GCM推荐12字节IV
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex'), authTag: authTag.toString('hex') };
}

function decrypt(encrypted, key) {
  const iv = Buffer.from(encrypted.iv, 'hex');
  const encryptedData = Buffer.from(encrypted.encryptedData, 'hex');
  const authTag = Buffer.from(encrypted.authTag, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  return decrypted.toString('utf8');
}
\`\`\`

使用流程：
- 加密方：生成随机IV → 创建cipher → update加密 → final → 获取authTag → 把IV、密文、authTag一起传出去（IV和authTag不需要保密）
- 解密方：设置authTag → 创建decipher → update解密 → final（如果数据被篡改，final会抛错）

---

## 数字签名简介

数字签名是私钥加密哈希值，公钥验证签名：
1. 对消息计算哈希
2. 发送方用**私钥**加密哈希值 → 得到签名
3. 接收方用**公钥**解密签名得到哈希，和自己算的哈希比对
4. 一致说明：消息没被篡改 + 确实是私钥持有者发的

这和加密方向相反：加密是公钥加密私钥解密，签名是私钥签名公钥验证。

Node.js 中用 \`crypto.createSign()\` 和 \`crypto.createVerify()\` 进行签名和验证。

---

## crypto 模块使用安全要点总结

1. **永远不要用 Math.random() 做安全相关的事**，用 crypto.randomBytes/randomUUID
2. **不要用 MD5/SHA-1 做安全场景**，至少用 SHA-256 或更安全的
3. **密码存储用慢哈希**（scrypt/bcrypt/Argon2）+ 每用户独立盐
4. **比较密钥/哈希用 timingSafeEqual**，防止时序攻击
5. **对称加密用 AES-GCM**（认证加密），不要用 ECB 模式，IV必须随机不可预测
6. **IV/认证标签不需要保密**，但密钥必须保密，每条消息IV必须不同
7. **不要自己发明加密方案**，用标准的、经过审计的算法和协议
8. **HMAC 用于消息认证**，比单纯哈希安全

掌握 crypto 模块的这些核心 API，你就能应对绝大多数应用层加密需求。`,
    code: `const crypto = require('crypto');

console.log('=== crypto 加密模块实战 ===\\n');

// ========== 1. 哈希算法 ==========
console.log('===== 1. 哈希算法演示 =====\\n');

const plaintext = 'hello, node.js crypto!';

const md5Hash = crypto.createHash('md5').update(plaintext).digest('hex');
const sha1Hash = crypto.createHash('sha1').update(plaintext).digest('hex');
const sha256Hash = crypto.createHash('sha256').update(plaintext).digest('hex');
const sha512Hash = crypto.createHash('sha512').update(plaintext).digest('hex');

console.log('原文:', plaintext);
console.log('');
console.log('MD5   (32hex/128bit):', md5Hash);
console.log('SHA-1 (40hex/160bit):', sha1Hash);
console.log('SHA256(64hex/256bit):', sha256Hash);
console.log('SHA512(128hex/512bit):', sha512Hash);
console.log('');

// 雪崩效应：改一个字符哈希完全不同
const slightlyDifferent = 'hello, node.js crypto.';
const sha256Changed = crypto.createHash('sha256').update(slightlyDifferent).digest('hex');
console.log('仅修改一个字符 (! → .):');
console.log('原哈希:', sha256Hash);
console.log('改后哈希:', sha256Changed);
console.log('完全不同！这就是雪崩效应。');
console.log('');

// 多次update拼接等价
const hash1 = crypto.createHash('sha256').update('hello').update(' world').digest('hex');
const hash2 = crypto.createHash('sha256').update('hello world').digest('hex');
console.log('多次update拼接结果一致:', hash1 === hash2);
console.log('');

// ========== 2. HMAC 消息认证码 ==========
console.log('===== 2. HMAC 消息认证码 =====\\n');

const secret = 'my-secret-key-2024';
const message = 'user=alice&amount=100';

const hmac = crypto.createHmac('sha256', secret).update(message).digest('hex');
console.log('消息:', message);
console.log('密钥:', secret);
console.log('HMAC-SHA256:', hmac);
console.log('');

// 验证：用相同密钥重新计算
const tamperedMessage = 'user=alice&amount=999';
const hmacTampered = crypto.createHmac('sha256', secret).update(tamperedMessage).digest('hex');
console.log('被篡改消息的HMAC:', hmacTampered);
console.log('HMAC一致吗？', hmac === hmacTampered, '(不一致说明被篡改了)');
console.log('没有密钥就算知道算法也伪造不了HMAC');
console.log('');

// ========== 3. 随机数生成 ==========
console.log('===== 3. 密码学安全随机数 =====\\n');

const randomKey = crypto.randomBytes(32);
console.log('32字节(256位)随机密钥(hex):', randomKey.toString('hex'));
console.log('16字节随机salt(hex):', crypto.randomBytes(16).toString('hex'));
console.log('');

const uuid1 = crypto.randomUUID();
const uuid2 = crypto.randomUUID();
console.log('UUID 1:', uuid1);
console.log('UUID 2:', uuid2);
console.log('UUID格式: 8-4-4-4-12 hex字符，第4段开头是4(版本4随机UUID)');
console.log('');

// ========== 4. 加盐哈希密码（用pbkdf2演示） ==========
console.log('===== 4. 加盐哈希密码存储演示 =====\\n');

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
}

function registerUser(username, password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  console.log(\`注册用户: \${username}\`);
  console.log(\`  salt: \${salt}\`);
  console.log(\`  hash: \${hash.toString('hex')}\`);
  return { username, salt, hash: hash.toString('hex') };
}

function verifyPassword(user, passwordInput) {
  const hash = hashPassword(passwordInput, user.salt);
  const storedHash = Buffer.from(user.hash, 'hex');
  return crypto.timingSafeEqual(hash, storedHash);
}

const user = registerUser('alice', 'MySecurePass123!');
console.log('');

console.log('正确密码验证结果:', verifyPassword(user, 'MySecurePass123!'));
console.log('错误密码验证结果:', verifyPassword(user, 'wrongpassword'));
console.log('');
console.log('要点：1. 每个用户独立salt  2. 慢哈希(多次迭代)  3. timingSafeEqual比对');
console.log('生产推荐：crypto.scrypt() 或 bcrypt/Argon2');
console.log('');

// ========== 5. AES-256-GCM 对称加密 ==========
console.log('===== 5. AES-256-GCM 对称加密演示 =====\\n');

function aesEncrypt(plaintext, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { iv: iv.toString('hex'), data: encrypted.toString('hex'), tag: authTag.toString('hex') };
}

function aesDecrypt(encrypted, key) {
  const iv = Buffer.from(encrypted.iv, 'hex');
  const data = Buffer.from(encrypted.data, 'hex');
  const tag = Buffer.from(encrypted.tag, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

const aesKey = crypto.randomBytes(32);
const secretMessage = '这是一条需要加密的机密消息，传输过程中不能被窃取或篡改。';
console.log('原文:', secretMessage);
console.log('');

const encrypted = aesEncrypt(secretMessage, aesKey);
console.log('加密结果:');
console.log('  IV:', encrypted.iv);
console.log('  认证标签:', encrypted.tag);
console.log('  密文预览:', encrypted.data.slice(0, 60) + '...');
console.log('');

const decrypted = aesDecrypt(encrypted, aesKey);
console.log('解密结果:', decrypted);
console.log('解密成功:', decrypted === secretMessage);
console.log('');

const tampered = { ...encrypted, data: encrypted.data.slice(0, -2) + '00' };
try {
  aesDecrypt(tampered, aesKey);
} catch(e) {
  console.log('篡改密文后解密失败：GCM认证检测到篡改！');
}
console.log('');

console.log('===== 总结 =====');
console.log('1. 哈希：createHash(算法).update(data).digest(编码)');
console.log('2. HMAC：带密钥的哈希，防篡改');
console.log('3. 随机数用randomBytes/randomUUID，不要用Math.random()');
console.log('4. 密码：加盐salt + 慢哈希 + timingSafeEqual');
console.log('5. 对称加密推荐AES-256-GCM（认证加密）');
console.log('6. 不要自己发明加密算法！用标准方案');
`
  },
  {
    id: "n2-util",
    title: "util 模块实用工具函数",
    icon: "🛠️",
    group: "第二部分 核心模块与源码原理",
    content: `# util 模块实用工具函数

Node.js 的 \`util\` 模块是一个"瑞士军刀"式的工具集，提供了很多实用的小函数，解决 JavaScript 开发中的常见痛点：Promise 转换、原型继承、对象检查、字符串格式化、类型判断等。虽然很多功能随着 ES6+ 语言标准的演进而有了原生替代，但 util 模块仍然在 Node.js 生态中扮演重要角色。

本章我们学习 util 模块最常用、最实用的函数。

---

## util.promisify：回调转 Promise

这可能是 util 模块中最有用的函数。Node.js 早期大量 API 都是"错误优先回调"风格（callback 第一个参数是 err，第二个是结果），\`util.promisify\` 可以把这种回调风格的函数转换成返回 Promise 的函数，让你能用 async/await。

### 基本用法

\`\`\`js
const util = require('util');
const fs = require('fs');

// 把 fs.readFile 从回调风格转成 Promise 风格
const readFile = util.promisify(fs.readFile);

async function main() {
  const data = await readFile('config.json', 'utf8');
  console.log(data);
}
\`\`\`

Node.js 10+ 有了 \`fs.promises\` 后，这个对 fs 不是必须了，但你在使用其他只提供回调风格的库或旧代码时，promisify 就是你的救星。

### promisify 的约定

promisify 期望被转换的函数遵循 Node.js 回调约定：
- 最后一个参数是回调函数
- 回调函数第一个参数是 error（成功则为 null/undefined）
- 回调函数第二个参数是结果值

\`\`\`js
// 符合约定的回调函数
function doSomethingAsync(arg1, arg2, callback) {
  setTimeout(() => {
    try {
      const result = arg1 + arg2;
      callback(null, result);
    } catch (err) {
      callback(err);
    }
  }, 100);
}

const doSomethingPromise = util.promisify(doSomethingAsync);
const result = await doSomethingPromise(1, 2); // 3
\`\`\`

### 自定义 promisify 行为

有些函数的回调不止两个参数（err, result），或者调用约定特殊。你可以给函数挂载一个 \`util.promisify.custom\` 属性，自定义 promisify 后的行为：

\`\`\`js
function weirdFunction(data, callback) {
  callback(null, data.status, data.message, data.extra); // 回调多参数
}

weirdFunction[util.promisify.custom] = (data) => {
  return new Promise((resolve) => {
    weirdFunction(data, (err, status, message, extra) => {
      resolve({ status, message, extra }); // 把多参数包装成对象返回
    });
  });
};
\`\`\`

---

## util.callbackify：Promise 转回调

这是 promisify 的逆操作：把 async 函数（返回 Promise）转成错误优先回调风格的函数。在你需要把 Promise 风格 API 暴露给只能用回调的旧代码时有用。

\`\`\`js
async function fetchData() {
  return 'hello';
}

const fetchDataCallback = util.callbackify(fetchData);
fetchDataCallback((err, result) => {
  console.log(result); // 'hello'
});
\`\`\`

如果 Promise reject，err 参数就是那个错误；如果 resolve，err 是 null，result 是 resolve 的值。

---

## util.inherits：原型继承（ES6 前的遗产）

\`util.inherits(constructor, superConstructor)\` 是在 ES6 \`class\` 和 \`extends\` 出现之前，Node.js 实现原型继承的标准方式。

\`\`\`js
const util = require('util');
const EventEmitter = require('events');

// 老派写法（ES5）
function MyStream() {
  EventEmitter.call(this);
}
util.inherits(MyStream, EventEmitter);

MyStream.prototype.write = function(data) {
  this.emit('data', data);
};
\`\`\`

现在有了 ES6 class，强烈建议用 \`extends\`：
\`\`\`js
class MyStream extends EventEmitter {
  write(data) {
    this.emit('data', data);
  }
}
\`\`\`

但你仍然会在很多老代码和 Node.js 内部代码中看到 util.inherits，了解它有助于阅读源码。

---

## util.inspect：自定义对象检查

\`util.inspect(object[, options])\` 把任意对象转成字符串形式，用于调试打印。它比 \`JSON.stringify\` 更强大：
- 能处理循环引用（JSON.stringify 会报错）
- 能打印函数、undefined、Symbol、BigInt
- 支持 ANSI 颜色高亮
- 可控制递归深度、数组元素显示数量等

\`console.log\` 在打印对象时内部就用了 util.inspect。

### 常用选项

| 选项 | 类型 | 默认 | 说明 |
|------|------|------|------|
| \`depth\` | number/null | 2 | 对象递归深度，null 表示无限递归 |
| \`colors\` | boolean | false | 是否输出 ANSI 颜色代码 |
| \`maxArrayLength\` | number/null | 100 | 数组显示多少元素 |
| \`showHidden\` | boolean | false | 是否显示不可枚举属性和Symbol属性 |
| \`compact\` | boolean/number | true | 是否紧凑输出 |
| \`breakLength\` | number | 80 | 单行最长字符数，超过换行 |

\`\`\`js
const obj = {
  a: 1,
  nested: {
    b: 2,
    deeper: { c: 3, evenDeeper: { d: 4 } }
  },
  list: [1,2,3,4,5]
};

console.log(util.inspect(obj, { depth: null, colors: true }));
// 完整打印所有层级，带颜色
\`\`\`

### util.inspect.custom

你可以给对象定义 \`[util.inspect.custom](depth, options)\` 方法，自定义 inspect 时的输出格式：

\`\`\`js
class Password {
  constructor(value) {
    this.value = value;
  }
  [util.inspect.custom]() {
    return 'Password(******)'; // 不泄露密码
  }
}
console.log(new Password('secret123')); // Password(******)
\`\`\`

这在你打印包含敏感信息的对象时非常有用，防止密码、密钥泄露到日志里。

---

## util.format：格式化字符串

\`util.format(format[, ...args])\` 类似 C 语言的 printf，按格式字符串格式化参数：

| 占位符 | 含义 |
|--------|------|
| \`%s\` | 字符串 |
| \`%d\` / \`%i\` | 数字（整数） |
| \`%f\` | 浮点数 |
| \`%j\` | JSON |
| \`%o\` | 对象（inspect格式） |
| \`%O\` | 对象（无格式） |
| \`%%\` | 字面量百分号 |

\`\`\`js
util.format('Hello %s, you are %d years old', 'Alice', 25);
// 'Hello Alice, you are 25 years old'

util.format('My name is %s', 'Bob', 'extra arg');
// 'My name is Bob extra arg'（没有对应占位符的参数用空格拼接）
\`\`\`

\`console.log\` 内部也用了 util.format，所以你写 \`console.log('hello %s', name)\` 时就是它在工作。

---

## util.types：类型判断

\`util.types\` 提供了一组类型判断函数，比 \`typeof\` 和 \`instanceof\` 更准确，专门判断 Node.js 内置类型。

常用方法：
- \`util.types.isDate(value)\`：是否是 Date 对象
- \`util.types.isRegExp(value)\`：是否是正则
- \`util.types.isPromise(value)\`：是否是原生 Promise
- \`util.types.isAsyncFunction(value)\`：是否是 async 函数
- \`util.types.isGeneratorFunction(value)\`：是否是 generator 函数
- \`util.types.isArrayBuffer(value)\`：是否是 ArrayBuffer
- \`util.types.isAnyArrayBuffer(value)\`：是否是 ArrayBuffer 或 SharedArrayBuffer
- \`util.types.isTypedArray(value)\`：是否是 TypedArray
- \`util.types.isUint8Array(value)\`：是否是 Uint8Array
- \`util.types.isSet(value)\`/isMap：是否是 Set/Map
- \`util.types.isProxy(value)\`：是否是 Proxy（注意：这只能判断由当前 realm 创建的 Proxy）
- \`util.types.isNativeError(value)\`：是否是内置 Error 类型（Error/TypeError/RangeError 等）
- \`util.types.isBoxedPrimitive(value)\`：是否是包装类型（new String(), new Number() 等）

\`\`\`js
util.types.isAsyncFunction(async () => {}); // true
util.types.isPromise(Promise.resolve()); // true
util.types.isDate(new Date()); // true
util.types.isUint8Array(Buffer.from('test')); // true
\`\`\`

注意：\`typeof\` 对数组返回 'object'，\`typeof null\` 返回 'object'，很多时候判断不准。\`util.types\` 或者 \`Array.isArray()\`、\`Buffer.isBuffer()\` 这种专用方法更可靠。

---

## 其他实用函数

### util.isDeepStrictEqual(a, b)

深度严格相等比较，比 \`===\` 和 \`assert.deepStrictEqual\` 更方便：

\`\`\`js
util.isDeepStrictEqual({ a: 1 }, { a: 1 }); // true
util.isDeepStrictEqual({ a: 1 }, { a: '1' }); // false（类型不同）
util.isDeepStrictEqual(NaN, NaN); // true（NaN等于NaN！）
\`\`\`

### util.deprecate(fn, msg)

标记一个函数为"已废弃"，调用时打印警告（只打印一次），用于提示用户迁移 API：

\`\`\`js
const oldFunction = util.deprecate(() => {
  console.log('doing old thing');
}, 'oldFunction() is deprecated, use newFunction() instead');

oldFunction(); // 第一次调用打印 DeprecationWarning
oldFunction(); // 不重复警告
\`\`\`

### util.getSystemErrorName(errno)

根据错误码数字获取系统错误名称：
\`\`\`js
util.getSystemErrorName(-2); // 'ENOENT'（没有这个文件或目录）
\`\`\`

这在你拿到错误对象的 \`err.errno\` 字段时有用，可以判断具体是什么系统错误。

### TextEncoder / TextDecoder

util 模块还提供了 WHATWG 标准的 TextEncoder 和 TextDecoder：
\`\`\`js
const encoder = new util.TextEncoder();
const decoder = new util.TextDecoder('utf8');
const buf = encoder.encode('你好');
console.log(decoder.decode(buf));
\`\`\`

它们和浏览器端的 API 一致，在 Node.js 中也可以直接从全局获取（TextEncoder/TextDecoder 现在是全局可用的）。TextDecoder 类似我们之前讲过的 StringDecoder，用于把 Buffer 解码成字符串，并且正确处理多字节字符被分割的情况。

---

## util 模块总结

虽然 ES6+ 提供了 class、Promise、Object.assign 等原生能力，但 util 模块仍然有一些不可替代的工具：

| 函数 | 核心用途 |
|------|---------|
| util.promisify | 回调转 Promise，async/await 兼容旧代码 |
| util.callbackify | Promise 转回调 |
| util.inspect | 调试打印对象，支持颜色、深度、自定义格式 |
| util.format | printf 风格字符串格式化 |
| util.types | 精确判断 Node.js 内置类型 |
| util.isDeepStrictEqual | 深度严格比较 |
| util.deprecate | 标记废弃 API |
| util.inherits | 原型继承（历史遗留，建议用 class extends） |

util 模块就是这些小工具的集合，每个都很简单但很实用，是 Node.js 开发中经常用到的"工具箱"。`,
    code: `const util = require('util');

console.log('=== util 模块实用工具函数 ===\\n');

// ========== 1. util.promisify 回调转Promise ==========
console.log('===== 1. util.promisify 演示 =====\\n');

// 模拟一个传统的"错误优先回调"风格函数
function delayCallback(ms, callback) {
  if (typeof ms !== 'number' || ms < 0) {
    callback(new TypeError('ms must be a non-negative number'));
    return;
  }
  setTimeout(() => {
    callback(null, \`等待了 \${ms}ms\`);
  }, ms);
}

// 用 promisify 转成 Promise 风格
const delayPromise = util.promisify(delayCallback);

console.log('用 promisify 把回调函数转成 Promise...');
delayPromise(50).then(result => {
  console.log('Promise 结果:', result);
  console.log('这样就可以用 async/await 了');
  console.log('');
});

// ========== 2. 自定义promisify的使用 ==========

// ========== 3. util.inspect 对象检查 ==========
console.log('===== 2. util.inspect 对象检查演示 =====\\n');

const deepObj = {
  name: 'test',
  level1: {
    a: 1,
    level2: {
      b: 2,
      level3: {
        c: 3,
        level4: { d: 4, secret: 'hidden' }
      }
    }
  },
  list: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  fn: function hello() { return 'hi'; },
  sym: Symbol('test')
};

console.log('默认 inspect（depth=2）:');
console.log(util.inspect(deepObj));
console.log('');

console.log('depth=null（无限深度）+ compact模式:');
console.log(util.inspect(deepObj, { depth: null, compact: false, maxArrayLength: 5 }));
console.log('');

// 自定义 inspect.custom - 隐藏敏感信息
class User {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }
  [util.inspect.custom]() {
    return \`User { username: '\${this.username}', password: '******' }\`;
  }
}

const user = new User('alice', 'mysecret123');
console.log('自定义inspect输出（隐藏密码）:', util.inspect(user));
console.log('');

// ========== 4. util.format 格式化 ==========
console.log('===== 3. util.format 字符串格式化 =====\\n');

console.log(util.format('Hello %s, you are %d years old', 'Alice', 28));
console.log(util.format('Pi is approximately %f', Math.PI));
console.log(util.format('Object: %j', { a: 1, b: 2 }));
console.log(util.format('Multiple args:', 1, 2, 3, 'end'));
console.log('console.log 内部就用了 util.format!');
console.log('');

// ========== 5. util.types 类型判断 ==========
console.log('===== 4. util.types 类型判断 =====\\n');

const testValues = [
  ['async function', async () => {}],
  ['Promise.resolve()', Promise.resolve()],
  ['new Date()', new Date()],
  ['/regex/', /abc/],
  ['new Map()', new Map()],
  ['new Set()', new Set()],
  ['Buffer', Buffer.from('test')],
  ['Uint8Array', new Uint8Array(3)],
  ['new Error()', new Error('test')],
  ['[]', []],
  ['{}', {}],
  ['null', null],
  ['42', 42],
];

console.log('值'.padEnd(28), 'isAsyncFn'.padEnd(12), 'isPromise'.padEnd(12), 'isDate'.padEnd(10), 'isUint8Arr');
console.log('-'.repeat(70));
for (const [name, val] of testValues) {
  console.log(
    name.padEnd(28),
    String(util.types.isAsyncFunction(val)).padEnd(12),
    String(util.types.isPromise(val)).padEnd(12),
    String(util.types.isDate(val)).padEnd(10),
    util.types.isUint8Array(val)
  );
}
console.log('');

console.log('特别注意: util.types.isUint8Array(Buffer) =', util.types.isUint8Array(Buffer.from('x')));
console.log('因为 Buffer 是 Uint8Array 的子类，所以是 true');
console.log('');

// ========== 6. util.isDeepStrictEqual 深度比较 ==========
console.log('===== 5. util.isDeepStrictEqual 深度比较 =====\\n');

const objA = { a: 1, b: { c: 2, d: [3, 4] } };
const objB = { a: 1, b: { c: 2, d: [3, 4] } };
const objC = { a: 1, b: { c: '2', d: [3, 4] } };

console.log('objA 与 objB 深度相等:', util.isDeepStrictEqual(objA, objB));
console.log('objA 与 objC 深度相等:', util.isDeepStrictEqual(objA, objC), '(c的类型不同: number vs string)');
console.log('NaN === NaN:', NaN === NaN, '(=== 不相等)');
console.log('isDeepStrictEqual(NaN, NaN):', util.isDeepStrictEqual(NaN, NaN), '(深度比较认为相等)');
console.log('');

// ========== 7. util.callbackify 演示 ==========
console.log('===== 6. util.callbackify Promise转回调 =====\\n');

async function greet(name) {
  return \`Hello, \${name}!\`;
}

const greetCallback = util.callbackify(greet);
greetCallback('World', (err, result) => {
  console.log('callbackify 结果:', result);
  console.log('');
});

// ========== 8. util.deprecate 废弃标记 ==========
console.log('===== 7. util.deprecate 标记废弃函数 =====\\n');

const oldAdd = util.deprecate(
  (a, b) => a + b,
  'oldAdd() is deprecated, please use the new add() instead'
);

console.log('调用废弃函数（第一次会打印警告）:');
const result = oldAdd(1, 2);
console.log('结果:', result);
console.log('再次调用不会重复警告（只警告一次）');
oldAdd(3, 4);
console.log('');

// ========== 9. TextEncoder / TextDecoder ==========
console.log('===== 8. TextEncoder / TextDecoder =====\\n');

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf8');

const text = 'Node.js 工具模块测试！';
const encoded = encoder.encode(text);
console.log('原文:', text);
console.log('编码后 Buffer 长度:', encoded.length, '字节');
console.log('解码后:', decoder.decode(encoded));
console.log('TextEncoder/Decoder 是 WHATWG 标准，浏览器也能用');
console.log('');

// ========== 10. getSystemErrorName ==========
console.log('===== 9. 系统错误名 =====\\n');
console.log('错误码 -1 (EPERM):', util.getSystemErrorName(-1));
console.log('错误码 -2 (ENOENT):', util.getSystemErrorName(-2), '(文件不存在)');
console.log('错误码 -9 (EBADF):', util.getSystemErrorName(-9), '(错误的文件描述符)');
console.log('错误码 -13 (EACCES):', util.getSystemErrorName(-13), '(权限不足)');
console.log('错误码 -17 (EEXIST):', util.getSystemErrorName(-17), '(文件已存在)');
console.log('');

console.log('===== 总结 =====');
console.log('1. util.promisify: 错误优先回调 → Promise（最常用）');
console.log('2. util.callbackify: Promise → 回调');
console.log('3. util.inspect: 对象调试打印，支持颜色/深度/自定义格式');
console.log('4. util.format: printf风格字符串格式化');
console.log('5. util.types: 准确判断各种内置类型');
console.log('6. util.isDeepStrictEqual: 深度严格相等比较（NaN等于NaN）');
console.log('7. util.deprecate: 标记废弃API，一次性警告');
console.log('8. util.inherits: 原型继承（老代码用，新代码用class extends）');
`
  }
];