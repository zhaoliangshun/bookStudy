// =============================================================
// 《MongoDB 实战教程》- 章节批次 4
// -------------------------------------------------------------
// 内容：第四部分 数据建模（第 16-20 章）
// =============================================================

const chapters = [
  {
    id: "mongo-ch16",
    group: "第四部分 数据建模",
    icon: "🏗️",
    title: "第 16 章 嵌入 vs 引用",
    content: `# 第 16 章 嵌入 vs 引用

数据建模是 MongoDB 设计的核心。与传统关系型数据库"先建表再写数据"不同，MongoDB 的文档模型允许你**根据访问模式灵活组织数据**。本章解决一个最基础也最关键的问题：**两份数据是放在一起（嵌入），还是分开存（引用）？**

## 16.1 文档建模的核心思想

MongoDB 建模的黄金法则是：

> **数据按照"被访问的方式"组织，而不是按照"实体的现实关系"组织。**

这句话的含义是：如果两份数据**总是一起被读取**，就放进同一个文档；如果它们**经常被独立查询**，就分开存。

设计原则要点：

- **优先嵌入**：MongoDB 的文档模型天生适合嵌入，减少 JOIN/lookup，读取性能更好
- **文档有大小上限**：单文档 16MB，不能无限嵌入
- **避免无限增长的数组**：如评论列表、订单明细，数组成员太多会拖慢文档读写
- **考虑写放大**：嵌入后修改子文档会重写整个文档（部分场景），频繁修改的数据适合引用

## 16.2 嵌入式文档

把关联数据**直接放进父文档**中，作为子对象或数组。

\`\`\`javascript
// 一个博客文章文档，把作者信息和评论都嵌入进来
db.posts.insertOne({
  _id: ObjectId(),
  title: "MongoDB 数据建模指南",
  content: "今天我们聊聊嵌入和引用...",
  author: {
    userId: ObjectId("64a1b2c3d4e5f6a7b8c9d0e1"),
    name: "张三",
    avatar: "https://example.com/avatar.png"
  },
  comments: [
    { user: "李四", content: "写得好！", createdAt: ISODate("2026-07-01T10:00:00Z") },
    { user: "王五", content: "学到了", createdAt: ISODate("2026-07-01T11:30:00Z") }
  ],
  createdAt: ISODate("2026-07-01T09:00:00Z")
});

// 一次查询就能拿到文章 + 作者 + 评论
const post = db.posts.findOne({ _id: ObjectId("...") });
\`\`\`

**优点**：

- 一次查询拿到所有数据，无 \$lookup
- 原子性写入（单文档事务保证）
- 适合"读多写少"的场景

**缺点**：

- 数据冗余：作者信息在多篇文章中重复
- 修改作者信息时要更新所有文章（写放大）
- 数组无限增长会突破 16MB

## 16.3 引用式文档

把关联数据**存到不同集合**，通过 ObjectId 引用。

\`\`\`javascript
// users 集合
db.users.insertOne({
  _id: ObjectId("64a1b2c3d4e5f6a7b8c9d0e1"),
  name: "张三",
  email: "zhangsan@example.com",
  avatar: "https://example.com/avatar.png"
});

// posts 集合，只存作者的 userId
db.posts.insertOne({
  _id: ObjectId(),
  title: "MongoDB 数据建模指南",
  content: "...",
  authorId: ObjectId("64a1b2c3d4e5f6a7b8c9d0e1"),
  createdAt: ISODate("2026-07-01T09:00:00Z")
});

// 查询时用 $lookup 关联
db.posts.aggregate([
  { $match: { title: "MongoDB 数据建模指南" } },
  {
    $lookup: {
      from: "users",
      localField: "authorId",
      foreignField: "_id",
      as: "author"
    }
  },
  { $unwind: "$author" }
]);
\`\`\`

**优点**：

- 数据无冗余，作者信息只存一份
- 修改作者信息只需更新一处
- 适合数据量大、关联复杂场景

**缺点**：

- 多次查询或 \$lookup，性能较差
- 跨文档操作无法保证原子性（需要事务）

## 16.4 一对一关系建模

**场景**：用户与用户详情（头像、地址、身份证号等敏感信息）。

**方案一：嵌入**（信息小、一起访问）

\`\`\`javascript
db.users.insertOne({
  _id: ObjectId(),
  username: "zhangsan",
  profile: {
    realName: "张三",
    idCard: "110101199001011234",
    address: "北京市朝阳区"
  }
});
\`\`\`

**方案二：引用**（信息大、独立访问、敏感数据分离）

\`\`\`javascript
// 用户主表
db.users.insertOne({ _id: ObjectId(), username: "zhangsan" });

// 用户详情表，一对一引用
db.userProfiles.insertOne({
  _id: ObjectId(),
  userId: ObjectId("..."),  // 指向 users
  realName: "张三",
  idCard: "110101199001011234"
});
\`\`\`

## 16.5 一对多关系建模

**场景**：用户与订单。一个用户有多个订单，但订单数量不会爆炸增长。

**方案一：嵌入订单**（订单少，<100 条）

\`\`\`javascript
db.users.insertOne({
  _id: ObjectId(),
  name: "张三",
  orders: [
    { orderId: "ORD001", amount: 99.5, createdAt: ISODate() },
    { orderId: "ORD002", amount: 200, createdAt: ISODate() }
  ]
});
\`\`\`

**方案二：子文档引用**（订单中等数量，<1000 条）

\`\`\`javascript
// users 表存订单 ID 数组
db.users.insertOne({
  _id: ObjectId(),
  name: "张三",
  orderIds: [ObjectId(), ObjectId()]
});

// orders 表存订单详情
db.orders.insertOne({
  _id: ObjectId(),
  userId: ObjectId("..."),
  amount: 99.5
});
\`\`\`

**方案三：父文档引用**（订单数量巨大）

\`\`\`javascript
// users 表不存订单引用
db.users.insertOne({ _id: ObjectId(), name: "张三" });

// orders 表存 userId，反向查询
db.orders.insertOne({
  _id: ObjectId(),
  userId: ObjectId("..."),  // 父引用
  amount: 99.5
});

// 查询某个用户的所有订单
db.orders.find({ userId: ObjectId("...") });
\`\`\`

> 当子文档数量级在千以上时，**不要把 ID 数组存在父文档**，会导致父文档膨胀，应该用父引用。

## 16.6 多对多关系建模

**场景**：学生与课程。一个学生选多门课，一门课有多个学生。

**方案一：双向引用**（数据量小）

\`\`\`javascript
// 学生
db.students.insertOne({
  _id: ObjectId(),
  name: "张三",
  courseIds: [ObjectId(), ObjectId(), ObjectId()]
});

// 课程
db.courses.insertOne({
  _id: ObjectId(),
  name: "MongoDB 实战",
  studentIds: [ObjectId(), ObjectId()]
});
\`\`\`

**方案二：中间表**（数据量大，需要存额外属性）

\`\`\`javascript
// 学生
db.students.insertOne({ _id: ObjectId(), name: "张三" });

// 课程
db.courses.insertOne({ _id: ObjectId(), name: "MongoDB 实战" });

// 选课记录（中间表）
db.enrollments.insertOne({
  _id: ObjectId(),
  studentId: ObjectId("..."),
  courseId: ObjectId("..."),
  enrolledAt: ISODate(),
  score: 95
});
\`\`\`

中间表的好处是可以在选课关系上挂额外属性（成绩、选课时间等），并且不会让父文档的数组无限增长。

## 16.7 选择嵌入还是引用

决策表：

| 维度 | 倾向嵌入 | 倾向引用 |
| --- | --- | --- |
| 子文档数量 | < 几百 | > 几千 |
| 读取模式 | 总是一起读 | 经常独立读 |
| 写入模式 | 一起修改 | 各自独立修改 |
| 数据冗余 | 可接受 | 不可接受 |
| 一致性要求 | 强一致（单文档） | 可接受最终一致 |
| 子文档大小 | 小 | 大 |

**经验法则**：

1. 默认优先嵌入，除非有明确理由引用
2. 数组数量超过 1000 就改用引用
3. 频繁更新的字段适合引用，避免写放大
4. 需要事务保证多文档一致时考虑引用 + 事务

> **踩坑提示**：
> - 不要把"无上限增长"的数组嵌入文档（如评论、日志），会突破 16MB
> - 修改嵌入子文档时，MongoDB 会重写整个文档（WiredTiger 行级存储），大文档性能差
> - \$lookup 在分片集合上有限制，跨分片 JOIN 性能差

## 16.8 本章小结

- MongoDB 数据建模核心是按"访问方式"而非"现实关系"组织
- **嵌入**适合小数据、一起读、强一致；**引用**适合大数据、独立读、低冗余
- 一对一：根据数据量决定；一对多：根据子文档数量选择嵌入/子引用/父引用
- 多对多：小数据用双向引用，大数据用中间表
- 单文档 16MB 上限是嵌入的硬约束，无限增长数组必须引用`
  },

  {
    id: "mongo-ch17",
    group: "第四部分 数据建模",
    icon: "📐",
    title: "第 17 章 模式设计模式",
    content: `# 第 17 章 模式设计模式

MongoDB 没有强 schema，但**好建模不等于乱建模**。经过大量项目实践，社区总结了一组通用模式，本章介绍 7 个最常用的设计模式，覆盖 90% 的业务建模场景。

## 17.1 文档模式（Document Pattern）

**核心思想**：把关系型数据库中需要 JOIN 的多张表合并为一个文档。这是 MongoDB 最自然的模式。

**场景**：电商订单。关系型里需要 orders + order_items + products 三张表 JOIN。

\`\`\`javascript
// 一个订单文档包含完整信息
db.orders.insertOne({
  _id: ObjectId(),
  orderNo: "ORD20260701001",
  userId: ObjectId("..."),
  status: "paid",
  items: [
    {
      productId: ObjectId("..."),
      name: "MongoDB 实战书",
      price: 99,
      quantity: 1,
      snapshot: { cover: "https://...", isbn: "978-7-xxx" }
    },
    {
      productId: ObjectId("..."),
      name: "机械键盘",
      price: 599,
      quantity: 1
    }
  ],
  totalAmount: 698,
  createdAt: ISODate(),
  paidAt: ISODate()
});
\`\`\`

**优点**：一次查询拿到完整订单，避免 JOIN。

## 17.2 属性模式（Attribute Pattern）

**核心思想**：用数组存放"可变属性"，每项包含 name + value，避免字段爆炸。

**场景**：商品属性。电影有导演、演员；书有作者、ISBN；手机有 CPU、内存。不同类型属性差异巨大。

**传统方式（差）**：

\`\`\`javascript
// 字段不固定，索引爆炸
db.products.insertOne({ name: "手机", cpu: "骁龙8", ram: "12GB" });
db.products.insertOne({ name: "书", author: "张三", isbn: "xxx" });
\`\`\`

**属性模式（好）**：

\`\`\`javascript
db.products.insertOne({
  _id: ObjectId(),
  name: "手机",
  type: "phone",
  attributes: [
    { name: "cpu", value: "骁龙8" },
    { name: "ram", value: "12GB" },
    { name: "screen", value: "6.5寸" }
  ]
});

// 用一个索引覆盖所有属性查询
db.products.createIndex({ "attributes.name": 1, "attributes.value": 1 });

// 查询 RAM 为 12GB 的手机
db.products.find({
  attributes: {
    $elemMatch: { name: "ram", value: "12GB" }
  }
});
\`\`\`

**优点**：避免 schema 频繁变更，单一索引覆盖所有属性查询。

## 17.3 桶模式（Bucket Pattern）

**核心思想**：把时序数据按时间桶聚合存放，一个文档代表一段时间的数据。

**场景**：IoT 传感器数据，每秒一条。如果一条一文档，一天 86400 条，查询和存储都吃力。

**传统方式（差）**：

\`\`\`javascript
// 每条数据一个文档，文档数量爆炸
db.readings.insertOne({ sensorId: "S001", ts: ISODate(), value: 23.5 });
db.readings.insertOne({ sensorId: "S001", ts: ISODate(), value: 23.6 });
\`\`\`

**桶模式（好）**：

\`\`\`javascript
// 一小时一个桶，存放该小时所有读数
db.readings.insertOne({
  _id: ObjectId(),
  sensorId: "S001",
  hourBucket: ISODate("2026-07-01T10:00:00Z"),
  count: 3600,
  values: [
    { ts: ISODate("2026-07-01T10:00:00Z"), v: 23.5 },
    { ts: ISODate("2026-07-01T10:00:01Z"), v: 23.6 }
    // ... 一小时 3600 条
  ],
  min: 23.0,
  max: 24.5,
  avg: 23.7
});

db.readings.createIndex({ sensorId: 1, hourBucket: 1 });
\`\`\`

**优点**：文档数量减少 3600 倍，索引更小，预聚合 min/max/avg 加速聚合查询。

## 17.4 多态模式（Polymorphic Pattern）

**核心思想**：同一个集合存放不同类型的文档，用 type 字段区分。

**场景**：内容管理系统（CMS），文章、视频、图片都进 contents 集合。

\`\`\`javascript
db.contents.insertMany([
  {
    _id: ObjectId(),
    type: "article",
    title: "MongoDB 入门",
    body: "正文...",
    author: "张三"
  },
  {
    _id: ObjectId(),
    type: "video",
    title: "MongoDB 视频",
    videoUrl: "https://...",
    duration: 1200
  },
  {
    _id: ObjectId(),
    type: "image",
    title: "架构图",
    imageUrl: "https://...",
    width: 1920,
    height: 1080
  }
]);

// 按类型查询
db.contents.find({ type: "video" });
\`\`\`

**适用条件**：不同类型有共同查询模式（如按 title 搜索），且字段差异较大。

## 17.5 计算模式（Computed Pattern）

**核心思想**：把频繁计算的聚合结果预先存起来，避免每次实时算。

**场景**：博客文章的评论数。每次显示都要 count，性能差。

\`\`\`javascript
// 不好的方式：每次查询都 count
db.comments.find({ postId: ObjectId("...") }).count();

// 计算模式：在文章文档中维护 commentCount
db.posts.updateOne(
  { _id: ObjectId("...") },
  { $inc: { commentCount: 1 } }
);

// 读取时直接拿
db.posts.findOne({ _id: ObjectId("...") }, { commentCount: 1 });
\`\`\`

**进阶**：用 Change Streams 自动维护计数器，详见第 20 章。

> **踩坑提示**：计算模式要小心并发，用 \$inc 保证原子性；如果计算逻辑复杂，考虑用触发器或 Change Streams。

## 17.6 子集模式（Subset Pattern）

**核心思想**：把大量数据分成"热门子集"嵌入文档，"冷数据"单独存。

**场景**：电影有 10000 条评论，但用户通常只看前 10 条最新评论。

\`\`\`javascript
// 电影文档嵌入前 10 条评论
db.movies.insertOne({
  _id: ObjectId(),
  title: "盗梦空间",
  topComments: [
    { user: "张三", content: "神作", rating: 5, createdAt: ISODate() },
    // ... 前 10 条最新评论
  ]
});

// 所有评论单独存
db.comments.insertOne({
  _id: ObjectId(),
  movieId: ObjectId("..."),
  user: "李四",
  content: "也不错",
  rating: 4
});
\`\`\`

**优点**：热数据查询快，冷数据不污染主文档。

## 17.7 近似值模式（Approximation Pattern）

**核心思想**：高并发计数器（如浏览量）不每次都写，按概率写，减少写压力。

**场景**：文章浏览量统计。每访问一次就更新太频繁，影响性能。

\`\`\`javascript
// Node.js 实现：每 10 次访问才更新一次数据库
async function incrementViewCount(postId) {
  // 用 random 决定是否写库
  if (Math.random() < 0.1) {
    // 只在 10% 的情况下写库，每次 +10
    await db.posts.updateOne(
      { _id: postId },
      { $inc: { viewCount: 10 } }
    );
  }
}

// 或者用计数器累积到阈值再写
const counter = getCounter();  // 来自内存
if (counter >= 10) {
  await db.posts.updateOne({ _id: postId }, { $inc: { viewCount: counter } });
  resetCounter();
}
\`\`\`

**优点**：写压力降低 10 倍，浏览量精度损失可接受。

## 17.8 本章小结

| 模式 | 适用场景 | 关键收益 |
| --- | --- | --- |
| 文档模式 | 一起读的关联数据 | 避免 JOIN |
| 属性模式 | 可变属性 | 单一索引覆盖 |
| 桶模式 | 时序数据 | 文档数量减少，预聚合 |
| 多态模式 | 同类不同结构 | 统一查询 |
| 计算模式 | 频繁聚合 | 避免实时计算 |
| 子集模式 | 热冷数据分离 | 热查询快 |
| 近似值模式 | 高并发计数 | 降低写压力 |

> **踩坑提示**：模式不是"非此即彼"，可以组合使用。例如桶模式 + 计算模式（桶里存预聚合值）是 IoT 的经典组合。`
  },

  {
    id: "mongo-ch18",
    group: "第四部分 数据建模",
    icon: "💰",
    title: "第 18 章 事务与一致性",
    content: `# 第 18 章 事务与一致性

事务是数据库保证数据一致性的核心机制。MongoDB 早期版本只支持单文档事务，4.0 引入多文档事务（副本集），4.2 扩展到分片集群。本章系统讲解 MongoDB 事务的方方面面。

## 18.1 单文档事务

**核心事实**：MongoDB 单文档操作永远是原子的。

\`\`\`javascript
// 这条 update 涉及多个字段，但要么全成功要么全失败
db.accounts.updateOne(
  { _id: ObjectId("...") },
  {
    $inc: { balance: -100 },
    $push: { transactions: { type: "withdraw", amount: 100, ts: ISODate() } }
  }
);
\`\`\`

**关键启示**：好的数据建模能让大部分业务用单文档操作完成，不需要多文档事务。这就是为什么"嵌入"优先于"引用"——单文档原子性是免费的。

## 18.2 多文档事务（MongoDB 4.0+）

**场景**：银行转账。A 给 B 转 100 元，必须保证 A 减 100 和 B 加 100 同时成功或同时失败。

\`\`\`javascript
// mongo shell 语法
const session = db.getMongo().startSession();
session.startTransaction({
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" }
});

try {
  const accounts = session.getDatabase("bank").accounts;

  // A 减 100
  accounts.updateOne(
    { _id: ObjectId("...A"), balance: { $gte: 100 } },
    { $inc: { balance: -100 } }
  );

  // B 加 100
  accounts.updateOne(
    { _id: ObjectId("...B") },
    { $inc: { balance: 100 } }
  );

  session.commitTransaction();
  print("转账成功");
} catch (e) {
  session.abortTransaction();
  print("转账失败：" + e.message);
} finally {
  session.endSession();
}
\`\`\`

**Node.js 驱动写法**：

\`\`\`javascript
const MongoClient = require("mongodb").MongoClient;
const client = await MongoClient.connect("mongodb://localhost:27017");

const session = client.startSession();
try {
  session.startTransaction({
    readConcern: { level: "snapshot" },
    writeConcern: { w: "majority" }
  });

  const accounts = client.db("bank").collection("accounts");

  await accounts.updateOne(
    { _id: aliceId, balance: { $gte: 100 } },
    { $inc: { balance: -100 } },
    { session }
  );

  await accounts.updateOne(
    { _id: bobId },
    { $inc: { balance: 100 } },
    { session }
  );

  await session.commitTransaction();
  console.log("转账成功");
} catch (err) {
  await session.abortTransaction();
  console.error("失败：", err);
} finally {
  await session.endSession();
}
\`\`\`

**注意**：所有操作都要传 \`{ session }\`，否则不会在事务内执行。

## 18.3 事务的隔离级别

MongoDB 事务默认隔离级别是 **snapshot（快照隔离）**：

| 隔离级别 | 含义 |
| --- | --- |
| snapshot | 事务读到的是事务开始时的快照，不受其他事务影响 |
| read-uncommitted（默认非事务读） | 可能读到未提交数据（针对副本集 secondary） |

**快照隔离解决的问题**：

- **脏读**：不会读到其他事务未提交的数据
- **不可重复读**：同一事务内多次读结果一致
- **幻读**：范围内查询结果稳定

**快照隔离不能解决的**：

- **写偏斜（Write Skew）**：两个事务基于同一快照做不同决策，提交后违反约束

## 18.4 事务的限制

| 限制项 | 值 |
| --- | --- |
| 单事务最大时长 | 60 秒（默认） |
| 单事务最大操作数 | 无硬限制，但应避免过多 |
| 单事务最大锁文档数 | 受 WiredTiger 影响 |
| 分片事务 | 4.2+ 支持，性能开销大 |
| 是否支持 unique 索引创建 | 不支持在事务中创建集合和索引 |

> **踩坑提示**：
> - 事务超时（默认 60s）会自动 abort，长事务要拆分
> - 分片事务性能差，避免在高 QPS 场景大量使用
> - 事务中不能创建集合、不能创建索引，要先准备好
> - 大量修改同一文档可能触发 WiredTiger 重试，影响吞吐

## 18.5 读写关注（readConcern / writeConcern）

### writeConcern（写关注）

控制写入到几个节点才返回成功。

\`\`\`javascript
// 写入 majority 节点后才返回成功
db.products.insertOne(
  { name: "商品A", price: 100 },
  { writeConcern: { w: "majority", j: true, wtimeout: 5000 } }
);
\`\`\`

| 参数 | 含义 |
| --- | --- |
| w | "majority" / "1" / 数字 / 自定义标签 |
| j | true 表示等 journal 落盘 |
| wtimeout | 等待超时（毫秒），超时后返回错误（但写入仍可能成功） |

**级别权衡**：

- \`w: 1\`（默认）：写入 primary 即返回，性能高、可靠性低
- \`w: "majority"\`：写入多数节点才返回，性能低、可靠性高
- \`j: true\`：保证 journal 落盘，掉电不丢

### readConcern（读关注）

控制读到数据的"新鲜度"。

\`\`\`javascript
db.products.find({}).readConcern("majority");
\`\`\`

| 级别 | 含义 |
| --- | --- |
| local（默认） | 读最新数据，可能读到未提交到 majority 的数据 |
| majority | 读已提交到多数节点的数据 |
| linearizable | 强一致读，最强但最慢 |
| snapshot | 事务中使用，读事务开始时的快照 |

### readPreference（读偏好）

控制从哪个节点读。

\`\`\`javascript
// Node.js 驱动
const client = await MongoClient.connect(
  "mongodb://host1:27017,host2:27017,host3:27017/?replicaSet=rs0",
  { readPreference: "secondary" }
);
\`\`\`

| 模式 | 含义 |
| --- | --- |
| primary（默认） | 只从主节点读 |
| primaryPreferred | 优先主，主不可用读从 |
| secondary | 只从从节点读 |
| secondaryPreferred | 优先从，从不可用读主 |
| nearest | 最低延迟节点 |

**组合示例**：报表系统读偏好 secondary + 读关注 majority，不抢主节点资源，又能保证读到一致数据。

\`\`\`javascript
db.orders.find({ status: "paid" }).readPref("secondary").readConcern("majority");
\`\`\`

## 18.6 本章小结

- MongoDB **单文档操作天然原子**，能用单文档完成的就不用事务
- 4.0+ 支持**多文档事务**，需要传 session 参数
- 事务隔离级别是 **snapshot**，避免脏读和不可重复读
- 事务有 60 秒超时，长事务要拆分；分片事务性能开销大
- **writeConcern** 控制写入可靠性，**readConcern** 控制读取新鲜度，**readPreference** 控制读哪个节点
- 生产环境关键业务建议 \`w: "majority", j: true\`，报表建议 secondary + majority

> **踩坑提示**：事务不是银弹，过度使用会让性能急剧下降。优先靠数据建模（嵌入）避免事务，只在不可避免时使用。`
  },

  {
    id: "mongo-ch19",
    group: "第四部分 数据建模",
    icon: "📏",
    title: "第 19 章 校验与约束",
    content: `# 第 19 章 校验与约束

MongoDB 默认是"无 schema"的——你可以往同一集合塞任意结构的文档。但生产环境通常需要约束字段类型、必填字段等。3.6+ 引入 **JSON Schema 校验**，让你在数据库层面强制 schema。

## 19.1 JSON Schema 校验

通过 \`collMod\` 命令给集合添加 validator。

**示例**：users 集合，要求 username 必填且为字符串，age 在 0-150 之间。

\`\`\`javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "age"],
      properties: {
        username: {
          bsonType: "string",
          description: "用户名必须是字符串"
        },
        age: {
          bsonType: "int",
          minimum: 0,
          maximum: 150,
          description: "年龄必须是 0-150 的整数"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$",
          description: "邮箱格式必须正确"
        },
        status: {
          enum: ["active", "inactive", "banned"],
          description: "状态必须是这三个值之一"
        }
      }
    }
  }
});

// 写入合法数据 → 成功
db.users.insertOne({
  username: "zhangsan",
  age: 28,
  email: "zhangsan@example.com",
  status: "active"
});

// 写入非法数据 → 报错
db.users.insertOne({
  username: "lisi",
  age: 200,  // 超出最大值
  status: "unknown"  // 不在枚举中
});
// 报错：Document failed validation
\`\`\`

## 19.2 validator 配置

### bsonType 支持的类型

| bsonType | 说明 |
| --- | --- |
| object | 文档 |
| array | 数组 |
| string | 字符串 |
| int / long / double | 数值 |
| bool | 布尔 |
| date | 日期 |
| objectId | ObjectId |
| null | null |
| binData | 二进制 |

### 嵌套对象校验

\`\`\`javascript
db.createCollection("orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "items"],
      properties: {
        userId: { bsonType: "objectId" },
        items: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["productId", "quantity"],
            properties: {
              productId: { bsonType: "objectId" },
              quantity: { bsonType: "int", minimum: 1 },
              price: { bsonType: "double", minimum: 0 }
            }
          }
        }
      }
    }
  }
});
\`\`\`

### 查询已有 validator

\`\`\`javascript
db.getCollectionInfos({ name: "users" });
\`\`\`

## 19.3 校验级别与动作

校验有两个维度：**级别**（什么时候校验）和**动作**（不合法怎么办）。

### 校验级别 validationLevel

| 级别 | 含义 |
| --- | --- |
| strict（默认） | 所有插入和修改都校验 |
| moderate | 仅校验"满足已有 validator 的文档"，已有不合规文档不校验 |
| off | 关闭校验 |

### 校验动作 validationAction

| 动作 | 含义 |
| --- | --- |
| error（默认） | 拒绝写入 |
| warn | 允许写入，但记日志 |

**示例**：警告模式，老数据可继续写入。

\`\`\`javascript
db.runCommand({
  collMod: "users",
  validator: { $jsonSchema: { /* ... */ } },
  validationLevel: "moderate",
  validationAction: "warn"
});
\`\`\`

> **踩坑提示**：\`warn\` 模式下日志会快速增长，生产环境慎用，建议先用 warn 收集不合规数据，修复后再切回 error。

## 19.4 修改校验规则

修改 validator 时，要小心已有数据是否还合规。

### 添加新规则

\`\`\`javascript
// 在已有 validator 上添加 phone 字段校验
db.runCommand({
  collMod: "users",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "age", "phone"],  // 新增 phone 必填
      properties: {
        username: { bsonType: "string" },
        age: { bsonType: "int", minimum: 0, maximum: 150 },
        phone: {
          bsonType: "string",
          pattern: "^1[3-9]\\\\d{9}$",
          description: "中国大陆手机号"
        }
      }
    }
  }
});
\`\`\`

如果已有数据没 phone 字段，这条命令会**报错**。解决办法：

1. 先给所有文档补 phone 字段
2. 临时把 validationLevel 设为 moderate，老数据不校验

\`\`\`javascript
db.users.updateMany(
  { phone: { $exists: false } },
  { $set: { phone: "13800000000" } }
);
\`\`\`

### 移除 validator

\`\`\`javascript
db.runCommand({
  collMod: "users",
  validator: {},
  validationLevel: "off"
});
\`\`\`

## 19.5 本章小结

- MongoDB 3.6+ 支持 **JSON Schema 校验**，通过 collMod 配置 validator
- 校验级别：strict（全校验）/ moderate（仅校验合规文档）/ off
- 校验动作：error（拒绝）/ warn（警告）
- 修改 validator 要先确保已有数据合规，否则命令会失败
- 校验只是数据库层一道防线，**应用层校验仍是必要的**，数据库校验是兜底

> **踩坑提示**：
> - validator 不支持 \$jsonSchema 之外的查询操作符（如 \$where），但可以混用部分查询操作符
> - 校验会带来轻微性能开销，对写入密集场景要评估
> - Mongoose 等应用层 ODM 与 DB 层校验可以组合使用，但避免双重定义导致维护混乱`
  },

  {
    id: "mongo-ch20",
    group: "第四部分 数据建模",
    icon: "🔄",
    title: "第 20 章 变更流与触发器",
    content: `# 第 20 章 变更流与触发器

变更流（Change Streams）是 MongoDB 3.6 引入的特性，让你**实时监听集合、数据库或集群的数据变更**。它是构建事件驱动架构、数据同步、审计日志的利器。

## 20.1 Change Streams 简介

**核心机制**：基于 oplog，把数据库的写操作转化为可订阅的事件流。

**与触发器的区别**：

| 维度 | SQL 触发器 | MongoDB Change Streams |
| --- | --- | --- |
| 执行位置 | 数据库进程内 | 应用程序内 |
| 执行语言 | SQL/PL-SQL | 任意语言（Node.js/Python） |
| 阻塞写入 | 是 | 否（异步消费） |
| 失败处理 | 回滚事务 | 事件保留，可重试 |
| 适用场景 | 数据库内逻辑 | 跨服务、跨系统同步 |

**优势**：

- **非阻塞**：不影响写入性能
- **可扩展**：消费者独立部署，可水平扩展
- **跨语言**：用任何驱动消费
- **断点续传**：通过 resumeToken 恢复

**限制**：

- 仅副本集和分片集群支持，单机模式不支持
- 事件有保留时间（oplog 大小决定）

## 20.2 watch 监听变更

### 监听集合变更

\`\`\`javascript
// mongo shell
const changeStream = db.products.watch();

while (changeStream.hasNext()) {
  const change = changeStream.next();
  printjson(change);
}
\`\`\`

### Node.js 驱动示例

\`\`\`javascript
const MongoClient = require("mongodb").MongoClient;

async function watchProducts() {
  const client = await MongoClient.connect(
    "mongodb://localhost:27017/?replicaSet=rs0"
  );
  const collection = client.db("shop").collection("products");

  const changeStream = collection.watch();

  changeStream.on("change", (change) => {
    console.log("变更事件：", change.operationType);

    switch (change.operationType) {
      case "insert":
        console.log("新文档：", change.fullDocument);
        break;
      case "update":
        console.log("修改字段：", change.updateDescription.updatedFields);
        console.log("删除字段：", change.updateDescription.removedFields);
        break;
      case "delete":
        console.log("删除文档 ID：", change.documentKey._id);
        break;
      case "replace":
        console.log("替换后文档：", change.fullDocument);
        break;
    }
  });

  changeStream.on("error", (err) => {
    console.error("监听错误：", err);
  });
}

watchProducts();
\`\`\`

### 过滤事件

\`\`\`javascript
// 只监听 insert 事件，且 price > 100 的商品
const changeStream = collection.watch([
  {
    $match: {
      operationType: "insert",
      "fullDocument.price": { $gt: 100 }
    }
  }
]);
\`\`\`

### 监听全库 / 全集群

\`\`\`javascript
// 监听整个数据库
db.watch();

// 监听整个集群（Node.js）
client.watch();
\`\`\`

## 20.3 resumeToken

每个变更事件都带 \`_id\`（即 resumeToken），用于断点续传。

\`\`\`javascript
let resumeToken = null;

const changeStream = collection.watch([], { resumeAfter: null });

changeStream.on("change", (change) => {
  // 保存 token 到持久化存储（Redis / 文件）
  resumeToken = change._id;
  saveTokenToRedis(resumeToken);

  // 处理事件
  processChange(change);
});

// 程序重启后从上次 token 继续
const savedToken = loadTokenFromRedis();
const newStream = collection.watch([], { resumeAfter: savedToken });
\`\`\`

**resumeAfter vs startAfter**：

- \`resumeAfter\`：从指定 token 之后开始，token 必须有效（oplog 还在）
- \`startAfter\`：4.2+ 支持，token 失效也能继续（适合故障恢复）
- \`startAtOperationTime\`：从指定时间戳开始

\`\`\`javascript
// 从指定时间开始
const timestamp = Timestamp(0, Math.floor(Date.now() / 1000));
collection.watch([], { startAtOperationTime: timestamp });
\`\`\`

## 20.4 应用场景

### 场景一：同步到 Elasticsearch

MongoDB 作为主库，ES 作为搜索库。

\`\`\`javascript
const { MongoClient } = require("mongodb");
const { Client: ESClient } = require("@elastic/elasticsearch");

async function syncMongoToES() {
  const mongo = await MongoClient.connect("mongodb://localhost:27017/?replicaSet=rs0");
  const es = new ESClient({ node: "http://localhost:9200" });

  const products = mongo.db("shop").collection("products");

  const stream = products.watch([], { resumeAfter: await loadToken() });

  stream.on("change", async (change) => {
    if (change.operationType === "insert" || change.operationType === "replace") {
      await es.index({
        index: "products",
        id: change.fullDocument._id.toString(),
        document: change.fullDocument
      });
    } else if (change.operationType === "update") {
      await es.update({
        index: "products",
        id: change.documentKey._id.toString(),
        doc: change.updateDescription.updatedFields
      });
    } else if (change.operationType === "delete") {
      await es.delete({
        index: "products",
        id: change.documentKey._id.toString()
      });
    }

    await saveToken(change._id);  // 保存 resumeToken
  });
}
\`\`\`

### 场景二：审计日志

监听敏感集合的所有变更，写入审计表。

\`\`\`javascript
const stream = db.users.watch();

stream.on("change", async (change) => {
  await db.audit_logs.insertOne({
    collection: "users",
    operation: change.operationType,
    documentId: change.documentKey?._id,
    before: change.fullDocumentBeforeChange,  // 6.0+ 需开启变更前镜像
    after: change.fullDocument,
    timestamp: ISODate(),
    operator: getCurrentUser()
  });
});
\`\`\`

> **6.0+ 新特性**：通过 \`showExpandedEvents\` 和变更前镜像配置可以拿到修改前的文档。

\`\`\`javascript
db.runCommand({
  collMod: "users",
  changeStreamPreAndPostImages: { enabled: true }
});

const stream = collection.watch([], {
  fullDocumentBeforeChange: "required",
  showExpandedEvents: true
});
\`\`\`

### 场景三：触发业务逻辑

下单后自动发短信、扣库存。

\`\`\`javascript
const stream = db.orders.watch([
  { $match: { operationType: "insert" } }
]);

stream.on("change", async (change) => {
  const order = change.fullDocument;

  // 扣库存
  for (const item of order.items) {
    await db.products.updateOne(
      { _id: item.productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );
  }

  // 发短信
  await sendSMS(order.userId, "下单成功");
});
\`\`\`

## 20.5 本章小结

- Change Streams 基于 oplog，**实时监听数据变更**
- 监听对象：集合 / 数据库 / 集群，可过滤事件类型
- **resumeToken 实现断点续传**，程序重启不丢事件
- 典型场景：数据同步（ES/Redis）、审计日志、事件驱动业务
- 6.0+ 支持 fullDocumentBeforeChange，可拿到修改前的文档

> **踩坑提示**：
> - Change Streams 必须部署在副本集或分片集群上，**单机模式不支持**
> - oplog 有保留时间（默认几小时到几天），消费者长时间宕机可能丢事件，要靠全量同步补救
> - 消费速度跟不上写入速度时，事件会堆积，最终被 oplog 淘汰
> - 高频变更场景下，事件处理要异步化、批量处理，避免阻塞 watch
> - 不要在事件处理函数里同步调用慢接口（如发邮件），应该丢队列异步处理`
  }
];

export { chapters };
