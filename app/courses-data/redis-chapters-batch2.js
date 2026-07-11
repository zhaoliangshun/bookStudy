// =============================================================
// 《Redis 实战教程》- 章节批次 2
// -------------------------------------------------------------
// 内容：第二部分 数据结构进阶（第 6-11 章）
// =============================================================

const chapters = [
  {
    id: "redis-ch06",
    group: "第二部分 数据结构进阶",
    icon: "📦",
    title: "第 6 章 Set 集合",
    content: `# 第 6 章 Set 集合

Set（集合）是 Redis 的无序、不重复字符串集合。它的核心价值在于**集合运算**——交集、并集、差集，让 Redis 能直接在服务端处理"共同好友""标签匹配""唯一访问"这类关系型问题，无需把数据搬到应用层做内存运算。

## 6.1 概述与底层编码

Set 的两条设计信条：**元素唯一**、**无序**。这两个特性决定了它适合"去重"和"关系运算"，但不适合需要按插入顺序或按分数访问的场景（那是 List 和 ZSet 的活）。

### 两种底层编码

Redis 会根据集合的内容和规模，自动在两种编码间切换：

| 编码 | 触发条件 | 数据结构 | 特点 |
| --- | --- | --- | --- |
| **intset** | 全部元素都是整数 **且** 元素数 <= \`set-max-intset-entries\`（默认 512） | 紧凑整数数组 | 内存极省，查找 O(log N) 二分 |
| **hashtable** | 含非整数元素，或元素数超阈值 | 哈希表 | 查找 O(1)，内存占用较高 |

\`\`\`bash
# 纯整数集合 -> intset
127.0.0.1:6379> SADD nums 1 2 3
(integer) 3
127.0.0.1:6379> OBJECT ENCODING nums
"intset"

# 加入非整数 -> 升级为 hashtable
127.0.0.1:6379> SADD nums hello
(integer) 1
127.0.0.1:6379> OBJECT ENCODING nums
"hashtable"
\`\`\`

> **编码升级不可逆**：intset 升级为 hashtable 后，即使删掉非整数元素也不会回退。生产中若想保持 intset，建 key 时就只放整数，且控制元素数。
>
> **intset 的优势**：连续内存、无指针开销，存 1 万个整数约 40KB，hashtable 同样数据约 200KB+。

## 6.2 SADD / SREM / SMEMBERS

\`\`\`bash
# SADD key member [member ...]
# 添加元素（已存在的会被忽略，返回"新增"个数）
127.0.0.1:6379> SADD tags:1001 redis cache nosql
(integer) 3
127.0.0.1:6379> SADD tags:1001 redis        # 重复，不增加
(integer) 0

# SREM key member [member ...]
# 删除指定元素，返回"实际删除"个数
127.0.0.1:6379> SREM tags:1001 cache mysql
(integer) 1     # cache 删成功，mysql 不存在

# SMEMBERS key
# 查看所有元素（无序，大集合慎用）
127.0.0.1:6379> SMEMBERS tags:1001
1) "nosql"
2) "redis"
\`\`\`

> **性能特征**：SADD / SREM / SMEMBERS 单元素操作都是 **O(1)**（hashtable 下）。SMEMBERS 整体是 O(N)，N 是集合大小。

## 6.3 SISMEMBER / SCARD

\`\`\`bash
# SISMEMBER key member
# 判断元素是否在集合中（1 在，0 不在），O(1)
127.0.0.1:6379> SISMEMBER tags:1001 redis
(integer) 1
127.0.0.1:6379> SISMEMBER tags:1001 mysql
(integer) 0

# SCARD key
# 返回集合元素个数，O(1)
127.0.0.1:6379> SCARD tags:1001
(integer) 2
\`\`\`

> **Set 相比 List 的最大优势**：判断"是否存在"是 O(1)。List 的 LPOS 是 O(N)，所以去重场景永远用 Set 不用 List。

## 6.4 SRANDMEMBER / SPOP

### SRANDMEMBER：随机返回不移除

\`\`\`bash
127.0.0.1:6379> SADD pool a b c d e
(integer) 5

# SRANDMEMBER key [count]
# 不传 count 默认返回 1 个
127.0.0.1:6379> SRANDMEMBER pool
"b"

# 正数 count：返回最多 count 个，可能重复
127.0.0.1:6379> SRANDMEMBER pool 3
1) "a"
2) "c"
3) "a"

# 负数 count：返回 |count| 个，绝不重复
127.0.0.1:6379> SRANDMEMBER pool -3
1) "e"
2) "b"
3) "d"

# 0 返回空数组
127.0.0.1:6379> SRANDMEMBER pool 0
(empty array)
\`\`\`

### SRANDMEMBER 的 count 参数语义

| count | 行为 | 适用场景 |
| --- | --- | --- |
| 正数 | 返回最多 count 个，**可能重复** | 允许重复的抽样 |
| 负数 | 返回 \|count\| 个，**绝不重复** | 不重复抽奖 |
| 0 | 返回空数组 | —— |
| 不传 | 返回 1 个字符串（非数组） | 随机取一个 |

### SPOP：随机弹出并移除

\`\`\`bash
# SPOP key [count]
# 弹出 1 个（默认）
127.0.0.1:6379> SPOP pool
"c"
127.0.0.1:6379> SCARD pool
(integer) 4

# 弹出多个
127.0.0.1:6379> SPOP pool 2
1) "a"
2) "e"
\`\`\`

> **抽奖场景**：抽 1 个一等奖用 \`SPOP\`（抽走不再中）；抽 3 个参与奖用 \`SRANDMEMBER -3\`（允许同人不重复，但不移除）。

## 6.5 SSCAN 游标遍历

大集合绝对不要用 \`SMEMBERS\`，它一次性返回全部元素会阻塞主线程。用 \`SSCAN\` 游标式分批遍历：

\`\`\`bash
# SSCAN key cursor [MATCH pattern] [COUNT count]
127.0.0.1:6379> SADD bigset u1 u2 u3 u4 u5 u6 u7 u8 u9 u10
(integer) 10

# cursor=0 开始，每次建议取 10 条（COUNT 只是建议，不保证精确）
127.0.0.1:6379> SSCAN bigset 0 COUNT 10
1) "0"               # 返回 0 表示遍历结束
2) 1) "u1"
   2) "u2"
   3) "u3"
   4) "u4"
   5) "u5"
   6) "u6"
   7) "u7"
   8) "u8"
   9) "u9"
   10) "u10"

# MATCH 模式过滤
127.0.0.1:6379> SSCAN bigset 0 MATCH u1*
1) "0"
2) 1) "u1"
   2) "u10"
\`\`\`

> **SSCAN 注意点**：① COUNT 只是"建议"，实际返回可能多可能少；② MATCH 是对结果过滤而非扫描前过滤；③ 保证最终一致性——遍历期间被修改的元素可能重复或遗漏，但不会出错。

## 6.6 集合运算：SINTER / SUNION / SDIFF

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

### 差集 SDIFF（前者有、后者无，顺序敏感！）

\`\`\`bash
# user:1 有但 user:2 没有的
127.0.0.1:6379> SDIFF user:1:tags user:2:tags
1) "mysql"

# 反过来：user:2 有但 user:1 没有的
127.0.0.1:6379> SDIFF user:2:tags user:1:tags
1) "go"
\`\`\`

> **差集方向**：\`SDIFF A B\` 是"A 中有但 B 中无"，**顺序敏感**！\`SDIFF A B\` 和 \`SDIFF B A\` 结果完全不同。多 key 时是 \`A - B - C - ...\`。

### SINTERCARD（7.0+，只返回数量）

\`\`\`bash
# SINTERCARD numkeys key [key ...] [LIMIT limit]
# 第一个参数是 key 的数量
127.0.0.1:6379> SINTERCARD 2 user:1:tags user:2:tags
(integer) 2

# LIMIT 达到上限即终止，省算力
127.0.0.1:6379> SINTERCARD 2 user:1:tags user:2:tags LIMIT 1
(integer) 1
\`\`\`

> **SINTERCARD 的价值**：只关心"有没有交集"或"交集多大"时，不传输元素，省网络带宽。LIMIT 1 等价于"判断是否相交"。

### SMOVE：在集合间移动元素

\`\`\`bash
# SMOVE source destination member
127.0.0.1:6379> SADD set1 a b c
127.0.0.1:6379> SMOVE set1 set2 b
(integer) 1
127.0.0.1:6379> SMEMBERS set1
1) "a"
2) "c"
127.0.0.1:6379> SMEMBERS set2
1) "b"
\`\`\`

> SMOVE 是原子的，适合"从一个分组移到另一个分组"的场景。

## 6.7 存储版：SINTERSTORE / SUNIONSTORE / SDIFFSTORE

交集/并集/差集的结果可以直接存到一个新 key，免去应用层中转：

\`\`\`bash
# SINTERSTORE destination key [key ...]
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

> **存储版的应用**：把计算结果固化下来，避免每次重算。但要注意：① 目标 key 会**覆盖**原有内容；② 需自己设过期；③ 多次运算会覆盖，注意 destination 命名。

## 6.8 应用场景

### 场景一：文章标签双向索引

\`\`\`bash
# 文章 -> 标签（正向）
127.0.0.1:6379> SADD article:1001:tags redis cache nosql
(integer) 3

# 标签 -> 文章（反向索引，方便按标签查文章）
127.0.0.1:6379> SADD tag:redis:articles 1001 1002 1003
127.0.0.1:6379> SADD tag:cache:articles 1001 1004
127.0.0.1:6379> SADD tag:nosql:articles 1001 1005

# 查"同时有 redis 和 cache 标签的文章"（交集）
127.0.0.1:6379> SINTER tag:redis:articles tag:cache:articles
1) "1001"

# 查"有 redis 或 cache 标签的文章"（并集）
127.0.0.1:6379> SUNION tag:redis:articles tag:cache:articles
1) "1001"
2) "1002"
3) "1003"
4) "1004"
\`\`\`

### 场景二：共同好友与可能认识的人

\`\`\`bash
127.0.0.1:6379> SADD user:1:friends 2 3 4 5
127.0.0.1:6379> SADD user:6:friends 3 4 7 8

# 共同好友（交集）
127.0.0.1:6379> SINTER user:1:friends user:6:friends
1) "3"
2) "4"

# 我可能认识的人 = 对方好友 - 我的好友
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

### 场景五：唯一访客标签筛选

\`\`\`bash
# 多个页面的 UV 集合，做"同时访问过 A 和 B 的用户"
127.0.0.1:6379> SADD page:A:uv u1 u2 u3 u4
127.0.0.1:6379> SADD page:B:uv u2 u3 u5
127.0.0.1:6379> SINTER page:A:uv page:B:uv
1) "u2"
2) "u3"
\`\`\`

## 6.9 踩坑提示

- **SMEMBERS 阻塞**：大集合一次性返回会阻塞主线程，线上只判断存在性用 SISMEMBER，遍历用 SSCAN，统计数量用 SCARD。
- **集合运算的复杂度**：SINTER/SUNION/SDIFF 是 O(N*M)，N 是最小集合大小，M 是集合数。**参与运算的最小集合别太大**，几千以内最佳。
- **SPOP 随机性**：Redis 的 SPOP 在大集合上是近似随机（3.2+ 用更快算法），对小集合是精确随机。
- **SRANDMEMBER 正负数语义不同**：正数允许重复返回，负数绝不重复，新人最易混淆。
- **存储版会覆盖目标 key**：SINTERSTORE 目标 key 若存在会被清空重写，且不会自动过期。
- **Set 无序**：不能依赖 SMEMBERS 的返回顺序，需要排序请用 ZSet。
- **intset 升级不可逆**：一旦因为加入非整数元素升级为 hashtable，删掉该元素也不会回退。
- **大 key 风险**：单个 Set 上百万元素时，SPOP/SMEMBERS 仍有风险，考虑按业务分桶。

## 6.10 本章小结

- Set 是无序、不重复集合，底层 intset（纯整数小集合）或 hashtable。
- SADD/SREM/SMEMBERS/SISMEMBER/SCARD 是日常五件套，单元素操作 O(1)。
- SREM/SPOP/SRANDMEMBER 提供删除与随机抽样，SRANDMEMBER 的正负数语义不同。
- **集合运算**是 Set 的灵魂：SINTER 交集、SUNION 并集、SDIFF 差集（顺序敏感）。
- SINTERCARD（7.0+）只返回数量，省网络；SINTERSTORE 等存储版固化结果。
- SSCAN 游标遍历大集合，避免 SMEMBERS 阻塞。
- 典型应用：**标签双向索引、共同好友、抽奖、小规模 UV、可能认识的人**。
- 性能要点：SADD/SISMEMBER O(1)；集合运算 O(N*M)，控制参与集合规模。

下一章学习 Redis 最经典的结构——**ZSet 有序集合**，排行榜、延时队列全靠它。`
  },
  {
    id: "redis-ch07",
    group: "第二部分 数据结构进阶",
    icon: "🏆",
    title: "第 7 章 ZSet 有序集合",
    content: `# 第 7 章 ZSet 有序集合

ZSet（Sorted Set，有序集合）在 Set 基础上给每个元素关联一个 **score（分数）**，并按分数自动排序。它是 Redis 中最优雅、应用最广的结构之一——排行榜、延时队列、带权重的消息分发、滑动窗口限流都靠它。

## 7.1 概述与底层编码

ZSet = Set + score。每个元素唯一，且关联一个 double 类型的分数，Redis 内部自动按分数排序。

### 两种底层编码

| 编码 | 触发条件 | 数据结构 | 特点 |
| --- | --- | --- | --- |
| **ziplist**（7.0 前）/ **listpack**（7.0+） | 元素数 <= \`zset-max-ziplist-entries\`（默认 128）**且** 单元素 <= \`zset-max-ziplist-value\`（默认 64 字节） | 紧凑列表，交替存 member+score | 内存极省，小集合查找 O(N) |
| **skiplist** | 元素数超阈值，或单元素过长 | 跳表 + 哈希表 | 查找/插入 O(log N)，内存较高 |

\`\`\`bash
127.0.0.1:6379> ZADD small 1 a 2 b
(integer) 2
127.0.0.1:6379> OBJECT ENCODING small
"listpack"

127.0.0.1:6379> ZADD big 1 a 2 b 3 c 4 d 5 e 6 f 7 g 8 h 9 i 10 j
127.0.0.1:6379> OBJECT ENCODING big
"skiplist"
\`\`\`

> **为什么用跳表不用红黑树？** ① 跳表实现更简单；② 范围查询（ZRANGEBYSCORE）跳表天然支持，红黑树需中序遍历；③ 跳表通过调参可灵活平衡内存与速度。
>
> **双结构优势**：skiplist 编码下同时维护跳表（按分数排序）和哈希表（member -> score），所以 ZSCORE 是 O(1)，ZRANK 是 O(log N)。

## 7.2 ZADD 及选项

\`\`\`bash
# ZADD key [NX|XX] [GT|LT] [CH] [INCR] score member [score member ...]
127.0.0.1:6379> ZADD leaderboard 100 alice 90 bob 85 carol 70 dave
(integer) 4
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
# 只在分数更高时更新（防止回退，如只记录最高分）
127.0.0.1:6379> ZADD leaderboard GT 80 dave
(integer) 0       # 80 < 70? 不对，dave 当前 70，80>70 更新成功，返回 0 因为只更新不算新增
127.0.0.1:6379> ZADD leaderboard GT 75 dave    # 75 < 80，不更新
(integer) 0

# NX：只新增不更新
127.0.0.1:6379> ZADD leaderboard NX 200 alice  50 eve
(integer) 1       # eve 新增，alice 不更新

# CH：返回被改变的成员数（含更新）
127.0.0.1:6379> ZADD leaderboard CH 999 alice 1 frank
(integer) 2

# INCR 模式：分数累加，返回新分数
127.0.0.1:6379> ZADD leaderboard INCR 5 bob
"95"
\`\`\`

> **GT/LT 不能与 NX 同用**，但可与 XX 同用。GT/LT 在"只记录历史最高/最低分"场景非常实用。

## 7.3 ZSCORE / ZMSCORE / ZCARD

\`\`\`bash
# ZSCORE key member —— 取某成员分数，O(1)
127.0.0.1:6379> ZSCORE leaderboard alice
"100"

# ZMSCORE key member [member ...] —— 批量取分数（5.0+）
127.0.0.1:6379> ZMSCORE leaderboard alice bob dave
1) "100"
2) "95"
3) "80"

# ZCARD key —— 元素总数，O(1)
127.0.0.1:6379> ZCARD leaderboard
(integer) 5
\`\`\`

> **ZSCORE 返回字符串**：Redis 协议中分数以字符串返回（如 "100" 而非 100），客户端库会自动转换。

## 7.4 ZRANK / ZREVRANK

\`\`\`bash
# ZRANK key member —— 升序排名（0 开始，最低分是 0）
127.0.0.1:6379> ZRANK leaderboard alice
(integer) 4

# ZREVRANK key member —— 降序排名（0 开始，最高分是 0）
127.0.0.1:6379> ZREVRANK leaderboard alice
(integer) 0

# 批量排名（7.0+）
127.0.0.1:6379> ZRANK leaderboard alice bob WITHSCORE
1) 1) "alice"
   2) (integer) 4
2) 1) "bob"
   2) (integer) 3
\`\`\`

> **排名从 0 开始**：\`ZRANK\` 返回 0 表示是最低分那位，不是"第一名"。前端展示通常要 +1。

## 7.5 ZRANGE / ZREVRANGE

\`\`\`bash
# ZRANGE key start stop [WITHSCORES]  —— 按排名升序取 [start, stop]
127.0.0.1:6379> ZRANGE leaderboard 0 -1
1) "dave"
2) "carol"
3) "bob"
4) "frank"
5) "alice"

# 带分数返回
127.0.0.1:6379> ZRANGE leaderboard 0 -1 WITHSCORES
 1) "dave"
 2) "80"
 3) "carol"
 4) "85"
 5) "bob"
 6) "95"
 7) "frank"
 8) "99"
 9) "alice"
10) "100"

# ZREVRANGE key start stop [WITHSCORES]  —— 降序
127.0.0.1:6379> ZREVRANGE leaderboard 0 2 WITHSCORES
1) "alice"
2) "100"
3) "frank"
4) "99"
5) "bob"
6) "95"
\`\`\`

### 6.2+ 统一语法：ZRANGE + BYSCORE/BYLEX/REV

\`\`\`bash
# ZRANGE key min max BYSCORE —— 等价 ZRANGEBYSCORE
127.0.0.1:6379> ZRANGE leaderboard 80 100 BYSCORE
1) "dave"
2) "carol"
3) "bob"
4) "frank"
5) "alice"

# ZRANGE key min max BYSCORE REV —— 等价 ZREVRANGEBYSCORE
127.0.0.1:6379> ZRANGE leaderboard 100 80 BYSCORE REV
1) "alice"
2) "frank"
3) "bob"
4) "carol"
5) "dave"

# ZRANGE key min max BYSCORE REV LIMIT offset count
127.0.0.1:6379> ZRANGE leaderboard 100 80 BYSCORE REV LIMIT 0 2
1) "alice"
2) "frank"
\`\`\`

> **新写法（6.2+）**：\`ZRANGE\` 统一了 ZRANGEBYSCORE/ZREVRANGEBYSCORE/ZRANGEBYLEX，建议新代码用统一语法。旧命令仍可用但官方推荐迁移。

## 7.6 ZRANGEBYSCORE / ZREVRANGEBYSCORE / ZCOUNT

按**分数范围**查询是 ZSet 的看家本领：

\`\`\`bash
# ZRANGEBYSCORE key min max [WITHSCORES] [LIMIT offset count]
# 分数在 [80, 100] 之间的成员（升序）
127.0.0.1:6379> ZRANGEBYSCORE leaderboard 80 100
1) "dave"
2) "carol"
3) "bob"
4) "frank"
5) "alice"

# 开区间 (85, +inf)，LIMIT 分页
127.0.0.1:6379> ZRANGEBYSCORE leaderboard (85 +inf LIMIT 0 2
1) "bob"
2) "frank"

# ZREVRANGEBYSCORE key max min —— 降序（注意参数是 max 在前）
127.0.0.1:6379> ZREVRANGEBYSCORE leaderboard 100 85
1) "alice"
2) "frank"
3) "bob"
4) "carol"

# ZCOUNT key min max —— 统计分数区间内的成员数
127.0.0.1:6379> ZCOUNT leaderboard 80 100
(integer) 5
\`\`\`

### 区间语法

| 写法 | 含义 |
| --- | --- |
| \`min max\` | 闭区间 [min, max] |
| \`(min max\` | 左开右闭 |
| \`min)\` | 右开 |
| \`(min) (max)\` | 双开 |
| \`-inf +inf\` | 全部 |

## 7.7 ZINCRBY / ZREM

\`\`\`bash
# ZINCRBY key increment member —— 给成员加分
127.0.0.1:6379> ZINCRBY leaderboard 50 alice
"150"

# ZREM key member [member ...] —— 删除成员
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

# ZREMRANGEBYRANK key start stop —— 删排名 0~1（最低的两个）
127.0.0.1:6379> ZREMRANGEBYRANK lb 0 1
(integer) 2

# ZREMRANGEBYSCORE key min max —— 删分数 3~5 的
127.0.0.1:6379> ZREMRANGEBYSCORE lb 3 5
(integer) 2
\`\`\`

> **保留前 N 名**：先 \`ZREMRANGEBYRANK key 0 -(N+1)\` 删掉排名 N 之后的，留下前 N。注意是负数索引。

## 7.8 ZPOPMIN / ZPOPMAX / BZPOPMIN / BZPOPMAX

弹出分数最低/最高的成员（连带分数一起移除），是延时队列的核心：

\`\`\`bash
127.0.0.1:6379> ZADD pq 1 task1 2 task2 3 task3
(integer) 3

# ZPOPMIN key [count] —— 弹出最低分（默认 1 个）
127.0.0.1:6379> ZPOPMIN pq
1) "task1"
2) "1"

# ZPOPMAX key [count] —— 弹出最高分
127.0.0.1:6379> ZPOPMAX pq 2
1) "task3"
2) "3"
3) "task2"
4) "2"
\`\`\`

### 阻塞版 BZPOPMIN / BZPOPMAX

\`\`\`bash
# BZPOPMIN key [key ...] timeout —— 阻塞等待，弹出最低分
127.0.0.1:6379> BZPOPMIN pq 30
1) "pq"           # key 名
2) "task1"        # member
3) "1"            # score

# BZPOPMAX 同理，弹出最高分
127.0.0.1:6379> BZPOPMAX pq 30
\`\`\`

> **延时队列核心**：用执行时间戳作 score，消费者用 BZPOPMIN 阻塞取最早的，自然形成延时队列。timeout=0 表示永久阻塞。

### ZMPOP（7.0+）：批量弹出 + 指定方向

\`\`\`bash
# ZMPOP numkeys key [key ...] MIN|MAX [COUNT count]
127.0.0.1:6379> ZADD pq2 1 a 2 b 3 c
127.0.0.1:6379> ZMPOP 1 pq2 MIN COUNT 2
1) 1) "pq2"
   2) 1) 1) "a"
         2) "1"
      2) 1) "b"
         2) "2"

# BZMPOP 是阻塞版
127.0.0.1:6379> BZMPOP 30 1 pq2 MIN COUNT 5
\`\`\`

> ZMPOP 比 ZPOPMIN/ZPOPMAX 更灵活：支持多 key、指定方向、一次弹多个，7.0+ 推荐使用。

## 7.9 集合运算：ZUNIONSTORE / ZINTERSTORE / ZDIFFSTORE

ZSet 也能做并集、交集、差集，且能指定**聚合方式**与**权重**：

\`\`\`bash
127.0.0.1:6379> ZADD math 90 alice 80 bob
127.0.0.1:6379> ZADD english 85 alice 95 bob

# ZUNIONSTORE destination numkeys key [key ...] [WEIGHTS w1 w2] [AGGREGATE SUM|MIN|MAX]
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
1) "alice"
2) "127.5"      # max(90*1, 85*1.5) = 127.5
3) "bob"
4) "142.5"      # max(80*1, 95*1.5) = 142.5
\`\`\`

### AGGREGATE 选项

| 值 | 含义 |
| --- | --- |
| \`SUM\`（默认） | 分数相加 |
| \`MIN\` | 取最小 |
| \`MAX\` | 取最大 |

\`\`\`bash
# ZINTERSTORE destination numkeys key [key ...] —— 交集：只保留同时在所有集合的成员
127.0.0.1:6379> ZADD set1 1 a 2 b 3 c
127.0.0.1:6379> ZADD set2 10 b 20 c 30 d
127.0.0.1:6379> ZINTERSTORE inter 2 set1 set2
(integer) 2
127.0.0.1:6379> ZRANGE inter 0 -1 WITHSCORES
1) "b"
2) "12"       # 2+10
3) "c"
4) "23"       # 3+20

# ZDIFFSTORE destination numkeys key [key ...] —— 差集（6.2+）
127.0.0.1:6379> ZDIFFSTORE diff 2 set1 set2
(integer) 1
127.0.0.1:6379> ZRANGE diff 0 -1 WITHSCORES
1) "a"
2) "1"
\`\`\`

> **重要**：ZUNIONSTORE/ZINTERSTORE 的源 key **可以是 Set**（Set 视作分数为 1 的 ZSet），常用于"Set 转 ZSet 加权排序"。

### 不存储版：ZUNION / ZINTER / ZDIFF（6.2+）

\`\`\`bash
# 直接返回结果，不存到 destination
127.0.0.1:6379> ZUNION 2 math english WITHSCORES
1) "bob"
2) "175"
3) "alice"
4) "175"

127.0.0.1:6379> ZINTER 2 set1 set2 WITHSCORES
1) "b"
2) "12"
3) "c"
4) "23"

127.0.0.1:6379> ZDIFF 2 set1 set2
1) "a"
\`\`\`

> ZUNION/ZINTER/ZDIFF 是不存储版，直接返回结果，省去 destination key 的管理。

## 7.10 应用场景

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

# 只保留前 100 名（删掉 100 名之后的）
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
# 把每次请求时间戳作为 member 存入 ZSet（member 用唯一 ID 避免覆盖）
127.0.0.1:6379> ZADD rate:user:1001 1700000001000 "req-1"
127.0.0.1:6379> ZADD rate:user:1001 1700000002000 "req-2"

# 清理 60 秒前的请求
127.0.0.1:6379> ZREMRANGEBYSCORE rate:user:1001 0 1700000001000

# 统计窗口内请求数
127.0.0.1:6379> ZCARD rate:user:1001
(integer) 1
# 超过阈值就拒绝
\`\`\`

### 场景四：有序时间线 / Feed 流

\`\`\`bash
# 用发帖时间戳作 score，构建用户的时间线
127.0.0.1:6379> ZADD timeline:user:1001 1700000001000 "post:2001"
127.0.0.1:6379> ZADD timeline:user:1001 1700000002000 "post:2002"

# 按时间倒序取最新 10 条
127.0.0.1:6379> ZREVRANGE timeline:user:1001 0 9
1) "post:2002"
2) "post:2001"
\`\`\`

### 场景五：多维度加权排序

\`\`\`bash
# 文章点赞数、评论数、收藏数各自一个 ZSet
127.0.0.1:6379> ZADD article:likes 100 "art:1" 50 "art:2"
127.0.0.1:6379> ZADD article:comments 20 "art:1" 80 "art:2"
127.0.0.1:6379> ZADD article:favs 30 "art:1" 10 "art:2"

# 加权计算热度：点赞*1 + 评论*2 + 收藏*3
127.0.0.1:6379> ZUNIONSTORE article:hot 3 article:likes article:comments article:favs WEIGHTS 1 2 3
127.0.0.1:6379> ZREVRANGE article:hot 0 -1 WITHSCORES
1) "art:1"
2) "230"      # 100*1 + 20*2 + 30*3 = 230
3) "art:2"
4) "230"      # 50*1 + 80*2 + 10*3 = 230
\`\`\`

## 7.11 踩坑提示

- **排名从 0 开始**：展示给用户要 +1，否则"第 0 名"很奇怪。
- **同分数排序**：分数相同时按 member 字典序排，不保证插入顺序。
- **ZRANGEBYSCORE 性能**：在大 ZSet 上仍较快（跳表），但 LIMIT 深度分页（offset 很大）会变慢。
- **ZINCRBY 浮点精度**：分数是 double，金额场景注意精度，必要时用整数分。
- **ZUNIONSTORE 源是 Set 时分数为 1**：用 AGGREGATE MAX/MIN 时要特别小心。
- **延时队列并发消费**：ZRANGEBYSCORE + ZREM 非原子，用 Lua 或换 Stream。
- **大 ZSet 内存**：跳表 + 哈希表双结构，内存占用比 Set 高，超 1 万元素评估下是否值得。
- **GT/LT 与 NX 互斥**：不能同时使用，会报错。
- **ZADD INCR 只能单个 member**：INCR 模式下只能操作一个 member，返回新分数（字符串）或 nil（NX/XX 不满足）。

## 7.12 本章小结

- ZSet = Set + score，按分数自动排序，底层 listpack（小集合）或 skiplist + hashtable。
- ZADD 支持 NX/XX/GT/LT/CH/INCR 选项，GT/LT 防止分数回退很有用。
- ZRANGE/ZREVRANGE 按排名查，ZRANGEBYSCORE/ZREVRANGEBYSCORE/ZCOUNT 按分数查；6.2+ 用统一 ZRANGE ... BYSCORE。
- ZRANK/ZREVRANK/ZSCORE/ZMSCORE 提供单成员查询，排名从 0 开始。
- ZPOPMIN/ZPOPMAX/BZPOPMIN/BZPOPMAX/ZMPOP 弹出最值，是延时队列的基础。
- ZUNIONSTORE/ZINTERSTORE/ZDIFFSTORE 支持权重和 SUM/MIN/MAX 聚合，源可混用 Set；ZUNION/ZINTER/ZDIFF 是不存储版。
- 典型应用：**积分排行榜、延时队列、滑动窗口限流、有序时间线、多维度加权排序**。
- 性能要点：单成员操作 O(1)/O(log N)；范围查询 O(log N + M)。

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
| **Entry（消息）** | 一条消息，由 ID + 多个 field-value 对组成 |
| **ID** | 形如 \`<毫秒时间戳>-<序号>\`，单调递增，由 Redis 自动生成或手动指定 |
| **Consumer Group（消费组）** | 一组消费者共同消费一个 Stream，组内每条消息只投递给一个消费者 |
| **Pending Entry List（PEL）** | 已投递但未 ACK 的消息列表，随消费者存活 |
| **radix tree** | Stream 底层用基数树存储，按 ID 有序，高效范围查询 |

### Stream vs List 做消息队列

| 维度 | List | Stream |
| --- | --- | --- |
| 消息持久 | 消费即删除（RPOP） | 消费后仍在，可回溯 |
| 多消费者 | 各自独立消费，无法协同 | 消费组协同，互不重复 |
| ACK 确认 | 无 | 有（XACK） |
| 消息回溯 | 不支持 | 支持（XRANGE 按范围查） |
| 阻塞读取 | BRPOP | XREAD BLOCK / XREADGROUP BLOCK |

### Stream vs Kafka

| 维度 | Stream | Kafka |
| --- | --- | --- |
| 部署 | 单机 Redis 内置 | 独立集群，运维复杂 |
| 吞吐 | 单 Stream 约 10 万 QPS | 百万级 QPS |
| 分区 | 无（需多 Stream 手动分片） | 有（Partition） |
| 持久化 | RDB/AOF | 磁盘日志 |
| 消费组 | 有 | 有 |
| 适用场景 | 中小规模、轻量级 | 大规模、高吞吐 |

> **选型**：日消息量百万级以内、不想引入 Kafka 运维成本，用 Stream；千万级以上、需要分区并行，用 Kafka。

## 8.2 XADD / XLEN / XRANGE / XREVRANGE

\`\`\`bash
# XADD key [NOMKSTREAM] [MAXLEN|MINID [=|~] threshold] id field value ...
# 用 * 让 Redis 自动生成 ID
127.0.0.1:6379> XADD orders * type "create" user 1001 amount 99.9
"1700000000000-0"
127.0.0.1:6379> XADD orders * type "pay" user 1001 amount 99.9
"1700000000001-0"
127.0.0.1:6379> XADD orders * type "ship" user 1002 amount 50
"1700000000002-0"

# XLEN key —— 消息总数
127.0.0.1:6379> XLEN orders
(integer) 3

# XRANGE key start end [COUNT count] —— 按范围查 [start, end]，- 表示最小，+ 表示最大
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
      ...

# 限制返回条数
127.0.0.1:6379> XRANGE orders - + COUNT 2

# XREVRANGE key end start [COUNT count] —— 降序查（注意参数是 end 在前）
127.0.0.1:6379> XREVRANGE orders + - COUNT 1
1) 1) "1700000000002-0"
   2) 1) "type"
      2) "ship"
      ...
\`\`\`

> **XRANGE vs XREVRANGE 参数顺序**：XRANGE 是 \`start end\`（小到大），XREVRANGE 是 \`end start\`（大到小），两者参数顺序相反！

### ID 的组成

\`\`\`bash
# 自动生成：毫秒时间戳-序号
# 1700000000000-0 表示 1700000000000 毫秒的第 0 条

# 手动指定 ID（必须大于现有最大 ID）
127.0.0.1:6379> XADD orders 1700000000005-0 type deliver user 1002
"1700000000005-0"

# 只指定毫秒部分，序号自动补
127.0.0.1:6379> XADD orders 1700000000010-* type done
"1700000000010-0"
\`\`\`

> **XADD 的 ID 必须递增**：手动指定 ID 时不能比现有最大 ID 小，否则报错。这保证了 Stream 的有序性。

## 8.3 XTRIM 裁剪（MAXLEN / MINID）

控制 Stream 长度，避免无限增长：

\`\`\`bash
# XTRIM key MAXLEN|MINID [=|~] threshold

# MAXLEN：按数量裁剪，保留最近 N 条
# 精确裁剪到 1000 条（慢，会逐条删）
127.0.0.1:6379> XTRIM orders MAXLEN 1000

# 近似裁剪（快，推荐，按需批量删）
127.0.0.1:6379> XTRIM orders MAXLEN ~ 1000

# MINID：按 ID 裁剪，删除 ID 小于 threshold 的（6.2+）
127.0.0.1:6379> XTRIM orders MINID 1700000000005-0
\`\`\`

### MAXLEN 也可以在 XADD 时指定

\`\`\`bash
# 精确裁剪
127.0.0.1:6379> XADD orders MAXLEN 1000 * type create
# 近似裁剪（推荐）
127.0.0.1:6379> XADD orders MAXLEN ~ 1000 * type create

# MINID 在 XADD 中也可用
127.0.0.1:6379> XADD orders MINID ~ 1700000000005-0 * type create
\`\`\`

### MAXLEN vs MINID

| 方式 | 含义 | 适用场景 |
| --- | --- | --- |
| \`MAXLEN N\` | 保留最近 N 条 | 固定长度日志 |
| \`MINID id\` | 删除 ID < id 的 | 按时间清理（ID 含时间戳） |

> **生产建议**：用 \`~\` 近似裁剪，Redis 会按需批量删除，性能比精确裁剪（\`=\`）高一个数量级。MINID 配合时间戳 ID 可实现"保留最近 7 天"的语义。

## 8.4 XREAD 独立消费

XREAD 是"独立消费"模式，不依赖消费组，每个客户端自己维护读取位置：

\`\`\`bash
# XREAD [COUNT count] [BLOCK milliseconds] STREAMS key [key ...] id [id ...]

# 从开头读 2 条（id=0 表示从最小 ID 之后开始）
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

# 只读新消息（$ 表示当前最新 ID 之后）
127.0.0.1:6379> XREAD STREAMS orders $
(nil)

# 阻塞等待新消息（5 秒超时）
127.0.0.1:6379> XREAD COUNT 10 BLOCK 5000 STREAMS orders $
1) 1) "orders"
   2) 1) 1) "1700000000003-0"
         2) ...

# 阻塞永久等待（timeout=0）
127.0.0.1:6379> XREAD BLOCK 0 STREAMS orders $
\`\`\`

> **lastId 的含义**：\`STREAMS key id\` 中的 id 是"上次读到的位置"，返回的是 id **之后**的消息。首次读用 0（从头），持续读用上次返回的最后一条 ID。
>
> **$ 的含义**：特殊 ID \`$\` 表示"当前 Stream 的最大 ID"，用于只读未来新消息。

## 8.5 消费者组（XGROUP / XREADGROUP）

消费组让多个消费者**协同消费同一 Stream**，每条消息只被组内一个消费者处理。

\`\`\`bash
# XGROUP CREATE key group id [MKSTREAM]
# 创建消费组，从开头消费（0）
127.0.0.1:6379> XGROUP CREATE orders order-processors 0
OK

# 从最新开始（$），MKSTREAM 表示 key 不存在时自动创建
127.0.0.1:6379> XGROUP CREATE orders order-processors $ MKSTREAM
OK

# 设置消费组起始位置为某个具体 ID
127.0.0.1:6379> XGROUP CREATE orders order-processors 1700000000001-0
OK
\`\`\`

### 查看消费组信息

\`\`\`bash
# XINFO GROUPS key —— 查看所有消费组
127.0.0.1:6379> XINFO GROUPS orders
1) 1) "name"
   2) "order-processors"
   3) "consumers"
   4) (integer) 0
   5) "pending"
   6) (integer) 0
   7) "last-delivered-id"
   8) "1700000000000-0"

# XINFO CONSUMERS key group —— 查看组内消费者
127.0.0.1:6379> XINFO CONSUMERS orders order-processors
1) 1) "name"
   2) "c1"
   3) "pending"
   4) (integer) 2
   5) "idle"
   6) (integer) 12345

# XINFO STREAM key —— 查看 Stream 整体信息
127.0.0.1:6379> XINFO STREAM orders
1) 1) "length"
   2) (integer) 3
   3) "radix-tree-keys"
   4) (integer) 1
   ...
\`\`\`

### 消费者读取消息

\`\`\`bash
# XREADGROUP GROUP group consumer [COUNT count] [BLOCK ms] STREAMS key id

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

# 阻塞读取新消息
127.0.0.1:6379> XREADGROUP GROUP order-processors c1 COUNT 10 BLOCK 5000 STREAMS orders >
\`\`\`

### ID 参数的含义（关键！）

| ID | 含义 |
| --- | --- |
| \`>\` | 读**未投递过**的新消息（新消息才会进入 PEL） |
| \`0\` 或具体 ID | 读**已投递给本消费者但未 ACK** 的消息（PEL 重投） |

> **关键区分**：\`>\` 拿新消息，\`0\` 拿自己未完成的旧消息。消费失败后用 \`0\` 重试，这是新人最易搞混的点。

### 其他 XGROUP 操作

\`\`\`bash
# 删除消费组
127.0.0.1:6379> XGROUP DESTROY orders order-processors
(integer) 1

# 创建消费者（不创建也能直接 XREADGROUP 自动创建）
127.0.0.1:6379> XGROUP CREATECONSUMER orders order-processors c2
(integer) 1

# 删除消费者（其 PEL 消息转回组）
127.0.0.1:6379> XGROUP DELCONSUMER orders order-processors c1
(integer) 2    # 返回该消费者 PEL 中的消息数

# 重置消费组位置
127.0.0.1:6379> XGROUP SETID orders order-processors 0
\`\`\`

## 8.6 XACK 消息确认

消费组模式下，**消息被读取后不会删除，只有 ACK 后才从 PEL 移除**：

\`\`\`bash
# XACK key group id [id ...]
# 消费者处理完一条消息后确认
127.0.0.1:6379> XACK orders order-processors 1700000000000-0
(integer) 1

# 可一次 ACK 多条
127.0.0.1:6379> XACK orders order-processors 1700000000001-0 1700000000002-0
(integer) 2
\`\`\`

> **没有 ACK 会怎样？** 消息会一直留在该消费者的 PEL 里，即使消费者下线。重启后用 \`XREADGROUP ... STREAMS key 0\` 能重新拿到这些未完成的消息。这是 Stream 相比 List 的核心优势——消息不丢。

## 8.7 XPENDING / XCLAIM / XAUTOCLAIM

### XPENDING：查看未确认消息

\`\`\`bash
# XPENDING key group —— 查看组的 PEL 概况
127.0.0.1:6379> XPENDING orders order-processors
1) (integer) 2           # 未确认总数
2) "1700000000001-0"     # 最小 ID
3) "1700000000002-0"     # 最大 ID
4) 1) 1) "c1"
      2) "2"
   2) 1) "c2"
      2) "0"

# XPENDING key group start end count [consumer] —— 查看详细列表
127.0.0.1:6379> XPENDING orders order-processors - + 10
1) 1) "1700000000001-0"
   2) "c1"
   3) (integer) 60000     # 空闲 60 秒
   4) (integer) 3         # 已投递 3 次
2) 1) "1700000000002-0"
   2) "c1"
   3) (integer) 30000
   4) (integer) 1
\`\`\`

### XCLAIM：转移超时消息

当消费者 c1 卡死后，把它的消息转给 c2：

\`\`\`bash
# XCLAIM key group consumer min-idle-time id [id ...]
# 把空闲超过 60 秒的消息转给 c2
127.0.0.1:6379> XCLAIM orders order-processors c2 60000 1700000000001-0
1) 1) "1700000000001-0"
   2) 1) "type"
      2) "pay"
      ...
\`\`\`

### XAUTOCLAIM（6.2+）：自动批量转移

\`\`\`bash
# XAUTOCLAIM key group consumer min-idle-time start [COUNT count]
# 自动扫描并转移空闲超时的消息，返回转移后的游标和消息
127.0.0.1:6379> XAUTOCLAIM orders order-processors c2 60000 0 COUNT 10
1) "0"                   # 下次扫描的游标（0 表示扫完）
2) 1) 1) "1700000000001-0"
      2) 1) "type"
         2) "pay"
         ...
3) (empty array)        # 已删除的消息 ID
\`\`\`

> **死信处理思路**：通过 XPENDING 看到 \`deliveries\`（投递次数）超过阈值（如 5 次）的消息，转交到死信 Stream 处理，避免毒消息无限重试。

## 8.8 XDEL / XINFO

\`\`\`bash
# XDEL key id [id ...] —— 删除单条（不影响消费组 PEL）
127.0.0.1:6379> XDEL orders 1700000000005-0
(integer) 1

# XINFO STREAM key [FULL [COUNT count]] —— 查看 Stream 完整信息
127.0.0.1:6379> XINFO STREAM orders FULL
1) 1) "length"
   2) (integer) 3
   3) "entries"
   4) 1) ...
   5) "groups"
   6) 1) ...
\`\`\`

> **XDEL 不释放内存**：XDEL 只是标记删除，实际内存释放要等 XTRIM 或 lazy-free。不要指望 XDEL 降内存。

## 8.9 应用场景

### 场景一：消息队列（完整订单事件流）

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

### 场景二：事件溯源（Event Sourcing）

\`\`\`bash
# 所有状态变更以事件形式追加到 Stream，永不修改
127.0.0.1:6379> XADD account:1001 * event create balance 0
127.0.0.1:6379> XADD account:1001 * event deposit amount 100
127.0.0.1:6379> XADD account:1001 * event withdraw amount 30

# 回放事件重建状态
127.0.0.1:6379> XRANGE account:1001 - +

# 按时间段回查（出问题时审计）
127.0.0.1:6379> XRANGE account:1001 1700000001000 1700000002000
\`\`\`

### 场景三：活动日志

\`\`\`bash
# 用户行为日志写入 Stream
127.0.0.1:6379> XADD activity:log * user 1001 action click target button-A
127.0.0.1:6379> XADD activity:log * user 1001 action view page home

# 裁剪保留最近 10 万条
127.0.0.1:6379> XTRIM activity:log MAXLEN ~ 100000

# 消费组异步消费、落库分析
127.0.0.1:6379> XREADGROUP GROUP analytics worker-1 COUNT 100 STREAMS activity:log >
\`\`\`

> **Stream 的杀手锏**：消息持久 + 可回溯 + 消费组隔离。这是 List 无法提供的。

## 8.10 踩坑提示

- **忘记 ACK**：消息永远留在 PEL，内存持续增长。务必在处理成功后 ACK，并配合监控 XPENDING 数量。
- **PEL 无限堆积**：消费者崩溃后消息不释放，要用 XAUTOCLAIM 定期救活。
- **\`>\` vs \`0\`**：\`>\` 拿新消息，\`0\` 拿自己未 ACK 的旧消息，新人极易搞混。
- **MAXLEN 精确裁剪慢**：用 \`~\` 近似裁剪，性能更好。
- **XADD 的 ID 必须递增**：手动指定 ID 时不能比现有最大 ID 小，否则报错。
- **消息大小**：单条消息别超 1MB，field/value 尽量短。
- **不是 Kafka**：单机 Stream 没有分区并行能力，单 Stream 吞吐上限约 10 万 QPS，超量用多 Stream 分片或上 Kafka。
- **XDEL 不释放内存**：标记删除而已，真正释放靠 XTRIM。
- **消费组不自动创建**：XREADGROUP 前必须先 XGROUP CREATE，否则报错 NOGROUP。

## 8.11 本章小结

- Stream 是 Redis 5.0+ 的内置消息队列，底层 radix tree，支持持久化、消费组、ACK、回溯。
- XADD 写入（\`*\` 自动生成 ID，MAXLEN/MINID 裁剪），XLEN/XRANGE/XREVRANGE 查询。
- XTRIM 裁剪：MAXLEN 按数量、MINID 按 ID（时间），\`~\` 近似裁剪性能更好。
- XREAD 独立消费，XREADGROUP + XGROUP 协同消费。
- \`>\` 取新消息，\`0\` 取未 ACK 的旧消息；XACK 确认，未 ACK 的进 PEL。
- XPENDING 查 PEL，XCLAIM/XAUTOCLAIM 转移超时消息，实现故障恢复。
- XINFO 查看 Stream/Group/Consumer 元信息。
- 典型应用：**消息队列、事件溯源、活动日志、延时任务（配合 score 思路）**。
- 局限：单机无分区，超大规模上 Kafka。

下一章学习用最少的内存做海量布尔统计的 **Bitmap 与 Bitfield**。`
  },
  {
    id: "redis-ch09",
    group: "第二部分 数据结构进阶",
    icon: "🔢",
    title: "第 9 章 Bitmap 与 Bitfield",
    content: `# 第 9 章 Bitmap 与 Bitfield

Bitmap（位图）本质上是 String，但通过位操作把它当成"超长的布尔数组"使用。1 亿个状态只占约 12MB，是做签到、活跃统计、在线状态、功能开关的内存杀手锏。Bitfield 则支持多字节宽度整数的批量位运算，能在一个 String 里塞多个计数器。

## 9.1 概述与内存计算

Bitmap 不是独立的数据类型，而是 String 类型上的位操作。String 最大 512MB，对应 2^32 ≈ 42.9 亿位。

### 内存计算公式

\`\`\`
Bitmap 内存（字节）= floor(max_offset / 8) + 1
\`\`\`

| 用户量（offset 上限） | Bitmap 内存 | String 每用户 1 字节 | 节省 |
| --- | --- | --- | --- |
| 1 万 | ~1.2 KB | ~10 KB | 8 倍 |
| 100 万 | ~122 KB | ~1 MB | 8 倍 |
| 1 亿 | ~12 MB | ~95 MB | 8 倍 |
| 10 亿 | ~119 MB | ~953 MB | 8 倍 |

> **内存优势**：用 String 存 1 亿用户签到状态，每个 key 1 字节就是 1 亿字节 ≈ 95MB；用 Bitmap 只占被设置到的最大 offset 决定的字节数，1 亿用户约 12MB。差距近 8 倍。

## 9.2 SETBIT / GETBIT

\`\`\`bash
# SETBIT key offset value（value 只能 0 或 1）
# 用户 ID 作为 offset，1 表示已签到
127.0.0.1:6379> SETBIT sign:202401 100 1     # 用户 100 在 1 月签到了
(integer) 0      # 返回旧值
127.0.0.1:6379> SETBIT sign:202401 101 1
(integer) 0
127.0.0.1:6379> SETBIT sign:202401 102 1
(integer) 0

# GETBIT key offset —— 查看某用户是否签到
127.0.0.1:6379> GETBIT sign:202401 100
(integer) 1
127.0.0.1:6379> GETBIT sign:202401 999
(integer) 0      # 不存在的位返回 0

# 清除某位
127.0.0.1:6379> SETBIT sign:202401 100 0
(integer) 1
\`\`\`

> **GETBIT 不存在返回 0**：无法区分"未签到"和"位被显式设为 0"，业务上等同处理即可。

## 9.3 BITCOUNT

\`\`\`bash
# BITCOUNT key [start end [BYTE|BIT]]
# 统计值为 1 的位数（1 月总签到人数）
127.0.0.1:6379> BITCOUNT sign:202401
(integer) 3

# 按字节范围统计（第 0~99 字节，覆盖用户 0~799）
127.0.0.1:6379> BITCOUNT sign:202401 0 99 BYTE
(integer) 3

# 按位范围统计（第 0~7 位，用户 0~7）
127.0.0.1:6379> BITCOUNT sign:202401 0 7 BIT
(integer) 0

# 全部
127.0.0.1:6379> BITCOUNT sign:202401 0 -1
\`\`\`

### BYTE vs BIT 范围

| 单位 | 含义 | start/end 表示 |
| --- | --- | --- |
| \`BYTE\`（默认） | 字节偏移 | 0~N 字节 |
| \`BIT\`（7.0+） | 位偏移 | 0~N 位 |

> **BITCOUNT 性能**：O(N)，N 是范围字节数。1 亿位约 12MB，全量统计耗时几毫秒；GB 级 Bitmap 上是秒级，避免高频调用，可用 HyperLogLog 近似替代。

## 9.4 BITOP 位运算

BITOP 对多个 Bitmap 做位运算（AND/OR/XOR/NOT），结果存入目标 key：

\`\`\`bash
# BITOP AND|OR|XOR|NOT destkey key [key ...]
# 三天各自的签到 Bitmap
127.0.0.1:6379> SETBIT sign:20240101 100 1
127.0.0.1:6379> SETBIT sign:20240102 100 1
127.0.0.1:6379> SETBIT sign:20240103 100 1
127.0.0.1:6379> SETBIT sign:20240101 101 1
127.0.0.1:6379> SETBIT sign:20240102 101 1

# AND：三天都签到的用户
127.0.0.1:6379> BITOP AND sign:3days:all sign:20240101 sign:20240102 sign:20240103
(integer) 13
127.0.0.1:6379> BITCOUNT sign:3days:all
(integer) 1     # 只有用户 100 三天都签了

# OR：三天任意一天签到
127.0.0.1:6379> BITOP OR sign:3days:any sign:20240101 sign:20240102 sign:20240103
127.0.0.1:6379> BITCOUNT sign:3days:any
(integer) 2

# XOR：只在某一天签到（差异）
127.0.0.1:6379> BITOP XOR sign:diff sign:20240101 sign:20240102

# NOT：取反（只能单个 key）
127.0.0.1:6379> BITOP NOT sign:invert sign:20240101
\`\`\`

| 运算 | 含义 | 典型用途 |
| --- | --- | --- |
| \`AND\` | 全为 1 才 1 | 连续活跃用户 |
| \`OR\` | 任一为 1 即 1 | 任意活跃用户 |
| \`XOR\` | 不同为 1 | 差异分析 |
| \`NOT\` | 取反（只能单 key） | 补集 |

> **性能注意**：BITOP 是 O(N)，N 是最长 Bitmap 的字节数。1 亿位约 12MB，运算耗时几毫秒，可接受；但别在超大 Bitmap 上高频调用。

## 9.5 BITPOS 查找

BITPOS 找第一个 0 或 1 的位置：

\`\`\`bash
# BITPOS key bit [start [end [BYTE|BIT]]]
# 第一个值为 1 的位
127.0.0.1:6379> BITPOS sign:202401 1
(integer) 100

# 第一个值为 0 的位（找空位）
127.0.0.1:6379> BITPOS sign:202401 0
(integer) 0

# 在指定字节范围内找
127.0.0.1:6379> BITPOS sign:202401 1 13 100 BYTE
(integer) 100
\`\`\`

> **找连续空位**：BITPOS 只能找单个位，找"连续 N 个 0"需应用层循环或用 Bitfield。
>
> **BITPOS 返回 -1**：当找 1 但全为 0 时返回 -1，注意空值判断。

## 9.6 BITFIELD 命令

BITFIELD 把 String 当成"多个定宽整数"的容器，支持一次操作多个字段：

\`\`\`bash
# BITFIELD key [GET type offset] [SET type offset value] [INCRBY type offset increment] [OVERFLOW WRAP|SAT|FAIL]
# type: u8/i16/u32 等表示无符号/有符号 N 位
# u = unsigned, i = signed

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

### 类型说明

| 类型 | 位数 | 范围 |
| --- | --- | --- |
| \`u8\` | 8 | 0 ~ 255 |
| \`u16\` | 16 | 0 ~ 65535 |
| \`u32\` | 32 | 0 ~ 4294967295 |
| \`i8\` | 8 | -128 ~ 127 |
| \`i16\` | 16 | -32768 ~ 32767 |

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

| 策略 | 行为 | 适用场景 |
| --- | --- | --- |
| \`WRAP\`（默认） | 环绕 | 不推荐用于计数器 |
| \`SAT\` | 饱和停在极值 | 计数器防回绕 |
| \`FAIL\` | 返回 nil | 严格场景 |

> **场景**：用 BITFIELD 把"在线人数、点赞数、评论数"等多个计数器压在一个 String 里，省内存又原子。计数器建议用 \`OVERFLOW SAT\` 或 \`FAIL\` 防止异常回绕。

## 9.7 应用场景

### 场景一：每日签到 + 当月签到天数

\`\`\`bash
# 用户 1001 在 1 月 5 日签到（offset 用"日-1"）
127.0.0.1:6379> SETBIT sign:1001:202401 4 1     # 5 号 -> offset 4
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

# 3 天任意活跃（OR）= 3 天去重 UV
127.0.0.1:6379> BITOP OR active:3days:any active:20240101 active:20240102 active:20240103
127.0.0.1:6379> BITCOUNT active:3days:any
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

### 场景四：功能开关（Feature Flags）

\`\`\`bash
# 每个用户一个位，1 表示开启某功能
127.0.0.1:6379> SETBIT feature:newui 1001 1   # 用户 1001 开启新 UI
127.0.0.1:6379> SETBIT feature:newui 1002 0   # 用户 1002 关闭

# 灰度发布时判断
127.0.0.1:6379> GETBIT feature:newui 1001
(integer) 1     # 开启

# 统计已开启用户数
127.0.0.1:6379> BITCOUNT feature:newui
(integer) 1
\`\`\`

> **Feature Flags 优势**：百万级用户的灰度开关只需 ~122KB，比用 Set 或数据库表省几个数量级。

### 场景五：布隆过滤器基础（简易版）

用 Bitmap 可以手写一个简易布隆过滤器——用 k 个哈希函数把元素映射到 Bitmap 的 k 个位置，全置 1：

\`\`\`bash
# 简易布隆过滤器（生产用 RedisBloom 模块，见第 11 章）
# 添加元素：对元素做 k 次哈希，设置 k 个位
# 伪代码：
#   for i in 0..k:
#     offset = hash(element + i) % m
#     SETBIT bloomfilter offset 1

# 查询：所有对应位都为 1 才"可能存在"
#   for i in 0..k:
#     offset = hash(element + i) % m
#     if GETBIT bloomfilter offset == 0: return "肯定不存在"
#   return "可能存在"
\`\`\`

> **布隆过滤器特性**：不会漏报（肯定不在就是不在），但可能误报（可能存在）。详见第 11 章 RedisBloom 模块。

## 9.8 踩坑提示

- **offset 过大占用内存**：\`SETBIT k 1000000000 1\` 会立即分配约 125MB，哪怕只设了 1 位。offset 控制在合理范围。
- **BITOP 覆盖目标 key**：结果 key 会清空原内容，且不会自动设过期，记得设 TTL。
- **BITCOUNT 性能**：在 GB 级 Bitmap 上是 O(N) 秒级操作，避免高频调用，可用 HyperLogLog 近似替代。
- **BITFIELD 字节序**：offset 是**位**偏移，计算多字段时注意对齐，建议用 BYTE 类型思考。
- **用户 ID 必须是整数且稠密**：稀疏 ID（如最大 10 亿但实际 1 万用户）会浪费巨大内存。
- **GETBIT 不存在返回 0**：无法区分"未签到"和"位被显式设为 0"，业务上等同处理即可。
- **BITFIELD OVERFLOW 默认 WRAP**：计数器场景务必显式指定 SAT/FAIL，防止回绕导致数据错乱。
- **BITOP 长度对齐**：不同长度的 Bitmap 做 BITOP 时，短的会补 0，结果以最长的为准。

## 9.9 本章小结

- Bitmap 本质是 String，按位操作，1 亿状态约 12MB，极省内存。
- SETBIT/GETBIT 设与读单位，BITCOUNT 统计 1 的个数，支持 BYTE/BIT 范围。
- BITOP 做 AND/OR/XOR/NOT 运算，求"共同活跃""任意活跃"，结果存新 key。
- BITPOS 找首个 0/1，常用于找空位。
- BITFIELD 支持多定宽整数，INCRBY + OVERFLOW 实现紧凑计数器，WRAP/SAT/FAIL 控制溢出。
- 典型应用：**签到、日活统计、连续活跃、在线状态、功能开关、布隆过滤器基础**。
- 前提：ID 稠密且连续；offset 别过大；计数器用 SAT/FAIL 防回绕。

下一章看 Redis 如何处理**地理位置**——附近的人、门店搜索。`
  },
  {
    id: "redis-ch10",
    group: "第二部分 数据结构进阶",
    icon: "🌍",
    title: "第 10 章 Geo 地理空间",
    content: `# 第 10 章 Geo 地理空间

Geo 是 Redis 3.2 引入的地理空间功能，底层基于 ZSet + GeoHash 算法，支持存经纬度、算距离、按半径/矩形查询。LBS（Location-Based Service）场景如"附近的人""附近的门店"无需引入专门的数据库即可实现。

## 10.1 概述与底层原理

### Geo 与 ZSet 的关系

Geo 不是独立的数据类型，而是 ZSet 之上的封装。Redis 用 **GeoHash 算法**把二维经纬度编码成一维 52 位整数，作为 ZSet 的 score 存入，member 就是地点名称。

\`\`\`
经纬度 (lon, lat) --GeoHash编码--> 52位整数 score
ZSet: { member: 地点名, score: GeoHash编码值 }
\`\`\`

> **底层是 ZSet**：所以 GEO 的 key **本质是 ZSet**，能用 ZREM 删除、ZCARD 统计数量、ZRANGE 遍历（但返回的是 member，没有经纬度）。但**不要用 ZADD**——它不会算 GeoHash，会破坏数据。

### GeoHash 算法简述

GeoHash 把地球切成网格，经度和纬度交替二分，编码成一串二进制，再转成字符串。相邻区域有相同前缀，便于前缀聚合。

#### GeoHash 精度表

| GeoHash 长度 | 网格宽度 | 网格高度 | 精度 |
| --- | --- | --- | --- |
| 1 | 5000 km | 5000 km | 大洲级 |
| 2 | 1250 km | 625 km | 国家级 |
| 3 | 156 km | 156 km | 省级 |
| 4 | 39 km | 19.5 km | 市级 |
| 5 | 4.9 km | 4.9 km | 区级 |
| 6 | 1.2 km | 0.6 km | 街道级 |
| 7 | 153 m | 153 m | 楼栋级 |
| 8 | 38 m | 19 m | 室内级 |
| 9 | 4.8 m | 4.8 m | 高精度 |
| 11 | —— | —— | Redis 默认（毫米级） |

> Redis 内部用 52 位整数存储（精度约 0.6 米），GEOHASH 命令默认返回 11 字符串（精度极高）。

## 10.2 GEOADD

\`\`\`bash
# GEOADD key [NX|XX] [CH] longitude latitude member [longitude latitude member ...]
# 经度范围 [-180, 180]，纬度 [-85.05, 85.05]
# 添加几个门店（北京天安门附近）
127.0.0.1:6379> GEOADD stores 116.397 39.908 "shop-A" 116.405 39.915 "shop-B" 116.390 39.900 "shop-C"
(integer) 3
\`\`\`

> **经纬度顺序**：Redis 命令是 **经度在前、纬度在后**（lon, lat），但很多 API（如高德、百度地图）是纬度在前，传参时务必对齐！

### GEOADD 的选项（6.2+）

\`\`\`bash
# NX：只新增，已存在的不更新
127.0.0.1:6379> GEOADD stores NX 116.397 39.908 "shop-A"
(integer) 0       # shop-A 已存在，不更新

# XX：只更新已存在的
127.0.0.1:6379> GEOADD stores XX CH 116.410 39.920 "shop-A"
(integer) 1       # shop-A 更新成功

# CH：返回值改为"被改变的成员数"（含更新）
127.0.0.1:6379> GEOADD stores CH 116.411 39.921 "shop-A" 116.500 39.950 "shop-D"
(integer) 2       # shop-A 更新 + shop-D 新增
\`\`\`

## 10.3 GEOPOS

\`\`\`bash
# GEOPOS key member [member ...] —— 取出经纬度
127.0.0.1:6379> GEOPOS stores shop-A
1) 1) "116.39700037240982056"
   2) "39.90799991898214264"

# 批量取
127.0.0.1:6379> GEOPOS stores shop-A shop-B shop-X
1) 1) "116.39700037240982056"
   2) "39.90799991898214264"
2) 1) "116.40500009155273438"
   2) "39.91500075367562080"
3) (nil)       # shop-X 不存在

# 不存在的 member 返回 nil
\`\`\`

> **精度损失**：GeoHash 编解码有微小精度损失（约 0.1 米级），对绝大多数 LBS 场景无影响，精密测量慎用。

## 10.4 GEODIST

\`\`\`bash
# GEODIST key member1 member2 [m|km|mi|ft]
127.0.0.1:6379> GEODIST stores shop-A shop-B m
"857.7863"
127.0.0.1:6379> GEODIST stores shop-A shop-C km
"0.6378"

# 默认单位是 m
127.0.0.1:6379> GEODIST stores shop-A shop-B
"857.7863"

# 其中一个不存在返回 nil
127.0.0.1:6379> GEODIST stores shop-A shop-X
(nil)
\`\`\`

| 单位 | 含义 |
| --- | --- |
| \`m\`（默认） | 米 |
| \`km\` | 千米 |
| \`mi\` | 英里 |
| \`ft\` | 英尺 |

## 10.5 GEOHASH

GEOHASH 返回成员的 GeoHash 字符串，方便传给前端或第三方地图：

\`\`\`bash
# GEOHASH key member [member ...]
# 返回标准 GeoHash 字符串（默认 11 字符）
127.0.0.1:6379> GEOHASH stores shop-A shop-B
1) "wx4g0bgb0s00"
2) "wx4g0bzs5s00"

# 相同前缀越长说明两点越接近
\`\`\`

> **GeoHash 字符串**：每个字符代表一个区域，相同前缀越长说明两点越接近。可在外部用前缀做粗粒度聚合（如按前 5 位分桶统计区域密度）。

## 10.6 GEORADIUS / GEORADIUSBYMEMBER（已废弃）

### GEORADIUS（6.2 起废弃）

\`\`\`bash
# GEORADIUS key longitude latitude radius m|km|... [WITHCOORD] [WITHDIST] [WITHHASH] [COUNT n] [ASC|DESC]
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

### GEORADIUSBYMEMBER（6.2 起废弃）

\`\`\`bash
# GEORADIUSBYMEMBER key member radius m|km|... [WITHCOORD] [WITHDIST] [WITHHASH] [COUNT n] [ASC|DESC]
# 以 shop-A 为中心，1 公里内
127.0.0.1:6379> GEORADIUSBYMEMBER stores shop-A 1 km WITHDIST
1) 1) "shop-A"
   2) "0.0000"
2) 1) "shop-C"
   2) "0.6378"
\`\`\`

> ⚠️ **GEORADIUS / GEORADIUSBYMEMBER 在 6.2 被标记废弃**，原因：命令名不统一、参数顺序反人类。新代码必须用 GEOSEARCH / GEOSEARCHSTORE。

## 10.7 GEOSEARCH（推荐，6.2+）

GEOSEARCH 用 FROMMEMBER/FROMLONLAT 指定中心，BYRADIUS/BYBOX 指定范围，更清晰：

\`\`\`bash
# GEOSEARCH key <FROMMEMBER member | FROMLONLAT lon lat> <BYRADIUS r unit | BYBOX w h unit>
#   [ASC|DESC] [COUNT n [ANY]] [WITHCOORD] [WITHDIST] [WITHHASH]

# 以 shop-A 为中心，1 公里内（圆形）
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

# ASC 按距离升序，COUNT 限制条数
127.0.0.1:6379> GEOSEARCH stores FROMMEMBER shop-A BYRADIUS 5 km ASC COUNT 3

# DESC 按距离降序
127.0.0.1:6379> GEOSEARCH stores FROMMEMBER shop-A BYRADIUS 5 km DESC COUNT 3

# COUNT ANY 表示不必精确取满，更快
127.0.0.1:6379> GEOSEARCH stores FROMMEMBER shop-A BYRADIUS 5 km COUNT 3 ANY
\`\`\`

### 选项汇总

| 选项 | 含义 |
| --- | --- |
| \`FROMMEMBER m\` | 以成员 m 为中心 |
| \`FROMLONLAT lon lat\` | 以经纬度为中心 |
| \`BYRADIUS r m\|km\|...\` | 圆形范围 |
| \`BYBOX w h m\|km\|...\` | 矩形范围（宽高） |
| \`WITHDIST\` | 返回距离 |
| \`WITHCOORD\` | 返回经纬度 |
| \`WITHHASH\` | 返回 GeoHash 整数 |
| \`ASC\` | 按距离升序（近到远） |
| \`DESC\` | 按距离降序（远到近） |
| \`COUNT n [ANY]\` | 限制条数（ANY 表示不必精确，更快） |

## 10.8 GEOSEARCHSTORE

把搜索结果存到新 key（本质是个 ZSet，可继续 ZRANGE）：

\`\`\`bash
# GEOSEARCHSTORE destination source <FROMMEMBER|FROMLONLAT> <BYRADIUS|BYBOX>
#   [ASC|DESC] [COUNT n [ANY]] [WITHCOORD] [WITHDIST] [WITHHASH]
127.0.0.1:6379> GEOSEARCHSTORE nearby FROMMEMBER shop-A BYRADIUS 1 km ASC COUNT 10
(integer) 2

# 结果是 ZSet，score 是 GeoHash 整数
127.0.0.1:6379> ZRANGE nearby 0 -1
1) "shop-A"
2) "shop-C"
\`\`\`

> **GEOSEARCHSTORE 与 GEOSEARCH 区别**：STORE 版结果存入 destination key（ZSet），不能单独用 WITHCOORD/WITHDIST（这些信息存在 ZSet 的 score 和额外字段中）。

## 10.9 应用场景

### 场景一：附近的门店

\`\`\`bash
# 1. 门店上线时写入位置
127.0.0.1:6379> GEOADD stores 116.397 39.908 "shop:1001"
127.0.0.1:6379> GEOADD stores 116.405 39.915 "shop:1002"

# 2. 用户请求"附近 3 公里的店"
127.0.0.1:6379> GEOSEARCH stores FROMLONLAT 116.400 39.910 BYRADIUS 3 km WITHDIST ASC COUNT 20

# 3. 门店搬家更新位置（用 XX CH）
127.0.0.1:6379> GEOADD stores XX CH 116.412 39.918 "shop:1001"

# 4. 门店下线删除
127.0.0.1:6379> ZREM stores "shop:1001"
\`\`\`

### 场景二：附近的人

\`\`\`bash
# 用户上报位置（定时刷新，覆盖旧位置）
127.0.0.1:6379> GEOADD nearby:users 116.397 39.908 "user:1001"
127.0.0.1:6379> GEOADD nearby:users 116.398 39.909 "user:1002"

# 找 1 公里内的其他用户（按距离升序）
127.0.0.1:6379> GEOSEARCH nearby:users FROMMEMBER user:1001 BYRADIUS 1 km ASC COUNT 50

# 用户下线移除
127.0.0.1:6379> ZREM nearby:users "user:1001"
\`\`\`

> **本质是 ZSet**：所以删除用 \`ZREM\`，统计数量用 \`ZCARD\`。

### 场景三：通勤距离计算

\`\`\`bash
# 存家和公司位置
127.0.0.1:6379> GEOADD places 116.397 39.908 "home" 116.487 39.948 "office"

# 算通勤距离
127.0.0.1:6379> GEODIST places home office km
"8.4567"
\`\`\`

### 场景四：按城市分桶（大 key 优化）

\`\`\`bash
# 全国门店塞一个 key 会有大 key 风险，按城市分桶
127.0.0.1:6379> GEOADD stores:beijing 116.397 39.908 "shop:1001"
127.0.0.1:6379> GEOADD stores:shanghai 121.473 31.230 "shop:2001"

# 查询时按城市路由
127.0.0.1:6379> GEOSEARCH stores:beijing FROMLONLAT 116.400 39.910 BYRADIUS 3 km ASC
\`\`\`

## 10.10 踩坑提示

- **经纬度顺序**：Redis 命令是 **经度在前、纬度在后**（lon, lat），但很多 API（如高德）是纬度在前，传参时务必对齐。
- **GEORADIUS 已废弃**：6.2+ 用 GEOSEARCH，老代码升级时替换。
- **Geo 是 ZSet**：能用 ZREM/ZCARD，但别用 ZADD（要算 GeoHash），否则破坏数据。
- **极地精度差**：纬度接近 ±85° 时 GeoHash 误差大，南极北极场景不适合。
- **范围查询非精确**：GeoHash 是网格近似，边界点可能漏判或多判，业务侧可二次过滤。
- **member 唯一**：同一个 key 下 member 唯一，重复 GEOADD 同一 member 会更新位置。
- **大 key 风险**：所有门店塞一个 Geo key，元素百万级时 GEOSEARCH 仍是 O(N+logM)，可按城市分桶（\`stores:beijing\`、\`stores:shanghai\`）。
- **GEOSEARCH STORE 版**：GEOSEARCHSTORE 的结果是 ZSet，score 是 GeoHash 整数而非距离。

## 10.11 本章小结

- Geo 底层是 ZSet + GeoHash，存经纬度、算距离、按半径/矩形查询。
- GEOADD 写入（lon, lat, member），GEODIST 算距离，GEOPOS 取坐标，GEOHASH 取编码串。
- GEORADIUS/GEORADIUSBYMEMBER 6.2 起废弃，**GEOSEARCH** 是新标准，FROMMEMBER/FROMLONLAT + BYRADIUS/BYBOX 更清晰。
- WITHDIST/WITHCOORD/WITHHASH/ASC/DESC/COUNT 提供富查询，GEOSEARCHSTORE 固化结果。
- GeoHash 精度表：6 位约街道级（1.2km），8 位约室内级（38m）。
- 典型应用：**附近门店、附近的人、距离计算、LBS 推荐、按城市分桶**。
- 注意经纬度顺序、按城市分桶、极地精度差、本质是 ZSet。

下一章学习用 12KB 内存统计 1 亿 UV 的**近似算法 HyperLogLog**，以及布隆过滤器、发布订阅等扩展结构。`
  },
  {
    id: "redis-ch11",
    group: "第二部分 数据结构进阶",
    icon: "📊",
    title: "第 11 章 HyperLogLog 与其他结构",
    content: `# 第 11 章 HyperLogLog 与其他结构

本章收尾"数据结构进阶"部分，介绍三类"省内存利器"：HyperLogLog 做基数去重、布隆过滤器做存在性判断、布谷鸟过滤器做可删除的近似集合。此外还介绍 Redis 的发布订阅（Pub/Sub）机制和 Modules 生态。它们用极小内存解决海量数据场景。

## 11.1 HyperLogLog 概述

HyperLogLog（HLL）是 Redis 2.8.9 引入的**基数估算**算法。它的核心价值是：**用固定 12KB 内存，估算上亿元素的去重数量，标准误差仅 0.81%**。

### 关键参数

| 参数 | 值 |
| --- | --- |
| 固定内存 | 约 **12KB**（16384 个寄存器，每个 6 位） |
| 标准误差 | **0.81%** |
| 最大基数 | 2^64 ≈ 1.8 × 10^19 |
| 命令 | PFADD / PFCOUNT / PFMERGE |

> **HLL 的本质**：用哈希函数的"前导零个数"来估算基数。看到的前导零越多，说明哈希空间越稀疏，元素越少；反之越多。这是一种概率算法，不是精确计数。

## 11.2 PFADD / PFCOUNT / PFMERGE

\`\`\`bash
# PFADD key element [element ...]
# 添加访问用户（重复会自动去重，返回 1 表示基数可能变化）
127.0.0.1:6379> PFADD page:home:uv user1 user2 user3 user4
(integer) 1
127.0.0.1:6379> PFADD page:home:uv user1 user2 user5
(integer) 0     # 基数未变（user1/user2 已在），返回 0

# PFCOUNT key [key ...]
# 估算基数（去重后的数量）
127.0.0.1:6379> PFCOUNT page:home:uv
(integer) 5
\`\`\`

### PFMERGE：合并多个 HLL

\`\`\`bash
# PFMERGE destkey sourcekey [sourcekey ...]
# 一周的 UV 合并成月 UV
127.0.0.1:6379> PFADD uv:20240101 u1 u2 u3
127.0.0.1:6379> PFADD uv:20240102 u2 u3 u4
127.0.0.1:6379> PFMERGE uv:202401 uv:20240101 uv:20240102
OK
127.0.0.1:6379> PFCOUNT uv:202401
(integer) 4    # u1 u2 u3 u4 去重后 4 个
\`\`\`

> **PFADD 返回 0 不代表"元素之前就在"**：只代表"基数估算值没变"。多次 PFADD 同一元素行为相同，这是 HLL 的概率特性。

## 11.3 HLL vs Set vs Bitmap 对比

| 方案 | 1 亿 UV 内存 | 精确 | 能否取具体元素 | 能否合并 |
| --- | --- | --- | --- | --- |
| **Set** | ~1.5GB | 精确 | 能 | SUNIONSTORE |
| **Bitmap** | ~12MB | 精确 | 能（按位） | BITOP OR |
| **HyperLogLog** | **12KB** | **近似（误差 0.81%）** | **不能** | PFMERGE |

### 何时用 HLL

- ✅ 只要"去重后的总数"，不关心具体是谁
- ✅ 数据量极大（百万、亿级），能接受 ~1% 误差
- ✅ 需要合并多个数据源（如日 UV 合并月 UV）
- ❌ 需要"某元素是否已存在" -> 用 Set / Bitmap / Bloom
- ❌ 需要精确计数 -> 用 Set / Bitmap（ID 稠密时）
- ❌ 元素数量很少（< 1 万）-> 直接用 Set，HLL 的 12KB 固定开销不划算

> **选型口诀**：要精确且能取元素用 Set/Bitmap；只要总数、能接受误差用 HLL，省 10 万倍内存。

## 11.4 HLL 应用场景

### 场景一：网站 UV 统计

\`\`\`bash
# 每日 UV
127.0.0.1:6379> PFADD site:uv:20240101 user-A
127.0.0.1:6379> PFADD site:uv:20240101 user-B
127.0.0.1:6379> PFCOUNT site:uv:20240101
(integer) 2

# 月度 UV（合并每日 HLL，比累加日 UV 更准——因为日间有重复用户）
127.0.0.1:6379> PFMERGE site:uv:202401 site:uv:20240101 site:uv:20240102 site:uv:20240131
127.0.0.1:6379> PFCOUNT site:uv:202401
\`\`\`

### 场景二：搜索热词独立用户数

\`\`\`bash
# 每个搜索词记录独立搜索用户
127.0.0.1:6379> PFADD search:redis user1 user2
127.0.0.1:6379> PFADD search:redis user3
127.0.0.1:6379> PFCOUNT search:redis
(integer) 3

# 看哪些词最热门（用 ZSet 排序 HLL 的 PFCOUNT，定时刷新）
127.0.0.1:6379> ZADD hot:search 3 search:redis
\`\`\`

### 场景三：实时在线人数

\`\`\`bash
# 每个直播间用 HLL 统计独立观众数
127.0.0.1:6379> PFADD live:room:1001:audience user1 user2 user3
127.0.0.1:6379> PFCOUNT live:room:1001:audience
(integer) 3
\`\`\`

> **HLL 的限制**：① 只能估"多少个"，不能告诉你"是不是某元素"；② 单 key 12KB，key 数量多时仍需关注总量；③ PFCOUNT 在大 HLL 上是 O(1) 但有常数开销，别高频调用。

## 11.5 发布订阅（Pub/Sub）

除了数据结构，Redis 还内置了**发布订阅（Publish/Subscribe）**机制，实现简单的消息广播。Pub/Sub 是"fire and forget"模式——消息不持久化，没有 ACK，离线订阅者收不到历史消息。

### 基本用法

\`\`\`bash
# 终端 1：订阅频道
127.0.0.1:6379> SUBSCRIBE news
Reading messages... (press Ctrl-C to quit)
1) "subscribe"
2) "news"
3) (integer) 1

# 终端 2：发布消息
127.0.0.1:6379> PUBLISH news "hello world"
(integer) 1     # 返回收到消息的订阅者数

# 终端 1 收到：
1) "message"
2) "news"
3) "hello world"
\`\`\`

### 模式订阅 PSUBSCRIBE

\`\`\`bash
# 订阅匹配模式（* 通配）
127.0.0.1:6379> PSUBSCRIBE news.*
1) "psubscribe"
2) "news.*"
3) (integer) 1

# 发布到 news.tech 频道
127.0.0.1:6379> PUBLISH news.tech "redis 7.0 released"
(integer) 1

# 订阅者收到：
1) "pmessage"
2) "news.*"          # 匹配的模式
3) "news.tech"       # 实际频道
4) "redis 7.0 released"
\`\`\`

### 其他命令

\`\`\`bash
# 退订
127.0.0.1:6379> UNSUBSCRIBE news
127.0.0.1:6379> PUNSUBSCRIBE news.*

# 查看活跃频道（当前有订阅者的）
127.0.0.1:6379> PUBSUB CHANNELS
1) "news"

# 按模式查活跃频道
127.0.0.1:6379> PUBSUB CHANNELS news*

# 查某频道订阅者数
127.0.0.1:6379> PUBSUB NUMSUB news
1) "news"
2) (integer) 1

# 查模式订阅总数
127.0.0.1:6379> PUBSUB NUMPAT
(integer) 1
\`\`\`

### Pub/Sub 命令汇总

| 命令 | 作用 |
| --- | --- |
| \`PUBLISH channel msg\` | 发布消息到频道 |
| \`SUBSCRIBE ch [ch ...]\` | 订阅频道 |
| \`UNSUBSCRIBE [ch ...]\` | 退订 |
| \`PSUBSCRIBE pattern\` | 模式订阅 |
| \`PUNSUBSCRIBE [pattern]\` | 模式退订 |
| \`PUBSUB CHANNELS\` | 查活跃频道 |
| \`PUBSUB NUMSUB ch\` | 查频道订阅数 |
| \`PUBSUB NUMPAT\` | 查模式订阅数 |

> **Pub/Sub vs Stream**：Pub/Sub 是"广播 + 不持久"，消息发出去若没人收就丢了；Stream 是"持久 + 消费组"，消息存着等消费。需要可靠投递用 Stream，需要实时广播用 Pub/Sub。
>
> **Pub/Sub 典型应用**：实时聊天室广播、配置变更通知、Redis 集群键空间通知（keyspace notification）。

## 11.6 布隆过滤器（RedisBloom 模块）

布隆过滤器（Bloom Filter）是**存在性判断**的近似数据结构：能告诉你"肯定不在"或"可能在"，不会漏报但可能误报。

> Redis 核心不内置 Bloom Filter，需要 **RedisBloom 模块**。Docker 启动：\`docker run -p 6379:6379 redis/redis-stack:latest\`。

\`\`\`bash
# BF.RESERVE key error_rate capacity —— 创建过滤器
# 容量 10000、误判率 0.1%
127.0.0.1:6379> BF.RESERVE filter:emails 0.001 10000
OK

# BF.ADD key element —— 添加元素
127.0.0.1:6379> BF.ADD filter:emails "a@b.com"
(integer) 1
127.0.0.1:6379> BF.MADD filter:emails "c@d.com" "e@f.com"
1) (integer) 1
2) (integer) 1

# BF.EXISTS key element —— 判断是否存在（1 可能存在，0 肯定不存在）
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

## 11.7 布谷鸟过滤器

布谷鸟过滤器（Cuckoo Filter）是 Bloom 的升级版，**支持删除**，且在低误判率下内存更省：

\`\`\`bash
# CF.RESERVE key capacity —— 创建
127.0.0.1:6379> CF.RESERVE filter:tags 10000
OK

# CF.ADD key element —— 添加
127.0.0.1:6379> CF.ADD filter:tags "redis"
(integer) 1
127.0.0.1:6379> CF.ADD filter:tags "cache"

# CF.EXISTS key element —— 判断
127.0.0.1:6379> CF.EXISTS filter:tags "redis"
(integer) 1

# CF.DEL key element —— 删除（Bloom 做不到！）
127.0.0.1:6379> CF.DEL filter:tags "redis"
(integer) 1
127.0.0.1:6379> CF.EXISTS filter:tags "redis"
(integer) 0
\`\`\`

### Bloom vs Cuckoo

| 维度 | Bloom Filter | Cuckoo Filter |
| --- | --- | --- |
| 是否支持删除 | 否 | 是 |
| 误判率相同时内存 | 较大 | 较小（低误判率下） |
| 查询性能 | k 次哈希 | 2 次 |
| 实现复杂度 | 简单 | 较复杂 |
| 接近上限时性能 | 稳定 | 插入可能失败 |

> **选型**：需要删除用 Cuckoo；只增不删、追求稳定用 Bloom。
>
> **Bloom 不能删的原因**：多个元素可能共享同一位，删一个会影响其他元素。

## 11.8 Redis Modules 生态

Redis 通过 Module 机制扩展能力，以下是官方/社区主流模块：

| 模块 | 功能 | 典型命令前缀 |
| --- | --- | --- |
| **RedisJSON** | 原生 JSON 存储与查询（支持嵌套、JSONPath） | JSON.SET / JSON.GET |
| **RediSearch** | 全文搜索、二级索引、聚合查询 | FT.CREATE / FT.SEARCH |
| **RedisBloom** | 布隆过滤器、布谷鸟过滤器、Top-K、Count-Min Sketch | BF.* / CF.* |
| **RedisGraph** | 图数据库（Cypher 查询语言） | GRAPH.QUERY |
| **RedisTimeSeries** | 时间序列数据 | TS.ADD / TS.RANGE |
| **RedisAI** | 机器学习模型推理 | AI.MODELRUN |

### RedisJSON 示例

\`\`\`bash
# 存储 JSON 文档
127.0.0.1:6379> JSON.SET user:1001 $ '{"name":"alice","age":30,"tags":["redis","go"]}'
OK

# 读取整个文档
127.0.0.1:6379> JSON.GET user:1001 $
"[{\\"name\\":\\"alice\\",\\"age\\":30,\\"tags\\":[\\"redis\\",\\"go\\"]}]"

# 读取部分字段（JSONPath）
127.0.0.1:6379> JSON.GET user:1001 $.name
"\\"alice\\""

# 修改部分字段
127.0.0.1:6379> JSON.SET user:1001 $.age 31
OK
\`\`\`

### RediSearch 示例

\`\`\`bash
# 创建索引（基于 RedisJSON 或 Hash）
127.0.0.1:6379> FT.CREATE idx:user ON json PREFIX 1 user: SCHEMA $.name TEXT $.age NUMERIC
OK

# 全文搜索
127.0.0.1:6379> FT.SEARCH idx:user "alice"
1) (integer) 1
2) "user:1001"
3) ...

# 数值范围查询
127.0.0.1:6379> FT.SEARCH idx:user "@age:[30 40]"
\`\`\`

> **redis-stack 镜像**：\`redis/redis-stack:latest\` 包含 RedisJSON + RediSearch + RedisBloom + RedisTimeSeries 等常用模块，开箱即用。

## 11.9 综合应用场景

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

### 场景：实时广播（Pub/Sub）

\`\`\`bash
# 配置变更广播到所有实例
127.0.0.1:6379> PUBLISH config:changed "cache:invalidated:user:1001"

# 各实例订阅
127.0.0.1:6379> SUBSCRIBE config:changed
\`\`\`

## 11.10 踩坑提示

- **HLL 不能取元素**：只能告诉你"大约 N 个"，不能问"X 在不在"。要判断存在性用 Bloom/Cuckoo。
- **HLL 误差**：标准 0.81%，少数场景下会偏差更大；要精确用 Bitmap（ID 稠密时）。
- **PFADD 重复返回 0**：不代表"元素之前就在"，只代表"基数没变"。
- **Bloom 不能删**：要可删除场景用 Cuckoo，或用"计数布隆过滤器"。
- **Bloom 误判率设置**：\`BF.RESERVE\` 时要预留容量，超容量后误判率急剧上升。
- **RedisBloom 是模块**：自建 Redis 默认没装，用 \`redis-stack\` 镜像或编译加载模块。
- **Cuckoo 接近上限插入失败**：\`CF.ADD\` 在过滤器满时会返回 0，要监控容量。
- **HLL 合并不精确**：PFMERGE 多个 HLL 误差会累积，月度 UV 比每日 UV 之和更准（直接用日 HLL 合并）。
- **Pub/Sub 不持久**：离线订阅者收不到消息，需要可靠投递用 Stream。
- **Pub/Sub 性能**：订阅者多时 PUBLISH 会阻塞，且缓冲区满会断开慢消费者。

## 11.11 本章小结

- **HyperLogLog**：12KB 固定内存估算基数，误差 0.81%，PFADD/PFCOUNT/PFMERGE 三件套，**只知多少不知是谁**。
- **Bloom Filter**：存在性判断，"肯定不在"或"可能在"，BF.RESERVE/ADD/EXISTS，**不能删除**，需 RedisBloom 模块。
- **Cuckoo Filter**：Bloom 升级版，**支持删除**，CF.ADD/EXISTS/DEL，低误判率下更省内存。
- **Pub/Sub**：发布订阅广播，PUBLISH/SUBSCRIBE/PSUBSCRIBE，消息不持久、无 ACK，适合实时通知。
- **Redis Modules 生态**：RedisJSON（JSON 文档）、RediSearch（全文搜索）、RedisBloom（概率结构）、RedisGraph（图数据库）、RedisTimeSeries（时序）。
- 选型口诀：**要总数用 HLL，要存在性只增不删用 Bloom，要可删除用 Cuckoo，要可靠消息用 Stream，要实时广播用 Pub/Sub**。
- 内存优化思维：近似算法换内存，是 Redis 处理海量数据的核心思路。

第二部分"数据结构进阶"结束。第三部分进入**持久化与过期策略**——RDB、AOF、内存淘汰，搞懂数据安全和内存管理。`
  }
];

export { chapters };
