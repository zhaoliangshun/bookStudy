// =============================================================
// 《MongoDB 实战教程》- 章节批次 6
// -------------------------------------------------------------
// 内容：第六部分 性能优化与运维实战（第 26-30 章）
// =============================================================

const chapters = [
  {
    id: "mongo-ch26",
    group: "第六部分 性能优化与运维实战",
    icon: "🧠",
    title: "第 26 章 性能优化",
    content: `# 第 26 章 性能优化

数据库性能问题往往不是"加个索引"就能解决，需要从存储引擎、内存、索引、查询、写入多个层面系统优化。本章带你建立完整的性能优化知识体系。

## 26.1 WiredTiger 存储引擎

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

## 26.2 内存与缓存

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

### 缓存调优

\`\`\`javascript
// 查看 cache 情况
const stats = db.serverStatus().wiredTiger.cache;
const hitRate = 1 - (stats["pages read into cache"] / stats["pages requested from the cache"]);
console.log("缓存命中率：", (hitRate * 100).toFixed(2) + "%");
\`\`\`

**命中率低的原因**：

- 工作集大于缓存（最常见）：加内存或缩小工作集
- 全表扫描：大量冷数据冲掉热数据
- 索引不合理：扫描过多文档

## 26.3 索引优化

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

### 删除无用索引

\`\`\`javascript
// 查看索引使用情况
db.products.aggregate([{ $indexStats: {} }]);

// 删除未使用索引
db.products.dropIndex("unused_index_name");
\`\`\`

> **踩坑提示**：
> - 索引不是越多越好，每个索引增加写入开销和内存占用
> - 索引大小应能放进内存，否则索引扫描也会变慢
> - 正则表达式前缀匹配才能用索引（\`/^张/\` 可以，\`/张/\` 不行）

## 26.4 查询优化

### 避免全表扫描

\`\`\`javascript
// 差：无索引字段查询
db.users.find({ bio: /MongoDB/ });

// 好：用索引字段过滤
db.users.find({ city: "北京", bio: /MongoDB/ });
\`\`\`

### 避免前置模糊查询

\`\`\`javascript
// 差：前缀通配，无法用索引
db.users.find({ name: /张.*/ });

// 好：后缀通配，可用索引
db.users.find({ name: /张.*/ });  // 实际上 /^张/ 才用索引
db.users.find({ name: /^张/ });   // 用索引
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

## 26.5 写入优化

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

### 使用 \$inc 代替 read-modify-write

\`\`\`javascript
// 差：读取 → 修改 → 写回
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

## 26.6 本章小结

- **WiredTiger** 是默认存储引擎，支持文档级锁、压缩、内置缓存
- 缓存命中率应 > 95%，低于此值说明工作集大于内存
- 索引优化遵循 **ESR 原则**：等值 → 排序 → 范围
- 查询优化：避免全表扫描、前置模糊、大 skip，用游标分页
- 写入优化：批量写、原子操作、写关注分级、分片水平扩展

> **踩坑提示**：
> - 性能优化要先定位瓶颈（CPU/内存/IO/锁），不要盲目加索引
> - explain() 是排查利器，关注 totalDocsExamined / nReturned 比值
> - 生产环境索引变更要在低峰期，建索引会锁集合（background 模式除外）
> - 监控 cache 命中率和 page eviction，是性能预警的关键指标`
  },

  {
    id: "mongo-ch27",
    group: "第六部分 性能优化与运维实战",
    icon: "📊",
    title: "第 27 章 监控与诊断",
    content: `# 第 27 章 监控与诊断

数据库上线后，**监控是第二道防线**（第一道是备份）。没有监控的数据库是黑盒——出问题才知道，为时已晚。本章介绍 MongoDB 自带的监控工具和 Prometheus + Grafana 监控方案。

## 27.1 mongostat

**mongostat** 是命令行实时监控工具，类似 Linux 的 vmstat。

\`\`\`bash
# 基本用法
mongostat --uri="mongodb://localhost:27017"

# 副本集
mongostat --uri="mongodb://host1:27017,host2:27017/?replicaSet=rs0" --discover

# 每隔 5 秒输出
mongostat -n 100 5
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

> **关键阈值**：
> - dirty > 20%：脏页太多，写入会变慢
> - used > 95%：缓存满了，频繁驱逐
> - qrw > 0：有请求排队，可能有锁竞争

## 27.2 mongotop

**mongotop** 显示每个集合的读写耗时，定位热点集合。

\`\`\`bash
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
\`\`\`

**用法**：定位哪个集合读写耗时最长，针对性优化。

## 27.3 serverStatus

\`db.serverStatus()\` 是最全的运行状态命令，返回几百个指标。

\`\`\`javascript
const status = db.serverStatus();

// 关键指标分组
{
  connections: { current: 100, available: 9900 },  // 连接数
  opcounters: { insert: 1000, query: 5000, update: 200, delete: 50 },  // 操作计数
  memory: { resident: 500, virtual: 1500, mapped: 2000 },  // 内存
  wiredTiger: { cache: { ... } },  // 缓存详情
  metrics: {
    query: {.scannedObjects: 100000, returned: 50000},  // 扫描/返回比
    document: { deleted: 50, inserted: 1000, returned: 5000, updated: 200 }
  },
  locks: { ... },  // 锁信息
  repl: { ... }    // 副本集状态
}
\`\`\`

### 自定义监控脚本

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

## 27.4 Profiler 慢查询

**Database Profiler** 记录所有操作的详细信息，用于定位慢查询。

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
\`\`\`

### 查询慢操作

\`\`\`javascript
// 慢查询存在 system.profile 集合
db.system.profile.find().sort({ ts: -1 }).limit(5).pretty();

// 查询最慢的 10 个操作
db.system.profile.find()
  .sort({ millis: -1 })
  .limit(10)
  .forEach(p => print(p.op + " " + p.ns + " " + p.millis + "ms " + JSON.stringify(p.command).substring(0, 100)));

// 查询某个集合的慢操作
db.system.profile.find({ ns: "shop.orders" }).sort({ ts: -1 }).limit(10);
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

> **踩坑提示**：
> - Profiler 级别 2 会显著影响性能，生产环境只用级别 1
> - system.profile 是固定集合，默认 1MB，会循环覆盖
> - 慢查询定位后要及时关闭 Profiler，避免影响性能

## 27.5 Prometheus + Grafana

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

### 关键监控指标

| 指标 | 含义 | 告警阈值 |
| --- | --- | --- |
| mongodb_ss_connections | 当前连接数 | > 80% 上限 |
| mongodb_ss_mem_resident | 内存使用 | 持续增长 |
| mongodb_wt_cache_bytes | 缓存大小 | 接近上限 |
| mongodb_wt_cache_pages_read | 磁盘读次数 | 突增告警 |
| mongodb_ss_opcounters | 操作 QPS | 突变告警 |
| mongodb_up | 服务存活 | 0 立即告警 |
| mongodb_rs_status | 副本集状态 | 非 primary 告警 |

### Grafana 面板

Grafana 官方有现成的 MongoDB dashboard 模板（ID: 7353、16490），导入即用。

> **踩坑提示**：
> - mongodb_exporter 要用专用监控账号，最小权限原则
> - 监控数据保留时间根据存储容量调整，一般 7-30 天
> - 关键业务要配置告警规则（连接数、缓存命中率、副本集状态）

## 27.6 本章小结

- **mongostat**：命令行实时监控，关注 dirty/used/qrw
- **mongotop**：集合级读写耗时，定位热点集合
- **serverStatus**：最全运行状态，自定义监控脚本基础
- **Profiler**：慢查询定位，级别 1 生产用，级别 2 调试用
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

**没有备份的数据库是定时炸弹**。数据丢失的原因不只是磁盘损坏——误操作（dropTable/deleteMany）、程序 bug、勒索软件都可能毁掉数据。本章系统讲解 MongoDB 的备份与恢复方案。

## 28.1 mongodump / mongorestore

**mongodump** 是 MongoDB 自带的逻辑备份工具，导出 BSON 格式数据。

### 基本用法

\`\`\`bash
# 备份整个数据库
mongodump --uri="mongodb://localhost:27017" --out=/backup/$(date +%Y%m%d)

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

### oplog 备份

\`\`\`bash
# 备份时记录 oplog，用于时间点恢复
mongodump --oplog --uri="mongodb://localhost:27017" --out=/backup/
\`\`\`

## 28.2 mongoexport / mongoimport

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
\`\`\`

> **踩坑提示**：
> - JSON 导出会丢失部分 BSON 类型（如 ObjectId 变成字符串）
> - 大数据迁移用 BSON（mongodump）比 JSON 快
> - CSV 不支持嵌套文档，复杂结构用 JSON

## 28.3 文件系统快照备份

**文件系统快照**是物理备份，瞬间完成，适合大数据量。

### 前提条件

- 数据目录在 LVM 或 ZFS 文件系统上
- journal 与数据在同一卷
- 必须**锁定写入**保证一致

### 操作步骤

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

> **踩坑提示**：
> - 快照不是备份，要拷贝到其他存储才算备份
> - 快照占用磁盘空间，及时清理
> - LVM 快照会降低原卷 IO 性能，备份后立即删除

## 28.4 oplog 增量备份

**oplog 增量备份**：全量备份后，定期导出 oplog，实现连续备份。

\`\`\`bash
# 1. 全量备份（带 oplog 时间戳）
mongodump --oplog --uri="mongodb://localhost:27017" --out=/backup/full_20260701

# 2. 定期导出 oplog（每小时）
LAST_TS=$(cat /backup/last_ts)
mongodump --uri="mongodb://localhost:27017/local" --collection=oplog.rs \
  --query="{ ts: { \$gt: { $LAST_TS } } }" --out=/backup/incremental_$(date +%Y%m%d%H)
\`\`\`

### 增量备份脚本

\`\`\`javascript
// Node.js 增量备份脚本
const { MongoClient } = require("mongodb");

async function backupOplog() {
  const client = await MongoClient.connect("mongodb://localhost:27017/?replicaSet=rs0");
  const local = client.db("local");
  const oplog = local.collection("oplog.rs");

  // 读取上次备份的时间戳
  const lastTs = await getLastBackupTs();

  // 查询新 oplog
  const newOps = await oplog.find({ ts: { $gt: lastTs } }).toArray();
  console.log("新增 oplog 条数：", newOps.length);

  // 保存到文件
  if (newOps.length > 0) {
    const fs = require("fs");
    const fileName = \`oplog_\${Date.now()}.json\`;
    fs.writeFileSync(\`/backup/\${fileName}\`, JSON.stringify(newOps));
    
    // 更新最后时间戳
    await saveLastBackupTs(newOps[newOps.length - 1].ts);
  }

  await client.close();
}

// 每小时执行一次
setInterval(backupOplog, 3600 * 1000);
\`\`\`

> **踩坑提示**：
> - oplog 是固定集合，会被覆盖，增量备份间隔要小于 oplog 保留时间
> - 增量备份文件要按时间有序保存，恢复时按顺序回放

## 28.5 时间点恢复（PITR）

**PITR（Point-in-Time Recovery）**：恢复到任意时间点，用于误操作回滚。

### 恢复流程

1. 恢复最近的全量备份
2. 回放 oplog 到目标时间点

\`\`\`bash
# 1. 恢复全量备份
mongorestore --oplogReplay --uri="mongodb://localhost:27017" /backup/full_20260701/

# 2. 回放 oplog 到指定时间点（2026-07-01 14:30:00）
mongorestore --oplogReplay --oplogLimit=1751392200 \
  --uri="mongodb://localhost:27017" /backup/full_20260701/
\`\`\`

### 完整 PITR 示例

\`\`\`bash
# 场景：14:35 误删了 orders 集合，要恢复到 14:30 的状态

# 1. 停止当前 MongoDB，准备恢复
systemctl stop mongod
rm -rf /data/mongo/*
systemctl start mongod

# 2. 恢复全量备份（带 oplog）
mongorestore --oplogReplay --oplogLimit=1751392200 \
  --uri="mongodb://localhost:27017" /backup/full_20260701/

# oplogLimit 格式：timestamp,inc
# 1751392200 是 2026-07-01 14:30:00 的 Unix 时间戳
\`\`\`

### 用 delayed 节点恢复

更简单的方式：从 delayed 节点直接导出数据。

\`\`\`javascript
// delayed 节点落后 1 小时，14:35 的误删在它上面还没生效
// 直接连 delayed 节点导出数据
const client = await MongoClient.connect("mongodb://delayed-host:27017");
const orders = client.db("shop").collection("orders");
const allOrders = await orders.find({}).toArray();
// 再导入到 primary
\`\`\`

## 28.6 本章小结

- **mongodump/mongorestore**：逻辑备份，灵活但慢，适合小库
- **mongoexport/mongoimport**：JSON/CSV 格式，适合数据迁移
- **文件系统快照**：物理备份，瞬间完成，适合大库
- **oplog 增量备份**：全量 + 增量，实现连续备份
- **PITR**：恢复到任意时间点，误操作救命稻草

> **踩坑提示**：
> - 备份要**异地存放**，同机房备份在机房故障时全毁
> - 定期**演练恢复**，没验证的备份等于没备份
> - 备份要加密，防止数据泄露
> - 副本集**不是备份**，误操作会同步到所有节点
> - 生产环境建议组合方案：文件系统快照（全量）+ oplog（增量）+ delayed 节点（误操作恢复）`
  },

  {
    id: "mongo-ch29",
    group: "第六部分 性能优化与运维实战",
    icon: "🛠️",
    title: "第 29 章 运维实战",
    content: `# 第 29 章 运维实战

前面的章节讲原理，本章讲实战。从部署、配置、升级、迁移、安全到故障排查，覆盖 MongoDB 日常运维的全流程。

## 29.1 部署最佳实践

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

# 2. 调整文件描述符限制
echo "* soft nofile 65535" >> /etc/security/limits.conf
echo "* hard nofile 65535" >> /etc/security/limits.conf

# 3. 调整内核参数
echo "vm.swappiness = 1" >> /etc/sysctl.conf
echo "vm.dirty_ratio = 15" >> /etc/sysctl.conf
echo "vm.dirty_background_ratio = 5" >> /etc/sysctl.conf
sysctl -p

# 4. 磁盘调度器（SSD 推荐 noop / none）
echo noop > /sys/block/sda/queue/scheduler

# 5. 文件系统（推荐 XFS）
mkfs.xfs /dev/sdb1
mount -o noatime /dev/sdb1 /data
\`\`\`

## 29.2 配置文件调优

\`\`\`yaml
# /etc/mongod.conf
storage:
  dbPath: /data/mongodb
  journal:
    enabled: true
    commitIntervalMs: 100  # 默认 100，调大减少 IO 但崩溃丢数据多
  wiredTiger:
    engineConfig:
      cacheSizeGB: 8  # 物理内存的 50-60%
      journalCompressor: snappy
    collectionConfig:
      blockCompressor: snappy
    indexConfig:
      prefixCompression: true

systemLog:
  destination: file
  path: /var/log/mongodb/mongod.log
  logAppend: true
  logRotate: reopen  # 支持 logrotate

net:
  port: 27017
  bindIp: 0.0.0.0  # 生产环境应限制 IP
  maxIncomingConnections: 10000
  compression:
    compressors: snappy,zstd,zlib

replication:
  replSetName: rs0
  oplogSizeMB: 10240  # 10GB，写入密集场景调大

security:
  authorization: enabled
  clusterAuthMode: x509  # 节点间证书认证

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

## 29.3 升级策略

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

> **踩坑提示**：
> - 升级前一定要备份，升级失败可以回滚
> - featureCompatibilityVersion 决定能用哪些新特性，不设置等于没升级
> - 升级期间会有一次故障转移（stepDown），应用要支持重试

## 29.4 数据迁移

### 同版本迁移

\`\`\`bash
# 方法 1：mongodump/mongorestore（小数据量）
mongodump --uri="mongodb://old-host:27017/shop" --out=/tmp/backup
mongorestore --uri="mongodb://new-host:27017" /tmp/backup

# 方法 2：文件拷贝（大数据量）
# 停掉写入，rsync 数据目录
rsync -avz /data/mongodb/ new-host:/data/mongodb/

# 方法 3：副本集添加新节点，自动同步
rs.add({ host: "new-host:27017", priority: 0, votes: 0 })
# 等同步完成后，移除老节点
rs.remove("old-host:27017")
\`\`\`

### 跨版本迁移

\`\`\`bash
# 1. 新版本建空库
# 2. mongodump 老版本（兼容模式）
mongodump --uri="mongodb://old-host:27017" --out=/tmp/backup

# 3. mongorestore 到新版本
mongorestore --uri="mongodb://new-host:27017" /tmp/backup

# 4. 设置 featureCompatibilityVersion
mongo --eval 'db.adminCommand({ setFeatureCompatibilityVersion: "6.0" })'
\`\`\`

### 在线迁移（双写）

不停服迁移方案：

\`\`\`javascript
// 1. 应用层双写新老库
async function writeData(data) {
  await oldDb.collection("orders").insertOne(data);
  await newDb.collection("orders").insertOne(data);  // 新库双写
}

// 2. 全量同步历史数据
// 用 mongodump 或脚本分批同步

// 3. 校验数据一致性
// 对比新老库文档数、抽样校验

// 4. 切换读流量到新库

// 5. 停止老库写入
\`\`\`

## 29.5 安全（认证/授权/网络隔离）

### 启用认证

\`\`\`yaml
# mongod.conf
security:
  authorization: enabled
\`\`\`

\`\`\`javascript
// 创建管理员用户
use admin;
db.createUser({
  user: "admin",
  pwd: passwordPrompt(),  // 或 "strongPassword"
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }]
});

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
\`\`\`

### 内置角色

| 角色 | 权限 |
| --- | --- |
| read | 只读 |
| readWrite | 读写 |
| dbAdmin | 数据库管理 |
| userAdmin | 用户管理 |
| readAnyDatabase | 所有库只读 |
| readWriteAnyDatabase | 所有库读写 |
| userAdminAnyDatabase | 所有库用户管理 |
| dbAdminAnyDatabase | 所有库管理 |
| root | 超级权限 |

### 网络隔离

\`\`\`bash
# 1. 绑定内网 IP
net:
  bindIp: 10.0.0.1,127.0.0.1

# 2. 防火墙限制
iptables -A INPUT -p tcp --dport 27017 -s 10.0.0.0/24 -j ACCEPT
iptables -A INPUT -p tcp --dport 27017 -j DROP

# 3. 只允许应用服务器访问
# 安全组规则：27017 端口只对 app subnet 开放
\`\`\`

### TLS/SSL 加密

\`\`\`yaml
net:
  tls:
    mode: requireTLS
    certificateKeyFile: /etc/mongo/server.pem
    CAFile: /etc/mongo/ca.pem
    allowConnectionsWithoutCertificates: false
\`\`\`

> **踩坑提示**：
> - 业务用户**不要用 root**，最小权限原则
> - 密码要强，定期轮换
> - 生产环境**必须**启用 TLS，防止传输层数据泄露
> - 节点间通信也要认证（x509 证书或 keyfile）

## 29.6 常见故障排查

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

### 故障三：内存飙升

\`\`\`javascript
// 查看 WiredTiger 缓存
db.serverStatus().wiredTiger.cache;

// 解决：
// 1. 调小 cacheSizeGB
// 2. 排查全表扫描（大量数据进缓存）
// 3. 检查是否有大聚合操作
\`\`\`

### 故障四：副本集同步延迟

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

**延迟原因**：

- Secondary 硬件差
- 网络带宽不足
- 写入 QPS 过高
- Secondary 跑重查询

**解决**：

- 升级 secondary 硬件
- 把报表查询移到独立的 hidden 节点
- 调大 oplog 大小

### 故障五：磁盘满

\`\`\`bash
# 1. 查看磁盘占用
df -h

# 2. 查看数据库大小
mongo --eval 'db.stats()'

# 3. 查看集合大小
mongo --eval 'db.products.stats()'

# 4. 清理无用数据
mongo --eval 'db.old_logs.deleteMany({ createdAt: { $lt: ISODate("2026-01-01") } })'

# 5. 压缩集合（回收磁盘空间）
mongo --eval 'db.runCommand({ compact: "products" })'

# 6. 修复数据库（最后手段）
mongod --repair
\`\`\`

## 29.7 本章小结

- 部署：SSD + 大内存 + RAID10 + XFS + 关闭 THP
- 配置：cacheSizeGB 50-60% 内存，oplog 10GB+，开启认证
- 升级：滚动升级，不能跨大版本，先备份
- 迁移：小数据用 dump/restore，大数据用副本集同步或在线双写
- 安全：认证 + 授权 + 网络隔离 + TLS 加密
- 故障排查：连接数、慢查询、内存、同步延迟、磁盘满

> **踩坑提示**：
> - 生产环境**必须**开启认证，默认无认证是巨大安全风险
> - 升级前一定要在测试环境验证，并备份生产数据
> - compact 命令会锁集合，生产环境低峰期执行
> - 监控磁盘使用率，提前预警，避免磁盘满导致服务中断
> - 建立故障应急预案，定期演练`
  },

  {
    id: "mongo-ch30",
    group: "第六部分 性能优化与运维实战",
    icon: "🌍",
    title: "第 30 章 MongoDB 在生产环境",
    content: `# 第 30 章 MongoDB 在生产环境

本章是全书的收官，讨论 MongoDB 在生产环境的实际应用：云服务 Atlas、与其他数据库对比、典型应用场景、从 SQL 迁移到 MongoDB，最后给出学习路径建议。

## 30.1 Atlas 云服务

**MongoDB Atlas** 是 MongoDB 官方提供的云数据库服务（DBaaS），让你无需自建运维即可使用 MongoDB。

### Atlas 的优势

| 优势 | 说明 |
| --- | --- |
| 全托管 | 不用管服务器、备份、升级、监控 |
| 多云支持 | AWS / Azure / GCP，跨云部署 |
| 自动扩展 | 支持自动扩容存储和计算 |
| 内置备份 | 连续备份 + PITR |
| 全球集群 | 跨地域部署，就近访问 |
| 安全合规 | 内置加密、VPC、合规认证（SOC2、HIPAA） |

### Atlas 集群类型

\`\`\`
M0   免费版（512MB，学习用）
M2/M5  共享集群（小项目）
M10+  专用集群（生产环境）
M40+  高性能专用集群
\`\`\`

### 连接 Atlas

\`\`\`javascript
// Atlas 提供 SRV 连接字符串，自动发现节点
const uri = "mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/shop?retryWrites=true&w=majority";

const client = await MongoClient.connect(uri, {
  retryWrites: true,
  w: "majority",
  maxPoolSize: 50
});
\`\`\`

### Atlas vs 自建

| 维度 | Atlas | 自建 |
| --- | --- | --- |
| 运维成本 | 低（全托管） | 高（专人维护） |
| 费用 | 高（订阅费） | 中（只付机器） |
| 灵活性 | 受限（部分参数不可改） | 高（完全控制） |
| 可靠性 | 高（官方保障） | 取决于运维水平 |
| 适合 | 中小团队、创业公司 | 大厂、特殊需求 |

> **踩坑提示**：
> - Atlas 免费版只适合学习，生产环境至少 M10
> - Atlas 跨地域集群费用高，确认业务需要全球部署再用
> - Atlas 限制了部分参数（如 WiredTiger cache），自建更灵活

## 30.2 MongoDB 与其他数据库对比

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

## 30.3 应用场景

### 场景一：内容管理（CMS）

**特点**：内容结构多样、字段灵活、需要富文本。

\`\`\`javascript
// 文章文档，字段灵活
db.articles.insertOne({
  _id: ObjectId(),
  title: "MongoDB 实战",
  body: "正文内容...",
  author: { id: ObjectId(), name: "张三" },
  tags: ["database", "nosql"],
  cover: "https://...",
  publishedAt: ISODate(),
  stats: { views: 0, likes: 0, comments: 0 }
});

// 评论嵌入或单独集合
db.comments.insertOne({
  articleId: ObjectId("..."),
  userId: ObjectId("..."),
  content: "写得不错",
  createdAt: ISODate()
});
\`\`\`

### 场景二：IoT 数据

**特点**：高写入、时序数据、按时间查询。

\`\`\`javascript
// 桶模式存储
db.readings.insertOne({
  sensorId: "S001",
  hourBucket: ISODate("2026-07-01T10:00:00Z"),
  count: 3600,
  values: [{ ts: ISODate(), v: 23.5 }, ...],
  stats: { min: 23, max: 25, avg: 23.7 }
});

// 聚合查询每小时平均
db.readings.aggregate([
  { $match: { sensorId: "S001", hourBucket: { $gte: ISODate("2026-07-01T00:00:00Z") } } },
  { $group: { _id: "$hourBucket", avgValue: { $avg: "$stats.avg" } } },
  { $sort: { _id: 1 } }
]);
\`\`\`

### 场景三：实时分析

**特点**：事件流、聚合统计、低延迟。

\`\`\`javascript
// 用户行为事件
db.events.insertOne({
  userId: ObjectId("..."),
  type: "click",
  page: "/home",
  ts: ISODate(),
  props: { source: "banner", position: 1 }
});

// 实时统计每分钟 PV
db.events.aggregate([
  { $match: { ts: { $gte: ISODate("2026-07-01T10:00:00Z") } } },
  { $group: {
    _id: { $dateToString: { format: "%Y-%m-%d %H:%M", date: "$ts" } },
    pv: { $sum: 1 },
    uv: { $addToSet: "$userId" }
  }},
  { $project: { pv: 1, uv: { $size: "$uv" } } },
  { $sort: { _id: 1 } }
]);
\`\`\`

### 场景四：电商订单

**特点**：强事务（库存+订单）、复杂查询、高并发。

\`\`\`javascript
// 订单文档（嵌入商品快照）
db.orders.insertOne({
  orderNo: "ORD20260701001",
  userId: ObjectId("..."),
  status: "paid",
  items: [
    {
      productId: ObjectId("..."),
      name: "MongoDB 书",  // 商品快照
      price: 99,
      quantity: 1
    }
  ],
  totalAmount: 99,
  address: { name: "张三", phone: "138...", detail: "..." },
  createdAt: ISODate(),
  paidAt: ISODate()
});

// 事务保证扣库存 + 创建订单
const session = client.startSession();
session.startTransaction();
try {
  await db.collection("products").updateOne(
    { _id: productId, stock: { $gte: 1 } },
    { $inc: { stock: -1 } },
    { session }
  );
  await db.collection("orders").insertOne(order, { session });
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
}
\`\`\`

## 30.4 从 SQL 迁移到 MongoDB

### 概念映射

| SQL | MongoDB |
| --- | --- |
| database | database |
| table | collection |
| row | document |
| column | field |
| index | index |
| JOIN | \$lookup |
| primary key | _id |
| foreign key | 引用字段 |

### 迁移步骤

1. **数据建模**：把关系表转为文档模型（嵌入 vs 引用）
2. **数据迁移**：用 ETL 工具或脚本转换
3. **查询改造**：SQL 改为 MongoDB 查询语法
4. **应用层适配**：DAO 层重写

### 数据迁移脚本示例

\`\`\`javascript
// 从 MySQL 导出，转换后导入 MongoDB
const mysql = require("mysql2/promise");
const { MongoClient } = require("mongodb");

async function migrate() {
  // 1. 连接 MySQL
  const mysqlConn = await mysql.createConnection({ host: "localhost", user: "root", database: "shop" });
  
  // 2. 连接 MongoDB
  const mongo = await MongoClient.connect("mongodb://localhost:27017");
  const orders = mongo.db("shop").collection("orders");

  // 3. 分批读取 MySQL 订单
  let offset = 0;
  const batch = 1000;
  while (true) {
    const [rows] = await mysqlConn.execute(
      \`SELECT o.*, oi.product_id, oi.quantity, oi.price, p.name as product_name
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       LIMIT ? OFFSET ?\`,
      [batch, offset]
    );
    if (rows.length === 0) break;

    // 4. 转换为文档模型（按 order_id 分组）
    const orderMap = new Map();
    for (const row of rows) {
      if (!orderMap.has(row.id)) {
        orderMap.set(row.id, {
          _id: row.id,
          orderNo: row.order_no,
          userId: row.user_id,
          status: row.status,
          items: [],
          totalAmount: row.total_amount,
          createdAt: new Date(row.created_at)
        });
      }
      if (row.product_id) {
        orderMap.get(row.id).items.push({
          productId: row.product_id,
          name: row.product_name,
          price: row.price,
          quantity: row.quantity
        });
      }
    }

    // 5. 批量插入 MongoDB
    await orders.insertMany([...orderMap.values()], { ordered: false });
    offset += batch;
    console.log(\`已迁移 \${offset} 条\`);
  }

  await mysqlConn.end();
  await mongo.close();
}

migrate().catch(console.error);
\`\`\`

### 查询语法对照

\`\`\`sql
-- SQL
SELECT * FROM users WHERE age > 18 AND city = '北京' ORDER BY created_at DESC LIMIT 10;
\`\`\`

\`\`\`javascript
// MongoDB
db.users.find({ age: { $gt: 18 }, city: "北京" }).sort({ created_at: -1 }).limit(10);
\`\`\`

\`\`\`sql
-- SQL JOIN
SELECT o.*, u.name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.status = 'paid';
\`\`\`

\`\`\`javascript
// MongoDB $lookup
db.orders.aggregate([
  { $match: { status: "paid" } },
  { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "user" } },
  { $unwind: "$user" }
]);
\`\`\`

> **踩坑提示**：
> - 迁移不是简单"表→集合"，要重新设计数据模型
> - 迁移期间要双写或停服，保证数据一致
> - SQL 的复杂 JOIN 在 MongoDB 里性能差，重新建模避免 JOIN

## 30.5 总结与学习路径

### 全书知识图谱

\`\`\`
MongoDB 实战教程
├── 基础篇（1-5 章）：CRUD、查询、索引
├── 进阶篇（6-12 章）：聚合、管道、运维工具
├── 高级篇（13-15 章）：全文搜索、地理空间、GridFS
├── 数据建模（16-20 章）：嵌入/引用、模式、事务、校验、Change Streams
├── 高可用（21-25 章）：副本集、选举、分片、客户端
└── 性能运维（26-30 章）：优化、监控、备份、运维、生产实践
\`\`\`

### 学习路径建议

**入门阶段（1-2 周）**：

1. 第 1-5 章：掌握 CRUD 和基本查询
2. 安装 MongoDB，跟着示例敲代码
3. 用 Node.js 驱动写一个小项目（如待办事项）

**进阶阶段（2-3 周）**：

1. 第 6-15 章：聚合管道、索引优化、全文搜索
2. 第 16-20 章：数据建模、事务、Change Streams
3. 实战：做一个博客系统（含评论、搜索、统计）

**高级阶段（3-4 周）**：

1. 第 21-25 章：部署副本集、分片集群
2. 第 26-30 章：性能优化、监控、备份
3. 实战：模拟生产环境部署，做压力测试

### 持续学习资源

| 资源 | 用途 |
| --- | --- |
| MongoDB 官方文档 | 权威参考 |
| MongoDB University | 免费官方课程 |
| MongoDB Blog | 最佳实践 |
| Stack Overflow | 问题排查 |
| GitHub 开源项目 | 实战参考 |

### 常见误区

1. **"MongoDB 不支持事务"**：4.0+ 已支持多文档事务
2. **"MongoDB 会丢数据"**：配置 majority + journal 后很可靠
3. **"MongoDB 不需要 schema 设计"**：好的建模比关系型还重要
4. **"MongoDB 性能比 MySQL 差"**：场景不同，文档模型在合适场景下更快
5. **"分片解决一切性能问题"**：先优化，分片是最后手段

## 30.6 本章小结

- **Atlas** 是 MongoDB 官方云服务，适合不想自建运维的团队
- MongoDB 与 MySQL/Redis/PostgreSQL 各有优势，按场景选型
- 典型场景：内容管理、IoT、实时分析、电商订单
- 从 SQL 迁移要**重新建模**，不是简单表→集合转换
- 学习路径：基础 → 进阶 → 高级，每阶段配实战项目

> **踩坑提示**：
> - 不要"用 MongoDB 替代所有数据库"，每个数据库都有最佳场景
> - 迁移前充分测试，迁移期间双写保证数据一致
> - 生产环境关注 Atlas vs 自建的成本/灵活性权衡
> - 持续学习，MongoDB 每个大版本都有重要更新
> - 加入社区，参与讨论，是提升的最佳方式

---

**恭喜你完成《MongoDB 实战教程》全书学习！** 从基础的 CRUD 到生产环境运维，你已经掌握了 MongoDB 的完整知识体系。下一步是在实际项目中应用这些知识，**实践出真知**。祝你成为 MongoDB 高手！`
  }
];

export { chapters };
