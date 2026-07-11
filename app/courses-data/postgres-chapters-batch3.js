// =============================================================
// 《PostgreSQL 实战教程》- 章节批次 3
// -------------------------------------------------------------
// 内容：第三部分 高级特性（第 13-18 章）
// =============================================================

const chapters = [
  // =========================================================
  // 第十三章：索引详解
  // =========================================================
  {
    id: "pg-ch13",
    group: "第三部分 高级特性",
    icon: "📇",
    title: "第 13 章 索引详解",
    content: `# 第 13 章 索引详解

索引是数据库性能优化的核心手段。PostgreSQL 拥有业界最丰富的索引类型生态：默认的 B-Tree、用于等值查询的 Hash、用于 JSONB/数组/全文检索的 GIN、用于几何与范围类型的 GiST、为有序大表设计的 BRIN、以及空间分区索引 SP-GiST。除此之外，PG 还支持部分索引、表达式索引、覆盖索引（INCLUDE）、并发创建索引（CONCURRENTLY）等高级特性，这些能力远超 MySQL 等数据库。

本章系统讲解 PG 的索引类型与高级特性，帮助你针对不同场景选对索引、写好 SQL。看懂 \`EXPLAIN\` 输出中的 Index Scan、Index Only Scan、Bitmap Index Scan 是本章的副产品。

## 13.1 PostgreSQL 索引类型概览

| 索引类型 | 适用场景 | 典型运算 |
| --- | --- | --- |
| \`B-Tree\` | 默认类型，等值、范围、排序 | \`=\`、\`>\`、\`<\`、\`BETWEEN\`、\`IN\`、\`IS NULL\`、\`ORDER BY\` |
| \`Hash\` | 等值查询（仅 =） | \`=\` |
| \`GIN\` | 多值字段：数组、JSONB、全文检索 | \`@>\`、\`?\`、\`@@@\`、\`&&\` |
| \`GiST\` | 几何、范围、KNN、约束 | \`<<\`、\`&<\`、\`@>\`、\`<->\` |
| \`SP-GiST\` | 非平衡数据：IP、电话区号、路由 | 自定义运算符 |
| \`BRIN\` | 超大表且物理有序（时间序列） | 范围查询 |

\`\`\`sql
-- 查看某张表的所有索引
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'users';

-- 查看索引类型
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'users';
-- 或使用 \d 表名
\`\`\`

> 提示：PG 的索引是与表分离的独立对象，每个索引都是一棵独立的数据结构。一个表上 5-8 个索引是常态，但索引越多写性能越差。

## 13.2 B-Tree 索引（默认）

\`CREATE INDEX\` 不指定类型时默认创建 B-Tree 索引。B-Tree 是平衡多路搜索树，支持等值、范围、排序、唯一约束。

\`\`\`sql
-- 创建演示表
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50),
  email VARCHAR(100),
  age INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 默认创建 B-Tree 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_age ON users(age);

-- 唯一索引（自动为 UNIQUE 约束创建）
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);
\`\`\`

B-Tree 支持的查询模式：

\`\`\`sql
-- 等值查询走索引
SELECT * FROM users WHERE email = 'alice@example.com';

-- 范围查询走索引
SELECT * FROM users WHERE age BETWEEN 20 AND 40;
SELECT * FROM users WHERE age > 18 AND age < 60;

-- 排序走索引（正向或反向扫描）
SELECT * FROM users ORDER BY age;
SELECT * FROM users ORDER BY age DESC;

-- LIKE 前缀匹配走索引（注意 C locale 限制）
SELECT * FROM users WHERE name LIKE 'Ali%';

-- IS NULL 走索引（PG 支持，与 MySQL 不同）
SELECT * FROM users WHERE email IS NULL;
\`\`\`

**B-Tree 不支持的场景**：

\`\`\`sql
-- LIKE 中缀/后缀不走索引
SELECT * FROM users WHERE name LIKE '%li%';

-- 函数运算不走索引（除非建表达式索引）
SELECT * FROM users WHERE LOWER(email) = 'alice@example.com';

-- 类型不一致可能不走索引
SELECT * FROM users WHERE age = '28';  -- 字符串转 INT，可能仍走索引但建议避免
\`\`\`

## 13.3 Hash 索引

Hash 索引只能用于等值查询（\`=\`），不能用于范围、排序。在 PG 10 之前 Hash 索引不支持 WAL 日志，崩溃后无法恢复，几乎没人用；PG 10 之后修复了这个问题，但应用场景仍然有限。

\`\`\`sql
-- 创建 Hash 索引
CREATE INDEX idx_users_email_hash ON users USING HASH (email);

-- 只能用于等值查询
SELECT * FROM users WHERE email = 'alice@example.com';

-- 以下查询无法使用 Hash 索引
SELECT * FROM users WHERE email > 'a';
SELECT * FROM users ORDER BY email;
\`\`\`

**何时用 Hash 索引**：
- 仅做等值查询，且字段值很长（如 SHA256 哈希、UUID），Hash 索引比 B-Tree 占空间更小
- 不需要排序、范围查询

> 谨慎建议：大多数场景 B-Tree 已足够，Hash 索引的优势（节省空间）只在超大表且纯等值查询时才显著。

## 13.4 GIN 索引（JSONB / 数组 / 全文检索）

GIN（Generalized Inverted Index，倒排索引）是 PG 处理多值字段的利器，支持数组、JSONB、全文检索（tsvector）。

### 13.4.1 数组字段

\`\`\`sql
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title TEXT,
  tags TEXT[]
);

INSERT INTO articles (title, tags) VALUES
  ('PostgreSQL 入门', ARRAY['数据库', 'PG', '教程']),
  ('MySQL 优化', ARRAY['数据库', 'MySQL', '优化']),
  ('Redis 实战', ARRAY['缓存', 'Redis']);

-- 在数组字段上创建 GIN 索引
CREATE INDEX idx_articles_tags ON articles USING GIN (tags);

-- 包含查询 @> 走索引
SELECT * FROM articles WHERE tags @> ARRAY['数据库'];

-- 重叠查询 && 走索引
SELECT * FROM articles WHERE tags && ARRAY['Redis', 'MongoDB'];
\`\`\`

### 13.4.2 JSONB 字段

\`\`\`sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  attrs JSONB
);

INSERT INTO products (name, attrs) VALUES
  ('MacBook', '{"cpu":"M2","ram":16,"color":"silver","tags":["laptop","apple"]}'),
  ('iPhone', '{"cpu":"A16","ram":6,"color":"black","tags":["phone","apple"]}');

-- 在 JSONB 字段上创建 GIN 索引（推荐 jsonb_path_ops，更小更快）
CREATE INDEX idx_products_attrs ON products USING GIN (attrs jsonb_path_ops);

-- 包含查询走索引
SELECT * FROM products WHERE attrs @> '{"color":"silver"}';

-- 键存在查询走索引
SELECT * FROM products WHERE attrs ? 'cpu';

-- 任意键存在走索引
SELECT * FROM products WHERE attrs ?| ARRAY['cpu','ram'];

-- 所有键存在走索引
SELECT * FROM products WHERE attrs ?& ARRAY['cpu','ram'];
\`\`\`

> 注意：\`->>\` 取值后再做等值比较（如 \`attrs->>'color' = 'silver'\`）**不会**走 GIN 索引，需要建表达式索引：

\`\`\`sql
CREATE INDEX idx_products_color ON products ((attrs->>'color'));
SELECT * FROM products WHERE attrs->>'color' = 'silver';
\`\`\`

### 13.4.3 全文检索

\`\`\`sql
CREATE TABLE docs (
  id SERIAL PRIMARY KEY,
  body TEXT
);

-- 在 tsvector 上建 GIN 索引
CREATE INDEX idx_docs_body_ts ON docs USING GIN (to_tsvector('simple', body));

-- 全文检索查询
SELECT * FROM docs WHERE to_tsvector('simple', body) @@ to_tsquery('simple', 'postgres & 索引');

-- 中文需要 zhparser 扩展或 pg_jieba
-- CREATE EXTENSION zhparser;
-- CREATE TEXT SEARCH CONFIGURATION chinese (PARSER = zhparser);
-- ALTER TEXT SEARCH CONFIGURATION chinese ADD MAPPING FOR n,v,a,i,j,l WITH simple;
-- CREATE INDEX idx_docs_body_zh ON docs USING GIN (to_tsvector('chinese', body));
\`\`\`

## 13.5 GiST 索引（几何 / 范围 / KNN）

GiST（Generalized Search Tree）是一种平衡树框架，适用于非标准数据类型：几何图形、范围类型、KNN 近邻查询。

\`\`\`sql
-- 几何类型示例
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name TEXT,
  location POINT,
  area POLYGON
);

CREATE INDEX idx_cities_location ON cities USING GIST (location);

-- 查找某点附近的城市（KNN 近邻查询，使用 <-> 距离运算符）
SELECT name, location <-> point(116.4, 39.9) AS distance
FROM cities
ORDER BY location <-> point(116.4, 39.9)
LIMIT 10;

-- 范围类型示例
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  room_id INT,
  during TSTZRANGE
);

CREATE INDEX idx_bookings_during ON bookings USING GIST (during);

-- 查找时间冲突的预订
SELECT * FROM bookings
WHERE during && tstzrange('2024-03-01', '2024-03-05');
\`\`\`

**GiST 与 GIN 的区别**：
- GiST 适合"范围/几何"类查询，索引项是"区间"
- GIN 适合"多值/包含"类查询，索引项是"元素到行"的倒排

## 13.6 BRIN 索引（超大表）

BRIN（Block Range Index，块范围索引）为超大表设计。它不索引每一行，而是记录每个数据块范围（默认 128 个块）的 min/max 值。当数据物理有序时（如按时间插入的时间序列表），BRIN 索引极小且高效。

\`\`\`sql
-- 假设有一张 10 亿行的日志表
CREATE TABLE logs (
  id BIGSERIAL,
  created_at TIMESTAMPTZ,
  level TEXT,
  message TEXT
);

-- B-Tree 索引可能占几十 GB
-- CREATE INDEX idx_logs_created ON logs(created_at);

-- BRIN 索引只占几 MB！
CREATE INDEX idx_logs_created_brin ON logs USING BRIN (created_at);

-- 范围查询走 BRIN
SELECT * FROM logs
WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01';
\`\`\`

**BRIN 适用条件**：
- 表非常大（千万级以上）
- 数据物理有序（按某列递增/递减写入）
- 查询以范围为主

**BRIN 不适用**：
- 数据无序（随机写入），BRIN 几乎失效
- 需要精确点查（等值查询），BRIN 会"过度返回"块

\`\`\`sql
-- 调整块范围大小（默认 128）
CREATE INDEX idx_logs_created_brin ON logs USING BRIN (created_at)
  WITH (pages_per_range = 64);
\`\`\`

## 13.7 SP-GiST 索引

SP-GiST（Space-Partitioned GiST）支持非平衡数据结构，如前缀树、四叉树。适合 IP 地址、电话区号、路由等具有"前缀"或"分区"特征的数据。

\`\`\`sql
-- IP 地址前缀匹配
CREATE TABLE connections (
  id SERIAL PRIMARY KEY,
  ip INET
);

CREATE INDEX idx_connections_ip ON connections USING SPGIST (ip);

SELECT * FROM connections WHERE ip <<= '192.168.0.0/16';
\`\`\`

应用场景较少，了解即可。

## 13.8 部分索引（Partial Index）

部分索引只对满足 \`WHERE\` 条件的行建索引，节省空间且提升索引选择性。

\`\`\`sql
-- 假设 orders 表大部分订单已"完成"，只有少数"待处理"
-- 对"待处理"订单建部分索引，覆盖真正活跃的数据
CREATE INDEX idx_orders_pending ON orders (created_at)
WHERE status = 'pending';

-- 以下查询走索引
SELECT * FROM orders WHERE status = 'pending' AND created_at > '2024-01-01';

-- 以下查询不走索引（条件不匹配）
SELECT * FROM orders WHERE status = 'completed';
\`\`\`

**部分索引的收益**：
- 索引小，占用空间少
- 维护成本低（只对部分行更新）
- 查询命中时选择性高

> 注意：查询的 WHERE 条件必须"包含"索引的 WHERE 条件才能使用部分索引。

## 13.9 表达式索引

当查询对字段做函数/表达式运算时，普通索引会失效。PG 支持在表达式上建索引：

\`\`\`sql
-- 场景：邮箱大小写不敏感查询
SELECT * FROM users WHERE LOWER(email) = 'alice@example.com';

-- 普通索引 idx_users_email 不会生效
-- 建表达式索引
CREATE INDEX idx_users_email_lower ON users (LOWER(email));

-- 现在查询走索引
SELECT * FROM users WHERE LOWER(email) = 'alice@example.com';
\`\`\`

**常见表达式索引场景**：

\`\`\`sql
-- 日期提取
CREATE INDEX idx_orders_created_date ON orders ((created_at::date));
SELECT * FROM orders WHERE created_at::date = '2024-01-01';

-- JSONB 取值
CREATE INDEX idx_products_cpu ON products ((attrs->>'cpu'));
SELECT * FROM products WHERE attrs->>'cpu' = 'M2';

-- 计算字段
CREATE INDEX idx_users_bmi ON users ((weight / POWER(height/100.0, 2)));
SELECT * FROM users WHERE weight / POWER(height/100.0, 2) > 25;
\`\`\`

> 表达式索引的查询条件必须与索引表达式"完全一致"才能命中，包括函数名、参数顺序。

## 13.10 覆盖索引（INCLUDE）

PostgreSQL 11+ 支持覆盖索引（Covering Index），通过 \`INCLUDE\` 子句把额外列附加到索引叶子节点，实现 Index Only Scan 而不回表。

\`\`\`sql
-- 在 users.email 上建索引，并 INCLUDE name 字段
CREATE INDEX idx_users_email_cover ON users (email) INCLUDE (name);

-- 以下查询可以走 Index Only Scan
SELECT email, name FROM users WHERE email = 'alice@example.com';

-- EXPLAIN 输出应显示 "Index Only Scan"
EXPLAIN SELECT email, name FROM users WHERE email = 'alice@example.com';
\`\`\`

**INCLUDE 与复合索引的区别**：
- 复合索引 \`(email, name)\`：\`name\` 参与排序，可用于 WHERE 过滤
- INCLUDE 索引 \`(email) INCLUDE (name)\`：\`name\` 不参与排序，仅附加在叶子，不能用于 WHERE

\`\`\`sql
-- 以下查询在 INCLUDE 索引上无法用 name 过滤
SELECT * FROM users WHERE email = 'a' AND name = 'Alice';
-- 只能走 email 等值，name 在堆上过滤

-- 复合索引 (email, name) 可以走两列
\`\`\`

**选择建议**：
- 需要在第二列做 WHERE 过滤 → 复合索引
- 仅为避免回表，附加列不参与过滤 → INCLUDE

## 13.11 并发创建索引（CONCURRENTLY）

普通 \`CREATE INDEX\` 会阻塞写操作（INSERT/UPDATE/DELETE）。生产环境大表建索引必须用 \`CONCURRENTLY\`：

\`\`\`sql
-- 普通建索引：阻塞写，但快
CREATE INDEX idx_users_age ON users(age);

-- 并发建索引：不阻塞写，但慢且占用更多资源
CREATE INDEX CONCURRENTLY idx_users_age ON users(age);
\`\`\`

**CONCURRENTLY 注意事项**：
- 比普通建索引慢 2-3 倍
- 需要两次扫描表
- 失败后索引会变为 INVALID 状态，需要删除重建

\`\`\`sql
-- 检查是否有失败的无效索引
SELECT indexrelid::regclass AS index_name, indrelid::regclass AS table_name
FROM pg_index WHERE NOT indisvalid;

-- 删除无效索引
DROP INDEX CONCURRENTLY idx_users_age;
-- 重建
CREATE INDEX CONCURRENTLY idx_users_age ON users(age);
\`\`\`

> 生产环境 DBA 铁律：大表建索引一律加 \`CONCURRENTLY\`，否则会引发业务故障。

## 13.12 REINDEX 重建索引

索引长期使用后可能膨胀（bloat），需要重建：

\`\`\`sql
-- 重建单个索引（阻塞写）
REINDEX INDEX idx_users_email;

-- 重建表的全部索引
REINDEX TABLE users;

-- 并发重建（不阻塞写，PG 12+）
REINDEX INDEX CONCURRENTLY idx_users_email;
REINDEX TABLE CONCURRENTLY users;
\`\`\`

**何时需要 REINDEX**：
- 大量 DELETE/UPDATE 后索引膨胀
- 索引页大量空洞，查询变慢
- 索引因 CONCURRENTLY 失败变为 INVALID

## 13.13 EXPLAIN 与索引使用分析

\`\`\`sql
-- 准备测试数据
INSERT INTO users (name, email, age)
SELECT
  'user_' || g,
  'user_' || g || '@example.com',
  (random() * 80 + 10)::INT
FROM generate_series(1, 100000) g;

ANALYZE users;  -- 更新统计信息

-- 查看执行计划
EXPLAIN SELECT * FROM users WHERE email = 'user_5000@example.com';
-- 输出示例：
-- Index Scan using idx_users_email on users  (cost=0.29..8.31 rows=1 width=...)
--   Index Cond: (email = 'user_5000@example.com'::text)

-- 查看实际执行耗时
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user_5000@example.com';
\`\`\`

**EXPLAIN 关键节点**：

| 节点 | 含义 | 性能 |
| --- | --- | --- |
| \`Seq Scan\` | 顺序全表扫描 | 差（小表可接受） |
| \`Index Scan\` | 索引扫描 + 回表 | 良好 |
| \`Index Only Scan\` | 覆盖索引，不回表 | 优秀 |
| \`Bitmap Index Scan\` + \`Bitmap Heap Scan\` | 位图索引扫描 | 中等（适合多行结果） |

\`\`\`sql
-- Index Scan：通过索引定位，再回表取整行
EXPLAIN SELECT * FROM users WHERE email = 'user_5000@example.com';

-- Index Only Scan：覆盖索引，不回表
EXPLAIN SELECT email FROM users WHERE email = 'user_5000@example.com';

-- Bitmap Index Scan：结果集较大时，先在索引上构造位图，再批量取数据
EXPLAIN SELECT * FROM users WHERE age > 50;
\`\`\`

> Index Scan vs Bitmap Scan：结果行数少用 Index Scan，结果行数多用 Bitmap Scan。优化器自动选择。

## 13.14 何时该建索引

**该建索引的场景**：
1. 高频 WHERE 条件字段
2. JOIN 的连接列
3. ORDER BY / GROUP BY 的列
4. 外键列（PG 不会自动为外键建索引！）
5. 唯一约束列

**不该建索引的场景**：
1. 小表（几百行）顺序扫描更快
2. 低选择性字段（如性别、状态）
3. 写多读少的表
4. 极少查询的列

\`\`\`sql
-- 查找未使用的索引（基于 pg_stat_user_indexes）
SELECT
  schemaname, relname, indexrelname,
  idx_scan AS scan_count
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY relname, indexrelname;
\`\`\`

**索引数量经验**：
- OLTP：单表 5-8 个
- OLAP：可以更多，但要监控维护成本
- 每个索引都要评估读写比，写多读少要克制

## 踩坑提示

1. **外键不会自动建索引**：PG 创建外键约束时不会自动为外键列建索引，需要手动创建，否则级联操作和 JOIN 会全表扫描。
2. **CONCURRENTLY 失败要清理**：失败的并发索引变为 INVALID，不会自动删除，需手动 \`DROP INDEX\`。
3. **表达式索引必须严格匹配**：\`LOWER(email)\` 与 \`lower(email)\` 在某些场景下可能不等价，建索引和查询要用完全相同的写法。
4. **GIN 索引维护成本高**：GIN 索引插入慢，可设置 \`fastupdate=on\`（默认开启）延迟合并，但查询会稍慢。
5. **部分索引条件要写进查询**：建了 \`WHERE status='pending'\` 的部分索引，查询必须也带 \`status='pending'\` 才能用。
6. **BRIN 不是万能**：数据无序时 BRIN 几乎无效，反而增加开销。
7. **LIKE 在非 C locale 下不走索引**：默认 locale 可能不支持 LIKE 前缀走索引，可建 \`text_pattern_ops\` 索引：\`CREATE INDEX idx_name ON users(name text_pattern_ops)\`。
8. **统计信息要 ANALYZE**：大量写入后索引选择可能出错，定期 \`ANALYZE\` 更新统计信息。

## 本章小结

- PG 提供 6 种索引类型：B-Tree（默认）、Hash、GIN、GiST、SP-GiST、BRIN
- **B-Tree**：等值、范围、排序；**Hash**：纯等值；**GIN**：JSONB/数组/全文检索；**GiST**：几何/范围/KNN；**BRIN**：超大有序表
- 高级特性：**部分索引**（WHERE 过滤）、**表达式索引**（LOWER/JSONB 取值）、**覆盖索引**（INCLUDE 避免回表）、**CONCURRENTLY**（并发建索引不阻塞写）
- EXPLAIN 关键节点：Seq Scan（全表）、Index Scan（索引+回表）、Index Only Scan（覆盖索引）、Bitmap Scan（批量）
- 生产建索引铁律：大表加 \`CONCURRENTLY\`、外键手动建索引、定期 ANALYZE 维护统计信息
- 索引数量要克制：OLTP 单表 5-8 个，监控 \`pg_stat_user_indexes\` 找出未使用的索引删除`
  },

  // =========================================================
  // 第十四章：事务与 MVCC
  // =========================================================
  {
    id: "pg-ch14",
    group: "第三部分 高级特性",
    icon: "🔄",
    title: "第 14 章 事务与 MVCC",
    content: `# 第 14 章 事务与 MVCC

事务是数据库区别于文件系统的核心特征。PostgreSQL 的事务实现采用 **MVCC（多版本并发控制）**——每行数据保留多个版本，读不阻塞写、写不阻塞读。理解 MVCC 是理解 PG 性能、锁、VACUUM 的前提，也是排查"表膨胀"、"事务 ID 回卷"等运维问题的基石。

本章从 ACID 入门，逐步深入 PG 的 MVCC 实现：tuple 的 xmin/xmax、快照（snapshot）、四种隔离级别、bloat 与 VACUUM、事务 ID 回卷（wraparound）。

## 14.1 ACID 与事务基础

**ACID** 是事务的四大特性：

| 特性 | 含义 | PG 实现 |
| --- | --- | --- |
| **原子性 Atomicity** | 事务要么全做要么全不做 | WAL 日志 + 回滚段 |
| **一致性 Consistency** | 事务前后数据库状态一致 | 约束、触发器、应用层 |
| **隔离性 Isolation** | 并发事务互不干扰 | MVCC + 锁 |
| **持久性 Durability** | 提交后数据不丢 | WAL 日志 + fsync |

**基本事务语法**：

\`\`\`sql
-- 显式事务
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;  -- 或 ROLLBACK 撤销

-- 简写形式
BEGIN WORK;
  -- 语句
COMMIT WORK;

-- PG 14+ 支持 BEGIN 内联事务控制
BEGIN;
  -- 嵌套事务通过 SAVEPOINT
  SAVEPOINT sp1;
    INSERT INTO logs VALUES ('step1');
  RELEASE SAVEPOINT sp1;
COMMIT;
\`\`\`

**SAVEPOINT 嵌套事务**：

\`\`\`sql
BEGIN;
  INSERT INTO orders (id, amount) VALUES (1, 100);

  SAVEPOINT sp1;
    INSERT INTO order_items (order_id, product) VALUES (1, 'A');
    -- 假设这里出错
  ROLLBACK TO SAVEPOINT sp1;  -- 撤销到 sp1，前面的 INSERT orders 保留

  INSERT INTO order_items (order_id, product) VALUES (1, 'B');
COMMIT;
\`\`\`

> PG 默认每条语句自动提交（autocommit），用 \`BEGIN\` 显式开启事务后才需要 \`COMMIT\`。

## 14.2 事务隔离级别

PG 支持四种隔离级别（SQL 标准定义），但实现与标准有差异：

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 序列化异常 |
| --- | --- | --- | --- | --- |
| \`READ UNCOMMITTED\` | 不允许* | 不允许 | 不允许 | 可能 |
| \`READ COMMITTED\`（默认） | 不允许 | 允许 | 允许 | 可能 |
| \`REPEATABLE READ\` | 不允许 | 不允许 | 不允许* | 可能 |
| \`SERIALIZABLE\` | 不允许 | 不允许 | 不允许 | 不允许（通过检测+回滚） |

\* PG 的实现比 SQL 标准更严格：READ UNCOMMITTED 等同于 READ COMMITTED；REPEATABLE READ 不会出现幻读。

\`\`\`sql
-- 设置当前会话隔离级别
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- 或在 BEGIN 时设置
BEGIN ISOLATION LEVEL REPEATABLE READ;
  -- 语句
COMMIT;

-- 设置会话默认隔离级别
SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- 查看当前隔离级别
SHOW transaction_isolation;
\`\`\`

### 14.2.1 READ COMMITTED（默认）

每条语句看到的是该语句开始时已提交的最新数据。同一事务中两次读取可能不同。

\`\`\`sql
-- 会话 A
BEGIN;
  SELECT balance FROM accounts WHERE id = 1;  -- 假设返回 1000

  -- 此时会话 B 执行：UPDATE accounts SET balance = 500 WHERE id = 1; COMMIT;

  SELECT balance FROM accounts WHERE id = 1;  -- 返回 500（看到了 B 的提交）
COMMIT;
\`\`\`

### 14.2.2 REPEATABLE READ

事务开始时的快照贯穿整个事务，多次读取结果一致（即使其他事务已提交）。

\`\`\`sql
-- 会话 A
BEGIN ISOLATION LEVEL REPEATABLE READ;
  SELECT balance FROM accounts WHERE id = 1;  -- 1000

  -- 会话 B 执行：UPDATE accounts SET balance = 500 WHERE id = 1; COMMIT;

  SELECT balance FROM accounts WHERE id = 1;  -- 仍然 1000

  -- 但如果 A 尝试修改这行：
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  -- 会基于 B 的最新值 500 计算 → 结果 400
COMMIT;
\`\`\`

### 14.2.3 SERIALIZABLE

最严格的隔离级别，通过 SSI（Serializable Snapshot Isolation）检测并发冲突，必要时回滚事务。

\`\`\`sql
-- 会话 A
BEGIN ISOLATION LEVEL SERIALIZABLE;
  SELECT COUNT(*) FROM accounts WHERE balance > 1000;  -- 5 行
  -- 此时会话 B 插入一行 balance=2000 并 COMMIT
  INSERT INTO accounts (balance) VALUES (1500);
COMMIT;
-- 如果检测到读写的冲突，PG 会抛出：
-- ERROR: could not serialize access due to read/write dependencies
\`\`\`

> SERIALIZABLE 性能开销大，需应用层处理重试。绝大多数业务用 READ COMMITTED 即可。

## 14.3 MVCC 多版本并发控制

PG 的 MVCC 实现：每次 UPDATE/DELETE 不是修改原数据，而是创建新版本（UPDATE = DELETE + INSERT）。每行（tuple）有两个隐藏字段：

- **xmin**：插入该版本的事务 ID
- **xmax**：删除/更新该版本的事务 ID（0 表示未删除）
- **cmin/cmax**：命令序列号（同一事务内）

\`\`\`sql
-- 查看行的 xmin/xmax
SELECT id, name, xmin, xmax FROM users WHERE id = 1;

-- 假设当前 xmin=1000, xmax=0

-- 在另一个会话中更新
-- UPDATE users SET name = 'Bob' WHERE id = 1;

-- 再查看（旧版本仍在，但 xmax 被标记）
SELECT id, name, xmin, xmax FROM users WHERE id = 1;
-- 新版本：xmin=1001, xmax=0, name='Bob'
\`\`\`

**MVCC 的核心规则**：
- INSERT：创建新 tuple，xmin=当前事务 ID，xmax=0
- DELETE：标记 tuple 的 xmax=当前事务 ID（不立即物理删除）
- UPDATE：标记旧 tuple 的 xmax + 创建新 tuple（相当于 DELETE + INSERT）

**读操作的可见性判断**：
- tuple 的 xmin 已提交，且 xmin 在当前事务快照中可见
- tuple 的 xmax 为 0，或 xmax 未提交，或 xmax 在快照中不可见

\`\`\`sql
-- 演示 MVCC 多版本
CREATE TABLE demo (id INT, val TEXT);
INSERT INTO demo VALUES (1, 'A');

SELECT xmin, xmax, id, val FROM demo;
-- xmin=当前事务ID, xmax=0

UPDATE demo SET val = 'B' WHERE id = 1;

SELECT xmin, xmax, id, val FROM demo;
-- xmin=新事务ID, xmax=0, val='B'（新版本）
-- 旧版本（val='A'）仍物理存在，只是 xmax 被标记，不可见

-- 用 pg_stat_user_tables 查看 dead tuples
SELECT relname, n_live_tup, n_dead_tup
FROM pg_stat_user_tables
WHERE relname = 'demo';
\`\`\`

## 14.4 快照（Snapshot）

快照决定一个事务能看到哪些 tuple 版本。PG 用 \`TransactionXmin\`、\`TransactionXmax\`、\`CommandSeq\` 描述快照。

\`\`\`sql
-- 查看当前事务快照
SELECT txid_current_snapshot();
-- 输出示例：100:105:100,103
-- 含义：xmin=100, xmax=105, in-progress=[100,103]
-- 即：txid<100 的已提交可见，txid>=105 的不可见，100/103 进行中不可见
\`\`\`

**快照导出（用于一致性备份）**：

\`\`\`sql
-- 会话 A
BEGIN ISOLATION LEVEL REPEATABLE READ;
  SELECT pg_export_snapshot();  -- 返回快照 ID，如 '0000000A-00000001-1'

-- 会话 B
BEGIN;
  SET TRANSACTION SNAPSHOT '0000000A-00000001-1';
  -- 此时 B 与 A 共享同一快照，看到相同数据
COMMIT;
\`\`\`

> 这是 \`pg_dump --snapshot\` 实现一致性备份的底层机制。

## 14.5 Bloat（表膨胀）与 VACUUM

MVCC 的代价：旧版本 tuple 不会被立即回收，长期累积导致"表膨胀"——磁盘空间浪费，扫描变慢。

\`\`\`sql
-- 查看表的 dead tuples 数量
SELECT
  relname,
  n_live_tup,
  n_dead_tup,
  ROUND(n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100, 2) AS dead_pct
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
\`\`\`

**VACUUM**：清理 dead tuples，回收空间。

\`\`\`sql
-- 手动 VACUUM 单张表
VACUUM users;

-- VACUUM FULL：物理重建表，回收所有空间（会锁表！）
VACUUM FULL users;

-- VACUUM ANALYZE：清理 + 更新统计信息
VACUUM ANALYZE users;

-- 并行 VACUUM（PG 13+）
VACUUM (PARALLEL 4) users;
\`\`\`

**VACUUM vs VACUUM FULL**：

| 命令 | 锁表 | 回收空间给 OS | 性能 |
| --- | --- | --- | --- |
| \`VACUUM\` | 不锁（可并发读写） | 否（空间留给后续 INSERT） | 快 |
| \`VACUUM FULL\` | 锁表（阻塞读写） | 是 | 慢，但彻底回收 |

**自动 VACUUM（autovacuum）**：

PG 默认开启 autovacuum 后台进程，自动清理 dead tuples：

\`\`\`sql
-- 查看自动 VACUUM 配置
SHOW autovacuum;
SHOW autovacuum_vacuum_threshold;  -- 默认 50
SHOW autovacuum_vacuum_scale_factor;  -- 默认 0.2

-- 含义：当 dead_tuples > 50 + 0.2 * live_tuples 时触发
\`\`\`

**针对大表调整 autovacuum 参数**：

\`\`\`sql
-- 对特定表设置更激进的 autovacuum
ALTER TABLE logs SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_vacuum_threshold = 1000
);
\`\`\`

## 14.6 事务 ID 与回卷（Wraparound）

PG 的事务 ID（xid）是 32 位整数，约 42 亿个。长期运行后 xid 会用完，PG 通过"冻结"（freeze）旧 tuple 来复用 xid。如果冻结跟不上，会触发 **xid wraparound**——数据库为避免数据丢失会强制只读甚至停服。

\`\`\`sql
-- 查看数据库的 xid 年龄
SELECT
  datname,
  age(datfrozenxid) AS xid_age,
  ROUND(100.0 * age(datfrozenxid) / 2000000000, 2) AS wraparound_pct
FROM pg_database
ORDER BY xid_age DESC;
\`\`\`

**关键阈值**：

| xid 年龄 | 含义 |
| --- | --- |
| < 1.5 亿 | 正常，autovacuum 会自动 freeze |
| 1.5 亿 - 10 亿 | autovacuum 加速 freeze |
| > 15 亿 | 警告，需立即 VACUUM |
| > 20 亿 | 强制只读，业务停摆 |

\`\`\`sql
-- 手动强制 freeze
VACUUM FREEZE users;

-- 查看表的冻结情况
SELECT
  relname,
  age(relfrozenxid) AS xid_age,
  pg_size_pretty(pg_total_relation_size(oid)) AS size
FROM pg_class
WHERE relkind = 'r'
ORDER BY xid_age DESC
LIMIT 10;
\`\`\`

> 运维铁律：必须保证 autovacuum 正常运行，监控 xid 年龄，否则会引发 wraparound 灾难。

## 14.7 锁的可见性与事务边界

\`\`\`sql
-- 查看当前活跃事务
SELECT pid, state, transaction_id_snapshot AS snap, xact_start, query
FROM pg_stat_activity
WHERE state != 'idle';

-- 查看锁等待
SELECT
  blocked.pid AS blocked_pid,
  blocked.query AS blocked_query,
  blocking.pid AS blocking_pid,
  blocking.query AS blocking_query
FROM pg_stat_activity blocked
JOIN pg_stat_activity blocking
  ON blocking.pid = ANY(pg_blocking_pids(blocked.pid));
\`\`\`

**长事务的危害**：
1. 阻止 VACUUM 回收 dead tuples（膨胀）
2. 阻止 xid freeze（引发 wraparound）
3. 占用连接和内存
4. 持有锁，阻塞其他事务

\`\`\`sql
-- 查找运行超过 1 小时的事务
SELECT pid, state, xact_start, now() - xact_start AS duration, query
FROM pg_stat_activity
WHERE state != 'idle' AND xact_start < now() - INTERVAL '1 hour';

-- 终止长事务
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE state != 'idle' AND xact_start < now() - INTERVAL '1 hour';
\`\`\`

\`\`\`sql
-- 设置事务超时（PG 17+ 原生支持 statement_timeout 和 idle_in_transaction_session_timeout）
SET idle_in_transaction_session_timeout = '5min';
SET statement_timeout = '30s';
\`\`\`

## 踩坑提示

1. **长事务是万恶之源**：会阻止 VACUUM、引发膨胀、阻塞其他事务。务必设置 \`idle_in_transaction_session_timeout\`。
2. **autovacuum 不能关**：关闭会引发 xid wraparound 灾难，业务停摆。
3. **VACUUM FULL 锁表**：生产环境慎用，建议用 \`pg_repack\` 在线重建表。
4. **REPEATABLE READ 不等于可串行化**：写冲突时仍可能更新丢失，需要业务层处理。
5. **SERIALIZABLE 性能开销大**：会触发大量重试，仅在金融等强一致性场景使用。
6. **MVCC 不等于无锁**：写写冲突仍然需要行锁，UPDATE 同一行会阻塞。
7. **xaсt_start 为 NULL 不一定是空闲**：要看 state 字段判断事务状态。
8. **TRUNCATE 是 DDL 不是 DML**：\`TRUNCATE\` 隐式 COMMIT，无法回滚，且会锁整张表。

## 本章小结

- ACID 是事务四大特性，PG 通过 WAL + MVCC + 锁实现
- PG 支持四种隔离级别，默认 READ COMMITTED；REPEATABLE READ 不会幻读；SERIALIZABLE 通过 SSI 检测冲突
- **MVCC**：每行有 xmin/xmax 两个隐藏字段，UPDATE = DELETE + INSERT，旧版本不立即删除
- **Bloat**：dead tuples 累积导致表膨胀，需 VACUUM 清理；autovacuum 自动处理，但需监控
- **VACUUM** 不锁表但不回收空间给 OS；**VACUUM FULL** 锁表但彻底回收
- **xid wraparound**：32 位 xid 用完前必须 freeze 旧 tuple，否则数据库强制只读
- 监控长事务、xid 年龄、dead tuples 比例是 DBA 日常功课`
  },

  // =========================================================
  // 第十五章：锁与并发控制
  // =========================================================
  {
    id: "pg-ch15",
    group: "第三部分 高级特性",
    icon: "🔒",
    title: "第 15 章 锁与并发控制",
    content: `# 第 15 章 锁与并发控制

MVCC 让 PG 的"读不阻塞写、写不阻塞读"，但写写冲突仍然需要锁。PG 的锁体系分为两层：表级锁（Lock Mode）和行级锁（Row Lock）。此外还有应用层常用的"咨询锁"（Advisory Lock）。理解锁的兼容性矩阵、死锁成因、显式锁定语法，是写出高并发应用的前提。

本章从行级锁讲起，逐步覆盖表级锁、咨询锁、死锁排查、可串行化冲突处理。

## 15.1 行级锁

PG 的行级锁不存储在内存中，而是直接标记在 tuple 的 xmax 字段上，因此即使锁住百万行也不耗内存。

| 行锁模式 | 语法 | 含义 |
| --- | --- | --- |
| \`FOR UPDATE\` | \`SELECT ... FOR UPDATE\` | 锁定行，其他事务不能修改/删除/加锁 |
| \`FOR NO KEY UPDATE\` | \`SELECT ... FOR NO KEY UPDATE\` | 锁定行但允许其他事务修改非键列（ weaker） |
| \`FOR SHARE\` | \`SELECT ... FOR SHARE\` | 共享锁，其他事务只能读不能改 |
| \`FOR NO KEY SHARE\` | \`SELECT ... FOR NO KEY SHARE\` | 弱共享锁，允许 FOR NO KEY UPDATE |

\`\`\`sql
-- 经典场景：转账时锁定账户行
BEGIN;
  -- 锁定账户 1 和 2，防止其他事务同时修改
  SELECT balance FROM accounts WHERE id IN (1, 2) FOR UPDATE;

  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
\`\`\`

**FOR UPDATE 的 NOWAIT 选项**：

\`\`\`sql
-- 不等待，立即失败
BEGIN;
  SELECT * FROM accounts WHERE id = 1 FOR UPDATE NOWAIT;
  -- 如果行已被锁，立即抛出：
  -- ERROR: could not obtain lock on row in relation "accounts"
COMMIT;
\`\`\`

**SKIP LOCKED 跳过已锁行**（PG 9.5+）：

\`\`\`sql
-- 队列模式：取出未处理的任务，跳过被其他 worker 锁住的任务
BEGIN;
  SELECT id FROM tasks
  WHERE status = 'pending'
  ORDER BY id
  FOR UPDATE SKIP LOCKED
  LIMIT 10;

  UPDATE tasks SET status = 'processing', worker = 'worker1'
  WHERE id IN (...);
COMMIT;
\`\`\`

> \`FOR UPDATE SKIP LOCKED\` 是实现高效任务队列的标准模式，避免 worker 互相阻塞。

**FOR UPDATE 与 JOIN**：

\`\`\`sql
-- 默认锁定 JOIN 涉及的所有表
SELECT * FROM orders o JOIN users u ON o.user_id = u.id
WHERE u.age > 18
FOR UPDATE;

-- 只锁定 orders 表
SELECT * FROM orders o JOIN users u ON o.user_id = u.id
WHERE u.age > 18
FOR UPDATE OF o;
\`\`\`

## 15.2 表级锁

PG 有 8 种表级锁模式，从弱到强：

| 锁模式 | 用途 | 典型操作 |
| --- | --- | --- |
| \`ACCESS SHARE\` | 读 | \`SELECT\` |
| \`ROW SHARE\` | 弱写意图 | \`SELECT ... FOR UPDATE\` |
| \`ROW EXCLUSIVE\` | 写 | \`INSERT\`、\`UPDATE\`、\`DELETE\` |
| \`SHARE UPDATE EXCLUSIVE\` | 维护 | \`VACUUM\`、\`ANALYZE\` |
| \`SHARE\` | 共享 | \`CREATE INDEX\`（非并发） |
| \`SHARE ROW EXCLUSIVE\` | 限制写 | 触发器等 |
| \`EXCLUSIVE\` | 排他 | 仅 \`SELECT\` 可并发 |
| \`ACCESS EXCLUSIVE\` | 完全排他 | \`DROP\`、\`TRUNCATE\`、\`ALTER\` |

**显式加表锁**：

\`\`\`sql
-- 显式加表锁（少用，主要用于特殊场景）
BEGIN;
  LOCK TABLE accounts IN SHARE MODE;
  -- 此时其他事务可以读，但不能写
  SELECT SUM(balance) FROM accounts;
COMMIT;

-- 排他锁
BEGIN;
  LOCK TABLE accounts IN ACCESS EXCLUSIVE MODE;
  -- 完全阻塞其他事务的读写
COMMIT;
\`\`\`

> 显式表锁极少使用，绝大多数场景 PG 自动选择正确的锁模式。

**锁兼容性矩阵**（简化）：

|  | ACCESS SHARE | ROW SHARE | ROW EXCL | SHARE | EXCL | ACCESS EXCL |
| --- | --- | --- | --- | --- | --- | --- |
| ACCESS SHARE | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| ROW SHARE | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| ROW EXCL | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| SHARE | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| EXCL | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| ACCESS EXCL | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## 15.3 咨询锁（Advisory Lock）

咨询锁是应用层自定义锁，不与具体行/表绑定，适合分布式协调、限流、防止重复任务执行。

\`\`\`sql
-- 会话级咨询锁（事务结束自动释放）
BEGIN;
  SELECT pg_advisory_lock(12345);
  -- 执行关键操作
  SELECT pg_advisory_unlock(12345);
COMMIT;

-- 事务级咨询锁（事务结束自动释放，无需显式 unlock）
BEGIN;
  SELECT pg_advisory_xact_lock(12345);
  -- 执行关键操作
COMMIT;  -- 锁自动释放

-- 尝试加锁（非阻塞）
SELECT pg_try_advisory_lock(12345);
-- 返回 true 表示加锁成功，false 表示已被占用
\`\`\`

**双整数键 vs 单 bigint 键**：

\`\`\`sql
-- 双整数键（便于按业务分类）
SELECT pg_advisory_lock(table_oid, row_id);

-- 单 bigint 键
SELECT pg_advisory_lock(123456789012345);
\`\`\`

**应用场景**：

\`\`\`sql
-- 1. 防止定时任务重复执行（多个 worker 抢锁）
SELECT pg_try_advisory_lock(1001);
-- 返回 true 的 worker 执行任务，false 的退出

-- 2. 限制某用户操作并发
SELECT pg_advisory_lock(user_id);
-- 用户操作期间持有锁，防止并发重复操作
SELECT pg_advisory_unlock(user_id);

-- 3. 模拟分布式锁（配合应用层）
-- 应用启动时 pg_try_advisory_lock，持有期间作为 master
\`\`\`

> 咨询锁比 Redis 分布式锁更可靠（与数据同库，强一致），但只适用于 PG 内部协调。

## 15.4 死锁（Deadlock）

死锁是两个事务互相等待对方持有的锁，PG 会自动检测并回滚其中一个。

\`\`\`sql
-- 会话 A
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;  -- 锁住 id=1
  -- 等待一会...
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;  -- 想锁 id=2，但被 B 占了

-- 会话 B（并发）
BEGIN;
  UPDATE accounts SET balance = balance - 50 WHERE id = 2;   -- 锁住 id=2
  UPDATE accounts SET balance = balance + 50 WHERE id = 1;   -- 想锁 id=1，但被 A 占了

-- 死锁！PG 检测后回滚其中一个事务：
-- ERROR: deadlock detected
-- DETAIL: Process ... waits for ShareLock on transaction ... blocked by ...
\`\`\`

**避免死锁的最佳实践**：
1. **固定加锁顺序**：所有事务按相同顺序加锁（如按 id 升序）
2. **缩短事务**：尽快提交，减少锁持有时间
3. **批量操作用单语句**：\`UPDATE ... WHERE id IN (1,2,3)\` 比 3 个 UPDATE 更安全

\`\`\`sql
-- ✅ 推荐：按 id 排序加锁
BEGIN;
  SELECT id FROM accounts WHERE id IN (1, 2) ORDER BY id FOR UPDATE;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- ❌ 危险：顺序不确定
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
\`\`\`

**死锁检测**：

PG 默认 \`deadlock_timeout = 1s\`，超过此时间才检测死锁（避免频繁检测开销）。

\`\`\`sql
-- 查看死锁检测配置
SHOW deadlock_timeout;

-- 调整（生产可设为 100ms 更快检测）
SET deadlock_timeout = '100ms';
\`\`\`

## 15.5 锁等待排查

\`\`\`sql
-- 查看当前所有锁
SELECT
  pid,
  locktype,
  relation::regclass AS table_name,
  mode,
  granted,
  query
FROM pg_locks
WHERE relation IS NOT NULL
ORDER BY relation, pid;

-- 查看阻塞关系
SELECT
  blocked.pid AS blocked_pid,
  blocked.query AS blocked_query,
  blocking.pid AS blocking_pid,
  blocking.query AS blocking_query,
  now() - blocked.xact_start AS blocked_duration
FROM pg_stat_activity blocked
JOIN pg_stat_activity blocking
  ON blocking.pid = ANY(pg_blocking_pids(blocked.pid))
WHERE blocked.state != 'idle';

-- 终止阻塞会话
SELECT pg_terminate_backend(blocking_pid)
FROM pg_stat_activity blocked
JOIN pg_stat_activity blocking
  ON blocking.pid = ANY(pg_blocking_pids(blocked.pid));
\`\`\`

**锁等待超时配置**：

\`\`\`sql
-- 设置锁等待超时（默认 0=无限等待）
SET lock_timeout = '5s';
-- 超过 5 秒未拿到锁，语句自动失败：
-- ERROR: canceling statement due to lock timeout
\`\`\`

> 生产环境建议设置 \`lock_timeout\`，避免单条 SQL 长时间持锁拖垮整个服务。

## 15.6 SERIALIZABLE 隔离级别的冲突处理

SERIALIZABLE 隔离级别通过 SSI（Serializable Snapshot Isolation）检测读写冲突，抛出 \`40001\` 错误，应用需重试。

\`\`\`sql
-- 会话 A
BEGIN ISOLATION LEVEL SERIALIZABLE;
  SELECT COUNT(*) FROM accounts WHERE balance > 1000;  -- 读取
  -- 此时会话 B 插入新行并提交
  INSERT INTO audit_log SELECT 'checked', COUNT(*) FROM accounts WHERE balance > 1000;
COMMIT;
-- 可能抛出：
-- ERROR: could not serialize access due to read/write dependencies
-- SQLSTATE: 40001
\`\`\`

**应用层重试模式**（伪代码）：

\`\`\`sql
-- 应用层伪代码（需在客户端实现循环）
-- max_retries = 3
-- for i in 1..max_retries:
--   BEGIN ISOLATION LEVEL SERIALIZABLE;
--     -- 业务逻辑
--   COMMIT;
--   if success: break
--   if error_code == '40001': continue  -- 重试
--   else: raise
\`\`\`

> SERIALIZABLE 适合金融、库存等强一致性场景，但性能开销大，需配合应用层重试逻辑。

## 15.7 行锁与表锁的关系

行锁不会自动升级为表锁（PG 不支持锁升级），但某些操作会同时持有表锁和行锁：

\`\`\`sql
-- INSERT 持有 ROW EXCLUSIVE 表锁 + 行锁
INSERT INTO accounts VALUES (1, 100);

-- UPDATE 持有 ROW EXCLUSIVE 表锁 + 行锁
UPDATE accounts SET balance = 200 WHERE id = 1;

-- SELECT FOR UPDATE 持有 ROW SHARE 表锁 + 行锁
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;

-- ALTER TABLE 持有 ACCESS EXCLUSIVE 表锁（完全阻塞读写）
ALTER TABLE accounts ADD COLUMN note TEXT;
\`\`\`

**DDL 与锁**：

\`\`\`sql
-- 大多数 ALTER TABLE 需要 ACCESS EXCLUSIVE 锁，阻塞所有读写
ALTER TABLE users ADD COLUMN age INT;  -- PG 11+ 仅元数据修改，瞬时完成

-- 添加默认值 + NOT NULL 需要重写表（PG 11+ 优化为瞬时）
ALTER TABLE users ADD COLUMN status INT DEFAULT 0 NOT NULL;

-- 添加默认值（PG 11+ 瞬时完成）
ALTER TABLE users ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
\`\`\`

## 踩坑提示

1. **死锁不可避免但可减少**：固定加锁顺序、缩短事务、批量操作用单语句。
2. **行锁不耗内存**：PG 行锁存在 tuple 上，百万行锁也不影响内存。
3. **SELECT 不加锁**：普通 \`SELECT\` 在 READ COMMITTED 下不加任何锁，靠 MVCC 实现一致性读。
4. **ALTER TABLE 通常锁表**：生产环境用 \`pg_repack\` 或 \`CREATE INDEX CONCURRENTLY\` 等非阻塞工具。
5. **lock_timeout 必须设置**：避免单条 SQL 持锁拖垮服务，建议 5-30 秒。
6. **FOR UPDATE 锁定视图**：\`SELECT ... FOR UPDATE\` 锁定视图底层表的所有行，慎用。
7. **SKIP LOCKED 不是万能**：跳过的行可能永远不被处理，需配合重试机制。
8. **咨询锁不会自动清理**：会话级咨询锁如果忘记 \`pg_advisory_unlock\`，会持续到会话断开。

## 本章小结

- PG 锁分两层：**表级锁**（8 种模式，自动选择）+ **行级锁**（4 种模式，标记在 tuple xmax）
- 行级锁语法：\`FOR UPDATE\`（最强）、\`FOR NO KEY UPDATE\`、\`FOR SHARE\`、\`FOR NO KEY SHARE\`
- \`FOR UPDATE SKIP LOCKED\` 是实现任务队列的标准模式
- **咨询锁**（\`pg_advisory_lock\`）用于应用层协调，分会话级和事务级
- **死锁**自动检测（默认 1s），固定加锁顺序可避免
- 排查工具：\`pg_locks\`、\`pg_stat_activity\`、\`pg_blocking_pids()\`、\`pg_terminate_backend()\`
- 生产配置：\`lock_timeout\` 防止持锁过久，\`idle_in_transaction_session_timeout\` 防止长事务
- SERIALIZABLE 隔离级别会抛出 40001 错误，应用层需重试`
  },

  // =========================================================
  // 第十六章：视图与物化视图
  // =========================================================
  {
    id: "pg-ch16",
    group: "第三部分 高级特性",
    icon: "👁️",
    title: "第 16 章 视图与物化视图",
    content: `# 第 16 章 视图与物化视图

视图（View）是逻辑上的"虚拟表"，物化视图（Materialized View）是物理上的"缓存表"。PG 的视图支持可更新（updatable）、\`WITH CHECK OPTION\`；物化视图支持 \`REFRESH\`、\`REFRESH CONCURRENTLY\`、唯一索引。这两者是简化复杂查询、缓存计算结果的利器。

本章从基础语法讲起，逐步深入可更新视图、物化视图刷新机制、并发刷新、典型应用场景。

## 16.1 创建视图

视图本质是一条命名的 SELECT 语句，每次查询视图时执行底层 SQL。

\`\`\`sql
-- 准备演示数据
CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  department TEXT,
  salary NUMERIC(10, 2),
  manager_id BIGINT,
  hire_date DATE
);

INSERT INTO employees (name, department, salary, manager_id, hire_date) VALUES
  ('Alice', 'Engineering', 25000, NULL, '2020-01-15'),
  ('Bob', 'Engineering', 18000, 1, '2021-03-20'),
  ('Charlie', 'Sales', 15000, 1, '2021-06-10'),
  ('Dave', 'Sales', 12000, 3, '2022-01-05'),
  ('Eve', 'Engineering', 22000, 1, '2020-09-01');

-- 创建简单视图
CREATE VIEW v_engineers AS
SELECT id, name, salary, hire_date
FROM employees
WHERE department = 'Engineering';

-- 查询视图
SELECT * FROM v_engineers;
SELECT name, salary FROM v_engineers WHERE salary > 20000;
\`\`\`

**视图的好处**：
1. **简化复杂查询**：把多表 JOIN、子查询封装成视图
2. **权限控制**：只暴露部分列给用户
3. **抽象层**：底层表结构变化时视图可保持兼容

\`\`\`sql
-- 复杂视图：JOIN + 聚合
CREATE VIEW v_dept_stats AS
SELECT
  department,
  COUNT(*) AS employee_count,
  AVG(salary) AS avg_salary,
  MAX(salary) AS max_salary,
  MIN(salary) AS min_salary
FROM employees
GROUP BY department;

SELECT * FROM v_dept_stats;

-- 带计算字段的视图
CREATE VIEW v_emp_summary AS
SELECT
  e.id,
  e.name,
  e.department,
  e.salary,
  e.salary - AVG(e.salary) OVER (PARTITION BY e.department) AS salary_diff_from_dept_avg,
  m.name AS manager_name
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
\`\`\`

**修改和删除视图**：

\`\`\`sql
-- 修改视图定义（保留依赖关系）
CREATE OR REPLACE VIEW v_engineers AS
SELECT id, name, salary, hire_date, department
FROM employees
WHERE department = 'Engineering';

-- 重命名视图
ALTER VIEW v_engineers RENAME TO v_engineering;

-- 修改视图所有者
ALTER VIEW v_engineering OWNER TO hr_user;

-- 设置视图列名
ALTER VIEW v_engineering RENAME COLUMN hire_date TO join_date;

-- 删除视图
DROP VIEW v_engineering;
DROP VIEW IF EXISTS v_engineering CASCADE;  -- 级联删除依赖视图
\`\`\`

> \`CREATE OR REPLACE VIEW\` 要求新视图的列与旧视图兼容（列数、列名、数据类型），否则需先 \`DROP\` 再创建。

## 16.2 可更新视图（Updatable View）

PG 的视图默认就是"可更新"的——只要视图直接映射到一张底层表，就可以通过视图 INSERT/UPDATE/DELETE。

**可更新视图的条件**：
1. FROM 子句只包含一张表
2. 视图列直接引用底层表列（无表达式、聚合、DISTINCT、GROUP BY、HAVING、LIMIT）
3. 视图列不包含窗口函数

\`\`\`sql
-- 简单视图是可更新的
CREATE VIEW v_engineers AS
SELECT id, name, salary, hire_date
FROM employees
WHERE department = 'Engineering';

-- 通过视图 INSERT
INSERT INTO v_engineers (id, name, salary, hire_date)
VALUES (10, 'Frank', 20000, '2023-01-01');
-- 实际插入 employees 表，但 department 不会被自动设为 'Engineering'

-- 通过视图 UPDATE
UPDATE v_engineers SET salary = 26000 WHERE name = 'Alice';

-- 通过视图 DELETE
DELETE FROM v_engineers WHERE name = 'Bob';

-- 查看视图是否可更新
SELECT table_name, is_updatable, is_insertable
FROM information_schema.views
WHERE table_name = 'v_engineers';
\`\`\`

**WITH CHECK OPTION**：限制通过视图写入的数据必须满足视图 WHERE 条件。

\`\`\`sql
-- 不带 CHECK OPTION：可以写入视图看不见的行
INSERT INTO v_engineers (id, name, salary, hire_date, department)
VALUES (11, 'Grace', 20000, '2023-01-01', 'Sales');
-- 插入成功，但 SELECT * FROM v_engineers 看不到（department='Sales'）

-- 带 LOCAL CHECK OPTION：写入数据必须满足本视图 WHERE
CREATE OR REPLACE VIEW v_engineers_local AS
SELECT id, name, salary, hire_date, department
FROM employees
WHERE department = 'Engineering'
WITH LOCAL CHECK OPTION;

INSERT INTO v_engineers_local (id, name, salary, hire_date, department)
VALUES (12, 'Heidi', 20000, '2023-01-01', 'Sales');
-- 报错：new row violates check option for view "v_engineers_local"

-- 带 CASCADED CHECK OPTION：同时检查底层视图的条件
CREATE VIEW v_engineers_with_salary AS
SELECT id, name, salary, hire_date, department
FROM v_engineers_local
WHERE salary > 15000
WITH CASCADED CHECK OPTION;

-- 写入时同时检查 department='Engineering' 和 salary>15000
INSERT INTO v_engineers_with_salary (id, name, salary, hire_date, department)
VALUES (13, 'Ivan', 20000, '2023-01-01', 'Engineering');
-- 成功
\`\`\`

> \`WITH CHECK OPTION\` 是数据安全的重要工具：通过视图操作的数据必须满足视图定义的条件，防止"绕过视图写入脏数据"。

## 16.3 创建物化视图

物化视图把视图查询结果**物理存储**，查询时直接读取缓存数据，不重新计算。适合"查询昂贵、数据更新不频繁"的场景。

\`\`\`sql
-- 创建物化视图
CREATE MATERIALIZED VIEW mv_dept_stats AS
SELECT
  department,
  COUNT(*) AS employee_count,
  AVG(salary) AS avg_salary,
  MAX(salary) AS max_salary
FROM employees
GROUP BY department;

-- 查询物化视图（直接读缓存，速度极快）
SELECT * FROM mv_dept_stats;

-- 物化视图可以建索引
CREATE INDEX idx_mv_dept_stats_dept ON mv_dept_stats(department);
\`\`\`

**物化视图 vs 普通视图**：

| 特性 | 普通视图 | 物化视图 |
| --- | --- | --- |
| 存储 | 不存储，每次查询重算 | 物理存储查询结果 |
| 实时性 | 实时反映底层表变化 | 需手动/定期刷新 |
| 查询性能 | 与底层 SQL 相同 | 通常远快于普通视图 |
| 可更新 | 默认可更新 | 不可直接更新（需 REFRESH） |
| 索引 | 不能建索引 | 可建索引 |

## 16.4 刷新物化视图

\`\`\`sql
-- 刷新物化视图（全量重建）
REFRESH MATERIALIZED VIEW mv_dept_stats;

-- 刷新时清除原有数据，期间查询会失败
-- PG 9.4+ 支持并发刷新
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dept_stats;
\`\`\`

**REFRESH vs REFRESH CONCURRENTLY**：

| 模式 | 锁 | 前提条件 | 性能 |
| --- | --- | --- | --- |
| \`REFRESH\` | 阻塞查询 | 无 | 快 |
| \`REFRESH CONCURRENTLY\` | 不阻塞查询 | 必须有唯一索引 | 慢（需额外空间） |

\`\`\`sql
-- CONCURRENTLY 前提：物化视图必须有至少一个 UNIQUE 索引
CREATE UNIQUE INDEX idx_mv_dept_stats_dept_unique ON mv_dept_stats(department);

-- 现在可以并发刷新
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dept_stats;
\`\`\`

**定时刷新物化视图**：

\`\`\`sql
-- 使用 pg_cron 扩展定时刷新
-- CREATE EXTENSION pg_cron;
-- SELECT cron.schedule('refresh_dept_stats', '0 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dept_stats');
\`\`\`

> 应用层也可用定时任务（如 Node.js cron、Celery）触发刷新。

**WITH DATA vs WITH NO DATA**：

\`\`\`sql
-- 创建时不立即填充数据（首次查询前必须 REFRESH）
CREATE MATERIALIZED VIEW mv_complex_stats WITH NO DATA AS
SELECT /* 复杂的聚合查询 */;

-- 手动刷新填充
REFRESH MATERIALIZED VIEW mv_complex_stats;
\`\`\`

## 16.5 物化视图应用场景

### 16.5.1 缓存昂贵聚合

\`\`\`sql
-- 假设有一张亿级订单表，按用户聚合很慢
CREATE MATERIALIZED VIEW mv_user_order_stats AS
SELECT
  user_id,
  COUNT(*) AS order_count,
  SUM(amount) AS total_amount,
  AVG(amount) AS avg_amount,
  MAX(created_at) AS last_order_time
FROM orders
GROUP BY user_id;

CREATE UNIQUE INDEX idx_mv_user_order_stats ON mv_user_order_stats(user_id);

-- 应用查询直接走物化视图，毫秒级响应
SELECT * FROM mv_user_order_stats WHERE user_id = 12345;

-- 每小时刷新一次
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_order_stats;
\`\`\`

### 16.5.2 跨库/跨服务器报表

\`\`\`sql
-- 使用 postgres_fdw 查询远程表，结果物化到本地
-- CREATE EXTENSION postgres_fdw;
-- CREATE SERVER remote_db FOREIGN DATA WRAPPER postgres_fdw ...;
-- CREATE FOREIGN TABLE remote_orders (...) SERVER remote_db;

CREATE MATERIALIZED VIEW mv_remote_orders AS
SELECT * FROM remote_orders WHERE created_at >= '2024-01-01';

-- 定期同步远程数据到本地，加速报表查询
\`\`\`

### 16.5.3 增量物化视图（PG 14+ 有限支持）

PG 14 开始支持增量物化视图（IMMV），但功能有限，多数场景仍需全量刷新。第三方扩展 \`pg_ivm\` 提供完整增量物化视图支持。

\`\`\`sql
-- pg_ivm 扩展（需安装）
-- CREATE EXTENSION pg_ivm;
-- SELECT create_immv('mv_incremental', 'SELECT user_id, COUNT(*) FROM orders GROUP BY user_id');
-- 底层表变化时自动增量更新，无需 REFRESH
\`\`\`

## 16.6 视图与权限

\`\`\`sql
-- 授予视图查询权限（不需要授予底层表权限）
GRANT SELECT ON v_engineers TO hr_role;

-- 用户查询视图时，PG 检查视图权限，不检查底层表
-- 前提：视图所有者必须有底层表权限
\`\`\`

**视图所有者与权限链**：

\`\`\`sql
-- 场景：DBA 拥有 employees 表，HR 角色只能查看 Engineering 部门
CREATE VIEW v_engineers AS
SELECT id, name, salary FROM employees WHERE department = 'Engineering';

-- DBA 授权 HR 查询视图
GRANT SELECT ON v_engineers TO hr_role;

-- HR 用户查询视图（无 employees 表权限也能查询）
-- 因为视图所有者（DBA）有 employees 权限
\`\`\`

> 视图是"行级/列级权限控制"的轻量替代方案，比设置 RL（Row Level Security）更直观。

## 16.7 视图的依赖关系

视图依赖于底层表，修改底层表结构时需注意：

\`\`\`sql
-- 删除被视图依赖的表会失败
DROP TABLE employees;
-- ERROR: cannot drop table employees because other objects depend on it
-- DETAIL: view v_engineers depends on table employees

-- 强制删除（级联）
DROP TABLE employees CASCADE;
-- 视图 v_engineers 也会被删除
\`\`\`

**修改底层表列**：

\`\`\`sql
-- 添加列：不影响视图
ALTER TABLE employees ADD COLUMN email TEXT;

-- 删除列：视图引用该列会失败
ALTER TABLE employees DROP COLUMN salary;
-- ERROR: cannot drop column salary because view v_engineers depends on it

-- 重命名列：PG 不会自动更新视图定义，需手动处理
ALTER TABLE employees RENAME COLUMN salary TO base_salary;
-- 视图 v_engineers 仍然引用 salary，查询会失败
\`\`\`

## 踩坑提示

1. **物化视图不自动刷新**：必须手动 \`REFRESH\` 或定时任务触发，业务要能接受数据延迟。
2. **CONCURRENTLY 需要唯一索引**：没有唯一索引不能用并发刷新，会报错。
3. **视图性能不一定好**：复杂视图嵌套视图可能生成糟糕的执行计划，必要时展开重写。
4. **WITH CHECK OPTION 防绕过**：可更新视图不带 CHECK OPTION 可能写入"视图看不见"的数据。
5. **物化视图占空间**：每个物化视图都是一份完整数据副本，注意磁盘占用。
6. **视图依赖链复杂**：修改底层表结构时要检查视图依赖，\`CASCADE\` 删除会一并删除视图。
7. **CREATE OR REPLACE VIEW 限制**：只能增加列在末尾，不能删除/重排/修改列类型。
8. **物化视图不能直接 UPDATE**：只能通过 \`REFRESH\` 刷新，不能像普通视图那样写入。

## 本章小结

- **普通视图**：命名的 SELECT 语句，不存储数据，每次查询重算
- **可更新视图**：直接映射单表的视图默认可 INSERT/UPDATE/DELETE
- **WITH CHECK OPTION**：限制通过视图写入的数据必须满足视图条件（LOCAL/CASCADED）
- **物化视图**：物理存储查询结果，适合缓存昂贵聚合、跨库报表
- **刷新**：\`REFRESH MATERIALIZED VIEW\`（阻塞）vs \`REFRESH CONCURRENTLY\`（不阻塞，需唯一索引）
- 视图用于简化查询和权限控制；物化视图用于缓存计算结果，需权衡实时性与性能
- 典型场景：报表聚合、跨库同步、行级权限替代方案`
  },

  // =========================================================
  // 第十七章：触发器
  // =========================================================
  {
    id: "pg-ch17",
    group: "第三部分 高级特性",
    icon: "⚡",
    title: "第 17 章 触发器",
    content: `# 第 17 章 触发器

触发器（Trigger）是在 INSERT/UPDATE/DELETE 时自动执行的特殊函数。PG 触发器功能强大：支持 BEFORE/AFTER/INSTEAD OF 三种时机、行级（FOR EACH ROW）和语句级（FOR EACH STATEMENT）两种粒度、可在视图上定义（INSTEAD OF）、支持 transition tables（行变更集合）。

本章从基础语法讲起，覆盖触发器函数编写（PL/pgSQL）、典型应用场景（验证、审计、视图更新）、transition tables、以及何时应该避免触发器。

## 17.1 触发器基础

PG 的触发器分两步定义：
1. **触发器函数**（Trigger Function）：用 PL/pgSQL 编写，返回 \`trigger\` 类型
2. **触发器**（Trigger）：绑定到具体表，指定时机、事件、粒度

\`\`\`sql
-- 准备演示表
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 步骤 1：定义触发器函数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS \$\$
BEGIN
  -- NEW 是即将插入/更新的行记录
  NEW.updated_at = NOW();
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

-- 步骤 2：创建触发器
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
\`\`\`

**触发器时机与事件**：

| 时机 | 事件 | 行为 |
| --- | --- | --- |
| \`BEFORE\` | INSERT/UPDATE/DELETE/TRUNCATE | 在操作前执行，可修改 NEW 记录、阻止操作 |
| \`AFTER\` | INSERT/UPDATE/DELETE/TRUNCATE | 在操作后执行，常用于审计、级联操作 |
| \`INSTEAD OF\` | INSERT/UPDATE/DELETE（仅视图） | 替代原操作，用于让视图可写 |

**触发器粒度**：

\`\`\`sql
-- 行级触发器：每行触发一次
CREATE TRIGGER trg_log_changes
  AFTER UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION log_changes();

-- 语句级触发器：每条语句触发一次（即使影响 0 行）
CREATE TRIGGER trg_audit_statement
  AFTER UPDATE ON products
  FOR EACH STATEMENT
  EXECUTE FUNCTION audit_statement();
\`\`\`

**NEW 和 OLD 记录**：

| 事件 | NEW | OLD |
| --- | --- | --- |
| INSERT | 新插入的行 | 不可用 |
| UPDATE | 更新后的行 | 更新前的行 |
| DELETE | 不可用 | 删除前的行 |

\`\`\`sql
-- 触发器函数中访问 NEW/OLD
CREATE OR REPLACE FUNCTION log_changes() RETURNS trigger AS \$\$
BEGIN
  INSERT INTO change_log(table_name, operation, old_data, new_data)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN row_to_json(OLD) END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN row_to_json(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
\$\$ LANGUAGE plpgsql;
\`\`\`

## 17.2 BEFORE INSERT 触发器：数据验证

BEFORE 触发器可以在数据写入前修改 NEW 记录或直接拒绝操作。

\`\`\`sql
-- 场景：价格不能为负，库存不能小于 0
CREATE OR REPLACE FUNCTION validate_product()
RETURNS trigger AS \$\$
BEGIN
  -- 修改 NEW 记录（自动修正）
  IF NEW.price < 0 THEN
    NEW.price = 0;
  END IF;

  IF NEW.stock < 0 THEN
    NEW.stock = 0;
  END IF;

  -- 直接拒绝操作（抛异常）
  IF NEW.name IS NULL OR NEW.name = '' THEN
    RAISE EXCEPTION '产品名称不能为空';
  END IF;

  RETURN NEW;  -- 返回 NEW 表示继续操作；返回 NULL 表示取消
END;
\$\$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_product
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION validate_product();

-- 测试
INSERT INTO products (name, price, stock) VALUES ('Test', -10, -5);
-- price 会被修正为 0，stock 修正为 0

INSERT INTO products (name, price, stock) VALUES ('', 100, 10);
-- 抛出异常：产品名称不能为空
\`\`\`

> BEFORE 触发器返回 NULL 会取消该行操作（不报错，但数据不写入）。

## 17.3 AFTER UPDATE 触发器：审计日志

AFTER 触发器在数据写入后执行，常用于审计、级联操作。不能修改 NEW 记录。

\`\`\`sql
-- 创建审计表
CREATE TABLE products_audit (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL,
  operation TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by TEXT DEFAULT current_user,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 审计触发器函数
CREATE OR REPLACE FUNCTION audit_product()
RETURNS trigger AS \$\$
BEGIN
  INSERT INTO products_audit(product_id, operation, old_data, new_data)
  VALUES (
    NEW.id,
    TG_OP,
    CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) END,
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

-- AFTER 触发器
CREATE TRIGGER trg_audit_product
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION audit_product();

-- 测试
UPDATE products SET price = 199.99 WHERE id = 1;

-- 查看审计日志
SELECT * FROM products_audit ORDER BY changed_at DESC LIMIT 5;
\`\`\`

> 注意：审计触发器必须用 AFTER，因为 BEFORE 时数据还未写入表，审计的"新值"可能不是最终值。

## 17.4 INSTEAD OF 触发器：让视图可写

普通可更新视图有限制（必须直接映射单表、无聚合等）。INSTEAD OF 触发器可以让任意复杂视图支持写入。

\`\`\`sql
-- 创建一个复杂视图（不可直接更新）
CREATE VIEW v_product_summary AS
SELECT
  id,
  name,
  price,
  stock,
  CASE WHEN stock > 0 THEN 'in_stock' ELSE 'out_of_stock' END AS status
FROM products;

-- 尝试通过视图 UPDATE 会失败（因为有 CASE 表达式）
-- UPDATE v_product_summary SET price = 200 WHERE id = 1;  -- 报错

-- 用 INSTEAD OF 触发器实现
CREATE OR REPLACE FUNCTION update_product_summary()
RETURNS trigger AS \$\$
BEGIN
  -- 把视图的 UPDATE 转发到底层表
  UPDATE products
  SET name = NEW.name, price = NEW.price, stock = NEW.stock
  WHERE id = NEW.id;
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

CREATE TRIGGER trg_v_product_summary_update
  INSTEAD OF UPDATE ON v_product_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_product_summary();

-- 现在可以通过视图更新
UPDATE v_product_summary SET price = 200 WHERE id = 1;
\`\`\`

**INSTEAD OF INSERT/DELETE**：

\`\`\`sql
CREATE OR REPLACE FUNCTION insert_product_summary()
RETURNS trigger AS \$\$
BEGIN
  INSERT INTO products (name, price, stock)
  VALUES (NEW.name, NEW.price, NEW.stock);
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

CREATE TRIGGER trg_v_product_summary_insert
  INSTEAD OF INSERT ON v_product_summary
  FOR EACH ROW
  EXECUTE FUNCTION insert_product_summary();

-- 通过视图插入
INSERT INTO v_product_summary (name, price, stock) VALUES ('New Product', 50, 100);
\`\`\`

## 17.5 Transition Tables（变更集合）

PG 10+ 支持 transition tables：把一次操作影响的所有行作为一个"临时表"传给触发器函数，便于批量处理。

\`\`\`sql
-- 语法：REFERENCING NEW TABLE AS new_rows OLD TABLE AS old_rows
CREATE OR REPLACE FUNCTION log_bulk_changes()
RETURNS trigger AS \$\$
BEGIN
  -- NEW_TABLE 包含所有新行，OLD_TABLE 包含所有旧行
  INSERT INTO bulk_audit(operation, old_data, new_data, changed_at)
  SELECT
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(o) END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(n) END,
    NOW()
  FROM new_rows n FULL JOIN old_rows o ON n.id = o.id;

  RETURN NULL;  -- 语句级触发器返回 NULL
END;
\$\$ LANGUAGE plpgsql;

-- 创建带 transition tables 的语句级触发器
CREATE TRIGGER trg_bulk_audit
  AFTER INSERT OR UPDATE OR DELETE ON products
  REFERENCING NEW TABLE AS new_rows OLD TABLE AS old_rows
  FOR EACH STATEMENT
  EXECUTE FUNCTION log_bulk_changes();

-- 批量操作只触发一次，但能访问所有变更行
UPDATE products SET price = price * 1.1 WHERE stock > 0;
\`\`\`

> Transition tables 适合批量审计、同步到外部系统等场景，避免行级触发器的多次调用开销。

## 17.6 触发器管理

\`\`\`sql
-- 查看表的触发器
SELECT
  tgname AS trigger_name,
  tgtype,
  tgenabled,
  pg_get_triggerdef(oid) AS definition
FROM pg_trigger
WHERE tgrelid = 'products'::regclass
  AND NOT tgisinternal;

-- 简单方式
\d+ products

-- 启用/禁用触发器
ALTER TABLE products DISABLE TRIGGER trg_audit_product;
ALTER TABLE products ENABLE TRIGGER trg_audit_product;

-- 禁用所有触发器（影响复制，慎用）
ALTER TABLE products DISABLE TRIGGER ALL;
ALTER TABLE products ENABLE TRIGGER ALL;

-- 修改触发器（重命名）
ALTER TRIGGER trg_audit_product ON products RENAME TO trg_product_audit;

-- 删除触发器
DROP TRIGGER trg_audit_product ON products;
\`\`\`

**触发器与复制**：

\`\`\`sql
-- ENABLE REPLICA：仅在复制会话中触发
ALTER TABLE products ENABLE REPLICA TRIGGER trg_audit_product;

-- ENABLE ALWAYS：始终触发（包括复制会话）
ALTER TABLE products ENABLE ALWAYS TRIGGER trg_audit_product;
\`\`\`

## 17.7 条件触发器（WHEN）

PG 支持给触发器加 WHEN 条件，仅满足条件时触发：

\`\`\`sql
-- 仅当 stock 字段变化时触发
CREATE TRIGGER trg_log_stock_change
  AFTER UPDATE ON products
  FOR EACH ROW
  WHEN (OLD.stock IS DISTINCT FROM NEW.stock)
  EXECUTE FUNCTION log_stock_change();

-- 仅当价格下调时触发
CREATE TRIGGER trg_log_price_drop
  AFTER UPDATE ON products
  FOR EACH ROW
  WHEN (NEW.price < OLD.price)
  EXECUTE FUNCTION log_price_drop();
\`\`\`

> WHEN 条件不能包含子查询，但可以用 \`IS DISTINCT FROM\` 处理 NULL 比较。

## 17.8 触发器函数中的特殊变量

\`\`\`sql
CREATE OR REPLACE FUNCTION show_trigger_vars()
RETURNS trigger AS \$\$
BEGIN
  RAISE NOTICE 'TG_NAME: %', TG_NAME;            -- 触发器名
  RAISE NOTICE 'TG_WHEN: %', TG_WHEN;            -- BEFORE/AFTER/INSTEAD OF
  RAISE NOTICE 'TG_LEVEL: %', TG_LEVEL;          -- ROW/STATEMENT
  RAISE NOTICE 'TG_OP: %', TG_OP;                -- INSERT/UPDATE/DELETE/TRUNCATE
  RAISE NOTICE 'TG_TABLE_NAME: %', TG_TABLE_NAME;
  RAISE NOTICE 'TG_TABLE_SCHEMA: %', TG_TABLE_SCHEMA;
  RAISE NOTICE 'TG_NARGS: %', TG_NARGS;          -- 参数个数
  RAISE NOTICE 'TG_ARGV[0]: %', TG_ARGV[0];      -- 第一个参数
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

-- 创建带参数的触发器
CREATE TRIGGER trg_show_vars
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION show_trigger_vars('param1', 'param2');
\`\`\`

## 17.9 何时避免触发器

触发器强大但易被滥用。以下场景**不推荐**用触发器：

**1. 业务逻辑不该放触发器**

\`\`\`sql
-- ❌ 反例：订单状态流转逻辑放触发器
CREATE TRIGGER trg_order_status_flow
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION enforce_status_flow();
-- 问题：业务逻辑分散，调试困难，新人难以理解

-- ✅ 推荐：业务逻辑放应用层，触发器只做"数据完整性"和"审计"
\`\`\`

**2. 性能敏感场景**

\`\`\`sql
-- ❌ 反例：批量 UPDATE 时触发行级触发器 N 次
UPDATE products SET price = price * 1.1;  -- 100 万行触发 100 万次
-- 改用语句级触发器 + transition tables
\`\`\`

**3. 跨表/跨库同步**

\`\`\`sql
-- ❌ 反例：用触发器同步数据到外部系统
CREATE TRIGGER trg_sync_to_redis
  AFTER UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION sync_to_redis();
-- 问题：外部调用失败会导致事务回滚，影响主业务
-- ✅ 推荐：用 CDC（如 Debezium）或消息队列异步同步
\`\`\`

**4. 复杂级联操作**

\`\`\`sql
-- ❌ 反例：触发器链 A→B→C→A，引发递归
-- ✅ 推荐：用外键 ON DELETE CASCADE 或应用层显式控制
\`\`\`

**触发器适用场景**：
- 自动维护 \`updated_at\` 字段
- 审计日志（AFTER 触发器）
- 复杂数据验证（BEFORE 触发器）
- 物化视图维护（高级用法）
- 视图可写（INSTEAD OF 触发器）

## 踩坑提示

1. **BEFORE 返回 NULL 取消操作**：\`BEFORE\` 触发器返回 NULL 会静默取消该行操作，不报错，难以排查。
2. **AFTER 触发器失败会回滚事务**：AFTER 触发器抛异常会回滚整个事务，包括主操作。
3. **触发器顺序不确定**：同一表多个同类触发器的执行顺序未定义（按名字字母序），不要依赖顺序。
4. **行级触发器性能差**：批量操作时每行触发，改用语句级 + transition tables。
5. **INSTEAD OF 仅用于视图**：普通表不能用 \`INSTEAD OF\`，要用 BEFORE/AFTER。
6. **触发器递归**：触发器内 UPDATE 同一表会再次触发触发器，需用 \`pg_trigger_depth()\` 防护。
7. **禁用触发器影响复制**：\`DISABLE TRIGGER ALL\` 会同时禁用复制触发器，生产慎用。
8. **触发器函数不能有参数**：函数定义时 \`RETURNS trigger\` 不带参数，参数通过 \`TG_ARGV\` 访问。

## 本章小结

- 触发器分两步：定义**触发器函数**（PL/pgSQL，返回 trigger）+ 创建**触发器**（绑定表）
- 三种时机：**BEFORE**（可修改 NEW、阻止操作）、**AFTER**（审计/级联）、**INSTEAD OF**（视图可写）
- 两种粒度：**FOR EACH ROW**（每行触发）、**FOR EACH STATEMENT**（每语句触发）
- **NEW/OLD** 记录：INSERT 有 NEW，DELETE 有 OLD，UPDATE 两者都有
- **Transition Tables**（PG 10+）：把变更行集合传给语句级触发器，适合批量处理
- **WHEN 条件**：仅满足条件时触发，优化性能
- 适用场景：自动维护字段、审计日志、数据验证、视图可写
- 避免场景：复杂业务逻辑、性能敏感、跨系统同步、递归级联`
  },

  // =========================================================
  // 第十八章：存储过程与函数 PL/pgSQL
  // =========================================================
  {
    id: "pg-ch18",
    group: "第三部分 高级特性",
    icon: "📦",
    title: "第 18 章 存储过程与函数 PL/pgSQL",
    content: `# 第 18 章 存储过程与函数 PL/pgSQL

PL/pgSQL 是 PostgreSQL 的过程式语言，支持变量声明、控制结构（IF/CASE/LOOP/WHILE/FOR）、异常处理、动态 SQL，能把复杂业务逻辑封装到数据库内执行。PG 11+ 区分**函数**（FUNCTION，可在 SQL 中调用）和**存储过程**（PROCEDURE，用 CALL 调用，支持事务控制）。

本章系统讲解 PL/pgSQL 语法：函数与过程的区别、参数模式、变量与类型、控制结构、动态 SQL、异常处理、触发器函数。

## 18.1 函数与存储过程的区别

PG 11+ 引入 \`CREATE PROCEDURE\`，与 \`CREATE FUNCTION\` 的关键区别：

| 特性 | FUNCTION | PROCEDURE |
| --- | --- | --- |
| 调用方式 | \`SELECT func()\` 或 SQL 中调用 | \`CALL proc()\` |
| 返回值 | 必须有 RETURNS | 可无返回值 |
| 事务控制 | 不能 COMMIT/ROLLBACK | 可以 COMMIT/ROLLBACK |
| 在 SQL 中使用 | 可以（\`SELECT func()\`） | 不可以 |
| 参数模式 | IN/OUT/INOUT/VARIADIC | IN/OUT/INOUT/VARIADIC |

\`\`\`sql
-- 函数：返回值，可在 SQL 中调用
CREATE FUNCTION add(a INT, b INT) RETURNS INT AS \$\$
BEGIN
  RETURN a + b;
END;
\$\$ LANGUAGE plpgsql;

-- 调用
SELECT add(1, 2);  -- 返回 3
SELECT * FROM users WHERE id = add(1, 2);

-- 存储过程：可控制事务
CREATE PROCEDURE transfer(from_id INT, to_id INT, amount NUMERIC) AS \$\$
BEGIN
  UPDATE accounts SET balance = balance - amount WHERE id = from_id;
  UPDATE accounts SET balance = balance + amount WHERE id = to_id;
  COMMIT;  -- 过程内可以提交
END;
\$\$ LANGUAGE plpgsql;

-- 调用
CALL transfer(1, 2, 100);
\`\`\`

> 经验：需要事务控制（中间提交/回滚）用 PROCEDURE；需要在 SQL 中作为表达式用 FUNCTION。

## 18.2 CREATE FUNCTION 基础

\`\`\`sql
-- 最简单的函数
CREATE FUNCTION hello(name TEXT) RETURNS TEXT AS \$\$
BEGIN
  RETURN 'Hello, ' || name || '!';
END;
\$\$ LANGUAGE plpgsql;

SELECT hello('World');  -- Hello, World!

-- 使用 SQL 语言（无 PL/pgSQL 控制结构，但更快）
CREATE FUNCTION get_user_count() RETURNS BIGINT AS \$\$
  SELECT COUNT(*) FROM users;
\$\$ LANGUAGE sql;

SELECT get_user_count();

-- 带默认参数
CREATE FUNCTION greet(name TEXT, greeting TEXT DEFAULT 'Hello') RETURNS TEXT AS \$\$
BEGIN
  RETURN greeting || ', ' || name;
END;
\$\$ LANGUAGE plpgsql;

SELECT greet('Alice');              -- Hello, Alice
SELECT greet('Alice', 'Hi');        -- Hi, Alice
SELECT greet(name => 'Bob');        -- 命名参数
\`\`\`

**函数定义语法要素**：

\`\`\`sql
CREATE [OR REPLACE] FUNCTION 函数名(参数列表)
RETURNS 返回类型
AS \$\$
-- 函数体
\$\$ LANGUAGE plpgsql
[IMMUTABLE | STABLE | VOLATILE]       -- 函数易变性
[STRICT]                              -- 参数为 NULL 时直接返回 NULL，不执行函数体
[SECURITY DEFINER | SECURITY INVOKER] -- 权限上下文
[COST n]                              -- 执行成本估算（优化器用）
[ROWS n];                             -- 返回行数估算
\`\`\`

## 18.3 参数模式：IN / OUT / INOUT

\`\`\`sql
-- IN：输入参数（默认）
-- OUT：输出参数（通过返回值返回）
-- INOUT：既是输入也是输出
-- VARIADIC：可变参数

CREATE FUNCTION compute_stats(
  IN base NUMERIC,
  IN rate NUMERIC,
  OUT doubled NUMERIC,
  OUT powered NUMERIC,
  INOUT counter INT DEFAULT 0
) AS \$\$
BEGIN
  doubled := base * 2;
  powered := base ^ rate;
  counter := counter + 1;
END;
\$\$ LANGUAGE plpgsql;

-- OUT/INOUT 参数通过返回记录返回
SELECT * FROM compute_stats(10, 2, 0);
-- doubled=20, powered=100, counter=1

-- VARIADIC：可变参数
CREATE FUNCTION sum_all(VARIADIC nums INT[]) RETURNS INT AS \$\$
DECLARE
  total INT := 0;
BEGIN
  FOREACH nums SLICE 0 LOOP
    total := total + nums;
  END LOOP;
  RETURN total;
END;
\$\$ LANGUAGE plpgsql;

SELECT sum_all(1, 2, 3, 4, 5);  -- 15
\`\`\`

## 18.4 变量声明与数据类型

\`\`\`sql
CREATE FUNCTION demo_variables() RETURNS VOID AS \$\$
DECLARE
  -- 基本类型
  user_id BIGINT;
  user_name TEXT := 'default';        -- 声明并赋值
  age INT DEFAULT 0;

  -- 引用表列类型
  emp_salary employees.salary%TYPE;

  -- 行类型（整行）
  emp_record employees%ROWTYPE;

  -- 自定义记录
  user_info RECORD;

  -- 常量
  max_retry CONSTANT INT := 3;

  -- 复合类型
  point STRUCTURE (x INT, y INT);  -- 需先 CREATE TYPE
BEGIN
  -- 赋值
  user_id := 100;
  emp_salary := 25000.00;

  -- 从表读取整行
  SELECT * INTO emp_record FROM employees WHERE id = 1;

  -- 使用记录字段
  RAISE NOTICE '员工: %, 薪资: %', emp_record.name, emp_record.salary;
END;
\$\$ LANGUAGE plpgsql;
\`\`\`

**变量作用域**：内部块可以访问外部变量，但同名变量会遮蔽（shadow）。

\`\`\`sql
CREATE FUNCTION scope_demo() RETURNS INT AS \$\$
DECLARE
  x INT := 1;
BEGIN
  DECLARE
    x INT := 2;  -- 遮蔽外层 x
  BEGIN
    RAISE NOTICE '内层 x: %', x;       -- 2
    RAISE NOTICE '外层 x: %', outer.x; -- 1（用标签引用）
  END;

  RAISE NOTICE '外层 x: %', x;         -- 1
  RETURN x;
END;
\$\$ LANGUAGE plpgsql;
\`\`\`

## 18.5 控制结构

### 18.5.1 IF 语句

\`\`\`sql
CREATE FUNCTION classify_age(age INT) RETURNS TEXT AS \$\$
BEGIN
  IF age < 0 THEN
    RETURN '无效';
  ELSIF age < 18 THEN
    RETURN '未成年';
  ELSIF age < 60 THEN
    RETURN '成年';
  ELSE
    RETURN '老年';
  END IF;
END;
\$\$ LANGUAGE plpgsql;
\`\`\`

### 18.5.2 CASE 语句

\`\`\`sql
CREATE FUNCTION get_grade(score INT) RETURNS TEXT AS \$\$
BEGIN
  CASE
    WHEN score >= 90 THEN RETURN 'A';
    WHEN score >= 80 THEN RETURN 'B';
    WHEN score >= 70 THEN RETURN 'C';
    WHEN score >= 60 THEN RETURN 'D';
    ELSE RETURN 'F';
  END CASE;

  -- 简单 CASE
  CASE score
    WHEN 100 THEN RETURN '满分';
    WHEN 0 THEN RETURN '零分';
    ELSE NULL;
  END CASE;
END;
\$\$ LANGUAGE plpgsql;
\`\`\`

### 18.5.3 LOOP / WHILE / FOR

\`\`\`sql
CREATE FUNCTION sum_to(n INT) RETURNS INT AS \$\$
DECLARE
  total INT := 0;
  i INT := 1;
BEGIN
  -- 无限循环 + EXIT
  LOOP
    total := total + i;
    i := i + 1;
    EXIT WHEN i > n;
  END LOOP;

  RETURN total;
END;
\$\$ LANGUAGE plpgsql;

-- WHILE 循环
CREATE FUNCTION sum_while(n INT) RETURNS INT AS \$\$
DECLARE
  total INT := 0;
  i INT := 1;
BEGIN
  WHILE i <= n LOOP
    total := total + i;
    i := i + 1;
  END LOOP;
  RETURN total;
END;
\$\$ LANGUAGE plpgsql;

-- FOR 循环（整数）
CREATE FUNCTION sum_for(n INT) RETURNS INT AS \$\$
DECLARE
  total INT := 0;
BEGIN
  FOR i IN 1..n LOOP
    total := total + i;
  END LOOP;
  RETURN total;
END;
\$\$ LANGUAGE plpgsql;

-- FOR 循环（反向）
CREATE FUNCTION sum_reverse(n INT) RETURNS INT AS \$\$
DECLARE
  total INT := 0;
BEGIN
  FOR i IN REVERSE n..1 LOOP
    total := total + i;
  END LOOP;
  RETURN total;
END;
\$\$ LANGUAGE plpgsql;

-- FOR 循环（遍历查询结果）
CREATE FUNCTION log_all_users() RETURNS VOID AS \$\$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id, name FROM users LOOP
    RAISE NOTICE '用户 ID: %, 名字: %', user_record.id, user_record.name;
  END LOOP;
END;
\$\$ LANGUAGE plpgsql;
\`\`\`

### 18.5.4 CONTINUE 与 EXIT

\`\`\`sql
CREATE FUNCTION sum_even_to(n INT) RETURNS INT AS \$\$
DECLARE
  total INT := 0;
BEGIN
  FOR i IN 1..n LOOP
    -- 跳过奇数
    CONTINUE WHEN i % 2 != 0;
    total := total + i;
  END LOOP;
  RETURN total;
END;
\$\$ LANGUAGE plpgsql;
\`\`\`

## 18.6 RETURN 与返回结果集

\`\`\`sql
-- 返回单值
CREATE FUNCTION get_user_name(uid BIGINT) RETURNS TEXT AS \$\$
DECLARE
  result TEXT;
BEGIN
  SELECT name INTO result FROM users WHERE id = uid;
  RETURN result;
END;
\$\$ LANGUAGE plpgsql;

-- 返回多行（SETOF）
CREATE FUNCTION get_active_users() RETURNS SETOF users AS \$\$
BEGIN
  RETURN QUERY SELECT * FROM users WHERE active = true;
END;
\$\$ LANGUAGE plpgsql;

SELECT * FROM get_active_users();

-- 返回自定义记录
CREATE FUNCTION get_user_summary(uid BIGINT)
RETURNS TABLE(id BIGINT, name TEXT, order_count INT, total_amount NUMERIC) AS \$\$
BEGIN
  RETURN QUERY
  SELECT u.id, u.name, COUNT(o.id), COALESCE(SUM(o.amount), 0)
  FROM users u
  LEFT JOIN orders o ON o.user_id = u.id
  WHERE u.id = uid
  GROUP BY u.id, u.name;
END;
\$\$ LANGUAGE plpgsql;

SELECT * FROM get_user_summary(1);
\`\`\`

## 18.7 动态 SQL（EXECUTE）

\`\`\`sql
CREATE FUNCTION count_table(table_name TEXT) RETURNS BIGINT AS \$\$
DECLARE
  result BIGINT;
BEGIN
  -- 拼接 SQL 并执行
  EXECUTE 'SELECT COUNT(*) FROM ' || table_name INTO result;
  RETURN result;
END;
\$\$ LANGUAGE plpgsql;

SELECT count_table('users');
\`\`\`

**防止 SQL 注入**：用 \`USING\` 传参，不要拼接用户输入。

\`\`\`sql
CREATE FUNCTION safe_query(table_name TEXT, min_age INT) RETURNS SETOF RECORD AS \$\$
BEGIN
  -- ❌ 危险：直接拼接用户输入
  -- EXECUTE 'SELECT * FROM ' || table_name || ' WHERE age > ' || min_age;

  -- ✅ 安全：用 quote_ident 处理标识符，用 USING 传值
  EXECUTE format('SELECT * FROM %I WHERE age > $1', table_name)
  USING min_age;

  -- 或用 quote_ident
  -- EXECUTE 'SELECT * FROM ' || quote_ident(table_name) || ' WHERE age > $1'
  -- USING min_age;
END;
\$\$ LANGUAGE plpgsql;

-- 动态表名 + 动态列
CREATE FUNCTION dynamic_query(t_name TEXT, col_name TEXT, val TEXT)
RETURNS SETOF RECORD AS \$\$
BEGIN
  RETURN QUERY EXECUTE format(
    'SELECT * FROM %I WHERE %I = $1',
    t_name, col_name
  ) USING val;
END;
\$\$ LANGUAGE plpgsql;
\`\`\`

> 铁律：动态 SQL 永远用 \`format('%I', ...)\` 处理标识符、\`format('%L', ...)\` 处理字面量，或用 \`USING\` 传参，绝不直接拼接。

## 18.8 异常处理（EXCEPTION）

\`\`\`sql
CREATE FUNCTION safe_divide(a NUMERIC, b NUMERIC) RETURNS NUMERIC AS \$\$
BEGIN
  RETURN a / b;
EXCEPTION
  WHEN division_by_zero THEN
    RAISE NOTICE '除零错误，返回 0';
    RETURN 0;
  WHEN OTHERS THEN
    RAISE NOTICE '其他错误: %', SQLERRM;
    RETURN NULL;
END;
\$\$ LANGUAGE plpgsql;

SELECT safe_divide(10, 0);  -- 返回 0，输出通知
\`\`\`

**自定义异常**：

\`\`\`sql
CREATE FUNCTION validate_age(age INT) RETURNS VOID AS \$\$
BEGIN
  IF age < 0 OR age > 150 THEN
    RAISE EXCEPTION '年龄必须在 0-150 之间，当前: %', age
      USING ERRCODE = '22023',  -- invalid_parameter_value
            HINT = '请检查输入的年龄值';
  END IF;
END;
\$\$ LANGUAGE plpgsql;

-- 捕获自定义异常
CREATE FUNCTION test_age(age INT) RETURNS TEXT AS \$\$
BEGIN
  PERFORM validate_age(age);
  RETURN 'OK';
EXCEPTION
  WHEN invalid_parameter_value THEN
    RETURN '参数错误: ' || SQLERRM;
END;
\$\$ LANGUAGE plpgsql;
\`\`\`

**事务子回滚**：EXCEPTION 块创建一个子事务，异常时回滚到块开始。

\`\`\`sql
CREATE FUNCTION insert_with_log(user_name TEXT) RETURNS BIGINT AS \$\$
DECLARE
  new_id BIGINT;
BEGIN
  INSERT INTO users (name) VALUES (user_name) RETURNING id INTO new_id;

  BEGIN
    -- 子事务：写日志失败不影响主操作
    INSERT INTO logs(action, target) VALUES ('insert_user', user_name);
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '日志写入失败，但不影响主操作: %', SQLERRM;
  END;

  RETURN new_id;
END;
\$\$ LANGUAGE plpgsql;
\`\`\`

## 18.9 GET DIAGNOSTICS

\`\`\`sql
CREATE FUNCTION delete_and_count(uid BIGINT) RETURNS INT AS \$\$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM orders WHERE user_id = uid;

  -- 获取受影响行数
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RAISE NOTICE '删除了 % 条订单', deleted_count;
  RETURN deleted_count;
END;
\$\$ LANGUAGE plpgsql;

-- 其他诊断项
CREATE FUNCTION show_diagnostics() RETURNS VOID AS \$\$
DECLARE
  row_count INT;
  result_oid OID;
BEGIN
  INSERT INTO users (name) VALUES ('test');
  GET DIAGNOSTICS row_count = ROW_COUNT, result_oid = RESULT_OID;
  RAISE NOTICE '影响行数: %, OID: %', row_count, result_oid;
END;
\$\$ LANGUAGE plpgsql;
\`\`\`

## 18.10 函数易变性（VOLATILE / STABLE / IMMUTABLE）

| 类别 | 含义 | 优化器行为 |
| --- | --- | --- |
| \`VOLATILE\`（默认） | 每次调用结果可能不同 | 每行都调用 |
| \`STABLE\` | 同一事务内结果不变 | 可缓存 |
| \`IMMUTABLE\` | 相同输入永远相同输出 | 可用于索引、可缓存 |

\`\`\`sql
-- IMMUTABLE：纯函数，可建表达式索引
CREATE FUNCTION celsius_to_fahrenheit(c NUMERIC) RETURNS NUMERIC
AS \$\$
BEGIN
  RETURN c * 9 / 5 + 32;
END;
\$\$ LANGUAGE plpgsql IMMUTABLE;

-- 在 IMMUTABLE 函数上建索引
CREATE INDEX idx_temps_f ON temps (celsius_to_fahrenheit(temp_c));

-- STABLE：查询中结果不变
CREATE FUNCTION get_user_role(uid BIGINT) RETURNS TEXT
AS \$\$
BEGIN
  SELECT role INTO result FROM users WHERE id = uid;
  RETURN result;
END;
\$\$ LANGUAGE plpgsql STABLE;

-- VOLATILE：涉及随机、时间、修改数据
CREATE FUNCTION now_str() RETURNS TEXT
AS \$\$
BEGIN
  RETURN NOW()::TEXT;
END;
\$\$ LANGUAGE plpgsql VOLATILE;
\`\`\`

> 错误标注易变性会导致优化器做出错误决策。函数只读用 STABLE，纯计算用 IMMUTABLE，修改数据或随机/时间用 VOLATILE。

## 18.11 触发器函数

触发器函数是 PL/pgSQL 的特殊应用，返回 \`trigger\` 类型：

\`\`\`sql
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS trigger AS \$\$
BEGIN
  -- 只有 UPDATE 时才设置 updated_at
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at := NOW();
  END IF;

  -- 自动填充 created_at
  IF TG_OP = 'INSERT' AND NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;

  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

-- 绑定到表
CREATE TRIGGER trg_users_timestamps
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trg_set_updated_at();
\`\`\`

## 18.12 存储过程与事务控制

\`\`\`sql
CREATE PROCEDURE batch_import_users(user_list TEXT[]) AS \$\$
DECLARE
  i INT := 1;
  batch_size INT := 100;
  total INT := array_length(user_list, 1);
BEGIN
  WHILE i <= total LOOP
    BEGIN
      INSERT INTO users (name)
      SELECT user_list[g] FROM generate_series(i, LEAST(i + batch_size - 1, total)) g;

      COMMIT;  -- 每 100 条提交一次
      RAISE NOTICE '已导入 % / %', LEAST(i + batch_size - 1, total), total;
    EXCEPTION
      WHEN OTHERS THEN
        ROLLBACK;  -- 出错回滚当前批次，继续下一批
        RAISE WARNING '批次 % 失败: %', i, SQLERRM;
    END;

    i := i + batch_size;
  END LOOP;
END;
\$\$ LANGUAGE plpgsql;

-- 调用
CALL batch_import_users(ARRAY['user1','user2','user3', ...]);
\`\`\`

> PROCEDURE 内的 COMMIT/ROLLBACK 是 PG 11+ 的关键能力，FUNCTION 无法实现。

## 18.13 权限与 SECURITY DEFINER

\`\`\`sql
-- 默认 SECURITY INVOKER：以调用者权限执行
-- SECURITY DEFINER：以函数所有者权限执行（可跨越权限边界）

CREATE FUNCTION get_admin_count() RETURNS INT
AS \$\$
BEGIN
  RETURN (SELECT COUNT(*) FROM admin_users);
END;
\$\$ LANGUAGE plpgsql
SECURITY DEFINER              -- 以函数所有者权限执行
SET search_path = public, pg_temp;  -- 固定 search_path，防止注入

-- 授权
GRANT EXECUTE ON FUNCTION get_admin_count() TO public;
\`\`\`

> SECURITY DEFINER 是危险特性：必须固定 \`search_path\` 防止"搜索路径劫持"攻击。

## 踩坑提示

1. **函数不能控制事务**：FUNCTION 内不能 COMMIT/ROLLBACK，需要事务控制用 PROCEDURE。
2. **VOLATILE 默认值影响性能**：纯计算函数标注 IMMUTABLE 可大幅提升性能（可建索引、可缓存）。
3. **动态 SQL 必须防注入**：用 \`format('%I', ...)\` 和 \`USING\`，绝不直接拼接。
4. **SECURITY DEFINER 要固定 search_path**：否则攻击者可通过创建同名表劫持函数。
5. **STRICT 函数跳过 NULL**：参数有 NULL 时不执行函数体直接返回 NULL，需显式处理 NULL 时不要加 STRICT。
6. **PL/pgSQL 性能不如纯 SQL**：能用 SQL 表达的不要用 PL/pgSQL，前者优化器能更好优化。
7. **函数内 SELECT INTO 找不到行不报错**：变量保持原值，需用 \`FOUND\` 或 \`IS NOT NULL\` 检查。
8. **OUT 参数和 RETURNS 冲突**：有 OUT 参数时 RETURNS 应为 RECORD 或指定 TABLE 类型。

## 本章小结

- **FUNCTION vs PROCEDURE**：函数可在 SQL 中调用、必须有返回值、不能控制事务；过程用 CALL 调用、可控制事务
- **参数模式**：IN（输入）、OUT（输出）、INOUT（双向）、VARIADIC（可变）
- **变量声明**：基本类型、\`%TYPE\`（引用列类型）、\`%ROWTYPE\`（行类型）、RECORD（动态记录）、CONSTANT（常量）
- **控制结构**：IF/ELSIF/ELSE、CASE WHEN、LOOP/EXIT、WHILE、FOR（整数和查询结果）、CONTINUE
- **动态 SQL**：用 \`EXECUTE\` + \`format('%I', ...)\` + \`USING\` 防注入
- **异常处理**：EXCEPTION 块创建子事务，可捕获特定错误码；\`RAISE EXCEPTION\` 抛出自定义异常
- **GET DIAGNOSTICS**：获取 ROW_COUNT、RESULT_OID 等执行信息
- **易变性**：IMMUTABLE（可建索引）、STABLE（事务内不变）、VOLATILE（默认，每次执行）
- **SECURITY DEFINER**：以所有者权限执行，必须固定 search_path

至此，《PostgreSQL 实战教程》第三部分（高级特性）结束。从索引、事务、锁、视图到触发器、存储过程，这些是 PG 高级开发的核心知识，掌握后足以应对复杂的业务场景。`
  }
];

export { chapters };
