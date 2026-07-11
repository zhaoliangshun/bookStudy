// =============================================================
// 《Redis 实战教程》- 章节批次 6
// -------------------------------------------------------------
// 内容：第六部分 性能优化与运维实战（第 26-28 章）
// =============================================================

const chapters = [
  {
    id: "redis-ch26",
    group: "第六部分 性能优化与运维实战",
    icon: "⚡",
    title: "第 26 章 内存优化",
    content: `# 第 26 章 内存优化

Redis 是内存数据库，**内存就是生命**。同样一份业务数据，存得不好可能占 10GB，优化后只占 1GB——不仅省钱，还能减少 fork、RDB 持久化、主从同步的开销。本章讲透 Redis 的内存结构、对象编码、碎片治理和省内存技巧，让你在生产中把每一兆内存都用在刀刃上。

## 26.1 Redis 进程内存组成

要优化内存，先得搞清楚 Redis 进程的内存都被谁占了。

### 内存结构总览

\`\`\`text
┌─────────────────────────────────────┐
│ Redis 进程内存                       │
├─────────────────────────────────────┤
│ 1. 自身代码 + 共享库                 │ 几 MB（固定）
│ 2. 客户端连接 buffer                 │ 每连接若干 KB
│ 3. 数据集（dict/ziplist/skiplist）   │ 主要占用（80%+）
│ 4. AOF buffer / 重写 buffer          │ 写多时较大
│ 5. 复制 backlog                       │ 默认 1MB
│ 6. 内存碎片                           │ 可能 1-2 倍
└─────────────────────────────────────┘
\`\`\`

> **关键认知**：优化重点在第 3 项（数据集）和第 6 项（碎片），它们是可控的。

### INFO memory 详解

\`INFO memory\` 是查看内存状态的核心命令：

\`\`\`bash
127.0.0.1:6379> INFO memory
# Memory
used_memory:1073741824           # Redis 分配器分配的内存（数据集 + buffer）
used_memory_human:1.00G
used_memory_rss:15032385536      # 操作系统视角的进程内存（含碎片）
used_memory_rss_human:14.00G
used_memory_peak:1207959552      # 历史峰值
used_memory_peak_human:1.12G
used_memory_peak_perc:88.89%
used_memory_overhead:173000000   # 开销（客户端 buffer、复制等）
used_memory_startup:1000000      # 启动时占用
used_memory_dataset:900000000    # 实际数据占用
used_memory_dataset_perc:83.82%
allocator_allocated:1070000000   # 分配器实际分配
allocator_active:1100000000      # 分配器活跃内存
allocator_resident:1200000000    # 分配器常驻
total_system_memory:17179869184  # 系统总内存
total_system_memory_human:16.00G
used_memory_lua:37888            # Lua 引擎占用
used_memory_scripts:0
number_of_cached_scripts:0
number_of_functions:0
number_of_libraries:0
maxmemory:2147483648             # 配置的最大内存
maxmemory_human:2.00G
maxmemory_policy:allkeys-lru     # 淘汰策略
allocator_frag_ratio:1.03        # 分配器碎片率
allocator_frag_bytes:30000000
allocator_rss_ratio:1.09
allocator_rss_bytes:100000000
rss_overhead_ratio:1.25          # rss 额外开销
rss_overhead_bytes:3032385536
mem_fragmentation_ratio:1.40     # 进程碎片率 = rss / used
mem_fragmentation_bytes:4300000000
mem_not_counted_for_evict:0
mem_replication_backlog:1048576
mem_clients_slaves:100000
mem_clients_normal:50000
mem_aof_buffer:0
mem_allocator:jemalloc-5.2.1     # 使用的分配器
active_defrag_running:0
lazyfree_pending_objects:0
\`\`\`

### 关键字段解读

| 字段 | 含义 | 关注点 |
| --- | --- | --- |
| \`used_memory\` | Redis 视角分配的内存 | 业务真实占用 |
| \`used_memory_rss\` | OS 视角的内存（含碎片） | 实际吃掉的物理内存 |
| \`mem_fragmentation_ratio\` | 碎片率 = rss / used | 核心监控指标 |
| \`maxmemory\` | 上限，超过触发淘汰 | 必须配置 |
| \`used_memory_dataset\` | 实际数据占用 | 评估数据集大小 |
| \`mem_clients_slaves\` | 从节点连接 buffer | 从节点多时关注 |

### 碎片率健康范围

| 碎片率 | 含义 | 处理建议 |
| --- | --- | --- |
| < 1.0 | **危险**！OS 内存比 Redis 看到的少，可能 swap | 立即排查 swap |
| 1.0 - 1.5 | 健康 | 无需处理 |
| 1.5 - 2.0 | 有碎片，可关注 | 观察，考虑开 activedefrag |
| > 2.0 | **碎片严重** | 开 activedefrag 或重启 |

> **碎片率 < 1 的真相**：通常是操作系统把 Redis 的部分内存换出到 swap 了，这会让 Redis 性能急剧下降（磁盘 IO 比内存慢几个数量级）。发现这种情况要立即关闭 swap 或迁移实例。

## 26.2 对象编码（Object Encoding）

Redis 的 5 种数据结构（String/List/Hash/Set/ZSet）只是"对外接口"，**底层实际编码会根据数据特征自动转换**。理解编码是省内存的核心。

### 查看编码：OBJECT ENCODING

\`\`\`bash
127.0.0.1:6379> SET k1 hello
OK
127.0.0.1:6379> OBJECT ENCODING k1
"embstr"   # 短字符串用 embstr

127.0.0.1:6379> SET k2 12345
OK
127.0.0.1:6379> OBJECT ENCODING k2
"int"      # 数字用 int

127.0.0.1:6379> SET k3 <很长很长的字符串...>
OK
127.0.0.1:6379> OBJECT ENCODING k3
"raw"      # 长字符串用 raw

127.0.0.1:6379> LPUSH list1 a b c
(integer) 3
127.0.0.1:6379> OBJECT ENCODING list1
"listpack"  # Redis 7.0+ 短列表用 listpack

127.0.0.1:6379> LPUSH list2 <很多元素...>
(integer) 200
127.0.0.1:6379> OBJECT ENCODING list2
"quicklist"  # 长列表用 quicklist

127.0.0.1:6379> SADD set1 1 2 3
(integer) 3
127.0.0.1:6379> OBJECT ENCODING set1
"intset"   # 全是数字的小 Set 用 intset

127.0.0.1:6379> HSET h1 a 1 b 2
(integer) 2
127.0.0.1:6379> OBJECT ENCODING h1
"listpack"

127.0.0.1:6379> ZADD z1 1 a 2 b
(integer) 2
127.0.0.1:6379> OBJECT ENCODING z1
"listpack"
\`\`\`

### 各类型的编码对照

| 类型 | 编码 1（省内存） | 编码 2（标准） | 转换条件 |
| --- | --- | --- | --- |
| String | int（纯数字）/ embstr（≤44 字节） | raw | 长度 > 44 字节用 raw |
| List | listpack | quicklist | 元素数 > 128 或单元素 > 64 字节 |
| Hash | listpack | hashtable | 字段数 > 128 或值 > 64 字节 |
| Set | intset / listpack | hashtable | 全整数且数 < 512 用 intset；有字符串小 Set 用 listpack |
| ZSet | listpack | skiplist + hashtable | 元素数 > 128 或单元素 > 64 字节 |

### String 的三种编码

String 是最基础也最容易被忽视的类型，它有三种编码：

\`\`\`bash
# 1. int 编码：纯数字，直接存 long，8 字节
127.0.0.1:6379> SET num 12345
OK
127.0.0.1:6379> OBJECT ENCODING num
"int"
# 内存占用：约 16 字节（dictEntry + key + 8 字节 long）

# 2. embstr 编码：≤44 字节字符串，SDS 和对象连续存储
127.0.0.1:6379> SET short "hello"
OK
127.0.0.1:6379> OBJECT ENCODING short
"embstr"
# embstr 优势：一次内存分配，缓存友好

# 3. raw 编码：>44 字节字符串，SDS 和对象分开存储
127.0.0.1:6379> SET long <超过 44 字节的字符串...>
OK
127.0.0.1:6379> OBJECT ENCODING long
"raw"
# 两次内存分配，效率略低
\`\`\`

> **embstr 的坑**：embstr 是只读的！任何修改命令（APPEND、INCRBY、SETRANGE）都会把它转成 raw。所以频繁修改的字符串别指望 embstr 省内存。

### ziplist / listpack vs hashtable 内存对比

这是省内存的核心知识点。

**hashtable** 存一个 Hash 字段，至少要：

\`\`\`text
dictEntry 结构：24 字节
  ├─ key 指针：8 字节
  ├─ value 指针：8 字节
  └─ next 指针：8 字节
key（SDS）：至少 19 字节（头部 3 + 内容 + \\0）
value（SDS）：至少 19 字节
─────────────────────
合计：约 62 字节 / 字段
\`\`\`

**listpack** 把所有字段紧凑存在一段连续内存：

\`\`\`text
listpack 结构：
  ├─ 总字节数：4 字节
  ├─ 元素数：2 字节
  ├─ 字段1：[长度][key][长度][value]  约 10-20 字节
  ├─ 字段2：[长度][key][长度][value]  约 10-20 字节
  ├─ ...
  └─ 结束符：1 字节
─────────────────────
合计：约 10-20 字节 / 字段
\`\`\`

**实测对比**：存一个有 100 个字段、每个字段 key/value 平均 10 字节的 Hash：

| 编码 | 内存占用 | 说明 |
| --- | --- | --- |
| hashtable | ~6200 字节 | 62 字节 × 100 |
| listpack | ~2500 字节 | 25 字节 × 100 + 头部 |
| 节省 | **60%** | |

所以**小 Hash 用 listpack 能省 5-10 倍内存**！

### 控制编码的配置

\`\`\`conf
# Hash：字段数 / 单值超阈值就转 hashtable
hash-max-listpack-entries 128
hash-max-listpack-value 64

# List（-2 表示每个 quicklist 节点 8KB，默认）
list-max-listpack-size -2
list-compress-depth 0        # 0 表示不压缩中间节点

# Set（全整数时用 intset）
set-max-intset-entries 512
set-max-listpack-entries 128
set-max-listpack-value 64

# ZSet
zset-max-listpack-entries 128
zset-max-listpack-value 64
\`\`\`

### 调大阈值的权衡

\`\`\`bash
# 默认：hash-max-listpack-entries 128
# 调大示例：让 512 个字段以内都用 listpack
127.0.0.1:6379> CONFIG SET hash-max-listpack-entries 512
OK
\`\`\`

| 调整方向 | 好处 | 代价 |
| --- | --- | --- |
| 调大阈值 | 更多数据用紧凑编码，省内存 | 单次操作变慢（listpack 是 O(N)，hashtable 是 O(1)） |
| 调小阈值 | 操作更快 | 内存占用增加 |

> **优化思路**：如果业务读多写少、能接受微秒级延迟增加，把阈值调到 256-512 能显著省内存。但务必压测验证。

### Redis 7.0 的 listpack

**listpack** 是 ziplist 的替代品，解决了 ziplist 的"连锁更新"问题：

\`\`\`text
ziplist 的连锁更新问题：
  [元素A 252字节][元素B 252字节][元素C 252字节]...
  如果元素A 扩展到 253 字节，它的长度字段从 1 字节变 5 字节
  → 导致元素B 的 prev_len 字段不够用 → 元素B 也要扩展
  → 链式反应，最坏 O(N²)

listpack 的改进：
  每个元素只存自己的长度，不依赖前一个元素
  → 没有 prev_len → 没有连锁更新
\`\`\`

Redis 7.0+ 默认用 listpack，更稳定。

## 26.3 内存监控工具

### MEMORY USAGE：单 key 内存

\`\`\`bash
# 单个 key 的内存占用（字节）
127.0.0.1:6379> MEMORY USAGE user:1001
(integer) 56

# 采样数（默认 5，对集合类有效）
127.0.0.1:6379> MEMORY USAGE biglist SAMPLES 10
(integer) 1024000

# 用 0 表示全量计算（最准但最慢）
127.0.0.1:6379> MEMORY USAGE biglist SAMPLES 0
(integer) 1024500
\`\`\`

> **SAMPLES 说明**：对于集合类（List/Hash/Set/ZSet），MEMORY USAGE 通过采样估算。SAMPLES 5 表示采样 5 个元素算平均值再乘总数，快但有误差。要精确值用 SAMPLES 0。

### MEMORY STATS：详细内存统计

\`\`\`bash
127.0.0.1:6379> MEMORY STATS
1) "peak.allocated"            # 峰值分配
2) (integer) 1207959552
3) "total.allocated"           # 当前总分配
4) (integer) 1073741824
5) "startup.allocated"         # 启动占用
6) (integer) 1000000
7) "replication.backlog"       # 复制 backlog
8) (integer) 1048576
9) "clients.slaves"            # 从节点客户端 buffer
10) (integer) 100000
11) "clients.normal"           # 普通客户端 buffer
12) (integer) 50000
13) "aof.buffer"               # AOF buffer
14) (integer) 0
15) "lua.caches"               # Lua 缓存
16) (integer) 0
17) "dataset.bytes"            # 数据集字节
18) (integer) 900000000
19) "dataset.percentage"       # 数据集占比
20) "83.82"
21) "fragmentation"            # 碎片率
22) "1.40"
23) "fragmentation.bytes"      # 碎片字节
24) (integer) 4300000000
\`\`\`

### MEMORY DOCTOR：内存健康诊断

\`\`\`bash
# Redis 4.0+ 提供，自动诊断内存健康状态
127.0.0.1:6379> MEMORY DOCTOR
1) "Sam, I detected a few issues in this Redis instance memory implants:"
2) " * High fragmentation: This instance has a memory fragmentation greater than 1.4 (this means that the Operating System is not able to unmap and free memory so that the application can use the memory again)."
3) " * Big number of very small raw allocations: There are many small allocations in memory."
4) "I'm here to keep you safe, Sam. Stay happy!"
\`\`\`

> **MEMORY DOCTOR** 会检查几个方面：碎片率过高、大量小对象分配、峰值内存异常等，给出文字提示。是快速体检的好工具。

### MEMORY MALLOC-STATS：分配器详情

\`\`\`bash
# 查看 jemalloc 的详细统计（输出很长）
127.0.0.1:6379> MEMORY MALLOC-STATS
___ Begin jemalloc statistics ___
Version: "5.2.1-0-g0"
...
___ End jemalloc statistics ___
\`\`\`

这个输出非常底层，一般排查分配器 bug 时才用。

### 客户端 buffer 监控

\`\`\`bash
127.0.0.1:6379> CLIENT LIST
id=1 addr=127.0.0.1:54321 laddr=127.0.0.1:6379 fd=8 name= age=3600 idle=0 flags=N db=0 sub=0 psub=0 ssub=0 multi=-1 qbuf=0 qbuf-free=0 argv-mem=0 multi-mem=0 rbs=1024 rbp=0 obl=0 oll=0 omem=0 tot-mem=2056 events=r cmd=get user=default redir=-1 resp=2 lib-name= lib-ver=
\`\`\`

关注字段：

| 字段 | 含义 | 异常表现 |
| --- | --- | --- |
| \`qbuf\` | 输入缓冲区占用 | 过大说明客户端发了大命令 |
| \`omem\` | 输出缓冲区占用 | 过大说明客户端读得慢 |
| \`tot-mem\` | 该客户端总内存 | 过大要关注 |
| \`idle\` | 空闲秒数 | 过大可能是连接泄漏 |

控制客户端 buffer 的配置：

\`\`\`conf
# 客户端输出 buffer 限制（硬限制 / 软限制 / 软限制时长秒）
client-output-buffer-limit normal 0 0 0            # 普通客户端不限
client-output-buffer-limit replica 256mb 64mb 60   # 从节点
client-output-buffer-limit pubsub 32mb 8mb 60      # pub/sub

# 客户端输入 buffer 上限
client-query-buffer-limit 1gb
\`\`\`

## 26.4 内存碎片治理

### 碎片的产生

Redis 用 jemalloc 分配内存，内存按大小类（size class）分配。频繁修改/删除 key 时，会留下大小不一的"空洞"：

\`\`\`text
初始分配：[A 16B][B 32B][C 16B][D 32B][E 16B]
删除 B、D：[A 16B][空 32B][C 16B][空 32B][E 16B]
新 key F 需要 48 字节：[A 16B][F 占用部分][C 16B][剩余空][E 16B]
→ 32B 的空位装不下 48B 的 F，F 要新分配，空位留下
\`\`\`

### 查看碎片

\`\`\`bash
127.0.0.1:6379> INFO memory | grep fragmentation
mem_fragmentation_ratio:1.80      # 1.8 倍碎片
mem_fragmentation_bytes:800MB

# jemalloc 详细统计
127.0.0.1:6379> MEMORY MALLOC-STATS
\`\`\`

### 自动碎片清理：activedefrag

Redis 4.0+ 支持自动碎片清理：

\`\`\`conf
# 开启自动 activedefrag
activedefrag yes

# 触发条件：碎片字节数超过 100MB 且碎片率超过 10%
active-defrag-ignore-bytes 100mb
active-defrag-threshold-lower 10   # 碎片率 10% 开始清理
active-defrag-threshold-upper 100  # 碎片率 100% 全力清理

# 清理占用 CPU 上限
active-defrag-cycle-min 1   # 最小 1% CPU
active-defrag-cycle-max 25  # 最大 25% CPU

# 清理时的最大内存占用
active-defrag-max-scan-fields 1000  # 单次扫描最多 1000 字段
\`\`\`

\`\`\`bash
# 运行时开启
127.0.0.1:6379> CONFIG SET activedefrag yes
OK

# 查看是否在运行
127.0.0.1:6379> INFO memory | grep active_defrag
active_defrag_running:1   # 1 表示正在清理
\`\`\`

> **activedefrag 原理**：后台线程定期扫描数据，把分散的小内存块"搬运"到连续区域，释放碎片。它会占用 CPU，生产建议低峰期开，或调小 cycle。

### 手动清理

\`\`\`bash
# Redis 4.0+ 手动触发一次碎片整理
127.0.0.1:6379> MEMORY PURGE
OK

# 最彻底的方式：重启（先持久化）
127.0.0.1:6379> BGSAVE         # 先存盘
# 等 LASTSAVE 时间更新后
127.0.0.1:6379> SHUTDOWN
# 重启后内存重新分配，碎片清零
redis-server /etc/redis/redis.conf
\`\`\`

> **重启的风险**：重启会清空内存数据，依赖 RDB/AOF 恢复，恢复期间不可用。生产重启要走变更流程，且在低峰期。

## 26.5 BigKey 检测与治理

BigKey 是内存问题的元凶，也是性能问题的源头。

### 什么是 BigKey

| 类型 | BigKey 阈值（参考） | 极端 BigKey |
| --- | --- | --- |
| String | value > 10KB | > 1MB |
| Hash | 字段数 > 500 或总大小 > 1MB | > 10万字段 |
| List | 元素数 > 1000 或总大小 > 1MB | > 10万元素 |
| Set | 元素数 > 1000 | > 10万元素 |
| ZSet | 元素数 > 1000 | > 10万元素 |

### BigKey 的危害

1. **内存阻塞**：单个 key 占几百 MB，fork 时复制慢
2. **网络阻塞**：单条命令传几十 MB，占满带宽
3. **删除阻塞**：DEL 大 key 同步删除，阻塞几秒
4. **持久化卡顿**：fork 时复制大 key 慢
5. **集群迁移慢**：MIGRATE 单个 key 慢，slot 迁移卡住
6. **内存倾斜**：Cluster 下单节点内存不均

### 检测方法 1：redis-cli --bigkeys

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

> **--bigkeys 原理**：用 SCAN 遍历所有 key，按类型记录最大的几个。非阻塞，但可能漏掉一些 key（SCAN 不保证完整）。生产建议每周扫一次。

### 检测方法 2：--memkeys（Redis 7.4+）

\`\`\`bash
# 按内存占用排序，更精确
$ redis-cli --memkeys

[00.00%] Biggest string   found so far 'cache:product:1001' with 51200 bytes
...
\`\`\`

### 检测方法 3：手动 SCAN + MEMORY USAGE

\`\`\`bash
# 扫描所有 key，找出内存占用 > 10KB 的
redis-cli --scan | while read key; do
  size=$(redis-cli MEMORY USAGE "\$key" 2>/dev/null)
  if [ "\$size" -gt 10240 ]; then
    echo "\$size \$key"
  fi
done | sort -rn | head -50
\`\`\`

### 检测方法 4：按类型看长度

\`\`\`bash
# 扫描并查看各 key 的元素数
redis-cli --scan | while read key; do
  type=$(redis-cli TYPE "\$key")
  case \$type in
    list) len=$(redis-cli LLEN "\$key") ;;
    hash) len=$(redis-cli HLEN "\$key") ;;
    set)  len=$(redis-cli SCARD "\$key") ;;
    zset) len=$(redis-cli ZCARD "\$key") ;;
    *)    len=0 ;;
  esac
  echo "\$len \$type \$key"
done | sort -rn | head -20
\`\`\`

### 治理 BigKey

**拆分**（预防为主）：

\`\`\`bash
# 反例：一个大 Hash 存百万字段
HSET user:1001:log <百万字段>

# 正例：按日期/类型分 key
HSET user:1001:log:20240101 <少量字段>
HSET user:1001:log:20240102 <少量字段>
\`\`\`

**异步删除**：

\`\`\`bash
# 同步删除（阻塞，慎用！）
DEL bigkey

# 异步删除（推荐，立即返回）
UNLINK bigkey

# 批量异步删除
redis-cli --scan --pattern "cache:*" | xargs -L 1000 redis-cli UNLINK
\`\`\`

**渐进式删除**（对大 Hash/Set/ZSet）：

\`\`\`bash
# 大 Hash 渐进式删除
HSCAN bigkey 0 COUNT 100  # 拿到一批 field
HDEL bigkey <field1> <field2> ...  # 删这一批
# 重复直到清空
DEL bigkey  # 最后清掉空壳
\`\`\`

### 开启 lazyfree

\`\`\`conf
# 默认 no，删大 key 会阻塞
lazyfree-lazy-eviction yes    # 内存淘汰异步
lazyfree-lazy-expire yes      # key 过期异步删除
lazyfree-lazy-server-del yes  # DEL/RENAME 等异步
lazyfree-lazy-user-del yes    # 用户 DEL 异步
lazyfree-lazy-user-flush yes  # 用户 FLUSHALL 异步
\`\`\`

生产建议都开 yes，避免大 key 删除阻塞。

## 26.6 节省内存的实战技巧

### 技巧 1：用 Hash 替代多个 String

**反例**：

\`\`\`bash
SET user:1001:name "Alice"
SET user:1001:age "30"
SET user:1001:city "Beijing"
# 3 个 key = 3 个 dictEntry，约 168 字节
\`\`\`

**正例**：

\`\`\`bash
HSET user:1001 name "Alice" age "30" city "Beijing"
# 1 个 key，listpack 编码，约 60 字节
\`\`\`

省 60%+ 内存！

### 技巧 2：用短 key 名

\`\`\`bash
# 反例：key 长 21 字节
SET user:profile:1001:name "Alice"

# 优化：缩短前缀，key 长 10 字节
SET u:p:1001:n "Alice"
\`\`\`

百万 key 能省 11MB × N。但要权衡可读性，建议在客户端做 key 映射表。

### 技巧 3：用数字代替字符串

\`\`\`bash
# 反例："active" 占 7 字节（embstr）
SET status active

# 优化：数字用 int 编码，8 字节
SET status 1   # 1=active, 0=inactive
\`\`\`

### 技巧 4：控制 value 大小

\`\`\`bash
# 反例：一个 key 存 1MB 的 JSON
SET cache:user:1001 <1MB JSON>

# 优化：拆字段
HSET cache:user:1001 name "Alice" age 30 city "Beijing"
\`\`\`

> **建议**：单个 value 不超过 10KB。BigKey 会拖累持久化、复制、删除。

### 技巧 5：设合理的 TTL

\`\`\`bash
# 不用的 key 设过期，自动清理
SET token:abc123 <data> EX 3600   # 1 小时后清理
\`\`\`

### 技巧 6：用 HyperLogLog 替代 Set 做 UV

\`\`\`bash
# Set 存 UV：百万用户占 ~8MB
SADD uv:20240101 user:1 user:2 ...

# HyperLogLog：固定 12KB，误差 0.81%
PFADD uv:20240101 user:1 user:2 ...
PFCOUNT uv:20240101
\`\`\`

省内存 99%+！

### 技巧 7：用 Bitmap 替代 Set 做布尔状态

\`\`\`bash
# Set 存在线用户：百万占 ~8MB
SADD online user:1 user:2 ...

# Bitmap：百万占 125KB
SETBIT online 1 1
SETBIT online 2 1
BITCOUNT online
\`\`\`

### 技巧 8：压缩大 value

业务层用 gzip/zstd 压缩后存 Redis：

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

### 技巧 9：控制集合大小

\`\`\`bash
# 反例：一个 Set 存百万元素
SADD tags:popular <百万元素>

# 优化：分片
SADD tags:popular:1 <10万元素>
SADD tags:popular:2 <10万元素>
\`\`\`

### 技巧 10：用 Redis 模块

- **RedisJSON**：原生 JSON 操作，省内存
- **RedisBloom**：布隆过滤器省 90% 内存
- **RediSearch**：全文索引比关系 DB 节省

## 26.7 踩坑提示

> **坑 1：编码转换后变慢**。把 \`hash-max-listpack-entries\` 调到 1000，单个 HGET 从 O(1) 变 O(N)。监控延迟，权衡内存和性能。

> **坑 2：activedefrag 拖垮 CPU**。生产高峰期开自动清理可能 CPU 100%。低峰期开，或调小 \`active-defrag-cycle-max\`。

> **坑 3：碎片率 < 1 误判**。不是没碎片，而是 swap 了！立即看 \`/proc/<pid>/status\` 的 VmSwap，或 \`free -m\` 的 Swap 行。

> **坑 4：大 key 删除阻塞**。删一个百万元素的 Set 会阻塞几秒。用 \`UNLINK\` 异步删除，并开 \`lazyfree\`。

> **坑 5：maxmemory 不含复制 buffer**。配置 maxmemory=2GB，但复制 buffer 1GB，实际数据只能用 1GB。生产要预留 buffer 空间。

> **坑 6：embstr 频繁转 raw**。频繁修改的短字符串会从 embstr 转 raw，失去省内存优势。能预估大小的用 HSET。

> **坑 7：MEMORY USAGE 采样不准**。大集合采样 5 个元素估算，误差可能 20%+。精确值用 \`SAMPLES 0\`。

> **坑 8：删大 key 时 UNLINK 不生效**。如果 \`lazyfree-lazy-server-del\` 没开，RENAME 大 key 到带 TTL 的 key 仍会阻塞。配置要全开。

## 26.8 本章小结

- **内存结构**：\`used_memory\`（数据集）vs \`used_memory_rss\`（含碎片），用 \`INFO memory\` 监控
- **对象编码**：用 \`OBJECT ENCODING\` 查看。int/embstr/listpack/intset 省内存，raw/hashtable/skiplist/quicklist 性能好，靠阈值切换
- **编码对比**：listpack 比 hashtable 省 5-10 倍内存，但操作是 O(N)
- **配置调优**：\`hash-max-listpack-entries/value\`、\`zset-max-listpack-entries/value\`、\`set-max-intset-entries\`、\`list-max-listpack-size\`
- **内存碎片**：\`mem_fragmentation_ratio > 1.5\` 要关注，开 \`activedefrag\` 或重启
- **BigKey 治理**：\`redis-cli --bigkeys\` 检测，\`UNLINK\` 异步删除，开 \`lazyfree\`
- **省内存技巧**：Hash 替代多 String、短 key、数字枚举、HLL 替代 Set、Bitmap 替代 Set、压缩大 value
- **监控工具**：\`MEMORY USAGE\`、\`MEMORY STATS\`、\`MEMORY DOCTOR\`、\`MEMORY MALLOC-STATS\`
- 关键配置：\`maxmemory\`、\`maxmemory-policy\`、各种 \`*-max-listpack-*\`、\`activedefrag\`、\`lazyfree-*\``
  },
  {
    id: "redis-ch27",
    group: "第六部分 性能优化与运维实战",
    icon: "📈",
    title: "第 27 章 性能监控与慢查询",
    content: `# 第 27 章 性能监控与慢查询

Redis 单线程模型下，**一个慢命令能拖垮整个实例**。监控和排查慢查询是 Redis 运维的核心技能。本章讲透 SLOWLOG、INFO、LATENCY、redis-cli 内建工具、redis-benchmark、Pipeline 优化等关键技能，让你能在出问题时快速定位元凶。

## 27.1 SLOWLOG 慢查询日志

**SLOWLOG** 记录执行时间超过阈值的命令，是排查慢查询的第一工具。

### 配置

\`\`\`conf
# 慢查询阈值（微秒，默认 10000 = 10ms）
# 1 秒 = 1000000 微秒
slowlog-log-slower-than 10000

# 慢查询日志最大长度（默认 128）
slowlog-max-len 128

# 记录所有命令（debug 用，慎用，会占大量内存）
slowlog-log-slower-than 0

# 关闭慢日志
slowlog-log-slower-than -1
\`\`\`

\`\`\`bash
# 运行时修改（生产推荐 1-5ms）
127.0.0.1:6379> CONFIG SET slowlog-log-slower-than 5000   # 5ms
OK
127.0.0.1:6379> CONFIG SET slowlog-max-len 1024           # 保留 1024 条
OK

# 查看当前配置
127.0.0.1:6379> CONFIG GET slowlog*
1) "slowlog-log-slower-than"
2) "5000"
3) "slowlog-max-len"
4) "1024"
\`\`\`

> **生产建议**：阈值设 1ms（1000）到 5ms（5000），max-len 设 1024+。默认 10ms 会漏掉很多问题。

### SLOWLOG 操作命令

\`\`\`bash
# 查看最近 10 条慢日志
127.0.0.1:6379> SLOWLOG GET 10
1) 1) (integer) 14          # 日志 ID（递增）
   2) (integer) 1609456789  # 发生时间戳（秒）
   3) (integer) 51234       # 耗时（微秒）= 51ms
   4) 1) "KEYS"             # 命令及参数
      2) "*"
   5) "127.0.0.1:54321"     # 客户端地址
   6) "worker-1"            # 客户端名称（CLIENT SETNAME 设置）

# 查看慢日志总数
127.0.0.1:6379> SLOWLOG LEN
(integer) 14

# 清空慢日志
127.0.0.1:6379> SLOWLOG RESET
OK
\`\`\`

### SLOWLOG 字段详解

| 字段 | 含义 | 排查用途 |
| --- | --- | --- |
| ID | 日志唯一 ID | 跟踪特定慢查询 |
| 时间戳 | 发生时间 | 关联业务日志 |
| 耗时（微秒） | 命令执行耗时 | 判断严重程度 |
| 命令 | 执行的命令及参数 | 找元凶 |
| 客户端地址 | 谁发的 | 找到调用方 |
| 客户端名称 | 业务标识 | 关联业务系统 |

> **耗时说明**：SLOWLOG 记录的耗时**不包括**网络传输和命令排队时间，只包含命令在 Redis 内的执行时间。所以实际用户感知延迟可能更高。

### 常见慢命令清单

| 命令 | 时间复杂度 | 危险等级 | 替代方案 |
| --- | --- | --- | --- |
| \`KEYS *\` | O(N) | 🔴 极危险 | SCAN |
| \`SMEMBERS\` 大 Set | O(N) | 🔴 | SSCAN |
| \`HGETALL\` 大 Hash | O(N) | 🔴 | HSCAN |
| \`LRANGE 0 -1\` 长 List | O(N) | 🟡 | 分页 LRANGE |
| \`ZRANGE 0 -1\` 大 ZSet | O(N) | 🟡 | ZSCAN / 分页 |
| \`SORT\` | O(N+M*logM) | 🔴 | 业务层排序 |
| \`FLUSHALL\` | O(N) | 🔴 | FLUSHALL ASYNC |
| \`DEBUG SLEEP\` | 阻塞 | 🔴 | 测试专用 |
| \`MULTI/EXEC\` 大事务 | 阻塞 | 🟡 | 拆小事务 |
| \`SUBSCRIBE\` 慢消费 | 阻塞 | 🟡 | 独立连接 |

> **生产铁律**：禁用 KEYS *，用 SCAN 替代；大集合操作要分页或后台跑。

### DEBUG SLEEP：模拟慢命令

\`\`\`bash
# 模拟 5 秒慢命令（仅测试用！）
127.0.0.1:6379> DEBUG SLEEP 5
OK
(5.00s)

# 这条命令会阻塞 Redis 5 秒，所有其他命令都要等
\`\`\`

> **DEBUG SLEEP 危险**：生产环境**绝对禁用**！它会阻塞整个 Redis。只在隔离的测试环境验证监控告警时用。

### SCAN 替代 KEYS

\`\`\`bash
# KEYS 阻塞整个 Redis（危险！）
KEYS user:*

# SCAN 非阻塞，游标分页
SCAN 0 MATCH user:* COUNT 100
# 返回 [新游标, 匹配的 key 列表]

# 继续扫
SCAN <新游标> MATCH user:* COUNT 100
# 直到游标返回 0 才算扫完
\`\`\`

Node.js 完整扫描示例：

\`\`\`javascript
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
> - SCAN 期间数据可能变化（弱一致性）

### 各类型的 SCAN 变体

\`\`\`bash
# 扫描 Hash 的字段
HSCAN myhash 0 MATCH field:* COUNT 100

# 扫描 Set 的元素
SSCAN myset 0 MATCH user:* COUNT 100

# 扫描 ZSet 的元素
ZSCAN myzset 0 MATCH member:* COUNT 100

# 注意：List 没有 SCAN，用 LRANGE 分页
LRANGE mylist 0 99
LRANGE mylist 100 199
\`\`\`

## 27.2 INFO 命令详解

\`INFO\` 命令是 Redis 的"体检报告"，分多个模块。

\`\`\`bash
# 全部信息
127.0.0.1:6379> INFO

# 只看某部分
127.0.0.1:6379> INFO server        # 服务器信息
127.0.0.1:6379> INFO clients       # 客户端
127.0.0.1:6379> INFO memory        # 内存
127.0.0.1:6379> INFO persistence    # 持久化
127.0.0.1:6379> INFO stats         # 统计
127.0.0.1:6379> INFO replication    # 复制
127.0.0.1:6379> INFO cpu           # CPU
127.0.0.1:6379> INFO commandstats  # 命令统计
127.0.0.1:6379> INFO errorstats    # 错误统计（Redis 6.0+）
\`\`\`

### INFO server：服务器信息

\`\`\`bash
# Server
redis_version:7.0.0              # Redis 版本
redis_git_sha1:00000000
redis_git_dirty:0
redis_build_id:abc123
redis_mode:standalone            # 模式：standalone/sentinel/cluster
os:Linux 5.4.0-xx
arch_bits:64
multiplexing_api:epoll
process_id:1234
run_id:abc123def456              # 实例唯一 ID（重启变化）
tcp_port:6379
uptime_in_seconds:86400          # 运行时间（秒）
uptime_in_days:1
hz:10                            # 后台任务频率
configured_hz:10
lru_clock:1609456789
executable:/usr/local/bin/redis-server
config_file:/etc/redis/redis.conf
\`\`\`

### INFO cpu：CPU 占用

\`\`\`bash
# CPU
used_cpu_sys:1200.50             # 系统 CPU 时间（秒）
used_cpu_user:800.30             # 用户 CPU 时间
used_cpu_sys_children:200.10     # 子进程系统 CPU
used_cpu_user_children:150.20    # 子进程用户 CPU
used_cpu_sys_main_thread:1190.00
used_cpu_user_main_thread:795.00
\`\`\`

> **看 CPU**：如果 \`used_cpu_sys\` 很高，可能是 fork、AOF 重写、网络 IO；如果 \`used_cpu_user\` 高，可能是命令执行、Lua 脚本。

### INFO memory：内存（核心）

\`\`\`bash
# Memory
used_memory:1073741824
used_memory_human:1.00G
used_memory_rss:15032385536
used_memory_rss_human:14.00G
used_memory_peak:1207959552
used_memory_peak_human:1.12G
maxmemory:2147483648
maxmemory_human:2.00G
maxmemory_policy:allkeys-lru
mem_fragmentation_ratio:1.40
\`\`\`

（详见第 26 章）

### INFO replication：复制状态

\`\`\`bash
# Replication
role:master                      # 角色：master/slave
connected_slaves:2               # 连接的从节点数
slave0:ip=10.0.0.2,port=6380,state=online,offset=10240,lag=0
slave1:ip=10.0.0.3,port=6380,state=online,offset=10240,lag=0
master_failover_state:no-failover
master_replid:abc123def456
master_replid2:000000000000
master_repl_offset:10240         # 主节点复制偏移
second_repl_offset:-1
repl_backlog_active:1
repl_backlog_size:1048576        # backlog 大小
repl_backlog_first_byte_offset:0
repl_backlog_histlen:10240
\`\`\`

从节点视角：

\`\`\`bash
# Replication（从节点）
role:slave
master_host:10.0.0.1
master_port:6379
master_link_status:up            # up=正常，down=断开
master_last_io_seconds_ago:0     # 距离上次 IO 秒数
master_sync_in_progress:0
slave_repl_offset:10240
slave_priority:100
slave_read_repl_offset:10240
connected_slaves:0
master_failover_state:no-failover
\`\`\`

> **关键监控**：\`master_link_status:down\` 说明从节点断了；\`master_last_io_seconds_ago\` > 30 说明主从通信异常。

### INFO stats：运行统计

\`\`\`bash
# Stats
total_connections_received:10000   # 历史总连接数
total_commands_processed:1000000   # 历史总命令数
instantaneous_ops_per_sec:5000     # 当前 QPS
total_net_input_bytes:50000000
total_net_output_bytes:100000000
instantaneous_input_kbps:100.5
instantaneous_output_kbps:200.3
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
latest_fork_usec:200000            # 最近一次 fork 耗时（微秒）= 200ms
\`\`\`

### 命中率计算

\`\`\`text
命中率 = keyspace_hits / (keyspace_hits + keyspace_misses)
      = 800000 / (800000 + 200000)
      = 80%
\`\`\`

| 命中率 | 评估 | 处理 |
| --- | --- | --- |
| > 95% | 优秀 | 保持 |
| 90% - 95% | 良好 | 观察 |
| 80% - 90% | 一般 | 排查 TTL、容量 |
| < 80% | 差 | 调整缓存策略 |

> **命中率低的常见原因**：TTL 太短、缓存容量不够（频繁淘汰）、key 设计不合理（缓存穿透）。

### INFO commandstats：命令统计

\`\`\`bash
127.0.0.1:6379> INFO commandstats
# Commandstats
cmdstat_get:calls=500000,usec=2000000,usec_per_call=4.00,rejected_calls=0,failed_calls=0
cmdstat_set:calls=200000,usec=1000000,usec_per_call=5.00,rejected_calls=0,failed_calls=0
cmdstat_keys:calls=2,usec=50000,usec_per_call=25000.00,rejected_calls=0,failed_calls=0
cmdstat_hgetall:calls=1000,usec=500000,usec_per_call=500.00,rejected_calls=0,failed_calls=0
\`\`\`

| 字段 | 含义 |
| --- | --- |
| \`calls\` | 命令调用次数 |
| \`usec\` | 总耗时（微秒） |
| \`usec_per_call\` | 平均每次耗时（微秒） |
| \`rejected_calls\` | 被拒次数（权限等） |
| \`failed_calls\` | 失败次数 |

> **排查技巧**：按 \`usec_per_call\` 降序找，高的就是性能瓶颈。上面例子里 \`keys\` 平均 25ms，\`hgetall\` 平均 0.5ms，明显是 KEYS 命令拖后腿。

重置统计：

\`\`\`bash
127.0.0.1:6379> CONFIG RESETSTAT
OK
\`\`\`

### INFO errorstats：错误统计（Redis 6.0+）

\`\`\`bash
127.0.0.1:6379> INFO errorstats
# Errorstats
errorstat_ERR:count=10
errorstat_WRONGTYPE:count=5
errorstat_LOADING:count=2
\`\`\`

## 27.3 LATENCY 延迟监控框架

**LATENCY** 是 Redis 的事件延迟监控框架，记录关键事件（fork、AOF 写盘、过期等）的耗时。

### 配置阈值

\`\`\`conf
# 延迟阈值（毫秒，默认 100）
# 超过此阈值的事件才会被记录
latency-monitor-threshold 100
\`\`\`

\`\`\`bash
# 运行时调整（生产建议 25-50ms）
127.0.0.1:6379> CONFIG SET latency-monitor-threshold 50
OK
\`\`\`

> **阈值建议**：太低（< 10ms）会产生太多事件占内存；太高（> 200ms）会漏掉问题。50ms 是个平衡点。

### LATENCY 命令

\`\`\`bash
# 查看最近一次各事件的延迟
127.0.0.1:6379> LATENCY LATEST
1) 1) "fork"
   2) (integer) 1609456789   # 时间戳
   3) (integer) 200          # 本次延迟（ms）
   4) (integer) 300          # 历史最大延迟（ms）
2) 1) "aof-fsync-always"
   2) (integer) 1609456780
   3) (integer) 150
   4) (integer) 150
3) 1) "expire-cycle"
   2) (integer) 1609456785
   3) (integer) 30
   4) (integer) 45

# 查看某事件的历史
127.0.0.1:6379> LATENCY HISTORY fork
1) 1) (integer) 1609456000
   2) (integer) 180
2) 1) (integer) 1609456500
   2) (integer) 200
3) 1) (integer) 1609456789
   2) (integer) 200

# 查看延迟图表（ASCII）
127.0.0.1:6379> LATENCY GRAPH fork
fork - 1609456789
       |
    300|      *#
    250|      ##
    200|      ###
    150|      ####
    100|      #####
     50|      ######
      0|##############

# 重置
127.0.0.1:6379> LATENCY RESET
OK
# 或重置特定事件
127.0.0.1:6379> LATENCY RESET fork
\`\`\`

### 关键延迟事件

| 事件 | 含义 | 排查方向 |
| --- | --- | --- |
| \`fork\` | 创建子进程（RDB/AOF 重写）耗时 | 内存大、THP 未关 |
| \`aof-write\` | AOF 写盘 | 磁盘慢 |
| \`aof-fsync-always\` | AOF fsync（appendfsync always） | 磁盘慢 |
| \`aof-rewrite-diff-write\` | AOF 重写期间累积命令写盘 | 重写期间写入量大 |
| \`expire-cycle\` | 主动过期 key | 大量 key 同时过期 |
| \`unlink\` | 异步删除大 key | 大 key 删除 |
| \`command\` | 命令阻塞 | 慢命令 |
| \`fast-command\` | 快命令阻塞 | 高频小命令 |
| \`swap\` | 发生 swap | 内存不足 |

> **fork 慢的典型原因**：实例内存大（> 10GB）+ THP 开启。fork 要复制页表，内存越大页表越大。关闭 THP 能显著改善。

## 27.4 redis-cli 内建监控工具

### redis-cli --latency：测延迟

\`\`\`bash
# 持续测延迟（每秒一次 PING）
$ redis-cli --latency
min: 0, max: 1, avg: 0.27 (1949 samples)

# 测试指定实例
$ redis-cli -h 10.0.0.1 -p 6379 --latency

# 带历史记录
$ redis-cli --latency-history
min: 0, max: 1, avg: 0.19 (1422 samples) -- 15.00 seconds range
min: 0, max: 2, avg: 0.31 (1420 samples) -- 15.00 seconds range
min: 0, max: 1, avg: 0.20 (1421 samples) -- 15.00 seconds range
\`\`\`

### redis-cli --latency-dist：延迟分布

\`\`\`bash
# 延迟分布（直方图）
$ redis-cli --latency-dist
(more samples needed for more accurate distribution)
--------------------------------------------
1 votes (0.05%)  ^^^^^^^^^^^
... 
500 votes (25.00%)  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
\`\`\`

可以看到 P50、P99 分布，比平均值更能反映真实体验。

### redis-cli --stat：实时统计

\`\`\`bash
# 实时监控（每秒刷新）
$ redis-cli --stat
------- data ------ --------------------- load -------------------- - child -
keys       mem      clients blocked requests            connections
50         1.00G    100     0       5000 (+0)           10000
50         1.00G    100     0       5050 (+50)         10001
52         1.01G    102     0       5100 (+50)         10002
\`\`\`

> **--stat 用途**：一眼看到 key 数、内存、连接数、QPS、阻塞客户端的变化趋势。比 INFO 更直观。

### redis-cli --bigkeys / --memkeys

（详见第 26 章）

\`\`\`bash
# 找最大 key
redis-cli --bigkeys

# 找最占内存 key（Redis 7.4+）
redis-cli --memkeys

# 找 hotkey（需开启 LFU 淘汰）
redis-cli --hotkeys
\`\`\`

### MONITOR 命令（慎用！）

\`\`\`bash
# 实时监控所有执行的命令
127.0.0.1:6379> MONITOR
OK
1609456789.123456 [0 127.0.0.1:54321] "SET" "key1" "value1"
1609456789.123567 [0 127.0.0.1:54321] "GET" "key2"
...
\`\`\`

> **MONITOR 危险**：它会**严重降低 Redis 性能**（约 50%+），因为每条命令都要额外发送给 MONITOR 客户端。生产环境**绝对不用**！只在测试环境调试时短暂用，用完立即退出。

### OBJECT FREQ：查看 LFU 访问频率

\`\`\`conf
# 必须开启 LFU 淘汰策略
maxmemory-policy allkeys-lfu
# 或 volatile-lfu
\`\`\`

\`\`\`bash
# 查看某 key 的访问频率（LFU 模式下有效）
127.0.0.1:6379> OBJECT FREQ hotkey:1
(integer) 200

# 查看编码
127.0.0.1:6379> OBJECT ENCODING hotkey:1
"embstr"

# 查看空闲时间（LRU 模式）
127.0.0.1:6379> OBJECT IDLETIME hotkey:1
(integer) 10
\`\`\`

> **LFU 频率值**：是一个对数计数器（0-255），不是真实访问次数。255 表示"非常频繁"。配合 \`--hotkeys\` 能找出热点 key。

## 27.5 redis-benchmark 性能压测

\`\`\`bash
# 基础压测（50 个并发，10 万请求）
$ redis-benchmark -h 127.0.0.1 -p 6379 -c 50 -n 100000

# 测特定命令
$ redis-benchmark -t set,get -n 100000 -c 50
====== SET ======
  100000 requests completed in 1.20 seconds
  50 parallel clients
  3 bytes payload
  keep alive: 1
  ...
  throughput summary: 83333.33 requests per second
  latency summary (msec):
          avg       min       p50       p95       p99       max
        0.180     0.064     0.159     0.367     0.511     1.159

# 测大 value
$ redis-benchmark -t set -n 100000 -c 50 -d 1000   # 1KB value

# 用 pipeline
$ redis-benchmark -t set -n 100000 -c 50 -P 16     # pipeline 16

# 测试 Lua 脚本
$ redis-benchmark -n 100000 -c 50 eval "return 1" 0
\`\`\`

### 关键参数

| 参数 | 含义 |
| --- | --- |
| \`-c\` | 并发客户端数 |
| \`-n\` | 总请求数 |
| \`-d\` | value 大小（字节） |
| \`-t\` | 测试命令（set,get,...） |
| \`-P\` | pipeline 大小 |
| \`-r\` | 随机 key 数（避免热点） |
| \`-q\` | 安静模式，只输出 QPS |
| \`--threads\` | 客户端线程数（Redis 6.0+） |

### 压测结果分析

\`\`\`text
====== SET ======
  100000 requests completed in 1.20 seconds
  50 parallel clients
  3 bytes payload
  ...
  throughput summary: 83333.33 requests per second   ← QPS
  latency summary (msec):
          avg       min       p50       p95       p99       max
        0.180     0.064     0.159     0.367     0.511     1.159
\`\`\`

> **关注 P99**：avg 0.18ms 看着不错，但 P99 是 0.511ms，max 是 1.159ms。生产环境要看 P99/P999，不要只看平均值。

### 压测不同场景

\`\`\`bash
# 1. 小 value 高并发（典型缓存场景）
redis-benchmark -t get,set -n 1000000 -c 100 -d 100 -q

# 2. 大 value（检查网络瓶颈）
redis-benchmark -t set -n 100000 -c 50 -d 100000 -q   # 100KB

# 3. 随机 key（检查是否单 key 热点）
redis-benchmark -t get -n 1000000 -c 100 -r 1000000 -q

# 4. Pipeline 吞吐
redis-benchmark -t set -n 1000000 -c 50 -P 16 -q
\`\`\`

## 27.6 PIPELINE 优化

Pipeline 是客户端批量发送命令、批量接收回复的技术，能大幅提升吞吐。

### 不用 Pipeline

\`\`\`text
客户端发送 CMD1 → 等待 RTT → 收到回复1
客户端发送 CMD2 → 等待 RTT → 收到回复2
...
N 条命令 = N 次 RTT

每次 RTT 假设 1ms，1000 条命令 = 1000ms
\`\`\`

### 用 Pipeline

\`\`\`text
客户端批量发送 CMD1,CMD2,...,CMD1000 → 等待 → 批量收到回复
1000 条命令 = 1 次 RTT

1ms RTT，1000 条命令 = 1ms + 命令执行时间
\`\`\`

### 代码示例

\`\`\`javascript
// Node.js (ioredis)
const pipeline = redis.pipeline();
for (let i = 0; i < 1000; i++) {
  pipeline.set(\`key:\${i}\`, i);
}
const results = await pipeline.exec();
// 一次性发送 1000 条命令

// 也可以用批处理
await redis.mset(...flatArray);
\`\`\`

\`\`\`bash
# redis-cli 的 pipeline 模式
$ cat commands.txt | redis-cli --pipe
All data transferred. Waiting for the last reply...
Last reply received from server.
errors: 0, replies: 1000000
\`\`\`

### Pipeline vs MULTI/EXEC

| 特性 | Pipeline | MULTI/EXEC（事务） |
| --- | --- | --- |
| 原子性 | 否（命令间可能穿插其他客户端命令） | 是（顺序执行不打断） |
| 性能 | 最高 | 略低（有事务开销） |
| 用途 | 批量操作 | 原子操作 |
| 支持 | 所有命令 | 所有命令 |

> **选择建议**：不需要原子性用 Pipeline，需要原子性用 MULTI/EXEC 或 Lua。

### Pipeline 的注意事项

> **坑 1：Pipeline 太大占内存**。客户端发送的命令和服务端返回的回复都缓存在内存。一次发 100 万条可能 OOM。建议每批 1000-10000 条。

> **坑 2：Pipeline 不是原子的**。批次之间可能穿插其他客户端的命令。要原子用 Lua。

> **坑 3：Pipeline 不减少命令执行时间**。它只减少网络 RTT。如果命令本身慢（如 KEYS），Pipeline 帮不了。

## 27.7 HotKey 热点 key 排查

HotKey 是访问频率极高的 key，可能导致单分片负载不均。

### 检测方法

\`\`\`bash
# 方法 1：redis-cli --hotkeys（需 LFU 淘汰策略）
127.0.0.1:6379> CONFIG SET maxmemory-policy allkeys-lfu
OK
$ redis-cli --hotkeys

# Scanning the entire keyspace to find hot keys as well as
# average sizes per key type. You can use -i 0.1 to sleep 0.1 sec
# per 100 SCAN commands (not usually needed).

[00.00%] Hot key 'user:1001' found so far with frequency 50000
[00.00%] Hot key 'product:hot' found so far with frequency 30000
...

-------- summary -------

Sampled 10000 keys in the keyspace!
Hot key 'user:1001' has frequency 50000
Hot key 'product:hot' has frequency 30000

\`\`\`

\`\`\`bash
# 方法 2：OBJECT FREQ 查看单 key
127.0.0.1:6379> OBJECT FREQ user:1001
(integer) 50000
\`\`\`

\`\`\`bash
# 方法 3：MONITOR 统计（慎用，影响性能）
redis-cli MONITOR | awk '{print $4}' | sort | uniq -c | sort -rn | head
\`\`\`

### 治理 HotKey

\`\`\`bash
# 1. 本地缓存：客户端缓存 HotKey，减少 Redis 访问
# 2. 拆分：把 HotKey 拆成多个 key
SET hotkey:1 value
SET hotkey:2 value
# 客户端随机读 hotkey:1 或 hotkey:2

# 3. 多副本：Cluster 下把 HotKey 复制到多个分片
\`\`\`

## 27.8 踩坑提示

> **坑 1：SLOWLOG 阈值设太大**。默认 10ms 会漏掉很多问题。生产建议 1-5ms。

> **坑 2：SLOWLOG 满了覆盖老记录**。默认 128 条太少，重要慢查询被覆盖。调到 1024+。

> **坑 3：用 KEYS 排查问题**。本想找几个 key，结果 KEYS * 阻塞几秒，雪上加霜。永远用 SCAN。

> **坑 4：监控只看 QPS 不看延迟**。QPS 5000 看着正常，但 P99 可能已经 100ms。监控要看 \`instantaneous_ops_per_sec\` + 延迟。

> **坑 5：CLIENT LIST 不看 idle**。一堆 idle=3600 的僵尸连接占着连接池，浪费资源。定期清理。

> **坑 6：删 BigKey 用 DEL**。阻塞几秒，业务雪崩。用 \`UNLINK\`。

> **坑 7：MEMORY USAGE 采样不准**。大集合采样 5 个元素估算，可能误差 20%+。调大 SAMPLES。

> **坑 8：MONITOR 在生产用**。性能下降 50%+，绝对禁用。

> **坑 9：redis-benchmark 用顺序 key**。\`-r\` 不加，所有命令打同一个 key，测不出真实性能。

> **坑 10：fork 慢没监控**。大内存实例 fork 可能几百毫秒。看 \`latest_fork_usec\`，超 100ms 要排查（关 THP、减内存）。

## 27.9 本章小结

- **SLOWLOG**：慢查询日志，阈值 \`slowlog-log-slower-than\`（生产设 1-5ms），长度 \`slowlog-max-len\`（设 1024+）
- **KEYS 禁用**，用 SCAN/HSCAN/SSCAN/ZSCAN 替代，非阻塞游标扫描
- **INFO**：分模块查看，关注 QPS（\`instantaneous_ops_per_sec\`）、命中率、连接数、内存、\`latest_fork_usec\`、复制状态
- **INFO commandstats**：按 \`usec_per_call\` 找最慢的命令
- **MEMORY USAGE**：单 key 内存，配合 SCAN 找 BigKey；\`--bigkeys\`/\`--memkeys\` 一键扫描
- **LATENCY**：事件级延迟监控，看 fork、AOF、过期等耗时，\`LATENCY LATEST\`/\`LATENCY HISTORY\`/\`LATENCY GRAPH\`
- **redis-cli 工具**：\`--latency\`/\`--latency-history\`/\`--latency-dist\` 测延迟，\`--stat\` 实时统计，\`--hotkeys\` 找热点
- **redis-benchmark**：压测 QPS 和延迟，关注 P99 而非平均值
- **PIPELINE**：批量发送减少 RTT，但非原子，批次大小 1000-10000
- **HotKey**：\`--hotkeys\` + \`OBJECT FREQ\` 检测，本地缓存或拆分治理
- **MONITOR 禁用**：生产环境绝对不用，性能下降 50%+
- 监控指标：QPS、命中率、内存、连接数、慢查询数、延迟 P99、\`latest_fork_usec\``
  },
  {
    id: "redis-ch28",
    group: "第六部分 性能优化与运维实战",
    icon: "🛡️",
    title: "第 28 章 运维实战与安全",
    content: `# 第 28 章 运维实战与安全

经过前 27 章的学习，你已经掌握了 Redis 的开发能力。最后一章讲**生产运维**：怎么部署、怎么调优配置、怎么备份恢复、怎么保证安全、怎么升级、出故障怎么排查。这是把 Redis 用到生产的关键一课。安全无小事，运维见真章。

## 28.1 部署最佳实践

### 部署方案选择

| 场景 | 数据规模 | QPS | 推荐方案 |
| --- | --- | --- | --- |
| 开发/测试 | < 1GB | < 1000 | 单机 |
| 小业务 | < 10GB | < 1万 | 主从 + Sentinel |
| 中业务 | < 50GB | < 10万 | Cluster 3 主 3 从 |
| 大业务 | > 50GB | > 10万 | Cluster 多分片 + 多 IDC |
| 缓存（可丢） | 任意 | 任意 | 单机或主从（够用即可） |

### Linux 系统调优

\`\`\`bash
# 1. 关闭 THP（透明大页），避免 fork 慢
# THP 会让 fork 时复制大页，导致延迟飙升
echo never > /sys/kernel/mm/transparent_hugepage/enabled

# 永久生效：写入 /etc/rc.local
# 或用 systemd tuned profile

# 2. 调高文件描述符
ulimit -n 65535
# 永久生效：/etc/security/limits.conf
# redis soft nofile 65535
# redis hard nofile 65535

# 3. 调高 somaxconn（TCP 连接队列）
echo 1024 > /proc/sys/net/core/somaxconn
# 永久生效：/etc/sysctl.conf
# net.core.somaxconn = 1024

# 4. 关闭 swap（或调低 swappiness）
# swap 会让 Redis 性能急剧下降
echo 0 > /proc/sys/vm/swappiness
# 永久生效：/etc/sysctl.conf
# vm.swappiness = 0

# 5. 网络参数
echo 1 > /proc/sys/net/ipv4/tcp_tw_reuse

# 应用所有 sysctl 配置
sysctl -p
\`\`\`

> **THP 的坑**：开启 THP 时，Redis fork 后复制页表，每个 2MB 大页都要处理，导致 fork 耗时从毫秒级飙升到秒级。**必须关闭**。

### 部署方式

#### systemd 部署

\`\`\`ini
# /etc/systemd/system/redis.service
[Unit]
Description=Redis In-Memory Data Store
After=network.target

[Service]
Type=forking
User=redis
Group=redis
ExecStart=/usr/local/bin/redis-server /etc/redis/redis.conf
ExecStop=/usr/local/bin/redis-cli shutdown
Restart=always
RestartSec=3
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
\`\`\`

\`\`\`bash
# 启动 / 停止 / 重启
systemctl start redis
systemctl stop redis
systemctl restart redis

# 开机自启
systemctl enable redis

# 查看状态
systemctl status redis
\`\`\`

#### supervisord 部署

\`\`\`ini
# /etc/supervisor/conf.d/redis.conf
[program:redis]
command=/usr/local/bin/redis-server /etc/redis/redis.conf
user=redis
autostart=true
autorestart=true
startsecs=3
stopwaitsecs=10
stdout_logfile=/var/log/redis/redis.log
stderr_logfile=/var/log/redis/redis_err.log
\`\`\`

#### Docker 部署

\`\`\`bash
# 单实例
docker run -d \\
  --name redis \\
  -p 6379:6379 \\
  -v /data/redis:/data \\
  -v /etc/redis/redis.conf:/etc/redis/redis.conf \\
  redis:7.0 redis-server /etc/redis/redis.conf

# 注意：--maxmemory 要小于容器内存限制
# 容器内存限制 2g，maxmemory 设 1.5g（留 fork 空间）
docker run -d --memory=2g ... redis:7.0 redis-server \\
  --maxmemory 1.5gb \\
  --maxmemory-policy allkeys-lru
\`\`\`

> **Docker 部署注意**：
> - 单实例可以，注意内存限制和 fork 开销
> - 集群慎用：网络延迟、端口暴露、volume 持久化都有坑
> - K8s 用 StatefulSet + 持久化卷，配合 Redis Operator
> - 不要用 \`--net=host\`，有安全风险

### 部署清单

- [ ] Redis 版本：用稳定版（如 7.0.x LTS），不用最新版
- [ ] 监控：Prometheus + redis_exporter + Grafana
- [ ] 日志：logfile 配置，按天切割
- [ ] 持久化：AOF + RDB 混合
- [ ] 备份：每天全量备份到对象存储
- [ ] 高可用：Sentinel 或 Cluster
- [ ] 安全：密码 + ACL + 网络隔离
- [ ] 客户端：连接池 + 超时 + 重试
- [ ] 系统调优：THP 关闭、ulimit、swap
- [ ] 告警：内存、连接数、慢查询、主从断开

## 28.2 配置文件调优

### redis.conf 关键配置

\`\`\`conf
# ===== 网络 =====
bind 10.0.0.5 127.0.0.1       # 监听地址，生产只开放内网
protected-mode yes             # 保护模式
port 6379
tcp-backlog 511                # TCP 连接队列
tcp-keepalive 300              # TCP keepalive（秒）
timeout 0                      # 客户端空闲超时（0=不超时）

# ===== 通用 =====
daemonize yes                  # 后台运行
pidfile /var/run/redis.pid
logfile /var/log/redis/redis.log
databases 16                   # db 数量
always-show-logo no

# ===== 内存 =====
maxmemory 2gb                  # 内存上限
maxmemory-policy allkeys-lru   # 淘汰策略
maxmemory-samples 5            # 采样精度

# ===== 持久化 - RDB =====
save 900 1                     # 15 分钟内 1 个修改
save 300 10                    # 5 分钟内 10 个修改
save 60 10000                  # 1 分钟内 1 万个修改
dbfilename dump.rdb
dir /var/redis/data
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes

# ===== 持久化 - AOF =====
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec           # 每秒 fsync（折中）
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-load-truncated yes
aof-use-rdb-preamble yes       # 混合持久化

# ===== 复制 =====
repl-backlog-size 256mb        # backlog 大小
repl-timeout 60                # 复制超时
repl-disable-tcp-nodelay no

# ===== 客户端 =====
maxclients 10000               # 最大连接数
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60

# ===== 慢查询 =====
slowlog-log-slower-than 5000   # 5ms
slowlog-max-len 1024

# ===== 延迟监控 =====
latency-monitor-threshold 50

# ===== 懒删除 =====
lazyfree-lazy-eviction yes
lazyfree-lazy-expire yes
lazyfree-lazy-server-del yes
lazyfree-lazy-user-del yes
lazyfree-lazy-user-flush yes

# ===== Lua =====
lua-time-limit 5000           # Lua 超时（毫秒）

# ===== 安全 =====
requirepass YourStrongPassword123!
masterauth YourStrongPassword123!
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
maxmemory-policy volatile-lfu

# 不淘汰
maxmemory-policy noeviction       # 写满就报错（数据库场景）
\`\`\`

| 场景 | 推荐 | 说明 |
| --- | --- | --- |
| 纯缓存 | allkeys-lru | 最常用 |
| 缓存 + 部分持久数据 | volatile-lru | 持久数据不淘汰 |
| 强一致数据库 | noeviction | 写满报错，人工介入 |
| 热点数据明显 | allkeys-lfu | 按频率淘汰 |

### maxclients 与连接管理

\`\`\`conf
# 最大客户端数（默认 10000）
maxclients 10000

# 注意：maxclients 不含 Redis 内部连接（监听、复制等）
# 实际文件描述符 = maxclients + 32（预留）
\`\`\`

\`\`\`bash
# 查看当前连接数
127.0.0.1:6379> INFO clients
connected_clients:50
blocked_clients:2

# 调整 maxclients（需同时调 ulimit）
127.0.0.1:6379> CONFIG SET maxclients 20000
\`\`\`

> **连接泄漏**：如果 connected_clients 持续增长不下降，说明客户端没正确释放连接。排查客户端连接池配置。

### tcp-keepalive 与 timeout

\`\`\`conf
# tcp-keepalive：TCP 层心跳，检测死连接
tcp-keepalive 300   # 300 秒无响应认为死连接

# timeout：客户端空闲超时
timeout 0           # 0=不超时（默认）
timeout 300         # 300 秒空闲断开
\`\`\`

> **生产建议**：\`tcp-keepalive 60-300\`，\`timeout 0\`（让 tcp-keepalive 管理死连接，避免误杀长连接）。

## 28.3 备份与恢复

### RDB 备份

\`\`\`bash
# 手动触发 BGSAVE（异步，不阻塞）
127.0.0.1:6379> BGSAVE
Background saving started

# 查看最后保存时间
127.0.0.1:6379> LASTSAVE
(integer) 1609456789

# 查看保存状态
127.0.0.1:6379> INFO persistence | grep rdb
rdb_last_bgsave_status:ok
rdb_last_bgsave_time_sec:5
rdb_current_bgsave_time_sec:-1
rdb_last_cow_size:104857600

# 复制 dump.rdb 到备份位置
cp /var/redis/data/dump.rdb /backup/dump-$(date +%Y%m%d).rdb

# 定时备份（crontab）
0 3 * * * redis-cli BGSAVE && sleep 60 && cp /var/redis/data/dump.rdb /backup/dump-$(date +\\%Y\\%m\\%d).rdb
\`\`\`

### AOF 备份

\`\`\`bash
# 触发 AOF 重写（压缩）
127.0.0.1:6379> BGREWRITEAOF
Background append only file rewriting started

# 复制 appendonly.aof
cp /var/redis/data/appendonly.aof /backup/appendonly-$(date +%Y%m%d).aof
\`\`\`

### 从 RDB 恢复

\`\`\`bash
# 1. 停止 Redis
redis-cli SHUTDOWN

# 2. 替换 dump.rdb
cp /backup/dump-20240101.rdb /var/redis/data/dump.rdb

# 3. 启动 Redis（自动加载）
redis-server /etc/redis/redis.conf

# 4. 验证
redis-cli DBSIZE
(integer) 10000
\`\`\`

### 从 AOF 恢复

\`\`\`bash
# 1. 停止 Redis
# 2. 替换 appendonly.aof
cp /backup/appendonly-20240101.aof /var/redis/data/appendonly.aof

# 3. 如果 AOF 损坏，修复
redis-check-aof --fix /var/redis/data/appendonly.aof

# 4. 启动 Redis
\`\`\`

### 混合持久化（推荐）

\`\`\`conf
# 开启混合持久化（Redis 4.0+）
aof-use-rdb-preamble yes
# AOF 文件前半部分是 RDB 格式（快），后半是增量命令（全）
\`\`\`

\`\`\`bash
# 检查 AOF 文件格式
$ head -c 5 /var/redis/data/appendonly.aof
REDIS   # 表示是混合格式（RDB 开头）
\`\`\`

### 异地备份

\`\`\`bash
# 上传到 S3
aws s3 cp /backup/dump-20240101.rdb s3://my-bucket/redis-backup/

# 上传到 OSS（阿里云）
ossutil cp /backup/dump-20240101.rdb oss://my-bucket/redis-backup/

# 上传到 COS（腾讯云）
coscli cp /backup/dump-20240101.rdb cos://my-bucket/redis-backup/
\`\`\`

### 备份策略

> **生产备份策略**：
> - 每天 1 次全量备份（RDB），保留 7-30 天
> - 每小时 1 次增量（AOF），保留 24-72 小时
> - 异地备份，防机房故障
> - 定期演练恢复（半年 1 次，必须做！）

### POINT IN TIME 恢复

利用主从复制实现"回到过去"：

\`\`\`bash
# 场景：14:00 误删了数据，要恢复到 13:59

# 1. 停止当前主节点的写入（避免污染）
# 2. 准备一个空 Redis 实例
# 3. 用 13:00 的备份启动一个"临时主"
redis-server --port 6380 --dbfilename dump-1300.rdb
# 4. 把当前实例配成临时主的从
redis-cli -p 6379 REPLICAOF 127.0.0.1 6380
# 5. 等同步完成
redis-cli -p 6379 INFO replication | grep master_link_status
# 6. 停止同步（现在 6379 上是 13:00 的数据）
redis-cli -p 6379 REPLICAOF NO ONE
# 7. 用 AOF 回放到 13:59
\`\`\`

## 28.4 安全加固

### 密码认证

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

> **密码强度**：至少 16 位，含大小写数字符号。Redis 密码爆破工具很多，弱密码一秒被攻破。密码不要写在代码里，用环境变量或配置中心。

### ACL 访问控制（Redis 6.0+）

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
6) "list"
7) "hash"
8) "string"
9) "bitmap"
10) "hyperloglog"
11) "geo"
12) "stream"
13) "pubsub"
14) "admin"
15) "fast"
16) "slow"
17) "blocking"
18) "dangerous"
19) "connection"
20) "transaction"
21) "scripting"

# 查看 read 分类下的命令
127.0.0.1:6379> ACL CAT read
1) "get"
2) "mget"
3) "exists"
4) "strlen"
...

# 查看 dangerous 分类
127.0.0.1:6379> ACL CAT dangerous
1) "flushdb"
2) "flushall"
3) "keys"
4) "config"
5) "debug"
6) "shutdown"
...
\`\`\`

### ACL 语法详解

| 语法 | 含义 |
| --- | --- |
| \`+@all\` | 所有命令 |
| \`+@read\` | read 分类 |
| \`-@dangerous\` | 禁止 dangerous 分类 |
| \`+get\` | 允许 GET |
| \`-set\` | 禁止 SET |
| \`~cache:*\` | 只能访问 \`cache:\` 开头的 key |
| \`&channel:*\` | 只能订阅 \`channel:\` 开头的频道 |
| \`on\` / \`off\` | 启用/禁用用户 |
| \`>password\` | 设置密码 |
| \`nopass\` | 无密码 |
| \`resetkeys\` | 清空 key 权限 |
| \`reset\` | 重置为默认状态 |

### ACL 实战示例

\`\`\`bash
# 应用层用户：只能读写 app:* key
127.0.0.1:6379> ACL SETUSER app on >AppPass2024 ~app:* &* +@read +@write +@connection -@dangerous

# 分析层用户：只读，只能访问 report:*
127.0.0.1:6379> ACL SETUSER analyst on >AnalystPass2024 ~report:* &* +@read +@connection

# 管理员：全部权限
127.0.0.1:6379> ACL SETUSER admin on >AdminPass2024 ~* &* +@all

# 收紧 default 用户（生产建议）
127.0.0.1:6379> ACL SETUSER default off
\`\`\`

### ACL 持久化

\`\`\`conf
# ACL 配置文件
aclfile /etc/redis/users.acl
\`\`\`

\`\`\`bash
# 保存当前 ACL 到文件
127.0.0.1:6379> ACL SAVE
OK

# 从文件加载
127.0.0.1:6379> ACL LOAD
OK
\`\`\`

> **ACL 持久化坑**：CONFIG REWRITE 不会保存 ACL，必须用 ACL SAVE 或配置 aclfile。

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

- Redis **绝不暴露公网**
- 应用服务器和 Redis 在同一 VPC
- 安全组只放行应用服务器到 Redis 的 6379 端口
- 防火墙规则：

\`\`\`bash
# iptables 只允许应用服务器访问
iptables -A INPUT -p tcp --dport 6379 -s 10.0.0.10 -j ACCEPT
iptables -A INPUT -p tcp --dport 6379 -j DROP
\`\`\`

### 危险命令禁用

\`\`\`conf
# 禁用危险命令（设为空字符串）
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command KEYS ""
rename-command CONFIG ""        # 慎用，影响运维
rename-command DEBUG ""
rename-command SHUTDOWN ""
\`\`\`

> **注意**：
> - rename-command 在 Cluster 里要所有节点一致配置
> - 禁用 CONFIG 会影响部分运维工具，可改为改名：\`rename-command CONFIG b840fc02d52404542994ed59\u2026\`
> - 禁用后重启才生效

### TLS/SSL 加密（Redis 6.0+）

\`\`\`conf
# 开启 TLS
port 0                          # 关闭明文端口
tls-port 6379
tls-cert-file /etc/redis/redis.crt
tls-key-file /etc/redis/redis.key
tls-ca-cert-file /etc/redis/ca.crt
tls-auth-clients yes            # 客户端也要证书（双向认证）
tls-auth-clients no             # 客户端不需要证书
tls-replication yes             # 复制也用 TLS
tls-cluster yes                 # 集群总线也用 TLS
\`\`\`

\`\`\`bash
# 客户端用 TLS 连接
redis-cli --tls --cert client.crt --key client.key --cacert ca.crt -h redis.example.com
\`\`\`

> **TLS 性能影响**：约 10-15% 性能下降。内网通信且无合规要求可以不用，跨网络必须用。

## 28.5 升级策略

### 升级前准备

1. **备份**：升级前必须完整备份（RDB + AOF）
2. **看 Release Notes**：特别是 BREAKING CHANGES
3. **测试环境验证**：先在测试环境跑一周
4. **准备回滚**：保留老版本二进制和配置
5. **选时间窗口**：低峰期，业务容忍几秒切换

### 单机升级

\`\`\`bash
# 1. 备份
redis-cli BGSAVE
sleep 30
cp /var/redis/data/dump.rdb /backup/pre-upgrade-$(date +%Y%m%d).rdb

# 2. 停止
redis-cli SHUTDOWN

# 3. 替换二进制
cp /opt/redis-7.0/src/redis-server /usr/local/bin/

# 4. 启动
redis-server /etc/redis/redis.conf

# 5. 验证
redis-cli INFO server | grep redis_version
redis-cli DBSIZE
\`\`\`

### 主从滚动升级

\`\`\`bash
# 1. 先升级从节点
redis-cli -p 6380 SHUTDOWN
cp /opt/redis-7.0/src/redis-server /usr/local/bin/
redis-server /etc/redis/redis-6380.conf

# 2. 等从节点追上主
redis-cli -p 6380 INFO replication | grep master_link_status
# master_link_status:up 即同步完成

# 3. 切主（在从上执行）
redis-cli -p 6380 REPLICAOF NO ONE
# 或用 Sentinel 故障转移

# 4. 升级老主
redis-cli -p 6379 SHUTDOWN
cp /opt/redis-7.0/src/redis-server /usr/local/bin/
redis-server /etc/redis/redis-6379.conf

# 5. 把老主配成新主的从
redis-cli -p 6379 REPLICAOF 127.0.0.1 6380
\`\`\`

### Cluster 滚动升级

\`\`\`bash
# 一个节点一个节点升级，每升级一个等集群稳定
# 1. 升级某个 replica
# 2. 手动 failover，让 replica 变 master
redis-cli -p <replica_port> CLUSTER FAILOVER

# 3. 等集群状态恢复
redis-cli CLUSTER INFO | grep cluster_state
# cluster_state:ok

# 4. 升级老 master（现在是 replica）
# 5. 重复，直到所有节点升级完
\`\`\`

> **CLUSTER FAILOVER** 会让从节点接管主节点，期间有几秒不可用（取决于数据同步）。生产建议在低峰期。

### 版本升级路径

| 升级类型 | 兼容性 | 注意事项 |
| --- | --- | --- |
| 小版本（7.0.5 → 7.0.8） | 完全兼容 | 直接升级 |
| 大版本（6.x → 7.x） | 可能有破坏性 | 仔细看 Release Notes |
| 跨多版本（5.x → 7.x） | 风险高 | 逐步升级，先 5→6 再 6→7 |

Redis 各大版本破坏性变更：

- **Redis 7.0**：listpack 替代 ziplist，AOF 格式变化， FUNCTIONS 替代 EVAL
- **Redis 6.0**：ACL、SSL、RESP3、多线程 IO
- **Redis 5.0**：Stream 引入，删除 SORT 的用法变化

## 28.6 常见故障与排查

### 故障 1：内存满了

**现象**：

\`\`\`bash
127.0.0.1:6379> SET key value
(error) OOM command not allowed when used memory > 'maxmemory'.
\`\`\`

**排查**：

\`\`\`bash
127.0.0.1:6379> INFO memory
used_memory:2147483648     # 已经到 maxmemory
maxmemory:2147483648
maxmemory_policy:noeviction  # 不淘汰策略导致

# 看是哪些 key 占用
redis-cli --bigkeys
\`\`\`

**处理**：
1. 临时调大 maxmemory（治标）
2. 删除不用的 key（\`UNLINK\` 大 key）
3. 设置合理的淘汰策略（\`allkeys-lru\`）
4. 扩容（治本）

### 故障 2：fork 慢导致延迟飙升

**现象**：定期出现延迟尖峰，\`latest_fork_usec\` 很高

\`\`\`bash
127.0.0.1:6379> INFO stats | grep latest_fork_usec
latest_fork_usec:2000000   # 2 秒！严重

127.0.0.1:6379> LATENCY LATEST
1) 1) "fork"
   2) (integer) 1609456789
   3) (integer) 2000     # 2 秒
   4) (integer) 2500
\`\`\`

**原因**：内存大 + THP 开启

**处理**：

\`\`\`bash
# 1. 关闭 THP
echo never > /sys/kernel/mm/transparent_hugepage/enabled

# 2. 减小实例内存（分片）
# 3. 如果必须大内存，调低 save 频率
\`\`\`

### 故障 3：AOF 重写失败

**现象**：

\`\`\`bash
127.0.0.1:6379> INFO persistence
aof_last_bgrewrite_status:err
aof_last_write_status:err
\`\`\`

**原因**：磁盘满、磁盘故障、权限问题

**处理**：

\`\`\`bash
# 1. 看磁盘空间
df -h

# 2. 看系统日志
dmesg | tail

# 3. 清理磁盘空间
# 4. 修复权限
chown redis:redis /var/redis/data

# 5. 手动重试
redis-cli BGREWRITEAOF
\`\`\`

### 故障 4：主节点宕机

**现象**：Sentinel 集群里 master 挂了

**处理**（Sentinel 自动故障转移）：

\`\`\`bash
# 1. Sentinel 自动选举新主（约 10-30 秒）
# 2. 查看 Sentinel 状态
redis-cli -p 26379 SENTINEL masters
redis-cli -p 26379 SENTINEL replicas mymaster

# 3. 客户端会自动重连到新主
# 4. 老主恢复后，配成新主的从
redis-cli -p 6379 REPLICAOF <new_master_ip> <new_master_port>
\`\`\`

### 故障 5：Cluster 状态异常

\`\`\`bash
127.0.0.1:7000> CLUSTER INFO
cluster_state:fail            # 不是 ok！
cluster_slots_assigned:16384
cluster_slots_ok:12288        # 只有 12288 个 slot 在线
cluster_slots_fail:4096       # 4096 个 slot 不可用
\`\`\`

**原因**：某 master 和它的所有 replica 都挂了，对应 slot 不可用

**处理**：
1. 重启挂掉的节点
2. 如果数据丢了，从备份恢复
3. 紧急情况手动分配 slot：

\`\`\`bash
# 把 slot 5000 迁移到节点 A
redis-cli CLUSTER SETSLOT 5000 NODE <nodeA_id>
\`\`\`

### 故障 6：连接被拒

\`\`\`bash
# 现象：客户端报 "ERR max number of clients reached"
127.0.0.1:6379> INFO clients
connected_clients:10000   # 到 maxclients 上限
rejected_connections:500  # 被拒的连接数

# 看哪些客户端占着
127.0.0.1:6379> CLIENT LIST
\`\`\`

**处理**：
1. 杀掉僵尸连接（idle 时间长的）
2. 调大 maxclients
3. 排查客户端连接泄漏

### 故障 7：CPU 100%

\`\`\`bash
# 1. 看 QPS 是否暴涨
127.0.0.1:6379> INFO stats | grep instantaneous_ops_per_sec

# 2. 看是否有大 Lua 脚本运行
127.0.0.1:6379> INFO commandstats | grep eval

# 3. 看是否 activedefrag 在跑
127.0.0.1:6379> INFO memory | grep active_defrag

# 4. 看 bgsave 是否在跑
127.0.0.1:6379> INFO persistence | grep rdb_bgsave_in_progress

# 5. 看是否有 KEYS 等慢命令
127.0.0.1:6379> SLOWLOG GET 10
\`\`\`

### 故障排查清单

1. **现象**：什么报错？什么时间开始？影响范围？
2. **INFO**：看 server/memory/clients/stats/persistence/replication
3. **SLOWLOG**：找慢命令
4. **LATENCY**：找延迟事件
5. **CLIENT LIST**：看连接
6. **日志**：redis.log + 系统日志（dmesg）
7. **监控**：Prometheus 历史曲线
8. **OS 层**：top/iostat/vmstat 看资源

## 28.7 Redis vs Memcached 对比

| 特性 | Redis | Memcached |
| --- | --- | --- |
| 数据结构 | String/List/Hash/Set/ZSet/Stream/Bitmap/HLL/Geo | 仅 String |
| 持久化 | RDB + AOF | 无 |
| 集群 | 原生 Cluster | 客户端分片 |
| 高可用 | Sentinel 自动故障转移 | 无 |
| 单 value 大小 | 512MB | 1MB |
| 内存管理 | jemalloc，支持多种编码 | slab 分配 |
| 线程模型 | 单线程（6.0+ 多线程 IO） | 多线程 |
| 事务 | MULTI/EXEC + Lua | 无 |
| 过期策略 | 惰性 + 主动 | 惰性 |
| 复制 | 主从复制 | 无 |
| 适用场景 | 缓存 + 数据库 + 消息队列 | 纯缓存 |

> **选择建议**：
> - **纯缓存、value 小、追求极致简单**：Memcached 够用
> - **需要数据结构、持久化、高可用**：选 Redis
> - **不确定就选 Redis**，功能更全

## 28.8 生产上线 Checklist

### 上线前检查

- [ ] **版本**：稳定版（非最新版），如 7.0.x
- [ ] **配置**：maxmemory + 淘汰策略 + 持久化 + 密码
- [ ] **系统**：THP 关闭、ulimit、swappiness=0
- [ ] **监控**：Prometheus + redis_exporter + 告警规则
- [ ] **日志**：logfile + 切割
- [ ] **备份**：每日全量 + 异地 + 演练
- [ ] **高可用**：Sentinel 或 Cluster
- [ ] **安全**：密码 + ACL + 网络隔离 + 禁危险命令
- [ ] **客户端**：连接池 + 超时 + 重试 + 熔断
- [ ] **容量规划**：预留 30% 内存余量

### 告警规则

| 指标 | 阈值 | 紧急程度 |
| --- | --- | --- |
| 内存使用率 | > 80% | 警告 |
| 内存使用率 | > 90% | 严重 |
| 内存碎片率 | > 1.5 | 警告 |
| 内存碎片率 | > 2.0 | 严重 |
| 连接数 | > 80% maxclients | 警告 |
| 慢查询数（5min 内） | > 10 | 警告 |
| 主从同步断开 | > 0 | 严重 |
| Cluster 状态 | != ok | 严重 |
| RDB/AOF 失败 | status != ok | 严重 |
| 命中率 | < 80% | 警告 |
| 延迟 P99 | > 10ms | 警告 |
| CPU 使用率 | > 70% | 警告 |

## 28.9 踩坑提示

> **坑 1：maxmemory 设满物理内存**。没留 fork 和 buffer 空间，导致 OOM 或 swap。预留 30%。

> **坑 2：忘关 THP**。fork 延迟飙升，定期卡顿。

> **坑 3：AOF fsync=always**。每个命令都 fsync，性能下降 10 倍+。用 everysec。

> **坑 4：rename-command 不一致**。Cluster 各节点配置不一致，导致部分命令在部分节点失效。

> **坑 5：ACL 没持久化**。重启后 ACL 丢失。配 aclfile + ACL SAVE。

> **坑 6：备份没演练**。以为有备份，真恢复时发现备份损坏。定期演练。

> **坑 7：升级不读 Release Notes**。大版本升级有破坏性变更，直接升级导致故障。

> **坑 8：监控只看 QPS**。QPS 正常不代表健康，要看延迟、内存、命中率、同步状态。

> **坑 9：Docker 不限内存**。容器 OOM 把 Redis 杀了。用 \`--memory\` + \`maxmemory\`。

> **坑 10：公网暴露 Redis**。无密码或弱密码 + 公网 = 被勒索/挖矿。绝不暴露公网。

## 28.10 本章小结

- **部署**：单机/主从/Cluster 按规模选，systemd/supervisord/Docker 部署，Linux 调优（THP、ulimit、swap）
- **配置**：\`maxmemory\` + 淘汰策略、持久化、\`slowlog\`、\`lazyfree\`、\`maxclients\`、\`tcp-keepalive\`
- **备份**：RDB + AOF 混合，每日全量 + 异地备份，定期演练恢复
- **安全**：强密码（\`requirepass\`）、ACL 按用户授权、网络隔离（\`bind\`/\`protected-mode\`）、禁危险命令（\`rename-command\`）、TLS
- **ACL**：Redis 6.0+，\`ACL SETUSER\`/\`ACL WHOAMI\`/\`ACL LIST\`/\`ACL GETUSER\`，按命令分类和 key 前缀授权
- **升级**：滚动升级，先 replica 后 master，备份兜底，低峰期操作
- **故障排查**：INFO + SLOWLOG + LATENCY + CLIENT LIST + 日志 + 监控
- **常见故障**：内存满、fork 慢、AOF 失败、主节点宕机、Cluster 异常、连接被拒、CPU 100%
- **Redis vs Memcached**：Redis 功能全（数据结构/持久化/高可用），Memcached 简单快

恭喜你读完了《Redis 实战教程》！把书里的知识用到生产实践中，多踩坑多总结，你就是团队的 Redis 专家了。`
  }
];

export { chapters };
