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

Redis 是纯内存数据库，一旦进程退出或断电，内存里的数据就会全部丢失。为了让数据"活过重启"，Redis 提供两种持久化机制：**RDB**（快照）和 **AOF**（追加日志）。本章深入 RDB 的工作原理、触发方式、文件结构、参数调优与生产实践，帮你彻底搞懂"Redis 是怎么把内存落盘的"。

## 12.1 什么是 RDB

RDB（Redis DataBase）是把**某一时刻内存中的全部数据**以紧凑二进制形式写入磁盘的快照文件，默认文件名 \`dump.rdb\`。

### 核心特征

- **全量快照**：每次 RDB 都是内存的完整副本，不是增量。
- **二进制紧凑**：经过 LZF 压缩，文件远小于实际内存占用。
- **某一瞬间状态**：快照对应 fork 那一刻的数据，之后的修改不在快照里。
- **恢复快**：启动时直接 load 二进制到内存，比 AOF 重放快数倍。

\`\`\`bash
# 查看 RDB 相关的持久化状态
127.0.0.1:6379> INFO persistence
# rdb_last_save_time:1700000000    # 最近一次 RDB 完成的 UNIX 时间戳
# rdb_changes_since_last_save:120  # 自上次 RDB 后发生的修改次数
# rdb_bgsave_in_progress:0         # 是否正在执行 BGSAVE（0=否，1=是）
# rdb_last_save_time:1700000000
# rdb_last_bgsave_status:ok        # 上次 BGSAVE 结果（ok/err）
# rdb_last_bgsave_time_sec:2       # 上次 BGSAVE 耗时（秒）
# rdb_current_bgsave_time_sec:-1   # 当前 BGSAVE 已耗时（-1=未执行）
\`\`\`

> **RDB 的定位**：RDB 适合做"时间点备份"——每小时一个 RDB，按时间归档，是干净的灾难恢复手段。它不追求"不丢数据"，而追求"快速恢复 + 紧凑存储"。

## 12.2 核心机制：fork + COW

Redis 主进程在持久化时调用操作系统 \`fork()\` 创建子进程，由子进程负责把内存数据写盘。这是 RDB（以及 AOF 重写）能"边服务边持久化"的根本。

### 工作流程

1. 主进程调用 \`fork()\`，操作系统创建一个子进程。
2. 子进程与父进程**共享同一份物理内存页**（并非真正复制）。
3. 子进程遍历内存，把数据写入一个临时 RDB 文件。
4. 写完后子进程退出，临时文件原子 \`rename\` 为 \`dump.rdb\`。
5. 整个过程中，主进程继续处理客户端命令。

### 写时复制（Copy-On-Write）

fork 之后父子进程共享内存页，**只有当父进程修改某个内存页时**，操作系统才真正复制那一页给子进程保留原始数据。这就是 COW（Copy-On-Write）。

\`\`\`bash
# fork 期间如果有大量写入，COW 会复制大量内存页
# 监控 fork 耗时和 COW 内存
127.0.0.1:6379> INFO stats
# total_forks:142                       # 进程启动以来的 fork 总次数
# mem_fragmentation_ratio:1.07

127.0.0.1:6379> INFO memory
# used_memory:2147483648                # Redis 逻辑使用内存
# used_memory_rss:2300000000            # 操作系统视角的实际占用
# mem_not_counted_for_evict:0
\`\`\`

### fork 的关键特性

| 特性 | 说明 |
| --- | --- |
| 子进程独立 | 子进程拿到的是 fork 那一刻的内存视图，主进程后续修改不影响快照 |
| 共享内存页 | 没有写入就无需复制，内存占用几乎不增 |
| 写入触发复制 | 父进程改一页，该页就被复制一份 |
| 快照一致性 | 快照是某一瞬间的状态，保证一致性 |

> **fork 的代价**：fork 本身要复制**页表**（不是数据），是 O(内存大小) 的操作。大内存实例（>10GB）fork 可能阻塞主线程几十到几百毫秒，这是 RDB 在大实例上的主要痛点。线上 20GB 实例 fork 阻塞 100ms+ 很常见。

### COW 的内存放大风险

\`\`\`bash
# 假设实例 20GB，BGSAVE 期间业务写入频繁
# 最坏情况：所有页都被修改，内存占用翻倍到 40GB
# 如果机器内存不够，会触发 swap 或 OOM

# 解决思路：
# 1. 单实例内存控制在 10GB 以内（推荐）
# 2. 大实例用 Cluster 分片
# 3. BGSAVE 期间限流写入
# 4. 监控 used_memory_rss，留足 COW 余量
\`\`\`

> **生产经验**：单实例内存建议不超过物理内存的 50~60%，给 fork COW 和系统留余量。20GB 的实例，机器至少配 40GB 内存。

## 12.3 触发 RDB：SAVE 与 BGSAVE

### 手动触发

\`\`\`bash
# SAVE：阻塞主线程，期间 Redis 不响应任何命令（生产禁用！）
127.0.0.1:6379> SAVE
OK
# 期间所有客户端命令排队等待，相当于服务中断

# BGSAVE：后台 fork 子进程，不阻塞主线程（推荐）
127.0.0.1:6379> BGSAVE
Background saving started

# 查看最近一次 BGSAVE 完成的 UNIX 时间戳
127.0.0.1:6379> LASTSAVE
(integer) 1700000000

# 如果已有 BGSAVE/AOF 重写在进行，BGSAVE 返回错误
127.0.0.1:6379> BGSAVE
(error) ERR Background save already in progress
\`\`\`

> **SAVE 的用途**：几乎只用于"我知道现在没流量，要立刻拿到精确快照"的运维场景，或迁移前的手动备份。线上常规绝不用 SAVE——它会卡住整个实例。

### SAVE vs BGSAVE 对比

| 维度 | SAVE | BGSAVE |
| --- | --- | --- |
| 阻塞主线程 | 是，期间无法处理任何命令 | 否（仅 fork 瞬间短暂阻塞） |
| 适用场景 | 停机维护、手动备份 | 日常运维、自动触发 |
| 内存占用 | 无额外开销 | fork + COW，内存可能放大 |
| 生产可用 | 禁用 | 推荐 |

### 自动触发（save 配置）

在 \`redis.conf\` 中配置 \`save\` 规则，满足**任一**条件就自动触发 BGSAVE：

\`\`\`bash
# redis.conf 默认配置
save 3600 1      # 3600 秒（1 小时）内有 1 次修改
save 300 100     # 300 秒（5 分钟）内有 100 次修改
save 60 10000    # 60 秒（1 分钟）内有 10000 次修改

# 关闭自动 RDB（纯缓存场景，不落盘）
save ""

# 多条 save 是"或"关系，任意一条满足就触发 BGSAVE
\`\`\`

\`\`\`bash
# 运行时查看当前 save 配置
127.0.0.1:6379> CONFIG GET save
1) "save"
2) "3600 1 300 100 60 10000"

# 运行时动态修改（重启失效，要持久化用 CONFIG REWRITE）
127.0.0.1:6379> CONFIG SET save "900 1 300 10 60 10000"
OK
127.0.0.1:6379> CONFIG REWRITE
OK
\`\`\`

> **save 规则的理解**：每条规则是"在 N 秒内发生了 M 次修改"就触发。修改包括 SET、DEL、INCR、EXPIRE 等所有改变数据的命令，但不包括读命令。计数器在每次 BGSAVE 成功后清零。

### 其他自动触发场景

| 场景 | 说明 |
| --- | --- |
| **主从全量同步** | 从节点首次连接主节点，主节点触发 BGSAVE 生成快照传给从节点 |
| **SHUTDOWN** | 正常关闭 Redis 时，默认做一次 SAVE（除非 \`SHUTDOWN NOSAVE\`） |
| **FLUSHALL/FLUSHDB** | 触发一次空的 RDB（清空后落盘） |
| **DEBUG RELOAD** | 调试用，先 SAVE 再重启加载 |
| **复制积压缓冲不足** | 从节点断线重连后 offset 不在积压缓冲区，触发全量同步 |

\`\`\`bash
# SHUTDOWN 时控制是否落盘
127.0.0.1:6379> SHUTDOWN SAVE      # 关闭前做一次 SAVE（默认行为）
127.0.0.1:6379> SHUTDOWN NOSAVE    # 关闭前不落盘（丢弃内存数据，慎用）

# DEBUG RELOAD：调试用，先持久化再重启
127.0.0.1:6379> DEBUG RELOAD
\`\`\`

## 12.4 save 配置详解与数据丢失量

save 配置直接决定了 RDB 的"数据丢失窗口"——两次成功 RDB 之间的修改，如果宕机会全部丢失。

### 常见 save 配置方案

\`\`\`bash
# 方案 1：默认配置（平衡，推荐）
save 3600 1
save 300 100
save 60 10000

# 方案 2：低频备份（减少 fork，适合大实例）
save 86400 1      # 一天一次
save 3600 10000   # 一小时一万次修改

# 方案 3：高频备份（丢失少，但 fork 频繁）
save 900 1
save 300 10
save 60 10000

# 方案 4：纯缓存（关闭 RDB）
save ""
\`\`\`

### 数据丢失量估算

| save 配置 | 最坏丢失窗口 | 适用场景 |
| --- | --- | --- |
| \`save 900 1\` | 15 分钟 | 低频写入 |
| \`save 300 100\` | 5 分钟 | 中频写入 |
| \`save 60 10000\` | 1 分钟 | 高频写入 |
| \`save 3600 1\` | 1 小时 | 冷数据 |
| 纯 RDB 密集配置 | 仍以分钟计 | 无法做到秒级不丢 |

> **RDB 的天花板**：无论怎么调 save，RDB 最坏丢失窗口都是"分钟级"。要秒级不丢数据，必须用 AOF（见第 13 章）。

### save 配置过密的副作用

\`\`\`bash
# 错误示范：低流量场景配 save 60 1
# 后果：每分钟只要有 1 次修改就 fork 一次，CPU 浪费在 fork 上
save 60 1

# 正确做法：根据实际写入频率调整
# 写入稀疏的业务用长窗口，写入密集的用短窗口但高阈值
\`\`\`

## 12.5 RDB 文件结构

RDB 文件是紧凑的二进制格式，结构大致如下：

\`\`\`
+--------+--------+-----------+--------+-----+--------+--------+
| MAGIC  | VER    | META      | DB 0   | ... | DB N   | CRC64  |
| REDIS  | 0011   | (aux字段) | 数据   |     | 数据   | 校验和 |
+--------+--------+-----------+--------+-----+--------+--------+
\`\`\`

### 各字段说明

| 字段 | 说明 |
| --- | --- |
| MAGIC | 固定为 \`REDIS\`，用于识别文件类型 |
| VER | RDB 版本号（如 0011 = 11），高版本兼容低版本，反之不行 |
| META | aux 辅助字段，记录 Redis 版本、创建时间、内存使用等元信息 |
| DB 0~N | 各数据库的数据，按 db 依次存储 |
| CRC64 | 文件末尾的 CRC64 校验和，用于检测文件损坏 |

### 查看与解析

\`\`\`bash
# 查看默认存储路径（redis.conf 的 dir + dbfilename）
127.0.0.1:6379> CONFIG GET dir
1) "dir"
2) "/var/lib/redis"
127.0.0.1:6379> CONFIG GET dbfilename
1) "dbfilename"
2) "dump.rdb"

# 查看文件大小
ls -lh /var/lib/redis/dump.rdb
# -rw-r--r-- 1 redis redis 12M Nov 15 10:00 /var/lib/redis/dump.rdb

# 用 redis-check-rdb 校验文件完整性并打印摘要
redis-check-rdb /var/lib/redis/dump.rdb
# [offset 0] Checking RDB file /var/lib/redis/dump.rdb
# [offset 27] AUX FIELD redis-ver = '7.2.0'
# [offset 133] AUX FIELD redis-bits = '64'
# [offset 145] AUX FIELD ctime = '1700000000'
# [offset 161] AUX FIELD used-mem = '2147483648'
# [offset 173] 0 keys read
# [offset 173] 0 expires
# [offset 173] 0 already expired
# [info] 0 keys read
# [info] 0 expires
# [info] 0 already expired
# CRC64-ok
\`\`\`

> **redis-check-rdb** 是 Redis 自带工具，专门校验 RDB 文件。如果文件损坏，它能定位到损坏的 offset，帮助你判断备份是否可用。

### 修改文件名与路径

\`\`\`bash
# redis.conf
dbfilename dump.rdb          # RDB 文件名
dir /var/lib/redis            # 工作目录（RDB 和 AOF 都存这里）

# 运行时修改
127.0.0.1:6379> CONFIG SET dbfilename "dump-20240101.rdb"
OK
127.0.0.1:6379> CONFIG SET dir "/data/redis"
OK
\`\`\`

> **dir 配置很重要**：它决定了 RDB、AOF 文件的存储位置，也决定了 Redis 启动时从哪里加载。修改 \`dir\` 要谨慎，改错可能导致启动时加载不到数据。

## 12.6 压缩与校验

\`\`\`bash
# redis.conf 压缩与校验配置
rdbcompression yes    # 默认开启，用 LZF 压缩字符串类型
rdbchecksum yes       # 默认开启，文件末尾写入 CRC64 校验和
\`\`\`

### rdbcompression

- **yes（默认）**：对字符串类型用 LZF 压缩，文件大小约为原始的 30~50%，但 BGSAVE 时 CPU 占用略高。
- **no**：不压缩，文件大但 CPU 开销低。

\`\`\`bash
# CPU 紧张的场景可以关闭压缩
127.0.0.1:6379> CONFIG SET rdbcompression no
OK

# 但一般保持默认 yes，磁盘和备份传输更省
\`\`\`

### rdbchecksum

- **yes（默认）**：在 RDB 文件末尾追加 8 字节 CRC64 校验和。加载时校验，损坏则拒绝启动。
- **no**：不写校验和，加载时不校验，文件略小（省 8 字节）但无法发现损坏。

\`\`\`bash
# 关闭校验（不推荐，省的那点开销不值得）
127.0.0.1:6379> CONFIG SET rdbchecksum no
OK
\`\`\`

> **压缩权衡**：开启压缩文件小（便于备份传输），但 BGSAVE 时 CPU 占用略高。默认开启，CPU 紧张的场景可关。校验和务必保持开启，它能在文件损坏时及时告警，避免加载坏数据。

## 12.7 stop-writes-on-bgsave-error

\`\`\`bash
# redis.conf
stop-writes-on-bgsave-error yes    # 默认开启
\`\`\`

### 行为说明

- **yes（默认）**：BGSAVE 失败（如磁盘满、权限错误）时，Redis **拒绝所有写命令**，返回错误。这是为了防止"以为持久化成功其实没成功"的错觉。
- **no**：即使 BGSAVE 失败，Redis 仍接受写命令，但有数据丢失风险——你以为数据安全了，其实没落盘。

\`\`\`bash
# 模拟磁盘满后 BGSAVE 失败
127.0.0.1:6379> BGSAVE
(error) ERR Background saving terminated by signal 9

# stop-writes-on-bgsave-error yes 时，后续写命令被拒绝
127.0.0.1:6379> SET k1 v1
(error) MISCONF Redis is configured to save RDB snapshots, but it's currently unable to persist to disk. Commands that may modify the data set are disabled, because this instance is configured to report errors during writes if RDB snapshotting fails (stop-writes-on-bgsave-error option). Please check the Redis logs for details about the RDB error.

# 读命令仍可执行
127.0.0.1:6379> GET k1
"v1"
\`\`\`

> **生产务必保持 yes**：宁可写不进去，也别让用户以为数据安全了其实没落盘。同时要监控 \`rdb_last_bgsave_status\`，失败时立即告警。

## 12.8 从 RDB 恢复数据

### 启动加载流程

Redis 启动时，如果检测到 \`dump.rdb\` 文件，会自动加载到内存：

\`\`\`bash
# 启动 Redis，观察日志
redis-server /etc/redis/redis.conf
# 日志输出示例：
# * Loading RDB produced by version 7.2.0
# * RDB age 12 seconds
# * RDB memory usage when created 2.00 GiB
# * Done loading RDB keys computed by debug
# * DB loaded from append-only file: 0.000 seconds
# * Ready to accept connections
\`\`\`

### 手动恢复流程

\`\`\`bash
# 1. 停止 Redis
redis-cli SHUTDOWN NOSAVE

# 2. 备份当前 dump.rdb（防止覆盖）
cp /var/lib/redis/dump.rdb /backup/dump.rdb.bak

# 3. 用历史备份替换
cp /backup/dump-20240101.rdb /var/lib/redis/dump.rdb
chown redis:redis /var/lib/redis/dump.rdb

# 4. 确保没有 AOF（AOF 优先级高于 RDB，会覆盖 RDB 恢复）
# 如果开启了 AOF，临时关闭或删除 AOF 文件
mv /var/lib/redis/appendonly.aof /backup/

# 5. 启动 Redis，自动加载 dump.rdb
redis-server /etc/redis/redis.conf

# 6. 验证数据
redis-cli DBSIZE
\`\`\`

> **加载优先级**：Redis 启动时，如果 AOF 开启，优先加载 AOF；否则加载 RDB；都没有则空启动。要从 RDB 恢复，必须确保 AOF 没有覆盖。

### RDB 文件版本兼容

\`\`\`bash
# 高版本 RDB 不能被低版本 Redis 加载
# 例如 Redis 7.0 生成的 RDB（版本 11）无法被 Redis 5.0（版本 9）加载

# 降级前先确认 RDB 版本兼容性
redis-check-rdb /var/lib/redis/dump.rdb
# 看 VER 字段，对照目标版本支持的最高 RDB 版本
\`\`\`

| Redis 版本 | RDB 版本 | 兼容性 |
| --- | --- | --- |
| 7.x | 11 | 可加载 ≤11 |
| 6.x | 10 | 可加载 ≤10 |
| 5.x | 9 | 可加载 ≤9 |
| 4.x | 9 | 可加载 ≤9 |

> **降级陷阱**：从高版本降级到低版本时，高版本生成的 RDB 可能无法加载，导致启动失败或数据丢失。降级前用目标版本的工具校验 RDB。

## 12.9 RDB 与主从复制

在主从复制场景中，RDB 是**全量同步**的核心载体。

### 全量同步流程

1. 从节点发送 \`PSYNC ? -1\`（首次连接或断线重连后 offset 不在积压缓冲区）。
2. 主节点判断需要全量同步，触发 **BGSAVE** 生成 RDB 快照。
3. 主节点把 RDB 文件发送给从节点。
4. 从节点加载 RDB，完成全量同步。
5. 同步期间主节点的新写命令缓存在**复制积压缓冲区**，RDB 发送完后补发。

\`\`\`bash
# 在主节点查看复制状态
127.0.0.1:6379> INFO replication
# role:master
# connected_slaves:1
# slave0:ip=192.168.1.2,port=6379,state=online,offset=123456,lag=0
# master_replid:8371b9f1...
# master_repl_offset:123456
# repl_backlog_size:1048576
# repl_backlog_first_byte_offset:1

# 在从节点查看
127.0.0.1:6379> INFO replication
# role:slave
# master_host:192.168.1.1
# master_port:6379
# master_link_status:up
# master_last_io_seconds_ago:0
# slave_repl_offset:123456
\`\`\`

> **大实例全量同步的痛点**：主节点 BGSAVE + 传输 RDB 期间，主节点内存放大（COW），网络带宽被占用，从节点加载 RDB 期间无法服务。大实例（>10GB）全量同步可能耗时数分钟，务必避免频繁触发。

### repl-diskless-sync（无盘复制）

\`\`\`bash
# redis.conf
repl-diskless-sync yes        # 默认 no，开启后主节点不落盘 RDB，直接通过网络发给从节点
repl-diskless-sync-delay 5    # 延迟 N 秒，等待多个从节点一起同步（减少 BGSAVE 次数）
\`\`\`

- **磁盘好、网络慢**：传统模式（落盘 + 传输）。
- **磁盘差、网络好**：无盘复制（不落盘，直接发）。

> **无盘复制**适合磁盘 IO 紧张的环境（如云盘 IO 受限），主节点直接把内存数据通过 socket 发给从节点，不经过磁盘。但会占用主进程网络带宽。

## 12.10 RDB 的优缺点

### 优点

- **文件紧凑**：二进制 + LZF 压缩，相同数据 RDB 比 AOF 小得多，适合备份、传输、灾难恢复。
- **恢复快**：启动时直接 load 二进制到内存，比 AOF 重放快 5~10 倍。
- **fork 后不阻塞**：持久化期间主进程继续服务（仅 fork 瞬间短暂阻塞）。
- **适合冷备**：每小时一个 RDB，按时间归档，是干净的"时间点备份"。
- **可控的 fork 时机**：可以在低峰期手动 BGSAVE，避免高峰期自动触发。

### 缺点

- **数据有丢失窗口**：两次 RDB 之间的修改会丢。如 \`save 300 100\`，最坏丢 5 分钟数据。
- **fork 阻塞**：大内存实例 fork 慢，期间主线程短暂卡顿（毫秒~百毫秒级）。
- **COW 内存放大**：fork 期间大量写入会让内存占用翻倍。
- **不适合实时性要求高**：要秒级不丢数据必须用 AOF。

### RDB vs AOF 速览

| 维度 | RDB | AOF |
| --- | --- | --- |
| 数据安全 | 分钟级丢失 | 秒级（everysec） |
| 文件大小 | 小（紧凑二进制） | 大（文本命令） |
| 恢复速度 | 快 | 慢 |
| 性能影响 | 低（fork 时） | 略高（每写多一次 IO） |
| 可读性 | 不可读 | 可读（RESP 文本） |
| 适用 | 冷备、缓存、可接受丢失 | 数据库、要求不丢 |

> **缓存场景**：如果 Redis 只当缓存，丢数据无所谓，可以 \`save ""\` 关掉 RDB，性能最佳。要数据安全必配 AOF，或用混合持久化。

## 12.11 备份与运维实践

### 定时备份脚本

\`\`\`bash
#!/bin/bash
# 备份脚本：每天凌晨 2 点执行
# crontab: 0 2 * * * /opt/redis/backup.sh

REDIS_CLI="redis-cli -h 127.0.0.1 -p 6379"
BACKUP_DIR="/backup/redis"
DATE=$(date +%Y%m%d_%H%M%S)

# 1. 触发 BGSAVE
\$REDIS_CLI BGSAVE

# 2. 等待 BGSAVE 完成（轮询 rdb_bgsave_in_progress）
while true; do
  STATUS=\$(\$REDIS_CLI INFO persistence | grep rdb_bgsave_in_progress | tr -d '\\r')
  if echo "\$STATUS" | grep -q "0"; then
    break
  fi
  sleep 1
done

# 3. 检查上次 BGSAVE 状态
RESULT=\$(\$REDIS_CLI INFO persistence | grep rdb_last_bgsave_status | tr -d '\\r')
if echo "\$RESULT" | grep -q "ok"; then
  # 4. 复制 RDB 文件到备份目录
  cp /var/lib/redis/dump.rdb \$BACKUP_DIR/dump_\$DATE.rdb
  # 5. 压缩（可选）
  gzip \$BACKUP_DIR/dump_\$DATE.rdb
  echo "[OK] 备份成功: dump_\$DATE.rdb.gz"
else
  echo "[ERROR] BGSAVE 失败，跳过备份"
  exit 1
fi

# 6. 清理 7 天前的备份
find \$BACKUP_DIR -name "dump_*.rdb.gz" -mtime +7 -delete
\`\`\`

> **备份要点**：① 触发 BGSAVE 后要轮询 \`rdb_bgsave_in_progress\` 确认完成；② 备份前检查 \`rdb_last_bgsave_status\`；③ 备份文件要异地存储（rsync 到对象存储），本机挂了备份也没了。

### 异地备份

\`\`\`bash
# 用 rsync 同步到异地
rsync -avz /backup/redis/ user@remote:/backup/redis/

# 或上传到对象存储（如 AWS S3）
aws s3 cp /backup/redis/dump_20240101.rdb.gz s3://my-bucket/redis-backup/
\`\`\`

## 12.12 踩坑提示

- **大内存 fork 卡顿**：20GB 实例 fork 可能阻塞 100ms+，敏感业务用小实例分片或换 AOF。
- **磁盘满导致 BGSAVE 失败**：监控 \`rdb_last_bgsave_status\`，失败时告警；\`stop-writes-on-bgsave-error yes\` 会让写命令报错。
- **save 配置过密**：\`save 60 1\` 会让低流量场景频繁 fork，浪费 CPU。根据业务写入频率调。
- **关 RDB 的实例重启丢数据**：\`save ""\` 关掉后，重启内存数据全没，纯缓存才能这么干。
- **备份要异地**：本机 RDB 文件机器挂了就没了，定时 rsync 到对象存储或异地机器。
- **fork 期间大量写入**：COW 会复制大量内存页，可能让内存占用翻倍，留足内存余量。
- **RDB 文件版本兼容**：高版本 RDB 不能被低版本 Redis 加载，降级时注意校验。
- **dir 配置改错**：改了 \`dir\` 后重启，可能加载不到原 RDB，导致数据"消失"。
- **SHUTDOWN 默认 SAVE**：\`SHUTDOWN\` 会先 SAVE 再退出，大实例关闭会很慢，急用 \`SHUTDOWN NOSAVE\`。
- **从节点 RDB 占用**：从节点也会保存 RDB（全量同步时），磁盘空间要预留。

\`\`\`bash
# 监控 RDB 健康的关键指标
127.0.0.1:6379> INFO persistence
# 重点关注：
# rdb_last_bgsave_status:ok       # 必须是 ok
# rdb_changes_since_last_save:0   # 持续增长说明 BGSAVE 没成功
# rdb_bgsave_in_progress:0        # 长时间为 1 说明卡住

127.0.0.1:6379> INFO stats
# total_forks:142                 # fork 次数，增长过快说明 save 太密
\`\`\`

## 12.13 本章小结

- **RDB** 是某一时刻的全量内存快照，二进制紧凑文件，恢复快。
- **核心机制**：fork 子进程 + 写时复制（COW），持久化不阻塞主线程（仅 fork 瞬间短暂阻塞）。
- **触发方式**：\`SAVE\`（阻塞，禁用）、\`BGSAVE\`（后台，推荐）、\`save\` 配置（自动）。
- **save 配置**决定丢失窗口，纯 RDB 最坏以分钟计；纯缓存可 \`save ""\` 关闭。
- **文件结构**：MAGIC + VER + META + DB 数据 + CRC64，由 \`redis-check-rdb\` 校验。
- **压缩与校验**：\`rdbcompression\`/\`rdbchecksum\` 默认开启，权衡 CPU 与文件大小。
- **stop-writes-on-bgsave-error** 默认 yes，BGSAVE 失败时拒绝写入，生产务必保持。
- **恢复**：启动自动加载 \`dump.rdb\`，注意 AOF 优先级更高；手动恢复要替换文件并确保无 AOF 干扰。
- **主从复制**中 RDB 是全量同步载体，大实例用 \`repl-diskless-sync\` 优化。
- **优点**：紧凑、恢复快、适合冷备；**缺点**：有分钟级丢失窗口、大实例 fork 卡顿。
- **生产建议**：单实例内存 <10GB，定时备份异地存储，监控 \`rdb_last_bgsave_status\`。

下一章学习另一种持久化方式——**AOF 日志**，看 Redis 如何做到秒级不丢数据。`
  },
  {
    id: "redis-ch13",
    group: "第三部分 持久化与过期策略",
    icon: "📜",
    title: "第 13 章 AOF 持久化",
    content: `# 第 13 章 AOF 持久化

RDB 是"定时快照"，两次快照间的数据会丢。AOF（Append-Only File）则把**每条写命令**追加到日志，重启时重放命令恢复数据，能做到秒级甚至毫秒级不丢。本章深入 AOF 的工作原理、刷盘策略、重写机制、混合持久化与性能调优。

## 13.1 什么是 AOF

AOF（Append-Only File）是 Redis 的另一种持久化方式：把**每一条写命令**以 RESP 协议格式追加到日志文件（默认 \`appendonly.aof\`）。重启时按顺序重放这些命令，重建内存状态。

### 核心特征

- **追加日志**：每条写命令都追加到文件末尾，不修改已有内容。
- **命令格式**：用 RESP 协议文本存储，可读性强。
- **秒级不丢**：配合 \`everysec\` 刷盘，最多丢 1 秒数据。
- **文件会膨胀**：同一条 key 改 1000 次，AOF 里就有 1000 条命令，需要重写压缩。

\`\`\`bash
# 开启 AOF
127.0.0.1:6379> CONFIG SET appendonly yes
OK

# 查看状态
127.0.0.1:6379> INFO persistence
# aof_enabled:1                    # AOF 是否开启（0=关，1=开）
# aof_rewrite_in_progress:0        # 是否正在重写
# aof_rewrite_scheduled:0          # 是否有待执行的重写
# aof_last_rewrite_time_sec:5      # 上次重写耗时（秒）
# aof_current_rewrite_time_sec:-1  # 当前重写已耗时（-1=未执行）
# aof_last_bgrewrite_status:ok     # 上次重写结果
# aof_last_write_status:ok         # 上次 AOF 写入结果
\`\`\`

> **AOF 的定位**：AOF 追求"数据安全"，适合把 Redis 当数据库用、不能丢数据的场景。RDB 追求"快速恢复 + 紧凑存储"，适合冷备。生产环境常**两者结合**（混合持久化）。

## 13.2 AOF 的工作原理

### 工作流程

AOF 采用"**先执行命令，再追加日志**"的顺序（与 MySQL binlog 的"先写日志再改数据"相反）：

1. 客户端发送写命令。
2. Redis 主进程执行命令（在内存中操作）。
3. 命令以 RESP 协议格式追加到 **AOF 缓冲区**（\`aof_buf\`，内存）。
4. 根据刷盘策略（\`appendfsync\`），缓冲区内容写入 AOF 文件。
5. AOF 文件过大时触发**重写**。

\`\`\`bash
# 执行 SET k1 v1 后，AOF 文件内容（RESP 协议文本）
cat appendonly.aof
*3
$3
SET
$2
k1
$2
v1

# *3 表示这条命令有 3 个参数
# $3 表示第一个参数长度 3 字节
# SET 是参数内容
# 以此类推
\`\`\`

### 为什么"先执行后写日志"？

| 方式 | 优点 | 缺点 |
| --- | --- | --- |
| **先执行后写日志**（Redis AOF） | 不记录语法错误/运行时失败的命令，日志干净 | 命令执行后、写日志前宕机会丢这一条 |
| **先写日志后执行**（MySQL binlog） | 日志先落盘，崩溃恢复时能重做 | 可能记录执行失败的命令，需要额外校验 |

> **Redis 的取舍**：Redis 选择"先执行后写日志"，避免记录无效命令。代价是若命令执行后、写日志前宕机，这条命令会丢——但相比"先写日志导致无效命令被重放"更合理。

## 13.3 AOF 三种刷盘策略

\`appendfsync\` 决定多久把 AOF 缓冲区刷到磁盘，是 AOF 性能与安全的核心权衡。

\`\`\`bash
# redis.conf
appendfsync everysec    # 默认值
\`\`\`

### 三种策略对比

| 策略 | 含义 | 性能 | 数据安全 | 适用 |
| --- | --- | --- | --- | --- |
| \`always\` | 每条命令都 fsync | 最差（每写一次盘） | 不丢 | 金融级，但吞吐骤降 |
| \`everysec\`（默认/推荐） | 每秒 fsync 一次 | 接近无 AOF | 最多丢 1 秒 | 通用生产场景 |
| \`no\` | 由 OS 决定何时刷 | 最好 | 丢 OS 缓冲内的数据（30 秒级） | 缓存，可接受丢失 |

\`\`\`bash
# 查看当前策略
127.0.0.1:6379> CONFIG GET appendfsync
1) "appendfsync"
2) "everysec"

# 动态修改
127.0.0.1:6379> CONFIG SET appendfsync everysec
OK
\`\`\`

### always 的真相

\`always\` 不是真的"每条都同步刷盘"，而是"每条命令都调用 \`fsync\`"。在 SSD 上单线程 fsync 约 100~200μs，意味着 Redis 吞吐被锁在约 5000~10000 QPS。

\`\`\`bash
# always 模式下，每条写命令都阻塞等待 fsync
127.0.0.1:6379> SET k1 v1    # 这条命令要等 fsync 完成才返回
OK                          # ~200μs 后返回

# 高并发下吞吐骤降
# 10 万 QPS 的业务可能掉到 5000 QPS
\`\`\`

> **别滥用 always**：吞吐会掉一个数量级，金融场景才考虑。绝大多数业务用 \`everysec\`，最多丢 1 秒完全可接受。

### everysec 的实现

\`everysec\` 由后台线程每秒执行一次 fsync，主线程不等待：

\`\`\`bash
# 主线程：命令追加到 aof_buf 后立即返回（不等 fsync）
# 后台线程：每秒把 aof_buf fsync 到磁盘

# 如果 fsync 耗时超过 1 秒（磁盘慢），会延后下一次 fsync
# 但最多丢 1 秒的数据（aof_buf 里的内容）
\`\`\`

### no 的行为

\`\`\`bash
# no 模式：Redis 只负责 write（写入 OS 页缓存），何时 fsync 由 OS 决定
# Linux 通常 30 秒左右 fsync 一次
# 宕机可能丢 30 秒数据

# 适用：纯缓存，丢数据无所谓，追求极致性能
\`\`\`

## 13.4 AOF 文件格式（RESP）

AOF 文件用 RESP（Redis Serialization Protocol）协议存储命令，文本格式，可读性强。

### RESP 格式详解

\`\`\`bash
# 执行：SET username alice
# AOF 文件内容：
*3          # 数组，3 个元素
$3          # 第 1 个元素是 bulk string，长度 3
SET         # 元素内容
$8          # 第 2 个元素，长度 8
username
$5          # 第 3 个元素，长度 5
alice

# 执行：RPUSH list a b c
# AOF 文件内容：
*4
$5
RPUSH
$4
list
$1
a
$1
b
$1
c
\`\`\`

### 直接查看 AOF 文件

\`\`\`bash
# 查看最后几条命令
tail -n 20 appendonly.aof

# 查看文件大小
ls -lh appendonly.aof

# 统计命令数（每个 *N 开头是一条命令）
grep -c '^\\*[0-9]' appendonly.aof
\`\`\`

> **AOF 可读性的价值**：误操作（如 FLUSHALL）后，可以立即停 Redis，编辑 AOF 删掉那行命令，重启即可恢复——这是 RDB 做不到的。

## 13.5 AOF 重写

AOF 是追加日志，越写越长。一条 key 被改 1000 次，AOF 里就有 1000 条命令，但当前状态只需要最后一条。**重写**就是根据当前内存状态生成最小 AOF。

### 为什么需要重写

\`\`\`bash
# 假设执行了 1000 次：
SET counter 1
SET counter 2
SET counter 3
...
SET counter 1000

# AOF 里有 1000 条 SET 命令
# 但当前内存状态只是 counter=1000
# 重写后 AOF 只剩 1 条：SET counter 1000
# 文件从 ~20KB 压缩到 ~30 字节
\`\`\`

### 触发方式

\`\`\`bash
# 手动触发（后台 fork 子进程执行）
127.0.0.1:6379> BGREWRITEAOF
Background append only file rewriting started

# 自动触发条件（redis.conf）
# auto-aof-rewrite-percentage: 文件比上次重写后增长百分比
# auto-aof-rewrite-min-size: 文件最小多大才触发
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# 含义：AOF 文件 >= 64MB 且比上次重写后大一倍，就自动触发重写
\`\`\`

\`\`\`bash
# 运行时查看/修改
127.0.0.1:6379> CONFIG GET auto-aof-rewrite-percentage
1) "auto-aof-rewrite-percentage"
2) "100"
127.0.0.1:6379> CONFIG SET auto-aof-rewrite-percentage 50
OK
\`\`\`

> **默认配置**：AOF 文件 ≥ 64MB 且比上次重写后大 100%（翻倍），就自动重写。可以根据业务调整，写入频繁的可以调低 percentage 让重写更积极。

### 重写过程

1. 主进程 \`fork()\` 子进程。
2. 子进程遍历内存，把当前状态写成新 AOF（如 \`SET k v\` 而非 1000 条历史命令）。
3. 重写期间，主进程的新写命令同时写入**AOF 缓冲区**（写旧 AOF）和**AOF 重写缓冲区**（暂存，最后追加到新 AOF）。
4. 子进程完成后，主进程把重写缓冲区的命令追加到新 AOF。
5. 原子 \`rename\` 替换旧 AOF 文件。

\`\`\`bash
# 监控重写进度
127.0.0.1:6379> INFO persistence
# aof_rewrite_scheduled:0          # 是否有待执行的重写（已有重写在跑时新请求会排队）
# aof_rewrite_in_progress:0        # 是否正在重写
# aof_last_bgrewrite_status:ok     # 上次重写结果
# aof_last_rewrite_time_sec:5      # 上次重写耗时（秒）
# aof_current_rewrite_time_sec:-1  # 当前重写已耗时
\`\`\`

### 重写期间不阻塞

子进程写新 AOF 时，主进程继续处理命令。重写结束时的"替换"操作是原子 \`rename\`，几乎无开销。

> **重写的代价**：和 RDB 一样要 fork，大内存实例有卡顿风险；且重写期间内存占用增加（重写缓冲区暂存增量命令）。

### 重写时的双写机制

\`\`\`bash
# 重写期间，主进程的写命令去向：
# 1. AOF 缓冲区 -> 旧 AOF 文件（保证重写失败时旧 AOF 仍可用）
# 2. AOF 重写缓冲区 -> 内存暂存（重写成功后追加到新 AOF）

# 这样保证：
# - 重写失败：旧 AOF 仍是完整的，数据不丢
# - 重写成功：新 AOF = 全量重写 + 增量命令，数据完整
\`\`\`

## 13.6 aof-load-truncated 与文件修复

### aof-load-truncated

\`\`\`bash
# redis.conf
aof-load-truncated yes    # 默认开启
\`\`\`

- **yes（默认）**：加载 AOF 时如果发现文件末尾不完整（如宕机导致最后一条命令写了一半），Redis 加载完整部分，忽略截断的末尾，正常启动。
- **no**：发现截断就拒绝启动，需要手动修复。

\`\`\`bash
# 模拟 AOF 截断（用 dd 截断文件末尾）
dd if=appendonly.aof of=truncated.aof bs=1 count=1024

# aof-load-truncated yes 时：
# 日志：* Reading the remaining AOF tail...
#      * AOF truncated, ignoring last incomplete command
#      * DB loaded from append-only file
# 正常启动

# aof-load-truncated no 时：
# 日志：* Bad file format reading the append only file
# 拒绝启动
\`\`\`

### redis-check-aof 修复工具

\`\`\`bash
# AOF 文件损坏（非截断，如中间字节错误）时，用 redis-check-aof 修复
redis-check-aof --fix appendonly.aof

# 交互式询问：
# 0x1a: Expected prefix '*', got: 'X'
# AOF analyzed: filename=appendonly.aof, size=1024, ok_up_to=512, ok_up_to_line=12, diff=512
# This will shrink the AOF file from 1024 bytes, with 512 bytes, to 512 bytes
# Continue? [y/N]: y
# Done
\`\`\`

> **修复的代价**：\`redis-check-aof --fix\` 会截断损坏点之后的所有内容，可能丢失部分命令。修复前先备份原文件。

## 13.7 RDB + AOF 混合持久化（4.0+）

Redis 4.0 引入**混合持久化**，结合 RDB 和 AOF 的优点，已成为生产标配。

### 工作原理

- **AOF 重写时**：不再写文本命令，而是先写一段 **RDB 格式**的全量数据（base），之后的增量命令才用 AOF 文本格式。
- **加载时**：先 load RDB 部分（快），再重放 AOF 增量（少），兼顾速度和安全。

\`\`\`bash
# 开启混合持久化（4.0+ 默认开启）
127.0.0.1:6379> CONFIG GET aof-use-rdb-preamble
1) "aof-use-rdb-preamble"
2) "yes"

# aof-use-rdb-preamble:
# yes（默认）：AOF 重写时 base 用 RDB 格式（混合持久化）
# no：AOF 重写时全用文本命令（纯 AOF）
\`\`\`

### 混合 AOF 文件结构

\`\`\`
+-------------------+------------------+
| RDB 二进制全量    | AOF 文本增量命令 |
| (重写时的内存快照) | (重写后的新命令) |
+-------------------+------------------+
\`\`\`

### 加载流程

\`\`\`bash
# 启动 Redis，观察日志
redis-server /etc/redis/redis.conf
# 日志示例：
# * Loading RDB produced by version 7.2.0
# * RDB age 5 seconds
# * RDB memory usage when created 2.00 GiB
# * Done loading RDB keys
# * Loading AOF tail ... (10 commands)
# * DB loaded from append-only file: 0.512 seconds
\`\`\`

> **混合持久化的优势**：① 加载快（RDB 部分直接 load）；② 数据安全（AOF 增量保证秒级不丢）；③ 文件不会太大（RDB 紧凑）。生产环境强烈推荐。

### 兼容性注意

\`\`\`bash
# 4.0 前的 Redis 无法加载混合 AOF（RDB 前导部分不识别）
# 降级时需要：关闭混合持久化，手动重写为纯 AOF

127.0.0.1:6379> CONFIG SET aof-use-rdb-preamble no
OK
127.0.0.1:6379> BGREWRITEAOF
# 重写后 AOF 是纯文本格式，可被低版本加载
\`\`\`

## 13.8 多 PART AOF（7.0+）

Redis 7.0 重构了 AOF 存储，从单文件改为**多文件（multi-part AOF）**结构。

### 目录结构

\`\`\`
appendonlydir/
├── appendonly.aof.1.base.rdb     # base 文件（RDB 格式全量，重写时生成）
├── appendonly.aof.1.incr.aof     # 增量命令日志（重写后的新命令）
└── appendonly.aof.manifest       # 清单文件（记录各文件信息）
\`\`\`

### 各文件作用

| 文件 | 作用 |
| --- | --- |
| \`*.base.rdb\` | 重写时的全量快照（RDB 格式），加载快 |
| \`*.incr.aof\` | 重写后的增量命令（AOF 文本格式） |
| \`*.manifest\` | 清单，记录 base 和 incr 文件版本、大小、校验和 |

### 好处

- **重写更稳**：不用一次性生成整个新文件，内存占用更平稳。
- **base 和 incr 分离**：便于管理，损坏时能精确定位。
- **支持增量备份**：incr 文件可以单独备份。

\`\`\`bash
# 查看新结构
ls -lh appendonlydir/
# -rw-r--r-- 1 redis redis 12M appendonly.aof.1.base.rdb
# -rw-r--r-- 1 redis redis 512K appendonly.aof.1.incr.aof
# -rw-r--r-- 1 redis redis 256  appendonly.aof.manifest

# 校验
redis-check-aof --fix appendonlydir/appendonly.aof.1.base.rdb
redis-check-aof --fix appendonlydir/appendonly.aof.1.incr.aof
\`\`\`

### manifest 文件示例

\`\`\`ini
# appendonly.aof.manifest
file appendonly.aof.1.base.rdb seq 1 type b
file appendonly.aof.1.incr.aof seq 1 type i
\`\`\`

> **7.0 迁移注意**：从 7.0 降到 6.x，多 PART AOF 结构不被识别，需要手动把 base + incr 合并成单文件 AOF（用 \`redis-check-aof --truncate-to-timestamp\` 等工具）。

## 13.9 加载顺序与启动行为

Redis 启动时按优先级加载持久化文件：

1. **若开启 AOF**（\`appendonly yes\`）：加载 AOF（含混合的 RDB 部分）。
2. **否则加载 RDB**（\`dump.rdb\`）。
3. **都没有**：空启动。

\`\`\`bash
# 启动日志会显示加载过程
redis-server /etc/redis/redis.conf

# 开启 AOF 时：
# * Loading RDB produced by version 7.2.0   # 混合 AOF 的 RDB 部分
# * Loading AOF tail ...                     # AOF 增量部分
# * DB loaded from append-only file: 0.512 seconds

# 未开启 AOF 时：
# * Loading RDB produced by version 7.2.0
# * DB loaded from disk: 1.234 seconds
\`\`\`

> **关键点**：开启 AOF 后，RDB 不再参与启动加载（除非 AOF 损坏）。要从 RDB 恢复，必须临时关闭 AOF 或移走 AOF 文件。

## 13.10 性能调优

### 刷盘策略调优

\`\`\`bash
# 通用场景：everysec（默认推荐）
appendfsync everysec

# 高吞吐缓存：no（交给 OS，丢 30 秒可接受）
appendfsync no

# 金融级不丢：always（吞吐掉一个数量级）
appendfsync always
\`\`\`

### 重写期间禁用 fsync

\`\`\`bash
# redis.conf
no-appendfsync-on-rewrite no    # 默认 no

# yes: AOF 重写期间，主进程的 appendfsync 不执行（避免重写子进程和主进程同时 fsync 竞争磁盘）
# no: 重写期间仍按 appendfsync 策略刷盘（默认，更安全）
\`\`\`

> **磁盘 IO 紧张时**：设 \`no-appendfsync-on-rewrite yes\`，避免重写期间双重 fsync 拖慢磁盘。代价是重写期间最多丢 1 秒数据（everysec 下）。

### 重写阈值调优

\`\`\`bash
# 写入频繁的业务：调低 percentage，让重写更积极
auto-aof-rewrite-percentage 50
auto-aof-rewrite-min-size 64mb

# 写入稀疏的业务：调高，减少重写次数
auto-aof-rewrite-percentage 200
auto-aof-rewrite-min-size 128mb
\`\`\`

### 磁盘选型

\`\`\`bash
# AOF 性能瓶颈通常是磁盘 fsync
# SSD：fsync ~200μs，everysec 模式无压力
# 机械盘：fsync ~10ms，everysec 可能都吃力
# NVMe：fsync ~50μs，最佳

# 查看磁盘 IO
iostat -x 1
# 关注 await（IO 等待时间）和 %util（磁盘利用率）
\`\`\`

## 13.11 AOF 的优缺点

### 优点

- **数据安全**：\`everysec\` 最多丢 1 秒，\`always\` 不丢。
- **可读性强**：AOF 是文本日志，能直接看命令、人工修复。
- **灾难恢复友好**：误操作（如 FLUSHALL）后，立即停 Redis，编辑 AOF 删掉那行，重启可恢复。
- **格式清晰**：RESP 协议，便于解析和审计。

### 缺点

- **文件大**：相同数据 AOF 比 RDB 大得多（命令 + 协议开销）。
- **恢复慢**：启动要重放所有命令，比 RDB load 慢数倍（混合持久化后已大幅改善）。
- **写性能略降**：每条写命令多一次磁盘 IO（\`everysec\` 下影响小）。
- **重写 fork 卡顿**：同 RDB 痛点，大实例 fork 阻塞。

### RDB vs AOF 详细对比

| 维度 | RDB | AOF |
| --- | --- | --- |
| 数据安全 | 分钟级丢失 | 秒级（everysec）/ 不丢（always） |
| 文件大小 | 小（紧凑二进制） | 大（文本命令，重写后缩小） |
| 恢复速度 | 快（直接 load） | 慢（重放命令，混合后改善） |
| 性能影响 | 低（fork 时） | 略高（每写多一次 IO） |
| 可读性 | 不可读 | 可读（RESP 文本） |
| 灾难恢复 | 只能整体恢复 | 可编辑删除误操作命令 |
| 适用 | 冷备、缓存、可接受丢失 | 数据库、要求不丢 |

## 13.12 恢复与误操作修复

### 从 AOF 恢复数据

\`\`\`bash
# 1. 停止 Redis
redis-cli SHUTDOWN NOSAVE

# 2. 备份当前 AOF
cp -r /var/lib/redis/appendonlydir /backup/appendonlydir.bak

# 3. 用历史 AOF 备份替换
cp /backup/appendonly-20240101.aof /var/lib/redis/appendonly.aof
# 7.0+ 多 PART 结构需要替换整个 appendonlydir

# 4. 校验 AOF 完整性
redis-check-aof --fix /var/lib/redis/appendonly.aof

# 5. 启动 Redis
redis-server /etc/redis/redis.conf

# 6. 验证数据
redis-cli DBSIZE
\`\`\`

### 误操作 FLUSHALL 后的紧急恢复

\`\`\`bash
# 误操作执行了 FLUSHALL，数据全没了
127.0.0.1:6379> FLUSHALL
OK

# 紧急步骤：
# 1. 立即 SHUTDOWN NOSAVE（不要让 AOF 重写覆盖！）
redis-cli SHUTDOWN NOSAVE

# 2. 编辑 AOF 文件，删掉 FLUSHALL 那行
#    找到 FLUSHALL 命令（*1\\n$8\\nFLUSHALL），整段删除
vi /var/lib/redis/appendonly.aof
# 删除：
# *1
# $8
# FLUSHALL

# 3. 校验并启动
redis-check-aof --fix /var/lib/redis/appendonly.aof
redis-server /etc/redis/redis.conf

# 4. 数据恢复（FLUSHALL 之前的命令都在 AOF 里）
\`\`\`

> **黄金时间**：误操作后必须**立即停 Redis**，赶在 AOF 重写之前。一旦 AOF 重写，FLUSHALL 后的空状态会成为新的 base，数据就真没了。

## 13.13 踩坑提示

- **always 别滥用**：吞吐掉一个数量级，金融场景才考虑。
- **AOF 文件损坏无法启动**：用 \`redis-check-aof --fix\` 修复，但可能丢末尾不完整命令。
- **重写期间磁盘满**：重写失败，AOF 仍是旧的，监控 \`aof_last_bgrewrite_status\`。
- **everysec 的丢 1 秒**：是"最多丢 1 秒"，不是"丢最后 1 秒"。fsync 间隔内的数据丢。
- **AOF 太大**：检查重写配置是否合理，\`auto-aof-rewrite-min-size\` 别设太大。
- **误操作 FLUSHALL 后**：立即 \`SHUTDOWN NOSAVE\`，编辑 AOF 删掉 FLUSHALL 那行，重启可恢复（AOF 还没被重写覆盖时）。
- **混合持久化兼容性**：4.0 前的 Redis 无法加载混合 AOF，降级时注意。
- **多 PART AOF 迁移**：7.0 的 AOF 目录结构变了，从 7.0 降到 6.x 需要手动处理。
- **AOF 重写期间内存放大**：重写缓冲区暂存增量命令，写入极快时可能占用可观内存。
- **fsync 阻塞**：磁盘慢时 fsync 耗时长，\`everysec\` 也可能影响主线程，监控 \`aof_delayed_fsync\`。

\`\`\`bash
# 监控 AOF 健康的关键指标
127.0.0.1:6379> INFO persistence
# 重点关注：
# aof_enabled:1                      # AOF 是否开启
# aof_last_bgrewrite_status:ok       # 重写结果
# aof_last_write_status:ok           # 写入结果
# aof_rewrite_in_progress:0          # 是否在重写

127.0.0.1:6379> INFO stats
# aof_delayed_fsync:0                # fsync 延迟次数（磁盘慢时会增长）
\`\`\`

## 13.14 本章小结

- **AOF** 追加每条写命令到日志，重启重放恢复，做到秒级不丢。
- **工作流程**：执行命令 → 写 AOF 缓冲区 → 按 \`appendfsync\` 刷盘。
- **三种刷盘**：\`always\`（不丢但慢）、\`everysec\`（默认推荐，最多丢 1 秒）、\`no\`（交给 OS）。
- **AOF 文件格式**：RESP 协议文本，可读性强，便于审计和灾难恢复。
- **重写**：根据当前内存生成最小 AOF，手动 \`BGREWRITEAOF\` 或自动按百分比/大小触发。
- **aof-load-truncated**：默认开启，加载截断 AOF 时忽略末尾不完整命令。
- **混合持久化（4.0+）**：AOF 重写时 base 用 RDB 格式，增量用 AOF，兼顾速度与安全，生产标配。
- **多 PART AOF（7.0+）**：base + incr 多文件，重写更稳，便于管理。
- **启动加载优先级**：AOF > RDB > 空启动。
- **优点**：安全、可读、易恢复误操作；**缺点**：文件大、恢复慢、IO 略增。
- **生产建议**：**混合持久化 + everysec**，兼顾性能与安全；监控 \`aof_last_bgrewrite_status\`、\`aof_delayed_fsync\`。

下一章学习 Redis 如何管理过期 key 和内存——**过期策略与内存淘汰**，搞懂数据自动清理和 OOM 防护。`
  },
  {
    id: "redis-ch14",
    group: "第三部分 持久化与过期策略",
    icon: "⏰",
    title: "第 14 章 过期策略与内存淘汰",
    content: `# 第 14 章 过期策略与内存淘汰

Redis 是内存数据库，内存有限。本章回答两个核心问题：**设了 TTL 的 key 什么时候被删？内存满了怎么办？** 这两套机制——过期策略与内存淘汰——决定了 Redis 的稳定性和数据保留策略，是生产运维必须搞懂的知识点。

## 14.1 设置过期时间

Redis 允许给 key 设置过期时间（TTL，Time To Live），到期后 key 自动失效。

### 命令一览

\`\`\`bash
# 秒级过期
127.0.0.1:6379> EXPIRE key 60
# 60 秒后过期

# 毫秒级过期
127.0.0.1:6379> PEXPIRE key 60000
# 60000 毫秒（60 秒）后过期

# 时间戳过期（秒）
127.0.0.1:6379> EXPIREAT key 1735689600
# 在 UNIX 时间戳 1735689600（2025-01-01 00:00:00 UTC）过期

# 时间戳过期（毫秒）
127.0.0.1:6379> PEXPIREAT key 1735689600000

# SET 时直接带过期（推荐，原子操作）
127.0.0.1:6379> SET key val EX 60      # 60 秒过期
127.0.0.1:6379> SET key val PX 60000   # 60000 毫秒过期
127.0.0.1:6379> SET key val EXAT 1735689600   # 在指定时间戳过期（秒）
127.0.0.1:6379> SET key val PXAT 1735689600000 # 毫秒

# 查看剩余 TTL
127.0.0.1:6379> TTL key        # 返回秒
127.0.0.1:6379> PTTL key       # 返回毫秒

# 取消过期（变为永久 key）
127.0.0.1:6379> PERSIST key
\`\`\`

### TTL 返回值含义

| 返回值 | 含义 |
| --- | --- |
| -2 | key 不存在（已过期或从未创建） |
| -1 | key 存在但没有设置过期时间（永久 key） |
| 正数 | 剩余生存时间（秒或毫秒） |

\`\`\`bash
127.0.0.1:6379> SET k1 v1 EX 60
OK
127.0.0.1:6379> TTL k1
(integer) 58                    # 剩余 58 秒

127.0.0.1:6379> SET k2 v2       # 永久 key
OK
127.0.0.1:6379> TTL k2
(integer) -1                   # 永久

127.0.0.1:6379> TTL notexist
(integer) -2                   # 不存在
\`\`\`

### 过期时间的存储

Redis 用一个独立的 **expires 字典**（\`redisDb.expires\`）保存 key → 过期时间戳的映射，主字典 \`redisDb.dict\` 保存 key → value。两者 key 相同但分开存储。

\`\`\`
redisDb.dict      →  key -> value     (主数据)
redisDb.expires   →  key -> 过期时间戳 (过期信息)
\`\`\`

> **为什么分开存储？** ① 不设过期的 key 不占用 expires 字典空间；② 过期检查只需查 expires 字典，不影响主字典性能；③ 便于过期策略抽样扫描。

### EXPIRE 的选项（7.0+）

\`\`\`bash
# 7.0+ 的 EXPIRE 支持选项参数
# NX: 仅当 key 没有过期时间时设置
# XX: 仅当 key 已有过期时间时设置
# GT: 仅当新 TTL 大于当前 TTL 时设置
# LT: 仅当新 TTL 小于当前 TTL 时设置

127.0.0.1:6379> SET k v
OK
127.0.0.1:6379> EXPIRE k 60 NX     # 仅当 k 没有过期时间时设置
(integer) 1
127.0.0.1:6379> EXPIRE k 120 NX    # k 已有过期时间，设置失败
(integer) 0
127.0.0.1:6379> EXPIRE k 30 LT     # 30 < 60，设置成功
(integer) 1
127.0.0.1:6379> EXPIRE k 100 GT    # 100 > 30，设置成功
(integer) 1
\`\`\`

## 14.2 哪些操作会影响 TTL

### 清除 TTL 的操作

- \`DEL\`：删除 key（连同 TTL）。
- \`SET\`（不带 \`KEEPTTL\`）：覆盖 key，TTL 被清除，新值变永久。
- \`PERSIST\`：主动清除 TTL，变永久。
- \`EXPIRE\`/\`PEXPIRE\`：覆盖旧 TTL，设为新值。

### 保留 TTL 的操作

- \`RENAME\`：TTL 跟随 key 一起转移到新名字。
- \`SET key val KEEPTTL\`（6.0+）：更新值但保留原 TTL。
- \`INCR\`/\`DECR\`/\`APPEND\` 等修改命令：不改变 TTL。
- \`HSET\`/\`LPUSH\`/\`SADD\` 等容器命令：不改变 TTL。

\`\`\`bash
# SET 覆盖 TTL 的坑
127.0.0.1:6379> SET k v EX 60
OK
127.0.0.1:6379> TTL k
(integer) 58
127.0.0.1:6379> SET k v        # 不带 EX，TTL 没了！
OK
127.0.0.1:6379> TTL k
(integer) -1                   # 变成永久 key

# KEEPTTL 保留（6.0+）
127.0.0.1:6379> SET k v2 EX 60
OK
127.0.0.1:6379> SET k v3 KEEPTTL    # 更新值但保留 TTL
OK
127.0.0.1:6379> TTL k
(integer) 52                   # TTL 还在

# RENAME 转移 TTL
127.0.0.1:6379> SET old v EX 60
OK
127.0.0.1:6379> RENAME old new
OK
127.0.0.1:6379> TTL new
(integer) 55                   # TTL 跟着转移了
\`\`\`

> **常见坑**：用 \`SET k v\` 更新已有 TTL 的 key 时，TTL 会被清除。要保留 TTL 必须加 \`KEEPTTL\` 或重新指定 \`EX\`。

### 对容器类型的特殊说明

\`\`\`bash
# 给整个 List 设 TTL，而不是单个元素
127.0.0.1:6379> RPUSH mylist a b c
(integer) 3
127.0.0.1:6379> EXPIRE mylist 60
(integer) 1
# 60 秒后整个 mylist 被删除，不是单个元素

# Redis 不支持给 Hash 的单个 field 设 TTL（7.4+ 才支持 HEPIRE）
\`\`\`

## 14.3 过期策略：惰性删除 + 定期删除

设了 TTL 的 key，到时间**不会立刻消失**——Redis 用**两种策略配合**清理过期 key。

### 惰性删除（Lazy / Passive Expiration）

访问 key 时才检查是否过期，过期则删除并返回 nil。

\`\`\`bash
127.0.0.1:6379> SET k v EX 5
OK
# 等 6 秒后访问
127.0.0.1:6379> GET k
(nil)    # 此时才检查、删除并返回 nil
\`\`\`

**优点**：CPU 友好，只在访问时检查，不浪费资源扫不活跃的 key。
**缺点**：**内存泄漏**——过期但无人访问的 key 会一直占内存。

### 定期删除（Active Expiration）

Redis 每秒执行约 10 次定期清理（由 \`hz\` 配置控制）：

1. 从 \`expires\` 字典随机抽 20 个 key。
2. 检查并删除其中已过期的。
3. 如果过期比例 > 25%，重复步骤 1（继续抽样）。
4. 每轮执行不超过 25 毫秒（避免阻塞主线程）。

\`\`\`bash
# redis.conf
hz 10                # 每秒执行周期任务的频率（1~500，默认 10）

# 自适应模式（5.0+）：空闲时降低 hz 省 CPU，忙时提高
dynamic-hz yes       # 默认 yes
\`\`\`

\`\`\`bash
# 运行时修改 hz（影响过期清理、超时检测等周期任务频率）
127.0.0.1:6379> CONFIG GET hz
1) "hz"
2) "10"
127.0.0.1:6379> CONFIG SET hz 20
OK
\`\`\`

> **hz 调优**：① \`hz\` 越高，过期清理越积极，但 CPU 开销越大；② 大量 key 同时过期的场景可临时调高 \`hz\`；③ \`dynamic-hz yes\` 让 Redis 自动调节，通常无需手动改。

### 两者结合

\`\`\`bash
# 惰性删除：访问时检查，保证访问的 key 一定干净
# 定期删除：回收无人访问的过期 key，防止内存泄漏

# 两者配合，既不过度消耗 CPU，又能回收内存
\`\`\`

### 监控过期情况

\`\`\`bash
127.0.0.1:6379> INFO stats
# expired_keys:1234         # 累计过期删除的 key 数
# evicted_keys:0            # 因内存淘汰被删的 key 数
# keyspace_misses:0         # 未命中次数

127.0.0.1:6379> INFO keyspace
# db0:keys=1000,expires=800,avg_ttl=30000
# keys=1000       # 总 key 数
# expires=800     # 设了过期的 key 数
# avg_ttl=30000   # 平均剩余 TTL（毫秒）
\`\`\`

> **过期不及时的坑**：如果大量 key 同时过期，定期删除会忙一阵；如果这些 key 一直没人访问，内存可能不释放，要靠内存淘汰机制兜底。

## 14.4 内存淘汰：maxmemory 配置

当 Redis 使用内存达到 \`maxmemory\` 上限时，按 \`maxmemory-policy\` 决定删谁腾地方。

### 配置

\`\`\`bash
# redis.conf
maxmemory 4gb
maxmemory-policy allkeys-lru

# 运行时查看
127.0.0.1:6379> CONFIG GET maxmemory
1) "maxmemory"
2) "4294967296"        # 字节数（4GB）
127.0.0.1:6379> CONFIG GET maxmemory-policy
1) "maxmemory-policy"
2) "allkeys-lru"

# 运行时修改
127.0.0.1:6379> CONFIG SET maxmemory 8gb
OK
127.0.0.1:6379> CONFIG SET maxmemory-policy allkeys-lfu
OK
127.0.0.1:6379> CONFIG REWRITE      # 持久化到配置文件
OK
\`\`\`

### maxmemory 的计算

\`\`\`bash
# maxmemory 限制的是 used_memory（Redis 逻辑使用内存）
# 不包括：
# - AOF 缓冲区
# - 客户端输出缓冲区
# - 复制积压缓冲区（部分版本）
# - 内存碎片（used_memory_rss - used_memory）

127.0.0.1:6379> INFO memory
# used_memory:2147483648            # Redis 逻辑使用（含 overhead）
# used_memory_rss:2300000000        # OS 视角实际占用（含碎片）
# used_memory_peak:2500000000       # 历史峰值
# maxmemory:4294967296              # 上限
# mem_fragmentation_ratio:1.07      # 碎片率
\`\`\`

> **maxmemory 不含碎片**：\`used_memory_rss\` 可能远大于 \`maxmemory\`（碎片多时）。设置 \`maxmemory\` 时要预留碎片和 COW 余量。

## 14.5 八种淘汰策略总览

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

# 检查有多少 key 设了 TTL
127.0.0.1:6379> INFO keyspace
# db0:keys=1000,expires=800,avg_ttl=30000
# expires=800 表示 800 个 key 设了 TTL
\`\`\`

> **混合存储陷阱**：用 \`volatile-lru\` 时，没设 TTL 的 key 永远不会被淘汰，可能让设了 TTL 的 key 被清空而永久 key 占满内存。务必确认所有"可丢"的 key 都设了 TTL。

### volatile-ttl 的特点

\`\`\`bash
# volatile-ttl: 优先淘汰 TTL 最短（最快过期）的 key
# 逻辑：反正这些 key 马上就过期了，提前删也无妨

# 适用：缓存数据有明确过期时间，让快要过期的先走
# 不适用：所有 key 的 TTL 相同（退化成随机）
\`\`\`

## 14.6 LRU 近似算法

Redis 用的是**近似 LRU**，不是精确 LRU，性能更好。

### 精确 LRU 的代价

精确 LRU 需要维护一个全局双向链表，每次访问都要把 key 移到链表头部，淘汰时取尾部。这在 Redis 的单线程模型下开销太大（每次访问都要改链表）。

### Redis 的近似 LRU

Redis **随机抽样 N 个 key**（默认 5），淘汰其中最久未访问的：

\`\`\`bash
# 抽样数量，越大越接近真实 LRU，但 CPU 开销越大
maxmemory-samples 5    # 默认 5

# 运行时修改
127.0.0.1:6379> CONFIG SET maxmemory-samples 10
OK
\`\`\`

### 抽样数量对精度的影响

| \`maxmemory-samples\` | 精度 | CPU 开销 |
| --- | --- | --- |
| 1 | 几乎随机淘汰 | 最低 |
| 5（默认） | 接近真实 LRU | 低 |
| 10 | 更接近真实 LRU | 略高 |

\`\`\`bash
# Redis 4.0+ 引入"淘汰池"（eviction pool），进一步提升精度
# 默认开启，无需配置
# 维护一个大小为 16 的候选池，每次抽样后与池中已有 key 合并，淘汰池中最差的
\`\`\`

> **LRU 的局限**：偶尔被访问的冷数据会"挤掉"长期热点。比如一个偶尔被读的 key 刚被访问，LRU 会认为它"热"。这种场景用 LFU 更合适。

### LRU 的实现细节

\`\`\`bash
# 每个 key 的 redisObject 结构里有一个 24 位的 lru 字段
# 记录该 key 最后一次访问的时间戳（秒精度，低 24 位）

# 访问 key 时更新 lru 字段
127.0.0.1:6379> GET k1    # 更新 k1 的 lru 时间戳
# 淘汰时抽样 N 个 key，比较 lru 时间戳，删最旧的

# OBJECT IDLETIME 查看 key 空闲时间（基于 lru 字段，不更新 lru）
127.0.0.1:6379> OBJECT IDLETIME k1
(integer) 120    # k1 已经 120 秒没被访问
\`\`\`

## 14.7 LFU 近似算法（4.0+）

LFU（Least Frequently Used）按**访问频率**淘汰，更适合"有明显热点"的场景。

### LFU 的工作原理

每个 key 维护一个**对数计数器**（8 位，0~255）和最后访问时间（16 位）。

\`\`\`bash
# LFU 相关配置
# 计数器对数因子（越大计数器增长越慢，热点更持久）
lfu-log-factor 10    # 默认 10

# 衰减时间（分钟）：多久没访问就衰减一次计数器
lfu-decay-time 1     # 默认 1 分钟
\`\`\`

### 对数计数器

\`\`\`bash
# 8 位计数器范围 0~255
# 但用对数增长，能表示远超 255 次的访问
# lfu-log-factor=10 时：
#   100 次访问   -> 计数器约 5
#   1000 次访问  -> 计数器约 18
#   10000 次访问 -> 计数器约 54
#   100000 次访问-> 计数器约 118
#   1000000 次  -> 计数器约 255（饱和）

# 这样设计的原因：
# - 8 位存储省内存（每个 key 只多 1 字节）
# - 对数增长区分"偶尔访问"和"高频访问"
# - 避免冷 key 因为偶然访问就获得高计数
\`\`\`

### 衰减机制

\`\`\`bash
# lfu-decay-time: 多久没访问就衰减一次（分钟）
# lfu-decay-time=1：每分钟没访问，计数器减 1
# 防止"曾经的热点"永远占据内存

# 设为 0：不衰减（热点永久保留，慎用）
\`\`\`

### OBJECT FREQ 查看 LFU 频率

\`\`\`bash
# 7.0+ 查看key 的 LFU 访问频率（需 LFU 策略）
127.0.0.1:6379> OBJECT FREQ k1
(integer) 5    # 计数器值
\`\`\`

## 14.8 LRU vs LFU 对比与选型

### 对比表

| 场景 | LRU | LFU |
| --- | --- | --- |
| 周期性扫表（偶尔全量读） | 误判为热 | 不受影响 |
| 突发热点 | 命中快 | 需要积累访问次数 |
| 长期热点 + 偶尔冷读 | 可能挤掉热点 | 稳定保留热点 |
| 实现复杂度 | 简单 | 略复杂 |
| 内存开销 | 24 位时间戳 | 8 位计数器 + 16 位时间 |

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

# 4. 业务有明显热点吗？
#    有（如商品详情、热门文章）-> allkeys-lfu / volatile-lfu
#    无 -> allkeys-lru / volatile-lru
\`\`\`

### 典型场景推荐

| 场景 | 推荐 policy | maxmemory |
| --- | --- | --- |
| 纯缓存（通用） | \`allkeys-lru\` | 物理内存 60~70% |
| 纯缓存（明显热点） | \`allkeys-lfu\` | 物理内存 60~70% |
| 会话存储 | \`volatile-lru\` | 物理内存 70% |
| 持久化数据库 | \`noeviction\` | 留 20% 余量 |
| 混合（缓存 + 持久数据） | \`volatile-lru\` | 物理内存 70% |

> **选型建议**：默认 \`allkeys-lru\`；如果业务有明显热点（如商品详情、热门文章）且偶有批量扫描，用 \`allkeys-lfu\`。

## 14.9 maxmemory 设置原则

### 单机内存

\`\`\`bash
# 1. 留 25~30% 给系统、fork COW、AOF 重写缓冲
# 2. 监控 used_memory / maxmemory 比例，超 80% 告警

# 推荐公式：
# maxmemory = 物理内存 × 60~70%

# 示例：16GB 机器
# maxmemory 10gb    # 留 6GB 给系统、fork、碎片
\`\`\`

### 集群内存

\`\`\`bash
# 集群：单分片 maxmemory × 分片数 < 总内存
# 3 主 3 从，每台 16GB：
#   单分片 maxmemory 10gb
#   集群可用内存 = 10gb × 3 = 30gb（从节点不参与读写）
\`\`\`

### 碎片率监控

\`\`\`bash
127.0.0.1:6379> INFO memory
# used_memory:2147483648         # 实际使用（含 overhead）
# used_memory_rss:2300000000     # OS 视角占用
# maxmemory:4294967296           # 上限
# mem_fragmentation_ratio:1.07   # 碎片率
\`\`\`

| 碎片率 | 含义 | 处理 |
| --- | --- | --- |
| < 1.0 | 内存超用（用了 swap） | 检查是否 swap，扩容 |
| 1.0 ~ 1.5 | 正常 | 无需处理 |
| > 1.5 | 碎片多 | 重启或 \`MEMORY PURGE\` |
| > 2.0 | 碎片严重 | 必须处理，可能 OOM |

\`\`\`bash
# 手动回收碎片（jemalloc，4.0+）
127.0.0.1:6379> MEMORY PURGE
OK

# 主动碎片整理（4.0+，需编译时开启 JEMALLOC）
activedefrag yes
\`\`\`

> **碎片率**：\`mem_fragmentation_ratio = used_memory_rss / used_memory\`。>1.5 说明内存碎片多（频繁修改大 key），可重启或用 \`MEMORY PURGE\`（jemalloc）回收。

## 14.10 MEMORY 命令族

### MEMORY USAGE

\`\`\`bash
# 查看单个 key 占用的内存（字节）
127.0.0.1:6379> SET k1 hello
OK
127.0.0.1:6379> MEMORY USAGE k1
(integer) 56    # k1 占用 56 字节（含 overhead）

# 指定采样数（对大容器更精确，但更慢）
127.0.0.1:6379> MEMORY USAGE biglist SAMPLES 1000
(integer) 12345678

# 返回 nil 表示 key 不存在
127.0.0.1:6379> MEMORY USAGE notexist
(nil)
\`\`\`

### MEMORY STATS

\`\`\`bash
# 查看内存详细统计
127.0.0.1:6379> MEMORY STATS
# 1) "peak.allocated"        # 历史峰值
# 2) (integer) 2500000000
# 3) "total.allocated"       # 当前分配
# 4) (integer) 2147483648
# 5) "startup.allocated"     # 启动时占用
# 6) (integer) 1000000
# 7) "replication.backlog"   # 复制积压缓冲区
# 8) (integer) 1048576
# 9) "clients.slaves"        # 从节点输出缓冲
# 10) (integer) 0
# 11) "clients.normal"       # 普通客户端缓冲
# 12) (integer) 102400
# 13) "aof.buffer"           # AOF 缓冲区
# 14) (integer) 0
# 15) "dataset.bytes"        # 实际数据
# 16) (integer) 2000000000
# 17) "dataset.percentage"   # 数据占比
# 18) "93.13"
# 19) "fragmentation"        # 碎片率
# 20) "1.07"
\`\`\`

### MEMORY DOCTOR

\`\`\`bash
# 内存健康诊断（7.0+）
127.0.0.1:6379> MEMORY DOCTOR
# Sam, I detected a few issues in this Redis instance memory implants:
# 1) Peak memory: 2.5GB. I'm a bit concerned, peak is higher than current used memory.
# 2) High fragmentation: 1.7. ...
\`\`\`

\`\`\`bash
# 主动整理碎片（jemalloc，4.0+）
127.0.0.1:6379> MEMORY PURGE
OK

# MEMORY MALLOC-STATS：查看分配器详细统计
127.0.0.1:6379> MEMORY MALLOC-STATS
\`\`\`

## 14.11 异步删除（lazyfree）

删除大 key（百万元素的 List）会阻塞主线程，淘汰时同样会卡。Redis 4.0+ 引入**异步删除**，把耗时删除操作放到后台线程。

### 配置

\`\`\`bash
# redis.conf 异步删除开关（4.0+）
lazyfree-lazy-eviction yes        # 内存淘汰时异步删除
lazyfree-lazy-expire yes          # 过期删除时异步删除
lazyfree-lazy-server-del yes      # 服务端命令（如 RENAME 覆盖旧 key）异步删除
lazyfree-lazy-user-del yes        # 用户 DEL 命令异步删除（4.0+）
lazyfree-lazy-user-flush yes      # 用户 FLUSHALL/FLUSHDB 异步（6.0+）

# 默认值：
# lazyfree-lazy-eviction no（4.0 默认 no，建议改 yes）
# lazyfree-lazy-expire no
# lazyfree-lazy-server-del no
# lazyfree-lazy-user-del no
\`\`\`

\`\`\`bash
# 生产建议全开
127.0.0.1:6379> CONFIG SET lazyfree-lazy-eviction yes
OK
127.0.0.1:6379> CONFIG SET lazyfree-lazy-expire yes
OK
127.0.0.1:6379> CONFIG SET lazyfree-lazy-server-del yes
OK
127.0.0.1:6379> CONFIG SET lazyfree-lazy-user-del yes
OK
127.0.0.1:6379> CONFIG REWRITE
OK
\`\`\`

### UNLINK 命令

\`\`\`bash
# UNLINK：异步版 DEL（4.0+）
127.0.0.1:6379> UNLINK biglist
(integer) 1    # 立即返回，后台线程异步释放内存

# DEL：同步删除，大 key 阻塞
127.0.0.1:6379> DEL biglist
(integer) 1    # 阻塞直到删除完成

# 小 key 用 DEL 即可，大 key（>1MB 或万元素）用 UNLINK
\`\`\`

> **生产建议**：开启所有 \`lazyfree-lazy-*\`，避免大 key 淘汰/删除阻塞主线程。这是 4.0+ 的标配配置。

## 14.12 监控指标

### 关键监控项

\`\`\`bash
127.0.0.1:6379> INFO memory
# used_memory              # 逻辑使用内存
# used_memory_rss          # OS 实际占用
# used_memory_peak         # 历史峰值
# maxmemory                # 上限
# mem_fragmentation_ratio  # 碎片率

127.0.0.1:6379> INFO stats
# evicted_keys:0           # 因淘汰被删的 key 数（持续增长说明容量不足）
# expired_keys:1234        # 过期删除的 key 数
# keyspace_misses:0        # 未命中次数

127.0.0.1:6379> INFO keyspace
# db0:keys=1000,expires=800,avg_ttl=30000
\`\`\`

### 告警阈值建议

| 指标 | 告警阈值 | 含义 |
| --- | --- | --- |
| \`used_memory / maxmemory\` | > 80% | 内存使用率高 |
| \`evicted_keys\` | 持续增长 | 正在淘汰，容量不足 |
| \`mem_fragmentation_ratio\` | > 1.5 | 碎片多 |
| \`mem_fragmentation_ratio\` | < 1.0 | 用了 swap |
| \`used_memory_peak / maxmemory\` | > 90% | 峰值逼近上限 |

\`\`\`bash
# 查看淘汰统计
127.0.0.1:6379> INFO stats | grep evicted
# evicted_keys:1234    # 如果持续增长，说明 maxmemory 不够
\`\`\`

## 14.13 踩坑提示

- **noeviction 满内存写报错**：业务侧要捕获 OOM 错误，别让请求堆积。
- **volatile-* 没设 TTL 等同 noeviction**：用 volatile-* 必须保证可丢数据都设了 TTL。
- **maxmemory 设太高**：不留余量，fork 时 OOM 杀进程，整个 Redis 挂。
- **maxmemory 设太低**：淘汰频繁，命中率下降，缓存形同虚设。
- **LRU 抽样太小**：\`maxmemory-samples 1\` 几乎是随机淘汰，至少 5。
- **不监控 evicted_keys**：持续淘汰说明容量不足，要么扩容要么调策略。
- **LFU 衰减参数**：\`lfu-decay-time\` 设太大热点永不淘汰，设太小热点被误杀。
- **大 key 淘汰卡顿**：删大 key（百万元素 List）阻塞，淘汰时同样会卡。用 \`lazyfree-lazy-eviction yes\`（4.0+）异步淘汰。
- **重启后策略丢失**：\`CONFIG SET\` 改的配置重启失效，要 \`CONFIG REWRITE\` 写回文件。
- **SET 覆盖 TTL**：\`SET k v\` 会清除 k 的 TTL，要保留用 \`KEEPTTL\`。
- **大量 key 同时过期**：定期删除忙不过来，可能短暂卡顿；给 TTL 加随机抖动。

\`\`\`bash
# 给 TTL 加随机抖动，避免同时过期
# 错误：所有 key 同时过期
for i in range(1000):
    redis.expire(f"key_{i}", 3600)

# 正确：TTL 加随机抖动
import random
for i in range(1000):
    redis.expire(f"key_{i}", 3600 + random.randint(0, 300))  # 3600~3900 秒
\`\`\`

## 14.14 本章小结

- **过期时间**用 \`EXPIRE\`/\`PEXPIRE\`/\`EXPIREAT\`/\`PEXPIREAT\` 或 \`SET EX\`/\`PX\` 设置，\`TTL\`/\`PTTL\` 查看，\`PERSIST\` 取消。
- **TTL 返回值**：-2 不存在、-1 永久、正数剩余时间。
- **过期策略 = 惰性删除 + 定期删除**：访问时检查 + 每秒约 10 次抽样清理，两者结合平衡 CPU 与内存。
- **内存淘汰 8 种策略**：\`noeviction\` / \`allkeys-{lru,lfu,random}\` / \`volatile-{lru,lfu,random,ttl}\`。
- **LRU** 淘汰最久未访问，**LFU** 淘汰访问频率最低；Redis 用近似算法（随机抽样），\`maxmemory-samples\` 控制精度。
- **选型决策**：纯缓存用 \`allkeys-lru\`（或 lfu），不能丢用 \`noeviction\`，混合用 \`volatile-*\`（务必全设 TTL）。
- **maxmemory** 留 25~30% 余量，监控 \`used_memory\`/\`evicted_keys\`/\`mem_fragmentation_ratio\`。
- **MEMORY 命令族**：\`MEMORY USAGE\` 看单 key 内存，\`MEMORY STATS\` 看详细统计，\`MEMORY PURGE\` 回收碎片。
- **生产建议**：开启 \`lazyfree-lazy-*\` 异步删除，避免大 key 淘汰阻塞；给 TTL 加随机抖动避免同时过期。

至此，《Redis 实战教程》前三批次（共 14 章）完成。从基础数据结构到持久化与内存管理，已覆盖日常开发 80% 的 Redis 知识点。后续将进入运维、集群、性能优化等进阶主题。`
  }
];

export { chapters };
