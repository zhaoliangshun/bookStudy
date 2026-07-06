// =============================================================
// Python 数据库编程教程（pydb）—— 第三批章节
// -------------------------------------------------------------
// Redis（3 章）+ MongoDB（2 章），共 5 章。
// NoSQL 数据库服务器可能未运行，所有代码均做 try/except 降级处理。
// =============================================================

export const chapters = [
  {
    id: "py-redis-intro",
    group: "Redis",
    icon: "🔴",
    title: "Redis 入门",
    content: `## 一、Redis 是什么

**Redis**（Remote Dictionary Server）是一个开源的内存键值数据库。它把数据存储在内存中，因此读写速度极快，常用于缓存、会话、排行榜、消息队列等场景。

## 二、Redis 的特点

- **内存存储**：读写速度接近内存访问级别。
- **丰富的数据类型**：String、List、Set、Sorted Set、Hash、Bitmap、HyperLogLog、Stream。
- **持久化**：支持 RDB 快照和 AOF 日志。
- **高可用**：支持主从复制、Sentinel、Cluster。
- **单线程模型**：避免锁竞争，命令原子执行。

## 三、Python 连接 Redis

使用 \`redis\` 库：

\`\`\`bash
pip install redis
\`\`\`

\`\`\`python
import redis

r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
r.set("name", "Alice")
print(r.get("name"))  # Alice
\`\`\`

## 四、本章 demo

下面的代码尝试连接本地 Redis，无服务器时降级演示。`,
    code: `# ============================================================
# 第十六章代码演示：Redis 入门
# ------------------------------------------------------------
# 尝试连接本地 Redis；无服务器时降级为打印提示。
# ============================================================
import sys

print("=" * 60)
print("Redis 入门演示")
print("=" * 60)

try:
    import redis
except ImportError:
    print("\\n[提示] 未安装 redis 库，请运行: pip install redis")
    sys.exit(0)

try:
    r = redis.Redis(host="127.0.0.1", port=6379, db=0, decode_responses=True, socket_connect_timeout=2)
    # ping 会触发连接
    if r.ping():
        print("\\n[1] 成功连接到本地 Redis 服务器")
        r.set("demo:key", "hello redis")
        value = r.get("demo:key")
        print(f"[2] 读取 demo:key = {value}")
        r.delete("demo:key")
    r.close()
except Exception as e:
    print(f"\\n[1] 无法连接本地 Redis: {e}")
    print("[提示] 请在本地启动 Redis 服务器后再运行本示例。")

print("\\n[3] Redis 常用命令速览：")
print("""
SET key value          # 设置字符串
GET key                # 读取字符串
DEL key                # 删除键
EXPIRE key 60          # 设置 60 秒过期时间
LPUSH list value       # 列表左侧插入
RPUSH list value       # 列表右侧插入
SADD set value         # 集合添加成员
HSET hash field value  # 哈希表设置字段
ZADD zset score value  # 有序集合添加成员
""")
`,
  },

  {
    id: "py-redis-connect",
    group: "Redis",
    icon: "🔌",
    title: "Redis 连接与基本操作",
    content: `## 一、Redis 连接方式

### 1.1 单连接

\`\`\`python
r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
\`\`\`

### 1.2 连接池

生产环境建议使用连接池：

\`\`\`python
pool = redis.ConnectionPool(host="localhost", port=6379, db=0)
r = redis.Redis(connection_pool=pool)
\`\`\`

## 二、decode_responses

设置 \`decode_responses=True\` 后，Redis 返回的 bytes 会自动解码为字符串，省去手动 \`.decode()\`。

## 三、常用命令

| 命令 | 说明 |
|------|------|
| \`set(key, value, ex=60)\` | 设置键值，可指定过期时间 |
| \`get(key)\` | 获取值 |
| \`delete(key)\` | 删除键 |
| \`exists(key)\` | 判断键是否存在 |
| \`expire(key, seconds)\` | 设置过期时间 |
| \`ttl(key)\` | 查看剩余生存时间 |

## 四、本章 demo

下面的代码演示 Redis 字符串操作、过期时间和连接池。`,
    code: `# ============================================================
# 第十七章代码演示：Redis 连接与基本操作
# ------------------------------------------------------------
# 演示 Redis 字符串操作、过期时间、连接池。
# ============================================================
import sys

try:
    import redis
except ImportError:
    print("请先安装 redis: pip install redis")
    sys.exit(0)

print("=" * 60)
print("Redis 连接与基本操作演示")
print("=" * 60)

try:
    # 使用连接池
    pool = redis.ConnectionPool(
        host="127.0.0.1",
        port=6379,
        db=0,
        decode_responses=True,
        socket_connect_timeout=2,
    )
    r = redis.Redis(connection_pool=pool)

    # 验证连接
    if not r.ping():
        raise ConnectionError("Redis ping 失败")

    print("\\n[1] 已通过连接池连接到 Redis")

    # 字符串操作
    r.set("user:1:name", "Alice")
    print(f"[2] SET user:1:name = {r.get('user:1:name')}")

    # 设置过期时间
    r.set("temp:code", "123456", ex=60)
    print(f"[3] temp:code 剩余过期时间: {r.ttl('temp:code')} 秒")

    # 删除键
    r.delete("user:1:name")
    print(f"[4] 删除后 user:1:name 是否存在: {r.exists('user:1:name')}")

    r.close()
    print("\\n[5] 连接已关闭")
except Exception as e:
    print(f"\\n[错误] 无法连接 Redis: {e}")
    print("[提示] 请在本地启动 Redis 后再运行本示例。")
`,
  },

  {
    id: "py-redis-datatypes",
    group: "Redis",
    icon: "📊",
    title: "Redis 数据类型",
    content: `## 一、Redis 核心数据类型

| 类型 | Python 对应 | 典型场景 |
|------|-------------|----------|
| String | str | 缓存、计数器、配置 |
| List | list | 消息队列、时间线 |
| Set | set | 标签、共同好友 |
| Sorted Set | zset | 排行榜、延迟队列 |
| Hash | dict | 对象存储、用户信息 |
| Bitmap | bits | 签到、活跃用户统计 |
| HyperLogLog | - | UV 统计 |
| Stream | - | 消息流、日志 |

## 二、List 操作

\`\`\`python
r.lpush("queue", "task1")
r.rpush("queue", "task2")
r.lrange("queue", 0, -1)
r.lpop("queue")
\`\`\`

## 三、Set 操作

\`\`\`python
r.sadd("tags", "python", "database")
r.smembers("tags")
r.sismember("tags", "python")
\`\`\`

## 四、Hash 操作

\`\`\`python
r.hset("user:1", mapping={"name": "Alice", "age": 28})
r.hgetall("user:1")
\`\`\`

## 五、Sorted Set 操作

\`\`\`python
r.zadd("rank", {"Alice": 100, "Bob": 90})
r.zrevrange("rank", 0, -1, withscores=True)
\`\`\`

## 六、本章 demo

下面的代码演示 Redis 五种核心数据类型的基本操作。`,
    code: `# ============================================================
# 第十八章代码演示：Redis 数据类型
# ------------------------------------------------------------
# 演示 String、List、Set、Hash、Sorted Set 五种数据类型。
# ============================================================
import sys

try:
    import redis
except ImportError:
    print("请先安装 redis: pip install redis")
    sys.exit(0)

print("=" * 60)
print("Redis 数据类型演示")
print("=" * 60)

try:
    r = redis.Redis(
        host="127.0.0.1",
        port=6379,
        db=0,
        decode_responses=True,
        socket_connect_timeout=2,
    )
    if not r.ping():
        raise ConnectionError("Redis ping 失败")

    print("\\n[1] String 字符串")
    r.set("counter", 100)
    r.incr("counter")
    print(f"  counter = {r.get('counter')}")

    print("\\n[2] List 列表")
    r.delete("mylist")
    r.rpush("mylist", "a", "b", "c")
    print(f"  mylist = {r.lrange('mylist', 0, -1)}")

    print("\\n[3] Set 集合")
    r.delete("myset")
    r.sadd("myset", "python", "redis", "python")
    print(f"  myset = {r.smembers('myset')}")

    print("\\n[4] Hash 哈希")
    r.delete("user:100")
    r.hset("user:100", mapping={"name": "Alice", "age": 28, "city": "Beijing"})
    print(f"  user:100 = {r.hgetall('user:100')}")

    print("\\n[5] Sorted Set 有序集合")
    r.delete("rank")
    r.zadd("rank", {"Alice": 95, "Bob": 88, "Carol": 92})
    print(f"  排行榜（降序）= {r.zrevrange('rank', 0, -1, withscores=True)}")

    # 清理演示键
    r.delete("counter", "mylist", "myset", "user:100", "rank")
    r.close()
    print("\\n[6] 演示键已清理，连接已关闭")
except Exception as e:
    print(f"\\n[错误] 无法连接 Redis: {e}")
    print("[提示] 请在本地启动 Redis 后再运行本示例。")
`,
  },

  {
    id: "py-mongo-intro",
    group: "MongoDB",
    icon: "🍃",
    title: "MongoDB 入门",
    content: `## 一、MongoDB 是什么

**MongoDB** 是一个开源的文档型 NoSQL 数据库。它使用 BSON（Binary JSON）格式存储数据，具有灵活的模式和高可扩展性。

## 二、MongoDB 的特点

- **灵活的 Schema**：文档结构可以自由变化。
- **JSON-like 文档**：天然适合存储对象和嵌套数据。
- **水平扩展**：支持分片集群。
- **强大的查询语言**：支持聚合管道、地理空间查询、文本搜索。
- **高可用**：副本集自动故障转移。

## 三、核心概念对比

| RDBMS | MongoDB |
|-------|---------|
| 数据库 | 数据库 |
| 表 | 集合（Collection） |
| 行 | 文档（Document） |
| 列 | 字段（Field） |
| 主键 | \`_id\` |
| 索引 | 索引 |

## 四、Python 连接 MongoDB

使用 \`pymongo\`：

\`\`\`bash
pip install pymongo
\`\`\`

\`\`\`python
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["test"]
collection = db["users"]
\`\`\`

## 五、本章 demo

下面的代码尝试连接本地 MongoDB，无服务器时降级演示。`,
    code: `# ============================================================
# 第十九章代码演示：MongoDB 入门
# ------------------------------------------------------------
# 尝试连接本地 MongoDB；无服务器时降级为打印提示。
# ============================================================
import sys

print("=" * 60)
print("MongoDB 入门演示")
print("=" * 60)

try:
    from pymongo import MongoClient
except ImportError:
    print("\\n[提示] 未安装 pymongo，请运行: pip install pymongo")
    sys.exit(0)

try:
    client = MongoClient("mongodb://127.0.0.1:27017/", serverSelectionTimeoutMS=2000)
    # 触发连接检查
    client.admin.command("ping")
    print("\\n[1] 成功连接到本地 MongoDB 服务器")

    db = client["demo"]
    collection = db["users"]
    collection.insert_one({"name": "Alice", "age": 28})
    doc = collection.find_one({"name": "Alice"})
    print(f"[2] 插入并读取文档: {doc}")
    collection.delete_one({"name": "Alice"})
    client.close()
except Exception as e:
    print(f"\\n[1] 无法连接本地 MongoDB: {e}")
    print("[提示] 请在本地启动 MongoDB 后再运行本示例。")

print("\\n[3] MongoDB 核心概念：")
print("  数据库  →  database")
print("  表      →  collection")
print("  行      →  document")
print("  列      →  field")
print("  主键    →  _id")
`,
  },

  {
    id: "py-mongo-crud",
    group: "MongoDB",
    icon: "✏️",
    title: "MongoDB CRUD 操作",
    content: `## 一、CRUD 方法

| 操作 | 方法 |
|------|------|
| Create | \`insert_one()\`, \`insert_many()\` |
| Read | \`find_one()\`, \`find()\` |
| Update | \`update_one()\`, \`update_many()\` |
| Delete | \`delete_one()\`, \`delete_many()\` |

## 二、查询操作符

| 操作符 | 含义 |
|--------|------|
| \`$eq\` | 等于 |
| \`$gt\` / \`$gte\` | 大于 / 大于等于 |
| \`$lt\` / \`$lte\` | 小于 / 小于等于 |
| \`$in\` | 在数组中 |
| \`$regex\` | 正则匹配 |
| \`$set\` | 更新字段 |
| \`$inc\` | 自增字段 |

## 三、示例

\`\`\`python
# 查询年龄大于 25 的用户
users = collection.find({"age": {"$gt": 25}})

# 更新用户年龄
collection.update_one({"name": "Alice"}, {"$set": {"age": 29}})
\`\`\`

## 四、本章 demo

下面的代码完整演示 MongoDB 的 CRUD 操作。`,
    code: `# ============================================================
# 第二十章代码演示：MongoDB CRUD 操作
# ------------------------------------------------------------
# 完整演示 MongoDB 的增删改查。
# ============================================================
import sys

try:
    from pymongo import MongoClient
except ImportError:
    print("请先安装 pymongo: pip install pymongo")
    sys.exit(0)

print("=" * 60)
print("MongoDB CRUD 操作演示")
print("=" * 60)

def run_mongo_crud():
    client = MongoClient("mongodb://127.0.0.1:27017/", serverSelectionTimeoutMS=2000)
    client.admin.command("ping")

    db = client["demo"]
    collection = db["products"]

    # 清理旧数据
    collection.delete_many({})
    print("\\n[Create] 清空 products 集合并重新插入")

    # Create：插入多个文档
    products = [
        {"name": "iPhone", "price": 5999, "stock": 10, "tags": ["phone", "apple"]},
        {"name": "MacBook", "price": 12999, "stock": 5, "tags": ["laptop", "apple"]},
        {"name": "AirPods", "price": 1299, "stock": 50, "tags": ["audio", "apple"]},
    ]
    result = collection.insert_many(products)
    print(f"[Create] 插入 {len(result.inserted_ids)} 个文档")

    # Read：查询所有
    print("\\n[Read] 所有商品：")
    for doc in collection.find():
        print(f"  {doc}")

    # Read：条件查询
    print("\\n[Read] 价格大于 5000 的商品：")
    for doc in collection.find({"price": {"$gt": 5000}}):
        print(f"  name={doc['name']}, price={doc['price']}")

    # Update：更新库存
    update_result = collection.update_one(
        {"name": "iPhone"},
        {"$inc": {"stock": -1}}
    )
    print(f"\\n[Update] 更新了 {update_result.modified_count} 个文档")

    # Delete：删除库存为 0 的文档
    delete_result = collection.delete_many({"stock": {"$lte": 0}})
    print(f"[Delete] 删除了 {delete_result.deleted_count} 个文档")

    # 最终数据
    print("\\n[最终数据] 剩余商品：")
    for doc in collection.find({}, {"_id": 0, "name": 1, "price": 1, "stock": 1}):
        print(f"  {doc}")

    client.close()
    print("\\n[结束] 连接已关闭")


try:
    run_mongo_crud()
except Exception as e:
    print(f"\\n[错误] {e}")
    print("[提示] 请确保本地 MongoDB 已启动。")
`,
  },
];
