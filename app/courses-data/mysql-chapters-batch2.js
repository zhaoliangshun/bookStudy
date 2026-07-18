// =============================================================
// 《MySQL 实战教程》- 章节批次 2
// -------------------------------------------------------------
// 内容：第二部分 查询进阶（第 7-12 章）
// =============================================================

const chapters = [
  {
    id: "mysql-ch07",
    group: "第二部分 查询进阶",
    icon: "🔗",
    title: "第 7 章 JOIN 多表连接",
    content: `# 第 7 章 JOIN 多表连接

现实业务的数据分散在多张表里：用户在 users 表、订单在 orders 表、商品在 products 表。JOIN 是把多张表"横向拼"在一起的核心能力。

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

\`USING (col)\` 等价于 \`ON a.col = b.col\`，更简洁。

### 多表 INNER JOIN

\`\`\`sql
-- 订单 + 用户 + 商品
SELECT o.id, u.username, p.name AS product_name, oi.quantity
FROM orders o
INNER JOIN users u        ON o.user_id = u.id
INNER JOIN order_items oi ON oi.order_id = o.id
INNER JOIN products p     ON oi.product_id = p.id;
\`\`\`

## 7.2 LEFT / RIGHT JOIN 外连接

外连接保留**一边的所有行**，即使另一边没匹配。

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
-- 生成 7 天 × 所有用户的网格
SELECT u.id, d.day
FROM users u
CROSS JOIN (
  SELECT CURDATE() - INTERVAL n DAY AS day
  FROM (SELECT 0 n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3
        UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) days
) d;
\`\`\`

> 踩坑：忘写 ON 条件的 INNER JOIN 会变成 CROSS JOIN！
> \`\`\`sql
> SELECT * FROM users, orders;  -- 隐式 CROSS JOIN，结果爆炸
> \`\`\`

## 7.4 SELF JOIN 自连接

同一张表和自己 JOIN，需要用别名区分。

### 经典场景 1：员工-经理关系

\`\`\`sql
CREATE TABLE employees (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  manager_id INT
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
JOIN logins b ON a.user_id = b.user_id AND a.login_date = b.login_date - INTERVAL 1 DAY
JOIN logins c ON b.user_id = c.user_id AND b.login_date = c.login_date - INTERVAL 1 DAY;
\`\`\`

> 自连接 + 窗口函数（第 10 章）是解决"连续 N 天"问题的利器。

## 7.5 多表连接（3 表以上）

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

MySQL 优化器会自动选择 JOIN 顺序，但一般遵循：
1. 从第一张表（驱动表）开始，按 WHERE 过滤
2. 用驱动表结果去 JOIN 下一张表（被驱动表）
3. 被驱动表的 JOIN 列必须有索引，否则全表扫描

> 经验：驱动表选**小表**（WHERE 后行数少的），被驱动表的 JOIN 列建索引。

## 7.6 JOIN 的性能注意

**坑 1：JOIN 列没索引**

\`\`\`sql
-- orders.user_id 没索引 → 每条订单都要全表扫 users
SELECT * FROM orders o JOIN users u ON o.user_id = u.id;
\`\`\`
**优化**：在 \`orders.user_id\` 和 \`users.id\`（主键自带）上都建索引。

**坑 2：JOIN 列类型不一致**

\`\`\`sql
-- orders.user_id 是 BIGINT，users.id 是 VARCHAR → 隐式转换，索引失效
SELECT * FROM orders o JOIN users u ON o.user_id = u.id;
\`\`\`
**优化**：外键和主键类型必须一致（都用 BIGINT UNSIGNED）。

**坑 3：JOIN 列字符集不一致**

\`\`\`sql
-- 两表都是 utf8mb4，但一个 general_ci 一个 unicode_ci → 索引失效
SELECT * FROM a JOIN b ON a.code = b.code;
\`\`\`
**优化**：统一字符集和排序规则。

**坑 4：大表 JOIN 大表**

两表都几千万行，JOIN 时内存撑不住，走磁盘临时表慢到爆。优化：
- 先用 WHERE 把数据量降下来
- 用子查询 / CTE 提前聚合
- 必要时拆分查询，应用层组装

**坑 5：SELECT * 把所有列都拉回来**

JOIN 时表越多，SELECT * 返回的列越多，浪费网络带宽。只选需要的列。

### STRAIGHT_JOIN 强制顺序

\`\`\`sql
-- 优化器选错顺序时，用 STRAIGHT_JOIN 强制按书写顺序 JOIN
SELECT STRAIGHT_JOIN * FROM small_table s
JOIN big_table b ON s.id = b.sid;
\`\`\`

> 谨慎使用，先 EXPLAIN 确认优化器选错了再用。

## 7.7 踩坑提示

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
要么用 DISTINCT，要么 GROUP BY。

**坑 4：USING 和 ON 的列名暴露差异**
\`USING (col)\` 会合并两表的 col 为一列，\`ON a.col = b.col\` 保留两列。

## 7.8 本章小结

- \`INNER JOIN\`：只返回两表都匹配的行（最常用）
- \`LEFT JOIN\`：保留左表所有行，右表没匹配填 NULL（找"没有"的数据）
- \`RIGHT JOIN\`：保留右表所有行（少用，换 LEFT JOIN 即可）
- \`CROSS JOIN\`：笛卡尔积，生成网格
- \`SELF JOIN\`：自连接，处理层级、配对、连续问题
- JOIN 列必须建索引、类型一致、字符集一致
- LEFT JOIN 的右表过滤条件放 ON，不要放 WHERE
- COUNT 在 LEFT JOIN 时用 \`COUNT(右表.列)\` 而非 \`COUNT(*)\`

下一章讲子查询，另一种"跨表"的思路。`
  },

  {
    id: "mysql-ch08",
    group: "第二部分 查询进阶",
    icon: "🎯",
    title: "第 8 章 子查询",
    content: `# 第 8 章 子查询

子查询是"查询里的查询"——把一个 SELECT 的结果作为另一个 SQL 的一部分。它能解决很多复杂问题，但写不好会很慢。

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

> 标量子查询返回多行会报错：\`Subquery returns more than 1 row\`。

## 8.2 行子查询 / 表子查询

### 行子查询（返回一行多列）

\`\`\`sql
-- 找和某个用户同城市同年龄的人
SELECT * FROM users
WHERE (city, age) = (
  SELECT city, age FROM users WHERE id = 1
);
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

> FROM 子查询会**物化**为临时表，没有索引。大数据量建议改写成 JOIN。

## 8.3 IN / EXISTS / ANY / ALL

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
> 解决：在子查询里加 \`WHERE col IS NOT NULL\`。

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

实际上 MySQL 8.0 优化器会自动转换，性能差异不大。**优先用 EXISTS**，因为它对 NULL 友好。

### ANY / ALL

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

> ANY/ALL 较少用，用 MIN/MAX 改写更直观。

## 8.4 相关子查询 vs 非相关子查询

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

## 8.5 子查询 vs JOIN 的选择

很多子查询都能改写成 JOIN，反之亦然。选择原则：

| 需求 | 推荐 |
| --- | --- |
| 横向拼字段（订单 + 用户名） | JOIN |
| 过滤（有/没有订单的用户） | EXISTS / LEFT JOIN + IS NULL |
| 标量比较（比平均大） | 标量子查询 |
| 多层聚合（每个用户的最大订单） | 窗口函数 / 子查询 |

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

-- 方法 3：JOIN 子查询
SELECT o.*
FROM orders o
JOIN (
  SELECT user_id, MAX(total_amount) AS max_amount
  FROM orders GROUP BY user_id
) m ON o.user_id = m.user_id AND o.total_amount = m.max_amount;
\`\`\`

## 8.6 派生表（FROM 子查询）的优化

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

MySQL 8.0 优化器会自动把派生表"合并"到外层查询（derived_merge），等价于：
\`\`\`sql
SELECT user_id, COUNT(*) AS cnt
FROM orders
GROUP BY user_id
HAVING COUNT(*) > 5;
\`\`\`

但有些情况无法合并（如子查询有 LIMIT、UNION、聚合 + 外层引用），会物化为临时表。

> 经验：能用 JOIN/窗口函数替代的，就别用派生表。

## 8.7 踩坑提示

**坑 1：NOT IN + NULL = 空结果**
\`\`\`sql
SELECT * FROM users WHERE id NOT IN (SELECT user_id FROM orders);
-- 如果 orders.user_id 有 NULL，结果永远是空
\`\`\`
修复：\`NOT IN (SELECT user_id FROM orders WHERE user_id IS NOT NULL)\`，或改用 \`NOT EXISTS\`。

**坑 2：相关子查询性能差**
每行都执行子查询，N 行就 N 次。用 JOIN 或窗口函数替代。

**坑 3：派生表没索引**
\`\`\`sql
SELECT * FROM (SELECT ... FROM big_table) t
JOIN other ON t.id = other.id;
-- t.id 没索引，JOIN 慢
\`\`\`
8.0 会自动合并派生表，但仍要 EXPLAIN 确认。

**坑 4：SELECT 中的标量子查询执行多次**
\`\`\`sql
SELECT id, (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_cnt
FROM users u;
-- 每个 user 都算一次子查询，1000 用户就 1000 次
\`\`\`
优化：改用 LEFT JOIN + GROUP BY：
\`\`\`sql
SELECT u.id, COUNT(o.id) AS order_cnt
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id;
\`\`\`

**坑 5：子查询层级太深**
\`\`\`sql
SELECT * FROM (SELECT * FROM (SELECT * FROM (SELECT ...) ...) ...) ...;
\`\`\`
可读性差、性能差。用 CTE（第 11 章）拆分。

## 8.8 本章小结

- 标量子查询返回单值，可用于 SELECT/WHERE/HAVING
- 表子查询（派生表）可当 FROM 的表用，但通常没索引
- \`IN\` 适合"包含"，\`EXISTS\` 适合"存在"，对 NULL 友好
- \`NOT IN\` 遇 NULL 返回空，改用 \`NOT EXISTS\` 或加 \`IS NOT NULL\`
- 相关子查询每行都执行，慎用，优先改写为 JOIN/窗口函数
- MySQL 8.0 派生表会自动合并优化
- 子查询 vs JOIN：能 JOIN 就 JOIN，标量比较用子查询

下一章讲 UNION，把多个查询结果"纵向"拼接。`
  },

  {
    id: "mysql-ch09",
    group: "第二部分 查询进阶",
    icon: "📊",
    title: "第 9 章 UNION 与集合操作",
    content: `# 第 9 章 UNION 与集合操作

JOIN 是"横向"拼接表，UNION 是"纵向"拼接查询结果。MySQL 8.0 起还支持了 INTERSECT 和 EXCEPT，集合操作终于齐全。

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
| \`UNION\` | 去重（DISTINCT） | 慢（要排序去重） |
| \`UNION ALL\` | 不去重 | 快（直接拼接） |

> 经验：**默认用 UNION ALL**。只有需要去重时才用 UNION。去重会触发临时表 + 排序，开销大。

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
-- 把分散的多张表合并查询
SELECT order_id, amount, created_at FROM orders_2023
UNION ALL
SELECT order_id, amount, created_at FROM orders_2024
ORDER BY created_at DESC;
\`\`\`

### 经典应用：行转列

\`\`\`sql
-- 把一行变多行
SELECT id, 'phone' AS field, phone AS value FROM users WHERE phone IS NOT NULL
UNION ALL
SELECT id, 'email' AS field, email AS value FROM users WHERE email IS NOT NULL
UNION ALL
SELECT id, 'address' AS field, address AS value FROM users WHERE address IS NOT NULL;
\`\`\`

## 9.2 INTERSECT（MySQL 8.0+）

\`INTERSECT\` 取**交集**：两个查询都有的行。

\`\`\`sql
-- 找既买了商品 A 又买了商品 B 的用户
SELECT user_id FROM orders WHERE product_id = 1
INTERSECT
SELECT user_id FROM orders WHERE product_id = 2;
\`\`\`

> MySQL 8.0 之前没有 INTERSECT，要用 INNER JOIN 或 IN 模拟：
> \`\`\`sql
> SELECT DISTINCT user_id FROM orders
> WHERE product_id = 1 AND user_id IN (SELECT user_id FROM orders WHERE product_id = 2);
> \`\`\`

### INTERSECT ALL

8.0 起还支持 \`INTERSECT ALL\`（保留重复行），但 MySQL 实际只支持 \`INTERSECT DISTINCT\`。

## 9.3 EXCEPT（MySQL 8.0+）

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

### 经典应用：找"缺失"的数据

\`\`\`sql
-- 应该登录但没登录的用户（user_ids 全集 - 实际登录的）
SELECT user_id FROM expected_logins
EXCEPT
SELECT user_id FROM actual_logins;
\`\`\`

## 9.4 集合操作的注意事项

### 优先级

\`INTERSECT\` 优先级高于 \`UNION\` 和 \`EXCEPT\`：

\`\`\`sql
-- 这个等价于 A UNION (B INTERSECT C)
A UNION B INTERSECT C;

-- 用括号明确
(A UNION B) INTERSECT C;
\`\`\`

### 列数和类型必须一致

\`\`\`sql
-- 错：列数不同
SELECT id, name FROM users
UNION
SELECT id FROM admins;

-- 错：类型不兼容
SELECT id, created_at FROM users  -- DATETIME
UNION
SELECT id, phone FROM users;       -- VARCHAR
\`\`\`

### ORDER BY 和 LIMIT

\`\`\`sql
-- LIMIT 作用于整个 UNION
(SELECT id FROM users LIMIT 5)
UNION ALL
(SELECT id FROM admins LIMIT 5)
LIMIT 10;

-- 用括号让每个 SELECT 都能 LIMIT
(SELECT id, name FROM users ORDER BY id DESC LIMIT 3)
UNION ALL
(SELECT id, name FROM admins ORDER BY id DESC LIMIT 3);
\`\`\`

### 性能注意

- \`UNION ALL\` 几乎无开销（直接拼接）
- \`UNION\` / \`INTERSECT\` / \`EXCEPT\` 需要去重，会**临时表 + 排序**
- 大数据量集合操作慢，能用 JOIN 替代就替代

## 9.5 踩坑提示

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

**坑 4：INTERSECT/EXCEPT 老版本不支持**
MySQL 8.0 才支持。5.7 用 IN/EXISTS/JOIN 替代。

**坑 5：UNION 结果列名取第一个 SELECT**
\`\`\`sql
SELECT id AS user_id, name FROM users
UNION ALL
SELECT id AS admin_id, name FROM admins;
-- 结果列名是 user_id，不是 admin_id
\`\`\`

## 9.6 本章小结

- \`UNION ALL\` 纵向拼接不去重（快，默认用这个）
- \`UNION\` 拼接并去重（慢，要排序）
- \`INTERSECT\` 取交集（8.0+）
- \`EXCEPT\` 取差集（8.0+），找"缺失"数据利器
- 列数必须相同，类型兼容，列名取第一个 SELECT
- ORDER BY/LIMIT 只能作用于整个 UNION 结果（除非用括号）
- 大数据量集合操作慢，能 JOIN 就别 UNION

下一章讲窗口函数 —— MySQL 8.0 最强查询利器。`
  },

  {
    id: "mysql-ch10",
    group: "第二部分 查询进阶",
    icon: "🪟",
    title: "第 10 章 窗口函数",
    content: `# 第 10 章 窗口函数

窗口函数（Window Functions）是 MySQL 8.0 最重要的特性之一。它能在不聚合行的前提下，对一组行计算"窗口"内的值，完美解决"Top N"、"连续登录"、"累计求和"等问题。

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

> 这是窗口函数最经典用法：**分组 Top N**。GROUP BY 做不到，窗口函数一行搞定。

## 10.3 LAG / LEAD

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
  ROUND((revenue - LAG(revenue) OVER (ORDER BY month))
        / LAG(revenue) OVER (ORDER BY month) * 100, 2) AS growth_pct
FROM (
  SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
         SUM(total_amount) AS revenue
  FROM orders
  GROUP BY DATE_FORMAT(created_at, '%Y-%m')
) t;
\`\`\`

## 10.4 FIRST_VALUE / LAST_VALUE / NTH_VALUE

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

## 10.5 SUM/AVG/COUNT OVER

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

## 10.6 PARTITION BY 与 ORDER BY

- \`PARTITION BY\`：定义窗口（分组），类似 GROUP BY
- \`ORDER BY\`：窗口内排序

\`\`\`sql
-- 每个用户按日期排序的累计金额
SUM(total_amount) OVER (
  PARTITION BY user_id
  ORDER BY created_at
) AS running_total_per_user
\`\`\`

### Frame 子句

\`\`\`sql
ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW  -- 从开头到当前行（默认）
ROWS BETWEEN 2 PRECEDING AND CURRENT ROW          -- 前 2 行 + 当前行
ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING  -- 整个分区
ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING  -- 当前行到结尾
\`\`\`

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
\`\`\`

## 10.7 经典应用

### 去重保留最新一条

\`\`\`sql
-- 每个 user_id 只保留 created_at 最大的一行
DELETE FROM user_logs
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
    FROM user_logs
  ) t WHERE rn = 1
);
\`\`\`

### 连续登录 N 天

\`\`\`sql
-- 找连续登录 3 天以上的用户
SELECT user_id
FROM (
  SELECT
    user_id, login_date,
    login_date - INTERVAL ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) DAY AS grp
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
  ROUND((revenue - LAG(revenue, 12) OVER (ORDER BY month))
        / LAG(revenue, 12) OVER (ORDER BY month) * 100, 2) AS yoy_pct
FROM monthly_revenue;
\`\`\`

## 10.8 踩坑提示

**坑 1：LAST_VALUE 默认窗口不是分区末尾**
默认 \`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\`，要拿整个分区末尾必须显式扩展 frame。

**坑 2：ROW_NUMBER 用于去重时性能**
大表上 ROW_NUMBER 会排序，注意排序列加索引。

**坑 3：窗口函数不能在 WHERE 中用**
\`\`\`sql
-- 错
SELECT * FROM orders WHERE ROW_NUMBER() OVER (...) > 1;
-- 报错：Window functions are not allowed in WHERE
\`\`\`
必须套一层子查询：
\`\`\`sql
SELECT * FROM (
  SELECT o.*, ROW_NUMBER() OVER (...) AS rn FROM orders o
) t WHERE rn > 1;
\`\`\`

**坑 4：窗口函数 vs GROUP BY 混淆**
窗口函数保留所有行，GROUP BY 压缩行。要"压缩"用 GROUP BY，要"附加计算"用窗口函数。

## 10.9 本章小结

- 窗口函数 = 聚合但不压缩行，额外加一列
- \`ROW_NUMBER\` 严格递增，\`RANK\` 跳号，\`DENSE_RANK\` 不跳号
- \`LAG/LEAD\` 取前后行，做环比/同比
- \`SUM/AVG OVER\` 做累计、占比、滑动平均
- \`PARTITION BY\` 分组，\`ORDER BY\` 排序，\`frame\` 控制窗口范围
- 经典应用：分组 Top N、连续登录、去重保留最新、累计求和、环比同比
- 窗口函数不能在 WHERE 用，需套子查询

下一章讲 CTE，让复杂查询变得可读。`
  },

  {
    id: "mysql-ch11",
    group: "第二部分 查询进阶",
    icon: "🧩",
    title: "第 11 章 CTE 公用表表达式",
    content: `# 第 11 章 CTE 公用表表达式

CTE（Common Table Expression）用 \`WITH\` 子句定义"临时视图"，让复杂查询模块化、可读。还能递归，处理树形/层级数据。

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

### CTE 用于 UPDATE/DELETE

\`\`\`sql
-- 用 CTE 辅助删除
DELETE FROM orders
WHERE user_id IN (
  WITH inactive AS (SELECT id FROM users WHERE status = 0)
  SELECT id FROM inactive
);
\`\`\`

## 11.3 递归 CTE

递归 CTE 能"自己引用自己"，处理树形/层级数据。语法：

\`\`\`sql
WITH RECURSIVE cte_name AS (
  -- 基础部分（非递归）
  SELECT ...
  UNION ALL
  -- 递归部分（引用自己）
  SELECT ... FROM cte_name WHERE ...
)
SELECT * FROM cte_name;
\`\`\`

### 经典应用 1：组织架构树

\`\`\`sql
CREATE TABLE employees (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  manager_id INT
);

INSERT INTO employees VALUES
  (1, 'CEO', NULL),
  (2, 'CTO', 1),
  (3, 'CFO', 1),
  (4, '工程师A', 2),
  (5, '工程师B', 2),
  (6, '会计A', 3);

-- 查每个人到 CEO 的层级路径
WITH RECURSIVE org_path AS (
  -- 基础：CEO 是第 1 层
  SELECT id, name, manager_id, 1 AS level, CAST(name AS CHAR(500)) AS path
  FROM employees WHERE manager_id IS NULL

  UNION ALL

  -- 递归：每个员工的上级在 org_path 中
  SELECT e.id, e.name, e.manager_id, op.level + 1,
    CONCAT(op.path, ' > ', e.name)
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
  SELECT CURDATE() - INTERVAL 29 DAY AS d
  UNION ALL
  SELECT d + INTERVAL 1 DAY FROM dates WHERE d < CURDATE()
)
SELECT * FROM dates;
\`\`\`

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

### 递归控制

- \`cte_max_recursion_depth\`：默认 1000，超过报错
- 必须有终止条件，否则无限递归

\`\`\`sql
SET SESSION cte_max_recursion_depth = 10000;  -- 调大
\`\`\`

## 11.4 CTE 的应用场景

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
  SELECT DATE(created_at) AS d, user_id, SUM(amount) AS daily_sum
  FROM orders GROUP BY DATE(created_at), user_id
)
SELECT
  DATE_FORMAT(d, '%Y-%m') AS month,
  user_id,
  SUM(daily_sum) AS monthly_sum,
  AVG(daily_sum) AS avg_daily
FROM daily
GROUP BY DATE_FORMAT(d, '%Y-%m'), user_id;
\`\`\`

### 3. 树形/层级查询

组织架构、评论嵌套、分类树，递归 CTE 是最佳工具。

## 11.5 踩坑提示

**坑 1：递归没有终止条件**
\`\`\`sql
-- 没终止 → 递归到 cte_max_recursion_depth 报错
WITH RECURSIVE bad AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM bad  -- 没 WHERE 限制
)
SELECT * FROM bad;
\`\`\`

**坑 2：递归 CTE 中用 LEFT JOIN**
递归部分通常用 INNER JOIN，LEFT JOIN 可能产生 NULL 导致无限递归。

**坑 3：CTE 性能**
MySQL 8.0 的 CTE 默认**物化**为临时表（不像 PostgreSQL 总是内联）。多次引用时物化一次是好事，单次引用可能稍慢。可设 \`SET optimizer_switch='derived_merge=on'\` 优化。

**坑 4：CTE 作用域**
CTE 只在当前语句有效，不能跨语句复用。

**坑 5：递归 CTE 不能用聚合函数**
\`\`\`sql
-- 错：递归部分不能用 GROUP BY / SUM
WITH RECURSIVE bad AS (
  SELECT ... UNION ALL
  SELECT ..., SUM(x) FROM bad GROUP BY ...  -- 报错
)
\`\`\`

## 11.6 本章小结

- CTE = 命名的临时结果集，让复杂查询模块化、可读
- 多个 CTE 可串联、可互相引用
- 非递归 CTE 是派生表的优雅替代
- 递归 CTE 处理树形/层级数据：组织架构、评论嵌套、分类树
- 递归 CTE 必须有终止条件，否则递归到上限报错
- 用 CTE 生成序列、日期网格
- CTE 只在当前语句有效

下一章讲 MySQL 常用函数大全。`
  },

  {
    id: "mysql-ch12",
    group: "第二部分 查询进阶",
    icon: "📐",
    title: "第 12 章 常用函数大全",
    content: `# 第 12 章 常用函数大全

MySQL 内置了几百个函数，本章挑最常用的讲，分类清晰、示例充足。掌握这些，日常开发够用。

## 12.1 字符串函数

### 长度与拼接

\`\`\`sql
SELECT LENGTH('hello');                    -- 5（字节数）
SELECT CHAR_LENGTH('你好');                -- 2（字符数）
SELECT CONCAT('a', 'b', 'c');              -- 'abc'
SELECT CONCAT_WS('-', '2024','01','15');   -- '2024-01-15'（用分隔符拼接）
\`\`\`

> \`LENGTH\` 返回**字节**数，\`CHAR_LENGTH\` 返回**字符**数。utf8mb4 下中文 \`LENGTH\` 是 4，\`CHAR_LENGTH\` 是 1。

### 大小写转换

\`\`\`sql
SELECT UPPER('abc');        -- 'ABC'
SELECT LOWER('ABC');        -- 'abc'
SELECT UCASE('abc');        -- UPPER 别名
\`\`\`

### 截取与替换

\`\`\`sql
SELECT SUBSTRING('hello', 2, 3);           -- 'ell'（从位置 2 开始取 3 个）
SELECT SUBSTR('hello', 2);                  -- 'ello'（从位置 2 到末尾）
SELECT LEFT('hello', 3);                    -- 'hel'
SELECT RIGHT('hello', 3);                   -- 'llo'
SELECT REPLACE('hello', 'l', 'L');          -- 'heLLo'
SELECT INSERT('hello', 2, 3, 'XXX');        -- 'hXXXo'（位置 2 起替换 3 个字符）
\`\`\`

### 查找与定位

\`\`\`sql
SELECT INSTR('hello', 'll');                -- 3（首次出现位置）
SELECT LOCATE('ll', 'hello');               -- 3（同上，参数顺序反）
SELECT LOCATE('l', 'hello', 4);             -- 4（从位置 4 开始找）
SELECT FIELD('b', 'a','b','c');             -- 2（b 在列表中的位置）
\`\`\`

### 去空格

\`\`\`sql
SELECT TRIM('  hello  ');                   -- 'hello'
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
SELECT CONCAT('ORD', LPAD(id, 8, '0')) AS order_no FROM orders;
-- ORD00000001
\`\`\`

### 分割

\`\`\`sql
SELECT SUBSTRING_INDEX('a,b,c,d', ',', 2);  -- 'a,b'（取前 2 段）
SELECT SUBSTRING_INDEX('a,b,c,d', ',', -2); -- 'c,d'（取后 2 段）
\`\`\`

### 其他常用

\`\`\`sql
SELECT REVERSE('hello');                    -- 'olleh'
SELECT REPEAT('ab', 3);                     -- 'ababab'
SELECT FORMAT(1234567.891, 2);              -- '1,234,567.89'
SELECT HEX('hello');                        -- '68656C6C6F'
SELECT UNHEX('68656C6C6F');                 -- 'hello'
\`\`\`

## 12.2 数值函数

### 四舍五入

\`\`\`sql
SELECT ROUND(3.14159, 2);    -- 3.14
SELECT ROUND(3.5);           -- 4
SELECT ROUND(2.5);           -- 3（注意！MySQL 的 ROUND 是"银行家舍入"）
SELECT CEIL(3.1);            -- 4（向上取整）
SELECT FLOOR(3.9);           -- 3（向下取整）
SELECT TRUNCATE(3.14159, 2); -- 3.14（直接截断，不四舍五入）
\`\`\`

> \`ROUND(2.5)\` 在 MySQL 中返回 3 而非 2，因为它对"恰好 0.5"做"远离零"舍入（不是银行家舍入，上面更正：MySQL 是 ROUND HALF AWAY FROM ZERO）。

### 取模与绝对值

\`\`\`sql
SELECT MOD(10, 3);           -- 1（取模）
SELECT 10 % 3;               -- 1（同上）
SELECT ABS(-5);              -- 5
SELECT SIGN(-5);             -- -1（符号：-1/0/1）
\`\`\`

### 幂与对数

\`\`\`sql
SELECT POW(2, 10);           -- 1024
SELECT POWER(2, 10);         -- 同上
SELECT SQRT(16);             -- 4
SELECT EXP(1);               -- 2.718...
SELECT LN(2.718);            -- 1（自然对数）
SELECT LOG10(100);           -- 2
\`\`\`

### 随机数

\`\`\`sql
SELECT RAND();               -- 0~1 随机小数
SELECT RAND(42);             -- 带种子，可复现
SELECT FLOOR(RAND() * 100);  -- 0~99 随机整数
SELECT * FROM users ORDER BY RAND() LIMIT 5;  -- 随机抽 5 条（慢！）
\`\`\`

> \`ORDER BY RAND()\` 会为每行生成随机数再排序，大表极慢。优化：先随机生成主键再查。

### 其他

\`\`\`sql
SELECT GREATEST(1, 5, 3);    -- 5
SELECT LEAST(1, 5, 3);       -- 1
SELECT CONV('FF', 16, 10);   -- 255（进制转换）
\`\`\`

## 12.3 日期时间函数

### 当前时间

\`\`\`sql
SELECT NOW();                -- 2024-01-15 14:30:00（DATETIME）
SELECT CURDATE();            -- 2024-01-15（DATE）
SELECT CURTIME();            -- 14:30:00（TIME）
SELECT SYSDATE();            -- 实时时间（每行重算，慎用）
SELECT UNIX_TIMESTAMP();     -- 1705305000（时间戳）
SELECT FROM_UNIXTIME(1705305000);  -- '2024-01-15 14:30:00'
\`\`\`

> \`NOW()\` 在整个语句中是同一时刻，\`SYSDATE()\` 是函数调用时刻。生产用 \`NOW()\`。

### 提取部分

\`\`\`sql
SELECT YEAR(NOW());          -- 2024
SELECT MONTH(NOW());         -- 1
SELECT DAY(NOW());           -- 15
SELECT HOUR(NOW());
SELECT MINUTE(NOW());
SELECT SECOND(NOW());
SELECT DAYOFWEEK(NOW());     -- 2（周日=1，周一=2）
SELECT DAYNAME(NOW());       -- 'Monday'
SELECT MONTHNAME(NOW());     -- 'January'
SELECT WEEK(NOW());          -- 周数
SELECT DAYOFYEAR(NOW());     -- 一年中第几天
\`\`\`

### 日期格式化

\`\`\`sql
SELECT DATE_FORMAT(NOW(), '%Y-%m-%d');           -- '2024-01-15'
SELECT DATE_FORMAT(NOW(), '%Y年%m月%d日');        -- '2024年01月15日'
SELECT DATE_FORMAT(NOW(), '%H:%i:%s');           -- '14:30:00'
SELECT DATE_FORMAT(NOW(), '%W %M %e %Y');        -- 'Monday January 15 2024'
\`\`\`

**常用格式符**：

| 符号 | 含义 | 示例 |
| --- | --- | --- |
| \`%Y\` | 4 位年 | 2024 |
| \`%m\` | 月（01-12） | 01 |
| \`%d\` | 日（01-31） | 15 |
| \`%H\` | 时（00-23） | 14 |
| \`%i\` | 分 | 30 |
| \`%s\` | 秒 | 00 |
| \`%W\` | 周名 | Monday |
| \`%M\` | 月名 | January |

### 字符串转日期

\`\`\`sql
SELECT STR_TO_DATE('2024-01-15', '%Y-%m-%d');
SELECT STR_TO_DATE('15/01/2024', '%d/%m/%Y');
\`\`\`

### 日期运算

\`\`\`sql
SELECT DATE_ADD(NOW(), INTERVAL 1 DAY);          -- 加 1 天
SELECT DATE_SUB(NOW(), INTERVAL 1 MONTH);        -- 减 1 月
SELECT NOW() + INTERVAL 1 HOUR;                   -- 加 1 小时（简写）
SELECT NOW() - INTERVAL 7 DAY;                    -- 减 7 天

SELECT DATEDIFF('2024-01-15', '2024-01-01');     -- 14（相差天数）
SELECT TIMEDIFF('14:30:00', '12:00:00');          -- '02:30:00'
SELECT TIMESTAMPDIFF(DAY, '2024-01-01', NOW());  -- 相差天数
SELECT TIMESTAMPDIFF(HOUR, '2024-01-01', NOW()); -- 相差小时
\`\`\`

### 日期截断

\`\`\`sql
SELECT DATE(NOW());                    -- 2024-01-15（只留日期）
SELECT LAST_DAY(NOW());                -- 2024-01-31（当月最后一天）
SELECT MAKEDATE(2024, 100);            -- 2024-04-09（年内第 100 天）
\`\`\`

## 12.4 流程控制函数（IF/CASE）

### IF 函数

\`\`\`sql
-- IF(条件, 真值, 假值)
SELECT id, IF(age >= 18, '成年', '未成年') AS age_group FROM users;
SELECT IFNULL(phone, '未填') FROM users;       -- NULL 替换
SELECT NULLIF(1, 1);                            -- NULL（两值相等返回 NULL）
\`\`\`

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

### CASE 在聚合中的应用

\`\`\`sql
-- 行转列：每个用户每种状态的订单数
SELECT
  user_id,
  SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) AS pending,
  SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS paid,
  SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) AS done
FROM orders
GROUP BY user_id;
\`\`\`

## 12.5 JSON 函数

### 提取

\`\`\`sql
SET @j = '{"name":"alice","age":28,"tags":["a","b"],"addr":{"city":"北京"}}';

SELECT JSON_EXTRACT(@j, '$.name');        -- "alice"
SELECT @j->'$.name';                       -- 简写
SELECT @j->>'$.name';                      -- 'alice'（去引号）
SELECT JSON_UNQUOTE(JSON_EXTRACT(@j, '$.name'));  -- 'alice'

-- 嵌套
SELECT @j->'$.addr.city';                  -- "北京"
SELECT @j->'$.tags[0]';                    -- "a"
\`\`\`

### 修改

\`\`\`sql
SELECT JSON_SET(@j, '$.age', 29, '$.email', 'a@b.com');  -- 设/改
SELECT JSON_INSERT(@j, '$.email', 'a@b.com');             -- 仅插入（存在不改）
SELECT JSON_REPLACE(@j, '$.age', 29);                     -- 仅替换（不存在不插）
SELECT JSON_REMOVE(@j, '$.age');                          -- 删除
\`\`\`

### 查询

\`\`\`sql
SELECT JSON_CONTAINS(@j, '"alice"', '$.name');   -- 1（包含）
SELECT JSON_CONTAINS_PATH(@j, 'one', '$.name');  -- 1（路径存在）
SELECT JSON_KEYS(@j);                             -- ["name","age","tags","addr"]
SELECT JSON_LENGTH(@j);                           -- 4（顶层元素数）
SELECT JSON_TYPE(@j->'$.age');                    -- "INTEGER"
\`\`\`

### 构建

\`\`\`sql
SELECT JSON_ARRAY(1, 2, 'a');                    -- [1,2,"a"]
SELECT JSON_OBJECT('name','alice','age',28);     -- {"name":"alice","age":28}
SELECT JSON_MERGE_PRESERVE('{"a":1}', '{"b":2}'); -- {"a":1,"b":2}
\`\`\`

### 实战：JSON 字段查询

\`\`\`sql
-- 表中 JSON 字段查询
CREATE TABLE events (id INT, data JSON);
INSERT INTO events VALUES (1, '{"user_id":1,"ip":"1.2.3.4"}');

-- 按字段过滤（加虚拟列 + 索引提升性能）
SELECT * FROM events WHERE data->'$.user_id' = 1;
SELECT * FROM events WHERE data->>'$.ip' = '1.2.3.4';

-- 创建函数索引
ALTER TABLE events
  ADD COLUMN user_id INT AS (data->'$.user_id') STORED,
  ADD INDEX idx_user_id (user_id);
\`\`\`

## 12.6 窗口函数回顾

详见第 10 章，这里汇总：

| 函数 | 作用 |
| --- | --- |
| \`ROW_NUMBER()\` | 行号 |
| \`RANK()\` | 排名（跳号） |
| \`DENSE_RANK()\` | 排名（不跳号） |
| \`LAG(col, n)\` | 前 n 行 |
| \`LEAD(col, n)\` | 后 n 行 |
| \`FIRST_VALUE(col)\` | 窗口首值 |
| \`LAST_VALUE(col)\` | 窗口末值 |
| \`NTH_VALUE(col, n)\` | 第 n 个值 |
| \`NTILE(n)\` | 分桶 |
| \`CUME_DIST()\` | 累积分布 |
| \`PERCENT_RANK()\` | 百分位排名 |

## 12.7 其他常用函数

### 类型转换

\`\`\`sql
SELECT CAST('123' AS SIGNED);              -- 123
SELECT CAST('2024-01-15' AS DATE);         -- 2024-01-15
SELECT CONVERT('123', SIGNED);             -- 同 CAST
SELECT CAST(3.14 AS DECIMAL(10,1));        -- 3.1
\`\`\`

### 加密

\`\`\`sql
SELECT MD5('hello');                       -- 5d41402abc4b2a76b9719d911017c592
SELECT SHA1('hello');                      -- 40 位
SELECT SHA2('hello', 256);                 -- 64 位（推荐）
SELECT PASSWORD('hello');                  -- 8.0 移除，用 SHA2
\`\`\`

> 密码存储不要用 MD5/SHA1（已被攻破），用 bcrypt/argon2（应用层）。

### IP 地址

\`\`\`sql
SELECT INET_ATON('1.2.3.4');               -- 16909060（转数字）
SELECT INET_NTOA(16909060);                -- '1.2.3.4'
SELECT INET6_ATON('::1');                  -- 二进制
\`\`\`

存 IP 用 INT UNSIGNED 比 VARCHAR(15) 省空间、查询快。

### 信息函数

\`\`\`sql
SELECT VERSION();
SELECT DATABASE();
SELECT USER();
SELECT CURRENT_USER();
SELECT CONNECTION_ID();
SELECT LAST_INSERT_ID();                  -- 最近自增 ID
\`\`\`

## 12.8 踩坑提示

**坑 1：LENGTH vs CHAR_LENGTH**
中文场景一定要用 \`CHAR_LENGTH\`，\`LENGTH\` 是字节数。

**坑 2：GROUP_CONCAT 截断**
默认 1024 字节，调大 \`group_concat_max_len\`。

**坑 3：DATE_FORMAT 性能**
\`DATE_FORMAT(col, '%Y-%m')\` 在 WHERE 中会让索引失效。用范围查询替代：
\`\`\`sql
-- 错（索引失效）
WHERE DATE_FORMAT(created_at, '%Y-%m') = '2024-01'
-- 对（走索引）
WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01'
\`\`\`

**坑 4：NOW() vs SYSDATE()**
\`NOW()\` 在事务内固定，\`SYSDATE()\` 实时。主从复制用 \`NOW()\` 才安全。

**坑 5：函数包裹列导致索引失效**
\`\`\`sql
WHERE YEAR(created_at) = 2024    -- 索引失效
WHERE LEFT(name, 3) = 'abc'     -- 索引失效
WHERE name LIKE 'abc%'          -- 走索引
\`\`\`
MySQL 8.0 可用**函数索引**解决部分问题。

## 12.9 本章小结

- 字符串：\`CONCAT\`、\`SUBSTRING\`、\`REPLACE\`、\`TRIM\`、\`LPAD\`、\`SUBSTRING_INDEX\`
- 数值：\`ROUND\`、\`CEIL\`、\`FLOOR\`、\`MOD\`、\`RAND\`
- 日期：\`NOW\`、\`DATE_FORMAT\`、\`DATE_ADD\`、\`DATEDIFF\`、\`TIMESTAMPDIFF\`
- 流程控制：\`IF\`、\`IFNULL\`、\`CASE WHEN\`
- JSON：\`->\`、\`->>\`、\`JSON_SET\`、\`JSON_CONTAINS\`
- 函数包裹列会索引失效，用范围查询或函数索引
- IP 转 INT、密码用 SHA2

至此第二部分查询进阶结束。下一部分讲高级查询与执行计划。`
  }
];

export { chapters };
