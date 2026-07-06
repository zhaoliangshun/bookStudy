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

> "删除是数据库操作中最危险的一步——没有撤销键。"

插入、查询、更新都学了，最后一步是**删除**。MongoDB 的删除操作看似简单，但围绕写入确认、性能影响、数据安全有不少讲究。本章带你安全地删除数据。

## 6.1 deleteOne / deleteMany

\`\`\`javascript
// 删除单条（只删第一个匹配）
db.users.deleteOne({ name: "张三" });

// 删除多条（删除所有匹配）
db.users.deleteMany({ status: "inactive" });

// 删除集合内所有文档（慎用！）
db.users.deleteMany({});

// 返回值
// {
//   acknowledged: true,
//   deletedCount: 5    // 实际删除数量
// }
\`\`\`

**Node.js 驱动**：

\`\`\`javascript
const result = await users.deleteMany({ status: "inactive" });
console.log(\`删除了 \${result.deletedCount} 条\`);
\`\`\`

> **心法**：\`deleteOne\` 只删**第一条匹配**，\`deleteMany\` 删**所有匹配**。和 \`updateOne\`/\`updateMany\` 一样的逻辑。**删除前一定先 find 确认范围**！

## 6.2 findOneAndDelete

\`findOneAndDelete\` 删除并返回被删除的文档，适合"取出并删除"场景。

\`\`\`javascript
// 删除并返回被删的文档
const doc = db.queue.findOneAndDelete({ status: "pending" });
// 返回被删除的文档，如果没有匹配则返回 null

// 配合排序：删除最旧的一条
const oldest = db.queue.findOneAndDelete(
  { status: "pending" },
  { sort: { createdAt: 1 } }    // 按创建时间升序，删最旧的
);

// Node.js 驱动
const result = await queue.findOneAndDelete(
  { status: "pending" },
  { sort: { createdAt: 1 } }
);
console.log(result.value);   // 被删除的文档
\`\`\`

**经典应用：消息队列**

\`\`\`javascript
// 消费者从队列取一条消息处理（取出即删除）
async function consumeMessage() {
  const msg = await messages.findOneAndDelete(
    { status: "pending" },
    { sort: { createdAt: 1 } }
  );
  if (!msg.value) return null;

  // 处理消息
  await processMessage(msg.value);
  return msg.value;
}
\`\`\`

> **优势**：\`findOneAndDelete\` 是原子操作，并发下不会取到同一条消息。

## 6.3 删除的写入关注

和插入一样，删除也支持 \`writeConcern\`：

\`\`\`javascript
// 多数派确认（重要数据）
db.orders.deleteMany(
  { expired: true },
  { writeConcern: { w: "majority", j: true } }
);

// 不等待确认（日志类数据，可接受丢失）
db.logs.deleteMany(
  { level: "debug" },
  { writeConcern: { w: 0 } }
);
\`\`\`

> **心法**：删除重要数据用 \`w: "majority"\`，删除日志类数据可用 \`w: 0\` 提速。

## 6.4 删除的性能影响

删除看似简单，但**大范围删除会影响性能**：

### 删除不释放磁盘空间

\`\`\`javascript
// 删除 100 万条数据
db.bigData.deleteMany({ createdAt: { \$lt: ISODate("2023-01-01") } });
// 数据没了，但磁盘空间不还！
\`\`\`

MongoDB 删除文档后，**不会自动回收磁盘空间**——只是标记为可复用。要真正回收：

\`\`\`javascript
// 压缩集合（会锁集合，生产环境慎用）
db.runCommand({ compact: "bigData" });

// 或在副本集上用 resync（从节点重新同步）
\`\`\`

### 大批量删除的策略

\`\`\`javascript
// ❌ 一次性删除 1000 万条（锁集合太久）
db.bigData.deleteMany({ status: "old" });

// 注意：deleteMany 不支持 limit 选项！
// db.bigData.deleteMany({ status: "old" }, { limit: 10000 });  // 报错

// ✅ 正确的分批删除：先 find 取 ID 再按 ID 删
async function safeBatchDelete() {
  while (true) {
    const docs = await db.bigData
      .find({ status: "old" })
      .limit(10000)
      .toArray();

    if (docs.length === 0) break;

    const ids = docs.map(d => d._id);
    await db.bigData.deleteMany({ _id: { \$in: ids } });

    await new Promise(r => setTimeout(r, 100));   // 间隔 100ms
  }
}
\`\`\`

> **踩坑**：\`deleteMany\` **不支持 \`limit\` 选项**！要分批删除，先 \`find\` 取 ID 再按 ID 删。

### 软删除 vs 硬删除

\`\`\`javascript
// 硬删除：数据真的没了
db.users.deleteOne({ _id: 1 });

// 软删除：标记为已删除，数据还在
db.users.updateOne(
  { _id: 1 },
  { \$set: { deletedAt: new Date() } }
);

// 查询时过滤已删除
db.users.find({ deletedAt: { \$exists: false } });
\`\`\`

**软删除的好处**：可恢复、可审计、关联记录不悬空。
**软删除的代价**：每个查询都要加过滤条件，容易漏。

> **心法**：重要数据（用户、订单）用**软删除**，日志类数据用**硬删除**定期清理。

## 6.5 本章小结

本章你掌握了：

- \`deleteOne\` 删单条、\`deleteMany\` 删多条、\`deleteMany({})\` 清空集合
- \`findOneAndDelete\` 删除并返回文档，适合队列消费
- 删除的 writeConcern 配置
- 删除不释放磁盘空间，需 \`compact\` 回收
- 大批量删除要分批（\`deleteMany\` 不支持 \`limit\`）
- 软删除 vs 硬删除的取舍

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

> "查得准是基础，查得精是功夫。"

查询返回的文档可能很大，但你往往只需要几个字段。**投影**让你只取需要的字段，**排序**让结果按你的意愿排列。本章讲透这两个核心能力。

## 7.1 投影（projection）

投影决定查询返回哪些字段，类似 SQL 的 \`SELECT a, b\`。

\`\`\`javascript
// 只返回 name 和 age（_id 默认返回）
db.users.find({}, { name: 1, age: 1 });
// 返回：{ _id: ..., name: "张三", age: 28 }

// 排除字段（返回除 address 外的所有字段）
db.users.find({}, { address: 0 });

// 排除 _id（唯一可以和包含混用的例外）
db.users.find({}, { name: 1, age: 1, _id: 0 });
// 返回：{ name: "张三", age: 28 }

// 投影嵌套文档的字段
db.users.find({}, { "address.city": 1, name: 1 });
// 返回：{ _id: ..., name: "张三", address: { city: "北京" } }
\`\`\`

**投影规则**：

| 写法 | 含义 |
| --- | --- |
| \`{ field: 1 }\` | 包含该字段 |
| \`{ field: 0 }\` | 排除该字段 |
| \`{ field: 1, _id: 0 }\` | 包含 field，排除 _id |

> **踩坑**：**不能混用包含和排除**（除 \`_id\` 外）！\`{ name: 1, age: 0 }\` 会报错。要么全用 \`1\`（包含），要么全用 \`0\`（排除）。

**投影的性能好处**：

\`\`\`javascript
// ❌ 返回完整文档（浪费网络带宽）
db.users.find({ active: true });

// ✅ 只返回需要的字段（减少传输量）
db.users.find({ active: true }, { name: 1, email: 1, _id: 0 });
\`\`\`

> **心法**：**永远只查需要的字段**。\`find({}, { name: 1 })\` 比 \`find({})\` 快得多，尤其当文档很大时。

## 7.2 sort 排序

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

> **心法**：\`sort\` 要放在 \`find\` 之后、\`limit\` 之前。链式调用顺序：\`find\` → \`sort\` → \`skip\` → \`limit\`。

## 7.3 多字段排序

\`\`\`javascript
// 先按 age 降序，age 相同再按 name 升序
db.users.find().sort({ age: -1, name: 1 });

// 实战：按部门升序、薪资降序排员工
db.employees.find().sort({ department: 1, salary: -1 });
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
\`\`\`

## 7.4 排序的内存限制

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

> **踩坑**：\`allowDiskUse\` 在 4.4+ 才支持 \`find()\` 排序，之前只能在 \`aggregate\` 中用。

### 排序与索引的关系

| 场景 | 是否用索引 |
| --- | --- |
| \`sort({ a: 1 })\` + 有 \`{ a: 1 }\` 索引 | ✅ 索引排序 |
| \`sort({ a: 1, b: 1 })\` + 有 \`{ a: 1, b: 1 }\` 索引 | ✅ 索引排序 |
| \`sort({ a: 1, b: 1 })\` + 有 \`{ a: 1 }\` 索引 | ❌ 内存排序 |
| \`sort({ a: -1 })\` + 有 \`{ a: 1 }\` 索引 | ✅ 索引反向扫描 |
| \`sort({ a: 1, b: -1 })\` + 有 \`{ a: 1, b: 1 }\` 索引 | ❌ 内存排序（方向不一致） |

> **心法**：**排序字段要建复合索引，且方向（1/-1）要和 sort 一致**。

## 7.5 本章小结

本章你掌握了：

- 投影：\`{ field: 1 }\` 包含、\`{ field: 0 }\` 排除，不能混用（除 \`_id\`）
- 嵌套文档投影：\`"address.city": 1\`
- sort 排序：\`1\` 升序、\`-1\` 降序
- 多字段排序：按字段顺序优先级
- 排序 32MB 内存限制：加索引或 \`allowDiskUse(true)\`
- 排序走索引的条件：字段顺序和方向都要匹配

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

任何列表页面都需要分页。MongoDB 的 \`limit\` + \`skip\` 是最直观的分页方式，但在数据量大时会遇到严重的性能问题。本章讲透分页的全部方案。

## 8.1 limit 与 skip

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

**Node.js 驱动**：

\`\`\`javascript
async function getPage(page, pageSize) {
  const skip = (page - 1) * pageSize;
  return await users
    .find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .toArray();
}
\`\`\`

> **心法**：\`skip\` + \`limit\` 简单直观，适合**小数据量**（几百条）。数据量一大就出问题。

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

> **踩坑**：**永远不要在生产环境用大 skip 分页**！超过 \`skip(10000)\` 就该考虑换方案。

## 8.3 游标分页（cursor-based）

游标分页的核心思想：**记住上一页最后一条的某个标记值，下一页从该值之后查**。

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
\`\`\`

> **优势**：游标分页**每页都是 O(pageSize)**，无论翻到第几页都一样快！适合无限滚动、时间线 feed。

## 8.4 keyset 分页

keyset 分页是游标分页的变体，用**主键或唯一键**作为游标。

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

**复合排序的 keyset 分页**：

\`\`\`javascript
// 按 (department, salary) 排序
// 游标需要两个字段

async function getKeysetPage(lastDept, lastSalary, pageSize) {
  let query = {};
  if (lastDept) {
    query = {
      \$or: [
        { department: { \$lt: lastDept } },                          // 部门更小
        { department: lastDept, salary: { \$lt: lastSalary } }       // 部门相同，薪资更小
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

> **心法**：keyset 分页要求排序字段**唯一且有序**。如果排序字段有重复值，分页会漏数据或重复——加 \`_id\` 作为 tiebreaker。

### 各种分页方案对比

| 方案 | 性能 | 复杂度 | 支持跳页 | 适用场景 |
| --- | --- | --- | --- | --- |
| \`skip\` + \`limit\` | 慢（深页） | 简单 | ✅ | 小数据量、需要跳页 |
| 游标分页 | 快 | 中等 | ❌ | 时间线、无限滚动 |
| keyset 分页 | 快 | 复杂 | ❌ | 大数据量、稳定排序 |

> **踩坑**：游标/keyset 分页**不支持跳页**（不能直接跳到第 50 页）。如果你的产品必须支持"跳到第 N 页"，只能用 \`skip\`——但要限制最大页数。

## 8.5 本章小结

本章你掌握了：

- \`skip\` + \`limit\` 基础分页，适合小数据量
- 深分页的性能问题：\`skip(N)\` 要扫描 N 条，O(N) 复杂度
- 游标分页：记住上一页最后的值，下一页从该值之后查，O(1) 每页
- keyset 分页：用主键作游标，复合排序需多字段
- 三种方案对比：跳页用 skip、时间线用游标、大数据用 keyset

下一章我们学习**查询进阶**——正则、表达式、地理空间查询。`
  },

  // =========================================================
  // 第九章：查询进阶
  // =========================================================
  {
    id: "mongo-ch09",
    group: "第二部分 查询进阶与删除",
    icon: "🔗",
    title: "第 9 章 查询进阶",
    content: `# 第 9 章 查询进阶

> "基础查询搞定 80% 的需求，剩下 20% 靠进阶语法。"

前几章学了 \`find\` 的基础语法，本章补充正则匹配、表达式查询、地理空间查询等进阶能力，帮你应对复杂场景。

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
// \$options: i(忽略大小写) m(多行) s(.匹配换行) x(忽略空白)
\`\`\`

**Node.js 驱动**：

\`\`\`javascript
// 用 RegExp 对象
const docs = await users.find({ name: /^张/ }).toArray();

// 用 $regex 字符串
const docs2 = await users.find({
  name: { \$regex: "张", \$options: "i" }
}).toArray();
\`\`\`

> **踩坑**：\`\$regex\` **不能高效用索引**（前缀匹配 \`^张\` 除外）。大量数据的正则查询会很慢，考虑用全文索引替代。

## 9.2 $where

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

> **心法**：**永远别用 \`\$where\`**！它要为每条文档启动 JS 引擎执行，比正常查询慢 100 倍。能用 \`\$expr\` 替代就替代。

## 9.3 $mod 取模

\`\`\`javascript
// age % 10 == 0 的文档
db.users.find({ age: { \$mod: [10, 0] } });

// 实战：分片取数据（取 id 取模 3 == 0 的）
db.users.find({ _id: { \$mod: [3, 0] } });
\`\`\`

> **注意**：\`\$mod\` 的参数是 \`[除数, 余数]\`，不是 \`[余数, 除数]\`。

## 9.4 $elemMatch 数组元素匹配

\`\$elemMatch\` 查询**数组中至少一个元素同时满足多个条件**。

\`\`\`javascript
// 文档：
// { results: [{ subject: "数学", score: 85 }, { subject: "英语", score: 90 }] }

// 查数学成绩 > 80 的
db.students.find({
  results: {
    \$elemMatch: { subject: "数学", score: { \$gt: 80 } }
  }
});

// 同一元素满足多个条件
db.products.find({
  specs: {
    \$elemMatch: {
      name: "cpu",
      value: { \$gte: 3.0, \$lt: 4.0 }
    }
  }
});
\`\`\`

> **复习**：第 4 章讲过，**数组多条件查询永远用 \`\$elemMatch\`**，否则会匹配到错误结果。

## 9.5 $all / $size

\`\`\`javascript
// $all：包含所有指定元素（顺序无关）
db.posts.find({ tags: { \$all: ["mongo", "db"] } });

// $size：数组长度等于 3
db.posts.find({ tags: { \$size: 3 } });

// 注意：$size 不支持范围查询！
// ❌ db.posts.find({ tags: { \$size: { \$gt: 2 } } });  // 报错

// 替代方案：加一个 tagsCount 字段
db.posts.find({ tagsCount: { \$gt: 2 } });
\`\`\`

> **踩坑**：\`\$size\` **不支持范围查询**（\`\$gt\`、\`\$lt\`）。要查"数组长度大于 3"，得加一个冗余的计数字段。

## 9.6 $expr 表达式查询

\`\$expr\` 允许在查询中使用**聚合表达式**，比 \`\$where\` 高效得多。

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
\`\`\`

> **心法**：需要"字段间比较"或"计算后比较"时，用 \`\$expr\`。它是 \`\$where\` 的高效替代品。

## 9.7 geospatial 地理空间查询

MongoDB 原生支持地理空间查询，适合"附近的餐厅""范围内的人"等场景。

### 建索引

\`\`\`javascript
// 2dsphere 索引（支持 GeoJSON 点/线/面）
db.places.createIndex({ location: "2dsphere" });

// 2d 索引（旧式，平面坐标）
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

### 查询附近

\`\`\`javascript
// 查距离某点 1000 米内的地点
db.places.find({
  location: {
    \$near: {
      \$geometry: {
        type: "Point",
        coordinates: [116.397, 39.908]
      },
      \$maxDistance: 1000,    // 米
      \$minDistance: 0
    }
  }
}).limit(10);

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
\`\`\`

> **心法**：地理查询**必须先建 2dsphere 索引**，否则报错。\`\$near\` 默认按距离升序返回，配合 \`limit\` 使用。

## 9.8 本章小结

本章你掌握了：

- \`\$regex\` 正则匹配（前缀匹配能用索引，其他慢）
- \`\$where\` 灵活但极慢，永远别用
- \`\$mod\` 取模查询
- \`\$elemMatch\` 数组元素多条件匹配
- \`\$all\` / \`\$size\`（\`\$size\` 不支持范围）
- \`\$expr\` 表达式查询：字段间比较的高效方案
- 地理空间查询：\`2dsphere\` 索引 + \`\$near\` / \`\$geoWithin\`

下一章我们学习**聚合管道基础**——MongoDB 的数据分析利器。`
  },

  // =========================================================
  // 第十章：聚合管道基础
  // =========================================================
  {
    id: "mongo-ch10",
    group: "第二部分 查询进阶与删除",
    icon: "🧮",
    title: "第 10 章 聚合管道基础",
    content: `# 第 10 章 聚合管道基础

> "find 是查数据，aggregate 是算数据。"

当需要分组统计、关联查询、数据转换时，\`find\` 就不够用了。MongoDB 的**聚合管道（Aggregation Pipeline）**把数据像流水线一样经过多个阶段处理，每个阶段变换数据，最终输出结果。本章讲解聚合管道的基础。

## 10.1 aggregate 简介

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

每个阶段接收上一阶段的输出，处理后传给下一阶段。

> **心法**：聚合管道像 Unix 管道（\`|\`），每个阶段做一件事，组合起来完成复杂任务。

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
  { \$match: { age: { \$gte: 18 } } },     // 先过滤
  { \$group: { _id: "\$city", count: { \$sum: 1 } } },
  { \$match: { count: { \$gt: 100 } } }    // 后过滤（HAVING）
]);
\`\`\`

> **心法**：\`\$match\` 越早越好！它能用索引，减少后续计算量。\`\$match\` 在 \`\$group\` 前是 WHERE，在 \`\$group\` 后是 HAVING。

## 10.3 $project 阶段

\`\$project\` 选择、重命名、计算字段，类似 SQL 的 \`SELECT\`。

\`\`\`javascript
db.users.aggregate([
  {
    \$project: {
      _id: 0,
      fullName: "\$name",        // 重命名
      age: 1,
      isAdult: { \$gte: ["\$age", 18] },    // 计算字段
      birthYear: { \$subtract: [2024, "\$age"] }   // 计算
    }
  }
]);

// 输出示例：
// { fullName: "张三", age: 28, isAdult: true, birthYear: 1996 }
\`\`\`

**对比 find 的投影**：

\`\`\`javascript
// find 投影只能选/排字段
db.users.find({}, { name: 1, age: 1, _id: 0 });

// $project 能选、能重命名、能计算
db.users.aggregate([
  { \$project: {
      name: 1,
      ageGroup: { \$switch: {      // 条件计算
        branches: [
          { case: { \$lt: ["\$age", 18] }, then: "未成年" },
          { case: { \$lt: ["\$age", 60] }, then: "成年" }
        ],
        default: "老年"
      }}
  }}
]);
\`\`\`

## 10.4 $group 阶段

\`\$group\` 按字段分组并聚合，类似 SQL 的 \`GROUP BY\`。

\`\`\`javascript
// 按部门分组，统计人数和平均薪资
db.employees.aggregate([
  {
    \$group: {
      _id: "\$department",        // 分组键
      count: { \$sum: 1 },        // 计数
      avgSalary: { \$avg: "\$salary" },     // 平均值
      maxSalary: { \$max: "\$salary" },     // 最大值
      minSalary: { \$min: "\$salary" },     // 最小值
      totalSalary: { \$sum: "\$salary" }    // 求和
    }
  }
]);

// 按多个字段分组
db.orders.aggregate([
  {
    \$group: {
      _id: {                     // 复合分组键
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
      _id: null,                 // null 表示不分组
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

\`\`\`javascript
// 用 $push 收集每组的学生姓名
db.students.aggregate([
  {
    \$group: {
      _id: "\$class",
      students: { \$push: "\$name" },     // 收集成数组
      count: { \$sum: 1 }
    }
  }
]);
// 输出：{ _id: "三年二班", students: ["张三", "李四", "王五"], count: 3 }
\`\`\`

## 10.5 $sort / $limit / $skip

\`\`\`javascript
db.users.aggregate([
  { \$match: { active: true } },
  { \$group: { _id: "\$city", count: { \$sum: 1 } } },
  { \$sort: { count: -1 } },    // 按计数降序
  { \$skip: 5 },                // 跳过前 5
  { \$limit: 10 }               // 取 10 条
]);
\`\`\`

> **心法**：\`\$limit\` 尽量早放（在 \`\$sort\` 后），减少后续阶段处理量。但 \`\$sort\` 必须在 \`\$limit\` 前——否则排序不完整。

## 10.6 $unwind 展开数组

\`\$unwind\` 把数组字段拆成多条文档，每个数组元素一条。类似 SQL 的"列转行"。

\`\`\`javascript
// 文档：{ name: "张三", tags: ["mongo", "db", "nosql"] }

db.posts.aggregate([
  { \$unwind: "\$tags" }
]);
// 输出 3 条文档：
// { name: "张三", tags: "mongo" }
// { name: "张三", tags: "db" }
// { name: "张三", tags: "nosql" }
\`\`\`

**实战：统计每个标签的文章数**

\`\`\`javascript
db.posts.aggregate([
  { \$unwind: "\$tags" },                              // 展开标签
  { \$group: { _id: "\$tags", count: { \$sum: 1 } } },  // 按标签分组计数
  { \$sort: { count: -1 } }                           // 按计数降序
]);
\`\`\`

**处理空数组**：

\`\`\`javascript
// 文档没有 tags 字段或 tags 为空数组时，默认不输出
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

> **踩坑**：\`\$unwind\` 会**成倍增加文档数**。一个 1000 条文档、每条 10 个标签的集合，unwind 后变 10000 条。注意性能。

## 10.7 本章小结

本章你掌握了：

- 聚合管道：多个阶段串联处理数据
- \`\$match\` 过滤（尽早放，能用索引）
- \`\$project\` 选择/重命名/计算字段
- \`\$group\` 分组聚合（\`\$sum\`/\`\$avg\`/\`\$max\`/\`\$min\`/\`\$push\`）
- \`\$sort\` / \`\$limit\` / \`\$skip\` 排序分页
- \`\$unwind\` 展开数组（列转行）

下一章我们学习**聚合管道进阶**——\`\$lookup\` 关联查询、\`\$facet\` 多分支聚合。`
  }
];

export { chapters };
