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
    icon: "⚙️",
    title: "第 11 章 聚合管道进阶",
    content: `# 第 11 章 聚合管道进阶

> "当简单的 \$match + \$group 不够用时，你需要 \$lookup 关联、\$facet 多分支、\$bucket 分桶——这些是聚合管道的真正威力所在。"

上一章我们学了聚合管道的基础语法。但真实业务里，你经常会遇到"跨集合关联"、"一次出多份报表"、"按区间分组"这类需求。本章带你掌握聚合管道的进阶操作符，让 MongoDB 也能干"像 SQL JOIN 一样的活"。

## 11.1 \$lookup：左外连接

MongoDB 是文档数据库，原则上不鼓励频繁关联。但有时数据天然分散在多个集合（比如订单和用户），\$lookup 就是你的"JOIN"。

\`\`\`javascript
// orders 集合里只有 user_id，想把用户信息带出来
db.orders.aggregate([
  {
    \$lookup: {
      from: "users",           // 要关联的集合
      localField: "user_id",   // 当前集合的字段
      foreignField: "_id",     // 目标集合的字段
      as: "user_info"          // 输出字段名（数组）
    }
  }
]);
// 结果：每个 order 多了 user_info: [{ _id, name, email, ... }]
\`\`\`

**关键点**：\`as\` 指定的字段**永远是数组**，即使只匹配到一条。取值时通常用 \`user_info[0]\` 或配合 \$unwind 展开。

### 11.1.1 带子管道的 \$lookup（MongoDB 3.6+）

如果只想带出用户的姓名，不要全部字段：

\`\`\`javascript
db.orders.aggregate([
  {
    \$lookup: {
      from: "users",
      let: { uid: "\$user_id" },       // 把当前文档的字段声明为变量
      pipeline: [
        { \$match: { \$expr: { \$eq: ["\$_id", "\$\$uid"] } } },
        { \$project: { name: 1, email: 1, _id: 0 } }
      ],
      as: "user_info"
    }
  }
]);
// user_info: [{ name: "张三", email: "zs@x.com" }]
\`\`\`

> \`let\` 声明的变量在子管道里用 \`\$\$变量名\` 引用（两个美元符号）。这是"相关子查询"的写法。

### 11.1.2 \$unwind 展开

把 user_info 数组展开成多条记录（类似 SQL 的 JOIN 行膨胀）：

\`\`\`javascript
db.orders.aggregate([
  { \$lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "u" } },
  { \$unwind: "\$u" }    // 数组里有 1 条 → 展开 1 行；N 条 → N 行
]);
\`\`\`

## 11.2 \$facet：多分支聚合

一次聚合只能输出一个结果流。但报表场景经常要"同时出：总数、按状态分组、按月份分组"。用 \$facet 可以并行跑多个子管道。

\`\`\`javascript
db.orders.aggregate([
  {
    \$facet: {
      // 分支 1：总数和总金额
      "summary": [
        { \$group: { _id: null, total: { \$sum: 1 }, amount: { \$sum: "\$price" } } }
      ],
      // 分支 2：按状态分组
      "byStatus": [
        { \$group: { _id: "\$status", count: { \$sum: 1 } } },
        { \$sort: { count: -1 } }
      ],
      // 分支 3：按月份分桶
      "byMonth": [
        { \$group: {
          _id: { \$month: "\$created_at" },
          count: { \$sum: 1 }
        }}
      ]
    }
  }
]);
\`\`\`

输出形如：

\`\`\`javascript
{
  "summary": [{ total: 1000, amount: 99999 }],
  "byStatus": [{ _id: "paid", count: 800 }, { _id: "pending", count: 200 }],
  "byMonth": [{ _id: 1, count: 100 }, { _id: 2, count: 120 }]
}
\`\`\`

> **用途**：仪表盘首页一次请求拿全所有统计；避免前端发 3 次请求。

## 11.3 \$bucket：按区间分桶

把连续值（年龄、价格、金额）切成几个区间统计。比 \$group + 数学运算简洁。

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

**边界规则**：\`boundaries\` 必须是**升序**数组，区间是**左闭右开** \[a, b)。最后一段 \[45, 60) 不含 60。

## 11.4 \$addFields / \$set：追加字段

在管道中间给文档**添加或覆盖**字段，不破坏原有字段。

\`\`\`javascript
db.products.aggregate([
  // 添加一个 final_price 字段 = price * discount
  { \$addFields: {
    final_price: { \$multiply: ["\$price", { \$subtract: [1, "\$discount"] }] }
  }},
  // 再筛出折扣价 > 100 的
  { \$match: { final_price: { \$gt: 100 } } }
]);
\`\`\`

> \`\$set\` 是 \`\$addFields\` 的别名，行为完全一致。推荐用 \$addFields，语义更明确。

## 11.5 \$replaceRoot：替换根文档

把某个子对象"提升"为文档根。常用于 \$lookup 后想把嵌套的 user_info 提到顶层。

\`\`\`javascript
db.orders.aggregate([
  { \$lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "u" } },
  { \$unwind: "\$u" },
  // 把 u.name 提到顶层，原 order 的字段保留在 order 字段下
  { \$replaceRoot: {
    newRoot: {
      \$mergeObjects: ["\$u", { order_info: "\$\$ROOT" }]
    }
  }}
]);
\`\`\`

\`\$mergeObjects\` 把多个对象合并（后者覆盖前者）。

## 11.6 \$count：快速计数

\`\`\`javascript
// 统计年龄大于 30 的用户数
db.users.aggregate([
  { \$match: { age: { \$gt: 30 } } },
  { \$count: "older_count" }
]);
// 输出：{ older_count: 42 }
\`\`\`

等价于 \`{ \$group: { _id: null, older_count: { \$sum: 1 } } }\`，但更简洁。

## 11.7 性能优化要点

聚合管道跑得慢，90% 是因为**顺序写错了**。记住以下原则：

### 11.7.1 早过滤：\$match 放最前

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

> **黄金法则**：\$match 永远尽量往前放。它能利用索引，把后续阶段处理的文档数降到最少。

### 11.7.2 早投影：\$project 减少字段

\`\`\`javascript
db.logs.aggregate([
  { \$match: { level: "error" } },
  { \$project: { message: 1, timestamp: 1, _id: 0 } },  // 去掉冗余字段
  { \$group: { _id: "\$message", count: { \$sum: 1 } } }
]);
\`\`\`

字段越少，每条文档占内存越小，管道吞吐越高。

### 11.7.3 谨慎用 \$lookup

\$lookup 本质是对每条输入文档去 from 集合做一次查询。如果输入 10 万条，就是 10 万次查询。

**优化手段**：
- 让 foreignField 上有索引
- 用 \`let + pipeline\` 在子管道里加 \$match 提前过滤
- 输入文档数先用 \$group 压缩

## 11.8 踩坑点

**坑 1：忘记 \$lookup 的 as 是数组**

\`\`\`javascript
// ❌ 直接用 \$user_info.name 取不到值
{ \$project: { user_name: "\$user_info.name" } }   // undefined

// ✅ 取数组第一个
{ \$project: { user_name: { \$arrayElemAt: ["\$user_info.name", 0] } } }
// 或先 \$unwind
\`\`\`

**坑 2：\$bucket 边界不升序**

\`\`\`javascript
// ❌ 报错：boundaries must be sorted
{ \$bucket: { groupBy: "\$age", boundaries: [30, 18, 45] } }
\`\`\`

**坑 3：\$facet 里子管道不能跨分支共享中间结果**

每个分支是**独立**的管道，从头跑。不要指望在 byStatus 分支里用到 byMonth 的输出。

**坑 4：\$replaceRoot 的 newRoot 必须是对象**

\`\`\`javascript
// ❌ 报错：newRoot 必须是 document
{ \$replaceRoot: { newRoot: "\$name" } }   // name 是字符串

// ✅ 包成对象
{ \$replaceRoot: { newRoot: { name: "\$name" } } }
\`\`\`

## 11.9 小结

- **\$lookup**：跨集合左外连接，结果字段是数组；3.6+ 支持 let + pipeline 子查询
- **\$facet**：一次并行跑多个子管道，适合仪表盘
- **\$bucket**：按区间分桶，边界升序、左闭右开
- **\$addFields / \$set**：追加字段不破坏原字段
- **\$replaceRoot**：把子对象提升为根文档
- **\$count**：简洁的计数阶段
- **性能**：\$match 放最前、\$project 早瘦身、\$lookup 慎用

下一章我们深入**表达式与操作符**——算术、字符串、日期、条件、数组表达式，让聚合管道能做更复杂的计算。`
  },

  // =========================================================
  // 第十二章：表达式与操作符
  // =========================================================
  {
    id: "mongo-ch12",
    group: "第三部分 聚合进阶与索引",
    icon: "📐",
    title: "第 12 章 表达式与操作符",
    content: `# 第 12 章 表达式与操作符

> "聚合管道之所以强大，是因为它有一套完整的表达式语言——算术、字符串、日期、条件、数组，几乎是个内嵌的函数库。"

上一章你学会了管道的"骨架"（\$match、\$group、\$lookup 等阶段）。本章讲的是"血肉"——**表达式操作符**。它们出现在阶段内部，比如 \`{ \$multiply: ["\$price", 2] }\`，用来对字段做计算。掌握它们，你才能写出真正灵活的聚合。

## 12.1 表达式语法基础

表达式操作符的统一语法：

\`\`\`javascript
{ \$操作符名: [参数1, 参数2, ...] }   // 大多数
{ \$操作符名: 参数 }                  // 单参数的（如 \$toUpper）
\`\`\`

**字段引用**：\`\$字段名\` 表示"取当前文档的这个字段"。
**字面量**：数字、字符串直接写。
**嵌套**：表达式可以嵌套，比如 \`{ \$add: [{ \$multiply: ["\$price", "\$qty"] }, "\$shipping"] }\`。

## 12.2 算术表达式

| 操作符 | 作用 | 示例 |
| --- | --- | --- |
| \`\$add\` | 加法（可多参数，也支持日期+毫秒） | \`{ \$add: ["\$price", "\$tax"] }\` |
| \`\$subtract\` | 减法 | \`{ \$subtract: ["\$total", "\$discount"] }\` |
| \`\$multiply\` | 乘法 | \`{ \$multiply: ["\$price", "\$qty"] }\` |
| \`\$divide\` | 除法 | \`{ \$divide: ["\$sum", "\$count"] }\` |
| \`\$mod\` | 取模 | \`{ \$mod: ["\$n", 2] }\` |
| \`\$round\` | 四舍五入（4.2+） | \`{ \$round: ["\$price", 2] }\` |

\`\`\`javascript
// 计算订单实付金额 = 小计 - 折扣 + 运费
db.orders.aggregate([
  { \$project: {
    paid_amount: {
      \$add: [
        { \$subtract: ["\$subtotal", "\$discount"] },
        "\$shipping"
      ]
    }
  }}
]);
\`\`\`

> **注意**：所有算术操作符对 \`null\` / \`undefined\` 字段会返回 null。要避免可以用 \`\$ifNull\` 兜底。

## 12.3 字符串表达式

| 操作符 | 作用 |
| --- | --- |
| \`\$concat\` | 拼接字符串 |
| \`\$toUpper\` / \`\$toLower\` | 大小写转换 |
| \`\$substr\` / \`\$substrCP\` | 截取（字节 / 码点） |
| \`\$strLenCP\` | 字符串长度（按字符） |
| \`\$split\` | 按分隔符切分 |
| \`\$trim\` | 去首尾空白 |
| \`\$regexMatch\` | 正则匹配（4.0+） |

\`\`\`javascript
// 生成 "张三 <zs@x.com>" 格式的展示名
db.users.aggregate([
  { \$project: {
    display: {
      \$concat: ["\$name", " <", "\$email", ">"]
    },
    name_len: { \$strLenCP: "\$name" },     // 中文按字符算
    domain: { \$arrayElemAt: [{ \$split: ["\$email", "@"] }, 1] }
  }}
]);
\`\`\`

> **中文坑**：\`\$substr\` 按字节切，中文字符会切出乱码；处理中文一定要用 \`\$substrCP\` 和 \`\$strLenCP\`。

## 12.4 日期表达式

MongoDB 内部用 64 位整数存毫秒时间戳，但聚合时可以用一组操作符拆解：

| 操作符 | 返回 |
| --- | --- |
| \`\$year\` / \`\$month\` / \`\$dayOfMonth\` | 年 / 月 / 日 |
| \`\$hour\` / \`\$minute\` / \`\$second\` | 时 / 分 / 秒 |
| \`\$dayOfWeek\` | 星期几（1=周日，7=周六） |
| \`\$dayOfYear\` | 一年里第几天 |
| \`\$week\` | 一年里第几周 |
| \`\$dateToString\` | 格式化为字符串 |
| \`\$dateTrunc\` | 按单位截断（5.0+） |

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

// 格式化日期
{ \$project: {
  date_str: { \$dateToString: { format: "%Y-%m-%d", date: "\$created_at" } }
}}
\`\`\`

> \`\$dateToString\` 的 \`format\` 用 strftime 风格：\`%Y\` 年、\`%m\` 月、\`%d\` 日、\`%H\` 时、\`%M\` 分、\`%S\` 秒。
>
> **时区**：默认 UTC。要转东八区加 \`timezone: "Asia/Shanghai"\`。

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

// 简写（数组形式）
{ \$cond: [{ \$gte: ["\$price", 100] }, { \$multiply: ["\$price", 0.9] }, "\$price"] }
\`\`\`

### 12.5.2 \$ifNull：空值兜底

\`\`\`javascript
// nickname 为 null 或不存在时用 "匿名"
{ \$project: { name: { \$ifNull: ["\$nickname", "匿名"] } } }
\`\`\`

注意：\`\$ifNull\` 接受**两个参数**，第二个是默认值。多个备选可以嵌套：

\`\`\`javascript
{ \$ifNull: ["\$a", { \$ifNull: ["\$b", "\$c"] }] }
\`\`\`

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

## 12.6 数组表达式

| 操作符 | 作用 |
| --- | --- |
| \`\$size\` | 数组长度 |
| \`\$arrayElemAt\` | 取第 N 个元素 |
| \`\$concatArrays\` | 拼接多个数组 |
| \`\$reverseArray\` | 反转数组 |
| \`\$filter\` | 按条件过滤元素 |
| \`\$map\` | 对每个元素做变换 |
| \`\$reduce\` | 归约（累加等） |
| \`\$in\` | 判断元素是否在数组里 |
| \`\$slice\` | 截取子数组 |

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
      in: { \$multiply: ["\$\$p", 0.8] }
    }
  }
}}
\`\`\`

### 12.6.3 \$reduce：累加

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

> \` initialValue\` 是初始值，\`\$\$value\` 是累加器，\`\$\$this\` 是当前元素。

## 12.7 类型转换表达式（4.0+）

| 操作符 | 作用 |
| --- | --- |
| \`\$toString\` / \`\$toInt\` / \`\$toDouble\` / \`\$toBool\` | 转基础类型 |
| \`\$toDate\` / \`\$toDecimal\` / \`\$toLong\` | 转日期/定点数/长整型 |
| \`\$convert\` | 带容错的转换 |

\`\`\`javascript
// 把字符串日期转成 Date 类型（失败返回 onError 的值）
{ \$project: {
  created: { \$convert: { input: "\$created_str", to: "date", onError: null, onNull: null } }
}}
\`\`\`

> \`\$toDate\` 失败会**抛错中断聚合**；\`\$convert\` 可以用 \`onError\` 兜底，更安全。

## 12.8 踩坑点

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
\`\`\`

要避免就先用 \`\$ifNull\` 兜底成 0。

**坑 4：\$substr 切中文乱码**

\`\`\`javascript
{ \$substr: ["\$name", 0, 3] }   // "张三李" 可能切出 "张三?" 乱码
{ \$substrCP: ["\$name", 0, 3] } // 正确
\`\`\`

## 12.9 小结

- **算术**：\$add / \$subtract / \$multiply / \$divide / \$round
- **字符串**：处理中文用 \`*CP\` 系列（\$substrCP / \$strLenCP）
- **日期**：\$year/\$month/\$dayOfMonth + \$dateToString，注意时区
- **条件**：\$cond 三元、\$ifNull 兜底、\$switch 多分支
- **数组**：\$filter / \$map / \$reduce 是函数式三剑客
- **类型转换**：用 \$convert + onError 比 \$toXxx 更安全
- **字段引用**：\`\$字段\` 取字段，\`\$\$变量\` 取 let/as 声明的变量

下一章进入**索引**主题——单字段索引、复合索引、ESR 原则、索引代价。索引是 MongoDB 性能优化的核心武器。`
  },

  // =========================================================
  // 第十三章：索引基础
  // =========================================================
  {
    id: "mongo-ch13",
    group: "第三部分 聚合进阶与索引",
    icon: "⚡",
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

## 13.2 _id 默认索引

每个集合创建时，MongoDB 自动在 \`_id\` 字段上建**唯一索引**。这个索引**不能删除**。

\`\`\`javascript
db.users.getIndexes();
// 输出：
// [ { v: 2, key: { _id: 1 }, name: "_id_" } ]
\`\`\`

## 13.3 单字段索引

最简单的索引：对一个字段建。

\`\`\`javascript
// 1 表示升序，-1 表示降序
db.users.createIndex({ age: 1 });     // 升序索引
db.users.createIndex({ name: -1 });   // 降序索引
\`\`\`

**关键事实**：单字段索引**对查询方向不敏感**。即 \`{ age: 1 }\` 的索引，既能服务 \`sort({ age: 1 })\`，也能服务 \`sort({ age: -1 })\`。所以单字段索引升序降序无所谓。

## 13.4 复合索引

多个字段组合成一个索引。这是实际工作中**用得最多**的索引类型。

\`\`\`javascript
// 在 status + created_at 上建复合索引
db.orders.createIndex({ status: 1, created_at: -1 });
\`\`\`

### 13.4.1 ESR 原则：字段顺序怎么定

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

### 13.4.2 索引前缀

复合索引 \`{ a: 1, b: 1, c: 1 }\` 可以服务以下查询：

\`\`\`javascript
{ a }              // ✅ 前缀
{ a, b }           // ✅ 前缀
{ a, b, c }        // ✅ 全部
{ b }              // ❌ 不是前缀
{ a, c }           // ⚠️ 只能用 a 部分
{ b, c }           // ❌ 不是前缀
\`\`\`

> **要点**：复合索引只能从最左字段开始连续使用。设计索引时把"必查"的字段放最左。

## 13.5 创建 / 查看 / 删除索引

\`\`\`javascript
// 创建（可指定选项）
db.users.createIndex({ email: 1 }, { unique: true, name: "email_unique" });

// 查看集合所有索引
db.users.getIndexes();

// 查看索引大小（字节）
db.users.stats().indexSizes;

// 删除索引（按名字）
db.users.dropIndex("email_unique");

// 删除所有非 _id 索引
db.users.dropIndexes();
\`\`\`

**后台建索引**：数据量大时，建索引会阻塞集合。加 \`background: true\`（5.0 后已默认非阻塞，参数被忽略但兼容）：

\`\`\`javascript
db.big_coll.createIndex({ field: 1 }, { background: true });
\`\`\`

## 13.6 索引的代价

索引不是越多越好。每个索引都是一份独立的 B 树，要付出：

| 代价 | 说明 |
| --- | --- |
| **写放大** | 每次插入/更新/删除，所有相关索引都要同步修改 |
| **存储** | 索引本身占磁盘，可能和原数据一样大 |
| **内存** | MongoDB 倾向把"热"索引放内存（WiredTiger 缓存），索引多了挤占 |
| **优化器负担** | 查询有 N 个索引可选时，优化器要逐一评估，反而变慢 |

> **经验法则**：一个集合保持 **5-10 个索引**以内。每个索引都要有明确的查询场景支撑。没用的索引果断删。

## 13.7 索引选择示例

### 13.7.1 模式分析

\`\`\`javascript
// 查看 5 万次以上的慢查询
db.adminCommand({
  "profile": 1,
  "slowms": 50000
});

// 看哪些查询没走索引
db.system.profile.find({ planSummary: "COLLSCAN" });
\`\`\`

### 13.7.2 实战决策

查询："找最近一周内、状态为 paid、金额大于 1000 的订单，按金额倒序"

\`\`\`javascript
db.orders
  .find({
    status: "paid",
    created_at: { \$gte: ISODate("2026-06-01") },
    amount: { \$gt: 1000 }
  })
  .sort({ amount: -1 });

// ESR 分析：
// E: status（等值）
// S: amount（排序）
// R: created_at（范围）+ amount（范围）
// 注意：amount 既是排序又是范围，这种情况一般放排序位置
db.orders.createIndex({ status: 1, amount: -1, created_at: 1 });
\`\`\`

## 13.8 踩坑点

**坑 1：索引建了却没走**

\`\`\`javascript
db.users.createIndex({ age: 1 });

// ❌ 这个查询走不了索引
db.users.find({ age: { \$type: "string" } });  // 类型不匹配
db.users.find({}).sort({ age: 1 });            // 没有过滤条件，优化器可能选 COLLSCAN

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

某集合建了 20 个索引，每次插入都要更新 20 棵 B 树，写入吞吐掉 70%。

**坑 4：忘了删除测试时建的索引**

\`\`\`javascript
// 列出所有索引，逐个评估必要性
db.users.getIndexes();
// 看到没人查的字段上的索引 → 删
\`\`\`

## 13.9 小结

- **索引本质**：B 树，用空间换时间
- **_id 索引**：默认唯一，不可删
- **单字段索引**：升序降序无所谓
- **复合索引**：ESR 原则——等值、排序、范围
- **前缀规则**：复合索引只能从最左字段连续使用
- **代价**：写放大、存储、内存、优化器负担
- **数量控制**：5-10 个以内，没用的果断删

下一章学习**索引类型**——唯一索引、部分索引、TTL、文本、地理空间、稀疏索引，应对不同业务场景。`
  },

  // =========================================================
  // 第十四章：索引类型
  // =========================================================
  {
    id: "mongo-ch14",
    group: "第三部分 聚合进阶与索引",
    icon: "🎯",
    title: "第 14 章 索引类型",
    content: `# 第 14 章 索引类型

> "普通索引只能做等值和范围查询。要保证唯一、自动过期、全文检索、附近的人——你需要专门的索引类型。"

本章讲 MongoDB 的各种索引类型，每种都对应一类业务场景。学会按场景选索引，能省下大量代码。

## 14.1 createIndex 选项回顾

\`\`\`javascript
db.coll.createIndex(
  { 字段: 1 },
  {
    unique: true,         // 唯一索引
    sparse: true,         // 稀疏索引
    partialFilterExpression: {...},  // 部分索引
    expireAfterSeconds: 3600,        // TTL 索引
    weights: { field: 1 },           // 文本索引权重
    name: "my_index"                 // 自定义名字
  }
);
\`\`\`

## 14.2 唯一索引（unique）

保证索引字段在集合内**不重复**。常用于 username、email 这类业务唯一键。

\`\`\`javascript
db.users.createIndex({ email: 1 }, { unique: true });

// 插入重复 email 会报错
db.users.insertOne({ email: "zs@x.com" });
db.users.insertOne({ email: "zs@x.com" });  // E11000 duplicate key error
\`\`\`

> **注意**：唯一索引对 \`null\` 也视为"一个值"。如果多个文档字段缺失，会被当作 null，导致第二个文档插入失败。要避免就配合 \`sparse\` 用稀疏索引。

### 14.2.1 复合唯一索引

\`\`\`javascript
// (user_id, role_id) 组合唯一
db.user_roles.createIndex({ user_id: 1, role_id: 1 }, { unique: true });
\`\`\`

## 14.3 稀疏索引（sparse）

普通索引会把字段缺失的文档也索引进来（索引项为 null）。稀疏索引**跳过**字段缺失的文档。

\`\`\`javascript
db.users.createIndex({ nickname: 1 }, { sparse: true });

// users 里 80% 没 nickname
// 普通索引：100 万个索引项（含 80 万 null）
// 稀疏索引：20 万个索引项
\`\`\`

> **配合唯一索引**：\`{ unique: true, sparse: true }\` 是经典组合，让"有值的必须唯一，没值的不参与"。

## 14.4 部分索引（partialFilterExpression，3.2+）

比稀疏索引更强大：可以用**任意表达式**指定哪些文档进索引。

\`\`\`javascript
// 只给活跃用户建索引
db.users.createIndex(
  { email: 1 },
  { partialFilterExpression: { status: "active", age: { \$gte: 18 } } }
);

// 这个查询能用上索引
db.users.find({ email: "zs@x.com", status: "active", age: { \$gte: 18 } });

// 这个查询用不上（条件比索引定义窄）
db.users.find({ email: "zs@x.com" });
\`\`\`

> **关键**：查询条件必须**完全包含**部分索引的过滤条件，优化器才会用这个索引。

## 14.5 TTL 索引（自动过期）

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

### 14.5.1 TTL 工作机制

- MongoDB **每 60 秒**扫描一次 TTL 索引，删除过期文档
- 过期时间 = \`文档字段值 + expireAfterSeconds\`
- 字段**必须是 BSON Date 类型**（不能是字符串）
- 删除不是实时的，最多有 60 秒延迟

### 14.5.2 自定义过期时间

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
\`\`\`

## 14.6 文本索引（text）

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

### 14.6.1 文本索引的限制

- **每个集合只能有一个文本索引**
- 默认支持英文，中文分词效果一般（建议用专业搜索引擎如 Elasticsearch）
- 不支持 \$or 与 \$text 混用的某些组合

\`\`\`javascript
// 精确短语搜索（用转义引号）
db.articles.find({ \$text: { \$search: '"MongoDB tutorial"' } });

// 排除词（前缀减号）
db.articles.find({ \$text: { \$search: "MongoDB -MySQL" } });
\`\`\`

## 14.7 地理空间索引（2dsphere）

存储经纬度，查"附近的人"、"5 公里内的店"。

\`\`\`javascript
// 建索引（GeoJSON Point）
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

## 14.8 覆盖查询（Covered Query）

如果查询和投影的字段**全部在索引里**，MongoDB 可以只扫索引不读文档本体，极快。

\`\`\`javascript
db.users.createIndex({ name: 1, age: 1 });

// 这个查询是覆盖的：只查 name 和 age，且都在索引里
db.users.find({ name: "张三" }, { name: 1, age: 1, _id: 0 });
// MongoDB 只需扫索引树，不读 documents
\`\`\`

> **要点**：要覆盖查询，必须显式排除 \`_id\`（\`_id: 0\`），否则会因为读 _id 而破覆盖。

## 14.9 索引选择决策表

| 业务场景 | 推荐索引 |
| --- | --- |
| 用户名/邮箱唯一 | \`{ field: 1 }, unique: true\` |
| 字段大部分为空，只查有值的 | \`{ field: 1 }, sparse: true\` |
| 只给特定子集建索引（如活跃用户） | \`partialFilterExpression\` |
| 会话/验证码自动过期 | \`{ time_field: 1 }, expireAfterSeconds: N\` |
| 文章全文搜索 | \`{ field: "text" }\` |
| 附近的人/店 | \`{ field: "2dsphere" }\` |
| 普通等值/范围 | 单字段或复合索引 |

## 14.10 踩坑点

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
db.sessions.insertOne({ createdAt: "2026-07-06T10:00:00Z" });

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
db.articles.createIndex({ content: "text" });  // 报错：already has a text index

// 正确做法：建一个复合文本索引
db.articles.createIndex({ title: "text", content: "text" });
\`\`\`

## 14.11 小结

- **唯一索引**：保证字段唯一，配合 sparse 处理缺失
- **稀疏索引**：跳过字段缺失的文档
- **部分索引**：用表达式指定子集，比稀疏更灵活
- **TTL 索引**：自动过期删除，字段必须是 Date，60 秒延迟
- **文本索引**：每集合只能一个，中文分词效果有限
- **2dsphere**：GeoJSON，坐标是 [经度, 纬度]
- **覆盖查询**：查询投影全在索引里，要排除 _id

下一章学习**执行计划与索引优化**——用 explain 看查询到底走了哪个索引、扫了多少文档、耗时在哪。`
  },

  // =========================================================
  // 第十五章：执行计划与索引优化
  // =========================================================
  {
    id: "mongo-ch15",
    group: "第三部分 聚合进阶与索引",
    icon: "🔬",
    title: "第 15 章 执行计划与索引优化",
    content: `# 第 15 章 执行计划与索引优化

> "查询慢？别瞎猜。用 explain 让 MongoDB 自己告诉你：走了哪个索引、扫了多少文档、哪一步耗时。看懂执行计划，是性能优化的起点。"

本章教你用 \`explain()\` 读懂 MongoDB 的查询计划，并据此优化索引设计。这是 DBA 和后端工程师的核心技能。

## 15.1 explain 的三种模式

\`\`\`javascript
db.users.find({ email: "zs@x.com" }).explain("queryPlanner");    // 默认：只看选了哪个计划
db.users.find({ email: "zs@x.com" }).explain("executionStats");  // 真正执行，带统计
db.users.find({ email: "zs@x.com" }).explain("allPlansExecution"); // 所有候选计划都执行
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

### 15.2.1 常见 stage

| stage | 含义 |
| --- | --- |
| \`COLLSCAN\` | 全集合扫描（**没走索引**，慢！） |
| \`IXSCAN\` | 索引扫描（好） |
| \`FETCH\` | 根据索引取文档（通常跟在 IXSCAN 后） |
| \`SORT\` | 内存排序（**可能慢**，超 32MB 会报错） |
| \`PROJECTION\` | 字段投影 |
| \`LIMIT\` / \`SKIP\` | 限制/跳过 |
| \`TEXT\` | 全文检索 |
| \`GEO_NEAR\` | 地理空间近邻 |

> **危险信号**：看到 \`COLLSCAN\` 或 \`SORT\`（大结果集），基本要加索引。

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
        "keysExamined": 1500,
        ...
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

> **排序利用索引的判定**：索引字段的顺序和方向要与 sort 完全匹配，且 sort 字段必须紧跟在等值字段后。

### 15.4.3 案例 3：索引选择度低

\`\`\`javascript
db.logs.find({ level: "INFO" }).explain("executionStats");
// 假设 90% 的日志是 INFO

// 即使有 { level: 1 } 索引
// totalKeysExamined: 900000, nReturned: 900000
// 索引"区分度"太低，优化器可能直接选 COLLSCAN 更划算
\`\`\`

**对策**：低选择度字段不要单独建索引，要么和其他字段组合，要么用部分索引。

## 15.5 索引选择机制

MongoDB 优化器会为每个查询**评估多个候选索引**，选"代价最低"的。评估依据：

1. **扫描的索引键数**（越少越好）
2. **是否需要内存排序**（不需要更好）
3. **是否能覆盖查询**（覆盖最好）

> **缓存**：MongoDB 会缓存"查询形状 → 选中的计划"的映射，避免每次都评估。集合的**数据分布变化**或**新建/删索引**会让缓存失效重评。

\`\`\`javascript
// 手动清理计划缓存（极少需要）
db.runCommand({ planCacheClear: "users" });
\`\`\`

## 15.6 hint：强制指定索引

优化器选错了？可以强制用某个索引：

\`\`\`javascript
// 强制走 age 索引
db.users.find({ age: { \$gt: 30 }, city: "北京" }).hint({ age: 1 });

// 强制走某个命名索引
db.users.find({...}).hint("age_1");

// 强制全表扫描（调试用，生产别干）
db.users.find({...}).hint({ \$natural: 1 });
\`\`\`

> **警告**：hint 是"我比你聪明"的开关。数据分布变了 hint 不会自动适应，可能变成性能陷阱。生产慎用，临时调试可以。

## 15.7 覆盖查询优化

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

## 15.8 聚合管道的 explain

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

## 15.9 踩坑点

**坑 1：explain("executionStats") 没真正执行**

某些聚合（带 \$out / \$merge）的 executionStats 行为不同，要单独看。普通 find 都会真执行。

**坑 2：只看 queryPlanner 误判**

\`\`\`javascript
// queryPlanner 显示 IXSCAN，看似走了索引
// 但 executionStats 显示 keysExamined: 100000, nReturned: 5
// 实际上索引选择度极差，比 COLLSCAN 还慢
\`\`\`

**坑 3：生产用 hint 写死索引**

数据涨了 10 倍后，原索引不再最优，但 hint 还在用老索引，性能暴跌。除非有充分理由，否则别用 hint。

**坑 4：忘了排 _id 破覆盖**

\`\`\`javascript
db.users.find({ email: "zs@x.com" }, { email: 1, name: 1 });
// 默认带 _id，_id 不在索引里 → 不是覆盖查询

db.users.find({ email: "zs@x.com" }, { email: 1, name: 1, _id: 0 });
// 排掉 _id → 覆盖查询
\`\`\`

**坑 5：内存排序超限**

\`\`\`javascript
db.orders.find({ status: "paid" }).sort({ created_at: -1 });
// 没建复合索引，MongoDB 在内存排
// 结果集大 → 报错：Sort operation used more than 33554432 bytes
\`\`\`

> 32MB 是默认排序内存上限。要么建索引消除排序，要么临时调大 \`allowDiskUse\`（聚合）/ 服务器参数。

## 15.10 调优清单

按这个顺序排查慢查询：

1. **explain("executionStats")**：看 stage 和三个指标
2. **有 COLLSCAN？** → 加索引
3. **有 SORT？** → 排序字段加进复合索引
4. **keysExamined 远大于 nReturned？** → 索引选择度低，换字段组合
5. **能覆盖查询吗？** → 投影只取索引字段，排除 _id
6. **复合索引顺序符合 ESR？** → 等值、排序、范围
7. **是否真的需要这个查询？** → 业务侧能否缓存或预聚合

## 15.11 小结

- **三种 explain 模式**：queryPlanner（看计划）、executionStats（看真实执行）、allPlansExecution（看候选）
- **核心 stage**：IXSCAN 好、COLLSCAN 坏、FETCH 通常有、SORT 要警惕
- **三个指标**：nReturned、totalKeysExamined、totalDocsExamined，三者越接近越好
- **常见优化**：加索引消除 COLLSCAN、复合索引消除 SORT、覆盖查询消除 FETCH
- **hint 慎用**：生产环境写死索引有风险
- **调优清单**：explain → 看 stage → 看指标 → 改索引 → 重测

至此，MongoDB 实战教程的基础、查询、聚合、索引四大主题就讲完了。掌握这些，你已经能独立设计一个 MongoDB 后端的数据层。后续可以继续深入副本集、分片、事务、Change Stream 等进阶主题。`
  }
];

export { chapters };
