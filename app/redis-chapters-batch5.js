// =============================================================
// 《Redis 实战教程》- 章节批次 5
// -------------------------------------------------------------
// 内容：第五部分 应用场景实战（第 20-25 章）
// =============================================================

const chapters = [
  {
    id: "redis-ch20",
    group: "第五部分 应用场景实战",
    icon: "💾",
    title: "第 20 章 缓存模式",
    content: `# 第 20 章 缓存模式

Redis 最常见的用途就是缓存。但"加个缓存"远不是 SET/GET 那么简单——缓存用得不好，会出现**穿透、击穿、雪崩**等经典问题，甚至把数据库搞挂。本章把缓存的核心模式、三大经典问题、对应解决方案讲透。

## 20.1 Cache-Aside（旁路缓存）

**Cache-Aside** 是最常用的缓存模式：应用代码同时维护缓存和数据库。

### 读写流程

**读**：
1. 先查缓存，命中直接返回
2. 未命中，查数据库
3. 把数据库结果写回缓存（带 TTL）
4. 返回数据

**写**：
1. 更新数据库
2. **删除缓存**（不是更新缓存）

\`\`\`javascript
// 读流程（Node.js 伪代码）
async function getUser(id) {
  const cacheKey = \`user:\${id}\`;
  let data = await redis.get(cacheKey);
  if (data) return JSON.parse(data);  // 命中

  // 未命中查 DB
  data = await db.query("SELECT * FROM users WHERE id = ?", [id]);
  if (data) {
    await redis.set(cacheKey, JSON.stringify(data), "EX", 3600);  // 1h TTL
  }
  return data;
}

// 写流程：先更 DB，再删缓存
async function updateUser(id, newData) {
  await db.update("users", id, newData);
  await redis.del(\`user:\${id}\`);
}
\`\`\`

> **关键问题：为什么是"删缓存"而不是"更新缓存"？**
> - 更新缓存：并发场景下 A、B 两个写请求交错，缓存可能存到旧值
> - 删缓存：下次读会从 DB 重新加载，懒加载更安全
> - 还能节省内存：不常用的 key 不占缓存

### Cache-Aside 的一致性问题

经典并发场景：

\`\`\`text
线程 A 读缓存未命中 → 查 DB 得到旧值
                                  线程 B 更新 DB → 删缓存
线程 A 把旧值写回缓存（脏数据！）
\`\`\`

**缓解**：给缓存加 TTL（最终一致），或用**延迟双删**：

\`\`\`javascript
async function updateUserSafe(id, newData) {
  await redis.del(\`user:\${id}\`);   // 先删一次
  await db.update("users", id, newData);
  await sleep(500);                  // 等读线程写完
  await redis.del(\`user:\${id}\`);   // 再删一次
}
\`\`\`

## 20.2 Read-Through / Write-Through

**Read-Through** 和 **Write-Through** 把缓存作为"唯一入口"，应用只跟缓存打交道，缓存自己负责和 DB 同步。

### Read-Through

应用读缓存，缓存未命中时由**缓存组件**去查 DB 并回填。

\`\`\`text
应用 ──读──▶ 缓存层 ──miss──▶ DB
                ▲              │
                └──回填────────┘
\`\`\`

### Write-Through

应用写缓存，缓存层**同步**写 DB，两者都成功才返回。

\`\`\`text
应用 ──写──▶ 缓存层 ──同步写──▶ DB
                │
                └──更新缓存
\`\`\`

### 对比

| 模式 | 一致性 | 复杂度 | 适用 |
| --- | --- | --- | --- |
| Cache-Aside | 最终一致 | 低（应用维护） | 大多数场景 |
| Read-Through | 最终一致 | 中（缓存组件支持） | 读多写少 |
| Write-Through | 强一致 | 高（同步写慢） | 一致性要求高 |

> Redis 本身不直接提供 Read/Write-Through，需要客户端或代理层（如 Redis Cluster Proxy）实现。生产常用 Cache-Aside 即可。

## 20.3 Write-Behind（Write-Back）

**Write-Behind** 也叫异步写：写请求只写缓存，**异步**批量刷回 DB。

\`\`\`text
应用 ──写──▶ 缓存层（立即返回）
                │
                └─异步─▶ DB（批量刷）
\`\`\`

### 优点

- **写性能极高**（不需要等 DB）
- 可以合并写、削峰填谷

### 缺点

- **数据可能丢**：缓存宕机还没刷盘的数据没了
- **一致性问题**：DB 落后缓存

> **适用场景**：计数器、日志写入、监控指标等容忍丢失的数据。Redis 自身的 AOF 就是 Write-Behind 思想（先写内存，异步刷盘）。

## 20.4 缓存穿透（不存在的 key）

**缓存穿透**：查询一个**根本不存在**的 key，缓存和 DB 都没有，每次请求都打到 DB。

\`\`\`text
攻击者：GET user:99999999（不存在的 ID）
缓存：miss → DB：miss → 返回 null
攻击者重复 N 次 → DB 被打挂
\`\`\`

### 解决方案 1：缓存空值

查 DB 没结果时，把 \`null\` 缓存起来（带短 TTL），下次直接命中。

\`\`\`javascript
async function getUser(id) {
  const cacheKey = \`user:\${id}\`;
  let data = await redis.get(cacheKey);
  if (data !== null) {
    if (data === "NULL") return null;  // 命中空值缓存
    return JSON.parse(data);
  }

  data = await db.query("SELECT * FROM users WHERE id = ?", [id]);
  if (data) {
    await redis.set(cacheKey, JSON.stringify(data), "EX", 3600);
  } else {
    // 缓存空值，TTL 短（5 分钟），防止真有人后来注册了这个 ID
    await redis.set(cacheKey, "NULL", "EX", 300);
  }
  return data;
}
\`\`\`

\`\`\`bash
# 直接用 redis-cli 设置空值标记
SET user:99999999 "" EX 300
\`\`\`

### 解决方案 2：布隆过滤器（Bloom Filter）

在缓存前加一层布隆过滤器，存所有存在的 key。请求先过布隆过滤器，**说不存在的肯定不存在**，直接拒绝。

\`\`\`bash
# Redis 4.0+ 提供 BloomFilter 模块（RedisBloom）
# 添加元素
BF.ADD users "user:1001"
BF.ADD users "user:1002"

# 检查是否存在
BF.EXISTS users "user:1001"   # 1 存在
BF.EXISTS users "user:9999"   # 0 不存在

# 批量检查
BF.MEXISTS users "user:1001" "user:9999"
1) (integer) 1
2) (integer) 0
\`\`\`

> **布隆过滤器的特点**：有误判（说存在可能不存在），无漏判（说不存在一定不存在）。误判率可调，越小越省内存。典型配置 1 亿 key、1% 误判率，仅需 ~120MB。

### 两种方案对比

| 方案 | 实现难度 | 内存占用 | 适用 |
| --- | --- | --- | --- |
| 缓存空值 | 低 | 每个不存在 key 一条 | 穿透 key 不多 |
| 布隆过滤器 | 中 | 固定（与 key 数有关） | 大量穿透攻击 |

## 20.5 缓存击穿（热点 key 过期）

**缓存击穿**：一个**热点 key** 突然过期，瞬间大量请求同时打到 DB。

\`\`\`text
热点 key "promo:1001" 过期 → 1 万个请求同时 miss → 1 万个请求查 DB → DB 雪崩
\`\`\`

### 解决方案 1：互斥锁

只让一个请求查 DB，其他请求等结果。

\`\`\`javascript
async function getHotKey(key) {
  let data = await redis.get(key);
  if (data) return JSON.parse(data);

  // 没命中，加分布式锁
  const lockKey = \`lock:\${key}\`;
  const lockOk = await redis.set(lockKey, "1", "NX", "EX", 5);
  if (lockOk) {
    try {
      // 双重检查
      data = await redis.get(key);
      if (data) return JSON.parse(data);

      data = await db.query(...);
      await redis.set(key, JSON.stringify(data), "EX", 3600);
      return data;
    } finally {
      await redis.del(lockKey);
    }
  } else {
    // 等一下再试
    await sleep(50);
    return getHotKey(key);
  }
}
\`\`\`

### 解决方案 2：永不过期 + 异步刷新

热点 key 不设 TTL，由后台任务定期刷新。

\`\`\`bash
# 设置时不带 TTL
SET promo:1001 '{"price":99}'   # 无 EX 参数

# 后台定时刷新（业务层调度）
\`\`\`

### 解决方案 3：逻辑过期

在 value 里存一个"过期时间"，到点不删 key，而是异步刷新。

\`\`\`json
{"data": {...}, "expire": 1700000000}
\`\`\`

读到 \`expire\` 过期时，发起异步刷新，当前请求返回旧值（牺牲一致性换可用性）。

## 20.6 缓存雪崩（大量 key 同时过期）

**缓存雪崩**：大量 key **同一时刻过期**，或 Redis 整体宕机，所有请求打到 DB。

### 场景 1：大量 key 同时过期

**原因**：批量预热的 key 设了相同 TTL。

**解决**：TTL 加随机扰动。

\`\`\`javascript
// 错误：所有 key 都是 3600 秒
await redis.set(key, val, "EX", 3600);

// 正确：3600 ± 300 秒
const ttl = 3600 + Math.floor(Math.random() * 600) - 300;
await redis.set(key, val, "EX", ttl);
\`\`\`

\`\`\`bash
# redis-cli 里的随机 TTL
SET k1 v1 EX 3700
SET k2 v1 EX 3500
SET k3 v1 EX 3900
\`\`\`

### 场景 2：Redis 宕机

**解决**：
- **高可用**：主从 + Sentinel / Cluster，避免单点
- **熔断降级**：DB 压力大时降级，返回默认值或排队
- **本地缓存**：应用层加 Caffeine/Guava 二级缓存，扛住 Redis 故障

### 雪崩的分层防护

\`\`\`text
应用层本地缓存（Caffeine）  ←─ 极短 TTL，扛尖峰
        │
        ▼
Redis 缓存（主）            ←─ 主要缓存
        │
        ▼
数据库                     ←─ 最后一道防线
\`\`\`

## 20.7 踩坑提示

> **坑 1：先删缓存后更 DB**。删完缓存还没更 DB 时，读线程把旧值写回缓存，造成脏数据。正确顺序：先更 DB，后删缓存。

> **坑 2：缓存 value 不带版本号**。多机房同步时无法判断哪个是最新值。建议 value 里加版本号或时间戳。

> **坑 3：大 value 缓存**。一个 key 存了 10MB 数据，每次 GET 都占带宽。把大对象拆成小 key，或用 Hash 分字段。

> **坑 4：布隆过滤器误判导致穿透**。误判率设得太高，少量"不存在"的 key 漏过去打 DB。监控 BF 的误判率，必要时扩容。

> **坑 5：缓存击穿用永不过期忘了刷新**。数据一直停留在旧版本。要有定时刷新机制。

> **坑 6：缓存雪崩只防 TTL 不防宕机**。Redis 一挂照样雪崩。必须配高可用 + 降级。

## 20.8 本章小结

- **Cache-Aside** 最常用：读 miss 查 DB 回填，写更新 DB 后删缓存
- **Read/Write-Through** 缓存层做同步，**Write-Behind** 异步刷盘性能高但可能丢
- **缓存穿透**（key 不存在）：缓存空值 或 布隆过滤器
- **缓存击穿**（热点 key 过期）：互斥锁 或 永不过期 + 异步刷新
- **缓存雪崩**（大量 key 同时过期）：TTL 加随机扰动 + 高可用 + 降级
- 生产实践：Cache-Aside + 空 value + 随机 TTL + 主从高可用`
  },
  {
    id: "redis-ch21",
    group: "第五部分 应用场景实战",
    icon: "🔒",
    title: "第 21 章 分布式锁",
    content: `# 第 21 章 分布式锁

单机锁（如 Java 的 synchronized、Go 的 mutex）只能在一个进程内生效。微服务架构下，多个服务实例同时操作共享资源（扣库存、防重复提交、定时任务），需要**分布式锁**。Redis 实现分布式锁是最常见的方案，本章讲透从 SETNX 到 Redlock 的演进，以及生产中的坑。

## 21.1 单实例锁（SETNX）

最朴素的分布式锁：**SET if Not eXists**，谁 SET 成功谁拿到锁。

### 错误写法（早期）

\`\`\`bash
SETNX lock:order 1     # 加锁
DEL lock:order          # 释放锁
\`\`\`

**问题**：拿到锁的进程崩溃了，没来得及 DEL，锁就永远存在，后续所有请求都拿不到锁。

### 正确写法：SET + NX + PX

\`\`\`bash
# 一条命令搞定：不存在才设，设过期时间，原子操作
SET lock:order <request_id> NX PX 10000
# NX：不存在才设
# PX 10000：过期 10 秒（毫秒）
# value 用唯一 ID（如 UUID），用于安全释放
\`\`\`

\`\`\`javascript
const requestId = uuid();
const ok = await redis.set("lock:order", requestId, "NX", "PX", 10000);
if (ok === "OK") {
  // 拿到锁
  try {
    // 业务逻辑
  } finally {
    // 释放锁（要验证是自己的锁）
    await releaseLock("lock:order", requestId);
  }
}
\`\`\`

### 安全释放锁（Lua 脚本）

释放锁时必须先判断 value 是不是自己的，再 DEL。**这两步必须原子**，用 Lua：

\`\`\`lua
-- unlock.lua
-- KEYS[1] = 锁的 key
-- ARGV[1] = request_id
if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("DEL", KEYS[1])
else
    return 0
end
\`\`\`

\`\`\`bash
# 执行
redis-cli --eval unlock.lua lock:order , <request_id>
\`\`\`

> **为什么不能直接 DEL？** 假设 A 拿到锁（10s 过期），业务执行了 15s，锁自动释放；B 拿到锁；这时 A 执行完业务去 DEL，把 B 的锁删了！加 value 校验就是为了避免这种情况。

## 21.2 锁的过期与续期

**核心矛盾**：锁的过期时间设多少合适？
- 设短了：业务还没执行完，锁被别人抢走
- 设长了：进程崩了，要等很久才能释放

### 解决：看门狗自动续期

业务执行期间，后台线程定期延长锁的 TTL。

\`\`\`javascript
async function acquireLockWithWatchdog(key, requestId, ttl = 10000) {
  const ok = await redis.set(key, requestId, "NX", "PX", ttl);
  if (ok !== "OK") return null;

  // 启动看门狗：每 ttl/3 续期一次
  const watchdog = setInterval(async () => {
    // 用 Lua 续期：判断是自己的锁才续
    await redis.eval(
      \`if redis.call("GET", KEYS[1]) == ARGV[1] then
          return redis.call("PEXPIRE", KEYS[1], ARGV[2])
        else return 0 end\`,
      1, key, requestId, ttl
    );
  }, ttl / 3);

  return { requestId, stop: () => clearInterval(watchdog) };
}
\`\`\`

> **Redisson 的看门狗**：默认 30s TTL，每 10s 续期一次。业务结束主动释放；进程崩溃后看门狗也停了，30s 后锁自动释放。

## 21.3 Redlock 算法

单实例锁的问题：**Redis 主挂了，锁还没同步到从**。Sentinel 切主后，新主没有锁，别人又能拿到锁，**两个客户端同时持锁**。

### Redlock 思路

**多个独立的 Redis 实例**（不是主从！），向多数派加锁成功才算成功。

\`\`\`text
Redis 节点 1 ──▶ 加锁成功
Redis 节点 2 ──▶ 加锁成功
Redis 节点 3 ──▶ 加锁失败
Redis 节点 4 ──▶ 加锁成功
Redis 节点 5 ──▶ 加锁失败

3/5 成功，且耗时 < 锁有效期 → 加锁成功
\`\`\`

### 算法步骤

1. 获取当前时间 T1
2. 依次向 N 个 Redis 实例发 \`SET key value NX PX <ttl>\`
3. 每个实例设置很短的连接超时（如 50ms）
4. 统计成功数 M，记录当前时间 T2
5. 如果 **M >= N/2+1** 且 **T2 - T1 < ttl**，加锁成功
6. 否则加锁失败，向所有实例发 DEL 释放

\`\`\`javascript
// Node.js redlock 库示例
const Redlock = require("redlock");

const redlock = new Redlock(
  [
    new Redis({ port: 7000 }),
    new Redis({ port: 7001 }),
    new Redis({ port: 7002 }),
    new Redis({ port: 7003 }),
    new Redis({ port: 7004 }),
  ],
  {
    driftFactor: 0.01,  // 时钟漂移因子
    retryCount: 3,       // 重试次数
    retryDelay: 200,     // 重试间隔
    retryJitter: 200,    // 重试抖动
  }
);

const lock = await redlock.lock("lock:order", 10000);
try {
  // 业务
} finally {
  await lock.unlock();
}
\`\`\`

### Redlock 的争议

分布式专家 Martin Kleppmann 写文质疑过 Redlock：
- **依赖时钟同步**：NTP 时钟跳变会导致锁失效
- **GC 暂停**：客户端 STW 期间锁过期，醒来后操作的是过期锁

Redis 作者 antirez 回应：大多数业务对极小概率的锁失效是可接受的，强一致场景用 ZooKeeper/etcd。

> **实践建议**：对绝大多数业务（扣库存、防重复、限流），Redis 单实例锁 + 看门狗足够；只有跨多机房、对一致性要求极高时才考虑 Redlock 或 ZK。

## 21.4 Redisson 实现

**Redisson** 是 Java 生态最成熟的 Redis 客户端，分布式锁功能开箱即用。

\`\`\`java
import org.redisson.Redisson;
import org.redisson.api.RLock;
import org.redisson.config.Config;

Config config = new Config();
config.useSingleServer().setAddress("redis://127.0.0.1:6379");
RedissonClient client = Redisson.create(config);

RLock lock = client.getLock("lock:order");
try {
    // 加锁，自动看门狗续期
    lock.lock();
    // 或指定超时：lock.lock(10, TimeUnit.SECONDS);
    // 或尝试加锁：lock.tryLock(0, 10, TimeUnit.SECONDS);

    // 业务逻辑
} finally {
    if (lock.isHeldByCurrentThread()) {
        lock.unlock();
    }
}
\`\`\`

### Redisson 锁的特性

| 特性 | 说明 |
| --- | --- |
| **可重入** | 同一线程可多次加锁，计数器记录 |
| **看门狗** | 默认 30s TTL，每 10s 续期 |
| **公平锁** | \`getFairLock\`，按请求顺序排队 |
| **读写锁** | \`getReadWriteLock\`，读多写少场景 |
| **信号量** | \`getSemaphore\`，限流 |
| **Redlock** | \`getRedLock(lock1, lock2, ...)\` |

### 可重入锁原理

Redisson 用 Hash 存储锁，field 是线程 ID，value 是重入次数：

\`\`\`bash
# 加锁 2 次
HSET lock:order <thread_id> 2
PEXPIRE lock:order 30000

# 释放一次
HINCRBY lock:order <thread_id> -1
# value 变 1，锁还在

# 再释放一次
HINCRBY lock:order <thread_id> -1
# value 变 0，DEL key
\`\`\`

## 21.5 锁的常见坑

### 坑 1：先 SETNX 后 EXPIRE（非原子）

\`\`\`bash
SETNX lock 1     # 成功
# 这时进程崩了
EXPIRE lock 10   # 没执行
# 锁永远存在！
\`\`\`

**解决**：用 \`SET key value NX PX <ms>\` 一条命令搞定。

### 坑 2：释放锁不校验 value

\`\`\`bash
# 错误：直接 DEL
DEL lock:order
\`\`\`

可能删掉别人的锁。必须用 Lua 脚本校验 + 删除。

### 坑 3：业务超时，锁被别人抢

A 拿锁 10s，业务执行 15s；第 10s 时 B 抢到锁；A 完成后 DEL 把 B 的锁删了。**用看门狗续期**避免。

### 坑 4：误把主从锁当强一致

主节点加锁后还没同步到从就挂了，从升主后没有锁。**用 Redlock 或接受最终一致**。

### 坑 5：锁粒度太粗

\`\`\`bash
# 错误：所有订单共享一把锁
SET lock:order 1 NX

# 正确：按订单 ID 加锁
SET lock:order:1001 1 NX
\`\`\`

### 坑 6：忘记处理加锁失败

\`\`\`javascript
// 错误：默认一定能拿到锁
const ok = await redis.set(lockKey, "1", "NX", "PX", 10000);
// ok 可能是 null！

// 正确：处理失败
if (ok !== "OK") {
  throw new Error("系统繁忙，请稍后重试");
}
\`\`\`

### 坑 7：网络分区导致脑裂

Redlock 也有脑裂风险。对一致性要求极高的场景（如金融转账），用 ZooKeeper 或 etcd，或数据库乐观锁兜底。

## 21.6 本章小结

- **单实例锁**：\`SET key value NX PX <ms>\`，value 用唯一 ID
- **释放锁**：必须用 Lua 校验 + DEL，避免删错
- **锁续期**：看门狗定期 PEXPIRE，避免业务超时
- **Redlock**：多实例多数派加锁，抗主从切换丢锁，但有争议
- **Redisson**：Java 生态首选，可重入、看门狗、公平锁开箱即用
- **关键坑**：原子加锁、校验释放、看门狗续期、合理粒度
- 选型：一般业务单实例锁足够；强一致用 ZK/etcd`
  },
  {
    id: "redis-ch22",
    group: "第五部分 应用场景实战",
    icon: "🚦",
    title: "第 22 章 限流器",
    content: `# 第 22 章 限流器

高并发场景下，保护后端不被流量打垮是必修课。**限流器（Rate Limiter）** 控制单位时间内的请求数量，超过阈值就拒绝或排队。本章用 Redis 实现三种主流限流算法：固定窗口、滑动窗口、令牌桶。

## 22.1 固定窗口限流

**思路**：把时间划分为固定窗口（如每分钟），每个窗口内允许 N 个请求，超过就拒绝。

### 实现（INCR + EXPIRE）

\`\`\`bash
# key = 限流对象:窗口起点
# 比如限制 user:1001 每分钟 100 次
INCR rate:user:1001:202401011200    # 自增
# 返回 1，说明是窗口第一次请求，设过期时间
EXPIRE rate:user:1001:202401011200 60
\`\`\`

\`\`\`javascript
// Node.js 实现
async function fixedWindowRateLimit(userId, limit = 100, windowSec = 60) {
  const now = Math.floor(Date.now() / 1000);
  const windowKey = Math.floor(now / windowSec);  // 窗口序号
  const key = \`rate:\${userId}:\${windowKey}\`;

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSec);  // 第一次设过期
  }
  return count <= limit;
}
\`\`\`

### 优缺点

| 优点 | 缺点 |
| --- | --- |
| 实现简单 | **临界问题**：窗口边界被刷穿 |
| 内存占用小 | 不平滑 |

**临界问题**：限制每分钟 100 次。在 0:59 发了 100 次，1:01 又发了 100 次，1 秒内 200 次请求，但两个窗口都没超阈值。

## 22.2 滑动窗口限流

**思路**：不按固定时间分窗口，而是统计**当前时刻往前推一段时间**内的请求数。

### 实现 1：ZSet（推荐）

用 ZSet 记录每个请求的时间戳，统计窗口内请求数。

\`\`\`lua
-- sliding_window.lua
-- KEYS[1] = 限流 key
-- ARGV[1] = 当前时间戳（毫秒）
-- ARGV[2] = 窗口大小（毫秒）
-- ARGV[3] = 限制数

local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])

-- 1. 移除窗口外的旧请求
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)

-- 2. 统计当前窗口内请求数
local count = redis.call('ZCARD', key)

if count < limit then
    -- 3. 未超限，记录本次请求
    redis.call('ZADD', key, now, now .. '-' .. math.random())
    redis.call('PEXPIRE', key, window)
    return 1  -- 允许
else
    return 0  -- 拒绝
end
\`\`\`

\`\`\`bash
# 执行
redis-cli --eval sliding_window.lua rate:user:1001 , \\
  $(date +%s%3N) 60000 100
\`\`\`

### 实现 2：List（简单但精度低）

\`\`\`bash
# 每次请求 LPUSH 时间戳，LTRIM 保留最近 N 个，LRANGE 看最早的一个是否在窗口内
LPUSH rate:user:1001 <ts>
LTRIM rate:user:1001 0 99   # 保留最近 100 个
# 看第 100 个的时间是否还在窗口内
\`\`\`

### 滑动窗口的优缺点

| 优点 | 缺点 |
| --- | --- |
| 平滑，无临界问题 | 实现稍复杂 |
| 精度高 | 内存占用大（每个请求一条记录） |

> **优化内存**：高 QPS 场景下 ZSet 会很大，可以**分桶**：每秒一个计数器，统计最近 60 个桶之和。

## 22.3 令牌桶

**思路**：以固定速率往桶里放令牌，桶满了就溢出；请求来时拿一个令牌，拿不到就拒绝。

\`\`\`text
       ┌────────────────┐
       │   令牌桶        │ ◀── 以 R 速率补充令牌
       │  ▓▓▓▓▓▓▓▓▓▓▓▓ │
       │  capacity=10   │
       └────────┬───────┘
                │ 取令牌
                ▼
            请求处理
\`\`\`

### 特性

- **允许突发**：桶里有令牌就能瞬间处理多个请求
- **长期平均速率**：R 个/秒

### 实现（Lua）

\`\`\`lua
-- token_bucket.lua
-- KEYS[1] = 桶 key
-- ARGV[1] = 容量
-- ARGV[2] = 当前时间戳（秒，浮点）
-- ARGV[3] = 补充速率（个/秒）
-- ARGV[4] = 本次需要的令牌数

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local now = tonumber(ARGV[2])
local rate = tonumber(ARGV[3])
local need = tonumber(ARGV[4])

local bucket = redis.call('HMGET', key, 'tokens', 'ts')
local tokens = tonumber(bucket[1]) or capacity
local ts = tonumber(bucket[2]) or now

-- 补充令牌（不能超过容量）
local delta = math.max(0, now - ts) * rate
tokens = math.min(capacity, tokens + delta)

local allowed = 0
if tokens >= need then
    tokens = tokens - need
    allowed = 1
end

redis.call('HMSET', key, 'tokens', tokens, 'ts', now)
redis.call('EXPIRE', key, 3600)
return allowed
\`\`\`

\`\`\`bash
# 执行：容量 100，速率 10/秒，需要 1 个
redis-cli --eval token_bucket.lua bucket:user:1001 , 100 $(date +%s.%N) 10 1
\`\`\`

### 三种算法对比

| 算法 | 平滑性 | 内存 | 实现难度 | 适用 |
| --- | --- | --- | --- | --- |
| 固定窗口 | 差（临界问题） | 极低 | 低 | 简单场景 |
| 滑动窗口 | 好 | 高 | 中 | API 限流 |
| 令牌桶 | 好（允许突发） | 低 | 中 | 网关、流量整形 |

## 22.4 Lua 实现限流

为什么限流要用 Lua？

1. **原子性**：读取计数 + 判断 + 写入必须原子，否则并发下会"超卖"
2. **减少 RTT**：一次网络往返完成所有操作

### 完整的分布式限流器

\`\`\`javascript
// 加载 Lua 脚本（启动时）
const rateLimitScript = \`
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])

redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
local count = redis.call('ZCARD', key)

if count < limit then
    redis.call('ZADD', key, now, now .. '-' .. ARGV[4])
    redis.call('PEXPIRE', key, window)
    return {1, limit - count - 1}
else
    return {0, 0}
end
\`;

const sha = await redis.script("LOAD", rateLimitScript);

async function rateLimit(userId, limit = 100, windowMs = 60000) {
  const now = Date.now();
  const reqId = Math.random().toString(36).slice(2);
  const result = await redis.evalsha(
    sha, 1,
    \`rate:\${userId}\`,
    now, windowMs, limit, reqId
  );
  const [allowed, remaining] = result;
  return { allowed: allowed === 1, remaining };
}
\`\`\`

### 限流的维度

\`\`\`bash
# 单用户限流：每用户每分钟 100 次
rate:user:1001

# 全局限流：每分钟 10000 次
rate:global

# 接口限流：每个 API 每分钟 1000 次
rate:api:/login

# 组合：用户 + API
rate:user:1001:api:/login
\`\`\`

### 客户端响应

限流命中后，HTTP 响应应返回：

\`\`\`http
HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1700000000
\`\`\`

## 22.5 踩坑提示

> **坑 1：固定窗口临界问题**。0:59 和 1:01 之间可能瞬间双倍流量。改用滑动窗口。

> **坑 2：限流不用 Lua**。INCR 后判断再 EXPIRE，并发下会有窗口期，导致超限。Lua 保证原子。

> **坑 3：限流 key 设计太粗**。全局限流可能让一个用户拖垮所有人；太细又起不到限流作用。按业务设计 key。

> **坑 4：ZSet 无限增长**。每个请求一条记录，QPS 高时 ZSet 几十万成员。记得 ZREMRANGEBYSCORE 清理，或分桶统计。

> **坑 5：时钟不同步**。多机部署时，各机器时间不一致会导致限流不准。用 Redis 的 TIME 命令获取服务端时间。

> **坑 6：限流命中不返回 Retry-After**。客户端不知道何时重试，可能频繁重试加重负担。

## 22.6 本章小结

- **固定窗口**：INCR + EXPIRE，简单但有临界问题
- **滑动窗口**：ZSet 记录请求时间戳，平滑但占内存
- **令牌桶**：允许突发流量，适合网关
- **必须用 Lua** 保证原子性，避免并发超卖
- 限流维度：用户、接口、全局、组合
- 命中限流返回 429 + Retry-After`
  },
  {
    id: "redis-ch23",
    group: "第五部分 应用场景实战",
    icon: "📨",
    title: "第 23 章 消息队列",
    content: `# 第 23 章 消息队列

Redis 不是专业的 MQ（不如 Kafka/RabbitMQ），但很多中小业务直接用 Redis 做轻量级消息队列，省去额外部署。本章讲三种实现方式：List、Pub/Sub、Stream，以及延时队列玩法。

## 23.1 List 实现消息队列

最朴素的队列：**生产者 LPUSH，消费者 RPOP**（FIFO）。

### 基本用法

\`\`\`bash
# 生产者
LPUSH queue:order "msg1"
LPUSH queue:order "msg2"

# 消费者
RPOP queue:order   # "msg1"
RPOP queue:order   # "msg2"
RPOP queue:order   # nil（队列空）
\`\`\`

### 阻塞式消费：BRPOP

普通 RPOP 队列空时返回 nil，消费者要不停轮询，浪费 CPU。**BRPOP 阻塞等待**：

\`\`\`bash
# 阻塞最多 30 秒，等队列有数据
BRPOP queue:order 30
# 返回 ["queue:order", "msg1"]

# 同时监听多个队列
BRPOP queue:order queue:email 30
\`\`\`

\`\`\`javascript
// Node.js 消费者循环
async function consume() {
  while (true) {
    const [queue, msg] = await redis.brpop("queue:order", 0);  // 0 = 无限等待
    console.log("收到:", msg);
    processMessage(msg);
  }
}
\`\`\`

### List 队列的优缺点

| 优点 | 缺点 |
| --- | --- |
| 简单 | 消息丢失：消费者拿到消息后崩溃，消息没了 |
| 性能高 | 不支持多消费者分组（一个消息只能被一个消费者处理） |
| 阻塞消费省 CPU | 没有 ack 机制 |

### 改进：BRPOPLPUSH（可靠队列）

\`\`\`bash
# 从 source 队列 RPOP，同时 LPUSH 到 processing 队列
BRPOPLPUSH queue:order queue:order:processing 30

# 消费者处理完后，从 processing 删除
LREM queue:order:processing 1 <msg>

# 如果消费者崩溃，processing 里有残留，可以由清理进程重新处理
\`\`\`

> Redis 6.2+ 推荐用 \`BLMOVE\` 替代 \`BRPOPLPUSH\`（后者已废弃）：
> \`\`\`bash
> BLMOVE queue:order queue:order:processing RIGHT LEFT 30
> \`\`\`

## 23.2 Pub/Sub 模式

**Pub/Sub** 是发布订阅模式：发布者发消息到频道，所有订阅者都收到。

### 基本用法

\`\`\`bash
# 终端 1：订阅
SUBSCRIBE news

# 终端 2：发布
PUBLISH news "hello"
# (integer) 1   # 返回订阅者数
\`\`\`

### 模式订阅

\`\`\`bash
# 订阅所有 user:* 频道
PSUBSCRIBE user:*:login
\`\`\`

### Pub/Sub 的限制

| 限制 | 说明 |
| --- | --- |
| **消息不持久化** | 没订阅者时发布，消息丢 |
| **离线丢消息** | 订阅者断线期间消息全丢 |
| **无 ack** | 不知道订阅者是否处理完 |
| **集群广播开销** | Cluster 下消息广播到所有节点 |

> **适用场景**：实时聊天、配置广播、即时通知。需要可靠投递用 Stream。

## 23.3 Stream 实现消息队列

**Stream** 是 Redis 5.0 引入的数据结构，专门为消息队列设计，支持**持久化、消费组、ack**，堪称"轻量级 Kafka"。

### 基本操作

\`\`\`bash
# 生产消息
XADD stream:order * user 1001 amount 99
# * 表示自动生成 ID（时间戳-序号）
# 返回 ID："1700000000000-0"

# 指定 ID
XADD stream:order 1700000000000-0 user 1001 amount 99

# 查询消息
XRANGE stream:order - +         # 所有消息
XRANGE stream:order 1700000000000-0 + COUNT 10
XREVRANGE stream:order + - COUNT 5  # 倒序

# 消息长度
XLEN stream:order
\`\`\`

### 消费者读消息（不分组）

\`\`\`bash
# XREAD：读取消息
# 从开头读
XREAD COUNT 10 STREAMS stream:order 0

# 阻塞读，只读新消息（$ 表示最后一条之后）
XREAD BLOCK 30000 COUNT 10 STREAMS stream:order $
\`\`\`

### 消费者组（重点）

**消费者组**让多个消费者分担一个 Stream 的消息：每条消息只被组内一个消费者处理。

\`\`\`bash
# 创建消费者组
# 从头开始消费
XGROUP CREATE stream:order group:order1 0
# 从最后开始（只消费新消息）
XGROUP CREATE stream:order group:order1 $
# MKSTREAM：Stream 不存在时自动创建
XGROUP CREATE stream:order group:order1 $ MKSTREAM

# 消费者读取（组内）
# > 表示未消费过的消息
XREADGROUP GROUP group:order1 consumer-1 COUNT 10 BLOCK 30000 STREAMS stream:order >
\`\`\`

### 消息确认（ack）

\`\`\`bash
# 消费者处理后必须 ack
XACK stream:order group:order1 <message_id>

# 查看未 ack 的消息（PEL）
XPENDING stream:order group:order1
# 返回：未 ack 数、最小 ID、最大 ID、消费者列表

# 查看某条未 ack 消息的详情
XPENDING stream:order group:order1 - + 10

# 重新分配给其他消费者（处理挂掉的消费者留下的消息）
XCLAIM stream:order group:order1 consumer-2 60000 <message_id>
# 60000 是最小空闲时间（毫秒），只有空闲超过这个时间的消息才会被 claim
\`\`\`

### 完整的消费循环（Node.js）

\`\`\`javascript
const Redis = require("ioredis");
const redis = new Redis();

async function consume() {
  while (true) {
    try {
      const result = await redis.xreadgroup(
        "GROUP", "group:order1", "consumer-1",
        "COUNT", 10, "BLOCK", 5000,
        "STREAMS", "stream:order", ">"
      );
      if (!result) continue;

      for (const [stream, messages] of result) {
        for (const [id, fields] of messages) {
          try {
            await processMessage(id, fields);
            await redis.xack(stream, "group:order1", id);  // ack
          } catch (err) {
            console.error("处理失败，消息留在 PEL", err);
            // 后续可以用 XCLAIM 重试
          }
        }
      }
    } catch (err) {
      console.error("消费异常", err);
      await sleep(1000);
    }
  }
}
\`\`\`

### Stream 的修剪

\`\`\`bash
# 限制 Stream 长度，老的自动删
XADD stream:order MAXLEN 1000 * user 1001 amount 99

# 近似修剪（性能更好）
XADD stream:order MAXLEN ~ 1000 * user 1001 amount 99

# 手动修剪
XTRIM stream:order MAXLEN 1000
XTRIM stream:order MINID 1700000000000-0  # 删除 ID 小于这个的
\`\`\`

### Stream vs List vs Pub/Sub

| 特性 | List | Pub/Sub | Stream |
| --- | --- | --- | --- |
| 持久化 | 是 | 否 | 是 |
| 消费者组 | 否 | 否 | 是 |
| ack | 否 | 否 | 是 |
| 消息回放 | 否 | 否 | 是 |
| 多消费者 | 否（竞争） | 是（广播） | 是（组内竞争 + 多组广播） |

> **生产建议**：可靠队列首选 Stream。List 适合简单场景；Pub/Sub 适合实时广播。

## 23.4 消费者组与消息确认

上一节已经介绍了基本用法，这里补充几个关键点：

### PEL（Pending Entries List）

每条消息被消费者读取后，会进入该消费者的 PEL，**直到被 ack 才移除**。如果消费者崩溃，PEL 里的消息不会被丢失。

\`\`\`bash
# 查看 PEL
XPENDING stream:order group:order1

# 输出：
# 1) (integer) 5    # 未 ack 总数
# 2) "1700000000000-0"  # 最早未 ack
# 3) "1700000000004-0"  # 最晚未 ack
# 4) 1) 1) "consumer-1"
#    2) "3"
#    3) "1700000000000-0"
#    4) "1700000000002-0"
#    2) 1) "consumer-2"
#    2) "2"
#    ...
\`\`\`

### XCLAIM 转移消息

\`\`\`bash
# 把 consumer-1 空闲超过 60s 的消息转给 consumer-2
XAUTOCLAIM stream:order group:order1 consumer-2 60000 0 COUNT 10
\`\`\`

### XAUTOCLAIM 自动转移

Redis 6.2+ 提供 \`XAUTOCLAIM\`，自动把"卡住"的消息转给活跃消费者：

\`\`\`bash
# 后台定时执行
XAUTOCLAIM stream:order group:order1 consumer-2 60000 0 COUNT 10
\`\`\`

### 死信队列

ack 失败次数过多（业务记录）的消息，转移到死信队列人工处理：

\`\`\`bash
# 业务层：处理失败 N 次后
XADD stream:order:dead * original_id <id> reason "max_retry"
XACK stream:order group:order1 <id>   # 从原队列移除
\`\`\`

## 23.5 延时队列（ZSet 实现）

**延时队列**：消息在指定时间后才被消费。比如"下单 30 分钟未支付自动取消"。

### 思路

用 ZSet 存消息，**score 是到期时间戳**。消费者定时扫到期消息。

\`\`\`bash
# 生产延时消息：30 分钟后执行
ZADD delay:queue <now+1800> "order:1001:timeout"

# 消费者每秒扫一次
ZRANGEBYSCORE delay:queue 0 <now> LIMIT 0 10
# 拿到到期消息后，ZREM 删除
ZREM delay:queue "order:1001:timeout"
\`\`\`

### Lua 实现（原子扫描+删除）

\`\`\`lua
-- delay_consume.lua
-- KEYS[1] = 队列 key
-- ARGV[1] = 当前时间戳
-- ARGV[2] = 一次取多少

local items = redis.call('ZRANGEBYSCORE', KEYS[1], 0, ARGV[1], 'LIMIT', 0, ARGV[2])
if #items > 0 then
    redis.call('ZREM', KEYS[1], unpack(items))
end
return items
\`\`\`

\`\`\`bash
redis-cli --eval delay_consume.lua delay:queue , $(date +%s) 10
\`\`\`

### 多消费者竞争

ZREM 返回 1 才算抢到，多个消费者同时扫不会重复处理：

\`\`\`javascript
async function consumeDelay() {
  while (true) {
    const now = Math.floor(Date.now() / 1000);
    const items = await redis.zrangebyscore("delay:queue", 0, now, "LIMIT", 0, 10);
    for (const item of items) {
      // 用 ZREM 抢占，返回 1 才处理
      const got = await redis.zrem("delay:queue", item);
      if (got === 1) {
        await processMessage(item);
      }
    }
    await sleep(1000);
  }
}
\`\`\`

### 延时队列的优化

- **分片**：单 ZSet 太大时，按业务分多个队列（\`delay:queue:order\`、\`delay:queue:email\`）
- **避免大 value**：value 只存 ID，业务数据另存
- **Stream + 延时**：Redis 6.2+ 支持给消息设 ID，可以模拟延时

## 23.6 踩坑提示

> **坑 1：List 队列丢消息**。RPOP 后消费者崩溃，消息没了。用 BRPOPLPUSH 或 Stream。

> **坑 2：Pub/Sub 当可靠 MQ 用**。订阅者一断线就丢消息。生产环境用 Stream。

> **坑 3：Stream 不 ack 导致 PEL 膨胀**。消费者处理失败没 ack，PEL 越积越多，占内存。要有重试和清理机制。

> **坑 4：Stream 无限增长**。XADD 不会自动删老消息。配 MAXLEN 修剪。

> **坑 5：延时队列 ZSet 扫描慢**。消息量大时 ZRANGEBYSCORE 慢。分片 + LIMIT 分批。

> **坑 6：消费者组创建时 Stream 不存在**。直接 XGROUP CREATE 会报错。加 MKSTREAM 选项。

> **坑 7：BLPOP 长时间阻塞占用连接**。连接池配够，或用 BLOCK 设短点（如 5 秒）循环。

## 23.7 本章小结

- **List**：LPUSH/BRPOP，简单但不可靠；BRPOPLPUSH 实现可靠队列
- **Pub/Sub**：广播模式，不持久化、不补发，适合实时通知
- **Stream**：Redis 5.0+，支持持久化、消费组、ack、消息回放，**生产首选**
- **消费者组**：多消费者分担处理，PEL 记录未 ack 消息，XCLAIM/XAUTOCLAIM 重试
- **延时队列**：ZSet score 存到期时间，定时扫描 + ZREM 抢占
- 选型：可靠 MQ 用 Stream；实时通知用 Pub/Sub；简单场景用 List`
  },
  {
    id: "redis-ch24",
    group: "第五部分 应用场景实战",
    icon: "🏆",
    title: "第 24 章 排行榜与计数器",
    content: `# 第 24 章 排行榜与计数器

排行榜（Leaderboard）是 Redis 的"杀手级应用"——ZSet 的天然能力，几行命令搞定百万用户的实时排名。计数器场景（点赞数、UV、PV）也是 Redis 的强项。本章讲透排行榜和计数器的各种玩法。

## 24.1 ZSet 实现排行榜

**ZSet（Sorted Set）** 是 Redis 的核心数据结构之一：每个元素带一个 score，按 score 排序，且元素不重复。这正是排行榜需要的。

### 基本操作

\`\`\`bash
# 添加玩家分数
ZADD leaderboard 100 player:1001
ZADD leaderboard 200 player:1002
ZADD leaderboard 150 player:1003

# 增加分数（不是覆盖）
ZINCRBY leaderboard 50 player:1001   # player:1001 变 150

# 查询玩家分数
ZSCORE leaderboard player:1001

# 查询玩家排名（从 0 开始，从小到大）
ZRANK leaderboard player:1001

# 查询玩家排名（从高到低，最常用）
ZREVRANK leaderboard player:1001

# 取 Top 10（从高到低，带分数）
ZREVRANGE leaderboard 0 9 WITHSCORES

# 取 Top 10（从高到低，带分数和排名，Redis 6.2+）
ZREVRANGE leaderboard 0 9 WITHSCORES REV
\`\`\`

### 实战：游戏积分榜

\`\`\`bash
# 玩家完成关卡，加分
ZINCRBY game:score 100 player:1001
ZINCRBY game:score 50 player:1002

# 查 Top 10
ZREVRANGE game:score 0 9 WITHSCORES
# 1) "player:1001"
# 2) "100"
# 3) "player:1002"
# 4) "50"

# 查我的排名
ZREVRANK game:score player:1001
# (integer) 0   # 第 1 名

# 查我前后各 2 名（"附近的人"功能）
ZREVRANGE game:score 0 -1 WITHSCORES  # 拿全部，业务层处理
# 或用 ZREVRANGEBYSCORE
\`\`\`

### ZSet 排行榜的优势

| 优势 | 说明 |
| --- | --- |
| **性能** | O(log N) 增删查，百万级毫秒响应 |
| **去重** | 同一玩家多次加分只算一个 |
| **自动排序** | 不需要业务层排序 |
| **支持范围查询** | ZRANGEBYSCORE 取分数段 |

## 24.2 实时排名

### 实时更新

每次玩家得分变化，直接 ZINCRBY：

\`\`\`javascript
// 玩家完成关卡
async function addScore(playerId, score) {
  await redis.zincrby("game:score", score, \`player:\${playerId}\`);
}
\`\`\`

### 实时查询 Top N

\`\`\`bash
# 直播间送礼榜，实时 Top 10
ZREVRANGE live:gift:rank:room:1001 0 9 WITHSCORES
\`\`\`

### 取"我的排名 + 前后各 N 名"

\`\`\`bash
# 我的排名（从高到低，0 开始）
ZREVRANK leaderboard player:1001
# 假设返回 5（第 6 名）

# 取我前后各 2 名：[5-2, 5+2] = [3, 7]
ZREVRANGE leaderboard 3 7 WITHSCORES
\`\`\`

\`\`\`javascript
async function getRankNearby(playerId, around = 2) {
  const rank = await redis.zrevrank("leaderboard", \`player:\${playerId}\`);
  if (rank === null) return null;

  const start = Math.max(0, rank - around);
  const end = rank + around;
  const list = await redis.zrevrange("leaderboard", start, end, "WITHSCORES");

  return { myRank: rank + 1, nearby: parseList(list) };
}
\`\`\`

### Redis 7.2+ 的 ZMPOP

新命令 \`ZMPOP\` 可以从多个 ZSet 弹出分数最低/最高的元素，用于优先级队列：

\`\`\`bash
# 从队列 1 或队列 2 弹出分数最小的 3 个
ZMPOP 2 queue:1 queue:1 MIN COUNT 3
\`\`\`

## 24.3 分页查询

排行榜数据量大时需要分页。

### 简单分页

\`\`\`bash
# 第 2 页，每页 20 条：[20, 39]
ZREVRANGE leaderboard 20 39 WITHSCORES
\`\`\`

### 用 ZRANGEBYSCORE 按分数段查询

\`\`\`bash
# 查分数在 1000-2000 之间的玩家
ZRANGEBYSCORE leaderboard 1000 2000 WITHSCORES LIMIT 0 20

# 查分数 > 1000 的
ZRANGEBYSCORE leaderboard (1000 +inf WITHSCORES LIMIT 0 20
\`\`\`

### 深分页问题

\`\`\`bash
# 第 10000 页（很慢）
ZREVRANGE leaderboard 199980 199999 WITHSCORES
\`\`\`

ZREVRANGE 偏移量大时性能下降（O(log N + M)，但偏移仍要扫过）。

**解决方案**：
- 限制最大翻页深度（如最多 100 页）
- 用游标分页：记住上一页最后一个元素的 score 和 member，下次用 ZRANGEBYSCORE

\`\`\`bash
# 上一页最后：player:1001 score:1500
# 下一页：取 score < 1500 的，LIMIT 0 20
ZRANGEBYSCORE leaderboard -inf (1500 WITHSCORES LIMIT 0 20
# 如果有同分，还要按 member 排序处理
\`\`\`

## 24.4 多维排行榜

实际业务里排行榜维度很多：日榜、周榜、月榜、总榜；按地区、按等级等。

### 按时间维度

\`\`\`bash
# 日榜
ZADD rank:daily:20240101 100 player:1001

# 周榜（聚合一周的日榜）
ZUNIONSTORE rank:weekly:202401 7 \\
  rank:daily:20240101 rank:daily:20240102 ... rank:daily:20240107

# 月榜
ZUNIONSTORE rank:monthly:202401 31 \\
  rank:daily:20240101 ...
\`\`\`

\`\`\`bash
# 自动聚合（用通配符）
ZUNIONSTORE rank:weekly:202401 1 rank:daily:2024010*  # 不行，ZUNIONSTORE 不支持 pattern
# 要业务层枚举日期，或用 Lua 脚本
\`\`\`

### 多维组合

\`\`\`bash
# 全国榜
ZADD rank:global 1000 player:1001

# 北京榜
ZADD rank:region:beijing 1000 player:1001

# 等级 50+ 榜
ZADD rank:level:50 1000 player:1001
\`\`\`

### 用 ZINTERSTORE 交集

\`\`\`bash
# 北京且等级 50+ 的玩家排行
ZINTERSTORE rank:beijing:level50 2 rank:region:beijing rank:level:50
\`\`\`

### 性能注意

- ZUNIONSTORE/ZINTERSTORE 是 O(N*M) 操作，数据量大时慢，建议**离线聚合**而非实时
- 高频更新的榜（如直播送礼）只做实时日榜，周月榜用定时任务聚合

## 24.5 计数器场景

Redis 的 INCR/INCRBY 是原子的，天然适合计数器。

### 场景 1：点赞数

\`\`\`bash
# 点赞
INCR like:post:1001
# 取消点赞
DECR like:post:1001

# 查看点赞数
GET like:post:1001
\`\`\`

\`\`\`javascript
async function like(postId, userId) {
  // 防重复点赞：用 Set 记录
  const added = await redis.sadd(\`like:users:\${postId}\`, userId);
  if (added === 1) {
    await redis.incr(\`like:post:\${postId}\`);
    return true;
  }
  return false;  // 已点赞
}
\`\`\`

### 场景 2：UV 统计

UV（独立访客数）需要去重。**用 Set 或 HyperLogLog**。

\`\`\`bash
# 方案 1：Set（精确，但占内存）
SADD uv:20240101 user:1001
SADD uv:20240101 user:1002
SCARD uv:20240101   # UV 数

# 方案 2：HyperLogLog（近似，省内存，约 12KB 统计 10 亿）
PFADD uv:20240101 user:1001
PFADD uv:20240101 user:1002
PFCOUNT uv:20240101   # UV 数（有 0.81% 误差）

# 多日合并
PFMERGE uv:202401 uv:20240101 uv:20240102 ... uv:20240131
PFCOUNT uv:202401
\`\`\`

> **选择**：百万 UV 用 Set 还行；千万、亿级用 HyperLogLog，误差 0.81% 可接受，内存省百倍。

### 场景 3：PV 统计

\`\`\`bash
# 简单 PV
INCR pv:page:home:20240101

# 用 Hash 聚合
HINCRBY pv:20240101 home 1
HINCRBY pv:20240101 about 1
HGETALL pv:20240101
\`\`\`

### 场景 4：库存扣减

\`\`\`bash
# 初始化库存
SET stock:sku:1001 100

# 扣库存（原子）
DECR stock:sku:1001
# 返回 99，说明扣成功
# 返回 -1，说明超卖（要回滚或拒绝）
\`\`\`

\`\`\`javascript
async function deductStock(skuId) {
  const remain = await redis.decr(\`stock:\${skuId}\`);
  if (remain < 0) {
    // 超卖，回滚
    await redis.incr(\`stock:\${skuId}\`);
    return false;
  }
  return true;
}
\`\`\`

> **更严谨**：用 Lua 脚本判断 + 扣减原子，避免并发超卖。

### 场景 5：限流计数

参考第 22 章，固定窗口限流就是计数器：

\`\`\`bash
INCR rate:user:1001:202401011200
EXPIRE rate:user:1001:202401011200 60
\`\`\`

### 场景 6：分布式 ID

\`\`\`bash
# 每次自增
INCR id:order
# 返回 100001，作为订单 ID

# 按天重置（业务层判断）
INCR id:order:20240101
\`\`\`

## 24.6 踩坑提示

> **坑 1：ZSet 分数精度**。score 是 double，整数部分约 53 位（9007199254740992），足够大；但浮点数累计有精度损失，**积分用整数**。

> **坑 2：排行榜成员太多**。百万级 ZSet 没问题，但 ZRANGE 全表扫描慢。限制最大长度，老的剔除。

> **坑 3：同分排名**。两个玩家都是 100 分，按 member 字典序排，可能不符合预期。解决：score 用组合 \`分数*1000000+时间戳\`（先到的排前）。

> **坑 4：HyperLogLog 当精确计数用**。误差 0.81%，不能用于金额、库存等精确场景。

> **坑 5：DECR 扣成负数**。库存扣减没判断，扣成 -1 才发现超卖。用 Lua 原子判断 + 扣减。

> **坑 6：ZUNIONSTORE 实时聚合卡 Redis**。亿级 ZSet 聚合可能几秒，期间整个 Redis 阻塞。改成离线或用从节点。

> **坑 7：counter 不设过期**。日榜的 key 永久存在，占内存。给日榜设 7 天过期，月榜设 1 年。

## 24.7 本章小结

- **ZSet** 是排行榜核心：ZADD/ZINCRBY 加分，ZREVRANGE 取 Top N，ZREVRANK 查排名
- **实时排名**：ZINCRBY 实时更新，ZREVRANGE 实时查询，性能 O(log N)
- **分页**：ZREVRANGE 简单分页，深分页用游标（ZRANGEBYSCORE）
- **多维榜**：日/周/月榜用 ZUNIONSTORE 聚合，离线计算避免阻塞
- **计数器**：INCR/DECR 原子操作，点赞/库存/ID/PV 都能用
- **UV**：小量用 Set 精确，海量用 HyperLogLog 省 100 倍内存
- **库存扣减**：Lua 原子判断 + 扣减，避免超卖`
  },
  {
    id: "redis-ch25",
    group: "第五部分 应用场景实战",
    icon: "👤",
    title: "第 25 章 用户状态与社交",
    content: `# 第 25 章 用户状态与社交

社交业务有一堆典型场景：在线用户列表、用户签到、共同好友、关注关系、附近的人。这些场景用关系型数据库做性能差，用 Redis 的 Set/Bitmap/Geo 几行命令就搞定。本章把这些社交场景的 Redis 实战讲透。

## 25.1 在线用户列表

### 方案 1：Set（精确）

用 Set 存所有在线用户 ID。

\`\`\`bash
# 用户登录
SADD online:users user:1001
SADD online:users user:1002

# 用户登出
SREM online:users user:1001

# 在线总数
SCARD online:users

# 检查是否在线
SISMEMBER online:users user:1001

# 随机取一个在线用户
SRANDMEMBER online:users
\`\`\`

**问题**：百万用户在线时 Set 占内存大（每个 member 是字符串）。优化用 Bitmap。

### 方案 2：Bitmap（省内存）

用户 ID 是数字时，用 Bitmap：每个用户占 1 bit。

\`\`\`bash
# 用户 1001 上线
SETBIT online:bitmap 1001 1

# 用户 1001 下线
SETBIT online:bitmap 1001 0

# 检查是否在线
GETBIT online:bitmap 1001

# 在线总数
BITCOUNT online:bitmap

# 找下一个在线用户
BITPOS online:bitmap 1 1002
\`\`\`

**内存对比**：

| 方案 | 100 万用户 | 1 亿用户 |
| --- | --- | --- |
| Set（每个 ID 8 字节） | ~8MB | ~800MB |
| Bitmap | 125KB | 12.5MB |

> **Bitmap 大胜**！但 Bitmap 要求 ID 是数字且密集，稀疏 ID（如 1, 100000000）会浪费。

### 方案 3：定时心跳 + 过期

\`\`\`bash
# 用户每 30 秒上报心跳，key 设 60 秒过期
SET heartbeat:user:1001 1 EX 60

# 检查在线
EXISTS heartbeat:user:1001
# 1 = 在线，0 = 离线
\`\`\`

**优点**：自动过期，无需手动清理。**缺点**：统计在线总数难（要扫所有 key）。

### 综合方案

- **单用户在线检查**：心跳 key + 过期
- **在线总数**：Bitmap
- **在线用户列表**：Set（数据量小）或扫 Bitmap

## 25.2 用户签到

签到场景：用户每天签到一次，统计连续签到天数、月签到次数。

### 方案 1：String（简单）

\`\`\`bash
# 用户 1001 在 2024-01-01 签到
SET sign:user:1001:20240101 1

# 查是否签到
EXISTS sign:user:1001:20240101
\`\`\`

**问题**：每个签到一条记录，占内存多。

### 方案 2：Bitmap（推荐）

一年一个 Bitmap，每天占 1 bit，365 天只需 46 字节！

\`\`\`bash
# 用户 1001 在 2024 年第 1 天签到（1 月 1 日）
SETBIT sign:user:1001:2024 0 1   # offset = 天数 - 1

# 第 2 天签到
SETBIT sign:user:1001:2024 1 1

# 查 1 月 1 日是否签到
GETBIT sign:user:1001:2024 0

# 统计 2024 年签到次数
BITCOUNT sign:user:1001:2024

# 统计 1 月签到次数（前 31 天）
BITCOUNT sign:user:1001:2024 0 30
\`\`\`

### 连续签到天数

\`\`\`bash
# 从今天往前找连续的 1
BITFIELD sign:user:1001:2024 GET u31 0
# 返回 31 位的整数，每一位代表一天

# 用 BITPOS 找最后一个 0
BITPOS sign:user:1001:2024 0
\`\`\`

\`\`\`javascript
// Node.js 计算连续签到
async function getStreak(userId, year) {
  const today = dayOfYear(new Date());  // 1-365
  const bits = await redis.bitfield(
    \`sign:user:\${userId}:\${year}\`,
    "GET", \`u\${today}\`, 0
  );
  // bits 是一个整数，二进制每位代表一天
  let streak = 0;
  for (let i = today - 1; i >= 0; i--) {
    if ((bits >> i) & 1) streak++;
    else break;
  }
  return streak;
}
\`\`\`

### 月签到统计（业务常见）

\`\`\`bash
# 用月份 key，offset = 当月第几天 - 1
SETBIT sign:user:1001:202401 0 1   # 1 月 1 日
SETBIT sign:user:1001:202401 15 1  # 1 月 16 日

BITCOUNT sign:user:1001:202401
\`\`\`

## 25.3 共同好友

用 Set 存每个用户的好友列表，求交集就是共同好友。

\`\`\`bash
# 用户 1001 的好友
SADD friends:user:1001 user:1002 user:1003 user:1004

# 用户 1002 的好友
SADD friends:user:1002 user:1003 user:1004 user:1005

# 求共同好友
SINTER friends:user:1001 friends:user:1002
# 返回：user:1003, user:1004

# 求并集
SUNION friends:user:1001 friends:user:1002

# 求差集（1001 有但 1002 没有的）
SDIFF friends:user:1001 friends:user:1002

# 把结果存到新 Set
SINTERSTORE mutual:1001:1002 friends:user:1001 friends:user:1002
\`\`\`

### 推荐好友（"可能认识的人"）

\`\`\`bash
# 1001 的好友的好友，去掉 1001 自己和已有好友
SUNION friends-of-friends:1001 = 
  SUNION friends:<好友1> friends:<好友2> ...

SDIFF friends-of-friends:1001 friends:user:1001 (user:1001)
\`\`\`

\`\`\`javascript
// 推荐好友
async function recommendFriends(userId) {
  const myFriends = await redis.smembers(\`friends:user:\${userId}\`);
  if (myFriends.length === 0) return [];

  // 收集所有好友的好友
  const keys = myFriends.map(f => \`friends:user:\${f.replace("user:", "")}\`);
  await redis.sunionstore("temp:fof", ...keys);

  // 排除自己已有的好友和自己
  const excludeKey = \`friends:user:\${userId}\`;
  await redis.sadd(excludeKey, \`user:\${userId}\`);  // 临时加自己
  const recommendations = await redis.sdiff("temp:fof", excludeKey);
  await redis.srem(excludeKey, \`user:\${userId}\`);  // 移除自己

  return recommendations;
}
\`\`\`

### 共同关注 / 共同兴趣

同样的 Set 操作适用：

\`\`\`bash
# 共同关注的公众号
SINTER follow:user:1001 follow:user:1002

# 共同兴趣标签
SINTER tags:user:1001 tags:user:1002
\`\`\`

## 25.4 关注关系

社交场景的核心：**关注 / 粉丝 / 互粉**。

### 数据结构

- **关注列表**：\`following:user:1001\`（Set，存 1001 关注的人）
- **粉丝列表**：\`followers:user:1001\`（Set，存关注 1001 的人）

\`\`\`bash
# 1001 关注 1002
SADD following:user:1001 user:1002
SADD followers:user:1002 user:1001

# 取消关注
SREM following:user:1001 user:1002
SREM followers:user:1002 user:1001

# 关注数
SCARD following:user:1001

# 粉丝数
SCARD followers:user:1001

# 是否关注
SISMEMBER following:user:1001 user:1002

# 互粉（共同关注 = 共同粉丝）
SINTER following:user:1001 followers:user:1001
\`\`\`

### 大 V 粉丝的优化

百万粉丝的 Set 占内存大，且更新频繁。优化方案：

1. **分片**：按粉丝 ID 哈希分到多个 Set
2. **用 Sorted Set**：score 是关注时间，可以按时段统计
3. **冷数据下沉**：老粉丝迁移到数据库，只保留活跃粉丝在 Redis

### 时间线（Feed 流）

关注关系的一个核心应用是**推送用户的时间线**：

- **写扩散**（fan-out on write）：发布时推送到所有粉丝的收件箱
- **读扩散**（fan-out on read）：粉丝读取时实时拉取关注者的内容

\`\`\`bash
# 写扩散：用户 1001 发帖，推到所有粉丝
SRANDMEMBER followers:user:1001 1000   # 分批取粉丝
LPUSH feed:user:<粉丝id> <post_id>

# 读扩散：用户 1001 读 Feed
LRANGE feed:user:1001 0 19   # 最新 20 条
\`\`\`

> **写扩散适合粉丝少**（如朋友圈）；**读扩散适合大 V**（粉丝百万，写扩散太慢）。混合模式：大 V 用读扩散，普通用户用写扩散。

## 25.5 附近的人

LBS（Location-Based Service）场景：附近的人、附近的商家。Redis 3.2+ 提供 **GEO** 数据类型，基于 GeoHash 实现。

### 基本操作

\`\`\`bash
# 添加地理位置（经度 纬度 名称）
GEOADD nearby:users 116.404 39.915 "user:1001"
GEOADD nearby:users 116.405 39.916 "user:1002"
GEOADD nearby:users 116.410 39.920 "user:1003"

# 查询两用户距离
GEODIST nearby:users "user:1001" "user:1002"
# "89.8416"  # 米

# 指定单位
GEODIST nearby:users "user:1001" "user:1002" km
# "0.0898"

# 查询附近的人（经纬度 + 半径）
# 116.404, 39.915 附近 1km 内的人
GEOSEARCH nearby:users FROMLONLAT 116.404 39.915 BYRADIUS 1 km ASC COUNT 10 WITHCOORD WITHDIST
# 1) 1) "user:1001"
#    2) "0.0000"
#    3) 1) "116.404..."
#       2) "39.915..."
# 2) 1) "user:1002"
#    ...

# 查询附近的人（以某个 member 为中心）
GEOSEARCH nearby:users FROMMEMBER "user:1001" BYRADIUS 1 km ASC COUNT 10 WITHDIST
\`\`\`

### 实战：附近的人

\`\`\`javascript
// 用户上报位置
async function reportLocation(userId, lon, lat) {
  await redis.geoadd("nearby:users", lon, lat, \`user:\${userId}\`);
  // 设过期，长时间不上报的自动清理
  await redis.expire(\`nearby:users\`, 86400);  // 整个 key 24h
}

// 查附近的人
async function findNearby(userId, radiusKm = 1, count = 10) {
  const results = await redis.geosearch(
    "nearby:users",
    "FROMMEMBER", \`user:\${userId}\`,
    "BYRADIUS", radiusKm, "km",
    "ASC", "COUNT", count,
    "WITHDIST", "WITHCOORD"
  );
  return results.map(r => ({
    userId: r.member,
    distance: r.distance,
    longitude: r.coordinates.longitude,
    latitude: r.coordinates.latitude,
  }));
}
\`\`\`

### GEO 的原理

GEO 底层是 ZSet，**score 是 GeoHash 编码的整数**。GeoHash 把二维经纬度编码成一维整数，相近的位置编码也相近，所以可以用 ZSet 的范围查询。

\`\`\`bash
# ZRANGE 能看到 GEO 的底层 ZSet
ZRANGE nearby:users 0 -1 WITHSCORES
# 1) "user:1001"
# 2) "4069876057162018"  # GeoHash
\`\`\`

### GEO 的限制

- **极地附近精度差**：GeoHash 在赤道附近精度高，两极误差大
- **不能跨日期变更线**：从东经到西经的"附近"会绕远
- **member 唯一**：同一 member 只能有一个位置，更新会覆盖

### 附近的商家 / 司机

同样用 GEO：

\`\`\`bash
# 附近的餐厅
GEOADD nearby:restaurants 116.404 39.915 "restaurant:1"

# 网约车：附近的司机
GEOADD nearby:drivers:city:bj 116.404 39.915 "driver:1001"

# 乘客找司机
GEOSEARCH nearby:drivers:city:bj FROMLONLAT 116.404 39.915 BYRADIUS 3 km COUNT 10 ASC
\`\`\`

## 25.6 踩坑提示

> **坑 1：Bitmap offset 用字符串 ID**。Bitmap 要求 offset 是数字，如果用户 ID 是 UUID 就用不了。要么用数字 ID，要么用 Set。

> **坑 2：签到 Bitmap 跨年没清理**。每年一个 key，老的不删会一直占内存。给每个 key 设 1 年过期。

> **坑 3：共同好友 Set 太大**。百万好友的 Set 求 SINTER 很慢。冷数据下沉到数据库，Redis 只存活跃好友。

> **坑 4：粉丝列表更新热点**。大 V 发帖触发百万粉丝的写扩散，瞬间打爆 Redis。大 V 改读扩散。

> **坑 5：GEO 用错坐标顺序**。Redis GEO 是 \`经度 纬度\`，不是 \`纬度 经度\`！很多地图 API 是反的，传错会查到地球另一端。

> **坑 6：GEO 数据不清理**。用户不上报位置后老数据还在，"附近的人"会查到已经离开的用户。给位置 key 设过期，或用业务层过滤时间。

> **坑 7：互粉判断低效**。两个百万级 Set 求交集，可能阻塞几秒。可以预先计算互粉标记，或用 Bitmap。

## 25.7 本章小结

- **在线用户**：精确用 Set，省内存用 Bitmap，自动过期用心跳 key
- **签到**：Bitmap 一年 46 字节，BITCOUNT 统计次数，BITPOS 找连续天数
- **共同好友**：Set 的 SINTER/SUNION/SDIFF，社交场景核心操作
- **关注关系**：following + followers 两个 Set，互粉求交集
- **Feed 流**：写扩散（粉丝少）vs 读扩散（大 V），混合模式最佳
- **附近的人**：GEO 类型，GEOADD 加位置，GEOSEARCH 范围查询，底层是 GeoHash ZSet
- 关键坑：Bitmap 数字 ID、坐标经纬度顺序、Set 大小控制、热点写扩散`
  }
];

export { chapters };
