// =============================================================
// 《Redis 实战教程》- 章节批次 3
// -------------------------------------------------------------
// 内容：第三部分 持久化与过期策略（第 12-14 章）
// =============================================================

const chapters = [
  {
    id: "redis-ch12",
    group: "第三部分 持久化与过期策略",
    icon: "💾",
    title: "第 12 章 RDB 持久化",
    content: `# 第 12 章 RDB 持久化

Redis 是内存数据库，断电即失。为了不丢数据，Redis 提供两种持久化机制：**RDB**（快照）和 **AOF**（日志）。本章深入 RDB 的工作原理、触发方式、文件结构与优缺点。

## 12.1 RDB 的工作原理

RDB（Redis Database）是把**某一时刻内存中的全部数据**以二进制形式写入磁盘的快照文件（默认 \`dump.rdb\`）。

### 核心机制：fork + COW

Redis 主进程在持久化时调用 \`fork()\` 创建子进程，子进程负责把内存数据写盘。关键点：

1. **fork 是写时复制（Copy-On-Write）**：子进程与父进程共享内存页，只有父进程修改某页时才真正复制。
2. **子进程写盘不影响主进程处理命令**：持久化期间 Redis 仍可正常读写。
3. **快照是某一瞬间的状态**：fork 那一刻的数据，之后的修改不在快照里。

\`\`\`bash
# 查看持久化状态
127.0.0.1:6379> INFO persistence
# rdb_last_save_time:1700000000   最近一次 RDB 完成时间
# rdb_changes_since_last_save:120  自上次 RDB 后的修改数
# rdb_bgsave_in_progress:0         是否正在 BGSAVE
\`\`\`

> **fork 的代价**：fork 本身是 O(内存大小) 的操作（要复制页表），大内存实例（>10GB）fork 可能阻塞几十到几百毫秒。这是 RDB 在大实例上的主要痛点。

## 12.2 触发 RDB（SAVE / BGSAVE）

### 手动触发

\`\`\`bash
# SAVE：阻塞主线程，期间 Redis 不响应任何命令（生产禁用！）
127.0.0.1:6379> SAVE
OK

# BGSAVE：后台 fork 子进程，不阻塞（推荐）
127.0.0.1:6379> BGSAVE
Background saving started

# 查看最近一次 BGSAVE 状态
127.0.0.1:6379> LASTSAVE
(integer) 1700000000
\`\`\`

> **SAVE 的用途**：几乎只用于"我知道现在没流量，要立刻拿到精确快照"的运维场景，或迁移前的手动备份。线上常规绝不用 SAVE。

### 自动触发（配置）

在 \`redis.conf\` 中配置 \`save\` 规则，满足任一条件就自动 BGSAVE：

\`\`\`bash
# redis.conf
save 3600 1     # 3600 秒内有 1 次修改
save 300 100    # 300 秒内有 100 次修改
save 60 10000   # 60 秒内有 10000 次修改

# 关闭自动 RDB（纯缓存场景）
# save ""
\`\`\`

\`\`\`bash
# 运行时查看当前 save 配置
127.0.0.1:6379> CONFIG GET save
1) "save"
2) "3600 1 300 100 60 10000"

# 运行时修改（重启失效，要持久化用 CONFIG REWRITE）
127.0.0.1:6379> CONFIG SET save "900 1 300 10 60 10000"
OK
127.0.0.1:6379> CONFIG REWRITE
OK
\`\`\`

### 其他自动触发场景

- **主从全量同步**：从节点首次连接主节点，主节点会触发 BGSAVE 生成快照传给从节点。
- **SHUTDOWN**：正常关闭 Redis 时，默认会做一次 SAVE（除非 \`SHUTDOWN NOSAVE\`）。
- **AOF 重写**：不影响 RDB，但同属 fork 操作。
- **DEBUG RELOAD**：调试用，会先 SAVE 再重启加载。

## 12.3 RDB 文件结构

RDB 文件是紧凑的二进制格式，结构大致为：

\`\`\`
+--------+--------+-----------+--------+-----+--------+--------+
| MAGIC  | VER    | META      | DB 0   | ... | DB N   | CRC64  |
| REDIS  | 0011   | (aux字段) | 数据   |     | 数据   | 校验和 |
+--------+--------+-----------+--------+-----+--------+--------+
\`\`\`

### 查看与解析

\`\`\`bash
# 默认路径（看 redis.conf 的 dir + dbfilename）
127.0.0.1:6379> CONFIG GET dir
1) "dir"
2) "/var/lib/redis"
127.0.0.1:6379> CONFIG GET dbfilename
1) "dbfilename"
2) "dump.rdb"

# 文件大小
ls -lh /var/lib/redis/dump.rdb

# 用 redis-check-rdb 校验完整性
redis-check-rdb /var/lib/redis/dump.rdb
\`\`\`

### RDB 压缩

\`\`\`bash
# redis.conf
rdbcompression yes   # 默认开启，用 LZF 压缩字符串
rdbchecksum yes      # 默认开启，文件末尾加 CRC64 校验
\`\`\`

> **压缩权衡**：开启压缩文件小（约压缩到原始的 30~50%），但 BGSAVE 时 CPU 占用略高。默认开，CPU 紧张的场景可关。

## 12.4 RDB 的优缺点

### 优点

- **文件紧凑**：二进制 + 压缩，适合备份、传输、灾难恢复。
- **恢复快**：启动时直接 load 二进制到内存，比 AOF 重放快得多。
- **fork 后不影响主进程**：持久化期间 Redis 仍正常服务。
- **适合冷备**：每小时一个 RDB，按时间归档，是干净的"时间点备份"。

### 缺点

- **数据有丢失窗口**：两次 RDB 之间的修改会丢。如配置 \`save 300 100\`，最坏丢 5 分钟数据。
- **fork 阻塞**：大内存实例 fork 慢，期间主线程短暂卡顿。
- **不适合实时性要求高的场景**：要秒级不丢数据用 AOF。

### 数据丢失量估算

| save 配置 | 最坏丢失 |
| --- | --- |
| \`save 900 1\` | 15 分钟 |
| \`save 300 100\` | 5 分钟 |
| \`save 60 10000\` | 1 分钟 |
| 纯 RDB，密集配置 | 仍以分钟计 |

> **缓存场景**：如果 Redis 只当缓存，丢数据无所谓，可以 \`save ""\` 关掉 RDB，性能最佳。

## 12.5 配置参数

完整 RDB 相关配置：

\`\`\`bash
# redis.conf 核心参数

# 触发规则（见 12.2）
save 3600 1 300 100 60 10000

# 文件名与目录
dbfilename dump.rdb
dir /var/lib/redis

# 压缩与校验
rdbcompression yes
rdbchecksum yes

# fork 出错时停止写入（保护数据一致性）
stop-writes-on-bgsave-error yes

# RDB 文件名按日期生成（脚本备份常用）
# 启动时用 --rdb 参数指定
\`\`\`

### stop-writes-on-bgsave-error

\`\`\`bash
# 默认 yes：BGSAVE 失败（如磁盘满）时，Redis 拒绝所有写命令，返回错误
# 这是为了避免"以为持久化成功其实没成功"的错觉
# 设为 no 则即使 BGSAVE 失败仍可写，但有数据丢失风险
stop-writes-on-bgsave-error yes
\`\`\`

> **生产务必保持 yes**：宁可写不进去，也别让用户以为数据安全了其实没落盘。

## 12.6 踩坑提示

- **大内存 fork 卡顿**：20GB 实例 fork 可能阻塞 100ms+，敏感业务用小实例分片或换 AOF。
- **磁盘满导致 BGSAVE 失败**：监控 \`rdb_last_bgsave_status\`，失败时告警。
- **save 配置过密**：\`save 60 1\` 会让低流量场景频繁 fork，浪费 CPU。根据业务调。
- **关 RDB 的实例重启丢数据**：\`save ""\` 关掉后，重启内存数据全没，纯缓存才能这么干。
- **备份要异地**：本机 RDB 文件机器挂了就没了，定时 rsync 到对象存储。
- **fork 期间大量写入**：COW 会复制大量内存页，可能让内存占用翻倍，留足内存余量。
- **RDB 文件版本兼容**：高版本 RDB 不能被低版本 Redis 加载，降级时注意。

## 12.7 本章小结

- RDB 是某一时刻的全量内存快照，二进制紧凑文件，恢复快。
- 核心机制：**fork 子进程 + 写时复制**，持久化不阻塞主线程。
- 触发方式：**SAVE**（阻塞，禁用）、**BGSAVE**（后台，推荐）、**save 配置**（自动）。
- 文件由 \`redis-check-rdb\` 校验，\`rdbcompression\`/\`rdbchecksum\` 默认开启。
- 优点：紧凑、恢复快、适合冷备；缺点：有分钟级丢失窗口、大实例 fork 卡顿。
- 缓存场景可 \`save ""\` 关闭；要数据安全必配 AOF（见下章）。
- 监控指标：\`rdb_last_bgsave_status\`、\`rdb_last_save_time\`、\`rdb_changes_since_last_save\`。

下一章学习另一种持久化方式——**AOF 日志**，看 Redis 如何做到秒级不丢数据。`
  },
  {
    id: "redis-ch13",
    group: "第三部分 持久化与过期策略",
    icon: "📜",
    title: "第 13 章 AOF 持久化",
    content: `# 第 13 章 AOF 持久化

RDB 是"定时快照"，两次快照间的数据会丢。AOF（Append-Only File）则把**每条写命令**追加到日志，重启时重放命令恢复数据，能做到秒级甚至毫秒级不丢。

## 13.1 AOF 的工作原理

AOF 的核心思路：**先执行命令，再追加日志**（与 MySQL binlog 的"先写日志再改数据"相反）。

### 工作流程

1. 客户端发写命令。
2. Redis 主进程执行命令。
3. 命令以 RESP 协议格式追加到 AOF 缓冲区（内存）。
4. 根据刷盘策略，缓冲区内容写入 AOF 文件。
5. AOF 文件过大时触发**重写**。

\`\`\`bash
# 开启 AOF
127.0.0.1:6379> CONFIG SET appendonly yes
OK

# 查看状态
127.0.0.1:6379> INFO persistence
# aof_enabled:1                AOF 是否开启
# aof_rewrite_in_progress:0    是否正在重写
# aof_last_size:1024           上次重写后文件大小
# aof_current_size:2048        当前文件大小
# aof_last_bgrewrite_status:ok 上次重写状态
\`\`\`

### AOF 文件内容

\`\`\`bash
# 执行 SET k1 v1 后，AOF 文件里是 RESP 协议文本：
cat appendonly.aof
*3
$3
SET
$2
k1
$2
v1
\`\`\`

> **为什么先执行后写日志？** 避免记录"语法错误"或"运行时失败"的命令。缺点是若命令执行后、写日志前宕机，这条命令会丢——但相比"先写日志导致无效命令被重放"更合理。

## 13.2 AOF 三种刷盘策略

\`appendfsync\` 决定多久把 AOF 缓冲区刷到磁盘：

\`\`\`bash
# redis.conf
appendfsync everysec
\`\`\`

| 策略 | 含义 | 性能 | 数据安全 |
| --- | --- | --- | --- |
| \`always\` | 每条命令都 fsync | 最差（每写一次盘） | 不丢，但吞吐骤降 |
| \`everysec\`（默认/推荐） | 每秒 fsync 一次 | 接近无 AOF | 最多丢 1 秒 |
| \`no\` | 由 OS 决定何时刷 | 最好 | 丢 OS 缓冲内的数据（30 秒级） |

\`\`\`bash
# 查看当前策略
127.0.0.1:6379> CONFIG GET appendfsync
1) "appendfsync"
2) "everysec"

# 动态修改
127.0.0.1:6379> CONFIG SET appendfsync everysec
OK
\`\`\`

> **生产标配 everysec**：在性能和安全间最佳平衡。最多丢 1 秒数据，对绝大多数业务可接受。金融级要 always，但要接受吞吐下降。

### always 的真相

\`always\` 不是真的"每条都同步刷盘"，而是"每条命令都调用 fsync"。在 SSD 上单线程 fsync 约 100~200μs，意味着 Redis 吞吐被锁在约 5000~10000 QPS。**除非数据极度敏感，否则别用 always**。

## 13.3 AOF 重写

AOF 是追加日志，越写越长。一条 key 被改 1000 次，AOF 里就有 1000 条命令，但当前状态只需要最后一条。**重写**就是根据当前内存状态生成最小 AOF。

### 触发方式

\`\`\`bash
# 手动触发（后台）
127.0.0.1:6379> BGREWRITEAOF
Background append only file rewriting started

# 自动触发条件
# auto-aof-rewrite-percentage: 文件比上次重写后增长百分比
# auto-aof-rewrite-min-size: 文件最小多大才触发
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
\`\`\`

> **默认配置**：AOF 文件 ≥ 64MB 且比上次重写后大一倍，就自动重写。

### 重写过程

1. 主进程 fork 子进程。
2. 子进程遍历内存，把当前状态写成新 AOF（如 \`SET k v\` 而非 1000 条历史命令）。
3. 重写期间，主进程的新写命令同时写入**AOF 缓冲区**和**AOF 重写缓冲区**。
4. 子进程完成后，主进程把重写缓冲区的命令追加到新 AOF。
5. 原子替换旧 AOF 文件。

\`\`\`bash
# 监控重写进度
127.0.0.1:6379> INFO persistence
# aof_rewrite_scheduled:0          是否有待执行的重写
# aof_rewrite_in_progress:0        是否正在重写
# aof_last_bgrewrite_status:ok     上次重写结果
\`\`\`

### 重写期间不阻塞

子进程写新 AOF 时，主进程继续处理命令。重写结束时的"替换"操作是原子 rename，几乎无开销。

> **重写的代价**：和 RDB 一样要 fork，大内存实例有卡顿风险；且重写期间内存占用增加（重写缓冲区）。

## 13.4 AOF 的优缺点

### 优点

- **数据安全**：\`everysec\` 最多丢 1 秒，\`always\` 不丢。
- **可读性强**：AOF 是文本日志，能直接看命令、人工修复。
- **灾难恢复友好**：误操作（如 FLUSHALL）后，立即停 Redis，编辑 AOF 删掉那行，重启可恢复。

### 缺点

- **文件大**：相同数据 AOF 比 RDB 大得多（命令 + 协议开销）。
- **恢复慢**：启动要重放所有命令，比 RDB load 慢数倍。
- **写性能略降**：每条写命令多一次磁盘 IO（\`everysec\` 下影响小）。
- **重写 fork 卡顿**：同 RDB 痛点。

### RDB vs AOF 对比

| 维度 | RDB | AOF |
| --- | --- | --- |
| 数据安全 | 分钟级丢失 | 秒级（everysec） |
| 文件大小 | 小（紧凑二进制） | 大（文本命令） |
| 恢复速度 | 快 | 慢 |
| 性能影响 | 低（fork 时） | 略高（每写多一次 IO） |
| 可读性 | 不可读 | 可读 |
| 适用 | 冷备、缓存、可接受丢失 | 数据库、要求不丢 |

## 13.5 RDB + AOF 混合持久化

Redis 4.0 引入**混合持久化**，结合两者优点，已成为生产标配。

### 工作原理

- **AOF 重写时**：不再写文本命令，而是先写一段 RDB 格式的全量数据，之后的增量命令才用 AOF 文本。
- **加载时**：先 load RDB 部分（快），再重放 AOF 增量（少），兼顾速度和安全。

\`\`\`bash
# 开启混合持久化（4.0+ 默认开启）
127.0.0.1:6379> CONFIG GET aof-use-rdb-preamble
1) "aof-use-rdb-preamble"
2) "yes"

# 7.0+ 改名为 aof-timestamp-enabled 等相关配置
# 多 PART AOF（7.0+）：把 AOF 拆成 base + incr 多文件
\`\`\`

### 7.0 多 PART AOF

Redis 7.0 重构了 AOF 存储，拆成多文件：

\`\`\`
appendonlydir/
├── appendonly.aof.1.base.rdb     # base 文件（RDB 格式全量）
├── appendonly.aof.1.incr.aof     # 增量命令日志
└── appendonly.aof.manifest       # 清单文件
\`\`\`

好处：① 重写时不用一次性生成整个新文件，内存占用更稳；② base 和 incr 分离，便于管理。

\`\`\`bash
# 查看新结构
ls -lh appendonlydir/

# 校验
redis-check-aof --fix appendonlydir/appendonly.aof.1.base.rdb
\`\`\`

### 加载顺序

Redis 启动时优先级：

1. 若开启 AOF，加载 AOF（含混合的 RDB 部分）。
2. 否则加载 RDB。
3. 都没有则空启动。

\`\`\`bash
# 启动日志会显示加载过程
# * Loading RDB produced by version ...
# * Loading AOF with base ...
\`\`\`

## 13.6 踩坑提示

- **always 别滥用**：吞吐掉一个数量级，金融场景才考虑。
- **AOF 文件损坏无法启动**：用 \`redis-check-aof --fix\` 修复，但可能丢末尾不完整命令。
- **重写期间磁盘满**：重写失败，AOF 仍是旧的，监控 \`aof_last_bgrewrite_status\`。
- **everysec 的丢 1 秒**：是"最多丢 1 秒"，不是"丢最后 1 秒"。fsync 间隔内的数据丢。
- **AOF 太大**：检查重写配置是否合理，\`auto-aof-rewrite-min-size\` 别设太大。
- **误操作 FLUSHALL 后**：立即 \`SHUTDOWN NOSAVE\`，编辑 AOF 删掉 FLUSHALL 那行，重启可恢复（AOF 还没被重写覆盖时）。
- **混合持久化兼容性**：4.0 前的 Redis 无法加载混合 AOF，降级时注意。
- **多 PART AOF 迁移**：7.0 的 AOF 目录结构变了，从 7.0 降到 6.x 需要手动处理。

## 13.7 本章小结

- AOF 追加每条写命令到日志，重启重放恢复，做到秒级不丢。
- 工作流程：执行命令 → 写 AOF 缓冲区 → 按 \`appendfsync\` 刷盘。
- 三种刷盘：\`always\`（不丢但慢）、\`everysec\`（默认推荐，最多丢 1 秒）、\`no\`（交给 OS）。
- **重写**：根据当前内存生成最小 AOF，手动 BGREWRITEAOF 或自动按百分比/大小触发。
- 优点：安全、可读、易恢复误操作；缺点：文件大、恢复慢、IO 略增。
- **混合持久化（4.0+）**：AOF 重写时 base 用 RDB 格式，增量用 AOF，兼顾速度与安全，生产标配。
- **多 PART AOF（7.0+）**：base + incr 多文件，重写更稳。
- 启动加载优先级：AOF > RDB > 空启动。
- 生产建议：**混合持久化 + everysec**，兼顾性能与安全。

下一章学习 Redis 如何管理过期 key 和内存——**过期策略与内存淘汰**，搞懂数据自动清理和 OOM 防护。`
  },
  {
    id: "redis-ch14",
    group: "第三部分 持久化与过期策略",
    icon: "⏰",
    title: "第 14 章 过期策略与内存淘汰",
    content: `# 第 14 章 过期策略与内存淘汰

Redis 是内存数据库，内存有限。本章回答两个核心问题：**设了 TTL 的 key 什么时候被删？内存满了怎么办？** 这两套机制决定了 Redis 的稳定性和数据保留策略。

## 14.1 设置过期时间

第 2 章已介绍过期时间设置，这里系统回顾：

\`\`\`bash
# 秒级
127.0.0.1:6379> EXPIRE key 60
# 毫秒级
127.0.0.1:6379> PEXPIRE key 60000
# 时间戳（秒）
127.0.0.1:6379> EXPIREAT key 1735689600
# 时间戳（毫秒）
127.0.0.1:6379> PEXPIREAT key 1735689600000

# SET 时直接带（推荐，原子）
127.0.0.1:6379> SET key val EX 60
127.0.0.1:6379> SET key val PX 60000

# 查看 TTL
127.0.0.1:6379> TTL key        # 秒
127.0.0.1:6379> PTTL key       # 毫秒

# 取消过期
127.0.0.1:6379> PERSIST key
\`\`\`

### TTL 返回值含义

| 返回 | 含义 |
| --- | --- |
| -2 | key 不存在（已过期或被删） |
| -1 | key 存在但无过期时间 |
| 正数 | 剩余秒/毫秒 |

> **过期时间存储**：Redis 用一个独立的 **expires 字典**（redisDb.expires）保存 key → 过期时间戳的映射，主字典 redisDb.dict 保存 key → value。两者 key 相同但分开存储。

### 哪些操作会清除 TTL

- \`DEL\` / \`SET\`（不带 KEEPTTL）：清除 TTL，新值变永久。
- \`RENAME\`：TTL 跟随 key 一起转移。
- \`PERSIST\`：主动清除。
- \`EXPIRE\`/\`PEXPIRE\`：覆盖旧 TTL。

\`\`\`bash
# SET 覆盖 TTL 的坑
127.0.0.1:6379> SET k v EX 60
OK
127.0.0.1:6379> TTL k
(integer) 58
127.0.0.1:6379> SET k v        # 不带 EX，TTL 没了
OK
127.0.0.1:6379> TTL k
(integer) -1

# KEEPTTL 保留（6.0+）
127.0.0.1:6379> SET k v2 EX 60
OK
127.0.0.1:6379> SET k v3 KEEPTTL
OK
127.0.0.1:6379> TTL k
(integer) 52
\`\`\`

## 14.2 过期策略（惰性删除 / 定期删除）

设了 TTL 的 key，到时间不会立刻消失——Redis 用**两种策略配合**清理过期 key。

### 惰性删除（Lazy Expiration）

访问 key 时才检查是否过期，过期则删除。

\`\`\`bash
# 客户端访问触发
127.0.0.1:6379> SET k v EX 5
OK
# 等 6 秒后访问
127.0.0.1:6379> GET k
(nil)    # 此时才删除并返回 nil
\`\`\`

**优点**：CPU 友好，只在访问时检查，不浪费资源扫不活跃的 key。
**缺点**：**内存泄漏**——过期但无人访问的 key 会一直占内存。

### 定期删除（Active Expiration）

Redis 每秒执行 10 次（\`hz\` 配置控制）定期清理：

1. 从 expires 字典随机抽 20 个 key。
2. 删除其中已过期的。
3. 如果过期比例 > 25%，重复步骤 1。
4. 每轮执行不超过 25 毫秒（避免阻塞）。

\`\`\`bash
# 配置 hz（每秒执行周期任务的频率）
# redis.conf
hz 10

# 自适应模式（5.0+）：空闲时降低 hz 省 CPU，忙时提高
dynamic-hz yes
\`\`\`

> **两者结合**：惰性删除保证访问的 key 一定干净；定期删除回收无人访问的过期 key。Redis 还在底层用引用计数 + 共享对象进一步管理。

### 主动过期命令

\`\`\`bash
# 主动检查并过期（4.0+，不阻塞）
127.0.0.1:6379> MEMORY USAGE k
# 主动扫描（7.0+ 的 LAZYFREE 模式相关）
\`\`\`

### 监控过期情况

\`\`\`bash
127.0.0.1:6379> INFO stats
# expired_keys:1234         累计过期删除的 key 数
# evicted_keys:0            因内存淘汰被删的 key 数
# keyspace_misses:0         未命中次数
\`\`\`

> **过期不及时的坑**：如果大量 key 同时过期，定期删除会忙一阵；如果这些 key 一直没人访问，内存可能不释放，要靠内存淘汰机制兜底。

## 14.3 内存淘汰策略（8 种）

当 Redis 用内存达到 \`maxmemory\` 上限时，按 \`maxmemory-policy\` 决定删谁腾地方。

### 配置

\`\`\`bash
# redis.conf
maxmemory 4gb
maxmemory-policy allkeys-lru

# 运行时查看
127.0.0.1:6379> CONFIG GET maxmemory
1) "maxmemory"
2) "4294967296"
127.0.0.1:6379> CONFIG GET maxmemory-policy
1) "maxmemory-policy"
2) "allkeys-lru"

# 运行时修改
127.0.0.1:6379> CONFIG SET maxmemory 8gb
OK
127.0.0.1:6379> CONFIG SET maxmemory-policy allkeys-lfu
OK
\`\`\`

### 8 种策略总览

| 策略 | 范围 | 算法 | 适用 |
| --- | --- | --- | --- |
| \`noeviction\` | 不淘汰 | — | 写满即报错，适合不能丢数据的场景 |
| \`allkeys-lru\` | 所有 key | LRU | 通用缓存（推荐） |
| \`allkeys-lfu\` | 所有 key | LFU | 有明显热点的缓存 |
| \`allkeys-random\` | 所有 key | 随机 | 无明显访问模式 |
| \`volatile-lru\` | 仅有过期时间的 key | LRU | 混合存储（部分数据不能丢） |
| \`volatile-lfu\` | 仅有过期时间的 key | LFU | 同上 |
| \`volatile-random\` | 仅有过期时间的 key | 随机 | 同上 |
| \`volatile-ttl\` | 仅有过期时间的 key | 优先删快过期的 | 让快要过期的先走 |

### noeviction 的行为

\`\`\`bash
# 内存满后，写命令返回错误
127.0.0.1:6379> SET newkey val
(error) OOM command not allowed when used memory > 'maxmemory'.
# 读命令（GET 等）仍可执行
127.0.0.1:6379> GET oldkey
"val"
\`\`\`

> **noeviction 的用途**：Redis 当主数据库用、绝对不能丢数据时。但要配合监控，否则一旦满内存所有写都失败。

### volatile-* 的注意点

\`\`\`bash
# 如果没有任何 key 设了 TTL，volatile-* 策略等同 noeviction
# 写命令会报 OOM 错误
\`\`\`

> **混合存储陷阱**：用 \`volatile-lru\` 时，没设 TTL 的 key 永远不会被淘汰，可能让设了 TTL 的 key 被清空而永久 key 占满内存。务必确认所有"可丢"的 key 都设了 TTL。

## 14.4 LRU vs LFU

Redis 用的是**近似 LRU/LFU**，不是精确算法，性能更好。

### 近似 LRU

Redis 不维护全局链表（太贵），而是**随机抽样 N 个 key**（默认 5），淘汰其中最久未访问的。

\`\`\`bash
# 抽样数量，越大越接近真实 LRU，但 CPU 开销越大
maxmemory-samples 5
\`\`\`

> **LRU 的局限**：偶尔被访问的冷数据会"挤掉"长期热点。比如一个偶尔被读的 key 刚被访问，LRU 会认为它"热"。

### 近似 LFU（4.0+）

LFU（Least Frequently Used）按**访问频率**淘汰，更适合"有明显热点"的场景。每个 key 维护一个**对数计数器**（8 位，0~255）和最后访问时间。

\`\`\`bash
# LFU 相关配置
# 计数器衰减因子（越大衰减越慢，热点更持久）
lfu-log-factor 10
# 多久没访问就衰减一次（分钟）
lfu-decay-time 1
\`\`\`

### LRU vs LFU 对比

| 场景 | LRU | LFU |
| --- | --- | --- |
| 周期性扫表（偶尔全量读） | 误判为热 | 不受影响 |
| 突发热点 | 命中快 | 需要积累访问次数 |
| 长期热点 + 偶尔冷读 | 可能挤掉热点 | 稳定保留热点 |
| 实现复杂度 | 简单 | 略复杂 |

> **选型建议**：默认 \`allkeys-lru\`；如果业务有明显热点（如商品详情、热门文章）且偶有批量扫描，用 \`allkeys-lfu\`。

## 14.5 选择合适的淘汰策略

### 决策树

\`\`\`bash
# 1. Redis 是纯缓存吗？
#    是 -> allkeys-lru / allkeys-lfu
#    否 -> 进入 2

# 2. 数据能丢吗？
#    完全不能丢 -> noeviction（配合监控告警）
#    部分能丢 -> volatile-* 系列

# 3. 用 volatile-* 时，所有可丢 key 都设了 TTL 吗？
#    是 -> volatile-lru / volatile-lfu
#    否 -> 危险！要么全设 TTL，要么改用 allkeys-*
\`\`\`

### 典型场景推荐

| 场景 | 推荐 policy | maxmemory |
| --- | --- | --- |
| 纯缓存（通用） | \`allkeys-lru\` | 物理内存 60~70% |
| 纯缓存（明显热点） | \`allkeys-lfu\` | 物理内存 60~70% |
| 会话存储 | \`volatile-lru\` | 物理内存 70% |
| 持久化数据库 | \`noeviction\` | 留 20% 余量 |
| 混合（缓存 + 持久数据） | \`volatile-lru\` | 物理内存 70% |

### maxmemory 设置原则

\`\`\`bash
# 1. 单机内存：留 25~30% 给系统、fork、AOF 重写缓冲
# 2. 集群：单分片 maxmemory × 分片数 < 总内存
# 3. 监控 used_memory / maxmemory 比例，超 80% 告警

127.0.0.1:6379> INFO memory
# used_memory:2147483648         实际使用（含 overhead）
# used_memory_rss:2300000000     OS 视角占用
# maxmemory:4294967296           上限
# mem_fragmentation_ratio:1.07   碎片率（1.0~1.5 正常，>1.5 碎片多）
\`\`\`

> **碎片率**：\`mem_fragmentation_ratio = used_memory_rss / used_memory\`。>1.5 说明内存碎片多（频繁修改大 key），可重启或用 \`MEMORY PURGE\`（jemalloc）回收。

## 14.6 踩坑提示

- **noeviction 满内存写报错**：业务侧要捕获 OOM 错误，别让请求堆积。
- **volatile-* 没设 TTL 等同 noeviction**：用 volatile-* 必须保证可丢数据都设了 TTL。
- **maxmemory 设太高**：不留余量，fork 时 OOM 杀进程，整个 Redis 挂。
- **maxmemory 设太低**：淘汰频繁，命中率下降，缓存形同虚设。
- **LRU 抽样太小**：\`maxmemory-samples 1\` 几乎是随机淘汰，至少 5。
- **不监控 evicted_keys**：持续淘汰说明容量不足，要么扩容要么调策略。
- **LFU 衰减参数**：\`lfu-decay-time\` 设太大热点永不淘汰，设太小热点被误杀。
- **大 key 淘汰卡顿**：删大 key（百万元素 List）阻塞，淘汰时同样会卡。用 \`lazyfree-lazy-eviction yes\`（4.0+）异步淘汰。
- **重启后策略丢失**：\`CONFIG SET\` 改的配置重启失效，要 \`CONFIG REWRITE\` 写回文件。

\`\`\`bash
# 开启异步淘汰/删除（4.0+，生产建议全开）
127.0.0.1:6379> CONFIG SET lazyfree-lazy-eviction yes
127.0.0.1:6379> CONFIG SET lazyfree-lazy-expire yes
127.0.0.1:6379> CONFIG SET lazyfree-lazy-server-del yes
127.0.0.1:6379> CONFIG SET lazyfree-lazy-user-del yes
127.0.0.1:6379> CONFIG REWRITE
\`\`\`

## 14.7 本章小结

- 过期时间用 EXPIRE/PEXPIRE/EXPIREAT 或 SET EX/PX 设置，TTL/PTTL 查看，PERSIST 取消。
- TTL 返回值：-2 不存在、-1 永久、正数剩余时间。
- **过期策略 = 惰性删除 + 定期删除**：访问时检查 + 每秒 10 次抽样清理，两者结合平衡 CPU 与内存。
- **内存淘汰 8 种策略**：noeviction / allkeys-{lru,lfu,random} / volatile-{lru,lfu,random,ttl}。
- **LRU** 淘汰最久未访问，**LFU** 淘汰访问频率最低；Redis 用近似算法（随机抽样），\`maxmemory-samples\` 控制精度。
- 选型决策：纯缓存用 \`allkeys-lru\`（或 lfu），不能丢用 \`noeviction\`，混合用 \`volatile-*\`（务必全设 TTL）。
- maxmemory 留 25~30% 余量，监控 \`used_memory\`/\`evicted_keys\`/\`mem_fragmentation_ratio\`。
- 生产建议开启 \`lazyfree-lazy-*\` 异步删除，避免大 key 淘汰阻塞。

至此，《Redis 实战教程》前三批次（共 14 章）完成。从基础数据结构到持久化与内存管理，已覆盖日常开发 80% 的 Redis 知识点。后续将进入运维、集群、性能优化等进阶主题。`
  }
];

export { chapters };
