// =============================================================
// 《MongoDB 实战教程》- 章节批次 1
// -------------------------------------------------------------
// 内容：第一部分 入门与基础（第 1-5 章）
// =============================================================

const chapters = [
  // =========================================================
  // 第一章：MongoDB 简介与环境搭建
  // =========================================================
  {
    id: "mongo-ch01",
    group: "第一部分 入门与基础",
    icon: "🍃",
    title: "第 1 章 MongoDB 简介与环境搭建",
    content: `# 第 1 章 MongoDB 简介与环境搭建

> "MongoDB 是为现代应用而生的文档数据库——它把 JSON 装进了数据库。"

如果你用过 MySQL、PostgreSQL，又写过 Node.js / Python 后端，那你一定经历过"对象与表结构互转"的痛苦：ORM 帮你抹平了差异，但代价是性能和灵活性。MongoDB 走了另一条路——**直接把文档（JSON-like）存进数据库**，让数据模型和代码模型保持一致。

本章带你从零搭建 MongoDB 环境，并写出第一个文档。

## 1.1 什么是 MongoDB

**MongoDB** 是一个开源的、面向文档的分布式数据库，由 C++ 编写，2009 年由 10gen 公司（现 MongoDB Inc.）发布。名字来源于英文单词 "humongous"（巨大的），寓意"处理海量数据"。

它的核心特征：

- **文档模型**：数据以 BSON（Binary JSON）文档存储，类似 JSON 对象
- **无 Schema**：同一集合内的文档结构可以不同（灵活 schema）
- **水平扩展**：原生支持分片（sharding），可跨多台机器分布数据
- **高性能**：内存映射文件 + 索引，读写都快
- **高可用**：副本集（Replica Set）自动故障转移

**典型应用场景**：

- 内容管理（文章、评论、标签结构多变）
- 用户画像与个性化推荐
- 物联网时序数据
- 实时分析与日志
- 移动应用后端

> **一句话理解**：MongoDB 是"会持久化的 JSON 仓库"，你的代码里对象长什么样，存进去就长什么样。

## 1.2 NoSQL vs SQL

很多新手纠结"该学 SQL 还是 NoSQL"。其实两者不是对立，而是**适用场景不同**。下面这张表帮你建立直觉：

| 维度 | SQL（MySQL/PostgreSQL） | NoSQL 文档库（MongoDB） |
| --- | --- | --- |
| **数据模型** | 二维表 + 固定列 | JSON 文档 + 灵活字段 |
| **Schema** | 强约束（建表定义） | 弱约束（按需加字段） |
| **关联查询** | 强（JOIN） | 弱（\$lookup 模拟，或冗余） |
| **事务** | 强（ACID） | 4.0+ 支持多文档事务 |
| **扩展方式** | 垂直（加机器配置） | 水平（分片） |
| **适合** | 强一致性、复杂关联 | 高写入、灵活结构、快速迭代 |

**什么时候选 MongoDB？**

1. 数据结构频繁变化（敏捷开发、MVP）
2. 嵌套数据多（订单含商品列表、用户含地址数组）
3. 单表数据量大、需要分库分表
4. 读写比偏写、且无复杂 JOIN

**什么时候别用 MongoDB？**

1. 业务核心是关系（如 ERP、财务系统）
2. 需要多表强事务
3. 大量复杂 JOIN 查询
4. 团队对 SQL 极熟、对 NoSQL 零经验

> **实战心法**：MongoDB 不是"更好的 MySQL"，而是另一种哲学——**用冗余换 JOIN，用灵活换约束**。

## 1.3 MongoDB 的版本演进

MongoDB 经过多次大版本迭代，每个版本都带来关键变化。作为开发者，你至少要知道近三个大版本：

| 版本 | 发布年份 | 关键特性 |
| --- | --- | --- |
| **4.x** | 2018 | 多文档 ACID 事务、副本集改进 |
| **5.x** | 2021 | 时间序列集合、原生审计、窗口函数 |
| **6.x** | 2022 | 集群到集群同步、查询优化器重写 |
| **7.x** | 2023 | 可查询加密（Queryable Encryption）、列式存储 |

**踩坑提示**：

- **mongosh 替代 mongo**：从 5.0 起，官方推荐用 \`mongosh\`（基于 Node.js）替代老 \`mongo\` 客户端，老客户端在 6.0 后被移除
- **驱动兼容性**：Node.js 驱动 4.x 适配 MongoDB 4.4+，5.x 适配 5.0+，6.x 适配 6.0+，注意版本对齐
- **License 变化**：4.0 起从 AGPL 改为 SSPL（Server Side Public License），云厂商不能直接转售，但自用无影响

> **建议**：新项目直接上 7.x，老项目至少升到 5.0（再低就享受不到事务和时间序列集合了）。

## 1.4 安装与启动

MongoDB 的安装方式很多，推荐**用 Docker**——一行命令搞定，环境隔离，方便切换版本。

### 方式一：Docker（强烈推荐）

\`\`\`javascript
// 拉取 MongoDB 7.0 镜像并启动一个容器
// 端口 27017 是 MongoDB 默认端口
docker run -d \\
  --name mongo-dev \\
  -p 27017:27017 \\
  -e MONGO_INITDB_ROOT_USERNAME=admin \\
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \\
  -v mongo-data:/data/db \\
  mongo:7.0

// 参数解释：
// -d          后台运行
// --name      容器名
// -p          端口映射（宿主机:容器）
// -e          环境变量（初始化 root 账号密码）
// -v          数据卷挂载（持久化数据）
\`\`\`

启动后用 \`docker ps\` 确认容器在跑，用 \`docker logs mongo-dev\` 看日志。

### 方式二：macOS（Homebrew）

\`\`\`javascript
// 添加 MongoDB 官方 tap
brew tap mongodb/brew

// 安装社区版 7.0
brew install mongodb-community@7.0

// 启动服务（后台常驻）
brew services start mongodb-community@7.0

// 手动启动（前台，看日志）
mongod --config /opt/homebrew/etc/mongod.conf
\`\`\`

### 方式三：Linux（Ubuntu/Debian）

\`\`\`javascript
// 1. 导入 GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

// 2. 添加源
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

// 3. 安装
sudo apt-get update
sudo apt-get install -y mongodb-org

// 4. 启动
sudo systemctl start mongod
sudo systemctl enable mongod   // 开机自启
\`\`\`

> **踩坑**：Linux 安装后默认监听 \`127.0.0.1\`，外部连不上。改 \`/etc/mongod.conf\` 的 \`bindIp: 0.0.0.0\`，但要先开防火墙和认证！

## 1.5 mongosh 命令行工具

\`mongosh\` 是 MongoDB 官方新一代 shell，基于 Node.js，支持语法高亮、自动补全、错误提示。装好 MongoDB 后，单独装 mongosh：

\`\`\`javascript
// 用 npm 全局安装
npm install -g mongosh

// 或用 Docker 直接进容器
docker exec -it mongo-dev mongosh -u admin -p admin123
\`\`\`

进入 mongosh 后，常用命令：

\`\`\`javascript
// 显示所有数据库
show dbs

// 切换/创建数据库（不存在则创建，但要有数据才真正落盘）
use mydb

// 显示当前数据库
db

// 显示当前库的所有集合
show collections

// 查看服务器状态
db.serverStatus()

// 查看当前连接数
db.serverStatus().connections

// 退出
exit
\`\`\`

**mongosh 的"隐藏技能"**：

- **支持 JS 语法**：可以直接写 \`for\` 循环批量造数据
- **Tab 补全**：输入 \`db.\` 按 Tab 看所有方法
- **\`.pretty()\`**：格式化输出，长文档可读性更好
- **历史记录**：上下键翻看历史命令

\`\`\`javascript
// 用 JS 批量插入测试数据
for (let i = 0; i < 100; i++) {
  db.users.insertOne({ name: "user" + i, age: i });
}
\`\`\`

## 1.6 第一个文档

万事俱备，我们来插入并查询第一个文档。

\`\`\`javascript
// 1. 切换到测试库
use demo

// 2. 插入一条文档（集合不存在会自动创建）
db.users.insertOne({
  name: "张三",
  age: 28,
  email: "zhangsan@example.com",
  hobbies: ["编程", "游泳"],
  address: {
    city: "北京",
    zip: "100000"
  },
  createdAt: new Date()
})

// 3. 查询所有文档
db.users.find().pretty()

// 4. 条件查询
db.users.find({ age: { \$gt: 25 } })

// 5. 查询单条
db.users.findOne({ name: "张三" })

// 6. 统计数量
db.users.countDocuments()
\`\`\`

**用 Node.js 驱动做同样的事**：

\`\`\`javascript
// 安装驱动：npm install mongodb
const { MongoClient } = require("mongodb");

// 连接字符串：mongodb://用户名:密码@主机:端口
const uri = "mongodb://admin:admin123@localhost:27017";

const client = new MongoClient(uri);

async function main() {
  await client.connect();
  console.log("连接成功");

  const db = client.db("demo");
  const users = db.collection("users");

  // 插入一条
  const result = await users.insertOne({
    name: "李四",
    age: 30,
    email: "lisi@example.com",
  });
  console.log("插入的 _id:", result.insertedId);

  // 查询
  const docs = await users.find({}).toArray();
  console.log("所有用户:", docs);

  await client.close();
}

main().catch(console.error);
\`\`\`

> **踩坑提示**：
> 1. \`_id\` 字段是 MongoDB 自动生成的 \`ObjectId\`（12 字节），你也可自定义
> 2. \`use demo\` 不会立即创建数据库——只有插入第一条文档时才真正落盘
> 3. Node.js 驱动返回的是 Promise，必须用 \`await\` 或 \`.then()\`

## 1.7 本章小结

本章你掌握了：

- MongoDB 是面向文档的 NoSQL 数据库，用 BSON 存储 JSON-like 文档
- 与 SQL 数据库的核心差异：灵活 schema、弱关联、水平扩展友好
- 版本演进：4.x 引入事务、5.x 时间序列、6.x 优化器重写、7.x 可查询加密
- 三种安装方式：Docker（推荐）、Homebrew、apt
- mongosh 命令行基本操作
- 插入并查询第一个文档

下一章我们深入**文档模型与 BSON 数据格式**，搞清楚 MongoDB 到底是怎么"装"数据的。`
  },

  // =========================================================
  // 第二章：文档模型与 BSON
  // =========================================================
  {
    id: "mongo-ch02",
    group: "第一部分 入门与基础",
    icon: "📄",
    title: "第 2 章 文档模型与 BSON",
    content: `# 第 2 章 文档模型与 BSON

> "理解文档，就理解了 MongoDB 的灵魂。"

上一章我们插入了第一个文档，但还没深究"文档到底是什么"。本章彻底搞清楚 MongoDB 的数据组织方式——文档、集合、数据库三层结构，以及底层的 BSON 格式。

## 2.1 文档（Document）的概念

**文档**是 MongoDB 中数据的基本单元，类似 SQL 中的一行记录。但与行不同，文档是**键值对（key-value）的有序集合**，长得像 JSON 对象：

\`\`\`javascript
// 一个典型的 MongoDB 文档
{
  _id: ObjectId("65a1b2c3d4e5f6a7b8c9d0e1"),
  name: "张三",
  age: 28,
  isActive: true,
  tags: ["vip", "early-adopter"],
  address: {
    city: "北京",
    zip: "100000",
    geo: [116.40, 39.90]
  },
  createdAt: ISODate("2024-01-15T08:00:00Z")
}
\`\`\`

**文档的关键规则**：

- **字段名是字符串**：不能以 \`\$\` 开头，不能含 \`.\`（这两个字符保留给操作符和路径访问）
- **字段值类型多样**：可以是字符串、数字、布尔、日期、数组、嵌套文档、null 等
- **字段顺序有意义**：插入时字段的顺序会被保留（虽然查询时不依赖顺序）
- **\`_id\` 字段必须**：每个文档都有唯一的 \`_id\`，不指定时自动生成 \`ObjectId\`

> **与 SQL 行的对比**：SQL 行是"扁平的"，每列类型固定；文档是"嵌套的"，可以装对象、数组，结构灵活。

## 2.2 集合（Collection）与数据库

MongoDB 的数据组织是**三层结构**：

\`\`\`
数据库（Database）
  └── 集合（Collection）
        └── 文档（Document）
\`\`\`

**数据库（Database）**

- 类似 SQL 中的"库"
- 一个 MongoDB 实例可以有多个数据库
- 数据库名区分大小写，不能含空格和特殊字符（\`/\\\\. "\$*<>:|?\`）
- 保留库名：\`admin\`（管理）、\`local\`（本地副本集信息）、\`config\`（分片配置）

**集合（Collection）**

- 类似 SQL 中的"表"
- 集合存在于数据库内，\`db.collection\` 访问
- 集合名不能以 \`system.\` 开头（保留），不能含 \`\$\`
- **集合是无 schema 的**：同一集合内的文档结构可以完全不同（虽然实际开发中通常一致）

\`\`\`javascript
// 同一集合中可以存结构完全不同的文档（但实际开发不推荐）
db.mixed.insertOne({ type: "user", name: "张三" });
db.mixed.insertOne({ type: "log", level: "info", msg: "hello" });
db.mixed.find();
// 两条文档都能查出来，但查询和维护成本高
\`\`\`

> **实战心法**：虽然 MongoDB 允许"异构文档"，但**生产环境尽量保持集合内文档结构一致**——否则查询、索引、维护都会变复杂。可以用"集合分治"：不同类型的数据存不同集合。

**常用集合管理命令**：

\`\`\`javascript
// 显式创建集合（可指定选项，如固定大小集合 capped）
db.createCollection("logs", {
  capped: true,        // 是否固定大小
  size: 10485760,      // 字节数（10MB）
  max: 10000           // 最大文档数
});

// 删除集合
db.logs.drop();

// 重命名集合
db.oldCollection.renameCollection("newCollection");

// 查看集合统计信息
db.users.stats();
\`\`\`

## 2.3 BSON 数据格式

MongoDB 内部并不直接存 JSON——它用了一种**二进制 JSON 格式：BSON**。

**BSON = Binary JSON**，是 MongoDB 自定义的二进制编码格式，相比纯 JSON 的优势：

| 特性 | JSON | BSON |
| --- | --- | --- |
| **编码方式** | 文本（UTF-8） | 二进制 |
| **数据类型** | 6 种（string/number/bool/null/array/object） | 20+ 种（含 Date、ObjectId、Decimal128、Binary 等） |
| **长度前缀** | 无 | 有（每个元素前有长度，便于跳过） |
| **解析速度** | 慢（要逐字符扫描） | 快（按长度跳转） |
| **体积** | 小 | 略大（有元数据开销） |

**BSON 的优势场景**：

1. **高效遍历**：知道每个字段长度，可以快速跳过不需要的部分
2. **强类型**：能区分 int32 / int64 / double / Decimal128，JSON 只能 number
3. **原生支持日期**：JSON 没有日期类型，BSON 有 \`ISODate\`

> **踩坑**：BSON 比 JSON **略大**（每字段多了类型和长度字节）。如果你的数据主要是长字符串，存储膨胀约 5%-10%。但换来的是查询性能，值得。

## 2.4 数据类型（ObjectId/Date/Decimal128/Binary）

BSON 支持丰富的数据类型，下表列出最常用的：

| 类型 | 示例 | 说明 |
| --- | --- | --- |
| **String** | \`"hello"\` | UTF-8 字符串 |
| **Int32** | \`42\` | 32 位整数 |
| **Int64** | \`NumberLong("42")\` | 64 位长整型 |
| **Double** | \`3.14\` | 64 位浮点 |
| **Decimal128** | \`NumberDecimal("99.99")\` | 128 位高精度小数（金额！） |
| **Boolean** | \`true\` / \`false\` | 布尔 |
| **Null** | \`null\` | 空值 |
| **ObjectId** | \`ObjectId("...")\` | 12 字节唯一 ID |
| **Date** | \`new Date()\` / \`ISODate()\` | UTC 日期时间 |
| **Timestamp** | \`Timestamp(0, 1)\` | 内部时间戳（复制用） |
| **Array** | \`[1, 2, 3]\` | 数组（可嵌套） |
| **Object** | \`{ a: 1 }\` | 嵌套文档 |
| **Binary** | \`BinData(0, "base64")\` | 二进制（存图片等） |
| **Regex** | \`/pattern/\` | 正则表达式 |

**重点类型详解**：

### ObjectId

\`_id\` 字段默认类型，12 字节，结构如下：

\`\`\`
| 4 字节时间戳 | 5 字节随机值 | 3 字节递增计数器 |
\`\`\`

\`\`\`javascript
// 生成一个 ObjectId
const id = new ObjectId();
console.log(id);              // ObjectId("65a1b2c3d4e5f6a7b8c9d0e1")

// 从 ObjectId 提取创建时间
const date = id.getTimestamp();
console.log(date);            // 2024-01-12T10:30:15.000Z

// 用字符串构造
const id2 = ObjectId("65a1b2c3d4e5f6a7b8c9d0e1");
\`\`\`

> **优势**：ObjectId 内含时间戳，**按 _id 排序近似按时间排序**，且**分布式下不会冲突**（随机值保证）。

### Date

\`\`\`javascript
// 三种等价写法
db.events.insertOne({ time: new Date() });
db.events.insertOne({ time: ISODate() });
db.events.insertOne({ time: ISODate("2024-01-15T08:00:00Z") });

// 查询某天的数据（注意时区！）
db.events.find({
  time: {
    \$gte: ISODate("2024-01-15T00:00:00Z"),
    \$lt:  ISODate("2024-01-16T00:00:00Z")
  }
});
\`\`\`

> **踩坑**：MongoDB 日期是 **UTC** 存储！查询时如果用本地时间，可能差 8 小时。Node.js 驱动返回的 Date 对象是 UTC，显示时再转本地。

### Decimal128

\`\`\`javascript
// 存金额必须用 Decimal128，不能用 double（浮点精度问题）
db.accounts.insertOne({
  holder: "张三",
  balance: NumberDecimal("9999999999.99")   // 128 位高精度
});

// 错误示范：用 double 存金额
db.accounts.insertOne({ balance: 0.1 + 0.2 });  // 实际是 0.30000000000000004
\`\`\`

> **心法**：**钱一律用 Decimal128**！double 的 \`0.1 + 0.2 = 0.30000000000000004\` 是经典坑。

### Binary

\`\`\`javascript
// 存二进制（图片、加密内容等）
const fs = require("fs");
const buf = fs.readFileSync("avatar.png");

db.images.insertOne({
  name: "avatar.png",
  data: buf,                          // Node.js 驱动会自动转 BinData
  contentType: "image/png"
});

// mongosh 中手动构造
db.images.insertOne({
  data: BinData(0, "iVBORw0KGgoAAAANSUhEUgAA...")
});
\`\`\`

> **注意**：单文档 16MB 限制，大文件用 **GridFS**（分块存储），不要直接塞 Binary。

## 2.5 文档大小限制（16MB）

**BSON 文档最大 16MB**。这个限制是为了防止单个文档占用过多内存和带宽。

\`\`\`javascript
// 查看文档大小
const doc = db.users.findOne();
print(JSON.stringify(doc).length);   // 字节数（近似）

// 用 bsonsize 计算精确 BSON 大小
print(bsonsize(doc));                // 字节数
\`\`\`

**超过 16MB 怎么办？**

| 场景 | 方案 |
| --- | --- |
| 大文件（图片、视频） | 用 **GridFS** 分块存储 |
| 大文本（长文章） | 拆分到子集合，用引用关联 |
| 嵌套数组爆炸（评论树） | 拆分集合，避免无限嵌套 |
| 日志超大 | 用 capped collection 或分片 |

> **踩坑**：很多人把评论直接嵌套在文章文档里，结果热门文章评论 10 万条直接爆 16MB。**评论单独建集合**，用 \`articleId\` 引用。

## 2.6 本章小结

本章你掌握了：

- 文档是键值对的有序集合，是 MongoDB 数据的基本单元
- 三层结构：数据库 → 集合 → 文档
- BSON 是 MongoDB 的二进制 JSON 编码，支持 20+ 种数据类型
- 重点类型：ObjectId（含时间戳）、Date（UTC）、Decimal128（金额）、Binary
- 文档 16MB 限制，大文件用 GridFS

下一章我们正式开始**插入文档**，把数据真正写进 MongoDB。`
  },

  // =========================================================
  // 第三章：插入文档
  // =========================================================
  {
    id: "mongo-ch03",
    group: "第一部分 入门与基础",
    icon: "✏️",
    title: "第 3 章 插入文档",
    content: `# 第 3 章 插入文档

> "数据进得来，数据库才活得下去。"

学会了文档模型，下一步就是**把数据写进去**。MongoDB 提供了 \`insertOne\`、\`insertMany\` 两种插入方法，看似简单，但围绕写入确认、批量性能、错误处理有不少门道。

## 3.1 insertOne

\`insertOne\` 插入单条文档，返回插入结果（含生成的 \`_id\`）。

\`\`\`javascript
// mongosh 中
db.users.insertOne({
  name: "张三",
  age: 28,
  email: "zhangsan@example.com",
  createdAt: new Date()
});

// 返回值：
// {
//   acknowledged: true,
//   insertedId: ObjectId("65a1b2c3...")
// }
\`\`\`

**Node.js 驱动写法**：

\`\`\`javascript
const { MongoClient } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017");

async function main() {
  await client.connect();
  const db = client.db("demo");
  const users = db.collection("users");

  const result = await users.insertOne({
    name: "李四",
    age: 30,
    email: "lisi@example.com"
  });

  console.log(result);
  // {
  //   acknowledged: true,
  //   insertedId: ObjectId("...")
  // }
  console.log("插入的 _id:", result.insertedId);

  await client.close();
}
main();
\`\`\`

**acknowledged 字段的含义**：

- \`true\`：服务器确认了写入（受 writeConcern 影响）
- \`false\`：用了 \`w: 0\`（不等待确认），驱动返回时不保证写入成功

> **踩坑**：\`acknowledged: false\` 不代表写入失败，只是没等确认。绝大多数业务应该用默认（\`w: 1\`），保证 \`acknowledged: true\`。

## 3.2 insertMany

\`insertMany\` 一次插入多条，**比循环 insertOne 快几十倍**——因为它只发一次网络请求。

\`\`\`javascript
// mongosh 批量插入
db.users.insertMany([
  { name: "张三", age: 28 },
  { name: "李四", age: 30 },
  { name: "王五", age: 25 }
]);

// 返回值：
// {
//   acknowledged: true,
//   insertedCount: 3,
//   insertedIds: {
//     0: ObjectId("..."),
//     1: ObjectId("..."),
//     2: ObjectId("...")
//   }
// }
\`\`\`

**Node.js 批量插入**：

\`\`\`javascript
async function bulkInsert() {
  const users = client.db("demo").collection("users");

  // 造 10000 条数据
  const docs = [];
  for (let i = 0; i < 10000; i++) {
    docs.push({
      name: \`user_\${i}\`,
      age: 18 + (i % 50),
      idx: i,
      createdAt: new Date()
    });
  }

  const result = await users.insertMany(docs);
  console.log(\`插入了 \${result.insertedCount} 条\`);
}
\`\`\`

**批量插入的注意事项**：

1. **单次最多 1000 条**（驱动限制），超过会自动分批
2. **总大小不超 16MB**（单次请求的 BSON 上限）
3. **大批量数据用 \`bulkWrite\`** 更可控（见下文）

\`\`\`javascript
// 超大批量用 bulkWrite（更底层、更高效）
const bulkOps = [];
for (let i = 0; i < 100000; i++) {
  bulkOps.push({
    insertOne: {
      document: { name: \`user_\${i}\`, age: i % 100 }
    }
  });

  // 每 5000 条发一次请求
  if (bulkOps.length === 5000) {
    await users.bulkWrite(bulkOps);
    bulkOps.length = 0;
  }
}
if (bulkOps.length > 0) {
  await users.bulkWrite(bulkOps);
}
\`\`\`

## 3.3 自定义 _id

\`_id\` 不指定时自动生成 \`ObjectId\`，但**你也可以自定义**：

\`\`\`javascript
// 用整数作 _id（适合固定数据）
db.configs.insertOne({ _id: 1, key: "site_name", value: "我的网站" });
db.configs.insertOne({ _id: 2, key: "max_users", value: 1000 });

// 用字符串作 _id（适合自然唯一键）
db.articles.insertOne({
  _id: "mongo-intro",
  title: "MongoDB 入门",
  content: "..."
});

// 用 UUID（适合分布式）
db.sessions.insertOne({
  _id: UUID("550e8400-e29b-41d4-a716-446655440000"),
  userId: 123,
  expires: new Date()
});
\`\`\`

**自定义 _id 的取舍**：

| 自定义 _id 类型 | 优点 | 缺点 |
| --- | --- | --- |
| **整数** | 紧凑、易读 | 分布式下冲突 |
| **字符串** | 业务可读 | 占空间大、索引慢 |
| **UUID** | 分布式无冲突 | 16 字节，索引大 |
| **ObjectId（默认）** | 含时间戳、分布式友好 | 12 字节、不可读 |

> **心法**：除非业务有强需求（如配置表用整数 _id），**默认让 MongoDB 自动生成 ObjectId**。

## 3.4 插入的写入关注（writeConcern）

**writeConcern（写入关注）** 决定"写入算成功"需要几个节点确认。这是数据可靠性与性能的权衡。

\`\`\`javascript
// 默认：主节点确认即成功
db.users.insertOne(
  { name: "张三" },
  { writeConcern: { w: 1 } }       // 主节点确认
);

// 多节点确认（副本集，更可靠）
db.users.insertOne(
  { name: "张三" },
  { writeConcern: { w: 2, j: true } }   // 2 个节点确认 + 写入 journal
);

// 不等待确认（最快，但可能丢数据）
db.users.insertOne(
  { name: "张三" },
  { writeConcern: { w: 0 } }
);

// 多数派确认（推荐，自动故障转移时不丢数据）
db.users.insertOne(
  { name: "张三" },
  { writeConcern: { w: "majority", j: true } }
);
\`\`\`

**参数说明**：

| 参数 | 含义 | 取值 |
| --- | --- | --- |
| \`w\` | 确认节点数 | \`0\`（不等）/ \`1\`（主）/ \`n\` / \`"majority"\` |
| \`j\` | 是否写 journal（持久化日志） | \`true\` / \`false\` |
| \`wtimeout\` | 等待超时（毫秒） | 数字 |

**写入级别对比**：

| 级别 | 性能 | 可靠性 | 适用场景 |
| --- | --- | --- | --- |
| \`w: 0\` | ⭐⭐⭐⭐⭐ | ⭐ | 日志、监控（可丢） |
| \`w: 1\`（默认） | ⭐⭐⭐⭐ | ⭐⭐ | 普通业务 |
| \`w: "majority"\` | ⭐⭐⭐ | ⭐⭐⭐⭐ | 重要数据（订单、支付） |

> **踩坑**：\`w: 0\` 看似快，但**写入失败你不会知道**！除非是日志类可丢数据，否则别用。

## 3.5 有序插入 vs 无序插入

\`insertMany\` 有个 \`ordered\` 选项，决定**遇到错误时的行为**：

- \`ordered: true\`（默认）：按顺序插入，遇到错误停止
- \`ordered: false\`：并行插入，遇到错误继续

\`\`\`javascript
// 有序插入：第 2 条 _id 重复，第 3 条不会插入
db.users.insertMany([
  { _id: 1, name: "A" },
  { _id: 1, name: "B" },   // 重复 _id，报错
  { _id: 2, name: "C" }    // 不会执行
], { ordered: true });
// 结果：只插入了 1 条（A）

// 无序插入：第 2 条报错，但第 3 条仍会插入
db.users.insertMany([
  { _id: 1, name: "A" },
  { _id: 1, name: "B" },   // 重复 _id，报错
  { _id: 2, name: "C" }    // 仍会插入
], { ordered: false });
// 结果：插入了 2 条（A、C）
\`\`\`

**性能差异**：

\`\`\`javascript
// 10000 条数据测试
// 有序：串行执行，慢
// 无序：MongoDB 内部并行，快 30%-50%
db.big.insertMany(docs, { ordered: false });
\`\`\`

> **心法**：批量导入数据**默认用 \`ordered: false\`**，除非业务要求"按顺序失败即停止"。

## 3.6 本章小结

本章你掌握了：

- \`insertOne\` 插入单条，返回 \`acknowledged\` 和 \`insertedId\`
- \`insertMany\` 批量插入，比循环快几十倍，单次最多 1000 条
- 自定义 \`_id\` 的几种方式及取舍
- writeConcern：\`w: 0\` 快但不可靠、\`w: "majority"\` 慢但安全
- \`ordered\` 选项：批量插入遇错是否继续

下一章我们学习**查询文档 find**——MongoDB 最核心、最常用的能力。`
  },

  // =========================================================
  // 第四章：查询文档 find
  // =========================================================
  {
    id: "mongo-ch04",
    group: "第一部分 入门与基础",
    icon: "🔍",
    title: "第 4 章 查询文档 find",
    content: `# 第 4 章 查询文档 find

> "数据库 80% 的时间在查询，find 是 MongoDB 的看家本领。"

插入数据是为了查出来用。MongoDB 的 \`find\` 语法基于"查询文档"——你写一个 JSON 描述要什么，它返回匹配的文档。本章系统讲解查询的全部核心语法。

## 4.1 find 基本语法

\`\`\`javascript
// 查询所有文档
db.users.find()

// 等值查询
db.users.find({ name: "张三" })

// 多条件 AND（逗号分隔）
db.users.find({ name: "张三", age: 28 })

// 查询单条
db.users.findOne({ name: "张三" })

// 链式调用（mongosh 支持）
db.users
  .find({ age: { \$gt: 20 } })
  .sort({ age: 1 })
  .limit(10)
  .pretty()
\`\`\`

**Node.js 驱动**：

\`\`\`javascript
const docs = await users.find({ age: { \$gt: 20 } }).toArray();
const one = await users.findOne({ name: "张三" });

// 游标遍历（大数据推荐，避免一次性加载）
const cursor = users.find({});
for await (const doc of cursor) {
  console.log(doc.name);
}
\`\`\`

> **心法**：\`find\` 返回的是**游标（cursor）**，不是数组！只有调用 \`.toArray()\` 或迭代时才真正执行查询。

## 4.2 比较运算符

| 运算符 | 含义 | 示例 |
| --- | --- | --- |
| \`\$eq\` | 等于（默认） | \`{ age: { \$eq: 28 } }\` |
| \`\$ne\` | 不等于 | \`{ age: { \$ne: 28 } }\` |
| \`\$gt\` | 大于 | \`{ age: { \$gt: 28 } }\` |
| \`\$gte\` | 大于等于 | \`{ age: { \$gte: 28 } }\` |
| \`\$lt\` | 小于 | \`{ age: { \$lt: 28 } }\` |
| \`\$lte\` | 小于等于 | \`{ age: { \$lte: 28 } }\` |
| \`\$in\` | 在列表中 | \`{ age: { \$in: [25, 28, 30] } }\` |
| \`\$nin\` | 不在列表中 | \`{ age: { \$nin: [25, 28] } }\` |

\`\`\`javascript
// 查 18-30 岁的用户
db.users.find({ age: { \$gte: 18, \$lte: 30 } });

// 查北京/上海/广州的用户
db.users.find({ city: { \$in: ["北京", "上海", "广州"] } });

// 查不在黑名单的用户
db.users.find({ userId: { \$nin: [1, 2, 3] } });
\`\`\`

> **踩坑**：\`\$ne\` 和 \`\$nin\` **不能用索引高效查询**——它们要扫整个集合。大数据下慎用，改用反向条件或冗余字段。

## 4.3 逻辑运算符

| 运算符 | 含义 |
| --- | --- |
| \`\$and\` | 与（默认逗号即 AND） |
| \`\$or\` | 或 |
| \`\$nor\` | 或的非 |
| \`\$not\` | 非 |

\`\`\`javascript
// OR：查北京或上海的用户
db.users.find({
  \$or: [
    { city: "北京" },
    { city: "上海" }
  ]
});

// AND：多个条件在同一字段时必须用 $and
db.users.find({
  \$and: [
    { age: { \$gt: 18 } },
    { age: { \$lt: 60 } }
  ]
});
// 注：单字段多条件可以直接写 { age: { \$gt: 18, \$lt: 60 } }

// NOR：既不是北京也不是上海
db.users.find({
  \$nor: [
    { city: "北京" },
    { city: "上海" }
  ]
});

// NOT：年龄不大于 30
db.users.find({
  age: { \$not: { \$gt: 30 } }
});
\`\`\`

> **心法**：\`\$or\` 性能比 \`\$in\` 差（要走多次索引扫描），能用 \`\$in\` 就别用 \`\$or\`。

## 4.4 字段存在性（$exists）

\`\`\`javascript
// 查有 email 字段的用户
db.users.find({ email: { \$exists: true } });

// 查没有 email 字段的用户
db.users.find({ email: { \$exists: false } });

// 实战：清理脏数据，找没有 createdAt 的文档
db.users.find({ createdAt: { \$exists: false } }).count();
\`\`\`

> **踩坑**：\`{ field: null }\` 和 \`{ field: { \$exists: false } }\` 不同——前者匹配字段值为 null 的文档，后者匹配字段不存在的文档。

## 4.5 类型查询（$type）

\`\$type\` 按字段的数据类型查询，适合排查"脏数据"（同一字段类型不一致）。

\`\`\`javascript
// 查 age 是字符串的文档（异常数据）
db.users.find({ age: { \$type: "string" } });

// 查 age 是数字的文档（int32 或 double）
db.users.find({ age: { \$type: ["int", "double", "long"] } });

// 类型别名对照：
// "double" / "string" / "object" / "array" / "bool" / "null"
// "int" / "long" / "date" / "objectId" / "decimal"
\`\`\`

> **实战场景**：老数据迁移后 age 字段既有数字又有字符串，用 \`\$type\` 找出字符串的批量修复。

## 4.6 查询嵌套文档

文档可以嵌套，查询时用**点号路径**或**对象匹配**：

\`\`\`javascript
// 文档结构：
// {
//   name: "张三",
//   address: {
//     city: "北京",
//     zip: "100000"
//   }
// }

// 方式 1：点号路径（推荐）
db.users.find({ "address.city": "北京" });

// 方式 2：对象匹配（必须完全匹配，含字段顺序）
db.users.find({ address: { city: "北京", zip: "100000" } });
// 这个查不到 address = { zip: "100000", city: "北京" } 的文档！

// 嵌套多层的点号路径
db.users.find({ "address.geo.lat": 39.9 });
\`\`\`

> **踩坑**：对象匹配要求**完全相等**（字段、顺序、数量都一致），实际开发**几乎都用点号路径**。

## 4.7 查询数组

数组查询是 MongoDB 的强项，但语法有点反直觉：

\`\`\`javascript
// 文档结构：
// { name: "张三", tags: ["vip", "early", "beta"] }

// 1. 数组包含某元素（精确匹配整个元素）
db.users.find({ tags: "vip" });
// 匹配 tags 数组中含 "vip" 的文档

// 2. 数组完全等于某列表
db.users.find({ tags: ["vip", "beta"] });
// 仅匹配 tags = ["vip", "beta"]（顺序也要一致）

// 3. $all：包含所有指定元素（顺序无关）
db.users.find({ tags: { \$all: ["vip", "beta"] } });

// 4. $size：数组长度
db.users.find({ tags: { \$size: 3 } });

// 5. 数组元素的索引查询
db.users.find({ "tags.0": "vip" });   // 第一个元素是 vip

// 6. 数组元素满足条件（用 $elemMatch）
db.products.find({
  specs: {
    \$elemMatch: { name: "cpu", value: { \$gt: 3.0 } }
  }
});
\`\`\`

**$elemMatch 的精髓**：

\`\`\`javascript
// 文档：
// { results: [70, 85, 90] }

// ❌ 这样写：查 results 里有 >80 且 <90 的元素
// 实际匹配的是"任一元素 >80 且任一元素 <90"，可能不是同一个！
db.scores.find({ results: { \$gt: 80, \$lt: 90 } });

// ✅ 用 $elemMatch：同一个元素同时满足 >80 且 <90
db.scores.find({
  results: { \$elemMatch: { \$gt: 80, \$lt: 90 } }
});
\`\`\`

> **心法**：**数组多条件查询永远用 \`\$elemMatch\`**，否则可能查到错误结果。

## 4.8 本章小结

本章你掌握了：

- \`find\` 基本语法，返回游标
- 比较运算符：\`\$gt\` \`\$lt\` \`\$in\` \`\$nin\` 等
- 逻辑运算符：\`\$and\` \`\$or\` \`\$nor\` \`\$not\`（能用 \`\$in\` 就别用 \`\$or\`）
- \`\$exists\` 查字段存在性、\`\$type\` 查数据类型
- 嵌套文档用点号路径查询（不要用对象匹配）
- 数组查询：\`\$all\` \`\$size\` \`\$elemMatch\`（多条件必用 \`\$elemMatch\`）

下一章我们学习**更新文档**——把查出来的数据改掉。`
  },

  // =========================================================
  // 第五章：更新文档
  // =========================================================
  {
    id: "mongo-ch05",
    group: "第一部分 入门与基础",
    icon: "🔄",
    title: "第 5 章 更新文档",
    content: `# 第 5 章 更新文档

> "数据是流动的——今天对，明天就错了。更新能力决定了你的数据库能否跟得上业务。"

MongoDB 的更新操作丰富而强大——既能改字段、删字段，又能往数组里加元素、从数组里删元素。本章系统讲解所有更新语法。

## 5.1 updateOne / updateMany

\`\`\`javascript
// 更新单条（只改第一个匹配）
db.users.updateOne(
  { name: "张三" },          // 查询条件
  { \$set: { age: 29 } }      // 更新操作
);

// 更新多条
db.users.updateMany(
  { status: "inactive" },
  { \$set: { status: "active" } }
);

// 返回值
// {
//   acknowledged: true,
//   matchedCount: 1,     // 匹配数
//   modifiedCount: 1     // 实际修改数（如果值没变，modifiedCount 可能 < matchedCount）
// }
\`\`\`

> **心法**：默认情况下，\`updateOne\` 只改**第一条匹配**。如果想批量更新，**必须用 \`updateMany\`**。SQL 里的 \`UPDATE ... WHERE\` 默认是全量，MongoDB 这里反直觉，新手易踩坑。

## 5.2 字段操作符（$set/$unset/$inc/$rename）

| 操作符 | 作用 | 示例 |
| --- | --- | --- |
| \`\$set\` | 设置字段值（不存在则创建） | \`{ \$set: { age: 30 } }\` |
| \`\$unset\` | 删除字段 | \`{ \$unset: { email: "" } }\` |
| \`\$inc\` | 数值增减（可为负） | \`{ \$inc: { views: 1 } }\` |
| \`\$rename\` | 重命名字段 | \`{ \$rename: { old: "new" } }\` |
| \`\$mul\` | 数值乘 | \`{ \$mul: { price: 1.1 } }\` |
| \`\$min\` | 取较小值 | \`{ \$min: { price: 50 } }\` |
| \`\$max\` | 取较大值 | \`{ \$max: { score: 90 } }\` |

\`\`\`javascript
// 设置字段（字段不存在则创建）
db.users.updateOne(
  { name: "张三" },
  { \$set: { "address.city": "上海", lastLogin: new Date() } }
);

// 删除字段
db.users.updateOne(
  { name: "张三" },
  { \$unset: { email: "" } }   // value 随便填，只看 key
);

// 数值自增（性能极高，原子操作）
db.posts.updateOne(
  { _id: 1 },
  { \$inc: { views: 1, likes: -1 } }   // views+1, likes-1
);

// 重命名字段
db.users.updateMany({}, { \$rename: { "oldName": "newName" } });

// 取最小值（只更新比当前值小的）
db.products.updateOne(
  { _id: 1 },
  { \$min: { price: 50 } }   // 如果当前 price > 50 才更新
);
\`\`\`

> **踩坑**：\`\$inc\` 是**原子操作**，并发安全！不要"读出来-改-写回"，会有并发问题。计数控数都用 \`\$inc\`。

## 5.3 数组操作符（$push/$pull/$addToSet/$pop）

数组是文档里最灵活的部分，MongoDB 提供了丰富的数组操作符：

| 操作符 | 作用 |
| --- | --- |
| \`\$push\` | 添加元素（允许重复） |
| \`\$pull\` | 删除匹配元素 |
| \`\$addToSet\` | 添加元素（去重） |
| \`\$pop\` | 删除首/尾元素（\`1\` 尾、\`-1\` 首） |
| \`\$pullAll\` | 删除所有匹配元素 |
| \`\$position\` | 指定插入位置（配合 \`\$push\`） |

\`\`\`javascript
// 文档：{ _id: 1, tags: ["a", "b"] }

// $push：添加元素（允许重复）
db.posts.updateOne(
  { _id: 1 },
  { \$push: { tags: "c" } }
);
// 结果：["a", "b", "c"]

db.posts.updateOne(
  { _id: 1 },
  { \$push: { tags: "a" } }    // 重复也能加
);
// 结果：["a", "b", "c", "a"]

// $addToSet：添加元素（已存在则不加）
db.posts.updateOne(
  { _id: 1 },
  { \$addToSet: { tags: "a" } }
);
// 结果不变（a 已存在）

// $pull：删除匹配元素
db.posts.updateOne(
  { _id: 1 },
  { \$pull: { tags: "a" } }    // 删除所有 a
);

// $pull 删复杂条件
db.posts.updateOne(
  { _id: 1 },
  { \$pull: { comments: { author: "黑名单用户" } } }
);

// $pop：删首/尾
db.posts.updateOne({ _id: 1 }, { \$pop: { tags: 1 } });   // 删尾
db.posts.updateOne({ _id: 1 }, { \$pop: { tags: -1 } });  // 删首

// $push 加多个 + 指定位置
db.posts.updateOne(
  { _id: 1 },
  {
    \$push: {
      tags: {
        \$each: ["x", "y", "z"],     // 加多个
        \$position: 0,                // 插到开头
        \$slice: 5                    // 保留前 5 个
      }
    }
  }
);
\`\`\`

> **踩坑**：\`\$push\` 加 \`\$slice\` 实现定长数组（如最近 10 条评论），但**数组越长性能越差**——超过几百个元素就该拆集合。

## 5.4 replaceOne

\`replaceOne\` 用一个新文档**整体替换**匹配的文档（保留 \`_id\`）。和 \`updateOne\` 的区别：\`updateOne\` 用操作符改字段，\`replaceOne\` 直接换整个文档。

\`\`\`javascript
// 用 updateOne：保留其他字段，只改 age
db.users.updateOne(
  { name: "张三" },
  { \$set: { age: 30 } }
);

// 用 replaceOne：整个文档换成新的（其他字段丢失！）
db.users.replaceOne(
  { name: "张三" },
  { name: "张三", age: 30, city: "北京" }   // 注意没有 $set
);
\`\`\`

> **心法**：\`replaceOne\` 适合"全量同步"场景（如从外部系统同步一条完整数据），\`updateOne\` 适合"局部修改"。

## 5.5 findOneAndUpdate

\`findOneAndUpdate\` 是**原子地"找到-改-返回"**的复合操作，常用于"取号""更新并返回新值"。

\`\`\`javascript
// 找到并更新，返回更新后的文档
const result = db.counters.findOneAndUpdate(
  { name: "order_id" },
  { \$inc: { seq: 1 } },
  { returnNewDocument: true }    // mongosh 中是 returnNewDocument
);

// Node.js 驱动中是 returnDocument
const result = await counters.findOneAndUpdate(
  { name: "order_id" },
  { \$inc: { seq: 1 } },
  { returnDocument: "after" }    // "before" 或 "after"
);
\`\`\`

**经典应用：自增 ID 生成器**

\`\`\`javascript
async function getNextId(name) {
  const result = await counters.findOneAndUpdate(
    { _id: name },
    { \$inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  return result.value.seq;
}

const orderId = await getNextId("order_id");   // 1, 2, 3, ...
\`\`\`

> **优势**：\`findOneAndUpdate\` 是**原子操作**，并发下不会取到相同号。比"读-改-写"安全得多。

## 5.6 upsert 选项

\`upsert\`（update + insert）：找不到匹配就**插入**一条新文档。

\`\`\`javascript
db.users.updateOne(
  { email: "new@example.com" },         // 查询条件
  { \$set: { name: "新用户", age: 20 } }, // 更新内容
  { upsert: true }                       // 找不到就插入
);

// 返回值会多一个 upsertedId 字段
// {
//   acknowledged: true,
//   matchedCount: 0,
//   modifiedCount: 0,
//   upsertedId: ObjectId("...")
// }
\`\`\`

**经典应用：去重写入**

\`\`\`javascript
// 用户访问记录：每个用户每天一条
db.visits.updateOne(
  { userId: 123, date: "2024-01-15" },
  {
    \$set: { lastVisit: new Date() },
    \$inc: { count: 1 }
  },
  { upsert: true }
);
// 第一次访问：插入新文档；后续访问：count 自增
\`\`\`

> **踩坑**：\`upsert\` 时，**查询条件里的等值字段会作为新文档的字段**。如果查询条件里有 \`\$gt\` 这类运算符，会报错——\`upsert\` 不接受运算符作为字段值。

## 5.7 本章小结

本章你掌握了：

- \`updateOne\` 改单条、\`updateMany\` 改多条（默认行为差异要警惕）
- 字段操作符：\`\$set\` \`\$unset\` \`\$inc\`（原子自增）\`\$rename\` \`\$min\` \`\$max\`
- 数组操作符：\`\$push\` \`\$addToSet\` \`\$pull\` \`\$pop\` \`\$each\` \`\$position\` \`\$slice\`
- \`replaceOne\` 整体替换 vs \`updateOne\` 局部修改
- \`findOneAndUpdate\` 原子操作，适合取号、自增场景
- \`upsert\`：找不到就插入，实现"去重写入"

下一章我们学习**删除文档**——把不要的数据清掉。`
  }
];

export { chapters };
