// =============================================================
// 《MongoDB 实战教程》- 章节批次 2
// -------------------------------------------------------------
// 内容：第二部分 查询进阶与删除（第 6-10 章）
// =============================================================

const chapters = [
  // =========================================================
  // 第六章：删除文档
  // =========================================================
  {
    id: "mongo-ch06",
    group: "第二部分 查询进阶与删除",
    icon: "🗑️",
    title: "第 6 章 删除文档",
    content: `# 第 6 章 删除文档

> "删除是数据库操作中最危险的一步——没有撤销键，也没有回收站。"

插入、查询、更新都学了，最后一步是**删除**。MongoDB 的删除操作看似简单，但围绕写入确认、性能影响、数据安全、级联清理有不少讲究。本章带你安全地删除数据，并学会在"删干净"和"留后路"之间做出取舍。

## 6.1 deleteOne 与 deleteMany

MongoDB 提供两个删除方法：\`deleteOne\` 删除**第一条匹配**，\`deleteMany\` 删除**所有匹配**。这和 \`updateOne\`/\`updateMany\` 的逻辑一致。

\`\`\`javascript
// 删除单条：只删第一个匹配的文档
db.users.deleteOne({ name: "张三" });

// 删除多条：删除所有匹配的文档
db.users.deleteMany({ status: "inactive" });

// 删除集合内所有文档（慎用！数据真的没了）
db.users.deleteMany({});

// 返回值结构
// {
//   acknowledged: true,     // 是否确认写入
//   deletedCount: 5         // 实际删除的文档数
// }
\`\`\`

**删除条件的写法**和 \`find\` 完全一致——所有查询运算符（\`\$gt\`、\`\$in\`、\`\$and\` 等）都能用：

\`\`\`javascript
// 删除所有 30 天前创建且未激活的用户
db.users.deleteMany({
  createdAt: { \$lt: ISODate("2024-01-01") },
  status: "inactive"
});

// 删除年龄在 [10, 20] 区间内的用户
db.users.deleteMany({ age: { \$gte: 10, \$lte: 20 } });

// 用 \$or 删除符合任一条件的文档
db.users.deleteMany({
  \$or: [
    { email: { \$exists: false } },
    { email: null },
    { email: "" }
  ]
});
\`\`\`

**Node.js 驱动**：

\`\`\`javascript
const result = await users.deleteMany({ status: "inactive" });
console.log(\`本次删除了 \${result.deletedCount} 条文档\`);
console.log(\`写入确认: \${result.acknowledged ? "已确认" : "未确认"}\`);
\`\`\`

> **心法**：\`deleteOne\` 只删**第一条匹配**，\`deleteMany\` 删**所有匹配**。**删除前一定先 find 确认范围**！养成"先查后删"的习惯，能避免 99% 的删错数据事故。

## 6.2 删除前的安全检查

生产环境最怕"删错数据"。一个良好的删除流程应该是：**先查 → 确认数量 → 再删**。

\`\`\`javascript
// 第一步：查询要删除的文档
const toDelete = db.users.find({
  status: "inactive",
  lastLoginAt: { \$lt: ISODate("2023-01-01") }
}).toArray();

// 第二步：确认数量
print(\`将删除 \${toDelete.length} 条文档\`);

// 第三步：抽样检查
printjson(toDelete.slice(0, 5));   // 看前 5 条

// 第四步：确认无误后再删
db.users.deleteMany({
  status: "inactive",
  lastLoginAt: { \$lt: ISODate("2023-01-01") }
});
\`\`\`

**用 \$isolated 防止并发问题**（已废弃，仅作了解）：

\`\`\`javascript
// 旧版本用 $isolated 保证删除期间读写互斥
// 4.0+ 已移除，改用事务
db.users.deleteMany({
  status: "inactive",
  \$isolated: 1
});
\`\`\`

> **踩坑**：删除条件**不要写成 \`{}\`**！\`deleteMany({})\` 会清空整个集合，且**没有确认提示**。手抖一次，整张表没了。

## 6.3 findOneAndDelete

\`findOneAndDelete\` 删除并返回被删除的文档，适合"取出并删除"场景。它是一个**原子操作**，并发下不会取到同一条文档。

\`\`\`javascript
// 删除并返回被删的文档
const doc = db.queue.findOneAndDelete({ status: "pending" });
// 返回被删除的文档，如果没有匹配则返回 null

// 配合排序：删除最旧的一条
const oldest = db.queue.findOneAndDelete(
  { status: "pending" },
  { sort: { createdAt: 1 } }    // 按创建时间升序，删最旧的
);

// 配合投影：只返回需要的字段
const result = db.queue.findOneAndDelete(
  { status: "pending" },
  {
    sort: { createdAt: 1 },
    projection: { _id: 1, payload: 1 }    // 只返回 _id 和 payload
  }
);
\`\`\`

**经典应用：消息队列**

\`\`\`javascript
// 消费者从队列取一条消息处理（取出即删除，原子操作）
async function consumeMessage() {
  const msg = await messages.findOneAndDelete(
    { status: "pending" },
    { sort: { createdAt: 1 } }
  );

  // 没有消息可消费
  if (!msg) return null;

  try {
    // 处理消息
    await processMessage(msg);
    return msg;
  } catch (err) {
    // 处理失败，消息已经丢了！需要补偿机制
    // 实战中通常先用 updateOne 把状态改成 "failed"，再重试
    await messages.insertOne({ ...msg, status: "failed", error: err.message });
    throw err;
  }
}
\`\`\`

> **优势**：\`findOneAndDelete\` 是原子操作，多个消费者并发取消息时不会重复。但要注意——**取出后处理失败，消息就丢了**！生产环境通常配合"先转状态、再处理"的模式。

## 6.4 删除的写入关注（writeConcern）

和插入、更新一样，删除也支持 \`writeConcern\`，控制写入确认级别：

\`\`\`javascript
// 多数派确认（重要数据，保证不丢）
db.orders.deleteMany(
  { expired: true },
  { writeConcern: { w: "majority", j: true } }
);

// 不等待确认（日志类数据，可接受丢失）
db.logs.deleteMany(
  { level: "debug" },
  { writeConcern: { w: 0 } }
);

// 等待 journal 持久化（崩溃也不丢）
db.payments.deleteMany(
  { status: "cancelled" },
  { writeConcern: { w: 1, j: true, wtimeout: 5000 } }
);
\`\`\`

**writeConcern 参数详解**：

| 参数 | 含义 | 取值 |
| --- | --- | --- |
| \`w\` | 确认写入的节点数 | \`0\`（不确认）、\`1\`（主节点）、\`"majority"\`（多数派） |
| \`j\` | 是否等待 journal 落盘 | \`true\` / \`false\` |
| \`wtimeout\` | 超时时间（毫秒） | 整数，超时后返回错误但**删除仍会执行** |

> **心法**：删除**重要数据**用 \`w: "majority", j: true\`，删除**日志类数据**可用 \`w: 0\` 提速。\`wtimeout\` 超时后操作**不会回滚**，只是客户端拿到错误——这点和事务不一样！

## 6.5 drop 与 deleteMany 的对比

清空集合有两种方式：\`deleteMany({})\` 和 \`drop()\`。它们差异很大：

\`\`\`javascript
// 方式一：deleteMany({}) 删除所有文档，但保留集合和索引
db.users.deleteMany({});
// 集合还在，索引还在，只是没数据了

// 方式二：drop() 直接删除集合本身（连索引一起删）
db.users.drop();
// 集合没了，再插入数据要重建索引
\`\`\`

**两者对比**：

| 维度 | \`deleteMany({})\` | \`drop()\` |
| --- | --- | --- |
| **速度** | 慢（逐条删除） | 极快（直接删元数据） |
| **索引** | 保留 | 一起删除 |
| **集合** | 保留 | 删除 |
| **磁盘空间** | 不释放 | 释放 |
| **触发器** | 触发 change stream | 不触发文档级 change stream |
| **权限** | 需要 \`remove\` 权限 | 需要 \`drop\` 权限 |

**实战选择**：

\`\`\`javascript
// 场景一：临时清空测试数据，但保留索引结构
db.test_users.deleteMany({});

// 场景二：彻底重建集合（更快，释放空间）
db.test_users.drop();
db.test_users.createIndex({ email: 1 }, { unique: true });
db.test_users.insertMany([...]);

// 场景三：删除整个数据库（终极操作，慎用！）
db.dropDatabase();
\`\`\`

> **心法**：要**快速清空**用 \`drop()\`（再重建索引），要**保留索引结构**用 \`deleteMany({})\`。\`dropDatabase()\` 会删掉整个库，操作前一定三思！

## 6.6 justOne 与老 API

旧版 MongoDB 用 \`remove()\` 方法删除，支持 \`justOne\` 参数。新版推荐用 \`deleteOne\`/\`deleteMany\`，但老代码里可能还能看到：

\`\`\`javascript
// 旧 API：remove()
db.users.remove({ status: "inactive" });           // 删除所有匹配（等同 deleteMany）
db.users.remove({ status: "inactive" }, true);     // 只删一条（等同 deleteOne）
db.users.remove({ status: "inactive" }, { justOne: true });  // 写法二

// 新 API：推荐
db.users.deleteOne({ status: "inactive" });        // 删一条
db.users.deleteMany({ status: "inactive" });       // 删多条
\`\`\`

**API 对照表**：

| 旧 API | 新 API | 说明 |
| --- | --- | --- |
| \`remove(query)\` | \`deleteMany(query)\` | 删除所有匹配 |
| \`remove(query, true)\` | \`deleteOne(query)\` | 删除第一条 |
| \`remove(query, { justOne: true })\` | \`deleteOne(query)\` | 同上 |
| \`findAndRemove(query)\` | \`findOneAndDelete(query)\` | 删除并返回 |

> **踩坑**：老 API 的 \`remove({})\` 默认删**所有文档**！新手很容易写成 \`remove({})\` 以为只删一条——这跟新 API 的 \`deleteOne({})\` 行为完全不同。**新项目一律用 \`deleteOne\`/\`deleteMany\`**，语义清晰。

## 6.7 删除的性能影响

删除看似简单，但**大范围删除会影响性能**，主要有三个问题：

### 删除不释放磁盘空间

\`\`\`javascript
// 删除 100 万条数据
db.bigData.deleteMany({ createdAt: { \$lt: ISODate("2023-01-01") } });
// 数据没了，但磁盘空间不还！
\`\`\`

MongoDB 删除文档后，**不会自动回收磁盘空间**——只是把数据页标记为"可复用"。新插入的数据会优先填充这些空页。要真正回收磁盘空间：

\`\`\`javascript
// 方式一：compact 命令（会锁集合，生产环境慎用）
db.runCommand({ compact: "bigData" });

// 方式二：在副本集上用 resync（从节点重新同步）
// 1. 停掉从节点
// 2. 删除从节点数据目录
// 3. 重启从节点，自动全量同步（相当于磁盘整理）

// 方式三：导出 → drop → 导入（最彻底）
mongoexport --db=mydb --collection=bigData --out=backup.json
db.bigData.drop()
mongoimport --db=mydb --collection=bigData --file=backup.json
\`\`\`

### 删除锁与并发

\`\`\`javascript
// deleteMany 在 4.0+ 已经是文档级锁，不会锁整个集合
// 但大批量删除仍会占用大量资源，影响其他查询

// 监控删除进度（用 currentOp）
db.currentOp({
  "command.delete": { \$exists: true }
});
\`\`\`

### 大批量删除的策略

\`\`\`javascript
// ❌ 一次性删除 1000 万条（锁集合太久，影响线上）
db.bigData.deleteMany({ status: "old" });

// 注意：deleteMany 不支持 limit 选项！
// db.bigData.deleteMany({ status: "old" }, { limit: 10000 });  // 报错

// ✅ 正确的分批删除：先 find 取 ID 再按 ID 删
async function safeBatchDelete(batchSize = 10000, intervalMs = 100) {
  let total = 0;
  while (true) {
    // 每次取 batchSize 条的 _id
    const docs = await db.bigData
      .find({ status: "old" }, { _id: 1 })
      .limit(batchSize)
      .toArray();

    if (docs.length === 0) break;

    const ids = docs.map(d => d._id);
    const result = await db.bigData.deleteMany({ _id: { \$in: ids } });

    total += result.deletedCount;
    console.log(\`已删除 \${total} 条\`);

    // 间隔一段时间，给其他查询让出资源
    await new Promise(r => setTimeout(r, intervalMs));
  }
  console.log(\`完成，共删除 \${total} 条\`);
}
\`\`\`

> **踩坑**：\`deleteMany\` **不支持 \`limit\` 选项**！要分批删除，只能"先 \`find\` 取 ID 再按 ID 删"。批量删除时务必加 \`intervalMs\` 间隔，避免压垮数据库。

## 6.8 级联删除（cascading deletes）

MongoDB **没有外键约束**，删除一个文档不会自动删除关联文档。要实现"级联删除"，必须**在应用层手动处理**。

**典型场景**：删除用户时，同时删除该用户的所有文章和评论。

\`\`\`javascript
// ❌ 错误做法：只删用户，留下一堆孤儿文章
db.users.deleteOne({ _id: userId });

// ✅ 正确做法：用事务级联删除
async function deleteUserCascade(userId) {
  const session = db.getMongo().startSession();
  try {
    session.startTransaction();

    // 1. 删除用户的所有评论
    db.comments.deleteMany({ userId }, { session });

    // 2. 删除用户的所有文章
    db.posts.deleteMany({ authorId: userId }, { session });

    // 3. 删除用户本身
    db.users.deleteOne({ _id: userId }, { session });

    // 4. 提交事务
    session.commitTransaction();
    console.log("级联删除完成");
  } catch (err) {
    session.abortTransaction();
    console.error("级联删除失败，已回滚:", err);
    throw err;
  } finally {
    session.endSession();
  }
}
\`\`\`

**用 change stream 实现异步级联**：

\`\`\`javascript
// 监听 users 集合的删除事件，异步清理关联数据
const changeStream = db.users.watch([
  { \$match: { operationType: "delete" } }
]);

changeStream.on("change", async (event) => {
  const userId = event.documentKey._id;
  console.log(\`用户 \${userId} 被删除，开始清理关联数据\`);

  await db.posts.deleteMany({ authorId: userId });
  await db.comments.deleteMany({ userId });
  console.log(\`用户 \${userId} 关联数据已清理\`);
});
\`\`\`

> **心法**：MongoDB 的级联删除要**在应用层实现**，要么用**事务保证原子性**（强一致），要么用 **change stream 异步清理**（最终一致）。事务适合小批量，change stream 适合解耦场景。

## 6.9 软删除模式（soft delete）

直接删除数据风险太大——删错了无法恢复。**软删除**用"标记"代替"真删"，数据还在，只是查询时过滤掉。

\`\`\`javascript
// 硬删除：数据真的没了
db.users.deleteOne({ _id: 1 });

// 软删除：标记为已删除，数据还在
db.users.updateOne(
  { _id: 1 },
  {
    \$set: {
      deletedAt: new Date(),
      deletedBy: "admin",
      deleteReason: "用户主动注销"
    }
  }
);

// 查询时过滤已删除
db.users.find({ deletedAt: { \$exists: false } });

// 用 partial index 让软删除查询走索引
db.users.createIndex(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: { \$exists: false } }
  }
);
// 这样已删除用户的 email 可以被重新注册
\`\`\`

**软删除的封装**：

\`\`\`javascript
// 封装一个软删除的工具函数
async function softDelete(collection, filter, operator = "system") {
  return await collection.updateMany(filter, {
    \$set: {
      deletedAt: new Date(),
      deletedBy: operator
    }
  });
}

// 封装"只查未删除"的查询
async function findActive(collection, filter = {}, options = {}) {
  return await collection.find(
    { ...filter, deletedAt: { \$exists: false } },
    options
  ).toArray();
}

// 使用
await softDelete(users, { _id: userId }, "admin");
const activeUsers = await findActive(users, { age: { \$gt: 18 } });
\`\`\`

**定期清理过期软删除**：

\`\`\`javascript
// 30 天前的软删除数据，定时真删
db.users.deleteMany({
  deletedAt: { \$lt: ISODate("2024-01-01") }
});
\`\`\`

**软删除 vs 硬删除对比**：

| 维度 | 硬删除 | 软删除 |
| --- | --- | --- |
| **可恢复** | ❌ 不可恢复 | ✅ 可恢复 |
| **审计** | ❌ 无痕迹 | ✅ 有删除时间、操作人 |
| **查询性能** | ✅ 数据少，快 | ❌ 数据多，需过滤 |
| **存储成本** | ✅ 不占空间 | ❌ 占用空间 |
| **关联数据** | ❌ 容易悬空 | ✅ 引用仍有效 |
| **实现复杂度** | ✅ 简单 | ❌ 每个查询都要加过滤 |

> **心法**：**重要数据**（用户、订单、支付）用**软删除**，**日志类数据**用**硬删除**定期清理。软删除配合 \`partialFilterExpression\` 索引，能让已删除数据不干扰唯一约束。

## 6.10 删除的常见陷阱

### 陷阱一：删除条件写错

\`\`\`javascript
// ❌ 想删 name="张三"，但写成了查询 name 字段存在
db.users.deleteOne({ name: { \$exists: true } });   // 删了第一个有 name 的！

// ❌ 想删一个用户，结果忘了写条件
db.users.deleteOne({});   // 删了第一个用户！

// ✅ 正确：条件写明确
db.users.deleteOne({ _id: ObjectId("...") });
\`\`\`

### 陷阱二：删除数组元素不生效

\`\`\`javascript
// 删除文档中的数组元素，要用 \$pull，不是 delete
db.posts.updateOne(
  { _id: 1 },
  { \$pull: { tags: "obsolete" } }    // 从 tags 数组中删除 "obsolete"
);

// ❌ 不是这样
db.posts.deleteOne({ _id: 1, tags: "obsolete" });   // 这会删整个文档！
\`\`\`

### 陷阱三：删除后 count 不对

\`\`\`javascript
// 删除后立即 count，可能因为延迟不一致
db.users.deleteMany({ status: "inactive" });
const count = db.users.count();   // 可能还是旧值

// 用 countDocuments 更准确（但有性能开销）
const accurateCount = db.users.countDocuments({});
\`\`\`

### 陷阱四：删除不触发验证器

\`\`\`javascript
// validator 只在插入/更新时生效，删除时不校验
db.createCollection("users", {
  validator: { age: { \$gte: 0 } }
});
// 删除不受 validator 影响
db.users.deleteMany({});   // 正常执行
\`\`\`

> **踩坑**：删除操作**不受 validator 影响**，所以不能用 validator 阻止删除。要限制删除，得用**数据库角色权限**控制。

## 6.11 本章小结

本章你掌握了：

- \`deleteOne\` 删单条、\`deleteMany\` 删多条、\`deleteMany({})\` 清空集合
- **删除前先 find 确认**的安全生产习惯
- \`findOneAndDelete\` 删除并返回文档，适合队列消费（原子操作）
- 删除的 \`writeConcern\` 配置：\`w\`/\`j\`/\`wtimeout\`
- \`deleteMany({})\` vs \`drop()\`：前者保留索引，后者更快且释放空间
- 老 API \`remove()\` 和 \`justOne\` 参数（新项目用 \`deleteOne\`/\`deleteMany\`）
- 删除**不释放磁盘空间**，需 \`compact\` 或 \`drop\` 回收
- 大批量删除要**分批**（\`deleteMany\` 不支持 \`limit\`）
- **级联删除**在应用层实现：事务（强一致）或 change stream（最终一致）
- **软删除模式**：用 \`deletedAt\` 标记代替真删，配合 \`partialFilterExpression\` 索引
- 常见陷阱：条件写错、数组元素删除用 \`\$pull\`、count 延迟、validator 不拦截删除

下一章我们学习**投影与排序**——精简查询结果、按需排序。`
  },

  // =========================================================
  // 第七章：投影与排序
  // =========================================================
  {
    id: "mongo-ch07",
    group: "第二部分 查询进阶与删除",
    icon: "📊",
    title: "第 7 章 投影与排序",
    content: `# 第 7 章 投影与排序

> "查得准是基础，查得精是功夫。排序对了，数据才有意义。"

查询返回的文档可能很大，但你往往只需要几个字段。**投影**让你只取需要的字段，**排序**让结果按你的意愿排列。本章讲透这两个核心能力，并深入讲解排序与索引、内存限制的关系。

## 7.1 投影（projection）基础

投影决定查询返回哪些字段，类似 SQL 的 \`SELECT a, b\`。投影有两个方向：**包含**（inclusion）和**排除**（exclusion）。

\`\`\`javascript
// 只返回 name 和 age（_id 默认返回）
db.users.find({}, { name: 1, age: 1 });
// 返回：{ _id: ObjectId(...), name: "张三", age: 28 }

// 排除字段（返回除 address 外的所有字段）
db.users.find({}, { address: 0 });
// 返回：{ _id, name, age, email, ... }（不含 address）

// 排除 _id（唯一可以和包含混用的例外）
db.users.find({}, { name: 1, age: 1, _id: 0 });
// 返回：{ name: "张三", age: 28 }
\`\`\`

**投影规则一览**：

| 写法 | 含义 | 示例 |
| --- | --- | --- |
| \`{ field: 1 }\` | 包含该字段 | \`{ name: 1 }\` 只返回 name |
| \`{ field: 0 }\` | 排除该字段 | \`{ password: 0 }\` 不返回 password |
| \`{ field: 1, _id: 0 }\` | 包含 field，排除 _id | 唯一可以混用的情况 |
| \`{ "a.b": 1 }\` | 包含嵌套字段 | 只返回 a 对象里的 b |

> **踩坑**：**不能混用包含和排除**（除 \`_id\` 外）！\`{ name: 1, age: 0 }\` 会报错。要么全用 \`1\`（包含），要么全用 \`0\`（排除）。

## 7.2 嵌套文档与数组投影

\`\`\`javascript
// 投影嵌套文档的字段（用点号）
db.users.find({}, { "address.city": 1, name: 1 });
// 返回：{ _id: ..., name: "张三", address: { city: "北京" } }

// 投影数组里的元素（用下标）
db.posts.find({}, { "comments.0.author": 1 });
// 只返回第一条评论的 author

// 投影数组中匹配的元素（用 $ 操作符）
db.posts.find(
  { "comments.score": { \$gte: 8 } },
  { "comments.\$": 1 }
);
// 只返回第一个 score >= 8 的评论
\`\`\`

**\$elemMatch 投影**：

\`\`\`javascript
// 文档：{ _id: 1, results: [82, 85, 88] }
// 只返回数组中第一个 >= 85 的元素
db.students.find(
  { results: { \$gte: 85 } },
  { results: { \$elemMatch: { \$gte: 85 } } }
);
// 返回：{ _id: 1, results: [85] }
\`\`\`

## 7.3 \$slice 投影数组

\`\$slice\` 用于在投影中**截取数组的一部分**，类似 JS 的 \`slice\`。

\`\`\`javascript
// 文档：{ _id: 1, scores: [60, 70, 80, 90, 100] }

// 取前 2 个
db.students.find({}, { scores: { \$slice: 2 } });
// 返回：{ _id: 1, scores: [60, 70] }

// 取后 2 个（负数表示从后往前）
db.students.find({}, { scores: { \$slice: -2 } });
// 返回：{ _id: 1, scores: [90, 100] }

// 跳过 1 个，取 2 个
db.students.find({}, { scores: { \$slice: [1, 2] } });
// 返回：{ _id: 1, scores: [70, 80] }

// 跳过后 2 个，取 2 个（从倒数第 2 开始）
db.students.find({}, { scores: { \$slice: [-2, 2] } });
// 返回：{ _id: 1, scores: [90, 100] }
\`\`\`

**\`\$slice\` 的参数格式**：

| 写法 | 含义 |
| --- | --- |
| \`{ field: { \$slice: n } }\` | n>0 取前 n 个，n<0 取后 \|n\| 个 |
| \`{ field: { \$slice: [skip, limit] } }\` | 跳过 skip 个，取 limit 个 |

> **心法**：\`\$slice\` 是**唯一能和包含/排除混用**的投影操作符。例如 \`{ scores: { \$slice: 2 }, name: 1 }\` 合法。\`\$slice\` 适合"只看评论的前 5 条"这种场景。

## 7.4 投影的性能好处

\`\`\`javascript
// ❌ 返回完整文档（浪费网络带宽和序列化时间）
db.users.find({ active: true });

// ✅ 只返回需要的字段（减少传输量）
db.users.find({ active: true }, { name: 1, email: 1, _id: 0 });
\`\`\`

**实测对比**（假设文档平均 2KB，共 10000 条）：

| 投影方式 | 返回数据量 | 耗时 |
| --- | --- | --- |
| 不投影 | ~20MB | ~800ms |
| 投影 3 个字段 | ~3MB | ~200ms |
| 只返回 _id | ~500KB | ~80ms |

**覆盖查询（covered query）**：

\`\`\`javascript
// 建复合索引
db.users.createIndex({ name: 1, age: 1 });

// 查询和投影都只用了索引字段
db.users.find(
  { name: "张三" },
  { name: 1, age: 1, _id: 0 }
);
// 这个查询可以直接从索引取数据，不用回表！极快
\`\`\`

> **心法**：**永远只查需要的字段**。当查询条件和投影字段都在同一个索引上时，MongoDB 可以走**覆盖查询**，直接从索引返回结果，根本不用访问文档——这是最快的查询方式。

## 7.5 sort 排序基础

\`\`\`javascript
// 升序（1）
db.users.find().sort({ age: 1 });

// 降序（-1）
db.users.find().sort({ age: -1 });

// 配合查询和投影
db.users
  .find({ active: true }, { name: 1, age: 1 })
  .sort({ age: -1 });
\`\`\`

**Node.js 驱动**：

\`\`\`javascript
const docs = await users
  .find({ active: true })
  .sort({ age: -1 })
  .limit(10)
  .toArray();
\`\`\`

> **心法**：\`sort\` 要放在 \`find\` 之后、\`limit\` 之前。链式调用顺序：\`find\` → \`sort\` → \`skip\` → \`limit\`。这个顺序和"逻辑顺序"一致：先查、再排、再跳、再取。

## 7.6 多字段排序

\`\`\`javascript
// 先按 age 降序，age 相同再按 name 升序
db.users.find().sort({ age: -1, name: 1 });

// 实战：按部门升序、薪资降序排员工
db.employees.find().sort({ department: 1, salary: -1 });

// 三字段排序：部门 → 职级 → 入职时间
db.employees.find().sort({
  department: 1,
  level: -1,
  hireDate: 1
});
\`\`\`

**排序的字段顺序很重要**：

\`\`\`javascript
// 这两个排序结果不同！
db.users.find().sort({ age: -1, name: 1 });  // 先 age 后 name
db.users.find().sort({ name: 1, age: -1 });  // 先 name 后 age
\`\`\`

**按 _id 排序近似按时间排序**：

\`\`\`javascript
// ObjectId 内含时间戳，按 _id 排序近似按创建时间排序
db.users.find().sort({ _id: -1 });   // 最新的在前
db.users.find().sort({ _id: 1 });    // 最旧的在前
\`\`\`

> **心法**：多字段排序时，**字段顺序就是优先级**。第一个字段相同才比第二个，以此类推。用 \`_id\` 排序是"按创建时间"的廉价替代方案——ObjectId 自带时间戳。

## 7.7 排序与索引

排序最大的性能优化就是**走索引**。如果排序字段有合适的索引，MongoDB 可以直接按索引顺序读取，**不需要在内存里排序**。

\`\`\`javascript
// 建索引
db.users.createIndex({ age: -1 });

// 排序走索引，不占内存
db.users.find().sort({ age: -1 });
\`\`\`

**排序与索引的关系**：

| 场景 | 是否用索引排序 |
| --- | --- |
| \`sort({ a: 1 })\` + 有 \`{ a: 1 }\` 索引 | ✅ 索引排序 |
| \`sort({ a: 1 })\` + 有 \`{ a: -1 }\` 索引 | ✅ 索引反向扫描 |
| \`sort({ a: 1, b: 1 })\` + 有 \`{ a: 1, b: 1 }\` 索引 | ✅ 索引排序 |
| \`sort({ a: 1, b: 1 })\` + 有 \`{ a: 1 }\` 索引 | ❌ 内存排序 |
| \`sort({ a: 1, b: -1 })\` + 有 \`{ a: 1, b: 1 }\` 索引 | ❌ 内存排序（方向不一致） |
| \`sort({ b: 1 })\` + 有 \`{ a: 1, b: 1 }\` 索引 | ❌ 内存排序（跳过了前缀 a） |

**复合索引排序的规则**：

\`\`\`javascript
// 索引：{ a: 1, b: 1, c: 1 }

// ✅ 能用索引的排序
sort({ a: 1 })                  // 前缀
sort({ a: 1, b: 1 })            // 前缀
sort({ a: 1, b: 1, c: 1 })      // 完整匹配
sort({ a: -1, b: -1, c: -1 })   // 全部反向

// ❌ 不能用索引的排序
sort({ b: 1 })                  // 跳过 a
sort({ a: 1, c: 1 })            // 跳过 b
sort({ a: 1, b: -1 })           // 方向不一致
\`\`\`

> **心法**：**排序字段要建复合索引，且方向（1/-1）要和 sort 一致**。索引前缀规则同样适用——不能跳过中间字段排序。要么全升序，要么全降序，才能复用同一个索引。

## 7.8 排序的内存限制

MongoDB 默认**排序使用 32MB 内存**，超过会报错：

\`\`\`
QueryExceededMemoryLimitError: Sort operation used more than 33554432 bytes
\`\`\`

### 解决方案一：加索引

\`\`\`javascript
// 为排序字段建索引
db.users.createIndex({ age: -1 });

// 现在排序走索引，不占内存
db.users.find().sort({ age: -1 });
\`\`\`

### 解决方案二：允许使用磁盘

\`\`\`javascript
// 允许排序溢出到磁盘（慢但不报错）
db.users.find().sort({ bigField: 1 }).allowDiskUse(true);

// Node.js 驱动
const docs = await users
  .find({})
  .sort({ bigField: 1 })
  .allowDiskUse(true)
  .toArray();
\`\`\`

### 解决方案三：配合 limit 减少排序量

\`\`\`javascript
// 只要前 10 条，配合 limit 优化
db.users.find().sort({ score: -1 }).limit(10);
// MongoDB 知道只要 10 条，会用 top-K 排序，内存占用小
\`\`\`

> **踩坑**：\`allowDiskUse\` 在 4.4+ 才支持 \`find()\` 排序，之前只能在 \`aggregate\` 中用。如果排序频繁超内存，**根本解法是加索引**，\`allowDiskUse\` 只是临时方案。

## 7.9 natural order 与 $natural

MongoDB 文档的**自然顺序**（natural order）是数据在磁盘上的物理顺序，通常是插入顺序（但不保证）。

\`\`\`javascript
// 按 $natural 排序（按磁盘物理顺序）
db.users.find().sort({ \$natural: 1 });    // 正向
db.users.find().sort({ \$natural: -1 });   // 反向

// 实战：快速取最后插入的几条（不严格保证顺序）
db.users.find().sort({ \$natural: -1 }).limit(5);
\`\`\`

**\`\$natural\` vs \`_id\` 排序**：

| 维度 | \`{ \$natural: 1 }\` | \`{ _id: 1 }\` |
| --- | --- | --- |
| **依据** | 磁盘物理顺序 | ObjectId 时间戳 |
| **是否有序** | 不保证 | 严格有序 |
| **能用索引** | ❌ 不能 | ✅ 能 |
| **实战** | 几乎不用 | 推荐用 _id 代替 |

> **心法**：**不要依赖 \$natural**！它不保证顺序，且无法用索引优化。要"按时间排序"，老老实实加个 \`createdAt\` 字段并建索引。

## 7.10 排序的稳定性与 tiebreaker

MongoDB 的排序**不保证稳定**——当排序字段值相同时，文档顺序可能任意。这会导致分页时数据重复或丢失。

\`\`\`javascript
// ❌ 危险：如果多个用户 age 相同，分页可能重复或遗漏
db.users.find().sort({ age: -1 }).skip(10).limit(10);
// 第一页最后一条 age=25，第二页可能跳过某些 age=25 的

// ✅ 解决：加 _id 作为 tiebreaker，保证唯一排序
db.users.find().sort({ age: -1, _id: 1 }).skip(10).limit(10);
\`\`\`

**实战场景**：分页排序时，**最后一个排序字段必须是唯一字段**（通常用 \`_id\`），否则分页结果不稳定。

> **踩坑**：分页查询的 \`sort\` **必须包含唯一字段**作为最后一项！否则相同值的文档在分页时可能重复出现或被跳过。

## 7.11 本章小结

本章你掌握了：

- 投影基础：\`{ field: 1 }\` 包含、\`{ field: 0 }\` 排除，**不能混用**（除 \`_id\`）
- 嵌套文档投影：\`"address.city": 1\`
- 数组投影：\`"comments.0.author"\`、\`"comments.\$"\`、\`\$elemMatch\`
- \`\$slice\` 截取数组：\`{ \$slice: n }\` 或 \`{ \$slice: [skip, limit] }\`
- **覆盖查询**：查询和投影都只用索引字段，直接从索引返回
- \`sort\` 排序：\`1\` 升序、\`-1\` 降序，链式顺序 \`find → sort → skip → limit\`
- 多字段排序：字段顺序即优先级
- **排序走索引的条件**：字段顺序和方向都要匹配，且是索引前缀
- 排序 32MB 内存限制：加索引（推荐）或 \`allowDiskUse(true)\`
- \`\$natural\` 不保证顺序，用 \`_id\` 代替
- **分页排序必须加唯一字段**（\`_id\`）作为 tiebreaker

下一章我们学习**分页查询**——大数据量下的翻页技巧。`
  },

  // =========================================================
  // 第八章：分页查询
  // =========================================================
  {
    id: "mongo-ch08",
    group: "第二部分 查询进阶与删除",
    icon: "📃",
    title: "第 8 章 分页查询",
    content: `# 第 8 章 分页查询

> "前 10 页很快，第 1000 页卡死——这是深分页的经典噩梦。"

任何列表页面都需要分页。MongoDB 的 \`limit\` + \`skip\` 是最直观的分页方式，但在数据量大时会遇到严重的性能问题。本章讲透分页的全部方案，并对比它们各自的适用场景。

## 8.1 limit 与 skip 基础

\`\`\`javascript
// 每页 10 条，取第 1 页
db.users.find().limit(10);

// 第 2 页（跳过 10 条）
db.users.find().skip(10).limit(10);

// 第 3 页
db.users.find().skip(20).limit(10);

// 通用公式：skip = (page - 1) * pageSize
const page = 3;
const pageSize = 10;
db.users.find().skip((page - 1) * pageSize).limit(pageSize);
\`\`\`

**配合排序**：

\`\`\`javascript
// 按时间倒序，每页 10 条
db.users
  .find({})
  .sort({ createdAt: -1 })
  .skip(20)
  .limit(10);
\`\`\`

**Node.js 驱动封装**：

\`\`\`javascript
async function getPage(page, pageSize, filter = {}) {
  const skip = (page - 1) * pageSize;
  const docs = await users
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .toArray();

  const total = await users.countDocuments(filter);
  return {
    docs,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize)
  };
}

// 使用
const result = await getPage(3, 10, { active: true });
console.log(\`第 \${result.page} 页，共 \${result.totalPages} 页\`);
\`\`\`

> **心法**：\`skip\` + \`limit\` 简单直观，适合**小数据量**（几百条）。数据量一大就出问题——\`skip\` 的本质是"扫描并丢弃"。

## 8.2 深分页的性能问题

\`skip\` 的本质是**扫描并丢弃**前 N 条文档。\`skip(100000)\` 要先扫描 10 万条再丢弃，极慢。

\`\`\`javascript
// 第 1 页：快（skip 0）
db.users.find().skip(0).limit(10);    // ~5ms

// 第 1000 页：慢（skip 9990）
db.users.find().skip(9990).limit(10);  // ~50ms

// 第 10000 页：极慢（skip 99990）
db.users.find().skip(99990).limit(10); // ~500ms

// 第 100000 页：卡死（skip 999990）
db.users.find().skip(999990).limit(10); // ~5s
\`\`\`

**为什么会慢？**

MongoDB 必须**逐条扫描**前 N 条文档才能跳过它们，即使有索引也要遍历索引树。\`skip\` 的时间复杂度是 O(N)。

**实测对比**（10 万条数据，有索引）：

| skip 值 | 耗时 | 说明 |
| --- | --- | --- |
| 0 | 2ms | 第一页，秒回 |
| 1000 | 8ms | 还行 |
| 10000 | 80ms | 开始变慢 |
| 50000 | 400ms | 明显卡 |
| 100000 | 800ms | 用户体验差 |

> **踩坑**：**永远不要在生产环境用大 skip 分页**！超过 \`skip(10000)\` 就该考虑换方案。MongoDB 的 \`skip\` 没有"跳到第 N 条"的快捷方式，只能逐条扫描。

## 8.3 游标分页（cursor-based pagination）

游标分页的核心思想：**记住上一页最后一条的某个标记值，下一页从该值之后查**。每页都是 O(pageSize)，无论翻到第几页都一样快。

### 基于时间戳的游标分页

\`\`\`javascript
// 假设按 createdAt 降序排列

// 第 1 页
const page1 = await users
  .find({})
  .sort({ createdAt: -1 })
  .limit(10)
  .toArray();

// 记住最后一条的 createdAt
const lastCreatedAt = page1[page1.length - 1].createdAt;

// 第 2 页：查 createdAt < 上一页最后一条的
const page2 = await users
  .find({ createdAt: { \$lt: lastCreatedAt } })
  .sort({ createdAt: -1 })
  .limit(10)
  .toArray();
\`\`\`

**通用函数**：

\`\`\`javascript
async function getCursorPage(cursor, pageSize) {
  const query = cursor
    ? { createdAt: { \$lt: cursor } }
    : {};

  const docs = await users
    .find(query)
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .toArray();

  // 返回新游标
  const newCursor = docs.length > 0
    ? docs[docs.length - 1].createdAt
    : null;

  return { docs, cursor: newCursor };
}

// 使用
const page1 = await getCursorPage(null, 10);
const page2 = await getCursorPage(page1.cursor, 10);
const page3 = await getCursorPage(page2.cursor, 10);
\`\`\`

> **优势**：游标分页**每页都是 O(pageSize)**，无论翻到第几页都一样快！适合无限滚动、时间线 feed。

## 8.4 基于 _id 的游标分页（keyset pagination）

keyset 分页是游标分页的变体，用**主键或唯一键**作为游标。\`_id\`（ObjectId）自带时间戳，天然有序。

\`\`\`javascript
// 用 _id 作为游标（ObjectId 含时间戳，近似有序）

// 第 1 页
const page1 = await users
  .find({})
  .sort({ _id: -1 })    // 按 _id 降序
  .limit(10)
  .toArray();

const lastId = page1[page1.length - 1]._id;

// 第 2 页：查 _id < 上一页最后的
const page2 = await users
  .find({ _id: { \$lt: lastId } })
  .sort({ _id: -1 })
  .limit(10)
  .toArray();
\`\`\`

**通用函数**：

\`\`\`javascript
async function getKeysetPage(cursorId, pageSize) {
  const query = cursorId
    ? { _id: { \$lt: cursorId } }
    : {};

  const docs = await users
    .find(query)
    .sort({ _id: -1 })
    .limit(pageSize)
    .toArray();

  const newCursor = docs.length > 0
    ? docs[docs.length - 1]._id
    : null;

  return { docs, cursor: newCursor };
}
\`\`\`

> **心法**：用 \`_id\` 作游标的好处是**不用额外加 createdAt 字段**，\`_id\` 自带索引，性能极佳。但**ObjectId 只精确到秒**，同一秒内插入的顺序不严格保证。

## 8.5 复合排序的游标分页

复合排序时，游标需要多个字段。这是 keyset 分页最复杂的部分。

\`\`\`javascript
// 按 (department, salary) 排序，先部门升序、再薪资降序

async function getKeysetPage(lastDept, lastSalary, pageSize) {
  let query = {};
  if (lastDept) {
    query = {
      \$or: [
        // 情况一：部门更靠后
        { department: { \$gt: lastDept } },
        // 情况二：部门相同，薪资更小（因为是降序）
        { department: lastDept, salary: { \$lt: lastSalary } }
      ]
    };
  }

  return await employees
    .find(query)
    .sort({ department: 1, salary: -1 })
    .limit(pageSize)
    .toArray();
}
\`\`\`

**更严谨的做法：加 _id 作为 tiebreaker**

\`\`\`javascript
// 排序：{ department: 1, salary: -1, _id: 1 }
// 游标：(lastDept, lastSalary, lastId)

async function getKeysetPageStrict(cursor, pageSize) {
  let query = {};
  if (cursor) {
    const { dept, salary, id } = cursor;
    query = {
      \$or: [
        { department: { \$gt: dept } },
        { department: dept, salary: { \$lt: salary } },
        { department: dept, salary: salary, _id: { \$gt: id } }
      ]
    };
  }

  const docs = await employees
    .find(query)
    .sort({ department: 1, salary: -1, _id: 1 })
    .limit(pageSize)
    .toArray();

  if (docs.length === 0) return { docs, cursor: null };

  const last = docs[docs.length - 1];
  return {
    docs,
    cursor: { dept: last.department, salary: last.salary, id: last._id }
  };
}
\`\`\`

> **心法**：复合排序的游标分页必须**包含唯一字段**（\`_id\`）作为最后一项，否则相同值的文档会漏掉或重复。游标值要序列化成字符串传给前端（如 base64 编码 JSON）。

## 8.6 offset 分页 vs 游标分页对比

| 方案 | 性能 | 复杂度 | 支持跳页 | 实时性 | 适用场景 |
| --- | --- | --- | --- | --- | --- |
| \`skip\` + \`limit\` | 慢（深页 O(N)） | 简单 | ✅ | 中等 | 小数据量、需要跳页 |
| 游标分页（时间戳） | 快（每页 O(1)） | 中等 | ❌ | 高 | 时间线、无限滚动 |
| keyset 分页（_id） | 快 | 中等 | ❌ | 高 | 大数据量、稳定排序 |
| 复合 keyset | 快 | 复杂 | ❌ | 高 | 复杂排序、大数据量 |

**何时必须用 skip 分页**：

1. 产品要求"跳到第 N 页"（如论坛翻页）
2. 数据量小（< 1 万条）
3. 后台管理界面，可以接受慢一点

**何时该用游标分页**：

1. 无限滚动（移动端 feed 流）
2. 数据量超 10 万
3. 不需要跳页，只能"上一页/下一页"
4. 实时性要求高（新数据插入不影响当前页）

> **踩坑**：游标/keyset 分页**不支持跳页**（不能直接跳到第 50 页）。如果你的产品必须支持"跳到第 N 页"，只能用 \`skip\`——但要**限制最大页数**（如最多翻到第 100 页）。

## 8.7 估算总数（避免 count 性能问题）

分页通常要显示"共 N 条"，但 \`countDocuments\` 在大数据量下很慢。三种计数方式各有取舍：

\`\`\`javascript
// 方式一：countDocuments（精确，但慢）
const total = await users.countDocuments({ active: true });
// 会扫描所有匹配文档，100 万条要几秒

// 方式二：estimatedDocumentCount（极快，但不精确）
const estTotal = await users.estimatedDocumentCount();
// 基于集合元数据，几乎是 O(1)
// 但只能统计整个集合，不能带查询条件

// 方式三：limit + skip 估算（折中）
const sample = await users
  .find({ active: true })
  .limit(pageSize * 100 + 1)    // 最多取 100 页 + 1 条
  .toArray();
const hasMore = sample.length > pageSize * 100;
\`\`\`

**三种计数方式对比**：

| 方式 | 速度 | 精确度 | 支持查询条件 |
| --- | --- | --- | --- |
| \`countDocuments(filter)\` | 慢 | ✅ 精确 | ✅ |
| \`estimatedDocumentCount()\` | 极快 | ❌ 不精确 | ❌ 只能整个集合 |
| \`count\`（已废弃） | 中等 | 中等 | ✅ |

> **心法**：**别在大数据量下用 \`countDocuments\`**！前端展示"共 N 条"时，可以用 \`estimatedDocumentCount\` 估算，或者干脆只显示"上一页/下一页"不显示总数。

## 8.8 实战：完整的分页 API

\`\`\`javascript
// 综合方案：小数据量用 skip，大数据量用游标
async function paginate({
  filter = {},
  sort = { _id: -1 },
  page = 1,
  pageSize = 10,
  cursor = null,
  useCursor = false
}) {
  if (useCursor) {
    // 游标分页模式
    let query = { ...filter };
    if (cursor) {
      // 假设按 _id 降序
      query._id = { \$lt: cursor };
    }
    const docs = await collection
      .find(query)
      .sort(sort)
      .limit(pageSize)
      .toArray();

    return {
      docs,
      nextCursor: docs.length === pageSize
        ? docs[docs.length - 1]._id
        : null,
      hasMore: docs.length === pageSize
    };
  } else {
    // offset 分页模式
    const skip = (page - 1) * pageSize;
    const docs = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .toArray();

    // 只在前 10 页才查总数（避免深分页 count 慢）
    let total = null;
    if (page <= 10) {
      total = await collection.countDocuments(filter);
    }

    return {
      docs,
      page,
      pageSize,
      total,
      hasMore: docs.length === pageSize
    };
  }
}
\`\`\`

> **心法**：生产环境的分页 API 要**混合使用**：前几页用 skip（支持跳页），超过一定深度后切换游标模式。总数只在浅页时计算，深页只显示"还有更多"。

## 8.9 分页的常见陷阱

### 陷阱一：游标值重复导致漏数据

\`\`\`javascript
// ❌ 危险：createdAt 可能重复
const cursor = lastDoc.createdAt;
db.users.find({ createdAt: { \$lt: cursor } });
// 如果有多个文档 createdAt 相同，会漏掉

// ✅ 解决：加 _id 作为 tiebreaker
const query = {
  \$or: [
    { createdAt: { \$lt: lastDoc.createdAt } },
    { createdAt: lastDoc.createdAt, _id: { \$lt: lastDoc._id } }
  ]
};
\`\`\`

### 陷阱二：排序不稳定导致分页重复

\`\`\`javascript
// ❌ 危险：sort 不含唯一字段
db.users.find().sort({ age: -1 }).skip(10).limit(10);

// ✅ 解决：sort 加 _id
db.users.find().sort({ age: -1, _id: 1 }).skip(10).limit(10);
\`\`\`

### 陷阱三：实时数据导致分页错位

\`\`\`javascript
// 用户在第 1 页看的时候，有人插入了新数据
// 用户翻到第 2 页时，由于数据整体后移，第 1 页的最后一条会出现在第 2 页开头
// 这是 offset 分页的固有问题，游标分页能缓解
\`\`\`

> **踩坑**：offset 分页在**实时数据流**下会错位（重复或遗漏）。如果你的数据频繁插入/删除，优先用游标分页。

## 8.10 本章小结

本章你掌握了：

- \`skip\` + \`limit\` 基础分页，适合小数据量（< 1 万条）
- **深分页的性能问题**：\`skip(N)\` 要扫描 N 条，O(N) 复杂度
- **游标分页**：记住上一页最后的值，下一页从该值之后查，每页 O(pageSize)
- 基于 \`_id\` 的 keyset 分页：ObjectId 自带时间戳和索引
- **复合排序的游标分页**：必须加 \`_id\` 作为 tiebreaker
- offset vs 游标分页对比：跳页用 skip、时间线用游标、大数据用 keyset
- 三种计数方式：\`countDocuments\`（精确慢）、\`estimatedDocumentCount\`（快不准）、估算
- 实战方案：浅页用 skip + count，深页切换游标模式
- 常见陷阱：游标值重复、排序不稳定、实时数据错位

下一章我们学习**查询进阶**——正则、表达式、地理空间查询。`
  },

  // =========================================================
  // 第九章：查询进阶
  // =========================================================
  {
    id: "mongo-ch09",
    group: "第二部分 查询进阶与删除",
    icon: "🔬",
    title: "第 9 章 查询进阶",
    content: `# 第 9 章 查询进阶

> "基础查询搞定 80% 的需求，剩下 20% 靠进阶语法——而那 20% 往往是最关键的部分。"

前几章学了 \`find\` 的基础语法，本章补充正则匹配、表达式查询、地理空间查询、全文搜索、JSON Schema 校验等进阶能力，帮你应对复杂场景。同时深入讲解类型强制转换、null 处理等容易踩坑的地方。

## 9.1 $regex 正则匹配

\`\`\`javascript
// 查 name 以"张"开头的
db.users.find({ name: { \$regex: "^张" } });

// 简写（直接写正则字面量）
db.users.find({ name: /^张/ });

// 不区分大小写
db.users.find({ name: { \$regex: /alice/i } });

// 包含"张"或"李"
db.users.find({ name: { \$regex: /张|李/ } });

// 用 $options 指定选项
db.users.find({
  name: { \$regex: "alice", \$options: "i" }
});
\`\`\`

**\`\$options\` 选项详解**：

| 选项 | 含义 | 示例 |
| --- | --- | --- |
| \`i\` | 忽略大小写 | \`/abc/i\` 匹配 "ABC" |
| \`m\` | 多行模式（^ 和 \$ 匹配每行） | \`/^abc/m\` |
| \`s\` | 单行模式（. 匹配换行符） | \`/a.b/s\` |
| \`x\` | 忽略模式中的空白 | 提升可读性 |

**正则与索引**：

\`\`\`javascript
// ✅ 前缀匹配能用索引
db.users.find({ name: /^张/ });           // 走索引
db.users.find({ name: { \$regex: "^张" } });  // 走索引

// ❌ 非前缀匹配不能用索引
db.users.find({ name: /张\$/ });           // 不走索引（结尾匹配）
db.users.find({ name: /张/ });            // 不走索引（包含）
db.users.find({ name: { \$regex: "张" } }); // 不走索引
\`\`\`

> **踩坑**：\`\$regex\` **只有前缀匹配（\`^xxx\`）能高效用索引**，其他形式会全表扫描。大量数据的正则查询会很慢，考虑用**全文索引**替代。

## 9.2 $text 全文搜索

MongoDB 内置全文索引，支持分词搜索（但中文分词支持有限）。

\`\`\`javascript
// 建全文索引
db.articles.createIndex({ title: "text", content: "text" });

// 全文搜索
db.articles.find({ \$text: { \$search: "mongodb tutorial" } });

// 精确短语（用引号转义）
db.articles.find({ \$text: { \$search: "\\"MongoDB 教程\\"" } });

// 排除某个词（用减号）
db.articles.find({ \$text: { \$search: "mongodb -mysql" } });

// 多语言（建索引时指定）
db.articles.createIndex(
  { content: "text" },
  { default_language: "chinese" }
);
\`\`\`

**全文搜索的评分排序**：

\`\`\`javascript
// 按相关性评分排序
db.articles.find(
  { \$text: { \$search: "mongodb" } },
  { score: { \$meta: "textScore" } }
).sort({ score: { \$meta: "textScore" } });
\`\`\`

> **心法**：\`\$text\` 适合**英文内容**搜索，中文分词支持有限。生产环境的中文搜索通常用 Elasticsearch 或 MeiliSearch 配合 MongoDB 使用。

## 9.3 $where 查询（慎用）

\`\$where\` 允许用 JS 函数做查询条件，**极其灵活但极慢**（每条文档都执行 JS）。

\`\`\`javascript
// 用函数查询（不推荐，性能差）
db.users.find({
  \$where: function() {
    return this.age > 18 && this.name.length > 3;
  }
});

// 简写（字符串）
db.users.find({ \$where: "this.age > 18 && this.name.length > 3" });
\`\`\`

> **心法**：**永远别用 \`\$where\`**！它要为每条文档启动 JS 引擎执行，比正常查询慢 100 倍。能用 \`\$expr\` 替代就替代。\`\$where\` 只在所有其他方案都不行时才考虑。

## 9.4 $expr 表达式查询

\`\$expr\` 允许在查询中使用**聚合表达式**，比 \`\$where\` 高效得多。它能做"字段间比较"和"计算后比较"。

\`\`\`javascript
// 比较两个字段（普通查询做不到）
db.orders.find({
  \$expr: { \$gt: ["\$actualPrice", "\$budget"] }
});
// 查 actualPrice > budget 的订单

// 配合聚合运算符
db.sales.find({
  \$expr: {
    \$gte: [
      { \$multiply: ["\$price", "\$quantity"] },
      1000
    ]
  }
});
// 查 price * quantity >= 1000 的销售记录

// 比较同一年的数据
db.events.find({
  \$expr: {
    \$eq: [
      { \$year: "\$startDate" },
      { \$year: "\$endDate" }
    ]
  }
});

// 用 $cond 做条件判断
db.products.find({
  \$expr: {
    \$gt: [
      { \$cond: [{ \$lt: ["\$price", 100] }, "\$price", { \$multiply: ["\$price", 0.9] }] },
      50
    ]
  }
});
\`\`\`

**\`\$expr\` vs \`\$where\` 对比**：

| 维度 | \`\$expr\` | \`\$where\` |
| --- | --- | --- |
| **性能** | 快（C++ 实现） | 慢（JS 引擎） |
| **能用的运算符** | 聚合运算符 | 任意 JS |
| **能用索引** | 部分 | ❌ |
| **推荐度** | ✅ 推荐 | ❌ 避免 |

> **心法**：需要"字段间比较"或"计算后比较"时，用 \`\$expr\`。它是 \`\$where\` 的高效替代品。

## 9.5 $jsonSchema 校验查询

\`\$jsonSchema\` 可以查询"符合某个 JSON Schema 结构"的文档，也能用于集合的验证器。

\`\`\`javascript
// 查询符合某个 schema 的文档
db.users.find({
  \$jsonSchema: {
    bsonType: "object",
    required: ["name", "age"],
    properties: {
      name: { bsonType: "string" },
      age: { bsonType: "int", minimum: 0, maximum: 150 },
      email: { bsonType: "string", pattern: "^.+@.+$" }
    }
  }
});

// 反向：查不符合 schema 的（用 $nor）
db.users.find({
  \$nor: [{
    \$jsonSchema: {
      bsonType: "object",
      required: ["name", "email"]
    }
  }]
});
\`\`\`

**用于集合验证器**：

\`\`\`javascript
// 创建集合时加验证器
db.createCollection("users", {
  validator: {
    \$jsonSchema: {
      bsonType: "object",
      required: ["name", "age"],
      properties: {
        name: { bsonType: "string", description: "必填" },
        age: { bsonType: "int", minimum: 0, maximum: 150 },
        email: { bsonType: "string", pattern: "^.+@.+$" }
      }
    }
  }
});
\`\`\`

> **心法**：\`\$jsonSchema\` 既能**查询**（找符合结构的文档），也能**校验**（插入时检查结构）。适合数据治理场景。

## 9.6 $comment 添加查询注释

\`\$comment\` 给查询加注释，方便在日志和 \`db.currentOp()\` 中识别。

\`\`\`javascript
// 给查询加注释
db.users.find({
  age: { \$gt: 18 },
  \$comment: "查找成年用户-由用户管理模块调用"
});

// 在 currentOp 中看到注释
db.currentOp({
  "command.comment": { \$exists: true }
});

// 在慢查询日志中追踪
// 慢查询日志会显示 comment，方便定位是哪段业务代码
\`\`\`

> **心法**：复杂业务系统里，给关键查询加 \`\$comment\`，能在慢查询日志里快速定位是哪个模块、哪个功能慢。

## 9.7 $elemMatch 数组元素匹配深入

\`\$elemMatch\` 查询**数组中至少一个元素同时满足多个条件**。这是数组查询的核心难点。

**为什么要用 \`\$elemMatch\`**：

\`\`\`javascript
// 文档：
// { _id: 1, results: [{ subject: "数学", score: 85 }, { subject: "英语", score: 90 }] }

// ❌ 错误：这样查会匹配到错误结果
db.students.find({
  "results.subject": "数学",
  "results.score": { \$gt: 80 }
});
// 这个查询会匹配"数学是 85 分"的文档，
// 也会匹配"有数学 + 有任意 >80 分科目"的文档——条件可能落在不同元素上！

// ✅ 正确：用 $elemMatch 保证同一元素满足所有条件
db.students.find({
  results: {
    \$elemMatch: {
      subject: "数学",
      score: { \$gt: 80 }
    }
  }
});
\`\`\`

**\`\$elemMatch\` 的多种用法**：

\`\`\`javascript
// 单字段多条件
db.products.find({
  specs: {
    \$elemMatch: {
      name: "cpu",
      value: { \$gte: 3.0, \$lt: 4.0 }
    }
  }
});

// 嵌套数组
db.classes.find({
  students: {
    \$elemMatch: {
      age: { \$gte: 18 },
      grades: { \$elemMatch: { subject: "数学", score: { \$gt: 90 } } }
    }
  }
});
\`\`\`

> **复习**：**数组多条件查询永远用 \`\$elemMatch\`**，否则会匹配到错误结果。这是 MongoDB 查询最常见的坑之一。

## 9.8 $all 与 $size

\`\`\`javascript
// $all：包含所有指定元素（顺序无关）
db.posts.find({ tags: { \$all: ["mongo", "db"] } });
// tags 数组里同时有 "mongo" 和 "db" 就匹配

// $size：数组长度等于 3
db.posts.find({ tags: { \$size: 3 } });

// 注意：$size 不支持范围查询！
// ❌ db.posts.find({ tags: { \$size: { \$gt: 2 } } });  // 报错

// 替代方案一：加一个 tagsCount 字段
db.posts.find({ tagsCount: { \$gt: 2 } });

// 替代方案二：用 $expr 配合 $size
db.posts.find({
  \$expr: { \$gt: [{ \$size: "\$tags" }, 2] }
});
\`\`\`

> **踩坑**：\`\$size\` **不支持范围查询**（\`\$gt\`、\`\$lt\`）。要查"数组长度大于 3"，要么加冗余计数字段，要么用 \`\$expr: { \$gt: [{ \$size: "\$tags" }, 3] }\`。

## 9.9 地理空间查询

MongoDB 原生支持地理空间查询，适合"附近的餐厅""范围内的人"等场景。

### 建索引

\`\`\`javascript
// 2dsphere 索引（支持 GeoJSON 点/线/面，球面坐标）
db.places.createIndex({ location: "2dsphere" });

// 2d 索引（旧式，平面坐标，适合游戏地图）
db.places.createIndex({ location: "2d" });
\`\`\`

### 插入地理数据

\`\`\`javascript
// 插入一个点（GeoJSON 格式）
db.places.insertOne({
  name: "天安门",
  location: {
    type: "Point",
    coordinates: [116.397, 39.908]   // [经度, 纬度]
  }
});

// 插入一条线
db.routes.insertOne({
  name: "二环路",
  location: {
    type: "LineString",
    coordinates: [[116.35, 39.90], [116.40, 39.92], [116.45, 39.90]]
  }
});

// 插入一个多边形
db.areas.insertOne({
  name: "朝阳区",
  location: {
    type: "Polygon",
    coordinates: [[
      [116.40, 39.90],
      [116.50, 39.90],
      [116.50, 39.95],
      [116.40, 39.95],
      [116.40, 39.90]   // 首尾必须相同
    ]]
  }
});
\`\`\`

### \$near 查询附近

\`\`\`javascript
// 查距离某点 1000 米内的地点（按距离升序返回）
db.places.find({
  location: {
    \$near: {
      \$geometry: {
        type: "Point",
        coordinates: [116.397, 39.908]
      },
      \$maxDistance: 1000,    // 最大距离（米）
      \$minDistance: 0        // 最小距离（米）
    }
  }
}).limit(10);

// 2d 索引的写法（平面坐标）
db.places.find({
  location: { \$near: [116.397, 39.908], \$maxDistance: 0.01 }
});
\`\`\`

### \$geoWithin 查询范围内

\`\`\`javascript
// 查某多边形内的地点
db.places.find({
  location: {
    \$geoWithin: {
      \$geometry: {
        type: "Polygon",
        coordinates: [[
          [116.40, 39.90],
          [116.50, 39.90],
          [116.50, 39.95],
          [116.40, 39.95],
          [116.40, 39.90]
        ]]
      }
    }
  }
});

// 简化写法：\$box（矩形）
db.places.find({
  location: {
    \$geoWithin: {
      \$box: [[116.40, 39.90], [116.50, 39.95]]   // 左下角、右上角
    }
  }
});

// 简化写法：\$center（圆形）
db.places.find({
  location: {
    \$geoWithin: {
      \$center: [[116.40, 39.90], 0.05]   // 圆心、半径（度）
    }
  }
});
\`\`\`

### \$geoIntersects 查询相交

\`\`\`javascript
// 查与某区域相交的路线
db.routes.find({
  location: {
    \$geoIntersects: {
      \$geometry: {
        type: "Polygon",
        coordinates: [[...]]
      }
    }
  }
});
\`\`\`

> **心法**：地理查询**必须先建 2dsphere 索引**，否则报错。\`\$near\` 默认按距离升序返回，配合 \`limit\` 使用。\`\$maxDistance\` 单位是**米**（2dsphere）或**度**（2d）。

## 9.10 null 与缺失字段的处理

MongoDB 中 \`null\` 和"字段不存在"是两回事，但查询时容易混淆。

\`\`\`javascript
// 文档集合：
// { _id: 1, name: "张三", age: 28 }
// { _id: 2, name: "李四", age: null }      // age 显式为 null
// { _id: 3, name: "王五" }                  // 没有 age 字段

// 查 age == null：会匹配 _id=2 和 _id=3！
db.users.find({ age: null });
// 同时匹配 "字段为 null" 和 "字段不存在"

// 只查 age 字段存在且为 null 的
db.users.find({ age: { \$type: "null" } });
// 只匹配 _id=2

// 只查 age 字段不存在的
db.users.find({ age: { \$exists: false } });
// 只匹配 _id=3

// 只查 age 字段存在的（不管值是什么）
db.users.find({ age: { \$exists: true } });
// 匹配 _id=1 和 _id=2
\`\`\`

**null 处理对照表**：

| 查询条件 | 匹配 _id=1（有值） | 匹配 _id=2（null） | 匹配 _id=3（不存在） |
| --- | --- | --- | --- |
| \`{ age: null }\` | ❌ | ✅ | ✅ |
| \`{ age: { \$type: "null" } }\` | ❌ | ✅ | ❌ |
| \`{ age: { \$exists: false } }\` | ❌ | ❌ | ✅ |
| \`{ age: { \$exists: true } }\` | ✅ | ✅ | ❌ |
| \`{ age: { \$ne: null } }\` | ✅ | ❌ | ❌ |

> **踩坑**：\`{ field: null }\` 会匹配"字段为 null"和"字段不存在"两种情况！要精确区分，用 \`\$type: "null"\` 或 \`\$exists\`。

## 9.11 类型强制转换的陷阱

MongoDB 是**强类型**的——\`1\`（数字）和 \`"1"\`（字符串）不相等。但有些运算符会做隐式转换，容易踩坑。

\`\`\`javascript
// 文档：{ _id: 1, age: 28 }  （age 是数字）

// ✅ 类型匹配，能查到
db.users.find({ age: 28 });

// ❌ 类型不匹配，查不到
db.users.find({ age: "28" });

// ⚠️ $expr 会做类型转换
db.users.find({ \$expr: { \$eq: ["\$age", "28"] } });  // 能查到！$expr 会转换

// 用 $type 查特定类型
db.users.find({ age: { \$type: "int" } });      // 查 int 类型
db.users.find({ age: { \$type: "string" } });   // 查 string 类型
db.users.find({ age: { \$type: ["int", "double"] } });  // 查多种类型
\`\`\`

**BSON 类型对照表**：

| 类型 | 数字 | 别名 | 示例 |
| --- | --- | --- | --- |
| Double | 1 | "double" | \`3.14\` |
| String | 2 | "string" | \`"hello"\` |
| Object | 3 | "object" | \`{ a: 1 }\` |
| Array | 4 | "array" | \`[1, 2]\` |
| Binary | 5 | "binData" | 二进制数据 |
| ObjectId | 7 | "objectId" | \`ObjectId(...)\` |
| Boolean | 8 | "bool" | \`true\` |
| Date | 9 | "date" | \`new Date()\` |
| Null | 10 | "null" | \`null\` |
| 32-bit int | 16 | "int" | \`42\` |
| 64-bit long | 18 | "long" | \`NumberLong(42)\` |
| Decimal128 | 19 | "decimal" | \`NumberDecimal("3.14")\` |

> **踩坑**：MongoDB 中 \`1\`（int）和 \`1.0\`（double）和 \`NumberLong(1)\`（long）是**不同类型**！查询时类型不匹配会查不到。涉及金额、精确计算用 \`NumberDecimal\`，避免浮点误差。

## 9.12 本章小结

本章你掌握了：

- \`\$regex\` 正则匹配（只有**前缀匹配 \`^xxx\`** 能用索引）
- \`\$text\` 全文搜索（中文支持有限，建议用 ES）
- \`\$where\` 灵活但极慢，**永远别用**
- \`\$expr\` 表达式查询：字段间比较的高效方案（\`\$where\` 的替代品）
- \`\$jsonSchema\` 结构校验查询
- \`\$comment\` 查询注释（方便定位慢查询来源）
- \`\$elemMatch\` 数组元素多条件匹配（**数组多条件必用**）
- \`\$all\` / \`\$size\`（\`\$size\` 不支持范围，用 \`\$expr\` 替代）
- 地理空间查询：\`2dsphere\` 索引 + \`\$near\` / \`\$geoWithin\` / \`\$geoIntersects\`
- **null 处理**：\`{ field: null }\` 同时匹配 null 和不存在，用 \`\$type\` / \`\$exists\` 精确区分
- **类型强制转换**：MongoDB 强类型，\`1\` 和 \`"1"\` 不同，用 \`\$type\` 查特定类型

下一章我们学习**聚合管道基础**——MongoDB 的数据分析利器。`
  },

  // =========================================================
  // 第十章：聚合管道基础
  // =========================================================
  {
    id: "mongo-ch10",
    group: "第二部分 查询进阶与删除",
    icon: "🔀",
    title: "第 10 章 聚合管道基础",
    content: `# 第 10 章 聚合管道基础

> "find 是查数据，aggregate 是算数据。前者给你原料，后者给你成品。"

当需要分组统计、关联查询、数据转换时，\`find\` 就不够用了。MongoDB 的**聚合管道（Aggregation Pipeline）**把数据像流水线一样经过多个阶段处理，每个阶段变换数据，最终输出结果。本章讲解聚合管道的核心阶段和使用技巧。

## 10.1 aggregate 管道概述

\`\`\`javascript
// 基本语法
db.collection.aggregate([
  { stage1: { ... } },
  { stage2: { ... } },
  { stage3: { ... } }
]);

// 类比 SQL：
// SELECT department, COUNT(*) FROM employees
// WHERE active = true
// GROUP BY department
// HAVING COUNT(*) > 5
// ORDER BY COUNT(*) DESC

// MongoDB 等价：
db.employees.aggregate([
  { \$match: { active: true } },                              // WHERE
  { \$group: { _id: "\$department", count: { \$sum: 1 } } },    // GROUP BY + COUNT
  { \$match: { count: { \$gt: 5 } } },                         // HAVING
  { \$sort: { count: -1 } }                                   // ORDER BY
]);
\`\`\`

**管道的工作原理**：

\`\`\`
文档集合 → [\$match] → [\$project] → [\$group] → [\$sort] → 结果
\`\`\`

每个阶段接收上一阶段的输出，处理后传给下一阶段。文档像水流一样经过每个"加工站"。

**SQL 与聚合阶段对照**：

| SQL | 聚合阶段 | 说明 |
| --- | --- | --- |
| \`WHERE\` | \`\$match\` | 过滤 |
| \`SELECT\` | \`\$project\` | 选择/计算字段 |
| \`GROUP BY\` | \`\$group\` | 分组 |
| \`HAVING\` | \`\$match\`（在 \$group 后） | 分组后过滤 |
| \`ORDER BY\` | \`\$sort\` | 排序 |
| \`LIMIT\` | \`\$limit\` | 限制条数 |
| \`OFFSET\` | \`\$skip\` | 跳过 |
| \`JOIN\` | \`\$lookup\` | 关联 |
| \`UNION\` | \`\$unionWith\` | 合并 |

> **心法**：聚合管道像 Unix 管道（\`|\`），每个阶段做一件事，组合起来完成复杂任务。会写 SQL 的人学聚合会很快——概念是一一对应的。

## 10.2 $match 阶段

\`\$match\` 过滤文档，类似 \`find\` 的查询条件。**尽量放在管道最前面**，减少后续阶段的数据量。

\`\`\`javascript
db.users.aggregate([
  { \$match: { age: { \$gte: 18 }, active: true } },
  // 后续阶段只处理匹配的文档
]);

// ❌ 错误：先处理所有文档再过滤（浪费资源）
db.users.aggregate([
  { \$group: { _id: "\$city", count: { \$sum: 1 } } },
  { \$match: { count: { \$gt: 100 } } }    // 这是 HAVING，不是 WHERE
]);

// ✅ 正确：先过滤再分组
db.users.aggregate([
  { \$match: { age: { \$gte: 18 } } },     // 先过滤（WHERE）
  { \$group: { _id: "\$city", count: { \$sum: 1 } } },
  { \$match: { count: { \$gt: 100 } } }    // 后过滤（HAVING）
]);
\`\`\`

**\`\$match\` 的优化作用**：

1. **尽早过滤**：减少后续阶段的数据量
2. **能用索引**：\`\$match\` 在管道开头时可以走索引
3. **聚合性能优化的第一条原则**：\`\$match\` 越早越好

> **心法**：\`\$match\` 越早越好！它能用索引，减少后续计算量。\`\$match\` 在 \`\$group\` 前是 WHERE，在 \`\$group\` 后是 HAVING。

## 10.3 $project 阶段

\`\$project\` 选择、重命名、计算字段，类似 SQL 的 \`SELECT\`。

\`\`\`javascript
db.users.aggregate([
  {
    \$project: {
      _id: 0,
      fullName: "\$name",                    // 重命名
      age: 1,
      isAdult: { \$gte: ["\$age", 18] },      // 计算字段
      birthYear: { \$subtract: [2024, "\$age"] }   // 计算
    }
  }
]);

// 输出示例：
// { fullName: "张三", age: 28, isAdult: true, birthYear: 1996 }
\`\`\`

**条件计算**：

\`\`\`javascript
db.users.aggregate([
  {
    \$project: {
      name: 1,
      ageGroup: {
        \$switch: {
          branches: [
            { case: { \$lt: ["\$age", 18] }, then: "未成年" },
            { case: { \$lt: ["\$age", 60] }, then: "成年" }
          ],
          default: "老年"
        }
      }
    }
  }
]);
\`\`\`

**嵌套字段处理**：

\`\`\`javascript
db.users.aggregate([
  {
    \$project: {
      name: 1,
      city: "\$address.city",          // 提取嵌套字段
      fullAddress: {
        \$concat: ["\$address.province", " ", "\$address.city"]   // 拼接
      }
    }
  }
]);
\`\`\`

**对比 find 的投影**：

| 能力 | \`find\` 投影 | \`\$project\` |
| --- | --- | --- |
| 选择字段 | ✅ | ✅ |
| 排除字段 | ✅ | ✅ |
| 重命名字段 | ❌ | ✅ |
| 计算新字段 | ❌ | ✅ |
| 条件逻辑 | ❌ | ✅ |

> **心法**：\`\$project\` 比 \`find\` 投影强大得多——能选、能重命名、能计算、能做条件判断。需要"算出新字段"时必须用聚合。

## 10.4 $group 阶段

\`\$group\` 按字段分组并聚合，类似 SQL 的 \`GROUP BY\`。

\`\`\`javascript
// 按部门分组，统计人数和平均薪资
db.employees.aggregate([
  {
    \$group: {
      _id: "\$department",                    // 分组键
      count: { \$sum: 1 },                    // 计数
      avgSalary: { \$avg: "\$salary" },        // 平均值
      maxSalary: { \$max: "\$salary" },        // 最大值
      minSalary: { \$min: "\$salary" },        // 最小值
      totalSalary: { \$sum: "\$salary" }       // 求和
    }
  }
]);

// 按多个字段分组
db.orders.aggregate([
  {
    \$group: {
      _id: {                                  // 复合分组键
        year: "\$year",
        month: "\$month"
      },
      totalSales: { \$sum: "\$amount" }
    }
  }
]);

// 不分组（对整个集合聚合）
db.orders.aggregate([
  {
    \$group: {
      _id: null,                              // null 表示不分组
      totalRevenue: { \$sum: "\$amount" },
      avgOrder: { \$avg: "\$amount" }
    }
  }
]);
\`\`\`

**常用聚合运算符**：

| 运算符 | 作用 | 示例 |
| --- | --- | --- |
| \`\$sum\` | 求和 | \`{ \$sum: 1 }\` 计数，\`{ \$sum: "\$price" }\` 求和 |
| \`\$avg\` | 平均值 | \`{ \$avg: "\$score" }\` |
| \`\$max\` | 最大值 | \`{ \$max: "\$score" }\` |
| \`\$min\` | 最小值 | \`{ \$min: "\$score" }\` |
| \`\$count\` | 计数 | \`{ \$count: {} }\`（5.0+） |
| \`\$push\` | 收集到数组 | \`{ \$push: "\$name" }\` |
| \`\$addToSet\` | 收集去重 | \`{ \$addToSet: "\$city" }\` |
| \`\$first\` | 第一条 | \`{ \$first: "\$name" }\` |
| \`\$last\` | 最后一条 | \`{ \$last: "\$name" }\` |
| \`\$merge\` | 合并对象 | \`{ \$merge: "\$metadata" }\` |

**\`\$push\` 收集数组**：

\`\`\`javascript
db.students.aggregate([
  {
    \$group: {
      _id: "\$class",
      students: { \$push: "\$name" },          // 收集成数组
      count: { \$sum: 1 }
    }
  }
]);
// 输出：{ _id: "三年二班", students: ["张三", "李四", "王五"], count: 3 }
\`\`\`

**\`\$addToSet\` 去重收集**：

\`\`\`javascript
db.users.aggregate([
  {
    \$group: {
      _id: "\$department",
      cities: { \$addToSet: "\$city" }         // 去重收集城市
    }
  }
]);
// 输出：{ _id: "技术部", cities: ["北京", "上海", "深圳"] }
\`\`\`

> **心法**：\`\$group\` 的 \`_id\` 是分组键，\`null\` 表示"不分组整体聚合"。\`\$push\` 会保留重复，\`\$addToSet\` 自动去重。

## 10.5 $sort / $limit / $skip 阶段

\`\`\`javascript
db.users.aggregate([
  { \$match: { active: true } },
  { \$group: { _id: "\$city", count: { \$sum: 1 } } },
  { \$sort: { count: -1 } },    // 按计数降序
  { \$skip: 5 },                // 跳过前 5
  { \$limit: 10 }               // 取 10 条
]);
\`\`\`

**阶段顺序的优化**：

\`\`\`javascript
// ✅ 优化：$limit 尽量早放（但要放在 $sort 后）
db.users.aggregate([
  { \$match: { active: true } },
  { \$sort: { age: -1 } },
  { \$limit: 10 },              // 先 limit，后续阶段只处理 10 条
  { \$project: { name: 1, age: 1 } }
]);

// ❌ 低效：所有文档都 project，再 sort 再 limit
db.users.aggregate([
  { \$match: { active: true } },
  { \$project: { name: 1, age: 1 } },
  { \$sort: { age: -1 } },
  { \$limit: 10 }
]);
\`\`\`

> **心法**：\`\$limit\` 尽量早放（在 \`\$sort\` 后），减少后续阶段处理量。但 \`\$sort\` 必须在 \`\$limit\` 前——否则排序不完整。MongoDB 优化器会自动做"limit 下推"优化，但写的时候也要注意顺序。

## 10.6 $unwind 展开数组

\`\$unwind\` 把数组字段拆成多条文档，每个数组元素一条。类似 SQL 的"列转行"。

\`\`\`javascript
// 文档：{ name: "张三", tags: ["mongo", "db", "nosql"] }

db.posts.aggregate([
  { \$unwind: "\$tags" }
]);
// 输出 3 条文档：
// { _id: ..., name: "张三", tags: "mongo" }
// { _id: ..., name: "张三", tags: "db" }
// { _id: ..., name: "张三", tags: "nosql" }
\`\`\`

**实战：统计每个标签的文章数**

\`\`\`javascript
db.posts.aggregate([
  { \$unwind: "\$tags" },                              // 展开标签
  { \$group: { _id: "\$tags", count: { \$sum: 1 } } },  // 按标签分组计数
  { \$sort: { count: -1 } }                           // 按计数降序
]);
// 输出：{ _id: "mongo", count: 15 }, { _id: "db", count: 10 }, ...
\`\`\`

**处理空数组与缺失字段**：

\`\`\`javascript
// 文档没有 tags 字段或 tags 为空数组时，默认不输出该文档
// 用 preserveNullAndEmptyArrays 保留
db.posts.aggregate([
  {
    \$unwind: {
      path: "\$tags",
      preserveNullAndEmptyArrays: true    // 空/不存在的也保留
    }
  }
]);
\`\`\`

**带索引的 unwind**：

\`\`\`javascript
db.posts.aggregate([
  {
    \$unwind: {
      path: "\$tags",
      includeArrayIndex: "tagIndex"       // 加一个字段记录数组下标
    }
  }
]);
// 输出：{ _id: ..., name: "张三", tags: "mongo", tagIndex: 0 }
\`\`\`

> **踩坑**：\`\$unwind\` 会**成倍增加文档数**。一个 1000 条文档、每条 10 个标签的集合，unwind 后变 10000 条。注意性能，必要时先 \`\$match\` 过滤。

## 10.7 $lookup 关联查询

\`\$lookup\` 实现 MongoDB 的"左连接"，类似 SQL 的 \`LEFT JOIN\`。

\`\`\`javascript
// 订单表关联用户表
db.orders.aggregate([
  {
    \$lookup: {
      from: "users",                    // 关联的集合
      localField: "userId",             // 本地字段
      foreignField: "_id",              // 外部字段
      as: "user"                        // 结果存入字段
    }
  }
]);
// 输出：{ _id: ..., userId: 1, amount: 100, user: [{ _id: 1, name: "张三" }] }
\`\`\`

**注意**：\`\$lookup\` 的 \`as\` 字段**始终是数组**，即使只匹配一条。

\`\`\`javascript
// 取出关联文档（用 $unwind 把数组展开）
db.orders.aggregate([
  {
    \$lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
    }
  },
  { \$unwind: "\$user" }                 // 展开成单个对象
]);
\`\`\`

**简洁写法**（4.0+）：

\`\`\`javascript
db.orders.aggregate([
  {
    \$lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      pipeline: [                       // 对关联集合做聚合
        { \$project: { name: 1, email: 1 } }
      ],
      as: "user"
    }
  }
]);
\`\`\`

**let 与 pipeline 写法**（更灵活的关联条件）：

\`\`\`javascript
db.orders.aggregate([
  {
    \$lookup: {
      from: "products",
      let: { pid: "\$productId", qty: "\$quantity" },
      pipeline: [
        {
          \$match: {
            \$expr: {
              \$and: [
                { \$eq: ["\$_id", "\$\$pid"] },
                { \$gte: ["\$stock", "\$\$qty"] }    // 只关联库存足够的
              ]
            }
          }
        },
        { \$project: { name: 1, stock: 1 } }
      ],
      as: "availableProduct"
    }
  }
]);
\`\`\`

> **心法**：\`\$lookup\` 是 MongoDB 的"JOIN"，但性能不如关系型数据库的 JOIN——每次 \`\$lookup\` 都是对关联集合的查询。关联字段**必须建索引**（\`foreignField\`），否则全表扫描。

## 10.8 管道阶段顺序与性能

**阶段顺序的最佳实践**：

\`\`\`javascript
// ✅ 推荐顺序
db.collection.aggregate([
  { \$match: { ... } },      // 1. 先过滤（能用索引）
  { \$project: { ... } },    // 2. 投影（减少字段）
  { \$unwind: "\$field" },   // 3. 展开（在 group 之前）
  { \$group: { ... } },      // 4. 分组
  { \$sort: { ... } },       // 5. 排序
  { \$limit: N },            // 6. 限制（在 sort 后）
  { \$skip: M }              // 7. 跳过
]);
\`\`\`

**性能优化技巧**：

1. **\`\$match\` 尽早放**：能用索引，减少数据量
2. **\`\$project\` 提前过滤字段**：减少内存占用
3. **\`\$limit\` 尽早放**：减少后续处理量
4. **\`\$unwind\` 在 \`\$group\` 前**：先展开再分组
5. **\`\$lookup\` 的 \`foreignField\` 建索引**：避免全表扫描

**用索引优化 \`\$match\`**：

\`\`\`javascript
// 建索引
db.orders.createIndex({ status: 1, createdAt: -1 });

// $match 能用索引
db.orders.aggregate([
  { \$match: { status: "paid", createdAt: { \$gte: ISODate("2024-01-01") } } },
  { \$group: { _id: "\$userId", total: { \$sum: "\$amount" } } }
]);
\`\`\`

> **心法**：聚合管道的**第一条优化原则**是"尽早 \`\$match\`"。在 \`\$group\` / \`\$unwind\` 之前的 \`\$match\` 能用索引，能大幅减少后续阶段的数据量。

## 10.9 explain 分析聚合性能

用 \`explain()\` 查看聚合管道的执行计划，定位性能瓶颈。

\`\`\`javascript
// 查看执行计划
db.orders.explain("executionStats").aggregate([
  { \$match: { status: "paid" } },
  { \$group: { _id: "\$userId", total: { \$sum: "\$amount" } } },
  { \$sort: { total: -1 } },
  { \$limit: 10 }
]);
\`\`\`

**关键指标**：

\`\`\`javascript
// explain 输出的关键字段
{
  "stages": [
    {
      "\$cursor": {
        "executionStats": {
          "totalDocsExamined": 1000,     // 扫描的文档数
          "executionTimeMillis": 50,     // 执行时间
          "indexUsed": "status_1"        // 用的索引
        }
      }
    },
    {
      "\$group": {
        "executionTimeMillis": 20
      }
    }
  ]
}
\`\`\`

**优化判断**：

| 指标 | 健康值 | 异常值 | 优化方向 |
| --- | --- | --- | --- |
| \`totalDocsExamined\` | 接近返回数 | 远大于返回数 | 加索引、加 \`\$match\` |
| \`executionTimeMillis\` | < 100ms | > 1000ms | 检查慢阶段 |
| \`indexUsed\` | 有索引 | COLLSCAN | 加索引 |

\`\`\`javascript
// 用 explain 比较有无索引的差异
// 无索引：COLLSCAN，扫描全表
db.orders.explain("executionStats").aggregate([
  { \$match: { status: "paid" } }
]);
// totalDocsExamined: 100000

// 有索引：IXSCAN，只扫匹配的
db.orders.createIndex({ status: 1 });
db.orders.explain("executionStats").aggregate([
  { \$match: { status: "paid" } }
]);
// totalDocsExamined: 1500
\`\`\`

> **心法**：聚合慢的时候，用 \`explain("executionStats")\` 看每个阶段的 \`executionTimeMillis\` 和 \`totalDocsExamined\`。**扫描文档数远大于返回数**说明缺少索引或 \`\$match\` 不到位。

## 10.10 实战案例

### 案例一：电商销售报表

\`\`\`javascript
// 统计每个品类的月销售额、订单数、客单价
db.orders.aggregate([
  // 1. 只看已支付的订单
  { \$match: { status: "paid", createdAt: { \$gte: ISODate("2024-01-01") } } },
  // 2. 展开商品列表
  { \$unwind: "\$items" },
  // 3. 关联商品表拿品类
  {
    \$lookup: {
      from: "products",
      localField: "items.productId",
      foreignField: "_id",
      as: "product"
    }
  },
  { \$unwind: "\$product" },
  // 4. 计算每条流水的金额
  {
    \$project: {
      category: "\$product.category",
      amount: { \$multiply: ["\$items.price", "\$items.quantity"] },
      month: { \$month: "\$createdAt" }
    }
  },
  // 5. 按品类+月份分组
  {
    \$group: {
      _id: { category: "\$category", month: "\$month" },
      totalAmount: { \$sum: "\$amount" },
      orderCount: { \$sum: 1 }
    }
  },
  // 6. 计算客单价
  {
    \$project: {
      category: "\$_id.category",
      month: "\$_id.month",
      totalAmount: 1,
      orderCount: 1,
      avgOrderValue: { \$divide: ["\$totalAmount", "\$orderCount"] }
    }
  },
  // 7. 排序
  { \$sort: { "_id.month": 1, totalAmount: -1 } }
]);
\`\`\`

### 案例二：用户行为漏斗

\`\`\`javascript
// 统计用户从"浏览→加购→下单→支付"的漏斗转化
db.events.aggregate([
  { \$match: { createdAt: { \$gte: ISODate("2024-01-01") } } },
  {
    \$group: {
      _id: "\$userId",
      actions: { \$addToSet: "\$type" }    // 收集用户的所有行为类型
    }
  },
  {
    \$project: {
      viewed: { \$in: ["view", "\$actions"] },
      addedToCart: { \$in: ["cart", "\$actions"] },
      ordered: { \$in: ["order", "\$actions"] },
      paid: { \$in: ["pay", "\$actions"] }
    }
  },
  {
    \$group: {
      _id: null,
      totalUsers: { \$sum: 1 },
      viewed: { \$sum: { \$cond: ["\$viewed", 1, 0] } },
      addedToCart: { \$sum: { \$cond: ["\$addedToCart", 1, 0] } },
      ordered: { \$sum: { \$cond: ["\$ordered", 1, 0] } },
      paid: { \$sum: { \$cond: ["\$paid", 1, 0] } }
    }
  }
]);
\`\`\`

> **心法**：复杂报表用聚合管道分步骤写，每一步都用 \`\$project\` 或 \`\$group\` 加工数据。写完后用 \`explain\` 检查性能，给 \`\$match\` 用到的字段建索引。

## 10.11 本章小结

本章你掌握了：

- **聚合管道**：多个阶段串联处理数据，类比 Unix 管道
- **\`\$match\`**：过滤文档，**尽早放，能用索引**
- **\`\$project\`**：选择/重命名/计算字段（比 find 投影强大）
- **\`\$group\`**：分组聚合（\`\$sum\`/\`\$avg\`/\`\$max\`/\`\$min\`/\`\$push\`/\`\$addToSet\`）
- **\`\$sort\` / \`\$limit\` / \`\$skip\`**：排序分页，\`\$limit\` 尽早放
- **\`\$unwind\`**：展开数组（列转行），会成倍增加文档数
- **\`\$lookup\`**：关联查询（左连接），\`foreignField\` 必须建索引
- **阶段顺序最佳实践**：\`\$match\` → \`\$project\` → \`\$unwind\` → \`\$group\` → \`\$sort\` → \`\$limit\`
- **\`explain\`** 分析聚合性能：看 \`totalDocsExamined\` 和 \`executionTimeMillis\`
- 实战案例：电商销售报表、用户行为漏斗

下一章我们学习**聚合管道进阶**——\`\$facet\` 多分支聚合、\`\$bucket\` 分桶、\`\$merge\` 写回结果。`
  }
];

export { chapters };
