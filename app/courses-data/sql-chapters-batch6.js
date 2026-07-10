// =============================================================
// 数据库开发教程 —— 第六批章节（现代数据库篇，共 5 章）
// -------------------------------------------------------------
// 本批聚焦"超越传统关系型数据库"：NoSQL 概览、文档数据库、
// NewSQL 分布式数据库、时序与图数据库、向量数据库与 AI 时代。
// 所有 code 字段均可在 sqlite3 内存数据库中直接运行（用 SQL 演示概念，
// 或用 SQL/JSON 函数模拟 NoSQL、图遍历、向量相似度等思想）。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：NoSQL 数据库概览
  // =========================================================
  {
    id: "sql-nosql",
    group: "现代数据库",
    icon: "🌊",
    title: "NoSQL 数据库概览",
    content: `## NoSQL 数据库概览

"NoSQL" 不是 "No SQL"（反对 SQL），而是 "Not Only SQL"（不仅仅是 SQL）。它是一类**非关系型数据库**的统称，目标是解决关系型数据库在互联网时代遇到的扩展性与 schema 灵活性瓶颈。本章建立 NoSQL 全局认知。

### 一、为什么会出现 NoSQL

**1. 互联网爆发带来的数据挑战**

| 维度 | 传统时代（2000 前） | 互联网时代（2005+） |
| --- | --- | --- |
| 数据量 | GB ~ TB | TB ~ PB |
| 数据结构 | 结构化（表） | 半结构化（JSON）/ 非结构化（文本/图） |
| 访问模式 | 固定事务 | 海量并发读写 |
| 扩展方式 | 垂直扩展（升级单机） | 水平扩展（加机器） |
| Schema | 提前定义，强约束 | 灵活多变，弱约束 |

关系型数据库（MySQL/Oracle）的单机架构在 PB 级数据 + 百万 QPS 面前力不从心，**垂直扩展有上限**，水平扩展（分库分表）成本高昂且破坏事务语义。

**2. CAP 定理（Brewer 定理）**

分布式系统**最多同时满足三个中的两个**：

| 属性 | 含义 |
| --- | --- |
| **C** 一致性（Consistency） | 所有节点同一时刻看到相同数据 |
| **A** 可用性（Availability） | 每个请求都能收到非错误响应（不保证最新） |
| **P** 分区容错（Partition tolerance） | 网络分区时系统仍能运作 |

由于网络分区（P）在分布式系统中**必然发生**，所以实际选择是：

- **CP**：强一致，分区时宁可不可用（HBase / MongoDB 默认 / Spanner）
- **AP**：高可用，分区时各节点继续服务，允许数据暂时不一致（Cassandra / DynamoDB / Redis 集群）
- **CA**：单机数据库（MySQL 单机 / SQLite），不存在分区问题

> **踩坑点**：CAP 不是"三选二"那么简单。分区时才需要在 C 和 A 间取舍；无分区时应同时保证 C 和 A。这套理论后来被 Brewer 自己修正为 "CAP 十二年后回顾"。

**3. BASE 理论**

CAP 的 AP 牺牲强一致，但也不能完全不一致，BASE 是它的实践指南：

| 字母 | 含义 | 对应 ACID |
| --- | --- | --- |
| **BA** Basically Available | 基本可用，允许响应变慢或返回降级数据 | 与"原子性"对立 |
| **S** Soft state | 软状态，允许中间态存在（数据可异步同步） | 与"一致性"对立 |
| **E** Eventually consistent | 最终一致性，副本间最终收敛一致 | 替代强一致 |

### 二、四大 NoSQL 类型对比

| 类型 | 代表产品 | 数据模型 | 典型场景 | 优势 | 劣势 |
| --- | --- | --- | --- | --- | --- |
| **键值（KV）** | Redis / Memcached / DynamoDB | \`key → value\` | 缓存、会话、计数器 | 极快、简单 | 无复杂查询 |
| **文档（Document）** | MongoDB / CouchDB | BSON/JSON 文档 | 内容管理、用户画像、配置 | schema 灵活、嵌套结构 | 跨文档事务弱 |
| **列族（Column-Family）** | Cassandra / HBase | 行键 + 列族 | 海量写入、时序、日志 | 写入吞吐极高 | 查询模式受限 |
| **图（Graph）** | Neo4j / JanusGraph | 节点 + 边 + 属性 | 社交、推荐、知识图谱 | 关系查询快 | 数据量受限 |

**列族存储的本质**：行内每列单独存储，相同列聚簇在一起，按列读取时 I/O 极少，特别适合"读少数列但行数多"的分析型负载。

### 三、SQL vs NoSQL 选型

| 维度 | SQL（关系型） | NoSQL |
| --- | --- | --- |
| 事务一致性 | 强（ACID） | 弱（BASE） |
| Schema | 强约束，提前定义 | 灵活，运行时可变 |
| 扩展性 | 垂直为主，水平困难 | 天生水平扩展 |
| 查询能力 | 强（JOIN / 复杂 SQL） | 弱（按 key 或文档结构） |
| 数据完整性 | 高（外键/约束） | 低（应用层保证） |
| 成熟度 | 高（40+ 年） | 较新（10+ 年） |

**选型口诀**：
- **强事务、复杂关联、钱相关** → SQL（金融、ERP、订单）
- **海量数据、灵活 schema、高并发** → NoSQL（内容、日志、画像、缓存）
- **既要又要** → NewSQL（见第三章）

### 四、Polyglot Persistence（多语言持久化）

现代系统不再"一个数据库走天下"，而是**根据数据特性选择最合适的存储**：

\`\`\`
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Redis      │     │  MySQL       │     │  MongoDB    │
│  (缓存)      │     │  (订单/账户) │     │  (商品/画像) │
└─────────────┘     └──────────────┘     └─────────────┘
       ▲                   ▲                   ▲
       │                   │                   │
       └───── 应用层 ───────┴───────────────────┘
                        │
                  ┌─────────────┐
                  │  Elasticsearch│
                  │  (搜索/日志)  │
                  └─────────────┘
\`\`\`

**踩坑点**：
- 跨库事务一致性难保证，需要 Saga / TCC 等补偿事务模式
- 运维成本上升（每个数据库都要专业人才）
- 数据同步链路长（MySQL → ES 需要 Canal / Debezium CDC）

### 五、用 SQL 模拟文档存储

关系型数据库其实也能"装作" NoSQL：用 \`JSON\` 列存储灵活文档，用 \`json_extract\` 查询。下面代码用 SQLite 的 JSON1 扩展演示**文档数据库**的核心思想。

\`\`\`sql
-- 文档表：一行业务就是一个 JSON 文档
CREATE TABLE docs (
  id TEXT PRIMARY KEY,           -- 文档 id
  type TEXT,                     -- 集合名（类比 MongoDB 的 collection）
  data TEXT                      -- JSON 文档内容
);
\`\`\`

下面代码完整演示：建文档表、插入、按 JSON 字段查询、动态 schema 等。`,
    code: `-- ============================================================
-- 第一章演示：用 SQL 模拟 NoSQL 文档存储
-- 思路：一张表存所有"集合"，每行是一个 JSON 文档
-- ============================================================

-- 1. 文档表：模拟 MongoDB 的集合
CREATE TABLE docs (
  id TEXT PRIMARY KEY,
  type TEXT,            -- 集合名（user / product / order ...）
  data TEXT             -- JSON 文档
);

-- 2. 插入"文档"——schema 各不相同也没关系
INSERT INTO docs VALUES
  ('u1', 'user',    '{"name":"Alice","age":28,"tags":["db","go"]}'),
  ('u2', 'user',    '{"name":"Bob","age":34,"city":"Shanghai"}'),
  ('p1', 'product', '{"name":"MacBook","price":12999,"stock":10}'),
  ('p2', 'product', '{"name":"Mouse","price":99,"stock":200}'),
  ('o1', 'order',   '{"uid":"u1","items":[{"pid":"p1","qty":1}]}');

-- 3. 按"集合"查询（类比 db.users.find()）
SELECT '3. user 集合全部文档:' AS info;
SELECT id, json_extract(data, '$.name') AS name,
       json_extract(data, '$.age') AS age
FROM docs WHERE type = 'user';

-- 4. 按 JSON 字段过滤（类比 db.users.find({age:{$gte:30}})）
SELECT '4. 年龄>=30 的用户:' AS info;
SELECT json_extract(data, '$.name') AS name,
       json_extract(data, '$.age') AS age
FROM docs
WHERE type = 'user'
  AND json_extract(data, '$.age') >= 30;

-- 5. 动态 schema：Bob 没有 age 字段时不会报错
INSERT INTO docs VALUES
  ('u3', 'user', '{"name":"Charlie","tags":["rust"]}');

SELECT '5. Charlie 没 age 字段（schema 灵活）:' AS info;
SELECT id, json_extract(data, '$.name') AS name,
       json_extract(data, '$.age') AS age
FROM docs WHERE id = 'u3';

-- 6. 查所有出现过的"键"（理解 schema-less 的代价）
--    注意：json_each 虚拟表也有 type/id 列，需用 docs.type 限定
SELECT '6. 不同 user 文档的键集合:' AS info;
SELECT DISTINCT key
FROM docs, json_each(data)
WHERE docs.type = 'user';

-- 7. 模拟"键值存储"：用 key 取 value（类比 Redis GET）
CREATE TABLE kv (k TEXT PRIMARY KEY, v TEXT);
INSERT INTO kv VALUES ('session:1', '{"user":"Alice"}');
INSERT INTO kv VALUES ('counter:page_view', '1024');

SELECT '7. KV 查询（Redis 风格）:' AS info;
SELECT k, v FROM kv WHERE k = 'counter:page_view';

-- 8. 模拟"列族"思想：稀疏列宽表
-- 每行可以有很多列，但大部分为 NULL，按列读取高效
CREATE TABLE wide_events (
  rowkey TEXT PRIMARY KEY,
  ts INTEGER,
  col_cpu INTEGER,
  col_mem INTEGER,
  col_disk INTEGER
);
INSERT INTO wide_events VALUES ('host1', 1, 80, NULL, NULL);
INSERT INTO wide_events VALUES ('host2', 1, NULL, 60, NULL);
INSERT INTO wide_events VALUES ('host3', 1, NULL, NULL, 90);

SELECT '8. 列族风格：稀疏列宽表，按列读取:' AS info;
SELECT rowkey, col_cpu, col_mem, col_disk FROM wide_events;
`,
  },

  // =========================================================
  // 第二章：文档数据库 MongoDB
  // =========================================================
  {
    id: "sql-document-db",
    group: "现代数据库",
    icon: "📄",
    title: "文档数据库 MongoDB",
    content: `## 文档数据库 MongoDB

MongoDB 是文档数据库的事实标准。它用 **BSON**（Binary JSON）存储数据，把"文档"作为基本单位，每个文档可以有不同的字段结构。本章拆解 MongoDB 的数据模型、CRUD、聚合、索引、复制、分片，并用 SQLite 的 JSON 函数模拟其核心操作。

### 一、数据模型

| 概念 | MongoDB | 关系型数据库 |
| --- | --- | --- |
| 数据库 | database | database |
| 集合 | collection | table |
| 文档 | document | row |
| 字段 | field | column |
| 主键 | \`_id\`（默认 ObjectId） | primary key |
| 引用 | DBRef / 手动存 id | foreign key |

**BSON** 是 JSON 的二进制扩展：除了 JSON 类型，还支持 \`Date\`、\`Binary\`、\`ObjectId\`、\`Decimal128\` 等。比 JSON 更紧凑、解析更快，但人眼不可读。

**文档结构示例**：

\`\`\`json
{
  "_id": ObjectId("65a1..."),
  "name": "Alice",
  "age": 28,
  "address": {                 // 嵌套文档
    "city": "Shanghai",
    "zip": "200000"
  },
  "tags": ["db", "go"],         // 数组
  "orders": [                   // 数组里嵌文档
    { "oid": 1, "amount": 100 },
    { "oid": 2, "amount": 200 }
  ]
}
\`\`\`

### 二、嵌套文档 vs 引用

这是 MongoDB 设计的核心抉择，直接决定查询性能和一致性。

| 模式 | 写法 | 优点 | 缺点 | 适合场景 |
| --- | --- | --- | --- | --- |
| **嵌入（Embed）** | 文档里直接嵌套 | 一次查询拿全数据、原子写入 | 文档变大、可能超过 16MB | 1:1 或 1:少量（地址、订单明细） |
| **引用（Reference）** | 存对方 \`_id\` | 文档小、避免重复 | 需要 \`$lookup\` 联表、多 round-trip | 1:多（大量）、多:多 |

**踩坑点**：
- 文档上限 **16MB**，超出会报错，频繁增长的数组（如评论）应改为引用
- 嵌入模式更新子文档会重写整个文档，大文档性能差
- 引用模式需要应用层做 join，或用聚合 \`$lookup\`

### 三、CRUD 操作对照

| 操作 | MongoDB | 关系型 SQL |
| --- | --- | --- |
| 插 | \`db.users.insertOne({...})\` | \`INSERT INTO users ...\` |
| 查 | \`db.users.find({age: {\$gte: 18}})\` | \`SELECT * FROM users WHERE age>=18\` |
| 改 | \`db.users.updateOne({_id:1}, {\$set:{age:29}})\` | \`UPDATE users SET age=29 WHERE id=1\` |
| 删 | \`db.users.deleteOne({_id:1})\` | \`DELETE FROM users WHERE id=1\` |

**注意 MongoDB 的更新操作符**：
- \`$set\`：设置字段
- \`$inc\`：原子自增
- \`$push\` / \`$pull\`：数组追加/删除
- \`$unset\`：删除字段

### 四、聚合管道（Aggregation Pipeline）

聚合是 MongoDB 的杀手锏，类似 SQL 的子查询 + GROUP BY，但用**管道**串联多个阶段：

\`\`\`js
db.orders.aggregate([
  { $match:   { status: "paid" } },        // WHERE
  { $group:   { _id: "$uid", total: { $sum: "$amount" } } },  // GROUP BY
  { $sort:    { total: -1 } },             // ORDER BY
  { $limit:   10 },                        // LIMIT
  { $project: { user: "$_id", total: 1, _id: 0 } }  // SELECT
]);
\`\`\`

**常用阶段**：
\`$match\` / \`$group\` / \`$project\` / \`$sort\` / \`$limit\` / \`$lookup\`（联表） / \`$unwind\`（展开数组） / \`$bucket\`（分桶）。

### 五、索引

MongoDB 索引基于 **B 树**（4.4 起也支持哈希索引）。

| 索引类型 | 用途 |
| --- | --- |
| **单字段索引** | \`{ name: 1 }\` 加速按字段查 |
| **复合索引** | \`{ uid: 1, ts: -1 }\` 多字段联合查 |
| **多键索引** | 数组字段上的索引 |
| **文本索引** | 全文搜索 |
| **地理索引（2dsphere）** | 附近查询 |
| **TTL 索引** | 文档过期自动删除（日志场景神器） |

**踩坑点**：
- 索引不是越多越好：写入要维护索引、占内存
- 复合索引遵循"ESR 原则"：**E**quality（等值）→ **S**ort（排序）→ **R**ange（范围）
- \`$or\` 查询两侧字段都要有索引才能高效

### 六、复制集（Replica Set）

MongoDB 用**复制集**实现高可用：1 个 Primary + N 个 Secondary，所有写都进 Primary，异步同步到 Secondary。

\`\`\`
       写 → [Primary] ──oplog──→ [Secondary 1]
                              └→ [Secondary 2]
\`\`\`

- **选举**：Primary 挂掉，Secondary 通过 **Raft** 选举新 Primary（默认需多数派投票）
- **读偏好**：可指定从 Secondary 读（牺牲一致性换吞吐）
- **写关注**：\`w: majority\` 要求多数副本确认才算写入成功（强一致）

### 七、分片（Sharding）

数据量超过单机容量时分片，按 \`shard key\` 把数据分散到多个 shard：

\`\`\`
                    mongos（路由）
                       │
        ┌──────────────┼──────────────┐
   [Shard 1]       [Shard 2]       [Shard 3]
   id: 1-1000     id: 1001-2000   id: 2001-3000
        Config Server（路由表）
\`\`\`

**分片键选择是大事**：
- **范围分片**：连续 id 容易出现热点（最近写入集中在一个 shard）
- **哈希分片**：分散均匀，但范围查询要扫所有 shard
- **热点 shard key**：单调递增字段（时间戳）会让所有写挤到一个 shard

### 八、适用场景

| 适合 | 不适合 |
| --- | --- |
| 内容管理（CMS）：文章 schema 多变 | 银行核心账务：强事务 |
| 用户画像：属性灵活增加 | 复杂多表 JOIN：性能差 |
| 日志/事件：写入海量 | 关系密集型：图数据 |
| 商品目录：规格字段不固定 | 数据量小：用 MySQL 更简单 |

### 九、用 SQL 模拟文档查询

下面用 SQLite 的 \`json_extract\` / \`json_array_length\` 等函数模拟 MongoDB 的 CRUD 与简单聚合。`,
    code: `-- ============================================================
-- 第二章演示：用 SQL/JSON 模拟 MongoDB 文档操作
-- ============================================================

-- 1. 创建"集合"（一张表 = 一个集合）
CREATE TABLE users (
  _id TEXT PRIMARY KEY,
  doc TEXT       -- BSON 文档（这里用 JSON 文本表示）
);

-- 2. insertOne：插入文档（schema 不强制一致）
INSERT INTO users VALUES
  ('u1', '{"name":"Alice","age":28,"tags":["db","go"],"addr":{"city":"SH"}}'),
  ('u2', '{"name":"Bob","age":34,"tags":["java"],"addr":{"city":"BJ"}}'),
  ('u3', '{"name":"Charlie","age":22,"tags":["db","rust"]}');

-- 3. find：等值查询（db.users.find({name:"Alice"})）
SELECT '3. find name=Alice:' AS info;
SELECT _id, doc FROM users
WHERE json_extract(doc, '$.name') = 'Alice';

-- 4. find：范围查询（db.users.find({age:{$gte:30}})）
SELECT '4. age >= 30:' AS info;
SELECT _id, json_extract(doc, '$.name') AS name,
       json_extract(doc, '$.age') AS age
FROM users WHERE json_extract(doc, '$.age') >= 30;

-- 5. find：数组元素查询（db.users.find({tags:"db"})）
--    MongoDB 的 $in / 数组元素匹配
SELECT '5. tags 包含 db:' AS info;
SELECT _id, json_extract(doc, '$.name') AS name
FROM users
WHERE EXISTS (
  SELECT 1 FROM json_each(doc, '$.tags')
  WHERE value = 'db'
);

-- 6. update：$set 字段（updateOne({_id:"u1"},{$set:{age:29}})）
UPDATE users
SET doc = json_set(doc, '$.age', 29)
WHERE _id = 'u1';

SELECT '6. Alice 更新后:' AS info;
SELECT doc FROM users WHERE _id = 'u1';

-- 7. update：$push 数组追加
UPDATE users
SET doc = json_set(doc, '$.tags',
       json_insert(json_extract(doc, '$.tags'), '$[#]', 'python'))
WHERE _id = 'u1';

SELECT '7. Alice tags 追加 python:' AS info;
SELECT json_extract(doc, '$.tags') AS tags
FROM users WHERE _id = 'u1';

-- 8. 聚合管道模拟：统计每个 tag 下的用户数
--    aggregate: $unwind tags → $group by tag → $count
--    json_each 输出 value 列（即数组元素），不是 tag
SELECT '8. 每个 tag 的用户数（聚合管道）:' AS info;
SELECT value AS tag, COUNT(*) AS user_count
FROM users, json_each(doc, '$.tags')
GROUP BY value
ORDER BY user_count DESC;

-- 9. 聚合：按年龄段分桶（$bucket）
SELECT '9. 按年龄段分桶:' AS info;
SELECT
  CASE
    WHEN json_extract(doc, '$.age') < 25 THEN 'young(<25)'
    WHEN json_extract(doc, '$.age') < 30 THEN 'mid(25-29)'
    ELSE 'senior(>=30)'
  END AS bucket,
  COUNT(*) AS cnt
FROM users
GROUP BY bucket;

-- 10. 模拟索引：在 name 字段建表达式索引（需 SQLite 3.9+）
--     CREATE INDEX idx_name ON users(json_extract(doc, '$.name'));

-- 11. $lookup 联表查询模拟
CREATE TABLE orders (
  _id TEXT PRIMARY KEY,
  uid TEXT,
  amount INTEGER
);
INSERT INTO orders VALUES
  ('o1', 'u1', 100),
  ('o2', 'u1', 200),
  ('o3', 'u2', 50);

SELECT '11. 联表查询（订单+用户名）:' AS info;
SELECT o._id AS order_id,
       json_extract(u.doc, '$.name') AS user_name,
       o.amount
FROM orders o
JOIN users u ON u._id = o.uid
ORDER BY o.amount DESC;

-- 12. 删除文档（deleteOne）
DELETE FROM users WHERE _id = 'u3';
SELECT '12. 删除 u3 后剩余用户:' AS info;
SELECT _id, json_extract(doc, '$.name') AS name FROM users;
`,
  },

  // =========================================================
  // 第三章：NewSQL 与分布式数据库
  // =========================================================
  {
    id: "sql-newsql",
    group: "现代数据库",
    icon: "🌐",
    title: "NewSQL 与分布式数据库",
    content: `## NewSQL 与分布式数据库

**NewSQL** 是 2010 年代提出的概念，目标是**兼得 SQL 的事务能力（ACID）和 NoSQL 的水平扩展性**。它解决了"NoSQL 牺牲一致性、SQL 扩展困难"的两难。代表：Google Spanner、TiDB、CockroachDB、OceanBase。本章拆解其架构、共识算法、分布式事务、HTAP 等核心机制。

### 一、NewSQL 的目标

| 维度 | 传统 RDBMS | NoSQL | NewSQL |
| --- | --- | --- | --- |
| 事务 | ACID 强 | BASE 弱 | ACID 强 |
| SQL | 完整 | 弱或无 | 完整（兼容 MySQL/PG 协议） |
| 水平扩展 | 困难（分库分表） | 天生支持 | 自动分片，透明扩展 |
| 高可用 | 主从复制 | 多副本 | 多副本 + 自动 failover |
| 全球分布 | 不支持 | 部分支持 | 原生支持（Spanner） |

### 二、代表产品

**1. Google Spanner（2012）**
- 全球分布的强一致数据库
- **TrueTime API**：用 GPS + 原子钟提供"误差有界的全局时间"，让分布式事务能用时间戳排序
- 用 Paxos 多副本 + 2PC 跨 shard 事务
- 论文开创了"用原子钟实现外部一致性"的范式

**2. TiDB（PingCAP，开源）**
- **MySQL 协议兼容**：业务无感迁移
- 计算存储分离：TiDB（SQL 层）+ TiKV（KV 存储层）+ TiFlash（列存）
- HTAP：行存 TiKV + 列存 TiFlash，OLTP 与 OLAP 一库搞定
- 用 **Raft** 做多副本共识，Region 自动分裂与迁移

**3. CockroachDB（开源，跨平台）**
- **PostgreSQL 协议兼容**
- 强一致（默认 SERIALIZABLE 隔离级别）
- "全球部署、就近读"：副本可分布在多个 region，读时优先选近的副本
- 名字来自 cockroach（蟑螂）—— 寓意"杀不死"

**4. OceanBase（蚂蚁，开源）**
- 金融级分布式数据库，支撑双 11
- Paxos 多副本 + 强一致
- MySQL / Oracle 兼容模式

### 三、分布式事务

**1. 两阶段提交（2PC）**

经典分布式事务协议，需要一个**协调者（Coordinator）**：

\`\`\`
阶段 1：Prepare（准备）
  协调者 → 参与者：准备好了吗？
  参与者：写 undo/redo 日志，回复 YES / NO

阶段 2：Commit / Abort
  若全部 YES：协调者发 COMMIT，参与者提交
  若有 NO：协调者发 ABORT，参与者回滚
\`\`\`

**问题**：
- 同步阻塞：参与者锁资源等协调者
- 协调者挂了会卡死（不一致窗口）
- 网络分区时数据不一致风险

**2. Percolator（Google）**

TiDB 早期事务模型，基于 BigTable 的实现：
- 用 **时间戳排序** + **锁表**实现分布式事务
- 写时先 prewrite（加锁），再 commit（清锁、写新版本）
- 单点事务协调器（TiDB 节点），无需独立协调者
- 适合"短事务、海量并发"场景

**3. Spanner 的 TrueTime 方案**

Spanner 用 TrueTime 让分布式事务**无需锁等待**：
- 每个事务拿到一个时间戳 \`TT.now()\`，误差 \`ε\`（约 7ms）
- 提交前**等待 \`ε\` 时间**（commit-wait），保证之后所有节点看到的时间都大于此时间戳
- 用时间戳排序即可实现外部一致性

### 四、共识算法：Raft / Paxos

分布式系统用**共识算法**让多个副本对"下一条日志是什么"达成一致。

| 算法 | 特点 | 使用者 |
| --- | --- | --- |
| **Paxos** | 理论奠基（1998），难理解难实现 | Spanner / OceanBase |
| **Raft** | 易理解、易实现（2014） | TiDB / CockroachDB / etcd |

**Raft 核心流程**：
1. **Leader 选举**：节点随机超时，先超时者发投票请求，获多数派当选
2. **日志复制**：客户端写 → Leader → 同步到 Follower → 多数派确认 → 提交
3. **安全性**：任一任期内只能有一个 Leader，已提交日志不会被覆盖

\`\`\`
Client → [Leader] ──log──→ [Follower 1]
                        └→ [Follower 2]
            多数派确认 → Leader 提交 → 回复 Client
\`\`\`

**关键概念**：
- **Term（任期）**：单调递增，标志 Leader 的合法性
- **Quorum（多数派）**：N 个副本中至少 \`floor(N/2)+1\` 个同意
- **Log Index**：日志条目序号，保证顺序一致

### 五、HTAP（Hybrid Transactional/Analytical Processing）

传统架构 OLTP（MySQL）和 OLAP（Hadoop/ClickHouse）分离，数据通过 ETL 同步。HTAP 想**一个数据库同时干两件事**：

| 存储格式 | 适合 | 优势 |
| --- | --- | --- |
| **行存** | OLTP（点查、事务） | 写入快、行级查询快 |
| **列存** | OLAP（聚合、扫描） | 压缩高、扫描列少 |

**TiDB HTAP 实现**：
- TiKV（行存）通过 **Raft Learner** 异步同步到 TiFlash（列存）
- 行存做事务，列存做分析，**强一致读**（通过 \`replica read\` + Raft 校验）

### 六、分片与路由

**分片键（Shard Key）** 决定数据分布：
- **范围分片**：连续范围，支持范围查询但易热点
- **哈希分片**：均匀分散，范围查询需广播
- **预分片**：TiDB Region 默认 96MB，自动分裂

**路由机制**：
- 客户端 → **PD（Placement Driver）** → 查 Region 路由表 → 找到目标 TiKV
- PD 同时负责负载均衡、Region 调度

**踩坑点**：
- 分片键选择决定热点：单调递增字段（自增 id、时间戳）会让新数据集中到一个 Region
- 跨 shard 事务代价大：尽量让事务在单 shard 内完成
- 跨地域延迟：全球部署时强一致写需要等多数派，会引入百毫秒延迟

### 七、选型建议

| 场景 | 推荐 |
| --- | --- |
| 业务规模中等，强一致，团队熟 MySQL | **MySQL + ProxySQL**（够用） |
| 业务爆发，单机扛不住，需透明扩展 | **TiDB**（国内首选） |
| 全球部署、跨地域强一致 | **Spanner / CockroachDB** |
| 金融级、自研、阿里生态 | **OceanBase** |
| 已经在 PG 生态、想分布式 | **CockroachDB** |

### 八、用 SQL 演示分布式表概念

下面用 SQLite 演示**分片、路由、分布式事务**的核心思想。`,
    code: `-- ============================================================
-- 第三章演示：用 SQL 演示分布式表 / 分片 / 路由 / 事务
-- 思路：手动建多个"分片表"模拟数据分布
-- ============================================================

-- 1. 模拟 3 个分片（每个分片是一张表）
CREATE TABLE orders_shard0 (id INTEGER, uid INTEGER, amount INTEGER);
CREATE TABLE orders_shard1 (id INTEGER, uid INTEGER, amount INTEGER);
CREATE TABLE orders_shard2 (id INTEGER, uid INTEGER, amount INTEGER);

-- 2. 模拟"路由"：根据 uid 哈希决定落到哪个 shard
--    hash(uid) % 3 → shard 编号
INSERT INTO orders_shard0 VALUES (1, 100, 100), (4, 103, 50);  -- 100%3=1? 这里写死示例
INSERT INTO orders_shard1 VALUES (2, 101, 200), (5, 104, 80);
INSERT INTO orders_shard2 VALUES (3, 102, 150), (6, 105, 300);

-- 3. "路由表"：演示分片键 → 分片的映射规则
SELECT '3. 路由规则：uid % 3 → shard:' AS info;
WITH sample(uid) AS (VALUES (100),(101),(102),(103))
SELECT uid, (uid % 3) AS shard_no FROM sample;

-- 4. "全局查询"：UNION ALL 把所有分片合并（类似 mongos / TiDB 路由）
SELECT '4. 全局查询（跨分片合并）:' AS info;
SELECT * FROM orders_shard0
UNION ALL
SELECT * FROM orders_shard1
UNION ALL
SELECT * FROM orders_shard2
ORDER BY id;

-- 5. "分片内查询"：知道路由后只查一个分片（高效）
--    假设 uid=102 落在 shard2
SELECT '5. 分片内查询（uid=102 只查 shard2）:' AS info;
SELECT * FROM orders_shard2 WHERE uid = 102;

-- 6. 分布式事务演示：跨分片转账
--    账户表分片在不同表里
CREATE TABLE acct_a (uid INTEGER, balance INTEGER);
CREATE TABLE acct_b (uid INTEGER, balance INTEGER);
INSERT INTO acct_a VALUES (1, 1000);   -- A 分片：uid=1
INSERT INTO acct_b VALUES (2, 500);    -- B 分片：uid=2

-- 两阶段提交思想：BEGIN → 减 A → 加 B → COMMIT
BEGIN;
  UPDATE acct_a SET balance = balance - 100 WHERE uid = 1;
  UPDATE acct_b SET balance = balance + 100 WHERE uid = 2;
  -- 实际分布式需要 2PC/Raft 提交，这里用单机事务模拟
COMMIT;

SELECT '6. 转账后两个账户:' AS info;
SELECT 'A' AS side, * FROM acct_a
UNION ALL
SELECT 'B', * FROM acct_b;

-- 7. 模拟"故障"：A 分片回滚后不平衡
BEGIN;
  UPDATE acct_a SET balance = balance - 50 WHERE uid = 1;
  -- 假设 B 分片写入失败 → ROLLBACK
ROLLBACK;
SELECT '7. 回滚后 A 余额不变:' AS info;
SELECT * FROM acct_a;

-- 8. 模拟 Raft 多副本：每个分片有 3 副本
--    shard0_primary / shard0_replica1 / shard0_replica2
CREATE TABLE shard0_primary  (id INTEGER, data TEXT);
CREATE TABLE shard0_replica1 (id INTEGER, data TEXT);
CREATE TABLE shard0_replica2 (id INTEGER, data TEXT);

-- 写入 Primary 后异步同步到副本
INSERT INTO shard0_primary VALUES (1, 'log-1');
INSERT INTO shard0_replica1 SELECT * FROM shard0_primary;
INSERT INTO shard0_replica2 SELECT * FROM shard0_primary;

SELECT '8. 三副本一致:' AS info;
SELECT 'primary'  AS role, * FROM shard0_primary
UNION ALL
SELECT 'replica1', * FROM shard0_replica1
UNION ALL
SELECT 'replica2', * FROM shard0_replica2;

-- 9. 多数派读：检查 3 副本是否一致
SELECT '9. 多数派校验（3 副本相同）:' AS info;
SELECT
  (SELECT data FROM shard0_primary  WHERE id=1) AS p,
  (SELECT data FROM shard0_replica1 WHERE id=1) AS r1,
  (SELECT data FROM shard0_replica2 WHERE id=1) AS r2,
  CASE WHEN
       (SELECT data FROM shard0_primary WHERE id=1) =
       (SELECT data FROM shard0_replica1 WHERE id=1)
   AND (SELECT data FROM shard0_replica1 WHERE id=1) =
       (SELECT data FROM shard0_replica2 WHERE id=1)
  THEN 'CONSISTENT' ELSE 'DIVERGED' END AS status;
`,
  },

  // =========================================================
  // 第四章：时序与图数据库
  // =========================================================
  {
    id: "sql-timeseries-graph",
    group: "现代数据库",
    icon: "📡",
    title: "时序与图数据库",
    content: `## 时序与图数据库

本章覆盖两类**专用数据库**：时序数据库（专门处理时间序列数据）和图数据库（专门处理关系网络）。两者都解决关系型数据库力不从心的特殊场景。本章也会用 SQL 演示其核心思想——**时序的窗口聚合**与**图的递归遍历**。

---

## 一、时序数据库（Time-Series Database, TSDB）

### 1. 数据模型

时序数据 = **(时间戳, 标签, 数值)** 的连续流：

| 维度 | 内容 |
| --- | --- |
| 时间戳 | 主键，精确到毫秒/纳秒 |
| 标签（Tags） | 不变的元数据：host、region、metric_name |
| 字段（Fields） | 随时间变化的数值：cpu、mem、temperature |

**典型示例**：

\`\`\`
time                  host    metric    value
2026-06-29 10:00:00   host1   cpu       0.45
2026-06-29 10:00:00   host1   mem       0.72
2026-06-29 10:01:00   host1   cpu       0.51
...
\`\`\`

### 2. 代表产品

| 产品 | 特点 | 适合 |
| --- | --- | --- |
| **InfluxDB** | 自研 TSM 引擎，类 SQL 查询（Flux/InfluxQL） | 监控、IoT 通用 |
| **TimescaleDB** | PostgreSQL 扩展，原生 SQL | 已用 PG 的团队 |
| **Prometheus** | 拉模型 + PromQL，专为监控 | 云原生监控标配 |
| **Druid** | 列存 + 预聚合，OLAP 风格 | 实时分析大盘 |
| **OpenTSDB** | 基于 HBase | Hadoop 生态 |

### 3. 核心特性

| 特性 | 价值 |
| --- | --- |
| **高写入吞吐** | 优化顺序写、批量提交，百万点/秒 |
| **降采样（Downsampling）** | 老数据自动从 1s 粒度聚合到 1min/1h，节省存储 |
| **保留策略（Retention）** | 自动清理过期数据，不需要 DELETE |
| **连续查询（Continuous Query）** | 后台定时聚合，结果存另一张表 |
| **时间窗口聚合** | 窗口函数（5min AVG/MAX） |

**踩坑点**：
- 高基数标签（如 \`user_id\`）会爆炸内存：每个 tag 组合对应一个独立 series
- 时间戳必须用 UTC，避免时区错乱
- 写入用批量、不要单条插入

### 4. 用 SQL 模拟时序处理

下面用 SQLite 演示**时间分区、窗口聚合、降采样**。

---

## 二、图数据库（Graph Database）

### 1. 数据模型

图数据库用**属性图**建模：

| 概念 | 类比 | 内容 |
| --- | --- | --- |
| **节点（Node）** | 实体 | 标签（Label）+ 属性 |
| **边（Edge / Relationship）** | 关系 | 类型（Type）+ 方向 + 属性 |
| **属性（Property）** | 字段 | key-value |

**示例：社交关系图**

\`\`\`
(Alice) ──KNOWS──→ (Bob) ──WORKS_AT──→ (Acme)
   │                  │
   └──FRIEND──→ (Charlie) ←─FRIEND── (Dave)
\`\`\`

### 2. 代表产品

| 产品 | 特点 |
| --- | --- |
| **Neo4j** | 最成熟，Cypher 查询语言，原生图存储 |
| **JanusGraph** | 分布式，基于 Cassandra/HBase 后端 |
| **ArangoDB** | 多模型（文档 + 图 + KV） |
| **TigerGraph** | 专注大图分析，支持并行遍历 |
| **Amazon Neptune** | AWS 托管 |

### 3. Cypher 查询语言

Neo4j 的声明式查询语言，类似 SQL 但为图而生：

\`\`\`cypher
// 找 Alice 的二度好友（朋友的朋友，排除自己和直接好友）
MATCH (a:Person {name:"Alice"})-[:KNOWS]->(:Person)-[:KNOWS]->(fof:Person)
WHERE fof <> a
RETURN DISTINCT fof.name

// 最短路径
MATCH p = shortestPath((a:Person {name:"Alice"})-[*..5]-(b:Person {name:"Dave"}))
RETURN p
\`\`\`

### 4. 适用场景

| 场景 | 图数据库价值 |
| --- | --- |
| **社交关系** | 朋友推荐、影响力传播 |
| **推荐系统** | "买了 A 的人也买了 B"协同过滤 |
| **金融反欺诈** | 团伙识别、循环转账检测 |
| **知识图谱** | 实体关系查询推理 |
| **路由/网络** | 最短路径、连通性 |

**踩坑点**：
- 图数据库不适合"全表扫描 + 统计"的 OLAP 场景
- 节点数 > 10 亿后内存压力大，需分布式
- SQL 用递归 CTE 也能模拟小图，超过 3 度遍历性能急剧下降

### 5. 用 SQL 模拟图遍历

下面用 SQLite 的**递归 CTE** 模拟**好友推荐**和**最短路径**——这是图数据库最经典的两类查询。`,
    code: `-- ============================================================
-- 第四章演示：时序数据 + 图遍历（递归 CTE）
-- ============================================================

-- ============ 第一部分：时序数据 ============

-- 1. 模拟时序数据表（metric 表）
CREATE TABLE metrics (
  ts INTEGER,          -- 时间戳（unix 秒）
  host TEXT,           -- 标签：主机
  metric TEXT,         -- 指标名
  value REAL           -- 数值
);

-- 2. 批量插入监控数据（每 60 秒一个点）
INSERT INTO metrics VALUES
  (1719600000, 'host1', 'cpu', 0.45),
  (1719600060, 'host1', 'cpu', 0.51),
  (1719600120, 'host1', 'cpu', 0.55),
  (1719600180, 'host1', 'cpu', 0.60),
  (1719600240, 'host1', 'cpu', 0.48),
  (1719600000, 'host2', 'cpu', 0.30),
  (1719600060, 'host2', 'cpu', 0.35),
  (1719600120, 'host2', 'cpu', 0.40),
  (1719600180, 'host2', 'cpu', 0.50),
  (1719600240, 'host2', 'cpu', 0.45);

-- 3. 简单时序查询：某主机的指标曲线
SELECT '3. host1 cpu 曲线:' AS info;
SELECT ts, value FROM metrics
WHERE host='host1' AND metric='cpu'
ORDER BY ts;

-- 4. 窗口聚合：每 2 分钟（120 秒）一个桶求 AVG
--    类似 InfluxDB 的 GROUP BY time(2m)
SELECT '4. 2 分钟降采样（AVG）:' AS info;
SELECT
  (ts / 120) * 120 AS bucket_start,
  host,
  AVG(value) AS avg_cpu
FROM metrics
WHERE metric = 'cpu'
GROUP BY bucket_start, host
ORDER BY bucket_start, host;

-- 5. 同比环比：用 lag() 看上一个点的变化
SELECT '5. host1 cpu 环比变化:' AS info;
SELECT ts, value,
       value - LAG(value) OVER (ORDER BY ts) AS delta
FROM metrics
WHERE host='host1' AND metric='cpu';

-- 6. 滚动平均：3 点滑动窗口（窗口函数）
SELECT '6. 3 点滚动平均:' AS info;
SELECT ts, value,
       AVG(value) OVER (ORDER BY ts ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS ma3
FROM metrics
WHERE host='host1' AND metric='cpu';

-- 7. 异常检测：超过均值 +1 倍标准差
SELECT '7. host1 异常点（>均值+1σ）:' AS info;
WITH stats AS (
  SELECT AVG(value) AS m, 
         -- SQLite 没有内置 stddev，手动算
         SQRT(AVG(value*value) - AVG(value)*AVG(value)) AS s
  FROM metrics WHERE host='host1' AND metric='cpu'
)
SELECT m.ts, m.value, s.m AS mean, s.s AS std
FROM metrics m, stats s
WHERE m.host='host1' AND m.metric='cpu'
  AND m.value > s.m + s.s;


-- ============ 第二部分：图遍历（递归 CTE） ============

-- 8. 建图：节点 + 边
CREATE TABLE persons (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE knows (
  src INTEGER,    -- 起点节点 id
  dst INTEGER,    -- 终点节点 id
  weight REAL     -- 关系强度（可选）
);

INSERT INTO persons VALUES
  (1, 'Alice'),
  (2, 'Bob'),
  (3, 'Charlie'),
  (4, 'Dave'),
  (5, 'Eve');

-- 无向边（双向插入）
INSERT INTO knows VALUES
  (1, 2, 0.9),  -- Alice - Bob
  (1, 3, 0.7),  -- Alice - Charlie
  (2, 3, 0.5),  -- Bob - Charlie
  (3, 4, 0.8),  -- Charlie - Dave
  (4, 5, 0.6);  -- Dave - Eve

-- 9. 一度好友：直接好友
SELECT '9. Alice 的一度好友:' AS info;
SELECT p2.name AS friend
FROM knows k
JOIN persons p1 ON p1.id = k.src
JOIN persons p2 ON p2.id = k.dst
WHERE p1.name = 'Alice';

-- 10. 二度好友（朋友的朋友，排除自己和直接好友）
--     用递归 CTE 找 2 跳路径
SELECT '10. Alice 的二度好友:' AS info;
WITH RECURSIVE
  hop1 AS (
    SELECT dst FROM knows WHERE src = 1  -- Alice 的一度好友
  ),
  hop2 AS (
    SELECT DISTINCT k.dst
    FROM knows k
    JOIN hop1 ON k.src = hop1.dst   -- 从一度好友再跳一跳
    WHERE k.dst != 1                  -- 排除自己
      AND k.dst NOT IN (SELECT dst FROM hop1)  -- 排除直接好友
  )
SELECT p.name AS second_degree_friend
FROM hop2 JOIN persons p ON p.id = hop2.dst;

-- 11. 递归 CTE：BFS 找最短路径（Alice → Eve）
SELECT '11. Alice → Eve 最短路径（BFS）:' AS info;
WITH RECURSIVE
  bfs(node, path, depth) AS (
    -- 起点
    SELECT 1, 'Alice', 0
    UNION ALL
    -- 扩展：把无向图当作双向
    SELECT
      CASE WHEN k.src = bfs.node THEN k.dst ELSE k.src END,
      bfs.path || ' -> ' || p.name,
      bfs.depth + 1
    FROM bfs
    JOIN knows k ON k.src = bfs.node OR k.dst = bfs.node
    JOIN persons p ON p.id = CASE WHEN k.src = bfs.node THEN k.dst ELSE k.src END
    WHERE p.name NOT IN (SELECT substr(path, -5, 5))  -- 简单防重复
      AND bfs.depth < 5  -- 防止无限递归
  )
SELECT path, depth
FROM bfs
WHERE node = 5  -- Eve
ORDER BY depth
LIMIT 1;  -- 最短路径

-- 12. 连通分量：从 Alice 出发能到达的所有人
SELECT '12. Alice 可达的所有人:' AS info;
WITH RECURSIVE
  reach(node, visited) AS (
    SELECT 1, '1'
    UNION ALL
    SELECT
      CASE WHEN k.src = r.node THEN k.dst ELSE k.src END,
      r.visited || ',' || CAST(CASE WHEN k.src = r.node THEN k.dst ELSE k.src END AS TEXT)
    FROM reach r
    JOIN knows k ON k.src = r.node OR k.dst = r.node
    WHERE NOT ((',' || r.visited || ',') LIKE ('%,' ||
      CAST(CASE WHEN k.src = r.node THEN k.dst ELSE k.src END AS TEXT) || ',%'))
  )
SELECT DISTINCT p.name
FROM reach r JOIN persons p ON p.id = r.node;
`,
  },

  // =========================================================
  // 第五章：向量数据库与 AI 时代
  // =========================================================
  {
    id: "sql-vector-db",
    group: "现代数据库",
    icon: "🧬",
    title: "向量数据库与 AI 时代",
    content: `## 向量数据库与 AI 时代

**大模型（LLM）时代催生了向量数据库这一新物种**。它存储的是高维向量（embedding），按"语义相似度"而非"精确匹配"来检索。本章拆解：向量嵌入、相似度搜索、ANN 算法、代表产品（含 pgvector）、RAG 架构、AI 时代数据库趋势。

### 一、向量嵌入（Embedding）

把文本、图片、音频等**非结构化数据**通过模型转成固定维度的浮点向量，让"语义相近"在向量空间里"距离相近"。

\`\`\`
"我喜欢数据库"  →  Embedding 模型  →  [0.21, -0.43, 0.88, ..., 0.05]  (768 维)
"I love databases" →  Embedding 模型  →  [0.19, -0.41, 0.90, ..., 0.07]
                                          ↑ 两向量余弦相似度高（≈0.95）
\`\`\`

| 维度 | 说明 |
| --- | --- |
| **维度（Dimension）** | 常见 128/256/768/1536/3072（OpenAI text-embedding-3-large） |
| **生成模型** | OpenAI text-embedding-3、BGE、Cohere、Jina、sentence-transformers |
| **相似度度量** | 余弦相似度、欧氏距离（L2）、点积 |
| **存储成本** | 768 维 × float32 = 3KB/向量，亿级数据约 300GB |

### 二、相似度搜索

给定查询向量 \`q\`，从数据库找最相似的 top-k 向量。核心是**距离度量**：

**1. 余弦相似度（Cosine Similarity）**

\`\`\`
cos(q, v) = (q · v) / (|q| × |v|)
         = Σ(qᵢ × vᵢ) / (√Σqᵢ² × √Σvᵢ²)
\`\`\`

值域 \`[-1, 1]\`，越大越相似。**适合文本语义**，因为只看方向不看模长。

**2. 欧氏距离（L2 Distance）**

\`\`\`
L2(q, v) = √Σ(qᵢ - vᵢ)²
\`\`\`

值越小越相似。**适合图像检索**（同样模长下方向差异代表内容差异）。

**3. 点积（Dot Product）**

\`\`\`
dot(q, v) = Σ(qᵢ × vᵢ)
\`\`\`

如果向量已归一化（模长 1），点积 = 余弦相似度。计算最快，常用于 ANN。

### 三、ANN 近似最近邻（Approximate Nearest Neighbor）

精确找 top-k 需要扫描全库（O(N)），亿级数据无法接受。ANN 用**牺牲一点点精度换巨大速度**：

| 算法 | 思想 | 优势 | 劣势 |
| --- | --- | --- | --- |
| **HNSW** | 分层小世界图，从顶层粗查到底层精查 | 召回高、查询快 | 内存大、构建慢 |
| **IVF** | K-means 聚类分桶，只查最近的几个桶 | 内存友好 | 召回受桶数影响 |
| **IVF-PQ** | IVF + 乘积量化压缩向量 | 内存极小 | 精度损失明显 |
| **LSH** | 局部敏感哈希，相似向量哈希到同桶 | 简单 | 高维效果差 |

**HNSW 是当前主流**：Milvus、Qdrant、pgvector、Elasticsearch 都用它。

**关键指标**：
- **召回率（Recall）**：ANN 找到的 top-k / 真实 top-k，目标 ≥ 95%
- **QPS**：每秒查询数
- **内存占用**：原始向量 + 索引结构

**踩坑点**：
- ANN 是"近似"，关键业务（如人脸支付）需精确匹配
- 索引参数（efSearch、nprobe）需调优，召回与速度需平衡
- 向量更新会破坏索引，需定期重建

### 四、代表产品

| 产品 | 特点 | 适合 |
| --- | --- | --- |
| **Milvus** | 开源、分布式、云原生，支持多种索引 | 大规模生产 |
| **Pinecone** | 全托管 SaaS，零运维 | 快速接入 |
| **pgvector** | PostgreSQL 扩展，SQL 直接查 | 已用 PG 的小规模场景 |
| **Chroma** | 轻量、Python 友好，AI 应用开发首选 | 原型、本地 |
| **Qdrant** | Rust 实现，高性能，过滤能力强 | 中等规模 + 复杂过滤 |
| **Weaviate** | 内置模型 + GraphQL | 一站式 |
| **FAISS** | Meta 开源库，非数据库 | 离线批量检索 |

**pgvector 用法**（PostgreSQL 扩展）：

\`\`\`sql
CREATE EXTENSION vector;

CREATE TABLE docs (
  id   SERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(1536)  -- 1536 维向量
);

-- 插入
INSERT INTO docs (content, embedding)
VALUES ('hello', '[0.1, 0.2, ...]');

-- 建索引（HNSW）
CREATE INDEX ON docs USING hnsw (embedding vector_cosine_ops);

-- 相似度搜索（找最相似的 5 个）
SELECT id, content, embedding <=> '[0.1, 0.2, ...]' AS distance
FROM docs
ORDER BY embedding <=> '[0.1, 0.2, ...]'
LIMIT 5;

-- 距离操作符：
-- <=>   欧氏距离
-- <~>   内积
-- <#>   余弦距离
\`\`\`

### 五、RAG 检索增强生成

**RAG = 检索（Retrieve）+ 增强（Augment）+ 生成（Generate）**，解决 LLM 知识滞后与幻觉问题。

\`\`\`
用户提问
   │
   ▼
1. Embedding 模型把问题转成查询向量
   │
   ▼
2. 向量数据库检索 top-k 相关文档（如 k=5）
   │
   ▼
3. 把检索到的文档塞进 prompt（上下文增强）
   │
   ▼
4. LLM 基于上下文生成答案
\`\`\`

**典型技术栈**：
- **文档处理**：LangChain / LlamaIndex
- **向量库**：Chroma（原型）/ Milvus（生产）
- **Embedding 模型**：OpenAI text-embedding-3 / BGE
- **LLM**：GPT-4 / Claude / 文心一言 / 通义

**踩坑点**：
- **召回质量决定答案质量**：检索不准，再强的 LLM 也救不回来
- **chunk 切分很关键**：太大稀释重点，太小丢失上下文，常用 500-1000 token + overlap
- **元数据过滤**：先用 SQL 过滤（如"只搜 2024 年的文档"），再做向量搜索，效果更好
- **rerank**：检索 top-100 后用 cross-encoder 重排到 top-5，能显著提升精度

### 六、AI 时代数据库新趋势

| 趋势 | 说明 |
| --- | --- |
| **多模态存储** | 文本 + 图像 + 音频统一向量空间 |
| **混合查询** | SQL 过滤 + 向量检索一体化（pgvector、Elasticsearch） |
| **原生 AI 数据库** | 如 SingleStore、Snowflake Cortex，内置模型推理 |
| **Serverless 向量库** | Pinecone Serverless、TurboPuffer，按用量付费 |
| **GPU 加速** | FAISS-GPU、CuVS 把检索速度推到百万 QPS |
| **结构化 + 非结构化融合** | 向量列 + JSON 列 + 关系列，一个库搞定 |

**选型建议**：
- **已有 PostgreSQL，向量量 < 100 万** → pgvector，简单
- **大规模生产（亿级向量 + 高 QPS）** → Milvus 集群
- **不想运维、要快** → Pinecone / Qdrant Cloud
- **本地开发、原型** → Chroma，几行 Python 就跑
- **企业内已有 ElasticSearch** → 直接用 ES 的 dense_vector

### 七、用 SQL 演示向量相似度

下面用 SQLite **手算**余弦相似度与 L2 距离，演示向量检索的核心数学。SQLite 没有 vector 类型，但用 \`JSON\` 存向量数组、用标量函数算距离——足以理解概念。`,
    code: `-- ============================================================
-- 第五章演示：用 SQL 实现向量相似度搜索
-- 思路：向量存 JSON 数组，用数学公式手算余弦相似度
-- ============================================================

-- 1. 文档表：content + 向量（2 维示意，便于人工核对）
CREATE TABLE docs (
  id INTEGER PRIMARY KEY,
  content TEXT,
  -- 向量存 JSON 数组，例如 [0.1, 0.2]
  embedding TEXT
);

INSERT INTO docs VALUES
  (1, '我喜欢数据库',       '[0.10, 0.90]'),
  (2, '我爱 MySQL',         '[0.15, 0.88]'),
  (3, '今天的天气真好',     '[0.85, 0.10]'),
  (4, '户外徒步很有趣',     '[0.80, 0.20]'),
  (5, '向量检索与 AI',      '[0.50, 0.60]');

-- 2. 把向量"展开"成标量（每行一维），便于聚合计算
--    json_each(value) 把 JSON 数组展开成多行
--    注意：json_each 虚拟表也有 id 列，需用 docs.id 限定
SELECT '2. 把文档 1 的向量展开成多行:' AS info;
SELECT key AS dim_index, value AS dim_value
FROM docs, json_each(embedding)
WHERE docs.id = 1;

-- 3. 手算余弦相似度：cos(A, B) = Σ(Aᵢ×Bᵢ) / (√ΣAᵢ² × √ΣBᵢ²)
--    查询向量 q = [0.12, 0.85]（"我喜欢 DB"）
--    注意：WITH 子句只作用于紧随其后的单条 SELECT
SELECT '3. 余弦相似度排名（q=[0.12,0.85]）:' AS info;
WITH query_vec AS (
  SELECT 0.12 AS q0, 0.85 AS q1
),
doc_vec AS (
  -- 把 JSON 向量解析成两列（2 维示意）
  SELECT
    id, content,
    json_extract(embedding, '$[0]') AS v0,
    json_extract(embedding, '$[1]') AS v1
  FROM docs
),
dot_and_norms AS (
  SELECT
    d.id, d.content,
    -- 点积：Σ(qᵢ × vᵢ)
    (q.q0 * d.v0 + q.q1 * d.v1) AS dot,
    -- |q|
    SQRT(q.q0*q.q0 + q.q1*q.q1) AS norm_q,
    -- |v|
    SQRT(d.v0*d.v0 + d.v1*d.v1) AS norm_v
  FROM doc_vec d, query_vec q
)
SELECT
  content,
  ROUND(dot / (norm_q * norm_v), 4) AS cosine_sim
FROM dot_and_norms
ORDER BY cosine_sim DESC;

-- 4. 手算 L2 距离：√Σ(qᵢ - vᵢ)²
SELECT '4. L2 距离排名（值越小越相似）:' AS info;
WITH query_vec AS (SELECT 0.12 AS q0, 0.85 AS q1)
SELECT
  content,
  ROUND(
    SQRT(
      POWER(json_extract(embedding, '$[0]') - q.q0, 2) +
      POWER(json_extract(embedding, '$[1]') - q.q1, 2)
    ), 4
  ) AS l2_distance
FROM docs, query_vec q
ORDER BY l2_distance ASC;

-- 5. TOP-K 检索：取最相似的 2 个（向量数据库核心操作）
SELECT '5. TOP-2 相似文档（RAG 检索）:' AS info;
WITH query_vec AS (SELECT 0.12 AS q0, 0.85 AS q1),
doc_vec AS (
  SELECT id, content,
         json_extract(embedding, '$[0]') AS v0,
         json_extract(embedding, '$[1]') AS v1
  FROM docs
)
SELECT content,
       ROUND((q.q0*v0 + q.q1*v1) /
             (SQRT(q.q0*q.q0+q.q1*q.q1) * SQRT(v0*v0+v1*v1)), 4) AS sim
FROM doc_vec, query_vec q
ORDER BY sim DESC
LIMIT 2;

-- 6. 模拟带元数据过滤的检索（"只搜内容含数据库的文档"）
SELECT '6. 先 SQL 过滤再向量排序:' AS info;
WITH query_vec AS (SELECT 0.12 AS q0, 0.85 AS q1),
filtered AS (
  SELECT id, content,
         json_extract(embedding, '$[0]') AS v0,
         json_extract(embedding, '$[1]') AS v1
  FROM docs
  WHERE content LIKE '%数据库%' OR content LIKE '%MySQL%'  -- 元数据过滤
)
SELECT content,
       ROUND((q.q0*v0 + q.q1*v1) /
             (SQRT(q.q0*q.q0+q.q1*q.q1) * SQRT(v0*v0+v1*v1)), 4) AS sim
FROM filtered, query_vec q
ORDER BY sim DESC;

-- 7. 模拟 ANN 索引思想：分桶后只查近桶
--    假设按 v0 是否 > 0.5 分桶（粗筛）
CREATE TABLE docs_bucketed AS
SELECT *,
       CASE WHEN json_extract(embedding, '$[0]') > 0.5 THEN 'B1' ELSE 'B0' END AS bucket
FROM docs;

SELECT '7. 分桶后向量（粗筛加速）:' AS info;
SELECT id, content, embedding, bucket FROM docs_bucketed;

-- 查询向量 q=[0.12,0.85]，v0=0.12 < 0.5 → 只查 B0 桶
SELECT '   只在 B0 桶内做精确检索:' AS info;
SELECT id, content FROM docs_bucketed WHERE bucket = 'B0';

-- 8. 模拟 HNSW 分层：上层稀疏图（每 2 个节点取 1 个）
SELECT '8. 模拟 HNSW 顶层稀疏节点（每隔一个取一个）:' AS info;
SELECT id, content
FROM (
  SELECT *, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM docs
) WHERE rn % 2 = 0;
`,
  },
];
