// =============================================================
// 《PostgreSQL 实战教程》- 章节批次 2
// -------------------------------------------------------------
// 内容：第二部分 查询进阶（第 7-12 章）
// =============================================================

const chapters = [
  {
    id: "pg-ch07",
    group: "第二部分 查询进阶",
    icon: "🔗",
    title: "第 7 章 JOIN 多表连接",
    content: `# 第 7 章 JOIN 多表连接

现实业务的数据分散在多张表里：用户在 users 表、订单在 orders 表、商品在 products 表。JOIN 是把多张表"横向拼"在一起的核心能力。PostgreSQL 支持标准 SQL 的全部 JOIN 类型，并额外提供强大的 LATERAL 连接。

## 7.1 INNER JOIN 内连接

\`INNER JOIN\` 只返回**两表都匹配**的行，是最常用的 JOIN。

\`\`\`sql
-- 用户表 users：id, username
-- 订单表 orders：id, user_id, total_amount

-- 查每个订单对应的用户名
SELECT o.id, o.total_amount, u.username
FROM orders o
INNER JOIN users u ON o.user_id = u.id;
\`\`\`

**关键点**：
- \`ON\` 指定连接条件（一般是外键 = 主键）
- \`FROM\` 后的表叫"左表"，\`JOIN\` 后的叫"右表"
- 内连接只返回能匹配上的行，匹配不上的丢弃

### 用 USING 简化（同名列）

\`\`\`sql
-- 如果两张表的连接列同名（都叫 user_id），可用 USING
SELECT * FROM orders o
INNER JOIN user_profiles p USING (user_id);
\`\`\`

\`USING (col)\` 等价于 \`ON a.col = b.col\`，更简洁，且合并两表的同名列为一列。

### 多表 INNER JOIN

\`\`\`sql
-- 订单 + 用户 + 商品
SELECT o.id, u.username, p.name AS product_name, oi.quantity
FROM orders o
INNER JOIN users u        ON o.user_id = u.id
INNER JOIN order_items oi ON oi.order_id = o.id
INNER JOIN products p     ON oi.product_id = p.id;
\`\`\`

## 7.2 LEFT / RIGHT / FULL OUTER JOIN 外连接

外连接保留**一边或两边**的所有行，即使另一边没匹配。PostgreSQL 完整支持 \`FULL OUTER JOIN\`。

### LEFT JOIN（左连接）

保留左表所有行，右表没匹配的填 NULL。

\`\`\`sql
-- 查所有用户，及其订单数（没下过单的用户也要显示）
SELECT u.id, u.username, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.username;
\`\`\`

| id | username | order_count |
| --- | --- | --- |
| 1 | alice | 5 |
| 2 \| bob | 0 |  ← bob 没订单，但保留，order_count 为 0

> 这是 LEFT JOIN 最经典的应用：**找"没有关联"的数据**。

### 找"没有订单的用户"

\`\`\`sql
SELECT u.*
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;  -- 右表主键为 NULL，说明没匹配上
\`\`\`

### RIGHT JOIN（右连接）

保留右表所有行。实际上 \`RIGHT JOIN\` 很少用，因为可以交换表顺序用 LEFT JOIN 实现。

\`\`\`sql
-- 这两个等价
SELECT * FROM a RIGHT JOIN b ON a.id = b.aid;
SELECT * FROM b LEFT JOIN a ON a.id = b.aid;
\`\`\`

### FULL OUTER JOIN（全外连接）

PostgreSQL 原生支持 \`FULL OUTER JOIN\`，保留**两边所有行**，匹配不上的填 NULL。

\`\`\`sql
-- 比对两表所有数据，找差异（数据同步校验常用）
SELECT
  COALESCE(a.id, b.id) AS id,
  a.name AS name_in_a,
  b.name AS name_in_b
FROM table_a a
FULL OUTER JOIN table_b b ON a.id = b.id
WHERE a.id IS NULL OR b.id IS NULL;  -- 只看"只在一边存在"的行
\`\`\`

> \`FULL OUTER JOIN\` 在 MySQL 中不直接支持，需要用 UNION 拼左右连接。PostgreSQL 原生支持，是数据比对利器。

## 7.3 CROSS JOIN 笛卡尔积

\`CROSS JOIN\` 把两表所有行两两组合，结果行数 = 左表行数 × 右表行数。

\`\`\`sql
-- 3 个用户 × 4 个商品 = 12 行
SELECT u.username, p.name
FROM users u
CROSS JOIN products p;
\`\`\`

**应用场景**：
- 生成"用户 × 日期"的完整网格（用于填充缺失数据）
- 生成报表的维度组合

\`\`\`sql
-- 用 generate_series 生成 7 天 × 所有用户的网格
SELECT u.id, d.day
FROM users u
CROSS JOIN generate_series(
  CURRENT_DATE - INTERVAL '6 day',
  CURRENT_DATE,
  INTERVAL '1 day'
) AS d(day);
\`\`\`

> \`generate_series\` 是 PostgreSQL 的强力函数，比 MySQL 手动 UNION 拼数字表优雅得多。

> 踩坑：忘写 ON 条件的 INNER JOIN 会变成 CROSS JOIN！
> \`\`\`sql
> SELECT * FROM users, orders;  -- 隐式 CROSS JOIN，结果爆炸
> \`\`\`

## 7.4 SELF JOIN 自连接

同一张表和自己 JOIN，需要用别名区分。

### 经典场景 1：员工-经理关系

\`\`\`sql
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name TEXT,
  manager_id INT REFERENCES employees(id)
);

-- 查每个员工和他的经理
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
\`\`\`

### 经典场景 2：找同一城市的用户对

\`\`\`sql
SELECT a.username, b.username, a.city
FROM users a
INNER JOIN users b ON a.city = b.city AND a.id < b.id;
-- a.id < b.id 避免重复对 (a,b) 和 (b,a) 以及 (a,a)
\`\`\`

### 经典场景 3：连续值检测

\`\`\`sql
-- 找连续登录 3 天的用户
SELECT DISTINCT a.user_id
FROM logins a
JOIN logins b ON a.user_id = b.user_id AND a.login_date = b.login_date - INTERVAL '1 day'
JOIN logins c ON b.user_id = c.user_id AND b.login_date = c.login_date - INTERVAL '1 day';
\`\`\`

> 自连接 + 窗口函数（第 10 章）是解决"连续 N 天"问题的利器。

## 7.5 NATURAL JOIN 自然连接

\`NATURAL JOIN\` 自动用两表**所有同名列**作为连接条件，无需写 ON。

\`\`\`sql
-- 两表都有 user_id 列，自动按 user_id 连接
SELECT * FROM orders NATURAL JOIN user_profiles;
\`\`\`

等价于：
\`\`\`sql
SELECT * FROM orders o
INNER JOIN user_profiles p ON o.user_id = p.user_id;
\`\`\`

> **慎用 NATURAL JOIN**：如果两表有多列同名（如都有 \`id\`、\`created_at\`），它会用所有同名列连接，结果往往不是你想要的。生产代码建议显式写 ON，避免隐患。

\`NATURAL LEFT JOIN\`、\`NATURAL RIGHT JOIN\`、\`NATURAL FULL JOIN\` 也都支持。

## 7.6 LATERAL 连接（PostgreSQL 特色）

\`LATERAL\` 允许子查询引用左侧表的字段，相当于"对左表每一行执行一次子查询"。这是 PostgreSQL 的强力特性，MySQL/Oracle 较新版本才支持。

### 场景 1：每个用户的 Top 3 订单

\`\`\`sql
-- 不用 LATERAL，要用窗口函数套子查询
-- 用 LATERAL，直观清晰
SELECT u.username, o.id AS order_id, o.total_amount
FROM users u
CROSS JOIN LATERAL (
  SELECT id, total_amount
  FROM orders
  WHERE user_id = u.id
  ORDER BY total_amount DESC
  LIMIT 3
) o;
\`\`\`

\`LATERAL\` 子查询能看到 \`u.id\`，相当于对每个用户执行一次 Top 3 查询。

### 场景 2：关联取最近一条记录

\`\`\`sql
-- 每个用户最近一次登录时间
SELECT u.username, l.login_at
FROM users u
LEFT JOIN LATERAL (
  SELECT login_at
  FROM login_logs
  WHERE user_id = u.id
  ORDER BY login_at DESC
  LIMIT 1
) l ON true;  -- LATERAL 配 LEFT JOIN 必须写 ON true
\`\`\`

### 场景 3：参数化拆分

\`\`\`sql
-- 每个 user 取他消费金额前 10% 的订单
SELECT u.username, o.id, o.total_amount
FROM users u
CROSS JOIN LATERAL (
  SELECT id, total_amount
  FROM orders
  WHERE user_id = u.id
  ORDER BY total_amount DESC
  LIMIT GREATEST(COUNT(*) OVER () / 10, 1)  -- 也可写成固定 LIMIT
) o;
\`\`\`

> \`LATERAL\` 本质是"相关子查询的 JOIN 形态"，性能上往往比标量子查询好，因为可以走索引且只扫描一次。

### LATERAL vs 标量子查询

| 特性 | 标量子查询 | LATERAL |
| --- | --- | --- |
| 返回列数 | 只能 1 列 | 可多列 |
| 返回行数 | 只能 1 行 | 可多行（用 LIMIT 控） |
| 可读性 | 嵌套深时差 | 清晰 |
| 性能 | 每行算一次 | 同样每行算一次，但可走索引 |

## 7.7 多表连接（3 表以上）

实际业务经常需要 4-5 张表关联。原则：**先小表 JOIN，再大表 JOIN**。

\`\`\`sql
-- 完整订单查询：订单 + 用户 + 商品 + 分类
SELECT
  o.id AS order_id,
  o.created_at,
  u.username,
  p.name AS product,
  c.name AS category,
  oi.quantity,
  oi.price
FROM orders o
INNER JOIN users u           ON o.user_id = u.id
INNER JOIN order_items oi    ON oi.order_id = o.id
INNER JOIN products p        ON oi.product_id = p.id
INNER JOIN categories c      ON p.category_id = c.id
WHERE o.status = 3
ORDER BY o.created_at DESC
LIMIT 50;
\`\`\`

### 多表 JOIN 的执行顺序

PostgreSQL 优化器会自动选择 JOIN 顺序（比 MySQL 更智能），但一般遵循：
1. 从某张表（驱动表）开始，按 WHERE 过滤
2. 用驱动表结果去 JOIN 下一张表（被驱动表）
3. 被驱动表的 JOIN 列必须有索引，否则全表扫描
4. 优化器可重排 JOIN 顺序、改写为 hash join 等

> 用 \`EXPLAIN\` 或 \`EXPLAIN ANALYZE\` 查看实际执行计划。PostgreSQL 的 EXPLAIN 输出比 MySQL 更详细，包含 actual rows、loops 等。

\`\`\`sql
EXPLAIN ANALYZE
SELECT o.id, u.username
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 3;
\`\`\`

## 7.8 JOIN 的性能注意

**坑 1：JOIN 列没索引**

\`\`\`sql
-- orders.user_id 没索引 → 每条订单都要全表扫 users
SELECT * FROM orders o JOIN users u ON o.user_id = u.id;
\`\`\`
**优化**：在 \`orders.user_id\` 上建索引，\`users.id\` 是主键自带索引。

**坑 2：JOIN 列类型不一致**

\`\`\`sql
-- orders.user_id 是 BIGINT，users.id 是 TEXT → 隐式转换，索引失效
SELECT * FROM orders o JOIN users u ON o.user_id = u.id;
\`\`\`
**优化**：外键和主键类型必须严格一致（都用 BIGINT 或都 INT）。

**坑 3：JOIN 列排序规则（collation）不一致**

PostgreSQL 中 TEXT/VARCHAR 列可绑定不同 collation，连接时若不匹配会报错或失效：
\`\`\`sql
-- 报错或索引失效
SELECT * FROM a JOIN b ON a.code = b.code;  -- 一个 'C' collation 一个 'zh_CN'
\`\`\`
**优化**：统一 collation，或在 ON 中显式指定 \`a.code = b.code COLLATE "C"\`。

**坑 4：大表 JOIN 大表**

两表都几千万行，JOIN 时内存撑不住。优化：
- 先用 WHERE 把数据量降下来
- 用子查询 / CTE 提前聚合
- 确保工作内存 \`work_mem\` 足够大（避免磁盘 hash）
- 必要时拆分查询，应用层组装

\`\`\`sql
-- 调大 work_mem 让 hash join 在内存完成
SET LOCAL work_mem = '256MB';
SELECT * FROM big_table1 a JOIN big_table2 b ON a.id = b.aid;
\`\`\`

**坑 5：SELECT * 把所有列都拉回来**

JOIN 时表越多，\`SELECT *\` 返回的列越多，浪费带宽。只选需要的列。

### Nested Loop / Hash Join / Merge Join

PostgreSQL 三种 JOIN 算法：

| 算法 | 适用场景 | 特点 |
| --- | --- | --- |
| Nested Loop | 小表驱动大表，或带索引 | 外表每行扫内表索引 |
| Hash Join | 大表等值连接 | 内表建 hash 表，外表探测 |
| Merge Join | 两表都已按 JOIN 列排序 | 顺序归并，最快 |

\`\`\`sql
-- 强制启用 hash join（通常不必，优化器会选）
SET enable_nestloop = off;
SET enable_mergejoin = off;
EXPLAIN SELECT * FROM orders o JOIN users u ON o.user_id = u.id;
\`\`\`

> 一般不用手动关算法。如果优化器选错，先检查统计信息是否过期：\`ANALYZE orders;\`。

## 7.9 DISTINCT ON（PostgreSQL 特色）

虽然不是 JOIN，但常和 JOIN 配合做"分组取一条"：

\`\`\`sql
-- 每个用户金额最大的订单（DISTINCT ON 比 LATERAL 更简洁）
SELECT DISTINCT ON (o.user_id)
  o.user_id, o.id, o.total_amount
FROM orders o
ORDER BY o.user_id, o.total_amount DESC;
\`\`\`

\`DISTINCT ON (col)\` 保留每个 col 分组的第一行（按 ORDER BY 排序）。这是 PostgreSQL 独有特性，比 \`ROW_NUMBER()\` 子查询简洁。

## 7.10 踩坑提示

**坑 1：LEFT JOIN 后 WHERE 把 NULL 过滤掉了**
\`\`\`sql
-- 想要所有用户及其已完成订单
SELECT u.*, o.id
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.status = 3;  -- 错！这等价于 INNER JOIN
\`\`\`
正确写法：把条件放 ON 子句：
\`\`\`sql
SELECT u.*, o.id
FROM users u
LEFT JOIN orders o ON o.user_id = u.id AND o.status = 3;
\`\`\`

**坑 2：COUNT 在 LEFT JOIN 时的陷阱**
\`\`\`sql
SELECT u.id, COUNT(o.id) AS cnt  -- COUNT(o.id) 而非 COUNT(*)
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id;
\`\`\`
\`COUNT(*)\` 会把"没订单的用户"算成 1（因为 LEFT JOIN 产生了一行 NULL），\`COUNT(o.id)\` 才正确（NULL 不计数）。

**坑 3：JOIN 产生重复行**
\`\`\`sql
-- 一个用户有多条 profile，JOIN 后用户重复
SELECT u.* FROM users u JOIN user_profiles p ON p.user_id = u.id;
\`\`\`
要么用 \`DISTINCT\`，要么 \`GROUP BY\`，要么 \`LATERAL LIMIT 1\`。

**坑 4：USING 和 ON 的列名暴露差异**
\`USING (col)\` 会合并两表的 col 为一列，\`ON a.col = b.col\` 保留两列。

**坑 5：FULL JOIN 配 COUNT 跳行**
\`\`\`sql
-- FULL JOIN 后用 COUNT(*) 会算上"匹配为 NULL 的合成行"
SELECT COUNT(*) FROM a FULL JOIN b ON a.id = b.id;
\`\`\`
用 \`COUNT(a.id)\` 或 \`COUNT(b.id)\` 区分。

## 7.11 本章小结

- \`INNER JOIN\`：只返回两表都匹配的行（最常用）
- \`LEFT JOIN\`：保留左表所有行，右表没匹配填 NULL（找"没有"的数据）
- \`RIGHT JOIN\`：保留右表所有行（少用，换 LEFT JOIN 即可）
- \`FULL OUTER JOIN\`：两边都保留，PG 原生支持，数据比对利器
- \`CROSS JOIN\`：笛卡尔积，配合 \`generate_series\` 生成网格
- \`NATURAL JOIN\`：自动按同名列连接，慎用
- \`SELF JOIN\`：自连接，处理层级、配对、连续问题
- \`LATERAL\`：PG 特色，子查询可引用左表字段，做分组 Top N 极简洁
- \`DISTINCT ON\`：PG 独有，分组取一行
- JOIN 列必须建索引、类型一致、collation 一致
- LEFT JOIN 的右表过滤条件放 ON，不要放 WHERE
- 三种 JOIN 算法：Nested Loop / Hash / Merge，优化器自动选

下一章讲子查询，另一种"跨表"的思路。`
  },

  {
    id: "pg-ch08",
    group: "第二部分 查询进阶",
    icon: "🎯",
    title: "第 8 章 子查询",
    content: `# 第 8 章 子查询

子查询是"查询里的查询"——把一个 SELECT 的结果作为另一个 SQL 的一部分。它能解决很多复杂问题，但写不好会很慢。PostgreSQL 的优化器对子查询做了大量改写优化，但仍需理解其执行模型。

## 8.1 标量子查询

返回**单个值**（一行一列）的子查询。可用于 SELECT、WHERE、HAVING。

\`\`\`sql
-- 查比平均年龄大的用户
SELECT * FROM users
WHERE age > (SELECT AVG(age) FROM users);

-- SELECT 中用标量子查询（每行都算一次）
SELECT
  id, username, age,
  (SELECT AVG(age) FROM users) AS avg_age,
  age - (SELECT AVG(age) FROM users) AS diff
FROM users;

-- HAVING 中用
SELECT user_id, AVG(total_amount) AS avg_amount
FROM orders
GROUP BY user_id
HAVING AVG(total_amount) > (SELECT AVG(total_amount) FROM orders);
\`\`\`

> 标量子查询返回多行会报错：\`more than one row returned by a subquery used as an expression\`。

## 8.2 行子查询 / 表子查询

### 行子查询（返回一行多列）

\`\`\`sql
-- 找和某个用户同城市同年龄的人
SELECT * FROM users
WHERE (city, age) = (
  SELECT city, age FROM users WHERE id = 1
);

-- 行子查询 + ROW 构造器，PG 写法
SELECT * FROM users
WHERE ROW(city, age) = (SELECT city, age FROM users WHERE id = 1);
\`\`\`

### 表子查询（返回多行多列）

通常用在 FROM 子句（派生表）或 IN/EXISTS。

\`\`\`sql
-- 把子查询当一张表用
SELECT t.user_id, t.total
FROM (
  SELECT user_id, SUM(total_amount) AS total
  FROM orders
  GROUP BY user_id
) t
WHERE t.total > 1000;
\`\`\`

> FROM 子查询会被当作"子查询"，PostgreSQL 12+ 可用 \`MATERIALIZED\` / \`NOT MATERIALIZED\` 控制是否物化（详见第 11 章 CTE）。

## 8.3 IN / NOT IN / EXISTS / NOT EXISTS

### IN 子查询

\`\`\`sql
-- 查下过单的用户
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders);

-- NOT IN：没下过单的用户
SELECT * FROM users
WHERE id NOT IN (SELECT user_id FROM orders);
\`\`\`

> **NOT NULL 陷阱**：如果子查询结果包含 NULL，\`NOT IN\` 会返回空！
> \`\`\`sql
> SELECT * FROM users WHERE id NOT IN (1, 2, NULL);  -- 永远返回 0 行
> \`\`\`
> 原理：\`x NOT IN (a, b, NULL)\` 等价于 \`x <> a AND x <> b AND x <> NULL\`，\`x <> NULL\` 永远是 NULL（未知），AND 后整体为 NULL/假。
> 解决：在子查询里加 \`WHERE col IS NOT NULL\`，或直接用 \`NOT EXISTS\`。

### EXISTS 子查询

\`EXISTS\` 只关心"有没有"，不关心返回什么。

\`\`\`sql
-- 查下过单的用户
SELECT * FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);

-- NOT EXISTS：没下过单的用户
SELECT * FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);
\`\`\`

### IN vs EXISTS

| 场景 | 推荐 |
| --- | --- |
| 外表小、子查询大 | \`IN\`（驱动表是外表） |
| 外表大、子查询小 | \`EXISTS\`（驱动表是子查询） |
| 子查询列可能含 NULL | \`EXISTS\`（对 NULL 友好） |

PostgreSQL 优化器通常会把 IN/EXISTS 自动改写为半连接（semi-join），性能差异不大。**优先用 EXISTS**，因为它对 NULL 友好。

## 8.4 ANY / ALL / SOME

PostgreSQL 完整支持 \`ANY\`、\`ALL\`、\`SOME\`（\`SOME\` 是 \`ANY\` 别名）。

\`\`\`sql
-- ANY：大于子查询中任意一个（即大于最小值）
SELECT * FROM products
WHERE price > ANY (SELECT price FROM products WHERE category = '电子');

-- ALL：大于子查询中所有（即大于最大值）
SELECT * FROM products
WHERE price > ALL (SELECT price FROM products WHERE category = '电子');

-- 等价改写
SELECT * FROM products WHERE price > (SELECT MIN(price) FROM products WHERE category = '电子');
SELECT * FROM products WHERE price > (SELECT MAX(price) FROM products WHERE category = '电子');
\`\`\`

### ANY 配数组

\`\`\`sql
-- 等价于 IN，但语法不同
SELECT * FROM users WHERE id = ANY(ARRAY[1, 2, 3]);
SELECT * FROM users WHERE id IN (1, 2, 3);
\`\`\`

> ANY/ALL 较少用，用 MIN/MAX 改写更直观。但 \`ANY(ARRAY[...])\` 在传数组参数时很有用。

## 8.5 相关子查询 vs 非相关子查询

### 非相关子查询

子查询**不依赖**外层查询，只执行一次。

\`\`\`sql
SELECT * FROM users
WHERE age > (SELECT AVG(age) FROM users);  -- 子查询独立，只算一次
\`\`\`

### 相关子查询

子查询**依赖**外层每一行，每行都要重新算一次。

\`\`\`sql
-- 查每个用户超过他自己平均金额的订单
SELECT o.*
FROM orders o
WHERE o.total_amount > (
  SELECT AVG(total_amount)
  FROM orders
  WHERE user_id = o.user_id  -- 依赖外层 o.user_id
);
\`\`\`

相关子查询性能差：外层 N 行，子查询就执行 N 次。

**优化方向**：改写成 JOIN 或窗口函数。

\`\`\`sql
-- 用窗口函数优化上面例子
SELECT *
FROM (
  SELECT o.*,
    AVG(total_amount) OVER (PARTITION BY user_id) AS user_avg
  FROM orders o
) t
WHERE total_amount > user_avg;
\`\`\`

> PostgreSQL 优化器在某些场景能把相关子查询"去相关"改写为 JOIN（称为 "flatten"），但复杂场景仍需手动优化。

## 8.6 子查询在 SELECT 子句

标量子查询常用于 SELECT 中，给每行附加一个计算值。

\`\`\`sql
-- 每个用户附带"订单数"和"总金额"
SELECT
  u.id, u.username,
  (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_cnt,
  (SELECT SUM(total_amount) FROM orders WHERE user_id = u.id) AS total_amount
FROM users u;
\`\`\`

> 这种写法直观但每行算两次子查询。改写为 LEFT JOIN + GROUP BY 更高效：
> \`\`\`sql
> SELECT u.id, u.username,
>   COUNT(o.id) AS order_cnt,
>   COALESCE(SUM(o.total_amount), 0) AS total_amount
> FROM users u
> LEFT JOIN orders o ON o.user_id = u.id
> GROUP BY u.id, u.username;
> \`\`\`

## 8.7 子查询 vs JOIN 的选择

很多子查询都能改写成 JOIN，反之亦然。选择原则：

| 需求 | 推荐 |
| --- | --- |
| 横向拼字段（订单 + 用户名） | JOIN |
| 过滤（有/没有订单的用户） | EXISTS / LEFT JOIN + IS NULL |
| 标量比较（比平均大） | 标量子查询 |
| 多层聚合（每个用户的最大订单） | 窗口函数 / 子查询 |
| 分组取一条 | DISTINCT ON / LATERAL |

### 示例：找每个用户金额最大的订单

\`\`\`sql
-- 方法 1：相关子查询
SELECT * FROM orders o
WHERE total_amount = (
  SELECT MAX(total_amount) FROM orders WHERE user_id = o.user_id
);

-- 方法 2：窗口函数（推荐）
SELECT * FROM (
  SELECT o.*,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY total_amount DESC) AS rn
  FROM orders o
) t WHERE rn = 1;

-- 方法 3：DISTINCT ON（PG 最简）
SELECT DISTINCT ON (user_id) *
FROM orders
ORDER BY user_id, total_amount DESC;

-- 方法 4：LATERAL
SELECT u.username, o.*
FROM users u
CROSS JOIN LATERAL (
  SELECT * FROM orders
  WHERE user_id = u.id
  ORDER BY total_amount DESC
  LIMIT 1
) o;
\`\`\`

> 在 PostgreSQL 中，\`DISTINCT ON\` 通常是"分组取一条"最简洁高效的写法。

## 8.8 派生表（FROM 子查询）

\`\`\`sql
-- 派生表：子查询当表用
SELECT t.user_id, t.cnt
FROM (
  SELECT user_id, COUNT(*) AS cnt
  FROM orders
  GROUP BY user_id
) t
WHERE t.cnt > 5;
\`\`\`

PostgreSQL 优化器会自动把派生表"拉平"（pull-up）到外层查询，等价于：
\`\`\`sql
SELECT user_id, COUNT(*) AS cnt
FROM orders
GROUP BY user_id
HAVING COUNT(*) > 5;
\`\`\`

但有些情况无法拉平（如子查询有 LIMIT、UNION、聚合 + 外层引用），会作为子查询保留。

### 用 NOT MATERIALIZED 强制内联

\`\`\`sql
-- 强制内联（PG 12+）
SELECT t.user_id, t.cnt
FROM (
  SELECT user_id, COUNT(*) AS cnt FROM orders GROUP BY user_id
) AS t NOT MATERIALIZED
JOIN users u ON u.id = t.user_id;
\`\`\`

### 用 MATERIALIZED 强制物化

\`\`\`sql
-- 强制物化（多次引用同一派生表时省算力）
SELECT t.user_id, t.cnt
FROM (
  SELECT user_id, COUNT(*) AS cnt FROM orders GROUP BY user_id
) AS t MATERIALIZED
JOIN users u ON u.id = t.user_id;
\`\`\`

> 经验：能用 JOIN/窗口函数替代的，就别用派生表。CTE（第 11 章）比派生表可读性更好。

## 8.9 踩坑提示

**坑 1：NOT IN + NULL = 空结果**
\`\`\`sql
SELECT * FROM users WHERE id NOT IN (SELECT user_id FROM orders);
-- 如果 orders.user_id 有 NULL，结果永远是空
\`\`\`
修复：\`NOT IN (SELECT user_id FROM orders WHERE user_id IS NOT NULL)\`，或改用 \`NOT EXISTS\`。

**坑 2：相关子查询性能差**
每行都执行子查询，N 行就 N 次。用 JOIN、窗口函数或 LATERAL 替代。

**坑 3：派生表没索引**
\`\`\`sql
SELECT * FROM (SELECT ... FROM big_table) t
JOIN other ON t.id = other.id;
-- 物化后 t.id 没索引，JOIN 慢
\`\`\`
PG 优化器通常能拉平派生表，但若不能（含 LIMIT/UNION），考虑改写或用 \`NOT MATERIALIZED\`。

**坑 4：SELECT 中的标量子查询执行多次**
\`\`\`sql
SELECT id, (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_cnt
FROM users u;
-- 每个 user 都算一次子查询，1000 用户就 1000 次
\`\`\`
优化：改用 LEFT JOIN + GROUP BY。

**坑 5：子查询层级太深**
\`\`\`sql
SELECT * FROM (SELECT * FROM (SELECT * FROM (SELECT ...) ...) ...) ...;
\`\`\`
可读性差、性能差。用 CTE（第 11 章）拆分。

**坑 6：UPDATE/DELETE 中用子查询锁表**
\`\`\`sql
-- 错：子查询引用了正在更新的表
UPDATE users SET age = age + 1
WHERE id IN (SELECT id FROM users WHERE age < 18);
\`\`\`
正确：
\`\`\`sql
UPDATE users SET age = age + 1 WHERE age < 18;
\`\`\`

## 8.10 本章小结

- 标量子查询返回单值，可用于 SELECT/WHERE/HAVING
- 表子查询（派生表）可当 FROM 的表用，PG 优化器通常能拉平
- \`IN\` 适合"包含"，\`EXISTS\` 适合"存在"，对 NULL 友好
- \`NOT IN\` 遇 NULL 返回空，改用 \`NOT EXISTS\` 或加 \`IS NOT NULL\`
- \`ANY\`/\`ALL\`/\`SOME\` 较少用，用 MIN/MAX 改写更直观
- 相关子查询每行都执行，慎用，优先改写为 JOIN/窗口函数/LATERAL
- PG 优化器会自动拉平派生表，必要时用 \`MATERIALIZED\`/\`NOT MATERIALIZED\` 控制
- 子查询 vs JOIN：能 JOIN 就 JOIN，标量比较用子查询
- 分组取一条优先用 \`DISTINCT ON\`

下一章讲集合操作，把多个查询结果"纵向"拼接。`
  },

  {
    id: "pg-ch09",
    group: "第二部分 查询进阶",
    icon: "📊",
    title: "第 9 章 集合操作",
    content: `# 第 9 章 集合操作

JOIN 是"横向"拼接表，集合操作是"纵向"拼接查询结果。PostgreSQL 完整支持 \`UNION\`、\`UNION ALL\`、\`INTERSECT\`、\`INTERSECT ALL\`、\`EXCEPT\`、\`EXCEPT ALL\`，比 MySQL 更全面。

## 9.1 UNION / UNION ALL

\`\`\`sql
-- 把两个查询结果上下拼起来
SELECT id, username, 'user' AS type FROM users WHERE status = 1
UNION
SELECT id, admin_name, 'admin' AS type FROM admins WHERE status = 1;
\`\`\`

**结果列名以第一个查询为准**，后续查询的列名被忽略。

### UNION vs UNION ALL

| 操作 | 去重 | 性能 |
| --- | --- | --- |
| \`UNION\` | 去重（DISTINCT） | 慢（要排序/hash 去重） |
| \`UNION ALL\` | 不去重 | 快（直接拼接） |

> 经验：**默认用 UNION ALL**。只有需要去重时才用 UNION。去重会触发 hash agg 或排序，开销大。

\`\`\`sql
-- 不去重（快）
SELECT 'a' AS x UNION ALL SELECT 'a' UNION ALL SELECT 'b';
-- 结果：a, a, b

-- 去重（慢）
SELECT 'a' AS x UNION SELECT 'a' UNION SELECT 'b';
-- 结果：a, b
\`\`\`

### UNION 的规则

1. **列数必须相同**：所有 SELECT 的列数要一致
2. **列类型兼容**：对应列的类型要能隐式转换
3. **列名取第一个 SELECT 的**
4. **ORDER BY 只能放最后**，作用于整个 UNION 结果

\`\`\`sql
-- 错：每个 SELECT 都加 ORDER BY
SELECT * FROM a ORDER BY id
UNION
SELECT * FROM b ORDER BY id;

-- 对：ORDER BY 放最后
SELECT * FROM a
UNION ALL
SELECT * FROM b
ORDER BY id;
\`\`\`

### 经典应用：合并多表数据

\`\`\`sql
-- 把按月分表的数据合并查询
SELECT order_id, amount, created_at FROM orders_2024
UNION ALL
SELECT order_id, amount, created_at FROM orders_2025
ORDER BY created_at DESC;
\`\`\`

PostgreSQL 还可用**分区表**自动合并查询，比手动 UNION 更优雅：
\`\`\`sql
-- 创建分区表
CREATE TABLE orders (
  id BIGSERIAL,
  amount NUMERIC,
  created_at TIMESTAMP
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2024 PARTITION OF orders
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE orders_2025 PARTITION OF orders
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- 查询时 PG 自动合并所有分区，等同于 UNION ALL
SELECT * FROM orders WHERE created_at >= '2024-01-01';
\`\`\`

### 经典应用：行转列（UNPIVOT）

\`\`\`sql
-- 把一行变多行（EAV 模型常用）
SELECT id, 'phone' AS field, phone AS value FROM users WHERE phone IS NOT NULL
UNION ALL
SELECT id, 'email' AS field, email AS value FROM users WHERE email IS NOT NULL
UNION ALL
SELECT id, 'address' AS field, address AS value FROM users WHERE address IS NOT NULL;
\`\`\`

## 9.2 INTERSECT 交集

\`INTERSECT\` 取**交集**：两个查询都有的行。

\`\`\`sql
-- 找既买了商品 A 又买了商品 B 的用户
SELECT user_id FROM orders WHERE product_id = 1
INTERSECT
SELECT user_id FROM orders WHERE product_id = 2;
\`\`\`

### INTERSECT ALL（保留重复）

PostgreSQL 独家支持 \`INTERSECT ALL\`，保留重复行的交集（按出现次数取最小）。

\`\`\`sql
-- 假设 user 1 买商品 A 3 次，买商品 B 2 次
-- INTERSECT 只返回 1 个 user_id=1（去重）
-- INTERSECT ALL 返回 2 个 user_id=1（取最小重复次数）
SELECT user_id FROM orders WHERE product_id = 1
INTERSECT ALL
SELECT user_id FROM orders WHERE product_id = 2;
\`\`\`

| 操作 | 含义 |
| --- | --- |
| \`INTERSECT\` | 去重交集 |
| \`INTERSECT ALL\` | 保留重复的交集（取最小次数） |

> MySQL 不支持 INTERSECT（8.0 才加，且不支持 ALL）。PostgreSQL 完整支持。

## 9.3 EXCEPT 差集

\`EXCEPT\` 取**差集**：在 A 但不在 B 的行。

\`\`\`sql
-- 找买了 A 但没买 B 的用户
SELECT user_id FROM orders WHERE product_id = 1
EXCEPT
SELECT user_id FROM orders WHERE product_id = 2;
\`\`\`

等价于：
\`\`\`sql
SELECT DISTINCT user_id FROM orders o1
WHERE product_id = 1
  AND NOT EXISTS (
    SELECT 1 FROM orders o2
    WHERE o2.user_id = o1.user_id AND o2.product_id = 2
  );
\`\`\`

### EXCEPT ALL（保留重复）

\`\`\`sql
-- 假设 user 1 买商品 A 3 次，没买商品 B
-- EXCEPT 返回 1 个 user_id=1
-- EXCEPT ALL 返回 3 个 user_id=1（A 次数减 B 次数）
SELECT user_id FROM orders WHERE product_id = 1
EXCEPT ALL
SELECT user_id FROM orders WHERE product_id = 2;
\`\`\`

| 操作 | 含义 |
| --- | --- |
| \`EXCEPT\` | 去重差集 |
| \`EXCEPT ALL\` | 保留重复的差集（A 次数减 B 次数） |

### 经典应用：找"缺失"的数据

\`\`\`sql
-- 应该登录但没登录的用户（user_ids 全集 - 实际登录的）
SELECT user_id FROM expected_logins
EXCEPT
SELECT user_id FROM actual_logins;

-- 数据同步校验：在 A 不在 B 的行
SELECT id, name FROM table_a
EXCEPT
SELECT id, name FROM table_b;
\`\`\`

> EXCEPT 是数据比对、数据完整性校验的利器。比写 LEFT JOIN ... IS NULL 简洁。

## 9.4 集合操作的优先级与括号

\`INTERSECT\` 优先级高于 \`UNION\` 和 \`EXCEPT\`：

\`\`\`sql
-- 这个等价于 A UNION (B INTERSECT C)
A UNION B INTERSECT C;

-- 用括号明确
(A UNION B) INTERSECT C;
\`\`\`

PostgreSQL 支持用括号明确组合顺序：
\`\`\`sql
(SELECT id FROM users WHERE age < 18
 UNION
 SELECT id FROM users WHERE age > 60)
INTERSECT
SELECT user_id FROM orders WHERE total_amount > 1000;
\`\`\`

## 9.5 列匹配规则

### 列数必须相同

\`\`\`sql
-- 错：列数不同
SELECT id, name FROM users
UNION
SELECT id FROM admins;

-- 用 NULL 占位补齐
SELECT id, name FROM users
UNION
SELECT id, NULL AS name FROM admins;
\`\`\`

### 列类型兼容

\`\`\`sql
-- 错：类型不兼容（INT 和 TIMESTAMP 不能直接 UNION，会报错）
SELECT id, created_at FROM users
UNION
SELECT id, phone FROM users;

-- PG 比 MySQL 更严格，类型必须可隐式转换
-- 显式转换：
SELECT id, created_at::TEXT FROM users
UNION
SELECT id, phone FROM users;
\`\`\`

### 列名取第一个 SELECT

\`\`\`sql
SELECT id AS user_id, name FROM users
UNION ALL
SELECT id AS admin_id, name FROM admins;
-- 结果列名是 user_id，不是 admin_id
\`\`\`

## 9.6 ORDER BY 和 LIMIT

### ORDER BY 只能放最后

\`\`\`sql
-- 错：每个 SELECT 都加 ORDER BY
SELECT * FROM a ORDER BY x
UNION ALL
SELECT * FROM b ORDER BY x;
\`\`\`

只能在整个集合操作最后加一次 ORDER BY，或用括号包裹：
\`\`\`sql
-- 全局排序
SELECT * FROM a
UNION ALL
SELECT * FROM b
ORDER BY x;

-- 用括号让每个 SELECT 都能 LIMIT
(SELECT id, name FROM users ORDER BY id DESC LIMIT 3)
UNION ALL
(SELECT id, name FROM admins ORDER BY id DESC LIMIT 3);
\`\`\`

### LIMIT 作用于整个结果

\`\`\`sql
-- LIMIT 10 作用于整个 UNION 结果
(SELECT id FROM users LIMIT 5)
UNION ALL
(SELECT id FROM admins LIMIT 5)
LIMIT 10;
\`\`\`

## 9.7 性能对比

| 操作 | 开销 | 备注 |
| --- | --- | --- |
| \`UNION ALL\` | 极低 | 直接拼接，无去重 |
| \`UNION\` | 中等 | 需排序或 hash 去重 |
| \`INTERSECT\` | 中等 | 需 hash 或 sort |
| \`INTERSECT ALL\` | 较高 | 需计数 |
| \`EXCEPT\` | 中等 | 需 hash 或 sort |
| \`EXCEPT ALL\` | 较高 | 需计数 |

### 大数据量优化

- \`UNION ALL\` 几乎无开销（直接拼接）
- \`UNION\`/\`INTERSECT\`/\`EXCEPT\` 需要去重，会**临时表 + 排序或 hash**
- 大数据量集合操作慢，能改写成 JOIN 替代的就替代

\`\`\`sql
-- UNION 改写为 JOIN（如果两表结构相同）
SELECT * FROM table_a
UNION
SELECT * FROM table_b;

-- 等价的 JOIN 写法（用 1/0 标记来源）
SELECT *, 'a' AS src FROM table_a
UNION ALL
SELECT *, 'b' AS src FROM table_b;
\`\`\`

### 用 EXPLAIN 查看计划

\`\`\`sql
EXPLAIN
SELECT user_id FROM orders WHERE product_id = 1
EXCEPT
SELECT user_id FROM orders WHERE product_id = 2;
-- 会看到 HashAggregate 或 Unique 节点
\`\`\`

## 9.8 踩坑提示

**坑 1：UNION 去重导致全表排序**
\`\`\`sql
SELECT * FROM big_table1 UNION SELECT * FROM big_table2;
-- 几百万行去重，临时表爆磁盘
\`\`\`
如果不需要去重，务必用 \`UNION ALL\`。

**坑 2：列数不匹配报错**
检查每个 SELECT 的列数。可用 \`NULL\` 占位：
\`\`\`sql
SELECT id, name, email, NULL AS phone FROM table_a
UNION ALL
SELECT id, name, NULL, phone FROM table_b;
\`\`\`

**坑 3：ORDER BY 位置错误**
\`\`\`sql
-- 错：每个 SELECT 都加 ORDER BY
SELECT * FROM a ORDER BY x
UNION ALL
SELECT * FROM b ORDER BY x;
\`\`\`
只能在整个 UNION 最后加一次 ORDER BY，或用括号包裹。

**坑 4：UNION 结果列名取第一个 SELECT**
\`\`\`sql
SELECT id AS user_id, name FROM users
UNION ALL
SELECT id AS admin_id, name FROM admins;
-- 结果列名是 user_id，不是 admin_id
\`\`\`

**坑 5：INTERSECT/EXCEPT 优先级**
\`INTERSECT\` 优先级高于 \`UNION\`/\`EXCEPT\`。复杂的组合用括号明确：
\`\`\`sql
(A UNION B) INTERSECT C;  -- 明确先 UNION 再 INTERSECT
\`\`\`

**坑 6：CLOB/TEXT 大字段 UNION 慢**
TEXT/JSONB 大字段做去重比较，开销大。先转 hash 或 id 再 UNION。

**坑 7：INTERSECT ALL / EXCEPT ALL 不被其他数据库支持**
PostgreSQL、SQL Server 支持，MySQL（8.0+）只支持 INTERSECT/EXCEPT 不带 ALL。跨数据库迁移注意。

## 9.9 本章小结

- \`UNION ALL\` 纵向拼接不去重（快，默认用这个）
- \`UNION\` 拼接并去重（慢，要排序/hash）
- \`INTERSECT\` 取交集，\`INTERSECT ALL\` 保留重复（PG 独家）
- \`EXCEPT\` 取差集，\`EXCEPT ALL\` 保留重复（PG 独家）
- 列数必须相同，类型兼容，列名取第一个 SELECT
- ORDER BY/LIMIT 只能作用于整个结果（除非用括号）
- 优先级：\`INTERSECT\` > \`UNION\`/\`EXCEPT\`，复杂组合用括号
- 大数据量集合操作慢，能 JOIN 就别 UNION
- EXCEPT 是数据比对、找缺失数据的利器

下一章讲窗口函数 —— PostgreSQL 最强查询利器之一。`
  },

  {
    id: "pg-ch10",
    group: "第二部分 查询进阶",
    icon: "🪟",
    title: "第 10 章 窗口函数",
    content: `# 第 10 章 窗口函数

窗口函数（Window Functions）是 PostgreSQL 最重要的查询特性之一（自 8.4 起支持）。它能在不聚合行的前提下，对一组行计算"窗口"内的值，完美解决"Top N"、"连续登录"、"累计求和"等问题。

## 10.1 窗口函数简介

\`\`\`sql
函数() OVER (
  [PARTITION BY 列]    -- 分组（窗口）
  [ORDER BY 列]        -- 排序
  [frame 子句]          -- 窗口范围
)
\`\`\`

**与 GROUP BY 的区别**：
- \`GROUP BY\` 把 N 行压缩成 1 行
- 窗口函数保留所有行，额外加一列计算结果

\`\`\`sql
-- GROUP BY：每个用户一行
SELECT user_id, COUNT(*) FROM orders GROUP BY user_id;

-- 窗口函数：每行订单都带"该用户的订单总数"
SELECT id, user_id, COUNT(*) OVER (PARTITION BY user_id) AS user_order_cnt
FROM orders;
\`\`\`

### 窗口函数分类

| 类别 | 函数 |
| --- | --- |
| 排名 | \`ROW_NUMBER\`、\`RANK\`、\`DENSE_RANK\`、\`NTILE\`、\`PERCENT_RANK\`、\`CUME_DIST\` |
| 偏移 | \`LAG\`、\`LEAD\`、\`FIRST_VALUE\`、\`LAST_VALUE\`、\`NTH_VALUE\` |
| 聚合 | \`SUM\`、\`AVG\`、\`COUNT\`、\`MIN\`、\`MAX\`（带 OVER） |
| 统计 | \`STDDEV\`、\`VARIANCE\`、\`PERCENTILE_CONT\`、\`MODE\` |

## 10.2 ROW_NUMBER / RANK / DENSE_RANK

三个排名函数，区别在于并列处理：

| 函数 | 1 | 1 | 3 | 说明 |
| --- | --- | --- | --- | --- |
| \`ROW_NUMBER()\` | 1 | 2 | 3 | 严格递增，不重复 |
| \`RANK()\` | 1 | 1 | 3 | 并列后跳过 |
| \`DENSE_RANK()\` | 1 | 1 | 2 | 并列后不跳过 |

\`\`\`sql
-- 按金额降序给订单排名
SELECT
  id, user_id, total_amount,
  ROW_NUMBER() OVER (ORDER BY total_amount DESC) AS rn,
  RANK()       OVER (ORDER BY total_amount DESC) AS rnk,
  DENSE_RANK() OVER (ORDER BY total_amount DESC) AS drnk
FROM orders;
\`\`\`

### 经典应用：每个用户的 Top 3 订单

\`\`\`sql
SELECT *
FROM (
  SELECT o.*,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY total_amount DESC) AS rn
  FROM orders o
) t
WHERE rn <= 3;
\`\`\`

> 这是窗口函数最经典用法：**分组 Top N**。GROUP BY 做不到，窗口函数一行搞定。PG 也可用 \`DISTINCT ON\` 简化 Top 1。

## 10.3 NTILE 分桶

\`NTILE(n)\` 把有序数据均分为 n 桶，返回每行所属桶号（1~n）。

\`\`\`sql
-- 把用户按消费金额均分为 4 档
SELECT
  user_id, total_amount,
  NTILE(4) OVER (ORDER BY total_amount DESC) AS quartile
FROM user_totals;
-- quartile=1 是消费最高 25%，quartile=4 是最低 25%
\`\`\`

应用：报表分位数分析、A/B 实验分组。

## 10.4 LAG / LEAD

\`LAG\` 取**前 N 行**的值，\`LEAD\` 取**后 N 行**的值。用于"和上一行比较"。

\`\`\`sql
-- 每个订单和上一个订单的金额差
SELECT
  id, user_id, created_at, total_amount,
  LAG(total_amount) OVER (PARTITION BY user_id ORDER BY created_at) AS prev_amount,
  total_amount - LAG(total_amount) OVER (PARTITION BY user_id ORDER BY created_at) AS diff
FROM orders;
\`\`\`

### LAG / LEAD 带参数

\`\`\`sql
LAG(col, N, default)  -- 前 N 行，没有则填 default
LEAD(col, N, default) -- 后 N 行

-- 每行和前 1 行比较，第一行填 0
SELECT
  id, total_amount,
  LAG(total_amount, 1, 0) OVER (ORDER BY id) AS prev
FROM orders;
\`\`\`

### 经典应用：环比增长

\`\`\`sql
-- 月度销售额 + 环比增长
SELECT
  month,
  revenue,
  LAG(revenue) OVER (ORDER BY month) AS prev_month,
  ROUND(
    (revenue - LAG(revenue) OVER (ORDER BY month))
    / LAG(revenue) OVER (ORDER BY month) * 100, 2
  ) AS growth_pct
FROM (
  SELECT TO_CHAR(created_at, 'YYYY-MM') AS month,
         SUM(total_amount) AS revenue
  FROM orders
  GROUP BY TO_CHAR(created_at, 'YYYY-MM')
) t;
\`\`\`

## 10.5 FIRST_VALUE / LAST_VALUE / NTH_VALUE

\`\`\`sql
-- 每个用户订单中：第一个、最后一个、第二大的金额
SELECT
  id, user_id, total_amount,
  FIRST_VALUE(total_amount) OVER w AS first_amount,
  LAST_VALUE(total_amount)  OVER w AS last_amount,
  NTH_VALUE(total_amount, 2) OVER w AS second_amount
FROM orders
WINDOW w AS (PARTITION BY user_id ORDER BY created_at
             ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING);
\`\`\`

> **重要**：\`LAST_VALUE\` 默认窗口是"从开头到当前行"，所以 LAST_VALUE 拿到的不是真正的最后值！要扩展到"整个分区"必须用 \`ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING\`。

### WINDOW 子句复用窗口定义

\`\`\`sql
-- 多个窗口函数共享同一窗口定义
SELECT
  id, user_id, total_amount,
  ROW_NUMBER() OVER w AS rn,
  LAG(total_amount) OVER w AS prev,
  SUM(total_amount) OVER w AS running_sum
FROM orders
WINDOW w AS (PARTITION BY user_id ORDER BY created_at);
\`\`\`

> PostgreSQL 支持 \`WINDOW\` 子句，避免重复写窗口定义，提升可读性。

## 10.6 PERCENT_RANK / CUME_DIST

| 函数 | 计算公式 | 范围 |
| --- | --- | --- |
| \`PERCENT_RANK()\` | \`(rank - 1) / (total - 1)\` | 0~1 |
| \`CUME_DIST()\` | 累积行数 / 总行数 | 0~1 |

\`\`\`sql
-- 每个订单金额在所有订单中的百分位排名
SELECT
  id, total_amount,
  PERCENT_RANK() OVER (ORDER BY total_amount) AS pct_rank,
  CUME_DIST()    OVER (ORDER BY total_amount) AS cume_dist
FROM orders;
-- pct_rank=0.95 表示超过 95% 的订单
\`\`\`

## 10.7 SUM/AVG/COUNT OVER 聚合窗口

聚合函数 + OVER = 聚合但不压缩行。

### 累计求和（Running Total）

\`\`\`sql
-- 按日期累计销售额
SELECT
  created_at,
  total_amount,
  SUM(total_amount) OVER (ORDER BY created_at) AS running_total
FROM orders;
\`\`\`

### 每行 + 同组平均值

\`\`\`sql
-- 每个订单金额 + 该用户的平均订单金额
SELECT
  id, user_id, total_amount,
  AVG(total_amount) OVER (PARTITION BY user_id) AS user_avg,
  total_amount - AVG(total_amount) OVER (PARTITION BY user_id) AS diff
FROM orders;
\`\`\`

### 占比

\`\`\`sql
-- 每个订单占该用户总金额的比例
SELECT
  id, user_id, total_amount,
  total_amount / SUM(total_amount) OVER (PARTITION BY user_id) * 100 AS pct
FROM orders;
\`\`\`

## 10.8 PARTITION BY 与 ORDER BY

- \`PARTITION BY\`：定义窗口（分组），类似 GROUP BY
- \`ORDER BY\`：窗口内排序

\`\`\`sql
-- 每个用户按日期排序的累计金额
SUM(total_amount) OVER (
  PARTITION BY user_id
  ORDER BY created_at
) AS running_total_per_user
\`\`\`

### Frame 子句（窗口范围）

PostgreSQL 支持三种 frame 类型：

\`\`\`sql
-- ROWS：按物理行数
ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW  -- 从开头到当前行（默认，配 ORDER BY）
ROWS BETWEEN 2 PRECEDING AND CURRENT ROW          -- 前 2 行 + 当前行
ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING  -- 整个分区
ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING  -- 当前行到结尾

-- RANGE：按逻辑值范围（同值的行一起算）
RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW  -- 默认，含同值

-- GROUPS：按 peer group（同值分组）
GROUPS BETWEEN 1 PRECEDING AND 1 FOLLOWING  -- 上一个 peer group + 当前 group + 下一个
\`\`\`

### 默认 frame 的关键差异

| 函数类别 | 有 ORDER BY 时默认 frame | 无 ORDER BY 时默认 frame |
| --- | --- | --- |
| 排名函数（RANK 等） | 不受 frame 影响 | 不受 frame 影响 |
| 偏移函数（LAG/LEAD） | 不受 frame 影响 | 不受 frame 影响 |
| 聚合函数（SUM/AVG） | \`RANGE UNBOUNDED PRECEDING TO CURRENT ROW\` | 整个分区 |

> 关键坑：聚合函数配 \`ORDER BY\` 时默认是"累计"，不是"全分区"。要全分区必须显式写 \`ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING\` 或不写 \`ORDER BY\`。

### 滑动平均

\`\`\`sql
-- 7 天滑动平均
SELECT
  date,
  amount,
  AVG(amount) OVER (
    ORDER BY date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS rolling_avg_7d
FROM daily_sales;

-- 30 天滑动平均（用 RANGE 配 INTERVAL）
SELECT
  date,
  amount,
  AVG(amount) OVER (
    ORDER BY date
    RANGE BETWEEN INTERVAL '29 days' PRECEDING AND CURRENT ROW
  ) AS rolling_avg_30d
FROM daily_sales;
\`\`\`

> \`RANGE ... PRECEDING\` 配 \`INTERVAL\` 是 PostgreSQL 特色，能处理"日历窗口"（含缺失日期）。MySQL 不支持 RANGE 配 INTERVAL。

## 10.9 经典应用

### 去重保留最新一条

\`\`\`sql
-- 每个 user_id 只保留 created_at 最大的一行
DELETE FROM user_logs
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
    FROM user_logs
  ) t WHERE rn > 1
);

-- 用 RETURNING 看删了哪些（PG 特色）
DELETE FROM user_logs
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
    FROM user_logs
  ) t WHERE rn > 1
)
RETURNING id, user_id, created_at;
\`\`\`

### 连续登录 N 天

\`\`\`sql
-- 找连续登录 3 天以上的用户
SELECT user_id
FROM (
  SELECT
    user_id, login_date,
    login_date - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) * INTERVAL '1 day' AS grp
  FROM logins
) t
GROUP BY user_id, grp
HAVING COUNT(*) >= 3;
\`\`\`

原理：连续日期减去连续序号，得到的 \`grp\` 相同。同组内连续 = 同一天。

### 分组 Top N

\`\`\`sql
-- 每个分类最贵的 3 个商品
SELECT * FROM (
  SELECT p.*,
    ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rn
  FROM products p
) t WHERE rn <= 3;
\`\`\`

### 同比/环比

\`\`\`sql
-- 同比：今年本月 vs 去年同月
SELECT
  month,
  revenue,
  LAG(revenue, 12) OVER (ORDER BY month) AS revenue_last_year,
  ROUND(
    (revenue - LAG(revenue, 12) OVER (ORDER BY month))
    / LAG(revenue, 12) OVER (ORDER BY month) * 100, 2
  ) AS yoy_pct
FROM monthly_revenue;
\`\`\`

### 累计占比（帕累托分析）

\`\`\`sql
-- 商品销售额累计占比，找"前 20% 商品贡献 80% 销售额"
SELECT
  product_id,
  sales,
  SUM(sales) OVER (ORDER BY sales DESC) AS cumulative_sales,
  SUM(sales) OVER () AS total_sales,
  SUM(sales) OVER (ORDER BY sales DESC) / SUM(sales) OVER () AS cumulative_pct
FROM product_sales
ORDER BY sales DESC;
\`\`\`

## 10.10 踩坑提示

**坑 1：LAST_VALUE 默认窗口不是分区末尾**
默认 \`RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\`，要拿整个分区末尾必须显式扩展 frame：
\`\`\`sql
LAST_VALUE(col) OVER (
  PARTITION BY ...
  ORDER BY ...
  ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
)
\`\`\`

**坑 2：聚合函数配 ORDER BY 默认是累计**
\`\`\`sql
-- 这个是累计求和，不是全分区求和！
SUM(x) OVER (PARTITION BY a ORDER BY b)
-- 全分区求和要写：
SUM(x) OVER (PARTITION BY a)
-- 或显式：
SUM(x) OVER (PARTITION BY a ORDER BY b ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
\`\`\`

**坑 3：ROW_NUMBER 用于去重时性能**
大表上 ROW_NUMBER 会排序，注意排序列加索引。

**坑 4：窗口函数不能在 WHERE 中用**
\`\`\`sql
-- 错
SELECT * FROM orders WHERE ROW_NUMBER() OVER (...) > 1;
-- 报错：window functions are not allowed in WHERE
\`\`\`
必须套一层子查询：
\`\`\`sql
SELECT * FROM (
  SELECT o.*, ROW_NUMBER() OVER (...) AS rn FROM orders o
) t WHERE rn > 1;
\`\`\`

**坑 5：窗口函数不能在 GROUP BY 中用**
\`\`\`sql
-- 错
SELECT user_id, ROW_NUMBER() OVER (ORDER BY COUNT(*))
FROM orders
GROUP BY user_id;
-- 报错
\`\`\`
正确：
\`\`\`sql
SELECT user_id, COUNT(*) AS cnt,
  ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS rn
FROM orders
GROUP BY user_id;
\`\`\`

**坑 6：窗口函数 vs GROUP BY 混淆**
窗口函数保留所有行，GROUP BY 压缩行。要"压缩"用 GROUP BY，要"附加计算"用窗口函数。

## 10.11 本章小结

- 窗口函数 = 聚合但不压缩行，额外加一列
- \`ROW_NUMBER\` 严格递增，\`RANK\` 跳号，\`DENSE_RANK\` 不跳号
- \`NTILE\` 分桶，\`PERCENT_RANK\`/\`CUME_DIST\` 百分位
- \`LAG/LEAD\` 取前后行，做环比/同比
- \`FIRST_VALUE\`/\`LAST_VALUE\`/\`NTH_VALUE\` 取窗口内值，注意 LAST_VALUE 的 frame
- \`SUM/AVG OVER\` 做累计、占比、滑动平均
- \`PARTITION BY\` 分组，\`ORDER BY\` 排序，\`frame\` 控制窗口范围
- Frame 三种：\`ROWS\`（物理行）、\`RANGE\`（逻辑值，配 INTERVAL）、\`GROUPS\`（peer group）
- 经典应用：分组 Top N、连续登录、去重保留最新、累计求和、环比同比、帕累托分析
- 窗口函数不能在 WHERE/GROUP BY 用，需套子查询
- 用 \`WINDOW\` 子句复用窗口定义，提升可读性

下一章讲 CTE，让复杂查询变得可读。`
  },

  {
    id: "pg-ch11",
    group: "第二部分 查询进阶",
    icon: "🧩",
    title: "第 11 章 CTE 公用表表达式",
    content: `# 第 11 章 CTE 公用表表达式

CTE（Common Table Expression）用 \`WITH\` 子句定义"临时视图"，让复杂查询模块化、可读。PostgreSQL 的 CTE 还能递归，处理树形/层级数据，并能用 \`MATERIALIZED\` 控制物化行为（PG 12+）。

## 11.1 WITH 子句

\`\`\`sql
WITH cte_name AS (
  SELECT ...  -- 子查询
)
SELECT * FROM cte_name;
\`\`\`

\`\`\`sql
-- 统计每个用户的订单数，再筛前 10
WITH user_order_cnt AS (
  SELECT user_id, COUNT(*) AS cnt
  FROM orders
  GROUP BY user_id
)
SELECT u.username, c.cnt
FROM users u
JOIN user_order_cnt c ON c.user_id = u.id
ORDER BY c.cnt DESC
LIMIT 10;
\`\`\`

### 多个 CTE

\`\`\`sql
WITH
  active_users AS (
    SELECT * FROM users WHERE status = 1
  ),
  user_totals AS (
    SELECT user_id, SUM(total_amount) AS total
    FROM orders
    GROUP BY user_id
  )
SELECT u.username, t.total
FROM active_users u
LEFT JOIN user_totals t ON t.user_id = u.id
ORDER BY t.total DESC;
\`\`\`

> CTE 之间可以**互相引用**（后面的引用前面的），非常灵活。

### CTE 在 INSERT/UPDATE/DELETE 中

\`\`\`sql
-- CTE 配合 UPDATE，并 RETURNING 看修改了哪些
WITH inactive_users AS (
  SELECT id FROM users WHERE last_login_at < NOW() - INTERVAL '1 year'
)
UPDATE users SET status = 0
WHERE id IN (SELECT id FROM inactive_users)
RETURNING id, username;
\`\`\`

## 11.2 非递归 CTE

非递归 CTE 本质是"命名的派生表"，但可读性更好，且可被多次引用。

### CTE vs 派生表（FROM 子查询）

\`\`\`sql
-- 派生表：嵌套难读
SELECT t.user_id, t.cnt
FROM (
  SELECT user_id, COUNT(*) AS cnt
  FROM orders GROUP BY user_id
) t
WHERE t.cnt > 5;

-- CTE：扁平清晰
WITH order_cnt AS (
  SELECT user_id, COUNT(*) AS cnt
  FROM orders GROUP BY user_id
)
SELECT * FROM order_cnt WHERE cnt > 5;
\`\`\`

### CTE 可被多次引用

\`\`\`sql
WITH active_users AS (
  SELECT * FROM users WHERE status = 1
)
-- 同一个 CTE 引用两次
SELECT COUNT(*) FROM active_users
UNION ALL
SELECT COUNT(*) FROM active_users WHERE age > 30;
\`\`\`

派生表做不到这点（要写两次）。

### CTE 用于数据操作（DML）

\`\`\`sql
-- 用 CTE + RETURNING 把数据归档
WITH moved AS (
  DELETE FROM orders
  WHERE created_at < '2023-01-01'
  RETURNING *
)
INSERT INTO orders_archive
SELECT * FROM moved;
\`\`\`

> 这是 PostgreSQL 的杀手级用法：\`DELETE ... RETURNING\` + \`INSERT\` 通过 CTE 串联，一条语句完成归档。MySQL 不支持。

## 11.3 递归 CTE

递归 CTE 能"自己引用自己"，处理树形/层级数据。语法：

\`\`\`sql
WITH RECURSIVE cte_name AS (
  -- 基础部分（非递归）
  SELECT ...
  UNION [ALL]
  -- 递归部分（引用自己）
  SELECT ... FROM cte_name WHERE ...
)
SELECT * FROM cte_name;
\`\`\`

### 经典应用 1：组织架构树

\`\`\`sql
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name TEXT,
  manager_id INT REFERENCES employees(id)
);

INSERT INTO employees (name, manager_id) VALUES
  ('CEO', NULL),
  ('CTO', 1),
  ('CFO', 1),
  ('工程师A', 2),
  ('工程师B', 2),
  ('会计A', 3);

-- 查每个人到 CEO 的层级路径
WITH RECURSIVE org_path AS (
  -- 基础：CEO 是第 1 层
  SELECT id, name, manager_id, 1 AS level, name::TEXT AS path
  FROM employees WHERE manager_id IS NULL

  UNION ALL

  -- 递归：每个员工的上级在 org_path 中
  SELECT e.id, e.name, e.manager_id, op.level + 1,
    op.path || ' > ' || e.name
  FROM employees e
  JOIN org_path op ON e.manager_id = op.id
)
SELECT * FROM org_path ORDER BY level, path;
\`\`\`

结果：

| id | name | level | path |
| --- | --- | --- | --- |
| 1 | CEO | 1 | CEO |
| 2 | CTO | 2 | CEO > CTO |
| 3 | CFO | 2 | CEO > CFO |
| 4 | 工程师A | 3 | CEO > CTO > 工程师A |
| 5 | 工程师B | 3 | CEO > CTO > 工程师B |
| 6 | 会计A | 3 | CEO > CFO > 会计A |

### 经典应用 2：生成连续序列

\`\`\`sql
-- 生成 1 到 10 的数字
WITH RECURSIVE nums AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM nums WHERE n < 10
)
SELECT * FROM nums;

-- 生成最近 30 天的日期
WITH RECURSIVE dates AS (
  SELECT CURRENT_DATE - INTERVAL '29 day' AS d
  UNION ALL
  SELECT d + INTERVAL '1 day' FROM dates WHERE d < CURRENT_DATE
)
SELECT d::DATE FROM dates;
\`\`\`

> PostgreSQL 还有更简洁的 \`generate_series\`：
> \`\`\`sql
> SELECT generate_series(1, 10);
> SELECT generate_series(CURRENT_DATE - 29, CURRENT_DATE, INTERVAL '1 day');
> \`\`\`
> 能用 \`generate_series\` 就别用递归 CTE，性能更好。

### 经典应用 3：找所有子孙节点

\`\`\`sql
-- 找 id=2 的所有下属（含多层）
WITH RECURSIVE subordinates AS (
  SELECT * FROM employees WHERE id = 2
  UNION ALL
  SELECT e.* FROM employees e
  JOIN subordinates s ON e.manager_id = s.id
)
SELECT * FROM subordinates;
\`\`\`

### 经典应用 4：找所有祖先节点（向上递归）

\`\`\`sql
-- 找员工 6 的所有上级（直到 CEO）
WITH RECURSIVE ancestors AS (
  SELECT * FROM employees WHERE id = 6
  UNION ALL
  SELECT e.* FROM employees e
  JOIN ancestors a ON a.manager_id = e.id  -- 注意方向反转
)
SELECT * FROM ancestors;
\`\`\`

### 经典应用 5：评论嵌套

\`\`\`sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  parent_id INT REFERENCES comments(id),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 查某条评论的所有子孙评论，带层级
WITH RECURSIVE comment_tree AS (
  SELECT id, parent_id, content, 0 AS depth, ARRAY[id] AS path
  FROM comments WHERE id = 1  -- 根评论

  UNION ALL

  SELECT c.id, c.parent_id, c.content, ct.depth + 1,
    ct.path || c.id
  FROM comments c
  JOIN comment_tree ct ON c.parent_id = ct.id
)
SELECT * FROM comment_tree ORDER BY path;
\`\`\`

> 用 \`ARRAY\` 存路径是 PG 特色，排序方便，比拼字符串更可靠。

### 递归控制

- 默认无递归深度限制（不像 MySQL 的 \`cte_max_recursion_depth\`）
- 必须有终止条件，否则无限递归报错
- 可设 \`SET statement_timeout\` 防止失控

\`\`\`sql
-- 设置语句超时，防止递归失控
SET statement_timeout = '10s';
\`\`\`

## 11.4 CTE 物化（MATERIALIZED / NOT MATERIALIZED）

PostgreSQL 12+ 引入 \`MATERIALIZED\` / \`NOT MATERIALIZED\` 提示，控制 CTE 是否物化为临时表。

### 默认行为（PG 12+）

- PG 12 之前：CTE 总是物化（"optimization fence"）
- PG 12+：如果 CTE 只被引用一次且非递归，**默认内联**（NOT MATERIALIZED）；否则物化

### MATERIALIZED 强制物化

\`\`\`sql
-- 强制物化：CTE 算一次存临时表，多次引用省算力
WITH heavy_calc AS MATERIALIZED (
  SELECT user_id, COUNT(*) AS cnt
  FROM orders GROUP BY user_id
)
SELECT * FROM heavy_calc WHERE cnt > 5
UNION ALL
SELECT * FROM heavy_calc WHERE cnt < 2;
\`\`\`

### NOT MATERIALIZED 强制内联

\`\`\`sql
-- 强制内联：CTE 当作视图展开，能下推过滤条件
WITH big AS NOT MATERIALIZED (
  SELECT * FROM huge_table
)
SELECT * FROM big WHERE id = 1;  -- id=1 条件下推到 huge_table
\`\`\`

### 何时用 MATERIALIZED

| 场景 | 推荐 |
| --- | --- |
| CTE 被引用多次 | \`MATERIALIZED\`（算一次省算力） |
| CTE 计算昂贵，外层过滤强 | \`MATERIALIZED\` |
| CTE 只引用一次，外层过滤强 | \`NOT MATERIALIZED\`（下推过滤） |
| 想强制优化器不能改写 | \`MATERIALIZED\`（作为 optimization fence） |

> MySQL 的 CTE 默认物化（PG 12 前也是）。PG 12+ 默认内联更智能，但有时需手动控制。

## 11.5 CTE 的应用场景

### 1. 拆分复杂查询

把一个 100 行的 SQL 拆成几个 CTE，每个负责一部分逻辑。

\`\`\`sql
WITH
  -- 1. 计算每个用户的总消费
  user_spend AS (
    SELECT user_id, SUM(total_amount) AS total
    FROM orders WHERE status = 3
    GROUP BY user_id
  ),
  -- 2. 计算每个用户的登录次数
  user_login AS (
    SELECT user_id, COUNT(*) AS login_cnt
    FROM login_logs
    GROUP BY user_id
  ),
  -- 3. 综合报表
  report AS (
    SELECT u.id, u.username,
      COALESCE(s.total, 0) AS spend,
      COALESCE(l.login_cnt, 0) AS logins
    FROM users u
    LEFT JOIN user_spend s ON s.user_id = u.id
    LEFT JOIN user_login l ON l.user_id = u.id
  )
SELECT * FROM report ORDER BY spend DESC LIMIT 20;
\`\`\`

### 2. 多步聚合

\`\`\`sql
-- 先按日聚合，再按月聚合
WITH daily AS (
  SELECT created_at::DATE AS d, user_id, SUM(amount) AS daily_sum
  FROM orders GROUP BY created_at::DATE, user_id
)
SELECT
  TO_CHAR(d, 'YYYY-MM') AS month,
  user_id,
  SUM(daily_sum) AS monthly_sum,
  AVG(daily_sum) AS avg_daily
FROM daily
GROUP BY TO_CHAR(d, 'YYYY-MM'), user_id;
\`\`\`

### 3. 树形/层级查询

组织架构、评论嵌套、分类树，递归 CTE 是最佳工具。

### 4. 数据迁移与归档

\`\`\`sql
-- 用 CTE + RETURNING 一条语句完成归档
WITH archived AS (
  DELETE FROM active_logs
  WHERE created_at < NOW() - INTERVAL '90 days'
  RETURNING *
)
INSERT INTO archive_logs SELECT * FROM archived;
\`\`\`

### 5. UPSERT 配合 CTE

\`\`\`sql
-- 用 CTE 准备数据，再 UPSERT
WITH new_data AS (
  SELECT * FROM staging_table
)
INSERT INTO target (id, name, value)
SELECT id, name, value FROM new_data
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, value = EXCLUDED.value;
\`\`\`

## 11.6 踩坑提示

**坑 1：递归没有终止条件**
\`\`\`sql
-- 没终止 → 递归到内存耗尽或 statement_timeout
WITH RECURSIVE bad AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM bad  -- 没 WHERE 限制
)
SELECT * FROM bad;
\`\`\`
报错：\`ERROR: recursive query "bad" column 1 has type integer in non-recursive term but type bigint overall\` 或无限递归。

**坑 2：递归 CTE 中用 LEFT JOIN**
递归部分通常用 INNER JOIN，LEFT JOIN 可能产生 NULL 导致无限递归或意外行。

**坑 3：PG 11 及更早版本 CTE 总是物化**
PG 12 之前，CTE 是 optimization fence，外层 WHERE 不会下推。若用旧版本，复杂 CTE 可能很慢。升级到 12+ 或拆分查询。

**坑 4：CTE 性能 - 多次引用**
\`\`\`sql
-- CTE 引用 3 次，PG 12 前会算 3 次（实际是物化算 1 次，扫 3 次）
-- PG 12+ 默认内联会算 3 次！这时要 MATERIALIZED
WITH heavy AS (
  SELECT ... FROM big_table  -- 昂贵计算
)
SELECT * FROM heavy WHERE a > 1
UNION ALL SELECT * FROM heavy WHERE a < 0
UNION ALL SELECT * FROM heavy WHERE a = 0;
\`\`\`
PG 12+ 默认内联会算 3 次，加 \`MATERIALIZED\` 只算 1 次。

**坑 5：CTE 作用域**
CTE 只在当前语句有效，不能跨语句复用。要跨语句用临时表 \`CREATE TEMP TABLE\` 或视图。

**坑 6：递归 CTE 不能用聚合函数**
\`\`\`sql
-- 错：递归部分不能用 GROUP BY / SUM
WITH RECURSIVE bad AS (
  SELECT ... UNION ALL
  SELECT ..., SUM(x) FROM bad GROUP BY ...  -- 报错
)
\`\`\`

**坑 7：递归 CTE 列类型必须一致**
基础部分和递归部分的列类型必须严格一致：
\`\`\`sql
-- 错：基础是 TEXT，递归拼了 TEXT 但初值是 VARCHAR
-- 用显式 ::TEXT 保证一致
WITH RECURSIVE t AS (
  SELECT 1 AS n, ''::TEXT AS path  -- 显式类型
  UNION ALL
  SELECT n + 1, path || n FROM t WHERE n < 5
)
SELECT * FROM t;
\`\`\`

## 11.7 本章小结

- CTE = 命名的临时结果集，让复杂查询模块化、可读
- 多个 CTE 可串联、可互相引用
- 非递归 CTE 是派生表的优雅替代，可被多次引用
- 递归 CTE 处理树形/层级数据：组织架构、评论嵌套、分类树
- 递归 CTE 必须有终止条件，否则递归到上限报错
- 用 CTE 生成序列、日期网格（但 \`generate_series\` 更简洁）
- PG 12+ 用 \`MATERIALIZED\`/\`NOT MATERIALIZED\` 控制物化
- CTE + RETURNING 串联 DML，一条语句完成数据迁移/归档（PG 杀手级用法）
- CTE 只在当前语句有效，跨语句用临时表或视图
- 递归 CTE 列类型必须一致，不能在递归部分用聚合

下一章讲 PostgreSQL 常用函数与操作符大全。`
  },

  {
    id: "pg-ch12",
    group: "第二部分 查询进阶",
    icon: "📐",
    title: "第 12 章 常用函数与操作符",
    content: `# 第 12 章 常用函数与操作符

PostgreSQL 内置了几百个函数和操作符，本章挑最常用的讲，分类清晰、示例充足。掌握这些，日常开发够用。PostgreSQL 的函数库比 MySQL 更丰富，尤其在正则、JSON、范围类型、地理类型上。

## 12.1 字符串函数

### 长度与拼接

\`\`\`sql
SELECT LENGTH('hello');                    -- 5（字符数）
SELECT OCTET_LENGTH('你好');               -- 6（UTF-8 字节数）
SELECT CHAR_LENGTH('你好');                -- 2（字符数）
SELECT CONCAT('a', 'b', 'c');              -- 'abc'
SELECT CONCAT_WS('-', '2024','01','15');   -- '2024-01-15'（用分隔符拼接）
SELECT 'a' || 'b' || 'c';                  -- 'abc'（PG 用 || 拼接，比 CONCAT 更地道）
\`\`\`

> PostgreSQL 中 \`LENGTH\` 返回**字符**数（不像 MySQL 返回字节数），\`OCTET_LENGTH\` 返回字节数。PG 推荐 \`||\` 拼接字符串，NULL 不会让结果变 NULL（\`NULL || 'a'\` 是 NULL，但 \`CONCAT(NULL, 'a')\` 是 'a'）。

### 大小写转换

\`\`\`sql
SELECT UPPER('abc');        -- 'ABC'
SELECT LOWER('ABC');        -- 'abc'
SELECT INITCAP('hello world');  -- 'Hello World'（PG 特色，首字母大写）
\`\`\`

> \`INITCAP\` 是 PostgreSQL 特色，MySQL 没有。

### 截取与替换

\`\`\`sql
SELECT SUBSTRING('hello' FROM 2 FOR 3);     -- 'ell'（标准 SQL 语法）
SELECT SUBSTRING('hello' FROM 2);            -- 'ello'
SELECT SUBSTR('hello', 2, 3);                -- 'ell'（类 MySQL 语法）
SELECT LEFT('hello', 3);                     -- 'hel'
SELECT RIGHT('hello', 3);                    -- 'llo'
SELECT REPLACE('hello', 'l', 'L');           -- 'heLLo'
SELECT OVERLAY('hello' PLACING 'XXX' FROM 2 FOR 3);  -- 'hXXXo'（PG 标准 SQL）
\`\`\`

### 查找与定位

\`\`\`sql
SELECT POSITION('ll' IN 'hello');           -- 3（标准 SQL，首次出现位置）
SELECT STRPOS('hello', 'll');                -- 3（同上，参数顺序反）
\`\`\`

### 去空格

\`\`\`sql
SELECT TRIM('  hello  ');                   -- 'hello'
SELECT BTRIM('  hello  ');                  -- 'hello'（PG 函数式写法）
SELECT LTRIM('  hello');                    -- 'hello'
SELECT RTRIM('hello  ');                    -- 'hello'
SELECT TRIM(BOTH 'x' FROM 'xxxhelloxxx');   -- 'hello'（去指定字符）
\`\`\`

### 填充

\`\`\`sql
SELECT LPAD('5', 3, '0');                   -- '005'（左填充到 3 位）
SELECT RPAD('5', 3, '0');                   -- '500'
\`\`\`

经典应用：订单号补零
\`\`\`sql
SELECT 'ORD' || LPAD(id::TEXT, 8, '0') AS order_no FROM orders;
-- ORD00000001
\`\`\`

### 分割（split_part - PG 特色）

\`\`\`sql
-- split_part 是 PG 特色，按分隔符取第 N 段
SELECT SPLIT_PART('a,b,c,d', ',', 2);  -- 'b'（取第 2 段）
SELECT SPLIT_PART('a,b,c,d', ',', -1); -- 'd'（取最后一段）

-- 拆成数组
SELECT STRING_TO_ARRAY('a,b,c,d', ',');  -- {a,b,c,d}
SELECT REGEXP_SPLIT_TO_ARRAY('a1b2c3', '[0-9]');  -- {a,b,c}

-- 拆成多行（用于 EAV 转换）
SELECT UNNEST(STRING_TO_ARRAY('a,b,c', ',')) AS parts;
-- a
-- b
-- c
\`\`\`

> \`split_part\` 比 MySQL 的 \`SUBSTRING_INDEX\` 更标准、更易读。\`UNNEST\` 把数组拆成行，是 PG 强力特性。

### 其他常用

\`\`\`sql
SELECT REVERSE('hello');                    -- 'olleh'
SELECT REPEAT('ab', 3);                     -- 'ababab'
SELECT TO_CHAR(1234567.891, 'FM999,999,999.00');  -- '1,234,567.89'
SELECT ENCODE('hello'::BYTEA, 'hex');       -- '68656c6c6f'
SELECT DECODE('68656c6c6f', 'hex');         -- 'hello'::BYTEA
\`\`\`

## 12.2 正则表达式函数（PG 强项）

PostgreSQL 的正则功能比 MySQL 强得多，是文本处理的利器。

### 正则匹配操作符

| 操作符 | 含义 | 区分大小写 |
| --- | --- | --- |
| \`~\` | 匹配正则 | 是 |
| \`~*\` | 匹配正则 | 否 |
| \`!~\` | 不匹配正则 | 是 |
| \`!~*\` | 不匹配正则 | 否 |
| \`LIKE\` | SQL 通配符（%\_） | 是 |
| \`ILIKE\` | SQL 通配符 | 否 |
| \`SIMILAR TO\` | SQL 正则（介于两者） | 是 |

\`\`\`sql
-- ~ 正则匹配
SELECT 'hello' ~ 'ell';       -- true
SELECT 'hello' ~ '^he';       -- true（以 he 开头）
SELECT 'hello' ~ 'lo$';       -- true（以 lo 结尾）
SELECT 'Hello' ~* '^he';      -- true（不区分大小写）
SELECT 'hello' !~ 'xyz';      -- true（不匹配）

-- LIKE / ILIKE
SELECT 'hello' LIKE 'he%';    -- true
SELECT 'hello' ILIKE 'HE%';   -- true（不区分大小写，PG 特色）

-- SIMILAR TO（SQL 标准正则，支持 | 和 [])
SELECT 'abc' SIMILAR TO '(a|b|c)%';  -- true
\`\`\`

### regexp_replace 替换

\`\`\`sql
-- 替换所有数字为 X
SELECT REGEXP_REPLACE('a1b2c3', '[0-9]', 'X', 'g');  -- 'aXbXcX'
-- 默认只替换第一个
SELECT REGEXP_REPLACE('a1b2c3', '[0-9]', 'X');        -- 'aXb2c3'

-- 脱敏手机号
SELECT REGEXP_REPLACE('13812345678', '(\\d{3})\\d{4}(\\d{4})', '\\1****\\2');
-- '138****5678'
\`\`\`

> \`\\1\`、\`\\2\` 是反向引用（捕获组）。'g' flag 表示全局替换。

### regexp_matches 提取

\`\`\`sql
-- 提取第一个匹配
SELECT REGEXP_MATCHES('a1b2c3', '[a-z][0-9]');  -- {a1}

-- 提取所有匹配（'g' flag）
SELECT REGEXP_MATCHES('a1b2c3', '[a-z][0-9]', 'g');  -- {a1}, {b2}, {c3}

-- 提取捕获组
SELECT REGEXP_MATCHES('phone:13812345678', 'phone:(\\d+)');  -- {13812345678}
\`\`\`

\`regexp_matches\` 返回**数组**，配 \`LATERAL\` 可拆成多行：
\`\`\`sql
SELECT m[1] AS num
FROM messages,
LATERAL REGEXP_MATCHES(messages.content, 'phone:(\\d+)', 'g') AS m;
\`\`\`

### regexp_split_to_table 拆成行

\`\`\`sql
-- 按数字分割成多行
SELECT REGEXP_SPLIT_TO_TABLE('a1b2c3', '[0-9]');
-- a
-- b
-- c
\`\`\`

## 12.3 数值函数

### 四舍五入

\`\`\`sql
SELECT ROUND(3.14159, 2);    -- 3.14
SELECT ROUND(3.5);           -- 4
SELECT ROUND(2.5);           -- 3（PG 是"四舍六入五成双"银行家舍入！）
SELECT CEIL(3.1);            -- 4（向上取整）
SELECT CEILING(3.1);         -- 4（同上）
SELECT FLOOR(3.9);           -- 3（向下取整）
SELECT TRUNC(3.14159, 2);    -- 3.14（直接截断，不四舍五入）
SELECT TRUNC(3.9);           -- 3
\`\`\`

> **注意**：PostgreSQL 的 \`ROUND(2.5)\` 返回 **2**（银行家舍入，向偶数靠拢），而 MySQL 的 \`ROUND(2.5)\` 返回 3（四舍五入）。这是从 MySQL 迁移到 PG 的常见坑。要 MySQL 行为可用自定义函数。

### 取模与绝对值

\`\`\`sql
SELECT MOD(10, 3);           -- 1（取模）
SELECT 10 % 3;               -- 1（同上）
SELECT ABS(-5);              -- 5
SELECT SIGN(-5);             -- -1（符号：-1/0/1）
\`\`\`

### 幂与对数

\`\`\`sql
SELECT POWER(2, 10);         -- 1024
SELECT SQRT(16);             -- 4
SELECT CBRT(27);             -- 3（立方根，PG 特色）
SELECT EXP(1);               -- 2.718...
SELECT LN(2.718);            -- 1（自然对数）
SELECT LOG(100);             -- 2（以 10 为底，PG 14+）
SELECT LOG(2, 8);            -- 3（以 2 为底）
\`\`\`

### 随机数

\`\`\`sql
SELECT RANDOM();             -- 0~1 随机小数
SELECT FLOOR(RANDOM() * 100)::INT;  -- 0~99 随机整数

-- 随机抽 5 条（大表慢，需全表扫描排序）
SELECT * FROM users ORDER BY RANDOM() LIMIT 5;

-- TABLESAMPLE 更高效（PG 特色，按比例抽样）
SELECT * FROM users TABLESAMPLE SYSTEM(10);  -- 大约 10% 的行
SELECT * FROM users TABLESAMPLE BERNOULLI(10);  -- 精确 10%，每行独立概率
\`\`\`

> \`ORDER BY RANDOM()\` 会为每行生成随机数再排序，大表极慢。PG 的 \`TABLESAMPLE\` 是更高效的抽样方式，MySQL 没有。

### 序列函数（PG 特色）

\`\`\`sql
-- 操作序列
SELECT nextval('my_seq');      -- 取下一个值
SELECT currval('my_seq');      -- 当前会话最近取的值
SELECT lastval();              -- 当前会话最近取的任意序列值
SELECT setval('my_seq', 100);  -- 设置序列值
SELECT setval('my_seq', 100, false);  -- 设置，下次 nextval 返回 100

-- 序列相关函数
SELECT pg_get_serial_sequence('orders', 'id');  -- 查表 id 列对应的序列名
\`\`\`

> SERIAL/BIGSERIAL 列底层用序列。GENERATED ALWAYS AS IDENTITY 也用序列。序列是 PG 自增的核心，比 MySQL 的 AUTO_INCREMENT 更灵活。

### 其他

\`\`\`sql
SELECT GREATEST(1, 5, 3);    -- 5
SELECT LEAST(1, 5, 3);       -- 1
SELECT WIDTH_BUCKET(5.5, 0, 10, 5);  -- 3（直方图分桶，PG 特色）
\`\`\`

## 12.4 日期时间函数

### 当前时间

\`\`\`sql
SELECT NOW();                          -- 2024-01-15 14:30:00+08（TIMESTAMP WITH TIME ZONE）
SELECT CURRENT_TIMESTAMP;              -- 同上（标准 SQL）
SELECT CURRENT_DATE;                   -- 2024-01-15（DATE）
SELECT CURRENT_TIME;                   -- 14:30:00+08（TIME WITH TIME ZONE）
SELECT LOCALTIMESTAMP;                 -- 2024-01-15 14:30:00（无时区）
SELECT CLOCK_TIMESTAMP();              -- 实时时间（每行重算）
SELECT STATEMENT_TIMESTAMP();          -- 语句开始时间
SELECT TRANSACTION_TIMESTAMP();        -- 事务开始时间（同 NOW()）
SELECT EXTRACT(EPOCH FROM NOW());      -- Unix 时间戳（秒）
SELECT TO_TIMESTAMP(1705305000);       -- 2024-01-15 14:30:00+08
\`\`\`

> \`NOW()\` / \`CURRENT_TIMESTAMP\` / \`TRANSACTION_TIMESTAMP()\` 在事务内是**事务开始时刻**固定不变，\`CLOCK_TIMESTAMP()\` 是函数调用时刻。生产用 \`NOW()\` 保证事务内时间一致。

### date_trunc 截断（PG 强项）

\`\`\`sql
-- 截断到指定精度
SELECT date_trunc('month', NOW());     -- 当月 1 号 00:00:00
SELECT date_trunc('day', NOW());       -- 今天 00:00:00
SELECT date_trunc('hour', NOW());      -- 当前小时 00:00
SELECT date_trunc('week', NOW());      -- 本周一 00:00:00
SELECT date_trunc('quarter', NOW());   -- 本季度第一天
SELECT date_trunc('year', NOW());      -- 今年 1 月 1 日
\`\`\`

> \`date_trunc\` 是 PG 处理时间分组的利器，比 MySQL 的 \`DATE_FORMAT\` 更标准、更快。按月分组：\`GROUP BY date_trunc('month', created_at)\`。

### date_part / EXTRACT 提取部分

\`\`\`sql
-- 两种写法等价
SELECT date_part('year', NOW());           -- 2024
SELECT EXTRACT(YEAR FROM NOW());           -- 2024

SELECT date_part('month', NOW());          -- 1
SELECT date_part('day', NOW());            -- 15
SELECT date_part('hour', NOW());
SELECT date_part('dow', NOW());            -- 周几（0=周日，1=周一）
SELECT date_part('doy', NOW());            -- 一年中第几天
SELECT date_part('week', NOW());           -- 一年中第几周
SELECT date_part('epoch', NOW());          -- Unix 时间戳
SELECT date_part('quarter', NOW());        -- 季度
\`\`\`

### age 计算年龄/间隔（PG 特色）

\`\`\`sql
-- age 返回 INTERVAL 类型
SELECT age(NOW(), '1990-01-01'::DATE);     -- 34 years 2 mons 14 days
SELECT age('1990-01-01'::DATE);            -- 同上（默认第二参数是 NOW）

-- 提取年龄的年数
SELECT EXTRACT(YEAR FROM age(birthdate)) AS age_years FROM users;
\`\`\`

> \`age()\` 是 PG 特色，MySQL 没有。计算年龄非常方便。

### 日期运算

\`\`\`sql
-- 直接加减 INTERVAL
SELECT NOW() + INTERVAL '1 day';           -- 加 1 天
SELECT NOW() - INTERVAL '1 month';         -- 减 1 月
SELECT NOW() + INTERVAL '1 hour 30 min';   -- 加 1 小时 30 分

-- DATE 类型加减整数 = 天
SELECT CURRENT_DATE + 7;                   -- 7 天后
SELECT CURRENT_DATE - 30;                  -- 30 天前

-- 相减得 INTERVAL
SELECT '2024-01-15'::DATE - '2024-01-01'::DATE;  -- 14（天数差）
SELECT NOW() - '2024-01-01'::TIMESTAMP;          -- INTERVAL
\`\`\`

### 日期格式化 to_char

\`\`\`sql
SELECT to_char(NOW(), 'YYYY-MM-DD');              -- '2024-01-15'
SELECT to_char(NOW(), 'YYYY年MM月DD日');           -- '2024年01月15日'
SELECT to_char(NOW(), 'HH24:MI:SS');              -- '14:30:00'
SELECT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS');   -- '2024-01-15 14:30:00'
SELECT to_char(NOW(), 'Day, DD Month YYYY');      -- 'Monday, 15 January 2024'
SELECT to_char(12345.678, 'FM999,999.00');        -- '12,345.68'（数字格式化）
\`\`\`

**常用格式符**：

| 符号 | 含义 | 示例 |
| --- | --- | --- |
| \`YYYY\` | 4 位年 | 2024 |
| \`MM\` | 月（01-12） | 01 |
| \`DD\` | 日（01-31） | 15 |
| \`HH24\` | 时（00-23） | 14 |
| \`MI\` | 分 | 30 |
| \`SS\` | 秒 | 00 |
| \`Day\` | 周名（全称） | Monday |
| \`Dy\` | 周名（缩写） | Mon |
| \`Month\` | 月名（全称） | January |
| \`Mon\` | 月名（缩写） | Jan |
| \`FM\` | 去前导零/空格 | 1 而非 01 |

### to_timestamp / to_date 字符串转日期

\`\`\`sql
SELECT to_date('2024-01-15', 'YYYY-MM-DD');
SELECT to_date('15/01/2024', 'DD/MM/YYYY');
SELECT to_timestamp('2024-01-15 14:30:00', 'YYYY-MM-DD HH24:MI:SS');

-- 注意：to_timestamp 总是返回带时区的 TIMESTAMP
-- 想要不带时区，用 ::TIMESTAMP 转换
SELECT to_timestamp('2024-01-15 14:30:00', 'YYYY-MM-DD HH24:MI:SS')::TIMESTAMP;
\`\`\`

> PG 的 \`to_char\`/\`to_date\`/\`to_timestamp\` 比 MySQL 的 \`DATE_FORMAT\`/\`STR_TO_DATE\` 更强大、更统一（同一套格式符）。

## 12.5 流程控制函数

### CASE 表达式

\`\`\`sql
-- 简单 CASE
SELECT
  status,
  CASE status
    WHEN 0 THEN '待付款'
    WHEN 1 THEN '已付款'
    WHEN 2 THEN '已发货'
    WHEN 3 THEN '已完成'
    WHEN 4 THEN '已取消'
    ELSE '未知'
  END AS status_name
FROM orders;

-- 搜索 CASE（更灵活）
SELECT
  username, age,
  CASE
    WHEN age < 18 THEN '未成年'
    WHEN age < 60 THEN '成年'
    ELSE '老年'
  END AS age_group
FROM users;
\`\`\`

### CASE 在聚合中的应用（行转列）

\`\`\`sql
-- 每个用户每种状态的订单数
SELECT
  user_id,
  SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) AS pending,
  SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS paid,
  SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) AS done
FROM orders
GROUP BY user_id;
\`\`\`

PG 还可用 \`FILTER\` 子句（更简洁）：
\`\`\`sql
SELECT
  user_id,
  COUNT(*) FILTER (WHERE status = 0) AS pending,
  COUNT(*) FILTER (WHERE status = 1) AS paid,
  COUNT(*) FILTER (WHERE status = 3) AS done
FROM orders
GROUP BY user_id;
\`\`\`

> \`FILTER (WHERE ...)\` 是 PG 特色，比 \`CASE WHEN\` 更清晰，性能略好。MySQL 不支持。

### COALESCE / NULLIF / GREATEST / LEAST

\`\`\`sql
-- COALESCE：返回第一个非 NULL 值
SELECT COALESCE(phone, email, '无联系方式') FROM users;
SELECT COALESCE(NULL, NULL, 'default');  -- 'default'

-- NULLIF：两值相等返回 NULL（常用于避免除零）
SELECT NULLIF(0, 0);    -- NULL
SELECT NULLIF(1, 1);    -- NULL
SELECT NULLIF(1, 2);    -- 1

-- 防除零：分母为 0 时返回 NULL 而非报错
SELECT 100 / NULLIF(quantity, 0) FROM orders;

-- GREATEST / LEAST：取最大/最小（忽略 NULL）
SELECT GREATEST(1, 5, 3);     -- 5
SELECT LEAST(1, 5, 3);        -- 1
SELECT GREATEST(1, NULL, 3);  -- 3
\`\`\`

## 12.6 NULL 处理

\`\`\`sql
-- IS NULL / IS NOT NULL
SELECT * FROM users WHERE phone IS NULL;
SELECT * FROM users WHERE phone IS NOT NULL;

-- IS DISTINCT FROM：把 NULL 当作普通值比较（PG 特色）
SELECT 1 IS DISTINCT FROM NULL;    -- true
SELECT NULL IS DISTINCT FROM NULL; -- false
SELECT NULL = NULL;                -- NULL（普通比较）
SELECT NULL IS DISTINCT FROM NULL; -- false

-- IS NOT DISTINCT FROM：相反
SELECT NULL IS NOT DISTINCT FROM NULL;  -- true
\`\`\`

> \`IS DISTINCT FROM\` 在比较可能含 NULL 的列时很有用，避免 NULL 的三值逻辑坑。

### NULL 排序

\`\`\`sql
-- PG 默认 NULL 排在最后（ASC 时），与 MySQL 相反
SELECT * FROM users ORDER BY phone;            -- NULL 在最后
SELECT * FROM users ORDER BY phone NULLS FIRST; -- NULL 在最前
SELECT * FROM users ORDER BY phone DESC;       -- NULL 在最前（DESC 默认）

-- 想要 NULL 永远在最后，用 NULLS LAST
SELECT * FROM users ORDER BY phone DESC NULLS LAST;
\`\`\`

> **PG vs MySQL NULL 排序差异**：PG 默认 ASC 时 NULL 在**最后**，MySQL 默认 NULL 在**最前**。迁移时注意。

## 12.7 类型转换（:: 操作符）

PostgreSQL 的 \`::\` 类型转换是标志性特性，比 MySQL 的 \`CAST()\` 简洁得多。

\`\`\`sql
-- :: 简洁转换
SELECT '123'::INT;
SELECT '2024-01-15'::DATE;
SELECT '2024-01-15 14:30:00'::TIMESTAMP;
SELECT 3.14::NUMERIC(10,2);     -- 3.14
SELECT 123::TEXT;
SELECT 't'::BOOLEAN;             -- true
SELECT '2024-01-15'::DATE + 7;   -- 7 天后

-- CAST 标准 SQL 写法
SELECT CAST('123' AS INTEGER);
SELECT CAST(3.14 AS NUMERIC(10,1));

-- 字符串拼接时常用
SELECT '订单号:' || id::TEXT FROM orders;

-- 数组类型转换
SELECT ARRAY[1,2,3]::TEXT;        -- '{1,2,3}'
SELECT '{1,2,3}'::INT[];          -- [1,2,3]
\`\`\`

> \`::\` 比 \`CAST()\` 简洁，但 \`CAST()\` 是 SQL 标准，跨数据库兼容。\`::\` 是 PG 独有。

## 12.8 数组操作符与函数（PG 特色）

PostgreSQL 原生支持数组类型，是强大特性。

\`\`\`sql
-- 数组字面量
SELECT ARRAY[1, 2, 3];
SELECT '{1,2,3}'::INT[];

-- 数组操作符
SELECT ARRAY[1,2,3] || 4;          -- {1,2,3,4}（追加）
SELECT ARRAY[1,2,3] || ARRAY[4,5]; -- {1,2,3,4,5}（拼接）
SELECT ARRAY[1,2,3] && ARRAY[3,4]; -- true（有交集）
SELECT ARRAY[1,2,3] @> ARRAY[2];   -- true（包含）
SELECT ARRAY[1,2,3] <@ ARRAY[1,2,3,4]; -- true（被包含）

-- 数组函数
SELECT ARRAY_LENGTH(ARRAY[1,2,3], 1);  -- 3
SELECT ARRAY_APPEND(ARRAY[1,2], 3);    -- {1,2,3}
SELECT ARRAY_PREPEND(0, ARRAY[1,2]);   -- {0,1,2}
SELECT ARRAY_REMOVE(ARRAY[1,2,3], 2);  -- {1,3}
SELECT ARRAY_POSITION(ARRAY[1,2,3], 2); -- 2
SELECT UNNEST(ARRAY[1,2,3]);           -- 1, 2, 3（拆成多行）
SELECT ARRAY_AGG(id) FROM users;       -- 聚合成数组

-- 数组索引（从 1 开始！）
SELECT (ARRAY[10,20,30])[1];  -- 10
SELECT (ARRAY[10,20,30])[2];  -- 20
\`\`\`

> \`UNNEST\` 把数组拆成行，\`ARRAY_AGG\` 把行聚合成数组，互为逆操作。配 \`generate_series\` 和 \`LATERAL\` 极其强大。

### 数组用于 IN 查询

\`\`\`sql
-- = ANY 数组
SELECT * FROM users WHERE id = ANY(ARRAY[1, 2, 3]);
-- 等价于 IN
SELECT * FROM users WHERE id IN (1, 2, 3);

-- 数组包含查询（用 GIN 索引加速）
SELECT * FROM articles WHERE tags @> ARRAY['java', 'sql'];
\`\`\`

## 12.9 范围类型与操作符（PG 特色）

PostgreSQL 独有范围类型，处理区间数据非常方便。

\`\`\`sql
-- 范围类型
SELECT INT4RANGE(1, 10);        -- [1,10)
SELECT DATERANGE('2024-01-01', '2024-02-01');
SELECT TSRANGE('2024-01-01 00:00', '2024-01-02 00:00');

-- 范围操作符
SELECT INT4RANGE(1,5) @> 3;             -- true（包含元素）
SELECT INT4RANGE(1,5) && INT4RANGE(3,7);-- true（重叠）
SELECT INT4RANGE(1,5) << INT4RANGE(6,9);-- true（严格左于）

-- 应用：预订时段不重叠
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  room_id INT,
  during TSRANGE,
  EXCLUDE USING GIST (room_id WITH =, during WITH &&)  -- 防止同房间时段重叠
);
\`\`\`

> \`EXCLUDE\` 约束配 GIST 索引是 PG 独家，能保证时段不重叠。MySQL 完全做不到。

## 12.10 JSON 函数（PG 强项，详见后续章节）

简单介绍，详细见第四部分 PG 特色功能：

\`\`\`sql
-- JSONB 字段提取
SELECT data->'name' FROM events;          -- JSONB
SELECT data->>'name' FROM events;         -- TEXT（去引号）
SELECT data#>'{addr,city}' FROM events;   -- 路径取值
SELECT data#>>'{addr,city}' FROM events;  -- 路径取值 TEXT

-- 修改
SELECT jsonb_set(data, '{age}', '30'::jsonb);
SELECT data - 'age';                       -- 删除键

-- 查询
SELECT * FROM events WHERE data @> '{"user_id": 1}';  -- 包含
SELECT * FROM events WHERE data ? 'name';             -- 键存在
\`\`\`

## 12.11 踩坑提示

**坑 1：LENGTH 语义差异**
PG 的 \`LENGTH('你好')\` 是 2（字符数），MySQL 的 \`LENGTH('你好')\` 是 6（字节数）。迁移时注意用 \`OCTET_LENGTH\` 对应 MySQL 的 \`LENGTH\`。

**坑 2：ROUND 行为差异**
PG 的 \`ROUND(2.5)\` = 2（银行家舍入），MySQL = 3。要 MySQL 行为需自定义函数。

**坑 3：NULL 排序差异**
PG 默认 ASC 时 NULL 在最后，MySQL 在最前。用 \`NULLS FIRST\`/\`NULLS LAST\` 明确。

**坑 4：date_trunc 在 WHERE 中索引失效**
\`\`\`sql
-- 错（索引失效）
WHERE date_trunc('month', created_at) = '2024-01-01'
-- 对（走索引）
WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01'
\`\`\`

**坑 5：|| 拼接 NULL**
\`\`\`sql
SELECT NULL || 'a';   -- NULL（PG）
SELECT CONCAT(NULL, 'a');  -- 'a'（CONCAT 忽略 NULL）
\`\`\`
要忽略 NULL 用 \`CONCAT\` 或 \`COALESCE\`。

**坑 6：to_timestamp 返回带时区**
\`to_timestamp('2024-01-15', 'YYYY-MM-DD')\` 返回 \`TIMESTAMP WITH TIME ZONE\`，要无时区需 \`::TIMESTAMP\` 转换。

**坑 7：:: 转换非法值报错**
\`\`\`sql
SELECT 'abc'::INT;  -- 报错：invalid input syntax for type integer
\`\`\`
要容错用 \`to_number\` 或先校验：
\`\`\`sql
SELECT CASE WHEN 'abc' ~ '^[0-9]+$' THEN 'abc'::INT ELSE NULL END;
\`\`\`

**坑 8：ORDER BY RANDOM() 大表慢**
用 \`TABLESAMPLE\` 或基于主键的随机抽样替代。

**坑 9：函数包裹列导致索引失效**
\`\`\`sql
WHERE EXTRACT(YEAR FROM created_at) = 2024    -- 索引失效
WHERE LEFT(name, 3) = 'abc'                   -- 索引失效
WHERE name LIKE 'abc%'                        -- 走索引（PG 支持）
\`\`\`
PG 可用**表达式索引**解决：
\`\`\`sql
CREATE INDEX idx_year ON orders (EXTRACT(YEAR FROM created_at));
\`\`\`

**坑 10：LIKE 大小写**
PG 的 \`LIKE\` 区分大小写，要忽略用 \`ILIKE\`。MySQL 的 \`LIKE\` 默认不区分（取决于 collation）。

## 12.12 本章小结

- 字符串：\`||\`/\`CONCAT\`、\`SUBSTRING\`、\`REPLACE\`、\`TRIM\`、\`LPAD\`、\`SPLIT_PART\`、\`STRING_TO_ARRAY\`
- 正则：\`~\`/\`~*\`/\`!~\`、\`REGEXP_REPLACE\`、\`REGEXP_MATCHES\`、\`REGEXP_SPLIT_TO_TABLE\`（PG 强项）
- 数值：\`ROUND\`（注意银行家舍入）、\`CEIL\`、\`FLOOR\`、\`MOD\`、\`RANDOM\`、\`TABLESAMPLE\`、序列函数
- 日期：\`NOW\`、\`date_trunc\`、\`date_part\`/\`EXTRACT\`、\`age\`、\`to_char\`、\`to_timestamp\`、\`INTERVAL\`
- 流程：\`CASE WHEN\`、\`FILTER (WHERE ...)\`、\`COALESCE\`、\`NULLIF\`、\`GREATEST\`、\`LEAST\`
- NULL：\`IS NULL\`、\`IS DISTINCT FROM\`、\`NULLS FIRST/LAST\`
- 转换：\`::\`（PG 独家简洁）、\`CAST()\`（SQL 标准）
- 数组：\`ARRAY[]\`、\`||\`、\`@>\`、\`UNNEST\`、\`ARRAY_AGG\`（PG 强项）
- 范围：\`INT4RANGE\`、\`@>\`、\`&&\`、\`EXCLUDE\` 约束（PG 独家）
- 函数包裹列会索引失效，用范围查询或表达式索引
- PG vs MySQL 差异：\`LENGTH\`、\`ROUND\`、NULL 排序、\`LIKE\` 大小写

至此第二部分查询进阶结束。下一部分讲高级特性。`
  }
];

export { chapters };
