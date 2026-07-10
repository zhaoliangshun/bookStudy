// =============================================================
// Node.js 交互式教程 —— 第十五批章节（进阶干货·高级实战与可观测篇，共 7 章）
// =============================================================
// 本批聚焦"上线后才发现重要的"能力：可观测性、微服务通信、安全加固、
// 日期时区、正则性能、定时任务、最佳实践清单。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：可观测性（日志/指标/追踪）
  // =========================================================
  {
    id: "node-observability",
    group: "进阶干货",
    icon: "📈",
    title: "可观测性：日志/指标/追踪",
    content: `## 可观测性：日志/指标/追踪

**可观测性三支柱**：Logs（日志）、Metrics（指标）、Traces（追踪）。三者配合才能定位线上疑难问题。

### 一、可观测性三支柱对比

| 支柱 | 解决什么 | 举例 | 工具 |
| --- | --- | --- | --- |
| **Logs** | "发生了什么" | 用户登录失败、订单创建 | pino / winston |
| **Metrics** | "现状如何" | QPS、延迟、错误率 | prom-client |
| **Traces** | "请求经历了什么" | DB → Redis → 外部 API | OpenTelemetry |

**核心区别**：
- Logs 是**事件**：离散、有上下文
- Metrics 是**聚合**：计数、求和、分桶
- Traces 是**因果**：调用链路、span 关系

### 二、结构化日志：pino 实战

#### 1. 为什么不用 console.log

- \`console.log\` 输出纯文本，难解析
- 同步写入，阻塞事件循环
- 没有级别、上下文、采样

#### 2. pino 的优势

- **JSON 输出**：易被 ELK/Loki 解析
- **异步**：不阻塞事件循环
- **子 logger**：自动附加 request_id 等上下文
- **redact**：自动脱敏敏感字段

\`\`\`javascript
const pino = require("pino");  // 导入模块 pino；require 返回 module.exports
const logger = pino({  // 定义常量 logger
  level: "info",
  redact: ["password", "apiKey", "*.token"],
  formatters: {
    level(label) { return { level: label }; }
  }
});

// 子 logger 自动带上下文
const reqLogger = logger.child({ request_id: "abc123", user_id: 42 });  // 定义常量 reqLogger
reqLogger.info({ path: "/login" }, "user login");
// {"level":"info","time":1700000000000,"request_id":"abc123","user_id":42,"path":"/login","msg":"user login"}
\`\`\`

#### 3. 日志级别

| 级别 | 数值 | 何时用 |
| --- | --- | --- |
| \`fatal\` | 60 | 进程要挂了 |
| \`error\` | 50 | 错误（影响业务） |
| \`warn\` | 40 | 警告（不影响主流程） |
| \`info\` | 30 | 关键业务事件 |
| \`debug\` | 20 | 调试信息 |
| \`trace\` | 10 | 极详细追踪 |

\`\`\`javascript
// 生产环境 level: info（debug/trace 不输出）
// 排查问题时临时调到 debug：LOG_LEVEL=debug
\`\`\`

#### 4. 开发环境美化

\`\`\`javascript
const logger = pino({  // 定义常量 logger
  transport: {
    target: "pino-pretty",
    options: { colorize: true, translateTime: "SYS:standard" }
  }
});
\`\`\`

### 三、日志最佳实践

#### 1. 每条日志带 request_id

\`\`\`javascript
app.use((req, res, next) => {  // 注册 Express 中间件（每个请求依次经过）
  req.id = crypto.randomUUID();
  req.log = logger.child({ request_id: req.id });
  next();  // 调用下一个中间件（不放行则请求被挂起）
});

app.get("/users", async (req, res) => {  // 注册 GET 路由处理
  req.log.info("查询用户列表");
  const users = await db.getUsers();  // 定义常量 users
  req.log.info({ count: users.length }, "查询完成");
});
\`\`\`

#### 2. 日志包含足够上下文

\`\`\`javascript
// ❌ 信息不足
logger.error("登录失败");

// ✅ 带完整上下文
logger.error({
  user_id: 123,
  ip: "1.2.3.4",
  reason: "wrong_password",
  attempt: 3
}, "登录失败");
\`\`\`

#### 3. 不要日志记录大对象

\`\`\`javascript
// ❌ 整个 response 太大
logger.info({ response: hugeData }, "收到响应");

// ✅ 只记录关键信息
logger.info({ size: hugeData.length, status: "ok" }, "收到响应");
\`\`\`

#### 4. 错误日志带 stack

\`\`\`javascript
try {  // 开启 try 块捕获异常
  await risky();  // 等待 Promise 完成后再继续
} catch (err) {
  logger.error({ err, stack: err.stack }, "操作失败");
}
\`\`\`

### 四、Metrics：prom-client 实战

#### 1. 四种指标类型

| 类型 | 作用 | 示例 |
| --- | --- | --- |
| **Counter** | 只增不减 | 请求总数、错误总数 |
| **Gauge** | 可增可减 | 当前连接数、队列长度 |
| **Histogram** | 分布 | 请求延迟分桶 |
| **Summary** | 分位数 | p50/p95/p99 延迟 |

\`\`\`javascript
const { Counter, Gauge, Histogram, collectDefaultMetrics } = require("prom-client");  // 导入模块 prom-client；require 返回 module.exports

const httpRequests = new Counter({  // 创建实例 httpRequests
  name: "http_requests_total",
  help: "HTTP 请求总数",
  labelNames: ["method", "path", "status"]
});

const activeConnections = new Gauge({  // 创建实例 activeConnections
  name: "active_connections",
  help: "当前活跃连接数"
});

const requestDuration = new Histogram({  // 创建实例 requestDuration
  name: "http_request_duration_seconds",
  help: "HTTP 请求延迟",
  labelNames: ["method", "path"],
  buckets: [0.001, 0.01, 0.1, 0.5, 1, 5]
});

collectDefaultMetrics();  // 自动收集 Node.js 指标
\`\`\`

#### 2. RED 指标（服务监控黄金信号）

- **R**ate：请求速率（QPS）
- **E**rrors：错误率
- **D**uration：请求延迟

\`\`\`javascript
app.use((req, res, next) => {  // 注册 Express 中间件（每个请求依次经过）
  const start = Date.now();  // 定义常量 start
  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;  // 定义常量 duration
    const labels = { method: req.method, path: req.path, status: res.statusCode };  // 定义对象 labels
    httpRequests.inc(labels);
    requestDuration.observe(labels, duration);
  });
  next();  // 调用下一个中间件（不放行则请求被挂起）
});
\`\`\`

#### 3. /metrics 端点

\`\`\`javascript
app.get("/metrics", async (req, res) => {  // 注册 GET 路由处理
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());  // 结束响应并发送数据
});
\`\`\`

### 五、Traces：OpenTelemetry

#### 1. Trace / Span 概念

- **Trace**：一次完整请求的链路
- **Span**：链路中的一个操作（HTTP 调用、DB 查询）
- Span 之间有**父子关系**

\`\`\`
[Trace] GET /api/orders
├── [Span] controller.getOrders
│   ├── [Span] db.query (12ms)
│   ├── [Span] redis.get (2ms)
│   └── [Span] http.call payment (45ms)
\`\`\`

#### 2. 自动埋点

\`\`\`javascript
const { NodeSDK } = require("@opentelemetry/sdk-node");  // 导入模块 @opentelemetry/sdk-node；require 返回 module.exports
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");  // 导入模块 @opentelemetry/auto-instrumentations-node；require 返回 module.exports

const sdk = new NodeSDK({  // 创建实例 sdk
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [getNodeAutoInstrumentations()]
});
sdk.start();
\`\`\`

**自动埋点覆盖**：http、express、mongodb、redis、grpc、aws-sdk 等，不用改业务代码。

#### 3. 手动埋点

\`\`\`javascript
const { trace } = require("@opentelemetry/api");  // 导入模块 @opentelemetry/api；require 返回 module.exports
const tracer = trace.getTracer("myapp");  // 定义常量 tracer

app.get("/users/:id", async (req, res) => {  // 注册 GET 路由处理
  const span = tracer.startSpan("get_user");  // 定义常量 span
  try {  // 开启 try 块捕获异常
    const user = await db.getUser(req.params.id);  // 定义常量 user
    span.setAttribute("user.id", user.id);
    res.json(user);  // 发送 JSON 响应
  } catch (err) {
    span.recordException(err);
    throw err;  // 抛出异常
  } finally {
    span.end();
  }
});
\`\`\`

### 六、健康检查与就绪探针

\`\`\`javascript
app.get("/health", (req, res) => {  // 注册 GET 路由处理
  res.json({ status: "ok", uptime: process.uptime() });  // 发送 JSON 响应
});

app.get("/ready", async (req, res) => {  // 注册 GET 路由处理
  const checks = await Promise.allSettled([  // 定义常量 checks
    db.ping(),
    redis.ping()
  ]);
  const ready = checks.every(c => c.status === "fulfilled");  // 定义常量 ready
  res.status(ready ? 200 : 503).json({ ready, checks: checks.map(c => c.status) });  // 设置响应状态码
});
\`\`\`

### 七、告警规则示例

\`\`\`yaml
# 高错误率
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.1
  for: 5m
  labels: { severity: critical }

# 高延迟
- alert: HighLatency
  expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 1
  for: 10m
\`\`\`

### 八、可观测性清单

- [ ] 结构化 JSON 日志（pino）
- [ ] 每条日志带 request_id
- [ ] /metrics 端点暴露 Prometheus 指标
- [ ] RED 指标（Rate/Errors/Duration）
- [ ] OpenTelemetry 自动埋点
- [ ] /health + /ready 探针
- [ ] 关键告警规则

下面代码演示结构化日志、指标采集、调用追踪。`,
    code: `// ============================================================
// 可观测性演示：日志 / 指标 / 追踪
// ============================================================
const crypto = require("crypto");

// ---- 1. 结构化日志（pino 风格模拟） ----
console.log("===== 1. 结构化日志 =====");
class SimpleLogger {
  constructor(level = "info", context = {}) {
    this.level = level;
    this.context = context;
    this.levels = { fatal: 60, error: 50, warn: 40, info: 30, debug: 20, trace: 10 };
  }
  child(context) {
    return new SimpleLogger(this.level, { ...this.context, ...context });
  }
  log(level, msg, extra = {}) {
    if (this.levels[level] < this.levels[this.level]) return;
    const entry = { level, time: new Date().toISOString(), ...this.context, ...extra, msg };
    console.log(JSON.stringify(entry));
  }
  info(msg, extra) { this.log("info", msg, extra); }
  error(msg, extra) { this.log("error", msg, extra); }
  warn(msg, extra) { this.log("warn", msg, extra); }
  debug(msg, extra) { this.log("debug", msg, extra); }
}

const logger = new SimpleLogger("info");
const requestId = crypto.randomUUID();
const reqLogger = logger.child({ request_id: requestId.slice(0, 8), user_id: 42 });

reqLogger.info("查询用户列表");
reqLogger.info({ count: 5, duration_ms: 23 }, "查询完成");
reqLogger.error({ reason: "not_found" }, "用户不存在");
console.log("  → 真实环境用 pino，性能更好");

// ---- 2. 日志级别 ----
console.log("\\n===== 2. 日志级别 =====");
const levelDesc = [
  ["fatal", "60", "进程要挂了"],
  ["error", "50", "影响业务的错误"],
  ["warn",  "40", "警告，不影响主流程"],
  ["info",  "30", "关键业务事件"],
  ["debug", "20", "调试信息"],
  ["trace", "10", "极详细追踪"]
];
levelDesc.forEach(([l, n, d]) => {
  console.log("  " + l.padEnd(7) + n.padEnd(5) + d);
});
console.log("  → 生产用 info，排查时临时开 debug");

// ---- 3. Metrics: Counter ----
console.log("\\n===== 3. Metrics: Counter =====");
class Counter {
  constructor(name, help, labels = []) {
    this.name = name;
    this.help = help;
    this.labels = labels;
    this.values = new Map();
  }
  inc(labelValues = {}, amount = 1) {
    const key = this.labels.map(l => labelValues[l] || "").join(",");
    this.values.set(key, (this.values.get(key) || 0) + amount);
  }
  format() {
    const lines = ["# HELP " + this.name + " " + this.help, "# TYPE " + this.name + " counter"];
    for (const [key, val] of this.values) {
      const labelStr = this.labels.map((l, i) => l + '="' + key.split(",")[i] + '"').join(",");
      lines.push(this.name + "{" + labelStr + "} " + val);
    }
    return lines.join("\\n");
  }
}

const httpReqs = new Counter("http_requests_total", "HTTP 请求总数", ["method", "path", "status"]);
httpReqs.inc({ method: "GET", path: "/", status: "200" });
httpReqs.inc({ method: "GET", path: "/", status: "200" });
httpReqs.inc({ method: "GET", path: "/users", status: "200" });
httpReqs.inc({ method: "POST", path: "/users", status: "500" });
console.log(httpReqs.format());

// ---- 4. Metrics: Gauge ----
console.log("\\n===== 4. Metrics: Gauge =====");
class Gauge {
  constructor(name, help) { this.name = name; this.help = help; this.value = 0; }
  set(v) { this.value = v; }
  inc() { this.value++; }
  dec() { this.value--; }
  format() {
    return "# HELP " + this.name + " " + this.help + "\\n# TYPE " + this.name + " gauge\\n" + this.name + " " + this.value;
  }
}

const activeConns = new Gauge("active_connections", "当前活跃连接数");
activeConns.inc(); activeConns.inc(); activeConns.inc();
activeConns.dec();
console.log(activeConns.format());

// ---- 5. Metrics: Histogram ----
console.log("\\n===== 5. Metrics: Histogram =====");
class Histogram {
  constructor(name, help, buckets = [0.001, 0.01, 0.1, 0.5, 1, 5]) {
    this.name = name; this.help = help;
    this.buckets = buckets;
    this.counts = new Array(buckets.length + 1).fill(0);
    this.sum = 0; this.count = 0;
  }
  observe(value) {
    this.sum += value; this.count++;
    for (let i = 0; i < this.buckets.length; i++) {
      if (value <= this.buckets[i]) { this.counts[i]++; return; }
    }
    this.counts[this.buckets.length]++;
  }
  format() {
    let lines = ["# HELP " + this.name + " " + this.help, "# TYPE " + this.name + " histogram"];
    let cum = 0;
    for (let i = 0; i < this.buckets.length; i++) {
      cum += this.counts[i];
      lines.push(this.name + '_bucket{le="' + this.buckets[i] + '"} ' + cum);
    }
    cum += this.counts[this.buckets.length];
    lines.push(this.name + '_bucket{le="+Inf"} ' + cum);
    lines.push(this.name + "_sum " + this.sum);
    lines.push(this.name + "_count " + this.count);
    return lines.join("\\n");
  }
}

const reqDuration = new Histogram("http_request_duration_seconds", "HTTP 请求延迟");
[0.002, 0.015, 0.08, 0.25, 1.2, 0.05, 0.003, 0.35].forEach(v => reqDuration.observe(v));
console.log(reqDuration.format());

// ---- 6. RED 黄金信号 ----
console.log("\\n===== 6. RED 黄金信号 =====");
const redMetrics = {
  rate: 150, errorRate: 0.02,
  durationP50: 0.025, durationP95: 0.18, durationP99: 0.45
};
console.log("  Rate:", redMetrics.rate, "QPS");
console.log("  Error rate:", (redMetrics.errorRate * 100) + "%");
console.log("  Duration p50:", (redMetrics.durationP50 * 1000) + "ms");
console.log("  Duration p95:", (redMetrics.durationP95 * 1000) + "ms");
console.log("  Duration p99:", (redMetrics.durationP99 * 1000) + "ms");

// ---- 7. Traces: Span 模拟 ----
console.log("\\n===== 7. Traces: 调用链追踪 =====");
class Span {
  constructor(name, parent = null) {
    this.name = name; this.parent = parent;
    this.start = Date.now(); this.end = null;
    this.children = []; this.attributes = {};
    if (parent) parent.children.push(this);
  }
  setAttribute(key, value) { this.attributes[key] = value; }
  finish() { this.end = Date.now(); }
  duration() { return (this.end || Date.now()) - this.start; }
  print(indent = "") {
    const dur = this.duration();
    const attrs = Object.entries(this.attributes).map(([k, v]) => k + "=" + v).join(" ");
    console.log(indent + "[Span] " + this.name + " (" + dur + "ms)" + (attrs ? " " + attrs : ""));
    this.children.forEach(c => c.print(indent + "  "));
  }
}

async function simulateRequest() {
  const root = new Span("GET /api/orders");
  await new Promise(r => setTimeout(r, 5));
  const dbSpan = new Span("db.query", root);
  dbSpan.setAttribute("sql", "SELECT * FROM orders");
  await new Promise(r => setTimeout(r, 12));
  dbSpan.finish();
  const redisSpan = new Span("redis.get", root);
  redisSpan.setAttribute("key", "user:42");
  await new Promise(r => setTimeout(r, 2));
  redisSpan.finish();
  const httpSpan = new Span("http.call payment", root);
  httpSpan.setAttribute("url", "https://pay.example.com");
  await new Promise(r => setTimeout(r, 45));
  httpSpan.finish();
  root.finish();
  console.log("  Trace:");
  root.print("  ");
  console.log("  总耗时:", root.duration() + "ms");
}
simulateRequest();

// ---- 8. 健康检查端点 ----
console.log("\\n===== 8. 健康检查 =====");
function healthCheck() {
  return {
    status: "ok",
    uptime: process.uptime().toFixed(0) + "s",
    memory: (process.memoryUsage().rss / 1024 / 1024).toFixed(1) + "MB"
  };
}
async function readinessCheck() {
  const checks = { db: true, redis: true, queue: true };
  return { ready: Object.values(checks).every(v => v), checks };
}
console.log("  /health:", healthCheck());
readinessCheck().then(r => console.log("  /ready:", r));

// ---- 9. 告警规则示例 ----
console.log("\\n===== 9. 告警规则示例 =====");
const alerts = [
  { name: "HighErrorRate", desc: "5xx 错误率 > 10%", for: "5m", severity: "critical" },
  { name: "HighLatency", desc: "p95 延迟 > 1s", for: "10m", severity: "warning" },
  { name: "HighMemory", desc: "内存使用 > 80%", for: "5m", severity: "warning" }
];
alerts.forEach(a => {
  console.log("  [" + a.severity + "] " + a.name + " (" + a.for + ") - " + a.desc);
});

console.log("\\n===== 可观测性要点 =====");
console.log("  1. 三支柱: Logs + Metrics + Traces");
console.log("  2. 日志结构化 JSON，带 request_id");
console.log("  3. RED 指标是服务监控黄金信号");
console.log("  4. OpenTelemetry 自动埋点，免改业务");
console.log("  5. /health + /ready 双端点");`,
  },

  // =========================================================
  // 第二章：微服务通信
  // =========================================================
  {
    id: "node-microservice-comm",
    group: "进阶干货",
    icon: "🔗",
    title: "微服务通信",
    content: `## 微服务通信

微服务之间的通信方式决定了系统的可用性。本章讲透 **REST、gRPC、消息队列、事件驱动、服务发现、熔断** 的选型和实现。

### 一、四种通信模式对比

| 模式 | 同步/异步 | 耦合度 | 典型协议 | 适用场景 |
| --- | --- | --- | --- | --- |
| **REST** | 同步 | 中 | HTTP/JSON | 外部 API、简单内部 |
| **gRPC** | 同步 | 中 | HTTP/2+Protobuf | 内部高性能 |
| **消息队列** | 异步 | 低 | AMQP/Kafka | 解耦、削峰 |
| **事件驱动** | 异步 | 极低 | Event Bus | 通知、最终一致 |

**核心权衡**：
- 同步：调用方等待，需要被调方在线
- 异步：发送即返回，被调方延迟处理，可用性更高

### 二、REST 客户端最佳实践

\`\`\`javascript
// 用 fetch + 重试 + 超时 + 熔断
async function callUserService(userId) {  // 声明异步函数，内部可用 await
  return fetchWithRetry("http://user-service/users/" + userId, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  }, { timeout: 3000, retries: 3, retryOn: [503, 504] });
}
\`\`\`

**踩坑点**：REST 内部调用会产生"调用链放大效应"。A→B→C→D，D 慢导致 A、B、C 全超时。

### 三、gRPC：高性能 RPC

#### 1. gRPC vs REST 对比

| 特性 | REST | gRPC |
| --- | --- | --- |
| 协议 | HTTP/1.1 | HTTP/2 |
| 序列化 | JSON | Protobuf |
| 性能 | 慢 | **快 5-10 倍** |
| 流式 | 不支持 | **支持双向流** |
| 浏览器 | 直接支持 | 需 gRPC-Web |
| 代码生成 | 不需要 | 需要 .proto |

#### 2. .proto 定义

\`\`\`protobuf
syntax = "proto3";
package myapp;

service UserService {
  rpc GetUser(GetUserRequest) returns (User) {}
  rpc ListUsers(ListUsersRequest) returns (stream User) {}
}

message GetUserRequest { int32 id = 1; }
message User { int32 id = 1; string name = 2; string email = 3; }
\`\`\`

#### 3. Node.js gRPC 服务端

\`\`\`javascript
const grpc = require("@grpc/grpc-js");  // 导入模块 @grpc/grpc-js；require 返回 module.exports
const protoLoader = require("@grpc/proto-loader");  // 导入模块 @grpc/proto-loader；require 返回 module.exports
const packageDef = protoLoader.loadSync("user.proto");  // 定义常量 packageDef
const proto = grpc.loadPackageDefinition(packageDef);  // 定义常量 proto

const server = new grpc.Server();  // 创建实例 server
server.addService(proto.myapp.UserService.service, {
  getUser: (call, callback) => {
    callback(null, { id: call.request.id, name: "Alice", email: "a@b.com" });
  },
  listUsers: (call) => {
    for (const u of users) call.write(u);  // for 循环
    call.end();
  }
});
server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure());
\`\`\`

#### 4. gRPC 优势场景

- 内部服务调用：性能是 REST 的 5-10 倍
- 大量数据传输：Protobuf 比 JSON 小 3-10 倍
- 流式场景：实时音视频、日志流

### 四、消息队列：RabbitMQ / Kafka

#### 1. RabbitMQ：传统消息队列

\`\`\`javascript
const amqp = require("amqplib");  // 导入模块 amqplib；require 返回 module.exports
const conn = await amqp.connect("amqp://localhost");
const ch = await conn.createChannel();  // 定义常量 ch
await ch.assertQueue("tasks", { durable: true });  // 等待 Promise 完成后再继续
ch.sendToQueue("tasks", Buffer.from("task data"), { persistent: true });

await ch.consume("tasks", (msg) => {  // 等待 Promise 完成后再继续
  console.log("收到:", msg.content.toString());  // 打印日志到 stdout
  ch.ack(msg);
});
\`\`\`

**三种交换机**：
- **Direct**：精确匹配 routing key
- **Topic**：模式匹配（user.* 匹配 user.created）
- **Fanout**：广播

#### 2. Kafka：高吞吐日志流

\`\`\`javascript
const { Kafka } = require("kafkajs");  // 导入模块 kafkajs；require 返回 module.exports
const kafka = new Kafka({ brokers: ["localhost:9092"] });  // 创建实例 kafka

const producer = kafka.producer();  // 定义常量 producer
await producer.connect();  // 等待 Promise 完成后再继续
await producer.send({  // 等待 Promise 完成后再继续
  topic: "orders",
  messages: [{ value: JSON.stringify({ id: 1, total: 99 }) }]
});

const consumer = kafka.consumer({ groupId: "order-processor" });  // 定义常量 consumer
await consumer.connect();  // 等待 Promise 完成后再继续
await consumer.subscribe({ topic: "orders", fromBeginning: true });  // 等待 Promise 完成后再继续
await consumer.run({  // 等待 Promise 完成后再继续
  eachMessage: async ({ message }) => {
    console.log("处理:", message.value.toString());  // 打印日志到 stdout
  }
});
\`\`\`

#### 3. RabbitMQ vs Kafka

| 特性 | RabbitMQ | Kafka |
| --- | --- | --- |
| 模型 | 队列（点对点） | 日志（发布订阅） |
| 消息保留 | 消费后删除 | 保留 N 天 |
| 顺序 | 单队列有序 | 分区内有序 |
| 吞吐 | 万级/秒 | 百万级/秒 |
| 用途 | 任务分发 | 事件溯源、流处理 |

### 五、事件驱动架构

\`\`\`javascript
const EventEmitter = require("events");  // 导入模块 events；require 返回 module.exports
class EventBus extends EventEmitter {}  // 定义类 EventBus
const bus = new EventBus();  // 创建实例 bus

// 订单服务发布事件
class OrderService {  // 定义类 OrderService
  createOrder(data) {
    bus.emit("order.created", { id: 1, ...data });
  }
}

// 库存服务订阅
bus.on("order.created", (order) => inventoryService.deduct(order));

// 通知服务订阅
bus.on("order.created", (order) => notificationService.send(order));
\`\`\`

**分布式事件总线**：跨进程用 Redis Pub/Sub 或 Kafka。

### 六、服务发现

#### 1. 静态配置（简单场景）

\`\`\`javascript
const services = {  // 定义对象 services
  "user-service": "http://user-service:3001",
  "order-service": "http://order-service:3002"
};
\`\`\`

#### 2. Consul / etcd（动态）

\`\`\`javascript
const { Consul } = require("consul");  // 导入模块 consul；require 返回 module.exports
const consul = new Consul();  // 创建实例 consul
consul.agent.service.register({
  name: "user-service", address: "10.0.0.5", port: 3000,
  check: { http: "http://10.0.0.5:3000/health", interval: "10s" }
});
const services = await consul.catalog.service.nodes("user-service");  // 定义常量 services
\`\`\`

#### 3. K8s Service（推荐）

K8s 自动 DNS 解析：\`http://user-service\` 即可访问。

### 七、熔断器（Circuit Breaker）

\`\`\`javascript
class CircuitBreaker {  // 定义类 CircuitBreaker
  constructor(opts) {  // 构造函数
    this.failureThreshold = opts.failureThreshold || 5;
    this.resetTimeout = opts.resetTimeout || 30000;
    this.state = "CLOSED";  // CLOSED / OPEN / HALF_OPEN
    this.failures = 0;
    this.nextAttempt = Date.now();
  }
  async exec(fn) {
    if (this.state === "OPEN") {  // 条件判断
      if (Date.now() < this.nextAttempt) throw new Error("Circuit breaker OPEN");  // 条件判断
      this.state = "HALF_OPEN";
    }
    try {  // 开启 try 块捕获异常
      const result = await fn();  // 定义常量 result
      this.onSuccess();
      return result;  // 返回值
    } catch (err) {
      this.onFailure();
      throw err;  // 抛出异常
    }
  }
  onSuccess() { this.failures = 0; this.state = "CLOSED"; }
  onFailure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {  // 条件判断
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }
}
\`\`\`

**三状态**：
- **CLOSED**：正常调用
- **OPEN**：快速失败（不实际调用）
- **HALF_OPEN**：试探性放一个请求

### 八、超时与重试组合

\`\`\`javascript
const breaker = new CircuitBreaker({ failureThreshold: 5 });  // 创建实例 breaker
async function callWithProtection(url) {  // 声明异步函数，内部可用 await
  return breaker.exec(async () => fetchWithRetry(url, {}, 3));  // 返回值
}
\`\`\`

**层级**：
- 单次请求超时：3s
- 重试 3 次：最多 9s
- 熔断：连续 5 次失败后 30s 内快速失败

### 九、幂等性设计

重试可能导致**重复执行**，必须设计幂等：

\`\`\`javascript
// 用唯一 ID + 状态机
async function processPayment(paymentId) {  // 声明异步函数，内部可用 await
  const existing = await db.getPayment(paymentId);  // 定义常量 existing
  if (existing.status === "completed") return existing;  // 条件判断
  await db.updateStatus(paymentId, "processing");  // 等待 Promise 完成后再继续
  await db.updateStatus(paymentId, "completed");  // 等待 Promise 完成后再继续
}
\`\`\`

**幂等键**：客户端生成 UUID，服务端用 Redis SETNX 去重。

### 十、通信选型清单

- 外部 API：REST + OpenAPI 文档
- 内部高频调用：gRPC
- 异步解耦：RabbitMQ / Kafka
- 事件通知：Redis Pub/Sub 或 Kafka
- 跨服务发现：K8s Service 或 Consul
- 必备：超时 + 重试 + 熔断 + 幂等

下面代码演示 REST 客户端、gRPC 基础、熔断器。`,
    code: `// ============================================================
// 微服务通信演示
// ============================================================

// ---- 1. 通信模式对比 ----
console.log("===== 1. 通信模式对比 =====");
const patterns = [
  { name: "REST", type: "同步", coupling: "中", protocol: "HTTP/JSON", 用途: "外部 API" },
  { name: "gRPC", type: "同步", coupling: "中", protocol: "HTTP/2+PB", 用途: "内部高性能" },
  { name: "消息队列", type: "异步", coupling: "低", protocol: "AMQP/Kafka", 用途: "解耦削峰" },
  { name: "事件驱动", type: "异步", coupling: "极低", protocol: "Event Bus", 用途: "通知" }
];
patterns.forEach(p => {
  console.log("  " + p.name.padEnd(8) + " | " + p.type.padEnd(4) + " | " + p.coupling.padEnd(4) + " | " + p.protocol.padEnd(12) + " | " + p.用途);
});

// ---- 2. REST 客户端（带超时+重试） ----
console.log("\\n===== 2. REST 客户端 =====");
async function fetchWithRetry(url, opts = {}, retries = 3, timeout = 3000) {
  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { ...opts, signal: controller.signal });
      if (res.status >= 500 && i < retries) throw new Error("5xx: " + res.status);
      return { ok: true, status: res.status };
    } catch (err) {
      clearTimeout(timer);
      if (i === retries) return { ok: false, error: err.message };
      console.log("  重试 " + (i + 1) + ": " + err.message);
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 100));
    }
  }
}
fetchWithRetry("http://localhost:9999/api", {}, 2, 500).then(r => {
  console.log("  最终结果:", r.ok ? "成功" : "失败 - " + r.error);
});

// ---- 3. gRPC 基础演示 ----
console.log("\\n===== 3. gRPC 基础 =====");
console.log("  .proto 定义:");
console.log('    syntax = "proto3";');
console.log("    service UserService {");
console.log("      rpc GetUser(GetUserRequest) returns (User) {}");
console.log("      rpc ListUsers(ListUsersRequest) returns (stream User) {}");
console.log("    }");
console.log("    message User { int32 id = 1; string name = 2; }");
console.log("\\n  gRPC vs REST:");
const grpcVsRest = [
  ["协议", "HTTP/1.1", "HTTP/2"],
  ["序列化", "JSON (文本)", "Protobuf (二进制)"],
  ["性能", "1x", "5-10x"],
  ["流式", "不支持", "支持双向流"],
  ["代码生成", "不需要", "需要 protoc"]
];
grpcVsRest.forEach(([k, rest, grpc]) => {
  console.log("    " + k.padEnd(10) + " | REST: " + rest.padEnd(15) + " | gRPC: " + grpc);
});

// ---- 4. 消息队列模拟 ----
console.log("\\n===== 4. 消息队列（模拟） =====");
class MessageQueue {
  constructor() { this.queues = new Map(); this.handler = null; }
  assertQueue(name) { if (!this.queues.has(name)) this.queues.set(name, []); }
  sendToQueue(name, msg) {
    this.assertQueue(name);
    this.queues.get(name).push(msg);
    this.processQueue(name);
  }
  consume(name, handler) { this.handler = handler; this.processQueue(name); }
  processQueue(name) {
    if (!this.handler) return;
    const queue = this.queues.get(name);
    while (queue && queue.length > 0) {
      const msg = queue.shift();
      this.handler(msg);
    }
  }
}

const mq = new MessageQueue();
mq.consume("tasks", (msg) => console.log("  [消费者] 收到:", msg));
mq.sendToQueue("tasks", "任务1");
mq.sendToQueue("tasks", "任务2");
mq.sendToQueue("tasks", "任务3");
console.log("  → 真实环境用 amqplib (RabbitMQ) 或 kafkajs (Kafka)");

// ---- 5. 事件驱动 ----
console.log("\\n===== 5. 事件驱动架构 =====");
const EventEmitter = require("events");
const bus = new EventEmitter();

class OrderService {
  create(order) {
    console.log("  [订单] 创建订单:", order.id);
    bus.emit("order.created", order);
  }
}

bus.on("order.created", (order) => console.log("  [库存] 扣减库存:", order.items.length, "件"));
bus.on("order.created", (order) => console.log("  [通知] 发送邮件给:", order.email));
bus.on("order.created", (order) => console.log("  [积分] 增加", order.total, "积分"));

const orderService = new OrderService();
orderService.create({
  id: "ORD-001", email: "alice@example.com",
  items: ["item1", "item2"], total: 200
});

// ---- 6. 熔断器 ----
console.log("\\n===== 6. 熔断器 =====");
class CircuitBreaker {
  constructor(opts = {}) {
    this.failureThreshold = opts.failureThreshold || 3;
    this.resetTimeout = opts.resetTimeout || 1000;
    this.state = "CLOSED";
    this.failures = 0;
    this.nextAttempt = 0;
  }
  async exec(fn) {
    const now = Date.now();
    if (this.state === "OPEN") {
      if (now < this.nextAttempt) throw new Error("熔断器开启，快速失败");
      console.log("  状态: OPEN → HALF_OPEN（试探）");
      this.state = "HALF_OPEN";
    }
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }
  onSuccess() {
    this.failures = 0;
    if (this.state === "HALF_OPEN") console.log("  状态: HALF_OPEN → CLOSED（恢复）");
    this.state = "CLOSED";
  }
  onFailure() {
    this.failures++;
    console.log("  失败次数:", this.failures);
    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.resetTimeout;
      console.log("  状态: → OPEN（熔断）");
    }
  }
  getState() { return this.state; }
}

const breaker = new CircuitBreaker({ failureThreshold: 3, resetTimeout: 200 });

async function testCircuitBreaker() {
  const failFn = async () => { throw new Error("服务不可用"); };
  const okFn = async () => "成功";

  console.log("  阶段 1: 连续失败触发熔断");
  for (let i = 0; i < 4; i++) {
    try { await breaker.exec(failFn); }
    catch (err) { console.log("    调用失败:", err.message, "[状态:" + breaker.getState() + "]"); }
  }

  console.log("  阶段 2: 熔断中，快速失败");
  try { await breaker.exec(failFn); }
  catch (err) { console.log("    快速失败:", err.message); }

  console.log("  阶段 3: 等待恢复...");
  await new Promise(r => setTimeout(r, 250));

  console.log("  阶段 4: 半开状态试探");
  try {
    const result = await breaker.exec(okFn);
    console.log("    结果:", result, "[状态:" + breaker.getState() + "]");
  } catch (err) { console.log("    仍失败:", err.message); }
}
testCircuitBreaker();

// ---- 7. 服务发现 ----
console.log("\\n===== 7. 服务发现 =====");
console.log("  三种方式:");
console.log("    1. 静态配置（简单，小规模）");
console.log("    2. Consul/etcd（动态注册）");
console.log("    3. K8s Service（推荐，自动 DNS）");

// ---- 8. 幂等性 ----
console.log("\\n===== 8. 幂等性设计 =====");
const processedIds = new Set();
async function idempotentProcess(idempotencyKey, fn) {
  if (processedIds.has(idempotencyKey)) {
    console.log("  [幂等] 重复请求，跳过:", idempotencyKey);
    return { skipped: true };
  }
  processedIds.add(idempotencyKey);
  const result = await fn();
  console.log("  [幂等] 首次处理:", idempotencyKey);
  return { skipped: false, result };
}

(async () => {
  const key = "req-abc-123";
  await idempotentProcess(key, async () => "处理完成");
  await idempotentProcess(key, async () => "处理完成");
  await idempotentProcess(key, async () => "处理完成");
  console.log("  → 真实环境用 Redis SETNX 实现分布式幂等");
})();

// ---- 9. 超时层级 ----
console.log("\\n===== 9. 超时层级设计 =====");
console.log("  A → B → C → D 调用链:");
console.log("    A 超时: 10s");
console.log("    B 超时: 8s  (要小于 A)");
console.log("    C 超时: 6s  (要小于 B)");
console.log("    D 超时: 4s  (要小于 C)");
console.log("  → 内层超时必须小于外层，否则外层先超时，内层还在跑");

console.log("\\n===== 微服务通信要点 =====");
console.log("  1. 内部高频用 gRPC，外部用 REST");
console.log("  2. 异步解耦用 Kafka/RabbitMQ");
console.log("  3. 必备：超时 + 重试 + 熔断 + 幂等");
console.log("  4. K8s Service 自带服务发现");
console.log("  5. 内层超时必须小于外层");`,
  },

  // =========================================================
  // 第三章：安全加固进阶
  // =========================================================
  {
    id: "node-security-hardening",
    group: "进阶干货",
    icon: "🔒",
    title: "安全加固进阶",
    content: `## 安全加固进阶

Web 安全是**木桶效应**——最弱的一块决定整体。本章讲透 **XSS、CSRF、SQL 注入、SSRF、依赖漏洞、Helmet、CORS、JWT 安全**。

### 一、OWASP Top 10 速览

| 威胁 | 描述 | 防御 |
| --- | --- | --- |
| **注入** | SQL/NoSQL/Command 注入 | 参数化查询 |
| **失效认证** | 弱密码、会话固定 | bcrypt + JWT |
| **敏感数据泄露** | 明文存储、HTTP 传输 | 加密 + HTTPS |
| **失效访问控制** | 越权访问 | 服务端鉴权 |
| **安全配置错误** | 默认配置、错误信息泄露 | Helmet |
| **XSS** | 脚本注入 | 转义 + CSP |
| **CSRF** | 跨站请求伪造 | CSRF Token |
| **已知漏洞组件** | 依赖漏洞 | npm audit |

### 二、XSS：跨站脚本攻击

#### 1. 反射型 / 存储型 / DOM 型

- **反射型**：URL 参数直接渲染（\`?name=<script>...\`）
- **存储型**：存到 DB，所有人访问都中招（评论框）
- **DOM 型**：前端 JS 操作 DOM 注入

#### 2. 防御：转义 + CSP

\`\`\`javascript
// ❌ 危险：直接拼接 HTML
res.send("<h1>" + req.query.name + "</h1>");  // 发送响应并结束

// ✅ 转义
function escapeHtml(str) {  // 声明函数 escapeHtml
  return String(str)  // 返回值
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}
res.send("<h1>" + escapeHtml(req.query.name) + "</h1>");  // 发送响应并结束
\`\`\`

#### 3. Content Security Policy（CSP）

\`\`\`javascript
app.use(helmet.contentSecurityPolicy({  // 注册 Express 中间件（每个请求依次经过）
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://cdn.example.com"]
  }
}));
\`\`\`

CSP 阻止加载非白名单的脚本，从源头防 XSS。

### 三、CSRF：跨站请求伪造

#### 防御：CSRF Token + SameSite Cookie

\`\`\`javascript
const csrf = require("csurf");  // 导入模块 csurf；require 返回 module.exports
app.use(csrf({ cookie: true }));  // 注册 Express 中间件（每个请求依次经过）
// 前端表单带 token: <input type="hidden" name="_csrf" value="<%= csrfToken %>">

// SameSite Cookie
res.cookie("session", token, {  // 设置 Cookie
  sameSite: "strict",
  secure: true,
  httpOnly: true
});
\`\`\`

### 四、SQL 注入

\`\`\`javascript
// ❌ 危险：字符串拼接
const sql = "SELECT * FROM users WHERE name = '" + req.body.name + "'";  // 定义常量 sql
// 输入: ' OR '1'='1
// SQL: SELECT * FROM users WHERE name = '' OR '1'='1  → 全表

// ✅ 参数化查询
db.query("SELECT * FROM users WHERE name = ?", [req.body.name]);
\`\`\`

### 五、SSRF：服务端请求伪造

攻击者让服务器访问**内网资源**：

\`\`\`javascript
// ❌ 危险：用户控制 URL
const response = await fetch(req.query.url);  // 可能访问 http://169.254.169.254

// ✅ 校验 + 白名单
async function safeFetch(url) {  // 声明异步函数，内部可用 await
  const parsed = new URL(url);  // 创建实例 parsed
  if (parsed.protocol !== "https:") throw new Error("仅允许 HTTPS");  // 条件判断
  const blocked = ["127.0.0.1", "169.254.169.254", "10.", "192.168.", "172.16."];  // 定义数组 blocked
  const ips = await dns.lookup(parsed.hostname, { all: true });  // 定义常量 ips
  for (const { address } of ips) {  // for 循环
    if (blocked.some(b => address.startsWith(b))) throw new Error("禁止访问内网");  // 条件判断
  }
  return fetch(url);  // 返回值
}
\`\`\`

### 六、Helmet：HTTP 安全头

\`\`\`javascript
const helmet = require("helmet");  // 导入模块 helmet；require 返回 module.exports
app.use(helmet());  // 注册 Express 中间件（每个请求依次经过）
\`\`\`

| 头 | 作用 |
| --- | --- |
| \`Content-Security-Policy\` | 限制资源加载来源 |
| \`X-Content-Type-Options: nosniff\` | 防 MIME 嗅探 |
| \`X-Frame-Options: DENY\` | 防点击劫持 |
| \`Strict-Transport-Security\` | 强制 HTTPS |
| \`Referrer-Policy\` | 控制 Referrer 泄露 |

### 七、CORS：跨域资源共享

\`\`\`javascript
const cors = require("cors");  // 导入模块 cors；require 返回 module.exports
app.use(cors({  // 注册 Express 中间件（每个请求依次经过）
  origin: ["https://app.example.com"],  // 白名单
  methods: ["GET", "POST"],
  credentials: true,
  maxAge: 86400
}));

// ❌ 危险：允许所有
app.use(cors({ origin: "*" }));  // 注册 Express 中间件（每个请求依次经过）
\`\`\`

### 八、JWT 安全

\`\`\`javascript
// ❌ 错误：用 none 算法
jwt.sign({ id: 1 }, "", { algorithm: "none" });

// ❌ 错误：放敏感信息（payload 是 base64，可解码！）
jwt.sign({ password: "xxx" }, secret);

// ✅ 正确
jwt.sign({ sub: userId, role: "admin" }, secret, {
  algorithm: "HS256",
  expiresIn: "1h",
  issuer: "myapp"
});

const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });  // 定义常量 payload
\`\`\`

**Refresh Token 模式**：
- Access Token：短期（15min），放 Authorization header
- Refresh Token：长期（7d），放 httpOnly cookie

### 九、密码存储

\`\`\`javascript
const bcrypt = require("bcrypt");  // 导入模块 bcrypt；require 返回 module.exports
const hash = await bcrypt.hash(password, 12);  // cost=12，约 250ms
const ok = await bcrypt.compare(inputPassword, hash);  // 定义常量 ok
\`\`\`

**为什么不用 MD5/SHA256**：速度太快，彩虹表能秒破。bcrypt 故意"慢"，让暴力破解成本极高。

**cost 参数**：10（开发，60ms）、12（推荐，250ms）、14（高安全，1s）

### 十、依赖漏洞扫描

\`\`\`bash
npm audit           # 检查已知漏洞
npm audit fix       # 自动修复
npx snyk test       # 更严格
\`\`\`

### 十一、Rate Limiting

\`\`\`javascript
const rateLimit = require("express-rate-limit");  // 导入模块 express-rate-limit；require 返回 module.exports
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));  // 注册 Express 中间件（每个请求依次经过）

// 登录接口更严格
app.post("/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), loginHandler);  // 注册 POST 路由处理
\`\`\`

### 十二、安全检查清单

- [ ] 用 Helmet 设置安全头
- [ ] CORS 配置白名单（不要 \`*\`）
- [ ] 输入校验（zod / joi）
- [ ] 输出转义（防 XSS）
- [ ] 参数化查询（防 SQL 注入）
- [ ] CSRF Token 或 SameSite cookie
- [ ] bcrypt 存密码（cost >= 12）
- [ ] JWT 短期 + Refresh Token
- [ ] HTTPS 强制（HSTS）
- [ ] Rate Limiting
- [ ] \`npm audit\` 定期跑
- [ ] 错误信息不泄露内部细节

下面代码演示各类攻击和防御。`,
    code: `// ============================================================
// 安全加固进阶演示
// ============================================================
const crypto = require("crypto");

// ---- 1. XSS 攻击与防御 ----
console.log("===== 1. XSS 攻击与防御 =====");
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

const maliciousInput = '<script>alert("XSS")</script>';
console.log("  原始输入:", maliciousInput);
console.log("  转义后  :", escapeHtml(maliciousInput));
console.log("  → 转义后浏览器不会执行 script 标签");

console.log("\\n  Content-Security-Policy 示例:");
console.log("    default-src 'self';");
console.log("    script-src 'self' https://cdn.example.com;");

// ---- 2. SQL 注入 ----
console.log("\\n===== 2. SQL 注入 =====");
console.log("  危险拼接:");
const userName = "' OR '1'='1";
const badSql = "SELECT * FROM users WHERE name = '" + userName + "'";
console.log("    SQL:", badSql);
console.log("    → 返回所有用户！");

console.log("  参数化查询:");
console.log("    SQL: SELECT * FROM users WHERE name = ?");
console.log("    params: ['" + userName + "']");
console.log("    → userName 被当作字符串字面值，不会执行注入");

// ---- 3. CSRF 防御 ----
console.log("\\n===== 3. CSRF 防御 =====");
function generateCsrfToken() { return crypto.randomBytes(32).toString("hex"); }
const csrfToken = generateCsrfToken();
console.log("  CSRF Token:", csrfToken.slice(0, 16) + "...");

console.log("\\n  SameSite Cookie 配置:");
console.log("    Set-Cookie: session=xxx; SameSite=Strict; Secure; HttpOnly");
console.log("    → SameSite=Strict: 跨站请求不带 cookie");
console.log("    → Secure: 只 HTTPS 传输");
console.log("    → HttpOnly: JS 不能读取");

// ---- 4. Helmet 安全头 ----
console.log("\\n===== 4. Helmet 安全头 =====");
const helmetHeaders = [
  ["Content-Security-Policy", "限制资源加载来源"],
  ["X-Content-Type-Options", "nosniff（防 MIME 嗅探）"],
  ["X-Frame-Options", "DENY（防点击劫持）"],
  ["Strict-Transport-Security", "max-age=31536000（强制 HTTPS）"],
  ["Referrer-Policy", "no-referrer（控制 Referrer 泄露）"]
];
helmetHeaders.forEach(([h, d]) => {
  console.log("  " + h.padEnd(30) + " | " + d);
});

// ---- 5. CORS 配置 ----
console.log("\\n===== 5. CORS 配置 =====");
console.log("  ✅ 安全配置:");
console.log("    cors({ origin: ['https://app.example.com'], credentials: true })");
console.log("  ❌ 危险配置:");
console.log("    cors({ origin: '*' })  // 允许所有域名");

// ---- 6. JWT 安全 ----
console.log("\\n===== 6. JWT 安全 =====");
console.log("  JWT 结构: header.payload.signature");
console.log("  - header: { alg: 'HS256', typ: 'JWT' }");
console.log("  - payload: { sub, exp, iat, role }");
console.log("  - signature: HMACSHA256(header.payload, secret)");

console.log("\\n  安全要点:");
const jwtTips = [
  "✓ 用 HS256/RS256，不用 none",
  "✓ payload 不放密码等敏感信息（base64 可解码）",
  "✓ expiresIn 短期（15min~1h）",
  "✓ 用 Refresh Token 续期",
  "✓ verify 时明确 algorithms 和 issuer",
  "✗ 不要硬编码 secret，用环境变量"
];
jwtTips.forEach(t => console.log("    " + t));

// 模拟 JWT 编码
function base64url(str) {
  return Buffer.from(str).toString("base64").replace(/=/g, "").replace(/\\+/g, "-").replace(/\\//g, "_");
}
const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
const payload = base64url(JSON.stringify({ sub: 123, role: "admin", iat: Date.now() }));
const fakeSig = crypto.createHmac("sha256", "secret").update(header + "." + payload).digest("base64url");
console.log("\\n  示例 JWT:");
console.log("    " + header + "." + payload + "." + fakeSig);
console.log("    → 注意：payload 部分能被任何人解码！");

// ---- 7. 密码哈希 ----
console.log("\\n===== 7. 密码存储 =====");
function fakeBcryptHash(password, cost) {
  const salt = "salt" + cost;
  const hash = crypto.createHash("sha256").update(password + salt).digest("hex");
  return "$2b$" + cost + "$" + salt + hash.slice(0, 22);
}
const password = "mypassword123";
console.log("  密码:", password);
console.log("  cost=10:", fakeBcryptHash(password, 10).slice(0, 30) + "...");
console.log("  cost=12:", fakeBcryptHash(password, 12).slice(0, 30) + "...");
console.log("  cost=14:", fakeBcryptHash(password, 14).slice(0, 30) + "...");

console.log("\\n  为什么不用 MD5/SHA256:");
console.log("    MD5('password') = 5f4dcc3b5aa765d61d8327deb882cf99");
console.log("    → 太快，彩虹表能秒破");
console.log("    bcrypt 故意慢（250ms），暴力破解成本极高");

// ---- 8. Rate Limiting ----
console.log("\\n===== 8. Rate Limiting =====");
class RateLimiter {
  constructor(windowMs, max) { this.windowMs = windowMs; this.max = max; this.clients = new Map(); }
  check(clientId) {
    const now = Date.now();
    if (!this.clients.has(clientId)) this.clients.set(clientId, []);
    const requests = this.clients.get(clientId);
    while (requests.length > 0 && requests[0] < now - this.windowMs) requests.shift();
    if (requests.length >= this.max) {
      return { allowed: false, retryAfter: Math.ceil((requests[0] + this.windowMs - now) / 1000) };
    }
    requests.push(now);
    return { allowed: true, remaining: this.max - requests.length };
  }
}
const limiter = new RateLimiter(1000, 3);
console.log("  限制: 1 秒最多 3 次请求");
for (let i = 1; i <= 5; i++) {
  const r = limiter.check("1.2.3.4");
  console.log("    请求 " + i + ":", r.allowed ? "允许" : "拒绝", r.allowed ? "(剩 " + r.remaining + ")" : "(等 " + r.retryAfter + "s)");
}

// ---- 9. 输入校验 ----
console.log("\\n===== 9. 输入校验 =====");
function validateInput(input, rules) {
  const errors = [];
  for (const [field, rule] of Object.entries(rules)) {
    const value = input[field];
    if (rule.required && (value === undefined || value === "")) {
      errors.push(field + " 必填"); continue;
    }
    if (value === undefined) continue;
    if (rule.type === "email" && !/^[^@]+@[^@]+\\.[^@]+$/.test(value)) errors.push(field + " 不是合法邮箱");
    if (rule.maxLength && value.length > rule.maxLength) errors.push(field + " 超过最大长度 " + rule.maxLength);
    if (rule.pattern && !rule.pattern.test(value)) errors.push(field + " 格式不正确");
  }
  return errors;
}
const userInput = { email: "invalid-email", password: "123", username: "a<b>script" };
const errors = validateInput(userInput, {
  email: { required: true, type: "email" },
  password: { required: true, pattern: /^(?=.*[A-Z])(?=.*[0-9])/ },
  username: { required: true, maxLength: 20, pattern: /^[a-zA-Z0-9_]+$/ }
});
console.log("  输入:", userInput);
console.log("  错误:", errors.length === 0 ? "无" : errors);

// ---- 10. SSRF 防御 ----
console.log("\\n===== 10. SSRF 防御 =====");
console.log("  ❌ 危险: 直接 fetch 用户提供的 URL");
console.log("     可能访问: http://169.254.169.254 (AWS metadata)");
console.log("              http://localhost:6379 (Redis)");
console.log("\\n  ✅ 防御:");
console.log("     1. 只允许 HTTPS");
console.log("     2. 解析 DNS 后校验 IP 是否内网");
console.log("     3. 用白名单域名");
console.log("     4. 限制超时和重定向");

// ---- 11. 安全清单 ----
console.log("\\n===== 11. 安全检查清单 =====");
const checklist = [
  "□ Helmet 设置安全头",
  "□ CORS 白名单配置",
  "□ 输入校验（zod/joi）",
  "□ 输出转义防 XSS",
  "□ 参数化查询防 SQL 注入",
  "□ CSRF Token 或 SameSite",
  "□ bcrypt 存密码（cost≥12）",
  "□ JWT 短期 + Refresh Token",
  "□ HTTPS 强制（HSTS）",
  "□ Rate Limiting",
  "□ npm audit 定期跑",
  "□ 错误信息不泄露内部细节"
];
checklist.forEach(c => console.log("  " + c));

console.log("\\n===== 安全加固要点 =====");
console.log("  1. 安全是木桶效应，最弱决定整体");
console.log("  2. 输入永远不可信，必须校验+转义");
console.log("  3. 密码用 bcrypt，不用 MD5/SHA256");
console.log("  4. JWT 短期 + Refresh Token 模式");
console.log("  5. npm audit + snyk 查依赖漏洞");`,
  },

  // =========================================================
  // 第四章：日期时区处理
  // =========================================================
  {
    id: "node-datetime-timezone",
    group: "进阶干货",
    icon: "🕐",
    title: "日期时区处理",
    content: `## 日期时区处理

日期时区是后端最容易踩坑的地方。本章讲透 **ISO 8601、UTC 存储、时区转换、夏令时、Intl API**。

### 一、Date 对象的真相

JavaScript 的 \`Date\` 内部存的是**自 1970-01-01 UTC 以来的毫秒数**，没有时区信息：

\`\`\`javascript
const d = new Date();  // 创建实例 d
d.getTime();        // 1700000000000（毫秒数，UTC）
d.toString();       // 本地时区字符串
d.toISOString();    // UTC 字符串（推荐）
d.toLocaleString(); // 本地化字符串
\`\`\`

**坑**：\`new Date("2024-01-01")\` 被解析为 **UTC**，\`new Date("2024-01-01T00:00:00")\` 被解析为**本地时区**！

\`\`\`javascript
new Date("2024-01-01");              // UTC 2024-01-01 00:00:00
new Date("2024-01-01T00:00:00");     // 本地时区 2024-01-01 00:00:00
new Date("2024-01-01T00:00:00Z");    // UTC（带 Z 后缀）
new Date("2024/01/01");              // 本地时区
\`\`\`

### 二、ISO 8601 格式

\`\`\`
2024-01-15T10:30:00Z           # UTC（带 Z）
2024-01-15T10:30:00+08:00      # 北京时区
2024-01-15T10:30:00.123Z       # 带毫秒
2024-01-15                      # 仅日期
\`\`\`

**关键**：
- 末尾 \`Z\` 表示 UTC
- \`+08:00\` 表示东八区
- 不带时区后缀的**有歧义**，Node.js 解析为本地时区

### 三、UTC 存储原则

**核心原则**：数据库存 UTC，展示时转用户时区。

\`\`\`javascript
// 存储（UTC）
const now = new Date();  // 创建实例 now
db.save({ created_at: now.toISOString() });
// "2024-01-15T02:30:00.000Z"

// 展示（转用户时区）
const utcTime = "2024-01-15T02:30:00.000Z";  // 定义常量 utcTime
const beijingTime = new Date(utcTime).toLocaleString("zh-CN", {  // 创建实例 beijingTime
  timeZone: "Asia/Shanghai"
});
// "2024/1/15 10:30:00"
\`\`\`

**为什么不存本地时区**：
- 多时区用户混乱
- 夏令时切换会让时间"消失"或"重复"
- 跨服务器时区不一致

### 四、Intl API：现代时区处理

\`\`\`javascript
const date = new Date("2024-01-15T02:30:00Z");  // 创建实例 date

new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit",
  hour12: false
}).format(date);
// "2024/01/15 10:30:00"
\`\`\`

### 五、时区列表

| 时区 | IANA 名称 | UTC 偏移 |
| --- | --- | --- |
| 北京 | Asia/Shanghai | +08:00 |
| 东京 | Asia/Tokyo | +09:00 |
| 纽约 | America/New_York | -05:00（夏令 -04:00） |
| 伦敦 | Europe/London | +00:00（夏令 +01:00） |
| 洛杉矶 | America/Los_Angeles | -08:00（夏令 -07:00） |

**不要用** \`"GMT+8"\` 这种简写，用 IANA 名称才能正确处理夏令时。

### 六、夏令时（DST）的坑

夏令时会让时间"跳过"或"重复"：

\`\`\`
2024-03-10 01:59:59 (EST) → 03:00:00 (EDT)  // 跳过 2:00-2:59
2024-11-03 01:59:59 (EDT) → 01:00:00 (EST)  // 重复 1:00-1:59
\`\`\`

**问题**：定时任务在 2:30 触发，那天可能不触发或触发两次。

**防御**：用 UTC 触发定时任务。

### 七、时间运算

#### 1. 原生 Date（不推荐）

\`\`\`javascript
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);  // 创建实例 tomorrow
// ❌ 坑：没考虑夏令时（25/23 小时）
\`\`\`

#### 2. 用 dayjs（推荐）

\`\`\`javascript
const dayjs = require("dayjs");  // 导入模块 dayjs；require 返回 module.exports
dayjs().add(7, "day").format();
dayjs().subtract(2, "hour").format();
dayjs("2024-01-15").diff(dayjs("2024-01-10"), "day");  // 5
\`\`\`

**为什么不用 moment.js**：moment 已停止维护，体积大（67KB vs dayjs 2KB）。

### 八、相对时间

\`\`\`javascript
const rtf = new Intl.RelativeTimeFormat("zh-CN", { numeric: "auto" });  // 创建实例 rtf
rtf.format(-1, "day");   // "昨天"
rtf.format(2, "hour");   // "2 小时后"

function timeAgo(date) {  // 声明函数 timeAgo
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);  // 定义常量 seconds
  if (seconds < 60) return seconds + " 秒前";  // 条件判断
  if (seconds < 3600) return Math.floor(seconds / 60) + " 分钟前";  // 条件判断
  if (seconds < 86400) return Math.floor(seconds / 3600) + " 小时前";  // 条件判断
  return Math.floor(seconds / 86400) + " 天前";  // 返回值
}
\`\`\`

### 九、时间戳

\`\`\`javascript
Math.floor(Date.now() / 1000);  // Unix 秒：1700000000
Date.now();                      // 毫秒（JS 默认）：1700000000000
new Date(1700000000 * 1000);     // 秒 → Date
\`\`\`

### 十、常见踩坑

#### 1. 月份从 0 开始

\`\`\`javascript
new Date(2024, 0, 1);   // 2024-01-01（月是 0-11）
new Date(2024, 11, 31); // 2024-12-31
\`\`\`

#### 2. 30 vs 31 天

\`\`\`javascript
new Date(2024, 1, 30);  // 2024-03-01（2 月没 30 日，溢出）
\`\`\`

#### 3. 解析歧义

\`\`\`javascript
new Date("2024-01-15");          // UTC
new Date("2024-01-15T00:00:00"); // 本地
new Date("2024/01/15");          // 本地
\`\`\`

**统一**：永远用 \`toISOString()\` 存储和传输。

### 十一、推荐实践

- 存储：UTC（\`toISOString()\` 或时间戳）
- 传输：ISO 8601 字符串
- 展示：前端转用户时区
- 运算：用 dayjs / date-fns
- 时区名：用 IANA（\`Asia/Shanghai\`，不用 \`GMT+8\`）
- 定时任务：用 UTC

下面代码演示时区转换、格式化、运算。`,
    code: `// ============================================================
// 日期时区处理演示
// ============================================================

// ---- 1. Date 对象基础 ----
console.log("===== 1. Date 对象基础 =====");
const now = new Date();
console.log("  getTime()      :", now.getTime(), "(UTC 毫秒数)");
console.log("  toISOString()   :", now.toISOString(), "(UTC 字符串)");
console.log("  toLocaleString():", now.toLocaleString("zh-CN"));

// ---- 2. 解析歧义 ----
console.log("\\n===== 2. 日期解析的坑 =====");
const tests = [
  ["2024-01-15", "仅日期（UTC）"],
  ["2024-01-15T00:00:00", "带时间（本地）"],
  ["2024-01-15T00:00:00Z", "带 Z（UTC）"],
  ["2024/01/15", "斜杠（本地）"],
  ["2024-01-15T00:00:00+08:00", "带时区偏移"]
];
tests.forEach(([str, desc]) => {
  const d = new Date(str);
  console.log("  " + str.padEnd(28) + " → " + d.toISOString() + " (" + desc + ")");
});

// ---- 3. UTC 存储 + 本地展示 ----
console.log("\\n===== 3. UTC 存储 + 本地展示 =====");
const utcTime = "2024-01-15T02:30:00.000Z";
console.log("  存储（UTC）:", utcTime);

const timezones = [
  ["Asia/Shanghai", "北京"],
  ["Asia/Tokyo", "东京"],
  ["America/New_York", "纽约"],
  ["Europe/London", "伦敦"],
  ["America/Los_Angeles", "洛杉矶"]
];
timezones.forEach(([tz, name]) => {
  const local = new Date(utcTime).toLocaleString("zh-CN", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  });
  console.log("  " + name.padEnd(8) + " (" + tz.padEnd(20) + "): " + local);
});

// ---- 4. Intl.DateTimeFormat ----
console.log("\\n===== 4. Intl.DateTimeFormat =====");
const date = new Date("2024-01-15T02:30:00Z");
const formats = [
  ["zh-CN", "中国"], ["en-US", "美国"], ["de-DE", "德国"],
  ["ja-JP", "日本"], ["fr-FR", "法国"]
];
formats.forEach(([locale, name]) => {
  const formatted = new Intl.DateTimeFormat(locale, {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  }).format(date);
  console.log("  " + name.padEnd(6) + " (" + locale + "): " + formatted);
});

// ---- 5. 时区偏移 ----
console.log("\\n===== 5. 时区偏移 =====");
function getTimezoneOffset(tz, date = new Date()) {
  const utc = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const local = new Date(date.toLocaleString("en-US", { timeZone: tz }));
  return (local - utc) / 3600000;
}
timezones.forEach(([tz, name]) => {
  const offset = getTimezoneOffset(tz);
  const sign = offset >= 0 ? "+" : "";
  console.log("  " + name.padEnd(8) + " UTC" + sign + offset + " (小时)");
});

// ---- 6. 时间运算 ----
console.log("\\n===== 6. 时间运算 =====");
const start = new Date("2024-01-15T00:00:00Z");
const end = new Date("2024-01-20T00:00:00Z");
const diffMs = end - start;
console.log("  原生计算:");
console.log("    差值:", diffMs, "ms =", diffMs / 1000 / 60 / 60 / 24, "天");
console.log("    → 不考虑夏令时，可能不准");

class SimpleDate {
  constructor(d) { this.d = new Date(d); }
  static now() { return new SimpleDate(new Date()); }
  add(value, unit) {
    const units = { day: 86400000, hour: 3600000, minute: 60000, second: 1000 };
    return new SimpleDate(new Date(this.d.getTime() + value * units[unit]));
  }
  subtract(value, unit) { return this.add(-value, unit); }
  format() { return this.d.toISOString(); }
  diff(other, unit = "ms") {
    const units = { day: 86400000, hour: 3600000, minute: 60000, second: 1000, ms: 1 };
    return Math.floor((this.d - other.d) / units[unit]);
  }
}

console.log("\\n  SimpleDate（模拟 dayjs）:");
const d1 = new SimpleDate("2024-01-15T00:00:00Z");
const d2 = d1.add(7, "day");
const d3 = d1.subtract(2, "hour");
console.log("    原    :", d1.format());
console.log("    +7天 :", d2.format());
console.log("    -2小时:", d3.format());
console.log("    差值 :", d2.diff(d1, "day"), "天");

// ---- 7. 相对时间 ----
console.log("\\n===== 7. 相对时间 =====");
const rtf = new Intl.RelativeTimeFormat("zh-CN", { numeric: "auto" });
const relativeTests = [
  [-1, "day", "昨天"], [1, "day", "明天"],
  [-2, "hour", "2 小时前"], [3, "minute", "3 分钟后"]
];
relativeTests.forEach(([val, unit, expected]) => {
  console.log("  " + rtf.format(val, unit).padEnd(15) + " (" + expected + ")");
});

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return seconds + " 秒前";
  if (seconds < 3600) return Math.floor(seconds / 60) + " 分钟前";
  if (seconds < 86400) return Math.floor(seconds / 3600) + " 小时前";
  return Math.floor(seconds / 86400) + " 天前";
}
console.log("\\n  手动计算:");
[
  new Date(Date.now() - 30 * 1000),
  new Date(Date.now() - 5 * 60 * 1000),
  new Date(Date.now() - 3 * 3600 * 1000)
].forEach(d => console.log("    " + timeAgo(d)));

// ---- 8. 月份从 0 开始的坑 ----
console.log("\\n===== 8. 月份从 0 开始 =====");
console.log("  new Date(2024, 0, 1)  →", new Date(2024, 0, 1).toISOString());
console.log("  new Date(2024, 11, 31)→", new Date(2024, 11, 31).toISOString());
console.log("  → 月份是 0-11，不是 1-12！");

console.log("\\n  日期溢出:");
console.log("  new Date(2024, 1, 30) →", new Date(2024, 1, 30).toISOString(), "(2 月没 30 日)");
console.log("  new Date(2024, 2, 0)  →", new Date(2024, 2, 0).toISOString(), "(0 = 上月最后一天)");

// ---- 9. JSON 序列化 ----
console.log("\\n===== 9. JSON 序列化 =====");
const data = { created_at: new Date("2024-01-15T02:30:00Z") };
const json = JSON.stringify(data);
console.log("  原始对象:", data);
console.log("  JSON 字符串:", json);

const parsed = JSON.parse(json, (key, value) => {
  if (typeof value === "string" && /^\\d{4}-\\d{2}-\\d{2}T/.test(value)) return new Date(value);
  return value;
});
console.log("  反序列化后 created_at 是 Date?", parsed.created_at instanceof Date);

// ---- 10. 工作日计算 ----
console.log("\\n===== 10. 工作日计算 =====");
function countWorkdays(start, end) {
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}
const ws = new Date("2024-01-15T00:00:00Z");
const we = new Date("2024-01-21T00:00:00Z");
console.log("  2024-01-15 到 2024-01-21");
console.log("  工作日数:", countWorkdays(ws, we), "天");

// ---- 11. 推荐实践 ----
console.log("\\n===== 11. 推荐实践 =====");
const practices = [
  "✓ 存储：UTC（toISOString 或时间戳）",
  "✓ 传输：ISO 8601 字符串",
  "✓ 展示：前端转用户时区",
  "✓ 运算：用 dayjs/date-fns",
  "✓ 时区名：用 IANA（Asia/Shanghai）",
  "✓ 定时任务：用 UTC",
  "✗ 不要用 GMT+8 简写",
  "✗ 不要用 moment.js（已停止维护）",
  "✗ 不要用原生 Date 加减（夏令时坑）"
];
practices.forEach(p => console.log("  " + p));

console.log("\\n===== 日期时区要点 =====");
console.log("  1. 存 UTC，显示转本地");
console.log("  2. ISO 8601 是传输标准");
console.log("  3. 月份从 0 开始（坑）");
console.log("  4. 用 dayjs 代替 moment");
console.log("  5. 定时任务用 UTC");`,
  },

  // =========================================================
  // 第五章：正则性能与灾难回溯
  // =========================================================
  {
    id: "node-regex-performance",
    group: "进阶干货",
    icon: "⚡",
    title: "正则性能与灾难回溯",
    content: `## 正则性能与灾难回溯

正则表达式写不好会导致**灾难性回溯**（Catastrophic Backtracking），CPU 100% 卡死进程。曾经 Cloudflare、Stack Overflow 都因此宕机。

### 一、正则引擎：NFA vs DFA

| 类型 | 全称 | 特点 | 代表 |
| --- | --- | --- | --- |
| **NFA** | 非确定性有限自动机 | 回溯，可能指数复杂度 | PCRE、JS、Python |
| **DFA** | 确定性有限自动机 | 线性复杂度 | grep、awk |

JavaScript 用的是 **NFA**，会回溯。这是性能问题的根源。

### 二、灾难性回溯实例

#### 经典案例：\`(a+)+\`

\`\`\`javascript
const evil = /(a+)+b/;  // 定义常量 evil
evil.test("a".repeat(30));  // 1 秒
evil.test("a".repeat(35));  // 30 秒
evil.test("a".repeat(40));  // 卡死！
\`\`\`

**为什么**：
- \`a+\` 贪婪匹配所有 a
- 后面没 b，回溯
- \`(a+)+\` 的分组方式让回溯呈**指数增长**

#### 危险模式清单

\`\`\`
(a+)+        嵌套量词
(a*)*        嵌套量词
(a|a)*       重叠分支
(.*)*        任意字符嵌套
(a.b)*       字符+量词嵌套
\`\`\`

### 三、检测灾难性回溯

\`\`\`javascript
function isEvil(regex, str) {  // 声明函数 isEvil
  const start = Date.now();  // 定义常量 start
  regex.test(str);
  return Date.now() - start > 100;  // 返回值
}
console.log(isEvil(/(a+)+b/, "a".repeat(30)));  // true
\`\`\`

**生产建议**：
- 设置超时（正则本身不支持，需用 worker_threads）
- 用 safe-regex2 静态检测
- 限制输入长度

### 四、正则优化技巧

#### 1. 避免贪婪量词

\`\`\`javascript
// ❌ 贪婪，回溯多
/<.*>/

// ✅ 非贪婪
/<.*?>/

// ✅✅ 否定字符类（最佳）
/<[^>]*>/
\`\`\`

#### 2. 用字符类代替分支

\`\`\`javascript
// ❌ 分支
/a|b|c|d/

// ✅ 字符类
/[abcd]/
\`\`\`

#### 3. 锚定开头

\`\`\`javascript
// ❌ 每个位置都试
/foo/

// ✅ 锚定后只试一次
/^foo/
\`\`\`

#### 4. 提取公共前缀

\`\`\`javascript
// ❌
/abc|abd/

// ✅
/ab(?:c|d)/
\`\`\`

#### 5. 避免捕获组

\`\`\`javascript
// ❌ 捕获组（开销大）
/(\\d+)-(\\d+)/

// ✅ 非捕获组
/(?:\\d+)-(?:\\d+)/
\`\`\`

#### 6. 预编译

\`\`\`javascript
// ❌ 每次都编译
function isEmail(s) { return /^\\S+@\\S+$/.test(s); }  // 声明函数 isEmail

// ✅ 预编译
const EMAIL_RE = /^\\S+@\\S+$/;  // 定义常量 EMAIL_RE
function isEmail(s) { return EMAIL_RE.test(s); }  // 声明函数 isEmail
\`\`\`

### 五、复杂正则的替代方案

#### 1. 用 String 方法

\`\`\`javascript
str.includes("foo");         // 比 /foo/.test(str) 快
str.startsWith("foo");
str.endsWith("foo");
\`\`\`

#### 2. 状态机解析

复杂格式（如 CSV、URL）用状态机比正则更稳定。

#### 3. 用专门的解析库

- URL：\`new URL()\`（内置）
- JSON：\`JSON.parse()\`
- HTML：\`cheerio\`、\`DOMParser\`

### 六、正则安全使用清单

1. **限制输入长度**：先 \`if (str.length > 1000) return false\`
2. **用 safe-regex 静态检测**
3. **设置超时**：worker_threads 里跑
4. **避免嵌套量词**：\`(a+)+\` 是毒药
5. **用字符类代替分支**：\`[abc]\` 比 \`a|b|c\` 快
6. **预编译正则**：放到模块顶层
7. **能用字符串方法就用**：\`includes\` 比 \`test\` 快

### 七、性能对比

\`\`\`javascript
const str = "Hello, World!";  // 定义常量 str

// 性能从快到慢
str.includes("World");         // 最快（C++ 实现）
str.indexOf("World") !== -1;   // 次之
/World/.test(str);              // 较慢
str.match(/World/);             // 最慢
\`\`\`

### 八、典型正则库

| 场景 | 正则 |
| --- | --- |
| 邮箱 | \`^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$\` |
| URL | 用 \`new URL()\` 代替 |
| 手机号 | \`^1[3-9]\\d{9}$\` |
| IP | \`^(?:\\d{1,3}\\.){3}\\d{1,3}$\` |
| 中文字符 | \`^[\\u4e00-\\u9fa5]+$\` |
| 身份证 | \`^\\d{17}[\\dXx]$\` |

### 九、调试技巧

#### 1. regex101.com

可视化展示匹配过程，调试神器。

#### 2. 命名捕获组（ES2018）

\`\`\`javascript
const re = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/;  // 定义常量 re
const m = "2024-01-15".match(re);  // 定义常量 m
console.log(m.groups);  // { year: '2024', month: '01', day: '15' }
\`\`\`

#### 3. Lookbehind（ES2018）

\`\`\`javascript
"$100".match(/(?<=\\$)\\d+/);  // ['100']
\`\`\`

下面代码演示灾难性回溯和优化技巧。`,
    code: `// ============================================================
// 正则性能与灾难回溯演示
// ============================================================

// ---- 1. 灾难性回溯 ----
console.log("===== 1. 灾难性回溯 =====");
console.log("  经典毒药: /(a+)+b/");
console.log("  对 'a'.repeat(N) 的执行时间:");

const testString = "a".repeat(20);
const evilRegex = /(a+)+b/;
const start1 = Date.now();
evilRegex.test(testString);
const elapsed1 = Date.now() - start1;
console.log("  N=20  耗时: " + elapsed1 + "ms");

console.log("\\n  理论复杂度:");
for (const n of [10, 15, 20, 25, 30]) {
  console.log("    N=" + n + " → 约 " + Math.pow(2, n / 2).toFixed(0) + " 次回溯");
}

// ---- 2. 危险模式清单 ----
console.log("\\n===== 2. 危险正则模式 =====");
const evilPatterns = [
  ["(a+)+", "嵌套量词"],
  ["(a*)*", "嵌套量词"],
  ["(a|a)*", "重叠分支"],
  ["(.*)*", "任意字符嵌套"],
  ["(a.b)*", "字符+量词嵌套"]
];
evilPatterns.forEach(([p, desc]) => {
  console.log("  " + p.padEnd(12) + " | " + desc);
});

// ---- 3. 安全检测函数 ----
console.log("\\n===== 3. 正则安全检测 =====");
function isSafeRegex(regex, maxTime = 50) {
  const testStr = "a".repeat(15);
  const start = Date.now();
  regex.test(testStr);
  return Date.now() - start < maxTime;
}
console.log("  /(a+)+b/ 安全?", isSafeRegex(/(a+)+b/));
console.log("  /^[a-z]+$/ 安全?", isSafeRegex(/^[a-z]+$/));

// ---- 4. 优化对比 ----
console.log("\\n===== 4. 优化技巧对比 =====");
const html = "<div>" + "x".repeat(100) + "</div>";

const tests = [
  { name: "贪婪 /<.*>/", re: /<.*>/ },
  { name: "非贪婪 /<.*?>/", re: /<.*?>/ },
  { name: "字符类 /<[^>]*>/", re: /<[^>]*>/ }
];
tests.forEach(({ name, re }) => {
  const start = Date.now();
  for (let i = 0; i < 100000; i++) re.test(html);
  console.log("  " + name.padEnd(25) + ": " + (Date.now() - start) + "ms");
});

// ---- 5. 字符类 vs 分支 ----
console.log("\\n===== 5. 字符类 vs 分支 =====");
const str = "hello";
const branchTests = [
  { name: "分支 /a|b|c|d|e/", re: /a|b|c|d|e/ },
  { name: "字符类 /[abcde]/", re: /[abcde]/ }
];
branchTests.forEach(({ name, re }) => {
  const start = Date.now();
  for (let i = 0; i < 1000000; i++) re.test(str);
  console.log("  " + name.padEnd(25) + ": " + (Date.now() - start) + "ms");
});

// ---- 6. 锚定优化 ----
console.log("\\n===== 6. 锚定优化 =====");
const longText = "x".repeat(1000) + "foo";
const anchorTests = [
  { name: "无锚 /foo/", re: /foo/ },
  { name: "锚定 /^foo/", re: /^foo/ }
];
anchorTests.forEach(({ name, re }) => {
  const start = Date.now();
  for (let i = 0; i < 1000000; i++) re.test(longText);
  console.log("  " + name.padEnd(20) + ": " + (Date.now() - start) + "ms");
});

// ---- 7. 捕获 vs 非捕获 ----
console.log("\\n===== 7. 捕获 vs 非捕获 =====");
const testStr2 = "2024-01-15";
const captureTests = [
  { name: "捕获 /(\\d+)-(\\d+)-(\\d+)/", re: /(\\d+)-(\\d+)-(\\d+)/ },
  { name: "非捕获 /(?:\\d+)-(?:\\d+)-(?:\\d+)/", re: /(?:\\d+)-(?:\\d+)-(?:\\d+)/ }
];
captureTests.forEach(({ name, re }) => {
  const start = Date.now();
  for (let i = 0; i < 1000000; i++) re.test(testStr2);
  console.log("  " + name.padEnd(40) + ": " + (Date.now() - start) + "ms");
});

// ---- 8. 预编译 ----
console.log("\\n===== 8. 预编译 =====");
const EMAIL_RE = /^\\S+@\\S+\\.\\S+$/;
function isEmailPrecompiled(s) { return EMAIL_RE.test(s); }
function isEmailInline(s) { return /^\\S+@\\S+\\.\\S+$/.test(s); }

const email = "alice@example.com";
const startPre = Date.now();
for (let i = 0; i < 1000000; i++) isEmailPrecompiled(email);
const preTime = Date.now() - startPre;

const startInline = Date.now();
for (let i = 0; i < 1000000; i++) isEmailInline(email);
const inlineTime = Date.now() - startInline;

console.log("  预编译: " + preTime + "ms");
console.log("  内联  : " + inlineTime + "ms");
console.log("  提升  : " + ((1 - preTime / inlineTime) * 100).toFixed(1) + "%");

// ---- 9. 字符串方法 vs 正则 ----
console.log("\\n===== 9. 字符串方法 vs 正则 =====");
const longStr = "x".repeat(100) + "World" + "x".repeat(100);
const strTests = [
  { name: "includes", fn: () => longStr.includes("World") },
  { name: "indexOf", fn: () => longStr.indexOf("World") !== -1 },
  { name: "test", fn: () => /World/.test(longStr) },
  { name: "match", fn: () => longStr.match(/World/) !== null }
];
strTests.forEach(({ name, fn }) => {
  const start = Date.now();
  for (let i = 0; i < 1000000; i++) fn();
  console.log("  " + name.padEnd(10) + ": " + (Date.now() - start) + "ms");
});

// ---- 10. 命名捕获组 ----
console.log("\\n===== 10. 命名捕获组 =====");
const re = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/;
const m = "2024-01-15".match(re);
if (m) {
  console.log("  匹配:", m[0]);
  console.log("  groups:", JSON.stringify(m.groups));
}

// ---- 11. Lookbehind ----
console.log("\\n===== 11. Lookbehind =====");
const lookbehindTests = [
  ['(?<=\\$)\\d+', '$100', '匹配 $ 后的数字'],
  ['(?<!\\$)\\d+', '100 $200', '匹配非 $ 后的数字']
];
lookbehindTests.forEach(([re, str, desc]) => {
  const matches = str.match(new RegExp(re, "g"));
  console.log("  /" + re + "/.match('" + str + "') =", matches, "(" + desc + ")");
});

// ---- 12. CSV 解析（状态机） ----
console.log("\\n===== 12. CSV 解析（状态机） =====");
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ""; }
      else if (c === '\\n') { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c !== '\\r') field += c;
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}
const csv = 'name,age,desc\\n"Alice",30,"Hello, World"\\n"Bob",25,"He said \\"hi\\""';
const rows = parseCSV(csv);
console.log("  CSV 内容:", JSON.stringify(csv));
console.log("  解析结果:");
rows.forEach(r => console.log("    " + JSON.stringify(r)));

// ---- 13. 实用正则清单 ----
console.log("\\n===== 13. 实用正则清单 =====");
const usefulRegex = [
  ["邮箱", /^\\S+@\\S+\\.\\S+$/, "alice@example.com"],
  ["手机号", /^1[3-9]\\d{9}$/, "13812345678"],
  ["IP v4", /^(?:\\d{1,3}\\.){3}\\d{1,3}$/, "192.168.1.1"],
  ["中文", /^[\\u4e00-\\u9fa5]+$/, "你好世界"],
  ["身份证", /^\\d{17}[\\dXx]$/, "110101199001011234"]
];
usefulRegex.forEach(([name, re, example]) => {
  console.log("  " + name.padEnd(8) + " | " + (re.test(example) ? "✓" : "✗") + " " + example);
});

console.log("\\n===== 正则性能要点 =====");
console.log("  1. 嵌套量词是毒药：(a+)+");
console.log("  2. 用字符类代替分支：[abc] 替代 a|b|c");
console.log("  3. 锚定开头：^");
console.log("  4. 非捕获组：(?:...) 替代 (...)");
console.log("  5. 简单匹配用 includes/indexOf");`,
  },

  // =========================================================
  // 第六章：定时任务进阶
  // =========================================================
  {
    id: "node-cron-jobs",
    group: "进阶干货",
    icon: "⏰",
    title: "定时任务进阶",
    content: `## 定时任务进阶

定时任务看着简单（\`setInterval\` 而已），生产环境却要处理**分布式锁、重试、幂等、补偿、错过重跑**。

### 一、Node.js 定时任务方案对比

| 方案 | 适用 | 优势 | 劣势 |
| --- | --- | --- | --- |
| \`setInterval\` | 单进程简单任务 | 内置 | 不持久、重启丢失 |
| \`node-cron\` | 单进程 cron 表达式 | 灵活 | 同上 |
| **BullMQ** | 分布式 | 持久、重试、并发 | 依赖 Redis |
| **Agenda** | 分布式 | 持久 | 依赖 MongoDB |
| 系统级 cron | 跨进程 | 简单 | 难管理、难监控 |

### 二、setInterval 的坑

#### 1. 重启丢失

\`\`\`javascript
setInterval(() => sendDailyReport(), 24 * 60 * 60 * 1000);  // 周期回调
// 进程重启后任务消失！
\`\`\`

#### 2. 时间漂移

\`\`\`javascript
// ❌ setInterval 不准
setInterval(task, 1000);  // 周期回调
// 如果 task 耗时 1.5s，实际间隔变成 2.5s
\`\`\`

#### 3. 重叠执行

\`\`\`javascript
let running = false;  // 定义变量 running（可变）
setInterval(async () => {  // 周期回调
  if (running) return;  // 条件判断
  running = true;
  try { await longTask(); }  // 开启 try 块捕获异常
  finally { running = false; }  // 无论是否异常都执行
}, 60000);
\`\`\`

### 三、node-cron 实战

\`\`\`javascript
const cron = require("node-cron");  // 导入模块 node-cron；require 返回 module.exports

cron.schedule("0 3 * * *", () => generateReport());  // 每天凌晨 3 点
cron.schedule("*/5 * * * *", () => checkHealth());    // 每 5 分钟
cron.schedule("0 9 * * 1-5", () => sendEmail());      // 工作日早上 9 点
\`\`\`

#### cron 表达式详解

\`\`\`
*    *    *    *    *
分   时   日   月   周
0-59 0-23 1-31 1-12 0-6

特殊符号:
*     任意值
*/5   每 5（分钟）
1,3,5 列表
1-5   范围
\`\`\`

| 表达式 | 含义 |
| --- | --- |
| \`0 * * * *\` | 每小时整点 |
| \`*/15 * * * *\` | 每 15 分钟 |
| \`0 9 * * 1-5\` | 工作日 9 点 |
| \`0 0 1 * *\` | 每月 1 号 |
| \`0 0 * * 0\` | 每周日 |

### 四、分布式定时任务

#### 问题：多实例重复执行

K8s 部署 3 个 Pod，每个 Pod 都跑 \`node-cron\`，结果每天 3 点执行**3 次**月度报告。

#### 解决方案 1：分布式锁

\`\`\`javascript
const redis = new Redis();  // 创建实例 redis
cron.schedule("0 3 * * *", async () => {
  const acquired = await redis.set("lock:daily-report", "1", "EX", 3600, "NX");  // 定义常量 acquired
  if (!acquired) return;  // 条件判断
  try { await generateReport(); }  // 开启 try 块捕获异常
  finally { await redis.del("lock:daily-report"); }  // 无论是否异常都执行
});
\`\`\`

**关键**：
- \`NX\`：只在不存在的时设置
- \`EX 3600\`：1 小时过期（防进程崩溃锁不释放）

#### 解决方案 2：BullMQ

\`\`\`javascript
const { Queue, Worker } = require("bullmq");  // 导入模块 bullmq；require 返回 module.exports
const queue = new Queue("reports", { connection: redis });  // 创建实例 queue

queue.add("daily-report", {}, {
  repeat: { pattern: "0 3 * * *" },
  removeOnComplete: true
});

const worker = new Worker("reports", async (job) => {  // 创建实例 worker
  await generateReport();  // 等待 Promise 完成后再继续
}, { connection: redis });
\`\`\`

**BullMQ 优势**：
- 自动分布式锁
- 失败自动重试
- 任务持久化（Redis）
- 并发控制
- 任务追踪

### 五、错过任务的处理

\`node-cron\` 默认会**错过**这次任务。要补跑需自己实现：

\`\`\`javascript
const lastRunKey = "last-run:daily-report";  // 定义常量 lastRunKey
async function runWithCatchup() {  // 声明异步函数，内部可用 await
  const lastRun = await redis.get(lastRunKey);  // 定义常量 lastRun
  const now = new Date();  // 创建实例 now
  if (lastRun) {  // 条件判断
    const missed = Math.floor((now - new Date(parseInt(lastRun))) / (24 * 60 * 60 * 1000));  // 定义常量 missed
    if (missed > 0) {  // 条件判断
      for (let i = missed; i > 0; i--) {  // for 循环
        const targetDate = new Date(now - i * 24 * 60 * 60 * 1000);  // 创建实例 targetDate
        await generateReport(targetDate);  // 等待 Promise 完成后再继续
      }
    }
  }
  await generateReport(now);  // 等待 Promise 完成后再继续
  await redis.set(lastRunKey, now.getTime());  // 等待 Promise 完成后再继续
}
\`\`\`

**BullMQ 的解决**：持久化 + 重启后自动接着跑。

### 六、任务幂等性

定时任务可能重复执行（重试、补跑），必须**幂等**：

\`\`\`javascript
async function generateReport(date) {  // 声明异步函数，内部可用 await
  const reportId = "report:" + date.toISOString().slice(0, 10);  // 定义常量 reportId
  const existing = await db.getReport(reportId);  // 定义常量 existing
  if (existing && existing.status === "completed") return existing;  // 条件判断
  
  await db.upsertReport(reportId, { status: "processing" });  // 等待 Promise 完成后再继续
  try {  // 开启 try 块捕获异常
    const data = await collectData(date);  // 定义常量 data
    const pdf = await renderPdf(data);  // 定义常量 pdf
    await db.upsertReport(reportId, { status: "completed", pdf_url: pdf.url });  // 等待 Promise 完成后再继续
  } catch (err) {
    await db.upsertReport(reportId, { status: "failed" });  // 等待 Promise 完成后再继续
    throw err;  // 抛出异常
  }
}
\`\`\`

### 七、长任务的进度追踪

\`\`\`javascript
async function longJob(job) {  // 声明异步函数，内部可用 await
  for (let i = 0; i < 1000; i++) {  // for 循环
    await processItem(i);  // 等待 Promise 完成后再继续
    await job.updateProgress((i / 1000) * 100);  // 等待 Promise 完成后再继续
  }
}

worker.on("progress", (job, progress) => {  // 监听工作线程消息
  console.log("任务", job.id, "进度:", progress + "%");  // 打印日志到 stdout
});
\`\`\`

### 八、任务编排

#### FlowProducer（DAG）

\`\`\`javascript
const flow = new FlowProducer();  // 创建实例 flow
await flow.add({  // 等待 Promise 完成后再继续
  name: "final", queueName: "pipeline",
  children: [
    {
      name: "fetch-data", queueName: "pipeline",
      children: [
        { name: "fetch-users", queueName: "pipeline" },
        { name: "fetch-orders", queueName: "pipeline" }
      ]
    }
  ]
});
\`\`\`

### 九、监控与告警

\`\`\`javascript
worker.on("completed", (job) => {  // 监听工作线程消息
  console.log("任务完成:", job.id, "耗时:", job.finishedOn - job.processedOn, "ms");  // 打印日志到 stdout
});

worker.on("failed", (job, err) => {  // 监听工作线程消息
  console.error("任务失败:", job.id, err.message);  // 打印错误到 stderr
  alertOps.send({ job: job.name, error: err.message });
});

worker.on("stalled", (job) => console.warn("任务卡住:", job.id));  // 监听工作线程消息
\`\`\`

### 十、定时任务清单

- [ ] 用 BullMQ / Agenda 持久化
- [ ] 分布式锁防重复
- [ ] 任务幂等设计
- [ ] 错过补跑机制
- [ ] 失败重试（指数退避）
- [ ] 进度追踪
- [ ] 失败告警
- [ ] 任务追踪（trace_id）

下面代码演示 cron 表达式、分布式锁、幂等设计。`,
    code: `// ============================================================
// 定时任务进阶演示
// ============================================================

// ---- 1. cron 表达式解析 ----
console.log("===== 1. cron 表达式 =====");
function explainCron(expr) {
  const parts = expr.split(" ");
  if (parts.length !== 5) return "无效";
  const [min, hour, day, month, week] = parts;
  function partDesc(val, name) {
    if (val === "*") return "每" + name;
    if (val.startsWith("*/")) return "每 " + val.slice(2) + " " + name;
    return val + " " + name;
  }
  return [partDesc(min, "分"), partDesc(hour, "时"), partDesc(day, "日"), partDesc(month, "月"), partDesc(week, "周")].join(", ");
}

const cronExamples = [
  ["0 3 * * *", "每天凌晨 3 点"],
  ["*/5 * * * *", "每 5 分钟"],
  ["0 9 * * 1-5", "工作日早上 9 点"],
  ["0 0 1 * *", "每月 1 号"],
  ["0 0 * * 0", "每周日"]
];
cronExamples.forEach(([expr, desc]) => {
  console.log("  " + expr.padEnd(15) + " → " + desc);
  console.log("    解析: " + explainCron(expr));
});

// ---- 2. setInterval 的坑 ----
console.log("\\n===== 2. setInterval 的坑 =====");
console.log("  问题 1: 重启丢失");
console.log("    setInterval(() => {...}, 24h) 进程重启后任务消失");
console.log("  问题 2: 时间漂移");
console.log("    setInterval(fn, 1000) 如果 fn 耗时 1.5s，实际间隔 2.5s");
console.log("  问题 3: 重叠执行");

let running = false;
let execCount = 0;
const safeInterval = setInterval(async () => {
  if (running) { console.log("  [跳过] 上一轮还在执行"); return; }
  running = true;
  execCount++;
  console.log("  [执行] 第 " + execCount + " 次开始");
  await new Promise(r => setTimeout(r, 150));
  console.log("  [完成] 第 " + execCount + " 次");
  running = false;
  if (execCount >= 3) {
    clearInterval(safeInterval);
    console.log("  → 防重叠机制阻止了任务重叠");
  }
}, 50);

// ---- 3. node-cron 模拟 ----
console.log("\\n===== 3. node-cron 用法 =====");
class SimpleCron {
  constructor() { this.tasks = []; }
  schedule(expr, fn) {
    this.tasks.push({ expr, fn, name: fn.name || "anonymous" });
    console.log("  [注册] " + expr + " → " + (fn.name || "anonymous"));
  }
  list() { return this.tasks; }
}
const cron = new SimpleCron();
cron.schedule("0 3 * * *", function dailyReport() {});
cron.schedule("*/5 * * * *", function healthCheck() {});
cron.schedule("0 9 * * 1-5", function morningEmail() {});
console.log("  共注册 " + cron.list().length + " 个任务");

// ---- 4. 分布式锁 ----
console.log("\\n===== 4. 分布式锁（模拟 Redis） =====");
class FakeRedis {
  constructor() { this.store = new Map(); }
  async set(key, value, ex, ttl, nx) {
    if (nx && this.store.has(key)) return null;
    this.store.set(key, value);
    if (ex) setTimeout(() => this.store.delete(key), ttl * 1000);
    return "OK";
  }
  async del(key) { return this.store.delete(key) ? 1 : 0; }
}
const redis = new FakeRedis();

async function distributedTask(instanceName) {
  const acquired = await redis.set("lock:task", instanceName, "EX", 10, "NX");
  if (!acquired) {
    console.log("  [" + instanceName + "] 其他实例已执行，跳过");
    return false;
  }
  try {
    console.log("  [" + instanceName + "] 抢到锁，执行任务");
    await new Promise(r => setTimeout(r, 50));
    console.log("  [" + instanceName + "] 任务完成");
    return true;
  } finally {
    await redis.del("lock:task");
    console.log("  [" + instanceName + "] 释放锁");
  }
}

(async () => {
  await Promise.all([
    distributedTask("instance-1"),
    distributedTask("instance-2"),
    distributedTask("instance-3")
  ]);
})();

// ---- 5. 幂等性设计 ----
console.log("\\n===== 5. 任务幂等性 =====");
const processedReports = new Map();

async function generateReport(date) {
  const reportId = "report:" + date;
  if (processedReports.has(reportId)) {
    const existing = processedReports.get(reportId);
    if (existing.status === "completed") {
      console.log("  [" + date + "] 报告已存在，跳过");
      return existing;
    }
  }
  processedReports.set(reportId, { status: "processing", started_at: Date.now() });
  console.log("  [" + date + "] 开始生成报告");
  try {
    await new Promise(r => setTimeout(r, 30));
    const result = { status: "completed", pdf_url: "/reports/" + reportId + ".pdf" };
    processedReports.set(reportId, { ...result, completed_at: Date.now() });
    console.log("  [" + date + "] 报告完成");
    return result;
  } catch (err) {
    processedReports.set(reportId, { status: "failed", error: err.message });
    throw err;
  }
}

(async () => {
  await generateReport("2024-01-15");
  await generateReport("2024-01-15");
  await generateReport("2024-01-15");
})();

// ---- 6. BullMQ 用法演示 ----
console.log("\\n===== 6. BullMQ 分布式任务队列 =====");
console.log("  生产者（添加任务）:");
console.log("    queue.add('daily-report', {}, {");
console.log("      repeat: { pattern: '0 3 * * *' }");
console.log("    });");
console.log("  消费者（处理任务）:");
console.log("    new Worker('reports', async (job) => {");
console.log("      await generateReport();");
console.log("    });");
console.log("  优势:");
const bullmqAdv = [
  "✓ 自动分布式锁",
  "✓ 失败自动重试",
  "✓ 任务持久化（Redis）",
  "✓ 并发控制",
  "✓ 进度追踪",
  "✓ 任务编排（FlowProducer）"
];
bullmqAdv.forEach(a => console.log("    " + a));

// ---- 7. 错过任务补跑 ----
console.log("\\n===== 7. 错过任务补跑 =====");
const lastRunStore = new Map();
async function runWithCatchup(taskName) {
  const lastRunKey = "last-run:" + taskName;
  const lastRun = lastRunStore.get(lastRunKey);
  const now = Date.now();
  if (lastRun) {
    const interval = 60 * 1000;
    const missed = Math.floor((now - lastRun) / interval);
    if (missed > 1) {
      console.log("  错过 " + (missed - 1) + " 次，开始补跑");
      for (let i = missed - 1; i > 0; i--) {
        const targetTime = new Date(now - i * interval);
        console.log("    补跑:", targetTime.toISOString().slice(11, 19));
      }
    }
  }
  console.log("  执行当前任务");
  lastRunStore.set(lastRunKey, now);
}
lastRunStore.set("last-run:daily-task", Date.now() - 5 * 60 * 1000);
runWithCatchup("daily-task");

// ---- 8. 任务重试策略 ----
console.log("\\n===== 8. 重试策略 =====");
async function withRetry(fn, maxRetries = 3, backoff = 1000) {
  for (let i = 0; i <= maxRetries; i++) {
    try { return await fn(); }
    catch (err) {
      if (i === maxRetries) throw err;
      const delay = backoff * Math.pow(2, i);
      console.log("  失败，" + delay + "ms 后重试 (" + (i + 1) + "/" + maxRetries + ")");
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

let attempt = 0;
(async () => {
  console.log("  模拟失败重试:");
  try {
    await withRetry(async () => {
      attempt++;
      console.log("    第 " + attempt + " 次尝试");
      if (attempt < 3) throw new Error("模拟失败");
      return "成功";
    }, 5, 50);
  } catch (err) { console.log("  最终失败:", err.message); }
})();

// ---- 9. 任务监控 ----
console.log("\\n===== 9. 任务监控 =====");
class TaskMonitor {
  constructor() { this.tasks = new Map(); }
  start(name) { this.tasks.set(name, { start: Date.now(), status: "running" }); }
  complete(name) {
    const t = this.tasks.get(name);
    if (t) { t.end = Date.now(); t.duration = t.end - t.start; t.status = "completed"; }
  }
  report() {
    const list = [];
    for (const [name, t] of this.tasks) {
      list.push({ name, status: t.status, duration: t.duration + "ms" });
    }
    return list;
  }
}
const monitor = new TaskMonitor();
monitor.start("fetch-data");
setTimeout(() => {
  monitor.complete("fetch-data");
  console.log("  任务报告:");
  monitor.report().forEach(r => {
    console.log("    " + r.name.padEnd(15) + " | " + r.status.padEnd(10) + " | " + r.duration);
  });
}, 50);

// ---- 10. 定时任务清单 ----
console.log("\\n===== 10. 定时任务清单 =====");
const checklist = [
  "□ 用 BullMQ / Agenda 持久化",
  "□ 分布式锁防多实例重复",
  "□ 任务幂等设计",
  "□ 错过补跑机制",
  "□ 失败重试（指数退避）",
  "□ 进度追踪",
  "□ 失败告警",
  "□ 任务追踪（trace_id）"
];
checklist.forEach(c => console.log("  " + c));

console.log("\\n===== 定时任务要点 =====");
console.log("  1. setInterval 不持久，重启丢失");
console.log("  2. 生产用 BullMQ + Redis 持久化");
console.log("  3. 分布式锁防多实例重复执行");
console.log("  4. 任务必须幂等（防重试/补跑）");
console.log("  5. 监控 + 告警是必备");`,
  },

  // =========================================================
  // 第七章：Node.js 最佳实践清单
  // =========================================================
  {
    id: "node-best-practices-pro",
    group: "进阶干货",
    icon: "✅",
    title: "Node.js 最佳实践清单",
    content: `## Node.js 最佳实践清单

本章是 Node.js 工程的"checklist"。从**项目结构、代码风格、错误处理、性能、安全、测试、部署**七大维度梳理最佳实践。

### 一、项目结构

#### 1. 按特性分层（不是按技术）

\`\`\`
✅ 按特性分层（推荐）:
src/
├── modules/
│   ├── user/
│   │   ├── user.controller.js
│   │   ├── user.service.js
│   │   ├── user.repository.js
│   │   ├── user.routes.js
│   │   └── user.test.js
│   └── order/
│       └── ...
├── shared/
│   ├── config.js
│   ├── logger.js
│   └── errors.js
└── app.js
\`\`\`

**优势**：删除/修改某个模块只动一个目录，不用满项目找。

#### 2. 配置集中管理

\`\`\`javascript
// shared/config.js
const env = require("./env");  // 导入模块 ./env；require 返回 module.exports
module.exports = {  // 设置模块导出对象（require 返回的就是它）
  port: env.PORT,
  db: { url: env.DB_URL, poolSize: 10 },
  redis: { url: env.REDIS_URL }
};
\`\`\`

#### 3. 入口文件保持简洁

\`\`\`javascript
const app = require("./app");  // 导入模块 ./app；require 返回 module.exports
const config = require("./shared/config");  // 导入模块 ./shared/config；require 返回 module.exports
app.listen(config.port, () => logger.info("Server started on " + config.port));  // 启动 HTTP 服务器监听端口
\`\`\`

### 二、代码风格

#### 1. 用 ESLint + Prettier

\`\`\`json
// .eslintrc.json
{
  "extends": ["eslint:recommended"],
  "parserOptions": { "ecmaVersion": 2022, "sourceType": "module" },
  "env": { "node": true, "es2022": true },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn",
    "prefer-const": "error",
    "eqeqeq": "error"
  }
}
\`\`\`

#### 2. 用 TypeScript（新项目）

类型安全能避免 60% 的低级错误。

#### 3. async/await 优于 Promise 链

\`\`\`javascript
// ❌ Promise 链
getData().then(d => process(d)).then(r => save(r));

// ✅ async/await
async function handle() {  // 声明异步函数，内部可用 await
  const data = await getData();  // 定义常量 data
  const result = process(data);  // 定义常量 result
  await save(result);  // 等待 Promise 完成后再继续
}
\`\`\`

#### 4. 早返回，减少嵌套

\`\`\`javascript
// ✅ 早返回
async function handler(req, res) {  // 声明异步函数，内部可用 await
  if (!req.user) return res.status(401).send("Unauthorized");  // 条件判断
  if (!req.user.isAdmin) return res.status(403).send("Forbidden");  // 条件判断
  const data = await getData();  // 定义常量 data
  if (!data) return res.status(404).send("Not found");  // 条件判断
  res.json(data);  // 发送 JSON 响应
}
\`\`\`

### 三、错误处理

#### 1. 统一错误中间件

\`\`\`javascript
app.use((err, req, res, next) => {  // 注册 Express 中间件（每个请求依次经过）
  logger.error({ err, request_id: req.id }, "请求失败");
  if (err instanceof ValidationError) return res.status(400).json({ error: err.message });  // 条件判断
  res.status(500).json({ error: "Internal Server Error" });  // 不泄露细节
});
\`\`\`

#### 2. 自定义错误类

\`\`\`javascript
class AppError extends Error {  // 定义类 AppError
  constructor(message, statusCode = 500) {  // 构造函数
    super(message);  // 调用父类构造函数
    this.statusCode = statusCode;
    this.isOperational = true;  // 预期内错误
  }
}
class NotFoundError extends AppError {  // 定义类 NotFoundError
  constructor(resource) { super(resource + " not found", 404); }  // 构造函数
}
class ValidationError extends AppError {  // 定义类 ValidationError
  constructor(message) { super(message, 400); }  // 构造函数
}
throw new NotFoundError("User");  // 抛出异常
\`\`\`

#### 3. 区分操作性错误和程序错误

- **操作性错误**（Operational）：网络超时、用户输入错误 → 处理后继续
- **程序错误**（Programmer）：变量未定义、逻辑错误 → 重启进程

\`\`\`javascript
process.on("unhandledRejection", (err) => {  // 注册进程级事件监听
  logger.error({ err }, "未处理的 Promise rejection");
  if (!err.isOperational) process.exit(1);  // 条件判断
});
\`\`\`

### 四、性能

#### 1. 用 stream 处理大文件

\`\`\`javascript
// ❌ OOM 风险
const data = fs.readFileSync("10gb.log");  // 文件操作结果 data
// ✅ 流式处理
fs.createReadStream("10gb.log").pipe(transform).pipe(process.stdout);  // 创建可读流（分块读取大文件）
\`\`\`

#### 2. 用缓存减少 DB 查询

\`\`\`javascript
const cache = new Map();  // 创建实例 cache
async function getUser(id) {  // 声明异步函数，内部可用 await
  if (cache.has(id)) return cache.get(id);  // 条件判断
  const user = await db.getUser(id);  // 定义常量 user
  cache.set(id, user);
  setTimeout(() => cache.delete(id), 60000).unref(); // unref：不阻止进程退出
  return user;  // 返回值
}
\`\`\`

#### 3. 用 worker_threads 处理 CPU 密集

\`\`\`javascript
const { Worker } = require("worker_threads");  // 导入模块 worker_threads；require 返回 module.exports
function cpuHeavy(data) {  // 声明函数 cpuHeavy
  return new Promise((resolve, reject) => {  // 返回 Promise 供外部 await
    const worker = new Worker("./worker.js", { workerData: data });  // 创建实例 worker
    worker.on("message", resolve);  // 监听工作线程消息
    worker.on("error", reject);  // 监听工作线程消息
  });
}
\`\`\`

#### 4. 用 cluster 利用多核

\`\`\`javascript
const cluster = require("cluster");  // 导入模块 cluster；require 返回 module.exports
const os = require("os");  // 导入模块 os；require 返回 module.exports
if (cluster.isPrimary) {  // 条件判断
  for (let i = 0; i < os.cpus().length; i++) cluster.fork();  // for 循环
} else {
  require("./app");  // 加载并执行模块 ./app（用于副作用）
}
\`\`\`

### 五、安全

核心要点（详见"安全加固进阶"章节）：
- Helmet 设置安全头
- 输入校验（zod/joi）
- 输出转义防 XSS
- bcrypt 存密码
- HTTPS 强制
- 依赖漏洞扫描

### 六、测试

#### 1. 测试金字塔

\`\`\`
        /\\
       /UI \\      少（贵）
      /──────\\
     / 集成  \\    中
    /────────\\
   /   单元   \\  多（便宜）
  /────────────\\
\`\`\`

#### 2. 测试工具

- **单元测试**：Jest / Vitest / Node 内置 test runner
- **集成测试**：Supertest（HTTP）
- **E2E**：Playwright

\`\`\`javascript
// Jest 单元测试
describe("UserService", () => {
  it("should get user", async () => {
    const user = await getUser(1);  // 定义常量 user
    expect(user.id).toBe(1);
  });
});

// Supertest 集成测试
const request = require("supertest");  // 导入模块 supertest；require 返回 module.exports
const app = require("./app");  // 导入模块 ./app；require 返回 module.exports
describe("GET /users", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/users");  // 定义常量 res
    expect(res.status).toBe(200);
  });
});
\`\`\`

#### 3. 测试原则

- 测试**行为**，不测实现
- 一个测试只测一件事
- 测试名描述预期（"should return 404 when user not found"）
- 用 beforeEach/afterEach 清理状态

### 七、日志

- 用 pino，不用 console.log
- 结构化 JSON 输出
- 带上下文（request_id、user_id）
- 不打印敏感信息
- 生产 level=info，调试 level=debug

### 八、API 设计

#### RESTful 规范

\`\`\`
GET    /users          # 列表
POST   /users          # 创建
GET    /users/:id      # 详情
PUT    /users/:id      # 全量更新
PATCH  /users/:id      # 部分更新
DELETE /users/:id      # �除
\`\`\`

#### 版本控制

\`\`\`
/api/v1/users
/api/v2/users
\`\`\`

#### 分页

\`\`\`javascript
// offset/limit（简单）
GET /users?offset=20&limit=10

// cursor（大数据推荐）
GET /users?cursor=abc&limit=10
\`\`\`

### 九、依赖管理

- 锁定版本（\`package-lock.json\`）
- 定期 \`npm audit\`
- 区分 dependencies 和 devDependencies
- 用 pnpm 替代 npm（更快、省磁盘）
- 不用 \`^0.x\`（0.x 不稳定）

### 十、部署清单

- [ ] 健康检查端点：\`/health\` + \`/ready\`
- [ ] 优雅关闭：处理 SIGTERM
- [ ] 日志输出到 stdout
- [ ] 非 root 用户运行
- [ ] 资源限制（memory/cpu）
- [ ] 配置从环境变量读取
- [ ] 镜像最小化（多阶段构建）
- [ ] 健康探针配置

### 十一、性能监控

- Prometheus + Grafana 监控指标
- OpenTelemetry 分布式追踪
- RED 指标（Rate/Errors/Duration）
- 内存 & CPU 告警
- 慢查询日志

### 十二、文档

- README：如何运行
- API 文档：OpenAPI / Swagger
- 架构图：C4 Model
- 变更日志：CHANGELOG.md
- ADR：架构决策记录

### 十三、Git 规范

#### 提交信息（Conventional Commits）

\`\`\`
<type>(<scope>): <subject>

feat(user): add login with OAuth
fix(order): handle null price
docs(readme): update install steps
refactor(auth): extract JWT logic
test(user): add login test cases
chore(deps): upgrade express to 4.18
\`\`\`

#### 分支策略

- \`main\`：生产分支
- \`develop\`：开发分支
- \`feature/xxx\`：功能分支
- \`fix/xxx\`：修复分支
- \`hotfix/xxx\`：紧急修复

### 十四、终极清单

**项目结构**：
- [ ] 按特性分层
- [ ] 配置集中管理
- [ ] 入口简洁

**代码质量**：
- [ ] ESLint + Prettier
- [ ] TypeScript
- [ ] 早返回减少嵌套

**错误处理**：
- [ ] 统一错误中间件
- [ ] 自定义错误类
- [ ] 区分操作性/程序错误

**性能**：
- [ ] Stream 处理大文件
- [ ] 缓存 DB 查询
- [ ] worker_threads 处理 CPU 密集

**安全**：
- [ ] Helmet + CORS 白名单
- [ ] 输入校验 + 输出转义
- [ ] bcrypt + JWT 短期

**测试**：
- [ ] 单元 + 集成测试
- [ ] CI 跑测试

**部署**：
- [ ] 健康检查 + 优雅关闭
- [ ] 多阶段 Docker 构建
- [ ] 资源限制

**可观测性**：
- [ ] 结构化日志
- [ ] Prometheus 指标
- [ ] OpenTelemetry 追踪

下面代码演示各类最佳实践。`,
    code: `// ============================================================
// Node.js 最佳实践清单演示
// ============================================================

// ---- 1. 项目结构对比 ----
console.log("===== 1. 项目结构 =====");
console.log("  ❌ 按技术分层（不推荐）:");
console.log("    src/controllers/, services/, models/, routes/");
console.log("\\n  ✅ 按特性分层（推荐）:");
console.log("    src/modules/user/{controller,service,repository,routes,test}.js");
console.log("    src/shared/{config,logger,errors}.js");

// ---- 2. ESLint + Prettier 配置 ----
console.log("\\n===== 2. 代码风格配置 =====");
const eslintConfig = {
  extends: ["eslint:recommended"],
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
  env: { node: true, es2022: true },
  rules: {
    "no-unused-vars": "warn",
    "no-console": "warn",
    "prefer-const": "error",
    eqeqeq: "error"
  }
};
console.log("  ESLint 配置:");
console.log(JSON.stringify(eslintConfig, null, 2).replace(/^/gm, "    "));

const prettierConfig = {
  semi: true, singleQuote: true, trailingComma: "es5",
  printWidth: 100, tabWidth: 2
};
console.log("  Prettier 配置:");
console.log(JSON.stringify(prettierConfig, null, 2).replace(/^/gm, "    "));

// ---- 3. async/await vs Promise 链 ----
console.log("\\n===== 3. async/await 优于 Promise 链 =====");
async function demo() {
  // ❌ Promise 链
  // getData().then(d => process(d)).then(r => save(r));
  
  // ✅ async/await
  const data = await Promise.resolve("data");
  const result = "processed-" + data;
  console.log("  结果:", result);
}
demo();

// ---- 4. 早返回减少嵌套 ----
console.log("\\n===== 4. 早返回减少嵌套 =====");
function badHandler(req) {
  // ❌ 深嵌套
  if (req.user) {
    if (req.user.isAdmin) {
      if (req.body.data) {
        return "处理完成";
      } else {
        return "无数据";
      }
    } else {
      return "无权限";
    }
  } else {
    return "未登录";
  }
}

function goodHandler(req) {
  // ✅ 早返回
  if (!req.user) return "未登录";
  if (!req.user.isAdmin) return "无权限";
  if (!req.body.data) return "无数据";
  return "处理完成";
}

const req = { user: { isAdmin: true }, body: { data: "x" } };
console.log("  深嵌套结果:", badHandler(req));
console.log("  早返回结果:", goodHandler(req));

// ---- 5. 自定义错误类 ----
console.log("\\n===== 5. 自定义错误类 =====");
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
class NotFoundError extends AppError {
  constructor(resource) { super(resource + " not found", 404); }
}
class ValidationError extends AppError {
  constructor(message) { super(message, 400); }
}

try {
  throw new NotFoundError("User");
} catch (err) {
  console.log("  错误:", err.message);
  console.log("  statusCode:", err.statusCode);
  console.log("  isOperational:", err.isOperational);
  console.log("  instanceof NotFoundError:", err instanceof NotFoundError);
}

// ---- 6. 统一错误中间件 ----
console.log("\\n===== 6. 统一错误中间件 =====");
function errorHandler(err, req, res) {
  console.log("  [错误中间件] 捕获:", err.message);
  if (err instanceof ValidationError) {
    return { status: 400, error: err.message };
  }
  if (err instanceof NotFoundError) {
    return { status: 404, error: err.message };
  }
  // 不泄露内部细节
  return { status: 500, error: "Internal Server Error" };
}

console.log("  ValidationError:", errorHandler(new ValidationError("参数错误"), {}, {}));
console.log("  NotFoundError:", errorHandler(new NotFoundError("User"), {}, {}));
console.log("  未知错误:", errorHandler(new Error("DB connection failed"), {}, {}));

// ---- 7. 缓存模式 ----
console.log("\\n===== 7. 缓存模式 =====");
const cache = new Map();
let dbCallCount = 0;

async function getUserWithCache(id) {
  if (cache.has(id)) {
    console.log("  [缓存命中] user:" + id);
    return cache.get(id);
  }
  console.log("  [DB 查询] user:" + id);
  dbCallCount++;
  const user = { id, name: "user-" + id };
  cache.set(id, user);
  setTimeout(() => cache.delete(id), 60000).unref(); // unref：不阻止进程退出
  return user;
}

(async () => {
  await getUserWithCache(1);
  await getUserWithCache(1);
  await getUserWithCache(1);
  console.log("  DB 调用次数:", dbCallCount, "(应为 1)");
})();

// ---- 8. cluster 多核 ----
console.log("\\n===== 8. cluster 多核 =====");
console.log("  cluster 模式:");
console.log("    if (cluster.isPrimary) {");
console.log("      for (let i = 0; i < os.cpus().length; i++) cluster.fork();");
console.log("    } else {");
console.log("      require('./app');");
console.log("    }");
console.log("  → 主进程 fork N 个 worker，共享端口");

// ---- 9. worker_threads（沙箱用模拟实现）----
console.log("\\n===== 9. worker_threads（沙箱模拟）=====");
// 注：沙箱未开放 worker_threads 模块，用 setImmediate 模拟异步 worker
// 生产环境用真实 require("worker_threads")（见 content 字段）
function mockWorker(task) {
  const listeners = { message: [], error: [], exit: [] };
  setImmediate(() => {
    try {
      const result = task();
      listeners.message.forEach((fn) => fn(result));
      listeners.exit.forEach((fn) => fn(0));
    } catch (err) {
      listeners.error.forEach((fn) => fn(err));
      listeners.exit.forEach((fn) => fn(1));
    }
  });
  return {
    on(event, cb) { listeners[event] && listeners[event].push(cb); },
  };
}

console.log("  主线程启动 mock worker（计算 100 万数据）");
const worker = mockWorker(() => {
  const result = Array.from({ length: 1000000 }, (_, i) => i * 2);
  return { length: result.length, sum: result.reduce((a, b) => a + b, 0) };
});

worker.on("message", (msg) => {
  console.log("  Worker 结果: length=" + msg.length + ", sum=" + msg.sum);
});
worker.on("error", (err) => {
  console.log("  Worker 错误:", err.message);
});
console.log("  说明: 生产用 new Worker(code, { eval: true })");

// ---- 10. 测试金字塔 ----
console.log("\\n===== 10. 测试金字塔 =====");
console.log("        /\\\\");
console.log("       /UI \\\\      少（贵，慢）");
console.log("      /──────\\\\");
console.log("     / 集成  \\\\    中");
console.log("    /────────\\\\");
console.log("   /   单元   \\\\  多（便宜，快）");
console.log("  /────────────\\\\");

console.log("\\n  测试工具:");
const testTools = [
  ["Jest", "单元测试，最流行"],
  ["Vitest", "Vite 友好，更快"],
  ["Node test runner", "Node 18+ 内置"],
  ["Supertest", "HTTP 集成测试"],
  ["Playwright", "E2E 测试"]
];
testTools.forEach(([t, d]) => console.log("    " + t.padEnd(18) + " | " + d));

// ---- 11. RESTful API 设计 ----
console.log("\\n===== 11. RESTful API 设计 =====");
const restEndpoints = [
  ["GET", "/users", "列表"],
  ["POST", "/users", "创建"],
  ["GET", "/users/:id", "详情"],
  ["PUT", "/users/:id", "全量更新"],
  ["PATCH", "/users/:id", "部分更新"],
  ["DELETE", "/users/:id", "删除"]
];
restEndpoints.forEach(([m, p, d]) => {
  console.log("  " + m.padEnd(8) + " " + p.padEnd(20) + " | " + d);
});

// ---- 12. Conventional Commits ----
console.log("\\n===== 12. Git 提交规范 =====");
const commitTypes = [
  ["feat", "新功能"],
  ["fix", "修复 bug"],
  ["docs", "文档"],
  ["style", "格式（不影响代码逻辑）"],
  ["refactor", "重构"],
  ["test", "测试"],
  ["chore", "构建/工具"],
  ["perf", "性能优化"]
];
commitTypes.forEach(([t, d]) => {
  console.log("  " + t.padEnd(10) + " | " + d);
});
console.log("\\n  示例: feat(user): add OAuth login");
console.log("        fix(order): handle null price");

// ---- 13. 终极清单 ----
console.log("\\n===== 13. 终极清单 =====");
const finalChecklist = {
  "项目结构": [
    "□ 按特性分层",
    "□ 配置集中管理",
    "□ 入口简洁"
  ],
  "代码质量": [
    "□ ESLint + Prettier",
    "□ TypeScript",
    "□ 早返回减少嵌套"
  ],
  "错误处理": [
    "□ 统一错误中间件",
    "□ 自定义错误类",
    "□ 区分操作性/程序错误"
  ],
  "性能": [
    "□ Stream 处理大文件",
    "□ 缓存 DB 查询",
    "□ worker_threads 处理 CPU 密集"
  ],
  "安全": [
    "□ Helmet + CORS 白名单",
    "□ 输入校验 + 输出转义",
    "□ bcrypt + JWT 短期"
  ],
  "测试": [
    "□ 单元 + 集成测试",
    "□ CI 跑测试"
  ],
  "部署": [
    "□ 健康检查 + 优雅关闭",
    "□ 多阶段 Docker 构建",
    "□ 资源限制"
  ],
  "可观测性": [
    "□ 结构化日志",
    "□ Prometheus 指标",
    "□ OpenTelemetry 追踪"
  ]
};

for (const [category, items] of Object.entries(finalChecklist)) {
  console.log("  [" + category + "]");
  items.forEach(item => console.log("    " + item));
}

console.log("\\n===== Node.js 最佳实践要点 =====");
console.log("  1. 按特性分层，配置集中管理");
console.log("  2. ESLint + Prettier + TypeScript");
console.log("  3. 统一错误中间件 + 自定义错误");
console.log("  4. Stream + 缓存 + worker_threads");
console.log("  5. 测试金字塔 + CI 自动化");
console.log("  6. 健康检查 + 优雅关闭 + 多阶段构建");
console.log("  7. 结构化日志 + Prometheus + OpenTelemetry");`,
  }
];
