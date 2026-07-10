// =============================================================
// 后端开发综合教程 —— 第六批章节（数据存储分组，共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. backend-redis             — Redis 实战
//   2. backend-cache             — 缓存策略与一致性
//   3. backend-sharding          — 分库分表
//   4. backend-readwrite-split   — 读写分离
//   5. backend-connection-pool   — 数据库连接池
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名（数据存储）
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（语言无关原理 + 多语言对照）
//   code    : 可直接运行的 Node.js 代码（沙箱内执行，用内存结构模拟网络/存储）
//
// 代码运行环境约束（沙箱）：
//   - 仅可 require: fs, path, os, url, crypto, util, events, stream,
//     buffer, querystring, string_decoder, zlib, assert, timers
//   - 没有 http / net / child_process / dns / redis / ioredis，
//     Redis/网络/数据库概念用内存数据结构模拟
//   - 全局: console, process, Buffer, setTimeout, Promise, URL 等
//   - 支持 top-level await，用 console.log 输出结果
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：Redis 实战
  // =========================================================
  {
    id: "backend-redis",
    group: "数据存储",
    icon: "🟥",
    title: "Redis 实战",
    content: `## Redis 实战

**Redis（Remote Dictionary Server）** 是当前后端工程中最重要的一款内存数据库。它以"快"著称——单实例读写性能可达每秒十万次量级，且提供了远比传统关系数据库丰富的数据结构。在缓存、计数器、排行榜、分布式锁、消息队列、限流、实时统计等场景中，Redis 几乎是不可替代的基础设施。可以说，现代后端系统离开 Redis，很多高并发场景根本无从落地。

本章将从"Redis 是什么、为什么快"讲起，逐个剖析五大核心数据结构的底层实现、命令、应用场景，再覆盖持久化、过期与淘汰、高可用、典型应用、使用规范，最后与 Memcached 做对比。目标是让读者不仅会用 Redis，还能在面试与生产中讲清"为什么"。

### 一、Redis 是什么

#### 1.1 一句话定义

Redis 是一个开源的、基于内存的、键值对（key-value）数据库，它提供了字符串、哈希、列表、集合、有序集合等多种数据结构，并支持持久化、主从复制、高可用集群等企业级特性。

它有四个关键定语：

- **基于内存**：数据主要存放在内存中，读写速度是磁盘数据库无法比拟的。
- **键值对**：所有数据以 key 为索引，value 可以是多种结构化类型，而非关系数据库的"行"。
- **单线程命令处理**：核心命令执行在单线程中，避免了锁竞争，简化了并发模型。
- **多用途**：既能做缓存，也能做主数据库（部分场景），还能做消息队列、计算引擎。

#### 1.2 Redis 的定位

很多人把 Redis 等同于"缓存"，这是片面的。Redis 的角色随场景而变：

| 角色 | 说明 | 典型场景 |
| --- | --- | --- |
| 缓存层 | 放在数据库前，扛住读压力 | 商品详情页、用户信息 |
| 主数据库 | 业务数据直接存 Redis | 排行榜、计数器、会话 |
| 消息队列 | List/Stream 实现队列 | 异步任务、解耦 |
| 计算引擎 | 利用其原子操作做实时计算 | 限流、统计、点赞 |
| 分布式协调 | 基于其实现锁与选举 | 分布式锁、幂等 |

#### 1.3 Redis 的单线程模型

Redis 的核心命令处理是单线程的（6.0 后引入多线程处理网络 IO，但命令执行仍单线程）。这一点常被误解为"性能差"，实际上恰恰相反，单线程是 Redis 快的重要原因之一。

单线程模型的核心思想：

\`\`\`
客户端1 ─┐
客户端2 ─┼─▶ [IO 多路复用 epoll] ─▶ [命令队列] ─▶ [单线程串行执行] ─▶ [写内存] ─▶ 回复
客户端3 ─┘
\`\`\`

- **IO 多路复用**：一个线程监听成千上万个 socket 连接，哪个有数据就处理哪个，避免每个连接一个线程的开销。
- **命令串行执行**：所有命令在一个线程内排队执行，无需加锁，没有上下文切换。
- **纯内存操作**：单条命令通常在纳秒到微秒级，单线程已足够快。

> 注意：单线程指的是"命令执行"，Redis 也有后台线程做异步任务（如 AOF 刷盘、大 key 删除、关闭文件描述符），这些不影响主线程性能。

### 二、Redis 为什么快

Redis 单实例可达 10 万+ QPS，集群可达千万级。它的"快"是多个因素叠加的结果，缺一不可。

#### 2.1 完全基于内存

内存的随机访问延迟在 100 纳秒量级，而 SSD 磁盘在 100 微秒量级，机械硬盘在 10 毫秒量级。Redis 数据在内存中，避免了磁盘 IO 这一最大瓶颈。这是"快"的物理基础。

| 存储介质 | 随机访问延迟 | 数量级 |
| --- | --- | --- |
| CPU 寄存器 | <1ns | 极快 |
| CPU L1 缓存 | ~1ns | 极快 |
| 内存（DRAM） | ~100ns | 快 |
| SSD | ~100μs | 中 |
| 机械硬盘 | ~10ms | 慢 |
| 网络（同机房） | ~500μs | 中 |

#### 2.2 单线程避免锁竞争与上下文切换

多线程程序的性能损耗主要来自三处：

- **锁竞争**：共享数据需要加锁，锁争用导致线程阻塞，CPU 空转。
- **上下文切换**：线程数大于 CPU 核数时，OS 在线程间切换，保存/恢复寄存器、缓存失效，开销显著。
- **缓存一致性**：多核间数据同步带来 cache line 抖动。

Redis 单线程模型天然回避了这些问题。对于内存数据库而言，瓶颈往往在网络 IO 而非 CPU，单线程已能打满网络带宽。

#### 2.3 IO 多路复用（epoll）

Redis 在 Linux 上使用 epoll 实现 IO 多路复用。其原理是：内核维护一个就绪列表，当某个 socket 有数据可读时，内核通知应用，应用只需处理"有事干"的连接，无需轮询所有连接。

\`\`\`c
// epoll 的核心调用（伪代码）
int epfd = epoll_create1(0);
epoll_ctl(epfd, EPOLL_CTL_ADD, client_fd, &event);  // 注册关注
while (1) {
    int n = epoll_wait(epfd, events, MAX, -1);       // 阻塞等待就绪
    for (int i = 0; i < n; i++) {
        handle(events[i]);                            // 处理就绪连接
    }
}
\`\`\`

epoll 相比 select/poll 的优势：

| 模型 | 时间复杂度 | 连接数限制 | 是否遍历全部 |
| --- | --- | --- | --- |
| select | O(n) | FD_SETSIZE(1024) | 是 |
| poll | O(n) | 无限制 | 是 |
| epoll | O(1) | 无限制 | 否（只返回就绪） |

#### 2.4 高效的数据结构

Redis 为不同场景设计了专门优化的数据结构：

- **SDS（Simple Dynamic String）**：相比 C 字符串，记录了长度，获取长度 O(1)，二进制安全，防止缓冲区溢出。
- **ziplist（压缩列表）**：小数据量时连续存储，节省内存，cache 友好。
- **quicklist（快速列表）**：List 的底层，链表 + ziplist 结合，兼顾内存与性能。
- **skiplist（跳跃表）**：ZSet 的核心，O(logN) 范围查询，实现比红黑树简单。
- **intset（整数集合）**：全整数 Set 用它，紧凑存储。
- **dict（哈希表）**：渐进式 rehash，扩容不阻塞。

#### 2.5 简单高效的协议（RESP）

Redis 使用 RESP（REdis Serialization Protocol）协议，文本格式，人可读，解析极快：

\`\`\`
*3\r\n$3\r\nSET\r\n$3\r\nkey\r\n$5\r\nvalue\r\n
\`\`\`

- \`*\` 开头表示数组元素个数
- \`$\` 开头表示字符串长度
- 解析器无需复杂状态机，几行代码搞定

协议简单带来两个好处：客户端实现容易、解析开销低。

### 三、Redis 五大数据结构详解

Redis 的强大在于它不是简单的"字符串缓存"，而是提供了五种各有所长的数据结构。选对结构，往往能让复杂需求用几条命令解决。

#### 3.1 String（字符串）

String 是 Redis 最基础的结构，但它能存的不只是字符串——还能存整数、浮点数、二进制数据（图片、序列化对象），最大 512MB。

**底层实现**：SDS（Simple Dynamic String）。SDS 在 C 字符串基础上增加了长度字段、空闲空间字段，支持预分配和惰性释放，减少内存重分配次数。

**常用命令**：

\`\`\`
SET key value [EX seconds] [PX millis] [NX|XX]   # 设置
GET key                                          # 获取
DEL key                                          # 删除
INCR key / DECR key                              # 原子自增自减
INCRBY key n / DECRBY key n                      # 指定步长
APPEND key value                                 # 追加
STRLEN key                                       # 长度
SETEX key seconds value                          # 带过期设置
SETNX key value                                  # 不存在才设置（分布式锁基础）
MSET k1 v1 k2 v2 / MGET k1 k2                    # 批量
\`\`\`

**应用场景**：

1. **缓存对象**：将用户信息 JSON 序列化后存为 String。
   \`\`\`java
   // Java
   String json = objectMapper.writeValueAsString(user);
   jedis.set("user:" + userId, json);
   User u = objectMapper.readValue(jedis.get("user:" + userId), User.class);
   \`\`\`

2. **计数器**：利用 INCR 的原子性实现 PV/UV、点赞数。
   \`\`\`go
   // Go
   redis.Incr(ctx, "article:123:likes")   // 点赞 +1
   \`\`\`

3. **分布式锁**：SET key value NX EX 实现。
   \`\`\`python
   # Python
   ok = redis.set("lock:order:100", token, nx=True, ex=10)
   \`\`\`

4. **全局 ID**：INCR 生成自增 ID。
   \`\`\`js
   // Node.js
   const id = await redis.incr('global:order:id');
   \`\`\`

5. **限流计数**：固定窗口限流。
   \`\`\`java
   // 每分钟最多 100 次
   String key = "rate:" + userId + ":" + (System.currentTimeMillis()/60000);
   Long count = jedis.incr(key);
   if (count == 1) jedis.expire(key, 60);
   if (count > 100) return "限流";
   \`\`\`

**坑与注意**：
- 存大对象时（>10KB）要警惕"大 key"，会导致阻塞与内存浪费。
- INCR 操作的 key 必须能解析为整数，否则报错。
- 用 String 存对象时，更新单个字段需整体读写，不如 Hash 高效。

#### 3.2 Hash（哈希表）

Hash 是一个键值对集合，适合存储对象。相比把对象 JSON 序列化存成 String，Hash 能单独修改某个字段，无需整体读写。

**底层实现**：
- 数据量小时用 ziplist（紧凑，省内存）。
- 数据量或字段变大时升级为 hashtable（O(1) 访问，但内存开销大）。
- 阈值由 \`hash-max-ziplist-entries\`（默认 128）和 \`hash-max-ziplist-value\`（默认 64）控制。

**常用命令**：

\`\`\`
HSET key field value          # 设置单字段
HGET key field                # 获取单字段
HMSET key f1 v1 f2 v2         # 批量设置
HMGET key f1 f2               # 批量获取
HGETALL key                   # 获取所有字段
HDEL key field                # 删除字段
HINCRBY key field n           # 字段自增
HEXISTS key field             # 判断字段是否存在
HLEN key                      # 字段数
HKEYS key / HVALS key         # 所有键/所有值
\`\`\`

**应用场景**：

1. **对象存储**：用户、商品、配置信息。
   \`\`\`java
   // Java：存储用户对象
   jedis.hset("user:100", "name", "张三");
   jedis.hset("user:100", "age", "28");
   jedis.hset("user:100", "city", "北京");
   String city = jedis.hget("user:100", "city");  // 单独取城市
   \`\`\`

2. **购物车**：field=商品ID，value=数量。
   \`\`\`go
   // Go：购物车
   redis.HSet(ctx, "cart:user:1", "sku:1001", 2)
   redis.HIncrBy(ctx, "cart:user:1", "sku:1001", 1)  // 加购
   \`\`\`

3. **部分更新**：只更新对象的个别字段，避免整体覆盖。
   \`\`\`python
   # Python：只更新用户最后登录时间
   redis.hset("user:100", "last_login", int(time.time()))
   \`\`\`

4. **计数汇总**：每个字段一个独立计数器。
   \`\`\`js
   // Node.js：页面各模块的点击数
   await redis.hincrby('page:home:clicks', 'banner', 1);
   await redis.hincrby('page:home:clicks', 'footer', 1);
   \`\`\`

**String vs Hash 存对象的对比**：

| 维度 | String 存 JSON | Hash 存字段 |
| --- | --- | --- |
| 内存占用 | 单 key，省 | 多字段，略多 |
| 字段更新 | 整体读写 | 单字段更新 |
| 字段查询 | 需反序列化 | 直接 HGET |
| 过期控制 | 整个对象过期 | 无法对单字段过期 |
| 适合场景 | 读多写少、整体读写 | 字段频繁单独更新 |

**坑**：HGETALL 在大 Hash（万级字段）上是阻塞操作，生产中应改用 HSCAN。

#### 3.3 List（列表）

List 是按插入顺序排序的字符串链表，支持在两端插入和弹出。

**底层实现**：
- Redis 3.2 之前：元素少用 ziplist，多用 linkedlist。
- Redis 3.2 之后：统一用 quicklist（双向链表，每个节点是一个 ziplist），兼顾内存与性能。
- Redis 7.0 之后：引入 listpack 替代 ziplist。

**常用命令**：

\`\`\`
LPUSH key v1 v2          # 左端插入
RPUSH key v1 v2          # 右端插入
LPOP key / RPOP key      # 左/右端弹出
LRANGE key start stop    # 范围获取（0 -1 全部）
LLEN key                 # 长度
LINDEX key index         # 按下标取
LSET key index value     # 按下标改
LREM key count value     # 删除指定元素
LTRIM key start stop     # 只保留区间
BLPOP key timeout        # 阻塞式左弹出（队列消费）
LINSERT key BEFORE|AFTER pivot value  # 插入
\`\`\`

**应用场景**：

1. **消息队列**：LPUSH 生产，BRPOP 阻塞消费。
   \`\`\`java
   // Java：生产者
   jedis.lpush("queue:order", orderId);
   // 消费者（阻塞 30 秒）
   List<String> item = jedis.brpop(30, "queue:order");
   \`\`\`

2. **最新列表**：朋友圈最新动态、最新新闻。
   \`\`\`go
   // Go：最新 10 条新闻
   redis.LPush(ctx, "news:latest", newsID)
   redis.LTrim(ctx, "news:latest", 0, 9)  // 只保留前 10 条
   ids := redis.LRange(ctx, "news:latest", 0, -1)
   \`\`\`

3. **操作日志**：记录用户最近操作。
   \`\`\`python
   # Python：最近操作
   redis.lpush("log:user:1", "login", "view", "click")
   redis.ltrim("log:user:1", 0, 99)  # 保留最近 100 条
   \`\`\`

4. **任务分发给多个消费者**：RPOPLPUSH 实现可靠队列。
   \`\`\`js
   // Node.js：从待处理移到处理中，处理完再删
   const taskId = await redis.rpoplpush('queue:todo', 'queue:processing');
   \`\`\`

**坑**：
- List 没有去重，相同元素会重复存在。
- LRANGE 全量查询大 List 会阻塞，用 LLEN + 分页。
- BLPOP 长时间阻塞会占用连接，需设合理超时。

#### 3.4 Set（集合）

Set 是字符串的无序集合，元素唯一，支持交集、并集、差集等集合运算。

**底层实现**：
- 全为整数且数量少时用 intset（紧凑数组）。
- 否则用 hashtable（O(1) 判存在）。
- 阈值：\`set-max-intset-entries\`（默认 512）。

**常用命令**：

\`\`\`
SADD key m1 m2              # 添加
SREM key m1                 # 删除
SMEMBERS key                # 所有成员
SISMEMBER key m             # 判断成员
SCARD key                   # 成员数
SRANDMEMBER key count       # 随机取
SPOP key count              # 随机弹出
SINTER k1 k2                # 交集
SUNION k1 k2                # 并集
SDIFF k1 k2                 # 差集（k1 有 k2 没有）
SINTERSTORE dest k1 k2      # 交集存到 dest
\`\`\`

**应用场景**：

1. **标签系统**：用户打标签、文章标签。
   \`\`\`java
   // Java：文章标签
   jedis.sadd("article:1:tags", "Java", "后端", "Redis");
   // 查找同时有 Java 和 Redis 标签的文章
   Set<String> ids = jedis.sinter("tag:Java", "tag:Redis");
   \`\`\`

2. **共同好友/共同关注**：集合交集。
   \`\`\`go
   // Go：共同好友
   common := redis.SInter(ctx, "friends:user:1", "friends:user:2")
   \`\`\`

3. **去重**：UV 统计、唯一访客。
   \`\`\`python
   # Python：统计 UV
   redis.sadd("uv:2024-01-01", userId)
   count = redis.scard("uv:2024-01-01")
   \`\`\`

4. **抽奖**：SPOP 随机弹出。
   \`\`\`js
   // Node.js：抽奖 3 名
   const winners = await redis.spop('lottery:users', 3);
   \`\`\`

5. **黑白名单**：SISMEMBER 判断。
   \`\`\`java
   boolean blocked = jedis.sismember("blacklist:ip", clientIp);
   \`\`\`

**坑**：SMEMBERS 大集合阻塞，用 SSCAN 分批；集合运算（SINTER 大集合）耗时，可能阻塞主线程，建议在从库执行或用 SSCAN。

#### 3.5 ZSet（有序集合）

ZSet 是 Redis 最有特色的结构：每个元素关联一个 score，按 score 排序，同时元素唯一。它让"排行榜"这类需求用一两条命令就能实现。

**底层实现**：skiplist（跳跃表）+ dict（哈希表）组合。
- **dict** 保存 member→score 映射，O(1) 查分数。
- **skiplist** 按 score 排序，支持范围查询 O(logN)。

为什么用跳跃表而不用红黑树？
- 实现更简单，代码易维护。
- 范围查询天然友好（链表顺序遍历）。
- 并发友好（局部锁更易实现，虽然 Redis 单线程不涉及）。
- 内存略多但可接受（每个节点多层指针）。

**常用命令**：

\`\`\`
ZADD key score member [score member ...]   # 添加，带分数
ZSCORE key member                          # 查分数
ZRANK key member                           # 升序排名
ZREVRANK key member                        # 降序排名
ZRANGE key start stop [WITHSCORES]         # 升序范围
ZREVRANGE key start stop [WITHSCORES]      # 降序范围
ZRANGEBYSCORE key min max                  # 按分数范围
ZINCRBY key increment member               # 增加分数
ZREM key member                            # 删除
ZCARD key                                  # 成员数
ZCOUNT key min max                         # 分数区间内数量
ZREMRANGEBYRANK key start stop             # 按排名删除
\`\`\`

**应用场景**：

1. **排行榜**：游戏积分、热榜。
   \`\`\`java
   // Java：游戏排行榜
   jedis.zadd("rank:game", 1500, "player1");
   jedis.zadd("rank:game", 2000, "player2");
   // 获取前 10 名（降序）
   Set<Tuple> top10 = jedis.zrevrangeWithScores("rank:game", 0, 9);
   \`\`\`

2. **延迟队列**：score 存执行时间戳，定时扫描到期任务。
   \`\`\`go
   // Go：延迟队列
   execTime := time.Now().Add(30 * time.Minute).Unix()
   redis.ZAdd(ctx, "delay:queue", &redis.Z{Score: float64(execTime), Member: taskID})
   // 消费：取当前时间之前的任务
   tasks := redis.ZRangeByScore(ctx, "delay:queue", &redis.ZRangeBy{
       Min: "0", Max: strconv.FormatInt(time.Now().Unix(), 10), Count: 100})
   \`\`\`

3. **时间线/Feed 流**：score 存时间戳，按时间排序。
   \`\`\`python
   # Python：用户时间线
   redis.zadd("timeline:user:1", {postID: timestamp})
   feeds = redis.zrevrange("timeline:user:1", 0, 19)  # 最近 20 条
   \`\`\`

4. **带权重的调度**：score 表示优先级。
   \`\`\`js
   // Node.js：优先级任务队列
   await redis.zadd('tasks:priority', 1, 'low-task', 5, 'mid-task', 9, 'high-task');
   \`\`\`

5. **滑动窗口限流**：score 存请求时间戳。
   \`\`\`java
   // Java：滑动窗口限流（每分钟 100 次）
   long now = System.currentTimeMillis();
   String key = "rate:" + userId;
   jedis.zremrangeByScore(key, 0, now - 60000);  // 移除 1 分钟前的
   jedis.zadd(key, now, now + "-" + Math.random());
   long count = jedis.zcard(key);
   jedis.expire(key, 60);
   if (count > 100) return "限流";
   \`\`\`

**坑**：
- ZSet 中 member 不能重复，重复 ZADD 等于更新 score。
- 大 ZSet（十万级）的 ZRANGE 全量返回仍会阻塞，控制返回条数。
- ZINCRBY 是原子的，适合高并发更新分数。

#### 3.6 五大结构速查对比

| 结构 | 特点 | 典型应用 | 底层结构 |
| --- | --- | --- | --- |
| String | 单值，可存数字/二进制 | 缓存、计数器、锁 | SDS |
| Hash | 字段-值映射 | 对象存储、购物车 | ziplist/hashtable |
| List | 有序链表 | 队列、最新列表 | quicklist |
| Set | 无序唯一集合 | 标签、去重、交并差 | intset/hashtable |
| ZSet | 有序唯一集合 | 排行榜、延迟队列 | skiplist+dict |

> 此外 Redis 还有 Bitmap（位图，做活跃统计）、HyperLogLog（基数估算，UV）、Geo（地理位置）、Stream（5.0 消息流）等扩展结构，本章聚焦五大核心。

### 四、Redis 持久化

Redis 是内存数据库，宕机会丢数据。持久化机制决定了数据安全性。Redis 提供两种主流方案：RDB 和 AOF，以及二者结合的混合持久化。

#### 4.1 RDB（快照持久化）

RDB 把某一时刻的内存数据以二进制快照形式写入磁盘，生成 dump.rdb 文件。

**触发方式**：
- **手动**：SAVE（阻塞主线程）、BGSAVE（fork 子进程，不阻塞）。
- **自动**：配置 \`save m n\`，如 \`save 900 1\` 表示 900 秒内 1 次修改则触发。

**原理**：BGSAVE 通过 fork 创建子进程，利用操作系统的 **写时复制（Copy-On-Write）** 机制，子进程遍历内存写快照，主进程继续服务。COW 保证子进程看到的是 fork 时刻的数据快照，主进程的修改不影响快照。

**优点**：
- 文件紧凑，体积小，恢复速度快。
- fork 子进程不影响主线程性能（除 fork 本身开销）。
- 适合做备份、灾难恢复、主从全量同步。

**缺点**：
- 两次快照之间宕机会丢数据，安全性不足。
- fork 在大内存实例上耗时（复制页表），可能造成毫秒级阻塞。
- 不适合对数据完整性要求极高的场景。

\`\`\`
# redis.conf RDB 配置
save 900 1       # 900s 内 1 次修改
save 300 10      # 300s 内 10 次修改
save 60 10000    # 60s 内 10000 次修改
dbfilename dump.rdb
dir /data/redis
stop-writes-on-bgsave-error yes
rdbcompression yes
\`\`\`

#### 4.2 AOF（追加持久化）

AOF 以追加方式记录每条写命令到 appendonly.aof 文件，恢复时重放命令。

**三种刷盘策略**（\`appendfsync\`）：

| 策略 | 含义 | 性能 | 安全性 |
| --- | --- | --- | --- |
| always | 每条命令都 fsync | 最差 | 最高（不丢数据） |
| everysec | 每秒 fsync 一次 | 较好 | 较高（最多丢 1 秒） |
| no | 由 OS 决定 fsync | 最好 | 最低 |

**AOF 重写（rewrite）**：随着命令累积，AOF 文件越来越大。重写会遍历当前内存，生成最小命令集（如对同一 key 的多次 SET 只保留最终值），大幅压缩文件。

\`\`\`
# redis.conf AOF 配置
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100   # 文件比上次大一倍时重写
auto-aof-rewrite-min-size 64mb    # 重写最小阈值
\`\`\`

**优点**：
- 数据安全性高，everysec 策略最多丢 1 秒。
- 日志格式可读，便于分析、误操作恢复。
- 重写压缩后体积可控。

**缺点**：
- 文件比 RDB 大，恢复速度慢（需重放命令）。
- everysec 下仍有一次 fsync 的 IO 开销。
- 重写时 fork 子进程，大内存实例有阻塞风险。

#### 4.3 混合持久化（Redis 4.0+）

混合持久化结合两者优点：AOF 重写时，不再写纯命令，而是先以 RDB 二进制格式写入当前内存快照，后续增量命令以 AOF 格式追加。

恢复时：先加载 RDB 部分（快），再重放 AOF 增量（补全）。既快又安全。

\`\`\`
aof-use-rdb-preamble yes   # 开启混合持久化
\`\`\`

**生产建议**：4.0+ 版本默认开启混合持久化，兼顾恢复速度与数据安全，是当前主流选择。

#### 4.4 RDB vs AOF 对比

| 维度 | RDB | AOF |
| --- | --- | --- |
| 持久化方式 | 全量快照 | 增量命令日志 |
| 数据安全性 | 可能丢分钟级数据 | 最多丢 1 秒 |
| 文件体积 | 小 | 大（重写后可压缩） |
| 恢复速度 | 快 | 慢 |
| 性能影响 | fork 时有开销 | 写时 fsync 开销 |
| 可读性 | 二进制不可读 | 文本可读 |
| 适用场景 | 备份、灾备 | 数据安全要求高 |

### 五、Redis 过期策略与内存淘汰

Redis 把数据放内存，内存有限，必须有机制管理"哪些数据该删"。

#### 5.1 过期策略

设置过期的 key（EXPIRE/SETEX/EX 参数），Redis 用两种策略组合删除：

1. **惰性删除**：访问 key 时检查是否过期，过期则删除。
   - 优点：CPU 友好，不主动扫描。
   - 缺点：过期 key 长期不被访问会一直占用内存（内存泄漏）。

2. **定期删除**：每隔一段时间随机抽取部分设置了过期的 key 检查，删除已过期的。
   - Redis 默认每秒 10 次（\`hz\` 配置），每次抽查部分 key。
   - 采用"自适应"策略：若过期比例高，增加抽查频率与数量。

两者结合：惰性删除保证"访问不过期"，定期删除保证"不访问也能清理"。

#### 5.2 内存淘汰策略

当内存达到 \`maxmemory\` 限制时，Redis 需要淘汰部分 key 腾空间。淘汰策略由 \`maxmemory-policy\` 配置：

| 策略 | 范围 | 算法 | 说明 |
| --- | --- | --- | --- |
| noeviction | - | - | 不淘汰，写入直接报错（默认） |
| allkeys-lru | 所有 key | LRU | 淘汰最久未使用 |
| allkeys-lfu | 所有 key | LFU | 淘汰使用频率最低（4.0+） |
| allkeys-random | 所有 key | 随机 | 随机淘汰 |
| volatile-lru | 设过期的 key | LRU | 仅在有过期时间的 key 中 LRU |
| volatile-lfu | 设过期的 key | LFU | 仅在过期 key 中 LFU |
| volatile-random | 设过期的 key | 随机 | 过期 key 中随机 |
| volatile-ttl | 设过期的 key | TTL | 优先淘汰快过期的 |

**选择建议**：
- 纯缓存场景：\`allkeys-lru\`（或 allkeys-lfu），命中率最高。
- 缓存+持久数据混存：\`volatile-lru\`，保护未设过期的核心数据。
- 不能容忍丢数据：\`noeviction\`，但要做好容量规划。

> Redis 的 LRU 是近似 LRU：不是严格的全局 LRU，而是随机采样（默认 5 个）淘汰最旧的，性能更高。LFU 用 Morris 计数器近似频率，更符合"热点"语义。

### 六、Redis 高可用

单点 Redis 是单点故障，生产必须做高可用。Redis 有三种主流高可用方案。

#### 6.1 主从复制

一主多从，主负责写，从负责读，数据异步复制。

\`\`\`
              ┌────────┐
   写请求 ──▶ │ Master │
              └────┬───┘
        ┌─────────┼─────────┐
        ▼         ▼         ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │ Slave1 │ │ Slave2 │ │ Slave3 │  ◀── 读请求
   └────────┘ └────────┘ └────────┘
\`\`\`

**复制过程**：
1. 从库发送 PSYNC 命令请求同步。
2. 主库执行 BGSAVE 生成 RDB，发送给从库。
3. 从库加载 RDB，期间主库的新写命令缓存在复制缓冲区。
4. RDB 加载完成后，主库发送缓冲区命令，进入增量复制。
5. 之后主库每条写命令实时异步发给从库。

**优点**：读写分离分担读压力、数据冗余备份。
**缺点**：主库宕机需人工介入切换、异步复制有延迟可能丢数据。

#### 6.2 哨兵（Sentinel）

Sentinel 是独立的监控进程，负责监控主从、自动故障转移、通知客户端。

\`\`\`
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │Sentinel1 │  │Sentinel2 │  │Sentinel3 │   监控集群
   └────┬─────┘  └────┬─────┘  └────┬─────┘
        │             │             │
        └─────┬───────┴───────┬─────┘
              ▼               ▼
         ┌────────┐      ┌────────┐
         │ Master │◀────▶│ Slave  │
         └────────┘      └────────┘
\`\`\`

**故障转移流程**：
1. **主观下线（SDOWN）**：单个 Sentinel 发现主库心跳超时。
2. **客观下线（ODOWN）**：超过半数（quorum）Sentinel 确认主库下线。
3. **选举 Sentinel Leader**：Raft 协议选出一个负责转移的 Sentinel。
4. **选择新主库**：按优先级、复制偏移量、runid 选最优从库。
5. **执行转移**：提升新主库，通知其他从库复制新主库，通知客户端。

**优点**：自动故障转移、客户端透明。
**缺点**：仍单点写入（主库）、切换有秒级中断、配置较复杂。

#### 6.3 集群（Cluster）

Redis Cluster 解决单主写入瓶颈，通过数据分片把数据分散到多个主节点，每个主节点有自己的从节点。

\`\`\`
   ┌─────────────────────────────────────────────┐
   │            16384 个哈希槽（slot）              │
   ├──────────┬──────────┬──────────┬─────────────┤
   │ 0-5460   │ 5461-10922│10923-16383│   ...      │
   ├──────────┼──────────┼──────────┼─────────────┤
   │ Master A │ Master B │ Master C │  Master D   │
   │  + Slave │  + Slave │  + Slave │  + Slave    │
   └──────────┴──────────┴──────────┴─────────────┘
\`\`\`

**分片原理**：
- 集群有 16384 个槽位（slot）。
- key 通过 CRC16 计算 hash，再对 16384 取模，决定落在哪个槽。
- 每个主节点负责一部分槽。
- 客户端缓存槽位映射，直接连对应节点（MOVED 重定向更新）。

**为什么是 16384？** Redis 作者 antirez 解释：
- 16384 = 2^14，心跳包每秒交换，包大小 = 节点数/8 字节，16384 槽 = 2KB，可控。
- 65536 槽包太大，浪费带宽。
- 集群规模通常不超过 1000 节点，16384 足够。

**优点**：水平扩展写入、自动故障转移、去中心化。
**缺点**：不支持跨槽多键操作（事务/Lua 受限）、运维复杂、最少 3 主 3 从。

**三种方案对比**：

| 维度 | 主从复制 | 哨兵 Sentinel | 集群 Cluster |
| --- | --- | --- | --- |
| 高可用 | 手动切换 | 自动故障转移 | 自动故障转移 |
| 写扩展 | 不支持 | 不支持 | 支持（分片） |
| 读扩展 | 支持 | 支持 | 支持 |
| 数据分片 | 否 | 否 | 是 |
| 复杂度 | 低 | 中 | 高 |
| 适用规模 | 小 | 中 | 大 |

### 七、Redis 典型应用场景

#### 7.1 缓存

最经典用法。读请求先查 Redis，miss 查 DB 回填。

\`\`\`java
// Java：缓存读取
String key = "user:" + userId;
String cached = jedis.get(key);
if (cached != null) return JSON.parseObject(cached, User.class);
User u = userDao.findById(userId);          // 回源
jedis.setex(key, 3600, JSON.toJSONString(u)); // 回填，1 小时过期
return u;
\`\`\`

#### 7.2 分布式锁

SET key value NX EX 实现加锁，Lua 脚本保证释放的原子性。

\`\`\`java
// Java：分布式锁
String token = UUID.randomUUID().toString();
String ok = jedis.set("lock:order:" + orderId, token, "NX", "EX", 10);
if (!"OK".equals(ok)) throw new RuntimeException("获取锁失败");
try {
    // 业务逻辑
} finally {
    // Lua 脚本：校验 token 一致才删，防止误删别人锁
    String lua = "if redis.call('get',KEYS[1])==ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end";
    jedis.eval(lua, 1, "lock:order:" + orderId, token);
}
\`\`\`

> 生产级分布式锁建议用 Redisson（看门狗自动续期、可重入、公平锁）。

#### 7.3 限流

固定窗口（INCR）、滑动窗口（ZSet）、令牌桶（Lua）。

#### 7.4 计数器

INCR/INCRBY 原子自增，PV、点赞、库存。

\`\`\`python
# Python：秒杀库存
remaining = redis.decr("stock:sku:1001")
if remaining < 0:
    redis.incr("stock:sku:1001")  # 回滚
    return "售罄"
\`\`\`

#### 7.5 排行榜

ZSet 天然支持。

#### 7.6 消息队列

List（简单队列）、Stream（5.0+，支持消费者组、ACK、持久化）。

#### 7.7 延迟队列

ZSet，score 为执行时间戳，定时轮询。

#### 7.8 位图统计

Bitmap 统计活跃用户、签到。

\`\`\`go
// Go：用户签到
redis.SetBit(ctx, "sign:user:1:202401", 15, 1)  // 1 月 16 日签到
// 统计本月签到次数
count := redis.BitCount(ctx, "sign:user:1:202401")
// 统计连续 3 天活跃用户（位运算）
redis.BitOpAnd(ctx, "active:3days", "active:2024-01-01", "active:2024-01-02", "active:2024-01-03")
\`\`\`

#### 7.9 地理位置

Geo 命令做"附近的人"、门店定位。

\`\`\`java
// Java：附近门店
jedis.geoadd("stores", 116.40, 39.90, "store:1");
List<GeoRadiusResponse> nearby = jedis.georadius("stores", 116.40, 39.90, 5, GeoUnit.KM);
\`\`\`

### 八、Redis 使用规范与避坑

生产中 Redis 的故障，90% 来自不规范使用。以下是高频坑点。

#### 8.1 大 Key

单个 key 的 value 过大（String >10KB、集合 >5000 元素）即为大 key。

**危害**：
- 阻塞主线程：DEL 大 key、HGETALL 大 Hash 都是 O(N) 阻塞操作。
- 网络阻塞：传输大 value 占用带宽。
- 内存不均：集群模式下大 key 所在节点内存倾斜。
- 持久化卡顿：fork 子进程复制页表慢。

**解决**：
- 拆分：大 Hash 按字段拆成多个 key，大 List 分段。
- 删除用 UNLINK（4.0+，异步删除）代替 DEL。
- 监控：\`redis-cli --bigkeys\`、\`memory usage key\`。

#### 8.2 热 Key

少数 key 承载极高访问量，导致单节点 CPU 打满。

**解决**：
- 本地缓存：在应用层缓存热 key（Caffeine），减少 Redis 访问。
- 多副本：把热 key 复制多份（key_1、key_2...），客户端随机访问。
- 监控：\`redis-cli --hotkeys\`（需开启 LFU）。

#### 8.3 避免阻塞命令

| 命令 | 时间复杂度 | 风险 |
| --- | --- | --- |
| KEYS * | O(N) | 全库扫描，生产禁用 |
| FLUSHALL | O(N) | 清空所有数据 |
| SMEMBERS（大集合） | O(N) | 阻塞 |
| HGETALL（大 Hash） | O(N) | 阻塞 |
| SORT | O(N+MlogM) | 阻塞 |

**替代**：用 SCAN 替代 KEYS，HSCAN/SSCAN 分批遍历。

#### 8.4 键命名规范

统一前缀 + 冒号分隔，体现业务与层级：

\`\`\`
业务:对象:ID:字段     user:100:profile
业务:维度:值          cache:product:1001
计数:对象:维度        counter:article:123:views
队列:业务             queue:order:pending
锁:业务:ID           lock:order:1001
\`\`\`

好处：可读性、便于监控统计（SCAN 按前缀）、避免冲突。

#### 8.5 合理设置过期

- 所有缓存 key 必须设过期，避免内存无限增长。
- 过期时间加随机扰动，防止雪崩：\`ttl = base + random(0, 300)\`。
- 持久数据（如配置）可设较长 TTL 定期刷新。

#### 8.6 其他规范

- 避免使用 SELECT 切换库（集群模式只支持 db0）。
- 批量操作用 Pipeline/MULTI 减少网络往返。
- 慎用事务（MULTI/EXEC 不支持回滚），复杂逻辑用 Lua。
- 连接池复用连接，避免频繁建连。
- 线上禁用 MONITOR 命令（输出每条命令，性能灾难）。

### 九、Redis vs Memcached

Memcached 是更早的内存缓存，常被拿来与 Redis 对比。

| 维度 | Redis | Memcached |
| --- | --- | --- |
| 数据结构 | 丰富（5+种） | 仅 KV 字符串 |
| 持久化 | RDB/AOF | 无 |
| 集群 | 原生 Cluster | 客户端分片 |
| 线程模型 | 单线程 | 多线程 |
| 内存管理 | 自主 allocator | slab allocation |
| 单 value 上限 | 512MB | 1MB |
| 过期策略 | 惰性+定期 | 惰性+LRU |
| 适用场景 | 缓存+数据库+队列 | 纯缓存 |

**选择建议**：
- 需要丰富结构、持久化、高可用 → Redis。
- 仅需简单纯 KV 缓存、多核充分利用 → Memcached 也可。
- 新项目基本首选 Redis，生态与功能全面胜出。

### 十、Redis 底层数据结构实现

Redis 的"五大结构"是对外暴露的抽象，底层每种结构都有多种编码（encoding），会根据元素数量、大小自动切换。理解底层实现，才能做精准调优。

#### 10.1 SDS（Simple Dynamic String）

Redis 不用 C 字符串，而用自定义的 SDS：

\`\`\`c
struct sdshdr {
    int len;      // 已使用长度
    int free;     // 剩余可用长度
    char buf[];   // 字节数组，保存实际数据
};
\`\`\`

**SDS 相比 C 字符串的优势**：

| 特性 | C 字符串 | SDS |
| --- | --- | --- |
| 获取长度 | O(n) 遍历 | O(1) 直接读 len |
| 缓冲区溢出 | 容易溢出（需手动算空间） | 自动扩容，不会溢出 |
| 修改性能 | 每次都 realloc | 预分配+惰性释放，减少 realloc |
| 二进制安全 | 不行（\\0 是结束符） | 可以（用 len 判断结束） |
| 兼容 | —— | 兼容 C 字符串函数（末尾有 \\0） |

**空间预分配策略**：
- 修改后 len < 1MB → 分配 2×len 空间（len=100 → free=100）
- 修改后 len >= 1MB → 额外分配 1MB（len=5MB → free=1MB）

**惰性空间释放**：
- 缩短时不立即释放，先记入 free，后续追加可直接复用

这种设计让 Redis 的字符串操作（APPEND、SETRANGE）非常高效。

**多语言对照**：

\`\`\`go
// Go 的 strings.Builder 有类似的预分配思想
var b strings.Builder
b.Grow(1024)  // 预分配 1KB，避免多次扩容
for i := 0; i < 1000; i++ {
    b.WriteString("hello")
}
result := b.String()
\`\`\`

\`\`\`java
// Java 的 StringBuilder 也有类似扩容机制
StringBuilder sb = new StringBuilder(1024);  // 指定初始容量
for (int i = 0; i < 1000; i++) {
    sb.append("hello");
}
// StringBuilder 扩容公式：newCapacity = oldCapacity * 2 + 2
\`\`\`

\`\`\`python
# Python 的列表也有类似的超额分配
import sys
lst = []
for i in range(10):
    lst.append(i)
    print(f"len={len(lst)}, size={sys.getsizeof(lst)}")
# 容量增长：0→4→8→16→24→...（超额分配，减少 realloc）
\`\`\`

#### 10.2 ziplist（压缩列表）

ziplist 是一种紧凑的连续内存结构，用于小量数据的 List、Hash、ZSet。

\`\`\`
[zlbytes][zltail][zllen][entry1][entry2]...[entryN][zlend]
         ↑        ↑       ↑                        ↑
       总字节   尾偏移  元素数                    结束标记
\`\`\`

每个 entry 结构：
\`\`\`
[prevlen][encoding][content]
   ↑          ↑        ↑
 前项长度   编码类型   实际数据
\`\`\`

**ziplist 的优势**：
- 内存连续，缓存友好（CPU cache line 利用率高）
- 没有指针开销，小数据非常省内存
- 适合元素少、元素小的场景

**ziplist 的劣势**：
- 插入/删除需要移动后续所有数据，O(n)
- **连锁更新**（cascade update）：如果前项长度变化导致 prevlen 从 1 字节变 5 字节，后续每个 entry 都可能连锁更新，最坏 O(n²)

**配置阈值**（超过则转为其他编码）：
\`\`\`
hash-max-ziplist-entries 128      # Hash 元素数超过 128 则转 hashtable
hash-max-ziplist-value 64         # Hash 单个 value 超过 64 字节则转
list-max-ziplist-size -2          # List 每个节点大小上限
zset-max-ziplist-entries 128      # ZSet 元素数超过 128 则转 skiplist
zset-max-ziplist-value 64         # ZSet 单个 member 超过 64 字节则转
\`\`\`

> Redis 7.0 用 listpack 替代 ziplist，解决了连锁更新问题。listpack 的每个 entry 不存 prevlen，只存自身长度，彻底消除连锁更新。

#### 10.3 quicklist（快速列表）

quicklist 是 List 的底层实现，是 ziplist/listpack 的双向链表：

\`\`\`
[quicklist] → [node1(ziplist)] ↔ [node2(ziplist)] ↔ [node3(ziplist)]
                ↑                    ↑                    ↑
           每个 node 内部是          每个 node 内部是      每个 node 内部是
           一个 ziplist/listpack    一个 ziplist/listpack  一个 ziplist/listpack
\`\`\`

**设计思想**：结合链表（快速增删）和 ziplist（内存紧凑）的优点。
- 每个 node 存一个 ziplist，node 间用双向链表连接
- node 内部的 ziplist 负责紧凑存储
- 链表结构负责快速增删

**配置参数**：
\`\`\`
list-max-ziplist-size -2
# 正数：每个 ziplist 最多存 N 个元素
# 负数：-1=4KB, -2=8KB, -3=16KB, -4=32KB, -5=64KB（每个 node 的 ziplist 大小上限）
list-compress-depth 0
# 0：不压缩
# 1：首尾各保留 1 个未压缩 node，中间压缩（适合两端频繁访问的队列场景）
# 2：首尾各保留 2 个未压缩 node
\`\`\`

#### 10.4 skiplist（跳表）

skiplist 是 ZSet 的核心结构，支持 O(log n) 的插入、删除、范围查询。

**跳表原理**：
- 多层链表，底层是完整链表
- 每个节点以概率 p（通常 0.5 或 0.25）提升到上一层
- 查找时从最高层开始，向右走，走不通就向下走

\`\`\`
Level 4:  HEAD ──────────────────────────→ 30 ──→ NIL
Level 3:  HEAD ──────────→ 15 ──────────→ 30 ──→ NIL
Level 2:  HEAD ──→ 5 ──→ 15 ──────────→ 30 ──→ NIL
Level 1:  HEAD ──→ 5 ──→ 15 ──→ 22 ──→ 30 ──→ NIL
Level 0:  HEAD ──→ 5 ──→ 15 ──→ 22 ──→ 25 ──→ 30 ──→ NIL
\`\`\`

**跳表 vs 红黑树**：

| 特性 | 跳表 | 红黑树 |
| --- | --- | --- |
| 查找 | O(log n) | O(log n) |
| 插入 | O(log n) | O(log n) |
| 删除 | O(log n) | O(log n) |
| 范围查询 | O(log n + m)，沿底层链表遍历 | O(log n + m√log n)，中序遍历 |
| 实现复杂度 | 简单（~100 行） | 复杂（旋转、变色） |
| 并发友好 | 好（局部加锁） | 差（旋转影响多个节点） |
| 内存 | 多一层指针（~2×） | 紧凑（固定 2 指针） |
| 缓存 | 一般（链表跳转） | 一般（树跳转） |

**Redis 选择跳表的原因**：
1. 范围查询天然高效（ZRANGE、ZRANGEBYSCORE）
2. 实现比红黑树简单很多，bug 少
3. 内存换性能，可接受
4. 并发更友好（虽然 Redis 单线程，但作者考虑通用场景）

**ZSet 的双结构**：
\`\`\`
ZSet = dict（member → score）+ skiplist（score → member）
\`\`\`
- dict 负责 O(1) 的单点查找（ZSCORE）
- skiplist 负责 O(log n) 的范围查询（ZRANGE）
- 两者共享同一份 member 和 score 数据，不额外复制

**多语言跳表实现对照**：

\`\`\`java
// Java 的 ConcurrentSkipListMap 用跳表实现
ConcurrentSkipListMap<Integer, String> map = new ConcurrentSkipListMap<>();
map.put(3, "three");
map.put(1, "one");
map.put(2, "two");
// 自动有序：{1=one, 2=two, 3=three}
System.out.println(map.subMap(1, 3));  // {1=one, 2=two} 范围查询
\`\`\`

\`\`\`go
// Go 标准库没有跳表，需要第三方库或自己实现
// 常用：github.com/zhangyunhao116/skipmap
import "github.com/zhangyunhao116/skipmap"
m := skipmap.NewInt()
m.Store(3, "three")
m.Store(1, "one")
m.Range(func(key int, value interface{}) bool {
    fmt.Println(key, value)  // 1 one, 3 three（有序输出）
    return true
})
\`\`\`

\`\`\`python
# Python 标准库也没有跳表，用 sortedcontainers 替代
from sortedcontainers import SortedDict
sd = SortedDict({3: "three", 1: "one", 2: "two"})
print(sd)  # SortedDict({1: 'one', 2: 'two', 3: 'three'})
print(list(sd.irange(1, 2))  # [1, 2] 范围查询
\`\`\`

#### 10.5 dict（字典/哈希表）

dict 是 Redis 最核心的结构，所有 KV 键值对都存在 dict 里。

\`\`\`c
struct dict {
    dictht ht[2];     // 两个哈希表，用于渐进式 rehash
    long rehashidx;   // -1 表示没在 rehash，>=0 表示正在 rehash
};
struct dictht {
    dictEntry **table;  // 哈希桶数组
    unsigned long size; // 桶数（2 的幂）
    unsigned long used; // 已用条目数
};
\`\`\`

**渐进式 rehash**：
- 当 used/size > 1（负载因子 > 1）时触发扩容
- 不是一次性 rehash 全部数据（会阻塞），而是分批迁移
- 每次 CRUD 操作时，顺便迁移 ht[0] 中 rehashidx 位置的桶到 ht[1]
- rehash 期间，读操作查两个表，写操作只写 ht[1]

**哈希冲突**：用链地址法（拉链法），每个桶是一个链表头。

**负载因子与扩容时机**：
- 没有 BGSAVE/BGREWRITEAOF 时，负载因子 >= 1 触发扩容
- 有 BGSAVE/BGREWRITEAOF 时，负载因子 >= 5 才触发（避免子进程写时复制）
- 扩容大小：第一个 >= used×2 的 2^n

**多语言对照**：

\`\`\`java
// Java HashMap 的扩容是一次性的（JDK 8）
// 初始 16，负载因子 0.75，扩容为 2 倍
Map<String, String> map = new HashMap<>(16, 0.75f);
// 扩容时，JDK 8 优化：元素要么留原位，要么移到 原位+oldCap
// 不需要重新计算 hash，只需判断高位 bit
\`\`\`

\`\`\`go
// Go map 的扩容是渐进式的（类似 Redis）
// 负载因子 > 6.5 或溢出桶太多时触发
// 每次 mapaccess/mapassign 迁移 1-2 个桶
m := make(map[string]int, 8)
// Go map 无序遍历，防止用户依赖顺序
for k, v := range m {  // 每次遍历顺序不同
    fmt.Println(k, v)
}
\`\`\`

#### 10.6 intset（整数集合）

当 Set 的所有元素都是整数，且数量 < 512（set-max-intset-entries）时，用 intset。

\`\`\`c
struct intset {
    int32_t encoding;  // INT16, INT32, INT64
    int32_t length;
    int8_t contents[]; // 紧凑存储的有序整数数组
};
\`\`\`

**编码升级**：插入一个更大类型的整数时，整个数组升级。例如从 int16 升级到 int32，所有元素都扩为 4 字节。升级不可逆。

**优势**：内存极致紧凑，二分查找 O(log n)。

### 十一、Redis 6.0 多线程 IO 模型

Redis 一直以"单线程"著称，但 6.0 引入了多线程 IO。理解这一变化非常重要。

#### 11.1 传统单线程模型（Reactor 单线程）

\`\`\`
客户端 ──→ [IO 多路复用 epoll] ──→ [事件分发] ──→ [命令执行] ──→ [写回客户端]
                ↑                                                    ↑
           所有 socket 监听                              全部在单线程内完成
\`\`\`

**单线程的优势**：
- 无锁，无竞争，无上下文切换
- 命令执行原子，天然线程安全
- 实现简单，bug 少

**单线程的瓶颈**：
- 命令本身很快（内存操作微秒级），但网络 IO（read/write 系统调用）在万兆网卡下成为瓶颈
- 4C 8G 机器，单线程 Redis QPS ~10 万，网卡可能跑满

#### 11.2 Redis 6.0 多线程 IO

\`\`\`
                   ┌─→ IO Thread 1 ──→ 读取 socket ──┐
客户端 ──→ 主线程 ─┼─→ IO Thread 2 ──→ 读取 socket ──┼─→ 主线程执行命令 ──→ 分发写回 ─┼─→ IO Thread 1 ──→ 写 socket
                   └─→ IO Thread N ──→ 读取 socket ──┘                                   └─→ IO Thread N ──→ 写 socket
\`\`\`

**关键点**：
- **命令执行仍然单线程**，只是网络读写多线程
- 读阶段：IO 线程并行 read，主线程等待全部完成后依次执行命令
- 写阶段：主线程执行完命令后，IO 线程并行 write
- 用自旋锁等待（不是条件变量），因为等待时间极短

**配置**：
\`\`\`
io-threads 4           # IO 线程数（建议 CPU 核数的一半，不超过 8）
io-threads-do-reads yes # 默认 IO 线程只做 write，开启后也做 read
\`\`\`

**性能提升**：
- 4 线程 IO，QPS 可从 ~10 万提升到 ~20-30 万
- 网络密集型场景（value 小、连接多）提升明显
- CPU 密集型场景（大 value、复杂命令）提升有限

**多线程 IO 不影响线程安全**：
- 命令解析和执行仍在主线程
- IO 线程只做 read/write 系统调用和协议解析
- 每个 IO 线程处理不同的客户端，无数据竞争

#### 11.3 与其他多线程模型对比

\`\`\`java
// Java Netty 的 Reactor 主从模型
// BossGroup 负责 accept，WorkerGroup 负责 read/write + 业务处理
EventLoopGroup bossGroup = new NioEventLoopGroup(1);    // 1 个线程 accept
EventLoopGroup workerGroup = new NioEventLoopGroup(8);  // 8 个线程处理 IO+业务
ServerBootstrap b = new ServerBootstrap();
b.group(bossGroup, workerGroup)
 .channel(NioServerSocketChannel.class)
 .childHandler(new ChannelInitializer<SocketChannel>() {
     protected void initChannel(SocketChannel ch) {
         ch.pipeline().addLast(new MyBusinessHandler());  // 业务在 worker 线程执行
     }
 });
\`\`\`

\`\`\`go
// Go 的 goroutine per connection 模型
ln, _ := net.Listen("tcp", ":6379")
for {
    conn, _ := ln.Accept()
    go handleConn(conn)  // 每个连接一个 goroutine
}
// Go 的 GMP 调度器自动在多核上调度 goroutine
// 天然利用多核，但需要自己处理并发安全
\`\`\`

\`\`\`python
# Python asyncio 的单线程协程模型（类似 Redis 原始模型）
import asyncio
async def handle(reader, writer):
    data = await reader.readline()
    writer.write(b"+OK\r\n")
    await writer.drain()

async def main():
    server = await asyncio.start_server(handle, '0.0.0.0', 6379)
    async with server:
        await server.serve_forever()
# 单线程协程，无并发安全问题，但无法利用多核
\`\`\`

### 十二、Redis Cluster 槽位迁移与扩缩容

#### 12.1 槽位迁移过程

Redis Cluster 有 16384 个槽（slot），每个 key 通过 CRC16(key) % 16384 映射到槽。

**迁移一个槽的步骤**：

\`\`\`
1. 源节点标记 slot 为 MIGRATING（导出中）
2. 目标节点标记 slot 为 IMPORTING（导入中）
3. 源节点遍历 slot 中的 key：
   a. CLUSTER GETKEYSINSLOT <slot> <count>  获取一批 key
   b. MIGRATE targethost targetport "" 0 timeout KEYS key1 key2 ...
   c. 重复直到 slot 为空
4. 源节点向集群广播：CLUSTER SETSLOT <slot> NODE <targetNodeId>
5. 所有节点更新槽位映射表
\`\`\`

**迁移中的访问**：
- 客户端访问源节点的该 slot：
  - key 还在源节点 → 正常返回
  - key 已迁移 → 返回 ASK 重定向，客户端临时去目标节点访问
- ASK 是临时重定向（只针对当前请求），MOVED 是永久重定向（更新本地路由表）

#### 12.2 扩容过程

\`\`\`
现有集群：3 主 3 从，每主负责 0-5460 / 5461-10922 / 10923-16383
新增节点：node7, node8

1. CLUSTER MEET  将 node7, node8 加入集群
2. 将 node7 设为主，node8 设为 node7 的从
3. 重新分配槽位：
   - node1 迁移 0-1364 给 node7（1365 个槽）
   - node2 迁移 5461-6826 给 node7（1366 个槽）
   - node3 迁移 10923-12287 给 node7（1365 个槽）
4. 迁移完成后，node7 负责约 4096 个槽，负载均衡
\`\`\`

**迁移对线上影响**：
- 迁移是渐进的，不会阻塞服务
- 单个 key 迁移时，MIGRATE 命令会阻塞源节点（同步操作）
- 大 key 迁移可能阻塞数秒，应避开高峰期
- 建议用 redis-cli --cluster reshard 的自动迁移，内部做了批量优化

#### 12.3 缩容过程

缩容是扩容的逆过程：
1. 将目标节点的所有槽迁移到其他节点
2. 将目标从节点移除
3. 将目标主节点移除

#### 12.4 脑裂与故障恢复

**脑裂场景**：
- 网络分区导致主节点与其他节点失联
- 从节点被提升为新主
- 旧主恢复后，如果有客户端还在写入，会产生数据冲突

**Redis Cluster 的防护**：
- 主节点需要超过半数主节点心跳响应才保持主身份
- 网络分区时，旧主收不到足够心跳，变为从节点，停止接受写入
- 但在分区恢复前的写入会丢失（最终一致）

**min-replicas 配置**（额外防护）：
\`\`\`
min-replicas-to-write 1     # 至少 1 个从节点同步成功才接受写入
min-replicas-max-lag 10     # 从节点延迟不超过 10 秒
\`\`\`
配置后，如果主节点与所有从节点断开，会拒绝写入，避免脑裂数据丢失。

### 十三、Redis Lua 脚本与原子操作

#### 13.1 为什么需要 Lua 脚本

多个命令的原子性需求：
- INCR + EXPIRE（计数器+过期）
- GET + DEL（获取并删除）
- HGET + HSET（读取修改写回）
- ZADD + ZRANGE（添加并查询）

用 MULTI/EXEC 事务可以保证原子，但无法做条件分支（WATCH 只能乐观锁）。

#### 13.2 EVAL 命令

\`\`\`bash
# 语法：EVAL script numkeys key1 key2 ... arg1 arg2 ...
# 限流示例：每 60 秒最多 100 次
EVAL "
local current = redis.call('GET', KEYS[1])
if not current then
    redis.call('SET', KEYS[1], 1, 'EX', 60)
    return 1
end
if tonumber(current) >= 100 then
    return 0  -- 限流
end
redis.call('INCR', KEYS[1])
return tonumber(current) + 1
" 1 rate_limit:user123
\`\`\`

**Lua 脚本的原子性**：
- 脚本执行期间，Redis 单线程被独占，不会被其他命令打断
- 整个脚本要么全部执行，要么都不执行
- 类似数据库的存储过程

#### 13.3 EVALSHA 优化

\`\`\`bash
# 1. 先加载脚本，获取 SHA1 校验和
SCRIPT LOAD "return redis.call('GET', KEYS[1])"
# 返回："a5260dd66ce02462c5b5571..."

# 2. 后续用 EVALSHA 执行，只需传 SHA1，省带宽
EVALSHA "a5260dd66ce02462c5b5571..." 1 mykey
\`\`\`

**多语言客户端封装**：
- 大部分客户端（jedis、lettuce、go-redis）自动缓存 SCRIPT LOAD + EVALSHA
- 首次调用 EVAL，后续用 EVALSHA，找不到缓存再降级为 EVAL

#### 13.4 Redis 7.0 的 Functions

Redis 7.0 引入 Functions，是 Lua 脚本的升级版：
- 持久化到 RDB/AOF（Lua 脚本不持久化）
- 支持多语言（Lua、JavaScript 计划中）
- 更好的命名空间管理

\`\`\`bash
FUNCTION LOAD "#!lua name=mylib
redis.register_function('myfunc', function(keys, args)
    return redis.call('GET', keys[1])
end)"
FCALL myfunc 1 mykey
\`\`\`

#### 13.5 Lua 脚本注意事项

1. **不要执行耗时操作**：脚本阻塞整个 Redis，慢脚本会导致所有客户端等待
2. **不要写死循环**：lua-time-limit 5 秒后，Redis 只发告警不中断（因为中断不安全）
3. **纯函数**：脚本内不要有随机性（如 math.random），否则主从复制会不一致
4. **Redis 3.2+ 默认不允许读写全局变量**，只能在脚本内定义局部变量
5. **大 key 操作**：脚本内操作大 key 会长时间阻塞，应拆分

### 十四、Redis Stream 消息队列

Redis 5.0 引入 Stream，是专为消息队列设计的数据结构。

#### 14.1 Stream 基本操作

\`\`\`bash
# 生产消息
XADD mystream * name Alice age 30
# * 表示自动生成 ID（时间戳-序号）
# 返回：1672531200000-0

XADD mystream * name Bob age 25
# 返回：1672531200001-0

# 读取消息
XRANGE mystream - +   # - 表示最早，+ 表示最晚
# 1) 1) "1672531200000-0"
#    2) 1) "name"  2) "Alice"  3) "age"  4) "30"
# 2) 1) "1672531200001-0"
#    2) 1) "name"  2) "Bob"  3) "age"  4) "25"

# 按范围读取
XRANGE mystream 1672531200000-0 1672531200001-0 COUNT 1
\`\`\`

#### 14.2 消费组

\`\`\`bash
# 创建消费组，从最早开始消费
XGROUP CREATE mystream group1 0

# 消费组内创建消费者
XREADGROUP GROUP group1 consumer1 COUNT 10 STREAMS mystream >
# > 表示读取从未投递给本组的新消息

# 确认消息已处理
XACK mystream group1 1672531200000-0

# 查看待确认消息（PEL：Pending Entry List）
XPENDING mystream group1
# 1) (integer) 1    # 待确认总数
# 2) "1672531200000-0"  # 最早待确认 ID
# 3) "1672531200000-0"  # 最晚待确认 ID
# 4) 1) 1) "consumer1"  2) "1"  # 消费者及其待确认数

# 转移超时消息给其他消费者（故障转移）
XCLAIM mystream group1 consumer2 60000 1672531200000-0
# 将 60 秒未确认的消息转移给 consumer2
\`\`\`

#### 14.3 Stream vs Kafka/RabbitMQ 对比

| 特性 | Redis Stream | Kafka | RabbitMQ |
| --- | --- | --- | --- |
| 持久化 | RDB/AOF | 磁盘 log | 可选持久化 |
| 消费组 | 支持 | 支持 | 支持（镜像队列） |
| 消息回溯 | 支持（按 ID 范围） | 支持（按 offset） | 不支持 |
| 消息堆积 | 受内存限制 | 磁盘几乎无限 | 受磁盘限制 |
| 吞吐量 | ~10 万/秒 | ~100 万/秒 | ~10 万/秒 |
| 延迟 | 微秒级 | 毫秒级 | 毫秒级 |
| 运维复杂度 | 低 | 高 | 中 |
| 适用场景 | 轻量队列、已有 Redis | 大数据流处理 | 复杂路由 |

**选型建议**：
- 已有 Redis、消息量 < 10 万/秒 → Redis Stream 足够
- 需要高吞吐、消息堆积 → Kafka
- 需要复杂路由（topic exchange）→ RabbitMQ
- 轻量级、低延迟、不想要额外组件 → Redis Stream

### 十五、Redis 内存优化实践

#### 15.1 编码选择优化

\`\`\`bash
# 查看某个 key 的编码
OBJECT ENCODING mykey
# 可能返回：ziplist, hashtable, intset, skiplist, listpack, embstr, raw, int

# embstr vs raw：
# embstr：embedding string，SDS 和对象头连续分配，一次 malloc
# raw：SDS 和对象头分开分配，两次 malloc
# 字符串 <= 44 字节用 embstr，> 44 字节用 raw
\`\`\`

**优化技巧**：
1. **短 key**：key 越短越省内存。\`user:12345\` → \`u:12345\`（但可读性下降）
2. **用 Hash 替代多个 String**：
   - 存 100 万用户，每人 5 个字段
   - 用 String：100 万 × 5 = 500 万 key，每个 key 有 dict entry 开销
   - 用 Hash：100 万 key，每个 key 内部是 ziplist，省大量内存
3. **控制 ziplist 阈值**：
   - 默认 hash-max-ziplist-entries 128，适当调大可让更多 Hash 用 ziplist
   - 但太大会有连锁更新风险（Redis 7.0 listpack 无此问题）

#### 15.2 对象共享

Redis 启动时预创建 0-9999 的整数对象，后续用到这些整数时直接引用，不创建新对象。

\`\`\`bash
SET counter 1    # 不创建新对象，引用共享的 1
SET counter2 1   # 同样引用共享的 1
# OBJECT REFCOUNT counter → 2147483647（INT_MAX，表示共享对象）
\`\`\`

> 注意：maxmemory-policy 设置 LRU/LFU 时，共享对象不记录访问信息，所以 0-9999 不参与淘汰统计。

#### 15.3 内存碎片

\`\`\`bash
INFO memory
# used_memory: 1000000     # 实际使用的内存
# used_memory_rss: 1500000  # 操作系统分配的内存
# mem_fragmentation_ratio: 1.50  # 碎片率
# 碎片率 > 1.5 需要关注
\`\`\`

**碎片产生原因**：
- 频繁删除大 key 后，内存释放但 allocator 不一定还给 OS
- jemalloc 按 size class 分配，大小不完全匹配

**清理碎片**：
\`\`\`bash
# Redis 4.0+ 自动碎片清理
activedefrag yes           # 开启自动碎片整理
active-defrag-ignore-bytes 100mb   # 碎片超过 100MB 才整理
active-defrag-threshold-lower 10   # 碎片率超过 10% 开始整理
active-defrag-threshold-upper 100  # 碎片率超过 100% 全力整理
active-defrag-cycle-min 1   # 整理占用 CPU 最小百分比
active-defrag-cycle-max 25  # 整理占用 CPU 最大百分比

# 手动清理
MEMORY PURGE   # 手动触发一次碎片整理
\`\`\`

#### 15.4 bigkey 与 hotkey

**bigkey 危害**：
- 删除大 key 阻塞主线程（DEL 大 key 是 O(n)）
- 网络传输慢，阻塞其他客户端
- 内存不均匀，集群中某个节点内存远超其他

**检测 bigkey**：
\`\`\`bash
redis-cli --bigkeys   # 扫描并报告各类型的最大 key
redis-cli --memkeys    # 扫描内存占用最大的 key（Redis 7.0+）
\`\`\`

**删除大 key 的正确方式**：
\`\`\`bash
# Redis 4.0+ 用 UNLINK 异步删除
UNLINK mybigkey    # 后台异步删除，不阻塞主线程

# Hash 大 key 分批删除
HSCAN myhash 0 COUNT 100  # 先扫描
HDEL myhash field1 field2 ...  # 分批删除字段

# List 大 key
LTRIM mylist 0 -101  # 每次 LTRIM 删 100 个，循环
\`\`\`

**hotkey 检测**：
\`\`\`bash
redis-cli --hotkeys   # 需配置 maxmemory-policy 为 allkeys-lfu
\`\`\`

### 十六、Redis 生产故障案例与排查

#### 案例 1：慢查询导致服务超时

**现象**：线上接口偶发超时，Redis 延迟监控显示有 200ms 的慢查询。

**排查**：
\`\`\`bash
SLOWLOG GET 10  # 查看慢查询日志
# 1) 1) (integer) 14           # 日志 ID
#    2) (integer) 1672531200   # 时间戳
#    3) (integer) 200000       # 耗时（微秒），200ms
#    4) "KEYS user:*"          # 命令
#    5) ...                    # 客户端信息
\`\`\`

**根因**：用了 KEYS 命令扫描百万级 key。

**修复**：
- 用 SCAN 替代 KEYS（游标式遍历，不阻塞）
- 业务上用独立 Set 维护 key 集合

#### 案例 2：主从切换后数据丢失

**现象**：Redis 主节点宕机，哨兵切换从节点为新主，但丢失了最近 10 秒的数据。

**排查**：
- 检查复制配置：\`min-replicas-max-lag\` 未设置
- 主节点宕机时，有部分写入未同步到从节点
- 从节点提升为主后，这部分数据永久丢失

**修复**：
\`\`\`
min-replicas-to-write 1
min-replicas-max-lag 10
\`\`\`
配置后，主节点至少需要 1 个从节点在 10 秒内同步成功才接受写入，避免数据丢失。

#### 案例 3：内存溢出导致 OOM

**现象**：Redis 频繁 OOM 重启。

**排查**：
\`\`\`bash
INFO memory
# used_memory: 8GB
# maxmemory: 8GB
# evicted_keys: 0  # 没有淘汰
\`\`\`

**根因**：maxmemory-policy 设为 noeviction（不淘汰），内存满后写入直接报错，但部分大 key 持续增长导致 OOM。

**修复**：
- 设置合理的淘汰策略（allkeys-lru 或 volatile-lru）
- 设置 maxmemory 为物理内存的 60-70%，留出 OS 和碎片空间
- 定期监控 bigkey，及时清理

#### 案例 4：集群脑裂导致数据不一致

**现象**：网络抖动后，两个节点都声称自己是主节点，数据不一致。

**排查**：
- 网络分区导致主节点与半数以上节点失联
- 哨兵将一个从节点提升为新主
- 旧主恢复后仍为 master 状态，部分客户端写入旧主

**修复**：
- 配置 min-replicas-to-write
- 客户端实现集群拓扑感知，及时更新路由表
- 使用 CLUSTER NODES 定期检查节点状态

#### Redis 排查工具汇总

| 工具 | 用途 | 命令 |
| --- | --- | --- |
| SLOWLOG | 慢查询 | SLOWLOG GET 10 |
| INFO | 状态信息 | INFO / INFO memory / INFO replication |
| CLIENT LIST | 客户端连接 | CLIENT LIST / CLIENT KILL |
| MONITOR | 实时命令监控（慎用，影响性能） | MONITOR |
| LATENCY | 延迟事件 | LATENCY HISTORY event |
| MEMORY USAGE | 单 key 内存 | MEMORY USAGE key |
| OBJECT ENCODING | 查看编码 | OBJECT ENCODING key |
| DEBUG SLEEP | 模拟延迟（测试用） | DEBUG SLEEP 2 |
| redis-cli --latency | 测量延迟 | redis-cli --latency |
| redis-cli --stat | 实时统计 | redis-cli --stat |

### 十七、小结

Redis 之所以成为后端"基础设施级"组件，在于它把"内存的速度"和"丰富的数据结构"结合，并用单线程模型把并发简化到极致。掌握五大结构的选择、持久化与高可用的权衡、过期淘汰的机制，以及生产规范，才能让 Redis 真正成为系统的加速器而非隐患。下一章我们将讨论缓存的策略与一致性问题——这是 Redis 作为缓存时最核心的工程难题。`,
    code: `// ============================================================
// Redis 实战 —— RedisLike 内存数据结构模拟
// 用内存 Map/Set/Array 模拟 Redis 五大结构，含过期与 LRU 淘汰
// ============================================================

class RedisLike {
  constructor(maxMemory = 1000) {
    this.data = new Map();     // 主存储：key -> value(任意类型)
    this.expires = new Map();  // key -> 过期时间戳(ms)
    this.lru = new Map();      // key -> 最近访问时间戳
    this.maxMemory = maxMemory;
    this.ops = 0;
  }

  // 惰性删除：访问时检查是否过期
  _checkExpire(key) {
    if (this.expires.has(key) && Date.now() > this.expires.get(key)) {
      this.data.delete(key);
      this.expires.delete(key);
      this.lru.delete(key);
      return true;
    }
    return false;
  }

  // LRU 淘汰：超过容量时淘汰最久未访问的 key
  _evict() {
    while (this.data.size >= this.maxMemory) {
      let oldestKey = null, oldestTime = Infinity;
      for (const [k, t] of this.lru) {
        if (t < oldestTime) { oldestTime = t; oldestKey = k; }
      }
      if (oldestKey) {
        this.data.delete(oldestKey);
        this.expires.delete(oldestKey);
        this.lru.delete(oldestKey);
      } else { break; }
    }
  }

  _touch(key) { this.lru.set(key, Date.now()); this.ops++; }

  // ===== String =====
  set(key, val, ttl) {
    this._checkExpire(key);
    if (!this.data.has(key)) this._evict();
    this.data.set(key, String(val));
    if (ttl) this.expires.set(key, Date.now() + ttl);
    this._touch(key);
    return 'OK';
  }
  get(key) {
    if (this._checkExpire(key)) return null;
    if (!this.data.has(key)) return null;
    this._touch(key);
    return this.data.get(key);
  }
  incr(key, step = 1) {
    if (this._checkExpire(key)) {}
    let v = parseInt(this.get(key) || '0', 10) + step;
    this.data.set(key, String(v));
    this._touch(key);
    return v;
  }
  expire(key, ttl) {
    if (this._checkExpire(key) || !this.data.has(key)) return 0;
    this.expires.set(key, Date.now() + ttl);
    return 1;
  }

  // ===== Hash =====
  hset(key, field, val) {
    this._checkExpire(key);
    if (!this.data.has(key)) { this._evict(); this.data.set(key, new Map()); }
    const hash = this.data.get(key);
    if (!(hash instanceof Map)) return 0;
    const isNew = !hash.has(field);
    hash.set(field, String(val));
    this._touch(key);
    return isNew ? 1 : 0;
  }
  hget(key, field) {
    if (this._checkExpire(key)) return null;
    const hash = this.data.get(key);
    if (!hash || !(hash instanceof Map)) return null;
    this._touch(key);
    return hash.has(field) ? hash.get(field) : null;
  }
  hgetall(key) {
    if (this._checkExpire(key)) return null;
    const hash = this.data.get(key);
    if (!hash || !(hash instanceof Map)) return null;
    this._touch(key);
    return Object.fromEntries(hash);
  }

  // ===== List =====
  lpush(key, ...vals) {
    this._checkExpire(key);
    if (!this.data.has(key)) { this._evict(); this.data.set(key, []); }
    const list = this.data.get(key);
    if (!Array.isArray(list)) return 0;
    list.unshift(...vals.slice().reverse());
    this._touch(key);
    return list.length;
  }
  rpop(key) {
    if (this._checkExpire(key)) return null;
    const list = this.data.get(key);
    if (!list || !Array.isArray(list) || list.length === 0) return null;
    this._touch(key);
    return list.pop();
  }
  lrange(key, start, end) {
    if (this._checkExpire(key)) return [];
    const list = this.data.get(key);
    if (!list || !Array.isArray(list)) return [];
    this._touch(key);
    if (end === -1) end = list.length - 1;
    return list.slice(start, end + 1);
  }

  // ===== Set =====
  sadd(key, ...members) {
    this._checkExpire(key);
    if (!this.data.has(key)) { this._evict(); this.data.set(key, new Set()); }
    const set = this.data.get(key);
    if (!(set instanceof Set)) return 0;
    let added = 0;
    for (const m of members) { if (!set.has(m)) { set.add(m); added++; } }
    this._touch(key);
    return added;
  }
  smembers(key) {
    if (this._checkExpire(key)) return [];
    const set = this.data.get(key);
    if (!set || !(set instanceof Set)) return [];
    this._touch(key);
    return Array.from(set);
  }
  sinter(...keys) {
    const sets = keys.map(k => {
      if (this._checkExpire(k)) return new Set();
      const s = this.data.get(k);
      return (s instanceof Set) ? s : new Set();
    });
    if (!sets.length) return [];
    let result = new Set(sets[0]);
    for (let i = 1; i < sets.length; i++) {
      result = new Set([...result].filter(x => sets[i].has(x)));
    }
    return Array.from(result);
  }

  // ===== ZSet =====
  zadd(key, score, member) {
    this._checkExpire(key);
    if (!this.data.has(key)) { this._evict(); this.data.set(key, new Map()); }
    const zset = this.data.get(key);
    if (!(zset instanceof Map)) return 0;
    const isNew = !zset.has(member);
    zset.set(member, score);
    this._touch(key);
    return isNew ? 1 : 0;
  }
  zrange(key, start, end) {
    if (this._checkExpire(key)) return [];
    const zset = this.data.get(key);
    if (!zset || !(zset instanceof Map)) return [];
    this._touch(key);
    const arr = [...zset.entries()].sort((a, b) => a[1] - b[1]);
    if (end === -1) end = arr.length - 1;
    return arr.slice(start, end + 1).map(e => e[0] + ':' + e[1]);
  }
  zrangebyscore(key, min, max) {
    if (this._checkExpire(key)) return [];
    const zset = this.data.get(key);
    if (!zset || !(zset instanceof Map)) return [];
    this._touch(key);
    return [...zset.entries()]
      .filter(e => e[1] >= min && e[1] <= max)
      .sort((a, b) => a[1] - b[1])
      .map(e => e[0] + ':' + e[1]);
  }

  info() { return { keys: this.data.size, ops: this.ops, max: this.maxMemory }; }
}

// ===== 演示五大结构与应用场景 =====
const r = new RedisLike(1000);

console.log('===== 1. String：计数器 / 缓存 / 分布式锁基础 =====');
r.set('user:1:name', '张三');
console.log('GET user:1:name =', r.get('user:1:name'));
r.incr('counter:pv'); r.incr('counter:pv'); r.incr('counter:pv', 5);
console.log('INCR 计数器 =', r.get('counter:pv'));
r.set('token:abc', 'session-data', 50);  // 50ms 过期
console.log('SETNX 锁:', r.set('lock:order:100', 'uuid-1') === 'OK' ? '加锁成功' : '失败');

console.log('\\n===== 2. Hash：对象存储（单独更新字段）=====');
r.hset('user:100', 'name', '李四');
r.hset('user:100', 'age', '28');
r.hset('user:100', 'city', '北京');
r.hset('user:100', 'city', '上海');  // 单独改城市，不读全量
console.log('HGETALL =', JSON.stringify(r.hgetall('user:100')));

console.log('\\n===== 3. List：消息队列 / 最新列表 =====');
r.lpush('news:feed', '文章A', '文章B', '文章C');
console.log('最新列表 LRANGE =', r.lrange('news:feed', 0, -1));
console.log('RPOP 消费 =', r.rpop('news:feed'), '剩余 =', r.lrange('news:feed', 0, -1));

console.log('\\n===== 4. Set：标签 / 共同好友 =====');
r.sadd('user:1:friends', 'Alice', 'Bob', 'Carol');
r.sadd('user:2:friends', 'Bob', 'Carol', 'Dave');
console.log('共同好友 SINTER =', r.sinter('user:1:friends', 'user:2:friends'));

console.log('\\n===== 5. ZSet：排行榜 / 延迟队列 =====');
r.zadd('rank:game', 1500, '玩家A');
r.zadd('rank:game', 2000, '玩家B');
r.zadd('rank:game', 1800, '玩家C');
r.zadd('rank:game', 900, '玩家D');
console.log('排行榜(升序) =', r.zrange('rank:score', 0, -1));
console.log('排行榜(全部) =', r.zrange('rank:game', 0, -1));
console.log('分数>=1500 =', r.zrangebyscore('rank:game', 1500, Infinity));

// 延迟队列：score 为执行时间戳，取当前时间之前的任务
const now = Date.now();
r.zadd('delay:queue', now - 100, 'task-过期1');
r.zadd('delay:queue', now + 5000, 'task-未到期');
console.log('到期任务 =', r.zrangebyscore('delay:queue', 0, now));

console.log('\\n===== 6. 过期惰性删除 + LRU 淘汰 =====');
const r2 = new RedisLike(3);
r2.set('k1', 'v1'); r2.set('k2', 'v2'); r2.set('k3', 'v3');
r2.get('k1');  // 访问 k1，使其成为最新
r2.set('k4', 'v4');  // 触发淘汰，k2（最久未访问）应被淘汰
console.log('容量3 淘汰后: k1存在=' + (r2.get('k1') !== null) + ', k2被淘汰=' + (r2.get('k2') === null));
console.log('当前 keys =', r2.info().keys);

// 验证过期
setTimeout(() => {
  console.log('\\n===== 7. 过期验证 =====');
  console.log('50ms 后 token:abc =', r.get('token:abc') === null ? '已过期(null) ✓' : '仍存在 ✗');
  console.log('info:', JSON.stringify(r.info()));
  console.log('\\n===== 演示结束 =====');
}, 80);
`,
  },

  // =========================================================
  // 第二章：缓存策略与一致性
  // =========================================================
  {
    id: "backend-cache",
    group: "数据存储",
    icon: "⚡",
    title: "缓存策略与一致性",
    content: `## 缓存策略与一致性

**缓存（Cache）** 是后端系统提升性能、降低数据库压力最有效的手段。一个设计良好的缓存层，能让系统吞吐提升一个数量级、延迟下降一个数量级。但缓存也带来了最棘手的工程难题——**缓存与数据库的一致性**。一旦缓存与 DB 数据不一致，轻则用户看到旧数据，重则资损事故（如余额错误、库存超卖）。

本章将系统讲解缓存的层次、四种读写模式、五种淘汰算法、三大经典问题（穿透/击穿/雪崩）、一致性方案，以及多级缓存架构。这是 Redis 作为缓存使用时最核心的知识体系。

### 一、缓存的核心价值

#### 1.1 为什么要缓存

后端系统的性能瓶颈，绝大多数落在数据库。原因有三：

- **磁盘 IO 慢**：数据库查询要走磁盘（即使有 buffer pool），延迟在毫秒级。
- **连接数有限**：数据库连接池通常几十到几百，高并发下成为瓶颈。
- **计算昂贵**：复杂查询（JOIN、聚合）CPU 开销大。

缓存的本质是"用空间换时间"——把热点数据放在更快的存储（内存）中，让大部分请求不必打到数据库。

#### 1.2 缓存的三大收益

| 收益 | 说明 | 量化 |
| --- | --- | --- |
| 降低延迟 | 内存访问 100ns vs 磁盘 10ms | 100 倍 |
| 提升吞吐 | 缓存可水平扩展，DB 难 | 10 倍 |
| 减少 DB 压力 | 拦截 90%+ 读请求 | DB QPS 降 90% |

举例：电商商品详情页，QPS 10 万。若每次都查 DB（含多表 JOIN），单库扛不住；加 Redis 缓存后，95% 请求命中缓存，DB 只剩 5000 QPS，轻松扛住。

#### 1.3 缓存的代价

缓存不是免费的午餐，它带来新的复杂性：

- **一致性问题**：缓存与 DB 如何保持一致？这是最大难题。
- **缓存维护成本**：过期、淘汰、预热、监控。
- **系统复杂度**：多了一层，故障点增多（缓存宕机怎么办？）。
- **内存成本**：缓存占内存，需要容量规划。

> 工程箴言："There are only two hard things in Computer Science: cache invalidation and naming things."（计算机科学只有两件难事：缓存失效和命名。）—— Phil Karlton

### 二、缓存层次

现代系统的缓存是分层的，从客户端到数据库，每一层都可缓存：

\`\`\`
用户浏览器 ──▶ CDN ──▶ 网关/Nginx ──▶ 应用本地缓存 ──▶ 分布式缓存(Redis) ──▶ 数据库
   ↑            ↑          ↑              ↑                  ↑
 浏览器缓存   边缘缓存   反向代理缓存   进程内缓存        集群缓存
\`\`\`

| 层次 | 位置 | 特点 | 典型实现 |
| --- | --- | --- | --- |
| 浏览器缓存 | 客户端 | 离用户最近，免网络 | HTTP Cache-Control |
| CDN 缓存 | 边缘节点 | 加速静态资源 | Cloudflare/阿里云 CDN |
| 网关缓存 | 反向代理 | 缓存整页响应 | Nginx proxy_cache |
| 本地缓存 | 应用进程内 | 极快，无网络 | Caffeine/Guava |
| 分布式缓存 | 独立集群 | 共享、容量大 | Redis/Memcached |
| DB 缓存 | 数据库内部 | 透明 | MySQL Buffer Pool |

**层次越靠前，命中越快，但容量越小、一致性越难**。生产系统通常是多层组合：本地缓存扛极速热点，分布式缓存扛主体流量，DB 兜底。

### 三、缓存读写模式详解

缓存与数据库如何配合读写，是缓存设计的核心。有四种经典模式。

#### 3.1 Cache-Aside（旁路缓存）

最常用模式。应用代码同时操作缓存和 DB，缓存不主动与 DB 交互。

**读流程**：
\`\`\`
1. 读缓存 → 命中 → 返回
2. 未命中 → 读 DB → 回填缓存 → 返回
\`\`\`

**写流程**（两种流派）：
\`\`\`
流派A（推荐）：更新 DB → 删除缓存
流派B（不推荐）：更新 DB → 更新缓存
\`\`\`

\`\`\`java
// Java：Cache-Aside 实现
public User getUser(Long id) {
    User user = cache.get("user:" + id);       // 1. 先查缓存
    if (user != null) return user;
    user = userDao.findById(id);               // 2. miss 查 DB
    if (user != null) cache.set("user:" + id, user, 3600);  // 3. 回填
    return user;
}
public void updateUser(User user) {
    userDao.update(user);                      // 1. 更新 DB
    cache.del("user:" + user.getId());         // 2. 删除缓存（而非更新）
}
\`\`\`

**为什么写时"删缓存"而非"更新缓存"？**

1. **避免并发不一致**：更新缓存时，并发写可能产生旧值覆盖新值。
2. **节省资源**：有些缓存值计算昂贵（多表 JOIN），频繁更新浪费；删缓存是惰性的，下次读再算。
3. **避免脏数据**：若更新缓存失败，缓存残留旧值；删缓存失败可重试删除。

**Cache-Aside 的并发问题**：

场景一：写后删缓存，但缓存删除失败 → 缓存残留旧值。
解决：延迟双删、消息队列重试删除。

场景二（罕见但存在）：读 miss 查 DB 后，另一线程更新 DB 删缓存，读线程把旧值回填 → 缓存旧值。
解决：延迟双删；或接受这个极低概率不一致。

#### 3.2 Read-Through（读穿透）

应用只读缓存，缓存层负责从 DB 加载（缓存充当 DB 代理）。

\`\`\`
应用 ──读──▶ 缓存层 ──miss──▶ [Loader 回源 DB] ──回填──▶ 返回
\`\`\`

\`\`\`java
// Java：CacheLoader 模式（Guava/Caffeine）
Cache<Long, User> cache = Caffeine.newBuilder()
    .maximumSize(10000)
    .build(id -> userDao.findById(id));  // miss 时自动调
User u = cache.getIfPresent(id);  // 应用无感知回源
\`\`\`

**优点**：应用代码简洁，不关心回源逻辑；缓存层统一控制。
**缺点**：缓存组件需支持 Loader；首次 miss 仍慢。

#### 3.3 Write-Through（写穿透）

写操作同步更新缓存和 DB，由缓存层代理。

\`\`\`
应用 ──写──▶ 缓存层 ──同步──▶ 更新缓存 + 写 DB ──▶ 返回
\`\`\`

**优点**：缓存与 DB 强一致，读永远命中缓存（除淘汰）。
**缺点**：写延迟高（等 DB）、写性能受限。

#### 3.4 Write-Behind / Write-Back（写回）

写操作只更新缓存，缓存异步刷盘到 DB。

\`\`\`
应用 ──写──▶ 缓存层 ──立即返回
              └──异步定时──▶ 批量刷 DB
\`\`\`

**优点**：写性能极高（纯内存）、可批量合并写。
**缺点**：缓存宕机会丢数据（未刷盘）、一致性弱。

**适用场景**：日志、计数、监控数据等容忍丢失的场景。

#### 3.5 四种模式对比

| 模式 | 读 | 写 | 一致性 | 性能 | 适用场景 |
| --- | --- | --- | --- | --- | --- |
| Cache-Aside | 应用管 | 应用删缓存 | 最终一致 | 高 | 通用，最常用 |
| Read-Through | 缓存代理 | 应用管 | 最终一致 | 高 | 简化应用代码 |
| Write-Through | 缓存代理 | 缓存同步写 DB | 强一致 | 写慢 | 一致性要求高 |
| Write-Behind | 缓存代理 | 缓存异步写 DB | 弱一致 | 写极快 | 容忍丢数据 |

### 四、缓存淘汰算法详解

缓存容量有限，满了要淘汰谁？这是淘汰算法要回答的问题。好算法提升命中率，坏算法导致缓存颠簸。

#### 4.1 LRU（Least Recently Used，最近最少使用）

**原理**：淘汰最久没被访问的。基于"最近访问过的，未来更可能被访问"的局部性原理。

**实现**：哈希表 + 双向链表。访问时移到链表头部，淘汰时删尾部。

\`\`\`
访问顺序：A B C D A E
LRU 链表（头→尾）：
  访问A: [A]
  访问B: [B,A]
  访问C: [C,B,A]
  访问D: [D,C,B,A]
  访问A: [A,D,C,B]   // A 移到头
  访问E 容量4: [E,A,D,C]  // 淘汰 B（尾部）
\`\`\`

**优点**：实现简单、对热点数据友好。
**缺点**：偶尔被访问的冷数据会"挤掉"热点（如全表扫描把热点刷掉）。

#### 4.2 LFU（Least Frequently Used，最少使用频率）

**原理**：淘汰访问次数最少的。统计每个元素的访问频次。

**优点**：比 LRU 更精准识别热点，避免扫描污染。
**缺点**：老热点频次高，即使后来变冷也不易淘汰（频次衰减问题）；计数开销大。

Redis 4.0 的 LFU 用 Morris 计数器做概率计数，并支持频次衰减，缓解此问题。

#### 4.3 FIFO（First In First Out，先进先出）

**原理**：淘汰最早进入缓存的。队列实现。

**优点**：最简单。
**缺点**：命中率低，不管访问频繁度，早期热点会被淘汰。基本不用。

#### 4.4 ARC（Adaptive Replacement Cache，自适应替换）

**原理**：同时维护最近淘汰（LRU）和频繁淘汰（LFU）两个队列，根据命中率自适应调整二者比例。

**优点**：自适应工作负载，命中率高于纯 LRU/LFU。
**缺点**：实现复杂、内存开销大。用于一些存储系统（如 ZFS）。

#### 4.5 TinyLFU

**原理**：用 Count-Min Sketch（概率计数）记录访问频率，结合 LRU 驱逐。频次统计用少量内存，且支持老化（定期减半）。

Caffeine（Java 高性能缓存）使用 W-TinyLFU，在现代工作负载下命中率接近理论最优。

**优点**：内存高效、命中率高、抗扫描污染。
**缺点**：实现复杂。

#### 4.6 算法对比

| 算法 | 依据 | 命中率 | 内存 | 抗扫描 | 适用 |
| --- | --- | --- | --- | --- | --- |
| FIFO | 时间 | 低 | 低 | 差 | 极简场景 |
| LRU | 最近访问 | 中 | 中 | 差 | 通用 |
| LFU | 访问频次 | 中高 | 高 | 好 | 热点稳定 |
| ARC | 自适应 | 高 | 高 | 中 | 存储系统 |
| TinyLFU | 频次+LRU | 高 | 低 | 好 | 现代缓存(Caffeine) |

### 五、缓存三大问题

缓存引入后，有三类经典故障：穿透、击穿、雪崩。面试高频，生产必防。

#### 5.1 缓存穿透（Cache Penetration）

**定义**：查询一个**根本不存在**的 key，缓存永远 miss，请求全部打到 DB。

\`\`\`
恶意请求 user:id=-1（不存在）
  → 缓存 miss（从未缓存）
  → 查 DB → DB 也没有 → 不缓存
  → 每次都打 DB
\`\`\`

**危害**：恶意攻击（用大量不存在的 key）可压垮 DB。

**解决方案**：

1. **缓存空值**：DB 查不到也缓存一个 null（设短过期，如 60s）。
   \`\`\`java
   User u = userDao.findById(id);
   if (u == null) {
       cache.set("user:" + id, "NULL", 60);  // 缓存空值
   } else {
       cache.set("user:" + id, u, 3600);
   }
   \`\`\`
   缺点：可能缓存大量空 key 浪费内存；数据后来存在了需等过期。

2. **布隆过滤器（Bloom Filter）**：在缓存前加一层布隆过滤器，预先存所有合法 key。请求先过过滤器，不存在直接拒绝。
   \`\`\`java
   if (!bloomFilter.mightContain("user:" + id)) {
       return null;  // 过滤器说不存在，直接返回
   }
   // 过滤器说可能存在，再查缓存/DB
   \`\`\`
   优点：内存极省（1 亿 key 约 100MB）、查询 O(k)。
   缺点：有误判率（说存在可能不存在）、不能删除。

3. **接口层校验**：非法参数（负数 ID、畸形格式）直接拒绝。

#### 5.2 缓存击穿（Cache Breakdown）

**定义**：一个**热点 key** 突然过期，瞬间大量并发请求同时 miss，全部打 DB 重建缓存。

\`\`\`
热 key "hot:item" 过期瞬间
  → 1000 个并发请求同时 miss
  → 1000 个请求同时查 DB 重建缓存
  → DB 瞬时压力暴增
\`\`\`

**与穿透区别**：穿透是查不存在的 key；击穿是存在的热 key 过期。

**解决方案**：

1. **互斥锁（Mutex）**：只让一个请求查 DB 重建，其他等待。
   \`\`\`java
   String val = cache.get(key);
   if (val == null) {
       // 获取互斥锁（Redis SETNX）
       if (redis.setnx("lock:" + key, "1", 10)) {
           try {
               val = db.query(key);
               cache.set(key, val, 3600);
           } finally {
               redis.del("lock:" + key);
           }
       } else {
           Thread.sleep(50);  // 等待后重试
           return get(key);
       }
   }
   \`\`\`
   缺点：降低并发度，等待请求增加延迟。

2. **逻辑过期**：value 内部存逻辑过期时间，不设 Redis TTL。后台发现逻辑过期后异步重建，期间返回旧值。
   \`\`\`java
   CacheItem item = cache.get(key);
   if (item.isLogicExpired()) {
       // 异步重建（只一个线程，用锁）
       if (redis.setnx("rebuild:" + key, "1", 60)) {
           executor.submit(() -> rebuild(key));
       }
       return item.value;  // 先返回旧值
   }
   \`\`\`
   优点：不阻塞、不miss；缺点：短暂数据不一致。

3. **永不过期**：热点 key 不设过期，靠后台定时刷新。
   缺点：内存占用、需主动更新。

#### 5.3 缓存雪崩（Cache Avalanche）

**定义**：大量 key **同时过期**，或 **Redis 宕机**，导致请求大面积打 DB。

\`\`\`
场景一：批量预热的 key 设了相同 TTL，同时过期 → DB 瞬时洪峰
场景二：Redis 集群宕机 → 所有请求打 DB → DB 雪崩
\`\`\`

**解决方案**：

1. **过期时间加随机**：避免同时过期。
   \`\`\`java
   int ttl = 3600 + ThreadLocalRandom.current().nextInt(300);  // 3600~3900
   cache.set(key, val, ttl);
   \`\`\`

2. **多级缓存**：本地缓存（Caffeine）兜底，Redis 挂了本地还有。

3. **熔断降级**：DB 压力过大时，熔断返回降级数据（默认值、提示）。
   \`\`\`java
   try {
       return db.query(key);
   } catch (Exception e) {
       if (circuitBreaker.isOpen()) return defaultValue;  // 降级
       throw e;
   }
   \`\`\`

4. **Redis 高可用**：哨兵/集群避免单点宕机。

5. **限流**：限制打到 DB 的 QPS，保护 DB。

#### 5.4 三大问题对比

| 问题 | 原因 | 特征 | 主要方案 |
| --- | --- | --- | --- |
| 穿透 | 查不存在的 key | 持续 miss | 空值缓存/布隆过滤器 |
| 击穿 | 热 key 过期 | 单 key 瞬时 miss | 互斥锁/逻辑过期 |
| 雪崩 | 大量 key 过期或宕机 | 大面积 miss | 随机过期/多级缓存/熔断 |

### 六、缓存与数据库一致性难题

缓存与 DB 是两个存储，无法做到强一致（除非 2PC，代价极高）。工程上追求**最终一致**。关键问题是：更新数据时，先操作缓存还是先操作 DB？

#### 6.1 四种组合分析

| 方案 | 操作顺序 | 问题 |
| --- | --- | --- |
| 先更新缓存，再更新 DB | 缓存新值，DB 旧值 | DB 更新失败，缓存是新值（脏） |
| 先更新 DB，再更新缓存 | DB 新值，缓存旧值 | 并发更新，缓存可能被旧值覆盖 |
| 先删缓存，再更新 DB | 缓存空，DB 更新中 | 并发读会回填旧值到缓存 |
| 先更新 DB，再删缓存（推荐） | DB 新值，缓存删 | 删除失败导致不一致（可补偿） |

**推荐：先更新 DB，再删缓存**。理由：
- 删除是幂等的，失败可重试。
- 避免"更新缓存"的并发覆盖问题。
- 即使删缓存失败，下次读会 miss 重建（拿到 DB 新值）。

#### 6.2 删缓存失败的补偿

如果"更新 DB 后删缓存"失败，缓存残留旧值。补偿方案：

1. **重试删除**：捕获删除失败，重试几次。
2. **消息队列**：删缓存失败发 MQ，消费者重试删除。
3. **订阅 binlog**：用 Canal 监听 MySQL binlog，发现数据变更异步删缓存。
   \`\`\`
   MySQL ──binlog──▶ Canal ──▶ 消费者 ──删 Redis 缓存
   \`\`\`
   优点：业务代码解耦、可靠性高；缺点：引入 Canal 组件、有延迟。

#### 6.3 延迟双删

针对"先删缓存，再更新 DB"的并发回填旧值问题，采用延迟双删：

\`\`\`
1. 删除缓存
2. 更新 DB
3. 休眠 N 毫秒（等并发读完成回填）
4. 再次删除缓存
\`\`\`

\`\`\`java
redis.del(key);          // 1. 先删
db.update(data);         // 2. 更新 DB
Thread.sleep(500);       // 3. 等读请求回填完
redis.del(key);          // 4. 再删
\`\`\`

**缺点**：休眠降低性能、N 难以确定。一般配合 binlog 方案更可靠。

#### 6.4 一致性策略对比

| 策略 | 一致性 | 复杂度 | 适用 |
| --- | --- | --- | --- |
| 先更新 DB 再删缓存 | 最终一致 | 低 | 通用推荐 |
| 延迟双删 | 较高 | 中 | 强一致要求 |
| binlog 订阅删除 | 最终一致 | 中高 | 大型系统 |
| 2PC/分布式事务 | 强一致 | 极高 | 金融级（少用） |

> 实践经验：绝大多数业务用"先更新 DB 再删缓存 + 删除重试"足够；强一致场景加 binlog 兜底。

### 七、本地缓存 vs 分布式缓存

| 维度 | 本地缓存 | 分布式缓存(Redis) |
| --- | --- | --- |
| 位置 | 应用进程内 | 独立集群 |
| 速度 | 纳秒级（无网络） | 毫秒级（网络往返） |
| 容量 | 受应用内存限制 | 大（独立机器） |
| 一致性 | 多实例不一致 | 集中一致 |
| 共享 | 不共享 | 多实例共享 |
| 故障 | 应用重启丢失 | 独立可用性 |
| 代表 | Caffeine/Guava | Redis/Memcached |

**Java 本地缓存选型**：
- **Caffeine**：当前最强，W-TinyLFU 算法，性能超越 Guava。
- **Guava Cache**：老牌，简单易用，已被 Caffeine 取代。
- **Ehcache**：支持堆外、磁盘，适合大容量本地缓存。

\`\`\`java
// Caffeine 示例
Cache<String, User> cache = Caffeine.newBuilder()
    .maximumSize(10_000)
    .expireAfterWrite(10, TimeUnit.MINUTES)
    .recordStats()
    .build();
\`\`\`

### 八、多级缓存架构

大型系统用多级缓存组合，各取所长：

\`\`\`
请求 ──▶ Nginx 缓存 ──▶ 本地缓存(Caffeine) ──▶ Redis ──▶ DB
            (整页)         (热点,极快)         (主体)    (兜底)
\`\`\`

**设计要点**：
1. **本地缓存放极热数据**（Top 100 商品），TTL 短（秒级）。
2. **Redis 放主体热点**，TTL 分钟级。
3. **本地缓存防 Redis 击穿**，Redis 防 DB 击穿。
4. **一致性**：本地缓存多实例不一致，靠短 TTL + Redis 兜底。

#### 热点缓存发现与本地下沉

发现热点 key 后，将其下沉到本地缓存：

\`\`\`java
// 监控 Redis 访问频次，超过阈值判定为热点
if (accessCounter.count(key) > HOT_THRESHOLD) {
    localCache.put(key, value, 5);  // 本地缓存 5 秒
}
\`\`\`

工具：京东 hotkey、有赞 TMC 等热点探测框架。

### 九、缓存预热与刷新

#### 9.1 缓存预热

系统启动或大促前，提前把热点数据加载到缓存，避免冷启动时 DB 被打爆。

\`\`\`java
// 启动时预热 Top 商品
@PostConstruct
public void preload() {
    List<Long> hotIds = productDao.findTop100();
    for (Long id : hotIds) {
        cache.set("product:" + id, productDao.findById(id), 3600);
    }
}
\`\`\`

#### 9.2 缓存刷新

数据变更后主动刷新缓存：
- **主动删除**：写操作后删缓存。
- **消息广播**：通过 MQ/Pub-Sub 通知所有实例刷新本地缓存。
- **版本号**：缓存带版本号，版本变更视为失效。

### 十、缓存监控指标

生产缓存必须监控：

| 指标 | 含义 | 告警阈值 |
| --- | --- | --- |
| 命中率 | hit / (hit+miss) | <90% 告警 |
| QPS | 每秒查询数 | 接近上限告警 |
| 平均延迟 | 单次操作耗时 | >5ms 告警 |
| 内存使用 | used_memory | >80% 告警 |
| 淘汰速率 | evicted_keys | 突增告警 |
| 慢查询 | slowlog | 持续增长告警 |

命中率是缓存健康的核心指标，命中率低说明缓存设计有问题（TTL 太短、容量太小、预热不足）。

### 十一、缓存预热策略

缓存冷启动是线上事故的高发场景——服务刚启动时缓存为空，大量请求直接打到数据库，可能导致数据库过载甚至崩溃。

#### 11.1 冷启动问题

\`\`\`
服务启动 → 缓存为空 → 全量请求穿透到 DB → DB 过载 → 服务雪崩

正常状态：缓存命中率 95%+，DB 只承担 5% 流量
冷启动状态：缓存命中率 0%，DB 承担 100% 流量 → 瞬间过载
\`\`\`

#### 11.2 预热方案

**方案一：启动时加载热点数据**

\`\`\`java
// Spring Boot 启动时预热缓存
@Component
public class CacheWarmer implements ApplicationRunner {
    @Autowired
    private ProductRepository productRepo;
    @Autowired
    private RedisTemplate<String, Object> redis;

    @Override
    public void run(ApplicationArguments args) {
        // 加载热门商品到缓存
        List<Product> hotProducts = productRepo.findTop100Hot();
        for (Product p : hotProducts) {
            redis.opsForValue().set(
                "product:" + p.getId(), p, 1, TimeUnit.HOURS
            );
        }
        log.info("缓存预热完成，加载 {} 条热点数据", hotProducts.size());
    }
}
\`\`\`

\`\`\`go
// Go 启动时预热
func WarmCache(db *sql.DB, rdb *redis.Client) error {
    rows, err := db.Query("SELECT id, name FROM products ORDER BY sales DESC LIMIT 100")
    if err != nil {
        return err
    }
    defer rows.Close()

    ctx := context.Background()
    pipe := rdb.Pipeline()
    count := 0
    for rows.Next() {
        var id int
        var name string
        rows.Scan(&id, &name)
        pipe.Set(ctx, fmt.Sprintf("product:%d", id), name, time.Hour)
        count++
    }
    _, err = pipe.Exec(ctx)  // 批量执行，减少网络往返
    log.Printf("缓存预热完成，加载 %d 条数据", count)
    return err
}
\`\`\`

\`\`\`python
# Python 启动预热
import redis
import django

def warm_cache():
    r = redis.Redis()
    from myapp.models import Product
    # 批量加载热点数据
    hot_products = Product.objects.order_by('-sales')[:100]
    pipe = r.pipeline()
    for p in hot_products:
        pipe.setex(f"product:{p.id}", 3600, p.to_json())
    pipe.execute()
    print(f"缓存预热完成，加载 {len(hot_products)} 条数据")
\`\`\`

**方案二：渐进式预热**

不一次性加载所有数据（可能太慢或太多），而是在前 N 个请求时触发加载：

\`\`\`java
// 渐进式预热：首次访问时加载
public Product getProduct(Long id) {
    String key = "product:" + id;
    Product product = redis.get(key);
    if (product != null) {
        return product;
    }
    // 缓存未命中，查 DB
    product = productRepo.findById(id);
    if (product != null) {
        redis.set(key, product, 1, TimeUnit.HOURS);
    }
    return product;
}
// 配合限流：冷启动时限流到 DB 可承受范围
// 例如：正常 1000 QPS，冷启动时限流到 200 QPS，逐步放开
\`\`\`

**方案三：影子缓存**

新实例启动时，从旧实例的缓存数据复制：

\`\`\`
新实例启动 → 从旧实例的 Redis SCAN 所有 key → 批量复制到新实例
→ 新实例缓存就绪 → 接入流量
\`\`\`

**方案四：定时预热**

对周期性数据（如排行榜、报表），提前定时计算并写入缓存：

\`\`\`java
// 每天凌晨 2 点预热当天排行榜
@Scheduled(cron = "0 0 2 * * ?")
public void warmLeaderboard() {
    // 计算前一天的数据
    List<Ranking> rankings = rankingService.calculateYesterdayRanking();
    redis.delete("leaderboard:today");
    for (Ranking r : rankings) {
        redis.zadd("leaderboard:today", r.getScore(), r.getUserId());
    }
}
\`\`\`

#### 11.3 预热的注意事项

1. **不要预热所有数据**：只预热热点数据（访问频率 top 10%）
2. **预热要限速**：大量数据同时写入缓存，可能压垮缓存或网络
3. **预热失败要降级**：预热失败不阻塞服务启动
4. **灰度发布配合**：新实例先接 10% 流量，逐步增加到 100%

### 十二、多级缓存架构

单层缓存在高并发下仍有瓶颈——Redis 单实例 QPS ~10 万，万兆网卡可能跑满。多级缓存通过分层降低后端压力。

#### 12.1 多级缓存架构图

\`\`\`
请求 → CDN 缓存（静态资源）
  ↓ miss
Nginx 缓存（页面级缓存）
  ↓ miss
本地缓存（应用进程内，如 Caffeine/Guava）
  ↓ miss
分布式缓存（Redis Cluster）
  ↓ miss
数据库（MySQL）
\`\`\`

每一层缓存命中率假设 80%：
- CDN 命中 80% → 剩余 20% 到 Nginx
- Nginx 命中 80% → 剩余 4% 到本地缓存
- 本地缓存命中 80% → 剩余 0.8% 到 Redis
- Redis 命中 80% → 剩余 0.16% 到 DB

最终 DB 只承担原始流量的 0.16%！

#### 12.2 本地缓存 vs 分布式缓存

| 特性 | 本地缓存（Caffeine/Guava） | 分布式缓存（Redis） |
| --- | --- | --- |
| 速度 | 纳秒级（内存直接访问） | 微秒级（网络往返） |
| 容量 | 受 JVM 内存限制（GB 级） | 可扩展到 TB 级 |
| 一致性 | 每实例独立，数据可能不一致 | 集中存储，一致 |
| 可靠性 | 实例重启丢失 | 持久化，高可用 |
| 扩展性 | 加实例缓存不共享 | 天然扩展 |
| 适用 | 只读/准实时/热点 | 通用缓存 |

#### 12.3 本地缓存实现

\`\`\`java
// Caffeine（推荐，性能最好的 Java 本地缓存）
Cache<String, Product> cache = Caffeine.newBuilder()
    .maximumSize(10_000)           // 最多 1 万条
    .expireAfterWrite(10, TimeUnit.MINUTES)  // 写后 10 分钟过期
    .expireAfterAccess(30, TimeUnit.MINUTES) // 访问后 30 分钟过期
    .recordStats()                  // 开启统计
    .build();

// 写入
cache.put("product:1", product);
// 读取
Product p = cache.getIfPresent("product:1");
// 带 loader 的读取（自动加载）
Product p = cache.get("product:1", key -> {
    return productRepo.findById(1L);  // 缓存未命中时从 DB 加载
});

// 统计信息
CacheStats stats = cache.stats();
System.out.println("命中率: " + stats.hitRate());
\`\`\`

\`\`\`go
// Go 用 sync.Map 或第三方库 bigcache/freecache
// bigcache：高性能、并发安全、支持过期
import "github.com/allegro/bigcache"
cache, _ := bigcache.NewBigCache(bigcache.DefaultConfig(10 * time.Minute))
cache.Set("product:1", []byte("data"))
entry, _ := cache.Get("product:1")
\`\`\`

\`\`\`python
# Python 用 functools.lru_cache 或 cachetools
from cachetools import TTLCache, cached

cache = TTLCache(maxsize=10000, ttl=600)  # 1万条，10分钟过期

@cached(cache)
def get_product(product_id):
    # 缓存未命中时执行
    return Product.objects.get(id=product_id)
\`\`\`

#### 12.4 本地+分布式二级缓存

\`\`\`java
// 二级缓存：先查本地，再查 Redis，最后查 DB
public Product getProduct(Long id) {
    String key = "product:" + id;

    // L1: 本地缓存
    Product product = localCache.getIfPresent(key);
    if (product != null) {
        return product;
    }

    // L2: Redis
    product = redis.opsForValue().get(key);
    if (product != null) {
        localCache.put(key, product);  // 回填 L1
        return product;
    }

    // L3: DB
    product = productRepo.findById(id);
    if (product != null) {
        redis.opsForValue().set(key, product, 1, TimeUnit.HOURS);
        localCache.put(key, product);
    }
    return product;
}
\`\`\`

**二级缓存的一致性问题**：
- 本地缓存过期时间应短于 Redis（如本地 5 分钟，Redis 1 小时）
- 数据更新时，需要失效所有实例的本地缓存
- 可用 Redis Pub/Sub 广播失效消息：

\`\`\`java
// 数据更新时广播失效
public void updateProduct(Product product) {
    productRepo.save(product);
    redis.delete("product:" + product.getId());
    redis.convertAndSend("cache:invalidate",
        "product:" + product.getId());  // 广播失效
}

// 所有实例订阅失效消息
@RedisListener(channel = "cache:invalidate")
public void onInvalidate(String key) {
    localCache.invalidate(key);
}
\`\`\`

### 十三、布隆过滤器详解

布隆过滤器（Bloom Filter）是缓存穿透防护的核心组件。

#### 13.1 原理

布隆过滤器用 k 个哈希函数将元素映射到 m 位的位数组中：

\`\`\`
插入元素 "hello"：
  h1("hello") % 8 = 2  → 位数组[2] = 1
  h2("hello") % 8 = 5  → 位数组[5] = 1
  h3("hello") % 8 = 7  → 位数组[7] = 1

位数组：[0, 0, 1, 0, 0, 1, 0, 1]

查询 "hello"：
  h1=2 → [2]=1 ✓
  h2=5 → [5]=1 ✓
  h3=7 → [7]=1 ✓
  → 可能存在

查询 "world"：
  h1("world") % 8 = 1 → [1]=0 ✗
  → 一定不存在
\`\`\`

**特性**：
- 空间效率极高：100 万元素，1% 误判率，只需 ~1.2MB
- 查询/插入 O(k)（k 是哈希函数数）
- 有误判率（false positive），但不会漏判（false negative）
- 不能删除元素（可以用 Counting Bloom Filter 解决）

#### 13.2 参数计算

给定元素数 n 和误判率 p，计算最优 m 和 k：

\`\`\`
m = -n × ln(p) / (ln(2))²
k = (m / n) × ln(2)

例：n=100万，p=1%
m = -1000000 × ln(0.01) / (ln(2))² ≈ 9585059 bits ≈ 1.14 MB
k = (9585059 / 1000000) × ln(2) ≈ 7 个哈希函数
\`\`\`

#### 13.3 多语言实现

\`\`\`java
// Google Guava
BloomFilter<Integer> filter = BloomFilter.create(
    Funnels.integerFunnel(),
    1_000_000,   // 预期元素数
    0.01         // 误判率 1%
);
filter.put(12345);
boolean mightExist = filter.mightContain(12345);  // true

// Redisson（分布式布隆过滤器）
RBloomFilter<String> filter = redisson.getBloomFilter("productFilter");
filter.tryInit(1_000_000L, 0.01);
filter.add("product:1");
boolean exists = filter.contains("product:1");
\`\`\`

\`\`\`go
// github.com/bits-and-blooms/bloom
import "github.com/bits-and-blooms/bloom/v3"
filter := bloom.NewWithEstimates(1000000, 0.01)  // 100万元素，1% 误判
filter.Add([]byte("product:1"))
exists := filter.Test([]byte("product:1"))  // true
\`\`\`

\`\`\`python
# pybloom_live
from pybloom_live import ScalableBloomFilter
sbf = ScalableBloomFilter(initial_capacity=100000, error_rate=0.001)
sbf.add("product:1")
exists = "product:1" in sbf  # True
\`\`\`

\`\`\`javascript
// Node.js
const { BloomFilter } = require('bloom-filters');
const filter = BloomFilter.create(1000000, 0.01);  // 100万元素，1% 误判
filter.add('product:1');
const exists = filter.has('product:1');  // true
\`\`\`

#### 13.4 布隆过滤器在缓存穿透中的应用

\`\`\`java
// 请求先过布隆过滤器
public Product getProduct(Long id) {
    // 1. 布隆过滤器判断
    if (!bloomFilter.mightContain(id)) {
        return null;  // 一定不存在，直接返回
    }

    // 2. 查缓存
    Product product = redis.get("product:" + id);
    if (product != null) {
        return product;
    }

    // 3. 查 DB
    product = productRepo.findById(id);
    if (product != null) {
        redis.set("product:" + id, product);
    } else {
        // 空值缓存，防止重复查 DB
        redis.set("product:" + id, "NULL", 5, TimeUnit.MINUTES);
    }
    return product;
}

// 新增数据时同步加入布隆过滤器
public void addProduct(Product product) {
    productRepo.save(product);
    bloomFilter.put(product.getId());
}
\`\`\`

### 十四、缓存击穿的高级防护——Singleflight

缓存击穿是指热点 key 过期瞬间，大量并发请求同时穿透到 DB。

#### 14.1 互斥锁方案

\`\`\`java
// 用 Redis 分布式锁防止重复加载
public Product getProduct(Long id) {
    String key = "product:" + id;
    Product product = redis.get(key);
    if (product != null) return product;

    // 获取分布式锁
    String lockKey = "lock:" + id;
    String requestId = UUID.randomUUID().toString();
    try {
        boolean locked = redis.setIfAbsent(lockKey, requestId, 10, TimeUnit.SECONDS);
        if (!locked) {
            // 没拿到锁，等待重试
            Thread.sleep(50);
            return getProduct(id);  // 递归重试
        }

        // 双重检查
        product = redis.get(key);
        if (product != null) return product;

        // 查 DB 并回填缓存
        product = productRepo.findById(id);
        redis.set(key, product, 1, TimeUnit.HOURS);
        return product;
    } finally {
        // 释放锁（用 Lua 保证原子性）
        redis.eval(
            "if redis.call('get', KEYS[1]) == ARGV[1] then " +
            "  return redis.call('del', KEYS[1]) " +
            "else return 0 end",
            Collections.singletonList(lockKey),
            Collections.singletonList(requestId)
        );
    }
}
\`\`\`

#### 14.2 Singleflight 模式

Singleflight 更优雅——同一 key 的并发请求只执行一次，其他请求共享结果。

\`\`\`go
// Go 标准库 golang.org/x/sync/singleflight
import "golang.org/x/sync/singleflight"

var g singleflight.Group

func GetProduct(id int) (*Product, error) {
    key := fmt.Sprintf("product:%d", id)

    // Do 方法：相同 key 的并发调用只执行一次 fn
    result, err, _ := g.Do(key, func() (interface{}, error) {
        // 只有一个 goroutine 执行到这里
        product, err := db.GetProduct(id)
        if err == nil {
            redis.Set(key, product, time.Hour)
        }
        return product, err
    })
    // 其他 goroutine 直接拿到结果
    if err != nil {
        return nil, err
    }
    return result.(*Product), nil
}
\`\`\`

\`\`\`java
// Java 无标准库，可用 CompletableFuture + ConcurrentHashMap 实现
public class Singleflight<K, V> {
    private final ConcurrentHashMap<K, CompletableFuture<V>> inFlight = new ConcurrentHashMap<>();

    public V execute(K key, Supplier<V> supplier) {
        while (true) {
            CompletableFuture<V> future = new CompletableFuture<>();
            CompletableFuture<V> existing = inFlight.putIfAbsent(key, future);
            if (existing == null) {
                // 第一个请求，执行实际逻辑
                try {
                    V value = supplier.get();
                    future.complete(value);
                    return value;
                } catch (Exception e) {
                    future.completeExceptionally(e);
                    throw e;
                } finally {
                    inFlight.remove(key);
                }
            } else {
                // 后续请求，等待结果
                try {
                    return existing.get(10, TimeUnit.SECONDS);
                } catch (TimeoutException e) {
                    inFlight.remove(key, existing);  // 超时清理
                    continue;  // 重新尝试
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
        }
    }
}

// 使用
Product p = singleflight.execute("product:1", () -> loadFromDB(1));
\`\`\`

#### 14.3 永不过期 + 异步刷新

对极热点数据，不设过期时间，改为异步刷新：

\`\`\`java
// 物理永不过期，逻辑过期
public Product getProduct(Long id) {
    String key = "product:" + id;
    ProductWrapper wrapper = redis.get(key);
    if (wrapper == null) {
        // 缓存不存在（首次或被清理），直接加载
        return loadAndCache(id);
    }

    if (wrapper.isExpired()) {
        // 逻辑过期，异步刷新
        executor.submit(() -> {
            // 加分布式锁，避免重复刷新
            if (redis.setIfAbsent("lock:" + id, "1", 30, TimeUnit.SECONDS)) {
                try {
                    Product fresh = productRepo.findById(id);
                    redis.set(key, new ProductWrapper(fresh, System.currentTimeMillis() + 3600000));
                } finally {
                    redis.delete("lock:" + id);
                }
            }
        });
        // 返回旧数据（可接受短时间不一致）
        return wrapper.getProduct();
    }
    return wrapper.getProduct();
}
\`\`\`

### 十五、分布式锁与缓存

分布式锁是缓存协调的核心组件，用于缓存重建、定时任务去重等。

#### 15.1 Redis 分布式锁实现

\`\`\`java
// SET key value NX PX 30000（原子操作）
public boolean tryLock(String key, String requestId, int expireMs) {
    return redis.opsForValue().setIfAbsent(key, requestId, expireMs, TimeUnit.MILLISECONDS);
}

// 释放锁（Lua 保证原子：判断+删除）
public boolean unlock(String key, String requestId) {
    String script =
        "if redis.call('get', KEYS[1]) == ARGV[1] then " +
        "  return redis.call('del', KEYS[1]) " +
        "else return 0 end";
    Long result = redis.execute(
        new DefaultRedisScript<>(script, Long.class),
        Collections.singletonList(key),
        requestId
    );
    return result != null && result == 1;
}
\`\`\`

#### 15.2 锁的常见问题

**问题一：锁过期但业务未完成**

业务执行时间超过锁过期时间，锁被自动释放，其他实例获取锁，导致并发执行。

\`\`\`java
// 解决：看门狗（Watchdog）自动续期
// Redisson 内置看门狗，默认每 10 秒续期到 30 秒
RLock lock = redisson.getLock("myLock");
lock.lock();  // 默认 30 秒过期，看门狗自动续期
try {
    // 业务逻辑
    doBusiness();
} finally {
    lock.unlock();
}
\`\`\`

**问题二：主从切换导致锁丢失**

主节点加锁后，还未同步到从节点就宕机，从节点提升为主后锁丢失。

\`\`\`
客户端 → 主节点 SET lock 1 NX → 成功
主节点宕机
从节点提升为主（锁数据丢失）
客户端 B → 新主节点 SET lock 1 NX → 成功
→ 两个客户端同时持锁！
\`\`\`

**RedLock 算法**（解决主从切换问题）：
\`\`\`
向 N 个独立 Redis 实例（非集群）同时加锁
超过半数（N/2+1）成功才算加锁成功
失败则向所有实例释放锁

例：5 个实例，3 个成功才算成功
任一实例宕机，只要 < 半数宕机，锁仍然有效
\`\`\`

> RedLock 也有争议（Martin Kleppmann 与 antirez 的争论），在极高可靠性要求的场景建议用 ZooKeeper/etcd。

#### 15.3 多语言分布式锁

\`\`\`go
// go-redis + redsync（RedLock 实现）
import "github.com/go-redsync/redsync/v4"
rs := redsync.New(rdb)
mutex := rs.NewMutex("myLock",
    redsync.WithExpiry(30*time.Second),
    redsync.WithTries(3),
    redsync.WithRetryDelay(200*time.Millisecond),
)
if err := mutex.Lock(); err != nil {
    return err  // 获取锁失败
}
defer mutex.Unlock()
// 业务逻辑
\`\`\`

\`\`\`python
# Python redis-py
import redis
import uuid
import time

r = redis.Redis()

def acquire_lock(name, timeout=10):
    identifier = str(uuid.uuid4())
    end = time.time() + timeout
    while time.time() < end:
        if r.set(name, identifier, nx=True, ex=30):
            return identifier
        time.sleep(0.1)
    return None

def release_lock(name, identifier):
    # Lua 脚本保证原子性
    script = """
    if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
    else
        return 0
    end
    """
    return r.eval(script, 1, name, identifier)
\`\`\`

### 十六、缓存监控与容量规划

#### 16.1 缓存关键指标

| 指标 | 计算方式 | 健康范围 | 异常处理 |
| --- | --- | --- | --- |
| 命中率 | hit / (hit + miss) | > 95% | < 90% 需排查 |
| Miss 率 | miss / (hit + miss) | < 5% | 过高检查 TTL/容量 |
| 淘汰率 | evicted / total_ops | < 1% | 过高说明容量不足 |
| 平均延迟 | 总耗时 / 请求数 | < 2ms | 过高检查慢查询 |
| P99 延迟 | 99 百分位 | < 10ms | 过高检查大 key |
| 内存使用 | used / max | < 80% | 过高需扩容 |
| 连接数 | connected_clients | < maxclients | 过高检查连接泄漏 |

#### 16.2 命中率分析

\`\`\`java
// Caffeine 统计
CacheStats stats = cache.stats();
System.out.printf("命中率: %.2f%%\n", stats.hitRate() * 100);
System.out.printf("平均加载时间: %.2fms\n", stats.averageLoadPenalty() / 1_000_000);
System.out.printf("淘汰数: %d\n", stats.evictionCount());

// 命中率低的原因排查：
// 1. TTL 太短 → 适当延长
// 2. 容量太小 → 增大 maximumSize
// 3. 访问模式不集中 → 数据本身不适合缓存
// 4. 预热不足 → 增加预热逻辑
\`\`\`

#### 16.3 容量规划

\`\`\`
估算缓存容量：

1. 数据量估算
   - 用户数据：100 万用户 × 2KB/用户 = 2GB
   - 商品数据：50 万商品 × 5KB/商品 = 2.5GB
   - 总计：4.5GB

2. 考虑增长率
   - 月增长 10% → 半年后 4.5 × 1.1^6 ≈ 7.96GB

3. 留出冗余
   - 内存使用率 < 80% → 需要 7.96 / 0.8 ≈ 10GB
   - 碎片率 1.3 → 需要 10 × 1.3 ≈ 13GB

4. 集群规划
   - 单节点 8GB（Redis 建议单实例 < 10GB）
   - 需要 2 主 2 从 = 4 个节点
   - 每主负责 ~4GB 数据
\`\`\`

### 十七、缓存设计模式综合案例

#### 17.1 商品详情页缓存设计

\`\`\`java
// 多级缓存 + 布隆过滤器 + 空值缓存 + 异步刷新
public class ProductService {
    // L1: 本地缓存
    private Cache<Long, Product> localCache = Caffeine.newBuilder()
        .maximumSize(10_000)
        .expireAfterWrite(5, TimeUnit.MINUTES)
        .build();

    // 布隆过滤器（防穿透）
    private BloomFilter<Long> bloomFilter;

    public Product getProduct(Long id) {
        // 1. 布隆过滤器
        if (!bloomFilter.mightContain(id)) {
            return null;
        }

        // 2. L1 本地缓存
        Product product = localCache.getIfPresent(id);
        if (product != null) return product;

        // 3. L2 Redis
        String key = "product:" + id;
        product = redis.get(key);
        if (product != null) {
            if (product == NULL_PLACEHOLDER) return null;  // 空值缓存
            localCache.put(id, product);
            return product;
        }

        // 4. 分布式锁防击穿
        String lockKey = "lock:" + id;
        if (redis.setIfAbsent(lockKey, "1", 10, TimeUnit.SECONDS)) {
            try {
                // 双重检查
                product = redis.get(key);
                if (product != null) return product;

                // 5. DB
                product = productRepo.findById(id);
                if (product != null) {
                    // 随机 TTL 防雪崩
                    int ttl = 3600 + random.nextInt(600);  // 1小时 ± 10分钟
                    redis.setex(key, ttl, product);
                    localCache.put(id, product);
                } else {
                    // 空值缓存
                    redis.setex(key, 300, NULL_PLACEHOLDER);
                }
                return product;
            } finally {
                redis.delete(lockKey);
            }
        } else {
            // 等待重试
            Thread.sleep(50);
            return getProduct(id);
        }
    }

    // 数据更新：延迟双删
    public void updateProduct(Product product) {
        productRepo.save(product);
        redis.delete("product:" + product.getId());  // 第一次删除
        localCache.invalidate(product.getId());

        // 延迟 500ms 再删一次（等读旧数据的请求完成）
        executor.schedule(() -> {
            redis.delete("product:" + product.getId());
        }, 500, TimeUnit.MILLISECONDS);
    }
}
\`\`\`

#### 17.2 缓存策略选型决策树

\`\`\`
数据特性？
├─ 写多读少 → 不适合缓存（或用 Write-Behind）
├─ 读多写少
│   ├─ 强一致 → Write-Through + 短 TTL
│   └─ 最终一致 → Cache-Aside + 延迟双删
├─ 超高并发读
│   ├─ 允许短暂不一致 → 多级缓存 + 异步刷新
│   └─ 不允许不一致 → 读写锁 + 本地缓存禁用
└─ 数据量极大
    ├─ 热点集中 → 只缓存热点（top 10%）
    └─ 访问均匀 → 考虑是否值得缓存
\`\`\`

### 十八、缓存降级与熔断

#### 18.1 缓存降级

当缓存故障时，系统需要降级策略避免雪崩：

\`\`\`java
// 缓存降级策略
public Product getProduct(Long id) {
    try {
        Product p = redis.get("product:" + id);
        if (p != null) return p;
        // 缓存未命中，查 DB
        return db.findById(id);
    } catch (RedisException e) {
        // 缓存故障，降级：直接查 DB + 限流
        if (rateLimiter.tryAcquire()) {
            return db.findById(id);  // 限流后查 DB
        }
        return getFallbackProduct(id);  // 返回降级数据
    }
}

// 降级数据：静态默认值或本地缓存
private Product getFallbackProduct(Long id) {
    Product cached = localCache.getIfPresent(id);
    if (cached != null) return cached;
    return Product.defaultProduct(id);  // 返回默认值
}
\`\`\`

**降级层次**：
\`\`\`
正常：Redis 命中 → 返回
降级1：Redis 未命中 → DB 查询 → 返回
降级2：Redis 故障 → DB 限流查询 → 返回
降级3：DB 也过载 → 本地缓存 → 返回
降级4：全失败 → 返回默认值/错误页
\`\`\`

#### 18.2 缓存熔断

当缓存持续故障时，熔断器避免每次请求都尝试连缓存：

\`\`\`java
// 用 Resilience4j 熔断器保护缓存调用
CircuitBreaker circuitBreaker = CircuitBreaker.ofDefaults("redis");
Product product = circuitBreaker.executeSupplier(() -> {
    return redis.get("product:" + id);
});
// 熔断器开启时直接走降级逻辑，不尝试连 Redis
\`\`\`

**熔断器状态**：
\`\`\`
CLOSED（正常）→ 错误率 > 50% → OPEN（熔断）
OPEN（熔断）→ 等待 10 秒 → HALF_OPEN（半开）
HALF_OPEN → 试探请求成功 → CLOSED
HALF_OPEN → 试探请求失败 → OPEN
\`\`\`

### 十九、缓存与数据库一致性深度剖析

#### 19.1 binlog 订阅方案

\`\`\`
MySQL → Canal（伪装从库）→ 读 binlog → 发 MQ → 消费者更新/失效缓存

优势：
  - 业务代码无需关心缓存失效
  - 保证最终一致（binlog 顺序消费）
  - 解耦业务逻辑和缓存管理
\`\`\`

\`\`\`java
// Canal 客户端消费 binlog
CanalConnector connector = CanalConnectors.newSingleConnector(
    new InetSocketAddress("canal-server", 11111),
    "example", "", "");
connector.connect();
connector.subscribe(".*\\..*");

while (true) {
    Message msg = connector.getWithoutAck(100);
    for (Entry entry : msg.getEntries()) {
        if (entry.getEntryType() == EntryType.ROWDATA) {
            RowChange rowChange = RowChange.parseFrom(entry.getStoreValue());
            for (RowData rowData : rowChange.getRowDatasList()) {
                // 处理数据变更
                handleRowChange(rowChange.getEventType(), rowData);
            }
        }
    }
    connector.ack(msg.getId());
}

// 根据变更失效缓存
void handleRowChange(EventType type, RowData rowData) {
    if (type == EventType.UPDATE || type == EventType.DELETE) {
        String id = getColumnValue(rowData.getBeforeColumnsList(), "id");
        redis.delete("product:" + id);  // 失效缓存
    }
}
\`\`\`

#### 19.2 一致性方案对比

| 方案 | 一致性 | 复杂度 | 延迟 | 适用 |
| --- | --- | --- | --- | --- |
| 先更新DB再删缓存 | 最终 | 低 | 毫秒 | 大多数场景 |
| 延迟双删 | 较高 | 中 | 秒 | 写后读敏感 |
| binlog 订阅 | 最终 | 高 | 秒 | 大规模系统 |
| 强一致（锁） | 强 | 高 | 毫秒 | 金融交易 |

### 二十、缓存常见陷阱与最佳实践

#### 20.1 常见陷阱

**陷阱一：缓存存储大对象**

\`\`\`java
// 错误：缓存 10MB 的商品列表
redis.set("all_products", loadAllProducts());  // 10MB!
// 危害：网络传输慢、序列化慢、阻塞其他请求
// 修复：分页缓存，每页独立 key
for (int i = 0; i < totalPages; i++) {
    redis.set("products:page:" + i, loadPage(i));
}
\`\`\`

**陷阱二：缓存嵌套对象序列化深**

\`\`\`java
// 错误：深度嵌套对象，序列化/反序列化慢
class Order {
    User user;           // 1 层
    List<Item> items;    // 2 层
    Address address;     // 2 层
    Coupon coupon;       // 3 层
}
// 修复：用扁平 DTO，减少嵌套
class OrderCacheDTO {
    Long userId;
    String userName;
    List<Long> itemIds;
    String address;
}
\`\`\`

**陷阱三：缓存 key 设计不合理**

\`\`\`java
// 错误：key 包含可变部分，命中率低
String key = "product:" + id + ":" + System.currentTimeMillis();  // 每毫秒都不同！
// 修复：key 只包含必要标识
String key = "product:" + id;
\`\`\`

#### 20.2 最佳实践清单

1. **key 命名规范**：业务:实体:ID，如 order:user:123
2. **设置合理 TTL**：不要永不过期（除非有主动失效机制）
3. **随机化 TTL**：基础 TTL ± 10%，防止雪崩
4. **避免大 value**：单个 value < 10KB
5. **使用 Pipeline**：批量操作减少网络往返
6. **监控命中率**：< 90% 需排查
7. **灰度发布**：新缓存策略先灰度验证

### 二十一、缓存安全与多级缓存实践补充

#### 21.1 缓存安全风险

缓存不仅是性能工具，也是安全攻击面。常见风险：

1. **缓存投毒（Cache Poisoning）**：攻击者构造特殊请求污染缓存，使其他用户读到恶意数据。
   - 防护：缓存 key 包含用户身份；对响应做完整性校验。
2. **缓存穿透攻击**：故意请求大量不存在 key，绕过缓存打数据库。
   - 防护：布隆过滤器 + 空值缓存 + 限流。
3. **敏感数据泄露**：将密码、Token 等敏感信息缓存到 Redis 且无 TTL。
   - 防护：敏感数据不入缓存；必须缓存时加密存储并设置短 TTL。
4. **缓存雪崩放大**：大 key 过期瞬间，海量请求打到数据库。
   - 防护：随机 TTL + 热点永不过期 + 限流降级。

#### 21.2 多级缓存的容量估算

设计多级缓存时需估算各层容量：

\`\`\`
本地缓存 (L1): 命中率 30%~50%, 容量 = 热点数据量
  → 用 Caffeine/Guava, 容量小(百MB级), TTL 短(秒级)

Redis 缓存 (L2): 命中率 40%~60%, 容量 = 活跃数据量
  → 容量大(GB级), TTL 中等(分钟级)

DB: 命中率 5%~10%, 兜底数据源
  → 容量全量, 永久存储

整体命中率 = L1命中率 + (1-L1命中率) × L2命中率
例: L1=40%, L2=60% → 整体 = 40% + 60%×60% = 76%
\`\`\`

#### 21.3 缓存预热的数据来源

1. **全量预热**：启动时从 DB 加载所有热点数据。适合数据量小的场景。
2. **增量预热**：通过 binlog 订阅（Canal/Debezium）实时同步 DB 变更到缓存。
3. **懒加载预热**：首次访问时加载并缓存，适合长尾数据。
4. **定时预热**：定时任务在低峰期刷新缓存，适合数据有周期性变化的场景。

#### 21.4 缓存与微服务架构

微服务下每个服务有自己的缓存实例，避免共享导致耦合：

\`\`\`
Order Service → Redis-A (订单缓存)
User Service  → Redis-B (用户缓存)
Product Service → Redis-C (商品缓存)
\`\`\`

跨服务缓存一致性问题：订单服务缓存了用户信息，用户服务更新后订单服务缓存过期。
解决方案：
1. **事件驱动**：用户服务更新后发事件，订单服务监听并清除缓存。
2. **避免跨服务缓存**：订单服务不缓存用户信息，需要时实时调用用户服务。
3. **CQRS + 物化视图**：通过事件总线同步数据到各服务的本地视图。

> 微服务架构下，缓存的所有权属于数据所有者服务，其他服务不应直接缓存其数据。

### 二十二、小结

缓存是后端性能的"放大器"——设计良好，系统轻松扛住十倍流量；设计不当，反而引入一致性与稳定性问题。掌握四种读写模式、五大淘汰算法、三大问题防护、一致性方案，才能在"性能"与"正确性"间取得平衡。下一章我们讨论分库分表——当单库单表扛不住时，如何水平扩展数据存储。`,
    code: `// ============================================================
// 缓存策略与一致性 —— Cache-Aside + LRU + TTL + 三大问题防护
// ============================================================

// ---------- LRU 缓存（Map 维护访问顺序）----------
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();  // Map 按插入序，删后重插即"移到末尾=最新"
  }
  get(key) {
    if (!this.cache.has(key)) return null;
    const val = this.cache.get(key);
    this.cache.delete(key);     // 删除再插入，移到末尾（最新）
    this.cache.set(key, val);
    return val;
  }
  put(key, val, ttl) {
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size >= this.capacity) {
      // 淘汰最旧（Map 第一个 key）
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }
    const item = { val, expire: ttl ? Date.now() + ttl : 0 };
    this.cache.set(key, item);
  }
  // 带 TTL 的取
  getTTL(key) {
    if (!this.cache.has(key)) return null;
    const item = this.cache.get(key);
    if (item.expire && Date.now() > item.expire) {
      this.cache.delete(key);
      return null;
    }
    // 访问移到末尾
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.val;
  }
  del(key) { return this.cache.delete(key); }
  size() { return this.cache.size; }
}

// ---------- 布隆过滤器（防穿透）----------
class BloomFilter {
  constructor(size, hashCount) {
    this.size = size;
    this.hashCount = hashCount;
    this.bits = new Uint8Array(size);
  }
  _hashes(key) {
    const hashes = [];
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    for (let i = 0; i < this.hashCount; i++) {
      h = (h * 1103515245 + 12345) >>> 0;
      hashes.push(h % this.size);
    }
    return hashes;
  }
  add(key) {
    for (const idx of this._hashes(key)) this.bits[idx] = 1;
  }
  mightContain(key) {
    return this._hashes(key).every(idx => this.bits[idx] === 1);
  }
}

// ---------- 模拟 DB ----------
const fakeDB = { 'user:1': { id: 1, name: '张三', age: 28 } };
function dbQuery(key) {
  return new Promise(res => setTimeout(() => res(fakeDB[key] || null), 20));
}

// ---------- Cache-Aside（含互斥锁防击穿）----------
class CacheAside {
  constructor() {
    this.cache = new LRUCache(1000);
    this.bloom = new BloomFilter(10000, 4);  // 预登记合法 key
    this.locks = new Map();  // 互斥锁防击穿
    this.stats = { hit: 0, miss: 0, dbQuery: 0 };
  }
  register(key) { this.bloom.add(key); }  // 预热合法 key

  async get(key) {
    // 防穿透：布隆过滤器先拦截不存在的 key
    if (!this.bloom.mightContain(key)) {
      this.stats.miss++;
      console.log('  [布隆过滤] ' + key + ' 不存在，直接拒绝(防穿透)');
      return null;
    }
    // 查缓存
    const cached = this.cache.getTTL(key);
    if (cached !== null) {
      this.stats.hit++;
      console.log('  [缓存命中] ' + key);
      return cached;
    }
    this.stats.miss++;
    // 防击穿：互斥锁，只允许一个请求查 DB
    if (this.locks.has(key)) {
      console.log('  [互斥锁] ' + key + ' 等待其他请求重建...');
      while (this.locks.has(key)) await new Promise(r => setTimeout(r, 5));
      return this.cache.getTTL(key);  // 别人已重建
    }
    this.locks.set(key, true);
    try {
      console.log('  [回源 DB] ' + key);
      this.stats.dbQuery++;
      const val = await dbQuery(key);
      // 防穿透：空值也缓存（短 TTL）
      if (val === null) {
        this.cache.put(key, null, 1000);  // 空值缓存 1 秒
      } else {
        // 防雪崩：TTL 加随机
        const ttl = 3000 + Math.floor(Math.random() * 1000);
        this.cache.put(key, val, ttl);
      }
      return val;
    } finally {
      this.locks.delete(key);
    }
  }
  // 写：先更新 DB，再删缓存
  async update(key, val) {
    fakeDB[key] = val;
    this.cache.del(key);
    console.log('  [写] 更新 DB + 删缓存 ' + key);
    // 延迟双删（模拟）
    setTimeout(() => this.cache.del(key), 100);
  }
  stats_() { return this.stats; }
}

// ===== 演示 =====
const ca = new CacheAside();
ca.register('user:1');  // 合法 key 登记

console.log('===== 1. 正常缓存命中流程 =====');
console.log('第一次读 user:1:', await ca.get('user:1'));
console.log('第二次读 user:1:', await ca.get('user:1'));

console.log('\\n===== 2. 缓存穿透防护 =====');
console.log('读不存在的 user:999:', await ca.get('user:999'));

console.log('\\n===== 3. 缓存击穿防护（并发重建）=====');
ca.cache.del('user:1');  // 模拟热 key 过期
const results = await Promise.all([ca.get('user:1'), ca.get('user:1'), ca.get('user:1')]);
console.log('并发读结果一致:', results.every(r => r && r.id === 1));

console.log('\\n===== 4. 缓存雪崩防护（随机 TTL）=====');
const ca2 = new CacheAside();
for (let i = 1; i <= 5; i++) {
  ca2.register('user:' + i);
  fakeDB['user:' + i] = { id: i, name: '用户' + i };
  await ca2.get('user:' + i);  // 预热，各自随机 TTL
}
console.log('5 个 key 已用随机 TTL 缓存，避免同时过期');

console.log('\\n===== 5. 缓存与 DB 一致性（先更新 DB 再删缓存 + 延迟双删）=====');
await ca.update('user:1', { id: 1, name: '张三(改)', age: 29 });
console.log('更新后读:', await ca.get('user:1'));

console.log('\\n===== 统计 =====');
console.log('stats:', JSON.stringify(ca.stats_()));
console.log('\\n===== 演示结束 =====');
`,
  },

  // =========================================================
  // 第三章：分库分表
  // =========================================================
  {
    id: "backend-sharding",
    group: "数据存储",
    icon: "🔀",
    title: "分库分表",
    content: `## 分库分表

**分库分表（Sharding）** 是数据库水平扩展的终极手段。当单库单表的数据量、并发量、存储量逼近极限时，把数据拆分到多个库多个表，是突破单机瓶颈的唯一出路。但分库分表是一把"双刃剑"——它解决了容量与并发问题，却引入了跨库 JOIN、分布式事务、全局 ID、数据迁移等一连串难题。一旦上了分库分表，就很难再回头。

本章将从"为什么分"、垂直与水平拆分、分片策略、分片键选择、核心难题、中间件选型、实战架构，讲到"什么时候不该分"。

### 一、为什么需要分库分表

#### 1.1 单库单表的瓶颈

关系数据库（如 MySQL）在单机上有明确的性能天花板，瓶颈来自四个维度：

**1. 数据量瓶颈**：单表数据量过大时，B+ 树索引层数增加（3 层→4 层），查询从 3 次磁盘 IO 变 4 次；且查询优化器在选择索引时可能选错，导致全表扫描。经验值：**单表超过 1000 万行**或**单表数据文件超过 50GB**，性能开始明显下降。

**2. 并发瓶颈**：单库的连接数有限（MySQL 默认 151，生产调到几百~上千），高并发下连接池耗尽。写并发还受限于磁盘 IO 和锁竞争。经验值：**单库 QPS 超过 5000、写 QPS 超过 1000** 需警惕。

**3. 磁盘瓶颈**：单机磁盘容量有限，SSD 单盘通常 TB 级。大表占用空间，备份、DDL（如 ALTER TABLE）耗时极长（亿级表加索引可能几小时）。

**4. 运维瓶颈**：单库故障影响全局，备份恢复慢，DDL 阻塞业务。

#### 1.2 瓶颈的量化指标

| 维度 | 告警阈值 | 危险阈值 |
| --- | --- | --- |
| 单表行数 | 1000 万 | 5000 万 |
| 单表大小 | 50GB | 200GB |
| 单库 QPS | 5000 | 10000 |
| 单库写 QPS | 1000 | 3000 |
| 单库连接数 | 800 | 1500 |
| 慢查询占比 | 1% | 5% |

> 注意：这些是经验值，非绝对。通过优化索引、SQL、缓存、读写分离，单表千万级仍可流畅运行。分库分表是"最后的手段"，不是"第一选择"。

### 二、垂直拆分 vs 水平拆分

数据库拆分分两大方向：垂直（按结构/业务拆）、水平（按数据行拆）。

#### 2.1 垂直分库

按业务把不同的表拆到不同库。如用户相关表放 user_db，订单相关表放 order_db。

\`\`\`
拆分前（单库 my_db）:
  my_db: users, user_profile, user_log, orders, order_item, products

垂直分库后:
  user_db:    users, user_profile, user_log
  order_db:   orders, order_item
  product_db: products
\`\`\`

**优点**：
- 业务解耦，各库独立维护、独立扩展。
- 减少单库连接压力。
- 故障隔离（订单库挂不影响用户库）。

**缺点**：
- 跨库 JOIN 变难（需应用层关联）。
- 分布式事务问题。
- 运维成本增加。

#### 2.2 垂直分表

把一张宽表按字段拆成多张表，热字段一表，冷字段一表。

\`\`\`
拆分前（宽表 user）:
  user: id, name, age, avatar, bio, preferences, login_history(大JSON)

垂直分表后:
  user_base:    id, name, age          (高频访问)
  user_detail:  id, avatar, bio, preferences  (低频)
  user_log:     id, login_history      (冷数据)
\`\`\`

**优点**：减少单行大小，提高缓存命中率（buffer pool 装更多热行）。
**缺点**：查询需 JOIN 或多次查询。

#### 2.3 水平分库

同一张表的数据按规则分散到不同库。如订单表按 userId 拆到 4 个库。

\`\`\`
order_db_0: orders (userId % 4 == 0)
order_db_1: orders (userId % 4 == 1)
order_db_2: orders (userId % 4 == 2)
order_db_3: orders (userId % 4 == 3)
\`\`\`

#### 2.4 水平分表

同一库内，一张表拆成多张结构相同的表。

\`\`\`
order_db:
  orders_0 (orderId % 16 == 0)
  orders_1 ...
  orders_15
\`\`\`

实际生产常组合：**水平分库 + 水平分表**，如 4 库 × 4 表 = 16 分片。

#### 2.5 四种拆分对比

| 拆分方式 | 拆分维度 | 解决问题 | 引入问题 |
| --- | --- | --- | --- |
| 垂直分库 | 按业务拆表到库 | 业务耦合、连接数 | 跨库 JOIN |
| 垂直分表 | 按字段拆宽表 | 单行过大、缓存 | JOIN |
| 水平分库 | 按行拆到多库 | 并发、连接数 | 跨库查询、事务 |
| 水平分表 | 按行拆到多表 | 单表数据量 | 跨表查询 |

### 三、分片策略详解

水平拆分的关键是"按什么规则把数据分到哪个分片"。这是分片策略。

#### 3.1 范围分片

按分片键的范围划分。如按 ID 范围、按时间。

\`\`\`
分片0: id 0 ~ 1000 万
分片1: id 1000 万 ~ 2000 万
分片2: id 2000 万 ~ 3000 万
\`\`\`

或按时间：
\`\`\`
分片0: 2024 年 1 月数据
分片1: 2024 年 2 月数据
\`\`\`

**优点**：实现简单、扩容方便（加新分片接新范围）、范围查询友好。
**缺点**：热点问题——最新数据集中在最后一个分片，写入压力大（如最新订单都在最新分片）。

**适用**：时间序列数据、日志、按时间归档的场景。

#### 3.2 哈希分片

对分片键做哈希后取模，决定分片。

\`\`\`
shardIndex = hash(userId) % shardCount
\`\`\`

**优点**：数据分布均匀、无热点。
**缺点**：扩容困难——分片数变化时，几乎所有数据要重新分布（取模分片的痛点）。

#### 3.3 一致性哈希分片

解决哈希分片扩容迁移量大的问题。

**原理**：把哈希空间组织成环（0 ~ 2^32），节点和 key 都映射到环上。key 顺时针找最近的节点。

\`\`\`
         0
        / \\
   节点A   节点B
   |       |
   节点D   节点C
        \\ /
       2^32
\`\`\`

**扩容**：新增节点 N，只需把 N 在环上顺时针到下一个节点之间的 key 迁移过来，迁移量 = 总量/节点数，远小于取模的全量迁移。

**虚拟节点**：节点少时环上分布不均，每个物理节点映射多个虚拟节点（如 150 个），解决数据倾斜。

\`\`\`java
// 一致性哈希 Java 伪代码
TreeMap<Long, String> ring = new TreeMap<>();  // hash -> 节点
for (Node node : nodes) {
    for (int i = 0; i < VIRTUAL_NODES; i++) {
        long h = hash(node.name + "-" + i);
        ring.put(h, node);
    }
}
// 定位 key 的节点
String locate(String key) {
    long h = hash(key);
    SortedMap<Long, String> tail = ring.tailMap(h);
    long target = tail.isEmpty() ? ring.firstKey() : tail.firstKey();
    return ring.get(target);
}
\`\`\`

**优点**：扩容/缩容迁移量小、节点增删只影响相邻节点。
**缺点**：实现复杂、范围查询不友好。

#### 3.4 地理位置分片

按地域分片，如华北数据在北京机房库，华南数据在广州机房库。

**适用**：多机房部署、低延迟、数据合规（数据不出境）。

#### 3.5 业务分片

按业务维度分片，如按租户 ID（SaaS 多租户）、按商家 ID。

\`\`\`
租户A 的数据 → tenant_a_db
租户B 的数据 → tenant_b_db
\`\`\`

**适用**：SaaS、多租户系统。

#### 3.6 分片策略对比

| 策略 | 均匀性 | 扩容 | 范围查询 | 热点 | 适用 |
| --- | --- | --- | --- | --- | --- |
| 范围 | 差 | 易 | 好 | 有 | 时间序列 |
| 哈希取模 | 好 | 难 | 差 | 无 | 通用 |
| 一致性哈希 | 较好 | 较易 | 差 | 无 | 需频繁扩容 |
| 地理位置 | - | - | - | - | 多机房 |
| 业务 | - | 易 | - | - | 多租户 |

### 四、分片键选择原则

分片键（Sharding Key）决定数据落在哪个分片，选择至关重要。

**选择原则**：

1. **高基数**：分片键取值要多，否则数据集中少数分片，倾斜严重。如用"性别"分片只有 2 个值，必倾斜。
2. **均匀分布**：分片键取值要均匀，保证各分片数据量均衡。
3. **查询高频**：分片键应出现在大多数查询条件中，否则跨分片查询多。如订单系统大多按 userId 查，则用 userId 分片。
4. **不可变**：分片键值不能改，改了要迁移数据。
5. **非业务关键字段优先**：避免用会变动的字段。

**反例**：
- 用订单创建时间分片 → 最新分片写热点。
- 用手机号分片 → 手机号可能变更。
- 用自增 ID 分片 → 新数据集中在一个分片。

**正例**：订单系统按 userId 哈希分片，因为：
- userId 高基数、均匀。
- 绝大多数查询带 userId（查我的订单）。
- userId 不可变。

> 一旦选定分片键，几乎所有查询都应带它，否则就是跨分片扫描。这是分库分表的根本约束。

### 五、分库分表后的核心问题

分库分表解决了容量，却带来五大难题。

#### 5.1 跨库 JOIN 难题

分片后，原来一个 SQL 的 JOIN 现在跨库无法执行。

**解决方案**：

1. **应用层 JOIN**：分别查各分片，在内存中关联。
   \`\`\`java
   List<Order> orders = orderDao.findByUserId(userId);  // 订单分片
   List<Long> productIds = orders.stream().map(o -> o.productId).collect(...);
   List<Product> products = productDao.findByIds(productIds);  // 商品分片
   // 内存拼装
   \`\`\`

2. **冗余字段**：在订单表冗余商品名称，避免 JOIN。
   \`\`\`sql
   orders: id, user_id, product_id, product_name(冗余), amount
   \`\`\`
   缺点：商品名变更要同步更新所有订单。

3. **数据同步到 ES**：把多库数据同步到 Elasticsearch，借助 ES 做复杂查询。
   \`\`\`
   MySQL 分片 ──binlog──▶ ES ──▶ 复杂查询/搜索
   \`\`\`

4. **绑定表/广播表**：
   - 绑定表：按相同分片键分片的表（订单和订单详情都按 userId 分片），可 JOIN。
   - 广播表：小表（如字典表）每个库都存一份，JOIN 时本地查。

#### 5.2 分布式事务

跨库写操作需要事务保证。单库事务无法跨库。

**方案**：

1. **2PC（两阶段提交）**：协调者准备→提交。强一致，但性能差、阻塞。
2. **TCC（Try-Confirm-Cancel）**：业务层补偿事务。Try 预留资源，Confirm 确认，Cancel 回滚。高性能但开发量大。
3. **Saga**：长事务拆成一系列本地事务，失败时反向补偿。
4. **最终一致（消息事务）**：本地事务 + 消息队列，保证最终一致。
   \`\`\`java
   // 本地事务 + 消息
   @Transactional
   public void createOrder() {
       orderDao.insert(order);          // 本地库
       mq.send("order-created", order); // 发消息（可靠投递）
   }
   // 消费者：扣库存（另一个库）
   \`\`\`

> 实践：优先用"最终一致 + 消息"，避免强一致事务的性能代价。金融场景才用 TCC。

#### 5.3 全局唯一 ID

分库后，各库自增 ID 会冲突，需全局唯一 ID 生成方案。

**方案对比**：

| 方案 | 原理 | 优点 | 缺点 |
| --- | --- | --- | --- |
| UUID | 随机生成 | 简单、无中心 | 长（36字符）、无序、索引差 |
| 雪花算法 | 时间戳+机器ID+序列号 | 有序、高性能、无中心 | 时钟回拨问题 |
| 号段模式(Leaf) | DB 分配号段 | 简单、有序 | 依赖 DB、有瓶颈 |
| Redis INCR | 原子自增 | 简单 | 依赖 Redis、持久化风险 |
| 数据库多主自增 | 步长+起始值 | 简单 | 扩容难 |

**雪花算法（Snowflake）** 最常用：

\`\`\`
64 位 ID 结构：
| 1bit 符号 | 41bit 时间戳(ms) | 10bit 机器ID | 12bit 序列号 |
\`\`\`

- 时间戳：41 位，可用 69 年。
- 机器 ID：10 位，1024 个节点。
- 序列号：12 位，每毫秒 4096 个 ID。
- 趋势递增，利于 B+ 树索引。

\`\`\`java
// Java 雪花算法
public class Snowflake {
    long epoch = 1609459200000L;  // 起始时间
    long machineId;               // 机器ID
    long sequence = 0;
    long lastTs = -1;
    public synchronized long next() {
        long ts = System.currentTimeMillis();
        if (ts == lastTs) {
            sequence = (sequence + 1) & 0xFFF;  // 12bit
            if (sequence == 0) ts = waitNextMs(ts);
        } else sequence = 0;
        lastTs = ts;
        return ((ts - epoch) << 22) | (machineId << 12) | sequence;
    }
}
\`\`\`

#### 5.4 跨库分页排序

分页查询 \`LIMIT 10, 20\`（第 2 页）在分片后极难：

\`\`\`
要查"所有订单按时间倒序，第 2 页"
  → 各分片各自查前 30 条（LIMIT 0, 30）
  → 合并 4×30=120 条
  → 全局排序取第 10~20 条
\`\`\`

**问题**：页码越深，各分片要取的数据越多，性能越差（深分页）。

**解决方案**：

1. **禁止深分页**：限制最大页码（如最多 100 页）。
2. **游标分页**：用上一页最后一条的 ID/时间作游标，\`WHERE id < lastId LIMIT 20\`。
   \`\`\`sql
   -- 第 2 页：记录上一页最后的 id
   SELECT * FROM orders WHERE id < #{lastId} ORDER BY id DESC LIMIT 20
   \`\`\`
   优点：各分片只查 20 条，性能稳定。缺点：不能跳页。
3. **二次查询法**：先各分片 LIMIT，找到最小最大值范围，再精确查。
4. **同步 ES**：复杂分页走 ES。

#### 5.5 数据迁移与扩容

分片数不够时要扩容（如 4 分片→8 分片），数据要迁移。

**取模分片扩容**：4→8，取模变化，几乎全量数据要迁移。
**一致性哈希扩容**：只迁移新增节点相邻区间的数据，迁移量 ~1/8。

**迁移方案**：

1. **双写**：新老分片都写，后台同步历史数据，校验后切流。
   \`\`\`
   阶段1: 双写（新老都写），读老
   阶段2: 后台迁移历史数据
   阶段3: 校验一致，切读新
   阶段4: 停双写，下线老
   \`\`\`
2. **影子表**：在新分片建影子表，同步数据，原子切换。
3. **数据同步工具**：DataX、Canal、DTS 等。

### 六、分库分表中间件

中间件屏蔽分片细节，让应用像用单库一样操作分片。

#### 6.1 客户端模式

中间件是客户端 jar 包，应用直连各分片。

- **ShardingSphere-JDBC**（Apache）：Java 生态主流，无中间代理层，性能高。
- **TDDL**（阿里）：内部使用。

**优点**：无中间层、性能高、无单点。
**缺点**：只支持 Java、升级需重新发布。

#### 6.2 代理模式

中间件是独立服务，应用连代理，代理转发到分片。

- **ShardingSphere-Proxy**：ShardingSphere 的代理版。
- **MyCat**：老牌开源代理。
- **Vitess**（Google）：YouTube 在用，云原生。
- **MySQL Router**：官方。

**优点**：语言无关、便于运维、可独立升级。
**缺点**：多一跳延迟、代理是单点（需高可用）。

#### 6.3 对比

| 维度 | 客户端(ShardingSphere-JDBC) | 代理(MyCat/Proxy) |
| --- | --- | --- |
| 性能 | 高（直连） | 中（多一跳） |
| 语言 | Java | 任意 |
| 运维 | 随应用 | 独立 |
| 单点 | 无 | 有（需HA） |
| 功能 | 丰富 | 丰富 |

> 推荐：Java 项目用 ShardingSphere-JDBC；多语言用 ShardingSphere-Proxy 或 Vitess。

### 七、分库分表实战架构

以订单系统为例：日订单量 1000 万，3 年累计 100 亿。

**架构**：按 userId 一致性哈希，4 库 × 4 表 = 16 分片起步，后续可扩到 64 分片。

\`\`\`
路由层（ShardingSphere）
  ├── order_db_0: orders_0, orders_1, orders_2, orders_3
  ├── order_db_1: orders_0, orders_1, orders_2, orders_3
  ├── order_db_2: orders_0, orders_1, orders_2, orders_3
  └── order_db_3: orders_0, orders_1, orders_2, orders_3

分片键: user_id
路由: shardIndex = consistentHash(user_id) % 16
      dbIndex = shardIndex / 4
      tableIndex = shardIndex % 4
\`\`\`

**全局 ID**：雪花算法，机器 ID = 分片编号。

**查询**：
- 带 userId 的查询：精准路由到单分片，高性能。
- 不带 userId 的查询（如商家查所有订单）：按商家 ID 二级分片 + ES 同步。

**扩容**：4 库→8 库，一致性哈希迁移量小，双写平滑过渡。

### 八、什么时候不该分库分表

分库分表是"核武器"，代价巨大，不应轻易使用。在分之前，先穷尽其他优化：

#### 8.1 先做这些优化

1. **优化 SQL 与索引**：很多"慢"是 SQL 写得烂、缺索引。先 EXPLAIN 分析。
2. **加缓存**：Redis 缓存热点，拦截 90% 读。
3. **读写分离**：读走从库，分担主库压力。
4. **归档冷数据**：历史数据归档到冷库/归档表，热表瘦身。
5. **垂直拆分**：先按业务拆库，降低单库压力。
6. **升级硬件**：SSD、加内存、升级 CPU，最简单有效。

#### 8.2 不该分的场景

- **数据量未到瓶颈**（单表 < 1000 万）：分了徒增复杂度。
- **查询不带分片键的多**：跨分片查询灾难。
- **团队无运维能力**：分库分表的运维复杂度高。
- **强事务需求**：分布式事务代价大。

> 经验：能在单库解决的问题，绝不分库分表。它是"最后手段"，不是"性能优化捷径"。

### 九、分片键选择策略深度分析

分片键（Sharding Key）的选择是分库分表最关键的决策——一旦确定，几乎无法更改。

#### 9.1 分片键选择原则

1. **高基数**：分片键值域要大，避免数据倾斜。user_id（百万级）好于 gender（2 种）
2. **查询覆盖率高**：大多数查询都带分片键，避免跨库查询
3. **写入均匀**：分片键的写入分布要均匀，避免热点
4. **不可变**：分片键值不应改变（更新分片键 = 数据迁移）
5. **单调递增可选**：某些场景需要时间有序（如日志按时间分片）

#### 9.2 常见分片键选择

| 业务场景 | 推荐分片键 | 原因 |
| --- | --- | --- |
| 电商订单 | user_id | 用户查询自己的订单，避免跨库 |
| 社交消息 | from_user_id / to_user_id | 按用户维度查询消息 |
| 日志系统 | create_time（按天/月分表） | 时间范围查询天然高效 |
| IoT 设备数据 | device_id | 按设备维度查询 |
| 支付流水 | merchant_id | 商户维度查询对账 |
| 多租户 SaaS | tenant_id | 租户隔离，天然分片 |

#### 9.3 分片键选择的陷阱

**陷阱一：选择低基数字段**

\`\`\`sql
-- 按 gender 分片（只有男/女两种值）
-- 最多分 2 个库，无法水平扩展
-- 且数据严重倾斜（用户男女比例不均）
\`\`\`

**陷阱二：选择可变字段**

\`\`\`sql
-- 按 user_level 分片（普通→VIP→SVIP）
-- 用户升级后 level 变化 → 需要迁移数据
-- 迁移期间数据不一致
\`\`\`

**陷阱三：多维度查询冲突**

\`\`\`sql
-- 按 user_id 分片
-- 查询1：SELECT * FROM orders WHERE user_id = 123  ✓ 单库
-- 查询2：SELECT * FROM orders WHERE merchant_id = 456  ✗ 跨全部分库
-- 查询3：SELECT * FROM orders WHERE create_time > '2024-01-01'  ✗ 跨全部分库
\`\`\`

**解决多维度查询的方案**：
1. **双写冗余表**：按 user_id 分片一份，按 merchant_id 分片一份（空间换时间）
2. **异构索引**：用 ES/搜索引擎建立 merchant_id → order_id 的索引，先查 ES 得到 order_id 列表，再按 order_id 精确查询
3. **CQRS**：写库按 user_id 分片，读库按不同维度建索引

### 十、一致性哈希详解

#### 10.1 为什么需要一致性哈希

普通哈希分片（hash(key) % N）在节点数变化时，几乎所有数据都要迁移：

\`\`\`
3 个节点 → hash(key) % 3
增加 1 个节点 → hash(key) % 4
几乎所有 key 的哈希结果都变了 → 几乎全量迁移
\`\`\`

一致性哈希解决这个问题：节点变化时只迁移受影响区间的数据。

#### 10.2 一致性哈希原理

\`\`\`
将整个哈希空间组织成虚拟圆环（0 ~ 2^32-1）

1. 计算节点哈希，放置到环上
   NodeA → hash("NodeA") = 1000
   NodeB → hash("NodeB") = 3000
   NodeC → hash("NodeC") = 6000

2. 计算 key 哈希，放置到环上
   key1 → hash("key1") = 1500
   key2 → hash("key2") = 4000
   key3 → hash("key3") = 800

3. key 顺时针找到的第一个节点就是所属节点
   key1(1500) → NodeB(3000)
   key2(4000) → NodeC(6000)
   key3(800) → NodeA(1000)
\`\`\`

**节点增减的影响**：
\`\`\`
增加 NodeD → hash("NodeD") = 2500
   key1(1500) → NodeD(2500)  ← 迁移到 D
   key2(4000) → NodeC(6000)  ← 不变
   key3(800) → NodeA(1000)   ← 不变
   只有 key1 迁移，其他不变！
\`\`\`

#### 10.3 虚拟节点

问题：节点少时，数据分布不均匀（某节点负责的弧段太长）。

解决：每个物理节点对应多个虚拟节点（如 150 个）：

\`\`\`
NodeA → hash("NodeA#1"), hash("NodeA#2"), ..., hash("NodeA#150")
NodeB → hash("NodeB#1"), hash("NodeB#2"), ..., hash("NodeB#150")

虚拟节点越多，数据分布越均匀
但太多会增加内存和查找开销（通常 150-200 个）
\`\`\`

#### 10.4 多语言实现

\`\`\`java
// Google Guava 一致性哈希
int bucket = Hashing.consistentHash(Hashing.sha256().hashString(key, UTF_8), buckets);
// 注意：Guava 的实现是简化的，生产环境建议用专门的库

// 完整实现
public class ConsistentHash {
    private final TreeMap<Long, String> ring = new TreeMap<>();
    private final int virtualNodes = 150;

    public void addNode(String node) {
        for (int i = 0; i < virtualNodes; i++) {
            long hash = hash(node + "#" + i);
            ring.put(hash, node);
        }
    }

    public void removeNode(String node) {
        for (int i = 0; i < virtualNodes; i++) {
            long hash = hash(node + "#" + i);
            ring.remove(hash);
        }
    }

    public String getNode(String key) {
        if (ring.isEmpty()) return null;
        long hash = hash(key);
        // 顺时针找第一个节点
        Map.Entry<Long, String> entry = ring.ceilingEntry(hash);
        if (entry == null) {
            entry = ring.firstEntry();  // 环绕到开头
        }
        return entry.getValue();
    }

    private long hash(String s) {
        return Hashing.sha256().hashString(s, UTF_8).asLong();
    }
}
\`\`\`

\`\`\`go
// Go 实现
type ConsistentHash struct {
    ring       map[uint32]string
    sortedKeys []uint32  // 排序的哈希值，二分查找
    virtualNum int
}

func (c *ConsistentHash) AddNode(node string) {
    for i := 0; i < c.virtualNum; i++ {
        hash := crc32.ChecksumIEEE([]byte(fmt.Sprintf("%s#%d", node, i)))
        c.ring[hash] = node
        c.sortedKeys = append(c.sortedKeys, hash)
    }
    sort.Slice(c.sortedKeys, func(i, j int) bool {
        return c.sortedKeys[i] < c.sortedKeys[j]
    })
}

func (c *ConsistentHash) GetNode(key string) string {
    if len(c.sortedKeys) == 0 {
        return ""
    }
    hash := crc32.ChecksumIEEE([]byte(key))
    // 二分查找第一个 >= hash 的节点
    idx := sort.Search(len(c.sortedKeys), func(i int) bool {
        return c.sortedKeys[i] >= hash
    })
    if idx == len(c.sortedKeys) {
        idx = 0  // 环绕
    }
    return c.ring[c.sortedKeys[idx]]
}
\`\`\`

### 十一、雪花算法 ID 生成器深度剖析

#### 11.1 雪花 ID 结构

\`\`\`
0 | 00000000000000000000000000000000000000000 | 0000000000 | 000000000000
─   ────────────41 bit──────────────────────   ──10 bit──   ────12 bit───
符号位      时间戳（毫秒级，69年）               机器ID        序列号
\`\`\`

- **41 bit 时间戳**：毫秒级，可用 2^41 / 1000 / 3600 / 24 / 365 ≈ 69 年
- **10 bit 机器 ID**：最多 1024 台机器（可拆分为 5 bit 数据中心 + 5 bit 机器）
- **12 bit 序列号**：每毫秒最多生成 4096 个 ID

**总长 64 bit**，正好一个 long，数据库索引友好。

#### 11.2 时钟回拨问题

服务器时钟可能回退（NTP 同步、人为调整），导致生成重复 ID。

**解决方案**：

\`\`\`java
public class Snowflake {
    // ... 其他字段

    public synchronized long nextId() {
        long currentTimestamp = timeGen();

        // 时钟回拨检测
        if (currentTimestamp < lastTimestamp) {
            long offset = lastTimestamp - currentTimestamp;
            if (offset <= 5) {
                // 回拨 5ms 以内，等待
                try {
                    Thread.sleep(offset + 1);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                currentTimestamp = timeGen();
                if (currentTimestamp < lastTimestamp) {
                    throw new RuntimeException("时钟回拨超过阈值");
                }
            } else {
                // 回拨超过 5ms，抛异常或借用未来时间
                throw new RuntimeException("时钟回拨 " + offset + "ms");
            }
        }

        if (currentTimestamp == lastTimestamp) {
            sequence = (sequence + 1) & SEQUENCE_MASK;
            if (sequence == 0) {
                // 序列号用尽，等待下一毫秒
                currentTimestamp = tilNextMillis(lastTimestamp);
            }
        } else {
            sequence = 0;
        }

        lastTimestamp = currentTimestamp;
        return ((currentTimestamp - epoch) << TIMESTAMP_LEFT_SHIFT)
             | (workerId << WORKER_ID_SHIFT)
             | sequence;
    }
}
\`\`\`

#### 11.3 机器 ID 分配

\`\`\`java
// 方案一：配置文件（适合机器数少）
snowflake.worker-id=1

// 方案二：ZooKeeper 自动分配
// 启动时在 ZK 创建临时节点，节点序号作为 workerId
public int getWorkerIdFromZK() {
    String path = zk.create("/snowflake/worker-",
        new byte[0], ZooDefs.Ids.OPENAclUnsafe,
        CreateMode.EPHEMERAL_SEQUENTIAL);
    return Integer.parseInt(path.substring(path.lastIndexOf('-') + 1));
}

// 方案三：数据库自增 ID
// INSERT INTO worker_id_table (host) VALUES (?); 返回自增 ID 作为 workerId

// 方案四：IP 后两段（适合最多 255×255 台机器）
int workerId = (ip[2] << 8) | ip[3];  // 最多 65535，需 16 bit
// 但雪花只有 10 bit，需要取模或分段
\`\`\`

#### 11.4 多语言实现

\`\`\`go
// Go 雪花算法
type Snowflake struct {
    mu        sync.Mutex
    epoch     int64
    lastTime  int64
    workerID  int64
    sequence  int64
}

func (s *Snowflake) NextID() int64 {
    s.mu.Lock()
    defer s.mu.Unlock()

    now := time.Now().UnixMilli()
    if now == s.lastTime {
        s.sequence = (s.sequence + 1) & 0xFFF  // 12 bit mask
        if s.sequence == 0 {
            for now <= s.lastTime {
                now = time.Now().UnixMilli()
            }
        }
    } else {
        s.sequence = 0
    }
    s.lastTime = now
    return ((now - s.epoch) << 22) | (s.workerID << 12) | s.sequence
}
\`\`\`

\`\`\`python
# Python 雪花算法
import time
import threading

class Snowflake:
    def __init__(self, worker_id, epoch=1609459200000):
        self.epoch = epoch
        self.worker_id = worker_id
        self.last_timestamp = 0
        self.sequence = 0
        self._lock = threading.Lock()

    def next_id(self):
        with self._lock:
            timestamp = int(time.time() * 1000)
            if timestamp == self.last_timestamp:
                self.sequence = (self.sequence + 1) & 0xFFF
                if self.sequence == 0:
                    while timestamp <= self.last_timestamp:
                        timestamp = int(time.time() * 1000)
            else:
                self.sequence = 0
            self.last_timestamp = timestamp
            return ((timestamp - self.epoch) << 22) | (self.worker_id << 12) | self.sequence
\`\`\`

### 十二、跨库查询解决方案

#### 12.1 跨库 JOIN 问题

\`\`\`sql
-- user 在 DB1，order 在 DB2，按 user_id 分片
-- 无法 JOIN：
SELECT u.name, o.amount
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.city = '北京'
-- ↑ 跨库 JOIN 不支持！
\`\`\`

#### 12.2 解决方案

**方案一：应用层 JOIN**

\`\`\`java
// 先查用户
List<User> beijingUsers = userRepository.findByCity("北京");
// 提取 user_id 列表
List<Long> userIds = beijingUsers.stream().map(User::getId).collect(Collectors.toList());
// 再查订单（按 user_id 分片，可以批量查）
List<Order> orders = orderRepository.findByUserIds(userIds);
// 应用层组装
Map<Long, User> userMap = beijingUsers.stream().collect(toMap(User::getId, u -> u));
List<UserOrderDTO> result = orders.stream()
    .map(o -> new UserOrderDTO(userMap.get(o.getUserId()).getName(), o.getAmount()))
    .collect(Collectors.toList());
\`\`\`

**方案二：冗余字段**

\`\`\`sql
-- orders 表中冗余 user_name 字段
SELECT user_name, amount FROM orders WHERE create_time > '2024-01-01'
-- 不需要 JOIN users 表
-- 缺点：user_name 变化时需要同步更新
\`\`\`

**方案三：Elasticsearch 异构索引**

\`\`\`
1. 分库分表写入 MySQL
2. Canal 监听 binlog，同步到 ES
3. ES 中建宽表（user + order 拼接）
4. 复杂查询走 ES，简单查询走 MySQL
\`\`\`

**方案四：数据绑定（父子表同库）**

\`\`\`sql
-- user 和 order 都按 user_id 分片，保证同一用户的 user 和 order 在同一库
-- 这样可以 JOIN
SELECT u.name, o.amount
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.id = 123  -- 必须带分片键
-- ↑ 同库 JOIN，OK
\`\`\`

#### 12.3 跨库分页问题

\`\`\`sql
-- 分页查询 ORDER BY create_time LIMIT 10, 5（第3页）
-- 4 个分片，每个分片取前 15 条

分片1: SELECT * FROM orders WHERE user_id % 4 = 0 ORDER BY create_time LIMIT 0, 15
分片2: SELECT * FROM orders WHERE user_id % 4 = 1 ORDER BY create_time LIMIT 0, 15
分片3: SELECT * FROM orders WHERE user_id % 4 = 2 ORDER BY create_time LIMIT 0, 15
分片4: SELECT * FROM orders WHERE user_id % 4 = 3 ORDER BY create_time LIMIT 0, 15

-- 合并 60 条，再全局排序取第 10-14 条（5 条）
\`\`\`

**深分页问题**：
\`\`\`sql
-- LIMIT 100000, 10（第 10001 页）
-- 每个分片取前 100010 条 → 4 个分片共 400040 条
-- 内存中排序取 10 条 → 内存爆炸
\`\`\`

**解决方案**：
1. **禁止深分页**：只允许前 100 页，超过用滚动加载
2. **游标分页**：\`WHERE create_time > last_cursor ORDER BY create_time LIMIT 10\`
3. **二次查询法**：先查各分页取最大值，再用最大值作为条件精确查
4. **ES 辅助**：深分页走 ES

### 十三、分布式事务详解

#### 13.1 分布式事务的挑战

\`\`\`
用户下单 = 扣库存（DB1）+ 创建订单（DB2）+ 扣余额（DB3）

如果扣库存成功，创建订单成功，扣余额失败 → 数据不一致
\`\`\`

#### 13.2 2PC（两阶段提交）

\`\`\`
阶段一（Prepare）：
  协调者 → 所有参与者："准备提交"
  参与者 → 执行事务，但不提交，锁定资源
  参与者 → 协调者："准备好了" / "失败"

阶段二（Commit/Rollback）：
  如果全部"准备好了" → 协调者发送"提交"
  如果任一"失败" → 协调者发送"回滚"
\`\`\`

**问题**：
- 同步阻塞：参与者锁定资源直到阶段二
- 协调者单点：协调者宕机，参与者一直阻塞
- 数据不一致：阶段二部分参与者收到提交，部分没收到

**XA 协议**就是 2PC 的实现，MySQL 支持 XA：

\`\`\`sql
-- XA 事务
XA START 'xid1';
UPDATE inventory SET stock = stock - 1 WHERE product_id = 1;
XA END 'xid1';
XA PREPARE 'xid1';  -- 阶段一

-- 协调者收集所有参与者 PREPARE 成功后
XA COMMIT 'xid1';   -- 阶段二：提交
-- 或 XA ROLLBACK 'xid1'; -- 阶段二：回滚
\`\`\`

#### 13.3 TCC（Try-Confirm-Cancel）

\`\`\`
Try：预留资源
  扣库存：冻结 1 件（stock - 1, frozen + 1）
  创建订单：创建待确认订单
  扣余额：冻结 100 元

Confirm：确认操作
  扣库存：冻结转实际扣减（frozen - 1）
  创建订单：订单状态改为已确认
  扣余额：冻结转实际扣减

Cancel：取消操作
  扣库存：冻结回滚（frozen - 1, stock + 1）
  创建订单：订单状态改为已取消
  扣余额：冻结回滚
\`\`\`

**优势**：无全局锁，性能高
**劣势**：业务侵入大（每个操作要实现 Try/Confirm/Cancel 三个方法）

\`\`\`java
// TCC 实现
@LocalTCC
public interface OrderTccAction {
    @TwoPhaseBusinessAction(name = "createOrder",
        commitMethod = "confirm", rollbackMethod = "cancel")
    boolean tryCreate(BusinessActionContext ctx, Order order);

    boolean confirm(BusinessActionContext ctx);

    boolean cancel(BusinessActionContext ctx);
}

// Try
public boolean tryCreate(BusinessActionContext ctx, Order order) {
    // 检查是否已执行（幂等）
    if (tccLogRepository.exists(ctx.getXid(), "try")) return true;
    // 创建待确认订单
    order.setStatus("PENDING");
    orderRepository.save(order);
    // 记录日志
    tccLogRepository.save(ctx.getXid(), "try");
    return true;
}

// Confirm
public boolean confirm(BusinessActionContext ctx) {
    if (tccLogRepository.exists(ctx.getXid(), "confirm")) return true;
    Order order = orderRepository.findByXid(ctx.getXid());
    order.setStatus("CONFIRMED");
    orderRepository.save(order);
    tccLogRepository.save(ctx.getXid(), "confirm");
    return true;
}

// Cancel
public boolean cancel(BusinessActionContext ctx) {
    if (tccLogRepository.exists(ctx.getXid(), "cancel")) return true;
    Order order = orderRepository.findByXid(ctx.getXid());
    order.setStatus("CANCELLED");
    orderRepository.save(order);
    tccLogRepository.save(ctx.getXid(), "cancel");
    return true;
}
\`\`\`

#### 13.4 Saga 模式

\`\`\`
Saga = 长事务拆分为一系列短事务

T1（扣库存）→ T2（创建订单）→ T3（扣余额）
如果 T3 失败：
  C3（回滚余额）→ C2（回滚订单）→ C1（回滚库存）

每个 Ti 有对应的补偿 Ci
\`\`\`

**优势**：无锁，适合长事务
**劣势**：可能看到中间状态（T1 成功但 T2 未执行时，库存已扣但订单未创建）

\`\`\`java
// Saga 实现
public class OrderSaga {
    public void execute(OrderRequest req) {
        try {
            // 正向执行
            inventoryService.deduct(req.getProductId(), req.getQuantity());
            orderService.create(req);
            accountService.deduct(req.getUserId(), req.getAmount());
        } catch (Exception e) {
            // 反向补偿
            compensate(req);
        }
    }

    private void compensate(OrderRequest req) {
        // 逐个补偿（逆序）
        if (accountDeducted) accountService.refund(req.getUserId(), req.getAmount());
        if (orderCreated) orderService.cancel(req.getOrderId());
        if (inventoryDeducted) inventoryService.restore(req.getProductId(), req.getQuantity());
    }
}
\`\`\`

#### 13.5 本地消息表（最终一致）

\`\`\`
1. 业务操作 + 写消息表（同一本地事务）
   BEGIN;
   UPDATE account SET balance = balance - 100 WHERE user_id = 1;
   INSERT INTO message_table (id, content, status) VALUES (uuid(), '...', 'PENDING');
   COMMIT;

2. 定时扫描消息表，发送 MQ
3. 消费者收到 MQ，执行业务，发送 ACK
4. 收到 ACK 后更新消息状态为 DONE

-- 优势：无分布式锁，性能高
-- 劣势：最终一致，有延迟
\`\`\`

#### 13.6 分布式事务对比

| 方案 | 一致性 | 性能 | 复杂度 | 适用场景 |
| --- | --- | --- | --- | --- |
| 2PC/XA | 强一致 | 低（阻塞） | 中 | 传统金融 |
| TCC | 强一致 | 高 | 高（3 方法） | 电商交易 |
| Saga | 最终一致 | 高 | 中 | 长流程业务 |
| 本地消息表 | 最终一致 | 高 | 低 | 异步通知 |
| MQ 事务消息 | 最终一致 | 高 | 中 | 异步解耦 |

### 十四、扩容迁移方案

#### 14.1 停机迁移

\`\`\`
1. 停服（公告维护）
2. 数据迁移脚本：旧库 → 新分片规则 → 新库
3. 数据校验（条数对比、抽样对比）
4. 切换应用配置
5. 恢复服务
\`\`\`

缺点：停服时间长，不适合 24/7 服务。

#### 14.2 双写迁移（推荐）

\`\`\`
阶段一：双写 + 读旧
  写：同时写旧库和新库（以旧库为准）
  读：只读旧库
  数据同步：后台脚本补齐历史数据

阶段二：双写 + 读新（灰度）
  写：双写
  读：先读新库，新库没有再读旧库（fallback）
  灰度：1% → 10% → 50% → 100%

阶段三：停旧写
  写：只写新库
  读：只读新库
  观察 1-2 周后下线旧库
\`\`\`

#### 14.3 不停机扩容（成倍扩容）

\`\`\`
原方案：4 个分片，hash(key) % 4
扩容到 8 个分片：hash(key) % 8

观察：hash(key) % 8 的结果 = hash(key) % 4 的结果 或 hash(key) % 4 + 4
→ 每个旧分片的数据只需分裂成两半，一半留在原节点，一半迁移到新节点

步骤：
1. 新增 4 个分片（node4-node7）
2. 每个旧分片的数据按 hash(key) % 8 重新计算
3. 属于新分片的数据迁移到对应新节点
4. 切换路由规则为 hash(key) % 8

迁移量 = 50%（比全量迁移少一半）
\`\`\`

### 十五、分库分表中间件

#### 15.1 ShardingSphere

Apache ShardingSphere 是最流行的 Java 分库分表中间件：

\`\`\`java
// ShardingSphere-JDBC 配置
@Bean
public DataSource dataSource() throws SQLException {
    Map<String, DataSource> dataSourceMap = new HashMap<>();
    dataSourceMap.put("ds0", createDataSource("ds0"));
    dataSourceMap.put("ds1", createDataSource("ds1"));

    // 分库规则
    ShardingRuleConfiguration config = new ShardingRuleConfiguration();
    config.getDataSourceNames().addAll(dataSourceMap.keySet());

    // 订单表分库分表
    TableRuleConfiguration orderRule = new TableRuleConfiguration(
        "orders", "ds\${0..1}.orders_\${0..3}");
    // 分库策略：按 user_id 取模
    orderRule.setDatabaseShardingStrategyConfig(
        new InlineShardingStrategyConfiguration("user_id", "ds\${user_id % 2}"));
    // 分表策略：按 user_id 取模
    orderRule.setTableShardingStrategyConfig(
        new InlineShardingStrategyConfiguration("user_id", "orders_\${user_id % 4}"));
    config.getTableRuleConfigs().add(orderRule);

    return ShardingDataSourceFactory.createDataSource(dataSourceMap, config, new Properties());
}
\`\`\`

#### 15.2 Vitess

Vitess 是 YouTube 开源的 MySQL 集群方案（CNCF 项目）：

\`\`\`yaml
# Vitess 用 VTGate 作为代理
# 应用连接 VTGate，VTGate 负责路由到正确的分片
# 支持 MySQL 协议，应用无感知

# VSchema 定义分片规则
{
  "sharded": true,
  "vindexes": {
    "hash_vindex": {
      "type": "hash"
    }
  },
  "tables": {
    "orders": {
      "column_vindexes": [
        {
          "column": "user_id",
          "name": "hash_vindex"
        }
      ]
    }
  }
}
\`\`\`

#### 15.3 中间件对比

| 特性 | ShardingSphere-JDBC | ShardingSphere-Proxy | Vitess | MyCat |
| --- | --- | --- | --- | --- |
| 部署方式 | 应用内（JDBC 增强） | 独立代理 | 独立代理 | 独立代理 |
| 语言 | Java | 多语言 | 多语言 | 多语言 |
| 性能 | 高（无网络跳转） | 中 | 高 | 中 |
| 运维 | 简单 | 中 | 复杂 | 中 |
| 功能 | 丰富 | 丰富 | 丰富 | 一般 |
| 社区 | 活跃（Apache） | 活跃 | 活跃（CNCF） | 衰退 |

### 十六、分库分表监控与运维

#### 16.1 监控指标

\`\`\`
1. 数据分布均衡度
   - 每个分片的数据量、QPS
   - 标准差 / 平均值 < 10% 为健康

2. 慢查询
   - 跨库查询数（理想为 0）
   - 单库慢查询数

3. 分布式事务
   - 事务成功率
   - 事务平均耗时
   - 补偿次数（Saga/TCC）

4. 连接池
   - 每个分片的连接池使用率
   - 等待连接的线程数

5. 数据一致性
   - 双写一致性校验（每日定时比对）
   - 消息表积压数
\`\`\`

#### 16.2 数据校验

\`\`\`java
// 定时校验双写数据一致性
@Scheduled(cron = "0 0 3 * * ?")  // 每天凌晨 3 点
public void verifyDataConsistency() {
    long oldCount = oldJdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM orders", Long.class);
    long newCount = 0;
    for (int i = 0; i < 4; i++) {
        newCount += newJdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM orders_" + i, Long.class);
    }
    if (oldCount != newCount) {
        alertService.send("数据不一致！旧库: " + oldCount + " 新库: " + newCount);
    }
}
\`\`\`

### 十七、全局唯一 ID 方案对比

除了雪花算法，还有其他 ID 生成方案：

#### 17.1 方案对比

| 方案 | 趋势 | 性能 | 依赖 | 适用 |
| --- | --- | --- | --- | --- |
| UUID | 无序 | 高（本地生成） | 无 | 文件名、token |
| 雪花算法 | 趋势递增 | 高（本地生成） | NTP | 通用 |
| 数据库自增 | 严格递增 | 低（DB 瓶颈） | DB | 单库 |
| 号段模式 | 趋势递增 | 高（批量取） | DB | 高并发 |
| Redis INCR | 严格递增 | 中（网络） | Redis | 序号 |
| Leaf（美团） | 趋势递增 | 高 | DB+ZK | 大规模 |

#### 17.2 号段模式

\`\`\`java
// 号段模式：每次从 DB 批量取一批 ID，用完再取
public class SegmentIdGenerator {
    private AtomicLong currentId;
    private long maxId;

    public synchronized long nextId() {
        if (currentId == null || currentId.get() >= maxId) {
            loadNextSegment();  // 从 DB 加载下一批
        }
        return currentId.getAndIncrement();
    }

    private void loadNextSegment() {
        // DB: UPDATE id_table SET max_id = max_id + step WHERE biz_type = 'order'
        // 返回新的 max_id
        long step = 1000;
        long newMaxId = db.updateAndGetMaxId("order", step);
        currentId = new AtomicLong(newMaxId - step);
        maxId = newMaxId;
    }
}
// 优势：每次 DB 操作获得 1000 个 ID，DB 压力降低 1000 倍
// 劣势：宕机会丢失部分未用 ID（可接受）
\`\`\`

#### 17.3 美团 Leaf

Leaf 同时支持号段模式和雪花模式，是生产级 ID 生成服务：

\`\`\`
Leaf-Segment：号段模式，DB 高可用，适合趋势递增
Leaf-Snowflake：雪花模式，ZK 分配 workerId，解决时钟回拨

架构：
  Leaf Server（双机房部署）
    → Leaf-Segment（DB 主从）
    → Leaf-Snowflake（ZK 集群）
  应用通过 HTTP/RPC 调用 Leaf 获取 ID
\`\`\`

### 十八、数据倾斜诊断与修复

#### 18.1 数据倾斜的表现

\`\`\`
分片1: 500 万条数据（80%）
分片2: 80 万条数据（13%）
分片3: 40 万条数据（7%）

危害：
  - 分片1 过载（CPU/IO/内存告警）
  - 分片2/3 闲置
  - 扩容收益低（加节点也不均衡）
\`\`\`

#### 18.2 倾斜原因与修复

**原因一：分片键选择不当**

\`\`\`sql
-- 按 user_id 分片，但某用户产生 90% 的订单
-- 如大客户/机器人
-- 修复：改用 order_id 分片，或用 user_id + order_id 复合分片
\`\`\`

**原因二：哈希函数不均匀**

\`\`\`java
// 用 user_id % 4 分片，如果 user_id 都是 4 的倍数 → 全部到分片0
// 修复：用一致性哈希或 MurmurHash
int shard = Math.abs(MurmurHash.hash32(user_id)) % 4;
\`\`\`

**原因三：热点数据**

\`\`\`java
// 某个商品 ID 对应的数据被频繁访问
// 修复：热点数据打散
String key = "product:" + productId + ":" + (productId % 10);
// 一个商品拆成 10 份，分散到不同分片
\`\`\`

### 十九、分库分表与微服务架构

#### 19.1 微服务与分库的关系

\`\`\`
微服务天然分库：每个服务独立数据库
  订单服务 → order_db
  用户服务 → user_db
  商品服务 → product_db

这其实就是"垂直分库"，微服务化本身就是垂直拆分。

进一步：每个服务的数据库可以水平分片
  订单服务 → order_db 分 4 片（order_db_0 ~ order_db_3）
\`\`\`

#### 19.2 微服务跨服务查询

\`\`\`java
// 错误：跨服务 JOIN
SELECT o.*, u.name FROM orders o JOIN users u ON o.user_id = u.id
// 微服务中 users 表在用户服务，不能直接 JOIN

// 正确：服务间调用 + 应用层组装
Order order = orderService.getOrder(orderId);
User user = userService.getUser(order.getUserId());
OrderDTO dto = new OrderDTO(order, user.getName());
\`\`\`

#### 19.3 CQRS（命令查询职责分离）

\`\`\`
写操作 → 分库分表的 MySQL（水平扩展）
读操作 → Elasticsearch（宽表索引）

Canal 监听 MySQL binlog → 同步到 ES
查询走 ES，支持复杂搜索和聚合
写入走 MySQL，保证事务一致性
\`\`\`

### 二十一、分库分表数据迁移工具详解

#### 21.1 迁移工具对比

| 工具 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| DataX | 离线全量同步 | 支持多种数据源 | 不支持增量 |
| Canal+自定义 | binlog 增量同步 | 实时性好 | 需自行开发同步逻辑 |
| CloudCanal | 全量+增量 | 可视化运维 | 商业产品 |
| Debezium | CDC 增量 | Kafka 生态集成好 | 部署复杂 |
| gh-ost | MySQL 在线 DDL | 无触发器 | 仅限 MySQL 表结构变更 |

#### 21.2 全量+增量迁移流程

\`\`\`
阶段1: 全量迁移
  - 导出旧库数据 → 按分片键路由 → 写入新分片库
  - 记录迁移开始时的 binlog 位点

阶段2: 增量追平
  - 从阶段1记录的 binlog 位点开始同步
  - 实时消费 binlog，重放到新库

阶段3: 数据校验
  - 对比新旧库行数、抽样数据 checksum
  - 使用 pt-table-checksum / 自研校验工具

阶段4: 灰度切流
  - 双写：先写旧库，异步写新库
  - 读切流：10% → 50% → 100% 读新库
  - 写切流：100% 读新库后，切换写到新库

阶段5: 观察+下线旧库
  - 观察 1~2 周，确认无异常
  - 下线旧库，清理迁移工具
\`\`\`

> 迁移最大的风险不在迁移本身，而在切流瞬间。务必保留回滚能力。

#### 21.3 数据校验策略

\`\`\`
1. 行数校验：SELECT COUNT(*) 对比（注意误差，大表用估算）
2. 抽样校验：随机取 N 条，逐字段比对
3. Checksum 校验：对表做 CRC32/MD5，整体比对
4. 业务校验：关键业务指标对比（如订单总额、用户数）
\`\`\`

### 二十二、分库分表容量规划

#### 22.1 容量评估方法

\`\`\`
步骤1: 估算数据总量
  当前数据量 × (1 + 年增长率)^N

步骤2: 确定单库单表上限
  单表建议 < 1000 万行（B+树 3 层）
  单库建议 < 100GB（备份恢复时间可控）

步骤3: 计算分片数
  分库数 = 总数据量 / 单库上限
  分表数 = 单库数据量 / 单表上限

步骤4: 预留扩容空间
  实际分片数 = 计算值 × 2（留一倍余量）
\`\`\`

#### 22.2 容量规划示例

\`\`\`
场景：订单系统，当前 5 亿行，年增长 50%，规划 3 年

3 年后数据量 = 5亿 × 1.5^3 ≈ 16.9 亿行

单表 1000 万 → 需要 169 张表 → 取 256 张（2^8）
单库 100GB → 假设每行 200B → 单库 5亿行 = 100GB
  → 需要 4 库 → 取 8 库（2^3）

最终方案：8 库 × 32 表/库 = 256 表
分片键 = user_id % 256
\`\`\`

> 容量规划宁可浪费不可不足。分库分表扩容代价极高，初期多分几片比后期扩容划算。

### 二十三、分库分表与 NewSQL

#### 23.1 NewSQL 的优势

NewSQL（TiDB、CockroachDB、OceanBase）兼顾 SQL 兼容性和水平扩展：

1. **透明分片**：无需应用层关心分片键，SQL 自动路由。
2. **分布式事务**：ACID 事务跨节点，无需应用层补偿。
3. **在线扩缩容**：加减节点自动均衡数据，无需停机。
4. **强一致**：Raft/Paxos 协议保证数据一致性。

#### 23.2 何时选 NewSQL vs 分库分表

\`\`\`
选 NewSQL：
  - 团队对分布式数据库有运维能力
  - 需要强一致分布式事务
  - 数据增长不可预测，需频繁扩容
  - 业务复杂，跨表 JOIN 多

选分库分表（MySQL+中间件）：
  - 团队熟悉 MySQL 生态
  - 事务要求可降级（最终一致）
  - 读多写少，可配合读写分离
  - 成本敏感（NewSQL 节点多，硬件成本高）
\`\`\`

#### 23.3 混合架构

\`\`\`
核心交易库 → MySQL + 分库分表（强事务、低延迟）
分析查询库 → TiDB（复杂查询、水平扩展）
日志流水库 → MongoDB/Elasticsearch（灵活 schema）
\`\`\`

### 二十四、分库分表的回归测试与数据校验

#### 24.1 回归测试策略

1. **SQL 兼容性测试**：确认所有 SQL 在分片后能正确执行。
2. **数据分布测试**：验证数据均匀分布在各分片。
3. **跨库查询测试**：验证跨库 JOIN/分页结果正确。
4. **事务测试**：验证分布式事务的边界场景。
5. **性能回归测试**：对比分片前后关键接口 RT 和 QPS。

#### 24.2 自动化数据校验

\`\`\`java
// Java 数据校验工具示例
public class ShardDataValidator {
    // 对比新旧库行数
    public boolean validateCount(String table) {
        long oldCount = oldJdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM " + table, Long.class);
        long newCount = 0;
        for (DataSource ds : newShardDataSources) {
            newCount += newJdbcTemplate(ds).queryForObject(
                "SELECT COUNT(*) FROM " + table, Long.class);
        }
        return oldCount == newCount;
    }

    // 抽样校验
    public boolean validateSample(String table, int sampleSize) {
        List<Map<String,Object>> oldData = oldJdbcTemplate.queryForList(
            "SELECT * FROM " + table + " ORDER BY RAND() LIMIT " + sampleSize);
        for (Map<String,Object> row : oldData) {
            Object shardKey = row.get("user_id");
            DataSource ds = routeShard(shardKey);
            Map<String,Object> newRow = newJdbcTemplate(ds).queryForMap(
                "SELECT * FROM " + table + " WHERE id = ?", row.get("id"));
            if (!row.equals(newRow)) return false;
        }
        return true;
    }
}
\`\`\`

> 上线前务必完成全量数据校验和至少 3 轮回归测试。分库分表的 bug 往往在生产才暴露，代价极高。

### 二十五、小结

分库分表是数据库扩展的"重型武器"——威力巨大，但代价高昂。它解决了单机容量与并发瓶颈，却引入跨库 JOIN、分布式事务、全局 ID、深分页、扩容迁移等连锁难题。决策时要慎之又慎：先穷尽 SQL 优化、缓存、读写分离、冷热分离，确需时再上分库分表，并选好分片键、分片策略与中间件。下一章我们讨论读写分离——比重型分库分表更轻量、更常用的扩展手段。`,
    code: `// ============================================================
// 分库分表 —— 一致性哈希分片 + 雪花ID + 跨库查询合并 + 扩容对比
// ============================================================

// ---------- 雪花算法 ID 生成器 ----------
class Snowflake {
  constructor(machineId) {
    this.epoch = 1609459200000;  // 起始时间(2021-01-01)
    this.machineId = machineId & 0x3FF;            // 10bit 机器ID
    this.sequence = 0;
    this.lastTs = -1;
  }
  next() {
    let ts = Date.now();
    if (ts === this.lastTs) {
      this.sequence = (this.sequence + 1) & 0xFFF;  // 12bit 序列号
      if (this.sequence === 0) { while (ts <= this.lastTs) ts = Date.now(); }
    } else { this.sequence = 0; }
    this.lastTs = ts;
    return (BigInt(ts - this.epoch) << 22n) |
           (BigInt(this.machineId) << 12n) |
           BigInt(this.sequence);
  }
}

// ---------- 一致性哈希环 ----------
class ConsistentHash {
  constructor(virtualNodes = 150) {
    this.ring = new Map();       // hash -> shardName
    this.sortedKeys = [];        // 排序的 hash 值
    this.virtualNodes = virtualNodes;
  }
  _hash(s) {
    let h = 0n;
    for (let i = 0; i < s.length; i++) h = (h * 131n + BigInt(s.charCodeAt(i))) & 0xFFFFFFFFFFFFFFFFn;
    return Number(h % 1000000007n);
  }
  addShard(shardName) {
    for (let i = 0; i < this.virtualNodes; i++) {
      const h = this._hash(shardName + '-vn-' + i);
      this.ring.set(h, shardName);
    }
    this.sortedKeys = [...this.ring.keys()].sort((a, b) => a - b);
  }
  removeShard(shardName) {
    for (let i = 0; i < this.virtualNodes; i++) {
      const h = this._hash(shardName + '-vn-' + i);
      this.ring.delete(h);
    }
    this.sortedKeys = [...this.ring.keys()].sort((a, b) => a - b);
  }
  locate(key) {
    if (!this.sortedKeys.length) return null;
    const h = this._hash(String(key));
    // 二分找第一个 >= h 的
    let lo = 0, hi = this.sortedKeys.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (this.sortedKeys[mid] >= h) hi = mid; else lo = mid + 1; }
    const idx = lo === this.sortedKeys.length ? 0 : lo;
    return this.ring.get(this.sortedKeys[idx]);
  }
}

// ---------- 简单取模分片（用于对比扩容）----------
function modShard(key, n) { return key % n; }

// ---------- 分片管理器 ----------
class ShardingManager {
  constructor(shardNames) {
    this.shards = new Map();     // shardName -> 数据数组
    this.hash = new ConsistentHash(50);
    for (const s of shardNames) { this.shards.set(s, []); this.hash.addShard(s); }
    this.snowflake = new Snowflake(1);
  }
  insert(record) {
    record.id = this.snowflake.next().toString();      // 全局 ID
    const shard = this.hash.locate(record.userId);     // 一致性哈希路由
    this.shards.get(shard).push(record);
    return { id: record.id, shard };
  }
  // 跨分片查询 + 合并排序 + 分页
  queryAll(page, pageSize, sortBy = 'ts') {
    const all = [];
    for (const [, arr] of this.shards) all.push(...arr);
    all.sort((a, b) => b[sortBy] - a[sortBy]);  // 降序
    const start = (page - 1) * pageSize;
    return { total: all.length, data: all.slice(start, start + pageSize) };
  }
  // 按 userId 精准查（单分片）
  queryByUser(userId) {
    const shard = this.hash.locate(userId);
    return this.shards.get(shard).filter(r => r.userId === userId);
  }
  stats() {
    const s = {};
    for (const [name, arr] of this.shards) s[name] = arr.length;
    return s;
  }
}

// ===== 演示 =====
console.log('===== 1. 雪花算法全局 ID =====');
const sf = new Snowflake(1);
const ids = [];
for (let i = 0; i < 5; i++) ids.push(sf.next().toString());
console.log('生成 5 个 ID:', ids);
console.log('ID 趋势递增:', ids.every((v, i) => i === 0 || BigInt(v) > BigInt(ids[i - 1])));

console.log('\\n===== 2. 一致性哈希分库分表（4 库 × 4 表 = 4 分片演示）=====');
const sm = new ShardingManager(['db0-t0', 'db1-t1', 'db2-t2', 'db3-t3']);
for (let i = 1; i <= 1000; i++) {
  sm.insert({ userId: i, amount: i * 10, ts: Date.now() + i });
}
console.log('1000 条数据分片分布:', JSON.stringify(sm.stats()));

console.log('\\n===== 3. 按 userId 精准路由（单分片查询）=====');
const myOrders = sm.queryByUser(42);
console.log('userId=42 的订单数:', myOrders.length, '所在分片:', sm.hash.locate(42));

console.log('\\n===== 4. 跨库查询合并 + 分页 =====');
const page1 = sm.queryAll(1, 5);
const page2 = sm.queryAll(2, 5);
console.log('第1页 5条, total=' + page1.total + ', 首条ts=' + page1.data[0].ts);
console.log('第2页 5条, 首条ts=' + page2.data[0].ts);
console.log('分页正确(第2页ts更小):', page2.data[0].ts < page1.data[0].ts);

console.log('\\n===== 5. 扩容迁移对比：一致性哈希 vs 取模 =====');
// 模拟 1000 个 key
const keys = Array.from({ length: 1000 }, (_, i) => i + 1);
// 取模 4→8 的迁移量
let modMigrate = 0;
for (const k of keys) if (modShard(k, 4) !== modShard(k, 8)) modMigrate++;
// 一致性哈希 4→8 的迁移量
const ch4 = new ConsistentHash(50);
['s0', 's1', 's2', 's3'].forEach(s => ch4.addShard(s));
const ch8 = new ConsistentHash(50);
['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's7'].forEach(s => ch8.addShard(s));
let chMigrate = 0;
for (const k of keys) if (ch4.locate(k) !== ch8.locate(k)) chMigrate++;
console.log('取模分片 4→8 迁移量: ' + modMigrate + '/1000 (' + (modMigrate/10) + '%)');
console.log('一致性哈希 4→8 迁移量: ' + chMigrate + '/1000 (' + (chMigrate/10) + '%)');
console.log('一致性哈希迁移量远小于取模:', chMigrate < modMigrate);

console.log('\\n===== 6. 扩容后数据分布仍均匀 =====');
const sm2 = new ShardingManager(['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's7']);
for (let i = 1; i <= 1000; i++) sm2.insert({ userId: i, ts: Date.now() });
console.log('8 分片分布:', JSON.stringify(sm2.stats()));

console.log('\\n===== 演示结束 =====');
`,
  },

  // =========================================================
  // 第四章：读写分离
  // =========================================================
  {
    id: "backend-readwrite-split",
    group: "数据存储",
    icon: "📖",
    title: "读写分离",
    content: `## 读写分离

**读写分离（Read-Write Splitting）** 是数据库扩展的轻量级手段：主库负责写，从库负责读，通过主从复制同步数据。它适用于"读多写少"的场景，能在不改业务模型（不分库分表）的前提下，把读压力分散到多个从库，显著提升系统吞吐。

相比分库分表，读写分离成本低、对业务侵入小，是数据库扩展的"第一步"。但它也带来主从延迟、路由策略、故障转移等新问题。本章系统讲解读写分离的架构、复制原理、路由策略、延迟解决、实现方式与高可用。

### 一、读写分离的动机

#### 1.1 读多写少的典型场景

绝大多数互联网业务是"读多写少"：

| 业务 | 读写比 | 说明 |
| --- | --- | --- |
| 电商商品 | 100:1 | 浏览多，上架少 |
| 社交动态 | 50:1 | 刷多，发少 |
| 内容资讯 | 200:1 | 看多，写少 |
| 用户登录 | 20:1 | 查多，注册少 |

写操作占比通常 < 10%，却与读共享同一个数据库实例。结果是：
- 读请求挤占写资源，写延迟升高。
- 写锁（行锁、表锁）影响读性能。
- 单库连接数被读占满，写请求排队。

#### 1.2 读写分离的收益

\`\`\`
           写请求
             │
             ▼
        ┌────────┐
        │ Master │  ◀── 主库负责写
        └────┬───┘
   ┌─────────┼─────────┐
   ▼         ▼         ▼
┌──────┐ ┌──────┐ ┌──────┐
│Slave1│ │Slave2│ │Slave3│  ◀── 从库分担读
└──────┘ └──────┘ └──────┘
   ▲         ▲         ▲
   └─────────┴─────────┴── 读请求
\`\`\`

| 收益 | 说明 |
| --- | --- |
| 分担读压力 | 多从库水平扩展读 QPS |
| 保护写性能 | 读不占主库资源，写更稳定 |
| 故障冗余 | 从库可作主库备份 |
| 读就近 | 跨地域从库降低读延迟 |

### 二、读写分离架构

#### 2.1 一主多从

最常见架构：1 个主库 + N 个从库。

\`\`\`
Master ──复制──▶ Slave1
         ├──复制──▶ Slave2
         └──复制──▶ Slave3
\`\`\`

- 写：只写 Master。
- 读：从 Slave 轮询/权重选择。
- 故障：Master 宕，提升一个 Slave 为新 Master。

#### 2.2 多主多从

更高可用：多个 Master 互为主从（双主/多主），各带从库。

\`\`\`
MasterA ◀──▶ MasterB
   │           │
SlaveA1      SlaveB1
\`\`\`

- 双主都可写（需解决自增 ID 冲突、数据一致）。
- 任一 Master 宕，另一 Master 继续。
- 复杂度高，一般用于核心业务。

#### 2.3 级联复制

为减轻 Master 复制压力，从库再作为其他从库的主库。

\`\`\`
Master ──▶ Slave1 ──▶ Slave2
                 └──▶ Slave3
\`\`\`

- Master 只复制给 Slave1，Slave1 再复制给 Slave2/3。
- 减轻 Master 复制负担。
- 缺点：延迟累积。

### 三、MySQL 主从复制原理

读写分离依赖主从复制，理解复制原理是排障基础。

#### 3.1 复制三步骤

\`\`\`
Master                        Slave
  │                              │
  │ 1.binlog 记录写操作           │
  │ ◀────── 2.IO 线程请求 ───────│
  │                              │
  │ ──推送 binlog 事件──▶         │
  │                    3.写 relay log
  │                              │
  │                    4.SQL 线程重放 relay log
  │                              │
\`\`\`

1. **Master 写 binlog**：Master 执行写操作，记录到二进制日志（binlog）。
2. **Slave IO 线程拉取**：Slave 的 IO 线程连接 Master，请求增量 binlog，Master 的 dump 线程推送。
3. **Slave 写 relay log**：Slave IO 线程把收到的 binlog 事件写入中继日志（relay log）。
4. **Slave SQL 线程重放**：Slave SQL 线程读取 relay log，重放 SQL，使数据与 Master 一致。

#### 3.2 复制的三种方式

| 方式 | 原理 | 一致性 | 性能 | 适用 |
| --- | --- | --- | --- | --- |
| 异步复制 | Master 写完即返回，不等 Slave | 弱（可能丢） | 高 | 默认，通用 |
| 半同步复制 | Master 等至少 1 个 Slave ACK | 较强 | 中 | 一致性要求高 |
| 全同步复制 | Master 等所有 Slave ACK | 强 | 低 | 极少用 |

**异步复制**（默认）：Master 不等 Slave，性能高，但 Master 宕机时未同步的数据会丢。
**半同步复制**（semi-sync）：Master 写完等至少一个 Slave 确认收到 binlog 才返回，平衡一致与性能。若 Slave 超时未 ACK，降级为异步。
**组复制 MGR**（MySQL Group Replication）：基于 Paxos，多主一致，强一致，但性能较低。

#### 3.3 复制相关文件与线程

- **binlog**（Master）：记录所有写操作，复制的数据源。
- **relay log**（Slave）：中转日志，存从 Master 收到的 binlog 事件。
- **IO 线程**（Slave）：拉取 binlog 写 relay log。
- **SQL 线程**（Slave）：重放 relay log。
- **dump 线程**（Master）：向 Slave 推送 binlog。

\`\`\`sql
-- 查看复制状态
SHOW SLAVE STATUS\\G
-- 关键字段:
-- Slave_IO_Running: Yes
-- Slave_SQL_Running: Yes
-- Seconds_Behind_Master: 0  -- 延迟秒数
\`\`\`

### 四、读写分离路由策略

读写分离的核心是"哪些走主库，哪些走从库"。简单按"写主读从"不够，有诸多边界。

#### 4.1 基本路由

| 操作 | 路由 |
| --- | --- |
| INSERT/UPDATE/DELETE | Master |
| SELECT | Slave |
| 事务内所有操作 | Master（一致性）|

#### 4.2 必须走主库的场景

并非所有读都该走从库，以下场景必须读主库：

1. **写后立即读**：用户改了昵称，刷新页面应看到新昵称。若走从库，因延迟可能看到旧的。
   \`\`\`java
   userDao.update(user);        // 写主库
   // 立即读，若走从库可能延迟 → 必须读主库
   User fresh = userDao.findById(user.getId());
   \`\`\`

2. **事务内的读**：事务要求一致性，必须都在主库。
   \`\`\`java
   @Transactional
   public void transfer() {
       accountDao.debit(...);           // 写
       Account acc = accountDao.find(); // 读，必须在主库
   }
   \`\`\`

3. **强一致读**：金融账户余额等强一致场景，读主库。

4. **关键业务读**：支付前查余额、下单前查库存，宁可慢不能错。

#### 4.3 写后强制读主的时间窗口

通用方案：写操作后一段时间内（如 5 秒），对该 key/user 的读强制走主库。

\`\`\`java
// 写后标记
public void update(User u) {
    master.update(u);
    routeMasterCache.set("user:" + u.getId(), 1, 5);  // 标记 5 秒走主库
}
// 读时判断
public User find(Long id) {
    if (routeMasterCache.get("user:" + id) != null) return master.find(id);  // 强制主库
    return slave.find(id);
}
\`\`\`

#### 4.4 从库负载均衡

多个从库时，读请求如何分配：

1. **轮询**：依次分配，简单均匀。
2. **权重**：按从库性能分配权重。
3. **最少连接**：分配给当前连接数最少的从库。
4. **随机**：随机选一个。

\`\`\`java
// 权重路由
Slave selectSlave() {
    int total = slaves.stream().mapToInt(s -> s.weight).sum();
    int r = random.nextInt(total);
    int acc = 0;
    for (Slave s : slaves) { acc += s.weight; if (r < acc) return s; }
    return slaves.get(0);
}
\`\`\`

### 五、主从延迟问题与解决

主从延迟是读写分离最大的痛点。异步复制下，从库数据滞后主库，导致读从库可能拿到旧数据。

#### 5.1 延迟的成因

- **网络延迟**：Master 到 Slave 的网络传输。
- **Slave 重放开销**：SQL 线程单线程重放，跟不上 Master 多线程写入（5.7 后并行复制改善）。
- **大事务**：单个大事务（如批量更新百万行）在 Slave 重放耗时长。
- **Slave 负载高**：Slave 上跑重查询，拖慢 SQL 线程。

#### 5.2 延迟的危害

- **写后读不一致**：用户改了数据，刷新看到旧的。
- **业务逻辑错误**：基于旧数据决策，如下单时库存是旧的导致超卖。
- **监控误判**：基于从库的监控数据滞后。

#### 5.3 解决方案

| 方案 | 说明 | 代价 |
| --- | --- | --- |
| 写后读走主库 | 关键读路由主库 | 主库压力 |
| 缓存兜底 | 写后写缓存，读缓存 | 一致性复杂 |
| 半同步复制 | 等 Slave ACK | 性能略降 |
| 业务容忍 | 允许短延迟 | 体验略差 |
| 强制读主 | 全部读主库 | 失去读写分离意义 |

**实践组合**：
- 强一致读（余额、库存）→ 强制主库。
- 一般读（列表、详情）→ 从库，容忍秒级延迟。
- 写后读 → 时间窗口强制主库。

#### 5.4 减少延迟的运维手段

- 开启**并行复制**（MySQL 5.7+，\`slave_parallel_workers\`）。
- 避免大事务（拆分批量操作）。
- Slave 用更好硬件（SSD）。
- Slave 不跑重查询/报表（单独分析库）。
- 监控 \`Seconds_Behind_Master\`，超阈值告警。

### 六、读写分离实现方式

读写分离可在四个层次实现。

#### 6.1 驱动层 / 代理层

独立的数据库代理，应用连代理，代理转发到主从。

- **MySQL Router**：MySQL 官方代理，配合 InnoDB Cluster。
- **ProxySQL**：高性能 MySQL 代理，支持读写分离、连接池、查询路由。
- **MaxScale**：MariaDB 的代理。

\`\`\`
应用 ──▶ ProxySQL ──┬──▶ Master (写)
                    └──▶ Slave1/2 (读)
\`\`\`

**优点**：应用无感知、语言无关、便于运维。
**缺点**：多一跳延迟、代理是单点（需高可用）。

#### 6.2 中间件层

ShardingSphere、MyCat 等中间件，既分库分表又读写分离。

\`\`\`yaml
# ShardingSphere 读写分离配置
rules:
  - !READWRITE_SPLITTING
    dataSources:
      readwrite_ds:
        writeDataSourceName: master_ds
        readDataSourceNames: [slave_ds_0, slave_ds_1]
        transactionalReadQueryStrategy: PRIMARY  # 事务内读主
\`\`\`

#### 6.3 应用层（动态数据源）

应用用 AOP/注解动态切换数据源。Spring 的 \`AbstractRoutingDataSource\`。

\`\`\`java
// Java：基于注解的动态数据源
@Target({ElementType.METHOD}) @Retention(RetentionPolicy.RUNTIME)
public @interface Master {}  // 强制主库

@Aspect @Component
public class DataSourceAspect {
    @Before("@annotation(master)")
    public void before(Master master) {
        DataSourceContext.set("master");
    }
    @After("@annotation(master)")
    public void after(Master master) {
        DataSourceContext.clear();
    }
}

// 使用
@Master  // 强制走主库
public User findFresh(Long id) { return userDao.findById(id); }
\`\`\`

**优点**：灵活、可控。
**缺点**：侵入业务代码、需框架支持。

#### 6.4 ORM 层

MyBatis、Hibernate 的读写分离插件，自动路由。

\`\`\`xml
<!-- MyBatis + 读写分离插件 -->
<plugin interceptor="com.github.readwrite.ReadWriteInterceptor">
    <property name="read" value="slave"/>
    <property name="write" value="master"/>
</plugin>
\`\`\`

#### 6.5 四种方式对比

| 方式 | 侵入性 | 性能 | 灵活性 | 运维 |
| --- | --- | --- | --- | --- |
| 代理(ProxySQL) | 无 | 中 | 中 | 独立 |
| 中间件(ShardingSphere) | 低 | 高 | 高 | 中 |
| 应用层(AOP) | 中 | 高 | 高 | 随应用 |
| ORM 插件 | 低 | 高 | 中 | 随应用 |

> 推荐：Java 项目用 ShardingSphere（读写分离+分库分表一体化）；多语言用 ProxySQL 代理。

### 七、读写分离与分库分表结合

读写分离和分库分表常组合使用：

\`\`\`
分片0: Master0 ──▶ Slave0_1, Slave0_2
分片1: Master1 ──▶ Slave1_1, Slave1_2
分片2: Master2 ──▶ Slave2_1, Slave2_2
\`\`\`

- 先按分片键路由到某分片。
- 分片内写 Master，读 Slave。
- 既有水平扩展，又有读写分离。

ShardingSphere 同时支持两者，配置即可。

### 八、读写分离的风险

#### 8.1 从库数据延迟

最大风险。应对：强制读主、半同步、缓存。

#### 8.2 主库宕机切换

Master 宕机需提升 Slave 为新 Master。问题：
- **数据丢失**：异步复制下，未同步的数据丢失。
- **切换中断**：切换期间服务不可用（秒~分钟级）。
- **双主脑裂**：网络分区导致两个 Master，数据冲突。

#### 8.3 脑裂（Split-Brain）

网络分区下，两个节点都认为自己是 Master，分别接受写，导致数据不一致。

**防护**： fencing 机制（强制旧 Master 下线）、多数派仲裁（MGR）、STONITH（shoot the other node in the head）。

### 九、主库高可用

主库宕机的自动切换依赖高可用方案：

| 方案 | 原理 | 特点 |
| --- | --- | --- |
| MHA | 监控+选举+切换，老牌 | 成熟但已停更 |
| Orchestrator | 拓扑管理+自动切换 | 活跃 |
| MGR | Paxos 强一致多主 | MySQL 原生，强一致 |
| Consul+脚本 | 服务发现+自研切换 | 灵活 |

**切换流程**：
1. 监控发现 Master 不可达。
2. 选举数据最新的 Slave 为新 Master。
3. 其他 Slave 指向新 Master。
4. 通知应用/代理更新连接。

### 十、读写分离适用与不适用场景

#### 10.1 适用

- 读多写少（读写比 > 10:1）。
- 读可容忍秒级延迟。
- 单库读 QPS 逼近上限。
- 已优化 SQL/索引/缓存，仍不够。

#### 10.2 不适用

- 写多读少：读写分离无益，应分库。
- 强一致读为主：从库延迟不可接受。
- 数据量超单表极限：需分库分表，读写分离不够。
- 小流量：单库足够，无需增加复杂度。

### 十一、读写分离落地步骤

1. **评估**：确认读写比、读 QPS、是否容忍延迟。
2. **搭建从库**：配置主从复制，验证同步。
3. **选实现方式**：代理/中间件/应用层。
4. **路由策略**：定义强制读主场景（写后读、事务、强一致）。
5. **灰度切流**：先切非核心读到从库，观察延迟与一致性。
6. **监控**：延迟、从库负载、命中率。
7. **高可用**：部署主库切换方案（MHA/Orchestrator）。
8. **全量切换**：核心读切从库。

### 十二、小结

读写分离是数据库扩展的"轻量武器"——成本低、见效快，适合读多写少场景。它通过主从复制把读压力分散到多个从库，但引入主从延迟这一核心难题，需要路由策略（强制读主、时间窗口）来缓解。理解复制原理、路由策略与高可用方案，才能让读写分离稳定落地。下一章我们讨论数据库连接池——它是数据库访问性能的另一关键。

### 十三、主从复制排障实战

生产中主从复制故障高频，掌握排障是必备能力。

#### 13.1 复制中断

现象：\`Slave_IO_Running: No\` 或 \`Slave_SQL_Running: No\`。

- **IO 线程中断**：网络问题、Master binlog 被删（从库位点丢失）、权限不足。排查 \`Last_IO_Error\`。
- **SQL 线程中断**：从库重放 SQL 报错（如主键冲突、字段不存在）。排查 \`Last_SQL_Error\`。

\`\`\`sql
-- 跳过一个错误（谨慎，可能导致不一致）
STOP SLAVE;
SET GLOBAL sql_slave_skip_counter = 1;
START SLAVE;
-- 或基于 GTID 跳过
STOP SLAVE;
SET GTID_NEXT='uuid:seq';
BEGIN; COMMIT; SET GTID_NEXT='AUTOMATIC';
START SLAVE;
\`\`\`

#### 13.2 延迟过大

\`Seconds_Behind_Master\` 持续增大。排查方向：

- 大事务：\`SHOW PROCESSLIST\` 看 SQL 线程执行的语句耗时。
- 单线程重放瓶颈：开启并行复制。
- 从库负载：是否有重查询/报表占用资源。
- 网络带宽：Master 到 Slave 间带宽是否打满。

#### 13.3 数据不一致

主从数据不一致是严重问题，可能由复制跳过错误、非确定性语句（如 \`NOW()\` 在主从执行时间不同）、binlog 格式不当引起。

- 使用 \`ROW\` 格式 binlog（基于行，确定性，最安全）。
- 用 \`pt-table-checksum\` 校验主从一致性，\`pt-table-sync\` 修复。
- GTID 模式下更易追踪与修复。

### 十四、读写分离监控体系

| 监控项 | 指标 | 告警 |
| --- | --- | --- |
| 复制状态 | IO/SQL 线程状态 | 任一 No 立即告警 |
| 复制延迟 | Seconds_Behind_Master | >5s 告警 |
| 主库连接数 | Threads_connected | >80% 上限告警 |
| 从库负载 | CPU/IO | >80% 告警 |
| 慢查询 | slow_queries | 突增告警 |
| 读写比例 | master/slave QPS | 比例异常告警 |

监控工具：Prometheus + mysqld_exporter + Grafana，可视化主从状态、延迟、QPS。

### 十五、GTID 复制

GTID（Global Transaction Identifier）是 MySQL 5.6+ 的复制增强，每个事务有全局唯一 ID。

**优势**：
- 主从切换更简单：从库自动从断点续传，无需手工指定位点。
- 防止重复执行：GTID 已执行的事务不会重放。
- 易于搭建新从库：自动补齐缺失事务。

\`\`\`ini
# 开启 GTID
gtid_mode=ON
enforce_gtid_consistency=ON
\`\`\`

\`\`\`sql
-- GTID 模式搭建从库
CHANGE MASTER TO
  MASTER_HOST='master', MASTER_USER='repl', MASTER_PASSWORD='...',
  MASTER_AUTO_POSITION=1;  -- 自动定位
START SLAVE;
\`\`\`

### MySQL 主从复制原理深度剖析

#### 复制的三个线程

\`\`\`
主库（Master）：
  Binlog Dump Thread —— 读取 binlog，发送给从库

从库（Slave）：
  IO Thread  —— 接收主库 binlog，写入 relay log
  SQL Thread —— 读取 relay log，回放 SQL，写入数据文件

流程：
  Master 写入 binlog → Dump Thread 发送 → Slave IO Thread 接收 → relay log
  → Slave SQL Thread 回放 → 数据更新
\`\`\`

**关键文件**：
- **binlog**（主库）：记录所有写操作，二进制格式
- **relay log**（从库）：从主库接收的 binlog 副本
- **master.info**（从库）：记录主库连接信息和读取位置
- **relay-log.info**（从库）：记录 relay log 回放位置

#### 复制的三种格式

| 格式 | 记录内容 | 优点 | 缺点 |
| --- | --- | --- | --- |
| STATEMENT | SQL 语句 | 日志小，日志清晰 | 非确定函数（NOW/UUID/RAND）结果不一致 |
| ROW | 行变更（before/after） | 精确，无不一致 | 日志大（批量操作记录每行） |
| MIXED | 自动选择 | 兼顾大小和精确 | 复杂，难以预测 |

**推荐**：ROW 格式（MySQL 8.0 默认），虽然日志大，但数据一致性最好。

\`\`\`sql
-- 查看当前 binlog 格式
SHOW VARIABLES LIKE 'binlog_format';
-- 设置为 ROW
SET GLOBAL binlog_format = 'ROW';
\`\`\`

#### 复制位置管理

\`\`\`sql
-- 查看主库状态
SHOW MASTER STATUS;
-- +------------------+----------+--------------+------------------+
-- | File             | Position | Binlog_Do_DB | Binlog_Ignore_DB |
-- +------------------+----------+--------------+------------------+
-- | mysql-bin.000003 |     1076 |              |                  |
-- +------------------+----------+--------------+------------------+

-- 查看从库状态
SHOW SLAVE STATUS\G
-- Master_Log_File: mysql-bin.000003       -- IO Thread 读取到的位置
-- Read_Master_Log_Pos: 1076
-- Relay_Log_File: relay-bin.000005        -- SQL Thread 回放到的位置
-- Relay_Log_Pos: 623
-- Seconds_Behind_Master: 0                -- 延迟秒数

-- 从指定位置开始复制
CHANGE MASTER TO
  MASTER_HOST='master', MASTER_USER='repl', MASTER_PASSWORD='...',
  MASTER_LOG_FILE='mysql-bin.000003',
  MASTER_LOG_POS=1076;
START SLAVE;
\`\`\`

### 半同步复制与组复制

#### 半同步复制（Semi-Sync）

异步复制的问题：主库写入 binlog 后不等从库确认，如果主库宕机，未同步的数据丢失。

半同步复制：主库写入后，至少等待一个从库确认收到 binlog 才返回客户端成功。

\`\`\`
-- 主库安装半同步插件
INSTALL PLUGIN rpl_semi_sync_master SONAME 'semisync_master.so';
SET GLOBAL rpl_semi_sync_master_enabled = 1;
SET GLOBAL rpl_semi_sync_master_timeout = 3000;  -- 3 秒超时降级为异步

-- 从库安装半同步插件
INSTALL PLUGIN rpl_semi_sync_slave SONAME 'semisync_slave.so';
SET GLOBAL rpl_semi_sync_slave_enabled = 1;
STOP SLAVE IO_THREAD; START SLAVE IO_THREAD;  -- 重启 IO 线程生效
\`\`\`

**超时降级**：如果从库在 timeout 内没确认，主库降级为异步复制，避免主库阻塞。

**after_sync vs after_commit**：
- after_sync（MySQL 5.7+）：主库同步到从库后才提交，无数据丢失
- after_commit（旧版）：主库提交后才同步，主库宕机可能丢已提交数据

#### 组复制（MGR，MySQL Group Replication）

MGR 是 MySQL 8.0 的高可用方案，基于 Paxos 变种：

\`\`\`
多个 MySQL 节点组成一个复制组
写操作通过 Paxos 协议在组内达成共识
超过半数节点确认才算写入成功

单主模式（Single-Primary）：一个主写，其他只读
多主模式（Multi-Primary）：所有节点都可写（冲突检测）
\`\`\`

\`\`\`ini
# my.cnf 配置
[mysqld]
gtid_mode=ON
enforce_gtid_consistency=ON
binlog_format=ROW
binlog_row_image=FULL

# 组复制配置
plugin_load_add='group_replication.so'
group_replication_group_name="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
group_replication_local_address="node1:33061"
group_replication_group_seeds="node1:33061,node2:33061,node3:33061"
group_replication_bootstrap_group=OFF
\`\`\`

\`\`\`sql
-- 启动组复制
SET GLOBAL group_replication_bootstrap_group=ON;
START GROUP_REPLICATION;
SET GLOBAL group_replication_bootstrap_group=OFF;

-- 其他节点加入
START GROUP_REPLICATION;

-- 查看组成员
SELECT * FROM performance_schema.replication_group_members;
\`\`\`

### 主从延迟根因分析

#### 延迟产生的原因

\`\`\`
1. 单线程回放（MySQL < 5.7）
   从库 SQL Thread 单线程回放，主库多线程写入 → 从库跟不上

2. 大事务
   一个事务更新 100 万行 → 从库回放需要很长时间

3. DDL 操作
   ALTER TABLE 重建整表，从库执行期间阻塞其他回放

4. 从库硬件差
   从库 CPU/IO 不如主库

5. 网络带宽不足
   binlog 传输慢

6. 从库承担读压力
   从库既要回放又要服务读请求，资源竞争
\`\`\`

#### 并行复制（MySQL 5.7+）

MySQL 5.7 引入基于组提交的并行复制：

\`\`\`ini
# 从库配置
slave_parallel_type = LOGICAL_CLOCK   # 基于组提交的逻辑时钟
slave_parallel_workers = 8            # 并行回放线程数
slave_preserve_commit_order = ON      # 保持提交顺序

# 原理：主库同一组提交的事务没有锁冲突，从库可以并行回放
\`\`\`

MySQL 8.0 进一步优化为基于 WRITESET 的并行复制：

\`\`\`ini
# 主库配置
binlog_transaction_dependency_tracking = WRITESET  # 基于行级冲突检测
# 比 LOGICAL_CLOCK 并行度更高（不限于同一组提交）
\`\`\`

#### 延迟监控

\`\`\`sql
SHOW SLAVE STATUS\G
-- Seconds_Behind_Master: 300  -- 延迟 300 秒

-- 更精确的延迟监控
SELECT
  MASTER_POS_WAIT('mysql-bin.000003', 1076, 5) AS result;
-- result=0 表示已同步到指定位置
-- result=-1 表示超时未同步
-- result=NULL 表示 slave 未运行
\`\`\`

#### 减少延迟的策略

\`\`\`sql
-- 1. 开启并行复制
SET GLOBAL slave_parallel_workers = 16;
SET GLOBAL slave_parallel_type = 'LOGICAL_CLOCK';

-- 2. 避免大事务（拆分）
-- 不要一次 UPDATE 100 万行
-- 分批：UPDATE table SET ... WHERE id BETWEEN 1 AND 10000;
-- 间隔执行下一批

-- 3. 从库不承担重读压力
-- 读写分离时从库只做备份+读
-- 大查询放到独立的分析库

-- 4. 使用 SSD
-- 从库 IO 瓶颈用 SSD 缓解

-- 5. binlog 传输压缩
SET GLOBAL binlog_transaction_compression = ON;  -- MySQL 8.0+
\`\`\`

### 读写分离路由策略详解

#### 路由策略对比

| 策略 | 实现 | 优点 | 缺点 |
| --- | --- | --- | --- |
| 基于注解 | @Master/@Slave 注解 | 精确控制 | 侵入性强 |
| 基于方法名 | write*/save* → 主，read*/get* → 从 | 无侵入 | 命名规范约束 |
| 基于事务 | @Transactional 只读 → 从 | 自动 | 事务内无法切 |
| 基于权重 | 按权重分配到多个从库 | 灵活 | 配置复杂 |
| 基于延迟 | 延迟 < 阈值才读从库 | 数据新 | 延迟高时回退主库 |

#### Spring 动态数据源实现

\`\`\`java
// 基于 AOP 的读写分离
@Aspect
@Component
public class DataSourceAspect {
    @Before("@annotation(master)")
    public void setMaster(Master master) {
        DataSourceContextHolder.set(DataSourceType.MASTER);
    }

    @Before("@annotation(slave)")
    public void setSlave(Slave slave) {
        // 检查从库延迟，延迟太高回退主库
        if (replicationLag > MAX_LAG) {
            DataSourceContextHolder.set(DataSourceType.MASTER);
        } else {
            // 轮询选择从库
            DataSourceContextHolder.set(selectSlave());
        }
    }

    @After("@annotation(master) || @annotation(slave)")
    public void clear() {
        DataSourceContextHolder.clear();
    }
}

// 动态数据源路由
public class DynamicDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        return DataSourceContextHolder.get();
    }
}

// 使用
@Master
public void updateUser(User user) {
    userRepo.save(user);  // 走主库
}

@Slave
public User getUser(Long id) {
    return userRepo.findById(id);  // 走从库
}
\`\`\`

#### Go 读写分离路由

\`\`\`go
// Go 用中间件实现读写分离
type DBRouter struct {
    master  *sql.DB
    slaves  []*sql.DB
    counter uint64
}

func (r *DBRouter) Master() *sql.DB {
    return r.master
}

func (r *DBRouter) Slave() *sql.DB {
    if len(r.slaves) == 0 {
        return r.master  // 没有从库，回退主库
    }
    // 轮询选择从库
    idx := atomic.AddUint64(&r.counter, 1) % uint64(len(r.slaves))
    return r.slaves[idx]
}

// 基于方法名的路由
func (r *DBRouter) Get(query string) *sql.DB {
    // SELECT 走从库
    if strings.HasPrefix(strings.ToUpper(query), "SELECT") {
        return r.Slave()
    }
    // INSERT/UPDATE/DELETE 走主库
    return r.Master()
}
\`\`\`

### 强一致读方案

#### 问题：写后读不一致

\`\`\`
用户更新资料 → 写主库
用户立即查看资料 → 读从库 → 从库还没同步 → 看到旧数据
\`\`\`

#### 方案一：写后读主

\`\`\`java
// 写操作后一段时间内，同一用户的读操作走主库
public class ReadWriteSplit {
    private ThreadLocal<Long> writeTime = new ThreadLocal<>();

    public void updateUser(User user) {
        masterDB.update(user);
        writeTime.set(System.currentTimeMillis());
    }

    public User getUser(Long id) {
        // 写后 3 秒内读主库
        Long lastWrite = writeTime.get();
        if (lastWrite != null && System.currentTimeMillis() - lastWrite < 3000) {
            return masterDB.findById(id);  // 读主
        }
        return slaveDB.findById(id);  // 读从
    }
}
\`\`\`

**问题**：ThreadLocal 只对同一线程有效，用户下次请求可能到不同线程/实例。

#### 方案二：Session 级别读写路由

\`\`\`java
// 将写时间记入 Session/Redis
public void updateUser(Long userId, User user) {
    masterDB.update(user);
    redis.setex("write:master:" + userId, 3, "1");  // 3 秒标记
}

public User getUser(Long id) {
    // 检查是否在写后窗口内
    if (redis.exists("write:master:" + id)) {
        return masterDB.findById(id);  // 读主
    }
    return slaveDB.findById(id);  // 读从
}
\`\`\`

#### 方案三：GTID 等待

\`\`\`java
// 写操作返回 GTID，读操作等待从库同步到该 GTID
public String updateUser(User user) {
    masterDB.update(user);
    String gtid = masterDB.getLastGTID();  // 获取当前 GTID
    return gtid;
}

public User getUser(Long id, String gtid) {
    // 等待从库同步到指定 GTID
    slaveDB.waitForGTID(gtid, 5);  // 最多等 5 秒
    return slaveDB.findById(id);
}
\`\`\`

#### 方案四：半同步复制

使用半同步复制，保证写操作至少同步到一个从库后才返回，从库延迟极小（毫秒级），基本消除写后读不一致。

### 故障转移与高可用

#### MHA（Master High Availability）

MHA 是经典的 MySQL 故障转移工具：

\`\`\`
架构：
  MHA Manager —— 监控主库，故障时选举新主
  MHA Node    —— 部署在每个 MySQL 节点

故障转移流程：
  1. 检测主库宕机（连续 3 次心跳失败）
  2. 从所有从库中选择数据最新的作为新主
     - 比较各从库的 binlog 位置
     - 尝试从旧主 salvaged binlog 补齐差异
  3. 其他从库重新指向新主
  4. 应用配置更新 VIP/连接信息

切换时间：10-30 秒
\`\`\`

#### Orchestrator

Orchestrator 是更现代的 MySQL 高可用工具：

\`\`\`json
// Orchestrator 配置
{
  "ListenAddress": ":3000",
  "MySQLOrchestratorHost": "127.0.0.1",
  "ReplicationTopologyCredentials": {
    "User": "orchestrator",
    "Password": "..."
  },
  "FailMasterClusterPromotionIfSQLThreadNotUpToDate": true,
  "MasterFailoverLostInstancesDowntimeMinutes": 10
}
\`\`\`

**优势**：
- Web UI 可视化拓扑
- 支持手动/自动故障转移
- 支持拓扑重构（如链式→星形）
- 支持钩子脚本（切换前/后执行自定义逻辑）

#### MGR 自动故障转移

MGR 内置故障转移，无需外部工具：

\`\`\`
单主模式下：
  主库宕机 → 组内自动选举新主
  选举基于 Paxos，需半数以上节点同意
  选举时间：几秒

多主模式下：
  某节点宕机 → 其他节点继续服务
  无需选举，但需冲突检测
\`\`\`

### 读写分离与分库分表结合

生产环境常将读写分离与分库分表结合：

\`\`\`
          ┌─ 分片1 ── 主库
          │         └─ 从库1, 从库2
应用 ──→ ┼─ 分片2 ── 主库
          │         └─ 从库1, 从库2
          └─ 分片3 ── 主库
                    └─ 从库1, 从库2

写操作 → 路由到对应分片的主库
读操作 → 路由到对应分片的某个从库
\`\`\`

\`\`\`java
// ShardingSphere + 读写分离
ShardingRuleConfiguration shardingConfig = new ShardingRuleConfiguration();

// 分库分表规则
TableRuleConfiguration orderRule = new TableRuleConfiguration(
    "orders", "ds_\${0..2}.orders_\${0..3}");

// 读写分离规则（每个分片一个主从组）
Map<String, DataSource> dataSourceMap = new HashMap<>();
for (int i = 0; i < 3; i++) {
    // 主库
    dataSourceMap.put("ds_" + i + "_master", createMasterDataSource(i));
    // 从库
    dataSourceMap.put("ds_" + i + "_slave_0", createSlaveDataSource(i, 0));
    dataSourceMap.put("ds_" + i + "_slave_1", createSlaveDataSource(i, 1));
}

// 读写分离配置
MasterSlaveRuleConfiguration msConfig = new MasterSlaveRuleConfiguration(
    "ds_0", "ds_0_master",
    Arrays.asList("ds_0_slave_0", "ds_0_slave_1"));
// ... 对每个分片配置读写分离
\`\`\`

### 读写分离监控

#### 关键监控指标

\`\`\`
1. 复制延迟
   - Seconds_Behind_Master（< 1 秒为健康）
   - 主从 binlog 位置差距

2. 复制状态
   - Slave_IO_Running: Yes
   - Slave_SQL_Running: Yes
   - Last_Error: 空

3. 主库写入 QPS
4. 从库读取 QPS（各从库均衡度）
5. 从库连接数
6. 故障转移历史
\`\`\`

#### Prometheus + Grafana 监控

\`\`\`yaml
# mysqld_exporter 配置
[client]
user=exporter
password=...

# Prometheus 采集
scrape_configs:
  - job_name: 'mysql'
    static_configs:
      - targets: ['master:9104', 'slave1:9104', 'slave2:9104']
\`\`\`

\`\`\`sql
-- 关键告警规则
-- 1. 复制中断
SHOW SLAVE STATUS\G  -- Slave_IO_Running 或 Slave_SQL_Running 为 No

-- 2. 延迟告警
-- Seconds_Behind_Master > 30

-- 3. 从库连接异常
-- Slave_IO_Running = Connecting（持续连接不上主库）
\`\`\`

### 多语言读写分离框架

#### Java（Spring + ShardingSphere）

\`\`\`yaml
# application.yml
spring:
  shardingsphere:
    datasource:
      names: master,slave0,slave1
      master:
        type: com.zaxxer.hikari.HikariDataSource
        jdbc-url: jdbc:mysql://master:3306/db
        username: root
        password: ...
      slave0:
        jdbc-url: jdbc:mysql://slave0:3306/db
        ...
      slave1:
        jdbc-url: jdbc:mysql://slave1:3306/db
        ...
    rules:
      readwrite-splitting:
        data-sources:
          ds:
            write-data-source-name: master
            read-data-source-names: slave0,slave1
            load-balancer-name: round-robin
        load-balancers:
          round-robin:
            type: ROUND_ROBIN
\`\`\`

#### Go（GORM 多数据源）

\`\`\`go
// GORM 读写分离
type ReadWriteDB struct {
    WriteDB *gorm.DB  // 主库
    ReadDB  *gorm.DB  // 从库
}

func (rw *ReadWriteDB) Transaction(fc func(tx *gorm.DB) error) error {
    return rw.WriteDB.Transaction(fc)  // 事务走主库
}

func (rw *ReadWriteDB) Find(dest interface{}, conds ...interface{}) *gorm.DB {
    return rw.ReadDB.Find(dest, conds...)  // 查询走从库
}

func (rw *ReadWriteDB) Create(value interface{}) *gorm.DB {
    return rw.WriteDB.Create(value)  // 写入走主库
}
\`\`\`

#### Python（SQLAlchemy）

\`\`\`python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 主从引擎
master_engine = create_engine('mysql://master:3306/db')
slave_engine = create_engine('mysql://slave:3306/db')

MasterSession = sessionmaker(bind=master_engine)
SlaveSession = sessionmaker(bind=slave_engine)

# 路由
class Router:
    def get_session(self, operation='read'):
        if operation == 'write':
            return MasterSession()
        return SlaveSession()

# 使用
router = Router()
# 写
session = router.get_session('write')
session.add(user)
session.commit()
# 读
session = router.get_session('read')
users = session.query(User).all()
\`\`\`

### 生产环境最佳实践

1. **至少一主两从**：单从故障时仍有备份
2. **半同步复制**：减少数据丢失风险
3. **并行复制**：从库开启多线程回放，减少延迟
4. **从库延迟监控**：延迟 > 10 秒告警，读请求回退主库
5. **定期演练故障转移**：确保故障切换真正可用
6. **从库不跑大查询**：大查询放独立的分析库或读副本
7. **连接池分离**：主库和从库用独立连接池，避免相互影响
8. **DNS/VIP 切换**：故障转移后通过 VIP 自动切换，应用无感知

### MySQL 复制拓扑结构

#### 星形拓扑（一主多从）

\`\`\`
        Master
       / |    \\
   Slave1 Slave2 Slave3
\`\`\`
最常见，适合读写分离。主库压力集中。

#### 链式拓扑（级联复制）

\`\`\`
Master → Slave1 → Slave2 → Slave3
\`\`\`
减轻主库压力（Slave1 中继）。但链路长，延迟累积。

#### 双主互备（Active-Passive）

\`\`\`
Master1 ↔ Master2
\`\`\`
两个主库互相复制。一个写，一个备。故障切换快。
风险：循环复制（用 server-id 过滤）和数据冲突。

#### 双主双写（Active-Active）

不推荐。两个主库同时写，冲突难以解决。
除非用 MGR 多主模式（内置冲突检测）。

### 读写分离的性能优化

#### 连接池优化

\`\`\`java
// 主库和从库用独立连接池
HikariDataSource masterPool = new HikariDataSource();
masterPool.setMaximumPoolSize(10);  // 写少

HikariDataSource slavePool = new HikariDataSource();
slavePool.setMaximumPoolSize(30);   // 读多
\`\`\`

#### 批量查询优化

\`\`\`java
// 错误：循环单条查询
for (Long id : ids) {
    User u = slaveDB.findById(id);  // 100 次 DB 查询
}

// 正确：批量查询
List<User> users = slaveDB.findByIds(ids);  // 1 次 DB 查询（IN）
\`\`\`

#### 从库索引优化

\`\`\`sql
-- 从库可以加主库没有的索引
-- 主库写性能优先，从库读性能优先
ALTER TABLE orders ADD INDEX idx_user_status (user_id, status);
-- 从库加这个索引，主库不加（主库写慢，从库查快）
\`\`\`

### 读写分离的常见问题

#### 问题一：事务内读从库

\`\`\`java
@Transactional
public void process(Long id) {
    Order order = orderRepo.findById(id);  // 事务内，走主库
    User user = userRepo.findById(order.getUserId());  // 可能走从库！
    // 如果从库延迟，user 可能是旧数据
}

// 解决：事务内所有查询走主库
@Transactional
public void process(Long id) {
    // 强制走主库
    Order order = masterDB.findById(id);
    User user = masterDB.findById(order.getUserId());
}
\`\`\`

#### 问题二：计数不准

\`\`\`java
// 用户下单后立即查看订单数
int count = slaveDB.countOrders(userId);  // 从库延迟，少计 1
// 解决：写后读主
int count = masterDB.countOrders(userId);
\`\`\`

#### 问题三：从库过期数据

\`\`\`java
// 从库长时间不同步，返回过期数据
// 监控 Seconds_Behind_Master，超阈值自动切换读主
public User getUser(Long id) {
    if (replicationLag > MAX_LAG_SECONDS) {
        return masterDB.findById(id);  // 延迟太大，读主
    }
    return slaveDB.findById(id);  // 正常读从
}
\`\`\`

### 数据库代理中间件

#### ProxySQL

\`\`\`
应用 → ProxySQL → Master（写）
                  → Slave1/Slave2（读）

ProxySQL 自动路由：
  - INSERT/UPDATE/DELETE → Master
  - SELECT → Slave（轮询/权重）
  - 事务内所有查询 → Master
\`\`\`

\`\`\`ini
# ProxySQL 配置
[mysql_servers]
# 写组（hostgroup 0）
0,"master",3306,1000,1
# 读组（hostgroup 1）
1,"slave1",3306,1000,1
1,"slave2",3306,1000,1

[mysql_query_rules]
# 事务走写组
rule_id=1,active=1,match_pattern="^BEGIN|^START",destination_hostgroup=0
# SELECT 走读组
rule_id=2,active=1,match_pattern="^SELECT",destination_hostgroup=1
\`\`\`

#### 代理 vs 应用层路由

| 特性 | 代理（ProxySQL） | 应用层（ShardingSphere-JDBC） |
| --- | --- | --- |
| 性能 | 多一跳网络 | 直接连接 |
| 透明度 | 应用无感知 | 需配置 |
| 运维 | 独立组件 | 应用内 |
| 灵活性 | 规则配置 | 代码控制 |

### 读写分离的灰度发布

\`\`\`
1. 新从库上线，先不接入读流量
2. 灰度 10% 读流量到新从库，观察延迟和错误率
3. 逐步增加到 50%、100%
4. 灰度期间监控：
   - 查询延迟 P99
   - 错误率
   - 从库复制延迟
5. 异常自动回退到旧从库
\`\`\`

### 数据库备份与恢复

#### 备份策略

\`\`\`
1. 物理备份（xtrabackup）
   - 全量备份：每天一次（凌晨低峰）
   - 增量备份：每小时一次
   - 恢复快（直接拷贝文件）

2. 逻辑备份（mysqldump）
   - 全量备份：每天一次
   - 恢复慢（重新执行 SQL）
   - 适合小库或迁移

3. binlog 备份
   - 实时备份 binlog 到远程
   - 用于 PITR（Point-In-Time Recovery）
\`\`\`

#### PITR（时间点恢复）

\`\`\`bash
# 1. 恢复全量备份
xtrabackup --copy-back --target-dir=/backup/full

# 2. 应用 binlog 到指定时间点
mysqlbinlog --start-datetime="2024-01-01 00:00:00" \
            --stop-datetime="2024-01-01 12:00:00" \
            /backup/binlog/mysql-bin.000123 | mysql -u root -p

# 场景：误删表，恢复到删除前
\`\`\`

### 读写分离的成本与收益

#### 收益

\`\`\`
1. 读性能提升 N 倍（N 个从库）
2. 主库专注写，写性能也提升
3. 从库可做报表/分析，不影响主库
4. 从库作为热备，故障可切换
\`\`\`

#### 成本

\`\`\`
1. 硬件成本：每从库一台服务器
2. 运维成本：复制监控、故障转移、数据校验
3. 一致性成本：最终一致，需处理写后读
4. 复杂度成本：路由逻辑、连接池管理
\`\`\`

#### 何时引入读写分离

\`\`\`
读 QPS < 1000 → 单库足够
读 QPS 1000-5000 → 优化 SQL + 索引 + 缓存
读 QPS 5000-20000 → 读写分离（1主2从）
读 QPS > 20000 → 读写分离 + 分库分表
\`\`\`

> 生产环境强烈建议使用 GTID 复制，运维复杂度大幅降低。

### 二十一、读写分离与 Serverless 数据库

#### 21.1 Serverless 数据库的读写分离

云原生 Serverless 数据库（如 Aurora Serverless、PolarDB Serverless）将读写分离推向新高度：

1. **计算存储分离**：存储层共享，计算节点（读节点）秒级弹性扩缩。
2. **共享存储**：主从共享同一份存储，从库不复制数据，延迟趋近于零。
3. **按需弹性**：根据负载自动增减读节点，无需预先规划从库数量。
4. **全局读库**：跨可用区/跨地域只读节点，支持就近读。

\`\`\`
传统读写分离：
  Master → binlog → Slave（数据复制，有延迟）

Serverless 读写分离：
  共享存储层（Redo Log）
     ↑        ↑       ↑
   Writer   Reader1  Reader2（共享同一份存储，无复制延迟）
\`\`\`

#### 21.2 Serverless 读写分离的优势与陷阱

优势：
- **零延迟**：从库读共享存储的 Redo Log 回放，延迟 < 100ms。
- **弹性伸缩**：秒级增减读节点，应对流量波峰。
- **成本优化**：按使用量计费，低峰自动缩容。

陷阱：
- **连接数限制**：Serverless 实例有最大连接数限制，需配合连接池。
- **冷启动**：缩容到 0 后首次访问有冷启动延迟（秒级）。
- **事务一致性**：共享存储虽然低延迟，但仍非强一致读，写后读仍需走主库。
- **锁竞争**：多个 Reader 回放 Redo Log 时，DDL 语句可能阻塞所有 Reader。

### 二十二、读写分离的成本优化

#### 22.1 从库规格优化

\`\`\`
策略1: 从库降配
  主库: 16C64G（写少但重，需高配置）
  从库: 8C32G × 3（读多但轻，可降配）
  → 节省 50% 硬件成本

策略2: 混合部署
  核心业务从库: 独立高配实例
  非核心业务从库: 与其他服务共享实例
  → 提高资源利用率

策略3: 读写分离 + 缓存
  热点数据缓存到 Redis，减少从库读压力
  → 可减少从库数量
\`\`\`

#### 22.2 从库数量规划

\`\`\`
从库数量 = 读 QPS / 单从库可承载 QPS × 安全系数(1.5)

例: 读 QPS = 15000, 单从库 5000 QPS
  → 需要 15000/5000 × 1.5 = 4.5 → 取 5 个从库

考虑故障容错: 5 个从库，宕机 1 个仍能扛 15000×1.25=18750 QPS
\`\`\`

> 从库数量不是越多越好。超过 5 个从库后，主库 binlog 分发压力增大，反而增加延迟。建议单主不超过 5~10 个从库。

### 二十三、读写分离的多版本读（MVCC 与读分离）

#### 23.1 MVCC 原理与读写分离

MySQL InnoDB 使用 MVCC（多版本并发控制），每行数据有多个版本：

\`\`\`
Read View 机制：
  事务 T 在查询时生成 Read View，记录当前活跃事务列表。
  只读取"在 T 开始前已提交"的数据版本。

这与读写分离的关系：
  主从延迟本质是"从库尚未回放到某版本"。
  强一致读 = 等待从库回放到"写事务提交时"的版本。
\`\`\`

#### 23.2 GTID 等待实现强一致读

\`\`\`
1. 写事务提交后，获取 GTID = gtid_executed 的最大值
2. 读请求路由到从库前，先执行 SELECT WAIT_FOR_EXECUTED_GTID_SET(gtid, timeout)
3. 等待从库回放到该 GTID 后，再执行读查询
4. 超时则降级到主库读

-- Java 示例（伪代码）
String gtid = master.execute("SELECT @@GLOBAL.gtid_executed");
slave.execute("SELECT WAIT_FOR_EXECUTED_GTID_SET('" + gtid + "', 5)");
List result = slave.query("SELECT * FROM orders WHERE id = ?", id);
\`\`\`

> GTID 等待是强一致读的标准方案，但会增加读延迟（等待回放）。仅在必要时使用。

### 二十四、读写分离的合规与数据隔离

#### 24.1 数据合规场景

某些业务场景需要数据物理隔离：
- **GDPR**：欧盟用户数据必须存储在欧洲节点。
- **金融合规**：交易数据与查询数据物理隔离，查询库脱敏。
- **多租户**：不同租户数据分到不同从库实例。

#### 24.2 脱敏从库设计

\`\`\`
主库: 存储完整数据（含手机号、身份证号）
  ↓ binlog 同步
脱敏从库: 手机号 → 138****1234, 身份证 → 110***********1234

实现方式:
1. 从库设置生成列: phone_masked AS MASK(phone)
2. 应用层读从库时只查 phone_masked 字段
3. 或用 MaxScale Proxy 中间件做查询改写，自动替换敏感字段
\`\`\`

#### 24.3 读写分离与数据生命周期

\`\`\`
热数据: 主库 + 实时从库（当前 3 个月）
温数据: 归档从库（3 个月 ~ 1 年，降配实例）
冷数据: 归档存储（1 年以上，对象存储/冷库）

读写分离 + 冷热分离:
  实时从库处理在线查询
  归档从库处理报表查询（避免影响在线业务）
\`\`\`

### 二十五、读写分离的灰度发布补充

#### 25.1 灰度切流的关键控制点

\`\`\`
1. 流量染色：在请求头打标记（x-read-source=slave），网关按标记路由
2. 白名单灰度：先切内部测试账号到从库读，验证无异常后扩大范围
3. 按业务灰度：先切非核心业务（如评论、列表），再切核心业务（如交易、支付）
4. 按比例灰度：10% → 30% → 50% → 100%，每档观察 2~4 小时

回滚机制：
  - 配置中心一键切回主库读（开关预热，秒级生效）
  - 保留双读日志，对比主从数据差异
  - 切流期间监控错误率、RT、投诉量
\`\`\`

> 生产环境强烈建议使用 GTID 复制，运维复杂度大幅降低。`,
    code: `// ============================================================
// 读写分离 —— Master/Slave 路由 + 主从复制模拟 + 延迟/故障转移
// ============================================================

// ---------- 模拟数据库节点 ----------
class DBNode {
  constructor(name, role) {
    this.name = name;
    this.role = role;       // 'master' | 'slave'
    this.data = new Map();  // key -> value
    this.alive = true;
    this.lag = 0;           // 复制延迟(ms)
  }
  write(key, val) {
    if (!this.alive) throw new Error(this.name + ' 宕机');
    this.data.set(key, val);
    return 'OK';
  }
  read(key) {
    if (!this.alive) throw new Error(this.name + ' 宕机');
    return this.data.has(key) ? this.data.get(key) : null;
  }
}

// ---------- 数据源（1主多从）----------
class DataSource {
  constructor(master, slaves) {
    this.master = master;
    this.slaves = slaves;
    this.slaveIdx = 0;       // 轮询指针
    this.masterWindow = new Map();  // key -> 强制读主到期时间
    this.stats = { masterRead: 0, slaveRead: 0, masterWrite: 0 };
  }
  // 写：写主库，并标记该 key 一段时间内强制读主
  write(key, val) {
    this.master.write(key, val);
    this.masterWindow.set(key, Date.now() + 200);  // 200ms 强制读主
    this.stats.masterWrite++;
    // 异步复制到从库（有延迟）
    this.slaves.forEach(s => {
      setTimeout(() => { if (s.alive) s.data.set(key, val); }, s.lag);
    });
  }
  // 读：事务内/写后窗口/强一致 → 主库；否则从库轮询
  read(key, opts = {}) {
    if (opts.forceMaster || opts.inTransaction) {
      this.stats.masterRead++;
      return { from: this.master.name, val: this.master.read(key) };
    }
    // 写后窗口内强制主库
    if (this.masterWindow.has(key) && Date.now() < this.masterWindow.get(key)) {
      this.stats.masterRead++;
      return { from: this.master.name, val: this.master.read(key), reason: '写后读主' };
    }
    // 从库轮询（跳过宕机从库）
    const alive = this.slaves.filter(s => s.alive);
    if (alive.length === 0) {
      this.stats.masterRead++;
      return { from: this.master.name, val: this.master.read(key), reason: '无从库回退主库' };
    }
    const slave = alive[this.slaveIdx++ % alive.length];
    this.stats.slaveRead++;
    return { from: slave.name, val: slave.read(key) };
  }
  // 健康检查：剔除宕机从库
  healthCheck() {
    this.slaves.forEach(s => { if (!s.alive) console.log('  [健康检查] ' + s.name + ' 已宕机，剔除'); });
  }
  failover() {
    // 主库宕机，提升最新的从库为新主
    const candidate = this.slaves.find(s => s.alive);
    if (!candidate) throw new Error('无可用从库，无法故障转移');
    candidate.role = 'master';
    this.master = candidate;
    this.slaves = this.slaves.filter(s => s !== candidate);
    console.log('  [故障转移] 提升 ' + candidate.name + ' 为新主库');
  }
}

// ===== 演示 =====
const master = new DBNode('Master', 'master');
const slave1 = new DBNode('Slave1', 'slave'); slave1.lag = 30;
const slave2 = new DBNode('Slave2', 'slave'); slave2.lag = 50;
const ds = new DataSource(master, [slave1, slave2]);

console.log('===== 1. 写操作路由主库 + 复制到从库 =====');
ds.write('user:1', { name: '张三', v: 1 });
console.log('stats:', JSON.stringify(ds.stats));

console.log('\\n===== 2. 读操作轮询从库 =====');
console.log('读1:', ds.read('user:1').from);
console.log('读2:', ds.read('user:1').from);

console.log('\\n===== 3. 写后立即读（强制主库，避免延迟）=====');
ds.write('user:1', { name: '张三', v: 2 });
const r = ds.read('user:1');
console.log('写后读 from=' + r.from + ', reason=' + (r.reason || '无') + ', v=' + r.val.v);

console.log('\\n===== 4. 主从延迟场景（读从库可能拿到旧值）=====');
ds.masterWindow.delete('user:1');  // 清除强制主库标记
setTimeout(() => {
  ds.write('user:1', { name: '张三', v: 3 });
  // 立即读从库（从库尚未同步）
  const r2 = ds.slaves[0].read('user:1');
  console.log('写后立即读 Slave1: v=' + (r2 ? r2.v : 'null') + ' (可能旧值)');
  // 等待复制完成
  setTimeout(() => {
    const r3 = ds.slaves[0].read('user:1');
    console.log('等待复制后读 Slave1: v=' + (r3 ? r3.v : 'null'));
  }, 60);
}, 10);

console.log('\\n===== 5. 从库宕机故障转移 =====');
setTimeout(() => {
  console.log('--- Slave1 宕机 ---');
  slave1.alive = false;
  ds.healthCheck();
  console.log('读操作(轮询存活从库):', ds.read('user:1').from);
  console.log('--- 主库宕机，故障转移 ---');
  master.alive = false;
  ds.failover();
  ds.write('user:2', { name: '李四' });
  console.log('故障转移后写 user:2 成功，读:', ds.read('user:2', { forceMaster: true }).val);
  console.log('\\n最终 stats:', JSON.stringify(ds.stats));
  console.log('\\n===== 演示结束 =====');
}, 120);
`,
  },

  // =========================================================
  // 第五章：数据库连接池
  // =========================================================
  {
    id: "backend-connection-pool",
    group: "数据存储",
    icon: "🔌",
    title: "数据库连接池",
    content: `## 数据库连接池

**数据库连接池（Connection Pool）** 是应用与数据库之间的"连接缓冲区"。它预先创建一批数据库连接并复用，避免每次请求都新建/销毁连接的高昂开销。在绝大多数后端系统中，连接池是数据库访问性能的第一道关卡——配置不当，再多优化也白搭；配置得当，单机 QPS 可成倍提升。

本章将从"为什么需要连接池"讲起，覆盖连接池原理、核心参数、主流产品对比（HikariCP/Druid）、配置最佳实践、监控排障、连接泄漏防护，以及与 HTTP 客户端连接池的类比。

### 一、为什么需要连接池

#### 1.1 一次数据库连接的成本

没有连接池时，每次请求都要新建数据库连接。一次 TCP 连接 + MySQL 握手的开销惊人：

\`\`\`
应用 ──TCP 三次握手──▶ MySQL
       (1 个 RTT)
应用 ──▶ MySQL 认证握手（用户名/密码/加密协商）
       (多个 RTT)
应用 ──▶ 执行 SQL ──▶ 返回结果
应用 ──TCP 四次挥手──▶ MySQL
\`\`\`

| 步骤 | 耗时 | 说明 |
| --- | --- | --- |
| TCP 三次握手 | 0.5~1ms | 同机房 1 个 RTT |
| MySQL 认证握手 | 1~3ms | 多轮交互 |
| SQL 执行 | 1~10ms | 真正业务 |
| TCP 四次挥手 | 0.5~1ms | 关闭连接 |

可见，**建连开销（2~4ms）可能比 SQL 执行（1ms）还大**。若每个请求都新建连接，大量时间浪费在握手而非业务上。更严重的是：

- **端口耗尽**：频繁建连产生大量 TIME_WAIT，65535 个端口很快耗尽。
- **DB 负载高**：MySQL 每个新连接都要分配线程、内存，建连风暴会拖垮 DB。
- **延迟抖动**：建连耗时不稳定，导致请求延迟波动。

#### 1.2 连接池的核心价值

连接池预先创建一批连接，请求"借出"用完"归还"，复用连接：

| 收益 | 说明 | 量化 |
| --- | --- | --- |
| 消除建连开销 | 复用连接，无握手 | 单次省 2~4ms |
| 控制并发 | 池大小限制最大连接 | 保护 DB 不被打满 |
| 复用资源 | 连接预热、保活 | 减少抖动 |
| 连接管理 | 统一监控、健康检查 | 便于运维 |

举例：QPS 5000 的服务，无连接池每秒建 5000 连接，DB 线程疯涨；有连接池（20 连接），连接复用，DB 始终 20 个线程，稳如磐石。

### 二、连接池原理

#### 2.1 核心模型

\`\`\`
         ┌─────────────────────────────┐
         │       ConnectionPool         │
         │  ┌───┬───┬───┬───┬───┐      │
请求 ───▶│  │C1 │C2 │C3 │C4 │C5 │ 空闲 │──借出──▶ 业务
         │  └───┴───┴───┴───┴───┘      │
         │  ┌───┬───┐                   │
         │  │C6 │C7 │ 活跃(被借出)       │◀─归还── 业务
         │  └───┴───┘                   │
         │  maxActive=10, minIdle=2     │
         └─────────────────────────────┘
                    │
                    ▼
                数据库
\`\`\`

#### 2.2 生命周期

1. **初始化**：启动时创建 \`initialSize\` 个连接。
2. **借出（acquire/borrow）**：请求从空闲队列取连接；无空闲则等待，超时抛异常。
3. **使用**：业务执行 SQL。
4. **归还（release/return）**：用完放回空闲队列。
5. **保活（keepAlive）**：定期对空闲连接发心跳，防止被 DB/中间件断开。
6. **淘汰**：连接超时、失效时移除，补充新连接。

#### 2.3 借出与等待策略

当池中无空闲连接时，请求如何处理？

- **直接失败**：立即抛异常（fast fail）。
- **阻塞等待**：等待一段时间，有连接归还则获取，超时抛异常（最常用）。
- **创建新连接**：若未达 \`maxActive\`，新建一个（多数池的策略）。

\`\`\`java
// 伪代码：借出逻辑
Connection acquire(long maxWaitMs) {
    Connection c = idlePool.poll();       // 1. 先取空闲
    if (c != null) return c;
    if (total < maxActive) {              // 2. 未达上限，新建
        return createConnection();
    }
    // 3. 达上限，等待归还
    c = idlePool.poll(maxWaitMs, MS);     // 阻塞等待
    if (c == null) throw new TimeoutException("获取连接超时");
    return c;
}
\`\`\`

### 三、连接池核心参数详解

连接池性能 90% 由参数决定。以下是核心参数。

#### 3.1 容量参数

| 参数 | 含义 | 推荐 |
| --- | --- | --- |
| initialSize | 初始化连接数 | 2~5 |
| minIdle | 最小空闲连接 | 5~10 |
| maxActive | 最大连接数 | 按公式估算 |
| maxWait | 获取连接超时(ms) | 30000 |

- **initialSize**：启动预热的连接数，避免首批请求等待建连。
- **minIdle**：保持的最小空闲，防止低峰时连接全被回收、高峰又重建。
- **maxActive**：硬上限，超过则等待。这是保护 DB 的关键。
- **maxWait**：等待超时，超时抛异常而非无限阻塞。

#### 3.2 校验参数

| 参数 | 含义 | 开销 |
| --- | --- | --- |
| validationQuery | 心跳 SQL（如 SELECT 1） | 每次校验一次查询 |
| testOnBorrow | 借出时校验 | 高（每次借出都查） |
| testOnReturn | 归还时校验 | 中 |
| testWhileIdle | 空闲时定期校验 | 低（推荐） |
| keepAlive | 保活（发心跳） | 低 |

- **testOnBorrow**：每次借出都发 \`SELECT 1\` 校验连接有效。安全但开销大（每次多一次查询）。高可靠场景才开。
- **testWhileIdle**：后台线程定期校验空闲连接，兼顾性能与可靠性，**推荐开启**。
- **validationQuery**：MySQL 用 \`SELECT 1\`，Oracle 用 \`SELECT 1 FROM DUAL\`。

#### 3.3 超时与回收参数

| 参数 | 含义 |
| --- | --- |
| removeAbandoned | 是否回收被遗弃的连接（借出不归还） |
| removeAbandonedTimeout | 连接被借出多久视为遗弃(秒) |
| logAbandoned | 是否记录遗弃堆栈 |
| timeBetweenEvictionRunsMillis | 空闲检测间隔 |
| minEvictableIdleTimeMillis | 连接最小空闲时间（超则回收） |

#### 3.4 参数调优要点

- **maxActive 不宜过大**：连接过多会压垮 DB（DB 线程数、内存有限）。公式：\`连接数 ≈ (核心数 × 2) + 有效磁盘数\`（HikariCP 公式）。
- **testOnBorrow 慎用**：性能损耗明显，一般用 testWhileIdle 替代。
- **maxWait 必设**：避免线程无限等待拖垮应用。
- **minIdle 与 maxActive 接近**：减少连接动态创建销毁。

### 四、主流连接池对比

Java 生态有四大连接池，选型影响深远。

#### 4.1 HikariCP

当前 Spring Boot 默认连接池，性能最强。

**特点**：
- 极致性能：字节码级优化，比 Druid 快 ~25%。
- 代码精简：仅 ~130KB，无冗余依赖。
- 无监控 UI（靠 Micetrics/Prometheus 暴露指标）。

**为什么快**：
- **FastList** 替代 ArrayList，去除范围检查，invokevirtual 更少。
- **ConcurrentBag** 无锁借出设计，基于 ThreadLocal + CopyOnWriteArrayList，减少锁竞争。
- **精简的 Statement 代理**：用 Cast 代替反射。
- **微型优化**：内联、避免装箱等细节。

#### 4.2 Druid

阿里开源，功能最全，国内使用广泛。

**特点**：
- 内置监控：Web UI 展示 SQL 执行情况、慢查询、连接池状态。
- SQL 防火墙：拦截非法 SQL、防 SQL 注入。
- 丰富的过滤器：日志、统计、审计。
- 性能略逊 HikariCP，但功能强。

#### 4.3 DBCP / C3P0

老牌连接池，已不推荐新项目使用。

- **DBCP**（Apache）：配置简单，性能一般，早期 Spring 默认。
- **C3P0**：老旧，异步机制差，性能最差，基本淘汰。

#### 4.4 对比表

| 维度 | HikariCP | Druid | DBCP | C3P0 |
| --- | --- | --- | --- | --- |
| 性能 | 最高 | 高 | 中 | 低 |
| 体积 | 极小(130KB) | 中(大) | 小 | 中 |
| 监控 | 弱(靠扩展) | 强(内置UI) | 弱 | 弱 |
| SQL 防火墙 | 无 | 有 | 无 | 无 |
| 维护活跃 | 活跃 | 活跃 | 维护 | 停滞 |
| 推荐场景 | 追求性能 | 追求监控/防护 | 遗留系统 | 不推荐 |

> 选型建议：新项目默认 HikariCP（Spring Boot 自带）；需要强监控与 SQL 防护选 Druid。

### 五、HikariCP 为什么快（深度）

HikariCP 的性能优势来自多个微观优化的叠加。

#### 5.1 ConcurrentBag——无锁借出

传统连接池用 BlockingQueue 借出连接，多线程竞争同一把锁。HikariCP 的 ConcurrentBag 改用 ThreadLocal 优先：

\`\`\`java
// ConcurrentBag 借出逻辑（简化）
public T borrow(long timeout) {
    // 1. 先从当前线程的 ThreadLocal 列表取（无锁）
    List<T> list = threadList.get();
    for (int i = list.size()-1; i >= 0; i--) {
        T c = list.remove(i);
        if (c.state.compareAndSet(NOT_IN_USE, IN_USE))  // CAS 抢占
            return c;
    }
    // 2. ThreadLocal 没有，从共享队列取
    return sharedQueue.poll(timeout);
}
\`\`\`

- 线程优先复用自己用过的连接（ThreadLocal），无竞争。
- 共享队列仅作后备，竞争大幅减少。
- CAS 无锁状态切换，避免阻塞。

#### 5.2 FastList——去除范围检查

\`ArrayList.get(i)\` 每次都做范围检查（抛 IndexOutOfBoundsException）。HikariCP 的 FastList 去掉检查：

\`\`\`java
// ArrayList.get
public E get(int index) {
    if (index >= size) throw new IndexOutOfBoundsException();
    return elementData[index];
}
// FastList.get（无检查）
public E get(int index) {
    return elementData[index];
}
\`\`\`

每次借出/归还都要遍历 Statement 列表关闭，省掉检查累积可观。

#### 5.3 其他优化

- **字节码精简**：减少方法调用层级。
- **避免反射**：用接口 cast 代替反射代理。
- **代理精简**：只代理必要方法。

这些"微观优化"在每秒数万次借出场景下，累积成显著优势。

### 六、HikariCP 配置实战

\`\`\`properties
# HikariCP 推荐配置
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=10
spring.datasource.hikari.connection-timeout=30000      # 获取连接超时
spring.datasource.hikari.idle-timeout=600000           # 空闲连接超时(10min)
spring.datasource.hikari.max-lifetime=1800000          # 连接最大生命(30min)
spring.datasource.hikari.connection-test-query=SELECT 1
spring.datasource.hikari.leak-detection-threshold=60000 # 泄漏检测(60s)
\`\`\`

**关键说明**：
- **maximum-pool-size**：HikariCP 建议最小与最大相同（固定大小池），避免动态伸缩开销。
- **max-lifetime**：连接最长存活时间，到了主动重建。防止长连接累积问题（如 MySQL 8 小时断连）。要比 DB 的 \`wait_timeout\` 短。
- **leak-detection-threshold**：连接借出超过此时间未归还，记录堆栈，排查泄漏。

### 七、Druid 监控与 SQL 防火墙

Druid 的杀手锏是内置监控与防护。

#### 7.1 监控配置

\`\`\`properties
# Druid 配置
spring.datasource.druid.initial-size=5
spring.datasource.druid.max-active=20
spring.datasource.druid.min-idle=5
spring.datasource.druid.max-wait=60000
spring.datasource.druid.stat-view-servlet.login-username=admin
spring.datasource.druid.stat-view-servlet.login-password=admin
spring.datasource.druid.web-stat-filter.enabled=true
\`\`\`

访问 \`/druid\` 路径即得监控 UI，展示：
- SQL 执行次数、平均耗时、最慢 SQL。
- 连接池活跃/空闲/等待数。
- SQL 防火墙拦截记录。
- URI 访问统计。

#### 7.2 SQL 防火墙

Druid 内置 WallFilter，拦截危险 SQL：

- 禁止无 WHERE 的 UPDATE/DELETE。
- 拦截 \`TRUNCATE\`、\`DROP\` 等 DDL。
- 防 SQL 注入（基于语义分析）。
- 拦截 \`SELECT *\`（可选）。

\`\`\`xml
<bean id="wallFilter" class="com.alibaba.druid.wall.WallFilter">
    <property name="dbType" value="mysql"/>
</bean>
\`\`\`

### 八、连接池配置最佳实践

#### 8.1 最大连接数估算

**HikariCP 公式**：\`连接数 = (CPU 核心数 × 2) + 有效磁盘数\`

例：4 核 + 1 SSD = 9 个连接。这远比直觉（几十上百）少，但实测最优——因为更多连接只会增加 DB 上下文切换，而非提升吞吐。

**按 QPS/RT 估算**：\`连接数 = QPS × 平均RT(秒)\`

例：QPS 1000，RT 0.02s → 连接数 = 20。

**经验值**：
- 小型应用：5~10。
- 中型应用：10~30。
- 大型应用：30~50（单实例）。

> 误区：连接数越大越好。实际过大反而降低吞吐（DB 锁竞争、上下文切换）。从 HikariCP 公式起步，压测调优。

#### 8.2 多实例总连接数控制

微服务下，N 个实例 × M 连接 = DB 总连接数，不能超过 DB 上限（\`max_connections\`）。

\`\`\`
DB max_connections = 500
应用实例数 = 20
每实例连接池 = 500 / 20 = 25（还需留余量给其他客户端）
\`\`\`

超限会导致"连接数耗尽"，所有实例都拿不到连接。

#### 8.3 配置清单

| 参数 | 推荐值 | 说明 |
| --- | --- | --- |
| maxActive | 公式/压测 | 不宜过大 |
| minIdle ≈ maxActive | - | 固定池，减少抖动 |
| maxWait | 30000ms | 必设，防无限等待 |
| testWhileIdle | true | 推荐开启 |
| testOnBorrow | false | 性能优先 |
| maxLifetime | < DB wait_timeout | 防长连接断开 |
| leakDetection | 60000ms | 排查泄漏 |

### 九、连接池监控与排障

#### 9.1 关键监控指标

| 指标 | 含义 | 告警 |
| --- | --- | --- |
| active | 活跃连接数 | 持续=最大值告警 |
| idle | 空闲连接数 | 持续=0告警 |
| waitThreads | 等待线程数 | >0告警 |
| borrowCount | 总借出次数 | 突增告警 |
| avgWaitTime | 平均等待时间 | >100ms告警 |
| leakCount | 泄漏连接数 | >0告警 |

#### 9.2 常见故障

**1. 连接数耗尽（Pool exhausted）**
- 现象：\`Could not get JDBC Connection\`，大量请求超时。
- 原因：慢 SQL 占用连接、连接泄漏、池太小。
- 排查：看 active 是否持续满、是否有慢 SQL、泄漏堆栈。

**2. 连接失效（Connection is closed）**
- 现象：拿到连接但执行报错。
- 原因：连接被 DB/中间件断开（超时、重启），池未感知。
- 解决：开启 testWhileIdle/testOnBorrow，缩短 maxLifetime。

**3. 建连超时（Connection refused）**
- 原因：DB 宕机、网络问题、DB 连接数满。
- 排查：ping DB、看 DB \`SHOW PROCESSLIST\`。

### 十、连接泄漏与防护

**连接泄漏（Connection Leak）**：连接被借出但未归还，永久占用池中名额。泄漏积累会导致池耗尽，系统瘫痪。

#### 10.1 泄漏的成因

- **忘记 close**：手动管理连接时，异常路径漏掉 \`close()\`。
- **try 块未 finally**：业务异常跳过归还逻辑。
- **连接传到异步任务**：异步任务持有连接，主流程已结束未归还。

\`\`\`java
// 反例：泄漏
Connection conn = ds.getConnection();
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery("SELECT ...");
// 若此处抛异常，conn 永不归还 → 泄漏
return rs.getString(1);

// 正例：try-with-resources（自动 close）
try (Connection conn = ds.getConnection();
     Statement stmt = conn.createStatement();
     ResultSet rs = stmt.executeQuery("SELECT ...")) {
    return rs.getString(1);
}  // 自动归还，异常也安全
\`\`\`

#### 10.2 防护手段

1. **try-with-resources**：Java 7+ 自动关闭，**首选**。
2. **leakDetectionThreshold**：HikariCP/Druid 借出超时未归还，记录堆栈，定位泄漏代码。
3. **removeAbandoned**：Druid 强制回收借出过久的连接（兜底）。
4. **静态分析**：SonarQube 等检测未关闭资源。
5. **模板模式**：用 JdbcTemplate/MyBatis 等框架托管连接，避免手动管理。

### 十一、连接池与微服务

微服务架构下，每个服务实例都有独立连接池，需全局规划。

#### 11.1 总连接数控制

\`\`\`
DB max_connections = 1000
服务 A: 30 实例 × 20 连接 = 600
服务 B: 20 实例 × 15 连接 = 300
其他客户端(运维/BI): 100
合计 1000 → 刚好
\`\`\`

超限则所有服务受影响。需中央化管控或按服务配额。

#### 11.2 多数据源连接池

一个服务连多个库时，每个库独立池：

\`\`\`java
@Bean @Primary
DataSource primaryDs() { return buildHikari("db_primary", 20); }
@Bean
DataSource secondaryDs() { return buildHikari("db_secondary", 10); }
\`\`\`

注意总连接数叠加。

### 十二、HTTP 客户端连接池（类比）

数据库连接池的思想同样适用于 HTTP 客户端（调用第三方 API）。

#### 12.1 HTTP Keep-Alive

HTTP/1.1 默认 Keep-Alive，复用 TCP 连接发多次请求，避免每次握手。HTTP 客户端连接池管理这些复用连接。

\`\`\`java
// Java HttpClient 连接池
PoolingHttpClientConnectionManager cm = new PoolingHttpClientConnectionManager();
cm.setMaxTotal(100);           // 总连接数
cm.setDefaultMaxPerRoute(20);  // 每个路由(域名)最大连接
HttpClient client = HttpClient.custom().setConnectionManager(cm).build();
\`\`\`

#### 12.2 与 DB 连接池的异同

| 维度 | DB 连接池 | HTTP 连接池 |
| --- | --- | --- |
| 协议 | TCP + DB 协议 | TCP + HTTP |
| 复用机制 | 借出归还 | Keep-Alive |
| 路由 | 单一 DB | 多域名(每路由独立) |
| 校验 | SELECT 1 | 心跳/重连 |
| 泄漏 | 忘记 close | 响应未消费完 |

**OkHttp 连接池**：

\`\`\`kotlin
val client = OkHttpClient.Builder()
    .connectionPool(ConnectionPool(5, 5, TimeUnit.MINUTES))  // 5 连接,5 分钟保活
    .build()
\`\`\`

### 十三、TCP 连接与建连开销

理解连接池的价值，首先要理解 TCP 连接的开销。

#### 13.1 TCP 三次握手

\`\`\`
客户端                          服务端
  |                               |
  | ---- SYN (seq=x) -----------> |  第1次：客户端发起连接
  |                               |
  | <--- SYN+ACK (seq=y,ack=x+1)- |  第2次：服务端确认+发起
  |                               |
  | ---- ACK (ack=y+1) ---------> |  第3次：客户端确认
  |                               |
  | <=== 连接建立，可传输数据 ===> |
\`\`\`

**耗时**：1.5 个 RTT（Round Trip Time）。
- 同机房：RTT ~0.5ms → 建连 ~0.75ms
- 跨机房：RTT ~2ms → 建连 ~3ms
- 跨城：RTT ~30ms → 建连 ~45ms

#### 13.2 TLS 握手（如适用）

\`\`\`
TCP 三次握手后，还需 TLS 握手：
  ClientHello → ServerHello → Certificate → KeyExchange → Finished
  额外 2 个 RTT（TLS 1.2）或 1 个 RTT（TLS 1.3）
\`\`\`

#### 13.3 MySQL 认证握手

\`\`\`
TCP 连接建立后，MySQL 还有认证流程：
  1. 服务端发送握手包（Server Greeting，含 salt）
  2. 客户端发送认证包（用户名+加密密码）
  3. 服务端返回 OK 或 Error

额外 1 个 RTT
\`\`\`

#### 13.4 总建连开销

\`\`\`
不使用连接池，每次查询建连：
  TCP 握手（1.5 RTT）+ MySQL 认证（1 RTT）+ 查询（1 RTT）+ 关闭（1 RTT）
  = 4.5 RTT

使用连接池：
  查询（1 RTT）
  = 1 RTT

跨机房场景（RTT 2ms）：
  无连接池：4.5 × 2 = 9ms
  有连接池：1 × 2 = 2ms
  每次查询省 7ms！

1000 QPS：
  无连接池：每秒 1000 次建连 → 9 秒 CPU 时间
  有连接池：连接复用 → 几乎 0 建连开销
\`\`\`

#### 13.5 TIME_WAIT 问题

\`\`\`
频繁建连断开会导致大量 TIME_WAIT：
  客户端关闭连接后进入 TIME_WAIT，持续 2MSL（60秒）
  每个连接占一个端口，端口范围 32768-60999（约 28000 个）
  高频率短连接 → 端口耗尽 → 无法新建连接

解决：
  1. 使用连接池（根本解决）
  2. 开启 TCP 复用：net.ipv4.tcp_tw_reuse = 1
  3. 减小 TIME_WAIT 超时：net.ipv4.tcp_fin_timeout = 15
\`\`\`

### 十四、连接池核心参数详解

#### 14.1 关键参数

| 参数 | HikariCP | Druid | 说明 |
| --- | --- | --- | --- |
| 最大连接数 | maximumPoolSize | maxActive | 连接池上限 |
| 最小空闲连接 | minimumIdle | minIdle | 保持的最小空闲连接 |
| 获取连接超时 | connectionTimeout | maxWait | 超时抛异常 |
| 空闲超时 | idleTimeout | minEvictableIdleTimeMillis | 空闲连接回收 |
| 最大生命周期 | maxLifetime | maxEvictableIdleTimeMillis | 连接最大存活时间 |
| 连接有效性检查 | connectionTestQuery | validationQuery | 心跳 SQL |

#### 14.2 参数调优原理

**最大连接数（maxActive/maximumPoolSize）**：

\`\`\`
公式：maxActive = (核心数 × 2 + 有效磁盘数)

原理：
  - CPU 密集型：连接数 ≈ 核心数 + 1（多了反而上下文切换浪费）
  - IO 密集型：连接数 ≈ 核心数 × (1 + IO等待/CPU时间)
  - 数据库查询是 IO 密集型，经验值是核心数 × 2

例：8 核 CPU → maxActive ≈ 8 × 2 = 16
\`\`\`

**PostgreSQL 官方公式**：
\`\`\`
connections = ((core_count * 2) + effective_spindle_count)

effective_spindle_count：
  - HDD：磁盘数（1 个 HDD = 1）
  - SSD：算作 1（SSD 无机械寻道，并发不受限）
  - RAID 10：磁盘数 / 2

例：8 核 + 1 SSD → (8 × 2) + 1 = 17
\`\`\`

**为什么不能设太大**：

\`\`\`
maxActive = 1000 的危害：
  1. 数据库端：1000 个连接 × 每连接 ~10MB 内存 = 10GB
  2. CPU 上下文切换：1000 线程竞争 → 大量调度开销
  3. 锁竞争：连接越多，行锁冲突越多
  4. 反而降低吞吐量（拐点效应）

实测：8C16G 的 MySQL，连接数 16 时 QPS 最高
      连接数 100 时 QPS 下降 30%
      连接数 500 时 QPS 下降 60%
\`\`\`

**最小空闲连接（minIdle/minimumIdle）**：

\`\`\`
建议：minIdle = maxActive / 4 ~ maxActive / 2

作用：
  - 避免低峰期连接全被回收，高峰期重新建连
  - 保持一定预热连接，应对突发流量

HikariCP 建议：minimumIdle = maximumPoolSize（不区分，简化管理）
\`\`\`

**连接最大生命周期（maxLifetime）**：

\`\`\`
建议：28800 秒（8 小时，略小于 MySQL 的 wait_timeout 28800）

为什么需要 maxLifetime：
  1. 防止连接老化（网络设备可能静默断开长连接）
  2. 防止 MySQL wait_timeout 超时断连
  3. 均衡负载（避免所有连接同一时间创建和销毁）

HikariCP 会添加随机偏移（±60秒），避免所有连接同时回收：
  maxLifetime = 28800 + random(0, 60)
\`\`\`

#### 14.3 连接有效性检查

\`\`\`
策略：
  1. 借出时检查：每次 getConnection 都执行 testQuery → 增加 1 个 RTT 开销
  2. 空闲时检查：定时对空闲连接执行 testQuery → 适合长空闲连接
  3. 不检查：依赖 TCP keepalive → 最快，但可能拿到已断开的连接

HikariCP 优化：
  - 使用 JDBC4 的 isValid() 方法（不需要执行 SQL）
  - 只在借出超过 500ms 未使用的连接时检查
  - 最小化检查开销
\`\`\`

### 十五、HikariCP 源码级剖析

HikariCP 是性能最高的 Java 连接池，其优化值得深入研究。

#### 15.1 ConcurrentBag——无锁并发容器

HikariCP 自研的 ConcurrentBag 是性能关键：

\`\`\`java
// 传统连接池用 LinkedBlockingQueue（加锁）
// HikariCP 用 ConcurrentBag（无锁 + ThreadLocal 优化）

public class ConcurrentBag<T> {
    // 共享队列（CopyOnWriteArrayList）
    private final CopyOnWriteArrayList<T> sharedList;
    // 线程本地缓存（ThreadLocal）
    private final ThreadLocal<List<Object>> threadList;
    // 空闲连接计数器
    private final AtomicInteger waiters;

    public T borrow(long timeout) {
        // 1. 先查 ThreadLocal（无锁，最快）
        List<Object> list = threadList.get();
        for (int i = list.size() - 1; i >= 0; i--) {
            Object entry = list.remove(i);
            T value = ((IConcurrentBagEntry) entry).get();
            if (value != null) return value;
        }

        // 2. 再查共享队列（CAS 无锁）
        for (T value : sharedList) {
            if (((IConcurrentBagEntry) value).compareAndSet(STATE_NOT_IN_USE, STATE_IN_USE)) {
                return value;
            }
        }

        // 3. 都没有，等待
        waiters.incrementAndGet();
        // ... 等待其他线程归还连接
    }
}
\`\`\`

**性能优势**：
- ThreadLocal 命中率 > 50%（同线程借还），无锁无竞争
- CAS 操作比 synchronized 快 3-5 倍
- 等待用 handoff（直接传递）而非队列通知

#### 15.2 FastList——去掉范围检查

\`\`\`java
// ArrayList.get(index) 有范围检查：
public E get(int index) {
    Objects.checkIndex(index, size);  // 范围检查
    return elementData[index];
}

// HikariCP 的 FastList 去掉范围检查：
public T get(int index) {
    return elementData[index];  // 无范围检查，快 ~30%
}
// 因为内部调用保证不会越界，范围检查是多余的开销
\`\`\`

#### 15.3 FastStatementList——去掉 synchronized

\`\`\`java
// JDBC 的 Statement 代理用 FastStatementList 管理而不是 ArrayList
// 因为 ArrayList 的 clear() 在某些 JDK 版本是 synchronized 的
// FastStatementList 用 volatile + CAS 替代 synchronized
\`\`\`

#### 15.4 动态代理优化

\`\`\`java
// HikariCP 用 javassist 生成代理类，而不是 JDK 动态代理
// JDK 动态代理：每次方法调用走反射，慢
// javassist：直接生成字节码，快 ~50%

// 生成的代理类大致等价于：
public class ProxyConnection$Hikari extends ProxyConnection {
    public Statement createStatement() throws SQLException {
        // 记录用于泄漏检测
        tracker.track(this);
        return delegate.createStatement();  // 直接调用，无反射
    }
}
\`\`\`

#### 15.5 连接泄漏检测

\`\`\`java
// HikariCP 连接泄漏检测机制
public Connection getConnection() {
    ProxyConnection conn = pool.borrow();
    // 记录借出时的堆栈
    conn.setStackTrace(Thread.currentThread().getStackTrace());
    // 启动定时检查
    leakTask = scheduleLeakDetection(conn);
    return conn;
}

// 定时检查：如果连接借出超过 leakDetectionThreshold（默认 0=禁用，建议 60000）
// 打印警告日志，包含借出时的堆栈
private void leakDetection(ProxyConnection conn) {
    if (System.currentTimeMillis() - conn.getBorrowTime() > leakThreshold) {
        log.warn("连接可能泄漏！借出时间: {}，堆栈: {}",
            conn.getBorrowTime(), conn.getStackTrace());
    }
}
\`\`\`

### 十六、Druid 连接池特性

Druid 是阿里巴巴开源的连接池，以监控功能见长。

#### 16.1 Druid vs HikariCP

| 特性 | HikariCP | Druid |
| --- | --- | --- |
| 性能 | 最高 | 高（略低于 HikariCP） |
| 监控 | 基础 | 最强（内置 Web 监控页面） |
| SQL 防火墙 | 无 | 有（防 SQL 注入） |
| SQL 慢查询日志 | 无 | 有（内置） |
| 连接泄漏检测 | 有 | 有 |
| 参数加密 | 无 | 有（密码加密） |
| 代码量 | ~3000 行（精简） | ~30000 行（功能多） |
| 适用 | 追求极致性能 | 需要监控和 SQL 审计 |

#### 16.2 Druid 监控

\`\`\`java
// Druid 配置
@Bean
public DataSource dataSource() {
    DruidDataSource ds = new DruidDataSource();
    ds.setUrl("jdbc:mysql://localhost:3306/db");
    ds.setUsername("root");
    ds.setPassword("password");
    ds.setMaxActive(20);
    ds.setInitialSize(5);
    ds.setMinIdle(5);

    // 监控配置
    ds.setStatViewServlet(new StatViewServlet());  // Web 监控页面
    ds.setWebStatFilter(new WebStatFilter());       // Web 关联监控

    // 慢查询
    ds.setSlowSqlMillis(1000);  // 超过 1 秒为慢查询

    // SQL 防火墙
    ds.setProxyFilters(Arrays.asList(
        new StatFilter(),      // 统计
        new WallFilter()       // SQL 防火墙
    ));
    return ds;
}

// 访问 /druid/ 即可看到监控页面
// 包括：数据源状态、SQL 执行统计、慢查询、连接池状态、SQL 防火墙日志
\`\`\`

#### 16.3 Druid SQL 防火墙

\`\`\`java
WallFilter wallFilter = new WallFilter();
WallConfig wallConfig = new WallConfig();
// 禁止没有 WHERE 的 UPDATE/DELETE
wallConfig.setUpdateWhereAllopt(false);
wallConfig.setDeleteWhereAllopt(false);
// 禁止 UNION
wallConfig.setUnionSelect(false);
// 限制条件数
wallConfig.setConditionAndAlwayTrueAllow(false);  // 禁止 1=1
wallFilter.setConfig(wallConfig);

// 自动拦截危险 SQL：
// UPDATE users SET name='hacked'  ← 无 WHERE，被拦截
// SELECT * FROM users WHERE 1=1   ← 恒真条件，可能注入
\`\`\`

### 十七、连接泄漏检测原理

#### 17.1 什么是连接泄漏

\`\`\`java
// 连接泄漏：借出连接后忘记 close
public void getUser(Long id) {
    Connection conn = dataSource.getConnection();  // 借出
    // ... 使用连接
    // 忘记 conn.close()！
    // 连接永远不归还 → 连接池耗尽 → 新请求超时
}
\`\`\`

#### 17.2 泄漏检测方法

**方法一：try-with-resources（Java 7+）**

\`\`\`java
// 正确写法：try-with-resources 自动关闭
public void getUser(Long id) {
    try (Connection conn = dataSource.getConnection()) {  // 自动 close
        try (PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE id = ?")) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new User(rs.getLong("id"), rs.getString("name"));
                }
            }
        }
    }  // conn.close() 在这里自动调用，即使异常也会关闭
}
\`\`\`

**方法二：连接池泄漏检测**

\`\`\`java
// HikariCP 泄漏检测
HikariConfig config = new HikariConfig();
config.setLeakDetectionThreshold(60000);  // 60 秒未归还视为泄漏
// 借出超过 60 秒会打印 WARN 日志，包含借出时的堆栈

// 日志示例：
// WARN  com.zaxxer.hikari.pool.ProxyConnection - Apparent connection leak detected.
//    at com.example.UserService.getUser(UserService.java:25)
//    at com.example.UserController.handle(UserController.java:10)
//    ... （完整堆栈，定位泄漏点）
\`\`\`

**方法三：PhantomReference 兜底**

\`\`\`java
// 连接对象被 GC 回收时，PhantomReference 通知连接池强制归还
// 这是最后一道防线（确保连接不永久丢失）

HikariCP 实现：
  - 每个代理连接关联一个 PhantomReference
  - 连接对象被 GC 时，PhantomReference 队列收到通知
  - 连接池检查该连接是否已归还，未归还则强制回收
\`\`\`

#### 17.3 多语言泄漏防护

\`\`\`go
// Go 用 defer 确保归还
func GetUser(db *sql.DB, id int64) (*User, error) {
    conn, err := db.Conn(context.Background())
    if err != nil {
        return nil, err
    }
    defer conn.Close()  // 函数返回时必定执行

    row := conn.QueryRowContext(context.Background(),
        "SELECT id, name FROM users WHERE id = ?", id)
    var u User
    err = row.Scan(&u.ID, &u.Name)
    return &u, err
}
\`\`\`

\`\`\`python
# Python 用 context manager
from contextlib import contextmanager

@contextmanager
def get_connection(pool):
    conn = pool.getconn()
    try:
        yield conn
    finally:
        pool.putconn(conn)  # 确保归还

# 使用
with get_connection(pool) as conn:
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = cur.fetchone()
\`\`\`

### 十八、连接池性能调优

#### 18.1 常见问题与诊断

**问题一：连接获取超时**

\`\`\`
异常：HikariPool-1 - Connection is not available, request timed out after 30000ms

排查：
  1. maxActive 是否太小？→ 适当调大
  2. 是否有慢查询占用连接？→ 查 Druid/HikariCP 监控
  3. 是否有连接泄漏？→ 开启泄漏检测
  4. 数据库是否过载？→ 检查数据库负载
\`\`\`

**问题二：连接频繁创建销毁**

\`\`\`
现象：maxActive 20，但频繁创建新连接
排查：
  1. minIdle 太小 → 调大 minIdle
  2. maxLifetime 太短 → 调大（如 28800 秒）
  3. idleTimeout 太短 → 调大
\`\`\`

**问题三：拿到无效连接**

\`\`\`
异常：Communications link failure
排查：
  1. MySQL wait_timeout 太短 → 调大或设 maxLifetime < wait_timeout
  2. 网络中间设备断开长连接 → 开启 keepAlive/testWhileIdle
  3. MySQL 重启 → 连接池需刷新
\`\`\`

#### 18.2 连接池监控

\`\`\`java
// HikariCP 监控
HikariPoolMXBean pool = dataSource.getHikariPoolMXBean();
System.out.println("活跃连接: " + pool.getActiveConnections());
System.out.println("空闲连接: " + pool.getIdleConnections());
System.out.println("等待线程: " + pool.getThreadsAwaitingConnection());
System.out.println("总连接: " + pool.getTotalConnections());

// 关键指标：
// activeConnections / maximumPoolSize > 80% → 可能需要扩容
// threadsAwaitingConnection > 0 → 连接不够用
// 活跃连接数持续不降 → 可能有泄漏
\`\`\`

\`\`\`go
// Go database/sql 内置统计
db.Stats()
// {
//   MaxOpenConnections: 20,
//   OpenConnections: 15,      // 当前打开数
//   InUse: 10,                // 使用中
//   Idle: 5,                  // 空闲
//   WaitCount: 0,             // 等待次数
//   WaitDuration: 0,          // 等待总时长
//   MaxIdleClosed: 0,         // 空闲关闭数
//   MaxLifetimeClosed: 0,     // 超时关闭数
// }
\`\`\`

#### 18.3 微服务下的连接池

\`\`\`
问题：微服务 100 个实例 × 每实例 20 连接 = 2000 连接到数据库
MySQL max_connections 默认 151 → 连接数不够

解决：
  1. 用连接池代理（如 ProxySQL/ Vitess）
     应用 → ProxySQL（连接复用）→ MySQL
     100 实例 × 20 = 2000 应用连接
     ProxySQL → MySQL 100 个后端连接（复用）

  2. 降低单实例连接数
     maxActive 从 20 降到 5-10
     用 Hystrix/Resilience4j 限流

  3. 增加数据库 max_connections
     set global max_connections = 1000;
     但太多连接会降低数据库性能（见上文）
\`\`\`

### 十九、连接池与事务

#### 19.1 事务与连接的绑定

\`\`\`java
// 事务期间不能归还连接
@Transactional
public void transfer(Long from, Long to, BigDecimal amount) {
    // getConnection() 借出连接
    accountRepo.deduct(from, amount);
    accountRepo.add(to, amount);
    // 方法返回后才提交事务并归还连接
}

// 如果事务内有远程调用，连接被占用整个远程调用时间！
@Transactional
public void badMethod(Long id) {
    User user = userRepo.findById(id);
    // 远程调用 HTTP（可能 3 秒）
    httpClient.notify(user);  // 连接被占 3 秒！
    userRepo.update(user);
}
\`\`\`

**最佳实践**：事务内不要做远程调用，保持事务短小。

#### 19.2 Spring 事务与连接池

\`\`\`java
// Spring 通过 TransactionSynchronizationManager 管理事务连接
// 事务开始时，从连接池借出连接，绑定到当前线程
// 事务结束后，归还连接

// 事务传播行为对连接的影响：
// REQUIRED（默认）：同一事务用同一连接
// REQUIRES_NEW：新事务用新连接（借出第二个连接）
// NESTED：同一连接，用 savepoint

// 注意：REQUIRES_NEW 会同时占 2 个连接
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void audit() { ... }  // 占第 2 个连接

@Transactional
public void doWork() {
    repo.update();     // 连接1
    audit();           // 连接2（REQUIRES_NEW）
    // 此时占 2 个连接！
}
\`\`\`

#### 19.3 多数据源事务

\`\`\`java
// 跨数据源事务需要 XA 或 Seata
// XA：性能差（阻塞），但强一致
// Seata AT：性能好，最终一致

// Seata AT 模式
@GlobalTransactional  // 全局事务
public void createOrder(OrderRequest req) {
    // 每个操作用各自数据源的连接
    orderService.create(req);       // DB1 的连接
    inventoryService.deduct(req);   // DB2 的连接
    accountService.deduct(req);     // DB3 的连接
    // Seata 协调全局提交/回滚
}
\`\`\`

### 二十、多语言连接池对比

#### Java 连接池

| 连接池 | 性能 | 监控 | 特点 |
| --- | --- | --- | --- |
| HikariCP | 最高 | 基础 | 精简、极致优化、Spring Boot 默认 |
| Druid | 高 | 最强 | 监控全、SQL 防火墙、阿里出品 |
| DBCP | 中 | 弱 | Apache 老牌，已过时 |
| C3P0 | 低 | 弱 | 老牌，性能差，不推荐 |

#### Go 连接池

\`\`\`go
// Go 标准库 database/sql 自带连接池
db, err := sql.Open("mysql", "user:pass@tcp(host:3306)/db")
db.SetMaxOpenConns(20)           // 最大连接数
db.SetMaxIdleConns(5)            // 最大空闲连接
db.SetConnMaxLifetime(time.Hour) // 连接最大生命周期
db.SetConnMaxIdleTime(10 * time.Minute) // 空闲超时

// Go 连接池特点：
// - 标准库自带，无需第三方
// - 配置简单
// - 无监控（需第三方库如 prometheus）
\`\`\`

#### Python 连接池

\`\`\`python
# SQLAlchemy 连接池
from sqlalchemy import create_engine
engine = create_engine(
    'mysql://user:pass@host/db',
    pool_size=10,              # 连接池大小
    max_overflow=20,           # 超出 pool_size 的最大溢出
    pool_timeout=30,           # 获取连接超时
    pool_recycle=3600,         # 连接回收时间
    pool_pre_ping=True,        # 借出前检查连接有效性
)

# psycopg2 连接池（PostgreSQL 专用）
from psycopg2 import pool
pool = pool.ThreadedConnectionPool(
    5, 20,                     # minconn, maxconn
    host='localhost', database='db', user='user', password='pass'
)
\`\`\`

#### Node.js 连接池

\`\`\`javascript
// mysql2 连接池
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'pass',
    database: 'db',
    connectionLimit: 20,        // 最大连接数
    queueLimit: 0,              // 等待队列长度（0=无限）
    waitForConnections: true,   // 连接不够时等待
});

// 使用
async function getUser(id) {
    const [rows] = await pool.execute(
        'SELECT * FROM users WHERE id = ?', [id]
    );
    return rows[0];
}
// 连接自动借出和归还
\`\`\`

### 二十一、连接池配置最佳实践

\`\`\`yaml
# 生产环境推荐配置（以 HikariCP 为例）
spring:
  datasource:
    hikari:
      maximum-pool-size: 20          # 8C→16~20
      minimum-idle: 10               # 50% of max
      connection-timeout: 30000      # 30 秒获取超时
      idle-timeout: 600000           # 10 分钟空闲超时
      max-lifetime: 28800000         # 8 小时最大生命周期
      leak-detection-threshold: 60000 # 60 秒泄漏检测
      connection-test-query: SELECT 1 # 心跳 SQL（如 JDBC4 不需要）
      validation-timeout: 5000       # 5 秒验证超时

# 监控建议：
# 1. 活跃连接数 > 80% 告警
# 2. 等待线程数 > 0 告警
# 3. 获取连接耗时 P99 > 100ms 告警
# 4. 泄漏日志出现立即排查
\`\`\`

### 二十三、HTTP/2 连接复用与多路复用

#### 23.1 HTTP/1.1 的连接瓶颈

HTTP/1.1 时代，每个请求占用一个 TCP 连接，浏览器通过并发连接（6~8 个）提升吞吐：

\`\`\`
问题：
1. 队头阻塞：前一个请求未完成，后续请求等待
2. 连接数限制：浏览器对同一域名限制 6 个并发连接
3. TCP 连接开销：每次建连 3 次握手 + TLS 4 次握手
4. 服务器连接数暴涨：1万客户端 × 6 连接 = 6 万连接

解决方案：
- 连接池（Keep-Alive 复用连接）
- 域名分片（多个域名绕过 6 连接限制）
- Spriting（合并图片为雪碧图）
- Inline（CSS/JS 内联到 HTML）
\`\`\`

#### 23.2 HTTP/2 的多路复用

HTTP/2 引入二进制分帧层，一个 TCP 连接可并行传输多个请求：

\`\`\`
HTTP/2 特性：
1. 多路复用：单连接并行多个请求/响应，无队头阻塞
2. 头部压缩：HPACK 算法压缩重复 Header
3. 服务端推送：Server 主动推送资源
4. 流优先级：为重要流分配更高优先级

连接管理变化：
- 客户端：只需 1 个 TCP 连接即可并发所有请求
- 服务器：连接数大幅减少，从 6 万降到 1 万
- 连接池：HTTP/2 下连接池大小可大幅缩小

陷阱：
- TCP 层队头阻塞：丢包会阻塞整个连接的所有流
- HTTP/2 连接不宜过长：长连接积累流量控制窗口问题
\`\`\`

#### 23.3 HTTP/2 连接池配置

\`\`\`java
// OkHttp HTTP/2 连接池配置
OkHttpClient client = new OkHttpClient.Builder()
    .connectionPool(new ConnectionPool(
        5,          // 最大空闲连接数（HTTP/2 下可减少）
        5,          // 存活时间（分钟）
        TimeUnit.MINUTES))
    .build();

// HTTP/2 下，一个连接可承载所有并发请求
// 通常 1~2 个连接即可满足高并发场景
\`\`\`

> HTTP/2 下，连接池的核心参数从"最大连接数"变为"最大流数"（每连接 100~250 个流）。

### 二十四、gRPC 连接池管理

#### 24.1 gRPC 连接模型

gRPC 基于 HTTP/2，一个 Channel（连接）可复用多个并发 RPC：

\`\`\`
gRPC 连接层次：
  Channel（1 个 TCP 连接）
    → Stream（每个 RPC 一个流，可并发）
      → Message（请求/响应消息）

与 REST 对比：
  REST: 每个请求需一个连接（或从池中借出）
  gRPC: 一个 Channel 承载所有并发 RPC，无需传统连接池

但 gRPC 仍需"Channel 池"：
  - 负载均衡：多 Channel 轮询多台服务器
  - 故障隔离：一个 Channel 故障不影响其他
  - 流控：避免单 Channel 流数过多
\`\`\`

#### 24.2 gRPC 连接池配置

\`\`\`go
// Go gRPC 连接池配置
conn, err := grpc.Dial(
    "dns:///user-service:8080",
    grpc.WithDefaultServiceConfig(\`{"loadBalancingConfig":[{"round_robin":{}}]}\`),
    grpc.WithInitialConnWindowSize(1<<24),     // 初始流控窗口 16MB
    grpc.WithInitialWindowSize(1<<24),          // 初始流控窗口
    grpc.WithMaxRecvMsgSize(64*1024*1024),     // 最大接收 64MB
    grpc.WithKeepaliveParams(keepalive.ClientParameters{
        Time:                10 * time.Second,  // 10 秒发心跳
        Timeout:             3 * time.Second,   // 心跳超时 3 秒
        PermitWithoutStream: true,              // 无流时也发心跳
    }),
)

// gRPC 内部自动管理连接池，无需手动管理
// 一个 Conn 对象内部维护多个 HTTP/2 连接
\`\`\`

#### 24.3 gRPC 连接池陷阱

1. **DNS 缓存**：gRPC 默认缓存 DNS 结果，后端扩容后不感知。需配置定期 DNS 刷新。
2. **连接重建开销**：gRPC 建连含 HTTP/2 握手 + TLS，比 TCP 重。避免频繁重建。
3. **流控背压**：大消息传输时，流控窗口耗尽会阻塞。需调大 InitialWindowSize。
4. **Keep-Alive 冲突**：客户端心跳间隔 < 服务端最小间隔时，服务端发送 GOAWAY 断连。

### 二十五、Service Mesh 下的连接管理

#### 25.1 Sidecar 代理模式

Service Mesh（如 Istio）在应用旁部署 Sidecar 代理（Envoy），所有流量经代理转发：

\`\`\`
应用 → Sidecar(Envoy) → 网络 → Sidecar(Envoy) → 应用

连接管理变化：
  应用到 Sidecar: localhost 短连接（无建连开销）
  Sidecar 到 Sidecar: 长连接池（Envoy 管理连接池）

应用侧：
  - 不再需要管理连接池（Envoy 代管）
  - 只需连本地 Envoy（127.0.0.1:15001）
  - 连接池配置转移到 Envoy

Envoy 侧：
  - 维护到每个上游服务的连接池
  - 自动熔断、重试、负载均衡
  - 连接池参数在 VirtualService/DestinationRule 配置
\`\`\`

#### 25.2 Envoy 连接池配置

\`\`\`yaml
# Istio DestinationRule 连接池配置
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: user-service-pool
spec:
  host: user-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100          # 最大 TCP 连接数
        connectTimeout: 5s           # 建连超时
        tcpKeepalive:
          time: 7200s
          interval: 75s
          probes: 9
      http:
        http1MaxPendingRequests: 1000  # HTTP/1 等待队列
        http2MaxRequests: 1000         # HTTP/2 最大并发流
        maxRequestsPerConnection: 100  # 每连接最大请求数（后关闭重连）
        maxRetries: 3                  # 最大重试次数
        idleTimeout: 60s               # 空闲超时
    outlierDetection:
      consecutiveErrors: 5             # 连续错误熔断阈值
      interval: 10s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
\`\`\`

#### 25.3 Service Mesh 连接管理的利弊

优势：
- **统一管理**：所有服务连接池配置集中在控制面。
- **语言无关**：Java/Go/Python 服务共用一套连接管理策略。
- **熔断降级**：Envoy 自动熔断故障实例，应用无感知。

劣势：
- **额外跳数**：每次请求多两跳（本地 Envoy × 2），增加 ~1ms 延迟。
- **资源开销**：每个 Pod 多一个 Envoy 容器，内存增加 ~50~100MB。
- **调试复杂**：连接问题需排查 Envoy 日志和 xDS 配置。

### 二十六、连接池压测方法论

#### 26.1 压测目标

\`\`\`
1. 确定最优连接池大小（maxActive）
   → 太小：请求排队，RT 上升
   → 太大：DB 连接数耗尽，上下文切换开销

2. 确定连接池其他参数
   → maxWait: 获取超时
   → minIdle: 最小空闲
   → maxLifetime: 最大生命周期

3. 验证泄漏检测有效性
   → 模拟泄漏，观察是否告警

4. 验证故障恢复能力
   → DB 重启后连接池能否自动恢复
\`\`\`

#### 26.2 压测步骤

\`\`\`
步骤1: 基准测试
  - 固定连接池大小（如 10），逐步增加并发
  - 记录 QPS、RT、错误率、连接等待时间
  - 找到当前配置下的拐点

步骤2: 参数扫描
  - maxActive 从 5 扫到 50（步长 5）
  - 每个配置压测 5 分钟，记录指标
  - 绘制 QPS-maxActive 和 RT-maxActive 曲线

步骤3: 确定最优点
  - QPS 不再增长且 RT 开始上升的拐点 = 最优 maxActive
  - 经验公式验证: maxActive ≈ (核心数 × 2 + 磁盘数)

步骤4: 长时间稳定性测试
  - 最优配置下连续压测 24 小时
  - 监控连接泄漏、内存、GC
  - 验证连接池在长期运行下的稳定性

步骤5: 故障注入
  - 压测中杀掉 DB 进程，观察连接池行为
  - 验证连接失效检测和重建机制
\`\`\`

#### 26.3 关键指标监控

\`\`\`
连接池指标：
  - activeCount: 活跃连接数（应 < 80% maxActive）
  - idleCount: 空闲连接数
  - waitQueueLength: 等待队列长度（应 = 0）
  - borrowedCount/returnedCount: 借出/归还次数
  - leakCount: 泄漏连接数（应 = 0）

数据库指标：
  - Threads_connected: DB 当前连接数
  - Threads_running: DB 活跃线程数
  - Aborted_clients: 异常断开的客户端
  - Max_used_connections: 历史最大连接数

应用指标：
  - 获取连接耗时 P99（应 < 10ms）
  - 查询执行耗时 P99
  - 请求总耗时 P99
\`\`\`

### 二十七、连接池与 Serverless/函数计算

#### 27.1 Serverless 下的连接池挑战

\`\`\`
传统应用：
  - 长驻进程，连接池预热后复用
  - 1 个应用实例 = 1 个连接池 = N 个 DB 连接

Serverless（Lambda/函数计算）：
  - 函数实例短暂存活（秒级~分钟级）
  - 实例数量随并发弹性伸缩（0~1000+）
  - 每个实例都有自己的连接池

问题：
  1000 个函数实例 × 5 连接/实例 = 5000 DB 连接 → DB 连接数耗尽！

解决方案：
1. 连接池缩小：函数实例 maxActive=1~2
2. 连接复用：利用函数执行上下文复用（实例不销毁时复用连接）
3. RDS Proxy / PgBouncer：引入连接代理层，复用 DB 连接
4. Serverless DB：Aurora Serverless 等按需扩缩连接
\`\`\`

#### 27.2 RDS Proxy 方案

\`\`\`
函数实例(1000个) → RDS Proxy(连接池代理) → RDS DB(100连接)

RDS Proxy 特性：
  - 多路复用：多个函数实例共享 DB 连接
  - 连接复用：函数实例销毁后，DB 连接归还 Proxy 池
  - 故障转移：DB 故障时自动路由到备用实例
  - 安全：IAM 认证，无需硬编码 DB 密码

配置：
  - Proxy 最大连接数: 90% × DB max_connections
  - 函数连接超时: 10 秒（等 Proxy 分配连接）
  - 函数 maxActive: 1（单连接即可，Proxy 做多路复用）
\`\`\`

#### 27.3 函数中连接池的最佳实践

\`\`\`javascript
// AWS Lambda Node.js 连接池最佳实践
const mysql = require('mysql2/promise');

// 在 handler 外初始化连接池（利用执行上下文复用）
let pool;

async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 1,        // 函数内只 1 个连接
      queueLimit: 0,
      connectTimeout: 10000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
    console.log('连接池已创建');
  }
  return pool;
}

exports.handler = async (event) => {
  const pool = await getPool();
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [event.userId]);
  return rows[0];
  // 不调用 pool.end()！让连接池随实例复用
};
\`\`\`

> Serverless 下，连接管理的核心是"Proxy 代理 + 函数内单连接"。让 Proxy 承担连接池职责，函数保持轻量。

### 二十八、连接池与异步编程

#### 28.1 同步 vs 异步连接池

\`\`\`
同步连接池（传统 JDBC）：
  - 线程绑定连接：一个线程借一个连接，阻塞等待 DB 响应
  - 连接数 = 线程数 = 并发数
  - 高并发下线程数暴涨，上下文切换开销大

异步连接池（R2DBC/Reactive）：
  - 连接不绑定线程：借出连接后线程释放，DB 响应后回调
  - 连接数 = 并发 DB 操作数（与线程数解耦）
  - 少量线程支撑高并发，资源利用率高
\`\`\`

#### 28.2 R2DBC 连接池

\`\`\`java
// Spring WebFlux + R2DBC 异步连接池
@Configuration
public class R2DBCConfig {
    @Bean
    public ConnectionFactory connectionFactory() {
        ConnectionFactoryOptions options = builder()
            .option(DRIVER, "mysql")
            .option(HOST, "localhost")
            .option(PORT, 3306)
            .option(USER, "root")
            .option(PASSWORD, "pass")
            .option(DATABASE, "mydb")
            .build();

        return new ConnectionPool(
            ConnectionPoolConfiguration.builder()
                .connectionFactories(new MySqlConnectionFactory(options))
                .maxSize(20)                // 最大连接数
                .minSize(5)                 // 最小空闲
                .maxIdleTime(Duration.ofMinutes(30))
                .maxLifeTime(Duration.ofHours(8))
                .build()
        );
    }
}

// 异步查询（非阻塞）
public Flux<User> findAllUsers() {
    return databaseClient.sql("SELECT * FROM users")
        .map((row, meta) -> new User(row.get("id", Long.class), row.get("name", String.class)))
        .all();
}
\`\`\`

#### 28.3 异步连接池的优势

\`\`\`
1. 高并发低线程：
   传统: 1000 并发 = 1000 线程 = 1000 连接
   异步: 1000 并发 = 50 线程 = 50 连接（事件驱动复用）

2. 背压支持：
   Reactive Streams 背压机制，消费者按需拉取数据
   避免大结果集撑爆内存

3. 流式处理：
   数据库游标 → 逐行处理 → 释放连接
   适合大数据量 ETL 场景

陷阱：
   - 异步不等于快：单次查询 RT 与同步相当
   - 调试复杂：调用栈不直观，错误追踪困难
   - 生态成熟度：R2DBC 仍在发展中，部分 DB 驱动不完善
\`\`\`

### 二十九、连接池的未来趋势

#### 29.1 趋势一：智能连接池

\`\`\`
AI 驱动的动态调参：
  - 实时监控 QPS、RT、连接利用率
  - 机器学习模型预测最优连接池大小
  - 自动扩缩容，无需人工调优

实现思路：
  1. 采集指标: 每秒 active/idle/wait 数
  2. 训练模型: 历史数据训练 RL（强化学习）模型
  3. 实时决策: 模型输出 maxActive 调整建议
  4. 热更新: 不重启应用动态调整参数
\`\`\`

#### 29.2 趋势二：连接即服务

\`\`\`
云原生连接管理：
  - DB 连接由云平台管理（RDS Proxy/Serverless DB）
  - 应用只需声明连接需求，平台自动满足
  - 连接池配置从应用代码移到基础设施层

未来愿景：
  应用代码:
    @DataSource(name="user-db", maxConnections="auto")
    User findById(Long id) { ... }

  平台自动：
    - 根据流量弹性调整连接数
    - 故障自动转移
    - 多租户连接隔离
    - 连接计量计费
\`\`\`

#### 29.3 趋势三：eBPF 加速连接

\`\`\`
eBPF（扩展伯克利包过滤器）在内核态处理网络包：
  - 绕过内核协议栈部分开销
  - 连接建连延迟降低 30%~50%
  - 连接保活心跳在内核态完成，无用户态开销

应用场景：
  - 高频短连接（如 Serverless）
  - 低延迟交易系统
  - Service Mesh 数据面加速
\`\`\`

### 三十、小结

连接池是后端性能的基础设施——它用"复用"消除建连开销，用"限流"保护数据库。掌握原理（借出/归还/保活）、核心参数（maxActive/maxWait/testWhileIdle）、主流选型（HikariCP 性能优先，Druid 监控优先）、配置公式（核心数×2+磁盘数）、泄漏防护（try-with-resources），才能让数据库访问稳如磐石。至此，数据存储分组的核心主题——Redis、缓存、分库分表、读写分离、连接池——已全部讲完，它们共同构成了后端数据层的完整知识体系。`,
    code: `// ============================================================
// 数据库连接池 —— ConnectionPool 借出/归还/心跳/泄漏检测
// ============================================================

// ---------- 模拟数据库连接 ----------
class Connection {
  constructor(id) {
    this.id = id;
    this.alive = true;
    this.lastUsed = Date.now();
    this.borrowedAt = 0;
  }
  async query(sql) {
    if (!this.alive) throw new Error('连接 ' + this.id + ' 已失效');
    const delay = 5 + Math.floor(Math.random() * 15);  // 5~20ms 模拟查询
    await new Promise(r => setTimeout(r, delay));
    this.lastUsed = Date.now();
    return { sql, rows: Math.floor(Math.random() * 10), connId: this.id };
  }
  close() { this.alive = false; }
}

// ---------- 连接池 ----------
class ConnectionPool {
  constructor({ minSize = 3, maxSize = 8, maxWait = 1000, idleTimeout = 200, leakThreshold = 300 }) {
    this.minSize = minSize;
    this.maxSize = maxSize;
    this.maxWait = maxWait;
    this.idleTimeout = idleTimeout;
    this.leakThreshold = leakThreshold;
    this.idle = [];        // 空闲连接
    this.active = new Map();  // 借出连接: conn -> 借出时间
    this.waiters = [];     // 等待队列
    this.totalCreated = 0;
    this.stats = { borrowed: 0, returned: 0, created: 0, leaked: 0, waitCount: 0, totalWaitMs: 0 };
    this._init();
    this._startKeepAlive();
    this._startLeakDetection();
  }
  _init() {
    for (let i = 0; i < this.minSize; i++) this.idle.push(this._create());
  }
  _create() {
    this.stats.created++;
    return new Connection(++this.totalCreated);
  }
  // 借出连接
  async acquire() {
    // 1. 有空闲直接取
    if (this.idle.length > 0) {
      const conn = this.idle.pop();
      this.active.set(conn, Date.now());
      this.stats.borrowed++;
      return conn;
    }
    // 2. 未达上限，新建
    if (this.idle.length + this.active.size < this.maxSize) {
      const conn = this._create();
      this.active.set(conn, Date.now());
      this.stats.borrowed++;
      return conn;
    }
    // 3. 达上限，等待
    this.stats.waitCount++;
    const start = Date.now();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const idx = this.waiters.indexOf(resolve);
        if (idx >= 0) this.waiters.splice(idx, 1);
        reject(new Error('获取连接超时(' + this.maxWait + 'ms), 活跃=' + this.active.size));
      }, this.maxWait);
      this.waiters.push((conn) => {
        clearTimeout(timer);
        this.stats.totalWaitMs += Date.now() - start;
        this.active.set(conn, Date.now());
        this.stats.borrowed++;
        resolve(conn);
      });
    });
  }
  // 归还连接
  release(conn) {
    if (!this.active.has(conn)) return;  // 已归还/无效
    this.active.delete(conn);
    this.stats.returned++;
    if (conn.alive && this.idle.length < this.maxSize) {
      this.idle.push(conn);
    } else {
      conn.close();
    }
    // 唤醒等待者
    if (this.waiters.length > 0 && this.idle.length > 0) {
      const next = this.idle.pop();
      const waiter = this.waiters.shift();
      waiter(next);
    }
  }
  // 空闲心跳保活
  _startKeepAlive() {
    this._keepAliveTimer = setInterval(() => {
      const now = Date.now();
      this.idle = this.idle.filter(conn => {
        if (now - conn.lastUsed > this.idleTimeout && this.idle.length > this.minSize) {
          conn.close();  // 回收过多空闲
          return false;
        }
        return true;
      });
    }, this.idleTimeout);
    if (this._keepAliveTimer.unref) this._keepAliveTimer.unref();
  }
  // 泄漏检测
  _startLeakDetection() {
    this._leakTimer = setInterval(() => {
      const now = Date.now();
      for (const [conn, t] of this.active) {
        if (now - t > this.leakThreshold) {
          this.stats.leaked++;
          console.log('  [泄漏检测] 连接 ' + conn.id + ' 借出 ' + (now - t) + 'ms 未归还，疑似泄漏');
        }
      }
    }, 100);
    if (this._leakTimer.unref) this._leakTimer.unref();
  }
  // 关闭连接池，清理定时器
  close() {
    if (this._keepAliveTimer) clearInterval(this._keepAliveTimer);
    if (this._leakTimer) clearInterval(this._leakTimer);
    this.idle.forEach(c => c.close());
    this.idle = [];
  }
  status() {
    return {
      idle: this.idle.length, active: this.active.size,
      total: this.idle.length + this.active.size,
      waiters: this.waiters.length, ...this.stats
    };
  }
}

// ===== 演示 =====
const pool = new ConnectionPool({ minSize: 2, maxSize: 4, maxWait: 500, leakThreshold: 150 });

console.log('===== 1. 初始连接池 =====');
console.log('status:', JSON.stringify(pool.status()));

console.log('\\n===== 2. 借出并执行查询 =====');
const c1 = await pool.acquire();
const r1 = await c1.query('SELECT * FROM users');
console.log('查询结果:', JSON.stringify(r1));
pool.release(c1);
console.log('归还后 status:', JSON.stringify(pool.status()));

console.log('\\n===== 3. 高并发借出（池满排队）=====');
const tasks = [];
for (let i = 0; i < 6; i++) {
  tasks.push((async () => {
    const c = await pool.acquire();
    await c.query('SELECT ' + i);
    pool.release(c);
    return i;
  })());
}
const order = await Promise.all(tasks);
console.log('6 个并发任务完成, 顺序:', order.join(','));
console.log('status(有等待):', JSON.stringify(pool.status()));

console.log('\\n===== 4. 连接泄漏检测 =====');
const leakConn = await pool.acquire();
console.log('借出连接 ' + leakConn.id + ' 不归还(模拟泄漏)');
await new Promise(r => setTimeout(r, 200));  // 等泄漏检测触发
console.log('status:', JSON.stringify(pool.status()));
pool.release(leakConn);  // 归还泄漏连接

console.log('\\n===== 5. 获取超时（池满且无归还）=====');
const holders = [];
for (let i = 0; i < pool.maxSize; i++) holders.push(await pool.acquire());
console.log('占满 ' + pool.maxSize + ' 个连接');
try {
  await pool.acquire();  // 应超时
} catch (e) {
  console.log('预期超时:', e.message);
}
holders.forEach(c => pool.release(c));
console.log('全部归还后 status:', JSON.stringify(pool.status()));

pool.close();
console.log('\\n===== 演示结束 =====');
`,
  },
  // __APPEND_CHAPTERS_HERE__
];