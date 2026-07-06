// =============================================================
// 《MySQL 实战教程》- 章节批次 6
// -------------------------------------------------------------
// 内容：第六部分 性能优化与运维实战（第 28-32 章）
// =============================================================

const chapters = [
  {
    id: "mysql-ch28",
    group: "第六部分 性能优化与运维实战",
    icon: "📊",
    title: "第 28 章 性能监控",
    content: `# 第 28 章 性能监控

"无法监控就无法优化"。MySQL 性能监控从命令行到可视化一脉相承：\`SHOW PROCESSLIST\` 看实时连接，\`SHOW STATUS\` 看计数器，\`performance_schema\` 看底层细节，\`sys schema\` 简化查询，最后接 Prometheus + Grafana 做大盘。

## 28.1 SHOW PROCESSLIST

查看当前所有连接与正在执行的 SQL：

\`\`\`sql
SHOW PROCESSLIST;
SHOW FULL PROCESSLIST;  -- 显示完整 SQL

-- 或从 information_schema 查
SELECT id, user, host, db, command, time, state, info
FROM information_schema.processlist
WHERE command != 'Sleep'
ORDER BY time DESC;
\`\`\`

**字段解读**：

| 字段 | 含义 |
| --- | --- |
| **Id** | 连接 ID |
| **User / Host** | 用户与来源 IP |
| **db** | 当前库 |
| **Command** | 命令类型（Query/Sleep/...） |
| **Time** | 已持续秒数 |
| **State** | 执行状态（Sending data/Sorting result/...） |
| **Info** | SQL 文本 |

**Kill 卡住的连接**：

\`\`\`sql
KILL 12345;          -- 终止连接
KILL QUERY 12345;    -- 仅终止当前查询，连接保留
\`\`\`

> 看到 \`Time\` 很大且 \`State=Sending data\` 的连接，通常是慢查询，优先排查。

## 28.2 SHOW STATUS

\`SHOW STATUS\` 查看服务器运行以来的计数器，是评估负载的核心。

**会话级 vs 全局级**：

\`\`\`sql
SHOW STATUS;              -- 默认会话级
SHOW GLOBAL STATUS;       -- 全局级（推荐）
\`\`\`

**关键指标**：

\`\`\`sql
-- 连接相关
SHOW GLOBAL STATUS LIKE 'Threads%';
-- Threads_connected: 当前连接数
-- Threads_running:  活跃线程数
-- Threads_created:  累计创建线程数（持续增长说明连接池配置不当）

-- QPS / TPS
SHOW GLOBAL STATUS LIKE 'Questions';
SHOW GLOBAL STATUS LIKE 'Com_select';
SHOW GLOBAL STATUS LIKE 'Com_insert';
SHOW GLOBAL STATUS LIKE 'Com_update';
SHOW GLOBAL STATUS LIKE 'Com_delete';
-- 计算公式：
-- QPS = (Questions_new - Questions_old) / 时间间隔
-- TPS = (Com_insert + Com_update + Com_delete) 的差值 / 时间间隔
\`\`\`

**InnoDB 关键指标**：

\`\`\`sql
SHOW GLOBAL STATUS LIKE 'Innodb_buffer_pool_read%';
-- Innodb_buffer_pool_read_requests:  总读取请求
-- Innodb_buffer_pool_reads:          物理磁盘读
-- 命中率 = 1 - reads / read_requests

SHOW GLOBAL STATUS LIKE 'Innodb_row%';
-- Innodb_rows_read / inserted / updated / deleted
\`\`\`

**计算 Buffer Pool 命中率**：

\`\`\`sql
SELECT 
  (1 - Innodb_buffer_pool_reads / Innodb_buffer_pool_read_requests) * 100 AS hit_rate_pct
FROM (
  SELECT 
    MAX(IF(Variable_name='Innodb_buffer_pool_reads', VALUE, 0)) AS Innodb_buffer_pool_reads,
    MAX(IF(Variable_name='Innodb_buffer_pool_read_requests', VALUE, 0)) AS Innodb_buffer_pool_read_requests
  FROM performance_schema.global_status
  WHERE Variable_name IN ('Innodb_buffer_pool_reads', 'Innodb_buffer_pool_read_requests')
) t;
\`\`\`

> 命中率 < 99% 通常意味着 \`innodb_buffer_pool_size\` 不够。

## 28.3 performance_schema

\`performance_schema\` 是 MySQL 内置的"运行时监控库"，记录锁、IO、等待、内存等底层细节。

**查看是否启用**：

\`\`\`sql
SHOW VARIABLES LIKE 'performance_schema';
-- ON
\`\`\`

**常用查询**：

\`\`\`sql
-- 1. 哪些 SQL 执行最多次
SELECT digest_text, count_star, avg_timer_wait/1000000000 AS avg_ms
FROM performance_schema.events_statements_summary_by_digest
ORDER BY count_star DESC LIMIT 10;

-- 2. 哪些 SQL 平均耗时最长
SELECT digest_text, count_star, 
       avg_timer_wait/1000000000 AS avg_ms,
       sum_timer_wait/1000000000 AS total_ms
FROM performance_schema.events_statements_summary_by_digest
ORDER BY avg_ms DESC LIMIT 10;

-- 3. 哪些表 IO 最高
SELECT object_schema, object_name, 
       count_read, count_write, count_fetch
FROM performance_schema.table_io_waits_summary_by_table
ORDER BY count_read + count_write DESC LIMIT 10;

-- 4. 等待事件 Top（锁、IO 等）
SELECT event_name, count_star, 
       avg_timer_wait/1000000000 AS avg_ms
FROM performance_schema.events_waits_summary_global_by_event_name
ORDER BY sum_timer_wait DESC LIMIT 10;
\`\`\`

**开启 instrumentation**（默认部分关闭）：

\`\`\`sql
UPDATE performance_schema.setup_instruments 
SET ENABLED = 'YES', TIMED = 'YES'
WHERE NAME LIKE '%wait%';

UPDATE performance_schema.setup_consumers 
SET ENABLED = 'YES' 
WHERE NAME LIKE '%events_waits%';
\`\`\`

## 28.4 sys schema

\`\`sys\` 是基于 performance_schema 的视图层，把复杂查询包装成简单 SQL。8.0 默认安装。

**最常用视图**：

\`\`\`sql
-- 1. 慢 SQL Top 10
SELECT * FROM sys.statements_with_runtimes_in_95th_percentile LIMIT 10;

-- 2. 全表扫描 SQL
SELECT * FROM sys.statements_with_full_table_scans LIMIT 10;

-- 3. 没走索引的表
SELECT * FROM sys.schema_tables_with_full_table_scans;

-- 4. 冗余索引
SELECT * FROM sys.schema_redundant_indexes;

-- 5. 未使用的索引
SELECT * FROM sys.schema_unused_indexes;

-- 6. 锁等待
SELECT * FROM sys.innodb_lock_waits;

-- 7. 当前 IO 等待
SELECT * FROM sys.io_global_by_wait_by_bytes LIMIT 10;

-- 8. 内存使用 Top
SELECT * FROM sys.memory_global_by_current_bytes LIMIT 10;
\`\`\`

**查看会话与状态**：

\`\`\`sql
SELECT * FROM sys.session;
SELECT * FROM sys.processlist;
\`\`\`

> \`sys\` 视图是日常排查的瑞士军刀，比手写 performance_schema 查询方便得多。

## 28.5 Prometheus + Grafana 监控

生产环境用 **mysqld_exporter** 把 MySQL 指标暴露给 Prometheus，再用 Grafana 大盘可视化。

**部署架构**：

\`\`\`
MySQL → mysqld_exporter → Prometheus → Grafana
\`\`\`

**mysqld_exporter 配置**（.my.cnf）：

\`\`\`ini
[client]
user=exporter
password=Exporter@123
host=127.0.0.1
\`\`\`

** exporter 用户权限**：

\`\`\`sql
CREATE USER 'exporter'@'localhost' IDENTIFIED BY 'Exporter@123';
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'localhost';
\`\`\`

**启动 exporter**：

\`\`\`bash
mysqld_exporter --config.my-cnf=.my.cnf --web.listen-address=:9104
\`\`\`

**Prometheus 抓取配置**：

\`\`\`yaml
scrape_configs:
  - job_name: 'mysql'
    static_configs:
      - targets: ['mysql-host:9104']
\`\`\`

**Grafana 大盘**：

- 官方推荐 dashboard ID：**7362**（MySQL Overview）
- 关键面板：QPS、TPS、连接数、Buffer Pool 命中率、慢查询数、复制延迟。

**告警规则示例**（PromQL）：

\`\`\`yaml
groups:
  - name: mysql
    rules:
      - alert: MysqlDown
        expr: mysql_up == 0
        for: 1m
      - alert: MysqlHighConnections
        expr: mysql_global_status_threads_connected / mysql_global_variables_max_connections > 0.8
        for: 5m
      - alert: MysqlReplicationLag
        expr: mysql_slave_status_seconds_behind_master > 60
        for: 5m
\`\`\`

## 28.6 本章小结

- **SHOW PROCESSLIST**：看实时连接，\`KILL\` 终止卡住的查询。
- **SHOW STATUS**：评估 QPS/TPS、连接数、Buffer Pool 命中率。
- **performance_schema**：底层监控，看 SQL/IO/锁/等待。
- **sys schema**：视图层封装，日常排查的瑞士军刀。
- **Prometheus + Grafana**：生产级可视化监控，配 mysqld_exporter。
- **告警**：连接数、复制延迟、慢查询数是三大基础告警项。

> 监控不是"装上就行"，而是要持续看大盘、调告警阈值、定期复盘。`
  },
  {
    id: "mysql-ch29",
    group: "第六部分 性能优化与运维实战",
    icon: "🐌",
    title: "第 29 章 慢查询分析",
    content: `# 第 29 章 慢查询分析

80% 的 MySQL 性能问题源自慢 SQL。本章带你从开启慢查询日志到使用 mysqldumpslow、pt-query-digest 分析，再到真实优化案例，打通"慢查询→优化"的完整闭环。

## 29.1 开启慢查询日志

**动态开启**：

\`\`\`sql
SHOW VARIABLES LIKE 'slow_query_log%';
SHOW VARIABLES LIKE 'long_query_time';

SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;            -- 超过 1 秒记慢查询
SET GLOBAL log_queries_not_using_indexes = ON; -- 未走索引的也记
SET GLOBAL log_slow_admin_statements = ON;     -- 慢 DDL 也记
\`\`\`

**持久化配置**（my.cnf）：

\`\`\`ini
[mysqld]
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1
log_queries_not_using_indexes = 1
log_slow_admin_statements = 1
\`\`\`

**慢查询日志格式**：

\`\`\`
# Time: 2024-01-01T10:00:00.123456Z
# User@Host: root[root] @ localhost []  Id: 12345
# Query_time: 2.345  Lock_time: 0.001  Rows_sent: 10  Rows_examined: 1000000
SET timestamp=1704067200;
SELECT * FROM orders WHERE status = 1 ORDER BY create_time DESC LIMIT 10;
\`\`\`

**关键指标**：

- **Query_time**：执行总时间
- **Lock_time**：等锁时间
- **Rows_examined**：扫描行数（与 \`Rows_sent\` 比值越大越该优化）

## 29.2 mysqldumpslow 工具

MySQL 自带的慢日志分析工具，快速聚合统计。

\`\`\`bash
# 按总耗时排序（默认）
mysqldumpslow -s t /var/log/mysql/slow.log

# 按次数排序
mysqldumpslow -s c /var/log/mysql/slow.log

# 按返回行数排序
mysqldumpslow -s r /var/log/mysql/slow.log

# Top 10
mysqldumpslow -s t -t 10 /var/log/mysql/slow.log

# 只看某模式的 SQL
mysqldumpslow -s t -t 10 -g 'orders' /var/log/mysql/slow.log
\`\`\`

**排序参数**：

| 参数 | 含义 |
| --- | --- |
| \`-s t\` | 按总时间 |
| \`-s at\` | 按平均时间 |
| \`-s c\` | 按次数 |
| \`-s r\` | 按返回行数 |
| \`-s ar\` | 按平均返回行数 |
| \`-t N\` | 显示 Top N |

**输出示例**：

\`\`\`
Count: 245  Time=2.10s (514s)  Lock=0.00s (0s)  Rows=10.0 (2450)
SELECT * FROM orders WHERE status = N ORDER BY create_time DESC LIMIT N
\`\`\`

> mysqldumpslow 把具体值替换为 \`N\`，便于聚合相同模板的 SQL。

## 29.3 pt-query-digest

Percona Toolkit 的 \`pt-query-digest\` 是慢查询分析的事实标准，比 mysqldumpslow 强大得多。

**安装**：

\`\`\`bash
apt install percona-toolkit
# 或
yum install percona-toolkit
\`\`\`

**基础用法**：

\`\`\`bash
pt-query-digest /var/log/mysql/slow.log > report.txt
\`\`\`

**输出结构**：

\`\`\`
# 1. 总体统计
# 3.5s user time, 100ms system time, 30.5M rss
# Overall: 12.34k total, 50 unique, 1 QPS, 0.5x concurrency
# Time range: 2024-01-01 00:00:00 to 2024-01-02 00:00:00
# Attribute   total     min     max     avg     95%  stddev  median
# ============ ======= ======= ======= ======= ======= ======= =======
# Exec time    5000s    1ms    100s   400ms   500ms    2s     50ms
# Lock time      50s       0     5s     4ms   100us   50ms       0
# Rows sent    500.5k       0  10.0k   41.34   100    500       0
# Rows examine 100.0M       0  10.0M  8.50k  100.0k  50.0k    9.36

# 2. 单条 SQL 详情（按影响排序）
# Profile
# Rank Query ID           Response time  Calls R/Call    V/M
# ==== ================== ============== ===== ========= =====
#    1 0xABCDEF1234567... 2000.0 40.0%   100  20.0s    1.50  SELECT orders
#    2 0x1234567890ABC... 1000.0 20.0%   500   2.0s    0.10  SELECT users

# 3. SQL 详情
# Query 1: 0.5 QPS, 10x concurrency, ID 0xABCDEF...
# Scores: V/M = 1.5
# Time range: ...
# Attribute    %   total     min     max     avg
# Exec time   40%   2000s   100ms    100s   20s
# ...
# Tables:
#    orders
# EXPLAIN: ...
SELECT * FROM orders WHERE status = 1 ORDER BY create_time DESC LIMIT 10
\`\`\`

**重点关注的指标**：

- **Response time 占比**：哪条 SQL 吃掉了最多时间。
- **V/M（方差/均值）**：> 1 说明执行时间不稳定，可能有锁等待。
- **Rows examine vs Rows sent**：比值大说明缺索引。

**进阶用法**：

\`\`\`bash
# 只分析最近 1 小时
pt-query-digest --since '1h' /var/log/mysql/slow.log

# 分析 binlog
pt-query-digest --type binlog mysql-bin.000001

# 分析 processlist
pt-query-digest --type processlist --interval 5

# 把结果存数据库
pt-query-digest --review h=host,D=test,t=slow_review /var/log/mysql/slow.log
\`\`\`

## 29.4 优化案例实战

**案例 1：缺索引导致全表扫描**

\`\`\`sql
-- 原始 SQL：扫描 100 万行
SELECT * FROM orders WHERE user_id = 123 AND status = 1;
-- Rows_examined: 1000000, Rows_sent: 50

-- 优化：加复合索引
ALTER TABLE orders ADD INDEX idx_user_status (user_id, status);
-- 优化后 Rows_examined: 50
\`\`\`

**案例 2：LEFT JOIN 大表导致慢**

\`\`\`sql
-- 原始：驱动表是大表
SELECT * FROM big_table b LEFT JOIN small_table s ON b.sid = s.id;
-- 优化：换驱动表，small_table 在前
SELECT * FROM small_table s JOIN big_table b ON s.id = b.sid;
\`\`\`

**案例 3：分页过深**

\`\`\`sql
-- 原始：LIMIT 1000000, 20（扫描 100 万行后才取 20 行）
SELECT * FROM orders ORDER BY id LIMIT 1000000, 20;

-- 优化 1：用游标（推荐）
SELECT * FROM orders WHERE id > 1000000 ORDER BY id LIMIT 20;

-- 优化 2：延迟关联
SELECT * FROM orders o 
JOIN (SELECT id FROM orders ORDER BY id LIMIT 1000000, 20) t 
ON o.id = t.id;
\`\`\`

**案例 4：函数导致索引失效**

\`\`\`sql
-- 原始：函数包裹列，索引失效
SELECT * FROM orders WHERE DATE(create_time) = '2024-01-01';

-- 优化：改范围查询
SELECT * FROM orders 
WHERE create_time >= '2024-01-01' AND create_time < '2024-01-02';
\`\`\`

**案例 5：隐式类型转换**

\`\`\`sql
-- phone 是 VARCHAR，传 INT 导致索引失效
SELECT * FROM users WHERE phone = 13800000000;  -- 慢

-- 优化：加引号
SELECT * FROM users WHERE phone = '13800000000';  -- 走索引
\`\`\`

**优化思路总结**：

1. 用 \`EXPLAIN\` 看执行计划，关注 \`type\`、\`key\`、\`rows\`、\`Extra\`。
2. \`type\` 优先级：\`system > const > eq_ref > ref > range > index > ALL\`，避免 ALL。
3. \`Extra\` 看到 \`Using filesort\`、\`Using temporary\` 要警惕。
4. \`rows\` 远大于返回行数就要考虑加索引。

## 29.5 本章小结

- **慢查询日志**：\`slow_query_log=ON\` + \`long_query_time=1\`。
- **mysqldumpslow**：自带的聚合工具，快速看 Top。
- **pt-query-digest**：生产级分析利器，关注 Response time 占比与 V/M。
- **优化五步**：看 EXPLAIN → 加复合索引 → 修函数包列 → 修类型转换 → 优化深分页。
- **铁律**：\`Rows_examined / Rows_sent\` 比值过大必有问题。

> 慢查询优化是后端工程师的核心竞争力，每周 review 一次慢日志是基本操作。`
  },
  {
    id: "mysql-ch30",
    group: "第六部分 性能优化与运维实战",
    icon: "🧠",
    title: "第 30 章 内存与 Buffer Pool",
    content: `# 第 30 章 内存与 Buffer Pool

Buffer Pool 是 InnoDB 性能的心脏，理解它的 LRU 改进、刷脏策略、监控指标，才能把 MySQL 调到最佳状态。本章深入 Buffer Pool 原理与调优实战。

## 30.1 Buffer Pool 原理

**Buffer Pool** 是 InnoDB 在内存中缓存数据页与索引页的区域，所有读写都先走它。

**写入流程（WAL）**：

\`\`\`
读：Buffer Pool 命中 → 返回；未命中 → 从磁盘读入 Buffer Pool → 返回
写：修改 Buffer Pool 中的页（变脏页）→ 写 Redo Log → 异步刷脏页到磁盘
\`\`\`

**Buffer Pool 结构**：

\`\`\`
Buffer Pool
  ├─ 数据页（16KB 一个）
  ├─ 索引页
  ├─ 自适应哈希索引（AHI）
  ├─ Change Buffer
  ├─ Lock 信息
  └─ Undo 页
\`\`\`

**查看 Buffer Pool 信息**：

\`\`\`sql
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';
SHOW STATUS LIKE 'Innodb_buffer_pool%';
\`\`\`

**关键指标**：

\`\`\`sql
SELECT 
  VARIABLE_NAME, VARIABLE_VALUE 
FROM performance_schema.global_status
WHERE VARIABLE_NAME LIKE 'Innodb_buffer_pool%';
\`\`\`

| 指标 | 含义 |
| --- | --- |
| \`Innodb_buffer_pool_pages_total\` | 总页数 |
| \`Innodb_buffer_pool_pages_data\` | 数据页数 |
| \`Innodb_buffer_pool_pages_dirty\` | 脏页数 |
| \`Innodb_buffer_pool_pages_free\` | 空闲页数 |
| \`Innodb_buffer_pool_read_requests\` | 逻辑读次数 |
| \`Innodb_buffer_pool_reads\` | 物理读次数 |

## 30.2 LRU 算法与改进

经典 LRU 在数据库场景有问题：**全表扫描会刷掉热点数据**。InnoDB 用改进版 LRU：

\`\`\`
LRU 链表：
[ young 区（5/8）  |  old 区（3/8）]
       ↑                  ↑
     head               midpoint     tail
\`\`\`

**改进点**：

1. **新生代 + 老生代**：新读入的页放在 midpoint（old 区头部），不是直接放 head。
2. **老生代停留时间**：必须在 old 区停留超过 \`innodb_old_blocks_time\`（默认 1 秒）才能晋升到 young 区。

**效果**：全表扫描的页进入 old 区，扫描完后很快被淘汰，不会污染 young 区热点数据。

**关键参数**：

\`\`\`sql
SHOW VARIABLES LIKE 'innodb_old_blocks_pct';   -- old 区比例，默认 37
SHOW VARIABLES LIKE 'innodb_old_blocks_time';  -- 老生代停留时间，默认 1000ms
\`\`\`

**查看 LRU 状态**：

\`\`\`sql
SELECT 
  pool_id, 
  pages_total, 
  pages_data, 
  pages_dirty, 
  pages_free,
  old_blocks_pct
FROM information_schema.INNODB_BUFFER_POOL_STATS;
\`\`\`

> **大表扫描优化**：临时调大 \`innodb_old_blocks_time\` 可减少对热点的污染。

## 30.3 innodb_buffer_pool_size 调优

**经验值**：

- **专用 MySQL 服务器**：物理内存的 **50%~70%**。
- **共享服务器**（与应用同机）：物理内存的 **30%~50%**。

**计算公式**：

\`\`\`
buffer_pool_size = 物理内存 × 0.6
预留：操作系统 + 连接 + 临时表 + sort_buffer × max_connections
\`\`\`

**在线调整**（5.7.5+）：

\`\`\`sql
-- 查看当前大小（字节）
SELECT @@innodb_buffer_pool_size;

-- 调整为 4GB
SET GLOBAL innodb_buffer_pool_size = 4 * 1024 * 1024 * 1024;

-- 查看调整进度
SHOW STATUS LIKE 'Innodb_buffer_pool_resize_status';
\`\`\`

**多 Buffer Pool 实例**（减少锁争用）：

\`\`\`sql
SHOW VARIABLES LIKE 'innodb_buffer_pool_instances';
-- 建议：pool_size > 1GB 时设为 8
SET GLOBAL innodb_buffer_pool_instances = 8;
\`\`\`

**判断是否够大**：

\`\`\`sql
-- 命中率应 > 99%
SELECT 
  (1 - Innodb_buffer_pool_reads / Innodb_buffer_pool_read_requests) * 100 AS hit_pct
FROM (
  SELECT 
    MAX(IF(Variable_name='Innodb_buffer_pool_reads', VALUE, 0)) AS Innodb_buffer_pool_reads,
    MAX(IF(Variable_name='Innodb_buffer_pool_read_requests', VALUE, 0)) AS Innodb_buffer_pool_read_requests
  FROM performance_schema.global_status
  WHERE Variable_name IN ('Innodb_buffer_pool_reads','Innodb_buffer_pool_read_requests')
) t;

-- 空闲页应有一定比例
SELECT 
  pages_free / pages_total * 100 AS free_pct
FROM information_schema.INNODB_BUFFER_POOL_STATS;
\`\`\`

> 命中率 < 99% 或 free 长期 < 5%，说明要加内存。

## 30.4 内存监控

**查看 Buffer Pool 完整状态**：

\`\`\`sql
SHOW ENGINE INNODB STATUS\\G
\`\`\`

关注 \`BUFFER POOL AND MEMORY\` 段：

\`\`\`
----------------------
BUFFER POOL AND MEMORY
----------------------
Total large memory allocated 4294967296   -- 4GB
Dictionary memory allocated 123456
Buffer pool size   262144                  -- 页数
Free buffers       1024
Database pages     260000
Old database pages 96200
Modified db pages  5000                    -- 脏页数
Pending reads 0
Pending writes: LRU 0, flush list 0, single page 0
Pages made young 1000, not young 5000
0.10 youngs/s, 0.50 non-youngs/s
Pages read 100000, created 5000, written 200000
100.00 reads/s, 5.00 creates/s, 50.00 writes/s
Buffer pool hit rate 1000 / 1000          -- 命中率 100%
young-making rate 0 / 1000
not (young-making rate 0 / 1000)
\`\`\`

**查看具体哪些页在 Buffer Pool**：

\`\`\`sql
SELECT 
  table_schema, table_name, 
  COUNT(*) AS pages,
  COUNT(*) * 16 / 1024 AS mb
FROM information_schema.INNODB_BUFFER_PAGE
WHERE table_name IS NOT NULL
GROUP BY table_schema, table_name
ORDER BY pages DESC
LIMIT 10;
\`\`\`

**刷脏参数调优**：

\`\`\`sql
SHOW VARIABLES LIKE 'innodb_max_dirty_pages_pct';       -- 脏页比例上限，默认 75
SHOW VARIABLES LIKE 'innodb_max_dirty_pages_pct_lwm';   -- 低水位，默认 0
SHOW VARIABLES LIKE 'innodb_io_capacity';               -- IO 容量，默认 200
SHOW VARIABLES LIKE 'innodb_io_capacity_max';           -- 最大 IO 容量，默认 2000

-- SSD 推荐
SET GLOBAL innodb_io_capacity = 2000;
SET GLOBAL innodb_io_capacity_max = 4000;
SET GLOBAL innodb_max_dirty_pages_pct = 60;
\`\`\`

## 30.5 本章小结

- **Buffer Pool**：内存缓存数据页与索引页，是 InnoDB 性能核心。
- **LRU 改进**：分 young/old 两区，新页进 old 区，停留 1 秒才晋升，防全表扫描污染热点。
- **大小调优**：专用机 50%~70% 内存，命中率 > 99% 为佳。
- **多实例**：> 1GB 时设 8 个 instance 减少锁争用。
- **刷脏调优**：SSD 调高 \`innodb_io_capacity\` 至 2000~4000。
- **监控**：\`SHOW ENGINE INNODB STATUS\` 看 \`BUFFER POOL AND MEMORY\` 段。

> 内存调优的本质是"让热点数据尽量待在内存里"，命中率 99% 是底线。`
  },
  {
    id: "mysql-ch31",
    group: "第六部分 性能优化与运维实战",
    icon: "🛠️",
    title: "第 31 章 运维实战",
    content: `# 第 31 章 运维实战

运维是 DBA 的日常：装机、调参、升级、迁移、排障。本章把生产中最常见的运维操作整理成清单，每个步骤都给可执行的命令与配置。

## 31.1 MySQL 安装部署

**YUM 安装（推荐）**：

\`\`\`bash
# 1. 添加官方仓库
yum install -y https://dev.mysql.com/get/mysql80-community-release-el7-7.noarch.rpm

# 2. 安装
yum install -y mysql-community-server

# 3. 启动
systemctl start mysqld
systemctl enable mysqld

# 4. 查初始密码
grep 'temporary password' /var/log/mysqld.log

# 5. 修改 root 密码
mysql -uroot -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'NewPass@123';
\`\`\`

**APT 安装**：

\`\`\`bash
apt update
apt install -y mysql-server
systemctl start mysql
\`\`\`

**Docker 部署**（仅测试用）：

\`\`\`bash
docker run -d --name mysql \\\\
  -p 3306:3306 \\\\
  -e MYSQL_ROOT_PASSWORD=Pass@123 \\\\
  -v /opt/mysql/data:/var/lib/mysql \\\\
  mysql:8.0
\`\`\`

**源码编译**（特殊需求）：

\`\`\`bash
cmake . -DWITH_BOOST=boost -DCMAKE_INSTALL_PREFIX=/usr/local/mysql
make && make install
\`\`\`

> 生产推荐 YUM/APT，便于版本管理与安全补丁更新。

## 31.2 配置文件调优（my.cnf）

**生产级 my.cnf 模板**：

\`\`\`ini
[mysqld]
# ---------- 基础 ----------
user = mysql
port = 3306
datadir = /var/lib/mysql
socket = /var/lib/mysql/mysql.sock
pid_file = /var/lib/mysql/mysqld.pid
server_id = 1

# ---------- 字符集 ----------
character_set_server = utf8mb4
collation_server = utf8mb4_unicode_ci

# ---------- 连接 ----------
max_connections = 1000
max_user_connections = 200
wait_timeout = 28800
interactive_timeout = 28800
thread_cache_size = 64

# ---------- InnoDB ----------
innodb_buffer_pool_size = 8G           # 物理内存 60%
innodb_buffer_pool_instances = 8
innodb_log_file_size = 1G
innodb_log_files_in_group = 2
innodb_flush_log_at_trx_commit = 1
innodb_flush_method = O_DIRECT
innodb_io_capacity = 2000
innodb_io_capacity_max = 4000
innodb_max_dirty_pages_pct = 60
innodb_file_per_table = 1

# ---------- 日志 ----------
log_bin = /var/lib/mysql/mysql-bin
binlog_format = ROW
binlog_row_image = MINIMAL
expire_logs_days = 7
sync_binlog = 1
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1
log_queries_not_using_indexes = 1
log_error = /var/log/mysql/error.log
innodb_print_all_deadlocks = 1

# ---------- 复制 ----------
gtid_mode = ON
enforce_gtid_consistency = ON
log_slave_updates = 1
replica_parallel_workers = 8
replica_parallel_type = LOGICAL_CLOCK

# ---------- SQL 模式 ----------
sql_mode = STRICT_TRANS_TABLES,ONLY_FULL_GROUP_BY,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION

# ---------- 安全 ----------
validate_password.policy = MEDIUM
validate_password.length = 12
default_password_lifetime = 90
\`\`\`

**调优思路**：

| 维度 | 关键参数 |
| --- | --- |
| **内存** | innodb_buffer_pool_size |
| **IO** | innodb_flush_method, innodb_io_capacity |
| **安全** | innodb_flush_log_at_trx_commit, sync_binlog |
| **并发** | max_connections, thread_cache_size |
| **日志** | binlog_format, expire_logs_days |

## 31.3 升级 MySQL（5.7 → 8.0）

**升级前检查**：

\`\`\`bash
# 1. 用 mysql_check 检查不兼容项
mysqlsh --util check-for-server-upgrade --user=root --host=localhost --password=xxx

# 输出示例：
# Errors: 0, Warnings: 5, Notices: 2
# 1. Removed features: QUERY_CACHE
# 2. Default auth plugin changes: mysql_native_password → caching_sha2_password
\`\`\`

**关键不兼容点**：

1. **查询缓存**：8.0 移除，相关参数全删。
2. **默认认证插件**：8.0 默认 \`caching_sha2_password\`，老客户端连不上。
3. **sql_mode**：默认值更严格。
4. **保留字**：\`RANK\`、\`GROUPS\` 等新增保留字。
5. **ORDER BY + LIMIT**：行为变化。
6. **字符集**：默认 utf8mb4，老 utf8 是别名。

**升级流程**（in-place）：

\`\`\`bash
# 1. 全量备份（必做！）
xtrabackup --backup --target-dir=/backup/before_upgrade

# 2. 停 5.7
systemctl stop mysqld

# 3. 升级 RPM
yum remove mysql-community-server
yum install mysql-community-server

# 4. 启动（会自动 upgrade 系统表）
systemctl start mysqld

# 5. 检查日志
tail -f /var/log/mysqld.log
# 看到 ready for connections 即升级成功
\`\`\`

**老客户端兼容**（临时方案）：

\`\`\`sql
-- 改回老认证插件
ALTER USER 'appuser'@'%' IDENTIFIED WITH mysql_native_password BY 'Pass@123';

# my.cnf
default_authentication_plugin = mysql_native_password
\`\`\`

> 升级务必先在测试环境演练，业务侧用 mysqlsh 工具提前发现问题。

## 31.4 数据迁移

**场景 1：同版本迁移**（mysqldump）：

\`\`\`bash
mysqldump -uorig -p -h old_host --single-transaction --master-data=2 \\\\
  --routines --triggers --events test | mysql -unew -p -h new_host test
\`\`\`

**场景 2：大库迁移**（XtraBackup + binlog 同步）：

\`\`\`bash
# 1. 备份源库
xtrabackup --backup --target-dir=/backup/full --user=root --password=xxx

# 2. prepare
xtrabackup --prepare --target-dir=/backup/full

# 3. 拷贝到目标机器并恢复

# 4. 建立复制，追平增量
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST='old_host',
  SOURCE_USER='repl',
  SOURCE_PASSWORD='xxx',
  SOURCE_AUTO_POSITION=1;
START REPLICA;

# 5. 应用切换：停写 → 等延迟归零 → 切流量
\`\`\`

**场景 3：异构迁移**（如 Oracle → MySQL）：

- 用工具：DataX、Kettle、AWS DMS、阿里云 DTS。
- 关注 SQL 方言差异（函数、语法、自增）。

**场景 4：上云迁移**：

- 阿里云 RDS：DTS 一键迁移。
- AWS RDS：AWS DMS。

## 31.5 故障排查思路

**通用排查五步法**：

1. **看现象**：是慢、报错、还是不可用？
2. **看日志**：error log、slow log、dmesg。
3. **看监控**：CPU、IO、连接数、QPS。
4. **看进程**：\`SHOW PROCESSLIST\` 看是否有卡住的 SQL。
5. **定位处理**：kill 卡住的 SQL、加索引、扩容。

**常见故障清单**：

| 现象 | 可能原因 | 排查命令 |
| --- | --- | --- |
| 连接数满 | 应用连接泄漏 | \`SHOW STATUS LIKE 'Threads%'\` |
| 慢查询暴增 | 索引失效/统计信息过期 | \`SHOW PROCESSLIST\` + slow log |
| CPU 飙高 | 全表扫描/排序 | \`SHOW PROCESSLIST\`、看 \`Com_sort\` |
| IO 飙高 | 脏页刷盘/大查询 | \`SHOW STATUS LIKE 'Innodb_buffer_pool%'\` |
| 锁等待 | 死锁/长事务 | \`SELECT * FROM sys.innodb_lock_waits\` |
| 复制延迟 | 大事务/DDL | \`SHOW REPLICA STATUS\\G\` |
| 磁盘满 | binlog/慢日志/数据膨胀 | \`du -sh /var/lib/mysql/*\` |

**应急处理**：

\`\`\`sql
-- 1. 找最耗时 SQL
SELECT * FROM sys.processlist ORDER BY time DESC LIMIT 5;

-- 2. 找最长事务
SELECT trx_id, trx_started, TIMESTAMPDIFF(SECOND, trx_started, NOW()) AS run_sec
FROM information_schema.INNODB_TRX
ORDER BY run_sec DESC;

-- 3. 找锁等待
SELECT * FROM sys.innodb_lock_waits;

-- 4. KILL
KILL <id>;
\`\`\`

> 故障排查的金科玉律：**先止血（kill/限流），再诊断（看日志/监控），后修复（加索引/扩容）**。

## 31.6 本章小结

- **安装**：生产用 YUM/APT，Docker 仅测试用。
- **my.cnf**：按 内存 / IO / 安全 / 并发 / 日志 五维调优，模板可直接用。
- **升级**：先 \`mysqlsh check-for-server-upgrade\`，备份后 in-place 升级，关注认证插件变化。
- **迁移**：小库 mysqldump，大库 XtraBackup + 复制，异构用 DTS。
- **故障排查**：五步法（现象→日志→监控→进程→处理），先止血再修复。

> 运维是经验学科，每个故障都是宝贵的"演练"，建议建立事故复盘机制。`
  },
  {
    id: "mysql-ch32",
    group: "第六部分 性能优化与运维实战",
    icon: "🌍",
    title: "第 32 章 MySQL 在生产环境",
    content: `# 第 32 章 MySQL 在生产环境

最后一章站到生产视角，对比主流高可用方案，介绍 MGR、InnoDB Cluster、云 RDS、NewSQL，并给出后续学习路径，帮你完成从"会用 MySQL"到"驾驭 MySQL"的跨越。

## 32.1 高可用方案对比（MHA/Orchestrator/MGR）

主流 MySQL 高可用方案：

| 方案 | 类型 | 优劣 | 状态 |
| --- | --- | --- | --- |
| **MHA** | 第三方脚本 | 老牌成熟，但已不维护 | 不推荐新项目 |
| **Orchestrator** | 拓扑管理 | 灵活，支持复杂拓扑 | 活跃 |
| **MGR**（Group Replication） | 官方插件 | 强一致，自动切换 | 推荐 |
| **InnoDB Cluster** | 官方栈 | MGR + MySQL Router + MySQL Shell | 生产首选 |
| **Galera Cluster** | 第三方 | 多主同步 | Percona/Codership |
| **Keepalived + 双主** | VIP 漂移 | 简单但易脑裂 | 小规模可用 |

**MHA 已被淘汰的原因**：

- 不支持 GTID 自动切换。
- Master 故障时数据可能丢（异步复制）。
- 作者已停止维护。

**生产推荐**：

- 中小规模：**Orchestrator + 半同步复制**。
- 中大规模：**InnoDB Cluster**（MGR）。
- 云上：直接用云厂商 RDS 的高可用版。

## 32.2 MGR（Group Replication）

**MGR** 是 MySQL 官方的多副本同步方案，基于 Paxos 变种协议。

**两种模式**：

- **单主模式**（推荐）：同一时刻只有一个节点可写，自动选举。
- **多主模式**：所有节点可写，冲突检测，限制多（不推荐）。

**核心特性**：

- **自动故障检测**：节点宕机自动剔除。
- **自动选举**：Master 宕机秒级选出新 Master。
- **强一致**：事务需多数节点确认才提交。

**MGR 部署**：

\`\`\`ini
# my.cnf
[mysqld]
gtid_mode = ON
enforce_gtid_consistency = ON
binlog_format = ROW
log_slave_updates = 1
transaction_write_set_extraction = XXHASH64
loose-group_replication_group_name = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
loose-group_replication_start_on_boot = OFF
loose-group_replication_local_address = "node1:33061"
loose-group_replication_group_seeds = "node1:33061,node2:33061,node3:33061"
loose-group_replication_bootstrap_group = OFF
\`\`\`

**启动 MGR**：

\`\`\`sql
-- 首个节点（引导组）
INSTALL PLUGIN group_replication SONAME 'group_replication.so';
SET GLOBAL group_replication_bootstrap_group = ON;
START GROUP_REPLICATION;
SET GLOBAL group_replication_bootstrap_group = OFF;

-- 其它节点
INSTALL PLUGIN group_replication SONAME 'group_replication.so';
START GROUP_REPLICATION;

-- 查看组状态
SELECT * FROM performance_schema.replication_group_members;
SELECT * FROM performance_schema.replication_group_member_stats;
\`\`\`

**MGR 限制**：

- 表必须有主键。
- 不支持 \`SAVEPOINT\` 跨节点。
- 多主模式不支持外键。
- 网络要求高（建议内网/低延迟）。

> MGR 推荐**奇数节点**（3 或 5）， tolerate 失败节点数为 \`(n-1)/2\`。

## 32.3 InnoDB Cluster

**InnoDB Cluster** 是基于 MGR 的完整高可用栈，包含：

1. **MGR**：底层多副本同步。
2. **MySQL Router**：智能路由，自动感知 Master 切换。
3. **MySQL Shell**：管理工具，一键部署。

**部署流程**（MySQL Shell）：

\`\`\`bash
# 1. 在每台机器上配置好 MGR
# 2. 用 MySQL Shell 引导
mysqlsh

mysqlsh> dba.configureInstance('root@node1:3306')
mysqlsh> dba.configureInstance('root@node2:3306')
mysqlsh> dba.configureInstance('root@node3:3306')

# 3. 创建集群
mysqlsh> shell.connect('root@node1:3306')
mysqlsh> var cluster = dba.createCluster('myCluster')

# 4. 加节点
mysqlsh> cluster.addInstance('root@node2:3306')
mysqlsh> cluster.addInstance('root@node3:3306')

# 5. 查看状态
mysqlsh> cluster.status()
\`\`\`

**MySQL Router 部署**：

\`\`\`bash
mysqlrouter --bootstrap root@node1:3306 --directory /opt/router
/opt/router/start.sh
\`\`\`

应用连 Router 的 6446（读写）和 6447（只读）端口，Router 自动路由到正确节点。

**架构示意**：

\`\`\`
App → MySQL Router (6446/6447)
         ↓
    InnoDB Cluster (MGR)
    [node1 Master] [node2 Slave] [node3 Slave]
\`\`\`

> InnoDB Cluster 是 Oracle 官方主推方案，运维体验最好，但学习曲线陡。

## 32.4 云数据库 RDS

**主流云 RDS**：

| 厂商 | 产品 | 特点 |
| --- | --- | --- |
| **阿里云** | RDS MySQL / PolarDB | 高可用版、集群版、三节点企业版 |
| **腾讯云** | TDSQL-C / 云数据库 MySQL | 兼容 MySQL，存算分离 |
| **AWS** | RDS for MySQL / Aurora | Aurora 是云原生版 |
| **Google Cloud** | Cloud SQL / Cloud Spanner | Spanner 是全球分布式 |
| **华为云** | GaussDB(for MySQL) | 存算分离 |

**云 RDS 的优势**：

- **免运维**：备份、监控、HA 自动化。
- **弹性扩容**：一键升配。
- **高可用**：主备自动切换。
- **安全合规**：网络隔离、审计、加密。

**劣势**：

- **成本**：长期高于自建。
- **权限受限**：无 SUPER 权限，部分参数不可改。
- **定制化弱**：无法装自定义插件。

**选型建议**：

| 场景 | 推荐 |
| --- | --- |
| 创业团队 / 中小业务 | 阿里云 RDS / AWS RDS |
| 大数据量 + 高并发 | PolarDB / Aurora（云原生） |
| 强定制需求 | 自建 MySQL + MGR |
| 跨地域全球部署 | TiDB / Spanner |

## 32.5 MySQL 与 NewSQL（TiDB/OceanBase）

**NewSQL** 兼具 NoSQL 的扩展性与 RDBMS 的 ACID，是对 MySQL 单机瓶颈的根本性突破。

| 系统 | 厂商 | 兼容性 | 特点 |
| --- | --- | --- | --- |
| **TiDB** | PingCAP | MySQL 协议 | HTAP、存算分离、弹性扩容 |
| **OceanBase** | 蚂蚁 | MySQL / Oracle 兼容 | 金融级、多租户 |
| **CockroachDB** | Cockroach Labs | PostgreSQL 协议 | 全球分布式 |
| **YugabyteDB** | Yugabyte | PostgreSQL / Cassandra | 云原生 |
| **PolarDB-X** | 阿里 | MySQL 协议 | 分布式 MySQL |

**TiDB 适合场景**：

- 数据量 > 10TB，单机扛不住。
- 需要弹性扩缩容。
- 需要分析查询（OLAP + OLTP）。
- 跨地域多活。

**TiDB 与 MySQL 差异**：

- 分布式事务延迟略高（10~30ms vs MySQL 的 1~5ms）。
- 不支持 MySQL 的某些函数与语法。
- 不建议单表数据量过小（< 100 万用 MySQL 更划算）。

**迁移判断**：

\`\`\`
数据量 < 1TB  → MySQL + 读写分离
数据量 1~10TB → MySQL 分库分表 或 PolarDB
数据量 > 10TB → TiDB / OceanBase
\`\`\`

## 32.6 总结与学习路径

**MySQL 知识体系全景**：

\`\`\`
1. SQL 基础（增删改查、连接、子查询）
2. 数据建模（范式、反范式、字段类型）
3. 索引（B+树、覆盖索引、最左前缀）
4. 事务与锁（ACID、隔离级别、MVCC、死锁）
5. 架构（存储引擎、日志、复制、读写分离）
6. 性能优化（EXPLAIN、慢查询、Buffer Pool）
7. 高可用（MGR、InnoDB Cluster、RDS）
8. 运维（安装、备份、监控、故障排查）
\`\`\`

**进阶学习路径**：

1. **读官方文档**：\`https://dev.mysql.com/doc/refman/8.0/en/\`
2. **读源码**：从 \`sql/sql_parse.cc\` 入口看 SQL 执行流程。
3. **读经典书**：
   - 《高性能 MySQL》
   - 《MySQL 实战 45 讲》（极客时间）
   - 《数据库系统概念》
4. **实操**：搭一套 MGR 测试集群，故意制造故障。
5. **关注社区**：Percona Blog、MySQL Planet、官方 Release Notes。

**面试高频考点**：

- B+ 树为什么适合做索引？
- InnoDB 的 Redo Log / Undo Log / Binlog 区别？
- MVCC 如何实现 RR 隔离？
- 聚簇索引与非聚簇索引区别？
- 主从复制延迟怎么解决？
- 死锁如何排查？

## 32.7 本章小结

- **高可用方案**：MHA 已淘汰，新项目用 InnoDB Cluster 或 Orchestrator。
- **MGR**：官方同步复制，单主模式推荐，奇数节点。
- **InnoDB Cluster**：MGR + Router + Shell 的完整栈，生产首选。
- **云 RDS**：免运维、易扩容，中小团队首选；强定制选自建。
- **NewSQL**：TiDB/OceanBase 适合 > 10TB 海量数据场景。
- **学习路径**：基础 → 架构 → 优化 → 高可用 → 运维，持续看官方文档与社区。

> MySQL 的世界很广，把"会用"练到"精通"没有捷径——多踩坑、多复盘、多读源码。祝你早日成为团队里最懂 MySQL 的人！`
  }
];

export { chapters };
