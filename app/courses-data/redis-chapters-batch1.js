// =============================================================
// 《Redis 实战教程》- 章节批次 1
// -------------------------------------------------------------
// 内容：第一部分 入门与基础（第 1-5 章）
// =============================================================

const chapters = [
  {
    id: "redis-ch01",
    group: "第一部分 入门与基础",
    icon: "🟥",
    title: "第 1 章 Redis 简介与环境搭建",
    content: `# 第 1 章 Redis 简介与环境搭建

在正式敲下第一行 redis-cli 命令之前，我们先建立对 Redis 的全局认知：它是什么、为什么快、能用在哪些场景，以及如何在本机快速跑起来一个可用的实例。本章目标是让你 10 分钟内拥有一个能交互的 Redis 环境，并掌握连通性测试、配置查看、数据库切换与安全关停等基础运维操作。

## 1.1 什么是 Redis

**Redis**（Remote Dictionary Server，远程字典服务）是一个开源的、基于内存的、键值对（Key-Value）数据库。它由意大利人 Salvatore Sanfilippo（网名 antirez）于 2009 年开发，使用 ANSI C 编写，目前由 Redis Ltd. 维护。

> 一句话理解：**Redis 就是一个住在内存里的、超级快的"字典"，你可以往里面塞各种结构的数据，还能把它们持久化到磁盘。**

和传统关系型数据库（MySQL、PostgreSQL）相比，Redis 有三点本质不同：

- **数据在内存**：读写直接打内存，单机可达 10 万+ QPS。
- **数据结构丰富**：原生支持字符串、列表、哈希、集合、有序集合、流等。
- **单线程命令处理**（6.0 前核心命令单线程，6.0 后多线程 IO），避免锁竞争。

## 1.2 内存键值与单线程模型

Redis 的"快"主要来自两个设计决策：**数据驻留内存** 和 **单线程事件循环**。理解这一点，才能解释为什么 Redis 单线程还能吊打多线程数据库。

### 为什么用内存

磁盘随机访问延迟在毫秒级（HDD 约 10ms，SSD 约 0.1ms），而内存访问在纳秒级（约 100ns），差距高达 6 个数量级。Redis 把所有数据放内存，单次读写天然就是亚毫秒级。代价是内存昂贵，所以 Redis 适合放"热数据"而非全量数据。

### 为什么单线程还快

Redis 的"单线程"指**命令执行**在单线程串行进行（6.0 之前网络 IO 也在同一线程）。它快的原因有三：

| 原因 | 说明 |
| --- | --- |
| **纯内存操作** | 没有磁盘寻道，单条命令执行时间在微秒级 |
| **无锁无竞争** | 单线程串行，天然原子，省去加锁/上下文切换开销 |
| **IO 多路复用** | 基于 epoll/kqueue，单线程可处理数万并发连接 |

> **关键澄清**：单线程 ≠ 慢。当瓶颈是内存带宽而非 CPU 时，多线程反而因锁竞争变慢。Redis 把"快"建立在"避免等待"上，而非"堆 CPU"。

### 6.0 多线程 IO 的边界

Redis 6.0 引入多线程处理**网络读写**，但**命令执行仍单线程**。这意味着：

- 读写大 value（网络传输慢）时，多线程 IO 能显著提升吞吐。
- 命令执行的原子性、无锁特性完全保留。
- 默认关闭，需在配置中开启：\`io-threads 4\`。

> 结论：6.0 多线程是"锦上添花"，不改变 Redis 单线程命令模型的核心设计。

## 1.3 Redis 的特性与适用场景

### 核心特性

| 特性 | 说明 |
| --- | --- |
| **内存存储** | 数据驻留内存，访问延迟通常在亚毫秒级 |
| **丰富数据结构** | String / List / Hash / Set / ZSet / Stream / Bitmap / Geo / HyperLogLog |
| **持久化** | RDB 快照 + AOF 日志，重启数据不丢 |
| **主从复制** | 一主多从，读写分离 |
| **高可用** | Sentinel 哨兵自动故障转移 |
| **集群** | Redis Cluster 水平分片，支持 16384 个槽 |
| **Lua 脚本** | 原子执行多条命令 |
| **发布订阅** | 内置 Pub/Sub 消息模型 |
| **过期机制** | Key 可设 TTL，到期自动清理 |

### 适用场景

- **缓存**：热点数据、查询结果、页面片段（最常见用法）。
- **计数器**：文章阅读数、点赞数、库存扣减。
- **会话存储**：分布式 Session（Tomcat / Spring Session）。
- **排行榜**：ZSet 实时排序。
- **消息队列**：List 阻塞队列 / Stream。
- **限时活动**：短信验证码、秒杀、限流（TTL + INCR）。
- **地理位置**：附近的人、门店（Geo）。

> ⚠️ **不适用场景**：强关系型数据（多表 JOIN）、大 value 存储（单个 value 别超过 10MB）、对持久化绝对零丢失要求极高的金融核心账务（应配合关系库）。

## 1.4 数据结构总览

Redis 的 value 可以是下列结构之一，每种结构对应一组专用命令。本教程后续章节会逐一深入。

| 类型 | 中文名 | 典型用途 | 最大元素 |
| --- | --- | --- | --- |
| **String** | 字符串 | 缓存、计数器、锁 | 单值 512MB |
| **List** | 列表 | 队列、最新列表 | 2^32 - 1 |
| **Hash** | 哈希 | 对象存储 | 2^32 - 1 field |
| **Set** | 集合 | 标签、去重 | 2^32 - 1 |
| **ZSet** | 有序集合 | 排行榜、延迟队列 | 2^32 - 1 |
| **Stream** | 流 | 消息队列、日志 | 无上限 |
| **Bitmap** | 位图 | 签到、布隆过滤器 | 2^32 bit |
| **Geo** | 地理位置 | 附近的人 | 同 ZSet |
| **HyperLogLog** | 基数估算 | UV 统计 | 12KB 固定 |

> **类型不可混用**：同一个 key 在同一时刻只能是一种类型，对 String key 执行 LPUSH 会报 \`WRONGTYPE\` 错误。

## 1.5 Redis 版本演进

| 版本 | 发布年份 | 关键特性 |
| --- | --- | --- |
| 3.0 | 2015 | Redis Cluster 正式 GA |
| 4.0 | 2017 | 模块系统、混合持久化、PSYNC2 |
| 5.0 | 2018 | Stream 数据类型、RDB bgsave 优化 |
| 6.0 | 2020 | 多线程 IO、ACL 权限、客户端缓存 |
| 6.2 | 2021 | 大量命令优化、GEOSEARCH、SHUTDOWN WITH SAVE |
| 7.0 | 2022 | Functions（替代 EVAL）、多 PART AOF、Cluster 配置增强 |
| 7.2 | 2023 | Vector Similarity（向量检索）、性能优化 |

> **建议**：新项目直接用 **7.x** 稳定版；老项目至少升到 6.2，享受 GEOSEARCH 和多线程 IO 红利。本教程所有命令均在 7.x 验证通过。

## 1.6 安装与启动（Docker / macOS / Linux）

### 方式一：Docker（推荐，最快）

\`\`\`bash
# 拉取官方 7.x 镜像
docker pull redis:7.2

# 启动一个带密码、开启 AOF、映射 6379 端口的实例
docker run -d \\
  --name my-redis \\
  -p 6379:6379 \\
  -v redis-data:/data \\
  redis:7.2 \\
  redis-server --requirepass 123456 --appendonly yes

# 进入容器内交互
docker exec -it my-redis redis-cli -a 123456

# 查看容器日志
docker logs -f my-redis
\`\`\`

### 方式二：macOS（Homebrew）

\`\`\`bash
# 安装
brew install redis

# 前台启动（看日志方便）
redis-server /opt/homebrew/etc/redis.conf

# 或作为服务后台启动
brew services start redis

# 查看版本
redis-server --version

# 连接（默认无密码、6379）
redis-cli
\`\`\`

### 方式三：Linux（apt / 源码编译）

\`\`\`bash
# Ubuntu/Debian 用 apt 安装（版本可能略旧）
sudo apt-get update
sudo apt-get install -y redis-server

# 启动 / 停止 / 重启
sudo systemctl start redis-server
sudo systemctl status redis-server

# ---- 源码编译（拿最新版，推荐生产）----
# 安装编译依赖
sudo apt-get install -y build-essential tcl

# 下载源码（以 7.2.4 为例）
wget https://download.redis.io/releases/redis-7.2.4.tar.gz
tar xzf redis-7.2.4.tar.gz
cd redis-7.2.4

# 编译（make 会自动检测最优指令集）
make
make test    # 可选：跑测试，确认编译无误

# 安装到 /usr/local/bin
sudo make install

# 启动
redis-server --daemonize yes --port 6379
\`\`\`

> **Windows 注意**：Redis 官方不直接支持 Windows。开发可用 WSL2 跑 Linux 版，或用 Docker Desktop。Microsoft 维护的 memurai 是 Windows 上的 Redis 兼容替代品。

## 1.7 redis-cli 命令行工具

\`redis-cli\` 是 Redis 官方自带的交互式客户端，日常调试 90% 时间都在它里面。

\`\`\`bash
# 连接本机默认端口
redis-cli

# 连接远程 + 指定端口
redis-cli -h 192.168.1.10 -p 6380

# 带密码连接（两种写法）
redis-cli -a 123456
redis-cli            # 进去后用 AUTH 123456 认证

# 选择第 2 个数据库
redis-cli -n 2

# 执行单条命令后退出（脚本常用）
redis-cli -a 123456 SET hello world

# 测延迟（每秒发 1 个 PING）
redis-cli --latency

# 大数据量压测
redis-benchmark -q -n 100000 -c 50
\`\`\`

进入交互模式后常用技巧：

\`\`\`bash
127.0.0.1:6379> HELP SET          # 查看某命令帮助
127.0.0.1:6379> HELP @string      # 查看某命令组帮助
127.0.0.1:6379> KEYS *            # 列出所有 key（生产慎用！）
127.0.0.1:6379> SCAN 0            # 游标式遍历，推荐
127.0.0.1:6379> CLEAR             # 清屏
127.0.0.1:6379> EXIT              # 退出
\`\`\`

## 1.8 连通性测试 PING

\`PING\` 是检测 Redis 是否存活的最简单命令，类似网络的 ping。客户端 SDK 通常用它做健康检查。

\`\`\`bash
# 最常用：返回 PONG 表示服务正常
127.0.0.1:6379> PING
PONG

# 带消息的 PING，原样返回（调试用）
127.0.0.1:6379> PING "are you ok"
"are you ok"

# 需要认证但未 AUTH 时，PING 会返回错误
127.0.0.1:6379> PING
(error) NOAUTH Authentication required.
\`\`\`

> **排障套路**：连接异常时，第一步永远是 \`redis-cli ping\`。返回 PONG 说明网络通、服务在；返回 NOAUTH 说明密码没配对；返回其他错误再进一步排查。

## 1.9 CONFIG 配置查看与修改

\`CONFIG\` 命令让你在运行时查看和修改服务端配置，无需重启。这是线上调优、应急处理的核心工具。

### CONFIG GET：查看配置

\`\`\`bash
# 查看单个配置（支持通配符 *）
127.0.0.1:6379> CONFIG GET maxmemory
1) "maxmemory"
2) "0"

# 查看所有以 save 开头的配置
127.0.0.1:6379> CONFIG GET save*
1) "save"
2) "3600 1 300 100 60 10000"

# 查看全部配置（输出很长）
127.0.0.1:6379> CONFIG GET *
\`\`\`

### CONFIG SET：运行时修改

\`\`\`bash
# 设置最大内存为 256MB
127.0.0.1:6379> CONFIG SET maxmemory 256mb
OK

# 设置内存淘汰策略为 LRU
127.0.0.1:6379> CONFIG SET maxmemory-policy allkeys-lru
OK

# 临时关闭 RDB 快照（应急时常用）
127.0.0.1:6379> CONFIG SET save ""
OK
\`\`\`

> ⚠️ **CONFIG SET 是即时生效但不持久化**：重启后会回到配置文件的值。要让修改永久生效，配合 \`CONFIG REWRITE\` 写回配置文件。

### CONFIG REWRITE：写回配置文件

\`\`\`bash
# 把当前运行时配置覆写到 redis.conf（会保留注释和格式）
127.0.0.1:6379> CONFIG REWRITE
OK
\`\`\`

常用配置项速查：

| 配置项 | 含义 | 示例值 |
| --- | --- | --- |
| \`maxmemory\` | 最大内存 | \`512mb\` |
| \`maxmemory-policy\` | 淘汰策略 | \`allkeys-lru\` |
| \`save\` | RDB 触发条件 | \`3600 1 300 100\` |
| \`appendonly\` | 是否开启 AOF | \`yes\` |
| \`requirepass\` | 访问密码 | \`123456\` |
| \`timeout\` | 空闲连接超时（秒） | \`300\` |

## 1.10 SELECT 选择数据库

一个 Redis 实例默认有 **16 个数据库**（db0 ~ db15），由 \`databases 16\` 配置。不同库之间数据隔离。

\`\`\`bash
# 切到第 1 个库（默认在 db0）
127.0.0.1:6379> SELECT 1
OK
127.0.0.1:6379[1]> SET k db1
OK

# 切回 db0
127.0.0.1:6379[1]> SELECT 0
OK
127.0.0.1:6379> GET k
(nil)

# 把当前库的 key 移到别的库
127.0.0.1:6379> SET share data
OK
127.0.0.1:6379> MOVE share 1
(integer) 1
\`\`\`

> **生产建议**：实际上 Redis 多库很少用。原因：① 集群模式只支持 db0；② 多业务混用一个实例本就是反模式。**一个业务一个实例**才对。

## 1.11 SHUTDOWN 安全关停

\`SHUTDOWN\` 会优雅关闭 Redis：先做一次持久化，再退出进程。生产环境关停、升级前必用。

\`\`\`bash
# 关停并保存数据（等同于先 SAVE 再关）
127.0.0.1:6379> SHUTDOWN SAVE
# 连接断开，进程退出

# 关停但不保存数据（调试时丢弃脏数据）
127.0.0.1:6379> SHUTDOWN NOSAVE

# 仅关停，是否保存按配置决定（6.2+）
127.0.0.1:6379> SHUTDOWN
\`\`\`

> **重要**：不要用 \`kill -9\` 杀 Redis 进程！这会跳过持久化，可能丢失最近写入。正确做法是 \`redis-cli shutdown\` 或 \`kill\`（默认 SIGTERM 会触发优雅退出）。若服务无响应，先用 \`SHUTDOWN\`，实在不行才考虑强制手段。

\`\`\`bash
# 系统层面优雅关停（等价于 SHUTDOWN）
redis-cli shutdown
# 或
kill \$(cat /var/run/redis_6379.pid)
\`\`\`

## 1.12 第一个 key

万事俱备，开始你的第一个 key：

\`\`\`bash
# 写入一个字符串 key
127.0.0.1:6379> SET name "redis"
OK

# 读取
127.0.0.1:6379> GET name
"redis"

# 查看类型
127.0.0.1:6379> TYPE name
string

# 查看 key 是否存在（1 存在，0 不存在）
127.0.0.1:6379> EXISTS name
(integer) 1

# 设置 10 秒过期
127.0.0.1:6379> EXPIRE name 10
(integer) 1

# 看剩余秒数
127.0.0.1:6379> TTL name
(integer) 8

# 删除
127.0.0.1:6379> DEL name
(integer) 1
\`\`\`

> **第一个坑**：Redis 命令对大小写不敏感（SET 等价于 set），但 **key 和 value 严格区分大小写**。\`SET Name x\` 和 \`SET name x\` 是两个不同的 key。

## 1.13 踩坑提示

- **生产环境必须设密码**：默认无密码裸奔的 Redis 是勒索病毒重灾区（搜"Redis unauth ransom"）。
- **不要用 KEYS \***：在大库上会阻塞几秒甚至几十秒，导致请求堆积。用 \`SCAN\` 替代。
- **bind 不要写 0.0.0.0 又不设密码**：等于把数据库暴露在公网。
- **macOS Homebrew 装的版本可能落后**：用 \`brew info redis\` 看版本，必要时 \`brew install redis@7.2\`。
- **Docker 数据要挂卷**：不挂 \`-v redis-data:/data\`，容器删了数据就没了。
- **关停别用 kill -9**：用 \`redis-cli shutdown\` 优雅退出，避免丢数据。
- **CONFIG SET 不持久化**：改完记得 \`CONFIG REWRITE\` 写回文件，否则重启失效。

## 1.14 本章小结

- Redis 是基于内存的键值数据库，快、结构丰富、能持久化。
- **单线程模型**靠纯内存 + 无锁 + epoll 多路复用实现高吞吐；6.0 多线程仅优化网络 IO，命令仍串行。
- 适用场景以**缓存、计数器、会话、排行榜、消息队列**为主。
- 版本推荐 7.x，至少 6.2；新特性多在 6.0+ 引入。
- 三种安装方式中 Docker 最省事，源码编译可控性最强。
- \`redis-cli\` 是日常调试主力；\`PING\` 测连通，\`CONFIG GET/SET/REWRITE\` 管配置，\`SELECT\` 切库，\`SHUTDOWN\` 安全关停。
- 第一个 key 已经跑通：\`SET\` / \`GET\` / \`TYPE\` / \`EXPIRE\` / \`DEL\`。

下一章我们系统认识 Key-Value 模型与一批所有数据类型通用的"全局命令"。`
  },
  {
    id: "redis-ch02",
    group: "第一部分 入门与基础",
    icon: "🗂️",
    title: "第 2 章 数据模型与全局命令",
    content: `# 第 2 章 数据模型与全局命令

上一章我们让 Redis 跑了起来，并写下了第一个 key。这一章从"模型"出发，搞清楚 Redis 的 Key-Value 到底是什么、Key 该怎么设计才优雅，再掌握一批所有数据类型通用的全局命令，并深入理解 SCAN 游标与过期机制的工作原理。

## 2.1 Key-Value 模型

Redis 的全称是 **Remote Dictionary Server**——远程字典服务。它的数据模型就是一本"字典"：

- **Key**：字符串，唯一标识一条数据。
- **Value**：可以是 String / List / Hash / Set / ZSet / Stream 等多种结构。

> 类比 Java：\`Map<String, Object>\`，其中 Object 不是任意对象，而是 Redis 预定义的那几种结构。

注意 Redis **没有"表"概念**，所有 key 共享一个全局扁平命名空间。这带来两个直接后果：

1. Key 命名要自带"业务前缀"，避免冲突（如 \`user:1001\` 而不是 \`1001\`）。
2. 没有 schema，所有结构由 value 的类型决定，\`TYPE\` 命令可以查类型。

\`\`\`bash
# 同一个 key 不能同时是两种类型
127.0.0.1:6379> SET k1 hello
OK
127.0.0.1:6379> LPUSH k1 a b c
(error) WRONGTYPE Operation against a key holding the wrong kind of value
\`\`\`

## 2.2 数据类型总览

在深入命令前，先对 Redis 的九大数据类型建立全景认知。后续每章会逐一展开。

| 类型 | 中文名 | 底层结构 | 典型用途 |
| --- | --- | --- | --- |
| **String** | 字符串 | SDS（简单动态字符串） | 缓存、计数器、锁 |
| **List** | 列表 | quicklist（双向链表 + listpack） | 队列、最新列表 |
| **Hash** | 哈希 | listpack / hashtable | 对象存储 |
| **Set** | 集合 | intset / hashtable | 标签、去重、共同好友 |
| **ZSet** | 有序集合 | listpack / skiplist + hashtable | 排行榜、延迟队列 |
| **Stream** | 流 | radix tree | 消息队列、日志 |
| **Bitmap** | 位图 | String 上的位操作 | 签到、布隆过滤器 |
| **Geo** | 地理位置 | ZSet + GeoHash 编码 | 附近的人 |
| **HyperLogLog** | 基数估算 | 稀疏/稠密字符串 | UV 去重统计 |

> **类型选择口诀**：单个值用 String，对象用 Hash，有序排名用 ZSet，无序去重用 Set，消息流用 Stream，位运算用 Bitmap，地理位置用 Geo，海量去重用 HyperLogLog。

## 2.3 Key 的设计规范

好的 Key 设计能极大降低维护成本。社区约定的几条原则：

| 原则 | 示例 | 说明 |
| --- | --- | --- |
| **业务前缀 + 冒号分隔** | \`user:1001\` | 模拟"命名空间" |
| **多段拼接** | \`order:2024:1001:detail\` | 类似目录层级 |
| **避免过长** | 不超过 **44 字节**最理想 | 超出会占用更多内存 |
| **避免特殊字符** | 不用空格、换行、中文 | 兼容性更好 |
| **包含版本/环境** | \`v2:user:1001\` | 方便灰度切换 |

> **典型反例**：\`set "用户 1001 的资料" {...}\`——中文 key 看似直观，但编码混乱、监控难看、排查痛苦。

常用命名模板：

\`\`\`bash
# 对象
user:{id}
product:{id}

# 集合
user:{id}:followers       # 粉丝集合
product:{id}:tags         # 商品标签

# 计数器
article:{id}:views        # 阅读数
article:{id}:likes        # 点赞数

# 缓存
cache:api:/v1/users       # 接口缓存
session:{token}           # 会话

# 锁
lock:order:{id}           # 分布式锁
\`\`\`

## 2.4 全局命令：遍历类

下面这些命令对**所有数据类型**都生效，是日常高频操作。先看遍历类。

### KEYS：按模式匹配 key

\`\`\`bash
127.0.0.1:6379> MSET user:1 a user:2 b order:1 c
OK
127.0.0.1:6379> KEYS user:*
1) "user:1"
2) "user:2"
127.0.0.1:6379> KEYS *:1
1) "user:1"
2) "order:1"

# 通配符说明：
# *   匹配任意数量字符
# ?   匹配单个字符
# [ab] 匹配 a 或 b
\`\`\`

> ⚠️ **生产环境绝对禁用 KEYS**！它是 O(N) 全库扫描，会阻塞主线程。10 万 key 的库上执行可能卡顿数百毫秒，期间所有请求排队。

### SCAN：游标式遍历（重点）

\`SCAN\` 是 KEYS 的安全替代品。它把全库扫描拆成多次小扫描，每次返回一个**游标**，下次用该游标继续，直到游标为 0 表示遍历结束。

\`\`\`bash
# 语法：SCAN cursor [MATCH pattern] [COUNT count] [TYPE type]
127.0.0.1:6379> SCAN 0 MATCH user:* COUNT 100
1) "168"           # 下一轮游标，0 表示遍历结束
2) 1) "user:1"
   2) "user:2"

# 用下一轮游标继续
127.0.0.1:6379> SCAN 168 MATCH user:* COUNT 100
1) "0"
2) 1) "user:3"
\`\`\`

**SCAN 的工作原理与三大保证**：

| 特性 | 说明 |
| --- | --- |
| **不阻塞** | 每次只扫一小片哈希桶，耗时极短，不卡主线程 |
| **可中断** | 客户端随时可停止，服务端不维持任何状态 |
| **弱保证** | 可能重复返回某个 key，但保证遍历期间**始终存在**的 key 一定被返回 |

> **关键理解**：SCAN 的游标不是"偏移量"，而是哈希桶的索引。COUNT 只是"建议"返回数量，实际可能多可能少。所以业务侧**必须自行去重**。

### SCAN 家族

针对不同数据类型，SCAN 有专门变体：

\`\`\`bash
# 遍历大 Hash 的 field
127.0.0.1:6379> HSCAN big:hash 0 COUNT 100

# 遍历大 Set 的元素
127.0.0.1:6379> SSCAN big:set 0 MATCH tag:* COUNT 100

# 遍历大 ZSet 的元素
127.0.0.1:6379> ZSCAN big:zset 0 COUNT 100
\`\`\`

### DBSIZE：当前库 key 总数

\`\`\`bash
127.0.0.1:6379> DBSIZE
(integer) 3
\`\`\`

> \`DBSIZE\` 是 O(1) 的（Redis 内部维护计数器），可以放心在线上调用，不像 KEYS 会扫描。

## 2.5 全局命令：信息类

### EXISTS：判断 key 是否存在

\`\`\`bash
127.0.0.1:6379> EXISTS user:1
(integer) 1
127.0.0.1:6379> EXISTS user:999
(integer) 0
# 可同时查多个，返回存在的个数
127.0.0.1:6379> EXISTS user:1 user:2 user:999
(integer) 2
\`\`\`

### TYPE：查看 value 类型

\`\`\`bash
127.0.0.1:6379> SET s1 hello
OK
127.0.0.1:6379> TYPE s1
string
127.0.0.1:6379> LPUSH l1 a b
(integer) 2
127.0.0.1:6379> TYPE l1
list
127.0.0.1:6379> TYPE not_exist
none
\`\`\`

### OBJECT ENCODING：查看底层编码

Redis 对每种类型有多种底层编码，会根据数据规模自动切换以平衡内存与性能。

\`\`\`bash
127.0.0.1:6379> SET num 12345
OK
127.0.0.1:6379> OBJECT ENCODING num
"int"

127.0.0.1:6379> SET shortstr "hi"
OK
127.0.0.1:6379> OBJECT ENCODING shortstr
"embstr"

127.0.0.1:6379> SET longstr "aaaaaaaaaaaa...（超过 44 字节）"
OK
127.0.0.1:6379> OBJECT ENCODING longstr
"raw"
\`\`\`

> 编码细节会在后续各类型章节展开，这里先建立"同一类型有多种编码"的认知。

## 2.6 全局命令：管理类

### DEL：删除（同步，阻塞）

\`\`\`bash
127.0.0.1:6379> DEL user:1 user:2
(integer) 2
\`\`\`

> 删大 key（如百万元素的 List）会阻塞主线程。改用 \`UNLINK\`，它把回收放到后台线程异步执行。

\`\`\`bash
127.0.0.1:6379> UNLINK order:1
(integer) 1
\`\`\`

### RENAME / RENAMENX：重命名

\`\`\`bash
127.0.0.1:6379> RENAME user:1 user:01
OK
127.0.0.1:6379> RENAMENX user:01 user:02   # 仅当目标不存在时才改
(integer) 1
\`\`\`

> ⚠️ **RENAME 会覆盖目标 key**：如果 \`user:02\` 已存在，\`RENAME user:01 user:02\` 会直接覆盖，不会报错。用 \`RENAMENX\` 才安全。

### RANDOMKEY：随机返回一个 key

\`\`\`bash
127.0.0.1:6379> RANDOMKEY
"user:2"
\`\`\`

## 2.7 过期时间 TTL

给 key 设过期是 Redis 的核心能力之一，缓存、验证码、限流都靠它。

### 设置过期的几种方式

\`\`\`bash
# EXPIRE：秒级
127.0.0.1:6379> SET token abc
OK
127.0.0.1:6379> EXPIRE token 60
(integer) 1

# PEXPIRE：毫秒级
127.0.0.1:6379> PEXPIRE token 60000
(integer) 1

# EXPIREAT：到某个 UNIX 时间戳（秒）过期
127.0.0.1:6379> EXPIREAT token 1735689600
(integer) 1

# PEXPIREAT：到某个 UNIX 时间戳（毫秒）过期
127.0.0.1:6379> PEXPIREAT token 1735689600000
(integer) 1

# SET 时直接带过期（推荐，原子）
127.0.0.1:6379> SET token abc EX 60
OK
\`\`\`

### 查看与取消

\`\`\`bash
# TTL：剩余秒数（-1 永久，-2 已不存在/已过期）
127.0.0.1:6379> TTL token
(integer) 58

# PTTL：剩余毫秒
127.0.0.1:6379> PTTL token
(integer) 58234

# PERSIST：取消过期，变永久
127.0.0.1:6379> PERSIST token
(integer) 1
127.0.0.1:6379> TTL token
(integer) -1
\`\`\`

> **关键点**：对一个已有 TTL 的 key 再次 \`SET\`（不带 EX），新值会**变成永久**。用 \`SET key val KEEPTTL\` 可保留旧 TTL（Redis 6.0+）。

| TTL 返回值 | 含义 |
| --- | --- |
| -2 | key 不存在（已过期或被删） |
| -1 | key 存在但无过期时间 |
| 正数 | 剩余秒/毫秒数 |

### 过期机制：惰性 + 定期删除

Redis 的过期不是到点立刻删除，而是**两种策略结合**：

1. **惰性删除**：访问 key 时才检查是否过期，过期则删。优点精确，缺点冷数据永不访问会占内存。
2. **定期删除**：每秒 10 次从设了过期的 key 中随机抽样检查，删除已过期的。若过期比例超 25%，立即再抽一轮。

> 这意味着：设了 TTL 的 key **可能"到期"后仍占内存一段时间**，直到被访问或被定期删除扫到。不要依赖"精确到期立即消失"。

## 2.8 数据库选择（SELECT）

\`\`\`bash
# 切到第 1 个库
127.0.0.1:6379> SELECT 1
OK
127.0.0.1:6379[1]> SET k db1
OK

# 清空当前库（小心！）
127.0.0.1:6379> FLUSHDB
OK

# 清空所有库（极度危险！）
127.0.0.1:6379> FLUSHALL
OK

# 异步清空（不阻塞，4.0+）
127.0.0.1:6379> FLUSHDB ASYNC
\`\`\`

> **生产建议**：实际上 Redis 多库很少用。原因：① 集群模式只支持 db0；② 多业务混用一个实例本就是反模式。**一个业务一个实例**才对。

## 2.9 踩坑提示

- **KEYS 阻塞**：哪怕只有几万个 key，线上也禁用，养成肌肉记忆用 SCAN。
- **DEL 大 key 阻塞**：列表/集合/哈希元素过万时，务必 \`UNLINK\`。
- **过期时间被覆盖**：更新缓存时忘了带 \`EX\`，导致数据永驻，内存被吃光。
- **FLUSHALL 误操作**：没有回滚，建议在配置里 \`rename-command FLUSHALL ""\` 屏蔽。
- **TTL -1 vs -2**：很多新人误以为 -1 是"已过期"，其实是"永久"。已过期是 -2。
- **SELECT 在 Cluster 失效**：Redis Cluster 强制 db0，迁移时要提前规划。
- **SCAN 可能重复**：业务侧必须去重，别假设每个 key 只返回一次。
- **RENAME 覆盖目标**：目标 key 已存在会被静默覆盖，用 RENAMENX 更安全。

## 2.10 本章小结

- Redis 数据模型是扁平的 Key-Value，无表无 schema，靠 Key 前缀做隔离。
- 九大数据类型各有定位：String/Hash/List/Set/ZSet/Stream/Bitmap/Geo/HyperLogLog，后续逐章深入。
- Key 设计遵循"业务:实体:ID"三段式，控制长度、避免特殊字符。
- 全局命令分三类：**遍历类**（KEYS/SCAN/DBSIZE）、**信息类**（EXISTS/TYPE/OBJECT ENCODING）、**管理类**（DEL/UNLINK/RENAME/EXPIRE）。
- **SCAN 是 KEYS 的安全替代**：游标式、不阻塞、需去重，理解"游标=哈希桶索引"是关键。
- TTL 体系：\`EXPIRE/PEXPIRE/EXPIREAT\` 设过期，\`TTL/PTTL\` 查，\`PERSIST\` 取消；过期靠惰性+定期删除结合。
- 多库 SELECT 仅单机模式可用，生产应一业务一实例。

掌握了通用命令，接下来逐个击破数据结构。下一章从最基础也最常用的 **String 字符串** 开始。`
  },
  {
    id: "redis-ch03",
    group: "第一部分 入门与基础",
    icon: "📝",
    title: "第 3 章 String 字符串",
    content: `# 第 3 章 String 字符串

String 是 Redis 中最基础、使用频率最高的数据类型。一个 String 类型的 value 最多能存 **512MB**，可以放普通字符串、JSON、数字、甚至二进制（图片、序列化对象）。本章覆盖 String 全部常用命令、底层编码机制与典型应用。

## 3.1 SET / GET / DEL

\`\`\`bash
# 基本写入
127.0.0.1:6379> SET greeting "hello redis"
OK

# 读取
127.0.0.1:6379> GET greeting
"hello redis"

# 删除
127.0.0.1:6379> DEL greeting
(integer) 1
127.0.0.1:6379> GET greeting
(nil)
\`\`\`

### SET 的高级选项（重要）

Redis 2.6.8 起，\`SET\` 支持一系列选项，**一个命令搞定"判断+写入+过期"**，避免多命令的竞态：

| 选项 | 含义 |
| --- | --- |
| \`EX seconds\` | 设置过期秒数 |
| \`PX milliseconds\` | 设置过期毫秒数 |
| \`EXAT timestamp\` | 设置过期 UNIX 时间戳（秒） |
| \`PXAT timestamp-ms\` | 设置过期 UNIX 时间戳（毫秒） |
| \`NX\` | 仅当 key **不存在**时才设置 |
| \`XX\` | 仅当 key **已存在**时才设置 |
| \`KEEPTTL\` | 保留原有 TTL（6.0+） |
| \`GET\` | 设置新值并返回旧值（6.2+） |

\`\`\`bash
# 仅当不存在时设置（分布式锁基础）
127.0.0.1:6379> SET lock:order:1 "owner-A" NX EX 30
OK
127.0.0.1:6379> SET lock:order:1 "owner-B" NX EX 30
(nil)

# 仅当存在时更新，并保留原 TTL
127.0.0.1:6379> SET lock:order:1 "owner-C" XX KEEPTTL
OK

# 设置新值并拿回旧值
127.0.0.1:6379> SET greeting "new" GET
"hello redis"
\`\`\`

> **为什么 SET NX EX 比先 SETNX 再 EXPIRE 好？** 因为后者是两条命令，中间宕机会导致锁永不释放。原子命令才安全。

## 3.2 SETNX / SETEX / PSETEX

这三个是早期提供的"语义化"命令，现在大多可被 \`SET\` 的选项替代，但旧代码中常见，需认识。

\`\`\`bash
# SETNX：仅当 key 不存在时设置（返回 1 成功，0 失败）
127.0.0.1:6379> SETNX lock 1
(integer) 1
127.0.0.1:6379> SETNX lock 2
(integer) 0
127.0.0.1:6379> GET lock
"1"

# SETEX：设置并指定秒级过期（key 秒 value）
127.0.0.1:6379> SETEX code:phone 60 "123456"
OK
127.0.0.1:6379> TTL code:phone
(integer) 58

# PSETEX：设置并指定毫秒级过期（验证码、高频限时常用）
127.0.0.1:6379> PSETEX code:sms 300000 "654321"
OK
127.0.0.1:6379> PTTL code:sms
(integer) 298734
\`\`\`

> **推荐写法**：新代码统一用 \`SET key value NX EX 60\`，一条命令搞定，无需记三个独立命令。\`SETEX\`/\`PSETEX\` 在未来版本可能被弃用。

## 3.3 INCR / DECR / INCRBY

Redis 的 String 可以存**整数**，并对它做原子自增/自减。这是关系型数据库很难做到的高性能计数。

\`\`\`bash
127.0.0.1:6379> SET counter 10
OK

# +1
127.0.0.1:6379> INCR counter
(integer) 11

# -1
127.0.0.1:6379> DECR counter
(integer) 10

# +5
127.0.0.1:6379> INCRBY counter 5
(integer) 15

# -3
127.0.0.1:6379> DECRBY counter 3
(integer) 12

# 浮点数自增（注意：DECRBYFLOAT 不存在，用负数）
127.0.0.1:6379> SET price 9.9
OK
127.0.0.1:6379> INCRBYFLOAT price 0.1
"10"
127.0.0.1:6379> INCRBYFLOAT price -0.5
"9.5"
\`\`\`

> **原子性来源**：Redis 命令单线程串行执行，INCR 天然原子，**无需任何锁**。1 万并发同时点赞，最终结果依然正确。

非整数会报错：

\`\`\`bash
127.0.0.1:6379> SET s "abc"
OK
127.0.0.1:6379> INCR s
(error) ERR value is not an integer or out of range
\`\`\`

> **INCR 的妙用**：对不存在的 key 执行 \`INCR\`，会先初始化为 0 再 +1，返回 1。所以"计数器"场景无需先 SET。

## 3.4 APPEND / STRLEN

\`\`\`bash
127.0.0.1:6379> SET msg "hello"
OK
127.0.0.1:6379> APPEND msg " world"
(integer) 11
127.0.0.1:6379> GET msg
"hello world"

# 字符串长度（字节）
127.0.0.1:6379> STRLEN msg
(integer) 11

# 注意：中文是 UTF-8，1 字 = 3 字节
127.0.0.1:6379> SET zh "你好"
OK
127.0.0.1:6379> STRLEN zh
(integer) 6
\`\`\`

## 3.5 GETRANGE / SETRANGE：子串操作

\`\`\`bash
# 截取 [start, end] 闭区间
127.0.0.1:6379> GETRANGE msg 0 4
"hello"
127.0.0.1:6379> GETRANGE msg 6 -1
"world"

# 从 offset 处覆写
127.0.0.1:6379> SETRANGE msg 6 "redis"
(integer) 11
127.0.0.1:6379> GET msg
"hello redis"

# SETRANGE 到超出长度的位置，中间会用 \\x00 填充
127.0.0.1:6379> SETRANGE msg 20 "x"
(integer) 21
\`\`\`

> **GETRANGE 是 O(N)**：会复制子串，对超大 String（如 MB 级）有性能影响。线上避免对大 value 频繁 GETRANGE。

## 3.6 MSET / MGET 批量操作

每条命令都是一次网络往返。批量命令把多次合并成一次，能显著降低延迟。

\`\`\`bash
# 一次写多个
127.0.0.1:6379> MSET k1 v1 k2 v2 k3 v3
OK

# 一次读多个
127.0.0.1:6379> MGET k1 k2 k3 k4
1) "v1"
2) "v2"
3) "v3"
4) (nil)        # 不存在的返回 nil

# MSETNX：仅当所有 key 都不存在时才设置（全成功或全失败）
127.0.0.1:6379> MSETNX k4 v4 k5 v5
(integer) 1
127.0.0.1:6379> MSETNX k4 v4 k6 v6   # k4 已存在，整体失败
(integer) 0
\`\`\`

> **性能对比**：在 1ms 网络延迟下，写 1000 个 key——单条 SET 需要 1s，MSET 理论 1ms，差距 1000 倍。批量是 Redis 性能优化的第一课。

## 3.7 GETSET（已弃用，用 SET ... GET）

\`\`\`bash
# 旧写法
127.0.0.1:6379> GETSET k1 newv
"v1"

# 新写法（6.2+）
127.0.0.1:6379> SET k1 newv2 GET
"newv"
\`\`\`

> \`GETSET\` 在 6.2 起被标记为 deprecated，新代码用 \`SET key value GET\` 替代。

## 3.8 对象编码：int / embstr / raw

String 类型在 Redis 内部有三种底层编码，会根据 value 的内容自动选择。理解编码有助于排查内存占用异常。

### 三种编码对比

| 编码 | 触发条件 | 内存布局 | 特点 |
| --- | --- | --- | --- |
| **int** | value 是整数且 ≤ long 范围 | 直接存指针位置 | 最省内存（8 字节） |
| **embstr** | 字符串 ≤ 44 字节 | SDS 与对象头连续内存，一次分配 | 分配/释放快，只读 |
| **raw** | 字符串 > 44 字节 | SDS 与对象头分离，两次分配 | 适合长字符串 |

\`\`\`bash
# 整数 -> int
127.0.0.1:6379> SET n1 12345
OK
127.0.0.1:6379> OBJECT ENCODING n1
"int"

# 短字符串 -> embstr
127.0.0.1:6379> SET n2 "hello"
OK
127.0.0.1:6379> OBJECT ENCODING n2
"embstr"

# 长字符串（>44 字节）-> raw
127.0.0.1:6379> SET n3 "0123456789012345678901234567890123456789012345"
OK
127.0.0.1:6379> OBJECT ENCODING n3
"raw"
\`\`\`

### 编码转换的坑

\`\`\`bash
# embstr 是只读的：任何修改都会先转 raw 再操作
127.0.0.1:6379> SET s "hello"
OK
127.0.0.1:6379> OBJECT ENCODING s
"embstr"
127.0.0.1:6379> APPEND s "!"
(integer) 6
127.0.0.1:6379> OBJECT ENCODING s    # 变成 raw 了
"raw"

# int 编码的数字做 INCR 后仍是 int
127.0.0.1:6379> SET c 100
OK
127.0.0.1:6379> OBJECT ENCODING c
"int"
127.0.0.1:6379> INCR c
(integer) 101
127.0.0.1:6379> OBJECT ENCODING c
"int"
\`\`\`

> **44 字节阈值的由来**：Redis 的内存分配器 jemalloc 的内存块最小 64 字节，扣除对象头（16 字节）+ SDS 头（3 字节）+ 结尾 \\0（1 字节）后，正好剩 44 字节放数据。所以 ≤44 字节能塞进一个内存块，无需二次分配。

## 3.9 应用场景：计数器 / 缓存 / 会话 / 分布式锁

### 场景一：点赞计数器

\`\`\`bash
# 文章 1001 被点赞
127.0.0.1:6379> INCR article:1001:likes
(integer) 1
127.0.0.1:6379> INCRBY article:1001:likes 5
(integer) 6

# 取消点赞
127.0.0.1:6379> DECR article:1001:likes
(integer) 5
\`\`\`

### 场景二：对象缓存（JSON 字符串）

\`\`\`bash
# 把用户对象序列化成 JSON 存入
127.0.0.1:6379> SET user:1001 '{"id":1001,"name":"Alice","age":28}'
OK

# 读出
127.0.0.1:6379> GET user:1001
"{\\"id\\":1001,\\"name\\":\\"Alice\\",\\"age\\":28}"

# 缓存 30 分钟
127.0.0.1:6379> SET user:1001 '{"id":1001,"name":"Alice"}' EX 1800
OK
\`\`\`

> **何时用 String 存对象，何时用 Hash？** 整体读多写少用 String（一次 GET 拿全部）；需要单字段更新用 Hash（避免每次反序列化整个对象）。

### 场景三：会话存储（Session）

\`\`\`bash
# 登录后生成 token，存 30 分钟会话
127.0.0.1:6379> SET session:token-abc-123 '{"uid":1001,"role":"admin"}' EX 1800
OK

# 每次请求校验：GET + TTL
127.0.0.1:6379> GET session:token-abc-123
"{\\"uid\\":1001,...}"
127.0.0.1:6379> TTL session:token-abc-123
(integer) 1567

# 续期（用户活跃时延长）
127.0.0.1:6379> EXPIRE session:token-abc-123 1800
(integer) 1

# 登出：主动删除
127.0.0.1:6379> DEL session:token-abc-123
(integer) 1
\`\`\`

### 场景四：简易分布式锁

\`\`\`bash
# 加锁：value 用唯一标识（UUID），方便判断归属
127.0.0.1:6379> SET lock:order:1001 "uuid-aaa" NX EX 10
OK

# 业务执行...

# 解锁前先判断 value 是否是自己（避免误删别人的锁）
# 必须用 Lua 脚本保证"判断+删除"原子
127.0.0.1:6379> EVAL "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end" 1 lock:order:1001 "uuid-aaa"
(integer) 1
\`\`\`

> **注意**：这是"简易版"分布式锁，存在以下缺陷，生产环境建议用 **Redisson** 或 **Redlock**：
> - 锁过期但业务未完成（看门狗续期）。
> - 主从切换丢失锁（多节点 Redlock）。

### 场景五：限流器（INCR + EXPIRE）

\`\`\`bash
# 每分钟限制 100 次请求
# 1. INCR rate_limit:user:1001:202401011200  -> 拿到当前次数
# 2. 若结果 == 1，EXPIRE 设 60 秒
# 3. 若结果 > 100，拒绝请求

127.0.0.1:6379> INCR rate_limit:user:1001:202401011200
(integer) 1
127.0.0.1:6379> EXPIRE rate_limit:user:1001:202401011200 60
(integer) 1
\`\`\`

## 3.10 踩坑提示

- **大 key 隐患**：单个 String 别超 10KB，否则网络传输和持久化都会受拖累。大对象拆成 Hash 或分片。
- **SET 覆盖 TTL**：\`SET k v\` 不带 EX 会清掉旧 TTL，更新缓存务必带 \`KEEPTTL\` 或重新设过期。
- **INCR 溢出**：Redis 整数是 64 位有符号，最大 \`9223372036854775807\`，超了报错。
- **浮点精度**：\`INCRBYFLOAT\` 用 double，累加会有精度损失，金额场景慎用。
- **分布式锁别用 SETNX + EXPIRE**：两步非原子，必须 \`SET NX EX\` 一条命令。
- **MGET 不存在的 key 返回 nil**：业务侧要判空，别直接当字符串用。
- **embstr 修改即转 raw**：对短字符串频繁 APPEND 会让编码退化，内存占用增加。
- **STRLEN 算字节不是字符数**：中文 UTF-8 一个字占 3 字节，按字符统计要自己算。

## 3.11 本章小结

- String 是万能容器：文本、JSON、数字、二进制都能放，最大 512MB。
- \`SET\` 的 EX/PX/NX/XX/KEEPTTL/GET 选项让一条命令完成"判存在+写+过期+取旧值"。
- \`SETEX\`/\`PSETEX\`/\`GETSET\` 已逐步被 \`SET\` 选项取代，新代码用 \`SET\` 统一写法。
- \`INCR/DECR/INCRBY\` 原子计数，是计数器、库存、限流的核心。
- \`MSET/MGET\` 批量操作降低网络往返，性能优化第一手段。
- **三种编码**：int（整数）、embstr（≤44 字节，连续内存）、raw（长字符串，分离内存）；理解编码能排查内存问题。
- 典型应用：**对象缓存、计数器、会话、分布式锁、限流**。
- 分布式锁务必 \`SET NX EX\` + UUID + Lua 解锁，生产用 Redisson。

下一章学习第一个**集合类型——List 列表**，看 Redis 如何充当轻量级消息队列。`
  },
  {
    id: "redis-ch04",
    group: "第一部分 入门与基础",
    icon: "📋",
    title: "第 4 章 List 列表",
    content: `# 第 4 章 List 列表

List 是 Redis 的双向链表结构，按插入顺序排列，支持两端推入/弹出。它能当栈、队列、有限集合用，是构建"最新 N 条"、"轻量消息队列"的利器。本章覆盖 List 全部常用命令、阻塞操作、LMOVE 迁移以及底层编码机制。

## 4.1 LPUSH / RPUSH / LRANGE

\`\`\`bash
# 从左端（头部）插入
127.0.0.1:6379> LPUSH list1 a b c
(integer) 3
# 注意：LPUSH 多个值是"依次往左塞"，最终顺序 c b a

# 从右端（尾部）插入
127.0.0.1:6379> RPUSH list1 x y z
(integer) 6

# 查看 [start, stop]，闭区间，0 开始，-1 表示末尾
127.0.0.1:6379> LRANGE list1 0 -1
1) "c"
2) "b"
3) "a"
4) "x"
5) "y"
6) "z"

# 看前 3 个
127.0.0.1:6379> LRANGE list1 0 2
1) "c"
2) "b"
3) "a"
\`\`\`

> **方向记忆法**：LPUSH 像往左"压栈"，新元素总在最左；RPUSH 往右"追加"，新元素总在最右。LRANGE 永远从左到右读。

## 4.2 LPOP / RPOP

\`\`\`bash
# 从左端弹出
127.0.0.1:6379> LPOP list1
"c"
127.0.0.1:6379> LPOP list1
"b"

# 从右端弹出
127.0.0.1:6379> RPOP list1
"z"

# 弹出多个（6.2+）
127.0.0.1:6379> LPOP list1 2
1) "a"
2) "x"

# 列表空时返回 nil（6.2+ 可选 count 后返回空数组）
127.0.0.1:6379> LPOP list1
(nil)
\`\`\`

### 经典组合

- **栈（LIFO）**：LPUSH + LPOP（或 RPUSH + RPOP），同端进出。
- **队列（FIFO）**：LPUSH + RPOP（或 RPUSH + LPOP），异端进出。

\`\`\`bash
# 队列：生产者从左塞，消费者从右取
127.0.0.1:6379> LPUSH mq msg1
(integer) 1
127.0.0.1:6379> LPUSH mq msg2
(integer) 2
127.0.0.1:6379> RPOP mq
"msg1"
127.0.0.1:6379> RPOP mq
"msg2"
\`\`\`

## 4.3 LLEN / LINDEX / LSET

\`\`\`bash
127.0.0.1:6379> RPUSH todo "buy milk" "pay bill" "walk dog"
(integer) 3

# 长度
127.0.0.1:6379> LLEN todo
(integer) 3

# 按下标取（0 开始，支持负数，-1 末尾）
127.0.0.1:6379> LINDEX todo 0
"buy milk"
127.0.0.1:6379> LINDEX todo -1
"walk dog"

# 修改指定下标的元素
127.0.0.1:6379> LSET todo 1 "pay electricity bill"
OK
127.0.0.1:6379> LRANGE todo 0 -1
1) "buy milk"
2) "pay electricity bill"
3) "walk dog"
\`\`\`

### LINSERT：在某个元素前后插入

\`\`\`bash
# 在 "buy milk" 之后插入 "call mom"
127.0.0.1:6379> LINSERT todo AFTER "buy milk" "call mom"
(integer) 4
# 在 "walk dog" 之前插入 "feed cat"
127.0.0.1:6379> LINSERT todo BEFORE "walk dog" "feed cat"
(integer) 5
127.0.0.1:6379> LRANGE todo 0 -1
1) "buy milk"
2) "call mom"
3) "pay electricity bill"
4) "feed cat"
5) "walk dog"

# pivot 不存在时返回 -1
127.0.0.1:6379> LINSERT todo BEFORE "nope" "x"
(integer) -1
\`\`\`

### LREM：删除指定元素

\`\`\`bash
# LREM key count value
# count > 0：从左往右删 count 个
# count < 0：从右往左删 |count| 个
# count = 0：删全部

127.0.0.1:6379> RPUSH nums 1 2 3 2 1 2
(integer) 6
127.0.0.1:6379> LREM nums 2 2     # 从左删 2 个等于 2 的
(integer) 2
127.0.0.1:6379> LRANGE nums 0 -1
1) "1"
2) "3"
3) "1"
4) "2"
\`\`\`

### LTRIM：保留区间，其余删除

\`\`\`bash
# 只保留最新的 100 条（常用于"最新列表"）
127.0.0.1:6379> LTRIM latest 0 99
OK

# LTRIM 也可做"两端裁剪"：保留 [1, -2] 去掉首尾
127.0.0.1:6379> RPUSH t a b c d e
(integer) 5
127.0.0.1:6379> LTRIM t 1 -2
OK
127.0.0.1:6379> LRANGE t 0 -1
1) "b"
2) "c"
3) "d"
\`\`\`

## 4.4 LRANGE 与分页

LRANGE 天然支持分页，公式：

\`\`\`bash
# 第 page 页（0 开始），每页 size 条
# start = page * size
# stop  = (page + 1) * size - 1

# 例：每页 10 条，取第 3 页（下标 30~39）
127.0.0.1:6379> LRANGE articles 30 39
\`\`\`

> **大列表分页陷阱**：LRANGE 在 List 中部是 O(N)，列表越长越慢。深度分页（如第 1000 页）建议改用 ZSet 或独立分页表。

## 4.5 LMOVE（6.2+）

\`LMOVE\` 把元素从一个列表"原子地"弹入另一个列表，是构建可靠队列、栈迁移的关键命令。它替代了已废弃的 \`RPOPLPUSH\`。

\`\`\`bash
# 语法：LMOVE source destination FROM LEFT|RIGHT TO LEFT|RIGHT
# 从 list1 左端弹出，从右端压入 list2
127.0.0.1:6379> RPUSH list1 a b c
(integer) 3
127.0.0.1:6379> LMOVE list1 list2 LEFT RIGHT
"a"
127.0.0.1:6379> LRANGE list1 0 -1
1) "b"
2) "c"
127.0.0.1:6379> LRANGE list2 0 -1
1) "a"

# source 和 dest 可以是同一个 key（实现循环队列/旋转）
127.0.0.1:6379> LMOVE list1 list1 LEFT RIGHT
"b"
# 把头元素搬到尾部，相当于"轮转"
\`\`\`

**LMOVE 的方向组合**：

| FROM | TO | 效果 |
| --- | --- | --- |
| LEFT | RIGHT | 头弹出 → 尾插入（FIFO 队列迁移） |
| LEFT | LEFT | 头弹出 → 头插入（栈复制） |
| RIGHT | LEFT | 尾弹出 → 头插入（反向 FIFO） |
| RIGHT | RIGHT | 尾弹出 → 尾插入（栈复制） |

### BLMOVE：阻塞版

\`\`\`bash
# source 为空时阻塞等待，最多 30 秒
127.0.0.1:6379> BLMOVE source dest LEFT RIGHT 30
\`\`\`

> **可靠队列模式**：生产者 LPUSH 到 \`processing\`，消费者用 \`LMOVE processing done LEFT RIGHT\` 取出处理。若处理中崩溃，元素在 \`processing\` 不丢，重启后可重试。这是 LMOVE 相比 RPOP 的最大价值。

## 4.6 BLPOP / BRPOP 阻塞操作

普通 LPOP 在列表为空时立即返回 nil。如果想"列表一有数据就立刻消费"，用阻塞版本：

\`\`\`bash
# 阻塞最多 30 秒等待 list1 有元素
# 语法：BLPOP key [key...] timeout（秒）
127.0.0.1:6379> BLPOP list1 30
1) "list1"      # 弹出的 key
2) "value"      # 弹出的值
(58.93s)        # 等待时长
\`\`\`

特点：
- **多消费者**：多个客户端阻塞时，元素到达后**先到先得**，天然负载均衡。
- **多 key**：可同时阻塞多个 key，按顺序检查，哪个先有元素就消费哪个。
- **超时 0**：永久阻塞（慎用，连接会被长期占用）。

\`\`\`bash
# 同时等待 mq1、mq2，无限等待
127.0.0.1:6379> BLPOP mq1 mq2 0
\`\`\`

> **轮询 vs 阻塞**：用 LPOP + sleep 轮询既浪费 CPU 又有延迟；BLPOP 让 Redis 在有数据时才唤醒，是最优解。

## 4.7 底层编码：ziplist / listpack vs quicklist

List 的底层编码经历过重要演进，理解它有助于内存调优。

### 编码演进

| 版本 | 短列表编码 | 长列表编码 | 说明 |
| --- | --- | --- | --- |
| 7.0 前 | ziplist | quicklist（双向链表，节点是 ziplist） | ziplist 连续内存，省空间 |
| 7.0+ | listpack | quicklist（节点是 listpack） | listpack 修复了 ziplist 的连锁更新问题 |

### 两种编码对比

| 维度 | listpack（短列表） | quicklist（长列表） |
| --- | --- | --- |
| **结构** | 连续内存块 | 双向链表，每个节点是一个 listpack |
| **内存** | 极省（无指针开销） | 略多（有前后指针） |
| **随机访问** | O(N) | O(N)（但可跳节点） |
| **两端操作** | O(1) | O(1) |
| **触发转换** | 元素少且小 | 元素多或单元素超阈值 |

\`\`\`bash
# 短列表 -> listpack（7.0+）
127.0.0.1:6379> RPUSH shortlist a b c
(integer) 3
127.0.0.1:6379> OBJECT ENCODING shortlist
"listpack"

# 长列表（元素多或单元素大）-> quicklist
127.0.0.1:6379> RPUSH longlist a b c d e f g h i j k l m n o p q r s t u v w x y z
(integer) 26
127.0.0.1:6379> OBJECT ENCODING longlist
"quicklist"
\`\`\`

### 调优配置

\`\`\`bash
# 每个 quicklist 节点上的 listpack 最大元素数（默认 128）
127.0.0.1:6379> CONFIG SET list-max-listpack-size 128

# listpack 元素数阈值（默认 128），超过转 quicklist
# 单元素大小超过 64 字节也会转
\`\`\`

> **什么是 ziplist 的"连锁更新"**：ziplist 每个元素存了前一元素的长度，若前一元素从大变小，后续所有元素的长度字段都可能需要更新，最坏 O(N²)。listpack 通过让每个元素只记自身长度解决了这个问题。这是 7.0 改用 listpack 的核心原因。

## 4.8 应用场景：消息队列 / 最新列表 / 栈 / 时间线

### 场景一：最新 N 条动态

\`\`\`bash
# 用户发动态 -> LPUSH
127.0.0.1:6379> LPUSH latest:news "post:1001"
(integer) 1
127.0.0.1:6379> LPUSH latest:news "post:1002"
(integer) 2

# 只保留最新 1000 条
127.0.0.1:6379> LTRIM latest:news 0 999
OK

# 首页展示最新 10 条
127.0.0.1:6379> LRANGE latest:news 0 9
\`\`\`

### 场景二：轻量消息队列（FIFO）

\`\`\`bash
# 生产者
127.0.0.1:6379> LPUSH task:queue "task-A"
127.0.0.1:6379> LPUSH task:queue "task-B"

# 消费者阻塞等待
127.0.0.1:6379> BRPOP task:queue 0
1) "task:queue"
2) "task-A"
\`\`\`

### 场景三：可靠队列（LMOVE）

\`\`\`bash
# 待处理队列 -> 处理中队列
127.0.0.1:6379> LPUSH todo:queue "job-1"
127.0.0.1:6379> LPUSH todo:queue "job-2"

# 消费者原子取出并放入 processing
127.0.0.1:6379> BLMOVE todo:queue processing LEFT RIGHT 30
"job-2"

# 处理完成后从 processing 删除
# 若消费者崩溃，processing 中残留的任务可被定时扫描重试
\`\`\`

### 场景四：浏览历史（栈）

\`\`\`bash
# 浏览历史（最近访问在前）
127.0.0.1:6379> LPUSH history:user:1 "page-A"
127.0.0.1:6379> LPUSH history:user:1 "page-B"
127.0.0.1:6379> LRANGE history:user:1 0 9   # 最近 10 条
\`\`\`

### 场景五：粉丝时间线（推模式）

\`\`\`bash
# 大 V 发帖后，把动态 ID 推到每个粉丝的 timeline 列表
127.0.0.1:6379> LPUSH timeline:user:2001 "post:9001"
127.0.0.1:6379> LPUSH timeline:user:2002 "post:9001"

# 粉丝刷新首页：拉自己 timeline 前 20 条
127.0.0.1:6379> LRANGE timeline:user:2001 0 19
\`\`\`

> **何时用 List，何时用 Stream？** List 简单但不支持消费组、不持久化 ACK；Stream（后续章节）是更完整的消息队列方案。轻量场景用 List，正式 MQ 用 Stream。

## 4.9 踩坑提示

- **LPUSH 多元素顺序**：\`LPUSH k a b c\` 结果是 \`c b a\`，不是 \`a b c\`，新手最容易踩。
- **LPOP 越界**：列表为空返回 nil，业务侧必须判空。
- **BLPOP 长连接**：长阻塞占用连接池，要为消费者单独配连接池。
- **大 List 内存**：链表节点多时内存碎片大，元素超 1 万考虑换结构。
- **LTRIM 误删**：参数是闭区间，\`LTRIM k 0 99\` 保留 100 条，不是 99 条。
- **List 不支持随机高效插入**：\`LINSERT\` 是 O(N)，定位慢，别当数组用。
- **LMOVE 替代 RPOPLPUSH**：\`RPOPLPUSH\` 从 6.2 起废弃，新代码用 \`LMOVE\`。
- **quicklist 节点大小调优**：\`list-max-listpack-size\` 设小则内存省但节点多，设大则反之，需按业务测试。

## 4.10 本章小结

- List 是双向链表，LPUSH/RPUSH 入队，LPOP/RPOP 出队，LRANGE 查看。
- **方向**：L 在头、R 在尾，LPUSH 多元素逆序压入。
- 经典组合：**栈**（同端进出）、**队列**（异端进出）、**最新列表**（LPUSH + LTRIM）。
- LINDEX/LSET/LINSERT/LREM/LTRIM 提供按位置读写能力，但中部操作 O(N)。
- **LMOVE**（6.2+）原子地把元素从一列表迁到另一列表，是构建可靠队列的核心；替代了废弃的 RPOPLPUSH。
- BLPOP/BRPOP/BLMOVE 阻塞等待，是消费者低延迟消费的关键。
- **底层编码**：7.0+ 短列表用 listpack（连续内存），长列表用 quicklist（链表 + listpack 节点）；listpack 修复了 ziplist 的连锁更新问题。
- 典型应用：**最新 N 条、轻量/可靠消息队列、浏览历史、粉丝时间线**。

下一章认识更贴近对象存储的结构——**Hash 哈希**。`
  },
  {
    id: "redis-ch05",
    group: "第一部分 入门与基础",
    icon: "🗃️",
    title: "第 5 章 Hash 哈希",
    content: `# 第 5 章 Hash 哈希

Hash 是 Redis 中"对象存储"的最佳结构：一个 key 下挂多个 field-value，相当于一个迷你 Map。本章覆盖 Hash 全部命令（含 HRANDFIELD）、底层编码机制，并对比 String 存对象的优劣。

## 5.1 HSET / HGET / HDEL

\`\`\`bash
# 设置单个 field
127.0.0.1:6379> HSET user:1001 name "Alice"
(integer) 1
127.0.0.1:6379> HSET user:1001 age 28
(integer) 1

# 一次设多个 field（4.0+ 推荐写法）
127.0.0.1:6379> HSET user:1001 name "Alice" age 28 city "Shanghai"
(integer) 2

# 读取单个 field
127.0.0.1:6379> HGET user:1001 name
"Alice"

# 删除 field
127.0.0.1:6379> HDEL user:1001 city
(integer) 1
\`\`\`

> **HSET 返回值**：新增的 field 数量（已存在的 field 更新不计入）。这点和 SET 不同，可用于判断"是否首次写入"。

### 对比 String 存对象

| 维度 | String 存 JSON | Hash 存 field |
| --- | --- | --- |
| 写入 | 一次 SET | HSET 多 field |
| 读单字段 | GET 后客户端反序列化 | HGET 直接拿 |
| 改单字段 | 整体 GET + 改 + SET | HSET 单字段 |
| 内存 | 紧凑（一份 JSON） | 略多（field 单独存） |
| 过期 | 整体过期 | **不能给 field 单独设 TTL** |
| 适用 | 读多写少、整体读写 | 字段独立读写 |

> **Hash 的硬伤**：Redis 不支持给单个 field 设过期，只能整体 EXPIRE。需要字段级 TTL 时只能拆成多个 String key。

## 5.2 HGETALL / HKEYS / HVALS / HLEN

\`\`\`bash
127.0.0.1:6379> HSET user:1001 name Alice age 28 city Beijing
(integer) 3

# 全部 field-value（小心大 Hash）
127.0.0.1:6379> HGETALL user:1001
1) "name"
2) "Alice"
3) "age"
4) "28"
5) "city"
6) "Beijing"

# 只拿所有 field
127.0.0.1:6379> HKEYS user:1001
1) "name"
2) "age"
3) "city"

# 只拿所有 value
127.0.0.1:6379> HVALS user:1001
1) "Alice"
2) "28"
3) "Beijing"

# 字段数
127.0.0.1:6379> HLEN user:1001
(integer) 3
\`\`\`

## 5.3 HMGET：批量读多字段

\`\`\`bash
# 一次读多个 field
127.0.0.1:6379> HMGET user:1001 name age phone
1) "Alice"
2) "28"
3) (nil)
\`\`\`

> HMGET 比 HGET 高效，多个字段一次返回，减少网络往返。

## 5.4 HMSET（已废弃，用 HSET 多 field）

老版本（4.0 之前）批量设置只能用 HMSET：

\`\`\`bash
# 旧写法（4.0 起被 HSET 多 field 取代，HMSET 仍可用但已废弃）
127.0.0.1:6379> HMSET user:1001 name Alice age 28
OK

# 新写法（推荐）
127.0.0.1:6379> HSET user:1001 name Alice age 28
(integer) 2
\`\`\`

> **区别**：HMSET 永远返回 OK；HSET 返回新增 field 数。新代码统一用 HSET，避免使用废弃命令。

## 5.5 HINCRBY / HINCRBYFLOAT

Hash 的 field 同样支持原子计数，非常适合"对象内的数值字段"。

\`\`\`bash
127.0.0.1:6379> HSET article:1001 views 0 likes 0
(integer) 2

# 阅读量 +1
127.0.0.1:6379> HINCRBY article:1001 views 1
(integer) 1
127.0.0.1:6379> HINCRBY article:1001 views 1
(integer) 2

# 点赞 +10
127.0.0.1:6379> HINCRBY article:1001 likes 10
(integer) 10

# 浮点数
127.0.0.1:6379> HSET product:2001 price 9.9
(integer) 1
127.0.0.1:6379> HINCRBYFLOAT product:2001 price 0.1
"10"
\`\`\`

> **场景对比**：用 String 存计数器需要 \`article:1001:views\`、\`article:1001:likes\` 两个 key；用 Hash 一个 key 搞定，且能批量 HGETALL，管理更清爽。

## 5.6 HSETNX / HEXISTS

\`\`\`bash
# HSETNX：仅当 field 不存在时设置（返回 1 成功，0 失败）
127.0.0.1:6379> HSETNX user:1001 name Bob
(integer) 0        # 已存在，没改
127.0.0.1:6379> HSETNX user:1001 email "a@b.com"
(integer) 1

# HEXISTS：判断 field 是否存在
127.0.0.1:6379> HEXISTS user:1001 name
(integer) 1
127.0.0.1:6379> HEXISTS user:1001 phone
(integer) 0
\`\`\`

## 5.7 HRANDFIELD：随机返回字段（6.2+）

\`HRANDFIELD\` 随机返回一个或多个 field，是抽奖、随机展示场景的利器。

\`\`\`bash
# 不带 count：随机返回 1 个 field 名
127.0.0.1:6379> HRANDFIELD user:1001
"age"

# 带 count：返回 count 个 field 名（可重复）
127.0.0.1:6379> HRANDFIELD user:1001 2
1) "name"
2) "city"

# count 为负数：返回 |count| 个，可重复
127.0.0.1:6379> HRANDFIELD user:1001 -5
1) "name"
2) "age"
3) "age"
4) "city"
5) "name"

# WITHVALUES：连同 value 一起返回
127.0.0.1:6379> HRANDFIELD user:1001 2 WITHVALUES
1) "name"
2) "Alice"
3) "age"
4) "28"
\`\`\`

**count 正负数的区别**：

| count | 行为 | 是否重复 |
| --- | --- | --- |
| 正数 | 返回至多 count 个不重复 field | 不重复 |
| 负数 \| 返回 \\|count\| 个 field，可能重复 | 可重复 |

> **抽奖场景**：从用户池 \`lottery:users\`（Hash，field=uid，value=昵称）中抽 3 个幸运儿——\`HRANDFIELD lottery:users 3 WITHVALUES\`，一次搞定。正数保证不重复抽中同一人。

## 5.8 HSCAN：游标遍历大 Hash

\`\`\`bash
# 大 Hash 不要 HGETALL，用 HSCAN
127.0.0.1:6379> HSCAN user:1001 0 COUNT 10
1) "0"
2) 1) "name"
   2) "Alice"
   3) "age"
   4) "28"
\`\`\`

> **大 Hash 危害**：HGETALL / HKEYS / HVALS 都是 O(N)，元素上万会阻塞主线程。线上只读必要字段，或用 HSCAN。

## 5.9 底层编码：listpack vs hashtable

和 List 一样，Hash 也有两种底层编码，会根据 field 数量和大小自动切换。

### 两种编码对比

| 维度 | listpack（7.0+，旧称 ziplist） | hashtable |
| --- | --- | --- |
| **结构** | 连续内存块，紧凑 | 标准哈希表（数组 + 链表/渐进式 rehash） |
| **内存** | 极省（无指针） | 略多（指针 + 桶） |
| **查找** | O(N) 顺序遍历 | O(1) 平均 |
| **写入** | O(N)（可能触发扩容/重排） | O(1) 平均 |
| **触发条件** | field 数 ≤ 128 且单 value ≤ 64 字节 | 超出阈值 |

\`\`\`bash
# 小 Hash -> listpack
127.0.0.1:6379> HSET smallhash f1 v1 f2 v2
(integer) 2
127.0.0.1:6379> OBJECT ENCODING smallhash
"listpack"

# 大 Hash（field 多）-> hashtable
127.0.0.1:6379> HSET bighash f1 v1 f2 v2 f3 v3 f4 v4 f5 v5 f6 v6 f7 v7 f8 v8 f9 v9 f10 v10 f11 v11 f12 v12 f13 v13
(integer) 13
# （继续加到超过 128 个 field）
127.0.0.1:6379> OBJECT ENCODING bighash
"hashtable"
\`\`\`

### 调优配置

\`\`\`bash
# listpack 转 hashtable 的 field 数阈值（默认 128）
127.0.0.1:6379> CONFIG SET hash-max-listpack-entries 128

# 单个 value 最大字节数（默认 64），超阈值即转
127.0.0.1:6379> CONFIG SET hash-max-listpack-value 64
\`\`\`

> **编码选择的意义**：
> - **小 Hash 用 listpack**：连续内存，CPU 缓存友好，省下大量指针开销。当 field 只有几个时，O(N) 的顺序遍历其实比 hashtable 的 O(1) 还快（N 小、无 hash 计算开销）。
> - **大 Hash 用 hashtable**：field 多时 O(N) 不可接受，转哈希表保证 O(1) 查找。
> - **何时调优**：如果业务对象字段固定且都很少（如用户资料 10 个字段），可以把阈值调高，让更多 Hash 保持 listpack 编码以省内存。

## 5.10 应用场景：对象存储 / 购物车 / 用户资料

### 场景一：用户对象存储

\`\`\`bash
# 存储用户信息
127.0.0.1:6379> HSET user:1001 \\
  name "Alice" age 28 email "a@b.com" \\
  register_at "2024-01-01" level 5
(integer) 5

# 部分更新（只改昵称）
127.0.0.1:6379> HSET user:1001 name "Alice Wang"
(integer) 0

# 读关键信息
127.0.0.1:6379> HMGET user:1001 name level
1) "Alice Wang"
2) "5"
\`\`\`

### 场景二：购物车

购物车天然是"商品ID -> 数量"的映射，Hash 完美匹配。

\`\`\`bash
# 用户 1001 把商品 2001 加入购物车 2 件
127.0.0.1:6379> HSET cart:1001 2001 2
(integer) 1

# 加 1 件
127.0.0.1:6379> HINCRBY cart:1001 2001 1
(integer) 3

# 再加商品 2002 1 件
127.0.0.1:6379> HSET cart:1001 2002 1
(integer) 1

# 看购物车
127.0.0.1:6379> HGETALL cart:1001
1) "2001"
2) "3"
3) "2002"
4) "1"

# 移除商品
127.0.0.1:6379> HDEL cart:1001 2002
(integer) 1

# 购物车商品数
127.0.0.1:6379> HLEN cart:1001
(integer) 1
\`\`\`

> **Hash 字段数控制**：单个 Hash 的 field 数建议不超过 **1000**。再多时考虑分桶（如 \`cart:1001:1\`、\`cart:1001:2\`），或改用 String + 关系库。

### 场景三：文章元信息 + 计数

\`\`\`bash
# 一篇文章所有元信息聚合在一个 Hash
127.0.0.1:6379> HSET article:1001 \\
  title "Redis 入门" author "Tom" \\
  views 0 likes 0 comments 0
(integer) 5

# 各种计数原子更新
127.0.0.1:6379> HINCRBY article:1001 views 1
(integer) 1
127.0.0.1:6379> HINCRBY article:1001 likes 1
(integer) 1
127.0.0.1:6379> HINCRBY article:1001 comments 1
(integer) 1

# 一条命令拿到所有展示字段
127.0.0.1:6379> HMGET article:1001 title author views likes
1) "Redis \u5165\u95e8"
2) "Tom"
3) "1"
4) "1"
\`\`\`

### 场景四：抽奖（HRANDFIELD）

\`\`\`bash
# 把活动参与者写入 Hash（field=uid，value=昵称）
127.0.0.1:6379> HSET lottery:2024 u1001 "Alice" u1002 "Bob" u1003 "Cathy" u1004 "Dan" u1005 "Eve"
(integer) 5

# 抽 2 个不重复的一等奖
127.0.0.1:6379> HRANDFIELD lottery:2024 2 WITHVALUES
1) "u1003"
2) "Cathy"
3) "u1001"
4) "Alice"

# 中奖者从池中移除（避免重复中奖）
127.0.0.1:6379> HDEL lottery:2024 u1003 u1001
(integer) 2
\`\`\`

### 场景五：部分字段更新

\`\`\`bash
# 用户改昵称：只需 HSET 单字段，不必读出整个对象
127.0.0.1:6379> HSET user:1001 nickname "newbie"
(integer) 1

# 对比 String 存 JSON 的改法：GET -> 反序列化 -> 改字段 -> 序列化 -> SET
# Hash 方案省了 3 次网络往返 + 2 次序列化
\`\`\`

## 5.11 踩坑提示

- **大 Hash 阻塞**：HGETALL/HKEYS/HVALS 是 O(N)，field 多时改用 HMGET 或 HSCAN。
- **field 不能单独 TTL**：需要字段级过期请用 String 拆 key。
- **HSET 多 field 返回值**：是"新增"数，不是"修改"数，做幂等判断时别用错。
- **HMSET 已废弃**：新代码用 HSET 多 field 写法。
- **Hash 编码优化**：field 数 ≤ 128 且单 value ≤ 64 字节时用 listpack（7.0+）紧凑编码，省内存；超阈值转 hashtable。可通过 \`hash-max-listpack-entries\` 等配置调优。
- **field 名要短**：\`n\` 比 \`name\` 省内存，但要权衡可读性，可统一前缀规范。
- **HRANDFIELD 正负 count**：正数不重复，负数可重复，抽奖时按需选择。
- **HINCRBY 仅整数**：浮点字段必须用 HINCRBYFLOAT，用 HINCRBY 会报错。

## 5.12 本章小结

- Hash 是 key 下挂多个 field-value 的结构，最适合存"对象"。
- HSET/HGET/HDEL 是日常三件套，HSET 支持多 field 一次写。
- HGETALL/HKEYS/HVALS/HLEN 提供整体视图，大 Hash 用 HSCAN。
- HINCRBY/HINCRBYFLOAT 让对象内数值字段原子计数。
- HSETNX/HEXISTS/HMGET 支持条件写入与批量读取。
- **HRANDFIELD**（6.2+）随机返回字段，正数不重复、负数可重复，适合抽奖/随机展示。
- HMSET 已废弃，统一用 HSET 多 field 写法。
- **底层编码**：listpack（紧凑连续内存，field 少时用）vs hashtable（O(1) 查找，field 多时用），阈值由 \`hash-max-listpack-entries\` 控制。
- 典型应用：**用户对象、购物车、文章元信息+计数器、抽奖、部分字段更新**。
- 限制：field 无独立 TTL，单 Hash 建议 field 数 ≤ 1000。

第一部分基础到此告一段落。第二部分将进入更强大的数据结构——从 **Set 集合**开始，看 Redis 如何做"标签""共同好友"这类关系运算。`
  }
];

export { chapters };
