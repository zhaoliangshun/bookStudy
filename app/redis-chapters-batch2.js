// =============================================================
// 《Redis 实战教程》- 章节批次 2
// -------------------------------------------------------------
// 内容：第二部分 数据结构进阶（第 6-11 章）
// =============================================================

const chapters = [
  {
    id: "redis-ch06",
    group: "第二部分 数据结构进阶",
    icon: "🎯",
    title: "第 6 章 Set 集合",
    content: `# 第 6 章 Set 集合

Set 是 Redis 的无序、不重复字符串集合。它的核心价值在于**集合运算**——交集、并集、差集，让 Redis 能直接处理"共同好友""标签匹配"这类关系型问题，而无需在应用层做内存运算。

## 6.1 SADD / SMEMBERS / SISMEMBER

\`\`\`bash
# 添加元素（已存在的会被忽略，返回新增个数）
127.0.0.1:6379> SADD tags:1001 redis cache nosql
(integer) 3
127.0.0.1:6379> SADD tags:1001 redis        # 重复，不增加
(integer) 0

# 查看所有元素（无序）
127.0.0.1:6379> SMEMBERS tags:1001
1) "cache"
2) "nosql"
3) "redis"

# 判断元素是否在集合中（1 在，0 不在）
127.0.0.1:6379> SISMEMBER tags:1001 redis
(integer) 1
127.0.0.1:6379> SISMEMBER tags:1001 mysql
(integer) 0

# 集合大小
127.0.0.1:6379> SCARD tags:1001
(integer) 3
\`\`\`

> **性能特征**：SADD / SISMEMBER / SCARD 都是 **O(1)**，这是 Set 相比 List 的最大优势——判断"是否存在"极快。

## 6.2 SREM / SPOP / SRANDMEMBER

\`\`\`bash
# 删除指定元素
127.0.0.1:6379> SREM tags:1001 cache
(integer) 1
127.0.0.1:6379> SMEMBERS tags:1001
1) "nosql"
2) "redis"

# 随机弹出 N 个元素（弹出后从集合移除）
127.0.0.1:6379> SADD pool a b c d e
(integer) 5
127.0.0.1:6379> SPOP pool 2
1) "a"
2) "c"
127.0.0.1:6379> SCARD pool
(integer) 3

# 随机返回但不移除
127.0.0.1:6379> SRANDMEMBER pool 2
1) "b"
2) "e"
# 正数：可能重复返回；负数：绝对不重复；0：返回空
127.0.0.1:6379> SRANDMEMBER pool -2
1) "b"
2) "d"
\`\`\`

### SRANDMEMBER 的 count 参数

| count | 行为 |
| --- | --- |
| 正数 | 返回最多 count 个，**可能重复** |
| 负数 | 返回 \|count\| 个，**绝不重复** |
| 0 | 返回空数组 |

> **抽奖场景**：抽 1 个一等奖用 \`SPOP\`（抽走不再中）；抽 3 个参与奖用 \`SRANDMEMBER -3\`（允许同人不重复）。

## 6.3 SCARD / SMEMBERS

\`\`\`bash
127.0.0.1:6379> SADD users u1 u2 u3 u4 u5
(integer) 5

# 元素个数
127.0.0.1:6379> SCARD users
(integer) 5

# 全部成员（大集合慎用！）
127.0.0.1:6379> SMEMBERS users
1) "u1"
2) "u2"
3) "u3"
4) "u4"
5) "u5"
\`\`\`

### SSCAN：游标遍历大集合

\`\`\`bash
# 大集合别用 SMEMBERS，用 SSCAN
127.0.0.1:6379> SSCAN users 0 COUNT 10
1) "0"
2) 1) "u1"
   2) "u2"
   3) "u3"
   4) "u4"
   5) "u5"
\`\`\`

> **大 Set 危害**：SMEMBERS 是 O(N)，几十万元素会阻塞主线程。线上只判断存在性用 SISMEMBER，遍历用 SSCAN。

## 6.4 集合运算（SINTER / SUNION / SDIFF）

集合运算是 Set 的灵魂。设三个用户各自的标签：

\`\`\`bash
127.0.0.1:6379> SADD user:1:tags java redis mysql
(integer) 3
127.0.0.1:6379> SADD user:2:tags java go redis
(integer) 3
127.0.0.1:6379> SADD user:3:tags python go
(integer) 2
\`\`\`

### 交集 SINTER（共同部分）

\`\`\`bash
127.0.0.1:6379> SINTER user:1:tags user:2:tags
1) "java"
2) "redis"
\`\`\`

### 并集 SUNION（全部去重）

\`\`\`bash
127.0.0.1:6379> SUNION user:1:tags user:3:tags
1) "java"
2) "redis"
3) "mysql"
4) "python"
5) "go"
\`\`\`

### 差集 SDIFF（前者有、后者无）

\`\`\`bash
127.0.0.1:6379> SDIFF user:1:tags user:2:tags
1) "mysql"
127.0.0.1:6379> SDIFF user:2:tags user:1:tags
1) "go"
\`\`\`

> **差集方向**：\`SDIFF A B\` 是"A 中有但 B 中无"，**顺序敏感**！\`SDIFF A B\` 和 \`SDIFF B A\` 结果不同。

### SINTERCARD（7.0+，只返回数量不返回元素）

\`\`\`bash
# 返回交集元素个数，比 SINTER 更省网络
127.0.0.1:6379> SINTERCARD 2 user:1:tags user:2:tags
(integer) 2
# 第一个参数是 key 的数量
# 可加 LIMIT 提前终止（达到上限就停）
127.0.0.1:6379> SINTERCARD 2 user:1:tags user:2:tags LIMIT 1
(integer) 1
\`\`\`

## 6.5 SINTERSTORE 等存储版本

交集/并集/差集的结果可以直接存到一个新 key，免去应用层中转：

\`\`\`bash
# 把 user:1 和 user:2 标签交集存到 common:tags
127.0.0.1:6379> SINTERSTORE common:tags user:1:tags user:2:tags
(integer) 2
127.0.0.1:6379> SMEMBERS common:tags
1) "java"
2) "redis"

# SUNIONSTORE / SDIFFSTORE 同理
127.0.0.1:6379> SUNIONSTORE all:tags user:1:tags user:2:tags user:3:tags
(integer) 5
127.0.0.1:6379> SDIFFSTORE only:1 user:1:tags user:2:tags user:3:tags
(integer) 1
\`\`\`

> **存储版的应用**：把计算结果固化下来，避免每次重算。但要注意目标 key 会**覆盖**原有内容，且需自己设过期。

## 6.6 应用场景：标签 / 共同好友 / 抽奖

### 场景一：文章标签双向索引

\`\`\`bash
# 文章 -> 标签
127.0.0.1:6379> SADD article:1001:tags redis cache nosql
(integer) 3

# 标签 -> 文章（反向索引，方便按标签查文章）
127.0.0.1:6379> SADD tag:redis:articles 1001
(integer) 1
127.0.0.1:6379> SADD tag:cache:articles 1001
(integer) 1

# 查"同时有 redis 和 cache 标签的文章"
127.0.0.1:6379> SINTER tag:redis:articles tag:cache:articles
1) "1001"
\`\`\`

### 场景二：共同好友

\`\`\`bash
127.0.0.1:6379> SADD user:1:friends 2 3 4 5
127.0.0.1:6379> SADD user:6:friends 3 4 7 8

# 共同好友
127.0.0.1:6379> SINTER user:1:friends user:6:friends
1) "3"
2) "4"

# 我可能认识的人（对方好友 - 我的好友 - 我自己）
127.0.0.1:6379> SDIFF user:6:friends user:1:friends
1) "7"
2) "8"
\`\`\`

### 场景三：抽奖

\`\`\`bash
# 把参与用户加入集合
127.0.0.1:6379> SADD lottery:2024 u1 u2 u3 u4 u5 u6 u7 u8
(integer) 8

# 抽 1 个一等奖（抽走，不再中）
127.0.0.1:6379> SPOP lottery:2024 1
1) "u3"

# 抽 3 个幸运奖（不抽走，可继续参与）
127.0.0.1:6379> SRANDMEMBER lottery:2024 -3
1) "u1"
2) "u5"
3) "u7"
\`\`\`

### 场景四：UV 去重（小规模）

\`\`\`bash
# 记录访问某页面的用户（用户量大用 HyperLogLog，见第 11 章）
127.0.0.1:6379> SADD page:home:uv user1 user2 user3
(integer) 3
127.0.0.1:6379> SCARD page:home:uv
(integer) 3
\`\`\`

## 6.7 踩坑提示

- **SMEMBERS 阻塞**：大集合用 SSCAN 或 SINTERCARD。
- **集合运算的复杂度**：SINTER/SUNION/SDIFF 是 O(N*M)，N 是最小集合大小，M 是集合数。**参与运算的最小集合别太大**，几千以内最佳。
- **SPOP 随机性**：Redis 的 SPOP 在大集合上是近似随机，对小集合是精确随机。
- **SRANDMEMBER 正负数语义不同**：正数允许重复返回，负数绝不重复，新人最易混淆。
- **存储版会覆盖目标 key**：SINTERSTORE 目标 key 若存在会被清空重写。
- **Set 无序**：不能依赖 SMEMBERS 的返回顺序，需要排序请用 ZSet。

## 6.8 本章小结

- Set 是无序、不重复集合，SADD/SMEMBERS/SISMEMBER/SCARD 是日常四件套。
- SREM/SPOP/SRANDMEMBER 提供删除与随机抽样，SRANDMEMBER 的正负数语义不同。
- **集合运算**是 Set 的灵魂：SINTER 交集、SUNION 并集、SDIFF 差集（方向敏感）。
- SINTERCARD（7.0+）只返回数量，省网络；SINTERSTORE 等存储版固化结果。
- 典型应用：**标签双向索引、共同好友、抽奖、小规模 UV**。
- 性能要点：SADD/SISMEMBER O(1)；集合运算 O(N*M)，控制参与集合规模。

下一章学习 Redis 最经典的结构——**ZSet 有序集合**，排行榜、延时队列全靠它。`
  },
  {
    id: "redis-ch07",
    group: "第二部分 数据结构进阶",
    icon: "📊",
    title: "第 7 章 ZSet 有序集合",
    content: `# 第 7 章 ZSet 有序集合

ZSet（Sorted Set）在 Set 基础上给每个元素关联一个 **score（分数）**，并按分数自动排序。它是 Redis 中最优雅、应用最广的结构之一——排行榜、延时队列、带权重的消息分发都靠它。

## 7.1 ZADD / ZRANGE / ZREVRANGE

\`\`\`bash
# ZADD key [NX|XX] [GT|LT] [CH] [INCR] score member ...
127.0.0.1:6379> ZADD leaderboard 100 alice 90 bob 85 carol 70 dave
(integer) 4

# 按分数升序取 [start, stop]
127.0.0.1:6379> ZRANGE leaderboard 0 -1
1) "dave"
2) "carol"
3) "bob"
4) "alice"

# 带分数返回
127.0.0.1:6379> ZRANGE leaderboard 0 -1 WITHSCORES
1) "dave"
2) "70"
3) "carol"
4) "85"
5) "bob"
6) "90"
7) "alice"
8) "100"

# 降序取
127.0.0.1:6379> ZREVRANGE leaderboard 0 -1 WITHSCORES
1) "alice"
2) "100"
3) "bob"
4) "90"
5) "carol"
6) "85"
7) "dave"
8) "70"
\`\`\`

### ZADD 的选项（重要）

| 选项 | 含义 |
| --- | --- |
| \`NX\` | 仅添加新成员，已存在的不更新 |
| \`XX\` | 仅更新已存在成员，不新增 |
| \`GT\` | 仅当新分数**大于**现有分数时更新（6.2+） |
| \`LT\` | 仅当新分数**小于**现有分数时更新（6.2+） |
| \`CH\` | 返回值改为"被改变的成员数"（新增+更新） |
| \`INCR\` | 把分数当增量叠加，类似 ZINCRBY |

\`\`\`bash
# 只在分数更高时更新（防止回退）
127.0.0.1:6379> ZADD leaderboard GT 80 dave
(integer) 1
127.0.0.1:6379> ZADD leaderboard GT 75 dave    # 75 < 80，不更新
(integer) 0

# INCR 模式：分数累加
127.0.0.1:6379> ZADD leaderboard INCR 5 bob
"95"
\`\`\`

## 7.2 ZSCORE / ZRANK / ZREVRANK

\`\`\`bash
# 取某成员分数
127.0.0.1:6379> ZSCORE leaderboard alice
"100"

# 升序排名（0 开始）
127.0.0.1:6379> ZRANK leaderboard alice
(integer) 3

# 降序排名（0 开始，第一名是最高分）
127.0.0.1:6379> ZREVRANK leaderboard alice
(integer) 0

# 一次查多个成员分数
127.0.0.1:6379> ZMSCORE leaderboard alice bob dave
1) "100"
2) "95"
3) "80"
\`\`\`

> **排名从 0 开始**：\`ZRANK\` 返回 0 表示是最低分那位，不是"第一名"。前端展示通常要 +1。

## 7.3 ZRANGEBYSCORE / ZCOUNT

按**分数范围**查询是 ZSet 的看家本领：

\`\`\`bash
# 分数在 [80, 100] 之间的成员（升序）
127.0.0.1:6379> ZRANGEBYSCORE leaderboard 80 100
1) "dave"
2) "carol"
3) "bob"
4) "alice"

# 开区间 (85, +inf)，LIMIT 分页
127.0.0.1:6379> ZRANGEBYSCORE leaderboard (85 +inf LIMIT 0 2
1) "bob"
2) "alice"

# 降序版本（6.2+ 推荐 ZRANGE 配 BYSCORE REV）
127.0.0.1:6379> ZRANGE leaderboard 100 80 BYSCORE REV
1) "alice"
2) "bob"
3) "carol"
4) "dave"

# 统计分数区间内的成员数
127.0.0.1:6379> ZCOUNT leaderboard 80 100
(integer) 4
\`\`\`

### 区间语法

| 写法 | 含义 |
| --- | --- |
| \`min max\` | 闭区间 [min, max] |
| \`(min max\` | 左开右闭 |
| \`min)\` | 右开 |
| \`-inf +inf\` | 全部 |

> **新写法（6.2+）**：\`ZRANGE key min max BYSCORE\` 统一了 ZRANGEBYSCORE/ZREVRANGEBYSCORE，建议新代码用统一语法。

## 7.4 ZINCRBY / ZREM

\`\`\`bash
# 给 alice 加 50 分
127.0.0.1:6379> ZINCRBY leaderboard 50 alice
"150"

# 删除成员
127.0.0.1:6379> ZREM leaderboard dave
(integer) 1

# 批量删除
127.0.0.1:6379> ZREM leaderboard bob carol
(integer) 2
\`\`\`

### ZREMRANGEBYRANK / ZREMRANGEBYSCORE：按排名或分数删

\`\`\`bash
127.0.0.1:6379> ZADD lb 1 a 2 b 3 c 4 d 5 e
(integer) 5

# 删排名 0~1（最低的两个）
127.0.0.1:6379> ZREMRANGEBYRANK lb 0 1
(integer) 2

# 删分数 3~5 的
127.0.0.1:6379> ZREMRANGEBYSCORE lb 3 5
(integer) 2
\`\`\`

> **保留前 N 名**：先 \`ZREMRANGEBYRANK key 0 -(N+1)\` 删掉排名 N 之后的，留下前 N。

## 7.5 ZPOPMIN / ZPOPMAX

弹出分数最低/最高的成员（连带分数一起移除）：

\`\`\`bash
127.0.0.1:6379> ZADD pq 1 task1 2 task2 3 task3
(integer) 3

# 弹出最低分（默认 1 个）
127.0.0.1:6379> ZPOPMIN pq
1) "task1"
2) "1"

# 弹出最高分 2 个
127.0.0.1:6379> ZPOPMAX pq 2
1) "task3"
2) "3"
3) "task2"
4) "2"
\`\`\`

### BZPOPMIN / BZPOPMAX：阻塞版

\`\`\`bash
# 阻塞等待 30 秒，pq 有元素就弹出最低分
127.0.0.1:6379> BZPOPMIN pq 30
1) "pq"
2) "task1"
3) "1"
\`\`\`

> **延时队列核心**：用执行时间戳作 score，消费者用 BZPOPMIN 阻塞取最早的，自然形成延时队列。

## 7.6 集合运算（ZUNIONSTORE / ZINTERSTORE）

ZSet 也能做并集、交集，且能指定**聚合方式**与**权重**：

\`\`\`bash
127.0.0.1:6379> ZADD math 90 alice 80 bob
127.0.0.1:6379> ZADD english 85 alice 95 bob

# 并集：默认 SUM（同成员分数相加）
127.0.0.1:6379> ZUNIONSTORE total 2 math english
(integer) 2
127.0.0.1:6379> ZRANGE total 0 -1 WITHSCORES
1) "bob"
2) "175"
3) "alice"
4) "175"

# 指定权重和聚合方式
# math 权重 1.0，english 权重 1.5，取 MAX
127.0.0.1:6379> ZUNIONSTORE weighted 2 math english WEIGHTS 1 1.5 AGGREGATE MAX
127.0.0.1:6379> ZRANGE weighted 0 -1 WITHSCORES
1) "bob"
2) "142.5"
3) "alice"
4) "127.5"
\`\`\`

### AGGREGATE 选项

| 值 | 含义 |
| --- | --- |
| \`SUM\`（默认） | 分数相加 |
| \`MIN\` | 取最小 |
| \`MAX\` | 取最大 |

\`\`\`bash
# 交集：只保留同时在两个集合的成员
127.0.0.1:6379> ZADD set1 1 a 2 b 3 c
127.0.0.1:6379> ZADD set2 10 b 20 c 30 d
127.0.0.1:6379> ZINTERSTORE inter 2 set1 set2
(integer) 2
127.0.0.1:6379> ZRANGE inter 0 -1 WITHSCORES
1) "b"
2) "12"
3) "c"
4) "23"
\`\`\`

> **重要**：ZUNIONSTORE/ZINTERSTORE 的源 key **可以是 Set**（Set 视作分数为 1 的 ZSet），常用于"Set 转 ZSet 加权排序"。

## 7.7 应用场景：排行榜 / 延时队列

### 场景一：积分排行榜

\`\`\`bash
# 用户消费获得积分
127.0.0.1:6379> ZINCRBY rank:daily 100 "user:1001"
"100"
127.0.0.1:6379> ZINCRBY rank:daily 150 "user:1002"
"150"
127.0.0.1:6379> ZINCRBY rank:daily 80 "user:1003"
"80"

# Top 3（降序，带分数）
127.0.0.1:6379> ZREVRANGE rank:daily 0 2 WITHSCORES
1) "user:1002"
2) "150"
3) "user:1001"
4) "100"
5) "user:1003"
6) "80"

# 查我的排名（前端展示 +1）
127.0.0.1:6379> ZREVRANK rank:daily "user:1001"
(integer) 1

# 查我的分数
127.0.0.1:6379> ZSCORE rank:daily "user:1001"
"100"

# 只保留前 100 名
127.0.0.1:6379> ZREMRANGEBYRANK rank:daily 0 -(100+1)
\`\`\`

### 场景二：延时队列

\`\`\`bash
# 入队：score = 执行时间戳（毫秒）
# 5 秒后执行 task-A
127.0.0.1:6379> ZADD delay:queue 1700000005000 "task-A"

# 消费者轮询（应用层逻辑）：
# 1. ZRANGEBYSCORE delay:queue 0 <当前时间戳> LIMIT 0 1
# 2. 拿到任务后 ZREM 移除
# 3. 处理任务

127.0.0.1:6379> ZRANGEBYSCORE delay:queue 0 1700000005000 LIMIT 0 10
1) "task-A"
127.0.0.1:6379> ZREM delay:queue "task-A"
(integer) 1
\`\`\`

> **注意**：ZRANGEBYSCORE + ZREM 两步非原子，并发下可能重复消费。生产用 Lua 脚本保证原子，或换 Stream。

### 场景三：滑动窗口限流

\`\`\`bash
# 把每次请求时间戳作为 member 存入 ZSet
# member 用 唯一ID 避免覆盖
127.0.0.1:6379> ZADD rate:user:1001 1700000001000 "req-1"
127.0.0.1:6379> ZADD rate:user:1001 1700000002000 "req-2"

# 清理 60 秒前的请求
127.0.0.1:6379> ZREMRANGEBYSCORE rate:user:1001 0 1700000001000

# 统计窗口内请求数
127.0.0.1:6379> ZCARD rate:user:1001
(integer) 1
# 超过阈值就拒绝
\`\`\`

## 7.8 踩坑提示

- **排名从 0 开始**：展示给用户要 +1，否则"第 0 名"很奇怪。
- **同分数排序**：分数相同时按 member 字典序排，不保证插入顺序。
- **ZRANGEBYSCORE 性能**：在大 ZSet 上仍较快（跳表），但 LIMIT 深度分页会变慢。
- **ZINCRBY 浮点精度**：分数是 double，金额场景注意精度。
- **ZUNIONSTORE 源是 Set 时分数为 1**：用 AGGREGATE MAX/MIN 时要特别小心。
- **延时队列并发消费**：ZRANGEBYSCORE + ZREM 非原子，用 Lua 或换 Stream。
- **大 ZSet 内存**：跳表 + 哈希表双结构，内存占用比 Set 高，超 1 万元素评估下是否值得。

## 7.9 本章小结

- ZSet = Set + score，按分数自动排序，跳表 + 哈希表实现。
- ZADD 支持 NX/XX/GT/LT/CH/INCR 选项，GT/LT 防止分数回退很有用。
- ZRANGE/ZREVRANGE 按排名查，ZRANGEBYSCORE/ZCOUNT 按分数查；6.2+ 用统一 ZRANGE ... BYSCORE。
- ZRANK/ZREVRANK/ZSCORE/ZMSCORE 提供单成员查询。
- ZPOPMIN/ZPOPMAX/BZPOPMIN 弹出最值，是延时队列的基础。
- ZUNIONSTORE/ZINTERSTORE 支持权重和 SUM/MIN/MAX 聚合，源可混用 Set。
- 典型应用：**积分排行榜、延时队列、滑动窗口限流、多维度加权排序**。

下一章认识 Redis 5.0 引入的"专业消息队列"结构——**Stream 数据流**。`
  },
  {
    id: "redis-ch08",
    group: "第二部分 数据结构进阶",
    icon: "🌊",
    title: "第 8 章 Stream 数据流",
    content: `# 第 8 章 Stream 数据流

Stream 是 Redis 5.0 引入的数据流结构，被定位为"内置的轻量级消息队列"。它解决了 List 当消息队列时无法持久化 ACK、不能多消费者独立消费的痛点，提供消费组、消息确认、回溯等完整能力。

## 8.1 Stream 简介（Redis 5.0+）

Stream 的设计灵感来自 Kafka，但运行在单机 Redis 上。核心概念：

| 概念 | 说明 |
| --- | --- |
| **Entry（消息）** | 一条消息，由 ID + 多个 field-value 组成 |
| **ID** | 形如 \`<毫秒时间戳>-<序号>\`，单调递增 |
| **Consumer Group（消费组）** | 一组消费者共同消费一个 Stream，互不重复 |
| **Pending Entry List（PEL）** | 已投递但未 ACK 的消息列表 |

> **Stream vs List**：List 是"无脑队列"，消费即消失；Stream 是"日志"，消费后消息仍在，可回溯、可 ACK、可重投。

## 8.2 XADD / XLEN / XRANGE

\`\`\`bash
# XADD key [NOMKSTREAM] [MAXLEN|MINID [=|~] threshold] id field value ...
# 用 * 让 Redis 自动生成 ID
127.0.0.1:6379> XADD orders * type "create" user 1001 amount 99.9
"1700000000000-0"
127.0.0.1:6379> XADD orders * type "pay" user 1001 amount 99.9
"1700000000001-0"
127.0.0.1:6379> XADD orders * type "ship" user 1002 amount 50
"1700000000002-0"

# 消息总数
127.0.0.1:6379> XLEN orders
(integer) 3

# 按范围查 [start, end]，- 表示最小/最大
127.0.0.1:6379> XRANGE orders - +
1) 1) "1700000000000-0"
   2) 1) "type"
      2) "create"
      3) "user"
      4) "1001"
      5) "amount"
      6) "99.9"
2) 1) "1700000000001-0"
   2) 1) "type"
      2) "pay"
      3) "user"
      4) "1001"
      5) "amount"
      6) "99.9"
3) 1) "1700000000002-0"
   2) 1) "type"
      2) "ship"
      3) "user"
      4) "1002"
      5) "amount"
      6) "50"

# 限制返回条数
127.0.0.1:6379> XRANGE orders - + COUNT 2
\`\`\`

### MAXLEN 限制流长度

\`\`\`bash
# 精确裁剪到 1000 条（慢，会逐条删）
127.0.0.1:6379> XADD orders MAXLEN 1000 * type create
# 近似裁剪（快，推荐）
127.0.0.1:6379> XADD orders MAXLEN ~ 1000 * type create
\`\`\`

> **生产建议**：用 \`MAXLEN ~ N\` 近似裁剪，Redis 会按需批量删除，性能比精确裁剪高一个数量级。

## 8.3 XREAD 读取

XREAD 是"独立消费"模式，不依赖消费组，每个客户端自己维护读取位置：

\`\`\`bash
# 从开头读 2 条
127.0.0.1:6379> XREAD COUNT 2 STREAMS orders 0
1) 1) "orders"
   2) 1) 1) "1700000000000-0"
         2) 1) "type"
            2) "create"
            ...
      2) 1) "1700000000001-0"
         2) 1) "type"
            2) "pay"
            ...

# 只读新消息（$ 表示最新 ID 之后）
127.0.0.1:6379> XREAD STREAMS orders $
(nil)

# 阻塞等待新消息（5 秒）
127.0.0.1:6379> XREAD COUNT 10 BLOCK 5000 STREAMS orders $
1) 1) "orders"
   2) 1) 1) "1700000000003-0"
         2) ...
\`\`\`

> **lastId 的含义**：\`STREAMS key id\` 中的 id 是"上次读到的位置"，返回的是 id **之后**的消息。首次读用 0（从头），持续读用上次返回的最后一条 ID。

## 8.4 消费者组（XGROUP / XREADGROUP）

消费组让多个消费者**协同消费同一 Stream**，每条消息只被组内一个消费者处理。

\`\`\`bash
# 创建消费组，从开头消费（0）
127.0.0.1:6379> XGROUP CREATE orders order-processors 0
OK

# 也可以从最新开始（$），或指定 ID
127.0.0.1:6379> XGROUP CREATE orders order-processors $ MKSTREAM
OK

# 查看所有消费组
127.0.0.1:6379> XINFO GROUPS orders
1) 1) "name"
   2) "order-processors"
   3) "consumers"
   4) (integer) 0
   5) "pending"
   6) (integer) 0
   ...

# 消费者 c1 从组里读取（> 表示未投递过的新消息）
127.0.0.1:6379> XREADGROUP GROUP order-processors c1 COUNT 2 STREAMS orders >
1) 1) "orders"
   2) 1) 1) "1700000000000-0"
         2) 1) "type"
            2) "create"
            ...
      2) 1) "1700000000001-0"
         2) 1) "type"
            2) "pay"
            ...
\`\`\`

### ID 参数的含义

| ID | 含义 |
| --- | --- |
| \`>\` | 读**未投递过**的新消息 |
| \`0\` 或具体 ID | 读**已投递给本消费者但未 ACK** 的消息（PEL 重投） |

> **关键区分**：\`>\` 拿新消息，\`0\` 拿自己未完成的旧消息。消费失败后用 \`0\` 重试。

\`\`\`bash
# 列出组内消费者
127.0.0.1:6379> XINFO CONSUMERS orders order-processors
1) 1) "name"
   2) "c1"
   3) "pending"
   4) (integer) 2
   5) "idle"
   6) (integer) 12345
\`\`\`

## 8.5 XACK 与消息确认

消费组模式下，**消息被读取后不会删除，只有 ACK 后才从 PEL 移除**：

\`\`\`bash
# 消费者处理完一条消息后确认
127.0.0.1:6379> XACK orders order-processors 1700000000000-0
(integer) 1

# 可一次 ACK 多条
127.0.0.1:6379> XACK orders order-processors 1700000000001-0 1700000000002-0
(integer) 2
\`\`\`

> **没有 ACK 会怎样？** 消息会一直留在该消费者的 PEL 里，即使消费者下线。重启后用 \`XREADGROUP ... STREAMS key 0\` 能重新拿到这些未完成的消息。

## 8.6 XPENDING / XCLAIM

### XPENDING：查看未确认消息

\`\`\`bash
# 查看组的 PEL 概况
127.0.0.1:6379> XPENDING orders order-processors
1) (integer) 2           # 未确认总数
2) "1700000000001-0"     # 最小 ID
3) "1700000000002-0"     # 最大 ID
4) 1) 1) "c1"
      2) "2"
   2) 1) "c2"
      2) "0"

# 查看详细列表（含空闲时间、投递次数）
127.0.0.1:6379> XPENDING orders order-processors - + 10
1) 1) "1700000000001-0"
   2) "c1"
   3) (integer) 60000     # 空闲 60 秒
   4) (integer) 3         # 已投递 3 次
\`\`\`

### XCLAIM：转移超时消息

当消费者 c1 卡死后，把它的消息转给 c2：

\`\`\`bash
# 把空闲超过 60 秒的消息转给 c2
127.0.0.1:6379> XCLAIM orders order-processors c2 60000 1700000000001-0
1) 1) "1700000000001-0"
   2) 1) "type"
      2) "pay"
      ...
\`\`\`

### XAUTOCLAIM（6.2+）：自动批量转移

\`\`\`bash
# 自动扫描并转移空闲超时的消息，返回转移后的游标和消息
127.0.0.1:6379> XAUTOCLAIM orders order-processors c2 60000 0 COUNT 10
1) "0"
2) 1) 1) "1700000000001-0"
      2) 1) "type"
         2) "pay"
         ...
3) (empty array)
\`\`\`

> **死信处理思路**：通过 XPENDING 看到 \`deliveries\`（投递次数）超过阈值（如 5 次）的消息，转交到死信 Stream 处理。

## 8.7 应用场景：消息队列

### 完整的订单事件流处理

\`\`\`bash
# 1. 生产者写入订单事件
127.0.0.1:6379> XADD orders * event create orderId 1001
"1700000001000-0"
127.0.0.1:6379> XADD orders * event pay orderId 1001
"1700000001001-0"

# 2. 创建消费组（只需一次）
127.0.0.1:6379> XGROUP CREATE orders order-group 0 MKSTREAM

# 3. 消费者循环拉取新消息
127.0.0.1:6379> XREADGROUP GROUP order-group worker-1 COUNT 10 BLOCK 5000 STREAMS orders >

# 4. 处理完成后 ACK
127.0.0.1:6379> XACK orders order-group 1700000001000-0

# 5. 定时任务用 XAUTOCLAIM 救活卡死的消息
127.0.0.1:6379> XAUTOCLAIM orders order-group worker-2 60000 0 COUNT 10
\`\`\`

### 消息回溯

\`\`\`bash
# 出问题时，回查某个时间段的消息
127.0.0.1:6379> XRANGE orders 1700000001000 1700000002000
\`\`\`

> **Stream 的杀手锏**：消息持久 + 可回溯 + 消费组隔离。这是 List 无法提供的。

### 删除与裁剪

\`\`\`bash
# 删除单条（不影响消费组 PEL）
127.0.0.1:6379> XDEL orders 1700000001000-0
(integer) 1

# 裁剪到最近 10000 条
127.0.0.1:6379> XTRIM orders MAXLEN ~ 10000
(integer) 0

# 删除消费组
127.0.0.1:6379> XGROUP DESTROY orders order-group
(integer) 1
\`\`\`

## 8.8 踩坑提示

- **忘记 ACK**：消息永远留在 PEL，内存持续增长。务必在处理成功后 ACK，并配合监控 XPENDING 数量。
- **PEL 无限堆积**：消费者崩溃后消息不释放，要用 XAUTOCLAIM 定期救活。
- **\`>\` vs \`0\`**：\`>\` 拿新消息，\`0\` 拿自己未 ACK 的旧消息，新人极易搞混。
- **MAXLEN 精确裁剪慢**：用 \`~\` 近似裁剪，性能更好。
- **XADD 的 ID 必须递增**：手动指定 ID 时不能比现有最大 ID 小，否则报错。
- **消息大小**：单条消息别超 1MB，field/value 尽量短。
- **不是 Kafka**：单机 Stream 没有分区并行能力，单 Stream 吞吐上限约 10 万 QPS，超量用多 Stream 分片或上 Kafka。

## 8.9 本章小结

- Stream 是 Redis 5.0+ 的内置消息队列，支持持久化、消费组、ACK、回溯。
- XADD 写入（\`*\` 自动生成 ID，MAXLEN 裁剪），XLEN/XRANGE 查询。
- XREAD 独立消费，XREADGROUP + XGROUP 协同消费。
- \`>\` 取新消息，\`0\` 取未 ACK 的旧消息；XACK 确认，未 ACK 的进 PEL。
- XPENDING 查 PEL，XCLAIM/XAUTOCLAIM 转移超时消息，实现故障恢复。
- 典型应用：**事件流、订单处理、日志收集、延时任务（配合 score 思路）**。
- 局限：单机无分区，超大规模上 Kafka。

下一章学习用最少的内存做海量布尔统计的 **Bitmap 与 Bitfield**。`
  },
  {
    id: "redis-ch09",
    group: "第二部分 数据结构进阶",
    icon: "🔢",
    title: "第 9 章 Bitmap 与 Bitfield",
    content: `# 第 9 章 Bitmap 与 Bitfield

Bitmap（位图）本质上是 String，但通过位操作把它当成"超长的布尔数组"使用。1 亿个状态只占约 12MB，是做签到、活跃统计、在线状态的内存杀手锏。Bitfield 则支持多字节宽度整数的批量位运算。

## 9.1 SETBIT / GETBIT / BITCOUNT

\`\`\`bash
# SETBIT key offset value（0 或 1）
# 用户 ID 作为 offset，1 表示已签到
127.0.0.1:6379> SETBIT sign:202401 100 1     # 用户 100 在 1 月签到了
(integer) 0
127.0.0.1:6379> SETBIT sign:202401 101 1
(integer) 0
127.0.0.1:6379> SETBIT sign:202401 102 1
(integer) 0

# 查看某用户是否签到
127.0.0.1:6379> GETBIT sign:202401 100
(integer) 1
127.0.0.1:6379> GETBIT sign:202401 999
(integer) 0

# 统计 1 月总签到人数（值为 1 的位数）
127.0.0.1:6379> BITCOUNT sign:202401
(integer) 3
\`\`\`

### BITCOUNT 范围统计

\`\`\`bash
# BITCOUNT key [start end [BYTE|BIT]]
# 统计第 0~99 字节（覆盖用户 0~799）的签到数
127.0.0.1:6379> BITCOUNT sign:202401 0 99 BYTE
(integer) 3

# 统计第 0~7 位（用户 0~7）
127.0.0.1:6379> BITCOUNT sign:202401 0 7 BIT
(integer) 0
\`\`\`

> **内存优势**：用 String 存 1 亿用户签到状态，每个 key 1 字节就是 1 亿字节 ≈ 95MB；用 Bitmap 只占被设置到的最大 offset 决定的字节数，1 亿用户约 12MB。差距近 8 倍。

## 9.2 BITOP 运算

BITOP 对多个 Bitmap 做位运算（AND/OR/XOR/NOT），结果存入目标 key：

\`\`\`bash
# 三天各自的签到 Bitmap
127.0.0.1:6379> SETBIT sign:20240101 100 1
127.0.0.1:6379> SETBIT sign:20240102 100 1
127.0.0.1:6379> SETBIT sign:20240103 100 1
127.0.0.1:6379> SETBIT sign:20240101 101 1
127.0.0.1:6379> SETBIT sign:20240102 101 1

# 三天都签到的用户（AND）
127.0.0.1:6379> BITOP AND sign:3days:all sign:20240101 sign:20240102 sign:20240103
(integer) 13
127.0.0.1:6379> BITCOUNT sign:3days:all
(integer) 1     # 只有用户 100 三天都签了

# 三天任意一天签到（OR）
127.0.0.1:6379> BITOP OR sign:3days:any sign:20240101 sign:20240102 sign:20240103
127.0.0.1:6379> BITCOUNT sign:3days:any
(integer) 2
\`\`\`

| 运算 | 含义 |
| --- | --- |
| \`AND\` | 全为 1 才 1（共同） |
| \`OR\` | 任一为 1 即 1（并集） |
| \`XOR\` | 不同为 1（差异） |
| \`NOT\` | 取反（只能单个 key） |

> **性能注意**：BITOP 是 O(N)，N 是最长 Bitmap 的字节数。1 亿位约 12MB，运算耗时几毫秒，可接受；但别在超大 Bitmap 上高频调用。

## 9.3 BITPOS 查找

BITPOS 找第一个 0 或 1 的位置：

\`\`\`bash
# 第一个值为 1 的位
127.0.0.1:6379> BITPOS sign:202401 1
(integer) 100

# 第一个值为 0 的位（找空位）
127.0.0.1:6379> BITPOS sign:202401 0
(integer) 0

# 在指定字节范围内找
# BITPOS key bit [start [end [BYTE|BIT]]]
127.0.0.1:6379> BITPOS sign:202401 1 13 100 BYTE
(integer) 100
\`\`\`

> **找连续空位**：BITPOS 只能找单个位，找"连续 N 个 0"需应用层循环或用 Bitfield。

## 9.4 BITFIELD 命令

BITFIELD 把 String 当成"多个定宽整数"的容器，支持一次操作多个字段：

\`\`\`bash
# BITFIELD key [GET type offset] [SET type offset value] [INCRBY type offset increment] [OVERFLOW WRAP|SAT|FAIL]
# type: u8 / i16 / u32 等表示无符号/有符号 N 位

# 在 offset 0 存一个 u8（无符号 8 位），offset 8 存一个 i16
127.0.0.1:6379> BITFIELD user:1001:stats SET u8 0 25 SET i16 8 1000
1) (integer) 25
2) (integer) 1000

# 读取
127.0.0.1:6379> BITFIELD user:1001:stats GET u8 0 GET i16 8
1) (integer) 25
2) (integer) 1000

# 原子自增
127.0.0.1:6379> BITFIELD user:1001:stats INCRBY u8 0 1
1) (integer) 26
\`\`\`

### OVERFLOW 溢出策略

\`\`\`bash
# WRAP（默认）：环绕，溢出后从最小值重新开始
127.0.0.1:6379> BITFIELD mynum SET u8 0 250 INCRBY u8 0 10 OVERFLOW WRAP
1) (integer) 4       # 250+10=260，u8 上限 255，环绕到 4

# SAT：饱和，停在最大值
127.0.0.1:6379> BITFIELD mynum SET u8 0 250 INCRBY u8 0 10 OVERFLOW SAT
1) (integer) 255

# FAIL：失败，返回 nil
127.0.0.1:6379> BITFIELD mynum SET u8 0 250 INCRBY u8 0 10 OVERFLOW FAIL
1) (nil)
\`\`\`

> **场景**：用 BITFIELD 把"在线人数、点赞数、评论数"等多个计数器压在一个 String 里，省内存又原子。计数器建议用 \`OVERFLOW SAT\` 或 \`FAIL\` 防止异常回绕。

## 9.5 应用场景：签到 / 活跃用户 / 在线状态

### 场景一：每日签到 + 当月签到天数

\`\`\`bash
# 用户 1001 在 1 月 5 日签到
127.0.0.1:6379> SETBIT sign:1001:202401 4 1     # offset 是"日-1"
127.0.0.1:6379> SETBIT sign:1001:202401 9 1     # 10 号
127.0.0.1:6379> SETBIT sign:1001:202401 14 1    # 15 号

# 当月签到天数
127.0.0.1:6379> BITCOUNT sign:1001:202401
(integer) 3

# 是否某天签到
127.0.0.1:6379> GETBIT sign:1001:202401 4
(integer) 1
\`\`\`

> **offset 用"日-1"**：1 号对应 offset 0，避免浪费第 0 位。

### 场景二：日活统计（全局）

\`\`\`bash
# 用户 ID 作为 offset
127.0.0.1:6379> SETBIT active:20240101 1001 1
127.0.0.1:6379> SETBIT active:20240101 1002 1
127.0.0.1:6379> SETBIT active:20240102 1001 1

# 今日 DAU
127.0.0.1:6379> BITCOUNT active:20240101
(integer) 2

# 连续 3 天活跃用户（AND）
127.0.0.1:6379> BITOP AND active:3days active:20240101 active:20240102 active:20240103
127.0.0.1:6379> BITCOUNT active:3days
\`\`\`

### 场景三：用户在线状态

\`\`\`bash
# 用户上线设置位
127.0.0.1:6379> SETBIT online 1001 1
# 下线清除
127.0.0.1:6379> SETBIT online 1001 0

# 当前在线总数
127.0.0.1:6379> BITCOUNT online
(integer) 1

# 判断用户是否在线
127.0.0.1:6379> GETBIT online 1001
(integer) 1
\`\`\`

> **前提**：用户 ID 必须是**连续整数**且**不太大**（< 1 亿最佳）。ID 是 UUID 的场景要先做映射或改用 Set。

## 9.6 踩坑提示

- **offset 过大占用内存**：\`SETBIT k 1000000000 1\` 会立即分配约 125MB，哪怕只设了 1 位。offset 控制在合理范围。
- **BITOP 覆盖目标 key**：结果 key 会清空原内容，且不会自动设过期。
- **BITCOUNT 性能**：在 GB 级 Bitmap 上是 O(N) 秒级操作，避免高频调用，可用 HyperLogLog 近似替代。
- **BITFIELD 字节序**：offset 是**位**偏移，计算多字段时注意对齐，建议用 BYTE 类型思考。
- **用户 ID 必须是整数且稠密**：稀疏 ID（如最大 10 亿但实际 1 万用户）会浪费巨大内存。
- **GETBIT 不存在返回 0**：无法区分"未签到"和"位被显式设为 0"，业务上等同处理即可。
- **BITFIELD OVERFLOW 默认 WRAP**：计数器场景务必显式指定 SAT/FAIL，防止回绕导致数据错乱。

## 9.7 本章小结

- Bitmap 本质是 String，按位操作，1 亿状态约 12MB，极省内存。
- SETBIT/GETBIT 设与读单位，BITCOUNT 统计 1 的个数，支持 BYTE/BIT 范围。
- BITOP 做 AND/OR/XOR/NOT 运算，求"共同活跃""任意活跃"。
- BITPOS 找首个 0/1，常用于找空位。
- BITFIELD 支持多定宽整数，INCRBY + OVERFLOW 实现紧凑计数器。
- 典型应用：**签到、日活统计、连续活跃、在线状态、紧凑多计数器**。
- 前提：ID 稠密且连续；offset 别过大。

下一章看 Redis 如何处理**地理位置**——附近的人、门店搜索。`
  },
  {
    id: "redis-ch10",
    group: "第二部分 数据结构进阶",
    icon: "🌍",
    title: "第 10 章 Geo 地理空间",
    content: `# 第 10 章 Geo 地理空间

Geo 是 Redis 3.2 引入的地理空间功能，底层基于 ZSet + GeoHash 算法，支持存经纬度、算距离、按半径查询。LBS（Location-Based Service）场景如"附近的人""附近的门店"无需引入专门的数据库即可实现。

## 10.1 GEOADD / GEODIST

\`\`\`bash
# GEOADD key longitude latitude member ...
# 经度范围 [-180, 180]，纬度 [-85.05, 85.05]
# 添加几个门店（北京天安门附近）
127.0.0.1:6379> GEOADD stores 116.397 39.908 "shop-A" 116.405 39.915 "shop-B" 116.390 39.900 "shop-C"
(integer) 3

# 计算两点距离
# GEODIST key member1 member2 [m|km|mi|ft]
127.0.0.1:6379> GEODIST stores shop-A shop-B m
"857.7863"
127.0.0.1:6379> GEODIST stores shop-A shop-C km
"0.6378"
\`\`\`

> **底层原理**：Geo 用 GeoHash 把二维经纬度编码成一维 52 位整数，作为 ZSet 的 score 存入。member 就是 ZSet 的 member。所以 GEO 的 key **本质是 ZSet**，能用 ZRANGE 等命令（但语义不对，别用）。

### GEOADD 的选项（6.2+）

\`\`\`bash
# NX：只新增，已存在的不更新
127.0.0.1:6379> GEOADD stores NX 116.397 39.908 "shop-A"
(integer) 0
# XX：只更新已存在的
127.0.0.1:6379> GEOADD stores XX CH 116.410 39.920 "shop-A"
(integer) 1
# CH：返回值改为"被改变的成员数"（含更新）
\`\`\`

## 10.2 GEOHASH

GEOHASH 返回成员的 GeoHash 字符串，方便传给前端或第三方地图：

\`\`\`bash
# 返回标准 GeoHash 字符串
127.0.0.1:6379> GEOHASH stores shop-A shop-B
1) "wx4g0"
2) "wx4g0"

# 指定返回的字符数（默认 11，越多越精确）
127.0.0.1:6379> GEOHASH stores shop-A
1) "wx4g0bgb0s00"
\`\`\`

> **GeoHash 字符串**：每个字符代表一个区域，相同前缀越长说明两点越接近。可在外部用前缀做粗粒度聚合。

### GEOPOS：取出经纬度

\`\`\`bash
127.0.0.1:6379> GEOPOS stores shop-A
1) 1) "116.39700037240982056"
   2) "39.90799991898214264"

# 不存在的 member 返回 nil
127.0.0.1:6379> GEOPOS stores shop-X
1) (nil)
\`\`\`

> **精度损失**：GeoHash 编解码有微小精度损失（约 0.1 米级），对绝大多数 LBS 场景无影响，精密测量慎用。

## 10.3 GEORADIUS / GEOSEARCH（Redis 6.2+）

### GEORADIUS（已废弃，6.2 起用 GEOSEARCH）

\`\`\`bash
# 以 (116.397, 39.908) 为中心，半径 1 公里内的门店
127.0.0.1:6379> GEORADIUS stores 116.397 39.908 1 km WITHDIST WITHCOORD COUNT 10
1) 1) "shop-A"
   2) "0.0001"
   3) 1) "116.39700037240982056"
      2) "39.90799991898214264"
2) 1) "shop-C"
   2) "0.6378"
   3) 1) "116.39000040292739868"
      2) "39.89999997327626805"
\`\`\`

> ⚠️ **GEORADIUS 在 6.2 被标记废弃**，原因：命令名不统一、参数顺序反人类。新代码必须用 GEOSEARCH。

### GEOSEARCH（推荐，6.2+）

GEOSEARCH 用 FROMMEMBER/FROMLONLAT 指定中心，BYRADIUS/BYBOX 指定范围，更清晰：

\`\`\`bash
# 以 shop-A 为中心，1 公里内
127.0.0.1:6379> GEOSEARCH stores FROMMEMBER shop-A BYRADIUS 1 km WITHDIST WITHCOORD WITHHASH COUNT 10
1) 1) "shop-A"
   2) "0.0000"
   3) (integer) 4069938470933488
   4) 1) "116.39700037240982056"
      2) "39.90799991898214264"
2) 1) "shop-C"
   2) "0.6378"
   ...

# 以经纬度为中心
127.0.0.1:6379> GEOSEARCH stores FROMLONLAT 116.397 39.908 BYRADIUS 500 m

# 按矩形范围查（宽 2km 高 1km）
127.0.0.1:6379> GEOSEARCH stores FROMLONLAT 116.397 39.908 BYBOX 2 1 km

# ASC/DESC 排序，COUNT 限制
127.0.0.1:6379> GEOSEARCH stores FROMMEMBER shop-A BYRADIUS 5 km ASC COUNT 3
\`\`\`

### 选项汇总

| 选项 | 含义 |
| --- | --- |
| \`FROMMEMBER m\` | 以成员 m 为中心 |
| \`FROMLONLAT lon lat\` | 以经纬度为中心 |
| \`BYRADIUS r m\|km\|...\` | 圆形范围 |
| \`BYBOX w h m\|km\|...\` | 矩形范围 |
| \`WITHDIST\` | 返回距离 |
| \`WITHCOORD\` | 返回经纬度 |
| \`WITHHASH\` | 返回 GeoHash 整数 |
| \`ASC\` / \`DESC\` | 按距离排序 |
| \`COUNT n [ANY]\` | 限制条数（ANY 表示不必精确，更快） |

### GEOSEARCHSTORE：结果存到新 key

\`\`\`bash
# 把搜索结果存到 nearby key（本质是个 ZSet，可继续 ZRANGE）
127.0.0.1:6379> GEOSEARCHSTORE nearby FROMMEMBER shop-A BYRADIUS 1 km ASC COUNT 10
(integer) 2
\`\`\`

## 10.4 应用场景：附近的人 / 门店搜索

### 场景一：附近的门店

\`\`\`bash
# 1. 门店上线时写入位置
127.0.0.1:6379> GEOADD stores 116.397 39.908 "shop:1001"
127.0.0.1:6379> GEOADD stores 116.405 39.915 "shop:1002"

# 2. 用户请求"附近 3 公里的店"
127.0.0.1:6379> GEOSEARCH stores FROMLONLAT 116.400 39.910 BYRADIUS 3 km WITHDIST ASC COUNT 20

# 3. 门店搬家更新位置（用 XX CH）
127.0.0.1:6379> GEOADD stores XX CH 116.412 39.918 "shop:1001"
\`\`\`

### 场景二：附近的人

\`\`\`bash
# 用户上报位置（定时刷新）
127.0.0.1:6379> GEOADD nearby:users 116.397 39.908 "user:1001"
127.0.0.1:6379> GEOADD nearby:users 116.398 39.909 "user:1002"

# 找 1 公里内的其他用户
127.0.0.1:6379> GEOSEARCH nearby:users FROMMEMBER user:1001 BYRADIUS 1 km ASC COUNT 50

# 用户下线移除
127.0.0.1:6379> ZREM nearby:users "user:1001"
\`\`\`

> **本质是 ZSet**：所以删除用 \`ZREM\`，统计数量用 \`ZCARD\`，遍历用 \`ZRANGE\`（但返回的是 member，没有经纬度）。

### 场景三：通勤距离计算

\`\`\`bash
# 存家和公司位置
127.0.0.1:6379> GEOADD places 116.397 39.908 "home" 116.487 39.948 "office"

# 算通勤距离
127.0.0.1:6379> GEODIST places home office km
"8.4567"
\`\`\`

## 10.5 踩坑提示

- **经纬度顺序**：Redis 命令是 **经度在前、纬度在后**（lon, lat），但很多 API（如高德）是纬度在前，传参时务必对齐。
- **GEORADIUS 已废弃**：6.2+ 用 GEOSEARCH，老代码升级时替换。
- **Geo 是 ZSet**：能用 ZREM/ZCARD，但别用 ZADD（要算 GeoHash），否则破坏数据。
- **极地精度差**：纬度接近 ±85° 时 GeoHash 误差大，南极北极场景不适合。
- **范围查询非精确**：GeoHash 是网格近似，边界点可能漏判或多判，业务侧可二次过滤。
- **member 唯一**：同一个 key 下 member 唯一，重复 GEOADD 同一 member 会更新位置。
- **大 key 风险**：所有门店塞一个 Geo key，元素百万级时 GEOSEARCH 仍是 O(N+logM)，可按城市分桶（\`stores:beijing\`、\`stores:shanghai\`）。

## 10.6 本章小结

- Geo 底层是 ZSet + GeoHash，存经纬度、算距离、按半径/矩形查询。
- GEOADD 写入（lon, lat, member），GEODIST 算距离，GEOPOS 取坐标，GEOHASH 取编码串。
- GEORADIUS 6.2 起废弃，**GEOSEARCH** 是新标准，FROMMEMBER/FROMLONLAT + BYRADIUS/BYBOX 更清晰。
- WITHDIST/WITHCOORD/WITHHASH/ASC/COUNT 提供富查询，GEOSEARCHSTORE 固化结果。
- 典型应用：**附近门店、附近的人、距离计算、LBS 推荐**。
- 注意经纬度顺序、按城市分桶、极地精度差。

下一章学习用 12KB 内存统计 1 亿 UV 的**近似算法 HyperLogLog**，以及布隆过滤器等扩展结构。`
  },
  {
    id: "redis-ch11",
    group: "第二部分 数据结构进阶",
    icon: "🔧",
    title: "第 11 章 HyperLogLog 与其他结构",
    content: `# 第 11 章 HyperLogLog 与其他结构

本章收尾"数据结构进阶"部分，介绍三类"省内存利器"：HyperLogLog 做基数去重、布隆过滤器做存在性判断、布谷鸟过滤器做可删除的近似集合。它们用极小内存解决海量数据场景。

## 11.1 PFADD / PFCOUNT / PFMERGE

HyperLogLog（HLL）是 Redis 2.8.9 引入的**基数估算**算法，固定占用约 **12KB**，标准误差约 **0.81%**。

\`\`\`bash
# PFADD key element...
# 添加访问用户（重复会自动去重）
127.0.0.1:6379> PFADD page:home:uv user1 user2 user3 user4
(integer) 1
127.0.0.1:6379> PFADD page:home:uv user1 user2 user5
(integer) 0     # 没增加新基数，返回 0

# 估算基数（去重后的数量）
127.0.0.1:6379> PFCOUNT page:home:uv
(integer) 5
\`\`\`

### PFMERGE：合并多个 HLL

\`\`\`bash
# 一周的 UV 合并成月 UV
127.0.0.1:6379> PFADD uv:20240101 u1 u2 u3
127.0.0.1:6379> PFADD uv:20240102 u2 u3 u4
127.0.0.1:6379> PFMERGE uv:202401 uv:20240101 uv:20240102
OK
127.0.0.1:6379> PFCOUNT uv:202401
(integer) 4    # u1 u2 u3 u4 去重后 4 个
\`\`\`

> **HLL vs Set vs Bitmap 对比**：

| 方案 | 1 亿 UV 内存 | 精确 | 能否取具体元素 |
| --- | --- | --- | --- |
| **Set** | ~1.5GB | 精确 | 能 |
| **Bitmap** | ~12MB | 精确 | 能（按位） |
| **HyperLogLog** | **12KB** | **近似（误差 0.81%）** | **不能** |

> **选型**：要精确且能取元素用 Set/Bitmap；只要总数、能接受误差用 HLL，省 10 万倍内存。

## 11.2 基数统计的应用

### 场景一：网站 UV

\`\`\`bash
# 每日 UV
127.0.0.1:6379> PFADD site:uv:20240101 user-A
127.0.0.1:6379> PFADD site:uv:20240101 user-B
127.0.0.1:6379> PFCOUNT site:uv:20240101
(integer) 2

# 月度 UV（合并每日）
127.0.0.1:6379> PFMERGE site:uv:202401 site:uv:20240101 site:uv:20240102 ... site:uv:20240131
127.0.0.1:6379> PFCOUNT site:uv:202401
\`\`\`

### 场景二：搜索热词独立用户数

\`\`\`bash
# 每个搜索词记录独立搜索用户
127.0.0.1:6379> PFADD search:redis user1 user2
127.0.0.1:6379> PFADD search:redis user3
127.0.0.1:6379> PFCOUNT search:redis
(integer) 3

# 看哪些词最热门（用 ZSet 排序 HLL 的 PFCOUNT）
\`\`\`

> **HLL 的限制**：① 只能估"多少个"，不能告诉你"是不是某元素"；② 单 key 12KB，key 数量多时仍需关注总量；③ PFCOUNT 在大 HLL 上是 O(1) 但有常数开销，别高频调用。

## 11.3 布隆过滤器（RedisBloom 模块）

布隆过滤器（Bloom Filter）是**存在性判断**的近似数据结构：能告诉你"肯定不在"或"可能在"，不会漏报但可能误报。

> Redis 核心不内置 Bloom Filter，需要 **RedisBloom 模块**。Docker 启动：\`docker run -p 6379:6379 redis/redis-stack:latest\`。

\`\`\`bash
# 创建一个容量 10000、误判率 0.1% 的过滤器
127.0.0.1:6379> BF.RESERVE filter:emails 0.001 10000
OK

# 添加元素
127.0.0.1:6379> BF.ADD filter:emails "a@b.com"
(integer) 1
127.0.0.1:6379> BF.MADD filter:emails "c@d.com" "e@f.com"
1) (integer) 1
2) (integer) 1

# 判断是否存在（1 可能存在，0 肯定不存在）
127.0.0.1:6379> BF.EXISTS filter:emails "a@b.com"
(integer) 1
127.0.0.1:6379> BF.EXISTS filter:emails "x@y.com"
(integer) 0

# 批量判断
127.0.0.1:6379> BF.MEXISTS filter:emails "a@b.com" "x@y.com"
1) (integer) 1
2) (integer) 0
\`\`\`

### 原理简述

布隆过滤器用 k 个哈希函数把元素映射到 m 位的位数组上，多个位置置 1。查询时所有对应位都为 1 才返回"可能存在"。

| 参数 | 关系 |
| --- | --- |
| 容量 n | 预期元素数 |
| 误判率 p | 越小越准，但占内存越多 |
| 位数 m | m = -(n * ln p) / (ln 2)^2 |
| 哈希函数数 k | k = (m/n) * ln 2 |

> **内存对比**：1 亿元素、0.1% 误判率，Bloom 约 180MB，远小于 Set 的数 GB。

### 应用：缓存穿透防护

\`\`\`bash
# 启动时把数据库所有用户 ID 灌入布隆过滤器
# 查询时先过 BF.EXISTS：
#   0 -> 直接返回，不打数据库（拦截非法 ID）
#   1 -> 查缓存/数据库

127.0.0.1:6379> BF.EXISTS filter:userids 999999999
(integer) 0      # 肯定不存在，直接拒绝
\`\`\`

> **缓存穿透**：攻击者用大量不存在的 ID 查询，绕过缓存打数据库。布隆过滤器是经典防线。

## 11.4 布谷鸟过滤器

布谷鸟过滤器（Cuckoo Filter）是 Bloom 的升级版，**支持删除**，且在低误判率下内存更省：

\`\`\`bash
# 创建（RedisBloom 模块）
127.0.0.1:6379> CF.RESERVE filter:tags 10000
OK

# 添加
127.0.0.1:6379> CF.ADD filter:tags "redis"
(integer) 1
127.0.0.1:6379> CF.ADD filter:tags "cache"

# 判断
127.0.0.1:6379> CF.EXISTS filter:tags "redis"
(integer) 1

# 删除（Bloom 做不到！）
127.0.0.1:6379> CF.DEL filter:tags "redis"
(integer) 1
127.0.0.1:6379> CF.EXISTS filter:tags "redis"
(integer) 0
\`\`\`

### Bloom vs Cuckoo

| 维度 | Bloom Filter | Cuckoo Filter |
| --- | --- | --- |
| 是否支持删除 | ❌ | ✅ |
| 误判率相同时内存 | 较大 | 较小（高误判率下相反） |
| 查询性能 | k 次哈希 | 2 次 |
| 实现复杂度 | 简单 | 较复杂 |
| 接近上限时性能 | 稳定 | 插入可能失败 |

> **选型**：需要删除用 Cuckoo；只增不删、追求稳定用 Bloom。

> **Bloom 不能删的原因**：多个元素可能共享同一位，删一个会影响其他元素。

## 11.5 应用场景：UV 统计 / 去重

### 综合场景：新闻 APP 的数据统计

\`\`\`bash
# 1. 文章 UV（HLL，只关心总数）
127.0.0.1:6379> PFADD article:1001:uv user1 user2 user3
127.0.0.1:6379> PFCOUNT article:1001:uv
(integer) 3

# 2. 已读用户判断（Bloom，防穿透 + 省内存）
127.0.0.1:6379> BF.ADD article:1001:readers user1
127.0.0.1:6379> BF.EXISTS article:1001:readers user2
(integer) 0    # 肯定没读过

# 3. 推送去重（Cuckoo，可撤销）
127.0.0.1:6379> CF.ADD push:user:1001 "news-20240101"
127.0.0.1:6379> CF.EXISTS push:user:1001 "news-20240101"
(integer) 1    # 已推送过，不再推
# 用户取消订阅后可删除
127.0.0.1:6379> CF.DEL push:user:1001 "news-20240101"
\`\`\`

### 场景：爬虫 URL 去重

\`\`\`bash
# 海量 URL 用 Bloom 去重，避免重复抓取
127.0.0.1:6379> BF.ADD crawler:visited "https://example.com/a"
127.0.0.1:6379> BF.EXISTS crawler:visited "https://example.com/a"
(integer) 1    # 已抓过，跳过
\`\`\`

## 11.6 踩坑提示

- **HLL 不能取元素**：只能告诉你"大约 N 个"，不能问"X 在不在"。要判断存在性用 Bloom/Cuckoo。
- **HLL 误差**：标准 0.81%，少数场景下会偏差更大；要精确用 Bitmap（ID 稠密时）。
- **PFADD 重复返回 0**：不代表"元素之前就在"，只代表"基数没变"。多次 PFADD 同一元素行为相同。
- **Bloom 不能删**：要可删除场景用 Cuckoo，或用"计数布隆过滤器"。
- **Bloom 误判率设置**：\`BF.RESERVE\` 时要预留容量，超容量后误判率急剧上升。
- **RedisBloom 是模块**：自建 Redis 默认没装，用 \`redis-stack\` 镜像或编译加载模块。
- **Cuckoo 接近上限插入失败**：\`CF.ADD\` 在过滤器满时会返回 0，要监控容量。
- **HLL 合并不精确**：PFMERGE 多个 HLL 误差会累积，月度 UV 比每日 UV 之和更准（直接用日 HLL 合并）。

## 11.7 本章小结

- HyperLogLog：12KB 固定内存估算基数，误差 0.81%，PFADD/PFCOUNT/PFMERGE 三件套，**只知多少不知是谁**。
- Bloom Filter：存在性判断，"肯定不在"或"可能在"，BF.RESERVE/ADD/EXISTS，**不能删除**，需 RedisBloom 模块。
- Cuckoo Filter：Bloom 升级版，**支持删除**，CF.ADD/EXISTS/DEL，低误判率下更省内存。
- 选型口诀：**要总数用 HLL，要存在性只增不删用 Bloom，要可删除用 Cuckoo**。
- 典型应用：**UV 统计、缓存穿透防护、爬虫去重、推送去重、已读判断**。
- 内存优化思维：近似算法换内存，是 Redis 处理海量数据的核心思路。

第二部分"数据结构进阶"结束。第三部分进入**持久化与过期策略**——RDB、AOF、内存淘汰，搞懂数据安全和内存管理。`
  }
];

export { chapters };
