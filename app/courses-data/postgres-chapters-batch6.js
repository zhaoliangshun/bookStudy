// =============================================================
// 《PostgreSQL 实战教程》- 章节批次 6
// -------------------------------------------------------------
// 内容：第六部分 性能优化与运维实战（第 31-36 章）
// =============================================================

const chapters = [
  {
    id: "pg-ch31",
    group: "第六部分 性能优化与运维实战",
    icon: "⚡",
    title: "第 31 章 执行计划 EXPLAIN",
    content: `# 第 31 章 执行计划 EXPLAIN

EXPLAIN 是 PostgreSQL 性能调优的起点。看懂执行计划，才能知道一条 SQL 到底是走索引还是全表扫描、走了哪种连接、消耗了多少内存、估算行数是否准确。本章带你从基础语法到高阶分析，全面掌握 EXPLAIN 的使用。

## 31.1 EXPLAIN 基础语法

PostgreSQL 的 EXPLAIN 有多种形式，最常用的是 \`EXPLAIN\` 与 \`EXPLAIN ANALYZE\`：

\`\`\`sql
-- 1. 只显示执行计划（不实际执行）
EXPLAIN SELECT * FROM users WHERE id = 100;

-- 2. 实际执行 SQL，并显示真实耗时与行数
EXPLAIN ANALYZE SELECT * FROM users WHERE id = 100;

-- 3. 同时显示缓冲区（块）命中情况
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE id = 100;

-- 4. 显示详细字段信息
EXPLAIN (ANALYZE, BUFFERS, VERBOSE) SELECT * FROM users WHERE id = 100;

-- 5. 关闭成本估算，只看实际执行
EXPLAIN (ANALYZE, COSTS OFF) SELECT * FROM users WHERE id = 100;

-- 6. 关闭计时，仅看行数
EXPLAIN (ANALYZE, TIMING OFF) SELECT * FROM users WHERE id = 100;
\`\`\`

**常用选项一览**：

| 选项 | 默认 | 含义 |
| --- | --- | --- |
| ANALYZE | OFF | 实际执行 SQL（DML 可包裹在事务里回滚） |
| BUFFERS | OFF（ANALYZE 时为 ON） | 显示共享块/本地块/临时块读写统计 |
| VERBOSE | OFF | 显示输出字段、schema 等额外信息 |
| COSTS | ON | 显示成本估算（cost=...） |
| TIMING | ON（ANALYZE 时） | 显示每个节点实际耗时 |
| SUMMARY | ON（ANALYZE 时） | 显示总耗时与规划耗时 |
| FORMAT | TEXT | 输出格式：TEXT/JSON/XML/YAML |

> 注意：\`ANALYZE\` 选项会**真正执行**这条 SQL，对 INSERT/UPDATE/DELETE 会有副作用。建议在事务中执行后回滚：\`BEGIN; EXPLAIN ANALYZE UPDATE ...; ROLLBACK;\`

## 31.2 阅读执行计划输出

执行计划是一个**树形结构**，从最内层节点开始执行，向外汇总。缩进越深，越先执行。

\`\`\`sql
EXPLAIN SELECT u.name, o.amount
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE o.created_at >= '2024-01-01';
\`\`\`

典型输出：

\`\`\`
Hash Join  (cost=10.50..100.20 rows=500 width=40)
  Hash Cond: (o.user_id = u.id)
  ->  Seq Scan on orders o  (cost=0.00..80.00 rows=500 width=20)
        Filter: (created_at >= '2024-01-01')
  ->  Hash  (cost=5.00..5.00 rows=200 width=24)
        ->  Seq Scan on users u  (cost=0.00..5.00 rows=200 width=24)
\`\`\`

**关键字段解读**：

- **cost=10.50..100.20**：启动成本..总成本（无单位，是相对值）。
- **rows=500**：估算返回行数。
- **width=40**：每行平均字节数。
- 实际执行后还会有 **actual time=0.5..2.3 rows=500 loops=1**。

**cost 是什么？**

cost 是规划器基于统计信息估算的成本，单位是"顺序读一页的成本"（seq_page_cost，默认 1.0）。它**不是毫秒**，只是一个相对值，用于在多个计划中选成本最小的。

**actual time 是什么？**

只有 \`ANALYZE\` 时才有，单位毫秒。前一个数字是节点自身耗时（不含子节点），后一个数字是包含子节点的累计耗时。

> **铁律**：\`rows\`（估算）与 \`actual rows\`（实际）相差超过 10 倍，通常意味着统计信息过期，需要 \`ANALYZE\` 表。

## 31.3 常见节点类型

### 31.3.1 扫描节点

| 节点 | 含义 | 何时出现 |
| --- | --- | --- |
| **Seq Scan** | 顺序全表扫描 | 没有可用索引，或全表扫描比索引便宜 |
| **Index Scan** | 索引扫描（回表） | 通过索引找到行指针，再回表取数据 |
| **Index Only Scan** | 仅索引扫描 | 所需字段都在索引里，无需回表（需 visibility map） |
| **Bitmap Index Scan + Bitmap Heap Scan** | 位图扫描 | 索引返回大量行但不至于全表扫 |
| **Tid Scan** | CTID 扫描 | 用 \`ctid = '(0,1)'\` 直接定位 |
| **Subquery Scan** | 子查询扫描 | 包裹子查询 |
| **Function Scan** | 函数扫描 | \`SELECT * FROM generate_series(...)\` |

**Index Scan vs Index Only Scan**：

\`\`\`sql
-- 普通索引扫描：先查索引拿到 ctid，再回表取数据
EXPLAIN SELECT id FROM users WHERE email = 'a@b.com';
-- Index Scan using idx_users_email on users

-- 仅索引扫描：索引里就有所需字段，无需回表
CREATE INDEX idx_users_email_id ON users(email, id);
EXPLAIN SELECT id FROM users WHERE email = 'a@b.com';
-- Index Only Scan using idx_users_email_id on users
\`\`\`

> Index Only Scan 要求表的 visibility map 标记该页"全部可见"（即所有事务都能看到），否则仍需回表检查。所以 \`VACUUM\` 充分很关键。

**Bitmap Scan 的两阶段**：

\`\`\`sql
EXPLAIN SELECT * FROM orders WHERE user_id BETWEEN 100 AND 5000;
-- Bitmap Heap Scan on orders
--   Recheck Cond: (user_id >= 100 AND user_id <= 5000)
--   ->  Bitmap Index Scan on idx_orders_user_id
--         Index Cond: (user_id >= 100 AND user_id <= 5000)
\`\`\`

Bitmap Index Scan 先把命中的行指针收集到一个位图，再由 Bitmap Heap Scan 按物理顺序批量回表，避免随机 IO。

### 31.3.2 连接节点

| 节点 | 含义 | 适用场景 |
| --- | --- | --- |
| **Nested Loop** | 嵌套循环 | 驱动表小、内表有索引，返回行数少 |
| **Hash Join** | 哈希连接 | 大表等值连接，内表能放进 work_mem |
| **Merge Join** | 归并连接 | 两表已按连接键排序（如有索引） |

\`\`\`sql
-- Nested Loop：小表驱动，内表走索引
EXPLAIN SELECT * FROM users u JOIN orders o ON o.user_id=u.id WHERE u.id=10;
-- Nested Loop
--   -> Index Scan using users_pkey on users u  (rows=1)
--   -> Index Scan using idx_orders_user_id on orders o  (rows=many)

-- Hash Join：大表等值连接
EXPLAIN SELECT * FROM orders o JOIN products p ON o.product_id = p.id;
-- Hash Join
--   Hash Cond: (o.product_id = p.id)
--   -> Seq Scan on orders o
--   -> Hash
--       -> Seq Scan on products p

-- Merge Join：两端已排序
EXPLAIN SELECT * FROM users u JOIN user_profiles p ON u.id = p.user_id;
-- Merge Join
--   Merge Cond: (u.id = p.user_id)
--   -> Index Scan using users_pkey on users u
--   -> Index Scan using user_profiles_pkey on user_profiles p
\`\`\`

**何时选哪种连接？**

- 返回行数很少（几十几百）→ Nested Loop。
- 大表等值连接 → Hash Join。
- 两边都有序（索引或已 Sort）→ Merge Join。
- Hash Join 内表必须能放进 \`work_mem\`，否则会分批写磁盘，性能骤降。

### 31.3.3 其他常见节点

- **Sort**：显式排序（\`ORDER BY\` 且无可用索引）。
- **Aggregate**：聚合（\`COUNT/SUM/AVG\`）。
- **HashAggregate**：用哈希表做分组聚合（\`GROUP BY\`）。
- **GroupAggregate**：排序后分组聚合。
- **Limit**：\`LIMIT n\`。
- **Unique**：\`DISTINCT\` 或 \`UNION\`。
- **Gather / Gather Merge**：并行查询的收集节点。
- **Append**：合并多个子计划（\`UNION ALL\`、分区表）。
- **Materialize**：物化子查询结果供多次读取。
- **WindowAgg**：窗口函数。

## 31.4 并行查询

PostgreSQL 从 9.6 起支持并行查询，能利用多核加速大查询。

\`\`\`sql
EXPLAIN SELECT count(*) FROM big_table WHERE val > 100;
-- Finalize Aggregate
--   -> Gather
--         Workers Planned: 4
--         -> Partial Aggregate
--               -> Parallel Seq Scan on big_table
--                    Filter: (val > 100)
\`\`\`

**并行相关参数**：

\`\`\`sql
SHOW max_parallel_workers;             -- 总并行 worker 数，默认 8
SHOW max_parallel_workers_per_gather;  -- 单个 Gather 最大 worker，默认 2
SHOW min_parallel_table_scan_size;     -- 触发并行的表大小阈值，默认 8MB
SHOW parallel_setup_cost;              -- 并行启动成本
SHOW parallel_tuple_cost;              -- 并行每行成本
\`\`\`

\`\`\`sql
-- 临时调大并行度
SET max_parallel_workers_per_gather = 4;

-- 强制开启并行（测试用）
SET min_parallel_table_scan_size = 0;
SET parallel_setup_cost = 0;
\`\`\`

> 并行查询**不适合 OLTP**：小查询启动 worker 的开销超过收益。生产环境保留默认值，仅在分析大表时临时调高。

## 31.5 统计信息与 ANALYZE

规划器依赖统计信息估算行数，统计信息由 \`ANALYZE\` 命令采集，存放在 \`pg_class\` 与 \`pg_stats\` 中。

\`\`\`sql
-- 手动收集统计信息
ANALYZE users;                       -- 单表
ANALYZE users(id, email);            -- 指定列
ANALYZE;                             -- 全库（建议低峰期）

-- 查看表的估算行数
SELECT relname, reltuples::bigint AS est_rows, relpages
FROM pg_class
WHERE relname = 'users';

-- 查看列的统计信息
SELECT attname, n_distinct, most_common_vals, most_common_freqs,
       histogram_bounds, correlation
FROM pg_stats
WHERE tablename = 'users';
\`\`\`

**关键字段**：

| 字段 | 含义 |
| --- | --- |
| n_distinct | 估算的不同值数量（负数表示比例，如 -0.5 表示 50%） |
| most_common_vals | 最常见值 |
| most_common_freqs | 最常见值频率 |
| histogram_bounds | 直方图分桶（用于范围估算） |
| correlation | 物理顺序与逻辑顺序相关性（影响索引扫描成本估算） |

**为什么估算行数不准？**

1. 统计信息过期 → 跑 \`ANALYZE\`。
2. 默认只采样 30000 行 → 调大 \`default_statistics_target\`：
   \`\`\`sql
   ALTER TABLE users ALTER COLUMN email SET STATISTICS 1000;
   ANALYZE users;
   \`\`\`
3. 复杂谓词（函数、OR）→ 规划器估算困难。

**autovacuum 自动维护**：

\`\`\`sql
-- 查看表最近的 analyze 时间
SELECT relname, last_analyze, last_autoanalyze, n_mod_since_analyze
FROM pg_stat_user_tables
WHERE relname = 'users';
\`\`\`

> 大量 UPDATE/DELETE 后 \`n_mod_since_analyze\` 很大，说明统计信息已过期，建议手动 \`ANALYZE\`。

## 31.6 常见坏计划模式

**模式 1：估算行数 1，实际 10 万（Nested Loop 灾难）**

\`\`\`
Nested Loop  (rows=1 ... actual rows=100000)
  -> Seq Scan on small_table  (actual rows=1)
  -> Index Scan on big_table  (actual rows=100000)
\`\`\`

规划器以为驱动表只返回 1 行，于是选了 Nested Loop，结果实际返回 10 万行，内表被扫描 10 万次。修复：\`ANALYZE\` 表或调大 \`default_statistics_target\`。

**模式 2：本该走索引却全表扫描**

可能原因：
- 谓词用了函数：\`WHERE lower(email) = 'a'\`，需建表达式索引 \`CREATE INDEX ON users(lower(email))\`。
- 类型不匹配：字段是 \`varchar\`，查询传了 \`integer\`，隐式转换导致索引失效。
- 统计信息偏差：\`ANALYZE\` 后再看。
- 索引损坏：\`REINDEX TABLE users\`。

**模式 3：Hash Join 溢出磁盘**

\`\`\`
Hash Join  (actual time=... rows=... 
  Memory Usage: 4096kB  Batches: 32  Original Hash Batches: 8)
\`\`\`

\`Batches\` 大于 1 说明内表放不进 work_mem，分批写临时文件。调大 \`work_mem\` 可避免：

\`\`\`sql
SET work_mem = '64MB';
\`\`\`

**模式 4：Sort 溢出磁盘**

\`\`\`
Sort  (actual ... rows=100000  Sort Method: external merge  Disk: 51200kB)
\`\`\`

\`Sort Method: external merge\` 说明排序写磁盘了，调大 \`work_mem\` 让它变成 \`quicksort Memory\`。

## 31.7 实战分析流程

拿到一条慢 SQL，按以下步骤分析：

1. **\`EXPLAIN (ANALYZE, BUFFERS)\` 看真实计划**。
2. **找最慢的节点**：\`actual time\` 最大的一行。
3. **看 rows 估算是否准确**：估算与实际差 10 倍以上先 \`ANALYZE\`。
4. **看扫描方式**：\`Seq Scan\` 是否合理？是否缺索引？
5. **看连接方式**：\`Nested Loop\` 是否误选？\`Hash Join\` 是否溢出？
6. **看 Buffers**：\`shared hit\` 高说明命中 cache，\`shared read\` 高说明物理读多。
7. **看 Sort/Hash 是否落盘**：落盘就调 \`work_mem\`。

\`\`\`sql
-- 推荐的排查语句
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT u.name, count(*) AS cnt
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE o.created_at >= '2024-01-01'
GROUP BY u.name
ORDER BY cnt DESC
LIMIT 20;
\`\`\`

**解读示例**：

\`\`\`
Limit  (cost=200.00..200.05 rows=20 width=24) (actual time=15.2..15.3 rows=20 loops=1)
  ->  Sort  (cost=200.00..201.25 rows=500 width=24) (actual time=15.2..15.2 rows=20 loops=1)
        Sort Key: cnt DESC
        Sort Method: top-N heapsort  Memory: 30kB
        ->  HashAggregate  (cost=180.00..190.00 rows=500 width=24) (actual time=14.0..14.5 rows=480 loops=1)
              Group Key: u.name
              Batches: 1  Memory Usage: 40kB
              ->  Hash Join  (cost=10.50..150.00 rows=500 width=24) (actual time=2.0..12.0 rows=5000 loops=1)
                    Hash Cond: (o.user_id = u.id)
                    Buffers: shared hit=1200 read=50
                    ->  Seq Scan on orders o  (actual time=0.5..8.0 rows=5000 loops=1)
                          Filter: (created_at >= '2024-01-01')
                          Rows Removed by Filter: 95000
                          Buffers: shared hit=1000 read=50
                    ->  Hash  (actual time=1.0..1.0 rows=200 loops=1)
                          Buckets: 1024  Batches: 1  Memory Usage: 40kB
                          ->  Seq Scan on users u  (actual time=0.1..0.5 rows=200 loops=1)
\`\`\`

从上往下分析：
- 最慢的是 Hash Join 的 12ms，主要花在 orders 的 Seq Scan（8ms）。
- orders 扫了 10 万行只留 5000，\`Rows Removed by Filter\` 高达 95000，说明 \`created_at\` 上缺索引。
- \`Buffers: shared read=50\` 说明有 50 个块从磁盘读，可考虑加大 \`shared_buffers\` 或热数据常驻。
- 修复：\`CREATE INDEX idx_orders_created_at ON orders(created_at);\` 再 ANALYZE。

## 31.8 本章小结

- **EXPLAIN**：只看计划；**EXPLAIN ANALYZE**：实际执行看真实耗时。
- **BUFFERS** 选项能看到块命中情况，是判断内存命中率的利器。
- **节点类型**：扫描（Seq/Index/IndexOnly/Bitmap）、连接（NestedLoop/Hash/Merge）、聚合、Sort、Gather。
- **cost 是相对值**，不是毫秒；\`actual time\` 才是真实耗时。
- **统计信息**：\`pg_class\`/\`pg_stats\` + \`ANALYZE\` 命令，估算行数不准先 ANALYZE。
- **坏计划模式**：估算偏差导致 Nested Loop 灾难、Hash/Sort 溢出磁盘、谓词函数导致索引失效。
- **排查七步**：EXPLAIN ANALYZE → 找最慢节点 → 看 rows 估算 → 看扫描 → 看连接 → 看 Buffers → 看落盘。

> EXPLAIN 是 PG 调优的第一课，也是终身受用的技能。养成"慢 SQL 先 EXPLAIN ANALYZE"的肌肉记忆。`
  },
  {
    id: "pg-ch32",
    group: "第六部分 性能优化与运维实战",
    icon: "🚀",
    title: "第 32 章 查询优化技巧",
    content: `# 第 32 章 查询优化技巧

写出能跑的 SQL 容易，写出跑得快的 SQL 才是真功夫。本章总结 PostgreSQL 中最实用的查询优化技巧，从写法到执行到监控，帮你把每一条 SQL 都打磨到最优。

## 32.1 避免 SELECT *

\`SELECT *\` 是性能杀手：多取无用列、破坏 Index Only Scan、增加网络与内存开销。

\`\`\`sql
-- 坏：取了所有列，无法用 Index Only Scan
EXPLAIN SELECT * FROM users WHERE email = 'a@b.com';
-- Index Scan（回表）

-- 好：只取需要的列
CREATE INDEX idx_users_email_name ON users(email, name);
EXPLAIN SELECT name FROM users WHERE email = 'a@b.com';
-- Index Only Scan（不回表，快很多）
\`\`\`

**Index Only Scan 的前提**：查询的所有列都在索引里。所以"少取列"不仅是减少传输，更是触发更快扫描方式的关键。

## 32.2 EXISTS 优于 IN

子查询用 \`IN\` 时，PG 会展开成 Semi Join；用 \`EXISTS\` 同样是 Semi Join，但在某些场景更稳定。

\`\`\`sql
-- 坏：IN 子查询可能产生低效计划
SELECT * FROM orders o
WHERE o.user_id IN (SELECT id FROM users WHERE status = 'active');

-- 好：EXISTS 通常更稳定
SELECT * FROM orders o
WHERE EXISTS (
  SELECT 1 FROM users u
  WHERE u.id = o.user_id AND u.status = 'active'
);

-- 也可用 JOIN + DISTINCT，或现代 PG 的 IN 优化（通常等价）
SELECT DISTINCT o.* FROM orders o
JOIN users u ON u.id = o.user_id WHERE u.status = 'active';
\`\`\`

> 现代 PG（10+）对 IN 的优化已很好，多数场景 IN 与 EXISTS 性能相当。但 \`NOT EXISTS\` 几乎总是比 \`NOT IN\` 快，因为 NOT IN 遇到 NULL 语义复杂。

## 32.3 CTE 物化陷阱

PG 12 之前，CTE（WITH）是**强制物化**的，相当于临时表，会阻止谓词下推。PG 12+ 默认改为内联（inline），但有例外。

\`\`\`sql
-- PG 12+ 默认内联，谓词可下推，性能好
WITH active_users AS (
  SELECT id, name FROM users WHERE status = 'active'
)
SELECT * FROM active_users WHERE id = 100;
-- 等价于：SELECT id, name FROM users WHERE status='active' AND id=100;

-- 强制物化（慎用！）
WITH active_users AS MATERIALIZED (
  SELECT id, name FROM users WHERE status = 'active'
)
SELECT * FROM active_users WHERE id = 100;
-- 会先算出所有 active 用户，再过滤 id=100，慢

-- 强制不物化
WITH active_users AS NOT MATERIALIZED (
  SELECT * FROM users WHERE status = 'active'
)
SELECT * FROM active_users WHERE id = 100;
\`\`\`

**何时需要 MATERIALIZED？**

- CTE 被多次引用，避免重复计算。
- CTE 内部有副作用（如 \`INSERT ... RETURNING\`）。
- 想锁定中间结果集大小。

**何时避免？**

- CTE 只引用一次且希望谓词下推 → 默认内联即可。
- 大表 CTE 加小过滤条件 → 物化会全量计算。

## 32.4 连接顺序与限制

PG 规划器会自动选择连接顺序，但有时需要干预。

**JOIN 顺序的影响**：

\`\`\`sql
-- 坏：先 join 大表再过滤
SELECT * FROM big_orders o
JOIN big_items i ON i.order_id = o.id
WHERE o.user_id = 100;

-- 好：用子查询先过滤小结果集
SELECT * FROM (
  SELECT * FROM big_orders WHERE user_id = 100
) o
JOIN big_items i ON i.order_id = o.id;
\`\`\`

不过 PG 规划器通常能做"谓词下推"，自动把 \`user_id=100\` 推到子查询里。但复杂 SQL 下推可能失败，可手工改写。

**强制连接顺序**（谨慎）：

\`\`\`sql
-- 关闭 geqo（遗传算法优化器），强制按写法顺序
SET geqo = off;
-- 然后 JOIN 顺序接近书写顺序（但不保证）
\`\`\`

更常用的是 \`JOIN ... ON\` 加合适的索引与统计信息，让规划器自己选对。

## 32.5 LIMIT 与提前终止

\`LIMIT\` 能让 PG 找到足够行就停止，配合索引特别高效。

\`\`\`sql
-- 有索引时，LIMIT 几乎瞬间返回
EXPLAIN SELECT * FROM users ORDER BY id LIMIT 10;
-- Limit + Index Scan（用 primary key 扫前 10 行）

-- 但 OFFSET 深分页会扫描并丢弃前面的行
EXPLAIN SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 100000;
-- Limit + Index Scan，但要扫描 100010 行
\`\`\`

**游标分页（keyset pagination）**：用上一页最后一条记录的值作为游标。

\`\`\`sql
-- 第一页
SELECT id, name FROM users ORDER BY id LIMIT 10;

-- 假设上一页最后 id = 12345，取下一页
SELECT id, name FROM users WHERE id > 12345 ORDER BY id LIMIT 10;
\`\`\`

\`\`\`sql
-- 多列游标（如按 created_at DESC, id DESC 排序）
SELECT id, created_at FROM orders
ORDER BY created_at DESC, id DESC
LIMIT 10;

-- 下一页：用上一页最后一行的 (created_at, id)
SELECT id, created_at FROM orders
WHERE (created_at, id) < ('2024-01-01 12:00:00', 5000)
ORDER BY created_at DESC, id DESC
LIMIT 10;
\`\`\`

> 游标分页是深分页的唯一正解，OFFSET 在百万级就不可用。

## 32.6 批量操作

逐行 INSERT/UPDATE 慢得难以忍受，批量操作能提升 10~100 倍。

**批量 INSERT**：

\`\`\`sql
-- 坏：1000 次单行插入
INSERT INTO logs(msg) VALUES ('a');
INSERT INTO logs(msg) VALUES ('b');
-- ...

-- 好：一次多行
INSERT INTO logs(msg) VALUES ('a'), ('b'), ('c'), ...;

-- 更好：COPY（最快）
COPY logs(msg) FROM '/path/to/data.csv' WITH (FORMAT csv);

-- 或从程序端用 COPY 协议（libpq PQexecCopy）
\`\`\`

**UPSERT 批量**：

\`\`\`sql
INSERT INTO products(id, name, price)
VALUES (1,'A',10), (2,'B',20), (3,'C',30)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price;
\`\`\`

**批量 UPDATE 用 CASE**：

\`\`\`sql
-- 坏：N 次 UPDATE
UPDATE products SET price=10 WHERE id=1;
UPDATE products SET price=20 WHERE id=2;

-- 好：一次 UPDATE
UPDATE products SET price = CASE id
  WHEN 1 THEN 10
  WHEN 2 THEN 20
  WHEN 3 THEN 30
END
WHERE id IN (1,2,3);
\`\`\`

**删除大表数据**：

\`\`\`sql
-- 坏：一次性删 1000 万行，长事务 + 大量死元组
DELETE FROM logs WHERE created_at < '2023-01-01';

-- 好：分批删
DELETE FROM logs
WHERE ctid IN (
  SELECT ctid FROM logs
  WHERE created_at < '2023-01-01'
  LIMIT 10000
);
-- 反复执行直到删完

-- 更好：按分区 TRUNCATE
TRUNCATE logs_2022;
\`\`\`

## 32.7 避免索引列上的函数

在索引列上用函数会让索引失效。

\`\`\`sql
-- 坏：lower(email) 函数让索引失效
SELECT * FROM users WHERE lower(email) = 'a@b.com';
-- Seq Scan

-- 方案 1：建表达式索引
CREATE INDEX idx_users_email_lower ON users(lower(email));
SELECT * FROM users WHERE lower(email) = 'a@b.com';
-- Index Scan

-- 方案 2：用 citext 扩展（第 35 章）
CREATE EXTENSION citext;
ALTER TABLE users ALTER COLUMN email TYPE citext;
SELECT * FROM users WHERE email = 'A@B.com';  -- 大小写不敏感，走索引

-- 日期函数陷阱
-- 坏：
SELECT * FROM orders WHERE DATE(created_at) = '2024-01-01';
-- 好：改范围
SELECT * FROM orders
WHERE created_at >= '2024-01-01' AND created_at < '2024-01-02';
\`\`\`

## 32.8 预编译语句

预编译语句（prepared statement）能复用执行计划，省去解析与规划开销，对高频 OLTP 尤其重要。

\`\`\`sql
-- SQL 层
PREPARE get_user AS SELECT * FROM users WHERE id = $1;
EXECUTE get_user(100);
EXECUTE get_user(200);
DEALLOCATE get_user;
\`\`\`

\`\`\`python
# psycopg2 / psycopg3
import psycopg
conn = psycopg.connect("dbname=test")
cur = conn.cursor()
stmt = "SELECT * FROM users WHERE id = %s"
# psycopg 自动用 prepared statement（3.1+）
cur.execute(stmt, (100,))
cur.execute(stmt, (200,))  # 复用计划
\`\`\`

\`\`\`java
// JDBC
PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE id = ?");
ps.setInt(1, 100); ps.executeQuery();
ps.setInt(1, 200); ps.executeQuery();
\`\`\`

**generic plan 陷阱**（PG 12+）：

PG 12+ 引入 generic plan，前 5 次用 custom plan（按参数生成），之后若估算成本接近就切换到 generic plan。但若数据分布不均（如某值占 99%），generic plan 可能选错索引。可用 \`plan_cache_mode = force_custom_plan\` 强制每次重新规划。

## 32.9 pg_stat_statements 慢查询

\`pg_stat_statements\` 是 PG 内置的慢查询统计扩展，记录每条 SQL 的调用次数、总耗时、平均耗时、IO、行数等。

\`\`\`sql
-- 启用（需在 shared_preload_libraries）
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 10 平均耗时
SELECT query, calls, mean_exec_time, total_exec_time, rows
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Top 10 总耗时
SELECT query, calls, total_exec_time, mean_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- Top 10 调用次数
SELECT query, calls, total_exec_time
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 10;

-- 高 IO 的 SQL
SELECT query, shared_blks_read, shared_blks_hit,
       100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0) AS hit_pct
FROM pg_stat_statements
ORDER BY shared_blks_read DESC
LIMIT 10;

-- 重置统计
SELECT pg_stat_statements_reset();
\`\`\`

> pg_stat_statements 是 PG 调优的核心工具，生产环境必装。配合第 34 章的监控，形成"慢查询→分析→优化"闭环。

## 32.10 N+1 查询问题

ORM 易引发 N+1：1 次主查询 + N 次关联查询。

\`\`\`python
# 坏：N+1
users = User.objects.all()[:100]      # 1 次
for u in users:
    print(u.profile.bio)              # 100 次！
\`\`\`

\`\`\`python
# 好：JOIN 或 prefetch
# Django
users = User.objects.select_related('profile')[:100]   # 1 次 JOIN
# 或 prefetch_related 处理多对多
users = User.objects.prefetch_related('tags')[:100]
\`\`\`

\`\`\`sql
-- SQL 层：直接 JOIN
SELECT u.*, p.bio FROM users u
LEFT JOIN user_profiles p ON p.user_id = u.id
LIMIT 100;
\`\`\`

**检测方法**：用 pg_stat_statements 看是否有大量 calls 几乎相同的 SQL，且单次耗时很短——典型 N+1 特征。

## 32.11 COUNT 估算

\`SELECT count(*) FROM big_table\` 在 PG 中要扫全表（或扫索引），很慢。PG 不维护表的精确行数（不像 MySQL InnoDB 的近似值）。

\`\`\`sql
-- 精确 count：慢
SELECT count(*) FROM big_table;

-- 估算：用 pg_class.reltuples
SELECT reltuples::bigint AS est_rows
FROM pg_class WHERE relname = 'big_table';

-- 带条件估算：用 EXPLAIN 解析
-- 直接看 EXPLAIN 输出的 rows
EXPLAIN SELECT * FROM big_table WHERE status = 'active';

-- 更精确的估算（PostgreSQL 14+）
-- 用 json 解析 EXPLAIN FORMAT JSON
SELECT (plan->0->'Plan'->>'Plan Rows')::bigint AS est_rows
FROM (
  SELECT json_agg(plan) AS plan
  FROM EXPLAIN(FORMAT JSON)
  SELECT * FROM big_table WHERE status = 'active'
) t;
\`\`\`

> 列表页"共 N 条"用估算即可，不必精确到个位。

## 32.12 其他实用技巧

**UNION ALL 替代 UNION**：\`UNION\` 会去重，需要 Sort/Hash；\`UNION ALL\` 不去重，更快。

\`\`\`sql
-- 坏（如果确认无重复）
SELECT id FROM users WHERE status='active'
UNION
SELECT id FROM users WHERE status='vip';

-- 好
SELECT id FROM users WHERE status='active'
UNION ALL
SELECT id FROM users WHERE status='vip';
\`\`\`

**用 generate_series 生成序列**：

\`\`\`sql
-- 生成日期序列
SELECT date::date FROM generate_series(
  '2024-01-01'::date, '2024-01-31'::date, '1 day'
) AS date;

-- 与 LEFT JOIN 配合做"无数据日期补 0"
SELECT d.date, count(o.id) AS order_cnt
FROM generate_series('2024-01-01'::date, '2024-01-31'::date, '1 day') d
LEFT JOIN orders o ON o.created_at::date = d.date
GROUP BY d.date ORDER BY d.date;
\`\`\`

**避免 OFFSET 深分页**（见 32.5）。

**用 FILTER 替代 CASE 做聚合**（PG 9.4+）：

\`\`\`sql
-- 坏
SELECT count(CASE WHEN status='active' THEN 1 END) AS active_cnt,
       count(CASE WHEN status='vip' THEN 1 END) AS vip_cnt
FROM users;

-- 好：FILTER 语法更清晰，性能相同
SELECT count(*) FILTER (WHERE status='active') AS active_cnt,
       count(*) FILTER (WHERE status='vip') AS vip_cnt
FROM users;
\`\`\`

## 32.13 本章小结

- **SELECT \***：能免则免，少取列才能触发 Index Only Scan。
- **EXISTS vs IN**：\`NOT EXISTS\` 几乎总优于 \`NOT IN\`。
- **CTE**：PG 12+ 默认内联，慎用 MATERIALIZED。
- **连接顺序**：相信规划器，但用子查询/索引辅助。
- **LIMIT**：能提前终止，深分页用游标（keyset）。
- **批量操作**：COPY > 多行 INSERT > 单行 INSERT；分批删除大表。
- **索引列禁函数**：要函数就建表达式索引。
- **预编译语句**：OLTP 必备，注意 generic plan 陷阱。
- **pg_stat_statements**：慢查询分析核心工具，必装。
- **N+1**：ORM 痛点，用 JOIN 或 prefetch 解决。
- **count 估算**：用 \`pg_class.reltuples\` 或 EXPLAIN 估算，别死磕精确 count。

> 查询优化是"积少成多"的功夫：每条 SQL 快 10ms，一万 QPS 就是 100 秒/秒的节省。`
  },
  {
    id: "pg-ch33",
    group: "第六部分 性能优化与运维实战",
    icon: "⚙️",
    title: "第 33 章 配置调优",
    content: `# 第 33 章 配置调优

PostgreSQL 开箱即用的默认配置偏保守（为了适配最小 256MB 内存的机器），生产环境必须重新调参。本章讲解 \`postgresql.conf\` 中最关键的一组参数，给出基于内存的经验值，并介绍 pg_tune 工具。

## 33.1 配置文件体系

\`\`\`bash
# 主配置文件位置（常见）
/etc/postgresql/16/main/postgresql.conf       # Debian/Ubuntu
/var/lib/pgsql/16/data/postgresql.conf        # RHEL/CentOS

# 查看 PG 数据目录
SHOW data_directory;

# 查看配置文件位置
SHOW config_file;
SHOW hba_file;
SHOW ident_file;
\`\`\`

**查看与修改参数**：

\`\`\`sql
-- 查看单个参数
SHOW shared_buffers;
SHOW work_mem;

-- 查看所有参数（含来源：配置文件/命令行/默认）
SELECT name, setting, unit, source, context, min_val, max_val
FROM pg_settings
WHERE name IN ('shared_buffers','work_mem','max_connections')
ORDER BY name;

-- 动态修改（重启后失效）
ALTER SYSTEM SET work_mem = '64MB';   -- 写入 postgresql.auto.conf
SELECT pg_reload_conf();              -- 重新加载（对 SIGHUP 类型参数生效）

-- 修改后查看
SHOW work_mem;
\`\`\`

**context 字段含义**：

| context | 含义 |
| --- | --- |
| internal | 编译时固定，不可改 |
| postmaster | 改后需**重启** PostgreSQL 服务 |
| sighup | 改后 \`pg_reload_conf()\` 即可生效，无需断开连接 |
| superuser-backend | 新连接生效 |
| backend | 新连接生效 |
| superuser | 超级用户会话级可改 |
| user | 普通用户会话级可改 |

> \`shared_buffers\`、\`max_connections\` 是 postmaster 级，必须重启；\`work_mem\`、\`log_min_duration_statement\` 是 user/superuser 级，可会话内即时改。

## 33.2 内存参数

### 33.2.1 shared_buffers

PG 的共享缓冲池，所有连接共用的数据页缓存，相当于 MySQL 的 buffer pool。

\`\`\`ini
# postgresql.conf
shared_buffers = 4GB
\`\`\`

**经验值**：物理内存的 **25%**（专用服务器，Linux 自身有 page cache 会再缓存一部分）。一般不超过 40%。

\`\`\`sql
-- 查看
SHOW shared_buffers;

-- 估算命中率（应 > 99%）
SELECT
  sum(blks_hit) AS hit,
  sum(blks_read) AS read,
  100.0 * sum(blks_hit) / NULLIF(sum(blks_hit) + sum(blks_read), 0) AS hit_pct
FROM pg_stat_database;
\`\`\`

### 33.2.2 work_mem

单个查询的排序、哈希内存上限。**不是全局**，是**每个操作**的内存。

\`\`\`ini
work_mem = 64MB
\`\`\`

**估算公式**：

\`\`\`
max_work_mem = (物理内存 - shared_buffers - 系统预留) / (max_connections × 平均每连接排序数)
\`\`\`

实际中 1000 连接 × 64MB = 64GB 是不现实的，所以 \`work_mem\` 不能设太大。常见值 **4MB~64MB**。

\*\*会话级调大（不影响全局）\*\*：

\`\`\`sql
-- 某个大查询临时调大
SET LOCAL work_mem = '256MB';
SELECT ... ORDER BY ...;  -- 排序不再落盘
\`\`\`

### 33.2.3 maintenance_work_mem

VACUUM、CREATE INDEX、ALTER TABLE 等维护操作的内存上限。

\`\`\`ini
maintenance_work_mem = 512MB
\`\`\`

可设大些（如 1GB），因为维护操作通常并发低。建索引时大内存能显著加速。

### 33.2.4 effective_cache_size

告诉规划器"操作系统 page cache + shared_buffers 大概有多少"，**不分配实际内存**，只是个估算提示。

\`\`\`ini
effective_cache_size = 12GB
\`\`\`

**经验值**：物理内存的 **50%~75%**。设小了规划器会低估索引扫描的收益，倾向 Seq Scan。

\`\`\`sql
-- Linux 查看 page cache
free -h
# available 列大致是 OS 可用缓存
\`\`\`

### 33.2.5 内存参数速查表

| 参数 | 经验值 | context |
| --- | --- | --- |
| shared_buffers | 内存 25% | postmaster |
| work_mem | 4~64MB | user |
| maintenance_work_mem | 256MB~1GB | user |
| effective_cache_size | 内存 50~75% | user |
| temp_buffers | 8~32MB（临时表） | user |

## 33.3 WAL 与检查点

### 33.3.1 wal_buffers

WAL 日志的共享缓存。默认 \`-1\`（自动取 shared_buffers 的 1/32，上限 16MB）。

\`\`\`ini
wal_buffers = 16MB
\`\`\`

一般用默认即可，除非写并发极高才调到 32~64MB。

### 33.3.2 checkpoint 设置

检查点把脏页刷盘，是 IO 峰值的来源。

\`\`\`ini
checkpoint_timeout = 10min       # 检查点间隔，默认 5min
max_wal_size = 4GB               # 检查点间最大 WAL，默认 1GB
min_wal_size = 1GB               # WAL 最小保留
checkpoint_completion_target = 0.9  # 刷脏在间隔的 90% 内匀速完成
\`\`\`

**调优思路**：\`checkpoint_timeout\` 调到 10~30min，\`max_wal_size\` 调大避免频繁检查点。但太大会增加崩溃恢复时间。

### 33.3.3 synchronous_commit

事务提交时是否等待 WAL 刷盘。

\`\`\`ini
synchronous_commit = on    # 默认，每事务等待 WAL fsync
# 可选：off / local / remote_write / remote_apply / on
\`\`\`

| 值 | 行为 | 适用 |
| --- | --- | --- |
| off | 提交不等 fsync，可能丢最近几毫秒事务 | 日志、可容忍少量丢失 |
| local | 等本地 fsync（默认同 on） | 单机 |
| remote_write | 等备库写出到 OS（未 fsync） | 异步备库 |
| remote_apply | 等备库应用完 | 强一致读写分离 |
| on | 等本地 fsync | 默认，金融场景 |

\`\`\`sql
-- 某些非关键事务会话级关掉
SET LOCAL synchronous_commit = off;
INSERT INTO logs ...;
\`\`\`

### 33.3.4 WAL 与检查点速查

\`\`\`ini
wal_buffers = 16MB
checkpoint_timeout = 15min
max_wal_size = 8GB
min_wal_size = 2GB
checkpoint_completion_target = 0.9
synchronous_commit = on
full_page_writes = on          # 容忍断电，生产保持 on
wal_compression = on           # WAL 压缩（PG 14+），减少 WAL 体积
\`\`\`

## 33.4 连接与并发

### 33.4.1 max_connections

\`\`\`ini
max_connections = 200
\`\`\`

PG 每连接一个进程，连接数过高会消耗内存与上下文切换。**推荐用连接池**（PgBouncer）把 \`max_connections\` 控制在 100~300。

\`\`\`sql
SHOW max_connections;
SHOW superuser_reserved_connections;  -- 为超管保留的连接数，默认 3
\`\`\`

### 33.4.2 连接池 PgBouncer

\`\`\`ini
# pgbouncer.ini
[databases]
test = host=127.0.0.1 port=5432 dbname=test

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
pool_mode = transaction      # 事务级池化，复用度最高
default_pool_size = 20       # 每数据库/用户的后端连接数
max_client_conn = 1000       # 客户端连接上限
\`\`\`

**三种 pool_mode**：

- **session**：会话级，连接绑定整个会话。
- **transaction**：事务级，事务结束归还连接（推荐）。
- **statement**：语句级，每个语句后归还（不支持事务）。

> transaction 模式下不能用 prepared statement、SET、临时表等会话级特性，需谨慎。

### 33.4.3 其他连接参数

\`\`\`ini
tcp_keepalives_idle = 60       # 空闲 60s 后发 keepalive
tcp_keepalives_interval = 10   # 每 10s 探测一次
tcp_keepalives_count = 5       # 5 次失败判定断开
idle_in_transaction_session_timeout = 600000  # 空闲事务 10 分钟超时
\`\`\`

\`idle_in_transaction_session_timeout\` 是防"事务挂着不提交"的利器，生产必设。

## 33.5 autovacuum 调优

autovacuum 自动清理死元组并更新统计信息，默认开启。

\`\`\`ini
autovacuum = on                       # 总开关
track_counts = on                     # 必须开，autovacuum 依赖它
autovacuum_max_workers = 3            # worker 数
autovacuum_naptime = 1min             # 轮询间隔
autovacuum_vacuum_threshold = 50      # 触发阈值：死元组基础值
autovacuum_vacuum_scale_factor = 0.2  # 触发阈值：死元组比例
autovacuum_analyze_threshold = 50
autovacuum_analyze_scale_factor = 0.1
\`\`\`

**触发条件**：\`dead_tuples > threshold + scale_factor × reltuples\`。

\`\`\`sql
-- 表级覆盖（写密集大表更激进）
ALTER TABLE big_table SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_vacuum_threshold = 1000
);

-- 查看表 autovacuum 历史
SELECT relname, n_dead_tup, last_autovacuum, last_autoanalyze
FROM pg_stat_user_tables
WHERE n_dead_tup > 0
ORDER BY n_dead_tup DESC;
\`\`\`

**常见误区**：

- autovacuum 不会"防止膨胀"，只能"控制膨胀"。
- 长事务会阻塞 vacuum（vacuum 不能清理比最老活跃事务更新的死元组）。
- 大表 vacuum 慢 → 调大 \`maintenance_work_mem\`，或分批 DELETE。

## 33.6 JIT 与其他

PG 11+ 引入 JIT（基于 LLVM），对长查询（分析型）有加速，但对短查询有编译开销。

\`\`\`ini
jit = on                         # 默认开
jit_above_cost = 100000          # 成本超过此值才用 JIT
jit_inline_above_cost = 500000
jit_optimize_above_cost = 500000
\`\`\`

**OLTP 场景建议关闭**：

\`\`\`ini
jit = off
\`\`\`

因为 OLTP 查询成本远低于 \`jit_above_cost\`，但偶尔会误触发，导致延迟抖动。

**其他建议**：

\`\`\`ini
listen_addresses = '*'           # 监听地址，生产用内网 IP
timezone = 'Asia/Shanghai'
lc_messages = 'en_US.UTF-8'      # 日志用英文便于检索
default_statistics_target = 100  # 默认统计精度
random_page_cost = 1.1           # SSD 调到 1.1，机械盘 4.0
effective_io_concurrency = 200   # SSD 调到 200，机械盘 1
max_worker_processes = 16        # 总 worker 数
max_parallel_workers = 16        # 并行 worker 数
max_parallel_workers_per_gather = 4
\`\`\`

**random_page_cost**：默认 4.0（机械盘），SSD 应调到 1.1。否则规划器会高估随机读成本，倾向 Seq Scan。

## 33.7 基于 RAM 的经验值

| RAM | shared_buffers | effective_cache_size | work_mem | maintenance_work_mem | max_connections |
| --- | --- | --- | --- | --- | --- |
| 2GB | 512MB | 1.5GB | 4MB | 128MB | 100 |
| 4GB | 1GB | 3GB | 8MB | 256MB | 150 |
| 8GB | 2GB | 6GB | 16MB | 512MB | 200 |
| 16GB | 4GB | 12GB | 32MB | 512MB | 300 |
| 32GB | 8GB | 24GB | 64MB | 1GB | 300 |
| 64GB | 16GB | 48GB | 64MB | 2GB | 400 |
| 128GB | 32GB | 96GB | 128MB | 2GB | 500 |

**口诀**：
- shared_buffers = RAM × 25%
- effective_cache_size = RAM × 75%
- work_mem 谨慎，4~64MB 之间
- maintenance_work_mem = RAM × 1~2%，封顶 2GB

## 33.8 pg_tune 工具

\`pgtune\` 根据硬件自动生成配置建议。

**在线版**：访问 \`https://pgtune.leopard.in.ua/\`

**命令行版**：

\`\`\`bash
# 安装
pip install pgtune

# 生成
pgtune --input-config=postgresql.conf --output-config=postgresql.conf.tuned \\
  --max-conconnections=200 --pg-version=16 --total-memory=16GB --cpu-num=8 --drive-type=ssd
\`\`\`

**生成的配置示例**（16GB/8核/SSD）：

\`\`\`ini
# Memory
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
work_mem = 26214kB   # 按 max_connections 估算

# Parallelism
max_worker_processes = 8
max_parallel_workers_per_gather = 4
max_parallel_workers = 8

# WAL
wal_buffers = 16MB
min_wal_size = 1GB
max_wal_size = 4GB

# IO
random_page_cost = 1.1
effective_io_concurrency = 200
\`\`\`

> pgtune 是起点不是终点，生成后还要结合实际负载微调。

## 33.9 完整生产配置模板

\`\`\`ini
# ============================================================
# PostgreSQL 16 生产配置模板（16GB 内存 / 8 核 / SSD）
# ============================================================

# ---------- 连接 ----------
listen_addresses = '*'
port = 5432
max_connections = 200
superuser_reserved_connections = 5
tcp_keepalives_idle = 60
tcp_keepalives_interval = 10
tcp_keepalives_count = 5
idle_in_transaction_session_timeout = 600000

# ---------- 内存 ----------
shared_buffers = 4GB
work_mem = 32MB
maintenance_work_mem = 1GB
effective_cache_size = 12GB
temp_buffers = 16MB

# ---------- WAL ----------
wal_buffers = 16MB
wal_level = replica
synchronous_commit = on
checkpoint_timeout = 15min
max_wal_size = 8GB
min_wal_size = 2GB
checkpoint_completion_target = 0.9
full_page_writes = on
wal_compression = on
max_wal_senders = 10          # 流复制用

# ---------- 并行 ----------
max_worker_processes = 16
max_parallel_workers = 16
max_parallel_workers_per_gather = 4
max_parallel_maintenance_workers = 4

# ---------- IO ----------
random_page_cost = 1.1
seq_page_cost = 1.0
effective_io_concurrency = 200

# ---------- autovacuum ----------
autovacuum = on
track_counts = on
autovacuum_max_workers = 3
autovacuum_naptime = 30s
autovacuum_vacuum_scale_factor = 0.1
autovacuum_analyze_scale_factor = 0.05

# ---------- 统计与规划 ----------
default_statistics_target = 100
jit = off                     # OLTP 关，OLAP 开

# ---------- 日志（详见第 34 章）----------
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 500   # 慢查询阈值 ms
log_checkpoints = on
log_connections = off
log_lock_waits = on
log_temp_files = 0
log_autovacuum_min_duration = 0
log_line_prefix = '%t [%p] user=%u,db=%d,app=%a,client=%h '

# ---------- 时区与字符集 ----------
timezone = 'Asia/Shanghai'
lc_messages = 'en_US.UTF-8'
lc_monetary = 'en_US.UTF-8'

# ---------- 扩展 ----------
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.max = 10000
pg_stat_statements.track = all
\`\`\`

\`\`\`bash
# 应用配置后重启
systemctl restart postgresql-16

# 或只 reload（对 sighup 参数）
pg_ctl reload -D $PGDATA
# 或 SQL 内
SELECT pg_reload_conf();
\`\`\`

## 33.10 本章小结

- **配置文件**：\`postgresql.conf\` + \`ALTER SYSTEM\` 写入 \`postgresql.auto.conf\`。
- **context**：postmaster 需重启，sighup 可 reload，user 可会话级改。
- **内存四件套**：shared_buffers（25%）、work_mem（4~64MB）、maintenance_work_mem（1~2GB）、effective_cache_size（75%）。
- **WAL/检查点**：调大 \`checkpoint_timeout\` 与 \`max_wal_size\` 减少检查点频率。
- **连接**：用 PgBouncer 控制连接数，\`idle_in_transaction_session_timeout\` 必设。
- **autovacuum**：默认开，大表调小 \`scale_factor\`。
- **JIT**：OLTP 关，OLAP 开。
- **SSD**：\`random_page_cost=1.1\`，\`effective_io_concurrency=200\`。
- **pgtune**：起点工具，生成后按实际负载微调。

> 配置调优没有"最优值"，只有"适合你负载的值"。先按模板上线，再根据监控数据持续调整。`
  },
  {
    id: "pg-ch34",
    group: "第六部分 性能优化与运维实战",
    icon: "📊",
    title: "第 34 章 监控与诊断",
    content: `# 第 34 章 监控与诊断

"可观测性"是运维的眼睛。本章带你建立 PostgreSQL 的监控体系：从 \`pg_stat_activity\` 看实时会话，到 \`pg_stat_statements\` 看慢查询，到日志与 pgbadner 分析，再到膨胀检测与健康检查，形成完整的诊断闭环。

## 34.1 pg_stat_activity

\`pg_stat_activity\` 是当前所有连接的实时视图，相当于 MySQL 的 \`SHOW PROCESSLIST\`。

\`\`\`sql
-- 查看所有连接
SELECT pid, usename, datname, client_addr, state,
       query_start, state_change, query
FROM pg_stat_activity
WHERE datname IS NOT NULL
ORDER BY query_start;

-- 只看活跃查询
SELECT pid, usename, state, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;

-- 按状态统计
SELECT state, count(*)
FROM pg_stat_activity
GROUP BY state;
-- active / idle / idle in transaction / idle in transaction (aborted)
\`\`\`

**state 字段含义**：

| state | 含义 | 风险 |
| --- | --- | --- |
| active | 正在执行查询 | - |
| idle | 空闲，等新查询 | 连接占用 |
| idle in transaction | 在事务中但没在执行 | 危险！持锁、阻塞 vacuum |
| idle in transaction (aborted) | 事务中出错后闲置 | 同上 |

**终止慢查询**：

\`\`\`sql
-- 终止查询但保留连接
SELECT pg_cancel_backend(12345);

-- 终止连接（更彻底）
SELECT pg_terminate_backend(12345);

-- 批量终止超过 5 分钟的活跃查询
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'active'
  AND now() - query_start > interval '5 minutes'
  AND pid <> pg_backend_pid();
\`\`\`

**找空闲事务（高危）**：

\`\`\`sql
SELECT pid, usename, application_name, client_addr,
       now() - state_change AS idle_time, query
FROM pg_stat_activity
WHERE state = 'idle in transaction'
ORDER BY idle_time DESC;
\`\`\`

> 空闲事务是头号杀手：占用连接、持锁阻塞他人、阻塞 vacuum 导致膨胀。生产务必设 \`idle_in_transaction_session_timeout\`。

**查看等待事件**（PG 9.6+）：

\`\`\`sql
SELECT pid, wait_event_type, wait_event, state, query
FROM pg_stat_activity
WHERE wait_event IS NOT NULL
  AND state = 'active';
\`\`\`

| wait_event_type | 含义 |
| --- | --- |
| Lock | 锁等待 |
| BufferPin | 缓冲区等待 |
| Activity | 后台进程活动 |
| Extension | 扩展等待 |
| IO | IO 等待 |
| Network | 网络等待 |

## 34.2 pg_stat_statements

慢查询统计的利器，需在 \`shared_preload_libraries\` 中加载并 \`CREATE EXTENSION\`。

\`\`\`sql
-- 在 postgresql.conf
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.max = 10000
pg_stat_statements.track = all   # all/top/none

-- 重启后
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
\`\`\`

**Top 查询**：

\`\`\`sql
-- 平均耗时 Top 10
SELECT query, calls, mean_exec_time::numeric(10,2) AS mean_ms,
       total_exec_time::numeric(10,2) AS total_ms,
       rows, shared_blks_read, shared_blks_hit
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 总耗时 Top 10（最有价值）
SELECT query, calls, total_exec_time::numeric(10,2) AS total_ms,
       mean_exec_time::numeric(10,2) AS mean_ms,
       rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- 调用次数 Top 10（高频小查询）
SELECT query, calls, mean_exec_time::numeric(10,2) AS mean_ms
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 10;

-- IO 高的 SQL
SELECT query, calls,
       shared_blks_read,          -- 物理读
       shared_blks_hit,           -- cache 命中
       shared_blks_dirtied,       -- 脏页
       shared_blks_written        -- 写盘
FROM pg_stat_statements
ORDER BY shared_blks_read DESC
LIMIT 10;

-- 临时文件多的 SQL（排序/哈希落盘）
SELECT query, calls, temp_blks_read, temp_blks_written
FROM pg_stat_statements
WHERE temp_blks_written > 0
ORDER BY temp_blks_written DESC
LIMIT 10;
\`\`\`

**重置统计**：

\`\`\`sql
SELECT pg_stat_statements_reset();
-- 或只重置某 user/db/query
SELECT pg_stat_statements_reset(userid := 16384, dbid := 16385);
\`\`\`

> pg_stat_statements 是 PG 调优的核心数据源，生产必装。配合 Prometheus exporter 可长期留存。

## 34.3 pg_stat_user_tables

表级统计，看每张表的读写与 vacuum 情况。

\`\`\`sql
-- 表 IO 概览
SELECT relname,
       seq_scan, seq_tup_read,         -- 顺序扫描次数与读行
       idx_scan, idx_tup_fetch,        -- 索引扫描次数与取行
       n_tup_ins, n_tup_upd, n_tup_del, n_tup_hot_upd,
       n_live_tup, n_dead_tup,
       last_vacuum, last_autovacuum,
       last_analyze, last_autoanalyze
FROM pg_stat_user_tables
ORDER BY seq_scan + n_dead_tup DESC;
\`\`\`

**关注点**：

- \`seq_scan\` 高且 \`seq_tup_read\` 巨大 → 频繁全表扫描，缺索引。
- \`n_dead_tup\` 大 → 死元组多，vacuum 滞后。
- \`n_tup_hot_upd / n_tup_upd\` 比例低 → HOT update 少，索引多或填充因子低。
- \`last_autovacuum\` 很久以前 → autovacuum 没跑或跑不动。

**找全表扫描严重的表**：

\`\`\`sql
SELECT relname, seq_scan, seq_tup_read,
       coalesce(idx_scan, 0) AS idx_scan,
       CASE WHEN seq_scan > 0
            THEN seq_tup_read::float / seq_scan
            ELSE 0 END AS avg_seq_tup
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY avg_seq_tup DESC
LIMIT 10;
\`\`\`

## 34.4 pg_stat_user_indexes

索引使用情况，找未使用索引。

\`\`\`sql
SELECT schemaname, relname, indexrelname,
       idx_scan, idx_tup_read, idx_tup_fetch,
       pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;
\`\`\`

**找从未使用的索引**（可考虑删除）：

\`\`\`sql
SELECT schemaname, relname, indexrelname,
       pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey'   -- 排除主键
ORDER BY pg_relation_size(indexrelid) DESC;
\`\`\`

> 删索引前要观察足够长时间（至少 1 个业务周期），有些索引只在月度报表时用。

## 34.5 pg_locks

锁等待诊断。

\`\`\`sql
-- 当前所有锁
SELECT pid, locktype, relation::regclass, mode, granted, query
FROM pg_locks
WHERE granted = false;

-- 找阻塞链
SELECT
  blocked.pid     AS blocked_pid,
  blocked.query   AS blocked_query,
  blocking.pid    AS blocking_pid,
  blocking.query  AS blocking_query
FROM pg_stat_activity blocked
JOIN pg_stat_activity blocking
  ON blocking.pid = ANY (pg_blocking_pids(blocked.pid));

-- 锁等待关系
SELECT
  l.relation::regclass AS table_name,
  l.mode AS lock_mode,
  a.pid, a.usename, a.query,
  now() - a.query_start AS wait_time
FROM pg_locks l
JOIN pg_stat_activity a ON a.pid = l.pid
WHERE NOT l.granted;
\`\`\`

**锁模式速查**：

| 模式 | 含义 |
| --- | --- |
| AccessShareLock | SELECT 时的弱锁 |
| RowShareLock | SELECT FOR UPDATE/SHARE |
| RowExclusiveLock | INSERT/UPDATE/DELETE |
| ShareLock | 共享锁 |
| ShareRowExclusiveLock | 共享行排他 |
| ExclusiveLock | 排他 |
| AccessExclusiveLock | ALTER/DROP/TRUNCATE（最强） |

\`\`\`sql
-- 终止持锁者
SELECT pg_terminate_backend(blocking_pid)
FROM pg_stat_activity blocked
JOIN pg_stat_activity blocking
  ON blocking.pid = ANY (pg_blocking_pids(blocked.pid));
\`\`\`

## 34.6 数据库与表空间大小

\`\`\`sql
-- 各数据库大小
SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
ORDER BY pg_database_size(datname) DESC;

-- 各表大小（含索引）
SELECT schemaname, relname,
       pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
       pg_size_pretty(pg_relation_size(relid)) AS table_size,
       pg_size_pretty(pg_indexes_size(relid)) AS index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 20;

-- 表空间大小
SELECT spcname, pg_size_pretty(pg_tablespace_size(spcname)) AS size
FROM pg_tablespace;

-- 查看表与 TOAST 大小
SELECT relname, relkind,
       pg_size_pretty(pg_table_size(oid)) AS heap_size,
       pg_size_pretty(pg_toast_size(oid)) AS toast_size
FROM pg_class
WHERE relkind IN ('r','m')
ORDER BY pg_table_size(oid) DESC
LIMIT 10;
\`\`\`

## 34.7 日志配置

\`\`\`ini
# postgresql.conf
logging_collector = on               # 启用日志收集器
log_directory = 'log'                # 日志目录（相对 data_directory）
log_filename = 'postgresql-%Y-%m-%d.log'
log_rotation_age = 1d                # 按天滚动
log_rotation_size = 100MB            # 按大小滚动
log_truncate_on_rotation = on        # 同名文件覆盖
log_min_messages = warning           # 服务器日志级别
log_min_error_statement = error      # 错误对应 SQL
log_min_duration_statement = 500     # 慢查询阈值 ms（核心！）
log_checkpoints = on                 # 记录检查点
log_connections = off                # 记录连接（高并发时太吵）
log_disconnections = off
log_duration = off                   # 记录每条 SQL 耗时（太吵，用 log_min_duration_statement）
log_lock_waits = on                  # 记录锁等待
log_temp_files = 0                   # 记录所有临时文件
log_autovacuum_min_duration = 0      # 记录所有 autovacuum
log_statement = 'none'               # 'none'/'ddl'/'mod'/'all'
log_line_prefix = '%t [%p] user=%u,db=%d,app=%a,client=%h '
\`\`\`

**log_line_prefix 占位符**：

| 占位符 | 含义 |
| --- | --- |
| %t | 时间戳 |
| %p | PID |
| %u | 用户名 |
| %d | 数据库 |
| %a | 应用名 |
| %h | 客户端 IP |
| %c | 会话 ID |
| %l | 会话内行号 |

**慢查询日志样例**：

\`\`\`
2024-07-11 10:23:45.123 CST [12345] user=app,db=test,app=psql,client=10.0.0.1 LOG:  duration: 2345.678 ms  statement: SELECT * FROM orders WHERE user_id = 100;
\`\`\`

> \`log_min_duration_statement\` 是最实用的慢查询日志开关，设 500ms 是常见起点。

## 34.8 pgBadger 日志分析

pgBadger 是 PostgreSQL 日志分析的事实标准，把日志转成 HTML 报表。

**安装**：

\`\`\`bash
# Debian/Ubuntu
apt install pgbadger

# 或 cpan
cpan App::pgBadger
\`\`\`

**生成报表**：

\`\`\`bash
# 分析单天日志
pgbadger /var/lib/pgsql/16/data/log/postgresql-2024-07-11.log \\
  -o report.html

# 分析多天
pgbadger /var/lib/pgsql/16/data/log/postgresql-2024-07-*.log \\
  -o report.html

# 增量分析（每天一份）
pgbadger -j 8 -O /var/www/pgbadger /var/lib/pgsql/16/data/log/*.log
\`\`\`

**报表内容**：

- 概览：总查询数、错误数、慢查询数。
- 按小时统计。
- Top 慢查询（含完整 SQL + 统计图）。
- Top 高频查询。
- 错误/警告分布。
- 自动 vacuum 报告。
- 锁等待报告。
- 临时文件使用。

**配置建议**（让 pgBadger 解析得更好）：

\`\`\`ini
log_line_prefix = '%t [%p] user=%u,db=%d,app=%a,client=%h '
log_duration = off
log_statement = none
log_min_duration_statement = 0
log_lock_waits = on
log_temp_files = 0
log_autovacuum_min_duration = 0
\`\`\`

\> 配合 cron 每天定时生成：\`0 2 * * * pgbadger -j 8 -O /var/www/pgbadger /var/lib/pgsql/16/data/log/postgresql-\`date +\\%Y-\\%m-\\%d\`.log -o /var/www/pgbadger/\`date +\\%Y-\\%m-\\%d\`.html\`

## 34.9 VACUUM 进度与膨胀监控

### 34.9.1 VACUUM 进度

\`\`\`sql
-- 查看 VACUUM 进度（PG 12+）
SELECT pid, datname, relid::regclass AS table_name,
       phase, heap_blks_total, heap_blks_scanned, heap_blks_vacuumed,
       index_vacuum_count, max_dead_tuples, num_dead_tuples
FROM pg_stat_progress_vacuum;

-- ANALYZE 进度
SELECT pid, datname, relid::regclass, phase,
       sample_blks_total, sample_blks_scanned, ext_stats_total, ext_stats_computed
FROM pg_stat_progress_analyze;

-- CREATE INDEX 进度
SELECT pid, datname, relid::regclass, phase,
       blocks_total, blocks_done, tuples_total, tuples_done
FROM pg_stat_progress_create_index;
\`\`\`

### 34.9.2 膨胀检测

PG 的 MVCC 机制导致 UPDATE/DELETE 产生"死元组"，需 vacuum 回收。长期不清理会"膨胀"（bloat），浪费空间、拖慢扫描。

\`\`\`sql
-- 估算表膨胀（基于 pg_stat_user_tables）
SELECT relname,
       n_live_tup, n_dead_tup,
       CASE WHEN n_live_tup > 0
            THEN 100.0 * n_dead_tup / n_live_tup
            ELSE 0 END AS dead_pct,
       last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 0
ORDER BY n_dead_tup DESC
LIMIT 20;

-- 更精确的膨胀估算（用 pgstattuple 扩展）
CREATE EXTENSION pgstattuple;
SELECT * FROM pgstattuple('big_table');
-- 输出 table_len, tuple_count, tuple_len, dead_tuple_count, dead_tuple_len, free_percent

-- 索引膨胀
SELECT * FROM pgstatindex('idx_users_email');
\`\`\`

**膨胀处理**：

\`\`\`sql
-- 普通 vacuum：标记死元组为可复用，不返还 OS
VACUUM big_table;

-- vacuum full：重写表，回收空间给 OS，但锁表！
VACUUM FULL big_table;

-- 推荐用 pg_repack（无锁重组）
-- pg_repack --table=big_table -d test
\`\`\`

> \`VACUUM FULL\` 会长时间锁表，生产环境用 \`pg_repack\` 替代，可在线重组。

## 34.10 健康检查查询集

### 34.10.1 连接与会话

\`\`\`sql
-- 当前连接数 vs 上限
SELECT count(*) AS current, 
       (SELECT setting::int FROM pg_settings WHERE name='max_connections') AS max_conn
FROM pg_stat_activity
WHERE datname IS NOT NULL;

-- 各应用连接数
SELECT application_name, count(*)
FROM pg_stat_activity
GROUP BY application_name
ORDER BY count DESC;

-- 长事务（>10 分钟）
SELECT pid, usename, application_name,
       now() - xact_start AS xact_duration, state, query
FROM pg_stat_activity
WHERE xact_start IS NOT NULL
  AND now() - xact_start > interval '10 minutes'
ORDER BY xact_duration DESC;
\`\`\`

### 34.10.2 缓存命中率

\`\`\`sql
-- shared_buffers 命中率（应 > 99%）
SELECT
  sum(blks_hit) AS hit,
  sum(blks_read) AS read,
  100.0 * sum(blks_hit) / NULLIF(sum(blks_hit) + sum(blks_read), 0) AS hit_pct
FROM pg_stat_database
WHERE datname = current_database();
\`\`\`

### 34.10.3 检查点频率

\`\`\`sql
-- 检查点统计（需 log_checkpoints=on）
SELECT * FROM pg_stat_bgwriter;
-- checkpoints_timed: 计划内检查点
-- checkpoints_req: 请求触发（max_wal_size 满了），应尽量少
\`\`\`

### 34.10.4 复制状态

\`\`\`sql
-- 主库：看 WAL 发送
SELECT application_name, client_addr, state, sync_state,
       sent_lsn, write_lsn, flush_lsn, replay_lsn,
       sent_lsn - replay_lsn AS lag_bytes
FROM pg_stat_replication;

-- 备库：看接收与应用
SELECT status, receive_lsn, replay_lsn,
       receive_lsn - replay_lsn AS lag_bytes,
       now() - last_msg_send_time AS last_msg
FROM pg_stat_wal_receiver;

-- 复制槽
SELECT slot_name, slot_type, active, restart_lsn,
       pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) AS lag_bytes
FROM pg_replication_slots;
\`\`\`

### 34.10.5 数据库级概览

\`\`\`sql
SELECT datname,
       numbackends, xact_commit, xact_rollback,
       blks_read, blks_hit,
       tup_returned, tup_fetched, tup_inserted, tup_updated, tup_deleted,
       conflicts, temp_files, temp_bytes, deadlocks
FROM pg_stat_database
WHERE datname NOT LIKE 'template%';
\`\`\`

关注：
- \`xact_rollback\` 高 → 业务异常多。
- \`deadlocks\` > 0 → 死锁，需排查加锁顺序。
- \`conflicts\` 高 → 备库恢复冲突多。

## 34.11 Prometheus + Grafana

生产监控标配。

\`\`\`bash
# postgres_exporter
docker run -d --name pg_exporter \\
  -e DATA_SOURCE_NAME="postgresql://exporter:Pass@127.0.0.1:5432/postgres?sslmode=disable" \\
  -p 9187:9187 \\
  quay.io/prometheuscommunity/postgres-exporter
\`\`\`

\`\`\`sql
-- exporter 用户权限
CREATE USER exporter WITH PASSWORD 'Pass';
GRANT pg_monitor TO exporter;
\`\`\`

\`\`\`yaml
# prometheus.yml
scrape_configs:
  - job_name: 'postgres'
    static_configs:
      - targets: ['pg-host:9187']
\`\`\`

**Grafana 大盘**：社区推荐 dashboard ID **9628**（PostgreSQL Database）。

**关键告警**（PromQL）：

\`\`\`yaml
groups:
  - name: postgres
    rules:
      - alert: PgDown
        expr: pg_up == 0
        for: 1m
      - alert: PgHighConnections
        expr: sum by (instance) (pg_stat_activity_count) / on(instance) pg_settings_max_connections > 0.8
        for: 5m
      - alert: PgReplicationLag
        expr: pg_replication_lag_seconds > 60
        for: 5m
      - alert: PgDeadlocks
        expr: increase(pg_stat_database_deadlocks[5m]) > 0
        for: 1m
      - alert: PgCacheHitRateLow
        expr: pg_stat_database_blks_hit / (pg_stat_database_blks_hit + pg_stat_database_blks_read) < 0.95
        for: 10m
\`\`\`

## 34.12 本章小结

- **pg_stat_activity**：实时会话视图，找慢查询、空闲事务、等待事件。
- **pg_stat_statements**：慢查询统计，Top 总耗时最有价值。
- **pg_stat_user_tables / user_indexes**：表/索引 IO 与 vacuum 历史，找全表扫与未用索引。
- **pg_locks**：锁等待诊断，用 \`pg_blocking_pids()\` 找阻塞链。
- **日志**：\`log_min_duration_statement\` 是核心慢查询开关，\`log_line_prefix\` 要带 PID/用户/库/IP。
- **pgBadger**：把日志转 HTML 报表，cron 每日生成。
- **膨胀监控**：\`pg_stat_user_tables.n_dead_tup\` + \`pgstattuple\` 扩展精确测量。
- **健康检查**：缓存命中率、长事务、死锁、复制延迟是四大基础项。
- **Prometheus + Grafana**：生产可视化标配，postgres_exporter + 大盘 9628。

> 监控的终极目标不是"看到问题"，而是"在用户感知前发现问题"。建立基线、设告警、定期 review，才能做到。`
  },
  {
    id: "pg-ch35",
    group: "第六部分 性能优化与运维实战",
    icon: "🧩",
    title: "第 35 章 扩展生态 Extensions",
    content: `# 第 35 章 扩展生态 Extensions

PostgreSQL 最强大的特性之一就是**扩展机制**。通过 \`CREATE EXTENSION\`，你可以给 PG 添加新数据类型、函数、操作符、索引方法甚至新功能模块，而不必修改内核。本章带你了解扩展的安装管理，以及最常用的一批扩展。

## 35.1 扩展管理基础

### 35.1.1 安装与查看

\`\`\`sql
-- 查看所有可用扩展（在系统中已安装控制文件的）
SELECT name, default_version, comment
FROM pg_available_extensions
ORDER BY name;

-- 查看已安装的扩展
SELECT extname, extversion, extnamespace::regnamespace AS schema
FROM pg_extension
ORDER BY extname;

-- 查看扩展的成员对象
SELECT *
FROM pg_extension_objects('pg_trgm');
\`\`\`

\`\`\`bash
# Debian/Ubuntu 安装扩展包（contrib）
apt install postgresql-16-contrib

# RHEL/CentOS
yum install postgresql16-contrib

# 某些扩展单独打包
apt install postgresql-16-postgis-3      # PostGIS
apt install postgresql-16-pg-freespacemap
apt install postgresql-16-timescaledb    # TimescaleDB
\`\`\`

### 35.1.2 CREATE EXTENSION

\`\`\`sql
-- 基础语法
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 指定版本
CREATE EXTENSION hstore WITH VERSION '1.8';

-- 指定 schema（默认 public）
CREATE EXTENSION pg_trgm SCHEMA extensions;

-- 创建到特定数据库（每个库独立）
\\c mydb
CREATE EXTENSION pg_trgm;

-- 删除
DROP EXTENSION IF EXISTS pg_trgm;
DROP EXTENSION IF EXISTS pg_trgm CASCADE;  -- 连同依赖对象一起删
\`\`\`

**注意事项**：

- 扩展是**每数据库独立**的，每个要用的库都要 \`CREATE EXTENSION\`。
- 部分扩展需要 \`shared_preload_libraries\`（如 \`pg_stat_statements\`、\`pg_cron\`），需重启生效。
- 扩展控制文件位于 \`$PGDIR/share/extension/*.control\`。

\`\`\`bash
# 查看扩展控制文件
ls $PGDATA/../share/extension/*.control
# 或
ls $(pg_config --sharedir)/extension/
\`\`\`

## 35.2 pg_stat_statements 查询统计

第 32、34 章已介绍用法，这里补充安装细节。

\`\`\`ini
# postgresql.conf
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.max = 10000
pg_stat_statements.track = all         # all/top/none
pg_stat_statements.track_utility = on  # 是否记录 utility 命令
pg_stat_statements.save = on           # 关库时保存到磁盘
\`\`\`

\`\`\`sql
-- 重启 PostgreSQL 后
CREATE EXTENSION pg_stat_statements;

-- 验证
SELECT * FROM pg_stat_statements LIMIT 1;
\`\`\`

\`\`\`bash
# 重启
systemctl restart postgresql-16
\`\`\`

> 必须先在 \`shared_preload_libraries\` 加载，重启后才 CREATE EXTENSION，顺序反了会报错。

## 35.3 pg_trgm 模糊搜索

\`pg_trgm\` 提供三元组（trigram）文本相似度，让 \`LIKE\`/\`ILIKE\` 走索引，也能做模糊匹配。

\`\`\`sql
CREATE EXTENSION pg_trgm;

-- 相似度函数
SELECT similarity('hello', 'helo');          -- 0.5
SELECT show_trgm('hello');                    -- 三元组数组

-- 模糊匹配
SELECT * FROM users
WHERE name % '张三';                          -- 相似度匹配
SELECT * FROM users
WHERE name ILIKE '%zhang%';                   -- 普通模糊

-- 关键：建 GIN 索引让 LIKE 走索引
CREATE INDEX idx_users_name_trgm ON users USING gin (name gin_trgm_ops);

-- 现在 LIKE 能走索引
EXPLAIN SELECT * FROM users WHERE name ILIKE '%zhang%';
-- Bitmap Index Scan on idx_users_name_trgm
\`\`\`

**支持的索引类型**：

\`\`\`sql
-- GIN（推荐，查询快）
CREATE INDEX idx_users_name_trgm ON users USING gin (name gin_trgm_ops);

-- GiST（更新快，查询稍慢）
CREATE INDEX idx_users_name_trgm ON users USING gist (name gist_trgm_ops);
\`\`\`

**应用场景**：

- 中文/英文人名、商品名模糊搜索。
- 拼写纠错（找最相似的词）。
- 替代 \`LIKE '%...%'\` 全表扫描。

\`\`\`sql
-- 找最相似的 top 10
SELECT name, similarity(name, '张三丰') AS sim
FROM users
WHERE name % '张三丰'
ORDER BY sim DESC
LIMIT 10;
\`\`\`

> pg_trgm 对中文支持需要 UTF8 编码，且分词基于字符三元组，效果不如全文检索精确，但胜在简单。

## 35.4 uuid-ossp 生成 UUID

\`\`\`sql
CREATE EXTENSION "uuid-ossp";

SELECT uuid_generate_v1();    -- 基于时间 + MAC
SELECT uuid_generate_v4();    -- 完全随机
SELECT uuid_generate_v5(uuid_ns_url(), 'example.com');  -- 基于命名空间+名字

-- 作为主键
CREATE TABLE sessions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id bigint NOT NULL,
  token text NOT NULL,
  created_at timestamptz DEFAULT now()
);
\`\`\`

> PG 13+ 内置 \`gen_random_uuid()\` 函数（在 pgcrypto 中），无需 uuid-ossp 也能生成 v4 UUID：
> \`\`\`sql
> SELECT gen_random_uuid();
> \`\`\`

## 35.5 hstore 键值存储

\`hstore\` 是 PG 内置的键值类型，类似 JSON 但更轻量，适合存稀疏属性。

\`\`\`sql
CREATE EXTENSION hstore;

-- 建表
CREATE TABLE products (
  id serial PRIMARY KEY,
  name text,
  attrs hstore
);

-- 插入
INSERT INTO products (name, attrs)
VALUES ('iPhone', 'color=>"black", storage=>"128GB", price=>"6999"');

-- 查询
SELECT name, attrs->'color' AS color FROM products;
SELECT name FROM products WHERE attrs->'color' = 'black';
SELECT name FROM products WHERE attrs @> 'color=>"black"';

-- 修改
UPDATE products SET attrs = attrs || 'price=>"5999"' WHERE id = 1;
UPDATE products SET attrs = delete(attrs, 'storage') WHERE id = 1;

-- 提取所有键/值
SELECT skeys(attrs), svals(attrs) FROM products;
SELECT each(attrs) FROM products;  -- (key, value) 行
\`\`\`

**索引**：

\`\`\`sql
-- GIST 索引支持 @>、?、& 等操作
CREATE INDEX idx_products_attrs ON products USING gist(attrs);
-- GIN 索引（更快）
CREATE INDEX idx_products_attrs_gin ON products USING gin(attrs);

-- 用索引查询
SELECT * FROM products WHERE attrs @> 'color=>"black"';
\`\`\`

> 现代项目更推荐用 \`jsonb\`（PG 9.4+），功能更丰富，hstore 适合老项目或简单键值场景。

## 35.6 PostGIS 地理空间

PostGIS 是 PG 最知名的扩展，提供地理空间对象、空间索引与空间分析函数。

\`\`\`bash
# 安装
apt install postgis postgresql-16-postgis-3
\`\`\`

\`\`\`sql
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;

-- 建表
CREATE TABLE stores (
  id serial PRIMARY KEY,
  name text,
  location geometry(Point, 4326)  -- 经纬度点
);

-- 插入（经纬度顺序）
INSERT INTO stores (name, location)
VALUES ('北京店', ST_SetSRID(ST_MakePoint(116.40, 39.90), 4326));

-- 空间索引
CREATE INDEX idx_stores_location ON stores USING gist(location);

-- 查询：找 5 公里内的店
SELECT name,
       ST_Distance(location::geography,
                   ST_SetSRID(ST_MakePoint(116.40, 39.90), 4326)::geography) / 1000 AS km
FROM stores
WHERE ST_DWithin(location::geography,
                 ST_SetSRID(ST_MakePoint(116.40, 39.90), 4326)::geography,
                 5000)
ORDER BY km;

-- 多边形查询
SELECT name FROM stores
WHERE ST_Contains(
  ST_MakePolygon(ST_GeomFromText('LINESTRING(116.0 39.0, 117.0 39.0, 117.0 40.0, 116.0 40.0, 116.0 39.0)', 4326)),
  location
);
\`\`\`

**应用场景**：

- LBS 应用（找附近店、外卖配送范围）。
- 地图业务。
- 物流轨迹分析。

## 35.7 TimescaleDB 时序数据

TimescaleDB 是针对时序数据优化的扩展，自动分区、压缩、连续聚合。

\`\`\`bash
# 安装
apt install timescaledb-2-postgresql-16

# 配置
timescaledb-tune --yes
\`\`\`

\`\`\`ini
# postgresql.conf
shared_preload_libraries = 'timescaledb'
\`\`\`

\`\`\`sql
CREATE EXTENSION timescaledb;

-- 创建超表（hypertable）
CREATE TABLE metrics (
  time timestamptz NOT NULL,
  device_id int NOT NULL,
  temperature float,
  humidity float
);
SELECT create_hypertable('metrics', 'time', chunk_time_interval => interval '1 day');

-- 自动按时间分区，自动压缩
ALTER TABLE metrics SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'device_id'
);
SELECT add_compression_policy('metrics', interval '7 days');

-- 连续聚合（物化视图）
CREATE MATERIALIZED VIEW metrics_hourly
WITH (timescaledb.continuous) AS
SELECT device_id,
       time_bucket('1 hour', time) AS bucket,
       avg(temperature) AS avg_temp
FROM metrics
GROUP BY device_id, bucket;

-- 自动刷新
SELECT add_continuous_aggregate_policy('metrics_hourly',
  start_offset => interval '7 days',
  end_offset => interval '1 hour',
  schedule_interval => interval '1 hour');
\`\`\`

**适用场景**：监控指标、IoT 传感器、金融 K 线、日志时序。

## 35.8 pgcrypto 加密

\`\`\`sql
CREATE EXTENSION pgcrypto;

-- 哈希
SELECT digest('password123', 'sha256');          -- bytea
SELECT encode(digest('password123', 'sha256'), 'hex');

-- HMAC
SELECT hmac('data', 'secret_key', 'sha256');

-- 对称加密
SELECT encrypt('secret data', 'mykey', 'aes');           -- 加密
SELECT decrypt('\\x...', 'mykey', 'aes');                 -- 解密

-- PGP 加密（推荐）
SELECT pgp_sym_encrypt('secret', 'password');            -- 加密
SELECT pgp_sym_decrypt('\\x...', 'password');            -- 解密

-- 非对称加密
SELECT pgp_pub_encrypt('secret', dearmor('-----BEGIN PGP PUBLIC KEY...'));
SELECT pgp_priv_decrypt('\\x...', dearmor('-----BEGIN PGP PRIVATE KEY...'));

-- 随机 UUID
SELECT gen_random_uuid();
SELECT gen_random_bytes(16);
\`\`\`

**密码哈希存储**：

\`\`\`sql
-- 用户密码加密存储
CREATE TABLE users (
  id serial PRIMARY KEY,
  username text UNIQUE,
  password_hash text
);

-- 注册时
INSERT INTO users (username, password_hash)
VALUES ('alice', crypt('mypassword', gen_salt('bf', 10)));

-- 登录验证
SELECT id FROM users
WHERE username = 'alice'
  AND password_hash = crypt('mypassword', password_hash);
\`\`\`

> \`gen_salt('bf', 10)\` 用 blowfish 算法，10 是 cost factor，越大越慢越安全。生产用 10~12。

## 35.9 citext 大小写不敏感文本

\`\`\`sql
CREATE EXTENSION citext;

-- 建表
CREATE TABLE accounts (
  id serial PRIMARY KEY,
  email citext UNIQUE,           -- 大小写不敏感
  username citext
);

INSERT INTO accounts (email) VALUES ('Alice@Example.com');
INSERT INTO accounts (email) VALUES ('alice@example.com');  -- 报唯一约束冲突！

-- 查询自动大小写不敏感
SELECT * FROM accounts WHERE email = 'ALICE@EXAMPLE.COM';   -- 能查到
SELECT * FROM accounts WHERE email LIKE '%alice%';          -- 同样不敏感
\`\`\`

> 相比 \`lower(email)\` + 表达式索引，citext 更省心，索引就是普通 B-tree。

## 35.10 intarray 整数数组

\`\`\`sql
CREATE EXTENSION intarray;

-- 数组操作
SELECT '{1,2,3}'::int[] && '{3,4,5}'::int[];   -- 交集 {3}
SELECT '{1,2,3}'::int[] | '{3,4,5}'::int[];    -- 并集 {1,2,3,4,5}
SELECT '{1,2,3,4}'::int[] - '{2,3}'::int[];    -- 差集 {1,4}

-- GIN 索引
CREATE TABLE tags (id serial, user_ids int[]);
CREATE INDEX idx_tags_user_ids ON tags USING gin(user_ids gin_int_ops);

-- 快速查询包含某 id 的行
SELECT * FROM tags WHERE user_ids @> ARRAY[100];

-- 排序与去重
SELECT sort('{3,1,2}');           -- {1,2,3}
SELECT uniq('{1,1,2,2,3}');       -- {1,2,3}
\`\`\`

适合"用户-标签"反向索引、权限系统等场景。

## 35.11 tablefunc 交叉表

\`\`\`sql
CREATE EXTENSION tablefunc;

-- 原始数据
CREATE TABLE sales (year int, quarter int, amount numeric);
INSERT INTO sales VALUES
  (2022, 1, 100), (2022, 2, 150), (2022, 3, 200), (2022, 4, 180),
  (2023, 1, 110), (2023, 2, 160);

-- 行转列
SELECT * FROM crosstab(
  'SELECT year, quarter, amount FROM sales ORDER BY 1,2'
) AS ct(year int, q1 numeric, q2 numeric, q3 numeric, q4 numeric);

-- 输出：
-- year | q1  | q2  | q3  | q4
-- 2022 | 100 | 150 | 200 | 180
-- 2023 | 110 | 160 |     |
\`\`\`

适合做报表交叉分析。

## 35.12 其他实用扩展速览

| 扩展 | 用途 |
| --- | --- |
| **pg_stat_statements** | 查询性能统计（必装） |
| **pg_trgm** | 三元组模糊搜索 |
| **pgcrypto** | 加密、哈希、UUID |
| **hstore** | 键值存储 |
| **citext** | 大小写不敏感文本 |
| **intarray** | 整数数组操作 |
| **tablefunc** | 交叉表 |
| **postgis** | 地理空间 |
| **timescaledb** | 时序数据 |
| **pg_repack** | 在线重组表（无锁 vacuum full） |
| **pg_cron** | 定时任务 |
| **pg_partman** | 分区表自动管理 |
| **pglogical** | 逻辑复制 |
| **pgvector** | 向量数据库（AI 嵌入） |
| **hypopg** | 假索引（不实际创建就能看 EXPLAIN） |
| **pg_hint_plan** | 强制执行计划（调优用） |
| **pgaudit** | 审计日志 |
| **pg_stat_statements** | 慢查询统计 |
| **btree_gist / btree_gin** | 让 B-tree 类型也能进 GiST/GIN |
| **unaccent** | 文本去重音符号 |
| **earthdistance** | 经纬度距离（轻量版 PostGIS） |
| **pg_freespacemap** | 查看空闲空间映射 |

**pgvector 示例**（AI 时代必备）：

\`\`\`sql
CREATE EXTENSION vector;

CREATE TABLE docs (
  id serial PRIMARY KEY,
  content text,
  embedding vector(1536)   -- OpenAI text-embedding 维度
);

CREATE INDEX idx_docs_embedding ON docs USING ivfflat (embedding vector_cosine_ops);

-- 相似度搜索
SELECT content, embedding <=> '[0.1, 0.2, ...]'::vector AS distance
FROM docs
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 10;
\`\`\`

**pg_cron 示例**：

\`\`\`ini
# postgresql.conf
shared_preload_libraries = 'pg_cron'
cron.database_name = 'postgres'
\`\`\`

\`\`\`sql
CREATE EXTENSION pg_cron;

-- 每天凌晨 2 点清理
SELECT cron.schedule('0 2 * * *', 'DELETE FROM logs WHERE created_at < now() - interval ''30 days''');

-- 每小时 ANALYZE
SELECT cron.schedule('0 * * * *', 'ANALYZE');

-- 查看任务
SELECT * FROM cron.job;

-- 取消
SELECT cron.unschedule(job_id);
\`\`\`

## 35.13 如何发现与安装新扩展

\`\`\`bash
# 1. 系统包搜索
apt search postgresql-16
apt search "postgresql.*extension"

# 2. PG 官方扩展索引
# https://www.postgresql.org/download/
# https://packages.debian.org/search?keywords=postgresql

# 3. PGXN（PostgreSQL Extension Network）
# https://pgxn.org/
# 用 pgxn client 安装
pip install pgxnclient
pgxn install <ext_name>

# 4. GitHub
# 搜索 "postgresql extension"
\`\`\`

\`\`\`sql
-- 查看本机已有控制文件
SELECT * FROM pg_available_extensions;

-- 查看某扩展的依赖
SELECT * FROM pg_extension_dependencies('postgis');
\`\`\`

## 35.14 本章小结

- **CREATE EXTENSION**：每库独立，部分扩展需 \`shared_preload_libraries\` 重启。
- **pg_stat_statements**：慢查询统计，生产必装。
- **pg_trgm**：让 \`LIKE\` 走索引，模糊搜索利器。
- **uuid-ossp / pgcrypto**：UUID 生成与加密哈希。
- **hstore**：键值存储（新项目用 jsonb）。
- **PostGIS**：地理空间王者。
- **TimescaleDB**：时序数据优化。
- **citext**：大小写不敏感文本。
- **intarray**：整数数组高性能操作。
- **tablefunc**：行转列交叉表。
- **pgvector**：AI 向量数据库。
- **pg_cron**：DB 内定时任务。

> PG 扩展生态是其最大优势之一。"用扩展而不是改内核"是 PG 文化的精髓，遇到新需求先查有没有现成扩展。`
  },
  {
    id: "pg-ch36",
    group: "第六部分 性能优化与运维实战",
    icon: "🔐",
    title: "第 36 章 安全与权限管理",
    content: `# 第 36 章 安全与权限管理

数据库安全是底线。本章覆盖 PostgreSQL 的认证、授权、加密、审计、行级安全等核心机制，帮你建立"最小权限 + 多层防御"的安全体系。

## 36.1 pg_hba.conf 认证配置

\`pg_hba.conf\`（Host-Based Authentication）控制"谁能连、从哪连、用什么方式认证"。这是 PG 安全的第一道闸门。

\`\`\`bash
# 查看位置
SHOW hba_file;

# 重新加载（不重启）
SELECT pg_reload_conf();
# 或
pg_ctl reload -D $PGDATA
\`\`\`

**配置格式**：

\`\`\`ini
# TYPE  DATABASE  USER  ADDRESS       METHOD    [options]
# 本地连接
local   all       all                 peer

# IPv4
host    all       all   127.0.0.1/32  scram-sha-256
host    all       all   10.0.0.0/8    scram-sha-256

# IPv6
host    all       all   ::1/128       scram-sha-256

# 复制专用
host    replication  repl  10.0.0.5/32  scram-sha-256

# 拒绝（放最后兜底）
host    all       all   0.0.0.0/0     reject
\`\`\`

**字段说明**：

| 字段 | 取值 |
| --- | --- |
| TYPE | local（Unix socket）/ host（TCP+SSL）/ hostssl / hostnossl |
| DATABASE | all / dbname / replication / @file |
| USER | all / username / @file / +group |
| ADDRESS | IP/CIDR，local 留空 |
| METHOD | trust / reject / md5 / scram-sha-256 / peer / cert / ldap / radius 等 |

**认证方法详解**：

| 方法 | 含义 | 安全 |
| --- | --- | --- |
| trust | 不认证，直接放行 | 极度危险，仅本地测试 |
| reject | 拒绝 | 用于排除特定来源 |
| md5 | MD5 口令 | 不推荐，已弱 |
| scram-sha-256 | SCRAM-SHA-256 口令 | 推荐 |
| peer | 用 OS 用户名匹配 PG 用户 | 仅本地，安全 |
| cert | 客户端 SSL 证书认证 | 高 |
| ldap | 转发到 LDAP/AD | 企业常用 |
| radius | RADIUS 认证 | 较少用 |

\`\`\`ini
# 生产推荐配置
local   all             postgres                                      peer
local   all             all                                           peer
host    all             all       127.0.0.1/32                        scram-sha-256
host    all             all       ::1/128                             scram-sha-256
hostssl all             app_user  10.0.0.0/8                          scram-sha-256
host    replication     repl      10.0.0.0/8                          scram-sha-256
host    all             all       0.0.0.0/0                           reject
\`\`\`

**验证配置**：

\`\`\`bash
# 测试某用户从某 IP 连接的认证方式
psql "host=db.example.com user=app_user dbname=test" -W

# 查看生效的 hba 规则
SELECT line_number, type, database, user_name, address, auth_method
FROM pg_hba_file_rules
ORDER BY line_number;
\`\`\`

> 规则**从上到下**匹配，第一条命中即生效。所以"宽规则在下、窄规则在上"。

## 36.2 密码加密 SCRAM-SHA-256

PG 10+ 引入 SCRAM-SHA-256，比 MD5 安全得多。PG 14+ 默认 \`scram-sha-256\`。

\`\`\`ini
# postgresql.conf
password_encryption = scram-sha-256
\`\`\`

\`\`\`sql
-- 查看当前
SHOW password_encryption;

-- 设置密码（用 scram 加密）
CREATE USER app_user WITH PASSWORD 'StrongPass@123';

-- 把已有的 md5 用户升级到 scram
-- 1. 先确保 password_encryption = scram-sha-256
ALTER USER app_user WITH PASSWORD 'StrongPass@123';

-- 查看用户密码加密方式
SELECT rolname, substring(rolpassword from 1 for 20) AS pwd_prefix
FROM pg_authid
WHERE rolcanlogin AND rolpassword IS NOT NULL;
-- SCRAM-SHA-256$... 表示 scram
-- md5... 表示 md5
\`\`\`

**升级步骤**：

1. 设 \`password_encryption = scram-sha-256\`。
2. 重载配置。
3. 强制所有用户重设密码（\`ALTER USER xxx PASSWORD ...\`）。
4. 把 \`pg_hba.conf\` 里的 \`md5\` 改成 \`scram-sha-256\`。
5. 重载配置。

\`\`\`sql
-- 批量生成重设密码语句（用户自己执行）
SELECT 'ALTER USER ' || rolname || ' PASSWORD :' || rolname || ';'
FROM pg_authid
WHERE rolcanlogin;
\`\`\`

> scram-sha-256 支持通道绑定（channel binding），防中间人攻击。客户端需较新版本（libpq 10+）。

## 36.3 用户与角色

PG 中"用户"和"角色"本质相同（\`CREATE USER\` 等价于 \`CREATE ROLE\` 带 LOGIN），只是有无 LOGIN 权限的区别。

\`\`\`sql
-- 创建角色（不能登录）
CREATE ROLE readonly;

-- 创建用户（能登录）
CREATE USER app_user WITH PASSWORD 'Pass@123';
-- 等价于 CREATE ROLE app_user WITH LOGIN PASSWORD 'Pass@123';

-- 修改
ALTER USER app_user WITH PASSWORD 'NewPass@123' VALID UNTIL '2025-12-31';
ALTER USER app_user CONNECTION LIMIT 50;
ALTER USER app_user SET work_mem = '32MB';   -- 用户级默认参数

-- 锁定账户
ALTER USER app_user NOLOGIN;
-- 解锁
ALTER USER app_user LOGIN;

-- 删除
DROP USER app_user;
\`\`\`

**常用属性**：

| 属性 | 含义 |
| --- | --- |
| LOGIN / NOLOGIN | 能否登录 |
| SUPERUSER / NOSUPERUSER | 超级用户 |
| CREATEDB / NOCREATEDB | 能否建库 |
| CREATEROLE / NOCREATEROLE | 能否建角色 |
| REPLICATION | 复制权限 |
| CONNECTION LIMIT | 最大连接数 |
| VALID UNTIL | 密码过期时间 |
| INHERIT | 是否继承所属角色权限（默认 ON） |

**角色继承**：

\`\`\`sql
-- 创建组角色
CREATE ROLE dev_team;
CREATE ROLE readonly;

-- 把权限赋给组
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
GRANT USAGE ON SCHEMA public TO readonly;

-- 把用户加入组
GRANT readonly TO alice, bob;
GRANT dev_team TO alice;

-- alice 现在同时拥有 readonly 和 dev_team 的权限
SELECT * FROM pg_roles WHERE rolname IN ('alice','readonly','dev_team');
\`\`\`

\`\`\`sql
-- 查看用户的角色成员关系
SELECT r.rolname AS role, m.rolname AS member
FROM pg_auth_members am
JOIN pg_roles r ON r.oid = am.roleid
JOIN pg_roles m ON m.oid = am.member;

-- 查看某用户的所有权限
SELECT * FROM pg_user;
\`\`\`

## 36.4 GRANT 与 REVOKE

权限粒度从粗到细：数据库 → schema → 表 → 列。

### 36.4.1 数据库权限

\`\`\`sql
-- 创建数据库并指定 owner
CREATE DATABASE test OWNER = app_user;

-- 授予连接权限
GRANT CONNECT ON DATABASE test TO app_user;
GRANT CONNECT ON DATABASE test TO dev_team;

-- 撤销
REVOKE CONNECT ON DATABASE test FROM public;
\`\`\`

### 36.4.2 Schema 权限

\`\`\`sql
-- 创建 schema
CREATE SCHEMA app_schema AUTHORIZATION app_user;

-- 授予 schema 使用权
GRANT USAGE ON SCHEMA app_schema TO readonly;
GRANT CREATE ON SCHEMA app_schema TO dev_team;
\`\`\`

### 36.4.3 表权限

\`\`\`sql
-- 表级权限
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO app_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
GRANT ALL ON orders TO dev_team;

-- 列级权限（敏感字段只读）
GRANT SELECT (id, name, email) ON users TO app_user;
GRANT UPDATE (last_login) ON users TO app_user;

-- 序列权限
GRANT USAGE, SELECT ON SEQUENCE orders_id_seq TO app_user;
\`\`\`

**权限类型**：

| 对象 | 可授予权限 |
| --- | --- |
| DATABASE | CONNECT, CREATE, TEMPORARY |
| SCHEMA | CREATE, USAGE |
| TABLE | SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER |
| COLUMN | SELECT, INSERT, UPDATE, REFERENCES |
| SEQUENCE | USAGE, SELECT, UPDATE |
| FUNCTION | EXECUTE |
| TYPE | USAGE |

\`\`\`sql
-- 撤销
REVOKE INSERT, UPDATE ON orders FROM app_user;
REVOKE ALL ON orders FROM dev_team;

-- 查看表的权限
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'orders';
\`\`\`

### 36.4.4 默认权限

新创建的对象默认只有 owner 能访问。可用 \`ALTER DEFAULT PRIVILEGES\` 让未来创建的对象自动授权。

\`\`\`sql
-- 让 app_user 以后在 public schema 建的表都自动给 readonly 读权限
ALTER DEFAULT PRIVILEGES FOR ROLE app_user IN SCHEMA public
GRANT SELECT ON TABLES TO readonly;

-- 让 dev_team 建的函数自动给所有用户 EXECUTE
ALTER DEFAULT PRIVILEGES FOR ROLE dev_team
GRANT EXECUTE ON FUNCTIONS TO public;

-- 对序列也设默认权限
ALTER DEFAULT PRIVILEGES FOR ROLE app_user IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO app_user;
\`\`\`

> 默认权限是减少运维负担的关键，否则每建一张表都要手工 GRANT。

### 36.4.5 PUBLIC 角色

\`PUBLIC\` 是一个虚拟角色，**所有用户都自动属于 PUBLIC**。

\`\`\`sql
-- 默认情况下 PUBLIC 对 public schema 有 CREATE 权限（危险！）
REVOKE CREATE ON SCHEMA public FROM public;

-- 默认 PUBLIC 对数据库有 CONNECT 与 TEMPORARY
REVOKE CONNECT ON DATABASE test FROM public;
\`\`\`

> 生产环境务必 \`REVOKE CREATE ON SCHEMA public FROM public\`，否则任何用户都能在 public 建表。

## 36.5 行级安全 RLS

行级安全（Row-Level Security）让同一张表不同用户只能看到符合策略的行，是多租户系统的核心。

\`\`\`sql
-- 启用 RLS
CREATE TABLE orders (
  id serial PRIMARY KEY,
  user_id int NOT NULL,
  amount numeric
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能看自己的订单
CREATE POLICY orders_user_policy ON orders
  FOR SELECT
  USING (user_id = current_user_id());

-- 假设有这个函数返回当前用户 ID
CREATE OR REPLACE FUNCTION current_user_id() RETURNS int AS $$
  SELECT id FROM app_users WHERE username = current_user;
$$ LANGUAGE sql SECURITY DEFINER;
\`\`\`

**策略类型**：

\`\`\`sql
-- SELECT 策略
CREATE POLICY p_select ON orders FOR SELECT
  USING (user_id = current_user_id());

-- INSERT 策略
CREATE POLICY p_insert ON orders FOR INSERT
  WITH CHECK (user_id = current_user_id());

-- UPDATE 策略（USING 决定能改哪些行，WITH CHECK 决定能改成什么）
CREATE POLICY p_update ON orders FOR UPDATE
  USING (user_id = current_user_id())
  WITH CHECK (user_id = current_user_id());

-- DELETE 策略
CREATE POLICY p_delete ON orders FOR DELETE
  USING (user_id = current_user_id());

-- ALL 策略（覆盖所有命令）
CREATE POLICY p_all ON orders FOR ALL
  USING (user_id = current_user_id())
  WITH CHECK (user_id = current_user_id());
\`\`\`

**多策略组合**：

\`\`\`sql
-- 普通用户只能看自己的
CREATE POLICY p_own ON orders FOR SELECT
  TO app_user
  USING (user_id = current_user_id());

-- 管理员能看所有
CREATE POLICY p_admin ON orders FOR SELECT
  TO admin_role
  USING (true);
\`\`\`

**绕过 RLS**：

\`\`\`sql
-- 表 owner 默认绕过 RLS
-- 强制 owner 也遵守
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

-- 超级用户永远绕过 RLS
-- 有 BYPASSRLS 属性的角色也绕过
ALTER ROLE admin_user BYPASSRLS;
\`\`\`

\`\`\`sql
-- 查看 RLS 策略
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- 删除策略
DROP POLICY p_own ON orders;
\`\`\`

> RLS 是 SaaS 多租户的最佳实践，比"每个租户一张表"或"应用层 WHERE"更安全。

## 36.6 SSL 连接

\`\`\`ini
# postgresql.conf
ssl = on
ssl_cert_file = '/etc/ssl/certs/pg.crt'
ssl_key_file = '/etc/ssl/private/pg.key'
ssl_ca_file = '/etc/ssl/certs/ca.crt'
ssl_ciphers = 'HIGH:MEDIUM:+3DES:!aNULL'
ssl_prefer_server_ciphers = on
\`\`\`

\`\`\`bash
# 生成自签名证书（测试用）
openssl req -new -x509 -days 3650 -nodes -text \
  -out pg.crt -keyout pg.key -subj "/CN=pg.example.com"
chmod 600 pg.key
\`\`\`

\`\`\`ini
# pg_hba.conf 强制 SSL
hostssl all all 10.0.0.0/8 scram-sha-256
\`\`\`

\`\`\`bash
# 客户端连接（强制 SSL）
psql "host=pg.example.com user=app_user dbname=test sslmode=verify-full"
# sslmode: disable / allow / prefer / require / verify-ca / verify-full
\`\`\`

| sslmode | 行为 |
| --- | --- |
| disable | 不用 SSL |
| allow | 先尝试无 SSL，失败再 SSL |
| prefer | 先 SSL，失败再无 SSL（默认） |
| require | 必须 SSL，不验证证书 |
| verify-ca | 必须 SSL，验证 CA |
| verify-full | 必须 SSL，验证 CA + 主机名（最安全） |

**客户端证书认证**（双向 SSL）：

\`\`\`ini
# pg_hba.conf
hostssl all all 10.0.0.0/8 cert clientcert=1
\`\`\`

\`\`\`bash
# 客户端连接需带证书
psql "host=pg.example.com user=app_user dbname=test \
  sslmode=verify-full sslrootcert=ca.crt \
  sslcert=client.crt sslkey=client.key"
\`\`\`

## 36.7 静态加密与审计

### 36.7.1 静态加密

PG 本身**不提供**透明的静态加密（TDE），需依赖 OS 或磁盘层：

| 方案 | 说明 |
| --- | --- |
| LUKS | Linux 全盘加密，文件系统层 |
| BitLocker | Windows 全盘加密 |
| 云厂商 EBS 加密 | AWS EBS / 阿里云云盘加密 |
| TDE 第三方扩展 | Cybertec、crunchy 等商业版 |
| 字段级加密 | 用 pgcrypto 在应用层加密敏感字段 |

**字段级加密示例**：

\`\`\`sql
CREATE EXTENSION pgcrypto;

CREATE TABLE users (
  id serial PRIMARY KEY,
  name text,
  ssn bytea   -- 社保号加密存储
);

-- 写入时加密
INSERT INTO users (name, ssn)
VALUES ('alice', pgp_sym_encrypt('123-45-6789', 'my_secret_key'));

-- 读取时解密
SELECT name, pgp_sym_decrypt(ssn, 'my_secret_key') AS ssn
FROM users;
\`\`\`

### 36.7.2 审计日志

PG 内置日志 + \`pgaudit\` 扩展提供详细审计。

\`\`\`ini
# postgresql.conf
log_statement = 'ddl'        # none/ddl/mod/all
log_connections = on
log_disconnections = on
log_min_duration_statement = 0   # 记录所有 SQL（量大，慎用）
\`\`\`

\`\`\`bash
# 安装 pgaudit
apt install postgresql-16-pgaudit
\`\`\`

\`\`\`ini
shared_preload_libraries = 'pgaudit'
pgaudit.log = 'read,write,ddl,role'    # 审计类别
pgaudit.log_relation = on              # 每个表单独一行
pgaudit.log_parameter = on             # 记录参数值
\`\`\`

\`\`\`sql
CREATE EXTENSION pgaudit;

-- 之后所有操作都会被审计
SELECT * FROM users WHERE id = 1;
-- 日志中会有：AUDIT: SESSION,1,1,READ,SELECT,TABLE,public.users,SELECT ...
\`\`\`

\`pgaudit.log\` 类别：

- **READ**：SELECT/COPY FROM
- **WRITE**：INSERT/UPDATE/DELETE/TRUNCATE/COPY TO
- **FUNCTION**：函数调用
- **ROLE**：GRANT/REVOKE/CREATE ROLE 等
- **DDL**：所有 DDL
- **MISC**：其他命令（DISCARD/FETCH/CHECKPOINT）
- **MISC_SET**：其他 SET 类命令
- **ALL**：全部

## 36.8 安全最佳实践清单

### 36.8.1 认证与网络

- [ ] \`pg_hba.conf\` 用 \`scram-sha-256\`，禁用 \`trust\` 与 \`md5\`。
- [ ] 用 \`hostssl\` 强制 SSL。
- [ ] 数据库只监听内网 IP，\`listen_addresses\` 不设 \`*\`。
- [ ] 防火墙只开必要端口（5432）。
- [ ] 复制用户单独创建，最小权限。
- [ ] 删除默认的 \`postgres\` 远程登录（仅本地 peer）。

### 36.8.2 账号与权限

- [ ] 应用用独立账号，不用 \`postgres\` 超管。
- [ ] 不同环境（dev/staging/prod）不同账号。
- [ ] 每个应用最小权限，只给它需要的库/表。
- [ ] \`REVOKE CREATE ON SCHEMA public FROM public\`。
- [ ] 用角色组管理权限，把用户加入组。
- [ ] 设 \`VALID UNTIL\` 强制密码轮换。
- [ ] 定期 review \`pg_roles\` 清理离职账号。
- [ ] 设 \`idle_in_transaction_session_timeout\` 防长事务。
- [ ] 设 \`connection_limit\` 防滥用。

### 36.8.3 加密

- [ ] SSL 传输加密，\`sslmode=verify-full\`。
- [ ] 敏感字段用 pgcrypto 加密存储。
- [ ] 全盘加密（LUKS / 云盘加密）。
- [ ] 密码用 \`crypt()\` + \`gen_salt('bf', 10)\` 哈希，不要明文。
- [ ] 备份也要加密。

### 36.8.4 审计与监控

- [ ] 启用 \`log_min_duration_statement\` 慢查询日志。
- [ ] 启用 \`log_connections\`/\`log_disconnections\`。
- [ ] 启用 \`log_lock_waits\`、\`log_temp_files\`。
- [ ] 安装 \`pgaudit\` 做详细审计。
- [ ] 监控登录失败、异常权限变更。
- [ ] 定期 review 日志，找可疑访问模式。

### 36.8.5 数据库加固

- [ ] 关闭不需要的扩展。
- [ ] 限制 \`COPY\` 与文件访问（\`pg_read_file\` 等函数）。
- [ ] 大对象（\`pg_largeobject\`）权限收紧。
- [ ] 用 RLS 做多租户隔离。
- [ ] 用 schema 隔离不同业务模块。
- [ ] 定期 \`VACUUM\` + \`ANALYZE\`，保持统计信息新鲜。
- [ ] 备份定期演练恢复。

### 36.8.6 应急响应

- [ ] 监控异常登录（异地、非工作时间）。
- [ ] 监控 SUPERUSER 创建。
- [ ] 监控大量数据导出（SELECT * 大表）。
- [ ] 准备账号锁定脚本（一键改密码/禁登录）。
- [ ] 定期 review \`pg_stat_activity\` 找异常会话。

\`\`\`sql
-- 找有 SUPERUSER 的角色（应越少越好）
SELECT rolname FROM pg_roles WHERE rolsuper;

-- 找有 LOGIN 的所有角色
SELECT rolname FROM pg_roles WHERE rolcanlogin;

-- 找有 REPLICATION 权限的
SELECT rolname FROM pg_roles WHERE rolreplication;

-- 找有 BYPASSRLS 的
SELECT rolname FROM pg_roles WHERE rolbypassrls;

-- 找 PUBLIC 上的危险权限
SELECT nspname, nspacl FROM pg_namespace WHERE nspname = 'public';
\`\`\`

## 36.9 本章小结

- **pg_hba.conf**：第一道闸门，用 \`scram-sha-256\`，\`hostssl\` 强制 SSL，规则从上到下匹配。
- **SCRAM-SHA-256**：PG 14+ 默认，升级时先 \`password_encryption\` 再重设密码。
- **角色与用户**：本质相同，用角色组管理权限；\`INHERIT\` 让成员自动继承权限。
- **GRANT/REVOKE**：粒度从库到列，\`ALTER DEFAULT PRIVILEGES\` 让未来对象自动授权。
- **PUBLIC**：所有用户都属于，生产务必 \`REVOKE CREATE ON SCHEMA public FROM public\`。
- **RLS**：行级安全，多租户核心，\`FORCE RLS\` 让 owner 也遵守。
- **SSL**：\`sslmode=verify-full\` 最安全，cert 方法做双向认证。
- **静态加密**：PG 无 TDE，靠 LUKS/云盘/pgcrypto 字段加密。
- **审计**：\`pgaudit\` 扩展做细粒度审计，配合日志分析。
- **最佳实践**：最小权限 + 多层防御 + 定期 review。

> 数据库安全没有"一劳永逸"，是持续的过程。建立安全基线、定期审计、跟踪漏洞公告，才能把风险降到最低。`
  }
];

export { chapters };
