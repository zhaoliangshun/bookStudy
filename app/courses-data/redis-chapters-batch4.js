// =============================================================
// 《Redis 实战教程》- 章节批次 4
// -------------------------------------------------------------
// 内容：第四部分 高可用架构（第 15-19 章）
// =============================================================

const chapters = [
  {
    id: "redis-ch15",
    group: "第四部分 高可用架构",
    icon: "🏗️",
    title: "第 15 章 主从复制",
    content: `# 第 15 章 主从复制

单机 Redis 把所有数据放在一个节点上，一旦机器宕机，数据就没了；同时单机的吞吐量和内存容量也有上限。**主从复制（Replication）** 是 Redis 高可用的第一块基石：一主多从，写主读从，既做了数据冗余，又能水平扩展读能力。本章带你从原理到实操把主从复制搞透。

## 15.1 主从复制的原理

主从复制的核心思想是：**主节点（master）负责写，从节点（replica/slave）复制主节点的数据并对外提供读服务**。

> Redis 4.0 之后，slave 改名为 replica，命令 SLAVEOF 也推荐用 REPLICAOF 替代，但旧命令仍然兼容。

一个典型的拓扑：

\`\`\`text
            ┌────────────┐
   write ─▶│  master     │
            └─────┬──────┘
                  │ replicate
        ┌─────────┼─────────┐
        ▼         ▼         ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ replica │ │ replica │ │ replica │  ── read
   └─────────┘ └─────────┘ └─────────┘
\`\`\`

**复制的三个阶段**：

1. **建立连接**：从节点发送 PSYNC 命令给主节点
2. **全量同步**：主节点执行 BGSAVE 生成 RDB，发送给从节点
3. **命令传播**：主节点把写命令实时同步给从节点

## 15.2 全量同步 vs 增量同步

### 全量同步（Full Resync）

主节点把当前内存里的所有数据打成 RDB 快照发给从节点。过程重，主节点要 fork，从节点要清空旧数据重载。

**触发场景**：
- 从节点第一次连接主节点
- 从节点断开太久，复制积压缓冲区里没有它需要的偏移量

### 增量同步（Partial Resync）

从节点只补齐"丢失的那一段"命令。Redis 主节点维护一个**复制积压缓冲区（replication backlog）**，记录最近的写命令。从节点重连时带上自己的 offset，主节点发现 backlog 里有这个 offset 之后的内容，就只发增量。

\`\`\`bash
# 查看复制状态（在主节点执行）
127.0.0.1:6379> INFO replication
# Replication
role:master
connected_slaves:2
slave0:ip=127.0.0.1,port=6380,state=online,offset=10240,lag=0
slave1:ip=127.0.0.1,port=6381,state=online,offset=10240,lag=0
master_failover_state:no-failover
master_replid:8a7b...3c2d
master_replid2:0000...0000
master_repl_offset:10240
second_repl_offset:-1
repl_backlog_active:1
repl_backlog_size:1048576
repl_backlog_first_byte_offset:1
repl_backlog_histlen:10240
\`\`\`

关键字段含义：

| 字段 | 含义 |
| --- | --- |
| \`role\` | 节点角色，master/slave |
| \`connected_slaves\` | 在线从节点数 |
| \`master_repl_offset\` | 主节点全局复制偏移量 |
| \`repl_backlog_size\` | backlog 大小（字节） |

### PSYNC 命令

从节点连接主节点时发：

\`\`\`bash
# 参数：replid  offset
PSYNC ? -1             # 第一次连，不知道主 replid，触发全量
PSYNC <replid> <offset> # 重连，尝试增量
\`\`\`

主节点回复：
- \`+FULLRESYNC <replid> <offset>\`：要全量
- \`+CONTINUE\`：可以增量
- \`+CONTINUE <newreplid>\`：增量但 replid 变了

## 15.3 配置主从（replicaof）

### 方式一：命令行临时配置

\`\`\`bash
# 启动一个从节点，端口 6380
redis-server --port 6380 --replicaof 127.0.0.1 6379

# 或者运行时动态切换主从
redis-cli -p 6380
127.0.0.1:6380> REPLICAOF 127.0.0.1 6379
OK

# 取消复制，变回独立主
127.0.0.1:6380> REPLICAOF NO ONE
OK
\`\`\`

### 方式二：配置文件持久化

\`\`\`conf
# redis-6380.conf
port 6380
replicaof 127.0.0.1 6379

# 从节点只读（默认 yes，强烈建议保持）
replica-read-only yes

# 主节点密码
masterauth yourpassword

# 复制超时（秒），默认 60
repl-timeout 60

# 是否在主从同步时允许主节点响应请求，默认 no
# 设为 yes 会牺牲一致性，但提高主节点可用性
min-replicas-to-write 0
\`\`\`

### 验证主从

\`\`\`bash
# 主节点写
redis-cli -p 6379 SET hello world
OK

# 从节点读
redis-cli -p 6380 GET hello
"world"

# 从节点写会报错（只读）
redis-cli -p 6380 SET hello x
(error) READONLY You can't write against a read only replica.
\`\`\`

## 15.4 复制积压缓冲区

**复制积压缓冲区（replication backlog）** 是主节点上的一个固定大小的环形缓冲区，用于支持增量同步。

\`\`\`conf
# 默认 1MB，生产环境建议调大
repl-backlog-size 256mb

# backlog 释放时间，主节点掉线后多久释放 backlog（秒），默认 3600
repl-backlog-ttl 3600
\`\`\`

> **怎么估算 backlog 大小？** 假设主节点写入速度是 10MB/s，网络抖动一般不超过 30 秒，那么至少需要 300MB 才能保证短暂断线后仍能增量同步。计算公式：\`backlog_size = 每秒写入量 × 预估断线秒数 × 2（安全冗余）\`。

**backlog 太小的代价**：从节点断开稍久，offset 已被覆盖，只能全量同步。全量同步期间主节点要 fork、要传 RDB，对生产是灾难。

## 15.5 读写分离的实现

读写分离的套路：**写请求全部打主节点，读请求按业务分流到从节点**。

\`\`\`javascript
// Node.js 示例（ioredis）
const Redis = require("ioredis");

// 主节点：写
const master = new Redis({ host: "127.0.0.1", port: 6379 });

// 从节点池：读
const replicas = [
  new Redis({ host: "127.0.0.1", port: 6380 }),
  new Redis({ host: "127.0.0.1", port: 6381 }),
];

let readIdx = 0;
async function read(key) {
  const replica = replicas[readIdx++ % replicas.length];
  return replica.get(key);
}

async function write(key, val) {
  return master.set(key, val);
}
\`\`\`

> **注意：读写分离不是银弹**。由于复制是异步的，从节点可能落后主节点几百毫秒甚至几秒。对一致性敏感的读（比如下单后立刻查订单）必须读主，否则会出现"刚下单却查不到"的现象。

## 15.6 复制延迟的排查

### 看延迟

\`\`\`bash
# 主节点上执行，查看每个从节点的 lag（秒）
127.0.0.1:6379> INFO replication
slave0:ip=127.0.0.1,port=6380,state=online,offset=10240,lag=0
# lag=0 表示从节点最近 1 秒内有心跳

# 从节点上看主从偏移差
127.0.0.1:6380> INFO replication
master_link_status:up
master_last_io_seconds_ago:0
master_sync_in_progress:0
slave_repl_offset:10240
master_repl_offset:10240
\`\`\`

### 排查思路

1. **网络**：跨机房延迟大，或带宽打满
2. **慢命令**：从节点跑 KEYS *、SMEMBERS 大集合，阻塞 IO 线程
3. **主节点写入过快**：从节点 RDB 加载跟不上
4. **backlog 太小频繁全量**：看日志 \`"Partial resynchronization not possible"\`

\`\`\`bash
# 主节点慢日志
127.0.0.1:6379> SLOWLOG GET 10

# 从节点日志（启动时加 --logfile）
tail -f /var/log/redis/redis-6380.log
# 关键字：Synchronization with master started / Full resync / MASTER <-> REPLICA sync
\`\`\`

## 15.7 踩坑提示

> **坑 1：主从切换后数据丢失**。异步复制下，主节点写入后还没来得及同步就宕机，新主（被提升的从）没有这条数据。对强一致场景要配合 min-replicas-to-write。

> **坑 2：从节点 OOM**。从节点内存配得和主节点一样大，全量同步时既要收 RDB 又要维持旧数据，瞬时内存翻倍。建议从节点内存比主节点多 20%-50%。

> **坑 3：循环复制**。把 A 配成 B 的从，又把 B 配成 A 的从，Redis 5+ 有拓扑检测会拒绝，老版本可能死循环。

> **坑 4：min-replicas-to-write 误用**。配了 min-replicas-to-write 1 但从节点全挂了，主节点直接拒绝写入，业务受影响。生产慎用。

## 15.8 本章小结

- 主从复制是 Redis 高可用的基础，**一主多从、读写分离**
- 同步分**全量（PSYNC ? -1）和增量（PSYNC replid offset）**，靠 backlog 支撑增量
- 配置主从用 \`REPLICAOF\`，从节点默认只读
- backlog 大小按 \`写入速度 × 断线时间\` 估算，宁大勿小
- 复制是**异步**的，读写分离有一致性窗口，敏感读要走主
- 排查延迟看 \`INFO replication\` 的 lag 和 offset 差`
  },
  {
    id: "redis-ch16",
    group: "第四部分 高可用架构",
    icon: "🛡️",
    title: "第 16 章 哨兵 Sentinel",
    content: `# 第 16 章 哨兵 Sentinel

主从复制解决了"读扩展"和"数据冗余"，但没解决一个问题：**主节点宕机了怎么办？** 人工介入切主，几分钟甚至几十分钟的业务中断。**Sentinel（哨兵）** 就是 Redis 官方的自动故障转移方案：它盯着主从集群，主节点挂了自动把一个从节点提升为新主，并把客户端的流量切过去。本章讲透 Sentinel 的工作机制和配置。

## 16.1 Sentinel 的作用

Sentinel 是 Redis 高可用架构里的"管家"，独立于数据节点部署。它有三大职责：

1. **监控**：持续探测 master 和 replica 是否存活
2. **通知**：节点异常时通知运维或客户端
3. **自动故障转移**：master 宕机时，自动选一个 replica 升级为新 master，并通知其他 replica 和客户端

> Sentinel 自己也要高可用——**至少部署 3 个 Sentinel 节点**（奇数），避免单点故障和"脑裂"。

## 16.2 Sentinel 架构

\`\`\`text
       ┌───────────┐  ┌───────────┐  ┌───────────┐
       │ sentinel1 │  │ sentinel2 │  │ sentinel3 │
       └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
             │              │              │
             │   监控/通信   │              │
             ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │  master   │◀─│ replica1 │   │ replica2 │
       └──────────┘   └──────────┘   └──────────┘
\`\`\`

- Sentinel 之间互相通信（发布订阅 \`__sentinel__:hello\`）
- Sentinel 与 master/replica 之间保持心跳
- Sentinel 也从 master 拿到 replica 列表，自动发现从节点

## 16.3 监控与自动故障转移

### 监控机制

每个 Sentinel 每秒做三件事：

1. 向 master/replica/其他 sentinel 发 PING
2. 向 master/replica 发 INFO 拿拓扑
3. 向 \`__sentinel__:hello\` 频道发布自己的存在

### 故障转移流程

1. **主观下线（SDOWN）**：单个 Sentinel 发现 master 30 秒（默认）没回 PING，标记为 SDOWN
2. **客观下线（ODOWN）**：足够数量（quorum）的 Sentinel 都报告 SDOWN，标记为 ODOWN
3. **选举 Leader Sentinel**：Sentinel 之间用 Raft 选一个 Leader 来执行切换
4. **选新主**：Leader 从 replica 里挑一个最优的升级成 master
5. **通知**：其他 replica 改成跟新 master，通知客户端

## 16.4 配置 Sentinel

### 配置文件 sentinel.conf

\`\`\`conf
port 26379
dir /var/redis/sentinel-1

# 监控的 master：名字 IP 端口 quorum
# quorum=2 表示至少 2 个 sentinel 同意才能判定 ODOWN
sentinel monitor mymaster 127.0.0.1 6379 2

# 主节点密码
sentinel auth-pass mymaster yourpassword

# 主观下线判定毫秒数，默认 30000
sentinel down-after-milliseconds mymaster 30000

# 故障转移时同时向多少个 replica 发起复制，数字越小越稳，默认 1
sentinel parallel-syncs mymaster 1

# 故障转移超时，默认 180000ms
sentinel failover-timeout mymaster 180000
\`\`\`

### 启动 Sentinel

\`\`\`bash
# 方式一：用 sentinel 模式启动
redis-server /etc/redis/sentinel.conf --sentinel

# 方式二：用 redis-sentinel 二进制（同上，等价）
redis-sentinel /etc/redis/sentinel.conf

# 启动三个实例（26379/26380/26381）
redis-sentinel --port 26379 --sentinel monitor mymaster 127.0.0.1 6379 2
redis-sentinel --port 26380 --sentinel monitor mymaster 127.0.0.1 6379 2
redis-sentinel --port 26381 --sentinel monitor mymaster 127.0.0.1 6379 2
\`\`\`

### 查看 Sentinel 状态

\`\`\`bash
redis-cli -p 26379

# 查看 master 信息
127.0.0.1:26379> SENTINEL master mymaster
 1) "name"
 2) "mymaster"
 3) "ip"
 4) "127.0.0.1"
 5) "port"
 6) "6379"
 7) "runid"
 8) "..."
 9) "flags"
10) "master"
11) "link-pending-commands"
12) "0"
13) "link-refcount"
14) "1"
15) "last-ping-sent"
16) "0"
17) "last-ok-ping-reply"
18) "1"
19) "num-slaves"
20) "2"
21) "num-other-sentinels"
22) "2"
23) "quorum"
24) "2"

# 查看 replica 列表
127.0.0.1:26379> SENTINEL replicas mymaster

# 查看其他 sentinel
127.0.0.1:26379> SENTINEL sentinels mymaster

# 查询当前 master 地址（客户端常用）
127.0.0.1:26379> SENTINEL get-master-addr-by-name mymaster
1) "127.0.0.1"
2) "6379"
\`\`\`

## 16.5 主观下线 vs 客观下线

| 概念 | 触发条件 | 决策者 |
| --- | --- | --- |
| **主观下线 SDOWN** | 单个 Sentinel 在 \`down-after-milliseconds\` 内没收到 PING 回复 | 单个 Sentinel |
| **客观下线 ODOWN** | 至少 \`quorum\` 个 Sentinel 报告 SDOWN | Sentinel 集体 |

> **关键理解**：SDOWN 是个人意见，可能误判（网络抖动、Sentinel 自己出问题）；ODOWN 是集体决议，才触发切换。这也是为什么 quorum 不要设为 1——单点误判就切主，风险大。

\`\`\`bash
# 模拟 master 宕机
redis-cli -p 6379 SHUTDOWN NOSAVE

# 等 30 秒后看 sentinel 日志
# +sdown master mymaster 127.0.0.1 6379
# +odown master mymaster 127.0.0.1 6379 #quorum 2/2
# +new-epoch 1
# +try-failover master mymaster 127.0.0.1 6379
# +selected-slave slave 127.0.0.1:6380
# +failover-state-send-slaveof-no-one slave 127.0.0.1:6380
# +failover-state-wait-promotion slave 127.0.0.1:6380
# +promoted-slave slave 127.0.0.1:6380
# +failover-state-reconf-slaves slave mymaster 127.0.0.1 6379
# +slave-reconf-sent slave 127.0.0.1:6381
# +slave-reconf-done slave 127.0.0.1:6381
# +failover-state-wait-replicas
# +do-failover-timeout
# +failover-end master mymaster 127.0.0.1 6379
# +switch-master mymaster 127.0.0.1 6379 127.0.0.1 6380
\`\`\`

## 16.6 选举 Leader Sentinel

当 ODOWN 发生后，需要一个 Sentinel 来执行切换（避免多个 Sentinel 同时操作）。Redis 用的是 **Raft 算法的简化版**：

1. 发现 ODOWN 的 Sentinel 先给自己投一票，然后发起 \`SENTINEL is-master-down-by-addr\` 请求拉票
2. 其他 Sentinel 按"先到先得"原则回复（同一个 epoch 内只投一票）
3. 拿到**过半数票（N/2+1）** 的 Sentinel 成为 Leader
4. Leader 执行故障转移

> **为什么 Sentinel 至少 3 个且奇数？** 因为选举需要"过半数"。2 个 Sentinel 任意一个挂了都无法过半，无法选举；3 个挂 1 个还能选举；4 个和 3 个的容错能力一样（都只能挂 1 个），所以用奇数更省资源。

### 选新主的优先级

Leader 从 replica 列表里挑新主，规则按顺序：

1. **过滤**：剔除 \`S_DOWN\`、\`O_DOWN\`、\`断线\`、\`5 秒没回 PING\` 的
2. **replica-priority**：取 \`slave-priority\` 最小的（默认 100，0 永不升主）
3. **复制偏移量**：相同 priority 下，offset 最大的（数据最新）
4. **runid**：都相同则 runid 字典序最小的

\`\`\`bash
# 在 replica 配置文件里设优先级
replica-priority 100   # 默认 100，越小越优先，0 永不升主

# 在主节点上动态查看（或 sentinel 上 SENTINEL replicas）
127.0.0.1:6379> CONFIG GET replica-priority
\`\`\`

## 16.7 客户端如何连接 Sentinel

客户端**不能写死 master IP**，而是连接 Sentinel 查询 master 地址，并订阅切换通知。

\`\`\`javascript
// Node.js ioredis 示例
const Redis = require("ioredis");

const client = new Redis({
  sentinels: [
    { host: "127.0.0.1", port: 26379 },
    { host: "127.0.0.1", port: 26380 },
    { host: "127.0.0.1", port: 26381 },
  ],
  name: "mymaster",
  role: "master", // 写
  // password: "xxx",
});

// 读副本
const reader = new Redis({
  sentinels: [...],
  name: "mymaster",
  role: "slave",
});

client.on("switchmaster", () => {
  console.log("主节点切换了");
});
\`\`\`

\`\`\`python
# Python redis-py
import redis.sentinel

sentinel = redis.sentinel.Sentinel(
    [("127.0.0.1", 26379), ("127.0.0.1", 26380), ("127.0.0.1", 26381)]
)
master = sentinel.master_for("mymaster", socket_timeout=0.5)
slave = sentinel.slave_for("mymaster", socket_timeout=0.5)

master.set("hello", "world")
print(slave.get("hello"))
\`\`\`

## 16.8 踩坑提示

> **坑 1：quorum 配置不当**。3 个 Sentinel 配 quorum=2 是合理的；配 quorum=1 则单点误判就会切主；配 quorum=3 则任意一个 Sentinel 挂掉就无法切主。

> **坑 2：down-after-milliseconds 太短**。默认 30 秒，调到 5 秒看似"反应快"，实际网络抖动 5 秒很常见，会导致频繁误切主，反而把数据搞乱。

> **坑 3：客户端没订阅切换通知**。老的 jedis/redis-py 版本在切主后不会自动重连新 master，业务全挂。一定要用支持 Sentinel 的客户端版本。

> **坑 4：Sentinel 与 Redis 部署在同一台机器**。机器挂了 Sentinel 也挂了，无法切主。Sentinel 必须跨机器部署。

> **坑 5：客户端只连一个 Sentinel**。这个 Sentinel 挂了就连接不上。客户端要配 sentinel 列表，逐个尝试。

## 16.9 本章小结

- Sentinel 解决"master 宕机自动切换"，三大职责：监控、通知、故障转移
- 至少 3 个 Sentinel（奇数）跨机器部署
- 故障判定分**主观下线（SDOWN）和客观下线（ODOWN）**，ODOWN 才触发切换
- Leader Sentinel 用 Raft 选出，需**过半数票**
- 选新主按 \`priority → offset → runid\` 顺序
- 客户端连 Sentinel 而非直接连 master，并订阅切换事件
- 关键参数：\`down-after-milliseconds\`、\`quorum\`、\`parallel-syncs\`、\`failover-timeout\`**
`
  },
  {
    id: "redis-ch17",
    group: "第四部分 高可用架构",
    icon: "🌐",
    title: "第 17 章 Cluster 集群",
    content: `# 第 17 章 Cluster 集群

主从 + Sentinel 解决了"单点故障"，但还没解决"单机容量/吞吐上限"。当一台机器存不下，或者 QPS 高到单主扛不住时，就需要**Cluster 集群**：把数据分散到多个节点，每个节点负责一部分数据，整体容量和吞吐都能线性扩展。本章讲清 Cluster 的分片原理、搭建步骤和重定向机制。

## 17.1 为什么需要 Cluster

| 方案 | 容量 | 写吞吐 | 高可用 | 复杂度 |
| --- | --- | --- | --- | --- |
| 单机 | 受单机内存限 | 单核 | 无 | 低 |
| 主从 | 受单机内存限 | 单主瓶颈 | 有（手动切主） | 中 |
| Sentinel | 受单机内存限 | 单主瓶颈 | 有（自动切主） | 中 |
| **Cluster** | **可水平扩展** | **多主分散写** | 有 | 高 |

**Cluster 的核心能力**：
- **数据分片**：把 key 分散到多个 master 节点
- **去中心化**：节点间用 gossip 协议通信，无中心代理
- **自动故障转移**：每个 master 配 replica，主挂了 replica 顶上

> **注意**：Cluster 不是银弹，跨 slot 的命令（MGET、事务、Lua）受限。需要强事务的场景不适合上 Cluster。

## 17.2 数据分片（16384 槽位）

Cluster 把整个 key 空间分成 **16384 个槽（slot）**，每个节点负责一部分。key 落到哪个 slot 由算法决定：

\`\`\`text
slot = CRC16(key) mod 16384
\`\`\`

- 节点 A：slots 0-5460
- 节点 B：slots 5461-10922
- 节点 C：slots 10923-16383

**为什么是 16384？** Redis 作者 antirez 解释过：节点间 gossip 消息要带"自己负责哪些 slot"的位图，16384 bit = 2KB；如果用 65536 则要 8KB，gossip 带宽浪费。同时 16384 个 slot 已经足够支撑 1000 个节点的集群。

### 计算 key 的 slot

\`\`\`bash
# redis-cli 计算
redis-cli -c cluster keyslot hello
(integer) 866

# 手算：CRC16("hello") % 16384
\`\`\`

### Hash Tag（哈希标签）

为了让多个 key 落在同一个 slot，可以用 \`{}\` 包裹一段固定字符串，Cluster 只对 \`{}\` 里的内容做 CRC16。

\`\`\`bash
# 不带 hash tag：可能落在不同 slot，跨 slot 操作被拒
SET user:1001:profile a
SET user:1001:orders b
MGET user:1001:profile user:1001:orders   # 报错 CROSSSLOT

# 带 hash tag：保证在同一 slot
SET {user:1001}:profile a
SET {user:1001}:orders b
MGET {user:1001}:profile {user:1001}:orders  # OK
\`\`\`

> **使用场景**：用户 1001 的所有数据（profile、orders、cart）用 \`{user:1001}\` 前缀，保证落到同一节点，可以做事务、Lua、MGET。

## 17.3 槽位分配与节点

### 节点信息

每个 Cluster 节点都有一个唯一 ID（不是端口，是 40 字符的 hex）：

\`\`\`bash
127.0.0.1:7000> CLUSTER NODES
<id1> 127.0.0.1:7000@17000 myself,master - 0 1609456789 1 connected 0-5460
<id2> 127.0.0.1:7001@17001 master - 0 1609456789 2 connected 5461-10922
<id3> 127.0.0.1:7002@17002 master - 0 1609456789 3 connected 10923-16383
<id4> 127.0.0.1:7003@17003 slave <id1> 0 1609456789 4 connected
<id5> 127.0.0.1:7004@17004 slave <id2> 0 1609456789 5 connected
<id6> 127.0.0.1:7005@17005 slave <id3> 0 1609456789 6 connected
\`\`\`

字段含义：

| 字段 | 含义 |
| --- | --- |
| id | 节点唯一 ID |
| host:port@cport | 节点地址 + 集群总线端口（默认端口+10000） |
| flags | myself/master/slave/fail/handshake 等 |
| master_id | 如果是 slave，主节点 ID；master 为 \`-\` |
| ping_sent / pong_recv | 心跳时间戳 |
| epoch | 节点纪元 |
| link_state | connected/disconnected |
| slot | 负责的 slot 范围 |

### 集群状态

\`\`\`bash
127.0.0.1:7000> CLUSTER INFO
cluster_state:ok              # ok/fail，fail 时集群拒绝服务
cluster_slots_assigned:16384  # 已分配 slot 数
cluster_slots_ok:16384        # 在线 slot 数
cluster_slots_pfail:0         # 疑似下线
cluster_slots_fail:0          # 下线
cluster_known_nodes:6         # 集群节点总数
cluster_size:3                # master 数量
cluster_current_epoch:6
cluster_my_epoch:1
\`\`\`

> **重要**：\`cluster_state\` 不是 ok 时，集群会**拒绝所有写命令**（部分情况下连读都拒绝）。所以监控这个指标很关键。

## 17.4 集群搭建（redis-cli --cluster）

### 准备 6 个节点（3 主 3 从）

\`\`\`bash
# 配置文件模板 redis-7000.conf
port 7000
cluster-enabled yes              # 开启集群模式
cluster-config-file nodes-7000.conf
cluster-node-timeout 5000        # 节点超时（ms）
appendonly yes
daemonize yes
\`\`\`

启动 6 个实例：

\`\`\`bash
for port in 7000 7001 7002 7003 7004 7005; do
  redis-server redis-\${port}.conf
done
\`\`\`

### 一键创建集群

\`\`\`bash
# --cluster-replicas 1 表示每个主配 1 个从
redis-cli --cluster create \\
  127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 \\
  127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 \\
  --cluster-replicas 1

# 输出：
# >>> Performing hash slots allocation on 6 nodes...
# Master[0] -> Slots 0-5460
# Master[1] -> Slots 5461-10922
# Master[2] -> Slots 10923-16383
# Adding replica 127.0.0.1:7003 to 127.0.0.1:7000
# ...
# [OK] All nodes agree about slots configuration.
# >>> Check for open slots...
# >>> Check slots coverage...
# [OK] All 16384 slots covered.
\`\`\`

### 检查集群健康

\`\`\`bash
redis-cli --cluster check 127.0.0.1:7000

# 输出：
# 127.0.0.1:7000 (3e34...) -> 0 keys | 5461 slots | 1 slaves.
# 127.0.0.1:7001 (5f72...) -> 0 keys | 5461 slots | 1 slaves.
# 127.0.0.1:7002 (7b21...) -> 0 keys | 5462 slots | 1 slaves.
# [OK] All nodes agree about slots configuration.
# >>> Check for open slots...
# >>> Check slots coverage...
# [OK] All 16384 slots covered.
\`\`\`

### 加 -c 进入集群模式

\`\`\`bash
# 不加 -c：访问不在当前节点的 key 会报错
redis-cli -p 7000 SET foo bar
(error) MOVED 12182 127.0.0.1:7002

# 加 -c：自动重定向到正确节点
redis-cli -c -p 7000 SET foo bar
OK
\`\`\`

## 17.5 MOVED 与 ASK 重定向

### MOVED

当客户端访问的 key 不在当前节点时，节点返回 \`MOVED\`，告诉客户端"这个 key 永久在另一个节点"，客户端应该缓存这个映射。

\`\`\`bash
127.0.0.1:7000> GET foo
(error) MOVED 12182 127.0.0.1:7002
# 意思：slot 12182 在 127.0.0.1:7002，去那里查
\`\`\`

**客户端行为**：
1. 收到 MOVED，去新节点重试
2. 更新本地的 slot→node 映射表（智能客户端会做）
3. 后续相同 slot 的请求直接打到新节点

### ASK

**ASK 只在 slot 正在迁移时出现**。和 MOVED 的区别：
- MOVED：永久重定向，客户端要更新映射
- ASK：临时重定向，客户端**不要**更新映射，这次去新节点查一次

\`\`\`bash
# slot 5000 正在从 7000 迁移到 7001
127.0.0.1:7000> GET key_in_migrating
(error) ASK 5000 127.0.0.1:7001

# 客户端去 7001 时要带 ASKING 命令
# 否则 7001 会返回 MOVED 5000 127.0.0.1:7000（因为还没迁完）
127.0.0.1:7001> ASKING
OK
127.0.0.1:7001> GET key_in_migrating
"value"
\`\`\`

> **为什么需要 ASKING？** 迁移过程中 slot 既不完全属于老节点（key 已经搬走）也不完全属于新节点（还没接收完）。ASKING 表示"我知道这是过渡期，临时让我查一次"。

### 智能客户端

主流客户端（jedis、lettuce、ioredis、redis-py）都是"smart client"：
- 启动时通过 \`CLUSTER SLOTS\` 拿到完整 slot→node 映射
- 收到 MOVED 后更新映射
- 收到 ASK 后临时跳转，不更新映射
- 自动处理连接池、重试

\`\`\`bash
# 客户端启动时调用
127.0.0.1:7000> CLUSTER SLOTS
1) 1) (integer) 0
   2) (integer) 5460
   3) 1) "127.0.0.1"
   2) (integer) 7000
   3) "3e34..."
   4) 1) "127.0.0.1"
   2) (integer) 7003
   3) "..."
2) 1) (integer) 5461
   2) (integer) 10922
   ...
\`\`\`

## 17.6 集群的限制

Cluster 不是万能的，有些操作做不了：

### 1. 跨 slot 的多键操作被禁

\`\`\`bash
# foo 在 slot 12182，bar 在 slot 5061，不同 slot
127.0.0.1:7000> MGET foo bar
(error) CROSSSLOT Keys in request don't hash to the same slot
\`\`\`

**绕过**：用 Hash Tag 把相关 key 强制到同一 slot。

### 2. 事务和 Lua 受限

\`MULTI/EXEC\` 和 \`EVAL\` 涉及的 key 必须在同一 slot，否则报错。

### 3. SELECT db 不可用

Cluster 模式只能用 db 0：

\`\`\`bash
127.0.0.1:7000> SELECT 1
(error) ERR SELECT is not allowed in cluster mode
\`\`\`

### 4. Pub/Sub 跨节点广播

发布消息会广播到所有节点，订阅者的回复来自所有节点，开销大。建议用专门的 Pub/Sub 集群或 Stream 替代。

### 5. 客户端必须支持 Cluster

老客户端不支持 MOVED 重定向就废了。生产用主流客户端。

## 17.7 踩坑提示

> **坑 1：跨 slot 操作报错**。设计 key 时一定要考虑分片。比如批量查用户数据，用 \`{user:1001}\` hash tag 让相关 key 在一起。

> **坑 2：大 key 跨节点迁移慢**。一个 1GB 的 list 在 slot 迁移时，每个元素都要 MIGRATE，可能阻塞数分钟。上线前先做 BigKey 治理。

> **坑 3：集群小故障导致整体不可用**。某个节点挂了但还有 replica 顶上没事；如果某 slot 既没主又没副本（双挂），整个集群进入 fail 状态，全部拒绝服务。生产要保证每个 master 至少 1 replica。

> **坑 4：cluster-node-timeout 设得太小**。默认 15 秒，改成 1 秒会导致网络抖动频繁触发故障转移。生产建议 5-15 秒。

> **坑 5：客户端缓存 slot 映射不更新**。集群扩缩容后 slot 分布变了，老映射会导致大量 MOVED。客户端要正确响应 MOVED 更新映射。

## 17.8 本章小结

- Cluster 用 **16384 个 slot** 分片，\`slot = CRC16(key) % 16384\`
- 用 **Hash Tag** \`{...}\` 把相关 key 强制到同一 slot
- 6 节点起（3 主 3 从），用 \`redis-cli --cluster create\` 一键搭建
- 访问错误 slot 时返回 **MOVED（永久）或 ASK（临时迁移中）**
- 智能客户端自动处理重定向并缓存映射
- 跨 slot 多键操作受限，事务/Lua 也只能单 slot
- 关键参数：\`cluster-enabled\`、\`cluster-node-timeout\`、\`cluster-config-file\`**
`
  },
  {
    id: "redis-ch18",
    group: "第四部分 高可用架构",
    icon: "⚖️",
    title: "第 18 章 Cluster 故障转移与扩缩容",
    content: `# 第 18 章 Cluster 故障转移与扩缩容

上一章搭好了 3 主 3 从的最小集群，但生产环境远不止于此：节点会挂要故障转移，业务增长了要扩容加节点，机器要下线要缩容。本章把 Cluster 的运维生命周期讲透，让你能在生产里安全操作集群。

## 18.1 节点故障检测

Cluster 用 **gossip 协议** 互相探测：每秒随机选几个节点发 PING，捎带自己掌握的集群信息。

### 故障检测流程

1. 节点 A 给节点 B 发 PING，超过 \`cluster-node-timeout\`（默认 15s）没收到 PONG
2. A 把 B 标记为 **PFAIL（probable failure，疑似下线）**
3. A 通过 gossip 把"B 疑似下线"广播给其他节点
4. 过半数 master 都报告 B 是 PFAIL，B 升级为 **FAIL（确定下线）**
5. 进入故障转移流程

\`\`\`bash
# 查看节点状态
127.0.0.1:7000> CLUSTER NODES
# fail 标记表示该节点已确定下线
<id2> 127.0.0.1:7001@17001 master,fail - 1609456789 2 connected 5461-10922
\`\`\`

> **PFAIL vs FAIL**：PFAIL 是单节点的看法（可能误判），FAIL 是集体决议（过半数 master 同意）。只有 FAIL 才会触发故障转移。这和 Sentinel 的 SDOWN/ODOWN 思路一致。

## 18.2 从节点选举

当某个 master 被 FAIL 后，它的 replica 们要选一个顶上。流程：

### 1. 候选 replica 资格审查

不是所有 replica 都能参选，要满足：
- 与 master 断线时间不超过 \`cluster-node-timeout * 2\`（数据不能太旧）
- 复制偏移量最大（数据最新）

### 2. 触发选举

符合资格的 replica 等**一段随机时间**后发起选举（避免同时发起冲突），然后请求其他 master 投票。

### 3. 投票

每个 master 在一个 epoch 内只能投一票（Raft 思想）。候选 replica 拿到**过半数 master 的票**就当选。

### 4. 升主

当选的 replica 执行：
\`\`\`bash
# 内部执行（不需要手动）
CLUSTER FAILOVER TAKEOVER   # 强制升主，不要求投票（脑裂时用，慎用）
\`\`\`

然后广播自己成为新 master，接管原 master 的 slot。

### 手动故障转移

有时需要主动切主（比如升级 master），可以手动触发：

\`\`\`bash
# 在 replica 上执行，请求成为 master
127.0.0.1:7003> CLUSTER FAILOVER

# 选项：
# (无)  正常流程：通知 master 停止写入，等 replica 同步完，再切
# FORCE 强制：不等同步，直接切（数据可能丢）
# TAKEOVER 强制且不要求投票：脑裂场景用
\`\`\`

**安全切换流程（升级 master 不丢请求）**：

1. 把 master 设为只读：\`CONFIG SET cluster-require-full-coverage yes\`（保证一致性）
2. 在 replica 上执行 \`CLUSTER FAILOVER\`
3. 等待切换完成（看 \`CLUSTER NODES\` 中角色变化）
4. 关闭老 master 升级
5. 升级后作为 replica 重新加入

## 18.3 扩容（添加节点与迁移槽）

业务增长，3 主扛不住了，要加节点。流程：**启动新节点 → 加入集群 → 迁移部分 slot 过去**。

### 1. 启动并加入新节点

\`\`\`bash
# 启动新 master 7006 和它的 replica 7007
redis-server redis-7006.conf
redis-server redis-7007.conf

# 把 7006 加入集群（作为 master）
redis-cli --cluster add-node 127.0.0.1:7006 127.0.0.1:7000

# 把 7007 加入集群，作为 7006 的 replica
redis-cli --cluster add-node 127.0.0.1:7007 127.0.0.1:7000 \\
  --cluster-slave --cluster-master-id <7006的node-id>

# 查看节点列表确认
redis-cli -p 7000 CLUSTER NODES
\`\`\`

此时 7006 还没分配 slot，不接受数据。需要把 slot 迁过来。

### 2. 迁移 slot

\`\`\`bash
# 用 redis-cli --cluster reshard 交互式迁移
redis-cli --cluster reshard 127.0.0.1:7000

# 交互问答：
# How many slots do you want to move? 4096
# What is the receiving node ID? <7006的id>
# Please enter all the source node IDs... 输入 all 表示从所有 master 均摊
# ...
\`\`\`

**单条命令版**（脚本化）：

\`\`\`bash
# 把 slot 100 从 7000 迁到 7006
redis-cli -p 7000 CLUSTER SETSLOT 100 IMPORTING <7006-id>
redis-cli -p 7006 CLUSTER SETSLOT 100 MIGRATING <7000-id>
# 把 slot 100 里的 key 一个一个 MIGRATE
redis-cli -p 7000 CLUSTER GETKEYSINSLOT 100 100
# 假设取到 key1
redis-cli -p 7000 MIGRATE 127.0.0.1 7006 "" 0 5000 KEYS key1
# ...
# 全部迁完，通知所有节点 slot 100 归属变了
redis-cli -p 7000 CLUSTER SETSLOT 100 NODE <7006-id>
redis-cli -p 7001 CLUSTER SETSLOT 100 NODE <7006-id>
# 所有节点都要执行一遍
\`\`\`

> **生产建议**：手动迁移太繁琐，**直接用 \`redis-cli --cluster reshard\`**，它会自动处理 key 迁移和节点通知。

### 3. 平衡 slot

\`\`\`bash
# 查看每个节点的 slot 数和 key 数
redis-cli --cluster info 127.0.0.1:7000

# 自动平衡 slot 分布（让每个 master slot 数尽量相等）
redis-cli --cluster rebalance 127.0.0.1:7000
\`\`\`

## 18.4 缩容（迁移槽与移除节点）

下线机器时要做缩容：**把要下线节点的 slot 迁走 → 移除节点**。

### 1. 迁出 slot

\`\`\`bash
# 把 7006 的所有 slot 迁回其他节点
redis-cli --cluster reshard 127.0.0.1:7000 \\
  --cluster-from <7006-id> \\
  --cluster-to <7000-id> \\
  --cluster-slots 4096 \\
  --cluster-yes
\`\`\`

确认 7006 没有 slot 了：

\`\`\`bash
redis-cli -p 7006 CLUSTER NODES | grep myself
# 输出里没有 slot 范围就对了
\`\`\`

### 2. 移除节点

\`\`\`bash
# 先移除 replica（7007）
redis-cli --cluster del-node 127.0.0.1:7000 <7007-id>

# 再移除 master（7006，必须先迁空 slot）
redis-cli --cluster del-node 127.0.0.1:7000 <7006-id>
\`\`\`

### 3. 关闭节点

\`\`\`bash
redis-cli -p 7006 SHUTDOWN NOSAVE
redis-cli -p 7007 SHUTDOWN NOSAVE
\`\`\`

## 18.5 集群运维命令

### 信息查看

\`\`\`bash
# 集群整体信息
CLUSTER INFO

# 节点列表（最常用）
CLUSTER NODES

# slot 到节点的映射
CLUSTER SLOTS

# 我的 node id
CLUSTER MYID

# 某个 key 在哪个 slot
CLUSTER KEYSLOT mykey

# 某个 slot 里有多少 key
CLUSTER COUNTKEYSINSLOT 100

# 取某 slot 里 count 个 key（迁移用）
CLUSTER GETKEYSINSLOT 100 10
\`\`\`

### 节点管理

\`\`\`bash
# 与某节点握手（加入集群）
CLUSTER MEET 127.0.0.1 7006

# 忘记某节点（断绝关系）
CLUSTER FORGET <node-id>

# 把当前节点设为某 master 的 replica
CLUSTER REPLICATE <master-id>

# 手动故障转移（在 replica 上执行）
CLUSTER FAILOVER [FORCE|TAKEOVER]

# 重置集群（清空数据，慎用）
CLUSTER RESET [HARD|SOFT]
\`\`\`

### Slot 管理

\`\`\`bash
# 设置 slot 100 归属节点
CLUSTER SETSLOT 100 NODE <node-id>

# slot 100 正在迁入当前节点
CLUSTER SETSLOT 100 IMPORTING <source-node-id>

# slot 100 正在从当前节点迁出
CLUSTER SETSLOT 100 MIGRATING <target-node-id>

# 取消 IMPORTING/MIGRATING 状态
CLUSTER SETSLOT 100 STABLE
\`\`\`

### 工具命令

\`\`\`bash
# 集群健康检查
redis-cli --cluster check 127.0.0.1:7000

# 修复集群（找未分配的 slot 等）
redis-cli --cluster fix 127.0.0.1:7000

# 重新分片
redis-cli --cluster reshard 127.0.0.1:7000

# 平衡 slot
redis-cli --cluster rebalance 127.0.0.1:7000

# 集群信息
redis-cli --cluster info 127.0.0.1:7000

# 调用所有节点执行命令
redis-cli --cluster call 127.0.0.1:7000 DBSIZE
\`\`\`

## 18.6 踩坑提示

> **坑 1：扩容时 slot 迁移卡住**。原因是某个 key 太大，MIGRATE 超时。解决：先治大 key，迁移时设大点超时 \`MIGRATE ... 30000\`。

> **坑 2：缩容没迁空 slot 就 del-node**。会报错 \`"ERR Node ... is not empty"\`。必须先 reshard 把 slot 全部迁出。

> **坑 3：forget 一个节点后又 meet**。节点之间有"黑名单"机制，FORGET 后 60 秒内不能再 MEET。要么等 60 秒，要么重启所有节点。

> **坑 4：手动 FAILOVER 时 master 还有写入**。可能导致数据不一致。安全做法：FAILOVER 前先 STOP-WRITE（业务层禁止写），或用 \`CLIENT PAUSE\` 暂停所有写。

> **坑 5：脑裂后两个 master 都接收写入**。这需要 \`cluster-require-full-coverage yes\` 配合合理的 timeout。出现脑裂后，少数派 master 的写入会在恢复后丢失（被多数派覆盖）。

> **坑 6：扩容后没及时通知客户端**。客户端缓存的 slot 映射过期，会大量 MOVED。智能客户端会自动处理，但旧版客户端可能不会。

> **坑 7：CLUSTER RESET HARD 在生产用了**。这会清空所有数据和集群配置，慎之又慎。

## 18.7 本章小结

- **故障检测**：PFAIL（疑似）→ FAIL（确定，过半 master 同意）→ 触发故障转移
- **从节点选举**：资格审查 → 随机延迟发起 → 过半 master 投票 → 当选升主
- **手动故障转移**：\`CLUSTER FAILOVER\`（可选 FORCE/TAKEOVER），升级时用得着
- **扩容**：add-node → reshard 迁 slot → rebalance 平衡
- **缩容**：reshard 迁出 slot → del-node → 关闭
- **常用工具**：\`redis-cli --cluster check/fix/reshard/rebalance/info/call\`
- 操作前后都要 \`CLUSTER NODES\` 和 \`CLUSTER INFO\` 确认状态`
  },
  {
    id: "redis-ch19",
    group: "第四部分 高可用架构",
    icon: "🔌",
    title: "第 19 章 客户端与连接",
    content: `# 第 19 章 客户端与连接

前面几章我们都在 redis-cli 里敲命令，但生产环境客户端是通过代码连 Redis 的。**客户端的连接管理、协议、Pipeline、事务、Lua、Pub/Sub** 直接决定了应用的性能和正确性。本章把这些核心机制讲透，并给出各个语言的实战示例。

## 19.1 RESP 协议

Redis 客户端和服务端之间用 **RESP（REdis Serialization Protocol）** 通信。RESP3 是新版本（Redis 6+），但主流还是 RESP2。

### RESP2 的 5 种类型

每条消息以特殊字符开头，以 \`\\r\\n\` 结尾：

| 类型 | 前缀 | 示例 |
| --- | --- | --- |
| **简单字符串** | \`+\` | \`+OK\\r\\n\` |
| **错误** | \`-\` | \`-ERR unknown command\\r\\n\` |
| **整数** | \`:\` | \`:1000\\r\\n\` |
| **批量字符串** | \`$\` | \`$5\\r\\nhello\\r\\n\`（$ 后是字节数） |
| **数组** | \`*\` | \`*2\\r\\n$3\\r\\nfoo\\r\\n$3\\r\\nbar\\r\\n\` |

### 抓个例子

执行 \`SET hello world\`，客户端发送：

\`\`\`text
*3\\r\\n$3\\r\\nSET\\r\\n$5\\r\\nhello\\r\\n$5\\r\\nworld\\r\\n
\`\`\`

服务端回复：

\`\`\`text
+OK\\r\\n
\`\`\`

执行 \`GET hello\`：

\`\`\`text
# 请求
*2\\r\\n$3\\r\\nGET\\r\\n$5\\r\\nhello\\r\\n

# 响应
$5\\r\\nworld\\r\\n
\`\`\`

> **为什么了解 RESP？** 调试网络问题、写自定义客户端、优化协议（RESP3 多了双精度浮点、Map、Set 等类型）都需要。生产用 redis-cli 加 \`--no-raw\` 可以看到原始 RESP：

\`\`\`bash
redis-cli -p 6379 --no-raw GET hello
"world"
# 用 telnet 也能直接和 Redis 对话
telnet 127.0.0.1 6379
SET hello world
+OK
GET hello
$5
world
\`\`\`

## 19.2 连接池

**TCP 连接建立是有成本的**（三次握手 + AUTH + SELECT）。每次请求都新建连接会拖垮性能，所以要用**连接池**：预先建一批连接复用。

### Node.js（ioredis）

\`\`\`javascript
const Redis = require("ioredis");

const pool = new Redis({
  host: "127.0.0.1",
  port: 6379,
  // 连接池配置
  maxRetriesPerRequest: 3,    // 请求失败重试次数
  enableReadyCheck: true,     // 连接就绪检查
  enableOfflineQueue: true,   // 离线时排队等待
  connectTimeout: 10000,      // 连接超时
  commandTimeout: 5000,       // 命令超时
  family: 4,                  // IPv4
  db: 0,
  // 集群
  // sentinels: [...], name: "mymaster"
});
\`\`\`

### Java（Lettuce）

Lettuce 是基于 Netty 的异步客户端，**天生线程安全**，一个连接可以被多线程共享。

\`\`\`java
import io.lettuce.core.*;

RedisClient client = RedisClient.create("redis://127.0.0.1:6379");
StatefulRedisConnection<String, String> conn = client.connect();

// 一个连接，多线程共享
RedisCommands<String, String> sync = conn.sync();   // 同步
RedisAsyncCommands<String, String> async = conn.async(); // 异步
RedisReactiveCommands<String, String> reactive = conn.reactive(); // 响应式
\`\`\`

### Python（redis-py）

\`\`\`python
import redis

# ConnectionPool 自动管理
pool = redis.ConnectionPool(
    host="127.0.0.1",
    port=6379,
    max_connections=50,    # 最大连接数
    socket_timeout=5,
    socket_connect_timeout=5,
    retry_on_timeout=True,
)
client = redis.Redis(connection_pool=pool)
\`\`\`

### 连接池大小怎么定

经验公式：

\`\`\`text
连接数 = (单次请求耗时 ms × QPS) / 1000 × 冗余系数(1.5)
\`\`\`

举例：单次请求 2ms，业务 QPS 5000，需要 \`(2 × 5000)/1000 × 1.5 = 15\` 个连接。再加点缓冲，配 30-50 即可。

> **坑**：连接数配太大，Redis 服务端会被客户端连接占满（默认 maxclients 10000），且每个连接都要占内存和文件描述符。

## 19.3 Pipeline 管道

**Pipeline 是客户端批量发送命令，服务端批量返回结果**，省去了"一发一收"的 RTT 往返。

### 普通模式 vs Pipeline

\`\`\`text
普通：cmd1 → resp1 → cmd2 → resp2 → cmd3 → resp3   (3 RTT)
管道：cmd1,cmd2,cmd3 → resp1,resp2,resp3            (1 RTT)
\`\`\`

### 性能对比

\`\`\`bash
# 普通模式：插入 1 万条
redis-cli -p 6379 FLUSHDB
time (for i in {1..10000}; do redis-cli SET k$i v$i; done)
# 耗时约 5-10 分钟（每次都建连+RTT）

# Pipeline 模式：用 redis-cli 的 --pipe
redis-cli --pipe < commands.txt
# 1 万条 < 1 秒
\`\`\`

### 各语言示例

\`\`\`javascript
// Node.js ioredis
const pipeline = client.pipeline();
for (let i = 0; i < 1000; i++) {
  pipeline.set(\`k\${i}\`, \`v\${i}\`);
}
const results = await pipeline.exec();
// results 是数组：[[err, result], ...]
\`\`\`

\`\`\`python
# Python redis-py
pipe = client.pipeline()  # 默认 transaction=False
for i in range(1000):
    pipe.set(f"k{i}", f"v{i}")
results = pipe.execute()
\`\`\`

\`\`\`java
// Lettuce
List<RedisFuture<?>> futures = new ArrayList<>();
for (int i = 0; i < 1000; i++) {
    futures.add(async.set("k" + i, "v" + i));
}
// 等待全部完成
futures.forEach(f -> {
    try { f.await(); } catch (Exception e) {}
});
\`\`\`

> **注意**：Pipeline 不是原子的！中间穿插了其他客户端的命令。需要原子性用事务（MULTI/EXEC）或 Lua。

### redis-cli --pipe 批量导入

\`\`\`bash
# 生成 RESP 格式的命令文件
python3 -c "
for i in range(10000):
    print(f'*3\r\n\$3\r\nSET\r\n\$1\r\n{i}\r\n\$1\r\n{i}\r\n')
" > commands.resp

# 用 --pipe 导入，速度极快
redis-cli --pipe < commands.resp
# 输出：All data transferred. Waiting for the last reply...
# Last reply received from server.
# errors: 0, replies: 10000
\`\`\`

## 19.4 事务（MULTI/EXEC）

Redis 的事务**不是 ACID 的事务**，而是一组命令的"打包执行"：

1. \`MULTI\` 开启事务
2. 后续命令入队（不立即执行，返回 QUEUED）
3. \`EXEC\` 一次性执行所有命令
4. \`DISCARD\` 取消事务

### 基本用法

\`\`\`bash
127.0.0.1:6379> MULTI
OK
127.0.0.1:6379(TX)> SET counter 1
QUEUED
127.0.0.1:6379(TX)> INCR counter
QUEUED
127.0.0.1:6379(TX)> INCR counter
QUEUED
127.0.0.1:6379(TX)> EXEC
1) OK
2) (integer) 2
3) (integer) 3
\`\`\`

### WATCH 乐观锁

\`WATCH\` 监视一个 key，如果在 EXEC 之前这个 key 被其他客户端修改了，整个事务**自动放弃**（返回 nil）：

\`\`\`bash
# 客户端 A
127.0.0.1:6379> SET balance 100
OK
127.0.0.1:6379> WATCH balance
OK
127.0.0.1:6379> MULTI
OK
127.0.0.1:6379(TX)> DECRBY balance 50
QUEUED
127.0.0.1:6379(TX)> EXEC
(nil)   # 期间客户端 B 改了 balance，事务失败

# 客户端 B 在 A 的 EXEC 之前
127.0.0.1:6379> INCR balance
(integer) 101
\`\`\`

> **典型场景**：扣库存、转账。用 WATCH + MULTI 实现乐观锁，失败重试。

### 事务的限制

- **不支持回滚**：EXEC 执行中某条命令出错（运行时错误，如对字符串 INCR），后续命令**继续执行**，已执行的不回滚
- **不能条件分支**：事务里不能根据结果判断要不要继续
- **跨 slot 受限**：Cluster 模式下事务的 key 必须在同一 slot

\`\`\`bash
127.0.0.1:6379> SET foo bar
OK
127.0.0.1:6379> MULTI
OK
127.0.0.1:6379(TX)> INCR foo        # 类型错误
QUEUED
127.0.0.1:6379(TX)> SET other ok
QUEUED
127.0.0.1:6379(TX)> EXEC
1) (error) ERR value is not an integer or out of range
2) OK
# other 还是设置了，没有回滚！
\`\`\`

> **复杂业务用 Lua** 替代事务，更可靠。

## 19.5 Lua 脚本

Lua 脚本在 Redis 服务端执行，**原子性**（执行期间不会被其他命令打断），适合做复杂业务逻辑。

### EVAL 基本语法

\`\`\`bash
# EVAL script numkeys key1 key2 ... arg1 arg2 ...
127.0.0.1:6379> EVAL "return {KEYS[1], ARGV[1]}" 1 mykey myarg
1) "mykey"
2) "myarg"
\`\`\`

参数：
- \`script\`：Lua 代码字符串
- \`numkeys\`：key 的数量
- 后面是 key 列表和 arg 列表

### 实战：原子计数器

\`\`\`bash
# 如果 counter 不存在就初始化为 0，然后 +1
127.0.0.1:6379> EVAL "
local cnt = redis.call('GET', KEYS[1])
if not cnt then
    redis.call('SET', KEYS[1], 0)
    cnt = 0
end
return redis.call('INCR', KEYS[1])
" 1 counter
(integer) 1
\`\`\`

### 实战：限流器（令牌桶）

\`\`\`lua
-- rate_limit.lua
-- KEYS[1] = 桶的 key
-- ARGV[1] = 容量
-- ARGV[2] = 当前时间戳（秒）
-- ARGV[3] = 每秒补充速率
-- ARGV[4] = 本次请求数量

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local now = tonumber(ARGV[2])
local rate = tonumber(ARGV[3])
local need = tonumber(ARGV[4])

local bucket = redis.call('HMGET', key, 'tokens', 'ts')
local tokens = tonumber(bucket[1]) or capacity
local ts = tonumber(bucket[2]) or now

-- 补充令牌
local delta = math.max(0, now - ts) * rate
tokens = math.min(capacity, tokens + delta)

local allowed = 0
if tokens >= need then
    tokens = tokens - need
    allowed = 1
end

redis.call('HMSET', key, 'tokens', tokens, 'ts', now)
redis.call('EXPIRE', key, 3600)
return allowed
\`\`\`

执行：

\`\`\`bash
redis-cli --eval rate_limit.lua mybucket , 100 $(date +%s) 10 1
\`\`\`

### EVALSHA 优化

每次 EVAL 都要传整个脚本字符串，浪费带宽。Redis 会缓存脚本，用 SHA1 哈希引用：

\`\`\`bash
# 加载脚本，得到 SHA1
127.0.0.1:6379> SCRIPT LOAD "return redis.call('GET', KEYS[1])"
"a5260dd66ce02462..."   # 这是 SHA1

# 用 SHA1 执行
127.0.0.1:6379> EVALSHA a5260dd66ce02462... 1 mykey
"value"

# 检查脚本是否在缓存里
127.0.0.1:6379> SCRIPT EXISTS a5260dd66ce02462...
1) (integer) 1

# 清空脚本缓存
127.0.0.1:6379> SCRIPT FLUSH
\`\`\`

> **生产实践**：客户端启动时先 \`SCRIPT LOAD\` 所有脚本，之后用 \`EVALSHA\` 调用。如果服务端重启清了缓存，回退到 \`EVAL\`。

### Lua 的注意点

- **不能有副作用**：脚本里不能 os.execute、io.open 等
- **要快**：脚本执行期间整个 Redis 阻塞，超过 lua-time-limit（默认 5 秒）会告警但不会强停
- **纯函数性**：同样的输入应该产生同样的输出，不要在脚本里用 random、time（Redis 做了改造，random 会被固定）
- **Cluster 限制**：脚本里访问的 key 必须在同一 slot

\`\`\`conf
# 配置 lua 脚本超时
lua-time-limit 5000
\`\`\`

## 19.6 Pub/Sub 发布订阅

Pub/Sub 是 Redis 的消息广播机制：发布者发消息到频道，所有订阅者都收到。

### 基本用法

\`\`\`bash
# 终端 1：订阅
redis-cli -p 6379 SUBSCRIBE news
Reading messages... (press Ctrl-C to quit)
1) "subscribe"
2) "news"
3) (integer) 1

# 终端 2：发布
redis-cli -p 6379 PUBLISH news "hello world"
(integer) 1   # 返回订阅者数量

# 终端 1 收到：
1) "message"
2) "news"
3) "hello world"
\`\`\`

### 模式订阅

\`\`\`bash
# 订阅所有以 user: 开头的频道
redis-cli -p 6379 PSUBSCRIBE user:*
\`\`\`

### Pub/Sub 的限制

- **消息不持久化**：发布时没有订阅者，消息直接丢弃
- **离线订阅者收不到补发**：断了重连不会收到断线期间的消息
- **集群下广播**：Cluster 模式下消息会广播到所有节点，开销大

> **生产建议**：需要可靠消息用 Stream（下一章讲）；Pub/Sub 适合实时通知、配置广播、聊天室。

###Pub/Sub 客户端示例

\`\`\`javascript
// Node.js ioredis
const sub = new Redis({ host: "127.0.0.1", port: 6379 });
const pub = new Redis({ host: "127.0.0.1", port: 6379 });

sub.subscribe("news");
sub.on("message", (channel, message) => {
  console.log(\`收到 \${channel}: \${message}\`);
});

// 发布
pub.publish("news", "hello from node");
\`\`\`

\`\`\`python
# Python redis-py
import redis
r = redis.Redis()

p = r.pubsub()
p.subscribe("news")
for msg in p.listen():
    if msg["type"] == "message":
        print(msg["data"])

# 另一个进程发布
r.publish("news", "hello from python")
\`\`\`

## 19.7 踩坑提示

> **坑 1：连接池配太小**。QPS 高时连接池打满，请求排队等连接，超时雪崩。监控 \`inuse\` 和 \`wait\` 指标。

> **坑 2：不用 Pipeline**。每次都单独发命令，1 万次 SET 慢得感人。批量场景必须 Pipeline。

> **坑 3：用事务做复杂业务**。事务不支持回滚和条件分支，复杂业务用 Lua 或外部协调。

> **坑 4：Lua 脚本太慢**。一个脚本跑 10 秒，整个 Redis 卡 10 秒。控制脚本复杂度，超过 50ms 就要拆分。

> **坑 5：Pub/Sub 丢消息**。订阅者重启期间的消息全丢。重要场景用 Stream，或加业务层 ack + 重发。

> **坑 6：客户端没设超时**。Redis 慢查询或网络抖动时，客户端无限等待，线程被耗尽。一定要设 \`socket-timeout\`。

> **坑 7：EVALSHA 找不到脚本**。Redis 重启或 failover 后脚本缓存清空。客户端要能 fallback 到 EVAL。

## 19.8 本章小结

- **RESP 协议**：5 种类型（简单字符串/错误/整数/批量字符串/数组），\`\\r\\n\` 分隔
- **连接池**：复用 TCP 连接，大小按 \`请求数 × RTT\` 估算，主流客户端都内置
- **Pipeline**：批量发命令省 RTT，但不保证原子性
- **事务**：MULTI/EXEC + WATCH 乐观锁，不支持回滚，复杂业务用 Lua
- **Lua 脚本**：原子执行，EVAL/EVALSHA，注意超时和 Cluster 限制
- **Pub/Sub**：实时广播，不持久化、不补发，可靠消息用 Stream
- 生产客户端配置：超时、重试、连接池大小、ready check 都要配齐`
  }
];

export { chapters };
