// =============================================================
// Python 数据库编程教程（pydb）—— 第三批章节
// -------------------------------------------------------------
// Redis（intro, connect, datatypes）3 章
// + MongoDB（intro, crud）2 章，共 5 章。
// 代码使用 redis / pymongo 驱动，无服务器时优雅降级为模拟类演示。
// 单文件可独立运行，10 秒超时。
// =============================================================

export const chapters = [
  {
    id: "py-redis-intro",
    group: "Redis",
    icon: "⚡",
    title: "Redis 入门",
    content: `## 一、什么是 Redis

**Redis**（Remote Dictionary Server）是一款开源的、基于内存的、键值对（key-value）数据库。它把所有数据放在内存中，因此读写速度极快，单机可达 **10 万+ QPS**（每秒查询数）。

Redis 的核心特点：

1. **纯内存存储**：数据放在内存里，断电会丢失，但有持久化机制补偿。
2. **单线程模型**：核心命令执行是单线程的，避免了多线程的锁竞争和上下文切换，反而更快。
3. **丰富数据结构**：不只是简单的 key-value，还支持字符串、哈希、列表、集合、有序集合等。
4. **持久化可选**：RDB 快照与 AOF 日志两种方式，兼顾性能与安全。
5. **支持过期**：每个 key 都可以设置 TTL，自动删除，天然适合做缓存。

## 二、Redis vs Memcached

| 维度 | Redis | Memcached |
|------|-------|-----------|
| 数据结构 | String/Hash/List/Set/ZSet 等 | 只支持 String |
| 持久化 | RDB + AOF | 不支持 |
| 集群 | 原生 Cluster + Sentinel | 客户端分片 |
| 单线程 | 是（6.0 后 IO 多线程） | 是 |
| 过期策略 | 惰性 + 定期删除 | 惰性删除 |
| 适用场景 | 缓存/队列/排行榜/会话 | 纯缓存 |

Memcached 更轻量，纯做缓存时性能略高；Redis 功能更全面，几乎是现代后端的标配。

## 三、安装 Redis

最简单的方式是用 Docker：

\`\`\`bash
docker run -d --name redis -p 6379:6379 redis:7
\`\`\`

启动后用 \`redis-cli\` 连接：

\`\`\`bash
redis-cli
127.0.0.1:6379> SET name Alice
OK
127.0.0.1:6379> GET name
"Alice"
\`\`\`

## 四、典型应用场景

| 场景 | 用到的数据结构 | 说明 |
|------|----------------|------|
| 缓存 | String | 缓存数据库查询结果，减轻 DB 压力 |
| 会话存储 | String / Hash | 分布式 Session，多台服务器共享 |
| 排行榜 | Sorted Set | ZADD 写入分数，ZRANGE 取排名 |
| 计数器 | String | INCR 原子自增，统计点赞/阅读量 |
| 限流器 | String + EXPIRE | 滑动窗口限流，防止接口被刷 |
| 消息队列 | List / Stream | LPUSH/BRPOP 实现简易队列 |
| 发布订阅 | Pub/Sub | 实时消息广播 |

## 五、Redis 的五大数据结构

| 类型 | 说明 | 典型命令 |
|------|------|----------|
| String | 字符串，可存文本/数字/序列化数据 | SET / GET / INCR |
| Hash | 字段-值映射，适合存对象 | HSET / HGET / HGETALL |
| List | 有序列表，可从两端推入弹出 | LPUSH / RPOP / LRANGE |
| Set | 无序集合，元素唯一 | SADD / SMEMBERS / SINTER |
| Sorted Set | 有序集合，按分数排序 | ZADD / ZRANGE / ZRANGEBYSCORE |

## 六、持久化机制

Redis 虽是内存数据库，但能把数据写到磁盘，防止重启丢失。

- **RDB（快照）**：定期把内存数据整体 dump 成 .rdb 文件，恢复快，但可能丢最后一次快照后的数据。
- **AOF（日志）**：把每条写命令追加到日志文件，更安全，可配置每秒刷盘或每次写入刷盘。
- 生产环境通常 **RDB + AOF 混合使用**，兼顾恢复速度与数据安全。

## 七、本章代码说明

下面的代码尝试连接本地 Redis，连不上时使用 \`FakeRedis\` 模拟类演示 \`SET/GET/EXPIRE/TTL\` 等核心 API，保证无服务器也能运行。`,
    code: `# ============================================================
# 第一章代码演示：Redis 入门
# ------------------------------------------------------------
# 演示 redis-py 的基本连接与字符串操作。
# 无 Redis 服务器时自动降级为 FakeRedis 模拟演示。
# ============================================================
import time

print("=" * 60)
print("Redis 入门演示（redis-py / FakeRedis）")
print("=" * 60)

# 1. 尝试连接真实 Redis（1 秒超时）
real_redis = False
try:
    import redis
    r = redis.Redis(host="localhost", port=6379, db=0,
                    socket_connect_timeout=1, socket_timeout=1)
    r.ping()
    real_redis = True
    print("\\n[1] 已连接真实 Redis 服务器")
except Exception as e:
    print(f"\\n[1] 未连接到 Redis 服务器：{type(e).__name__}")
    print("    将使用 FakeRedis 模拟类演示 API 用法")


# 2. FakeRedis：用 Python dict 模拟 Redis 的基本 API
class FakeRedis:
    """用字典模拟 Redis 的最小实现，演示 API 形态"""

    def __init__(self):
        self._data = {}
        self._expire = {}

    def ping(self):
        return True

    def set(self, key, value, ex=None):
        self._data[key] = str(value)
        if ex:
            self._expire[key] = time.time() + ex
        return True

    def get(self, key):
        self._check_expire(key)
        return self._data.get(key)

    def delete(self, key):
        return 1 if self._data.pop(key, None) is not None else 0

    def exists(self, key):
        self._check_expire(key)
        return 1 if key in self._data else 0

    def expire(self, key, seconds):
        self._expire[key] = time.time() + seconds
        return True

    def ttl(self, key):
        if key not in self._expire:
            return -1
        remain = self._expire[key] - time.time()
        return int(remain) if remain > 0 else -2

    def _check_expire(self, key):
        if key in self._expire and time.time() > self._expire[key]:
            self._data.pop(key, None)
            self._expire.pop(key, None)

    def keys(self):
        for k in list(self._data.keys()):
            self._check_expire(k)
        return list(self._data.keys())


# 选择使用真实还是模拟
r = r if real_redis else FakeRedis()

# 3. 基本字符串操作 SET / GET
print("\\n[2] 基本字符串操作 SET / GET：")
r.set("name", "张三")
r.set("city", "北京")
print("  SET name 张三")
print("  SET city 北京")
print(f"  GET name -> {r.get('name')}")
print(f"  GET city -> {r.get('city')}")

# 4. 过期时间 EXPIRE / TTL
print("\\n[3] 过期时间 EXPIRE / TTL：")
r.set("token", "abc123", ex=2)
print("  SET token abc123 ex=2")
print(f"  GET token（立即）-> {r.get('token')}")
print(f"  TTL token -> {r.ttl('token')} 秒")

# 5. 键管理 EXISTS / DELETE
print("\\n[4] 键管理 EXISTS / DELETE：")
print(f"  EXISTS name -> {r.exists('name')}")
print(f"  DELETE name -> {r.delete('name')}")
print(f"  EXISTS name（删除后）-> {r.exists('name')}")

# 6. KEYS 查看所有键
print("\\n[5] KEYS 查看所有键：")
r.set("user:1", "Alice")
r.set("user:2", "Bob")
for k in r.keys():
    print(f"  {k} -> {r.get(k)}")

print("\\n" + "=" * 60)
print("总结：Redis 是内存键值存储，SET/GET/EXPIRE 是最常用命令")
print("=" * 60)
`,
  },

  {
    id: "py-redis-connect",
    group: "Redis",
    icon: "🔗",
    title: "redis-py 连接与字符串操作",
    content: `## 一、redis-py 库简介

**redis-py** 是 Redis 官方推荐的 Python 客户端，安装方式：

\`\`\`bash
pip install redis
\`\`\`

它的核心特性：

- **连接池 ConnectionPool**：复用连接，避免反复握手。
- **decode_responses**：自动把字节解码成字符串，免去手动 \`decode()\`。
- **管道 Pipeline**：批量发送命令，减少网络往返。
- **发布订阅 PubSub**：监听频道消息。

## 二、连接 Redis

最常用的连接方式：

\`\`\`python
import redis

# 方式一：直接传参数
r = redis.Redis(host="localhost", port=6379, db=0,
                password=None, decode_responses=True)

# 方式二：用 URL
r = redis.from_url("redis://localhost:6379/0", decode_responses=True)

# 方式三：连接池（推荐生产使用）
pool = redis.ConnectionPool(host="localhost", port=6379,
                            db=0, decode_responses=True)
r = redis.Redis(connection_pool=pool)
\`\`\`

\`decode_responses=True\` 让 \`GET\` 返回字符串而非 \`bytes\`，省去手动解码。

## 三、String 字符串操作

| 命令 | 作用 | 示例 |
|------|------|------|
| SET | 设置键值 | \`r.set("k", "v")\` |
| GET | 读取键值 | \`r.get("k")\` |
| MSET | 批量设置 | \`r.mset({"a": 1, "b": 2})\` |
| MGET | 批量读取 | \`r.mget("a", "b")\` |
| INCR | 原子自增 | \`r.incr("counter")\` |
| DECR | 原子自减 | \`r.decr("counter")\` |
| APPEND | 追加字符串 | \`r.append("k", "more")\` |
| STRLEN | 字符串长度 | \`r.strlen("k")\` |

INCR/DECR 是**原子操作**，即使多个客户端同时执行也不会出错，常用于计数器。

## 四、键管理

| 命令 | 作用 | 示例 |
|------|------|------|
| KEYS | 模糊查询键名 | \`r.keys("user:*")\` |
| DEL | 删除键 | \`r.delete("k")\` |
| EXISTS | 判断键是否存在 | \`r.exists("k")\` |
| EXPIRE | 设置过期秒数 | \`r.expire("k", 60)\` |
| TTL | 查看剩余秒数 | \`r.ttl("k")\` |
| TYPE | 查看值类型 | \`r.type("k")\` |
| RENAME | 重命名键 | \`r.rename("old", "new")\` |

> 生产环境慎用 \`KEYS *\`，会阻塞单线程的 Redis。改用 \`SCAN\` 游标遍历。

## 五、Pipeline 管道

每条命令都要一次网络往返，批量操作时很慢。**Pipeline** 把多条命令打包一次发送：

\`\`\`python
pipe = r.pipeline()
pipe.set("a", "1")
pipe.set("b", "2")
pipe.set("c", "3")
results = pipe.execute()  # 一次往返完成 3 条命令
\`\`\`

管道还能保证一组命令**顺序执行**（但不是事务，事务要用 MULTI/EXEC）。

## 六、本章代码说明

下面的代码演示 redis-py 的连接、字符串操作、键管理和管道。无服务器时用 \`FakeRedis\` 模拟类完整复刻这些 API。`,
    code: `# ============================================================
# 第二章代码演示：redis-py 连接与字符串操作
# ------------------------------------------------------------
# 演示连接、String 操作、键管理、Pipeline。
# 无 Redis 服务器时用 FakeRedis 模拟类完整复刻 API。
# ============================================================
import time

print("=" * 60)
print("redis-py 连接与字符串操作演示")
print("=" * 60)

# 1. 尝试连接真实 Redis
real_redis = False
try:
    import redis
    r = redis.Redis(host="localhost", port=6379, db=0,
                    socket_connect_timeout=1, socket_timeout=1,
                    decode_responses=True)
    r.ping()
    real_redis = True
    print("\\n[1] 已连接真实 Redis 服务器")
except Exception as e:
    print(f"\\n[1] 未连接到 Redis 服务器：{type(e).__name__}")
    print("    将使用 FakeRedis 模拟类演示 API 用法")


# 2. FakeRedis：模拟 redis-py 的字符串与键管理 API
class FakeRedis:
    """模拟 redis-py 的最小实现，覆盖字符串与键管理"""

    def __init__(self):
        self._data = {}
        self._expire = {}

    def ping(self):
        return True

    def set(self, key, value, ex=None):
        self._data[key] = str(value)
        if ex:
            self._expire[key] = time.time() + ex
        return True

    def get(self, key):
        self._check_expire(key)
        return self._data.get(key)

    def mset(self, mapping):
        for k, v in mapping.items():
            self._data[k] = str(v)
        return True

    def mget(self, *keys):
        return [self.get(k) for k in keys]

    def incr(self, key, amount=1):
        val = int(self._data.get(key, "0")) + amount
        self._data[key] = str(val)
        return val

    def decr(self, key, amount=1):
        return self.incr(key, -amount)

    def append(self, key, value):
        self._data[key] = self._data.get(key, "") + str(value)
        return len(self._data[key])

    def strlen(self, key):
        return len(self._data.get(key, ""))

    def delete(self, *keys):
        cnt = 0
        for k in keys:
            if k in self._data:
                self._data.pop(k, None)
                self._expire.pop(k, None)
                cnt += 1
        return cnt

    def exists(self, key):
        self._check_expire(key)
        return 1 if key in self._data else 0

    def keys(self, pattern="*"):
        for k in list(self._data.keys()):
            self._check_expire(k)
        if pattern == "*":
            return list(self._data.keys())
        import fnmatch
        return [k for k in self._data if fnmatch.fnmatch(k, pattern)]

    def expire(self, key, seconds):
        self._expire[key] = time.time() + seconds
        return True

    def ttl(self, key):
        if key not in self._data:
            return -2
        if key not in self._expire:
            return -1
        remain = self._expire[key] - time.time()
        return int(remain) if remain > 0 else -2

    def type(self, key):
        return "string" if key in self._data else "none"

    def rename(self, src, dst):
        self._data[dst] = self._data.pop(src)
        return True

    def _check_expire(self, key):
        if key in self._expire and time.time() > self._expire[key]:
            self._data.pop(key, None)
            self._expire.pop(key, None)

    def pipeline(self):
        return FakePipeline(self)


class FakePipeline:
    """模拟 redis-py 的 Pipeline 批量执行"""

    def __init__(self, redis_obj):
        self._r = redis_obj
        self._cmds = []

    def set(self, key, value):
        self._cmds.append(("set", key, value))
        return self

    def get(self, key):
        self._cmds.append(("get", key))
        return self

    def incr(self, key):
        self._cmds.append(("incr", key))
        return self

    def execute(self):
        results = []
        for cmd in self._cmds:
            if cmd[0] == "set":
                self._r.set(cmd[1], cmd[2])
                results.append(True)
            elif cmd[0] == "get":
                results.append(self._r.get(cmd[1]))
            elif cmd[0] == "incr":
                results.append(self._r.incr(cmd[1]))
        return results


# 选择使用真实还是模拟
r = r if real_redis else FakeRedis()

# 3. 字符串基本操作
print("\\n[2] 字符串基本操作：")
r.set("name", "Alice")
print(f"  SET name Alice -> GET name = {r.get('name')}")
r.mset({"a": "10", "b": "20", "c": "30"})
print(f"  MSET a/b/c -> MGET = {r.mget('a', 'b', 'c')}")
print(f"  INCR a -> {r.incr('a')}（自增后）")
print(f"  DECR a -> {r.decr('a')}（自减后）")
r.append("name", "_Dev")
print(f"  APPEND name _Dev -> {r.get('name')}，STRLEN = {r.strlen('name')}")

# 4. 键管理
print("\\n[3] 键管理：")
r.set("temp", "hello")
print(f"  EXISTS temp -> {r.exists('temp')}")
print(f"  TYPE temp -> {r.type('temp')}")
r.expire("temp", 60)
print(f"  EXPIRE temp 60 -> TTL = {r.ttl('temp')} 秒")
r.rename("temp", "temp2")
print(f"  RENAME temp temp2 -> GET temp2 = {r.get('temp2')}")
print(f"  KEYS * -> {r.keys('*')}")
print(f"  KEYS name -> {sorted(r.keys('name*'))}")

# 5. Pipeline 批量执行
print("\\n[4] Pipeline 批量执行：")
pipe = r.pipeline()
pipe.set("p1", "v1")
pipe.set("p2", "v2")
pipe.incr("counter")
results = pipe.execute()
print(f"  批量执行 3 条命令，返回：{results}")
print(f"  验证 p1 -> {r.get('p1')}, p2 -> {r.get('p2')}, counter -> {r.get('counter')}")

print("\\n" + "=" * 60)
print("总结：redis-py 提供完整的字符串与键管理 API，Pipeline 能批量提速")
print("=" * 60)
`,
  },

  {
    id: "py-redis-datatypes",
    group: "Redis",
    icon: "📊",
    title: "Redis 数据类型实战",
    content: `## 一、Hash 哈希

Hash 是字段-值映射，特别适合存储对象（一个 key 对应一个对象，对象有多个字段）。

| 命令 | 作用 |
|------|------|
| HSET key field value | 设置单个字段 |
| HGET key field | 读取单个字段 |
| HGETALL key | 读取所有字段 |
| HDEL key field | 删除字段 |
| HINCRBY key field n | 字段值自增 |

\`\`\`python
r.hset("user:1", mapping={"name": "Alice", "age": 28})
r.hget("user:1", "name")   # "Alice"
r.hgetall("user:1")        # {"name": "Alice", "age": "28"}
\`\`\`

相比把对象序列化成 JSON 存 String，Hash 的好处是**可以单独修改某个字段**，不用读出整个对象再写回。

## 二、List 列表

List 是有序列表，可以从左/右两端推入（push）和弹出（pop），适合做**消息队列**。

| 命令 | 作用 |
|------|------|
| LPUSH key v1 v2 | 左端推入 |
| RPUSH key v1 v2 | 右端推入 |
| LPOP key | 左端弹出 |
| RPOP key | 右端弹出 |
| LRANGE key start stop | 范围查看 |

\`\`\`python
r.lpush("queue", "msg1", "msg2")  # 左端推入
r.rpop("queue")                   # 右端弹出 -> "msg1"（FIFO 队列）
\`\`\`

LPUSH + RPOP 实现 FIFO 队列，LPUSH + LPOP 实现栈。

## 三、Set 集合

Set 是无序、元素唯一的集合，适合做**标签、去重、共同关注**。

| 命令 | 作用 |
|------|------|
| SADD key m1 m2 | 添加元素 |
| SMEMBERS key | 查看全部元素 |
| SINTER k1 k2 | 交集 |
| SUNION k1 k2 | 并集 |
| SDIFF k1 k2 | 差集 |

\`\`\`python
r.sadd("tags:1", "python", "db", "redis")
r.sadd("tags:2", "db", "redis", "mongo")
r.sinter("tags:1", "tags:2")  # {"db", "redis"} 共同标签
\`\`\`

## 四、Sorted Set 有序集合

Sorted Set（ZSet）每个元素带一个**分数（score）**，按分数排序，天然适合**排行榜**。

| 命令 | 作用 |
|------|------|
| ZADD key score member | 添加带分数的元素 |
| ZRANGE key 0 -1 | 按分数升序查看 |
| ZREVRANGE key 0 9 | 降序前 10 名 |
| ZRANGEBYSCORE key min max | 按分数区间查询 |
| ZSCORE key member | 查看元素分数 |

\`\`\`python
r.zadd("rank", {"Alice": 100, "Bob": 200, "Carol": 150})
r.zrevrange("rank", 0, 0)  # ["Bob"] 第一名
\`\`\`

## 五、实战模式

### 5.1 缓存模式（Cache-Aside）

读数据时先查 Redis 缓存，没有再查数据库并写入缓存：

\`\`\`text
GET cache:key  ->  命中：直接返回
                ->  未命中：查 DB -> SET cache:key -> 返回
\`\`\`

### 5.2 会话存储

把用户 Session 存 Redis，多台 Web 服务器共享：

\`\`\`python
r.setex("session:abc123", 1800, json.dumps({"uid": 1}))
\`\`\`

### 5.3 限流器

用 INCR + EXPIRE 实现固定窗口限流：

\`\`\`python
key = f"rate:{user_id}:{minute}"
count = r.incr(key)
if count == 1:
    r.expire(key, 60)
if count > 100:
    return "请求过于频繁"
\`\`\`

## 六、本章代码说明

下面的 \`FakeRedis\` 模拟类完整实现了 Hash、List、Set、Sorted Set 四种数据类型，演示用户资料、消息队列、标签集合、排行榜四个场景。`,
    code: `# ============================================================
# 第三章代码演示：Redis 数据类型实战
# ------------------------------------------------------------
# 演示 Hash / List / Set / Sorted Set 四种数据类型。
# 无 Redis 服务器时用 FakeRedis 模拟类完整复刻 API。
# ============================================================
import time

print("=" * 60)
print("Redis 数据类型实战演示")
print("=" * 60)

# 1. 尝试连接真实 Redis
real_redis = False
try:
    import redis
    r = redis.Redis(host="localhost", port=6379, db=0,
                    socket_connect_timeout=1, socket_timeout=1,
                    decode_responses=True)
    r.ping()
    real_redis = True
    print("\\n[1] 已连接真实 Redis 服务器")
except Exception as e:
    print(f"\\n[1] 未连接到 Redis 服务器：{type(e).__name__}")
    print("    将使用 FakeRedis 模拟类演示 API 用法")


# 2. FakeRedis：模拟四种数据类型
class FakeRedis:
    """模拟 Redis 的 Hash/List/Set/Sorted Set 数据类型"""

    def __init__(self):
        self._data = {}

    def ping(self):
        return True

    # ---- Hash 哈希 ----
    def hset(self, key, mapping=None, field=None, value=None):
        if key not in self._data:
            self._data[key] = {}
        m = mapping or {}
        if field:
            m = {field: value}
        self._data[key].update(m)
        return len(m)

    def hget(self, key, field):
        return self._data.get(key, {}).get(field)

    def hgetall(self, key):
        return dict(self._data.get(key, {}))

    def hdel(self, key, *fields):
        h = self._data.get(key, {})
        cnt = 0
        for f in fields:
            if f in h:
                h.pop(f)
                cnt += 1
        return cnt

    def hincrby(self, key, field, amount=1):
        h = self._data.setdefault(key, {})
        h[field] = int(h.get(field, "0")) + amount
        return h[field]

    # ---- List 列表 ----
    def lpush(self, key, *values):
        lst = self._data.setdefault(key, [])
        for v in values:
            lst.insert(0, str(v))
        return len(lst)

    def rpush(self, key, *values):
        lst = self._data.setdefault(key, [])
        for v in values:
            lst.append(str(v))
        return len(lst)

    def lpop(self, key):
        lst = self._data.get(key, [])
        return lst.pop(0) if lst else None

    def rpop(self, key):
        lst = self._data.get(key, [])
        return lst.pop() if lst else None

    def lrange(self, key, start, stop):
        lst = self._data.get(key, [])
        if stop == -1:
            stop = len(lst)
        return lst[start:stop + 1] if stop + 1 > 0 else lst[start:]

    # ---- Set 集合 ----
    def sadd(self, key, *members):
        s = self._data.setdefault(key, set())
        new = 0
        for m in members:
            if m not in s:
                s.add(str(m))
                new += 1
        return new

    def smembers(self, key):
        return self._data.get(key, set())

    def sinter(self, *keys):
        result = None
        for k in keys:
            s = self._data.get(k, set())
            result = s.copy() if result is None else (result & s)
        return result or set()

    def sunion(self, *keys):
        result = set()
        for k in keys:
            result |= self._data.get(k, set())
        return result

    # ---- Sorted Set 有序集合 ----
    def zadd(self, key, mapping):
        z = self._data.setdefault(key, {})
        for member, score in mapping.items():
            z[str(member)] = score
        return len(mapping)

    def zrange(self, key, start, stop):
        z = self._data.get(key, {})
        items = sorted(z.items(), key=lambda x: x[1])
        if stop == -1:
            stop = len(items) - 1
        return [m for m, s in items[start:stop + 1]]

    def zrevrange(self, key, start, stop):
        z = self._data.get(key, {})
        items = sorted(z.items(), key=lambda x: x[1], reverse=True)
        if stop == -1:
            stop = len(items) - 1
        return [m for m, s in items[start:stop + 1]]

    def zrangebyscore(self, key, min_score, max_score):
        z = self._data.get(key, {})
        return [m for m, s in sorted(z.items(), key=lambda x: x[1])
                if min_score <= s <= max_score]

    def zscore(self, key, member):
        return self._data.get(key, {}).get(str(member))


# 选择使用真实还是模拟
r = r if real_redis else FakeRedis()

# 3. Hash：存储用户资料
print("\\n[2] Hash 存储用户资料：")
r.hset("user:1", mapping={"name": "张三", "age": 28, "city": "北京"})
r.hset("user:2", mapping={"name": "李四", "age": 32, "city": "上海"})
print(f"  HGET user:1 name -> {r.hget('user:1', 'name')}")
print(f"  HGETALL user:1 -> {r.hgetall('user:1')}")
r.hincrby("user:1", "age", 1)
print(f"  HINCRBY user:1 age 1 -> age={r.hget('user:1', 'age')}")

# 4. List：消息队列
print("\\n[3] List 消息队列（FIFO）：")
r.lpush("queue", "msg3", "msg2", "msg1")
print(f"  LPUSH msg3 msg2 msg1 -> 队列={r.lrange('queue', 0, -1)}")
print(f"  RPOP -> {r.rpop('queue')}（出队）")
print(f"  RPOP -> {r.rpop('queue')}（出队）")
print(f"  剩余队列={r.lrange('queue', 0, -1)}")

# 5. Set：标签与共同关注
print("\\n[4] Set 标签集合：")
r.sadd("tags:user:1", "python", "db", "redis")
r.sadd("tags:user:2", "db", "redis", "mongo")
print(f"  user:1 标签 -> {sorted(r.smembers('tags:user:1'))}")
print(f"  user:2 标签 -> {sorted(r.smembers('tags:user:2'))}")
print(f"  共同标签（SINTER）-> {sorted(r.sinter('tags:user:1', 'tags:user:2'))}")
print(f"  全部标签（SUNION）-> {sorted(r.sunion('tags:user:1', 'tags:user:2'))}")

# 6. Sorted Set：排行榜
print("\\n[5] Sorted Set 排行榜：")
r.zadd("score_rank", {"张三": 100, "李四": 250, "王五": 180, "赵六": 320})
print("  ZADD 四人分数")
print(f"  ZREVRANGE 前 3 名 -> {r.zrevrange('score_rank', 0, 2)}")
print(f"  ZRANGE 升序全部 -> {r.zrange('score_rank', 0, -1)}")
print(f"  ZRANGEBYSCORE 100~200 -> {r.zrangebyscore('score_rank', 100, 200)}")
print(f"  ZSCORE 赵六 -> {r.zscore('score_rank', '赵六')}")

print("\\n" + "=" * 60)
print("总结：Hash 存对象 / List 做队列 / Set 去重 / ZSet 排行榜")
print("=" * 60)
`,
  },

  {
    id: "py-mongo-intro",
    group: "MongoDB",
    icon: "🍃",
    title: "MongoDB 入门（了解）",
    content: `## 一、什么是 MongoDB

**MongoDB** 是一款开源的、面向文档的 NoSQL 数据库。它用 **BSON**（Binary JSON）格式存储数据，每条记录是一个"文档"，没有固定的表结构（schemaless）。

核心特点：

1. **文档模型**：数据像 JSON 对象，天然契合程序里的字典/对象。
2. **无 Schema**：同一个集合里的文档结构可以不同，灵活易扩展。
3. **水平扩展**：原生支持分片（Sharding），适合海量数据。
4. **高性能**：内存映射文件，读写速度快。
5. **丰富查询**：支持嵌套文档、数组、聚合管道。

## 二、SQL 与 MongoDB 术语对照

| SQL（关系型） | MongoDB | 说明 |
|------|------|------|
| Database | Database | 数据库 |
| Table | Collection | 表 → 集合 |
| Row | Document | 行 → 文档 |
| Column | Field | 列 → 字段 |
| Primary Key | \`_id\` | 主键（默认 ObjectId） |
| Index | Index | 索引 |
| JOIN | \$lookup | 关联查询 |
| SELECT | find() | 查询 |

## 三、什么时候用 MongoDB

| 场景 | 适合 MongoDB | 适合 SQL |
|------|-------------|----------|
| 数据结构多变 | ✅ | |
| 需要水平扩展 | ✅ | |
| 嵌套/数组数据多 | ✅ | |
| 强事务（银行转账） | | ✅ |
| 复杂多表 JOIN | | ✅ |
| 数据结构稳定 | | ✅ |

简单记：**结构灵活、读多写少、数据量大** 优先考虑 MongoDB；**强一致、复杂关联** 用 SQL。

## 四、安装 MongoDB

\`\`\`bash
docker run -d --name mongo -p 27017:27017 mongo:7
\`\`\`

连接：

\`\`\`bash
mongosh
> use mydb
> db.users.insertOne({name: "Alice", age: 28})
> db.users.find()
\`\`\`

## 五、文档结构

MongoDB 的文档就是 JSON 对象，可以嵌套：

\`\`\`json
{
  "_id": ObjectId("65a1b2c3..."),
  "name": "Alice",
  "age": 28,
  "address": {
    "city": "北京",
    "zip": "100000"
  },
  "tags": ["python", "db"],
  "created_at": ISODate("2024-01-15")
}
\`\`\`

- \`_id\`：每个文档的唯一标识，不指定时自动生成 ObjectId。
- 字段可以嵌套对象、数组、日期等。
- 同一集合的文档字段可以完全不同。

## 六、pymongo 驱动

\`\`\`bash
pip install pymongo
\`\`\`

\`\`\`python
from pymongo import MongoClient
client = MongoClient("mongodb://localhost:27017/")
db = client["mydb"]
collection = db["users"]
\`\`\`

## 七、本章代码说明

下面的代码尝试连接本地 MongoDB，连不上时用 \`FakeMongo\` 模拟类演示 insert/find 概念。本章为**了解级别**，掌握基本概念即可。`,
    code: `# ============================================================
# 第四章代码演示：MongoDB 入门（了解）
# ------------------------------------------------------------
# 演示 pymongo 的连接与基本插入/查询概念。
# 无 MongoDB 服务器时自动降级为 FakeMongo 模拟演示。
# ============================================================

print("=" * 60)
print("MongoDB 入门演示（pymongo / FakeMongo）")
print("=" * 60)

# 1. 尝试连接真实 MongoDB
real_mongo = False
try:
    from pymongo import MongoClient
    client = MongoClient("mongodb://localhost:27017/",
                         serverSelectionTimeoutMS=1000)
    client.admin.command("ping")
    real_mongo = True
    print("\\n[1] 已连接真实 MongoDB 服务器")
except Exception as e:
    print(f"\\n[1] 未连接到 MongoDB 服务器：{type(e).__name__}")
    print("    将使用 FakeMongo 模拟类演示 API 用法")


# 2. FakeMongo：用 Python list 模拟 MongoDB 集合
class FakeMongo:
    """模拟 MongoDB 的最小实现，演示文档与集合概念"""

    def __init__(self):
        self._collections = {}

    def __getitem__(self, name):
        if name not in self._collections:
            self._collections[name] = FakeCollection()
        return self._collections[name]


class FakeCollection:
    """模拟一个 MongoDB 集合（用 list 存文档）"""

    def __init__(self):
        self._docs = []
        self._counter = 0

    def _gen_id(self):
        self._counter += 1
        return f"objid_{self._counter:024d}"

    def insert_one(self, doc):
        doc = dict(doc)
        if "_id" not in doc:
            doc["_id"] = self._gen_id()
        self._docs.append(doc)
        return type("Result", (), {"inserted_id": doc["_id"]})()

    def insert_many(self, docs):
        ids = []
        for d in docs:
            ids.append(self.insert_one(d).inserted_id)
        return type("Result", (), {"inserted_ids": ids})()

    def find(self, query=None):
        query = query or {}
        matched = [d for d in self._docs if self._match(d, query)]
        return FakeCursor(matched)

    def find_one(self, query=None):
        query = query or {}
        for d in self._docs:
            if self._match(d, query):
                return d
        return None

    def count_documents(self, query=None):
        query = query or {}
        return sum(1 for d in self._docs if self._match(d, query))

    def _match(self, doc, query):
        for field, cond in query.items():
            val = doc.get(field)
            if isinstance(cond, dict):
                for op, target in cond.items():
                    if op == "$gt" and not (val is not None and val > target):
                        return False
                    if op == "$lt" and not (val is not None and val < target):
                        return False
                    if op == "$in" and val not in target:
                        return False
            elif val != cond:
                return False
        return True


class FakeCursor:
    """模拟查询游标，支持遍历与排序"""

    def __init__(self, docs):
        self._docs = docs

    def sort(self, field, direction=1):
        self._docs.sort(key=lambda x: x.get(field, 0),
                        reverse=(direction == -1))
        return self

    def limit(self, n):
        self._docs = self._docs[:n]
        return self

    def __iter__(self):
        return iter(self._docs)


# 选择使用真实还是模拟
if real_mongo:
    db = client["demo_db"]
    users = db["users"]
else:
    db = FakeMongo()
    users = db["users"]

# 3. 插入文档
print("\\n[2] 插入文档（insert_one / insert_many）：")
result = users.insert_one({"name": "张三", "age": 28, "city": "北京"})
print(f"  insert_one 张三 -> _id = {result.inserted_id}")
users.insert_one({"name": "李四", "age": 35, "city": "上海"})
users.insert_many([
    {"name": "王五", "age": 22, "city": "北京"},
    {"name": "赵六", "age": 40, "city": "广州"},
])
print("  insert_many 王五、赵六")

# 4. 查询文档
print("\\n[3] 查询文档（find / find_one）：")
print(f"  文档总数 -> {users.count_documents({})}")
print("  查询全部：")
for doc in users.find({}):
    print(f"    {doc}")

# 5. 条件查询
print("\\n[4] 条件查询：")
print("  age > 25 的文档：")
for doc in users.find({"age": {"$gt": 25}}):
    print(f"    {doc}")

print("  city = 北京 的文档：")
for doc in users.find({"city": "北京"}):
    print(f"    {doc}")

# 6. find_one
print("\\n[5] find_one 查询单条：")
one = users.find_one({"name": "李四"})
print(f"  find_one 李四 -> {one}")

print("\\n" + "=" * 60)
print("总结：MongoDB 存 JSON 文档，find() 查询，条件用 $ 操作符")
print("=" * 60)
`,
  },

  {
    id: "py-mongo-crud",
    group: "MongoDB",
    icon: "📝",
    title: "PyMongo 增删改查（了解）",
    content: `## 一、CRUD 总览

MongoDB 的增删改查四大操作，对应 PyMongo 方法：

| 操作 | 方法 | 说明 |
|------|------|------|
| 增 | insert_one / insert_many | 插入文档 |
| 查 | find / find_one | 查询文档 |
| 改 | update_one / update_many | 更新文档 |
| 删 | delete_one / delete_many | 删除文档 |

## 二、插入数据

\`\`\`python
# 插入一条
db.users.insert_one({"name": "Alice", "age": 28})

# 批量插入
db.users.insert_many([
    {"name": "Bob", "age": 24},
    {"name": "Carol", "age": 30},
])
\`\`\`

每条文档会自动加上 \`_id\` 字段。

## 三、查询操作符

\`\`\`python
# 等于
db.users.find({"age": 28})
# 大于 / 小于
db.users.find({"age": {"$gt": 25}})
# 包含于列表
db.users.find({"city": {"$in": ["北京", "上海"]}})
# AND
db.users.find({"$and": [{"age": {"$gt": 20}}, {"city": "北京"}]})
# OR
db.users.find({"$or": [{"city": "北京"}, {"city": "上海"}]})
\`\`\`

常用操作符：

| 操作符 | 含义 |
|------|------|
| \$gt / \$gte | 大于 / 大于等于 |
| \$lt / \$lte | 小于 / 小于等于 |
| \$in | 包含于 |
| \$nin | 不包含于 |
| \$ne | 不等于 |
| \$and / \$or | 逻辑与 / 或 |
| \$exists | 字段是否存在 |

## 四、更新操作

| 操作符 | 作用 |
|------|------|
| \$set | 设置字段值 |
| \$inc | 字段自增 |
| \$push | 数组追加元素 |
| \$pull | 数组移除元素 |
| \$unset | 删除字段 |

\`\`\`python
# 更新一条
db.users.update_one({"name": "Alice"}, {"$set": {"age": 29}})
# 自增
db.users.update_one({"name": "Alice"}, {"$inc": {"age": 1}})
# 批量更新
db.users.update_many({"city": "北京"}, {"$set": {"region": "华北"}})
\`\`\`

## 五、删除数据

\`\`\`python
# 删除一条
db.users.delete_one({"name": "Bob"})
# 批量删除
db.users.delete_many({"age": {"$lt": 20}})
\`\`\`

## 六、聚合管道 Aggregation

聚合管道（Aggregation Pipeline）把数据像流水线一样一步步处理：

\`\`\`python
pipeline = [
    {"$match": {"age": {"$gt": 20}}},      # 过滤
    {"$group": {"_id": "$city", "count": {"$sum": 1}, "avg_age": {"$avg": "$age"}}},
    {"$sort": {"count": -1}},              # 按数量降序
]
result = db.users.aggregate(pipeline)
\`\`\`

常用阶段：

| 阶段 | 作用 |
|------|------|
| \$match | 过滤（相当于 WHERE） |
| \$group | 分组（相当于 GROUP BY） |
| \$sort | 排序 |
| \$project | 选择字段 |
| \$limit | 限制数量 |

## 七、本章代码说明

下面的 \`FakeMongoDB\` 模拟类实现了完整的增删改查和查询操作符，并演示聚合管道。本章为**了解级别**，理解 CRUD 与操作符即可。`,
    code: `# ============================================================
# 第五章代码演示：PyMongo 增删改查（了解）
# ------------------------------------------------------------
# 演示 insert / find / update / delete 与聚合管道。
# 无 MongoDB 服务器时用 FakeMongoDB 模拟类完整复刻 API。
# ============================================================
print("=" * 60)
print("PyMongo 增删改查演示（pymongo / FakeMongoDB）")
print("=" * 60)

# 1. 尝试连接真实 MongoDB
real_mongo = False
try:
    from pymongo import MongoClient
    client = MongoClient("mongodb://localhost:27017/",
                         serverSelectionTimeoutMS=1000)
    client.admin.command("ping")
    real_mongo = True
    print("\\n[1] 已连接真实 MongoDB 服务器")
except Exception as e:
    print(f"\\n[1] 未连接到 MongoDB 服务器：{type(e).__name__}")
    print("    将使用 FakeMongoDB 模拟类演示 API 用法")


# 2. FakeMongoDB：模拟完整的 CRUD 与聚合
class FakeMongoDB:
    """模拟 MongoDB，支持 insert/find/update/delete/aggregate"""

    def __init__(self):
        self._collections = {}

    def __getitem__(self, name):
        if name not in self._collections:
            self._collections[name] = FakeCollection()
        return self._collections[name]


class FakeCollection:
    """模拟 MongoDB 集合，支持查询操作符与聚合管道"""

    def __init__(self):
        self._docs = []
        self._counter = 0

    def _gen_id(self):
        self._counter += 1
        return f"objid_{self._counter:024d}"

    # ---- 插入 ----
    def insert_one(self, doc):
        doc = dict(doc)
        if "_id" not in doc:
            doc["_id"] = self._gen_id()
        self._docs.append(doc)
        return type("R", (), {"inserted_id": doc["_id"]})()

    def insert_many(self, docs):
        ids = [self.insert_one(d).inserted_id for d in docs]
        return type("R", (), {"inserted_ids": ids})()

    # ---- 查询 ----
    def find(self, query=None):
        query = query or {}
        return FakeCursor([d for d in self._docs if _match(d, query)])

    def find_one(self, query=None):
        query = query or {}
        for d in self._docs:
            if _match(d, query):
                return d
        return None

    def count_documents(self, query=None):
        query = query or {}
        return sum(1 for d in self._docs if _match(d, query))

    # ---- 更新 ----
    def update_one(self, query, update):
        for i, d in enumerate(self._docs):
            if _match(d, query):
                self._docs[i] = _apply_update(d, update)
                return type("R", (), {"modified_count": 1})()
        return type("R", (), {"modified_count": 0})()

    def update_many(self, query, update):
        cnt = 0
        for i, d in enumerate(self._docs):
            if _match(d, query):
                self._docs[i] = _apply_update(d, update)
                cnt += 1
        return type("R", (), {"modified_count": cnt})()

    # ---- 删除 ----
    def delete_one(self, query):
        for i, d in enumerate(self._docs):
            if _match(d, query):
                self._docs.pop(i)
                return type("R", (), {"deleted_count": 1})()
        return type("R", (), {"deleted_count": 0})()

    def delete_many(self, query):
        before = len(self._docs)
        self._docs = [d for d in self._docs if not _match(d, query)]
        return type("R", (), {"deleted_count": before - len(self._docs)})()

    # ---- 聚合 ----
    def aggregate(self, pipeline):
        docs = list(self._docs)
        for stage in pipeline:
            docs = _apply_stage(docs, stage)
        return docs


def _match(doc, query):
    """判断文档是否匹配查询条件"""
    for field, cond in query.items():
        if field == "$and":
            if not all(_match(doc, q) for q in cond):
                return False
        elif field == "$or":
            if not any(_match(doc, q) for q in cond):
                return False
        else:
            val = doc.get(field)
            if isinstance(cond, dict):
                for op, target in cond.items():
                    if op == "$gt" and not (val is not None and val > target):
                        return False
                    elif op == "$gte" and not (val is not None and val >= target):
                        return False
                    elif op == "$lt" and not (val is not None and val < target):
                        return False
                    elif op == "$lte" and not (val is not None and val <= target):
                        return False
                    elif op == "$in" and val not in target:
                        return False
                    elif op == "$ne" and val == target:
                        return False
            elif val != cond:
                return False
    return True


def _apply_update(doc, update):
    """应用更新操作符"""
    doc = dict(doc)
    for op, fields in update.items():
        if op == "$set":
            doc.update(fields)
        elif op == "$inc":
            for f, n in fields.items():
                doc[f] = doc.get(f, 0) + n
        elif op == "$unset":
            for f in fields:
                doc.pop(f, None)
        elif op == "$push":
            for f, v in fields.items():
                doc.setdefault(f, []).append(v)
        elif op == "$pull":
            for f, v in fields.items():
                if f in doc:
                    doc[f] = [x for x in doc[f] if x != v]
    return doc


def _apply_stage(docs, stage):
    """应用聚合管道的一个阶段"""
    if "$match" in stage:
        return [d for d in docs if _match(d, stage["$match"])]
    elif "$group" in stage:
        spec = stage["$group"]
        gid = spec["_id"]
        groups = {}
        for d in docs:
            key = d.get(gid.replace("$", "")) if gid.startswith("$") else gid
            groups.setdefault(key, []).append(d)
        result = []
        for key, group in groups.items():
            row = {"_id": key}
            for field, agg in spec.items():
                if field == "_id":
                    continue
                atype = list(agg.keys())[0]
                src_raw = agg[atype]
                # 处理 "$字段名" 或字面量值（如 $sum: 1 计数）
                if isinstance(src_raw, str) and src_raw.startswith("$"):
                    src = src_raw[1:]
                    getter = lambda g: g.get(src, 0)
                else:
                    getter = lambda g, v=src_raw: v
                if atype == "$sum":
                    row[field] = sum(getter(g) for g in group)
                elif atype == "$avg":
                    vals = [getter(g) for g in group]
                    row[field] = sum(vals) / len(vals) if vals else 0
                elif atype == "$count":
                    row[field] = len(group)
                elif atype == "$max":
                    row[field] = max(getter(g) for g in group)
                elif atype == "$min":
                    row[field] = min(getter(g) for g in group)
            result.append(row)
        return result
    elif "$sort" in stage:
        for field, direction in stage["$sort"].items():
            docs.sort(key=lambda x: x.get(field, 0), reverse=(direction == -1))
        return docs
    elif "$limit" in stage:
        return docs[:stage["$limit"]]
    elif "$project" in stage:
        result = []
        for d in docs:
            row = {}
            for f, v in stage["$project"].items():
                if v == 1:
                    row[f] = d.get(f)
            result.append(row)
        return result
    return docs


class FakeCursor:
    """模拟查询游标"""

    def __init__(self, docs):
        self._docs = docs

    def sort(self, field, direction=1):
        self._docs.sort(key=lambda x: x.get(field, 0),
                        reverse=(direction == -1))
        return self

    def limit(self, n):
        self._docs = self._docs[:n]
        return self

    def __iter__(self):
        return iter(self._docs)


# 选择使用真实还是模拟
if real_mongo:
    db = client["demo_db"]
    users = db["users"]
    users.delete_many({})
else:
    db = FakeMongoDB()
    users = db["users"]

# 3. 插入数据
print("\\n[2] 插入数据 insert_many：")
users.insert_many([
    {"name": "张三", "age": 28, "city": "北京", "salary": 15000},
    {"name": "李四", "age": 35, "city": "上海", "salary": 25000},
    {"name": "王五", "age": 22, "city": "北京", "salary": 9000},
    {"name": "赵六", "age": 40, "city": "广州", "salary": 30000},
    {"name": "钱七", "age": 30, "city": "上海", "salary": 20000},
])
print(f"  插入 5 条，总数 = {users.count_documents({})}")

# 4. 查询：操作符
print("\\n[3] 查询操作符：")
print("  age > 25：")
for d in users.find({"age": {"$gt": 25}}):
    print(f"    {d['name']} age={d['age']}")
print("  city in [北京, 上海]：")
for d in users.find({"city": {"$in": ["北京", "上海"]}}):
    print(f"    {d['name']} city={d['city']}")
print("  $or 广州 或 age >= 40：")
for d in users.find({"$or": [{"city": "广州"}, {"age": {"$gte": 40}}]}):
    print(f"    {d['name']} city={d['city']} age={d['age']}")

# 5. 更新
print("\\n[4] 更新操作：")
users.update_one({"name": "张三"}, {"$set": {"salary": 18000}, "$inc": {"age": 1}})
print("  update_one 张三 -> $set salary=18000, $inc age=1")
print(f"  验证 -> {users.find_one({'name': '张三'})}")
users.update_many({"city": "北京"}, {"$set": {"region": "华北"}})
print("  update_many 北京 -> $set region=华北")
for d in users.find({"city": "北京"}):
    print(f"    {d['name']} region={d.get('region')}")

# 6. 删除
print("\\n[5] 删除操作：")
users.insert_one({"name": "临时", "age": 18, "city": "测试"})
print(f"  插入临时数据，总数 = {users.count_documents({})}")
users.delete_one({"name": "临时"})
print(f"  delete_one 临时，剩余 = {users.count_documents({})}")
print("  delete_many age < 25：")
deleted = users.delete_many({"age": {"$lt": 25}})
print(f"  删除 {deleted.deleted_count} 条，剩余 = {users.count_documents({})}")

# 7. 聚合管道
print("\\n[6] 聚合管道（按城市分组统计）：")
pipeline = [
    {"$match": {"age": {"$gt": 0}}},
    {"$group": {"_id": "$city", "count": {"$sum": 1},
                "avg_salary": {"$avg": "$salary"}, "max_age": {"$max": "$age"}}},
    {"$sort": {"count": -1}},
]
for row in users.aggregate(pipeline):
    print(f"  城市={row['_id']}, 人数={row['count']}, "
          f"平均薪资={row['avg_salary']:.0f}, 最大年龄={row['max_age']}")

print("\\n" + "=" * 60)
print("总结：find 查 / update 改 / delete 删 / aggregate 聚合")
print("=" * 60)
`,
  },
];
