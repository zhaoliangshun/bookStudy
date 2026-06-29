// =============================================================
// 数据库开发教程 —— 第四批章节（索引与性能篇，共 5 章）
// -------------------------------------------------------------
// 本批聚焦"让查询快起来"：索引原理、执行计划、优化策略、查询技巧、监控调优。
// 所有 code 字段均可在 sqlite3 内存数据库中直接运行。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：索引基础
  // =========================================================
  {
    id: "sql-index",
    group: "索引与性能",
    icon: "📇",
    title: "索引基础",
    content: `## 索引基础

没有索引的表就像一本没有目录的书——找一个词要逐页翻。索引是数据库的"目录"，让查询从 O(n) 变成 O(log n)。

### 一、索引是什么

索引是一种**独立于表数据的辅助数据结构**，存储"列值 → 行位置"的映射，用空间换时间。

**类比**：
- 表数据 = 书的正文
- 索引 = 书后面的关键词索引
- 查询 = 先查索引找到页码，再翻到正文

### 二、索引的数据结构

| 结构 | 特点 | 支持 | 适用 |
| --- | --- | --- | --- |
| **B-Tree** | 平衡多路搜索树，范围查询友好 | 所有数据库 | 通用（默认） |
| **B+Tree** | B-Tree 变种，数据只在叶子节点，叶子用链表相连 | MySQL/PostgreSQL | 范围查询、排序 |
| **Hash** | 哈希表，O(1) 但只支持等值 | Memory引擎/PostgreSQL | 等值查询 |
| **倒排索引** | 词 → 文档列表 | 全文索引 | 全文搜索 |

**SQLite 默认用 B-Tree**，主键和 UNIQUE 列自动建索引。

### 三、CREATE INDEX 语法

\`\`\`sql
-- 单列索引
CREATE INDEX idx_name ON users(name);

-- 复合索引（多列）
CREATE INDEX idx_dept_age ON employees(department, age);

-- 唯一索引（值不能重复）
CREATE UNIQUE INDEX idx_email ON users(email);

-- 部分索引（只索引满足条件的行，SQLite 3.8+）
CREATE INDEX idx_active ON users(name) WHERE status = 'active';

-- 表达式索引（对表达式建索引）
CREATE INDEX idx_lower_name ON users(LOWER(name));
\`\`\`

### 四、最左前缀原则（复合索引核心）

复合索引 \`(a, b, c)\` 实际上相当于建了 \`(a)\`、\`(a, b)\`、\`(a, b, c)\` 三个索引。查询必须从最左列开始才能命中：

| 查询条件 | 是否命中 \`(a,b,c)\` |
| --- | --- |
| \`WHERE a = 1\` | ✅ 命中 |
| \`WHERE a = 1 AND b = 2\` | ✅ 命中 |
| \`WHERE a = 1 AND b = 2 AND c = 3\` | ✅ 命中 |
| \`WHERE b = 2\` | ❌ 不命中（缺最左列 a） |
| \`WHERE b = 2 AND c = 3\` | ❌ 不命中 |
| \`WHERE a = 1 AND c = 3\` | ⚠️ 部分命中（只用 a） |

### 五、索引的代价

索引不是越多越好：

1. **占空间**：索引大小可能超过表本身
2. **写变慢**：每次 INSERT/UPDATE/DELETE 都要同步更新索引
3. **优化器负担**：索引太多，查询优化器选择变慢

**经验法则**：一张表 5-8 个索引是上限，多了要审视。

### 六、何时建索引

**该建索引的列**：
- WHERE 高频查询条件
- JOIN 连接列（外键）
- ORDER BY / GROUP BY 列
- 需要唯一约束的列

**不该建索引的列**：
- 数据量小（< 1000 行，全表扫描更快）
- 写多读少的列
- 区分度低的列（如性别，只有男/女）

### 七、索引选择性

选择性 = 不同值的数量 / 总行数。选择性越高，索引越有效。

\`\`\`sql
-- 查选择性
SELECT
  COUNT(DISTINCT status) * 1.0 / COUNT(*) AS status_selectivity,
  COUNT(DISTINCT email) * 1.0 / COUNT(*) AS email_selectivity
FROM users;
-- status 选择性 0.001（低，不适合建索引）
-- email 选择性 0.99（高，适合建索引）
\`\`\`

**经验值**：选择性 > 0.3 才值得建索引。

### 八、SQLite 自动索引

SQLite 会自动为以下情况建索引：
- \`PRIMARY KEY\`（INTEGER PRIMARY KEY 除外，它是 rowid）
- \`UNIQUE\` 约束

手动建的索引在 \`sqlite_master\` 表可查：
\`\`\`sql
SELECT name, tbl_name FROM sqlite_master WHERE type = 'index';
\`\`\`

### 九、踩坑点

**坑 1：建了索引却没用上**
\`\`\`sql
-- 索引失效的常见原因
WHERE name LIKE '%abc%'      -- 左模糊，索引失效
WHERE UPPER(name) = 'ABC'    -- 函数包裹列，索引失效
WHERE name = 123              -- 隐式类型转换，索引失效
\`\`\`

**坑 2：过度索引**
\`\`\`sql
-- 每个查询条件都建索引 → 写入性能崩
CREATE INDEX idx1 ON t(a);
CREATE INDEX idx2 ON t(b);
CREATE INDEX idx3 ON t(a, b);  -- idx1 冗余了
\`\`\`

**坑 3：忘记删废弃索引**
表结构变化后旧索引可能无用，要定期清理。

### 十、生产建议

1. **索引命名规范**：\`idx_表_列\` 或 \`idx_表_用途\`
2. **复合索引列顺序**：等值条件在前，范围条件在后
3. **定期 ANALYZE**：让优化器知道数据分布
4. **监控未使用索引**：定期查 \`sqlite_stat1\` 或数据库的索引使用统计

下面代码演示索引的创建、使用和效果。`,
    code: `-- ============================================================
-- 第一章演示：索引基础
-- ============================================================

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT,
  department TEXT,
  status TEXT DEFAULT 'active'
);

-- 插入测试数据
WITH RECURSIVE seq(n) AS (
  SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n < 1000
)
INSERT INTO users (name, email, department, status)
SELECT
  'user_' || n,
  'user' || n || '@example.com',
  CASE n % 3 WHEN 0 THEN '技术部' WHEN 1 THEN '市场部' ELSE '人事部' END,
  CASE WHEN n % 10 = 0 THEN 'inactive' ELSE 'active' END
FROM seq;

SELECT '总行数:' AS info, COUNT(*) AS cnt FROM users;

-- 1. 无索引查询（全表扫描）
SELECT '1. 无索引查询（全表扫描）:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = 'user500@example.com';

-- 2. 建单列索引
CREATE INDEX idx_email ON users(email);
SELECT '2. 有索引查询:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = 'user500@example.com';

-- 3. 复合索引与最左前缀
CREATE INDEX idx_dept_status ON users(department, status);

SELECT '3. 复合索引命中（dept+status）:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM users WHERE department = '技术部' AND status = 'active';

SELECT '3. 复合索引部分命中（只查dept）:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM users WHERE department = '技术部';

SELECT '3. 复合索引未命中（只查status,跳过dept）:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM users WHERE status = 'active';

-- 4. 唯一索引
CREATE UNIQUE INDEX idx_email_unique ON users(email);
SELECT '4. 唯一索引建好，email 唯一:' AS info;

-- 5. 部分索引（只索引活跃用户）
CREATE INDEX idx_active_names ON users(name) WHERE status = 'active';
SELECT '5. 部分索引（只索引 active 用户）:' AS info;
EXPLAIN QUERY PLAN SELECT name FROM users WHERE status = 'active' AND name = 'user500';

-- 6. 索引选择性分析
SELECT '6. 索引选择性:' AS info;
SELECT
  ROUND(COUNT(DISTINCT department) * 100.0 / COUNT(*), 2) AS dept_选择性,
  ROUND(COUNT(DISTINCT email) * 100.0 / COUNT(*), 2) AS email_选择性,
  ROUND(COUNT(DISTINCT status) * 100.0 / COUNT(*), 2) AS status_选择性
FROM users;

-- 7. 查看所有索引
SELECT '7. 当前所有索引:' AS info;
SELECT name, tbl_name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'users';

-- 8. 删除索引
DROP INDEX idx_email;
SELECT '8. 删除 idx_email 后:' AS info;
SELECT count(*) AS 剩余索引数 FROM sqlite_master WHERE type = 'index' AND tbl_name = 'users';`,
  },

  // =========================================================
  // 第二章：EXPLAIN 执行计划
  // =========================================================
  {
    id: "sql-explain",
    group: "索引与性能",
    icon: "🔬",
    title: "EXPLAIN 执行计划",
    content: `## EXPLAIN 执行计划

\`EXPLAIN\` 是数据库的"X 光机"——告诉你一条 SQL **会怎么执行**，是性能调优的核心工具。

### 一、EXPLAIN 的两种模式

\`\`\`sql
-- 模式 1：EXPLAIN（显示虚拟机指令，SQLite 特有）
EXPLAIN SELECT * FROM users WHERE id = 1;

-- 模式 2：EXPLAIN QUERY PLAN（显示执行计划摘要，推荐）
EXPLAIN QUERY PLAN SELECT * FROM users WHERE id = 1;
\`\`\`

**建议**：日常用 \`EXPLAIN QUERY PLAN\`，输出简洁易读。

### 二、读懂 SQLite 执行计划

\`EXPLAIN QUERY PLAN\` 输出包含关键字，反映执行方式：

| 关键字 | 含义 | 性能 |
| --- | --- | --- |
| \`SCAN\` | 全表扫描 | ❌ 慢（大数据量） |
| \`SEARCH\` | 索引查找 | ✅ 快 |
| \`SEARCH ... USING INDEX\` | 用指定索引查找 | ✅ 快 |
| \`SEARCH ... USING COVERING INDEX\` | 覆盖索引，无需回表 | ✅✅ 最快 |
| \`AUTOMATIC COVERING INDEX\` | 自动建临时索引 | ⚠️ 首次慢 |

### 三、SCAN vs SEARCH

\`\`\`sql
-- 无索引：SCAN（全表扫描）
EXPLAIN QUERY PLAN SELECT * FROM users WHERE name = 'Alice';
-- 输出: SCAN users

-- 有索引：SEARCH（索引查找）
CREATE INDEX idx_name ON users(name);
EXPLAIN QUERY PLAN SELECT * FROM users WHERE name = 'Alice';
-- 输出: SEARCH users USING INDEX idx_name (name=?)
\`\`\`

**全表扫描的代价**：表 100 万行，扫描 100 万行；有索引只需查 3-4 次（B-Tree 高度）。

### 四、覆盖索引（Covering Index）

查询的所有列都在索引里，无需回表取数据：

\`\`\`sql
-- 索引包含 name 和 email
CREATE INDEX idx_name_email ON users(name, email);

-- 查询只需 name 和 email → 覆盖索引
EXPLAIN QUERY PLAN SELECT name, email FROM users WHERE name = 'Alice';
-- 输出: SEARCH users USING COVERING INDEX idx_name_email (name=?)
\`\`\`

**覆盖索引的优势**：少一次"回表"IO，速度提升 2-5 倍。

### 五、JOIN 的执行计划

\`\`\`sql
EXPLAIN QUERY PLAN
SELECT * FROM orders o JOIN users u ON o.user_id = u.id WHERE u.name = 'Alice';
\`\`\`

SQLite 默认用 **Nested Loop Join**（嵌套循环）：
- 外层循环遍历 \`users\`（用索引找 name='Alice'）
- 内层循环对每个 user 查 \`orders\`（用索引找 user_id）

### 六、不同数据库的 EXPLAIN

| 数据库 | 语法 | 输出特点 |
| --- | --- | --- |
| **SQLite** | \`EXPLAIN QUERY PLAN\` | 简洁文本 |
| **MySQL** | \`EXPLAIN SELECT ...\` | 表格（type/key/rows/Extra） |
| **PostgreSQL** | \`EXPLAIN ANALYZE SELECT ...\` | 带实际执行时间 |
| **Oracle** | \`EXPLAIN PLAN FOR ...\` | 需查 plan_table |

**MySQL EXPLAIN 关键列**：
- \`type\`：访问类型（\`const\` > \`ref\` > \`range\` > \`index\` > \`ALL\`）
- \`key\`：实际用的索引
- \`rows\`：估算扫描行数
- \`Extra\`：附加信息（\`Using index\` = 覆盖索引，\`Using filesort\` = 额外排序）

### 七、判断查询是否高效

**好信号**：
- \`SEARCH ... USING INDEX\`（用了索引）
- \`rows\` 估算值小
- \`Using index\`（覆盖索引）
- \`Using WHERE\`（有条件过滤）

**坏信号**：
- \`SCAN\`（全表扫描）
- \`rows\` 估算值大
- \`Using filesort\`（需要额外排序）
- \`Using temporary\`（需要临时表）
- \`Using join buffer\`（JOIN 没用索引）

### 八、踩坑点

**坑 1：EXPLAIN 不执行查询**
\`EXPLAIN\` 只显示计划，不真正执行。要看真实耗时用 PostgreSQL 的 \`EXPLAIN ANALYZE\`。

**坑 2：估算行数不准**
优化器基于统计信息估算行数，如果统计过期，估算可能偏差。定期 \`ANALYZE\` 更新统计。

**坑 3：子查询执行计划复杂**
复杂子查询的执行计划可能看不懂，建议先简化查询，逐步加复杂度。

### 九、生产建议

1. **慢查询先 EXPLAIN**：看是否走索引
2. **重点看 type 和 rows**：\`ALL\` 和大 rows 是危险信号
3. **关注 Extra**：\`filesort\` 和 \`temporary\` 要优化
4. **定期 ANALYZE**：保证统计信息准确
5. **对比优化前后**：EXPLAIN 前后对比验证效果

下面代码演示各种 EXPLAIN 场景。`,
    code: `-- ============================================================
-- 第二章演示：EXPLAIN 执行计划
-- ============================================================

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT,
  department TEXT,
  salary REAL,
  age INTEGER
);

-- 生成测试数据
WITH RECURSIVE seq(n) AS (
  SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n < 500
)
INSERT INTO employees (name, department, salary, age)
SELECT
  '员工_' || n,
  CASE n % 3 WHEN 0 THEN '技术部' WHEN 1 THEN '市场部' ELSE '人事部' END,
  (n % 10) * 1000 + 5000,
  20 + (n % 40)
FROM seq;

-- 1. 全表扫描（无索引）
SELECT '1. 全表扫描（无索引）:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM employees WHERE name = '员工_250';

-- 2. 索引查找
CREATE INDEX idx_name ON employees(name);
SELECT '2. 索引查找:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM employees WHERE name = '员工_250';

-- 3. 主键查找（最快）
SELECT '3. 主键查找:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM employees WHERE id = 250;

-- 4. 覆盖索引（查询列都在索引里）
CREATE INDEX idx_dept_salary ON employees(department, salary);
SELECT '4. 覆盖索引（只查 dept 和 salary）:' AS info;
EXPLAIN QUERY PLAN SELECT department, salary FROM employees WHERE department = '技术部';

-- 5. 非覆盖索引（查了索引外的列）
SELECT '5. 非覆盖索引（查了 name 列）:' AS info;
EXPLAIN QUERY PLAN SELECT department, salary, name FROM employees WHERE department = '技术部';

-- 6. 索引失效场景
SELECT '6. 索引失效 - 函数包裹列:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM employees WHERE UPPER(name) = '员工_250';

SELECT '6. 索引失效 - LIKE 左模糊:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM employees WHERE name LIKE '%250';

SELECT '6. 索引失效 - OR 条件:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM employees WHERE name = '员工_1' OR salary > 9000;

-- 7. JOIN 执行计划
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT,
  budget REAL
);
INSERT INTO departments VALUES (1, '技术部', 500000), (2, '市场部', 300000), (3, '人事部', 200000);

SELECT '7. JOIN 执行计划:' AS info;
EXPLAIN QUERY PLAN
SELECT e.name, d.name AS dept, e.salary
FROM employees e
JOIN departments d ON e.department = d.name
WHERE e.salary > 8000;

-- 8. 排序的执行计划
SELECT '8. 排序（可能产生 filesort）:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM employees ORDER BY salary DESC;

-- 9. 分组的执行计划
SELECT '9. 分组:' AS info;
EXPLAIN QUERY PLAN SELECT department, COUNT(*) FROM employees GROUP BY department;

-- 10. 估算行数
SELECT '10. 复合条件查询:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM employees WHERE department = '技术部' AND salary > 7000 AND age > 30;`,
  },

  // =========================================================
  // 第三章：索引优化策略
  // =========================================================
  {
    id: "sql-index-opt",
    group: "索引与性能",
    icon: "⚙️",
    title: "索引优化策略",
    content: `## 索引优化策略

建了索引不等于一定能用上。本章讲透索引优化的进阶策略：覆盖索引、最左前缀、避免失效、复合索引设计。

### 一、覆盖索引（Covering Index）

查询的所有列都在索引中，无需回表取数据：

\`\`\`sql
-- 索引包含 a, b, c 三列
CREATE INDEX idx_abc ON t(a, b, c);

-- 查询只涉及 a, b, c → 覆盖索引
SELECT a, b, c FROM t WHERE a = 1;  -- 直接从索引取，不回表

-- 查询涉及 d → 非覆盖索引（需回表取 d）
SELECT a, b, c, d FROM t WHERE a = 1;  -- 用索引找到行，再回表取 d
\`\`\`

**优势**：少一次"回表"IO，速度提升 2-5 倍。

**应用**：把高频查询的所有列都放进索引，用空间换时间。

### 二、最左前缀原则详解

复合索引 \`(a, b, c)\` 的 B-Tree 是按 a→b→c 排序的。查询必须从最左列开始：

\`\`\`sql
-- ✅ 命中
WHERE a = 1
WHERE a = 1 AND b = 2
WHERE a = 1 AND b = 2 AND c = 3

-- ❌ 不命中（缺最左列 a）
WHERE b = 2
WHERE c = 3

-- ⚠️ 部分命中（只用到 a）
WHERE a = 1 AND c = 3
\`\`\`

**范围查询会中断**：
\`\`\`sql
-- a 用索引，b 用索引，c 不用索引（因为 b 是范围查询，后面的 c 无法有序）
WHERE a = 1 AND b > 2 AND c = 3
\`\`\`

### 三、索引下推（Index Condition Pushdown, ICP）

MySQL 5.6+ 的优化：把 WHERE 条件下推到索引层过滤，减少回表次数。

\`\`\`sql
-- 索引 (a, b)
SELECT * FROM t WHERE a LIKE 'abc%' AND b > 100;
-- 无 ICP：用索引找所有 a LIKE 'abc%' 的行，逐个回表查 b
-- 有 ICP：在索引层同时过滤 a 和 b，只对满足条件的行回表
\`\`\`

### 四、索引失效的六大场景

#### 1. LIKE 左模糊
\`\`\`sql
-- ❌ 索引失效（不知道开头是什么）
WHERE name LIKE '%abc'

-- ✅ 可用索引（知道开头）
WHERE name LIKE 'abc%'
\`\`\`

#### 2. 函数包裹列
\`\`\`sql
-- ❌ 索引失效
WHERE UPPER(name) = 'ALICE'
WHERE YEAR(created_at) = 2026

-- ✅ 改写
WHERE name = 'alice'  -- 或建表达式索引
WHERE created_at >= '2026-01-01' AND created_at < '2027-01-01'
\`\`\`

#### 3. 隐式类型转换
\`\`\`sql
-- name 是 TEXT，传数字 → 隐式转换 → 索引失效
WHERE name = 123

-- ✅ 类型匹配
WHERE name = '123'
\`\`\`

#### 4. OR 条件
\`\`\`sql
-- ❌ 如果 name 有索引但 salary 没有，整体走全表扫描
WHERE name = 'Alice' OR salary > 9000

-- ✅ 改用 UNION ALL
SELECT * FROM t WHERE name = 'Alice'
UNION ALL
SELECT * FROM t WHERE salary > 9000
\`\`\`

#### 5. != / NOT IN
\`\`\`sql
-- ❌ 不等于通常不走索引（要扫描大部分数据）
WHERE status != 'active'

-- ✅ 改用 IN
WHERE status IN ('inactive', 'banned')
\`\`\`

#### 6. IS NULL（部分数据库）
\`\`\`sql
-- 大部分数据库 NULL 不进索引，IS NULL 可能不走索引
WHERE deleted_at IS NULL
-- 解决：建部分索引 WHERE deleted_at IS NULL
\`\`\`

### 五、复合索引列顺序设计

**原则**：等值条件在前，范围条件在后；区分度高的在前。

\`\`\`sql
-- 场景：常查 WHERE status = 'active' AND created_at > '2026-01-01'
-- ✅ 推荐顺序：status（等值）在前，created_at（范围）在后
CREATE INDEX idx_status_created ON t(status, created_at);

-- ❌ 反例：created_at 在前，范围查询会中断 status 的索引使用
CREATE INDEX idx_created_status ON t(created_at, status);
\`\`\`

**区分度原则**：选择性高的列放前面，能更快缩小范围。

\`\`\`sql
-- email 选择性 0.99，status 选择性 0.1
-- ✅ email 在前
CREATE INDEX idx_email_status ON t(email, status);
\`\`\`

### 六、冗余索引检测

\`\`\`sql
-- 索引 (a, b, c) 已包含 (a, b) 和 (a)
CREATE INDEX idx_abc ON t(a, b, c);
CREATE INDEX idx_ab ON t(a, b);   -- 冗余！
CREATE INDEX idx_a ON t(a);        -- 冗余！
\`\`\`

**冗余索引的危害**：占空间、拖慢写入、让优化器困惑。

### 七、索引选择性

\`\`\`sql
-- 查每列的选择性
SELECT
  COUNT(DISTINCT col) * 1.0 / COUNT(*) AS selectivity
FROM t;
\`\`\`

| 选择性 | 是否建索引 |
| --- | --- |
| > 0.5 | ✅ 强烈推荐 |
| 0.1 - 0.5 | ✅ 推荐 |
| 0.01 - 0.1 | ⚠️ 看情况 |
| < 0.01 | ❌ 不推荐（如性别） |

### 八、踩坑点

**坑 1：建了索引却没用上**（见上文 6 大场景）

**坑 2：索引太多拖慢写入**
\`\`\`sql
-- 每次 INSERT 要更新 10 个索引
-- 写入 QPS 从 10000 降到 1000
\`\`\`

**坑 3：忽略复合索引的最左前缀**
\`\`\`sql
-- 建了 (a, b, c) 却只查 c → 没用
WHERE c = 3
\`\`\`

### 九、生产建议

1. **查询前先 EXPLAIN**：确认索引被使用
2. **覆盖索引优化高频查询**：把查询列放进索引
3. **复合索引遵循最左前缀**：等值在前，范围在后
4. **定期清理冗余索引**：减少写入开销
5. **监控索引使用率**：长期不用的索引删掉

下面代码演示各种索引优化策略。`,
    code: `-- ============================================================
-- 第三章演示：索引优化策略
-- ============================================================

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  status TEXT,
  amount REAL,
  created_at TEXT,
  product_name TEXT
);

-- 生成测试数据
WITH RECURSIVE seq(n) AS (
  SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n < 1000
)
INSERT INTO orders (user_id, status, amount, created_at, product_name)
SELECT
  (n % 100) + 1,
  CASE n % 4 WHEN 0 THEN 'pending' WHEN 1 THEN 'paid' WHEN 2 THEN 'shipped' ELSE 'delivered' END,
  (n % 100) * 10 + 50,
  date('2026-01-01', '+' || (n % 180) || ' days'),
  '产品_' || (n % 50)
FROM seq;

-- 1. 覆盖索引演示
CREATE INDEX idx_status_user_amount ON orders(status, user_id, amount);

SELECT '1. 覆盖索引（查询列都在索引里）:' AS info;
EXPLAIN QUERY PLAN
SELECT status, user_id, amount FROM orders WHERE status = 'paid';

SELECT '1. 非覆盖索引（查了 product_name）:' AS info;
EXPLAIN QUERY PLAN
SELECT status, user_id, amount, product_name FROM orders WHERE status = 'paid';

-- 2. 最左前缀原则
CREATE INDEX idx_user_status_amount ON orders(user_id, status, amount);

SELECT '2. 最左前缀 - 全部命中:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE user_id = 5 AND status = 'paid' AND amount > 100;

SELECT '2. 最左前缀 - 部分命中（缺 status）:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE user_id = 5 AND amount > 100;

SELECT '2. 最左前缀 - 未命中（缺 user_id）:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE status = 'paid' AND amount > 100;

-- 3. 索引失效场景
CREATE INDEX idx_product ON orders(product_name);
CREATE INDEX idx_amount ON orders(amount);

SELECT '3. 索引失效 - 函数包裹列:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE UPPER(product_name) = '产品_5';

SELECT '3. 索引失效 - LIKE 左模糊:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE product_name LIKE '%5';

SELECT '3. 索引正常 - LIKE 右模糊:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE product_name LIKE '产品_5%';

-- 4. OR 改 UNION ALL
SELECT '4. OR 条件（可能全表扫描）:' AS info;
EXPLAIN QUERY PLAN
SELECT * FROM orders WHERE product_name = '产品_5' OR amount > 900;

SELECT '4. UNION ALL 改写:' AS info;
EXPLAIN QUERY PLAN
SELECT * FROM orders WHERE product_name = '产品_5'
UNION ALL
SELECT * FROM orders WHERE amount > 900;

-- 5. 选择性分析
SELECT '5. 各列选择性:' AS info;
SELECT
  ROUND(COUNT(DISTINCT status) * 100.0 / COUNT(*), 2) AS status_sel,
  ROUND(COUNT(DISTINCT user_id) * 100.0 / COUNT(*), 2) AS user_sel,
  ROUND(COUNT(DISTINCT amount) * 100.0 / COUNT(*), 2) AS amount_sel,
  ROUND(COUNT(DISTINCT product_name) * 100.0 / COUNT(*), 2) AS product_sel
FROM orders;

-- 6. 冗余索引
CREATE INDEX idx_user ON orders(user_id);  -- 与 idx_user_status_amount 冗余
SELECT '6. 当前所有索引:' AS info;
SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'orders';

-- 删除冗余索引
DROP INDEX idx_user;
SELECT '6. 删除冗余索引后:' AS info;
SELECT count(*) AS cnt FROM sqlite_master WHERE type = 'index' AND tbl_name = 'orders';

-- 7. 部分索引（只索引已支付订单）
CREATE INDEX idx_paid ON orders(user_id) WHERE status = 'paid';
SELECT '7. 部分索引（只索引 paid 订单）:' AS info;
EXPLAIN QUERY PLAN SELECT user_id FROM orders WHERE status = 'paid' AND user_id = 5;

-- 8. 重建索引
SELECT '8. REINDEX 重建索引（整理碎片）:' AS info;
REINDEX idx_status_user_amount;
SELECT 'REINDEX 完成' AS info;`,
  },

  // =========================================================
  // 第四章：查询优化技巧
  // =========================================================
  {
    id: "sql-query-opt",
    group: "索引与性能",
    icon: "🚀",
    title: "查询优化技巧",
    content: `## 查询优化技巧

索引优化是"硬件"层面，查询优化是"软件"层面。同样的数据，写法不同性能差 100 倍。本章讲实战优化技巧。

### 一、避免 SELECT *

\`\`\`sql
-- ❌ 查所有列（无法用覆盖索引，传输浪费）
SELECT * FROM users WHERE name = 'Alice';

-- ✅ 只查需要的列（可用覆盖索引）
SELECT id, name FROM users WHERE name = 'Alice';
\`\`\`

**为什么禁止 SELECT \***：
1. 无法用覆盖索引（要回表取所有列）
2. 传输浪费（表 50 列只用 3 列）
3. 加列后结果变化（破坏依赖）
4. 可能泄露敏感字段

### 二、COUNT(*) 的优化

\`\`\`sql
-- ❌ 大表精确 COUNT（全表扫描）
SELECT COUNT(*) FROM big_table;

-- ✅ 估算（用系统表，秒级）
-- MySQL
SELECT table_rows FROM information_schema.tables WHERE table_name = 'big_table';
-- PostgreSQL
SELECT reltuples FROM pg_class WHERE relname = 'big_table';
\`\`\`

**场景**：列表页"共 10000 条"，估算足够，不需要精确。

### 三、EXISTS 替代 IN

\`\`\`sql
-- ❌ IN 子查询（先查子查询全部结果，再匹配）
SELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE status = 'active');

-- ✅ EXISTS（找到匹配就停止，短路）
SELECT * FROM orders o WHERE EXISTS (
  SELECT 1 FROM users u WHERE u.id = o.user_id AND u.status = 'active'
);
\`\`\`

**注意**：子查询结果集小时 IN 更快；结果集大时 EXISTS 更快。要 EXPLAIN 对比。

### 四、JOIN 替代子查询

\`\`\`sql
-- ❌ 相关子查询（每行执行一次子查询）
SELECT name, (SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id) AS cnt
FROM users;

-- ✅ JOIN + GROUP BY（一次扫描完成）
SELECT u.name, COUNT(o.id) AS cnt
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name;
\`\`\`

### 五、分页优化：游标分页

\`\`\`sql
-- ❌ LIMIT OFFSET（OFFSET 大时慢，要先扫描前面所有行）
SELECT * FROM orders ORDER BY id LIMIT 10 OFFSET 100000;

-- ✅ 游标分页（记住上一页最后一条的 id）
SELECT * FROM orders WHERE id > 100000 ORDER BY id LIMIT 10;

-- ✅ 延迟关联（先查 id 再关联）
SELECT * FROM orders o
JOIN (SELECT id FROM orders ORDER BY id LIMIT 10 OFFSET 100000) t
ON o.id = t.id;
\`\`\`

**游标分页的优势**：不依赖 OFFSET，无论翻到第几页都只需索引查找。

### 六、批量 INSERT

\`\`\`sql
-- ❌ 逐条插入（N 次事务）
INSERT INTO t VALUES (1);
INSERT INTO t VALUES (2);
INSERT INTO t VALUES (3);

-- ✅ 批量插入（1 次事务）
INSERT INTO t VALUES (1), (2), (3);

-- ✅ INSERT ... SELECT（从其他表导入）
INSERT INTO new_t SELECT * FROM old_t;
\`\`\`

**性能差异**：1000 行插入，逐条约 10 秒，批量约 0.1 秒。

### 七、避免在 WHERE 做运算

\`\`\`sql
-- ❌ 列上做运算，索引失效
WHERE amount * 1.1 > 100
WHERE DATE(created_at) = '2026-06-29'

-- ✅ 改写条件，让列"裸露"
WHERE amount > 100 / 1.1
WHERE created_at >= '2026-06-29' AND created_at < '2026-06-30'
\`\`\`

### 八、UNION ALL 替代 UNION

\`\`\`sql
-- ❌ UNION 去重（需要排序去重）
SELECT name FROM users WHERE dept = 'A'
UNION
SELECT name FROM users WHERE dept = 'B';

-- ✅ UNION ALL 不去重（已知无重复时更快）
SELECT name FROM users WHERE dept = 'A'
UNION ALL
SELECT name FROM users WHERE dept = 'B';
\`\`\`

### 九、慎用 OR

\`\`\`sql
-- ❌ OR 可能导致全表扫描
WHERE dept = 'A' OR salary > 10000

-- ✅ 改用 UNION ALL
SELECT * FROM t WHERE dept = 'A'
UNION ALL
SELECT * FROM t WHERE salary > 10000 AND dept != 'A'
\`\`\`

### 十、其他技巧

| 技巧 | 说明 |
| --- | --- |
| \`DISTINCT\` 慎用 | 需排序去重，已知唯一别加 |
| \`ORDER BY\` 加索引 | 排序列建索引，避免 filesort |
| \`GROUP BY\` 加索引 | 分组列建索引 |
| 限制结果集 | \`LIMIT\` 减少传输 |
| 避免前置通配 | \`LIKE 'abc%'\` 走索引，\`'%abc'\` 不走 |
| 用 BETWEEN 替换范围 | \`BETWEEN 1 AND 10\` 比 \`>= 1 AND <= 10\` 清晰 |

### 十一、踩坑点

**坑 1：SELECT COUNT(*) 慢**
大表精确 COUNT 要全表扫描，用估算或维护计数器表。

**坑 2：子查询性能差**
相关子查询每行执行一次，改用 JOIN。

**坑 3：OFFSET 分页深翻慢**
\`OFFSET 100000\` 要扫描 10 万行，用游标分页。

### 十二、生产建议

1. **只查需要的列**：不用 \`SELECT *\`
2. **尽早过滤**：WHERE 减少 JOIN 和 GROUP BY 的数据量
3. **分页用游标**：避免大 OFFSET
4. **批量操作**：减少事务次数
5. **先 EXPLAIN 再上线**：确认执行计划高效

下面代码演示各种查询优化技巧。`,
    code: `-- ============================================================
-- 第四章演示：查询优化技巧
-- ============================================================

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT,
  dept TEXT,
  status TEXT DEFAULT 'active',
  salary REAL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  amount REAL,
  status TEXT,
  created_at TEXT
);

-- 生成测试数据
WITH RECURSIVE seq(n) AS (
  SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n < 500
)
INSERT INTO users (name, dept, status, salary)
SELECT
  'user_' || n,
  CASE n % 3 WHEN 0 THEN '技术部' WHEN 1 THEN '市场部' ELSE '人事部' END,
  CASE WHEN n % 5 = 0 THEN 'inactive' ELSE 'active' END,
  (n % 20) * 1000 + 5000
FROM seq;

WITH RECURSIVE seq(n) AS (
  SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n < 2000
)
INSERT INTO orders (user_id, amount, status, created_at)
SELECT
  (n % 500) + 1,
  (n % 100) * 10 + 50,
  CASE n % 3 WHEN 0 THEN 'paid' WHEN 1 THEN 'pending' ELSE 'shipped' END,
  date('2026-01-01', '+' || (n % 180) || ' days')
FROM seq;

-- 建索引
CREATE INDEX idx_user_dept ON users(dept);
CREATE INDEX idx_order_user ON orders(user_id);
CREATE INDEX idx_order_status ON orders(status);

-- 1. SELECT * vs 指定列
SELECT '1. 指定列（可用覆盖索引）:' AS info;
EXPLAIN QUERY PLAN SELECT id, name FROM users WHERE dept = '技术部';

SELECT '1. SELECT *（需回表）:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM users WHERE dept = '技术部';

-- 2. EXISTS vs IN
SELECT '2. IN 子查询:' AS info;
EXPLAIN QUERY PLAN
SELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE dept = '技术部');

SELECT '2. EXISTS 改写:' AS info;
EXPLAIN QUERY PLAN
SELECT * FROM orders o WHERE EXISTS (
  SELECT 1 FROM users u WHERE u.id = o.user_id AND u.dept = '技术部'
);

-- 3. JOIN 替代相关子查询
SELECT '3. 相关子查询（每行执行一次）:' AS info;
EXPLAIN QUERY PLAN
SELECT name, (SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id) AS cnt
FROM users WHERE dept = '技术部';

SELECT '3. JOIN+GROUP BY:' AS info;
EXPLAIN QUERY PLAN
SELECT u.name, COUNT(o.id) AS cnt
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.dept = '技术部'
GROUP BY u.id, u.name;

-- 4. 分页优化
SELECT '4. OFFSET 分页（深翻慢）:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM orders ORDER BY id LIMIT 10 OFFSET 100;

SELECT '4. 游标分页（快）:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE id > 100 ORDER BY id LIMIT 10;

-- 5. WHERE 做运算导致索引失效
CREATE INDEX idx_amount ON orders(amount);
SELECT '5. 列上做运算（索引失效）:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE amount * 1.1 > 100;

SELECT '5. 改写条件（索引有效）:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE amount > 100 / 1.1;

-- 6. UNION vs UNION ALL
SELECT '6. UNION ALL（不去重，快）:' AS info;
SELECT COUNT(*) AS 技术部人数 FROM users WHERE dept = '技术部'
UNION ALL
SELECT COUNT(*) AS 市场部人数 FROM users WHERE dept = '市场部';

-- 7. 批量 INSERT 演示
SELECT '7. 批量 INSERT 演示:' AS info;
CREATE TABLE temp_stats (label TEXT, value INTEGER);
INSERT INTO temp_stats VALUES ('用户总数', (SELECT COUNT(*) FROM users));
INSERT INTO temp_stats VALUES ('订单总数', (SELECT COUNT(*) FROM orders));
INSERT INTO temp_stats VALUES ('活跃用户', (SELECT COUNT(*) FROM users WHERE status = 'active'));
SELECT * FROM temp_stats;

-- 8. GROUP BY 优化
SELECT '8. GROUP BY（带索引）:' AS info;
EXPLAIN QUERY PLAN SELECT dept, COUNT(*), AVG(salary) FROM users GROUP BY dept;

SELECT '8. GROUP BY 结果:' AS info;
SELECT dept, COUNT(*) AS 人数, ROUND(AVG(salary), 0) AS 平均薪资 FROM users GROUP BY dept;`,
  },

  // =========================================================
  // 第五章：性能调优与监控
  // =========================================================
  {
    id: "sql-perf",
    group: "索引与性能",
    icon: "📈",
    title: "性能调优与监控",
    content: `## 性能调优与监控

性能调优不是一次性工作，而是"测量→分析→优化→验证"的循环。本章讲方法论和实战工具。

### 一、调优方法论

**核心原则**：先测量，再优化。

\`\`\`
测量（找到瓶颈）
  ↓
分析（定位原因）
  ↓
优化（针对性改进）
  ↓
验证（确认效果）
  ↓
监控（持续追踪）
\`\`\`

**二八定律**：80% 的性能问题来自 20% 的慢查询。找到慢查询，集中优化。

### 二、慢查询日志

\`\`\`sql
-- MySQL 开启慢查询日志
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;  -- 超过 1 秒记录
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';

-- PostgreSQL
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- 超过 1 秒记录
\`\`\`

**分析工具**：
- MySQL：\`mysqldumpslow\` / \`pt-query-digest\`
- PostgreSQL：\`pg_stat_statements\`
- SQLite：开发时用 \`.timer ON\` 查看耗时

### 三、ANALYZE 更新统计信息

优化器基于统计信息选择执行计划。统计过期会导致执行计划糟糕。

\`\`\`sql
-- SQLite
ANALYZE;  -- 收集所有表的统计信息
ANALYZE users;  -- 只分析单表

-- PostgreSQL
ANALYZE users;
VACUUM ANALYZE;  -- 回收空间 + 更新统计

-- MySQL
ANALYZE TABLE users;
\`\`\`

**何时 ANALYZE**：
- 大批量导入后
- 大量删除后
- 执行计划突然变差时
- 定期（如每周）

### 四、VACUUM 整理碎片

\`\`\`sql
-- SQLite
VACUUM;  -- 重建数据库文件，回收空间

-- PostgreSQL
VACUUM;           -- 标记已删除空间为可复用
VACUUM FULL;     -- 重建表，真正回收空间（锁表）
VACUUM ANALYZE;  -- 回收 + 更新统计

-- MySQL
OPTIMIZE TABLE users;
\`\`\`

**何时 VACUUM**：
- 大量删除后（回收空间）
- 数据库文件异常大时
- 定期维护（如每月）

### 五、SQLite PRAGMA 调优

\`\`\`sql
PRAGMA journal_mode = WAL;     -- WAL 模式，读写并发更好
PRAGMA synchronous = NORMAL;   -- 降低 fsync 频率（牺牲一点持久性）
PRAGMA cache_size = -64000;    -- 64MB 缓存（负数表示 KB）
PRAGMA temp_store = MEMORY;    -- 临时表存内存
PRAGMA mmap_size = 268435456;  -- 256MB 内存映射
\`\`\`

| PRAGMA | 作用 | 推荐 |
| --- | --- | --- |
| \`journal_mode\` | 日志模式 | \`WAL\`（读写并发） |
| \`synchronous\` | 同步级别 | \`NORMAL\`（性能与安全平衡） |
| \`cache_size\` | 页缓存大小 | 越大越好（受内存限制） |
| \`temp_store\` | 临时表存储 | \`MEMORY\` |
| \`mmap_size\` | 内存映射大小 | 大表查询受益 |

### 六、连接池配置

应用与数据库的连接建立成本高（TCP 握手 + 认证）。连接池复用连接：

\`\`\`
应用 → 连接池（N 个连接）→ 数据库
\`\`\`

**配置要点**：
- **最小连接数**：保持几个常连接
- **最大连接数**：根据数据库配置（MySQL 默认 151，PostgreSQL 默认 100）
- **超时**：空闲连接回收时间
- **验证**：取出连接前测试是否有效

### 七、读写分离

主从复制架构，写主库，读从库：

\`\`\`
写 → 主库（Master）
读 → 从库（Slave1, Slave2, ...）
\`\`\`

**适用场景**：读多写少（如内容网站、报表）。

**注意**：主从有延迟，写完立即读可能读不到，需"读主库"兜底。

### 八、分库分表

**垂直分表**：按列拆分（热数据 + 冷数据分表）。
\`\`\`sql
-- 用户基本信息（热）
users: id, name, avatar
-- 用户扩展信息（冷）
user_profiles: user_id, bio, address, birthday
\`\`\`

**水平分表**：按行拆分（按 ID 取模、按时间、按范围）。
\`\`\`sql
-- 按 ID 取模分 3 表
orders_0: id % 3 = 0 的数据
orders_1: id % 3 = 1 的数据
orders_2: id % 3 = 2 的数据
\`\`\`

**分表后的问题**：跨表查询、分布式事务、全局唯一 ID、聚合统计。建议用中间件（ShardingSphere、Vitess）。

### 九、缓存层

\`\`\`sql
-- Redis 缓存查询结果
SET user:1:name "Alice" EX 3600  -- 缓存 1 小时
GET user:1:name
\`\`\`

**缓存模式**：
1. **Cache Aside**：先查缓存，没有查 DB 并写缓存
2. **Write Through**：写 DB 同时写缓存
3. **Write Behind**：只写缓存，异步刷 DB

**三大缓存问题**：
- **缓存穿透**：查不存在的 key，绕过缓存打 DB → 用布隆过滤器
- **缓存击穿**：热点 key 过期，大量请求打 DB → 加互斥锁
- **缓存雪崩**：大量 key 同时过期 → 过期时间加随机

### 十、监控指标

| 指标 | 含义 | 告警阈值 |
| --- | --- | --- |
| QPS | 每秒查询数 | 看容量规划 |
| 慢查询数 | 超过阈值的查询数 | > 10/分钟 |
| 平均响应时间 | 查询平均耗时 | > 100ms |
| 连接数 | 当前连接数 | > 最大连接数的 80% |
| 缓存命中率 | 缓存命中比例 | < 90% |
| 锁等待 | 锁等待次数/时长 | > 0 |

### 十一、踩坑点

**坑 1：优化了不该优化的**
先用 profiling 找到真正的瓶颈，不要凭感觉优化。

**坑 2：过度优化**
单表 1000 行全表扫描也很快，别为了"用上索引"过度设计。

**坑 3：加索引后忘 ANALYZE**
新索引加完，统计信息没更新，优化器可能不用新索引。

### 十二、生产建议

1. **建立监控**：QPS、慢查询、连接数、错误率
2. **定期维护**：ANALYZE + VACUUM
3. **容量规划**：预估数据增长，提前扩展
4. **灰度发布**：索引变更先在从库测试
5. **备份回滚**：优化前备份，出问题能回退

下面代码演示性能调优的各种手段。`,
    code: `-- ============================================================
-- 第五章演示：性能调优与监控
-- ============================================================

-- 1. PRAGMA 调优
SELECT '1. 当前 PRAGMA 设置:' AS info;
SELECT 'journal_mode = ' || journal_mode FROM pragma_journal_mode LIMIT 1;
PRAGMA journal_mode = WAL;
SELECT '已切换到 WAL 模式:' AS info;

-- 2. 建表并插入数据
CREATE TABLE big_data (
  id INTEGER PRIMARY KEY,
  category TEXT,
  value REAL,
  created_at TEXT
);

WITH RECURSIVE seq(n) AS (
  SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n < 5000
)
INSERT INTO big_data (category, value, created_at)
SELECT
  CASE n % 5 WHEN 0 THEN 'A' WHEN 1 THEN 'B' WHEN 2 THEN 'C' WHEN 3 THEN 'D' ELSE 'E' END,
  (n % 1000) * 1.5,
  datetime('2026-01-01', '+' || (n % 365) || ' days', '+' || (n % 24) || ' hours')
FROM seq;

SELECT '2. 数据量:' AS info, COUNT(*) AS cnt FROM big_data;

-- 3. ANALYZE 更新统计
ANALYZE big_data;
SELECT '3. ANALYZE 完成（统计信息已更新）' AS info;

-- 4. 查询性能对比
SELECT '4. 无索引查询:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM big_data WHERE category = 'A' AND value > 500;

-- 建索引
CREATE INDEX idx_cat_val ON big_data(category, value);
ANALYZE big_data;

SELECT '4. 有索引查询:' AS info;
EXPLAIN QUERY PLAN SELECT * FROM big_data WHERE category = 'A' AND value > 500;

-- 5. VACUUM 演示
SELECT '5. VACUUM 前 - 数据库文件大小:' AS info;
PRAGMA page_count;

DELETE FROM big_data WHERE id > 2500;
SELECT '5. 删除一半数据后:' AS info;
SELECT COUNT(*) AS 剩余行数 FROM big_data;

VACUUM;
SELECT '5. VACUUM 后（页数减少）:' AS info;
PRAGMA page_count;

-- 6. REINDEX 重建索引
SELECT '6. REINDEX 前:' AS info;
REINDEX idx_cat_val;
SELECT 'REINDEX 完成（索引碎片已整理）' AS info;

-- 7. 监控查询：表大小统计
SELECT '7. 表统计信息:' AS info;
SELECT
  'big_data' AS 表名,
  COUNT(*) AS 行数,
  COUNT(DISTINCT category) AS 分类数,
  MIN(created_at) AS 最早数据,
  MAX(created_at) AS 最新数据
FROM big_data;

-- 8. 索引使用情况
SELECT '8. 索引列表:' AS info;
SELECT name, tbl_name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'big_data';

-- 9. 性能测试：分组聚合
SELECT '9. 分组聚合统计:' AS info;
SELECT category, COUNT(*) AS 数量, ROUND(AVG(value), 2) AS 平均值, MAX(value) AS 最大值
FROM big_data
GROUP BY category
ORDER BY 数量 DESC;

-- 10. 系统性能信息
SELECT '10. SQLite 版本:' AS info;
SELECT sqlite_version() AS version;
SELECT '页面大小:' AS info, page_size AS bytes FROM pragma_page_size;
SELECT '缓存大小:' AS info, cache_size AS pages FROM pragma_cache_size;`,
  },
];
