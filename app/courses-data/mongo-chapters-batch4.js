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

### 访问模式分析

在动手建模之前，先回答以下问题：

| 问题 | 答案影响 |
| --- | --- |
| 数据是一起读还是分开读？ | 一起读 → 嵌入；分开读 → 引用 |
| 子数据的数量级？ | 几十条 → 嵌入；上万条 → 引用 |
| 子数据是否频繁更新？ | 频繁更新 → 引用；几乎不变 → 嵌入 |
| 是否需要独立查询子数据？ | 需要 → 引用；不需要 → 嵌入 |
| 子数据是否非常大？ | 大 → 引用；小 → 嵌入 |
| 关系是否多对多？ | 多对多 → 引用或中间表 |

> **核心提示**：MongoDB 没有外键约束，"引用"只是存了一个 ObjectId，由应用层维护关系完整性。这是 MongoDB 与关系型数据库建模思维的最大差异。

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

### 适合嵌入的场景（1-to-few，读多写少）

- 一篇文章的标签（数量有限，几乎不变）
- 一个用户的最近 10 条登录记录
- 一个商品的封面图列表
- 一篇博客文章的评论（前提是评论数量有上限）

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

// 查询时用 \$lookup 关联
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

### 适合引用的场景（1-to-many，many-to-many，大数据）

- 用户与订单（订单可能成千上万）
- 文章与评论（评论数量爆炸增长）
- 学生与课程（多对多）
- 商品与库存日志（日志数据量极大）

## 16.4 \$lookup 详解

\$lookup 是 MongoDB 3.2+ 提供的左外连接操作，类似 SQL 的 LEFT JOIN。

### 基本语法

\`\`\`javascript
{
  $lookup: {
    from: "目标集合",
    localField: "本地字段",
    foreignField: "目标字段",
    as: "输出数组字段"
  }
}
\`\`\`

### 单字段关联

\`\`\`javascript
// 订单关联用户
db.orders.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
    }
  },
  // \$lookup 结果是数组，单条用 \$unwind 展开
  { $unwind: "$user" }
]);
\`\`\`

### 3.6+ 增强语法（支持多字段、子查询）

\`\`\`javascript
// 查询订单，并关联用户，且只取 vip 用户的订单
db.orders.aggregate([
  {
    $lookup: {
      from: "users",
      let: { uid: "$userId" },  // 把本地字段赋值给变量
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$uid"] },  // 引用变量
            level: "vip"
          }
        },
        { $project: { name: 1, level: 1 } }  // 只取需要的字段
      ],
      as: "user"
    }
  }
]);
\`\`\`

### \$lookup 的性能注意

| 维度 | 说明 |
| --- | --- |
| 索引 | foreignField 上必须有索引，否则全表扫描 |
| 分片集合 | 3.6+ 不支持 \$lookup 关联分片集合（5.1+ 部分支持） |
| 数据量 | 关联结果如果是大数组，会拖慢查询 |
| 嵌套层数 | 多层 \$lookup 性能急剧下降，建议不超过 2 层 |

> **踩坑提示**：\$lookup 永远是左外连接，右表没匹配也会保留左表文档（as 字段为空数组）。如果需要内连接，要配合 \$match 过滤空数组。

## 16.5 一对一关系建模

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

**选择依据**：详情字段少且总是和主表一起查 → 嵌入；详情字段多或需要独立查询（如风控系统单独查身份证）→ 引用。

## 16.6 一对多关系建模

**场景**：用户与订单。一个用户有多个订单，但订单数量不会爆炸增长。

### 方案一：嵌入订单（1-to-few，订单少 < 100 条）

\`\`\`javascript
db.users.insertOne({
  _id: ObjectId(),
  name: "张三",
  orders: [
    { orderId: "ORD001", amount: 99.5, createdAt: ISODate() },
    { orderId: "ORD002", amount: 200, createdAt: ISODate() }
  ]
});

// 查询用户的订单：一次查询搞定
db.users.findOne({ _id: ObjectId("...") }, { orders: 1 });
\`\`\`

适合：每用户订单数稳定在几十条以内，且订单信息不会频繁单独查询。

### 方案二：子文档引用（1-to-many，订单中等数量 < 1000 条）

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

// 查询用户的所有订单
db.orders.find({ _id: { $in: user.orderIds } });
\`\`\`

适合：子文档数量中等，需要独立查询单个订单，但"查某用户所有订单"也是高频操作。

### 方案三：父文档引用（1-to-many，订单数量巨大 > 1000 条）

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

> 当子文档数量级在千以上时，**不要把 ID 数组存在父文档**，会导致父文档膨胀（fan-out 问题），应该用父引用。

### 方案对比

| 方案 | 子文档数量 | 查询某父的所有子 | 查询单个子文档 | 父文档大小 |
| --- | --- | --- | --- | --- |
| 嵌入 | < 100 | 一次查询 | 需要在数组中查找 | 大 |
| 子引用 | < 1000 | 两次查询（先父后子） | 直接查子集合 | 中 |
| 父引用 | > 1000 | 查子集合（带 userId 索引） | 直接查子集合 | 小 |

## 16.7 多对多关系建模

**场景**：学生与课程。一个学生选多门课，一门课有多个学生。

### 方案一：双向引用（数据量小）

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

优点：双向查询都快。缺点：维护两边一致性需要事务或应用层逻辑。

### 方案二：中间表（数据量大，需要存额外属性）

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

// 查询某学生选了哪些课
db.enrollments.aggregate([
  { $match: { studentId: ObjectId("...") } },
  { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
  { $unwind: "$course" }
]);
\`\`\`

中间表的好处是可以在选课关系上挂额外属性（成绩、选课时间等），并且不会让父文档的数组无限增长。

## 16.8 文档大小限制 16MB

MongoDB 单文档**硬上限 16MB**，这是 BSON 协议规定的，无法绕过。

### 为什么有这个限制

- 防止单文档过大导致内存压力
- 保证复制时单 oplog 条目不会过大
- 简化存储引擎实现

### 如何检测文档大小

\`\`\`javascript
// 查看单个文档的 BSON 大小（字节）
const doc = db.posts.findOne({ _id: ObjectId("...") });
print(Object.bsonsize(doc));  // 输出字节数

// 查看集合中最大的文档
db.posts.aggregate([
  { $project: { size: { $bsonSize: "$$ROOT" } } },
  { $sort: { size: -1 } },
  { $limit: 10 }
]);
\`\`\`

### 突破限制的策略

1. **改用引用**：把大数组拆到子集合
2. **GridFS**：大文件（> 16MB）用 GridFS 分块存储
3. **桶模式**：时序数据按时间桶聚合（见第 17 章）
4. **子集模式**：只嵌入热数据，冷数据分离

> **踩坑提示**：如果你的数组在持续增长（如评论列表），一定要监控文档大小。一旦接近 16MB，写入会直接报错，业务中断。

## 16.9 Fan-out 问题

Fan-out（扇出）问题指的是：**父文档嵌入了一个巨大的子文档 ID 数组**，导致父文档本身膨胀，读写性能下降。

### 问题示例

\`\`\`javascript
// 错误示范：一个热门商品有 50 万条评论，全部 ID 嵌入
db.products.insertOne({
  _id: ObjectId(),
  name: "iPhone 99",
  commentIds: [
    ObjectId(), ObjectId(), /* ... 50 万个 ObjectId ... */
  ]
});
// 这个文档可能达到几 MB，每次读 product 都要加载这 50 万个 ID
\`\`\`

### 问题表现

| 现象 | 原因 |
| --- | --- |
| 读取商品详情变慢 | 文档大，网络传输和反序列化耗时 |
| 添加评论变慢 | \$push 操作要重写大数组 |
| 内存压力大 | 大文档占用 WiredTiger 缓存 |
| 接近 16MB 上限 | 随时可能写入失败 |

### 解决方案

\`\`\`javascript
// 方案 1：父引用（推荐）
db.products.insertOne({ _id: ObjectId(), name: "iPhone 99" });
db.comments.insertOne({
  _id: ObjectId(),
  productId: ObjectId("..."),  // 指向父文档
  content: "好评"
});
// 查询商品评论：分页查询，不污染商品文档
db.comments.find({ productId: ObjectId("...") }).limit(20);

// 方案 2：子集模式（只存热门评论）
db.products.insertOne({
  _id: ObjectId(),
  name: "iPhone 99",
  topComments: [/* 只存最新 10 条 */]
});
\`\`\`

## 16.10 选择嵌入还是引用

决策表：

| 维度 | 倾向嵌入 | 倾向引用 |
| --- | --- | --- |
| 子文档数量 | < 几百 | > 几千 |
| 读取模式 | 总是一起读 | 经常独立读 |
| 写入模式 | 一起修改 | 各自独立修改 |
| 数据冗余 | 可接受 | 不可接受 |
| 一致性要求 | 强一致（单文档） | 可接受最终一致 |
| 子文档大小 | 小 | 大 |
| 关系类型 | 一对一、一对少 | 一对多、多对多 |

**经验法则**：

1. 默认优先嵌入，除非有明确理由引用
2. 数组数量超过 1000 就改用引用
3. 频繁更新的字段适合引用，避免写放大
4. 需要事务保证多文档一致时考虑引用 + 事务
5. 大文件用 GridFS，不要嵌入二进制数据

> **踩坑提示**：
> - 不要把"无上限增长"的数组嵌入文档（如评论、日志），会突破 16MB
> - 修改嵌入子文档时，MongoDB 会重写整个文档（WiredTiger 行级存储），大文档性能差
> - \$lookup 在分片集合上有限制，跨分片 JOIN 性能差
> - 引用关系没有外键约束，删除父文档后子文档的引用会变成"孤儿"，需要应用层清理

## 16.11 混合模式实战

实际项目中，往往是嵌入和引用的组合。以电商订单为例：

\`\`\`javascript
// 订单文档：混合模式
db.orders.insertOne({
  _id: ObjectId(),
  orderNo: "ORD20260701001",
  userId: ObjectId("..."),  // 引用用户（用户信息可能变）
  status: "paid",
  // 嵌入商品快照（下单时的价格、名称，不变）
  items: [
    {
      productId: ObjectId("..."),  // 引用商品
      name: "MongoDB 实战书",  // 嵌入快照
      price: 99,  // 嵌入快照
      quantity: 1
    }
  ],
  // 嵌入收货地址快照（下单时的地址，不变）
  shippingAddress: {
    name: "张三",
    phone: "13800000000",
    detail: "北京市朝阳区xxx"
  },
  totalAmount: 99,
  createdAt: ISODate(),
  paidAt: ISODate()
});
\`\`\`

**设计要点**：
- 用户用引用（信息可能变，且订单不需要实时同步用户最新信息）
- 商品基本信息用引用（商品详情页才需要完整信息）
- 商品快照（价格、名称）嵌入（订单是历史记录，不能因商品改价而变）
- 收货地址嵌入快照（同理，历史订单的地址不能变）

## 16.12 本章小结

- MongoDB 数据建模核心是按"访问方式"而非"现实关系"组织
- **嵌入**适合小数据、一起读、强一致；**引用**适合大数据、独立读、低冗余
- 一对一：根据数据量决定；一对多：根据子文档数量选择嵌入/子引用/父引用
- 多对多：小数据用双向引用，大数据用中间表
- 单文档 16MB 上限是嵌入的硬约束，无限增长数组必须引用
- \$lookup 实现跨集合关联，但性能不如嵌入，且分片集合有限制
- Fan-out 问题是嵌入大数组的典型坑，用父引用或子集模式解决
- 实际项目多用混合模式：核心数据嵌入，易变数据引用，历史快照嵌入`
  },

  {
    id: "mongo-ch17",
    group: "第四部分 数据建模",
    icon: "🧩",
    title: "第 17 章 模式设计模式",
    content: `# 第 17 章 模式设计模式

MongoDB 没有强 schema，但**好建模不等于乱建模**。经过大量项目实践，社区总结了一组通用模式，本章介绍最常用的设计模式，覆盖 90% 的业务建模场景。

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

**适用条件**：关联数据总是一起读，且总量可控（不超 16MB）。

## 17.2 属性模式（Attribute Pattern）

**核心思想**：用数组存放"可变属性"，每项包含 name + value，避免字段爆炸。

**场景**：商品属性。电影有导演、演员；书有作者、ISBN；手机有 CPU、内存。不同类型属性差异巨大。

**传统方式（差）**：

\`\`\`javascript
// 字段不固定，索引爆炸
db.products.insertOne({ name: "手机", cpu: "骁龙8", ram: "12GB" });
db.products.insertOne({ name: "书", author: "张三", isbn: "xxx" });
// 每种新属性都要加字段、加索引，无法统一查询
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

**适用场景**：商品目录、电影元数据、设备参数表等"字段不固定"的实体。

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

**进阶**：桶大小要根据数据频率选择。高频数据用小时桶，低频数据用日桶。

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

// 统一搜索（所有类型都能按 title 搜）
db.contents.createIndex({ title: "text" });
db.contents.find({ $text: { $search: "MongoDB" } });
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

\`\`\`javascript
// 监听评论插入，自动更新文章的 commentCount
const stream = db.comments.watch([{ $match: { operationType: "insert" } }]);
stream.on("change", (change) => {
  db.posts.updateOne(
    { _id: change.fullDocument.postId },
    { $inc: { commentCount: 1 } }
  );
});
\`\`\`

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

// 查看详情页：一次查询拿到电影 + 热门评论
db.movies.findOne({ _id: ObjectId("...") });

// 查看全部评论：分页查 comments 集合
db.comments.find({ movieId: ObjectId("...") }).limit(20);
\`\`\`

**优点**：热数据查询快，冷数据不污染主文档。

**维护**：新评论来了要同时写入 comments 集合和更新 topComments（用 \$push + \$slice 保持只存 10 条）。

\`\`\`javascript
// 新评论到达：先存全量，再更新子集
db.comments.insertOne({ movieId: movieId, user: "王五", content: "好看", rating: 5 });

db.movies.updateOne(
  { _id: movieId },
  {
    $push: {
      topComments: {
        $each: [{ user: "王五", content: "好看", rating: 5, createdAt: ISODate() }],
        $position: 0,  // 插入到头部
        $slice: 10  // 只保留前 10 条
      }
    }
  }
);
\`\`\`

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

**适用场景**：点赞数、浏览量、播放量等"不需要精确"的统计。

## 17.8 扩展引用模式（Extended Reference Pattern）

**核心思想**：把高频一起访问的"被引用文档"的部分字段**冗余**到引用方，减少 \$lookup。

**场景**：订单需要显示用户姓名和头像，但完整用户信息在 users 集合。

\`\`\`javascript
// 纯引用：每次查订单都要 \$lookup users
db.orders.insertOne({
  _id: ObjectId(),
  userId: ObjectId("..."),
  amount: 99
});
// 查询要 join，慢

// 扩展引用：把用户的关键字段冗余进来
db.orders.insertOne({
  _id: ObjectId(),
  userId: ObjectId("..."),
  userSnapshot: {  // 冗余的热门字段
    name: "张三",
    avatar: "https://..."
  },
  amount: 99
});
// 查询直接拿，不用 join
db.orders.findOne({ _id: ObjectId("...") });
\`\`\`

**适用条件**：被引用的字段几乎不变（如用户姓名），或可以接受短暂不一致。

**维护**：用户改名时要同步更新所有订单的 userSnapshot，可用 Change Streams 自动同步。

## 17.9 异常值模式（Outlier Pattern）

**核心思想**：99% 的文档是"正常大小"，但 1% 是"异常大"的，对异常值单独处理，不影响正常文档的性能。

**场景**：社交账号粉丝数。普通用户几十个粉丝，但明星有上千万粉丝。

\`\`\`javascript
// 普通用户：粉丝 ID 嵌入
db.users.insertOne({
  _id: ObjectId(),
  name: "张三",
  followerIds: [ObjectId(), ObjectId(), /* 几十个 */],
  isOutlier: false
});

// 明星用户：粉丝太多，改用单独集合
db.users.insertOne({
  _id: ObjectId(),
  name: "顶流明星",
  followerIds: [],  // 不存
  followerCount: 10000000,  // 只存数量
  isOutlier: true  // 标记为异常值
});

// 明星的粉丝单独存
db.followers.insertOne({
  _id: ObjectId(),
  userId: ObjectId("..."),  // 明星 ID
  followerId: ObjectId("...")
});
\`\`\`

**查询逻辑**：

\`\`\`javascript
function getFollowers(userId) {
  const user = db.users.findOne({ _id: userId });
  if (user.isOutlier) {
    // 异常值：查 followers 集合
    return db.followers.find({ userId }).limit(20);
  } else {
    // 正常值：直接返回嵌入的数组
    return user.followerIds;
  }
}
\`\`\`

**优点**：正常文档保持小体积，查询快；异常值不拖累整体性能。

## 17.10 树形结构模式

树形结构（分类、组织架构、评论回复）在 MongoDB 中有多种建模方式。

### 模式一：父引用（Parent Reference）

每个节点存父节点 ID。

\`\`\`javascript
db.categories.insertMany([
  { _id: "电子产品", parent: null },
  { _id: "手机", parent: "电子产品" },
  { _id: "笔记本", parent: "电子产品" },
  { _id: "iPhone", parent: "手机" }
]);

// 查询某节点的直接子节点：快
db.categories.find({ parent: "电子产品" });

// 查询整个子树：慢，要递归
// 需要 $graphLookup
db.categories.aggregate([
  { $match: { _id: "电子产品" } },
  {
    $graphLookup: {
      from: "categories",
      startWith: "$_id",
      connectFromField: "_id",
      connectToField: "parent",
      as: "descendants"
    }
  }
]);
\`\`\`

**优点**：简单，增删节点容易。**缺点**：查子树慢。

### 模式二：子引用（Child Reference）

父节点存所有子节点 ID 数组。

\`\`\`javascript
db.categories.insertMany([
  { _id: "电子产品", children: ["手机", "笔记本"] },
  { _id: "手机", children: ["iPhone", "Android"] },
  { _id: "iPhone", children: [] }
]);

// 查询直接子节点：快
db.categories.findOne({ _id: "电子产品" }).children;

// 查询父节点：慢，要遍历
\`\`\`

**优点**：查子节点快。**缺点**：查父节点慢，且深层树文档会膨胀。

### 模式三：祖先数组（Array of Ancestors）

每个节点存所有祖先的 ID 数组。

\`\`\`javascript
db.categories.insertMany([
  { _id: "电子产品", ancestors: [], parent: null },
  { _id: "手机", ancestors: ["电子产品"], parent: "电子产品" },
  { _id: "笔记本", ancestors: ["电子产品"], parent: "电子产品" },
  { _id: "iPhone", ancestors: ["电子产品", "手机"], parent: "手机" }
]);

// 查询某节点的所有祖先：快
db.categories.findOne({ _id: "iPhone" }).ancestors;

// 查询某节点的所有后代：快
db.categories.find({ ancestors: "电子产品" });

// 创建索引加速
db.categories.createIndex({ ancestors: 1 });
\`\`\`

**优点**：查祖先和后代都快。**缺点**：节点移动时要更新所有后代的 ancestors 数组。

### 模式四：物化路径（Materialized Path）

每个节点存完整路径字符串。

\`\`\`javascript
db.categories.insertMany([
  { _id: "电子产品", path: "/电子产品" },
  { _id: "手机", path: "/电子产品/手机" },
  { _id: "笔记本", path: "/电子产品/笔记本" },
  { _id: "iPhone", path: "/电子产品/手机/iPhone" }
]);

// 查询所有后代：用正则匹配前缀
db.categories.find({ path: /^\\/电子产品\\// });

// 查询祖先：解析 path 字符串
\`\`\`

**优点**：查询后代用正则即可，无需 \$graphLookup。**缺点**：路径字符串维护要小心。

### 树形模式对比

| 模式 | 查子节点 | 查祖先 | 查后代树 | 移动节点 |
| --- | --- | --- | --- | --- |
| 父引用 | 快 | 慢（递归） | 慢（\$graphLookup） | 快 |
| 子引用 | 快 | 慢 | 慢 | 中 |
| 祖先数组 | 快 | 快 | 快 | 慢（更新所有后代） |
| 物化路径 | 中 | 中 | 快（正则） | 慢（更新所有后代路径） |

> **选型建议**：树浅且少改 → 祖先数组；树深且常查后代 → 物化路径；树常变动 → 父引用。

## 17.11 本章小结

| 模式 | 适用场景 | 关键收益 |
| --- | --- | --- |
| 文档模式 | 一起读的关联数据 | 避免 JOIN |
| 属性模式 | 可变属性 | 单一索引覆盖 |
| 桶模式 | 时序数据 | 文档数量减少，预聚合 |
| 多态模式 | 同类不同结构 | 统一查询 |
| 计算模式 | 频繁聚合 | 避免实时计算 |
| 子集模式 | 热冷数据分离 | 热查询快 |
| 近似值模式 | 高并发计数 | 降低写压力 |
| 扩展引用 | 高频一起读的关联字段 | 减少 \$lookup |
| 异常值模式 | 99% 正常 + 1% 异常大 | 异常值不拖累整体 |
| 树形模式 | 层级结构 | 根据访问模式选子模式 |

> **踩坑提示**：模式不是"非此即彼"，可以组合使用。例如桶模式 + 计算模式（桶里存预聚合值）是 IoT 的经典组合；扩展引用 + 子集模式是电商订单的常见组合。`
  },

  {
    id: "mongo-ch18",
    group: "第四部分 数据建模",
    icon: "🔐",
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

### 核心 API

| API | 作用 |
| --- | --- |
| \`startSession()\` | 创建会话 |
| \`session.startTransaction()\` | 开启事务 |
| \`session.commitTransaction()\` | 提交事务 |
| \`session.abortTransaction()\` | 回滚事务 |
| \`session.endSession()\` | 结束会话 |

### mongo shell 示例

\`\`\`javascript
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

### Node.js 驱动写法

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
    { session }  // 必须传 session
  );

  await accounts.updateOne(
    { _id: bobId },
    { $inc: { balance: 100 } },
    { session }  // 必须传 session
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

> **关键提示**：所有操作都要传 \`{ session }\`，否则不会在事务内执行。

### 事务中的回滚场景

\`\`\`javascript
// 余额不足时自动回滚
try {
  session.startTransaction();
  // A 余额不足，updateOne 匹配 0 条
  const result = await accounts.updateOne(
    { _id: aliceId, balance: { $gte: 1000 } },  // 余额不够
    { $inc: { balance: -1000 } },
    { session }
  );
  if (result.matchedCount === 0) {
    throw new Error("余额不足");
  }
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();  // 回滚
}
\`\`\`

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

> **写偏斜示例**：两个医生同时请假，系统要求至少留一人值班。两人都读到"当前有 2 人值班"，各自请假，提交后无人值班。snapshot 隔离下这种情况不会报错。

## 18.4 readConcern 详解（读关注）

readConcern 控制读到数据的"新鲜度"和"一致性"。

### 五种 readConcern 级别

| 级别 | 含义 | 适用场景 |
| --- | --- | --- |
| local（默认） | 读本节点最新数据，可能读到未复制到 majority 的数据 | 默认读，对一致性要求不高 |
| available | 类似 local，分片集群上可能返回孤儿文档 | 分片集群迁移时 |
| majority | 读已提交到多数节点的数据 | 需要避免脏读 |
| linearizable | 强一致读，读操作等待所有 majority 写入完成 | 需要最强一致性 |
| snapshot | 事务中使用，读事务开始时的快照 | 多文档事务 |

### 使用示例

\`\`\`javascript
// shell 中指定 readConcern
db.products.find({}).readConcern("majority");

// Node.js 驱动
db.collection("products").find({}).readConcern("majority");

// 单次查询指定
db.products.find({ status: "active" }).readConcern("linearizable");

// 集合级别设置默认 readConcern
db.runCommand({
  collMod: "products",
  defaultReadConcern: { level: "majority" }
});
\`\`\`

### linearizable 的代价

\`\`\`javascript
// linearizable 读：最强一致，但最慢
// 会等待所有正在进行中的 majority 写入完成
db.orders.findOne({ _id: ObjectId("...") }).readConcern("linearizable");
// 如果此时有大量写入，这条查询会阻塞很久
\`\`\`

> **踩坑提示**：linearizable 只能在主节点读（readPreference 必须是 primary），且不能用于事务中。

## 18.5 writeConcern 详解（写关注）

writeConcern 控制写入到几个节点才返回成功。

### 参数说明

\`\`\`javascript
// 写入 majority 节点后才返回成功
db.products.insertOne(
  { name: "商品A", price: 100 },
  { writeConcern: { w: "majority", j: true, wtimeout: 5000 } }
);
\`\`\`

| 参数 | 含义 | 取值 |
| --- | --- | --- |
| w | 写入几个节点才返回 | 0 / 1 / 数字 / "majority" / 自定义标签 |
| j | 是否等 journal 落盘 | true / false |
| wtimeout | 等待超时（毫秒） | 数字，超时后返回错误（但写入仍可能成功） |

### w 值详解

| w 值 | 含义 | 性能 | 可靠性 |
| --- | --- | --- | --- |
| 0 | 不等待确认（fire-and-forget） | 最快 | 最低，可能丢数据 |
| 1（默认） | 写入 primary 即返回 | 快 | 中，primary 宕机可能丢 |
| 数字（如 3） | 写入指定数量节点 | 中 | 较高 |
| "majority" | 写入多数节点 | 慢 | 高，选举不丢数据 |

### j 值详解

| j 值 | 含义 |
| --- | --- |
| false（默认） | 写入内存即返回，掉电可能丢 |
| true | 等 journal 落盘才返回，掉电不丢 |

### 组合推荐

\`\`\`javascript
// 场景 1：金融关键数据，最高可靠
{ w: "majority", j: true, wtimeout: 5000 }

// 场景 2：普通业务，平衡性能与可靠
{ w: "majority" }

// 场景 3：日志等可丢数据，最高性能
{ w: 1 }

// 场景 4：分片集群跨机房
{ w: "rackA_B" }  // 自定义写关注标签
\`\`\`

> **踩坑提示**：wtimeout 超时后返回错误，但**写入仍可能成功**（只是没等到确认）。应用层要处理这种"超时但成功"的幂等场景。

## 18.6 readPreference（读偏好）

readPreference 控制从哪个节点读。

\`\`\`javascript
// Node.js 驱动
const client = await MongoClient.connect(
  "mongodb://host1:27017,host2:27017,host3:27017/?replicaSet=rs0",
  { readPreference: "secondary" }
);
\`\`\`

| 模式 | 含义 | 适用场景 |
| --- | --- | --- |
| primary（默认） | 只从主节点读 | 强一致读 |
| primaryPreferred | 优先主，主不可用读从 | 故障转移时降级 |
| secondary | 只从从节点读 | 报表、分析查询 |
| secondaryPreferred | 优先从，从不可用读主 | 读写分离 |
| nearest | 最低延迟节点 | 地理分布式部署 |

### 组合示例

报表系统读偏好 secondary + 读关注 majority，不抢主节点资源，又能保证读到一致数据。

\`\`\`javascript
db.orders.find({ status: "paid" }).readPref("secondary").readConcern("majority");
\`\`\`

> **踩坑提示**：从 secondary 读会有**复制延迟**（毫秒到秒级），不适合"写完立即读"的场景。

## 18.7 因果一致性（Causal Consistency）

因果一致性保证"写完再读"的顺序：如果操作 B 在操作 A 之后（有因果关系），B 一定能看到 A 的结果。

### 启用方式

\`\`\`javascript
// Node.js：用同一个 session 并启用 causalConsistency
const session = client.startSession({ causalConsistency: true });

// 操作 1：写入
await db.collection("posts").insertOne(
  { title: "新文章" },
  { session }
);

// 操作 2：读取（同一个 session，因果一致）
const posts = await db.collection("posts").find({}).toArray({ session });
// 一定能读到刚才写入的"新文章"，即使读的是 secondary
\`\`\`

### 适用场景

- 用户发帖后立即刷新页面看自己的帖子
- 修改个人资料后立即查看资料页
- 任何"写后读"且读 secondary 的场景

> **原理**：因果一致性通过 session 中的 operationTime 标记，确保后续读操作的数据版本不低于之前的写操作。

## 18.8 事务的限制

| 限制项 | 值 |
| --- | --- |
| 单事务最大时长 | 60 秒（默认，可配置） |
| 单事务最大操作数 | 无硬限制，但应避免过多 |
| 单事务最大锁文档数 | 受 WiredTiger 影响 |
| 分片事务 | 4.2+ 支持，性能开销大 |
| 事务中创建集合 | 不支持（需预先创建） |
| 事务中创建索引 | 不支持（需预先创建） |
| 事务中修改集合元数据 | 不支持（collMod 等） |
| 单事务最大写入口 | 16MB（所有操作的写数据总和） |

### 超时处理

\`\`\`javascript
// 事务超时会自动 abort
try {
  session.startTransaction();
  // 假设这里有超过 60 秒的操作
  await longRunningTask(session);
  await session.commitTransaction();
} catch (err) {
  if (err.hasErrorLabel("TransientTransactionError")) {
    // 临时错误，可以重试整个事务
    retryTransaction();
  } else if (err.hasErrorLabel("UnknownTransactionCommitResult")) {
    // 提交结果未知，可以重试提交
    retryCommit();
  }
}
\`\`\`

> **踩坑提示**：
> - 事务超时（默认 60s）会自动 abort，长事务要拆分
> - 分片事务性能差，避免在高 QPS 场景大量使用
> - 事务中不能创建集合、不能创建索引，要先准备好
> - 大量修改同一文档可能触发 WiredTiger 重试，影响吞吐
> - 事务越大，持有的锁越多，越容易阻塞其他操作

## 18.9 事务重试策略

事务可能因临时错误（如主节点切换）失败，需要重试。

\`\`\`javascript
// Node.js：事务重试封装
async function runTransactionWithRetry(client, transactionFn) {
  while (true) {
    const session = client.startSession();
    try {
      session.startTransaction();
      await transactionFn(session);
      await session.commitTransaction();
      return;
    } catch (err) {
      await session.abortTransaction();
      if (err.hasErrorLabel("TransientTransactionError")) {
        // 临时错误，重试整个事务
        continue;
      }
      throw err;
    } finally {
      await session.endSession();
    }
  }
}

// 提交重试
async function commitWithRetry(session) {
  while (true) {
    try {
      await session.commitTransaction();
      return;
    } catch (err) {
      if (err.hasErrorLabel("UnknownTransactionCommitResult")) {
        // 提交结果未知，重试提交
        continue;
      }
      throw err;
    }
  }
}
\`\`\`

## 18.10 本章小结

- MongoDB **单文档操作天然原子**，能用单文档完成的就不用事务
- 4.0+ 支持**多文档事务**，需要传 session 参数
- 事务隔离级别是 **snapshot**，避免脏读和不可重复读
- 事务有 60 秒超时，长事务要拆分；分片事务性能开销大
- **writeConcern** 控制写入可靠性（w/j/wtimeout）
- **readConcern** 控制读取新鲜度（local/available/majority/linearizable/snapshot）
- **readPreference** 控制读哪个节点（primary/secondary/nearest 等）
- **因果一致性**保证"写后读"的顺序，适合读 secondary 的场景
- 事务要处理重试：TransientTransactionError 重试事务，UnknownTransactionCommitResult 重试提交

> **踩坑提示**：事务不是银弹，过度使用会让性能急剧下降。优先靠数据建模（嵌入）避免事务，只在不可避免时使用。`
  },

  {
    id: "mongo-ch19",
    group: "第四部分 数据建模",
    icon: "✅",
    title: "第 19 章 校验与约束",
    content: `# 第 19 章 校验与约束

MongoDB 默认是"无 schema"的——你可以往同一集合塞任意结构的文档。但生产环境通常需要约束字段类型、必填字段等。3.6+ 引入 **JSON Schema 校验**，让你在数据库层面强制 schema。

## 19.1 JSON Schema 校验

通过 \`collMod\` 命令或 \`createCollection\` 给集合添加 validator。

### 创建集合时指定 validator

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

## 19.2 bsonType 支持的类型

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
| decimal | 高精度小数 |
| timestamp | 时间戳 |
| regex | 正则表达式 |

### 多类型字段

\`\`\`javascript
// 字段可以是 string 或 null
{
  phone: {
    bsonType: ["string", "null"],
    description: "手机号，可为空"
  }
}
\`\`\`

## 19.3 JSON Schema 常用关键字

### CRUD 相关关键字

| 关键字 | 作用 | 示例 |
| --- | --- | --- |
| required | 必填字段数组 | \`required: ["name", "age"]\` |
| properties | 字段定义 | \`properties: { name: {...} }\` |
| bsonType | 类型约束 | \`bsonType: "string"\` |
| enum | 枚举值 | \`enum: ["a", "b", "c"]\` |
| minimum / maximum | 数值范围 | \`minimum: 0, maximum: 100\` |
| minLength / maxLength | 字符串长度 | \`minLength: 6\` |
| pattern | 正则匹配 | \`pattern: "^1\\\\d{10}$"\` |
| items | 数组元素 schema | \`items: { bsonType: "int" }\` |
| additionalProperties | 是否允许额外字段 | \`additionalProperties: false\` |
| minItems / maxItems | 数组长度 | \`minItems: 1\` |
| uniqueItems | 数组元素唯一 | \`uniqueItems: true\` |

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
          minItems: 1,  // 至少一件商品
          items: {
            bsonType: "object",
            required: ["productId", "quantity"],
            properties: {
              productId: { bsonType: "objectId" },
              quantity: { bsonType: "int", minimum: 1 },
              price: { bsonType: "double", minimum: 0 }
            }
          }
        },
        shippingAddress: {
          bsonType: "object",
          required: ["name", "phone", "detail"],
          properties: {
            name: { bsonType: "string" },
            phone: { bsonType: "string", pattern: "^1[3-9]\\\\d{9}$" },
            detail: { bsonType: "string" }
          }
        }
      }
    }
  }
});
\`\`\`

### 禁止额外字段（严格 schema）

\`\`\`javascript
// additionalProperties: false 后，文档只能包含 properties 中定义的字段
{
  bsonType: "object",
  required: ["name"],
  properties: {
    name: { bsonType: "string" },
    age: { bsonType: "int" }
  },
  additionalProperties: false  // 不允许其他字段
}
// 插入 { name: "张三", extra: "xxx" } 会失败
\`\`\`

## 19.4 校验级别 validationLevel

校验有三个级别：**什么时候校验**。

| 级别 | 含义 | 适用场景 |
| --- | --- | --- |
| strict（默认） | 所有插入和修改都校验 | 全新集合，数据严格 |
| moderate | 仅校验"满足已有 validator 的文档"，已有不合规文档不校验 | 渐进式收紧 |
| off | 关闭校验 | 临时关闭 |

### strict vs moderate 的区别

\`\`\`javascript
// 假设集合已有数据：{ name: "张三", age: 30 }（符合 validator）
// 另有：{ name: "李四" }（不符合，缺少 age）

// strict 模式：更新 { name: "李四" } 会报错（缺少 age）
// moderate 模式：更新 { name: "李四" } 不报错（已有不合规文档不校验）

db.runCommand({
  collMod: "users",
  validationLevel: "moderate"  // 老数据放过，新数据校验
});
\`\`\`

## 19.5 校验动作 validationAction

校验不通过时怎么办：**error 或 warn**。

| 动作 | 含义 |
| --- | --- |
| error（默认） | 拒绝写入 |
| warn | 允许写入，但记日志 |

### warn 模式示例

\`\`\`javascript
db.runCommand({
  collMod: "users",
  validator: { $jsonSchema: { /* ... */ } },
  validationLevel: "moderate",
  validationAction: "warn"  // 不合规也写入，但记日志
});
\`\`\`

> **踩坑提示**：\`warn\` 模式下日志会快速增长，生产环境慎用。建议先用 warn 收集不合规数据，修复后再切回 error。

### 查看日志

\`\`\`javascript
// 查看 warn 模式产生的不合规记录
db.adminCommand({
  getLog: "global"
}).log.forEach(line => {
  if (line.includes("Document failed validation")) {
    print(line);
  }
});
\`\`\`

## 19.6 collMod 修改 validator

修改 validator 时，要小心已有数据是否还合规。

### 查询已有 validator

\`\`\`javascript
db.getCollectionInfos({ name: "users" });
// 输出包含 validator、validationLevel、validationAction
\`\`\`

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
// 方案 1：补全数据
db.users.updateMany(
  { phone: { $exists: false } },
  { $set: { phone: "13800000000" } }
);

// 方案 2：临时 moderate
db.runCommand({
  collMod: "users",
  validator: { $jsonSchema: { /* 新规则 */ } },
  validationLevel: "moderate"
});
\`\`\`

### 移除 validator

\`\`\`javascript
db.runCommand({
  collMod: "users",
  validator: {},
  validationLevel: "off"
});
\`\`\`

## 19.7 查询操作符校验（Check-like Validation）

除了 \$jsonSchema，validator 还支持用**查询操作符**做校验，类似 SQL 的 CHECK 约束。

### 用查询操作符做 validator

\`\`\`javascript
// 用 $and / $or 等查询操作符做校验
db.createCollection("accounts", {
  validator: {
    $and: [
      { balance: { $type: "double" } },
      { balance: { $gte: 0 } },  // 余额不能为负
      { $or: [
        { status: "active" },
        { status: "frozen", frozenReason: { $exists: true } }  // 冻结必须有原因
      ]}
    ]
  }
});

// 插入余额为负 → 失败
db.accounts.insertOne({ balance: -100, status: "active" });

// 插入冻结但无原因 → 失败
db.accounts.insertOne({ balance: 100, status: "frozen" });

// 合法
db.accounts.insertOne({ balance: 100, status: "frozen", frozenReason: "可疑交易" });
\`\`\`

### 混合使用 \$jsonSchema + 查询操作符

\`\`\`javascript
db.createCollection("products", {
  validator: {
    $and: [
      { $jsonSchema: {
        bsonType: "object",
        required: ["name", "price"],
        properties: {
          name: { bsonType: "string" },
          price: { bsonType: "double" }
        }
      }},
      // 额外约束：打折价必须低于原价
      { $expr: { $lte: ["$discountPrice", "$price"] } }
    ]
  }
});
\`\`\`

> **支持的操作符**：$eq, $gt, $gte, $in, $lt, $lte, $ne, $nin, $exists, $type, $and, $or, $not, $nor, $expr, $jsonSchema。不支持 $where, $geoIntersects 等。

## 19.8 唯一约束

MongoDB 通过**唯一索引**实现唯一约束，类似 SQL 的 UNIQUE。

### 创建唯一索引

\`\`\`javascript
// 单字段唯一
db.users.createIndex({ email: 1 }, { unique: true });

// 插入重复 email 会报错
db.users.insertOne({ email: "a@b.com" });  // 成功
db.users.insertOne({ email: "a@b.com" });  // 报错：E11000 duplicate key
\`\`\`

### 复合唯一索引

\`\`\`javascript
// 一个用户只能对一篇文章点赞一次
db.likes.createIndex(
  { userId: 1, postId: 1 },
  { unique: true }
);

// 重复点赞会报错
db.likes.insertOne({ userId: 1, postId: 1 });  // 成功
db.likes.insertOne({ userId: 1, postId: 1 });  // 报错
db.likes.insertOne({ userId: 1, postId: 2 });  // 成功（不同文章）
\`\`\`

### 唯一索引与 null

\`\`\`javascript
// 唯一索引中，null 也算一个值
db.users.createIndex({ phone: 1 }, { unique: true });

// 多个用户 phone 为 null 会报错（null 视为重复）
db.users.insertOne({ name: "张三", phone: null });
db.users.insertOne({ name: "李四", phone: null });  // 报错！

// 解决：用稀疏索引，不索引缺失字段
db.users.createIndex({ phone: 1 }, { unique: true, sparse: true });
db.users.insertOne({ name: "张三" });  // phone 字段不存在，不索引
db.users.insertOne({ name: "李四" });  // 同样不索引，不报错
\`\`\`

> **踩坑提示**：唯一索引在**分片集群**上要求索引键包含分片键，否则无法创建。这是分片集群的常见坑。

## 19.9 Schema 迁移

当业务变化，需要修改已有数据的 schema 时，要做迁移。

### 迁移策略

| 策略 | 说明 | 适用场景 |
| --- | --- | --- |
| 批量更新 | 用 updateMany 一次性改所有文档 | 数据量小 |
| 增量迁移 | 边写边改，新数据用新 schema，老数据逐步更新 | 数据量大 |
| 版本字段 | 文档加 schemaVersion 字段，应用层按版本处理 | 渐进迁移 |
| 双写迁移 | 新老 schema 并存，逐步切换 | 零停机 |

### 示例：添加必填字段

\`\`\`javascript
// 原始数据：{ name: "张三" }（没有 phone 字段）
// 目标：phone 必填

// 第 1 步：给所有文档补默认值
db.users.updateMany(
  { phone: { $exists: false } },
  { $set: { phone: "13800000000" } }
);

// 第 2 步：更新 validator 添加 phone 必填
db.runCommand({
  collMod: "users",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "phone"],
      properties: {
        name: { bsonType: "string" },
        phone: { bsonType: "string", pattern: "^1[3-9]\\\\d{9}$" }
      }
    }
  }
});
\`\`\`

### 示例：字段重命名

\`\`\`javascript
// 把 name 字段改成 username
// 第 1 步：新增 username 字段，复制 name 的值
db.users.updateMany(
  { name: { $exists: true }, username: { $exists: false } },
  [{ $set: { username: "$name" } }]  // 聚合管道写法
);

// 第 2 步：删除旧字段
db.users.updateMany(
  { name: { $exists: true } },
  { $unset: "name" }
);
\`\`\`

### 版本字段迁移

\`\`\`javascript
// 文档带 schemaVersion，应用层按版本处理
db.users.insertOne({ name: "张三", schemaVersion: 1 });

// 迁移到 v2：name → username + phone
db.users.updateMany(
  { schemaVersion: 1 },
  [
    { $set: { username: "$name", phone: "13800000000", schemaVersion: 2 } },
    { $unset: "name" }
  ]
);

// 应用层读数据时
function readUser(doc) {
  if (doc.schemaVersion === 1) {
    return { username: doc.name, phone: null };  // 兼容老格式
  }
  return doc;  // v2 格式
}
\`\`\`

## 19.10 本章小结

- MongoDB 3.6+ 支持 **JSON Schema 校验**，通过 collMod 配置 validator
- bsonType 支持所有 BSON 类型，required/enum/minimum/pattern 等关键字做约束
- 校验级别：strict（全校验）/ moderate（仅校验合规文档）/ off
- 校验动作：error（拒绝）/ warn（警告）
- 修改 validator 要先确保已有数据合规，否则命令会失败
- **唯一约束**通过唯一索引实现，分片集群上需包含分片键
- **Check-like 校验**用查询操作符（$and/$or/$expr 等）实现复杂业务规则
- **Schema 迁移**要分步进行：补数据 → 改 validator，或用版本字段渐进迁移
- 校验只是数据库层一道防线，**应用层校验仍是必要的**，数据库校验是兜底

> **踩坑提示**：
> - validator 不支持 \$jsonSchema 之外的查询操作符（如 \$where），但可以混用部分查询操作符
> - 校验会带来轻微性能开销，对写入密集场景要评估
> - Mongoose 等应用层 ODM 与 DB 层校验可以组合使用，但避免双重定义导致维护混乱
> - 唯一索引在分片集群上必须包含分片键`
  },

  {
    id: "mongo-ch20",
    group: "第四部分 数据建模",
    icon: "📡",
    title: "第 20 章 变更流与触发器",
    content: `# 第 20 章 变更流与触发器

变更流（Change Streams）是 MongoDB 3.6 引入的特性，让你**实时监听集合、数据库或集群的数据变更**。它是构建事件驱动架构、数据同步、审计日志的利器。

## 20.1 Change Streams 简介

**核心机制**：基于 oplog，把数据库的写操作转化为可订阅的事件流。

### 与 oplog 的对比

| 维度 | 直接读 oplog | Change Streams |
| --- | --- | --- |
| 稳定性 | oplog 格式是内部实现，版本间可能变 | API 稳定，向后兼容 |
| 权限 | 需要 root 级权限 | 普通用户权限即可 |
| 过滤 | 手动过滤原始 oplog | 支持 \$match/\$project 管道 |
| 断点续传 | 自己管理时间戳 | resumeToken 内置 |
| 集合级别 | 难以区分 | 原生支持集合/库/集群 |
| 分片集群 | 复杂，要合并多个分片 oplog | 自动合并，透明 |

> **结论**：永远用 Change Streams，不要直接读 oplog。oplog 是内部实现，格式可能随版本变化。

### 与 SQL 触发器的区别

| 维度 | SQL 触发器 | MongoDB Change Streams |
| --- | --- | --- |
| 执行位置 | 数据库进程内 | 应用程序内 |
| 执行语言 | SQL/PL-SQL | 任意语言（Node.js/Python） |
| 阻塞写入 | 是 | 否（异步消费） |
| 失败处理 | 回滚事务 | 事件保留，可重试 |
| 适用场景 | 数据库内逻辑 | 跨服务、跨系统同步 |

### 优势

- **非阻塞**：不影响写入性能
- **可扩展**：消费者独立部署，可水平扩展
- **跨语言**：用任何驱动消费
- **断点续传**：通过 resumeToken 恢复
- **聚合管道**：支持 \$match/\$project 过滤

### 限制

- 仅副本集和分片集群支持，**单机模式不支持**
- 事件有保留时间（oplog 大小决定，默认几小时到几天）
- 消费速度跟不上写入速度时，事件会被 oplog 淘汰

## 20.2 watch() 监听变更

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
      case "invalidate":
        console.log("集合被删除或重命名，流失效");
        break;
    }
  });

  changeStream.on("error", (err) => {
    console.error("监听错误：", err);
  });
}

watchProducts();
\`\`\`

### 监听数据库和集群

\`\`\`javascript
// 监听整个数据库（所有集合的变更）
db.watch();

// Node.js：监听整个集群
client.watch();

// 监听数据库（Node.js）
client.db("shop").watch();
\`\`\`

| 监听级别 | API | 事件范围 |
| --- | --- | --- |
| 集合 | collection.watch() | 该集合的所有变更 |
| 数据库 | db.watch() | 该数据库所有集合的变更 |
| 集群 | client.watch() | 整个集群所有数据库的变更 |

## 20.3 变更事件结构

一个典型的变更事件结构如下：

\`\`\`javascript
{
  _id: { /* resumeToken */ },
  operationType: "insert",  // insert/update/delete/replace/drop/invalidate
  fullDocument: { /* 完整文档 */ },
  ns: { db: "shop", coll: "products" },  // 命名空间
  documentKey: { _id: ObjectId("...") },  // 文档主键
  updateDescription: {  // 仅 update 事件有
    updatedFields: { price: 200 },
    removedFields: ["oldField"],
    truncatedArrays: []
  },
  clusterTime: Timestamp(1234567890, 1),  // 集群时间戳
  txnNumber: Long(1),  // 事务编号（事务内操作才有）
  lsid: { /* 会话 ID */ }
}
\`\`\`

### operationType 类型

| operationType | 触发条件 | 是否有 fullDocument |
| --- | --- | --- |
| insert | 插入文档 | 是 |
| update | 更新文档 | 默认否，需配置 fullDocument |
| replace | 替换文档 | 是 |
| delete | 删除文档 | 否（只有 documentKey） |
| drop | 集合被删除 | 否 |
| rename | 集合重命名 | 否 |
| dropDatabase | 数据库被删除 | 否 |
| invalidate | 流失效（集合删除等） | 否 |

## 20.4 fullDocument 选项

默认情况下，**update 事件的 fullDocument 为 null**——因为 update 只记录修改的字段，不记录完整文档。要拿到完整文档，需要配置 fullDocument 选项。

### fullDocument: "updateLookup"

\`\`\`javascript
// updateLookup：每次 update 事件都去查一次完整文档
const changeStream = collection.watch([], {
  fullDocument: "updateLookup"
});

changeStream.on("change", (change) => {
  if (change.operationType === "update") {
    // 现在 fullDocument 有值了（查询时的最新状态）
    console.log("完整文档：", change.fullDocument);
    console.log("修改的字段：", change.updateDescription.updatedFields);
  }
});
\`\`\`

**代价**：每个 update 事件多一次查询，有性能开销。且查到的是"当前最新"文档，不是"修改后那一刻"的文档（中间可能又被改过）。

### fullDocument 选项对比

| 值 | 行为 | 适用场景 |
| --- | --- | --- |
| "default"（默认） | insert/replace 有 fullDocument，update 没有 | 只关心改了什么 |
| "updateLookup" | update 时额外查一次完整文档 | 需要完整文档，可接受性能代价 |
| "whenAvailable" | 有变更后镜像就返回，没有就返回 null | 6.0+ 配合 pre/post image |
| "required" | 必须有完整文档，否则报错 | 严格要求完整文档 |

## 20.5 聚合管道过滤

watch() 接受一个聚合管道，支持 \$match、\$project 等阶段过滤事件。

### \$match 过滤事件类型

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

### \$project 投影

\`\`\`javascript
// 只保留需要的字段
const changeStream = collection.watch([
  {
    $project: {
      operationType: 1,
      "fullDocument.name": 1,
      "fullDocument.price": 1,
      "documentKey._id": 1
    }
  }
]);
\`\`\`

### 组合管道

\`\`\`javascript
// 只监听价格变更，且只保留关键字段
const changeStream = collection.watch([
  { $match: { operationType: "update" } },
  { $project: {
    "documentKey._id": 1,
    "updateDescription.updatedFields.price": 1
  }}
]);

changeStream.on("change", (change) => {
  console.log("价格变更：", change.updateDescription.updatedFields.price);
});
\`\`\`

> **支持的阶段**：\$match、\$project、\$addFields、\$replaceRoot、\$replaceWith、\$unset。不支持 \$group、\$sort、\$limit 等（因为流式处理不适合聚合）。

## 20.6 resumeToken 断点续传

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

### 三种恢复方式

| 选项 | 说明 | 适用场景 |
| --- | --- | --- |
| resumeAfter | 从指定 token 之后开始，token 必须有效（oplog 还在） | 正常重启 |
| startAfter | 4.2+ 支持，token 失效也能继续（适合故障恢复） | 故障恢复 |
| startAtOperationTime | 从指定时间戳开始 | 历史回放 |

\`\`\`javascript
// resumeAfter：正常断点续传
collection.watch([], { resumeAfter: savedToken });

// startAfter：token 可能失效的故障恢复
collection.watch([], { startAfter: savedToken });

// startAtOperationTime：从指定时间开始
const timestamp = Timestamp(0, Math.floor(Date.now() / 1000));
collection.watch([], { startAtOperationTime: timestamp });
\`\`\`

### resumeToken 的存储

\`\`\`javascript
// 推荐：存到专门的集合或 Redis
db.changeStreamTokens.insertOne({
  streamName: "product-sync",
  token: resumeToken,
  updatedAt: ISODate()
});

// 重启时读取
const saved = db.changeStreamTokens.findOne({ streamName: "product-sync" });
const stream = collection.watch([], { resumeAfter: saved.token });
\`\`\`

## 20.7 变更前镜像（6.0+）

6.0 之前，update 事件拿不到"修改前的文档"。6.0+ 支持 **fullDocumentBeforeChange**。

### 启用变更前镜像

\`\`\`javascript
// 在集合上开启变更前镜像
db.runCommand({
  collMod: "users",
  changeStreamPreAndPostImages: { enabled: true }
});

// 监听时配置
const stream = collection.watch([], {
  fullDocument: "required",
  fullDocumentBeforeChange: "required"
});

stream.on("change", (change) => {
  if (change.operationType === "update") {
    console.log("修改前：", change.fullDocumentBeforeChange);
    console.log("修改后：", change.fullDocument);
    console.log("改了什么：", change.updateDescription.updatedFields);
  }
});
\`\`\`

> **注意**：变更前镜像需要额外存储空间，且有过期时间（默认 1 小时）。生产环境要监控存储量。

## 20.8 应用场景

### 场景一：同步到 Elasticsearch

MongoDB 作为主库，ES 作为搜索库。

\`\`\`javascript
const { MongoClient } = require("mongodb");
const { Client: ESClient } = require("@elastic/elasticsearch");

async function syncMongoToES() {
  const mongo = await MongoClient.connect("mongodb://localhost:27017/?replicaSet=rs0");
  const es = new ESClient({ node: "http://localhost:9200" });

  const products = mongo.db("shop").collection("products");

  const stream = products.watch([], {
    resumeAfter: await loadToken(),
    fullDocument: "updateLookup"
  });

  stream.on("change", async (change) => {
    try {
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
    } catch (err) {
      console.error("同步失败：", err);
      // 重试或丢入死信队列
    }
  });
}
\`\`\`

### 场景二：审计日志

监听敏感集合的所有变更，写入审计表。

\`\`\`javascript
const stream = db.users.watch([], {
  fullDocument: "updateLookup",
  fullDocumentBeforeChange: "whenAvailable"
});

stream.on("change", async (change) => {
  await db.audit_logs.insertOne({
    collection: "users",
    operation: change.operationType,
    documentId: change.documentKey?._id,
    before: change.fullDocumentBeforeChange,
    after: change.fullDocument,
    updatedFields: change.updateDescription?.updatedFields,
    timestamp: ISODate(),
    operator: getCurrentUser(),
    sourceIp: getRequestIp()
  });
});
\`\`\`

### 场景三：实时通知

下单后自动发短信、扣库存。

\`\`\`javascript
const stream = db.orders.watch([
  { $match: { operationType: "insert" } }
], {
  fullDocument: "updateLookup"
});

stream.on("change", async (change) => {
  const order = change.fullDocument;

  // 扣库存
  for (const item of order.items) {
    await db.products.updateOne(
      { _id: item.productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );
  }

  // 发短信（异步丢队列）
  await messageQueue.push({
    type: "sms",
    to: order.userPhone,
    content: "下单成功，订单号：" + order.orderNo
  });

  // 推送 WebSocket 实时通知
  await wsServer.notify(order.userId, {
    event: "order_created",
    data: order
  });
});
\`\`\`

### 场景四：缓存失效

MongoDB 数据变更时，自动清除 Redis 缓存。

\`\`\`javascript
const stream = db.products.watch([], { fullDocument: "updateLookup" });

stream.on("change", async (change) => {
  const id = change.documentKey._id.toString();
  // 删除 Redis 缓存
  await redis.del("product:" + id);
  await redis.del("product:detail:" + id);
  console.log("缓存已失效：", id);
});
\`\`\`

## 20.9 变更流触发器（MongoDB Atlas）

MongoDB Atlas 提供 **Triggers** 功能，让你在 UI 上配置触发器，无需自己写监听程序。

### 配置示例

\`\`\`javascript
// Atlas Trigger 配置（JSON）
{
  "name": "product-sync-trigger",
  "type": "DATABASE",
  "config": {
    "serviceId": "...",
    "database": "shop",
    "collection": "products",
    "operationTypes": ["insert", "update", "delete"]
  },
  "pipeline": [
    { $match: { "fullDocument.price": { $gt: 100 } } }
  ],
  "function": "syncToES"  // 触发的函数名
}

// 触发器执行的函数
exports = async function(changeEvent) {
  const es = context.services.get("ESCluster");
  if (changeEvent.operationType === "insert") {
    await es.index({
      index: "products",
      id: changeEvent.fullDocument._id.toString(),
      body: changeEvent.fullDocument
    });
  }
};
\`\`\`

### Atlas Triggers vs 自建 Change Streams

| 维度 | Atlas Triggers | 自建 Change Streams |
| --- | --- | --- |
| 部署 | Atlas 托管 | 自己部署 |
| 运维 | 无需管理 | 自己维护消费者 |
| 扩展 | Atlas 自动扩展 | 手动扩展 |
| 灵活性 | 受限于 Atlas | 任意定制 |
| 适用 | Atlas 用户，简单场景 | 复杂业务逻辑 |

## 20.10 容错与最佳实践

### 错误处理

\`\`\`javascript
const stream = collection.watch([], { resumeAfter: token });

stream.on("error", async (err) => {
  console.error("监听错误：", err);

  if (err.code === 40573) {
    // resumeToken 失效（oplog 已被覆盖）
    // 需要：1. 全量同步 2. 从最新位置重新开始
    const newStream = collection.watch([], { startAtOperationTime: Timestamp(0, Math.floor(Date.now() / 1000)) });
    startListening(newStream);
  } else {
    // 其他错误，延迟重试
    setTimeout(() => {
      const newStream = collection.watch([], { resumeAfter: lastToken });
      startListening(newStream);
    }, 5000);
  }
});
\`\`\`

### 批量处理

\`\`\`javascript
// 高频变更场景：批量处理事件
const batch = [];
const BATCH_SIZE = 100;
const BATCH_TIMEOUT = 1000;  // 1 秒

stream.on("change", (change) => {
  batch.push(change);

  if (batch.length >= BATCH_SIZE) {
    processBatch(batch.splice(0));
  }
});

// 定时刷新，避免低频时事件堆积
setInterval(() => {
  if (batch.length > 0) {
    processBatch(batch.splice(0));
  }
}, BATCH_TIMEOUT);

async function processBatch(events) {
  // 批量写入 ES / 批量发消息，提高吞吐
  await es.bulk({ body: events.flatMap(toESBulkOp) });
  await saveToken(events[events.length - 1]._id);
}
\`\`\`

## 20.11 本章小结

- Change Streams 基于 oplog，**实时监听数据变更**，是 oplog 的稳定封装
- 监听对象：集合 / 数据库 / 集群，可过滤事件类型
- **resumeToken 实现断点续传**，程序重启不丢事件（resumeAfter / startAfter / startAtOperationTime）
- **fullDocument: "updateLookup"** 让 update 事件也能拿到完整文档
- 6.0+ 支持 **fullDocumentBeforeChange**，可拿到修改前的文档
- 支持 **\$match/\$project 聚合管道**过滤和投影事件
- 典型场景：数据同步（ES/Redis）、审计日志、实时通知、缓存失效
- Atlas Triggers 提供托管的变更流触发器，适合简单场景

> **踩坑提示**：
> - Change Streams 必须部署在副本集或分片集群上，**单机模式不支持**
> - oplog 有保留时间（默认几小时到几天），消费者长时间宕机可能丢事件，要靠全量同步补救
> - 消费速度跟不上写入速度时，事件会堆积，最终被 oplog 淘汰
> - 高频变更场景下，事件处理要异步化、批量处理，避免阻塞 watch
> - 不要在事件处理函数里同步调用慢接口（如发邮件），应该丢队列异步处理
> - resumeToken 失效后要降级为全量同步，要有兜底方案`
  }
];

export { chapters };
