// =============================================================
// Node.js 运行原理教程（noderun）batch5：第 17-20 章
// -------------------------------------------------------------
// 主题：核心模块与底层机制 + 多进程与性能
//   第 17 章 nr-http          : HTTP 服务器工作原理
//   第 18 章 nr-cluster       : cluster 集群原理
//   第 19 章 nr-worker-threads: worker_threads 真正多线程
//   第 20 章 nr-child-process : 子进程与 IPC 通信
// =============================================================

export const chapters = [
  // ---------------------------------------------------------
  // 第 17 章：HTTP 服务器工作原理
  // ---------------------------------------------------------
  {
    id: "nr-http",
    group: "第四部分 核心模块与底层机制",
    icon: "🌐",
    title: "HTTP 服务器工作原理：从 TCP 到 HTTP",
    content: `## 从 TCP 到 HTTP：Node.js 是怎么接收请求的

写过 Node.js 的人几乎都写过这样几行代码：

\`\`\`js
const http = require("http");
http.createServer((req, res) => {
  res.end("hello");
}).listen(3000);
\`\`\`

看似简单，但这背后其实经历了一整套流程：\`http\` 模块底层基于 \`net\` 模块（也就是 TCP），而 \`net\` 模块又底层依赖 \`libuv\` 提供的网络 IO 能力。也就是说，Node.js 处理 HTTP 请求的链路是：\`libuv 网络 IO → net（TCP）→ http（协议解析）→ 用户回调\`。

理解这条链路，对排查网络问题、做性能优化、做流式处理都非常关键。

## 创建 HTTP 服务器的本质

很多教程说 "createServer 创建了一个 HTTP 服务器"，这句话没错但不够准确。更准确的说法是：**创建 HTTP 服务器的本质，是创建一个 TCP 服务器，并在收到 TCP 数据后按 HTTP 协议格式去解析它**。整个流程可以拆成 6 步：

1. \`http.createServer\` 内部调用 \`net.createServer\`，创建一个 TCP 服务器
2. 服务器调用 \`listen\` 监听端口，等待客户端连接
3. 客户端连接进来，TCP 三次握手建立连接
4. Node.js 通过 libuv 收到 TCP 数据，按 HTTP 协议解析（请求行、请求头、请求体）
5. 解析完成后触发 \`request\` 事件，执行用户传入的回调函数
6. 用户通过 \`response.end()\` 发送响应数据，底层再通过 TCP 写回客户端

换句话说，HTTP 服务器和普通的 TCP 服务器唯一的区别就是：HTTP 服务器在 TCP 数据之上加了一层协议解析。HTTP 协议本身只是一套文本格式约定，它规定了 "请求长什么样、响应长什么样"。

## HTTP 请求的本质：一段符合格式的文本

很多人对 HTTP 请求有种 "神秘感"，觉得它很复杂。其实一个 HTTP 请求就是一段符合 HTTP 协议格式的纯文本，通过 TCP 传输过来。它长这样：

\`\`\`
GET /api/user?id=1 HTTP/1.1
Host: localhost:3000
User-Agent: curl/7.79
Content-Length: 0

\`\`\`

第一行是**请求行**（方法 + 路径 + 协议版本），后面跟着若干**请求头**（每行一个键值对），然后是一个空行，空行后面是**请求体**（GET 请求通常没有请求体）。

Node.js 的 http 模块做的事情，就是把 TCP 收到的这段文本按上面的格式切分，切完后封装成 \`req\` 对象传给你的回调函数。所以不要把 HTTP 想得太神秘——它就是一段约定好格式的文本。

## req 和 res：两个 Stream 对象

在回调函数里你会拿到两个对象 \`req\` 和 \`res\`，它们各自的本质是：

- **req（IncomingMessage）** 是一个 **Readable Stream（可读流）**。请求头部分会被 http 模块直接解析出来（\`req.headers\`、\`req.method\`、\`req.url\`），但请求体是流式到达的，需要通过监听 \`data\` 事件或者用 \`req.pipe()\` 来读取。这也是为什么大文件上传要用流式处理——你不会一次性把整个文件读进内存。
- **res（ServerResponse）** 是一个 **Writable Stream（可写流）**。你调用 \`res.write()\` 写入响应体，调用 \`res.end()\` 表示响应结束。也可以用 \`source.pipe(res)\` 把一个可读流直接 "倒" 进响应里，实现大文件下载零拷贝。

理解 req/res 是 Stream，意味着你可以用所有 Stream 的能力来处理 HTTP：\`pipe\`、\`pipeline\`、背压处理等等。

## 为什么 Node.js 处理 HTTP 性能高

传统的服务器模型（比如 Apache 的 prefork 模式）通常是 "一个请求一个线程"，10000 个并发请求就要 10000 个线程，线程本身有内存开销（默认栈几 MB），系统扛不住。

Node.js 用**单线程 + 事件驱动**的方式：一个主线程处理所有连接，当某个连接有数据可读时，libuv 通知主线程去处理，处理完又回去等其他事件。这样 10000 个连接只是 10000 个文件描述符，几乎不占内存，CPU 也不用在线程间切换。这就是 Node.js 擅长高并发 IO 的根本原因。

## Keep-Alive：复用 TCP 连接

HTTP/1.1 默认开启 Keep-Alive。它的意思是：一次请求响应完成后，TCP 连接不立即关闭，而是保持一段时间，下一个请求可以复用这条连接。这样做的好处是避免了每次请求都走 TCP 三次握手 + 四次挥手，对于大量短请求的场景（比如页面加载几十个静态资源），性能提升非常明显。

Node.js 的 http 模块内置了 Keep-Alive 处理，你不需要自己管理。但在一些极端优化场景下（比如内部服务间高频调用），手动配置 agent 的 \`keepAlive\` 选项能进一步降低延迟。

## 生活类比：餐厅接待

把整个过程想象成一家餐厅：

- **TCP 服务器**是餐厅的大门——负责让顾客进来（建立连接）
- **HTTP 协议**是点餐规则——顾客必须按一定格式说需求（"我要一份宫保鸡丁"），不能瞎说
- **http 模块的协议解析**是前台接待——把顾客说的话记录成结构化信息（菜名、份数、备注）
- **request 事件**是服务员把点菜单转给后厨——也就是触发你的回调函数
- **response**是上菜——后厨做好菜，服务员端给顾客
- **Keep-Alive**是顾客吃完不走，继续点下一道菜——不用重新进店

## 日常开发启示

1. **HTTP 请求就是 TCP 数据**——遇到诡异的网络问题（比如请求被截断、头丢失），可以用 Wireshark 或 tcpdump 抓包看原始 TCP 数据，很多问题会一目了然。
2. **req/res 是 Stream**——大文件上传下载一定要用 \`pipe\` 或 \`pipeline\` 流式处理，千万别 \`fs.readFile\` 整个读进内存再返回，会直接 OOM。
3. **理解 Keep-Alive 的价值**——内部服务间调用开启 keepAlive 能显著降低延迟，但要注意连接复用带来的 "请求串行化" 问题（同一连接上的请求必须按序响应）。
4. **背压（backpressure）**——当客户端下载慢、服务端产出快时，\`pipe\` 会自动处理背压；如果自己手动 \`res.write()\`，一定要检查返回值判断是否需要等待 \`drain\` 事件。

理解了 "HTTP = TCP + 协议解析"，你再看 Node.js 的网络编程会通透很多。`,
    code: `// ============================================================
// 第 17 章：HTTP 服务器工作原理演示
// 注意：沙箱环境不支持真正监听端口，这里用模拟方式展示原理
// ============================================================

const http = require("http");
const net = require("net");
const { Readable, Writable } = require("stream");

// ------------------------------------------------------------
// 演示 1：最简 HTTP 服务器（仅展示结构，不真正 listen）
// ------------------------------------------------------------
console.log("========== 演示 1：最简 HTTP 服务器结构 ==========");

// 这就是 http.createServer 的本质：传入一个 request 回调
const server = http.createServer((req, res) => {
  // req 是 IncomingMessage，继承了 Readable Stream
  console.log("  收到请求:", req.method, req.url);
  console.log("  请求头 Host:", req.headers.host);
  // res 是 ServerResponse，继承了 Writable Stream
  res.end("Hello from Node.js HTTP Server");
});

console.log("  server 已创建（但未 listen）");
console.log("  server 是 http.Server 实例:", server instanceof http.Server);
// 注意：这里不调用 server.listen()，沙箱不支持监听端口
server.close(); // 关闭占用的资源

// ------------------------------------------------------------
// 演示 2：用 net 模块模拟 HTTP 协议解析
// 展示 "HTTP 服务器本质是 TCP + 协议解析"
// ------------------------------------------------------------
console.log("\\n========== 演示 2：手动解析 HTTP 请求文本 ==========");

// 模拟一段客户端发来的原始 HTTP 请求文本（就是 TCP 收到的数据）
const rawHttpRequest =
  "POST /api/login HTTP/1.1\\r\\n" +
  "Host: localhost:3000\\r\\n" +
  "Content-Type: application/json\\r\\n" +
  "Content-Length: 35\\r\\n" +
  "\\r\\n" +
  '{"username":"admin","password":"123"}';

console.log("原始 TCP 数据（HTTP 请求文本）：");
console.log(rawHttpRequest);

// 手动按 HTTP 协议格式解析这段文本
function parseHttpRequest(raw) {
  // 请求头和请求体之间用 \\r\\n\\r\\n 分隔
  const [headSection, bodySection] = raw.split("\\r\\n\\r\\n");
  const lines = headSection.split("\\r\\n");

  // 第一行是请求行：方法 路径 协议版本
  const [method, url, version] = lines[0].split(" ");

  // 后面每一行是一个请求头
  const headers = {};
  for (let i = 1; i < lines.length; i++) {
    const idx = lines[i].indexOf(":");
    const key = lines[i].slice(0, idx).trim();
    const value = lines[i].slice(idx + 1).trim();
    headers[key.toLowerCase()] = value;
  }

  return {
    method,
    url,
    version,
    headers,
    body: bodySection || "",
  };
}

const parsed = parseHttpRequest(rawHttpRequest);
console.log("\\n解析后的结构化请求对象：");
console.log("  方法:", parsed.method);
console.log("  路径:", parsed.url);
console.log("  协议:", parsed.version);
console.log("  请求头:", parsed.headers);
console.log("  请求体:", parsed.body);
console.log("  → 这就是 http 模块帮你做的事：把 TCP 文本解析成 req 对象");

// ------------------------------------------------------------
// 演示 3：req 是 Readable Stream（可读流）
// ------------------------------------------------------------
console.log("\\n========== 演示 3：req 是 Readable Stream ==========");

// 模拟一个 req 对象（真实场景中由 http 模块创建）
const fakeReq = new Readable({ read() {} });
// 模拟请求头（真实 req 会自动解析好）
fakeReq.method = "POST";
fakeReq.url = "/upload";
fakeReq.headers = { "content-type": "text/plain" };

// req 是可读流，可以通过 data 事件读取请求体
let bodyChunks = "";
fakeReq.on("data", (chunk) => {
  bodyChunks += chunk.toString();
  console.log("  [data] 收到一块数据:", chunk.toString());
});
fakeReq.on("end", () => {
  console.log("  [end] 请求体读取完成，完整内容:", bodyChunks);
  console.log("  → 大文件上传就是用这种方式流式读取，不会撑爆内存");
});

// 模拟客户端分块发送请求体
fakeReq.push("第一块数据\\n");
fakeReq.push("第二块数据\\n");
fakeReq.push(null); // null 表示流结束

// ------------------------------------------------------------
// 演示 4：res 是 Writable Stream（可写流）
// ------------------------------------------------------------
console.log("\\n========== 演示 4：res 是 Writable Stream ==========");

// 模拟一个 res 对象（真实场景中由 http 模块创建）
const fakeRes = new Writable({
  write(chunk, encoding, callback) {
    console.log("  [write] 写入响应数据:", chunk.toString().trim());
    callback();
  },
});

// res 是可写流，可以分块写入
fakeRes.write("HTTP/1.1 200 OK\\r\\n");
fakeRes.write("Content-Type: text/plain\\r\\n");
fakeRes.write("\\r\\n");
fakeRes.write("第一段响应内容\\n");
fakeRes.write("第二段响应内容\\n");
fakeRes.end("响应结束");
console.log("  → res.end() 表示响应结束，底层会通过 TCP 发回客户端");

// ------------------------------------------------------------
// 演示 5：Keep-Alive 连接复用示意
// ------------------------------------------------------------
console.log("\\n========== 演示 5：Keep-Alive 连接复用 ==========");

console.log("  无 Keep-Alive（HTTP/1.0 行为）：");
console.log("    请求1 → TCP握手 → 请求响应 → TCP关闭");
console.log("    请求2 → TCP握手 → 请求响应 → TCP关闭");
console.log("    请求3 → TCP握手 → 请求响应 → TCP关闭");
console.log("    （每次都要握手挥手，开销大）");

console.log("\\n  有 Keep-Alive（HTTP/1.1 默认）：");
console.log("    TCP握手 → 请求1响应 → 请求2响应 → 请求3响应 → TCP关闭");
console.log("    （复用同一条 TCP 连接，省去多次握手开销）");

// http.Agent 可以配置 keepAlive
const agent = new http.Agent({ keepAlive: true, maxSockets: 5 });
console.log("\\n  http.Agent keepAlive 配置:", agent.keepAlive);
console.log("  最大连接数:", agent.maxSockets);
console.log("  → 内部服务高频调用时，开启 keepAlive 能显著降低延迟");`
  },

  // ---------------------------------------------------------
  // 第 18 章：cluster 集群原理
  // ---------------------------------------------------------
  {
    id: "nr-cluster",
    group: "第五部分 多进程与性能",
    icon: "🔌",
    title: "cluster 集群原理：如何榨干多核 CPU",
    content: `## Node.js 的"单核之痛"

前面章节反复强调过：Node.js 的主线程只有一个（事件循环跑在一个线程上）。这意味着不管你的服务器是 4 核、8 核还是 64 核，Node.js 默认只能用一个核心。剩下的核心全在 "睡大觉"，这是一种巨大的资源浪费。

对于 IO 密集型应用来说，单核也能扛住很多并发（因为 IO 等待时线程不闲着）。但对于 CPU 密集型任务，或者想要把吞吐量推到机器上限的场景，单核就成了瓶颈。

## cluster 模块的解决方案

\`cluster\` 模块就是 Node.js 给出的官方答案：创建一个**主进程（master）**+ 多个**工作进程（worker）**，每个工作进程跑在独立的 CPU 核心上，共同处理请求。

简单说就是：**用多进程的方式把多个 CPU 核心都用起来**。

最典型的用法长这样：

\`\`\`js
const cluster = require("cluster");
const os = require("os");

if (cluster.isMaster) {
  // 主进程：根据 CPU 核心数 fork 出对应数量的工作进程
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
} else {
  // 工作进程：每个进程都跑一个 HTTP 服务器
  require("http").createServer(/* ... */).listen(3000);
}
\`\`\`

神奇的地方在于：**所有工作进程都 listen 同一个端口 3000**，但不会冲突。这是因为 cluster 做了特殊处理（下面讲）。

## cluster 的底层原理

cluster 的底层依赖 \`child_process.fork\`，主进程通过 fork 创建子进程。但有几个关键细节：

1. **主进程创建多个子进程**——每个子进程是一个完整的 Node.js 实例，有自己的事件循环、自己的内存空间。
2. **主进程负责监听端口**——当工作进程调用 \`listen\` 时，实际上不是工作进程去监听，而是把请求转交给主进程，由主进程统一监听端口。
3. **主进程把连接分发给工作进程**——客户端连接进来后，主进程决定把这个连接交给哪个工作进程处理。
4. **工作进程处理实际请求**——工作进程拿到连接后，执行用户的请求回调，返回响应。

这就是为什么多个工作进程可以 "监听同一个端口"——真正监听端口的只有主进程一个，工作进程只是接收主进程分发过来的连接。

## 两种分发模式

cluster 有两种分发连接的方式：

### 1. Round-robin（轮询，默认）

主进程维护一个工作进程列表，每来一个新连接，就轮流分配给下一个工作进程。比如有 4 个 worker，连接就按 1→2→3→4→1→2→... 的顺序分配。

这是除 Windows 外所有平台的默认行为。优点是**负载均衡**——每个工作进程处理的连接数大致相等，不会出现某个 worker 累死、其他 worker 闲死的情况。

### 2. 共享端口模式

主进程不参与分发，而是让所有工作进程共同竞争同一个监听 socket，谁先拿到连接谁处理。这是 Windows 的默认行为（因为 Windows 的 IOCP 模型适合这种方式）。

缺点很明显：会出现"惊群效应"和负载不均——某个运气好的 worker 可能拿到大部分连接，其他 worker 闲着。所以非 Windows 平台默认不用这种方式。

## 主进程和工作进程的通信

主进程和工作进程是独立的进程，内存不共享，它们通过 **IPC（进程间通信）** 交换消息：

- 主进程 → 工作进程：\`worker.send(msg)\`
- 工作进程 → 主进程：\`process.send(msg)\`
- 接收消息：\`worker.on("message", cb)\` / \`process.on("message", cb)\`

IPC 的底层是基于管道（pipe）实现的，消息会被 JSON 序列化后传输，所以只能传可序列化的数据（不能传函数、Symbol、DOM 对象等）。

## cluster 的优势与劣势

**优势**：
- **利用多核**：把 4 核、8 核都用起来，吞吐量成倍提升
- **进程隔离**：一个 worker 崩溃了，其他 worker 不受影响，主进程可以重启它
- **零代码改动**：业务代码不用改，只要套一层 cluster 就行

**劣势**：
- **内存不共享**：每个 worker 有独立的内存空间，比如你在一个 worker 里缓存了用户数据，其他 worker 看不到。这就要求共享状态必须放到外部存储（Redis 等）。
- **进程创建开销**：fork 一个进程比创建一个线程重得多，每个 worker 都要加载完整的 Node.js 运行时。
- **管理复杂度**：要处理 worker 崩溃重启、优雅关闭、负载监控等。

## 生活类比：连锁店经营

把单进程比作一家只有一名服务员的店，服务员再能干，同一时间也只能服务一桌客人，其他客人要排队。

\`cluster\` 就是开**连锁分店**：

- **总部（master）**负责选址开店、把顾客分配到不同分店
- 每家**分店（worker）**有独立的服务员和库存（内存）
- 分店之间库存不共享——A 店的库存 B 店看不到
- 一家分店倒闭了，总部可以重新开一家，不影响其他分店

这个类比很贴切地说明了 cluster 的本质：**多个独立的进程实例，由主进程统一调度**。

## 日常开发启示

1. **生产环境一定要用 cluster 或 PM2 的 cluster 模式**——单进程跑生产就是浪费多核 CPU。PM2 的 cluster 模式本质上就是对 cluster 模块的封装。
2. **worker 之间内存不共享**——别在一个 worker 里搞内存缓存还指望其他 worker 能读到，要用 Redis 这类外部存储做共享缓存。
3. **理解 PM2 的 cluster 模式**——\`pm2 start app.js -i max\` 就是启动和 CPU 核心数相同的工作进程，底层就是 cluster。
4. **优雅重启**——更新代码时要逐个重启 worker（先停一个、起新的、再停下一个），避免服务中断，这就是所谓的 "零停机重启"。
5. **worker 崩溃要自动重启**——监听 \`exit\` 事件，一旦 worker 挂了立刻 \`cluster.fork()\` 一个新的，保证可用性。

cluster 是 Node.js 走向生产的第一道坎，理解它就能让你的 Node.js 服务真正用满服务器资源。`,
    code: `// ============================================================
// 第 18 章：cluster 集群原理演示
// 注意：沙箱环境不支持真正 fork 进程，这里用模拟方式展示原理
// ============================================================

const os = require("os");
const { EventEmitter } = require("events");

// ------------------------------------------------------------
// 演示 1：查看 CPU 核心数（cluster 通常按核心数 fork）
// ------------------------------------------------------------
console.log("========== 演示 1：CPU 核心数 ==========");
const cpus = os.cpus();
console.log("  CPU 型号:", cpus[0].model);
console.log("  CPU 核心数:", cpus.length);
console.log("  → cluster 通常 fork 和核心数相同的 worker");

// ------------------------------------------------------------
// 演示 2：模拟 cluster 的主进程/工作进程结构
// ------------------------------------------------------------
console.log("\\n========== 演示 2：模拟 cluster 工作流程 ==========");

// 用 EventEmitter 模拟 cluster 模块的核心 API
class MockCluster extends EventEmitter {
  constructor() {
    super();
    this.workers = new Map();
    this.isMaster = true; // 当前是主进程
    this.isWorker = false;
    this._nextId = 1;
  }

  // 模拟 cluster.fork()：创建一个工作进程
  fork() {
    const id = this._nextId++;
    const worker = new MockWorker(id);
    this.workers.set(id, worker);
    console.log("  [master] fork 了工作进程 #" + id);
    // 触发 fork 事件（真实 cluster 也会触发）
    this.emit("fork", worker);
    // 触发 online 事件（worker 启动完成）
    setTimeout(() => this.emit("online", worker), 0);
    return worker;
  }

  // 模拟主进程向工作进程发消息
  sendToWorker(id, msg) {
    const worker = this.workers.get(id);
    if (worker) {
      worker.emit("message", msg);
    }
  }
}

// 模拟工作进程
class MockWorker extends EventEmitter {
  constructor(id) {
    super();
    this.id = id;
    this.isDead = false;
  }

  // 主进程调用：向工作进程发消息
  send(msg) {
    console.log("  [master → worker #" + this.id + "] 发送:", msg);
    // 工作进程会触发 message 事件
    this.emit("message", msg);
  }

  // 工作进程调用：向主进程发消息（这里用回调模拟）
  sendToMaster(msg) {
    console.log("  [worker #" + this.id + " → master] 发送:", msg);
  }

  // 模拟工作进程崩溃
  kill() {
    this.isDead = true;
    console.log("  [worker #" + this.id + "] 崩溃了！");
  }
}

// 模拟主进程逻辑
const cluster = new MockCluster();

// 主进程：根据 CPU 核心数 fork worker（这里限制为 4 个方便演示）
const workerCount = Math.min(cpus.length, 4);
console.log("  主进程启动，准备 fork " + workerCount + " 个 worker");

for (let i = 0; i < workerCount; i++) {
  const worker = cluster.fork();

  // 监听 worker 的消息（工作进程 → 主进程）
  worker.on("message", (msg) => {
    console.log("  [master] 收到 worker #" + worker.id + " 的消息:", msg);
  });
}

// 监听 worker 退出事件，自动重启
cluster.on("exit", (worker, code) => {
  console.log("  [master] worker #" + worker.id + " 退出，code=" + code);
  console.log("  [master] 自动重启一个新的 worker...");
  cluster.fork();
});

// ------------------------------------------------------------
// 演示 3：主进程和工作进程的通信
// ------------------------------------------------------------
console.log("\\n========== 演示 3：主进程 ↔ 工作进程通信 ==========");

// 主进程向所有 worker 发消息
for (const [id, worker] of cluster.workers) {
  // 模拟 process.send（主进程 → 工作进程）
  worker.send({ type: "config", data: { maxConnections: 1000 } });

  // 模拟工作进程回复（工作进程 → 主进程）
  setTimeout(() => {
    worker.sendToMaster({ type: "ready", workerId: id });
  }, 10);
}

// ------------------------------------------------------------
// 演示 4：Round-robin 负载均衡
// ------------------------------------------------------------
console.log("\\n========== 演示 4：Round-robin 负载均衡 ==========");

// 模拟主进程按 round-robin 分发连接
const workerIds = Array.from(cluster.workers.keys());
let roundRobinIndex = 0;
const connectionCounts = new Map();
for (const id of workerIds) connectionCounts.set(id, 0);

console.log("  可用 worker:", workerIds);

// 模拟 10 个客户端连接进来
console.log("  模拟 10 个连接分发：");
for (let i = 1; i <= 10; i++) {
  const targetId = workerIds[roundRobinIndex % workerIds.length];
  connectionCounts.set(targetId, connectionCounts.get(targetId) + 1);
  console.log("    连接 #" + i + " → worker #" + targetId);
  roundRobinIndex++;
}

console.log("  各 worker 处理的连接数：");
for (const [id, count] of connectionCounts) {
  console.log("    worker #" + id + ": " + count + " 个连接");
}
console.log("  → round-robin 保证负载大致均衡");

// ------------------------------------------------------------
// 演示 5：worker 崩溃与自动重启
// ------------------------------------------------------------
console.log("\\n========== 演示 5：worker 崩溃与自动重启 ==========");

// 模拟第一个 worker 崩溃
const firstWorker = cluster.workers.get(workerIds[0]);
console.log("  模拟 worker #" + firstWorker.id + " 崩溃...");
firstWorker.kill();
// 触发 exit 事件，cluster 会自动重启
cluster.emit("exit", firstWorker, 1);

console.log("  → cluster 的进程隔离优势：一个 worker 挂了不影响其他");
console.log("  → 主进程监听 exit 事件自动重启，保证服务可用");

// ------------------------------------------------------------
// 演示 6：cluster vs 单进程的吞吐量对比（概念）
// ------------------------------------------------------------
console.log("\\n========== 演示 6：单进程 vs cluster 吞吐量 ==========");
console.log("  单进程（1 核）：   吞吐量 ≈ 1000 req/s（CPU 打满）");
console.log("  cluster 4 worker： 吞吐量 ≈ 3800 req/s（4 核都用上）");
console.log("  → 接近线性提升（少量调度开销）");
console.log("  → 注意：worker 内存独立，4 个 worker 内存占用也是 4 倍");`
  },

  // ---------------------------------------------------------
  // 第 19 章：worker_threads
  // ---------------------------------------------------------
  {
    id: "nr-worker-threads",
    group: "第五部分 多进程与性能",
    icon: "🧵",
    title: "worker_threads：Node.js 的真正多线程",
    content: `## CPU 密集型任务的困境

前面讲事件循环时反复提到过一个痛点：**Node.js 主线程一旦被 CPU 密集型任务占用，整个事件循环就会卡住**，所有 IO 请求、所有定时器、所有用户响应都会被阻塞。

比如你写了一个计算斐波那契数列的函数，算第 45 项要花 3 秒。在这 3 秒里，你的 HTTP 服务器一个请求都响应不了——即使有 1000 个用户在等待，主线程也只能等这个计算跑完。

\`cluster\` 模块能部分缓解这个问题：把计算任务分到不同进程。但 cluster 有两个明显不足：

1. **进程开销大**：每个 worker 都是完整的 Node.js 实例，占几十 MB 内存
2. **内存不共享**：worker 之间传数据要序列化拷贝，大数据传输开销大

\`worker_threads\` 模块就是为了解决这两个问题而生的。

## worker_threads：真正的多线程

\`worker_threads\` 是 Node.js 10 引入的模块（Node 12 才稳定），它让 Node.js 拥有了**真正的多线程能力**。和 cluster 的多进程不同，worker_threads 创建的是**线程**，线程之间可以共享内存。

注意：这里说的 "多线程" 是指**工作线程**，Node.js 主线程（事件循环）依然是单线程的。worker_threads 是在主线程之外另起若干个线程跑 JS 代码，主线程和工作线程之间通过消息通信。

## 核心概念

worker_threads 有 4 个核心概念，理解了它们就理解了整个模块：

### 1. Worker

\`Worker\` 类代表一个工作线程实例。你 new 一个 Worker，传入一个 JS 文件路径或代码字符串，它就会在独立线程里执行这段代码。

\`\`\`js
const { Worker } = require("worker_threads");
const worker = new Worker("./heavy-task.js");
\`\`\`

### 2. MessagePort

\`MessagePort\` 是线程间通信的管道，类似一个双向消息通道。主线程和 worker 各持有一端，可以互相发消息。每个 Worker 默认就有一对 MessagePort（主线程端是 \`worker\`，worker 端是 \`parentPort\`）。

### 3. SharedArrayBuffer

这是 worker_threads 最强大的特性：**多线程共享的内存区域**。主线程创建一个 SharedArrayBuffer，传给多个 worker，所有线程操作的是同一块内存，无需拷贝。这对大数据处理（比如图像处理、矩阵运算）非常关键。

但共享内存带来并发问题：多个线程同时读写同一块内存会数据竞争，需要用 \`Atomics\` 提供的原子操作来同步。

### 4. parentPort

工作线程内部用 \`parentPort\` 和主线程通信：

\`\`\`js
// 工作线程内部
const { parentPort } = require("worker_threads");
parentPort.on("message", (msg) => { /* 收到主线程消息 */ });
parentPort.postMessage("我算完了");
\`\`\`

## worker_threads vs cluster

很多人分不清 worker_threads 和 cluster 该用哪个，核心区别是：

| 对比项 | cluster | worker_threads |
|--------|---------|----------------|
| 单位 | 进程 | 线程 |
| 内存 | 独立，不共享 | 可共享（SharedArrayBuffer） |
| 通信方式 | IPC（JSON 序列化） | postMessage / 共享内存 |
| 通信开销 | 大（序列化 + 拷贝） | 小（共享内存零拷贝） |
| 创建开销 | 大（fork 进程） | 小（创建线程） |
| 适用场景 | IO 密集型（HTTP 服务） | CPU 密集型（计算） |

简单记忆：**cluster 适合搭 HTTP 服务（隔离 + 多核），worker_threads 适合做计算（共享 + 轻量）**。

## 通信方式

worker_threads 有两种通信方式：

### 1. postMessage（消息传递）

\`postMessage\` 发送的消息默认会被**结构化克隆**（类似深拷贝），所以发一个 10MB 的对象就要拷贝 10MB。适合小数据、简单消息。

### 2. SharedArrayBuffer（共享内存）

主线程创建 SharedArrayBuffer，通过 workerData 传给 worker，worker 直接操作这块内存，主线程立刻能看到结果。**零拷贝**，但要自己处理并发（用 Atomics）。

## 生活类比：工厂车间

把 cluster 比作开多家工厂：每家工厂独立运营，有自己的仓库（内存），工厂之间要调货得通过快递（IPC），慢且贵。

\`worker_threads\` 是**一个工厂里开多条生产线**：

- 所有生产线在同一个工厂里，可以共用工具和原料（共享内存）
- 生产线之间递东西很快（共享内存零拷贝）
- 但多人同时改同一个零件要排队（并发同步）

## 日常开发启示

1. **CPU 密集型任务一定要用 worker_threads**——比如图片处理、加密计算、大数据排序、AI 推理。别让主线程被卡住。
2. **用 SharedArrayBuffer 共享大数据**——传一个 100MB 的 Float32Array，用 postMessage 要拷贝 100MB，用 SharedArrayBuffer 是零拷贝。
3. **worker_threads 不适合大量 IO**——IO 事件循环已经处理得很好了，把 IO 放到 worker 里反而增加线程切换开销。
4. **注意并发安全**——多个 worker 同时写 SharedArrayBuffer 会出现数据竞争，要用 \`Atomics\` 或锁来同步。
5. **不要滥用**——worker 创建也有开销，对于很快能算完的任务（几毫秒），直接在主线程算就行，开 worker 反而更慢。

worker_threads 不是要替代 cluster，而是补足 cluster 在 CPU 密集型场景下的短板。两者搭配用，Node.js 就能同时应对高并发 IO 和重计算。`,
    code: `// ============================================================
// 第 19 章：worker_threads 多线程原理演示
// 注意：沙箱环境无法真正 new Worker，这里用事件模拟通信模式
// ============================================================

const { EventEmitter } = require("events");

// ------------------------------------------------------------
// 演示 1：CPU 密集型任务阻塞事件循环的问题
// ------------------------------------------------------------
console.log("========== 演示 1：CPU 密集型任务阻塞事件循环 ==========");

// 一个低效的斐波那契计算（CPU 密集型）
function fib(n) {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}

console.log("  开始计算 fib(35)...");
const start = Date.now();
const result = fib(35); // 这会占用 CPU 较长时间
const cost = Date.now() - start;
console.log("  fib(35) = " + result + "，耗时 " + cost + "ms");

console.log("  → 在这段时间里，事件循环完全卡住");
console.log("  → 所有 setTimeout、IO 回调、HTTP 请求都会被阻塞");
console.log("  → 解决方案：把这种任务丢到 worker_threads 里");

// ------------------------------------------------------------
// 演示 2：模拟 worker_threads 的通信模式
// ------------------------------------------------------------
console.log("\\n========== 演示 2：模拟 worker 通信（postMessage） ==========");

// 用 EventEmitter 模拟 Worker 类
class MockWorker extends EventEmitter {
  constructor() {
    super();
    this._parentPort = new EventEmitter(); // 模拟 parentPort
  }

  // 主线程调用：向 worker 发消息
  postMessage(msg) {
    console.log("  [主线程 → worker] 发送任务:", msg);
    // worker 端收到消息（异步，模拟真实行为）
    setTimeout(() => this.emit("message", msg), 0);
  }

  // worker 端调用：向主线程发消息
  postMessageToParent(msg) {
    console.log("  [worker → 主线程] 发送结果:", msg);
    this._parentPort.emit("message", msg);
  }

  // 主线程监听 worker 发来的消息
  onMessage(cb) {
    this._parentPort.on("message", cb);
  }

  terminate() {
    console.log("  [worker] 已终止");
    this.removeAllListeners();
  }
}

// 创建一个模拟 worker
const worker = new MockWorker();

// 主线程监听 worker 发来的消息
worker.onMessage((msg) => {
  console.log("  [主线程] 收到 worker 结果:", msg);
});

// 模拟把计算任务发给 worker
worker.postMessage({ task: "fib", n: 35 });

// 模拟 worker 内部处理（真实场景在独立线程执行）
worker.on("message", (task) => {
  console.log("  [worker] 开始处理任务:", task);
  // 在 worker 线程里做 CPU 密集计算，不阻塞主线程
  const r = fib(task.n);
  // 算完把结果发回主线程
  worker.postMessageToParent({ task: task.task, result: r });
});

// ------------------------------------------------------------
// 演示 3：SharedArrayBuffer 共享内存概念
// ------------------------------------------------------------
console.log("\\n========== 演示 3：SharedArrayBuffer 共享内存 ==========");

// 创建一个共享内存区域（4 个 32 位整数 = 16 字节）
const sharedBuffer = new SharedArrayBuffer(4 * 4);
const sharedArray = new Int32Array(sharedBuffer);

console.log("  创建 SharedArrayBuffer，大小:", sharedBuffer.byteLength, "字节");
console.log("  初始值:", Array.from(sharedArray));

// 模拟多个 worker 操作同一块共享内存
// 真实场景：worker 通过 workerData 拿到 sharedBuffer，直接操作
function mockWorkerWrite(workerId, index, value) {
  console.log("  [worker #" + workerId + "] 写入 sharedArray[" + index + "] = " + value);
  sharedArray[index] = value;
}

mockWorkerWrite(1, 0, 100);
mockWorkerWrite(2, 1, 200);
mockWorkerWrite(3, 2, 300);
mockWorkerWrite(4, 3, 400);

console.log("  所有 worker 写入后，共享内存:", Array.from(sharedArray));
console.log("  → 主线程能立刻看到 worker 写的数据（零拷贝共享）");

// ------------------------------------------------------------
// 演示 4：并发问题与 Atomics 原子操作
// ------------------------------------------------------------
console.log("\\n========== 演示 4：并发问题与 Atomics ==========");

// 模拟多个 worker 同时累加同一个变量
const counterBuffer = new SharedArrayBuffer(4);
const counter = new Int32Array(counterBuffer);

console.log("  模拟 1000 次并发累加（不用 Atomics 会出错）：");
// 不安全的写法（可能丢失更新）
let unsafeCounter = 0;
for (let i = 0; i < 1000; i++) {
  unsafeCounter++; // 非原子操作：读-改-写
}
console.log("  非原子累加结果:", unsafeCounter, "（单线程模拟，多线程会出错）");

// 安全的写法：用 Atomics 原子操作
for (let i = 0; i < 1000; i++) {
  Atomics.add(counter, 0, 1); // 原子加法，不会丢失更新
}
console.log("  Atomics 原子累加结果:", counter[0], "（多线程也安全）");
console.log("  → 共享内存必须用 Atomics 处理并发");

// ------------------------------------------------------------
// 演示 5：worker_threads 真实用法（注释说明）
// ------------------------------------------------------------
console.log("\\n========== 演示 5：worker_threads 真实用法 ==========");

const workerCode = \`
  // 这是 worker 线程内部代码（真实场景放在独立文件）
  const { parentPort, workerData } = require("worker_threads");
  
  // 通过 workerData 接收主线程传入的共享内存
  const shared = new Int32Array(workerData.buffer);
  
  // 监听主线程消息
  parentPort.on("message", (task) => {
    // 在 worker 线程做 CPU 密集计算
    const result = heavyCompute(task.n);
    // 写入共享内存（主线程能立刻看到）
    shared[task.slot] = result;
    // 通知主线程完成
    parentPort.postMessage({ done: true, slot: task.slot });
  });
  
  function heavyCompute(n) {
    // ... 密集计算
    return n * 2;
  }
\`;

console.log("  主线程代码：");
console.log("    const { Worker } = require('worker_threads');");
console.log("    const worker = new Worker('./heavy-task.js');");
console.log("    worker.postMessage({ task: 'compute', n: 35 });");
console.log("    worker.on('message', (msg) => console.log('结果', msg));");
console.log("");
console.log("  worker 线程代码（关键点）：");
console.log("    const { parentPort, workerData } = require('worker_threads');");
console.log("    parentPort.on('message', (task) => { /* 处理 */ });");
console.log("    parentPort.postMessage(result); // 发回结果");
console.log("");
console.log("  worker_threads 适合场景：图片处理、加密、AI 推理、大数据计算");
console.log("  不适合场景：IO 密集型（事件循环已经够好）");`
  },

  // ---------------------------------------------------------
  // 第 20 章：child_process 与 IPC 通信
  // ---------------------------------------------------------
  {
    id: "nr-child-process",
    group: "第五部分 多进程与性能",
    icon: "👨‍👦",
    title: "子进程与 IPC 通信：child_process 原理",
    content: `## child_process：Node.js 的"生子"能力

\`child_process\` 是 Node.js 最基础的多进程模块，前面讲的 \`cluster\` 模块底层就是基于它实现的。简单说，\`child_process\` 让 Node.js 可以**创建子进程、执行系统命令、和子进程通信**。

它的应用场景非常广：

- 执行系统命令（\`git\`、\`npm\`、\`ls\`、\`ffmpeg\`）
- 运行其他 Node.js 脚本并和它通信
- 把 CPU 密集型任务分到子进程
- 调用 Python、Shell 等其他语言的程序

## 四种创建子进程的方式

\`child_process\` 提供了 4 个 API，理解它们的区别是用好这个模块的关键：

### 1. exec：执行命令，缓冲输出

\`exec\` 适合执行简单命令，它会等命令完全执行完，一次性把所有输出收集起来返回。

\`\`\`js
const { exec } = require("child_process");
exec("ls -la", (err, stdout, stderr) => {
  console.log(stdout); // 一次性拿到所有输出
});
\`\`\`

**特点**：使用简单，但有 \`maxBuffer\` 限制（默认 1MB），输出超过会被截断报错。适合输出量小、能快速完成的命令。

### 2. execFile：执行可执行文件

和 \`exec\` 类似，但直接执行一个可执行文件，不经过 shell 解析。更安全（避免 shell 注入），性能略好。

\`\`\`js
const { execFile } = require("child_process");
execFile("node", ["--version"], (err, stdout) => {
  console.log(stdout);
});
\`\`\`

### 3. spawn：执行命令，流式输出

\`spawn\` 是最底层、最灵活的 API。它不会等命令执行完，而是通过**流**实时返回输出，没有大小限制。

\`\`\`js
const { spawn } = require("child_process");
const child = spawn("npm", ["install"]);
child.stdout.on("data", (chunk) => console.log(chunk.toString()));
child.on("exit", (code) => console.log("退出码", code));
\`\`\`

**特点**：适合大量输出、长时间运行的命令（比如 \`npm install\`、\`ffmpeg\` 转码）。

### 4. fork：创建 Node.js 子进程，自动建 IPC

\`fork\` 是 \`spawn\` 的特例，专门用于创建 Node.js 子进程。它会**自动建立 IPC 通道**，让父子进程可以互相发消息。

\`\`\`js
const { fork } = require("child_process");
const child = fork("./worker.js");
child.send({ task: "do something" });
child.on("message", (msg) => console.log("收到", msg));
\`\`\`

这就是 cluster 模块的底层——\`cluster.fork()\` 内部就是调用了 \`child_process.fork()\`。

## exec vs spawn：到底用哪个

这是面试常考题，也是实战中最容易踩坑的地方：

| 对比项 | exec | spawn |
|--------|------|-------|
| 输出方式 | 缓冲，一次性返回 | 流式，实时返回 |
| 大小限制 | 有 maxBuffer（默认 1MB） | 无限制 |
| 使用场景 | 简单命令、输出少 | 大量输出、长时间运行 |
| API 风格 | 回调 | 事件 |
| 底层 | 基于 spawn | 最底层 |

**踩坑提示**：很多人用 \`exec\` 跑 \`npm install\`，结果报 \`maxBuffer exceeded\` 错误，因为 npm 输出太多。这种情况一定要换 \`spawn\`。

## IPC 通信原理

只有 \`fork\` 创建的子进程才有 IPC 通道（\`exec\`、\`spawn\` 默认没有，除非配置 \`stdio\`）。IPC 的原理是：

1. \`fork\` 创建子进程时，自动建立一条管道（pipe）作为 IPC 通道
2. 主进程用 \`child.send(msg)\` 发送消息
3. 子进程用 \`process.on("message", cb)\` 接收
4. 子进程用 \`process.send(msg)\` 发送
5. 主进程用 \`child.on("message", cb)\` 接收

IPC 传输的消息会被 **JSON 序列化/反序列化**，所以：

- **能传**：对象、数组、字符串、数字、布尔值等可 JSON 序列化的数据
- **不能传**：函数、Symbol、循环引用对象、class 实例（会丢失方法）、Buffer（特殊处理）

## 生活类比：公司部门管理

把主进程比作公司**总部**，子进程就是各地的**分公司/办事处**：

- **exec**：派一个人去办事，办完回来一次性汇报（"任务做完了，结果是 xxx"）
- **spawn**：派人去办事，要求实时汇报进度（"开始下载了... 下载了 30%... 50%... 完成"）
- **fork**：设立分公司并装一条专线电话（IPC），总部和分公司随时可以通话
- **IPC 消息序列化**：专线电话只能传"文字"（JSON），不能传实物（函数、对象引用）

这个类比很好地解释了四种方式的差异和 IPC 的限制。

## 日常开发启示

1. **执行系统命令用 exec 或 spawn**——比如调用 \`git\`、\`npm\`、\`ffmpeg\`。输出少用 exec，输出多用 spawn。
2. **运行 Node.js 脚本并通信用 fork**——fork 自动建 IPC，不用自己折腾管道。
3. **注意 IPC 消息是序列化的**——不能传函数、不能传循环引用对象。传 class 实例会丢失原型链上的方法。
4. **exec 有 maxBuffer 限制**——大量输出（比如 \`npm install\`、\`find /\`）一定要用 spawn，别用 exec。
5. **安全问题**——\`exec\` 会经过 shell 解析，如果命令参数来自用户输入，要小心 shell 注入。用 \`execFile\` 或 \`spawn\`（不传 \`shell: true\`）更安全。
6. **进程管理**——子进程可能僵尸、可能崩溃，要监听 \`exit\` 和 \`error\` 事件，做好清理和重启。

child_process 是 Node.js 进阶必备的能力，理解了它，cluster、PM2、构建工具、CI 脚本的底层都能看明白。

---

## 全书总结：Node.js 运行原理 20 章回顾

恭喜你读完了整本《Node.js 运行原理》！这 20 章我们从一个 "Node.js 是什么" 的问题出发，一路深挖到了底层的事件循环、异步编程、模块系统、核心模块和多进程机制。让我们做一个完整的回顾：

### 第一部分：开篇与事件循环（第 1-6 章）
我们认清了 Node.js 的本质——**单线程 + 事件驱动 + 非阻塞 IO**，底层依赖 V8 引擎执行 JS、libuv 提供事件循环。事件循环是 Node.js 的"心脏"，它有 6 个阶段（timers、pending callbacks、poll、check、close callbacks），微任务（process.nextTick、Promise）在每个阶段之间执行。理解事件循环是理解 Node.js 一切行为的基础。

### 第二部分：异步编程原理（第 7-10 章）
我们从回调函数出发，经历了 Promise 的诞生，最终走到 async/await。Promise 解决了回调地狱，async/await 让异步代码看起来像同步。但底层它们都跑在事件循环上——async 函数本质是 Generator + Promise 的语法糖。

### 第三部分：模块系统原理（第 11-14 章）
Node.js 有两套模块系统：CommonJS（同步 require）和 ESM（异步 import）。CommonJS 的 require 是同步加载、运行时解析、有缓存；ESM 是异步加载、静态分析、支持 tree-shaking。理解模块系统才能写出正确的代码组织结构。

### 第四部分：核心模块与底层机制（第 15-17 章）
我们深挖了 Buffer（二进制数据）、Stream（流式处理，背压机制）、HTTP（基于 TCP + 协议解析）。Stream 是 Node.js 处理大数据的核心抽象，背压（backpressure）是流式处理的灵魂。HTTP 服务器本质是 TCP 服务器加一层协议解析，req/res 都是 Stream。

### 第五部分：多进程与性能（第 18-20 章）
cluster 模块用多进程榨干多核 CPU，适合 IO 密集型服务；worker_threads 用多线程处理 CPU 密集型任务，支持共享内存；child_process 是所有多进程能力的底层，提供 exec/spawn/fork 四种方式，IPC 通信基于 JSON 序列化。

### 一条贯穿全书的主线

如果要用一句话总结 Node.js 的设计哲学，那就是：**用单线程的事件循环处理高并发 IO，用多进程/多线程弥补单线程在多核和 CPU 密集型场景下的不足**。

Node.js 不是万能的，它擅长 IO 密集型（网络服务、API、实时通信），不擅长 CPU 密集型（但可以用 worker_threads 补足）。理解这些原理，不是为了背面试题，而是为了在遇到性能问题、诡异 bug、架构选型时，能做出正确的判断。

希望这本教程能让你从"会写 Node.js"进阶到"懂 Node.js"。真正的精通不是记住所有 API，而是理解底层的运作机制——这样面对任何新问题，你都能推演出答案。祝你在 Node.js 的路上越走越远！`,
    code: `// ============================================================
// 第 20 章：child_process 与 IPC 通信原理演示
// 注意：沙箱环境无法真正创建子进程，这里用模拟方式展示原理
// ============================================================

const { EventEmitter } = require("events");

// ------------------------------------------------------------
// 演示 1：四种创建子进程方式的对比
// ------------------------------------------------------------
console.log("========== 演示 1：四种创建子进程方式对比 ==========");

console.log("  ┌─────────────┬────────────┬────────────┬────────────┐");
console.log("  │   方式      │  输出方式   │  大小限制   │   用途     │");
console.log("  ├─────────────┼────────────┼────────────┼────────────┤");
console.log("  │   exec      │  缓冲返回   │  1MB默认    │  简单命令   │");
console.log("  │   execFile  │  缓冲返回   │  1MB默认    │  执行文件   │");
console.log("  │   spawn     │  流式返回   │  无限制     │  大量输出   │");
console.log("  │   fork      │  流式+IPC   │  无限制     │  Node子进程│");
console.log("  └─────────────┴────────────┴────────────┴────────────┘");

// 模拟 exec：等命令执行完，一次性返回所有输出
function mockExec(command, callback) {
  console.log("  [exec] 执行命令:", command);
  // 模拟命令执行过程（累积所有输出）
  let stdout = "";
  const outputs = ["开始执行\\n", "处理中...\\n", "完成\\n"];
  let i = 0;
  const timer = setInterval(() => {
    stdout += outputs[i];
    i++;
    if (i >= outputs.length) {
      clearInterval(timer);
      // 一次性返回所有输出（exec 的特点）
      callback(null, stdout, "");
    }
  }, 50);
}

// 模拟 spawn：通过流实时返回输出
function mockSpawn(command, args) {
  console.log("  [spawn] 执行命令:", command, args);
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  // 流式返回输出（spawn 的特点）
  const outputs = ["开始执行\\n", "处理中...\\n", "完成\\n"];
  let i = 0;
  const timer = setInterval(() => {
    if (i < outputs.length) {
      child.stdout.emit("data", Buffer.from(outputs[i]));
      i++;
    } else {
      clearInterval(timer);
      child.emit("exit", 0);
    }
  }, 50);
  return child;
}

console.log("\\n--- exec 演示（缓冲输出）---");
mockExec("npm install", (err, stdout, stderr) => {
  console.log("  [exec 回调] 一次性拿到所有输出:");
  console.log("  " + stdout.replace(/\\n/g, "\\n  "));
});

console.log("\\n--- spawn 演示（流式输出）---");
const spawnChild = mockSpawn("npm", ["install"]);
spawnChild.stdout.on("data", (chunk) => {
  console.log("  [spawn data] 实时输出:", chunk.toString().trim());
});
spawnChild.on("exit", (code) => {
  console.log("  [spawn exit] 退出码:", code);
});

// ------------------------------------------------------------
// 演示 2：exec 的 maxBuffer 问题
// ------------------------------------------------------------
console.log("\\n========== 演示 2：exec 的 maxBuffer 问题 ==========");

// 模拟 exec 的 maxBuffer 限制
function mockExecWithBuffer(command, maxBuffer) {
  let buffer = "";
  const data = "这是一行很长的输出".repeat(100);
  // 模拟大量输出
  for (let i = 0; i < 10; i++) {
    buffer += data;
    if (buffer.length > maxBuffer) {
      return { error: "maxBuffer exceeded", buffer };
    }
  }
  return { error: null, buffer };
}

console.log("  maxBuffer 默认值: 1024 * 1024 = 1MB");
console.log("  模拟大量输出场景：");

const smallBufferResult = mockExecWithBuffer("find /", 1024);
if (smallBufferResult.error) {
  console.log("  ❌ 输出超过 maxBuffer，报错:", smallBufferResult.error);
  console.log("  → 解决方案：改用 spawn，没有大小限制");
}

console.log("  ✅ spawn 通过流式输出，无论输出多大都不会报错");

// ------------------------------------------------------------
// 演示 3：fork 与 IPC 通信
// ------------------------------------------------------------
console.log("\\n========== 演示 3：fork 与 IPC 通信 ==========");

// 模拟 fork 创建的子进程（带 IPC 通道）
class MockChildProcess extends EventEmitter {
  constructor() {
    super();
    this.pid = Math.floor(Math.random() * 10000) + 1000;
    this.connected = true;
  }

  // 主进程 → 子进程：child.send()
  send(msg) {
    console.log("  [父 → 子 pid=" + this.pid + "] 发送:", JSON.stringify(msg));
    // 模拟子进程收到消息（触发 process.on('message')）
    setTimeout(() => this.emit("message-to-child", msg), 10);
  }

  // 子进程 → 主进程：process.send()（子进程内部调用）
  sendToParent(msg) {
    console.log("  [子 pid=" + this.pid + " → 父] 发送:", JSON.stringify(msg));
    // 父进程监听 message 事件
    setTimeout(() => this.emit("message", msg), 10);
  }

  disconnect() {
    this.connected = false;
    console.log("  [pid=" + this.pid + "] IPC 通道已断开");
  }

  kill() {
    console.log("  [pid=" + this.pid + "] 进程被杀死");
    this.emit("exit", 1, null);
  }
}

// 模拟 fork 创建子进程
function mockFork(modulePath) {
  console.log("  [fork] 创建子进程执行:", modulePath);
  const child = new MockChildProcess();
  console.log("  [fork] 子进程 pid:", child.pid);
  console.log("  [fork] 已自动建立 IPC 通道");
  return child;
}

const child = mockFork("./worker.js");

// 主进程监听子进程消息
child.on("message", (msg) => {
  console.log("  [父] 收到子进程消息:", JSON.stringify(msg));
});

// 主进程向子进程发消息
child.send({ type: "task", data: "计算斐波那契" });

// 模拟子进程处理完任务后回复
child.on("message-to-child", (msg) => {
  console.log("  [子] 收到任务:", msg.type);
  // 子进程处理完，发回结果
  setTimeout(() => {
    child.sendToParent({ type: "result", data: "fib(30) = 832040" });
  }, 50);
});

// 监听子进程退出
child.on("exit", (code) => {
  console.log("  [父] 子进程退出，code:", code);
});

// ------------------------------------------------------------
// 演示 4：IPC 消息序列化的限制
// ------------------------------------------------------------
console.log("\\n========== 演示 4：IPC 消息序列化限制 ==========");

// IPC 消息会被 JSON.stringify，所以有这些限制
const testCases = [
  { name: "普通对象", value: { a: 1, b: "hello" }, canSend: true },
  { name: "数组", value: [1, 2, 3], canSend: true },
  { name: "字符串/数字", value: "hello", canSend: true },
  { name: "函数", value: function fn() {}, canSend: false },
  { name: "Symbol", value: Symbol("x"), canSend: false },
  { name: "循环引用对象", value: null, canSend: false },
];

// 构造循环引用
const circular = { a: 1 };
circular.self = circular;
testCases[5].value = circular;

console.log("  IPC 消息会被 JSON 序列化，以下数据测试：");
for (const tc of testCases) {
  let canSerialize = true;
  try {
    JSON.stringify(tc.value);
  } catch (e) {
    canSerialize = false;
  }
  const actual = canSerialize && tc.canSend;
  console.log("    " + tc.name + ": " + (actual ? "✅ 可发送" : "❌ 不可发送"));
}
console.log("  → 函数、Symbol、循环引用对象不能通过 IPC 传输");
console.log("  → class 实例可以发送但会丢失原型链方法");

// ------------------------------------------------------------
// 演示 5：spawn 流式输出的优势（大量数据场景）
// ------------------------------------------------------------
console.log("\\n========== 演示 5：spawn 流式输出优势 ==========");

// 模拟 spawn 处理大量输出（比如 ffmpeg 转码日志）
console.log("  场景：执行 ffmpeg 转码，输出大量进度日志");
console.log("  用 exec：等待所有输出累积，可能超过 maxBuffer 报错");
console.log("  用 spawn：实时接收，可以边接收边显示进度");

const ffmpegChild = new EventEmitter();
ffmpegChild.stdout = new EventEmitter();

let receivedLines = 0;
ffmpegChild.stdout.on("data", (chunk) => {
  receivedLines++;
  if (receivedLines % 20 === 0) {
    console.log("  [spawn] 已接收 " + receivedLines + " 行输出...");
  }
});
ffmpegChild.on("exit", (code) => {
  console.log("  [spawn] 转码完成，共接收 " + receivedLines + " 行，退出码 " + code);
});

// 模拟 ffmpeg 输出 100 行进度
let line = 0;
const interval = setInterval(() => {
  if (line < 100) {
    ffmpegChild.stdout.emit("data", Buffer.from("frame=" + line + " fps=30\\n"));
    line++;
  } else {
    clearInterval(interval);
    ffmpegChild.emit("exit", 0);
  }
}, 5);

// ------------------------------------------------------------
// 演示 6：child_process 是 cluster 的底层
// ------------------------------------------------------------
console.log("\\n========== 演示 6：child_process 与 cluster 的关系 ==========");
console.log("  cluster.fork() 内部调用 child_process.fork()");
console.log("  ┌──────────────┐    fork()     ┌──────────────┐");
console.log("  │  主进程      │ ──────────→  │  工作进程     │");
console.log("  │  (master)    │ ←──────────  │  (worker)     │");
console.log("  └──────────────┘   IPC消息    └──────────────┘");
console.log("  → cluster 就是对 child_process.fork 的封装");
console.log("  → 加上了端口共享、负载均衡、自动重启等能力");
console.log("");
console.log("  四种方式的选用建议：");
console.log("    执行系统命令（git/npm/ls）   → exec 或 spawn");
console.log("    执行可执行文件              → execFile");
console.log("    大量输出/长时间运行          → spawn");
console.log("    运行 Node.js 脚本并通信     → fork");
console.log("");
console.log("🎉 恭喜！《Node.js 运行原理》20 章全部学完！");`
  }
];
