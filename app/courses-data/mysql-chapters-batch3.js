// =============================================================
// 《MySQL 实战教程》- 章节批次 3
// -------------------------------------------------------------
// 内容：第三部分 高级查询与执行计划（第 13-16 章）
// =============================================================

const chapters = [
  // =========================================================
  // 第十三章：EXPLAIN 执行计划
  // =========================================================
  {
    id: "mysql-ch13",
    group: "第三部分 高级查询与执行计划",
    icon: "🔬",
    title: "第 13 章 EXPLAIN 执行计划",
    content: `# 第 13 章 EXPLAIN 执行计划

写出能跑的 SQL 只是第一步，写出跑得快的 SQL 才是工程师的价值所在。MySQL 提供的 \`EXPLAIN\` 是优化 SQL 最重要的工具——它把"数据库打算怎么执行这条 SQL"完整地展示给你看：用没用索引、扫描了多少行、有没有用到临时表、有没有文件排序。看懂 \`EXPLAIN\` 输出，是 SQL 调优的入门门槛，也是面试高频考点。

本章从 \`EXPLAIN\` 的基本用法开始，逐列拆解它的输出含义，重点讲解 \`type\`、\`key\`、\`rows\`、\`Extra\` 这四个最关键的列，并介绍 MySQL 8.0 新增的 \`EXPLAIN ANALYZE\` 实际执行分析能力。

## 13.1 什么是 EXPLAIN

\`EXPLAIN\` 是 MySQL 提供的查询计划查看命令，放在 SELECT / INSERT / UPDATE / DELETE 语句前即可使用。它**不会真正执行** SQL（除非用 8.0 的 ANALYZE 模式），只返回优化器选择的执行计划。

\`\`\`sql
-- 基本用法：在 SELECT 前加 EXPLAIN
EXPLAIN SELECT * FROM users WHERE id = 1;

-- 也可以分析 UPDATE / DELETE
EXPLAIN DELETE FROM users WHERE age < 18;
\`\`\`

执行后会返回一张表，每一行代表执行计划中的一个"步骤"（通常一个表对应一行）。多表 JOIN 会产生多行，子查询也可能产生多行。

\`\`\`sql
-- 多表 JOIN 的 EXPLAIN 会返回多行
EXPLAIN
SELECT o.id, u.name
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.age > 18;
\`\`\`

\`EXPLAIN\` 的核心价值：**在 SQL 上线前预判性能**。如果发现 \`type=ALL\`（全表扫描）、\`rows\` 高达百万，这条 SQL 一上生产就会拖垮数据库。

## 13.2 EXPLAIN 输出列详解

MySQL 8.0 的 \`EXPLAIN\` 输出共有 12 列，从左到右依次是：

| 列名 | 含义 |
| --- | --- |
| \`id\` | 步骤编号，相同 id 表示在同一层（如多表 JOIN），不同 id 表示子查询 |
| \`select_type\` | 查询类型：SIMPLE / PRIMARY / SUBQUERY / DERIVED / UNION 等 |
| \`table\` | 当前步骤操作的表名（可能是别名或派生表名） |
| \`partitions\` | 匹配的分区表分区 |
| \`type\` | **访问类型**（最重要）：从全表扫描到主键等值查询的效率分级 |
| \`possible_keys\` | 优化器认为"可能用到"的索引列表 |
| \`key\` | **实际使用**的索引名 |
| \`key_len\` | 使用的索引长度（字节），可推断复合索引用了几列 |
| \`ref\` | 索引比较的来源：const / 字段名 / func 等 |
| \`rows\` | **预估扫描行数**（非常关键的成本估算依据） |
| \`filtered\` | 经过条件过滤后剩余的百分比（0-100） |
| \`Extra\` | **额外信息**：Using index / Using where / Using filesort / Using temporary 等 |

记忆口诀：\`id\` 看层次、\`type\` 看效率、\`key\` 看是否走索引、\`rows\` 看扫描量、\`Extra\` 看额外开销。

\`\`\`sql
-- 准备演示数据
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50),
  age INT,
  email VARCHAR(100),
  INDEX idx_name (name),
  INDEX idx_age_email (age, email)
);

INSERT INTO users (name, age, email) VALUES
  ('Alice', 28, 'alice@example.com'),
  ('Bob', 34, 'bob@example.com'),
  ('Charlie', 22, 'charlie@example.com'),
  ('Dave', 45, 'dave@example.com');

-- 查看 SELECT 的执行计划
EXPLAIN SELECT * FROM users WHERE name = 'Alice';
\`\`\`

## 13.3 type 列：访问类型

\`type\` 列反映 MySQL 访问数据的方式，从最差到最好依次为：

| type 值 | 含义 | 性能 |
| --- | --- | --- |
| \`ALL\` | 全表扫描，逐行遍历整张表 | 最差 |
| \`index\` | 全索引扫描，扫描整棵索引树 | 较差（但优于 ALL，因索引比表小） |
| \`range\` | 范围扫描，如 \`>\`、\`BETWEEN\`、\`IN\` | 一般 |
| \`ref\` | 非唯一索引等值匹配，可能返回多行 | 良好 |
| \`eq_ref\` | 唯一索引或主键等值匹配（JOIN 场景），最多 1 行 | 优秀 |
| \`const\` | 主键或唯一索引等值匹配，最多 1 行 | 极佳 |
| \`system\` | 表只有一行（系统表） | 最优 |

\`\`\`sql
-- type = const：主键等值查询
EXPLAIN SELECT * FROM users WHERE id = 1;

-- type = ref：非唯一索引等值查询
EXPLAIN SELECT * FROM users WHERE name = 'Alice';

-- type = range：范围查询
EXPLAIN SELECT * FROM users WHERE age BETWEEN 20 AND 40;

-- type = ALL：无索引条件，全表扫描
EXPLAIN SELECT * FROM users;

-- type = index：扫描整个索引（如 SELECT 索引列）
EXPLAIN SELECT name FROM users;
\`\`\`

**实战标准**：生产环境至少要达到 \`range\` 级别，\`index\` 和 \`ALL\` 在大表上必须避免。

## 13.4 key 与 possible_keys

- \`possible_keys\`：优化器认为"可能可用"的索引列表，可能有多个
- \`key\`：优化器**实际选择**使用的索引，只能有一个（除 index_merge 外）

\`\`\`sql
-- 同时有两个索引可选：idx_name 和 idx_age_email
EXPLAIN SELECT * FROM users WHERE name = 'Alice' AND age = 28;
-- possible_keys 可能列出 idx_name, idx_age_email
-- key 显示优化器最终选了哪个
\`\`\`

**注意**：\`possible_keys\` 为 NULL 但 \`key\` 不为 NULL 是可能的——表示优化器用了索引但没有走索引查找（比如用索引做排序或覆盖扫描）。\`possible_keys\` 不为 NULL 但 \`key\` 为 NULL 表示有可用索引但优化器选择不用（可能因为数据量小或统计信息不准）。

强制使用某索引：

\`\`\`sql
-- 强制使用 idx_name 索引
SELECT * FROM users FORCE INDEX(idx_name) WHERE name = 'Alice';

-- 忽略某个索引
SELECT * FROM users IGNORE INDEX(idx_age_email) WHERE name = 'Alice';
\`\`\`

强制索引是排查手段，**不应作为常规写法**——当数据分布变化后，强制索引可能反而更差。

## 13.5 rows 与 filtered

- \`rows\`：优化器预估需要扫描的行数（不是结果行数！）
- \`filtered\`：经过 WHERE 过滤后剩余的百分比

\`\`\`sql
-- 假设表有 10000 行，age > 18 的占 90%
EXPLAIN SELECT * FROM users WHERE age > 18;
-- rows 可能显示 10000，filtered 显示 90.00
-- 实际返回行数 ≈ rows × filtered / 100
\`\`\`

\`rows\` 是优化器基于**统计信息**估算的，不是精确值。如果统计信息过期，估算会偏差很大，导致优化器选错索引。可以用 \`ANALYZE TABLE users;\` 重新收集统计信息。

**判断标准**：\`rows\` 越小越好。如果 \`rows\` 接近表总行数，说明基本是全表扫描，索引没起作用。

\`\`\`sql
-- 重新收集表的统计信息
ANALYZE TABLE users;

-- 查看表的统计信息
SHOW INDEX FROM users;
\`\`\`

## 13.6 Extra 列：额外信息

\`Extra\` 列显示"除访问方式外的额外信息"，是判断 SQL 性能的另一个关键指标。常见取值：

| Extra 值 | 含义 | 影响 |
| --- | --- | --- |
| \`Using index\` | **覆盖索引**，直接从索引取数据，不回表 | 极好 |
| \`Using where\` | 用 WHERE 过滤（在 server 层） | 一般 |
| \`Using index condition\` | **索引下推**（ICP），在存储引擎层过滤 | 良好 |
| \`Using filesort\` | **文件排序**，需要额外排序操作 | 较差 |
| \`Using temporary\` | **使用临时表**（如 GROUP BY、DISTINCT） | 较差 |
| \`Using join buffer\` | JOIN 没有用到索引，用块嵌套循环 | 差 |
| \`Impossible WHERE\` | WHERE 条件恒假（如 \`1=0\`） | 无数据 |
| \`No tables used\` | 没有 FROM 子句 | 无表 |

\`\`\`sql
-- Using index：覆盖索引（SELECT 列都在索引里）
EXPLAIN SELECT name FROM users WHERE name = 'Alice';

-- Using where：需要在 server 层过滤
EXPLAIN SELECT * FROM users WHERE name = 'Alice' AND age > 20;

-- Using filesort：ORDER BY 没走索引
EXPLAIN SELECT * FROM users ORDER BY email;

-- Using temporary：GROUP BY 用临时表
EXPLAIN SELECT age, COUNT(*) FROM users GROUP BY age;
\`\`\`

**重点关注**：\`Using filesort\` 和 \`Using temporary\` 是性能杀手，在大表上尤其致命。看到这两个就要考虑加索引或改写 SQL。

## 13.7 EXPLAIN FORMAT=JSON

MySQL 支持 JSON 格式的 \`EXPLAIN\` 输出，提供比传统表格更详细的信息，包括**成本估算**：

\`\`\`sql
EXPLAIN FORMAT=JSON
SELECT * FROM users WHERE name = 'Alice';
\`\`\`

JSON 输出包含 \`query_cost\`（查询成本）、\`read_cost\`（读取成本）、\`eval_cost\`（评估成本）等字段，便于精确比较两个 SQL 的优劣。

\`\`\`json
{
  "query_block": {
    "select_id": 1,
    "cost_info": {
      "query_cost": "0.35"
    },
    "table": {
      "table_name": "users",
      "access_type": "ref",
      "possible_keys": ["idx_name"],
      "key": "idx_name",
      "used_key_parts": ["name"],
      "key_length": "203",
      "rows_examined_per_scan": 1,
      "rows_produced_per_join": 1,
      "filtered": "100.00",
      "cost_info": {
        "read_cost": "0.25",
        "eval_cost": "0.10",
        "prefix_cost": "0.35",
        "data_read_per_join": "352"
      }
    }
  }
}
\`\`\`

## 13.8 EXPLAIN ANALYZE（MySQL 8.0+）

MySQL 8.0.18 引入 \`EXPLAIN ANALYZE\`，会**真正执行** SQL 并统计每个步骤的实际耗时和行数，是排查"优化器估算偏差"的利器：

\`\`\`sql
EXPLAIN ANALYZE
SELECT * FROM users WHERE name = 'Alice';
\`\`\`

输出示例（简化）：

\`\`\`
-> Index lookup on users using idx_name  (cost=0.35 rows=1) (actual time=0.05..0.05 rows=1 loops=1)
\`\`\`

- \`cost\`：优化器估算成本
- \`rows\`：优化器估算行数
- \`actual time\`：实际耗时（毫秒），格式为 \`首次..末次\`
- \`actual rows\`：实际返回行数
- \`loops\`：循环次数

**对比 \`rows\` 和 \`actual rows\`**：如果估算 1 行实际返回 10000 行，说明统计信息严重失真，需要 \`ANALYZE TABLE\` 重建统计信息。

## 踩坑提示

1. **\`EXPLAIN\` 不会执行 SQL（除非 ANALYZE）**：所以 \`EXPLAIN\` 一条慢查询是安全的，但 \`EXPLAIN ANALYZE\` 会真的执行，慢查询要小心。
2. **\`rows\` 是估算值不是精确值**：优化器基于统计信息估算，可能偏差很大。
3. **\`possible_keys\` 多不代表性能好**：优化器选错索引反而更慢，可用 FORCE INDEX 调试。
4. **\`Using filesort\` 不一定真的写文件**：小数据集在内存排序，大数据集才落盘，但都是性能隐患。
5. **统计信息会过期**：大量 INSERT / UPDATE / DELETE 后，\`ANALYZE TABLE\` 能让优化器重新做正确决策。
6. **\`EXPLAIN\` 看不到锁的信息**：要看锁需要用 \`SHOW ENGINE INNODB STATUS\` 或 \`performance_schema\`。

## 本章小结

- \`EXPLAIN\` 是查看 SQL 执行计划的工具，写在 SELECT / UPDATE / DELETE 之前
- 重点关注四列：\`type\`（访问方式）、\`key\`（用的索引）、\`rows\`（扫描行数）、\`Extra\`（额外开销）
- \`type\` 从差到好：\`ALL\` < \`index\` < \`range\` < \`ref\` < \`eq_ref\` < \`const\`，生产至少达到 \`range\`
- \`Using filesort\` 和 \`Using temporary\` 是性能杀手，看到就要优化
- MySQL 8.0 的 \`EXPLAIN ANALYZE\` 会真正执行 SQL，提供实际耗时和行数，是排查估算偏差的利器
- 定期 \`ANALYZE TABLE\` 维护统计信息，让优化器做正确决策`
  },

  // =========================================================
  // 第十四章：索引基础
  // =========================================================
  {
    id: "mysql-ch14",
    group: "第三部分 高级查询与执行计划",
    icon: "⚡",
    title: "第 14 章 索引基础",
    content: `# 第 14 章 索引基础

索引是数据库性能优化的第一工具。一条慢查询加上合适的索引，性能提升 100 倍是常态；反过来，一条本该走索引的 SQL 因为写法失误导致索引失效，性能可能下降 1000 倍。但索引不是越多越好——每个索引都有存储和维护成本。理解索引的底层结构（B+ 树）、聚簇索引与二级索引的区别、回表与覆盖索引的机制，才能在设计索引时做出正确权衡。

本章是索引的理论基础，第 15 章会讲索引的具体创建与使用。如果只读一章，强烈建议读这一章——理论不通，写出来的索引全是凭感觉。

## 14.1 索引是什么

索引是数据库为了加速查询而维护的**额外数据结构**。类比书的目录：要找某章内容，不需要逐页翻（全表扫描），先查目录定位页码（索引查找），再翻到对应页（取数据）。

\`\`\`sql
-- 没有索引：WHERE 条件需要逐行扫描整张表
SELECT * FROM users WHERE email = 'alice@example.com';
-- 100 万行表，可能扫描 100 万行

-- 建索引后：直接通过索引定位到目标行
CREATE INDEX idx_email ON users(email);
SELECT * FROM users WHERE email = 'alice@example.com';
-- 索引查找，扫描 1 行
\`\`\`

索引的本质是"用空间换时间"：每个索引都是一棵独立的 B+ 树，占额外存储空间；每次 INSERT / UPDATE / DELETE 都要同步维护所有索引，写性能会下降。

**索引的收益**：
- 加速等值查询（\`=\`、\`IN\`）
- 加速范围查询（\`>\`、\`BETWEEN\`、\`LIKE '前缀%'\`）
- 加速排序（\`ORDER BY\`）
- 加速分组（\`GROUP BY\`）
- 保证唯一性（\`UNIQUE\` 索引）

**索引的代价**：
- 占额外磁盘空间（索引行平均比数据行小，但累积起来不可忽视）
- 写性能下降（每次写都要维护所有索引）
- 优化器选择成本增加（索引太多优化器可能选错）

## 14.2 B+ 树结构

MySQL InnoDB 引擎的索引采用 **B+ 树**（B+ Tree）结构。B+ 树是 B 树的变种，区别在于：

- 所有数据都存储在**叶子节点**，非叶子节点只存索引（用于路由）
- 叶子节点通过**双向链表**连接，支持范围扫描

\`\`\`
              [非叶子节点：30 | 60]
             /         |         \\
     [10|20]      [40|50]      [70|80]
       |            |            |
   [10→20→30]→[40→50→60]→[70→80→90]
   叶子节点（存实际数据 / 主键），双向链表相连
\`\`\`

**B+ 树的优势**：
1. **查找稳定**：每次查找都从根到叶子，路径长度相同
2. **范围查询高效**：找到起点后，沿叶子链表顺序扫描即可
3. **节点扇出大**：每个节点存多个键值（典型 100-1000），3-4 层就能支撑千万级数据

\`\`\`sql
-- 假设主键 id 是 BIGINT（8 字节），页大小 16KB
-- 每个非叶子节点可存约 16KB / (8+6) ≈ 1170 个键
-- 3 层 B+ 树可存储 1170 × 1170 × 16 ≈ 2190 万行
-- 查找任意一行最多 3 次磁盘 IO
\`\`\`

**对比 B 树**：B 树的非叶子节点也存数据，导致单节点能存的键更少，树更高；范围查询需要中序遍历，效率低。

## 14.3 聚簇索引 vs 二级索引

InnoDB 的索引分为两类：

| 类型 | 别名 | 数据存储方式 | 数量 |
| --- | --- | --- | --- |
| **聚簇索引** | 主键索引 | 叶子节点存**整行数据** | 每表只有 1 个 |
| **二级索引** | 辅助索引 | 叶子节点存**主键值** | 每表可有多个 |

\`\`\`sql
-- 主键索引（聚簇索引）
CREATE TABLE users (
  id INT PRIMARY KEY,        -- 自动创建聚簇索引
  name VARCHAR(50),
  email VARCHAR(100)
);

-- 二级索引的叶子节点存的是 id（主键），不是 name / email 本身
CREATE INDEX idx_name ON users(name);
-- idx_name 的叶子节点结构：[name, id]
\`\`\`

**聚簇索引的选择规则**（InnoDB 自动选择）：
1. 优先用 \`PRIMARY KEY\`
2. 没有主键则用第一个 \`NOT NULL UNIQUE\` 索引
3. 都没有则 InnoDB 自动生成一个隐藏的 \`GEN_CLUST_INDEX\`（6 字节 \`DB_ROW_ID\`）

**为什么建议显式定义主键**：自动生成的隐藏主键无法用于业务查询，且无法在主键上加速，是浪费。

\`\`\`sql
-- 推荐写法：用 BIGINT AUTO_INCREMENT 做主键
CREATE TABLE orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ...
);

-- 不推荐：用 UUID 做主键
-- UUID 无序，INSERT 时 B+ 树需要大量页分裂，写性能差
CREATE TABLE orders_bad (
  id CHAR(36) PRIMARY KEY,
  ...
);
\`\`\`

## 14.4 回表与覆盖索引

**回表**：通过二级索引找到主键，再用主键去聚簇索引查整行数据的过程。

\`\`\`sql
-- 假设有 idx_name 索引
SELECT * FROM users WHERE name = 'Alice';

-- 执行过程：
-- 1. 在 idx_name 索引树查找 name='Alice'，得到 id=1
-- 2. 用 id=1 回到聚簇索引查找，得到整行数据
-- 这一步"回到聚簇索引"就是"回表"
\`\`\`

回表是额外的磁盘 IO，性能比直接走索引差。**覆盖索引**指查询的所有列都在索引里，不需要回表：

\`\`\`sql
-- 假设有 idx_name (name) 索引
SELECT name FROM users WHERE name = 'Alice';
-- 只查 name，索引里有，不用回表 → 覆盖索引

SELECT id, name FROM users WHERE name = 'Alice';
-- id 是主键，二级索引的叶子节点本身就存 id → 也是覆盖索引

SELECT name, age FROM users WHERE name = 'Alice';
-- age 不在索引里，需要回表 → 不是覆盖索引
\`\`\`

\`EXPLAIN\` 中 \`Extra: Using index\` 表示用了覆盖索引，是性能最优的访问方式之一。

\`\`\`sql
-- 用复合索引实现覆盖索引
CREATE INDEX idx_name_age ON users(name, age);

EXPLAIN SELECT name, age FROM users WHERE name = 'Alice';
-- Extra 应该显示 Using index
\`\`\`

**实战技巧**：高频查询的列尽量放进复合索引，实现覆盖索引避免回表。

## 14.5 索引的代价

索引不是免费的，每个索引都要付出三重代价：

**1. 存储代价**

\`\`\`sql
-- 假设 users 表 1 亿行，每行 200 字节
-- 数据占用 ≈ 1 亿 × 200 = 20GB

-- 加一个 idx_name (VARCHAR(50)) 索引
-- 索引行 ≈ 50 + 8（主键）+ 6（页指针）= 64 字节
-- 索引占用 ≈ 1 亿 × 64 = 6.4GB
\`\`\`

索引越多，磁盘占用越大，内存缓冲池（buffer pool）压力也越大。

**2. 写性能代价**

\`\`\`sql
-- 每个 INSERT / UPDATE / DELETE 都要维护所有相关索引
-- 假设 users 表有 5 个索引
INSERT INTO users (...);  -- 维护 5 棵 B+ 树
UPDATE users SET name = 'Bob' WHERE id = 1;  -- 维护 idx_name
DELETE FROM users WHERE id = 1;  -- 从 5 棵 B+ 树中删除
\`\`\`

索引越多，写性能越差。OLTP（高并发写入）场景尤其敏感。

**3. 优化器选择代价**

优化器在多索引间选择需要计算成本，索引太多可能导致：
- 优化器选错索引（统计信息不准时）
- \`EXPLAIN\` 计算变慢

**经验法则**：单表索引数量建议控制在 5 个以内，复合索引列数不超过 5 列。冗余索引（如已有 \`idx_a_b\`，又建 \`idx_a\`）应删除。

\`\`\`sql
-- 查找冗余索引
SELECT * FROM sys.schema_redundant_indexes;

-- 查找未使用的索引（运行一段时间后）
SELECT * FROM sys.schema_unused_indexes;
\`\`\`

## 14.6 索引的选择性

**选择性**（Cardinality / Selectivity）= 不同值的数量 / 总行数。选择性越高，索引效果越好。

\`\`\`sql
-- 性别字段：选择性 ≈ 2 / 1000000 = 0.0002%
-- 在性别上加索引几乎没用（区分度太低）
SELECT COUNT(DISTINCT gender) / COUNT(*) FROM users;

-- 邮箱字段：选择性 ≈ 100%（基本唯一）
-- 在邮箱上加索引效果极好
SELECT COUNT(DISTINCT email) / COUNT(*) FROM users;
\`\`\`

**经验值**：选择性 > 30% 时索引才有明显收益。性别、状态这种低选择性字段不应单独建索引。

但低选择性字段可以放在**复合索引的前缀**：

\`\`\`sql
-- 假设查询模式是 WHERE status = 1 AND user_id = 100
-- 单独 status 索引没用，但 (status, user_id) 复合索引有效
CREATE INDEX idx_status_uid ON orders(status, user_id);
\`\`\`

\`EXPLAIN\` 中 \`key_len\` 列能反映复合索引用了几列。如果只用了一列说明复合索引后半部分没生效。

\`\`\`sql
-- 复合索引 idx_status_uid (status, user_id)
-- status INT 占 4 字节，user_id BIGINT 占 8 字节

EXPLAIN SELECT * FROM orders WHERE status = 1 AND user_id = 100;
-- key_len = 12（4 + 8），说明两列都用了

EXPLAIN SELECT * FROM orders WHERE status = 1;
-- key_len = 4，只用了一列

EXPLAIN SELECT * FROM orders WHERE user_id = 100;
-- key_len = NULL，复合索引从 user_id 开始查询 → 索引失效
\`\`\`

## 踩坑提示

1. **主键不要用 UUID**：UUID 无序，INSERT 时 B+ 树频繁页分裂，写性能可下降 3-5 倍。如必须用 UUID，考虑用有序 UUID（如 UUID v7）。
2. **不要在低选择性字段单独建索引**：性别、状态这种字段单独建索引几乎没用，且占空间。
3. **索引列尽量 NOT NULL**：NULL 值处理有额外开销，且影响选择性统计。
4. **隐式类型转换会让索引失效**：\`WHERE phone = 13800138000\`（phone 是 VARCHAR）会全表扫描，应写成 \`WHERE phone = '13800138000'\`。
5. **函数运算会让索引失效**：\`WHERE YEAR(created_at) = 2024\` 不走索引，应写成 \`WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'\`。
6. **冗余索引要删除**：\`idx_a_b\` 已包含 \`idx_a\` 的查询能力，单独的 \`idx_a\` 是冗余。

## 本章小结

- 索引是 B+ 树数据结构，用空间换时间，加速查询但降低写性能
- InnoDB 索引分两类：聚簇索引（叶子存整行，每表 1 个）和二级索引（叶子存主键，可有多个）
- **回表**：通过二级索引查到主键，再去聚簇索引取整行的过程，是额外 IO
- **覆盖索引**：查询列都在索引里，不需要回表，\`EXPLAIN\` 显示 \`Using index\`
- 索引有存储、写性能、优化器选择三重代价，单表建议不超过 5 个索引
- 选择性 = 不同值数 / 总行数，> 30% 才有显著收益，低选择性字段放复合索引前缀`
  },

  // =========================================================
  // 第十五章：索引的创建与使用
  // =========================================================
  {
    id: "mysql-ch15",
    group: "第三部分 高级查询与执行计划",
    icon: "🎯",
    title: "第 15 章 索引的创建与使用",
    content: `# 第 15 章 索引的创建与使用

第 14 章讲了索引的理论基础，本章讲实战——如何创建索引、何时创建何种索引、如何避免索引失效。索引设计是 DBA 和后端工程师的必备技能，好的索引设计能让数据库扛住 10 倍流量，差的索引设计会让一个本该毫秒级返回的查询拖垮整个服务。

本章从基础语法出发，逐步深入复合索引的最左前缀原则、覆盖索引、函数索引、不可见索引等高级特性，最后系统梳理索引失效的常见场景与排查方法。

## 15.1 创建索引的语法

MySQL 提供三种创建索引的方式：

\`\`\`sql
-- 方式 1：CREATE INDEX（最常用）
CREATE INDEX idx_name ON users(name);

-- 方式 2：ALTER TABLE ADD INDEX
ALTER TABLE users ADD INDEX idx_name (name);

-- 方式 3：建表时直接定义
CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  email VARCHAR(100),
  INDEX idx_name (name),
  UNIQUE INDEX idx_email (email)
);
\`\`\`

**删除索引**：

\`\`\`sql
DROP INDEX idx_name ON users;
-- 或
ALTER TABLE users DROP INDEX idx_name;
\`\`\`

**查看表的索引**：

\`\`\`sql
SHOW INDEX FROM users;
-- 输出列：Table / Non_unique / Key_name / Seq_in_index / Column_name / Collation / Cardinality 等
\`\`\`

**索引命名规范**：
- 普通索引：\`idx_字段名\`（如 \`idx_name\`）
- 唯一索引：\`uk_字段名\`（如 \`uk_email\`）
- 复合索引：\`idx_字段1_字段2\`（如 \`idx_user_status\`）
- 全文索引：\`ft_字段名\`

## 15.2 单列索引

单列索引是最简单的索引形式，在一个字段上单独建索引：

\`\`\`sql
-- 在 email 字段上建索引
CREATE INDEX idx_email ON users(email);

-- 等值查询走索引
EXPLAIN SELECT * FROM users WHERE email = 'alice@example.com';
-- type = ref

-- 范围查询走索引
EXPLAIN SELECT * FROM users WHERE email > 'a';
-- type = range

-- LIKE 前缀匹配走索引
EXPLAIN SELECT * FROM users WHERE email LIKE 'ali%';
-- type = range

-- LIKE 非前缀匹配不走索引！
EXPLAIN SELECT * FROM users WHERE email LIKE '%ali%';
-- type = ALL（全表扫描）
\`\`\`

**LIKE 的规则**：\`LIKE '前缀%'\` 走索引，\`LIKE '%任意'\` 不走索引。因为 B+ 树是按字段值排序的，前缀确定才能定位。

\`\`\`sql
-- 前缀索引：长字符串字段可只索引前 N 个字符
CREATE INDEX idx_email_prefix ON users(email(10));
-- 只索引 email 前 10 个字符，节省空间
-- 但无法用于 ORDER BY 和覆盖索引
\`\`\`

前缀索引的长度选择：用以下 SQL 找选择性接近完整列的前缀长度：

\`\`\`sql
SELECT
  COUNT(DISTINCT LEFT(email, 5)) / COUNT(*) AS sel_5,
  COUNT(DISTINCT LEFT(email, 10)) / COUNT(*) AS sel_10,
  COUNT(DISTINCT LEFT(email, 15)) / COUNT(*) AS sel_15,
  COUNT(DISTINCT email) / COUNT(*) AS sel_full
FROM users;
-- 选选择性接近 sel_full 的最短长度
\`\`\`

## 15.3 复合索引与最左前缀

复合索引（多列索引）是实战中最常用、也最容易用错的索引形式。

\`\`\`sql
-- 复合索引
CREATE INDEX idx_age_status_name ON users(age, status, name);

-- B+ 树按 (age, status, name) 三元组排序
-- 先按 age 排序，age 相同按 status，status 相同按 name
\`\`\`

**最左前缀原则**：复合索引从最左列开始连续使用才有效。

\`\`\`sql
-- ✅ 走索引：使用了前缀（age、age+status、age+status+name）
EXPLAIN SELECT * FROM users WHERE age = 28;
-- key_len = 4（只用 age）

EXPLAIN SELECT * FROM users WHERE age = 28 AND status = 1;
-- key_len = 8（age + status）

EXPLAIN SELECT * FROM users WHERE age = 28 AND status = 1 AND name = 'Alice';
-- key_len = 完整长度

-- ❌ 不走索引：跳过了 age
EXPLAIN SELECT * FROM users WHERE status = 1;
EXPLAIN SELECT * FROM users WHERE name = 'Alice';

-- ⚠️ 部分走索引：age 走，name 不走（中间跳了 status）
EXPLAIN SELECT * FROM users WHERE age = 28 AND name = 'Alice';
-- key_len = 4，只有 age 生效
\`\`\`

**范围查询会中断后续索引使用**：

\`\`\`sql
-- age 用了范围查询，后面的 status / name 失效
EXPLAIN SELECT * FROM users WHERE age > 18 AND status = 1 AND name = 'Alice';
-- key_len = 4，只有 age 生效

-- 等值在前，范围在后
EXPLAIN SELECT * FROM users WHERE status = 1 AND age > 18 AND name = 'Alice';
-- 优化器会自动调整顺序：age > 18 之前的 status = 1 走索引
\`\`\`

**复合索引列顺序设计原则**：
1. 等值查询的列放前面
2. 范围查询的列放最后
3. 高选择性的列放前面（区分度大）
4. 排序列考虑放进去（实现"索引排序"）

\`\`\`sql
-- 查询模式：WHERE status = ? AND age > ? ORDER BY created_at
-- 推荐索引：(status, age, created_at)
CREATE INDEX idx_status_age_created ON users(status, age, created_at);
-- status 等值在前，age 范围在中，created_at 用于排序
\`\`\`

## 15.4 唯一索引与主键索引

\`\`\`sql
-- 主键索引：每表只能有一个，自动创建，值非空且唯一
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100)
);

-- 唯一索引：可有多个，值必须唯一（NULL 除外）
CREATE UNIQUE INDEX uk_email ON users(email);

-- 建表时定义
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  UNIQUE KEY uk_phone (phone)
);
\`\`\`

**唯一索引 vs 普通索引的性能差异**：
- 查找：几乎相同（B+ 树查找）
- 插入：唯一索引需要额外检查唯一性，性能略低（约 1-10%）
- InnoDB 中唯一索引的插入不能"change buffer"延迟合并，写性能差距在高并发下更明显

**ON DUPLICATE KEY UPDATE 与唯一索引**：

\`\`\`sql
-- 唯一索引冲突时自动更新
INSERT INTO users (id, email) VALUES (1, 'new@example.com')
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- 替换：DELETE + INSERT（慎用，会改变主键和触发器行为）
REPLACE INTO users (id, email) VALUES (1, 'new@example.com');
\`\`\`

## 15.5 全文索引

全文索引（FULLTEXT）用于文本搜索，支持中文分词（需 \`ngram\` 解析器）：

\`\`\`sql
-- 建表时定义
CREATE TABLE articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200),
  content TEXT,
  FULLTEXT INDEX ft_content (content) WITH PARSER ngram
);

-- 或后期添加
CREATE FULLTEXT INDEX ft_content ON articles(content) WITH PARSER ngram;

-- 全文搜索语法
SELECT * FROM articles
WHERE MATCH(content) AGAINST('数据库' IN NATURAL LANGUAGE MODE);

-- 布尔模式：必须包含 +，不能包含 -
SELECT * FROM articles
WHERE MATCH(content) AGAINST('+MySQL -Oracle' IN BOOLEAN MODE);
\`\`\`

**全文索引 vs LIKE**：
- \`LIKE '%keyword%'\` 全表扫描，性能差
- 全文索引用倒排索引，性能好但需要分词
- 全文索引适合大文本（文章、博客），不适合短字段

\`\`\`sql
-- 配置 ngram 分词长度（默认 2）
SET GLOBAL ngram_token_size = 2;
\`\`\`

## 15.6 函数索引（MySQL 8.0+）

MySQL 8.0.13 引入函数索引，可以在表达式上建索引：

\`\`\`sql
-- 传统问题：函数运算会让索引失效
CREATE INDEX idx_created_at ON orders(created_at);

SELECT * FROM orders WHERE YEAR(created_at) = 2024;
-- ❌ 索引失效，全表扫描

-- 解决方案 1：改写 SQL（推荐）
SELECT * FROM orders
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';
-- ✅ 走索引

-- 解决方案 2：函数索引
CREATE INDEX idx_year ON orders((YEAR(created_at)));
SELECT * FROM orders WHERE YEAR(created_at) = 2024;
-- ✅ 走 idx_year 索引
\`\`\`

**常见函数索引场景**：

\`\`\`sql
-- 大小写不敏感查询
CREATE INDEX idx_name_lower ON users((LOWER(name)));
SELECT * FROM users WHERE LOWER(name) = 'alice';

-- JSON 字段查询
CREATE INDEX idx_data_age ON users((CAST(data->'$.age' AS UNSIGNED)));
SELECT * FROM users WHERE data->'$.age' > 18;
\`\`\`

**优先级**：能改写 SQL 就改写 SQL，函数索引是兜底方案（增加维护成本）。

## 15.7 不可见索引（MySQL 8.0+）

不可见索引（Invisible Index）让优化器"看不到"索引，但索引仍然维护：

\`\`\`sql
-- 让索引不可见
ALTER TABLE users ALTER INDEX idx_name INVISIBLE;

-- 让索引可见
ALTER TABLE users ALTER INDEX idx_name VISIBLE;
\`\`\`

**用途**：在线测试索引删除的安全性。

\`\`\`sql
-- 场景：怀疑 idx_name 是冗余索引想删，但担心影响生产

-- 步骤 1：先设为不可见，观察一段时间
ALTER TABLE users ALTER INDEX idx_name INVISIBLE;

-- 步骤 2：观察慢查询日志，如果没有新增慢查询 → 索引确实无用
-- 步骤 3：正式删除
DROP INDEX idx_name ON users;

-- 或恢复
ALTER TABLE users ALTER INDEX idx_name VISIBLE;
\`\`\`

**注意**：不可见索引仍会随写操作维护，所以不能用它来"省维护成本"——要彻底省成本只能删除。

## 15.8 索引失效场景

这是本章重点。以下场景会让索引"建了等于没建"：

**1. 函数运算**

\`\`\`sql
-- ❌ 索引失效
WHERE YEAR(created_at) = 2024
WHERE LEFT(name, 3) = 'Ali'
WHERE name + 1 = 100

-- ✅ 改写
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'
WHERE name LIKE 'Ali%'
WHERE name = 99
\`\`\`

**2. 隐式类型转换**

\`\`\`sql
-- phone 是 VARCHAR
-- ❌ 索引失效（隐式转数字）
WHERE phone = 13800138000

-- ✅ 走索引
WHERE phone = '13800138000'

-- 字段是 INT，传字符串不会失效（INT 优先）
WHERE age = '28'  -- 走索引（优化器会转字符串为数字）
\`\`\`

**3. 范围查询后的列**

\`\`\`sql
-- 复合索引 idx_a_b_c (a, b, c)
-- ❌ b 不走索引
WHERE a = 1 AND b > 10 AND c = 100
-- ✅ 改写：把范围放最后
WHERE a = 1 AND c = 100 AND b > 10
-- 优化器自动调整，但 c 仍可能失效
\`\`\`

**4. LIKE 以 % 开头**

\`\`\`sql
-- ❌ 索引失效
WHERE name LIKE '%lice'
WHERE name LIKE '%lic%'

-- ✅ 走索引
WHERE name LIKE 'Ali%'
\`\`\`

**5. OR 两边任一列无索引**

\`\`\`sql
-- 假设 name 有索引，age 无索引
-- ❌ 整个查询不走索引
WHERE name = 'Alice' OR age = 28

-- ✅ 两边都有索引才可能走 index_merge
-- 给 age 加索引
CREATE INDEX idx_age ON users(age);
WHERE name = 'Alice' OR age = 28
-- 可能走 index_merge
\`\`\`

**6. NOT IN / NOT EXISTS / <>**

\`\`\`sql
-- ❌ 通常不走索引
WHERE id NOT IN (1, 2, 3)
WHERE status <> 1

-- ✅ 改写为 IN 或范围
WHERE id IN (4, 5, 6, ...)
WHERE status > 1 OR status < 1
\`\`\`

**7. IS NOT NULL（部分场景）**

\`\`\`sql
-- NULL 值较多时索引可能不生效
WHERE name IS NOT NULL
\`\`\`

**排查工具**：用 \`EXPLAIN\` 检查 \`key\` 列。如果 \`key=NULL\` 说明没用索引。

\`\`\`sql
-- 系统视图查找未使用的索引
SELECT * FROM sys.schema_unused_indexes
WHERE object_schema = 'your_db';

-- 查找冗余索引
SELECT * FROM sys.schema_redundant_indexes
WHERE table_schema = 'your_db';
\`\`\`

## 踩坑提示

1. **建索引前先用 EXPLAIN 验证**：先用 \`EXPLAIN\` 看现有索引的使用情况，避免重复建。
2. **复合索引顺序很关键**：等值在前、范围在后、高选择性在前、排序列考虑加入。
3. **不要建太多索引**：单表 5 个以内，单索引 5 列以内，写多读少的表更要克制。
4. **大表建索引要在线操作**：\`ALTER TABLE ...\` 会锁表，生产用 \`pt-online-schema-change\` 或 MySQL 8.0 的 \`ALGORITHM=INPLACE\`。
5. **索引列的字符集要一致**：JOIN 时两表字符集不同会导致索引失效。
6. **统计信息要定期维护**：\`ANALYZE TABLE\` 让优化器做正确决策。
7. **删除索引前先设为不可见**：用不可见索引观察一段时间，确认无影响再删。

## 本章小结

- 创建索引：\`CREATE INDEX\`、\`ALTER TABLE ADD INDEX\`、建表时定义三种方式
- 单列索引适合高选择性字段；LIKE 只支持 \`'前缀%'\` 走索引
- 复合索引遵循**最左前缀原则**：从左到右连续使用，范围查询会中断后续列
- 唯一索引保证唯一性；全文索引适合大文本搜索（用 ngram 支持中文）
- MySQL 8.0 新特性：函数索引（在表达式上建索引）、不可见索引（在线测试删除安全性）
- **索引失效七大场景**：函数运算、隐式类型转换、范围查询后的列、LIKE '%...'、OR 任一边无索引、NOT IN / <>、IS NOT NULL
- 实战工具：\`SHOW INDEX\`、\`EXPLAIN\`、\`sys.schema_unused_indexes\`、\`sys.schema_redundant_indexes\``
  },

  // =========================================================
  // 第十六章：SQL 优化实战
  // =========================================================
  {
    id: "mysql-ch16",
    group: "第三部分 高级查询与执行计划",
    icon: "🔧",
    title: "第 16 章 SQL 优化实战",
    content: `# 第 16 章 SQL 优化实战

前几章分别讲了查询写法（JOIN、子查询、窗口函数）、执行计划（\`EXPLAIN\`）、索引原理。本章把这些知识串起来，针对**真实业务中最常见的慢查询场景**给出系统化的优化方案。

慢查询优化不是"加个索引"那么简单，而是一个完整流程：**发现慢查询 → 分析原因 → 设计方案 → 验证效果**。本章按这个流程展开，覆盖 COUNT、分页、JOIN、子查询、ORDER BY、GROUP BY、INSERT、UPDATE / DELETE 这 8 类高频场景。

## 16.1 慢查询日志

MySQL 提供慢查询日志（Slow Query Log）记录执行时间超过阈值的 SQL，是发现慢查询的第一入口。

\`\`\`sql
-- 查看慢查询日志状态
SHOW VARIABLES LIKE 'slow_query_log%';
-- slow_query_log = OFF / ON
-- slow_query_log_file = /var/log/mysql/mysql-slow.log

-- 开启慢查询日志
SET GLOBAL slow_query_log = ON;

-- 设置阈值（秒）：执行超过此值的 SQL 被记录
SET GLOBAL long_query_time = 1;  -- 超过 1 秒
-- 注意：默认 10 秒，生产建议设为 0.1-1 秒

-- 记录未走索引的查询
SET GLOBAL log_queries_not_using_indexes = ON;

-- 记录慢查询的管理命令（如 ANALYZE TABLE）
SET GLOBAL log_slow_admin_statements = ON;
\`\`\`

**配置文件写法**（持久化）：

\`\`\`
[mysqld]
slow_query_log = 1
slow_query_log_file = /var/log/mysql/mysql-slow.log
long_query_time = 1
log_queries_not_using_indexes = 1
\`\`\`

**分析慢查询日志**：

\`\`\`bash
# 用 mysqldumpslow 工具统计
mysqldumpslow -s t -t 10 /var/log/mysql/mysql-slow.log
# -s t：按总耗时排序
# -t 10：显示前 10 条
\`\`\`

\`\`\`sql
-- MySQL 8.0 用 performance_schema 分析
SELECT digest_text, count_star, avg_timer_wait/1000000000 AS avg_ms
FROM performance_schema.events_statements_summary_by_digest
ORDER BY avg_timer_wait DESC
LIMIT 10;
\`\`\`

**找到慢查询后的分析流程**：
1. \`EXPLAIN\` 看执行计划
2. 看 \`type\` 是否为 ALL / index
3. 看 \`rows\` 是否过大
4. 看 \`Extra\` 是否有 Using filesort / Using temporary
5. 针对性加索引或改写 SQL

## 16.2 优化 COUNT 查询

\`COUNT(*)\` 在大表上是性能重灾区。InnoDB 没有 MyISAM 那种行数缓存，\`COUNT(*)\` 需要扫描整张表（或整个索引）。

\`\`\`sql
-- ❌ 慢：1000 万行表，COUNT(*) 要数秒
SELECT COUNT(*) FROM orders;

-- 也没用：COUNT(1) 和 COUNT(*) 性能相同
SELECT COUNT(1) FROM orders;

-- 唯一索引列 COUNT 略快（扫描最小的索引）
SELECT COUNT(id) FROM orders;
\`\`\`

**优化方案 1：缓存**

业务允许近似值时，用 Redis 缓存计数：

\`\`\`sql
-- 应用层维护：每次 INSERT 时 Redis INCR，DELETE 时 DECR
-- 查询时直接读 Redis
-- Redis> GET orders:count
\`\`\`

**优化方案 2：估算**

\`\`\`sql
-- 用 information_schema 估算（不精确，但快）
SELECT table_rows FROM information_schema.tables
WHERE table_schema = 'your_db' AND table_name = 'orders';
\`\`\`

**优化方案 3：反范式设计**

\`\`\`sql
-- 单独维护一张计数表
CREATE TABLE counts (
  table_name VARCHAR(50) PRIMARY KEY,
  row_count BIGINT
);

-- 用触发器维护
DELIMITER //
CREATE TRIGGER orders_insert AFTER INSERT ON orders
FOR EACH ROW BEGIN
  UPDATE counts SET row_count = row_count + 1 WHERE table_name = 'orders';
END//
CREATE TRIGGER orders_delete AFTER DELETE ON orders
FOR EACH ROW BEGIN
  UPDATE counts SET row_count = row_count - 1 WHERE table_name = 'orders';
END//
DELIMITER ;
\`\`\`

**带条件的 COUNT**：

\`\`\`sql
-- ❌ 慢：扫全表
SELECT COUNT(*) FROM orders WHERE status = 'paid';

-- ✅ 在 status 上加索引，走索引扫描
CREATE INDEX idx_status ON orders(status);
SELECT COUNT(*) FROM orders WHERE status = 'paid';
-- type = ref，扫描 status='paid' 的索引区间
\`\`\`

## 16.3 优化分页查询

经典的深分页问题：\`LIMIT 1000000, 10\` 要扫描 1000010 行，前 100 万行全浪费。

\`\`\`sql
-- ❌ 深分页：性能极差
SELECT * FROM orders ORDER BY id LIMIT 1000000, 10;
-- 扫描 1000010 行，丢弃 100 万行
\`\`\`

**优化方案 1：用主键定位（推荐）**

\`\`\`sql
-- 假设前端记住上一页最后一条 id = 1000000
SELECT * FROM orders WHERE id > 1000000 ORDER BY id LIMIT 10;
-- type = range，只扫描 10 行
\`\`\`

**优化方案 2：子查询延迟关联**

\`\`\`sql
-- 先通过索引查 id，再 JOIN 取数据
SELECT * FROM orders o
INNER JOIN (
  SELECT id FROM orders ORDER BY id LIMIT 1000000, 10
) t ON o.id = t.id;
-- 子查询走覆盖索引，只扫描索引不回表
\`\`\`

**优化方案 3：禁止跳页**

业务上限制只能"下一页"，不能直接跳到第 100 页。这是大多数 App 信息流的实现方式（微博、朋友圈都是这种）。

\`\`\`sql
-- App 信息流模式：基于游标分页
-- 第一页
SELECT * FROM orders ORDER BY id DESC LIMIT 10;
-- 第 N 页：用上一页最后一条 id 作为游标
SELECT * FROM orders WHERE id < ? ORDER BY id DESC LIMIT 10;
\`\`\`

**优化方案 4：限制最大页数**

\`\`\`sql
-- 业务上限制最多翻 100 页
-- 超出引导用户用搜索筛选
\`\`\`

## 16.4 优化 JOIN

JOIN 性能取决于：是否用索引、JOIN 顺序、被驱动表的大小。

\`\`\`sql
-- 假设 orders 1 亿行，users 100 万行
-- orders.user_id 有索引
SELECT * FROM orders o JOIN users u ON o.user_id = u.id WHERE u.age > 18;
\`\`\`

**优化原则**：
1. **小表驱动大表**：让数据量小的表做驱动表
2. **被驱动表的 JOIN 列必须有索引**：否则用 Block Nested Loop，性能极差
3. **ON 子句的字段类型必须一致**：不一致会导致索引失效

\`\`\`sql
-- ✅ 推荐：用 STRAIGHT_JOIN 强制 JOIN 顺序（小表在前）
SELECT STRAIGHT_JOIN * FROM users u JOIN orders o ON u.id = o.user_id WHERE u.age > 18;
-- users 做驱动表（100 万行），orders.user_id 走索引

-- ❌ 不推荐：默认顺序可能让 orders 做驱动表，扫 1 亿行
\`\`\`

**Index Nested-Loop Join（NLJ）**：被驱动表 JOIN 列有索引时，驱动表每行通过索引快速定位，复杂度 O(N × log M)。

**Block Nested-Loop（BNL）**：被驱动表无索引时，把驱动表数据放入 join buffer，被驱动表全表扫描匹配。看到 \`Extra: Using join buffer\` 就要警惕。

\`\`\`sql
-- BNL 优化：给被驱动表的 JOIN 列加索引
-- 假设 orders.user_id 无索引
EXPLAIN SELECT * FROM users u JOIN orders o ON u.id = o.user_id;
-- Extra: Using join buffer (Block Nested Loop)

CREATE INDEX idx_user_id ON orders(user_id);
EXPLAIN SELECT * FROM users u JOIN orders o ON u.id = o.user_id;
-- type = ref，无 Using join buffer
\`\`\`

**Hash Join（MySQL 8.0.18+）**：替代无索引场景的 BNL，性能更好。

\`\`\`sql
-- 查看 hash join 使用情况
EXPLAIN FORMAT=TREE
SELECT * FROM users u JOIN orders o ON u.id = o.user_id;
-- 输出 <<hash join>> 表示用了 hash join
\`\`\`

## 16.5 优化子查询

MySQL 8.0 之前子查询性能较差，8.0 之后大幅优化（多数场景自动改写为 JOIN）。

\`\`\`sql
-- ❌ 旧版慢：相关子查询，每行都执行一次
SELECT * FROM orders o
WHERE o.amount > (
  SELECT AVG(amount) FROM orders WHERE user_id = o.user_id
);

-- ✅ 改写为 JOIN + 派生表
SELECT o.*
FROM orders o
JOIN (
  SELECT user_id, AVG(amount) AS avg_amount
  FROM orders
  GROUP BY user_id
) a ON o.user_id = a.user_id AND o.amount > a.avg_amount;
\`\`\`

**IN 子查询优化**：

\`\`\`sql
-- ❌ 旧版性能差
SELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE age > 18);

-- ✅ 改写为 JOIN
SELECT o.*
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.age > 18;
\`\`\`

**EXISTS vs IN**：

\`\`\`sql
-- IN 适合子查询结果小
SELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE status = 1);

-- EXISTS 适合外层结果小
SELECT * FROM users u WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);
\`\`\`

**MySQL 8.0 半连接优化**：MySQL 8.0 自动把 IN 子查询优化为半连接（Semi-Join），性能与 JOIN 接近，多数场景无需手动改写。

\`\`\`sql
EXPLAIN SELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE age > 18);
-- select_type 可能显示 Semi-join
\`\`\`

## 16.6 优化 ORDER BY

\`ORDER BY\` 没走索引会触发 \`Using filesort\`，大数据集性能差。

\`\`\`sql
-- ❌ 慢：filesort
SELECT * FROM orders ORDER BY created_at;
-- Extra: Using filesort

-- ✅ 走索引：在 created_at 上建索引
CREATE INDEX idx_created ON orders(created_at);
SELECT * FROM orders ORDER BY created_at;
-- Extra: 无 filesort

-- ✅ 覆盖索引 + 排序
SELECT id, created_at FROM orders ORDER BY created_at;
-- Extra: Using index
\`\`\`

**复合索引实现"过滤 + 排序"**：

\`\`\`sql
-- 查询模式：WHERE status = ? ORDER BY created_at
CREATE INDEX idx_status_created ON orders(status, created_at);
-- status 等值过滤后，created_at 已排序，无需 filesort

EXPLAIN SELECT * FROM orders WHERE status = 1 ORDER BY created_at;
-- Extra: 无 filesort
\`\`\`

**ORDER BY 与索引方向**：

\`\`\`sql
-- 索引 idx_status_created (status, created_at ASC)
SELECT * FROM orders WHERE status = 1 ORDER BY created_at DESC;
-- MySQL 8.0 支持降序索引，可建 (status, created_at DESC)
-- MySQL 5.7 不支持降序索引，会反向扫描

-- 正反方向不一致会触发 filesort
SELECT * FROM orders WHERE status = 1 ORDER BY created_at ASC, id DESC;
-- 如果索引是 (status, created_at, id)，会触发 filesort
\`\`\`

**filesort 的两种算法**：
- 双路排序（旧）：读行指针排序，再回表取数据，IO 多
- 单路排序（新）：一次性读所有字段到 buffer 排序，IO 少但占内存

\`\`\`sql
-- 调整 sort_buffer_size 提升 filesort 性能
SET GLOBAL sort_buffer_size = 4 * 1024 * 1024;  -- 4MB
\`\`\`

## 16.7 优化 GROUP BY

\`GROUP BY\` 默认会排序，可能触发 \`Using temporary; Using filesort\`。

\`\`\`sql
-- ❌ 慢：临时表 + filesort
SELECT user_id, COUNT(*) FROM orders GROUP BY user_id;
-- Extra: Using temporary; Using filesort

-- ✅ 加索引避免临时表
CREATE INDEX idx_user_id ON orders(user_id);
SELECT user_id, COUNT(*) FROM orders GROUP BY user_id;
-- Extra: Using index

-- ✅ 不需要排序时用 ORDER BY NULL 禁用排序
SELECT user_id, COUNT(*) FROM orders GROUP BY user_id ORDER BY NULL;
-- Extra: Using temporary（无 filesort）
\`\`\`

**WHERE 与 HAVING 的区别**：

\`\`\`sql
-- WHERE 在分组前过滤，能走索引
SELECT user_id, COUNT(*)
FROM orders
WHERE status = 'paid'   -- 先过滤，再分组
GROUP BY user_id;

-- HAVING 在分组后过滤，不能走索引
SELECT user_id, COUNT(*)
FROM orders
GROUP BY user_id
HAVING COUNT(*) > 10;   -- 先分组，再过滤
\`\`\`

**优化原则**：能在 WHERE 过滤的不要留到 HAVING。

**WITH ROLLUP 分组小计**：

\`\`\`sql
-- 按用户分组，最后加一行总计
SELECT user_id, COUNT(*) AS cnt
FROM orders
GROUP BY user_id WITH ROLLUP;
-- 输出：
-- user_id=1, cnt=10
-- user_id=2, cnt=20
-- user_id=NULL, cnt=30  ← 总计
\`\`\`

## 16.8 优化 INSERT

批量插入是大表导入的常见场景，性能优化空间大。

\`\`\`sql
-- ❌ 单条循环插入：每条一次事务，极慢
INSERT INTO users (name) VALUES ('Alice');
INSERT INTO users (name) VALUES ('Bob');
INSERT INTO users (name) VALUES ('Charlie');

-- ✅ 多行 VALUES：一次事务，快 10-100 倍
INSERT INTO users (name) VALUES
  ('Alice'), ('Bob'), ('Charlie');

-- ✅ 大批量用 LOAD DATA INFILE：最快的导入方式
LOAD DATA INFILE '/path/users.csv'
INTO TABLE users
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\\n'
IGNORE 1 LINES;
\`\`\`

**事务批量提交**：

\`\`\`sql
-- 用事务包裹，避免每条自动提交
START TRANSACTION;
INSERT INTO users (name) VALUES ('Alice');
INSERT INTO users (name) VALUES ('Bob');
INSERT INTO users (name) VALUES ('Charlie');
COMMIT;
\`\`\`

**关闭索引和约束（导入大数据时）**：

\`\`\`sql
-- 关闭唯一性检查
SET UNIQUE_CHECKS = 0;
-- 关闭外键检查
SET FOREIGN_KEY_CHECKS = 0;
-- 关闭自动提交
SET AUTOCOMMIT = 0;

-- 批量导入
INSERT INTO users (name) VALUES (...), (...), ...;

-- 恢复
SET UNIQUE_CHECKS = 1;
SET FOREIGN_KEY_CHECKS = 1;
SET AUTOCOMMIT = 1;
\`\`\`

**INSERT ... ON DUPLICATE KEY UPDATE**：

\`\`\`sql
-- 比"先 SELECT 再 INSERT/UPDATE"快
INSERT INTO users (id, name, age) VALUES (1, 'Alice', 28)
ON DUPLICATE KEY UPDATE age = VALUES(age);
\`\`\`

## 16.9 优化 UPDATE 与 DELETE

大表 UPDATE / DELETE 容易长时间锁行，影响并发。

\`\`\`sql
-- ❌ 大批量 UPDATE：长时间锁表
UPDATE orders SET status = 'expired' WHERE created_at < '2020-01-01';

-- ✅ 分批处理：每批 1000 条
UPDATE orders SET status = 'expired'
WHERE created_at < '2020-01-01'
ORDER BY id LIMIT 1000;
-- 循环执行直到 affected_rows = 0

-- ❌ DELETE 大量数据：留下大量"空洞"（碎片）
DELETE FROM orders WHERE created_at < '2020-01-01';

-- ✅ 用 TRUNCATE 清空整表（无法回滚，慎用）
TRUNCATE TABLE orders_temp;

-- ✅ 用分区表删除整个分区（最快）
ALTER TABLE orders DROP PARTITION p2020;
\`\`\`

**避免大事务**：

\`\`\`sql
-- ❌ 一次删 100 万行，长时间锁
DELETE FROM logs WHERE created_at < '2020-01-01';

-- ✅ 分批
WHILE exists:
  DELETE FROM logs
  WHERE created_at < '2020-01-01'
  LIMIT 1000;
  -- 应用层循环
\`\`\`

**UPDATE 用 JOIN**：

\`\`\`sql
-- ❌ 用子查询
UPDATE orders SET status = 'vip'
WHERE user_id IN (SELECT id FROM users WHERE level = 5);

-- ✅ 用 JOIN
UPDATE orders o
JOIN users u ON o.user_id = u.id
SET o.status = 'vip'
WHERE u.level = 5;
\`\`\`

## 踩坑提示

1. **优化前先 EXPLAIN**：避免盲目加索引，每个索引都有代价。
2. **慢查询日志要采样**：长期开启会有 IO 开销，建议采样一段时间再关闭。
3. **优化后要验证**：用 \`EXPLAIN ANALYZE\` 看实际执行耗时，确认优化生效。
4. **不要过度优化**：80% 性能问题由 20% 慢查询引起，优先解决 TOP 10 慢查询。
5. **大表 ALTER 用在线工具**：\`pt-online-schema-change\` 或 \`gh-ost\`，避免锁表。
6. **缓存要考虑一致性**：Redis 缓存的计数器要在所有写路径上维护，否则数据失真。
7. **分页深度的根本解法是限制翻页**：业务设计上避免深分页场景。
8. **测试环境的数据量要接近生产**：1000 行测不出 1 亿行的性能问题。

## 本章小结

- **慢查询发现**：开启 \`slow_query_log\`，用 \`mysqldumpslow\` 或 \`performance_schema\` 分析
- **COUNT 优化**：缓存、估算、反范式计数表，业务允许近似值时不要追求精确
- **分页优化**：主键游标分页（推荐）、子查询延迟关联、限制最大页数
- **JOIN 优化**：小表驱动大表、被驱动表 JOIN 列必须有索引、MySQL 8.0 用 Hash Join
- **子查询优化**：相关子查询改 JOIN、IN 用半连接（MySQL 8.0 自动优化）
- **ORDER BY 优化**：用复合索引实现"过滤 + 排序"，避免方向不一致触发 filesort
- **GROUP BY 优化**：加索引避免临时表，\`ORDER BY NULL\` 禁用默认排序
- **INSERT 优化**：多行 VALUES、事务批量提交、LOAD DATA INFILE、关闭检查
- **UPDATE / DELETE 优化**：分批处理、用分区表 DROP PARTITION、UPDATE 用 JOIN 替代子查询
- 优化流程：**EXPLAIN 分析 → 针对性优化 → EXPLAIN ANALYZE 验证 → 监控上线**

至此，《MySQL 实战教程》第三部分（高级查询与执行计划）结束。前三部分覆盖了从入门、查询进阶到性能优化的核心知识，足以应对日常 90% 的 MySQL 开发场景。`
  }
];

export { chapters };
