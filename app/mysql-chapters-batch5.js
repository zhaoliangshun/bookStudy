// =============================================================
// 《MySQL 实战教程》- 章节批次 5
// -------------------------------------------------------------
// 内容：第五部分 架构与高可用（第 22-27 章）
// =============================================================

const chapters = [
  {
    id: "mysql-ch22",
    group: "第五部分 架构与高可用",
    icon: "🏗️",
    title: "第 22 章 存储引擎",
    content: `# 第 22 章 存储引擎

存储引擎是 MySQL "插件式架构"的核心，决定了数据如何存储、如何索引、是否支持事务。本章对比主流存储引擎，深入 InnoDB 架构，帮你在不同场景做出正确选型。

## 22.1 InnoDB vs MyISAM

MySQL 5.5 起默认存储引擎从 MyISAM 切换为 **InnoDB**，两者核心差异：

| 维度 | InnoDB | MyISAM |
| --- | --- | --- |
| **事务** | 支持 ACID | 不支持 |
| **锁粒度** | 行锁 | 表锁 |
| **外键** | 支持 | 不支持 |
| **崩溃恢复** | 支持（Redo Log） | 不支持，易损坏 |
| **全文索引** | 5.6+ 支持 | 支持 |
| **压缩比** | 一般 | 高 |
| **适用场景** | OLTP 业务 | 只读/归档（已不推荐） |
| **COUNT(*)** | 慢（需扫描） | 快（有计数器） |

**查看表的存储引擎**：

\`\`\`sql
SHOW TABLE STATUS FROM test LIKE 'users'\\G
-- Engine: InnoDB

-- 查看所有表引擎
SELECT table_name, engine 
FROM information_schema.tables 
WHERE table_schema = 'test';
\`\`\`

**修改表的存储引擎**：

\`\`\`sql
ALTER TABLE users ENGINE = InnoDB;
\`\`\`

> **结论**：所有业务表用 InnoDB，MyISAM 已无存在必要。MySQL 8.0 系统表也全部 InnoDB 化。

## 22.2 InnoDB 的架构（Buffer Pool / Redo Log / Undo Log）

InnoDB 由**内存结构 + 磁盘结构**组成，核心组件：

**内存结构**：

| 组件 | 作用 |
| --- | --- |
| **Buffer Pool** | 缓存数据页与索引页，读写都先走它 |
| **Change Buffer** | 缓存对非唯一二级索引的修改 |
| **Adaptive Hash Index** | 自适应哈希索引，自动优化等值查询 |
| **Log Buffer** | 缓存 Redo Log，定期刷盘 |

**磁盘结构**：

| 组件 | 作用 |
| --- | --- |
| **系统表空间**（ibdata1） | 数据字典等 |
| **独立表空间**（.ibd） | 每张表一个文件，默认 |
| **Redo Log**（ib_logfile） | 崩溃恢复，保证持久性 |
| **Undo Log**（undo tablespace） | 事务回滚与 MVCC |
| **Binlog**（不属于 InnoDB） | 主从复制、PITR |

**InnoDB 写入流程**（WAL，Write-Ahead Logging）：

\`\`\`
1. 执行 UPDATE → 在 Buffer Pool 修改数据页（脏页）
2. 生成 Redo Log 写入 Log Buffer
3. Log Buffer 刷到 Redo Log 文件
4. 提交事务（COMMIT）
5. 后台线程异步把脏页刷到表空间 .ibd
\`\`\`

> **WAL 的核心**：先写日志，再写数据。崩溃后可重做 Redo Log 恢复，避免数据丢失。

**Buffer Pool 调优**：

\`\`\`sql
-- 查看 Buffer Pool 大小
SELECT @@innodb_buffer_pool_size / 1024 / 1024 / 1024 AS pool_gb;

-- 查看 Buffer Pool 状态
SHOW ENGINE INNODB STATUS\\G
-- 找 BUFFER POOL AND MEMORY 段

-- 在线调整大小（8.0）
SET GLOBAL innodb_buffer_pool_size = 4294967296; -- 4GB
\`\`\`

> 一般建议 Buffer Pool 为**物理内存的 50%~70%**。

## 22.3 其他存储引擎（Memory/Archive/CSV）

**Memory 引擎**：数据存内存，重启即丢，表锁。

\`\`\`sql
CREATE TABLE session_cache (
  id INT,
  data VARCHAR(100)
) ENGINE = MEMORY;
\`\`\`

适用：临时表、缓存、Session。

**Archive 引擎**：高压缩比，只支持 INSERT 和 SELECT，无 UPDATE/DELETE。

\`\`\`sql
CREATE TABLE logs_archive (
  id BIGINT,
  msg TEXT
) ENGINE = ARCHIVE;
\`\`\`

适用：日志归档、历史数据。

**CSV 引擎**：数据存为 .csv 文本文件，无索引，可用于与外部系统交换。

\`\`\`sql
CREATE TABLE export_data (
  id INT,
  name VARCHAR(50)
) ENGINE = CSV;
-- 文件位于数据目录下 export_data.CSV
\`\`\`

## 22.4 如何选择存储引擎

| 场景 | 推荐 |
| --- | --- |
| **OLTP 业务**（99% 场景） | InnoDB |
| **临时表 / 缓存** | Memory 或 Redis |
| **日志归档** | Archive 或 InnoDB 压缩表 |
| **只读统计** | InnoDB（足够好） |
| **跨系统数据交换** | CSV |

**InnoDB 压缩表**：

\`\`\`sql
CREATE TABLE big_data (
  id BIGINT PRIMARY KEY,
  data TEXT
) ENGINE=InnoDB 
ROW_FORMAT=COMPRESSED 
KEY_BLOCK_SIZE=8;
\`\`\`

> 压缩节省磁盘，但增加 CPU 开销，适合 IO 密集型而非 CPU 密集型场景。

## 22.5 本章小结

- **InnoDB 一统天下**：5.5 起默认，8.0 系统表全部 InnoDB，新项目无脑选它。
- **InnoDB vs MyISAM**：事务、行锁、崩溃恢复是关键差异。
- **WAL**：先写 Redo Log 再刷脏页，保证持久性。
- **Buffer Pool**：建议设为物理内存 50%~70%。
- **其他引擎**：Memory（缓存）、Archive（归档）、CSV（交换），场景有限。
- **压缩表**：用 \`ROW_FORMAT=COMPRESSED\` 节省空间，注意 CPU 开销。

> 存储引擎是数据"长什么样"的决定者，下一章我们看让 InnoDB 又快又安全的"日志三件套"。`
  },
  {
    id: "mysql-ch23",
    group: "第五部分 架构与高可用",
    icon: "🛢️",
    title: "第 23 章 日志系统",
    content: `# 第 23 章 日志系统

InnoDB 的强大离不开三套日志：**Redo Log、Undo Log、Binlog**。它们各司其职，共同支撑起事务的 ACID、崩溃恢复、主从复制。本章深入讲解每套日志的作用与协作机制。

## 23.1 Redo Log（重做日志）

**Redo Log** 记录"数据页的物理修改"，用于崩溃恢复——掉电后能用它把未刷盘的修改重做一遍，保证持久性。

**核心参数**：

\`\`\`sql
SHOW VARIABLES LIKE 'innodb_log_file%';     -- 单个文件大小
SHOW VARIABLES LIKE 'innodb_log_files_in_group'; -- 文件个数（8.0.30 前）
SHOW VARIABLES LIKE 'innodb_redo_log_capacity'; -- 8.0.30+ 统一容量
\`\`\`

**Redo Log 的循环写入**：

\`\`\`
[ ib_logfile0 ][ ib_logfile1 ][ ib_logfile2 ]
       ↑ write pos              ↑ checkpoint
\`\`\`

- **write pos**：当前写入位置
- **checkpoint**：可被覆盖的位置
- 两者之间是已写未刷盘的 Redo，到尽头就绕回头部循环

**刷盘策略**（innodb_flush_log_at_trx_commit）：

| 值 | 行为 | 安全性 | 性能 |
| --- | --- | --- | --- |
| **0** | 每秒刷盘 | 最低（丢 1 秒） | 最高 |
| **1** | 每次提交都刷盘 | 最高 | 最低 |
| **2** | 每次提交写 OS Cache，每秒刷盘 | 中 | 中 |

\`\`\`sql
-- 生产环境推荐 1
SET GLOBAL innodb_flush_log_at_trx_commit = 1;
\`\`\`

> 金融场景必须为 1，可接受丢 1 秒数据的非核心业务可设 2 提升性能。

## 23.2 Undo Log（回滚日志）

**Undo Log** 记录"修改前的旧版本"，两大作用：

1. **事务回滚**：ROLLBACK 时用 Undo 还原数据。
2. **MVCC**：读旧版本数据时从 Undo 链上找。

**Undo 与 MVCC**：

\`\`\`sql
-- 事务 A 修改 id=1
BEGIN;
UPDATE users SET name = 'Tom' WHERE id = 1; 
-- Undo Log 记录旧值 name='Jerry'

-- 事务 B（在 A 提交前开始）
BEGIN;
SELECT name FROM users WHERE id = 1; -- 读到 'Jerry'（来自 Undo Log）
\`\`\`

**Undo 相关参数**：

\`\`\`sql
SHOW VARIABLES LIKE 'innodb_undo_tablespaces';
SHOW VARIABLES LIKE 'innodb_max_undo_log_size';
SHOW VARIABLES LIKE 'innodb_undo_log_truncate'; -- 自动回收
\`\`\`

**Undo Log 增长的坑**：长事务会持有旧版本 Undo，导致 Undo Log 持续膨胀。

\`\`\`sql
-- 查看长事务，及时 kill
SELECT trx_id, trx_started, trx_query 
FROM information_schema.INNODB_TRX
ORDER BY trx_started LIMIT 5;
\`\`\`

## 23.3 Binlog（二进制日志）

**Binlog** 是 MySQL Server 层日志（不属 InnoDB），记录所有**已提交**的 DDL/DML，三大用途：

1. **主从复制**：从库重放 binlog 同步数据。
2. **数据恢复**：基于时间点恢复（PITR）。
3. **审计**：追踪数据变更。

**开启 Binlog**：

\`\`\`ini
# my.cnf
[mysqld]
log_bin = /var/lib/mysql/mysql-bin
binlog_format = ROW     # 推荐 ROW
expire_logs_days = 7    # 保留 7 天（8.0 用 binlog_expire_logs_seconds）
server_id = 1           # 必须设置
\`\`\`

**查看 Binlog**：

\`\`\`sql
SHOW BINARY LOGS;             -- 列出所有 binlog 文件
SHOW MASTER STATUS;           -- 当前写入位置
SHOW BINLOG EVENTS IN 'mysql-bin.000001'\\G  -- 查看事件
\`\`\`

**binlog_format 三种格式**：

| 格式 | 内容 | 优劣 |
| --- | --- | --- |
| **STATEMENT** | 记 SQL 文本 | 小，但函数/不确定 SQL 会不一致 |
| **ROW** | 记每行变更前后镜像 | 大，但精确，推荐 |
| **MIXED** | 混合 | 折中 |

\`\`\`sql
SET GLOBAL binlog_format = 'ROW';
\`\`\`

> **生产推荐 ROW**：精确、可恢复、避免主从不一致。

## 23.4 Redo Log vs Binlog

两者容易混淆，关键差异：

| 维度 | Redo Log | Binlog |
| --- | --- | --- |
| **归属** | InnoDB 引擎层 | MySQL Server 层 |
| **内容** | 物理修改（页号 + 偏移） | 逻辑修改（SQL 或行变更） |
| **写入方式** | 循环写，会覆盖 | 追加写，不覆盖 |
| **用途** | 崩溃恢复 | 复制、PITR |
| **产生时机** | 事务执行中持续写 | 事务提交时写 |

> **关键**：Redo Log 是"物理日志"，Binlog 是"逻辑日志"，二者不能互相替代。

## 23.5 两阶段提交

为保证 Redo Log 与 Binlog 一致，MySQL 采用 **两阶段提交（2PC）**：

\`\`\`
1. InnoDB 写 Redo Log（prepare 状态）
2. MySQL Server 写 Binlog
3. InnoDB 写 Redo Log（commit 状态）
\`\`\`

**崩溃恢复规则**：

- 若崩溃时 Redo Log 已 commit：直接恢复。
- 若 Redo Log 处于 prepare：
  - 查 Binlog 是否完整 → 完整则提交，不完整则回滚。

\`\`\`sql
-- 查看 2PC 状态
SHOW VARIABLES LIKE 'innodb_flush_log_at_trx_commit';
SHOW VARIABLES LIKE 'sync_binlog';
\`\`\`

**双 1 配置**（生产标配）：

\`\`\`ini
[mysqld]
innodb_flush_log_at_trx_commit = 1  -- Redo 每次提交刷盘
sync_binlog = 1                     -- Binlog 每次提交刷盘
\`\`\`

> 双 1 是数据安全的底线，性能损失换数据不丢。

## 23.6 慢查询日志

**慢查询日志** 记录执行时间超过阈值的 SQL，是性能优化的入口。

**开启慢查询**：

\`\`\`sql
SHOW VARIABLES LIKE 'slow_query_log%';
SHOW VARIABLES LIKE 'long_query_time';

SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;        -- 超过 1 秒记为慢查询
SET GLOBAL log_queries_not_using_indexes = ON; -- 未走索引的也记录
\`\`\`

**查看慢查询文件**：

\`\`\`sql
SHOW VARIABLES LIKE 'slow_query_log_file';
-- /var/lib/mysql/host-slow.log
\`\`\`

**日志格式**：

\`\`\`
# Time: 2024-01-01T10:00:00.123456Z
# User@Host: root[root] @ localhost []
# Query_time: 2.5  Lock_time: 0.0  Rows_sent: 10  Rows_examined: 1000000
SELECT * FROM orders WHERE status = 1;
\`\`\`

> 看到 \`Rows_examined\` 远大于 \`Rows_sent\`，基本就是缺索引。下一章会用 pt-query-digest 深入分析。

## 23.7 本章小结

- **Redo Log**：物理日志，循环写，保证崩溃恢复，靠 \`innodb_flush_log_at_trx_commit\` 控制刷盘。
- **Undo Log**：旧版本数据，用于回滚与 MVCC，长事务会使其膨胀。
- **Binlog**：Server 层逻辑日志，追加写，用于复制和 PITR，推荐 ROW 格式。
- **两阶段提交**：Redo prepare → Binlog → Redo commit，保证两日志一致。
- **双 1 配置**：\`innodb_flush_log_at_trx_commit=1\` + \`sync_binlog=1\`，生产标配。
- **慢查询日志**：性能优化入口，关注 \`Rows_examined\` 找缺索引 SQL。

> 日志系统是 MySQL 高可用的基石，下一章我们看 Binlog 最经典的应用——主从复制。`
  },
  {
    id: "mysql-ch24",
    group: "第五部分 架构与高可用",
    icon: "🔁",
    title: "第 24 章 主从复制",
    content: `# 第 24 章 主从复制

主从复制是 MySQL 高可用、读写分离、异地容灾的基础。本章系统讲解复制原理、三种主流模式（异步/GTID/半同步）、延迟排查与切换实战。

## 24.1 主从复制的原理

**主从复制三步走**：

1. **Master** 把变更写入 Binlog。
2. **Slave** 的 IO 线程拉取 Master 的 Binlog，写入本地 Relay Log。
3. **Slave** 的 SQL 线程重放 Relay Log，应用变更。

\`\`\`
Master                Slave
  │                     │
  │ Binlog Dump         │
  │ ─────────────────→  │ IO Thread → Relay Log
  │                     │ SQL Thread → 重放
\`\`\`

**三个关键线程**：

\`\`\`sql
-- Master 上查看
SHOW PROCESSLIST;
-- Binlog Dump 线程

-- Slave 上查看
SHOW SLAVE STATUS\\G
-- Slave_IO_Running: Yes
-- Slave_SQL_Running: Yes
\`\`\`

**MySQL 8.0 推荐命令**（替换 SLAVE 关键字）：

\`\`\`sql
SHOW REPLICA STATUS\\G
\`\`\`

## 24.2 基于位的复制（binlog）

最传统的复制方式，靠 **binlog 文件名 + 位置（position）** 标识同步点。

**Master 配置**：

\`\`\`ini
[mysqld]
server_id = 1
log_bin = /var/lib/mysql/mysql-bin
binlog_format = ROW
\`\`\`

**创建复制账号**：

\`\`\`sql
CREATE USER 'repl'@'%' IDENTIFIED BY 'Repl@12345';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
FLUSH PRIVILEGES;
\`\`\`

**查 Master 位点**：

\`\`\`sql
SHOW MASTER STATUS;
-- File: mysql-bin.000003
-- Position: 1234
\`\`\`

**Slave 配置并启动**：

\`\`\`ini
[mysqld]
server_id = 2
relay_log = /var/lib/mysql/relay-bin
read_only = 1
\`\`\`

\`\`\`sql
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST = '192.168.1.10',
  SOURCE_USER = 'repl',
  SOURCE_PASSWORD = 'Repl@12345',
  SOURCE_LOG_FILE = 'mysql-bin.000003',
  SOURCE_LOG_POS = 1234;

START REPLICA;
\`\`\`

> 基于位点的复制**切换复杂**：Master 宕机时，新 Master 的位点需要计算，容易出错。生产推荐 GTID。

## 24.3 GTID 复制

**GTID（Global Transaction ID）** = \`source_id:transaction_id\`，例如 \`3E11FA47-71CA-11E1-9E33-C80AA9429562:23\`，每个事务全局唯一。

**优势**：

- 自动定位同步点，无需手动指定 file/pos。
- 主从切换简单，从库自动跳过已执行事务。
- 易于判断一致性。

**开启 GTID**：

\`\`\`ini
[mysqld]
gtid_mode = ON
enforce_gtid_consistency = ON
log_slave_updates = ON   -- 8.0 必须开
\`\`\`

**基于 GTID 建立复制**：

\`\`\`sql
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST = '192.168.1.10',
  SOURCE_USER = 'repl',
  SOURCE_PASSWORD = 'Repl@12345',
  SOURCE_AUTO_POSITION = 1;  -- 关键：自动定位

START REPLICA;
SHOW REPLICA STATUS\\G
-- Auto_Position: 1
-- Retrieved_Gtid_Set / Executed_Gtid_Set
\`\`\`

**跳过冲突事务**（慎用）：

\`\`\`sql
STOP REPLICA;
SET GTID_NEXT = '3E11FA47-71CA-11E1-9E33-C80AA9429562:23';
BEGIN; COMMIT;
SET GTID_NEXT = AUTOMATIC;
START REPLICA;
\`\`\`

## 24.4 半同步复制

异步复制下，Master 不等 Slave 确认即返回提交成功，**Slave 数据可能滞后**。半同步复制要求至少一个 Slave 确认收到 binlog 才返回。

**Master 安装插件**：

\`\`\`sql
INSTALL PLUGIN rpl_semi_sync_source SONAME 'semisync_source.so';
SET GLOBAL rpl_semi_sync_source_enabled = 1;
SET GLOBAL rpl_semi_sync_source_timeout = 1000; -- 1 秒
\`\`\`

**Slave 安装插件**：

\`\`\`sql
INSTALL PLUGIN rpl_semi_sync_replica SONAME 'semisync_replica.so';
SET GLOBAL rpl_semi_sync_replica_enabled = 1;
\`\`\`

**超时降级**：若 Slave 在 timeout 内未确认，Master 自动降级为异步，避免业务卡死。

| 模式 | 数据安全 | 性能 |
| --- | --- | --- |
| 异步 | 低 | 高 |
| 半同步 | 中 | 中 |
| 全同步 | 高 | 低（极少用） |

> 生产推荐 **半同步 + GTID**，兼顾一致性与可用性。

## 24.5 复制延迟的排查

**查看延迟**：

\`\`\`sql
SHOW REPLICA STATUS\\G
-- Seconds_Behind_Source: 0
\`\`\`

但 \`Seconds_Behind_Source\` 不一定准确（基于时间戳），更可靠的方法：

\`\`\`sql
-- 在 Master 上写入心跳表
CREATE DATABASE IF NOT EXISTS monitor;
CREATE TABLE monitor.heartbeat (
  ts DATETIME NOT NULL
);
UPDATE monitor.heartbeat SET ts = NOW();

-- 在 Slave 上比对
SELECT TIMESTAMPDIFF(SECOND, ts, NOW()) AS lag_seconds 
FROM monitor.heartbeat;
\`\`\`

**延迟常见原因**：

1. **大事务**：单事务影响百万行，Slave 重放慢。
2. **DDL**：ALTER TABLE 在 Slave 上是串行的。
3. **Slave 配置低**：CPU/IO 比 Master 弱。
4. **单线程重放**：MySQL 5.6 前 SQL 线程单线程。

**多线程复制（MTS）**：

\`\`\`ini
[mysqld]
replica_parallel_workers = 8               -- 并行 worker 数
replica_parallel_type = LOGICAL_CLOCK      -- 基于组提交并行
\`\`\`

\`\`\`sql
STOP REPLICA;
SET GLOBAL replica_parallel_workers = 8;
SET GLOBAL replica_parallel_type = 'LOGICAL_CLOCK';
START REPLICA;
\`\`\`

## 24.6 主从切换

**计划内切换（MHA / Orchestrator）**：

1. 检查所有 Slave 同步状态。
2. 让旧 Master 只读。
3. 等待延迟归零。
4. 选定新 Master，提升为读写。
5. 其它 Slave 指向新 Master。

**手动切换示例（GTID）**：

\`\`\`sql
-- 旧 Master 设只读
SET GLOBAL super_read_only = ON;

-- 等待所有 Slave 同步完成（Executed_Gtid_Set 一致）

-- 新 Master（原 Slave）取消只读
STOP REPLICA;
RESET REPLICA ALL;
SET GLOBAL super_read_only = OFF;

-- 其它 Slave 指向新 Master
STOP REPLICA;
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST = 'new_master_host',
  SOURCE_AUTO_POSITION = 1;
START REPLICA;
\`\`\`

> 生产环境**绝不手动切换**，用 MHA、Orchestrator、MGR 等工具自动化。

## 24.7 本章小结

- **复制原理**：Master 写 Binlog → Slave IO 拉取 Relay Log → Slave SQL 重放。
- **基于位点**：传统方式，切换复杂，已被 GTID 取代。
- **GTID**：全局事务 ID，自动定位，切换简单，**生产推荐**。
- **半同步**：至少一个 Slave 确认才返回，平衡安全与性能。
- **延迟排查**：用心跳表准确测延迟，开 MTS 多线程复制提速。
- **主从切换**：用 MHA/Orchestrator 自动化，避免手动操作事故。

> 复制是高可用的基石，但单主从还不够"高可用"——下一章看读写分离与分库分表如何扩展系统能力。`
  },
  {
    id: "mysql-ch25",
    group: "第五部分 架构与高可用",
    icon: "⚖️",
    title: "第 25 章 读写分离与分库分表",
    content: `# 第 25 章 读写分离与分库分表

当单库扛不住业务量，读写分离与分库分表是必经之路。本章讲清楚什么时候要拆、怎么拆、用什么中间件、分布式 ID 怎么生成。

## 25.1 读写分离的实现

**核心思想**：写走 Master，读走 Slave，分流压力。

**实现方式**：

| 方式 | 实现 | 优劣 |
| --- | --- | --- |
| **应用层** | 代码配置多数据源，手动路由 | 灵活，但侵入业务 |
| **中间件** | ShardingSphere-Proxy / ProxySQL | 业务无感知，运维统一 |
| **驱动层** | ShardingSphere-JDBC | 性能好，但限语言 |

**ShardingSphere-JDBC 示例（Java 配置）**：

\`\`\`yaml
spring:
  shardingsphere:
    datasource:
      names: master,slave0
      master:
        type: HikariDataSource
        jdbc-url: jdbc:mysql://master:3306/db
      slave0:
        type: HikariDataSource
        jdbc-url: jdbc:mysql://slave0:3306/db
    rules:
      readwrite-splitting:
        data-sources:
          ds:
            write-data-source-name: master
            read-data-source-names: [slave0]
\`\`\`

**读写分离的坑**：主从延迟导致"写后读不到"。

应对：

1. 关键写后读强制走 Master。
2. 半同步复制降低延迟。
3. 业务上容忍短暂不一致。

## 25.2 分库分表的场景

**何时该分**：

- 单表数据量超过 **1000 万** 或 **50GB**，查询明显变慢。
- 单库 QPS / 写入超过单机上限。
- 业务模块需要物理隔离。

**不该分**：

- 先看索引、SQL 是否合理——80% 的"慢"是优化能解决的。
- 单表数据 < 500 万：先垂直优化字段。
- 没有运维能力支撑：分库分表运维成本翻倍。

> **分库分表是最后手段，不是第一选择**。

## 25.3 垂直拆分 vs 水平拆分

**垂直拆分**：按"列"或"业务模块"拆。

\`\`\`
单表 users (50 字段) → 拆为：
  users_basic (id, name, phone)   -- 高频
  users_profile (id, avatar, bio) -- 低频
\`\`\`

垂直分库：

\`\`\`
单库 all_in_one → 拆为：
  库 user_db: 用户相关表
  库 order_db: 订单相关表
  库 product_db: 商品相关表
\`\`\`

**水平拆分**：按"行"拆，把同表数据分散到多张表/多个库。

\`\`\`
单表 orders (1 亿行) → 拆为：
  orders_0 (id % 4 == 0)
  orders_1 (id % 4 == 1)
  orders_2 (id % 4 == 2)
  orders_3 (id % 4 == 3)
\`\`\`

| 对比 | 垂直拆分 | 水平拆分 |
| --- | --- | --- |
| 拆分维度 | 列/模块 | 行 |
| 难度 | 简单 | 复杂 |
| 解决问题 | 字段多、模块耦合 | 数据量大 |
| 跨库 JOIN | 受影响 | 受影响 |

## 25.4 分片键的选择

**分片键** 决定数据如何分布，是最重要的设计决策。

**选择原则**：

1. **高基数**：值足够多，分布均匀。
2. **查询带分片键**：避免广播查询。
3. **不会变更**：分片键值一旦定就别改。

**常见分片策略**：

| 策略 | 示例 | 适用 |
| --- | --- | --- |
| **取模** | user_id % 4 | 数据均匀 |
| **范围** | id 1-100w 在表 0 | 范围查询友好，但有热点 |
| **哈希** | hash(user_id) % 4 | 均匀，但范围查询难 |
| **一致性哈希** | 一致性哈希环 | 扩容时迁移少 |

\`\`\`sql
-- 范围分片示例
orders 表按 create_time 分：
  orders_2023_01  -- 2023 年 1 月数据
  orders_2023_02
  ...
\`\`\`

> 电商订单最常见分片键：**user_id**（绝大多数查询带用户 ID）。

## 25.5 常见中间件（ShardingSphere/Vitess）

| 中间件 | 类型 | 特点 |
| --- | --- | --- |
| **ShardingSphere-JDBC** | JDBC 驱动 | 性能好，Java 生态 |
| **ShardingSphere-Proxy** | Proxy | 多语言支持，运维友好 |
| **MyCat** | Proxy | 老牌，社区活跃度下降 |
| **Vitess** | Proxy | Google 出品，K8s 友好 |
| **TDDL/DRDS** | 阿里内部 | 商业版即 PolarDB-X |

**ShardingSphere 配置分片示例**（YAML）：

\`\`\`yaml
rules:
  sharding:
    tables:
      orders:
        actual-data-nodes: ds\${0..3}.orders_\${0..3}
        database-strategy:
          standard:
            sharding-column: user_id
            sharding-algorithm-name: db-mod
        table-strategy:
          standard:
            sharding-column: user_id
            sharding-algorithm-name: table-mod
    sharding-algorithms:
      db-mod:
        type: MOD
        props:
          sharding-count: 4
      table-mod:
        type: MOD
        props:
          sharding-count: 4
\`\`\`

## 25.6 分布式 ID 方案

分库分表后，单表自增 ID 失效，需要全局唯一 ID。

| 方案 | 原理 | 优劣 |
| --- | --- | --- |
| **UUID** | 随机字符串 | 简单，但无序、占空间 |
| **数据库自增** | 用独立表生成 ID | 简单，但有瓶颈 |
| **号段模式** | 一次取一段 ID 缓存 | 美团 Leaf，性能好 |
| **雪花算法** | 时间戳 + 机器 + 序列号 | 主流，64bit 有序 |
| **Redis INCR** | 原子自增 | 简单，但依赖 Redis |

**雪花算法 ID 结构（64 bit）**：

\`\`\`
| 1 bit 符号 | 41 bit 时间戳 | 10 bit 机器 | 12 bit 序列号 |
\`\`\`

\`\`\`sql
-- ShardingSphere 内置雪花算法
rules:
  key-generators:
    snowflake:
      type: SNOWFLAKE
      props:
        worker-id: 1
\`\`\`

> 推荐用雪花算法或美团 Leaf，既有全局唯一又有序，适合做主键。

## 25.7 本章小结

- **读写分离**：写 Master，读 Slave，靠 ShardingSphere/ProxySQL 实现。
- **分库分表**：单表 1000 万 / 50GB 起考虑，是最后手段。
- **垂直拆分**：按列/模块拆，简单。
- **水平拆分**：按行拆，解决数据量。
- **分片键**：高基数、查询必带、不变更。
- **中间件**：ShardingSphere 主流，Vitess 适合云原生。
- **分布式 ID**：雪花算法最常用，美团 Leaf 适合号段模式。

> 分库分表是"用复杂度换扩展性"，没有运维团队支撑别轻易上。`
  },
  {
    id: "mysql-ch26",
    group: "第五部分 架构与高可用",
    icon: "💾",
    title: "第 26 章 备份与恢复",
    content: `# 第 26 章 备份与恢复

"数据没了公司就没了"——备份是 DBA 的最后一道防线。本章讲透逻辑备份、物理备份、binlog 增量恢复、PITR 全套方案，并给出生产级备份策略。

## 26.1 mysqldump 逻辑备份

**mysqldump** 是 MySQL 自带的逻辑备份工具，把数据导出为 SQL 文本。

**基础用法**：

\`\`\`bash
# 备份单个库
mysqldump -uroot -p test > test.sql

# 备份多个库
mysqldump -uroot -p --databases test db1 db2 > multi.sql

# 备份所有库
mysqldump -uroot -p --all-databases > all.sql

# 仅备份结构
mysqldump -uroot -p --no-data test > schema.sql

# 仅备份数据
mysqldump -uroot -p --no-create-info test > data.sql
\`\`\`

**生产推荐参数**：

\`\`\`bash
mysqldump -uroot -p \\\\
  --single-transaction \\\\      # InnoDB 一致性备份，不锁表
  --master-data=2 \\\\            # 记录 binlog 位点（注释形式）
  --routines \\\\                 # 备份存储过程/函数
  --triggers \\\\                 # 备份触发器
  --events \\\\                   # 备份事件
  --set-gtid-purged=ON \\\\       # GTID 环境
  --default-character-set=utf8mb4 \\\\
  test > test_$(date +%F).sql
\`\`\`

**关键参数解读**：

| 参数 | 作用 |
| --- | --- |
| \`--single-transaction\` | InnoDB 用 RR 隔离级别开启事务，不锁表 |
| \`--master-data=2\` | 注释里记录 binlog 位点，用于建立从库 |
| \`--master-data=1\` | 不注释，恢复时直接 CHANGE MASTER |
| \`--quick\` | 不缓存全表，一行行读（默认开启） |

**恢复**：

\`\`\`bash
mysql -uroot -p test < test.sql
\`\`\`

## 26.2 mysqlpump 并行备份

**mysqlpump** 是 MySQL 5.7+ 的并行版 mysqldump，多线程备份更快。

\`\`\`bash
mysqlpump -uroot -p \\\\
  --default-parallelism=4 \\\\    -- 4 个线程
  --parallel-schemas=test:4 \\\\  -- 指定库用 4 线程
  --single-transaction \\\\
  test > test.sql
\`\`\`

> mysqlpump 在 8.0 已**不推荐**使用，官方建议用 \`mysqldump\` 或物理备份。

## 26.3 物理备份（Percona XtraBackup）

**物理备份** 直接拷贝数据文件，速度快，适合大库。

**Percona XtraBackup** 是开源物理备份工具，支持 InnoDB 热备。

**全量备份**：

\`\`\`bash
xtrabackup --backup \\\\
  --user=root --password=xxx \\\\
  --target-dir=/backup/full_$(date +%F)
\`\`\`

**prepare（应用日志使备份一致）**：

\`\`\`bash
xtrabackup --prepare \\\\
  --target-dir=/backup/full_2024-01-01
\`\`\`

**恢复**：

\`\`\`bash
# 停 MySQL
systemctl stop mysqld

# 清空数据目录
rm -rf /var/lib/mysql/*

# 拷贝备份
xtrabackup --copy-back --target-dir=/backup/full_2024-01-01

# 修复权限
chown -R mysql:mysql /var/lib/mysql

# 启动
systemctl start mysqld
\`\`\`

**增量备份**：

\`\`\`bash
# 基于全量做增量
xtrabackup --backup \\\\
  --target-dir=/backup/inc_$(date +%F) \\\\
  --incremental-basedir=/backup/full_2024-01-01
\`\`\`

| 备份方式 | 速度 | 体积 | 恢复速度 | 适用 |
| --- | --- | --- | --- | --- |
| mysqldump | 慢 | 小（文本） | 慢 | 小库 < 50GB |
| XtraBackup | 快 | 大（二进制） | 快 | 大库 > 100GB |

## 26.4 binlog 增量恢复（mysqlbinlog）

**mysqlbinlog** 工具可解析 binlog 并重放，是数据误删恢复的关键。

**查看 binlog 内容**：

\`\`\`bash
mysqlbinlog --base64-output=decode-rows -v mysql-bin.000005
\`\`\`

**按时间段导出**：

\`\`\`bash
mysqlbinlog \\\\
  --start-datetime="2024-01-01 10:00:00" \\\\
  --stop-datetime="2024-01-01 11:00:00" \\\\
  mysql-bin.000005 mysql-bin.000006 > recovery.sql
\`\`\`

**按位点导出**：

\`\`\`bash
mysqlbinlog \\\\
  --start-position=1234 \\\\
  --stop-position=5678 \\\\
  mysql-bin.000005 > recovery.sql
\`\`\`

**重放**：

\`\`\`bash
mysql -uroot -p < recovery.sql
\`\`\`

**按 GTID 导出**：

\`\`\`bash
mysqlbinlog --skip-gtids=true \\\\
  --include-gtids='3E11FA47-71CA-11E1-9E33-C80AA9429562:1-100' \\\\
  mysql-bin.000005 > recovery.sql
\`\`\`

## 26.5 时间点恢复（PITR）

**PITR（Point In Time Recovery）** = 全量备份 + binlog 重放，恢复到任意时间点。

**典型场景**：上午 10 点有人误删了 orders 表，要恢复到 9:59 的状态。

**操作步骤**：

\`\`\`bash
# 1. 恢复昨晚的全量备份
mysql -uroot -p < full_backup_20240101.sql

# 2. 找全量备份结束的 binlog 位点
grep "CHANGE MASTER" full_backup_20240101.sql
# CHANGE MASTER TO MASTER_LOG_FILE='mysql-bin.000010', MASTER_LOG_POS=9876

# 3. 重放 binlog 到误操作前
mysqlbinlog \\\\
  --start-position=9876 \\\\
  --stop-datetime="2024-01-02 09:59:00" \\\\
  mysql-bin.000010 mysql-bin.000011 | mysql -uroot -p
\`\`\`

> **关键**：发现误操作后**立即停库**或禁写，防止 binlog 被覆盖。

## 26.6 备份策略

**生产推荐策略**：

1. **每日全量**：XtraBackup 全量备份（大库）或 mysqldump（小库）。
2. **增量备份**：每小时 XtraBackup 增量，或 binlog 持续归档。
3. **异地备份**：备份文件同步到对象存储（OSS/S3）。
4. **定期演练**：每月做一次恢复演练，验证备份可用。
5. **保留周期**：本地 7 天，异地 30 天 / 90 天。

**备份脚本示例**（crontab）：

\`\`\`bash
# 每日凌晨 2 点全量备份
0 2 * * * /opt/scripts/backup_full.sh >> /var/log/backup.log 2>&1

# 每小时增量
0 * * * * /opt/scripts/backup_inc.sh >> /var/log/backup.log 2>&1
\`\`\`

**备份文件命名规范**：

\`\`\`
/backup/
  full_2024-01-01/
  inc_2024-01-02_00/
  inc_2024-01-02_01/
\`\`\`

> **没有验证过的备份等于没有备份**——定期演练是底线。

## 26.7 本章小结

- **mysqldump**：逻辑备份，小库 < 50GB 适用，记得加 \`--single-transaction\`。
- **XtraBackup**：物理热备，大库首选，支持增量。
- **mysqlbinlog**：解析/重放 binlog，误删恢复的关键。
- **PITR**：全量 + binlog 重放，恢复到任意时间点。
- **生产策略**：每日全量 + 每小时增量 + 异地归档 + 定期演练。
- **铁律**：未演练的备份不可信。

> 备份是为了"那一刻"——下次出事时能不能快速恢复，全看今天的备份做没做对。`
  },
  {
    id: "mysql-ch27",
    group: "第五部分 架构与高可用",
    icon: "👤",
    title: "第 27 章 用户与权限管理",
    content: `# 第 27 章 用户与权限管理

权限管理是数据库安全的门面。一个粗放的 GRANT 就可能让开发同学误删生产库。本章系统讲用户、权限、角色、密码策略、连接限制，让你把数据库的"门"关好。

## 27.1 用户管理（CREATE USER）

MySQL 用户由 **用户名 + 主机** 唯一标识，例如 \`root@localhost\` 与 \`root@%\` 是两个不同用户。

**创建用户**：

\`\`\`sql
-- 基础创建
CREATE USER 'appuser'@'%' IDENTIFIED BY 'App@12345';

-- 指定主机范围
CREATE USER 'admin'@'192.168.1.%' IDENTIFIED BY 'Admin@12345';
CREATE USER 'readonly'@'10.0.0.0/255.255.255.0' IDENTIFIED BY 'Read@12345';

-- 8.0 推荐：用 caching_sha2_password
CREATE USER 'newuser'@'%' 
IDENTIFIED WITH caching_sha2_password BY 'Pass@123'
DEFAULT ROLE NONE
PASSWORD EXPIRE INTERVAL 90 DAY  -- 90 天过期
ACCOUNT UNLOCK;
\`\`\`

**查看用户**：

\`\`\`sql
SELECT user, host, plugin, account_locked 
FROM mysql.user;
\`\`\`

**修改用户**：

\`\`\`sql
ALTER USER 'appuser'@'%' IDENTIFIED BY 'NewPass@123';
ALTER USER 'appuser'@'%' ACCOUNT LOCK;    -- 锁定
ALTER USER 'appuser'@'%' ACCOUNT UNLOCK;  -- 解锁
\`\`\`

**删除用户**：

\`\`\`sql
DROP USER 'appuser'@'%';
\`\`\`

**改密码**：

\`\`\`sql
-- 自己改自己
ALTER USER USER() IDENTIFIED BY 'NewPass@123';

-- 管理员改别人
ALTER USER 'appuser'@'%' IDENTIFIED BY 'NewPass@123';
\`\`\`

> **主机限制**：生产严格限制来源 IP，禁止 \`%\`（任意主机）！

## 27.2 权限系统（GRANT/REVOKE）

**MySQL 权限分两类**：

1. **全局权限**（\`*.*\`）：影响所有库。
2. **库级权限**（\`db.*\`）：影响单个库。
3. **表级权限**（\`db.table\`）：影响单张表。
4. **列级权限**：影响某些列。

**常用权限**：

| 权限 | 含义 |
| --- | --- |
| **ALL / ALL PRIVILEGES** | 所有权限（慎用） |
| **SELECT / INSERT / UPDATE / DELETE** | DML |
| **CREATE / ALTER / DROP / INDEX** | DDL |
| **REFERENCES** | 外键 |
| **RELOAD / PROCESS / REPLICATION CLIENT** | 运维 |
| **REPLICATION SLAVE** | 复制账号必备 |
| **SUPER** | 高危运维（8.0 拆为多个） |
| **SHOW DATABASES** | 看库列表 |
| **USAGE** | 仅能登录，无任何权限 |

**GRANT 授权**：

\`\`\`sql
-- 给 appuser 对 test 库的全部权限
GRANT ALL PRIVILEGES ON test.* TO 'appuser'@'%';

-- 只读账号
GRANT SELECT ON test.* TO 'readonly'@'%';

-- 限制到表
GRANT SELECT, INSERT ON test.orders TO 'appuser'@'%';

-- 限制到列
GRANT SELECT (id, name) ON test.users TO 'appuser'@'%';

-- 复制账号
GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'repl'@'%';

-- 授权同时可授权给别人（WITH GRANT OPTION）
GRANT SELECT ON test.* TO 'appuser'@'%' WITH GRANT OPTION;
\`\`\`

**REVOKE 回收**：

\`\`\`sql
REVOKE INSERT, UPDATE ON test.* FROM 'appuser'@'%';
REVOKE ALL PRIVILEGES ON test.* FROM 'appuser'@'%';
\`\`\`

**查看权限**：

\`\`\`sql
SHOW GRANTS FOR 'appuser'@'%';
SHOW GRANTS;  -- 查看当前用户权限
\`\`\`

**刷新权限**（8.0 自动生效，但仍可手动）：

\`\`\`sql
FLUSH PRIVILEGES;
\`\`\`

> **生产原则**：最小权限原则。每个应用一个账号，只给必要的库与权限，绝不 \`GRANT ALL ON *.*\`。

## 27.3 角色管理（MySQL 8.0+）

8.0 引入**角色**，可批量管理一组权限，授权更简洁。

**创建角色**：

\`\`\`sql
-- 创建只读角色
CREATE ROLE 'role_readonly';
GRANT SELECT ON test.* TO 'role_readonly';

-- 创建读写角色
CREATE ROLE 'role_app';
GRANT SELECT, INSERT, UPDATE, DELETE ON test.* TO 'role_app';
\`\`\`

**给用户授予角色**：

\`\`\`sql
GRANT 'role_readonly' TO 'analyst1'@'%';
GRANT 'role_app' TO 'appuser'@'%';
\`\`\`

**激活角色**（默认登录后角色未生效）：

\`\`\`sql
-- 用户登录后激活
SET DEFAULT ROLE ALL TO 'appuser'@'%';

-- 或全局开启自动激活
SET GLOBAL activate_all_roles_on_login = ON;
\`\`\`

**查看角色权限**：

\`\`\`sql
SHOW GRANTS FOR 'appuser'@'%';
SHOW GRANTS FOR 'appuser'@'%' USING 'role_app';
\`\`\`

**回收角色**：

\`\`\`sql
REVOKE 'role_app' FROM 'appuser'@'%';
\`\`\`

> 角色适合"一类岗位一个角色"，人员变动只改账号的角色绑定，不改权限。

## 27.4 密码策略

8.0 内置密码策略插件 \`validate_password\`（8.0.4 前为 \`validate_password\`，之后为 \`validate_password.component\`）。

**安装**：

\`\`\`sql
-- 8.0
INSTALL COMPONENT 'file://component_validate_password';
\`\`\`

**查看策略**：

\`\`\`sql
SHOW VARIABLES LIKE 'validate_password.%';
\`\`\`

| 参数 | 含义 | 推荐 |
| --- | --- | --- |
| \`validate_password.policy\` | 策略等级 | MEDIUM |
| \`validate_password.length\` | 最小长度 | 12 |
| \`validate_password.mixed_case_count\` | 大小写字母数 | 1 |
| \`validate_password.number_count\` | 数字数 | 1 |
| \`validate_password.special_char_count\` | 特殊字符数 | 1 |

**设置策略**：

\`\`\`sql
SET GLOBAL validate_password.policy = 'MEDIUM';
SET GLOBAL validate_password.length = 12;
\`\`\`

**密码过期**：

\`\`\`sql
-- 全局默认 90 天过期
SET GLOBAL default_password_lifetime = 90;

-- 单用户
ALTER USER 'appuser'@'%' PASSWORD EXPIRE INTERVAL 90 DAY;
ALTER USER 'appuser'@'%' PASSWORD EXPIRE NEVER;     -- 永不过期
ALTER USER 'appuser'@'%' PASSWORD EXPIRE;            -- 立即过期
\`\`\`

**密码历史**（防止改回旧密码）：

\`\`\`sql
ALTER USER 'appuser'@'%' 
PASSWORD HISTORY 5        -- 记住最近 5 个密码
PASSWORD REUSE INTERVAL 365 DAY;  -- 365 天内不能复用
\`\`\`

## 27.5 连接限制

**限制单用户连接数**，防止单应用耗尽连接：

\`\`\`sql
ALTER USER 'appuser'@'%' 
WITH MAX_QUERIES_PER_HOUR 1000      -- 每小时最多 1000 次查询
     MAX_UPDATES_PER_HOUR 100       -- 每小时最多 100 次更新
     MAX_CONNECTIONS_PER_HOUR 50    -- 每小时最多 50 次连接
     MAX_USER_CONNECTIONS 10;       -- 同时最多 10 个连接
\`\`\`

**查看连接**：

\`\`\`sql
SHOW PROCESSLIST;
SELECT user, host, COUNT(*) AS conn_cnt 
FROM information_schema.processlist 
GROUP BY user, host;
\`\`\`

**全局连接数**：

\`\`\`sql
SHOW VARIABLES LIKE 'max_connections';
SHOW STATUS LIKE 'Threads_connected';
\`\`\`

## 27.6 本章小结

- **用户标识**：\`user@host\` 双维度，生产严格限制 host。
- **GRANT/REVOKE**：最小权限原则，避免 \`ALL ON *.*\`。
- **复制账号**：需要 \`REPLICATION SLAVE\` 权限。
- **角色**（8.0+）：批量管理权限，岗位变动只改角色绑定。
- **密码策略**：\`validate_password\` 组件 + 90 天过期 + 密码历史。
- **连接限制**：\`MAX_USER_CONNECTIONS\` 防止单用户耗尽连接。

> 数据库安全的本质是"最小权限 + 强密码 + 严限制"，缺一不可。`
  }
];

export { chapters };
