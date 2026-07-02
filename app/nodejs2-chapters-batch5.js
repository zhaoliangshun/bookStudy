export const chapters = [
  {
    id: "n2-rate-limiter",
    icon: "🚦",
    group: "第五部分 实战案例",
    title: "实现一个限流器（Rate Limiter）",
    content: `## 为什么需要限流？

在高并发系统中，限流（Rate Limiting）是保护服务稳定性的核心手段之一。想象一下这样的场景：电商大促时，大量用户同时涌入；或者恶意攻击者发起 DDoS 请求；又或者某个第三方客户端因为 Bug 疯狂调用你的 API。如果没有任何保护措施，这些突发流量会直接打垮你的服务，导致数据库连接耗尽、CPU 满载、内存溢出，最终所有用户都无法正常访问。

限流的核心作用可以总结为三点：**保护服务不被打垮**、**防止恶意攻击**、**公平分配资源**。它就像交通信号灯一样，控制着流量的进出节奏，确保系统始终在可承受的范围内运行。

## 常见限流算法详解

业界已经发展出多种成熟的限流算法，每种算法都有其适用场景和优缺点。理解它们的原理是实现一个好用限流器的前提。

### 1. 固定窗口计数器（Fixed Window Counter）

这是最简单、最容易实现的算法。将时间划分为固定大小的窗口（比如每分钟一个窗口），每个窗口内维护一个计数器，每来一个请求计数器加一，超过阈值就拒绝请求。窗口切换时计数器清零。

\`\`\`
窗口1 [00:00-01:00) → 计数器: 0 → 超过100就拒绝
窗口2 [01:00-02:00) → 计数器: 0 → 重新计数
\`\`\`

**优点**：实现极其简单，内存占用小，性能极高。

**缺点**：存在明显的**临界问题**（Boundary Problem）。比如限制每分钟100个请求，用户可能在00:59发送100个请求，在01:01又发送100个请求，实际上在2秒内就发出了200个请求，这可能直接压垮服务。这就是所谓的"双倍突发"问题。

### 2. 滑动窗口日志（Sliding Window Log）

为了解决固定窗口的临界问题，滑动窗口日志记录了每个请求的精确时间戳。当新请求到来时，先清理掉窗口外（比如1分钟前）的所有记录，然后统计当前窗口内的请求数量，再决定是否允许。

\`\`\`
当前时间: 01:01:30
窗口范围: [00:01:30, 01:01:30]
日志: [00:00:45, 00:01:15, 01:00:20, 01:01:00, 01:01:25]
          ↑ 已过期，删除
统计: 窗口内有4个请求
\`\`\`

**优点**：算法精确，不存在临界问题，能够真实反映任意时刻的请求速率。

**缺点**：内存占用大。如果请求量很高（比如每秒数万请求），需要存储大量时间戳，在分布式场景下这可能成为性能瓶颈。

### 3. 滑动窗口计数器（Sliding Window Counter）

这是对固定窗口和滑动窗口日志的折中方案。它将时间窗口划分为更小的格子，每个格子独立计数。滑动时只需要移动窗口指针，累加窗口覆盖的格子的计数。

例如：1分钟窗口划分为6个10秒的格子，窗口滑动时每隔10秒移动一个格子。

**优点**：内存占用可控（格子数量固定），精度可调，性能好。广泛应用于实际生产环境，Redis 的限流就是类似思路。

**缺点**：精度取决于格子大小，存在一定的统计误差（但比固定窗口小得多）。

### 4. 令牌桶算法（Token Bucket）

令牌桶是一种非常经典的限流算法，也是网络设备中流量整形（Traffic Shaping）的常用算法。它的核心思想是：系统以恒定速率往桶里放入令牌，每个请求需要拿到一个令牌才能被处理；如果桶满了，新令牌会被丢弃；如果桶里没有令牌，请求要么等待要么被拒绝。

\`\`\`
令牌桶容量: 10（允许突发10个请求）
令牌生成速率: 2个/秒

请求到达 → 桶里有令牌？→ 取走令牌，允许通过
               ↓ 没有
            拒绝/排队等待
\`\`\`

**优点**：
- 允许一定程度的突发流量（桶里的令牌积累起来可以应对突发）
- 平均速率可控
- 实现相对简单

这也是为什么很多 API 网关（如 Nginx、Kong）默认使用令牌桶的原因——它既控制了长期平均速率，又允许合理的突发流量，用户体验更好。

### 5. 漏桶算法（Leaky Bucket）

漏桶算法与令牌桶正好相反：请求（水）先进入桶中排队，桶以恒定速率"漏出"（处理）请求；桶满了则直接拒绝新请求。

\`\`\`
请求进入 → 桶（队列）→ 恒定速率流出处理
            ↓ 桶满
            拒绝请求
\`\`\`

**优点**：流出速率绝对平滑，无论上游请求多么突发，下游处理速率始终恒定。非常适合需要严格控制处理速率的场景。

**缺点**：无法应对突发流量，即使系统当前空闲，突发请求也必须排队等待。

**令牌桶 vs 漏桶**：令牌桶是"宽进严出"——允许突发但限制平均速率；漏桶是"严进严出"——流入流出都严格平滑。选择哪种取决于业务场景。

### 单机限流 vs 分布式限流

上面讨论的都是单机限流，即每个服务实例独立限流。但在分布式部署场景下，一个服务往往有多个实例，这时候就需要分布式限流了。

- **单机限流**：每个实例独立计数，优点是性能极高（内存操作），缺点是总限流阈值需要除以实例数，且扩容缩容时不好调整。
- **分布式限流**：使用集中式存储（如 Redis）统一计数，优点是精确控制全局阈值，缺点是每次请求都有网络开销，需要考虑 Redis 本身的可用性。

实际生产中通常两者结合：入口层（网关）做分布式限流保护整体服务，每个服务实例本地再做一层限流保护自身。

## 本章实现

本章我们将用类封装的方式，实现两种实用的限流器：**滑动窗口限流器**（精度高，适合接口级别限流）和**令牌桶限流器**（允许突发，适合流量整形）。代码使用纯 JavaScript 实现，不依赖任何外部库，可以直接在 Node.js 中运行。
`,
    code: `// ============================================================
// 限流器实现：滑动窗口限流器 + 令牌桶限流器
// ============================================================

class SlidingWindowLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000;
    this.maxRequests = options.maxRequests || 100;
    this.requestLogs = [];
  }

  _cleanup(now) {
    const windowStart = now - this.windowMs;
    while (this.requestLogs.length > 0 && this.requestLogs[0] < windowStart) {
      this.requestLogs.shift();
    }
  }

  tryAcquire() {
    const now = Date.now();
    this._cleanup(now);
    if (this.requestLogs.length < this.maxRequests) {
      this.requestLogs.push(now);
      return { allowed: true, remaining: this.maxRequests - this.requestLogs.length };
    }
    const oldestRequest = this.requestLogs[0];
    const retryAfter = Math.ceil((oldestRequest + this.windowMs - now) / 1000);
    return { allowed: false, retryAfter, remaining: 0 };
  }

  getStats() {
    this._cleanup(Date.now());
    return {
      currentCount: this.requestLogs.length,
      maxRequests: this.maxRequests,
      windowMs: this.windowMs,
      remaining: this.maxRequests - this.requestLogs.length
    };
  }

  reset() {
    this.requestLogs = [];
  }
}

class TokenBucketLimiter {
  constructor(options = {}) {
    this.capacity = options.capacity || 10;
    this.refillRate = options.refillRate || 2;
    this.tokens = this.capacity;
    this.lastRefillTime = Date.now();
  }

  _refill() {
    const now = Date.now();
    const elapsedMs = now - this.lastRefillTime;
    const refillTokens = (elapsedMs / 1000) * this.refillRate;
    this.tokens = Math.min(this.capacity, this.tokens + refillTokens);
    this.lastRefillTime = now;
  }

  tryAcquire(tokensNeeded = 1) {
    this._refill();
    if (this.tokens >= tokensNeeded) {
      this.tokens -= tokensNeeded;
      return {
        allowed: true,
        remaining: Math.floor(this.tokens),
        bucketSize: this.capacity
      };
    }
    const deficit = tokensNeeded - this.tokens;
    const waitMs = Math.ceil((deficit / this.refillRate) * 1000);
    return {
      allowed: false,
      waitMs,
      remaining: Math.floor(this.tokens)
    };
  }

  getStats() {
    this._refill();
    return {
      currentTokens: Math.floor(this.tokens),
      capacity: this.capacity,
      refillRatePerSecond: this.refillRate
    };
  }

  reset() {
    this.tokens = this.capacity;
    this.lastRefillTime = Date.now();
  }
}

console.log("========================================");
console.log("  演示 1：滑动窗口限流器");
console.log("  配置：1 秒窗口，最多 5 个请求");
console.log("========================================");

const slidingLimiter = new SlidingWindowLimiter({
  windowMs: 1000,
  maxRequests: 5
});

console.log("\\n快速发送 8 个请求：");
for (let i = 1; i <= 8; i++) {
  const result = slidingLimiter.tryAcquire();
  if (result.allowed) {
    console.log("  请求 #" + i + ": ✅ 允许，剩余配额: " + result.remaining);
  } else {
    console.log("  请求 #" + i + ": ❌ 拒绝，请 " + result.retryAfter + " 秒后重试");
  }
}

console.log("\\n当前统计:", slidingLimiter.getStats());

console.log("\\n等待 1.2 秒后，窗口滑动，再次尝试：");
setTimeout(() => {
  for (let i = 9; i <= 12; i++) {
    const result = slidingLimiter.tryAcquire();
    console.log("  请求 #" + i + ": " + (result.allowed ? '✅ 允许' : '❌ 拒绝') + "，剩余: " + result.remaining);
  }
  runTokenBucketDemo();
}, 1200);

function runTokenBucketDemo() {
  console.log("\\n========================================");
  console.log("  演示 2：令牌桶限流器");
  console.log("  配置：桶容量 5，补充速率 2 个/秒");
  console.log("========================================");

  const bucketLimiter = new TokenBucketLimiter({
    capacity: 5,
    refillRate: 2
  });

  console.log("\\n--- 阶段 1：初始桶满，快速发送 7 个请求 ---");
  for (let i = 1; i <= 7; i++) {
    const result = bucketLimiter.tryAcquire();
    if (result.allowed) {
      console.log("  请求 #" + i + ": ✅ 通过，桶内剩余令牌: " + result.remaining);
    } else {
      console.log("  请求 #" + i + ": ❌ 限流，需等待 " + result.waitMs + "ms");
    }
  }

  console.log("\\n--- 阶段 2：等待 1 秒，令牌补充约 2 个 ---");
  setTimeout(() => {
    console.log("当前桶状态:", bucketLimiter.getStats());
    for (let i = 8; i <= 11; i++) {
      const result = bucketLimiter.tryAcquire();
      console.log("  请求 #" + i + ": " + (result.allowed ? '✅ 通过' : '❌ 限流') + "，剩余: " + result.remaining);
    }

    console.log("\\n--- 阶段 3：模拟真实请求节奏（每 600ms 一个）---");
    let reqNum = 11;
    const interval = setInterval(() => {
      reqNum++;
      const result = bucketLimiter.tryAcquire();
      console.log("  请求 #" + reqNum + ": " + (result.allowed ? '✅ 通过' : '❌ 限流') + "，剩余: " + result.remaining);
      if (reqNum >= 16) {
        clearInterval(interval);
        console.log("\\n🎉 限流器演示完成！");
      }
    }, 600);
  }, 1000);
}
`
  },
  {
    id: "n2-cache",
    icon: "💾",
    group: "第五部分 实战案例",
    title: "实现一个简单的缓存模块",
    content: `## 缓存：性能优化的第一道防线

在任何高并发系统中，缓存都是提升性能的利器。数据库查询、网络调用、复杂计算——这些操作往往耗时较长，如果每次请求都重新执行，系统的吞吐量会非常有限。缓存通过将热点数据存储在更快的介质（通常是内存）中，避免重复计算或重复 I/O，可以将响应时间从几百毫秒降低到几毫秒甚至几微秒。

"缓存是计算机科学中最难的两件事之一"（另一件是命名和缓存失效）。这句话虽然是玩笑，但也道出了缓存设计的复杂性。理解缓存的核心概念和常见问题，是每个后端开发者的必修课。

## 缓存淘汰策略

缓存的容量是有限的（内存不可能无限大），当缓存满了之后，必须决定哪些数据应该被淘汰。不同的淘汰策略适用于不同的场景：

| 策略 | 全称 | 说明 | 适用场景 |
|------|------|------|----------|
| **LRU** | Least Recently Used | 淘汰最久未被访问的数据 | 最常用，符合"最近用过的数据大概率还会被用"的局部性原理 |
| **LFU** | Least Frequently Used | 淘汰访问频率最低的数据 | 访问模式稳定、热点数据明确的场景 |
| **FIFO** | First In First Out | 先进先出，淘汰最早进入缓存的数据 | 实现简单，但效果一般 |
| **TTL** | Time To Live | 为每个缓存项设置过期时间，到期自动淘汰 | 数据有时效性的场景 |
| **Random** | Random Eviction | 随机淘汰一个数据 | 实现最简单，极端情况下效果可能不错 |

## LRU 缓存原理详解

LRU（Least Recently Used，最近最少使用）是工业界最常用的缓存淘汰算法。它的核心思想非常符合直觉：**如果数据最近被访问过，那么它将来被访问的概率也更高**。因此，当缓存空间不足时，应该淘汰最久没有被访问过的数据。

经典的 LRU 实现需要满足两个操作的时间复杂度都是 **O(1)**：
1. **get(key)**：获取数据，如果存在需要将该数据标记为"最近使用"
2. **put(key, value)**：写入数据，如果缓存已满则淘汰最久未使用的数据

为了实现 O(1) 的操作，经典方案是使用 **哈希表 + 双向链表**：
- **哈希表（Hash Map）**：提供 O(1) 的 key → 节点查找能力
- **双向链表（Doubly Linked List）**：维护访问顺序，头部是最久未使用的，尾部是最近使用的
  - get 时：将节点移到链表尾部
  - put 时：新节点加到尾部；如果满了，删除头部节点

但是，ES6 的 **Map** 数据结构本身就保持了插入顺序！当我们对 Map 调用 keys()、values() 或 entries() 时，返回的迭代器按照插入顺序遍历。利用这个特性，我们可以用一种非常巧妙且简洁的方式实现 LRU：

1. 每次访问（get）一个 key 时，先 delete 再重新 set，这样这个 key 就会出现在 Map 的最后面（最新位置）
2. 每次写入（set）时，如果 key 已存在先删除；如果缓存大小超出容量，删除 Map 第一个元素（最久未使用）

这种实现方式代码极其简洁，性能也足够应对大多数场景。

## 缓存三大问题及解决方案

缓存虽然好用，但用不好也会引入很多问题。最经典的就是缓存击穿、缓存穿透、缓存雪崩。

### 缓存击穿（Cache Breakdown）

**问题**：某个热点 key 在缓存中过期的瞬间，大量并发请求同时涌入，这些请求都会穿透到数据库，导致数据库压力骤增。

就像一面完好的墙，被一颗钉子击穿了一个洞，所有压力都从这个洞涌入。

**解决方案**：
1. **互斥锁（Mutex）**：缓存失效时，只允许一个请求去加载数据库并重建缓存，其他请求等待。
2. **逻辑过期**：缓存中不设置真正的过期时间，而是在 value 中存储一个过期时间戳；发现过期时异步更新缓存，旧数据继续返回。
3. **热点数据永不过期**：对于极度热点的数据，干脆不设置过期时间，由后台任务主动更新。

### 缓存穿透（Cache Penetration）

**问题**：请求查询一个根本不存在的数据，缓存中没有，数据库中也没有。这样每次请求都会穿透到数据库。如果攻击者构造大量不存在的 key 进行请求，数据库会承受巨大压力。

和击穿不同，穿透是请求不存在的数据，缓存和数据库都"拦不住"。

**解决方案**：
1. **布隆过滤器（Bloom Filter）**：在缓存之前加一层布隆过滤器，所有可能存在的数据都提前映射到位图中；如果布隆过滤器说不存在，直接返回，根本不查缓存和数据库。
2. **缓存空值**：即使数据库查询结果为空，也把这个空结果缓存起来（设置较短的过期时间），这样后续对同一个 key 的查询不会再打到数据库。
3. **参数校验**：在接口层面对请求参数做合法性校验，明显不合法的请求直接拦截。

### 缓存雪崩（Cache Avalanche）

**问题**：大量缓存 key 在同一时间集中过期，或者缓存服务本身宕机，导致所有请求都涌向数据库，数据库瞬间被打垮。

和击穿的区别是：击穿是单个热点 key，雪崩是大量 key 同时失效。

**解决方案**：
1. **过期时间加随机值**：在设置过期时间时，加一个随机扰动（比如 ±5 分钟），避免大量 key 同时过期。
2. **缓存集群高可用**：使用 Redis Sentinel 或 Cluster 模式，避免单点故障。
3. **服务熔断与降级**：当检测到数据库压力过大时，暂时熔断部分非核心请求，返回降级数据。
4. **多级缓存**：本地缓存 + 分布式缓存两层，即使分布式缓存挂了，本地缓存还能顶一阵。

## 缓存过期策略

除了淘汰策略，缓存还需要处理数据过期。常见的过期策略有三种：

| 策略 | 实现方式 | 优点 | 缺点 |
|------|----------|------|------|
| **定时过期** | 每个 key 设置过期时创建一个定时器，到期立即删除 | 最及时，内存释放快 | 定时器数量多时 CPU 开销大 |
| **惰性过期** | 访问 key 时才检查是否过期，过期则删除 | CPU 友好，不访问就不浪费资源 | 过期 key 长期不被访问会占用内存 |
| **定期过期** | 每隔一段时间扫描一批 key，删除其中过期的 | 前两者的折中，平衡 CPU 和内存 | 需要控制扫描频率和时长 |

Redis 实际使用的是**惰性过期 + 定期过期**的组合方案。我们的缓存模块也会采用类似的策略。

## 本章实现

本章我们将使用 ES6 Map 实现一个功能完整的 LRU 缓存，支持：
- 基本的 get/set/delete/has/clear 操作
- TTL 过期（惰性过期 + 定期清理）
- 缓存命中率统计
- 容量自动淘汰
`,
    code: `// ============================================================
// LRU 缓存模块实现（ES6 Map + TTL 过期）
// ============================================================

class LRUCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 0;
    this.cleanupInterval = options.cleanupInterval || 10000;
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
    this._startCleanupTimer();
  }

  _isExpired(entry) {
    if (!entry.expireAt) return false;
    return Date.now() >= entry.expireAt;
  }

  _deleteIfExpired(key) {
    const entry = this.cache.get(key);
    if (entry && this._isExpired(entry)) {
      this.cache.delete(key);
      return true;
    }
    return false;
  }

  _evictIfNeeded() {
    while (this.cache.size > this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  _startCleanupTimer() {
    if (this.cleanupInterval <= 0) return;
    this._cleanupTimer = setInterval(() => {
      for (const [key, entry] of this.cache) {
        if (this._isExpired(entry)) {
          this.cache.delete(key);
        }
      }
    }, this.cleanupInterval);
    if (this._cleanupTimer.unref) {
      this._cleanupTimer.unref();
    }
  }

  set(key, value, ttl) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    const expireAt = ttl > 0 ? Date.now() + ttl
      : (this.defaultTTL > 0 ? Date.now() + this.defaultTTL : null);
    this.cache.set(key, { value, expireAt, createdAt: Date.now() });
    this._evictIfNeeded();
    return this;
  }

  get(key) {
    if (this._deleteIfExpired(key)) {
      this.misses++;
      return undefined;
    }
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }
    this.hits++;
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  has(key) {
    if (this._deleteIfExpired(key)) return false;
    return this.cache.has(key);
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  get size() {
    return this.cache.size;
  }

  getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total * 100).toFixed(2) + '%' : 'N/A'
    };
  }

  keys() {
    return Array.from(this.cache.keys());
  }

  destroy() {
    if (this._cleanupTimer) {
      clearInterval(this._cleanupTimer);
    }
    this.cache.clear();
  }
}

const mockDB = {
  users: {
    1: { id: 1, name: '张三', email: 'zhangsan@example.com' },
    2: { id: 2, name: '李四', email: 'lisi@example.com' },
    3: { id: 3, name: '王五', email: 'wangwu@example.com' }
  },
  queryUser(id) {
    const start = Date.now();
    while (Date.now() - start < 50) {}
    return this.users[id] || null;
  }
};

console.log("========================================");
console.log("  LRU 缓存模块演示");
console.log("========================================");

const cache = new LRUCache({
  maxSize: 3,
  defaultTTL: 3000,
  cleanupInterval: 1000
});

function getUserById(id) {
  const cacheKey = 'user:' + id;
  let user = cache.get(cacheKey);
  if (user !== undefined) {
    return { source: 'cache', data: user };
  }
  user = mockDB.queryUser(id);
  if (user) {
    cache.set(cacheKey, user);
  }
  return { source: 'database', data: user };
}

console.log("\\n--- 第一次查询：全部命中数据库 ---");
[1, 2, 3].forEach(id => {
  const result = getUserById(id);
  console.log("  查询用户 #" + id + ": [" + result.source + "] " + result.data.name);
});
console.log("  缓存状态:", cache.getStats());

console.log("\\n--- 第二次查询：全部命中缓存 ---");
[1, 2, 3].forEach(id => {
  const result = getUserById(id);
  console.log("  查询用户 #" + id + ": [" + result.source + "] " + result.data.name);
});
console.log("  缓存状态:", cache.getStats());

console.log("\\n--- 查询用户4（触发淘汰，缓存容量只有3）---");
const result4 = getUserById(4);
console.log("  查询用户 #4: [" + result4.source + "] " + (result4.data ? result4.data.name : 'null'));
console.log("  缓存中的 keys:", cache.keys());
console.log("  （用户1最久未被访问，被淘汰了）");

console.log("\\n--- 再次查询用户1，需要重新查数据库 ---");
const result1 = getUserById(1);
console.log("  查询用户 #1: [" + result1.source + "] " + result1.data.name);
console.log("  缓存中的 keys:", cache.keys());

console.log("\\n--- 查询不存在的用户 ---");
const result999 = getUserById(999);
console.log("  查询用户 #999: " + (result999.data ? result999.data.name : 'null（不存在）'));
console.log("  注意：空值没有缓存，每次都会穿透到数据库");
console.log("  缓存状态:", cache.getStats());

console.log("\\n--- TTL 过期演示（等待 3.5 秒）---");
setTimeout(() => {
  console.log("  3.5 秒后重新查询所有用户：");
  [1, 2, 3, 4].forEach(id => {
    const result = getUserById(id);
    console.log("  查询用户 #" + id + ": [" + result.source + "] " + (result.data ? result.data.name : 'null'));
  });
  console.log("  最终缓存状态:", cache.getStats());
  cache.destroy();
  console.log("\\n🎉 缓存模块演示完成！");
}, 3500);
`
  },
  {
    id: "n2-event-bus",
    icon: "🚌",
    group: "第五部分 实战案例",
    title: "实现一个事件总线（Event Bus）",
    content: `## 事件驱动架构：模块间解耦的艺术

在复杂的软件系统中，模块之间如何通信是一个核心设计问题。最直接的方式是模块 A 直接调用模块 B 的方法——这叫**直接依赖**。但直接依赖有个大问题：耦合度太高。A 需要知道 B 的存在，需要知道调用哪个方法；如果将来要通知 C 和 D，A 的代码就需要修改，违反了"开闭原则"。

**事件总线（Event Bus）** 采用**发布-订阅模式**（Publish-Subscribe Pattern）解决这个问题：
- **发布者（Publisher）**：只管发布事件，不关心谁来监听
- **订阅者（Subscriber）**：只管订阅自己感兴趣的事件，不关心谁发布的
- **事件总线**：作为中间的调度中心，维护事件和监听器的映射关系

就像公交车站一样：发布者是"上车的乘客"（发出事件），订阅者是"在特定站点等车的人"（监听事件），事件总线就是"公交线路"，负责把乘客送到对应的站点。发布者和订阅者互不相识，彻底解耦。

## 全局事件总线的优缺点

事件总线最大的优势是**完全解耦**：模块之间不需要相互引用，新增业务方只需要订阅事件即可，不需要修改发布方代码。这在大型应用、插件系统、微服务架构中尤为重要。

但它也有明显的缺点：
1. **数据流不直观**：事件的流向是隐式的，不像直接调用那样一目了然，调试和追踪比较困难
2. **过度使用可能导致"事件地狱"**：一个事件触发另一个事件，层层嵌套，最终谁也不知道事件是怎么流转的
3. **内存泄漏风险**：如果忘记取消订阅，监听器会一直存在，可能导致内存泄漏

因此，事件总线适合**跨模块的、一对多的通知场景**，不适合模块内部的精细流程控制。

## 通配符事件监听

在复杂系统中，有时候我们需要监听一类事件而不是单个事件。例如：
- 监听所有 \`user.*\` 事件（user:login、user:logout、user:register...）
- 监听所有 \`*.error\` 事件（任何模块的错误）
- 监听所有 \`order.*.failed\` 事件（订单任何阶段失败）

通配符监听让我们可以一次性订阅一类事件，非常适合日志记录、监控埋点等横切关注点。我们的实现将支持 \`*\` 通配符，匹配事件名中以点分隔的任意一段。

## 一次性事件

有时候我们只需要响应某个事件一次，之后自动取消订阅。例如：等待某个初始化完成事件、等待首次连接建立等。这就是 once 的价值——不需要手动在回调里调用 off。

## 错误隔离

这是事件总线实现中非常重要的细节。如果一个事件有多个监听器，其中某个监听器抛出了异常怎么办？如果不做处理，这个异常会中断后续监听器的执行，甚至可能导致整个进程崩溃。

健壮的事件总线应该做到**错误隔离**：每个监听器都用 try/catch 包裹，一个监听器出错不影响其他监听器。最好还能触发一个 error 事件，让应用层可以统一处理错误。

## 异步事件 vs 同步事件

Node.js 内置的 EventEmitter 是**同步**执行监听器的：emit 会按顺序同步执行所有监听器。但在实际应用中，监听器经常是异步函数（比如发消息、写日志、调用远程 API），这时候我们需要考虑执行方式：

- **串行执行（Series）**：一个监听器执行完再执行下一个，适用于有依赖关系的场景
- **并行执行（Parallel）**：所有监听器同时开始执行，等待全部完成后返回，适用于互相独立的场景（类似 Promise.all）

我们的实现将同时支持这两种模式。

## 事件驱动架构的优势

1. **松耦合**：发布者和订阅者互不依赖，可以独立演进
2. **可扩展性**：新增订阅者不需要修改发布者代码，符合开闭原则
3. **灵活性**：可以在运行时动态添加/移除监听器
4. **天然支持异步**：事件模式与异步编程天然契合
5. **易于测试**：模块只需要关心自己的逻辑，可以通过模拟事件来测试

这也是为什么 Node.js 本身就大量使用事件模式——Stream、HTTP、Net 等核心模块都是 EventEmitter 的实例。

## 本章实现

本章我们将实现一个功能完善的事件总线，支持：
- 基本的 on/off/emit/once 方法
- 通配符（*）事件匹配
- 异步监听器的串行/并行执行
- 错误隔离（一个监听器出错不影响其他）
- 监听器数量统计、移除所有监听器等辅助方法
`,
    code: `// ============================================================
// 事件总线实现（支持通配符、异步、错误隔离）
// ============================================================

class EventBus {
  constructor() {
    this.listeners = new Map();
    this.wildcardListeners = [];
  }

  _matchPattern(pattern, eventName) {
    if (pattern === eventName) return true;
    if (!pattern.includes('*')) return false;
    const patternParts = pattern.split('.');
    const eventParts = eventName.split('.');
    if (patternParts.length !== eventParts.length) {
      if (!(patternParts.length === eventParts.length + 1 && patternParts[patternParts.length - 1] === '*')) {
        return false;
      }
    }
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i] === '*') continue;
      if (i >= eventParts.length) return false;
      if (patternParts[i] !== eventParts[i]) return false;
    }
    return true;
  }

  _collectListeners(eventName) {
    const matched = [];
    const exactListeners = this.listeners.get(eventName);
    if (exactListeners) {
      matched.push(...exactListeners);
    }
    for (const { pattern, listeners } of this.wildcardListeners) {
      if (this._matchPattern(pattern, eventName)) {
        matched.push(...listeners);
      }
    }
    return matched;
  }

  on(event, listener) {
    if (event.includes('*')) {
      let wildcardEntry = this.wildcardListeners.find(w => w.pattern === event);
      if (!wildcardEntry) {
        wildcardEntry = { pattern: event, listeners: [] };
        this.wildcardListeners.push(wildcardEntry);
      }
      wildcardEntry.listeners.push(listener);
    } else {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(listener);
    }
    return this;
  }

  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      return listener.apply(this, args);
    };
    wrapper._original = listener;
    return this.on(event, wrapper);
  }

  off(event, listener) {
    if (!listener) {
      if (event.includes('*')) {
        this.wildcardListeners = this.wildcardListeners.filter(w => w.pattern !== event);
      } else {
        this.listeners.delete(event);
      }
      return this;
    }
    if (event.includes('*')) {
      const wildcardEntry = this.wildcardListeners.find(w => w.pattern === event);
      if (wildcardEntry) {
        wildcardEntry.listeners = wildcardEntry.listeners.filter(
          l => l !== listener && l._original !== listener
        );
      }
    } else {
      const listeners = this.listeners.get(event);
      if (listeners) {
        const filtered = listeners.filter(l => l !== listener && l._original !== listener);
        if (filtered.length > 0) {
          this.listeners.set(event, filtered);
        } else {
          this.listeners.delete(event);
        }
      }
    }
    return this;
  }

  emit(event, ...args) {
    const listeners = this._collectListeners(event);
    const results = [];
    const errors = [];
    for (const listener of listeners) {
      try {
        const result = listener(...args);
        results.push(result);
      } catch (err) {
        errors.push({ listener: listener.name || 'anonymous', error: err });
        if (event !== 'error') {
          this.emit('error', err, { event, listener: listener.name || 'anonymous' });
        }
      }
    }
    return { results, errors, listenerCount: listeners.length };
  }

  async emitParallel(event, ...args) {
    const listeners = this._collectListeners(event);
    const promises = listeners.map(async (listener) => {
      try {
        return await listener(...args);
      } catch (err) {
        if (event !== 'error') {
          this.emit('error', err, { event, listener: listener.name || 'anonymous' });
        }
        throw err;
      }
    });
    const results = await Promise.allSettled(promises);
    return {
      results: results.filter(r => r.status === 'fulfilled').map(r => r.value),
      errors: results.filter(r => r.status === 'rejected').map(r => r.reason),
      listenerCount: listeners.length
    };
  }

  async emitSeries(event, ...args) {
    const listeners = this._collectListeners(event);
    const results = [];
    const errors = [];
    for (const listener of listeners) {
      try {
        const result = await listener(...args);
        results.push(result);
      } catch (err) {
        errors.push(err);
        if (event !== 'error') {
          this.emit('error', err, { event, listener: listener.name || 'anonymous' });
        }
      }
    }
    return { results, errors, listenerCount: listeners.length };
  }

  listenerCount(event) {
    if (event) {
      return this._collectListeners(event).length;
    }
    let count = 0;
    for (const listeners of this.listeners.values()) {
      count += listeners.length;
    }
    for (const { listeners } of this.wildcardListeners) {
      count += listeners.length;
    }
    return count;
  }

  eventNames() {
    const names = Array.from(this.listeners.keys());
    for (const { pattern } of this.wildcardListeners) {
      if (!names.includes(pattern)) names.push(pattern);
    }
    return names;
  }

  removeAllListeners(event) {
    if (event) {
      this.off(event);
    } else {
      this.listeners.clear();
      this.wildcardListeners = [];
    }
    return this;
  }
}

console.log("========================================");
console.log("  事件总线（Event Bus）演示");
console.log("========================================");

const bus = new EventBus();

console.log("\\n--- 1. 基础订阅/发布 ---");
bus.on('user:login', (user) => {
  console.log("  [监听器1] 用户 " + user.name + " 登录了");
});
bus.on('user:login', (user) => {
  console.log("  [监听器2] 记录日志: " + user.name + " 于 " + new Date().toLocaleTimeString() + " 登录");
});
bus.emit('user:login', { id: 1, name: '张三' });

console.log("\\n--- 2. 一次性事件（once）---");
let initCount = 0;
bus.once('app:ready', () => {
  initCount++;
  console.log("  应用初始化完成（只会触发一次，当前次数: " + initCount + "）");
});
bus.emit('app:ready');
bus.emit('app:ready');
console.log("  触发两次后，实际执行次数: " + initCount);

console.log("\\n--- 3. 通配符监听 ---");
bus.on('user:*', (data, meta) => {
  console.log("  [通配符 user:*] 捕获到事件");
});
bus.on('*.error', (err) => {
  console.log("  [通配符 *.error] 捕获错误: " + err.message);
});
bus.emit('user:logout', { id: 1, name: '张三' });
bus.emit('order:error', new Error('订单创建失败'));

console.log("\\n--- 4. 错误隔离（一个监听器出错不影响其他）---");
bus.on('data:process', () => console.log('  监听器A：正常执行'));
bus.on('data:process', () => { throw new Error('监听器B出错了！'); });
bus.on('data:process', () => console.log('  监听器C：依然正常执行'));
bus.on('error', (err, meta) => {
  console.log("  [错误处理] 事件 '" + meta.event + "' 中 '" + meta.listener + "' 抛出: " + err.message);
});
const result = bus.emit('data:process');
console.log("  执行完成，共 " + result.listenerCount + " 个监听器，" + result.errors.length + " 个错误");

console.log("\\n--- 5. 异步监听器（并行执行）---");
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
bus.on('task:parallel', async (id) => {
  await delay(100);
  console.log("  异步任务 " + id + "-A 完成");
  return id + "-A";
});
bus.on('task:parallel', async (id) => {
  await delay(50);
  console.log("  异步任务 " + id + "-B 完成（更快）");
  return id + "-B";
});
(async () => {
  console.log("  并行执行中...");
  const parallelResult = await bus.emitParallel('task:parallel', 'T1');
  console.log("  并行完成，结果顺序: " + parallelResult.results.join(', '));

  console.log("\\n--- 6. 异步监听器（串行执行）---");
  bus.removeAllListeners('task:parallel');
  bus.on('task:series', async (step) => {
    await delay(30);
    console.log("  步骤" + step + "-1 完成");
  });
  bus.on('task:series', async (step) => {
    await delay(30);
    console.log("  步骤" + step + "-2 完成");
  });
  console.log("  串行执行中...");
  await bus.emitSeries('task:series', 'S');
  console.log("  串行完成！");

  console.log("\\n--- 7. 统计信息 ---");
  console.log("  已注册的事件:", bus.eventNames());
  console.log("  总监听器数量:", bus.listenerCount());
  console.log("  user:login 监听器数量:", bus.listenerCount('user:login'));

  console.log("\\n🎉 事件总线演示完成！");
})();
`
  },
  {
    id: "n2-promise-queue",
    icon: "📋",
    group: "第五部分 实战案例",
    title: "实现一个 Promise 队列与并发控制",
    content: `## 为什么需要并发控制？

在现代异步编程中，我们经常需要处理大量的并发任务：批量读取文件、批量请求 API、批量处理数据等。直觉上你可能会想："Promise 不是支持并发吗？直接 Promise.all 不就行了？"但问题在于，**无限制的并发是危险的**。

想象一下这些场景：
- 你需要调用一个第三方 API，但对方限制每秒最多 5 个请求，并发太大会被限流甚至封禁
- 你需要读取 1000 个文件，但操作系统对文件描述符数量有限制（默认通常是 1024），同时打开太多文件会报错
- 你需要进行数据库查询，数据库连接池只有 10 个连接，并发超过 10 就会排队等待甚至超时
- 你要爬取一个网站，并发太高会给对方服务器造成压力，甚至被封 IP

这时候**并发控制**就至关重要了。它的核心思想很简单：**在任何时刻，同时执行的任务数量不超过设定的最大值**。当一个任务完成后，再从队列中取下一个任务执行。

这就像银行窗口：银行有 3 个窗口，最多同时服务 3 个客户；新来的客户取号排队；某个窗口服务完一个客户，叫下一个号。

## p-limit 库的原理

[p-limit](https://github.com/sindresorhus/p-limit) 是 npm 上非常流行的并发控制库，周下载量超过 1 亿次。它的核心原理非常精简：

1. 维护一个**任务队列**和**当前活跃任务计数**
2. 调用 limit(fn, ...args) 时：
   - 如果活跃数 < 并发上限：立即执行，活跃数+1
   - 否则：将任务包装后放入队列
3. 每个任务执行完成后：
   - 活跃数-1
   - 如果队列不为空，取出下一个任务执行
4. 返回一个 Promise，resolve/reject 对应任务的结果

p-limit 的核心代码其实只有几十行，是一个非常经典的"看似简单但设计精巧"的工具。

## 并发队列的核心设计

一个完善的 Promise 并发队列应该考虑这些功能点：

### 1. 基本并发控制
这是最核心的能力——设置最大并发数，自动调度任务执行。

### 2. 任务超时处理
某些任务可能因为网络问题或其他原因长时间挂起，如果不做超时处理，可能会把整个队列"堵死"（并发槽位一直被占用）。每个任务应该支持设置超时时间。

### 3. 任务优先级
在实际场景中，不是所有任务都平等。比如：用户发起的请求优先级应该高于后台预加载任务。队列应该支持优先级，高优先级任务可以插队。

### 4. 暂停与恢复
有时候我们需要临时暂停队列处理（比如检测到系统负载过高时），等情况好转后再恢复处理。

### 5. 事件通知
队列状态变化时（任务完成、任务出错、队列空了、全部完成）应该发出事件通知，方便外部做统计和监控。

### 6. 错误处理策略
- **快速失败（Fail Fast）**：一个任务失败就中止整个队列
- **继续执行**：失败的任务记录错误，其他任务继续执行（默认）
- **重试机制**：失败的任务自动重试 N 次

async.queue（async 库中的经典方法）是另一种思路，它是基于回调的，但核心思想和 Promise 队列是一致的。

## 本章实现

本章我们将实现一个功能完整的 **Promise 并发队列**，支持：
- 设置最大并发数
- 添加任务到队列，返回 Promise
- 任务超时处理
- 任务优先级
- 暂停/恢复功能
- 事件通知（基于 Node.js EventEmitter）
- 统计信息（等待中、运行中、已完成、失败数）
- 等待所有任务完成
- 清空等待队列

我们会用 setTimeout 模拟异步任务，演示 3 个并发下运行 10 个任务的执行顺序，让你直观看到并发控制的效果。
`,
    code: `// ============================================================
// Promise 并发队列实现（支持超时、优先级、暂停/恢复）
// 使用 Node.js 内置 EventEmitter
// ============================================================

const EventEmitter = require('events');

class PromiseQueue extends EventEmitter {
  constructor(options = {}) {
    super();
    this.concurrency = options.concurrency || 1;
    this.running = 0;
    this.queue = [];
    this.completedCount = 0;
    this.failedCount = 0;
    this.timeoutMs = options.timeout || 0;
    this.paused = false;
    this._idCounter = 0;
    this._emptyWaiters = [];
    this._drainWaiters = [];
  }

  add(taskFn, options = {}) {
    const id = ++this._idCounter;
    const priority = options.priority || 0;
    const timeout = options.timeout || this.timeoutMs;
    return new Promise((resolve, reject) => {
      const task = {
        id,
        fn: taskFn,
        resolve,
        reject,
        priority,
        timeout
      };
      const insertIndex = this.queue.findIndex(t => t.priority < priority);
      if (insertIndex === -1) {
        this.queue.push(task);
      } else {
        this.queue.splice(insertIndex, 0, task);
      }
      this.emit('taskAdded', { id, waiting: this.queue.length });
      this._next();
    });
  }

  async _runTask(task) {
    this.running++;
    this.emit('taskStart', { id: task.id, running: this.running });
    let timeoutId = null;
    try {
      let resultPromise = task.fn();
      if (task.timeout > 0) {
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error("Task #" + task.id + " timed out after " + task.timeout + "ms"));
          }, task.timeout);
        });
        resultPromise = Promise.race([resultPromise, timeoutPromise]);
      }
      const result = await resultPromise;
      if (timeoutId) clearTimeout(timeoutId);
      task.resolve(result);
      this.completedCount++;
      this.emit('taskComplete', { id: task.id, result, completed: this.completedCount });
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      task.reject(err);
      this.failedCount++;
      this.emit('taskError', { id: task.id, error: err, failed: this.failedCount });
    } finally {
      this.running--;
      this._checkEmpty();
      this._checkDrain();
      this._next();
    }
  }

  _next() {
    if (this.paused) return;
    while (this.running < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift();
      this._runTask(task);
    }
  }

  _checkEmpty() {
    if (this.queue.length === 0) {
      this.emit('empty', { waiting: 0 });
      const waiters = this._emptyWaiters;
      this._emptyWaiters = [];
      waiters.forEach(resolve => resolve());
    }
  }

  _checkDrain() {
    if (this.running === 0 && this.queue.length === 0) {
      this.emit('drain', { completed: this.completedCount, failed: this.failedCount });
      const waiters = this._drainWaiters;
      this._drainWaiters = [];
      waiters.forEach(resolve => resolve());
    }
  }

  pause() {
    this.paused = true;
    this.emit('pause');
  }

  resume() {
    this.paused = false;
    this.emit('resume');
    this._next();
  }

  async onEmpty() {
    if (this.queue.length === 0) return;
    return new Promise(resolve => this._emptyWaiters.push(resolve));
  }

  async onDrain() {
    if (this.running === 0 && this.queue.length === 0) return;
    return new Promise(resolve => this._drainWaiters.push(resolve));
  }

  clear() {
    const cleared = this.queue.length;
    for (const task of this.queue) {
      task.reject(new Error('Queue cleared'));
    }
    this.queue = [];
    return cleared;
  }

  getStats() {
    return {
      concurrency: this.concurrency,
      running: this.running,
      waiting: this.queue.length,
      completed: this.completedCount,
      failed: this.failedCount,
      paused: this.paused
    };
  }
}

console.log("========================================");
console.log("  Promise 并发队列演示");
console.log("  配置：最大并发数 = 3");
console.log("========================================");

const queue = new PromiseQueue({ concurrency: 3, timeout: 5000 });

const eventLog = [];
queue.on('taskStart', (e) => {
  eventLog.push("▶️  任务 #" + e.id + " 开始");
});
queue.on('taskComplete', (e) => {
  eventLog.push("✅ 任务 #" + e.id + " 完成");
});
queue.on('taskError', (e) => {
  eventLog.push("❌ 任务 #" + e.id + " 失败: " + e.error.message);
});

const delay = (ms, result) => new Promise(resolve => setTimeout(() => resolve(result), ms));

console.log("\\n添加 10 个异步任务（每个耗时 200-600ms 随机）：");
const taskPromises = [];
for (let i = 1; i <= 10; i++) {
  const taskTime = 200 + Math.floor(Math.random() * 400);
  const p = queue.add(
    () => delay(taskTime, "任务" + i + "结果"),
    i % 3 === 0 ? { priority: 10 } : {}
  );
  taskPromises.push(p.catch(err => null));
  console.log("  添加任务 #" + i + "，预计耗时 " + taskTime + "ms" + (i % 3 === 0 ? "（高优先级）" : ""));
}

console.log("\\n--- 实时执行状态 ---");
const statusInterval = setInterval(() => {
  const stats = queue.getStats();
  console.log("  ⏱️  运行中: " + stats.running + ", 等待: " + stats.waiting + ", 完成: " + stats.completed + ", 失败: " + stats.failed);
}, 150);

(async () => {
  await queue.onDrain();
  clearInterval(statusInterval);

  console.log("\\n--- 执行顺序日志 ---");
  eventLog.forEach(log => console.log("  " + log));

  console.log("\\n最终统计:", queue.getStats());

  console.log("\\n--- 演示：暂停与恢复 ---");
  const queue2 = new PromiseQueue({ concurrency: 2 });
  queue2.add(() => delay(200, 'A1')).then(r => console.log('  任务A1 完成'));
  queue2.add(() => delay(200, 'A2')).then(r => console.log('  任务A2 完成'));
  queue2.add(() => delay(200, 'A3')).then(r => console.log('  任务A3 完成'));
  queue2.add(() => delay(200, 'A4')).then(r => console.log('  任务A4 完成'));
  setTimeout(() => {
    console.log('  ⏸️  暂停队列（运行中的任务继续，但不启动新任务）');
    queue2.pause();
    setTimeout(() => {
      console.log('  ▶️  恢复队列');
      queue2.resume();
    }, 600);
  }, 150);

  await queue2.onDrain();
  console.log("\\n--- 演示：超时处理 ---");
  const queue3 = new PromiseQueue({ concurrency: 1, timeout: 300 });
  queue3.add(() => delay(500, '慢速任务'))
    .then(r => console.log("  慢速任务结果: " + r))
    .catch(err => console.log("  慢速任务错误: " + err.message));
  queue3.add(() => delay(100, '快速任务'))
    .then(r => console.log("  快速任务结果: " + r))
    .catch(err => console.log("  快速任务错误: " + err.message));
  await queue3.onDrain();

  console.log("\\n🎉 Promise 队列演示完成！");
})();
`
  },
  {
    id: "n2-orm",
    icon: "🗃️",
    group: "第五部分 实战案例",
    title: "实现一个简单的 ORM/数据访问层",
    content: `## ORM：对象关系映射的思想

ORM（Object-Relational Mapping，对象关系映射）是一种编程技术，它在关系型数据库和面向对象编程语言之间建立映射关系，让开发者可以用操作对象的方式来操作数据库，而不需要手写 SQL。

为什么需要 ORM 或者说数据访问层？因为**直接在业务代码中散落 SQL 语句是非常糟糕的实践**：
1. **难以维护**：SQL 和业务逻辑耦合在一起，改表结构需要到处找 SQL
2. **容易出错**：手动拼接 SQL 极易产生 SQL 注入漏洞
3. **重复代码多**：每个查询都要写连接、执行、处理结果的样板代码
4. **难以切换数据库**：从 MySQL 切换到 PostgreSQL 可能需要改大量 SQL
5. **无法统一管理**：连接池、事务、日志、缓存等横切关注点无法统一处理

数据访问层（Data Access Layer, DAL）的作用就是将数据访问逻辑抽象出来，业务层只调用方法，不关心底层是 SQL 还是 NoSQL，是 MySQL 还是 MongoDB。

## Repository 模式

Repository（仓储）模式是数据访问层最常用的设计模式之一。它的核心思想是：**将数据访问逻辑封装在 Repository 类中，对外提供领域级别的 API**。例如：

\`\`\`javascript
// 业务代码不需要知道 SQL，只调用 Repository 方法
const user = await userRepository.findById(1);  // 定义常量 user
const users = await userRepository.findByAge(18, 30);  // 定义常量 users
await userRepository.update(1, { name: '新名字' });  // 等待 Promise 完成后再继续
\`\`\`

每个实体（表）对应一个 Repository，封装了该表的所有 CRUD（增删改查）操作。这让业务代码变得非常清晰，而且 Repository 内部可以自由替换实现（比如从内存实现换成真实数据库实现，业务代码不需要改一行）。

## 查询构建器（Query Builder）原理

查询构建器提供了**链式调用**的方式来构建 SQL，它比 ORM 更接近原生 SQL，但又避免了手动拼接字符串的痛苦和风险。例如 Knex.js 就是一个经典的查询构建器：

\`\`\`javascript
// 链式调用构建查询
knex('users')
  .select('id', 'name', 'email')
  .where('age', '>', 18)
  .where('status', 'active')
  .orderBy('created_at', 'desc')
  .limit(10)
// 生成的 SQL:
// SELECT id, name, email FROM users
// WHERE age > 18 AND status = 'active'
// ORDER BY created_at DESC LIMIT 10
\`\`\`

查询构建器的实现核心在于：**每个方法都返回 this（查询构建器实例本身）**，这样就可以一直链式调用下去。最后调用执行方法（如 execute()、first()、all()）时才真正生成 SQL 或执行操作。

## SQL 注入与参数化查询

SQL 注入是最经典、最危险的 Web 安全漏洞之一。假设你写了这样的代码：

\`\`\`javascript
// ❌ 危险！SQL 注入漏洞
const sql = \`SELECT * FROM users WHERE name = '\${userName}'\`;  // 定义常量 sql
// 如果 userName 输入: ' OR '1'='1
// 最终 SQL: SELECT * FROM users WHERE name = '' OR '1'='1'
// 这会返回所有用户数据！更严重的可以删表、提权
\`\`\`

正确的做法是使用**参数化查询**（Prepared Statements）：SQL 语句中用占位符（如 ? 或 $1）代替实际值，实际值通过参数单独传递，数据库驱动会安全地处理转义：

\`\`\`javascript
// ✅ 安全的参数化查询
const sql = 'SELECT * FROM users WHERE name = ?';  // 定义常量 sql
db.query(sql, [userName]);
\`\`\`

我们的查询构建器会自动使用参数化占位符，避免 SQL 注入。

## 链式调用的实现技巧

链式调用的实现有几个关键技巧：
1. **方法返回 this**：每个配置方法（select、where、orderBy 等）最后都 return this，让调用可以继续
2. **内部状态对象**：查询构建器内部维护一个状态对象，保存 select 字段、where 条件、排序规则等
3. **不可变拷贝（可选）**：某些场景下希望链式调用不修改原对象（方便复用基础查询），可以返回新实例
4. **终结方法**：build()、execute()、first() 等方法是终结方法，它们不返回 this，而是返回最终结果

## 本章实现

本章我们将实现两个核心组件：

1. **QueryBuilder**：链式调用的 SQL 查询构建器，支持 select、where、orderBy、limit、insert、update、delete 操作，自动生成参数化 SQL 和参数数组
2. **Repository**：基于内存数组模拟数据库的仓储类，封装 CRUD 操作，内部使用 QueryBuilder 构建查询

为了演示和沙箱运行方便，我们用**内存数组**模拟数据库，但设计上 Repository 可以轻松替换为真实数据库实现。
`,
    code: `// ============================================================
// 简易 ORM：查询构建器 + Repository 模式
// ============================================================

class QueryBuilder {
  constructor(tableName) {
    this._table = tableName;
    this._select = ['*'];
    this._where = [];
    this._params = [];
    this._orderBy = [];
    this._limit = null;
    this._offset = null;
    this._type = 'select';
    this._data = null;
  }

  select(...fields) {
    if (fields.length === 1 && Array.isArray(fields[0])) {
      fields = fields[0];
    }
    this._select = fields.length > 0 ? fields : ['*'];
    return this;
  }

  where(field, operator, value) {
    if (value === undefined) {
      value = operator;
      operator = '=';
    }
    const allowedOps = ['=', '!=', '<>', '>', '<', '>=', '<=', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN'];
    if (!allowedOps.includes(operator.toUpperCase())) {
      throw new Error('不支持的操作符: ' + operator);
    }
    this._where.push({ field, operator: operator.toUpperCase(), value, logic: 'AND' });
    return this;
  }

  orWhere(field, operator, value) {
    if (value === undefined) {
      value = operator;
      operator = '=';
    }
    this._where.push({ field, operator: operator.toUpperCase(), value, logic: 'OR' });
    return this;
  }

  orderBy(field, direction = 'ASC') {
    this._orderBy.push({ field, direction: direction.toUpperCase() });
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  offset(n) {
    this._offset = n;
    return this;
  }

  insert(data) {
    this._type = 'insert';
    this._data = data;
    return this;
  }

  update(data) {
    this._type = 'update';
    this._data = data;
    return this;
  }

  delete() {
    this._type = 'delete';
    return this;
  }

  _buildWhere() {
    if (this._where.length === 0) return { sql: '', params: [] };
    const conditions = [];
    const params = [];
    for (let i = 0; i < this._where.length; i++) {
      const { field, operator, value, logic } = this._where[i];
      const prefix = i === 0 ? '' : logic + ' ';
      if (operator === 'IN' || operator === 'NOT IN') {
        const placeholders = value.map(() => '?').join(', ');
        conditions.push(prefix + field + " " + operator + " (" + placeholders + ")");
        params.push(...value);
      } else {
        conditions.push(prefix + field + " " + operator + " ?");
        params.push(value);
      }
    }
    return { sql: 'WHERE ' + conditions.join(' '), params };
  }

  build() {
    this._params = [];
    let sql = '';
    switch (this._type) {
      case 'select': {
        sql = 'SELECT ' + this._select.join(', ') + ' FROM ' + this._table;
        const where = this._buildWhere();
        if (where.sql) {
          sql += ' ' + where.sql;
          this._params.push(...where.params);
        }
        if (this._orderBy.length > 0) {
          sql += ' ORDER BY ' + this._orderBy.map(o => o.field + " " + o.direction).join(', ');
        }
        if (this._limit !== null) {
          sql += ' LIMIT ' + this._limit;
        }
        if (this._offset !== null) {
          sql += ' OFFSET ' + this._offset;
        }
        break;
      }
      case 'insert': {
        const fields = Object.keys(this._data);
        const placeholders = fields.map(() => '?').join(', ');
        sql = 'INSERT INTO ' + this._table + ' (' + fields.join(', ') + ') VALUES (' + placeholders + ')';
        this._params = fields.map(f => this._data[f]);
        break;
      }
      case 'update': {
        const fields = Object.keys(this._data);
        const setClause = fields.map(f => f + ' = ?').join(', ');
        sql = 'UPDATE ' + this._table + ' SET ' + setClause;
        this._params = fields.map(f => this._data[f]);
        const where = this._buildWhere();
        if (where.sql) {
          sql += ' ' + where.sql;
          this._params.push(...where.params);
        }
        break;
      }
      case 'delete': {
        sql = 'DELETE FROM ' + this._table;
        const where = this._buildWhere();
        if (where.sql) {
          sql += ' ' + where.sql;
          this._params.push(...where.params);
        }
        break;
      }
    }
    return { sql, params: [...this._params] };
  }

  toSQL() {
    const { sql, params } = this.build();
    let paramIndex = 0;
    return sql.replace(/\\?/g, () => {
      const val = params[paramIndex++];
      if (typeof val === 'string') return "'" + val.replace(/'/g, "''") + "'";
      if (val === null) return 'NULL';
      return String(val);
    });
  }
}

class Repository {
  constructor(tableName, initialData = []) {
    this.tableName = tableName;
    this._data = [...initialData];
    this._nextId = initialData.length > 0
      ? Math.max(...initialData.map(d => d.id || 0)) + 1
      : 1;
  }

  query() {
    return new QueryBuilder(this.tableName);
  }

  _matchesCondition(record, where) {
    if (where.length === 0) return true;
    let result = null;
    for (const cond of where) {
      const value = record[cond.field];
      let match;
      switch (cond.operator) {
        case '=': match = value === cond.value; break;
        case '!=': case '<>': match = value !== cond.value; break;
        case '>': match = value > cond.value; break;
        case '<': match = value < cond.value; break;
        case '>=': match = value >= cond.value; break;
        case '<=': match = value <= cond.value; break;
        case 'LIKE': {
          const pattern = cond.value.replace(/%/g, '.*').replace(/_/g, '.');
          match = new RegExp('^' + pattern + '$').test(String(value));
          break;
        }
        case 'NOT LIKE': {
          const pattern = cond.value.replace(/%/g, '.*').replace(/_/g, '.');
          match = !new RegExp('^' + pattern + '$').test(String(value));
          break;
        }
        case 'IN': match = Array.isArray(cond.value) && cond.value.includes(value); break;
        case 'NOT IN': match = !Array.isArray(cond.value) || !cond.value.includes(value); break;
        default: match = false;
      }
      if (result === null) {
        result = match;
      } else if (cond.logic === 'AND') {
        result = result && match;
      } else {
        result = result || match;
      }
    }
    return result;
  }

  _executeQuery(qb) {
    const built = qb.build();
    if (built.sql.startsWith('SELECT')) {
      let results = this._data.filter(r => this._matchesCondition(r, qb._where));
      if (qb._orderBy.length > 0) {
        results.sort((a, b) => {
          for (const { field, direction } of qb._orderBy) {
            if (a[field] < b[field]) return direction === 'ASC' ? -1 : 1;
            if (a[field] > b[field]) return direction === 'ASC' ? 1 : -1;
          }
          return 0;
        });
      }
      if (qb._select[0] !== '*') {
        results = results.map(r => {
          const picked = {};
          for (const f of qb._select) picked[f] = r[f];
          return picked;
        });
      }
      if (qb._offset) results = results.slice(qb._offset);
      if (qb._limit !== null) results = results.slice(0, qb._limit);
      return results;
    }
    return built;
  }

  findAll() {
    return [...this._data];
  }

  findById(id) {
    return this._data.find(r => r.id === id) || null;
  }

  findOne(predicate) {
    if (typeof predicate === 'object') {
      return this._data.find(r => {
        for (const [k, v] of Object.entries(predicate)) {
          if (r[k] !== v) return false;
        }
        return true;
      }) || null;
    }
    return this._data.find(predicate) || null;
  }

  where(conditions) {
    return this._data.filter(r => {
      for (const [k, v] of Object.entries(conditions)) {
        if (r[k] !== v) return false;
      }
      return true;
    });
  }

  create(record) {
    const newRecord = { id: this._nextId++, ...record };
    this._data.push(newRecord);
    return newRecord;
  }

  update(id, updates) {
    const index = this._data.findIndex(r => r.id === id);
    if (index === -1) return null;
    this._data[index] = { ...this._data[index], ...updates, id };
    return this._data[index];
  }

  delete(id) {
    const index = this._data.findIndex(r => r.id === id);
    if (index === -1) return false;
    this._data.splice(index, 1);
    return true;
  }

  count(predicate) {
    if (!predicate) return this._data.length;
    return this._data.filter(predicate).length;
  }
}

console.log("========================================");
console.log("  简易 ORM / 数据访问层演示");
console.log("========================================");

const users = [
  { id: 1, name: '张三', age: 28, email: 'zhangsan@example.com', status: 'active', createdAt: '2024-01-15' },
  { id: 2, name: '李四', age: 22, email: 'lisi@example.com', status: 'active', createdAt: '2024-02-20' },
  { id: 3, name: '王五', age: 35, email: 'wangwu@example.com', status: 'inactive', createdAt: '2024-01-10' },
  { id: 4, name: '赵六', age: 19, email: 'zhaoliu@example.com', status: 'active', createdAt: '2024-03-05' },
  { id: 5, name: '钱七', age: 31, email: 'qianqi@example.com', status: 'active', createdAt: '2024-02-28' }
];

const userRepo = new Repository('users', users);

console.log("\\n--- 1. 查询构建器生成 SQL ---");
const qb1 = new QueryBuilder('users')
  .select('id', 'name', 'email')
  .where('age', '>=', 25)
  .where('status', '=', 'active')
  .orderBy('age', 'DESC')
  .limit(10);
console.log("  SQL:", qb1.toSQL());
console.log("  参数:", qb1.build().params);

const qb2 = new QueryBuilder('users').insert({ name: '新用户', age: 25, email: 'new@example.com', status: 'active' });
console.log("  INSERT SQL:", qb2.toSQL());

const qb3 = new QueryBuilder('users').update({ status: 'inactive' }).where('id', '=', 99);
console.log("  UPDATE SQL:", qb3.toSQL());

const qb4 = new QueryBuilder('users').delete().where('status', '=', 'banned');
console.log("  DELETE SQL:", qb4.toSQL());

console.log("\\n--- 2. Repository CRUD 操作 ---");
console.log("  初始用户数量:", userRepo.count());

console.log("\\n  findById(3):", userRepo.findById(3));

console.log("\\n  findOne({ status: 'inactive' }):", userRepo.findOne({ status: 'inactive' }));

console.log("\\n  where({ status: 'active' }):");
userRepo.where({ status: 'active' }).forEach(u => {
  console.log("    - " + u.name + " (" + u.age + "岁, " + u.email + ")");
});

console.log("\\n--- 3. 创建新用户 ---");
const newUser = userRepo.create({ name: '孙八', age: 27, email: 'sunba@example.com', status: 'active' });
console.log("  新创建的用户:", newUser);
console.log("  创建后总数:", userRepo.count());

console.log("\\n--- 4. 更新用户 ---");
const updated = userRepo.update(2, { age: 23, email: 'lisi_new@example.com' });
console.log("  更新后的用户:", updated);

console.log("\\n--- 5. 删除用户 ---");
const deleted = userRepo.delete(3);
console.log("  删除用户3（王五）:", deleted ? '成功' : '失败');
console.log("  删除后总数:", userRepo.count());
console.log("  删除后用户列表:", userRepo.findAll().map(u => u.name).join(', '));

console.log("\\n--- 6. 复杂查询（使用 QueryBuilder 执行）---");
const qb = userRepo.query()
  .select('name', 'age', 'email')
  .where('age', '>=', 25)
  .where('status', '=', 'active')
  .orderBy('age', 'ASC')
  .limit(5);
console.log("  生成 SQL:", qb.toSQL());
const results = userRepo._executeQuery(qb);
console.log("  查询结果（活跃用户，年龄>=25，按年龄排序）:");
results.forEach(u => {
  console.log("    - " + u.name + ", " + u.age + "岁, " + u.email);
});

console.log("\\n--- 7. IN 查询 / 模糊查询 ---");
const qbIn = userRepo.query().where('id', 'IN', [1, 2, 5]);
console.log("  ID IN (1,2,5) 的 SQL:", qbIn.toSQL());
console.log("  结果:", userRepo._executeQuery(qbIn).map(u => u.name));

const qbLike = userRepo.query().where('name', 'LIKE', '%三%');
console.log("  名字包含'三'的 SQL:", qbLike.toSQL());
console.log("  结果:", userRepo._executeQuery(qbLike).map(u => u.name));

console.log("\\n🎉 ORM / 数据访问层演示完成！");
`
  },
  {
    id: "n2-conclusion",
    icon: "🎓",
    group: "结尾",
    title: "结语：持续精进的 Node.js 之路",
    content: `## 回顾我们的学习旅程

到这里，Node.js 进阶教程的内容就要告一段落了。让我们先回顾一下在整个教程中学到了什么：

从**核心模块**开始，我们深入了 events 模块的事件驱动机制，理解了 EventEmitter 如何成为 Node.js 的基石；学习了 stream 模块的四种流类型（Readable、Writable、Duplex、Transform），掌握了背压控制和管道操作；我们用 fs 模块进行文件 I/O，区分了同步、回调、Promise 三种风格；用 crypto 模块进行加密哈希、HMAC、对称和非对称加密；用 util.promisify 告别回调地狱；用 child_process 创建子进程执行外部命令。

在**异步编程**的世界中，我们彻底搞懂了事件循环的六个阶段，理解了微任务和宏任务的执行顺序；我们深入 Promise 的原理，从基础用法到 Promise.all/race/allSettled/any，再到 async/await 的本质；我们掌握了定时器的精细用法和 process.nextTick 的优先级；甚至尝试手写了 Promise 的实现，理解了其内部状态机的工作原理。

在**性能与实战**部分，我们学习了用 cluster 和 worker_threads 进行多进程/多线程编程，应对 CPU 密集型任务；理解了内存管理和垃圾回收机制，知道了如何避免内存泄漏；我们实现了限流器保护服务，实现了 LRU 缓存提升性能，实现了事件总线解耦模块，实现了 Promise 队列控制并发，实现了简单的 ORM 抽象数据访问。

这些知识和技能不是孤立的点，而是一张网——当你真正理解它们之间的联系，你就能从"会用 Node.js 写代码"成长为"能设计高质量 Node.js 系统"。

## Node.js 的未来发展方向

Node.js 生态仍在快速演进，几个值得关注的方向：

1. **TypeScript 成为事实标准**：越来越多的 Node.js 项目使用 TypeScript 开发，NestJS、Fastify 等框架都原生支持 TS。类型安全在大型项目中带来的收益已经被广泛验证。

2. **Web 标准 API 收敛**：Node.js 正在积极拥抱 Web 标准，内置 fetch、Web Streams、Web Crypto、Blob、FormData 等 API。未来在 Node.js 和浏览器之间写同构代码会越来越顺畅。

3. **ESM 完全成熟**：CommonJS 与 ESM 的互操作性问题正在逐步解决，新项目可以放心使用 ESM，打包和 Tree Shaking 体验更好。

4. **运行时竞争与创新**：Deno、Bun 等新运行时带来了竞争压力，促使 Node.js 持续改进性能和开发者体验。Bun 的性能表现、Deno 的安全模型都值得学习借鉴。

5. **AI 与边缘计算**：Vercel Edge Functions、Cloudflare Workers 等边缘计算平台大量使用 Node.js 兼容的 API，Serverless + Node.js 正在成为新的部署范式。

6. **可观测性内置**：OpenTelemetry、diagnostics_channel 等让 Node.js 应用的监控、追踪、调试变得更加容易。

## 进阶学习路径

学完本教程只是一个开始，真正的精进之路还很长。以下是推荐的进阶学习路径：

### 深入底层原理

- **学习 libuv 源码**：理解事件循环、线程池、I/O 完成端口的真正实现。libuv 的官方文档和源码（C 语言）是最好的教材。
- **学习 V8 引擎**：理解 JIT 编译（Ignition + TurboFan）、垃圾回收（Orinoco/Scavenger/Mark-Compact）、隐藏类（Hidden Class）、内联缓存（Inline Cache）等概念，这些能帮你写出对 V8 更友好的高性能代码。
- **理解 Node.js 启动过程**：从 node 命令执行到用户代码加载，中间发生了什么？require 函数的实现原理是什么？Node.js 的启动 bootstrap 过程值得一读。

### 框架学习

- **NestJS**：目前最流行的企业级 Node.js 框架，深度使用 TypeScript，采用 Angular 风格的模块化架构，内置 DI（依赖注入）、守卫、拦截器、管道等概念，非常适合大型后端项目。
- **Fastify**：以性能著称的 Web 框架，比 Express 快 2-3 倍，JSON Schema 验证、插件体系设计优秀。
- **Egg.js**：阿里开源的企业级框架，基于 Koa，"约定优于配置"，适合团队协作。
- **tRPC**：端到端类型安全的 API 层，让前后端类型自动同步，在 TypeScript 项目中体验极佳。

### 网络编程

- **深入 TCP/IP**：理解三次握手/四次挥手、滑动窗口、拥塞控制、TCP 粘包问题，用 net 模块从零手写一个 HTTP 服务器或 RPC 框架。
- **HTTP/2 与 HTTP/3**：多路复用、头部压缩（HPACK/QPACK）、QUIC 协议。
- **gRPC**：基于 HTTP/2 和 Protocol Buffers 的高性能 RPC 框架，跨语言服务通信的首选。
- **WebSocket**：全双工通信协议，结合 Redis 做跨实例消息广播。

### 系统设计与架构

- **微服务设计**：服务拆分原则、API 网关、服务发现、配置中心、链路追踪。
- **消息队列**：RabbitMQ、Kafka、Redis Streams 的适用场景和原理。
- **缓存架构**：多级缓存、缓存一致性策略、Redis 深入学习（持久化、集群、哨兵）。
- **容器化与部署**：Docker、Kubernetes 基础，PM2 进程管理。

## 推荐学习资源

**书籍**：
- 《Node.js 设计模式》—— Mario Casciaro，Node.js 设计模式的经典之作
- 《深入浅出 Node.js》—— 朴灵，中文 Node.js 经典，讲底层原理
- 《Web 性能权威指南》—— Ilya Grigorik，讲网络协议和性能优化
- 《Linux 高性能服务器编程》—— 游双，虽然是 C++ 的，但网络编程思想通用

**在线资源**：
- Node.js 官方文档：https://nodejs.org/docs ，这是最权威的资料
- Node.js 源码：https://github.com/nodejs/node ，最好的学习方式就是读源码
- libuv 官方文档：http://docs.libuv.org/
- V8 博客：https://v8.dev/blog ，了解 V8 最新特性

**开源项目阅读**：
- Express/Koa：理解中间件机制
- Redis 客户端 ioredis：学习如何设计一个高性能网络客户端
- p-limit/p-queue：学习异步并发控制
- Fastify：学习高性能 Web 框架设计

## 工程经验积累的重要性

技术知识可以通过学习快速获取，但**工程经验**只能通过实践积累。以下是一些重要的工程经验：

1. **错误处理不是小事**：不要忽视任何一个 error 事件，不要随便吞掉异常。uncaughtException 和 unhandledRejection 要妥善处理。生产环境的进程崩溃往往就是因为一个没处理的 error 事件。

2. **日志胜于调试**：在生产环境中你无法 attach debugger，好的日志系统（结构化日志、请求 ID、分级日志）是排查问题的生命线。

3. **监控和告警**：CPU、内存、事件循环延迟、GC 停顿、错误率、响应时间——这些指标必须监控。等用户投诉再排查就晚了。

4. **渐进式重构**：不要试图一次性重写整个系统，在日常开发中持续小步重构，保持代码质量。

5. **写测试**：单元测试覆盖核心逻辑，集成测试覆盖关键流程。测试不是负担，而是你重构时的安全网。

6. **性能优化要基于数据**：不要凭感觉优化，用 clinic.js、0x、node --prof 等工具先做 profile，找到真正的瓶颈再下手。

## 技术之外的思考

最后想说，技术能力当然重要，但决定你能走多远的，往往是技术之外的东西：

- **业务理解力**：技术是手段，解决业务问题才是目的。理解你所在的业务领域，才能做出真正有价值的技术决策，而不是为了技术而技术。

- **沟通协作能力**：大部分工作不是一个人完成的。能不能把复杂的技术概念讲清楚？能不能在代码评审中给出建设性意见？能不能和产品经理有效沟通需求？这些能力有时候比写代码更重要。

- **代码品味**：好的代码读起来像散文。命名是否清晰？函数是否简洁？模块划分是否合理？有没有过度设计？这些"感觉"需要长期的代码阅读和写作来培养。

- **持续学习，但不追新焦虑**：前端/Node.js 生态变化很快，新框架层出不穷。基础打牢了，学新东西会很快。不要焦虑于"又出新东西了我还不会"，重要的是理解变化背后的本质。

- **保持好奇心和耐心**：遇到难啃的问题不要轻易放弃，读源码遇到不懂的地方就追下去。那些看似"没用"的深入研究，往往在未来某个时刻给你巨大回报。

## 综合练习

作为最后的代码练习，我们将综合运用本教程中学过的多个核心模块——events（事件通知）、crypto（数据加密）、stream（流式处理）、assert（数据校验）、util（工具函数）——实现一个小型数据处理管道。这个管道模拟一个真实的数据 ETL（Extract-Transform-Load）流程：从数据源读取数据、校验格式、加密敏感字段、转换格式、输出结果，全程通过事件通知进度。

这个例子展示了如何把多个知识点融会贯通，组织成一个结构清晰、扩展性强的程序。
`,
    code: `// ============================================================
// 综合练习：数据处理管道
// 整合 events、crypto、stream、assert、util 等核心模块
// ============================================================

const EventEmitter = require('events').EventEmitter;
const Transform = require('stream').Transform;
const Readable = require('stream').Readable;
const Writable = require('stream').Writable;
const pipeline = require('stream').pipeline;
const createHash = require('crypto').createHash;
const createCipheriv = require('crypto').createCipheriv;
const randomBytes = require('crypto').randomBytes;
const assert = require('assert');
const promisify = require('util').promisify;

const pipelineAsync = promisify(pipeline);

class DataPipeline extends EventEmitter {
  constructor(encryptionKey) {
    super();
    this.encryptionKey = createHash('sha256').update(encryptionKey || 'default-secret-key').digest();
    this.stats = {
      total: 0,
      valid: 0,
      invalid: 0,
      encrypted: 0,
      processed: 0,
      startTime: null,
      endTime: null
    };
  }

  validate(record) {
    assert.strictEqual(typeof record.id, 'number', 'id 必须是数字');
    assert.strictEqual(typeof record.name, 'string', 'name 必须是字符串');
    assert.ok(record.name.length > 0, 'name 不能为空');
    assert.strictEqual(typeof record.email, 'string', 'email 必须是字符串');
    assert.ok(record.email.includes('@'), 'email 格式无效');
    assert.ok(record.age === undefined || (typeof record.age === 'number' && record.age >= 0 && record.age <= 150), 'age 必须是 0-150 的数字');
    return true;
  }

  anonymize(record) {
    const emailParts = record.email.split('@');
    const nameHash = createHash('md5').update(record.name).digest('hex').substring(0, 8);
    return Object.assign({}, record, {
      name: 'user_' + nameHash,
      email: emailParts[0].substring(0, 2) + '***@' + emailParts[1],
      originalName: record.name
    });
  }

  encryptSensitive(record) {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    const sensitive = JSON.stringify({ originalName: record.originalName, email: record.email });
    let encrypted = cipher.update(sensitive, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    delete record.originalName;
    record._enc = { iv: iv.toString('hex'), data: encrypted };
    return record;
  }

  addMetadata(record) {
    const recordForChecksum = Object.assign({}, record);
    return Object.assign({}, record, {
      _processedAt: new Date().toISOString(),
      _version: '1.0',
      _checksum: createHash('sha256')
        .update(JSON.stringify(recordForChecksum))
        .digest('hex')
        .substring(0, 16)
    });
  }

  createReadStream(data) {
    let index = 0;
    return new Readable({
      objectMode: true,
      read() {
        if (index < data.length) {
          this.push(data[index++]);
        } else {
          this.push(null);
        }
      }
    });
  }

  createValidationStream() {
    const self = this;
    return new Transform({
      objectMode: true,
      transform(record, encoding, callback) {
        self.stats.total++;
        self.emit('record:start', { id: record.id, total: self.stats.total });
        try {
          self.validate(record);
          self.stats.valid++;
          self.emit('record:valid', { id: record.id, valid: self.stats.valid });
          callback(null, record);
        } catch (err) {
          self.stats.invalid++;
          self.emit('record:invalid', { id: record.id, error: err.message, invalid: self.stats.invalid });
          callback();
        }
      }
    });
  }

  createTransformStream() {
    const self = this;
    return new Transform({
      objectMode: true,
      transform(record, encoding, callback) {
        try {
          let processed = self.anonymize(record);
          processed = self.encryptSensitive(processed);
          processed = self.addMetadata(processed);
          self.stats.encrypted++;
          self.emit('record:encrypted', { id: record.id, encrypted: self.stats.encrypted });
          callback(null, processed);
        } catch (err) {
          callback(err);
        }
      }
    });
  }

  createWriteStream(output) {
    const self = this;
    return new Writable({
      objectMode: true,
      write(record, encoding, callback) {
        output.push(record);
        self.stats.processed++;
        self.emit('record:done', { id: record.id, processed: self.stats.processed });
        callback();
      }
    });
  }

  async process(inputData) {
    this.stats.startTime = Date.now();
    this.emit('pipeline:start', { totalRecords: inputData.length });
    const output = [];
    try {
      await pipelineAsync(
        this.createReadStream(inputData),
        this.createValidationStream(),
        this.createTransformStream(),
        this.createWriteStream(output)
      );
      this.stats.endTime = Date.now();
      const duration = this.stats.endTime - this.stats.startTime;
      this.emit('pipeline:complete', Object.assign({}, this.stats, {
        durationMs: duration,
        recordsPerSecond: ((this.stats.processed / duration) * 1000).toFixed(2)
      }));
      return { output, stats: Object.assign({}, this.stats, { durationMs: duration }) };
    } catch (err) {
      this.emit('pipeline:error', { error: err.message });
      throw err;
    }
  }
}

console.log("========================================");
console.log("  综合练习：数据处理管道");
console.log("========================================");
console.log("  整合模块: events, stream, crypto, assert, util");
console.log("========================================\\n");

const rawData = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', age: 28, city: '北京' },
  { id: 2, name: '李四', email: 'lisi-at-example.com', age: 22, city: '上海' },
  { id: 3, name: '王五', email: 'wangwu@example.com', age: 35, city: '广州' },
  { id: 4, name: '', email: 'invalid-email', age: 19 },
  { id: 5, name: '赵六', email: 'zhaoliu@example.com', city: '深圳' },
  { id: 'six', name: '钱七', email: 'qianqi@example.com', age: 31, city: '杭州' },
  { id: 7, name: '孙八', email: 'sunba@example.com', age: 27, city: '成都' },
  { id: 8, name: '周九', email: 'zhoujiu@example.com', age: 200, city: '武汉' },
  { id: 9, name: '吴十', email: 'wushi@example.com', age: 45, city: '南京' },
  { id: 10, name: '郑十一', email: 'zheng11@example.com', age: 33, city: '西安' }
];

const pipelineInstance = new DataPipeline('my-secret-key-2024');

pipelineInstance.on('pipeline:start', function(s) {
  console.log("🚀 管道启动，待处理记录数: " + s.totalRecords + "\\n");
});
pipelineInstance.on('record:valid', function(e) {
  console.log("  ✅ 记录 #" + e.id + ": 校验通过");
});
pipelineInstance.on('record:invalid', function(e) {
  console.log("  ❌ 记录 #" + e.id + ": 校验失败 - " + e.error);
});
pipelineInstance.on('record:encrypted', function(e) {
  console.log("  🔒 记录 #" + e.id + ": 加密完成");
});
pipelineInstance.on('pipeline:complete', function(s) {
  console.log("\\n🎉 管道处理完成！");
  console.log("  总记录数:   " + s.total);
  console.log("  校验通过:   " + s.valid);
  console.log("  校验失败:   " + s.invalid);
  console.log("  成功处理:   " + s.processed);
  console.log("  耗时:       " + s.durationMs + "ms");
  console.log("  处理速率:   " + s.recordsPerSecond + " 条/秒\\n");
});

(async function() {
  try {
    const result = await pipelineInstance.process(rawData);
    const output = result.output;
    const stats = result.stats;
    console.log("--- 处理后的数据示例（前3条）---");
    output.slice(0, 3).forEach(function(record, i) {
      console.log("\\n  记录 " + (i + 1) + ":");
      console.log("    匿名名称: " + record.name);
      console.log("    脱敏邮箱: " + record.email);
      console.log("    城市: " + (record.city || '未填写'));
      console.log("    处理时间: " + record._processedAt);
      console.log("    数据校验和: " + record._checksum);
      console.log("    加密数据长度: " + record._enc.data.length + " 字符");
    });

    console.log("\\n--- 验证处理流程 ---");
    console.log("  输入 10 条记录，其中 " + stats.invalid + " 条因格式错误被过滤");
    console.log("  成功处理 " + output.length + " 条有效记录");

    const expectedValid = rawData.filter(function(r) {
      try {
        assert.strictEqual(typeof r.id, 'number');
        assert.strictEqual(typeof r.name, 'string');
        assert.ok(r.name.length > 0);
        assert.strictEqual(typeof r.email, 'string');
        assert.ok(r.email.includes('@'));
        assert.ok(r.age === undefined || (typeof r.age === 'number' && r.age >= 0 && r.age <= 150));
        return true;
      } catch (e) { return false; }
    }).length;
    console.log("  预期有效记录数: " + expectedValid + "，实际处理: " + output.length + "，校验 " + (output.length === expectedValid ? '通过 ✓' : '失败 ✗'));

    console.log("\\n🎓 Node.js 进阶之旅到此结束。");
    console.log("   继续写代码，继续构建，继续探索。");
    console.log("   技术之路没有终点，只有不断的启程。\\n");
  } catch (err) {
    console.error('管道出错:', err);
  }
})();
`
  }
];
