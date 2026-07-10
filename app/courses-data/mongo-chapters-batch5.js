// =============================================================
// 《MongoDB 实战教程》- 章节批次 5
// -------------------------------------------------------------
// 内容：第五部分 高可用架构（第 21-25 章）
// =============================================================

const chapters = [
  {
    id: "mongo-ch21",
    group: "第五部分 高可用架构",
    icon: "🔁",
    title: "第 21 章 副本集",
    content: `# 第 21 章 副本集

单机 MongoDB 没有高可用——服务器宕机服务就中断。**副本集（Replica Set）** 是 MongoDB 实现高可用的基础机制，通过多节点数据冗余 + 自动故障转移，保证服务持续可用。本章系统讲解副本集的架构、搭建与使用。

## 21.1 副本集的概念

副本集是一组维护相同数据集合的 MongoDB 实例，由以下特性：

- **数据冗余**：多份数据副本，单节点损坏数据不丢
- **高可用**：主节点宕机自动选举新主，服务不中断
- **读写分离**：写主节点，读可分散到从节点
- **自动恢复**：节点重启后自动同步增量数据

> **核心概念**：副本集 ≠ 主从复制。早期 MongoDB 有 master-slave 模式（已废弃），副本集是其升级版，**自带自动故障转移**。

## 21.2 Primary / Secondary / Arbiter

副本集有三种角色：

| 角色 | 职责 | 是否存数据 | 是否投票 |
| --- | --- | --- | --- |
| **Primary** | 处理所有写请求，默认处理读 | 是 | 是 |
| **Secondary** | 同步 Primary 数据，可处理读 | 是 | 是 |
| **Arbiter** | 只参与选举，不存数据 | 否 | 是 |

### Primary（主节点）

唯一可写的节点。所有写操作先到 Primary，再同步到 Secondary。

\`\`\`javascript
// 写入只走 primary
db.products.insertOne({ name: "商品A" });
\`\`\`

### Secondary（从节点）

通过 oplog 同步 Primary 的写操作。可配置为：

- **可读从节点**：通过 readPreference 让读请求分流
- **隐藏节点**：不参与读，专用于备份/报表
- **延迟节点**：数据落后主节点一段时间，用于误操作恢复

\`\`\`javascript
// Node.js 从 secondary 读
const client = await MongoClient.connect(
  "mongodb://host1:27017,host2:27017,host3:27017/?replicaSet=rs0",
  { readPreference: "secondaryPreferred" }
);
\`\`\`

### Arbiter（仲裁节点）

不存数据，只在选举时投票。**用于凑奇数票数**，避免脑裂。

> **踩坑提示**：Arbiter 资源消耗极低（不存数据），但不要在生产环境大量使用。数据节点本身就能投票，Arbiter 主要用于 2 数据节点 + 1 仲裁 的轻量部署。

## 21.3 副本集搭建

### 单机多端口模拟副本集（学习用）

\`\`\`bash
# 创建三个数据目录
mkdir -p /data/rs0-1 /data/rs0-2 /data/rs0-3

# 启动三个 mongod 实例（不同端口）
mongod --replSet rs0 --port 27017 --dbpath /data/rs0-1 --fork --logpath /var/log/mongo/rs0-1.log
mongod --replSet rs0 --port 27018 --dbpath /data/rs0-2 --fork --logpath /var/log/mongo/rs0-2.log
mongod --replSet rs0 --port 27019 --dbpath /data/rs0-3 --fork --logpath /var/log/mongo/rs0-3.log
\`\`\`

### 初始化副本集

\`\`\`javascript
// 连到任意一个节点
mongo --port 27017

// 执行初始化
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    _id: 2, host: "localhost:27019" }
  ]
});

// 查看状态
rs.status();
\`\`\`

### 添加仲裁节点

\`\`\`javascript
rs.addArb("localhost:27020");
\`\`\`

### 添加/移除节点

\`\`\`javascript
// 添加从节点
rs.add({ host: "localhost:27021", priority: 1 });

// 移除节点
rs.remove("localhost:27021");

// 查看配置
rs.conf();
\`\`\`

## 21.4 选举机制

副本集通过 **Raft 变种协议** 选举 Primary。核心规则：

1. **多数派投票**：必须获得 > N/2 节点投票才能成为 Primary
2. **优先级**：priority 高的节点优先成为 Primary
3. **心跳检测**：节点间每 2s 互发心跳，超时（默认 10s）认为故障

### 选举触发条件

- Primary 宕机或网络隔离
- 手动执行 \`rs.stepDown()\`
- 添加/移除节点导致拓扑变化
- 优先级调整

\`\`\`javascript
// 手动让当前 primary 让位
rs.stepDown(60);  // 60 秒内不重新竞选

// 强制重新选举
rs.freeze(60);  // 当前节点 60 秒内不能成为 primary
\`\`\`

### 投票节点数限制

副本集**最多 50 个成员，其中最多 7 个投票成员**。多数派 = ⌊N/2⌋ + 1。

| 投票节点数 | 多数派 | 可容忍故障数 |
| --- | --- | --- |
| 3 | 2 | 1 |
| 5 | 3 | 2 |
| 7 | 4 | 3 |

> **生产建议**：奇数节点（3 或 5），避免偶数节点导致脑裂。

## 21.5 同步方式（initial sync / oplog）

### Initial Sync（全量同步）

新节点加入或落后太多时，从 Primary 完整拷贝数据。

\`\`\`bash
# 查看同步进度
mongo --port 27018
rs.printSyncProgress();
\`\`\`

过程：

1. 拷贝所有集合的当前数据
2. 期间记录 Primary 的 oplog 写入
3. 拷贝完成后回放期间 oplog
4. 进入正常同步状态

### Oplog（增量同步）

**oplog** 是一个特殊的固定集合 \`local.oplog.rs\`，记录 Primary 的所有写操作。

\`\`\`javascript
// 查看 oplog
use local;
db.oplog.rs.find().sort({ $natural: -1 }).limit(5);

// 查看 oplog 大小
rs.printReplicationInfo();
// 输出示例：
// configured oplog size:   2048MB
// log length start to end: 172800 secs (48 hrs)
\`\`\`

**关键参数**：

- \`oplogSizeMB\`：oplog 大小，决定能保留多长时间的操作历史
- 默认按磁盘 5% 计算，最小 1GB，最大 50GB

\`\`\`bash
# 启动时指定 oplog 大小
mongod --replSet rs0 --oplogSize 4096
\`\`\`

> **踩坑提示**：
> - oplog 太小会导致 secondary 长时间宕机后无法增量同步，被迫全量同步
> - 写入密集场景建议把 oplog 调大到 10GB+
> - oplog 是固定集合，操作符顺序保证幂等

## 21.6 读写偏好（readPreference）

readPreference 控制读请求路由到哪个节点：

\`\`\`javascript
// Node.js 驱动
const client = await MongoClient.connect(
  "mongodb://host1:27017,host2:27017,host3:27017/?replicaSet=rs0",
  { readPreference: "secondaryPreferred" }
);

// 单次查询指定
db.products.find({}).readPref("secondary");
\`\`\`

| 模式 | 行为 | 适用场景 |
| --- | --- | --- |
| primary（默认） | 只读主 | 强一致读 |
| primaryPreferred | 优先主，主不可用读从 | 故障转移期可读 |
| secondary | 只读从 | 报表、备份，不抢主资源 |
| secondaryPreferred | 优先从，从不可用读主 | 读多写少 |
| nearest | 最低延迟节点 | 地理分散，最低延迟 |

### readPreference + tag

可以给节点打标签，按标签路由。

\`\`\`javascript
// 给节点打标签
rs.conf().members[1].tags = { region: "east", role: "report" };
rs.reconfig(rs.conf());

// 查询指定标签
db.products.find({}).readPref("secondary", [{ region: "east" }]);
\`\`\`

> **踩坑提示**：
> - secondary 读可能读到旧数据（异步同步有延迟），强一致场景必须读 primary
> - secondary 读会分担 primary 压力，但 secondary 太多写压力大时同步会延迟，导致读更旧
> - 不要把报表查询打到 primary，会拖垮业务写入

## 21.7 本章小结

- 副本集 = 数据冗余 + 自动故障转移，是 MongoDB 高可用基础
- 三种角色：**Primary**（写）、**Secondary**（读+冗余）、**Arbiter**（投票）
- 选举基于多数派投票，建议奇数节点（3 或 5）
- 同步分 **initial sync**（全量）和 **oplog**（增量），oplog 大小决定恢复窗口
- readPreference 控制读路由，强一致读 primary，报表读 secondary

> **踩坑提示**：
> - 生产环境**必须**部署副本集，单机模式数据丢失风险高
> - 跨机房部署要考虑网络延迟，oplog 同步延迟会影响读一致性
> - Arbiter 不存数据，资源消耗低，但不要把它当数据节点用`
  },

  {
    id: "mongo-ch22",
    group: "第五部分 高可用架构",
    icon: "🗳️",
    title: "第 22 章 选举与故障转移",
    content: `# 第 22 章 选举与故障转移

上一章介绍了副本集基础。本章深入选举机制：什么情况触发选举、选举如何进行、如何通过 priority/votes 控制选举结果，以及 hidden/delayed 节点的实战应用。

## 22.1 选举触发条件

副本集选举在以下情况触发：

### 1. Primary 故障

Primary 宕机、进程退出、网络隔离，Secondary 检测到心跳超时（默认 10 秒）后发起选举。

\`\`\`bash
# 查看心跳超时配置
mongod --setParameter electionTimeoutMillis=10000
\`\`\`

### 2. 手动让位

\`\`\`javascript
// 当前 primary 主动让位，触发选举
rs.stepDown(60);  // 60 秒内不重新竞选

// 也可以指定让位给特定节点
rs.stepDown(60, 30);  // 第二参数是 catchUpPeriodSecs
\`\`\`

### 3. 拓扑变化

添加/移除节点、调整 priority 都可能触发选举。

\`\`\`javascript
// 调整 priority 后可能触发选举
const cfg = rs.conf();
cfg.members[1].priority = 10;
rs.reconfig(cfg);
\`\`\`

### 4. 网络分区

少数派节点无法联系多数派，会尝试选举但无法获得多数票，导致**无主状态**。

## 22.2 选举过程

选举基于 **Raft 协议变种**，过程如下：

1. **检测阶段**：Secondary 发现 Primary 心跳超时
2. **候选阶段**：高优先级 Secondary 成为候选人，向其他节点拉票
3. **投票阶段**：每个节点一票，先到先得，**同任期只投一次**
4. **确认阶段**：候选人获得 > N/2 票数后成为新 Primary
5. **同步阶段**：新 Primary 同步最新 oplog，开始接受写入

\`\`\`javascript
// 查看选举事件
db.adminCommand({ replSetGetStatus: 1 });

// 关键字段
{
  "myState": 1,  // 1=primary, 2=secondary
  "members": [
    {
      "name": "host1:27017",
      "stateStr": "PRIMARY",
      "electionTime": ISODate("..."),
      "optimeDate": ISODate("..."),
      "lastHeartbeat": ISODate("...")
    }
  ]
}
\`\`\`

> **关键规则**：
> - 同一个节点在同一任期内只能投一次票
> - 候选人的 oplog 必须比投票者新或相等才能获得票
> - 优先级高的节点优先发起选举

## 22.3 priority 与 votes

### priority（优先级）

控制节点成为 Primary 的优先顺序。范围 0-1000，默认 1。

\`\`\`javascript
const cfg = rs.conf();
cfg.members[0].priority = 100;  // 最优先成为 primary
cfg.members[1].priority = 1;    // 普通 secondary
cfg.members[2].priority = 0;    // 永远不成为 primary（hidden 节点常用）
rs.reconfig(cfg);
\`\`\`

**用法**：

- 主机房节点 priority 高，故障转移优先选主机房
- hidden/delayed 节点 priority = 0，永远不竞选

### votes（投票权）

控制节点是否参与投票。0 表示不投票，1 表示投票。**最多 7 个投票节点**。

\`\`\`javascript
// 7 节点副本集：5 投票 + 2 不投票
const cfg = rs.conf();
cfg.members[5].votes = 0;
cfg.members[6].votes = 0;
rs.reconfig(cfg);
\`\`\`

> **踩坑提示**：
> - 不要轻易把 priority 设为 0，会导致该节点永远不能成 primary
> - votes=0 的节点不参与选举投票，但仍同步数据
> - 修改 votes 后多数派可能变化，操作前确认新拓扑下多数派仍可达成

## 22.4 hidden 节点

**hidden 节点**对客户端不可见，不参与读请求路由，专用于备份/报表。

\`\`\`javascript
const cfg = rs.conf();
cfg.members[2].priority = 0;     // 永不成为 primary
cfg.members[2].hidden = true;    // 隐藏节点
rs.reconfig(cfg);
\`\`\`

**特点**：

- 不被客户端发现（\`isMaster\` 命令不返回）
- 不参与读路由（即使 readPreference=secondary 也读不到它）
- 仍同步数据，仍可投票
- 适合跑报表、备份任务，不影响业务

\`\`\`javascript
// 单独连接 hidden 节点跑报表
const client = await MongoClient.connect("mongodb://hidden-host:27017/?replicaSet=rs0", {
  readPreference: "secondary",
  // 直接指定连接该节点
});
\`\`\`

## 22.5 delayed 节点

**delayed 节点**数据落后 Primary 一段时间，用于**人为灾难恢复**（如误删数据）。

\`\`\`javascript
const cfg = rs.conf();
cfg.members[3].priority = 0;
cfg.members[3].hidden = true;
cfg.members[3].secondaryDelaySecs = 3600;  // 落后 1 小时
rs.reconfig(cfg);
\`\`\`

**场景**：

- DBA 误执行 \`db.users.deleteMany({})\`
- 1 小时内发现，从 delayed 节点恢复数据

\`\`\`javascript
// 从 delayed 节点查被删的数据
const delayedClient = await MongoClient.connect("mongodb://delayed-host:27017");
const users = delayedClient.db("shop").collection("users");
const deletedUsers = await users.find({}).toArray();
// 再写回 primary
\`\`\`

> **踩坑提示**：
> - delayed 节点 secondaryDelaySecs 要大于业务最大维护时间（一般 1-6 小时）
> - delayed 节点 priority 必须为 0，否则可能成为 primary 导致数据回退
> - delayed 节点 hidden 也应为 true，避免读路由

## 22.6 故障转移时间

故障转移不是瞬时的，主要耗时：

| 阶段 | 默认时间 | 可调参数 |
| --- | --- | --- |
| 心跳超时检测 | 10 秒 | electionTimeoutMillis |
| 选举过程 | 1-2 秒 | 不可调 |
| 新主同步 oplog | 几毫秒到几秒 | 取决于 lag |
| 客户端重连 | 几百毫秒 | 驱动配置 |

**总计**：通常 **10-15 秒** 服务不可用。

\`\`\`bash
# 调整心跳超时（缩短故障检测时间，但更易误判）
mongod --setParameter electionTimeoutMillis=5000
\`\`\`

> **权衡**：
> - electionTimeoutMillis 越小，故障转移越快，但越容易因网络抖动误判
> - 高负载网络建议保持 10 秒，避免误切换
> - 跨机房部署建议 15-20 秒

### 客户端重试

故障转移期间写入会失败，应用层要重试。

\`\`\`javascript
// Node.js 驱动自动重试
const client = await MongoClient.connect(url, {
  retryWrites: true,        // 写失败自动重试（同连接）
  retryReads: true,         // 读失败自动重试
  serverSelectionTimeoutMS: 30000  // 选服务器超时
});
\`\`\`

## 22.7 本章小结

- 选举触发：Primary 故障、手动让位、拓扑变化、网络分区
- 选举基于 **Raft 变种**，多数派投票，同任期只投一次
- **priority** 控制优先级，**votes** 控制投票权（最多 7 投票）
- **hidden 节点**对客户端不可见，适合备份/报表
- **delayed 节点**数据落后，用于人为灾难恢复
- 故障转移总耗时 10-15 秒，可通过 electionTimeoutMillis 调整

> **踩坑提示**：
> - 跨机房部署用 priority 控制主节点位置，避免主节点漂移到延迟高的机房
> - delayed 节点是误操作的最后一道防线，生产环境建议至少 1 个
> - 故障转移期间应用必须重试，retryWrites=true 是必备配置
> - 不要用 priority=0 的节点跑业务读，它不参与读路由（hidden），但可以单独连`
  },

  {
    id: "mongo-ch23",
    group: "第五部分 高可用架构",
    icon: "🌐",
    title: "第 23 章 分片集群",
    content: `# 第 23 章 分片集群

副本集解决了高可用，但**单节点存储和计算能力有上限**。当数据量超过单机磁盘、内存或 CPU 承受能力，需要**分片（Sharding）** 把数据水平拆分到多个节点。本章讲解分片集群的架构、组件与搭建。

## 23.1 为什么需要分片

单机 MongoDB 的瓶颈：

- **存储上限**：单机磁盘容量有限，单集合太大查询慢
- **内存瓶颈**：数据超过内存，缓存命中率下降，性能急剧恶化
- **写入瓶颈**：单 primary 写入 QPS 有上限
- **地理分布**：全球用户访问单机房延迟高

**分片解决**：

- 水平扩展存储：N 个分片 = N 倍存储
- 水平扩展写入：N 个分片 = N 倍写入 QPS
- 数据就近访问：不同地区数据放不同分片

> **重要原则**：**先优化，再分片**。分片带来运维复杂度，索引优化、查询优化、数据建模应该先用尽。单机能扛 1TB 数据时，分片不是首选方案。

## 23.2 分片集群架构

分片集群由三类组件构成：

\`\`\`
                  ┌──────────────┐
   客户端 ───────→│   mongos     │  路由进程
                  └──────┬───────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐     ┌─────────┐     ┌─────────┐
   │ Shard 1 │     │ Shard 2 │     │ Shard 3 │  数据分片
   │(副本集) │     │(副本集) │     │(副本集) │
   └─────────┘     └─────────┘     └─────────┘
        ▲                ▲                ▲
        └────────────────┼────────────────┘
                         │
                  ┌──────▼───────┐
                  │ Config Server│  元数据
                  │  (副本集)    │
                  └──────────────┘
\`\`\`

## 23.3 mongos / config server / shard

### mongos（路由）

客户端连接的入口，**无状态**，可水平扩展。

- 接收客户端请求，根据分片键路由到目标 shard
- 合并多个 shard 的查询结果
- 不存数据，可部署多个做负载均衡

\`\`\`bash
# 启动 mongos
mongos --configdb csrs/localhost:27019,localhost:27020,localhost:27021 --port 27017 --fork
\`\`\`

### config server（配置服务器）

存集群元数据：

- 集群有哪些 shard
- 每个 chunk 在哪个 shard（路由表）
- 数据库/集合的分片配置

**必须是副本集**，建议 3 节点。

\`\`\`bash
# 启动 config server（副本集模式）
mongod --configsvr --replSet csrs --port 27019 --dbpath /data/config --fork
\`\`\`

### shard（分片）

实际存数据的节点，每个 shard 是一个**副本集**。

\`\`\`bash
# 启动 shard 1
mongod --shardsvr --replSet shard1 --port 27018 --dbpath /data/shard1 --fork
\`\`\`

### 添加 shard 到集群

\`\`\`javascript
// 连到 mongos
mongo --port 27017

sh.addShard("shard1/localhost:27018,localhost:27022,localhost:27023");
sh.addShard("shard2/localhost:27024,localhost:27025,localhost:27026");
sh.status();
\`\`\`

## 23.4 分片键的选择

**分片键（Shard Key）** 决定数据如何分布到各 shard。一旦选定**不可更改**（5.0 前不可改，5.0+ 有限支持改）。

### 选择原则

1. **高基数**：值越多越好，避免数据集中
2. **低频率**：每个值出现的文档数少，避免热点
3. **非单调递增**：避免新数据总落到最后一个 shard
4. **查询常用**：查询带分片键才能路由到单 shard

### 常见分片键

\`\`\`javascript
// 1. 用户 ID 分片（电商订单）
sh.shardCollection("shop.orders", { userId: 1 });

// 2. 哈希分片（避免单调递增热点）
sh.shardCollection("shop.logs", { _id: "hashed" });

// 3. 复合分片（地区 + 用户 ID）
sh.shardCollection("app.events", { region: 1, userId: 1 });

// 4. 范围分片（时间序列）
sh.shardCollection("iot.readings", { sensorId: 1, ts: 1 });
\`\`\`

### 好分片键 vs 坏分片键

| 分片键 | 评价 | 原因 |
| --- | --- | --- |
| userId | ✅ 好 | 高基数，查询常用 |
| { _id: ObjectId } 范围 | ❌ 差 | 单调递增，热点在最后 shard |
| { _id: "hashed" } | ✅ 好 | 哈希分布均匀 |
| status | ❌ 差 | 只有几个值，分布不均 |
| timestamp 范围 | ❌ 差 | 单调递增，热点 |
| { userId, timestamp } | ✅ 好 | 复合，兼顾查询和分布 |

> **踩坑提示**：
> - 分片键一旦选定不可改（5.0 前），选错可能导致数据倾斜、性能差
> - 分片键字段必须有索引（MongoDB 自动建）
> - 分片键不能改、不能删（4.2 前不能改字段值）

## 23.5 范围分片 vs 哈希分片

### 范围分片（默认）

按分片键值范围切分 chunk。

\`\`\`javascript
sh.shardCollection("shop.orders", { userId: 1 });
// chunk 1: userId [MinKey, 1000)
// chunk 2: userId [1000, 2000)
// chunk 3: userId [2000, MaxKey)
\`\`\`

**优点**：

- 支持范围查询，能路由到单 shard
- 适合按时间、按 ID 范围查询

**缺点**：

- 单调递增键会导致热点（新数据都到最大值的 shard）

### 哈希分片

对分片键算哈希，按哈希值分布。

\`\`\`javascript
sh.shardCollection("shop.logs", { _id: "hashed" });
\`\`\`

**优点**：

- 分布均匀，无热点
- 适合写入密集场景

**缺点**：

- 范围查询要扫所有 shard（scatter-gather）
- 等值查询才能路由到单 shard

### 选择建议

| 场景 | 推荐 |
| --- | --- |
| 等值查询为主，写入密集 | 哈希分片 |
| 范围查询多（时间、ID 区间） | 范围分片 |
| 单调递增键 | 哈希分片（强制打散） |
| 复合查询 | 复合分片键 + 范围 |

## 23.6 分片集群搭建

完整流程：

\`\`\`bash
# 1. 启动 config server 副本集
mongod --configsvr --replSet csrs --port 27019 --dbpath /data/config1 --fork
mongod --configsvr --replSet csrs --port 27020 --dbpath /data/config2 --fork
mongod --configsvr --replSet csrs --port 27021 --dbpath /data/config3 --fork

# 初始化 config 副本集
mongo --port 27019 --eval 'rs.initiate({_id:"csrs", members:[
  {_id:0, host:"localhost:27019"},
  {_id:1, host:"localhost:27020"},
  {_id:2, host:"localhost:27021"}
]})'

# 2. 启动 shard 副本集（每个 shard 一个副本集）
mongod --shardsvr --replSet shard1 --port 27018 --dbpath /data/shard1a --fork
mongod --shardsvr --replSet shard1 --port 27022 --dbpath /data/shard1b --fork
mongod --shardsvr --replSet shard1 --port 27023 --dbpath /data/shard1c --fork

mongo --port 27018 --eval 'rs.initiate({_id:"shard1", members:[
  {_id:0, host:"localhost:27018"},
  {_id:1, host:"localhost:27022"},
  {_id:2, host:"localhost:27023"}
]})'

# 3. 启动 mongos
mongos --configdb csrs/localhost:27019,localhost:27020,localhost:27021 --port 27017 --fork

# 4. 添加 shard
mongo --port 27017 --eval 'sh.addShard("shard1/localhost:27018,localhost:27022,localhost:27023")'
\`\`\`

### 启用分片

\`\`\`javascript
// 连到 mongos
mongo --port 27017

// 1. 启用数据库分片
sh.enableSharding("shop");

// 2. 在分片键上建索引（如果还没有）
db.products.createIndex({ userId: 1 });

// 3. 分片集合
sh.shardCollection("shop.orders", { userId: 1 });

// 4. 查看分片状态
sh.status();
\`\`\`

## 23.7 本章小结

- 分片解决单机**存储、内存、写入**瓶颈，实现水平扩展
- 三类组件：**mongos**（路由）、**config server**（元数据）、**shard**（数据）
- 分片键选择三原则：**高基数、低频率、非单调递增**
- 范围分片支持范围查询，哈希分片分布均匀
- 分片键一旦选定不可改（5.0 前），必须慎重选择

> **踩坑提示**：
> - 分片不是性能银弹，**先优化后分片**，单机能扛就别分
> - 分片后写入 QPS 提升，但跨 shard 查询（scatter-gather）反而更慢
> - 分片集群运维复杂度高，需要专人维护
> - 分片键选择错误几乎无法挽救，必须基于访问模式精心设计`
  },

  {
    id: "mongo-ch24",
    group: "第五部分 高可用架构",
    icon: "⚖️",
    title: "第 24 章 分片管理与均衡",
    content: `# 第 24 章 分片管理与均衡

分片集群上线后，数据如何在 shard 间分布、如何保证均衡、如何修改分片键——这些是日常运维的核心。本章讲解 chunk、balancer、迁移机制，以及 5.0+ 的分片键修改能力。

## 24.1 chunk 的概念

**chunk** 是分片集群数据分布的最小单位。一个 chunk 是分片键连续值范围的一段数据。

\`\`\`javascript
// 查看集合的 chunk 分布
sh.status();

// 输出示例
// shop.orders
//   shard1: range "userId" MinKey --> 1000
//   shard2: range "userId" 1000 --> 2000
//   shard3: range "userId" 2000 --> MaxKey
\`\`\`

### chunk 大小

默认 64MB（4.4+，之前是 64MB）。控制何时拆分。

\`\`\`javascript
// 查看当前 chunk 大小配置
use config;
db.settings.findOne({ _id: "chunksize" });

// 修改 chunk 大小（MB）
db.settings.updateOne(
  { _id: "chunksize" },
  { $set: { value: 128 } },
  { upsert: true }
);
\`\`\`

### chunk 拆分

当 chunk 数据量超过 chunkSize，mongos 自动拆分。

\`\`\`javascript
// 手动拆分
sh.splitFind("shop.orders", { userId: 1500 });

// 在指定值处拆分
sh.splitAt("shop.orders", { userId: 1500 });
\`\`\`

> **chunk 大小权衡**：
> - 小 chunk（16-32MB）：分布更均匀，但 chunk 数多，元数据多
> - 大 chunk（128MB+）：元数据少，但迁移耗时长，易不均
> - 大部分场景默认 64MB 合适

## 24.2 balancer 均衡器

**balancer** 是后台进程，自动迁移 chunk 让各 shard 数据量均衡。

### 工作机制

1. 周期性检查各 shard 的 chunk 数
2. 发现最多 shard 和最少 shard 差距超过阈值，触发迁移
3. 从最多 shard 选一个 chunk 迁到最少 shard
4. 迁移完成后更新 config server 元数据

### 查看状态

\`\`\`javascript
// 查看 balancer 是否运行
sh.getBalancerState();

// 查看是否正在均衡
sh.isBalancerRunning();

// 查看均衡窗口
sh.getBalancerWindow();
\`\`\`

### 控制均衡窗口

生产环境常在业务低峰期才允许均衡，避免影响性能。

\`\`\`javascript
// 只在凌晨 2-6 点均衡
db.settings.update(
  { _id: "balancer" },
  { $set: { activeWindow: { start: "02:00", stop: "06:00" } } },
  { upsert: true }
);

// 关闭均衡
sh.stopBalancer();

// 开启均衡
sh.startBalancer();
\`\`\`

### 排除特定集合

某些集合不希望被均衡（如热点数据手动控制）。

\`\`\`javascript
sh.disableBalancing("shop.orders");

// 重新启用
sh.enableBalancing("shop.orders");
\`\`\`

## 24.3 chunk 迁移

chunk 迁移是 balancer 的核心操作，过程如下：

### 迁移步骤

1. **源 shard 选择**：balancer 选 chunk 所在 shard
2. **目标 shard 选择**：选 chunk 最少的 shard
3. **数据拷贝**：源 shard 把 chunk 数据拷到目标 shard
4. **同步增量**：迁移期间新写入的 oplog 同步到目标
5. **元数据切换**：config server 更新 chunk 位置
6. **源 shard 删除**：删除源 shard 上的旧 chunk

\`\`\`javascript
// 手动迁移 chunk
sh.moveChunk("shop.orders", { userId: 1500 }, "shard3");

// 查看迁移状态
sh.status();
\`\`\`

### 迁移影响

- **网络带宽**：迁移消耗带宽
- **磁盘 IO**：源/目标 shard 都有 IO 压力
- **内存**：迁移期间数据进内存
- **业务影响**：迁移期间查询路由可能短暂不一致

> **踩坑提示**：
> - 迁移期间目标 shard 会同时持有"待迁移"和"已迁移"两份数据，磁盘占用临时翻倍
> - 大量迁移会拖慢业务，建议在低峰期进行
> - 手动迁移要小心，可能触发连锁迁移

## 24.4 分片键的修改（MongoDB 5.0+）

5.0 之前分片键**不可改**，5.0+ 支持以下操作：

### 1. 将分片键改为可变（refineCollectionShardKey）

给已有分片键追加字段，让分布更均匀。

\`\`\`javascript
// 原分片键 { userId: 1 }，数据倾斜
// 追加 orderId 让分布更细
db.adminCommand({
  refineCollectionShardKey: "shop.orders",
  key: { userId: 1, orderId: 1 }
});
\`\`\`

### 2. 修改字段值（5.0+）

之前分片键字段值不能改，5.0+ 可以。

\`\`\`javascript
// 5.0+ 可以修改分片键字段值
db.users.updateOne(
  { _id: ObjectId("...") },
  { $set: { userId: "newUserId" } }  // userId 是分片键
);
\`\`\`

### 3. 重新分片（resharding，5.0+）

完全改变分片键，MongoDB 自动迁移数据。

\`\`\`javascript
db.adminCommand({
  reshardCollection: "shop.orders",
  key: { orderId: 1 }
});
\`\`\`

> **重要约束**：
> - 重新分片期间集群负载高，建议低峰期操作
> - 重新分片是**不可逆**的，操作前做好备份
> - 大集合重新分片可能耗时几小时到几天

## 24.5 分片集群的限制

### 不支持的操作

\`\`\`javascript
// 1. 不支持 $lookup 跨分片（4.0 前）
// 4.0+ 支持但性能差
db.orders.aggregate([
  { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } }
]);

// 2. 不支持 unique 索引（除非带分片键前缀）
db.products.createIndex({ sku: 1 }, { unique: true });  // 报错
db.products.createIndex({ userId: 1, sku: 1 }, { unique: true });  // OK

// 3. 分片集合的 $group 性能差（scatter-gather）
db.orders.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }  // 扫所有 shard
]);
\`\`\`

### 单文档大小

- 单文档仍受 16MB 限制
- 分片键字段值不能超过 8KB

### 事务限制

- 4.0 前不支持分片事务
- 4.2+ 支持但性能开销大，避免高频使用

### chunk 数量限制

- 单集合最大 chunk 数：4.4 前 8192，4.4+ 16384
- 超过会拒绝拆分，导致数据倾斜

## 24.6 本章小结

- **chunk** 是分片数据分布的最小单位，默认 64MB
- **balancer** 自动迁移 chunk 保证均衡，可配置时间窗口
- chunk 迁移消耗网络/IO/内存，建议低峰期进行
- 5.0+ 支持 **refineCollectionShardKey**（追加字段）和 **reshardCollection**（重新分片）
- 分片集群有诸多限制：跨分片 \$lookup、unique 索引、\$group 性能差

> **踩坑提示**：
> - balancer 默认全天运行，生产环境建议配置低峰期窗口
> - 5.0+ 的 reshardCollection 是大杀器，但操作前必须备份，且在低峰期进行
> - unique 索引在分片集群上必须包含分片键前缀，否则报错
> - chunk 数量超限会导致拆分失败，数据倾斜，要监控`
  },

  {
    id: "mongo-ch25",
    group: "第五部分 高可用架构",
    icon: "🔌",
    title: "第 25 章 客户端与连接",
    content: `# 第 25 章 客户端与连接

数据库性能不只取决于服务端，**客户端配置同样关键**。连接字符串、连接池、读写关注设置直接影响应用性能与可靠性。本章以 Node.js 为主，讲解 MongoDB 客户端的核心配置。

## 25.1 连接字符串

MongoDB 连接字符串（URI）格式：

\`\`\`
mongodb://[username:password@]host1[:port1][,host2[:port2],...][/database][?options]
\`\`\`

### 常见连接字符串

\`\`\`javascript
// 1. 单机
"mongodb://localhost:27017"

// 2. 单机带认证
"mongodb://user:pass@localhost:27017/shop?authSource=admin"

// 3. 副本集
"mongodb://host1:27017,host2:27017,host3:27017/shop?replicaSet=rs0"

// 4. 分片集群（多个 mongos）
"mongodb://mongos1:27017,mongos2:27017,mongos3:27017/shop"

// 5. SRV 记录（Atlas 推荐）
"mongodb+srv://user:pass@cluster0.example.mongodb.net/shop?retryWrites=true"
\`\`\`

### 关键参数

| 参数 | 含义 | 示例 |
| --- | --- | --- |
| replicaSet | 副本集名 | replicaSet=rs0 |
| authSource | 认证库 | authSource=admin |
| readPreference | 读偏好 | readPreference=secondaryPreferred |
| readConcernLevel | 读关注 | readConcernLevel=majority |
| w / journal | 写关注 | w=majority&journal=true |
| ssl | 启用 SSL | ssl=true |
| retryWrites | 重试写入 | retryWrites=true |
| connectTimeoutMS | 连接超时 | connectTimeoutMS=5000 |
| socketTimeoutMS | socket 超时 | socketTimeoutMS=30000 |
| maxPoolSize | 连接池大小 | maxPoolSize=100 |

\`\`\`javascript
// 完整参数示例
const uri = "mongodb://user:pass@host1:27017,host2:27017,host3:27017/shop" +
  "?replicaSet=rs0" +
  "&authSource=admin" +
  "&readPreference=secondaryPreferred" +
  "&readConcernLevel=majority" +
  "&w=majority&journal=true" +
  "&retryWrites=true" +
  "&maxPoolSize=50" +
  "&connectTimeoutMS=5000";
\`\`\`

> **踩坑提示**：
> - 连接字符串里密码有特殊字符（@、:、/）要 URL 编码
> - \`authSource\` 默认是连接的数据库，但用户通常建在 admin 库，要明确指定
> - SRV 记录（\`mongodb+srv://\`）能从 DNS 自动发现节点，Atlas 必用

## 25.2 连接池

MongoDB 驱动维护一个连接池，复用 TCP 连接避免频繁握手。

### 工作机制

\`\`\`
应用 ──→ [连接池] ──→ MongoDB
            │
            ├── 连接1（空闲/忙碌）
            ├── 连接2（忙碌）
            ├── 连接3（空闲）
            └── ...
\`\`\`

### 关键参数

\`\`\`javascript
const client = await MongoClient.connect(uri, {
  maxPoolSize: 100,        // 最大连接数（默认 100）
  minPoolSize: 10,         // 最小空闲连接（默认 0）
  maxIdleTimeMS: 30000,    // 空闲连接最大存活时间（默认 30s）
  waitQueueTimeoutMS: 5000 // 获取连接超时（默认无超时）
});
\`\`\`

### 池大小调优

| 场景 | 建议 maxPoolSize |
| --- | --- |
| 小应用 | 10-20 |
| 中型应用 | 50 |
| 大型应用 | 100（默认） |
| 微服务（每实例） | 20-50 |

> **重要**：连接池大小是**单进程**的。如果有 10 个应用实例，每个 maxPoolSize=100，MongoDB 总连接数 = 1000。MongoDB 单实例最大连接数默认 1 万，要算好总数。

### 连接泄漏排查

\`\`\`javascript
// 监控连接池状态
const db = client.db("shop");
const serverStatus = await db.admin().command({ serverStatus: 1 });
console.log("当前连接数：", serverStatus.connections.current);
console.log("可用连接数：", serverStatus.connections.available);

// Node.js 驱动监听连接事件
client.on("connectionPoolCreated", (event) => console.log("池创建", event));
client.on("connectionCreated", (event) => console.log("连接创建", event));
client.on("connectionClosed", (event) => console.log("连接关闭", event));
\`\`\`

## 25.3 Node.js 驱动示例

### 完整 CRUD 示例

\`\`\`javascript
const { MongoClient, ObjectId } = require("mongodb");

async function main() {
  const client = await MongoClient.connect(
    "mongodb://localhost:27017/shop?replicaSet=rs0",
    {
      maxPoolSize: 50,
      retryWrites: true,
      serverSelectionTimeoutMS: 5000
    }
  );

  const db = client.db("shop");
  const products = db.collection("products");

  // 插入
  const result = await products.insertOne({
    name: "MongoDB 实战书",
    price: 99,
    stock: 100,
    tags: ["database", "nosql"],
    createdAt: new Date()
  });
  console.log("插入 ID：", result.insertedId);

  // 批量插入
  await products.insertMany([
    { name: "商品A", price: 50 },
    { name: "商品B", price: 80 }
  ]);

  // 查询
  const product = await products.findOne({ _id: result.insertedId });
  const cheapProducts = await products
    .find({ price: { $lt: 100 } })
    .sort({ price: 1 })
    .limit(10)
    .toArray();

  // 更新
  await products.updateOne(
    { _id: result.insertedId },
    { $inc: { stock: -1 }, $set: { updatedAt: new Date() } }
  );

  // 删除
  await products.deleteOne({ _id: result.insertedId });

  // 事务
  const session = client.startSession();
  try {
    session.startTransaction();
    await products.updateOne(
      { _id: ObjectId("..."), stock: { $gte: 1 } },
      { $inc: { stock: -1 } },
      { session }
    );
    await db.collection("orders").insertOne(
      { productId: ObjectId("..."), amount: 1 },
      { session }
    );
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }

  await client.close();
}

main().catch(console.error);
\`\`\`

## 25.4 Mongoose ODM

**Mongoose** 是 Node.js 最流行的 MongoDB ODM（Object Document Mapper），提供 schema 定义、中间件、查询构建等能力。

### 基础用法

\`\`\`javascript
const mongoose = require("mongoose");

// 连接
await mongoose.connect("mongodb://localhost:27017/shop", {
  replicaSet: "rs0",
  readPreference: "secondaryPreferred",
  w: "majority",
  retryWrites: true
});

// 定义 schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0 },
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

// 虚拟字段
productSchema.virtual("isInStock").get(function() {
  return this.stock > 0;
});

// 中间件
productSchema.pre("save", function(next) {
  if (this.isModified("price") && this.price < 0) {
    return next(new Error("价格不能为负"));
  }
  next();
});

// 编译模型
const Product = mongoose.model("Product", productSchema);

// 使用
const product = new Product({ name: "MongoDB 书", price: 99, stock: 10 });
await product.save();

const found = await Product.findOne({ name: "MongoDB 书" });
console.log(found.isInStock);  // true

await Product.updateOne(
  { _id: found._id },
  { $inc: { stock: -1 } }
);
\`\`\`

### Mongoose vs 原生驱动

| 维度 | 原生驱动 | Mongoose |
| --- | --- | --- |
| 性能 | 高（无封装） | 略低（有封装开销） |
| Schema | 无（或用 DB 校验） | 内置 Schema 定义 |
| 校验 | 应用层手写 | 内置校验 |
| 中间件 | 无 | pre/post hook |
| 类型转换 | 无 | 自动 |
| 学习成本 | 低 | 中 |

> **选择建议**：
> - 业务逻辑复杂、字段固定 → Mongoose
> - 高性能场景、字段灵活 → 原生驱动
> - 不要混用，Mongoose 模型和原生 collection 混用容易出 bug

## 25.5 读写关注设置

### 写关注

\`\`\`javascript
// 1. 连接字符串级别
"mongodb://localhost/shop?w=majority&journal=true"

// 2. 驱动级别（所有操作）
const client = await MongoClient.connect(uri, {
  writeConcern: { w: "majority", j: true, wtimeout: 5000 }
});

// 3. 单次操作级别
await products.insertOne(
  { name: "重要数据" },
  { writeConcern: { w: "majority", j: true } }
);
\`\`\`

### 读关注

\`\`\`javascript
// 1. 连接字符串
"mongodb://localhost/shop?readConcernLevel=majority"

// 2. 驱动级别
const client = await MongoClient.connect(uri, {
  readConcernLevel: "majority"
});

// 3. 单次查询
await products.find({}).readConcern("majority").toArray();
\`\`\`

### 推荐组合

| 业务场景 | writeConcern | readConcern | readPreference |
| --- | --- | --- | --- |
| 金融交易 | majority + journal | majority | primary |
| 普通业务 | majority | local | primary |
| 报表统计 | majority | majority | secondaryPreferred |
| 实时分析 | 1 | local | nearest |
| 缓存场景 | 1 | local | nearest |

## 25.6 本章小结

- 连接字符串是配置入口，关键参数：replicaSet、authSource、readPreference、w
- 连接池复用 TCP 连接，maxPoolSize 默认 100，要按实例数和总连接数统筹
- Node.js 驱动支持完整 CRUD + 事务，retryWrites 是必备配置
- Mongoose 提供 Schema/校验/中间件，适合业务复杂场景
- 读写关注按业务重要性分级：金融 majority+journal，缓存 w=1

> **踩坑提示**：
> - 连接泄漏是常见问题，确保 client.close() 在 finally 中调用
> - Mongoose 性能比原生驱动低 20-30%，高性能场景慎用
> - retryWrites 只对单文档写操作生效，多文档事务要自己重试
> - 生产环境必用 majority 写关注，单机 w=1 在故障时可能丢数据
> - 微服务架构要为每个服务单独配置连接池，避免相互影响`
  }
];

export { chapters };
