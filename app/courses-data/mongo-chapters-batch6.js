// =============================================================
// 《MongoDB 实战教程》- 章节批次 6
// -------------------------------------------------------------
// 内容：第六部分 性能优化与运维实战（第 26-30 章）
// =============================================================

const chapters = [
  {
    id: "mongo-ch26",
    group: "第六部分 性能优化与运维实战",
    icon: "⚡",
    title: "第 26 章 性能优化",
    content: `# 第 26 章 性能优化

数据库性能问题往往不是"加个索引"就能解决，需要从存储引擎、内存、索引、查询、写入多个层面系统优化。本章带你建立完整的性能优化知识体系，掌握 **working set**、**WiredTiger 缓存**、**索引优化**、**查询 Profiling**、**慢查询日志**、**覆盖查询**、**聚合管道优化**、**\$hint**、**避免 COLLSCAN**、**内存管理** 与 **批量操作** 等核心技能。

## 26.1 性能优化方法论

### 性能优化的分层模型

\`\`\`
应用层       →  连接池、批量、缓存
查询层       →  索引、执行计划、避免全表扫描
存储引擎层   →  WiredTiger 缓存、压缩、检查点
硬件层       →  CPU、内存、磁盘 IO、网络
\`\`\`

**优化顺序原则**：自上而下。先优化应用层（最便宜），再优化查询层，最后才考虑加硬件。

### 性能问题的典型症状

| 症状 | 可能原因 | 排查工具 |
| --- | --- | --- |
| 查询慢 | 缺索引、全表扫描、回表多 | explain()、Profiler |
| 写入慢 | 索引过多、锁竞争、IO 瓶颈 | mongostat、currentOp |
| 内存飙升 | 工作集大于缓存、全表扫描 | serverStatus、wiredTiger.cache |
| CPU 高 | 大量计算、聚合、压缩 | top、mongostat |
| IO 高 | 缓存命中率低、频繁刷盘 | iostat、mongostat dirty |
| 连接数高 | 连接泄漏、连接池配置不当 | serverStatus.connections |

> **踩坑提示**：
> - 性能优化要先定位瓶颈（CPU / 内存 / IO / 锁），不要盲目加索引
> - 优化前先建立基线（baseline），优化后对比效果
> - 一次只改一个变量，否则无法判断哪个优化起效

## 26.2 WiredTiger 存储引擎

MongoDB 3.2+ 默认使用 **WiredTiger** 存储引擎（之前是 MMAPv1，已废弃）。

### 核心特性

| 特性 | 说明 |
| --- | --- |
| 文档级锁 | 不同文档可并发修改，并发度高 |
| 压缩 | 支持 Snappy（默认）/ Zlib / Zstd 压缩，节省磁盘 |
| 缓存 | 内置 WiredTiger Cache，类似 InnoDB Buffer Pool |
| 检查点 | 默认 60 秒一次，把脏页刷盘 |

### 关键参数

\`\`\`bash
# 启动时配置
mongod --storageEngine wiredTiger \
  --wiredTigerCacheSizeGB 4 \
  --wiredTigerJournalCompressor snappy \
  --wiredTigerCollectionBlockCompressor snappy
\`\`\`

\`\`\`yaml
# 配置文件方式
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 4
    collectionConfig:
      blockCompressor: snappy
    indexConfig:
      prefixCompression: true
\`\`\`

> **踩坑提示**：
> - cacheSizeGB 默认是物理内存的 50%-60%，不要随意调大，要留内存给操作系统文件缓存
> - 压缩能省 50%-70% 磁盘，但消耗 CPU，CPU 瓶颈场景可以关闭
> - 检查点间隔（checkpointMs）默认 60s，调大减少 IO 但崩溃恢复慢

## 26.3 工作集与内存管理

### 什么是工作集（Working Set）

**工作集** 是数据库日常访问的"热数据"集合，包括索引和频繁访问的文档。

\`\`\`
工作集 = 热索引 + 热文档 + 操作系统需要的内存
\`\`\`

性能黄金法则：**工作集应能放进内存（WiredTiger Cache + OS 文件缓存）**。一旦工作集超过内存，频繁的磁盘读写会导致性能急剧下降。

### 估算工作集大小

\`\`\`javascript
// 方法 1：通过 serverStatus 估算
const st = db.serverStatus();
// workingSet 指标（部分版本可用）
print("当前 resident 内存: " + st.mem.resident + "MB");

// 方法 2：通过集合统计
db.products.stats().size;        // 集合总大小
db.products.totalIndexSize();    // 索引总大小

// 方法 3：基于访问模式估算
// 假设 80% 访问集中在 20% 数据上
// 工作集 ≈ 总数据量 × 20% + 总索引大小
\`\`\`

### WiredTiger Cache 工作机制

\`\`\`
查询 → 检查 Cache → 命中 → 返回
              ↓ 未命中
         从磁盘加载到 Cache → 返回
\`\`\`

### 查看缓存命中率

\`\`\`javascript
db.serverStatus().wiredTiger.cache;

// 关键指标
{
  "bytes currently in the cache": 2147483648,  // 当前缓存大小
  "maximum bytes configured": 4294967296,       // 配置上限
  "pages read into cache": 100000,              // 累计从磁盘读入次数
  "pages written from cache": 50000,            // 累计写盘次数
  "pages requested from the cache": 1000000,    // 累计请求次数
  "pages evicted by application threads": 100   // 应用线程驱逐页数
}

// 命中率 = 1 - (pages read into cache / pages requested from cache)
// 健康值应 > 95%
\`\`\`

### 缓存调优脚本

\`\`\`javascript
// 查看 cache 情况
const stats = db.serverStatus().wiredTiger.cache;
const hitRate = 1 - (stats["pages read into cache"] / stats["pages requested from the cache"]);
console.log("缓存命中率：" + (hitRate * 100).toFixed(2) + "%");
console.log("缓存使用率：" + (stats["bytes currently in the cache"] / stats["maximum bytes configured"] * 100).toFixed(2) + "%");
\`\`\`

**命中率低的原因**：

- 工作集大于缓存（最常见）：加内存或缩小工作集
- 全表扫描：大量冷数据冲掉热数据
- 索引不合理：扫描过多文档

### 内存管理策略

| 场景 | 策略 |
| --- | --- |
| 工作集 < 内存 | cacheSizeGB 设为内存 50%，剩余留给 OS 文件缓存 |
| 工作集 ≈ 内存 | cacheSizeGB 设为内存 60-70%，并考虑加内存 |
| 工作集 > 内存 | 必须加内存，或用分片分散工作集 |
| 多实例共享机器 | 每实例 cacheSizeGB 之和不超过内存 70% |

> **踩坑提示**：
> - WiredTiger Cache 不是越大越好，OS 文件缓存对索引读取也很重要
> - 频繁的 page eviction 说明内存不足，是加内存的信号
> - 监控 \`pages evicted by application threads\`，应用线程驱逐会阻塞查询

## 26.4 索引优化

### 索引选择原则

1. **查询频繁的字段**才建索引
2. **高选择性**字段优先（不同值多）
3. **复合索引**顺序：等值在前，范围在后，排序最后
4. **覆盖查询**：查询字段都在索引里，无需回表

\`\`\`javascript
// 查询：{ status: "active", age: { $gt: 18 } }, 排序 { createdAt: -1 }
// 最优复合索引
db.users.createIndex({ status: 1, age: 1, createdAt: -1 });
\`\`\`

### ESR 原则

复合索引字段顺序遵循 **ESR 原则**：

| 顺序 | 类型 | 说明 |
| --- | --- | --- |
| 1 | **E**quality | 等值查询字段 |
| 2 | **S**ort | 排序字段 |
| 3 | **R**ange | 范围查询字段 |

\`\`\`javascript
// 查询：{ city: "北京", age: { $gte: 18 } }, 排序 { name: 1 }
// ESR 顺序：city(等值) → name(排序) → age(范围)
db.users.createIndex({ city: 1, name: 1, age: 1 });
\`\`\`

### 覆盖查询（Covered Query）

**覆盖查询**：查询和投影字段全部在索引中，无需回表（FETCH）读取文档，性能最佳。

\`\`\`javascript
// 创建索引
db.users.createIndex({ userId: 1, name: 1, age: 1 });

// 覆盖查询：只查询和返回索引字段
db.users.find(
  { userId: "u1001" },
  { _id: 0, name: 1, age: 1 }  // 投影只含索引字段
).explain("executionStats");

// 执行计划中 stage 为 PROJECTION_COVERED，无 FETCH，性能最佳
\`\`\`

### 索引分析

\`\`\`javascript
// 查看查询计划
db.products.find({ category: "phone", price: { $lt: 5000 } }).explain("executionStats");

// 关键指标
{
  "winningPlan": {
    "stage": "FETCH",
    "inputStage": {
      "stage": "IXSCAN",       // 用了索引
      "indexName": "category_1_price_1",
      "indexBounds": { ... }
    }
  },
  "executionStats": {
    "totalKeysExamined": 100,   // 扫描索引项数
    "totalDocsExamined": 100,   // 扫描文档数
    "nReturned": 100,           // 返回文档数
    "executionTimeMillis": 5    // 耗时
  }
}

// 健康指标：nReturned / totalDocsExamined 接近 1
// 不健康：COLLSCAN（全表扫描）或 totalDocsExamined >> nReturned
\`\`\`

### 避免 COLLSCAN

**COLLSCAN**（Collection Scan）即全表扫描，是最慢的查询方式。

\`\`\`javascript
// 差：无索引字段查询，触发 COLLSCAN
db.users.find({ bio: /MongoDB/ }).explain();
// winningPlan.stage = "COLLSCAN"  ← 全表扫描

// 好：用索引字段过滤
db.users.createIndex({ city: 1 });
db.users.find({ city: "北京" }).explain();
// winningPlan.stage = "FETCH" + inputStage.stage = "IXSCAN"
\`\`\`

### 使用 \$hint 强制索引

当优化器选错索引时，可以用 \`$hint\` 强制指定索引。

\`\`\`javascript
// 优化器选错索引，查询慢
db.products.find({ category: "phone", price: { $lt: 5000 } });

// 用 $hint 强制使用指定索引
db.products.find({ category: "phone", price: { $lt: 5000 } })
  .hint("category_1_price_1");

// 也可用 hint 指定索引规范
db.products.find({ category: "phone" }).hint({ category: 1, price: 1 });

// 查看优化器选择了哪个索引
db.products.find({ category: "phone" }).explain("queryPlanner");
\`\`\`

> **踩坑提示**：
> - $hint 是临时方案，长期应通过索引设计让优化器自动选对
> - 强制索引可能比优化器选择更差，使用前先 explain 对比

### 删除无用索引

\`\`\`javascript
// 查看索引使用情况
db.products.aggregate([{ $indexStats: {} }]);

// 输出示例
// { name: "category_1", accesses: { ops: 10000, since: ISODate("...") } }
// { name: "unused_idx", accesses: { ops: 0, since: ISODate("...") } }  ← 未使用

// 删除未使用索引
db.products.dropIndex("unused_index_name");

// 查看所有索引
db.products.getIndexes();
\`\`\`

> **踩坑提示**：
> - 索引不是越多越好，每个索引增加写入开销和内存占用
> - 索引大小应能放进内存，否则索引扫描也会变慢
> - 正则表达式前缀匹配才能用索引（\`/^张/\` 可以，\`/张/\` 不行）

## 26.5 查询优化与执行计划

### explain 的三种模式

\`\`\`javascript
// 1. queryPlanner：只返回执行计划，不执行查询（最快）
db.users.find({ age: 25 }).explain("queryPlanner");

// 2. executionStats：执行查询并返回统计（最常用）
db.users.find({ age: 25 }).explain("executionStats");

// 3. allPlansExecution：执行所有候选计划并统计（最详细，最慢）
db.users.find({ age: 25 }).explain("allPlansExecution");
\`\`\`

### 执行计划关键字段

| 字段 | 含义 | 健康标准 |
| --- | --- | --- |
| winningPlan.stage | 主阶段 | 非 COLLSCAN |
| inputStage.stage | 子阶段 | IXSCAN 优于 COLLSCAN |
| totalKeysExamined | 扫描索引键数 | 接近 nReturned |
| totalDocsExamined | 扫描文档数 | 接近 nReturned |
| nReturned | 返回文档数 | - |
| executionTimeMillis | 执行耗时 | 越小越好 |

### 避免前置模糊查询

\`\`\`javascript
// 差：前缀通配，无法用索引
db.users.find({ name: /张.*/ });   // 不能用索引
db.users.find({ name: /.*张/ });   // 不能用索引

// 好：前缀固定，可用索引
db.users.find({ name: /^张/ });    // 能用索引
\`\`\`

### 限制返回字段

\`\`\`javascript
// 差：返回所有字段
db.products.find({});

// 好：只返回需要的字段
db.products.find({}, { name: 1, price: 1, _id: 0 });
\`\`\`

### 分页优化

\`\`\`javascript
// 差：skip 大偏移量
db.products.find({}).skip(100000).limit(10);  // 越翻越慢

// 好：用游标（_id 或时间戳）
db.products.find({ _id: { $gt: lastId } }).sort({ _id: 1 }).limit(10);

// 更好：带过滤条件的游标分页
db.products.find({ createdAt: { $lt: lastTime }, status: "active" })
  .sort({ createdAt: -1 })
  .limit(10);
\`\`\`

### \$lookup 优化

\`\`\`javascript
// 差：先 lookup 后过滤
db.orders.aggregate([
  { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
  { $match: { status: "paid" } }
]);

// 好：先过滤再 lookup
db.orders.aggregate([
  { $match: { status: "paid" } },  // 先减少数据量
  { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } }
]);
\`\`\`

## 26.6 慢查询日志与 Profiling

### 开启 Profiler

\`\`\`javascript
// 级别说明
// 0: 关闭
// 1: 记录慢查询（> slowms）
// 2: 记录所有操作

// 记录超过 100ms 的查询
db.setProfilingLevel(1, { slowms: 100 });

// 记录所有操作（调试用，影响性能）
db.setProfilingLevel(2);

// 查看当前级别
db.getProfilingStatus();
// { was: 1, slowms: 100 }
\`\`\`

### 配置文件方式

\`\`\`yaml
# mongod.conf
operationProfiling:
  mode: slowOp           # off / slowOp / all
  slowOpThresholdMs: 100
  slowOpSampleRate: 1.0  # 采样率，1.0 = 全部记录
\`\`\`

### 查询慢操作

\`\`\`javascript
// 慢查询存在 system.profile 集合（capped collection）
db.system.profile.find().sort({ ts: -1 }).limit(5).pretty();

// 查询最慢的 10 个操作
db.system.profile.find()
  .sort({ millis: -1 })
  .limit(10)
  .forEach(p => print(p.op + " " + p.ns + " " + p.millis + "ms " + JSON.stringify(p.command).substring(0, 100)));

// 查询某个集合的慢操作
db.system.profile.find({ ns: "shop.orders" }).sort({ ts: -1 }).limit(10);

// 查询全表扫描的慢操作
db.system.profile.find({ planSummary: "COLLSCAN" }).sort({ millis: -1 });
\`\`\`

### 示例输出

\`\`\`javascript
{
  "op": "query",
  "ns": "shop.orders",
  "command": { find: "orders", filter: { status: "paid" }, sort: { createdAt: -1 } },
  "keysExamined": 0,
  "docsExamined": 1000000,  // 扫描了 100 万文档！
  "nreturned": 50,
  "millis": 2500,           // 耗时 2.5 秒
  "planSummary": "COLLSCAN" // 全表扫描
}
\`\`\`

### 慢查询日志文件

除了 Profiler，MongoDB 还会把慢查询写入日志文件（mongod.log）。

\`\`\`bash
# 设置慢查询阈值（动态参数）
mongo --eval 'db.adminCommand({ setParameter: 1, slowOpThresholdMs: 200 })'

# 查看日志中的慢查询
grep "Slow query" /var/log/mongodb/mongod.log

# 日志格式示例
# 2026-07-01T10:00:00.000+0800 I COMMAND  [conn123] command shop.orders
#   command: find { find: "orders", filter: { status: "paid" } }
#   planSummary: COLLSCAN keysExamined:0 docsExamined:1000000
#   nreturned:50 reslen:5000 protocol:op_msg 2500ms
\`\`\`

> **踩坑提示**：
> - Profiler 级别 2 会显著影响性能，生产环境只用级别 1
> - system.profile 是固定集合（capped），默认 1MB，会循环覆盖
> - 慢查询定位后要及时关闭 Profiler，避免影响性能
> - 日志文件慢查询和 Profiler 是两套机制，可同时使用

## 26.7 聚合管道优化

聚合管道（aggregation pipeline）的优化核心是 **尽早减少数据量**。

### 优化原则

1. **$match 放最前**：先过滤再处理
2. **$project 提前**：只保留需要的字段
3. **$lookup 放后**：最后做关联
4. **用 $facet 并行**：多个独立聚合合并

\`\`\`javascript
// 差：先处理再过滤
db.orders.aggregate([
  { $unwind: "$items" },                    // 展开所有订单
  { $group: { _id: "$items.productId", total: { $sum: "$items.price" } } },
  { $match: { total: { $gt: 1000 } } }      // 最后才过滤
]);

// 好：先过滤再处理
db.orders.aggregate([
  { $match: { status: "paid", createdAt: { $gte: ISODate("2026-07-01") } } },
  { $unwind: "$items" },                    // 只展开已支付的订单
  { $group: { _id: "$items.productId", total: { $sum: "$items.price" } } },
  { $match: { total: { $gt: 1000 } } }
]);
\`\`\`

### 使用索引加速 \$match

\`\`\`javascript
// $match 阶段如果用索引，能极大提速
db.orders.createIndex({ status: 1, createdAt: 1 });

db.orders.aggregate([
  { $match: { status: "paid", createdAt: { $gte: ISODate("2026-07-01") } } },
  // 第一个 $match 会使用索引
  { $group: { _id: "$userId", total: { $sum: "$amount" } } }
]);
\`\`\`

### \$facet 并行多个聚合

\`\`\`javascript
// 一次扫描，多个统计结果
db.orders.aggregate([
  { $match: { createdAt: { $gte: ISODate("2026-07-01") } } },
  { $facet: {
    "byStatus": [
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ],
    "byUser": [
      { $group: { _id: "$userId", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ],
    "totalAmount": [
      { $group: { _id: null, sum: { $sum: "$amount" } } }
    ]
  }}
]);
\`\`\`

### allowDiskUse 处理大数据

\`\`\`javascript
// 大数据聚合可能超过 100MB 内存限制
// allowDiskUse 允许写入临时文件
db.orders.aggregate(
  [
    { $group: { _id: "$userId", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } }
  ],
  { allowDiskUse: true }
);
\`\`\`

> **踩坑提示**：
> - $group 和 $sort 是最耗内存的阶段，注意 100MB 限制
> - $lookup 性能差，能通过数据建模避免就避免
> - 聚合管道顺序很重要，$match 永远放第一个

## 26.8 写入优化与批量操作

### 批量写入

\`\`\`javascript
// 差：循环单条插入
for (const doc of docs) {
  await collection.insertOne(doc);  // 1000 次网络往返
}

// 好：批量插入
await collection.insertMany(docs);  // 1 次网络往返

// unordered 容错
await collection.insertMany(docs, { ordered: false });  // 一条失败不影响其他
\`\`\`

### BulkWrite 批量混合操作

\`\`\`javascript
// 批量混合操作（插入、更新、删除）
const bulkOps = [
  { insertOne: { document: { _id: 1, name: "A" } } },
  { updateOne: { filter: { _id: 2 }, update: { $set: { name: "B" } } } },
  { deleteOne: { filter: { _id: 3 } } },
  { replaceOne: { filter: { _id: 4 }, replacement: { name: "D" } } }
];

await collection.bulkWrite(bulkOps, { ordered: false });
// 返回结果
// { insertedCount: 1, modifiedCount: 1, deletedCount: 1, replacedCount: 1 }
\`\`\`

### 使用 \$inc 代替 read-modify-write

\`\`\`javascript
// 差：读取 → 修改 → 写回（非原子，并发问题）
const user = await users.findOne({ _id: userId });
await users.updateOne({ _id: userId }, { $set: { loginCount: user.loginCount + 1 } });

// 好：原子操作
await users.updateOne({ _id: userId }, { $inc: { loginCount: 1 } });
\`\`\`

### 写关注分级

非关键数据用低写关注，提升性能。

\`\`\`javascript
// 日志：w=1 即可
db.logs.insertOne({ msg: "xxx" }, { writeConcern: { w: 1 } });

// 订单：majority
db.orders.insertOne({ ... }, { writeConcern: { w: "majority", j: true } });
\`\`\`

### 分片写入

单 shard 写入瓶颈时，分片能水平扩展写入。

\`\`\`javascript
// 按用户 ID 哈希分片，写入分散到多个 shard
sh.shardCollection("shop.orders", { userId: "hashed" });
\`\`\`

> **踩坑提示**：
> - 批量写入要控制 batch size，单批过大可能触发 16MB 限制或超时
> - unordered 批量写入性能更好，但失败时部分成功，要处理重试
> - 高并发写同一文档会触发 WiredTiger 重试，影响吞吐，考虑用计算模式预聚合

## 26.9 本章小结

- **WiredTiger** 是默认存储引擎，支持文档级锁、压缩、内置缓存
- **工作集**应能放进内存，缓存命中率应 > 95%，低于此值说明工作集大于内存
- **索引优化**遵循 **ESR 原则**：等值 → 排序 → 范围，善用覆盖查询
- **查询优化**：避免全表扫描（COLLSCAN）、前置模糊、大 skip，用游标分页，必要时用 \$hint
- **慢查询定位**：db.setProfilingLevel 开启 Profiler，分析 system.profile 集合
- **聚合优化**：$match 放最前，尽早减少数据量
- **写入优化**：批量写（bulkWrite）、原子操作、写关注分级、分片水平扩展

> **踩坑提示**：
> - 性能优化要先定位瓶颈（CPU/内存/IO/锁），不要盲目加索引
> - explain() 是排查利器，关注 totalDocsExamined / nReturned 比值
> - 生产环境索引变更要在低峰期，建索引会锁集合（background 模式除外）
> - 监控 cache 命中率和 page eviction，是性能预警的关键指标
> - \$hint 是临时方案，长期应通过索引设计让优化器自动选对`
  },

  {
    id: "mongo-ch27",
    group: "第六部分 性能优化与运维实战",
    icon: "📊",
    title: "第 27 章 监控与诊断",
    content: `# 第 27 章 监控与诊断

数据库上线后，**监控是第二道防线**（第一道是备份）。没有监控的数据库是黑盒——出问题才知道，为时已晚。本章介绍 MongoDB 自带的监控工具：**mongostat**、**mongotop**、**db.serverStatus**、**db.currentOp**、**db.killOp**、**\$currentOp 聚合**、**副本集状态**、**健康检查**、**关键指标**、**Atlas 监控** 与 **Ops Manager**。

## 27.1 mongostat

**mongostat** 是命令行实时监控工具，类似 Linux 的 vmstat。

### 基本用法

\`\`\`bash
# 基本用法
mongostat --uri="mongodb://localhost:27017"

# 副本集
mongostat --uri="mongodb://host1:27017,host2:27017/?replicaSet=rs0" --discover

# 每隔 5 秒输出，共 100 次
mongostat -n 100 5

# JSON 输出（方便程序处理）
mongostat --json
\`\`\`

### 输出字段解读

\`\`\`
insert query update delete getmore command dirty used flushes vsize  res qrw arw net_in net_out conn    time
*0    *0    *0     *0     0      1|0    0.0% 50.0%    0  1.5G 500M 0|0 0|0  160b  10.0k    1  10:00:00
\`\`\`

| 字段 | 含义 |
| --- | --- |
| insert/query/update/delete | 每秒各类操作数 |
| getmore | 每秒 getMore（游标拉取）数 |
| command | 每秒命令数 |
| dirty | WiredTiger 脏页比例（> 20% 警告） |
| used | 缓存使用比例（> 95% 警告） |
| flushes | 检查点刷盘次数 |
| qrw | 排队读写请求数（> 0 说明有阻塞） |
| arw | 活跃读写请求数 |
| conn | 当前连接数 |
| net_in/net_out | 网络流入/流出字节 |
| time | 时间戳 |

> **关键阈值**：
> - dirty > 20%：脏页太多，写入会变慢
> - used > 95%：缓存满了，频繁驱逐
> - qrw > 0：有请求排队，可能有锁竞争

### 副本集监控

\`\`\`bash
# --discover 自动发现副本集所有节点
mongostat --uri="mongodb://host1:27017/?replicaSet=rs0" --discover

# 输出会显示每个节点的状态
# host        insert query update delete ...   state
# host1:27017 *0    *0    *0     *0     ...   PRIMARY
# host2:27017 *0    *0    *0     *0     ...   SECONDARY
# host3:27017 *0    *0    *0     *0     ...   SECONDARY
\`\`\`

## 27.2 mongotop

**mongotop** 显示每个集合的读写耗时，定位热点集合。

\`\`\`bash
# 基本用法
mongotop --uri="mongodb://localhost:27017"

# 输出示例
                        ns       total        read       write    2026-07-01T10:00:00
          shop.products      500ms      450ms       50ms
             shop.orders      200ms      180ms       20ms
              shop.users       50ms       40ms       10ms
\`\`\`

\`\`\`bash
# 每隔 5 秒输出，共 10 次
mongotop 5 10

# 显示锁信息
mongotop --locks
\`\`\`

**用法**：定位哪个集合读写耗时最长，针对性优化。如果某个集合 read 耗时异常高，可能是缺索引或全表扫描。

## 27.3 db.serverStatus

\`db.serverStatus()\` 是最全的运行状态命令，返回几百个指标。

\`\`\`javascript
const status = db.serverStatus();

// 关键指标分组
{
  connections: { current: 100, available: 9900 },  // 连接数
  opcounters: { insert: 1000, query: 5000, update: 200, delete: 50 },  // 操作计数
  opcountersRepl: { insert: 900, query: 0, update: 180, delete: 40 },  // 副本集操作计数
  memory: { resident: 500, virtual: 1500, mapped: 2000 },  // 内存
  wiredTiger: { cache: { ... } },  // 缓存详情
  metrics: {
    query: { scannedObjects: 100000, returned: 50000 },  // 扫描/返回比
    document: { deleted: 50, inserted: 1000, returned: 5000, updated: 200 }
  },
  locks: { ... },  // 锁信息
  repl: { ... }    // 副本集状态
}
\`\`\`

### 关键监控指标

| 指标分类 | 指标 | 说明 | 告警阈值 |
| --- | --- | --- | --- |
| 连接 | connections.current | 当前连接数 | > 80% 上限 |
| 操作 | opcounters.query | 查询 QPS | 突变告警 |
| 操作 | opcounters.insert | 插入 QPS | 突变告警 |
| 内存 | mem.resident | 物理内存使用 | 持续增长 |
| 缓存 | wiredTiger.cache 命中率 | 缓存命中率 | < 95% |
| 缓存 | dirty bytes | 脏页比例 | > 20% |
| 延迟 | opLatencies | 操作延迟 | > 100ms |
| 副本集 | repl.lag | 同步延迟 | > 10s |

### 自定义健康检查脚本

\`\`\`javascript
// 提取关键指标
const s = db.serverStatus();
const cache = s.wiredTiger.cache;
const hitRate = 1 - (cache["pages read into cache"] / cache["pages requested from the cache"]);

print("=== MongoDB 健康检查 ===");
print("当前连接: " + s.connections.current + "/" + (s.connections.current + s.connections.available));
print("缓存使用: " + (cache["bytes currently in the cache"] / 1024 / 1024).toFixed(0) + "MB / " +
      (cache["maximum bytes configured"] / 1024 / 1024).toFixed(0) + "MB");
print("缓存命中率: " + (hitRate * 100).toFixed(2) + "%");
print("脏页比例: " + cache["tracked dirty bytes in the cache"]);
print("操作计数 QPS: insert=" + s.opcounters.insert +
      " query=" + s.opcounters.query +
      " update=" + s.opcounters.update +
      " delete=" + s.opcounters.delete);
\`\`\`

### 操作延迟监控

\`\`\`javascript
// MongoDB 4.0+ 提供操作延迟直方图
db.serverStatus().opLatencies;

// 输出示例
{
  "reads": {
    "latency": 5000,      // 总延迟（微秒）
    "ops": 1000,          // 操作数
    "histogram": [        // 直方图
      { "micros": 1, "count": 100 },
      { "micros": 16, "count": 500 },
      { "micros": 512, "count": 300 },
      { "micros": 16384, "count": 100 }  // 16ms 以上的有 100 个
    ]
  },
  "writes": { ... },
  "commands": { ... }
}
\`\`\`

## 27.4 db.currentOp 与 db.killOp

### db.currentOp

\`db.currentOp()\` 查看当前正在执行的操作，用于定位长时间运行的查询。

\`\`\`javascript
// 查看所有操作
db.currentOp();

// 只看活跃操作（非空闲）
db.currentOp({ "active": true });

// 只看运行超过 3 秒的操作
db.currentOp({ "secs_running": { $gte: 3 } });

// 只看某个集合的操作
db.currentOp({ "ns": "shop.orders" });

// 只看写操作
db.currentOp({ "op": { $in: ["insert", "update", "remove"] } });
\`\`\`

### 输出字段

\`\`\`javascript
{
  "inprog": [
    {
      "opid": -1234567890,        // 操作 ID（用于 killOp）
      "active": true,             // 是否活跃
      "secs_running": 12,         // 已运行秒数
      "microsecs_running": 12000000,
      "op": "query",              // 操作类型
      "ns": "shop.orders",        // 命名空间
      "command": {                // 命令详情
        "find": "orders",
        "filter": { "status": "paid" },
        "sort": { "createdAt": -1 }
      },
      "planSummary": "COLLSCAN",  // 执行计划摘要
      "client": "10.0.0.1:12345", // 客户端地址
      "clientMetadata": { driver: { name: "nodejs", version: "4.0" } },
      "numYields": 100,           // 让出锁次数
      "locks": { ... }            // 持有的锁
    }
  ]
}
\`\`\`

### db.killOp

\`db.killOp()\` 终止指定操作。

\`\`\`javascript
// 终止一个长时间运行的查询
db.killOp(-1234567890);

// 批量终止超时操作
db.currentOp({ "secs_running": { $gte: 60 } }).inprog.forEach(op => {
  print("Killing opid: " + op.opid + " running " + op.secs_running + "s");
  db.killOp(op.opid);
});
\`\`\`

> **踩坑提示**：
> - killOp 不是立即生效，是发送中断信号，操作可能还会运行一会
> - killOp 不能终止某些不可中断的操作（如 fsync）
> - 频繁 killOp 说明查询设计有问题，要从源头优化

## 27.5 $currentOp 聚合

**\$currentOp** 是聚合管道阶段，比 db.currentOp() 更灵活，支持更复杂的过滤。

\`\`\`javascript
// 使用 $currentOp 聚合
db.aggregate([
  { $currentOp: { allUsers: true, idleConnections: false, localOps: true } },
  { $match: { "secs_running": { $gte: 5 } } },
  { $project: { opid: 1, op: 1, ns: 1, secs_running: 1, planSummary: 1, client: 1 } },
  { $sort: { secs_running: -1 } }
]);

// 查看所有等待锁的操作
db.aggregate([
  { $currentOp: { allUsers: true, idleConnections: false } },
  { $match: { "waitingForLock": true } }
]);

// 查看所有分片操作（分片集群）
db.aggregate([
  { $currentOp: { allUsers: true, idleConnections: false } },
  { $match: { "clientMetadata.driver.name": "nodejs" } }
]);
\`\`\`

### \$currentOp vs db.currentOp

| 对比 | db.currentOp() | $currentOp 聚合 |
| --- | --- | --- |
| 语法 | 命令式 | 聚合管道 |
| 过滤 | 简单条件 | 支持完整聚合操作 |
| 输出 | 固定字段 | 可用 $project 定制 |
| 排序 | 不支持 | 支持 $sort |
| 灵活性 | 低 | 高 |

## 27.6 副本集状态与健康检查

### rs.status()

\`\`\`javascript
// 副本集状态
rs.status();

// 关键字段
{
  "set": "rs0",
  "date": ISODate("..."),
  "myState": 1,           // 1=PRIMARY, 2=SECONDARY, etc.
  "members": [
    {
      "name": "host1:27017",
      "stateStr": "PRIMARY",
      "uptime": 86400,
      "optime": { ts: Timestamp(...), t: 1 },
      "optimeDate": ISODate("..."),
      "syncingTo": "",
      "syncSourceHost": "",
      "health": 1,          // 1=健康, 0=宕机
      "electionTime": ISODate("..."),
      "lastHeartbeat": ISODate("..."),
      "lastHeartbeatRecv": ISODate("..."),
      "pingMs": 1           // 心跳延迟
    },
    {
      "name": "host2:27017",
      "stateStr": "SECONDARY",
      "optime": { ... },
      "lag": 0              // 同步延迟（秒）
    }
  ]
}
\`\`\`

### 同步延迟检查

\`\`\`javascript
// 查看各 secondary 的同步延迟
rs.printSecondaryReplicationInfo();

// 输出示例
// source: host2:27017
//  syncedTo: Mon Jul 01 2026 10:00:00 GMT+0800 (CST)
//  0 secs (0 hrs) behind the primary
// source: host3:27017
//  3600 secs (1 hrs) behind the primary  ← 严重延迟

// 使用 rs.status() 检查
rs.status().members.forEach(m => {
  print(m.name + " " + m.stateStr + " health=" + m.health + " pingMs=" + m.pingMs);
});
\`\`\`

### 其他副本集命令

\`\`\`javascript
// 查看副本集配置
rs.conf();

// 查看 primary 是谁
db.hello().primary;
db.hello().secondary;

// 查看是否是 primary
db.hello().isWritablePrimary;

// 强制重新选举
rs.stepDown(60);  // 让出 primary 角色 60 秒

// 查看选举状态
rs.electionInfo();
\`\`\`

> **踩坑提示**：
> - 同步延迟 > 10s 要告警，> 60s 会导致读不到最新数据
> - secondary 频繁重连可能是网络问题或 secondary 负载过高
> - 监控心跳 pingMs，过高说明网络问题

## 27.7 关键监控指标详解

### 连接数监控

\`\`\`javascript
const conn = db.serverStatus().connections;
print("当前连接: " + conn.current);
print("可用连接: " + conn.available);
print("连接使用率: " + (conn.current / (conn.current + conn.available) * 100).toFixed(2) + "%");

// 连接数过高排查
db.currentOp(true).inprog
  .map(op => op.client)
  .filter(c => c)
  .reduce((acc, c) => { acc[c] = (acc[c] || 0) + 1; return acc; }, {});
// 按客户端 IP 统计连接数
\`\`\`

### 操作 QPS 监控

\`\`\`javascript
// 两次采样计算 QPS
const s1 = db.serverStatus().opcounters;
sleep(1000);
const s2 = db.serverStatus().opcounters;

print("Insert QPS: " + (s2.insert - s1.insert));
print("Query QPS: " + (s2.query - s1.query));
print("Update QPS: " + (s2.update - s1.update));
print("Delete QPS: " + (s2.delete - s1.delete));
print("Command QPS: " + (s2.command - s1.command));
\`\`\`

### 缓存使用监控

\`\`\`javascript
const cache = db.serverStatus().wiredTiger.cache;
const usedPct = cache["bytes currently in the cache"] / cache["maximum bytes configured"] * 100;
const dirtyPct = cache["tracked dirty bytes in the cache"] / cache["maximum bytes configured"] * 100;
const hitRate = (1 - cache["pages read into cache"] / cache["pages requested from cache"]) * 100;

print("缓存使用率: " + usedPct.toFixed(2) + "%");
print("脏页比例: " + dirtyPct.toFixed(2) + "%");
print("命中率: " + hitRate.toFixed(2) + "%");
\`\`\`

### 指标告警阈值表

| 指标 | 正常 | 警告 | 严重 |
| --- | --- | --- | --- |
| 缓存命中率 | > 95% | 90-95% | < 90% |
| 缓存使用率 | < 80% | 80-95% | > 95% |
| 脏页比例 | < 5% | 5-20% | > 20% |
| 连接数 | < 50% 上限 | 50-80% | > 80% |
| 同步延迟 | < 1s | 1-10s | > 10s |
| 查询延迟 | < 10ms | 10-100ms | > 100ms |
| 磁盘使用率 | < 70% | 70-85% | > 85% |

## 27.8 Atlas 监控

**MongoDB Atlas** 提供内置的监控仪表盘，无需额外配置。

### Atlas 监控面板

| 面板 | 指标 |
| --- | --- |
| Overview | 操作数、连接数、网络、磁盘 |
| Replication | 副本集状态、同步延迟 |
| Network | 网络入站/出站 |
| Hardware | CPU、内存、磁盘 IO |
| Query | 慢查询、查询性能 |
| Data Explorer | 数据浏览 |

### Atlas 慢查询分析

\`\`\`
Atlas → Performance Advisor → 自动分析慢查询并建议索引
\`\`\`

Atlas 的 Performance Advisor 会自动分析慢查询，并给出索引建议。

### Atlas 告警配置

\`\`\`
Atlas → Alerts → 配置告警规则：
- 连接数 > 80% 上限
- 缓存命中率 < 95%
- 同步延迟 > 10s
- 磁盘使用率 > 85%
- 节点故障
\`\`\`

## 27.9 Ops Manager

**Ops Manager** 是 MongoDB 企业版提供的运维管理平台，用于管理自建 MongoDB 集群。

### Ops Manager 功能

| 功能 | 说明 |
| --- | --- |
| 自动化部署 | 一键部署副本集、分片集群 |
| 监控 | 实时监控所有集群 |
| 备份 | 自动备份 + PITR |
| 升级 | 滚动升级自动化 |
| 告警 | 灵活告警规则 |
| 审计 | 操作审计日志 |

### Ops Manager vs Atlas

| 对比 | Ops Manager | Atlas |
| --- | --- | --- |
| 部署 | 自建（企业版） | 云服务 |
| 控制 | 完全控制 | 受限 |
| 费用 | 企业版授权 | 按需付费 |
| 适合 | 大企业、合规要求 | 中小团队 |

## 27.10 Prometheus + Grafana

生产环境推荐用 **Prometheus + Grafana** 做长期监控和可视化。

### 架构

\`\`\`
MongoDB → mongodb_exporter → Prometheus → Grafana
\`\`\`

### 部署 mongodb_exporter

\`\`\`yaml
# docker-compose.yml
version: "3"
services:
  mongodb-exporter:
    image: percona/mongodb_exporter:latest
    environment:
      - MONGODB_URI=mongodb://exporter:pass@mongodb:27017
    ports:
      - "9216:9216"
  
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
\`\`\`

\`\`\`yaml
# prometheus.yml
scrape_configs:
  - job_name: mongodb
    static_configs:
      - targets: [mongodb-exporter:9216]
\`\`\`

### 监控账号创建

\`\`\`javascript
// 创建只读监控账号
use admin;
db.createUser({
  user: "exporter",
  pwd: "strongPassword",
  roles: [
    { role: "clusterMonitor", db: "admin" },
    { role: "read", db: "local" }
  ]
});
\`\`\`

### 关键告警规则

\`\`\`yaml
# prometheus alert rules
groups:
  - name: mongodb
    rules:
      - alert: MongodbDown
        expr: mongodb_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "MongoDB 实例宕机"

      - alert: MongodbHighConnections
        expr: mongodb_ss_connections{state="current"} / (mongodb_ss_connections{state="current"} + mongodb_ss_connections{state="available"}) > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "MongoDB 连接数过高"

      - alert: MongodbReplicationLag
        expr: mongodb_rs_members_lag > 10
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "副本集同步延迟过大"
\`\`\`

### Grafana 面板

Grafana 官方有现成的 MongoDB dashboard 模板（ID: 7353、16490），导入即用。

> **踩坑提示**：
> - mongodb_exporter 要用专用监控账号，最小权限原则
> - 监控数据保留时间根据存储容量调整，一般 7-30 天
> - 关键业务要配置告警规则（连接数、缓存命中率、副本集状态）
> - 采集间隔建议 15-30 秒，过于频繁会影响性能

## 27.11 本章小结

- **mongostat**：命令行实时监控，关注 dirty/used/qrw
- **mongotop**：集合级读写耗时，定位热点集合
- **serverStatus**：最全运行状态，自定义监控脚本基础
- **currentOp / killOp**：查看和终止正在执行的操作
- **\$currentOp 聚合**：比 db.currentOp 更灵活的查询方式
- **副本集状态**：rs.status()、同步延迟监控
- **关键指标**：连接数、QPS、延迟、缓存命中率、同步延迟
- **Atlas / Ops Manager**：官方监控管理平台
- **Prometheus + Grafana**：生产级长期监控方案

> **踩坑提示**：
> - 监控要全覆盖：连接、内存、缓存、操作、副本集、磁盘
> - 慢查询日志要定期分析，建立索引优化清单
> - 告警要分级：致命（服务挂）、严重（性能差）、警告（趋势异常）
> - 监控本身不要成为性能负担，exporter 采集间隔建议 15-30 秒`
  },

  {
    id: "mongo-ch28",
    group: "第六部分 性能优化与运维实战",
    icon: "💾",
    title: "第 28 章 备份与恢复",
    content: `# 第 28 章 备份与恢复

**没有备份的数据库是定时炸弹**。数据丢失的原因不只是磁盘损坏——误操作（dropTable/deleteMany）、程序 bug、勒索软件都可能毁掉数据。本章系统讲解 MongoDB 的备份与恢复方案，涵盖 **mongodump/mongorestore**、**mongodump with query/oplog**、**bsondump**、**文件系统快照备份**、**oplog-based PITR**、**全量+增量备份策略**、**恢复流程** 与 **分片集群备份**。

## 28.1 备份策略概览

### 备份类型对比

| 备份类型 | 工具 | 速度 | 体积 | 恢复速度 | 适用场景 |
| --- | --- | --- | --- | --- | --- |
| 逻辑备份 | mongodump | 慢 | 中 | 慢 | 小库、跨版本迁移 |
| 物理备份 | 文件系统快照 | 快 | 大 | 快 | 大库、快速恢复 |
| 增量备份 | oplog 导出 | 快 | 小 | 中 | 连续备份、PITR |
| JSON 导出 | mongoexport | 慢 | 大 | 慢 | 数据迁移、交换 |

### 备份策略组合

\`\`\`
生产环境推荐方案：
1. 全量备份：文件系统快照（每日，从 secondary）
2. 增量备份：oplog 导出（每小时）
3. 误操作恢复：delayed 节点（延迟 1-2 小时）
4. 异地备份：备份文件同步到其他机房/云存储
\`\`\`

### 3-2-1 备份原则

- **3** 份数据副本
- **2** 种不同存储介质
- **1** 份异地存放

## 28.2 mongodump / mongorestore

**mongodump** 是 MongoDB 自带的逻辑备份工具，导出 BSON 格式数据。

### 基本用法

\`\`\`bash
# 备份整个数据库
mongodump --uri="mongodb://localhost:27017" --out=/backup/\$(date +%Y%m%d)

# 备份单个数据库
mongodump --uri="mongodb://localhost:27017/shop" --out=/backup/

# 备份单个集合
mongodump --uri="mongodb://localhost:27017/shop" --collection=products --out=/backup/

# 压缩备份
mongodump --uri="mongodb://localhost:27017/shop" --gzip --archive=shop.gz
\`\`\`

### 恢复

\`\`\`bash
# 恢复整个备份
mongorestore --uri="mongodb://localhost:27017" /backup/20260701/

# 恢复压缩文件
mongorestore --uri="mongodb://localhost:27017" --gzip --archive=shop.gz

# 恢复到不同数据库名
mongorestore --uri="mongodb://localhost:27017" --nsFrom="shop.*" --nsTo="shop_backup.*" /backup/

# drop 恢复前先删除现有数据
mongorestore --drop --uri="mongodb://localhost:27017" /backup/

# 并行恢复（加快速度）
mongorestore --uri="mongodb://localhost:27017" --numParallelCollections=4 /backup/
\`\`\`

### 副本集备份

\`\`\`bash
# 从 secondary 备份，不影响 primary
mongodump --uri="mongodb://secondary:27017/?replicaSet=rs0&readPreference=secondary" --out=/backup/
\`\`\`

> **踩坑提示**：
> - mongodump 是逻辑备份，大库备份慢，恢复更慢（要重建索引）
> - 备份期间会读取大量数据，建议从 secondary 备份
> - 不保证时间点一致（除非加 --oplog 参数）

## 28.3 mongodump with query / oplog

### 按查询条件备份

\`\`\`bash
# 只备份符合条件的文档
mongodump --uri="mongodb://localhost:27017/shop" --collection=orders \
  --query='{ "status": "paid", "createdAt": { "$gte": { "$date": "2026-07-01T00:00:00Z" } } }' \
  --out=/backup/paid_orders/

# 只备份部分字段
mongodump --uri="mongodb://localhost:27017/shop" --collection=users \
  --fields="name,email,createdAt" --out=/backup/users_partial/
\`\`\`

### mongodump --oplog（时间点一致备份）

\`\`\`bash
# 备份时记录 oplog，保证时间点一致（仅副本集）
mongodump --oplog --uri="mongodb://localhost:27017/?replicaSet=rs0" --out=/backup/

# 备份结果中多一个 oplog.bson 文件，记录备份期间的写操作
# 恢复时用 --oplogReplay 回放，保证一致性
\`\`\`

### 恢复时回放 oplog

\`\`\`bash
# 恢复并回放 oplog（保证时间点一致）
mongorestore --oplogReplay --uri="mongodb://localhost:27017" /backup/

# 恢复并回放 oplog 到指定时间点（PITR）
mongorestore --oplogReplay --oplogLimit=1751392200,1 \
  --uri="mongodb://localhost:27017" /backup/
# oplogLimit 格式：timestamp,inc
\`\`\`

> **踩坑提示**：
> - --oplog 只能用于副本集，单机不支持
> - --query 备份的集合恢复时不会自动建索引，要手动处理
> - --oplog 备份期间不能有 DDL 操作（如创建索引、删除集合）

## 28.4 bsondump

**bsondump** 把 BSON 文件转换为 JSON，用于查看备份内容。

\`\`\`bash
# 查看 BSON 文件内容
bsondump /backup/shop/products.bson

# 输出到文件
bsondump /backup/shop/products.bson > products.json

# JSON 数组格式
bsondump --jsonArray /backup/shop/products.bson > products.json

# 查看备份的 oplog
bsondump /backup/oplog.bson | head -10
\`\`\`

### bsondump 用途

| 用途 | 说明 |
| --- | --- |
| 检查备份内容 | 不恢复的情况下查看备份了什么 |
| 数据转换 | BSON → JSON，用于其他系统 |
| 调试 | 排查备份文件是否损坏 |

\`\`\`bash
# 检查备份文件是否完整
bsondump /backup/shop/products.bson | wc -l  # 文档数

# 查看单个文档结构
bsondump /backup/shop/products.bson | head -1 | python -m json.tool
\`\`\`

## 28.5 mongoexport / mongoimport

**mongoexport** 导出 JSON/CSV 格式，适合数据迁移和与其他系统交换。

### 导出

\`\`\`bash
# 导出 JSON
mongoexport --uri="mongodb://localhost:27017/shop" --collection=products --out=products.json

# 导出 CSV
mongoexport --uri="mongodb://localhost:27017/shop" --collection=products \
  --type=csv --fields=name,price,stock --out=products.csv

# 查询条件导出
mongoexport --uri="mongodb://localhost:27017/shop" --collection=orders \
  --query='{ "status": "paid", "createdAt": { "$gte": { "$date": "2026-07-01T00:00:00Z" } } }' \
  --out=paid_orders.json

# 导出排序后的数据
mongoexport --uri="mongodb://localhost:27017/shop" --collection=orders \
  --sort='{ "createdAt": -1 }' --limit=1000 --out=recent_orders.json
\`\`\`

### 导入

\`\`\`bash
# 导入 JSON
mongoimport --uri="mongodb://localhost:27017/shop" --collection=products --file=products.json

# 导入 CSV（带表头）
mongoimport --uri="mongodb://localhost:27017/shop" --collection=products \
  --type=csv --headerline --file=products.csv

# upsert 模式（按 _id 更新）
mongoimport --uri="mongodb://localhost:27017/shop" --collection=products \
  --mode=upsert --upsertFields=_id --file=products.json

# 并行导入
mongoimport --uri="mongodb://localhost:27017/shop" --collection=products \
  --numInsertionWorkers=4 --file=products.json
\`\`\`

> **踩坑提示**：
> - JSON 导出会丢失部分 BSON 类型（如 ObjectId 变成字符串）
> - 大数据迁移用 BSON（mongodump）比 JSON 快
> - CSV 不支持嵌套文档，复杂结构用 JSON

## 28.6 文件系统快照备份

**文件系统快照**是物理备份，瞬间完成，适合大数据量。

### 前提条件

- 数据目录在 LVM 或 ZFS 文件系统上
- journal 与数据在同一卷
- 必须**锁定写入**保证一致（单机），副本集 secondary 不需要

### 单机快照操作步骤

\`\`\`bash
# 1. 锁定数据库（仅 single 节点，副本集不需要）
mongo --eval 'db.fsyncLock()'

# 2. 创建 LVM 快照
lvcreate --snapshot --size 10G --name mongo_snap /dev/vg0/mongo_data

# 3. 解锁
mongo --eval 'db.fsyncUnlock()'

# 4. 挂载快照，备份数据
mount /dev/vg0/mongo_snap /mnt/snap
tar -czf /backup/mongo_snap.tar.gz -C /mnt/snap .

# 5. 删除快照
umount /mnt/snap
lvremove -f /dev/vg0/mongo_snap
\`\`\`

### 副本集快照备份

副本集**不需要锁**，直接对 secondary 做快照。

\`\`\`bash
# 停止 secondary（或直接快照）
systemctl stop mongod

# 快照
lvcreate --snapshot --size 10G --name mongo_snap /dev/vg0/mongo_data

# 启动 secondary（会自动同步增量）
systemctl start mongod
\`\`\`

### 快照恢复

\`\`\`bash
# 1. 停止 mongod
systemctl stop mongod

# 2. 清空数据目录
rm -rf /data/mongodb/*

# 3. 从快照恢复
tar -xzf /backup/mongo_snap.tar.gz -C /data/mongodb/

# 4. 启动 mongod
systemctl start mongod

# 5. 如果是副本集，可能需要重置 rs 状态
# 删除 local 数据库的副本集信息
mongo --eval 'db.getSiblingDB("local").system.replset.remove({})'
# 重新初始化
mongo --eval 'rs.initiate({...})'
\`\`\`

> **踩坑提示**：
> - 快照不是备份，要拷贝到其他存储才算备份
> - 快照占用磁盘空间，及时清理
> - LVM 快照会降低原卷 IO 性能，备份后立即删除
> - 恢复后要检查索引和副本集配置

## 28.7 oplog-based PITR

**PITR（Point-in-Time Recovery）**：恢复到任意时间点，用于误操作回滚。

### PITR 原理

\`\`\`
时间线：
  全量备份 ──────── oplog 增量 ──────── 误操作 ──────── 现在
  T0              T1   T2   T3         T4            T5

恢复到 T3（误操作前）：
  1. 恢复 T0 的全量备份
  2. 回放 oplog 从 T0 到 T3
\`\`\`

### 完整 PITR 示例

\`\`\`bash
# 场景：14:35 误删了 orders 集合，要恢复到 14:30 的状态

# 1. 停止当前 MongoDB，准备恢复
systemctl stop mongod
rm -rf /data/mongo/*
systemctl start mongod

# 2. 恢复全量备份（带 oplog）
mongorestore --oplogReplay --oplogLimit=1751392200,1 \
  --uri="mongodb://localhost:27017" /backup/full_20260701/

# oplogLimit 格式：timestamp,inc
# 1751392200 是 2026-07-01 14:30:00 的 Unix 时间戳

# 3. 查询 oplog 找到误操作前的时间戳
mongo --eval '
  use local;
  db.oplog.rs.find({
    ns: "shop.orders",
    op: "c",
    "command.drop": "orders"
  }).sort({ ts: -1 }).limit(1)
'
\`\`\`

### 用 oplog 做增量备份

\`\`\`bash
# 1. 全量备份（带 oplog 时间戳）
mongodump --oplog --uri="mongodb://localhost:27017/?replicaSet=rs0" --out=/backup/full_20260701

# 2. 记录全量备份完成时间
mongo --eval 'db.getSiblingDB("local").oplog.rs.find().sort({ts:-1}).limit(1)'
# 输出：{ ts: Timestamp(1751392200, 1), ... }

# 3. 定期导出 oplog（每小时）
LAST_TS='Timestamp(1751392200, 1)'
mongodump --uri="mongodb://localhost:27017/local" --collection=oplog.rs \
  --query="{ ts: { \\\$gt: { \\\$timestamp: { t: 1751392200, i: 1 } } } }" \
  --out=/backup/incremental_$(date +%Y%m%d%H)
\`\`\`

### 增量备份脚本

\`\`\`javascript
// Node.js 增量备份脚本
const { MongoClient } = require("mongodb");
const fs = require("fs");

async function backupOplog() {
  const client = await MongoClient.connect("mongodb://localhost:27017/?replicaSet=rs0");
  const local = client.db("local");
  const oplog = local.collection("oplog.rs");

  // 读取上次备份的时间戳
  const lastTs = await getLastBackupTs();
  const query = lastTs ? { ts: { $gt: lastTs } } : {};

  // 查询新 oplog
  const newOps = await oplog.find(query).toArray();
  console.log("新增 oplog 条数：" + newOps.length);

  // 保存到文件
  if (newOps.length > 0) {
    const fileName = "oplog_" + Date.now() + ".json";
    fs.writeFileSync("/backup/" + fileName, JSON.stringify(newOps));

    // 更新最后时间戳
    await saveLastBackupTs(newOps[newOps.length - 1].ts);
  }

  await client.close();
}

// 每小时执行一次
setInterval(backupOplog, 3600 * 1000);
\`\`\`

> **踩坑提示**：
> - oplog 是固定集合（capped），会被覆盖，增量备份间隔要小于 oplog 保留时间
> - 增量备份文件要按时间有序保存，恢复时按顺序回放
> - oplogLimit 要精确到误操作前一刻，否则会再次执行误操作

## 28.8 全量+增量备份策略

### 备份策略设计

\`\`\`
备份周期示例：
- 每日 02:00：全量备份（文件系统快照，从 secondary）
- 每小时：增量备份（oplog 导出）
- 实时：delayed 节点（延迟 2 小时，用于误操作恢复）

保留策略：
- 全量备份：保留 7 天
- 增量备份：保留 2 天
- delayed 节点：天然滚动
\`\`\`

### 自动化备份脚本

\`\`\`bash
#!/bin/bash
# backup_mongo.sh - MongoDB 自动备份脚本

BACKUP_DIR="/backup/mongo"
DATE=$(date +%Y%m%d_%H%M%S)
TYPE=$1  # full or incremental

mkdir -p $BACKUP_DIR

if [ "$TYPE" = "full" ]; then
  # 全量备份：从 secondary 快照
  echo "开始全量备份..."
  mongodump --oplog \
    --uri="mongodb://secondary:27017/?replicaSet=rs0" \
    --gzip --archive=$BACKUP_DIR/full_$DATE.gz
  echo "全量备份完成：full_$DATE.gz"

  # 更新时间戳
  mongo --quiet --eval '
    var last = db.getSiblingDB("local").oplog.rs.find().sort({ts:-1}).limit(1).next();
    print(last.ts.t + "," + last.ts.i)
  ' > $BACKUP_DIR/last_ts.txt

  # 清理 7 天前的全量备份
  find $BACKUP_DIR -name "full_*.gz" -mtime +7 -delete

elif [ "$TYPE" = "incremental" ]; then
  # 增量备份：导出 oplog
  echo "开始增量备份..."
  TS_FILE=$BACKUP_DIR/last_ts.txt
  if [ ! -f "$TS_FILE" ]; then
    echo "找不到时间戳文件，请先做全量备份"
    exit 1
  fi
  LAST_TS=$(cat $TS_FILE)
  TS_T=$(echo $LAST_TS | cut -d, -f1)
  TS_I=$(echo $LAST_TS | cut -d, -f2)

  mongodump --uri="mongodb://secondary:27017/local" --collection=oplog.rs \
    --query="{ ts: { \\\$gt: { \\\$timestamp: { t: $TS_T, i: $TS_I } } } }" \
    --gzip --archive=$BACKUP_DIR/incr_$DATE.gz
  echo "增量备份完成：incr_$DATE.gz"

  # 更新时间戳
  mongo --quiet --eval '
    var last = db.getSiblingDB("local").oplog.rs.find().sort({ts:-1}).limit(1).next();
    print(last.ts.t + "," + last.ts.i)
  ' > $BACKUP_DIR/last_ts.txt

  # 清理 2 天前的增量备份
  find $BACKUP_DIR -name "incr_*.gz" -mtime +2 -delete
fi
\`\`\`

### crontab 配置

\`\`\`bash
# 每日凌晨 2 点全量备份
0 2 * * * /opt/scripts/backup_mongo.sh full >> /var/log/mongo_backup.log 2>&1

# 每小时增量备份
0 * * * * /opt/scripts/backup_mongo.sh incremental >> /var/log/mongo_backup.log 2>&1
\`\`\`

## 28.9 分片集群备份

分片集群备份比副本集复杂，需要考虑 **config server** 和 **各 shard** 的一致性。

### 分片集群备份策略

| 策略 | 方法 | 复杂度 |
| --- | --- | --- |
| 停服备份 | 停止 balancer，各 shard 同时快照 | 低 |
| mongodump | 从 mongos 备份（简单但慢） | 中 |
| 各 shard 独立快照 | 各 shard 同时快照 + config server | 高 |

### 方法 1：通过 mongos 备份（简单）

\`\`\`bash
# 停止 balancer
mongo --eval 'sh.stopBalancer()'

# 等待 balancer 停止
mongo --eval 'sh.getBalancerState()'

# 通过 mongos 备份（自动从各 shard 拉数据）
mongodump --uri="mongodb://mongos:27017" --oplog --out=/backup/

# 重新启动 balancer
mongo --eval 'sh.startBalancer()'
\`\`\`

### 方法 2：各 shard 独立快照（快）

\`\`\`bash
# 1. 停止 balancer
mongo --eval 'sh.stopBalancer()'

# 2. 锁定集群（禁止写入）
mongo --uri="mongodb://mongos:27017" --eval '
  db.adminCommand({ fsync: 1, lock: true })
'

# 3. 对每个 shard 的 secondary 做快照（并行）
for shard in shard1_secondary shard2_secondary shard3_secondary; do
  ssh $shard "lvcreate --snapshot --size 10G --name mongo_snap /dev/vg0/mongo_data" &
done
wait

# 4. 对 config server 做快照
ssh config_secondary "lvcreate --snapshot --size 5G --name mongo_snap /dev/vg0/mongo_data"

# 5. 解锁集群
mongo --uri="mongodb://mongos:27017" --eval '
  db.adminCommand({ fsyncUnlock: 1 })
'

# 6. 启动 balancer
mongo --eval 'sh.startBalancer()'
\`\`\`

### 分片集群恢复

\`\`\`bash
# 恢复分片集群：
# 1. 部署新的空集群（config server + shards + mongos）
# 2. 恢复 config server 数据
# 3. 恢复各 shard 数据
# 4. 启动 mongos，检查分片元数据

# 注意：恢复后要检查分片是否平衡
sh.status()
\`\`\`

> **踩坑提示**：
> - 分片集群备份前**必须停止 balancer**，否则备份期间数据迁移导致不一致
> - 各 shard 快照必须**同一时间点**，否则数据不一致
> - config server 也要备份，它存储分片元数据（哪些数据在哪个 shard）
> - 恢复后要检查分片状态，必要时手动触发 balance

## 28.10 备份验证与恢复演练

**没验证的备份等于没备份**。定期演练恢复，确保备份有效。

### 验证检查清单

\`\`\`bash
# 1. 检查备份文件完整性
ls -la /backup/full_20260701/
# 应有：各数据库目录、oplog.bson（如用了 --oplog）

# 2. 用 bsondump 检查 BSON 文件
bsondump /backup/full_20260701/shop/products.bson | wc -l
# 对比文档数是否合理

# 3. 恢复到测试环境，验证数据
mongorestore --drop --uri="mongodb://test-host:27017" /backup/full_20260701/

# 4. 在测试环境验证
mongo --uri="mongodb://test-host:27017/shop" --eval '
  print("products 文档数: " + db.products.countDocuments());
  print("orders 文档数: " + db.orders.countDocuments());
  print("索引: " + JSON.stringify(db.products.getIndexes()));
'

# 5. 验证业务查询
mongo --uri="mongodb://test-host:27017/shop" --eval '
  db.products.findOne({ _id: ObjectId("...") });
  db.orders.find({ status: "paid" }).limit(10).toArray();
'
\`\`\`

### 恢复演练流程

\`\`\`
1. 每月一次恢复演练
2. 在测试环境恢复备份
3. 验证数据完整性（文档数、抽样校验）
4. 验证索引和集合结构
5. 验证业务查询能正常执行
6. 记录恢复耗时，评估 RTO
7. 记录演练报告，改进备份策略
\`\`\`

### RTO 和 RPO

| 指标 | 含义 | 示例 |
| --- | --- | --- |
| RTO（Recovery Time Objective） | 恢复时间目标 | 1 小时内恢复 |
| RPO（Recovery Point Objective） | 恢复点目标 | 最多丢失 1 小时数据 |

\`\`\`
根据业务需求设计备份策略：
- RTO 1h, RPO 1h → 每小时增量 + 快速恢复方案
- RTO 4h, RPO 24h → 每日全量 + 4 小时内恢复
- RTO 15min, RPO 0 → 副本集 + 自动故障转移
\`\`\`

## 28.11 本章小结

- **mongodump/mongorestore**：逻辑备份，灵活但慢，适合小库，支持 --oplog 时间点一致
- **mongoexport/mongoimport**：JSON/CSV 格式，适合数据迁移
- **bsondump**：BSON → JSON 转换，用于检查备份内容
- **文件系统快照**：物理备份，瞬间完成，适合大库
- **oplog 增量备份**：全量 + 增量，实现连续备份
- **PITR**：恢复到任意时间点，误操作救命稻草
- **分片集群备份**：停止 balancer，各 shard 同时快照
- **备份验证**：定期演练恢复，确保备份有效

> **踩坑提示**：
> - 备份要**异地存放**，同机房备份在机房故障时全毁
> - 定期**演练恢复**，没验证的备份等于没备份
> - 备份要加密，防止数据泄露
> - 副本集**不是备份**，误操作会同步到所有节点
> - 生产环境建议组合方案：文件系统快照（全量）+ oplog（增量）+ delayed 节点（误操作恢复）
> - 分片集群备份前必须停止 balancer`
  },

  {
    id: "mongo-ch29",
    group: "第六部分 性能优化与运维实战",
    icon: "🛠️",
    title: "第 29 章 运维实战",
    content: `# 第 29 章 运维实战

前面的章节讲原理，本章讲实战。从 **Linux 部署**、**systemd 服务**、**安全加固**（认证/授权/TLS）、**基于角色的访问控制**、**内置角色与自定义角色**、**createUser 与 grantRoles**、**网络隔离**、**compact 压缩**、**索引重建** 到 **升级流程**，覆盖 MongoDB 日常运维的全流程。

## 29.1 Linux 部署最佳实践

### 硬件选型

| 组件 | 建议 |
| --- | --- |
| CPU | 多核优于高主频，MongoDB 多线程 |
| 内存 | 越大越好，工作集能全装进内存最佳 |
| 磁盘 | SSD 必须，NVMe 更佳，避免 HDD |
| 网络 | 千兆起步，跨机房用万兆 |
| RAID | RAID10（性能+冗余），避免 RAID5 |

### 部署架构

\`\`\`
生产环境最小集群：
- 3 节点副本集（1 Primary + 2 Secondary）
- 跨机房部署（防机房故障）
- 独立监控服务器
- 独立备份存储

大流量场景：
- 5 节点副本集（1 Primary + 3 Secondary + 1 Arbiter）
- 或分片集群（mongos + 3 config + N shard）
\`\`\`

### 操作系统配置

\`\`\`bash
# 1. 关闭透明大页（THP）
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag

# 永久关闭（写入 rc.local）
cat >> /etc/rc.local << 'EOF'
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag
EOF
chmod +x /etc/rc.local

# 2. 调整文件描述符限制
echo "* soft nofile 65535" >> /etc/security/limits.conf
echo "* hard nofile 65535" >> /etc/security/limits.conf
echo "mongod soft nofile 65535" >> /etc/security/limits.conf
echo "mongod hard nofile 65535" >> /etc/security/limits.conf

# 3. 调整内核参数
echo "vm.swappiness = 1" >> /etc/sysctl.conf
echo "vm.dirty_ratio = 15" >> /etc/sysctl.conf
echo "vm.dirty_background_ratio = 5" >> /etc/sysctl.conf
echo "vm.max_map_count = 262144" >> /etc/sysctl.conf
sysctl -p

# 4. 磁盘调度器（SSD 推荐 noop / none）
echo noop > /sys/block/sda/queue/scheduler

# 5. 文件系统（推荐 XFS）
mkfs.xfs /dev/sdb1
mount -o noatime /dev/sdb1 /data

# 6. 关闭 SELinux（避免权限问题）
setenforce 0
sed -i 's/SELINUX=enforcing/SELINUX=disabled/' /etc/selinux/config
\`\`\`

### 安装 MongoDB

\`\`\`bash
# CentOS / RHEL
cat > /etc/yum.repos.d/mongodb-org.repo << 'EOF'
[mongodb-org]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/8/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF

yum install -y mongodb-org

# Ubuntu / Debian
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org

# 创建数据目录
mkdir -p /data/mongodb
chown -R mongod:mongod /data/mongodb
\`\`\`

## 29.2 systemd 服务管理

### systemd 服务文件

\`\`\`bash
# /usr/lib/systemd/system/mongod.service
[Unit]
Description=MongoDB Database Server
Documentation=https://docs.mongodb.org/manual
After=network-online.target
Wants=network-online.target

[Service]
User=mongod
Group=mongod
Environment="OPTIONS=-f /etc/mongod.conf"
ExecStart=/usr/bin/mongod $OPTIONS
ExecStartPre=/usr/bin/mkdir -p /data/mongodb
ExecStartPre=/usr/bin/chown mongod:mongod /data/mongodb
PermissionsStartOnly=true
PIDFile=/var/run/mongodb/mongod.pid
Type=forking

# 文件描述符
LimitNOFILE=64000

# 进程数限制
LimitNPROC=64000

# 内存锁定（避免 swap）
LimitMEMLOCK=infinity

# 重启策略
Restart=on-failure
RestartSec=10

# 安全加固
PrivateTmp=true
PrivateDevices=true
ProtectSystem=full
ReadWritePaths=/data/mongodb /var/log/mongodb /var/run/mongodb

[Install]
WantedBy=multi-user.target
\`\`\`

### 服务管理命令

\`\`\`bash
# 启动 / 停止 / 重启
systemctl start mongod
systemctl stop mongod
systemctl restart mongod

# 开机自启
systemctl enable mongod
systemctl disable mongod

# 查看状态
systemctl status mongod

# 查看日志
journalctl -u mongod -f
journalctl -u mongod --since "1 hour ago"

# 重新加载配置（修改 systemd 文件后）
systemctl daemon-reload
\`\`\`

### 配置文件

\`\`\`yaml
# /etc/mongod.conf
storage:
  dbPath: /data/mongodb
  journal:
    enabled: true
    commitIntervalMs: 100
  wiredTiger:
    engineConfig:
      cacheSizeGB: 8
      journalCompressor: snappy
    collectionConfig:
      blockCompressor: snappy
    indexConfig:
      prefixCompression: true

systemLog:
  destination: file
  path: /var/log/mongodb/mongod.log
  logAppend: true
  logRotate: reopen

net:
  port: 27017
  bindIp: 10.0.0.1,127.0.0.1
  maxIncomingConnections: 10000
  compression:
    compressors: snappy,zstd,zlib

replication:
  replSetName: rs0
  oplogSizeMB: 10240

security:
  authorization: enabled
  clusterAuthMode: x509

operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 100

setParameter:
  enableLocalhostAuthBypass: false
  diagnosticDataCollectionEnabled: true
\`\`\`

### 关键调优点

| 参数 | 说明 | 调优建议 |
| --- | --- | --- |
| cacheSizeGB | WT 缓存大小 | 物理内存 50-60% |
| oplogSizeMB | oplog 大小 | 写入密集调到 10GB+ |
| commitIntervalMs | journal 刷盘间隔 | 100（默认），调大提升性能但风险高 |
| maxIncomingConnections | 最大连接数 | 根据应用调整，默认 65535 |
| slowOpThresholdMs | 慢查询阈值 | 100ms |

## 29.3 安全加固

### 启用认证

\`\`\`yaml
# mongod.conf
security:
  authorization: enabled
\`\`\`

\`\`\`bash
# 重启生效
systemctl restart mongod
\`\`\`

### 创建管理员用户

\`\`\`javascript
// 第一次启用认证前，先创建管理员（localhost exception 允许）
use admin;
db.createUser({
  user: "admin",
  pwd: passwordPrompt(),  // 或 "StrongP@ssw0rd!"
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" },
    { role: "dbAdminAnyDatabase", db: "admin" },
    { role: "clusterAdmin", db: "admin" }
  ]
});

// 退出后用认证方式重新连接
// mongo -u admin -p --authenticationDatabase admin
\`\`\`

### TLS/SSL 加密传输

\`\`\`bash
# 1. 生成证书（生产环境用正式 CA 签发）
openssl req -newkey rsa:2048 -nodes -keyout mongodb.key -x509 -days 365 -out mongodb.crt
cat mongodb.key mongodb.crt > mongodb.pem
cp mongodb.pem /etc/mongo/
cp ca.pem /etc/mongo/
chown mongod:mongod /etc/mongo/*.pem
chmod 600 /etc/mongo/*.pem
\`\`\`

\`\`\`yaml
# mongod.conf
net:
  tls:
    mode: requireTLS
    certificateKeyFile: /etc/mongo/mongodb.pem
    CAFile: /etc/mongo/ca.pem
    allowConnectionsWithoutCertificates: false
    clusterFile: /etc/mongo/cluster.pem  # 节点间通信证书
\`\`\`

\`\`\`bash
# 客户端用 TLS 连接
mongo --tls --tlsCAFile=ca.pem --tlsCertificateKeyFile=client.pem \
  --uri="mongodb://host:27017" -u admin -p
\`\`\`

### 节点间认证

副本集节点间通信也要认证，有两种方式：

\`\`\`yaml
# 方式 1：keyfile（简单，适合内网）
security:
  authorization: enabled
  keyFile: /etc/mongo/keyfile

# 生成 keyfile
openssl rand -base64 756 > /etc/mongo/keyfile
chmod 400 /etc/mongo/keyfile
chown mongod:mongod /etc/mongo/keyfile
# 所有节点用同一个 keyfile
\`\`\`

\`\`\`yaml
# 方式 2：x509 证书（更安全，适合跨网）
security:
  authorization: enabled
  clusterAuthMode: x509
net:
  tls:
    clusterFile: /etc/mongo/cluster.pem
\`\`\`

> **踩坑提示**：
> - 生产环境**必须**启用 TLS，防止传输层数据泄露
> - 业务用户**不要用 root**，最小权限原则
> - 密码要强（大小写+数字+符号），定期轮换
> - 节点间通信也要认证（x509 证书或 keyfile）
> - 启用认证后，所有客户端都要用账号连接

## 29.4 基于角色的访问控制（RBAC）

MongoDB 采用 **RBAC（Role-Based Access Control）** 模型：用户 → 角色 → 权限。

### RBAC 模型

\`\`\`
用户（User）→ 被授予 → 角色（Role）→ 拥有 → 权限（Privilege）→ 操作 → 资源（Resource）
\`\`\`

### 内置角色

#### 数据库角色

| 角色 | 权限 |
| --- | --- |
| read | 只读 |
| readWrite | 读写 |
| dbAdmin | 数据库管理（索引、统计、compact） |
| dbOwner | 数据库所有者（readWrite + dbAdmin + userAdmin） |
| userAdmin | 用户管理 |
| enableSharding | 允许分片 |

#### 集群角色

| 角色 | 权限 |
| --- | --- |
| clusterAdmin | 集群管理（最高） |
| clusterManager | 集群管理和监控 |
| clusterMonitor | 只读监控 |
| hostManager | 服务器管理 |

#### 全局角色

| 角色 | 权限 |
| --- | --- |
| readAnyDatabase | 所有库只读 |
| readWriteAnyDatabase | 所有库读写 |
| userAdminAnyDatabase | 所有库用户管理 |
| dbAdminAnyDatabase | 所有库管理 |
| root | 超级权限（所有权限） |
| \_\_system | 内部系统权限（不要给人用） |

### createUser 创建用户

\`\`\`javascript
// 创建业务用户
use shop;
db.createUser({
  user: "appUser",
  pwd: passwordPrompt(),
  roles: [
    { role: "readWrite", db: "shop" },
    { role: "read", db: "reporting" }
  ]
});

// 创建只读报表用户
use shop;
db.createUser({
  user: "reportUser",
  pwd: passwordPrompt(),
  roles: [{ role: "read", db: "shop" }]
});

// 创建备份用户
use admin;
db.createUser({
  user: "backupUser",
  pwd: passwordPrompt(),
  roles: [
    { role: "backup", db: "admin" },
    { role: "clusterMonitor", db: "admin" }
  ]
});

// 创建监控用户
use admin;
db.createUser({
  user: "monitorUser",
  pwd: passwordPrompt(),
  roles: [
    { role: "clusterMonitor", db: "admin" },
    { role: "read", db: "local" }
  ]
});
\`\`\`

### grantRoles / revokeRoles 授权管理

\`\`\`javascript
// 给用户添加角色
db.grantRolesToUser("appUser", [
  { role: "dbAdmin", db: "shop" }
]);

// 移除用户角色
db.revokeRolesFromUser("appUser", [
  { role: "read", db: "reporting" }
]);

// 修改用户密码
db.changeUserPassword("appUser", passwordPrompt());

// 查看用户信息
db.getUser("appUser");

// 查看所有用户
db.getUsers();

// 删除用户
db.dropUser("appUser");
\`\`\`

### 自定义角色

当内置角色不满足需求时，可以创建自定义角色。

\`\`\`javascript
// 创建自定义角色：只能查询 orders 集合
use shop;
db.createRole({
  role: "ordersReader",
  privileges: [
    {
      resource: { db: "shop", collection: "orders" },
      actions: ["find", "listCollections"]
    }
  ],
  roles: []  // 不继承其他角色
});

// 创建自定义角色：只能更新特定字段
db.createRole({
  role: "stockUpdater",
  privileges: [
    {
      resource: { db: "shop", collection: "products" },
      actions: ["find", "update"]
    }
  ],
  roles: []
});

// 把自定义角色授予用户
db.grantRolesToUser("warehouseUser", [{ role: "stockUpdater", db: "shop" }]);

// 查看自定义角色
db.getRoles({ rolesInfo: 1, showPrivileges: true });

// 更新角色权限
db.updateRole("stockUpdater", {
  privileges: [
    {
      resource: { db: "shop", collection: "products" },
      actions: ["find", "update", "insert"]
    }
  ],
  roles: []
});

// 删除角色
db.dropRole("stockUpdater");
\`\`\`

### 权限操作（actions）类型

| 分类 | actions |
| --- | --- |
| 查询 | find, getShardVersion |
| 写入 | insert, update, remove |
| 索引 | createIndex, dropIndex, listIndexes |
| 集合 | createCollection, dropCollection, listCollections |
| 数据库 | dbStats, listDatabases |
| 用户管理 | createUser, updateUser, grantRolesToUser |
| 复制 | replSetConfigure, replSetReconfig |
| 分片 | addShard, enableSharding, shardingState |

> **踩坑提示**：
> - 业务用户用 readWrite 即可，不要用 dbOwner 或 root
> - 自定义角色要遵循最小权限原则，只授予必要的 actions
> - 定期审计用户权限，清理无用账号
> - root 角色只给 DBA，开发不要用

## 29.5 网络隔离

### 绑定内网 IP

\`\`\`yaml
# mongod.conf
net:
  bindIp: 10.0.0.1,127.0.0.1  # 只绑定内网 IP，不要 0.0.0.0
\`\`\`

### 防火墙配置

\`\`\`bash
# iptables 限制访问
iptables -A INPUT -p tcp --dport 27017 -s 10.0.0.0/24 -j ACCEPT  # 允许内网
iptables -A INPUT -p tcp --dport 27017 -j DROP                     # 拒绝其他

# firewalld 限制访问
firewall-cmd --permanent --add-rich-rule='rule family=ipv4 source address=10.0.0.0/24 port port=27017 protocol=tcp accept'
firewall-cmd --permanent --add-rich-rule='rule family=ipv4 port port=27017 protocol=tcp drop'
firewall-cmd --reload

# 只允许应用服务器访问
# 安全组规则：27017 端口只对 app subnet 开放
\`\`\`

### VPC 隔离

\`\`\`
生产环境网络拓扑：
- 应用子网：10.0.1.0/24（应用服务器）
- 数据库子网：10.0.2.0/24（MongoDB 节点）
- 监控子网：10.0.3.0/24（监控服务器）

安全组规则：
- 数据库子网入站：只允许应用子网 27017
- 数据库子网出站：允许所有
- 数据库子网互联网：禁止访问
\`\`\`

> **踩坑提示**：
> - 生产环境**绝不要** bindIp: 0.0.0.0 暴露到公网
> - MongoDB 默认不启用认证，暴露公网等于裸奔
> - 定期扫描开放端口，确保没有意外暴露

## 29.6 compact 压缩

**compact** 命令回收磁盘空间，整理数据文件碎片。

### 为什么需要 compact

\`\`\`
MongoDB 删除数据后，磁盘空间不会自动释放（WiredTiger 会复用）。
但如果大量删除后空间长期不用，可以 compact 回收。

场景：
- 删除了大量历史数据
- 删除了大集合
- 磁盘空间紧张
\`\`\`

### 使用 compact

\`\`\`javascript
// 压缩单个集合（会锁集合）
db.runCommand({ compact: "products" });

// WiredTiger 压缩时不阻塞读写（从 4.4 开始）
// 但仍建议低峰期执行

// 压缩所有集合
db.getCollectionNames().forEach(coll => {
  print("Compacting " + coll + "...");
  db.runCommand({ compact: coll });
});

// 压缩后查看空间变化
db.products.stats();
\`\`\`

### compact 注意事项

\`\`\`bash
# compact 期间注意事项：
# 1. 会产生额外磁盘空间（最多 2 倍集合大小）
# 2. 旧版本会锁集合，4.4+ 支持 online compact
# 3. 副本集从 secondary 开始 compact

# 副本集 compact 流程
# 1. 先在 secondary 上 compact
ssh secondary1
mongo --eval 'db.runCommand({ compact: "products" })'

# 2. 等同步完成
# 3. stepDown 让 primary 变 secondary
mongo --eval 'rs.stepDown(60)'

# 4. 在新 secondary（原 primary）上 compact
\`\`\`

> **踩坑提示**：
> - compact 需要额外磁盘空间（最多 2 倍集合大小），确保磁盘有空间
> - 旧版本 compact 会锁集合，生产环境低峰期执行
> - compact 不能跨节点，要逐个节点执行
> - compact 后要验证数据完整性

## 29.7 索引重建

### 重建索引场景

- 索引损坏（极罕见）
- 索引碎片化严重
- 升级后索引格式变化

### 重建单个索引

\`\`\`javascript
// 重建单个索引
db.products.reIndex();
// 等价于：drop 所有索引再重建

// 只重建指定索引
db.products.dropIndex("category_1");
db.products.createIndex({ category: 1 });

// 后台建索引（不阻塞读写，4.2+ 默认非阻塞）
db.products.createIndex({ category: 1 }, { background: true });
\`\`\`

### 重建所有索引

\`\`\`javascript
// reIndex 重建集合的所有索引
db.products.reIndex();

// 输出
// {
//   "nIndexesWas": 3,
//   "nIndexes": 3,
//   "ok": 1
// }
\`\`\`

### 副本集索引重建

\`\`\`bash
# 副本集索引重建流程：
# 1. 在 secondary 上重建
ssh secondary1
mongo --eval 'db.products.reIndex()'

# 2. stepDown 让 primary 变 secondary
mongo --eval 'rs.stepDown(60)'

# 3. 在新 secondary（原 primary）上重建
ssh secondary1  # 现在的 primary
mongo --eval 'db.products.reIndex()'
\`\`\`

> **踩坑提示**：
> - reIndex 会锁集合，生产环境低峰期执行
> - 副本集要逐个节点重建，避免同时锁
> - 4.2+ 版本 createIndex 默认非阻塞，但 reIndex 仍会锁

## 29.8 升级流程

### 滚动升级（不停服）

副本集滚动升级步骤：

\`\`\`bash
# 1. 升级 Secondary（逐个）
# 停止 secondary1
systemctl stop mongod

# 升级二进制
yum upgrade mongodb-org

# 启动
systemctl start mongod

# 等待同步完成
mongo --eval 'rs.status()'

# 重复升级 secondary2、secondary3...

# 2. 让 primary 让位
mongo --eval 'rs.stepDown(60)'

# 3. 升级原 primary（现在是 secondary）
systemctl stop mongod
yum upgrade mongodb-org
systemctl start mongod
\`\`\`

### 大版本升级注意事项

- **不能跨大版本升级**：4.0 → 4.2 → 4.4，不能 4.0 → 5.0
- **先升级 featureCompatibilityVersion**：\`db.adminCommand({ setFeatureCompatibilityVersion: "4.4" })\`
- **备份后再升级**
- **测试环境先验证**

\`\`\`javascript
// 查看当前兼容版本
db.adminCommand({ getParameter: 1, featureCompatibilityVersion: 1 });

// 升级版本后设置兼容版本
db.adminCommand({ setFeatureCompatibilityVersion: "6.0" });
\`\`\`

### 升级前检查清单

\`\`\`bash
# 1. 备份
mongodump --uri="mongodb://localhost:27017" --out=/backup/pre_upgrade

# 2. 检查兼容版本
mongo --eval 'db.adminCommand({ getParameter: 1, featureCompatibilityVersion: 1 })'

# 3. 检查驱动兼容性
# 确认应用驱动支持新版本

# 4. 检查配置文件变化
# 新版本可能有配置项变更

# 5. 测试环境验证
# 在测试环境先升级，跑全量测试
\`\`\`

### 降级（回滚）

\`\`\`bash
# 升级失败需要回滚：
# 1. 停止新版本 mongod
systemctl stop mongod

# 2. 卸载新版本
yum remove mongodb-org*

# 3. 安装旧版本
yum install mongodb-org-5.0.10

# 4. 恢复数据（如果设置过 featureCompatibilityVersion）
# 注意：设置过 fCV 后可能无法回滚

# 5. 启动
systemctl start mongod
\`\`\`

> **踩坑提示**：
> - 升级前一定要备份，升级失败可以回滚
> - featureCompatibilityVersion 决定能用哪些新特性，不设置等于没升级
> - 升级期间会有一次故障转移（stepDown），应用要支持重试
> - 设置 featureCompatibilityVersion 后**无法回滚**到旧版本，要谨慎

## 29.9 常见故障排查

### 故障一：连接数过高

\`\`\`javascript
// 查看当前连接
db.serverStatus().connections;
// { current: 5000, available: 95000 }

// 查看连接来源
db.currentOp(true).inprog.forEach(op => print(op.client));

// 解决：
// 1. 检查应用连接池配置
// 2. 排查连接泄漏
// 3. 限制 maxIncomingConnections
\`\`\`

### 故障二：慢查询突增

\`\`\`javascript
// 1. 开启 Profiler
db.setProfilingLevel(1, { slowms: 100 });

// 2. 查看慢查询
db.system.profile.find().sort({ millis: -1 }).limit(10);

// 3. 分析执行计划
db.products.find({ ... }).explain("executionStats");

// 解决：加索引、优化查询、限制返回字段
\`\`\`

### 故障三：副本集同步延迟

\`\`\`javascript
// 查看同步延迟
rs.printSecondaryReplicationInfo();

// 输出示例
// source: host2:27017
//  syncedTo: Mon Jul 01 2026 10:00:00 GMT+0800 (CST)
//  0 secs (0 hrs) behind the primary
// source: host3:27017
//  3600 secs (1 hrs) behind the primary  ← 严重延迟
\`\`\`

**延迟原因**：Secondary 硬件差、网络带宽不足、写入 QPS 过高、Secondary 跑重查询

**解决**：升级 secondary 硬件、把报表查询移到 hidden 节点、调大 oplog 大小

## 29.10 本章小结

- **Linux 部署**：SSD + 大内存 + RAID10 + XFS + 关闭 THP
- **systemd 服务**：用 systemd 管理服务，配置资源限制和安全加固
- **安全加固**：认证 + 授权 + TLS 加密 + 节点间认证
- **RBAC**：用户 → 角色 → 权限，内置角色 + 自定义角色
- **用户管理**：createUser、grantRoles、revokeRoles、changeUserPassword
- **网络隔离**：绑定内网 IP + 防火墙 + VPC 隔离
- **compact 压缩**：回收磁盘空间，低峰期执行
- **索引重建**：reIndex 重建索引，副本集逐节点执行
- **升级流程**：滚动升级，不能跨大版本，先备份

> **踩坑提示**：
> - 生产环境**必须**开启认证，默认无认证是巨大安全风险
> - 升级前一定要在测试环境验证，并备份生产数据
> - compact 命令会锁集合（旧版本），生产环境低峰期执行
> - 监控磁盘使用率，提前预警，避免磁盘满导致服务中断
> - 建立故障应急预案，定期演练`
  },

  {
    id: "mongo-ch30",
    group: "第六部分 性能优化与运维实战",
    icon: "🏭",
    title: "第 30 章 MongoDB 在生产环境",
    content: `# 第 30 章 MongoDB 在生产环境

本章是全书的收官，讨论 MongoDB 在生产环境的实际应用：**容量规划**、**硬件建议**、**存储引擎配置**、**生产副本集**、**分片策略**、**灾难恢复**、**备份验证**、**监控告警**、**常见生产事故**、**上线 checklist** 与 **与其他数据库对比**。

## 30.1 容量规划

### 数据量估算

\`\`\`javascript
// 估算数据库大小
// 1. 单文档大小
db.products.findOne();
// BSON 大小
bsonsize(db.products.findOne());

// 2. 集合大小
db.products.stats();
// {
//   "size": 1073741824,      // 数据大小（1GB）
//   "storageSize": 536870912, // 磁盘占用（压缩后，512MB）
//   "totalIndexSize": 134217728, // 索引大小（128MB）
//   "count": 1000000          // 文档数
// }

// 3. 估算未来增长
// 日均写入量 × 平均文档大小 × 压缩比 × 保留天数
// 例：日写 100 万 × 1KB × 0.5（压缩）× 365 天 = 178GB
\`\`\`

### 容量规划公式

\`\`\`
总存储 = 数据大小 + 索引大小 + oplog + 预留空间
       = 数据大小 × (1 + 索引比例 30%) + oplog(10GB) + 数据大小 × 50%（预留）

内存需求 = 工作集 + WiredTiger Cache + OS 缓存
        = 热数据(20% 总数据) + 热索引 + 2GB（系统）

CPU 需求 = 并发查询数 × 单查询 CPU 开销
\`\`\`

### 容量规划示例

\`\`\`
场景：电商订单系统
- 日均订单：100 万
- 平均文档大小：2KB
- 保留：3 年
- 索引：5 个，索引比例 30%

数据量：
- 3 年总文档：100 万 × 365 × 3 = 10.95 亿
- 数据大小：10.95 亿 × 2KB = 2.19 TB
- 压缩后（Snappy 50%）：1.1 TB
- 索引：1.1 TB × 30% = 330 GB
- 总存储：1.1 + 0.33 + 10（oplog）+ 0.55（预留）≈ 2 TB

内存需求：
- 工作集（热数据 20%）：220 GB 数据 + 66 GB 索引
- 但实际热数据更少（近期订单），约 50 GB
- 建议内存：64 GB
\`\`\`

### 增长规划

| 时间 | 数据量 | 存储占用 | 建议内存 |
| --- | --- | --- | --- |
| 当前 | 100 GB | 50 GB | 16 GB |
| 6 个月 | 300 GB | 150 GB | 32 GB |
| 1 年 | 600 GB | 300 GB | 64 GB |
| 2 年 | 1.2 TB | 600 GB | 128 GB |

> **踩坑提示**：
> - 容量规划要预留 30-50% 余量，避免频繁扩容
> - 索引也要算进存储和内存需求
> - 关注数据增长趋势，提前采购硬件
> - 分片集群要考虑 chunk 迁移的额外开销

## 30.2 硬件建议

### 生产环境硬件配置

| 组件 | 最低配置 | 推荐配置 | 高配 |
| --- | --- | --- | --- |
| CPU | 4 核 | 8-16 核 | 32+ 核 |
| 内存 | 16 GB | 64 GB | 128-256 GB |
| 磁盘 | SSD 500 GB | NVMe SSD 1 TB | NVMe SSD 2+ TB |
| 网络 | 千兆 | 万兆 | 万兆双bond |
| RAID | RAID10 | RAID10 | RAID10 + 热备 |

### 磁盘选型对比

| 磁盘类型 | IOPS | 延迟 | 适用场景 |
| --- | --- | --- | --- |
| HDD 7200 | ~100 | 5-10ms | 不推荐 |
| SATA SSD | ~10000 | 0.5-1ms | 小规模 |
| NVMe SSD | ~100000+ | 0.1ms | 生产推荐 |
| 云盘 SSD | ~10000-50000 | 0.5-2ms | 云环境 |

### 内存选型原则

\`\`\`
内存配置原则：
1. 工作集能全装进内存最佳
2. WiredTiger Cache = 物理内存的 50-60%
3. 剩余内存留给 OS 文件缓存
4. 多实例共享机器：各实例 Cache 之和 ≤ 内存 70%

示例：
- 64 GB 服务器，单实例：cacheSizeGB = 32
- 64 GB 服务器，双实例：每实例 cacheSizeGB = 16
\`\`\`

### 网络要求

\`\`\`
副本集内部网络：
- 节点间心跳：每 2 秒一次，延迟 < 10ms
- 数据同步：带宽要足够，避免同步延迟

应用层网络：
- 应用到数据库：局域网，延迟 < 1ms
- 跨机房：专线或 VPN，延迟 < 5ms
\`\`\`

> **踩坑提示**：
> - 磁盘 IO 是数据库性能关键，HDD 在生产环境不可接受
> - 内存比 CPU 更重要，先满足内存再考虑 CPU
> - 网络延迟影响副本集心跳和选举，跨机房延迟 > 50ms 要谨慎

## 30.3 存储引擎配置

### WiredTiger 生产配置

\`\`\`yaml
# 生产环境推荐配置
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 32              # 物理内存的 50%
      journalCompressor: snappy     # 默认，平衡速度和压缩
      checkpointMs: 60000           # 检查点间隔，默认 60 秒
    collectionConfig:
      blockCompressor: snappy       # 集合压缩
    indexConfig:
      prefixCompression: true       # 索引前缀压缩

  journal:
    enabled: true
    commitIntervalMs: 100           # journal 刷盘间隔，默认 100ms
\`\`\`

### 压缩算法选择

| 压缩算法 | 压缩率 | 速度 | CPU 开销 | 适用场景 |
| --- | --- | --- | --- | --- |
| none | 0% | 最快 | 0 | CPU 瓶颈，磁盘充足 |
| snappy | 50-70% | 快 | 低 | 默认推荐 |
| zlib | 60-80% | 中 | 中 | 磁盘紧张 |
| zstd | 60-80% | 快 | 中低 | 新选择，综合最优 |

\`\`\`javascript
// 为特定集合指定压缩算法
db.createCollection("logs", {
  storageEngine: {
    wiredTiger: { configString: "block_compressor=zstd" }
  }
});

// 为索引指定压缩
db.products.createIndex(
  { name: 1 },
  { storageEngine: { wiredTiger: { configString: "block_compressor=zstd" } } }
);
\`\`\`

### 检查点与 journal 调优

\`\`\`
检查点（checkpoint）：
- 默认 60 秒一次，把脏页刷盘
- 调大（如 120s）：减少 IO，但崩溃恢复慢
- 调小（如 30s）：崩溃恢复快，但 IO 增加

Journal（预写日志）：
- 默认 100ms 刷盘
- 调大（如 500ms）：性能提升，但崩溃丢数据多
- 调小（如 50ms）：数据更安全，性能下降
\`\`\`

> **踩坑提示**：
> - commitIntervalMs 调大会增加崩溃时数据丢失风险，权衡性能和安全
> - 压缩算法选择要看实际数据，zstd 综合最优但需要 4.2+ 版本
> - 多实例机器要限制每个实例的 cacheSizeGB，避免内存竞争

## 30.4 生产副本集

### 副本集架构

\`\`\`
生产副本集推荐架构：
- 3 节点（1 Primary + 2 Secondary）：最小可用
- 5 节点（1 Primary + 3 Secondary + 1 Arbiter）：更高可用
- 跨机房部署：防机房故障

跨机房部署示例（3 节点）：
- 机房 A：Primary + Secondary
- 机房 B：Secondary
- 故障切换：机房 A 挂了，机房 B 成为新 Primary
\`\`\`

### 副本集配置最佳实践

\`\`\`javascript
// 副本集配置
rs.initiate({
  _id: "rs0",
  version: 1,
  members: [
    {
      _id: 0,
      host: "mongo1.prod:27017",
      priority: 2,          // 优先成为 primary
      votes: 1
    },
    {
      _id: 1,
      host: "mongo2.prod:27017",
      priority: 1,
      votes: 1
    },
    {
      _id: 2,
      host: "mongo3.prod:27017",
      priority: 1,
      votes: 1,
      hidden: false,
      secondaryDelaySecs: 0
    }
  ],
  settings: {
    electionTimeoutMillis: 10000,   // 选举超时
    heartbeatIntervalMillis: 2000,  // 心跳间隔
    heartbeatTimeoutMillis: 10000   // 心跳超时
  }
});
\`\`\`

### delayed 节点（误操作恢复）

\`\`\`javascript
// 添加 delayed 节点（延迟 2 小时）
rs.add({
  host: "mongo-delayed.prod:27017",
  priority: 0,              // 不参与选举
  votes: 0,                 // 不投票
  hidden: true,             // 对客户端不可见
  secondaryDelaySecs: 7200  // 延迟 2 小时
});

// delayed 节点用途：
// 1. 误操作恢复（如误删集合，delayed 节点还没执行）
// 2. 数据审计（查看历史数据状态）
\`\`\`

### hidden 节点（报表/备份）

\`\`\`javascript
// 添加 hidden 节点用于报表查询
rs.add({
  host: "mongo-report.prod:27017",
  priority: 0,
  votes: 0,
  hidden: true   // 对客户端不可见，不接收读请求
});

// 客户端显式连接 hidden 节点做报表查询
// 不影响 primary 和 secondary 的性能
\`\`\`

### 读偏好（Read Preference）

\`\`\`javascript
// 读偏好模式
// primary：只读 primary（默认）
// primaryPreferred：优先 primary，不可用读 secondary
// secondary：只读 secondary
// secondaryPreferred：优先 secondary，不可用读 primary
// nearest：读延迟最低的节点

// 连接字符串设置
const uri = "mongodb://host1,host2,host3/shop?replicaSet=rs0&readPreference=secondaryPreferred";

// 驱动设置
const client = await MongoClient.connect(uri, {
  readPreference: "secondaryPreferred",
  readConcernLevel: "local"
});
\`\`\`

> **踩坑提示**：
> - 副本集节点数应为奇数（3 或 5），避免选举脑裂
> - delayed 节点延迟时间要大于误操作发现时间
> - 读 secondary 可能读到旧数据（最终一致性），关键读用 primary
> - 跨机房部署要考虑网络延迟对心跳的影响

## 30.5 分片策略

### 何时需要分片

\`\`\`
分片触发条件：
1. 数据量 > 单机存储容量（如 > 2TB）
2. 写入 QPS > 单机处理能力（如 > 10万/秒）
3. 工作集 > 单机内存

不要过早分片：
- 分片增加运维复杂度
- 数据量 < 1TB 优先优化单机
- 用副本集扩展读，分片扩展写
\`\`\`

### 分片键选择

| 分片键类型 | 特点 | 适用场景 |
| --- | --- | --- |
| 范围分片 | 数据有序，范围查询友好 | 范围查询多 |
| 哈希分片 | 数据均匀分布 | 写入热点 |
| 复合分片 | 多字段 | 复杂场景 |

\`\`\`javascript
// 范围分片（按时间）
sh.shardCollection("shop.orders", { createdAt: 1 });

// 哈希分片（按 userId，写入分散）
sh.shardCollection("shop.orders", { userId: "hashed" });

// 复合分片（userId 范围 + createdAt 范围）
sh.shardCollection("shop.orders", { userId: 1, createdAt: 1 });
\`\`\`

### 分片键选择原则

1. **高基数**：不同值多，数据分布均匀
2. **低频率**：单值不会被大量查询（避免热点）
3. **非单调递增**：避免所有写入集中到一个 shard
4. **查询常用**：分片键在查询条件中，避免广播查询

\`\`\`javascript
// 差：用 ObjectId 分片（单调递增，写入热点）
sh.shardCollection("shop.orders", { _id: 1 });

// 差：用 status 分片（低基数，分布不均）
sh.shardCollection("shop.orders", { status: 1 });

// 好：用 userId 哈希分片（高基数，均匀分布）
sh.shardCollection("shop.orders", { userId: "hashed" });
\`\`\`

### 分片集群架构

\`\`\`
分片集群组件：
- mongos（路由）：2+ 个，无状态，可水平扩展
- config server（配置服务器）：3 个副本集，存元数据
- shard（分片）：每个是一个副本集

生产环境最小分片集群：
- 2 mongos
- 3 config server（副本集）
- 3 shard（每个 3 节点副本集）
- 共 3 + 9 = 12 台服务器（最少）
\`\`\`

> **踩坑提示**：
> - 分片键一旦设置**无法更改**（5.0 之前），要谨慎选择
> - 分片键必须建索引（范围分片要 1 索引，哈希分片要 hashed 索引）
> - 跨分片查询（scatter-gather）性能差，尽量用分片键过滤
> - 分片不是万能的，先优化再分片

## 30.6 灾难恢复

### 灾难恢复策略

| 灾难场景 | 恢复策略 | RTO | RPO |
| --- | --- | --- | --- |
| 单节点故障 | 副本集自动故障转移 | < 30s | 0 |
| 机房故障 | 跨机房副本集 | < 1min | 0-10s |
| 误操作 | PITR / delayed 节点 | < 1h | 0-1h |
| 数据损坏 | 备份恢复 | < 4h | < 24h |
| 全部故障 | 异地备份恢复 | < 24h | < 24h |

### 灾难恢复流程

\`\`\`
1. 评估灾难范围
   - 哪些节点受影响
   - 数据是否丢失
   - 业务影响程度

2. 启动应急预案
   - 通知相关人员
   - 切换到备用方案（如只读模式）
   - 保留现场日志

3. 恢复操作
   - 从备份恢复数据
   - 回放 oplog（PITR）
   - 重建副本集

4. 验证与切换
   - 验证数据完整性
   - 逐步切换流量
   - 监控系统状态

5. 事后总结
   - 分析故障原因
   - 改进备份和监控策略
   - 更新应急预案
\`\`\`

### 跨机房灾备

\`\`\`
跨机房灾备架构：
- 主机房：Primary + Secondary（2 节点）
- 备机房：Secondary（1 节点）
- 异地：异步同步（如 MongoDB Atlas Global Cluster）

故障切换：
- 主机房故障 → 备机房 Secondary 升级 Primary
- 网络分区 → 少数派节点不可写，等待恢复
\`\`\`

> **踩坑提示**：
> - 灾难恢复要定期演练，没演练过的方案等于没有
> - 异地备份要加密，防止数据泄露
> - 保留故障现场日志，便于事后分析
> - RTO 和 RPO 要根据业务需求制定，不是越短越好

## 30.7 备份验证

**没验证的备份等于没备份**。定期验证备份，确保可恢复。

### 备份验证流程

\`\`\`bash
# 1. 恢复备份到测试环境
mongorestore --uri="mongodb://test:27017" /backup/full_20260701/

# 2. 验证数据完整性
mongo --uri="mongodb://test:27017" --eval '
  use shop;
  print("products: " + db.products.countDocuments());
  print("orders: " + db.orders.countDocuments());
  print("users: " + db.users.countDocuments());
'

# 3. 对比文档数
# 从生产环境导出文档数
mongo --uri="mongodb://prod:27017" --eval '
  use shop;
  print("products: " + db.products.countDocuments());
' > prod_counts.txt

# 从测试环境导出文档数
mongo --uri="mongodb://test:27017" --eval '
  use shop;
  print("products: " + db.products.countDocuments());
' > test_counts.txt

# 4. 对比
diff prod_counts.txt test_counts.txt

# 5. 抽样校验数据
mongo --uri="mongodb://test:27017" --eval '
  db.products.findOne({ _id: ObjectId("...") });
  db.orders.find({ status: "paid" }).limit(10).toArray();
'
\`\`\`

### 验证频率

\`\`\`
备份验证频率：
- 全量备份：每月验证一次
- 增量备份：每季度验证一次
- PITR：每半年演练一次
- 灾难恢复：每年演练一次
\`\`\`

> **踩坑提示**：
> - 备份验证要在与生产隔离的环境进行
> - 验证要覆盖所有关键集合和索引
> - 记录验证结果，发现问题及时修复
> - 验证耗时也要记录，用于评估 RTO

## 30.8 监控告警

### 监控告警体系

\`\`\`
监控告警层级：
1. 基础监控：CPU、内存、磁盘、网络
2. 数据库监控：连接数、QPS、缓存、延迟
3. 业务监控：订单量、错误率、响应时间
4. 告警分级：致命、严重、警告、信息

告警渠道：
- 致命：电话 + 短信 + IM
- 严重：短信 + IM
- 警告：IM
- 信息：邮件
\`\`\`

### 关键告警规则

| 告警 | 条件 | 级别 |
| --- | --- | --- |
| 服务宕机 | mongodb_up == 0 | 致命 |
| 副本集无 primary | rs.state != PRIMARY | 致命 |
| 连接数过高 | > 80% 上限 | 严重 |
| 缓存命中率低 | < 90% | 严重 |
| 同步延迟大 | > 30s | 严重 |
| 磁盘使用高 | > 85% | 严重 |
| 慢查询多 | > 10/分钟 | 警告 |
| 内存使用高 | > 90% | 警告 |

### 告警规则示例（Prometheus）

\`\`\`yaml
groups:
  - name: mongodb_alerts
    rules:
      - alert: MongodbInstanceDown
        expr: mongodb_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "MongoDB 实例宕机 ({{ $labels.instance }})"
          description: "MongoDB 实例已宕机超过 1 分钟"

      - alert: MongodbReplicationLag
        expr: mongodb_rs_members_lag > 30
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "副本集同步延迟过大"
          description: "同步延迟 {{ $value }} 秒"

      - alert: MongodbHighConnections
        expr: mongodb_ss_connections{state="current"} / (mongodb_ss_connections{state="current"} + mongodb_ss_connections{state="available"}) > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "MongoDB 连接数过高"
\`\`\`

> **踩坑提示**：
> - 告警要避免"狼来了"，只有真正需要处理的才告警
> - 告警要包含足够信息（实例、指标、阈值），便于快速定位
> - 定期审查告警规则，清理无效告警
> - 致命告警要 24/7 响应，确保有值班机制

## 30.9 常见生产事故

### 事故一：误删集合

\`\`\`
场景：开发误执行 db.orders.drop()

恢复步骤：
1. 立即停止应用写入（防止新数据覆盖）
2. 从 delayed 节点导出数据
3. 或从最近备份恢复 + oplog 回放
4. 验证数据完整性
5. 恢复应用写入

预防：
- 生产环境用只读账号给开发
- 危险操作要审批
- delayed 节点必备
\`\`\`

### 事故二：磁盘满

\`\`\`
场景：磁盘使用率 100%，MongoDB 无法写入

应急处理：
1. 立即清理日志文件
   rm /var/log/mongodb/mongod.log.*
2. 清理临时文件
3. 删除旧备份（本地）
4. compact 回收空间
5. 紧急扩容磁盘

预防：
- 磁盘使用率告警（> 85%）
- 定期清理旧数据
- 监控数据增长趋势
\`\`\`

### 事故三：副本集脑裂

\`\`\`
场景：网络分区导致两个 primary

处理：
1. 立即隔离少数派节点
2. 确认多数派 primary
3. 少数派节点降级为 secondary
4. 重新加入副本集
5. 检查数据一致性

预防：
- 副本集节点数用奇数
- 跨机房部署要考虑网络稳定性
- 监控心跳和选举状态
\`\`\`

### 事故四：慢查询拖垮数据库

\`\`\`
场景：一个全表扫描查询占用大量资源，影响所有业务

应急处理：
1. 用 killOp 终止慢查询
   db.currentOp({secs_running:{$gte:60}})
   db.killOp(opid)
2. 临时限制查询并发
3. 分析慢查询，加索引
4. 上线修复

预防：
- 慢查询告警
- Profiler 持续开启（级别 1）
- 代码审核查询语句
\`\`\`

### 事故五：连接数耗尽

\`\`\`
场景：应用连接泄漏，连接数达到上限

应急处理：
1. 重启应用服务器（释放连接）
2. 提高 maxIncomingConnections
3. 排查连接泄漏代码

预防：
- 监控连接数
- 应用使用连接池
- 设置连接超时
\`\`\`

## 30.10 生产上线 checklist

### 上线前检查清单

\`\`\`
部署检查：
[ ] 副本集 3+ 节点，跨机房部署
[ ] 启用认证（authorization: enabled）
[ ] 启用 TLS 加密
[ ] 节点间认证（keyfile 或 x509）
[ ] 绑定内网 IP，不暴露公网
[ ] 防火墙配置正确
[ ] systemd 服务配置（资源限制、自动重启）
[ ] 关闭透明大页（THP）
[ ] 文件描述符限制调整
[ ] XFS 文件系统 + noatime 挂载

性能检查：
[ ] WiredTiger cacheSizeGB 设为内存 50-60%
[ ] 索引设计完成（ESR 原则）
[ ] 慢查询 Profiler 开启（级别 1，100ms）
[ ] 关键查询 explain 验证
[ ] 连接池参数调优

备份检查：
[ ] 全量备份策略上线（每日）
[ ] oplog 增量备份上线（每小时）
[ ] delayed 节点配置（延迟 1-2 小时）
[ ] 异地备份同步
[ ] 备份恢复演练完成

监控检查：
[ ] mongostat/mongotop 可用
[ ] Prometheus + Grafana 监控
[ ] 关键告警规则配置
[ ] 告警通知渠道（电话/短信/IM）
[ ] 监控大盘可视化

安全检查：
[ ] 启用认证（authorization: enabled）
[ ] 启用 TLS 加密传输
[ ] 节点间认证（keyfile 或 x509）
[ ] 绑定内网 IP（非 0.0.0.0）
[ ] 防火墙规则配置
[ ] 业务用户最小权限
[ ] root 账号仅 DBA 持有
[ ] 密码强度策略
\`\`\`

### 上线后巡检

\`\`\`
上线后第一周巡检：
[ ] 检查副本集状态（rs.status）
[ ] 检查同步延迟（< 1s）
[ ] 检查缓存命中率（> 95%）
[ ] 检查慢查询数量
[ ] 检查连接数趋势
[ ] 检查磁盘使用率
[ ] 检查备份是否正常
[ ] 检查告警是否误报
\`\`\`

## 30.11 与其他数据库对比

### MongoDB vs MySQL

| 维度 | MongoDB | MySQL |
| --- | --- | --- |
| 数据模型 | 文档（JSON） | 关系表 |
| Schema | 灵活（可选校验） | 强 schema |
| 事务 | 4.0+ 支持 | 原生支持 |
| JOIN | \$lookup（弱） | 强（多种 JOIN） |
| 扩展 | 水平（分片原生支持） | 垂直为主，水平难 |
| 索引 | B-tree、地理、全文 | B-tree、全文、聚簇 |
| 适合 | 内容管理、IoT、实时分析 | 交易系统、强一致业务 |

### MongoDB vs Redis

| 维度 | MongoDB | Redis |
| --- | --- | --- |
| 数据模型 | 文档 | KV/Hash/List/Set |
| 持久化 | 默认持久化 | 默认内存，可选持久化 |
| 查询 | 丰富（条件、聚合） | 简单（按 key） |
| 容量 | TB+ | GB（受内存限制） |
| 适合 | 主数据库 | 缓存、会话、计数器 |

### MongoDB vs PostgreSQL

| 维度 | MongoDB | PostgreSQL |
| --- | --- | --- |
| 数据模型 | 文档 | 关系 + JSONB |
| 事务 | 多文档（4.0+） | 强（MVCC） |
| JSON 支持 | 原生 | JSONB（优秀） |
| 扩展 | 水平分片 | 垂直 + Citus |
| 复杂查询 | 中等 | 强（CTE、窗口函数） |
| 适合 | 灵活 schema、海量数据 | 复杂业务、强一致 |

> **选型建议**：
> - 业务字段经常变、数据结构复杂 → MongoDB
> - 强事务、复杂关联查询 → MySQL/PostgreSQL
> - 缓存、高并发简单查询 → Redis
> - 不要"用 MongoDB 替代所有数据库"，每个数据库都有最佳场景

## 30.12 本章小结

- **容量规划**：基于数据量、增长趋势、工作集估算存储和内存需求
- **硬件建议**：SSD + 大内存 + RAID10 + 万兆网络
- **存储引擎配置**：WiredTiger cacheSizeGB 50-60%，压缩用 snappy 或 zstd
- **生产副本集**：3+ 节点跨机房部署，配置 delayed 和 hidden 节点
- **分片策略**：数据量 > 2TB 或写入瓶颈时考虑分片，分片键遵循高基数、低频率
- **灾难恢复**：制定 RTO/RPO 目标，定期演练
- **备份验证**：没验证的备份等于没备份，定期恢复演练
- **监控告警**：分级告警，致命告警 24/7 响应
- **生产事故**：误删、磁盘满、脑裂、慢查询、连接耗尽，各有应对方案
- **上线 checklist**：部署、性能、备份、监控、安全全面检查

> **踩坑提示**：
> - 不要"用 MongoDB 替代所有数据库"，每个数据库都有最佳场景
> - 生产环境务必遵循上线 checklist，遗漏一项可能酿成事故
> - 容量规划要预留 30-50% 余量，关注增长趋势
> - 分片是最后手段，先优化单机性能
> - 灾难恢复要定期演练，没演练过的方案等于没有`
  }
];

export { chapters };
