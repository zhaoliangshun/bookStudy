// =============================================================
// Node.js 交互式教程 —— 第十批章节（性能与优化组，共 6 章）
// =============================================================

export const chapters = [

  {
    id: 'node-cluster',
    group: '性能与优化',
    icon: '🏢',
    title: '集群与多进程',
    content: `## 集群与多进程全面指南

Node.js 默认是单线程运行的，一个进程只能使用一个 CPU 核心。在多核服务器上，这意味着大量计算资源被浪费。cluster（集群）模块就是为了解决这个问题而设计的。

### cluster 模块原理

cluster 模块基于 Node.js 的 child_process.fork() 方法，创建多个工作进程（worker），共享同一个服务器端口。架构如下：

\`\`\`
                  ┌─────────────┐
    请求 ────────→│  Master 进程 │
                  │  (端口监听)  │
                  └──┬───┬───┬──┘
              ┌──────┘   │   └──────┐
              ▼          ▼          ▼
        ┌─────────┐┌─────────┐┌─────────┐
        │ Worker 1││ Worker 2││ Worker 3│
        │ (CPU 0) ││ (CPU 1) ││ (CPU 2) │
        └─────────┘└─────────┘└─────────┘
\`\`\`

### Master/Worker 模式

- **Master 进程**：负责管理 worker 进程，不处理业务请求，监听进程事件（exit、fork 等）
- **Worker 进程**：处理实际请求，每个 worker 是独立的 V8 实例，拥有独立的事件循环和内存

### 负载均衡策略

Node.js 的 cluster 模块使用**操作系统级别的负载均衡**（SCHED_RR 轮询调度）。当有新的 TCP 连接到达时，操作系统内核会将它分配给下一个可用的 worker 进程。这比用户态负载均衡更高效。

### 进程间通信（IPC）

Master 和 Worker 之间通过内置的 IPC 通道通信。worker.send() 和 process.on('message') 是主要的通信方式：

\`\`\`javascript
// Master 发送消息给 worker
worker.send({ cmd: 'shutdown', timeout: 5000 });

// Worker 接收消息
process.on('message', function(msg) {
  if (msg.cmd === 'shutdown') {
    // 执行优雅关闭
  }
});
\`\`\`

### 进程守护（自动重启）

当 worker 进程意外退出时（如未捕获的异常），master 应该自动重启它。这是生产环境中的基本要求：

\`\`\`javascript
cluster.on('exit', function(worker, code, signal) {
  if (!worker.exitedAfterDisconnect) {
    // 非主动退出，重启 worker
    cluster.fork();
  }
});
\`\`\`

### 零停机重启（Zero-downtime Restart）

在生产环境中，更新代码时需要不停机重启所有 worker。策略是逐个重启 worker，每次重启一个，等待新 worker 就绪后再重启下一个：

1. 给 worker 发送 SIGTERM 信号
2. Worker 停止接收新请求（server.close()）
3. 等待现有请求处理完成
4. Worker 退出
5. Master 创建新的 worker

### CPU 核心数利用

使用 \`os.cpus().length\` 获取可用核心数，通常 fork 与核心数相同数量的 worker 以达到最佳性能。过多 worker 会导致上下文切换开销，过少则浪费 CPU 资源。

下面代码使用 os 模块和 EventEmitter 模拟 cluster 模式，演示多进程管理和负载均衡。`,
    code: `// ============================================================
// 第一章代码演示：cluster 集群模拟 - 多进程与负载均衡
// ============================================================
// 使用 os 模块和 EventEmitter 模拟 cluster 模式，
// 演示 worker 管理、负载均衡、IPC 通信和进程守护。

var os = require("os");
var EventEmitter = require("events").EventEmitter;

// ============================================================
// 演示 1：系统资源信息
// ============================================================
console.log("===== 演示 1：系统资源信息 =====");

var cpuInfo = os.cpus();
var totalMem = os.totalmem();
var freeMem = os.freemem();

console.log("CPU 核心数: " + cpuInfo.length);
console.log("CPU 型号: " + cpuInfo[0].model);
console.log("总内存: " + (totalMem / 1024 / 1024 / 1024).toFixed(2) + " GB");
console.log("可用内存: " + (freeMem / 1024 / 1024 / 1024).toFixed(2) + " GB");
console.log("系统平台: " + os.platform() + " " + os.arch());
console.log("建议 worker 数量: " + cpuInfo.length);

// ============================================================
// 演示 2：模拟 cluster 主进程
// ============================================================
console.log("\\n===== 演示 2：模拟 cluster Master/Worker 模式 =====");

function ClusterMaster(workerCount) {
  this.workers = {};
  this.workerCount = workerCount;
  this.nextWorkerIndex = 0;
  this.totalRequests = 0;
  this.isShuttingDown = false;
}

// 继承 EventEmitter
ClusterMaster.prototype = Object.create(EventEmitter.prototype);
ClusterMaster.prototype.constructor = ClusterMaster;

// 创建 worker 进程
ClusterMaster.prototype.fork = function () {
  var self = this;
  var workerId = Object.keys(self.workers).length + 1;

  var worker = new SimulatedWorker(workerId);
  self.workers[workerId] = worker;

  console.log("  [Master] fork Worker " + workerId + " (PID: " + worker.pid + ")");

  // 监听 worker 消息
  worker.on("message", function (msg) {
    console.log("  [Master] 收到 Worker " + workerId + " 消息: " + JSON.stringify(msg));
  });

  // 监听 worker 退出
  worker.on("exit", function (code, signal) {
    console.log("  [Master] Worker " + workerId + " 退出 (code=" + code + ", signal=" + (signal || "none") + ")");
    delete self.workers[workerId];

    // 进程守护：非主动退出时自动重启
    if (!worker.exitedAfterDisconnect && !self.isShuttingDown) {
      console.log("  [Master] 检测到异常退出，自动重启 worker...");
      setTimeout(function () {
        self.fork();
      }, 500);
    }
  });

  // 模拟 worker 启动后的就绪通知
  setTimeout(function () {
    worker.emit("listening", { port: 3000, address: "0.0.0.0" });
  }, 100);

  return worker;
};

// 启动所有 worker
ClusterMaster.prototype.startAll = function () {
  var self = this;
  console.log("\\n[Master] 启动集群，fork " + self.workerCount + " 个 worker...");
  for (var i = 0; i < self.workerCount; i++) {
    self.fork();
  }
};

// 轮询负载均衡
ClusterMaster.prototype.getNextWorker = function () {
  var workerIds = Object.keys(this.workers);
  if (workerIds.length === 0) return null;
  var worker = this.workers[workerIds[this.nextWorkerIndex]];
  this.nextWorkerIndex = (this.nextWorkerIndex + 1) % workerIds.length;
  return worker;
};

// 模拟处理请求（负载均衡演示）
ClusterMaster.prototype.dispatchRequest = function (request) {
  var worker = this.getNextWorker();
  if (!worker) {
    console.log("  [Master] 无可用 worker，拒绝请求");
    return;
  }
  this.totalRequests++;
  console.log("  [Master] 请求 #" + this.totalRequests + " (" + request.method + " " + request.url + ") → Worker " + worker.id);
  worker.handleRequest(request);
};

// 零停机重启
ClusterMaster.prototype.rollingRestart = function () {
  var self = this;
  var workerIds = Object.keys(self.workers);
  console.log("\\n[Master] 开始零停机重启 " + workerIds.length + " 个 worker...");

  function restartNext(index) {
    if (index >= workerIds.length) {
      console.log("[Master] 零停机重启完成！所有 worker 已更新");
      return;
    }

    var wid = workerIds[index];
    var oldWorker = self.workers[wid];
    console.log("\\n[Master] 重启 Worker " + wid + " (PID: " + oldWorker.pid + ")");

    // 1. 发送断开信号
    oldWorker.send({ cmd: "disconnect" });
    oldWorker.exitedAfterDisconnect = true;

    // 2. 等待旧 worker 优雅退出
    setTimeout(function () {
      oldWorker.emit("exit", 0, "SIGTERM");

      // 3. 创建新 worker
      self.fork();

      // 4. 等待新 worker 就绪后，继续重启下一个
      setTimeout(function () {
        restartNext(index + 1);
      }, 800);
    }, 500);
  }

  restartNext(0);
};

// 模拟 Worker 进程
function SimulatedWorker(id) {
  this.id = id;
  this.pid = 10000 + id;
  this.exitedAfterDisconnect = false;
  this.requestCount = 0;
  this._events = {};
}

SimulatedWorker.prototype = Object.create(EventEmitter.prototype);
SimulatedWorker.prototype.constructor = SimulatedWorker;

SimulatedWorker.prototype.send = function (msg) {
  console.log("    [Worker " + this.id + "] 收到 IPC 消息: " + JSON.stringify(msg));
};

SimulatedWorker.prototype.handleRequest = function (req) {
  this.requestCount++;
  console.log("    [Worker " + this.id + "] 处理请求: " + req.url + " (累计: " + this.requestCount + ")");
};

// ============================================================
// 演示 3：集群启动与负载均衡
// ============================================================
console.log("\\n===== 演示 3：集群启动与负载均衡 =====");

var cpuCount = os.cpus().length;
var master = new ClusterMaster(cpuCount);
master.startAll();

// 模拟 10 个请求到达，观察负载均衡
setTimeout(function () {
  console.log("\\n--- 模拟请求到达 ---");
  var requests = [
    { method: "GET", url: "/api/users" },
    { method: "GET", url: "/api/products" },
    { method: "POST", url: "/api/orders" },
    { method: "GET", url: "/api/users/1" },
    { method: "PUT", url: "/api/users/1" },
    { method: "GET", url: "/static/main.js" },
    { method: "GET", url: "/static/style.css" },
    { method: "POST", url: "/api/login" },
    { method: "GET", url: "/api/dashboard" },
    { method: "DELETE", url: "/api/orders/5" },
  ];

  requests.forEach(function (req) {
    master.dispatchRequest(req);
  });

  // 统计负载分布
  setTimeout(function () {
    console.log("\\n--- 负载分布统计 ---");
    var workerIds = Object.keys(master.workers);
    workerIds.forEach(function (wid) {
      var w = master.workers[wid];
      console.log("  Worker " + wid + ": " + w.requestCount + " 个请求");
    });
    console.log("  总请求: " + master.totalRequests);
  }, 200);
}, 500);

// ============================================================
// 演示 4：进程守护（自动重启）
// ============================================================
setTimeout(function () {
  console.log("\\n===== 演示 4：进程守护（自动重启） =====");

  // 模拟 worker 2 异常退出（未捕获异常）
  var worker2 = master.workers["2"];
  if (worker2) {
    console.log("[模拟] Worker 2 发生未捕获异常，即将崩溃...");
    worker2.emit("exit", 1, null);
  }
}, 1500);

// ============================================================
// 演示 5：零停机重启
// ============================================================
setTimeout(function () {
  console.log("\\n===== 演示 5：零停机重启 =====");

  // 模拟 3 个请求在重启过程中到达
  setTimeout(function () {
    console.log("  [客户端] 发送请求: GET /api/status");
    master.dispatchRequest({ method: "GET", url: "/api/status" });
  }, 300);

  setTimeout(function () {
    console.log("  [客户端] 发送请求: POST /api/data");
    master.dispatchRequest({ method: "POST", url: "/api/data" });
  }, 1200);

  master.rollingRestart();
}, 3000);

// ============================================================
// 演示 6：IPC 通信
// ============================================================
setTimeout(function () {
  console.log("\\n===== 演示 6：IPC 进程间通信 =====");

  var workerIds = Object.keys(master.workers);
  if (workerIds.length > 0) {
    var w = master.workers[workerIds[0]];
    w.send({ cmd: "health_check", timestamp: Date.now() });
    w.send({ cmd: "get_metrics", fields: ["memory", "cpu", "connections"] });
    w.send({ cmd: "update_config", config: { maxConnections: 1000, timeout: 30000 } });
  }
}, 6000);

// ============================================================
// 演示 7：集群状态监控
// ============================================================
setTimeout(function () {
  console.log("\\n===== 演示 7：集群状态监控 =====");

  console.log("集群运行状态:");
  console.log("  Master PID: " + process.pid);
  console.log("  活跃 Worker 数: " + Object.keys(master.workers).length);
  console.log("  总处理请求数: " + master.totalRequests);

  var workerIds = Object.keys(master.workers);
  console.log("\\n  Worker 详情:");
  console.log("  " + "ID".padEnd(6) + "PID".padEnd(10) + "请求数".padEnd(10) + "状态");
  console.log("  " + "-".repeat(40));
  workerIds.forEach(function (wid) {
    var w = master.workers[wid];
    console.log("  " + String(w.id).padEnd(6) + String(w.pid).padEnd(10) + String(w.requestCount).padEnd(10) + "运行中");
  });

  console.log("\\n===== cluster 集群模拟演示完成 =====");
}, 7000);`,
  },

  {
    id: 'node-compression',
    group: '性能与优化',
    icon: '🗜️',
    title: '数据压缩',
    content: `## 数据压缩全面指南

数据压缩是 Web 性能优化中最基础也最有效的手段之一。通过压缩 HTTP 响应体，可以将传输数据量减少 60%-90%，显著降低带宽消耗和页面加载时间。

### 压缩算法对比

Node.js 的 zlib 模块支持多种压缩算法：

| 算法 | 压缩率 | 速度 | 使用场景 |
| --- | --- | --- | --- |
| **deflate** | 中等 | 快 | 一般 HTTP 响应 |
| **gzip** | 中等偏高 | 中等 | 最通用，兼容性最好 |
| **brotli** | 高 | 慢 | 静态资源，现代浏览器 |
| **deflateRaw** | 中等 | 快 | 无需 zlib 包装时 |

### 压缩级别

压缩级别从 0（不压缩）到 9（最大压缩），默认是 -1（使用默认级别，通常为 6）：

\`\`\`javascript
// 不同压缩级别
zlib.createGzip({ level: 1 });  // 最快，压缩比最低
zlib.createGzip({ level: 6 });  // 默认，平衡
zlib.createGzip({ level: 9 });  // 最慢，压缩比最高
\`\`\`

### 压缩 vs 性能权衡

- **高压缩级别**：CPU 消耗大，但传输数据少。适合静态资源（只压缩一次，缓存后多次使用）
- **低压缩级别**：CPU 消耗小，但传输数据较多。适合动态 API 响应（每次请求都不同）
- **小文件**：压缩小文件（< 1KB）可能得不偿失，压缩开销可能大于传输节省
- **预压缩策略**：在构建时预先压缩静态资源（.gz / .br），运行时直接返回预压缩文件

### HTTP 响应压缩

浏览器通过 Accept-Encoding 请求头告知服务器支持的压缩算法：

\`\`\`
Accept-Encoding: gzip, deflate, br
\`\`\`

服务器根据请求头选择压缩算法，并通过 Content-Encoding 响应头告知客户端：

\`\`\`javascript
// 根据 Accept-Encoding 选择压缩方式
var acceptEncoding = req.headers['accept-encoding'] || '';
if (acceptEncoding.includes('br')) {
  // 使用 Brotli
  res.setHeader('Content-Encoding', 'br');
  var brotli = zlib.createBrotliCompress();
  rawStream.pipe(brotli).pipe(res);
} else if (acceptEncoding.includes('gzip')) {
  // 使用 Gzip
  res.setHeader('Content-Encoding', 'gzip');
  var gzip = zlib.createGzip();
  rawStream.pipe(gzip).pipe(res);
}
\`\`\`

### 流式压缩

对大文件使用流式压缩可以避免将整个文件加载到内存中：

\`\`\`javascript
fs.createReadStream('large-file.json')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('large-file.json.gz'));
\`\`\`

### 压缩性能数据

典型场景下的压缩效果对比（以 1MB JSON 数据为例）：
- 原始大小：1,048,576 bytes
- gzip 默认级别（6）：约 120KB（压缩率 88%）
- gzip 最快级别（1）：约 150KB（压缩率 85%）
- gzip 最高级别（9）：约 110KB（压缩率 89%）
- brotli 默认（11）：约 95KB（压缩率 91%）

下面代码使用 zlib 模块演示 gzip 压缩/解压，对比不同级别和算法的压缩效果。`,
    code: `// ============================================================
// 第二章代码演示：zlib 压缩/解压 - 算法对比与性能分析
// ============================================================
// 使用 zlib 模块演示 gzip 压缩/解压，
// 对比不同压缩级别和算法的效果。

var zlib = require("zlib");
var fs = require("fs");
var path = require("path");
var os = require("os");

// ============================================================
// 演示 1：生成测试数据
// ============================================================
console.log("===== 演示 1：生成测试数据 =====");

// 生成模拟的 JSON 数据（模拟 API 响应）
var sampleData = { users: [] };
var firstNames = ["张", "李", "王", "赵", "陈", "刘", "周", "吴", "徐", "孙"];
var lastNames = ["伟", "芳", "敏", "静", "丽", "强", "磊", "洋", "勇", "军"];
var cities = ["北京", "上海", "广州", "深圳", "杭州", "成都", "南京", "武汉"];

for (var i = 0; i < 500; i++) {
  sampleData.users.push({
    id: i + 1,
    name: firstNames[i % firstNames.length] + lastNames[i % lastNames.length],
    age: 20 + (i % 40),
    city: cities[i % cities.length],
    email: "user" + i + "@example.com",
    bio: "这是用户" + (i + 1) + "的个人简介，包含一些重复的文本来测试压缩效果。Node.js 性能优化中的数据压缩技术可以显著减少传输数据量。",
    tags: ["nodejs", "javascript", "backend", "performance"].slice(0, 1 + (i % 4)),
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  });
}

var rawData = JSON.stringify(sampleData);
var rawSize = Buffer.byteLength(rawData, "utf8");
console.log("生成测试数据: " + sampleData.users.length + " 条用户记录");
console.log("原始数据大小: " + (rawSize / 1024).toFixed(2) + " KB (" + rawSize + " bytes)");

// ============================================================
// 演示 2：gzip 不同压缩级别对比
// ============================================================
console.log("\\n===== 演示 2：gzip 不同压缩级别对比 =====");

var gzipLevels = [1, 3, 5, 6, 9];
var gzipResults = [];

// 辅助函数：同步压缩
function gzipSync(data, level) {
  var buf = Buffer.from(data, "utf8");
  return zlib.gzipSync(buf, { level: level });
}

console.log("\\ngzip 压缩级别对比:");
console.log("级别".padEnd(8) + "压缩后大小".padEnd(16) + "压缩率".padEnd(12) + "相对速度");
console.log("-".repeat(60));

gzipLevels.forEach(function (level) {
  var start = Date.now();
  var compressed = gzipSync(rawData, level);
  var elapsed = Date.now() - start;
  var compressedSize = compressed.length;
  var ratio = ((1 - compressedSize / rawSize) * 100).toFixed(1);

  gzipResults.push({ level: level, size: compressedSize, ratio: ratio, time: elapsed });

  // 相对速度（以最快为基准）
  var fastest = gzipResults[0].time;
  var relSpeed = (fastest / elapsed).toFixed(1);

  console.log(
    String(level).padEnd(8) +
    (compressedSize / 1024).toFixed(1) + " KB".padEnd(12) +
    ratio + "%".padEnd(12) +
    relSpeed + "x"
  );
});

// ============================================================
// 演示 3：不同压缩算法对比
// ============================================================
console.log("\\n===== 演示 3：不同压缩算法对比 =====");

var algorithms = [
  { name: "gzip", fn: function (d) { return zlib.gzipSync(d); } },
  { name: "deflate", fn: function (d) { return zlib.deflateSync(d); } },
  { name: "deflateRaw", fn: function (d) { return zlib.deflateRawSync(d); } },
  { name: "brotliCompress", fn: function (d) { return zlib.brotliCompressSync(d); } },
];

var buf = Buffer.from(rawData, "utf8");

console.log("\\n算法对比（默认级别）:");
console.log("算法".padEnd(18) + "压缩后大小".padEnd(16) + "压缩率".padEnd(12) + "耗时");
console.log("-".repeat(60));

algorithms.forEach(function (algo) {
  var start = Date.now();
  var compressed = algo.fn(buf);
  var elapsed = Date.now() - start;
  var compressedSize = compressed.length;
  var ratio = ((1 - compressedSize / rawSize) * 100).toFixed(1);

  console.log(
    algo.name.padEnd(18) +
    (compressedSize / 1024).toFixed(1) + " KB".padEnd(12) +
    ratio + "%".padEnd(12) +
    elapsed + "ms"
  );
});

// ============================================================
// 演示 4：流式压缩与解压
// ============================================================
console.log("\\n===== 演示 4：流式压缩与解压 =====");

var tmpDir = path.join(os.tmpdir(), "zlib-demo-" + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

var rawFile = path.join(tmpDir, "data.json");
var gzipFile = path.join(tmpDir, "data.json.gz");
var restoreFile = path.join(tmpDir, "data-restored.json");

// 写入原始文件
fs.writeFileSync(rawFile, rawData, "utf8");
console.log("写入原始文件: " + rawFile);

// 流式压缩
var gzipStart = Date.now();
var readStream = fs.createReadStream(rawFile);
var writeStream = fs.createWriteStream(gzipFile);
var gzipStream = zlib.createGzip({ level: 6 });

readStream.pipe(gzipStream).pipe(writeStream);

writeStream.on("finish", function () {
  var gzipElapsed = Date.now() - gzipStart;
  var rawStat = fs.statSync(rawFile);
  var gzipStat = fs.statSync(gzipFile);
  var ratio = ((1 - gzipStat.size / rawStat.size) * 100).toFixed(1);

  console.log("流式 gzip 压缩完成:");
  console.log("  原始文件: " + (rawStat.size / 1024).toFixed(1) + " KB");
  console.log("  压缩文件: " + (gzipStat.size / 1024).toFixed(1) + " KB");
  console.log("  压缩率: " + ratio + "%");
  console.log("  耗时: " + gzipElapsed + "ms");

  // 流式解压
  console.log("\\n流式解压...");
  var gunzipStart = Date.now();
  var gunzip = zlib.createGunzip();
  var compressedRead = fs.createReadStream(gzipFile);
  var decompressedWrite = fs.createWriteStream(restoreFile);

  compressedRead.pipe(gunzip).pipe(decompressedWrite);

  decompressedWrite.on("finish", function () {
    var gunzipElapsed = Date.now() - gunzipStart;
    var restored = fs.readFileSync(restoreFile, "utf8");
    var restoredData = JSON.parse(restored);

    console.log("流式解压完成:");
    console.log("  解压后大小: " + (Buffer.byteLength(restored, "utf8") / 1024).toFixed(1) + " KB");
    console.log("  用户数: " + restoredData.users.length);
    console.log("  数据完整性: " + (restoredData.users.length === sampleData.users.length ? "✓ 通过" : "✗ 失败"));
    console.log("  耗时: " + gunzipElapsed + "ms");

    // 清理
    try {
      fs.unlinkSync(rawFile);
      fs.unlinkSync(gzipFile);
      fs.unlinkSync(restoreFile);
      fs.rmdirSync(tmpDir);
    } catch (e) {}
  });
});

// ============================================================
// 演示 5：HTTP 压缩模拟
// ============================================================
console.log("\\n===== 演示 5：HTTP 响应压缩模拟 =====");

function simulateHttpCompression(acceptEncoding, responseBody) {
  var responseBuf = Buffer.from(responseBody, "utf8");
  var result = { encoding: "identity", body: responseBuf, size: responseBuf.length };

  var encodings = (acceptEncoding || "").split(",").map(function (e) {
    return e.trim().split(";")[0].trim();
  });

  console.log("\\n请求头 Accept-Encoding: " + (acceptEncoding || "(无)"));
  console.log("客户端支持的编码: " + encodings.join(", "));

  if (encodings.indexOf("br") !== -1) {
    result.encoding = "br";
    result.body = zlib.brotliCompressSync(responseBuf);
    console.log("  → 选择 Brotli 压缩");
  } else if (encodings.indexOf("gzip") !== -1) {
    result.encoding = "gzip";
    result.body = zlib.gzipSync(responseBuf);
    console.log("  → 选择 Gzip 压缩");
  } else if (encodings.indexOf("deflate") !== -1) {
    result.encoding = "deflate";
    result.body = zlib.deflateSync(responseBuf);
    console.log("  → 选择 Deflate 压缩");
  } else {
    console.log("  → 不压缩（客户端不支持）");
  }

  result.size = result.body.length;
  var ratio = ((1 - result.size / responseBuf.length) * 100).toFixed(1);
  console.log("  原始大小: " + (responseBuf.length / 1024).toFixed(1) + " KB");
  console.log("  压缩后: " + (result.size / 1024).toFixed(1) + " KB");
  console.log("  压缩率: " + ratio + "%");
  console.log("  Content-Encoding: " + result.encoding);

  return result;
}

// 模拟不同浏览器的请求
var apiResponse = JSON.stringify({ status: "ok", data: sampleData.users.slice(0, 100) });

simulateHttpCompression("gzip, deflate, br", apiResponse);
simulateHttpCompression("gzip, deflate", apiResponse);
simulateHttpCompression("", apiResponse);

// ============================================================
// 演示 6：小文件压缩的必要性分析
// ============================================================
setTimeout(function () {
  console.log("\\n===== 演示 6：小文件压缩分析 =====");

  var smallSizes = [100, 500, 1024, 2048, 5120, 10240];
  console.log("\\n不同大小数据的压缩效果:");
  console.log("原始大小".padEnd(14) + "gzip 后".padEnd(14) + "压缩率".padEnd(12) + "是否值得压缩");
  console.log("-".repeat(60));

  smallSizes.forEach(function (size) {
    // 生成指定大小的数据
    var data = "";
    var template = '{"items":[{"id":1,"name":"test","value":"abcdefghijklmnopqrstuvwxyz"}]}';
    while (Buffer.byteLength(data, "utf8") < size) {
      data += template;
    }
    data = data.substring(0, size);

    var buf = Buffer.from(data, "utf8");
    var compressed = zlib.gzipSync(buf);
    var ratio = ((1 - compressed.length / buf.length) * 100).toFixed(1);
    var worthIt = compressed.length < buf.length ? "✓ 值得" : "✗ 不值得";

    console.log(
      String(size).padEnd(14) +
      String(compressed.length).padEnd(14) +
      (ratio + "%").padEnd(12) +
      worthIt
    );
  });

  console.log("\\n建议: 大于 1KB 的数据才值得压缩，小文件压缩开销可能大于收益");

  console.log("\\n===== zlib 压缩演示完成 =====");
}, 500);`,
  },

  {
    id: 'node-static-optimize',
    group: '性能与优化',
    icon: '🖼️',
    title: '静态资源优化',
    content: `## 静态资源缓存与优化策略

静态资源（CSS、JS、图片、字体等）占据 Web 页面加载时间的绝大部分。合理的缓存策略可以让用户在第二次访问时几乎瞬间加载页面。

### 缓存机制概述

浏览器缓存机制分为**强缓存**和**协商缓存**两种：

**强缓存（不需要发送请求到服务器）：**
- **Cache-Control: max-age=31536000** — 告诉浏览器资源在多少秒内有效
- **Expires** — 绝对过期时间（HTTP/1.0，已被 Cache-Control 替代）

**协商缓存（发送请求但服务器可能返回 304）：**
- **ETag / If-None-Match** — 基于文件内容的哈希值
- **Last-Modified / If-Modified-Since** — 基于文件修改时间

### 缓存策略最佳实践

| 资源类型 | 缓存策略 | 原因 |
| --- | --- | --- |
| **带哈希的静态资源**（app.abc123.js） | 强缓存，max-age=1年 | 内容变化时文件名会变 |
| **HTML 入口文件** | 协商缓存（ETag）或不缓存 | 需要及时更新 |
| **API 响应** | Cache-Control: no-cache | 必须验证后再使用 |
| **图片/字体** | 强缓存，max-age=30天 | 变化频率低 |

### ETag 生成方式

ETag 是资源的唯一标识符，通常通过以下方式生成：
- **文件内容的哈希值**（最可靠）— 如 MD5 或 SHA256
- **文件大小 + 修改时间** — 快速但不够精确
- **版本号** — 应用级别的版本控制

### Cache-Control 指令详解

\`\`\`
Cache-Control: public, max-age=31536000, immutable
\`\`\`

- **public**：可以被任何缓存存储（CDN、浏览器）
- **private**：只能被浏览器缓存，不能被 CDN 缓存
- **no-cache**：每次使用前必须验证（不意味不缓存）
- **no-store**：完全不缓存
- **max-age**：缓存有效期（秒）
- **s-maxage**：仅对共享缓存（CDN）有效
- **immutable**：资源内容永不改变（现代浏览器支持）

### 文件哈希命名

在构建时为每个静态资源生成唯一哈希值，实现永久缓存策略：

\`\`\`
app.js → app.a1b2c3d4.js
style.css → style.e5f6g7h8.css
\`\`\`

当文件内容变化时，哈希值会变，文件名不同，浏览器会请求新文件，旧缓存自然失效。

### 资源预加载策略

\`\`\`html
<!-- 预加载关键资源 -->
<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>

<!-- 预获取下一页资源 -->
<link rel="prefetch" href="/page2.html">

<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//api.example.com">
\`\`\`

### 304 Not Modified 的请求流程

浏览器发起协商缓存请求的完整流程：

1. 浏览器请求 \`/app.js\`
2. 服务器返回 200 + ETag: "abc123" + Cache-Control: no-cache
3. 浏览器缓存响应体和 ETag
4. 下次请求时带上 \`If-None-Match: "abc123"\`
5. 服务器检查 ETag 是否匹配
6. 如果匹配：返回 304 Not Modified（无响应体，节省带宽）
7. 如果不匹配：返回 200 + 新的 ETag + 新的响应体

### 缓存策略决策树

选择缓存策略时，可以按以下决策树进行：

\`\`\`
资源 URL 是否包含内容哈希？
├── 是 → 强缓存 (max-age=31536000, immutable)
│        文件名变化时浏览器自动请求新文件
└── 否 → 资源是什么类型？
    ├── HTML 入口 → 协商缓存 (no-cache + ETag)
    ├── API 响应   → 不缓存 (no-store)
    └── 图片/字体  → 强缓存 (max-age=2592000) + ETag
\`\`\`

### CDN 缓存策略

使用 CDN 时可以进一步优化缓存层级：

- 源站设置 \`Cache-Control: public, max-age=86400, s-maxage=604800\`
- \`s-maxage\` 仅对 CDN 生效（7天），\`max-age\` 对浏览器生效（1天）
- CDN 可以配置缓存键（Cache Key）来忽略无关的查询参数
- 使用 \`Vary: Accept-Encoding\` 让 CDN 区分 gzip 和 br 版本

下面代码实现静态资源缓存策略，包括 ETag 生成和缓存头设置。`,
    code: `// ============================================================
// 第三章代码演示：静态资源缓存策略 - ETag 与缓存头
// ============================================================
// 实现静态资源缓存策略，包括 ETag 生成、
// 缓存头设置、文件哈希命名和缓存策略决策。

var crypto = require("crypto");
var fs = require("fs");
var path = require("path");
var os = require("os");

// ============================================================
// 演示 1：ETag 生成策略
// ============================================================
console.log("===== 演示 1：ETag 生成策略 =====");

// 创建临时文件
var tmpDir = path.join(os.tmpdir(), "static-cache-demo-" + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

var testFile = path.join(tmpDir, "app.js");
var testContent = 'console.log("Hello World v1.0.0");\\nvar x = 42;\\nfunction add(a,b){return a+b;}';
fs.writeFileSync(testFile, testContent, "utf8");

// 策略 1：基于文件内容的哈希 ETag（推荐）
function generateETagByHash(filePath) {
  var content = fs.readFileSync(filePath);
  var hash = crypto.createHash("sha256").update(content).digest("hex").substring(0, 16);
  return '"' + hash + '"';
}

// 策略 2：基于文件大小 + 修改时间的 ETag
function generateETagByStat(filePath) {
  var stat = fs.statSync(filePath);
  var raw = stat.size + "-" + stat.mtime.getTime();
  var hash = crypto.createHash("md5").update(raw).digest("hex").substring(0, 12);
  return '"' + hash + '"';
}

// 策略 3：基于版本号的 ETag
function generateETagByVersion(version) {
  return '"' + version + '"';
}

var etag1 = generateETagByHash(testFile);
var etag2 = generateETagByStat(testFile);
var etag3 = generateETagByVersion("v1.0.0");

console.log("ETag (SHA256 哈希): " + etag1);
console.log("ETag (文件大小+时间): " + etag2);
console.log("ETag (版本号): " + etag3);

// 验证 ETag 变化
fs.writeFileSync(testFile, testContent + "\\nvar y = 100;", "utf8");
var etag1Changed = generateETagByHash(testFile);
console.log("\\n内容变化后 ETag (SHA256): " + etag1Changed);
console.log("ETag 是否变化: " + (etag1 !== etag1Changed ? "✓ 是（内容变化）" : "✗ 否"));

// ============================================================
// 演示 2：协商缓存判断逻辑
// ============================================================
console.log("\\n===== 演示 2：协商缓存判断逻辑 =====");

function checkCache(reqHeaders, filePath) {
  var result = {
    statusCode: 200,
    headers: {},
    body: null,
    decision: "",
  };

  var fileStat = fs.statSync(filePath);
  var fileETag = generateETagByHash(filePath);
  var lastModified = fileStat.mtime.toUTCString();

  // 检查 If-None-Match (ETag)
  var ifNoneMatch = reqHeaders["if-none-match"];
  if (ifNoneMatch) {
    // 客户端可能发送多个 ETag
    var clientETags = ifNoneMatch.split(",").map(function (t) {
      return t.trim();
    });
    if (clientETags.indexOf(fileETag) !== -1) {
      result.statusCode = 304;
      result.decision = "ETag 匹配 → 304 Not Modified";
      result.headers["ETag"] = fileETag;
      return result;
    }
  }

  // 检查 If-Modified-Since
  var ifModifiedSince = reqHeaders["if-modified-since"];
  if (ifModifiedSince) {
    var clientTime = new Date(ifModifiedSince).getTime();
    if (clientTime >= fileStat.mtime.getTime()) {
      result.statusCode = 304;
      result.decision = "Last-Modified 匹配 → 304 Not Modified";
      result.headers["Last-Modified"] = lastModified;
      return result;
    }
  }

  // 缓存未命中，返回完整内容
  result.statusCode = 200;
  result.decision = "缓存未命中 → 200 返回完整内容";
  result.body = fs.readFileSync(filePath);
  result.headers["ETag"] = fileETag;
  result.headers["Last-Modified"] = lastModified;
  result.headers["Content-Type"] = "application/javascript; charset=utf-8";

  return result;
}

// 第一次请求（无缓存头）
console.log("\\n--- 第一次请求（无缓存头）---");
var result1 = checkCache({}, testFile);
console.log("状态码: " + result1.statusCode);
console.log("决策: " + result1.decision);
console.log("响应头 ETag: " + (result1.headers["ETag"] || "无"));

// 第二次请求（带 ETag）
console.log("\\n--- 第二次请求（带 If-None-Match）---");
var result2 = checkCache({ "if-none-match": result1.headers["ETag"] }, testFile);
console.log("状态码: " + result2.statusCode);
console.log("决策: " + result2.decision);
console.log("响应体大小: " + (result2.body ? result2.body.length + " bytes" : "0 bytes (使用缓存)"));

// 第三次请求（带过期 ETag）
console.log("\\n--- 第三次请求（带过期 ETag）---");
var result3 = checkCache({ "if-none-match": '"0000000000000000"' }, testFile);
console.log("状态码: " + result3.statusCode);
console.log("决策: " + result3.decision);

// ============================================================
// 演示 3：缓存策略决策器
// ============================================================
console.log("\\n===== 演示 3：缓存策略决策器 =====");

function getCacheHeaders(resourceType, filePath) {
  var headers = {};
  var strategy = "";

  switch (resourceType) {
    case "hashed-static":
      // 带哈希的静态资源：强缓存 1 年
      headers["Cache-Control"] = "public, max-age=31536000, immutable";
      strategy = "强缓存 1 年（带哈希文件名）";
      break;
    case "html":
      // HTML 入口文件：协商缓存
      headers["Cache-Control"] = "no-cache";
      headers["ETag"] = generateETagByHash(filePath);
      strategy = "协商缓存（每次验证）";
      break;
    case "api":
      // API 响应：不缓存
      headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
      headers["Pragma"] = "no-cache";
      headers["Expires"] = "0";
      strategy = "不缓存";
      break;
    case "image":
      // 图片/字体：强缓存 30 天
      headers["Cache-Control"] = "public, max-age=2592000";
      headers["ETag"] = generateETagByHash(filePath);
      strategy = "强缓存 30 天 + ETag 验证";
      break;
    default:
      headers["Cache-Control"] = "public, max-age=3600";
      strategy = "默认缓存 1 小时";
  }

  return { headers: headers, strategy: strategy };
}

// 创建不同类型的模拟文件
var files = {
  "app.abc123.js": "// hashed static bundle",
  "index.html": "<!DOCTYPE html><html><head></head><body></body></html>",
  "/api/users": '{"users":[]}',
  "logo.png": "fake-image-data",
};

console.log("\\n资源缓存策略:");
console.log("资源".padEnd(24) + "策略".padEnd(30) + "Cache-Control");
console.log("-".repeat(90));

Object.keys(files).forEach(function (fileName) {
  var filePath = path.join(tmpDir, fileName);
  // 文件名可能包含目录分隔（如 "/api/users"），先确保父目录存在
  var fileDir = path.dirname(filePath);
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true });
  }
  fs.writeFileSync(filePath, files[fileName], "utf8");

  var type;
  if (fileName.indexOf(".") !== -1 && fileName.split(".")[0].length > 10) {
    type = "hashed-static";
  } else if (fileName.endsWith(".html")) {
    type = "html";
  } else if (fileName.startsWith("/api")) {
    type = "api";
  } else {
    type = "image";
  }

  var result = getCacheHeaders(type, filePath);
  console.log(fileName.padEnd(24) + result.strategy.padEnd(30) + result.headers["Cache-Control"]);
});

// ============================================================
// 演示 4：文件哈希命名模拟
// ============================================================
console.log("\\n===== 演示 4：文件哈希命名 =====");

function generateAssetHash(content) {
  return crypto.createHash("md5").update(content).digest("hex").substring(0, 8);
}

function hashFileName(originalName, content) {
  var ext = path.extname(originalName);
  var baseName = path.basename(originalName, ext);
  var hash = generateAssetHash(content);
  return baseName + "." + hash + ext;
}

var assets = [
  { name: "app.js", content: 'var app = {version:"1.0.0"};' },
  { name: "style.css", content: "body{color:red;font-size:16px;}" },
  { name: "utils.js", content: 'function add(a,b){return a+b;}' },
];

console.log("\\n原始文件名 → 带哈希文件名:");
assets.forEach(function (asset) {
  var hashed = hashFileName(asset.name, asset.content);
  console.log("  " + asset.name + " → " + hashed + " (hash: " + generateAssetHash(asset.content) + ")");
});

// 演示内容变化后哈希变化
console.log("\\n内容变化后哈希变化:");
var utilsV1 = 'function add(a,b){return a+b;}';
var utilsV2 = 'function add(a,b){return a+b;}\\nfunction subtract(a,b){return a-b;}';
console.log("  utils.js v1: " + hashFileName("utils.js", utilsV1));
console.log("  utils.js v2: " + hashFileName("utils.js", utilsV2));
console.log("  ✓ 哈希值不同，浏览器会请求新文件");

// ============================================================
// 演示 5：完整缓存判断流程
// ============================================================
console.log("\\n===== 演示 5：完整缓存处理流程 =====");

function handleStaticRequest(reqHeaders, filePath, resourceType) {
  console.log("\\n--- 处理请求: " + path.basename(filePath) + " ---");

  // 第 1 步：确定缓存策略
  var cacheConfig = getCacheHeaders(resourceType, filePath);
  console.log("策略: " + cacheConfig.strategy);

  // 第 2 步：检查强缓存
  if (cacheConfig.headers["Cache-Control"] && cacheConfig.headers["Cache-Control"].indexOf("no-cache") === -1) {
    var cacheControl = cacheConfig.headers["Cache-Control"];
    console.log("Cache-Control: " + cacheControl);
    if (cacheControl.indexOf("immutable") !== -1) {
      console.log("  → immutable 资源，假设浏览器缓存有效");
      return { statusCode: 200, fromCache: "强缓存（浏览器本地）" };
    }
  }

  // 第 3 步：协商缓存检查
  var cacheResult = checkCache(reqHeaders, filePath);
  if (cacheResult.statusCode === 304) {
    console.log("  → " + cacheResult.decision);
    return { statusCode: 304, fromCache: "协商缓存（304 响应）" };
  }

  // 第 4 步：返回完整内容
  console.log("  → 返回完整内容 (" + (cacheResult.body ? cacheResult.body.length : 0) + " bytes)");
  return { statusCode: 200, fromCache: "服务器返回", headers: cacheResult.headers };
}

// 模拟请求序列
var htmlFile = path.join(tmpDir, "index.html");
var jsFile = path.join(tmpDir, "app.abc123.js");

// 首次访问 HTML
handleStaticRequest({}, htmlFile, "html");

// 再次访问 HTML（带 ETag）
var firstHtmlResult = checkCache({}, htmlFile);
handleStaticRequest({ "if-none-match": firstHtmlResult.headers["ETag"] }, htmlFile, "html");

// 访问带哈希的 JS
handleStaticRequest({}, jsFile, "hashed-static");

// 再次访问带哈希的 JS（浏览器已有强缓存）
handleStaticRequest({}, jsFile, "hashed-static");

// 清理临时文件
try {
  Object.keys(files).forEach(function (f) {
    fs.unlinkSync(path.join(tmpDir, f));
  });
  fs.unlinkSync(testFile);
  fs.rmdirSync(tmpDir);
} catch (e) {}

console.log("\\n===== 静态资源缓存策略演示完成 =====");`,
  },

  {
    id: 'node-connection-reuse',
    group: '性能与优化',
    icon: '🔁',
    title: '连接复用',
    content: `## 连接复用全面指南

在 HTTP 通信中，每次建立 TCP 连接都需要三次握手，HTTPS 还需要额外的 TLS 握手。频繁创建和销毁连接会带来巨大的性能开销。连接复用（Connection Reuse）是解决这个问题的核心技术。

### HTTP Keep-Alive

HTTP/1.0 中默认每个请求都新建一个 TCP 连接。HTTP/1.1 引入了 Keep-Alive 机制，允许在同一个 TCP 连接上发送多个请求：

\`\`\`
HTTP/1.0: 请求1 → 关闭连接 → 请求2 → 关闭连接
HTTP/1.1: 请求1 → 请求2 → 请求3 → 空闲超时 → 关闭连接
\`\`\`

### Node.js 中的 Agent 连接池

Node.js 的 http.Agent 负责管理 HTTP 客户端的连接复用。每个 Agent 维护一个连接池（socket pool），默认配置：

\`\`\`javascript
var agent = new http.Agent({
  keepAlive: true,          // 启用 Keep-Alive
  keepAliveMsecs: 1000,     // 空闲连接保留时间
  maxSockets: Infinity,     // 每个主机最大并发连接数
  maxFreeSockets: 256,      // 每个主机最大空闲连接数
  timeout: 5000,            // socket 超时时间
});
\`\`\`

### 连接复用 vs 每次新建

| 方面 | 每次新建连接 | 连接复用 |
| --- | --- | --- |
| TCP 握手 | 每次都需要 | 仅首次 |
| TLS 握手 | 每次都需要 | 仅首次 |
| 延迟 | 高（每次 +RTT） | 低（后续请求无握手开销） |
| 吞吐量 | 低 | 高 |
| 资源占用 | 频繁 TIME_WAIT | 持续占用少量连接 |
| 适用场景 | 低频请求 | 高频请求、API 调用 |

### 数据库连接复用

数据库连接的建立成本远高于 HTTP 连接。连接池（Connection Pool）是数据库访问的标准实践：

- **连接池大小**：通常设置为 5-20 个连接，取决于并发量和数据库配置
- **连接超时**：空闲连接超时后自动回收，防止数据库端断开
- **连接验证**：从池中取出连接时验证有效性（testOnBorrow）
- **连接等待**：所有连接都在使用时，新请求排队等待

### 连接超时与回收

长时间空闲的连接可能会被中间设备（防火墙、负载均衡器）断开。需要设置合理的超时和回收策略：

- **空闲超时**（idleTimeout）：连接在池中空闲多久后关闭
- **最大生命周期**（maxLifetime）：连接最多存活多久后强制回收
- **心跳检测**（keepAlive）：定期发送心跳包保持连接活跃

### 连接复用最佳实践

1. **全局共享 Agent**：为整个应用创建单个 http.Agent 实例并复用，而不是每次请求都新建
2. **限制连接数**：根据目标服务能力设置 maxSockets，避免压垮下游服务
3. **合理设置超时**：根据业务场景设置恰当的 timeout 和 keepAliveMsecs
4. **连接预热**：在应用启动时预先建立连接池，减少首次请求的延迟
5. **监控连接池状态**：定期检查连接池的活跃/空闲/等待连接数，及时调整配置

### 连接复用性能数据

以下是 100 次 HTTP 请求的典型性能对比（假设 RTT = 20ms）：

| 模式 | 总耗时 | 平均每请求 | 新建连接数 |
| --- | --- | --- | --- |
| 每次新建（无复用） | ~2500ms | ~25ms | 100 |
| 连接复用（Keep-Alive） | ~500ms | ~5ms | 1 |
| 性能提升 | **80%** | **80%** | **99%** |

对于高并发 API 调用场景，连接复用可以将吞吐量提升 3-5 倍。

### TCP 连接状态与 TIME_WAIT

频繁建立和关闭连接会导致大量 TCP 连接处于 TIME_WAIT 状态，耗尽可用的临时端口（默认约 28,000 个）。连接复用可以避免这个问题：

\`\`\`
netstat -an | grep TIME_WAIT | wc -l
# 无复用：可能达到数千个 TIME_WAIT 连接
# 有复用：几乎为零
\`\`\`

下面代码实现一个连接复用管理器，对比复用和不复用的性能差异。`,
    code: `// ============================================================
// 第四章代码演示：连接复用管理器 - 性能对比分析
// ============================================================
// 实现连接复用管理器，对比复用和不复用的性能差异，
// 包括连接池管理、超时回收、心跳检测等。

var EventEmitter = require("events").EventEmitter;
var crypto = require("crypto");

// ============================================================
// 演示 1：连接池基础实现
// ============================================================
console.log("===== 演示 1：连接池基础实现 =====");

function ConnectionPool(options) {
  this.options = Object.assign(
    {
      maxConnections: 10,
      minConnections: 2,
      idleTimeout: 30000,
      maxLifetime: 3600000,
      acquireTimeout: 5000,
      keepAliveInterval: 15000,
    },
    options || {}
  );

  this.activeConnections = []; // 正在使用的连接
  this.idleConnections = []; // 空闲连接
  this.pendingRequests = []; // 等待队列
  this.totalCreated = 0;
  this.totalDestroyed = 0;
  this.totalAcquired = 0;
  this.totalReleased = 0;
  this.isShuttingDown = false;
}

// 创建新连接（模拟 TCP 连接建立）
ConnectionPool.prototype.createConnection = function () {
  this.totalCreated++;
  var conn = {
    id: this.totalCreated,
    state: "idle",
    createdAt: Date.now(),
    lastUsedAt: Date.now(),
    acquireCount: 0,
    socketId: crypto.randomBytes(4).toString("hex"),
  };

  // 模拟 TCP 握手耗时
  var handshakeTime = 5 + Math.floor(Math.random() * 10);
  console.log("  [连接池] 创建新连接 #" + conn.id + " (握手耗时: " + handshakeTime + "ms)");

  return conn;
};

// 获取连接
ConnectionPool.prototype.acquire = function (callback) {
  var self = this;

  self.totalAcquired++;

  // 如果有空闲连接，直接返回
  if (self.idleConnections.length > 0) {
    var conn = self.idleConnections.pop();
    conn.state = "active";
    conn.lastUsedAt = Date.now();
    conn.acquireCount++;
    console.log("  [连接池] 复用空闲连接 #" + conn.id + " (第 " + conn.acquireCount + " 次使用)");
    callback(null, conn);
    return;
  }

  // 如果有可用槽位，创建新连接
  if (self.activeConnections.length + self.idleConnections.length < self.options.maxConnections) {
    var newConn = self.createConnection();
    newConn.state = "active";
    newConn.acquireCount = 1;
    self.activeConnections.push(newConn);
    callback(null, newConn);
    return;
  }

  // 连接池已满，进入等待队列
  console.log("  [连接池] 连接池已满，请求进入等待队列 (位置: " + (self.pendingRequests.length + 1) + ")");
  self.pendingRequests.push({
    callback: callback,
    queuedAt: Date.now(),
  });
};

// 释放连接
ConnectionPool.prototype.release = function (conn) {
  var self = this;
  self.totalReleased++;

  // 从活跃列表移除
  var idx = self.activeConnections.indexOf(conn);
  if (idx !== -1) {
    self.activeConnections.splice(idx, 1);
  }

  // 检查连接是否超过最大生命周期
  if (Date.now() - conn.createdAt > self.options.maxLifetime) {
    console.log("  [连接池] 连接 #" + conn.id + " 超过最大生命周期，销毁");
    self.totalDestroyed++;
    conn.state = "destroyed";
  } else {
    conn.state = "idle";
    conn.lastUsedAt = Date.now();
    self.idleConnections.push(conn);
  }

  // 如果有等待的请求，分配空闲连接
  if (self.pendingRequests.length > 0 && self.idleConnections.length > 0) {
    var pending = self.pendingRequests.shift();
    var waitTime = Date.now() - pending.queuedAt;
    var idleConn = self.idleConnections.pop();
    idleConn.state = "active";
    idleConn.lastUsedAt = Date.now();
    idleConn.acquireCount++;
    self.activeConnections.push(idleConn);
    console.log("  [连接池] 等待队列中的请求获得连接 #" + idleConn.id + " (等待了 " + waitTime + "ms)");
    pending.callback(null, idleConn);
  }
};

// 获取连接池状态
ConnectionPool.prototype.getStatus = function () {
  return {
    active: this.activeConnections.length,
    idle: this.idleConnections.length,
    pending: this.pendingRequests.length,
    totalCreated: this.totalCreated,
    totalDestroyed: this.totalDestroyed,
    totalAcquired: this.totalAcquired,
    totalReleased: this.totalReleased,
    reuseRate:
      this.totalAcquired > 0
        ? ((1 - this.totalCreated / this.totalAcquired) * 100).toFixed(1) + "%"
        : "0%",
  };
};

// ============================================================
// 演示 2：连接复用 vs 不复用对比
// ============================================================
console.log("\\n===== 演示 2：连接复用性能对比 =====");

// 模拟无连接复用的场景（每次新建连接）
function simulateWithoutReuse(requestCount) {
  console.log("\\n--- 无连接复用（每次新建）---");
  var totalTime = 0;
  var totalConnections = 0;

  for (var i = 0; i < requestCount; i++) {
    // 每次请求都新建连接
    var handshakeTime = 10 + Math.floor(Math.random() * 15); // TCP: 10-25ms
    var tlsTime = 8 + Math.floor(Math.random() * 12); // TLS: 8-20ms
    var requestTime = 2 + Math.floor(Math.random() * 5); // 实际请求: 2-7ms
    var total = handshakeTime + tlsTime + requestTime;
    totalTime += total;
    totalConnections++;
  }

  var avgTime = (totalTime / requestCount).toFixed(1);
  console.log("  请求数: " + requestCount);
  console.log("  新建连接数: " + totalConnections);
  console.log("  总耗时: " + totalTime + "ms");
  console.log("  平均每请求: " + avgTime + "ms");
  console.log("  握手开销占比: " + ((10 + 8) / (10 + 8 + 3) * 100).toFixed(0) + "%");

  return { totalTime: totalTime, connections: totalConnections, avgTime: parseFloat(avgTime) };
}

// 模拟连接复用的场景
function simulateWithReuse(requestCount, poolSize) {
  console.log("\\n--- 连接复用（连接池大小: " + poolSize + "）---");
  var totalTime = 0;
  var totalConnections = poolSize; // 仅首次建立连接

  // 首次建立连接池
  var setupTime = poolSize * 15; // 每个连接 15ms 握手
  totalTime += setupTime;

  // 后续请求复用连接，无线程握手开销
  for (var i = 0; i < requestCount; i++) {
    var requestTime = 2 + Math.floor(Math.random() * 5); // 实际请求: 2-7ms
    totalTime += requestTime;
  }

  var avgTime = (totalTime / requestCount).toFixed(1);
  console.log("  请求数: " + requestCount);
  console.log("  新建连接数: " + totalConnections + "（仅首次）");
  console.log("  总耗时: " + totalTime + "ms");
  console.log("  平均每请求: " + avgTime + "ms");
  console.log("  握手开销占比: " + ((setupTime / totalTime) * 100).toFixed(0) + "%");

  return { totalTime: totalTime, connections: totalConnections, avgTime: parseFloat(avgTime) };
}

var requestCount = 50;
var withoutReuse = simulateWithoutReuse(requestCount);
var withReuse = simulateWithReuse(requestCount, 5);

console.log("\\n--- 性能对比总结 ---");
console.log("总耗时: " + withoutReuse.totalTime + "ms vs " + withReuse.totalTime + "ms (节省 " + ((1 - withReuse.totalTime / withoutReuse.totalTime) * 100).toFixed(0) + "%)");
console.log("平均每请求: " + withoutReuse.avgTime + "ms vs " + withReuse.avgTime + "ms");
console.log("新建连接数: " + withoutReuse.connections + " vs " + withReuse.connections);

// ============================================================
// 演示 3：连接池实际使用
// ============================================================
console.log("\\n===== 演示 3：连接池实际使用 =====");

var pool = new ConnectionPool({
  maxConnections: 4,
  minConnections: 1,
  idleTimeout: 5000,
  keepAliveInterval: 3000,
});

// 模拟 10 个并发请求
console.log("\\n模拟 10 个并发请求（连接池大小: 4）...");
var completedRequests = 0;

for (var i = 0; i < 10; i++) {
  (function (reqId) {
    pool.acquire(function (err, conn) {
      if (err) {
        console.log("  请求 #" + reqId + " 获取连接失败: " + err.message);
        return;
      }

      console.log("  请求 #" + reqId + " 获得连接 #" + conn.id);

      // 模拟请求处理时间
      var processTime = 20 + Math.floor(Math.random() * 50);
      setTimeout(function () {
        console.log("  请求 #" + reqId + " 完成，释放连接 #" + conn.id);
        pool.release(conn);
        completedRequests++;

        if (completedRequests === 10) {
          console.log("\\n连接池最终状态:");
          var status = pool.getStatus();
          console.log("  活跃连接: " + status.active);
          console.log("  空闲连接: " + status.idle);
          console.log("  等待请求: " + status.pending);
          console.log("  总创建: " + status.totalCreated);
          console.log("  总获取: " + status.totalAcquired);
          console.log("  复用率: " + status.reuseRate);
        }
      }, processTime);
    });
  })(i + 1);
}

// ============================================================
// 演示 4：连接超时回收
// ============================================================
setTimeout(function () {
  console.log("\\n===== 演示 4：连接超时回收 =====");

  var timeoutPool = new ConnectionPool({
    maxConnections: 5,
    idleTimeout: 100, // 100ms 空闲超时（演示用）
    maxLifetime: 5000,
  });

  // 获取并释放几个连接
  var connections = [];

  function acquireAndRelease(count, done) {
    var released = 0;
    for (var i = 0; i < count; i++) {
      timeoutPool.acquire(function (err, conn) {
        connections.push(conn);
        // 立即释放
        setTimeout(function () {
          timeoutPool.release(conn);
          released++;
          if (released === count) done();
        }, 10);
      });
    }
  }

  acquireAndRelease(3, function () {
    var status = timeoutPool.getStatus();
    console.log("释放后状态: 活跃=" + status.active + ", 空闲=" + status.idle + ", 创建=" + status.totalCreated);

    // 等待空闲超时
    setTimeout(function () {
      console.log("\\n--- 空闲超时后 ---");
      // 清理空闲连接
      var cleaned = 0;
      while (timeoutPool.idleConnections.length > 0) {
        var conn = timeoutPool.idleConnections.pop();
        if (Date.now() - conn.lastUsedAt > timeoutPool.options.idleTimeout) {
          timeoutPool.totalDestroyed++;
          cleaned++;
          console.log("  [回收] 连接 #" + conn.id + " 空闲超时，已回收");
        }
      }
      console.log("回收了 " + cleaned + " 个空闲连接");
      console.log("当前空闲连接: " + timeoutPool.idleConnections.length);
    }, 200);
  });
}, 2000);

// ============================================================
// 演示 5：连接池预热
// ============================================================
setTimeout(function () {
  console.log("\\n===== 演示 5：连接池预热 =====");

  function warmupPool(pool, count) {
    console.log("预热连接池，预先创建 " + count + " 个连接...");
    var connections = [];
    for (var i = 0; i < count; i++) {
      pool.acquire(function (err, conn) {
        connections.push(conn);
      });
    }

    // 释放所有连接回池中
    setTimeout(function () {
      connections.forEach(function (conn) {
        pool.release(conn);
      });

      var status = pool.getStatus();
      console.log("预热完成:");
      console.log("  空闲连接: " + status.idle);
      console.log("  总创建: " + status.totalCreated);
      console.log("  后续请求可直接复用，无需等待握手");
    }, 50);
  }

  var warmupPool = new ConnectionPool({ maxConnections: 5 });
  warmupPool(warmupPool, 3);

  console.log("\\n===== 连接复用演示完成 =====");
}, 4000);`,
  },

  {
    id: 'node-stream-perf',
    group: '性能与优化',
    icon: '🌊',
    title: '流式处理大数据',
    content: `## 流式处理大数据全面指南

在 Node.js 中处理大文件时，将整个文件内容一次性加载到内存中可能导致内存溢出（OOM）。流式处理（Streaming）通过在内存中只保留一小块数据（chunk），逐块处理文件，是实现高效大数据处理的基石。

### 分块读取 vs 一次性读取

| 方式 | 内存占用 | 处理速度 | 适用场景 |
| --- | --- | --- | --- |
| **一次性读取**（readFileSync） | 文件大小 = 内存占用 | 快（全在内存） | 小文件（< 100MB） |
| **流式读取**（createReadStream） | 固定（如 64KB） | 略慢（I/O 分块） | 大文件（任意大小） |

**核心原则**：流式处理的内存占用与文件大小无关，仅与块大小（chunk size）有关。

### 流的四种类型

| 类型 | 用途 | 示例 |
| --- | --- | --- |
| **Readable** | 读取数据 | fs.createReadStream() |
| **Writable** | 写入数据 | fs.createWriteStream() |
| **Transform** | 转换数据（读写） | zlib.createGzip() |
| **Duplex** | 双向读写 | net.Socket |

### 管道（Pipeline）流式处理

管道将多个流串联起来，数据从源头流经多个处理阶段，最终到达目的地：

\`\`\`javascript
fs.createReadStream('input.csv')
  .pipe(csvParser())        // Transform: 解析 CSV
  .pipe(filterTransform())   // Transform: 过滤数据
  .pipe(aggregateTransform()) // Transform: 聚合统计
  .pipe(fs.createWriteStream('output.json'));
\`\`\`

### 背压（Backpressure）处理

当数据生产速度超过消费速度时，会产生背压。Writable 流的 write() 方法返回 false 表示缓冲区已满，需要暂停读取：

\`\`\`javascript
// 手动处理背压
readable.on('data', function(chunk) {
  var canContinue = writable.write(chunk);
  if (!canContinue) {
    readable.pause(); // 暂停读取
    writable.once('drain', function() {
      readable.resume(); // 恢复读取
    });
  }
});
\`\`\`

使用 pipeline() 或 pipe() 会自动处理背压，这是推荐的做法。

### Transform 流优化

Transform 流是处理数据转换的最佳方式。在 \_transform 方法中处理每个 chunk，可以控制内存使用：

\`\`\`javascript
var { Transform } = require('stream');
var upperCaseTransform = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});
\`\`\`

### 内存效率对比

以处理 1GB 文件为例：
- **一次性读取**：需要 ~1.5GB 内存（字符串 + Buffer 开销），容易 OOM
- **流式处理**：只需 ~64KB 内存（默认 chunk 大小），稳定运行

下面代码使用 stream 和 fs 演示大文件流式处理，对比内存占用。`,
    code: `// ============================================================
// 第五章代码演示：流式处理大数据 - 内存效率对比
// ============================================================
// 使用 stream 和 fs 演示大文件流式处理，
// 对比分块读取与一次性读取的内存占用。

var fs = require("fs");
var path = require("path");
var os = require("os");
var crypto = require("crypto");
var stream = require("stream");

// ============================================================
// 演示 1：生成测试数据文件
// ============================================================
console.log("===== 演示 1：生成测试数据文件 =====");

var tmpDir = path.join(os.tmpdir(), "stream-demo-" + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

var largeFile = path.join(tmpDir, "large-data.csv");
var outputFile = path.join(tmpDir, "processed-output.json");

// 生成约 50MB 的 CSV 测试数据
console.log("生成测试数据（约 50MB）...");
var header = "id,name,age,city,email,score,timestamp\\n";
var writeStream = fs.createWriteStream(largeFile);
writeStream.write(header);

var rowCount = 500000;
var cities = ["北京", "上海", "广州", "深圳", "杭州", "成都", "南京", "武汉", "西安", "长沙"];
var firstNames = ["张", "李", "王", "赵", "陈", "刘", "周", "吴", "徐", "孙"];
var lastNames = ["伟", "芳", "敏", "静", "丽", "强", "磊", "洋", "勇", "军"];

var rowsWritten = 0;
var chunkSize = 1000;

function writeChunk() {
  var canContinue = true;
  var batchEnd = Math.min(rowsWritten + chunkSize, rowCount);

  for (var i = rowsWritten; i < batchEnd; i++) {
    var row =
      (i + 1) + "," +
      firstNames[i % firstNames.length] + lastNames[i % lastNames.length] + "," +
      (20 + (i % 40)) + "," +
      cities[i % cities.length] + "," +
      "user" + i + "@example.com" + "," +
      (Math.random() * 100).toFixed(1) + "," +
      new Date(Date.now() - i * 86400000).toISOString() + "\\n";

    canContinue = writeStream.write(row);
  }

  rowsWritten = batchEnd;

  if (rowsWritten < rowCount) {
    if (!canContinue) {
      // 背压：等待 drain 事件
      writeStream.once("drain", writeChunk);
    } else {
      // 使用 setImmediate 避免阻塞事件循环
      setImmediate(writeChunk);
    }
  } else {
    writeStream.end();
  }
}

writeChunk();

writeStream.on("finish", function () {
  var stat = fs.statSync(largeFile);
  console.log("测试文件生成完成:");
  console.log("  文件: " + path.basename(largeFile));
  console.log("  大小: " + (stat.size / 1024 / 1024).toFixed(2) + " MB");
  console.log("  行数: " + rowCount);

  runBenchmarks();
});

// ============================================================
// 演示 2：一次性读取 vs 流式读取内存对比
// ============================================================
function runBenchmarks() {
  console.log("\\n===== 演示 2：内存占用对比 =====");

  var memBefore = process.memoryUsage();

  // 方式 1：一次性读取（仅读取前 10MB 用于对比，避免 OOM）
  console.log("\\n--- 方式 1：一次性读取（readFileSync，仅前 10MB）---");
  var fd = fs.openSync(largeFile, "r");
  var buf = Buffer.alloc(10 * 1024 * 1024); // 10MB buffer
  fs.readSync(fd, buf, 0, buf.length, 0);
  fs.closeSync(fd);

  var memAfterReadAll = process.memoryUsage();
  console.log("  读取大小: 10 MB");
  console.log("  堆内存增长: " + ((memAfterReadAll.heapUsed - memBefore.heapUsed) / 1024 / 1024).toFixed(1) + " MB");
  console.log("  RSS 增长: " + ((memAfterReadAll.rss - memBefore.rss) / 1024 / 1024).toFixed(1) + " MB");
  console.log("  ⚠ 如果读取 1GB 文件，内存将增长 1GB+");

  // 释放 reference
  buf = null;
  if (typeof global !== "undefined" && global.gc) {
    global.gc();
  }

  // 方式 2：流式读取
  console.log("\\n--- 方式 2：流式读取（createReadStream）---");
  var memBeforeStream = process.memoryUsage();

  var readStream = fs.createReadStream(largeFile, {
    highWaterMark: 64 * 1024, // 64KB 块大小
    encoding: "utf8",
  });

  var streamBytesRead = 0;
  var chunkCount = 0;

  readStream.on("data", function (chunk) {
    streamBytesRead += Buffer.byteLength(chunk, "utf8");
    chunkCount++;
  });

  readStream.on("end", function () {
    var memAfterStream = process.memoryUsage();
    console.log("  读取大小: " + (streamBytesRead / 1024 / 1024).toFixed(2) + " MB");
    console.log("  块数: " + chunkCount + " (每块约 64KB)");
    console.log("  堆内存增长: " + ((memAfterStream.heapUsed - memBeforeStream.heapUsed) / 1024 / 1024).toFixed(1) + " MB");
    console.log("  RSS 增长: " + ((memAfterStream.rss - memBeforeStream.rss) / 1024 / 1024).toFixed(1) + " MB");
    console.log("  ✓ 内存增长几乎为 0，与文件大小无关");

    runPipelineDemo();
  });
}

// ============================================================
// 演示 3：管道流式处理
// ============================================================
function runPipelineDemo() {
  console.log("\\n===== 演示 3：管道流式处理 =====");

  // Transform 流：CSV 行转 JSON 对象
  var csvToJson = new stream.Transform({
    readableObjectMode: true,
    writableObjectMode: false,
    transform: function (chunk, encoding, callback) {
      var lines = chunk.toString().split("\\n");
      var self = this;

      // 处理可能的不完整行
      if (this._remainder) {
        lines[0] = this._remainder + lines[0];
        this._remainder = null;
      }

      // 最后一行可能不完整
      if (chunk.toString().charAt(chunk.length - 1) !== "\\n") {
        this._remainder = lines.pop();
      }

      lines.forEach(function (line) {
        if (!line || line.startsWith("id,")) return; // 跳过空行和表头
        var parts = line.split(",");
        if (parts.length >= 7) {
          self.push({
            id: parseInt(parts[0], 10),
            name: parts[1],
            age: parseInt(parts[2], 10),
            city: parts[3],
            email: parts[4],
            score: parseFloat(parts[5]),
            timestamp: parts[6],
          });
        }
      });

      callback();
    },
    flush: function (callback) {
      // 处理最后剩余的不完整行
      if (this._remainder) {
        var parts = this._remainder.split(",");
        if (parts.length >= 7) {
          this.push({
            id: parseInt(parts[0], 10),
            name: parts[1],
            age: parseInt(parts[2], 10),
            city: parts[3],
            email: parts[4],
            score: parseFloat(parts[5]),
            timestamp: parts[6],
          });
        }
      }
      callback();
    },
  });

  // Transform 流：按城市分组统计
  var cityAggregator = new stream.Transform({
    readableObjectMode: false,
    writableObjectMode: true,
    transform: function (record, encoding, callback) {
      if (!this._cityStats) {
        this._cityStats = {};
        this._totalCount = 0;
        this._totalScore = 0;
      }

      this._totalCount++;
      this._totalScore += record.score;

      if (!this._cityStats[record.city]) {
        this._cityStats[record.city] = { count: 0, totalScore: 0, minScore: Infinity, maxScore: -Infinity };
      }

      var stat = this._cityStats[record.city];
      stat.count++;
      stat.totalScore += record.score;
      if (record.score < stat.minScore) stat.minScore = record.score;
      if (record.score > stat.maxScore) stat.maxScore = record.score;

      callback();
    },
    flush: function (callback) {
      var result = {
        totalRecords: this._totalCount,
        averageScore: (this._totalScore / this._totalCount).toFixed(2),
        cities: {},
      };

      var self = this;
      Object.keys(this._cityStats).forEach(function (city) {
        var s = self._cityStats[city];
        result.cities[city] = {
          count: s.count,
          avgScore: (s.totalScore / s.count).toFixed(2),
          minScore: s.minScore.toFixed(1),
          maxScore: s.maxScore.toFixed(1),
        };
      });

      this.push(JSON.stringify(result, null, 2));
      callback();
    },
  });

  console.log("启动流式处理管道...");
  var pipelineStart = Date.now();

  var readStream = fs.createReadStream(largeFile, { encoding: "utf8", highWaterMark: 256 * 1024 });
  var writeStream = fs.createWriteStream(outputFile);

  var processedRecords = 0;

  // 中间计数 Transform
  var counter = new stream.Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform: function (record, encoding, callback) {
      processedRecords++;
      if (processedRecords % 100000 === 0) {
        console.log("  已处理 " + (processedRecords / 1000).toFixed(0) + "k 条记录...");
      }
      this.push(record);
      callback();
    },
  });

  readStream.pipe(csvToJson).pipe(counter).pipe(cityAggregator).pipe(writeStream);

  writeStream.on("finish", function () {
    var pipelineElapsed = Date.now() - pipelineStart;
    console.log("管道处理完成!");
    console.log("  处理记录数: " + processedRecords);
    console.log("  耗时: " + pipelineElapsed + "ms");
    console.log("  吞吐量: " + (processedRecords / (pipelineElapsed / 1000)).toFixed(0) + " 条/秒");

    // 读取并显示结果
    var result = JSON.parse(fs.readFileSync(outputFile, "utf8"));
    console.log("\\n统计结果:");
    console.log("  总记录数: " + result.totalRecords);
    console.log("  平均分: " + result.averageScore);
    console.log("\\n  各城市统计:");
    Object.keys(result.cities).forEach(function (city) {
      var c = result.cities[city];
      console.log("    " + city.padEnd(8) + " 数量:" + String(c.count).padEnd(8) + " 平均分:" + c.avgScore);
    });

    runBackpressureDemo();
  });
}

// ============================================================
// 演示 4：背压处理
// ============================================================
function runBackpressureDemo() {
  console.log("\\n===== 演示 4：背压处理 =====");

  var bpFile = path.join(tmpDir, "backpressure-test.txt");
  var bpWrite = fs.createWriteStream(bpFile, { highWaterMark: 16 }); // 很小的缓冲区

  var totalWritten = 0;
  var pauseCount = 0;

  function writeData() {
    var canContinue = true;
    while (canContinue && totalWritten < 1024) {
      var data = "x".repeat(64);
      totalWritten += data.length;
      canContinue = bpWrite.write(data);
      if (!canContinue) {
        pauseCount++;
      }
    }

    if (totalWritten < 1024) {
      bpWrite.once("drain", writeData);
    } else {
      bpWrite.end();
    }
  }

  writeData();

  bpWrite.on("finish", function () {
    console.log("背压测试完成:");
    console.log("  写入数据量: " + totalWritten + " bytes");
    console.log("  缓冲区大小: 16 bytes");
    console.log("  背压暂停次数: " + pauseCount);
    console.log("  ✓ 背压机制自动协调读写速度，防止内存溢出");

    // 清理
    try {
      fs.unlinkSync(bpFile);
      fs.unlinkSync(largeFile);
      fs.unlinkSync(outputFile);
      fs.rmdirSync(tmpDir);
    } catch (e) {}

    console.log("\\n===== 流式处理大数据演示完成 =====");
  });
}`,
  },

  {
    id: 'node-graceful-shutdown',
    group: '性能与优化',
    icon: '🛑',
    title: '优雅关闭',
    content: `## 优雅关闭全面指南

在生产环境中，服务进程需要能够安全地停止，而不是被强制杀死。优雅关闭（Graceful Shutdown）确保在进程终止前完成所有正在处理的请求、释放资源、关闭连接，避免数据丢失和客户端错误。

### 优雅关闭的核心流程

标准的优雅关闭流程包含以下步骤：

1. **接收终止信号**（SIGTERM 或 SIGINT）
2. **停止接受新请求**（关闭 HTTP 服务器）
3. **等待现有请求完成**（设置超时限制）
4. **关闭数据库连接**和连接池
5. **清理临时文件**和资源
6. **退出进程**

### 信号处理

Unix/Linux 系统中，进程间通过信号通信。与进程终止相关的关键信号：

| 信号 | 触发方式 | 默认行为 | 是否可捕获 |
| --- | --- | --- | --- |
| **SIGTERM** | kill 命令、K8s pod 终止 | 终止进程 | 是 |
| **SIGINT** | Ctrl+C | 终止进程 | 是 |
| **SIGKILL** | kill -9 | 立即终止 | 否（无法捕获） |
| **SIGQUIT** | Ctrl+\\ | 终止并 core dump | 是 |
| **SIGHUP** | 终端关闭 | 终止进程 | 是 |

**关键原则**：SIGKILL 无法被捕获，因此优雅关闭只能依赖 SIGTERM 和 SIGINT。Kubernetes 在删除 Pod 时会先发送 SIGTERM，等待 terminationGracePeriodSeconds（默认 30 秒），超时后发送 SIGKILL。

### 关闭前清理

\`\`\`javascript
process.on('SIGTERM', async function() {
  console.log('收到 SIGTERM，开始优雅关闭...');

  // 1. 停止接收新请求
  server.close(function() {
    console.log('HTTP 服务器已关闭');
  });

  // 2. 关闭数据库连接
  await db.disconnect();

  // 3. 关闭消息队列连接
  await mq.close();

  // 4. 清理临时文件

  // 5. 退出
  process.exit(0);
});
\`\`\`

### 超时强制关闭

如果优雅关闭在指定时间内未能完成，需要强制退出以防止无限等待：

\`\`\`javascript
// 设置强制关闭超时
setTimeout(function() {
  console.error('优雅关闭超时，强制退出');
  process.exit(1);
}, 30000); // 30 秒超时
\`\`\`

### 健康检查在关闭期间

在关闭期间，健康检查端点应该返回不健康状态，让负载均衡器将流量从该实例移除：

\`\`\`javascript
var isShuttingDown = false;

app.get('/health', function(req, res) {
  if (isShuttingDown) {
    res.status(503).json({ status: 'shutting_down' });
  } else {
    res.json({ status: 'healthy' });
  }
});
\`\`\`

### Kubernetes 中的优雅关闭

在 Kubernetes 环境中，优雅关闭需要特别关注以下几点：

- **preStop 钩子**：在发送 SIGTERM 前执行，可以用于提前通知负载均衡器
- **terminationGracePeriodSeconds**：优雅关闭的最大等待时间
- **Readiness Probe**：关闭期间应返回就绪失败，使 Service 不再转发流量
- **Pod 删除流程**：K8s API Server 标记 Pod → Endpoint 移除 → preStop 钩子 → SIGTERM → 等待 → SIGKILL

下面代码实现优雅关闭管理器，处理信号、清理资源和超时强制关闭。`,
    code: `// ============================================================
// 第六章代码演示：优雅关闭管理器 - 信号处理与资源清理
// ============================================================
// 实现优雅关闭管理器，处理信号、清理资源、
// 超时强制关闭和健康检查。

var EventEmitter = require("events").EventEmitter;
var fs = require("fs");
var path = require("path");
var os = require("os");

// ============================================================
// 演示 1：优雅关闭管理器
// ============================================================
console.log("===== 演示 1：优雅关闭管理器 =====");

function GracefulShutdown(options) {
  this.options = Object.assign(
    {
      timeout: 10000, // 优雅关闭超时时间（ms）
      signals: ["SIGTERM", "SIGINT"],
      exitCode: 0,
    },
    options || {}
  );

  this.isShuttingDown = false;
  this.shutdownStep = "running";
  this.cleanupHandlers = []; // 清理函数队列
  this.activeConnections = 0; // 活跃连接计数
  this.startTime = Date.now();
  this.shutdownStartTime = null;
}

// 注册清理函数
GracefulShutdown.prototype.addCleanupHandler = function (name, handler, priority) {
  this.cleanupHandlers.push({
    name: name,
    handler: handler,
    priority: priority || 0,
  });
  console.log("  注册清理处理: " + name + " (优先级: " + (priority || 0) + ")");
};

// 开始优雅关闭
GracefulShutdown.prototype.shutdown = function (signal) {
  var self = this;

  if (self.isShuttingDown) {
    console.log("  [警告] 已在关闭中，忽略重复信号: " + signal);
    return;
  }

  self.isShuttingDown = true;
  self.shutdownStartTime = Date.now();
  self.shutdownStep = "shutting_down";

  console.log("\\n========================================");
  console.log("收到信号: " + signal + "，开始优雅关闭...");
  console.log("运行时间: " + ((Date.now() - self.startTime) / 1000).toFixed(0) + " 秒");
  console.log("========================================\\n");

  // 设置超时强制关闭
  var forceExitTimer = setTimeout(function () {
    console.error("\\n========================================");
    console.error("优雅关闭超时 (" + self.options.timeout + "ms)！强制退出");
    console.error("========================================");
    self.shutdownStep = "force_exit";
    process.exitCode = 1;
    // 在真实环境中调用 process.exit(1)
    console.log("→ 模拟 process.exit(1)");
  }, self.options.timeout);

  // 按优先级排序清理处理函数
  var handlers = self.cleanupHandlers.slice().sort(function (a, b) {
    return b.priority - a.priority; // 高优先级先执行
  });

  // 依次执行清理函数
  function executeNext(index) {
    if (index >= handlers.length) {
      clearTimeout(forceExitTimer);
      self.shutdownStep = "completed";
      console.log("\\n========================================");
      console.log("优雅关闭完成！所有资源已清理");
      console.log("关闭耗时: " + (Date.now() - self.shutdownStartTime) + "ms");
      console.log("========================================");
      return;
    }

    var handler = handlers[index];
    console.log("[" + (index + 1) + "/" + handlers.length + "] 执行清理: " + handler.name);

    try {
      var result = handler.handler();
      if (result && typeof result.then === "function") {
        // 异步清理
        result
          .then(function () {
            console.log("  ✓ " + handler.name + " 完成");
            executeNext(index + 1);
          })
          .catch(function (err) {
            console.log("  ✗ " + handler.name + " 失败: " + err.message);
            executeNext(index + 1); // 即使失败也继续
          });
      } else {
        console.log("  ✓ " + handler.name + " 完成");
        executeNext(index + 1);
      }
    } catch (err) {
      console.log("  ✗ " + handler.name + " 异常: " + err.message);
      executeNext(index + 1);
    }
  }

  executeNext(0);
};

// 连接追踪
GracefulShutdown.prototype.connectionOpened = function () {
  this.activeConnections++;
};

GracefulShutdown.prototype.connectionClosed = function () {
  this.activeConnections = Math.max(0, this.activeConnections - 1);
};

// 健康检查
GracefulShutdown.prototype.healthCheck = function () {
  if (this.isShuttingDown) {
    return {
      status: "shutting_down",
      uptime: ((Date.now() - this.startTime) / 1000).toFixed(0) + "s",
      activeConnections: this.activeConnections,
      shutdownStep: this.shutdownStep,
      shutdownDuration: ((Date.now() - this.shutdownStartTime) / 1000).toFixed(0) + "s",
    };
  }

  return {
    status: "healthy",
    uptime: ((Date.now() - this.startTime) / 1000).toFixed(0) + "s",
    activeConnections: this.activeConnections,
  };
};

// ============================================================
// 演示 2：注册清理处理函数
// ============================================================
console.log("\\n===== 演示 2：注册清理处理函数 =====");

var shutdown = new GracefulShutdown({
  timeout: 5000,
  signals: ["SIGTERM", "SIGINT"],
});

// HTTP 服务器关闭
shutdown.addCleanupHandler("HTTP 服务器关闭", function () {
  console.log("    → 停止接收新请求...");
  console.log("    → 等待现有请求完成...");
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log("    → 所有 HTTP 请求已完成");
      resolve();
    }, 300);
  });
}, 100);

// 数据库连接关闭
shutdown.addCleanupHandler("数据库连接关闭", function () {
  console.log("    → 关闭主数据库连接...");
  console.log("    → 关闭只读副本连接...");
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log("    → 数据库连接已关闭");
      resolve();
    }, 200);
  });
}, 90);

// Redis 连接关闭
shutdown.addCleanupHandler("Redis 连接关闭", function () {
  console.log("    → 保存缓存快照...");
  console.log("    → 关闭 Redis 连接...");
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log("    → Redis 连接已关闭");
      resolve();
    }, 150);
  });
}, 80);

// 消息队列关闭
shutdown.addCleanupHandler("消息队列关闭", function () {
  console.log("    → 停止消费消息...");
  console.log("    → 关闭队列连接...");
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log("    → 消息队列已关闭");
      resolve();
    }, 100);
  });
}, 70);

// 临时文件清理
shutdown.addCleanupHandler("临时文件清理", function () {
  console.log("    → 扫描临时目录...");
  console.log("    → 清理过期文件...");
  console.log("    → 删除 0 个临时文件");
}, 60);

// 日志刷新
shutdown.addCleanupHandler("日志缓冲区刷新", function () {
  console.log("    → 刷新日志缓冲区到磁盘...");
  console.log("    → 日志已保存");
}, 50);

// ============================================================
// 演示 3：健康检查状态变化
// ============================================================
console.log("\\n===== 演示 3：健康检查状态变化 =====");

console.log("正常运行时:");
console.log(JSON.stringify(shutdown.healthCheck(), null, 2));

// 模拟一些活跃连接
shutdown.connectionOpened();
shutdown.connectionOpened();
shutdown.connectionOpened();

console.log("\\n有 3 个活跃连接时:");
console.log(JSON.stringify(shutdown.healthCheck(), null, 2));

// ============================================================
// 演示 4：模拟优雅关闭流程
// ============================================================
console.log("\\n===== 演示 4：模拟优雅关闭流程 =====");

// 模拟关闭过程中连接逐渐关闭
var closeInterval = setInterval(function () {
  if (shutdown.activeConnections > 0) {
    shutdown.connectionClosed();
    console.log("连接关闭（剩余: " + shutdown.activeConnections + "）");
  }
}, 200);

// 触发优雅关闭
shutdown.shutdown("SIGTERM");

// 关闭后停止连接追踪
setTimeout(function () {
  clearInterval(closeInterval);
}, 1000);

// ============================================================
// 演示 5：超时强制关闭场景
// ============================================================
setTimeout(function () {
  console.log("\\n===== 演示 5：超时强制关闭场景 =====");

  var stuckShutdown = new GracefulShutdown({
    timeout: 1000, // 1 秒超时
  });

  // 注册一个会卡住的清理处理
  stuckShutdown.addCleanupHandler("卡住的数据库连接", function () {
    console.log("    → 尝试关闭数据库连接...");
    console.log("    → 数据库无响应，连接挂起...");
    return new Promise(function (resolve) {
      // 故意不 resolve，模拟挂起
      // 这会导致超时强制关闭
    });
  }, 100);

  stuckShutdown.addCleanupHandler("日志刷新", function () {
    console.log("    → 刷新日志...");
  }, 50);

  stuckShutdown.shutdown("SIGTERM");
}, 3000);

// ============================================================
// 演示 6：Kubernetes 优雅关闭时间线
// ============================================================
setTimeout(function () {
  console.log("\\n===== 演示 6：Kubernetes Pod 优雅关闭时间线 =====");

  console.log("\\nKubernetes Pod 删除流程:");
  console.log("━".repeat(60));

  var timeline = [
    { time: "T+0s", event: "kubectl delete pod / 滚动更新触发", actor: "用户/控制器" },
    { time: "T+0.1s", event: "API Server 标记 Pod 为 Terminating", actor: "Kubernetes API" },
    { time: "T+0.5s", event: "Endpoint Controller 从 Service 中移除 Pod IP", actor: "Endpoint Controller" },
    { time: "T+1s", event: "kubelet 收到 Pod 删除事件", actor: "kubelet" },
    { time: "T+1.5s", event: "执行 preStop 钩子（如有）", actor: "容器运行时" },
    { time: "T+2s", event: "发送 SIGTERM 信号给容器主进程", actor: "kubelet" },
    { time: "T+2s~T+32s", event: "应用执行优雅关闭（terminationGracePeriodSeconds=30）", actor: "应用进程" },
    { time: "T+32s", event: "超时：发送 SIGKILL 强制终止", actor: "kubelet" },
  ];

  timeline.forEach(function (item) {
    console.log(item.time.padEnd(12) + "│ " + item.event.padEnd(42) + "│ " + item.actor);
  });

  console.log("━".repeat(60));
  console.log("\\n关键配置:");
  console.log("  terminationGracePeriodSeconds: 30");
  console.log("  优雅关闭超时必须 < 30 秒");
  console.log("  preStop 钩子 + 优雅关闭 < 30 秒");
  console.log("  readinessProbe 应快速返回失败");

  console.log("\\n===== 优雅关闭演示完成 =====");
}, 4500);`,
  },

];

// 侧边栏分组顺序
export const chapterGroups = ['基础入门', '核心模块', '异步编程', '进阶实战', '工程化', '实战补充', '性能与优化'];