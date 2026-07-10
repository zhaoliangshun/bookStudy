// =============================================================
// 后端开发综合教程 - 第 1 批章节（基础与网络前 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   backend-overview : 后端开发概览
//   backend-http     : HTTP 协议深入
//   backend-https    : HTTPS 与 TLS 实战
//   backend-tcp      : TCP/IP 与网络基础
//   backend-dns      : DNS 域名系统
//
// content 字段用中文讲解通用后端原理，并用 Java/Go/Python/Node.js
// 伪代码对照说明；code 字段是可直接执行的 Node.js 代码，
// 通过 /api/run-backend 在共享沙箱中运行。
//
// 沙箱约束：可用内置模块 fs/path/os/url/crypto/util/events/
// stream/buffer/querystring/string_decoder/zlib/assert/timers，
// 禁用 http/net/dns/child_process。涉及网络的概念用 events、
// 自定义对象与纯字符串处理来模拟。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：后端开发概览
  // ============================================================
  {
    id: "backend-overview",
    group: "基础与网络",
    icon: "🌐",
    title: "后端开发概览",
    content: `# 后端开发概览

## 什么是后端开发

后端开发（Backend Development）是指构建应用程序中"用户看不见"的那一整套系统：它接收前端或客户端的请求，执行业务逻辑，读写数据存储，再把结果返回给调用方。如果把一个应用比作一家餐厅，前端是菜单、装修和点餐界面，那么后端就是后厨——接单、备料、烹饪、出餐，还要管库存、算账、保证卫生安全。

后端运行在服务器上，7×24 小时不间断地对外提供服务。它要解决的核心问题可以归纳为五个字：**存、算、通、护、稳**——存数据、算业务、通网络、护安全、稳运行。

后端开发不仅仅是"写接口"。一个完整的后端系统包含：业务逻辑实现、数据建模与存储、接口设计与协议、安全认证与鉴权、性能与并发控制、可观测性（日志/指标/链路）、部署与运维。后端工程师要在这七个维度上持续权衡，做出适合当前业务规模和团队能力的技术决策。

### 前端 vs 后端

| 维度 | 前端 | 后端 |
|------|------|------|
| 运行位置 | 用户浏览器 / 客户端 | 服务器 |
| 关注点 | 界面展示、交互体验 | 数据处理、业务逻辑、系统稳定 |
| 技术栈 | HTML/CSS/JS/框架 | Java/Go/Python/Node.js + 数据库 |
| 状态 | 多为无状态（状态在服务端） | 管理状态与数据 |
| 性能指标 | 首屏时间、交互流畅度 | 吞吐量、延迟、可用性 |
| 出错影响 | 单个用户看到错误 | 可能影响所有用户 |
| 并发模型 | 单线程事件循环 | 多线程 / 协程 / 事件循环 |
| 数据访问 | 通过 API 调用后端 | 直接读写数据库、缓存 |
| 安全边界 | 用户体验层校验 | 真正的安全防线 |

理解前后端的边界很重要：前端是"皮"，后端是"骨"。前端的所有校验都只是体验优化，真正的数据校验、权限控制、业务规则必须由后端独立完成，因为前端代码可以被任何人篡改。

### 后端开发的本质

后端开发的本质是**在约束下做权衡**。你永远在权衡这些矛盾：

- **性能 vs 一致性**：缓存提高性能但引入数据不一致。
- **简单 vs 灵活**：单体简单但难扩展，微服务灵活但复杂。
- **成本 vs 可用性**：多机房高可用但成本翻倍。
- **开发速度 vs 质量**：赶进度可能埋下技术债。

没有银弹，只有适合当前场景的选择。一个优秀的后端工程师，能在这些矛盾中找到平衡点，并知道什么时候该偏向哪一边。

---

## 后端的核心职责

### 1. 业务逻辑处理

业务逻辑是后端的灵魂。它把现实世界的规则翻译成代码：电商的"下单要扣库存、扣余额、生成订单"，银行的"转账要校验余额、记录流水、保证原子性"，社交的"发帖要鉴权、写库、推送给粉丝"。

业务逻辑要做到**正确、可维护、可测试**。好的后端会把业务规则集中管理，避免散落在各处。领域驱动设计（DDD）提倡把业务逻辑收敛到"领域模型"中，让代码直接表达业务语言。

业务逻辑的复杂度往往来自：
- **状态流转**：订单从"待支付→已支付→已发货→已完成"，每个状态允许的操作不同。
- **并发控制**：多人同时抢购同一商品，库存不能超卖。
- **事务一致性**：扣款和加余额必须同时成功或同时失败。
- **规则变化**：业务方频繁调整促销规则、计费方式。

\`\`\`java
// Java：订单服务（业务逻辑示例）
public class OrderService {
  private final InventoryRepo inventory;
  private final AccountRepo account;
  private final OrderRepo orderRepo;

  public Order placeOrder(String userId, String sku, int qty) {
    // 1. 校验库存
    if (!inventory.deduct(sku, qty)) {
      throw new BizException("库存不足");
    }
    // 2. 扣款
    long amount = inventory.priceOf(sku) * qty;
    account.charge(userId, amount);
    // 3. 生成订单
    Order order = new Order(userId, sku, qty, amount);
    orderRepo.save(order);
    return order;
  }
}
\`\`\`

\`\`\`go
// Go：订单服务（业务逻辑示例）
type OrderService struct {
    inventory InventoryRepo
    account   AccountRepo
    orderRepo OrderRepo
}

func (s *OrderService) PlaceOrder(userID, sku string, qty int) (*Order, error) {
    if !s.inventory.Deduct(sku, qty) {
        return nil, errors.New("库存不足")
    }
    amount := s.inventory.PriceOf(sku) * int64(qty)
    s.account.Charge(userID, amount)
    order := NewOrder(userID, sku, qty, amount)
    s.orderRepo.Save(order)
    return order, nil
}
\`\`\`

\`\`\`python
# Python：订单服务（业务逻辑示例）
class OrderService:
    def __init__(self, inventory, account, order_repo):
        self.inventory = inventory
        self.account = account
        self.order_repo = order_repo

    def place_order(self, user_id, sku, qty):
        if not self.inventory.deduct(sku, qty):
            raise BizException("库存不足")
        amount = self.inventory.price_of(sku) * qty
        self.account.charge(user_id, amount)
        order = Order(user_id, sku, qty, amount)
        self.order_repo.save(order)
        return order
\`\`\`

\`\`\`js
// Node.js：订单服务（业务逻辑示例）
class OrderService {
  constructor(inventory, account, orderRepo) {
    this.inventory = inventory;
    this.account = account;
    this.orderRepo = orderRepo;
  }
  async placeOrder(userId, sku, qty) {
    if (!(await this.inventory.deduct(sku, qty))) {
      throw new BizException("库存不足");
    }
    const amount = (await this.inventory.priceOf(sku)) * qty;
    await this.account.charge(userId, amount);
    const order = new Order(userId, sku, qty, amount);
    await this.orderRepo.save(order);
    return order;
  }
}
\`\`\`

可以看到四种语言表达同一段业务逻辑，结构几乎一致，只是语法风格不同：Java 重注解和类型、Go 简洁显式、Python 简短、Node.js 异步。

### 2. 数据存储与管理

后端要决定数据"存在哪里、怎么存、怎么读、怎么保证不丢、怎么保证一致"。常见的存储选型：

- **关系型数据库**（MySQL/PostgreSQL）：强一致、事务、复杂查询，适合核心业务数据。
- **NoSQL 文档库**（MongoDB）：灵活 schema，适合内容管理、配置。
- **键值缓存**（Redis）：极高速度，做缓存、计数器、分布式锁。
- **列式存储**（Cassandra/HBase）：海量数据写入，时序、日志。
- **对象存储**（S3/OSS）：图片、视频、文件。
- **搜索引擎**（Elasticsearch）：全文检索、日志分析。
- **图数据库**（Neo4j）：关系密集场景，社交网络、推荐。

数据管理还要考虑：索引优化、分库分表、读写分离、数据备份与恢复、数据归档与冷热分离。数据是公司最宝贵的资产，存储选型错了，后期迁移成本极高。

\`\`\`sql
-- 关系型数据库：订单表设计（索引、外键、约束）
CREATE TABLE orders (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT NOT NULL,
  sku         VARCHAR(64) NOT NULL,
  qty         INT NOT NULL,
  amount      DECIMAL(12,2) NOT NULL,
  status      TINYINT NOT NULL DEFAULT 0,  -- 0待支付 1已支付 2已发货 3已完成
  created_at  DATETIME NOT NULL DEFAULT NOW(),
  INDEX idx_user (user_id, created_at),    -- 用户订单查询索引
  INDEX idx_status (status)                -- 状态扫描索引
);
\`\`\`

### 3. 接口提供

后端通过接口（API）把能力暴露出去。主流接口风格：

- **REST**：基于 HTTP，资源导向，简单通用，是互联网接口的事实标准。
- **GraphQL**：客户端按需查询，灵活但复杂，适合多端、复杂聚合。
- **RPC（gRPC/Thrift）**：高性能、强类型，适合内部服务间调用。
- **WebSocket**：双向实时通信，适合聊天、推送、协作。
- **消息队列**（Kafka/RabbitMQ）：异步解耦，削峰填谷。

接口设计要做到：语义清晰、版本可控、文档完备、错误码规范。REST 的核心是"资源 + HTTP 动词"：\`GET /orders\` 查列表，\`POST /orders\` 创建，\`GET /orders/123\` 查详情，\`PUT /orders/123\` 更新，\`DELETE /orders/123\` 删除。

\`\`\`http
# RESTful 接口示例：订单资源
GET    /api/v1/orders           # 获取订单列表（支持分页、过滤）
POST   /api/v1/orders           # 创建订单
GET    /api/v1/orders/:id       # 获取单个订单
PATCH  /api/v1/orders/:id       # 部分更新（如改状态）
DELETE /api/v1/orders/:id       # 删除订单
GET    /api/v1/orders/:id/items # 获取订单下的商品
\`\`\`

### 4. 安全保障

后端是安全的最后一道防线。前端的所有校验都可以被绕过，因此后端必须独立校验。安全涵盖：

- **身份认证（Authentication）**：你是谁？JWT/Session/OAuth2。
- **权限控制（Authorization）**：你能做什么？RBAC/ABAC。
- **数据安全**：传输加密（HTTPS）、存储加密、敏感数据脱敏。
- **防攻击**：SQL 注入、XSS、CSRF、重放攻击、DDoS。
- **审计日志**：谁在什么时候做了什么，便于追责。
- **合规**：数据隐私（GDPR/个保法）、日志留存、敏感信息加密。

\`\`\`python
# Python：参数校验 + SQL 注入防护（用参数化查询）
def get_user(user_id):
    # 错误：字符串拼接，有 SQL 注入风险
    # sql = "SELECT * FROM users WHERE id = " + user_id
    # 正确：参数化查询，数据库自动转义
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    return cursor.fetchone()
\`\`\`

### 5. 性能与可用性

后端要在高并发下依然快速、稳定。关键手段：

- **缓存**：多级缓存（本地/分布式），减少 DB 压力。
- **异步化**：消息队列削峰填谷，耗时操作异步处理。
- **限流降级**：保护系统不被流量压垮。
- **水平扩展**：无状态服务可加机器扩容。
- **监控告警**：实时掌握系统健康度。
- **熔断**：下游故障时快速失败，防止级联雪崩。

可用性目标通常用"几个 9"衡量：

| 可用性 | 年宕机 | 级别 |
|--------|--------|------|
| 99% | 3.65 天 | 普通系统 |
| 99.9% | 8.76 小时 | 一般线上系统 |
| 99.99% | 52.6 分钟 | 核心系统 |
| 99.999% | 5.26 分钟 | 金融/电信级 |

每多一个 9，成本呈指数上升。99.99% 到 99.999% 可能需要多机房多活、容灾切换，投入巨大。

### 6. 可观测性

可观测性是现代后端的"眼睛"，没有它线上系统就是黑盒。三大支柱：

- **日志（Logging）**：记录离散事件，用于排查具体问题。
- **指标（Metrics）**：聚合数值（QPS、延迟、错误率），用于监控告警。
- **链路追踪（Tracing）**：一个请求跨多个服务的完整调用链，用于定位分布式瓶颈。

\`\`\`go
// Go：结构化日志 + 指标埋点（伪代码）
func handleOrder(w http.ResponseWriter, r *http.Request) {
    start := time.Now()
    logger.Info("收到下单请求", "user_id", r.Header.Get("X-User"))
    // ... 业务处理
    elapsed := time.Since(start).Seconds()
    metrics.Histogram("order.latency", elapsed)
    metrics.Counter("order.total").Inc()
    logger.Info("下单完成", "elapsed_ms", elapsed*1000)
}
\`\`\`

---

## 后端架构演进史

架构演进不是追新，而是被业务规模和团队规模倒逼的结果。每个阶段都有它解决的核心痛点和引入的新问题。

### 阶段一：单体架构（Monolithic）

所有功能打包在一个应用里，共享一个数据库。开发简单、部署方便（一个 war/jar），适合早期项目和初创团队。

**痛点**：
- 代码膨胀后难以维护，新人上手难。
- 一个小改动要重新部署整个系统，风险大。
- 技术栈锁定，难以引入新技术。
- 扩展只能整体扩展，不能按模块独立扩容。

**驱动因素**：业务简单、团队小、迭代快，单体最快。

### 阶段二：分层架构（Layered）

把单体按职责分层：表现层（Controller）→ 业务层（Service）→ 数据访问层（DAO）→ 数据库。职责清晰、易于测试，但仍是单部署单元。

\`\`\`
┌───────────────────────────┐
│  Controller（接口层）      │  接收请求、参数校验、返回响应
├───────────────────────────┤
│  Service（业务层）         │  核心业务逻辑
├───────────────────────────┤
│  DAO / Repository（数据层）│  数据库操作
├───────────────────────────┤
│  Database                  │  持久化
└───────────────────────────┘
\`\`\`

**痛点**：仍是单进程，单点故障、整体扩展、技术栈单一的问题没解决。

**驱动因素**：代码量上来后需要职责分离，便于团队协作和测试。

### 阶段三：SOA（面向服务架构）

把系统拆成多个服务，通过 ESB（企业服务总线）通信。服务可独立开发，但 ESB 容易成为瓶颈和单点。

**痛点**：ESSB 太重，协议复杂（SOAP/XML），服务边界划分不清。

**驱动因素**：企业内多个系统需要集成和复用。

### 阶段四：微服务架构（Microservices）

把单体拆成一组小而自治的服务，每个服务独立部署、独立数据库、用轻量协议（HTTP/gRPC）通信。优势是技术栈灵活、可独立扩展、故障隔离；代价是分布式复杂性——服务发现、配置中心、链路追踪、分布式事务。

**痛点**：
- 分布式事务难（最终一致性、Saga、TCC）。
- 服务间调用链路长，排查问题难。
- 运维成本高（几十上百个服务）。
- 数据一致性、网络故障、重试幂等。

**驱动因素**：业务复杂度爆炸、团队规模扩大、需要独立部署和扩展。

### 阶段五：云原生架构（Cloud Native）

在微服务基础上，拥抱容器（Docker）、编排（Kubernetes）、声明式 API、不可变基础设施、Service Mesh。目标是让应用天然适合云环境：弹性伸缩、自愈、可观测。

**核心实践**：
- 容器化：应用与依赖打包成镜像，环境一致。
- 编排：K8s 自动调度、扩缩容、自愈。
- 声明式：描述期望状态，系统不断趋近。
- Service Mesh：Istio/Linkerd 把通信治理从代码剥离。

**痛点**：运维复杂度极高，K8s 学习曲线陡。

**驱动因素**：云的弹性、规模化运维需求。

### 阶段六：Serverless（无服务器）

进一步把"服务器"抽象掉，开发者只写函数（FaaS），云平台负责扩缩容、计费按调用次数。还有 BaaS（后端即服务，如认证、数据库、存储的托管服务）。

**优势**：免运维、按需付费、自动扩缩。
**劣势**：冷启动延迟、厂商锁定、调试困难、长任务不友好。

**驱动因素**：事件驱动场景、流量波动大、想专注业务代码。

| 架构 | 部署单元 | 通信方式 | 数据库 | 典型问题 |
|------|---------|---------|--------|---------|
| 单体 | 单个应用 | 方法调用 | 共享 | 改动影响全局 |
| 分层 | 单个应用 | 方法调用 | 共享 | 仍单点部署 |
| SOA | 多服务 | ESB | 多为共享 | ESB 瓶颈 |
| 微服务 | 多服务 | HTTP/gRPC | 每服务独享 | 分布式事务 |
| 云原生 | 容器组 | Service Mesh | 每服务独享 | 运维复杂度高 |
| Serverless | 函数 | 事件触发 | 托管 | 冷启动/厂商锁定 |

> **架构选择的金科玉律**：从单体开始，被业务倒逼再演进。不要为了"先进"而微服务化，小团队搞微服务会被分布式复杂度拖垮。

---

## 请求的完整生命周期

当你在浏览器输入网址到看到页面，背后发生了一连串后端相关的事。理解这条链路是排查性能问题和线上故障的基础。

\`\`\`
浏览器
  │ 1. DNS 解析：域名 → IP（可能命中各级缓存）
  ▼
2. TCP 三次握手（建立连接，1.5 RTT）
  │
  ▼
3. TLS 握手（HTTPS 才有，协商加密，TLS1.2 需 2 RTT，TLS1.3 需 1 RTT）
  │
  ▼
4. 发送 HTTP 请求（请求行 + Headers + Body）
  │
  ▼
5. CDN 边缘节点（静态资源就近返回，动态请求回源）
  │
  ▼
6. 负载均衡（LB，四层 LVS / 七层 Nginx，转发到后端）
  │
  ▼
7. API 网关（鉴权、限流、路由、协议转换、日志）
  │
  ▼
8. 应用服务器（中间件链 → 业务逻辑 → 数据访问层）
  │
  ▼
9. 缓存层（Redis 本地/分布式缓存，命中直接返回）
  │
  ▼
10. 数据库（读写分离、主从、分库分表）
  │
  ▼
11. 组装响应，原路返回（HTTP 响应 → TLS 加密 → TCP 传输）
  │
  ▼
浏览器渲染页面
\`\`\`

每一步都可能成为性能瓶颈：DNS 慢、TCP/TLS 握手开销、网关排队、DB 查询慢。后端工程师要能定位"慢在哪里"，这就需要理解整条链路，并借助链路追踪（如 Jaeger/Zipkin）看到每个环节的耗时。

### 各环节耗时典型值

| 环节 | 典型耗时 | 优化方向 |
|------|---------|---------|
| DNS 解析 | 20-120ms | DNS 预解析、HTTPDNS、本地缓存 |
| TCP 握手 | 1 RTT | Keep-Alive 连接复用 |
| TLS 握手 | 1-2 RTT | TLS 1.3、Session Resumption |
| 网关处理 | 1-5ms | 网关性能、规则精简 |
| 应用业务 | 5-50ms | 逻辑优化、异步化 |
| Redis 缓存 | 0.5-2ms | 本地缓存、Pipeline |
| MySQL 查询 | 2-20ms | 索引、连接池、读写分离 |

### 后端处理一个请求的内部流程

\`\`\`python
# Python（Flask 风格）请求处理伪代码
@app.route("/api/orders", methods=["POST"])
@auth_required          # 中间件：鉴权
@rate_limit(per=100)    # 中间件：限流
def create_order():
    data = request.get_json()          # 解析入参
    order = OrderService.create(data)  # 业务逻辑
    log_access(request, order)         # 审计日志
    return jsonify(order.to_dict())    # 序列化响应
\`\`\`

\`\`\`js
// Node.js（Express 风格）请求处理伪代码
app.post("/api/orders",
  authMiddleware,      // 鉴权
  rateLimitMiddleware, // 限流
  async (req, res) => {
    const data = req.body;                  // 解析入参
    const order = await OrderService.create(data); // 业务
    logAccess(req, order);                  // 审计
    res.json(order);                        // 响应
  }
);
\`\`\`

请求进入应用后，依次经过一条"中间件链"（洋葱模型），每层可前置/后置处理，最核心是业务逻辑层，再往下是数据访问。任何一层都可以提前终止请求（如鉴权失败直接返回 401）。

---

## 后端技术栈全景对比

不同语言各有优劣，选型要看团队、生态和场景。下面从语言特性、并发模型、生态、性能、适用场景五个维度对比主流后端语言。

### 五大语言横向对比

| 语言 | 代表框架 | 并发模型 | 优势 | 劣势 | 典型场景 |
|------|---------|---------|------|------|---------|
| Java | Spring Boot | 多线程（线程池） | 生态成熟、性能稳、企业级 | 启动慢、内存大、代码较重 | 大型企业系统、金融 |
| Go | Gin/Echo | 协程（goroutine） | 高性能、并发强、部署简单 | 生态不如 Java、泛型较新 | 云原生、中间件、高并发 |
| Python | Django/Flask | GIL + 异步 | 开发快、库丰富、易学 | 性能弱、GIL 限制 | 数据/AI、原型、脚本 |
| Node.js | Express/NestJS | 事件循环（单线程） | 前后端同构、IO 密集强 | CPU 密集弱、回调历史包袱 | 实时应用、BFF、SSR |
| Rust | Actix/Axum | async + 零成本抽象 | 极致性能、内存安全 | 学习曲线陡、生态年轻 | 系统软件、高性能网关 |

### 并发模型详解

并发模型决定了一个语言如何处理大量并发请求，是后端性能的核心。

**Java——线程模型**：每个请求分配一个线程，线程阻塞时让出 CPU。线程开销大（栈内存 MB 级），高并发下线程数受限。Java 21 引入虚拟线程（Loom）解决此问题。

**Go——协程模型**：goroutine 是用户态轻量线程，栈仅几 KB，可轻松开十万级。Go runtime 调度协程到少量系统线程上，阻塞时自动切换。这是 Go 高并发的核心。

**Node.js——事件循环**：单线程事件循环，IO 操作异步非阻塞。适合 IO 密集，但 CPU 密集任务会阻塞整个循环。

**Python——GIL 限制**：GIL 使同一时刻只有一个线程执行 Python 字节码，多线程无法利用多核。异步 IO（asyncio）可处理高并发 IO，但 CPU 密集要用多进程。

**Rust——async/await**：零成本抽象的异步，编译期生成状态机，无 GC，性能接近 C++。

\`\`\`go
// Go：goroutine 轻松并发
func main() {
    for i := 0; i < 100000; i++ {
        go handle(i) // 启动十万个协程毫无压力
    }
    time.Sleep(time.Second)
}
\`\`\`

\`\`\`js
// Node.js：事件循环 + 异步 IO
const results = await Promise.all(
  ids.map(id => fetchUser(id)) // 并发发起，事件循环统一调度
);
\`\`\`

### 多语言"Hello World HTTP 服务"对照

\`\`\`java
// Java (Spring Boot)
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication
@RestController
public class App {
  public static void main(String[] args) {
    SpringApplication.run(App.class, args);
  }
  @GetMapping("/hello")
  public String hello() {
    return "Hello World";
  }
}
\`\`\`

\`\`\`go
// Go (net/http)
package main

import (
  "fmt"
  "net/http"
)

func main() {
  http.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello World")
  })
  http.ListenAndServe(":8080", nil)
}
\`\`\`

\`\`\`python
# Python (Flask)
from flask import Flask
app = Flask(__name__)

@app.route("/hello")
def hello():
    return "Hello World"

if __name__ == "__main__":
    app.run(port=8080)
\`\`\`

\`\`\`js
// Node.js (原生 http)
const http = require("http");
http.createServer((req, res) => {
  if (req.url === "/hello") res.end("Hello World");
}).listen(8080);
\`\`\`

可以看到：Java 注解多、样板代码多但规范；Go 简洁、标准库就能起服务；Python 最短、适合快速开发；Node.js 事件驱动、适合 IO 密集场景。语法虽异，背后模型一致——监听端口、收请求、处理、返回响应。

### 多语言"JSON API"对照

实际后端接口通常返回 JSON。看四种语言如何写一个返回用户列表的 API。

\`\`\`java
// Java (Spring Boot)：返回 JSON
@GetMapping("/api/users")
public List<User> listUsers() {
    return userService.findAll(); // 自动序列化为 JSON
}

// 带参数与校验
@PostMapping("/api/users")
public User create(@Valid @RequestBody UserDTO dto) {
    return userService.create(dto);
}
\`\`\`

\`\`\`go
// Go (Gin)：返回 JSON
func listUsers(c *gin.Context) {
    users := userService.FindAll()
    c.JSON(200, gin.H{"data": users})
}

func main() {
    r := gin.Default()
    r.GET("/api/users", listUsers)
    r.Run(":8080")
}
\`\`\`

\`\`\`python
# Python (Flask)：返回 JSON
from flask import jsonify

@app.route("/api/users")
def list_users():
    users = user_service.find_all()
    return jsonify({"data": [u.to_dict() for u in users]})
\`\`\`

\`\`\`js
// Node.js (Express)：返回 JSON
app.get("/api/users", async (req, res) => {
  const users = await userService.findAll();
  res.json({ data: users });
});
\`\`\`

四个示例体现一个共同模式：**定义路由 → 调用业务 → 序列化响应**。框架封装了 HTTP 细节，让开发者专注业务。这正是后端框架的价值。

### 如何做技术选型

技术选型要考虑以下因素，按权重排序：

1. **团队能力**：团队最熟悉的语言胜过"最优"语言。
2. **生态成熟度**：数据库驱动、监控、ORM 是否齐全。
3. **性能需求**：CPU 密集选 Go/Rust，IO 密集选 Node/Go，业务复杂选 Java。
4. **招人难度**：冷门语言招人难，影响长期维护。
5. **运维成本**：JVM 应用内存大，Go 单二进制部署简单。

> 经验法则：中大型企业系统选 Java，云原生中间件选 Go，数据/AI 选 Python，实时 BFF 选 Node.js，极致性能选 Rust。

---

## 后端工程师能力模型

一个合格的后端工程师需要四层能力，对应不同的职级。

### 初级（0-2 年）：基础能力

- 至少一门后端语言熟练，能独立完成一个接口的开发。
- 理解 HTTP/TCP 等网络协议基础。
- 会用一种关系型数据库，懂 SQL 和基本索引。
- 会用 Git、Linux 基本命令。
- 能写单元测试，理解代码规范。
- 在指导下完成需求，能定位简单 bug。

### 中级（2-5 年）：工程能力

- 能设计清晰分层、可扩展的模块，独立负责一个业务域。
- 理解缓存、消息队列、限流等高并发手段，能应用到实际场景。
- 能做数据库设计（表结构、索引、分库分表方案）。
- 能写高质量的单元测试和集成测试，参与代码评审。
- 懂容器化部署（Docker/K8s 基础），能排查线上常见问题。
- 理解分布式基础（CAP、一致性、可用性）。

### 高级（5-8 年）：架构能力

- 能做技术选型与权衡，设计中等规模系统架构。
- 理解分布式系统的 CAP、一致性、可用性，能设计最终一致性方案。
- 能定位线上性能瓶颈与故障（GC、慢查询、网络抖动）。
- 具备系统演进与重构的判断力，知道何时重构、如何平滑迁移。
- 能指导中级工程师，制定技术规范。

### 架构师（8 年+）：系统思维

- 能设计高可用、高并发、可扩展的大型系统（百万 QPS 级）。
- 具备跨团队的技术领导力，推动技术战略落地。
- 理解业务全貌，能从业务出发做架构决策。
- 平衡短期交付与长期演进，控制技术债。
- 关注行业趋势，引入合适的新技术。

| 能力维度 | 初级 | 中级 | 高级 | 架构师 |
|---------|------|------|------|--------|
| 编码 | 完成单个接口 | 独立负责模块 | 设计系统 | 定义规范 |
| 数据库 | 会写 SQL | 设计表与索引 | 分库分表方案 | 全局数据架构 |
| 并发 | 了解概念 | 应用缓存/队列 | 设计高并发 | 容量规划 |
| 故障 | 定位简单 bug | 排查线上问题 | 定位深层瓶颈 | 故障复盘与体系 |
| 影响 | 自己 | 小组 | 团队 | 跨团队 |

---

## 后端开发工作流

后端开发不是"接需求就写代码"，而是一个完整的工程流程。

### 1. 需求评审

产品经理讲需求，后端评估技术可行性和工作量。关键点：
- 澄清模糊需求，明确边界条件。
- 评估技术风险和工作量，给出排期。
- 识别非功能性需求（并发量、数据量、安全要求）。

### 2. 技术方案设计

编码前先写技术方案，包含：
- 接口设计（URL、入参、出参、错误码）。
- 数据库设计（表结构、索引、迁移）。
- 流程图/时序图，理清调用关系。
- 影响面分析（改了会影响哪些已有功能）。
- 风险点和回滚方案。

> "磨刀不误砍柴工"——好的技术方案能避免返工，是高级工程师和初级工程师的最大区别之一。

### 3. 编码

按方案实现，遵循：
- 分层清晰（Controller/Service/DAO）。
- 命名规范、单一职责。
- 防御性编程（参数校验、空值处理）。
- 关键逻辑加注释，解释"为什么"而非"是什么"。

### 4. 自测

- 单元测试覆盖核心逻辑。
- 本地联调，覆盖正常和异常路径。
- 边界测试（空值、超大、并发）。

### 5. Code Review

提交 MR/PR，由同事评审。关注：
- 逻辑正确性、边界处理。
- 安全隐患（注入、越权）。
- 性能问题（N+1 查询、循环里调 DB）。
- 代码可读性和规范。

### 6. 测试

- QA 做功能测试、回归测试。
- 性能测试（压测，验证容量预估）。
- 安全测试（渗透、漏洞扫描）。

### 7. 上线

- 灰度发布（先小流量，逐步扩大）。
- 蓝绿/金丝雀发布，可快速回滚。
- 上线后盯监控，确认关键指标正常。

### 8. 监控与运维

- 监控告警（延迟、错误率、饱和度）。
- 日志留存，便于排查。
- 定期复盘线上问题，沉淀经验。

\`\`\`
需求评审 → 技术方案 → 编码 → 自测 → Code Review → 测试 → 灰度上线 → 监控 → 复盘
   ↑                                                              │
   └────────────────────── 经验反哺新需求 ────────────────────────┘
\`\`\`

---

## 常见误区与实战要点

1. **"前端校验过了后端就不用校验"**——大错特错。前端校验只为体验，后端校验才是安全底线，所有请求都不可信。攻击者可以用 curl/Postman 绕过前端直接调接口。

2. **"先实现功能，性能以后再优化"**——要避免过早优化，但数据量级和索引要在设计时就考虑，否则后期改造成本极高。一个没建索引的字段，千万级数据查询就卡死。

3. **"加缓存就能解决性能问题"**——缓存引入一致性问题，用错反而更慢。先定位瓶颈（DB？网络？GC？），再对症下药。缓存适合"读多写少、容忍短暂不一致"的场景。

4. **"微服务一定比单体好"**——小项目用微服务是过度设计，分布式事务和运维成本会拖垮团队。架构要匹配业务规模。Martin Fowler 说："先单体，等痛了再拆。"

5. **忽视可观测性**——日志、指标、链路追踪是线上系统的"眼睛"，没有它们，出问题只能瞎猜。可观测性要从第一天就建好，不是出了事才补。

6. **"数据库是万能的"**——把所有逻辑塞进 SQL、把缓存当数据库用、用数据库做消息队列，都是常见反模式。每种存储有它的定位，混用必踩坑。

7. **忽视幂等性**——网络抖动导致重试，非幂等接口（如转账）重试会重复扣款。所有写操作都要考虑幂等。

8. **同步调用链太长**——A→B→C→D 同步调用，任何一个慢整体就慢。能用异步就用异步，用消息队列解耦。

---

## 面试题精选

**Q1：后端接口响应慢，如何排查？**
答：按链路分层排查。先看监控定位是哪一层慢：网关、应用、缓存、DB。应用层看 CPU/内存/GC；DB 层用慢查询日志和 EXPLAIN 看执行计划；网络层看 RTT 和带宽。借助链路追踪（Jaeger）能看到完整调用链每个环节耗时。

**Q2：如何设计一个高并发系统？**
答：核心思路是"无状态可扩展 + 缓存 + 异步 + 削峰"。1) 服务无状态化，可水平扩展；2) 多级缓存（本地+Redis）挡住读压力；3) 写操作异步化（消息队列）；4) 限流降级保护系统；5) 数据库读写分离、分库分表；6) 容量预估和压测验证。

**Q3：单体、微服务怎么选？**
答：看业务规模和团队能力。业务简单、团队小用单体，开发部署都快。业务复杂、团队大、需要独立部署和扩展时再拆微服务。拆分要有清晰的领域边界，否则拆成"分布式单体"更糟。

**Q4：什么是最终一致性？**
答：放弃强一致性，允许数据在短时间内不一致，但最终会一致。通过消息队列 + 重试 + 幂等实现。例如下单后积分不是立即到账，而是异步处理，最终一致。适合高并发、容忍延迟的场景。

**Q5：CAP 定理是什么？**
答：分布式系统三者不可兼得：一致性（Consistency）、可用性（Availability）、分区容错（Partition tolerance）。网络分区必然存在，所以要在 C 和 A 间权衡。CP 系统优先一致性（如 ZooKeeper），AP 系统优先可用性（如 Cassandra）。

---

## 生产案例

**案例一：缓存击穿导致 DB 雪崩**
某电商大促，热点商品缓存过期瞬间，海量请求穿透到 DB，DB 瞬间被打挂，连锁导致整个系统不可用。
**解决**：热点 key 永不过期 + 互斥锁（只允许一个请求回源）+ 后台异步刷新。

**案例二：未做幂等导致重复扣款**
网络超时，客户端重试转账接口，后端没有幂等控制，导致一笔转账扣了两次款。
**解决**：用幂等键（业务流水号），服务端记录已处理的请求，重复请求直接返回上次结果。

**案例三：慢查询拖垮数据库**
一个没建索引的 LIKE 查询，数据量上来后全表扫描，占满数据库连接池，所有请求阻塞。
**解决**：给查询字段建索引；前缀模糊查询用 Elasticsearch；SQL 上线前必经 EXPLAIN 审查。

**案例四：单体应用一次发布全站故障**
单体应用一个模块的 bug 导致 OOM，整个应用崩溃，所有功能不可用。
**解决**：核心链路拆分独立部署，故障隔离；引入灰度发布，先小流量验证。

## 七、后端架构模式深度对比

### 7.1 分层架构（Layered Architecture）

分层架构是最经典的后端架构模式，将系统按职责水平切分为多个层级，每层只与相邻层通信。

**典型四层结构**：

| 层级 | 职责 | 典型组件 |
|------|------|----------|
| 表现层（Presentation） | 接收请求、参数校验、返回响应 | Controller、API Gateway |
| 业务层（Business） | 核心业务逻辑编排 | Service、Domain Service |
| 持久层（Persistence） | 数据访问与持久化 | Repository、DAO、ORM |
| 数据库层（Database） | 数据存储 | MySQL、PostgreSQL、Redis |

**Java Spring 分层示例**：

\`\`\`java
@RestController
@RequestMapping("/api/users")
public class UserController {                    // 表现层
    @Autowired private UserService userService;
    @GetMapping("/{id}")
    public UserDTO getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
}

@Service
public class UserService {                       // 业务层
    @Autowired private UserRepository repo;
    public UserDTO findById(Long id) {
        User user = repo.findById(id).orElseThrow();
        return toDTO(user);
    }
}

public interface UserRepository                  // 持久层
    extends JpaRepository<User, Long> {}
\`\`\`

**Go 分层示例**：

\`\`\`go
// handler/user_handler.go
func GetUser(w http.ResponseWriter, r *http.Request) {
    id := chi.URLParam(r, "id")
    user, err := userService.FindByID(id)
    if err != nil {
        respondError(w, http.StatusNotFound, err)
        return
    }
    respondJSON(w, user)
}

// service/user_service.go
func FindByID(id string) (*User, error) {
    return userRepo.FindByID(id)
}

// repository/user_repo.go
func FindByID(id string) (*User, error) {
    var u User
    err := db.Get(&u, "SELECT * FROM users WHERE id=$1", id)
    return &u, err
}
\`\`\`

**优点**：结构清晰、职责分离、易于测试（可 Mock 下层）、团队协作友好。
**缺点**：容易"穿透"（跳过中间层直接访问数据库）、简单 CRUD 显得冗余、性能开销（多层调用）。

### 7.2 六边形架构（Hexagonal Architecture / Ports and Adapters）

由 Alistair Cockburn 提出，核心思想是**将业务逻辑置于中心，通过端口（Port）与适配器（Adapter）与外部世界交互**。

\`\`\`
                    ┌─────────────┐
   HTTP Adapter ──→ │             │ ──→ MySQL Adapter
   gRPC Adapter ──→ │  Domain     │ ──→ Redis Adapter
   CLI Adapter  ──→ │  Core       │ ──→ Kafka Adapter
   MQ Adapter   ──→ │             │ ──→ Email Adapter
                    └─────────────┘
\`\`\`

- **端口（Port）**：定义业务逻辑需要的接口（输入端口）和对外暴露的能力（输出端口）
- **适配器（Adapter）**：端口的具体实现（HTTP 适配器、数据库适配器等）

**Java 示例**：

\`\`\`java
// 端口（接口）
public interface UserRepository {
    User findById(Long id);
    void save(User user);
}

// 适配器（实现）
@Repository
public class JpaUserRepository implements UserRepository {
    @Autowired private UserJpaDao dao;
    public User findById(Long id) { return dao.findById(id).orElse(null); }
    public void save(User user) { dao.save(user); }
}

// 业务核心只依赖端口，不依赖具体实现
public class UserRegistrationService {
    private final UserRepository repo;  // 依赖接口
    public UserRegistrationService(UserRepository repo) { this.repo = repo; }
}
\`\`\`

**优点**：业务逻辑与基础设施完全解耦、可替换适配器（如测试用内存适配器）、符合依赖倒置原则。
**缺点**：对简单系统过度设计、学习曲线较陡。

### 7.3 DDD（领域驱动设计）

Eric Evans 提出的方法论，核心是**以业务领域为中心进行建模**。

**核心概念**：

| 概念 | 含义 | 示例 |
|------|------|------|
| 实体（Entity） | 有唯一标识的领域对象 | User、Order |
| 值对象（Value Object） | 无标识、不可变 | Money、Address |
| 聚合（Aggregate） | 一组关联对象的集合，有聚合根 | Order + OrderItem |
| 领域服务（Domain Service） | 不属于单个实体的业务逻辑 | TransferService（转账） |
| 仓储（Repository） | 聚合的持久化接口 | OrderRepository |
| 领域事件（Domain Event） | 业务发生的事实 | OrderCreatedEvent |
| 限界上下文（Bounded Context） | 模型的边界 | 订单上下文、库存上下文 |

**聚合设计原则**：
1. 聚合要小——只包含必须一致的属性
2. 聚合之间通过 ID 引用，不直接持有对象引用
3. 聚合内强一致性，聚合间最终一致性
4. 一个事务只修改一个聚合

**Java DDD 示例**：

\`\`\`java
// 聚合根
public class Order {
    private OrderId id;
    private List<OrderItem> items;
    private OrderStatus status;

    public void addItem(ProductId productId, int quantity) {
        // 业务规则校验
        if (status != OrderStatus.DRAFT) {
            throw new IllegalStateException("只有草稿订单可添加商品");
        }
        items.add(new OrderItem(productId, quantity));
        // 发布领域事件
        DomainEvents.publish(new ItemAddedEvent(id, productId, quantity));
    }

    public void submit() {
        if (items.isEmpty()) throw new IllegalStateException("空订单不可提交");
        this.status = OrderStatus.SUBMITTED;
        DomainEvents.publish(new OrderSubmittedEvent(id));
    }
}

// 值对象
public class Money {
    private final BigDecimal amount;
    private final String currency;
    // 不可变，操作返回新对象
    public Money add(Money other) {
        if (!currency.equals(other.currency)) throw new IllegalArgumentException();
        return new Money(amount.add(other.amount), currency);
    }
}
\`\`\`

### 7.4 微服务架构

将单体应用拆分为多个独立部署的小服务，每个服务负责一个业务能力。

**微服务拆分原则**：
- 单一职责：每个服务做一件事
- 限界上下文对应：按 DDD 的限界上下文拆分
- 独立部署：每个服务可独立上线
- 去中心化数据：每个服务有自己的数据库

**微服务技术栈对比**：

| 能力 | Java Spring Cloud | Go Kratos | Node.js NestJS | Python FastAPI |
|------|-------------------|-----------|----------------|----------------|
| 服务注册发现 | Eureka/Nacos | Consul/etcd | Consul | Consul |
| 配置中心 | Spring Cloud Config | Apollo | Apollo | Apollo |
| 网关 | Spring Cloud Gateway | Kratos Gateway | NestJS Gateway | FastAPI Gateway |
| 熔断限流 | Hystrix/Sentinel | Bilibili Kratos | opossum | circuitbreaker |
| 链路追踪 | Sleuth+Zipkin | OpenTelemetry | OpenTelemetry | OpenTelemetry |
| RPC | Feign(gRPC) | gRPC | gRPC | gRPC |

**微服务的挑战**：
1. **分布式事务**：跨服务的数据一致性（Saga、TCC、可靠消息最终一致性）
2. **服务间通信**：同步（HTTP/gRPC）vs 异步（消息队列）
3. **数据查询**：跨服务 JOIN 困难（CQRS、数据冗余）
4. **运维复杂度**：服务数量多、需要 CI/CD、容器编排（K8s）
5. **调试困难**：一个请求跨多个服务，需要全链路追踪

### 7.5 架构选型建议

| 场景 | 推荐架构 | 原因 |
|------|----------|------|
| 创业期 MVP | 单体 | 快速迭代、人员少 |
| 中型业务 | 分层单体 + 模块化 | 清晰但不过度拆分 |
| 大型复杂业务 | 微服务 + DDD | 团队并行、独立部署 |
| 高并发读多写少 | CQRS + 缓存 | 读写分离、各自优化 |
| 事件驱动业务 | 事件溯源 + CQRS | 完整审计、可回放 |

## 八、数据存储技术全景

### 8.1 关系型数据库（RDBMS）

**代表产品**：MySQL、PostgreSQL、Oracle、SQL Server

**核心特性**：ACID 事务、SQL 查询、强一致性、B+ 树索引、外键约束

**适用场景**：订单、账户、财务等对一致性要求高的核心业务

**MySQL 存储引擎对比**：

| 特性 | InnoDB | MyISAM |
|------|--------|--------|
| 事务 | 支持 | 不支持 |
| 行锁 | 支持 | 只有表锁 |
| 外键 | 支持 | 不支持 |
| 崩溃恢复 | 支持（redo log） | 不支持 |
| 聚簇索引 | 是 | 否 |
| 全文索引 | 5.6+ 支持 | 支持 |

**索引优化要点**：
1. 联合索引最左前缀原则
2. 覆盖索引避免回表
3. 避免索引失效（函数操作、隐式类型转换、LIKE 前缀通配）
4. EXPLAIN 分析执行计划

### 8.2 NoSQL 数据库

**四大分类**：

| 类型 | 代表 | 数据模型 | 适用场景 |
|------|------|----------|----------|
| 键值（KV） | Redis、Memcached | key→value | 缓存、会话、计数器 |
| 文档 | MongoDB、CouchDB | JSON/BSON | 内容管理、灵活 schema |
| 列族 | HBase、Cassandra | 行键+列族 | 海量数据写入、时序数据 |
| 图 | Neo4j、ArangoDB | 节点+边 | 社交关系、推荐、知识图谱 |

**Redis 数据结构**：

\`\`\`
String  : SET key value / GET key        → 计数器、缓存
Hash    : HSET key field value            → 对象存储
List    : LPUSH/RPUSH key value           → 消息队列、最新列表
Set     : SADD key member                 → 标签、共同好友
ZSet    : ZADD key score member           → 排行榜、延迟队列
Stream  : XADD key * field value          → 消息流（5.0+）
HyperLogLog : PFADD key element           → 去重计数（UV）
Bitmap  : SETBIT key offset value         → 签到、布隆过滤器
Geo     : GEOADD key lng lat member       → 附近的人
\`\`\`

### 8.3 NewSQL

融合关系型的事务能力和 NoSQL 的水平扩展能力。

**代表产品**：TiDB、CockroachDB、Spanner、OceanBase

**核心特性**：
- 分布式 ACID 事务
- 水平扩展（自动分片）
- 兼容 SQL 协议（MySQL / PostgreSQL 协议）
- 高可用（多副本 + Raft 共识）

**TiDB 架构**：
\`\`\`
┌──────────┐     ┌──────────┐     ┌──────────┐
| TiDB SQL |     | TiDB SQL |     | TiDB SQL |   ← 无状态 SQL 层
└────┬─────┘     └────┬─────┘     └────┬─────┘
     |                |                |
     └────────────────┼────────────────┘
                      |
              ┌───────┴───────┐
              |   PD (调度)   |              ← 元信息与调度
              └───────┬───────┘
     ┌────────────────┼────────────────┐
     |                |                |
┌────┴────┐     ┌────┴────┐     ┌────┴────┐
| TiKV R1 |     | TiKV R2 |     | TiKV R3 |    ← 分布式 KV 存储层
| Raft G1 |     | Raft G2 |     | Raft G3 |      (Region + Raft)
└─────────┘     └─────────┘     └─────────┘
\`\`\`

### 8.4 时序数据库与对象存储

**时序数据库**（InfluxDB、TDengine、Prometheus）：
- 专为带时间戳的数据优化
- 写入远大于读取
- 自动降采样与数据保留策略
- 适用：监控指标、IoT 传感器、行情数据

**对象存储**（S3、OSS、MinIO）：
- 海量非结构化数据（图片、视频、日志）
- 通过 REST API 访问
- 最终一致性、无限容量
- 适用：用户上传文件、备份归档、大数据湖

### 8.5 存储选型决策树

\`\`\`
是否需要强事务一致性？
├─ 是 → 数据量？
│       ├─ 中小 → MySQL/PostgreSQL
│       └─ 超大 → TiDB/OceanBase (NewSQL)
└─ 否 → 数据模型？
        ├─ KV 缓存 → Redis
        ├─ 灵活文档 → MongoDB
        ├─ 海量写入 → HBase/Cassandra
        ├─ 关系网络 → Neo4j
        ├─ 时序数据 → InfluxDB/TDengine
        └─ 文件对象 → S3/OSS/MinIO
\`\`\`

> **存储选型心法**：不要用一种数据库解决所有问题。让关系型做它擅长的事务，让 Redis 做缓存，让 ES 做搜索，让对象存储放文件。多数据源 + 数据同步（CDC）是大型系统的常态。

## 九、缓存架构与策略

### 9.1 缓存的价值

缓存的本质是**用空间换时间**——将计算结果或热点数据存储在更快的介质中，减少对慢速介质的访问。

**多级缓存架构**：

\`\`\`
浏览器缓存 → CDN 缓存 → 网关缓存 → 应用本地缓存 → 分布式缓存 → 数据库
   ↑最快                                                      ↑最慢
\`\`\`

| 层级 | 介质 | 延迟 | 容量 |
|------|------|------|------|
| L1 CPU 缓存 | SRAM | <1ns | KB |
| 内存 | DRAM | ~100ns | GB |
| 本地缓存（进程内） | 堆内存 | ~1μs | MB-GB |
| 分布式缓存（Redis） | 网络内存 | ~1ms | GB-TB |
| 数据库（SSD） | 磁盘 | ~10ms | TB |

### 9.2 缓存模式

**1. Cache-Aside（旁路缓存）**——最常用

\`\`\`
读：先查缓存 → 命中返回 / 未命中查 DB → 写入缓存 → 返回
写：更新 DB → 删除缓存
\`\`\`

**Java 实现**：

\`\`\`java
public User getUser(Long id) {
    User user = redis.get("user:" + id);
    if (user != null) return user;          // 缓存命中
    user = db.findById(id);                  // 查数据库
    if (user != null) {
        redis.setex("user:" + id, 3600, user);  // 写缓存，设过期
    }
    return user;
}

public void updateUser(User user) {
    db.update(user);                         // 先更新 DB
    redis.del("user:" + user.getId());       // 再删缓存
}
\`\`\`

**Go 实现**：

\`\`\`go
func GetUser(id int64) (*User, error) {
    key := fmt.Sprintf("user:%d", id)
    if u, ok := cache.Get(key); ok {         // 缓存命中
        return u, nil
    }
    u, err := db.FindByID(id)                // 查 DB
    if err != nil { return nil, err }
    cache.Set(key, u, time.Hour)             // 写缓存
    return u, nil
}
\`\`\`

**2. Read-Through**：应用只访问缓存，缓存组件负责回源
**3. Write-Through**：写请求同时写缓存和 DB（同步）
**4. Write-Behind（Write-Back）**：先写缓存，异步写 DB（高性能但有数据丢失风险）

### 9.3 缓存三大问题

| 问题 | 描述 | 解决方案 |
|------|------|----------|
| 缓存穿透 | 查询不存在的数据，每次都打到 DB | 布隆过滤器 / 缓存空值 |
| 缓存击穿 | 热点 key 过期瞬间大量请求打到 DB | 互斥锁 / 永不过期+异步刷新 |
| 缓存雪崩 | 大量 key 同时过期 | 过期时间加随机值 / 多级缓存 |

**布隆过滤器防穿透**：

\`\`\`java
public User getUser(Long id) {
    if (!bloomFilter.mightContain(id)) {     // 布隆过滤器先判断
        return null;                         // 一定不存在
    }
    User user = redis.get("user:" + id);
    if (user != null) return user;
    user = db.findById(id);
    if (user != null) {
        redis.setex("user:" + id, 3600, user);
    } else {
        redis.setex("user:null:" + id, 60, "NULL");  // 缓存空值
    }
    return user;
}
\`\`\`

**互斥锁防击穿**：

\`\`\`java
public User getHotUser(Long id) {
    User user = redis.get("user:" + id);
    if (user != null) return user;
    // 获取分布式锁
    String lockKey = "lock:user:" + id;
    if (redis.setnx(lockKey, "1", 10)) {     // 加锁
        try {
            user = db.findById(id);           // 只有一个线程查 DB
            redis.setex("user:" + id, 3600, user);
        } finally {
            redis.del(lockKey);              // 释放锁
        }
    } else {
        Thread.sleep(50);                    // 等待重试
        return getHotUser(id);
    }
    return user;
}
\`\`\`

### 9.4 缓存一致性

**为什么删除缓存而不是更新缓存？**
1. 避免并发写导致缓存与 DB 不一致
2. 有些缓存值计算复杂，更新开销大
3. 懒加载——用到时才计算

**延迟双删**（解决主从延迟问题）：

\`\`\`java
public void updateUser(User user) {
    redis.del("user:" + user.getId());       // 先删缓存
    db.update(user);                         // 更新 DB
    // 异步延迟再删一次（等从库同步完）
    scheduler.schedule(() -> {
        redis.del("user:" + user.getId());   // 延迟再删
    }, 500, TimeUnit.MILLISECONDS);
}
\`\`\`

## 十、消息队列与异步处理

### 10.1 为什么需要消息队列

**核心作用**：解耦、异步、削峰

| 场景 | 同步调用的问题 | 消息队列的解法 |
|------|----------------|----------------|
| 注册后发短信 | 短信服务慢拖累注册 | 发消息即返回，消费者异步发短信 |
| 秒杀 | 瞬时高并发压垮 DB | 请求入队列，消费者按能力处理 |
| 订单系统通知库存 | 库存服务宕机导致下单失败 | 消息持久化，库存恢复后继续消费 |

### 10.2 主流消息队列对比

| 特性 | Kafka | RabbitMQ | RocketMQ | Pulsar |
|------|-------|----------|----------|--------|
| 吞吐量 | 百万级/秒 | 万级/秒 | 十万级/秒 | 百万级/秒 |
| 延迟 | 毫秒级 | 微秒级 | 毫秒级 | 毫秒级 |
| 顺序消息 | 分区内有序 | 队列内有序 | 支持 | 支持 |
| 事务消息 | 不支持 | 不支持 | 支持 | 支持 |
| 消息回溯 | 支持（offset） | 不支持 | 支持（按时间） | 支持 |
| 适用场景 | 日志、大数据 | 企业应用、复杂路由 | 电商、金融 | 多租户、流处理 |

### 10.3 消息可靠性保证

**生产者端**——确认机制：

\`\`\`java
// RabbitMQ 发布确认
channel.confirmSelect();
channel.basicPublish("", "order.queue", null, message.getBytes());
if (!channel.waitForConfirms(5000)) {
    // 发送失败，重试或落库补偿
    retryOrPersist(message);
}
\`\`\`

**Kafka 生产者 acks 配置**：
- \`acks=0\`：不等待确认（最快，可能丢）
- \`acks=1\`：Leader 确认（默认）
- \`acks=all\`：所有 ISR 副本确认（最安全）

**消费者端**——手动确认：

\`\`\`java
// 消费者手动 ACK
channel.basicConsume("order.queue", false, (consumerTag, delivery) -> {
    try {
        processMessage(delivery.getBody());
        channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);  // 处理成功才确认
    } catch (Exception e) {
        // 处理失败，requeue 或进入死信队列
        channel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, false);
    }
}, consumerTag -> {});
\`\`\`

### 10.4 消息幂等性

网络重试可能导致消息重复消费，必须保证幂等。

**方案一：唯一 ID 去重**

\`\`\`go
func ConsumeOrder(msg []byte) error {
    var order OrderEvent
    json.Unmarshal(msg, &order)
    
    // 用 Redis SETNX 判断是否处理过
    ok, _ := redis.SetNX("msg:processed:"+order.MsgID, "1", 24*time.Hour)
    if !ok {
        return nil  // 已处理过，跳过
    }
    return processOrder(order)
}
\`\`\`

**方案二：数据库唯一约束**

\`\`\`sql
-- 消息处理记录表
CREATE TABLE msg_consumed (
    msg_id VARCHAR(64) PRIMARY KEY,
    consumed_at TIMESTAMP DEFAULT NOW()
);
-- 插入冲突即已处理
INSERT INTO msg_consumed(msg_id) VALUES(?)
ON CONFLICT DO NOTHING;
\`\`\`

### 10.5 死信队列（DLQ）

处理失败的消息进入死信队列，人工排查。

\`\`\`java
// RabbitMQ 死信配置
Map<String, Object> args = new HashMap<>();
args.put("x-dead-letter-exchange", "dlx.exchange");
args.put("x-dead-letter-routing-key", "dlx.routing.key");
channel.queueDeclare("order.queue", true, false, false, args);
\`\`\`

> **消息队列心法**：引入 MQ 增加了系统复杂度——要考虑消息丢失、重复、顺序、积压。不是所有场景都需要 MQ，简单的异步用线程池即可。MQ 适合"跨服务、跨团队、需要可靠投递"的场景。

## 十一、可观测性三支柱

### 11.1 日志（Logging）

记录离散事件，用于排查问题。

**日志规范**：
- 结构化日志（JSON 格式，便于 ELK 检索）
- 包含 traceId（串联一次请求的所有日志）
- 分级：DEBUG / INFO / WARN / ERROR
- 不记录敏感信息（密码、token）

**Java Logback 结构化日志**：

\`\`\`xml
<appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
        <fieldNames>
            <timestamp>@timestamp</timestamp>
            <message>message</message>
        </fieldNames>
    </encoder>
</appender>
\`\`\`

**日志示例**：

\`\`\`json
{
  "@timestamp": "2026-01-15T10:30:00.123Z",
  "level": "INFO",
  "service": "order-service",
  "traceId": "a1b2c3d4e5f6",
  "spanId": "f6e5d4c3b2a1",
  "userId": 12345,
  "action": "create_order",
  "orderId": "ORD_20260115_001",
  "duration_ms": 156,
  "message": "订单创建成功"
}
\`\`\`

### 11.2 指标（Metrics）

聚合数值，用于监控告警。

**Prometheus 指标类型**：
- **Counter**：只增不减（请求总数、错误总数）
- **Gauge**：可增可减（当前连接数、队列长度）
- **Histogram**：分布统计（请求延迟分布）
- **Summary**：分位数（P99 延迟）

**Java Micrometer 示例**：

\`\`\`java
@Service
public class OrderService {
    private final Counter orderCounter;
    private final Timer orderTimer;

    public OrderService(MeterRegistry registry) {
        orderCounter = registry.counter("orders.created.total", "type", "normal");
        orderTimer = registry.timer("orders.creation.duration");
    }

    public Order createOrder(OrderRequest req) {
        return orderTimer.record(() -> {
            Order order = doCreate(req);
            orderCounter.increment();  // 计数
            return order;
        });
    }
}
\`\`\`

**核心监控指标（USE 方法）**：
- **U**tilization：资源使用率（CPU、内存、磁盘）
- **S**aturation：饱和度（队列长度、等待线程数）
- **E**rrors：错误数（HTTP 5xx、异常数）

### 11.3 链路追踪（Tracing）

记录一次请求在分布式系统中的完整调用路径。

**OpenTelemetry 标准化**：统一了日志、指标、追踪三大支柱的 API。

**Java 自动埋点**：

\`\`\`java
// Spring Boot 集成 OpenTelemetry
@RestController
public class OrderController {
    @GetMapping("/orders/{id}")
    public Order getOrder(@PathVariable String id) {
        Span span = tracer.spanBuilder("getOrder").startSpan();
        try (Scope scope = span.makeCurrent()) {
            span.setAttribute("order.id", id);
            Order order = orderService.findById(id);  // 自动传播 traceId
            return order;
        } finally {
            span.end();
        }
    }
}
\`\`\`

**追踪数据结构**：

\`\`\`
Trace: a1b2c3d4e5f6
├─ Span: GET /orders/123 [gateway]        0ms──200ms
│  ├─ Span: GET /order-service/orders/123  5ms──150ms
│  │  ├─ Span: SELECT * FROM orders        10ms──30ms  [mysql]
│  │  └─ Span: GET /user-service/users/456 35ms──80ms  [http]
│  │     └─ Span: GET user:456              40ms──60ms  [redis]
│  └─ Span: POST /log-service              155ms──195ms
\`\`\`

**核心概念**：
- **Trace**：一次完整的请求链路
- **Span**：一个操作单元（有开始/结束时间）
- **Context Propagation**：traceId/spanId 跨服务传播（通过 HTTP Header 或 MQ Header）

### 11.4 告警体系

**告警分级**：
- **P0（致命）**：核心服务宕机、数据丢失 → 电话+短信，立即响应
- **P1（严重）**：核心接口错误率 > 5% → 短信+IM，30 分钟响应
- **P2（警告）**：CPU > 80%、延迟升高 → IM 通知，工作时间处理
- **P3（提示）**：日志量异常 → 邮件，巡检处理

**告警原则**：
1. 可执行——告警必须能让人采取行动
2. 不噪音——避免告警风暴（收敛、聚合）
3. 有基线——动态基线比静态阈值更准确

> **可观测性心法**：没有可观测性的系统是"黑盒"，出了问题只能靠猜。日志用于"发生了什么"，指标用于"整体怎么样"，追踪用于"问题在哪里"。三者结合，才能做到"5 分钟发现问题，5 分钟定位原因"。

## 十二、后端工程师能力模型与成长路径

### 12.1 能力分层

| 级别 | 能力要求 | 典型表现 |
|------|----------|----------|
| 初级（P1-P3） | 能独立完成模块开发 | 写 CRUD、修 bug、写单元测试 |
| 中级（P4-P5） | 能设计子系统、排查复杂问题 | 技术方案设计、性能优化、带新人 |
| 高级（P6-P7） | 能架构系统、跨团队协作 | 架构设计、技术选型、技术规划 |
| 专家（P8+） | 能引领技术方向、解决战略问题 | 技术战略、行业影响力、人才培养 |

### 12.2 核心能力模型

**技术广度**：了解前端、后端、数据库、运维、安全的基础知识
**技术深度**：在某一方向（如分布式系统、数据库、性能优化）有深入理解
**系统思维**：能从整体视角看待系统，理解各组件的交互与权衡
**业务理解**：理解业务目标，技术服务于业务价值
**沟通协作**：能与非技术人员（产品、运营）有效沟通

### 12.3 学习建议

1. **夯实基础**：操作系统、网络、数据结构与算法是根基
2. **读源码**：从优秀开源项目（如 Redis、Netty、Kafka）中学习
3. **做项目**：纸上得来终觉浅，动手做才能内化
4. **写博客**：输出倒逼输入，写出来才知道是否真懂
5. **参与开源**：与优秀工程师协作，提升代码品味

> **核心心法**：后端开发的本质是"在约束下做权衡"——性能与一致性的权衡、简单与灵活的权衡、成本与可用性的权衡。没有银弹，只有适合当前场景的选择。把基本功练扎实，理解每一步背后的原理，比追逐新技术更重要。







下面的可运行代码模拟了一个请求在后端应用中的完整生命周期：经过中间件链（日志→鉴权→限流）后进入业务处理，最终返回响应，并打印每一步耗时和状态。`,
    code: `// 模拟后端请求处理生命周期
// 用纯 JS 对象模拟：路由注册 → 中间件链 → 业务处理 → 响应
// 不依赖 http 模块，演示后端框架的内部机制与洋葱模型

// --- 简单的限流器（固定窗口计数）---
class RateLimiter {
  constructor(maxPerWindow) {
    this.max = maxPerWindow;
    this.count = 0;
    this.windowStart = Date.now();
  }
  allow() {
    // 窗口重置（每 5 秒一个窗口）
    if (Date.now() - this.windowStart > 5000) {
      this.count = 0;
      this.windowStart = Date.now();
    }
    if (this.count >= this.max) return false;
    this.count++;
    return true;
  }
}

// --- 模拟应用对象（类似 Express 的洋葱模型）---
const app = {
  middlewares: [],
  routes: {},
  use(fn) { this.middlewares.push(fn); },                  // 注册中间件
  get(path, h) { this.routes["GET " + path] = h; },        // 注册 GET 路由
  post(path, h) { this.routes["POST " + path] = h; },      // 注册 POST 路由
};

// --- 注册中间件链 ---
// 1. 日志中间件：记录每个请求与耗时
app.use((req, res, next) => {
  req._start = Date.now();
  console.log("[日志] " + req.method + " " + req.path + " - 来自 " + req.ip);
  next();
  const cost = Date.now() - req._start;
  console.log("[日志] 请求完成，耗时 " + cost + "ms，状态 " + res.statusCode);
});
// 2. CORS 中间件：模拟跨域头注入
app.use((req, res, next) => {
  res.headers = { "Access-Control-Allow-Origin": "*" };
  console.log("[CORS] 注入跨域头");
  next();
});
// 3. 鉴权中间件：/admin 路径必须有 token
app.use((req, res, next) => {
  if (req.path.startsWith("/admin") && !req.token) {
    return res.send(401, { error: "未授权：缺少 token" });
  }
  console.log("[鉴权] 通过");
  next();
});

// --- 注册业务路由 ---
app.get("/", (req, res) => res.send(200, { msg: "欢迎来到首页" }));
app.get("/users", (req, res) => {
  // 模拟业务处理耗时（DB 查询）
  const users = ["Alice", "Bob", "Charlie"];
  res.send(200, { users });
});
app.post("/login", (req, res) => {
  // 模拟登录：校验后签发 token
  res.send(200, { token: "fake-jwt-token", expire: 3600 });
});
app.get("/admin/dashboard", (req, res) => res.send(200, { data: "管理后台数据" }));

// --- 模拟响应对象 ---
function createRes() {
  return {
    sent: false,
    statusCode: 0,
    headers: {},
    send(status, body) {
      this.sent = true;
      this.statusCode = status;
      console.log("[响应] " + status + " " + JSON.stringify(body));
    },
  };
}

// 限流器：每窗口最多 5 个请求
const limiter = new RateLimiter(5);

// --- 核心调度函数：处理一个请求 ---
function handleRequest(req) {
  console.log("\\n========== 处理请求: " + req.method + " " + req.path + " ==========");

  // 限流检查（最外层，先于中间件链）
  if (!limiter.allow()) {
    console.log("[限流] 请求过多，被拒绝");
    const res = createRes();
    res.send(429, { error: "请求过于频繁，请稍后再试" });
    return res;
  }

  const res = createRes();
  const key = req.method + " " + req.path;

  // 按顺序执行中间件链，最后分发到路由（洋葱模型的核心）
  let idx = 0;
  const next = () => {
    if (res.sent) return; // 中间件已终止请求
    if (idx < app.middlewares.length) {
      const mw = app.middlewares[idx++];
      mw(req, res, next);
    } else {
      // 中间件链走完，分发到具体路由
      const handler = app.routes[key];
      if (handler) handler(req, res);
      else res.send(404, { error: "路由不存在", path: req.path });
    }
  };
  next();
  return res;
}

// --- 模拟一批请求 ---
handleRequest({ method: "GET", path: "/", ip: "1.1.1.1" });
handleRequest({ method: "GET", path: "/users", ip: "1.1.1.1" });
handleRequest({ method: "POST", path: "/login", ip: "2.2.2.2" });
handleRequest({ method: "GET", path: "/admin/dashboard", ip: "3.3.3.3" }); // 未授权 → 401
handleRequest({ method: "GET", path: "/unknown", ip: "1.1.1.1" });          // 404
handleRequest({ method: "GET", path: "/admin/dashboard", ip: "3.3.3.3", token: "x" }); // 鉴权通过
handleRequest({ method: "GET", path: "/", ip: "1.1.1.1" });                  // 触发限流

console.log("\\n===== 生命周期演示结束 =====");
console.log("请求依次经过：限流 → 日志 → CORS → 鉴权 → 路由 → 响应");
console.log("这正是 Express/Koa 等后端框架的洋葱模型运作方式。");`,
  },

  // ============================================================
  // 第 2 章：HTTP 协议深入
  // ============================================================
  {
    id: "backend-http",
    group: "基础与网络",
    icon: "📋",
    title: "HTTP 协议深入",
    content: `# HTTP 协议深入

HTTP（HyperText Transfer Protocol，超文本传输协议）是 Web 的基石，几乎所有后端接口都建立在它之上。理解 HTTP 不仅是写好 API 的前提，更是排查网络问题、做性能优化的关键。本章从报文结构、方法语义、状态码、头部、版本演进到安全机制，系统讲解 HTTP。

HTTP 是一个**应用层协议**，基于请求-响应模型：客户端发一个请求，服务端回一个响应。它本身是无状态、无连接（早期）的文本协议，简单到可以用 telnet 手动模拟，强大到承载了整个互联网。

---

## HTTP 报文结构

HTTP 是**请求-响应**模型：客户端发一个请求，服务端回一个响应。两者都是纯文本（HTTP/1.x），由三部分组成：

### 请求报文

\`\`\`http
POST /api/users?lang=zh HTTP/1.1        ← 请求行（方法 路径 版本）
Host: api.example.com                    ← 请求头
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...
Content-Length: 42
                                         ← 空行（分隔头部与主体）
{"name":"Alice","age":28}               ← 请求体（可选）
\`\`\`

请求报文三部分：
1. **请求行（Request Line）**：\`方法 路径 版本\`，如 \`POST /api/users HTTP/1.1\`。
2. **请求头（Headers）**：每行一个 \`键: 值\`，描述请求的元信息。
3. **请求体（Body）**：可选，由 \`Content-Length\` 或 \`Transfer-Encoding\` 决定长度。

### 响应报文

\`\`\`http
HTTP/1.1 201 Created                     ← 状态行（版本 状态码 原因短语）
Content-Type: application/json           ← 响应头
Location: /api/users/101
Content-Length: 25
                                         ← 空行
{"id":101,"name":"Alice"}               ← 响应体
\`\`\`

响应报文三部分：
1. **状态行（Status Line）**：\`版本 状态码 原因短语\`，如 \`HTTP/1.1 200 OK\`。
2. **响应头（Headers）**：描述响应的元信息。
3. **响应体（Body）**：可选，实际数据。

**关键细节**：
- 请求行/状态行结束后是若干头部，每行一个 \`键: 值\`。
- 头部结束后必须有一个**空行**（CRLF，即 \\r\\n），标志主体开始。
- 主体长度由 \`Content-Length\` 或 \`Transfer-Encoding: chunked\` 决定。
- HTTP/1.1 头部字段名不区分大小写。
- 行结束符是 CRLF（\\r\\n），不是单纯的 \\n。

### 用 telnet 手动发 HTTP 请求

理解报文结构后，你可以用 telnet 直接连服务器手动发请求，这是排查 HTTP 问题最底层的方式：

\`\`\`bash
$ telnet api.example.com 80
GET /api/users HTTP/1.1
Host: api.example.com

(此处按两次回车，发送空行)
\`\`\`

服务器会返回完整的 HTTP 响应。这种"裸"的交互能让你看清 HTTP 的本质——它就是文本协议。

---

## HTTP 方法语义与幂等性

HTTP 方法（动词）表达对资源的操作意图，符合 REST 语义。理解每个方法的安全性和幂等性，是设计 RESTful API 的基础。

### 方法一览表

| 方法 | 语义 | 安全 | 幂等 | 有主体 | 典型用途 |
|------|------|------|------|--------|---------|
| GET | 获取资源 | 是 | 是 | 否 | 查询列表/详情 |
| POST | 创建资源 | 否 | 否 | 是 | 提交表单、新建 |
| PUT | 整体替换资源 | 否 | 是 | 是 | 更新整体 |
| PATCH | 部分更新资源 | 否 | 否 | 是 | 改个别字段 |
| DELETE | 删除资源 | 否 | 是 | 可选 | 删除记录 |
| HEAD | 只取响应头 | 是 | 是 | 否 | 检查资源是否存在 |
| OPTIONS | 查询支持的方法 | 是 | 是 | 否 | CORS 预检 |

### 安全（Safe）与幂等（Idempotent）

- **安全（Safe）**：不改变服务器状态。GET/HEAD/OPTIONS 是安全的。安全的含义是"调用多少次服务器状态都不变"，并非"不涉及敏感数据"。
- **幂等（Idempotent）**：重复执行效果与执行一次相同。GET/PUT/DELETE 幂等；POST 不幂等。

### 各方法详解

**GET**：获取资源，应是只读的。参数放 query string，不要带 body（虽然技术上可以，但很多代理/网关会丢弃）。GET 请求可被缓存、可被收藏、可被记录在浏览器历史。

**POST**：创建资源，非幂等。每次 POST 都可能创建新资源。body 携带数据。POST 也可用于"动作类"操作（如 \`POST /orders/123/cancel\`）。

**PUT**：整体替换资源，幂等。客户端提供完整资源，服务端整体替换。\`PUT /users/1\` 带 \`{name, age, email}\` 会用这三个字段整体替换。因为每次 PUT 同样的数据结果相同，所以幂等。

**PATCH**：部分更新，非幂等（语义上）。客户端只提供要改的字段。\`PATCH /users/1\` 带 \`{age: 29}\` 只改 age。PATCH 是否幂等取决于实现，RFC 没有强约束。

**DELETE**：删除资源，幂等。删除一个已删除的资源，结果仍是"不存在"，所以幂等。

**HEAD**：与 GET 一样但不返回 body，只返回头。用于检查资源是否存在、获取 Content-Length 等。

**OPTIONS**：查询服务器支持的方法。CORS 预检请求就用 OPTIONS。

### 幂等性的实战意义

幂等性在网络不稳定时极其重要。客户端超时重试时，幂等接口可以安全重试，非幂等接口（如 POST 下单）重试可能创建重复订单。解决方案：用**幂等键**（Idempotency-Key）让 POST 也具备幂等性。

\`\`\`go
// Go：用幂等键防止重复下单
func CreateOrder(req OrderRequest, idempotencyKey string) (*Order, error) {
    // 先查幂等键是否已处理过
    if existing, ok := cache.Get(idempotencyKey); ok {
        return existing, nil // 直接返回上次结果，保证幂等
    }
    order := buildOrder(req)
    db.Save(order)
    cache.Set(idempotencyKey, order, 24*time.Hour)
    return order, nil
}
\`\`\`

\`\`\`python
# Python：用幂等键防止重复下单
def create_order(req, idempotency_key):
    existing = cache.get(idempotency_key)
    if existing:
        return existing  # 幂等：返回上次结果
    order = build_order(req)
    db.save(order)
    cache.set(idempotency_key, order, ttl=86400)
    return order
\`\`\`

幂等键通常是客户端生成的唯一 ID（如 UUID），通过请求头 \`Idempotency-Key\` 传递。服务端记录该键与处理结果，重复请求直接返回缓存结果。

---

## 状态码完整分类

状态码是三位数字，第一位表示类别。后两位是具体编码。理解状态码能让 API 语义更清晰，也便于客户端正确处理响应。

### 1xx 信息性（Informational）

表示请求已接收，继续处理。很少用到。

- \`100 Continue\`：客户端可继续发送主体。客户端先发 \`Expect: 100-continue\` 询问服务端是否接受 body，服务端回 100 表示可以。
- \`101 Switching Protocols\`：切换协议。WebSocket 握手时就用它从 HTTP 升级到 WebSocket。

### 2xx 成功（Success）

- \`200 OK\`：请求成功，通用。GET 查询、PUT 更新常用。
- \`201 Created\`：资源已创建，常配合 \`Location\` 头指向新资源地址。POST 创建成功返回 201。
- \`202 Accepted\`：请求已接受但未处理完（异步任务）。如提交导出任务，返回 202 表示后台处理中。
- \`204 No Content\`：成功但无内容返回。DELETE 删除成功、PUT 更新成功无返回体时用。
- \`206 Partial Content\`：范围请求（断点续传）。配合 \`Content-Range\` 头。

### 3xx 重定向（Redirection）

需要客户端进一步操作才能完成请求。

- \`301 Moved Permanently\`：永久重定向，浏览器和搜索引擎会缓存。HTTP→HTTPS 跳转常用 301。
- \`302 Found\`：临时重定向，不缓存。登录后跳转回原页面常用 302。
- \`303 See Other\`：用 GET 请求另一个 URI。POST 后重定向到结果页用 303。
- \`304 Not Modified\`：资源未修改，用缓存（配合条件请求 \`If-Modified-Since\`/\`If-None-Match\`）。
- \`307 Temporary Redirect\`：临时重定向，保持原方法（302 历史上会改 POST 为 GET，307 不会）。
- \`308 Permanent Redirect\`：永久重定向，保持原方法。

### 4xx 客户端错误（Client Error）

客户端请求有误，服务端无法处理。

- \`400 Bad Request\`：请求格式错误（参数校验失败、JSON 格式错）。通用客户端错误。
- \`401 Unauthorized\`：未认证（没登录、token 失效）。响应应带 \`WWW-Authenticate\` 头。
- \`403 Forbidden\`：已认证但无权限。知道你是谁，但你不能做这个操作。
- \`404 Not Found\`：资源不存在。
- \`405 Method Not Allowed\`：方法不允许（如对只读资源 POST）。响应应带 \`Allow\` 头列出允许的方法。
- \`406 Not Acceptable\`：无法满足 \`Accept\` 头要求的内容协商。
- \`409 Conflict\`：冲突（如重复创建、并发修改冲突）。
- \`410 Gone\`：资源已永久消失（比 404 更明确）。
- \`413 Payload Too Large\`：请求体过大。
- \`415 Unsupported Media Type\`：不支持的 Content-Type。
- \`422 Unprocessable Entity\`：格式对但语义错（如必填字段缺失、业务校验失败）。比 400 更精确。
- \`429 Too Many Requests\`：限流。响应应带 \`Retry-After\` 头。

### 5xx 服务端错误（Server Error）

服务端处理时出错。

- \`500 Internal Server Error\`：服务器内部错误（空指针、未捕获异常）。通用服务端错误。
- \`501 Not Implemented\`：服务器不支持该请求方法。
- \`502 Bad Gateway\`：网关收不到上游有效响应。通常是上游服务挂了。
- \`503 Service Unavailable\`：服务不可用（维护、过载）。响应可带 \`Retry-After\`。
- \`504 Gateway Timeout\`：网关等待上游超时。上游处理太慢。

> **易混淆**：401 是"不知道你是谁"（没带凭证），403 是"知道你是谁但不能做"（权限不足）。
> **易混淆**：400 是格式错，422 是格式对但语义错（业务校验）。
> **易混淆**：502 是上游返回了无效响应，504 是上游没响应（超时）。

### 状态码使用原则

1. **语义优先**：用最精确的状态码，别一律 200 + \`{code: 0}\`（这是国内常见反模式，破坏 HTTP 语义）。
2. **4xx vs 5xx**：客户端错误用 4xx，服务端错误用 5xx。判断依据：客户端改了请求能解决的是 4xx，服务端要修的是 5xx。
3. **不要滥用 200**：错误也返回 200 会让监控、网关无法识别错误率。

---

## 常用 Headers 详解

Headers 是 HTTP 报文的元信息，控制缓存、认证、内容协商、跨域等行为。

### 请求头

| 头部 | 作用 | 示例 |
|------|------|------|
| \`Host\` | 目标主机（HTTP/1.1 必需，支持虚拟主机） | \`api.example.com\` |
| \`User-Agent\` | 客户端标识 | \`Mozilla/5.0...\` |
| \`Accept\` | 期望的响应类型（内容协商） | \`application/json\` |
| \`Accept-Encoding\` | 支持的压缩编码 | \`gzip, deflate, br\` |
| \`Accept-Language\` | 期望的语言 | \`zh-CN,zh;q=0.9\` |
| \`Authorization\` | 认证凭证 | \`Bearer eyJhbG...\` |
| \`Cookie\` | 携带 Cookie | \`sessionId=abc123\` |
| \`Content-Type\` | 请求体类型 | \`application/json\` |
| \`Content-Length\` | 请求体长度 | \`42\` |
| \`Origin\` | 请求来源（CORS） | \`https://app.example.com\` |
| \`Referer\` | 来源页面 URL | \`https://app.example.com/home\` |
| \`If-Modified-Since\` | 条件请求（时间） | \`Wed, 21 Oct 2025 07:28:00 GMT\` |
| \`If-None-Match\` | 条件请求（ETag） | \`"abc123"\` |
| \`X-Forwarded-For\` | 代理转发链（客户端真实 IP） | \`1.1.1.1, 2.2.2.2\` |
| \`X-Forwarded-Proto\` | 原始协议 | \`https\` |

### 响应头

| 头部 | 作用 | 示例 |
|------|------|------|
| \`Content-Type\` | 响应体类型与编码 | \`application/json; charset=utf-8\` |
| \`Content-Length\` | 响应体长度 | \`25\` |
| \`Content-Encoding\` | 响应体压缩编码 | \`gzip\` |
| \`Cache-Control\` | 缓存策略 | \`max-age=3600, public\` |
| \`ETag\` | 资源指纹 | \`"abc123"\` |
| \`Last-Modified\` | 资源最后修改时间 | \`Wed, 21 Oct 2025 07:28:00 GMT\` |
| \`Set-Cookie\` | 设置 Cookie | \`sessionId=abc; HttpOnly; Secure\` |
| \`Location\` | 重定向目标 / 新资源地址 | \`/api/users/101\` |
| \`WWW-Authenticate\` | 认证方式（401 时） | \`Bearer realm="api"\` |
| \`Access-Control-Allow-Origin\` | CORS 跨域许可 | \`https://app.example.com\` |
| \`Retry-After\` | 重试等待时间（429/503） | \`120\` |
| \`X-Request-Id\` | 请求追踪 ID | \`uuid-xxx\` |

### 通用头

| 头部 | 作用 |
|------|------|
| \`Connection\` | 连接管理（keep-alive 复用） |
| \`Transfer-Encoding\` | 传输编码（chunked 分块） |
| \`Date\` | 报文时间 |
| \`Vary\` | 缓存键（按哪些头区分缓存） |

### Content-Type 详解

Content-Type 决定 body 的格式，是前后端约定的关键：

- \`application/json\`：JSON，现代 API 主流。
- \`application/x-www-form-urlencoded\`：表单，键值对用 & 连接，值 URL 编码。
- \`multipart/form-data\`：文件上传，用 boundary 分隔多部分。
- \`text/plain\`：纯文本。
- \`text/html\`：HTML。
- \`application/octet-stream\`：二进制流（下载）。

\`\`\`http
# 表单提交
POST /login HTTP/1.1
Content-Type: application/x-www-form-urlencoded

username=alice&password=secret

# 文件上传
POST /upload HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="a.jpg"

<二进制内容>
------WebKitFormBoundary--
\`\`\`

---

## HTTP 版本演进

HTTP 协议在不断演进，每个版本解决上一版的痛点。

### HTTP/1.0

每个请求新建一个 TCP 连接，请求完就断开。开销大（每次都 TCP 握手）。头部不压缩，重复传输。

### HTTP/1.1（最普及）

- **Keep-Alive**：默认复用 TCP 连接，多个请求串行复用同一连接，减少握手开销。
- **管道化（Pipelining）**：可连续发送多个请求，但响应必须按序返回（**队头阻塞**，HOL blocking）。
- **Host 头**：支持虚拟主机（一台服务器多个域名）。
- **分块传输**：\`Transfer-Encoding: chunked\` 支持流式响应（不知道总长度时）。
- **缓存控制**：\`Cache-Control\`、\`ETag\` 等完善缓存机制。
- **范围请求**：\`Range\` 头支持断点续传。

### HTTP/2

- **二进制分帧**：报文不再是纯文本，拆成二进制帧，更紧凑高效。
- **多路复用**：一个 TCP 连接上并发多个请求/响应，解决 HTTP 层队头阻塞。
- **头部压缩（HPACK）**：压缩重复的头部，减少开销。
- **服务端推送**：服务端可主动推送资源（如 HTML 引用的 CSS）。
- **流优先级**：可设置请求优先级。

### HTTP/3

- 基于 **QUIC**（UDP），不再依赖 TCP。
- 解决 TCP 层队头阻塞：每个流独立丢包重传，互不影响。
- 连接迁移：网络切换（WiFi→4G）不断连，因为 QUIC 用连接 ID 而非四元组标识连接。
- 更快的握手：QUIC 把传输和 TLS 握手合并，1-RTT 甚至 0-RTT。

### 版本对比表

| 特性 | HTTP/1.0 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|------|----------|----------|--------|--------|
| 传输层 | TCP | TCP | TCP | QUIC(UDP) |
| 报文格式 | 文本 | 文本 | 二进制帧 | 二进制帧 |
| 连接复用 | 否 | Keep-Alive | 多路复用 | 多路复用 |
| 队头阻塞 | HTTP层 | HTTP层 | TCP层有 | 基本消除 |
| 头部压缩 | 否 | 否 | HPACK | QPACK |
| 服务端推送 | 否 | 否 | 是 | 是 |
| 连接建立 | 多次RTT | 多次RTT | 多次RTT | 1-RTT/0-RTT |

### Keep-Alive 与连接复用

Keep-Alive 是 HTTP/1.1 默认开启的连接复用机制。没有它，每个请求都要 TCP 握手（1 RTT）+ TLS 握手（1-2 RTT），开销巨大。开启后，多个请求复用同一 TCP 连接，省去重复握手。

\`\`\`http
# Keep-Alive 连接复用
Connection: keep-alive
Keep-Alive: timeout=5, max=100
\`\`\`

但 HTTP/1.1 的 Keep-Alive 仍是**串行**的：一个请求的响应回来才能发下一个。HTTP/2 的多路复用才真正实现并发。这也是为什么 HTTP/2 对性能提升明显——它消除了 HTTP 层的队头阻塞。

---

## HTTPS 与 TLS 握手

HTTPS = HTTP over TLS。在 HTTP 与 TCP 之间加一层加密，保证**机密性、完整性、身份认证**。

### TLS 握手简化流程（TLS 1.2）

\`\`\`
Client                              Server
  | ---- ClientHello(支持的密码套件、随机数) ----> |
  | <---- ServerHello(选定套件、随机数、证书) ---- |
  | ---- 验证证书、生成预主密钥、发送 ---->        |
  | <---- 切换到加密通信 ---------------------- |
  | ==== 加密的应用数据（HTTP） ================ |
\`\`\`

1. 客户端发送支持的加密算法和随机数（ClientHello）。
2. 服务端返回选定的算法、随机数和**数字证书**（含公钥）（ServerHello）。
3. 客户端验证证书（CA 签名链），生成预主密钥，用服务端公钥加密发送。
4. 双方根据三个随机数算出会话密钥，后续通信用对称加密。
5. TLS 1.3 把握手压缩到 1-RTT，甚至支持 0-RTT 恢复。

### 为什么需要 HTTPS

三大网络威胁：
- **窃听**：明文传输，中间人可看到内容（密码、敏感数据）。
- **篡改**：中间人修改传输内容（注入广告、恶意代码）。
- **伪造**：攻击者冒充服务器，骗取用户数据。

HTTPS 通过加密（防窃听）、MAC（防篡改）、证书（防伪造）解决这三类威胁。

> HTTPS 详见第 3 章，这里只做铺垫。

---

## Cookie 与 Session

HTTP 是**无状态**协议，每个请求相互独立。要保持登录状态，需要 Cookie/Session 机制。

### Cookie

- 服务端通过 \`Set-Cookie\` 响应头下发，浏览器存储。
- 后续请求自动通过 \`Cookie\` 请求头带上。
- 属性：\`Domain\`/\`Path\`（作用域）、\`Max-Age\`/\`Expires\`（有效期）、\`HttpOnly\`（防 JS 读取，防 XSS）、\`Secure\`（仅 HTTPS）、\`SameSite\`（防 CSRF）。

\`\`\`http
# 服务端设置 Cookie
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict; Max-Age=3600

# 客户端后续请求带上
Cookie: sessionId=abc123
\`\`\`

### Session

- 服务端存储会话数据，给客户端一个 Session ID（通常放在 Cookie 里）。
- 客户端每次带 Session ID，服务端据此查会话。
- 缺点：服务端有状态，分布式环境需共享 Session（Redis）。

### JWT（JSON Web Token）

- 无状态的认证方案：把用户信息编码成签名 token，客户端携带，服务端验签。
- 适合分布式、跨域，但签发后难以主动失效（需黑名单）。
- token 三段：Header.Payload.Signature。

| 方案 | 状态存储 | 扩展性 | 失效控制 | 适用场景 |
|------|---------|--------|---------|---------|
| Session | 服务端 | 需共享存储 | 容易（删服务端数据） | 传统 Web |
| Cookie | 客户端 | 好 | 难（客户端可控） | 少量非敏感状态 |
| JWT | 无状态（客户端） | 极好 | 难（需黑名单） | API、微服务、跨域 |

\`\`\`js
// Node.js：JWT 结构示意（不验证，仅展示）
// Header.Payload.Signature，每段 base64url 编码
const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
const payload = Buffer.from(JSON.stringify({ userId: 1, exp: 1735689600 })).toString("base64url");
// signature = HMAC-SHA256(header + "." + payload, secret)
\`\`\`

---

## CORS 跨域原理

**同源策略**：浏览器限制 JS 跨域访问资源。"同源"指协议+域名+端口完全相同。跨域请求会被浏览器拦截（除非服务端明确允许）。

CORS（Cross-Origin Resource Sharing）是浏览器与服务端协作的跨域机制。

### 简单请求

满足特定条件（GET/POST/HEAD、特定 Content-Type 如 form-urlencoded、不自定义头部）的请求直接发送，服务端通过 \`Access-Control-Allow-Origin\` 响应头许可。

### 预检请求（Preflight）

不满足简单请求条件时，浏览器先发一个 \`OPTIONS\` 请求询问服务端是否允许：

\`\`\`http
OPTIONS /api/users HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Authorization
\`\`\`

服务端响应许可：

\`\`\`http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 3600
\`\`\`

预检结果可缓存（\`Access-Control-Max-Age\`），避免每次都预检。

### CORS 关键认知

1. **CORS 是浏览器行为**，服务端实际已收到请求并可能已处理。CORS 限制的是浏览器是否把响应交给 JS。
2. **后端必须做独立鉴权**，不能依赖 CORS 防止恶意访问。CORS 防的是浏览器里的恶意 JS，不是服务器间的请求。
3. **带 Cookie 的跨域**：需 \`Access-Control-Allow-Credentials: true\`，且 \`Allow-Origin\` 不能是 \`*\`，必须指定具体域名。
4. \`SameSite\` Cookie 属性也影响跨域，它是另一套机制（防 CSRF）。

---

## 请求体格式

HTTP 请求体有多种格式，根据 Content-Type 区分：

### application/x-www-form-urlencoded

最传统的表单格式，键值对用 \`&\` 连接，值 URL 编码：

\`\`\`
name=Alice+Zhang&age=28&city=%E5%8C%97%E4%BA%AC
\`\`\`

特点：简单、所有浏览器支持、适合少量文本。但二进制数据要 base64 编码，膨胀 33%。

### multipart/form-data

文件上传专用，用 boundary 分隔多部分，每部分有自己的头：

\`\`\`http
Content-Type: multipart/form-data; boundary=----boundary123

------boundary123
Content-Disposition: form-data; name="title"

我的照片
------boundary123
Content-Disposition: form-data; name="file"; filename="photo.jpg"
Content-Type: image/jpeg

<二进制内容>
------boundary123--
\`\`\`

特点：可传二进制、可多字段、可多文件。开销略大于 urlencoded（boundary 和每部分的头）。

### application/json

现代 API 主流，结构化、可嵌套、语言无关：

\`\`\`json
{"name":"Alice","age":28,"address":{"city":"北京"}}
\`\`\`

特点：语义清晰、支持嵌套、工具丰富。但比 form 多了引号等结构，体积略大。

### 选型建议

- 简单表单：urlencoded。
- 文件上传：multipart。
- 复杂结构化数据：JSON。
- 二进制流（如下载）：application/octet-stream。

---

## HTTP 缓存机制

HTTP 缓存是性能优化的利器，分强缓存和协商缓存。

### 强缓存

命中后直接用缓存，不发请求（浏览器看 \`Status Code\` 显示 \`200 (from cache)\`）。

- \`Cache-Control: max-age=3600\`：缓存 3600 秒（HTTP/1.1，优先）。
- \`Expires: Wed, 21 Oct 2025 07:28:00 GMT\`：绝对过期时间（HTTP/1.0，受系统时间影响）。

\`Cache-Control\` 常用指令：
- \`public\`：可被中间代理缓存。
- \`private\`：只浏览器能缓存（如用户私人数据）。
- \`no-cache\`：**不是不缓存**，而是每次用前要协商验证。
- \`no-store\`：完全不缓存（敏感数据）。
- \`max-age\`：缓存秒数。
- \`s-maxage\`：共享缓存（CDN/代理）的秒数。

### 协商缓存

强缓存过期后，发请求问服务端"资源变没变"，没变返回 304，变了返回 200 + 新内容。

- \`Last-Modified\` / \`If-Modified-Since\`：基于修改时间。
- \`ETag\` / \`If-None-Match\`：基于内容指纹（更精确，解决修改时间精度问题）。

\`\`\`http
# 第一次请求，响应带 ETag
HTTP/1.1 200 OK
ETag: "abc123"
Cache-Control: max-age=0

# 第二次请求，带上 If-None-Match
GET /api/data HTTP/1.1
If-None-Match: "abc123"

# 服务端发现没变
HTTP/1.1 304 Not Modified
\`\`\`

### 缓存策略选择

- 不变的静态资源（JS/CSS/图片）：强缓存 + 长期 max-age，文件名带 hash。
- 频繁变的资源：协商缓存（ETag）。
- 敏感数据：\`no-store\`。
- 用户数据：\`private\`，避免被 CDN 缓存。

---

## 常见坑与实战要点

1. **GET 请求带 body**：很多代理/网关会丢弃 GET 的 body，应把参数放 query string。HTTP 规范虽未禁止，但实践上不推荐。

2. **301 vs 302 缓存**：301 会被浏览器强缓存，调试时改了服务端配置也不生效，用 302 或加 no-cache。曾经有人把测试环境 301 跳转到生产，结果生产被强缓存，测试环境一直跳生产。

3. **Content-Type 与 body 不符**：声称 JSON 但 body 是表单，导致解析失败。客户端和服务端要对齐 Content-Type。

4. **大文件传输**：用 \`Transfer-Encoding: chunked\` 流式传输，避免一次性占内存。下载用 \`Range\` 断点续传。

5. **HTTPS 性能**：TLS 握手有开销，用 Keep-Alive 和会话恢复（Session Resumption）减少握手次数。HTTP/2 多路复用进一步减少连接数。

6. **状态码乱用**：错误也返回 200 + \`{code: 1}\`，让监控、网关无法识别错误率。应遵循 HTTP 语义用 4xx/5xx。

7. **响应头大小**：HTTP/1.1 头部不压缩，大量 Cookie 和自定义头会拖慢请求。HTTP/2 的 HPACK 解决此问题。

8. **Connection: close 误用**：手动关闭连接会破坏 Keep-Alive，每次重新握手。除非有特殊原因，保持默认。

9. **CORS 不是安全机制**：它防的是浏览器里的 JS，不防服务器间请求。后端鉴权不能依赖 CORS。

10. **HTTP/1.1 队头阻塞**：一个慢请求会阻塞同连接后续请求。浏览器通过开多个连接（6-8 个）缓解，HTTP/2 多路复用才根治。

---

## 面试题精选

**Q1：GET 和 POST 的区别？**
答：语义上 GET 是获取（安全、幂等），POST 是创建（不安全、不幂等）。参数位置 GET 放 query string，POST 放 body。GET 可被缓存/收藏/记录历史，POST 不行。本质上 GET 和 POST 都是 TCP 请求，技术上 GET 也能带 body，但规范和实践中不推荐。

**Q2：HTTP/1.1 和 HTTP/2 的主要区别？**
答：HTTP/2 引入二进制分帧、多路复用（一个连接并发多请求，解决 HTTP 层队头阻塞）、HPACK 头部压缩、服务端推送。HTTP/1.1 是文本协议、串行请求、头部不压缩。

**Q3：什么是幂等性？为什么重要？**
答：幂等指重复执行效果与一次相同。GET/PUT/DELETE 幂等，POST 不幂等。重要性在于网络不稳定时重试安全：幂等接口可安全重试，非幂等接口重试可能产生副作用（如重复下单）。用幂等键可让 POST 也幂等。

**Q4：301 和 302 的区别？**
答：301 永久重定向，浏览器和搜索引擎缓存；302 临时重定向，不缓存。301 会被强缓存导致后续请求不经过服务器，调试时要注意。

**Q5：如何实现 HTTP 缓存？**
答：分强缓存和协商缓存。强缓存用 \`Cache-Control: max-age\`，命中直接用不发请求。协商缓存用 \`ETag\`/\`If-None-Match\` 或 \`Last-Modified\`/\`If-Modified-Since\`，命中返回 304。静态资源用强缓存 + 文件名 hash，动态资源用协商缓存。

**Q6：CORS 预检请求什么时候发？**
答：非简单请求会先发 OPTIONS 预检。简单请求条件：方法是 GET/POST/HEAD、Content-Type 是 form-urlencoded/multipart/text-plain、不自定义头部。其他情况（如 PUT、JSON、带 Authorization 头）都要预检。

---

## 生产案例

**案例一：301 缓存导致事故**
某团队把测试环境的 HTTP→HTTPS 跳转配成 301，结果被浏览器强缓存。后来测试环境改配置，但用户浏览器一直缓存着旧的 301，持续跳到错误地址，只能让用户清缓存。
**教训**：临时性跳转用 302，永久且确定再用 301，并在响应加 \`Cache-Control: no-cache\` 保险。

**案例二：HTTP/1.1 队头阻塞**
一个图片列表页，几十张图片复用同一连接，其中一张慢（大图），后面所有图片都阻塞。浏览器开 6 个连接也只能缓解。
**解决**：升级 HTTP/2 多路复用，或用 CDN 加速静态资源。

**案例三：CORS 配置不当导致 Cookie 丢失**
带 Cookie 的跨域请求，服务端配了 \`Access-Control-Allow-Origin: *\` 和 \`Allow-Credentials: true\`，浏览器报错拒绝。因为规范要求带凭证时 Allow-Origin 不能是 \`*\`，必须指定具体域名。
**解决**：动态返回请求方的 Origin（白名单校验后）。

## 七、HTTP 请求方法深入与幂等性详解

### 7.1 方法语义对比

HTTP 方法定义了对资源的操作语义，理解每个方法的"承诺"是设计 RESTful API 的基础。

| 方法 | 语义 | 安全 | 幂等 | 可缓存 | 允许 Body |
|------|------|------|------|--------|-----------|
| GET | 获取资源 | 是 | 是 | 是 | 不推荐 |
| POST | 创建资源/提交数据 | 否 | 否 | 仅新鲜度 | 是 |
| PUT | 完整替换资源 | 否 | 是 | 否 | 是 |
| PATCH | 部分更新资源 | 否 | 否 | 否 | 是 |
| DELETE | 删除资源 | 否 | 是 | 否 | 可有 |
| HEAD | 获取头信息（无 Body） | 是 | 是 | 是 | 否 |
| OPTIONS | 查询支持的方法 | 是 | 是 | 否 | 否 |
| TRACE | 回显请求（调试用） | 是 | 是 | 否 | 否 |
| CONNECT | 建立隧道（HTTPS 代理） | 否 | 否 | 否 | 否 |

**安全（Safe）**：不修改服务器状态，只是读取。
**幂等（Idempotent）**：多次执行与一次执行效果相同。

### 7.2 幂等性深入理解

幂等性是分布式系统的重要概念，尤其在网络不稳定（需要重试）的场景下至关重要。

**Java 示例——幂等 vs 非幂等**：

\`\`\`java
// POST：非幂等，每次调用创建新订单
@PostMapping("/orders")
public Order createOrder(@RequestBody OrderRequest req) {
    Order order = new Order(req);  // 每次都创建新对象
    orderRepo.save(order);
    return order;
}

// PUT：幂等，用给定 ID 替换整个资源
@PutMapping("/orders/{id}")
public Order replaceOrder(@PathVariable Long id, @RequestBody OrderRequest req) {
    Order order = orderRepo.findById(id).orElse(new Order(id));
    order.updateFrom(req);  // 用请求数据完整替换
    orderRepo.save(order);
    return order;  // 多次调用结果相同
}
\`\`\`

**Go 示例——幂等性设计**：

\`\`\`go
// 非幂等 POST
func CreateOrder(w http.ResponseWriter, r *http.Request) {
    order := NewOrder(r.Body)
    db.Insert(order)  // 每次生成新 ID
    json.NewEncoder(w).Encode(order)
}

// 幂等 PUT
func UpsertOrder(w http.ResponseWriter, r *http.Request) {
    id := chi.URLParam(r, "id")
    order := db.GetOrNew(id)
    order.UpdateFrom(r.Body)
    db.Save(order)  // 相同输入，结果总是一样
    json.NewEncoder(w).Encode(order)
}
\`\`\`

### 7.3 POST vs PUT 的选择

很多开发者混淆 POST 和 PUT。核心区别：

- **POST**：由服务器决定资源 ID（\`POST /orders\` → 服务器生成 \`order-123\`）
- **PUT**：客户端指定资源 ID（\`PUT /orders/order-123\` → 创建或替换该 ID 的资源）

\`\`\`
POST /api/users          → 服务器生成 ID，非幂等
PUT  /api/users/123      → 客户端指定 ID，幂等
PATCH /api/users/123     → 部分更新，非幂等（但可实现幂等）
\`\`\`

**Python Flask 示例**：

\`\`\`python
@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    user = User(id=str(uuid4()), **data)  # 服务器生成 ID
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

@app.route('/api/users/<user_id>', methods=['PUT'])
def replace_user(user_id):
    data = request.get_json()
    user = User.query.get(user_id) or User(id=user_id)
    for key, value in data.items():  # 完整替换
        setattr(user, key, value)
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict())
\`\`\`

### 7.4 PATCH 的两种模式

PATCH 用于部分更新，有两种常见模式：

**JSON Merge Patch（RFC 7386）**：

\`\`\`json
// 原始资源
{"name": "Alice", "age": 25, "email": "alice@old.com"}

// Patch 请求
{"email": "alice@new.com", "age": null}

// 结果（null 表示删除字段）
{"name": "Alice", "email": "alice@new.com"}
\`\`\`

**JSON Patch（RFC 6902）**：

\`\`\`json
[
  {"op": "replace", "path": "/email", "value": "alice@new.com"},
  {"op": "remove", "path": "/age"},
  {"op": "add", "path": "/phone", "value": "123456"}
]
\`\`\`

### 7.5 幂等性实现方案

对于需要重试但操作本身非幂等的场景（如支付），需要通过设计实现幂等：

**方案一：幂等键（Idempotency Key）**：

\`\`\`java
@PostMapping("/payments")
public Result pay(@RequestHeader("Idempotency-Key") String key,
                  @RequestBody PaymentRequest req) {
    // 检查是否已处理过该幂等键
    if (idempotentRepo.existsByKey(key)) {
        return idempotentRepo.getByKey(key).getResult();  // 返回之前的结果
    }
    Result result = processPayment(req);  // 执行支付
    idempotentRepo.save(key, result);     // 记录结果
    return result;
}
\`\`\`

**方案二：唯一约束**：

\`\`\`sql
-- 订单号唯一约束
INSERT INTO payments (order_no, amount) VALUES (?, ?);
-- 重复插入会抛出唯一约束冲突，捕获后返回已有记录
\`\`\`

## 八、HTTP 状态码完整分类

### 8.1 状态码分类

HTTP 状态码用三位数字表示，第一位表示类别：

| 类别 | 含义 | 典型场景 |
|------|------|----------|
| 1xx | 信息性 | 协议升级、继续上传 |
| 2xx | 成功 | 请求处理成功 |
| 3xx | 重定向 | 资源移动、缓存命中 |
| 4xx | 客户端错误 | 参数错误、未授权 |
| 5xx | 服务端错误 | 内部异常、服务不可用 |

### 8.2 常用状态码详解

**2xx 成功**：

| 码 | 名称 | 使用场景 |
|----|------|----------|
| 200 | OK | 通用成功（GET/PUT/PATCH/DELETE） |
| 201 | Created | 资源创建成功（POST） |
| 202 | Accepted | 请求已接受，异步处理中 |
| 204 | No Content | 成功但无返回体（DELETE） |
| 206 | Partial Content | 范围请求（断点续传） |

**3xx 重定向**：

| 码 | 名称 | 使用场景 |
|----|------|----------|
| 301 | Moved Permanently | 永久重定向（HTTP→HTTPS） |
| 302 | Found | 临时重定向 |
| 304 | Not Modified | 缓存未修改，用本地缓存 |
| 307 | Temporary Redirect | 临时重定向（保持方法不变） |
| 308 | Permanent Redirect | 永久重定向（保持方法不变） |

**4xx 客户端错误**：

| 码 | 名称 | 使用场景 |
|----|------|----------|
| 400 | Bad Request | 参数格式错误 |
| 401 | Unauthorized | 未认证（需要登录） |
| 403 | Forbidden | 已认证但无权限 |
| 404 | Not Found | 资源不存在 |
| 405 | Method Not Allowed | 方法不允许（对只读资源 POST） |
| 409 | Conflict | 资源冲突（重复创建） |
| 413 | Payload Too Large | 请求体过大 |
| 415 | Unsupported Media Type | Content-Type 不支持 |
| 422 | Unprocessable Entity | 语义错误（格式对但值无效） |
| 429 | Too Many Requests | 限流 |

**5xx 服务端错误**：

| 码 | 名称 | 使用场景 |
|----|------|----------|
| 500 | Internal Server Error | 未捕获异常 |
| 501 | Not Implemented | 不支持的功能 |
| 502 | Bad Gateway | 网关上游错误 |
| 503 | Service Unavailable | 服务不可用（维护中/过载） |
| 504 | Gateway Timeout | 网关上游超时 |

### 8.3 状态码选择最佳实践

**Java Spring 示例**：

\`\`\`java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @PostMapping
    public ResponseEntity<UserDTO> create(@RequestBody @Valid CreateUserRequest req) {
        User user = userService.create(req);
        URI location = URI.create("/api/users/" + user.getId());
        return ResponseEntity.created(location).body(toDTO(user));  // 201
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> get(@PathVariable Long id) {
        User user = userService.findById(id)
            .orElseThrow(() -> new NotFoundException("用户不存在"));
        return ResponseEntity.ok(toDTO(user));  // 200
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();  // 204
    }
}

@ExceptionHandler(NotFoundException.class)
public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException e) {
    return ResponseEntity.status(404).body(new ErrorResponse(404, e.getMessage()));
}
\`\`\`

**Go 示例**：

\`\`\`go
func GetUser(w http.ResponseWriter, r *http.Request) {
    id := chi.URLParam(r, "id")
    user, err := userService.FindByID(id)
    if err != nil {
        if errors.Is(err, ErrNotFound) {
            respondJSON(w, http.StatusNotFound, ErrorResponse{404, "用户不存在"})
        } else {
            respondJSON(w, http.StatusInternalServerError, ErrorResponse{500, "内部错误"})
        }
        return
    }
    respondJSON(w, http.StatusOK, user)
}
\`\`\`

### 8.4 401 vs 403 的区别

这是面试高频题，也是实际开发中容易混淆的：

- **401 Unauthorized**：你**是谁**？——未提供或提供的认证信息无效
- **403 Forbidden**：你**能做什么**？——已认证，但权限不足

\`\`\`
未带 Token → 401（请先登录）
Token 过期 → 401（重新登录）
Token 有效但访问他人资源 → 403（禁止访问）
普通用户访问管理接口 → 403（权限不足）
\`\`\`

## 九、HTTP 头部字段全景

### 9.1 通用头部（请求和响应都有）

| 头部 | 说明 | 示例 |
|------|------|------|
| Cache-Control | 缓存指令 | max-age=3600 |
| Connection | 连接管理 | keep-alive / close |
| Date | 报文时间 | Thu, 15 Jan 2026 10:00:00 GMT |
| Transfer-Encoding | 传输编码 | chunked |

### 9.2 请求头部

| 头部 | 说明 | 示例 |
|------|------|------|
| Host | 目标主机 | api.example.com |
| User-Agent | 客户端标识 | Mozilla/5.0... |
| Accept | 期望的响应类型 | application/json |
| Accept-Encoding | 期望的编码 | gzip, deflate, br |
| Accept-Language | 期望的语言 | zh-CN,zh;q=0.9 |
| Authorization | 认证信息 | Bearer eyJhbG... |
| Cookie | 携带的 Cookie | sessionId=abc123 |
| Content-Type | 请求体类型 | application/json |
| Content-Length | 请求体长度 | 1024 |
| Origin | 请求来源 | https://app.example.com |
| Referer | 来源页面 | https://app.example.com/users |
| If-Modified-Since | 条件请求 | Thu, 01 Jan 2026 00:00:00 GMT |
| If-None-Match | 条件请求（ETag） | "abc123" |
| X-Forwarded-For | 代理转发链 | 1.2.3.4, 5.6.7.8 |
| X-Real-IP | 真实客户端 IP | 1.2.3.4 |

### 9.3 响应头部

| 头部 | 说明 | 示例 |
|------|------|------|
| Server | 服务器标识 | nginx/1.24 |
| Content-Type | 响应体类型 | application/json; charset=utf-8 |
| Content-Length | 响应体长度 | 2048 |
| Content-Encoding | 响应编码 | gzip |
| Content-Disposition | 文件下载 | attachment; filename="report.pdf" |
| Set-Cookie | 设置 Cookie | sessionId=abc; HttpOnly; Secure |
| Location | 重定向地址 | /api/users/123 |
| ETag | 资源版本标识 | "abc123" |
| Last-Modified | 最后修改时间 | Thu, 01 Jan 2026 00:00:00 GMT |
| Expires | 过期时间 | Thu, 01 Jan 2027 00:00:00 GMT |
| Access-Control-Allow-Origin | CORS 允许来源 | https://app.example.com |
| X-Request-ID | 请求追踪 ID | a1b2c3d4 |
| X-RateLimit-Remaining | 剩余配额 | 99 |
| Strict-Transport-Security | HSTS | max-age=31536000 |

### 9.4 Content-Type 常见值

| Content-Type | 用途 |
|--------------|------|
| application/json | JSON 数据 |
| application/x-www-form-urlencoded | 表单提交 |
| multipart/form-data | 文件上传 |
| text/html | HTML 页面 |
| text/plain | 纯文本 |
| text/css | CSS 样式 |
| application/javascript | JavaScript |
| application/octet-stream | 二进制流 |
| image/png, image/jpeg | 图片 |
| application/xml | XML 数据 |

## 十、HTTP 缓存机制深度剖析

### 10.1 缓存决策流程

\`\`\`
请求到达
  ↓
有缓存？
├─ 否 → 向服务器请求 → 存储响应 → 返回
└─ 是 → 缓存新鲜？
        ├─ 是（未过期）→ 返回缓存（强缓存，200 from cache）
        └─ 否（已过期）→ 协商缓存
              ├─ 资源未修改 → 304 Not Modified（用缓存）
              └─ 资源已修改 → 200（返回新资源，更新缓存）
\`\`\`

### 10.2 强缓存

强缓存期内，浏览器直接用本地缓存，不发请求。

**Cache-Control（HTTP/1.1，优先级高）**：

\`\`\`
Cache-Control: max-age=3600          缓存 3600 秒
Cache-Control: no-cache              不直接用缓存，必须协商
Cache-Control: no-store              完全不缓存
Cache-Control: public                可被 CDN 等中间缓存
Cache-Control: private               只能浏览器缓存
Cache-Control: must-revalidate       过期后必须重新验证
Cache-Control: s-maxage=600          共享缓存有效期（CDN/代理）
\`\`\`

**Expires（HTTP/1.0，优先级低）**：

\`\`\`
Expires: Thu, 01 Jan 2027 00:00:00 GMT
\`\`\`

### 10.3 协商缓存

强缓存过期后，浏览器带条件请求头向服务器验证：

**Last-Modified / If-Modified-Since**：

\`\`\`
# 第一次响应
Last-Modified: Wed, 01 Jan 2026 00:00:00 GMT

# 第二次请求（带条件）
If-Modified-Since: Wed, 01 Jan 2026 00:00:00 GMT

# 服务器判断：
# 未修改 → 304 Not Modified（不带 Body，省带宽）
# 已修改 → 200 OK + 新资源 + 新 Last-Modified
\`\`\`

**ETag / If-None-Match（更精确）**：

\`\`\`
# 第一次响应
ETag: "abc123"

# 第二次请求
If-None-Match: "abc123"

# 服务器判断：
# ETag 匹配 → 304
# ETag 不匹配 → 200 + 新资源
\`\`\`

**ETag 优于 Last-Modified**：
1. ETag 能检测内容相同但修改时间不同的情况
2. ETag 精度到内容级别，Last-Modified 精度到秒
3. 某些文件定期重新生成但内容不变，ETag 能避免不必要传输

### 10.4 缓存策略实战

**Java Spring 缓存配置**：

\`\`\`java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    @CrossOrigin(origins = "https://app.example.com")
    public ResponseEntity<UserDTO> get(@PathVariable Long id) {
        User user = userService.findById(id);
        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(60, TimeUnit.SECONDS)
                .cachePublic())  // CDN 可缓存
            .eTag("\"" + user.getVersion() + "\"")  // 版本号作为 ETag
            .lastModified(user.getUpdatedAt())
            .body(toDTO(user));
    }
}
\`\`\`

**Nginx 静态资源缓存**：

\`\`\`nginx
# 静态资源强缓存 1 年（文件名带 hash，内容变更会换 URL）
location ~* \.(js|css|png|jpg|gif|svg|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# HTML 文件不强缓存，每次协商
location ~* \.html$ {
    add_header Cache-Control "no-cache";
}
\`\`\`

## 十一、HTTP/2 与 HTTP/3 详解

### 11.1 HTTP 版本演进

| 版本 | 年份 | 关键特性 | 传输层 |
|------|------|----------|--------|
| HTTP/0.9 | 1991 | 只有 GET，纯文本 | TCP |
| HTTP/1.0 | 1996 | 多方法、Header、状态码 | TCP |
| HTTP/1.1 | 1997 | 持久连接、管道化、Host头 | TCP |
| HTTP/2 | 2015 | 二进制分帧、多路复用、Server Push | TCP |
| HTTP/3 | 2022 | QUIC（UDP）、0-RTT、连接迁移 | UDP |

### 11.2 HTTP/1.1 的痛点

1. **队头阻塞**：一个请求阻塞后续所有请求
2. **连接数限制**：浏览器对同一域名限制 6 个并发连接
3. **Header 冗余**：每次请求携带完整 Header，无压缩
4. **明文传输**：不安全（HTTPS 解决）

**优化手段**：
- 雪碧图、CSS/JS 合并（减少请求数）
- 域名分片（多个子域名绕过连接限制）
- 内联资源（data URI）

### 11.3 HTTP/2 核心特性

**1. 二进制分帧**：将 HTTP 报文分为更小的帧（Frame），用二进制编码

\`\`\`
HTTP/1.1:  "GET / HTTP/1.1\r\nHost: example.com\r\n\r\n"  (文本)
HTTP/2:    [Length:3][Type:HEADERS][Flags:END_HEADERS][StreamID:1][HPACK编码的Header]
\`\`\`

**2. 多路复用**：一个 TCP 连接上并行多个请求/响应

\`\`\`
一个 TCP 连接：
  Stream 1: GET /html     → 200 OK (html)
  Stream 3: GET /style.css → 200 OK (css)
  Stream 5: GET /script.js → 200 OK (js)
  # 三个请求并行，互不阻塞
\`\`\`

**3. Header 压缩（HPACK）**：维护共享的 Header 表，只传变化部分

\`\`\`
# 第一次请求
:method: GET
:path: /index.html
host: example.com
user-agent: Mozilla/5.0...  ← 首次传输完整 Header

# 第二次请求（只传差异）
:path: /style.css            ← 其他 Header 从表中复用
\`\`\`

**4. Server Push**：服务器主动推送资源

\`\`\`
客户端请求: GET /index.html
服务器响应: 200 OK (html)
服务器推送: PUSH /style.css  → 200 OK (css)  ← 客户端还没请求就推了
服务器推送: PUSH /script.js  → 200 OK (js)
\`\`\`

### 11.4 HTTP/3 与 QUIC

HTTP/2 仍有 TCP 层的队头阻塞（一个 TCP 包丢失，所有 Stream 等待重传）。HTTP/3 改用 UDP + QUIC 协议。

**QUIC 核心特性**：
1. **无队头阻塞**：每个 Stream 独立，一个 Stream 丢包不影响其他
2. **连接迁移**：IP 变化（WiFi→4G）不断连
3. **0-RTT 建连**：复用之前的连接参数，首包即数据
4. **内置加密**：TLS 1.3 集成在 QUIC 中

**Java 启用 HTTP/2**：

\`\`\`java
// Java 11+ HttpClient 支持 HTTP/2
HttpClient client = HttpClient.newBuilder()
    .version(HttpClient.Version.HTTP_2)
    .connectTimeout(Duration.ofSeconds(10))
    .build();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users"))
    .header("Accept", "application/json")
    .GET()
    .build();

HttpResponse<String> response = client.send(request,
    HttpResponse.BodyHandlers.ofString());
System.out.println("HTTP版本: " + response.version());  // HTTP_2
System.out.println("状态码: " + response.statusCode());
\`\`\`

## 十二、CORS 跨域与认证机制

### 12.1 同源策略与 CORS

**同源策略**：浏览器限制脚本发起跨域请求（协议+域名+端口必须相同）。

**CORS（跨域资源共享）**：通过 HTTP 头部让服务器声明允许的跨域来源。

**简单请求**（不触发预检）：

\`\`\`
GET /api/users HTTP/1.1
Origin: https://app.example.com

HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.example.com
\`\`\`

**预检请求**（OPTIONS，非简单请求触发）：

\`\`\`
# 浏览器先发 OPTIONS
OPTIONS /api/users HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization

# 服务器响应预检
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400  # 预检结果缓存 24 小时

# 预检通过后，浏览器发真实请求
POST /api/users HTTP/1.1
Origin: https://app.example.com
Content-Type: application/json
Authorization: Bearer eyJhbG...
\`\`\`

### 12.2 Cookie 与跨域

带 Cookie 的跨域请求需要：
1. 前端 \`fetch(url, { credentials: 'include' })\`
2. 后端 \`Access-Control-Allow-Origin\` 不能是 \`*\`，必须指定具体域名
3. 后端 \`Access-Control-Allow-Credentials: true\`

**Java CORS 配置**：

\`\`\`java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://app.example.com")  // 不能用 *
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)  // 允许带 Cookie
            .maxAge(3600);
    }
}
\`\`\`

### 12.3 认证方案对比

| 方案 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| Session+Cookie | 服务端存 Session，Cookie 带 SessionID | 简单、自动携带 | 不适合分布式、CSRF 风险 |
| JWT Token | 签名的 JSON Token，无状态 | 无状态、跨域友好 | 无法主动失效、Token 较大 |
| OAuth 2.0 | 授权码模式 | 安全、标准化 | 复杂 |
| API Key | 固定密钥 | 简单 | 不安全、无法细粒度控制 |

**JWT 结构**：

\`\`\`
Header.Payload.Signature

eyJhbGciOiJIUzI1NiJ9.    ← Header: {"alg":"HS256","typ":"JWT"}
eyJ1c2VySWQiOjEyM30.      ← Payload: {"userId":123,"exp":1735689600}
SflKxwRJSMeKKF2QT4f...    ← Signature: HMAC-SHA256(header.payload, secret)
\`\`\`

**Java JWT 生成与验证**：

\`\`\`java
// 生成 JWT
public String generateToken(User user) {
    return Jwts.builder()
        .setSubject(user.getId().toString())
        .claim("role", user.getRole())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 86400000))  // 24h
        .signWith(secretKey, SignatureAlgorithm.HS256)
        .compact();
}

// 验证 JWT
public User parseToken(String token) {
    Claims claims = Jwts.parserBuilder()
        .setSigningKey(secretKey)
        .build()
        .parseClaimsJws(token)  // 验证签名+过期
        .getBody();
    return userService.findById(Long.parseLong(claims.getSubject()));
}
\`\`\`

### 12.4 RESTful API 设计规范

**URL 设计**：
- 用名词复数：\`/api/users\`，\`/api/orders\`
- 层级表达关系：\`/api/users/123/orders\`
- 查询参数过滤：\`/api/users?role=admin&page=1&size=20\`

**版本管理**：
\`\`\`
/api/v1/users    ← URL 路径版本（最常用）
Accept: application/vnd.example.v2+json  ← Header 版本
\`\`\`

**错误响应格式**：

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "邮箱格式不正确",
    "details": [
      {"field": "email", "issue": "invalid format"}
    ],
    "requestId": "a1b2c3d4",
    "timestamp": "2026-01-15T10:30:00Z"
  }
}
\`\`\`

**分页响应格式**：

\`\`\`json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true
  }
}
\`\`\`

> **HTTP 设计心法**：好的 API 设计让调用者"看 URL 就知道做什么，看状态码就知道结果"。遵循 HTTP 语义——GET 不修改数据、PUT 幂等替换、POST 创建非幂等。错误返回有意义的错误码和错误信息，而不是统统返回 200 + \`{"code": 500}\`。


## 十三、WebSocket 与 Server-Sent Events

### 13.1 实时通信方案对比

| 方案 | 方向 | 协议 | 适用场景 |
|------|------|------|----------|
| 轮询 | 客户端→服务端 | HTTP | 简单场景，实时性要求低 |
| 长轮询 | 客户端→服务端 | HTTP | 兼容性好，有延迟 |
| SSE | 服务端→客户端 | HTTP | 推送通知、股票行情 |
| WebSocket | 双向 | WS | 聊天、协作编辑、游戏 |

### 13.2 WebSocket

WebSocket 在单个 TCP 连接上提供全双工通信。

**握手过程**：HTTP Upgrade 升级协议

\`\`\`
GET /ws HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
\`\`\`

**Java 服务端示例**：

\`\`\`java
@ServerEndpoint("/ws/chat")
public class ChatEndpoint {
    private static Set<Session> sessions = ConcurrentHashMap.newKeySet();

    @OnOpen
    public void onOpen(Session session) {
        sessions.add(session);
        broadcast("用户加入，当前在线: " + sessions.size());
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        broadcast("用户说: " + message);
    }

    @OnClose
    public void onClose(Session session) {
        sessions.remove(session);
        broadcast("用户离开，当前在线: " + sessions.size());
    }

    private void broadcast(String msg) {
        sessions.forEach(s -> s.getAsyncRemote().sendText(msg));
    }
}
\`\`\`

### 13.3 Server-Sent Events (SSE)

SSE 是 HTTP 上的单向推送，比 WebSocket 简单。

**Java SSE 示例**：

\`\`\`java
@GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter stream() {
    SseEmitter emitter = new SseEmitter(0L);  // 永不超时
    new Thread(() -> {
        try {
            while (true) {
                emitter.send(SseEmitter.event()
                    .name("price")
                    .data("{\"stock\":\"AAPL\",\"price\":180.5}")
                    .id(String.valueOf(System.currentTimeMillis())));
                Thread.sleep(1000);
            }
        } catch (Exception e) {
            emitter.complete();
        }
    }).start();
    return emitter;
}
\`\`\`

**Python SSE 示例**：

\`\`\`python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio, json

app = FastAPI()

@app.get("/events")
async def events():
    async def generate():
        while True:
            data = {"stock": "AAPL", "price": 180.5}
            yield f"data: {json.dumps(data)}\n\n"
            await asyncio.sleep(1)
    return StreamingResponse(generate(), media_type="text/event-stream")
\`\`\`

> **实时通信选型**：只需要服务端推送选 SSE（简单、走 HTTP、自动重连）；需要双向交互选 WebSocket。不要用轮询模拟实时——浪费资源且延迟高。


## 十四、HTTP 常见安全头部

安全响应头部是保护 Web 应用的第一道防线，通过 HTTP 头部指令让浏览器执行安全策略。

| 头部 | 作用 | 示例值 |
|------|------|--------|
| Strict-Transport-Security | 强制 HTTPS | max-age=31536000; includeSubDomains |
| X-Content-Type-Options | 禁止 MIME 嗅探 | nosniff |
| X-Frame-Options | 防点击劫持 | DENY |
| Content-Security-Policy | 内容安全策略 | default-src 'self' |
| X-XSS-Protection | XSS 过滤（旧） | 1; mode=block |
| Referrer-Policy | Referer 控制 | strict-origin-when-cross-origin |
| Permissions-Policy | 功能权限控制 | geolocation=(), camera=() |

**Nginx 配置示例**：

\`\`\`nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
\`\`\`

**CSP 策略详解**：CSP 是防止 XSS 最有效的手段，通过白名单限制资源加载来源。

\`\`\`
Content-Security-Policy:
  default-src 'self';                    # 默认只允许同源
  script-src 'self' https://cdn.example.com;  # 脚本来源
  style-src 'self' 'unsafe-inline';      # 样式来源
  img-src 'self' data: https:;          # 图片来源
  connect-src 'self' https://api.example.com;  # AJAX 来源
  font-src 'self' https://fonts.gstatic.com;   # 字体来源
  frame-ancestors 'none';               # 禁止被嵌入 iframe
  report-uri /csp-report;               # 违规上报地址
\`\`\`

> **HTTP 安全心法**：安全头部是"免费"的防护——只需配置服务器，浏览器自动执行。HSTS 防降级、CSP 防 XSS、X-Frame-Options 防点击劫持。每个 Web 应用都应该配置这些头部。


> **核心心法**：HTTP 是后端接口的通用语言。掌握它的报文结构、方法语义、状态码、缓存机制，能让你设计出语义清晰、性能优良的 API，也能在排查网络问题时快速定位"是 HTTP 层的什么问题"。

下面的可运行代码实现了一个完整的 HTTP 请求解析器：给定原始 HTTP 请求文本，解析出方法、路径、查询参数、头部和主体，并实现简单路由分发、Content-Type 判断与状态码返回。纯字符串处理，不依赖 http 模块。`,
    code: `// HTTP 请求解析器 - 纯字符串处理，不依赖 http 模块
// 解析：请求行 + Headers + Body，并实现简单路由分发与状态码返回

// --- 模拟一段原始 HTTP 请求文本 ---
const rawRequest = [
  "POST /api/users?lang=zh&ref=home HTTP/1.1",
  "Host: api.example.com",
  "Content-Type: application/json",
  "Authorization: Bearer abc123xyz",
  "User-Agent: Mozilla/5.0",
  "Content-Length: 42",
  "",
  '{"name":"Alice","age":28,"email":"alice@ex.com"}',
].join("\\n");

// --- HTTP 请求解析器 ---
function parseHttpRequest(raw) {
  const lines = raw.split(/\\r?\\n/);
  // 找到空行（headers 与 body 的分隔）
  let blankIdx = lines.findIndex((l) => l === "");
  if (blankIdx === -1) blankIdx = lines.length;

  // 1. 解析请求行：METHOD PATH VERSION
  const [method, fullPath, version] = lines[0].split(" ");

  // 拆分 path 与 query string
  const [path, queryString] = fullPath.split("?");
  const query = {};
  if (queryString) {
    for (const pair of queryString.split("&")) {
      const [k, v] = pair.split("=");
      query[k] = decodeURIComponent(v || "");
    }
  }

  // 2. 解析 Headers（键名统一小写，便于查找；HTTP/1.1 头部名不区分大小写）
  const headers = {};
  for (let i = 1; i < blankIdx; i++) {
    const line = lines[i];
    const colon = line.indexOf(":");
    if (colon > -1) {
      const key = line.slice(0, colon).trim().toLowerCase();
      const value = line.slice(colon + 1).trim();
      headers[key] = value;
    }
  }

  // 3. 解析 Body（根据 Content-Type 决定如何解析）
  let body = null;
  if (blankIdx + 1 < lines.length) {
    const rawBody = lines.slice(blankIdx + 1).join("\\n");
    const ct = headers["content-type"] || "";
    if (ct.includes("application/json")) {
      try { body = JSON.parse(rawBody); } catch { body = rawBody; }
    } else if (ct.includes("application/x-www-form-urlencoded")) {
      body = {};
      for (const pair of rawBody.split("&")) {
        const [k, v] = pair.split("=");
        body[k] = decodeURIComponent(v || "");
      }
    } else {
      body = rawBody;
    }
  }
  return { method, path, query, version, headers, body };
}

// --- 简单路由分发器（支持路径参数）---
const router = {
  routes: [],
  add(method, pattern, handler) { this.routes.push({ method, pattern, handler }); },
  dispatch(req) {
    for (const r of this.routes) {
      if (r.method !== req.method) continue;
      // 支持路径参数：/api/users/:id
      const paramMatch = matchPath(r.pattern, req.path);
      if (paramMatch) return r.handler(req, paramMatch);
    }
    return { status: 404, body: { error: "Not Found", path: req.path } };
  },
};

// 路径匹配：返回路径参数对象，不匹配返回 null
function matchPath(pattern, path) {
  const pParts = pattern.split("/").filter(Boolean);
  const aParts = path.split("/").filter(Boolean);
  if (pParts.length !== aParts.length) return null;
  const params = {};
  for (let i = 0; i < pParts.length; i++) {
    if (pParts[i].startsWith(":")) {
      params[pParts[i].slice(1)] = aParts[i];
    } else if (pParts[i] !== aParts[i]) {
      return null;
    }
  }
  return params;
}

// 注册路由
router.add("GET", "/api/users", (req) => ({
  status: 200, body: { users: ["Alice", "Bob", "Charlie"] },
}));
router.add("POST", "/api/users", (req) => {
  // 业务校验：name 必填
  if (!req.body || !req.body.name) {
    return { status: 422, body: { error: "name 字段必填" } };
  }
  return { status: 201, body: { msg: "用户已创建", user: req.body } };
});
router.add("GET", "/api/users/:id", (req, params) => ({
  status: 200, body: { id: params.id, name: "用户" + params.id },
}));
router.add("DELETE", "/api/users/:id", (req, params) => ({
  status: 204, body: null,
}));

// 状态码描述映射
const statusText = {
  200: "OK", 201: "Created", 204: "No Content",
  404: "Not Found", 405: "Method Not Allowed", 422: "Unprocessable Entity",
};

// --- 执行解析 ---
console.log("=== 原始请求文本 ===");
console.log(rawRequest);

console.log("\\n=== 解析结果 ===");
const req = parseHttpRequest(rawRequest);
console.log("Method     :", req.method);
console.log("Path       :", req.path);
console.log("Query      :", JSON.stringify(req.query));
console.log("Version    :", req.version);
console.log("Headers    :", JSON.stringify(req.headers, null, 2));
console.log("Body       :", JSON.stringify(req.body));

console.log("\\n=== 路由分发 ===");
const result = router.dispatch(req);
console.log("HTTP/1.1 " + result.status + " " + (statusText[result.status] || ""));
console.log("Content-Type: application/json");
console.log("");
console.log(result.body ? JSON.stringify(result.body, null, 2) : "(无内容)");

// 测试路径参数路由
console.log("\\n=== 测试路径参数 GET /api/users/42 ===");
const req2 = { method: "GET", path: "/api/users/42", headers: {}, body: null };
const r2 = router.dispatch(req2);
console.log("HTTP/1.1 " + r2.status + " " + statusText[r2.status]);
console.log(JSON.stringify(r2.body));

// 测试校验失败
console.log("\\n=== 测试校验失败 POST 缺少 name ===");
const req3 = { method: "POST", path: "/api/users", headers: { "content-type": "application/json" }, body: { age: 20 } };
const r3 = router.dispatch(req3);
console.log("HTTP/1.1 " + r3.status + " " + statusText[r3.status]);
console.log(JSON.stringify(r3.body));

// 测试 404
console.log("\\n=== 测试 404 ===");
const notFound = router.dispatch({ method: "GET", path: "/nope" });
console.log("HTTP/1.1 " + notFound.status + " " + statusText[notFound.status]);
console.log(JSON.stringify(notFound.body));`,
  },

  // ============================================================
  // 第 3 章：HTTPS 与 TLS 实战
  // ============================================================
  {
    id: "backend-https",
    group: "基础与网络",
    icon: "🔒",
    title: "HTTPS 与 TLS 实战",
    content: `# HTTPS 与 TLS 实战

HTTP 默认是明文传输的，这在互联网早期没问题，但在今天，明文传输意味着密码、token、个人信息都可能被窃听、篡改、伪造。HTTPS（HTTP over TLS）通过加密、完整性校验和身份认证，解决了 HTTP 的三大安全威胁。本章从加密基础、TLS 握手、证书体系到部署实践，系统讲解 HTTPS。

---

## 为什么需要 HTTPS

### 三大网络威胁

HTTP 明文传输面临三类攻击：

1. **窃听（Sniffing）**：明文传输，中间人（ISP、WiFi 钓鱼、网络劫持）可看到所有内容。你在咖啡店连免费 WiFi 登录网银，密码就可能被截获。
2. **篡改（Tampering）**：中间人修改传输内容。运营商在 HTTP 页面注入广告、劫持跳转，都是篡改。
3. **伪造（Spoofing）**：攻击者冒充服务器，骗取用户数据。假银行网站、钓鱼网站就是伪造。

### HTTPS 如何解决

HTTPS = HTTP + TLS。TLS 提供三种保护：

- **机密性（Confidentiality）**：加密传输，即使被截获也无法解密。
- **完整性（Integrity）**：MAC（消息认证码）校验，一旦篡改就能发现。
- **身份认证（Authentication）**：数字证书证明"这个公钥确实属于这个域名"，防伪造。

\`\`\`
HTTP（明文）：  客户端 ──── 明文数据 ────> 服务器    （可窃听、可篡改、可伪造）
HTTPS（加密）： 客户端 ──── 加密数据 ────> 服务器    （加密防窃听、MAC防篡改、证书防伪造）
\`\`\`

### 为什么不全部用 HTTPS

历史上 HTTPS 慢（TLS 握手开销）、贵（证书要花钱）、复杂（证书管理）。但今天：
- TLS 1.3 握手只要 1-RTT，性能开销很小。
- Let's Encrypt 提供免费证书。
- HTTP/2/3 强制要求 HTTPS。

所以现在**所有网站都该用 HTTPS**，浏览器甚至把 HTTP 标记为"不安全"。Google 也把 HTTPS 作为搜索排名因素。

---

## 加密基础

理解 HTTPS 必须先理解加密的三种基本手段。

### 对称加密

加密和解密用**同一个密钥**。速度快，适合大量数据。

- **AES**：最主流的对称加密算法，AES-128/192/256。安全、高效，硬件加速。
- **DES/3DES**：老算法，已不安全，淘汰中。
- **ChaCha20**：Google 推广，移动端无 AES 硬件加速时比 AES 快。

\`\`\`js
// Node.js：AES 对称加密
const crypto = require("crypto");
const key = crypto.randomBytes(32); // AES-256 需要 32 字节密钥
const iv = crypto.randomBytes(16);  // 初始化向量，每次不同
const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
let encrypted = cipher.update("敏感数据", "utf8", "hex");
encrypted += cipher.final("hex");
// 解密
const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
let decrypted = decipher.update(encrypted, "hex", "utf8");
decrypted += decipher.final("utf8");
\`\`\`

**问题**：对称加密的密钥如何安全地传给对方？如果密钥也被窃听，加密就形同虚设。这就是**密钥分发问题**，非对称加密解决它。

### 非对称加密

加密和解密用**一对密钥**：公钥（public key）和私钥（private key）。公钥加密只能私钥解密，私钥加密只能公钥解密。公钥可以公开，私钥必须保密。

- **RSA**：最经典，基于大数分解难题。慢，适合加密少量数据（如密钥）。
- **ECC（椭圆曲线）**：更短的密钥达到同等安全，更快。TLS 1.3 倾向用 ECC。

\`\`\`
公钥加密 → 私钥解密：保密通信（任何人能用公钥加密，只有私钥持有者能解密）
私钥加密 → 公钥解密：数字签名（只有私钥能签，公钥可验签）
\`\`\`

**非对称加密解决密钥分发**：客户端用服务端公钥加密一个对称密钥，只有服务端私钥能解密。双方就安全地共享了对称密钥，后续用对称加密通信。这正是 TLS 的思路。

非对称加密很慢，所以实际 HTTPS 是"混合加密"：非对称加密交换密钥，对称加密传输数据。

### 哈希（Hash）

哈希把任意长度数据映射成固定长度摘要，不可逆、抗碰撞。

- **MD5**：已不安全（可碰撞），仅用于校验完整性，不用于安全场景。
- **SHA-1**：已不安全，淘汰中。
- **SHA-256/SHA-512**：当前主流，安全。
- **SHA-3**：新一代，与 SHA-2 不同结构。

哈希的用途：
- **完整性校验**：文件下载校验 MD5/SHA256。
- **密码存储**：存哈希不存明文（要加盐 + 慢哈希如 bcrypt）。
- **数字签名**：对哈希签名而非原文（性能）。
- **消息认证码（HMAC）**：带密钥的哈希，验证消息来源和完整性。

\`\`\`js
// Node.js：哈希
const crypto = require("crypto");
crypto.createHash("sha256").update("hello").digest("hex");
// HMAC：带密钥的哈希
crypto.createHmac("sha256", "secret").update("hello").digest("hex");
\`\`\`

### 数字签名

数字签名 = 用私钥对消息哈希加密。它解决"消息确实来自某人且未被篡改"。

签名过程：
1. 发送方对消息计算哈希。
2. 用自己的私钥加密哈希，得到签名。
3. 把消息 + 签名一起发送。

验签过程：
1. 接收方用发送方公钥解密签名，得到哈希 A。
2. 对收到的消息重新计算哈希 B。
3. 比对 A 和 B，相同则验证通过。

\`\`\`
签名：hash(消息) → 私钥加密 → 签名
验签：签名 → 公钥解密 → hashA；hash(收到消息) → hashB；hashA == hashB ?
\`\`\`

---

## TLS 握手完整过程

TLS 握手的目标：双方协商加密算法、验证服务端身份、安全地交换会话密钥。TLS 1.2 和 1.3 有显著差异。

### TLS 1.2 握手（2-RTT）

\`\`\`
Client                                    Server
  |                                          |
  | ---- ClientHello ----------------------> |  (1) 客户端发起
  |      (支持的密码套件、随机数A、SNI)        |
  |                                          |
  | <---- ServerHello ---------------------- |  (2) 服务端响应
  |      (选定套件、随机数B)                   |
  | <---- Certificate ---------------------- |      证书（含公钥）
  | <---- ServerKeyExchange ---------------- |      密钥交换参数（如 ECDHE 公钥）
  | <---- ServerHelloDone ----------------- |
  |                                          |
  | ---- ClientKeyExchange ----------------> |  (3) 客户端密钥交换
  |      (客户端公钥)                          |
  | ---- ChangeCipherSpec -----------------> |      切换到加密
  | ---- Finished -------------------------> |      加密的验证消息
  |                                          |
  | <---- ChangeCipherSpec ---------------- |  (4) 服务端切换
  | <---- Finished ------------------------ |
  |                                          |
  | ==== 加密的应用数据（HTTP）============= |
\`\`\`

详细步骤：
1. **ClientHello**：客户端发送支持的 TLS 版本、密码套件列表、客户端随机数 A、SNI（要访问的域名，用于虚拟主机选证书）。
2. **ServerHello**：服务端选定 TLS 版本、密码套件，返回服务端随机数 B。
3. **Certificate**：服务端发送数字证书链（服务器证书 + 中间 CA 证书）。
4. **ServerKeyExchange**：服务端发送密钥交换参数（如 ECDHE 的公钥部分）。
5. **ClientKeyExchange**：客户端发送密钥交换参数。
6. 双方根据两个随机数和密钥交换参数，计算出**预主密钥**，再推导出**会话密钥**。
7. **Finished**：双方发送加密的验证消息，确认握手未被篡改。
8. 后续通信用会话密钥对称加密。

### TLS 1.3 握手（1-RTT）

TLS 1.3 大幅简化握手：

\`\`\`
Client                                    Server
  |                                          |
  | ---- ClientHello ----------------------> |  (1) 含密钥交换参数
  |      (套件、随机数A、ECDHE公钥)            |
  |                                          |
  | <---- ServerHello ---------------------- |  (2) 含密钥交换参数
  |      (套件、随机数B、ECDHE公钥)            |
  | <---- EncryptedExtensions -------------- |
  | <---- Certificate ---------------------- |      （已加密）
  | <---- Finished ------------------------ |
  |                                          |
  | ---- Finished -------------------------> |  (3)
  |                                          |
  | ==== 加密的应用数据 ===================== |
\`\`\`

**TLS 1.3 改进**：
- 握手从 2-RTT 减到 1-RTT。
- 握手消息大部分已加密（TLS 1.2 握手是明文）。
- 移除不安全的算法（RSA 密钥交换、RC4、DES、MD5）。
- 强制使用前向安全（Forward Secrecy）的密钥交换（ECDHE）。
- 支持 0-RTT 恢复（Session Resumption）。

### 1-RTT vs 2-RTT 的实际影响

RTT（往返时间）是网络延迟的核心。跨地域 RTT 可能 100-200ms。

- TLS 1.2 首次连接：TCP 1 RTT + TLS 2 RTT = 3 RTT。
- TLS 1.3 首次连接：TCP 1 RTT + TLS 1 RTT = 2 RTT。
- TLS 1.3 恢复连接：0-RTT（首个请求就能带数据）。

对一个 100ms RTT 的连接，TLS 1.2 比 1.3 多 100ms 首次连接开销。

### 前向安全（Forward Secrecy）

前向安全指：即使服务端私钥将来泄露，过去已捕获的加密通信仍无法被解密。因为每次会话密钥由临时密钥交换（ECDHE）生成，用完即弃，不依赖长期私钥。

TLS 1.2 中 RSA 密钥交换**没有**前向安全（私钥泄露可解密所有历史流量），所以 TLS 1.3 强制 ECDHE，保证前向安全。

---

## 数字证书与 CA 体系

证书是 HTTPS 信任的根基。它解决"我怎么知道这个公钥真的是这个网站的"。

### 证书的作用

证书 = 公钥 + 域名 + 有效期 + CA 签名。CA（Certificate Authority，证书颁发机构）是受信任的第三方，用自己的私钥给证书签名，证明"这个公钥确实属于这个域名"。

浏览器/操作系统内置了一批**根 CA 证书**，据此验证服务端证书的签名链。

### 证书链

证书是分层的：

\`\`\`
根 CA 证书（Root CA，自签名，预置在系统/浏览器）
  │ 签名
  ▼
中间 CA 证书（Intermediate CA）
  │ 签名
  ▼
终端证书（你的网站证书，含你的域名和公钥）
\`\`\`

验证过程：
1. 服务器发送终端证书 + 中间 CA 证书。
2. 客户端用中间 CA 的公钥验证终端证书的签名。
3. 用根 CA 的公钥验证中间 CA 证书的签名。
4. 根 CA 是预置信任的，验证到此结束。

所以服务器要发送**完整证书链**（终端 + 中间），否则客户端无法验证。漏发中间证书是常见配置错误。

### CA 的信任模型

- **根 CA**：DigiCert、GlobalSign、Let's Encrypt 等，预置在操作系统/浏览器。
- **中间 CA**：根 CA 不直接签终端证书（保护根 CA 私钥安全），而是签中间 CA，中间 CA 签终端证书。
- **交叉签名**：新 CA 为建立信任，会让老根 CA 签它的根证书。

### 证书验证内容

客户端验证证书时要检查：
1. **签名链**：能追溯到受信任的根 CA。
2. **域名匹配**：证书的 Common Name 或 SAN 包含访问的域名。
3. **有效期**：当前时间在 notBefore 和 notAfter 之间。
4. **用途**：密钥用途扩展（Key Usage）允许用于服务器认证。
5. **吊销状态**：证书是否被吊销（OCSP/CRL）。

### OCSP 与 CRL

证书可能被吊销（私钥泄露、域名变更），客户端要检查吊销状态：

- **CRL（Certificate Revocation List）**：CA 发布吊销列表，客户端下载检查。缺点：列表越来越大、更新不及时。
- **OCSP（Online Certificate Status Protocol）**：实时查询证书状态。缺点：每次访问都查询慢，且泄露隐私（CA 知道你访问了哪个站点）。
- **OCSP Stapling**：服务端预先获取 OCSP 响应，随证书一起发给客户端。解决查询慢和隐私问题，是推荐做法。

---

## 证书类型

### 按验证级别

- **DV（Domain Validation）**：只验证域名所有权，签发快（自动化），便宜/免费。Let's Encrypt 都是 DV。适合个人网站、博客。
- **OV（Organization Validation）**：验证域名所有权 + 组织身份，证书显示公司名。适合企业网站。
- **EV（Extended Validation）**：严格审核，浏览器地址栏曾显示绿色公司名（现在多数浏览器已取消此显示）。最贵，适合金融。

### 按覆盖范围

- **单域名证书**：只保护一个域名（如 \`www.example.com\`）。
- **通配符证书**：保护 \`*.example.com\` 下所有子域。方便但要保护私钥。
- **多域名证书（SAN/UCC）**：一张证书保护多个域名（如 \`example.com\`、\`api.example.com\`、\`blog.com\`）。

现代证书都用 SAN（Subject Alternative Name）字段指定域名，CN（Common Name）已逐渐弃用。

---

## Let's Encrypt 与 ACME 协议

Let's Encrypt 是免费、自动化的 CA，推动了 HTTPS 普及。它用 **ACME 协议**（RFC 8555）自动化证书签发。

### ACME 流程

1. 客户端（如 certbot）生成账户密钥。
2. 向 Let's Encrypt 注册账户。
3. 申请证书，Let's Encrypt 返回验证挑战（challenge）。
4. 客户端完成挑战，证明对域名的控制权：
   - **HTTP-01**：在 \`/.well-known/acme-challenge/<token>\` 放验证文件。
   - **DNS-01**：在 DNS 加 TXT 记录。
5. 验证通过，Let's Encrypt 签发证书。
6. 客户端定期（到期前 30 天）自动续期。

\`\`\`bash
# 用 certbot 申请 Let's Encrypt 证书
sudo certbot certonly --webroot -w /var/www/html -d example.com -d www.example.com
# 自动续期（certbot 会装定时任务）
sudo certbot renew --dry-run
\`\`\`

Let's Encrypt 证书有效期 90 天（短有效期降低泄露风险，强制自动化续期）。配合 certbot 的定时任务，可全自动。

---

## HTTPS 部署实践

### Nginx 配置示例

\`\`\`nginx
# HTTP 跳转 HTTPS
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}

# HTTPS 服务
server {
    listen 443 ssl http2;              # 启用 HTTP/2
    server_name example.com www.example.com;

    # 证书（终端证书 + 中间证书合并的 fullchain）
    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # 只用安全协议
    ssl_protocols TLSv1.2 TLSv1.3;     # 禁用 TLSv1.0/1.1
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers on;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;

    # 会话恢复（减少握手）
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets on;

    # HSTS：强制浏览器后续都用 HTTPS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
\`\`\`

### HSTS（HTTP Strict Transport Security）

HSTS 是响应头，告诉浏览器"这个域名以后都用 HTTPS 访问"。防止首次 HTTP 请求被劫持（SSL Strip 攻击）。

\`\`\`http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
\`\`\`

- \`max-age\`：强制 HTTPS 的秒数（1 年）。
- \`includeSubDomains\`：包含子域。
- \`preload\`：申请加入浏览器的 HSTS 预加载列表（内置强制 HTTPS）。

> 注意：HSTS 一旦生效，在 max-age 内无法回退到 HTTP。要先确认 HTTPS 稳定再开。

### 证书自动续期

用 certbot + cron/systemd timer 自动续期：

\`\`\`bash
# crontab 每天 3 点检查续期（实际只在快过期时续）
0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
\`\`\`

### HTTPS 性能优化

1. **会话恢复（Session Resumption）**：复用之前握手的会话密钥，省去完整握手。两种方式：
   - **Session ID**：服务端缓存会话，客户端带 Session ID 恢复。
   - **Session Ticket**：服务端把会话加密成 ticket 给客户端，客户端带 ticket 恢复（无状态，适合分布式）。
2. **0-RTT（TLS 1.3）**：恢复连接时首个请求就能带数据，零延迟。
3. **OCSP Stapling**：服务端预先获取 OCSP 响应，避免客户端查询。
4. **HTTP/2**：多路复用减少连接数，间接减少握手。
5. **ECC 证书**：比 RSA 证书更小、握手更快。
6. **会话缓存共享**：多台服务器共享 Session Ticket 密钥，任意机器都能恢复。

---

## 常见 HTTPS 错误排查

### 1. 证书过期（Certificate Expired）

浏览器显示"NET::ERR_CERT_DATE_INVALID"。证书有有效期，过期要续期。

\`\`\`bash
# 查看证书有效期
openssl s_client -connect example.com:443 -servername example.com < /dev/null 2>/dev/null | openssl x509 -noout -dates
\`\`\`

**预防**：用 Let's Encrypt 自动续期，或用监控告警（证书到期前 30 天告警）。

### 2. 域名不匹配（Domain Mismatch）

证书的域名与访问的域名不一致。如证书是 \`www.example.com\`，访问 \`api.example.com\`。

**解决**：申请包含所有域名的证书（SAN），或用通配符证书。

### 3. 不信任的 CA（Unknown CA）

证书由非主流 CA 签发，或自签名证书，浏览器不信任。

**解决**：用主流 CA 的证书；自签名仅用于内网测试（需手动导入信任）。

### 4. 证书链不完整（Incomplete Chain）

服务器只发了终端证书，没发中间证书，客户端无法验证到根 CA。

\`\`\`bash
# 检查证书链
openssl s_client -connect example.com:443 -showcerts < /dev/null
\`\`\`

**解决**：用 fullchain（终端 + 中间合并）而非只 cert。

### 5. 混合内容（Mixed Content）

HTTPS 页面里加载了 HTTP 资源（图片、JS），浏览器阻止或降级。

**解决**：所有资源都用 HTTPS，或用相对协议 \`//cdn.example.com/x.js\`。

### 6. TLS 版本过低

服务端只支持 TLS 1.0/1.1，现代浏览器拒绝连接。

**解决**：升级到 TLS 1.2/1.3。

### 排查工具

\`\`\`bash
# 查看证书详情
openssl s_client -connect example.com:443 -servername example.com

# 测试支持的协议和套件
nmap --script ssl-enum-ciphers -p 443 example.com

# 在线检测
# https://www.ssllabs.com/ssltest/ （SSL Labs 综合检测）
\`\`\`

---

## 多语言 HTTPS 服务对照

\`\`\`java
// Java：启用 HTTPS 的 Spring Boot（application.yml）
server:
  ssl:
    enabled: true
    key-store: classpath:keystore.p12
    key-store-password: changeit
    key-store-type: PKCS12
  port: 8443
\`\`\`

\`\`\`go
// Go：HTTPS 服务
func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "HTTPS")
    })
    // 证书和私钥文件
    http.ListenAndServeTLS(":8443", "cert.pem", "key.pem", nil)
}
\`\`\`

\`\`\`python
# Python：Flask HTTPS（开发用自签证书）
app.run(host="0.0.0.0", port=8443, ssl_context=("cert.pem", "key.pem"))
\`\`\`

\`\`\`js
// Node.js：HTTPS 服务
const https = require("https");
const fs = require("fs");
const options = {
  cert: fs.readFileSync("cert.pem"),
  key: fs.readFileSync("key.pem"),
};
https.createServer(options, (req, res) => {
  res.end("HTTPS");
}).listen(8443);
\`\`\`

---

## 常见坑与实战要点

1. **私钥泄露**：私钥是 HTTPS 安全的根基，泄露后所有通信可被解密（无前向安全时）。私钥要严格保管，权限 600，不上传 Git。

2. **证书链不完整**：只配终端证书不配中间证书，导致部分客户端报错。务必用 fullchain。

3. **HSTS 误开**：HSTS 生效后无法回退，HTTPS 没稳定前别开。先小 max-age 测试。

4. **TLS 1.0/1.1 未禁用**：旧协议有漏洞（POODLE、BEAST），应禁用，只用 1.2/1.3。

5. **弱密码套件**：禁用 RC4、DES、MD5 套件，只用 AEAD 套件（GCM/ChaCha20）。

6. **自签名证书用于生产**：自签名不受信任，用户看到警告。生产必须用受信 CA。

7. **证书覆盖不全**：忘了加子域名，访问子域时报错。用通配符或 SAN 列全。

8. **混合内容**：HTTPS 页面引用 HTTP 资源被阻止。全站 HTTPS。

9. **续期失败未告警**：证书过期服务直接不可用。监控证书有效期，提前告警。

10. **Session Ticket 密钥不轮换**：长期不换有前向安全风险。定期轮换。

---

## 面试题精选

**Q1：HTTPS 解决了 HTTP 的什么问题？**
答：三大威胁——窃听（加密解决）、篡改（MAC 解决）、伪造（证书解决）。通过 TLS 提供机密性、完整性、身份认证。

**Q2：TLS 握手过程？**
答：ClientHello（客户端发支持的套件和随机数）→ ServerHello（服务端选定套件和随机数 + 证书）→ 密钥交换（双方交换参数算出会话密钥）→ Finished（验证握手未被篡改）→ 加密通信。TLS 1.2 是 2-RTT，TLS 1.3 是 1-RTT。

**Q3：为什么 HTTPS 用混合加密？**
答：非对称加密安全但慢，对称加密快但密钥分发难。所以用非对称加密安全交换对称密钥，再用对称加密传输数据，兼顾安全和性能。

**Q4：什么是前向安全？**
答：即使长期私钥泄露，过去已加密的通信仍无法被解密。因为每次会话密钥由临时密钥交换（ECDHE）生成，用完即弃。TLS 1.3 强制前向安全。

**Q5：数字证书的作用？**
答：把公钥与域名绑定，由 CA 签名背书。客户端验证证书链追溯到受信任的根 CA，确信"这个公钥确实属于这个域名"，防中间人伪造。

**Q6：HSTS 是什么？**
答：响应头，强制浏览器在 max-age 内只用 HTTPS 访问该域名，防止首次 HTTP 请求被劫持降级（SSL Strip）。

**Q7：如何排查"证书不信任"？**
答：检查证书链是否完整（漏中间证书）、证书是否过期、域名是否匹配、CA 是否受信任、是否自签名。用 openssl s_client 或 SSL Labs 检测。

---

## 生产案例

**案例一：证书过期导致全站不可用**
某公司用付费证书，管理员离职后无人续费，证书过期，全站 HTTPS 报错，用户无法访问。
**解决**：改用 Let's Encrypt 自动续期；监控证书有效期，到期前 30 天告警。

**案例二：中间证书缺失**
某站配了新证书，自己浏览器正常（缓存了中间证书），但部分用户报"不信任"。因为只配了终端证书，漏了中间证书。
**解决**：用 fullchain.pem（终端 + 中间合并）。

**案例三：HSTS 锁死**
某站开了 HSTS 后想临时回退 HTTP 测试，发现浏览器一直强制 HTTPS。
**解决**：HSTS 无法立即撤销，必须等 max-age 过期。先小 max-age 测试，确认稳定再开长 max-age。

**案例四：私钥泄露**
某站私钥误传到公开 Git 仓库，被爬虫抓取。
**解决**：立即吊销证书（联系 CA）、签发新证书、轮换密钥、排查是否被利用。私钥权限 600，用 .gitignore 排除。

## 七、加密算法基础深入

### 7.1 对称加密详解

对称加密使用**同一个密钥**进行加密和解密，速度快，适合大量数据加密。

**常见算法对比**：

| 算法 | 密钥长度 | 分组大小 | 安全性 | 性能 |
|------|----------|----------|--------|------|
| AES-128 | 128 bit | 128 bit | 安全 | 极快 |
| AES-256 | 256 bit | 128 bit | 非常安全 | 快 |
| ChaCha20 | 256 bit | 流密码 | 安全 | 快（无AES指令集时更快） |
| 3DES | 168 bit | 64 bit | 已不安全 | 慢 |
| DES | 56 bit | 64 bit | 已破解 | 不推荐 |

**AES 加密模式**：

| 模式 | 全称 | 特点 | 安全性 |
|------|------|------|--------|
| ECB | Electronic Codebook | 每块独立加密 | 不安全（模式泄露） |
| CBC | Cipher Block Chaining | 前块密文异或后块明文 | 安全（需IV） |
| CTR | Counter | 计数器模式，流密码 | 安全 |
| GCM | Galois/Counter Mode | CTR + 认证标签 | 推荐（AEAD） |

**Java AES-GCM 加密示例**：

\`\`\`java
public static byte[] encrypt(byte[] plaintext, byte[] key, byte[] nonce) throws Exception {
    Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
    SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
    GCMParameterSpec paramSpec = new GCMParameterSpec(128, nonce);  // 128位认证标签
    cipher.init(Cipher.ENCRYPT_MODE, keySpec, paramSpec);
    return cipher.doFinal(plaintext);
}

public static byte[] decrypt(byte[] ciphertext, byte[] key, byte[] nonce) throws Exception {
    Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
    SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
    GCMParameterSpec paramSpec = new GCMParameterSpec(128, nonce);
    cipher.init(Cipher.DECRYPT_MODE, keySpec, paramSpec);
    return cipher.doFinal(ciphertext);  // 认证失败会抛异常
}
\`\`\`

**Go AES-GCM 示例**：

\`\`\`go
func encrypt(plaintext, key []byte) ([]byte, error) {
    block, err := aes.NewCipher(key)
    if err != nil { return nil, err }
    gcm, err := cipher.NewGCM(block)
    if err != nil { return nil, err }
    nonce := make([]byte, gcm.NonceSize())
    rand.Read(nonce)
    return gcm.Seal(nonce, nonce, plaintext, nil), nil  // nonce前缀
}
\`\`\`

### 7.2 非对称加密详解

非对称加密使用**一对密钥**（公钥+私钥），公钥加密只能私钥解密，反之亦然。

**常见算法**：

| 算法 | 原理 | 密钥长度 | 用途 |
|------|------|----------|------|
| RSA | 大数分解困难 | 2048/4096 bit | 加密、签名、密钥交换 |
| ECDSA | 椭圆曲线离散对数 | 256 bit | 签名（同等安全性密钥更短） |
| ECDH | 椭圆曲线DH | 256 bit | 密钥交换 |
| Ed25519 | Edwards曲线 | 256 bit | 签名（快、安全） |

**RSA 加密与签名**：

\`\`\`java
// 生成密钥对
KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
gen.initialize(2048);
KeyPair pair = gen.generateKeyPair();

// 加密（公钥加密）
Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
cipher.init(Cipher.ENCRYPT_MODE, pair.getPublic());
byte[] ciphertext = cipher.doFinal(plaintext);

// 签名（私钥签名）
Signature sig = Signature.getInstance("SHA256withRSA");
sig.initSign(pair.getPrivate());
sig.update(data);
byte[] signature = sig.sign();

// 验签（公钥验签）
sig.initVerify(pair.getPublic());
sig.update(data);
boolean valid = sig.verify(signature);
\`\`\`

**Python RSA 示例**：

\`\`\`python
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes

# 生成密钥对
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

# 加密
ciphertext = public_key.encrypt(
    plaintext,
    padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()),
                 algorithm=hashes.SHA256(), label=None)
)

# 签名
signature = private_key.sign(
    data,
    padding.PSS(mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH),
    hashes.SHA256()
)
\`\`\`

### 7.3 哈希函数详解

哈希函数将任意长度输入映射为固定长度输出，具有单向性、抗碰撞性。

**常见哈希算法**：

| 算法 | 输出长度 | 安全性 | 性能 |
|------|----------|--------|------|
| MD5 | 128 bit | 已破解 | 快 |
| SHA-1 | 160 bit | 已破解 | 快 |
| SHA-256 | 256 bit | 安全 | 中 |
| SHA-512 | 512 bit | 安全 | 中 |
| SHA-3 | 256/512 bit | 安全 | 中 |
| BLAKE2 | 256/512 bit | 安全 | 极快 |

**Java 哈希示例**：

\`\`\`java
MessageDigest md = MessageDigest.getInstance("SHA-256");
byte[] hash = md.digest("Hello World".getBytes(StandardCharsets.UTF_8));
String hexHash = bytesToHex(hash);  // 转十六进制字符串
\`\`\`

**Go 哈希示例**：

\`\`\`go
hash := sha256.Sum256([]byte("Hello World"))
hexHash := hex.EncodeToString(hash[:])
\`\`\`

### 7.4 HMAC（消息认证码）

HMAC = Hash(key, message)，用于验证消息的完整性和真实性。

\`\`\`java
Mac mac = Mac.getInstance("HmacSHA256");
mac.init(new SecretKeySpec(key, "HmacSHA256"));
byte[] hmac = mac.doFinal(message.getBytes());
\`\`\`

**HMAC vs 普通哈希**：
- 普通哈希：任何人都能计算，只能验证完整性
- HMAC：只有持密钥者能计算，验证完整性+真实性

### 7.5 数字签名

数字签名 = 用私钥对消息哈希值进行加密。

\`\`\`
发送方：
1. 计算消息哈希：hash = SHA256(message)
2. 用私钥签名：signature = RSA_Sign(privateKey, hash)
3. 发送：message + signature

接收方：
1. 用公钥验签：RSA_Verify(publicKey, hash, signature) → true/false
2. 计算收到消息的哈希，与验签结果比对
\`\`\`

## 八、TLS 1.2 握手完整流程

### 8.1 TLS 握手步骤

TLS 1.2 握手需要 2 个 RTT（往返时间）才能开始传输应用数据。

\`\`\`
客户端                                          服务端
  |                                               |
  | --- 1. ClientHello ------------------------→  |
  |     (支持的TLS版本、加密套件、随机数A)          |
  |                                               |
  | ←-- 2. ServerHello -------------------------  |
  |     (选定TLS版本、加密套件、随机数B)            |
  | ←-- 3. Certificate ------------------------  |
  |     (服务器证书，含公钥)                       |
  | ←-- 4. ServerKeyExchange ------------------  |  (ECDHE参数)
  | ←-- 5. ServerHelloDone --------------------  |
  |                                               |
  | --- 6. ClientKeyExchange -----------------→  |  (ECDHE公钥)
  | --- 7. ChangeCipherSpec ------------------→  |  (通知后续加密)
  | --- 8. Finished --------------------------→  |  (加密的握手摘要)
  |                                               |
  | ←-- 9. ChangeCipherSpec --------------------  |
  | ←-- 10. Finished ---------------------------  |
  |                                               |
  | ←→ 应用数据传输（已加密）←→                    |
\`\`\`

### 8.2 密钥推导过程

\`\`\`
1. 客户端随机数 A (32字节) + 服务端随机数 B (32字节)
2. ECDHE 密钥交换 → Pre-Master Secret (48字节)
3. Master Secret = PRF(Pre-Master, "master secret", A + B)  (48字节)
4. 密钥块 = PRF(Master Secret, "key expansion", A + B)
5. 从密钥块切分出：
   - 客户端写密钥、服务端写密钥
   - 客户端写IV、服务端写IV
   - 客户端写MAC密钥、服务端写MAC密钥
\`\`\`

### 8.3 ClientHello 详解

\`\`\`
TLS记录层:
  ContentType: Handshake (22)
  Version: TLS 1.0 (用于兼容)
  Length: ...

握手层:
  HandshakeType: ClientHello (1)
  Length: ...
  ClientVersion: TLS 1.2 (0x0303)
  Random:
    gmt_unix_time: 1735689600
    random_bytes: [28字节随机数]
  SessionID: [空或之前的会话ID]
  CipherSuites: [支持的加密套件列表]
    TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 (0xc02f)
    TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (0xc030)
    TLS_RSA_WITH_AES_128_GCM_SHA256 (0x009c)
    ...
  CompressionMethods: [null]  (不压缩)
  Extensions:
    server_name: api.example.com  (SNI)
    supported_versions: TLS 1.3, TLS 1.2
    signature_algorithms: rsa_pss_rsae_sha256, ecdsa_secp256r1_sha256
    supported_groups: x25519, secp256r1
    ...
\`\`\`

### 8.4 加密套件命名

\`\`\`
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
     │      │        │        │    │
     │      │        │        │    └─ 消息认证: SHA256
     │      │        │        └────── 加密模式: GCM (AEAD)
     │      │        └─────────────── 对称加密: AES-128
     │      └──────────────────────── 签名/认证: RSA
     └─────────────────────────────── 密钥交换: ECDHE
\`\`\`

### 8.5 会话恢复

为减少握手开销，TLS 支持会话恢复：

**Session ID**：
\`\`\`
首次握手 → 服务器返回 SessionID
再次连接 → 客户端带 SessionID → 服务器查到会话 → 1-RTT 恢复
\`\`\`

**Session Ticket**：
\`\`\`
首次握手 → 服务器返回加密的 Session Ticket（含会话信息）
再次连接 → 客户端带 Ticket → 服务器解密验证 → 1-RTT 恢复
\`\`\`

## 九、TLS 1.3 握手与 0-RTT

### 9.1 TLS 1.3 改进

TLS 1.3 相比 1.2 的重大改进：
1. **握手简化**：1-RTT（比 1.2 少一个往返）
2. **0-RTT 恢复**：会话恢复时首包即数据
3. **强制前向安全**：移除 RSA 密钥交换，只保留 ECDHE
4. **移除不安全算法**：删减 RC4、DES、MD5、SHA-1、静态 RSA
5. **加密更多握手**：ServerHello 之后全部加密
6. **AEAD 强制**：只保留 GCM、ChaCha20-Poly1305

### 9.2 TLS 1.3 握手流程

\`\`\`
客户端                                          服务端
  |                                               |
  | --- 1. ClientHello ------------------------→  |
  |     (含 ECDHE 公钥 + 早期数据[0-RTT])          |
  |                                               |
  | ←-- 2. ServerHello -------------------------  |
  |     (含 ECDHE 公钥)                           |
  | ←-- {EncryptedExtensions} -----------------  |  {}表示已加密
  | ←-- {Certificate} -------------------------  |
  | ←-- {CertificateVerify} --------------------  |
  | ←-- {Finished} ----------------------------  |
  |                                               |
  | --- {Finished} ---------------------------→  |
  |                                               |
  | ←→ 应用数据（已加密）←→                        |
\`\`\`

**密钥推导**：
\`\`\`
1. ECDHE → Shared Secret
2. Handshake Secret = HKDF-Extract(Derived Secret, Shared Secret)
3. Master Secret = HKDF-Extract(Derived Secret, Handshake Secret)
4. 各种密钥从 Master Secret 派生
\`\`\`

### 9.3 0-RTT 详解

0-RTT 允许客户端在握手第一个包就携带应用数据（基于之前的会话密钥）。

\`\`\`
# 首次连接（1-RTT）
ClientHello + key_share → ServerHello + key_share
→ 1 个 RTT 后开始传输数据

# 恢复连接（0-RTT）
ClientHello + key_share + early_data(应用数据)
→ 服务器立即处理 early_data
→ ServerHello + ...
→ 0 个 RTT 等待，数据立即到达
\`\`\`

**0-RTT 的风险**：重放攻击——攻击者截获 0-RTT 请求重放。因此 0-RTT 只应用于幂等请求（如 GET）。

## 十、证书体系深度解析

### 10.1 X.509 证书结构

\`\`\`
Certificate:
  Version: v3
  Serial Number: 04:12:ab:cd:...
  Signature Algorithm: sha256WithRSAEncryption
  Issuer: CN=Let's Encrypt R3, O=Let's Encrypt, C=US
  Validity:
    Not Before: Jan  1 00:00:00 2026 GMT
    Not After: Mar 31 23:59:59 2026 GMT
  Subject: CN=api.example.com
  Subject Public Key Info:
    Public Key Algorithm: rsaEncryption
    RSA Public Key: (2048 bit)
  Extensions:
    Subject Alternative Name (SAN):  ← 关键扩展
      DNS: api.example.com
      DNS: www.example.com
      DNS: example.com
    Key Usage: Digital Signature, Key Encipherment
    Extended Key Usage: TLS Web Server Authentication
    Authority Information Access (AIA):
      CA Issuers: URI:http://r3.i.lencr.org/
      OCSP: URI:http://r3.o.lencr.org
    Certificate Authority Information Access: ...
  Signature: [CA的签名]
\`\`\`

### 10.2 证书链验证

\`\`\`
根证书 (DigiCert Root CA)  ← 操作系统/浏览器内置，自签名
  └─ 中间证书 (Let's Encrypt R3)  ← 由根证书签名
       └─ 网站证书 (api.example.com)  ← 由中间证书签名

验证过程：
1. 网站发送：网站证书 + 中间证书
2. 浏览器用中间证书的公钥验证网站证书的签名
3. 浏览器用根证书的公钥验证中间证书的签名
4. 根证书是内置的，信任链完整
5. 检查域名匹配（SAN）、有效期、吊销状态
\`\`\`

**为什么需要中间证书**：
- 根证书离线保管，极度安全
- 中间证书可以撤销和更换
- 分层管理，降低根证书泄露风险

### 10.3 证书类型

| 类型 | 验证级别 | 颁发速度 | 浏览器显示 |
|------|----------|----------|------------|
| DV (Domain Validation) | 仅验证域名所有权 | 分钟级 | 锁图标 |
| OV (Organization Validation) | 验证组织信息 | 1-3 天 | 锁图标+公司名 |
| EV (Extended Validation) | 严格审查 | 1-2 周 | 旧版显示绿色地址栏 |

### 10.4 证书吊销

**CRL（证书吊销列表）**：CA 定期发布被吊销的证书列表，客户端下载检查（已过时）。

**OCSP（在线证书状态协议）**：客户端实时查询证书状态。

\`\`\`
客户端 → OCSP 服务器: "证书 04:12:ab:cd 是否有效?"
OCSP 服务器 → 客户端: "good" / "revoked" / "unknown"
\`\`\`

**OCSP Stapling**：服务器预先获取 OCSP 响应，随证书一起发送，避免客户端额外请求。

\`\`\`nginx
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /path/to/chain.pem;
resolver 8.8.8.8 valid=300s;
\`\`\`

## 十一、HTTPS 性能优化

### 11.1 HTTPS 性能开销

**握手开销**：
- TLS 1.2：2-RTT 握手 + 非对称加密计算
- TLS 1.3：1-RTT 握手 + 更快算法

**加密开销**：
- AES-GCM 硬件加速（AES-NI 指令集）→ 几乎无开销
- RSA 2048 签名/验证 → 计算密集

### 11.2 优化手段

**1. 启用会话恢复**：
\`\`\`nginx
ssl_session_cache shared:SSL:10m;    # 10MB缓存约4万个会话
ssl_session_timeout 1h;               # 会话缓存1小时
ssl_session_tickets on;               # 启用Session Ticket
\`\`\`

**2. OCSP Stapling**：减少客户端验证延迟。

**3. HTTP/2**：HTTPS 必配，多路复用弥补握手开销。

**4. 证书选择**：
- 用 ECDSA 证书（比 RSA 更快）
- 用 256 bit ECC 等效于 3072 bit RSA

**5. TLS 1.3**：1-RTT + 更快算法。

**Java 优化配置**：

\`\`\`java
SSLContext ctx = SSLContext.getInstance("TLSv1.3");
// 只启用安全套件
SSLParameters params = ctx.getDefaultSSLParameters();
params.setCipherSuites(new String[]{
    "TLS_AES_128_GCM_SHA256",
    "TLS_AES_256_GCM_SHA384",
    "TLS_CHACHA20_POLY1305_SHA256"
});
params.setProtocols(new String[]{"TLSv1.3", "TLSv1.2"});
\`\`\`

## 十二、HTTPS 攻击与防御

### 12.1 中间人攻击（MITM）

攻击者拦截客户端与服务器之间的通信，解密、修改、重发数据。

**防御**：HTTPS + 证书验证。浏览器验证证书链、域名、有效期、吊销状态。

### 12.2 降级攻击

攻击者迫使客户端使用不安全的旧版本 TLS。

**防御**：TLS_FALLBACK_SCSV 机制——服务器拒绝故意降级的连接。

### 12.3 SSL Strip

攻击者在客户端与服务器之间剥离 HTTPS，使客户端用 HTTP 明文通信。

**防御**：HSTS 头部——浏览器记住必须用 HTTPS，不接受 HTTP。

\`\`\`
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
\`\`\`

### 12.4 证书伪造

攻击者用伪造的 CA 签发假证书。

**防御**：
- Certificate Transparency (CT) — 证书必须记录到公开日志
- HPKP (HTTP Public Key Pinning) — 固定证书公钥（已弃用，有风险）
- CAA DNS 记录 — 指定允许的 CA

\`\`\`
example.com. CAA 0 issue "letsencrypt.org"
example.com. CAA 0 issuewild ";"
\`\`\`

## 十三、Let's Encrypt 与 ACME 协议

### 13.1 ACME 协议

ACME（Automatic Certificate Management Environment）自动化证书签发流程：

\`\`\`
1. 客户端生成账户密钥对
2. 客户端向 CA 注册账户
3. 客户端请求证书（指定域名）
4. CA 返回验证挑战（HTTP/DNS/TLS-ALPN）
5. 客户端完成挑战（证明域名所有权）
6. CA 验证挑战
7. 客户端生成 CSR（证书签名请求）+ 私钥签名
8. CA 签发证书
\`\`\`

### 13.2 Certbot 使用

\`\`\`bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 自动获取并配置证书
sudo certbot --nginx -d api.example.com -d www.example.com

# 自动续期（Let's Encrypt 证书90天过期）
sudo crontab -e
0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"

# 测试续期
sudo certbot renew --dry-run
\`\`\`

### 13.3 Java ACME 客户端

\`\`\`java
// 使用 acme4j 库
Session session = new Session("acme://letsencrypt.org");
Account account = new AccountBuilder()
    .agreeToTermsOfService()
    .useKeyPair(accountKeyPair)
    .create(session);

Order order = account.newOrder()
    .domain("api.example.com")
    .create();

// HTTP 验证
Authorization auth = order.getAuthorizations().get(0);
Http01Challenge challenge = auth.findChallenge(Http01Challenge.class);
// 部署 challenge.getToken() 到 http://api.example.com/.well-known/acme-challenge/xxx
challenge.trigger();

// 等待验证完成
while (auth.getStatus() != Status.VALID) {
    Thread.sleep(3000);
    auth.update();
}

// 生成 CSR 并获取证书
KeyPair domainKeyPair = generateRSAKeyPair();
CSRBuilder csr = new CSRBuilder();
csr.addDomain("api.example.com");
csr.sign(domainKeyPair);
order.execute(csr.generate());

Certificate cert = order.getCertificate();
cert.writeTo(new FileWriter("cert.pem"));
\`\`\`

> **HTTPS 心法**：HTTPS 不是"装上证书就完事"——要选对加密套件、启用会话恢复、配置 OCSP Stapling、开启 HSTS。证书管理要自动化（ACME + 监控告警 + 自动续期），90 天的有效期靠人工必然出错。


## 十四、密钥交换算法深入

### 14.1 Diffie-Hellman 密钥交换

DH 算法允许双方在不安全的通道上协商出共享密钥。

**数学原理**：

\`\`\`
公开参数：大素数 p，生成元 g
Alice 选择私钥 a，计算公钥 A = g^a mod p
Bob   选择私钥 b，计算公钥 B = g^b mod p
交换 A 和 B（公开传输）

共享密钥：
Alice 计算：S = B^a mod p = (g^b)^a mod p = g^(ab) mod p
Bob   计算：S = A^b mod p = (g^a)^b mod p = g^(ab) mod p

攻击者知道 p, g, A, B，但无法从 A=g^a mod p 反推出 a（离散对数难题）
\`\`\`

**Java DH 示例**：

\`\`\`java
KeyPairGenerator kpg = KeyPairGenerator.getInstance("DH");
kpg.initialize(2048);
KeyPair kp = kpg.generateKeyPair();

// Alice 发送公钥给 Bob，Bob 发送公钥给 Alice
// Alice 用 Bob 的公钥生成共享密钥
KeyAgreement ka = KeyAgreement.getInstance("DH");
ka.init(kp.getPrivate());
ka.doPhase(bobPublicKey, true);
byte[] sharedSecret = ka.generateSecret();
\`\`\`

### 14.2 ECDHE（椭圆曲线 DH）

ECDHE 使用椭圆曲线代替大素数，密钥更短、计算更快。

**曲线选择**：
- **P-256 (secp256r1)**：NIST 标准曲线，广泛兼容
- **X25519**：Daniel Bernstein 设计，现代首选，快且安全

\`\`\`
X25519 密钥交换：
  私钥：32 字节随机数
  公钥：32 字节（椭圆曲线点）
  共享密钥：32 字节

等效安全强度：
  X25519 (256 bit) ≈ RSA 3072 bit ≈ AES-128
\`\`\`

### 14.3 前向安全（Forward Secrecy）

**前向安全**：即使长期私钥泄露，过去的通信也无法解密。

**实现原理**：每次连接使用临时 ECDHE 密钥对，握手后立即销毁。即使服务器私钥后续泄露，攻击者也无法从截获的流量中恢复会话密钥。

\`\`\`
# 不具备前向安全（RSA 密钥交换）
客户端用服务器公钥加密 Pre-Master Secret 发送
→ 服务器私钥泄露后，所有历史流量可解密

# 具备前向安全（ECDHE 密钥交换）
每次握手生成临时 ECDHE 密钥对
→ 密钥对用完即弃
→ 私钥泄露不影响历史会话
\`\`\`

**TLS 1.3 强制前向安全**：移除了 RSA 密钥交换，只允许 ECDHE/DHE。

## 十五、HTTPS 部署最佳实践

### 15.1 Nginx 完整 HTTPS 配置

\`\`\`nginx
# HTTP 跳转 HTTPS
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$host$request_uri;
}

# HTTPS 主配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.example.com;

    # 证书
    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    # 协议（只启用 1.2 和 1.3）
    ssl_protocols TLSv1.2 TLSv1.3;

    # 加密套件（TLS 1.2）
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;

    # 会话恢复
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1h;
    ssl_session_tickets on;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/api.example.com/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # 其他安全头
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    # 证书文件监控
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

### 15.2 证书监控

\`\`\`bash
#!/bin/bash
# 检查证书过期时间
DOMAIN="api.example.com"
THRESHOLD=30  # 30天告警

EXPIRY=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null \
    | openssl x509 -noout -enddate 2>/dev/null \
    | cut -d= -f2)

EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
NOW_EPOCH=$(date +%s)
DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))

if [ $DAYS_LEFT -lt $THRESHOLD ]; then
    echo "WARNING: $DOMAIN certificate expires in $DAYS_LEFT days"
    # 发送告警
fi
\`\`\`

### 15.3 多语言 HTTPS 客户端配置

**Java**：

\`\`\`java
// 信任所有证书（仅开发用！）
TrustManager[] trustAll = { new X509TrustManager() {
    public void checkClientTrusted(X509Certificate[] c, String t) {}
    public void checkServerTrusted(X509Certificate[] c, String t) {}
    public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
}};

SSLContext ctx = SSLContext.getInstance("TLS");
ctx.init(null, trustAll, new SecureRandom());

// 生产环境：使用系统默认信任库
SSLContext ctx = SSLContext.getDefault();
\`\`\`

**Go**：

\`\`\`go
// 生产环境
client := &http.Client{
    Transport: &http.Transport{
        TLSClientConfig: &tls.Config{
            MinVersion: tls.VersionTLS12,
            MaxVersion: tls.VersionTLS13,
        },
    },
}

// 自定义 CA 证书
caCert, _ := os.ReadFile("ca.pem")
caCertPool := x509.NewCertPool()
caCertPool.AppendCertsFromPEM(caCert)
client = &http.Client{
    Transport: &http.Transport{
        TLSClientConfig: &tls.Config{
            RootCAs:    caCertPool,
            MinVersion: tls.VersionTLS12,
        },
    },
}
\`\`\`

**Python**：

\`\`\`python
import requests
import urllib3

# 生产环境（默认验证）
response = requests.get('https://api.example.com/data')

# 自定义 CA
response = requests.get('https://internal.example.com/',
    verify='/path/to/ca-bundle.pem')

# 双向 TLS（mTLS）
response = requests.get('https://api.example.com/',
    cert=('/path/to/client.crt', '/path/to/client.key'))
\`\`\`

### 15.4 双向 TLS（mTLS）

mTLS 要求客户端也提供证书，用于服务间认证。

\`\`\`nginx
server {
    listen 443 ssl;
    ssl_certificate server.crt;
    ssl_certificate_key server.key;

    # 要求客户端证书
    ssl_client_certificate ca.crt;
    ssl_verify_client on;
    ssl_verify_depth 2;

    location / {
        if ($ssl_client_verify != SUCCESS) {
            return 403;
        }
        proxy_pass http://backend;
    }
}
\`\`\`

**Go mTLS 服务端**：

\`\`\`go
func main() {
    caCert, _ := os.ReadFile("ca.pem")
    caPool := x509.NewCertPool()
    caPool.AppendCertsFromPEM(caCert)

    server := &http.Server{
        Addr: ":8443",
        TLSConfig: &tls.Config{
            ClientCAs:  caPool,
            ClientAuth: tls.RequireAndVerifyClientCert,  // 强制客户端证书
        },
    }
    http.HandleFunc("/", handler)
    server.ListenAndServeTLS("server.crt", "server.key")
}
\`\`\`

> **HTTPS 部署心法**：HTTPS 配置不是"能跑就行"。检查 SSL Labs 评级（目标 A+）、启用 TLS 1.3、关闭旧协议、配好 HSTS、OCSP Stapling。证书自动化+监控告警一个不能少。mTLS 是服务间零信任认证的利器。


## 十六、HTTPS 面试题与生产案例

### 16.1 高频面试题

**Q1: HTTPS 慢在哪？如何优化？**

握手阶段慢：2-RTT（TLS 1.2）+ 非对称加密计算。
优化：TLS 1.3（1-RTT）、会话恢复（0-RTT）、OCSP Stapling、HTTP/2 多路复用、ECDSA 证书。

**Q2: 为什么 HTTPS 不能完全防中间人攻击？**

如果客户端信任了恶意 CA（企业内网/流氓 CA），攻击者可签发假证书。还需配合 Certificate Transparency、CAA 记录、证书钉扎等加固。

**Q3: 对称加密和非对称加密的区别？HTTPS 为什么混用？**

对称快但密钥分发难，非对称慢但解决密钥分发。HTTPS 用非对称协商出对称密钥，之后用对称加密传输数据——兼得安全与性能。

**Q4: 证书过期了会怎样？**

浏览器显示"不安全"警告，用户无法访问（或需手动忽略）。API 客户端报 SSLHandshakeException。因此必须自动续期+监控告警。

**Q5: HTTPS 能被抓包吗？**

可以。Fiddler/Charles 原理是安装自签 CA 证书到系统信任库，中间人用自己的证书替换服务器证书。这也是为什么不要轻易安装来路不明的根证书。

### 16.2 生产案例

**案例一：证书链不完整导致 Android 无法访问**

服务器只发送了网站证书，没发中间证书。PC 浏览器能自动下载中间证书，但 Android 不能。

**解决**：Nginx 配置 \`fullchain.pem\`（含中间证书）而非只配 \`cert.pem\`。

**案例二：OCSP 查询超时导致页面加载慢**

客户端验证证书时查询 OCSP 服务器，网络不通导致 3 秒超时。

**解决**：启用 OCSP Stapling，服务器预取 OCSP 响应随证书发送。

**案例三：TLS 1.0 导致 SSL Labs 评级 B**

旧配置允许 TLS 1.0/1.1，被评为 B 级。

**解决**：\`ssl_protocols TLSv1.2 TLSv1.3;\`，评级升到 A+。

**案例四：HSTS 导致开发环境无法访问 HTTP**

生产环境配了 HSTS（max-age=31536000），浏览器记住后开发环境 HTTP 也被强制跳转 HTTPS。

**解决**：开发环境用独立域名；或用 \`max-age=0\` 覆盖清除浏览器记忆。

> **核心心法补充**：HTTPS 不是"一次性配置"，而是"持续运维"。证书续期、加密套件更新、安全评级监控、新协议（TLS 1.3/QUIC）跟进——安全是一个持续演进的过程。


## 十七、HTTPS 进阶知识补充

### 17.1 证书透明度（Certificate Transparency）

CT 要求 CA 将签发的证书记录到公开的、可验证的日志中，防止 CA 私自签发证书而不被发现。

\`\`\`
CA 签发证书 → 提交到 CT Log → 获得 SCT (Signed Certificate Timestamp)
→ SCT 嵌入证书或通过 OCSP/TLS 扩展提供
→ 浏览器验证 SCT，无 SCT 的 EV 证书会被警告
\`\`\`

**查询 CT 日志**：

\`\`\`bash
# 查询某域名所有已签发的证书
curl "https://crt.sh/?q=example.com&output=json" | jq '.[] | .issuer_name'
\`\`\`

### 17.2 证书钉扎（Certificate Pinning）

固定服务器证书的公钥哈希，即使 CA 被攻破也无法伪造。

\`\`\`
# SPKI 哈希计算
echo | openssl s_client -connect api.example.com:443 2>/dev/null \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | base64
# 输出: pin-sha256:abc123...
\`\`\`

**Android 证书钉扎**：

\`\`\`java
OkHttpClient client = new OkHttpClient.Builder()
    .certificatePinner(new CertificatePinner.Builder()
        .add("api.example.com", "sha256/abc123...")
        .add("api.example.com", "sha256/backup456...")  // 备用 pin
        .build())
    .build();
\`\`\`

**注意**：HPKP（HTTP 公钥钉扎头部）已被废弃，因为证书更换时如果备份 pin 也失效，会导致网站永久不可访问。

### 17.3 多域名证书（SAN）

现代证书用 SAN（Subject Alternative Name）扩展支持多域名，不再用 CN（Common Name）。

\`\`\`
Subject: CN=example.com  (历史遗留，现代浏览器不看)

Subject Alternative Name:
  DNS: example.com
  DNS: api.example.com
  DNS: www.example.com
  DNS: *.example.com      (通配符)
\`\`\`

**通配符证书**：\`*.example.com\` 匹配 \`api.example.com\` 但不匹配 \`api.v2.example.com\`（只匹配一级子域）。

> **HTTPS 总结**：HTTPS 安全是一个体系——加密算法、TLS 握手、证书链、CA 信任、CT 日志、OCSP、HSTS、CSP，每一环都不可少。理解全链路，才能在安全审计和故障排查中游刃有余。


> **核心心法**：HTTPS 是现代 Web 安全的基石。理解加密三件套（对称/非对称/哈希）、TLS 握手、证书链，能让你正确部署 HTTPS、排查证书问题、做安全加固。证书管理要自动化（Let's Encrypt + 监控告警），别让人工成为单点。

下面的可运行代码用 crypto 模块演示：RSA 密钥对生成、公钥加密私钥解密、私钥签名公钥验签、AES 对称加密解密、HMAC 消息认证码、SHA256 哈希，并模拟 TLS 握手中的密钥交换和签名验证流程。`,
    code: `// HTTPS/TLS 加密原理演示 - 用 crypto 模块
// 演示：对称加密、非对称加密、哈希、HMAC、数字签名、模拟 TLS 握手
const crypto = require("crypto");

console.log("===== 1. 哈希函数（SHA256）=====");
// 哈希：任意长度 → 固定长度摘要，不可逆
const msg = "Hello, HTTPS!";
const hash = crypto.createHash("sha256").update(msg).digest("hex");
console.log("原文 :", msg);
console.log("SHA256:", hash);
console.log("长度  :", hash.length, "hex 字符 =", hash.length * 4, "bit");
// 同输入同输出（确定性）
const hash2 = crypto.createHash("sha256").update(msg).digest("hex");
console.log("再次哈希:", hash2, hash === hash2 ? "(一致)" : "(不一致!)");

console.log("\\n===== 2. HMAC（带密钥的哈希）=====");
// HMAC：用密钥保证消息来源可信 + 完整性
const hmacKey = "my-secret-key";
const hmac = crypto.createHmac("sha256", hmacKey).update(msg).digest("hex");
console.log("HMAC :", hmac);
// 接收方用同样密钥重新计算，比对验证
const hmacVerify = crypto.createHmac("sha256", hmacKey).update(msg).digest("hex");
console.log("验签 :", hmac === hmacVerify ? "通过（消息未被篡改）" : "失败");

console.log("\\n===== 3. AES 对称加密（加解密同一密钥）=====");
const aesKey = crypto.randomBytes(32); // AES-256 密钥
const iv = crypto.randomBytes(16);     // 初始化向量（每次不同，保证安全）
const plain = "这是一段敏感数据，需要加密传输";
// 加密
const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
let enc = cipher.update(plain, "utf8", "hex");
enc += cipher.final("hex");
console.log("明文 :", plain);
console.log("密文 :", enc);
// 解密
const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, iv);
let dec = decipher.update(enc, "hex", "utf8");
dec += decipher.final("utf8");
console.log("解密 :", dec, dec === plain ? "(一致)" : "(不一致!)");

console.log("\\n===== 4. RSA 非对称加密（公钥加密、私钥解密）=====");
// 生成 RSA 密钥对
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const secret = "会话密钥：对称加密用的临时密钥";
// 公钥加密
const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(secret, "utf8"));
console.log("原文 :", secret);
console.log("公钥加密:", encrypted.toString("base64").slice(0, 40) + "...");
// 私钥解密
const decrypted = crypto.privateDecrypt(privateKey, encrypted);
console.log("私钥解密:", decrypted.toString("utf8"));

console.log("\\n===== 5. 数字签名（私钥签名、公钥验签）=====");
const doc = "这份合同金额 100 万元，双方确认";
// 私钥签名（先哈希再加密，效率高）
const sign = crypto.sign("sha256", Buffer.from(doc, "utf8"), privateKey);
console.log("文档 :", doc);
console.log("签名 :", sign.toString("base64").slice(0, 40) + "...");
// 公钥验签
const valid = crypto.verify("sha256", Buffer.from(doc, "utf8"), publicKey, sign);
console.log("验签 :", valid ? "通过（确属私钥持有者所签，且未篡改）" : "失败");
// 篡改后验签
const tampered = doc.replace("100", "999");
const invalid = crypto.verify("sha256", Buffer.from(tampered, "utf8"), publicKey, sign);
console.log("篡改后验签:", invalid ? "通过" : "失败（检测到篡改）");

console.log("\\n===== 6. 模拟 TLS 握手中的密钥交换 + 签名验证 =====");
// 场景：客户端验证服务端身份，并安全交换对称密钥
// 服务端：生成临时密钥对 + 用长期私钥签名
const serverLongTerm = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const ecdhe = crypto.randomBytes(32); // 模拟 ECDHE 临时密钥（实际是椭圆曲线运算）
const serverRandom = crypto.randomBytes(32);
const signature = crypto.sign("sha256", Buffer.concat([ecdhe, serverRandom]), serverLongTerm.privateKey);

// 客户端：用服务端公钥（来自证书）验签，确认密钥交换参数来自真正的服务端
const sigOk = crypto.verify("sha256", Buffer.concat([ecdhe, serverRandom]), serverLongTerm.publicKey, signature);
console.log("步骤1: 客户端验证服务端签名:", sigOk ? "通过（服务端身份可信）" : "失败");

// 客户端生成会话密钥，用服务端公钥加密发送（模拟 RSA 密钥交换）
const sessionKey = crypto.randomBytes(32); // 对称会话密钥
const encSession = crypto.publicEncrypt(serverLongTerm.publicKey, sessionKey);
console.log("步骤2: 客户端用服务端公钥加密会话密钥，发送");

// 服务端用私钥解密，得到会话密钥
const decSession = crypto.privateDecrypt(serverLongTerm.privateKey, encSession);
console.log("步骤3: 服务端私钥解密得到会话密钥:", decSession.equals(sessionKey) ? "成功" : "失败");

// 双方现在共享对称密钥 sessionKey，后续通信用它加密
const tlsCipher = crypto.createCipheriv("aes-256-cbc", sessionKey, iv);
let tlsEnc = tlsCipher.update("GET /api/secret HTTP/1.1", "utf8", "hex");
tlsEnc += tlsCipher.final("hex");
console.log("步骤4: 双方用共享会话密钥加密 HTTP 通信");
console.log("       加密后的应用数据:", tlsEnc.slice(0, 40) + "...");

console.log("\\n===== 演示结束 =====");
console.log("TLS 的本质：非对称加密验证身份+交换密钥，对称加密传输数据");`,
  },

  // ============================================================
  // 第 4 章：TCP/IP 与网络基础
  // ============================================================
  {
    id: "backend-tcp",
    group: "基础与网络",
    icon: "🔌",
    title: "TCP/IP 与网络基础",
    content: `# TCP/IP 与网络基础

后端服务之间的通信几乎都建立在 TCP/IP 协议族之上。理解网络分层模型、TCP 的连接管理、可靠传输机制，是排查"连接超时""丢包""粘包"等问题的前提。本章系统讲解网络分层、TCP 三次握手与四次挥手、流量与拥塞控制、粘包问题。

后端工程师每天都在和 TCP 打交道：HTTP 基于 TCP，数据库连接是 TCP，Redis 连接是 TCP，RPC 调用也多为 TCP。理解 TCP 的状态机、握手挥手、流控拥塞，能让你解释"为什么有大量 TIME_WAIT""为什么连接建立慢""为什么数据粘在一起"。

---

## OSI 七层模型与 TCP/IP 四层模型

网络协议是分层的，每层解决一类问题，下层为上层提供服务。理解分层模型是理解网络的基础。

### OSI 七层模型（理论模型）

| 层 | 名称 | 职责 | 典型协议 | PDU（数据单元）|
|----|------|------|---------|------|
| 7 | 应用层 | 为应用提供网络服务 | HTTP, FTP, DNS, SMTP | 数据 Data |
| 6 | 表示层 | 数据格式转换、加密 | SSL/TLS, JPEG | 数据 Data |
| 5 | 会话层 | 建立/管理会话 | RPC, SOCKS | 数据 Data |
| 4 | 传输层 | 端到端可靠传输 | TCP, UDP | 段 Segment |
| 3 | 网络层 | 路由与寻址 | IP, ICMP | 包 Packet |
| 2 | 数据链路层 | 相邻节点传输 | 以太网, ARP | 帧 Frame |
| 1 | 物理层 | 比特传输 | 电信号, 光纤 | 比特 Bit |

OSI 是理论模型，实际中会话层和表示层很少独立实现（合并到应用层）。

### TCP/IP 四层模型（实际使用）

OSI 是理论模型，实际工程用的是 TCP/IP 四层模型（有时把链路和物理合并后称五层）：

| TCP/IP 层 | 对应 OSI | 职责 | 协议 |
|-----------|---------|------|------|
| 应用层 | 5/6/7 | 应用逻辑 | HTTP/DNS/SMTP |
| 传输层 | 4 | 端到端通信 | TCP/UDP |
| 网络层 | 3 | 跨网络寻址 | IP/ICMP |
| 网络接口层 | 1/2 | 物理传输 | 以太网/WiFi |

### 五层模型（教学常用）

教学常把网络接口层拆成数据链路层和物理层，形成五层：

| 层 | 职责 | 关键问题 |
|----|------|---------|
| 应用层 | 应用协议 | HTTP 请求/响应语义 |
| 传输层 | 端到端 | 可靠性、流量控制、端口 |
| 网络层 | 跨网路由 | 寻址、路由、IP |
| 数据链路层 | 相邻节点 | 帧传输、MAC 地址、ARP |
| 物理层 | 比特传输 | 信号编码、传输介质 |

### 数据封装与解封装过程

发送数据时，每层都会加上自己的头部（封装）；接收时逐层剥离（解封装）：

\`\`\`
发送方（封装）：
应用数据
  → [TCP头 | 应用数据]            (传输层加 TCP 头，成"段")
  → [IP头 | TCP头 | 应用数据]      (网络层加 IP 头，成"包")
  → [帧头 | IP头 | TCP头 | 数据 | 帧尾] (链路层加帧头帧尾，成"帧")
  → 比特流                         (物理层转电信号)

接收方（解封装）：逆过程，逐层剥离头部，最终交付应用层。
\`\`\`

每层的头部对该层有用：TCP 头含端口和序号，IP 头含源/目的 IP，帧头含 MAC 地址。这种分层封装让各层独立演进——HTTP 不用关心底层是 WiFi 还是有线。

---

## TCP 三次握手（建立连接）

TCP 是面向连接的可靠传输协议。通信前必须通过三次握手建立连接，确认双方的收发能力正常。

### 握手流程

\`\`\`
客户端                                服务端
CLOSED                               LISTEN
  |                                     |
  | ---- SYN, seq=x ---->              |  (第1次：客户端发起)
SYN_SENT                              SYN_RCVD
  |                                     |
  | <---- SYN, seq=y, ack=x+1 ----     |  (第2次：服务端确认并发起)
  |                                     |
ESTABLISHED                           ESTABLISHED
  | ---- ACK, ack=y+1 ---->            |  (第3次：客户端确认)
  |                                     |
  ==== 可以开始传数据 ====              |
\`\`\`

1. **第一次握手**：客户端发送 SYN（seq=x），进入 \`SYN_SENT\`。表示"我想建立连接"，x 是客户端初始序列号。
2. **第二次握手**：服务端收到 SYN，回 SYN+ACK（seq=y, ack=x+1），进入 \`SYN_RCVD\`。表示"同意，我也想建立连接"，y 是服务端初始序列号，ack=x+1 确认收到了 x。
3. **第三次握手**：客户端收到 SYN+ACK，回 ACK（ack=y+1），进入 \`ESTABLISHED\`。服务端收到后也进入 \`ESTABLISHED\`。连接建立完成。

> 注：第三次握手的 ACK 报文**可以携带数据**（TCP Fast Open），但通常不携带。

### 为什么是三次而不是两次？

这是面试高频题，核心是**确认双方的收发能力都正常**：

- 两次握手只能确认"客户端→服务端"方向 OK（服务端收到 SYN，知道客户端能发），无法确认"服务端→客户端"方向（服务端不知道客户端能否收到自己的数据）。
- 三次握手让服务端知道：客户端收到了我的 SYN+ACK（因为收到了第三次 ACK），即客户端能收到我的数据。这样双向都验证了。
- 同时防止**历史失效的 SYN 突然到达**：网络延迟导致旧 SYN 后到，两次握手会建一个无效连接浪费资源；三次握手中客户端收到意外的 SYN+ACK 会发 RST 拒绝。

简单说：三次握手 = 双向确认收发能力 + 防止历史连接。

### 为什么不是四次？

因为第二次握手时，服务端把 SYN 和 ACK 合并发送了（SYN+ACK），而不是分两次发。所以三次够了，不需要四次。

### SYN Flood 攻击与防御

攻击者伪造大量源 IP，发 SYN 但不回第三次 ACK，服务端为每个半连接分配资源并等待，最终耗尽连接队列，正常用户无法连接。

**防御**：
- **SYN Cookies**：服务端不分配资源，把半连接信息编码进 seq 返回，客户端回 ACK 时再验证重建。
- 增大半连接队列。
- 限制单 IP 连接速率。
- 防火墙过滤异常 SYN。

### 状态说明

- \`CLOSED\`：初始/终止状态，无连接。
- \`LISTEN\`：服务端等待连接。
- \`SYN_SENT\`：已发 SYN，等对方确认。
- \`SYN_RCVD\`：收到 SYN，已回 SYN+ACK，等对方 ACK。
- \`ESTABLISHED\`：连接建立，可传数据。

---

## TCP 四次挥手（关闭连接）

TCP 是**全双工**的，双方都能独立发送和接收。关闭连接时，每个方向都要单独关闭，因此需要四次挥手。

### 挥手流程

\`\`\`
客户端                                服务端
ESTABLISHED                           ESTABLISHED
  | ---- FIN, seq=u ---->             |  (第1次：客户端要关)
FIN_WAIT_1                            |
  | <---- ACK, ack=u+1 ----          |  (第2次：服务端确认)
FIN_WAIT_2                            CLOSE_WAIT
  |                                     |
  |      （服务端可能还有数据要发）      |
  | <---- FIN, seq=v ----             |  (第3次：服务端也要关)
  |                                     LAST_ACK
  | ---- ACK, ack=v+1 ---->           |  (第4次：客户端确认)
TIME_WAIT                              |
  | (等待 2MSL)                         |
CLOSED                                CLOSED
\`\`\`

1. **第一次挥手**：主动方发 FIN，进入 \`FIN_WAIT_1\`。表示"我没有数据要发了"。
2. **第二次挥手**：被动方收到 FIN，回 ACK，进入 \`CLOSE_WAIT\`。此时被动方还能继续发送未发完的数据（**半关闭**状态）。
3. **第三次挥手**：被动方数据发完，发 FIN，进入 \`LAST_ACK\`。表示"我也没数据要发了"。
4. **第四次挥手**：主动方回 ACK，进入 \`TIME_WAIT\`，等待 2MSL 后 \`CLOSED\`。被动方收到 ACK 后 \`CLOSED\`。

### 为什么挥手要四次，握手只要三次？

因为握手时服务端的 SYN 和 ACK 可以合并（都表示"同意连接"）。而挥手时，被动方收到 FIN 后，可能还有数据没发完，所以先回 ACK（第二次），等数据发完再发 FIN（第三次），不能合并。如果被动方没数据要发，ACK 和 FIN 也能合并成三次（延迟 ACK 机制）。

### 为什么要有 TIME_WAIT？为什么是 2MSL？

主动关闭方要等 2MSL（Maximum Segment Lifetime，最大报文段寿命，通常 2 分钟，Linux 默认 60s）才真正关闭，原因有二：

1. **保证最后的 ACK 到达**：如果最后的 ACK 丢失，被动方会重发 FIN，主动方在 TIME_WAIT 还能再回 ACK。若直接关闭，被动方会一直重发 FIN 无法关闭。
2. **让旧连接的报文消失**：防止本次连接的延迟报文（相同四元组）影响新连接。2MSL 足够让网络中的旧报文过期。

2MSL 而非 1MSL 的原因：MSL 是单程最大生存时间，ACK 去程 1 MSL + 可能的重传 FIN 来程 1 MSL = 2 MSL。

### 大量 TIME_WAIT 的问题

服务器**主动关闭**大量短连接时，会堆积大量 TIME_WAIT，每个 TIME_WAIT 占用一个本地端口，耗尽后无法新建连接。

**解决**：
- 用长连接（HTTP Keep-Alive、数据库连接池）。
- 调整 \`tcp_tw_reuse\`（复用 TIME_WAIT 连接，作为客户端可用）。
- 让客户端主动关闭（服务端被动关闭不产生 TIME_WAIT）。
- 增大端口范围 \`net.ipv4.ip_local_port_range\`。

### 大量 CLOSE_WAIT 的问题

CLOSE_WAIT 是**被动方**收到 FIN 后、自己还没发 FIN 的状态。大量 CLOSE_WAIT 说明**应用代码 bug**——连接用完没调用 close()。

\`\`\`bash
# 查看各状态连接数
netstat -n | awk '/^tcp/ {++S[$NF]} END {for(a in S) print a, S[a]}'
\`\`\`

**解决**：排查应用代码，确保连接、文件描述符在使用后正确关闭（try-with-resources、defer、finally）。

---

## TCP 状态机完整流转

TCP 有 11 个状态，理解完整流转对排查连接问题至关重要。

\`\`\`
                    被动打开
                       │
                       ▼
                   LISTEN ◄──── 应用 close
                       │
      收到 SYN         │          发 SYN/ACK
                       ▼
                  SYN_RCVD ──────┐
                       │          │ 收到 ACK
                       ▼          ▼
主动打开    ESTABLISHED ◄────────┘
   │
   │ 应用 close / 收到 FIN
   ▼
FIN_WAIT_1          CLOSE_WAIT
   │ 收到 ACK          │ 应用 close
   ▼                   ▼
FIN_WAIT_2 ──收到FIN──> LAST_ACK
   │ 发 ACK             │ 收到 ACK
   ▼                    ▼
TIME_WAIT           CLOSED
   │ 2MSL
   ▼
CLOSED
\`\`\`

### 关键状态与排查

| 状态 | 含义 | 堆积原因 | 排查 |
|------|------|---------|------|
| SYN_SENT | 已发 SYN 等响应 | 服务端不可达/防火墙 | 检查端口、防火墙 |
| SYN_RCVD | 收 SYN 等第三次 ACK | SYN Flood 攻击 | 开 SYN Cookies |
| ESTABLISHED | 连接建立 | 正常/连接泄露 | 看应用是否回收 |
| CLOSE_WAIT | 等应用 close | 应用 bug 没关连接 | 排查代码 fd 泄露 |
| TIME_WAIT | 等 2MSL | 主动关闭过多短连接 | 用长连接、调内核参数 |
| LAST_ACK | 等最后 ACK | ACK 丢失 | 网络质量 |

---

## TCP vs UDP

| 特性 | TCP | UDP |
|------|-----|-----|
| 连接 | 面向连接（握手） | 无连接 |
| 可靠性 | 可靠（确认、重传） | 不可靠 |
| 顺序 | 有序 | 无序 |
| 速度 | 较慢 | 快 |
| 头部开销 | 20 字节 | 8 字节 |
| 流控/拥塞控制 | 有 | 无 |
| 传输 | 字节流 | 数据报 |
| 适用场景 | 文件、网页、API | 直播、DNS、游戏 |

**TCP** 适合要求数据完整的场景：HTTP、文件传输、数据库连接、邮件。
**UDP** 适合要求实时、能容忍丢包的场景：视频直播、在线游戏、DNS 查询、VoIP。

### 何时选 TCP，何时选 UDP

- **要可靠、有序**：选 TCP。如支付、订单、文件传输。
- **要实时、容忍丢包**：选 UDP。如直播（丢几帧无所谓，延迟大不可接受）、游戏（位置同步丢包用最新值）。
- **要简单、低开销**：选 UDP。如 DNS 查询（一问一答，建连接不划算）。
- **要双向实时**：选 UDP 或 WebSocket（基于 TCP）。

很多现代协议在 UDP 上自建可靠性，例如 **QUIC**（HTTP/3 的底层）在 UDP 上实现了类似 TCP 的可靠传输 + TLS，同时避免了 TCP 的队头阻塞。

---

## 流量控制与拥塞控制

这是 TCP 可靠传输的两大核心机制，常被混淆。**流量控制是接收方控制的，拥塞控制是发送方感知网络控制的**。

### 流量控制（滑动窗口）

流量控制是**接收方**控制发送方速率，防止发送过快淹没接收方。接收方在 ACK 中携带 \`窗口大小（Window）\`，告诉发送方"我还能接收多少字节"。

发送方维护一个**滑动窗口**：窗口内的数据可以连续发送而不必等确认，收到 ACK 后窗口向前滑动。窗口为 0 时暂停发送（接收方处理不过来，叫"零窗口"），发送方定期发窗口探测询问。

### 拥塞控制

拥塞控制是**发送方**感知网络拥塞程度，控制发送速率，防止网络瘫痪。四个阶段：

1. **慢启动（Slow Start）**：连接初建时，拥塞窗口（cwnd）从 1 开始，每收到一个 ACK 翻倍，指数增长。
2. **拥塞避免（Congestion Avoidance）**：cwnd 达到阈值（ssthresh）后，改为线性增长（每 RTT 加 1）。
3. **快重传（Fast Retransmit）**：连续收到 3 个重复 ACK，立即重传丢失报文，不等超时。
4. **快恢复（Fast Recovery）**：快重传后不回到慢启动，而是把 cwnd 减半，继续线性增长。

\`\`\`
cwnd
 ↑
 |        /  ← 慢启动（指数增长）
 |       /
 |      /──── ← 拥塞避免（线性增长）
 |     /
 |    × ← 丢包，cwnd 减半
 |   /──── ← 快恢复后线性增长
 |  /
 └──────────→ 时间
\`\`\`

### 流控 vs 拥塞控制

| 维度 | 流量控制 | 拥塞控制 |
|------|---------|---------|
| 控制方 | 接收方 | 发送方 |
| 目的 | 不淹没接收方 | 不压垮网络 |
| 机制 | 滑动窗口（Window） | cwnd + ssthresh |
| 反馈 | ACK 带窗口大小 | 丢包/延迟推断 |

---

## 端口与套接字

- **端口（Port）**：传输层用来区分同一主机上的不同应用，16 位（0-65535）。
  - 0-1023：知名端口（HTTP 80, HTTPS 443, SSH 22, MySQL 3306, Redis 6379）。
  - 1024-49151：注册端口。
  - 49152-65535：动态/临时端口。
- **套接字（Socket）**：IP + 端口标识一个通信端点。一条 TCP 连接由四元组唯一确定：\`(源IP, 源端口, 目的IP, 目的端口)\`。

\`\`\`python
# Python：TCP 服务端（伪代码示意）
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(("0.0.0.0", 8080))  # 绑定 IP + 端口
s.listen(128)               # 开始监听，等待队列 128
conn, addr = s.accept()     # 三次握手在此完成
data = conn.recv(1024)      # 接收数据
conn.send(b"response")      # 发送数据
conn.close()                # 四次挥手
\`\`\`

\`\`\`go
// Go：TCP 服务端（伪代码示意）
ln, _ := net.Listen("tcp", ":8080")   // 监听
conn, _ := ln.Accept()                 // 接收连接（三次握手完成）
buf := make([]byte, 1024)
n, _ := conn.Read(buf)                 // 读数据
conn.Write([]byte("response"))         // 写数据
conn.Close()                           // 关闭（四次挥手）
\`\`\`

---

## 粘包与拆包

TCP 是**字节流**协议，没有消息边界的概念。应用层发 \`ABC\` 和 \`DEF\` 两次，TCP 可能合并成 \`ABCDEF\` 一次发（粘包），也可能拆成 \`AB\` 和 \`CDEF\` 两次（拆包）。

### 粘包原因
- 发送方：Nagle 算法把多个小包合并成大包提高效率。
- 接收方：应用层没及时读取，多个包滞留缓冲区。

### 解决方案（在应用层定义消息边界）

1. **固定长度**：每条消息固定 N 字节，不足补齐。简单但浪费。
2. **特殊分隔符**：消息间用 \\n 等分隔。适合文本协议（如 HTTP 头用 \\r\\n）。
3. **长度前缀（最常用）**：消息头里写明 body 长度，接收方按长度读取。

\`\`\`go
// Go：长度前缀协议（自定义消息格式）
// 消息格式: [4字节长度][body]
func WriteMsg(conn net.Conn, data []byte) error {
    header := make([]byte, 4)
    binary.BigEndian.PutUint32(header, uint32(len(data)))
    conn.Write(header)
    conn.Write(data)
    return nil
}
func ReadMsg(conn net.Conn) ([]byte, error) {
    header := make([]byte, 4)
    io.ReadFull(conn, header)            // 先读 4 字节长度
    length := binary.BigEndian.Uint32(header)
    body := make([]byte, length)
    io.ReadFull(conn, body)              // 再按长度读 body
    return body, nil
}
\`\`\`

\`\`\`java
// Java：长度前缀协议
public void writeMsg(OutputStream out, byte[] data) throws IOException {
    out.write(intToBytes(data.length));  // 4 字节长度
    out.write(data);                     // body
}
\`\`\`

> **关键认知**：粘包不是 TCP 的 bug，而是 TCP 流式特性的必然结果。**边界划分是应用层的责任**，所有基于 TCP 的应用协议（HTTP、Redis、MySQL）都有自己的消息边界规则。

---

## 常见网络问题排查

1. **连接超时**：可能是防火墙、端口未开放、服务未启动。用 telnet/nc 测试端口连通性。
2. **大量 CLOSE_WAIT**：被动方没及时 close，通常是应用 bug（连接用完没关闭）。
3. **大量 TIME_WAIT**：服务端主动关闭过多短连接，考虑长连接或调内核参数。
4. **重传率高**：网络质量差或服务端处理慢，用 \`ss\`/\`netstat\` 查看重传统计。

\`\`\`bash
# 常用网络排查命令
netstat -anp | grep TIME_WAIT    # 查看 TIME_WAIT
ss -s                             # 连接统计
tcpdump -i eth0 port 80           # 抓包
ping example.com                  # 测连通性
traceroute example.com            # 路由追踪
\`\`\`

---

## 常见坑与实战要点

1. **TIME_WAIT 堆积**：服务端主动关短连接导致，用长连接或 \`tcp_tw_reuse\`。
2. **CLOSE_WAIT 堆积**：应用没关连接，排查 fd 泄露。
3. **连接池配置不当**：连接池太小导致排队，太大导致 DB 连接耗尽。按 QPS 和单请求耗时估算。
4. **忽视 keep-alive**：每次请求重新握手，延迟翻倍。
5. **粘包未处理**：自定义 TCP 协议不加长度前缀，导致解析错乱。

---

## 面试题精选

**Q1：三次握手为什么不是两次？**
答：三次握手双向确认收发能力，并防止历史失效 SYN 建立无效连接。两次握手无法确认服务端→客户端方向通信正常。

**Q2：四次挥手为什么要有 TIME_WAIT？**
答：保证最后的 ACK 到达（丢失可重传）+ 让旧连接报文消失（防止影响新连接）。等 2MSL 是因为 ACK 去程 + 可能重传 FIN 来程各 1 MSL。

**Q3：TCP 粘包怎么解决？**
答：TCP 是字节流无边界，粘包是正常现象。在应用层定义边界：固定长度、分隔符、长度前缀（最常用）。

**Q4：流量控制和拥塞控制的区别？**
答：流控是接收方控制发送方（滑动窗口，防淹没接收方）；拥塞控制是发送方感知网络（cwnd，防压垮网络）。

**Q5：TCP 和 UDP 怎么选？**
答：要可靠有序选 TCP（支付、文件），要实时容忍丢包选 UDP（直播、游戏）。现代协议如 QUIC 在 UDP 上自建可靠性。

---

## 生产案例

**案例一：CLOSE_WAIT 堆积导致服务不可用**
某服务 HTTP 客户端没正确关闭响应体，连接堆积在 CLOSE_WAIT，最终耗尽 fd，新连接失败。
**解决**：确保所有连接用 try-with-resources/finally 关闭；连接池统一管理。

**案例二：TIME_WAIT 耗尽端口**
网关主动关闭大量短连接，TIME_WAIT 堆积耗尽端口，无法调用下游。
**解决**：改长连接（Keep-Alive）；开启 \`tcp_tw_reuse\`；让下游主动关。

## 六、OSI 七层模型与 TCP/IP 模型详解

### 6.1 两种模型对比

| OSI 七层 | TCP/IP 四层 | 示例协议 | 数据单元 |
|----------|-------------|----------|----------|
| 应用层 | 应用层 | HTTP, DNS, SMTP, FTP | 数据(Data) |
| 表示层 | 应用层 | SSL/TLS, JPEG, ASCII | 数据(Data) |
| 会话层 | 应用层 | NetBIOS, RPC | 数据(Data) |
| 传输层 | 传输层 | TCP, UDP | 段(Segment)/数据报(Datagram) |
| 网络层 | 网络层 | IP, ICMP, OSPF | 包(Packet) |
| 数据链路层 | 网络接口层 | Ethernet, PPP, ARP | 帧(Frame) |
| 物理层 | 网络接口层 | 电信号, 光信号 | 比特(Bit) |

### 6.2 数据封装过程

\`\`\`
应用层:    HTTP请求 "GET / HTTP/1.1"
             ↓ 加上TCP头
传输层:    [TCP头][HTTP数据]  → 段(Segment)
             ↓ 加上IP头
网络层:    [IP头][TCP头][HTTP数据]  → 包(Packet)
             ↓ 加上帧头帧尾
链路层:    [以太网头][IP头][TCP头][HTTP数据][FCS]  → 帧(Frame)
             ↓ 转为电信号
物理层:    01010101010...  → 比特(Bit)
\`\`\`

**Java 分层示例**：

\`\`\`java
// 应用层 - HTTP
HttpClient client = HttpClient.newHttpClient();
HttpResponse<String> resp = client.send(
    HttpRequest.newBuilder().uri(URI.create("https://api.example.com")).GET().build(),
    HttpResponse.BodyHandlers.ofString()
);

// 传输层 - Socket（TCP）
Socket socket = new Socket("api.example.com", 443);
OutputStream out = socket.getOutputStream();
out.write("GET / HTTP/1.1\r\nHost: api.example.com\r\n\r\n".getBytes());

// 网络层 - InetAddress（IP）
InetAddress[] addrs = InetAddress.getAllByName("api.example.com");
for (InetAddress addr : addrs) {
    System.out.println(addr);  // /93.184.216.34 或 /2606:2800:220:1:...
}
\`\`\`

**Go 分层示例**：

\`\`\`go
// 应用层
resp, _ := http.Get("https://api.example.com")

// 传输层 - TCP
conn, _ := net.Dial("tcp", "api.example.com:443")
conn.Write([]byte("GET / HTTP/1.1\r\nHost: api.example.com\r\n\r\n"))

// 网络层 - IP
addrs, _ := net.LookupIP("api.example.com")
for _, ip := range addrs {
    fmt.Println(ip)
}
\`\`\`

## 七、TCP 首部字段逐位解析

### 7.1 TCP 首部结构

\`\`\`
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |  ← 端口
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Sequence Number                        |  ← 序列号
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Acknowledgment Number                      |  ← 确认号
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Data |           |U|A|P|R|S|F|                               |
| Offset| Reserved  |R|C|S|S|Y|I|            Window             |  ← 窗口大小
|       |           |G|K|H|T|N|N|                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Checksum            |         Urgent Pointer        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Options (if any)                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
\`\`\`

### 7.2 关键字段说明

| 字段 | 位数 | 说明 |
|------|------|------|
| 源端口 | 16 bit | 发送方端口 |
| 目的端口 | 16 bit | 接收方端口 |
| 序列号(Seq) | 32 bit | 数据字节流的编号 |
| 确认号(Ack) | 32 bit | 期望收到的下一个序列号 |
| 数据偏移 | 4 bit | 首部长度（以4字节为单位） |
| 标志位 | 6 bit | URG/ACK/PSH/RST/SYN/FIN |
| 窗口大小 | 16 bit | 接收窗口（流量控制） |
| 校验和 | 16 bit | 首部+数据的校验 |
| 紧急指针 | 16 bit | URG=1时有效 |

### 7.3 标志位详解

| 标志 | 全称 | 含义 |
|------|------|------|
| URG | Urgent | 紧急数据（紧急指针有效） |
| ACK | Acknowledge | 确认号有效（除初始SYN外都为1） |
| PSH | Push | 接收方应立即将数据交给应用 |
| RST | Reset | 重置连接（异常终止） |
| SYN | Synchronize | 同步序列号（建立连接） |
| FIN | Finish | 发送完毕（关闭连接） |

## 八、三次握手深度剖析

### 8.1 握手流程

\`\`\`
客户端 (CLOSED)                          服务端 (LISTEN)
  |                                        |
  | --- SYN, seq=x ---------------------→ |  服务端 → SYN_RCVD
  |     (客户端 → SYN_SENT)                |
  |                                        |
  | ←-- SYN+ACK, seq=y, ack=x+1 --------- |  
  |                                        |
  | --- ACK, ack=y+1 -------------------→ |  服务端 → ESTABLISHED
  |     (客户端 → ESTABLISHED)             |
  |                                        |
  | ←→ 双向数据传输 ←→                      |
\`\`\`

### 8.2 为什么是三次而非两次？

**核心原因**：防止历史连接初始化（已失效的 SYN 到达服务端）。

\`\`\`
场景：两次握手的问题
1. 客户端发 SYN(seq=1)，网络延迟
2. 客户端超时，发 SYN(seq=100)（新连接）
3. 第二个 SYN 到达，服务端建立连接
4. 第一个 SYN 到达，服务端又建立连接（浪费资源！）
5. 客户端收到服务端响应，发现是旧连接，发 RST 拒绝
   → 但服务端已经分配了资源

三次握手中：
4. 服务端发 SYN+ACK，等待客户端的 ACK
5. 客户端发现 seq 不对，发 RST → 服务端释放资源
\`\`\`

**次要原因**：同步双向序列号。三次握手确保双方都知道对方的初始序列号（ISN）。

### 8.3 半连接队列与全连接队列

\`\`\`
SYN 队列（半连接队列）：收到 SYN，发 SYN+ACK，等待 ACK
Accept 队列（全连接队列）：三次握手完成，等待 accept() 取走

SYN → [SYN队列] → 三次握手完成 → [Accept队列] → accept() → 应用处理
\`\`\`

**Java 调整队列大小**：

\`\`\`java
ServerSocket server = new ServerSocket();
server.setReceiveBufferSize(65536);  // 调整接收缓冲区
server.bind(new InetSocketAddress(8080), 1024);  // backlog=1024（全连接队列）
\`\`\`

**Linux 内核参数**：

\`\`\`bash
# 半连接队列大小
sysctl net.ipv4.tcp_max_syn_backlog=8192

# 全连接队列大小（由 listen backlog 决定）
# somaxconn 是系统上限
sysctl net.core.somaxconn=8192
\`\`\`

### 8.4 SYN Flood 攻击与防御

攻击者大量发伪造源 IP 的 SYN，填满半连接队列，正常用户无法连接。

**防御：SYN Cookie**

\`\`\`bash
# 启用 SYN Cookie
sysctl net.ipv4.tcp_syncookies=1
\`\`\`

SYN Cookie 原理：服务端不分配资源，而是将状态编码到 SYN+ACK 的序列号中。收到 ACK 时反算验证，通过才建立连接。

## 九、四次挥手深度剖析

### 9.1 挥手流程

\`\`\`
客户端 (ESTABLISHED)                     服务端 (ESTABLISHED)
  |                                        |
  | --- FIN, seq=u ---------------------→ |  服务端 → CLOSE_WAIT
  |     (客户端 → FIN_WAIT_1)              |
  |                                        |
  | ←-- ACK, ack=u+1 -------------------  |  服务端处理剩余数据
  |     (客户端 → FIN_WAIT_2)              |
  |                                        |
  | ←-- FIN, seq=v ---------------------  |  服务端 → LAST_ACK
  |                                        |
  | --- ACK, ack=v+1 -------------------→ |  服务端 → CLOSED
  |     (客户端 → TIME_WAIT, 2MSL后CLOSED) |
\`\`\`

### 9.2 为什么是四次而非三次？

因为 TCP 是全双工的——关闭需要两个方向各自关闭。

\`\`\`
FIN 只是表示"我没有数据要发了"
但对方可能还有数据要发

客户端 FIN → 服务端 ACK（客户端不再发数据，但可收）
服务端处理完数据 → 服务端 FIN → 客户端 ACK（双向关闭）
\`\`\`

如果服务端没有待发数据，FIN 和 ACK 可以合并（延迟 ACK 优化），变成三次挥手。

### 9.3 TIME_WAIT 详解

**为什么要有 TIME_WAIT？**

1. **确保最后的 ACK 到达**：如果客户端的 ACK 丢失，服务端会重发 FIN，客户端在 TIME_WAIT 状态能收到重发的 FIN 并重新 ACK。

2. **防止旧连接干扰新连接**：等待 2MSL（最大报文生存时间），让旧连接的报文在网络中消失。

**TIME_WAIT 的问题**：

短连接大量关闭会产生大量 TIME_WAIT（每个持续 60-120 秒），耗尽端口。

**Java 查看连接状态**：

\`\`\`java
// 无法直接用 Java API 查看，需用系统命令
// Runtime.exec("netstat -an | grep TIME_WAIT")
\`\`\`

**Linux 优化**：

\`\`\`bash
# 启用 TIME_WAIT 重用
sysctl net.ipv4.tcp_tw_reuse=1

# 快速回收（NAT 环境慎用）
sysctl net.ipv4.tcp_tw_recycle=0  # 4.12内核已移除，有副作用

# 调小 MSL
sysctl net.ipv4.tcp_fin_timeout=30
\`\`\`

### 9.4 CLOSE_WAIT 问题

大量 CLOSE_WAIT 说明**应用层没有 close()**——收到对方 FIN 后，内核回 ACK，但应用没调用 close()，连接卡在 CLOSE_WAIT。

**排查**：

\`\`\`bash
# 找出 CLOSE_WAIT 的进程
netstat -anp | grep CLOSE_WAIT
# 找出对应进程的 fd
lsof -p <PID> | grep TCP
\`\`\`

**Java 典型场景**：

\`\`\`java
// 错误：异常时没关闭连接
try {
    Socket socket = new Socket("api.example.com", 8080);
    // ... 处理 ...
    socket.close();  // 如果上面抛异常，这行不执行！
} catch (Exception e) {
    // socket 泄露，卡在 CLOSE_WAIT
}

// 正确：try-with-resources
try (Socket socket = new Socket("api.example.com", 8080)) {
    // ... 处理 ...
}  // 自动 close()
\`\`\`

## 十、TCP 状态机

### 10.1 完整状态转换图

\`\`\`
                              被动打开
                                  ↓
                              LISTEN
                                ↓ 收到SYN, 发SYN+ACK
                            SYN_RCVD
                                ↓ 收到ACK
                              ESTABLISHED ←─────────────────
                                ↑ 收到SYN, 发SYN+ACK        │
                                │                           │
主动打开 → SYN_SENT ──收到SYN+ACK, 发ACK──→ ESTABLISHED     │
              │                                          │
              └─收到SYN, 发ACK+SYN+ACK→ SYN_RCVD          │
                                                    │     │
                          主动关闭 / 被动关闭           │     │
                              ↓                     │     │
        FIN_WAIT_1                         CLOSE_WAIT     │
           │  收到ACK                         │           │
           ↓                                  │ 收到FIN, 发ACK
        FIN_WAIT_2                            ↓           │
           │  收到FIN, 发ACK              LAST_ACK        │
           ↓                                  │ 收到ACK    │
        TIME_WAIT ──2MSL──→ CLOSED          CLOSED       │
\`\`\`

### 10.2 常见状态组合诊断

| 状态 | 含义 | 可能问题 |
|------|------|----------|
| LISTEN | 等待连接 | 正常 |
| SYN_SENT | 已发SYN等ACK | 对方没响应（防火墙/宕机） |
| SYN_RCVD | 已发SYN+ACK等ACK | 半连接队列满/SYN Flood |
| ESTABLISHED | 连接已建立 | 正常 |
| FIN_WAIT_1 | 已发FIN等ACK | 等对方确认关闭 |
| FIN_WAIT_2 | 半关闭，等对方FIN | 对方没关（可能泄露） |
| TIME_WAIT | 等待2MSL | 正常，但过多需优化 |
| CLOSE_WAIT | 等应用close() | **应用泄露！没调close()** |
| LAST_ACK | 等最后ACK | 对方没回ACK |
| CLOSED | 已关闭 | 正常 |

## 十一、TCP 流量控制

### 11.1 滑动窗口

接收方通过窗口大小（Window Size）告诉发送方"我还能接收多少数据"。

\`\`\`
发送方窗口：
| 已确认 | 已发送未确认 | 可发送未发送 | 不可发送 |
         ←─── Window ───→

收到 ACK 后窗口右移：
| 已确认 | 已发送未确认 | 可发送未发送 | 不可发送 |
\`\`\`

**Java 调整 socket 缓冲区**：

\`\`\`java
Socket socket = new Socket();
socket.setSendBufferSize(65536);    // 发送缓冲区
socket.setReceiveBufferSize(65536); // 接收缓冲区
\`\`\`

### 11.2 零窗口与坚持计时器

接收方处理慢，窗口降为 0 → 发送方停止发送 → 定期发窗口探测 → 窗口恢复后继续。

\`\`\`
接收方: ACK, Window=0  → "我满了，别发了"
发送方: 等待... 定期发 Window Probe（1字节）
接收方: ACK, Window=8192 → "我有空间了"
发送方: 继续发送
\`\`\`

## 十二、TCP 拥塞控制

### 12.1 拥塞控制算法演进

| 算法 | 年份 | 原理 | 特点 |
|------|------|------|------|
| Tahoe | 1988 | 慢启动+AIMD+快重传 | 基础算法 |
| Reno | 1990 | Tahoe+快恢复 | 经典实现 |
| NewReno | 1996 | 改进Reno多包丢失 | 更好恢复 |
| BIC | 2004 | 二分搜索找最优窗口 | Linux默认(2.6.8-2.6.18) |
| CUBIC | 2008 | 三次函数窗口增长 | Linux默认(2.6.19+) |
| BBR | 2016 | 基于带宽和延迟测量 | Google，瓶颈带宽探测 |

### 12.2 慢启动与拥塞避免

\`\`\`
慢启动：cwnd 从 1 开始，每收到一个 ACK 翻倍（指数增长）
  cwnd: 1 → 2 → 4 → 8 → 16 → ...
  
达到慢启动阈值(ssthresh)后 → 拥塞避免（线性增长）
  cwnd: 16 → 17 → 18 → 19 → ...

拥塞发生（超时）→ cwnd=1, ssthresh=cwnd/2, 重新慢启动
\`\`\`

### 12.3 快重传与快恢复

\`\`\`
快重传：收到 3 个重复 ACK → 立即重传丢失的包（不等超时）
快恢复：cwnd = cwnd/2（不回到1），继续线性增长
\`\`\`

### 12.4 BBR 算法

BBR 不靠丢包判断拥塞，而是测量**瓶颈带宽**和**最小RTT**。

\`\`\`bash
# Linux 启用 BBR
sysctl net.ipv4.tcp_congestion_control=bbr
sysctl net.core.default_qdisc=fq
\`\`\`

**BBR vs CUBIC**：
- CUBIC：基于丢包，缓冲区膨胀时延迟高
- BBR：基于带宽测量，低延迟高吞吐

## 十三、TCP 粘包与拆包

### 13.1 粘包成因

TCP 是字节流协议，没有消息边界。多个应用层消息可能被合并到一个 TCP 段（粘包），或一个消息被拆到多个段（拆包）。

\`\`\`
发送方发了三条消息：  "ABC" "DEF" "GHI"

可能的情况：
粘包： "ABCDEF" "GHI"     （前两条合并）
拆包： "AB" "CDE" "FGHI"  （每条被拆）
混合： "ABCDE" "FGHI"     （粘+拆）
\`\`\`

### 13.2 解决方案

**方案一：固定长度**——每条消息固定 N 字节，不足补齐。

**方案二：分隔符**——用特殊字符标记消息边界（如 \`\n\`）。

**方案三：长度前缀**——消息头中包含消息体长度（最常用）。

\`\`\`
[4字节长度][消息体] [4字节长度][消息体] ...
  0x00 0x00 0x00 0x03  A  B  C
  0x00 0x00 0x00 0x03  D  E  F
\`\`\`

**Java 长度前缀示例**：

\`\`\`java
// 发送：长度前缀 + 消息体
public static void sendMessage(Socket socket, String msg) throws IOException {
    DataOutputStream out = new DataOutputStream(socket.getOutputStream());
    byte[] data = msg.getBytes(StandardCharsets.UTF_8);
    out.writeInt(data.length);   // 4字节长度
    out.write(data);             // 消息体
    out.flush();
}

// 接收：先读长度，再读消息体
public static String readMessage(Socket socket) throws IOException {
    DataInputStream in = new DataInputStream(socket.getInputStream());
    int length = in.readInt();   // 4字节长度
    byte[] data = new byte[length];
    in.readFully(data);          // 读满指定长度
    return new String(data, StandardCharsets.UTF_8);
}
\`\`\`

**Go 长度前缀示例**：

\`\`\`go
func SendMessage(conn net.Conn, msg string) error {
    data := []byte(msg)
    header := make([]byte, 4)
    binary.BigEndian.PutUint32(header, uint32(len(data)))
    _, err := conn.Write(append(header, data...))
    return err
}

func ReadMessage(conn net.Conn) (string, error) {
    header := make([]byte, 4)
    if _, err := io.ReadFull(conn, header); err != nil {
        return "", err
    }
    length := binary.BigEndian.Uint32(header)
    data := make([]byte, length)
    if _, err := io.ReadFull(conn, data); err != nil {
        return "", err
    }
    return string(data), nil
}
\`\`\`

**Python 长度前缀示例**：

\`\`\`python
import struct, socket

def send_message(sock, msg):
    data = msg.encode('utf-8')
    sock.sendall(struct.pack('!I', len(data)) + data)

def read_message(sock):
    header = sock.recv(4)
    if len(header) < 4:
        return None
    length = struct.unpack('!I', header)[0]
    data = b''
    while len(data) < length:
        chunk = sock.recv(length - len(data))
        if not chunk:
            return None
        data += chunk
    return data.decode('utf-8')
\`\`\`

## 十四、TCP 可靠性保证机制

### 14.1 校验和

TCP 首部和数据都参与校验和计算，检测传输中的比特翻转。

### 14.2 序列号与确认

每个字节都有序列号，接收方通过 ACK 确认已收到的数据。

\`\`\`
发送: seq=1, data="ABC" (3字节)
确认: ack=4 (期望下一个字节序号为4)
\`\`\`

### 14.3 超时重传

发送方启动计时器，超时未收到 ACK 则重传。

RTO（重传超时）动态调整：基于 RTT（往返时间）的加权平均。

\`\`\`bash
# Linux 查看 RTO
ss -ti | grep rto
\`\`\`

### 14.4 快速重传

收到 3 个重复 ACK → 判断包丢失 → 不等超时立即重传。

### 15.5 选择确认（SACK）

传统 TCP 只能告诉发送方"我期望收到 seq=X"，SACK 可以告诉"我已收到 X~Y，缺少 Y~Z"。

\`\`\`bash
# Linux 默认开启 SACK
sysctl net.ipv4.tcp_sack=1
\`\`\`

## 十五、TCP 常用调优参数

### 15.1 Linux TCP 调优

\`\`\`bash
# 连接复用（TIME_WAIT 快速回收）
net.ipv4.tcp_tw_reuse=1

# SYN Cookie 防 SYN Flood
net.ipv4.tcp_syncookies=1

# 半连接队列
net.ipv4.tcp_max_syn_backlog=8192

# 全连接队列
net.core.somaxconn=8192

# Keepalive 探测
net.ipv4.tcp_keepalive_time=600     # 10分钟后开始探测
net.ipv4.tcp_keepalive_intvl=30     # 每30秒探测一次
net.ipv4.tcp_keepalive_probes=3     # 3次失败断开

# 缓冲区
net.core.rmem_max=16777216   # 最大接收缓冲区
net.core.wmem_max=16777216   # 最大发送缓冲区
net.ipv4.tcp_rmem=4096 87380 16777216  # 接收缓冲区(最小/默认/最大)
net.ipv4.tcp_wmem=4096 65536 16777216  # 发送缓冲区

# BBR 拥塞控制
net.ipv4.tcp_congestion_control=bbr
net.core.default_qdisc=fq
\`\`\`

### 15.2 Java Socket Keepalive

\`\`\`java
Socket socket = new Socket();
socket.setKeepAlive(true);        // 启用 TCP Keepalive
socket.setTcpNoDelay(true);       // 禁用 Nagle 算法（小包立即发）
socket.setSoTimeout(30000);       // 读超时 30 秒
socket.setSoLinger(false, 0);     // close() 时立即返回（RST关闭）
\`\`\`

### 15.3 Go 连接池配置

\`\`\`go
// HTTP 客户端连接池
client := &http.Client{
    Transport: &http.Transport{
        MaxIdleConns:        100,              // 最大空闲连接
        MaxIdleConnsPerHost: 10,               // 每主机最大空闲连接
        IdleConnTimeout:     90 * time.Second,  // 空闲超时
        DialContext: (&net.Dialer{
            Timeout:   5 * time.Second,   // 连接超时
            KeepAlive: 30 * time.Second,  // Keepalive
        }).DialContext,
    },
    Timeout: 30 * time.Second,  // 请求总超时
}
\`\`\`

## 十六、TCP 调试工具

### 16.1 netstat / ss

\`\`\`bash
# 查看所有 TCP 连接及状态
netstat -anp | grep tcp
ss -tnp

# 统计各状态连接数
netstat -an | awk '/tcp/ {print $6}' | sort | uniq -c

# 查看 TIME_WAIT 数量
ss -tan state time-wait | wc -l
\`\`\`

### 16.2 tcpdump / wireshark

\`\`\`bash
# 抓取 80 端口的 TCP 包
tcpdump -i eth0 port 80 -nn

# 抓取三次握手
tcpdump -i eth0 'tcp[tcpflags] & tcp-syn != 0' -nn

# 保存到文件用 wireshark 分析
tcpdump -i eth0 port 443 -w capture.pcap
\`\`\`

### 16.3 Java 网络诊断

\`\`\`java
// 检测端口连通性
try (Socket socket = new Socket()) {
    socket.connect(new InetSocketAddress("api.example.com", 443), 5000);
    System.out.println("连接成功");
} catch (Exception e) {
    System.out.println("连接失败: " + e.getMessage());
}

// 检测延迟
long start = System.currentTimeMillis();
InetAddress.getByName("api.example.com").isReachable(3000);
long elapsed = System.currentTimeMillis() - start;
System.out.println("延迟: " + elapsed + "ms");
\`\`\`

## 十七、TCP 面试题与生产案例

### 17.1 高频面试题

**Q1: 三次握手能否携带数据？**

第三次握手的 ACK 可以携带数据（TCP Fast Open）。前两次不行，因为还没确认连接。

**Q2: ISN（初始序列号）为什么是随机的？**

防止序号预测攻击。如果 ISN 固定，攻击者可构造在途报文注入数据。

**Q3: 半连接队列和全连接队列满会怎样？**

半连接满 → 新 SYN 被丢弃（或用 SYN Cookie）。
全连接满 → 完成握手的连接被丢弃，或发 RST（取决于 tcp_abort_on_overflow）。

**Q4: Nagle 算法是什么？**

小包合并——攒够 MSS 或收到前一个 ACK 才发送。减少小包数量但增加延迟。实时场景需禁用（\`TCP_NODELAY\`）。

### 17.2 生产案例

**案例一：大量 TIME_WAIT 导致端口耗尽**

短连接高并发场景，每秒数千连接，TIME_WAIT 持续 60 秒 → 端口耗尽。

**解决**：用长连接（连接池）、开启 \`tcp_tw_reuse\`、增大端口范围。

**案例二：CLOSE_WAIT 堆积**

HTTP 客户端未正确关闭连接，CLOSE_WAIT 数万。

**解决**：排查代码，确保所有连接在 finally 中 close()。

**案例三：Nagle + 延迟 ACK 导致 200ms 延迟**

发送方 Nagle 等待 ACK，接收方延迟 ACK 等 200ms → 交互延迟。

**解决**：设 \`TCP_NODELAY=true\` 禁用 Nagle。

> **TCP 深入心法**：TCP 的每个设计都有原因——三次握手防历史连接、TIME_WAIT 防旧报文、滑动窗口做流控、拥塞控制防网络崩溃。理解这些原理，才能在遇到"连接超时""端口耗尽""延迟高"等问题时快速定位根因。


## 十八、TCP vs UDP 深度对比

### 18.1 核心差异

| 维度 | TCP | UDP |
|------|-----|-----|
| 连接 | 面向连接（三次握手） | 无连接 |
| 可靠性 | 可靠（重传、确认、排序） | 不可靠（尽力而为） |
| 有序性 | 有序 | 无序 |
| 速度 | 慢（握手+重传+流控） | 快（直接发） |
| 头部开销 | 20 字节 | 8 字节 |
| 流控/拥塞控制 | 有 | 无 |
| 适用场景 | 文件传输、API、邮件 | 视频、游戏、DNS、VoIP |

### 18.2 何时用 UDP

1. **实时性 > 可靠性**：视频通话（丢几帧无所谓，延迟不可接受）
2. **短消息**：DNS 查询（一问一答，握手开销不值）
3. **广播/多播**：直播推送（一对多）
4. **自定义可靠性**：QUIC（HTTP/3）在 UDP 上自建可靠性

### 18.3 Java UDP 示例

\`\`\`java
// UDP 服务端
DatagramSocket socket = new DatagramSocket(9999);
byte[] buffer = new byte[1024];
DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
socket.receive(packet);  // 阻塞等待
String msg = new String(packet.getData(), 0, packet.getLength());
System.out.println("收到: " + msg);

// UDP 客户端
DatagramSocket socket = new DatagramSocket();
String msg = "Hello UDP";
DatagramPacket packet = new DatagramPacket(
    msg.getBytes(), msg.length(),
    InetAddress.getByName("localhost"), 9999
);
socket.send(packet);
\`\`\`

### 18.4 Go UDP 示例

\`\`\`go
// UDP 服务端
addr, _ := net.ResolveUDPAddr("udp", ":9999")
conn, _ := net.ListenUDP("udp", addr)
defer conn.Close()

buf := make([]byte, 1024)
n, clientAddr, _ := conn.ReadFromUDP(buf)
fmt.Println("收到:", string(buf[:n]))

// 回复
conn.WriteToUDP([]byte("OK"), clientAddr)

// UDP 客户端
conn, _ := net.DialUDP("udp", nil, addr)
conn.Write([]byte("Hello UDP"))
buf = make([]byte, 1024)
n, _ = conn.Read(buf)
fmt.Println("回复:", string(buf[:n]))
\`\`\`

## 十九、TCP Keepalive 机制

### 19.1 为什么需要 Keepalive

TCP 连接建立后，如果一方崩溃（断电、网线断），另一方不知道，连接永久挂在 ESTABLISHED。

Keepalive 定期发探测包，检测对端是否存活。

### 19.2 两种 Keepalive

**TCP Keepalive**（内核层）：

\`\`\`java
Socket socket = new Socket();
socket.setKeepAlive(true);  // 启用 TCP Keepalive
// 参数由系统控制：tcp_keepalive_time/intvl/probes
\`\`\`

**应用层 Keepalive**（心跳）：

\`\`\`java
// 自定义心跳协议
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
scheduler.scheduleAtFixedRate(() -> {
    try {
        OutputStream out = socket.getOutputStream();
        out.write(0x00);  // 心跳包（1字节）
        out.flush();
    } catch (IOException e) {
        System.out.println("心跳失败，连接断开");
        reconnect();
    }
}, 0, 30, TimeUnit.SECONDS);  // 每30秒一次心跳
\`\`\`

### 19.3 心跳设计最佳实践

1. **间隔**：通常 30-60 秒（太频繁浪费带宽，太慢检测慢）
2. **超时**：3 次未响应判定断开
3. **双向**：双方都发心跳或一方发另一方回 PONG
4. **空闲触发**：只在无数据传输时发心跳

\`\`\`go
// Go 心跳实现
func startHeartbeat(conn net.Conn, interval time.Duration) {
    ticker := time.NewTicker(interval)
    defer ticker.Stop()
    for range ticker.C {
        _, err := conn.Write([]byte{0x00})  // 心跳包
        if err != nil {
            log.Println("心跳失败:", err)
            conn.Close()
            return
        }
    }
}
\`\`\`

## 二十、连接池与长连接

### 20.1 为什么用连接池

短连接每次请求都要三次握手 + 四次挥手，开销大。连接池复用 TCP 连接，摊薄握手成本。

\`\`\`
短连接：  握手 → 请求 → 响应 → 关闭（每次重复）
长连接：  握手 → 请求1 → 响应1 → 请求2 → 响应2 → ... → 关闭
\`\`\`

### 20.2 Java 数据库连接池（HikariCP）

\`\`\`java
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:mysql://localhost:3306/mydb");
config.setUsername("root");
config.setPassword("password");
config.setMaximumPoolSize(20);           // 最大连接数
config.setMinimumIdle(5);                // 最小空闲连接
config.setConnectionTimeout(30000);      // 获取连接超时
config.setIdleTimeout(600000);           // 空闲连接超时
config.setMaxLifetime(1800000);          // 连接最大生命期
config.setKeepaliveTime(30000);          // Keepalive 间隔

HikariDataSource ds = new HikariDataSource(config);
Connection conn = ds.getConnection();    // 从池中获取
// ... 使用 ...
conn.close();                            // 归还到池（不是真正关闭）
\`\`\`

### 20.3 Go HTTP 连接池

\`\`\`go
// 全局复用连接池
var client = &http.Client{
    Transport: &http.Transport{
        MaxIdleConns:        100,
        MaxIdleConnsPerHost: 10,
        IdleConnTimeout:     90 * time.Second,
        DialContext: (&net.Dialer{
            Timeout:   5 * time.Second,
            KeepAlive: 30 * time.Second,
        }).DialContext,
        ForceAttemptHTTP2: true,
    },
}

// 复用连接（不要关闭 Body！）
resp, _ := client.Get("https://api.example.com/data")
defer resp.Body.Close()  // Close 只是归还连接，不是断开
\`\`\`

### 20.4 Node.js HTTP Keep-Alive

\`\`\`javascript
const http = require('http');
const agent = new http.Agent({
    keepAlive: true,        // 启用长连接
    maxSockets: 100,        // 每主机最大连接
    maxFreeSockets: 10,     // 最大空闲连接
    timeout: 30000,         // 空闲超时
});

// 所有请求复用连接
const options = { hostname: 'api.example.com', agent };
http.get(options, (res) => { /* ... */ });
\`\`\`

## 二十一、TCP 性能基准

### 21.1 延迟构成

一次 HTTP 请求的延迟：

\`\`\`
DNS 查询         1-50ms     （缓存后可忽略）
TCP 三次握手     1*RTT      （长连接后可忽略）
TLS 握手         1-2*RTT    （会话恢复后 0-1*RTT）
HTTP 请求+响应   1*RTT      （不可省）
服务端处理       10-1000ms  （取决于业务）
\`\`\`

### 21.2 RTT 优化

**CDN**：将内容缓存到离用户近的节点，降低 RTT。

**HTTP/2 多路复用**：一个 TCP 连接并行多个请求，避免多连接握手。

**TCP Fast Open**：三次握手的 SYN 包可携带数据（需客户端和服务端支持）。

\`\`\`bash
# Linux 启用 TCP Fast Open
sysctl net.ipv4.tcp_fastopen=3  # 1=客户端 2=服务端 3=都启用
\`\`\`

## 二十二、生产排障实战

### 22.1 连接超时排查

**现象**：客户端报 "Connection timed out"

**排查步骤**：

\`\`\`bash
# 1. 检查网络连通性
ping api.example.com

# 2. 检查端口连通性
telnet api.example.com 443
nc -zv api.example.com 443

# 3. 检查防火墙
iptables -L -n | grep 443

# 4. 抓包分析
tcpdump -i eth0 host api.example.com and port 443 -nn
\`\`\`

**Java 排查**：

\`\`\`java
// 设置不同超时分别排查
Socket socket = new Socket();
socket.connect(new InetSocketAddress("api.example.com", 443), 5000);  // 连接超时5s
socket.setSoTimeout(10000);  // 读超时10s

// 如果 connect 超时 → 网络不通/防火墙
// 如果 read 超时 → 服务端处理慢/未响应
\`\`\`

### 22.2 大量 TIME_WAIT

**排查**：

\`\`\`bash
# 统计 TIME_WAIT 数量
ss -tan state time-wait | wc -l

# 找出是哪些连接
ss -tan state time-wait | head -20
\`\`\`

**处理**：

\`\`\`bash
# 1. 临时：调整内核参数
sysctl -w net.ipv4.tcp_tw_reuse=1

# 2. 永久：改用长连接
# 3. 扩大端口范围
sysctl -w net.ipv4.ip_local_port_range="10000 65535"
\`\`\`

### 22.3 连接被 RST

**现象**：连接突然断开，收到 RST 包。

**可能原因**：
1. 服务端进程崩溃 → 内核发 RST
2. 防火墙规则变更
3. NAT 超时（空闲连接被回收）
4. 请求了已关闭的端口

**排查**：

\`\`\`bash
# 抓 RST 包
tcpdump -i eth0 'tcp[tcpflags] & tcp-rst != 0' -nn
\`\`\`

### 22.4 慢连接诊断

\`\`\`bash
# 查看连接的 RTT 和重传
ss -ti dst api.example.com

# 输出示例：
# cubic wscale:7,7 rto:204 rtt:12.3/4.5 mss:1448 cwnd:10
# rtt: 12.3ms (平均), 4.5ms (偏差)
# cwnd: 10 (拥塞窗口)
# retrans: 0/5 (重传 0 次/总发 5 次)
\`\`\`

> **TCP 排障心法**：网络问题排查遵循"分层定位"——先 ping 看通不通（网络层），再 telnet 看端口通不通（传输层），再 curl 看应用通不通（应用层）。每层都通但慢，就看 RTT、重传、窗口。tcpdump + wireshark 是终极武器。


## 二十三、TCP 进阶知识补充

### 23.1 TCP Fast Open（TFO）

TFO 允许三次握手的 SYN 包携带数据，减少一个 RTT。

\`\`\`
首次连接：
  SYN + Cookie请求 → SYN+ACK + Cookie → ACK + 数据
  （和普通握手一样）

后续连接（带 Cookie）：
  SYN + Cookie + 数据 → SYN+ACK + 响应数据 → ACK
  （数据在第一个包就发出，省一个 RTT！）
\`\`\`

**Linux 启用**：

\`\`\`bash
sysctl net.ipv4.tcp_fastopen=3  # 客户端+服务端
\`\`\`

**Java TFO**（需要 JNI 或 native 库支持，标准 API 不直接支持）。

**Go TFO**：

\`\`\`go
lc := net.ListenConfig{
    Control: func(network, address string, c syscall.RawConn) error {
        var err error
        c.Control(func(fd uintptr) {
            err = unix.SetsockoptInt(int(fd), unix.IPPROTO_TCP,
                unix.TCP_FASTOPEN, 5)  // 队列长度5
        })
        return err
    },
}
ln, _ := lc.Listen(context.Background(), "tcp", ":8080")
\`\`\`

### 23.2 SO_REUSEPORT

允许多个进程/线程绑定同一端口，内核做负载均衡。

\`\`\`c
int opt = 1;
setsockopt(fd, SOL_SOCKET, SO_REUSEPORT, &opt, sizeof(opt));
\`\`\`

**Java NIO + SO_REUSEPORT**：

\`\`\`java
ServerSocketChannel channel = ServerSocketChannel.open();
channel.setOption(StandardSocketOptions.SO_REUSEPORT, true);
channel.bind(new InetSocketAddress(8080));
\`\`\`

**应用场景**：多进程 Web 服务器（Nginx worker）、零停机重启。

### 23.3 TCP_DEFER_ACCEPT

延迟 accept() 直到有数据到达，减少空连接的 wakeup。

\`\`\`bash
# Linux 内核参数
sysctl net.ipv4.tcp_defer_accept=60  # 最多等60秒
\`\`\`

### 23.4 常见 TCP 内核参数速查

| 参数 | 默认值 | 推荐值 | 作用 |
|------|--------|--------|------|
| tcp_max_syn_backlog | 1024 | 8192 | 半连接队列 |
| somaxconn | 128 | 8192 | 全连接队列 |
| tcp_tw_reuse | 0 | 1 | TIME_WAIT 复用 |
| tcp_syncookies | 1 | 1 | SYN Flood 防护 |
| tcp_keepalive_time | 7200 | 600 | Keepalive 间隔(秒) |
| tcp_fin_timeout | 60 | 30 | FIN_WAIT_2 超时 |
| ip_local_port_range | 32768-60999 | 10000-65535 | 端口范围 |
| tcp_congestion_control | cubic | bbr | 拥塞控制算法 |

> **TCP 终极心法**：TCP 调优的本质是"平衡"——可靠性 vs 性能、吞吐 vs 延迟、安全 vs 效率。生产环境的 TCP 问题，90% 是 TIME_WAIT 过多、CLOSE_WAIT 泄露、Nagle 延迟、连接池配置不当。掌握 netstat/ss/tcpdump 三件套，理解状态机和滑动窗口，就能快速定位。


> **核心心法**：TCP 是后端通信的基石。理解三次握手、四次挥手、状态机、流控拥塞、粘包，能解释绝大多数网络故障。记住"大量 TIME_WAIT 调内核/用长连接，大量 CLOSE_WAIT 查代码 fd 泄露"。

下面的可运行代码用 EventEmitter 模拟了 TCP 连接的建立与拆除：定义 TCPConnection 状态机，实现三次握手、数据传输（带序列号确认）、四次挥手全流程，并演示粘包用长度字段解决方案。`,
    code: `// 用 EventEmitter 模拟 TCP 连接的建立与拆除
// 演示：三次握手 → 数据传输（带序列号确认）→ 四次挥手，并演示粘包长度前缀方案
const { EventEmitter } = require("events");

// TCP 连接状态枚举
const STATE = {
  CLOSED: "CLOSED", LISTEN: "LISTEN", SYN_SENT: "SYN_SENT",
  SYN_RCVD: "SYN_RCVD", ESTABLISHED: "ESTABLISHED",
  FIN_WAIT_1: "FIN_WAIT_1", FIN_WAIT_2: "FIN_WAIT_2",
  CLOSE_WAIT: "CLOSE_WAIT", LAST_ACK: "LAST_ACK", TIME_WAIT: "TIME_WAIT",
};

// TCP 端点基类：维护状态机 + 通过事件发送报文
class TCPEndpoint extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
    this.state = STATE.CLOSED;
    this.peer = null;
    this.seq = 0;
  }
  connectPeer(peer) { this.peer = peer; peer.peer = this; }
  setState(s) { console.log("  [" + this.name + "] " + this.state + " -> " + s); this.state = s; }
  send(seg) { console.log("  [" + this.name + "] 发送 " + seg); this.peer.receive(seg); }
  receive(seg) {}
}

// 客户端
class Client extends TCPEndpoint {
  handshake() {
    console.log("\\n===== 三次握手（建立连接）=====");
    this.setState(STATE.SYN_SENT);
    this.send("SYN seq=100");
  }
  receive(seg) {
    if (seg.startsWith("SYN-ACK") && this.state === STATE.SYN_SENT) {
      this.setState(STATE.ESTABLISHED);
      this.send("ACK ack=201");
      console.log("  ✅ 连接已建立（客户端）");
      return;
    }
    if (seg === "ACK" && this.state === STATE.FIN_WAIT_1) {
      this.setState(STATE.FIN_WAIT_2);
      return;
    }
    if (seg === "FIN" && this.state === STATE.FIN_WAIT_2) {
      this.setState(STATE.TIME_WAIT);
      this.send("ACK");
      console.log("  ⏳ TIME_WAIT：等待 2MSL 后关闭");
      this.setState(STATE.CLOSED);
      console.log("  ✅ 连接已关闭（客户端）");
    }
  }
  // 发送数据（带序列号）
  sendData(payload) {
    const seq = this.seq;
    this.seq += Buffer.byteLength(payload);
    console.log("  [客户端] 发送数据 seq=" + seq + " \\"" + payload + "\\"");
    this.peer.receive("DATA seq=" + seq + " payload=" + payload);
  }
  close() {
    console.log("\\n===== 四次挥手（关闭连接）=====");
    this.setState(STATE.FIN_WAIT_1);
    this.send("FIN");
  }
}

// 服务端
class Server extends TCPEndpoint {
  listen() { this.setState(STATE.LISTEN); }
  receive(seg) {
    if (seg === "SYN seq=100" && this.state === STATE.LISTEN) {
      this.setState(STATE.SYN_RCVD);
      this.send("SYN-ACK seq=200 ack=101");
      return;
    }
    if (seg === "ACK ack=201" && this.state === STATE.SYN_RCVD) {
      this.setState(STATE.ESTABLISHED);
      console.log("  ✅ 连接已建立（服务端）");
      return;
    }
    if (seg.startsWith("DATA")) {
      // 确认收到的数据
      const m = seg.match(/seq=(\\d+) payload=(.*)/);
      const ackNum = parseInt(m[1]) + Buffer.byteLength(m[2]);
      console.log("  [服务端] 收到数据，回 ACK ack=" + ackNum);
      this.send("ACK ack=" + ackNum);
      return;
    }
    if (seg === "FIN" && this.state === STATE.ESTABLISHED) {
      this.setState(STATE.CLOSE_WAIT);
      this.send("ACK");
      this.setState(STATE.LAST_ACK);
      this.send("FIN");
      return;
    }
    if (seg === "ACK" && this.state === STATE.LAST_ACK) {
      this.setState(STATE.CLOSED);
      console.log("  ✅ 连接已关闭（服务端）");
    }
  }
}

// --- 运行 TCP 连接模拟 ---
const client = new Client("客户端");
const server = new Server("服务端");
console.log("初始状态：客户端=" + client.state + "，服务端=" + server.state);
server.listen();
client.connectPeer(server);

client.handshake();            // 三次握手
console.log("\\n===== 数据传输（带序列号确认）=====");
client.sendData("GET / HTTP/1.1");
client.sendData("Hello TCP");
client.close();                // 四次挥手
console.log("\\n===== 最终状态：客户端=" + client.state + "，服务端=" + server.state + " =====");

// --- 粘包问题与长度前缀解决方案 ---
console.log("\\n\\n===== 粘包与长度前缀方案 =====");
// 模拟粘包：两条消息被合并成一段字节流
const msg1 = Buffer.from("第一条消息");
const msg2 = Buffer.from("第二条消息");
const stream = Buffer.concat([msg1, msg2]); // 粘包：两条消息混在一起
console.log("粘包后的字节流长度:", stream.length, "（无法区分边界）");

// 解决方案：长度前缀 [4字节长度][body]
function encodeMsg(data) {
  const body = Buffer.from(data);
  const header = Buffer.alloc(4);
  header.writeUInt32BE(body.length, 0);
  return Buffer.concat([header, body]);
}
function decodeStream(buffer) {
  const msgs = [];
  let offset = 0;
  while (offset + 4 <= buffer.length) {
    const len = buffer.readUInt32BE(offset);
    if (offset + 4 + len > buffer.length) break;
    const body = buffer.slice(offset + 4, offset + 4 + len);
    msgs.push(body.toString());
    offset += 4 + len;
  }
  return msgs;
}
// 编码两条消息并合并（模拟粘包）
const enc = Buffer.concat([encodeMsg("第一条消息"), encodeMsg("第二条消息")]);
console.log("编码后字节流长度:", enc.length);
// 解码：能正确拆分出两条消息
const decoded = decodeStream(enc);
console.log("解码出", decoded.length, "条消息:");
decoded.forEach((m, i) => console.log("  消息" + (i + 1) + ":", m));`,
  },

  // ============================================================
  // 第 5 章：DNS 域名系统
  // ============================================================
  {
    id: "backend-dns",
    group: "基础与网络",
    icon: "🗺",
    title: "DNS 域名系统",
    content: `# DNS 域名系统

DNS（Domain Name System，域名系统）是互联网的"通讯录"——它把人类易记的域名（如 \`www.example.com\`）翻译成机器使用的 IP 地址（如 \`93.184.216.34\`）。没有 DNS，我们就只能用一串数字访问网站。理解 DNS 对后端工程师至关重要：域名解析慢会导致请求慢，DNS 配置错误会导致服务不可达，DNS 还是负载均衡的重要手段。

DNS 是互联网最古老也最核心的基础设施之一。它是一个全球分布式的、分层数据库，每天处理万亿次查询，却极少出问题——这得益于它的分层设计、多级缓存和冗余机制。但同时，DNS 也是攻击目标（DNS 劫持、DNS 放大攻击），理解它的安全机制很重要。

---

## DNS 的作用与为什么需要

### 为什么需要 DNS

计算机之间通信用 IP 地址（如 \`93.184.216.34\`），但 IP 地址难记。域名（如 \`www.example.com\`）易记、有意义。DNS 就是这二者之间的桥梁。

如果只用 IP，会有这些问题：
- **难记**：\`93.184.216.34\` 谁记得住？
- **变更困难**：服务器换 IP，所有用 IP 的地方都要改。
- **无法负载均衡**：一个 IP 只能指向一台机器。

DNS 解决了这些：用域名访问，DNS 负责域名→IP 的映射，IP 变了只改 DNS 记录。

### DNS 的五大作用

1. **域名解析**：域名 → IP，这是最核心的功能。
2. **负载均衡**：一个域名可返回多个 IP，客户端轮询访问。
3. **服务发现**：通过 SRV 记录定位服务地址和端口。
4. **邮件路由**：MX 记录告诉邮件该发往哪。
5. **别名与迁移**：CNAME 让域名灵活指向，方便迁移服务。

---

## DNS 的层级结构

DNS 是一个**分布式、分层**的数据库，没有单点。域名从右到左层级递进：

\`\`\`
www.example.com.
   │    │      │  │
   │    │      │  └── 根域名（root，通常省略，写作 .）
   │    │      └───── 顶级域名 TLD（com）
   │    └──────────── 二级域名（example）
   └───────────────── 三级域名（www）
\`\`\`

最后的点 \`.\` 代表根域名，日常省略，但完整域名都应以点结尾（FQDN，Fully Qualified Domain Name）。

### 各层服务器

1. **根域名服务器（Root Servers）**：全球 13 组（A-M，用字母标识），管理顶级域名的 NS。它不直接解析具体域名，而是告诉你"去问哪个 TLD 服务器"。13 组是逻辑组，实际有上千台（用 anycast 任播）。
2. **顶级域名服务器（TLD Servers）**：管理各自顶级域下的权威服务器，如 \`.com\` 服务器管理所有 \`.com\` 域名的 NS 记录。TLD 分两类：
   - 通用顶级域（gTLD）：.com .net .org .info 等。
   - 国家代码顶级域（ccTLD）：.cn .us .jp 等。
3. **权威域名服务器（Authoritative Servers）**：由域名所有者配置，存储该域名的具体记录（A/MX/CNAME 等）。这是真正"知道答案"的服务器。
4. **本地 DNS 服务器（递归解析器）**：运营商或公共 DNS（如 8.8.8.8、114.114.114.114、1.1.1.1），替用户完成整个递归查询并缓存结果。

\`\`\`
用户 ──> 本地DNS(递归) ──> 根服务器 ──> TLD服务器 ──> 权威服务器
                              └───────── 返回记录 ────────┘
\`\`\`

### 为什么是分布式分层

- **性能**：单一中心服务器扛不住全球查询，分层让负载分散。
- **容错**：没有单点，某层故障不影响整体。
- **管理自治**：每层各自管理，\.com 由 Verisign 管，\.cn 由 CNNIC 管，example.com 由域名所有者管。

---

## DNS 解析完整流程

当浏览器请求 \`www.example.com\` 时，DNS 解析会依次查找：

1. **浏览器 DNS 缓存**：浏览器自己维护的缓存，命中则直接用。Chrome 默认缓存 1 分钟。
2. **操作系统 DNS 缓存**：OS 层缓存（如 Linux 的 systemd-resolved、Windows 的 DNS Client 服务）。
3. **hosts 文件**：本地静态映射（\`/etc/hosts\`），优先级高于 DNS 查询。
4. **本地 DNS 服务器（递归解析器）**：以上都未命中，向配置的本地 DNS 发起查询。
5. **递归查询**：本地 DNS 替你完成"根→TLD→权威"的逐级查询。
6. **返回并缓存**：结果返回给客户端，各级按 TTL 缓存。

### 递归查询详解

\`\`\`
本地DNS            根服务器          .com TLD服务器      example.com 权威服务器
   |                  |                   |                    |
   | -- www.example.com? -->             |                    |
   |                  |                   |                    |
   | <-- 去问 .com 的 NS --              |                    |
   | -- www.example.com? --------------> |                    |
   |                                     |                    |
   | <-- 去问 example.com 的 NS ------- |                    |
   | -- www.example.com? ----------------------------------> |
   |                                                          |
   | <----------- A 记录 93.184.216.34 --------------------- |
   |                                                          |
   | 缓存结果（按 TTL），返回给客户端
\`\`\`

- **递归查询**：客户端→本地DNS 是递归（本地DNS 负责查到底，最终给客户端答案）。
- **迭代查询**：本地DNS→根/TLD/权威 是迭代（每级只返回"下一步去问谁"，本地DNS 自己逐级问）。

### 一次完整解析的耗时

- 缓存命中：< 1ms（本地）到 1-5ms（本地 DNS 缓存）。
- 完整递归：50-200ms（多次往返，跨地域）。
- 这就是为什么 DNS 缓存和预解析很重要——首次解析可能比请求本身还慢。

---

## DNS 记录类型详解

DNS 不仅存 IP，还存多种记录类型，各有用途。

| 记录 | 全称 | 作用 | 示例 |
|------|------|------|------|
| A | Address | 域名 → IPv4 | www → 1.2.3.4 |
| AAAA | IPv6 Address | 域名 → IPv6 | www → 2001:db8::1 |
| CNAME | Canonical Name | 域名别名，指向另一域名 | blog → www.example.com |
| MX | Mail Exchange | 邮件服务器 | example.com → mail.example.com |
| TXT | Text | 任意文本，常用于验证 | SPF、域名所有权验证 |
| NS | Name Server | 该域由谁解析 | example.com → ns1.example.com |
| PTR | Pointer | IP → 域名（反向解析） | 1.2.3.4 → www.example.com |
| SRV | Service | 服务地址+端口 | _sip._tcp → sip.example.com:5060 |
| SOA | Start of Authority | 区域权威信息 | 主NS、管理员邮箱、序列号 |
| CAA | CA Authorization | 允许哪些 CA 签发证书 | 限制证书颁发 |

### 各记录类型详解

**A 记录**：最常用，域名→IPv4。一个域名可有多个 A 记录（负载均衡）。

**AAAA 记录**：域名→IPv6。随着 IPv6 普及越来越重要。

**CNAME 记录**：别名，把一个域名指向另一个域名。常用于 CDN（把 \`cdn.example.com\` 指向 CDN 厂商域名）、服务迁移。注意：CNAME 不能与其他记录共存于同一域名（如根域名不能设 CNAME，因为根域名要有 SOA/NS）。

**MX 记录**：邮件交换，告诉邮件服务器把发往 \`@example.com\` 的邮件送到哪。带优先级（数字小优先）。

\`\`\`http
; DNS 记录示例（zone 文件格式）
example.com.    IN  A      93.184.216.34
www             IN  CNAME  example.com.
mail            IN  A      93.184.216.35
example.com.    IN  MX     10 mail.example.com.
example.com.    IN  TXT    "v=spf1 include:_spf.google.com ~all"
example.com.    IN  NS     ns1.example.com.
example.com.    IN  SOA    ns1.example.com. admin.example.com. 2025010101 7200 3600 1209600 3600
\`\`\`

**TXT 记录**：自由文本，用途广泛：SPF（防邮件伪造）、DKIM（邮件签名）、域名所有权验证（如 Google Search Console 让你加一条 TXT 证明你拥有域名）。

**NS 记录**：指定由哪个 DNS 服务器解析该域名。改 NS 就是把域名解析权移交。

**PTR 记录**：反向解析，IP→域名。用于邮件反垃圾（收件方反查发件 IP 是否匹配域名）。

**SRV 记录**：服务定位，记录服务的主机、端口、权重。用于 SIP、Active Directory 等。

**SOA 记录**：每个区域起始记录，含主 NS、管理员邮箱、序列号（改记录要递增，通知从服务器更新）、刷新/重试/过期时间、最小 TTL。

**CAA 记录**：限制哪些 CA 可为该域名签发证书，防止证书被滥发。

### CNAME 链与解析

CNAME 指向另一个域名，可能形成链：\`a → b → c → IP\`。解析时要逐个跟随，增加延迟。所以**根域名不能设 CNAME**（会影响 MX 等），且要避免过长的 CNAME 链。

\`\`\`
blog.example.com → CNAME → cdn.provider.net
cdn.provider.net → CNAME → edge.provider.net
edge.provider.net → A → 1.2.3.4
（两跳 CNAME，增加解析延迟）
\`\`\`

---

## 递归查询 vs 迭代查询

这是 DNS 的核心概念，常被混淆。

**递归查询**：客户端把"查到底"的责任交给对方。客户端→本地DNS 是递归——客户端发一个请求，本地DNS 负责查到答案才返回。

**迭代查询**：对方只告诉你"下一步去问谁"，你自己逐级问。本地DNS→根/TLD/权威 是迭代——根说"我不知道，去问 .com 服务器"，本地DNS 再去问 .com 服务器。

\`\`\`
递归：客户端 --"帮我查 www.example.com"--> 本地DNS（负责查到底，返回最终答案）
迭代：本地DNS --"www.example.com?"--> 根（返回"去问 .com"）
     本地DNS --"www.example.com?"--> .com（返回"去问权威"）
     本地DNS --"www.example.com?"--> 权威（返回 IP）
\`\`\`

为什么要这样设计？因为根/TLD 服务器太忙，不能替每个客户端递归查询。让本地DNS 递归（一台替成千上万用户查），根/TLD 只做轻量迭代响应。

---

## DNS 缓存与 TTL 策略

DNS 是高并发系统，靠**多级缓存**支撑。每条记录都有 **TTL（Time To Live）**，决定缓存有效期。

### 缓存层级

浏览器缓存 → OS 缓存 → 本地 DNS 缓存 → 各级权威缓存。每一层都按 TTL 缓存，命中就不向上查。

### TTL 的权衡

- **TTL 大**：缓存命中率高、解析快，但记录变更生效慢（旧 IP 还在缓存里）。
- **TTL 小**：变更快速生效，但查询多、压力大。

**实战经验**：平时用较大 TTL（如 3600s）保性能；计划变更前提前调小 TTL（如 60s）让变更快速生效，变更后再调回。

### 缓存导致的"变更不生效"

改了 DNS 记录，部分用户仍访问旧 IP——因为他们的本地 DNS 还在 TTL 内缓存了旧记录。需等 TTL 过期才全网生效。所以**重大变更要预留 TTL 时间窗口**。

\`\`\`bash
# 查看域名的 TTL
dig www.example.com
# ANSWER SECTION 中第二个数字就是 TTL（秒）
# www.example.com.  3600  IN  A  93.184.216.34
#                   ^^^^ 这个就是 TTL
\`\`\`

### 负缓存

DNS 也会缓存"不存在"的结果（NXDOMAIN），避免对不存在的域名反复查询。负缓存也有 TTL（由 SOA 记录的最小 TTL 决定）。

---

## DNS 负载均衡

### DNS 轮询

一个 A 记录可返回多个 IP，客户端轮询访问：

\`\`\`
www.example.com.  IN  A  1.1.1.1
www.example.com.  IN  A  2.2.2.2
www.example.com.  IN  A  3.3.3.3
\`\`\`

优点：简单、无需中间设备。缺点：客户端可能缓存某个 IP，导致负载不均；无法感知服务器健康状态（某台挂了，DNS 仍可能返回它的 IP）。

### 加权 DNS

通过 DNS 服务商（如 AWS Route53、阿里云 DNS）设置权重，按比例分配流量到不同 IP。可做灰度发布、A/B 测试。

### DNS 负载均衡的局限

| 局限 | 说明 |
|------|------|
| 不感知健康 | 服务器挂了 DNS 仍返回其 IP（需配合健康检查） |
| 缓存导致不均 | 客户端缓存 IP，长期固定访问一台 |
| 粒度粗 | 只能按域名分流，不能按 URL/Header 分流 |

所以 DNS 负载均衡常作为"第一层"全局分流，配合 LVS/Nginx 做"第二层"精细负载均衡。

---

## 智能 DNS 与 GSLB

### 智能 DNS（GSLB - Global Server Load Balancing）

根据用户来源返回不同 IP：
- **就近访问**：北方用户解析到北京机房，南方用户解析到上海机房。
- **运营商分流**：电信用户返回电信 IP，联通用户返回联通 IP（避免跨网访问慢）。
- **故障切换**：某机房故障，DNS 自动摘除其 IP。

CDN（内容分发网络）大量使用智能 DNS 把用户导向最近的边缘节点。

\`\`\`
用户(北京) --查询--> 智能DNS --返回--> 北京节点 IP
用户(上海) --查询--> 智能DNS --返回--> 上海节点 IP
\`\`\`

### 智能 DNS 的实现

智能 DNS 通过 EDNS Client Subnet（ECS）协议获取用户 IP 段，据此判断地理位置/运营商，返回对应 IP。主流 DNS 服务商（Route53、阿里云、DNSPod）都支持。

### DNS vs 其他负载均衡

| 方式 | 层级 | 优点 | 缺点 |
|------|------|------|------|
| DNS 负载均衡 | DNS | 全局、简单 | 不感知健康、缓存延迟 |
| 四层 LB（LVS） | 传输层 | 高性能、感知健康 | 单机房 |
| 七层 LB（Nginx） | 应用层 | 灵活、可按内容路由 | 性能略低 |

实际架构中三层并用：DNS 全局分流 → LVS 机房内四层转发 → Nginx 应用层路由。

---

## DNS 安全

DNS 设计于互联网早期（1983 年），默认不加密、不验证，存在多种安全问题。

### DNS 劫持/污染

- **劫持**：ISP 或中间人篡改 DNS 响应，把域名指向错误 IP（常用于广告、审查）。如输入正确域名却跳到广告页。
- **污染（缓存投毒）**：攻击者伪造 DNS 响应注入错误记录到缓存。比劫持更隐蔽，影响所有使用该缓存的用户。

### DNSSEC（DNS Security Extensions）

用数字签名验证 DNS 响应的真实性和完整性，防止伪造。它不加密内容，只保证"这个响应确实来自权威方且未被篡改"。

工作原理：权威服务器用私钥对记录签名，递归解析器用公钥验签。签名链从根逐级验证（信任锚是根的公钥）。

缺点：部署率仍偏低，因配置复杂；只防篡改不防窃听；签名增加响应大小。

### DoH（DNS over HTTPS）

通过 HTTPS 通道传输 DNS 查询，**加密**查询内容，防止窃听和篡改。主流浏览器（Chrome/Firefox）已默认支持。端口 443，难被识别和拦截。

\`\`\`
传统 DNS：客户端 --明文查询(53)--> DNS服务器   （可窃听、可劫持）
DoH      ：客户端 --HTTPS加密(443)--> DNS服务器 （加密防窃听、TLS防篡改）
\`\`\`

### DoT（DNS over TLS）

通过 TLS 加密 DNS 查询，端口 853。与 DoH 类似但传输层不同（DoH 走 HTTP/2，DoT 直接 TLS）。DoH 更隐蔽（混在 HTTPS 流量里），DoT 更高效（少一层 HTTP）。

### 安全方案对比

| 方案 | 加密 | 验证 | 部署 | 主要解决 |
|------|------|------|------|---------|
| 传统 DNS | 否 | 否 | 普及 | — |
| DNSSEC | 否 | 是 | 偏低 | 伪造/篡改 |
| DoH | 是 | 否 | 增长中 | 窃听/劫持 |
| DoT | 是 | 否 | 增长中 | 窃听/劫持 |

理想方案是 DNSSEC + DoH/DoT 组合：既加密又验证。但实际部署复杂，普及还需时间。

### DNS 放大攻击

攻击者伪造源 IP（受害者 IP），向开放 DNS 服务器发小查询，DNS 返回大响应到受害者，放大流量进行 DDoS。防御：DNS 服务器关闭递归（只对自己的用户递归）、响应速率限制。

---

## 常见 DNS 命令

### dig（最强大）

\`\`\`bash
# 基本查询
dig www.example.com
# 查指定记录类型
dig example.com MX        # 查 MX 记录
dig example.com NS        # 查 NS 记录
dig example.com TXT       # 查 TXT 记录
dig -x 1.2.3.4            # 反向解析
# 指定 DNS 服务器
dig @8.8.8.8 www.example.com
# 只看答案
dig +short www.example.com
# 跟踪完整解析路径
dig +trace www.example.com
\`\`\`

### nslookup（跨平台）

\`\`\`bash
nslookup www.example.com
nslookup -type=mx example.com
\`\`\`

### host（简单）

\`\`\`bash
host www.example.com
host -t mx example.com
\`\`\`

### 排查思路

1. \`dig\` 看解析结果对不对。
2. \`dig +trace\` 看解析路径哪一步出错。
3. \`dig @8.8.8.8\` 换公共 DNS 对比，判断是不是本地 DNS 缓存问题。
4. \`nslookup -type=ns\` 看 NS 是否正确。

---

## CDN 与 DNS 的关系

CDN（Content Delivery Network，内容分发网络）把内容缓存在全球边缘节点，用户就近访问，加速。DNS 是 CDN 调度的核心机制。

### CDN 工作流程

1. 用户访问 \`www.example.com\`。
2. DNS 解析时，\`www.example.com\` 是 CNAME，指向 CDN 厂商域名（如 \`www.example.com.cdn.cloudflare.net\`）。
3. CDN 的智能 DNS 根据用户位置，返回最近的边缘节点 IP。
4. 用户直接访问边缘节点，命中缓存则返回，未命中则回源站。

\`\`\`
用户 → DNS解析 → CNAME指向CDN → 智能DNS返回就近节点 → 边缘节点(缓存/回源)
\`\`\`

所以接入 CDN 通常就是改一条 DNS 记录（把域名 CNAME 到 CDN 厂商），DNS 完成调度。这也是为什么"改 DNS 接入 CDN"是常见操作。

---

## 常见坑与实战要点

1. **设置合理 TTL**：核心域名用较长 TTL，频繁切换的用短 TTL。
2. **避免 CNAME 链过长**：增加解析延迟，建议控制在 2 跳内。
3. **多 NS 冗余**：域名至少配两个权威 NS，避免单点。
4. **连接超时排查**：先确认 DNS 是否解析正常（\`nslookup\`/\`dig\`），再查网络。
5. **客户端 DNS 缓存**：长连接服务可在本地缓存 DNS 结果，但要注意 TTL 和故障切换（JVM 默认永久缓存，需配 \`networkaddress.cache.ttl\`）。
6. **域名即配置**：用域名而非 IP 配置服务地址，便于迁移和负载均衡。
7. **DNS 变更要预留 TTL**：改 IP 前先调小 TTL，变更后再调回。
8. **警惕 DNS 劫持**：用 DoH/HTTPDNS（移动端）防劫持。

---

## 面试题精选

**Q1：DNS 解析的完整流程？**
答：浏览器缓存→OS 缓存→hosts 文件→本地 DNS（递归）→根→TLD→权威→返回并缓存。客户端到本地DNS 是递归，本地DNS 到各级是迭代。

**Q2：递归查询和迭代查询的区别？**
答：递归是"帮我查到底"，对方负责查到答案返回；迭代是"告诉我下一步问谁"，自己逐级问。客户端→本地DNS 递归，本地DNS→根/TLD/权威 迭代。

**Q3：DNS 为什么是分布式的？**
答：性能（单一服务器扛不住全球查询）、容错（无单点）、管理自治（各层各自管理）。分层让负载和责任分散。

**Q4：DNS 劫持怎么防？**
答：DoH/DoT 加密查询防窃听篡改；DNSSEC 验证响应真实性；HTTPDNS（绕过运营商 DNS，直接 HTTP 请求获取解析）防劫持，移动端常用。

**Q5：TTL 怎么设？**
答：读多写少、变更少的大 TTL（3600s+）保性能；频繁切换的小 TTL（60s）保时效。变更前先调小 TTL 让变更快速生效。

**Q6：CNAME 和 A 记录的区别？**
答：A 记录直接指向 IP，CNAME 指向另一个域名（要再解析）。CNAME 灵活（迁移只改目标），但增加一跳解析延迟，且不能与 A/MX 等共存于同一域名。

---

## 生产案例

**案例一：DNS 缓存导致灰度失败**
某服务用 DNS 切流量灰度，调了新 IP，但部分用户仍访问旧 IP——本地 DNS 在 TTL 内缓存了旧记录。
**解决**：灰度前提前调小 TTL；用 HTTPDNS 绕过本地 DNS 缓存；客户端缩短 DNS 缓存时间。

**案例二：运营商 DNS 劫持**
某地用户访问网站被跳到广告页，因运营商 DNS 劫持。
**解决**：接入 HTTPDNS（移动端）；启用 DoH；向运营商投诉。

**案例三：NS 配置错误导致域名无法解析**
某域名改 NS 时漏配，导致所有解析失败，网站不可访问。
**解决**：改 NS 前先在新 NS 配好所有记录；变更后用 \`dig\` 验证；保留旧 NS 一段时间作为回退。

**案例四：CNAME 链过长导致解析慢**
某域名 CNAME 多跳，首屏解析 200ms+。
**解决**：减少 CNAME 跳数；CDN 域名直接 A 记录；客户端 DNS 预解析。

## 六、DNS 完整解析流程

### 6.1 浏览器到权威 DNS 的完整链路

\`\`\`
用户输入 www.example.com
  ↓
1. 浏览器 DNS 缓存（Chrome: chrome://net-internals/#dns）
  ↓ 未命中
2. 操作系统 DNS 缓存（/etc/hosts 优先）
  ↓ 未命中
3. 本地 DNS Resolver（系统配置的 DNS 服务器，如 8.8.8.8）
  ↓ 递归查询开始
4. 根 DNS 服务器（.）→ 返回 .com TLD 服务器地址
  ↓
5. .com TLD 服务器 → 返回 example.com 权威服务器地址
  ↓
6. example.com 权威服务器 → 返回 www.example.com 的 A 记录
  ↓
7. Resolver 缓存结果（按 TTL），返回给操作系统
  ↓
8. 操作系统缓存，返回给浏览器
  ↓
9. 浏览器缓存，开始 TCP 连接
\`\`\`

### 6.2 递归查询 vs 迭代查询

**递归查询**：客户端 → Resolver（"帮我查到底"）
**迭代查询**：Resolver → 根/TLD/权威（"查不到告诉我下一步找谁"）

\`\`\`
客户端 ──递归──→ Resolver ──迭代──→ 根服务器
                    ←──返回TLD地址──
                ──迭代──→ TLD服务器
                    ←──返回权威地址──
                ──迭代──→ 权威服务器
                    ←──返回A记录──
客户端 ←──返回结果── Resolver
\`\`\`

### 6.3 多语言 DNS 解析代码

**Java DNS 解析**：

\`\`\`java
// 简单解析
InetAddress[] addrs = InetAddress.getAllByName("www.example.com");
for (InetAddress addr : addrs) {
    System.out.println(addr.getHostAddress());
}

// 指定 DNS 服务器解析
Properties env = new Properties();
env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
env.put("java.naming.provider.url", "dns://8.8.8.8");
DirContext ctx = new InitialDirContext(env);
Attributes attrs = ctx.getAttributes("www.example.com", new String[]{"A"});
Attribute attr = attrs.get("A");
if (attr != null) {
    for (int i = 0; i < attr.size(); i++) {
        System.out.println(attr.get(i));
    }
}
\`\`\`

**Go DNS 解析**：

\`\`\`go
// 标准解析
addrs, _ := net.LookupHost("www.example.com")
fmt.Println(addrs)

// 指定 DNS 服务器
r := &net.Resolver{
    PreferGo: true,
    Dial: func(ctx context.Context, network, address string) (net.Conn, error) {
        d := net.Dialer{Timeout: 5 * time.Second}
        return d.DialContext(ctx, "udp", "8.8.8.8:53")
    },
}
addrs, _ = r.LookupHost(context.Background(), "www.example.com")

// 使用 miekg/dns 库（更底层）
msg := new(dns.Msg)
msg.SetQuestion("www.example.com.", dns.TypeA)
resp, _, _ := new(dns.Client).Exchange(msg, "8.8.8.8:53")
for _, ans := range resp.Answer {
    if a, ok := ans.(*dns.A); ok {
        fmt.Println(a.A)
    }
}
\`\`\`

**Python DNS 解析**：

\`\`\`python
import socket

# 标准解析
addrs = socket.getaddrinfo('www.example.com', 80)
for addr in addrs:
    print(addr[4][0])

# 使用 dnspython 库
import dns.resolver

resolver = dns.resolver.Resolver()
resolver.nameservers = ['8.8.8.8']

# A 记录
answers = resolver.resolve('www.example.com', 'A')
for rdata in answers:
    print(rdata.address)

# MX 记录
answers = resolver.resolve('example.com', 'MX')
for rdata in answers:
    print(f"优先级:{rdata.preference} 服务器:{rdata.exchange}")

# TXT 记录
answers = resolver.resolve('example.com', 'TXT')
for rdata in answers:
    print(rdata.strings)
\`\`\`

## 七、DNS 记录类型完整详解

### 7.1 记录类型总表

| 类型 | 全称 | 用途 | 示例 |
|------|------|------|------|
| A | Address | 域名→IPv4 | www IN A 93.184.216.34 |
| AAAA | IPv6 Address | 域名→IPv6 | www IN AAAA 2606:2800:220:1:... |
| CNAME | Canonical Name | 域名别名 | www IN CNAME example.com |
| MX | Mail Exchange | 邮件服务器 | example.com IN MX 10 mail.example.com |
| TXT | Text | 任意文本 | example.com IN TXT "v=spf1 -all" |
| NS | Name Server | 权威DNS服务器 | example.com IN NS ns1.example.com |
| PTR | Pointer | IP→域名（反向） | 34.216.184.93.in-addr.arpa IN PTR www.example.com |
| SRV | Service | 服务定位 | _sip._tcp IN SRV 10 60 5060 sip.example.com |
| SOA | Start of Authority | 区域权威信息 | example.com IN SOA ns1 admin (2026010101 7200 3600 1209600 3600) |
| CAA | CA Authorization | 指定允许的CA | example.com IN CAA 0 issue "letsencrypt.org" |
| AXFR | Zone Transfer | 区域传送 | （特殊查询，非记录） |
| DNSKEY | DNS Key | DNSSEC 公钥 | （DNSSEC 相关） |
| RRSIG | Signature | DNSSEC 签名 | （DNSSEC 相关） |

### 7.2 A 记录与 AAAA 记录

\`\`\`
; A 记录：域名 → IPv4
www.example.com.    IN  A     93.184.216.34
api.example.com.    IN  A     93.184.216.35
                    IN  A     93.184.216.36  ; 多A记录 = DNS轮询

; AAAA 记录：域名 → IPv6
www.example.com.    IN  AAAA  2606:2800:220:1:248:1893:25c8:1946
\`\`\`

**多 A 记录的 DNS 轮询**：DNS 服务器轮转返回 IP 顺序，实现简单负载均衡。缺点：不感知服务器健康状态、不感知地理距离。

### 7.3 CNAME 记录

CNAME 将一个域名映射到另一个域名（别名）。

\`\`\`
; CNAME 链
blog.example.com.   IN  CNAME  example.github.io.
example.github.io.  IN  CNAME  github.map.fastly.net.
github.map.fastly.net. IN A     151.101.1.6
\`\`\`

**CNAME 限制**：
1. CNAME 不能与其他记录共存（MX、NS 等不能和 CNAME 同时存在于同一域名）
2. CNAME 不能指向 IP，只能指向域名
3. 邮件域（MX 记录的域）不建议用 CNAME

**CNAME vs ALIAS/ANAME**：
- CNAME：标准 DNS 记录，但有上述限制
- ALIAS/ANAME：DNS 提供商的扩展功能，在_zone apex_（根域）上模拟 CNAME

### 7.4 MX 记录

\`\`\`
example.com.    IN  MX  10  mail1.example.com.   ; 优先级10
example.com.    IN  MX  20  mail2.example.com.   ; 优先级20（备用）
\`\`\`

**优先级**：数字越小优先级越高。mail1 不可用时尝试 mail2。

### 7.5 TXT 记录

TXT 记录用于存储任意文本，常见用途：

\`\`\`
; SPF（发件人策略框架）——防止邮件伪造
example.com.  IN  TXT  "v=spf1 ip4:192.168.1.0/24 include:_spf.google.com -all"

; DKIM（域名密钥识别邮件）
default._domainkey.example.com.  IN  TXT  "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3..."

; DMARC
_dmarc.example.com.  IN  TXT  "v=DMARC1; p=reject; rua=mailto:dmarc@example.com"

; 域名所有权验证
example.com.  IN  TXT  "google-site-verification=abc123..."

; ACME DNS-01 验证
_acme-challenge.example.com.  IN  TXT  "challenge_token_here"
\`\`\`

### 7.6 SRV 记录

SRV 记录指定服务的位置（主机+端口）。

\`\`\`
; _service._proto.name  IN  SRV  priority weight port target
_sip._tcp.example.com.       IN  SRV  10  60  5060  sip1.example.com.
_sip._tcp.example.com.       IN  SRV  10  40  5060  sip2.example.com.
_xmpp-server._tcp.example.com. IN SRV 5  0  5269  xmpp.example.com.
\`\`\`

**Active Directory 大量使用 SRV 记录**：

\`\`\`
_ldap._tcp.dc._msdcs.example.com. IN SRV 0 100 389 dc1.example.com.
\`\`\`

### 7.7 SOA 记录

\`\`\`
example.com. IN SOA ns1.example.com. admin.example.com. (
    2026011501  ; Serial（序列号，每次修改+1）
    7200        ; Refresh（从服务器刷新间隔，秒）
    3600        ; Retry（刷新失败重试间隔）
    1209600     ; Expire（从服务器数据过期时间，14天）
    3600        ; Minimum TTL（否定缓存TTL，1小时）
)
\`\`\`

### 7.8 CAA 记录

\`\`\`
example.com.  IN  CAA  0 issue "letsencrypt.org"      ; 只允许 Let's Encrypt 签发
example.com.  IN  CAA  0 issuewild ";"                 ; 不允许通配符证书
example.com.  IN  CAA  0 iodef "mailto:security@example.com"  ; 违规报告
\`\`\`

## 八、DNS 层次结构深度解析

### 8.1 全球根 DNS 服务器

全球共 13 组根服务器（A-M），通过 Anycast 扩展到上千个节点。

| 字母 | 运营方 | 位置示例 |
|------|--------|----------|
| A | Verisign | 全球 |
| B | USC-ISI | 美国 |
| C | Cogent | 全球 |
| D | University of Maryland | 美国 |
| E | NASA | 美国 |
| F | ISC（互联网系统协会） | 全球 |
| G | US DOD | 美国 |
| H | US Army | 美国 |
| I | Netnod | 全球 |
| J | Verisign | 全球 |
| K | RIPE NCC | 全球 |
| L | ICANN | 全球 |
| M | WIDE Project | 全球 |

**为什么是 13 组？**：DNS 响应必须在一个 UDP 包内（512 字节），13 组根服务器地址刚好填满。

### 8.2 TLD（顶级域）分类

| 类型 | 示例 | 管理 |
|------|------|------|
| gTLD（通用） | .com .net .org .info | ICANN 授权注册商 |
| ccTLD（国家代码） | .cn .us .jp .uk | 各国注册局 |
| new gTLD（新通用） | .app .dev .cloud .shop | ICANN 新增 |
| sTLD（赞助） | .edu .gov .mil | 特定机构管理 |

### 8.3 区域传送（Zone Transfer）

主从 DNS 服务器之间同步数据。

\`\`\`
; AXFR（完整区域传送）
dig @ns1.example.com example.com AXFR

; IXFR（增量区域传送，只传变化部分）
dig @ns1.example.com example.com IXFR
\`\`\`

**BIND 主从配置**：

\`\`\`zone
// 主服务器
zone "example.com" {
    type master;
    file "/etc/bind/db.example.com";
    allow-transfer { 192.168.1.2; };  // 允许从服务器传送
    also-notify { 192.168.1.2; };     // 变更时通知从服务器
};

// 从服务器
zone "example.com" {
    type slave;
    masters { 192.168.1.1; };
    file "/var/cache/bind/db.example.com";
};
\`\`\`

## 九、DNS 负载均衡与 GSLB

### 9.1 DNS 负载均衡

**轮询（Round Robin）**：

\`\`\`
api.example.com.  IN  A  1.1.1.1
api.example.com.  IN  A  2.2.2.2
api.example.com.  IN  A  3.3.3.3
\`\`\`

DNS 服务器轮转返回 IP 顺序，客户端分散到不同服务器。

**缺点**：
1. 不感知服务器健康（宕机的 IP 仍可能返回）
2. 不感知负载（忙的更忙、闲的更闲）
3. 缓存导致不均匀（Resolver 缓存后不再轮询）

### 9.2 智能 DNS（GeoDNS）

根据客户端 IP 地理位置返回不同 IP。

\`\`\`
请求来自中国 → 返回北京机房 IP
请求来自美国 → 返回美西机房 IP
请求来自欧洲 → 返回法兰克福机房 IP
\`\`\`

**BIND GeoIP 配置**：

\`\`\`zone
view "china" {
    match-clients { CN; };
    zone "api.example.com" {
        type master;
        file "/etc/bind/zones/cn/api.zone";  // 北京IP
    };
};

view "us" {
    match-clients { US; };
    zone "api.example.com" {
        type master;
        file "/etc/bind/zones/us/api.zone";  // 美西IP
    };
};

view "default" {
    zone "api.example.com" {
        type master;
        file "/etc/bind/zones/default/api.zone";  // 默认IP
    };
};
\`\`\`

### 9.3 GSLB（全局服务器负载均衡）

GSLB 综合考虑地理位置、服务器健康、负载、网络延迟，动态返回最优 IP。

**GSLB 工作流程**：

\`\`\`
1. 客户端查询 api.example.com
2. Local DNS 将请求转发到 GSLB 设备
3. GSLB 检查：
   - Local DNS 的 IP 地理位置
   - 各机房的实时健康状态
   - 各机房的实时负载
   - 网络延迟（RTT）
4. 返回最优机房的 IP
5. 如果最优机房宕机，自动切换到备用机房
\`\`\`

**Java 实现 DNS 健康检查**：

\`\`\`java
public class DnsHealthChecker {
    private final Map<String, Boolean> healthMap = new ConcurrentHashMap<>();
    private final List<String> servers;

    public DnsHealthChecker(List<String> servers) {
        this.servers = servers;
        startHealthCheck();
    }

    private void startHealthCheck() {
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        scheduler.scheduleAtFixedRate(() -> {
            for (String server : servers) {
                try (Socket socket = new Socket()) {
                    socket.connect(new InetSocketAddress(server, 8080), 2000);
                    healthMap.put(server, true);
                } catch (Exception e) {
                    healthMap.put(server, false);
                }
            }
        }, 0, 5, TimeUnit.SECONDS);
    }

    public String getHealthyServer() {
        List<String> healthy = servers.stream()
            .filter(s -> healthMap.getOrDefault(s, false))
            .collect(Collectors.toList());
        if (healthy.isEmpty()) throw new RuntimeException("无可用服务器");
        // 轮询选择
        return healthy.get(new Random().nextInt(healthy.size()));
    }
}
\`\`\`

## 十、DNS 安全

### 10.1 DNS 劫持

攻击者篡改 DNS 响应，将域名指向恶意 IP。

**类型**：
1. **路由器 DNS 劫持**：入侵路由器修改 DNS 设置
2. **ISP DNS 劫持**：运营商插入广告或重定向
3. **中间人 DNS 劫持**：ARP 欺骗 + DNS 投毒

**防御**：
- 使用可信 DNS（8.8.8.8、1.1.1.1）
- DoH/DoT 加密 DNS 查询
- DNSSEC 验证响应真实性

### 10.2 DNS 污染（DNS Poisoning）

攻击者伪造 DNS 响应包，抢先于真实响应到达客户端。

**防御**：DNSSEC（对 DNS 响应签名）、随机化源端口（增加猜测难度）。

### 10.3 DNSSEC

DNSSEC 通过数字签名保证 DNS 响应的真实性和完整性。

\`\`\`
DNSSEC 签名链：
根域 KSK → 签名根域 ZSK → 签名 .com DS 记录
→ .com KSK → 签名 .com ZSK → 签名 example.com DS 记录
→ example.com KSK → 签名 example.com ZSK → 签名 A 记录 (RRSIG)

验证过程：
1. 收到 A 记录 + RRSIG 签名
2. 用 example.com 的 ZSK 验证签名
3. 用 example.com 的 KSK 验证 ZSK
4. 用 .com 的 DS 记录验证 KSK
5. 逐级向上验证到根域
\`\`\`

**DNSSEC 记录类型**：
- DNSKEY：DNS 公钥
- RRSIG：资源记录签名
- DS：Delegation Signer（父域对子域 KSK 的哈希）
- NSEC/NSEC3：否定存在证明（证明某记录不存在）

### 10.4 DoH（DNS over HTTPS）与 DoT（DNS over TLS）

加密 DNS 查询，防止窃听和篡改。

**DoT**：DNS 查询通过 TLS 加密，端口 853。

\`\`\`
客户端 ──TLS──→ DoT 服务器（8.8.8.8:853）
\`\`\`

**DoH**：DNS 查询通过 HTTPS，端口 443。

\`\`\`
GET https://dns.google/resolve?name=example.com&type=A
Accept: application/dns-json
\`\`\`

**Java DoH 客户端**：

\`\`\`java
public static List<String> resolveDoH(String domain) throws Exception {
    String url = "https://dns.google/resolve?name=" + domain + "&type=A";
    HttpClient client = HttpClient.newHttpClient();
    HttpRequest req = HttpRequest.newBuilder()
        .uri(URI.create(url))
        .header("Accept", "application/dns-json")
        .GET()
        .build();
    HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
    
    // 解析 JSON 响应
    JSONObject json = new JSONObject(resp.body());
    JSONArray answers = json.getJSONArray("Answer");
    List<String> ips = new ArrayList<>();
    for (int i = 0; i < answers.length(); i++) {
        JSONObject ans = answers.getJSONObject(i);
        if (ans.getInt("type") == 1) {  // A 记录
            ips.add(ans.getString("data"));
        }
    }
    return ips;
}
\`\`\`

**Go DoH 客户端**：

\`\`\`go
func resolveDoH(domain string) ([]string, error) {
    url := fmt.Sprintf("https://cloudflare-dns.com/dns-query?name=%s&type=A", domain)
    resp, err := http.DefaultClient.Get(url)
    if err != nil { return nil, err }
    defer resp.Body.Close()
    
    var result struct {
        Answer []struct {
            Type int    \`json:"type"\`
            Data string \`json:"data"\`
        } \`json:"Answer"\`
    }
    json.NewDecoder(resp.Body).Decode(&result)
    
    var ips []string
    for _, ans := range result.Answer {
        if ans.Type == 1 {
            ips = append(ips, ans.Data)
        }
    }
    return ips, nil
}
\`\`\`

## 十一、DNS 性能优化与缓存策略

### 11.1 DNS 缓存层级

\`\`\`
浏览器缓存（Chrome ~1分钟）
  ↓
操作系统缓存（systemd-resolved / dnsmasq）
  ↓
路由器缓存（家用路由器）
  ↓
ISP DNS 缓存（递归解析器）
  ↓
权威 DNS（无缓存，实时响应）
\`\`\`

### 11.2 TTL 策略

\`\`\`
TTL = 3600（1小时）
  → 变更后最多 1 小时生效
  → 适合稳定的服务

TTL = 60（1分钟）
  → 变更后最多 1 分钟生效
  → 适合需要快速切换的场景
  → 但会增加 DNS 查询量

TTL = 86400（1天）
  → 变更后最多 1 天生效
  → 适合几乎不变的记录
  → 最大化缓存命中
\`\`\`

**TTL 最佳实践**：
- 即将变更前，提前降低 TTL（如从 3600 降到 60）
- 变更完成且稳定后，恢复 TTL
- 不要设为 0（每次都查，性能极差）

### 11.3 否定缓存

域名不存在时，DNS 也会缓存"不存在"这个结果（Negative Cache）。

\`\`\`
查询 notexist.example.com → NXDOMAIN
→ 缓存 NXDOMAIN，TTL = SOA 记录中的 Minimum 值
\`\`\`

**Java 否定缓存控制**：

\`\`\`java
// 设置否定缓存 TTL（秒）
System.setProperty("networkaddress.cache.negative.ttl", "10");

// 设置正向缓存 TTL
System.setProperty("networkaddress.cache.ttl", "30");
\`\`\`

### 11.4 DNS 预解析

浏览器在用户点击链接前就解析域名，减少延迟。

\`\`\`html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//api.example.com">
<link rel="dns-prefetch" href="//cdn.example.com">
<link rel="dns-prefetch" href="//analytics.example.com">

<!-- 预连接（DNS + TCP + TLS） -->
<link rel="preconnect" href="https://api.example.com">
\`\`\`

## 十二、DNS 命令与工具

### 12.1 dig 命令

\`\`\`bash
# 基本查询
dig www.example.com

# 指定 DNS 服务器
dig @8.8.8.8 www.example.com

# 查询特定记录类型
dig example.com MX
dig example.com TXT
dig example.com NS
dig example.com AAAA

# 反向查询
dig -x 93.184.216.34

# 跟踪解析过程
dig +trace www.example.com

# 只显示简短结果
dig +short www.example.com

# 查询 DNSSEC
dig +dnssec www.example.com

# 指定 TCP
dig +tcp www.example.com
\`\`\`

### 12.2 nslookup 命令

\`\`\`bash
# 基本查询
nslookup www.example.com

# 交互模式
nslookup
> server 8.8.8.8
> set type=MX
> example.com
> exit

# 指定 DNS 服务器
nslookup www.example.com 8.8.8.8
\`\`\`

### 12.3 host 命令

\`\`\`bash
# 简单查询
host www.example.com

# 查询 MX
host -t MX example.com

# 反向查询
host 93.184.216.34
\`\`\`

### 12.4 Java DNS 调试

\`\`\`java
// 开启 DNS 缓存日志
System.setProperty("sun.net.spi.nameservice.nameservers", "8.8.8.8");
System.setProperty("networkaddress.cache.ttl", "10");

// 查看 DNS 缓存
// Java 不直接暴露 DNS 缓存，需用 JMX 或第三方工具

// 自定义 DNS 解析器
public class CustomDnsResolver implements DnsResolver {
    @Override
    public InetAddress[] resolve(String host) throws UnknownHostException {
        // 自定义解析逻辑
        if (host.equals("api.example.com")) {
            return new InetAddress[] {
                InetAddress.getByName("1.2.3.4")  // 固定 IP
            };
        }
        return InetAddress.getAllByName(host);  // 默认解析
    }
}
\`\`\`

## 十三、自建 DNS 与权威 DNS 配置

### 13.1 BIND 配置

\`\`\`zone
// /etc/bind/named.conf.options
options {
    directory "/var/cache/bind";
    recursion no;           // 不提供递归查询（权威DNS）
    allow-transfer { none; };  // 禁止区域传送
    dnssec-enable yes;
    dnssec-validation yes;
    listen-on { any; };
};

// /etc/bind/named.conf.local
zone "example.com" {
    type master;
    file "/etc/bind/zones/db.example.com";
    allow-transfer { 192.168.1.2; };
    also-notify { 192.168.1.2; };
};

// /etc/bind/zones/db.example.com
$TTL    3600
@       IN  SOA ns1.example.com. admin.example.com. (
            2026011501 ; Serial
            7200       ; Refresh
            3600       ; Retry
            1209600    ; Expire
            3600       ; Minimum TTL
            )

@       IN  NS      ns1.example.com.
@       IN  NS      ns2.example.com.
@       IN  MX  10  mail.example.com.
@       IN  A       93.184.216.34
www     IN  A       93.184.216.34
api     IN  A       93.184.216.35
        IN  A       93.184.216.36
ns1     IN  A       192.168.1.1
ns2     IN  A       192.168.1.2
mail    IN  A       192.168.1.10
@       IN  TXT     "v=spf1 ip4:192.168.1.0/24 -all"
\`\`\`

### 13.2 CoreDNS 配置

CoreDNS 是云原生 DNS 服务器（Kubernetes 默认 DNS）。

\`\`\`corefile
# Corefile
.:53 {
    forward . 8.8.8.8 1.1.1.1
    cache 30
    log
    errors
}

example.com:53 {
    file /etc/coredns/zones/db.example.com
    cache 30
    log
}

# 基于 etcd 的动态 DNS
.:53 {
    etcd {
        path /skydns
        endpoint https://etcd:2379
    }
    cache 30
}
\`\`\`

## 十四、CDN 与 DNS

### 14.1 CDN DNS 工作流程

\`\`\`
1. 用户访问 www.example.com
2. DNS 解析：www.example.com CNAME → www.example.com.cdn.cloudflare.net
3. CDN 的智能 DNS 返回离用户最近的边缘节点 IP
4. 用户直接访问边缘节点
5. 边缘节点缓存命中 → 直接返回
6. 缓存未命中 → 回源获取 → 缓存 → 返回
\`\`\`

### 14.2 CDN DNS 配置

\`\`\`
; 在权威 DNS 配置 CNAME 到 CDN
www.example.com.  IN  CNAME  www.example.com.cdn.cloudflare.net.
\`\`\`

**Cloudflare DNS API**：

\`\`\`python
import requests

# 添加 DNS 记录
headers = {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json"
}
data = {
    "type": "A",
    "name": "api.example.com",
    "content": "1.2.3.4",
    "ttl": 120,
    "proxied": True  # 启用 CDN 代理
}
resp = requests.post(
    "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records",
    headers=headers, json=data
)
\`\`\`

## 十五、DNS 面试题与生产案例

### 15.1 高频面试题

**Q1: 改了 DNS 记录为什么不是立即生效？**

DNS 是分布式缓存系统。各层缓存按 TTL 过期。如果之前 TTL=3600，最长等 1 小时。如果 ISP DNS 不遵守 TTL（强制缓存更久），可能更久。

**Q2: 为什么有的用户访问旧 IP？**

1. Local DNS 不遵守 TTL，缓存过久
2. 操作系统/浏览器 DNS 缓存未过期
3. 应用层 DNS 缓存（如 JVM 的 networkaddress.cache.ttl）

**Q3: DNS 用 UDP 还是 TCP？**

默认 UDP（快、无连接）。超过 512 字节用 TCP。区域传送用 TCP。DoT 用 TCP。

**Q4: 一个域名可以配多个 A 记录吗？**

可以。DNS 服务器会轮询返回，实现负载均衡。但 DNS 轮询不感知健康状态，宕机的 IP 仍可能被返回。

**Q5: DNS 根服务器只有 13 组，够用吗？**

13 是逻辑数量（字母 A-M），实际通过 Anycast 有上千个物理节点。而且 512 字节 UDP 限制是历史原因，现在有 EDNS0 可扩展。

### 15.2 生产案例

**案例一：DNS 缓存导致切换不生效**

线上从旧 IP 切到新 IP，TTL 设为 3600。部分用户 1 小时后仍访问旧 IP。

**排查**：发现 ISP DNS 不遵守 TTL，强制缓存 24 小时。
**解决**：提前 24 小时降低 TTL 到 60，切换后大部分用户 1 分钟生效；个别 ISP 的用户等 24 小时自然过期。

**案例二：DNS 解析慢导致 API 延迟**

Java 应用每次请求都做 DNS 查询，DNS 服务器响应慢导致 P99 延迟飙升。

**排查**：JVM DNS 缓存 TTL 默认 30 秒（安全策略限制），且 DNS 服务器偶尔超时。
**解决**：增大 JVM DNS 缓存 TTL 到 300 秒；配置本地 DNS 缓存（dnsmasq）；使用连接池复用连接（避免重复 DNS）。

**案例三：CNAME 链过长导致解析超时**

\`a.example.com → b.cdn.net → c.cdn.net → d.cdn.net → 1.2.3.4\`

CNAME 链 4 层，每层都要查询，总耗时 200ms。

**解决**：减少 CNAME 层数；预解析；使用 DNS 缓存。

**案例四：DNS 劫持导致访问钓鱼网站**

用户反馈访问某网站被重定向到广告页。排查发现路由器 DNS 被改为恶意服务器。

**解决**：使用 DoH/DoT 加密 DNS；路由器修改默认密码；安装 DNSSEC 验证。

**案例五：Split-Horizon DNS（内外网分离）**

内网用户解析 \`intranet.example.com\` 返回内网 IP（10.0.0.1），外网用户返回公网 IP（93.184.216.34）。

\`\`\`zone
// BIND view 配置
view "internal" {
    match-clients { 10.0.0.0/8; };
    zone "example.com" {
        type master;
        file "/etc/bind/zones/internal/db.example.com";  // 内网IP
    };
};

view "external" {
    match-clients { any; };
    zone "example.com" {
        type master;
        file "/etc/bind/zones/external/db.example.com";  // 公网IP
    };
};
\`\`\`

> **DNS 终极心法**：DNS 是互联网的基础设施，看似简单实则精妙。它的分布式、分层、缓存设计支撑了全球互联网的域名解析。理解 DNS 的缓存机制（TTL）、解析流程（递归/迭代）、安全机制（DNSSEC/DoH），是后端工程师排查网络问题的基本功。记住：DNS 变更永远要考虑缓存——"改了 DNS 不等于立即生效"。


## 十六、Kubernetes 中的 DNS

### 16.1 K8s DNS 架构

Kubernetes 集群内置 CoreDNS，为 Pod 和 Service 提供名称解析。

\`\`\`
Pod 内 /etc/resolv.conf:
  nameserver 10.96.0.10      ← kube-dns Service IP
  search default.svc.cluster.local svc.cluster.local cluster.local
  options ndots:5
\`\`\`

### 16.2 Service DNS

\`\`\`yaml
# Service 定义
apiVersion: v1
kind: Service
metadata:
  name: my-service
  namespace: default
spec:
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 8080
\`\`\`

\`\`\`
# DNS 记录
my-service.default.svc.cluster.local. → ClusterIP (10.96.0.10)

# Headless Service（无 ClusterIP，直接返回 Pod IP）
my-service.default.svc.cluster.local. → Pod IP 1, Pod IP 2, Pod IP 3
\`\`\`

**Java 访问 K8s Service**：

\`\`\`java
// 通过 Service DNS 名称访问
String serviceUrl = "http://my-service.default.svc.cluster.local:80";
HttpClient client = HttpClient.newHttpClient();
HttpResponse<String> resp = client.send(
    HttpRequest.newBuilder().uri(URI.create(serviceUrl)).GET().build(),
    HttpResponse.BodyHandlers.ofString()
);
\`\`\`

### 16.3 Pod DNS

\`\`\`
# Pod 的 DNS 名称（需开启 hostname 和 subdomain）
pod-ip-addr.default.pod.cluster.local.

# 如 Pod IP 为 10.244.1.5
10-244-1-5.default.pod.cluster.local. → 10.244.1.5
\`\`\`

### 16.4 CoreDNS ConfigMap 配置

\`\`\`yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns
  namespace: kube-system
data:
  Corefile: |
    .:53 {
        errors
        health
        ready
        kubernetes cluster.local in-addr.arpa ip6.arpa {
            pods insecure
            fallthrough in-addr.arpa ip6.arpa
        }
        hosts /etc/coredns/NodeHosts {
            ttl 60
            reload 15s
            fallthrough
        }
        prometheus :9153
        forward . /etc/resolv.conf
        cache 30
        loop
        reload
        loadbalance
    }
\`\`\`

### 16.5 DNS 排障

\`\`\`bash
# 在 Pod 内测试 DNS
kubectl exec -it my-pod -- nslookup kubernetes.default

# 查看 CoreDNS 日志
kubectl logs -n kube-system -l k8s-app=kube-dns

# 检查 Pod 的 DNS 配置
kubectl exec -it my-pod -- cat /etc/resolv.conf

# 临时调试 Pod
kubectl run dnsutils --image=tutum/dnsutils -it --rm -- bash
dig @10.96.0.10 my-service.default.svc.cluster.local
\`\`\`

## 十七、DNS 监控与告警

### 17.1 关键指标

| 指标 | 含义 | 告警阈值 |
|------|------|----------|
| dns_query_total | DNS 查询总数 | 监控趋势 |
| dns_query_duration_seconds | 查询延迟 | P99 > 100ms |
| dns_response_rcode_total | 响应码统计 | SERVFAIL > 1% |
| dns_cache_hits | 缓存命中数 | 命中率 < 80% |
| dns_cache_misses | 缓存未命中数 | — |

### 17.2 Prometheus + CoreDNS 监控

\`\`\`yaml
# CoreDNS 已内置 Prometheus 指标（:9153）
# ServiceMonitor
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: coredns
spec:
  selector:
    matchLabels:
      k8s-app: kube-dns
  endpoints:
  - port: metrics
    interval: 30s
\`\`\`

**PromQL 查询示例**：

\`\`\`promql
# DNS 查询 QPS
sum(rate(coredns_dns_requests_total[1m])) by (zone)

# DNS 查询延迟 P99
histogram_quantile(0.99, 
  sum(rate(coredns_dns_request_duration_seconds_bucket[5m])) by (le))

# SERVFAIL 错误率
sum(rate(coredns_dns_responses_total{rcode="SERVFAIL"}[5m])) 
/ sum(rate(coredns_dns_responses_total[5m]))

# 缓存命中率
sum(rate(coredns_cache_hits_total[5m])) 
/ (sum(rate(coredns_cache_hits_total[5m])) + sum(rate(coredns_cache_misses_total[5m])))
\`\`\`

### 17.3 Java 应用 DNS 监控

\`\`\`java
// 自定义 DNS 解析监控
public class MonitoredDnsResolver {
    private final MeterRegistry registry;
    
    public InetAddress[] resolve(String host) throws UnknownHostException {
        Timer.Sample sample = Timer.start(registry);
        try {
            InetAddress[] addrs = InetAddress.getAllByName(host);
            sample.stop(registry.timer("dns.resolve", "host", host, "status", "success"));
            registry.counter("dns.resolve.count", "host", host, "status", "success").increment();
            return addrs;
        } catch (UnknownHostException e) {
            sample.stop(registry.timer("dns.resolve", "host", host, "status", "failure"));
            registry.counter("dns.resolve.count", "host", host, "status", "failure").increment();
            throw e;
        }
    }
}
\`\`\`

## 十八、DNS 多语言实践总结

### 18.1 各语言 DNS 解析对比

| 语言 | 标准库 | 高级库 | 特点 |
|------|--------|--------|------|
| Java | InetAddress | dnsjava | JVM DNS 缓存，安全策略限制 |
| Go | net.LookupHost | miekg/dns | PreferGo 可控制解析器 |
| Python | socket.getaddrinfo | dnspython | 简单易用 |
| Node.js | dns.resolve | dns | 内置，支持 DoH |

### 18.2 Java DNS 最佳实践

\`\`\`java
// 1. 设置合理的 DNS 缓存 TTL
System.setProperty("networkaddress.cache.ttl", "300");        // 正向缓存 5 分钟
System.setProperty("networkaddress.cache.negative.ttl", "10"); // 否定缓存 10 秒

// 2. 使用连接池避免频繁 DNS 查询
PoolingHttpClientConnectionManager cm = new PoolingHttpClientConnectionManager();
cm.setMaxTotal(100);
cm.setDefaultMaxPerRoute(20);
CloseableHttpClient client = HttpClients.custom().setConnectionManager(cm).build();

// 3. DNS 预热
try {
    InetAddress.getAllByName("api.example.com");  // 启动时预解析
} catch (UnknownHostException e) {
    log.warn("DNS 预热失败", e);
}

// 4. 自定义 DNS 解析器（如固定 IP、灰度发布）
HttpClient client = HttpClient.newBuilder()
    .resolver(new CustomDnsResolver())
    .build();
\`\`\`

### 18.3 Go DNS 最佳实践

\`\`\`go
// 1. 自定义 DNS 服务器
var resolver = &net.Resolver{
    PreferGo: true,
    Dial: func(ctx context.Context, network, address string) (net.Conn, error) {
        d := net.Dialer{Timeout: 3 * time.Second}
        return d.DialContext(ctx, "udp", "8.8.8.8:53")
    },
}

// 2. DNS 缓存
var dnsCache sync.Map
func resolveWithCache(host string) ([]string, error) {
    if ips, ok := dnsCache.Load(host); ok {
        return ips.([]string), nil
    }
    ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
    defer cancel()
    addrs, err := resolver.LookupHost(ctx, host)
    if err != nil { return nil, err }
    dnsCache.Store(host, addrs)
    // 定时过期需用额外的 goroutine
    return addrs, nil
}

// 3. HTTP 客户端自定义 DNS
dialer := &net.Dialer{
    Timeout: 5 * time.Second,
    Resolver: resolver,
}
client := &http.Client{
    Transport: &http.Transport{
        DialContext: dialer.DialContext,
    },
}
\`\`\`

> **DNS 总结心法**：DNS 是后端工程师的"必修课"。从浏览器输入域名到建立连接，DNS 是第一步。理解 DNS 的层次结构、缓存机制、安全机制，能帮你解决"为什么域名解析慢""为什么改了 DNS 不生效""为什么有的用户访问到旧 IP"等线上问题。善用 dig/nslookup/host 三件套，配合 tcpdump 抓包，DNS 问题无所遁形。


> **核心心法**：DNS 是互联网最大的分布式数据库，理解它的分层、缓存和递归机制，能帮你解释"为什么改了 DNS 半天不生效""为什么有的用户访问旧 IP"等线上问题。记住"DNS 缓存是双刃剑：保性能也致变更延迟"。

下面的可运行代码实现了一个层级化 DNS 解析模拟器：定义根服务器/TLD 服务器/权威服务器三层，存 A/CNAME/MX 记录，实现递归解析（含 CNAME 链跟随）、本地缓存（带 TTL 过期）、多记录类型查询，打印完整解析路径。`,
    code: `// DNS 递归解析模拟器
// 模拟层级化 DNS 服务器：根服务器 → TLD 服务器 → 权威服务器
// 实现递归查询、CNAME 链跟随、本地缓存（带 TTL）、多记录类型查询
// 不依赖 dns 模块，用纯对象模拟

// --- 根服务器：只知道各 TLD 的 NS ---
const rootServer = {
  name: "根服务器(.)",
  records: {
    com: { type: "NS", value: "a.gtld-servers.net" },
    net: { type: "NS", value: "a.gtld-servers.net" },
    org: { type: "NS", value: "a0.org.afilias-nst.org" },
  },
  resolve(domain) {
    const tld = domain.split(".").pop();
    const rec = this.records[tld];
    if (rec) {
      console.log("  [根服务器] " + domain + " → NS: " + rec.value + "（去问 ." + tld + "）");
      return { next: "tld:" + tld, answer: null };
    }
    console.log("  [根服务器] 未知 TLD ." + tld);
    return { next: null, answer: null };
  },
};

// --- TLD 服务器（按顶级域分组）---
const tldServers = {
  com: {
    name: "TLD服务器(.com)",
    records: {
      "example.com": { type: "NS", value: "ns1.example.com" },
      "google.com": { type: "NS", value: "ns1.google.com" },
    },
    resolve(domain) {
      if (this.records[domain]) {
        console.log("  [TLD(.com)] " + domain + " → NS: " + this.records[domain].value);
        return { next: "auth:" + domain, answer: null };
      }
      for (const zone of Object.keys(this.records)) {
        if (domain.endsWith("." + zone)) {
          console.log("  [TLD(.com)] " + domain + " → NS: " + this.records[zone].value);
          return { next: "auth:" + zone, answer: null };
        }
      }
      console.log("  [TLD(.com)] 未找到 " + domain);
      return { next: null, answer: null };
    },
  },
};

// --- 权威服务器（按域分组，存具体记录）---
const authServers = {
  "example.com": {
    name: "权威服务器(example.com)",
    records: {
      "example.com": { type: "A", value: "93.184.216.34", ttl: 3600 },
      "www.example.com": { type: "CNAME", value: "example.com", ttl: 3600 },
      "mail.example.com": { type: "MX", value: "10 mail.example.com", ttl: 3600 },
      "api.example.com": { type: "A", value: "93.184.216.35", ttl: 1800 },
    },
    resolve(domain) {
      const rec = this.records[domain];
      if (rec) {
        console.log("  [权威(example.com)] " + domain + " → " + rec.type + ": " + rec.value + " (TTL=" + rec.ttl + "s)");
        return { next: null, answer: rec };
      }
      console.log("  [权威(example.com)] " + domain + " 不存在（NXDOMAIN）");
      return { next: null, answer: null };
    },
  },
};

// --- 本地 DNS 缓存（带 TTL 过期）---
const cache = {};
function getCached(domain) {
  const c = cache[domain];
  if (!c) return null;
  if (Date.now() - c.cachedAt > c.ttl * 1000) {
    delete cache[domain]; // TTL 过期，清除
    return null;
  }
  return c;
}

// --- 递归解析器（模拟本地 DNS 服务器）---
async function resolveDomain(domain) {
  console.log("\\n🌍 解析域名: " + domain);

  // 1. 检查本地缓存
  const cached = getCached(domain);
  if (cached) {
    console.log("  ✅ 命中本地缓存: " + cached.type + " " + cached.value);
    return cached;
  }
  console.log("  缓存未命中，开始递归查询...");

  // 2. 询问根服务器
  console.log("  步骤1: 询问根服务器");
  let result = rootServer.resolve(domain);
  if (!result.next) return null;

  // 3. 询问 TLD 服务器
  if (result.next.startsWith("tld:")) {
    const tld = result.next.split(":")[1];
    console.log("  步骤2: 询问 TLD 服务器(." + tld + ")");
    result = tldServers[tld].resolve(domain);
    if (!result.next) return null;
  }

  // 4. 询问权威服务器
  if (result.next.startsWith("auth:")) {
    const zone = result.next.split(":")[1];
    console.log("  步骤3: 询问权威服务器(" + zone + ")");
    result = authServers[zone].resolve(domain);
  }

  // 5. 处理 CNAME：别名指向另一域名，递归跟随
  if (result.answer && result.answer.type === "CNAME") {
    console.log("  🔄 " + domain + " 是 CNAME → " + result.answer.value + "，继续解析...");
    const final = await resolveDomain(result.answer.value);
    if (final) { cache[domain] = { ...final, cachedAt: Date.now() }; }
    return final;
  }

  // 6. 返回最终结果并写入缓存
  if (result.answer) {
    cache[domain] = { ...result.answer, cachedAt: Date.now() };
    console.log("  ✅ 解析成功: " + domain + " → " + result.answer.value);
    return result.answer;
  }
  console.log("  ❌ 解析失败：记录不存在");
  return null;
}

// --- 执行多个解析 ---
(async () => {
  await resolveDomain("www.example.com");          // CNAME → A，递归跟随
  await resolveDomain("api.example.com");          // 直接 A 记录
  await resolveDomain("www.example.com");          // 命中本地缓存
  await resolveDomain("nonexistent.example.com");  // 不存在 NXDOMAIN
  console.log("\\n===== DNS 解析模拟结束 =====");
})();`,
  },
];