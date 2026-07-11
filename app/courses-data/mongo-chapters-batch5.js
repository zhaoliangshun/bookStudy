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

单机 MongoDB 没有高可用——服务器宕机服务就中断，磁盘损坏数据就丢失。**副本集（Replica Set）** 是 MongoDB 实现高可用与数据安全的基础机制，通过多节点数据冗余 + 自动故障转移，保证服务持续可用。本章系统讲解副本集的架构、组件、搭建流程与日常运维。

## 21.1 为什么需要副本集

单机 MongoDB 面临三大风险：

- **单点故障**：服务器宕机，业务全部中断
- **数据丢失**：磁盘损坏、误操作（dropDatabase / deleteMany）后无救
- **读写争抢**：所有读写打到同一节点，高峰期互相影响

副本集的解决思路：

| 风险 | 副本集解决方式 |
| --- | --- |
| 单点故障 | 多节点冗余 + 自动故障转移，主节点宕机秒级切换 |
| 数据丢失 | 多份数据副本，单节点损坏数据仍在 |
| 读写争抢 | 写主、读从，读写分离分摊压力 |

> **核心概念**：副本集 ≠ 早期 master-slave。MongoDB 4.0 起已废弃 master-slave 模式，**副本集是其唯一推荐的高可用方案**，自带自动故障转移、投票选举、oplog 增量同步等能力。

## 21.2 副本集的三种角色

副本集由一组维护相同数据集合的 MongoDB 实例组成，每个成员有以下特性：

- **数据冗余**：多份数据副本，单节点损坏数据不丢
- **高可用**：主节点宕机自动选举新主，服务不中断
- **读写分离**：写主节点，读可分散到从节点
- **自动恢复**：节点重启后自动同步增量数据

副本集有三种角色：

| 角色 | 职责 | 是否存数据 | 是否投票 | 默认可读 |
| --- | --- | --- | --- | --- |
| **Primary** | 处理所有写请求，默认处理读 | 是 | 是 | 是 |
| **Secondary** | 同步 Primary 数据，可处理读 | 是 | 是 | 否（需配置 readPreference） |
| **Arbiter** | 只参与选举，不存数据 | 否 | 是 | 否 |

### Primary（主节点）

副本集内**唯一可写**的节点。所有写操作先到 Primary，写入 oplog，再异步同步到 Secondary。

\`\`\`javascript
// 写入只走 primary
db.products.insertOne({ name: "商品A", price: 99 });
db.products.updateOne({ _id: 1 }, { $inc: { stock: -1 } });
\`\`\`

### Secondary（从节点）

通过 oplog 同步 Primary 的写操作，可配置为多种用途：

- **可读从节点**：通过 readPreference 让读请求分流
- **隐藏节点（hidden）**：不参与读，专用于备份/报表
- **延迟节点（delayed）**：数据落后主节点一段时间，用于误操作恢复
- **优先级 0 节点**：永不成为主，作容灾备份

\`\`\`javascript
// Node.js 从 secondary 读
const client = await MongoClient.connect(
  "mongodb://host1:27017,host2:27017,host3:27017/?replicaSet=rs0",
  { readPreference: "secondaryPreferred" }
);
\`\`\`

### Arbiter（仲裁节点）

不存数据，只在选举时投票。**用于凑奇数票数**，避免脑裂。

> **踩坑提示**：Arbiter 资源消耗极低（不存数据），但不要在生产环境大量使用。数据节点本身就能投票，Arbiter 主要用于 "2 数据节点 + 1 仲裁" 的轻量部署。3 数据节点副本集不需要 Arbiter。

## 21.3 副本集架构图

\`\`\`
                ┌─────────────────────────┐
                │  Primary (写 + 默认读)   │
                │  localhost:27017        │
                └──────┬──────────────────┘
                       │ oplog 同步
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │Secondary │ │Secondary │ │ Arbiter  │
    │ :27018   │ │ :27019   │ │ :27020   │
    │ (可读)   │ │ (hidden) │ │ (只投票) │
    └──────────┘ └──────────┘ └──────────┘
\`\`\`

数据流向：

1. 客户端写请求 → Primary
2. Primary 写入本地 oplog + 数据集合
3. Secondary 拉取 Primary 的 oplog，回放到本地
4. 客户端读请求 → 按 readPreference 路由

## 21.4 副本集搭建

### 单机多端口模拟副本集（学习用）

\`\`\`bash
# 创建三个数据目录
mkdir -p /data/rs0-1 /data/rs0-2 /data/rs0-3

# 启动三个 mongod 实例（不同端口，同一 replSet）
mongod --replSet rs0 --port 27017 --dbpath /data/rs0-1 --fork --logpath /var/log/mongo/rs0-1.log
mongod --replSet rs0 --port 27018 --dbpath /data/rs0-2 --fork --logpath /var/log/mongo/rs0-2.log
mongod --replSet rs0 --port 27019 --dbpath /data/rs0-3 --fork --logpath /var/log/mongo/rs0-3.log

# 检查进程
ps aux | grep mongod
\`\`\`

### 初始化副本集

\`\`\`javascript
// 连到任意一个节点
mongo --port 27017

// 执行初始化（最简配置）
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
});

// 查看状态
rs.status();
\`\`\`

### 完整初始化（带优先级和标签）

\`\`\`javascript
rs.initiate({
  _id: "rs0",
  members: [
    {
      _id: 0,
      host: "localhost:27017",
      priority: 10,                  // 优先成为 primary
      tags: { region: "east", role: "primary" }
    },
    {
      _id: 1,
      host: "localhost:27018",
      priority: 5,
      tags: { region: "east", role: "secondary" }
    },
    {
      _id: 2,
      host: "localhost:27019",
      priority: 0,                   // 永不成为 primary
      hidden: true,                  // 隐藏节点
      tags: { region: "east", role: "backup" }
    }
  ]
});
\`\`\`

### 添加仲裁节点

\`\`\`javascript
// 启动仲裁节点（无需大 dbpath）
mongod --replSet rs0 --port 27020 --dbpath /data/rs0-arb --fork --logpath /var/log/mongo/rs0-arb.log

// 在 primary 上添加
rs.addArb("localhost:27020");
\`\`\`

### 添加/移除节点

\`\`\`javascript
// 添加从节点（带优先级）
rs.add({ host: "localhost:27021", priority: 1 });

// 添加带投票限制的从节点（最多 7 投票成员）
rs.add({ host: "localhost:27022", votes: 0, priority: 0 });

// 移除节点
rs.remove("localhost:27021");

// 查看配置
rs.conf();

// 重新加载配置（修改后必须 reconfig）
const cfg = rs.conf();
cfg.members[0].priority = 20;
rs.reconfig(cfg);
\`\`\`

## 21.5 成员配置详解

rs.conf() 返回的成员字段含义：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| _id | int | 成员编号，唯一 |
| host | string | 主机:端口 |
| priority | int | 优先级（0-1000），决定竞选顺序 |
| votes | int | 投票权（0 或 1），最多 7 个投票成员 |
| hidden | bool | 是否隐藏（对客户端不可见） |
| arbiterOnly | bool | 是否仲裁节点 |
| slaveDelay | int | 同步延迟秒数（delayed 节点） |
| buildIndexes | bool | 是否建索引（priority=0 才能设 false） |
| tags | object | 自定义标签，用于 readPreference 路由 |
| secondaryDelaySecs | int | 同 slaveDelay，新名称 |

\`\`\`javascript
// 完整配置示例：5 节点副本集
{
  _id: "rs0",
  version: 3,
  members: [
    { _id: 0, host: "primary:27017", priority: 100, votes: 1 },
    { _id: 1, host: "secondary1:27017", priority: 50, votes: 1 },
    { _id: 2, host: "secondary2:27017", priority: 50, votes: 1 },
    { _id: 3, host: "hidden:27017", priority: 0, votes: 1, hidden: true },
    { _id: 4, host: "delayed:27017", priority: 0, votes: 1, hidden: true, secondaryDelaySecs: 3600 },
    { _id: 5, host: "dr-only:27017", priority: 0, votes: 0 }  // 不投票
  ]
}
\`\`\`

### priority（优先级）

- 范围 0-1000，默认 1
- priority=0 永不成为 Primary
- 高 priority 节点会优先竞选（Primary 让位时高 priority 接管）

### votes（投票权）

- 0 或 1，默认 1
- **最多 7 个投票成员**
- 副本集最多 50 个成员，超出 7 个的必须 votes=0

### hidden（隐藏）

- hidden=true 对客户端不可见
- 不参与 readPreference 路由
- 适合备份/报表节点

### secondaryDelaySecs（延迟）

- 数据落后 Primary N 秒
- 用于人为灾难恢复（误删数据后从延迟节点捞回）
- 必须 priority=0 + hidden=true

## 21.6 选举机制概览

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

// 强制给某节点投票（紧急故障恢复）
// 在 secondary 上执行
db.adminCommand({ replSetReconfig: cfg, force: true });
\`\`\`

### 投票节点数限制

副本集**最多 50 个成员，其中最多 7 个投票成员**。多数派 = ⌊N/2⌋ + 1。

| 投票节点数 | 多数派 | 可容忍故障数 |
| --- | --- | --- |
| 3 | 2 | 1 |
| 5 | 3 | 2 |
| 7 | 4 | 3 |

> **生产建议**：奇数节点（3 或 5），避免偶数节点导致脑裂。偶数节点（如 4）遇到网络分区时两边都凑不到多数派，导致无主。

## 21.7 数据同步机制

### Initial Sync（全量同步）

新节点加入或落后太多时，从 Primary 完整拷贝数据。

\`\`\`bash
# 查看同步进度
mongo --port 27018
rs.printSyncProgress();

# 或在 primary 上查看各节点同步状态
rs.status().members.forEach(m => printjson({
  name: m.name,
  state: m.stateStr,
  optimeDate: m.optimeDate,
  lag: m.optimeDate - m.lastHeartbeat
}));
\`\`\`

过程：

1. 拷贝所有集合的当前数据（除 local 库）
2. 期间记录 Primary 的 oplog 写入
3. 拷贝完成后回放期间 oplog
4. 进入正常同步状态

### Oplog（增量同步）

**oplog** 是一个特殊的固定集合 \`local.oplog.rs\`，记录 Primary 的所有写操作。

\`\`\`javascript
// 查看 oplog
use local;
db.oplog.rs.find().sort({ $natural: -1 }).limit(5);

// 查看 oplog 大小和保留时间
rs.printReplicationInfo();
// 输出示例：
// configured oplog size:   2048MB
// log length start to end: 172800 secs (48 hrs)
// now:                     2024-01-01T00:00:00Z
\`\`\`

oplog 单条记录结构：

\`\`\`javascript
{
  ts: Timestamp(1700000000, 1),  // 时间戳
  t: NumberLong(5),               // term（任期）
  h: NumberLong(1234567890),      // 哈希
  v: 2,                           // oplog 版本
  op: "i",                        // 操作类型：i=insert, u=update, d=delete, c=command
  ns: "shop.products",            // 命名空间
  ui: UUID("..."),                // collection UUID
  wall: ISODate("..."),           // 服务端时间
  o: { _id: 1, name: "商品A" }    // 操作内容
}
\`\`\`

**关键参数**：

- \`oplogSizeMB\`：oplog 大小，决定能保留多长时间的操作历史
- 默认按磁盘 5% 计算，最小 1GB，最大 50GB

\`\`\`bash
# 启动时指定 oplog 大小
mongod --replSet rs0 --oplogSize 4096

# 或在配置文件
# replication:
#   oplogSizeMB: 4096
\`\`\`

### 同步延迟监控

\`\`\`javascript
// 查看各 secondary 的同步延迟
rs.printSecondaryReplicationInfo();

// 输出示例
// source: localhost:27018
//   syncedTo: 2024-01-01T00:00:00Z
//   0 secs (0 hrs) behind the primary
// source: localhost:27019
//   syncedTo: 2023-12-31T23:59:00Z
//   60 secs (0.02 hrs) behind the primary
\`\`\`

> **踩坑提示**：
> - oplog 太小会导致 secondary 长时间宕机后无法增量同步，被迫全量同步（耗时长、占带宽）
> - 写入密集场景建议把 oplog 调大到 10GB+
> - oplog 是固定集合，操作符顺序保证幂等
> - 同步延迟 > 10s 要排查：网络带宽、secondary 磁盘 IO、查询负载

## 21.8 读写偏好（readPreference）

readPreference 控制读请求路由到哪个节点：

\`\`\`javascript
// Node.js 驱动全局配置
const client = await MongoClient.connect(
  "mongodb://host1:27017,host2:27017,host3:27017/?replicaSet=rs0",
  { readPreference: "secondaryPreferred" }
);

// 单次查询指定
db.products.find({}).readPref("secondary");

// Node.js 驱动单次指定
const cursor = collection.find({}).readPreference("secondary");
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
const cfg = rs.conf();
cfg.members[1].tags = { region: "east", role: "report" };
cfg.members[2].tags = { region: "west", role: "report" };
rs.reconfig(cfg);

// 查询指定标签（只读 region=east 的节点）
db.products.find({}).readPref("secondary", [{ region: "east" }]);

// 多标签组合（找 region=east 且 role=report）
db.products.find({}).readPref("secondary", [{ region: "east", role: "report" }]);
\`\`\`

### 标签的实际用途

| 场景 | 标签配置 | readPreference |
| --- | --- | --- |
| 报表查询不打扰主 | role=report | secondary + [{role:"report"}] |
| 跨地域就近读 | region=east/west | nearest + [{region:"east"}] |
| 备份节点专用 | role=backup | secondary + [{role:"backup"}] |

> **踩坑提示**：
> - secondary 读可能读到旧数据（异步同步有延迟），强一致场景必须读 primary
> - secondary 读会分担 primary 压力，但 secondary 太多写压力大时同步会延迟，导致读更旧
> - 不要把报表查询打到 primary，会拖垮业务写入
> - readPreference=secondary 时若所有从节点都挂了，查询会失败（不会自动回退到 primary）

## 21.9 副本集运维命令

### 状态查看

\`\`\`javascript
// 查看副本集状态（成员、角色、同步情况）
rs.status();

// 查看配置
rs.conf();

// 查看同步信息
rs.printReplicationInfo();      // oplog 信息
rs.printSecondaryReplicationInfo();  // 各从节点延迟

// 是否是 primary
db.hello().isWritablePrimary;
db.isMaster().ismaster;  // 旧写法
\`\`\`

### 故障处理

\`\`\`javascript
// 强制重新配置（少数派时，force: true）
const cfg = rs.conf();
cfg.members = cfg.members.filter(m => m.host !== "down-host:27017");
rs.reconfig(cfg, { force: true });

// 让 primary 让位（触发选举）
rs.stepDown(60);  // 60 秒内不竞选

// 冻结当前节点（防止竞选）
rs.freeze(120);  // 120 秒内不成为 primary
rs.freeze(0);    // 解除冻结

// 降级（让节点暂时不参与选举）
db.adminCommand({ replSetMaintenance: true });
\`\`\`

### 节点维护

\`\`\`javascript
// 把节点移出副本集做维护
rs.remove("maintenance-host:27017");
// ... 维护操作（升级版本、修复硬件）...
rs.add("maintenance-host:27017");

// 或单节点维护模式（不触发选举）
// 在该节点上执行
db.adminCommand({ replSetMaintenance: true });
\`\`\`

## 21.10 生产部署最佳实践

### 节点拓扑

- **3 节点副本集**：1 Primary + 2 Secondary（最常用）
- **5 节点副本集**：1 Primary + 3 Secondary + 1 Hidden/Delayed（高要求）
- **跨机房**：3 机房各 1 节点，或 2 机房 2+1 + 1 Arbiter 凑奇数

### 配置文件示例

\`\`\`yaml
# /etc/mongod.conf
storage:
  dbPath: /data/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 8

replication:
  replSetName: rs0
  oplogSizeMB: 10240

net:
  port: 27017
  bindIp: 0.0.0.0

security:
  authorization: enabled
  keyFile: /etc/mongodb/keyfile  # 副本集内部认证

processManagement:
  fork: true
  pidFilePath: /var/run/mongod.pid

systemLog:
  destination: file
  path: /var/log/mongodb/mongod.log
  logAppend: true
\`\`\`

### keyFile 内部认证

副本集成员间通信需要 keyFile 认证：

\`\`\`bash
# 生成 keyFile（所有节点用同一份）
openssl rand -base64 756 > /etc/mongodb/keyfile
chmod 400 /etc/mongodb/keyfile

# 复制到所有节点
scp /etc/mongodb/keyfile user@host2:/etc/mongodb/keyfile
\`\`\`

### 生产环境检查清单

- [ ] 节点数为奇数（3 或 5）
- [ ] oplogSize 至少 10GB
- [ ] 配置 keyFile 内部认证
- [ ] 开启 authorization 用户认证
- [ ] journal 已开启（默认开启）
- [ ] bindIp 不暴露公网
- [ ] 监控同步延迟、连接数、QPS
- [ ] 部署至少 1 个 hidden/delayed 节点
- [ ] 备份策略：定时 mongodump / 文件系统快照

## 21.11 本章小结

- 副本集 = 数据冗余 + 自动故障转移，是 MongoDB 高可用基础
- 三种角色：**Primary**（写）、**Secondary**（读+冗余）、**Arbiter**（投票）
- 成员配置：priority（优先级）、votes（投票权）、hidden（隐藏）、secondaryDelaySecs（延迟）
- 选举基于多数派投票，建议奇数节点（3 或 5）
- 同步分 **initial sync**（全量）和 **oplog**（增量），oplog 大小决定恢复窗口
- readPreference 控制读路由，强一致读 primary，报表读 secondary

> **踩坑提示**：
> - 生产环境**必须**部署副本集，单机模式数据丢失风险高
> - 跨机房部署要考虑网络延迟，oplog 同步延迟会影响读一致性
> - Arbiter 不存数据，资源消耗低，但不要把它当数据节点用
> - priority=0 + hidden + secondaryDelaySecs 是误操作的最后一道防线
> - 修改 rs.conf() 后必须 rs.reconfig() 才生效，操作前备份配置`
  },

  {
    id: "mongo-ch22",
    group: "第五部分 高可用架构",
    icon: "🗳️",
    title: "第 22 章 选举与故障转移",
    content: `# 第 22 章 选举与故障转移

上一章介绍了副本集基础。本章深入选举机制：什么情况触发选举、Raft 共识协议如何工作、如何通过 priority/votes 控制选举结果、stepDown 与强制故障转移、脑裂预防，以及读偏好（readPreference）的完整使用方法。

## 22.1 选举的本质

选举（Election）是副本集在 Primary 故障时，自动选出新 Primary 的过程。MongoDB 选举基于 **Raft 共识协议的变种**，核心目标：

- **安全性**：同一任期最多一个 Primary
- **可用性**：少数派故障时仍能选出新 Primary
- **一致性**：新 Primary 必须拥有最新数据

> **关键概念**：
> - **Term（任期）**：单调递增的整数，每次选举 term+1
> - **Heartbeat（心跳）**：节点间每 2s 互发，超时认为故障
> - **Candidate（候选人）**：发起选举的节点
> - **Vote（投票）**：每个节点在一个 term 内只能投一票

## 22.2 选举触发条件

副本集选举在以下情况触发：

### 1. Primary 故障

Primary 宕机、进程退出、网络隔离，Secondary 检测到心跳超时（默认 10 秒）后发起选举。

\`\`\`bash
# 查看心跳超时配置
mongod --setParameter electionTimeoutMillis=10000

# 或配置文件
# replication:
#   electionTimeoutMillis: 10000
\`\`\`

### 2. 手动让位（stepDown）

\`\`\`javascript
// 当前 primary 主动让位，触发选举
rs.stepDown(60);  // 60 秒内不重新竞选

// 也可以指定让位参数
rs.stepDown(60, 30);  // 第二参数是 catchUpPeriodSecs（追赶期）
\`\`\`

### 3. 拓扑变化

添加/移除节点、调整 priority 都可能触发选举。

\`\`\`javascript
// 调整 priority 后可能触发选举
const cfg = rs.conf();
cfg.members[1].priority = 10;  // 把 member 1 的优先级提到最高
rs.reconfig(cfg);
// 如果 member 1 优先级高于当前 primary，会触发选举
\`\`\`

### 4. 网络分区

少数派节点无法联系多数派，会尝试选举但无法获得多数票，导致**无主状态**。

\`\`\`
网络分区前：[A, B, C]  A=primary
分区后：[A] | [B, C]
  - A 失去多数派，降级为 secondary（拒绝写）
  - B, C 凑成多数派，选举 B 为新 primary
\`\`\`

## 22.3 选举过程详解

选举基于 **Raft 协议变种**，过程如下：

### 阶段 1：检测故障

Secondary 发现 Primary 心跳超时（electionTimeoutMillis，默认 10s）。

\`\`\`javascript
// 查看心跳信息
rs.status().members.forEach(m => {
  print(\`节点: \${m.name}, 状态: \${m.stateStr}, 上次心跳: \${m.lastHeartbeatReceived}\`);
});
\`\`\`

### 阶段 2：候选阶段

高优先级 Secondary 成为候选人：

1. 自增 term（任期）
2. 给自己投票
3. 向其他节点发送 \`replSetRequestVotes\` 拉票

### 阶段 3：投票阶段

- 每个节点一票，先到先得
- **同任期只投一次**
- 候选人的 oplog 必须比投票者新或相等才能获得票

### 阶段 4：确认阶段

候选人获得 > N/2 票数后成为新 Primary。

### 阶段 5：同步阶段

新 Primary 同步最新 oplog，开始接受写入。

\`\`\`javascript
// 查看选举事件
db.adminCommand({ replSetGetStatus: 1 });

// 关键字段
{
  "myState": 1,  // 1=primary, 2=secondary, 3=recovering, ...
  "term": NumberLong(5),  // 当前任期
  "members": [
    {
      "name": "host1:27017",
      "stateStr": "PRIMARY",
      "electionTime": ISODate("..."),  // 当选时间
      "optimeDate": ISODate("..."),    // oplog 最新时间
      "lastHeartbeat": ISODate("..."), // 上次心跳
      "lastHeartbeatRecv": ISODate("...")
    }
  ]
}
\`\`\`

### 状态码速查表

| state | stateStr | 含义 |
| --- | --- | --- |
| 1 | PRIMARY | 主节点 |
| 2 | SECONDARY | 从节点 |
| 3 | RECOVERING | 恢复中（同步中） |
| 4 | FATAL | 不可恢复错误 |
| 5 | STARTUP | 启动中 |
| 6 | UNKNOWN | 未知（无法通信） |
| 7 | ARBITER | 仲裁节点 |
| 8 | DOWN | 宕机 |
| 9 | ROLLBACK | 回滚中 |
| 10 | REMOVED | 已移除 |

> **关键规则**：
> - 同一个节点在同一任期内只能投一次票
> - 候选人的 oplog 必须比投票者新或相等才能获得票
> - 优先级高的节点优先发起选举
> - 选举失败会重试，每次 term+1

## 22.4 priority 与 votes

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
- 跨机房部署用 priority 控制主节点位置

\`\`\`javascript
// 跨机房部署示例
// 机房 A（主机房）：高优先级
{ host: "dc1-a:27017", priority: 100 }
{ host: "dc1-b:27017", priority: 90 }
// 机房 B（容灾机房）：低优先级，正常情况只读
{ host: "dc2-a:27017", priority: 10 }
{ host: "dc2-b:27017", priority: 5 }
// hidden 备份节点
{ host: "dc2-c:27017", priority: 0, hidden: true }
\`\`\`

### votes（投票权）

控制节点是否参与投票。0 表示不投票，1 表示投票。**最多 7 个投票节点**。

\`\`\`javascript
// 7 节点副本集：5 投票 + 2 不投票
const cfg = rs.conf();
cfg.members[5].votes = 0;
cfg.members[6].votes = 0;
// 不投票节点必须 priority=0
cfg.members[5].priority = 0;
cfg.members[6].priority = 0;
rs.reconfig(cfg);
\`\`\`

> **踩坑提示**：
> - 不要轻易把 priority 设为 0，会导致该节点永远不能成 primary
> - votes=0 的节点不参与选举投票，但仍同步数据
> - 修改 votes 后多数派可能变化，操作前确认新拓扑下多数派仍可达成
> - 5 节点副本集（3 投票 + 2 不投票）在故障时可能无法选举，慎用

## 22.5 hidden 节点

**hidden 节点**对客户端不可见，不参与读请求路由，专用于备份/报表。

\`\`\`javascript
const cfg = rs.conf();
cfg.members[2].priority = 0;     // 永不成为 primary
cfg.members[2].hidden = true;    // 隐藏节点
rs.reconfig(cfg);
\`\`\`

**特点**：

- 不被客户端发现（\`hello\` / \`isMaster\` 命令不返回）
- 不参与读路由（即使 readPreference=secondary 也读不到它）
- 仍同步数据，仍可投票
- 适合跑报表、备份任务，不影响业务

\`\`\`javascript
// 单独连接 hidden 节点跑报表（直连模式）
const client = await MongoClient.connect("mongodb://hidden-host:27017", {
  readPreference: "secondary",
  // 直连该节点，不通过副本集路由
  directConnection: true
});
\`\`\`

### hidden 节点的典型应用

| 场景 | 配置 | 说明 |
| --- | --- | --- |
| 备份节点 | hidden=true, priority=0 | 定时 mongodump，不影响业务 |
| 报表查询 | hidden=true, priority=0 | 直连跑大查询，不抢资源 |
| 监控分析 | hidden=true, priority=0 | 跑聚合分析，不影响主从 |

## 22.6 delayed 节点

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
const delayedClient = await MongoClient.connect("mongodb://delayed-host:27017", {
  directConnection: true
});
const users = delayedClient.db("shop").collection("users");
const deletedUsers = await users.find({}).toArray();
console.log(\`找到 \${deletedUsers.length} 条被删数据\`);

// 再写回 primary
const primaryClient = await MongoClient.connect("mongodb://primary-host:27017");
await primaryClient.db("shop").collection("users").insertMany(deletedUsers);
\`\`\`

### delayed 节点配置原则

- secondaryDelaySecs 要大于业务最大维护时间（一般 1-6 小时）
- priority 必须为 0，否则可能成为 primary 导致数据回退
- hidden 也应为 true，避免读路由读到旧数据
- votes 通常为 1（保留投票权）

> **踩坑提示**：
> - delayed 节点 priority 必须为 0，否则竞选成功会让整个副本集数据"回退"
> - delayed 节点 hidden 也应为 true，避免读路由
> - 不要用 delayed 节点跑业务读，它数据是旧的
> - delayed 节点是误操作的最后一道防线，生产环境建议至少 1 个

## 22.7 stepDown 与强制故障转移

### 主动让位（stepDown）

\`\`\`javascript
// 当前 primary 让位，触发选举
rs.stepDown();  // 默认 60 秒不重新竞选

// 指定让位时间
rs.stepDown(120);  // 120 秒内不竞选

// 完整参数：stepDown(seconds, catchUpPeriodSecs)
rs.stepDown(60, 30);
// - seconds: 让位期（不竞选）
// - catchUpPeriodSecs: 新主追赶期（必须同步到旧主 oplog 才能写）
\`\`\`

### 冻结节点（freeze）

\`\`\`javascript
// 让某节点 N 秒内不能成为 primary
rs.freeze(300);  // 5 分钟内不竞选

// 解除冻结
rs.freeze(0);
\`\`\`

### 强制故障转移（少数派场景）

当多数派节点故障，但少数派节点仍可用时，可以强制重新配置：

\`\`\`javascript
// 警告：仅紧急情况使用！
// 假设 5 节点副本集，3 节点故障，剩 2 节点
// 在剩余的 secondary 上执行

const cfg = rs.conf();
// 移除故障节点
cfg.members = cfg.members.filter(m => 
  m.host !== "down-host1:27017" && 
  m.host !== "down-host2:27017" &&
  m.host !== "down-host3:27017"
);
// 强制重新配置（不需要多数派同意）
rs.reconfig(cfg, { force: true });

// 现在 2 节点凑成多数派，可选举 primary
\`\`\`

> **重要**：强制重新配置（force: true）有数据丢失风险，操作前评估：
> - 故障节点上是否有未同步的写入
> - 是否能用 stepDown/wait 等故障节点恢复
> - 操作后必须全面检查数据一致性

## 22.8 脑裂（Split Brain）预防

**脑裂**：网络分区导致两个子网各自选举 Primary，出现"双主"。

MongoDB 通过**多数派投票**天然防止脑裂：

\`\`\`
副本集：[A, B, C, D, E]  A=primary, 5 节点

网络分区：[A, B] | [C, D, E]
  - [A, B] 只有 2 票，达不到多数派（3）
    → A 降级为 secondary，子网无主
  - [C, D, E] 有 3 票，达到多数派
    → C 当选新 primary

结果：始终只有一个 primary，无脑裂
\`\`\`

### 脑裂的极端情况

偶数节点（如 4 节点）网络分区时可能两边都凑不到多数派：

\`\`\`
副本集：[A, B, C, D]  4 节点

分区：[A, B] | [C, D]
  - [A, B] 2 票 < 3（多数派）
  - [C, D] 2 票 < 3（多数派）
  → 双方都无主，副本集不可写
\`\`\`

**预防措施**：

1. **奇数节点**：3 或 5，保证分区后一边能凑多数派
2. **arbiter 凑奇数**：2 数据节点 + 1 arbiter
3. **合理 electionTimeoutMillis**：不要太短（易误判），不要太长（故障转移慢）

\`\`\`bash
# 调整心跳超时（缩短故障检测时间，但更易误判）
mongod --setParameter electionTimeoutMillis=5000

# 跨机房部署建议调大（避免网络抖动误判）
mongod --setParameter electionTimeoutMillis=20000
\`\`\`

## 22.9 故障转移时间

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

// 手动重试封装
async function writeWithRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.code === 10107 || err.code === 13435) {
        // NotWritablePrimary / ServerNotWritable
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
}
\`\`\`

## 22.10 读偏好详解（Read Preference）

readPreference 控制 mongos / 驱动如何选节点读：

### 5 种模式

| 模式 | 行为 | 一致性 | 适用场景 |
| --- | --- | --- | --- |
| primary（默认） | 只读主 | 强一致 | 默认业务读 |
| primaryPreferred | 优先主，主不可用读从 | 强一致优先 | 故障转移期可读 |
| secondary | 只读从 | 最终一致 | 报表、备份 |
| secondaryPreferred | 优先从，从不可用读主 | 最终一致优先 | 读多写少 |
| nearest | 最低延迟节点 | 最终一致 | 地理分散 |

### 各种设置方式

\`\`\`javascript
// 1. 连接字符串
"mongodb://host1:27017,host2:27017/?replicaSet=rs0&readPreference=secondaryPreferred"

// 2. 驱动全局配置
const client = await MongoClient.connect(uri, {
  readPreference: "secondaryPreferred"
});

// 3. 数据库级别
const db = client.db("shop", { readPreference: "secondary" });

// 4. 集合级别
const coll = db.collection("orders", { readPreference: "nearest" });

// 5. 单次查询
collection.find({}).readPref("secondary");

// 6. 聚合
collection.aggregate([{\$match:{}}], { readPreference: "secondary" });
\`\`\`

### 优先级覆盖

后设置的优先级更高：

\`\`\`
client (primary) > db (secondary) > collection (nearest) > cursor (secondaryPreferred)
\`\`\`

实际生效的是 cursor 级别（最后设置）。

### readPreference 与一致性

\`\`\`javascript
// 强一致场景：写完立即读，必须读主
const result = await orders.insertOne({ userId: 1, amount: 100 });
const order = await orders.findOne(
  { _id: result.insertedId },
  { readPreference: "primary" }  // 强制读主
);

// 错误示范：写完读从，可能读不到刚写的数据
// const order = await orders.findOne(
//   { _id: result.insertedId },
//   { readPreference: "secondary" }
// );  // 可能返回 null！
\`\`\`

## 22.11 选举监控与告警

### 关键监控指标

\`\`\`javascript
// 1. 副本集状态
rs.status();

// 2. 主节点变化历史
db.adminCommand({ replSetGetStatus: 1 }).electionCandidateMetrics;

// 3. 各节点同步延迟
rs.printSecondaryReplicationInfo();

// 4. oplog 窗口
rs.printReplicationInfo();
\`\`\`

### 告警阈值建议

| 指标 | 告警阈值 | 严重告警 |
| --- | --- | --- |
| 同步延迟 | > 10s | > 60s |
| oplog 窗口 | < 24h | < 1h |
| 投票成员数 | < 3 | < 2 |
| 心跳失败 | > 0 | > 5/min |
| 选举频率 | > 1/hour | > 5/hour |

### 选举日志

\`\`\`bash
# 查看选举相关日志
grep -E "election|vote|primary" /var/log/mongodb/mongod.log

# 典型选举日志
# "ReplicaSetMonitor::isMaster received an error response from node"
# "Starting an election"
# "VoteRequester ... successfully received a Yes vote"
# "won election"
# "Stepping down from primary in response to freeze command"
\`\`\`

## 22.12 本章小结

- 选举触发：Primary 故障、手动让位、拓扑变化、网络分区
- 选举基于 **Raft 变种**，多数派投票，同任期只投一次
- **priority** 控制优先级，**votes** 控制投票权（最多 7 投票）
- **hidden 节点**对客户端不可见，适合备份/报表
- **delayed 节点**数据落后，用于人为灾难恢复
- 故障转移总耗时 10-15 秒，可通过 electionTimeoutMillis 调整
- readPreference 5 种模式：primary / primaryPreferred / secondary / secondaryPreferred / nearest

> **踩坑提示**：
> - 跨机房部署用 priority 控制主节点位置，避免主节点漂移到延迟高的机房
> - delayed 节点是误操作的最后一道防线，生产环境建议至少 1 个
> - 故障转移期间应用必须重试，retryWrites=true 是必备配置
> - 不要用 priority=0 的节点跑业务读，它不参与读路由（hidden），但可以单独连
> - 偶数节点副本集遇到网络分区会无主，必须奇数节点
> - 强一致读必须用 readPreference=primary，否则可能读到旧数据`
  },

  {
    id: "mongo-ch23",
    group: "第五部分 高可用架构",
    icon: "🧩",
    title: "第 23 章 分片集群",
    content: `# 第 23 章 分片集群

副本集解决了高可用，但**单节点存储和计算能力有上限**。当数据量超过单机磁盘、内存或 CPU 承受能力，需要**分片（Sharding）** 把数据水平拆分到多个节点。本章讲解分片集群的架构、组件、分片键选择与搭建流程。

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

### 何时开始分片

| 触发条件 | 说明 |
| --- | --- |
| 单集合 > 1TB | 索引占内存过大，查询慢 |
| 写入 QPS > 1 万 | 单 primary 写入压力大 |
| 数据增长率快 | 半年内预计超 5TB |
| 地理分布需求 | 全球用户就近访问 |
| 内存命中率 < 90% | 数据远超内存 |

## 23.2 分片集群架构

分片集群由三类组件构成：

\`\`\`
                  ┌──────────────┐
   客户端 ───────→│   mongos     │  路由进程（无状态）
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
                  │ Config Server│  元数据（副本集）
                  │  (3 节点)    │
                  └──────────────┘
\`\`\`

数据流向：

1. 客户端连 mongos（不直连 shard）
2. mongos 从 config server 读路由表
3. mongos 根据分片键路由请求到目标 shard
4. shard 返回结果，mongos 合并后返回客户端

## 23.3 三大组件详解

### mongos（路由）

客户端连接的入口，**无状态**，可水平扩展。

- 接收客户端请求，根据分片键路由到目标 shard
- 合并多个 shard 的查询结果
- 不存数据，可部署多个做负载均衡
- 缓存 config server 的路由表

\`\`\`bash
# 启动 mongos
mongos --configdb csrs/localhost:27019,localhost:27020,localhost:27021 --port 27017 --fork

# 或配置文件
# sharding:
#   configDB: csrs/localhost:27019,localhost:27020,localhost:27021
# net:
#   port: 27017
\`\`\`

> **mongos 部署建议**：
> - 至少部署 2 个，避免单点故障
> - 部署在应用服务器本地，减少网络跳数
> - 每个应用实例连自己的 mongos（或共用负载均衡）

### config server（配置服务器）

存集群元数据：

- 集群有哪些 shard
- 每个 chunk 在哪个 shard（路由表）
- 数据库/集合的分片配置
- 集群范围的设置（chunk 大小、balancer 状态）

**必须是副本集**，建议 3 节点。

\`\`\`bash
# 启动 config server（副本集模式）
mongod --configsvr --replSet csrs --port 27019 --dbpath /data/config --fork

# 或配置文件
# sharding:
#   clusterRole: configsvr
# replication:
#   replSetName: csrs
\`\`\`

\`\`\`javascript
// 初始化 config server 副本集
mongo --port 27019 --eval 'rs.initiate({
  _id: "csrs",
  configsvr: true,
  members: [
    { _id: 0, host: "localhost:27019" },
    { _id: 1, host: "localhost:27020" },
    { _id: 2, host: "localhost:27021" }
  ]
})'
\`\`\`

### shard（分片）

实际存数据的节点，每个 shard 是一个**副本集**。

\`\`\`bash
# 启动 shard 1（副本集模式）
mongod --shardsvr --replSet shard1 --port 27018 --dbpath /data/shard1 --fork

# 或配置文件
# sharding:
#   clusterRole: shardsvr
# replication:
#   replSetName: shard1
\`\`\`

### 添加 shard 到集群

\`\`\`javascript
// 连到 mongos
mongo --port 27017

// 添加 shard（指定副本集名和成员）
sh.addShard("shard1/localhost:27018,localhost:27022,localhost:27023");
sh.addShard("shard2/localhost:27024,localhost:27025,localhost:27026");
sh.addShard("shard3/localhost:27027,localhost:27028,localhost:27029");

// 查看集群状态
sh.status();

// 查看 shard 列表
db.adminCommand({ listShards: 1 });
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

// 5. 哈希复合（哈希 + 范围）
sh.shardCollection("analytics.events", { userId: "hashed", ts: 1 });
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
| phone | ✅ 好 | 高基数，唯一 |
| country | ❌ 差 | 值太少（< 200 国家） |

### 分片键选择的 4 个维度

\`\`\`javascript
// 评估分片键的脚本
function evaluateShardKey(collection, field) {
  const totalDocs = db[collection].countDocuments();
  const distinctValues = db[collection].distinct(field).length;
  const cardinality = distinctValues / totalDocs;
  
  print(\`字段 \${field} 评估：
    总文档数: \${totalDocs}
    不同值数: \${distinctValues}
    基数比: \${cardinality.toFixed(4)}
    评价: \${cardinality > 0.1 ? "高基数" : cardinality > 0.01 ? "中基数" : "低基数"}\`);
}

evaluateShardKey("orders", "userId");
evaluateShardKey("orders", "status");
\`\`\`

> **踩坑提示**：
> - 分片键一旦选定不可改（5.0 前），选错可能导致数据倾斜、性能差
> - 分片键字段必须有索引（MongoDB 自动建）
> - 分片键不能改、不能删（4.2 前不能改字段值）
> - 分片键字段值不能是数组
> - 分片键最大 8KB

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
// 哈希值分布均匀，无热点
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
| 全球分布，按地区查询 | 范围分片 + zones |

### 复合分片键

\`\`\`javascript
// 复合分片键：第一个字段等值，第二个字段范围
sh.shardCollection("app.events", { userId: 1, ts: 1 });

// 查询带 userId 能路由到单 shard
db.events.find({ userId: 123, ts: { $gte: ISODate("2024-01-01") } });

// 查询不带 userId 要扫所有 shard
db.events.find({ ts: { $gte: ISODate("2024-01-01") } });  // scatter-gather
\`\`\`

## 23.6 分片集群搭建

完整流程：

\`\`\`bash
# 1. 启动 config server 副本集
mongod --configsvr --replSet csrs --port 27019 --dbpath /data/config1 --fork
mongod --configsvr --replSet csrs --port 27020 --dbpath /data/config2 --fork
mongod --configsvr --replSet csrs --port 27021 --dbpath /data/config3 --fork

# 初始化 config 副本集
mongo --port 27019 --eval 'rs.initiate({
  _id: "csrs",
  configsvr: true,
  members: [
    { _id: 0, host: "localhost:27019" },
    { _id: 1, host: "localhost:27020" },
    { _id: 2, host: "localhost:27021" }
  ]
})'

# 2. 启动 shard 副本集（每个 shard 一个副本集）
mongod --shardsvr --replSet shard1 --port 27018 --dbpath /data/shard1a --fork
mongod --shardsvr --replSet shard1 --port 27022 --dbpath /data/shard1b --fork
mongod --shardsvr --replSet shard1 --port 27023 --dbpath /data/shard1c --fork

mongo --port 27018 --eval 'rs.initiate({
  _id: "shard1",
  members: [
    { _id: 0, host: "localhost:27018" },
    { _id: 1, host: "localhost:27022" },
    { _id: 2, host: "localhost:27023" }
  ]
})'

# 重复启动 shard2, shard3 ...

# 3. 启动 mongos
mongos --configdb csrs/localhost:27019,localhost:27020,localhost:27021 --port 27017 --fork

# 4. 连到 mongos，添加 shard
mongo --port 27017
\`\`\`

### 添加 shard

\`\`\`javascript
// 添加 shard1
sh.addShard("shard1/localhost:27018,localhost:27022,localhost:27023");

// 添加 shard2
sh.addShard("shard2/localhost:27024,localhost:27025,localhost:27026");

// 查看集群状态
sh.status();
\`\`\`

### 启用分片

\`\`\`javascript
// 连到 mongos
mongo --port 27017

// 1. 启用数据库分片
sh.enableSharding("shop");

// 2. 在分片键上建索引（如果还没有）
// 注意：分片键必须有索引，支持前缀
db.orders.createIndex({ userId: 1 });

// 3. 分片集合
sh.shardCollection("shop.orders", { userId: 1 });

// 4. 哈希分片
sh.shardCollection("shop.logs", { _id: "hashed" });

// 5. 查看分片状态
sh.status();
\`\`\`

### sh.status() 输出解读

\`\`\`
--- Sharding Status ---
  sharding version: { ... }
  shards:
    {  "_id" : "shard1", "host" : "shard1/localhost:27018,localhost:27022,localhost:27023", "state" : 1 }
    {  "_id" : "shard2", "host" : "shard2/localhost:27024,localhost:27025,localhost:27026", "state" : 1 }

  databases:
    {  "_id" : "shop", "primary" : "shard1", "partitioned" : true }
      shop.orders
        shard key: { "userId" : 1 }
        chunks:
          shard1  3
          shard2  2
        { "userId" : { "$minKey" : 1 } } -->> { "userId" : 1000 } on : shard1
        { "userId" : 1000 } -->> { "userId" : 2000 } on : shard1
        ...
\`\`\`

## 23.7 Zones（数据分区）

Zones 允许把特定范围的数据固定到特定 shard，实现数据本地化。

\`\`\`javascript
// 1. 给 shard 打标签
sh.addShardTag("shard1", "US");
sh.addShardTag("shard2", "EU");
sh.addShardTag("shard3", "ASIA");

// 2. 给集合设置 zone 范围
sh.addTagRange("app.users", { region: "US", _id: MinKey }, { region: "US", _id: MaxKey }, "US");
sh.addTagRange("app.users", { region: "EU", _id: MinKey }, { region: "EU", _id: MaxKey }, "EU");
sh.addTagRange("app.users", { region: "ASIA", _id: MinKey }, { region: "ASIA", _id: MaxKey }, "ASIA");

// 3. 数据会自动路由到对应 shard
db.users.insertOne({ region: "US", name: "Alice" });  // 落到 shard1
db.users.insertOne({ region: "EU", name: "Bob" });    // 落到 shard2
\`\`\`

### Zones 应用场景

- **地理分布**：美国用户数据放美国 shard，欧洲用户放欧洲 shard
- **冷热分离**：热数据放 SSD shard，冷数据放 HDD shard
- **合规要求**：某些数据必须存在特定地区

\`\`\`javascript
// 冷热分离示例
sh.addShardTag("ssd-shard", "HOT");
sh.addShardTag("hdd-shard", "COLD");

// 2024 年数据放 HOT
sh.addTagRange(
  "logs.events",
  { ts: ISODate("2024-01-01") },
  { ts: ISODate("2025-01-01") },
  "HOT"
);

// 2023 年数据放 COLD
sh.addTagRange(
  "logs.events",
  { ts: ISODate("2023-01-01") },
  { ts: ISODate("2024-01-01") },
  "COLD"
);
\`\`\`

## 23.8 chunks 概念

**chunk** 是分片集群数据分布的最小单位。一个 chunk 是分片键连续值范围的一段数据。

\`\`\`javascript
// 查看集合的 chunk 分布
sh.status();

// 输出示例
// shop.orders
//   shard1: 3 chunks
//     range: userId MinKey --> 1000
//     range: userId 1000 --> 2000
//     range: userId 2000 --> 3000
//   shard2: 2 chunks
//     range: userId 3000 --> 4000
//     range: userId 4000 --> MaxKey
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
// 手动拆分（按查询点拆分）
sh.splitFind("shop.orders", { userId: 1500 });

// 在指定值处拆分
sh.splitAt("shop.orders", { userId: 1500 });
\`\`\`

## 23.9 分片集群的限制

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

// 4. updateMany / deleteMany 不带分片键要扫所有 shard
db.orders.updateMany({ status: "paid" }, { $set: { paid: true } });
\`\`\`

### 单文档大小

- 单文档仍受 16MB 限制
- 分片键字段值不能超过 8KB

### 事务限制

- 4.0 前不支持分片事务
- 4.2+ 支持但性能开销大，避免高频使用

## 23.10 本章小结

- 分片解决单机**存储、内存、写入**瓶颈，实现水平扩展
- 三类组件：**mongos**（路由）、**config server**（元数据）、**shard**（数据）
- 分片键选择三原则：**高基数、低频率、非单调递增**
- 范围分片支持范围查询，哈希分片分布均匀
- 分片键一旦选定不可改（5.0 前），必须慎重选择
- Zones 实现数据本地化，按地区/冷热分布

> **踩坑提示**：
> - 分片不是性能银弹，**先优化后分片**，单机能扛就别分
> - 分片后写入 QPS 提升，但跨 shard 查询（scatter-gather）反而更慢
> - 分片集群运维复杂度高，需要专人维护
> - 分片键选择错误几乎无法挽救，必须基于访问模式精心设计
> - mongos 无状态可水平扩展，但 config server 必须是稳定的副本集
> - 分片集合的 unique 索引必须包含分片键前缀，否则报错`
  },

  {
    id: "mongo-ch24",
    group: "第五部分 高可用架构",
    icon: "⚖️",
    title: "第 24 章 分片管理与均衡",
    content: `# 第 24 章 分片管理与均衡

分片集群上线后，数据如何在 shard 间分布、如何保证均衡、如何处理 jumbo chunks、如何修改分片键——这些是日常运维的核心。本章讲解 chunk 拆分与迁移、balancer 均衡器、zones 数据本地化、孤儿文档清理、分片键基数与 5.0+ 的 resharding 能力。

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

### chunk 的本质

- 逻辑概念：分片键值域的一段
- 物理上就是 shard 上的普通文档
- 元数据存在 config server 的 \`config.chunks\` 集合

\`\`\`javascript
// 查看所有 chunk 元数据
use config;
db.chunks.find({ ns: "shop.orders" }).pretty();

// 查看 chunk 数量
db.chunks.countDocuments({ ns: "shop.orders" });

// 查看各 shard 的 chunk 数
db.chunks.aggregate([
  { $group: { _id: "$shard", count: { $sum: 1 } } }
]);
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
// 手动拆分（按查询点找最近的 chunk 边界）
sh.splitFind("shop.orders", { userId: 1500 });

// 在指定值处拆分（精确切分）
sh.splitAt("shop.orders", { userId: 1500 });

// 查看拆分后的 chunk
sh.status();
\`\`\`

> **chunk 大小权衡**：
> - 小 chunk（16-32MB）：分布更均匀，但 chunk 数多，元数据多
> - 大 chunk（128MB+）：元数据少，但迁移耗时长，易不均
> - 大部分场景默认 64MB 合适

### chunk 数量限制

| MongoDB 版本 | 单集合最大 chunk 数 |
| --- | --- |
| 4.2 及以前 | 8192 |
| 4.4+ | 16384 |
| 6.0+ | 32768 |

超过限制会导致拆分失败，数据倾斜。要监控 chunk 数量。

\`\`\`javascript
// 监控 chunk 数量
use config;
db.chunks.countDocuments({ ns: "shop.orders" });
\`\`\`

## 24.2 balancer 均衡器

**balancer** 是后台进程，自动迁移 chunk 让各 shard 数据量均衡。

### 工作机制

1. 周期性检查各 shard 的 chunk 数
2. 发现最多 shard 和最少 shard 差距超过阈值，触发迁移
3. 从最多 shard 选一个 chunk 迁到最少 shard
4. 迁移完成后更新 config server 元数据

### 迁移阈值

| chunk 总数 | 迁移阈值 |
| --- | --- |
| < 20 | 2 |
| 20-79 | 4 |
| >= 80 | 8 |

例如，3 个 shard 共 100 个 chunk，最多 shard 有 40 个，最少有 30 个，差距 10 > 8，触发迁移。

### 查看状态

\`\`\`javascript
// 查看 balancer 是否运行
sh.getBalancerState();

// 查看是否正在均衡
sh.isBalancerRunning();

// 查看均衡窗口
sh.getBalancerWindow();

// 查看均衡器状态详情
sh.balancerStatus();
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

// 查看设置
db.settings.findOne({ _id: "balancer" });

// 取消窗口（恢复全天均衡）
db.settings.update(
  { _id: "balancer" },
  { $unset: { activeWindow: 1 } }
);
\`\`\`

### 关闭均衡

\`\`\`javascript
// 关闭均衡
sh.stopBalancer();

// 开启均衡
sh.startBalancer();

// 临时禁用（5.0+）
sh.disableBalancing("shop.orders");

// 重新启用
sh.enableBalancing("shop.orders");
\`\`\`

### 排除特定集合

某些集合不希望被均衡（如热点数据手动控制）。

\`\`\`javascript
sh.disableBalancing("shop.orders");

// 查看是否禁用
db.collections.findOne({ _id: "shop.orders" }).noBalance;

// 重新启用
sh.enableBalancing("shop.orders");
\`\`\`

> **生产建议**：
> - 默认全天运行 balancer（小集群）
> - 大集群（数据量大、写入密集）配置低峰期窗口
> - 维护窗口期手动停止 balancer（如升级、迁移）

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

// 查看正在进行的迁移
use config;
db.locks.find({ state: { $ne: 0 } });
\`\`\`

### 迁移过程详解

\`\`\`
阶段 1: 源 shard 收到迁移请求
  → 创建迁移目录，开始拷贝数据

阶段 2: 数据拷贝
  → 源 shard 把 chunk 的文档全部拷到目标 shard
  → 期间新写入记录到源 shard 的 oplog

阶段 3: 增量同步
  → 目标 shard 回放源 shard 期间的 oplog
  → 直到源和目标数据一致

阶段 4: 元数据切换
  → config server 更新 chunk 所在 shard
  → 源 shard 标记为 "待删除"

阶段 5: 源 shard 删除
  → 源 shard 删除旧 chunk 数据
  → 迁移完成
\`\`\`

### 迁移影响

- **网络带宽**：迁移消耗带宽
- **磁盘 IO**：源/目标 shard 都有 IO 压力
- **内存**：迁移期间数据进内存
- **业务影响**：迁移期间查询路由可能短暂不一致

\`\`\`javascript
// 监控迁移性能影响
db.adminCommand({ serverStatus: 1 }).metrics.repl;

// 查看迁移历史
use config;
db.changelog.find({
  ns: "shop.orders",
  what: { $in: ["split", "moveChunk.start", "moveChunk.commit"] }
}).sort({ time: -1 }).limit(10);
\`\`\`

> **踩坑提示**：
> - 迁移期间目标 shard 会同时持有"待迁移"和"已迁移"两份数据，磁盘占用临时翻倍
> - 大量迁移会拖慢业务，建议在低峰期进行
> - 手动迁移要小心，可能触发连锁迁移
> - 迁移失败会回滚，但可能留下孤儿文档（见 24.5）

## 24.4 jumbo chunks

**jumbo chunk** 是指 chunk 大小超过迁移阈值但无法拆分的 chunk。

### 产生原因

- chunk 内的分片键值都相同（无法拆分）
- 数据分布不均，某段范围数据特别多

\`\`\`javascript
// 查看 jumbo chunks
sh.status();
// 标记为 "jumbo" 的就是 jumbo chunk

// 或查询 config.chunks
use config;
db.chunks.find({ jumbo: true });
\`\`\`

### jumbo chunk 的影响

- 无法迁移，导致 shard 数据不均
- 写入热点集中在该 shard
- 查询性能下降

### 解决方案

\`\`\`javascript
// 方案 1: 强制拆分（如果可以拆）
sh.splitAt("shop.orders", { userId: 1500 });

// 方案 2: 手动标记为可迁移（4.4+）
db.adminCommand({
  clearJumboFlag: "shop.orders",
  find: { userId: 1500 }
});

// 方案 3: 重新分片（5.0+，换分片键）
db.adminCommand({
  reshardCollection: "shop.orders",
  key: { orderId: 1 }
});
\`\`\`

### 预防 jumbo chunks

- 选择高基数的分片键（每个值文档数少）
- 监控 chunk 大小，及时拆分
- 避免分片键值重复过多

> **踩坑提示**：
> - jumbo chunk 是分片集群的常见痛点，根本原因是分片键选择不当
> - 4.4 前无法清除 jumbo 标记，只能重新分片（4.2 前还不支持）
> - 5.0+ 的 reshardCollection 是终极解决方案，但操作要谨慎

## 24.5 孤儿文档（Orphaned Documents）

**孤儿文档**：迁移失败或中断后，源 shard 没有删除干净，残留的旧 chunk 数据。

### 产生场景

- 迁移过程中 mongos 重启
- 迁移过程中源 shard 故障
- 手动操作 config.chunks

### 危害

- 数据重复：查询可能返回重复结果
- 统计错误：count 可能偏大
- 磁盘浪费：占用额外空间

### 清理孤儿文档

\`\`\`javascript
// 4.4+ 自动清理
// 启动时自动检测并清理
mongod --setParameter cleanupOrphaned=true

// 手动清理（在每个 shard 上执行）
// 连到 shard 的 primary
db.adminCommand({
  cleanupOrphaned: "shop.orders"
});

// 输出
// {
//   "ok": 1,
//   "stoppedAtKey": { "userId": 1500 },
//   "durin": "XX secs"
// }
\`\`\`

### 验证孤儿文档

\`\`\`javascript
// 在 mongos 上验证
db.orders.aggregate([
  { $group: { _id: "$_id", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
]);
// 返回空说明无重复（无孤儿）
\`\`\`

## 24.6 分片键的修改（MongoDB 5.0+）

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

// 前提：必须先建 { userId: 1, orderId: 1 } 索引
db.orders.createIndex({ userId: 1, orderId: 1 });
\`\`\`

**特点**：

- 只能追加字段，不能删除原分片键字段
- 操作快，不迁移数据
- 适合分片键基数不足的场景

### 2. 修改字段值（5.0+）

之前分片键字段值不能改，5.0+ 可以。

\`\`\`javascript
// 5.0+ 可以修改分片键字段值
db.users.updateOne(
  { _id: ObjectId("...") },
  { $set: { userId: "newUserId" } }  // userId 是分片键
);

// 注意：修改分片键字段值会触发文档迁移
\`\`\`

### 3. 重新分片（resharding，5.0+）

完全改变分片键，MongoDB 自动迁移数据。

\`\`\`javascript
db.adminCommand({
  reshardCollection: "shop.orders",
  key: { orderId: 1 }
});

// 查看进度
db.adminCommand({ reshardCollection: "shop.orders" });
// 或
sh.status();
\`\`\`

### resharding 过程

\`\`\`
1. 创建临时集合（新分片键）
2. 从原集合拷贝数据到临时集合
3. 期间原集合继续可读写
4. 拷贝完成后切换
5. 删除原集合
\`\`\`

> **重要约束**：
> - 重新分片期间集群负载高，建议低峰期操作
> - 重新分片是**不可逆**的，操作前做好备份
> - 大集合重新分片可能耗时几小时到几天
> - 重新分片期间不能修改集合结构（如改索引）

## 24.7 zones（数据本地化）

Zones 允许把特定范围的数据固定到特定 shard，实现数据本地化。

### 配置 zones

\`\`\`javascript
// 1. 给 shard 打标签
sh.addShardTag("shard1", "US");
sh.addShardTag("shard2", "EU");
sh.addShardTag("shard3", "ASIA");

// 2. 给集合设置 zone 范围
// 范围：[region: "US", _id: MinKey] 到 [region: "US", _id: MaxKey]
sh.addTagRange(
  "app.users",
  { region: "US", _id: MinKey },
  { region: "US", _id: MaxKey },
  "US"
);

// 移除标签范围
sh.removeTagRange(
  "app.users",
  { region: "US", _id: MinKey },
  { region: "US", _id: MaxKey },
  "US"
);

// 移除 shard 标签
sh.removeShardTag("shard1", "US");
\`\`\`

### 应用场景

| 场景 | 配置 | 效果 |
| --- | --- | --- |
| 地理分布 | region=US → shard1 | 美国用户数据在美国 shard |
| 冷热分离 | ts 范围 → ssd/hdd shard | 热数据 SSD，冷数据 HDD |
| 合规要求 | region=EU → 欧盟 shard | 数据必须存在欧盟 |
| 重要数据 | priority 字段 → 高配 shard | 重要数据放高性能节点 |

\`\`\`javascript
// 冷热分离示例
sh.addShardTag("ssd-shard", "HOT");
sh.addShardTag("hdd-shard", "COLD");

// 2024 年数据放 HOT
sh.addTagRange(
  "logs.events",
  { ts: ISODate("2024-01-01") },
  { ts: ISODate("2025-01-01") },
  "HOT"
);

// 2023 年数据放 COLD
sh.addTagRange(
  "logs.events",
  { ts: ISODate("2023-01-01") },
  { ts: ISODate("2024-01-01") },
  "COLD"
);
\`\`\`

### zones 工作原理

- balancer 迁移时会考虑 zone 标签
- chunk 的分片键范围匹配某 zone，就迁到对应 shard
- 一个 chunk 只能属于一个 zone

> **踩坑提示**：
> - zones 不会自动给文档打标签，是根据分片键值匹配
> - 分片键必须包含 zone 范围的字段
> - 移除 zone 范围后数据不会自动迁移，要等 balancer 处理

## 24.8 分片键基数

**基数**：分片键不同值的数量。

| 基数类型 | 示例 | 影响 |
| --- | --- | --- |
| 高基数 | userId, phone | 分布均匀 |
| 中基数 | city | 可能不均 |
| 低基数 | status | 严重不均，无法拆分 |

### 基数评估

\`\`\`javascript
// 评估字段基数
db.orders.aggregate([
  { $group: { _id: "$userId", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
]);

// 理想：每个值文档数均匀，最大值 < 平均值 * 2
\`\`\`

### 频率（Frequency）

每个分片键值对应的文档数。频率过高会导致 chunk 无法拆分（jumbo）。

\`\`\`javascript
// 检查高频分片键值
db.orders.aggregate([
  { $group: { _id: "$userId", count: { $sum: 1 } } },
  { $match: { count: { $gt: 100000 } } },  // 单值文档数 > 10 万
  { $sort: { count: -1 } }
]);
\`\`\`

### 单调性（Monotonicity）

分片键值是否单调递增。

- ObjectId 单调递增 → 范围分片时热点
- timestamp 单调递增 → 范围分片时热点
- userId（哈希后）→ 无单调性，分布均匀

\`\`\`javascript
// 单调递增键用哈希分片打散
sh.shardCollection("shop.logs", { _id: "hashed" });
\`\`\`

## 24.9 分片集群监控

### 关键指标

\`\`\`javascript
// 1. 集群状态
sh.status();

// 2. 各 shard 数据量
db.adminCommand({ listShards: 1 });

// 3. chunk 分布
use config;
db.chunks.aggregate([
  { $group: { _id: "$shard", count: { $sum: 1 } } }
]);

// 4. balancer 状态
sh.getBalancerState();
sh.isBalancerRunning();

// 5. 迁移历史
db.changelog.find().sort({ time: -1 }).limit(10);
\`\`\`

### 监控告警阈值

| 指标 | 告警阈值 | 严重告警 |
| --- | --- | --- |
| shard 间 chunk 差 | > 50 | > 200 |
| jumbo chunks | > 0 | > 5 |
| balancer 卡住 | > 1h | > 6h |
| 孤儿文档 | > 0 | > 1000 |
| chunk 总数 | > 8000 | > 15000 |

### 排查不均衡

\`\`\`javascript
// 1. 检查 balancer 是否运行
sh.getBalancerState();
sh.isBalancerRunning();

// 2. 检查均衡窗口
sh.getBalancerWindow();

// 3. 检查是否有禁用均衡的集合
use config;
db.collections.find({ noBalance: true });

// 4. 检查是否有 jumbo chunks
db.chunks.find({ jumbo: true });

// 5. 检查 zones 配置
db.tags.find();
\`\`\`

## 24.10 本章小结

- **chunk** 是分片数据分布的最小单位，默认 64MB
- **balancer** 自动迁移 chunk 保证均衡，可配置时间窗口
- chunk 迁移消耗网络/IO/内存，建议低峰期进行
- **jumbo chunks** 是分片键选择不当的常见痛点，5.0+ 可清除标记
- **zones** 实现数据本地化，按地区/冷热分布
- 5.0+ 支持 **refineCollectionShardKey**（追加字段）和 **reshardCollection**（重新分片）
- 孤儿文档是迁移失败残留，4.4+ 自动清理

> **踩坑提示**：
> - balancer 默认全天运行，生产环境建议配置低峰期窗口
> - 5.0+ 的 reshardCollection 是大杀器，但操作前必须备份，且在低峰期进行
> - unique 索引在分片集群上必须包含分片键前缀，否则报错
> - chunk 数量超限会导致拆分失败，数据倾斜，要监控
> - 分片键选择三原则：高基数、低频率、非单调递增
> - zones 是数据本地化的利器，但配置错误会导致数据无法路由`
  },

  {
    id: "mongo-ch25",
    group: "第五部分 高可用架构",
    icon: "🔌",
    title: "第 25 章 客户端与连接",
    content: `# 第 25 章 客户端与连接

数据库性能不只取决于服务端，**客户端配置同样关键**。连接字符串、连接池、读写关注设置直接影响应用性能与可靠性。本章以 Node.js 为主，配合 Python 示例，讲解 MongoDB 客户端的核心配置。

## 25.1 连接字符串（URI）

MongoDB 连接字符串（URI）格式：

\`\`\`
mongodb://[username:password@]host1[:port1][,host2[:port2],...][/database][?options]

mongodb+srv://[username:password@]host[/database][?options]   # SRV 记录
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

// 6. DNS SRV + TLS
"mongodb+srv://user:pass@cluster0.example.mongodb.net/shop?retryWrites=true&w=majority"
\`\`\`

### 关键参数

| 参数 | 含义 | 示例 |
| --- | --- | --- |
| replicaSet | 副本集名 | replicaSet=rs0 |
| authSource | 认证库 | authSource=admin |
| readPreference | 读偏好 | readPreference=secondaryPreferred |
| readConcernLevel | 读关注 | readConcernLevel=majority |
| w / journal | 写关注 | w=majority&journal=true |
| ssl / tls | 启用 TLS | tls=true |
| retryWrites | 重试写入 | retryWrites=true |
| retryReads | 重试读取 | retryReads=true |
| connectTimeoutMS | 连接超时 | connectTimeoutMS=5000 |
| socketTimeoutMS | socket 超时 | socketTimeoutMS=30000 |
| maxPoolSize | 连接池大小 | maxPoolSize=100 |
| minPoolSize | 最小连接 | minPoolSize=10 |
| serverSelectionTimeoutMS | 选服务器超时 | serverSelectionTimeoutMS=5000 |
| heartbeatFrequencyMS | 心跳频率 | heartbeatFrequencyMS=10000 |
| appName | 应用名（监控用） | appName=myApp |

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
  "&connectTimeoutMS=5000" +
  "&appName=myApp";
\`\`\`

### 密码特殊字符编码

\`\`\`javascript
// 密码含 @ : / ? 等要 URL 编码
// 密码 "p@ss:w/ord" → "p%40ss%3Aw%2Ford"
const password = encodeURIComponent("p@ss:w/ord");
const uri = \`mongodb://user:\${password}@localhost:27017/shop\`;
\`\`\`

| 字符 | 编码 |
| --- | --- |
| @ | %40 |
| : | %3A |
| / | %2F |
| ? | %3F |
| # | %23 |
| & | %26 |

> **踩坑提示**：
> - 连接字符串里密码有特殊字符（@、:、/）要 URL 编码
> - \`authSource\` 默认是连接的数据库，但用户通常建在 admin 库，要明确指定
> - SRV 记录（\`mongodb+srv://\`）能从 DNS 自动发现节点，Atlas 必用
> - SRV 记录默认用 27017 端口，DNS TXT 记录可配置额外参数

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
  waitQueueTimeoutMS: 5000, // 获取连接超时（默认无超时）
  maxConnecting: 2         // 同时建立连接数（默认 2）
});
\`\`\`

### 参数详解

| 参数 | 默认 | 说明 |
| --- | --- | --- |
| maxPoolSize | 100 | 连接池最大连接数 |
| minPoolSize | 0 | 最小空闲连接（保持常驻） |
| maxIdleTimeMS | 30000 | 空闲连接存活时间 |
| waitQueueTimeoutMS | 0 | 等待连接超时（0=无限） |
| maxConnecting | 2 | 同时建立连接数 |

### 池大小调优

| 场景 | 建议 maxPoolSize |
| --- | --- |
| 小应用 | 10-20 |
| 中型应用 | 50 |
| 大型应用 | 100（默认） |
| 微服务（每实例） | 20-50 |
| Serverless | 5-10 |

> **重要**：连接池大小是**单进程**的。如果有 10 个应用实例，每个 maxPoolSize=100，MongoDB 总连接数 = 1000。MongoDB 单实例最大连接数默认 1 万，要算好总数。

### 连接数计算

\`\`\`
总连接数 = 应用实例数 × 每实例 maxPoolSize

示例：
  - 10 个 Node.js 实例，maxPoolSize=50
  - MongoDB 总连接数 = 10 × 50 = 500

  - 100 个微服务实例，maxPoolSize=20
  - MongoDB 总连接数 = 100 × 20 = 2000

要确保总连接数 < MongoDB ulimit（默认 1 万）
\`\`\`

### 连接泄漏排查

\`\`\`javascript
// 监控连接池状态
const db = client.db("shop");
const serverStatus = await db.admin().command({ serverStatus: 1 });
console.log("当前连接数：", serverStatus.connections.current);
console.log("可用连接数：", serverStatus.connections.available);
console.log("已创建连接数：", serverStatus.connections.totalCreated);

// Node.js 驱动监听连接事件
client.on("connectionPoolCreated", (event) => console.log("池创建", event));
client.on("connectionCreated", (event) => console.log("连接创建", event));
client.on("connectionClosed", (event) => console.log("连接关闭", event));
client.on("connectionCheckOutStarted", (event) => console.log("借出连接", event));
client.on("connectionCheckOutFailed", (event) => console.log("借出失败", event));
client.on("connectionCheckedIn", (event) => console.log("归还连接", event));
\`\`\`

### MongoDB 服务端连接数

\`\`\`javascript
// 查看当前连接数
db.adminCommand({ serverStatus: 1 }).connections;

// 输出
// {
//   current: 150,        // 当前连接数
//   available: 9850,     // 可用连接数
//   totalCreated: 200    // 累计创建连接数
// }

// 限制最大连接数（mongod 配置）
// net.maxIncomingConnections: 10000
\`\`\`

> **踩坑提示**：
> - 连接泄漏是常见问题，确保 client.close() 在 finally 中调用
> - 微服务架构要为每个服务单独配置连接池，避免相互影响
> - maxPoolSize 不是越大越好，过多连接会浪费内存和 CPU

## 25.3 服务器选择

驱动如何选 MongoDB 节点？基于 **serverSelectionTimeoutMS** 和读偏好。

### 选择流程

\`\`\`
1. 驱动维护拓扑（通过 hello 命令）
2. 客户端请求时，按 readPreference 筛选可用节点
3. 从候选节点中选一个（轮询 / 最低延迟）
4. 如果没有可用节点，等待 serverSelectionTimeoutMS（默认 30s）
5. 超时抛错 "Server selection timed out"
\`\`\`

### 关键参数

\`\`\`javascript
const client = await MongoClient.connect(uri, {
  serverSelectionTimeoutMS: 5000,    // 选服务器超时（默认 30s）
  heartbeatFrequencyMS: 10000,       // 心跳频率（默认 10s）
  localThresholdMS: 15               // 候选延迟阈值（默认 15ms）
});
\`\`\`

### 心跳机制

- 驱动每 heartbeatFrequencyMS（默认 10s）向每个节点发 hello 命令
- 检测节点状态、延迟、角色（primary/secondary）
- 节点故障后最多 heartbeatFrequencyMS 才感知

\`\`\`javascript
// 监控拓扑变化
client.on("serverDescriptionChanged", (event) => {
  console.log(\`节点 \${event.address} 状态变化: \${event.previousDescription.type} → \${event.newDescription.type}\`);
});

client.on("topologyDescriptionChanged", (event) => {
  console.log("拓扑变化");
});
\`\`\`

## 25.4 retryReads / retryWrites

### retryWrites

故障转移期间，写操作可能失败（NotWritablePrimary）。retryWrites 让驱动自动重试一次。

\`\`\`javascript
const client = await MongoClient.connect(uri, {
  retryWrites: true  // 默认 true（4.0+）
});
\`\`\`

**支持的操作**：

- insertOne / insertMany
- updateOne / replaceOne
- deleteOne
- findOneAndUpdate / findOneAndDelete / findOneAndReplace
- bulkWrite（单文档操作）

**不支持**：

- 多文档事务（事务自己重试）
- updateMany / deleteMany（影响多文档）

### retryReads

读失败自动重试。

\`\`\`javascript
const client = await MongoClient.connect(uri, {
  retryReads: true  // 默认 true
});
\`\`\`

> **踩坑提示**：
> - retryWrites 只对单文档写操作生效，多文档事务要自己重试
> - retryWrites 要求副本集（单机不支持）
> - 故障转移期间自动重试一次，不保证成功

## 25.5 Node.js 驱动示例

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

### 单例连接管理

\`\`\`javascript
// db.js - 单例连接
const { MongoClient } = require("mongodb");

let client;

async function getDb() {
  if (!client) {
    client = await MongoClient.connect(process.env.MONGO_URI, {
      maxPoolSize: 50,
      retryWrites: true,
      serverSelectionTimeoutMS: 5000
    });
  }
  return client.db("shop");
}

async function closeDb() {
  if (client) {
    await client.close();
    client = null;
  }
}

module.exports = { getDb, closeDb };
\`\`\`

## 25.6 Python 驱动示例

\`\`\`python
from pymongo import MongoClient, ASCENDING
from pymongo.read_preferences import ReadPreference
from bson import ObjectId
from datetime import datetime

# 连接（带读写关注）
client = MongoClient(
    "mongodb://user:pass@host1:27017,host2:27017,host3:27017/shop",
    replicaSet="rs0",
    readPreference="secondaryPreferred",
    w="majority",
    retryWrites=True,
    maxPoolSize=50,
    serverSelectionTimeoutMS=5000
)

db = client.shop
products = db.products

# 插入
result = products.insert_one({
    "name": "MongoDB 实战书",
    "price": 99,
    "stock": 100,
    "tags": ["database", "nosql"],
    "createdAt": datetime.utcnow()
})
print("插入 ID：", result.inserted_id)

# 批量插入
products.insert_many([
    {"name": "商品A", "price": 50},
    {"name": "商品B", "price": 80}
])

# 查询
product = products.find_one({"_id": result.inserted_id})
cheap_products = list(
    products.find({"price": {"$lt": 100}})
    .sort("price", ASCENDING)
    .limit(10)
)

# 更新
products.update_one(
    {"_id": result.inserted_id},
    {"$inc": {"stock": -1}, "$set": {"updatedAt": datetime.utcnow()}}
)

# 事务
with client.start_session() as session:
    with session.start_transaction():
        products.update_one(
            {"_id": ObjectId("..."), "stock": {"$gte": 1}},
            {"$inc": {"stock": -1}},
            session=session
        )
        db.orders.insert_one(
            {"productId": ObjectId("..."), "amount": 1},
            session=session
        )

client.close()
\`\`\`

## 25.7 Mongoose ODM

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

productSchema.post("save", function(doc) {
  console.log(\`保存商品: \${doc.name}\`);
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
| 灵活性 | 高（字段任意） | 低（Schema 固定） |

> **选择建议**：
> - 业务逻辑复杂、字段固定 → Mongoose
> - 高性能场景、字段灵活 → 原生驱动
> - 不要混用，Mongoose 模型和原生 collection 混用容易出 bug

## 25.8 读写关注设置

### 写关注（Write Concern）

写关注决定写入多少节点才算成功。

\`\`\`javascript
// 1. 连接字符串级别
"mongodb://localhost/shop?w=majority&journal=true"

// 2. 驱动级别（所有操作）
const client = await MongoClient.connect(uri, {
  writeConcern: { w: "majority", j: true, wtimeout: 5000 }
});

// 3. 数据库级别
const db = client.db("shop", { writeConcern: { w: "majority" } });

// 4. 集合级别
const coll = db.collection("orders", { writeConcern: { w: "majority" } });

// 5. 单次操作级别
await products.insertOne(
  { name: "重要数据" },
  { writeConcern: { w: "majority", j: true } }
);
\`\`\`

### 写关注级别

| 写关注 | 含义 | 性能 | 安全性 |
| --- | --- | --- | --- |
| w: 0 | 不等确认（fire-and-forget） | 最快 | 可能丢数据 |
| w: 1 | 主节点确认（默认） | 快 | 主故障可能丢 |
| w: "majority" | 多数节点确认 | 中 | 高可用 |
| w: 3 | 3 个节点确认 | 慢 | 最高 |
| j: true | 等待 journal 落盘 | 更慢 | 防宕机丢 |

\`\`\`javascript
// 不同场景的写关注
// 1. 日志（可丢）
await db.collection("logs").insertOne(log, { writeConcern: { w: 1 } });

// 2. 普通业务
await db.collection("orders").insertOne(order, { writeConcern: { w: "majority" } });

// 3. 金融交易（最重要）
await db.collection("payments").insertOne(payment, {
  writeConcern: { w: "majority", j: true, wtimeout: 5000 }
});
\`\`\`

### 读关注（Read Concern）

读关注决定读到什么版本的数据。

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

### 读关注级别

| 读关注 | 含义 | 一致性 |
| --- | --- | --- |
| local（默认） | 节点本地最新 | 可能读到未提交（回滚）数据 |
| majority | 多数派确认的数据 | 不会读到回滚数据 |
| linearizable | 强一致（线性化） | 最强，但慢 |
| available | 可用数据 | 等同 local |

### 推荐组合

| 业务场景 | writeConcern | readConcern | readPreference |
| --- | --- | --- | --- |
| 金融交易 | majority + journal | majority | primary |
| 普通业务 | majority | local | primary |
| 报表统计 | majority | majority | secondaryPreferred |
| 实时分析 | 1 | local | nearest |
| 缓存场景 | 1 | local | nearest |
| 日志 | 1 | local | primaryPreferred |

\`\`\`javascript
// 金融交易示例（最强一致性）
const client = await MongoClient.connect(uri, {
  writeConcern: { w: "majority", j: true },
  readConcernLevel: "majority",
  readPreference: "primary",  // 必须读主
  retryWrites: true
});

// 日志场景（最高性能）
const logClient = await MongoClient.connect(logUri, {
  writeConcern: { w: 1 },
  readConcernLevel: "local",
  readPreference: "primaryPreferred",
  retryWrites: true
});
\`\`\`

## 25.9 高级配置

### 超时配置

\`\`\`javascript
const client = await MongoClient.connect(uri, {
  connectTimeoutMS: 5000,        // 连接建立超时（默认 30s）
  socketTimeoutMS: 30000,        // socket 读写超时（默认 0=无限）
  serverSelectionTimeoutMS: 5000,// 选服务器超时（默认 30s）
  maxIdleTimeMS: 30000,          // 连接最大空闲时间（默认 30s）
  waitQueueTimeoutMS: 5000       // 等待连接超时
});
\`\`\`

### TLS/SSL 配置

\`\`\`javascript
const client = await MongoClient.connect(uri, {
  tls: true,
  tlsCAFile: "/path/to/ca.pem",
  tlsCertificateKeyFile: "/path/to/client.pem",
  tlsAllowInvalidCertificates: false,  // 生产必须 false
  tlsAllowInvalidHostnames: false
});
\`\`\`

### 压缩

\`\`\`javascript
const client = await MongoClient.connect(uri, {
  compressors: "zstd",  // 或 "snappy", "zlib"
  zlibCompressionLevel: 6  // 1-9
});
\`\`\`

## 25.10 故障转移期客户端行为

故障转移期间（10-15s），客户端会遇到：

- NotWritablePrimary 错误（写失败）
- 节点不可用错误
- 拓扑变化

### 处理策略

\`\`\`javascript
// 1. 启用 retryWrites（自动重试一次）
const client = await MongoClient.connect(uri, { retryWrites: true });

// 2. 应用层重试（关键操作）
async function writeWithRetry(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (err) {
      const retryableErrors = [
        10107,  // NotWritablePrimary
        13435,  // ServerNotWritable
        11600,  // InterruptedAtShutdown
        89      // NetworkError
      ];
      if (retryableErrors.includes(err.code) && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
}

// 使用
await writeWithRetry(() => 
  orders.insertOne({ userId: 1, amount: 100 })
);
\`\`\`

### 监控拓扑变化

\`\`\`javascript
client.on("serverDescriptionChanged", (event) => {
  console.log(\`节点 \${event.address} 状态变化\`);
  console.log(\`  旧: \${event.previousDescription.type}\`);
  console.log(\`  新: \${event.newDescription.type}\`);
});

client.on("topologyDescriptionChanged", (event) => {
  console.log("副本集拓扑变化");
  // 重新缓存路由信息等
});

client.on("serverHeartbeatSucceeded", (event) => {
  // 心跳成功
});

client.on("serverHeartbeatFailed", (event) => {
  console.warn("心跳失败", event);
});
\`\`\`

## 25.11 本章小结

- 连接字符串是配置入口，关键参数：replicaSet、authSource、readPreference、w
- 连接池复用 TCP 连接，maxPoolSize 默认 100，要按实例数和总连接数统筹
- Node.js 驱动支持完整 CRUD + 事务，retryWrites 是必备配置
- Mongoose 提供 Schema/校验/中间件，适合业务复杂场景
- 读写关注按业务重要性分级：金融 majority+journal，缓存 w=1
- 故障转移期客户端要重试，retryWrites + 应用层重试双层保障

> **踩坑提示**：
> - 连接泄漏是常见问题，确保 client.close() 在 finally 中调用
> - Mongoose 性能比原生驱动低 20-30%，高性能场景慎用
> - retryWrites 只对单文档写操作生效，多文档事务要自己重试
> - 生产环境必用 majority 写关注，单机 w=1 在故障时可能丢数据
> - 微服务架构要为每个服务单独配置连接池，避免相互影响
> - 密码含特殊字符必须 URL 编码，否则连接字符串解析失败
> - serverSelectionTimeoutMS 不要设太小，故障转移期需要时间选新主`
  }
];

export { chapters };
