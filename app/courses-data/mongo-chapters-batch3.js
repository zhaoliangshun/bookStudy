// =============================================================
// 《MongoDB 实战教程》- 章节批次 3
// -------------------------------------------------------------
// 内容：第三部分 聚合进阶与索引（第 11-15 章）
// =============================================================

const chapters = [
  // =========================================================
  // 第十一章：聚合管道进阶
  // =========================================================
  {
    id: "mongo-ch11",
    group: "第三部分 聚合进阶与索引",
    icon: "🔀",
    title: "第 11 章 聚合管道进阶",
    content: `# 第 11 章 聚合管道进阶

> "当简单的 \$match + \$group 不够用时，你需要 \$facet 多分支、\$bucket 分桶、\$out/\$merge 落地——这些是聚合管道的真正威力所在。"

上一章我们学了聚合管道的基础阶段（\$match、\$group、\$project 等）。真实业务里你经常遇到"一次出多份报表"、"按区间分组"、"把结果写回另一个集合"这类需求。本章带你掌握聚合管道的进阶操作符，让 MongoDB 的聚合能力发挥到极致。

## 11.1 \$addFields / \$set：追加与覆盖字段

在管道中间给文档**添加或覆盖**字段，原有字段全部保留。这两个阶段是别名关系，行为完全一致。

\`\`\`javascript
// products 集合，添加 final_price 字段 = price * (1 - discount)
db.products.aggregate([
  {
    \$addFields: {
      final_price: {
        \$multiply: ["\$price", { \$subtract: [1, "\$discount"] }]
      },
      updated_at: "\$\$NOW"     // \$\$NOW 是内置变量，表示当前时间
    }
  },
  { \$match: { final_price: { \$gt: 100 } } }
]);
\`\`\`

> **心法**：\`\$set\` 是 \`\$addFields\` 的别名，行为完全一致。推荐用 \`$addFields\`，语义更明确——"添加字段"。如果新字段名与已有字段同名，则覆盖旧值。

### 11.1.1 嵌套字段的添加

\`\`\`javascript
// 在嵌套对象里追加字段
db.users.aggregate([
  { \$addFields: { "profile.last_login": "\$\$NOW" } }
]);
// 结果：{ profile: { age: 20, last_login: ISODate(...) } }
\`\`\`

## 11.2 \$unset：删除字段（4.2+）

\`\$unset\` 是 \`\$project\` 排除字段的简化版，专门用来删字段。

\`\`\`javascript
// 删除单个字段
db.users.aggregate([{ \$unset: "temp_field" }]);

// 删除多个字段（数组形式，4.2+）
db.users.aggregate([{ \$unset: ["temp_field", "cache", "debug"] }]);

// 删除嵌套字段
db.users.aggregate([{ \$unset: "profile.internal_score" }]);
\`\`\`

> **对比 \$project**：\`\$project\` 是"白名单"思路（指定要什么），\`\$unset\` 是"黑名单"思路（指定不要什么）。管道中间只想删几个字段时，\`\$unset\` 更简洁。

## 11.3 \$replaceRoot / \$replaceWith：替换根文档

把某个子对象"提升"为文档根，原根文档被替换。常用于 \$lookup 后想把嵌套对象提到顶层。

### 11.3.1 \$replaceRoot

\`\`\`javascript
db.orders.aggregate([
  // 把 payment 子对象提升为根文档
  { \$replaceRoot: { newRoot: "\$payment" } }
]);
// 原文档：{ _id: 1, payment: { method: "alipay", amount: 100 } }
// 结果：  { method: "alipay", amount: 100 }
\`\`\`

**用 \$mergeObjects 保留原字段**：

\`\`\`javascript
db.orders.aggregate([
  { \$replaceRoot: {
    newRoot: {
      \$mergeObjects: ["\$\$ROOT", { order_id: "\$_id" }]
    }
  }}
]);
// 给根文档追加 order_id 后替换
\`\`\`

> **注意**：\`newRoot\` 必须是对象（document），不能是字符串或数字，否则报错 "\$replaceRoot requires newRoot to be an object"。

### 11.3.2 \$replaceWith（4.2+）

\`\$replaceWith\` 是 \`\$replaceRoot: { newRoot: ... }\` 的简写：

\`\`\`javascript
// 等价于 { $replaceRoot: { newRoot: "$payment" } }
db.orders.aggregate([{ \$replaceWith: "\$payment" }]);

// 合并对象后替换
db.orders.aggregate([
  { \$replaceWith: { \$mergeObjects: ["\$\$ROOT", "\$payment"] } }
]);
\`\`\`

## 11.4 \$count：快速计数阶段

\`\`\`javascript
// 统计年龄大于 30 的用户数
db.users.aggregate([
  { \$match: { age: { \$gt: 30 } } },
  { \$count: "older_count" }
]);
// 输出：{ older_count: 42 }
\`\`\`

等价于 \`{ \$group: { _id: null, older_count: { \$sum: 1 } } }\`，但更简洁直观。

> **限制**：\`\$count\` 必须是管道**最后一个阶段**，输出的字段名不能包含点号（不能是 \`"a.b"\`）。

## 11.5 \$sortByCount：按值分组并排序（3.4+）

\`\$sortByCount\` = \`\$group + \$sort\` 的一体化操作符，按某字段分组并按计数倒序排列。

\`\`\`javascript
// 按部门分组并按人数倒序
db.employees.aggregate([
  { \$sortByCount: "\$department" }
]);
// 输出：
// { _id: "技术部", count: 50 }
// { _id: "市场部", count: 30 }
// { _id: "人事部", count: 10 }
\`\`\`

等价于：

\`\`\`javascript
db.employees.aggregate([
  { \$group: { _id: "\$department", count: { \$sum: 1 } } },
  { \$sort: { count: -1 } }
]);
\`\`\`

> **适用场景**：排行榜、热门标签、分类统计——只要"分组 + 按数量排序"就用 \$sortByCount。

## 11.6 \$facet：多分支并行聚合

一次聚合只输出一个结果流。但报表场景经常要"同时出：总数、按状态分组、按月份分布"。用 \$facet 可以**并行**跑多个子管道，一次拿全所有统计。

\`\`\`javascript
db.orders.aggregate([
  { \$match: { created_at: { \$gte: ISODate("2026-01-01") } } },
  {
    \$facet: {
      // 分支 1：总数和总金额
      "summary": [
        { \$group: { _id: null, total: { \$sum: 1 }, amount: { \$sum: "\$price" } } }
      ],
      // 分支 2：按状态分组
      "byStatus": [
        { \$sortByCount: "\$status" }
      ],
      // 分支 3：按月份分桶
      "byMonth": [
        { \$group: {
          _id: { \$month: "\$created_at" },
          count: { \$sum: 1 }
        }},
        { \$sort: { _id: 1 } }
      ]
    }
  }
]);
\`\`\`

输出形如：

\`\`\`javascript
{
  "summary": [{ total: 1000, amount: 99999 }],
  "byStatus": [
    { _id: "paid", count: 800 },
    { _id: "pending", count: 200 }
  ],
  "byMonth": [
    { _id: 1, count: 100 },
    { _id: 2, count: 120 }
  ]
}
\`\`\`

> **用途**：仪表盘首页一次请求拿全所有统计，避免前端发 3 次请求。
>
> **注意**：每个分支是**独立**的管道，从头跑，不能跨分支共享中间结果。\$facet 内部的子管道也不能再嵌套 \$facet。

## 11.7 \$bucket：按区间分桶

把连续值（年龄、价格、金额）切成几个区间统计。比 \`\$group + 数学运算\` 简洁。

\`\`\`javascript
// 把用户按年龄分桶
db.users.aggregate([
  {
    \$bucket: {
      groupBy: "\$age",                  // 按哪个字段分
      boundaries: [0, 18, 30, 45, 60],  // 区间边界（左闭右开）
      default: "other",                 // 不在任何区间的归到这里
      output: {
        count: { \$sum: 1 },
        names: { \$push: "\$name" }
      }
    }
  }
]);
// 输出：
// { _id: 0,  count: 5,  names: [...] }   // [0, 18)
// { _id: 18, count: 20, names: [...] }   // [18, 30)
// { _id: 30, count: 15, names: [...] }   // [30, 45)
// { _id: 45, count: 8,  names: [...] }   // [45, 60)
\`\`\`

**边界规则**：

- \`boundaries\` 必须是**升序**数组
- 区间是**左闭右开** \[a, b)，即 \[0,18) 含 0 不含 18
- 最后一段 \[45, 60) 不含 60
- 不落在任何区间的值会进入 \`default\`，不设 \`default\` 则报错

> **坑**：\`boundaries: [30, 18, 45]\` 不升序会报错 "sort must be ascending"。

## 11.8 \$bucketAuto：自动分桶（3.4+）

不需要手动指定边界，MongoDB 自动把数据均匀分成 N 个桶。

\`\`\`javascript
// 把用户按年龄自动分成 4 个桶
db.users.aggregate([
  {
    \$bucketAuto: {
      groupBy: "\$age",
      buckets: 4,                    // 目标桶数
      output: {
        count: { \$sum: 1 },
        avg_age: { \$avg: "\$age" }
      }
    }
  }
]);
// 输出（边界自动计算）：
// { _id: { min: 18, max: 25 }, count: 12, avg_age: 21.5 }
// { _id: { min: 25, max: 35 }, count: 15, avg_age: 29.8 }
// { _id: { min: 35, max: 50 }, count: 13, avg_age: 42.1 }
// { _id: { min: 50, max: 65 }, count: 10, avg_age: 57.3 }
\`\`\`

> **特点**：每个桶的文档数尽量均匀（不是边界均匀）。实际桶数可能略少于目标值。适合"按价格分成 5 档"这类需求，不用自己算边界。

## 11.9 \$out：把结果写入新集合（3.4+ 写法）

把聚合结果**覆盖写入**另一个集合。如果集合已存在，会先清空再写入。

\`\`\`javascript
// 把每日统计结果写入 daily_stats 集合
db.orders.aggregate([
  { \$match: { status: "paid" } },
  { \$group: { _id: { \$dateToString: { format: "%Y-%m-%d", date: "\$created_at" } }, total: { \$sum: "\$price" }, count: { \$sum: 1 } } },
  { \$out: "daily_stats" }       // 结果写入 daily_stats 集合
]);
// 之后可以直接查询 daily_stats
db.daily_stats.find();
\`\`\`

**\$out 的限制**：

- 目标集合不能是分片集合
- 必须在管道**最后**一个阶段
- 如果目标集合已存在，**先删除再创建**（原数据丢失！）
- 只能在**同一数据库**内写入

> **警告**：\`\$out\` 是破坏性操作——目标集合原有数据会被清空。生产环境务必确认集合名无误。

## 11.10 \$merge：把结果合并到集合（4.2+）

比 \$out 更灵活：可以**合并**（不覆盖）、可以指定冲突时的策略（替换、保留、失败、管道处理）。

\`\`\`javascript
db.orders.aggregate([
  { \$match: { status: "paid" } },
  { \$group: { _id: "\$user_id", total_paid: { \$sum: "\$price" } } },
  {
    \$merge: {
      into: "user_stats",              // 目标集合
      on: "_id",                       // 匹配字段（必须是唯一索引）
      whenMatched: "merge",            // 匹配时：合并字段
      whenNotMatched: "insert"         // 不匹配时：插入
    }
  }
]);
\`\`\`

### 11.10.1 whenMatched 的选项

| 值 | 含义 |
| --- | --- |
| \`replace\` | 用新文档完全替换旧文档 |
| \`keepExisting\` | 保留旧文档，忽略新文档 |
| \`merge\` | 合并两边字段（新值覆盖同名旧值） |
| \`fail\` | 报错停止 |
| \`[pipeline]\` | 用自定义管道处理冲突 |

### 11.10.2 \$out vs \$merge 对比

| 特性 | \$out | \$merge |
| --- | --- | --- |
| 写入方式 | 覆盖（先删后建） | 合并/替换/插入 |
| 跨数据库 | ❌ 不支持 | ✅ 支持 |
| 分片集合 | ❌ 不支持 | ✅ 支持 |
| 冲突策略 | 无 | replace/merge/keepExisting/fail/pipeline |
| 增量更新 | ❌ 不支持 | ✅ 支持 |
| 版本要求 | 2.6+ | 4.2+ |

> **建议**：4.2+ 优先用 \$merge，它更安全、更灵活。\$out 适合"完全重建"场景。

## 11.11 \$collStats：集合统计信息（3.4+）

在管道中插入集合的统计信息，常和 \$facet 配合做监控。

\`\`\`javascript
db.orders.aggregate([{ \$collStats: { latencyStats: { histograms: true } } }]);
// 输出包含：集合的读写延迟统计直方图

db.orders.aggregate([{ \$collStats: { storageStats: { scale: 1024 } } }]);
// 输出包含：存储统计（以 KB 为单位）

db.orders.aggregate([{ \$collStats: { count: {} } }]);
// 输出：{ ns: 'test.orders', count: 1000 }
\`\`\`

> **可用选项**：\`latencyStats\`（延迟）、\`storageStats\`（存储）、\`count\`（计数）、\`queryExecStats\`（查询执行统计）。

## 11.12 管道优化原则

聚合管道跑得慢，90% 是因为**阶段顺序写错了**。MongoDB 优化器会自动做一些优化，但你不能依赖它。

### 11.12.1 早过滤：\$match 放最前

\`\`\`javascript
// ❌ 先算再过滤，扫描全表
db.orders.aggregate([
  { \$group: { _id: "\$status", total: { \$sum: "\$price" } } },
  { \$match: { total: { \$gt: 1000 } } }
]);

// ✅ 先过滤再聚合
db.orders.aggregate([
  { \$match: { status: "paid" } },    // 命中索引，只扫少量文档
  { \$group: { _id: "\$status", total: { \$sum: "\$price" } } }
]);
\`\`\`

> **黄金法则**：\$match 永远尽量往前放。它能利用索引，把后续阶段处理的文档数降到最少。优化器会自动把 \$match 移到 \$project/\$addFields 前面（只要不影响结果），但不会跨 \$group 移动。

### 11.12.2 早投影：\$project / \$unset 减少字段

\`\`\`javascript
db.logs.aggregate([
  { \$match: { level: "error" } },
  { \$project: { message: 1, timestamp: 1, _id: 0 } },  // 去掉冗余字段
  { \$group: { _id: "\$message", count: { \$sum: 1 } } }
]);
\`\`\`

字段越少，每条文档占内存越小，管道吞吐越高。

### 11.12.3 优化器自动做的事

| 优化 | 说明 |
| --- | --- |
| **\$match 前移** | 把 \$match 移到 \$project/\$addFields 前面 |
| **\$project 合并** | 连续的 \$project 会合并成一个 |
| **\$limit 前移** | \$limit 会尽可能前移到 \$sort/\$skip 后 |
| **\$sort + \$limit 合并** | \$sort 后紧跟 \$limit，优化器合并为 top-k 排序 |

### 11.12.4 allowDiskUse：允许写磁盘

默认管道在内存中执行，超过 100MB 单阶段会报错。开启 \`allowDiskUse\` 允许写临时文件：

\`\`\`javascript
db.big_data.aggregate(
  [{ \$group: { _id: "\$category", items: { \$push: "\$name" } } }],
  { allowDiskUse: true }
);
\`\`\`

> **代价**：写磁盘比内存慢 10-100 倍。优先优化管道减少数据量，allowDiskUse 是兜底手段。注意 4.2 版本后 \$sort 默认就允许写磁盘了。

## 11.13 综合实战：仪表盘统计

\`\`\`javascript
// 电商仪表盘：一次聚合出多维度统计
db.orders.aggregate([
  // 第一步：只看最近 30 天已支付订单
  { \$match: {
    status: "paid",
    created_at: { \$gte: ISODate("2026-06-11") }
  }},
  // 第二步：多分支并行统计
  {
    \$facet: {
      // 分支 1：核心指标
      "kpi": [
        { \$group: {
          _id: null,
          total_orders: { \$sum: 1 },
          total_revenue: { \$sum: "\$amount" },
          avg_order_value: { \$avg: "\$amount" }
        }}
      ],
      // 分支 2：按价格区间分桶
      "price_ranges": [
        { \$bucket: {
          groupBy: "\$amount",
          boundaries: [0, 50, 100, 500, 1000],
          default: "1000+",
          output: { count: { \$sum: 1 } }
        }}
      ],
      // 分支 3：Top 5 畅销品类
      "top_categories": [
        { \$sortByCount: "\$category" },
        { \$limit: 5 }
      ],
      // 分支 4：按天统计趋势
      "daily_trend": [
        { \$group: {
          _id: { \$dateToString: { format: "%Y-%m-%d", date: "\$created_at" } },
          count: { \$sum: 1 },
          revenue: { \$sum: "\$amount" }
        }},
        { \$sort: { _id: 1 } }
      ]
    }
  }
]);
\`\`\`

这个聚合一次返回所有仪表盘需要的数据，前端只需一次请求。

## 11.14 踩坑点

**坑 1：\$facet 子管道不能跨分支共享结果**

每个分支是独立管道，从头跑。不要指望在 byStatus 分支里用到 byMonth 的输出。

**坑 2：\$bucket 边界不升序**

\`\`\`javascript
// ❌ 报错：boundaries must be sorted
{ \$bucket: { groupBy: "\$age", boundaries: [30, 18, 45] } }
\`\`\`

**坑 3：\$replaceRoot 的 newRoot 不是对象**

\`\`\`javascript
// ❌ 报错：newRoot 必须是 document
{ \$replaceRoot: { newRoot: "\$name" } }   // name 是字符串

// ✅ 包成对象
{ \$replaceRoot: { newRoot: { name: "\$name" } } }
\`\`\`

**坑 4：\$out 误删目标集合数据**

\`\`\`javascript
// daily_stats 里原有 100 条精心维护的数据
db.orders.aggregate([...], { \$out: "daily_stats" });
// daily_stats 原数据全没了！被聚合结果覆盖
\`\`\`

要增量更新用 \$merge。

**坑 5：\$merge 的 on 字段没有唯一索引**

\`\`\`javascript
// on 字段必须有唯一索引，否则报错
db.user_stats.createIndex({ _id: 1 }, { unique: true });
db.orders.aggregate([
  ...,
  { \$merge: { into: "user_stats", on: "_id", whenMatched: "merge", whenNotMatched: "insert" } }
]);
\`\`\`

## 11.15 小结

- **\$addFields / \$set**：追加或覆盖字段，不破坏原字段
- **\$unset**：删除字段，黑名单思路
- **\$replaceRoot / \$replaceWith**：把子对象提升为根文档
- **\$count**：简洁的计数阶段
- **\$sortByCount**：分组 + 按计数倒序，一步到位
- **\$facet**：一次并行跑多个子管道，适合仪表盘
- **\$bucket**：按手动边界分桶，左闭右开
- **\$bucketAuto**：自动均匀分桶
- **\$out**：覆盖写入目标集合（破坏性）
- **\$merge**：灵活合并写入，支持冲突策略
- **\$collStats**：在管道中获取集合统计
- **优化**：\$match 放最前、\$project 早瘦身、allowDiskUse 兜底

下一章我们深入**表达式与操作符**——算术、字符串、日期、条件、数组表达式，让聚合管道能做更复杂的计算。`
  },

  // =========================================================
  // 第十二章：表达式与操作符
  // =========================================================
  {
    id: "mongo-ch12",
    group: "第三部分 聚合进阶与索引",
    icon: "🧮",
    title: "第 12 章 表达式与操作符",
    content: `# 第 12 章 表达式与操作符

> "聚合管道之所以强大，是因为它有一套完整的表达式语言——算术、字符串、日期、条件、数组，几乎是个内嵌的函数库。"

上一章你学会了管道的"骨架"（\$match、\$group、\$facet 等阶段）。本章讲的是"血肉"——**表达式操作符**。它们出现在阶段内部，比如 \`{ \$multiply: ["\$price", 2] }\`，用来对字段做计算。掌握它们，你才能写出真正灵活的聚合。

## 12.1 表达式语法基础

表达式操作符的统一语法：

\`\`\`javascript
{ \$操作符名: [参数1, 参数2, ...] }   // 大多数操作符
{ \$操作符名: 参数 }                  // 单参数的（如 \$toUpper）
\`\`\`

**三个核心概念**：

| 概念 | 语法 | 说明 |
| --- | --- | --- |
| 字段引用 | \`"\$字段名"\` | 取当前文档的这个字段值 |
| 变量引用 | \`"\$\$变量名"\` | 取 let/as 声明的变量 |
| 字面量 | 数字、字符串直接写 | 原样使用 |

**嵌套**：表达式可以无限嵌套，比如：

\`\`\`javascript
// 实付金额 = (小计 - 折扣) + 运费
{ \$add: [{ \$subtract: ["\$subtotal", "\$discount"] }, "\$shipping"] }
\`\`\`

> **最常见的错误**：把字段引用写成 \`"price"\`（少了 \$），MongoDB 会把它当字符串字面量处理，得不到预期结果。

## 12.2 算术表达式

| 操作符 | 作用 | 示例 |
| --- | --- | --- |
| \`\$add\` | 加法（可多参数，也支持日期+毫秒） | \`{ \$add: ["\$price", "\$tax"] }\` |
| \`\$subtract\` | 减法 | \`{ \$subtract: ["\$total", "\$discount"] }\` |
| \`\$multiply\` | 乘法（可多参数） | \`{ \$multiply: ["\$price", "\$qty"] }\` |
| \`\$divide\` | 除法 | \`{ \$divide: ["\$sum", "\$count"] }\` |
| \`\$mod\` | 取模（求余） | \`{ \$mod: ["\$n", 2] }\` |
| \`\$round\` | 四舍五入（4.2+） | \`{ \$round: ["\$price", 2] }\` |
| \`\$abs\` | 绝对值 | \`{ \$abs: "\$delta" }\` |
| \`\$ceil\` / \`\$floor\` | 向上/向下取整 | \`{ \$ceil: "\$avg" }\` |
| \`\$pow\` | 幂运算 | \`{ \$pow: ["\$base", 2] }\` |
| \`\$sqrt\` | 平方根 | \`{ \$sqrt: "\$area" }\` |

\`\`\`javascript
// 计算订单实付金额 = 小计 - 折扣 + 运费
db.orders.aggregate([
  { \$project: {
    paid_amount: {
      \$add: [
        { \$subtract: ["\$subtotal", "\$discount"] },
        "\$shipping"
      ]
    },
    // 单价 × 数量，保留 2 位小数
    line_total: { \$round: [{ \$multiply: ["\$price", "\$qty"] }, 2] },
    // 判断是否为偶数
    is_even: { \$eq: [{ \$mod: ["\$qty", 2] }, 0] }
  }}
]);
\`\`\`

> **注意**：所有算术操作符对 \`null\` / 缺失字段会返回 null。要避免可以用 \`\$ifNull\` 兜底成 0。除以零会返回 null（不报错）。

### 12.2.1 日期加减

\`\$add\` 支持日期 + 毫秒数：

\`\`\`javascript
// 计算 7 天后的日期
{ \$add: ["\$created_at", 7 * 24 * 3600 * 1000] }
\`\`\`

## 12.3 字符串表达式

| 操作符 | 作用 |
| --- | --- |
| \`\$concat\` | 拼接多个字符串 |
| \`\$toUpper\` / \`\$toLower\` | 转大写 / 转小写 |
| \`\$substr\` / \`\$substrCP\` | 截取（按字节 / 按码点） |
| \`\$strLenBytes\` / \`\$strLenCP\` | 长度（按字节 / 按字符） |
| \`\$split\` | 按分隔符切分成数组 |
| \`\$trim\` | 去首尾空白（4.0+） |
| \`\$regexMatch\` / \`\$regexFind\` | 正则匹配（4.0+） |
| \`\$replaceOne\` / \`\$replaceAll\` | 替换（4.4+） |

\`\`\`javascript
// 生成 "张三 <zs@x.com>" 格式的展示名
db.users.aggregate([
  { \$project: {
    display: { \$concat: ["\$name", " <", "\$email", ">"] },
    name_len: { \$strLenCP: "\$name" },     // 中文按字符算
    domain: { \$arrayElemAt: [{ \$split: ["\$email", "@"] }, 1] },
    upper_name: { \$toUpper: "\$name" },
    trimmed: { \$trim: { input: "\$bio" } },
    masked_email: { \$replaceAll: { input: "\$email", find: "@", replacement: "[at]" } }
  }}
]);
\`\`\`

> **中文大坑**：\`\$substr\` 按字节切，中文字符占 3 字节（UTF-8），会切出乱码；处理中文一定要用 \`\$substrCP\` 和 \`\$strLenCP\`。同理 \`\$strLenBytes\` 对 "张三" 返回 6，而 \`\$strLenCP\` 返回 2。

### 12.3.1 \$trim 的完整语法

\`\`\`javascript
{ \$trim: {
  input: "\$text",
  chars: " \\t\\n"    // 指定要去除的字符（默认是空白）
}}
\`\`\`

## 12.4 日期表达式

MongoDB 内部用 64 位整数存毫秒时间戳，聚合时可以用一组操作符拆解。

| 操作符 | 返回 |
| --- | --- |
| \`\$year\` / \`\$month\` / \`\$dayOfMonth\` | 年 / 月 / 日 |
| \`\$hour\` / \`\$minute\` / \`\$second\` | 时 / 分 / 秒 |
| \`\$dayOfWeek\` | 星期几（1=周日，7=周六） |
| \`\$dayOfYear\` | 一年里第几天 |
| \`\$week\` | 一年里第几周 |
| \`\$isoWeek\` / \`\$isoWeekYear\` | ISO 周历 |
| \`\$millisecond\` | 毫秒部分 |
| \`\$dateToString\` | 格式化为字符串 |
| \`\$dateFromString\` | 字符串解析为日期（3.4+） |
| \`\$dateTrunc\` | 按单位截断（5.0+） |
| \`\$dateAdd\` / \`\$dateSubtract\` | 日期加减（5.0+） |
| \`\$dateDiff\` | 日期差值（5.0+） |

\`\`\`javascript
// 按年月分组统计订单
db.orders.aggregate([
  { \$group: {
    _id: {
      year: { \$year: "\$created_at" },
      month: { \$month: "\$created_at" }
    },
    count: { \$sum: 1 },
    total: { \$sum: "\$price" }
  }},
  { \$sort: { "_id.year": 1, "_id.month": 1 } }
]);

// 格式化日期（带时区）
{ \$project: {
  date_str: {
    \$dateToString: {
      format: "%Y-%m-%d %H:%M:%S",
      date: "\$created_at",
      timezone: "Asia/Shanghai"     // 东八区
    }
  }
}}
\`\`\`

> **\$dateToString 的 format**：用 strftime 风格——\`%Y\` 年、\`%m\` 月、\`%d\` 日、\`%H\` 时、\`%M\` 分、\`%S\` 秒。
>
> **时区**：默认 UTC。要转东八区加 \`timezone: "Asia/Shanghai"\`。

### 12.4.1 \$dateFromString：字符串转日期

\`\`\`javascript
// 把字符串日期转成 Date 类型
{ \$project: {
  created: {
    \$dateFromString: {
      dateString: "\$created_str",
      format: "%Y-%m-%d %H:%M:%S",
      timezone: "Asia/Shanghai",
      onError: null              // 解析失败返回 null（不报错）
    }
  }
}}
\`\`\`

> 对比 \`\$toDate\`：\`\$toDate\` 失败会**抛错中断聚合**；\`\$dateFromString\` 可以用 \`onError\` 兜底，更安全。

### 12.4.2 \$dateDiff：计算日期差（5.0+）

\`\`\`javascript
// 计算订单从创建到完成的天数
{ \$project: {
  processing_days: {
    \$dateDiff: {
      startDate: "\$created_at",
      endDate: "\$completed_at",
      unit: "day"
    }
  }
}}
\`\`\`

## 12.5 条件表达式

### 12.5.1 \$cond：三元运算符

\`\`\`javascript
// 满 100 打 9 折，否则原价
{ \$project: {
  final_price: {
    \$cond: {
      if: { \$gte: ["\$price", 100] },
      then: { \$multiply: ["\$price", 0.9] },
      else: "\$price"
    }
  }
}}

// 简写（数组形式）：[条件, 真值, 假值]
{ \$cond: [{ \$gte: ["\$price", 100] }, { \$multiply: ["\$price", 0.9] }, "\$price"] }
\`\`\`

### 12.5.2 \$ifNull：空值兜底

\`\`\`javascript
// nickname 为 null 或不存在时用 "匿名"
{ \$project: { name: { \$ifNull: ["\$nickname", "匿名"] } }
\`\`\`

注意：\`\$ifNull\` 接受**两个参数**，第二个是默认值。多个备选可以嵌套：

\`\`\`javascript
{ \$ifNull: ["\$a", { \$ifNull: ["\$b", "\$c"] }] }
\`\`\`

> **要点**：\`\$ifNull\` 只在字段为 \`null\` 或**不存在**时触发兜底，空字符串 \`""\` 和 0 不会触发。

### 12.5.3 \$switch：多分支

\`\`\`javascript
{ \$project: {
  level: {
    \$switch: {
      branches: [
        { case: { \$lt: ["\$score", 60] }, then: "不及格" },
        { case: { \$lt: ["\$score", 80] }, then: "及格" },
        { case: { \$lt: ["\$score", 90] }, then: "良好" }
      ],
      default: "优秀"
    }
  }
}}
\`\`\`

> 比 \`\$cond\` 嵌套更清晰，适合 3 个以上分支。必须有 \`default\`，否则所有 case 不匹配时报错。

## 12.6 数组表达式

| 操作符 | 作用 |
| --- | --- |
| \`\$size\` | 数组长度 |
| \`\$arrayElemAt\` | 取第 N 个元素（索引从 0 开始） |
| \`\$concatArrays\` | 拼接多个数组 |
| \`\$reverseArray\` | 反转数组 |
| \`\$filter\` | 按条件过滤元素 |
| \`\$map\` | 对每个元素做变换 |
| \`\$reduce\` | 归约（累加等） |
| \`\$in\` | 判断元素是否在数组里 |
| \`\$slice\` | 截取子数组 |
| \`\$isArray\` | 判断是否为数组 |
| \`\$first\` / \`\$last\` | 取首/尾元素（4.4+） |
| \`\$zip\` | 多数组并行打包 |

### 12.6.1 \$filter：过滤数组元素

\`\`\`javascript
// 取 tags 里以 "tech-" 开头的
{ \$project: {
  tech_tags: {
    \$filter: {
      input: "\$tags",
      as: "t",                              // 元素变量名（默认 "this"）
      cond: { \$regexMatch: { input: "\$\$t", regex: "^tech-" } }
    }
  }
}}
\`\`\`

### 12.6.2 \$map：变换数组元素

\`\`\`javascript
// 把 prices 数组每个元素打 8 折
{ \$project: {
  discounted: {
    \$map: {
      input: "\$prices",
      as: "p",
      in: { \$round: [{ \$multiply: ["\$\$p", 0.8] }, 2] }
    }
  }
}}
\`\`\`

### 12.6.3 \$reduce：累加归约

\`\`\`javascript
// 求 items 数组的总价
{ \$project: {
  total: {
    \$reduce: {
      input: "\$items",
      initialValue: 0,
      in: { \$add: ["\$\$value", "\$\$this.price"] }
    }
  }
}}
\`\`\`

> **变量说明**：\`initialValue\` 是初始值，\`\$\$value\` 是累加器（上一次的结果），\`\$\$this\` 是当前元素。

### 12.6.4 \$concatArrays 和 $arrayElemAt 组合

\`\`\`javascript
// 取 email 的域名部分
{ \$project: {
  domain: {
    \$arrayElemAt: [
      { \$split: ["\$email", "@"] },
      1
    ]
  }
}}
// zs@x.com → split → ["zs", "x.com"] → [1] → "x.com"
\`\`\`

### 12.6.5 \$in：判断包含

\`\`\`javascript
// 判断用户是否有 "admin" 角色
{ \$project: { is_admin: { \$in: ["admin", "\$roles"] } } }
\`\`\`

## 12.7 类型转换表达式（4.0+）

| 操作符 | 作用 |
| --- | --- |
| \`\$toString\` / \`\$toInt\` / \`\$toDouble\` / \`\$toBool\` | 转基础类型 |
| \`\$toDate\` / \`\$toDecimal\` / \`\$toLong\` | 转日期/定点数/长整型 |
| \`\$convert\` | 带容错的通用转换 |
| \`\$type\` | 返回字段的 BSON 类型名 |

### 12.7.1 \$convert：安全的类型转换

\`\`\`javascript
// 把字符串日期转成 Date 类型（失败返回 onError 的值）
{ \$project: {
  created: {
    \$convert: {
      input: "\$created_str",
      to: "date",
      onError: null,        // 转换失败时返回 null（不中断聚合）
      onNull: null          // 输入为 null 时返回 null
    }
  }
}}
\`\`\`

> **对比**：\`\$toDate\` 失败会**抛错中断聚合**；\`\$convert\` 可以用 \`onError\` 兜底，更安全。处理脏数据时务必用 \`\$convert\`。

### 12.7.2 \$type：判断字段类型

\`\`\`javascript
{ \$project: { age_type: { \$type: "\$age" } } }
// "int"、"double"、"string"、"bool"、"date"、"null"、"array"、"object" 等
\`\`\`

### 12.7.3 BSON 类型标识对照表

| 类型 | \$type 返回值 | to 参数值 |
| --- | --- | --- |
| 双精度浮点 | "double" | "double" |
| 字符串 | "string" | "string" |
| 对象 | "object" | "object" |
| 数组 | "array" | "array" |
| 二进制 | "binData" | — |
| ObjectId | "objectId" | "objectId" |
| 布尔 | "bool" | "bool" |
| 日期 | "date" | "date" |
| null | "null" | — |
| 32 位整数 | "int" | "int" |
| 时间戳 | "timestamp" | — |
| 64 位整数 | "long" | "long" |
| 十进制 | "decimal" | "decimal" |

## 12.8 综合实战

### 12.8.1 用户画像标签

\`\`\`javascript
db.users.aggregate([
  { \$project: {
    name: 1,
    tags: {
      \$switch: {
        branches: [
          { case: { \$lt: ["\$age", 18] }, then: "未成年" },
          { case: { \$and: [{ \$gte: ["\$age", 18] }, { \$lt: ["\$age", 30] }] }, then: "青年" },
          { case: { \$and: [{ \$gte: ["\$age", 30] }, { \$lt: ["\$age", 50] }] }, then: "中年" }
        ],
        default: "老年"
      }
    },
    // 邮箱域名
    email_domain: { \$arrayElemAt: [{ \$split: [{ \$ifNull: ["\$email", ""] }, "@"] }, 1] },
    // 注册天数
    days_since_join: {
      \$divide: [
        { \$subtract: ["\$\$NOW", "\$created_at"] },
        86400000      // 一天的毫秒数
      ]
    }
  }}
]);
\`\`\`

### 12.8.2 购物车总价计算

\`\`\`javascript
db.carts.aggregate([
  { \$project: {
    user_id: 1,
    total: {
      \$reduce: {
        input: "\$items",
        initialValue: 0,
        in: {
          \$add: [
            "\$\$value",
            { \$multiply: ["\$\$this.price", "\$\$this.qty"] }
          ]
        }
      }
    },
    item_count: { \$size: "\$items" }
  }}
]);
\`\`\`

## 12.9 踩坑点

**坑 1：字段引用忘记 \$**

\`\`\`javascript
// ❌ "price" 是字面字符串
{ \$multiply: ["price", 2] }       // 报错或得到意外结果

// ✅ "\$price" 是字段引用
{ \$multiply: ["\$price", 2] }
\`\`\`

**坑 2：变量引用忘记 \$\$**

\`\`\`javascript
// ❌ 在 \$filter / \$map 内部用 $t 取不到元素
{ \$filter: { input: "\$tags", as: "t", cond: { \$eq: ["\$t", "x"] } } }

// ✅ 用 $$t
{ \$filter: { input: "\$tags", as: "t", cond: { \$eq: ["\$\$t", "x"] } } }
\`\`\`

**坑 3：null 参与算术**

\`\`\`javascript
{ \$add: [null, 5] }   // 返回 null，不是 5
{ \$multiply: [null, 5] }   // 返回 null
\`\`\`

要避免就先用 \`\$ifNull\` 兜底成 0：\`{ \$add: [{ \$ifNull: ["\$x", 0] }, 5] }\`。

**坑 4：\$substr 切中文乱码**

\`\`\`javascript
{ \$substr: ["\$name", 0, 3] }   // "张三李" 可能切出 "张三?" 乱码
{ \$substrCP: ["\$name", 0, 3] } // 正确，按字符切
\`\`\`

**坑 5：\$switch 没有 default 报错**

\`\`\`javascript
// 所有 case 都不匹配时，没 default 会报错
{ \$switch: { branches: [{ case: ..., then: ... }] } }  // ❌ 缺 default

// 加上 default
{ \$switch: { branches: [...], default: null } }  // ✅
\`\`\`

## 12.10 小结

- **算术**：\$add / \$subtract / \$multiply / \$divide / \$mod / \$round
- **字符串**：处理中文用 \`*CP\` 系列（\$substrCP / \$strLenCP）
- **日期**：\$year/\$month/\$dayOfMonth + \$dateToString + \$dateFromString，注意时区
- **条件**：\$cond 三元、\$ifNull 兜底、\$switch 多分支
- **数组**：\$filter / \$map / \$reduce 是函数式三剑客
- **类型转换**：用 \$convert + onError 比 \$toXxx 更安全；\$type 判断类型
- **字段引用**：\`\$字段\` 取字段，\`\$\$变量\` 取 let/as 声明的变量

下一章进入**索引**主题——单字段索引、复合索引、ESR 原则、索引代价。索引是 MongoDB 性能优化的核心武器。`
  },

  // =========================================================
  // 第十三章：索引基础
  // =========================================================
  {
    id: "mongo-ch13",
    group: "第三部分 聚合进阶与索引",
    icon: "📇",
    title: "第 13 章 索引基础",
    content: `# 第 13 章 索引基础

> "没有索引的查询叫'全表扫描'——10 万条数据要逐条看一遍。加上索引，10 万条可能变成几十次跳读。索引是 MongoDB 性能的命脉。"

本章讲清楚索引是什么、怎么建、为什么能快、代价是什么。学完你能回答："这个查询该建什么索引？"。

## 13.1 索引是什么

索引本质是**一份额外维护的、有序的数据结构**，让你不用扫全表就能定位数据。

MongoDB 默认用 **B 树**（确切说是 B+ 树变体）索引。可以类比书的目录：要找第 5 章，不用翻 200 页，先看目录定位到第 80 页，直接翻过去。

\`\`\`javascript
// 假设 users 集合有 100 万条，没索引
db.users.find({ email: "zs@x.com" });
// MongoDB 必须 COLLSCAN（全集合扫描）：100 万条逐个比对

// 建索引后
db.users.createIndex({ email: 1 });
db.users.find({ email: "zs@x.com" });
// MongoDB 走 IXSCAN（索引扫描）：B 树里 2-3 跳就定位到
\`\`\`

### 13.1.1 为什么索引能加速

| 操作 | 无索引 | 有索引 |
| --- | --- | --- |
| 等值查询 | O(N) 逐条比对 | O(log N) B 树查找 |
| 范围查询 | O(N) 全表扫 | O(log N + K) 定位起点后顺序扫 |
| 排序 | 内存排序 O(N log N) | 索引天然有序，免排序 |

## 13.2 _id 默认索引

每个集合创建时，MongoDB 自动在 \`_id\` 字段上建**唯一索引**。这个索引**不能删除**。

\`\`\`javascript
db.users.getIndexes();
// 输出：
// [ { v: 2, key: { _id: 1 }, name: "_id_" } ]
\`\`\`

> **要点**：\`_id\` 索引是唯一索引，保证每个文档的 _id 不重复。插入重复 _id 会报 E11000 错误。

## 13.3 createIndex：创建索引的基本语法

\`\`\`javascript
db.集合.createIndex(
  { 字段: 1 },          // 索引键规范：1 升序，-1 降序
  {
    unique: true,                    // 唯一索引
    name: "my_index",                // 自定义索引名
    background: true,                // 后台建索引（旧版）
    sparse: true,                    // 稀疏索引
    partialFilterExpression: {...},  // 部分索引
    expireAfterSeconds: 3600,        // TTL 索引
    collation: { locale: "zh" }      // 排序规则
  }
);
\`\`\`

**返回值**：

\`\`\`javascript
db.users.createIndex({ email: 1 });
// 返回：email_1（自动生成的索引名）
\`\`\`

### 13.3.1 索引命名规则

不指定 \`name\` 时，MongoDB 自动生成：\`字段名_方向\`，多字段用 \`_\` 连接。

\`\`\`javascript
db.orders.createIndex({ status: 1, created_at: -1 });
// 自动命名：status_1_created_at_-1

db.orders.createIndex({ status: 1, created_at: -1 }, { name: "status_date_idx" });
// 自定义命名：status_date_idx
\`\`\`

> **建议**：索引名要简洁有意义，方便后续维护和删除。自动生成的名字太长。

## 13.4 单字段索引

最简单的索引：对一个字段建。

\`\`\`javascript
// 1 表示升序，-1 表示降序
db.users.createIndex({ age: 1 });     // 升序索引
db.users.createIndex({ name: -1 });   // 降序索引
\`\`\`

**关键事实**：单字段索引**对查询方向不敏感**。即 \`{ age: 1 }\` 的索引，既能服务 \`sort({ age: 1 })\`，也能服务 \`sort({ age: -1 })\`。所以单字段索引升序降序无所谓。

### 13.4.1 索引方向的意义

单字段索引方向无所谓，但**复合索引**的方向很关键——它决定排序方向能否匹配。

## 13.5 复合索引

多个字段组合成一个索引。这是实际工作中**用得最多**的索引类型。

\`\`\`javascript
// 在 status + created_at 上建复合索引
db.orders.createIndex({ status: 1, created_at: -1 });
\`\`\`

### 13.5.1 ESR 原则：字段顺序怎么定

复合索引的字段顺序**决定它能服务哪些查询**。社区总结出 **ESR 原则**：

| 字母 | 含义 | 放前面还是后面 |
| --- | --- | --- |
| **E** (Equality) | 等值查询（{ field: value }） | **最前** |
| **S** (Sort) | 排序字段 | 中间 |
| **R** (Range) | 范围查询（\$gt / \$lt / \$in） | **最后** |

**为什么是这个顺序**：

- 等值条件把索引"定位"到一小段，这段再排序/范围扫
- 排序字段紧跟等值，可以利用索引的有序性免内存排序
- 范围字段放最后，避免破坏前面排序字段的有序性

**示例**：查询已支付订单按时间倒序，价格大于 100

\`\`\`javascript
// 查询
db.orders.find({ status: "paid", price: { \$gt: 100 } }).sort({ created_at: -1 });

// 按 ESR：status(E) → created_at(S) → price(R)
db.orders.createIndex({ status: 1, created_at: -1, price: 1 });
\`\`\`

### 13.5.2 索引前缀规则

复合索引 \`{ a: 1, b: 1, c: 1 }\` 可以服务以下查询：

\`\`\`javascript
{ a }              // ✅ 前缀匹配
{ a, b }           // ✅ 前缀匹配
{ a, b, c }        // ✅ 全部匹配
{ b }              // ❌ 不是前缀，用不上
{ a, c }           // ⚠️ 只能用 a 部分，c 跳过 b 用不上
{ b, c }           // ❌ 不是前缀，用不上
\`\`\`

> **要点**：复合索引只能从最左字段开始连续使用。设计索引时把"必查"的字段放最左。

### 13.5.3 索引方向与排序

复合索引能服务排序的条件：排序字段的**方向**必须与索引一致或完全相反。

\`\`\`javascript
// 索引：{ status: 1, created_at: -1 }

db.orders.find({ status: "paid" }).sort({ created_at: -1 });  // ✅ 方向一致
db.orders.find({ status: "paid" }).sort({ created_at: 1 });   // ✅ 完全相反也行
db.orders.find({ status: "paid" }).sort({ status: 1, created_at: -1 }); // ✅
\`\`\`

## 13.6 查看与删除索引

### 13.6.1 查看集合所有索引

\`\`\`javascript
db.users.getIndexes();
// 输出：
// [
//   { v: 2, key: { _id: 1 }, name: "_id_" },
//   { v: 2, key: { email: 1 }, name: "email_1", unique: true }
// ]
\`\`\`

### 13.6.2 查看索引大小

\`\`\`javascript
// 查看集合统计信息
db.users.stats();
// {
//   count: 100000,
//   size: 52428800,        // 数据大小（字节）
//   storageSize: 16777216, // 存储大小
//   totalIndexSize: 8388608, // 所有索引总大小
//   indexSizes: {
//     _id_: 2097152,
//     email_1: 6291456
//   }
// }
\`\`\`

> **监控**：索引大小超过数据大小是不正常的信号，说明索引冗余。

### 13.6.3 删除索引

\`\`\`javascript
// 按名字删除
db.users.dropIndex("email_1");

// 按键规范删除
db.users.dropIndex({ email: 1 });

// 删除所有非 _id 索引（慎用！）
db.users.dropIndexes();
\`\`\`

> **警告**：\`dropIndexes()\` 会删除除 _id 外的所有索引，生产环境务必先 \`getIndexes()\` 确认。

## 13.7 后台建索引

数据量大时，建索引会**阻塞集合的写操作**。

### 13.7.1 background 选项（旧版写法）

\`\`\`javascript
// MongoDB 4.2 以前：加 background: true 不阻塞
db.big_coll.createIndex({ field: 1 }, { background: true });
\`\`\`

### 13.7.2 4.2+ 的变化

从 MongoDB 4.2 开始，**所有索引构建都使用优化的非阻塞方式**，\`background\` 选项被忽略（但兼容不报错）。

\`\`\`javascript
// 4.2+ 不需要 background 参数，默认就不阻塞
db.big_coll.createIndex({ field: 1 });
\`\`\`

> **大表建索引建议**：在低峰期执行；使用 \`rs.status()\` 关注副本集状态；建索引会产生大量 IO，做好监控。

## 13.8 覆盖查询（Covered Query）

如果查询和投影的字段**全部在索引里**，MongoDB 可以只扫索引不读文档本体，极快。

\`\`\`javascript
db.users.createIndex({ name: 1, age: 1 });

// ✅ 覆盖查询：只查 name 和 age，且都在索引里，排除 _id
db.users.find({ name: "张三" }, { name: 1, age: 1, _id: 0 });
// MongoDB 只需扫索引树，不读 documents（无 FETCH 阶段）
\`\`\`

**覆盖查询的三个条件**：

1. 查询条件字段全在索引里
2. 投影返回字段全在索引里
3. **显式排除 _id**（\`_id: 0\`），因为 _id 默认返回但不一定在索引里

> **要点**：要覆盖查询，必须显式排除 \`_id\`（\`_id: 0\`），否则会因为读 _id 而破覆盖。下一章会详细讲执行计划里如何确认覆盖。

## 13.9 索引的代价

索引不是越多越好。每个索引都是一份独立的 B 树，要付出：

| 代价 | 说明 |
| --- | --- |
| **写放大** | 每次插入/更新/删除，所有相关索引都要同步修改 |
| **存储** | 索引本身占磁盘，可能和原数据一样大 |
| **内存** | MongoDB 倾向把"热"索引放内存（WiredTiger 缓存），索引多了挤占 |
| **优化器负担** | 查询有 N 个索引可选时，优化器要逐一评估，反而变慢 |

> **经验法则**：一个集合保持 **5-10 个索引**以内。每个索引都要有明确的查询场景支撑。没用的索引果断删。

### 13.9.1 写放大示例

\`\`\`javascript
// 一个集合有 8 个索引
db.users.createIndex({ email: 1 });
db.users.createIndex({ name: 1 });
db.users.createIndex({ age: 1 });
// ... 还有 5 个

// 每次插入 1 条文档，实际要写 9 棵 B 树（1 数据 + 8 索引）
db.users.insertOne({ name: "张三", email: "zs@x.com", age: 25 });
// 写入吞吐量大幅下降
\`\`\`

## 13.10 索引选择实战

### 13.10.1 模式分析

\`\`\`javascript
// 开启慢查询 profiling
db.setProfilingLevel(1, { slowms: 100 });
// 查看哪些查询没走索引
db.system.profile.find({ planSummary: "COLLSCAN" }).sort({ ts: -1 });
\`\`\`

### 13.10.2 实战决策

查询："找最近一周内、状态为 paid、金额大于 1000 的订单，按金额倒序"

\`\`\`javascript
db.orders
  .find({
    status: "paid",                                    // E: 等值
    created_at: { \$gte: ISODate("2026-07-04") },       // R: 范围
    amount: { \$gt: 1000 }                              // R: 范围
  })
  .sort({ amount: -1 });                               // S: 排序

// ESR 分析：
// E: status（等值，放最前）
// S: amount（排序，放中间）
// R: created_at（范围，放最后）
// amount 既是排序又是范围，放排序位置
db.orders.createIndex({ status: 1, amount: -1, created_at: 1 });
\`\`\`

## 13.11 踩坑点

**坑 1：索引建了却没走**

\`\`\`javascript
db.users.createIndex({ age: 1 });

// ❌ 类型不匹配走不了索引
db.users.find({ age: { \$type: "string" } });

// ❌ 没有过滤条件，优化器可能选 COLLSCAN
db.users.find({}).sort({ age: 1 });

// ✅ 加个范围条件
db.users.find({ age: { \$gte: 0 } }).sort({ age: 1 });
\`\`\`

**坑 2：复合索引字段顺序反了**

\`\`\`javascript
// 查询：{ status: "paid", created_at: {...} }
// 索引：{ created_at: 1, status: 1 }   ❌ status 不是前缀，用不上

// 应改为
db.orders.createIndex({ status: 1, created_at: 1 });
\`\`\`

**坑 3：建太多索引拖慢写入**

某集合建了 20 个索引，每次插入都要更新 20 棵 B 树，写入吞吐掉 70%。定期用 \`getIndexes()\` 审查索引必要性。

**坑 4：忘了删除测试时建的索引**

\`\`\`javascript
// 列出所有索引，逐个评估必要性
db.users.getIndexes();
// 看到没人查的字段上的索引 → 删
db.users.dropIndex("temp_field_1");
\`\`\`

**坑 5：覆盖查询忘了排 _id**

\`\`\`javascript
db.users.createIndex({ name: 1, age: 1 });

// ❌ 默认返回 _id，_id 不在索引里 → 不是覆盖查询
db.users.find({ name: "张三" }, { name: 1, age: 1 });

// ✅ 排掉 _id → 覆盖查询
db.users.find({ name: "张三" }, { name: 1, age: 1, _id: 0 });
\`\`\`

## 13.12 小结

- **索引本质**：B 树，用空间换时间，O(N) 变 O(log N)
- **_id 索引**：默认唯一，不可删
- **createIndex**：\`{ field: 1 }\` 升序，\`{ field: -1 }\` 降序
- **单字段索引**：升序降序无所谓，方向不影响查询
- **复合索引**：ESR 原则——等值(E)、排序(S)、范围(R)
- **前缀规则**：复合索引只能从最左字段连续使用
- **索引方向**：单字段无所谓，复合索引方向要匹配排序
- **覆盖查询**：查询投影全在索引里，要排除 _id
- **代价**：写放大、存储、内存、优化器负担
- **数量控制**：5-10 个以内，没用的果断删
- **后台建索引**：4.2+ 默认非阻塞

下一章学习**索引类型**——唯一索引、部分索引、TTL、文本、地理空间、多键、通配符索引，应对不同业务场景。`
  },

  // =========================================================
  // 第十四章：索引类型
  // =========================================================
  {
    id: "mongo-ch14",
    group: "第三部分 聚合进阶与索引",
    icon: "🌳",
    title: "第 14 章 索引类型",
    content: `# 第 14 章 索引类型

> "普通索引只能做等值和范围查询。要保证唯一、自动过期、全文检索、附近的人——你需要专门的索引类型。"

本章讲 MongoDB 的各种索引类型，每种都对应一类业务场景。学会按场景选索引，能省下大量代码。

## 14.1 索引类型总览

| 索引类型 | 创建方式 | 典型场景 |
| --- | --- | --- |
| 单字段索引 | \`{ field: 1 }\` | 普通等值/范围查询 |
| 复合索引 | \`{ a: 1, b: 1 }\` | 多条件查询 |
| 多键索引（Multikey） | 自动创建 | 字段是数组 |
| 文本索引（Text） | \`{ field: "text" }\` | 全文搜索 |
| 通配符索引（Wildcard） | \`{ "field.$**": 1 }\`（4.2+） | 动态/不确定字段 |
| TTL 索引 | \`expireAfterSeconds: N\` | 自动过期删除 |
| 唯一索引 | \`unique: true\` | 保证字段唯一 |
| 稀疏索引 | \`sparse: true\` | 字段大部分为空 |
| 部分索引 | \`partialFilterExpression\` | 只索引子集 |
| 地理空间 | \`"2dsphere"\` / \`"2d"\` | 位置查询 |
| 哈希索引 | \`{ field: "hashed" }\` | 分片 |

## 14.2 单字段索引与复合索引

这两种在第 13 章已详细介绍，这里补充要点：

\`\`\`javascript
// 单字段索引
db.users.createIndex({ email: 1 });

// 复合索引
db.orders.createIndex({ status: 1, created_at: -1 });
\`\`\`

> **回顾**：复合索引遵循 ESR 原则（等值、排序、范围），支持前缀匹配。单字段索引方向无所谓。

## 14.3 多键索引（Multikey Index）

当索引的字段是**数组**时，MongoDB 自动创建多键索引——为数组的每个元素建一个索引项。

\`\`\`javascript
// tags 是数组
db.articles.insertOne({ title: "MongoDB 指南", tags: ["db", "nosql", "tutorial"] });

// 建索引
db.articles.createIndex({ tags: 1 });
// MongoDB 自动识别为多键索引

// 查询数组里包含某元素
db.articles.find({ tags: "nosql" });   // ✅ 走索引
db.articles.find({ tags: { \$all: ["db", "nosql"] } });  // ✅ 走索引
\`\`\`

### 14.3.1 多键索引的限制

- **复合索引中最多一个数组字段**：\`{ a: 1, b: 1 }\` 中 a 和 b 不能同时是数组
- 多键索引**不支持覆盖查询**（因为一个文档对应多个索引项）

\`\`\`javascript
// ❌ 报错：compound multikey index cannot have multiple array fields
db.coll.createIndex({ arr1: 1, arr2: 1 });
// 如果 arr1 和 arr2 都是数组
\`\`\`

> **判断**：用 \`getIndexes()\` 查看，多键索引在查询时会标记 \`isMultiKey: true\`。

## 14.4 唯一索引（unique）

保证索引字段在集合内**不重复**。常用于 username、email 这类业务唯一键。

\`\`\`javascript
db.users.createIndex({ email: 1 }, { unique: true });

// 插入重复 email 会报错
db.users.insertOne({ email: "zs@x.com" });
db.users.insertOne({ email: "zs@x.com" });
// E11000 duplicate key error collection: test.users index: email_1
\`\`\`

> **注意**：唯一索引对 \`null\` 也视为"一个值"。如果多个文档字段缺失，会被当作 null，导致第二个文档插入失败。要避免就配合 \`sparse\` 用稀疏索引。

### 14.4.1 复合唯一索引

\`\`\`javascript
// (user_id, role_id) 组合唯一
db.user_roles.createIndex({ user_id: 1, role_id: 1 }, { unique: true });
// 同一个 user 可以有不同 role，但 (user_id, role_id) 组合不能重复
\`\`\`

## 14.5 稀疏索引（sparse）

普通索引会把字段缺失的文档也索引进来（索引项为 null）。稀疏索引**跳过**字段缺失的文档。

\`\`\`javascript
db.users.createIndex({ nickname: 1 }, { sparse: true });

// users 里 80% 没 nickname
// 普通索引：100 万个索引项（含 80 万 null）
// 稀疏索引：20 万个索引项（只含有 nickname 的）
\`\`\`

> **配合唯一索引**：\`{ unique: true, sparse: true }\` 是经典组合，让"有值的必须唯一，没值的不参与"。

\`\`\`javascript
// 不加 sparse：多个文档没有 nickname → 都算 null → 唯一约束冲突
db.users.createIndex({ nickname: 1 }, { unique: true, sparse: true });
// ✅ 有 nickname 的必须唯一，没 nickname 的不索引不冲突
\`\`\`

## 14.6 部分索引（partialFilterExpression，3.2+）

比稀疏索引更强大：可以用**任意表达式**指定哪些文档进索引。

\`\`\`javascript
// 只给活跃用户建索引
db.users.createIndex(
  { email: 1 },
  { partialFilterExpression: { status: "active", age: { \$gte: 18 } } }
);

// ✅ 这个查询能用上索引（条件完全包含索引过滤条件）
db.users.find({ email: "zs@x.com", status: "active", age: { \$gte: 18 } });

// ❌ 这个查询用不上（条件比索引定义窄，少了 status 和 age 条件）
db.users.find({ email: "zs@x.com" });
\`\`\`

> **关键**：查询条件必须**完全包含**部分索引的过滤条件，优化器才会用这个索引。这和稀疏索引不同——稀疏索引只要字段存在就能用。

### 14.6.1 部分索引 vs 稀疏索引

| 特性 | 稀疏索引 | 部分索引 |
| --- | --- | --- |
| 过滤条件 | 只能"字段存在" | 任意表达式 |
| 查询要求 | 查询字段存在即可 | 必须包含过滤条件 |
| 灵活性 | 低 | 高 |
| 版本 | 1.8+ | 3.2+ |

> **建议**：3.2+ 优先用部分索引，它完全覆盖稀疏索引的能力。

## 14.7 TTL 索引（自动过期）

让文档**到点自动删除**。用于会话、验证码、日志等有时效性的数据。

\`\`\`javascript
// sessions 集合的 createdAt 字段，过期 1 小时（3600 秒）
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });

// 插入时设置 createdAt
db.sessions.insertOne({
  token: "abc123",
  createdAt: new Date(),    // 当前时间
  data: "..."
});
// 1 小时后 MongoDB 自动删除这条文档
\`\`\`

### 14.7.1 TTL 工作机制

- MongoDB **每 60 秒**扫描一次 TTL 索引，删除过期文档
- 过期时间 = \`文档字段值 + expireAfterSeconds\`
- 字段**必须是 BSON Date 类型**（不能是字符串）
- 删除不是实时的，最多有 60 秒延迟
- TTL 索引**不能是复合索引**（只能单字段）

### 14.7.2 自定义过期时间

如果每条文档过期时间不同（VIP 会话 30 天，普通会话 1 小时），可以用 \`expireAfterSeconds: 0\` + 字段里存"过期时刻"：

\`\`\`javascript
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

db.sessions.insertOne({
  token: "vip",
  expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000)  // 30 天后
});
db.sessions.insertOne({
  token: "normal",
  expiresAt: new Date(Date.now() + 3600 * 1000)             // 1 小时后
});
// 每条文档到自己的 expiresAt 时刻过期
\`\`\`

> **副本集注意**：TTL 删除只在**主节点**执行，从节点通过 oplog 同步删除。

## 14.8 文本索引（text）

为全文检索建索引。支持分词、词干提取、停用词过滤。

\`\`\`javascript
// 建复合文本索引
db.articles.createIndex({
  title: "text",
  content: "text"
});

// 全文检索
db.articles.find({ \$text: { \$search: "MongoDB 教程" } });

// 按相关度排序
db.articles.find(
  { \$text: { \$search: "MongoDB 教程" } },
  { score: { \$meta: "textScore" } }
).sort({ score: { \$meta: "textScore" } });
\`\`\`

### 14.8.1 文本索引的限制

- **每个集合只能有一个文本索引**
- 默认支持英文，中文分词效果一般（建议用专业搜索引擎如 Elasticsearch）
- 不支持 \$or 与 \$text 混用的某些组合

\`\`\`javascript
// 精确短语搜索（用转义引号）
db.articles.find({ \$text: { \$search: '"MongoDB tutorial"' } });

// 排除词（前缀减号）
db.articles.find({ \$text: { \$search: "MongoDB -MySQL" } });

// 指定字段权重
db.articles.createIndex(
  { title: "text", content: "text" },
  { weights: { title: 10, content: 1 } }    // title 权重更高
);
\`\`\`

## 14.9 通配符索引（Wildcard Index，4.2+）

为**不确定字段名**或**动态结构**的文档建索引。

\`\`\`javascript
// 给 userAttributes 下所有子字段建索引
db.users.createIndex({ "userAttributes.\$**": 1 });

// 文档结构：
// { userAttributes: { age: 25, city: "北京", hobby: "coding" } }
// 以上任意子字段查询都能走索引
db.users.find({ "userAttributes.age": 25 });
db.users.find({ "userAttributes.city": "北京" });

// 给整个文档的所有字段建索引（慎用，很大）
db.users.createIndex({ "\$**": 1 });
\`\`\`

> **适用场景**：用户自定义属性、动态 schema、JSON 扩展字段。通配符索引**不支持**：唯一性、文本、TTL、2dsphere。

## 14.10 地理空间索引

### 14.10.1 2dsphere 索引

存储经纬度，查"附近的人"、"5 公里内的店"。支持 GeoJSON 格式（球面几何）。

\`\`\`javascript
// 建索引
db.places.createIndex({ location: "2dsphere" });

// 插入地理点
db.places.insertOne({
  name: "星巴克",
  location: {
    type: "Point",
    coordinates: [116.404, 39.915]   // [经度, 纬度]
  }
});

// 找附近 1000 米内
db.places.find({
  location: {
    \$near: {
      \$geometry: { type: "Point", coordinates: [116.405, 39.916] },
      \$maxDistance: 1000
    }
  }
});
\`\`\`

> **坐标系**：2dsphere 用 GeoJSON 格式，\`coordinates\` 顺序是 **[经度, 纬度]**，很多人搞反。

### 14.10.2 2d 索引

2d 索引用于**平面坐标**（非球面），旧版遗留，新项目建议用 2dsphere。

\`\`\`javascript
db.legacy_places.createIndex({ coords: "2d" });
// coords 存的是 [x, y] 平面坐标
db.legacy_places.find({ coords: { \$near: [116.4, 39.9], \$maxDistance: 0.1 } });
\`\`\`

### 14.10.3 地理空间查询操作符

| 操作符 | 作用 |
| --- | --- |
| \`\$near\` | 按距离从近到远返回 |
| \`\$geoWithin\` | 在某区域内 |
| \`\$geoIntersects\` | 与某区域相交 |
| \`\$nearSphere\` | 球面距离近邻 |

\`\`\`javascript
// 查多边形区域内的店
db.places.find({
  location: {
    \$geoWithin: {
      \$geometry: {
        type: "Polygon",
        coordinates: [[[116.3, 39.8], [116.5, 39.8], [116.5, 40.0], [116.3, 40.0], [116.3, 39.8]]]
      }
    }
  }
});
\`\`\`

## 14.11 哈希索引（hashed）

对字段值做哈希，用于**分片**时的均匀分布。

\`\`\`javascript
db.users.createIndex({ user_id: "hashed" });

// 哈希索引支持等值查询，不支持范围查询
db.users.find({ user_id: 123 });          // ✅ 走索引
db.users.find({ user_id: { \$gt: 100 } }); // ❌ 走不了哈希索引
\`\`\`

### 14.11.1 哈希分片

\`\`\`javascript
// 启用分片时用哈希索引做片键
sh.shardCollection("test.users", { user_id: "hashed" });
// 数据按哈希值均匀分布到各分片，避免热点
\`\`\`

> **场景**：数据量大、写入频繁、没有天然分片键时，用哈希分片实现均匀分布。注意哈希索引浮点数会被截断为整数。

## 14.12 覆盖查询回顾

\`\`\`javascript
db.users.createIndex({ name: 1, age: 1 });

// ✅ 覆盖查询：只查 name 和 age，且都在索引里
db.users.find({ name: "张三" }, { name: 1, age: 1, _id: 0 });
// MongoDB 只需扫索引树，不读 documents
\`\`\`

> **要点**：要覆盖查询，必须显式排除 \`_id\`（\`_id: 0\`）。多键索引不支持覆盖查询。

## 14.13 索引选择决策表

| 业务场景 | 推荐索引 |
| --- | --- |
| 用户名/邮箱唯一 | \`{ field: 1 }, unique: true\` |
| 字段大部分为空，只查有值的 | \`{ field: 1 }, sparse: true\` |
| 只给特定子集建索引（如活跃用户） | \`partialFilterExpression\` |
| 会话/验证码自动过期 | \`{ time_field: 1 }, expireAfterSeconds: N\` |
| 文章全文搜索 | \`{ field: "text" }\` |
| 附近的人/店 | \`{ field: "2dsphere" }\` |
| 数组字段查询 | 自动多键索引 |
| 动态/不确定字段 | \`{ "field.\$**": 1 }\` 通配符 |
| 分片均匀分布 | \`{ field: "hashed" }\` |
| 普通等值/范围 | 单字段或复合索引 |

## 14.14 踩坑点

**坑 1：唯一索引 + 字段缺失**

\`\`\`javascript
db.users.createIndex({ nickname: 1 }, { unique: true });
db.users.insertOne({ name: "A" });  // nickname 缺失 = null
db.users.insertOne({ name: "B" });  // 又一个 null → 报错！

// 修复：加 sparse
db.users.dropIndex("nickname_1");
db.users.createIndex({ nickname: 1 }, { unique: true, sparse: true });
\`\`\`

**坑 2：TTL 字段是字符串**

\`\`\`javascript
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });

// ❌ 字符串日期，TTL 不生效
db.sessions.insertOne({ createdAt: "2026-07-11T10:00:00Z" });

// ✅ 必须是 Date 对象
db.sessions.insertOne({ createdAt: new Date() });
\`\`\`

**坑 3：部分索引条件不匹配**

\`\`\`javascript
db.users.createIndex({ email: 1 }, { partialFilterExpression: { age: { \$gte: 18 } } });

// ❌ 用不上索引（少了 age 条件）
db.users.find({ email: "zs@x.com" });

// ✅ 加上 age 条件
db.users.find({ email: "zs@x.com", age: { \$gte: 18 } });
\`\`\`

**坑 4：2dsphere 坐标顺序反了**

\`\`\`javascript
// ❌ [纬度, 经度] —— 错！
{ coordinates: [39.915, 116.404] }

// ✅ [经度, 纬度] —— GeoJSON 规范
{ coordinates: [116.404, 39.915] }
\`\`\`

**坑 5：文本索引建第二个会报错**

\`\`\`javascript
db.articles.createIndex({ title: "text" });
db.articles.createIndex({ content: "text" });
// 报错：already has a text index

// 正确做法：建一个复合文本索引
db.articles.createIndex({ title: "text", content: "text" });
\`\`\`

**坑 6：复合多键索引两个数组字段**

\`\`\`javascript
// 如果 arr1 和 arr2 都是数组
db.coll.createIndex({ arr1: 1, arr2: 1 });
// 插入数据后报错：compound multikey index cannot have multiple array fields
\`\`\`

## 14.15 小结

- **单字段/复合索引**：最常用，遵循 ESR 原则
- **多键索引**：数组字段自动创建，复合索引最多一个数组字段
- **唯一索引**：保证字段唯一，配合 sparse 处理缺失
- **稀疏索引**：跳过字段缺失的文档
- **部分索引**：用表达式指定子集，比稀疏更灵活（3.2+）
- **TTL 索引**：自动过期删除，字段必须是 Date，60 秒延迟
- **文本索引**：每集合只能一个，中文分词效果有限
- **通配符索引**：4.2+，动态字段场景
- **2dsphere**：GeoJSON，坐标是 [经度, 纬度]
- **2d 索引**：平面坐标，旧版遗留
- **哈希索引**：分片用，只支持等值不支持范围
- **覆盖查询**：查询投影全在索引里，要排除 _id

下一章学习**执行计划与索引优化**——用 explain 看查询到底走了哪个索引、扫了多少文档、耗时在哪。`
  },

  // =========================================================
  // 第十五章：执行计划与索引优化
  // =========================================================
  {
    id: "mongo-ch15",
    group: "第三部分 聚合进阶与索引",
    icon: "📈",
    title: "第 15 章 执行计划与索引优化",
    content: `# 第 15 章 执行计划与索引优化

> "查询慢？别瞎猜。用 explain 让 MongoDB 自己告诉你：走了哪个索引、扫了多少文档、耗时在哪。看懂执行计划，是性能优化的起点。"

本章教你用 \`explain()\` 读懂 MongoDB 的查询计划，并据此优化索引设计。这是 DBA 和后端工程师的核心技能。

## 15.1 explain 的三种模式

\`\`\`javascript
db.users.find({ email: "zs@x.com" }).explain("queryPlanner");       // 默认：只看选了哪个计划
db.users.find({ email: "zs@x.com" }).explain("executionStats");     // 真正执行，带统计
db.users.find({ email: "zs@x.com" }).explain("allPlansExecution");  // 所有候选计划都执行
\`\`\`

| 模式 | 是否真正执行 | 用途 |
| --- | --- | --- |
| \`queryPlanner\` | 否 | 快速看选了哪个索引 |
| \`executionStats\` | 是 | 看真实耗时和扫描数 |
| \`allPlansExecution\` | 是 | 看为什么选这个索引（候选都跑） |

> **日常调优用 executionStats**。要诊断"为什么没用某索引"才用 allPlansExecution。

## 15.2 读懂 queryPlanner 输出

\`\`\`javascript
db.users.find({ email: "zs@x.com" }).explain("queryPlanner");
\`\`\`

关键字段：

\`\`\`javascript
{
  "queryPlanner": {
    "winningPlan": {
      "stage": "FETCH",                    // 取文档阶段
      "inputStage": {
        "stage": "IXSCAN",                 // 索引扫描！
        "keyPattern": { email: 1 },
        "indexName": "email_1",
        "isMultiKey": false,
        "direction": "forward"
      }
    },
    "rejectedPlans": [...]                 // 被否决的候选计划
  }
}
\`\`\`

> **winningPlan** 是优化器最终选中的执行计划；**rejectedPlans** 是被否决的候选方案，看它可以了解优化器的决策过程。

### 15.2.1 常见 stage 类型

| stage | 含义 | 好坏 |
| --- | --- | --- |
| \`COLLSCAN\` | 全集合扫描 | ❌ **没走索引，慢！** |
| \`IXSCAN\` | 索引扫描 | ✅ 好 |
| \`FETCH\` | 根据索引取文档 | ➖ 通常跟在 IXSCAN 后 |
| \`SORT\` | 内存排序 | ⚠️ **可能慢**，超 32MB 报错 |
| \`PROJECTION\` | 字段投影 | ➖ 正常 |
| \`LIMIT\` / \`SKIP\` | 限制/跳过 | ➖ 正常 |
| \`TEXT\` | 全文检索 | ➖ 正常 |
| \`GEO_NEAR\` | 地理空间近邻 | ➖ 正常 |
| \`IDHACK\` | _id 等值查询优化 | ✅ 特殊优化 |
| \`AND_SORTED\` / \`AND_HASH\` | 索引交集 | ⚠️ 不一定快 |

> **危险信号**：看到 \`COLLSCAN\` 或 \`SORT\`（大结果集），基本要加索引。

### 15.2.2 stage 的嵌套结构

执行计划是一棵树，\`inputStage\` 是子阶段：

\`\`\`javascript
// 一个典型的查询计划树
{
  stage: "LIMIT",
  limitAmount: 10,
  inputStage: {
    stage: "SORT",              // 内存排序
    sortPattern: { age: -1 },
    inputStage: {
      stage: "FETCH",           // 取文档
      inputStage: {
        stage: "IXSCAN",        // 索引扫描
        indexName: "status_1"
      }
    }
  }
}
// 从最内层往外执行：IXSCAN → FETCH → SORT → LIMIT
\`\`\`

## 15.3 读懂 executionStats

\`\`\`javascript
db.users.find({ age: { \$gt: 30 } }).explain("executionStats");
\`\`\`

\`\`\`javascript
{
  "executionStats": {
    "executionSuccess": true,
    "nReturned": 1500,            // 返回的文档数
    "executionTimeMillis": 45,    // 总耗时（毫秒）
    "totalKeysExamined": 1500,    // 扫描的索引键数
    "totalDocsExamined": 1500,    // 扫描的文档数
    "executionStages": {
      "stage": "FETCH",
      "nReturned": 1500,
      "inputStage": {
        "stage": "IXSCAN",
        "nReturned": 1500,
        "keysExamined": 1500
      }
    }
  }
}
\`\`\`

### 15.3.1 三个核心指标

| 指标 | 含义 | 健康值 |
| --- | --- | --- |
| \`nReturned\` | 最终返回的文档数 | — |
| \`totalKeysExamined\` | 扫描的索引键数 | 接近 nReturned |
| \`totalDocsExamined\` | 扫描的文档数 | 接近 nReturned |

**理想比例**：\`keysExamined ≈ docsExamined ≈ nReturned\`。

如果 \`keysExamined: 100000, nReturned: 10\`，说明扫了 10 万索引键才返回 10 条——索引选择度太低，要换索引或加条件。

### 15.3.2 指标健康度判断

\`\`\`javascript
// ✅ 健康：三者接近
{ nReturned: 100, totalKeysExamined: 100, totalDocsExamined: 100 }

// ⚠️ 一般：扫了一些索引但文档少
{ nReturned: 100, totalKeysExamined: 500, totalDocsExamined: 500 }

// ❌ 不健康：扫了大量索引才返回少量
{ nReturned: 10, totalKeysExamined: 100000, totalDocsExamined: 100000 }

// ❌ 最差：全表扫描
{ nReturned: 10, totalKeysExamined: 0, totalDocsExamined: 1000000 }
\`\`\`

## 15.4 优化案例

### 15.4.1 案例 1：从 COLLSCAN 到 IXSCAN

\`\`\`javascript
// 查询：找北京的活跃用户
db.users.find({ city: "北京", status: "active" }).explain("executionStats");

// 输出：stage: "COLLSCAN", totalDocsExamined: 1000000, executionTimeMillis: 800
// 病因：没索引

// 加复合索引
db.users.createIndex({ city: 1, status: 1 });

// 再 explain
// stage: "IXSCAN", totalDocsExamined: 5000, executionTimeMillis: 12
\`\`\`

### 15.4.2 案例 2：消除内存排序

\`\`\`javascript
db.orders.find({ status: "paid" }).sort({ created_at: -1 }).explain("executionStats");

// 输出：有 SORT stage, executionTimeMillis: 500
// 病因：排序字段没进索引，MongoDB 在内存里排

// 加复合索引（status 等值 + created_at 排序）
db.orders.createIndex({ status: 1, created_at: -1 });

// 再 explain：SORT 消失，IXSCAN 直接按索引顺序取 → 极快
\`\`\`

> **排序利用索引的判定**：索引字段的顺序和方向要与 sort 完全匹配（或完全反向），且 sort 字段必须紧跟在等值字段后。

### 15.4.3 案例 3：索引选择度低

\`\`\`javascript
db.logs.find({ level: "INFO" }).explain("executionStats");
// 假设 90% 的日志是 INFO

// 即使有 { level: 1 } 索引
// totalKeysExamined: 900000, nReturned: 900000
// 索引"区分度"太低，优化器可能直接选 COLLSCAN 更划算
\`\`\`

**对策**：低选择度字段不要单独建索引，要么和其他字段组合，要么用部分索引。

\`\`\`javascript
// 只给 ERROR 级别日志建部分索引
db.logs.createIndex(
  { timestamp: -1 },
  { partialFilterExpression: { level: "ERROR" } }
);
db.logs.find({ level: "ERROR", timestamp: { \$gte: ISODate("2026-07-10") } });
\`\`\`

## 15.5 索引交集（Index Intersection）

MongoDB 可以**同时使用多个索引**，把结果取交集或并集。

\`\`\`javascript
// 有两个独立索引
db.users.createIndex({ age: 1 });
db.users.createIndex({ city: 1 });

// 查询条件同时涉及 age 和 city
db.users.find({ age: { \$gt: 20 }, city: "北京" }).explain();
// 优化器可能：
// 方案 A：用 { age: 1 } 索引扫 age，再 FETCH 过滤 city
// 方案 B：用 { city: 1 } 索引扫 city，再 FETCH 过滤 age
// 方案 C：两个索引都扫，取交集（AND_SORTED / AND_HASH）
\`\`\`

### 15.5.1 交集 vs 复合索引

| 对比 | 索引交集 | 复合索引 |
| --- | --- | --- |
| 查询性能 | 一般不如复合索引 | 更高效 |
| 写入开销 | 两个小索引 | 一个复合索引 |
| 灵活性 | 各字段可独立查 | 受前缀限制 |
| 排序支持 | ❌ 不能用交集排序 | ✅ 可以 |

> **结论**：索引交集是优化器的"备选方案"，不要指望它。有明确查询模式时，**复合索引永远优于索引交集**。

## 15.6 索引选择机制

MongoDB 优化器会为每个查询**评估多个候选索引**，选"代价最低"的。评估依据：

1. **扫描的索引键数**（越少越好）
2. **是否需要内存排序**（不需要更好）
3. **是否能覆盖查询**（覆盖最好）

> **缓存**：MongoDB 会缓存"查询形状 → 选中的计划"的映射，避免每次都评估。集合的**数据分布变化**或**新建/删索引**会让缓存失效重评。

\`\`\`javascript
// 手动清理计划缓存（极少需要）
db.runCommand({ planCacheClear: "users" });

// 查看计划缓存
db.runCommand({ planCacheListFilters: "users" });
\`\`\`

## 15.7 hint：强制指定索引

优化器选错了？可以强制用某个索引：

\`\`\`javascript
// 强制走 age 索引
db.users.find({ age: { \$gt: 30 }, city: "北京" }).hint({ age: 1 });

// 强制走某个命名索引
db.users.find({ age: { \$gt: 30 } }).hint("age_1");

// 强制全表扫描（调试用，生产别干）
db.users.find({ age: { \$gt: 30 } }).hint({ \$natural: 1 });
\`\`\`

> **警告**：hint 是"我比你聪明"的开关。数据分布变了 hint 不会自动适应，可能变成性能陷阱。生产慎用，临时调试可以。

### 15.7.1 hint 的使用场景

- 优化器选了次优索引，你有明确证据
- 临时验证"换一个索引会不会更快"
- 应急绕过优化器 bug（极少）

## 15.8 覆盖查询优化

让查询只走索引不读文档：

\`\`\`javascript
db.users.createIndex({ email: 1, name: 1, age: 1 });

// ❌ 不是覆盖：返回了 _id（不在索引里）
db.users.find({ email: "zs@x.com" });

// ✅ 覆盖查询：只返回索引有的字段，并排除 _id
db.users.find(
  { email: "zs@x.com" },
  { email: 1, name: 1, age: 1, _id: 0 }
).explain("executionStats");
// executionStages.stage 是 PROJECTION + IXSCAN，没有 FETCH
// totalDocsExamined: 0
\`\`\`

> **判定**：explain 里没有 FETCH stage，且 \`totalDocsExamined: 0\`，就是覆盖查询。

## 15.9 聚合管道的 explain

聚合也能 explain，看每个阶段的处理：

\`\`\`javascript
db.orders.explain("executionStats").aggregate([
  { \$match: { status: "paid" } },
  { \$group: { _id: "\$user_id", total: { \$sum: "\$price" } } },
  { \$sort: { total: -1 } },
  { \$limit: 10 }
]);
\`\`\`

> **重点看 \$match 阶段**：它是否走了索引。后续阶段是内存计算，文档数越少越快——这就是为什么强调 \$match 放最前。

## 15.10 常见的坏查询模式

### 15.10.1 前缀模糊查询

\`\`\`javascript
// ❌ 正则前缀通配符，走不了索引
db.users.find({ name: /^张/ });   // ✅ 前缀固定可以走索引
db.users.find({ name: /张/ });     // ❌ 中间匹配走不了索引
db.users.find({ name: /张\$/ });   // ❌ 后缀匹配走不了索引
\`\`\`

### 15.10.2 字段类型不匹配

\`\`\`javascript
db.users.createIndex({ age: 1 });

// ❌ age 存的是数字，用字符串查走不了索引
db.users.find({ age: "25" });

// ✅ 类型一致
db.users.find({ age: 25 });
\`\`\`

### 15.10.3 对索引字段做运算

\`\`\`javascript
db.orders.createIndex({ created_at: 1 });

// ❌ 对字段做运算，索引失效
db.orders.find({ \$expr: { \$eq: [{ \$year: "\$created_at" }, 2026] } });

// ✅ 用范围查询
db.orders.find({
  created_at: { \$gte: ISODate("2026-01-01"), \$lt: ISODate("2027-01-01") }
});
\`\`\`

### 15.10.4 否定条件

\`\`\`javascript
// ❌ $ne / $nin 通常走不了索引（要扫全表排除）
db.users.find({ status: { \$ne: "deleted" } });
db.users.find({ tags: { \$nin: ["spam", "test"] } });

// ✅ 改用正向条件
db.users.find({ status: { \$in: ["active", "pending"] } });
\`\`\`

### 15.10.5 大 skip 分页

\`\`\`javascript
// ❌ skip 越大越慢，要扫过前 10000 条
db.orders.find({}).skip(10000).limit(10);

// ✅ 用游标分页（记住上一页最后一条的 _id）
db.orders.find({ _id: { \$gt: last_id } }).limit(10);
\`\`\`

## 15.11 索引使用率分析

\`\`\`javascript
// 查看索引使用统计（4.2+）
db.users.aggregate([{ \$indexStats: {} }]);
// 输出：
// { name: "_id_", accesses: { ops: 5000, since: ISODate(...) } }
// { name: "email_1", accesses: { ops: 200, since: ISODate(...) } }
// { name: "old_idx", accesses: { ops: 0, since: ISODate(...) } }  ← 从没被用过！
\`\`\`

> **清理建议**：\`ops: 0\` 的索引就是"僵尸索引"，白白占空间和写入开销，果断删除。

### 15.11.1 监控慢查询

\`\`\`javascript
// 开启 profiling
db.setProfilingLevel(1, { slowms: 100 });   // 记录超过 100ms 的查询
db.setProfilingLevel(2);                     // 记录所有查询（慎用，影响性能）

// 查看慢查询
db.system.profile.find().sort({ ts: -1 }).limit(10);

// 找全表扫描的慢查询
db.system.profile.find({ planSummary: "COLLSCAN" }).sort({ millis: -1 });

// 关闭 profiling
db.setProfilingLevel(0);
\`\`\`

## 15.12 踩坑点

**坑 1：只看 queryPlanner 误判**

\`\`\`javascript
// queryPlanner 显示 IXSCAN，看似走了索引
// 但 executionStats 显示 keysExamined: 100000, nReturned: 5
// 实际上索引选择度极差，比 COLLSCAN 还慢
\`\`\`

**坑 2：生产用 hint 写死索引**

数据涨了 10 倍后，原索引不再最优，但 hint 还在用老索引，性能暴跌。除非有充分理由，否则别用 hint。

**坑 3：忘了排 _id 破覆盖**

\`\`\`javascript
db.users.find({ email: "zs@x.com" }, { email: 1, name: 1 });
// 默认带 _id，_id 不在索引里 → 不是覆盖查询

db.users.find({ email: "zs@x.com" }, { email: 1, name: 1, _id: 0 });
// 排掉 _id → 覆盖查询
\`\`\`

**坑 4：内存排序超限**

\`\`\`javascript
db.orders.find({ status: "paid" }).sort({ created_at: -1 });
// 没建复合索引，MongoDB 在内存排
// 结果集大 → 报错：Sort operation used more than 33554432 bytes
\`\`\`

> 32MB 是默认排序内存上限。要么建索引消除排序，要么用 \`allowDiskUse\`（聚合）/ 调服务器参数。

**坑 5：explain("executionStats") 不执行聚合**

带 \$out / \$merge 的聚合，executionStats 行为不同（不会真正写入目标集合）。普通 find 都会真执行。

## 15.13 调优清单

按这个顺序排查慢查询：

1. **explain("executionStats")**：看 stage 和三个指标
2. **有 COLLSCAN？** → 加索引
3. **有 SORT？** → 排序字段加进复合索引
4. **keysExamined 远大于 nReturned？** → 索引选择度低，换字段组合
5. **能覆盖查询吗？** → 投影只取索引字段，排除 _id
6. **复合索引顺序符合 ESR？** → 等值、排序、范围
7. **是否有坏查询模式？** → 否定条件、模糊匹配、大 skip
8. **是否有僵尸索引？** → \$indexStats 检查，删除 ops:0 的索引
9. **是否真的需要这个查询？** → 业务侧能否缓存或预聚合

## 15.14 小结

- **三种 explain 模式**：queryPlanner（看计划）、executionStats（看真实执行）、allPlansExecution（看候选）
- **核心 stage**：IXSCAN 好、COLLSCAN 坏、FETCH 通常有、SORT 要警惕
- **三个指标**：nReturned、totalKeysExamined、totalDocsExamined，三者越接近越好
- **索引交集**：优化器备选，复合索引永远优先
- **hint**：强制指定索引，生产慎用
- **坏模式**：否定条件、模糊匹配、字段运算、大 skip 分页、类型不匹配
- **\$indexStats**：找出僵尸索引，定期清理
- **调优清单**：explain → 看 stage → 看指标 → 改索引 → 重测

至此，MongoDB 实战教程的基础、查询、聚合、索引四大主题就讲完了。掌握这些，你已经能独立设计一个 MongoDB 后端的数据层。后续可以继续深入副本集、分片、事务、Change Stream 等进阶主题。`
  }
];

export { chapters };
