// =============================================================
// Python后端面试指南 - 第7批章节（SQL高级查询与优化）
// =============================================================

export const chapters = [
  {
    id: "pyb-7-1",
    group: "SQL高级查询与优化",
    icon: "📊",
    title: "SQL高级查询 - JOIN(内/左/右/全/交叉/自连接)、子查询、EXISTS/IN、UNION/UNION ALL、CASE WHEN",
    content: `

# SQL高级查询 - JOIN、子查询、EXISTS/IN、UNION、CASE WHEN

## 一、JOIN连接查询详解

JOIN是SQL中最核心的操作之一，用于根据表之间的关联条件查询数据。

| 连接类型 | 关键字 | 描述 |
|---------|-------|------|
| 内连接 | INNER JOIN | 只返回两表匹配的行（交集） |
| 左连接 | LEFT JOIN | 返回左表所有行，右表不匹配时为NULL |
| 右连接 | RIGHT JOIN | 返回右表所有行，左表不匹配时为NULL |
| 全连接 | FULL JOIN | 返回两表所有行（并集） |
| 交叉连接 | CROSS JOIN | 笛卡尔积，所有可能组合 |
| 自连接 | SELF JOIN | 表与自身连接 |

\`\`\`python
import sqlite3

conn = sqlite3.connect('shop.db')
cursor = conn.cursor()

cursor.execute('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)')
cursor.execute('CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, user_id INTEGER, amount REAL, order_date TEXT)')
cursor.executemany('INSERT OR IGNORE INTO users VALUES (?,?,?)',
    [(1,'张三','z@e.com'),(2,'李四','l@e.com'),(3,'王五','w@e.com'),(4,'赵六','zl@e.com')])
cursor.executemany('INSERT OR IGNORE INTO orders VALUES (?,?,?,?)',
    [(1,1,100.0,'2024-01-15'),(2,1,200.0,'2024-02-20'),(3,2,150.0,'2024-01-25'),(4,3,300.0,'2024-03-10')])
conn.commit()

# INNER JOIN：有订单的用户
cursor.execute('''SELECT u.name, o.amount, o.order_date
    FROM users u INNER JOIN orders o ON u.id = o.user_id''')
print("INNER JOIN:", cursor.fetchall())

# LEFT JOIN：所有用户（包括无订单）
cursor.execute('''SELECT u.name, o.amount
    FROM users u LEFT JOIN orders o ON u.id = o.user_id''')
print("LEFT JOIN:", cursor.fetchall())

# SELF JOIN：员工和上级
cursor.execute('CREATE TABLE IF NOT EXISTS emp (id INTEGER PRIMARY KEY, name TEXT, mgr_id INTEGER)')
cursor.executemany('INSERT OR IGNORE INTO emp VALUES (?,?,?)',
    [(1,'CEO',None),(2,'技术经理',1),(3,'开发',2),(4,'测试',2)])
conn.commit()
cursor.execute('''SELECT e1.name as emp, e2.name as mgr
    FROM emp e1 LEFT JOIN emp e2 ON e1.mgr_id = e2.id''')
print("SELF JOIN:", cursor.fetchall())
\`\`\`

### JOIN最佳实践
1. **明确写连接类型**：用INNER/LEFT JOIN而非隐式连接（逗号分隔）
2. **ON vs WHERE**：LEFT JOIN的过滤条件写在ON中，写在WHERE会变成INNER JOIN
3. **小表驱动大表**：连接时小表在前可以提升性能
4. **避免CROSS JOIN**：忘写连接条件会产生笛卡尔积导致数据膨胀

\`\`\`python
# 错误：LEFT JOIN后WHERE过滤右表导致无订单用户被排除
# SELECT u.name, o.amount FROM users u LEFT JOIN orders o ON u.id=o.user_id WHERE o.amount>100

# 正确：条件写在ON中
cursor.execute('''SELECT u.name, o.amount FROM users u
    LEFT JOIN orders o ON u.id=o.user_id AND o.amount>100''')
\`\`\`

## 二、子查询

子查询是嵌套在另一个查询中的查询，可出现在SELECT/FROM/WHERE/HAVING子句中。

| 类型 | 说明 | 执行次数 |
|-----|------|---------|
| 非相关子查询 | 独立于外部查询 | 1次 |
| 相关子查询 | 引用外部查询列 | 外部每行执行1次 |

\`\`\`python
# WHERE子查询：金额大于平均值的订单
cursor.execute('SELECT * FROM orders WHERE amount > (SELECT AVG(amount) FROM orders)')

# FROM子查询（派生表）：每个用户订单统计
cursor.execute('''SELECT u.name, s.total, s.cnt
    FROM users u INNER JOIN (
        SELECT user_id, SUM(amount) total, COUNT(*) cnt FROM orders GROUP BY user_id
    ) s ON u.id = s.user_id''')

# 相关子查询：每个用户最高金额订单
cursor.execute('''SELECT * FROM orders o1 WHERE amount =
    (SELECT MAX(amount) FROM orders o2 WHERE o2.user_id = o1.user_id)''')

# CTE提高可读性
cursor.execute('''WITH user_stats AS (
    SELECT user_id, SUM(amount) total FROM orders GROUP BY user_id
) SELECT u.name, s.total FROM users u JOIN user_stats s ON u.id=s.user_id WHERE s.total>200''')
\`\`\`

## 三、EXISTS与IN

| 对比项 | EXISTS | IN | JOIN |
|-------|--------|----|------|
| 语义 | 存在性检查 | 集合包含 | 表连接 |
| NULL处理 | 不受NULL影响 | 子查询含NULL结果为空 | 不受影响 |
| 性能（大表） | 通常更好 | 子查询大时较慢 | 稳定 |

\`\`\`python
# EXISTS：有订单的用户
cursor.execute('SELECT * FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id=u.id)')

# IN：同样功能
cursor.execute('SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)')

# NOT IN陷阱：子查询有NULL时返回空！
# 安全：用NOT EXISTS
cursor.execute('SELECT * FROM users u WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id=u.id)')
\`\`\`

## 四、UNION与UNION ALL

| 操作符 | 去重 | 性能 |
|-------|------|------|
| UNION | 是 | 慢（排序去重） |
| UNION ALL | 否 | 快 |

使用规则：列数相同、类型兼容、列名由第一个SELECT决定。

\`\`\`python
cursor.execute('CREATE TABLE IF NOT EXISTS vip (name TEXT, phone TEXT)')
cursor.execute('CREATE TABLE IF NOT EXISTS normal (name TEXT, phone TEXT)')
cursor.executemany('INSERT OR IGNORE INTO vip VALUES (?,?)', [('张三','13800138001'),('李四','13800138002')])
cursor.executemany('INSERT OR IGNORE INTO normal VALUES (?,?)', [('王五','13800138003'),('张三','13800138001')])
conn.commit()

# UNION ALL：保留重复
cursor.execute('SELECT name,phone FROM vip UNION ALL SELECT name,phone FROM normal')
print("UNION ALL:", len(cursor.fetchall()), "条")

# UNION：去重
cursor.execute('SELECT name,phone FROM vip UNION SELECT name,phone FROM normal')
print("UNION:", len(cursor.fetchall()), "条")
\`\`\`

## 五、CASE WHEN条件表达式

CASE WHEN类似if-else，可用于行转列、条件聚合、自定义排序。

\`\`\`python
# 金额分级
cursor.execute('''SELECT id, amount,
    CASE WHEN amount<100 THEN '小额' WHEN amount<=200 THEN '中额' ELSE '大额' END level
    FROM orders''')

# 行转列统计
cursor.execute('''SELECT user_id,
    SUM(CASE WHEN amount<150 THEN 1 ELSE 0 END) small_cnt,
    SUM(CASE WHEN amount>=150 THEN 1 ELSE 0 END) large_cnt
    FROM orders GROUP BY user_id''')
print("行转列:", cursor.fetchall())

# 自定义排序
cursor.execute('''SELECT * FROM orders ORDER BY
    CASE user_id WHEN 1 THEN 1 WHEN 2 THEN 2 ELSE 3 END, amount DESC''')
\`\`\`

## 常见坑点
1. **LEFT JOIN + WHERE右表条件**：左连接被转为内连接
2. **NOT IN + NULL**：查询结果为空
3. **滥用UNION**：确定无重复时用UNION ALL
4. **忘记ON条件**：产生笛卡尔积

conn.close()
`
  },
  {
    id: "pyb-7-2",
    group: "SQL高级查询与优化",
    icon: "📊",
    title: "聚合与分组 - GROUP BY/HAVING、聚合函数、窗口函数ROW_NUMBER/RANK/DENSE_RANK、PARTITION BY",
    content: `

# 聚合与分组 - GROUP BY/HAVING、窗口函数

## 一、聚合函数

| 函数 | 说明 |
|-----|------|
| COUNT(*) | 统计总行数（含NULL） |
| COUNT(列) | 统计列非NULL行数 |
| COUNT(DISTINCT 列) | 统计去重后非NULL值数量 |
| SUM/AVG/MAX/MIN | 求和/平均/最大/最小（忽略NULL） |

\`\`\`python
import sqlite3
conn = sqlite3.connect('sales.db')
c = conn.cursor()

c.execute('''CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY, product TEXT, region TEXT,
    amount REAL, qty INTEGER, date TEXT)''')
data = [
    ('iPhone','华东',6999,10,'2024-01-05'),('Mac','华东',14999,5,'2024-01-10'),
    ('iPhone','华北',6999,8,'2024-01-15'),('AirPods','华东',1999,20,'2024-01-20'),
    ('Mac','华南',14999,3,'2024-01-25'),('iPhone','华南',6999,12,'2024-02-01')]
c.executemany('INSERT OR IGNORE INTO sales(product,region,amount,qty,date) VALUES (?,?,?,?,?)', data)
conn.commit()

c.execute('''SELECT COUNT(*) total, COUNT(DISTINCT product) prods,
    SUM(amount*qty) total_sales, AVG(amount) avg_price FROM sales''')
print("基础聚合:", c.fetchone())
\`\`\`

## 二、GROUP BY与HAVING

| 子句 | 过滤时机 | 可用聚合函数 |
|-----|---------|------------|
| WHERE | 分组前（过滤行） | 否 |
| HAVING | 分组后（过滤分组） | 是 |

执行顺序：FROM → WHERE → GROUP BY → 聚合 → HAVING → ORDER BY → LIMIT

\`\`\`python
# 按品类分组
c.execute('''SELECT product, SUM(amount*qty) sales, SUM(qty) qty
    FROM sales GROUP BY product ORDER BY sales DESC''')
print("按产品分组:", c.fetchall())

# 多字段分组+HAVING
c.execute('''SELECT region, product, SUM(amount*qty) sales
    FROM sales WHERE amount > 1000
    GROUP BY region, product
    HAVING sales > 30000''')
print("多字段+HAVING:", c.fetchall())
\`\`\`

## 三、窗口函数

窗口函数不改变原行数，为每行追加计算结果，而GROUP BY压缩行数。

### 排名函数对比

| 函数 | 特点 | 示例序列 |
|-----|------|---------|
| ROW_NUMBER() | 连续序号，不重复 | 1,2,3,4 |
| RANK() | 并列跳号 | 1,2,2,4 |
| DENSE_RANK() | 并列不跳号 | 1,2,2,3 |

\`\`\`python
# 全局排名
c.execute('''SELECT product, region, amount*qty sale,
    ROW_NUMBER() OVER (ORDER BY amount*qty DESC) rn,
    RANK() OVER (ORDER BY amount*qty DESC) rk,
    DENSE_RANK() OVER (ORDER BY amount*qty DESC) dr
    FROM sales''')
print("排名函数对比:")
for row in c.fetchall():
    print(row)
\`\`\`

### PARTITION BY分区

按分区独立计算，类似GROUP BY但保留所有行。

\`\`\`python
# 每个区域内排名
c.execute('''SELECT *, ROW_NUMBER() OVER
    (PARTITION BY region ORDER BY amount*qty DESC) rank_in_region
    FROM sales''')
print("分区排名:")
for row in c.fetchall():
    print(row)
\`\`\`

### 聚合窗口函数

\`\`\`python
# 品类占比
c.execute('''SELECT product, region, amount*qty sale,
    SUM(amount*qty) OVER (PARTITION BY product) prod_total,
    ROUND(amount*qty * 100.0 / SUM(amount*qty) OVER (PARTITION BY product), 2) pct
    FROM sales ORDER BY product, sale DESC''')
print("品类占比:")
for row in c.fetchall():
    print(row)

# 累计销售额
c.execute('''SELECT date, amount*qty daily,
    SUM(amount*qty) OVER (ORDER BY date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) running
    FROM sales''')
print("累计销售:", c.fetchall())
\`\`\`

### Top N问题经典解法

\`\`\`python
# 每个区域销售额Top2
c.execute('''WITH ranked AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY region ORDER BY amount*qty DESC) rn
    FROM sales)
SELECT * FROM ranked WHERE rn <= 2''')
print("区域Top2:", c.fetchall())
\`\`\`

### LAG/LEAD环比计算

\`\`\`python
c.execute('''WITH monthly AS (
    SELECT strftime('%Y-%m',date) m, SUM(amount*qty) s FROM sales GROUP BY m)
SELECT m, s, LAG(s,1) OVER (ORDER BY m) prev,
    ROUND((s - LAG(s,1) OVER (ORDER BY m))*100.0 / LAG(s,1) OVER (ORDER BY m),2) mom
FROM monthly''')
print("环比:", c.fetchall())
\`\`\`

## 最佳实践与坑点
1. **COUNT(*)性能最好**：统计行数用COUNT(*)而非COUNT(列)
2. **WHERE先过滤**：减少分组数据量，HAVING只过滤聚合结果
3. **ONLY_FULL_GROUP_BY**：SELECT列必须在GROUP BY或聚合函数中
4. **窗口函数必须有ORDER BY**：排名类函数没有ORDER BY结果无意义
5. **NULL处理**：聚合函数忽略NULL，AVG计算时分母不含NULL行

conn.close()
`
  },
  {
    id: "pyb-7-3",
    group: "SQL高级查询与优化",
    icon: "📊",
    title: "SQL性能优化 - EXPLAIN执行计划、type列详解、Extra列、慢查询日志",
    content: `

# SQL性能优化 - EXPLAIN执行计划分析

## 一、EXPLAIN执行计划基础

EXPLAIN是SQL优化的利器，可以查看MySQL如何执行查询，帮助发现性能瓶颈。

\`\`\`python
# 在MySQL中使用EXPLAIN
import pymysql

conn = pymysql.connect(host='localhost', user='root', password='', database='test')
cursor = conn.cursor()

# 创建测试表
cursor.execute('''CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50), email VARCHAR(100),
    age INT, INDEX idx_name(name), INDEX idx_age(age))''')
cursor.execute('''CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT, amount DECIMAL(10,2),
    order_date DATETIME, INDEX idx_user(user_id))''')

# EXPLAIN分析查询
cursor.execute('EXPLAIN SELECT u.name, o.amount FROM users u JOIN orders o ON u.id=o.user_id WHERE u.age>20')
for row in cursor.fetchall():
    print(row)
\`\`\`

### EXPLAIN输出列说明

| 列名 | 含义 |
|-----|------|
| id | 查询标识符，子查询序号 |
| select_type | 查询类型（SIMPLE/PRIMARY/SUBQUERY/DERIVED等） |
| table | 访问的表 |
| partitions | 匹配的分区 |
| **type** | **访问类型（最重要列）** |
| possible_keys | 可能使用的索引 |
| **key** | **实际使用的索引** |
| key_len | 使用的索引长度 |
| ref | 索引比较的列/常量 |
| **rows** | **预估扫描行数** |
| filtered | 按条件过滤的行百分比 |
| **Extra** | **额外信息（重要）** |

## 二、type列详解（性能从好到差）

| type类型 | 说明 | 性能 |
|---------|------|------|
| system | 表只有一行（系统表） | 最好 |
| const | 通过主键/唯一索引一次匹配 | 极好 |
| eq_ref | 关联时通过主键/唯一索引匹配 | 极好 |
| ref | 使用非唯一索引等值匹配 | 好 |
| range | 索引范围扫描（BETWEEN/IN/>/<） | 一般 |
| index | 全索引扫描 | 较差 |
| ALL | 全表扫描 | 最差！ |

\`\`\`python
# const：主键等值查询
cursor.execute('EXPLAIN SELECT * FROM users WHERE id=1')  # type=const

# eq_ref：关联时用主键
cursor.execute('EXPLAIN SELECT * FROM users u JOIN orders o ON u.id=o.user_id')  # u:ALL, o:eq_ref

# ref：非唯一索引等值
cursor.execute('EXPLAIN SELECT * FROM users WHERE name="张三"')  # type=ref

# range：范围查询
cursor.execute('EXPLAIN SELECT * FROM users WHERE age BETWEEN 20 AND 30')  # type=range

# index：全索引扫描
cursor.execute('EXPLAIN SELECT name FROM users')  # type=index（覆盖索引）

# ALL：全表扫描（需要优化！）
cursor.execute('EXPLAIN SELECT * FROM users WHERE email LIKE "%@gmail.com"')  # type=ALL
\`\`\`

**优化目标**：保证查询至少达到range级别，最好达到ref。避免ALL类型。

## 三、Extra列重要信息

| Extra值 | 含义 | 优化建议 |
|---------|------|---------|
| Using index | 覆盖索引，直接从索引取数据 | 好，无需优化 |
| Using where | 服务器层过滤行 | 检查索引是否可用 |
| Using index condition | 索引下推（ICP） | 好 |
| **Using filesort** | 额外排序（不能用索引顺序） | 需优化，考虑加索引 |
| **Using temporary** | 使用临时表保存中间结果 | 需优化，常见于GROUP BY/ORDER BY不同列 |
| Using join buffer | 连接缓存（无索引关联） | 给关联字段加索引 |
| Impossible WHERE | WHERE条件始终为false | 检查逻辑 |

\`\`\`python
# Using filesort示例：ORDER BY字段无索引
cursor.execute('EXPLAIN SELECT * FROM users ORDER BY email')  # Extra: Using filesort

# 优化方案：给email加索引
cursor.execute('ALTER TABLE users ADD INDEX idx_email(email)')
cursor.execute('EXPLAIN SELECT * FROM users ORDER BY email')  # 可能type=index

# Using temporary示例：GROUP BY和ORDER BY不同列
cursor.execute('EXPLAIN SELECT name, COUNT(*) FROM users GROUP BY age ORDER BY name')
# Extra: Using temporary; Using filesort
\`\`\`

## 四、慢查询日志

慢查询日志记录超过指定时间的SQL，是优化的重要依据。

\`\`\`python
# MySQL配置慢查询日志（my.cnf）
slow_query_log = ON
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2  # 超过2秒记录
log_queries_not_using_indexes = ON  # 记录未用索引的查询

# 也可以动态开启
cursor.execute('SET GLOBAL slow_query_log = ON')
cursor.execute('SET GLOBAL long_query_time = 1')

# 查看慢查询配置
cursor.execute('SHOW VARIABLES LIKE "%slow%"')
\`\`\`

### 慢查询分析工具

1. **mysqldumpslow**：官方自带工具
\`\`\`bash
# 分析慢查询日志，Top10耗时最长
mysqldumpslow -s t -t 10 /var/log/mysql/slow.log

# 统计次数最多的查询
mysqldumpslow -s c -t 10 /var/log/mysql/slow.log
\`\`\`

2. **pt-query-digest**：Percona Toolkit工具，分析更详细
\`\`\`bash
pt-query-digest /var/log/mysql/slow.log > slow_report.txt
\`\`\`

## 五、SQL优化实战

### 优化步骤
1. 开启慢查询日志，捕获慢SQL
2. EXPLAIN分析执行计划
3. 针对type=ALL/Using filesort/Using temporary优化
4. 加合适的索引
5. 优化SQL写法
6. 验证优化效果

\`\`\`python
# 反例：全表扫描
bad_sql = "SELECT * FROM orders WHERE DATE(order_date) = '2024-01-15'"
# 问题：函数作用于索引列导致索引失效
# type=ALL

# 优化：改为范围查询
good_sql = """SELECT * FROM orders 
    WHERE order_date >= '2024-01-15' AND order_date < '2024-01-16'"""
# type=range（使用order_date索引）

# 反例：前置模糊查询
bad_sql2 = "SELECT * FROM users WHERE name LIKE '%张%'"
# 无法使用索引，type=ALL

# 优化方案：
# 1. 后置模糊（可使用索引）
good_sql2 = "SELECT * FROM users WHERE name LIKE '张%'"  # type=range
# 2. 全文索引（InnoDB FULLTEXT）
# 3. 搜索引擎（Elasticsearch）
\`\`\`

### 其他优化技巧

\`\`\`python
# 1. 只查需要的列，避免SELECT *
# 不好：SELECT * FROM users
# 好：SELECT id, name FROM users

# 2. 用EXISTS代替IN（大表）
# 不好：SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)
# 好：SELECT * FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id=u.id)

# 3. 大表LIMIT分页优化
# 不好（深分页性能差）：SELECT * FROM orders LIMIT 100000, 10
# 优化1：子查询
opt1 = """SELECT * FROM orders WHERE id >= 
    (SELECT id FROM orders LIMIT 100000, 1) LIMIT 10"""
# 优化2：记录上一页最大ID
opt2 = "SELECT * FROM orders WHERE id > 100000 LIMIT 10"

# 4. 批量操作代替循环单条
# 不好：循环INSERT每次一条
# 好：INSERT INTO table VALUES (...),(...),(...)
\`\`\`

## 常见坑点
1. **索引列上用函数/计算**：导致索引失效（如DATE(create_time)）
2. **隐式类型转换**：字符串列用数字查询导致索引失效
3. **前置%模糊查询**：LIKE '%xxx'无法用B+树索引
4. **OR条件部分无索引**：可能导致全表扫描
5. **!=或<>操作符**：可能放弃索引走全表扫描

conn.close()
`
  },
  {
    id: "pyb-7-4",
    group: "SQL高级查询与优化",
    icon: "📊",
    title: "索引优化实战 - 联合索引最左前缀原则、覆盖索引、索引下推ICP、避免索引失效",
    content: `

# 索引优化实战 - 索引原理与优化

## 一、索引基础

索引是帮助MySQL高效获取数据的数据结构（B+树），类似书的目录。

| 索引类型 | 说明 |
|---------|------|
| PRIMARY KEY | 主键索引，唯一且非NULL |
| UNIQUE | 唯一索引，允许NULL |
| INDEX/KEY | 普通索引 |
| FULLTEXT | 全文索引 |
| 联合索引 | 多列组合索引 |

### B+树结构特点
- 非叶子节点只存key，不存数据（一个页能存更多key）
- 叶子节点存储完整数据（主键索引）或主键值（二级索引）
- 叶子节点通过双向链表连接，范围查询效率高
- 树高度通常为3-4层，查询极快

## 二、联合索引最左前缀原则

联合索引(a,b,c)会先按a排序，a相同按b，b相同按c。查询时从索引最左列开始匹配，遇到范围查询(>、<、between、like)停止匹配。

\`\`\`python
import pymysql
conn = pymysql.connect(host='localhost', user='root', password='', database='test')
c = conn.cursor()

c.execute('''CREATE TABLE IF NOT EXISTS user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50), age INT, city VARCHAR(50),
    INDEX idx_name_age_city(name, age, city))''')

# ✅ 能用到索引（从最左列开始）
c.execute('EXPLAIN SELECT * FROM user WHERE name="张三"')  # 用name
c.execute('EXPLAIN SELECT * FROM user WHERE name="张三" AND age=20')  # 用name,age
c.execute('EXPLAIN SELECT * FROM user WHERE name="张三" AND age=20 AND city="北京"')  # 用全部

# ✅ 优化器会调整顺序，也能用到索引
c.execute('EXPLAIN SELECT * FROM user WHERE age=20 AND name="张三"')

# ❌ 不能用到索引（不包含最左列name）
c.execute('EXPLAIN SELECT * FROM user WHERE age=20')
c.execute('EXPLAIN SELECT * FROM user WHERE city="北京"')
c.execute('EXPLAIN SELECT * FROM user WHERE age=20 AND city="北京"')

# ⚠️ 遇到范围查询后停止匹配
c.execute('EXPLAIN SELECT * FROM user WHERE name="张三" AND age>20 AND city="北京"')
# 只用name,age；city列无法利用索引
\`\`\`

### 索引列顺序设计原则
1. **等值查询列放前面**，范围查询列放后面
2. **区分度高的列放前面**：区分度=count(distinct col)/count(*)
3. **使用频率高的列放前面**

\`\`\`python
# 计算列区分度
c.execute('SELECT COUNT(DISTINCT name)/COUNT(*), COUNT(DISTINCT age)/COUNT(*) FROM user')
# 区分度高的列适合放联合索引前面
\`\`\`

## 三、覆盖索引

覆盖索引：查询的列都包含在索引中，不需要回表查询主键索引，性能极高（Extra显示Using index）。

\`\`\`python
# 假设idx_name_age_city(name,age,city)

# 覆盖索引：查询列都在索引中
c.execute('EXPLAIN SELECT name, age FROM user WHERE name="张三"')  # Using index
c.execute('EXPLAIN SELECT name, age, city FROM user WHERE name="张三" AND age=20')  # Using index

# 非覆盖索引：需要回表查询其他列
c.execute('EXPLAIN SELECT * FROM user WHERE name="张三"')  # 无Using index（需要取email等字段）
c.execute('EXPLAIN SELECT name, age, email FROM user WHERE name="张三"')  # email不在索引中，需回表
\`\`\`

**回表过程**：二级索引找到主键值 → 到主键索引B+树查找完整行 → 随机IO，性能较差

### 覆盖索引优化案例

\`\`\`python
# 场景：根据name查询email，频繁调用
# 普通索引(name)：需要回表取email
# 优化：建立联合索引(name, email)，查询时直接覆盖索引返回
c.execute('ALTER TABLE user ADD INDEX idx_name_email(name, email)')
c.execute('EXPLAIN SELECT name, email FROM user WHERE name="张三"')  # Using index！
\`\`\`

## 四、索引下推（ICP - Index Condition Pushdown）

MySQL 5.6+特性，在存储引擎层直接过滤索引中包含的条件，减少回表次数。

\`\`\`python
# 联合索引(name, age, city)
# 查询：WHERE name LIKE '张%' AND age=20

# 无ICP：
# 1. 索引匹配name LIKE '张%'，找到所有姓张的记录主键
# 2. 回表查询完整行
# 3. Server层过滤age=20

# 有ICP（Using index condition）：
# 1. 索引匹配name LIKE '张%'
# 2. 直接在索引中判断age=20（age在索引中）
# 3. 只对符合条件的记录回表
# 大幅减少回表次数！

c.execute('EXPLAIN SELECT * FROM user WHERE name LIKE "张%" AND age=20')
# Extra: Using index condition
\`\`\`

**ICP开启/关闭**：
\`\`\`python
c.execute('SET optimizer_switch = "index_condition_pushdown=on"')  # 默认开启
c.execute('SET optimizer_switch = "index_condition_pushdown=off"')
\`\`\`

## 五、避免索引失效的写法

| 索引失效场景 | 错误示例 | 优化方案 |
|------------|---------|---------|
| 索引列用函数 | WHERE DATE(create_time)='2024-01-01' | WHERE create_time>='2024-01-01' AND create_time<'2024-01-02' |
| 索引列运算 | WHERE age+1=21 | WHERE age=20 |
| 隐式类型转换 | WHERE varchar_col=123（字符串列传数字） | WHERE varchar_col='123' |
| 前置模糊查询 | WHERE name LIKE '%张' | 用后置模糊'张%'或全文索引 |
| NOT/!=/<> | WHERE status!=1 | 可考虑用IN()枚举或其他方式 |
| OR连接无索引列 | WHERE a=1 OR b=2（b无索引） | 给b加索引或用UNION ALL |
| IS NOT NULL | WHERE deleted_at IS NOT NULL | 视数据分布而定 |

\`\`\`python
# 索引失效示例
c.execute("EXPLAIN SELECT * FROM user WHERE LEFT(name,1)='张'")  # 函数导致失效
c.execute('EXPLAIN SELECT * FROM user WHERE name LIKE "%张"')  # 前置%失效
c.execute('EXPLAIN SELECT * FROM user WHERE age+0=20')  # 运算导致失效

# 正确写法
c.execute('EXPLAIN SELECT * FROM user WHERE name LIKE "张%"')  # 可使用索引
c.execute('EXPLAIN SELECT * FROM user WHERE age=20')
\`\`\`

## 六、索引设计原则

### 适合建索引的情况
1. **WHERE条件列**：频繁作为查询条件的字段
2. **JOIN关联列**：关联字段建索引避免Using join buffer
3. **ORDER BY/GROUP BY列**：避免Using filesort和Using temporary
4. **区分度高的列**：性别区分度低（只有男女）不适合单独建索引
5. **小表可不建索引**：全表扫描可能比索引更快

### 不适合建索引的情况
1. **表数据量小**（几千行以下）：索引维护成本高于收益
2. **频繁更新的列**：更新数据同时要维护索引，降低写性能
3. **区分度低的列**：如status只有0/1两个值
4. **不经常查询的列**：索引占用存储空间

\`\`\`python
# 查看索引使用情况（sys库）
# SELECT * FROM sys.schema_unused_indexes WHERE object_schema='test';

# 查看索引基数（区分度）
c.execute('SHOW INDEX FROM user')
for row in c.fetchall():
    print(f"列: {row[4]}, 基数: {row[6]}")
\`\`\`

### 索引数量控制
- 单表索引建议不超过5个
- 联合索引尽量覆盖多个查询场景
- 避免冗余索引：有idx(a,b)就不需要idx(a)

\`\`\`python
# 删除冗余索引
# ALTER TABLE user DROP INDEX idx_name;  # 如果有idx_name_age，idx_name冗余

# 查看冗余索引（Percona工具）
# pt-duplicate-key-checker -u root -p testdb
\`\`\`

## 七、索引优化案例

\`\`\`python
# 案例：订单表查询优化
c.execute('''CREATE TABLE IF NOT EXISTS orders_opt (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT, status TINYINT, amount DECIMAL(10,2),
    create_time DATETIME, INDEX idx_user(user_id))''')

# 慢SQL：SELECT * FROM orders_opt WHERE user_id=100 AND status=1 ORDER BY create_time DESC
c.execute('EXPLAIN SELECT * FROM orders_opt WHERE user_id=100 AND status=1 ORDER BY create_time DESC')
# 可能出现：type=ref但Using filesort

# 优化：建立联合索引，等值列在前，排序列在后
c.execute('ALTER TABLE orders_opt ADD INDEX idx_user_status_ctime(user_id, status, create_time)')
c.execute('EXPLAIN SELECT * FROM orders_opt WHERE user_id=100 AND status=1 ORDER BY create_time DESC')
# type=ref，无Using filesort！索引直接有序
\`\`\`

## 常见坑点
1. **联合索引顺序错误**：范围列放在等值列前面导致后续列无法用索引
2. **过度索引**：索引太多影响INSERT/UPDATE/DELETE性能
3. **在索引列上做操作**：函数、运算、类型转换导致索引失效
4. **认为建了索引就一定会用**：优化器可能选择全表扫描（当查询大部分行时）
5. **冗余索引**：idx(a,b)和idx(a)重复，增加维护成本

conn.close()
`
  },
  {
    id: "pyb-7-5",
    group: "SQL高级查询与优化",
    icon: "📊",
    title: "数据库设计范式 - 第一/二/三/BC范式、反范式设计、表关系、ER图设计",
    content: `

# 数据库设计范式

## 一、数据库设计基础

良好的数据库设计是高性能、可扩展系统的基石。范式是设计关系型数据库的规范，用于减少数据冗余和避免数据异常。

### 设计目标
1. **减少冗余**：避免重复存储相同数据
2. **避免异常**：插入、更新、删除异常
3. **提高一致性**：数据更新时只需修改一处
4. **便于扩展**：结构清晰，易于维护

## 二、三大范式详解

### 第一范式（1NF）：字段原子性

**要求**：每一列都是不可分割的原子数据项，不能是集合、数组等。

\`\`\`python
# ❌ 不符合1NF：address包含多个信息
bad_table = """
CREATE TABLE bad_user (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    address VARCHAR(200)  -- '北京市朝阳区xxx街道'，包含省市区街道
)"""

# ✅ 符合1NF：地址拆分为独立字段
good_table = """
CREATE TABLE good_user (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    province VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    street VARCHAR(100)
)"""

# ❌ 反例：使用逗号分隔的多值
bad_tags = """
CREATE TABLE article (
    id INT PRIMARY KEY,
    title VARCHAR(100),
    tags VARCHAR(200)  -- 'Python,MySQL,ORM'，多值不符合1NF
)"""

# ✅ 正确：建立关联表
good_tags = """
CREATE TABLE article (id INT PRIMARY KEY, title VARCHAR(100))
CREATE TABLE tag (id INT PRIMARY KEY, name VARCHAR(50))
CREATE TABLE article_tag (
    article_id INT, tag_id INT,
    PRIMARY KEY(article_id, tag_id)
)"""
\`\`\`

### 第二范式（2NF）：消除部分依赖

**要求**：在1NF基础上，非主键列必须完全依赖于主键，而不能只依赖主键的一部分（针对联合主键）。

\`\`\`python
# ❌ 不符合2NF：学生选课表
bad_sc = """
CREATE TABLE bad_score (
    stu_id INT,
    course_id INT,
    stu_name VARCHAR(50),   -- 只依赖stu_id，部分依赖主键
    course_name VARCHAR(50), -- 只依赖course_id，部分依赖主键
    score INT,
    PRIMARY KEY(stu_id, course_id)
)"""
# 问题：
# 1. 数据冗余：学生姓名重复存储（选几门课存几次）
# 2. 更新异常：学生改名需要修改所有选课记录
# 3. 插入异常：新学生没选课无法插入
# 4. 删除异常：删除选课记录可能丢失学生信息

# ✅ 符合2NF：拆分为三张表
good_sc = """
CREATE TABLE student (
    stu_id INT PRIMARY KEY,
    stu_name VARCHAR(50)
)
CREATE TABLE course (
    course_id INT PRIMARY KEY,
    course_name VARCHAR(50)
)
CREATE TABLE score (
    stu_id INT, course_id INT, score INT,
    PRIMARY KEY(stu_id, course_id)
)"""
\`\`\`

### 第三范式（3NF）：消除传递依赖

**要求**：在2NF基础上，非主键列必须直接依赖于主键，不能存在传递依赖（非主键A依赖非主键B，B依赖主键）。

\`\`\`python
# ❌ 不符合3NF：员工表
bad_emp = """
CREATE TABLE bad_employee (
    emp_id INT PRIMARY KEY,
    emp_name VARCHAR(50),
    dept_id INT,
    dept_name VARCHAR(50),  -- dept_name依赖dept_id，dept_id依赖主键
    dept_phone VARCHAR(20)  -- 传递依赖！
)"""
# 问题：
# 1. 部门信息重复存储（每个员工存一遍）
# 2. 更新部门需要更新所有员工记录
# 3. 没有员工的部门无法存储

# ✅ 符合3NF：拆分部门表
good_emp = """
CREATE TABLE department (
    dept_id INT PRIMARY KEY,
    dept_name VARCHAR(50),
    dept_phone VARCHAR(20)
)
CREATE TABLE employee (
    emp_id INT PRIMARY KEY,
    emp_name VARCHAR(50),
    dept_id INT,
    FOREIGN KEY(dept_id) REFERENCES department(dept_id)
)"""
\`\`\`

### BC范式（BCNF）：3NF的加强

**要求**：在3NF基础上，主属性也不能传递依赖于主键。每个决定因素都必须是候选键。

\`\`\`python
# 不符合BCNF示例：仓库管理
# 一个仓库只有一个管理员，一个管理员只管理一个仓库
bad_warehouse = """
CREATE TABLE bad_wh (
    warehouse_id INT,
    admin_id INT,
    product_id INT,
    quantity INT,
    PRIMARY KEY(warehouse_id, product_id)
)"""
# 问题：admin_id依赖warehouse_id，warehouse_id是主键的一部分
# 但admin_id也能决定warehouse_id，存在依赖倒置

# BCNF拆分
good_wh = """
CREATE TABLE warehouse (
    warehouse_id INT PRIMARY KEY,
    admin_id INT UNIQUE NOT NULL
)
CREATE TABLE inventory (
    warehouse_id INT,
    product_id INT,
    quantity INT,
    PRIMARY KEY(warehouse_id, product_id)
)"""
\`\`\`

### 范式总结对比

| 范式 | 核心要求 | 解决问题 |
|-----|---------|---------|
| 1NF | 列原子性 | 字段不可再分 |
| 2NF | 完全依赖主键 | 消除联合主键的部分依赖 |
| 3NF | 无传递依赖 | 非主键直接依赖主键 |
| BCNF | 所有决定因素都是键 | 消除主属性的传递依赖 |

## 三、反范式设计

范式设计减少冗余但可能需要多表JOIN，影响查询性能。适当反范式（增加冗余）可以用空间换时间。

### 常用反范式手段

1. **冗余字段**：在订单表冗余用户姓名，避免每次查订单都JOIN用户表
2. **冗余计算列**：订单总金额、评论数等统计字段，避免实时聚合
3. **宽表设计**：将经常一起查询的数据合并到一张表

\`\`\`python
# 订单表反范式设计
denorm_order = """
CREATE TABLE orders (
    id INT PRIMARY KEY,
    order_no VARCHAR(50),
    user_id INT,
    user_name VARCHAR(50),     -- 冗余用户名
    total_amount DECIMAL(10,2), -- 冗余总金额（避免每次计算）
    product_count INT,         -- 冗余商品数量
    create_time DATETIME,
    INDEX idx_user(user_id)
)"""
# 好处：查询订单列表不需要JOIN用户表和订单明细表
# 代价：用户改名需要同步更新所有订单，总金额需要维护一致性
\`\`\`

### 反范式适用场景
- 读多写少的系统（如电商商品详情页）
- 需要频繁JOIN且数据变化不频繁
- 数据量巨大，JOIN性能难以接受
- 统计报表类查询

## 四、表关系设计

### 三种表关系

| 关系类型 | 说明 | 实现方式 |
|---------|------|---------|
| 一对一 | 一个A对应一个B | 外键+UNIQUE，或主键共享 |
| 一对多 | 一个A对应多个B | B表添加A表外键 |
| 多对多 | 一个A对应多个B，一个B对应多个A | 中间表（关联表） |

\`\`\`python
# 1. 一对多：用户和订单（一个用户多个订单）
one_to_many = """
CREATE TABLE user (id INT PRIMARY KEY, name VARCHAR(50))
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,  -- 外键指向user
    amount DECIMAL(10,2),
    FOREIGN KEY(user_id) REFERENCES user(id)
)"""

# 2. 多对多：学生和课程（一个学生选多门课，一门课多个学生）
many_to_many = """
CREATE TABLE student (id INT PRIMARY KEY, name VARCHAR(50))
CREATE TABLE course (id INT PRIMARY KEY, name VARCHAR(50))
CREATE TABLE student_course (
    student_id INT,
    course_id INT,
    score INT,
    PRIMARY KEY(student_id, course_id),
    FOREIGN KEY(student_id) REFERENCES student(id),
    FOREIGN KEY(course_id) REFERENCES course(id)
)"""

# 3. 一对一：用户和用户详情（一个用户一个详情）
one_to_one = """
CREATE TABLE user (
    id INT PRIMARY KEY,
    username VARCHAR(50),
    password VARCHAR(100)
)
CREATE TABLE user_profile (
    user_id INT PRIMARY KEY,  -- 既是主键又是外键
    avatar VARCHAR(200),
    bio TEXT,
    birthday DATE,
    FOREIGN KEY(user_id) REFERENCES user(id)
)"""
\`\`\`

### 外键约束

| 约束行为 | 说明 |
|---------|------|
| CASCADE | 父表删除/更新时，子表同步删除/更新 |
| SET NULL | 父表删除/更新时，子表外键设为NULL |
| RESTRICT/NO ACTION | 子表有关联记录时，父表不允许删除/更新（默认） |
| SET DEFAULT | 设为默认值（InnoDB不支持） |

\`\`\`python
# 外键级联示例
fk_example = """
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE
)"""
# 注意：互联网项目通常不使用物理外键，而是逻辑外键+应用层保证一致性
# 原因：1. 影响分库分表 2. 死锁风险 3. 性能损耗 4. 迁移困难
\`\`\`

## 五、ER图设计

ER图（实体-关系图）是数据库设计的可视化工具：
- **矩形**：实体（表）
- **椭圆**：属性（字段）
- **菱形**：关系
- **连线**：标注1对多/多对多

### 设计流程
1. **需求分析**：识别实体和属性
2. **确定关系**：一对一/一对多/多对多
3. **范式化**：按范式拆分表
4. **反范式优化**：根据业务场景适当冗余
5. **评审迭代**：检查是否满足需求

### 电商系统ER设计示例

\`\`\`
用户1 ── N订单N ── M商品
  │           │
  │           ├─ N订单明细
  │           └─ 1收货地址N ── 1用户
  │
  ├─ N收货地址
  ├─ 1购物车N ── M商品
  └─ N评论 ── 1商品

核心表：user, product, orders, order_item, address, cart, comment
\`\`\`

## 六、最佳实践与常见坑点

### 命名规范
1. **表名小写**，用下划线分隔：user_info而非UserInfo
2. **字段名小写**，避免关键字：用username而非name（name是SQL关键字）
3. **主键统一用id**，外键用表名_id：user_id, order_id
4. **布尔字段用is_前缀**：is_deleted, is_active
5. **时间字段统一后缀**：create_time, update_time
6. **避免缩写歧义**：transaction不要缩成trans

### 字段设计原则
1. **选择合适的数据类型**：
   - 金额用DECIMAL而非FLOAT/DOUBLE（避免精度丢失）
   - IP用INT UNSIGNED而非VARCHAR
   - 枚举用TINYINT而非VARCHAR
   - 时间用DATETIME/TIMESTAMP而非字符串
2. **必须字段设为NOT NULL**（NULL需要额外存储且影响索引）
3. **预留扩展字段**：如extra JSON类型存储扩展信息
4. **每个表都要有create_time和update_time**

\`\`\`python
# 推荐的表结构模板
table_template = """
CREATE TABLE example (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL DEFAULT '' COMMENT '名称',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0禁用1启用',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name(name),
    INDEX idx_status(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='示例表';
"""
\`\`\`

### 常见坑点
1. **过度范式化**：需要JOIN五六张表才能查出需要的数据，性能差
2. **滥用外键**：互联网高并发场景物理外键影响性能
3. **字段类型选择不当**：金额用FLOAT导致精度丢失
4. **没有软删除字段**：数据误删难以恢复（建议用is_deleted）
5. **枚举值设计不灵活**：用ENUM类型添加新值需要ALTER TABLE
6. **缺少索引**：外键字段不加索引导致JOIN性能差
7. **命名不一致**：user_id, userId, uid混用造成混乱
`
  },
  {
    id: "pyb-7-6",
    group: "SQL高级查询与优化",
    icon: "📊",
    title: "数据库锁机制 - 表锁/行锁/间隙锁、乐观锁/悲观锁、死锁检测与避免、MySQL InnoDB锁分析",
    content: `

# 数据库锁机制

## 一、锁概述

锁是数据库用于管理并发访问的机制，解决多事务同时操作同一数据时的一致性问题。

### 锁的分类

| 分类维度 | 类型 | 说明 |
|---------|------|------|
| 粒度 | 表锁 | 锁定整张表 |
| 粒度 | 行锁 | 锁定具体行 |
| 粒度 | 页锁 | 锁定数据页（BDB引擎） |
| 态度 | 共享锁(S) | 读锁，可加多个，阻塞写 |
| 态度 | 排他锁(X) | 写锁，只能加一个，阻塞读写 |
| 思想 | 悲观锁 | 假设会冲突，操作前先加锁 |
| 思想 | 乐观锁 | 假设不会冲突，提交时检查 |

## 二、MySQL锁粒度

### 表锁（Table Lock）
- 开销小，加锁快，无死锁
- 锁定粒度大，并发度低
- MyISAM/MEMORY引擎使用

\`\`\`python
# MySQL表锁操作
lock_sql = """
-- 加表锁
LOCK TABLES users READ, orders WRITE;

-- 查询（只能读加了读锁的表，读写加了写锁的表）
SELECT * FROM users;
INSERT INTO orders VALUES(...);

-- 释放表锁
UNLOCK TABLES;
"""
# 注意：实际开发中很少手动加表锁
\`\`\`

### 行锁（Row Lock）
- 开销大，加锁慢，可能死锁
- 锁定粒度小，并发度高
- InnoDB引擎支持（基于索引）

\`\`\`python
# InnoDB行锁示例（需要在事务中）
row_lock = """
-- 事务1
BEGIN;
SELECT * FROM users WHERE id = 1 FOR UPDATE;  -- 加排他行锁
-- 此时其他事务修改id=1的行会被阻塞
COMMIT;

-- 共享锁
SELECT * FROM users WHERE id = 1 LOCK IN SHARE MODE;
"""
\`\`\`

### 行锁的种类（InnoDB）

| 锁类型 | 说明 |
|-------|------|
| Record Lock | 记录锁，锁定单条索引记录 |
| Gap Lock | 间隙锁，锁定索引记录之间的间隙，防止幻读 |
| Next-Key Lock | Next-Key锁，Record Lock+Gap Lock（默认级别） |

\`\`\`python
# 间隙锁演示（RR隔离级别）
# 假设id有1,3,5三条记录，间隙为(-∞,1),(1,3),(3,5),(5,+∞)
gap_lock_demo = """
-- 事务1
BEGIN;
SELECT * FROM users WHERE id = 2 FOR UPDATE;
-- 虽然id=2不存在，但会锁定(1,3)间隙
-- 此时事务2插入id=2会被阻塞！
COMMIT;
"""
# 间隙锁是InnoDB在可重复读(RR)级别下解决幻读的方案
\`\`\`

## 三、乐观锁与悲观锁

### 悲观锁（Pessimistic Locking）

认为并发操作一定会发生冲突，访问前先加锁。

\`\`\`python
# 悲观锁：扣减库存
pessimistic = """
BEGIN;
-- 查询并加排他锁（FOR UPDATE）
SELECT stock FROM products WHERE id = 1 FOR UPDATE;
-- 如果stock > 0则执行扣减
UPDATE products SET stock = stock - 1 WHERE id = 1;
COMMIT;
"""
# 优点：简单直接，保证强一致性
# 缺点：并发性能差，可能死锁
# 适用场景：写多读少，冲突概率高（如金融场景）
\`\`\`

### 乐观锁（Optimistic Locking）

认为冲突概率低，提交更新时才检查数据是否被修改过。

\`\`\`python
# 方案1：版本号机制
optimistic_version = """
-- 表增加version字段
ALTER TABLE products ADD COLUMN version INT DEFAULT 0;

-- 查询时获取版本号
SELECT id, stock, version FROM products WHERE id = 1;
-- 假设stock=10, version=5

-- 更新时比较版本号
UPDATE products 
SET stock = stock - 1, version = version + 1
WHERE id = 1 AND version = 5 AND stock > 0;

-- 检查affected rows：1表示成功，0表示被其他事务修改过
"""

# 方案2：CAS（Compare And Swap）
# 直接比较字段值，不使用单独version
cas_example = """
UPDATE products
SET stock = stock - 1
WHERE id = 1 AND stock = 10;
-- 适用于只更新一次的简单场景
"""
\`\`\`

### 乐观锁 vs 悲观锁对比

| 对比项 | 悲观锁 | 乐观锁 |
|-------|-------|-------|
| 实现方式 | 数据库锁机制（FOR UPDATE） | 版本号/CAS |
| 并发性能 | 较差（持锁期间阻塞） | 好（不加锁） |
| 冲突处理 | 阻塞等待 | 重试 |
| 死锁风险 | 有 | 无 |
| 适用场景 | 写多、冲突多、强一致 | 读多、冲突少、允许重试 |
| 实现复杂度 | 简单 | 需处理重试逻辑 |

\`\`\`python
# Python中乐观锁重试逻辑示例
import time
import random

def deduct_stock(product_id, deduct_num, max_retry=3):
    for i in range(max_retry):
        # 查询
        with conn.cursor() as c:
            c.execute("SELECT stock, version FROM products WHERE id = %s", (product_id,))
            stock, version = c.fetchone()
        
        if stock < deduct_num:
            return False, "库存不足"
        
        # 更新
        with conn.cursor() as c:
            c.execute("""UPDATE products 
                SET stock = stock - %s, version = version + 1
                WHERE id = %s AND version = %s AND stock >= %s""",
                (deduct_num, product_id, version, deduct_num))
            if c.rowcount == 1:
                conn.commit()
                return True, "扣减成功"
        
        # 冲突重试
        conn.rollback()
        time.sleep(random.uniform(0.01, 0.1))  # 随机等待避免活锁
    
    return False, "重试次数过多"
\`\`\`

## 四、死锁检测与避免

### 什么是死锁
两个或多个事务互相等待对方释放锁，形成循环等待，永远无法继续。

### 死锁产生的四个必要条件
1. **互斥**：资源同时只能被一个事务持有
2. **占有且等待**：持有锁同时等待其他锁
3. **不可剥夺**：已获得的锁不能被强制释放
4. **循环等待**：事务之间形成头尾相接的等待环路

\`\`\`python
# 死锁演示
deadlock_demo = """
-- 事务1
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;  -- 持有id=1的锁
-- 等待一会
UPDATE accounts SET balance = balance + 100 WHERE id = 2;  -- 请求id=2的锁（被事务2持有）

-- 事务2
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 2;  -- 持有id=2的锁
-- 等待一会
UPDATE accounts SET balance = balance + 100 WHERE id = 1;  -- 请求id=1的锁（被事务1持有）
-- 死锁发生！
"""
\`\`\`

### 如何避免死锁

1. **固定访问顺序**：所有事务按相同顺序访问资源
\`\`\`python
# 总是先操作id小的记录，再操作id大的
def transfer(from_id, to_id, amount):
    if from_id > to_id:
        from_id, to_id = to_id, from_id  # 确保顺序一致
    # 然后按照固定顺序加锁
\`\`\`

2. **保持事务简短**：缩小事务范围，减少持锁时间
\`\`\`python
# ❌ 不好：事务中包含无关操作
def bad_transfer():
    cursor.execute("BEGIN")
    cursor.execute("SELECT ... FOR UPDATE")
    time.sleep(5)  # 不要在事务中做耗时操作！
    call_external_api()  # 不要在事务中调用外部接口！
    cursor.execute("UPDATE ...")
    cursor.execute("COMMIT")

# ✅ 好：事务只包含必要的数据库操作
\`\`\`

3. **合理使用索引**：避免锁升级为表锁（没用到索引时行锁变表锁）

4. **降低隔离级别**：如RC比RR间隙锁更少，死锁概率更低

### 死锁处理
- MySQL InnoDB有死锁检测机制，自动回滚代价最小的事务
- 通过命令查看死锁日志：\`SHOW ENGINE INNODB STATUS\`

\`\`\`python
# 查看最近死锁信息
show_deadlock = "SHOW ENGINE INNODB STATUS"

# InnoDB死锁相关配置
deadlock_config = """
-- 死锁检测（默认开启）
SET GLOBAL innodb_deadlock_detect = ON;

-- 等待超时时间（默认50秒），超时自动回滚
SET GLOBAL innodb_lock_wait_timeout = 10;
"""
\`\`\`

## 五、InnoDB锁分析

### 查看当前锁等待

\`\`\`python
# MySQL 8.0查看锁信息
lock_monitor = """
-- 查看当前事务
SELECT * FROM information_schema.INNODB_TRX;

-- 查看锁等待
SELECT * FROM sys.innodb_lock_waits;

-- 查看当前锁
SELECT * FROM performance_schema.data_locks;
"""
\`\`\`

### 锁升级现象
当查询没用到索引时，InnoDB的行锁会升级为表锁，并发性能急剧下降！

\`\`\`python
# ❌ 危险：name字段没有索引，会导致全表扫描，行锁变表锁
no_index_lock = """
BEGIN;
-- 没有索引，全表扫描，所有行都被锁定！
SELECT * FROM users WHERE name = '张三' FOR UPDATE;
-- 此时其他事务修改任何记录都会被阻塞！
COMMIT;
"""
# 一定要确保FOR UPDATE/LOCK IN SHARE MODE的查询条件有索引！
\`\`\`

## 六、最佳实践

1. **优先使用乐观锁**：读多写少场景乐观锁性能更好
2. **确保查询走索引**：避免行锁升级为表锁
3. **事务尽量短小**：不持锁做耗时操作、不调用外部接口
4. **固定资源访问顺序**：避免交叉等待导致死锁
5. **避免大事务**：大事务持锁时间长，影响并发
6. **合理设置锁等待超时**：避免长时间挂起
7. **使用低隔离级别**：RC级别比RR级别锁更少（但要接受不可重复读）
8. **热点数据优化**：对于秒杀等极端场景，使用Redis分布式锁或队列削峰
`
  },
  {
    id: "pyb-7-7",
    group: "SQL高级查询与优化",
    icon: "📊",
    title: "分库分表基础 - 垂直拆分/水平拆分、分库分表中间件、ID生成策略",
    content: `

# 分库分表基础

## 一、为什么需要分库分表

单机数据库容量和性能存在瓶颈：
- **数据量过大**：单表千万/亿级后查询性能下降
- **连接数有限**：单机MySQL连接数有限（通常几千）
- **IO瓶颈**：单机磁盘IO、CPU能力上限
- **高可用要求**：单点故障风险

当出现以下情况时考虑分库分表：
1. 单表数据量超过500万或单表容量超过10GB（经验值，取决于索引和查询）
2. 单库QPS超过5000-8000
3. 已有索引优化、读写分离等手段仍无法满足性能需求

## 二、拆分方式

### 垂直拆分

按照业务/功能模块拆分，将不同表分到不同库。

| 类型 | 说明 | 示例 |
|-----|------|------|
| 垂直分库 | 按业务模块拆分到不同数据库 | 用户库、订单库、商品库 |
| 垂直分表 | 将大表按列拆分，冷热数据分离 | 用户基本信息表、用户扩展信息表 |

\`\`\`python
# 垂直拆分示例

# 拆分前：单库多表
# shop_db: user, order, product, comment, logistics, payment

# 垂直分库后：
# user_db: user, user_profile, user_address
# order_db: orders, order_item, order_log
# product_db: product, category, product_sku
# payment_db: payment, refund, wallet

# 垂直分表示例：大字段拆分
vertical_split_table = """
-- 主表（常用热数据）
CREATE TABLE user_main (
    id BIGINT PRIMARY KEY,
    username VARCHAR(50),
    phone VARCHAR(20),
    avatar VARCHAR(200),
    status TINYINT,
    create_time DATETIME,
    INDEX idx_phone(phone)
);

-- 详情表（冷数据、大字段）
CREATE TABLE user_detail (
    user_id BIGINT PRIMARY KEY,
    password VARCHAR(100),
    email VARCHAR(100),
    real_name VARCHAR(50),
    id_card VARCHAR(20),
    bio TEXT,
    settings JSON,
    FOREIGN KEY(user_id) REFERENCES user_main(id)
);
-- 好处：主表查询频繁且数据量小，查询快
-- 大字段、不常用字段分离，减少Buffer Pool占用
"""
\`\`\`

**垂直拆分优点**：
1. 业务清晰，按模块解耦
2. 可以根据业务特点优化和部署
3. 降低单库表数量，维护简单

**垂直拆分缺点**：
1. 无法解决单表数据量过大问题
2. 跨库JOIN复杂
3. 跨库事务处理困难

### 水平拆分

将同一个表的数据按某种规则拆分到多个库/表中。

**水平分表**：同一个库中，将数据分到多张结构相同的表
\`\`\`
order_db: orders_0, orders_1, ..., orders_15
\`\`\`

**水平分库分表**：分到不同库，每个库再分多张表
\`\`\`
order_db_0: orders_0, orders_1, ..., orders_3
order_db_1: orders_0, orders_1, ..., orders_3
...
order_db_3: orders_0, orders_1, ..., orders_3
共4库×4表=16张表
\`\`\`

### 常见分片策略

| 策略 | 算法 | 优点 | 缺点 |
|-----|------|------|------|
| 取模 | id % n | 数据均匀，实现简单 | 扩容麻烦（需要重新hash迁移数据） |
| 范围 | 按时间/ID范围 | 扩容简单，范围查询方便 | 热点问题（新数据都在一个分片） |
| 一致性hash | hash环算法 | 扩容迁移数据少 | 实现复杂，数据可能倾斜 |
| 枚举 | 按地区/状态枚举 | 简单可控 | 不灵活，数据不均 |
| 自定义 | 按业务规则 | 灵活 | 需要自己维护路由规则 |

\`\`\`python
# 取模分片示例
def get_table(user_id, table_count=16):
    return f"orders_{user_id % table_count}"

def get_db_and_table(user_id, db_count=4, table_per_db=4):
    table_idx = user_id % (db_count * table_per_db)
    db_idx = table_idx // table_per_db
    table_name = f"orders_{table_idx % table_per_db}"
    db_name = f"order_db_{db_idx}"
    return db_name, table_name

# 范围分片示例（按时间）
def get_table_by_time(create_time):
    # 按月分表
    month = create_time.strftime("%Y%m")
    return f"orders_{month}"
\`\`\`

## 三、分库分表带来的问题

1. **跨库JOIN**：不能直接JOIN，需要多次查询组装
2. **分布式事务**：跨库更新事务复杂（XA、TCC、Saga、最终一致性）
3. **跨节点分页/排序**：多个分片查询后需要合并排序
4. **分布式ID**：自增ID在分片后冲突
5. **扩容问题**：取模分表扩容需要数据迁移
6. **多维度查询**：按用户ID分片后按商家查询困难
7. **运维复杂度**：多库多表管理、备份、迁移复杂

### 解决方案

| 问题 | 方案 |
|-----|------|
| 跨库JOIN | 1.字段冗余；2.应用层组装；3.宽表设计；4.数据同步到ES |
| 分布式事务 | 1.避免跨库事务；2.最终一致性；3.Seata框架 |
| 跨节点分页 | 1.禁止深度分页；2.业务层限制；3.用滚动翻页（带last_id） |
| 分布式ID | 雪花算法、号段模式、数据库自增序列 |
| 扩容问题 | 1.一次性分足够多表（如32/64表）；2.一致性hash；3.双写迁移 |
| 多维度查询 | 1.CDB多写（按多个维度存数据）；2.ES做二级索引 |

## 四、分库分表中间件

### 常见中间件对比

| 中间件 | 类型 | 语言 | 特点 |
|-------|------|------|------|
| ShardingSphere-JDBC | 客户端（Jar包） | Java | 轻量，无代理，性能好，支持多ORM |
| ShardingSphere-Proxy | 代理端（独立部署） | Java | 对应用透明，支持多语言，有性能损耗 |
| MyCAT | 代理端 | Java | 社区版功能丰富，老牌中间件 |
| Vitess | 代理端 | Go | YouTube出品，适合大规模MySQL集群 |
| Citus | 插件 | C | PostgreSQL分布式方案 |

### ShardingSphere核心功能
- 数据分片：分库分表路由
- 读写分离：主从切换
- 分布式事务：XA/柔性事务
- 数据加密：字段透明加密
- 影子库：压测支持

\`\`\`python
# ShardingSphere-JDBC配置示例（Python项目通常用其他方案）
# Python生态常用方案：
# 1. SQLAlchemy + 自定义路由（简单场景）
# 2. 中间件代理模式：ShardingSphere-Proxy/MyCAT（应用连接像单库一样）
# 3. 分库分表类库：如sqlalchemy-sharding

# 简单Python分片路由示例
class OrderSharding:
    def __init__(self, db_count=4, table_count=16):
        self.db_count = db_count
        self.table_count = table_count
    
    def get_connection(self, user_id):
        db_idx = user_id % self.db_count
        # 返回对应数据库连接
        return self.connections[db_idx]
    
    def get_table_name(self, user_id):
        table_idx = user_id % self.table_count
        return f"orders_{table_idx}"
    
    def insert_order(self, order):
        conn = self.get_connection(order.user_id)
        table = self.get_table_name(order.user_id)
        sql = f"INSERT INTO {table} (id,user_id,amount) VALUES (%s,%s,%s)"
        with conn.cursor() as c:
            c.execute(sql, (order.id, order.user_id, order.amount))
        conn.commit()
\`\`\`

## 五、分布式ID生成策略

分库分表后自增ID会冲突，需要全局唯一ID。

### ID生成方案对比

| 方案 | 优点 | 缺点 |
|-----|------|------|
| UUID | 实现简单，本地生成 | 无序，字符串存储查询慢，不可读 |
| 数据库自增（单独ID库） | 简单，有序 | 单点风险，性能瓶颈 |
| Redis INCR | 性能好，有序 | Redis持久化问题，依赖Redis |
| **雪花算法（Snowflake）** | 高性能、有序、不依赖第三方 | 时钟回拨问题 |
| 号段模式（Leaf） | 高性能，依赖少，趋势有序 | 需要部署服务 |
| 美团Leaf/百度UidGenerator | 成熟方案，解决时钟问题 | 部署维护成本 |

### 雪花算法（Snowflake）

Twitter开源的分布式ID生成算法，64位Long型ID。

\`\`\`
0 - 41位时间戳 - 10位机器ID - 12位序列号
\`\`\`

| 位置 | 长度 | 说明 |
|-----|------|------|
| 符号位 | 1bit | 固定为0（正数） |
| 时间戳 | 41bit | 毫秒级时间，可用约69年 |
| 工作机器ID | 10bit | 支持最多1024个节点 |
| 序列号 | 12bit | 每毫秒最多生成4096个ID |

\`\`\`python
import time
import threading

class Snowflake:
    def __init__(self, worker_id, datacenter_id=0):
        self.worker_id = worker_id
        self.datacenter_id = datacenter_id
        self.sequence = 0
        self.last_timestamp = -1
        
        # 位数配置
        self.worker_id_bits = 5
        self.datacenter_id_bits = 5
        self.sequence_bits = 12
        
        # 最大值
        self.max_worker_id = -1 ^ (-1 << self.worker_id_bits)
        self.max_datacenter_id = -1 ^ (-1 << self.datacenter_id_bits)
        self.sequence_mask = -1 ^ (-1 << self.sequence_bits)
        
        # 位移
        self.worker_id_shift = self.sequence_bits
        self.datacenter_id_shift = self.sequence_bits + self.worker_id_bits
        self.timestamp_shift = self.sequence_bits + self.worker_id_bits + self.datacenter_id_bits
        
        # 起始时间戳（2024-01-01 00:00:00）
        self.twepoch = 1704067200000
        
        self.lock = threading.Lock()
    
    def _gen_timestamp(self):
        return int(time.time() * 1000)
    
    def _til_next_millis(self, last_timestamp):
        timestamp = self._gen_timestamp()
        while timestamp <= last_timestamp:
            timestamp = self._gen_timestamp()
        return timestamp
    
    def next_id(self):
        with self.lock:
            timestamp = self._gen_timestamp()
            
            if timestamp < self.last_timestamp:
                raise Exception(f"Clock moved backwards. Refusing to generate id for {self.last_timestamp - timestamp} milliseconds")
            
            if timestamp == self.last_timestamp:
                self.sequence = (self.sequence + 1) & self.sequence_mask
                if self.sequence == 0:
                    timestamp = self._til_next_millis(self.last_timestamp)
            else:
                self.sequence = 0
            
            self.last_timestamp = timestamp
            
            snowflake_id = ((timestamp - self.twepoch) << self.timestamp_shift) | \\
                           (self.datacenter_id << self.datacenter_id_shift) | \\
                           (self.worker_id << self.worker_id_shift) | \\
                           self.sequence
            
            return snowflake_id

# 使用示例
snowflake = Snowflake(worker_id=1)
id1 = snowflake.next_id()
print(f"生成的ID: {id1}")  # 如: 1853679284800000001
print(f"ID长度: {len(str(id1))}")  # 19位
\`\`\`

**雪花ID优点**：
- 高性能：单节点每秒400万+
- 时间有序：ID趋势递增，索引插入性能好
- 不依赖第三方：本地生成
- 包含时间信息：可反解出生成时间

## 六、分库分表最佳实践

1. **能不分就不分**：先做索引优化、读写分离、缓存，最后才考虑分库分表
2. **分片键选择**：选择查询频率最高的维度（如user_id），避免跨分片查询
3. **提前规划分片数**：一次分够（如32库1024表），避免后期扩容痛苦
4. **非分片键查询**：用ES做二级索引，或做数据异构（CDQ双写）
5. **禁止跨分片事务**：通过业务设计避免，使用最终一致性
6. **禁止多表JOIN**：冗余字段，或两次查询应用层组装
7. **深度分页问题**：用子查询/游标（last_id）替代LIMIT offset
8. **统一时间分片**：日志类数据按时间分片更合适
9. **冷热数据分离**：历史数据归档存储
10. **灰度迁移**：双写方案平滑迁移（旧库新库同时写，迁完切读）
`
  },
  {
    id: "pyb-7-8",
    group: "SQL高级查询与优化",
    icon: "📊",
    title: "NoSQL数据库选型 - Redis/MongoDB/Elasticsearch/Cassandra对比、CAP定理、关系型vs NoSQL",
    content: `

# NoSQL数据库选型

## 一、NoSQL概述

NoSQL（Not Only SQL）泛指非关系型数据库，是为解决大规模数据集合、多样数据类型、高并发等挑战而产生的。

### NoSQL兴起背景
1. **大数据时代**：数据量爆发式增长，单机关系型数据库难以扩展
2. **高并发需求**：互联网应用高并发读写，关系型数据库性能瓶颈
3. **数据模型灵活**：Web2.0时代数据结构多样，不适合固定Schema
4. **高可用要求**：需要更好的水平扩展和容错能力

### CAP定理

分布式系统不可能同时满足三个特性，最多满足两个：

| 特性 | 英文 | 说明 |
|-----|------|------|
| 一致性 | Consistency | 所有节点在同一时间看到相同数据 |
| 可用性 | Availability | 每个请求都能获得非错误响应（不保证最新） |
| 分区容错性 | Partition tolerance | 网络分区故障时系统仍能继续运行 |

**网络分区无法避免**，实际系统必须满足P，在C和A之间权衡：
- **CP**：保证一致性，可能牺牲可用性（如ZooKeeper、HBase、Redis）
- **AP**：保证可用性，可能牺牲一致性（如Cassandra、DynamoDB、多数NoSQL）

### BASE理论
对CAP中AP的延伸，大型分布式系统的实践指导：
- **Basically Available**：基本可用（允许部分功能降级、响应时间增加）
- **Soft state**：软状态（允许系统状态同步存在延迟）
- **Eventually consistent**：最终一致性（经过一段时间后数据最终一致）

## 二、常见NoSQL类型

| 类型 | 代表产品 | 数据模型 | 适用场景 |
|-----|---------|---------|---------|
| 键值存储 | Redis、Memcached | Key-Value | 缓存、会话、计数器 |
| 文档存储 | MongoDB、CouchDB | JSON/BSON文档 | 内容管理、用户画像、日志 |
| 列族存储 | Cassandra、HBase | 列族 | 时序数据、海量数据写入、日志 |
| 图形数据库 | Neo4j、Nebula Graph | 图结构 | 社交关系、知识图谱、推荐 |
| 搜索引擎 | Elasticsearch、Solr | 倒排索引 | 全文检索、日志分析、多维查询 |

## 三、Redis（键值存储）

Redis（Remote Dictionary Server）是高性能内存键值数据库，支持丰富的数据结构。

### 核心特性
1. **内存存储**：极高性能（单实例10万+ QPS）
2. **丰富数据结构**：String、Hash、List、Set、ZSet、Bitmap、HyperLogLog、Stream
3. **持久化**：RDB快照 + AOF日志
4. **高可用**：主从复制、Sentinel哨兵、Cluster集群
5. **支持事务/Lua脚本**：原子操作
6. **TTL过期**：天然支持缓存过期

### 适用场景
- **缓存**：热点数据缓存、数据库查询缓存、页面缓存
- **会话存储**：分布式Session
- **计数器/限流**：文章浏览量、点赞数、接口限流（INCR+EXPIRE）
- **排行榜**：ZSet实现实时排行榜
- **消息队列**：List/Stream做简单MQ
- **分布式锁**：SET NX EX实现
- **去重**：HyperLogLog做UV统计、Set做去重
- **最新列表**：LPUSH+LRANGE实现朋友圈

\`\`\`python
import redis

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# 1. String：缓存用户信息
r.setex("user:1", 3600, '{"name":"张三","age":25}')  # 1小时过期
user = r.get("user:1")

# 2. Hash：对象缓存
r.hset("user:1:profile", mapping={"name": "张三", "age": 25, "city": "北京"})
name = r.hget("user:1:profile", "name")

# 3. 计数器
r.incr("article:1001:view_count")  # 浏览量+1
view_count = int(r.get("article:1001:view_count"))

# 4. ZSet排行榜
r.zadd("leaderboard", {"张三": 1000, "李四": 2000, "王五": 1500})
top10 = r.zrevrange("leaderboard", 0, 9, withscores=True)  # Top10

# 5. 分布式锁
def acquire_lock(lock_name, acquire_timeout=10):
    identifier = str(uuid.uuid4())
    if r.set(lock_name, identifier, nx=True, ex=acquire_timeout):
        return identifier
    return None

def release_lock(lock_name, identifier):
    # 用Lua脚本保证原子性
    lua_script = """
    if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
    else
        return 0
    end
    """
    r.eval(lua_script, 1, lock_name, identifier)
\`\`\`

**不适合场景**：
- 大数据量存储（内存成本高）
- 需要复杂查询（不支持SQL、JOIN）
- 冷数据（放内存浪费）

## 四、MongoDB（文档存储）

MongoDB是最流行的文档数据库，数据以BSON（Binary JSON）格式存储，Schema灵活。

### 核心特性
1. **文档模型**：类JSON文档，嵌套结构，灵活Schema
2. **丰富查询**：支持索引、聚合管道、全文搜索
3. **高可用**：副本集（Replica Set）自动故障转移
4. **水平扩展**：分片（Sharding）支持海量数据
5. **GridFS**：支持大文件存储
6. **多文档事务**：4.0后支持ACID事务

### 适用场景
- **内容管理**：博客、文章、评论（结构多变）
- **用户画像**：用户标签、属性多变
- **日志/事件存储**：半结构化日志数据
- **电商商品**：不同品类商品属性差异大
- **物联网数据**：设备上报数据
- **快速原型开发**：Schema不固定，需求频繁变化

\`\`\`python
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['mydb']

# 插入文档（类似JSON，结构灵活）
product = {
    "name": "iPhone 15",
    "category": "phone",
    "price": 6999,
    "specs": {"color": "black", "storage": "128GB"},
    "tags": ["5G", "Apple"],
    "create_time": datetime.utcnow()
}
db.products.insert_one(product)

# 查询
db.products.find_one({"category": "phone", "price": {"$lt": 8000}})

# 聚合管道
pipeline = [
    {"$match": {"category": "phone"}},
    {"$group": {"_id": "$brand", "total": {"$sum": 1}, "avg_price": {"$avg": "$price"}}},
    {"$sort": {"total": -1}}
]
result = list(db.products.aggregate(pipeline))

# 索引
db.products.create_index([("name", 1), ("category", 1)])
db.products.create_index([("price", -1)])
\`\`\`

**不适合场景**：
- 需要复杂事务（如金融转账，建议MySQL）
- 需要复杂多表JOIN
- 高度结构化的财务数据

## 五、Elasticsearch（搜索引擎）

Elasticsearch是基于Lucene的分布式搜索引擎，擅长全文检索和多维分析。

### 核心特性
1. **倒排索引**：全文检索能力强
2. **分布式架构**：天然支持分片和副本
3. **近实时搜索**：数据写入秒级可查
4. **丰富查询DSL**：分词、模糊、范围、聚合
5. **ELK生态**：Logstash日志收集、Kibana可视化

### 适用场景
- **全文搜索**：商品搜索、内容搜索、站内搜索
- **日志分析**：ELK栈（Elasticsearch+Logstash+Kibana）
- **多维查询/聚合**：复杂筛选、统计报表
- **监控指标分析**：APM、系统监控、指标聚合
- **地理位置查询**：附近的人、附近店铺（GEO查询）

\`\`\`python
from elasticsearch import Elasticsearch

es = Elasticsearch(['http://localhost:9200'])

# 创建索引（类似表）
mapping = {
    "mappings": {
        "properties": {
            "title": {"type": "text", "analyzer": "ik_max_word"},
            "content": {"type": "text", "analyzer": "ik_max_word"},
            "price": {"type": "double"},
            "category": {"type": "keyword"},
            "create_time": {"type": "date"}
        }
    }
}
es.indices.create(index='products', body=mapping)

# 写入文档
doc = {"title": "iPhone 15 Pro Max", "content": "最新款苹果手机...", "price": 9999, "category": "phone"}
es.index(index='products', id=1, document=doc)

# 全文搜索
query = {
    "query": {
        "multi_match": {
            "query": "苹果手机",
            "fields": ["title", "content"]
        }
    },
    "highlight": {
        "fields": {"title": {}, "content": {}}
    }
}
result = es.search(index='products', body=query)

# 聚合分析
agg_query = {
    "size": 0,
    "aggs": {
        "category_stats": {
            "terms": {"field": "category"},
            "aggs": {"avg_price": {"avg": {"field": "price"}}}
        }
    }
}
stats = es.search(index='products', body=agg_query)
\`\`\`

**不适合场景**：
- 需要频繁更新（更新性能不如关系型DB）
- 需要事务（ES没有事务）
- 主键查询为主（杀鸡用牛刀，Redis/MySQL更合适）

## 六、Cassandra（列族存储）

Cassandra是高度可扩展的分布式NoSQL，来自Facebook，适合写入密集型场景。

### 核心特性
1. **高写入性能**：写入极快，适合海量数据写入
2. **去中心化**：无Master节点，所有节点对等
3. **可调一致性**：读写时指定一致性级别
4. **线性扩展**：加节点即可扩容
5. **多数据中心**：原生支持跨机房部署

### 适用场景
- **时序数据**：IoT设备数据、监控指标、日志
- **消息/订单**：写入量大、查询简单（按主键查询）
- **用户活动记录**：用户行为、浏览历史
- **需要极高可用**：AP系统，网络分区仍可用

## 七、选型对比

| 特性 | MySQL | Redis | MongoDB | Elasticsearch | Cassandra |
|-----|-------|-------|---------|--------------|-----------|
| 数据模型 | 关系表 | Key-Value | 文档 | 文档+倒排索引 | 列族 |
| 查询语言 | SQL | 命令 | MQL | Query DSL | CQL |
| 事务支持 | ACID | 部分（Lua/事务） | 多文档事务 | 无 | 行级原子 |
| 扩展性 | 垂直扩展+读写分离/分库分表 | Cluster集群 | 分片集群 | 天然分布式 | 线性扩展 |
| 一致性 | 强一致 | 强一致 | 可配置 | 近实时/最终 | 可调 |
| 主要场景 | 事务系统、核心业务 | 缓存、计数器、高速访问 | 灵活Schema、文档 | 搜索、日志、分析 | 海量写入、高可用 |
| 典型QPS | 几千-几万 | 10万+ | 几万 | 几万 | 极高 |

## 八、何时用关系型，何时用NoSQL？

### 关系型数据库适合：
1. **强事务要求**：金融、支付、订单等（ACID很重要）
2. **数据结构固定**：用户、账户等核心业务
3. **复杂关联查询**：需要多表JOIN
4. **数据量可控**：单表百万-千万级
5. **需要成熟生态**：工具、运维、人才丰富

### NoSQL适合：
1. **缓存加速**：用Redis挡热点
2. **全文检索**：用ES做搜索
3. **Schema灵活**：快速迭代、字段多变
4. **海量数据/高并发写入**：日志、监控、IoT
5. **高可用优先**：允许最终一致性

### 推荐架构（多库配合）

现代项目通常使用多种数据存储组合，各司其职：

\`\`\`
用户请求 → CDN → Nginx → 应用服务
                            ↓
                    ┌───────┴───────┐
                    ↓       ↓       ↓
                 Redis   MySQL   Elasticsearch
                 (缓存)  (核心库)   (搜索/日志)
                            ↓
                         MongoDB
                      (日志/非核心)
\`\`\`

**典型组合**：
- **MySQL + Redis**：最常见组合，Redis做MySQL的缓存
- **MySQL + Elasticsearch**：MySQL存数据，ES同步做复杂搜索
- **MySQL + Redis + MongoDB + ES**：各司其职，覆盖各种场景

## 九、技术选型原则

1. **选择熟悉的**：团队熟悉比技术完美更重要
2. **不要过早优化**：先用MySQL，等有瓶颈了再引入NoSQL
3. **场景匹配**：没有万能数据库，根据场景选择
4. **考虑运维成本**：多一个组件就多一分运维负担
5. **避免技术堆砌**：为了用而用是最大的坑
6. **MySQL足够时用MySQL**：关系型数据库能解决大多数问题

## 常见坑点
1. **用Redis做持久存储**：Redis是内存数据库，宕机可能丢数据
2. **MongoDB当成关系型用**：复杂JOIN、多文档事务性能差
3. **ES当主存**：ES不是数据库，丢数据恢复困难
4. **过度追求新技术**：技术选型要考虑团队和项目规模
5. **忽略监控和运维**：NoSQL运维复杂度不比关系型低
`
  }
]
