// =============================================================
// 后端开发综合教程 —— 第四批章节（API 设计与架构，共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. backend-rate-limit      — 限流与熔断降级
//   2. backend-api-version     — API 版本管理
//   3. backend-api-doc         — API 文档与 OpenAPI
//   4. backend-error-handling  — 错误处理与状态码规范
//   5. backend-cors            — CORS 跨域与安全头
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名（API 设计与架构）
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（语言无关原理 + 多语言伪代码对照）
//   code    : 可直接运行的 Node.js 代码（沙箱内执行，用内存结构模拟网络/服务）
//
// 代码运行环境约束（沙箱）：
//   - 仅可 require: fs, path, os, url, crypto, util, events, stream,
//     buffer, querystring, string_decoder, zlib, assert, timers
//   - 没有 http / net / child_process / dns，网络概念用 events/自定义对象模拟
//   - 全局: console, process, Buffer, setTimeout, Promise, URL 等
//   - 支持 top-level await，用 console.log 输出结果
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：限流与熔断降级
  // =========================================================
  {
    id: "backend-rate-limit",
    group: "API 设计与架构",
    icon: "🚦",
    title: "限流与熔断降级",
    content: `## 限流与熔断降级

**限流（Rate Limiting）**、**熔断（Circuit Breaking）** 和 **降级（Degradation）** 是高可用后端系统的三道"安全阀"。它们解决的不是业务功能问题，而是"当系统遭遇超出设计的流量或故障时，如何保证系统不崩溃、核心功能仍可用"的问题。可以说，没有这三道阀门的系统，在流量高峰或下游故障面前就像没有保险丝的电路——一个意外就会整体烧毁。

本章将从"为什么需要"出发，逐层拆解限流维度、四种经典限流算法、分布式限流实现、熔断器状态机、降级策略，以及主流框架的对比与生产实战配置。

### 一、为什么需要限流

限流本质上是一种"主动放弃部分请求以保护整体"的策略。乍看是"拒绝服务"，实则是"保住更重要的服务"。它的必要性来自三方面：

#### 1.1 保护系统不被压垮

任何系统的处理能力都有上限：CPU 核数有限、内存有限、数据库连接池有限、下游服务（如支付网关）的配额有限。当瞬时请求量远超设计容量时：

- **线程池耗尽**：Tomcat 默认 200 个工作线程，若每个请求都阻塞在慢 SQL 上，200 个线程很快被占满，新请求只能排队，最终整个服务无响应。
- **内存溢出**：每个请求都会在内存中分配对象（请求体、解析结果、缓存项），堆积的请求会导致 GC 频繁甚至 OOM。
- **连接池排队**：数据库连接池（如 HikariCP 默认 10 个连接）一旦占满，新请求等待超时，引发连锁失败。
- **下游被拖垮**：你的服务可能扛得住，但你调用的第三方服务（如短信、地图）可能扛不住，超量请求会把你拉黑。

限流的作用就是在系统到达崩溃临界点之前，主动拒绝多余的请求，让系统始终运行在安全水位。这就像水库的泄洪闸——平时不开，洪水来时必须开，否则大坝决堤。

#### 1.2 资源公平分配

没有限流时，少数"贪婪"的调用方可能耗尽所有资源：

- 某个爬虫脚本每秒请求 1 万次，把正常用户的请求挤到队列后面。
- 某个大客户集成商调用量激增，导致小客户的请求全部超时。
- 某个租户运行批量任务，独占 CPU 让其他租户卡顿。

通过 **按用户/租户/IP 维度限流**，可以保证每个调用方拿到合理的配额，避免"公地悲剧"。这是多租户 SaaS 系统的必备能力。

#### 1.3 防止雪崩效应

**雪崩效应（Cascading Failure）** 是分布式系统中最致命的故障模式。它的典型场景：

1. 服务 A 依赖服务 B，服务 B 又依赖数据库 C。
2. 数据库 C 突然变慢（如大查询锁表），每个请求从 10ms 变成 5s。
3. 服务 B 的线程池迅速被等待 C 的请求占满，B 也开始拒绝服务。
4. 服务 A 调用 B 超时，A 的线程池也被占满，A 不可用。
5. 依赖 A 的所有服务依次崩溃，整个系统瘫痪。

限流 + 熔断 + 降级就是切断雪崩链条的三大手段：

- **限流**：控制进入 B 的请求量，避免 B 被压垮。
- **熔断**：当 B 持续失败时，A 主动停止调用 B，快速失败而不是等待超时，保住 A 自己的线程。
- **降级**：A 调用 B 失败时，返回兜底数据（如缓存、默认值），保证核心流程不中断。

> 一句话总结：限流防"压垮"，熔断防"拖垮"，降级保"可用"。

### 二、限流的维度

限流不是简单地"每秒最多 1000 个请求"，而是要回答"对谁限流、限多少、什么时机限"。常见的限流维度有以下几种，生产系统通常是多维度组合。

#### 2.1 全局限流

对整个服务实例（或整个集群）的总 QPS 做限制。例如"整个订单服务集群总 QPS 不超过 50000"。这是最粗粒度的保护，防止系统整体过载。

\`\`\`java
// Java：Sentinel 全局限流规则
FlowRule rule = new FlowRule();
rule.setResource("createOrder");
rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
rule.setCount(1000); // 全局 QPS 1000
FlowRuleManager.loadRules(Collections.singletonList(rule));
\`\`\`

#### 2.2 接口限流

针对单个接口（URL）限流。不同接口的处理成本差异巨大：列表查询便宜，导出 Excel 贵；读便宜，写贵。因此要按接口分别设阈值。

| 接口 | 阈值 | 原因 |
| --- | --- | --- |
| GET /users (列表) | 5000 QPS | 简单查询，可承受高并发 |
| POST /users (创建) | 500 QPS | 写库 + 索引更新，开销大 |
| POST /export (导出) | 10 QPS | CPU/内存密集，单请求几秒 |
| POST /pay (支付) | 200 QPS | 调用第三方，配额有限 |

#### 2.3 用户限流

按调用方身份（用户 ID、API Key、租户 ID）限流。这是 SaaS 系统最常用的维度，保证公平。

\`\`\`go
// Go：按用户 ID 限流（Redis 计数器）
func allow(userID string, limit int) bool {
    key := "rate:user:" + userID
    n, _ := redis.Incr(key).Result()
    if n == 1 {
        redis.Expire(key, time.Second) // 1 秒窗口
    }
    return n <= int64(limit)
}
\`\`\`

#### 2.4 IP 限流

按客户端 IP 限流，常用于防爬虫、防暴力破解。但 IP 限流有几个坑：

- **NAT 后多用户共享一个出口 IP**：公司内网、校园网用户共用一个公网 IP，按 IP 限流会误伤。
- **移动网络 IP 频繁变化**：用户从 4G 切到 WiFi，IP 变了，限流失效。
- **代理 IP 池绕过**：爬虫用代理池，每个 IP 只请求几次，单 IP 限流形同虚设。

因此 IP 限流通常配合 **设备指纹、行为分析、验证码** 等手段，而不是单独使用。

#### 2.5 多维度组合策略

生产系统几乎都是多维度叠加。例如电商下单接口：

- 全局：10000 QPS（保护集群）
- 单接口：5000 QPS（保护下单服务）
- 单用户：10 QPS（防刷单）
- 单 IP：100 QPS（防爬虫）
- 黄金用户：100 QPS（差异化配额）

请求需要同时通过所有维度的检查才放行。任一维度超限即拒绝。这种"AND"组合保证了多重保护。

\`\`\`python
# Python：多维度限流装饰器
def rate_limit(global_qps=10000, api_qps=5000, user_qps=10):
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            if not global_limiter.allow(global_qps): raise RateLimitError("全局")
            if not api_limiter.allow(request.path, api_qps): raise RateLimitError("接口")
            if not user_limiter.allow(request.user.id, user_qps): raise RateLimitError("用户")
            return func(request, *args, **kwargs)
        return wrapper
    return decorator
\`\`\`

### 三、限流算法详解

限流的核心是"算法"。不同的算法适用于不同的场景，各有优劣。下面详细介绍四种经典算法。

#### 3.1 固定窗口计数算法（Fixed Window Counter）

**原理**：把时间划分为固定大小的窗口（如每秒一个窗口），每个窗口维护一个计数器。请求到来时计数器 +1，超过阈值则拒绝。窗口结束时计数器清零。

\`\`\`
时间轴（每格 1 秒）：
|---窗口1---|---窗口2---|---窗口3---|
  计数3/5     计数5/5     计数2/5
              ↑已满，拒绝
\`\`\`

**实现（伪代码）**：

\`\`\`javascript
class FixedWindowLimiter {
    constructor(limit, windowMs) {
        this.limit = limit;        // 窗口内最大请求数
        this.windowMs = windowMs;  // 窗口大小（毫秒）
        this.count = 0;            // 当前窗口计数
        this.windowStart = Date.now();
    }
    allow() {
        const now = Date.now();
        if (now - this.windowStart >= this.windowMs) {
            // 进入新窗口，重置
            this.windowStart = now;
            this.count = 0;
        }
        if (this.count < this.limit) {
            this.count++;
            return true;
        }
        return false;
    }
}
\`\`\`

**优点**：

- 实现极简，仅需一个计数器和一个时间戳。
- 内存占用小，性能高。
- 适合粗粒度限流。

**致命缺点：临界突发问题（Boundary Burst）**

固定窗口最大的问题是**窗口边界的突发流量**。看这个例子：阈值 100 QPS，窗口 1 秒。

\`\`\`
窗口1: 0.0s-1.0s，第 0.99s 来了 100 个请求（满）
窗口2: 1.0s-2.0s，第 1.01s 又来了 100 个请求（满）

→ 0.02 秒内通过了 200 个请求！是阈值的 2 倍
\`\`\`

虽然每个窗口都没超限，但跨越边界的 0.02 秒内实际 QPS 达到 10000，足以压垮下游。这个"两倍突发"是固定窗口的固有缺陷。

**适用场景**：对突发不敏感的粗粒度限流，如"每天每用户最多发 10 条短信"。

#### 3.2 滑动窗口计数算法（Sliding Window Counter）

**原理**：把窗口"滑动"起来。不再用固定边界，而是统计"当前时刻往前推 N 秒"内的请求数。

**实现方式一：细分小窗口**

把大窗口切成多个小窗口（如 1 秒切成 10 个 100ms 的小窗口），统计当前时刻往前一个大窗口内所有小窗口的计数之和。

\`\`\`
当前时刻 t=1.05s，大窗口 1s
统计 [0.05s, 1.05s] 内所有小窗口的计数

|0.0-0.1|0.1-0.2|...|0.9-1.0|1.0-1.1|
   10     12          15      8  ← 当前小窗口

总和 = 10+12+...+15+8（部分）= 接近 100 但不会突发 2 倍
\`\`\`

**实现方式二：时间戳记录**

记录每个请求的时间戳，统计时删除过期时间戳，计数剩余数量。

\`\`\`javascript
class SlidingWindowLimiter {
    constructor(limit, windowMs) {
        this.limit = limit;
        this.windowMs = windowMs;
        this.requests = []; // 请求时间戳队列
    }
    allow() {
        const now = Date.now();
        // 清理过期时间戳
        while (this.requests.length && now - this.requests[0] >= this.windowMs) {
            this.requests.shift();
        }
        if (this.requests.length < this.limit) {
            this.requests.push(now);
            return true;
        }
        return false;
    }
}
\`\`\`

**优点**：

- 解决了固定窗口的临界突发问题。任何时刻往前看 N 秒，请求数都不会超过阈值。
- 平滑度好。

**缺点**：

- 内存占用比固定窗口大（要存时间戳或多个小窗口计数）。
- 时间戳队列在高 QPS 下操作频繁，性能略低。

**适用场景**：要求平滑限流、对突发敏感的场景，如 API 网关。

#### 3.3 漏桶算法（Leaky Bucket）

**原理**：把请求比作水，倒入一个固定容量的"漏桶"。桶以**恒定速率**漏水（处理请求）。水满时新倒入的水溢出（拒绝）。

\`\`\`
      请求（水）
        ↓↓↓↓↓
    ┌──────────┐
    │  桶(满)  │ → 溢出（拒绝）
    │~~~~~~~~~~│
    │   水     │
    └────┬─────┘
         │ 匀速漏水（处理）
         ↓ (固定速率 R)
\`\`\`

**关键参数**：

- **容量 C**：桶能存的最大请求数（队列长度）。
- **漏水速率 R**：每秒处理的请求数（出队速率）。

**核心特性**：**输出速率恒定**，无论输入多突发，输出永远是匀速的 R。

\`\`\`javascript
class LeakyBucketLimiter {
    constructor(capacity, leakRatePerSec) {
        this.capacity = capacity;       // 桶容量
        this.leakRate = leakRatePerSec; // 漏水速率（请求/秒）
        this.water = 0;                 // 当前水量
        this.lastLeak = Date.now();
    }
    allow() {
        const now = Date.now();
        // 先漏水：根据经过时间计算应漏出的量
        const elapsed = (now - this.lastLeak) / 1000;
        const leaked = elapsed * this.leakRate;
        this.water = Math.max(0, this.water - leaked);
        this.lastLeak = now;
        // 再加水
        if (this.water < this.capacity) {
            this.water += 1;
            return true;
        }
        return false; // 溢出
    }
}
\`\`\`

**优点**：

- **绝对平滑**：输出速率严格恒定，保护下游最有效。
- 实现简单。

**缺点**：

- **无法应对突发**：即使系统空闲很久，也只能按 R 处理，不能"补"突发。例如 R=100，下游能扛 1000，但你永远只能发 100，浪费容量。
- **队列延迟**：突发请求在桶里排队，延迟增大。

**适用场景**：保护对突发极度敏感的下游，如调用第三方支付接口（必须匀速，否则被拉黑）、消息队列消费者限速。

#### 3.4 令牌桶算法（Token Bucket）

**原理**：桶里以**恒定速率**放入令牌（token），桶有最大容量。请求到来时取一个令牌，取到则放行，取不到则拒绝。桶满时新令牌溢出。

\`\`\`
    令牌生成器（速率 R）
         ↓ ↓ ↓
    ┌──────────┐
    │ 令牌桶   │ ← 容量 C
    │●●●●●●●● │
    └────┬─────┘
         │ 请求取走令牌
         ↓
       放行
\`\`\`

**关键参数**：

- **容量 C**：桶能存的最大令牌数（=允许的最大突发量）。
- **生成速率 R**：每秒生成的令牌数（=长期平均速率）。

**核心特性**：

- **长期平均速率 = R**。
- **短期突发 ≤ C**：桶里有 C 个令牌时，瞬间可以放行 C 个请求。
- **空闲后可"补"突发**：系统空闲时令牌持续积累（最多到 C），下次突发可以一次取走。

\`\`\`javascript
class TokenBucketLimiter {
    constructor(capacity, refillRatePerSec) {
        this.capacity = capacity;       // 桶容量（最大令牌数）
        this.refillRate = refillRatePerSec; // 令牌生成速率
        this.tokens = capacity;         // 初始满桶
        this.lastRefill = Date.now();
    }
    allow() {
        const now = Date.now();
        // 补充令牌
        const elapsed = (now - this.lastRefill) / 1000;
        this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
        this.lastRefill = now;
        // 取令牌
        if (this.tokens >= 1) {
            this.tokens -= 1;
            return true;
        }
        return false;
    }
}
\`\`\`

**优点**：

- **允许突发**：最贴合真实流量模式（流量本身就有突发性）。
- **平滑且灵活**：长期速率可控，短期可突发。
- 是工业界**最常用**的算法，Guava RateLimiter、Nginx limit_req、AWS API Gateway 默认都用令牌桶。

**缺点**：

- 突发量受桶容量限制，C 设大了保护不足，设小了正常流量被拒。
- 参数调优需要经验。

**适用场景**：绝大多数 API 限流场景，尤其是面向用户的接口。

#### 3.5 四种算法对比

| 算法 | 突发处理 | 输出平滑度 | 内存 | 实现复杂度 | 典型场景 |
| --- | --- | --- | --- | --- | --- |
| 固定窗口 | 差（2 倍突发） | 差 | 极小 | 极简 | 粗粒度日配额 |
| 滑动窗口 | 好 | 好 | 中 | 中 | API 网关 |
| 漏桶 | 无（强制匀速） | 极好 | 小 | 简 | 下游敏感的匀速消费 |
| 令牌桶 | 好（受控突发） | 好 | 小 | 简 | 通用 API 限流（最常用） |

**选型建议**：

- 不确定就用**令牌桶**，它是"性价比之王"。
- 保护脆弱下游用**漏桶**。
- 需要精确统计窗口用**滑动窗口**。
- 简单日配额用**固定窗口**。

### 四、分布式限流

单机限流只能保护单实例。在集群环境下，如果每台机器独立限流 1000 QPS，10 台机器加起来就是 10000 QPS，远超下游承受能力。这时需要**分布式限流**——把限流计数器集中存储，全集群共享。

#### 4.1 单机限流的局限

\`\`\`
集群有 5 台机器，目标总 QPS 5000
单机方案：每台限 1000 QPS
问题：流量不均，某台可能拿到 3000 QPS 直接挂，其他台只拿到 500 QPS
\`\`\`

#### 4.2 Redis + Lua 原子限流

最经典的分布式限流方案：用 Redis 存计数器，用 Lua 脚本保证"读取-判断-写入"的原子性。

\`\`\`lua
-- 滑动窗口限流 Lua 脚本
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])

-- 删除窗口外的旧时间戳
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
-- 当前窗口内请求数
local count = redis.call('ZCARD', key)
if count < limit then
    redis.call('ZADD', key, now, now .. math.random())  -- 用随机后缀避免 score 冲突
    redis.call('PEXPIRE', key, window)
    return 1  -- 放行
else
    return 0  -- 拒绝
end
\`\`\`

**为什么必须用 Lua？** 因为"读取计数→判断→写入"如果不是原子的，并发下多个请求会同时读到旧值，都判断通过，导致超限。Redis 单线程执行 Lua 脚本，天然原子。

**多语言调用示例**：

\`\`\`java
// Java (Jedis)
String script = "local c=redis.call('INCR',KEYS[1]) if c==1 then redis.call('EXPIRE',KEYS[1],1) end return c";
Object count = jedis.eval(script, 1, "rate:api:user123");
boolean allow = ((Long) count) <= 1000;
\`\`\`

\`\`\`go
// Go (go-redis)
script := redis.NewScript(\`local c=redis.call('INCR',KEYS[1])
if c==1 then redis.call('EXPIRE',KEYS[1],1) end
return c\`)
result, err := script.Run(ctx, rdb, []string{"rate:api:user123"}).Int64()
allow := result <= 1000
\`\`\`

\`\`\`python
# Python (redis-py)
script = """
local c=redis.call('INCR',KEYS[1])
if c==1 then redis.call('EXPIRE',KEYS[1],1) end
return c
"""
count = r.eval(script, 1, "rate:api:user123")
allow = count <= 1000
\`\`\`

#### 4.3 网关层限流

把限流逻辑放在 API 网关（如 Kong、APISIX、Spring Cloud Gateway），所有请求先过网关限流，再到后端服务。优点是统一管控、配置集中、对业务代码零侵入。

\`\`\`yaml
# APISIX 限流配置示例
routes:
  - uri: /api/orders*
    plugins:
      limit-req:        # 漏桶
        rate: 1000
        burst: 200
        rejected_code: 429
      limit-count:      # 固定窗口
        count: 10000
        time_window: 1
        key: consumer_name
\`\`\`

#### 4.4 Sentinel 分布式限流

阿里开源的 Sentinel 提供"集群限流"模式：一个 Token Server 集中发牌，各客户端向它申请令牌。

\`\`\`java
// Sentinel 集群限流规则
ClusterFlowRule rule = new ClusterFlowRule();
rule.setResource("createOrder");
rule.setCount(5000);          // 集群总 QPS
rule.setClusterMode(true);
rule.setClusterConfig(new ClusterFlowConfig()
    .setThresholdType(ClusterRuleConstant.FLOW_THRESHOLD_GLOBAL));
\`\`\`

### 五、熔断器模式

**熔断器（Circuit Breaker）** 借鉴电路保险丝的思想：当某个下游服务持续失败时，主动"熔断"对它的调用，快速失败而不是傻等超时，从而保护调用方自己不被拖垮。

#### 5.1 熔断器的三种状态

熔断器是一个状态机，有三个状态：

\`\`\`
            失败率达阈值
  ┌─────────────────────┐
  │                     ↓
[CLOSED]            [OPEN]
  ↑                     │
  │   探测请求成功        │ 等待 recovery timeout
  │                     ↓
  └────────[HALF-OPEN]──┘
            探测失败 → 回 OPEN
\`\`\`

**1. CLOSED（关闭）**：正常状态，所有请求放行。同时统计失败率。

**2. OPEN（打开）**：熔断状态，所有请求直接快速失败（fail fast），不真正调用下游。这就像保险丝熔断，电路断开。

**3. HALF-OPEN（半开）**：试探状态。OPEN 状态持续一段时间（recovery timeout）后，允许少量请求通过探测下游是否恢复。如果探测成功，转 CLOSED；如果失败，转 OPEN 重新计时。

#### 5.2 状态转换条件

| 转换 | 条件 | 含义 |
| --- | --- | --- |
| CLOSED → OPEN | 失败率 ≥ 阈值（如 50%）且请求数 ≥ 最小统计量 | 下游出问题了，熔断 |
| OPEN → HALF-OPEN | OPEN 持续时间 ≥ recovery timeout（如 30s） | 试试下游恢复没 |
| HALF-OPEN → CLOSED | 探测请求成功 N 次 | 下游恢复了，恢复调用 |
| HALF-OPEN → OPEN | 探测请求失败 | 还没恢复，继续熔断 |

**关键参数**：

- **失败率阈值**：通常 50%，敏感场景可设 30%。
- **最小请求数**：少于这个数不计失败率（避免少量请求偶然失败误判），如 20。
- **统计窗口**：如 10 秒。
- **recovery timeout**：OPEN 持续时间，如 30 秒。
- **半开探测数**：HALF-OPEN 时放行的请求数，如 3。

#### 5.3 恢复策略

- **定时恢复**：OPEN 后等固定时间转 HALF-OPEN，最简单。
- **递增恢复**：每次 HALF-OPEN 失败，下次 OPEN 时间翻倍（30s→60s→120s），避免频繁探测打挂刚恢复的下游。
- **主动探测**：HALF-OPEN 时只发一个探测请求，成功才放更多。

\`\`\`javascript
// 熔断器状态机核心逻辑
class CircuitBreaker {
    constructor(opts) {
        this.failureThreshold = opts.failureThreshold; // 失败率阈值 0-1
        this.minRequests = opts.minRequests;           // 最小统计量
        this.timeout = opts.timeout;                   // OPEN 持续时间 ms
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailure = 0;
    }
    async call(fn) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailure > this.timeout) {
                this.state = 'HALF_OPEN';
            } else {
                throw new Error('Circuit OPEN: fast fail');
            }
        }
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (e) {
            this.onFailure();
            throw e;
        }
    }
    onSuccess() {
        if (this.state === 'HALF_OPEN') {
            this.state = 'CLOSED'; // 探测成功，恢复
            this.reset();
        } else {
            this.successCount++;
        }
    }
    onFailure() {
        this.failureCount++;
        this.lastFailure = Date.now();
        const total = this.failureCount + this.successCount;
        if (this.state === 'HALF_OPEN') {
            this.state = 'OPEN'; // 探测失败，重新熔断
        } else if (total >= this.minRequests &&
                   this.failureCount / total >= this.failureThreshold) {
            this.state = 'OPEN'; // 失败率达阈值，熔断
        }
    }
    reset() { this.failureCount = 0; this.successCount = 0; }
}
\`\`\`

### 六、熔断 vs 限流 vs 降级

三者经常被混淆，但职责不同：

| 机制 | 触发条件 | 作用对象 | 目标 |
| --- | --- | --- | --- |
| **限流** | 请求量超阈值 | 入口流量 | 防止系统被压垮 |
| **熔断** | 下游失败率超阈值 | 对下游的调用 | 防止被下游拖垮 |
| **降级** | 非核心功能不可用 | 非核心逻辑 | 保住核心功能 |

**配合使用**：

1. 限流挡住超量请求（入口防线）。
2. 熔断切断对故障下游的调用（中段防线）。
3. 降级在熔断/失败时返回兜底（末端兜底）。

举例：电商下单流程

- 限流：下单接口 5000 QPS，超了返回 429。
- 熔断：调用库存服务失败率 60%，熔断 30 秒。
- 降级：熔断期间不查实时库存，返回"库存查询繁忙，请稍后"，但允许下单（异步校验）。

### 七、降级策略

降级是"放弃非核心以保核心"的具体手段。常见策略：

#### 7.1 返回默认值

最简单的降级。查询失败时返回预设的默认值。

\`\`\`javascript
async function getUserAvatar(userId) {
    try {
        return await fetchAvatar(userId);
    } catch (e) {
        return '/default-avatar.png'; // 兜底默认头像
    }
}
\`\`\`

#### 7.2 返回缓存/兜底数据

失败时返回旧缓存，虽然可能过期，但比报错好。

\`\`\`java
// Java：Hystrix 兜底
@HystrixCommand(fallbackMethod = "getProductFallback")
public Product getProduct(Long id) {
    return productService.get(id); // 可能失败
}
public Product getProductFallback(Long id) {
    return cache.get(id); // 返回缓存
}
\`\`\`

#### 7.3 异步化处理

将同步操作降级为异步。例如下单时实时扣库存失败，改为发消息异步扣，先告诉用户"下单成功"。

#### 7.4 关闭非核心功能

大促时主动关闭评论、推荐、积分等非核心功能，把资源让给下单、支付。

\`\`\`yaml
# 降级开关配置
degradation:
  recommendation: false   # 关闭推荐
  comment: false          # 关闭评论
  points: false           # 关闭积分
  search: degraded        # 搜索降级（用简化版）
\`\`\`

#### 7.5 提示稍后重试

无法降级时，明确告知用户稍后重试，而不是返回 500。

\`\`\`json
{ "code": 503, "message": "系统繁忙，请 1 分钟后重试", "retryAfter": 60 }
\`\`\`

### 八、主流框架对比

| 框架 | 出品方 | 语言 | 特点 | 现状 |
| --- | --- | --- | --- | --- |
| **Hystrix** | Netflix | Java | 熔断+隔离+降级，最早流行 | 已停止维护，不推荐新项目 |
| **Sentinel** | 阿里 | Java | 限流+熔断+系统保护，控制台可视化 | 活跃，国内主流 |
| **Resilience4j** | 社区 | Java | Hystrix 精神继承，函数式，轻量 | 活跃，Spring 推荐 |
| **Polly** | .NET | C# | .NET 生态主流 | 活跃 |
| **opossum** | Node | JS | Node.js 熔断库 | 活跃 |
| **gobreaker** | sony | Go | Go 熔断库，简洁 | 活跃 |

**Hystrix vs Sentinel vs Resilience4j 详细对比**：

| 维度 | Hystrix | Sentinel | Resilience4j |
| --- | --- | --- | --- |
| 限流 | 弱 | 强（多算法） | 中 |
| 熔断 | 强 | 强 | 强 |
| 降级 | 强 | 中 | 强 |
| 系统自适应 | 无 | 有（CPU/RT 自动限流） | 无 |
| 控制台 | Dashboard | 强大控制台 | 无内置 |
| 隔离策略 | 线程池/信号量 | 信号量 | 信号量/Bulkhead |
| 编程模型 | 注解+继承 | 注解+API | 函数式 |

### 九、限流配置实战

#### 9.1 QPS 评估

限流阈值不是拍脑袋，要基于容量评估：

1. **压测**：用 wrk/JMeter 压测，找到系统 QPS 上限（CPU 80% 时的 QPS）。
2. **留余量**：阈值设为压测上限的 70%-80%，留出突发和故障余量。
3. **分接口**：核心接口阈值高，非核心低。

例如压测结果：

- 单实例下单接口：极限 2000 QPS（CPU 90%）
- 安全阈值：2000 × 0.7 = 1400 QPS
- 集群 10 台：14000 QPS（全局限流）

#### 9.2 黑白名单

\`\`\`java
// Sentinel 黑白名单
AuthorityRule rule = new AuthorityRule();
rule.setResource("createOrder");
rule.setStrategy(RuleConstant.AUTHORITY_WHITE); // 白名单
rule.setLimitApp("appA,appB"); // 只允许 appA/appB 调用
\`\`\`

#### 9.3 阈值动态调整

生产环境阈值要能动态调整（不重启），Sentinel 控制台、Apollo 配置中心都支持。大促前调高，平时调低。

### 十、监控与告警

限流/熔断不监控等于白配。必须监控：

- **限流拒绝量**：每分钟被拒请求数，激增说明流量异常或阈值过低。
- **熔断状态**：OPEN 时立即告警（说明下游故障）。
- **失败率**：接近阈值时预警。
- **降级触发次数**：反映系统压力。

\`\`\`python
# Python：Prometheus 指标
from prometheus_client import Counter, Gauge

rate_limit_reject = Counter('rate_limit_reject_total', '被限流拒绝数', ['api'])
circuit_state = Gauge('circuit_state', '熔断器状态', ['service'])  # 0=CLOSED 1=OPEN 2=HALF

# 在限流拒绝时
rate_limit_reject.labels(api='createOrder').inc()

# 熔断状态变化时
circuit_state.labels(service='inventory').set(1)  # OPEN
\`\`\`

告警规则示例：

- 限流拒绝率 > 5% 持续 1 分钟 → P2 告警
- 熔断器 OPEN → P1 告警（电话）
- 降级触发 > 100 次/分钟 → P2 告警

### 十一、生产案例

**案例 1：某电商秒杀，固定窗口导致 2 倍突发**

某秒杀活动用固定窗口限流 1000 QPS。0 点开抢，第 0.99s 来 1000 请求（满），第 1.01s 又来 1000 请求（满）。0.02 秒内 2000 请求涌入，下游库存服务连接池打满，雪崩。改用令牌桶（容量 200，速率 1000）后稳定。

**案例 2：未配熔断，慢下游拖垮全站**

推荐服务依赖用户画像服务。某次画像服务 DB 慢查询，响应从 50ms 变 5s。推荐服务线程池 30 秒内全部阻塞，推荐接口超时，依赖推荐的首页也超时，全站不可用 10 分钟。加上熔断（失败率 50% 熔断 30s）后，画像故障时推荐降级返回热门列表，首页正常。

**案例 3：降级救场**

支付系统依赖风控服务。风控服务发布出 bug，所有请求超时。支付系统熔断风控调用，降级为"小额免风控"（< 100 元直接放行），大额提示"风控繁忙"。结果：小额支付正常，大额支付受影响但占比小，整体可用性 99% 而不是 0。

### 十二、常见坑

1. **限流阈值拍脑袋**：不压测就设阈值，要么形同虚设，要么误杀正常流量。
2. **只限流不熔断**：限流挡不住下游慢导致的拖垮。
3. **熔断不配恢复策略**：OPEN 后直接转 CLOSED，下游还没恢复又被打开，反复振荡。应该用 HALF-OPEN 探测。
4. **降级返回 null**：调用方没判空，NPE 雪崩。降级要返回有意义的兜底。
5. **限流计数器不持久化**：重启计数器清零，重启瞬间流量激增。
6. **分布式限流 Redis 单点**：Redis 挂了限流失效，要做 Redis 集群 + 本地降级。
7. **错误码不区分**：限流、熔断、降级都返回 500，前端无法区分处理。应该 429（限流）、503（熔断/降级）。

### 十三、多语言对照速查

| 操作 | Java (Sentinel) | Go (gobreaker) | Python (circuitbreaker) | Node (opossum) |
| --- | --- | --- | --- | --- |
| 限流 | FlowRule | 自实现/ulule | ratelimit 库 | express-rate-limit |
| 熔断 | DegradeRule | gobreaker.NewCircuitBreaker | circuitbreaker.CircuitBreaker | new CircuitBreaker |
| 降级 | fallback | OnStateChange hook | fallback | fallback |
| 注解 | @SentinelResource | 无 | @circuit | 装饰器 |

\`\`\`go
// Go：gobreaker 熔断器
cb := gobreaker.NewCircuitBreaker(gobreaker.Settings{
    Name:        "inventory",
    MaxRequests: 3,                  // HALF-OPEN 探测数
    Interval:    10 * time.Second,   // CLOSED 统计窗口
    Timeout:     30 * time.Second,   // OPEN 持续时间
    ReadyToTrip: func(counts gobreaker.Counts) bool {
        return counts.ConsecutiveFailures > 5 // 连续失败 5 次熔断
    },
})
result, err := cb.Execute(func() (interface{}, error) {
    return inventoryClient.Get(id)
})
\`\`\`

### 十四、自适应限流

前面讲的限流算法都需要"人工设定阈值"。但阈值设定是个难题：设高了保护不足，设低了浪费容量；且系统能力会随负载、依赖、硬件波动而变化。**自适应限流（Adaptive Limiting）** 让系统根据自己的实时负载自动调整限流阈值，无需人工干预。

#### 14.1 基于并发度的限流

最朴素的思路：限制"同时在处理中的请求数"（并发度），而不是 QPS。因为系统能承受的并发度与处理速度强相关，且容易测量。

**Little's Law（利特尔法则）** 是排队论的基础公式：

\`\`\`
L = λ × W
其中：
  L = 系统中平均请求数（并发度）
  λ = 请求到达速率（QPS）
  W = 平均处理时间（RT）
\`\`\`

反过来：**最大可承受 QPS = 最大并发度 / 平均 RT**。如果系统能同时处理 100 个请求，平均 RT 0.1 秒，那最大 QPS = 100 / 0.1 = 1000。

\`\`\`go
// Go：基于并发度的自适应限流（Netflix concurrency-limits 思路）
type Limiter struct {
    maxConcurrent int32
    current       int32
}
func (l *Limiter) Acquire() bool {
    if atomic.AddInt32(&l.current, 1) > l.maxConcurrent {
        atomic.AddInt32(&l.current, -1)
        return false
    }
    return true
}
func (l *Limiter) Release() { atomic.AddInt32(&l.current, -1) }
\`\`\`

#### 14.2 BBR 算法

Google 的 BBR（Bottleneck Bandwidth and Round-trip propagation time）原本用于 TCP 拥塞控制，被 Sentinel 等限流组件借鉴到应用层。它的核心思想是：**在不显著抬高 RT 的前提下，尽量提高吞吐**。

BBR 自适应限流的判断逻辑：

1. 持续统计最近窗口内的 RT（响应时间）和 QPS。
2. 计算"理论最大 QPS = max(并发度) / min(RT)"。
3. 当实际 QPS 接近理论最大值，且 RT 开始上升时，认为到达瓶颈，开始限流。

\`\`\`java
// Sentinel 自适应限流（系统规则）
SystemRule rule = new SystemRule();
rule.setHighestSystemLoad(5.0);    // CPU 负载上限
rule.setHighestCpuUsage(80);       // CPU 使用率上限 80%
rule.setAvgRt(10);                 // 平均 RT 上限 10ms
rule.setMaxThread(100);            // 最大并发线程 100
rule.setQps(5000);                 // 入口 QPS 上限
\`\`\`

自适应限流的好处是"零配置"——系统自己找到最佳工作点。缺点是参数敏感，调优困难，且在突发场景下反应可能滞后。

#### 14.3 自适应 vs 静态限流

| 维度 | 静态限流 | 自适应限流 |
| --- | --- | --- |
| 阈值 | 人工设定，固定 | 系统自动计算，动态 |
| 配置成本 | 高（需压测） | 低（零配置） |
| 突发响应 | 立即拒绝 | 滞后，可能短暂超载 |
| 适用 | 入口流量、对外 API | 内部服务、依赖调用 |
| 典型实现 | 令牌桶、Sentinel FlowRule | BBR、Netflix concurrency-limits |

生产实践通常**两者结合**：对外接口用静态限流（保证 SLA），内部调用用自适应限流（自动保护）。

### 十五、隔离策略

限流保护"总量"，但单个慢调用仍可能耗尽线程池拖垮其他接口。**隔离（Isolation）** 是更细粒度的保护：把资源（线程、连接）按"租户/接口/下游"切分到不同池子，互不影响。这就像船舱隔板（Bulkhead）——一个舱进水不影响其他舱。

#### 15.1 线程池隔离

为每个下游调用分配独立线程池。某下游变慢，只会耗尽它自己的线程池，不影响其他调用。

\`\`\`java
// Hystrix 线程池隔离
@HystrixCommand(
    fallbackMethod = "fallback",
    commandProperties = {
        @HystrixProperty(name="execution.isolation.strategy", value="THREAD")
    },
    threadPoolProperties = {
        @HystrixProperty(name="coreSize", value="20"),         // 核心线程 20
        @HystrixProperty(name="maxQueueSize", value="100"),    // 队列 100
        @HystrixProperty(name="queueSizeRejectionThreshold", value="80") // 队列 80 时拒绝
    }
)
public String callInventory() { return inventoryClient.get(); }
\`\`\`

**优点**：隔离彻底，可超时控制，可异步。
**缺点**：线程切换开销大；线程数有限，池子太多会耗尽系统线程。

#### 15.2 信号量隔离

不用独立线程，用计数信号量限制并发数。调用在当前线程执行。

\`\`\`java
// Hystrix 信号量隔离
@HystrixCommand(
    commandProperties = {
        @HystrixProperty(name="execution.isolation.strategy", value="SEMAPHORE"),
        @HystrixProperty(name="execution.isolation.semaphore.maxConcurrentRequests", value="50")
    }
)
public String callCache() { return cacheClient.get(); }
\`\`\`

**优点**：无线程切换开销，轻量。
**缺点**：无法异步超时（调用阻塞当前线程）。

#### 15.3 两种隔离对比

| 维度 | 线程池隔离 | 信号量隔离 |
| --- | --- | --- |
| 开销 | 大（线程切换） | 小 |
| 隔离性 | 强（独立线程池） | 弱（共享线程） |
| 超时控制 | 支持 | 不支持 |
| 异步 | 支持 | 不支持 |
| 适用 | 外部网络调用 | 内部高速调用（如缓存） |

**选型建议**：

- 调用外部服务（HTTP/RPC）用线程池隔离。
- 调用本地缓存、内存操作用信号量隔离。
- Resilience4j 用 Bulkhead 模块实现类似功能，推荐信号量 + 异步。

\`\`\`java
// Resilience4j Bulkhead
BulkheadConfig config = BulkheadConfig.custom()
    .maxConcurrentCalls(20)        // 最大并发 20
    .maxWaitDuration(Duration.ofMillis(100))
    .build();
Bulkhead bulkhead = Bulkhead.of("inventory", config);
String result = Bulkhead.decorateSupplier(bulkhead, () -> inventoryClient.get()).get();
\`\`\`

### 十六、限流算法数学推导

#### 16.1 令牌桶的稳态分析

设令牌生成速率 R（令牌/秒），桶容量 C，请求到达速率 λ。

**稳态（λ ≤ R）**：令牌消耗速率 = 生成速率，桶中长期有令牌，所有请求通过。长期吞吐 = λ。

**过载（λ > R）**：令牌消耗快于生成，桶被取空。此后请求只能按 R 的速率通过（取到刚生成的令牌）。长期吞吐 = R，拒绝率 = 1 - R/λ。

**突发场景**：桶初始满（C 个令牌），瞬间到达 B 个请求：

- B ≤ C：全部通过，桶剩 C-B 个令牌。
- B > C：通过 C 个，拒绝 B-C 个，桶空。

这就是"短期突发 ≤ C"的数学解释。

#### 16.2 漏桶的延迟分析

设漏桶容量 C，漏水速率 R，到达速率 λ > R（过载）。

稳态下，请求在桶中排队。队列长度趋于 C，等待时间 W = C / R。例如 C=100, R=100/s，则最大等待 1 秒。

如果 λ 远大于 R，桶迅速填满，后续请求直接溢出（拒绝），拒绝率 = 1 - R/λ。

#### 16.3 滑动窗口的内存优化

朴素实现记录每个请求时间戳，内存 O(n)。优化方案：

- **小窗口聚合**：把大窗口切 k 个小窗口，每个小窗口只存计数。内存 O(k)，精度损失取决于 k。
- **Count-Min Sketch**：用概率数据结构估算，内存极小但有误差。

Sentinel 用小窗口方案（默认 1 秒切 2 个 500ms 小窗口）。

### 十七、限流系统设计完整案例

设计一个"API 网关限流系统"，需求：

- 支持 1000+ 租户，每租户不同配额
- 支持接口级、用户级、IP 级多维限流
- 阈值可动态调整
- 限流数据可观测（监控大盘）

**架构**：

\`\`\`
请求 → 网关(Nginx/APISIX) → 限流模块 → 业务服务
                              ↓
                        Redis 集群（计数器）
                              ↓
                        配置中心（阈值下发）
                              ↓
                        监控系统（指标上报）
\`\`\`

**关键设计点**：

1. **限流 Key 设计**：\`rate:{tenant}:{api}:{user}\`，多维度组合。
2. **本地缓存优化**：高频 Key 在网关本地用令牌桶，减少 Redis 压力；低频 Key 走 Redis。
3. **配置中心**：阈值存配置中心（Apollo/Nacos），变更秒级下发。
4. **降级方案**：Redis 不可用时降级为本地限流（阈值按集群实例数均分）。
5. **监控**：每个拒绝、每个状态变化上报 Prometheus。

\`\`\`python
# Python：限流决策伪代码
def check_rate_limit(request):
    tenant = request.tenant_id
    api = request.path
    user = request.user_id
    ip = request.client_ip

    # 1. 租户级（Redis 集群）
    if not redis_limiter.allow(f"rate:t:{tenant}", tenant_quota):
        return RateLimitResponse(429, "租户配额已满")

    # 2. 接口级（本地令牌桶）
    if not local_limiter.allow(api, api_quota):
        return RateLimitResponse(429, "接口繁忙")

    # 3. 用户级（Redis）
    if not redis_limiter.allow(f"rate:u:{user}", user_quota):
        return RateLimitResponse(429, "请求过于频繁")

    # 4. IP 级（本地，防爬虫）
    if not ip_limiter.allow(ip, ip_quota):
        return RateLimitResponse(429, "IP 请求异常")

    return None  # 放行
\`\`\`

### 十八、限流测试与压测

限流配置上线前必须验证。常见测试方法：

#### 18.1 单元测试

\`\`\`javascript
// 测试令牌桶
function testTokenBucket() {
    const limiter = new TokenBucketLimiter(10, 5); // 容量 10，速率 5/s
    // 突发 10 个应全部通过
    for (let i = 0; i < 10; i++) assert(limiter.allow());
    // 第 11 个应拒绝
    assert(!limiter.allow());
    // 等 200ms 补 1 个令牌
    setTimeout(() => assert(limiter.allow()), 200);
}
\`\`\`

#### 18.2 压测验证

用 wrk 压测，观察：

- 阈值以下请求 100% 成功。
- 阈值以上请求按预期被拒（429 比例符合算法预测）。
- 系统资源（CPU/内存）不超安全线。

\`\`\`bash
# wrk 压测
wrk -t4 -c100 -d30s --latency http://api.example.com/orders
# 期望：QPS 接近阈值，错误率符合限流比例
\`\`\`

#### 18.3 混沌工程

主动注入故障，验证限流/熔断/降级是否生效：

- 下游服务 kill -9，验证熔断是否触发、降级是否返回兜底。
- 流量翻倍，验证限流是否拒绝、监控是否告警。
- Redis 故障，验证分布式限流是否降级到本地。

工具：Chaos Mesh、Chaos Monkey、Gremlin。

### 十九、限流与多租户

SaaS 系统的多租户限流是重点。常见模式：

#### 19.1 配额分级

| 等级 | QPS | 日配额 | 价格 |
| --- | --- | --- | --- |
| 免费 | 10 | 1000 | 0 |
| 基础 | 100 | 50000 | ¥99/月 |
| 专业 | 1000 | 不限 | ¥999/月 |
| 企业 | 自定义 | 不限 | 联系销售 |

\`\`\`sql
-- 租户配额表
CREATE TABLE tenant_quota (
    tenant_id  VARCHAR(32) PRIMARY KEY,
    plan       VARCHAR(16),
    qps_limit  INT,
    daily_limit INT
);
\`\`\`

#### 19.2 配额计费

限流不仅是保护，还是"计费依据"：

- 实时计数：每次请求 INCR 计数器。
- 日结算：每天 0 点把前一天的请求量写入账单。
- 超额提醒：用量达 80%/100% 时通知租户。

\`\`\`java
// Java：超额提醒
if (usage >= quota * 0.8 && !notified80) {
    notifyService.send(tenant, "用量已达 80%");
    notified80 = true;
}
\`\`\`

#### 19.3 公平性

避免大租户挤占小租户：

- 每租户独立限流（前面讲的）。
- 全局预留：核心租户保底配额，不被挤占。
- 熔断兜底：单个租户异常调用不拖垮共享依赖。

### 二十、限流算法实现细节对比

四种算法在不同语言中的实现差异：

#### 20.1 Java 实现（Guava RateLimiter）

Guava 的 \`RateLimiter\` 是令牌桶的经典实现，但它的 \`acquire()\` 是**阻塞**的——取不到令牌就等待，而不是拒绝。

\`\`\`java
// Guava：阻塞式令牌桶
RateLimiter limiter = RateLimiter.create(1000); // 1000 QPS
for (int i = 0; i < 10000; i++) {
    limiter.acquire(); // 阻塞等待令牌
    processRequest();
}
\`\`\`

阻塞式适合"消费端匀速"，拒绝式适合"网关限流"。要实现拒绝式，需自己判断 \`tryAcquire()\`。

#### 20.2 Go 实现（time/rate）

Go 标准库 \`golang.org/x/time/rate\` 提供令牌桶：

\`\`\`go
import "golang.org/x/time/rate"

limiter := rate.NewLimiter(rate.Limit(1000), 100) // 速率 1000，突发 100
if !limiter.Allow() {
    http.Error(w, "Too Many Requests", 429)
    return
}
processRequest()
\`\`\`

#### 20.3 Python 实现（ratelimit 库）

\`\`\`python
from ratelimit import limits, sleep_and_retry

@sleep_and_retry  # 阻塞式
@limits(calls=100, period=1)  # 每秒 100
def call_api():
    return requests.get(url)
\`\`\`

#### 20.4 Node.js 实现（express-rate-limit）

\`\`\`javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 60 * 1000,  // 1 分钟
    max: 100,             // 100 次
    message: 'Too Many Requests',
    standardHeaders: true, // 返回 X-RateLimit-* 头
});
app.use('/api/', limiter);
\`\`\`

### 二十一、限流与降级的可观测性

可观测性三大支柱：日志、指标、链路追踪。限流/熔断/降级都需要接入：

#### 21.1 日志

每次限流拒绝、熔断状态变化、降级触发都记日志，包含 traceId 便于排查。

\`\`\`json
{
  "ts": "2026-06-27T10:00:00Z",
  "level": "WARN",
  "event": "rate_limit_reject",
  "tenant": "tenantA",
  "api": "/orders",
  "user": "u123",
  "traceId": "abc123",
  "limiter": "token_bucket",
  "remaining": 0
}
\`\`\`

#### 21.2 指标

关键指标接入 Prometheus：

- \`rate_limit_total{api, result}\`：限流判定总数（result=allow/reject）
- \`circuit_state{service}\`：熔断器状态（0/1/2）
- \`degradation_total{feature}\`：降级触发次数
- \`downstream_rt{service}\`：下游响应时间

Grafana 大盘展示：QPS 趋势、拒绝率、熔断状态、降级次数。

#### 21.3 链路追踪

熔断时链路会"断"——下游调用没发生。要在 span 上标注"circuit_open"，让排查者知道是熔断了，而不是下游慢。

\`\`\`java
// Java：OpenTelemetry 标注
Span span = tracer.spanBuilder("callInventory").startSpan();
try {
    if (cb.canCall()) {
        // 真实调用
    } else {
        span.setAttribute("circuit", "open"); // 标注熔断
        span.recordException(new CircuitOpenException());
    }
} finally {
    span.end();
}
\`\`\`

### 二十二、更多生产案例

**案例 4：分布式限流 Redis 击穿**

某系统用 Redis 计数器做分布式限流，Redis 单点。一次 Redis 主从切换，主挂了 5 秒，限流计数全部丢失。切换后瞬间所有请求都通过（计数器从 0 开始），下游被压垮。改进：Redis 集群 + 本地兜底限流（Redis 不可用时按实例数均分阈值）。

**案例 5：熔断恢复振荡**

某熔断器 OPEN 后等 10 秒转 CLOSED，但下游还没恢复，立刻又被打回 OPEN，如此反复。下游刚恢复一点就被打挂。改进：HALF-OPEN 探测（只放 1 个请求），且 OPEN 时间指数退避（10s→20s→40s）。

**案例 6：限流误杀正常用户**

某 IP 限流 100 QPS，但运营商 NAT 下整个小区共用一个 IP，正常用户请求被拒。改进：IP 限流阈值放宽到 1000，配合设备指纹和行为分析识别爬虫，而不是单纯按 IP。

**案例 7：线程池隔离未配超时**

某服务用线程池隔离调用下游，但没设超时。下游变慢，调用阻塞在 read，线程池线程被占用不释放，最终池满。隔离形同虚设。改进：必须配合超时（如 1 秒），超时即释放线程。

**案例 8：降级返回 null 导致 NPE**

某服务降级时返回 null，调用方没判空，链式调用 \`result.getUser().getName()\` 抛 NPE，雪崩。改进：降级返回"空对象"（Null Object 模式），如 \`User.empty()\` 而非 null。

### 二十三、限流配置清单（Checklist）

上线前逐项检查：

**基础配置**：

- [ ] 每个对外接口都有限流（至少全局限流）
- [ ] 阈值基于压测，留 20%-30% 余量
- [ ] 核心接口有接口级、用户级多维限流
- [ ] 限流返回 429 + Retry-After 头

**熔断配置**：

- [ ] 每个跨服务调用都有熔断
- [ ] 失败率阈值、最小请求数、统计窗口合理
- [ ] recovery timeout 合理（不振荡）
- [ ] HALF-OPEN 探测数合理
- [ ] 熔断返回 503

**降级配置**：

- [ ] 核心流程有降级路径
- [ ] 降级返回有意义兜底（非 null）
- [ ] 降级开关支持热更新
- [ ] 非核心功能可手动关闭

**隔离配置**：

- [ ] 外部调用线程池隔离 + 超时
- [ ] 内部高速调用信号量隔离
- [ ] 线程池大小合理（基于压测）

**可观测性**：

- [ ] 限流/熔断/降级指标接入 Prometheus
- [ ] Grafana 大盘
- [ ] 告警规则（熔断 OPEN = P1）
- [ ] 链路追踪标注熔断状态

**容错**：

- [ ] Redis 高可用（集群）
- [ ] Redis 故障降级本地限流
- [ ] 混沌工程验证

### 二十四、常见面试题深度解答

**Q1：令牌桶和漏桶的本质区别？**

漏桶**输出恒定**（无论输入多突发，输出都是 R），适合需要绝对匀速的场景；令牌桶**允许突发**（桶里有 C 个令牌时瞬间可放行 C 个），适合流量本身有突发的真实场景。本质区别在于：漏桶限制的是"输出速率"，令牌桶限制的是"长期平均速率 + 短期突发量"。

**Q2：固定窗口的临界突发如何彻底解决？**

滑动窗口（时间戳或小窗口）能解决，但有内存开销。另一种思路是**双窗口计数**：维护当前窗口和上一窗口的计数，用加权估算实时速率：\`estimate = prev_count × (1 - elapsed/window) + curr_count\`。内存 O(1)，比朴素滑动窗口省。

**Q3：分布式限流为什么必须用 Lua？**

不用 Lua 的话，"读计数→判断→写计数"是三步操作，并发下会出现：A 读到 99、B 读到 99、A 判断通过写 100、B 判断通过写 101——超限。Lua 脚本在 Redis 单线程内原子执行，避免竞态。或者用 Redis 事务（MULTI/EXEC）+ WATCH，但 Lua 更简洁高效。

**Q4：熔断器 HALF-OPEN 为什么只放少量请求？**

如果 HALF-OPEN 放全部请求，下游刚恢复（可能只恢复了 10% 容量）立刻被打回故障。少量探测请求（如 1-3 个）既能验证恢复，又不会压垮脆弱的下游。探测成功后逐步放量（或直接转 CLOSED）更安全。

**Q5：限流阈值怎么定？**

四步：① 压测找极限 QPS（CPU 80%-90% 时）；② 阈值 = 极限 × 0.7-0.8（留余量）；③ 按接口分级；④ 上线后根据监控动态调整。核心是"基于数据，不要拍脑袋"。

**Q6：Sentinel 的"系统自适应限流"是什么？**

Sentinel 会监控系统的 CPU 使用率、负载、平均 RT、入口 QPS、并发线程数，任一指标超阈值自动限流，无需人工设 QPS 阈值。原理类似 BBR——根据系统实时状态动态调整。适合内部服务（能力随负载变化），不适合对外 API（需要保证 SLA）。

### 二十五、限流与 SLO 的关系

SLO（Service Level Objective）是"服务可用性目标"，如"99.9% 的请求 200ms 内返回"。限流直接影响 SLO：

- 限流拒绝的请求算"失败"还是"不计数"？业界做法：限流拒绝（429）不计入 SLO 分母（用户没真正使用服务），但要有单独的"限流率" SLO。
- 熔断期间的快速失败算"失败"，要计入 SLO。
- 降级返回兜底算"成功"（用户拿到了响应），但质量降级。

设计 SLO 时要明确这些边界，避免限流/熔断把 SLO 拉低，反过来又要调整限流策略。

### 二十六、限流与队列

限流是"拒绝多余请求"，另一种思路是"排队等待"——把多余请求放进队列异步处理。两者关系：

| 机制 | 行为 | 用户体验 | 适用 |
| --- | --- | --- | --- |
| 限流 | 拒绝 | 立即失败 | 实时交互 |
| 排队 | 等待 | 延迟响应 | 可异步任务 |
| 限流+排队 | 短暂排队后拒绝 | 延迟+部分失败 | 平衡 |

电商秒杀常用"排队"：用户点抢购 → 进队列 → 后端慢慢处理 → 用户轮询结果。避免直接限流把用户拒之门外。

\`\`\`javascript
// Node.js：限流 + 排队
class QueueWithLimit {
    constructor(maxConcurrent, maxQueue) {
        this.running = 0;
        this.queue = [];
        this.maxConcurrent = maxConcurrent;
        this.maxQueue = maxQueue;
    }
    submit(task) {
        if (this.queue.length >= this.maxQueue) {
            return Promise.reject(new Error('队列已满')); // 限流
        }
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            this.run();
        });
    }
    run() {
        while (this.running < this.maxConcurrent && this.queue.length) {
            const { task, resolve, reject } = this.queue.shift();
            this.running++;
            task().then(resolve, reject).finally(() => {
                this.running--;
                this.run();
            });
        }
    }
}
\`\`\`

### 二十七、限流的边界与局限

限流不是万能的，要认识其局限：

1. **限流不能提升容量**：它只是"放弃部分请求"，系统真实处理能力没变。要扛更高 QPS 还是得扩容。
2. **限流可能误杀**：阈值设低会误杀正常流量，设高保护不足。需要持续调优。
3. **分布式限流有延迟**：Redis 调用增加几毫秒延迟，且 Redis 故障影响限流。
4. **限流不防逻辑 bug**：限流挡不住"单个请求逻辑错误导致的崩溃"。
5. **限流不防数据问题**：脏数据导致的崩溃，限流无能为力。

因此限流要配合**容量规划（扩容）、代码质量、数据校验、监控告警**一起，构成完整的稳定性保障。

### 二十八、扩展阅读与延伸学习

#### 28.1 经典论文与规范

- **Token Bucket Algorithm**：最早由 Turner 提出，用于 ATM 网络流量整形
- **Leaky Bucket Algorithm**：ITU-T I.371 标准，用于网络流量整形
- **Google SRE Book**：第 22 章"Handling Overload"详细讨论限流策略
- **Netflix Hystrix Wiki**：熔断器模式的工业级实现文档
- **Sentinel Wiki**：阿里开源限流熔断框架的设计文档

#### 28.2 进阶话题

- **自适应限流**：基于系统负载（CPU、Load、RT）动态调整阈值，参考 BBR 算法
- **多级限流**：网关层 → 应用层 → 数据层，层层保护
- **限流与降级联动**：触发限流时自动启用降级策略
- **限流与重试的协调**：避免重试风暴（指数退避 + 抖动）
- **限流与雪崩防护**：防止限流本身引发雪崩

#### 28.3 工具与平台

- **Sentinel**（阿里）：Java 生态主流，支持限流/熔断/系统自适应
- **Hystrix**（Netflix）：熔断鼻祖，已停止维护
- **Resilience4j**：Hystrix 的现代替代，函数式风格
- **Envoy**：Service Mesh 中的限流能力
- **Nginx limit_req**：网关层限流
- **Redis + Lua**：分布式限流通用方案

#### 28.4 实战建议

1. **从简单开始**：先用单机令牌桶验证效果，再考虑分布式
2. **监控先行**：限流前必须有 QPS、错误率、RT 监控
3. **灰度上线**：先对 1% 流量启用限流，观察无异常后全量
4. **预案齐全**：限流触发后的降级、告警、扩容预案要预先准备
5. **定期演练**：通过混沌工程验证限流配置是否生效

#### 28.5 常见误区澄清

- **误区：限流能解决一切性能问题** —— 限流只是"挡水"，不能"排水"
- **误区：阈值越保守越安全** —— 过低阈值影响业务，要找平衡点
- **误区：分布式限流一定比单机好** —— 引入 Redis 依赖，可用性下降
- **误区：熔断后什么都不做** —— 必须有降级策略，否则用户体验更差
- **误区：限流配置一次到位** —— 需要根据业务变化持续调整

### 总结

限流、熔断、降级是高可用系统的"三板斧"，三者配合构成完整的容错防线：

- **限流**在入口控制流量，防压垮。
- **熔断**在中段切断故障，防拖垮。
- **降级**在末端兜底，保可用。

算法上，令牌桶是通用首选；分布式场景用 Redis+Lua；熔断用 HALF-OPEN 探测恢复。生产实践上，必须配合压测评估阈值、监控告警、动态调整，否则配置形同虚设。记住一句话：**没有容错的系统，故障只是时间问题**。

---

**延伸阅读**：

- 《Release It!》—— Michael Nygard，容错设计经典
- Sentinel 官方文档：https://sentinelguard.io
- Resilience4j 文档：https://resilience4j.readme.io
- Google SRE Book 第 22 章"Addressing Cascading Failures"
- Hystrix Wiki：https://github.com/Netflix/Hystrix/wiki

**实践建议**：

1. 任何对外接口都加限流，哪怕阈值很高，是"安全带"。
2. 任何跨服务调用都加熔断，下游不是你控制的。
3. 核心流程设计时就考虑降级路径，不要等故障才想。
4. 上线前必做混沌工程（故障注入），验证容错配置生效。
5. 监控大盘必须有限流/熔断/降级指标，纳入 SLO。

**面试高频问题**：

- 令牌桶和漏桶的区别？什么场景用哪个？
- 固定窗口的临界突发问题怎么解决？
- 熔断器三种状态如何转换？HALF-OPEN 的作用？
- 分布式限流为什么用 Lua？不用 Lua 会有什么问题？
- 限流和熔断的触发条件有何不同？
- 如何评估限流阈值？
- 降级有哪些策略？降级返回 null 有什么风险？
- Sentinel 和 Hystrix 的核心区别？
- 雪崩效应是什么？三板斧如何分别应对？
- 熔断器恢复时为什么要用 HALF-OPEN 探测而不是直接转 CLOSED？

**最佳实践清单**：

- [ ] 所有对外接口配置限流（至少全局限流）
- [ ] 所有跨服务调用配置熔断
- [ ] 核心流程设计降级路径
- [ ] 限流阈值基于压测，留 20%-30% 余量
- [ ] 熔断恢复用 HALF-OPEN 探测
- [ ] 降级返回有意义兜底，不返回 null
- [ ] 限流/熔断/降级指标接入监控
- [ ] 阈值支持动态调整（配置中心）
- [ ] 关键接口做混沌工程验证
- [ ] 限流返回 429，熔断/降级返回 503，区分错误码
- [ ] 分布式限流 Redis 做高可用，避免单点
- [ ] 黑白名单配合限流，差异化管控

**附录：限流算法复杂度**

| 算法 | 时间复杂度 | 空间复杂度 | 备注 |
| --- | --- | --- | --- |
| 固定窗口 | O(1) | O(1) | 单计数器 |
| 滑动窗口(小窗口) | O(k) k=小窗口数 | O(k) | 通常 k=10-60 |
| 滑动窗口(时间戳) | O(n) n=窗口内请求数 | O(n) | 高 QPS 下退化 |
| 漏桶 | O(1) | O(1) | 单水量计数 |
| 令牌桶 | O(1) | O(1) | 单令牌计数 |

**附录：HTTP 429 响应最佳实践**

\`\`\`http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 30
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1578604800

{
  "code": 429,
  "message": "请求过于频繁，请稍后重试",
  "retryAfter": 30
}
\`\`\`

返回 429 时应携带 \`Retry-After\` 头告知客户端多久后重试，以及 \`X-RateLimit-*\` 头告知配额信息，方便客户端自适应退避。

**附录：客户端退避策略**

客户端被限流后，不应立即重试，而应"指数退避 + 抖动"：

\`\`\`python
# Python：指数退避重试
import random, time
def retry_with_backoff(fn, max_retries=5):
    for i in range(max_retries):
        try:
            return fn()
        except RateLimitError:
            if i == max_retries - 1: raise
            wait = (2 ** i) + random.random()  # 指数 + 抖动
            time.sleep(wait)
\`\`\`

抖动（jitter）很重要：如果没有抖动，所有客户端同时被限流、同时退避、同时重试，会形成"重试风暴"，再次触发限流。抖动让重试分散开。

至此，限流、熔断、降级三大容错机制讲解完毕。下一章我们将讨论 API 版本管理，看看如何在系统演进中保持接口的兼容与有序迭代。
`,
    code: `// ============================================================
// 限流与熔断降级 —— 可运行示例
// 实现四种限流算法 + 熔断器状态机 + 突发流量与故障模拟
// ============================================================

// ---------- 1. 固定窗口计数限流 ----------
class FixedWindowLimiter {
  constructor(limit, windowMs) {
    this.limit = limit;           // 窗口内最大请求数
    this.windowMs = windowMs;     // 窗口大小（毫秒）
    this.count = 0;
    this.windowStart = Date.now();
  }
  allow() {
    const now = Date.now();
    if (now - this.windowStart >= this.windowMs) {
      this.windowStart = now;     // 进入新窗口，重置计数
      this.count = 0;
    }
    if (this.count < this.limit) {
      this.count++;
      return true;
    }
    return false;
  }
}

// ---------- 2. 滑动窗口计数限流 ----------
class SlidingWindowLimiter {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.requests = [];           // 请求时间戳队列
  }
  allow() {
    const now = Date.now();
    // 清理窗口外的旧时间戳
    while (this.requests.length && now - this.requests[0] >= this.windowMs) {
      this.requests.shift();
    }
    if (this.requests.length < this.limit) {
      this.requests.push(now);
      return true;
    }
    return false;
  }
}

// ---------- 3. 漏桶限流（匀速出水） ----------
class LeakyBucketLimiter {
  constructor(capacity, leakRatePerSec) {
    this.capacity = capacity;          // 桶容量（队列长度）
    this.leakRate = leakRatePerSec;    // 漏水速率（请求/秒）
    this.water = 0;                    // 当前水量
    this.lastLeak = Date.now();
  }
  allow() {
    const now = Date.now();
    // 先按时间漏出水量
    const elapsed = (now - this.lastLeak) / 1000;
    this.water = Math.max(0, this.water - elapsed * this.leakRate);
    this.lastLeak = now;
    // 再尝试加水（请求入桶）
    if (this.water < this.capacity) {
      this.water += 1;
      return true;
    }
    return false; // 桶满，溢出
  }
}

// ---------- 4. 令牌桶限流（允许突发） ----------
class TokenBucketLimiter {
  constructor(capacity, refillRatePerSec) {
    this.capacity = capacity;          // 桶容量（最大令牌数 = 最大突发量）
    this.refillRate = refillRatePerSec;// 令牌生成速率（长期平均速率）
    this.tokens = capacity;            // 初始满桶
    this.lastRefill = Date.now();
  }
  allow() {
    const now = Date.now();
    // 按时间补充令牌，但不超过容量
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
    // 尝试取一个令牌
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
}

// ---------- 5. 熔断器状态机 ----------
class CircuitBreaker {
  constructor(opts) {
    this.failureThreshold = opts.failureThreshold; // 失败率阈值（0-1）
    this.minRequests = opts.minRequests;           // 最小统计请求数
    this.timeout = opts.timeout;                   // OPEN 持续时间 ms
    this.halfOpenMax = opts.halfOpenMax || 3;      // HALF-OPEN 放行请求数
    this.state = 'CLOSED';
    this.fail = 0;
    this.succ = 0;
    this.openedAt = 0;
    this.halfOpenCalls = 0;
  }
  // 判断是否允许调用（不真正调用）
  canCall() {
    if (this.state === 'OPEN') {
      if (Date.now() - this.openedAt >= this.timeout) {
        // 超时，转入半开探测
        this.state = 'HALF_OPEN';
        this.halfOpenCalls = 0;
        console.log('  [熔断器] OPEN → HALF_OPEN（开始探测）');
      } else {
        return false; // 熔断中，快速失败
      }
    }
    if (this.state === 'HALF_OPEN') {
      if (this.halfOpenCalls >= this.halfOpenMax) return false; // 探测名额用完
      this.halfOpenCalls++;
    }
    return true;
  }
  // 记录调用成功
  onSuccess() {
    if (this.state === 'HALF_OPEN') {
      console.log('  [熔断器] HALF_OPEN → CLOSED（探测成功，恢复）');
      this.state = 'CLOSED';
      this.fail = 0;
      this.succ = 0;
    } else {
      this.succ++;
    }
  }
  // 记录调用失败
  onFailure() {
    if (this.state === 'HALF_OPEN') {
      // 探测失败，重新熔断
      console.log('  [熔断器] HALF_OPEN → OPEN（探测失败，重新熔断）');
      this.state = 'OPEN';
      this.openedAt = Date.now();
      return;
    }
    this.fail++;
    const total = this.fail + this.succ;
    if (total >= this.minRequests && this.fail / total >= this.failureThreshold) {
      console.log('  [熔断器] CLOSED → OPEN（失败率达阈值 ' + (this.failureThreshold * 100) + '%）');
      this.state = 'OPEN';
      this.openedAt = Date.now();
      this.fail = 0;
      this.succ = 0;
    }
  }
}

// ============================================================
// 演示 1：四种限流算法对比
// ============================================================
console.log('===== 演示 1：四种限流算法对比 =====');
console.log('场景：100ms 内突发 20 个请求，阈值 10\\n');

const algos = [
  ['固定窗口', new FixedWindowLimiter(10, 1000)],
  ['滑动窗口', new SlidingWindowLimiter(10, 1000)],
  ['漏桶    ', new LeakyBucketLimiter(10, 50)],   // 容量 10，速率 50/s
  ['令牌桶  ', new TokenBucketLimiter(10, 50)],   // 容量 10，速率 50/s
];
for (const [name, limiter] of algos) {
  let passed = 0;
  for (let i = 0; i < 20; i++) {
    if (limiter.allow()) passed++;
  }
  console.log(\`  \${name}: 20 个请求通过 \${passed} 个\`);
}

// ============================================================
// 演示 2：令牌桶应对突发
// ============================================================
console.log('\\n===== 演示 2：令牌桶应对突发流量 =====');
const tb = new TokenBucketLimiter(5, 10); // 容量 5，速率 10/s
console.log('初始满桶 5 个令牌，瞬间来 8 个请求：');
let burst = 0;
for (let i = 0; i < 8; i++) if (tb.allow()) burst++;
console.log(\`  突发通过 \${burst} 个（= 容量 5），其余被拒\`);
console.log('等待 200ms（令牌补充 2 个）后 3 个请求：');
setTimeout(() => {
  let p = 0;
  for (let i = 0; i < 3; i++) if (tb.allow()) p++;
  console.log(\`  通过 \${p} 个（令牌已补 2）\`);
}, 200);

// ============================================================
// 演示 3：熔断器状态机
// ============================================================
console.log('\\n===== 演示 3：熔断器（下游故障→熔断→恢复）=====');
const cb = new CircuitBreaker({
  failureThreshold: 0.5,  // 失败率 50% 熔断
  minRequests: 4,         // 至少 4 个请求才统计
  timeout: 300,           // OPEN 持续 300ms
  halfOpenMax: 2,
});

// 模拟下游函数：前 6 次失败，之后成功
let callCount = 0;
function mockDownstream() {
  callCount++;
  if (callCount <= 6) throw new Error('下游故障');
  return 'OK';
}

// 阶段 1：正常调用，下游故障，触发熔断
console.log('\\n阶段 1：下游故障，触发熔断');
for (let i = 0; i < 6; i++) {
  if (!cb.canCall()) { console.log('  请求 ' + (i+1) + ': 熔断中，快速失败'); continue; }
  try { mockDownstream(); cb.onSuccess(); console.log('  请求 ' + (i+1) + ': 成功'); }
  catch (e) { cb.onFailure(); console.log('  请求 ' + (i+1) + ': 失败 - ' + e.message); }
}

// 阶段 2：熔断中，所有请求快速失败
console.log('\\n阶段 2：熔断 OPEN，请求被快速拒绝');
for (let i = 0; i < 3; i++) {
  if (!cb.canCall()) console.log('  请求: 快速失败（熔断中）');
}

// 阶段 3：等待 timeout 后 HALF-OPEN 探测，下游恢复
setTimeout(() => {
  console.log('\\n阶段 3：300ms 后，下游恢复，半开探测');
  for (let i = 0; i < 3; i++) {
    if (!cb.canCall()) { console.log('  请求: 探测名额用完'); continue; }
    try { mockDownstream(); cb.onSuccess(); console.log('  探测请求: 成功'); }
    catch (e) { cb.onFailure(); console.log('  探测请求: 失败'); }
  }
  console.log('\\n===== 演示结束 =====');
}, 350);
`,
  },
  // =========================================================
  // 第二章：API 版本管理
  // =========================================================
  {
    id: "backend-api-version",
    group: "API 设计与架构",
    icon: "📦",
    title: "API 版本管理",
    content: `## API 版本管理

**API 版本管理（API Versioning）** 是后端系统在长期演进中必须面对的核心课题。一个上线的 API，背后可能有成百上千个客户端、第三方集成商、内部服务在依赖它。当你需要修改 API（加字段、改字段、删字段、改语义）时，如何在不破坏现有调用方的前提下平滑演进？这就是版本管理要解决的问题。

API 不是"写完就完"的一次性产物，而是一个会持续生长 5 年、10 年的"活接口"。没有版本管理的 API，要么永远不敢改（技术债堆积），要么一改全崩（调用方炸锅）。版本管理就是给 API 的"生长"建立秩序。

### 一、为什么需要 API 版本管理

#### 1.1 迭代演进的必然

业务在变，需求在变，API 就得变。举几个常见场景：

- 用户表加了 \`avatar\` 字段，列表接口要返回它。
- 订单的 \`status\` 从字符串（"paid"）改成枚举码（1），更省存储。
- 发现 \`/users\` 接口返回的 \`phone\` 字段有隐私风险，要脱敏。
- 旧的 \`/v1/search\` 性能差，要用新引擎重写 \`/v2/search\`。

这些变更里，有的对调用方无害（加字段），有的会直接破坏调用方（改类型、删字段）。版本管理让你能"安全地做破坏性变更"。

#### 1.2 兼容性保障

线上 API 的调用方往往无法同步升级：

- **移动端 App**：用户不更新 App，老版本可能用 3 年。你改了 API，老 App 就崩。
- **第三方集成商**：他们有自己的发布周期，不会跟着你改。
- **内部服务**：微服务间依赖，A 改了接口，B/C/D 都得改才能用。

版本管理让"老调用方继续用老版本，新调用方用新版本"，两者并行，互不影响。

#### 1.3 灰度与回滚

新版本 API 上线，不能"一刀切"——万一有 bug，所有用户都受影响。版本管理支持灰度：

- 先让 1% 流量走 v2，观察无异常再放量。
- 出问题立即把流量切回 v1，秒级回滚。
- A/B 测试：v1 和 v2 同时跑，对比效果。

#### 1.4 实验与创新

想做新功能但不确定行不行？开个 v3 版本，少量用户试用，效果好就转正，不好就下线，不影响 v1/v2 主线。

> 一句话：版本管理让 API 能"安全地变、有序地变、可控地变"。

### 二、版本管理策略对比

业界主流的版本管理策略有四种，核心区别是"版本号放在哪里"。

#### 2.1 URL 路径版本

把版本号放在 URL 路径里：\`/api/v1/users\`、\`/api/v2/users\`。

\`\`\`
GET /api/v1/users/123   → v1 版本
GET /api/v2/users/123   → v2 版本
\`\`\`

这是**最常用**的方式，Stripe、GitHub、Twitter 都用。

**优点**：

- **直观**：一眼看出用的哪个版本，调试方便。
- **简单**：路由层直接区分，实现容易。
- **缓存友好**：URL 不同，CDN/浏览器缓存独立，不会串版本。
- **文档清晰**：每个版本独立文档 URL。

**缺点**：

- **不符合 REST 纯粹主义**：REST 认为资源路径应稳定，版本不是资源的一部分。但实战中这几乎不是问题。
- **版本多了路由复杂**：v1/v2/v3/v4 共存时路由表膨胀。

\`\`\`javascript
// Node.js (Express)：URL 路径版本
app.get('/api/v1/users/:id', (req, res) => {
    res.json(getUserV1(req.params.id)); // 返回 {id, name}
});
app.get('/api/v2/users/:id', (req, res) => {
    res.json(getUserV2(req.params.id)); // 返回 {id, name, avatar, email}
});
\`\`\`

\`\`\`java
// Java (Spring)：URL 路径版本
@RestController
@RequestMapping("/api/v1/users")
public class UserV1Controller {
    @GetMapping("/{id}")
    public UserV1 get(@PathVariable Long id) { return userService.getV1(id); }
}

@RestController
@RequestMapping("/api/v2/users")
public class UserV2Controller {
    @GetMapping("/{id}")
    public UserV2 get(@PathVariable Long id) { return userService.getV2(id); }
}
\`\`\`

#### 2.2 Header 版本

把版本号放在自定义请求头里，URL 不变。

\`\`\`
GET /api/users/123
Accept: application/vnd.myapi.v2+json
\`\`\`

或自定义头：

\`\`\`
GET /api/users/123
X-Api-Version: 2
\`\`\`

**优点**：

- **URL 干净**：资源路径稳定，符合 REST 理念。
- **版本不暴露在 URL**：对终端用户不可见（如果这是优点的话）。

**缺点**：

- **不直观**：看 URL 不知道版本，调试要抓包看头。
- **缓存不友好**：URL 相同，CDN 默认按 URL 缓存，会串版本。需要配 \`Vary: Accept\` 头。
- **测试麻烦**：浏览器直接访问 URL 测不了，得用 Postman/curl 带头。

\`\`\`javascript
// Node.js：Header 版本
app.get('/api/users/:id', (req, res) => {
    const version = req.headers['accept'].includes('v2') ? 'v2' : 'v1';
    const user = version === 'v2' ? getUserV2(req.params.id) : getUserV1(req.params.id);
    res.json(user);
});
\`\`\`

#### 2.3 Query 参数版本

把版本放在 query 参数里：\`/api/users/123?version=2\`。

\`\`\`
GET /api/users/123?version=2
\`\`\`

**优点**：实现最简单。

**缺点**（多）：

- **容易遗漏**：调用方忘传 version 就默认走 v1，行为不一致。
- **缓存灾难**：有的缓存忽略 query 参数，导致 v1/v2 串缓存。
- **不专业**：query 参数应表示"过滤条件"，不是"版本"。

**不推荐**，除非内部小工具。

#### 2.4 媒体类型版本（Content Negotiation）

用 HTTP 的 \`Accept\` 头做内容协商，版本嵌在媒体类型里：

\`\`\`
GET /api/users/123
Accept: application/vnd.myapi+json;version=2
\`\`\`

GitHub API 早期用这种方式（\`application/vnd.github.v3+json\`）。

**优点**：

- 最符合 HTTP 规范（内容协商本就是 Accept 的用途）。
- URL 稳定。

**缺点**：

- 实现复杂，要解析 Accept 头。
- 同样有缓存问题。
- 对新手不友好。

#### 2.5 四种策略对比

| 策略 | 直观性 | 实现难度 | 缓存友好 | REST 纯粹 | 典型用户 |
| --- | --- | --- | --- | --- | --- |
| URL 路径 | ⭐⭐⭐⭐⭐ | 简 | ⭐⭐⭐⭐⭐ | 一般 | Stripe/GitHub/大多数 |
| Header | ⭐⭐ | 中 | ⭐⭐ | 好 | 部分内部 API |
| Query | ⭐⭐⭐⭐ | 极简 | ⭐ | 一般 | 不推荐 |
| 媒体类型 | ⭐⭐ | 难 | ⭐⭐ | 极好 | GitHub(早期) |

**选型建议**：

- **对外公开 API**：URL 路径版本（最主流，用户最易理解）。
- **内部微服务**：Header 版本（URL 简洁，版本由网关控制）。
- **不推荐**：Query 参数（坑多）。

### 三、向后兼容 vs 向前兼容

兼容性是版本管理的核心概念，分两种方向：

#### 3.1 向后兼容（Backward Compatible）

"新版本能处理老调用方的请求"——新代码兼容老客户端。

典型向后兼容的变更：

- **新增字段**：v2 响应多一个 \`avatar\` 字段，老客户端忽略它，不报错。
- **新增端点**：加个 \`/v2/search\`，老客户端不调用，无影响。
- **新增可选参数**：v2 接口多了个可选 query 参数，老客户端不传，行为不变。

\`\`\`json
// v1 响应
{ "id": 1, "name": "张三" }

// v2 响应（向后兼容，多了 avatar，老客户端忽略）
{ "id": 1, "name": "张三", "avatar": "/a.png" }
\`\`\`

**向后兼容是默认要求**——每次小改动都应尽量向后兼容，避免频繁升大版本。

#### 3.2 向前兼容（Forward Compatible）

"老版本能处理新调用方的请求"——老代码兼容新客户端。这在 API 场景较少见，更多在协议设计（如 Protobuf 加字段，老代码能解析新数据，忽略未知字段）。

#### 3.3 什么变更破坏兼容性

| 变更 | 向后兼容？ | 说明 |
| --- | --- | --- |
| 新增响应字段 | ✅ 是 | 老客户端忽略新字段 |
| 删除响应字段 | ❌ 否 | 老客户端依赖该字段会崩 |
| 修改字段类型 | ❌ 否 | string→int 老客户端解析崩 |
| 修改字段语义 | ❌ 否 | "status:1" 从"已付"变成"已发"，老客户端逻辑错 |
| 重命名字段 | ❌ 否 | 老字段没了 |
| 新增请求必填参数 | ❌ 否 | 老客户端没传，报错 |
| 新增请求可选参数 | ✅ 是 | 老客户端不传，走默认 |
| 改变默认行为 | ❌ 否 | 默认排序变了，老客户端结果变 |
| 新增端点 | ✅ 是 | 老客户端不调用 |
| 删除端点 | ❌ 否 | 老客户端调用 404 |

**记住一条**：只增不减、只加不改，就能保持向后兼容。一旦要"减/改"，就必须升大版本。

### 四、破坏性变更识别

判断一个变更是不是"破坏性"（breaking），有个简单原则：**"老调用方在不知道变更的情况下，还能正常工作吗？"** 如果不能，就是破坏性。

#### 4.1 明显的破坏性变更

- 删除字段或端点。
- 改字段类型（string → int）。
- 改字段语义（同名字段含义变了）。
- 把可选参数改成必填。
- 改变默认值/默认行为。

#### 4.2 隐蔽的破坏性变更（容易踩坑）

- **收紧校验**：v1 不校验 email 格式，v2 加了校验，老客户端的"非法"email 突然报错。
- **改变错误码**：v1 返回 400，v2 返回 422，老客户端按 400 处理，422 漏掉。
- **改变响应顺序**：v1 列表按 id 排序，v2 按时间排序，老客户端依赖顺序的逻辑错乱。
- **改变分页大小**：v1 默认每页 20，v2 改 50，老客户端按 20 计算的逻辑错。
- **字段长度限制**：v1 不限长，v2 限 100 字符，老客户端的长数据被截断。
- **新增枚举值**：v1 status 是 1/2，v2 加了 3，老客户端没处理 3 的逻辑，崩。

最后一条最容易被忽略——**新增枚举值看似"只增不改"，但客户端若用 switch-case 没有 default 分支，新枚举会让它崩**。所以枚举扩展也要谨慎。

#### 4.3 变更评估清单

每次改 API 前，过一遍这个清单：

- [ ] 有没有删除字段/端点？
- [ ] 有没有改字段类型？
- [ ] 有没有改字段语义？
- [ ] 有没有把可选改必填？
- [ ] 有没有改默认行为？
- [ ] 有没有收紧校验？
- [ ] 有没有改错误码/错误格式？
- [ ] 有没有新增枚举值（客户端可能没处理）？

任一为是 → 破坏性变更 → 升大版本或写适配层。

### 五、版本共存策略

新版本上线后，老版本不能立刻删——还有调用方在用。常见的共存策略：

#### 5.1 多版本并行

v1 和 v2 同时运行，各自独立代码（或共享代码 + 适配层）。调用方按需选择版本。

\`\`\`
/api/v1/users  → UserV1Controller
/api/v2/users  → UserV2Controller
\`\`\`

**优点**：调用方零压力，慢慢迁移。
**缺点**：维护成本高，多版本代码要同步修复 bug。

#### 5.2 废弃时间表（Deprecation Timeline）

明确告知"v1 将于 2026-12-31 下线"，给调用方足够时间迁移。

\`\`\`
v2 上线:        2026-01-01
v1 标记废弃:    2026-01-01（响应头加 Deprecation: true）
v1 限流降级:    2026-09-01（v1 配额减半）
v1 下线:        2026-12-01（返回 410 Gone）
\`\`\`

#### 5.3 迁移引导

老版本响应里加提示，引导调用方迁移：

\`\`\`http
HTTP/1.1 200 OK
Deprecation: true
Sunset: Wed, 31 Dec 2026 00:00:00 GMT
Link: </api/v2/users>; rel="successor-version"

{ "id": 1, "name": "张三" }
\`\`\`

- \`Deprecation\` 头（RFC 8594草案）：标记已废弃。
- \`Sunset\` 头：告知下线时间。
- \`Link: rel=successor-version\`：指向新版本。

#### 5.4 强制升级（慎用）

对于严重安全问题的版本，可强制下线。但要提前公告，提供迁移工具，避免"半夜下线导致客户崩"。

### 六、版本迁移实战

从 v1 迁移到 v2 是个系统工程，不只是"复制代码改改"。常见模式：

#### 6.1 适配层（Adapter）

v2 内部逻辑改了，但通过适配层把 v1 的请求/响应转成 v2 格式，让 v1 调用方无感。

\`\`\`javascript
// v1 接口内部走 v2 逻辑 + 适配
app.get('/api/v1/users/:id', async (req, res) => {
    const v2User = await userServiceV2.get(req.params.id); // v2 内部
    // 适配：v2 格式 → v1 格式
    const v1User = {
        id: v2User.userId,        // v2 的 userId 对应 v1 的 id
        name: v2User.displayName, // v2 的 displayName 对应 v1 的 name
        // v1 没有 avatar 字段，丢弃
    };
    res.json(v1User);
});
\`\`\`

**优点**：v1/v2 共享核心逻辑，维护一份代码。
**缺点**：适配层有转换开销和复杂度。

#### 6.2 数据转换

v1 和 v2 字段名/结构不同，需要转换。集中管理转换规则，避免散落各处。

\`\`\`java
// Java：版本转换器
public class UserVersionConverter {
    public static UserV1 toV1(UserV2 v2) {
        UserV1 v1 = new UserV1();
        v1.setId(v2.getUserId());
        v1.setName(v2.getDisplayName());
        return v1;
    }
    public static UserV2 toV2(UserV1 v1) {
        UserV2 v2 = new UserV2();
        v2.setUserId(v1.getId());
        v2.setDisplayName(v1.getName());
        return v2;
    }
}
\`\`\`

#### 6.3 逐步下线 v1

\`\`\`
阶段1: v2 上线，v1/v2 并行，监控 v1 用量
阶段2: v1 加 Deprecation 头，邮件通知大客户迁移
阶段3: v1 用量 < 5% 时，对小客户弹迁移提示
阶段4: v1 用量 < 1% 时，v1 限流（QPS 减半）
阶段5: v1 用量 = 0（或到下线日），v1 返回 410 Gone
\`\`\`

#### 6.4 迁移工具

提供 SDK/脚本帮调用方自动迁移：

- 字段名批量替换脚本。
- 兼容性检测工具（扫描调用方代码，找出会破坏的地方）。
- 双跑对比（同时调 v1/v2，对比结果，发现差异）。

### 七、语义化版本 SemVer 在 API 中的应用

**SemVer（Semantic Versioning）** 用 \`MAJOR.MINOR.PATCH\` 三段式表示版本：

- **MAJOR**：破坏性变更（不兼容），必须升。如 v1 → v2。
- **MINOR**：向后兼容的新功能。如 v1.1 → v1.2。
- **PATCH**：向后兼容的 bug 修复。如 v1.0.1 → v1.0.2。

应用到 API：

| 变更类型 | 版本变化 | 例子 |
| --- | --- | --- |
| 删字段/改类型 | MAJOR (v1→v2) | 删除 \`phone\` 字段 |
| 加字段/加端点 | MINOR (v1.1→v1.2) | 加 \`avatar\` 字段 |
| 修 bug | PATCH (v1.0.1→v1.0.2) | 修复分页计算错误 |

**注意**：API 的"版本"通常指 MAJOR（v1/v2），MINOR/PATCH 在内部迭代，对外不一定暴露版本号。比如 Stripe 的 \`2024-06-20\` 版本内部有多次小更新，但对外是一个版本。

### 八、大厂版本管理实践

#### 8.1 Stripe：日期版本

Stripe 用**日期**作版本号：\`Stripe-API-Version: 2024-06-20\`。调用方首次请求时锁定一个版本，之后 Stripe 升级不影响该调用方，直到调用方主动升级。

\`\`\`http
GET /v1/charges
Stripe-API-Version: 2024-06-20
\`\`\`

**优点**：版本即时间，直观；调用方锁定后稳定。
**机制**：每个 API 变更生成一个"版本变更点"，调用方不升级就不受影响。

#### 8.2 GitHub：URL 路径 + 媒体类型

GitHub 用 URL 路径区分大版本（\`/v3/repos\`），用媒体类型区分小变更：

\`\`\`http
GET /repos
Accept: application/vnd.github+json
Accept: application/vnd.github.shadow-cat-preview+json  # 启用预览功能
\`\`\`

#### 8.3 Twitter：URL 路径

\`\`\`
GET /2/tweets    # v2
GET /1.1/tweets  # v1.1（已废弃）
\`\`\`

#### 8.4 共同特点

- **不轻易升大版本**：能用兼容性变更解决就不升 v2。
- **明确废弃流程**：给调用方至少 6-12 个月迁移期。
- **变更日志**：每个版本的变更详细记录，方便迁移。
- **沙箱测试**：新版本先在沙箱环境开放，调用方验证后再上线。

### 九、版本管理工具与文档同步

#### 9.1 文档版本化

API 文档必须跟随版本：

\`\`\`
/docs/v1/users.md
/docs/v2/users.md
/changelog.md  # 记录每个版本的变更
\`\`\`

OpenAPI 规范原生支持多版本（多个 swagger.json）。

#### 9.2 变更日志（Changelog）

\`\`\`markdown
# Changelog

## v2.0.0 (2026-06-01)
### Breaking
- 删除 \`phone\` 字段（隐私保护），用 \`contact\` 替代
- \`status\` 从 string 改为 int
### Added
- 新增 \`avatar\` 字段
- 新增 \`/v2/users/batch\` 批量查询接口

## v1.3.0 (2026-03-01)
### Added
- 新增 \`email\` 字段（向后兼容）
\`\`\`

#### 9.3 自动化同步

- API 改动触发文档自动生成（Swagger 注解 → swagger.json）。
- CI 检查：变更是否记录在 changelog。
- 兼容性检测：oasdiff 等工具对比新旧 OpenAPI，自动识别破坏性变更。

\`\`\`bash
# oasdiff：检测 API 破坏性变更
oasdiff breaking old.yaml new.yaml
# 输出：删除字段 phone（breaking）
\`\`\`

### 十、API 版本路由实现详解

#### 10.1 集中式版本路由

用一个路由器统一处理版本，再分发到对应 handler：

\`\`\`javascript
// Node.js：版本路由器
class VersionRouter {
    constructor() {
        this.routes = {}; // { 'GET:/users/:id': { v1: fn1, v2: fn2 } }
    }
    register(method, path, version, handler) {
        const key = method + ':' + path;
        if (!this.routes[key]) this.routes[key] = {};
        this.routes[key][version] = handler;
    }
    handle(method, path, version) {
        const key = method + ':' + path;
        const handlers = this.routes[key];
        if (!handlers) return null;
        // 优先精确匹配，回退到最新可用版本
        return handlers[version] || this.latestVersion(handlers);
    }
    latestVersion(handlers) {
        return Object.keys(handlers).sort().pop();
    }
}
\`\`\`

#### 10.2 版本协商

调用方没指定版本时怎么办？策略：

- **默认最新**：返回最新版本（激进，可能破坏老客户端）。
- **默认最老**：返回最老支持版本（保守，新功能用不上）。
- **配置锁定**：每个调用方在后台配置锁定版本，未指定走锁定版本。

Stripe 用第三种——每个 API Key 关联一个版本，未指定时用该 Key 的锁定版本。

#### 10.3 版本回退

\`\`\`
调用方请求 v3，但服务只支持到 v2
→ 返回 v2 响应 + Warning 头告知降级
\`\`\`

避免硬性 404，提升健壮性。

### 十一、版本共存的代码组织

#### 11.1 控制器分离

\`\`\`
src/
  controllers/
    v1/
      UserController.js
      OrderController.js
    v2/
      UserController.js
      OrderController.js
  services/        # 共享业务逻辑
    UserService.js
  converters/      # 版本转换
    UserConverter.js
\`\`\`

#### 11.2 服务层共享

v1/v2 Controller 共用 Service，只是返回格式不同：

\`\`\`javascript
// v1 Controller
app.get('/api/v1/users/:id', async (req, res) => {
    const user = await UserService.get(req.params.id); // 共享服务
    res.json(UserConverter.toV1(user)); // 转 v1 格式
});

// v2 Controller
app.get('/api/v2/users/:id', async (req, res) => {
    const user = await UserService.get(req.params.id); // 同一服务
    res.json(UserConverter.toV2(user)); // 转 v2 格式
});
\`\`\`

#### 11.3 数据库兼容

v1/v2 共用数据库，字段加新列不影响老版本（老版本忽略新列）：

\`\`\`sql
-- v1 用 id, name
-- v2 加了 avatar, email
ALTER TABLE users ADD COLUMN avatar VARCHAR(255);
ALTER TABLE users ADD COLUMN email VARCHAR(255);
-- v1 的 SELECT 不会查这些列，无影响
\`\`\`

但删除/重命名列要小心——会破坏老版本。要么保留老列（双写），要么等老版本完全下线再删。

### 十二、废弃流程详解

#### 12.1 废弃信号

\`\`\`http
HTTP/1.1 200 OK
Deprecation: true
Sunset: Sat, 31 Dec 2026 23:59:59 GMT
Link: </api/v2/users/{id}>; rel="successor-version"
Warning: 299 - "This API version is deprecated, migrate to v2"
\`\`\`

- \`Deprecation: true\`：标记废弃。
- \`Sunset\`：下线时间。
- \`Link: rel=successor-version\`：新版本位置。
- \`Warning: 299\`：人类可读提示。

#### 12.2 废弃阶段

| 阶段 | 时间 | v1 行为 |
| --- | --- | --- | 
| 上线 v2 | T+0 | v1 加 Deprecation 头，正常服务 |
| 通知期 | T+0 到 T+6月 | 邮件/控制台通知，监控 v1 用量 |
| 限流期 | T+6月 到 T+11月 | v1 配额逐步降低 |
| 下线期 | T+12月 | v1 返回 410 Gone，响应体告知迁移 |

#### 12.3 监控 v1 用量

\`\`\`python
# Python：监控每个版本的调用量
from prometheus_client import Counter
api_calls = Counter('api_calls_total', 'API 调用', ['version', 'endpoint'])

@app.route('/api/v1/users/<id>')
def get_user_v1(id):
    api_calls.labels(version='v1', endpoint='/users').inc()
    return get_user_v1_logic(id)
\`\`\`

Grafana 看板展示 v1/v2 用量趋势，决定下线时机。

### 十三、版本管理最佳实践

1. **默认 URL 路径版本**：最直观、最通用。
2. **只增不改**：能向后兼容就不升大版本。
3. **明确废弃流程**：给足迁移时间，配 Sunset 头。
4. **维护 Changelog**：每个版本变更清晰记录。
5. **共享服务层**：v1/v2 共用业务逻辑，避免重复。
6. **兼容性自动检测**：CI 集成 oasdiff。
7. **沙箱先行**：新版本先在测试环境开放。
8. **监控版本用量**：用数据决定下线时机。
9. **提供迁移工具**：降低调用方迁移成本。
10. **文档同步**：每个版本对应文档，不混。

### 十四、常见坑

#### 14.1 默认版本陷阱

\`\`\`
GET /api/users/123   # 没带版本，默认走哪个？
\`\`\`

如果默认走最新，v2 上线后老客户端突然拿到新格式，崩。**建议**：默认走最老稳定版本，或要求必须带版本。

#### 14.2 版本号在 Header 但缓存没配 Vary

\`\`\`
GET /api/users/123   # v1 和 v2 都走这个 URL
Accept: application/vnd.v2+json
\`\`\`

CDN 按 URL 缓存，v1 的响应被缓存，v2 请求拿到 v1 缓存。**解决**：响应头加 \`Vary: Accept\`，告诉缓存"不同 Accept 头要分别缓存"。

#### 14.3 半兼容

只改了一半——v2 加了新字段，但忘了改错误响应格式，导致 v2 成功响应是新格式，错误响应是老格式。调用方按新格式解析错误，崩。**解决**：版本变更要全面，包括错误响应。

#### 14.4 数据库列删除过早

v2 不再用 \`phone\` 字段，直接 \`ALTER TABLE DROP COLUMN phone\`。但 v1 还在用，查询报错。**解决**：v1 完全下线后再删列，或保留列做双写。

#### 14.5 枚举值扩展未通知

v1 status = [1,2]，v2 加了 3。调用方 switch-case 没 default，遇到 3 崩。**解决**：枚举扩展也算"潜在破坏"，要在 changelog 强调，建议调用方加 default 分支。

#### 14.6 版本号语义混乱

有的接口 v2，有的还是 v1，调用方不知道该用哪个。**解决**：全局限定版本，所有接口同步升版本，或明确每个接口的当前版本。

### 十五、多语言版本路由对照

#### 15.1 Java (Spring)

\`\`\`java
// 方式一：URL 路径
@RestController
@RequestMapping("/api/v{version}/users")
public class UserController {
    @GetMapping("/{id}")
    public Object get(@PathVariable String version, @PathVariable Long id) {
        return version.equals("v2") ? userService.getV2(id) : userService.getV1(id);
    }
}

// 方式二：Header（自定义注解 + 拦截器）
@GetMapping("/api/users/{id}")
public Object get(@RequestHeader("X-Api-Version") String version, @PathVariable Long id) {
    return version.equals("2") ? userService.getV2(id) : userService.getV1(id);
}
\`\`\`

#### 15.2 Go (Gin)

\`\`\`go
// URL 路径版本
r.GET("/api/v1/users/:id", getUserV1)
r.GET("/api/v2/users/:id", getUserV2)

// Header 版本
r.GET("/api/users/:id", func(c *gin.Context) {
    version := c.GetHeader("X-Api-Version")
    if version == "2" {
        getUserV2(c)
    } else {
        getUserV1(c)
    }
})
\`\`\`

#### 15.3 Python (FastAPI)

\`\`\`python
# FastAPI：APIRouter 分版本
from fastapi import APIRouter

v1_router = APIRouter(prefix="/api/v1")
v2_router = APIRouter(prefix="/api/v2")

@v1_router.get("/users/{id}")
def get_user_v1(id: int):
    return {"id": id, "name": "user"}

@v2_router.get("/users/{id}")
def get_user_v2(id: int):
    return {"id": id, "name": "user", "avatar": "/a.png"}

app.include_router(v1_router)
app.include_router(v2_router)
\`\`\`

#### 15.4 Node.js (Express)

\`\`\`javascript
// Express：路径前缀
const v1 = express.Router();
const v2 = express.Router();

v1.get('/users/:id', (req, res) => res.json({id: req.params.id, name: 'user'}));
v2.get('/users/:id', (req, res) => res.json({id: req.params.id, name: 'user', avatar: '/a.png'}));

app.use('/api/v1', v1);
app.use('/api/v2', v2);
\`\`\`

### 十六、版本管理的成本与权衡

维护多版本不是免费的，要权衡：

| 因素 | 多版本并行 | 强制升级 |
| --- | --- | --- |
| 调用方成本 | 低（慢慢迁） | 高（必须改） |
| 服务方成本 | 高（维护多版本） | 低（一份代码） |
| 创新速度 | 慢（被老版本拖累） | 快 |
| 适用 | 公开 API、大客户多 | 内部 API、调用方可控 |

**公开 API**（对外，调用方不可控）→ 多版本并行 + 废弃时间表。
**内部 API**（微服务间，调用方可控）→ 强制升级，统一节奏。

### 十七、版本与微服务

微服务架构下，每个服务有自己的 API 版本，版本独立演进。但服务间依赖会引入"版本兼容矩阵"问题：

\`\`\`
服务 A v2 依赖 服务 B v1
服务 A v3 依赖 服务 B v2
\`\`\`

管理方式：

- **契约测试（Pact）**：消费方定义期望，提供方验证满足。
- **版本协商**：服务发现时带上支持的版本，调用方选择。
- **网关适配**：网关层做版本转换，屏蔽后端版本差异。

### 十八、GraphQL 的版本管理

GraphQL 社区主张"不加版本"——通过字段废弃（\`@deprecated\`）和扩展实现演进：

\`\`\`graphql
type User {
    id: ID!
    name: String @deprecated(reason: "用 displayName 代替")
    displayName: String!
    avatar: String
}
\`\`\`

客户端查询时自动收到废弃提示，逐步迁移。这种"无版本演进"依赖 GraphQL 的强类型和字段可选性，适合内部 API。对外 API 仍建议版本化，因为废弃字段终究要删。

### 十九、API 版本管理完整流程

一个完整的版本发布流程：

\`\`\`
1. 评估变更：兼容 or 破坏？
   ├─ 兼容 → 直接在当前版本迭代（MINOR/PATCH）
   └─ 破坏 → 升大版本（MAJOR）
2. 设计新版本：确定 v2 的字段结构、行为
3. 实现 v2：Controller + Service + Converter
4. 测试：v1/v2 双跑对比，兼容性检测
5. 文档：更新 OpenAPI、Changelog
6. 沙箱发布：开放给少量客户验证
7. 正式发布：v1 标记 Deprecation，v2 上线
8. 监控：跟踪 v1/v2 用量
9. 迁移期：6-12 个月，通知 + 工具
10. 下线 v1：用量 < 1% 或到下线日，返回 410
\`\`\`

### 二十、版本管理工具集

| 工具 | 用途 |
| --- | --- |
| **oasdiff** | OpenAPI 破坏性变更检测 |
| **openapi-diff** | OpenAPI 版本 diff |
| **Swagger UI** | 多版本文档展示 |
| **Postman/Apifox** | 多版本接口管理 |
| **Pact** | 消费者驱动契约测试 |
| **Snowboard/Redoc** | API 文档渲染 |

### 二十一、生产案例

**案例 1：Stripe 的版本锁定**

某客户 2019 年接入 Stripe，锁定 \`2019-12-03\` 版本。5 年后 Stripe 已发布几十个新版本，但该客户的代码无需任何修改仍正常工作。直到客户主动升级版本，才享受新功能。这种"版本锁定 + 主动升级"模式极大降低了调用方的维护负担。

**案例 2：某创业公司强制升级翻车**

某内部微服务 API 升 v2，未给废弃期，直接下线 v1。结果另一个团队的服务依赖 v1，半夜报警全线挂。事后建立"内部 API 也需 2 周废弃期 + 兼容性检测"规范。

**案例 3：枚举扩展导致客户端崩**

某 API status 加了新枚举值 3，没通知客户端。客户端 iOS App 用 switch 处理 status，没 default 分支，遇到 3 直接崩溃闪退。紧急发版修复。教训：枚举扩展要视为潜在破坏，提前通知 + 客户端加 default。

**案例 4：Header 版本的缓存事故**

某 API 用 Header 版本，CDN 没配 \`Vary: Accept\`。v1 响应被缓存，v2 客户端拿到 v1 数据，字段缺失报错。修复：响应加 \`Vary: Accept\`，并清理 CDN 缓存。

### 二十二、面试高频问题

**Q1：API 版本管理的几种方式？各有什么优缺点？**

四种：URL 路径（直观、缓存友好、最常用）、Header（URL 干净但不直观、缓存需配 Vary）、Query（简单但易遗漏、缓存灾难）、媒体类型（最符合 HTTP 但复杂）。推荐 URL 路径。

**Q2：什么变更算"破坏性"？**

删字段、改类型、改语义、可选改必填、改默认行为、收紧校验、改错误码、新增枚举值（潜在）。判断原则：老调用方不知情还能正常工作吗？

**Q3：如何平滑从 v1 迁移到 v2？**

① v1/v2 并行；② 适配层让 v1 走 v2 逻辑；③ 加 Deprecation/Sunset 头；④ 监控 v1 用量；⑤ 给 6-12 月迁移期；⑥ 提供迁移工具；⑦ 用量归零或到期后返回 410。

**Q4：Stripe 为什么用日期版本？**

日期即版本，调用方锁定后不受后续变更影响，主动升级才享受新功能。降低调用方维护负担，同时 Stripe 能持续演进。

**Q5：GraphQL 为什么不需要版本？**

GraphQL 通过 \`@deprecated\` 字段废弃 + 字段可选性实现无版本演进。客户端只查询需要的字段，新增字段无影响，废弃字段有提示。但最终删字段仍需协调。

**Q6：内部 API 需要版本管理吗？**

需要，但可以更激进。内部调用方可控，废弃期可短（2 周-1 月），甚至强制同步升级。但仍要有兼容性检测和通知机制，避免"一个改动炸一片"。

### 二十三、最佳实践清单

- [ ] 采用 URL 路径版本（/api/v1/、/api/v2/）
- [ ] 默认向后兼容，能不升大版本就不升
- [ ] 破坏性变更走完整流程（并行→废弃→下线）
- [ ] 响应加 Deprecation/Sunset 头
- [ ] 维护详细 Changelog
- [ ] v1/v2 共享 Service 层，Controller 分离
- [ ] CI 集成兼容性检测（oasdiff）
- [ ] 监控各版本调用量
- [ ] 提供迁移工具和文档
- [ ] 枚举扩展视为潜在破坏，提前通知
- [ ] Header 版本必须配 Vary 头
- [ ] 数据库列删除等老版本完全下线

### 二十四、版本号命名规范

除 MAJOR.MINOR.PATCH 外，还有：

- **日期版本**（Stripe）：\`2024-06-20\`，直观但无语义。
- **语义版本**（SemVer）：\`2.1.3\`，有语义但需调用方理解。
- **代号版本**（Android）：\`KitKat/Lollipop\`，好记但无序。

API 推荐**语义版本**为主，可辅以日期标识发布时间。

### 二十五、版本与灰度发布

新版本上线配合灰度：

\`\`\`
1% 流量 → v2（监控错误率）
↓ 无异常
10% → v2
↓
50% → v2
↓
100% → v2，v1 标记废弃
\`\`\`

灰度方式：

- **按用户 ID 哈希**：用户尾号 0-9 分 10 档，逐步放量。
- **按租户**：先开放给小租户，再大租户。
- **按地域**：先某地区，再全网。

### 二十六、API 网关与版本管理

在微服务架构中，版本管理常由 API 网关统一处理，后端服务无需关心版本：

\`\`\`
客户端 → 网关(识别版本) → 路由到对应版本的服务
                          或同一服务 + 网关做转换
\`\`\`

#### 26.1 网关层版本路由

\`\`\`yaml
# Kong 网关版本路由
routes:
  - name: user-v1
    paths: ["/api/v1/users"]
    service: user-service-v1
  - name: user-v2
    paths: ["/api/v2/users"]
    service: user-service-v2
\`\`\`

#### 26.2 网关层版本转换

网关接收 v1 请求，转发给 v2 服务，再把 v2 响应转回 v1 格式：

\`\`\`lua
-- Kong 插件：v2 响应转 v1
local body = cjson.decode(response.body)
body.id = body.userId         -- v2 userId → v1 id
body.name = body.displayName  -- v2 displayName → v1 name
body.userId = nil
body.displayName = nil
response.body = cjson.encode(body)
\`\`\`

好处：后端只需维护 v2，老版本由网关适配。坏处：网关逻辑复杂，转换有性能开销。

### 二十七、SDK 与版本管理

为 API 提供 SDK 时，版本管理更复杂——SDK 版本要和 API 版本对应。

#### 27.1 SDK 版本策略

\`\`\`
SDK v1.0 → 调用 API v1
SDK v2.0 → 调用 API v2（不兼容 v1）
SDK v2.1 → 调用 API v2（加新功能，兼容 v2.0）
\`\`\`

SDK 版本号用 SemVer，但 MAJOR 对应 API 大版本。

#### 27.2 SDK 自动选版本

\`\`\`python
# Python SDK：根据初始化版本自动选 API
class Client:
    def __init__(self, api_key, version='v2'):
        self.version = version
        self.base_url = f'https://api.example.com/{version}'

    def get_user(self, id):
        return requests.get(f'{self.base_url}/users/{id}',
                           headers={'Authorization': f'Bearer {self.api_key}'})
\`\`\`

#### 27.3 SDK 兼容性承诺

SDK 升级 minor 版本必须向后兼容（调用方代码不需改）。major 升级可破坏，但要提供迁移指南和工具。

### 二十八、版本管理的反模式

#### 28.1 无版本

API 完全不加版本，改了就改了。调用方随时可能崩。**只在内部小工具、调用方完全可控时勉强可接受**。

#### 28.2 版本号混乱

有的接口 \`/v1\`，有的 \`/v2\`，有的 \`/v3\`，调用方不知道全局用哪个版本。**解决**：全局限定版本，所有接口同步升级。

#### 28.3 永不下线老版本

v1 标记废弃但永远不删，维护成本无限增长。**解决**：明确下线日，到期强制 410。

#### 28.4 隐式版本切换

v1 接口偷偷改了行为（没升版本号），调用方莫名奇妙崩。**解决**：v1 的行为锁定，任何变更要么兼容要么升 v2。

#### 28.5 版本号当功能开关

用版本号控制功能（v1 无搜索，v2 有搜索），而不是用功能开关。导致为了用搜索必须升 v2，连带承受所有 v2 的破坏性变更。**解决**：版本管兼容性，功能开关管功能。

### 二十九、版本管理的测试策略

#### 29.1 兼容性测试

\`\`\`javascript
// 测试 v1 响应仍包含老字段
describe('v1 兼容性', () => {
    it('应返回 id 和 name 字段', async () => {
        const res = await fetch('/api/v1/users/1');
        const user = await res.json();
        assert(user.id !== undefined);
        assert(user.name !== undefined);
    });
});
\`\`\`

#### 29.2 双跑对比

同时调 v1 和 v2，对比响应，发现非预期差异：

\`\`\`python
# Python：双跑对比
def compare_versions(path, id):
    v1 = requests.get(f'/api/v1/{path}/{id}').json()
    v2 = requests.get(f'/api/v2/{path}/{id}').json()
    # 期望 v2 是 v1 的超集（向后兼容）
    for k in v1:
        assert k in v2 or has_equivalent(k, v2), f'v2 缺少 {k}'
\`\`\`

#### 29.3 契约测试（Pact）

消费者定义"我期望 v1 返回 {id, name}"，提供者每次发版验证契约不被破坏：

\`\`\`ruby
# Pact：消费者定义契约
 Pact.service_consumer('Mobile App') do |consumer|
  consumer.has_pact_with('User API') do |provider|
    provider.mock_service(:user_service) do |mock|
      mock
        .given('user 1 exists')
        .upon_receiving('a request for user 1')
        .with(method: :get, path: '/api/v1/users/1')
        .will_respond_with(
          status: 200,
          body: { id: 1, name: '张三' }
        )
    end
  end
end
\`\`\`

### 三十、详细迁移案例：v1 → v2 完整流程

以"用户 API"为例，演示完整迁移：

**v1 现状**：

\`\`\`
GET /api/v1/users/{id}
响应: { id, name, phone }  // phone 明文
\`\`\`

**v2 目标**：

\`\`\`
GET /api/v2/users/{id}
响应: { userId, displayName, avatar, email, phoneMasked }  // 字段重命名，phone 脱敏
\`\`\`

**迁移步骤**：

\`\`\`
Day 1:    实现 v2，部署，但不对外宣传
Day 7:    沙箱开放 v2，通知 TOP10 客户试用
Day 30:   v2 正式上线，v1 加 Deprecation 头
Day 30-180: 监控 v1/v2 用量，邮件提醒未迁移客户
Day 180:  v1 配额减半（限流）
Day 270:  v1 配额减到 1/10
Day 365:  v1 返回 410 Gone，下线
\`\`\`

**适配层实现**：

\`\`\`javascript
// v1 内部走 v2 逻辑
app.get('/api/v1/users/:id', async (req, res) => {
    const v2 = await userService.getV2(req.params.id);
    res.set('Deprecation', 'true');
    res.set('Sunset', 'Sat, 31 Dec 2026 23:59:59 GMT');
    res.set('Link', '</api/v2/users/' + req.params.id + '>; rel="successor-version"');
    // 适配 v2 → v1
    res.json({
        id: v2.userId,
        name: v2.displayName,
        phone: v2.phoneMasked, // v1 也脱敏（安全要求）
    });
});
\`\`\`

**数据库**：

\`\`\`sql
-- v2 加新列（不影响 v1）
ALTER TABLE users ADD COLUMN avatar VARCHAR(255);
ALTER TABLE users ADD COLUMN email VARCHAR(255);
-- phone 列保留，v1 完全下线后再考虑脱敏/删除
\`\`\`

### 三十一、版本管理与文档自动同步

API 改了但文档没更新，是常见灾难。自动化方案：

#### 31.1 代码注解生成文档

\`\`\`java
// Java：springdoc 自动生成 OpenAPI
@Operation(summary = "获取用户", description = "v2 版本，返回脱敏手机号")
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "成功"),
    @ApiResponse(responseCode = "404", description = "用户不存在")
})
@GetMapping("/api/v2/users/{id}")
public UserV2 getUser(@PathVariable Long id) { ... }
\`\`\`

启动时自动生成 \`/v3/api-docs\`，Swagger UI 渲染。

#### 31.2 CI 检查文档同步

\`\`\`yaml
# GitHub Actions：检查 OpenAPI 是否更新
- name: Check OpenAPI sync
  run: |
    npm run generate-openapi
    git diff --exit-code openapi.json || echo "OpenAPI 未更新！"
\`\`\`

#### 31.3 变更日志自动生成

从 git commit 或 OpenAPI diff 自动生成 changelog：

\`\`\`bash
oasdiff changelog old.json new.json > changelog.md
\`\`\`

### 三十二、版本管理的监控指标

\`\`\`
api_requests_total{version="v1", endpoint="/users"} 12345
api_requests_total{version="v2", endpoint="/users"} 98765
api_deprecation_warnings_total{version="v1"} 12345  # 触发 Deprecation 头的次数
\`\`\`

Grafana 面板：

- 各版本 QPS 趋势（堆叠图）。
- v1 用量下降率（应单调下降）。
- Top 调用方（哪些客户还在用 v1）。
- 预计 v1 清零日期（线性外推）。

### 三十三、版本管理的组织流程

技术方案要有组织流程保障：

1. **变更评审**：API 改动需评审，识别破坏性。
2. **公告机制**：破坏性变更提前 1 个月公告所有调用方。
3. **迁移支持**：设立迁移文档、答疑群、专人支持大客户。
4. **下线审批**：v1 下线需 SRE + 业务双确认，避免遗漏。
5. **复盘**：每次大版本迁移后复盘，改进流程。

### 三十四、版本管理决策树

面对一个 API 变更，如何决策？用决策树：

\`\`\`
变更来了
  │
  ├─ 是新增字段/端点/可选参数吗？
  │    └─ 是 → 向后兼容，直接在当前版本迭代（MINOR）→ 完成
  │
  ├─ 是修 bug 吗？
  │    └─ 是 → 当前版本 PATCH → 完成
  │
  └─ 是删除/改类型/改语义/改默认/收紧校验/加枚举吗？
       └─ 是 → 破坏性变更
            │
            ├─ 调用方可控吗（内部服务）？
            │    └─ 是 → 协调同步升级，短废弃期（2 周）→ 完成
            │
            └─ 调用方不可控（对外 API）？
                 └─ 升大版本 v(n+1)
                      │
                      ├─ 实现适配层（v1 走 v2 逻辑）
                      ├─ 加 Deprecation/Sunset 头
                      ├─ 6-12 月迁移期
                      ├─ 监控 v1 用量
                      └─ 到期下线 v1 → 完成
\`\`\`

### 三十五、版本与契约的灵魂

API 版本管理的本质是**契约管理**。API 一旦发布，就是服务方与调用方之间的契约。契约不是"我想改就改"，而是"双方共识下的演进"。

好的版本管理体现三个品质：

1. **敬畏**：每个改动都假设有调用方在依赖，谨慎评估影响。
2. **秩序**：用版本号、废弃流程、变更日志建立可预期的演进节奏。
3. **同理心**：提供迁移工具、文档、时间，降低调用方成本。

> "API 设计是给未来的自己写信，版本管理是让这封信 10 年后还能读懂。"

### 三十六、版本管理常见问答（补充）

**Q：小团队、内部项目也需要严格的版本管理吗？**

不需要那么严格，但要有意识。内部项目可以用"分支即版本"（master 是最新，release-v1 是老版本），废弃期短（1-2 周）。关键是建立"改接口要通知、要给迁移时间"的习惯，而非具体形式。

**Q：API 版本号和代码版本号（git tag）什么关系？**

API 版本号是"对外契约的版本"，代码版本号是"代码发布的版本"。一次代码发布可能不涉及 API 变更（纯 bug 修复），API 版本号不变。API 大版本变更通常伴随代码大版本发布。

**Q：能不能用功能开关代替版本管理？**

部分场景可以。功能开关控制"新功能是否启用"，对调用方透明（同一版本）。但功能开关不能解决"破坏性变更"——删字段、改类型没法用开关兜底。所以功能开关管"加功能"，版本管理管"破坏性变更"，互补不互斥。

**Q：RESTful API 必须版本化吗？GraphQL 呢？**

RESTful 强烈建议版本化（URL 路径最简单）。GraphQL 通过 \`@deprecated\` 字段废弃实现"无版本演进"，但终究要删字段，那时仍需协调。所以无论哪种风格，"演进 + 兼容"问题都存在，只是解法不同。

**Q：版本号用数字还是日期？**

数字（v1/v2）有语义（大版本递增），日期（2024-06-20）直观但无语义。对外 API 推荐数字 + 日期结合（如 v2，发布于 2024-06-20）。Stripe 用纯日期是因为它的"版本锁定"机制特殊。

### 三十七、版本管理速记口诀

- **加字段不算破，删字段必升版。**
- **类型不能改，语义不能变。**
- **默认值锁定，校验莫收紧。**
- **枚举加值慎，客户端防 default。**
- **URL 路径最实用，Header 要配 Vary。**
- **废弃给期限，下线看数据。**
- **文档同步走，Changelog 不能漏。**

### 三十八、版本演进模式深度对比

业界有几种"演进模式"，各有适用场景：

#### 38.1 扩展模式（Expand-Contract）

最推荐的模式。分两步：

1. **Expand（扩展）**：新版本上线，同时支持新老格式（向后兼容）。老调用方继续用老格式，新调用方用新格式。
2. **Contract（收缩）**：老调用方全部迁移后，删除老格式代码。

\`\`\`
v1 只返回 {id, name}
   ↓ Expand
v1 返回 {id, name}，v2 返回 {id, name, avatar}（并行）
   ↓ 迁移完成
v2 只返回 {id, name, avatar}（删 v1）
\`\`\`

优点：零停机、可回滚。缺点：中间有"双格式"维护期。

#### 38.2 平行模式（Parallel Run）

v1/v2 完全独立实现，不共享代码。各版本独立演进。

适用：v2 是完全重写（如换技术栈、换架构），与 v1 无法共享逻辑。

#### 38.3 兼容模式（Compatible Forever）

永远只增不减，永不升大版本。靠"字段废弃 + 新字段"渐进。

适用：调用方极多且不可控（如操作系统 API）。缺点：API 越来越臃肿。

#### 38.4 强制升级模式（Force Upgrade）

新版本上线即下线老版本，调用方必须同步改。

适用：内部微服务、调用方就一个团队。缺点：耦合高，一个改动牵连多团队。

#### 38.5 四种模式对比

| 模式 | 调用方成本 | 服务方成本 | 灵活性 | 适用 |
| --- | --- | --- | --- | --- |
| Expand-Contract | 低 | 中 | 高 | 通用推荐 |
| Parallel Run | 低 | 高 | 高 | 完全重写 |
| Compatible Forever | 极低 | 高（臃肿） | 低 | OS 级 API |
| Force Upgrade | 高 | 低 | 中 | 内部服务 |

### 三十九、版本与向后兼容的字段策略详解

#### 39.1 字段命名演进

v1: \`userName\` → v2 想叫 \`name\`。怎么办？

**方案 A：双字段过渡**

\`\`\`json
// v2 同时返回 userName(废弃) 和 name
{ "userName": "张三", "name": "张三" }
\`\`\`

调用方慢慢从 \`userName\` 迁移到 \`name\`，迁移完删 \`userName\`。

**方案 B：版本隔离**

v1 返回 \`userName\`，v2 返回 \`name\`，互不影响。

#### 39.2 字段类型演进

v1: \`age: "18"\`（字符串）→ v2 想用 \`age: 18\`（数字）。

不能直接改（破坏）。方案：

\`\`\`json
// v2 加新字段 ageNum，老 age 保留为字符串
{ "age": "18", "ageNum": 18 }
\`\`\`

调用方迁移到 \`ageNum\`，迁移完删 \`age\`。

#### 39.3 字段语义演进

v1: \`status: 1\` 表示"已付款"。v2 想把 1 改成"已发货"。

这是最危险的——同名同类型但语义变。方案：

- **加新枚举**：v2 用新枚举值（4=已付款新，5=已发货），老值 1 保留旧含义。
- **升版本**：v2 的 status 重新定义，v1 锁定旧含义。

### 四十、版本管理的工程化工具链

完整的版本管理工作流：

\`\`\`
设计阶段:
  ├─ OpenAPI 编辑器（Stoplight/Apifox）设计 v2 schema
  └─ oasdiff 对比 v1/v2，识别破坏性变更

开发阶段:
  ├─ 代码注解生成 OpenAPI（springdoc/swag/swagger-jsdoc）
  ├─ v1 适配层实现
  └─ 单元测试 + 兼容性测试

CI 阶段:
  ├─ 生成 OpenAPI JSON
  ├─ oasdiff 检查破坏性变更（阻断 PR）
  ├─ Pact 契约测试
  └─ 文档同步检查

发布阶段:
  ├─ 灰度发布 v2
  ├─ v1 加 Deprecation 头
  ├─ Changelog 自动生成
  └─ 通知调用方

监控阶段:
  ├─ Prometheus 各版本 QPS
  ├─ Grafana 大盘
  └─ v1 用量预警

下线阶段:
  ├─ v1 限流递减
  ├─ 最终 410
  └─ 删除 v1 代码 + 数据库列
\`\`\`

### 四十一、版本管理的数据迁移

API 版本变更常伴随数据迁移。例如 v2 把 \`phone\` 从明文改脱敏：

\`\`\`sql
-- 1. 加新列 phone_masked
ALTER TABLE users ADD COLUMN phone_masked VARCHAR(20);

-- 2. 后台脚本批量填充（双写期）
UPDATE users SET phone_masked = mask(phone) WHERE phone_masked IS NULL;

-- 3. v2 读写 phone_masked，v1 继续用 phone
-- 4. v1 下线后，删除 phone 列（或保留作审计）
\`\`\`

数据迁移要点：

- **双写期**：新老字段并存，写入时同时写两份。
- **回填**：后台脚本把老数据补到新字段。
- **切换**：读取切到新字段。
- **清理**：确认无问题后删老字段。

### 四十二、版本管理的沟通模板

破坏性变更通知调用方的模板：

\`\`\`markdown
## [重要] XXX API v2 上线通知

**变更内容**：
- /api/v2/users 响应字段调整：
  - \`id\` 改名为 \`userId\`
  - \`name\` 改名为 \`displayName\`
  - 新增 \`avatar\`、\`email\` 字段
  - \`phone\` 字段脱敏

**影响**：v1 将于 **2026-12-31** 下线，请在此之前迁移到 v2。

**迁移指南**：https://docs.example.com/migration/v1-to-v2

**SDK 升级**：v2 对应 SDK v2.0，已发布到 npm/maven/pypi。

**支持**：迁移问题请加群 XXX 或联系 api-support@example.com。

**沙箱**：可在 sandbox-api.example.com 提前测试 v2。
\`\`\`

清晰的沟通能大幅降低迁移阻力。

### 四十三、版本管理与 API 治理

版本管理是 API 治理的一部分。完整的 API 治理包括：

- **设计规范**：命名、分页、错误码统一标准。
- **版本管理**：本章内容。
- **文档管理**：OpenAPI、Changelog。
- **兼容性**：契约测试、自动检测。
- **生命周期**：设计→发布→废弃→下线。
- **目录**：API 注册中心，所有 API 可发现。
- **安全**：认证、授权、限流。

版本管理贯穿 API 全生命周期，是治理的骨架。

### 四十四、版本管理进阶话题

#### 44.1 版本与 API 风格的关系

不同 API 风格对版本管理的诉求不同：

- **REST**：依赖 URL/Header 版本，关注资源结构演进
- **GraphQL**：通过 schema 演进和 \`@deprecated\` 指令管理版本，无需 URL 版本
- **gRPC**：基于 Protobuf 字段编号的向后兼容设计，强调"永不删除字段"
- **WebSocket**：通过握手协议版本号 + 消息格式版本号双重管理

#### 44.2 版本与数据 schema 的协调

API 版本变化通常伴随数据 schema 变化：

\`\`\`
API v1: user { id, name, email }
API v2: user { id, name, email, phone, avatar }

数据库 schema：兼容性设计
- v1 字段保留
- v2 新增字段可空
- 字段重命名通过 view 适配
\`\`\`

**协调原则**：
- API 版本与 DB schema 解耦（通过适配层转换）
- DB schema 向前兼容（不删字段，只加字段）
- 老版本 API 读新 schema 时，忽略多出的字段

#### 44.3 版本与缓存的协调

不同版本的 API 响应可能不同，缓存 key 要包含版本：

\`\`\`
cache_key = "user:123:v2"
\`\`\`

如果版本升级后缓存 key 不变，会导致老客户端读到新版本数据，引发兼容性问题。

#### 44.4 版本与消息队列的协调

异步消息也需要版本管理：

\`\`\`
Topic: user-events
  消息格式 v1: { userId, action, timestamp }
  消息格式 v2: { userId, action, timestamp, metadata }
\`\`\`

**策略**：
- 消息体包含 \`schemaVersion\` 字段
- 消费者根据版本做兼容性处理
- 老消费者忽略新字段，新消费者处理老消息

#### 44.5 版本与 SDK 的协调

服务端 API 升级时，客户端 SDK 也要同步升级：

- SDK 版本号与 API 版本独立（SDK v3.2 可以调 API v1 和 v2）
- SDK 自动选择最高可用 API 版本
- 老版本 API 下线前，SDK 强制升级提示

#### 44.6 版本管理的成熟度模型

- **Level 0 混乱**：无版本控制，直接改 API
- **Level 1 入门**：URL 加版本号，但不强制
- **Level 2 规范**：所有 API 必须有版本，有废弃流程
- **Level 3 自动化**：版本管理工具化，变更检测自动化
- **Level 4 治理**：版本与组织流程结合，全生命周期管理

### 总结

API 版本管理的核心是"在演进中保持秩序"：

- **策略**：URL 路径版本最实用。
- **兼容**：默认向后兼容，只增不改。
- **破坏**：识别破坏性变更，升大版本走完整流程。
- **迁移**：v1/v2 并行 + 适配层 + 废弃时间表 + 迁移工具。
- **大厂**：Stripe 日期锁定、GitHub 路径+媒体类型。

记住：**API 是契约，变更要克制；不兼容要升级，升级要给路**。下一章我们将讨论 API 文档与 OpenAPI 规范，看看如何用标准化的方式描述和管理 API 契约。

---

**延伸阅读**：

- Semantic Versioning：https://semver.org
- Stripe API Versioning：https://stripe.com/docs/api/versioning
- GitHub API Versioning：https://docs.github.com/rest/overview/api-versions
- RFC 8594 Sunset Header：https://datatracker.ietf.org/doc/rfc8594
- 《API Design Patterns》—— JJ Geewax

**面试高频问题汇总**：

- API 版本管理几种方式？优缺点？
- 什么是向后兼容？什么是破坏性变更？
- 如何从 v1 平滑迁移到 v2？
- Stripe 的版本管理有什么特点？
- 枚举值新增算破坏性变更吗？
- GraphQL 为什么不需要版本？
- 内部 API 需要版本管理吗？
- Deprecation 和 Sunset 头的作用？
- Header 版本为什么要配 Vary？
- SemVer 三段分别代表什么？

**实践建议**：

1. 新项目一开始就用 URL 路径版本（/api/v1/）。
2. 建立变更评审机制，破坏性变更必须走版本流程。
3. 维护 Changelog，每次发版必更新。
4. CI 集成兼容性检测，防止"不小心"破坏。
5. 监控版本用量，用数据驱动下线决策。
`,
    code: `// ============================================================
// API 版本管理 —— 可运行示例
// 实现 VersionRouter + 版本间数据适配 + 废弃告警 + 下线流程模拟
// ============================================================

// ---------- 1. 版本路由器 ----------
class VersionRouter {
  constructor() {
    this.routes = {}; // { 'GET:/users/:id': { v1: handler, v2: handler } }
    this.deprecated = {}; // { 'v1': { sunset: '2026-12-31', successor: 'v2' } }
  }
  // 注册路由
  register(method, path, version, handler) {
    const key = method + ':' + path;
    if (!this.routes[key]) this.routes[key] = {};
    this.routes[key][version] = handler;
  }
  // 标记版本废弃
  deprecate(version, sunset, successor) {
    this.deprecated[version] = { sunset, successor };
  }
  // 处理请求
  handle(method, path, version) {
    const key = method + ':' + path;
    const handlers = this.routes[key];
    if (!handlers) return { status: 404, body: { error: 'Not Found' }, headers: {} };
    let handler = handlers[version];
    let usedVersion = version;
    let warned = false;
    if (!handler) {
      // 版本不存在，回退到最新可用版本
      usedVersion = Object.keys(handlers).sort().pop();
      handler = handlers[usedVersion];
      warned = true;
    }
    const result = handler();
    const headers = {};
    // 若使用的版本已废弃，加告警头
    if (this.deprecated[usedVersion]) {
      const dep = this.deprecated[usedVersion];
      headers['Deprecation'] = 'true';
      headers['Sunset'] = dep.sunset;
      headers['Link'] = '</api/' + dep.successor + path + '>; rel="successor-version"';
      headers['Warning'] = '299 - "版本 ' + usedVersion + ' 已废弃，请在 ' + dep.sunset + ' 前迁移到 ' + dep.successor + '"';
    }
    if (warned) {
      headers['X-Version-Fallback'] = version + ' → ' + usedVersion;
    }
    return { status: 200, body: result, headers, usedVersion };
  }
}

// ---------- 2. 模拟业务数据（共享） ----------
const userData = { id: 123, name: '张三', displayName: '张三', avatar: '/zhang.png', email: 'z@x.com', phone: '138****8888' };

// ---------- 3. 版本适配转换器 ----------
const UserConverter = {
  toV1(u) {
    // v1：id, name（无 avatar/email，phone 不脱敏）
    return { id: u.id, name: u.name, phone: u.phone };
  },
  toV2(u) {
    // v2：id 改名 userId，name 改名 displayName，新增 avatar/email，phone 脱敏
    return {
      userId: u.id,
      displayName: u.displayName,
      avatar: u.avatar,
      email: u.email,
      phone: u.phone, // v2 脱敏
    };
  },
};

// ---------- 4. 注册路由 ----------
const router = new VersionRouter();
router.register('GET', '/users/:id', 'v1', () => UserConverter.toV1(userData));
router.register('GET', '/users/:id', 'v2', () => UserConverter.toV2(userData));
router.deprecate('v1', '2026-12-31', 'v2'); // v1 标记废弃

// ---------- 5. 模拟请求 ----------
function simulate(method, path, version) {
  console.log('\\n请求: ' + method + ' ' + path + '  (version=' + version + ')');
  const res = router.handle(method, path, version);
  console.log('  状态: ' + res.status + '  使用版本: ' + res.usedVersion);
  for (const [k, v] of Object.entries(res.headers)) {
    console.log('  ' + k + ': ' + v);
  }
  console.log('  响应体: ' + JSON.stringify(res.body));
  return res;
}

// ============================================================
// 演示 1：v1 与 v2 返回不同结构
// ============================================================
console.log('===== 演示 1：v1 与 v2 返回不同结构 =====');
simulate('GET', '/users/:id', 'v1');
simulate('GET', '/users/:id', 'v2');

// ============================================================
// 演示 2：废弃版本告警
// ============================================================
console.log('\\n===== 演示 2：v1 已废弃，响应带 Deprecation 头 =====');
simulate('GET', '/users/:id', 'v1');

// ============================================================
// 演示 3：版本回退（请求不存在的 v3，回退到最新 v2）
// ============================================================
console.log('\\n===== 演示 3：请求不存在的 v3，回退到最新 v2 =====');
simulate('GET', '/users/:id', 'v3');

// ============================================================
// 演示 4：版本下线流程模拟
// ============================================================
console.log('\\n===== 演示 4：版本下线流程模拟 =====');
const timeline = [
  { stage: '阶段1 v2上线', date: '2026-01-01', v1Status: '正常服务+Deprecation头', v2Status: '上线' },
  { stage: '阶段2 通知期', date: '2026-06-01', v1Status: '邮件通知大客户', v2Status: '稳定' },
  { stage: '阶段3 限流期', date: '2026-09-01', v1Status: 'QPS 配额减半', v2Status: '稳定' },
  { stage: '阶段4 下线', date: '2026-12-01', v1Status: '返回 410 Gone', v2Status: '稳定' },
];
for (const t of timeline) {
  console.log('  ' + t.stage + ' (' + t.date + ')');
  console.log('    v1: ' + t.v1Status);
  console.log('    v2: ' + t.v2Status);
}

// ============================================================
// 演示 5：兼容性变更 vs 破坏性变更识别
// ============================================================
console.log('\\n===== 演示 5：变更类型识别 =====');
const changes = [
  { desc: '新增 avatar 字段', breaking: false },
  { desc: '删除 phone 字段', breaking: true },
  { desc: 'id 类型 string→int', breaking: true },
  { desc: 'status 加枚举值 3', breaking: true, note: '潜在破坏，客户端可能没 default' },
  { desc: '新增可选参数 page', breaking: false },
  { desc: '可选参数改必填', breaking: true },
  { desc: '默认排序改了', breaking: true, note: '隐蔽破坏' },
  { desc: '新增端点 /v2/search', breaking: false },
];
for (const c of changes) {
  const tag = c.breaking ? '❌ 破坏性' : '✅ 兼容';
  console.log('  ' + tag + ' | ' + c.desc + (c.note ? ' (' + c.note + ')' : ''));
}

console.log('\\n===== 演示结束 =====');
`,
  },
  // =========================================================
  // 第三章：API 文档与 OpenAPI
  // =========================================================
  {
    id: "backend-api-doc",
    group: "API 设计与架构",
    icon: "📚",
    title: "API 文档与 OpenAPI",
    content: `## API 文档与 OpenAPI

**API 文档** 是 API 的"说明书"，告诉调用方"这个接口做什么、怎么调用、返回什么"。**OpenAPI**（前身 Swagger）是描述 RESTful API 的行业标准规范，让 API 文档可机器读取、可自动生成、可交互测试。

如果说 API 是服务方与调用方之间的契约，那么 API 文档就是这份契约的书面形式。没有文档的 API 就像没有说明书的机器——别人不知道怎么用，你也说不清它到底该怎样。OpenAPI 则让这份契约从"自然语言"升级为"机器可读的结构化语言"，开启了自动化文档、Mock、测试、SDK 生成等一整套工具链。

### 一、API 文档的重要性

API 文档不是"写完代码顺手补一下"的附属品，而是 API 设计的核心交付物。它的重要性体现在四个方面：

#### 1.1 协作基础

后端、前端、移动端、第三方集成商都依赖 API 文档协作：

- **前端**：根据文档写接口调用，不等后端写完就能用 Mock 开发。
- **移动端**：根据文档定义数据模型，生成网络层代码。
- **第三方**：完全靠文档理解 API，没有文档等于没有 API。
- **测试**：根据文档生成测试用例。

文档质量直接决定协作效率。文档不全，前端就得反复问后端；文档过时，集成商就会踩坑。

#### 1.2 测试与集成

好的文档是可执行的——能直接发起请求测试：

- Postman/Apifox 导入 OpenAPI，一键生成请求集合。
- Swagger UI 内置"Try it out"，浏览器里直接调 API。
- CI 流水线用文档自动跑冒烟测试。

#### 1.3 SDK 自动生成

OpenAPI 文档是机器可读的，可以自动生成各语言 SDK：

\`\`\`bash
# 用 openapi-generator 生成多语言 SDK
openapi-generator generate -i openapi.yaml -g java -o sdk-java
openapi-generator generate -i openapi.yaml -g python -o sdk-python
openapi-generator generate -i openapi.yaml -g typescript-fetch -o sdk-ts
\`\`\`

一次定义文档，多语言 SDK 自动产出，省去手写 SDK 的巨大工作量。

#### 1.4 API 治理

文档是 API 治理的基础：

- **API 目录**：所有 API 注册到目录，可搜索、可发现。
- **变更管控**：文档变更走评审，破坏性变更预警。
- **统计分析**：哪些 API 用得多、哪些没人用，指导优化。
- **安全审计**：文档列出认证方式、权限要求，便于审计。

### 二、API 文档的要素

一份合格的 API 文档应包含：

#### 2.1 端点（Endpoint）

接口的 URL 和 HTTP 方法：

\`\`\`
POST /api/v1/users
GET  /api/v1/users/{id}
\`\`\`

#### 2.2 请求

- **路径参数**：\`{id}\` 占位符。
- **查询参数**：\`?page=1&size=20\`，含类型、是否必填、默认值。
- **请求头**：\`Authorization\`、\`Content-Type\` 等。
- **请求体**：JSON Schema 描述字段、类型、约束。

#### 2.3 响应

- **状态码**：200/201/400/404/500 等，每个码的含义。
- **响应体**：JSON Schema 描述。
- **响应头**：\`Location\`、\`X-RateLimit-*\` 等。
- **示例**：真实响应样例，调用方直接参考。

#### 2.4 错误码

业务错误码列表：

| code | message | 说明 |
| --- | --- | --- |
| 10001 | 用户不存在 | userId 无效 |
| 10002 | 邮箱已注册 | email 重复 |
| 10003 | 密码强度不足 | 至少 8 位含数字字母 |

#### 2.5 认证

- 认证方式：Bearer Token、API Key、OAuth2。
- 如何获取 token。
- token 有效期、刷新机制。

#### 2.6 其他

- 限流策略（QPS 上限、429 响应）。
- 分页约定（page/size 还是 cursor）。
- 时间格式（ISO 8601）。
- 版本信息。

### 三、OpenAPI 规范详解

**OpenAPI Specification（OAS）** 是 Linux 基金会下的开放标准，定义了一套用 JSON/YAML 描述 RESTful API 的规范。前身是 Swagger 规范，2015 年捐赠给 Linux 基金会后改名 OpenAPI，目前主流版本是 3.0 和 3.1。

#### 3.1 OpenAPI 文档结构

一个 OpenAPI 文档的顶层结构：

\`\`\`yaml
openapi: 3.0.3          # 规范版本
info:                    # API 元信息
  title: 用户服务 API
  version: 1.0.0
  description: 管理用户的增删改查
  contact:
    email: api@example.com
  license:
    name: MIT
servers:                 # 服务器地址
  - url: https://api.example.com/v1
    description: 生产环境
  - url: https://sandbox-api.example.com/v1
    description: 沙箱环境
paths:                   # 接口定义（核心）
  /users:
    get: ...
    post: ...
  /users/{id}:
    get: ...
components:              # 可复用组件
  schemas: ...
  responses: ...
  securitySchemes: ...
security:                # 全局认证
  - BearerAuth: []
tags:                    # 标签分组
  - name: 用户
    description: 用户相关接口
\`\`\`

#### 3.2 info：API 元信息

\`\`\`yaml
info:
  title: 电商订单 API        # 必填，API 名称
  description: |
    提供订单的创建、查询、取消功能。
    支持分页、过滤、排序。
  version: 2.1.0             # 必填，API 版本
  termsOfService: https://example.com/terms
  contact:
    name: API 支持
    email: api-support@example.com
    url: https://example.com/support
  license:
    name: Apache 2.0
    url: https://www.apache.org/licenses/LICENSE-2.0
\`\`\`

#### 3.3 servers：服务器地址

\`\`\`yaml
servers:
  - url: https://api.example.com/{basePath}
    description: 生产环境
    variables:
      basePath:
        default: v1
        enum: [v1, v2]
  - url: https://staging.example.com/v1
    description: 预发环境
\`\`\`

支持变量模板，方便多环境切换。

#### 3.4 paths：接口定义（核心）

每个路径下定义 HTTP 方法（get/post/put/delete/patch）：

\`\`\`yaml
paths:
  /users/{id}:
    get:
      tags: [用户]
      summary: 获取用户详情
      description: 根据 ID 查询用户完整信息
      operationId: getUserById     # 唯一标识，SDK 生成用
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
          description: 用户 ID
          example: 123
        - name: fields
          in: query
          required: false
          schema:
            type: string
          description: 返回字段，逗号分隔
          example: "name,email"
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
              examples:
                success:
                  value:
                    id: 123
                    name: 张三
                    email: z@x.com
        '404':
          description: 用户不存在
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          $ref: '#/components/responses/Unauthorized'
      security:
        - BearerAuth: []
\`\`\`

**参数位置（in）** 有四种：

| in | 位置 | 例子 |
| --- | --- | --- |
| path | 路径参数 | /users/\`{id}\` |
| query | 查询参数 | ?page=1 |
| header | 请求头 | X-Api-Key |
| cookie | Cookie | session=xxx |

#### 3.5 请求体（RequestBody）

POST/PUT 通常有请求体：

\`\`\`yaml
requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        required: [name, email]
        properties:
          name:
            type: string
            minLength: 1
            maxLength: 50
            description: 用户名
          email:
            type: string
            format: email
            description: 邮箱
          age:
            type: integer
            minimum: 0
            maximum: 150
            description: 年龄
      examples:
        full:
          value:
            name: 张三
            email: z@x.com
            age: 25
\`\`\`

#### 3.6 响应（Responses）

每个状态码一个响应定义：

\`\`\`yaml
responses:
  '200':
    description: 成功
    headers:
      X-RateLimit-Limit:
        schema: { type: integer }
      X-RateLimit-Remaining:
        schema: { type: integer }
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/User'
  '400':
    description: 参数错误
  '404':
    description: 不存在
  '500':
    description: 服务器错误
\`\`\`

#### 3.7 components：可复用组件

把重复的定义抽出来复用：

\`\`\`yaml
components:
  schemas:
    User:
      type: object
      required: [id, name]
      properties:
        id:
          type: integer
          format: int64
        name:
          type: string
        email:
          type: string
          format: email
        createdAt:
          type: string
          format: date-time
    Error:
      type: object
      required: [code, message]
      properties:
        code:
          type: integer
        message:
          type: string
        traceId:
          type: string
  responses:
    Unauthorized:
      description: 未认证
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    NotFound:
      description: 资源不存在
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-Api-Key
  parameters:
    PageParam:
      name: page
      in: query
      schema: { type: integer, default: 1 }
\`\`\`

用 \`$ref: '#/components/schemas/User'\` 引用。

#### 3.8 security：认证

\`\`\`yaml
# 全局认证
security:
  - BearerAuth: []

# 单接口覆盖
paths:
  /public/health:
    get:
      security: []   # 此接口无需认证
\`\`\`

支持的认证类型：

| 类型 | 说明 | 示例 |
| --- | --- | --- |
| http + bearer | JWT Bearer | Authorization: Bearer xxx |
| http + basic | Basic Auth | Authorization: Basic xxx |
| apiKey | API Key | X-Api-Key: xxx |
| oauth2 | OAuth2 | 走授权码流程 |
| openIdConnect | OIDC | OpenID Connect |

#### 3.9 tags：分组

\`\`\`yaml
tags:
  - name: 用户
    description: 用户管理
  - name: 订单
    description: 订单管理
    externalDocs:
      url: https://docs.example.com/orders
      description: 订单详细文档
\`\`\`

接口用 \`tags\` 归类，文档按标签分组展示。

### 四、Swagger UI 与交互式文档

**Swagger UI** 把 OpenAPI 文档渲染成交互式网页，可以直接在浏览器里调 API：

\`\`\`
┌─────────────────────────────────────┐
│  用户服务 API v1.0.0                 │
├─────────────────────────────────────┤
│  [用户] 用户管理                     │
│   GET /users      获取用户列表  [试] │
│   POST /users     创建用户      [试] │
│  [订单] 订单管理                     │
│   GET /orders     获取订单      [试] │
└─────────────────────────────────────┘
\`\`\`

点击"试"展开参数表单，填入参数点"执行"，直接发请求看响应。这对调试和体验 API 极其方便。

**部署 Swagger UI**：

\`\`\`html
<!-- 静态 HTML 引入 Swagger UI -->
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css">
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
<script>
  SwaggerUIBundle({
    url: '/openapi.json',  // OpenAPI 文档地址
    dom_id: '#swagger-ui',
  });
</script>
\`\`\`

**Redoc** 是另一个流行的渲染器，界面更清爽适合阅读（无交互测试）：

\`\`\`html
<script src="https://cdn.jsdelivr.net/npm/redoc/bundles/redoc.standalone.js"></script>
<redoc spec-url="/openapi.json"></redoc>
\`\`\`

### 五、API 文档生成方式

生成 OpenAPI 文档有三种主流方式：

#### 5.1 手写 OpenAPI YAML

直接写 YAML 文件。优点是"契约优先"——先定义接口再写代码。缺点是繁琐，易出错。

\`\`\`yaml
# openapi.yaml（手写）
openapi: 3.0.3
info:
  title: 我的 API
  version: 1.0.0
paths:
  /users:
    get:
      ...
\`\`\`

#### 5.2 代码注解自动生成

在代码里加注解，框架自动生成 OpenAPI 文档。最常用。

**Java（springdoc-openapi）**：

\`\`\`java
@Operation(summary = "获取用户", description = "根据 ID 查询用户")
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "成功"),
    @ApiResponse(responseCode = "404", description = "不存在")
})
@GetMapping("/users/{id}")
public User getUser(@Parameter(description = "用户 ID") @PathVariable Long id) {
    return userService.get(id);
}
\`\`\`

启动后访问 \`/v3/api-docs\` 获取 JSON，\`/swagger-ui.html\` 看 UI。

**Go（swag）**：

\`\`\`go
// @Summary 获取用户
// @Description 根据 ID 查询用户
// @Tags 用户
// @Accept json
// @Produce json
// @Param id path int true "用户 ID"
// @Success 200 {object} User
// @Router /users/{id} [get]
func getUser(c *gin.Context) { ... }
\`\`\`

\`swag init\` 生成 docs/swagger.json。

**Node.js（swagger-jsdoc）**：

\`\`\`javascript
const swaggerJsdoc = require('swagger-jsdoc');
const specs = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: { title: '我的 API', version: '1.0.0' },
  },
  apis: ['./routes/*.js'],  // 扫描路由文件里的注解
});

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: 获取用户
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/users/:id', getUser);
\`\`\`

**Python（FastAPI 自动生成）**：

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str

app = FastAPI()

@app.get("/users/{id}", response_model=User, tags=["用户"], summary="获取用户")
async def get_user(id: int):
    """根据 ID 查询用户"""
    return {"id": id, "name": "张三", "email": "z@x.com"}
\`\`\`

FastAPI 基于类型注解**自动**生成 OpenAPI，访问 \`/docs\`（Swagger UI）和 \`/redoc\`（Redoc）。这是 FastAPI 的一大卖点——零注解成本拿到完整文档。

#### 5.3 契约优先（Design-First）

先写 OpenAPI YAML，再用工具生成代码骨架或桩：

\`\`\`bash
# 生成服务端骨架
openapi-generator generate -i openapi.yaml -g spring -o server
openapi-generator generate -i openapi.yaml -g express -o server-node
\`\`\`

优点：文档与代码强一致（代码从文档生成）；前后端可并行（前端用文档 Mock，后端按文档实现）。缺点：工具链复杂，生成的代码可能不符合团队习惯。

#### 5.4 三种方式对比

| 方式 | 文档准确性 | 开发效率 | 适用 |
| --- | --- | --- | --- |
| 手写 YAML | 高（但易过期） | 低 | 契约优先、小项目 |
| 代码注解 | 中-高（跟代码走） | 高 | 主流，多数项目 |
| 契约优先 | 极高（代码从文档生） | 中 | 严格规范、大团队 |

**推荐**：FastAPI/Quick 等现代框架用类型注解自动生成；传统框架用注解；强规范团队用契约优先。

### 六、API Mock 与测试

#### 6.1 Mock Service

API 文档定义后，前端不必等后端实现，用 Mock 先开发：

- **Postman/Apifox**：导入 OpenAPI，自动生成 Mock，返回示例数据。
- **Prism**：命令行 Mock 服务，从 OpenAPI 启动 Mock。

\`\`\`bash
# Prism 启动 Mock
prism mock openapi.yaml --port 4010
# 现在 http://localhost:4010/users/123 返回文档里的示例
\`\`\`

#### 6.2 契约测试

验证服务端实际响应是否符合 OpenAPI 文档定义：

\`\`\`bash
# Dredd：用 OpenAPI 跑契约测试
dredd openapi.yaml http://localhost:3000
\`\`\`

服务端发版前跑契约测试，确保响应没偏离文档。

#### 6.3 接口测试

Postman/Apifox 集成接口测试：

- 从 OpenAPI 导入接口集合。
- 写测试脚本断言响应。
- 加入 CI，每次发版自动跑。

\`\`\`javascript
// Postman 测试脚本
pm.test("状态码 200", () => pm.response.to.have.status(200));
pm.test("返回 id 字段", () => {
    const body = pm.response.json();
    pm.expect(body.id).to.be.a('number');
});
\`\`\`

### 七、API 文档与前端协作 Workflow

高效的 API 协作流程：

\`\`\`
1. 后端设计 OpenAPI（或 Apifox 协同编辑）
   ↓
2. 前端评审文档，确认字段满足需求
   ↓
3. 文档定稿，前后端并行：
   - 前端：导入 Mock 开发，不等后端
   - 后端：按文档实现接口
   ↓
4. 后端接口就绪，前端切到真实接口
   ↓
5. 联调，发现差异更新文档
   ↓
6. 上线，文档作为长期契约维护
\`\`\`

**Apifox** 等工具支持协同编辑——后端改文档，前端实时看到，Mock 自动更新，大幅提升协作效率。

### 八、API 变更检测与文档同步

#### 8.1 文档过期问题

代码改了文档没更新，是最常见的坑。调用方按过期文档调用，必崩。解决方案：

- **代码注解生成**：文档跟代码走，改代码注解即改文档。
- **CI 检查**：每次 PR 重新生成文档，与仓库里的文档 diff，不一致则阻断。
- **契约测试**：CI 跑 Dredd/Prism，验证响应符合文档。

#### 8.2 破坏性变更检测

\`\`\`bash
# oasdiff：对比新旧 OpenAPI，检测破坏性变更
oasdiff breaking old.json new.json
# 输出：
# - 删除接口 GET /users/{id}/phone (breaking)
# - 字段 name 类型从 string 改为 integer (breaking)
\`\`\`

集成到 CI，破坏性变更必须人工确认，防止"不小心"破坏调用方。

#### 8.3 变更日志

\`\`\`bash
# 自动生成 changelog
oasdiff changelog old.json new.json
\`\`\`

输出每个版本新增/修改/删除的接口，自动维护 Changelog。

### 九、API Gateway 集成文档

API 网关（Kong/APISIX）可以集中管理所有服务的 API 文档：

\`\`\`yaml
# Kong：注册 API 文档
plugins:
  - name: request-transformer
  - name: swagger-ui           # 暴露 Swagger UI
    config:
      specs: /openapi.json
\`\`\`

网关层提供：

- 统一文档入口（所有服务的 API 聚合）。
- 基于 API Key 的文档访问控制。
- 文档与路由、限流、认证策略关联。

### 十、API 文档最佳实践

#### 10.1 示例要完整

每个接口提供完整请求 + 响应示例，调用方照抄即可：

\`\`\`yaml
examples:
  request:
    value:
      name: 张三
      email: z@x.com
  response:
    value:
      id: 123
      name: 张三
      email: z@x.com
      createdAt: "2026-06-27T10:00:00Z"
\`\`\`

#### 10.2 错误码要全

列出所有可能的错误码和含义，别只写 200：

\`\`\`yaml
responses:
  '200': { description: 成功 }
  '400': { description: 参数错误 }
  '401': { description: 未认证 }
  '403': { description: 无权限 }
  '404': { description: 不存在 }
  '409': { description: 冲突（如邮箱已注册） }
  '422': { description: 业务校验失败 }
  '429': { description: 限流 }
  '500': { description: 服务器错误 }
\`\`\`

#### 10.3 版本记录

文档顶部或 Changelog 记录每个版本变更：

\`\`\`markdown
## v2.1.0 (2026-06-01)
- 新增 GET /users/batch 批量查询
- POST /users 响应新增 createdAt 字段

## v2.0.0 (2026-01-01) [BREAKING]
- /users 响应 id 改名为 userId
- 删除 GET /users/{id}/phone（隐私保护）
\`\`\`

#### 10.4 认证说明清晰

\`\`\`yaml
security:
  - BearerAuth: []
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        在请求头加 Authorization: Bearer <token>
        token 通过 POST /auth/login 获取，有效期 2 小时
        过期后用 refreshToken 刷新
\`\`\`

#### 10.5 字段约束明确

\`\`\`yaml
name:
  type: string
  minLength: 1
  maxLength: 50
  pattern: '^[\\\\u4e00-\\\\u9fa5a-zA-Z0-9_]+$'
  description: 用户名，1-50 字符，支持中英文数字下划线
\`\`\`

### 十一、工具对比

| 工具 | 类型 | 特点 | 适用 |
| --- | --- | --- | --- |
| **Swagger UI** | 渲染器 | 交互测试，官方 | 通用 |
| **Redoc** | 渲染器 | 美观阅读，无测试 | 对外文档 |
| **Stoplight** | 平台 | 设计+编辑+Mock+协作 | 企业 |
| **Apifox** | 平台 | 文档+Mock+测试+协作，国内流行 | 国内团队 |
| **Postman** | 平台 | 测试+Mock+文档，国际流行 | 测试驱动 |
| **openapi-generator** | 代码生成 | 多语言 SDK/服务端骨架 | SDK |
| **Prism** | Mock | 命令行 Mock | 前端开发 |
| **oasdiff** | 检测 | 破坏性变更检测 | CI |
| **Elements** (Stoplight) | 渲染器 | 现代美观 | 对外文档 |

#### 11.1 Apifox 详解

Apifox 是国内流行的 API 协作平台，集文档、Mock、测试于一体：

- **文档**：可视化编辑 OpenAPI，团队协同。
- **Mock**：自动 Mock，支持动态数据（如随机邮箱）。
- **测试**：接口测试、自动化测试、性能测试。
- **团队协作**：项目管理、权限、变更通知。

适合国内团队"一站式"API 协作。

#### 11.2 Stoplight 详解

Stoplight 是企业级 API 设计平台：

- **Studio**：可视化 OpenAPI 编辑器，实时校验。
- **Spectral**：自定义 lint 规则，保证文档质量。
- **Mocking**：内置 Mock 服务。
- **Elements**：可嵌入的 API 文档组件。

适合对 API 设计规范要求高的企业。

### 十二、OpenAPI 高级特性

#### 12.1 链接（Links）

描述接口间的关联，方便 SDK 生成"链式调用"：

\`\`\`yaml
responses:
  '201':
    description: 创建成功
    links:
      GetUser:
        operationId: getUserById
        parameters:
          id: '$response.body#/id'
\`\`\`

表示"创建用户后，可用响应里的 id 调 getUserById"。

#### 12.2 回调（Callbacks）

描述服务端回调调用方的场景（如 webhook）：

\`\`\`yaml
paths:
  /webhooks/subscribe:
    post:
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                callbackUrl: { type: string, format: uri }
      callbacks:
        myEvent:
          '{$request.body#/callbackUrl}':
            post:
              requestBody:
                content:
                  application/json:
                    schema:
                      type: object
              responses:
                '200': { description: 回调成功 }
\`\`\`

#### 12.3 服务器变量

\`\`\`yaml
servers:
  - url: https://{tenant}.example.com/v1
    variables:
      tenant:
        default: demo
        description: 租户名
\`\`\`

#### 12.4 多媒体类型

一个接口支持多种格式：

\`\`\`yaml
requestBody:
  content:
    application/json:
      schema: { $ref: '#/components/schemas/User' }
    application/xml:
      schema: { $ref: '#/components/schemas/User' }
    multipart/form-data:
      schema:
        type: object
        properties:
          file:
            type: string
            format: binary
\`\`\`

### 十三、多语言文档生成对照

#### 13.1 Java (springdoc)

\`\`\`java
// 依赖：springdoc-openapi-starter-webmvc-ui
@OpenAPIDefinition(info = @Info(title = "我的 API", version = "1.0"))
@Tag(name = "用户", description = "用户管理")
@RestController
public class UserController {
    @Operation(summary = "获取用户")
    @GetMapping("/users/{id}")
    public User get(@PathVariable Long id) { ... }
}
// 访问 /v3/api-docs（JSON）、/swagger-ui.html（UI）
\`\`\`

#### 13.2 Go (swag)

\`\`\`go
// @title 我的 API
// @version 1.0
// @host api.example.com
// @BasePath /v1
func main() { ... }

// @Summary 获取用户
// @Tags 用户
// @Produce json
// @Param id path int true "用户 ID"
// @Success 200 {object} User
// @Router /users/{id} [get]
func getUser(c *gin.Context) { ... }
// 运行 swag init 生成 docs
\`\`\`

#### 13.3 Python (FastAPI)

\`\`\`python
app = FastAPI(title="我的 API", version="1.0")

@app.get("/users/{id}", response_model=User, tags=["用户"])
async def get_user(id: int = Path(..., description="用户 ID")):
    """获取用户"""
    return user
// 自动生成 /openapi.json、/docs、/redoc
\`\`\`

#### 13.4 Node.js (swagger-jsdoc)

\`\`\`javascript
const specs = swaggerJsdoc({
  definition: { openapi: '3.0.3', info: { title: '我的 API', version: '1.0' } },
  apis: ['./routes/*.js'],
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
\`\`\`

### 十四、生产案例

**案例 1：Stripe 的 API 文档**

Stripe 的文档被业界奉为标杆：

- 每个接口有详细描述、参数说明、示例。
- 示例可"一键运行"（填自己的 API Key 直接调）。
- 文档与代码强绑定，API 改了文档自动更新。
- 多语言示例（curl/Ruby/Python/Node/Go）并列展示。

**案例 2：FastAPI 零注解文档**

某团队用 FastAPI，基于 Pydantic 类型注解自动生成 OpenAPI，开发只写类型，文档自动产出。开发效率提升 30%，文档再没过期。

**案例 3：契约优先拯救协作**

某团队前后端协作总扯皮（"接口说好返回 X 怎么变 Y 了"）。引入契约优先：先用 Apifox 定文档，前后端按文档实现，差异立刻暴露。扯皮消失。

**案例 4：CI 检测破坏性变更**

某 API 一次发版不小心删了字段，导致第三方集成商崩。引入 oasdiff 集成 CI，破坏性变更必须评审确认。再没发生过"不小心破坏"。

### 十五、常见坑

#### 15.1 文档过期

代码改了文档没更新。**解决**：代码注解生成 + CI 检查。

#### 15.2 示例不全

只有 200 示例，没有错误示例。调用方不知道错误长啥样。**解决**：每个状态码都给示例。

#### 15.3 字段无描述

\`\`\`yaml
name:
  type: string
  # 没写 description
\`\`\`

调用方不知道这字段啥意思。**解决**：每个字段写 description。

#### 15.4 没有版本记录

文档改了但没说改了啥。**解决**：维护 Changelog。

#### 15.5 认证说明缺失

没说怎么获取 token。**解决**：securitySchemes 写详细 description。

#### 15.6 分页约定不明

有的接口 page 从 0 开始，有的从 1。**解决**：全局约定 + 文档明确。

#### 15.7 时间格式混乱

有的用时间戳，有的用 ISO 字符串。**解决**：全局统一 ISO 8601，文档标注 format: date-time。

### 十六、OpenAPI 3.0 vs 3.1

3.1 是最新版，主要变化：

- 完全对齐 JSON Schema 2020-12（3.0 是子集）。
- 支持 \`nullable\` 移除，改用 \`type: [string, null]\`。
- webhooks 顶层支持。
- info.summary 字段。

迁移建议：新项目直接 3.1；老项目 3.0 仍主流，工具支持更好。

### 十七、API 文档质量评估

好的 API 文档评估维度：

| 维度 | 评估点 |
| --- | --- |
| 完整性 | 所有接口、参数、响应都描述了吗？ |
| 准确性 | 文档与实际一致吗？（契约测试验证） |
| 示例 | 每个接口有请求/响应示例吗？ |
| 错误码 | 所有可能的错误码都列了吗？ |
| 可读性 | 描述清晰、结构合理吗？ |
| 可测试 | 能直接发起请求测试吗？（Swagger UI） |
| 版本记录 | 有 Changelog 吗？ |
| 认证说明 | 怎么获取 token 说清楚了吗？ |

### 十八、API 文档的受众

写文档要考虑不同受众：

- **前端开发**：关心字段、类型、示例，要能直接用。
- **移动端开发**：关心数据模型，要能生成网络层代码。
- **第三方集成商**：关心完整流程，要有端到端教程。
- **测试**：关心边界条件、错误码。
- **产品/业务**：关心功能描述，不要太多技术细节。

可以分层：业务说明（给人看）+ OpenAPI（给机器看）。

### 十九、API 文档与 API 设计

好的文档源于好的设计。文档写不出来，往往因为设计没想清楚：

- 字段含义说不清 → 设计没明确语义。
- 错误码列不全 → 没梳理异常场景。
- 示例写不出 → 没想清楚数据流。

**契约优先**的精髓就是：先用文档把设计想清楚，再写代码。文档是设计的试金石。

### 二十、API 文档的国际化

对外 API 文档可能要支持多语言：

- OpenAPI 的 description 是字符串，可放多语言。
- 用 \`info.description\` 区分语言版本，或维护多份文档。
- 工具如 ReadMe 支持文档多语言切换。

### 二十一、API 文档与开发者门户

**开发者门户（Developer Portal）** 是对外 API 的"门面"：

- API 文档（Swagger UI/Redoc）。
- 快速开始教程。
- SDK 下载。
- 沙箱环境入口。
- 用量统计（登录后看自己 API 用量）。
- 社区/工单。

开源方案：Backstage、Developer Portal；商业：ReadMe、Stoplight。

### 二十二、API 文档安全

文档本身也可能泄露信息：

- 不要在 description 里写内部实现细节。
- 示例数据用假数据，别用真实用户数据。
- 内部接口不要暴露在公开文档。
- 文档访问要鉴权（对外文档可公开，内部文档加 API Key）。

### 二十三、API 文档生成完整示例

一个完整的 OpenAPI 文档示例（用户 CRUD）：

\`\`\`yaml
openapi: 3.0.3
info:
  title: 用户服务 API
  version: 1.0.0
  description: 用户增删改查
servers:
  - url: https://api.example.com/v1
tags:
  - name: 用户
    description: 用户管理
paths:
  /users:
    get:
      tags: [用户]
      summary: 用户列表
      parameters:
        - name: page
          in: query
          schema: { type: integer, default: 1 }
        - name: size
          in: query
          schema: { type: integer, default: 20, maximum: 100 }
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  total: { type: integer }
                  items:
                    type: array
                    items: { $ref: '#/components/schemas/User' }
    post:
      tags: [用户]
      summary: 创建用户
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/UserCreate' }
      responses:
        '201':
          description: 创建成功
          content:
            application/json:
              schema: { $ref: '#/components/schemas/User' }
        '400':
          $ref: '#/components/responses/BadRequest'
        '409':
          description: 邮箱已注册
  /users/{id}:
    get:
      tags: [用户]
      summary: 获取用户
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema: { $ref: '#/components/schemas/User' }
        '404':
          $ref: '#/components/responses/NotFound'
    delete:
      tags: [用户]
      summary: 删除用户
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      responses:
        '204': { description: 删除成功 }
        '404': { $ref: '#/components/responses/NotFound' }
components:
  schemas:
    User:
      type: object
      required: [id, name, email]
      properties:
        id: { type: integer, format: int64 }
        name: { type: string }
        email: { type: string, format: email }
        createdAt: { type: string, format: date-time }
    UserCreate:
      type: object
      required: [name, email]
      properties:
        name: { type: string, minLength: 1, maxLength: 50 }
        email: { type: string, format: email }
    Error:
      type: object
      required: [code, message]
      properties:
        code: { type: integer }
        message: { type: string }
  responses:
    BadRequest:
      description: 参数错误
      content:
        application/json:
          schema: { $ref: '#/components/schemas/Error' }
    NotFound:
      description: 不存在
      content:
        application/json:
          schema: { $ref: '#/components/schemas/Error' }
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
security:
  - BearerAuth: []
\`\`\`

### 二十四、API 文档与测试驱动

OpenAPI 文档可作为测试的"真相来源"：

- **生成测试用例**：从文档的 examples 生成请求。
- **响应校验**：用文档的 schema 校验实际响应（Prism/Atmo）。
- **模糊测试**：按 schema 生成边界值测试。

\`\`\`javascript
// Node.js：用 OpenAPI 校验响应
const { Validator } = require('openapi-validator');
const validator = new Validator(spec);
const result = validator.validateResponse('/users/{id}', 'get', 200, actualResponse);
if (!result.valid) console.error(result.errors);
\`\`\`

### 二十五、API 文档的演化

API 文档会随项目演化：

- **初期**：手写 Markdown，够用就行。
- **成长期**：引入 OpenAPI + Swagger UI，规范化。
- **成熟期**：契约优先 + CI 检测 + 协同平台（Apifox/Stoplight）。
- **平台期**：开发者门户 + SDK 自动生成 + 全生命周期治理。

### 二十六、API 文档与微服务

微服务架构下，每个服务有自己的 OpenAPI 文档，需要聚合：

- **API 网关聚合**：网关拉取各服务文档，合并成全局文档。
- **服务目录**：Backstage 等平台注册所有服务的文档，可搜索。
- **版本对齐**：各服务文档版本与服务发布版本对应。

### 二十七、面试高频问题

**Q1：OpenAPI 和 Swagger 什么关系？**

Swagger 是规范 + 工具集，2015 年规范部分捐赠给 Linux 基金会改名 OpenAPI。现在 OpenAPI 是规范名，Swagger 是工具名（Swagger UI、Swagger Editor）。

**Q2：API 文档几种生成方式？**

手写 YAML、代码注解自动生成、契约优先。主流是代码注解（FastAPI/springdoc/swag）。

**Q3：契约优先有什么好处？**

文档与代码强一致；前后端可并行（前端 Mock 开发）；破坏性变更可早期发现。

**Q4：如何保证文档不过期？**

代码注解生成 + CI 检查（重新生成与仓库 diff）+ 契约测试（响应符合 schema）。

**Q5：oasdiff 是什么？**

对比新旧 OpenAPI 文档，自动检测破坏性变更和生成 changelog 的工具，集成 CI 防止意外破坏。

**Q6：FastAPI 怎么生成文档？**

基于 Pydantic 类型注解自动生成，访问 /docs（Swagger UI）、/redoc（Redoc）、/openapi.json（原始 JSON），零注解成本。

### 二十八、最佳实践清单

- [ ] 用 OpenAPI 3.0+ 规范描述 API
- [ ] 代码注解自动生成文档（避免过期）
- [ ] 每个接口有完整请求/响应示例
- [ ] 所有可能的错误码都列出
- [ ] 每个字段写 description
- [ ] 认证方式说明清晰
- [ ] 维护 Changelog
- [ ] CI 集成 oasdiff 检测破坏性变更
- [ ] 契约测试验证响应符合文档
- [ ] Swagger UI/Redoc 提供交互文档
- [ ] Mock 服务支持前端并行开发
- [ ] 全局统一分页、时间格式约定
- [ ] 内部接口与对外文档分离
- [ ] SDK 自动生成（openapi-generator）
- [ ] 开发者门户（对外 API）

### 二十九、API 文档工具链选型建议

| 场景 | 推荐工具 |
| --- | --- |
| 个人/小项目 | FastAPI 自带 / springdoc + Swagger UI |
| 国内团队协作 | Apifox（一站式） |
| 国际团队协作 | Stoplight + Elements |
| 严格契约优先 | openapi-generator + Spectral lint |
| SDK 生成 | openapi-generator |
| Mock 服务 | Prism / Apifox |
| 破坏性检测 | oasdiff |
| 开发者门户 | Backstage / ReadMe |

### 三十、API 文档与 API 设计评审

文档是 API 设计评审的载体。评审要点：

- 接口命名是否规范（动词 + 名词，RESTful）。
- 参数是否合理（必填/可选、类型、约束）。
- 响应是否完整（字段、分页、错误）。
- 是否符合全局规范（分页、错误码、时间格式）。
- 是否有破坏性变更（对比老版本）。
- 示例是否真实可用。
- 认证/权限是否说明。

### 三十一、总结性原则

1. **文档是契约，不是附属品**。
2. **机器可读（OpenAPI）优于自然语言**。
3. **代码与文档同源（注解生成）**。
4. **示例胜过描述**。
5. **CI 保障一致性**。
6. **工具链自动化**。

### 三十二、OpenAPI Schema 深度

OpenAPI 用 JSON Schema 子集描述数据结构，掌握 Schema 是写好文档的关键。

#### 32.1 基本类型

\`\`\`yaml
schema:
  type: string           # string/integer/number/boolean/array/object
  format: email          # email/uri/date/date-time/uuid/binary/int64
  example: z@x.com
  description: 邮箱
\`\`\`

常用 format：

| format | 含义 | 例子 |
| --- | --- | --- |
| email | 邮箱 | z@x.com |
| uri | URL | https://x.com |
| uuid | UUID | 550e8400-... |
| date | 日期 | 2026-06-27 |
| date-time | 时间 | 2026-06-27T10:00:00Z |
| int64 | 长整型 | 1700000000000 |
| binary | 二进制 | 文件上传 |

#### 32.2 字符串约束

\`\`\`yaml
schema:
  type: string
  minLength: 6
  maxLength: 20
  pattern: '^[a-zA-Z0-9_]+$'   # 正则
  enum: [active, inactive]      # 枚举
\`\`\`

#### 32.3 数字约束

\`\`\`yaml
schema:
  type: integer
  minimum: 0
  maximum: 150
  exclusiveMinimum: false
  multipleOf: 5
\`\`\`

#### 32.4 数组

\`\`\`yaml
schema:
  type: array
  items:
    type: string
  minItems: 1
  maxItems: 100
  uniqueItems: true   # 元素唯一
\`\`\`

#### 32.5 对象

\`\`\`yaml
schema:
  type: object
  required: [id, name]
  properties:
    id: { type: integer }
    name: { type: string }
  additionalProperties: false   # 不允许额外字段
\`\`\`

\`additionalProperties: false\` 严格限制字段，调用方不会收到未定义字段。若设为 \`true\` 或 schema，则允许任意额外字段。

#### 32.6 组合（oneOf/anyOf/allOf）

\`\`\`yaml
# oneOf：匹配其一（联合类型）
schema:
  oneOf:
    - $ref: '#/components/schemas/Cat'
    - $ref: '#/components/schemas/Dog'

# allOf：组合（继承）
schema:
  allOf:
    - $ref: '#/components/schemas/BaseModel'
    - type: object
      properties:
        extraField: { type: string }
\`\`\`

#### 32.7 可空字段

OpenAPI 3.0 用 \`nullable: true\`：

\`\`\`yaml
avatar:
  type: string
  nullable: true   # 可为 null
\`\`\`

3.1 改用 \`type: [string, null]\`（对齐 JSON Schema 2020-12）。

### 三十三、API 文档与异步 API

OpenAPI 描述同步 RESTful API，异步消息 API 用 **AsyncAPI** 规范（结构类似 OpenAPI）：

\`\`\`yaml
asyncapi: '2.6.0'
info:
  title: 订单事件
  version: 1.0.0
channels:
  order/created:
    subscribe:
      message:
        payload:
          type: object
          properties:
            orderId: { type: string }
            amount: { type: number }
\`\`\`

OpenAPI + AsyncAPI 一起覆盖同步 + 异步 API 的文档需求。

### 三十四、API 文档的版本化

OpenAPI 文档本身也要版本化：

- 文件命名：\`openapi-v1.json\`、\`openapi-v2.json\`。
- info.version 字段记录文档版本。
- 多版本并存，Swagger UI 切换。
- 与 API 版本对应（v1 API → openapi-v1.json）。

### 三十五、API 文档与 API Mock 进阶

#### 35.1 动态 Mock

简单 Mock 返回固定示例，动态 Mock 根据参数返回不同数据：

\`\`\`javascript
// Apifox 动态 Mock 脚本
if (request.params.id == 1) {
  return { id: 1, name: '张三' };
} else {
  return { id: 2, name: '李四' };
}
\`\`\`

#### 35.2 Mock 数据生成

用 faker 生成随机数据：

\`\`\`yaml
example:
  id: {{$randomInt}}
  name: {{$randomFirstName}}
  email: {{$randomEmail}}
  avatar: https://i.pravatar.cc/150?img={{$randomInt}}
\`\`\`

#### 35.3 状态码 Mock

模拟各种错误响应，测试前端容错：

\`\`\`
请求头 X-Mock-Status: 500 → 返回 500
请求头 X-Mock-Status: 404 → 返回 404
\`\`\`

### 三十六、API 文档的搜索与发现

API 多了，需要搜索发现：

- **API 目录**：Backstage、API Gateway 自带目录。
- **标签**：按业务域打标签（用户/订单/支付）。
- **全文搜索**：搜索接口名、描述、字段名。
- **关联推荐**：查看 /users 时推荐 /users/{id}/orders。

### 三十七、API 文档与代码生成质量

openapi-generator 生成的代码质量参差：

- **命名**：按 operationId 生成方法名，要规范命名。
- **类型**：生成的类型要符合语言习惯。
- **文档**：生成的注释要包含 description。
- **依赖**：避免引入过多运行时依赖。

建议生成后 review + 定制模板，不要直接用默认输出。

### 三十八、API 文档的反模式

1. **文档与代码两张皮**：手写文档不跟代码走。
2. **只有 200 响应**：错误码缺失。
3. **字段无描述**：调用方猜含义。
4. **示例假到不能用**：example 写 \`"string"\` 占位。
5. **认证一笔带过**：没说怎么拿 token。
6. **分页约定缺失**：每个接口自己一套分页。
7. **文档不开放**：内部 API 文档不对外，集成商抓瞎。

### 总结

API 文档是 API 的说明书，OpenAPI 是机器可读的契约标准：

- **规范**：OpenAPI 3.0 用 YAML/JSON 描述 API，结构清晰。
- **生成**：代码注解（FastAPI/springdoc/swag）自动生成，避免过期。
- **交互**：Swagger UI 让文档可测试。
- **协作**：契约优先 + Mock，前后端并行。
- **保障**：CI 集成 oasdiff 检测破坏性变更，契约测试验证一致性。

记住：**没有文档的 API 等于没有 API；过期的文档比没有文档更糟**。下一章我们将讨论错误处理与状态码规范，看看如何让 API 的"出错"也变得规范可预期。

---

**延伸阅读**：

- OpenAPI 官方规范：https://spec.openapis.org/oas/v3.0.3
- Swagger UI：https://swagger.io/tools/swagger-ui
- openapi-generator：https://openapi-generator.tech
- Apifox：https://apifox.com
- Stoplight：https://stoplight.io
- oasdiff：https://github.com/Tufin/oasdiff

**面试高频问题汇总**：

- OpenAPI 和 Swagger 的关系？
- API 文档几种生成方式？
- 契约优先是什么？有什么好处？
- 如何保证文档不过期？
- oasdiff 的作用？
- FastAPI 怎么生成文档？
- Swagger UI 和 Redoc 区别？
- OpenAPI 的 components 有什么用？
- 如何检测破坏性变更？
- API Mock 怎么工作？

**实践建议**：

1. 新项目从一开始就用 OpenAPI（哪怕手写）。
2. 用 FastAPI/springdoc 等自动生成，杜绝手维护。
3. 每个接口写完整示例和错误码。
4. CI 集成 oasdiff，破坏性变更必须评审。
5. 用 Apifox/Stoplight 提升团队协作效率。
`,
    code: `// ============================================================
// API 文档与 OpenAPI —— 可运行示例
// 实现简易 OpenAPI 文档生成器 + Mock 响应 + 文档校验
// ============================================================

// ---------- 1. API 注册器 ----------
class ApiRegistry {
  constructor(info) {
    this.info = info;        // { title, version, description }
    this.paths = {};          // { '/users/{id}': { GET: {...} } }
    this.schemas = {};        // 可复用的 schema 定义
  }
  // 注册 schema
  schema(name, definition) {
    this.schemas[name] = definition;
  }
  // 注册接口
  endpoint(method, path, config) {
    const upper = method.toUpperCase();
    if (!this.paths[path]) this.paths[path] = {};
    this.paths[path][upper] = {
      summary: config.summary,
      description: config.description,
      tags: config.tags || [],
      parameters: config.parameters || [],
      requestBody: config.requestBody || null,
      responses: config.responses || {},
    };
  }
  // 生成 OpenAPI 3.0 JSON
  toOpenAPI() {
    return {
      openapi: '3.0.3',
      info: this.info,
      paths: this.paths,
      components: { schemas: this.schemas },
    };
  }
  // 根据 path + method 生成 Mock 响应
  mock(method, path) {
    const upper = method.toUpperCase();
    const op = this.paths[path] && this.paths[path][upper];
    if (!op) return { status: 404, body: { error: '接口不存在' } };
    const resp = op.responses['200'] || op.responses['201'];
    if (!resp || !resp.example) return { status: 200, body: { message: 'Mock 占位' } };
    return { status: 200, body: resp.example };
  }
}

// ---------- 2. 注册 API ----------
const registry = new ApiRegistry({
  title: '用户服务 API',
  version: '1.0.0',
  description: '用户增删改查示例',
});

// 注册复用 schema
registry.schema('User', {
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: { type: 'integer', description: '用户 ID' },
    name: { type: 'string', description: '用户名' },
    email: { type: 'string', format: 'email', description: '邮箱' },
    createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
  },
});
registry.schema('Error', {
  type: 'object',
  required: ['code', 'message'],
  properties: {
    code: { type: 'integer' },
    message: { type: 'string' },
  },
});

// 注册接口：获取用户
registry.endpoint('GET', '/users/{id}', {
  summary: '获取用户详情',
  description: '根据 ID 查询用户',
  tags: ['用户'],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: '用户 ID' },
  ],
  responses: {
    '200': { description: '成功', schema: { $ref: '#/components/schemas/User' }, example: { id: 123, name: '张三', email: 'z@x.com', createdAt: '2026-06-27T10:00:00Z' } },
    '404': { description: '不存在', schema: { $ref: '#/components/schemas/Error' }, example: { code: 404, message: '用户不存在' } },
  },
});

// 注册接口：创建用户
registry.endpoint('POST', '/users', {
  summary: '创建用户',
  tags: ['用户'],
  requestBody: {
    required: true,
    schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' } } },
    example: { name: '李四', email: 'l@x.com' },
  },
  responses: {
    '201': { description: '创建成功', schema: { $ref: '#/components/schemas/User' }, example: { id: 124, name: '李四', email: 'l@x.com', createdAt: '2026-06-27T11:00:00Z' } },
    '409': { description: '邮箱已注册', example: { code: 409, message: '邮箱已注册' } },
  },
});

// ---------- 3. 输出生成的 OpenAPI 文档 ----------
console.log('===== 演示 1：生成的 OpenAPI 文档 =====');
const openapi = registry.toOpenAPI();
console.log(JSON.stringify(openapi, null, 2));

// ---------- 4. Mock 响应 ----------
console.log('\\n===== 演示 2：Mock 响应 =====');
console.log('GET /users/{id}:');
console.log(JSON.stringify(registry.mock('GET', '/users/{id}').body, null, 2));
console.log('\\nPOST /users:');
console.log(JSON.stringify(registry.mock('POST', '/users').body, null, 2));

// ---------- 5. 文档校验（简易） ----------
console.log('\\n===== 演示 3：文档校验 =====');
function validateDoc(doc) {
  const errors = [];
  if (!doc.openapi) errors.push('缺少 openapi 版本');
  if (!doc.info || !doc.info.title) errors.push('缺少 info.title');
  if (!doc.info || !doc.info.version) errors.push('缺少 info.version');
  if (!doc.paths) errors.push('缺少 paths');
  for (const [path, methods] of Object.entries(doc.paths || {})) {
    for (const [method, op] of Object.entries(methods)) {
      if (!op.summary) errors.push(method + ' ' + path + ' 缺少 summary');
      if (!op.responses || Object.keys(op.responses).length === 0) {
        errors.push(method + ' ' + path + ' 缺少 responses');
      }
      // 检查是否有成功响应示例
      const ok = op.responses['200'] || op.responses['201'];
      if (ok && !ok.example) errors.push(method + ' ' + path + ' 的成功响应缺少 example');
    }
  }
  return errors;
}
const errs = validateDoc(openapi);
if (errs.length === 0) {
  console.log('✅ 文档校验通过');
} else {
  console.log('❌ 发现问题:');
  errs.forEach(e => console.log('  - ' + e));
}

// ---------- 6. 统计接口信息 ----------
console.log('\\n===== 演示 4：接口统计 =====');
let pathCount = 0, opCount = 0;
const tagMap = {};
for (const [path, methods] of Object.entries(openapi.paths)) {
  pathCount++;
  for (const [method, op] of Object.entries(methods)) {
    opCount++;
    for (const t of op.tags) {
      tagMap[t] = (tagMap[t] || 0) + 1;
    }
  }
}
console.log('  路径数: ' + pathCount);
console.log('  操作数: ' + opCount);
console.log('  按标签分组:');
for (const [tag, n] of Object.entries(tagMap)) {
  console.log('    ' + tag + ': ' + n + ' 个接口');
}

console.log('\\n===== 演示结束 =====');
`,
  },
  // __APPEND_CHAPTERS_HERE__
  {
    id: "backend-error-handling",
    group: "API 设计与架构",
    icon: "⚠️",
    title: "错误处理与状态码规范",
    content: `# 错误处理与状态码规范

> 错误处理是后端系统的"免疫系统"：一个优雅的错误处理体系能让系统在故障时仍保持可观测、可恢复、可调试，而混乱的错误处理会让每一次线上故障都变成"黑盒"。本章将从 HTTP 状态码语义、错误响应体设计、业务错误码体系、分层异常处理、反模式与最佳实践等多维度，系统讲解后端错误处理的工程方法论。

## 一、为什么错误处理如此重要

很多人把错误处理当作"附加项"，认为把 happy path 写完就完成了 80% 的工作。但实际上，**线上 80% 的事故都和错误处理不当有关**。错误处理的重要性体现在四个维度：

### 1.1 调试效率

当用户反馈"我的订单提交失败"时，如果系统返回的是 \`{"error": "something went wrong"}\`，开发者几乎无法定位问题；但如果返回的是：

\`\`\`json
{
  "code": "ORDER_0042",
  "message": "库存不足",
  "details": {
    "sku": "SKU-12345",
    "requested": 100,
    "available": 3
  },
  "traceId": "a1b2c3d4e5f6"
}
\`\`\`

开发者可以立即根据 traceId 在日志系统中找到完整调用链，根据 code 在错误码注册表中查到具体业务含义，根据 details 知道是哪个 SKU 缺货。**调试时间从小时级降到分钟级**。

### 1.2 用户体验

用户看到的不是堆栈，而是 message 字段。一句"系统繁忙，请稍后重试"远比 \`TypeError: Cannot read property 'id' of undefined\` 友好。好的错误消息应该：

- **具体**：告诉用户到底哪里出了问题（"您的余额不足，当前余额 50 元，需支付 100 元"）
- **可行动**：告诉用户下一步该做什么（"请充值或使用其他支付方式"）
- **不指责**：避免"您输入错误"这类表述，改为"该字段格式不正确"

### 1.3 监控告警

错误码是监控系统的"语言"。通过聚合 \`code\` 字段，可以建立：

- **错误率告警**：某错误码 5 分钟内出现 1000 次触发告警
- **新错误检测**：出现未注册的新错误码立即告警（可能是代码 bug 或未覆盖的边界）
- **业务健康度**：\`PAYMENT_FAILED\` 码上升意味着支付通道异常

### 1.4 系统韧性

错误处理直接影响系统的容错能力：

- **快速失败**：发现依赖服务不可用时立即返回错误，避免请求堆积拖垮整个系统
- **优雅降级**：非核心功能失败时返回默认值，保证核心功能可用
- **熔断保护**：错误率达到阈值时熔断，防止级联故障

## 二、HTTP 状态码使用规范

HTTP 状态码是 RFC 7231 定义的标准语义，**必须严格遵守**。客户端、网关、CDN、监控都会根据状态码做决策（如 5xx 触发重试，4xx 不重试，3xx 跟随跳转）。乱用状态码会导致这些自动化机制失效。

### 2.1 状态码分类

| 范围 | 类别 | 含义 |
|------|------|------|
| 1xx | 信息响应 | 协议升级、早期提示（实际很少用） |
| 2xx | 成功 | 请求被正确处理 |
| 3xx | 重定向 | 需要进一步操作才能完成 |
| 4xx | 客户端错误 | 请求有误，客户端应修改后重试 |
| 5xx | 服务端错误 | 服务端处理失败 |

### 2.2 常用 2xx 状态码

#### 200 OK

最常用的成功响应。但要注意语义：**200 表示"请求成功，并返回了完整结果"**。用于 GET 查询、POST 创建（返回新资源）、PUT 更新（返回更新后的资源）。

误用案例：
- 用 200 返回错误（"业务失败也用 200，body 里 code=500"）—— 这是反模式，下面会详细讲
- 用 200 返回空响应删除资源 —— 应该用 204

#### 201 Created

**资源创建成功**。用于 POST 创建资源后返回，最佳实践是在 Location 头中返回新资源的 URI：

\`\`\`
HTTP/1.1 201 Created
Location: /api/orders/12345
Content-Type: application/json

{"id": 12345, "status": "created"}
\`\`\`

RESTful API 中创建资源必须用 201，而不是 200。

#### 204 No Content

**成功但无响应体**。典型场景：
- DELETE 删除资源成功
- PUT 更新成功且客户端不需要返回值
- OPTIONS 预检请求

注意：204 不能有响应体，Content-Length 必须为 0。

#### 202 Accepted

**请求已接收，但处理尚未完成**。用于异步任务：

\`\`\`
POST /api/exports
HTTP/1.1 202 Accepted
Location: /api/exports/task-abc/status
\`\`\`

客户端通过轮询 Location 获取任务进度。适用于导出报表、批量发送邮件、视频转码等长耗时任务。

### 2.3 常用 4xx 状态码

#### 400 Bad Request

**请求语法错误或参数校验失败**。最常见的客户端错误。但 400 的语义比较宽泛，实际项目中常配合 body 中的 details 字段说明具体错误：

\`\`\`json
{
  "code": "VALIDATION_FAILED",
  "message": "请求参数校验失败",
  "details": [
    {"field": "email", "issue": "格式不正确"},
    {"field": "age", "issue": "必须大于 0"}
  ]
}
\`\`\`

误用案例：
- 把所有客户端错误都归为 400 —— 应该用更具体的 401/403/404/409
- 把服务端异常返回 400 —— 5xx 才是服务端错误

#### 401 Unauthorized

**未认证**（注意 RFC 命名有误导，实际是"未认证"而非"未授权"）。客户端未提供有效的身份凭证。

典型场景：
- 未携带 Authorization 头
- Token 过期
- Token 无效

应配合 WWW-Authenticate 响应头：

\`\`\`
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="api"
\`\`\`

#### 403 Forbidden

**已认证但无权限**。客户端身份已确认，但无权访问该资源。

典型场景：
- 普通用户访问管理员接口
- 用户 A 访问用户 B 的私有资源
- 账号被禁用

401 vs 403 的区分：
- 401：你是谁？（不知道）
- 403：我知道你是谁，但你不能做这件事

#### 404 Not Found

**资源不存在**。注意几个细节：

- 不要用 404 表示"权限不足"（应该用 403），否则会泄露资源存在性
- 不要用 404 表示"参数错误"（应该用 400）
- 列表查询为空应该返回 200 + 空数组，而不是 404

**安全考虑**：未认证用户请求不存在的资源应该统一返回 404（而不是 401），避免泄露资源存在性。例如，未登录用户访问 \`/api/users/123\`，无论 123 是否存在，都返回 404，防止枚举攻击。

#### 405 Method Not Allowed

**方法不允许**。资源存在但不支持该 HTTP 方法。例如对 \`/api/users/123\` 发起 POST 请求（只支持 GET/PUT/DELETE）。

应配合 Allow 头：

\`\`\`
HTTP/1.1 405 Method Not Allowed
Allow: GET, PUT, DELETE
\`\`\`

#### 409 Conflict

**冲突**。请求与服务器当前状态冲突。典型场景：

- 创建已存在的资源（唯一约束冲突）
- 乐观锁版本冲突
- 资源状态不允许该操作（如订单已支付，不能再取消）

\`\`\`json
{
  "code": "ORDER_STATUS_CONFLICT",
  "message": "订单已支付，无法取消",
  "details": {"currentStatus": "PAID", "expectedStatus": "PENDING"}
}
\`\`\`

#### 422 Unprocessable Entity

**语义错误**。请求格式正确但语义无法处理。WebDAV 定义，但被广泛用于参数校验失败（比 400 更精确）。

400 vs 422 的区分（业界实践）：
- 400：请求格式错误（JSON 解析失败、缺少必填字段）
- 422：格式正确但值不合法（email 格式错误、年龄为负数）

#### 429 Too Many Requests

**请求频率超限**。配合 Retry-After 头告诉客户端多久后重试：

\`\`\`
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1620000000
\`\`\`

### 2.4 常用 5xx 状态码

#### 500 Internal Server Error

**服务端内部错误**。最"通用"的 5xx，但应尽量避免使用——能细分就细分。

500 表示"我不知道哪里出了问题"。如果知道是依赖服务超时，应该用 504；如果是服务不可用，应该用 503。

#### 502 Bad Gateway

**网关错误**。网关/代理从上游收到无效响应。通常意味着上游服务崩溃或返回了非 HTTP 响应。

#### 503 Service Unavailable

**服务不可用**。服务暂时过载或维护中。应配合 Retry-After 头：

\`\`\`
HTTP/1.1 503 Service Unavailable
Retry-After: 3600
\`\`\`

典型场景：
- 服务启动中
- 限流熔断后拒绝请求
- 计划内维护

#### 504 Gateway Timeout

**网关超时**。网关在指定时间内未收到上游响应。注意区分：
- 504：网关等待上游超时（上游可能正在处理但很慢）
- 502：网关收到上游响应但响应无效
- 500：服务端自己处理时出错

### 2.5 状态码选择决策树

\`\`\`
请求成功？
├── 是 → 资源创建？ → 是 → 201
│                → 否 → 有响应体？ → 是 → 200
│                                → 否 → 204
│       异步任务？ → 202
│
└── 否 → 客户端错误？
         ├── 参数错误 → 400/422
         ├── 未认证 → 401
         ├── 无权限 → 403
         ├── 资源不存在 → 404
         ├── 方法不支持 → 405
         ├── 冲突 → 409
         ├── 频率超限 → 429
         │
         └── 服务端错误
             ├── 未知错误 → 500
             ├── 上游无效响应 → 502
             ├── 服务不可用 → 503
             └── 上游超时 → 504
\`\`\`

### 2.6 状态码误用案例

**案例 1：所有错误都用 200**

\`\`\`json
HTTP/1.1 200 OK

{"code": 500, "message": "服务器错误"}
\`\`\`

问题：
- CDN/网关不知道这是错误，无法触发告警
- 客户端 HTTP 库不会抛异常，需要业务代码判断
- 监控系统按状态码统计错误率会失效

**案例 2：用 404 表示权限不足**

\`\`\`
GET /api/admin/users
HTTP/1.1 404 Not Found
\`\`\`

问题：
- 让攻击者知道接口存在
- 客户端无法区分"接口不存在"和"无权限"
- 正确做法：未认证返回 401，已认证无权限返回 403

**案例 3：用 500 表示业务错误**

\`\`\`
POST /api/orders
HTTP/1.1 500 Internal Server Error

{"code": "INSUFFICIENT_BALANCE"}
\`\`\`

问题：500 触发运维告警，但实际是业务错误，运维介入无意义。应该用 422 或 409。

## 三、错误响应体设计

状态码传达"错误类别"，响应体传达"错误细节"。一个良好的错误响应体应该包含足够的信息让客户端、开发者、监控系统三方都能各取所需。

### 3.1 响应体字段设计

业界主流方案包含以下字段：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 业务错误码（机器可读） |
| message | string | 是 | 错误消息（人类可读，可展示给用户） |
| details | object/array | 否 | 错误详情（字段级错误、上下文信息） |
| traceId | string | 否 | 链路追踪 ID（用于日志检索） |
| timestamp | string | 否 | 错误发生时间（ISO 8601） |
| docUrl | string | 否 | 错误文档链接 |
| errors | array | 否 | 多个字段错误的列表 |

### 3.2 业界方案对比

#### Twitter 错误响应

\`\`\`json
{
  "errors": [
    {
      "code": 32,
      "message": "Could not authenticate you."
    }
  ]
}
\`\`\`

特点：用数字 code，errors 数组支持多个错误。

#### Google API 错误响应

\`\`\`json
{
  "error": {
    "code": 400,
    "message": "API key not valid. Please pass a valid API key.",
    "errors": [
      {
        "message": "API key not valid. Please pass a valid API key.",
        "domain": "global",
        "reason": "badRequest"
      }
    ],
    "status": "INVALID_ARGUMENT",
    "details": [
      {
        "@type": "type.googleapis.com/google.rpc.ErrorInfo",
        "reason": "API_KEY_INVALID",
        "metadata": {...}
      }
    ]
  }
}
\`\`\`

特点：嵌套 error 对象，code 用 HTTP 状态码，status 用枚举（如 INVALID_ARGUMENT、NOT_FOUND、PERMISSION_DENIED），details 支持多类型扩展。

#### Stripe 错误响应

\`\`\`json
{
  "error": {
    "type": "card_error",
    "code": "card_declined",
    "decline_code": "insufficient_funds",
    "param": "source",
    "message": "Your card was declined.",
    "request_id": "req_12345"
  }
}
\`\`\`

特点：单 error 对象，type 表示错误类别，code 表示具体错误，param 指出哪个参数出问题。

#### JSON:API 错误响应

\`\`\`json
{
  "errors": [
    {
      "id": "trace-123",
      "status": "422",
      "code": "INVALID_FIELD",
      "title": "Validation failed",
      "detail": "email is not a valid email address",
      "source": {"pointer": "/data/attributes/email"},
      "meta": {"timestamp": "2026-01-01T00:00:00Z"}
    }
  ]
}
\`\`\`

特点：errors 数组，每个错误对象包含 status/code/title/detail/source/meta，source.pointer 用 JSON Pointer 指向具体字段。

### 3.3 推荐方案

综合业界实践，推荐以下结构：

\`\`\`json
{
  "success": false,
  "code": "ORDER_INSUFFICIENT_STOCK",
  "message": "库存不足",
  "details": {
    "sku": "SKU-12345",
    "requested": 100,
    "available": 3
  },
  "traceId": "a1b2c3d4e5f6",
  "timestamp": "2026-06-27T10:00:00Z"
}
\`\`\`

设计原则：
- **success**：布尔值，方便客户端快速判断（虽然状态码也能判断，但 body 中冗余更友好）
- **code**：业务错误码，全局唯一，机器可读
- **message**：用户可见消息，可国际化
- **details**：结构化详情，便于客户端做精细化处理
- **traceId**：贯穿请求全链路，便于日志关联

### 3.4 字段级错误设计

参数校验失败时，details 应该列出每个错误字段：

\`\`\`json
{
  "success": false,
  "code": "VALIDATION_FAILED",
  "message": "请求参数校验失败",
  "details": {
    "errors": [
      {
        "field": "email",
        "rule": "format",
        "message": "邮箱格式不正确",
        "value": "abc"
      },
      {
        "field": "age",
        "rule": "min",
        "message": "年龄必须大于等于 0",
        "value": -1
      }
    ]
  }
}
\`\`\`

## 四、业务错误码设计

业务错误码是错误处理体系的"骨架"。一个好的错误码体系应该：唯一、可扩展、可读、可分组。

### 4.1 全局 vs 模块化

**全局错误码**：所有错误码放在一个枚举中，前缀区分模块：

\`\`\`
USER_NOT_FOUND
USER_EMAIL_EXISTS
ORDER_NOT_FOUND
ORDER_INSUFFICIENT_STOCK
PAYMENT_FAILED
PAYMENT_REFUND_FAILED
\`\`\`

优点：简单直接。缺点：模块多了之后枚举爆炸，难以管理。

**模块化错误码**：每个模块独立维护错误码，前缀隔离：

\`\`\`
// user 模块
USER_001: 用户不存在
USER_002: 邮箱已存在
USER_003: 密码错误

// order 模块
ORDER_001: 订单不存在
ORDER_002: 库存不足
ORDER_003: 订单状态错误
\`\`\`

优点：模块解耦，可独立扩展。缺点：需要规范前缀避免冲突。

### 4.2 编码规则

常见编码规则：

**规则 1：模块前缀 + 序号**

\`\`\`
USER_001, USER_002, ORDER_001, ORDER_002
\`\`\`

简单但不够语义化。

**规则 2：模块前缀 + 错误类型 + 序号**

\`\`\`
USER_NOT_FOUND_001
USER_VALIDATION_001
ORDER_BUSINESS_001
\`\`\`

更清晰但太长。

**规则 3：HTTP 状态码 + 模块 + 序号**

\`\`\`
400_USER_001
404_ORDER_001
409_ORDER_001
\`\`\`

直接关联 HTTP 状态码，便于排查。

**推荐规则**：模块前缀（大写下划线） + 语义化名称：

\`\`\`
USER_NOT_FOUND
USER_EMAIL_DUPLICATE
ORDER_INSUFFICIENT_STOCK
ORDER_STATUS_CONFLICT
PAYMENT_GATEWAY_TIMEOUT
\`\`\`

优点：
- 自描述（看到名字就知道含义）
- 不需要查表就能大致理解
- 易于扩展（新增错误直接加新名字）

### 4.3 错误码注册表

错误码应该集中管理，便于查询和维护：

\`\`\`javascript
const ErrorCodes = {
  // 通用错误 1xxx
  INTERNAL_ERROR:           { code: "COMMON_0001", httpStatus: 500, message: "系统内部错误" },
  VALIDATION_FAILED:        { code: "COMMON_0002", httpStatus: 422, message: "参数校验失败" },
  UNAUTHORIZED:             { code: "COMMON_0003", httpStatus: 401, message: "未登录或登录已过期" },
  FORBIDDEN:                { code: "COMMON_0004", httpStatus: 403, message: "无权访问" },
  NOT_FOUND:                { code: "COMMON_0005", httpStatus: 404, message: "资源不存在" },
  RATE_LIMITED:             { code: "COMMON_0006", httpStatus: 429, message: "请求过于频繁" },

  // 用户模块 2xxx
  USER_NOT_FOUND:           { code: "USER_0001", httpStatus: 404, message: "用户不存在" },
  USER_EMAIL_DUPLICATE:     { code: "USER_0002", httpStatus: 409, message: "邮箱已被注册" },
  USER_PASSWORD_INCORRECT:  { code: "USER_0003", httpStatus: 401, message: "密码错误" },

  // 订单模块 3xxx
  ORDER_NOT_FOUND:          { code: "ORDER_0001", httpStatus: 404, message: "订单不存在" },
  ORDER_INSUFFICIENT_STOCK: { code: "ORDER_0002", httpStatus: 409, message: "库存不足" },
  ORDER_STATUS_CONFLICT:    { code: "ORDER_0003", httpStatus: 409, message: "订单状态不允许此操作" },
};
\`\`\`

注册表的好处：
- 集中查询错误码含义
- 防止重复定义
- 配合自动化工具生成文档
- 便于监控告警按 code 聚合

### 4.4 错误码可扩展性

错误码设计要考虑未来扩展：

**预留空间**：每个模块预留一定的码段：

\`\`\`
USER_0001 ~ USER_0999: 已知错误
USER_1000+: 预留给未来
\`\`\`

**版本兼容**：错误码一旦发布就不要修改含义，只能新增：

\`\`\`
// 错误：把 USER_0001 的含义从"用户不存在"改为"用户被禁用"
// 正确：新增 USER_0004 表示"用户被禁用"
\`\`\`

**废弃流程**：废弃的错误码也要保留：

\`\`\`
USER_0001: 用户不存在  // 当前使用
USER_0002: 邮箱重复    // @deprecated 已废弃，改用 USER_0005
USER_0005: 邮箱已注册  // 新版本
\`\`\`

## 五、错误处理分层

后端应用通常分为 Controller / Service / DAO 三层，每层的错误处理职责不同。

### 5.1 DAO 层错误处理

DAO 层负责与数据库/外部服务交互，错误类型主要是技术性错误：

- 数据库连接失败
- 唯一约束冲突
- 超时
- SQL 语法错误

处理策略：**抛出技术异常，不转换成业务异常**。

\`\`\`javascript
class UserDao {
  async findById(id) {
    try {
      const result = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      return result[0];
    } catch (err) {
      // 包装成技术异常，附加上下文
      throw new DatabaseError('查询用户失败', {
        cause: err,
        context: { id, sql: 'SELECT * FROM users WHERE id = ?' }
      });
    }
  }
}
\`\`\`

### 5.2 Service 层错误处理

Service 层是业务逻辑核心，错误类型主要是业务错误：

- 用户不存在
- 余额不足
- 状态不允许

处理策略：**抛出业务异常，附带业务错误码**。

\`\`\`javascript
class OrderService {
  async createOrder(userId, items) {
    const user = await userDao.findById(userId);
    if (!user) {
      throw new BusinessError('USER_NOT_FOUND');
    }

    for (const item of items) {
      const stock = await stockDao.getStock(item.sku);
      if (stock < item.quantity) {
        throw new BusinessError('ORDER_INSUFFICIENT_STOCK', {
          details: { sku: item.sku, requested: item.quantity, available: stock }
        });
      }
    }
    // ... 创建订单
  }
}
\`\`\`

### 5.3 Controller 层错误处理

Controller 层是 HTTP 入口，职责：

- 接收请求，校验基础格式
- 调用 Service
- 将 Service 抛出的业务异常转换成 HTTP 响应
- 将技术异常转换成 500 响应（不泄露堆栈）

\`\`\`javascript
class OrderController {
  async create(req, res) {
    try {
      const order = await orderService.createOrder(req.body.userId, req.body.items);
      res.status(201).json({ success: true, data: order });
    } catch (err) {
      // 业务异常 → 4xx
      if (err instanceof BusinessError) {
        const def = ErrorCodes[err.code];
        res.status(def.httpStatus).json({
          success: false,
          code: def.code,
          message: err.message || def.message,
          details: err.details,
          traceId: req.traceId
        });
        return;
      }
      // 技术异常 → 500
      logger.error('创建订单失败', { traceId: req.traceId, err });
      res.status(500).json({
        success: false,
        code: 'COMMON_0001',
        message: '系统内部错误',
        traceId: req.traceId
      });
    }
  }
}
\`\`\`

### 5.4 全局异常处理器

每个 Controller 都写 try-catch 太重复。最佳实践是使用全局异常处理器（中间件/拦截器）：

\`\`\`javascript
// Express 风格
app.use((err, req, res, next) => {
  const traceId = req.traceId || generateTraceId();

  if (err instanceof AppError) {
    // 业务异常
    const def = ErrorCodes[err.code];
    res.status(def.httpStatus).json({
      success: false,
      code: def.code,
      message: err.message,
      details: err.details,
      traceId
    });
    return;
  }

  // 未捕获异常
  logger.error('Unhandled error', { traceId, err });
  res.status(500).json({
    success: false,
    code: 'COMMON_0001',
    message: '系统内部错误',
    traceId
  });
});
\`\`\`

全局异常处理器的好处：
- 集中处理，避免重复代码
- 统一响应格式
- 易于扩展（如新增错误类型处理）
- 保证所有异常都被处理（包括未预期的）

## 六、异常处理最佳实践

### 6.1 不吞异常

反模式：

\`\`\`javascript
try {
  await doSomething();
} catch (e) {
  // 什么都不做
}
\`\`\`

问题：异常被吞掉，问题永远不会被发现。即使不向上抛出，也至少要记录日志。

正确做法：

\`\`\`javascript
try {
  await doSomething();
} catch (e) {
  logger.warn('doSomething 失败，使用降级逻辑', { err });
  // 降级处理或忽略，但要有意识地决定
}
\`\`\`

### 6.2 不暴露堆栈

生产环境绝不向客户端返回堆栈信息：

\`\`\`json
{
  "code": "COMMON_0001",
  "message": "系统内部错误",
  "stack": "TypeError: Cannot read property 'id' of undefined\\n    at UserService.findById (/app/service.js:42:23)\\n    at ..."
}
\`\`\`

问题：
- 泄露技术栈和代码结构，便于攻击
- 客户端无法处理堆栈
- 不专业

正确做法：堆栈只记录到日志，响应只返回友好消息。

### 6.3 记录日志

异常发生时应该记录日志，且不同级别：

- **业务异常**（4xx）：INFO 或 WARN 级别，记录 code、message、details
- **技术异常**（5xx）：ERROR 级别，记录完整堆栈、请求上下文
- **致命错误**：FATAL 级别，触发告警

\`\`\`javascript
if (err instanceof BusinessError) {
  logger.info('业务异常', { code: err.code, message: err.message, traceId });
} else {
  logger.error('系统异常', { err, traceId, req: { url, method, body } });
}
\`\`\`

### 6.4 友好提示

message 字段要面向用户，不是面向开发者：

| 错误的开发者描述 | 错误的用户提示 |
|------------------|----------------|
| \`TypeError: Cannot read property 'id' of undefined\` | 系统繁忙，请稍后重试 |
| \`ECONNREFUSED 127.0.0.1:3306\` | 系统繁忙，请稍后重试 |
| \`UNIQUE constraint failed: users.email\` | 该邮箱已被注册 |
| \`JWT expired\` | 登录已过期，请重新登录 |

### 6.5 区分错误类型

不要用单一 try-catch 处理所有错误：

\`\`\`javascript
// 反模式
try {
  await Promise.all([
    fetchUser(),
    fetchOrder(),
    sendEmail()
  ]);
} catch (e) {
  // 不区分哪个失败，怎么处理？
}

// 正确
try {
  const [user, order] = await Promise.all([
    fetchUser().catch(e => { throw new WrappedError('FETCH_USER_FAILED', e); }),
    fetchOrder().catch(e => { throw new WrappedError('FETCH_ORDER_FAILED', e); })
  ]);
  await sendEmail().catch(e => logger.warn('邮件发送失败', { e }));
} catch (e) {
  if (e.code === 'FETCH_USER_FAILED') { ... }
}
\`\`\`

### 6.6 异步错误处理

Node.js 中异步错误容易被忽略：

\`\`\`javascript
// 反模式：Promise 错误未捕获
doSomethingAsync().then(result => {
  // ...
});
// 这里如果 doSomethingAsync 抛错，会变成 UnhandledPromiseRejection

// 正确：要么 catch，要么 await
try {
  const result = await doSomethingAsync();
} catch (e) { ... }

// 或者
doSomethingAsync().then(...).catch(...);
\`\`\`

监听 unhandledRejection 和 uncaughtException：

\`\`\`javascript
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { err });
  // 推荐重启进程，因为状态可能已损坏
  process.exit(1);
});
\`\`\`

## 七、错误处理反模式

### 7.1 200 包错误码

最常见的反模式：

\`\`\`json
HTTP/1.1 200 OK

{"success": false, "code": 500, "message": "服务器错误"}
\`\`\`

问题：
- HTTP 语义被破坏
- 监控告警按状态码统计会漏掉这些"假成功"
- 网关/CDN 不会重试
- 客户端无法用标准 HTTP 库判断成功失败

什么时候可以接受 200 包错误码？
- GraphQL（设计如此，所有错误都返回 200，错误在 response.errors 数组中）
- 某些 RPC 框架的统一封装

但即使在这些场景，也应该尽量遵守 HTTP 语义。

### 7.2 堆栈泄露

详见 6.2。

### 7.3 不一致的错误格式

API 风格不统一：

\`\`\`json
// 接口 A
{"error": "user not found"}

// 接口 B
{"code": 404, "msg": "用户不存在"}

// 接口 C
{"success": false, "data": {"reason": "USER_NOT_FOUND"}}

// 接口 D
{"status": "error", "errorMessage": "..."}
\`\`\`

问题：客户端需要为每个接口写不同的错误处理逻辑。

解决：建立全公司统一的错误响应规范，强制所有 API 遵守。

### 7.4 错误码不可扩展

\`\`\`javascript
if (err.code === 'USER_NOT_FOUND') { ... }
else if (err.code === 'USER_001') { ... }
else if (err.code === 404) { ... }
\`\`\`

错误码风格混乱，难以维护。应该统一规范。

### 7.5 错误被层层包装丢失上下文

\`\`\`javascript
try {
  await serviceA();
} catch (e) {
  throw new Error('serviceA failed');  // 丢失了原始错误信息
}

// 正确：使用 cause 保留原始错误
try {
  await serviceA();
} catch (e) {
  throw new Error('serviceA failed', { cause: e });
}
\`\`\`

### 7.6 静默失败

\`\`\`javascript
async function sendNotification(userId, message) {
  try {
    await emailService.send(userId, message);
  } catch (e) {
    // 静默失败，用户永远不知道通知没发出去
  }
}
\`\`\`

问题：错误被吞掉，无法监控，问题积累到爆发时已是大事。

正确：至少记录日志，关键操作还要有重试或告警。

## 八、多语言异常处理对照

### 8.1 Java try-catch

\`\`\`java
public class OrderService {
  public Order createOrder(Long userId, List<Item> items) throws BusinessException {
    try {
      User user = userDao.findById(userId);
      if (user == null) {
        throw new BusinessException(ErrorCode.USER_NOT_FOUND);
      }
      return orderDao.create(user, items);
    } catch (SQLException e) {
      throw new SystemException("数据库异常", e);
    } finally {
      // 释放资源
    }
  }
}

// 全局异常处理（Spring）
@ControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<ErrorResponse> handle(BusinessException e) {
    return ResponseEntity.status(e.getHttpStatus())
      .body(new ErrorResponse(e.getCode(), e.getMessage()));
  }
}
\`\`\`

特点：受检异常（checked exception）强制声明/处理，运行时异常不强制。

### 8.2 Go error

Go 没有 try-catch，错误是值：

\`\`\`go
func CreateUser(req *CreateUserReq) (*User, error) {
  if req.Email == "" {
    return nil, NewBizError("VALIDATION_FAILED", "邮箱不能为空")
  }
  user, err := userDao.FindByEmail(req.Email)
  if err != nil {
    return nil, fmt.Errorf("查询用户失败: %w", err)
  }
  if user != nil {
    return nil, NewBizError("USER_EXISTS", "邮箱已注册")
  }
  return userDao.Create(req)
}

// 调用方
user, err := CreateUser(req)
if err != nil {
  if bizErr, ok := err.(*BizError); ok {
    return bizErr.HTTPStatus(), bizErr.ToResponse()
  }
  return 500, InternalErrorResponse(err)
}
\`\`\`

特点：错误通过返回值传递，必须显式检查，\`%w\` 包装保留原始错误。

### 8.3 Python exception

\`\`\`python
class BusinessError(Exception):
  def __init__(self, code: str, message: str, details: dict = None):
    self.code = code
    self.message = message
    self.details = details or {}
    super().__init__(message)

def create_order(user_id: int, items: list):
  try:
    user = user_dao.find_by_id(user_id)
    if not user:
      raise BusinessError("USER_NOT_FOUND", "用户不存在")
    return order_dao.create(user, items)
  except DatabaseError as e:
    logger.exception("数据库异常")
    raise SystemError("系统内部错误") from e

# 全局异常处理（FastAPI）
@app.exception_handler(BusinessError)
async def business_error_handler(request, exc):
  return JSONResponse(
    status_code=ERROR_CODES[exc.code].http_status,
    content={"success": False, "code": exc.code, "message": exc.message}
  )
\`\`\`

特点：异常类继承体系，\`raise ... from ...\` 保留原因链。

### 8.4 Node.js try-catch + Promise

\`\`\`javascript
class BusinessError extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

async function createOrder(userId, items) {
  try {
    const user = await userDao.findById(userId);
    if (!user) {
      throw new BusinessError('USER_NOT_FOUND', '用户不存在');
    }
    return await orderDao.create(user, items);
  } catch (err) {
    if (err instanceof BusinessError) throw err;
    throw new SystemError('系统内部错误', { cause: err });
  }
}

// 全局中间件
app.use(async (err, req, res, next) => {
  if (err instanceof BusinessError) {
    res.status(err.httpStatus).json({ success: false, code: err.code, message: err.message });
  } else {
    logger.error(err);
    res.status(500).json({ success: false, code: 'INTERNAL_ERROR', message: '系统内部错误' });
  }
});
\`\`\`

特点：async/await + try-catch 处理同步和异步错误，Promise 链需要 .catch()。

### 8.5 四种语言对比

| 维度 | Java | Go | Python | Node.js |
|------|------|------|--------|---------|
| 错误传递方式 | 异常对象 | 返回值 | 异常对象 | 异常对象/Promise |
| 强制处理 | 受检异常强制 | 强制检查 err | 不强制 | 不强制 |
| 错误包装 | Throwable.cause | fmt.Errorf %w | raise from | Error.cause |
| 全局处理 | @ControllerAdvice | middleware | @app.exception_handler | middleware |
| 异步错误 | Future | error channel | async/await | Promise/async |

## 九、国际化错误消息

面向全球用户的 API 需要支持多语言错误消息。

### 9.1 基于 Accept-Language

客户端通过 Accept-Language 头声明语言偏好：

\`\`\`
GET /api/users/123
Accept-Language: zh-CN
\`\`\`

服务端根据该头返回对应语言的 message：

\`\`\`json
// zh-CN
{"code": "USER_NOT_FOUND", "message": "用户不存在"}

// en
{"code": "USER_NOT_FOUND", "message": "User not found"}

// ja
{"code": "USER_NOT_FOUND", "message": "ユーザーが見つかりません"}
\`\`\`

### 9.2 消息文件管理

\`\`\`javascript
// messages/zh-CN.json
{
  "USER_NOT_FOUND": "用户不存在",
  "USER_EMAIL_DUPLICATE": "邮箱已被注册",
  "ORDER_INSUFFICIENT_STOCK": "库存不足"
}

// messages/en.json
{
  "USER_NOT_FOUND": "User not found",
  "USER_EMAIL_DUPLICATE": "Email already registered",
  "ORDER_INSUFFICIENT_STOCK": "Insufficient stock"
}
\`\`\`

### 9.3 消息模板

带参数的错误消息：

\`\`\`javascript
// zh-CN.json
{
  "ORDER_INSUFFICIENT_STOCK": "库存不足，需要 {requested} 件，仅剩 {available} 件"
}

// 使用
const message = template(messages[code], { requested: 100, available: 3 });
// "库存不足，需要 100 件，仅剩 3 件"
\`\`\`

### 9.4 兜底策略

- 优先匹配 Accept-Language 指定的语言
- 退而求其次匹配主语言（zh-CN → zh）
- 最后用默认语言（通常英文）
- 实在没有就用错误码本身

### 9.5 code vs message 的国际化

注意：**code 永远不变，message 才需要国际化**。

\`\`\`
// 正确
code: "USER_NOT_FOUND"
message: "用户不存在" / "User not found" / "ユーザーが見つかりません"

// 错误：把 code 也翻译了
code: "用户不存在"  // 客户端怎么处理？
\`\`\`

## 十、错误与日志监控的关系

### 10.1 错误打点

每次错误发生都应该打点，便于监控聚合：

\`\`\`javascript
function handle(error) {
  metrics.increment('error.count', {
    code: error.code,
    type: error instanceof BusinessError ? 'business' : 'system',
    endpoint: req.path
  });
}
\`\`\`

### 10.2 告警规则

基于错误码和错误率设置告警：

- **业务错误告警**：某错误码 5 分钟内超过阈值（如 1000 次）
- **系统错误告警**：5xx 错误率超过 1% 立即告警
- **新错误告警**：出现未注册的新错误码立即告警
- **错误突增告警**：错误率突增（环比增长 100%）

### 10.3 错误看板

监控看板应该展示：
- 错误率趋势（按状态码分组）
- Top 10 错误码（按出现次数）
- 错误分布（按接口、按模块）
- 错误影响用户数
- 错误平均恢复时间（MTTR）

### 10.4 链路追踪

traceId 贯穿整个请求链路，便于关联日志：

\`\`\`
请求进入网关 → 生成 traceId=abc123
→ 网关记录日志（traceId=abc123）
→ 转发到订单服务，Header 传递 traceId
→ 订单服务记录日志（traceId=abc123）
→ 订单服务调用用户服务，传递 traceId
→ 用户服务记录日志（traceId=abc123）
→ 出错，响应中返回 traceId=abc123

开发者通过 traceId=abc123 在日志系统查询整个链路
\`\`\`

## 十一、错误处理框架实现思路

下面是实现统一错误处理框架的思路（完整代码见 code 字段）：

### 11.1 错误基类设计

\`\`\`javascript
class AppError extends Error {
  constructor(code, message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = options.details;
    this.cause = options.cause;
    this.timestamp = new Date().toISOString();
  }
}
\`\`\`

### 11.2 具体错误类型

继承 AppError，区分错误类别：

\`\`\`javascript
class ValidationError extends AppError { ... }
class NotFoundError extends AppError { ... }
class UnauthorizedError extends AppError { ... }
class BusinessError extends AppError { ... }
\`\`\`

### 11.3 错误码注册表

集中管理错误码与 HTTP 状态码、默认消息的映射。

### 11.4 全局错误中间件

统一捕获异常，分类处理，返回统一格式。

## 十二、生产实践补充

### 12.1 错误码命名规范

- 全大写 + 下划线分隔
- 模块前缀（USER/ORDER/PAYMENT）
- 语义化名称（NOT_FOUND/INSUFFICIENT_STOCK）
- 长度控制在 30 字符以内
- 避免数字编码（USER_001 不如 USER_NOT_FOUND）

### 12.2 错误处理的"白名单"原则

只对外暴露必要的错误信息：
- 业务错误：暴露 code、message、details
- 系统错误：只暴露"系统繁忙"通用消息，details 不返回
- 校验错误：暴露具体字段和原因

### 12.3 错误的可重试性

响应中可以告知客户端是否可重试：

\`\`\`json
{
  "code": "RATE_LIMITED",
  "message": "请求过于频繁",
  "retryable": true,
  "retryAfter": 60
}
\`\`\`

\`\`\`json
{
  "code": "VALIDATION_FAILED",
  "message": "邮箱格式错误",
  "retryable": false
}
\`\`\`

### 12.4 错误的幂等性

对于幂等性 API（如支付），错误响应后客户端重试不会造成重复扣款。但对于非幂等 API（如转账），错误后重试可能导致重复操作，需要在响应中提示：

\`\`\`json
{
  "code": "PAYMENT_TIMEOUT",
  "message": "支付超时，请勿重复提交，请查询订单状态",
  "idempotent": false,
  "queryUrl": "/api/orders/12345/payment-status"
}
\`\`\`

### 12.5 错误的"分类标签"

为了便于监控聚合，可以给错误打标签：

\`\`\`javascript
{
  code: "PAYMENT_GATEWAY_TIMEOUT",
  category: "DEPENDENCY_ERROR",  // 业务错误/系统错误/依赖错误
  severity: "HIGH",              // 错误严重程度
  affectedService: "alipay"      // 受影响的服务
}
\`\`\`

## 十三、面试常见问题

**Q1：401 和 403 的区别？**
A：401 是"未认证"（不知道你是谁），403 是"已认证但无权限"（知道你是谁但不能做）。

**Q2：用 200 包错误码有什么问题？**
A：破坏 HTTP 语义，监控按状态码统计失效，网关不会重试，客户端无法用标准库判断。

**Q3：错误处理应该在哪一层做？**
A：DAO 层抛技术异常，Service 层抛业务异常，Controller 层（或全局中间件）统一转换成 HTTP 响应。

**Q4：如何设计错误码？**
A：模块前缀 + 语义化名称，集中管理，预留扩展空间，废弃不删除，含义不可修改。

**Q5：如何防止堆栈泄露？**
A：全局错误处理中间件过滤，生产环境不返回 stack 字段，只记录到日志。

## 十四、错误处理进阶实践

### 14.1 错误码的版本演进与迁移

随着业务发展，错误码体系也需要演进。错误的演进策略直接关系到客户端兼容性。

**演进原则**：
- 已发布的错误码**永不修改含义**（与 API 兼容性原则一致）
- 新增错误码走"灰度发布"，先在文档中预告
- 废弃错误码标记 \`@deprecated\` 但保留至少 6 个月
- 重大变更需配套客户端 SDK 升级

**迁移示例**：

\`\`\`
v1 错误码：USER_001（含义模糊，"用户错误"）
  ↓ 拆分为
v2 错误码：
  USER_NOT_FOUND（404）
  USER_DISABLED（403）
  USER_EMAIL_DUPLICATE（409）

迁移期：v1 和 v2 并存 6 个月
  ↓
下线：v1 错误码返回 v2 等价码，记录 deprecation 日志
\`\`\`

**多版本并存策略**：

\`\`\`javascript
function mapErrorCode(code, apiVersion) {
  if (apiVersion === 'v1') {
    // v1 客户端只能理解旧码，做反向映射
    const v1Map = {
      'USER_NOT_FOUND': 'USER_001',
      'USER_DISABLED': 'USER_001',
      'USER_EMAIL_DUPLICATE': 'USER_001',
    };
    return v1Map[code] || code;
  }
  return code;  // v2+ 直接返回新码
}
\`\`\`

### 14.2 错误处理与 API 网关

API 网关是错误处理的"统一出口"，承担以下职责：

**职责 1：统一错误格式**

后端各服务可能用不同的错误格式（Spring 默认格式、Express 默认格式、自定义格式），网关统一改写：

\`\`\`javascript
// 网关中间件
async function normalizeError(ctx, next) {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || '系统内部错误',
      traceId: ctx.traceId,
      timestamp: new Date().toISOString()
    };
  }
}
\`\`\`

**职责 2：错误聚合与限流**

网关可以基于错误码做聚合统计，触发限流：

- 某上游 5 分钟内 5xx 比例 > 50% → 触发熔断
- 某客户端 5 分钟内 4xx 次数 > 1000 → 触发限流
- 某错误码突增 → 触发告警

**职责 3：错误码映射**

不同后端服务的错误码可能冲突（user 服务和 order 服务都有 \`NOT_FOUND\`），网关加前缀隔离：

\`\`\`
user-service 返回 NOT_FOUND → 网关改写为 USER_NOT_FOUND
order-service 返回 NOT_FOUND → 网关改写为 ORDER_NOT_FOUND
\`\`\`

**职责 4：敏感信息过滤**

网关作为最后一道防线，过滤响应中的敏感信息：

- 移除 \`stack\` 字段
- 移除 \`internalMessage\` 字段
- 移除数据库错误细节

### 14.3 错误码文档自动化

错误码应该有专门的文档，且能自动化生成。

**方案 1：错误码注册表生成文档**

\`\`\`javascript
// 从 ErrorCodes 注册表生成 Markdown 文档
function generateErrorDoc() {
  let md = '# 错误码文档\\n\\n';
  md += '| code | HTTP | message | 模块 |\\n';
  md += '|------|------|---------|------|\\n';
  for (const [key, def] of Object.entries(ErrorCodes)) {
    const module = def.code.split('_')[0];
    md += \`| \${def.code} | \${def.httpStatus} | \${def.message} | \${module} |\\n\`;
  }
  return md;
}
\`\`\`

**方案 2：OpenAPI 集成**

在 OpenAPI 的 responses 中列出所有可能的错误码：

\`\`\`yaml
paths:
  /users/{id}:
    get:
      responses:
        '200':
          description: 用户信息
        '404':
          description: 用户不存在
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: 未认证
\`\`\`

**方案 3：错误码 CHANGELOG**

每次错误码变更都要记录到 CHANGELOG：

\`\`\`
## [2026-06-27]
### Added
- USER_DISABLED: 用户被禁用（403）
- ORDER_PAYMENT_TIMEOUT: 订单支付超时（409）

### Deprecated
- USER_001: 含义模糊，将拆分为 USER_NOT_FOUND / USER_DISABLED

### Removed
- 无
\`\`\`

### 14.4 多机房错误处理一致性

多机房部署时，错误码和错误格式必须保持一致，否则监控告警和客户端处理会混乱。

**问题场景**：
- 机房 A 的 user 服务返回 \`USER_NOT_FOUND\`，机房 B 返回 \`USER_001\` → 客户端无法统一处理
- 机房 A 用英文 message，机房 B 用中文 → 用户体验不一致

**解决策略**：
- 错误码注册表存配置中心，所有机房共享
- 错误消息模板统一管理，多语言文案集中维护
- 跨机房错误码冲突检测（CI 流程自动检查）
- 灰度发布新错误码时，所有机房同步推进

### 14.5 灰度发布中的错误处理

灰度发布新版本时，错误处理需要特别注意：

**问题**：新版本可能引入新错误码，灰度期间客户端可能收到两种格式的错误。

**策略**：
- 新错误码先在文档中"预告"，标注"即将上线"
- 灰度期间监控新错误码出现频率，异常时回滚
- 客户端 SDK 配置 \`unknownCodeFallback\`，遇到未知错误码时降级处理

\`\`\`javascript
// 客户端 SDK 兜底
function handleError(response) {
  const knownCodes = ['USER_NOT_FOUND', 'VALIDATION_FAILED', ...];
  if (!knownCodes.includes(response.code)) {
    // 未知错误码，降级为通用错误
    return { ...response, code: 'UNKNOWN', message: '系统繁忙' };
  }
  return response;
}
\`\`\`

### 14.6 错误处理的测试策略

错误处理代码本身需要测试，否则线上故障时才发现错误处理失效。

**测试类型 1：单元测试**

\`\`\`javascript
describe('OrderService', () => {
  it('用户不存在时应抛出 NotFoundError', async () => {
    await expect(orderService.createOrder(999, []))
      .rejects.toThrow(NotFoundError);
  });

  it('库存不足时应抛出 BusinessError', async () => {
    await expect(orderService.createOrder(1, [{sku: 'OOS', quantity: 100}]))
      .rejects.toMatchObject({ code: 'ORDER_INSUFFICIENT_STOCK' });
  });
});
\`\`\`

**测试类型 2：集成测试**

\`\`\`javascript
describe('POST /api/orders', () => {
  it('未登录应返回 401', async () => {
    const res = await request(app).post('/api/orders').send({...});
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('COMMON_0003');
  });

  it('参数错误应返回 422 + details', async () => {
    const res = await request(app).post('/api/orders').send({ items: [] });
    expect(res.status).toBe(422);
    expect(res.body.details.errors).toBeInstanceOf(Array);
  });
});
\`\`\`

**测试类型 3：故障注入测试**

模拟数据库故障、依赖服务超时，验证错误处理是否正确：

\`\`\`javascript
it('数据库故障时应返回 500 而非崩溃', async () => {
  // mock 数据库抛出异常
  userDao.findById.mockRejectedValue(new Error('DB down'));
  const res = await request(app).get('/api/users/1');
  expect(res.status).toBe(500);
  expect(res.body.code).toBe('COMMON_0001');
  expect(res.body.message).toBe('系统内部错误');
  expect(res.body.stack).toBeUndefined();  // 不泄露堆栈
});
\`\`\`

### 14.7 混沌工程与错误预案

混沌工程主动注入故障，验证错误处理的有效性。

**常见故障注入**：
- 杀掉数据库实例 → 验证降级策略
- 注入网络延迟 → 验证超时处理
- 注入网络分区 → 验证重试与熔断
- 注入磁盘满 → 验证日志失败处理
- 注入 CPU 飙高 → 验证限流触发

**错误预案**：

\`\`\`
预案 1：依赖服务挂了
  → 熔断 5 秒 → 降级返回缓存 → 5xx 告警

预案 2：数据库慢查询
  → 慢查询超时 3 秒 → 返回 504 → 慢查询告警

预案 3：Redis 不可用
  → 限流降级为本地限流 → Redis 告警

预案 4：下游服务返回非预期格式
  → 解析失败 → 包装为 INTERNAL_ERROR → 数据格式告警
\`\`\`

### 14.8 错误处理的成本考量

过度设计错误处理也是反模式：

**过度设计案例**：
- 为每个可能的错误定义专门的错误码（导致错误码爆炸）
- 在所有层都做错误转换（性能损耗）
- 错误响应包含过多字段（带宽浪费）

**合理设计原则**：
- 错误码数量控制在 100 以内（业界经验值）
- 错误转换只在必要的边界做（DAO→Service、Service→Controller）
- 错误响应字段不超过 6 个
- 通用错误用统一码（INTERNAL_ERROR），不细分

### 14.9 错误码与权限的协作

错误码可以携带权限信息，便于客户端做精细化处理：

\`\`\`json
{
  "code": "FORBIDDEN",
  "message": "无权访问该订单",
  "details": {
    "requiredPermission": "ORDER_VIEW",
    "currentPermissions": ["ORDER_LIST"],
    "upgradeUrl": "/api/permissions/apply?perm=ORDER_VIEW"
  }
}
\`\`\`

这种设计让客户端能引导用户去申请权限，而不是简单报错。

## 十五、本章小结

错误处理是后端工程的"基础设施"，包括：

1. **HTTP 状态码语义**：严格遵守 2xx/4xx/5xx 的分类
2. **错误响应体**：code/message/details/traceId 四件套
3. **业务错误码**：模块前缀 + 语义化名称，集中注册
4. **分层处理**：DAO 抛技术异常，Service 抛业务异常，Controller 统一转换
5. **全局中间件**：集中处理，统一格式，避免重复
6. **最佳实践**：不吞异常、不泄露堆栈、记录日志、友好提示
7. **国际化**：code 不变，message 多语言
8. **监控告警**：错误打点、按 code 聚合、设置告警阈值

下一章我们将学习 CORS 跨域与安全头，这是 Web 安全的另一个重要主题。
`,
    code: `// 错误处理与状态码规范 - 统一错误处理框架
// 演示：错误基类、具体错误类型、错误码注册表、全局中间件、各种错误场景

// ============ 1. 错误码注册表 ============
const ErrorCodes = {
  // 通用错误
  INTERNAL_ERROR:           { code: 'COMMON_0001', httpStatus: 500, message: '系统内部错误' },
  VALIDATION_FAILED:        { code: 'COMMON_0002', httpStatus: 422, message: '参数校验失败' },
  UNAUTHORIZED:             { code: 'COMMON_0003', httpStatus: 401, message: '未登录或登录已过期' },
  FORBIDDEN:                { code: 'COMMON_0004', httpStatus: 403, message: '无权访问该资源' },
  NOT_FOUND:                { code: 'COMMON_0005', httpStatus: 404, message: '资源不存在' },
  RATE_LIMITED:             { code: 'COMMON_0006', httpStatus: 429, message: '请求过于频繁' },
  METHOD_NOT_ALLOWED:       { code: 'COMMON_0007', httpStatus: 405, message: '方法不允许' },

  // 用户模块
  USER_NOT_FOUND:           { code: 'USER_0001', httpStatus: 404, message: '用户不存在' },
  USER_EMAIL_DUPLICATE:     { code: 'USER_0002', httpStatus: 409, message: '邮箱已被注册' },
  USER_PASSWORD_INCORRECT:  { code: 'USER_0003', httpStatus: 401, message: '密码错误' },

  // 订单模块
  ORDER_NOT_FOUND:          { code: 'ORDER_0001', httpStatus: 404, message: '订单不存在' },
  ORDER_INSUFFICIENT_STOCK: { code: 'ORDER_0002', httpStatus: 409, message: '库存不足' },
  ORDER_STATUS_CONFLICT:    { code: 'ORDER_0003', httpStatus: 409, message: '订单状态不允许此操作' },
};

// ============ 2. 错误基类 ============
class AppError extends Error {
  constructor(code, message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = options.details;
    this.cause = options.cause;
    this.timestamp = new Date().toISOString();
    this.traceId = options.traceId || generateTraceId();
  }
  // 转换为响应对象
  toResponse() {
    const def = ErrorCodes[this.code] || ErrorCodes.INTERNAL_ERROR;
    return {
      success: false,
      code: def.code,
      message: this.message || def.message,
      details: this.details,
      traceId: this.traceId,
      timestamp: this.timestamp,
    };
  }
  get httpStatus() {
    const def = ErrorCodes[this.code] || ErrorCodes.INTERNAL_ERROR;
    return def.httpStatus;
  }
}

// ============ 3. 具体错误类型 ============
class ValidationError extends AppError {
  constructor(field, rule, value, message) {
    super('VALIDATION_FAILED', message || \`字段校验失败\`, {
      details: { errors: [{ field, rule, value, message }] }
    });
  }
}

class NotFoundError extends AppError {
  constructor(resource, id) {
    super('NOT_FOUND', \`\${resource}不存在\`, {
      details: { resource, id }
    });
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super('UNAUTHORIZED', message || '请先登录');
  }
}

class ForbiddenError extends AppError {
  constructor(message) {
    super('FORBIDDEN', message || '无权访问');
  }
}

class BusinessError extends AppError {
  constructor(code, message, details) {
    super(code, message, { details });
  }
}

// ============ 4. 工具函数 ============
let counter = 0;
function generateTraceId() {
  counter += 1;
  return \`trace-\${Date.now().toString(36)}-\${counter.toString(36)}\`;
}

function logError(level, error) {
  const time = new Date().toISOString();
  console.log(\`[\${time}] [\${level}] [traceId=\${error.traceId}] \${error.code}: \${error.message}\`);
  if (level === 'ERROR' && error.cause) {
    console.log('  原始错误:', error.cause.message || String(error.cause));
  }
}

// ============ 5. 全局错误处理中间件（模拟 Express） ============
function errorHandler(err, req) {
  if (err instanceof AppError) {
    // 业务异常 → 4xx
    if (err instanceof ValidationError) logError('WARN', err);
    else if (err.code === 'INTERNAL_ERROR') logError('ERROR', err);
    else logError('INFO', err);
    return { status: err.httpStatus, body: err.toResponse() };
  }
  // 未预期的异常 → 500
  const wrapped = new AppError('INTERNAL_ERROR', '系统内部错误', {
    cause: err, traceId: req?.traceId
  });
  logError('ERROR', wrapped);
  return { status: 500, body: wrapped.toResponse() };
}

// ============ 6. 模拟业务场景 ============
// 用户服务
class UserService {
  async findById(id) {
    if (id === 0) throw new Error('数据库连接失败'); // 模拟系统错误
    const users = { 1: { id: 1, name: '张三', email: 'zhangsan@test.com' } };
    return users[id] || null;
  }
  async findByEmail(email) {
    const existing = ['zhangsan@test.com', 'admin@test.com'];
    return existing.includes(email);
  }
}

// 订单服务
class OrderService {
  constructor() { this.stock = { 'SKU-001': 10, 'SKU-002': 0 }; }
  async createOrder(userId, items) {
    const userService = new UserService();
    const user = await userService.findById(userId);
    if (!user) throw new NotFoundError('用户', userId);

    for (const item of items) {
      const stock = this.stock[item.sku] ?? 0;
      if (stock < item.quantity) {
        throw new BusinessError('ORDER_INSUFFICIENT_STOCK', '库存不足', {
          sku: item.sku, requested: item.quantity, available: stock
        });
      }
    }
    return { orderId: 'ORD-' + Date.now(), userId, items };
  }
}

// ============ 7. 演示场景 ============
async function demo() {
  console.log('===== 错误处理框架演示 =====\\n');

  // 场景 1：参数校验失败 (422)
  console.log('--- 场景 1: 参数校验失败 ---');
  try {
    throw new ValidationError('email', 'format', 'abc', '邮箱格式不正确');
  } catch (e) {
    const r = errorHandler(e, { traceId: 'req-001' });
    console.log('HTTP', r.status, JSON.stringify(r.body, null, 2));
  }

  // 场景 2：用户不存在 (404)
  console.log('\\n--- 场景 2: 用户不存在 ---');
  try {
    throw new NotFoundError('用户', 999);
  } catch (e) {
    const r = errorHandler(e, { traceId: 'req-002' });
    console.log('HTTP', r.status, JSON.stringify(r.body, null, 2));
  }

  // 场景 3：未登录 (401)
  console.log('\\n--- 场景 3: 未登录 ---');
  try {
    throw new UnauthorizedError('请先登录');
  } catch (e) {
    const r = errorHandler(e, { traceId: 'req-003' });
    console.log('HTTP', r.status, JSON.stringify(r.body, null, 2));
  }

  // 场景 4：业务异常 - 库存不足 (409)
  console.log('\\n--- 场景 4: 库存不足 ---');
  const orderService = new OrderService();
  try {
    await orderService.createOrder(1, [{ sku: 'SKU-002', quantity: 5 }]);
  } catch (e) {
    const r = errorHandler(e, { traceId: 'req-004' });
    console.log('HTTP', r.status, JSON.stringify(r.body, null, 2));
  }

  // 场景 5：系统错误 (500)
  console.log('\\n--- 场景 5: 数据库连接失败 ---');
  try {
    await orderService.createOrder(0, [{ sku: 'SKU-001', quantity: 1 }]);
  } catch (e) {
    const r = errorHandler(e, { traceId: 'req-005' });
    console.log('HTTP', r.status, JSON.stringify(r.body, null, 2));
  }

  // 场景 6：成功响应
  console.log('\\n--- 场景 6: 成功创建订单 ---');
  try {
    const order = await orderService.createOrder(1, [{ sku: 'SKU-001', quantity: 2 }]);
    console.log('HTTP 201', JSON.stringify({ success: true, data: order }, null, 2));
  } catch (e) {
    const r = errorHandler(e, { traceId: 'req-006' });
    console.log('HTTP', r.status, JSON.stringify(r.body, null, 2));
  }

  // 场景 7：未捕获异常
  console.log('\\n--- 场景 7: 未捕获异常 ---');
  try {
    null.id;  // TypeError
  } catch (e) {
    const r = errorHandler(e, { traceId: 'req-007' });
    console.log('HTTP', r.status, JSON.stringify(r.body, null, 2));
  }

  console.log('\\n===== 演示结束 =====');
}

demo().catch(e => console.error('未捕获:', e));
`,
  },
  // __APPEND_CHAPTERS_HERE__
  {
    id: "backend-cors",
    group: "API 设计与架构",
    icon: "🔒",
    title: "CORS 跨域与安全头",
    content: `# CORS 跨域与安全头

> 现代前端SPA + 后端API的分离架构下，跨域请求是绕不开的话题。CORS（跨源资源共享）机制决定了浏览器是否允许 JS 代码跨域访问 API；而 HTTP 安全响应头则从浏览器层面为应用加固防线。本章系统讲解同源策略、CORS 完整流程、跨域方案对比、安全头配置、Cookie 跨域、CSRF 防护等核心知识，帮助你彻底理解前端跨域和 Web 安全的工程实践。

## 一、同源策略与跨域问题

### 1.1 什么是同源策略

同源策略（Same-Origin Policy，SOP）是浏览器最核心的安全机制，由 Netscape 在 1995 年引入。它规定：**脚本只能访问与当前文档同源的资源**。

"同源"的三要素：
- **协议（Scheme）**：http vs https
- **主机（Host）**：api.example.com vs www.example.com
- **端口（Port）**：80 vs 8080

三者完全相同才算同源，任何一个不同就是跨源（Cross-Origin）。

**示例对比**：

| 当前页面 URL | 目标 URL | 是否同源 | 原因 |
|--------------|----------|----------|------|
| http://a.com/page | http://a.com/api | 是 | 协议/主机/端口都相同 |
| http://a.com/page | https://a.com/api | 否 | 协议不同 |
| http://a.com/page | http://b.com/api | 否 | 主机不同 |
| http://a.com/page | http://a.com:8080/api | 否 | 端口不同 |
| http://a.com/page | http://a.com.cn/api | 否 | 主机不同（不是后缀匹配） |

### 1.2 同源策略的限制范围

同源策略限制三类操作：

**1. DOM 访问限制**

\`\`\`javascript
// 假设页面嵌入了不同源的 iframe
const iframe = document.getElementById('cross');
iframe.contentWindow.document;  // SecurityError
iframe.contentDocument;          // SecurityError
\`\`\`

但同源 iframe 可以互相访问 DOM。

**2. Cookie / Storage 隔离**

不同源的页面无法互相读取 Cookie、LocalStorage、IndexedDB。

**3. AJAX 请求限制**

\`\`\`javascript
// 浏览器允许发出请求，但阻止 JS 读取响应
fetch('https://other-origin.com/api')
  .then(res => res.json())
  .catch(err => console.log('CORS 错误', err));  // 触发 CORS 错误
\`\`\`

注意：浏览器**会发出请求**（GET 类），但**会阻止 JS 读取响应**，除非服务端返回正确的 CORS 头。

### 1.3 为什么需要同源策略

如果没有同源策略，恶意网站可以：

- **窃取用户数据**：用户登录银行后访问恶意网站，恶意网站的 JS 可以用 Cookie 调用银行 API 转账
- **窃取页面内容**：恶意网站用 iframe 嵌入银行页面，读取用户余额
- **伪造用户操作**：恶意网站代替用户向其他网站发起请求

同源策略是浏览器的"防火墙"，但也给前后端分离开发带来了跨域问题。

### 1.4 跨域的常见场景

- 前端 \`http://www.example.com\`，API \`http://api.example.com\`（子域不同）
- 前端 \`http://localhost:3000\`，API \`http://localhost:8080\`（端口不同）
- 前端 \`http://\`，API \`https://\`（协议不同）
- 前端 CDN 托管，API 独立域名

这些场景都需要解决跨域问题。

## 二、CORS 机制详解

### 2.1 CORS 是什么

CORS（Cross-Origin Resource Sharing，跨源资源共享）是 W3C 标准，**让服务端声明哪些外部源可以访问自己的资源**。它通过 HTTP 头部协商，让浏览器在保持同源策略的前提下，有控制地放行跨源请求。

CORS 是 SOP 的"补充机制"：服务端主动授权，浏览器才放行。

### 2.2 简单请求 vs 预检请求

CORS 把跨源请求分为两类：**简单请求**和**预检请求**。

#### 简单请求

满足以下**所有条件**才是简单请求：

1. 方法是 GET / HEAD / POST 之一
2. 除了浏览器自动设置的头，自定义头只能是：Accept、Accept-Language、Content-Language、Content-Type
3. Content-Type 只能是：application/x-www-form-urlencoded、multipart/form-data、text/plain
4. 请求中没有 ReadableStream 对象
5. XMLHttpRequest.upload 没有事件监听

简单请求流程：

\`\`\`
浏览器                         服务端
  |                              |
  |  GET /api/users              |
  |  Origin: http://a.com        |
  |----------------------------->|
  |                              |
  |  200 OK                      |
  |  Access-Control-Allow-Origin:|
  |    http://a.com              |
  |<-----------------------------|
  |                              |
  |  浏览器检查 Origin 匹配，    |
  |  放行 JS 读取响应            |
\`\`\`

#### 预检请求

不满足简单请求条件的，浏览器会先发一个 OPTIONS 预检请求，确认服务端是否允许。

触发预检的条件：
- 方法不是 GET / HEAD / POST
- 自定义头（如 Authorization、X-Token）
- Content-Type 是 application/json
- 等等

预检请求流程：

\`\`\`
浏览器                         服务端
  |                              |
  |  OPTIONS /api/users (预检)   |
  |  Origin: http://a.com        |
  |  Access-Control-Request-     |
  |    Method: PUT               |
  |  Access-Control-Request-     |
  |    Headers: Authorization    |
  |----------------------------->|
  |                              |
  |  200 OK (预检响应)           |
  |  Access-Control-Allow-Origin:|
  |    http://a.com              |
  |  Access-Control-Allow-       |
  |    Methods: GET,PUT,DELETE   |
  |  Access-Control-Allow-       |
  |    Headers: Authorization    |
  |  Access-Control-Max-Age:     |
  |    3600                      |
  |<-----------------------------|
  |                              |
  |  PUT /api/users (真实请求)   |
  |  Origin: http://a.com        |
  |  Authorization: Bearer xxx   |
  |----------------------------->|
  |                              |
  |  200 OK                      |
  |  Access-Control-Allow-Origin:|
  |    http://a.com              |
  |<-----------------------------|
\`\`\`

### 2.3 CORS 响应头详解

#### Access-Control-Allow-Origin

**必填**。指定允许访问的源。

\`\`\`
Access-Control-Allow-Origin: http://a.com
\`\`\`

或者用 \`*\` 允许所有源（但与 Credentials 不兼容）：

\`\`\`
Access-Control-Allow-Origin: *
\`\`\`

注意：如果要携带 Cookie（withCredentials），**不能用 \`*\`**，必须指定具体源。

#### Access-Control-Allow-Methods

预检请求响应中，列出允许的方法：

\`\`\`
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
\`\`\`

#### Access-Control-Allow-Headers

预检请求响应中，列出允许的自定义请求头：

\`\`\`
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
\`\`\`

#### Access-Control-Expose-Headers

告诉浏览器哪些响应头可以被 JS 读取（默认只能读 Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma）：

\`\`\`
Access-Control-Expose-Headers: X-Total-Count, X-Request-Id
\`\`\`

这样前端可以读 \`response.headers.get('X-Total-Count')\`。

#### Access-Control-Max-Age

预检请求的缓存时间（秒）。缓存期内不会重复发预检：

\`\`\`
Access-Control-Max-Age: 3600
\`\`\`

浏览器实际缓存时间通常有上限（Chrome 最大 7200 秒，Firefox 最大 86400 秒）。

#### Access-Control-Allow-Credentials

是否允许携带 Cookie：

\`\`\`
Access-Control-Allow-Credentials: true
\`\`\`

如果设为 true：
- \`Access-Control-Allow-Origin\` 不能是 \`*\`
- 前端 fetch 必须设 \`credentials: 'include'\`
- XMLHttpRequest 必须设 \`xhr.withCredentials = true\`

### 2.4 CORS 请求头

#### Origin

浏览器自动添加，标识请求来源：

\`\`\`
Origin: http://a.com
\`\`\`

#### Access-Control-Request-Method

预检请求中，告知服务端真实请求将用的方法：

\`\`\`
Access-Control-Request-Method: PUT
\`\`\`

#### Access-Control-Request-Headers

预检请求中，告知服务端真实请求将携带的自定义头：

\`\`\`
Access-Control-Request-Headers: Authorization, Content-Type
\`\`\`

## 三、CORS 实战配置

### 3.1 Express 配置 CORS

\`\`\`javascript
const express = require('express');
const app = express();

// 简单配置
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.example.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '3600');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
\`\`\`

### 3.2 使用 cors 中间件

\`\`\`javascript
const cors = require('cors');

// 全局配置
app.use(cors({
  origin: ['https://www.example.com', 'https://admin.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 3600
}));

// 单个路由配置
app.get('/api/public', cors({ origin: '*' }), handler);
\`\`\`

### 3.3 动态白名单

\`\`\`javascript
const whitelist = ['https://www.example.com', 'https://admin.example.com'];

const corsOptions = {
  origin: (origin, callback) => {
    // 允许同源请求（origin 为 undefined）和 白名单源
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
\`\`\`

### 3.4 Spring Boot 配置 CORS

\`\`\`java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
      .allowedOrigins("https://www.example.com")
      .allowedMethods("GET", "POST", "PUT", "DELETE")
      .allowedHeaders("*")
      .allowCredentials(true)
      .maxAge(3600);
  }
}
\`\`\`

### 3.5 Nginx 配置 CORS

\`\`\`nginx
location /api/ {
  if ($request_method = 'OPTIONS') {
    add_header 'Access-Control-Allow-Origin' 'https://www.example.com';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE';
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
    add_header 'Access-Control-Max-Age' 3600;
    add_header 'Content-Type' 'text/plain; charset=utf-8';
    add_header 'Content-Length' 0;
    return 204;
  }
  add_header 'Access-Control-Allow-Origin' 'https://www.example.com';
  add_header 'Access-Control-Allow-Credentials' 'true';
  proxy_pass http://backend;
}
\`\`\`

## 四、跨域方案对比

CORS 不是唯一的跨域方案，根据场景选择最合适的方案。

### 4.1 方案对比表

| 方案 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| CORS | 现代浏览器跨域 AJAX | 标准方案，功能完整 | 旧浏览器不支持（IE9-） |
| 反向代理 | 前端同源访问后端 | 完全无跨域问题 | 需要 Nginx 配置 |
| JSONP | 仅 GET 跨域 | 兼容老浏览器 | 只支持 GET，有 XSS 风险 |
| PostMessage | 父子窗口通信 | 灵活 | 仅限窗口间 |
| WebSocket | 双向实时通信 | 无同源限制 | 需要后端支持 |

### 4.2 反向代理方案

最常见的"绕过"跨域方案：让 Nginx 把前端和 API 部署到同一域名下。

\`\`\`nginx
server {
  listen 80;
  server_name www.example.com;

  # 前端静态资源
  location / {
    root /var/www/frontend;
    try_files $uri $uri/ /index.html;
  }

  # API 反向代理到后端
  location /api/ {
    proxy_pass http://backend-server:8080/;
  }
}
\`\`\`

前端访问 \`/api/users\` 时，Nginx 转发到后端，浏览器看来都是同源，没有跨域问题。

**优点**：
- 完全无跨域问题
- 隐藏后端真实地址
- 便于统一加缓存、限流、日志

**缺点**：
- 前端和后端必须部署在同一域名下
- 跨多个不同后端时配置复杂

### 4.3 JSONP 方案

利用 \`<script>\` 标签不受同源策略限制的特性：

\`\`\`javascript
// 前端
function handleResponse(data) {
  console.log('收到数据:', data);
}

const script = document.createElement('script');
script.src = 'https://api.example.com/data?callback=handleResponse';
document.body.appendChild(script);
\`\`\`

\`\`\`javascript
// 后端
app.get('/data', (req, res) => {
  const data = { name: '张三', age: 18 };
  const callback = req.query.callback;
  res.send(\`\${callback}(\${JSON.stringify(data)})\`);
});
\`\`\`

**优点**：兼容 IE6+ 老浏览器。

**缺点**：
- 只支持 GET 请求
- 错误处理困难
- 有 XSS 风险（后端返回的代码会被执行）
- 已被 CORS 取代，不推荐新项目使用

### 4.4 PostMessage 方案

用于父子窗口（iframe、window.open）之间的跨域通信：

\`\`\`javascript
// 父页面（a.com）
const iframe = document.getElementById('child');
iframe.contentWindow.postMessage({ type: 'hello' }, 'https://b.com');

window.addEventListener('message', (e) => {
  if (e.origin !== 'https://b.com') return;  // 校验来源
  console.log('收到子页面消息:', e.data);
});
\`\`\`

\`\`\`javascript
// 子页面（b.com）
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://a.com') return;  // 校验来源
  console.log('收到父页面消息:', e.data);
  e.source.postMessage({ type: 'reply' }, e.origin);
});
\`\`\`

**安全要点**：必须校验 \`e.origin\`，否则可能被恶意页面利用。

### 4.5 WebSocket 方案

WebSocket 不受同源策略限制（但有 Origin 头供服务端校验）：

\`\`\`javascript
// 前端
const ws = new WebSocket('wss://api.example.com/ws');
ws.onopen = () => ws.send('hello');
ws.onmessage = (e) => console.log(e.data);
\`\`\`

\`\`\`javascript
// 后端
wss.on('connection', (ws, req) => {
  const origin = req.headers.origin;
  // 服务端可以校验 origin
  if (!isAllowedOrigin(origin)) {
    ws.close();
    return;
  }
  ws.on('message', (msg) => ws.send('echo: ' + msg));
});
\`\`\`

## 五、CORS 安全考虑

### 5.1 通配符 \`*\` 的风险

\`\`\`
Access-Control-Allow-Origin: *
\`\`\`

如果同时开启 \`Allow-Credentials: true\`，浏览器会拒绝（违反规范）。所以 \`*\` 只能用于"完全公开"的 API（无需 Cookie/鉴权）。

**反模式**：

\`\`\`javascript
// 错误：动态返回 Origin，等于允许所有源
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});
\`\`\`

这相当于 \`*\` + Credentials，任意网站都能携带用户 Cookie 访问你的 API，等于 CSRF 漏洞。

**正确做法**：白名单校验

\`\`\`javascript
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (whitelist.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    // Vary 头告诉缓存：响应因 Origin 而异
    res.setHeader('Vary', 'Origin');
  }
  next();
});
\`\`\`

### 5.2 Null Origin 的陷阱

某些场景下 Origin 是 \`null\`：
- file:// 协议
- data: 协议
- sandbox iframe
- 重定向跨源

\`\`\`
Origin: null
\`\`\`

不要把 \`null\` 加到白名单，否则恶意 sandbox iframe 可以攻击。

### 5.3 子域名通配符

CORS 不支持 \`*.example.com\` 这种通配符语法。要允许所有子域，需要正则匹配：

\`\`\`javascript
function isAllowedOrigin(origin) {
  return /^https?:\\/\\/([a-z0-9-]+\\.)?example\\.com$/.test(origin);
}
\`\`\`

但要小心：\`https://evil.example.com.attacker.com\` 也能匹配 \`.*example.com\`，必须用严格正则。

### 5.4 预检请求被绕过？

预检请求是浏览器行为，**非浏览器客户端（curl、Postman、移动 App）不会发预检**。所以预检不能作为安全控制，只是浏览器同源策略的一部分。

服务端真正的安全控制必须基于：
- 鉴权（Token / Session）
- CSRF Token
- 频率限制
- IP 白名单

## 六、HTTP 安全响应头

CORS 解决跨域，安全头加固应用。安全头通过 HTTP 响应头让浏览器启用各种安全特性。

### 6.1 Content-Security-Policy (CSP)

CSP 是最强大的安全头，限制页面能加载哪些资源，是防御 XSS 的"终极武器"。

\`\`\`
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com; style-src 'self' 'unsafe-inline'; img-src * data:; connect-src 'self' https://api.example.com; report-uri /csp-report
\`\`\`

指令说明：
- \`default-src\`：默认策略
- \`script-src\`：JS 来源
- \`style-src\`：CSS 来源
- \`img-src\`：图片来源
- \`connect-src\`：AJAX / WebSocket / fetch 目标
- \`font-src\`：字体来源
- \`frame-src\`：iframe 来源
- \`report-uri\`：违规上报地址

关键字：
- \`'self'\`：同源
- \`'none'\`：禁止
- \`'unsafe-inline'\`：允许内联（不推荐）
- \`'unsafe-eval'\`：允许 eval（不推荐）
- \`nonce-<random>\`：允许带 nonce 的内联
- \`'sha256-<hash>'\`：允许指定 hash 的内联

### 6.2 X-Frame-Options

防止页面被 iframe 嵌套（防点击劫持）：

\`\`\`
X-Frame-Options: DENY              // 完全禁止
X-Frame-Options: SAMEORIGIN        // 只允许同源
X-Frame-Options: ALLOW-FROM https://a.com  // 允许指定源（已废弃）
\`\`\`

CSP 的 \`frame-ancestors\` 指令是更现代的替代：

\`\`\`
Content-Security-Policy: frame-ancestors 'self' https://a.com;
\`\`\`

### 6.3 Strict-Transport-Security (HSTS)

强制浏览器使用 HTTPS，防止 SSL 剥离攻击：

\`\`\`
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
\`\`\`

- \`max-age\`：缓存时间（秒），推荐至少 1 年
- \`includeSubDomains\`：包括子域名
- \`preload\`：加入浏览器内置的 HSTS 预加载列表

**注意**：开启 HSTS 前必须确保所有子域名都支持 HTTPS，否则会把用户锁在外面。

### 6.4 X-Content-Type-Options

禁止浏览器 MIME 嗅探：

\`\`\`
X-Content-Type-Options: nosniff
\`\`\`

没有这个头，浏览器可能把 \`text/plain\` 当成 \`text/html\` 解析，导致 XSS。

### 6.5 Referrer-Policy

控制 Referer 头的发送策略：

\`\`\`
Referrer-Policy: no-referrer
Referrer-Policy: no-referrer-when-downgrade   // 默认
Referrer-Policy: same-origin
Referrer-Policy: strict-origin
Referrer-Policy: strict-origin-when-cross-origin
Referrer-Policy: origin
Referrer-Policy: origin-when-cross-origin
Referrer-Policy: unsafe-url
\`\`\`

推荐 \`strict-origin-when-cross-origin\`：同源保留完整 URL，跨源只发协议+域名，HTTPS→HTTP 不发。

### 6.6 Permissions-Policy

控制浏览器特性权限（替代已废弃的 Feature-Policy）：

\`\`\`
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(self "https://a.com")
\`\`\`

- \`()\`：完全禁用
- \`self\`：仅同源
- 指定源：仅该源

### 6.7 X-XSS-Protection（已废弃）

旧版 IE 的 XSS 过滤器，现代浏览器已移除，**不推荐使用**：

\`\`\`
X-XSS-Protection: 0   // 关闭，依赖 CSP
\`\`\`

### 6.8 Cross-Origin 系列头

#### Cross-Origin-Opener-Policy (COOP)

隔离顶级窗口，防止跨源窗口引用：

\`\`\`
Cross-Origin-Opener-Policy: same-origin
\`\`\`

#### Cross-Origin-Embedder-Policy (COEP)

控制页面是否能加载跨源资源：

\`\`\`
Cross-Origin-Embedder-Policy: require-corp
\`\`\`

#### Cross-Origin-Resource-Policy (CORP)

资源级别的跨源策略：

\`\`\`
Cross-Origin-Resource-Policy: same-origin
\`\`\`

这三个头组合可以实现"跨源隔离"，启用 SharedArrayBuffer 等高级特性。

## 七、Cookie 与跨域

### 7.1 Cookie 的 SameSite 属性

\`\`\`
Set-Cookie: session=abc123; SameSite=Strict; Secure; HttpOnly
\`\`\`

SameSite 三种值：

- **Strict**：完全不带 Cookie 跨站（即使从链接跳转过来也不带）
- **Lax**：GET 顶级导航时带 Cookie，其他跨站请求不带（Chrome 默认）
- **None**：跨站带 Cookie，但必须配合 Secure（仅 HTTPS）

### 7.2 跨域 Cookie 的设置

跨域请求带 Cookie 需要：

**前端**：

\`\`\`javascript
// fetch
fetch('https://api.example.com/data', {
  credentials: 'include'
});

// XMLHttpRequest
xhr.withCredentials = true;

// axios
axios.defaults.withCredentials = true;
\`\`\`

**后端**：

\`\`\`
Access-Control-Allow-Origin: https://www.example.com   // 不能是 *
Access-Control-Allow-Credentials: true
Set-Cookie: session=abc123; SameSite=None; Secure; HttpOnly
\`\`\`

### 7.3 Cookie 的 Domain 属性

\`\`\`
Set-Cookie: session=abc123; Domain=example.com
\`\`\`

设置 \`Domain=example.com\`，则 Cookie 会被发送到 \`*.example.com\` 所有子域。

不设置 Domain（默认），Cookie 只发给设置它的具体域。

### 7.4 第三方 Cookie 问题

第三方 Cookie 是指在 A 网站访问时，B 网站设置的 Cookie（如广告追踪）。

现代浏览器（Safari、Firefox、Chrome 逐步）正在禁用第三方 Cookie。影响：
- 单点登录（SSO）需要重新设计
- 广告追踪需要改用其他方案
- 跨域 Cookie 受影响

**替代方案**：
- OAuth + Token
- SameSite=None; Secure（HTTPS 下仍可用）
- 浏览器隐私 API（如 Privacy Sandbox）

## 八、CSRF 防护

### 8.1 CSRF 攻击原理

CSRF（Cross-Site Request Forgery）利用用户已登录的身份，诱导用户访问恶意页面，恶意页面以用户身份发起请求。

\`\`\`
用户登录 bank.com，浏览器有 bank.com 的 Cookie
  ↓
用户访问 evil.com
  ↓
evil.com 页面有 <form action="https://bank.com/transfer" method="POST">
  <input name="to" value="attacker">
  <input name="amount" value="10000">
</form>
<script>document.forms[0].submit();</script>
  ↓
浏览器自动带上 Cookie 提交表单
  ↓
bank.com 收到带 Cookie 的请求，认为是用户本人操作，执行转账
\`\`\`

### 8.2 CSRF 防护方案

#### 方案 1：CSRF Token

服务端生成随机 Token，前端表单带上，服务端校验：

\`\`\`javascript
// 后端
app.get('/form', (req, res) => {
  const csrfToken = generateToken();
  req.session.csrfToken = csrfToken;
  res.render('form', { csrfToken });
});

app.post('/submit', (req, res) => {
  if (req.body.csrfToken !== req.session.csrfToken) {
    return res.status(403).send('CSRF 校验失败');
  }
  // 处理业务
});
\`\`\`

\`\`\`html
<!-- 前端表单 -->
<form action="/submit" method="POST">
  <input type="hidden" name="csrfToken" value="<%= csrfToken %>">
  <input name="data">
  <button>提交</button>
</form>
\`\`\`

对于 AJAX 请求，Token 通常放在自定义头：

\`\`\`javascript
fetch('/api/data', {
  method: 'POST',
  headers: { 'X-CSRF-Token': csrfToken }
});
\`\`\`

#### 方案 2：SameSite Cookie

\`\`\`
Set-Cookie: session=abc123; SameSite=Strict
\`\`\`

最简单有效，但旧浏览器不支持（IE11-）。

#### 方案 3：Referer / Origin 校验

\`\`\`javascript
app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.referer;
  if (!isAllowedOrigin(origin)) {
    return res.status(403).send('非法来源');
  }
  next();
});
\`\`\`

不是最可靠（Referer 可被伪造，但浏览器一般不允许），适合作为补充手段。

#### 方案 4：Double Submit Cookie

Token 同时放在 Cookie 和请求参数中，服务端比对：

\`\`\`
Cookie: csrfToken=abc123
POST /api with body: { csrfToken: 'abc123' }
\`\`\`

攻击者无法读取跨源 Cookie（受 SOP 限制），所以无法构造匹配的请求。

### 8.3 CSRF 与 CORS 的关系

- CSRF 是利用浏览器自动带 Cookie 的特性，绕过同源策略
- CORS 是浏览器对 JS 读取响应的限制，不影响请求发出
- CORS 不能防 CSRF，但 CSRF 防护可以用 CORS 思路（Origin 校验）

## 九、CORS 与 Cookie 的常见坑

### 9.1 \`Access-Control-Allow-Origin: *\` 不允许 Credentials

\`\`\`
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
\`\`\`

浏览器会拒绝响应。

### 9.2 Cookie 不带过来

前端设了 \`credentials: 'include'\`，但 Cookie 还是不发，原因可能有：
1. Cookie 的 SameSite 不匹配（None 需要 Secure）
2. Cookie 的 Domain 不匹配
3. Cookie 已过期
4. HTTPS 问题（Secure Cookie 在 HTTP 不发）
5. 第三方 Cookie 被浏览器拦截

### 9.3 预检请求丢失 Cookie

预检请求 OPTIONS 不会带 Cookie，所以预检不能用 Cookie 鉴权。预检应该是无状态的。

### 9.4 多个 Origin 配置错误

\`\`\`
Access-Control-Allow-Origin: http://a.com, http://b.com   // 错误！规范不允许
\`\`\`

正确做法：动态返回单个 Origin。

### 9.5 缓存问题

CDN 缓存了不同 Origin 的响应，导致跨域错误。解决：加 \`Vary: Origin\` 头。

## 十、安全头实战配置

### 10.1 Helmet（Express）

\`\`\`javascript
const helmet = require('helmet');
app.use(helmet());

// 自定义配置
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://cdn.example.com'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'https://api.example.com']
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' }
}));
\`\`\`

### 10.2 Spring Security

\`\`\`java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http
      .headers(headers -> headers
        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'"))
        .frameOptions(fo -> fo.deny())
        .httpStrictTransportSecurity(hsts -> hsts.maxAgeInSeconds(31536000))
        .contentTypeOptions(cto -> {})
      )
      .csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()));
  }
}
\`\`\`

### 10.3 Nginx 统一配置

\`\`\`nginx
server {
  listen 443 ssl http2;
  server_name example.com;

  # 安全头
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.example.com; ..." always;
  add_header Permissions-Policy "geolocation=(), microphone=()" always;

  # CORS（API 路径）
  location /api/ {
    add_header Access-Control-Allow-Origin $allowed_origin always;
    add_header Access-Control-Allow-Credentials "true" always;
    add_header Vary Origin always;
    proxy_pass http://backend;
  }
}
\`\`\`

## 十一、CORS 调试技巧

### 11.1 浏览器控制台

CORS 错误会在控制台显示具体原因：

\`\`\`
Access to fetch at 'https://api.example.com/data' from origin 'https://www.example.com'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
on the requested resource.
\`\`\`

### 11.2 DevTools Network

查看请求和响应头：
- 确认 Origin 头是否正确发送
- 确认服务端是否返回了正确的 CORS 响应头
- 注意预检 OPTIONS 请求

### 11.3 curl 模拟

\`\`\`bash
# 模拟简单请求
curl -H "Origin: https://www.example.com" \\
     -I https://api.example.com/data

# 模拟预检请求
curl -X OPTIONS \\
     -H "Origin: https://www.example.com" \\
     -H "Access-Control-Request-Method: PUT" \\
     -H "Access-Control-Request-Headers: Authorization" \\
     -I https://api.example.com/data
\`\`\`

## 十二、生产案例

### 12.1 案例 1：跨域登录态丢失

**现象**：前端 \`https://www.example.com\`，API \`https://api.example.com\`，用户登录后调用 API 一直返回 401。

**排查**：
1. 前端配置了 \`credentials: 'include'\`
2. 后端配置了 \`Access-Control-Allow-Credentials: true\`
3. 但后端 \`Access-Control-Allow-Origin: *\` —— 浏览器拒绝
4. Cookie 的 SameSite=Lax，跨子域不带

**解决**：
- 后端改为 \`Access-Control-Allow-Origin: https://www.example.com\`
- Cookie 改为 \`SameSite=None; Secure\`
- Cookie 的 Domain 设为 \`.example.com\`（共享子域）

### 12.2 案例 2：CSP 阻止内联脚本

**现象**：上线后页面报错 \`Refused to execute inline script\`。

**原因**：CSP 配置了 \`script-src 'self'\`，但页面有内联 \`<script>\`。

**解决**：
- 方案 1：把内联脚本提到外部文件
- 方案 2：用 nonce：\`script-src 'self' 'nonce-<random>'\`，每个 \`<script>\` 加 \`nonce\` 属性
- 方案 3：用 hash：\`script-src 'self' 'sha256-<hash>'\`

### 12.3 案例 3：HSTS 把用户锁在外面

**现象**：开启 HSTS 后，用户访问 HTTP 子域名打不开。

**原因**：HSTS 配置了 \`includeSubDomains\`，但某个子域名不支持 HTTPS。

**解决**：
- 所有子域名部署 HTTPS
- 或者去掉 \`includeSubDomains\`
- 警告：HSTS 一旦被浏览器记住，无法立即撤销（要等 max-age 过期）

## 十三、最佳实践清单

### 13.1 CORS 最佳实践

- [ ] 不要用 \`Access-Control-Allow-Origin: *\` 配合 Credentials
- [ ] 用白名单校验 Origin，动态返回
- [ ] 加 \`Vary: Origin\` 避免缓存问题
- [ ] 预检请求返回 204 + CORS 头
- [ ] \`Access-Control-Max-Age\` 设为合理值（3600 秒）
- [ ] 跨域 Cookie 设 \`SameSite=None; Secure\`

### 13.2 安全头最佳实践

- [ ] CSP：从 \`default-src 'self'\` 开始，逐步放开
- [ ] HSTS：HTTPS 全部就绪后再开
- [ ] X-Frame-Options 或 CSP frame-ancestors：防止点击劫持
- [ ] X-Content-Type-Options: nosniff：防 MIME 嗅探
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy：禁用不需要的浏览器特性

### 13.3 CSRF 最佳实践

- [ ] 状态修改接口必须防 CSRF
- [ ] SameSite=Lax 或 Strict（默认）
- [ ] CSRF Token + Origin 校验双保险
- [ ] GET 请求不能有副作用

## 十四、面试常见问题

**Q1：简单请求和预检请求的区别？**
A：简单请求直接发送；预检请求先发 OPTIONS 确认。简单请求需满足方法（GET/HEAD/POST）、Content-Type（form/multipart/text）、无自定义头等条件。

**Q2：CORS 为什么不能用 \`*\` 配合 Credentials？**
A：安全考虑。如果允许 \`*\` + Credentials，任意网站都能携带用户 Cookie 访问，等于 CSRF 漏洞。

**Q3：CSRF 和 XSS 的区别？**
A：CSRF 是冒用用户身份发起请求；XSS 是注入恶意脚本执行。CSP 主要防 XSS，CSRF Token 主要防 CSRF。

**Q4：同源策略限制哪些行为？**
A：DOM 访问、Cookie/Storage 读取、AJAX 响应读取。但表单提交、\`<script>\`、\`<img>\` 不受限制。

**Q5：HSTS 的作用？**
A：强制浏览器使用 HTTPS，防止 SSL 剥离攻击。开启前必须确保 HTTPS 完全可用。

**Q6：CSP 怎么防 XSS？**
A：限制脚本来源，禁止内联脚本和 eval，让攻击者即使注入 HTML 也无法执行 JS。

## 十五、CORS 高级场景实战

### 15.1 文件上传跨域

文件上传是典型的非简单请求（Content-Type: multipart/form-data 触发预检），需要特别处理：

**前端**：

\`\`\`javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('name', '张三');

fetch('https://api.example.com/upload', {
  method: 'POST',
  body: formData,
  credentials: 'include'  // 携带 Cookie
  // 不要手动设 Content-Type，浏览器会自动设 multipart 边界
});
\`\`\`

**后端关键点**：
- 预检请求允许 \`Content-Type: multipart/form-data\`
- 真实请求处理文件流
- 大文件考虑分片上传

\`\`\`javascript
app.options('/upload', corsMiddleware);  // 预检
app.post('/upload', upload.single('file'), (req, res) => {
  // req.file 包含文件信息
  res.json({ url: \`/uploads/\${req.file.filename}\` });
});
\`\`\`

**注意**：multipart/form-data 是简单请求允许的 Content-Type 之一，但只要带自定义头就会触发预检。

### 15.2 跨域下载文件

下载文件时浏览器会自动跟随重定向，跨域下载需要：

**方案 1：后端代理**

\`\`\`javascript
app.get('/download', async (req, res) => {
  const response = await fetch('https://other-origin.com/file.pdf');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="file.pdf"');
  response.body.pipe(res);
});
\`\`\`

**方案 2：CORS + blob**

\`\`\`javascript
fetch('https://api.example.com/file.pdf')
  .then(res => res.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'file.pdf';
    a.click();
    URL.revokeObjectURL(url);
  });
\`\`\`

后端必须返回 \`Access-Control-Allow-Origin\`，且不能是 \`*\`（如果要带 Cookie）。

### 15.3 跨域字体加载

CSS \`@font-face\` 加载跨域字体必须配置 CORS：

\`\`\`css
@font-face {
  font-family: 'MyFont';
  src: url('https://cdn.example.com/fonts/my-font.woff2') format('woff2');
}
\`\`\`

**Nginx 配置**：

\`\`\`nginx
location ~* \\.(woff2?|ttf|otf|eot)$ {
  add_header Access-Control-Allow-Origin 'https://www.example.com';
  add_header Vary Origin;
}
\`\`\`

字体跨域是浏览器同源策略的特殊限制，即使图片能跨域，字体默认不行。

### 15.4 跨域图片与 Canvas

图片可以跨域显示，但如果要用 Canvas 读取像素（\`getImageData\`），必须配置 CORS：

\`\`\`html
<img src="https://other-origin.com/image.jpg" crossorigin="anonymous">
\`\`\`

\`\`\`javascript
const img = new Image();
img.crossOrigin = 'anonymous';
img.onload = () => {
  const canvas = document.createElement('canvas');
  canvas.getContext('2d').drawImage(img, 0, 0);
  canvas.getContext('2d').getImageData(0, 0, 100, 100);  // 不报错
};
img.src = 'https://other-origin.com/image.jpg';
\`\`\`

**后端**：

\`\`\`nginx
location ~* \\.(jpg|png|gif)$ {
  add_header Access-Control-Allow-Origin '*';
  # 或具体源
}
\`\`\`

如果图片不带 CORS 头，Canvas 会被标记为"污染"（tainted），调用 \`getImageData\` 抛 SecurityError。

### 15.5 微前端跨域

微前端架构中，主应用和子应用可能跨域，需要处理：

**方案 1：PostMessage 通信**

主应用通过 PostMessage 与子应用 iframe 通信（见 4.4）。

**方案 2：统一域名 + 反向代理**

\`\`\`nginx
server {
  server_name app.example.com;
  location / { proxy_pass http://main-app; }
  location /sub-app-a/ { proxy_pass http://sub-app-a:3001/; }
  location /sub-app-b/ { proxy_pass http://sub-app-b:3002/; }
}
\`\`\`

所有应用统一在 \`app.example.com\` 下，无跨域问题。

**方案 3：CORS + fetch**

子应用通过 fetch 调用主应用 API，配置好 CORS 头即可。

## 十六、安全头进阶配置

### 16.1 CSP 报告模式

CSP 配置错误会导致页面功能失效。推荐先用 \`Content-Security-Policy-Report-Only\` 试运行：

\`\`\`
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report
\`\`\`

浏览器不会拦截违规，只会上报到 \`/csp-report\`。观察一段时间无违规后，再切换为强制模式。

**上报格式**：

\`\`\`json
{
  "csp-report": {
    "document-uri": "https://example.com/page",
    "violated-directive": "script-src",
    "blocked-uri": "https://evil.com/script.js",
    "line-number": 42,
    "source-file": "https://example.com/page"
  }
}
\`\`\`

### 16.2 CSP nonce 方案

允许特定内联脚本，比 \`unsafe-inline\` 安全：

\`\`\`
Content-Security-Policy: script-src 'self' 'nonce-abc123random'
\`\`\`

\`\`\`html
<script nonce="abc123random">
  // 这段内联脚本可以执行
  console.log('hello');
</script>
<script>
  // 没有 nonce，被 CSP 拦截
  console.log('blocked');
</script>
\`\`\`

服务端为每个请求生成随机 nonce，注入到 CSP 头和 HTML 的 \`<script>\` 标签。

### 16.3 CSP hash 方案

对内联脚本内容做 hash，固定不变的内联脚本用 hash：

\`\`\`
Content-Security-Policy: script-src 'self' 'sha256-abc123...'
\`\`\`

\`\`\`html
<script>console.log('hello');</script>
\`\`\`

浏览器计算脚本内容的 hash，匹配 CSP 中的 hash 才执行。

### 16.4 Trusted Types

CSP 的进阶特性，防止 DOM XSS：

\`\`\`
Content-Security-Policy: require-trusted-types-for 'script';
\`\`\`

开启后，\`innerHTML\`、\`eval\`、\`document.write\` 等危险 API 只接受 TrustedType 对象，普通字符串会被拒绝：

\`\`\`javascript
// 报错
element.innerHTML = userInput;

// 必须通过 Policy 创建 TrustedHTML
const policy = trustedTypes.createPolicy('escape', {
  createHTML: s => DOMPurify.sanitize(s)
});
element.innerHTML = policy.createHTML(userInput);
\`\`\`

### 16.5 COOP/COEP/CORP 跨源隔离

现代浏览器的高级隔离机制：

\`\`\`
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
\`\`\`

启用"跨源隔离"后：
- 防范 Spectre 等侧信道攻击
- 可以使用 SharedArrayBuffer、performance.measureUserAgentSpecificMemory 等高级 API
- 但所有跨源资源必须配置 CORP 头或 CORB 兼容

## 十七、CSRF 进阶

### 17.1 SameSite 兼容性问题

\`\`\`
Set-Cookie: session=abc; SameSite=None; Secure
\`\`\`

问题：旧浏览器（Chrome < 51, iOS < 13）不认识 SameSite=None，会当作 Strict 处理。

兼容方案：

\`\`\`
Set-Cookie: session=abc; SameSite=None; Secure
Set-Cookie: session=abc;  // 旧浏览器读这个（默认 Lax）
\`\`\`

发两个 Cookie：现代浏览器优先读带 SameSite=None 的，旧浏览器读默认的。

### 17.2 SameParty Cookie

新的 Cookie 属性，用于第一方集（First-Party Set）：

\`\`\`
Set-Cookie: session=abc; SameParty; Secure; SameSite=None
\`\`\`

属于同一组的多个域名可以共享 Cookie，但需要域名向 Google 注册 First-Party Set。目前仍处于实验阶段。

### 17.3 CSRF 与 JWT

JWT 通常放在 Authorization 头，不放在 Cookie，所以天然防 CSRF。但要注意：

- JWT 放 localStorage 有 XSS 风险
- JWT 放 Cookie 仍有 CSRF 风险（需配合 SameSite 或 CSRF Token）
- JWT 续期需要刷新机制

### 17.4 双重 Cookie 防护

\`\`\`javascript
// 1. 服务端发 CSRF Token 到 Cookie 和前端
Set-Cookie: csrfToken=abc123
// 同时通过接口返回给前端：{ csrfToken: 'abc123' }

// 2. 前端读 Cookie，放到请求头
const csrfToken = getCookie('csrfToken');
fetch('/api', { headers: { 'X-CSRF-Token': csrfToken } });

// 3. 服务端比对 Cookie 中的 Token 和 Header 中的 Token
\`\`\`

攻击者无法读取跨源 Cookie，所以无法构造匹配的请求。

## 十八、跨域性能优化

### 18.1 预检请求缓存

预检请求会额外增加一次往返，影响性能。优化：

1. \`Access-Control-Max-Age\` 设为合理值（3600 秒）
2. 尽量让请求成为"简单请求"（避免自定义头、用 form 格式）
3. 避免不必要的方法（用 GET 替代 POST 查询）

### 18.2 减少跨域请求

- 静态资源部署到与页面同源（CDN 同源化）
- API 通过反向代理到同源
- 使用 Service Worker 缓存跨域响应

### 18.3 预连接

\`\`\`html
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://cdn.example.com">
\`\`\`

提前建立 TCP/TLS 连接，减少跨域请求的首字节时间。

### 18.4 CDN 跨域缓存

CDN 缓存跨域响应时，要正确处理 Vary 头：

- \`Vary: Origin\`：CDN 按 Origin 分别缓存
- 否则不同 Origin 的请求可能拿到错误的 CORS 头

## 十九、移动端跨域特殊处理

### 19.1 WebView 中的跨域

Android WebView 和 iOS WKWebView 默认遵守同源策略，但可以配置：

**Android**：

\`\`\`java
webView.getSettings().setAllowUniversalAccessFromFileURLs(true);
\`\`\`

**iOS WKWebView**：

\`\`\`swift
config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
\`\`\`

但**不推荐**关闭同源策略，应该用 HTTPS + 正确的 CORS 配置。

### 19.2 Cordova / Ionic

Cordova 应用通过 \`file://\` 加载，Origin 是 \`null\`。要么用 \`cordova-plugin-whitelist\` 配置：

\`\`\`xml
<access origin="*" />
<allow-intent href="https://*/*" />
\`\`\`

要么后端允许 \`null\` Origin（不推荐）。

### 19.3 微信小程序

小程序的网络请求不受同源策略限制（不是浏览器环境），但要在小程序后台配置域名白名单：

\`\`\`
https://api.example.com  ✓ 已配置
https://other.com        ✗ 未配置，请求会被拦截
\`\`\`

## 二十、CORS 安全检查清单

部署 CORS 前的检查清单：

### 20.1 配置检查

- [ ] \`Access-Control-Allow-Origin\` 是否精确（不用 \`*\`）
- [ ] \`Allow-Credentials: true\` 时 Origin 是否精确
- [ ] 白名单是否定期更新（移除废弃源）
- [ ] 是否加了 \`Vary: Origin\`
- [ ] 预检 \`Max-Age\` 是否合理（不超 7200）
- [ ] OPTIONS 是否返回 204（而非 200）

### 20.2 安全检查

- [ ] 是否有 Origin 反射漏洞（\`Allow-Origin: <req.headers.origin>\`）
- [ ] 白名单是否包含 \`null\`
- [ ] 子域通配符正则是否严格
- [ ] 是否依赖预检作为安全控制
- [ ] 是否所有状态修改接口都有 CSRF 防护

### 20.3 监控检查

- [ ] 是否监控 CORS 错误率
- [ ] 是否监控 OPTIONS 请求量（异常可能表示配置问题）
- [ ] 是否监控新出现的 Origin
- [ ] 是否监控未授权 Origin 的尝试

### 20.4 文档检查

- [ ] CORS 配置是否文档化
- [ ] 白名单变更是否有审批流程
- [ ] 是否有应急回滚方案

## 二十一、本章小结

CORS 和安全头是现代 Web 应用的"安全基础设施"：

1. **同源策略**：浏览器的核心安全机制，限制 DOM、Cookie、AJAX 跨源
2. **CORS**：标准跨域方案，区分简单请求和预检请求
3. **跨域方案对比**：CORS（标准）、反向代理（绕过）、JSONP（已淘汰）、PostMessage（窗口间）
4. **安全考虑**：白名单、Null Origin 陷阱、通配符风险
5. **安全头**：CSP、HSTS、X-Frame-Options、X-Content-Type-Options、Referrer-Policy
6. **Cookie 跨域**：SameSite、Secure、Domain、Credentials
7. **CSRF 防护**：Token、SameSite、Origin 校验、Double Submit
8. **生产实践**：Helmet、Nginx 统一配置、调试技巧

掌握这些知识，你就能从容应对前后端分离架构下的跨域和安全问题，构建出既灵活又安全的 Web 应用。

---

**延伸阅读**：
- [MDN: CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)
- [W3C: CORS Specification](https://www.w3.org/TR/cors/)
- [OWASP: CORS Misconfiguration](https://owasp.org/www-community/attacks/CORS_OriginHeaderBypass)
- [MDN: HTTP Headers](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
`,
    code: `// CORS 跨域与安全头 - 完整中间件实现
// 演示：CorsMiddleware、SecurityHeaders 中间件、CSRF 防护、模拟跨域请求处理

// ============ 1. CORS 中间件 ============
class CorsMiddleware {
  constructor(options = {}) {
    this.origins = options.origins || ['*'];
    this.methods = options.methods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
    this.headers = options.headers || ['Content-Type', 'Authorization'];
    this.exposeHeaders = options.exposeHeaders || ['X-Request-Id', 'X-Total-Count'];
    this.credentials = options.credentials !== false;
    this.maxAge = options.maxAge || 3600;
  }

  // 校验 Origin 是否在白名单
  isOriginAllowed(origin) {
    if (this.origins.includes('*')) return true;
    if (!origin || origin === 'null') return false;
    // 支持正则匹配（如 *.example.com）
    return this.origins.some(pattern => {
      if (pattern instanceof RegExp) return pattern.test(origin);
      return pattern === origin;
    });
  }

  // 处理请求
  handle(req, res, next) {
    const origin = req.headers.origin;
    console.log(\`[CORS] \${req.method} \${req.path} Origin=\${origin || '无'}\`);

    // 设置 CORS 响应头
    if (origin && this.isOriginAllowed(origin)) {
      res.headers['Access-Control-Allow-Origin'] = origin;
      res.headers['Vary'] = 'Origin';
      if (this.credentials) {
        res.headers['Access-Control-Allow-Credentials'] = 'true';
      }
      res.headers['Access-Control-Expose-Headers'] = this.exposeHeaders.join(', ');
    }

    // 预检请求 OPTIONS
    if (req.method === 'OPTIONS') {
      console.log('[CORS] 收到预检请求');
      res.headers['Access-Control-Allow-Methods'] = this.methods.join(', ');
      res.headers['Access-Control-Allow-Headers'] = this.headers.join(', ');
      res.headers['Access-Control-Max-Age'] = String(this.maxAge);
      res.status = 204;
      res.body = '';
      console.log('[CORS] 预检通过，返回 204');
      return;
    }

    // 检查方法是否允许
    if (!this.methods.includes(req.method)) {
      res.status = 405;
      res.body = { error: 'Method Not Allowed' };
      res.headers['Allow'] = this.methods.join(', ');
      return;
    }

    next();
  }
}

// ============ 2. 安全头中间件 ============
class SecurityHeaders {
  constructor(options = {}) {
    this.options = {
      csp: options.csp || "default-src 'self'; script-src 'self'",
      frameguard: options.frameguard || 'SAMEORIGIN',
      hsts: options.hsts !== false ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      } : null,
      noSniff: options.noSniff !== false,
      referrerPolicy: options.referrerPolicy || 'strict-origin-when-cross-origin',
      permissionsPolicy: options.permissionsPolicy || 'geolocation=(), microphone=()'
    };
  }

  handle(req, res, next) {
    const h = res.headers;
    // 内容安全策略
    h['Content-Security-Policy'] = this.options.csp;
    // 防点击劫持
    h['X-Frame-Options'] = this.options.frameguard;
    // HSTS（仅 HTTPS）
    if (this.options.hsts) {
      h['Strict-Transport-Security'] = \`max-age=\${this.options.hsts.maxAge}\` +
        (this.options.hsts.includeSubDomains ? '; includeSubDomains' : '') +
        (this.options.hsts.preload ? '; preload' : '');
    }
    // 禁止 MIME 嗅探
    if (this.options.noSniff) {
      h['X-Content-Type-Options'] = 'nosniff';
    }
    // Referrer 策略
    h['Referrer-Policy'] = this.options.referrerPolicy;
    // 权限策略
    h['Permissions-Policy'] = this.options.permissionsPolicy;
    next();
  }
}

// ============ 3. CSRF 防护中间件 ============
class CsrfProtection {
  constructor() {
    this.tokens = new Map();  // sessionId -> csrfToken
  }
  // 生成 Token
  generate(sessionId) {
    const token = 'csrf-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    this.tokens.set(sessionId, token);
    return token;
  }
  // 校验 Token
  verify(sessionId, token) {
    const expected = this.tokens.get(sessionId);
    if (!expected || expected !== token) return false;
    return true;
  }
  // 中间件：检查 Origin + Token
  handle(req, res, next) {
    // 安全方法（GET/HEAD/OPTIONS）跳过
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }
    // 1. Origin 校验
    const origin = req.headers.origin || req.headers.referer || '';
    const allowedOrigins = ['https://www.example.com', 'http://localhost:3000'];
    if (origin && !allowedOrigins.includes(origin)) {
      res.status = 403;
      res.body = { code: 'CSRF_ORIGIN_INVALID', message: '非法来源' };
      console.log(\`[CSRF] 拒绝非法 Origin: \${origin}\`);
      return;
    }
    // 2. Token 校验
    const sessionId = req.headers.cookie?.match(/session=([^;]+)/)?.[1];
    const csrfToken = req.headers['x-csrf-token'] || req.body?._csrf;
    if (!sessionId || !this.verify(sessionId, csrfToken)) {
      res.status = 403;
      res.body = { code: 'CSRF_TOKEN_INVALID', message: 'CSRF 校验失败' };
      console.log('[CSRF] Token 校验失败');
      return;
    }
    next();
  }
}

// ============ 4. 模拟 HTTP 请求/响应 ============
function createReq(method, path, headers = {}, body = null) {
  return { method, path, headers, body };
}
function createRes() {
  return {
    status: 200,
    headers: {},
    body: null,
    send(body) { this.body = body; }
  };
}

// ============ 5. 演示 ============
console.log('===== CORS 与安全头演示 =====\\n');

// 配置中间件
const cors = new CorsMiddleware({
  origins: ['https://www.example.com', 'https://admin.example.com'],
  credentials: true,
  maxAge: 3600
});
const security = new SecurityHeaders();
const csrf = new CsrfProtection();

// 模拟业务处理
function businessHandler(req, res) {
  res.status = 200;
  res.headers['Content-Type'] = 'application/json';
  res.body = { success: true, data: { message: '请求成功', path: req.path } };
}

// 演示 1：同源请求
console.log('--- 演示 1: 同源请求（无 Origin） ---');
{
  const req = createReq('GET', '/api/users');
  const res = createRes();
  security.handle(req, res, () => {
    cors.handle(req, res, () => businessHandler(req, res));
  });
  console.log('状态:', res.status);
  console.log('响应头:', JSON.stringify(res.headers, null, 2));
  console.log('响应体:', JSON.stringify(res.body));
}

// 演示 2：跨域简单请求
console.log('\\n--- 演示 2: 跨域 GET 请求（白名单内） ---');
{
  const req = createReq('GET', '/api/users', {
    origin: 'https://www.example.com'
  });
  const res = createRes();
  security.handle(req, res, () => {
    cors.handle(req, res, () => businessHandler(req, res));
  });
  console.log('状态:', res.status);
  console.log('Access-Control-Allow-Origin:', res.headers['Access-Control-Allow-Origin']);
  console.log('Access-Control-Allow-Credentials:', res.headers['Access-Control-Allow-Credentials']);
  console.log('响应体:', JSON.stringify(res.body));
}

// 演示 3：跨域预检请求
console.log('\\n--- 演示 3: 跨域 PUT 预检请求 ---');
{
  const req = createReq('OPTIONS', '/api/users/1', {
    origin: 'https://www.example.com',
    'access-control-request-method': 'PUT',
    'access-control-request-headers': 'Authorization, Content-Type'
  });
  const res = createRes();
  cors.handle(req, res, () => {});
  console.log('状态:', res.status);
  console.log('Allow-Methods:', res.headers['Access-Control-Allow-Methods']);
  console.log('Allow-Headers:', res.headers['Access-Control-Allow-Headers']);
  console.log('Max-Age:', res.headers['Access-Control-Max-Age']);
}

// 演示 4：非法 Origin 拒绝
console.log('\\n--- 演示 4: 非法 Origin 跨域请求 ---');
{
  const req = createReq('GET', '/api/users', {
    origin: 'https://evil.com'
  });
  const res = createRes();
  cors.handle(req, res, () => businessHandler(req, res));
  console.log('状态:', res.status);
  console.log('Allow-Origin:', res.headers['Access-Control-Allow-Origin'] || '未设置（拒绝）');
  console.log('响应体:', JSON.stringify(res.body));
}

// 演示 5：安全头检查
console.log('\\n--- 演示 5: 安全响应头 ---');
{
  const req = createReq('GET', '/');
  const res = createRes();
  security.handle(req, res, () => businessHandler(req, res));
  console.log('CSP:', res.headers['Content-Security-Policy']);
  console.log('X-Frame-Options:', res.headers['X-Frame-Options']);
  console.log('HSTS:', res.headers['Strict-Transport-Security']);
  console.log('X-Content-Type-Options:', res.headers['X-Content-Type-Options']);
  console.log('Referrer-Policy:', res.headers['Referrer-Policy']);
  console.log('Permissions-Policy:', res.headers['Permissions-Policy']);
}

// 演示 6：CSRF 防护
console.log('\\n--- 演示 6: CSRF 防护 ---');
{
  // 先生成 Token
  const token = csrf.generate('session-abc');
  console.log('生成的 CSRF Token:', token);

  // 正确 Token 的请求
  const req1 = createReq('POST', '/api/transfer', {
    origin: 'https://www.example.com',
    cookie: 'session=session-abc',
    'x-csrf-token': token
  }, { to: 'bob', amount: 100 });
  const res1 = createRes();
  csrf.handle(req1, res1, () => businessHandler(req1, res1));
  console.log('正确 Token 请求状态:', res1.status, res1.body?.success ? '成功' : res1.body?.message);

  // 错误 Token 的请求
  const req2 = createReq('POST', '/api/transfer', {
    origin: 'https://www.example.com',
    cookie: 'session=session-abc',
    'x-csrf-token': 'wrong-token'
  }, { to: 'bob', amount: 100 });
  const res2 = createRes();
  csrf.handle(req2, res2, () => businessHandler(req2, res2));
  console.log('错误 Token 请求状态:', res2.status, res2.body?.message);

  // 非法 Origin 的请求
  const req3 = createReq('POST', '/api/transfer', {
    origin: 'https://evil.com',
    cookie: 'session=session-abc',
    'x-csrf-token': token
  }, { to: 'bob', amount: 100 });
  const res3 = createRes();
  csrf.handle(req3, res3, () => businessHandler(req3, res3));
  console.log('非法 Origin 请求状态:', res3.status, res3.body?.message);
}

console.log('\\n===== 演示结束 =====');
`,
  },
  // __APPEND_CHAPTERS_HERE__
];
