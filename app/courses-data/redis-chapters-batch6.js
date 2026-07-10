// =============================================================
// 《Redis 实战教程》- 章节批次 6
// -------------------------------------------------------------
// 内容：第六部分 性能优化与运维实战（第 26-28 章）
// =============================================================

const chapters = [
  {
    id: "redis-ch26",
    group: "第六部分 性能优化与运维实战",
    icon: "🧠",
    title: "第 26 章 内存优化",
    content: `# 第 26 章 内存优化

Redis 是内存数据库，**内存就是生命**。同样一份业务数据，存得不好可能占 10GB，优化后只占 1GB——不仅省钱，还能减少 fork、RDB 持久化、主从同步的开销。本章讲透 Redis 的内存结构、编码转换、碎片治理和省内存技巧。

## 26.1 内存结构

### Redis 进程内存组成

\`\`\`text
┌─────────────────────────────────────┐
│ Redis 进程内存                       │
├─────────────────────────────────────┤
│ 1. 自身代码 + 共享库                 │ 几 MB
│ 2. 客户端连接 buffer                 │ 每个连接若干 KB
│ 3. 数据集（dict/ziplist/skiplist）   │ 主要占用
│ 4. AOF buffer / 重写 buffer          │
│ 5. 复制 backlog                       │ 默认 1MB
│ 6. 内存碎片                           │ 可能 1-2 倍
└─────────────────────────────────────┘
\`\`\`

### INFO memory

\`\`\`bash
127.0.0.1:6379> INFO memory
# Memory
used_memory:1073741824           # Redis 分配器分配的内存（数据集）
used_memory_human:1.00G
used_memory_rss:15032385536      # 操作系统视角的进程内存（含碎片）
used_memory_rss_human:14.00G
used_memory_peak:1207959552      # 历史峰值
used_memory_peak_human:1.12G
used_memory_dataset:900000000    # 实际数据占用
used_memory_dataset_perc:83.82%
allocator_allocated:1070000000   # 分配器实际分配
allocator_active:1100000000      # 分配器活跃内存
allocator_resident:1200000000    # 分配器常驻
mem_fragmentation_ratio:1.40     # 碎片率 = rss / used
mem_fragmentation_bytes:4300000000
maxmemory:2147483648             # 配置的最大内存
maxmemory_human:2.00G
maxmemory_policy:allkeys-lru     # 淘汰策略
\`\`\`

关键字段：

| 字段 | 含义 |
| --- | --- |
| \`used_memory\` | Redis 视角分配的内存 |
| \`used_memory_rss\` | OS 视角的内存（含碎片） |
| \`mem_fragmentation_ratio\` | 碎片率，\`rss / used\` |
| \`maxmemory\` | 上限，超过触发淘汰 |

### 碎片率健康范围

| 碎片率 | 含义 |
| --- | --- |
| < 1.0 | **危险**！OS 内存比 Redis 看到的少，可能 swap |
| 1.0 - 1.5 | 健康 |
| 1.5 - 2.0 | 有碎片，可关注 |
| > 2.0 | **碎片严重**，需要清理 |

## 26.2 编码转换（ziplist/listpack/intset）

Redis 的 5 种数据结构只是"对外接口"，**底层实际编码会根据数据特征自动转换**。理解编码才能省内存。

### 查看编码

\`\`\`bash
127.0.0.1:6379> SET k1 hello
OK
127.0.0.1:6379> OBJECT ENCODING k1
"embstr"   # 字符串短用 embstr

127.0.0.1:6379> SET k2 <很长很长的字符串...>
OK
127.0.0.1:6379> OBJECT ENCODING k2
"raw"      # 字符串长用 raw

127.0.0.1:6379> LPUSH list1 a b c
127.0.0.1:6379> OBJECT ENCODING list1
"listpack"  # Redis 7.0+ 短列表用 listpack（旧版叫 ziplist）

127.0.0.1:6379> LPUSH list2 <很多元素...>
127.0.0.1:6379> OBJECT ENCODING list2
"quicklist"  # 长列表用 quicklist

127.0.0.1:6379> SADD set1 1 2 3
127.0.0.1:6379> OBJECT ENCODING set1
"intset"   # 全是数字的小 Set 用 intset

127.0.0.1:6379> HSET h1 a 1 b 2
127.0.0.1:6379> OBJECT ENCODING h1
"listpack"

127.0.0.1:6379> ZADD z1 1 a 2 b
127.0.0.1:6379> OBJECT ENCODING z1
"listpack"
\`\`\`

### 各类型的编码

| 类型 | 编码 1（省内存） | 编码 2（标准） | 转换条件 |
| --- | --- | --- | --- |
| String | int（数字） / embstr | raw | 长度 > 44 字节用 raw |
| List | listpack | quicklist | 元素数 > 128 或单元素 > 64 字节 |
| Hash | listpack | hashtable | 字段数 > 128 或值 > 64 字节 |
| Set | intset / listpack | hashtable | 全整数且数 < 512 用 intset；有字符串小 Set 用 listpack |
| ZSet | listpack | skiplist + hashtable | 元素数 > 128 或单元素 > 64 字节 |

### ziplist / listpack 的内存优势

**hashtable** 存一个 Hash 字段，至少要：dictEntry（24 字节）+ key（SDS，至少 16 字节）+ value（SDS，至少 16 字节）= **约 56 字节**。

**listpack** 把所有字段紧凑存在一段连续内存，每个字段约 4-12 字节。所以**小 Hash 用 listpack 能省 5-10 倍内存**！

### 控制编码的配置

\`\`\`conf
# Hash：字段数 / 单值超阈值就转 hashtable
hash-max-listpack-entries 128
hash-max-listpack-value 64

# List
list-max-listpack-size -2   # -2 表示每个节点 8KB（默认）
list-compress-depth 0        # 0 表示不压缩中间节点

# Set（全整数时用 intset）
set-max-intset-entries 512
set-max-listpack-entries 128
set-max-listpack-value 64

# ZSet
zset-max-listpack-entries 128
zset-max-listpack-value 64
\`\`\`

> **优化思路**：如果业务允许，把阈值调大（比如 Hash 调到 256），让更多数据用紧凑编码。代价是单次操作稍慢（O(N) → O(1)）。

### Redis 7.0 的 listpack

**listpack** 是 ziplist 的替代品，解决了 ziplist 的"连锁更新"问题（一个元素扩展导致后续全部 memmove）。Redis 7.0+ 默认用 listpack，更稳定。

## 26.3 内存碎片

### 碎片的产生

Redis 用 jemalloc 分配内存。频繁修改/删除 key 时，会留下大小不一的"空洞"。

\`\`\`text
分配：[A][B][C][D][E]
删除 B、D：[A][空][C][空][E]
新 key F 需要 2 个空位：[A][F][C][空][E]   ← 第 2 个空位用不了
\`\`\`

### 查看碎片

\`\`\`bash
127.0.0.1:6379> INFO memory
mem_fragmentation_ratio:1.80      # 1.8 倍碎片
mem_fragmentation_bytes:800MB

# allocator 的细节
127.0.0.1:6379> MEMORY MALLOC-STATS
# 输出 jemalloc 的统计信息（很详细）
\`\`\`

### 自动清理

Redis 4.0+ 支持自动碎片清理：

\`\`\`conf
# 开启自动 activedefrag
activedefrag yes

# 碎片率超过 10% 触发
active-defrag-ignore-bytes 100mb
active-defrag-threshold-lower 10   # 碎片率 10% 开始
active-defrag-threshold-upper 100  # 碎片率 100% 全力清理

# 清理占用 CPU 上限
active-defrag-cycle-min 1   # 最小 1%
active-defrag-cycle-max 25  # 最大 25%
\`\`\`

> **注意**：activedefrag 会占用 CPU，生产建议低峰期开，或重启 Redis 让 OS 回收。

### 手动清理

\`\`\`bash
# Redis 4.0+
127.0.0.1:6379> MEMORY PURGE
OK

# 重启（最有效，但要先持久化）
redis-cli SHUTDOWN
# 重启后内存重新分配，碎片清零
\`\`\`

## 26.4 内存监控

### 实时内存

\`\`\`bash
# 当前内存使用
127.0.0.1:6379> INFO memory | grep used_memory_human
used_memory_human:1.00G

# 单个 key 的内存占用
127.0.0.1:6379> MEMORY USAGE mykey
(integer) 56   # 字节

# 采样估算
127.0.0.1:6379> MEMORY USAGE mykey SAMPLES 5
\`\`\`

### 模块的内存

\`\`\`bash
# Redis 6.2+ 查看模块占用
127.0.0.1:6379> MEMORY STATS
1) "peak.allocated"
2) (integer) 1207959552
3) "total.allocated"
4) (integer) 1073741824
5) "startup.allocated"
6) (integer) 1000000
7) "replication.backlog"
8) (integer) 1048576
9) "clients.slaves"
10) (integer) 100000
11) "clients.normal"
12) (integer) 50000
13) "aof.buffer"
14) (integer) 0
15) "dataset.bytes"
16) (integer) 900000000
17) "dataset.percentage"
18) "83.82"
19) "fragmentation"
20) "1.40"
\`\`\`

### 客户端 buffer 监控

\`\`\`bash
127.0.0.1:6379> CLIENT LIST
id=1 addr=... laddr=... fd=8 ... qbuf=0 qbuf-free=0 ... obl=0 oll=0 omem=0
# omem：输出缓冲区占用的内存
# qbuf：输入缓冲区占用的内存
\`\`\`

监控客户端 buffer 防止被慢客户端拖垮：

\`\`\`conf
# 客户端输出 buffer 限制
client-output-buffer-limit normal 0 0 0       # 普通客户端不限
client-output-buffer-limit replica 256mb 64mb 60  # 从节点
client-output-buffer-limit pubsub 32mb 8mb 60    # pub/sub

# 客户端输入 buffer 上限
client-query-buffer-limit 1gb
\`\`\`

## 26.5 节省内存的技巧

### 1. 用 Hash 替代多个 String

**反例**：

\`\`\`bash
SET user:1001:name "Alice"
SET user:1001:age "30"
SET user:1001:city "Beijing"
# 3 个 key，3 个 dictEntry，约 168 字节
\`\`\`

**正例**：

\`\`\`bash
HSET user:1001 name "Alice" age "30" city "Beijing"
# 1 个 key，listpack 编码，约 60 字节
\`\`\`

省 60%+ 内存！

### 2. 用短 key 名

\`\`\`bash
# 反例
SET user:profile:1001:name "Alice"   # key 长 21 字节

# 优化：缩短前缀
SET u:p:1001:n "Alice"               # key 长 10 字节
\`\`\`

> **权衡**：key 太短可读性差。生产中保留必要语义，去掉冗余词。

### 3. 用数字代替字符串

\`\`\`bash
# 反例
SET status active   # "active" 占 7 字节
SET status inactive

# 优化：用数字枚举
SET status 1   # 1 是 int，省内存
SET status 0
\`\`\`

数字类型字符串会用 int 编码，只占 8 字节。

### 4. 控制 value 大小

\`\`\`bash
# 反例：一个 key 存 1MB 的 JSON
SET cache:user:1001 <1MB JSON>

# 优化：拆字段
HSET cache:user:1001 name "Alice" age 30 ...
\`\`\`

> **建议**：单个 value 不超过 10KB，超大 value 要拆分。BigKey 会拖累很多操作（持久化、复制、删除）。

### 5. 设合理的 TTL

不用的 key 设过期，避免长期占内存：

\`\`\`bash
SET token:abc123 <data> EX 3600   # 1 小时后自动清理
\`\`\`

### 6. 控制集合大小

\`\`\`bash
# 反例：一个 Set 存百万元素，hashtable 编码占几百 MB
SADD tags:popular <百万元素>

# 优化：分片
SADD tags:popular:1 <10万元素>
SADD tags:popular:2 <10万元素>
# ...
\`\`\`

### 7. 用 HyperLogLog 替代 Set 做 UV

\`\`\`bash
# Set 存 UV：百万用户占 ~8MB
SADD uv:20240101 user:1 user:2 ...

# HyperLogLog：12KB，误差 0.81%
PFADD uv:20240101 user:1 user:2 ...
PFCOUNT uv:20240101
\`\`\`

### 8. 用 Bitmap 替代 Set 做布尔状态

\`\`\`bash
# Set 存在线用户：百万占 ~8MB
SADD online user:1 user:2 ...

# Bitmap：百万占 125KB
SETBIT online 1 1
SETBIT online 2 1
BITCOUNT online
\`\`\`

### 9. 压缩大 value

业务层把大 JSON 用 gzip/zstd 压缩后存 Redis：

\`\`\`javascript
import { gzip, gunzip } from "zlib";

async function setCompressed(key, data) {
  const json = JSON.stringify(data);
  const compressed = await gzip(Buffer.from(json));
  await redis.set(key, compressed);
}

async function getCompressed(key) {
  const compressed = await redis.getBuffer(key);
  if (!compressed) return null;
  const json = (await gunzip(compressed)).toString();
  return JSON.parse(json);
}
\`\`\`

适合**存得多读得少**的场景（如日志、历史数据）。读频繁的场景反而增加 CPU 开销。

### 10. 用 Redis 模块

- **RedisJSON**：原生 JSON 操作，省内存
- **RedisBloom**：布隆过滤器省 90% 内存
- **RediSearch**：全文索引比关系 DB 节省

## 26.6 踩坑提示

> **坑 1：编码转换后变慢**。把 \`hash-max-listpack-entries\` 调到 1000，单个 HGET 从 O(1) 变 O(N)。监控延迟，权衡内存和性能。

> **坑 2：activedefrag 拖垮 CPU**。生产高峰期开自动清理可能 CPU 100%。低峰期开，或调小 cycle。

> **坑 3：碎片率 < 1 误判**。可能是 swap 了，不是没碎片。看 OS 的 swap 使用量。

> **坑 4：大 key 删除阻塞**。删一个百万元素的 Set 会阻塞几秒。用 \`UNLINK\` 异步删除：

\`\`\`bash
# 同步删除（阻塞）
DEL bigkey

# 异步删除（不阻塞）
UNLINK bigkey

# 批量异步删除
redis-cli --scan --pattern "cache:*" | xargs -L 1000 redis-cli UNLINK
\`\`\`

> **坑 5：maxmemory 不含复制 buffer**。配置 maxmemory=2GB，但复制 buffer 1GB，实际数据只能用 1GB。生产要预留 buffer 空间。

> **坑 6：lazyfree 配置不当**。

\`\`\`conf
# 默认 no，删大 key 阻塞
lazyfree-lazy-eviction yes    # 淘汰异步
lazyfree-lazy-expire yes      # 过期异步
lazyfree-lazy-server-del yes  # DEL/RENAME 等异步
\`\`\`

生产建议都开 yes。

## 26.7 本章小结

- **内存结构**：used_memory（数据集）vs rss（含碎片），监控 \`INFO memory\`
- **编码转换**：listpack/intset 省内存，hashtable/skiplist 性能好，靠阈值切换
- **内存碎片**：\`mem_fragmentation_ratio > 1.5\` 要关注，开 \`activedefrag\` 或重启
- **省内存技巧**：Hash 替代多 String、短 key、数字枚举、HLL 替代 Set、Bitmap 替代 Set、压缩大 value
- **BigKey 治理**：\`UNLINK\` 异步删除，开 \`lazyfree\`
- 关键配置：\`maxmemory\`、\`maxmemory-policy\`、各种 \`*-max-listpack-*\`、\`activedefrag\``
  },
  {
    id: "redis-ch27",
    group: "第六部分 性能优化与运维实战",
    icon: "🐌",
    title: "第 27 章 性能监控与慢查询",
    content: `# 第 27 章 性能监控与慢查询

Redis 单线程模型下，**一个慢命令能拖垮整个实例**。监控和排查慢查询是 Redis 运维的核心技能。本章讲透 SLOWLOG、INFO、MEMORY USAGE、LATENCY、客户端监控、BigKey 排查等关键工具。

## 27.1 SLOWLOG

**SLOWLOG** 记录执行时间超过阈值的命令，是排查慢查询的第一工具。

### 配置

\`\`\`conf
# 慢查询阈值（微秒，默认 10000 = 10ms）
slowlog-log-slower-than 10000

# 慢查询日志最大长度（默认 128）
slowlog-max-len 128

# 记录所有命令（debug 用，慎用）
slowlog-log-slower-than 0

# 关闭慢日志
slowlog-log-slower-than -1
\`\`\`

\`\`\`bash
# 运行时修改
127.0.0.1:6379> CONFIG SET slowlog-log-slower-than 5000   # 5ms
127.0.0.1:6379> CONFIG SET slowlog-max-len 1024
\`\`\`

### 查看慢日志

\`\`\`bash
# 查看最近 10 条
127.0.0.1:6379> SLOWLOG GET 10
1) 1) (integer) 14          # 日志 ID
   2) (integer) 1609456789  # 时间戳
   3) (integer) 51234       # 耗时（微秒）= 51ms
   4) 1) "KEYS"             # 命令
      2) "*"
   5) "127.0.0.1:54321"     # 客户端
   6) "worker-1"            # 客户端名称

# 查看总数
127.0.0.1:6379> SLOWLOG LEN
(integer) 14

# 清空
127.0.0.1:6379> SLOWLOG RESET
\`\`\`

### 常见慢命令

| 命令 | 时间复杂度 | 危险等级 |
| --- | --- | --- |
| \`KEYS *\` | O(N) | 🔴 极危险，禁止生产用 |
| \`SMEMBERS\` 大 Set | O(N) | 🔴 |
| \`HGETALL\` 大 Hash | O(N) | 🔴 |
| \`LRANGE 0 -1\` 长 List | O(N) | 🟡 |
| \`ZRANGE 0 -1\` 大 ZSet | O(N) | 🟡 |
| \`SORT\` | O(N+M*logM) | 🔴 |
| \`FLUSHALL\` | O(N) | 🔴 |
| \`DEBUG SLEEP\` | 阻塞 | 🔴 |
| \`MULTI/EXEC\` 大事务 | 阻塞 | 🟡 |

> **生产铁律**：禁用 KEYS *，用 SCAN 替代；大集合操作要分页或后台跑。

### SCAN 替代 KEYS

\`\`\`bash
# KEYS 阻塞整个 Redis
KEYS user:*

# SCAN 非阻塞，游标分页
SCAN 0 MATCH user:* COUNT 100
# 返回 [新游标, 匹配的 key 列表]

# 继续扫
SCAN <新游标> MATCH user:* COUNT 100
# 直到游标返回 0
\`\`\`

\`\`\`javascript
// Node.js 完整扫描
async function scanAll(pattern) {
  let cursor = "0";
  const keys = [];
  do {
    const [next, batch] = await redis.scan(
      cursor, "MATCH", pattern, "COUNT", 100
    );
    cursor = next;
    keys.push(...batch);
  } while (cursor !== "0");
  return keys;
}
\`\`\`

> **SCAN 的注意点**：
> - 不保证不重复（可能返回已扫过的 key，业务层去重）
> - 游标返回 0 才算扫完
> - COUNT 只是建议值，实际返回数可能多或少
> - 大量 key 时多次 SCAN，避免一次拿太多

## 27.2 INFO 命令

\`INFO\` 命令是 Redis 的"体检报告"，分多个模块。

\`\`\`bash
# 全部信息
127.0.0.1:6379> INFO

# 只看某部分
127.0.0.1:6379> INFO server      # 服务器信息
127.0.0.1:6379> INFO clients    # 客户端
127.0.0.1:6379> INFO memory     # 内存
127.0.0.1:6379> INFO persistence # 持久化
127.0.0.1:6379> INFO stats      # 统计
127.0.0.1:6379> INFO replication # 复制
127.0.0.1:6379> INFO cpu        # CPU
127.0.0.1:6379> INFO commandstats # 命令统计
\`\`\`

### 关键指标

\`\`\`bash
# Server
redis_version:7.0.0
uptime_in_seconds:86400      # 运行时间
run_id:abc...

# Clients
connected_clients:100        # 当前连接数
blocked_clients:0            # 阻塞的客户端（BLPOP 等）
tracking_clients:0           # 客户端缓存跟踪

# Memory
used_memory:1073741824
used_memory_peak:1207959552
mem_fragmentation_ratio:1.40
maxmemory:2147483648

# Stats
total_connections_received:10000   # 历史总连接数
total_commands_processed:1000000   # 历史总命令数
instantaneous_ops_per_sec:5000     # 当前 QPS
rejected_connections:0             # 被拒连接（超过 maxclients）
sync_full:0                        # 全量同步次数
sync_partial_ok:0                  # 增量同步成功
sync_partial_err:0                 # 增量同步失败
expired_keys:1000                  # 过期 key 数
evicted_keys:0                     # 淘汰 key 数
keyspace_hits:800000               # 命中
keyspace_misses:200000             # 未命中
pubsub_channels:0
pubsub_patterns:0

# Replication
role:master
connected_slaves:2
master_repl_offset:10240
\`\`\`

### 命中率计算

\`\`\`text
命中率 = keyspace_hits / (keyspace_hits + keyspace_misses)
\`\`\`

> **健康标准**：缓存场景命中率应 > 90%，低于 80% 要排查（TTL 太短、key 设计不合理、缓存容量不够）。

### 命令统计

\`\`\`bash
127.0.0.1:6379> INFO commandstats
# Commandstats
cmdstat_get:calls=500000,usec=2000000,usec_per_call=4.00,rejected_calls=0,failed_calls=0
cmdstat_set:calls=200000,usec=1000000,usec_per_call=5.00,...
cmdstat_keys:calls=2,usec=50000,usec_per_call=25000.00,...   # ← 找到元凶！
\`\`\`

可以看到每个命令的调用次数、总耗时、平均耗时。**usec_per_call 高的命令是性能瓶颈**。

## 27.3 MEMORY USAGE

\`\`\`bash
# 单个 key 的内存占用（字节）
127.0.0.1:6379> MEMORY USAGE user:1001
(integer) 56

# 采样数（默认 5）
127.0.0.1:6379> MEMORY USAGE biglist SAMPLES 10
(integer) 1024000
\`\`\`

### 找出大 key

\`\`\`bash
# 方法 1：redis-cli 自带工具
redis-cli --bigkeys
# 扫描整个 db，按类型给出最大的几个 key

# 方法 2：用 SCAN + MEMORY USAGE（业务层实现）
redis-cli --scan | while read key; do
  size=$(redis-cli MEMORY USAGE "$key")
  echo "$size $key"
done | sort -rn | head -20

# 方法 3：redis-cli --memkeys（Redis 7.4+）
redis-cli --memkeys
\`\`\`

### --bigkeys 输出示例

\`\`\`bash
$ redis-cli --bigkeys

# Scanning the entire keyspace to find biggest keys as well as
# average sizes per key type.  You can use -i 0.1 to sleep 0.1 sec
# per 100 SCAN commands (not usually needed).

[00.00%] Biggest string   found so far 'session:abc' with 1024 bytes
[00.00%] Biggest list     found so far 'queue:order' with 10000 items
...

-------- summary -------

Sampled 10000 keys in the keyspace!
Total key length in bytes is 100000 (avg len 10.00)

Biggest   list found 'queue:order' has 10000 items
Biggest string found 'session:abc' has 1024 bytes

0 lists with 0 items (00.00% of keys, avg 0.00 items per list)
0 hashs with 0 fields (00.00% of keys, avg 0.00 fields per hash)
5000 strings with 512 bytes (50.00% of keys, avg size 512.00)
5000 zsets with 100 members (50.00% of keys, avg 100.00 members)
\`\`\`

> **注意**：\`--bigkeys\` 用 SCAN 实现，不阻塞，但可能漏掉一些 key（SCAN 不保证完整）。生产建议每周扫一次。

## 27.4 LATENCY 监控

**LATENCY** 是 Redis 的事件延迟监控框架，记录关键事件（fork、AOF 写盘、过期等）的耗时。

### 配置阈值

\`\`\`conf
# 延迟阈值（毫秒，默认 100）
latency-monitor-threshold 100
\`\`\`

### 查看

\`\`\`bash
127.0.0.1:6379> CONFIG SET latency-monitor-threshold 50   # 50ms

# 触发一些事件后查看
127.0.0.1:6379> LATENCY LATEST
1) 1) "fork"
   2) (integer) 1609456789   # 时间戳
   3) (integer) 200          # 本次延迟（ms）
   4) (integer) 300          # 历史最大延迟（ms）
2) 1) "aof-fsync-always"
   2) ...
3) 1) "expire-cycle"
   2) ...

# 查看历史事件
127.0.0.1:6379> LATENCY HISTORY fork

# 重置
127.0.0.1:6379> LATENCY RESET
\`\`\`

### 关键事件

| 事件 | 含义 |
| --- | --- |
| \`fork\` | 创建子进程（RDB/AOF 重写）耗时 |
| \`aof-write\` | AOF 写盘 |
| \`aof-fsync-always\` | AOF fsync（appendfsync always） |
| \`expire-cycle\` | 主动过期 key |
| \`unlink\` | 异步删除大 key |
| \`command\` | 命令阻塞 |

## 27.5 客户端连接监控

\`\`\`bash
# 当前所有客户端
127.0.0.1:6379> CLIENT LIST
id=1 addr=127.0.0.1:54321 laddr=127.0.0.1:6379 fd=8 name= age=3600 idle=0 flags=N db=0 sub=0 psub=0 ssub=0 multi=-1 qbuf=0 qbuf-free=0 argv-mem=0 multi-mem=0 rbs=1024 rbp=0 obl=0 oll=0 omem=0 tot-mem=2056 events=r cmd=get user=default redir=-1 resp=2 lib-name= lib-ver=

# 字段含义：
# id: 客户端 ID
# addr: 客户端地址
# age: 连接时长（秒）
# idle: 空闲时长（秒）
# db: 当前 db
# qbuf/qbuf-free: 输入缓冲区
# obl/oll/omem: 输出缓冲区
# cmd: 最后执行的命令
# tot-mem: 该客户端总内存
\`\`\`

### 找出问题客户端

\`\`\`bash
# 找出长时间空闲的连接（可能漏关闭）
redis-cli CLIENT LIST | awk '$6 > 300 {print}'  # idle > 300s

# 找出占用内存大的客户端
redis-cli CLIENT LIST | sort -k <tot-mem 字段> -rn | head

# 找出特定 IP 的客户端
redis-cli CLIENT LIST | grep 192.168.1
\`\`\`

### 杀掉客户端

\`\`\`bash
# 按 ID 杀
127.0.0.1:6379> CLIENT KILL ID 5

# 按 addr 杀
127.0.0.1:6379> CLIENT KILL ADDR 127.0.0.1:54321

# 按类型杀
127.0.0.1:6379> CLIENT KILL TYPE normal
127.0.0.1:6379> CLIENT KILL TYPE pubsub

# 杀掉除当前外所有
127.0.0.1:6379> CLIENT KILL SKIPME no
\`\`\`

### 客户端数量限制

\`\`\`conf
# 最大客户端数（默认 10000）
maxclients 10000

# 超过会拒绝新连接：
# "ERR max number of clients reached"
\`\`\`

\`\`\`bash
# 查看当前连接数
127.0.0.1:6379> INFO clients
connected_clients:50
blocked_clients:2

# 拒绝过的连接数
127.0.0.1:6379> INFO stats | grep rejected
rejected_connections:0
\`\`\`

## 27.6 BigKey 排查

### 什么是 BigKey

| 类型 | BigKey 阈值（参考） |
| --- | --- |
| String | value > 10KB |
| Hash | 字段数 > 500 或 总大小 > 1MB |
| List | 元素数 > 1000 或 总大小 > 1MB |
| Set | 元素数 > 1000 |
| ZSet | 元素数 > 1000 |

### BigKey 的危害

1. **网络阻塞**：单条命令传几十 MB，占满带宽
2. **删除阻塞**：DEL 大 key 同步删除，阻塞几秒
3. **持久化卡顿**：fork 时复制大 key 慢
4. **集群迁移慢**：MIGRATE 单个元素慢
5. **内存倾斜**：Cluster 下单节点内存不均

### 排查方法

\`\`\`bash
# 方法 1：--bigkeys（已介绍）
redis-cli --bigkeys

# 方法 2：--memkeys（Redis 7.4+）
redis-cli --memkeys

# 方法 3：手动扫描 + MEMORY USAGE
redis-cli --scan --pattern "*" | while read key; do
  size=$(redis-cli MEMORY USAGE "$key" 2>/dev/null)
  if [ "$size" -gt 10240 ]; then
    echo "$size $key"
  fi
done | sort -rn | head -50

# 方法 4：看各类型的长度
redis-cli --scan | while read key; do
  type=$(redis-cli TYPE "$key")
  case $type in
    list) len=$(redis-cli LLEN "$key") ;;
    hash) len=$(redis-cli HLEN "$key") ;;
    set)  len=$(redis-cli SCARD "$key") ;;
    zset) len=$(redis-cli ZCARD "$key") ;;
    *)    len=0 ;;
  esac
  echo "$len $type $key"
done | sort -rn | head
\`\`\`

### 治理 BigKey

**拆分**：

\`\`\`bash
# 原：一个大 Hash
HSET user:1001:log <百万字段>

# 拆：按日期/类型分
HSET user:1001:log:20240101 <少量字段>
HSET user:1001:log:20240102 <少量字段>
\`\`\`

**删除**：

\`\`\`bash
# 同步删除（阻塞，慎用）
DEL bigkey

# 异步删除（推荐）
UNLINK bigkey

# 大 Hash 渐进式删除
HSCAN bigkey 0 COUNT 100  # 拿到一批
HDEL bigkey <field1> <field2> ...
# 重复直到清空
DEL bigkey
\`\`\`

**过期**：

\`\`\`bash
# 给 BigKey 设过期，让它自然清理
EXPIRE bigkey 86400
\`\`\`

> **预防**：业务设计阶段就避免 BigKey。比如用户日志按天分 key，不要堆在一个 key 里。

## 27.7 踩坑提示

> **坑 1：SLOWLOG 阈值设太大**。默认 10ms 可能漏掉很多问题。生产建议 1-5ms。

> **坑 2：SLOWLOG 满了覆盖老记录**。默认 128 条太少，重要慢查询被覆盖。调到 1024+。

> **坑 3：用 KEYS 排查问题**。本想找几个 key，结果 KEYS * 阻塞几秒，雪上加霜。永远用 SCAN。

> **坑 4：监控只看 QPS 不看延迟**。QPS 5000 看着正常，但 P99 可能已经 100ms。监控要看 \`instantaneous_ops_per_sec\` + 延迟。

> **坑 5：CLIENT LIST 不看 idle**。一堆 idle=3600 的僵尸连接占着连接池，浪费资源。定期清理。

> **坑 6：删 BigKey 用 DEL**。阻塞几秒，业务雪崩。用 \`UNLINK\`。

> **坑 7：MEMORY USAGE 采样不准**。大集合采样 5 个元素估算，可能误差大。调大 SAMPLES。

## 27.8 本章小结

- **SLOWLOG**：慢查询日志，阈值 \`slowlog-log-slower-than\`，生产设 1-5ms
- **KEYS 禁用**，用 SCAN 替代，非阻塞游标扫描
- **INFO**：分模块查看，关注 QPS、命中率、连接数、内存、同步状态
- **MEMORY USAGE**：单 key 内存，配合 SCAN 找 BigKey；\`--bigkeys\` 一键扫描
- **LATENCY**：事件级延迟监控，看 fork、AOF、过期等耗时
- **CLIENT LIST**：监控连接，定期清理 idle 连接，限制 \`maxclients\`
- **BigKey 治理**：拆分 + \`UNLINK\` 异步删除 + 设过期
- 监控指标：QPS、命中率、内存、连接数、慢查询数、延迟 P99`
  },
  {
    id: "redis-ch28",
    group: "第六部分 性能优化与运维实战",
    icon: "🛠️",
   title: "第 28 章 运维实战与安全",
    content: `# 第 28 章 运维实战与安全

经过前 27 章的学习，你已经掌握了 Redis 的开发能力。最后一章讲**生产运维**：怎么部署、怎么调优配置、怎么备份恢复、怎么保证安全、怎么升级、出故障怎么排查。这是把 Redis 用到生产的关键一课。

## 28.1 部署最佳实践

### 单机部署 vs 集群部署

| 场景 | 推荐方案 |
| --- | --- |
| 开发/测试 | 单机 |
| 小业务（< 10GB，QPS < 1万） | 主从 + Sentinel |
| 中业务（< 50GB，QPS < 10万） | Cluster 3 主 3 从 |
| 大业务（> 50GB，QPS > 10万） | Cluster 多分片 + 多 IDC |

### Linux 系统调优

\`\`\`bash
# 1. 关闭 THP（透明大页），避免 fork 慢
echo never > /sys/kernel/mm/transparent_hugepage/enabled

# 2. 调高文件描述符
ulimit -n 65535
# /etc/security/limits.conf:
# redis soft nofile 65535
# redis hard nofile 65535

# 3. 调高 somaxconn
echo 1024 > /proc/sys/net/core/somaxconn

# 4. 关闭 swap（或调低 swappiness）
echo 0 > /proc/sys/vm/swappiness

# 5. 网络参数
echo 1 > /proc/sys/net/ipv4/tcp_tw_reuse
\`\`\`

### 部署在容器里？

- **单实例可以**：注意内存限制 \`--maxmemory\`，预留 fork 开销
- **集群慎用**：网络延迟、端口暴露、volume 持久化都有坑
- **K8s**：用 StatefulSet + 持久化卷，配合 Redis Operator

### 部署清单

- [ ] Redis 版本：用稳定版（如 7.0.x），不用最新版
- [ ] 监控：Prometheus + redis_exporter
- [ ] 日志：logfile 配置，按天切割
- [ ] 持久化：AOF + RDB 混合
- [ ] 备份：每天全量备份到对象存储
- [ ] 高可用：Sentinel 或 Cluster
- [ ] 安全：密码 + ACL + 网络隔离
- [ ] 客户端：连接池 + 超时 + 重试

## 28.2 配置文件调优

### redis.conf 关键配置

\`\`\`conf
# 网络
bind 0.0.0.0              # 监听地址，生产只开放内网
protected-mode yes        # 保护模式
port 6379
tcp-backlog 511           # TCP 连接队列
tcp-keepalive 300         # TCP keepalive

# 通用
daemonize yes             # 后台运行
pidfile /var/run/redis.pid
logfile /var/log/redis/redis.log
databases 16              # db 数量

# 内存
maxmemory 2gb             # 内存上限
maxmemory-policy allkeys-lru   # 淘汰策略
maxmemory-samples 5       # 采样精度

# 持久化 - RDB
save 900 1                # 15 分钟内 1 个修改
save 300 10               # 5 分钟内 10 个修改
save 60 10000             # 1 分钟内 1 万个修改
dbfilename dump.rdb
dir /var/redis/data
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes

# 持久化 - AOF
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec      # 每秒 fsync
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100   # AOF 比上次大 100% 触发重写
auto-aof-rewrite-min-size 64mb    # AOF 最小重写大小
aof-load-truncated yes

# 复制
repl-backlog-size 256mb
repl-timeout 60
repl-disable-tcp-nodelay no

# 客户端
maxclients 10000
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60

# 慢查询
slowlog-log-slower-than 5000   # 5ms
slowlog-max-len 1024

# 延迟监控
latency-monitor-threshold 100

# 懒删除
lazyfree-lazy-eviction yes
lazyfree-lazy-expire yes
lazyfree-lazy-server-del yes
lazyfree-lazy-user-del yes
lazyfree-lazy-user-flush yes

# Lua
lua-time-limit 5000

# 安全
requirepass your_strong_password
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command KEYS ""
\`\`\`

### 淘汰策略选择

\`\`\`conf
# allkeys-*：所有 key 都参与淘汰
maxmemory-policy allkeys-lru      # 缓存场景（推荐）
maxmemory-policy allkeys-lfu      # 缓存场景，按访问频率
maxmemory-policy allkeys-random   # 无差别随机

# volatile-*：只淘汰设了 TTL 的 key
maxmemory-policy volatile-lru     # 数据库场景，保留持久数据
maxmemory-policy volatile-ttl     # 优先淘汰快过期的

# 不淘汰
maxmemory-policy noeviction       # 写满就报错（数据库场景）
\`\`\`

| 场景 | 推荐 |
| --- | --- |
| 纯缓存 | allkeys-lru |
| 数据库 + 缓存混合 | volatile-lru |
| 强一致数据库 | noeviction |

## 28.3 备份与恢复

### RDB 备份

\`\`\`bash
# 手动触发 BGSAVE
127.0.0.1:6379> BGSAVE
Background saving started

# 查看最后保存时间
127.0.0.1:6379> LASTSAVE
(integer) 1609456789

# 复制 dump.rdb 到备份位置
cp /var/redis/data/dump.rdb /backup/dump-$(date +%Y%m%d).rdb

# 定时备份（crontab）
0 3 * * * redis-cli BGSAVE && sleep 60 && cp /var/redis/data/dump.rdb /backup/dump-$(date +\\%Y\\%m\\%d).rdb
\`\`\`

### AOF 备份

\`\`\`bash
# 触发 AOF 重写（压缩）
127.0.0.1:6379> BGREWRITEAOF

# 复制 appendonly.aof
cp /var/redis/data/appendonly.aof /backup/appendonly-$(date +%Y%m%d).aof
\`\`\`

### 恢复

**从 RDB 恢复**：

\`\`\`bash
# 1. 停止 Redis
redis-cli SHUTDOWN

# 2. 替换 dump.rdb
cp /backup/dump-20240101.rdb /var/redis/data/dump.rdb

# 3. 启动 Redis（自动加载）
redis-server /etc/redis/redis.conf

# 4. 验证
redis-cli DBSIZE
\`\`\`

**从 AOF 恢复**：

\`\`\`bash
# 1. 停止 Redis
# 2. 替换 appendonly.aof
cp /backup/appendonly-20240101.aof /var/redis/data/appendonly.aof
# 3. 启动 Redis

# 如果 AOF 损坏，修复
redis-check-aof --fix /var/redis/data/appendonly.aof
\`\`\`

**从 RDB + AOF 混合恢复**：

\`\`\`conf
# 开启混合持久化（Redis 4.0+）
aof-use-rdb-preamble yes
# AOF 文件前半部分是 RDB 格式，后半是增量命令
\`\`\`

### 异地备份

\`\`\`bash
# 上传到 S3
aws s3 cp /backup/dump-20240101.rdb s3://my-bucket/redis-backup/

# 上传到 OSS（阿里云）
ossutil cp /backup/dump-20240101.rdb oss://my-bucket/redis-backup/
\`\`\`

> **备份策略**：
> - 每天 1 次全量备份（RDB），保留 7 天
> - 每小时 1 次增量（AOF），保留 24 小时
> - 异地备份，防机房故障
> - 定期演练恢复（半年 1 次）

### POINT IN TIME 恢复

利用主从复制实现"回到过去"：

\`\`\`bash
# 1. 准备一个空 Redis 实例
# 2. 把它配成"出问题前备份"的从
redis-server --port 6380 --replicaof 127.0.0.1 6379
# 3. 停止主从同步
redis-cli -p 6380 REPLICAOF NO ONE
# 4. 现在 6380 上是历史数据
\`\`\`

## 28.4 安全（密码/ACL/网络隔离）

### 密码

\`\`\`conf
# 设置密码
requirepass YourStrongPassword123!

# 从节点也要配主节点密码
masterauth YourStrongPassword123!
\`\`\`

\`\`\`bash
# 客户端连接
redis-cli -a YourStrongPassword123!
# 或
redis-cli
127.0.0.1:6379> AUTH YourStrongPassword123!
OK
\`\`\`

> **密码强度**：至少 16 位，含大小写数字符号。Redis 密码爆破工具很多，弱密码一秒被攻破。

### ACL（Redis 6.0+）

Redis 6.0 引入 ACL，可以按用户分配权限。

\`\`\`bash
# 查看当前用户
127.0.0.1:6379> ACL WHOAMI
"default"

# 查看所有用户
127.0.0.1:6379> ACL LIST
1) "user default on nopass ~* &* +@all"

# 创建只读用户
127.0.0.1:6379> ACL SETUSER readonly on >password123 ~* &* +@read +@connection
OK

# 创建只能访问 cache:* 的用户
127.0.0.1:6379> ACL SETUSER cache_user on >pass ~cache:* &* +@write +@read +@connection
OK

# 查看用户详情
127.0.0.1:6379> ACL GETUSER readonly
1) "flags"
2) 1) "on"
3) "passwords"
4) 1) "..."
5) "commands"
6) "-@all +@read +@connection"
7) "keys"
8) 1) "~*"
9) "channels"
10) 1) "&*"

# 删除用户
127.0.0.1:6379> ACL DELUSER readonly
\`\`\`

### ACL 命令分类

\`\`\`bash
# 查看所有命令分类
127.0.0.1:6379> ACL CAT
1) "keyspace"
2) "read"
3) "write"
4) "set"
5) "sortedset"
...

# 查看 read 分类下的命令
127.0.0.1:6379> ACL CAT read
1) "get"
2) "mget"
3) "exists"
...
\`\`\`

ACL 语法：

- \`+@all\`：所有命令
- \`+@read\`：read 分类
- \`-@dangerous\`：禁止 dangerous 分类（FLUSHALL、KEYS 等）
- \`+get\`：允许 GET
- \`-set\`：禁止 SET
- \`~cache:*\`：只能访问 \`cache:\` 开头的 key
- \`&channel:*\`：只能订阅 \`channel:\` 开头的频道

### ACL 持久化

\`\`\`conf
# ACL 配置文件
aclfile /etc/redis/users.acl
\`\`\`

\`\`\`bash
# 保存当前 ACL 到文件
127.0.0.1:6379> ACL SAVE
OK
\`\`\`

### 网络隔离

\`\`\`conf
# 只监听内网
bind 10.0.0.5 127.0.0.1

# 保护模式（无密码时只允许本地访问）
protected-mode yes
\`\`\`

**生产网络架构**：

\`\`\`text
公网 ──▶ 防火墙 ──▶ 负载均衡 ──▶ 应用服务器
                                   │
                                   ▼
                              Redis（只在内网）
\`\`\`

- Redis **不暴露公网**
- 应用服务器和 Redis 在同一 VPC
- 安全组只放行应用服务器到 Redis 的 6379 端口

### 危险命令禁用

\`\`\`conf
# 禁用危险命令
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command KEYS ""
rename-command CONFIG ""        # 慎用，影响运维
rename-command DEBUG ""
\`\`\`

> **注意**：rename-command 在 Cluster 里要所有节点一致配置。

### TLS 加密（Redis 6.0+）

\`\`\`conf
# 开启 TLS
port 0                       # 关闭明文端口
tls-port 6379
tls-cert-file /etc/redis/redis.crt
tls-key-file /etc/redis/redis.key
tls-ca-cert-file /etc/redis/ca.crt
tls-auth-clients yes         # 客户端也要证书
\`\`\`

## 28.5 升级策略

### 升级前准备

1. **备份**：升级前必须完整备份（RDB + AOF）
2. **看 Release Notes**：特别是 BREAKING CHANGES
3. **测试环境验证**：先在测试环境跑一周
4. **准备回滚**：保留老版本二进制和配置

### 单机升级

\`\`\`bash
# 1. 停止
redis-cli SHUTDOWN

# 2. 替换二进制
cp /opt/redis-7.0/src/redis-server /usr/local/bin/

# 3. 启动
redis-server /etc/redis/redis.conf

# 4. 验证
redis-cli INFO server | grep redis_version
redis-cli DBSIZE
\`\`\`

### 主从滚动升级

\`\`\`bash
# 1. 先升级从节点
redis-cli -p 6380 SHUTDOWN
# 替换二进制
redis-server /etc/redis/redis-6380.conf

# 2. 等从节点追上主
redis-cli -p 6380 INFO replication | grep master_link_status
# up 即同步完成

# 3. 切主（在从上执行）
redis-cli -p 6380 REPLICAOF NO ONE
# 或用 Sentinel 故障转移

# 4. 升级老主
redis-cli -p 6379 SHUTDOWN
# 替换二进制
redis-server /etc/redis/redis-6379.conf

# 5. 把老主配成新主的从
redis-cli -p 6379 REPLICAOF 127.0.0.1 6380
\`\`\`

### Cluster 滚动升级

\`\`\`bash
# 一个节点一个节点升级，每升级一个等集群稳定
# 1. 升级 replica
# 2. 手动 failover，让 replica 变 master
redis-cli -p <replica> CLUSTER FAILOVER
# 3. 升级老 master（现在是 replica）
# 4. 重复，直到所有节点升级完
\`\`\`

> **升级窗口**：低峰期，业务容忍几秒切换。Cluster 滚动升级理论上零停机。

### 版本升级路径

- **小版本**（7.0.5 → 7.0.8）：直接升级，兼容
- **大版本**（6.x → 7.x）：仔细看 Release Notes，可能有破坏性变更
  - Redis 7.0：listpack 替代 ziplist，AOF 格式变化
  - Redis 6.0：ACL、SSL、RESP3
  - Redis 5.0：Stream 引入

## 28.6 常见故障与排查

### 故障 1：内存满了

**现象**：\`OOM command not allowed when used memory > 'maxmemory'\`

**排查**：

\`\`\`bash
127.0.0.1:6379> INFO memory
used_memory:2147483648     # 已经到 maxmemory
maxmemory:2147483648

# 看是哪些 key 占用
redis-cli --bigkeys
\`\`\`

**处理**：
1. 临时调大 maxmemory
2. 删除不用的 key（\`UNLINK\` 大 key）
3. 设置合理的淘汰策略
4. 扩容

### 故障 2：延迟突然变大

**排查**：

\`\`\`bash
# 1. 慢查询
127.0.0.1:6379> SLOWLOG GET 10

# 2. 延迟事件
127.0.0.1:6379> LATENCY LATEST

# 3. 看 fork 是否慢
127.0.0.1:6379> INFO stats | grep latest_fork_usec
latest_fork_usec:200000   # 200ms，正常
# 如果是 2000000（2 秒），就有问题

# 4. 看 AOF fsync
127.0.0.1:6379> INFO persistence | grep aof
\`\`\`

**常见原因**：
- KEYS * 等慢命令
- BigKey 操作（DEL、HGETALL）
- fork 慢（大内存实例）
- AOF fsync 阻塞（磁盘慢）
- 网络问题

### 故障 3：连接被拒

\`\`\`bash
# 现象：客户端报 "max number of clients reached"

127.0.0.1:6379> INFO clients
connected_clients:10000   # 到 maxclients 上限

# 看哪些客户端占着
127.0.0.1:6379> CLIENT LIST
\`\`\`

**处理**：
1. 杀掉僵尸连接（idle 时间长的）
2. 调大 maxclients
3. 排查客户端连接泄漏

### 故障 4：主从同步断开

\`\`\`bash
127.0.0.1:6379> INFO replication
connected_slaves:0    # 从节点掉线

# 在从节点看
127.0.0.1:6380> INFO replication
master_link_status:down
master_last_io_seconds_ago:300   # 5 分钟没通信
\`\`\`

**原因**：网络断开、主节点密码变了、主节点 maxclients 满

**处理**：
\`\`\`bash
# 重新同步
redis-cli -p 6380 REPLICAOF 127.0.0.1 6379
\`\`\`

### 故障 5：Cluster 状态异常

\`\`\`bash
127.0.0.1:7000> CLUSTER INFO
cluster_state:fail            # 不是 ok
cluster_slots_assigned:16384
cluster_slots_ok:12288        # 4096 个 slot 不在线
cluster_slots_fail:4096
\`\`\`

**原因**：某 master 和它的 replica 都挂了，对应 slot 不可用

**处理**：
1. 重启挂掉的节点
2. 如果数据丢了，从备份恢复
3. 紧急情况可以手动分配 slot：\`CLUSTER SETSLOT\`

### 故障 6：持久化失败

\`\`\`bash
127.0.0.1:6379> INFO persistence
rdb_last_bgsave_status:err
rdb_last_bgsave_time_sec:120
aof_last_bgrewrite_status:err
aof_last_write_status:err
\`\`\`

**原因**：磁盘满、磁盘故障、权限问题

**处理**：
1. \`df -h\` 看磁盘
2. \`dmesg | tail\` 看系统日志
3. 清理磁盘空间
4. 修复权限
5. 重启 Redis

### 故障 7：CPU 100%

**排查**：

\`\`\`bash
# 1. 看 QPS 是否暴涨
127.0.0.1:6379> INFO stats | grep instantaneous_ops_per_sec

# 2. 看是否有大 Lua 脚本运行
127.0.0.1:6379> INFO commandstats | grep eval

# 3. 看是否 activedefrag 在跑
127.0.0.1:6379> INFO memory | grep active_defrag

# 4. 看 bgsave 是否在跑
127.0.0.1:6379> INFO persistence | grep rdb_bgsave_in_progress
\`\`\`

**处理**：等 bgsave 完成，或停掉 activedefrag，或优化 Lua

### 故障排查清单

1. **现象**：什么报错？什么时间开始？
2. **INFO**：看 server/memory/clients/stats/persistence/replication
3. **SLOWLOG**：找慢命令
4. **LATENCY**：找延迟事件
5. **CLIENT LIST**：看连接
6. **日志**：redis.log + 系统日志
7. **监控**：Prometheus 历史曲线

## 28.7 总结与学习路径

### 本书回顾

\`\`\`text
第一部分：入门与基础
  - 安装、数据结构（5+1 种）、key 管理

第二部分：持久化与过期
  - RDB、AOF、混合持久化、过期策略、淘汰策略

第三部分：进阶特性
  - 事务、Lua、Pipeline、Pub/Sub、Stream、模块

第四部分：高可用架构
  - 主从复制、Sentinel、Cluster、扩缩容、客户端

第五部分：应用场景实战
  - 缓存模式、分布式锁、限流、消息队列、排行榜、社交

第六部分：性能优化与运维
  - 内存优化、监控、慢查询、运维、安全
\`\`\`

### 进阶学习路径

1. **深入源码**：读 Redis 源码（C 语言），理解数据结构实现
   - 推荐《Redis 设计与实现》（黄健宏）
   - GitHub: antirez/redis

2. **模块开发**：用 C 写 Redis 模块，扩展功能
   - RedisModule SDK
   - 例子：RedisJSON、RediSearch、RedisBloom

3. **新版本特性**：跟踪 Redis 7.x、8.x
   - RESP3 协议
   - 多线程 IO
   - 函数（Functions）替代 Lua
   - ACL 增强

4. **替代方案**：
   - **KeyDB**：多线程 Redis 兼容
   - **Dragonfly**：兼容 Redis 协议，多线程性能强
   - **Valkey**：Linux 基金会的 Redis 分支

5. **生态工具**：
   - **redis_exporter**：Prometheus 监控
   - **RedisInsight**：官方 GUI
   - **Redisson**：Java 客户端王者
   - **Twemproxy / Codis**：代理层（历史方案）

### 实战建议

- **小步快跑**：先在测试环境跑通，再上生产
- **监控先行**：上线前先建好监控（QPS、内存、延迟、慢查询）
- **预案演练**：定期演练故障转移、备份恢复
- **持续学习**：Redis 版本迭代快，关注新特性

## 28.8 本章小结

- **部署**：单机/主从/Cluster 按规模选，Linux 调优（THP、ulimit、swap）
- **配置**：maxmemory + 淘汰策略、持久化、慢查询、懒删除、安全
- **备份**：RDB + AOF 混合，每日全量 + 异地备份，定期演练恢复
- **安全**：强密码、ACL 按用户授权、网络隔离、禁危险命令、TLS
- **升级**：滚动升级，先 replica 后 master，备份兜底
- **故障排查**：INFO + SLOWLOG + LATENCY + 日志 + 监控
- **学习路径**：源码 → 模块 → 新版本 → 替代方案 → 生态工具

恭喜你读完了《Redis 实战教程》！把书里的知识用到生产实践中，多踩坑多总结，你就是团队的 Redis 专家了。`
  }
];

export { chapters };
