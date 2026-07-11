// =============================================================
// 《PostgreSQL 实战教程》- 章节批次 5
// -------------------------------------------------------------
// 内容：第五部分 架构与高可用（第 25-30 章）
// =============================================================

const chapters = [
  {
    id: "pg-ch25",
    group: "第五部分 架构与高可用",
    icon: "🏗️",
    title: "第 25 章 PostgreSQL 架构原理",
    content: `# 第 25 章 PostgreSQL 架构原理

PostgreSQL 是一个"进程模型"数据库，与 MySQL 的线程模型截然不同。理解它的进程结构、内存布局、WAL 机制、集群与数据库的关系，是后续学习复制、备份、调优的基础。本章从底层架构讲起，带你建立完整的 PostgreSQL 心智模型。

## 25.1 集群、数据库、表的关系

PostgreSQL 的层次结构与 MySQL 不同：

| 概念 | MySQL 对应 | 说明 |
| --- | --- | --- |
| **Cluster（集群）** | 一个 mysqld 实例 | 一个数据目录 \`PGDATA\`，由 \`initdb\` 创建 |
| **Database（数据库）** | Schema/Database | 一个 Cluster 下可建多个 Database，互相隔离 |
| **Schema（模式）** | 无直接对应 | Database 内的命名空间，默认 \`public\` |
| **Table（表）** | Table | 属于某个 Schema |

> **关键差异**：PostgreSQL 的一个实例下，多个 Database 共享同一份系统目录、WAL、后台进程，但 Database 之间**无法直接 JOIN**，需用 \`postgres_fdw\` 跨库。

**查看当前集群信息**：

\`\`\`sql
-- 查看当前数据库
SELECT current_database();

-- 查看当前用户
SELECT current_user, session_user;

-- 查看所有数据库
\\l

-- 查看 schema 列表
\\dn

-- 查看表空间
\\db

-- 查看集群版本
SHOW server_version;
\`\`\`

**集群的物理结构**（\`PGDATA\` 目录）：

\`\`\`bash
$ ls $PGDATA
base/           # 各数据库的默认数据文件
global/         # 集群级系统表（pg_database 等）
pg_wal/         # WAL 日志文件
pg_stat/        # 统计数据
pg_xact/        # 事务提交状态
pg_commit_ts/   # 事务提交时间戳
pg_logical/     # 逻辑复制状态
pg_replslot/    # 复制槽
pg_dynshmem/    # 动态共享内存
pg_notify/      # LISTEN/NOTIFY
pg_serial/      # 已提交的可串行化事务
pg_tblspc/      # 表空间软链接
postgresql.conf # 主配置文件
pg_hba.conf     # 客户端认证配置
postgresql.auto.conf  # ALTER SYSTEM 写入的配置
postmaster.pid  # 主进程 PID 文件
\`\`\`

> 注意：\`$PGDATA\` 中的 \`base/\` 按 OID 组织子目录，每个数据库一个目录，目录名就是数据库的 OID。

## 25.2 进程模型（Fork 模型）

PostgreSQL 采用**多进程架构**：每个客户端连接对应一个独立的后端进程（backend process），由 \`postmaster\` 通过 \`fork()\` 创建。

**核心进程一览**：

| 进程 | 作用 |
| --- | --- |
| **postmaster** | 主进程，监听端口，fork 出后端进程 |
| **background writer** | 把共享缓冲区中的脏页刷回磁盘 |
| **checkpointer** | 执行 checkpoint，记录 WAL 插入点 |
| **WAL writer** | 把 WAL buffer 刷到 WAL 文件 |
| **autovacuum launcher** | 自动清理回收死元组 |
| **autovacuum worker** | 实际执行 vacuum 的子进程 |
| **stats collector**（PG 14 前）/ stats accumulator | 收集统计信息 |
| **logical replication launcher** | 逻辑复制工作进程启动器 |
| **walreceiver / walsender** | 流复制接收/发送进程 |
| **archiver** | 归档 WAL 文件 |
| **backend** | 每个客户端连接一个 |

**查看进程**：

\`\`\`bash
# Linux 下查看 postgres 相关进程
ps -ef | grep postgres | grep -v grep

# 典型输出：
# postgres  1234  1  0 10:00 ?  00:00:00 /usr/pgsql-15/bin/postgres -D /var/lib/pgsql/15/data
# postgres  1245 1234  0 10:00 ?  00:00:00 postgres: logger
# postgres  1246 1234  0 10:00 ?  00:00:00 postgres: checkpointer
# postgres  1247 1234  0 10:00 ?  00:00:00 postgres: background writer
# postgres  1248 1234  0 10:00 ?  00:00:00 postgres: walwriter
# postgres  1249 1234  0 10:00 ?  00:00:00 postgres: autovacuum launcher
# postgres  1250 1234  0 10:00 ?  00:00:00 postgres: stats collector
# postgres  1251 1234  0 10:00 ?  00:00:00 postgres: logical replication launcher
# postgres  1300 1234  0 10:01 ?  00:00:00 postgres: app_user app 192.168.1.10(54321) idle
\`\`\`

> **Fork 模型特点**：进程隔离强，一个 backend 崩溃不会拖垮整个实例（postmaster 会重启所有连接）；但进程创建比线程贵，连接数不宜过大（一般 < 500），这也是需要 PgBouncer 连接池的根本原因。

**连接建立流程**：

\`\`\`
1. 客户端 TCP 连接到 5432 端口
2. postmaster accept 连接
3. postmaster fork 出 backend 子进程
4. backend 进程进行身份认证（pg_hba.conf）
5. backend 处理 SQL，独享 work_mem 等私有内存
6. 客户端断开后 backend 进程退出
\`\`\`

## 25.3 内存结构

PostgreSQL 内存分**共享内存**（所有进程共享）和**私有内存**（每个 backend 独有）。

**共享内存**：

| 区域 | 参数 | 作用 |
| --- | --- | --- |
| **shared_buffers** | \`shared_buffers\` | 缓存数据页，默认 128MB |
| **WAL buffer** | \`wal_buffers\` | WAL 日志缓冲，默认 -1（自动） |
| **CommitLog**（CLOG） | - | 事务提交状态 |
| **其它共享结构** | - | 锁、统计等 |

**私有内存**（每个 backend）：

| 区域 | 参数 | 作用 |
| --- | --- | --- |
| **work_mem** | \`work_mem\` | 排序、哈希的内存，默认 4MB |
| **maintenance_work_mem** | \`maintenance_work_mem\` | VACUUM、CREATE INDEX，默认 64MB |
| **temp_buffers** | \`temp_buffers\` | 临时表，默认 8MB |

**查看与调整**：

\`\`\`sql
-- 查看关键内存参数
SHOW shared_buffers;
SHOW work_mem;
SHOW maintenance_work_mem;
SHOW wal_buffers;
SHOW effective_cache_size;

-- 查看当前会话的 work_mem
SHOW work_mem;

-- 在会话内临时调大（用于大查询）
SET work_mem = '256MB';
-- 排序查询...
RESET work_mem;
\`\`\`

**生产推荐**：

\`\`\`ini
# postgresql.conf
shared_buffers = 4GB              # 物理内存的 25%
effective_cache_size = 12GB       # 物理内存的 75%
work_mem = 16MB                   # 每连接每操作
maintenance_work_mem = 512MB      # VACUUM/INDEX
wal_buffers = 16MB
\`\`\`

> **坑**：\`work_mem\` 是"每个排序/哈希操作"的内存，不是每连接。一个复杂查询可能并行有多个排序，\`work_mem × 并发连接数 × 操作数\` 才是真实占用，设太大易 OOM。

## 25.4 WAL（预写式日志）

WAL（Write-Ahead Logging）是 PostgreSQL 持久性与复制的基石。**先写日志，再改数据**，崩溃后重放 WAL 即可恢复。

**WAL 关键概念**：

| 概念 | 说明 |
| --- | --- |
| **WAL record** | 一条日志记录，对应一次页修改 |
| **LSN**（Log Sequence Number） | 日志位置编号，单调递增 |
| **WAL segment** | WAL 文件，默认 16MB |
| **checkpoint** | 把所有脏页刷盘，记录 WAL 切换点 |
| **redo point** | checkpoint 对应的 LSN，恢复从这里开始 |

**WAL 文件命名**：

\`\`\`bash
# 文件名 = 时间线 + 日志段号
$ ls $PGDATA/pg_wal/
000000010000000000000001
000000010000000000000002
# 24 位十六进制：8 位时间线 + 8 位高位 + 8 位低位
\`\`\`

**WAL 相关参数**：

\`\`\`ini
# postgresql.conf
wal_level = replica           # minimal / replica / logical
wal_buffers = 16MB
wal_writer_delay = 200ms
max_wal_size = 1GB            # checkpoint 之间最大 WAL 量
min_wal_size = 80MB
checkpoint_timeout = 5min
checkpoint_completion_target = 0.9
archive_mode = on             # 是否归档
archive_command = 'cp %p /backup/wal/%f'
\`\`\`

**手动触发 checkpoint**：

\`\`\`sql
CHECKPOINT;

-- 查看 checkpoint 信息
SELECT * FROM pg_control_checkpoint();
\`\`\`

**查看 WAL 生成速率**：

\`\`\`sql
SELECT pg_walfile_name(pg_current_wal_lsn()) AS current_wal;

-- 计算两次 LSN 差
SELECT pg_current_wal_lsn();
-- 稍等
SELECT pg_current_wal_lsn();
-- 用 pg_wal_lsn_diff 计算字节差
SELECT pg_wal_lsn_diff('0/17000128', '0/16000000');
\`\`\`

> **WAL 的三个 level**：\`minimal\`（仅崩溃恢复）、\`replica\`（含物理复制所需信息，默认）、\`logical\`（在 replica 基础上加逻辑解码所需信息）。要启用逻辑复制必须设为 \`logical\`。

## 25.5 后台进程详解

### background writer 与 checkpointer

PG 12 起，background writer 和 checkpointer 分离：

- **checkpointer**：执行 checkpoint 时，把所有脏页刷盘，记录 redo point。
- **background writer**：在非 checkpoint 期间，少量刷脏页，减轻 checkpoint 压力。

\`\`\`ini
# background writer 调优
bgwriter_lru_maxpages = 100      # 一次最多刷多少页
bgwriter_delay = 200ms
bgwriter_lru_multiplier = 2.0
\`\`\`

### autovacuum

PostgreSQL 的 MVCC 会产生"死元组"（dead tuples），需要 \`VACUUM\` 回收空间。autovacuum 自动做这件事。

\`\`\`ini
# autovacuum 配置
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 1min
autovacuum_vacuum_threshold = 50
autovacuum_vacuum_scale_factor = 0.2
autovacuum_analyze_scale_factor = 0.1
\`\`\`

**查看 autovacuum 状态**：

\`\`\`sql
-- 查看哪些表正在被 autovacuum
SELECT pid, datname, relid::regclass, phase 
FROM pg_stat_progress_vacuum;

-- 查看表的死元组情况
SELECT relname, n_live_tup, n_dead_tup, 
       last_autovacuum, last_autoanalyze
FROM pg_stat_user_tables 
ORDER BY n_dead_tup DESC LIMIT 10;
\`\`\`

> **常见坑**：长事务会阻塞 vacuum（因为它需要的事务快照不能被清理）。若 \`n_dead_tup\` 持续增长，先查 \`pg_stat_activity\` 是否有长事务。

### WAL writer 与 archiver

- **WAL writer**：定期把 WAL buffer 刷到 WAL 文件，保证提交的事务落盘。
- **archiver**：\`archive_mode=on\` 时，把已切换的 WAL 段拷贝到归档目录，用于 PITR。

\`\`\`bash
# 查看归档状态
ps -ef | grep archiver

# 强制切换 WAL 段
pg_switch_wal()
\`\`\`

\`\`\`sql
SELECT pg_switch_wal();
\`\`\`

## 25.6 表空间（Tablespace）

表空间是物理存储位置的抽象，可以把"热数据"放 SSD，"冷数据"放 HDD。

**创建表空间**：

\`\`\`sql
-- 1. 先在操作系统建目录（必须 postgres 用户可写）
-- mkdir /data/ssd_pg && chown postgres:postgres /data/ssd_pg

-- 2. 在 SQL 中创建表空间
CREATE TABLESPACE ssd_space LOCATION '/data/ssd_pg';

-- 3. 创建表时指定表空间
CREATE TABLE hot_data (
  id BIGSERIAL PRIMARY KEY,
  info TEXT
) TABLESPACE ssd_space;

-- 4. 移动已有表到新表空间
ALTER TABLE big_table SET TABLESPACE ssd_space;

-- 5. 移动索引
ALTER INDEX idx_users_email SET TABLESPACE ssd_space;

-- 6. 设置默认表空间
SET default_tablespace = ssd_space;
\`\`\`

**查看表空间**：

\`\`\`sql
\\db
-- 或
SELECT spcname, pg_tablespace_location(oid) AS location 
FROM pg_tablespace;
\`\`\`

> 表空间在 \`PGDATA/pg_tblspc/\` 下以软链接形式存在，链接到实际目录。删除表空间前必须先移走其中的所有对象。

## 25.7 OID 与系统目录

PostgreSQL 内部用 **OID**（Object Identifier）标识几乎所有对象：数据库、表、类型、函数、操作符等。

**查看对象的 OID**：

\`\`\`sql
-- 查看数据库的 OID
SELECT oid, datname FROM pg_database;

-- 查看表的 OID
SELECT oid, relname, relkind FROM pg_class WHERE relname = 'users';

-- 查看当前数据库的 OID（也是 base/ 下的目录名）
SELECT oid FROM pg_database WHERE datname = current_database();

-- 用 oid 找到表对应的物理文件
SELECT pg_relation_filepath('users');
-- 输出：base/16384/16385
\`\`\`

**核心系统目录**：

| 目录 | 内容 |
| --- | --- |
| \`pg_class\` | 所有表、索引、视图、序列 |
| \`pg_database\` | 所有数据库 |
| \`pg_namespace\` | 所有 schema |
| \`pg_type\` | 所有数据类型 |
| \`pg_proc\` | 所有函数 |
| \`pg_index\` | 索引信息 |
| \`pg_authid\` | 角色信息 |
| \`pg_database\` | 数据库列表 |
| \`pg_tablespace\` | 表空间 |
| \`pg_attribute\` | 列定义 |
| \`pg_constraint\` | 约束 |

**示例：用系统目录查表结构**：

\`\`\`sql
SELECT a.attname AS column_name,
       format_type(a.atttypid, a.atttypmod) AS data_type,
       a.attnotnull AS not_null,
       pg_get_expr(d.adbin, d.adrelid) AS default_value
FROM pg_attribute a
LEFT JOIN pg_attrdef d ON a.attrelid = d.adrelid AND a.attnum = d.adnum
WHERE a.attrelid = 'users'::regclass
  AND a.attnum > 0
  AND NOT a.attisdropped
ORDER BY a.attnum;
\`\`\`

> PostgreSQL 的"数据字典"就是普通表，用 SQL 查询即可。\`information_schema\` 也提供标准化的视图，但 \`pg_catalog\` 的信息更完整。

## 25.8 连接处理与认证

客户端连接经过 \`pg_hba.conf\` 认证：

\`\`\`ini
# pg_hba.conf 示例
# TYPE  DATABASE  USER  ADDRESS        METHOD
local   all       all                  trust
host    all       all   127.0.0.1/32   scram-sha-256
host    all       all   ::1/128        scram-sha-256
host    all       all   10.0.0.0/8     scram-sha-256
hostssl all       all   0.0.0.0/0      scram-sha-256
# 仅允许从 10.0 网段连接
\`\`\`

**认证方法对比**：

| METHOD | 说明 |
| --- | --- |
| \`trust\` | 不认证，谁都能进（危险） |
| \`reject\` | 拒绝 |
| \`password\` | 明文密码 |
| \`md5\` | MD5 加密（PG 14 起不推荐） |
| \`scram-sha-256\` | SCRAM 认证，PG 10+ 默认推荐 |
| \`peer\` | 用 OS 用户名映射（仅 local） |
| \`cert\` | 客户端证书 |

**修改密码为 SCRAM**：

\`\`\`sql
-- 查看密码加密方式
SHOW password_encryption;

-- 设置为 scram
SET password_encryption = 'scram-sha-256';

-- 重新设置密码（会按当前加密方式存储）
ALTER USER app_user PASSWORD 'StrongPass123!';

-- 查看用户密码哈希前缀
SELECT rolname, substr(rolpassword, 1, 4) AS prefix 
FROM pg_authid WHERE rolname='app_user';
-- SCRAM-SHA-256 开头
\`\`\`

**重新加载配置**：

\`\`\`bash
# 不重启重新加载 pg_hba.conf / postgresql.conf
pg_ctl reload -D $PGDATA
# 或
SELECT pg_reload_conf();
\`\`\`

## 25.9 多版本并发控制（MVCC）回顾

PostgreSQL 的 MVCC 基于"多版本"：每次 UPDATE 实际是 INSERT 新版本 + 标记旧版本为 dead。

| 隔离级别 | 作用 |
| --- | --- |
| \`READ COMMITTED\`（默认） | 每条语句看到提交后的最新快照 |
| \`REPEATABLE READ\` | 事务开始后快照固定，不会看到新提交 |
| \`SERIALIZABLE\` | 真正的可串行化，SSI 算法 |

**查看与设置隔离级别**：

\`\`\`sql
-- 查看默认隔离级别
SHOW default_transaction_isolation;

-- 当前会话设置隔离级别
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- 整个会话
SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL SERIALIZABLE;
\`\`\`

> MVCC 的代价：UPDATE/DELETE 产生死元组，需要 \`VACUUM\` 回收，否则表膨胀。这就是 autovacuum 必须开启的原因。

## 25.10 本章小结

- **进程模型**：postmaster fork 出每个连接的 backend，进程隔离强但连接贵，故需连接池。
- **共享内存**：\`shared_buffers\`（数据页）、WAL buffer、CLOG。
- **私有内存**：\`work_mem\`（排序/哈希）、\`maintenance_work_mem\`（VACUUM/INDEX）。
- **WAL**：先写日志再改数据，支撑崩溃恢复与复制；\`wal_level\` 分 minimal/replica/logical。
- **后台进程**：background writer、checkpointer、autovacuum、WAL writer、archiver 各司其职。
- **表空间**：物理存储抽象，可分层放置冷热数据。
- **OID**：内部对象标识，系统目录 \`pg_catalog\` 是数据字典。
- **认证**：\`pg_hba.conf\` 控制谁能连，推荐 \`scram-sha-256\`。
- **MVCC**：多版本并发，代价是死元组需 autovacuum 回收。

> 架构是地基，理解了进程与 WAL，下一章的"物理流复制"就是水到渠成：standby 不断接收 primary 的 WAL 并重放。`
  },
  {
    id: "pg-ch26",
    group: "第五部分 架构与高可用",
    icon: "🔄",
    title: "第 26 章 物理复制与流复制",
    content: `# 第 26 章 物理复制与流复制

PostgreSQL 的物理复制基于 WAL 传输：primary 把 WAL 流式推给 standby，standby 重放 WAL 保持数据一致。这是 PG 高可用、读扩展、灾难恢复的核心机制。本章从原理到搭建，覆盖流复制的完整流程。

## 26.1 物理复制原理

**流复制（Streaming Replication）** 工作流程：

\`\`\`
Primary                          Standby
  │                                │
  │  事务提交 → 写 WAL              │
  │                                │
  │  walsender ────────► walreceiver (TCP 5432)
  │       WAL 流                    │
  │                       写入 pg_wal/
  │                                │
  │                       startup 进程重放 WAL
  │                                │
  │                       数据更新可见（hot_standby=on）
\`\`\`

**关键特点**：

| 特性 | 说明 |
| --- | --- |
| **物理级别** | 复制 WAL 字节流，standby 是 primary 的完整副本 |
| **块级一致** | 即使 primary 崩溃，standby 数据也是一致的 |
| **单向** | primary 写，standby 只读 |
| **支持级联** | standby 可以再作为 primary 给下游 standby |
| **支持同步** | 可配置同步复制，保证 0 数据丢失 |

**同步 vs 异步**：

| 模式 | \`synchronous_commit\` / \`synchronous_standby_names\` | 数据丢失风险 |
| --- | --- | --- |
| **异步** | 不配置 sync standby | failover 可能丢少量已提交事务 |
| **同步 ON** | \`synchronous_standby_names='FIRST 1 (standby1)'\` | 0 丢失，但 standby 挂会阻塞 primary |
| **本地提交** | \`synchronous_commit=local\` | 仅本地落盘 |

## 26.2 准备 Primary 节点

### 26.2.1 配置 postgresql.conf

\`\`\`ini
# postgresql.conf（primary）
listen_addresses = '*'
wal_level = replica                  # 至少 replica，logical 也支持物理复制
max_wal_senders = 10                 # walsender 进程上限
max_replication_slots = 10           # 复制槽数量
wal_keep_size = 1024                 # 保留 1GB WAL 供 standby追赶（旧名 wal_keep_segments）
hot_standby = on                     # primary 上无影响，但备用机统一配置方便

# 同步复制（可选）
synchronous_standby_names = 'FIRST 1 (standby1)'
synchronous_commit = on

# 归档（推荐开启，用于备份）
archive_mode = on
archive_command = 'test ! -f /backup/wal/%f && cp %p /backup/wal/%f'
\`\`\`

### 26.2.2 配置 pg_hba.conf

允许 standby 用复制账号连接：

\`\`\`ini
# pg_hba.conf（primary）
# TYPE  DATABASE     USER          ADDRESS           METHOD
host    replication  replicator    10.0.0.0/8        scram-sha-256
host    replication  replicator    192.168.1.0/24    scram-sha-256
\`\`\`

> 注意 \`DATABASE\` 列写 \`replication\` 是关键字，专用于流复制连接，不是普通数据库。

### 26.2.3 创建复制账号

\`\`\`sql
-- 创建专用复制账号（REPLICATION 权限）
CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'Repl1cate@Strong';

-- 查看账号
SELECT rolname, rolreplication, rolcanlogin FROM pg_roles WHERE rolname='replicator';
\`\`\`

> 生产环境**强烈建议**用专用账号做复制，不要用 superuser。配合 \`pg_hba.conf\` 限制来源 IP。

### 26.2.4 重载配置

\`\`\`bash
pg_ctl reload -D $PGDATA
# 或
SELECT pg_reload_conf();
\`\`\`

## 26.3 用 pg_basebackup 搭建 Standby

\`pg_basebackup\` 从 primary 拉一个完整物理基线，是最常用的 standby 初始化方式。

### 26.3.1 在 standby 主机上执行

\`\`\`bash
# 1. 停止 standby 上的 postgres（如果是新机则跳过）
pg_ctl stop -D $PGDATA

# 2. 清空旧数据目录
rm -rf $PGDATA/*

# 3. 从 primary 拉基线备份
pg_basebackup \\
  -h primary_host \\
  -p 5432 \\
  -U replicator \\
  -D $PGDATA \\
  -Fp -Xs -P -R

# 参数说明：
# -Fp  plain 格式（直接拷文件）
# -Xs  使用 stream 方式同步 WAL（启动一个 walsender）
# -P   显示进度
# -R   自动写 standby.signal 和 primary_conninfo
\`\`\`

### 26.3.2 验证 standby 配置

\`-R\` 参数会自动生成：

\`\`\`bash
# 1. standby.signal 文件（标识这是一个 standby）
$ cat $PGDATA/standby.signal
# （空文件，存在即表示 standby 模式）

# 2. postgresql.auto.conf 追加了连接信息
$ cat $PGDATA/postgresql.auto.conf
primary_conninfo = 'user=replicator password=... host=primary_host port=5432'
primary_slot_name = ''
\`\`\`

### 26.3.3 启动 standby

\`\`\`bash
pg_ctl start -D $PGDATA
\`\`\`

启动后日志应出现：

\`\`\`
LOG:  entering standby mode
LOG:  redo starts at 0/2000028
LOG:  consistent recovery state reached at 0/2000098
LOG:  database system is ready to accept read only connections
LOG:  started streaming WAL from primary at 0/2000098 on timeline 1
\`\`\`

> 看到 \`started streaming WAL\` 即流复制建立成功。standby 此时**只读**，任何写操作会报错。

## 26.4 复制槽（Replication Slot）

复制槽保证 primary 不会在 standby 还没接收前删除 WAL，避免 standby 因断连而需要重新全量。

**创建物理复制槽**：

\`\`\`sql
-- 在 primary 上
SELECT pg_create_physical_replication_slot('standby1_slot');
-- 输出 slot_name, lsn
\`\`\`

**standby 配置使用槽**：

\`\`\`bash
# postgresql.auto.conf
primary_slot_name = 'standby1_slot'
\`\`\`

\`\`\`sql
-- 重新加载
SELECT pg_reload_conf();
-- 或重启 walreceiver
\`\`\`

**查看复制槽**：

\`\`\`sql
SELECT slot_name, slot_type, active, restart_lsn 
FROM pg_replication_slots;
\`\`\`

> **坑**：复制槽会**无限保留 WAL**！如果 standby 永久下线而槽未删除，primary 的 pg_wal 会撑爆磁盘。务必监控 \`pg_replication_slots\` 并删除无用槽：\`SELECT pg_drop_replication_slot('standby1_slot');\`

## 26.5 监控复制状态

### 26.5.1 在 primary 上

\`\`\`sql
-- 查看 standby 连接情况
SELECT application_name, client_addr, state, sync_state,
       sent_lsn, write_lsn, flush_lsn, replay_lsn,
       pg_wal_lsn_diff(sent_lsn, replay_lsn) AS lag_bytes
FROM pg_stat_replication;

-- 字段含义：
-- state: streaming 表示正常
-- sync_state: async / sync / quorum
-- lag_bytes: 落后多少字节
\`\`\`

**计算复制延迟（秒）**：

\`\`\`sql
SELECT application_name,
       pg_wal_lsn_diff(sent_lsn, replay_lsn) AS lag_bytes,
       EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) AS lag_seconds
FROM pg_stat_replication;
\`\`\`

### 26.5.2 在 standby 上

\`\`\`sql
-- standby 当前重放到哪
SELECT pg_last_wal_receive_lsn() AS receive_lsn,
       pg_last_wal_replay_lsn() AS replay_lsn,
       pg_is_in_recovery() AS in_recovery;

-- 是否在做恢复
SELECT pg_is_in_recovery();
-- true 表示是 standby
\`\`\`

### 26.5.3 监控脚本

\`\`\`bash
#!/bin/bash
# check_repl_lag.sh：在 primary 检查延迟
psql -U postgres -c "
SELECT application_name, client_addr, state, sync_state,
       pg_size_pretty(pg_wal_lsn_diff(sent_lsn, replay_lsn)) AS lag
FROM pg_stat_replication;
"
\`\`\`

## 26.6 同步复制详解

**配置同步复制**：

\`\`\`ini
# primary: postgresql.conf
synchronous_standby_names = 'FIRST 1 (standby1)'
# 含义：在 standby1, standby2 中至少 1 个同步
# 也可写 '*' 表示任意 standby

synchronous_commit = on
# 可选 on / remote_apply / remote_write / local / off
\`\`\`

**synchronous_commit 级别**：

| 级别 | primary 行为 | 性能 | 数据安全 |
| --- | --- | --- | --- |
| \`off\` | 本地也不立即刷盘 | 最快 | 可能丢已提交事务 |
| \`local\` | 仅本地 WAL 刷盘 | 快 | standby 可能丢 |
| \`remote_write\` | standby 写入 OS cache 即可 | 较快 | standby 崩溃可能丢 |
| \`on\` | standby WAL 刷盘后 ack | 较慢 | 0 丢失 |
| \`remote_apply\` | standby 重放完毕后 ack | 最慢 | standby 查询必见到 |

> **生产建议**：核心金融场景用 \`remote_apply\`；普通业务用 \`on\`；高吞吐低延迟场景用异步。

**会话级动态调整**：

\`\`\`sql
-- 某个批处理任务允许异步提交，提升吞吐
SET LOCAL synchronous_commit = off;
INSERT INTO logs ... ;
\`\`\`

## 26.7 级联复制

standby 可以作为下游 standby 的上游，减轻 primary 的 walsender 压力。

\`\`\`
Primary ───► Standby1 (接收 + 级联发送) ───► Standby2
\`\`\`

**配置级联 standby**：

\`\`\`ini
# Standby1 的 postgresql.conf 增加
max_wal_senders = 5
hot_standby = on

# Standby2 的 primary_conninfo 指向 Standby1
primary_conninfo = 'host=standby1 port=5432 user=replicator'
\`\`\`

> 级联 standby 不需要 primary 的复制账号直接可达，适合跨机房场景。但 Standby1 必须保留足够 WAL（\`wal_keep_size\`）供 Standby2 追赶。

## 26.8 Failover 与 Promote

当 primary 故障，需要把 standby 提升为新 primary：

\`\`\`bash
# 在 standby 上执行（PG 12+）
pg_ctl promote -D $PGDATA

# 或用 SQL（需要 superuser）
SELECT pg_promote();
\`\`\`

**promote 后**：

- \`standby.signal\` 文件被删除
- standby 变成可写的 primary
- 时间线（timeline）+1，新 WAL 文件名前缀变化
- 原来的 primary 不能直接重新加入，需重建

**用 pg_rewind 修复旧 primary**：

\`\`\`bash
# 在旧 primary 上（停机后）
pg_rewind --target-pgdata $PGDATA \\
  --source-server='host=new_primary port=5432 user=replicator'

# 然后 kao 配置成 standby 启动
\`\`\`

> \`pg_rewind\` 比重新 \`pg_basebackup\` 快很多，因为它只回退分歧后的 WAL 并拷贝变更的块。前提是旧 primary 的 \`wal_log_hints=on\` 或之前启用过 data checksums。

## 26.9 自动故障切换

手动 promote 不够及时，生产用 Patroni / repmgr / pg_auto_failover 等工具实现自动切换。

**Patroni 架构**：

\`\`\`
Patroni ──┬──► PostgreSQL（primary）
          └──► etcd / Consul / ZooKeeper（配置中心）

Patroni ──┬──► PostgreSQL（standby）
          └──► etcd
\`\`\`

**Patroni 关键能力**：

- 健康检查 + 自动 promote
- 防止脑裂（split-brain）通过 DCS 分布式锁
- 自动重建故障节点为 standby
- 与 HAProxy / vip-manager 配合做流量切换

**repmgr 简化方案**：

\`\`\`bash
# 注册 primary
repmgr primary register

# 注册 standby
repmgr standby register

# 自动 failover 守护进程
repmgrd --daemon
\`\`\`

## 26.10 常见问题与排查

### 26.10.1 standby 连不上 primary

\`\`\`bash
# 检查清单
# 1. primary 是否监听对应 IP
SHOW listen_addresses;

# 2. pg_hba.conf 是否允许 replication 连接
host    replication  replicator   standby_ip/32   scram-sha-256

# 3. 防火墙
telnet primary_host 5432

# 4. 密码是否正确
psql 'host=primary_host user=replicator dbname=replication' -W
\`\`\`

### 26.10.2 复制延迟持续增大

\`\`\`sql
-- primary 上看哪个 standby 落后
SELECT application_name, 
       pg_wal_lsn_diff(sent_lsn, replay_lsn) AS lag
FROM pg_stat_replication;

-- 常见原因：
-- 1. standby 机器慢（CPU/IO）→ 升级硬件
-- 2. 网络带宽不足
-- 3. standby 有长查询阻塞重放（hot_standby_feedback 相关）
-- 4. 大事务（一次性插入千万行）→ 拆批
\`\`\`

### 26.10.3 primary 磁盘被 WAL 撑爆

\`\`\`sql
-- 查看复制槽是否堆积
SELECT slot_name, active, restart_lsn,
       pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) AS retained_bytes
FROM pg_replication_slots;

-- 如果有 inactive 但 retention 很大的槽，删除它
SELECT pg_drop_replication_slot('abandoned_slot');
\`\`\`

> 应急时可以临时调大 \`max_wal_size\` 并强制 checkpoint：\`CHECKPOINT;\`

## 26.11 本章小结

- **流复制原理**：primary 推 WAL，standby 重放，物理级一致。
- **primary 配置**：\`wal_level=replica\`、\`max_wal_senders\`、复制账号、\`pg_hba.conf\`。
- **standby 搭建**：\`pg_basebackup -R\` 自动生成 \`standby.signal\` 和 \`primary_conninfo\`。
- **复制槽**：保护 WAL 不被过早清理，但要监控防止撑爆。
- **监控**：\`pg_stat_replication\`（primary）、\`pg_is_in_recovery()\`（standby）。
- **同步复制**：\`synchronous_standby_names\` + \`synchronous_commit\`，0 丢失换性能。
- **failover**：\`pg_ctl promote\` 或 \`pg_promote()\`，旧 primary 用 \`pg_rewind\` 修复。
- **自动化**：Patroni / repmgr 实现自动切换。

> 物理复制是"整库克隆"，下一章我们看更灵活的"逻辑复制"：只复制部分表、跨版本、双向同步。`
  },
  {
    id: "pg-ch27",
    group: "第五部分 架构与高可用",
    icon: "📡",
    title: "第 27 章 逻辑复制",
    content: `# 第 27 章 逻辑复制

物理复制是字节流级别的"整体克隆"，而**逻辑复制**把 WAL 解码成"逻辑变更"（INSERT/UPDATE/DELETE），按表粒度订阅，支持跨版本、跨平台、部分同步。这是 PG 10 引入的重大特性，广泛用于 CDC、在线升级、数据分发。

## 27.1 逻辑复制 vs 物理复制

| 维度 | 物理复制 | 逻辑复制 |
| --- | --- | --- |
| **复制内容** | WAL 字节流 | 逻辑变更（行级操作） |
| **粒度** | 整个集群 | 表级别（可挑选） |
| **standby 可写** | 否（只读） | 是（可独立写） |
| **跨版本** | 否（必须同版本） | 是（10+ 之间） |
| **跨平台** | 否 | 是 |
| **复制 DDL** | 是 | 否（仅 DML） |
| **序列同步** | 是 | 否（需手工） |
| **典型场景** | HA、读扩展 | CDC、升级、部分同步 |

**核心模型**：

\`\`\`
Publisher（发布端）                  Subscriber（订阅端）
  │                                    │
  │  Publication (CREATE PUBLICATION)   │
  │  └─ 表集合                          │
  │                                    │
  │  WAL → logical decoding             │
  │  walsender ──────────────────►  apply worker
  │      逻辑变更流                     │
  │                                    │
  │                          应用到本地表（可写）
\`\`\`

> 逻辑复制的发布端必须是 \`wal_level=logical\`，且每个表需要 \`REPLICA IDENTITY\`（默认 PK）。

## 27.2 发布端配置

### 27.2.1 设置 wal_level

\`\`\`ini
# postgresql.conf（publisher）
wal_level = logical
max_replication_slots = 10
max_wal_senders = 10
\`\`\`

\`\`\`bash
pg_ctl restart -D $PGDATA   # wal_level 需重启
\`\`\`

### 27.2.2 创建复制账号

\`\`\`sql
-- 逻辑复制账号需要 LOGIN 和 REPLICATION 权限
CREATE ROLE logical_user WITH LOGIN REPLICATION PASSWORD 'Logic@Pass';

-- 给账号对目标表的权限
GRANT SELECT ON ALL TABLES IN SCHEMA public TO logical_user;
GRANT USAGE ON SCHEMA public TO logical_user;
\`\`\`

### 27.2.3 pg_hba.conf

\`\`\`ini
# 允许订阅端用复制账号连接
host    all    logical_user    10.0.0.0/8    scram-sha-256
\`\`\`

### 27.2.4 创建 Publication

\`\`\`sql
-- 1. 发布单张表
CREATE PUBLICATION pub_users FOR TABLE users;

-- 2. 发布多张表
CREATE PUBLICATION pub_oltp FOR TABLE users, orders, products;

-- 3. 发布整个 schema（PG 15+）
CREATE PUBLICATION pub_all FOR ALL TABLES;

-- 4. 仅发布 INSERT（不同步 UPDATE/DELETE）
CREATE PUBLICATION pub_insert_only 
  FOR TABLE logs 
  WITH (publish = 'insert');

-- 5. 发布 insert/update/delete/truncate
CREATE PUBLICATION pub_full 
  FOR TABLE users 
  WITH (publish = 'insert,update,delete,truncate');
\`\`\`

**查看 publication**：

\`\`\`sql
\\dp
-- 或
SELECT pubname, puballtables, pubinsert, pubupdate, pubdelete, pubtruncate 
FROM pg_publication;
\`\`\`

### 27.2.5 REPLICA IDENTITY

逻辑复制 UPDATE/DELETE 需要标识旧行，默认用主键：

\`\`\`sql
-- 查看表的 replica identity
SELECT relname, relreplident FROM pg_class WHERE relname='users';
-- d = default（用 PK，无 PK 用唯一索引）
-- n = nothing（不能 UPDATE/DELETE 复制）
-- f = full（用所有列）
-- i = index（指定索引）

-- 表无主键时，必须设 FULL 才能复制 UPDATE/DELETE
ALTER TABLE logs REPLICA IDENTITY FULL;

-- 指定用某唯一索引
ALTER TABLE users REPLICA IDENTITY USING INDEX users_email_idx;
\`\`\`

> **坑**：无主键且未设 \`REPLICA IDENTITY FULL\` 的表，发布端执行 UPDATE/DELETE 会**报错**：\`cannot update table ... because it does not have replica identity and publishes updates\`。

## 27.3 订阅端配置

### 27.3.1 创建 Subscription

\`\`\`sql
-- 在 subscriber 上
CREATE SUBSCRIPTION sub_users
  CONNECTION 'host=publisher_host port=5432 user=logical_user password=... dbname=source'
  PUBLICATION pub_users;

-- 关键参数：
-- copy_data = true（默认）  初始全量拷贝
-- create_slot = true（默认）自动创建逻辑复制槽
-- enabled = true（默认）   创建后立即开始同步
\`\`\`

### 27.3.2 仅复制结构后增量

\`\`\`sql
-- 1. 先在订阅端手工建好表结构（与发布端一致）
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  email TEXT
);

-- 2. 创建订阅时跳过初始拷贝
CREATE SUBSCRIPTION sub_users
  CONNECTION 'host=publisher_host port=5432 user=logical_user password=... dbname=source'
  PUBLICATION pub_users
  WITH (copy_data = false);
\`\`\`

### 27.3.3 查看订阅状态

\`\`\`sql
-- 订阅列表
SELECT subname, subenabled, subconninfo FROM pg_subscription;

-- 订阅的 worker 进程
SELECT application_name, pid, state, received_lsn, last_msg_send_time
FROM pg_stat_subscription;

-- worker 状态 healthy：state='ready' 或 'streaming'
\`\`\`

### 27.3.4 启用/禁用订阅

\`\`\`sql
-- 暂停同步（不断开连接结构）
ALTER SUBSCRIPTION sub_users DISABLE;

-- 恢复
ALTER SUBSCRIPTION sub_users ENABLE;

-- 完全删除（会删除复制槽）
ALTER SUBSCRIPTION sub_users DROP;
DROP SUBSCRIPTION sub_users;
\`\`\`

## 27.4 行过滤器（PG 15+）

PG 15 起支持按条件发布行，只同步符合 WHERE 的行。

\`\`\`sql
-- 只同步 active=1 的用户
CREATE PUBLICATION pub_active_users
  FOR TABLE users WHERE (active = 1);

-- 跨地域同步：只同步本地数据
CREATE PUBLICATION pub_bj_data
  FOR TABLE orders WHERE (region = 'beijing');

CREATE PUBLICATION pub_sh_data
  FOR TABLE orders WHERE (region = 'shanghai');
\`\`\`

> **限制**：WHERE 表达式必须只包含常量与该表的列，不能用子查询、不稳定函数。\`UPDATE\` 后行不再满足 WHERE 时，订阅端会执行 DELETE 来同步。

## 27.5 冲突处理

逻辑复制时，订阅端是可写的，可能产生冲突。典型场景：

| 冲突 | 原因 | 处理 |
| --- | --- | --- |
| **主键冲突** | 订阅端已有同 PK 行 | 删订阅端行或跳过 |
| **外键冲突** | 订阅端引用了不存在的行 | 暂时禁用 FK |
| **NOT NULL** | 订阅端列不允许 NULL | 修正 schema |

**冲突时的表现**：

\`\`\`
ERROR:  duplicate key value violates unique constraint "users_pkey"
DETAIL:  Key (id)=(1000 already exists.
\`\`\`

订阅的 apply worker 会**停止**，日志记录冲突。

**解决方法**：

\`\`\`sql
-- 1. 在订阅端查看错误
SELECT * FROM pg_stat_subscription;
-- state = 'stopped' 或日志中有 conflict

-- 2. 手工修复订阅端数据
DELETE FROM users WHERE id = 1000;

-- 3. 重启订阅 worker
ALTER SUBSCRIPTION sub_users DISABLE;
ALTER SUBSCRIPTION sub_users ENABLE;
\`\`\`

**跳过单次冲突事务（PG 16+）**：

\`\`\`sql
-- 查看要跳过的 LSN
SELECT * FROM pg_stat_subscription;

-- 跳过该 LSN 的事务
ALTER SUBSCRIPTION sub_users SKIP (lsn = '0/12345678');
\`\`\`

> **生产建议**：订阅端尽量避免对同步表写操作，把订阅表当作"只读副本"使用。若必须双向写，需用 pglogical 或 BDR。

## 27.6 应用场景

### 27.6.1 在线大版本升级

\`\`\`
旧版 PG 13 (publisher) ──逻辑复制──► 新版 PG 16 (subscriber)

步骤：
1. 在新版本建好结构一致的库
2. 建立逻辑订阅，等待初始 copy 完成
3. 持续同步，业务仍写旧版
4. 选低峰期切换：
   a. 旧版设只读（停写）
   b. 等待订阅端追平（lag=0）
   c. 业务指向新版
   d. 删除订阅，新版独立运行
\`\`\`

> 优势：相比 \`pg_upgrade --link\`，逻辑升级可回滚、停机时间分钟级，适合核心库。

### 27.6.2 数据分发到多个消费端

\`\`\`
PG（业务库）
   │
   ├─逻辑复制─► PG（报表库，可建不同索引）
   │
   ├─逻辑复制─► PG（异地灾备）
   │
   └─逻辑解码─► Kafka（CDC，用 Debezium/pgoutput）
\`\`\`

### 27.6.3 部分表同步

只把 \`users\`、\`orders\` 同步到下游，不同步 \`logs\`：

\`\`\`sql
CREATE PUBLICATION pub_core FOR TABLE users, orders;
\`\`\`

### 27.6.4 CDC 接 Kafka

\`\`\`bash
# 用 wal2json 或 pgoutput 插件
# Debezium 配置 connector，监听 publication
plugin.name=pgoutput
publication.name=dbz_pub
slot.name=dbz_slot
\`\`\`

## 27.7 pglogical 扩展

PG 原生逻辑复制有局限（不能复制 DDL、单向、无冲突解决），第三方扩展 \`pglogical\` 增强：

**安装**：

\`\`\`bash
# 安装扩展包
yum install pglogical_15

# postgresql.conf
shared_preload_libraries = 'pglogical'

# 两侧都建扩展
CREATE EXTENSION pglogical;
\`\`\`

**核心能力**：

| 能力 | 原生逻辑复制 | pglogical |
| --- | --- | --- |
| **复制 DDL** | 否 | 是（可选） |
| **双向复制** | 否 | 是 |
| **行/列过滤** | PG 15+ | 全版本 |
| **冲突策略** | 仅停止 | last-update-wins 等 |
| **跨版本** | 是 | 是 |
| **序列同步** | 否 | 是 |

**示例：pglogical 提供者**：

\`\`\`sql
-- publisher 端
SELECT pglogical.create_node(
  node_name := 'provider1',
  dsn := 'host=provider_host port=5432 dbname=app'
);

SELECT pglogical.create_replication_set(
  set_name := 'default',
  replicate_insert := true,
  replicate_update := true,
  replicate_delete := true
);

SELECT pglogical.replication_set_add_table('default', 'users');
\`\`\`

**订阅者**：

\`\`\`sql
SELECT pglogical.create_node(
  node_name := 'subscriber1',
  dsn := 'host=subscriber_host port=5432 dbname=app'
);

SELECT pglogical.create_subscription(
  subscription_name := 'sub1',
  provider_dsn := 'host=provider_host port=5432 dbname=app',
  replication_sets := '{default}'
);
\`\`\`

> pglogical 适合复杂场景，但额外依赖维护成本。简单需求优先用原生逻辑复制。

## 27.8 监控与运维

### 27.8.1 监控同步进度

\`\`\`sql
-- 订阅端 lag（字节）
SELECT subname, pid, received_lsn, latest_end_lsn,
       pg_wal_lsn_diff(latest_end_lsn, received_lsn) AS lag_bytes
FROM pg_stat_subscription;

-- 发布端发送情况
SELECT application_name, state, sync_state, sent_lsn, write_lsn, flush_lsn, replay_lsn
FROM pg_stat_replication
WHERE application_name LIKE 'sub_%';
\`\`\`

### 27.8.2 初始同步进度

\`\`\`sql
-- 初始 copy 时查看进度
SELECT pid, relid::regclass, phase, 
       blocks_done, blocks_total,
       round(100.0 * blocks_done / nullif(blocks_total,0), 2) AS pct
FROM pg_stat_progress_basebackup
UNION ALL
SELECT pid, relid::regclass, phase,
       num_done, num_total,
       round(100.0 * num_done / nullif(num_total,0), 2)
FROM pg_stat_progress_copy;
\`\`\`

### 27.8.3 复制槽管理

\`\`\`sql
-- 逻辑复制槽
SELECT slot_name, plugin, slot_type, active, restart_lsn,
       confirmed_flush_lsn
FROM pg_replication_slots
WHERE slot_type = 'logical';

-- 强制推进槽位点（跳过未消费的事务，危险）
SELECT pg_replication_slot_advance('sub_users_slot', '0/20000000');
\`\`\`

> **坑**：订阅端长期下线，发布端逻辑槽也会**无限保留 WAL**，撑爆磁盘。务必监控 \`pg_replication_slots\` 中 \`active=false\` 的槽。

## 27.9 常见问题

### 27.9.1 复制不工作

\`\`\`sql
-- 检查清单
-- 1. wal_level = logical?
SHOW wal_level;

-- 2. 表有主键或 REPLICA IDENTITY?
SELECT relname, relreplident FROM pg_class WHERE relname='users';

-- 3. publication 包含目标表?
SELECT * FROM pg_publication_tables;

-- 4. subscription 启用?
SELECT subname, subenabled FROM pg_subscription;

-- 5. apply worker 在运行?
SELECT subname, pid, state FROM pg_stat_subscription;
\`\`\`

### 27.9.2 DDL 不同步

逻辑复制**不复制 DDL**，发布端 ALTER TABLE 后订阅端不会自动同步结构：

\`\`\`sql
-- 发布端
ALTER TABLE users ADD COLUMN phone TEXT;

-- 订阅端必须手工执行同样的 DDL
ALTER TABLE users ADD COLUMN phone TEXT;
\`\`\`

> 生产中通常用工具（如 Liquibase、Flyway）双写 DDL，或用 pglogical 的 DDL 复制能力。

### 27.9.3 序列不同步

逻辑复制**不复制序列值**，切换时需要手动同步：

\`\`\`sql
-- 在发布端查看所有序列当前值
SELECT seqnamespace::regnamespace, seqname, last_value 
FROM pg_sequences;

-- 在订阅端 setval 同步
SELECT setval('users_id_seq', 1000000);
\`\`\`

> 切换前用脚本把所有序列的 last_value 对齐，否则订阅端写入会遇到主键冲突。

## 27.10 本章小结

- **逻辑 vs 物理**：逻辑复制是行级 DML 流，粒度细、可跨版本；物理是字节流，整库克隆。
- **发布订阅模型**：\`CREATE PUBLICATION\` + \`CREATE SUBSCRIPTION\`，PG 10+ 原生支持。
- **REPLICA IDENTITY**：UPDATE/DELETE 复制必须有主键或 \`FULL\`。
- **行过滤器**（PG 15+）：\`WHERE\` 子句实现部分行同步。
- **冲突处理**：订阅端可写导致冲突，需手工修复或 PG 16+ 用 \`SKIP\`。
- **应用场景**：在线升级、数据分发、CDC、部分同步。
- **pglogical**：增强版逻辑复制，支持 DDL、双向、冲突策略。
- **运维要点**：监控 \`pg_stat_subscription\`、管理逻辑槽、DDL/序列手工同步。

> 逻辑复制让 PostgreSQL 的数据流动更灵活，下一章我们进入运维核心：备份与恢复，学习 pg_dump、pg_basebackup 与 PITR。`
  },
  {
    id: "pg-ch28",
    group: "第五部分 架构与高可用",
    icon: "💾",
    title: "第 28 章 备份与恢复",
    content: `# 第 28 章 备份与恢复

备份是数据库运维的最后一道防线。PostgreSQL 提供**逻辑备份**（pg_dump / pg_dumpall）和**物理备份**（pg_basebackup）两套体系，配合 WAL 归档可实现**时间点恢复（PITR）**。本章系统讲解各方案与最佳实践。

## 28.1 备份方案全景

| 方案 | 工具 | 特点 | 适用 |
| --- | --- | --- | --- |
| **逻辑备份** | \`pg_dump\` | 单库导出 SQL/归档，跨版本 | 小库、迁移、单表 |
| **全集群逻辑** | \`pg_dumpall\` | 导出所有库 + 角色 + 表空间 | 集群迁移 |
| **物理备份** | \`pg_basebackup\` | 二进制级别，速度快 | 大库、PITR 基线 |
| **PITR** | pg_basebackup + WAL 归档 | 恢复到任意时间点 | 误删恢复 |
| **快照** | LVM / ZFS / 云盘快照 | 文件系统级，秒级 | 配合物理备份 |

**3-2-1 备份原则**：

- **3** 份数据副本
- **2** 种不同介质
- **1** 份离线/异地

## 28.2 pg_dump 逻辑备份

\`pg_dump\` 是单库逻辑备份工具，把数据库导出为 SQL 文本或自定义归档。

### 28.2.1 基本用法

\`\`\`bash
# 1. 文本格式（默认）
pg_dump -h localhost -U postgres -d mydb -F p -f mydb.sql

# 2. 自定义归档格式（推荐，支持并行恢复）
pg_dump -h localhost -U postgres -d mydb -F c -f mydb.dump

# 3. 目录格式（每表一个文件，支持并行）
pg_dump -h localhost -U postgres -d mydb -F d -f mydb_dir/

# 4. tar 格式
pg_dump -h localhost -U postgres -d mydb -F t -f mydb.tar
\`\`\`

**格式对比**：

| 格式 | -F | 压缩 | 并行恢复 | 选择性恢复 | 跨版本 |
| --- | --- | --- | --- | --- | --- |
| plain | p | 否 | 否 | 否 | 是 |
| custom | c | 是 | 是(-j) | 是 | 是 |
| directory | d | 是 | 是(-j) | 是 | 是 |
| tar | t | 否 | 否 | 是 | 是 |

> **生产建议**：优先用 \`custom\` 或 \`directory\` 格式，支持压缩、并行、选择性恢复，远比文本灵活。

### 28.2.2 选择性备份

\`\`\`bash
# 仅备份指定表
pg_dump -d mydb -t users -t orders -F c -f tables.dump

# 排除某些表（如大日志表）
pg_dump -d mydb -T logs -T audit_trail -F c -f mydb_no_logs.dump

# 仅备份 schema（结构，不含数据）
pg_dump -d mydb -s -F c -f schema_only.dump

# 仅备份数据
pg_dump -d mydb -a -F c -f data_only.dump

# 按正则匹配表
pg_dump -d mydb -t 'public.order_*' -F c -f orders.dump

# 仅备份指定 schema
pg_dump -d mydb -n reporting -F c -f reporting.dump
\`\`\`

### 28.2.3 并行备份（PG 15+ 目录格式）

\`\`\`bash
# 用 4 个并行 dump 大库
pg_dump -d bigdb -F d -j 4 -f bigdb_dir/

# -j 只对 directory 格式有效
# 多个表同时 dump，速度成倍提升
\`\`\`

### 28.2.4 一致性快照

\`pg_dump\` 默认在一个事务里 dump，得到一致性快照，不影响业务读写：

\`\`\`bash
# 旧版 PG 单事务 dump 会阻塞 DDL
# PG 12+ 默认用 --snapshot，配合重复读隔离

# 长时间 dump 时建议加 --no-unchanged-data（PG 17+）
pg_dump -d mydb -F c -f mydb.dump --snapshot
\`\`\`

## 28.3 pg_dumpall 全集群备份

\`pg_dumpall\` 备份整个集群：所有数据库 + 角色 + 表空间 + 权限。

\`\`\`bash
# 仅备份全局对象（角色、表空间）——常配 pg_dump 用
pg_dumpall -g -f globals.sql

# 备份所有数据库（含数据）
pg_dumpall -f all.sql

# 只备份角色定义
pg_dumpall -r -f roles.sql

# 只备份表空间
pg_dumpall -t -f tablespaces.sql
\`\`\`

**典型组合**：

\`\`\`bash
# 1. 备份全局对象
pg_dumpall -g -f globals_$(date +%F).sql

# 2. 分别备份每个库（custom 格式，可并行）
for db in $(psql -At -c "SELECT datname FROM pg_database WHERE datistemplate=false"); do
  pg_dump -F c -f \${db}_$(date +%F).dump $db
done
\`\`\`

> \`pg_dumpall\` 只能文本格式，大库恢复慢。推荐 \`pg_dumpall -g\` 出全局对象，再用 \`pg_dump -F c\` 分别备份各库。

## 28.4 pg_restore 恢复

\`pg_restore\` 用于恢复 \`custom/directory/tar\` 格式的备份。

### 28.4.1 基本恢复

\`\`\`bash
# 1. 先建空库
createdb -U postgres mydb_new

# 2. 恢复
pg_restore -d mydb_new -U postgres mydb.dump

# 3. 并行恢复（大幅加速）
pg_restore -d mydb_new -j 4 mydb.dump
\`\`\`

### 28.4.2 选择性恢复

\`\`\`bash
# 列出备份内容
pg_restore -l mydb.dump
# 输出每个对象的 OID 和类型

# 仅恢复指定表
pg_restore -d mydb -t users mydb.dump

# 仅恢复指定 schema
pg_restore -d mydb -n reporting mydb.dump

# 按 OID 列表恢复（从 -l 输出获取 OID）
pg_restore -d mydb -L restore.list mydb.dump
\`\`\`

### 28.4.3 恢复选项

\`\`\`bash
# 仅恢复 schema（不导数据）
pg_restore -s -d mydb mydb.dump

# 仅恢复数据
pg_restore -a -d mydb mydb.dump

# 清理已存在的对象后恢复
pg_restore -c -d mydb mydb.dump

# 忽略错误继续
pg_restore -e -d mydb mydb.dump

# 事务包裹（要么全成要么全败，但大库慎用）
pg_restore -1 -d mydb mydb.dump
\`\`\`

> **坑**：\`-c\`（clean）会先 DROP 再 CREATE，生产恢复时务必确认目标库。建议先在测试库演练。

### 28.4.4 文本格式恢复

\`\`\`bash
# 纯文本 .sql 文件直接 psql 导入
psql -d mydb -f mydb.sql

# 大文件时关掉自动提交，显式 BEGIN/COMMIT 加速
psql -d mydb -1 -f mydb.sql
\`\`\`

## 28.5 pg_basebackup 物理备份

\`pg_basebackup\` 做整库二进制备份，速度快，是 PITR 的基线。

### 28.5.1 基本用法

\`\`\`bash
# 必须先在源端配置 wal_level=replica + max_wal_senders + 复制账号
pg_basebackup \\
  -h primary_host \\
  -U replicator \\
  -D /backup/base_$(date +%F) \\
  -Fp -Xs -P -z

# 参数：
# -Fp  plain 格式
# -Xs  stream WAL（同时拉取所需 WAL）
# -P   显示进度
# -z   gzip 压缩
\`\`\`

### 28.5.2 tar 格式备份

\`\`\`bash
# tar 格式，便于传输
pg_basebackup \\
  -h primary_host -U replicator \\
  -D /backup/base_$(date +%F) \\
  -Ft -Xs -P -z

# 输出 base.tar.gz 和 pg_wal.tar.gz
\`\`\`

### 28.5.3 增量备份（PG 17+）

PG 17 引入增量备份：

\`\`\`bash
# 1. 服务端先做全量
pg_basebackup -h primary -U repl -D /backup/full -Fp -Xs -c fast

# 2. 后续做增量（基于全量的变化）
pg_basebackup -h primary -U repl -D /backup/incr_$(date +%F) \\
  -Fp -Xs -i /backup/full/backup_label
\`\`\`

> 增量备份结合 WAL 归档，可大幅减少备份存储与时间。恢复时需先用 \`pg_combinebackup\` 合并。

## 28.6 WAL 归档（连续归档）

WAL 归档是 PITR 的基础。开启后，每个 WAL 段切换时被拷到归档目录。

### 28.6.1 配置归档

\`\`\`ini
# postgresql.conf
archive_mode = on
archive_command = 'test ! -f /backup/wal/%f && cp %p /backup/wal/%f'
# %p = 源文件路径
# %f = 文件名
# test ! -f 防止覆盖已归档的 WAL（重复归档会失败，安全）
archive_timeout = 600   # 10 分钟强制切换（即使未满 16MB）
\`\`\`

\`\`\`bash
# 重启（archive_mode 需重启）
pg_ctl restart -D $PGDATA
\`\`\`

### 28.6.2 验证归档

\`\`\`sql
-- 查看归档状态
SELECT * FROM pg_stat_archiver;
-- archived_count: 已归档数
-- failed_count: 失败数
-- last_archived_wal: 最后归档的 WAL

-- 强制切换 WAL，触发归档
SELECT pg_switch_wal();
\`\`\`

\`\`\`bash
# 检查归档目录
ls /backup/wal/ | wc -l
\`\`\`

### 28.6.3 归档脚本最佳实践

\`\`\`bash
# archive_command 用 rsync 同步到异地
archive_command = 'rsync -a %p backup_server:/backup/wal/%f'

# 防止覆盖且校验完整性
archive_command = 'test ! -f /backup/wal/%f && gzip -c %p > /backup/wal/%f.gz'
\`\`\`

> **关键**：\`archive_command\` 必须返回 0 才算成功，否则 PG 会重试。命令必须**幂等**，重复执行不能覆盖已存在文件。

## 28.7 时间点恢复（PITR）

PITR = 全量物理备份 + WAL 归档重放，可恢复到任意时间点。

### 28.7.1 场景

上午 10:30 有人误执行 \`DROP TABLE orders;\`，需要恢复到 10:29:59 的状态。

### 28.7.2 操作步骤

**步骤 1：停库**

\`\`\`bash
pg_ctl stop -D $PGDATA
\`\`\`

**步骤 2：清空数据目录，恢复基线备份**

\`\`\`bash
# 备份当前（损坏的）数据，以防万一
mv $PGDATA $PGDATA.broken

# 恢复最近一次全量物理备份
cp -r /backup/base_2024-01-15/* $PGDATA/
chmod 700 $PGDATA
chown -R postgres:postgres $PGDATA
\`\`\`

**步骤 3：配置恢复**

\`\`\`ini
# 在 $PGDATA 下创建 recovery.signal 空文件（PG 12+）
touch $PGDATA/recovery.signal

# 在 postgresql.conf 或 postgresql.auto.conf 添加
restore_command = 'cp /backup/wal/%f %p'
recovery_target_time = '2024-01-15 10:29:59+08'
# 也可指定 LSN 或事务 ID：
# recovery_target_lsn = '0/12000000'
# recovery_target_xid = '1234567'
recovery_target_action = 'promote'   # 恢复后 promote 为 primary
recovery_target_inclusive = true     # 包含目标点的事务
\`\`\`

**步骤 4：启动数据库，自动恢复**

\`\`\`bash
pg_ctl start -D $PGDATA
\`\`\`

日志会显示：

\`\`\`
LOG:  starting point-in-time recovery to 2024-01-15 10:29:59+08
LOG:  redo starts at 0/2000028
LOG:  restored log file "00000001000000000000000A" from archive
LOG:  recovery stopping before commit of transaction 1234567
LOG:  recovery has paused
LOG:  recovery target was reached
\`\`\`

**步骤 5：验证并导出数据**

\`\`\`sql
-- 此时是 standby 只读状态，可查询验证
SELECT count(*) FROM orders;

-- 确认无误后 promote（如果 recovery_target_action=pause）
SELECT pg_wal_replay_resume();
-- 或
pg_ctl promote -D $PGDATA
\`\`\`

**步骤 6：导出误删表数据，回到生产库**

\`\`\`bash
pg_dump -t orders -d mydb -F c -f orders_recovered.dump

# 在生产库恢复
pg_restore -d mydb_prod orders_recovered.dump
\`\`\`

### 28.7.3 recovery_target_action 选项

| 值 | 行为 |
| --- | --- |
| \`pause\`（默认） | 暂停在目标点，可查询验证后决定 |
| \`promote\` | 自动 promote 为可写 primary |
| \`shutdown\` | 恢复后立即关机 |

> 推荐用 \`pause\`，恢复后先验证数据，再决定 \`pg_wal_replay_resume()\` 继续或 \`pg_ctl promote\`。

## 28.8 备份策略最佳实践

### 28.8.1 推荐组合

\`\`\`
每日：pg_basebackup 全量物理备份（保留 7 天）
持续：WAL 归档到异地（保留 30 天）
每周：pg_dump 关键库逻辑备份（保留 4 周，用于跨版本恢复）
每月：pg_dumpall -g 全局对象（角色、表空间）
\`\`\`

### 28.8.2 备份脚本

\`\`\`bash
#!/bin/bash
# daily_backup.sh
set -e
BACKUP_DIR=/backup/$(date +%F)
mkdir -p $BACKUP_DIR

# 1. 物理全量
pg_basebackup -h localhost -U replicator -D $BACKUP_DIR/base \\
  -Fp -Xs -P -z

# 2. 全局对象
pg_dumpall -g -f $BACKUP_DIR/globals.sql

# 3. 关键库逻辑备份（custom 格式）
for db in app_core app_logs; do
  pg_dump -F c -j 4 -f $BACKUP_DIR/\${db}.dump $db
done

# 4. 校验
ls -lh $BACKUP_DIR/
echo "Backup done at $(date)"

# 5. 清理 7 天前的物理备份
find /backup -maxdepth 1 -type d -mtime +7 -exec rm -rf {} \\;
\`\`\`

### 28.8.3 备份验证

> **铁律**：未经验证的备份等于没有备份。每周必须做恢复演练。

\`\`\`bash
# 恢复演练脚本
TEST_DIR=/tmp/restore_test
rm -rf $TEST_DIR
mkdir -p $TEST_DIR

# 解压并恢复
tar -xzf /backup/2024-01-15/base.tar.gz -C $TEST_DIR

# 启动测试实例（不同端口）
pg_ctl start -D $TEST_DIR -o "-p 55432"

# 验证
psql -p 55432 -c "SELECT count(*) FROM users;"

# 清理
pg_ctl stop -D $TEST_DIR
rm -rf $TEST_DIR
\`\`\`

### 28.8.4 备份安全

- **异地存放**：至少一份备份在不同机房/云区域
- **加密**：敏感数据用 \`gpg\` 加密备份文件
- **不可变**：用对象存储的 WORM 功能防止勒索病毒篡改

\`\`\`bash
# 加密备份
gpg --symmetric --cipher-algo AES256 mydb.dump

# 解密恢复
gpg --decrypt mydb.dump.gpg | pg_restore -d mydb
\`\`\`

## 28.9 第三方备份工具

| 工具 | 特点 |
| --- | --- |
| **pgBackRest** | 增量、并行、压缩、异地、仓库管理，最流行 |
| **Barman** | Python 写的备份管理，支持增量 |
| **WAL-G** | 云原生，支持 S3/GCS/Azure |
| **walarchive** | 轻量 WAL 归档脚本 |

**pgBackRest 示例**：

\`\`\`ini
# pgbackrest.conf
[mydb]
pg1-host=db-host
pg1-user=postgres
pg1-path=/var/lib/pgsql/15/data

[global]
repo1-path=/backup/pgbackrest
repo1-retention-full=4
\`\`\`

\`\`\`bash
# 全量
pgbackrest --stanza=mydb backup --type=full

# 增量
pgbackrest --stanza=mydb backup --type=incr

# 恢复
pgbackrest --stanza=mydb restore --set=20240115-1030F
\`\`\`

## 28.10 常见问题

### 28.10.1 pg_dump 报权限不足

\`\`\`sql
-- pg_dump 需要对 schema 和表的 SELECT 权限
GRANT USAGE ON SCHEMA public TO backup_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO backup_user;
\`\`\`

### 28.10.2 归档失败导致 pg_wal 膨胀

\`\`\`sql
-- 查看 failed_count
SELECT archived_count, failed_count, last_failed_wal 
FROM pg_stat_archiver;

-- 若归档目录满，先清理空间，PG 会自动重试
-- 或临时改 archive_command 为 '/bin/true' 跳过（危险，丢归档）
\`\`\`

### 28.10.3 PITR 恢复不到目标时间

- 检查 \`recovery_target_time\` 时区是否与系统一致
- 检查 \`recovery_target_inclusive\`（true 包含目标事务，false 排除）
- 确认 WAL 归档完整（覆盖目标时间点）
- 用 \`recovery_target_action=pause\` 暂停后查询确认

## 28.11 本章小结

- **逻辑备份**：\`pg_dump\`（单库）、\`pg_dumpall\`（全集群），跨版本，小库首选。
- **格式选择**：优先 \`custom\`/\`directory\`，支持压缩、并行、选择性恢复。
- **pg_restore**：\`-j\` 并行、\`-t\`/\`-n\` 选择性恢复、\`-c\` 清理后恢复。
- **物理备份**：\`pg_basebackup\` 速度快，是 PITR 基线。
- **WAL 归档**：\`archive_mode\` + \`archive_command\`，连续归档是 PITR 前提。
- **PITR**：基线 + WAL 重放，\`recovery.signal\` + \`restore_command\` + \`recovery_target_*\`。
- **策略**：物理每日全量 + WAL 归档 + 逻辑周备份 + 演练。
- **工具**：pgBackRest / Barman / WAL-G 提供增量、压缩、异地能力。

> 备份是最后一道防线，没有验证的备份等于没备份。下一章我们看如何用 PgBouncer 解决 PG 的连接开销问题。`
  },
  {
    id: "pg-ch29",
    group: "第五部分 架构与高可用",
    icon: "🔌",
    title: "第 29 章 连接池 PgBouncer",
    content: `# 第 29 章 连接池 PgBouncer

PostgreSQL 的 fork 进程模型导致每个连接开销大（独立内存、进程切换），几百连接就可能拖垮数据库。**PgBouncer** 是 PostgreSQL 生态最流行的轻量级连接池，通过复用后端连接，让数千客户端共享几十个数据库连接。本章从原理到部署全面讲解。

## 29.1 为什么需要连接池

### 29.1.1 PostgreSQL 的连接成本

每条连接的代价：

| 资源 | 成本 |
| --- | --- |
| **进程** | 一个 backend 进程，约 5-10MB 内存 |
| **fork** | postmaster fork 创建进程，有开销 |
| **work_mem** | 每连接私有，排序/哈希独占 |
| **上下文切换** | 进程切换比线程贵 |

**测试**：500 个 idle 连接大约占用 2-3GB 内存，且 \`context switch\` 上升。

### 29.1.2 应用层连接池的不足

Tomcat/HikariCP 等应用层连接池虽能复用，但：

- 每个应用实例独立池，**总连接数 = 实例数 × 池大小**，仍可能爆炸
- 微服务架构下，几十个服务各自池，DB 端连接数累计超限
- 无法跨服务复用连接

### 29.1.3 PgBouncer 的价值

\`\`\`
应用层连接池（每服务 50）→ PgBouncer（统一池 100）→ PostgreSQL（实际 100）

1000 客户端连接 → PgBouncer → 50 DB 连接（连接复用）
\`\`\`

**核心收益**：

- DB 端连接数从 1000 降到 50
- 内存节省数 GB
- 连接建立时间从 50ms 降到 < 1ms
- 抗突发流量冲击

## 29.2 PgBouncer 三种池化模式

PgBouncer 支持三种模式，核心区别是"何时归还连接"：

| 模式 | 归还时机 | 事务/语句一致性 | 临时表 | SET | 适用 |
| --- | --- | --- | --- | --- | --- |
| **session** | 客户端断开 | 完整 | 支持 | 支持 | 兼容性最好 |
| **transaction**（推荐） | 事务结束 | 事务内一致 | 不支持 | 受限 | OLTP 通用 |
| **statement** | 语句结束 | 单语句内 | 不支持 | 受限 | 仅简单查询 |

### 29.2.1 session 模式

客户端连接期间独占一个后端连接，等同"代理"。无复用收益，仅作兼容用。

### 29.2.2 transaction 模式（默认推荐）

事务结束后归还连接到池，下个事务可能用不同后端连接。

**限制**：

- 跨事务的临时表会丢失（每个事务可能不同连接）
- \`SET\` 参数仅当前事务有效，要用 \`SET LOCAL\`
- \`LISTEN/NOTIFY\` 不工作（连接可能换）
- 不能用 advisory lock 跨事务

**适配 transaction 模式**：

\`\`\`sql
-- 错误：参数会丢
SET statement_timeout = 10000;
BEGIN;
SELECT ...;  -- 这个事务可能没有 statement_timeout
COMMIT;

-- 正确：用 SET LOCAL
BEGIN;
SET LOCAL statement_timeout = 10000;
SELECT ...;
COMMIT;

-- 或在连接字符串中设置（PgBouncer 透传）
-- jdbc:postgresql://pgbouncer:6432/mydb?options=-c%20statement_timeout=10000
\`\`\`

### 29.2.3 statement 模式

每条语句结束归还连接，**强制 autocommit**，不能有事务。仅用于简单查询场景。

> **生产首选 transaction 模式**。绝大多数 Web 应用都是"短事务 + autocommit"，完美适配。若用 session 模式则失去池化意义。

## 29.3 安装与配置

### 29.3.1 安装

\`\`\`bash
# CentOS/RHEL
yum install pgbouncer

# Ubuntu/Debian
apt install pgbouncer

# 或源码编译
./configure --prefix=/usr/local/pgbouncer
make && make install
\`\`\`

### 29.3.2 pgbouncer.ini 主配置

\`\`\`ini
# /etc/pgbouncer/pgbouncer.ini
[databases]
; 数据库映射：客户端看到的库名 = 实际连接串
mydb = host=127.0.0.1 port=5432 dbname=mydb
appdb = host=10.0.0.10 port=5432 dbname=appdb pool_size=20
; 通配：所有未列出的库走默认
* = host=127.0.0.1 port=5432

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432

; 池化模式
pool_mode = transaction

; 连接池大小
default_pool_size = 20
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 3
max_client_conn = 1000
max_db_connections = 100

; 认证
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt

; 超时
server_idle_timeout = 600
server_lifetime = 3600
query_wait_timeout = 120
client_idle_timeout = 0

; 日志
logfile = /var/log/pgbouncer/pgbouncer.log
pidfile = /var/run/pgbouncer/pgbouncer.pid
admin_users = pgbouncer_admin
stats_users = pgbouncer_stats

; 性能
server_reset_query = DISCARD ALL
server_reset_query_always = 0
ignore_startup_parameters = extra_float_digits
\`\`\`

**关键参数说明**：

| 参数 | 说明 |
| --- | --- |
| \`default_pool_size\` | 每个数据库+用户的连接数 |
| \`max_client_conn\` | 客户端最大连接数（不限池大小） |
| \`max_db_connections\` | 到 DB 的总连接上限 |
| \`reserve_pool_size\` | 突发时可临时增加的连接 |
| \`query_wait_timeout\` | 客户端等待连接最长时间 |
| \`server_idle_timeout\` | 后端空闲多久后断开 |

### 29.3.3 认证文件 userlist.txt

\`\`\`bash
# /etc/pgbouncer/userlist.txt
# 格式："username" "password_hash"
# 密码哈希用 SCRAM 或 md5

# 生成 SCRAM 密码哈希
PGPASSWORD='app_pass' psql -h 127.0.0.1 -U postgres -c "SELECT 'SCRAM-SHA-256$' || regexp_replace(rolpassword, '^SCRAM-SHA-256', '') FROM pg_authid WHERE rolname='app_user';"

# 或直接用明文（不推荐）
"app_user" "app_pass"
"pgbouncer_admin" "admin_strong_pass"
\`\`\`

更简单的方法是让 PgBouncer 用 \`auth_query\` 直接查 PostgreSQL：

\`\`\`ini
# pgbouncer.ini
auth_type = scram-sha-256
auth_user = pgbouncer_auth
auth_query = SELECT usename, passwd FROM pg_shadow WHERE usename=$1
\`\`\`

\`\`\`sql
-- PostgreSQL 中建 auth_user 并授权
CREATE USER pgbouncer_auth LOGIN PASSWORD '...';
GRANT SELECT ON pg_shadow TO pgbouncer_auth;
\`\`\`

### 29.3.4 启动

\`\`\`bash
# 启动
pgbouncer -d /etc/pgbouncer/pgbouncer.ini

# 前台调试
pgbouncer /etc/pgbouncer/pgbouncer.ini

# 重载配置
kill -HUP $(cat /var/run/pgbouncer/pgbouncer.pid)

# 或通过 admin 接口
psql -h 127.0.0.1 -p 6432 -U pgbouncer_admin pgbouncer -c "RELOAD;"
\`\`\`

## 29.4 应用连接

应用把 PgBouncer 当成普通 PostgreSQL，端口改为 6432：

\`\`\`bash
# psql 连接
psql -h pgbouncer_host -p 6432 -U app_user mydb

# JDBC
jdbc:postgresql://pgbouncer_host:6432/mydb

# Python psycopg2
psycopg2.connect(host='pgbouncer_host', port=6432, ...)
\`\`\`

> **关键**：transaction 模式下，应用不要用长连接持有状态。推荐配置 \`connection_timeout=30\`、\`maximum_pool_size=10\` 等较小值，让 PgBouncer 复用。

## 29.5 管理 PgBouncer

PgBouncer 提供一个特殊的"虚拟库" \`pgbouncer\`，用 SQL 命令管理。

\`\`\`bash
psql -h 127.0.0.1 -p 6432 -U pgbouncer_admin pgbouncer
\`\`\`

### 29.5.1 常用 SHOW 命令

\`\`\`sql
-- 查看池状态
SHOW POOLS;
-- 输出：database, user, cl_active, cl_waiting, sv_active, sv_idle, sv_used, sv_tested, maxwait

-- 查看客户端连接
SHOW CLIENTS;

-- 查看到 DB 的服务端连接
SHOW SERVERS;

-- 查看所有数据库配置
SHOW DATABASES;

-- 查看统计（总连接数、查询数等）
SHOW STATS;
-- 输出：database, total_xact_count, total_query_count, total_received, total_sent, avg_query

-- 查看详细统计
SHOW STATS_TOTALS;
SHOW STATS_AVERAGES;

-- 查看内存使用
SHOW MEM;

-- 查看 PgBouncer 版本与运行状态
SHOW VERSION;
SHOW CONFIG;
SHOW LISTS;
\`\`\`

**SHOW POOLS 字段解读**：

| 字段 | 含义 |
| --- | --- |
| \`cl_active\` | 客户端活跃连接（在执行查询） |
| \`cl_waiting\` | 客户端等待后端连接 |
| \`sv_active\` | 后端活跃连接 |
| \`sv_idle\` | 后端空闲连接 |
| \`sv_used\` | 已用但需 reset 的连接 |
| \`maxwait\` | 最长等待秒数 |

### 29.5.2 管理命令

\`\`\`sql
-- 重载配置（不中断连接）
RELOAD;

-- 暂停（等所有事务结束后断开，用于维护）
PAUSE;

-- 恢复
RESUME;

-- 禁用某个数据库
DISABLE mydb;

-- 启用
ENABLE mydb;

-- 杀掉某客户端连接
KILL <client_id>;

-- 关闭 PgBouncer
SHUTDOWN;

-- 重启（保留连接）
RESTART;
\`\`\`

### 29.5.3 在线调整参数

\`\`\`sql
-- 修改池大小
SET default_pool_size = 50;

-- 修改最大客户端连接
SET max_client_conn = 2000;

-- 查看当前值
SHOW CONFIG;
\`\`\`

## 29.6 监控与调优

### 29.6.1 关键指标

| 指标 | 告警阈值 | 措施 |
| --- | --- | --- |
| \`cl_waiting > 0\` | 持续 > 10s | 增大 \`default_pool_size\` |
| \`maxwait > 1s\` | 任何 | DB 慢查询或池不足 |
| \`sv_active == default_pool_size\` | 持续 | 池打满，扩容 |
| DB 端连接数接近 \`max_connections\` | > 80% | 减小各池总规模 |

### 29.6.2 监控脚本

\`\`\`bash
#!/bin/bash
# pgbouncer_status.sh
psql -h 127.0.0.1 -p 6432 -U pgbouncer_admin pgbouncer -c "
SELECT database, user,
       cl_active AS clients_active,
       cl_waiting AS clients_waiting,
       sv_active AS servers_active,
       sv_idle AS servers_idle,
       maxwait
FROM pools
ORDER BY cl_waiting DESC;
"
\`\`\`

### 29.6.3 容量规划

\`\`\`
default_pool_size × 数据库数 × 用户数 = 总 DB 连接数

例：
- 5 个数据库 × 2 个用户 × pool_size 20 = 200 连接
- DB 端 max_connections 设为 250（留余量给维护）

总 DB 连接 < max_connections - superuser_reserved_connections - 复制连接
\`\`\`

> **坑**：\`default_pool_size\` 是"每个 database+user 组合"的池大小。多租户场景下若每个租户独立账号，池会爆炸。建议用统一应用账号。

## 29.7 PgBouncer 与 PostgreSQL 协作

### 29.7.1 PostgreSQL 端配置

\`\`\`ini
# postgresql.conf
max_connections = 300         # 留出空间给 PgBouncer 池
superuser_reserved_connections = 10
\`\`\`

\`\`\`ini
# pg_hba.conf 允许 PgBouncer 主机连接
host    all    app_user    pgbouncer_host_ip/32    scram-sha-256
\`\`\`

### 29.7.2 高可用部署

PgBouncer 本身是单点，常见高可用方案：

\`\`\`
                    ┌─ PgBouncer-1（主）
HAProxy/VIP ────────┤
                    └─ PgBouncer-2（备）
                         │
                    ┌────┴────┐
                    ▼         ▼
                PG Primary  PG Standby
\`\`\`

- **HAProxy** 健康检查 PgBouncer，故障切换
- **VIP** 通过 keepalived 漂移
- **多个 PgBouncer 实例** 共用同一份配置

### 29.7.3 与连接池大小配合

应用层 HikariCP 配置：

\`\`\`java
// application.yml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20        # 每实例 20
      minimum-idle: 5
      connection-timeout: 3000
      idle-timeout: 600000
      max-lifetime: 1800000
\`\`\`

假设 10 个应用实例，每个 20 连接 = 200 客户端连接到 PgBouncer，PgBouncer 用 50 后端连 PostgreSQL。

## 29.8 Pgpool-II 对比

\`Pgpool-II\` 是另一个流行中间件，功能比 PgBouncer 多但更复杂：

| 特性 | PgBouncer | Pgpool-II |
| --- | --- | --- |
| **定位** | 轻量连接池 | 连接池 + 负载均衡 + 复制 |
| **语言** | C | C |
| **池化模式** | session/transaction/statement | session/transaction |
| **负载均衡** | 否（需配合 HAProxy） | 内置读负载均衡 |
| **自动故障切换** | 否 | 内置 |
| **读写分离** | 需应用层处理 | 内置 |
| **连接复用性能** | 极高（单进程异步） | 中等 |
| **配置复杂度** | 简单 | 复杂 |
| **资源占用** | 极低 | 较高 |

**选型建议**：

- 只需连接池 → **PgBouncer**（简单、轻量、高性能）
- 需要读写分离 + 自动 failover 但不想用 Patroni → **Pgpool-II**
- 生产推荐：**PgBouncer + Patroni + HAProxy** 组合（各司其职）

## 29.9 常见问题

### 29.9.1 transaction 模式下临时表丢失

\`\`\`sql
-- 错误用法
CREATE TEMP TABLE tmp AS SELECT ...;
-- 此时连接归还，下条语句可能换连接
SELECT * FROM tmp;  -- 报错：表不存在

-- 正确：在一个事务内使用
BEGIN;
CREATE TEMP TABLE tmp AS SELECT ...;
SELECT * FROM tmp;
COMMIT;
\`\`\`

### 29.9.2 prepared statement 报错

\`\`\`
ERROR:  prepared statement "stmt_1" does not exist
\`\`\`

transaction 模式下，PREPARE 后下一条 EXECUTE 可能换连接：

**解决方案**：

- JDBC：禁用 server-side prepared statement，\`prepareThreshold=0\`
- 或用 \`session\` 模式（牺牲池化）
- PG 14+ + PgBouncer 1.21+ 支持协议级 prepared statement 复用

### 29.9.3 SHOW 命令在事务中报错

\`\`\`
ERROR:  SHOW POOLS not allowed in transaction
\`\`\`

PgBouncer 的 admin 命令必须在事务外执行：

\`\`\`bash
# 不要 BEGIN; SHOW POOLS; COMMIT;
# 直接
psql -c "SHOW POOLS;"
\`\`\`

### 29.9.4 连接被 reset 报错

\`\`\`
ERROR:  server connection reset
\`\`\`

原因：DB 端断开了连接（重启、超时）。检查 \`server_lifetime\`、\`server_idle_timeout\` 与 DB 端配置一致性。

## 29.10 本章小结

- **连接池必要性**：PG fork 模型下连接贵，数百连接即压力，PgBouncer 让 1000 客户端复用 50 连接。
- **三种模式**：session（兼容）、transaction（推荐，OLTP）、statement（仅简单查询）。
- **配置**：\`pgbouncer.ini\` 核心 \`pool_mode\`/\`default_pool_size\`/\`max_client_conn\`。
- **认证**：\`userlist.txt\` 或 \`auth_query\` 查 PostgreSQL。
- **管理**：通过 \`pgbouncer\` 虚拟库执行 \`SHOW POOLS\`/\`RELOAD\`/\`PAUSE\`。
- **监控**：\`cl_waiting\`、\`maxwait\`、\`sv_active\` 是关键指标。
- **容量规划**：\`default_pool_size × db × user < max_connections\`。
- **vs Pgpool-II**：PgBouncer 轻量专注连接池，Pgpool-II 集成负载均衡与 failover。
- **生产组合**：PgBouncer + Patroni + HAProxy 是当前主流。

> 连接池解决了"连接太多"的问题，下一章我们看"数据太多"的方案——分区表。`
  },
  {
    id: "pg-ch30",
    group: "第五部分 架构与高可用",
    icon: "📊",
    title: "第 30 章 分区表",
    content: `# 第 30 章 分区表

当单表数据量达到千万、亿级，查询变慢、维护困难（VACUUM、索引重建耗时）。**分区表**把大表物理拆成多个小表（分区），逻辑上仍是一张表。PostgreSQL 10 引入**声明式分区**，原生支持 RANGE/LIST/HASH 三种方式。本章系统讲解分区的设计、使用与运维。

## 30.1 为什么需要分区

**单表痛点**（亿级数据）：

| 问题 | 表现 |
| --- | --- |
| **查询慢** | 即使有索引，B+树深度增加，缓存命中率下降 |
| **维护慢** | VACUUM、REINDEX、ALTER TABLE 耗时小时级 |
| **备份难** | 单表几十 GB，备份恢复慢 |
| **冷热混杂** | 历史数据与热数据混存，缓存被冷数据污染 |
| **删除难** | DELETE 大量历史数据产生海量死元组 |

**分区的好处**：

- **查询裁剪**（partition pruning）：只扫描相关分区
- **并行维护**：每个分区独立 VACUUM/REINDEX
- **冷热分离**：老分区移到慢盘，新分区留 SSD
- **快速删除**：\`DROP PARTITION\` 秒级，无死元组
- **增量索引**：新分区只建自己的索引

## 30.2 声明式分区类型

PG 10+ 原生支持三种分区方式：

| 类型 | 分区依据 | 典型场景 |
| --- | --- | --- |
| **RANGE** | 值的连续范围 | 时间序列（按月/日分区） |
| **LIST** | 离散值列表 | 按地区、租户 |
| **HASH** | 哈希取模 | 均匀打散，无明确维度 |

### 30.2.1 RANGE 分区（最常用）

\`\`\`sql
-- 创建父表
CREATE TABLE orders (
  id BIGSERIAL,
  order_no VARCHAR(32),
  user_id BIGINT,
  amount NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (id, created_at)   -- 分区键必须是主键/唯一约束的一部分
) PARTITION BY RANGE (created_at);

-- 创建月度分区
CREATE TABLE orders_2024_01 PARTITION OF orders
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE orders_2024_02 PARTITION OF orders
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

CREATE TABLE orders_2024_03 PARTITION OF orders
  FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

-- 默认分区（捕获不匹配任何分区的数据，可选）
CREATE TABLE orders_default PARTITION OF orders DEFAULT;
\`\`\`

> **关键**：RANGE 分区边界是"左闭右开"，\`FROM ('2024-01-01') TO ('2024-02-01')\` 包含 1 月 1 日，不包含 2 月 1 日。

**插入数据自动路由**：

\`\`\`sql
INSERT INTO orders (order_no, user_id, amount, created_at)
VALUES ('ORD001', 1001, 99.50, '2024-01-15 10:30:00+08');
-- 自动写入 orders_2024_01

INSERT INTO orders (order_no, user_id, amount, created_at)
VALUES ('ORD002', 1002, 199.00, '2024-02-20 14:00:00+08');
-- 自动写入 orders_2024_02
\`\`\`

**查询自动裁剪**：

\`\`\`sql
EXPLAIN SELECT * FROM orders WHERE created_at >= '2024-02-01' AND created_at < '2024-03-01';

-- 执行计划只扫描 orders_2024_02：
-- Append
--   ->  Seq Scan on orders_2024_02
--         Filter: (created_at >= '2024-02-01' AND created_at < '2024-03-01')
\`\`\`

### 30.2.2 LIST 分区

\`\`\`sql
CREATE TABLE users_by_region (
  id BIGSERIAL,
  name TEXT,
  region TEXT NOT NULL,
  PRIMARY KEY (id, region)
) PARTITION BY LIST (region);

CREATE TABLE users_bj PARTITION OF users_by_region
  FOR VALUES IN ('beijing');

CREATE TABLE users_sh PARTITION OF users_by_region
  FOR VALUES IN ('shanghai', 'hangzhou');

CREATE TABLE users_other PARTITION OF users_by_region DEFAULT;
\`\`\`

### 30.2.3 HASH 分区

\`\`\`sql
CREATE TABLE events_hashed (
  id BIGSERIAL,
  event_name TEXT,
  user_id BIGINT NOT NULL,
  payload JSONB
) PARTITION BY HASH (user_id);

-- 4 个分区
CREATE TABLE events_p0 PARTITION OF events_hashed
  FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE events_p1 PARTITION OF events_hashed
  FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE events_p2 PARTITION OF events_hashed
  FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE events_p3 PARTITION OF events_hashed
  FOR VALUES WITH (MODULUS 4, REMAINDER 3);
\`\`\`

> HASH 分区用 \`MODULUS\` 和 \`REMAINDER\` 指定：\`hash(key) % MODULUS == REMAINDER\`。MODULUS 一旦确定很难改，初期就要规划好分区数（建议 2 的幂）。

## 30.3 子分区（多级分区）

分区可以嵌套，比如先按月 RANGE，再按地区 LIST：

\`\`\`sql
CREATE TABLE orders_multi (
  id BIGSERIAL,
  region TEXT,
  amount NUMERIC,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (id, created_at, region)
) PARTITION BY RANGE (created_at);

-- 1 月分区，再按地区子分区
CREATE TABLE orders_2024_01 PARTITION OF orders_multi
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01')
  PARTITION BY LIST (region);

CREATE TABLE orders_2024_01_bj PARTITION OF orders_2024_01
  FOR VALUES IN ('beijing');

CREATE TABLE orders_2024_01_sh PARTITION OF orders_2024_01
  FOR VALUES IN ('shanghai');

-- 2 月同样结构...
\`\`\`

> 子分区层级不宜过深（一般 2 级），否则管理复杂、元数据膨胀。

## 30.4 分区上的索引与约束

### 30.4.1 在父表建索引，自动传播

\`\`\`sql
-- 在父表建索引，所有现有与未来分区自动创建
CREATE INDEX idx_orders_user ON orders (user_id);
CREATE INDEX idx_orders_amount ON orders (amount);

-- PG 11+ 自动给所有分区建同名索引
\`\`\`

> **PG 11+ 重大改进**：在父表建索引会自动给所有分区（包括将来 ATTACH 的）创建索引，无需手动建每个分区索引。这是声明式分区相比继承分区的关键优势。

### 30.4.2 唯一约束必须包含分区键

\`\`\`sql
-- 错误：唯一约束不含分区键
CREATE UNIQUE INDEX idx_orders_no ON orders (order_no);
-- ERROR: unique constraint on partitioned table must include all partitioning columns

-- 正确：含分区键 created_at
CREATE UNIQUE INDEX idx_orders_no_time ON orders (order_no, created_at);
\`\`\`

### 30.4.3 主键与外键

\`\`\`sql
-- 父表主键必须含分区键
CREATE TABLE orders (
  id BIGSERIAL,
  created_at TIMESTAMPTZ NOT NULL,
  ...
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- PG 12+ 支持分区表作为外键引用方
CREATE TABLE order_items (
  id BIGSERIAL,
  order_id BIGINT,
  order_created_at TIMESTAMPTZ,
  product_id BIGINT,
  FOREIGN KEY (order_id, order_created_at) REFERENCES orders (id, created_at)
);
\`\`\`

## 30.5 分区维护

### 30.5.1 ATTACH / DETACH 分区

\`\`\`sql
-- 1. 创建新分区表（独立）
CREATE TABLE orders_2024_04 (LIKE orders INCLUDING DEFAULTS INCLUDING CONSTRAINTS);

-- 2. 建索引（与父表索引一致）
CREATE INDEX idx_orders_2024_04_user ON orders_2024_04 (user_id);

-- 3. ATTACH 到父表（毫秒级，需短暂锁）
ALTER TABLE orders ATTACH PARTITION orders_2024_04
  FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');

-- DETACH：从父表移除（PG 14+ 支持 DETACH CONCURRENTLY 不阻塞）
ALTER TABLE orders DETACH PARTITION orders_2024_03;
ALTER TABLE orders DETACH PARTITION orders_2024_03 CONCURRENTLY;
\`\`\`

> **ATTACH 前准备**：新分区必须有与父表匹配的约束（或用 CHECK 验证），否则 ATTACH 会扫描全表确认数据范围。提前加 \`CHECK (created_at >= '2024-04-01' AND created_at < '2024-05-01')\` 可避免。

### 30.5.2 删除老分区

\`\`\`sql
-- 秒级删除整个分区（无死元组）
DROP TABLE orders_2023_01;

-- 或先 DETACH 保留数据，确认无问题后再 DROP
ALTER TABLE orders DETACH PARTITION orders_2023_01;
-- 一段时间后
DROP TABLE orders_2023_01;
\`\`\`

### 30.5.3 数据迁移：分区换表

把一张普通大表转为分区表：

\`\`\`sql
-- 1. 新建分区父表
CREATE TABLE orders_new (LIKE orders INCLUDING ALL)
  PARTITION BY RANGE (created_at);

-- 2. 创建分区
CREATE TABLE orders_new_2024_01 PARTITION OF orders_new
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
-- ...

-- 3. 迁移数据（分批）
INSERT INTO orders_new SELECT * FROM orders WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01';

-- 4. 切换表名（短暂锁）
BEGIN;
LOCK TABLE orders IN ACCESS EXCLUSIVE MODE;
ALTER TABLE orders RENAME TO orders_old;
ALTER TABLE orders_new RENAME TO orders;
COMMIT;

-- 5. 验证后删除旧表
DROP TABLE orders_old;
\`\`\`

## 30.6 分区裁剪（Partition Pruning）

分区裁剪是分区的核心收益：查询时只扫描相关分区。

### 30.6.1 静态裁剪

\`\`\`sql
-- WHERE 条件是常量，规划时即裁剪
EXPLAIN SELECT * FROM orders WHERE created_at = '2024-02-15';
-- 只扫描 orders_2024_02
\`\`\`

### 30.6.2 动态裁剪（PG 11+）

\`\`\`sql
-- WHERE 条件含参数，执行时才裁剪
PREPARE p AS SELECT * FROM orders WHERE created_at = $1;
EXPLAIN EXECUTE p('2024-02-15');
-- 执行计划含 Subplans Removed: 2，运行时裁剪
\`\`\`

### 30.6.3 不触发裁剪的场景

\`\`\`sql
-- 1. 函数包裹分区键（无法静态推导）
SELECT * FROM orders WHERE DATE(created_at) = '2024-02-15';
-- 不裁剪，扫描所有分区！

-- 改写为范围查询
SELECT * FROM orders 
WHERE created_at >= '2024-02-15' AND created_at < '2024-02-16';
-- 裁剪生效

-- 2. 类型不匹配
SELECT * FROM orders WHERE created_at = '2024-02-15'::text;
-- 可能不裁剪，确保类型一致
\`\`\`

> **关键**：分区键上的函数会破坏裁剪。永远用范围比较 \`>=\`、\`<\` 而非 \`DATE(x) = ...\`。

## 30.7 约束排除（Constraint Exclusion）

老式继承分区用 \`constraint_exclusion\` 参数控制，声明式分区用更高效的 \`partition pruning\`：

\`\`\`ini
# postgresql.conf
constraint_exclusion = partition
# off / on / partition（默认，仅对分区表启用）
\`\`\`

\`\`\`sql
-- 查看当前值
SHOW constraint_exclusion;
\`\`\`

| 模式 | 行为 |
| --- | --- |
| \`off\` | 不检查 CHECK 约束，扫描所有 |
| \`on\` | 所有表都检查（开销大，不推荐） |
| \`partition\`（默认） | 仅对继承/分区表检查 |

## 30.8 pg_partman 自动化分区

手动管理分区繁琐，\`pg_partman\` 扩展自动创建/维护分区。

### 30.8.1 安装与创建

\`\`\`sql
-- 安装扩展
CREATE EXTENSION pg_partman;

-- 创建按月自动分区的表
SELECT partman.create_parent(
  p_parent_table := 'public.orders',
  p_control := 'created_at',
  p_type := 'native',          -- 原生声明式分区
  p_interval := 'monthly',     -- 月分区
  p_premake := 4               -- 预创建未来 4 个月分区
);
\`\`\`

### 30.8.2 自动维护

\`\`\`sql
-- 配置自动运行（需在 postgresql.conf 设 shared_preload_libraries='pg_partman_bgw'）
SELECT partman.run_maintenance_proc();

-- 或用 cron 调度
-- SELECT cron.schedule('partman_maint', '0 * * * *', 'SELECT partman.run_maintenance_proc()');
\`\`\`

### 30.8.3 高级功能

\`\`\`sql
-- 配置老分区自动归档（转走或删除）
UPDATE partman.part_config
SET retention = '12 months',
    retention_keep_table = false   -- 到期 DROP 而非 DETACH
WHERE parent_table = 'public.orders';

-- 把老分区移到慢盘表空间
UPDATE partman.part_config
SET retention_schema = 'archive',
    retention_keep_table = true
WHERE parent_table = 'public.orders';

-- 默认每 1 小时运行一次维护
SELECT partman.run_maintenance_proc();
\`\`\`

> pg_partman 是 PG 生态最成熟的分区管理工具，支持 RANGE 时间/数字分区、自动预创建、过期归档、子分区模板。

## 30.9 分区表查询性能

### 30.9.1 何时分区有收益

- **单表 > 1000 万行**且查询有明确时间/地区维度
- **大量历史数据**，热数据占比小
- **需要批量删除老数据**（DROP PARTITION 比 DELETE 快几个量级）
- **并行维护**需求（VACUUM、REINDEX）

### 30.9.2 何时分区收益有限甚至变慢

- **查询不包含分区键**：扫描所有分区，反而更慢
- **小表**（< 100 万行）：分区开销 > 收益
- **高频小事务**跨分区：元数据开销
- **过多分区**：规划时间上升，元数据膨胀

**分区数上限建议**：

\`\`\`
- 单表分区数 < 1000：性能良好
- 1000 ~ 5000：规划时间明显上升
- > 5000：不推荐，需重构
\`\`\`

### 30.9.3 分区与并行查询

\`\`\`sql
-- PG 10+ 分区查询可并行
SET max_parallel_workers_per_gather = 4;

EXPLAIN SELECT count(*) FROM orders WHERE created_at >= '2024-01-01';
-- Append 下各分区可并行扫描

-- PG 11+ 进一步支持 Partition Wise Join
SET enable_partitionwise_join = on;
EXPLAIN SELECT * FROM orders o JOIN order_items oi ON o.id = oi.order_id;
-- 相同分区键的 join 可按分区并行
\`\`\`

## 30.10 实战案例：时序数据分区

### 30.10.1 表设计

\`\`\`sql
CREATE TABLE sensor_data (
  sensor_id INT NOT NULL,
  ts TIMESTAMPTZ NOT NULL,
  value NUMERIC,
  PRIMARY KEY (sensor_id, ts)
) PARTITION BY RANGE (ts);

-- 按天分区（高频写入场景）
CREATE TABLE sensor_data_2024_01_01 PARTITION OF sensor_data
  FOR VALUES FROM ('2024-01-01') TO ('2024-01-02');

-- 建索引
CREATE INDEX idx_sensor_id ON sensor_data (sensor_id);
CREATE INDEX idx_sensor_value ON sensor_data (value);
\`\`\`

### 30.10.2 自动化分区管理

\`\`\`sql
-- 用 pg_partman 按天分区
SELECT partman.create_parent(
  'public.sensor_data', 'ts', 'native', 'daily', p_premake := 7
);

-- 配置 30 天后归档
UPDATE partman.part_config
SET retention = '30 days',
    retention_keep_table = false,
    infinite_time_partitions = true
WHERE parent_table = 'public.sensor_data';
\`\`\`

### 30.10.3 典型查询

\`\`\`sql
-- 1. 最近 1 小时数据（裁剪到 1 个分区）
SELECT sensor_id, avg(value)
FROM sensor_data
WHERE ts >= now() - interval '1 hour'
GROUP BY sensor_id;

-- 2. 某传感器 7 天趋势（裁剪到 7 个分区）
SELECT date_trunc('hour', ts) AS hour, avg(value)
FROM sensor_data
WHERE sensor_id = 1001
  AND ts >= now() - interval '7 days'
GROUP BY hour
ORDER BY hour;

-- 3. 全表统计（无裁剪，可并行）
SELECT count(*) FROM sensor_data WHERE value > 100;
\`\`\`

### 30.10.4 老数据归档

\`\`\`sql
-- 把 1 个月前的分区移到归档表空间
ALTER TABLE sensor_data DETACH PARTITION sensor_data_2024_01_01;

-- 移到慢盘
ALTER TABLE sensor_data_2024_01_01 SET TABLESPACE cold_storage;

-- 或导出到对象存储后 DROP
pg_dump -t sensor_data_2024_01_01 | gzip > /archive/sensor_20240101.sql.gz
DROP TABLE sensor_data_2024_01_01;
\`\`\`

## 30.11 常见问题与陷阱

### 30.11.1 主键不含分区键

\`\`\`sql
-- 错误
CREATE TABLE orders (id BIGSERIAL PRIMARY KEY, created_at TIMESTAMPTZ)
  PARTITION BY RANGE (created_at);
-- ERROR: unique constraint on partitioned table must include all partitioning columns

-- 解决：主键含分区键
CREATE TABLE orders (id BIGSERIAL, created_at TIMESTAMPTZ NOT NULL, 
                     PRIMARY KEY (id, created_at))
  PARTITION BY RANGE (created_at);
\`\`\`

### 30.11.2 DEFAULT 分区陷阱

\`\`\`sql
-- DEFAULT 分区会捕获所有不匹配的数据
-- 问题：新增范围分区时，若 DEFAULT 中已有该范围数据，会报错
INSERT INTO orders (created_at) VALUES ('2025-01-01');
-- 进入 DEFAULT 分区

ALTER TABLE orders ATTACH PARTITION orders_2025_01
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
-- ERROR: updated partition constraint for default partition would be violated by some row

-- 解决：先把 DEFAULT 中相关数据迁出
\`\`\`

### 30.11.3 全局唯一序列

\`\`\`sql
-- 序列是全局的，不受分区影响
CREATE TABLE orders (id BIGSERIAL, ...) PARTITION BY RANGE (created_at);
-- id 在所有分区全局唯一（共享一个序列）
-- 但若用 identity 列也需注意：
\`\`\`

### 30.11.4 UPDATE 跨分区

\`\`\`sql
-- 更新分区键导致跨分区移动（PG 11+ 支持）
UPDATE orders SET created_at = '2024-02-15' WHERE id = 1001 AND created_at = '2024-01-15';
-- 实际：DELETE 旧分区行 + INSERT 新分区行
-- 开销大，建议避免频繁更新分区键
\`\`\`

### 30.11.5 分区数过多导致规划慢

\`\`\`sql
-- 查看分区数
SELECT count(*) FROM pg_inherits
WHERE inhparent = 'orders'::regclass;

-- 若 > 1000，考虑合并老分区或用 pg_partman 归档
\`\`\`

## 30.12 本章小结

- **分区价值**：查询裁剪、维护并行、快速删除、冷热分离。
- **三种类型**：RANGE（时间最常用）、LIST（离散值）、HASH（均匀打散）。
- **声明式分区**（PG 10+）：父表 \`PARTITION BY\` + 子分区 \`PARTITION OF\`。
- **主键约束**：必须包含分区键。
- **索引传播**：PG 11+ 父表建索引自动到所有分区。
- **ATTACH/DETACH**：在线增减分区，PG 14+ 支持 \`CONCURRENTLY\`。
- **分区裁剪**：核心收益，避免在分区键上用函数。
- **pg_partman**：自动化创建、归档、过期清理。
- **适用场景**：时序数据、日志、订单（按时间）；多租户（按地区）。
- **不适用**：小表、查询不带分区键、分区数过多。

> 分区让大表"小而治"，是 PostgreSQL 处理海量数据的关键工具。至此，第五部分"架构与高可用"完结，你已掌握从底层架构到分区表的完整运维体系。`
  }
];

export { chapters };
