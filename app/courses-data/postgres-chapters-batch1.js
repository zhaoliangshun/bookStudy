// =============================================================
// 《PostgreSQL 实战教程》- 章节批次 1
// -------------------------------------------------------------
// 内容：第一部分 入门与基础（第 1-6 章）
// =============================================================

const chapters = [
  {
    id: "pg-ch01",
    group: "第一部分 入门与基础",
    icon: "🐘",
    title: "第 1 章 PostgreSQL 简介与环境搭建",
    content: `# 第 1 章 PostgreSQL 简介与环境搭建

PostgreSQL（简称 PG）是全球最先进的开源关系型数据库之一，被誉为"开源界的 Oracle"。从初创公司到苹果、Instagram、Spotify 等顶级互联网企业都在大量使用。本章带你认识 PostgreSQL、了解它的架构与版本、搭建本地环境、写出第一条 SQL。

## 1.1 什么是 PostgreSQL

**PostgreSQL** 是一个**开源、对象关系型、客户端/服务器架构**的数据库管理系统（ORDBMS），由加州大学伯克利分校计算机科学系开发，1996 年发布第一个正式版本，现由全球开源社区维护。

它有四个核心标签：

- **开源免费**：PostgreSQL License（类似 BSD/MIT），可商用、可修改、可闭源分发，比 MySQL 的 GPL 协议更宽松
- **对象关系型**：不仅支持关系模型，还支持自定义类型、继承、函数、触发器等"对象"特性
- **C/S 架构**：服务端 \`postgres\` 守护进程长驻运行，客户端通过 TCP 协议连接（默认端口 5432）
- **ACID 兼容**：完整支持事务、外键、视图、触发器、存储过程

> 一句话总结：PostgreSQL 是一个"功能强大、标准严格、扩展性极强"的开源数据库，特别适合对数据一致性和复杂查询有高要求的场景。

**PostgreSQL 的核心组件**：

| 组件 | 作用 |
| --- | --- |
| \`postgres\` | 服务端主进程，负责所有数据操作与连接管理 |
| \`postmaster\` | 监听端口、接收连接、fork 出后台进程 |
| \`backend\` | 每个 client 连接对应一个 backend 进程 |
| \`WAL\`（Write-Ahead Log）| 预写日志，保证持久性与主从复制 |
| \`shared buffers\` | 共享内存缓冲池，缓存数据页 |
| \`bgwriter\` | 后台写进程，把脏页刷盘 |
| \`autovacuum\` | 自动清理死元组（MVCC 的垃圾回收） |
| \`checkpointer\` | 检查点进程，定期同步数据到磁盘 |

## 1.2 PostgreSQL 的版本演进

PostgreSQL 每年发布一个大版本，社区维护 5 年。生产环境**强烈推荐使用最新稳定版或上一个稳定版**。

| 版本 | 发布年份 | 关键特性 | 状态 |
| --- | --- | --- | --- |
| **12** | 2019 | 可插拔表存储、生成列、分区增强 | 已停止支持 |
| **13** | 2020 | 索引去重、B-tree 性能提升、并行 vacuum | 已停止支持 |
| **14** | 2021 | 连接池、JSON 语法增强、分区性能 | 已停止支持 |
| **15** | 2022 | 逻辑复制支持过滤、MERGE 语句、排序加速 | 维护中 |
| **16** | 2023 | 逻辑复制双向同步、并行查询增强、统计信息改进 | 维护中 |
| **17** | 2024 | 增量备份、SQL/JSON 路径增强、逻辑复制改进 | 当前稳定版 |

**近年重大升级亮点**：

1. **MERGE 语句**（15+）—— 标准 SQL 的 upsert，比 \`ON CONFLICT\` 更灵活
2. **逻辑复制增强**（14+）—— 支持过滤、并行、双向同步
3. **JSON 路径查询**（12+，持续增强）—— \`JSONB\` 配合 \`jsonb_path_query\` 强大无比
4. **分区表原生支持**（10+ 持续增强）—— 声明式分区，告别继承分区的繁琐
5. **连接池内置**（14+）—— \`pg_hba.conf\` 配置 \`connection pooling\`，减少进程开销

> 经验：新项目直接上 **16 或 17**。老项目从 11/12 升级时，重点检查 \`vacuum\` 行为变化、扩展插件兼容性（如 \`pg_stat_statements\`、\`PostGIS\`）。

## 1.3 PostgreSQL 架构概览

理解 PostgreSQL 的架构，对后续调优和排错至关重要。

### 进程模型

PostgreSQL 是**多进程架构**（不是多线程），每个连接对应一个独立的 backend 进程：

\`\`\`text
客户端 A ──TCP──> postmaster (5432)
                  ├── fork --> backend A (处理 A 的所有请求)
                  ├── fork --> backend B
                  ├── bgwriter (后台写)
                  ├── walwriter (WAL 写)
                  ├── checkpointer (检查点)
                  ├── autovacuum launcher (自动清理调度)
                  │   └── autovacuum worker (实际清理)
                  ├── stats collector (统计收集)
                  └── logical replication (逻辑复制)
\`\`\`

> 经验：因为每连接一进程，PG 默认 \`max_connections=100\`。高并发场景应配合 **连接池**（pgbouncer 或 PG 14+ 内置连接池），避免进程数爆炸。

### MVCC 多版本并发控制

PostgreSQL 的并发控制核心是 **MVCC**（Multi-Version Concurrency Control）：

- **读不阻塞写，写不阻塞读**：每个事务看到的是数据的某个"快照"
- **UPDATE = 标记旧版本 + 插入新版本**：旧版本叫"死元组"（dead tuple）
- **VACUUM 回收死元组**：\`autovacuum\` 自动执行，或手动 \`VACUUM\`
- **事务隔离级别**：默认 \`READ COMMITTED\`，可设 \`REPEATABLE READ\`、\`SERIALIZABLE\`

\`\`\`sql
-- 查看当前死元组情况
SELECT relname, n_dead_tup, n_live_tup
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC LIMIT 10;
\`\`\`

> 经验：MVCC 是 PG 的灵魂，但"死元组不清理"是大表性能杀手。生产环境务必监控 \`autovacuum\` 运行情况，必要时手动 \`VACUUM ANALYZE\`。

### 存储结构

\`\`\`text
PGDATA/
├── base/             -- 数据文件（每个数据库一个目录）
├── global/           -- 集群级元数据
├── pg_wal/           -- WAL 日志文件
├── pg_xact/          -- 事务提交状态
├── pg_log/           -- 服务器日志（看版本）
├── pg_stat/          -- 统计数据
├── pg_tblspc/        -- 表空间软链接
└── postgresql.conf   -- 主配置文件
\`\`\`

## 1.4 安装与配置（Docker / macOS / Linux）

### 方案一：Docker（最推荐，干净快捷）

\`\`\`bash
# 拉取 PostgreSQL 16 镜像
docker pull postgres:16

# 启动一个容器
docker run -d \\
  --name pg16 \\
  -p 5432:5432 \\
  -e POSTGRES_PASSWORD=123456 \\
  -e POSTGRES_DB=demo \\
  -e POSTGRES_USER=postgres \\
  -v /Users/yourname/pg-data:/var/lib/postgresql/data \\
  postgres:16

# 进入容器执行 psql
docker exec -it pg16 psql -U postgres -d demo
\`\`\`

**参数说明**：
- \`-p 5432:5432\`：把容器 5432 映射到宿主机
- \`-e POSTGRES_PASSWORD\`：设置 postgres 超级用户密码（必填）
- \`-e POSTGRES_DB=demo\`：启动时自动创建 demo 库
- \`-e POSTGRES_USER=postgres\`：超级用户名（默认就是 postgres）
- \`-v ...\`：把数据目录挂出来，容器删了数据还在

### 方案二：macOS（Homebrew / Postgres.app）

\`\`\`bash
# 用 Homebrew 安装
brew install postgresql@16

# 启动服务（后台常驻）
brew services start postgresql@16

# 首次登录（本机默认信任，无需密码）
psql postgres

# 设置 postgres 用户密码
\\\\password postgres
\`\`\`

macOS 还有图形化安装包 **Postgres.app**（https://postgresapp.com），下载拖入 Applications 即可，适合初学者。

### 方案三：Linux（Ubuntu/Debian apt）

\`\`\`bash
# 添加 PostgreSQL 官方源（获取最新版）
sudo sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt \$(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg

# 安装
sudo apt update
sudo apt install postgresql-16

# 启动 & 设置开机自启
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 切换到 postgres 用户登录
sudo -i -u postgres
psql
\`\`\`

> 踩坑：Ubuntu 装完默认 postgres 用户用 \`peer\` 认证（只能本机用 OS 用户切换登录）。应用连不上需改 \`pg_hba.conf\` 的认证方式为 \`md5\` 或 \`scram-sha-256\`。

### 方案四：Windows

1. 从官网下载 **EnterpriseDB** 安装包：https://www.postgresql.org/download/windows/
2. 安装时勾选 Stack Builder、pgAdmin
3. 安装完用 \`psql\` 或 **pgAdmin** 图形工具连接

## 1.5 连接 PostgreSQL（psql / GUI 工具）

### 命令行客户端 psql

\`\`\`bash
# 基本连接
psql -h 127.0.0.1 -p 5432 -U postgres -d demo

# 简写（本机 + 默认端口）
psql -U postgres demo

# 指定密码（不推荐明文，建议用 ~/.pgpass 文件）
PGPASSWORD=123456 psql -h 192.168.1.10 -U app -d shop

# 执行单条 SQL 后退出
psql -U postgres -d demo -c "SELECT version();"

# 执行 SQL 文件
psql -U postgres -d demo -f schema.sql

# 导出查询结果为 CSV
psql -U postgres -d demo -c "COPY (SELECT * FROM users) TO STDOUT WITH CSV HEADER" > users.csv
\`\`\`

**psql 常用元命令**（进入 psql 后）：

\`\`\`sql
\\l            -- 列出所有数据库
\\c demo       -- 连接到 demo 库
\\dt           -- 列出当前库的表
\\d users      -- 查看 users 表结构
\\du           -- 列出所有用户/角色
\\conninfo     -- 查看当前连接信息
\\x            -- 切换扩展显示（竖向）
\\timing       -- 开启 SQL 执行计时
\\q            -- 退出 psql
\\?            -- 查看所有元命令帮助
\\h SELECT     -- 查看 SELECT 语法帮助
\`\`\`

> psql 是 PG 最强工具，下一章会专门讲解。养成"先用 psql 看清楚结构，再用图形工具"的习惯。

### 主流 GUI 工具

| 工具 | 特点 | 适合 |
| --- | --- | --- |
| **pgAdmin** | 官方出品、免费、功能全 | PG 专用首选 |
| **DBeaver** | 免费、跨平台、支持几十种数据库 | 通用首选 |
| **TablePlus** | 轻量美观、Mac 友好 | 个人开发 |
| **DataGrip** | JetBrains 出品、智能 | 重度使用 |
| **Postico** | Mac 原生 PG 客户端 | Mac 用户 |

## 1.6 第一个数据库和表

让我们用经典的"用户-订单"场景，建立第一张表并插入数据。

\`\`\`sql
-- 1. 创建数据库
CREATE DATABASE demo
  WITH ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8';

-- 2. 连接到新数据库（在 psql 中执行）
-- \\c demo

-- 3. 创建用户表（使用 GENERATED ALWAYS AS IDENTITY，PG 10+ 推荐）
CREATE TABLE users (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL,
  email       VARCHAR(100) NOT NULL,
  age         SMALLINT DEFAULT NULL,
  status      SMALLINT NOT NULL DEFAULT 1,  -- 1正常 0禁用
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_users_email UNIQUE (email)
);

-- 4. 给表和字段加注释（PG 用 COMMENT ON）
COMMENT ON TABLE users IS '用户表';
COMMENT ON COLUMN users.id IS '主键，自增';
COMMENT ON COLUMN users.username IS '用户名';
COMMENT ON COLUMN users.email IS '邮箱，唯一';
COMMENT ON COLUMN users.age IS '年龄';
COMMENT ON COLUMN users.status IS '状态:1正常 0禁用';

-- 5. 插入数据
INSERT INTO users (username, email, age) VALUES
  ('alice', 'alice@example.com', 28),
  ('bob',   'bob@example.com',   34),
  ('carol', 'carol@example.com', 22);

-- 6. 查询
SELECT id, username, email, age FROM users;

-- 7. 看表结构
\\d users

-- 8. 看建表语句
-- pgAdmin 图形界面，或用 pg_dump 反向工程
\`\`\`

**关键字段解释**：
- \`BIGINT GENERATED ALWAYS AS IDENTITY\`：PG 标准的"标识列"自增，替代旧的 \`SERIAL\`/ \`BIGSERIAL\`
- \`TIMESTAMPTZ\`：带时区的时间戳，PG 推荐（比 \`TIMESTAMP\` 更安全）
- \`NOW()\`：当前时间函数，等价于 \`CURRENT_TIMESTAMP\`
- \`COMMENT ON\`：PG 单独的注释语法（不像 MySQL 内嵌在 CREATE TABLE 里）
- \`CONSTRAINT 名字 UNIQUE\`：显式命名约束，方便后续管理

> 经验：PG 中**字符串类型用 VARCHAR 还是 TEXT 没有性能差异**（三者底层都是 varlena）。这是 PG 和 MySQL 的重大区别。

## 1.7 踩坑提示

**坑 1：密码认证失败（pg_hba.conf）**
默认 PG 配置较严格，远程连接常报 \`password authentication failed\` 或 \`no pg_hba.conf entry\`。需修改 \`pg_data/pg_hba.conf\`：
\`\`\`text
# 类型  数据库  用户  地址          认证方式
host    all    all   0.0.0.0/0     scram-sha-256
\`\`\`
改完执行 \`SELECT pg_reload_conf();\` 重新加载。

**坑 2：大小写敏感**
PG 默认**大小写敏感**（除非用双引号包列名会变小写）：
\`\`\`sql
-- 这两个是不同的表（双引号强制保留大小写）
CREATE TABLE Users (id INT);     -- 实际创建为 users（小写）
CREATE TABLE "Users" (id INT);   -- 创建为 Users（保留大写）
\`\`\`
最佳实践：**永远用小写 + 下划线命名**，不要用双引号。

**坑 3：字符串引号**
PG 严格区分单双引号：
- 单引号 \`'\`：字符串字面量（\`'hello'\`）
- 双引号 \`"\`：标识符（表名、列名，仅在含特殊字符时用）
\`\`\`sql
SELECT 'hello';      -- 字符串
SELECT "hello";      -- 列名 hello（会报错 unless 该列存在）
\`\`\`

**坑 4：Docker 容器删了数据没了**
忘了挂 \`-v\` 卷就重启容器，数据全丢。务必挂载 \`/var/lib/postgresql/data\`。

**坑 5：IDENTITY vs SERIAL**
\`SERIAL\` 是 PG 老语法，本质是"序列 + 默认值"，存在权限和复制问题。10+ 推荐用 \`GENERATED ALWAYS AS IDENTITY\`，符合 SQL 标准，更安全。

**坑 6：PostgreSQL 没有 AUTO_INCREMENT**
从 MySQL 迁移时注意：PG 没有 \`AUTO_INCREMENT\` 关键字，必须用 \`SERIAL\`、\`BIGSERIAL\` 或 \`GENERATED ... AS IDENTITY\`。

## 1.8 本章小结

- PostgreSQL 是开源对象关系型数据库，C/S 架构，默认端口 5432，BSD 协议
- 新项目直接用 **16 或 17**，享受 MERGE、增强的逻辑复制、并行查询
- PG 是**多进程架构**，每连接一进程，高并发需配连接池
- **MVCC** 是 PG 并发核心，\`autovacuum\` 自动回收死元组，生产环境必须监控
- 本地开发首选 **Docker 安装**，生产环境用包管理器 + 配置文件
- 自增主键用 \`GENERATED ALWAYS AS IDENTITY\`（替代 SERIAL）
- 时间用 \`TIMESTAMPTZ\`（带时区），字符串 VARCHAR/TEXT 性能无差
- 远程连接需改 \`pg_hba.conf\`，认证推荐 \`scram-sha-256\`

下一章我们将系统学习 psql 客户端的各种元命令与技巧。`
  },

  {
    id: "pg-ch02",
    group: "第一部分 入门与基础",
    icon: "💻",
    title: "第 2 章 psql 客户端与基本操作",
    content: `# 第 2 章 psql 客户端与基本操作

psql 是 PostgreSQL 官方命令行客户端，功能强大到让很多老用户离不开它。本章系统讲透 psql 的元命令、格式化、脚本执行、帮助系统，让你像 DBA 一样高效操作 PostgreSQL。

## 2.1 psql 连接方式

### 基本连接语法

\`\`\`bash
psql [选项] [数据库名 [用户名]]

# 完整选项
psql -h 主机 -p 端口 -U 用户 -d 数据库

# 常用示例
psql -h 127.0.0.1 -p 5432 -U postgres -d demo
psql -U postgres demo                # 本机默认端口
psql postgres://postgres:123456@localhost:5432/demo  # URI 形式
\`\`\`

**常用连接选项**：

| 选项 | 含义 |
| --- | --- |
| \`-h\` | 主机名（默认 localhost） |
| \`-p\` | 端口（默认 5432） |
| \`-U\` | 用户名 |
| \`-d\` | 数据库名 |
| \`-W\` | 强制提示输入密码 |
| \`-c\` | 执行单条 SQL 后退出 |
| \`-f\` | 执行 SQL 文件后退出 |
| \`-1\` | 在单个事务中执行（-f 或 -c） |
| \`-v\` | 设置变量 |
| \`-A\` | 无边框对齐输出 |
| \`-t\` | 只打印数据行（无表头） |

### 用 ~/.pgpass 免密登录

\`\`\`bash
# 创建 ~/.pgpass 文件
# 格式：主机:端口:数据库:用户:密码
echo "localhost:5432:*:postgres:123456" >> ~/.pgpass
chmod 600 ~/.pgpass

# 之后直接连，不用输密码
psql -h localhost -U postgres -d demo
\`\`\`

> 经验：脚本和自动化任务用 \`~/.pgpass\` 比在命令行暴露密码安全得多。

### 用环境变量

\`\`\`bash
export PGHOST=localhost
export PGPORT=5432
export PGUSER=postgres
export PGDATABASE=demo
export PGPASSWORD=123456

# 之后直接 psql 就能连
psql
\`\`\`

## 2.2 核心元命令（\\ 开头）

psql 元命令以反斜杠 \`\\\` 开头，是 psql 独有的快捷操作。**元命令不需要分号结尾**。

### 数据库相关

\`\`\`sql
\\l                    -- 列出所有数据库
\\l+                   -- 详细信息（含大小、表空间）
\\l+ | grep demo       -- 配合管道过滤
\\c demo               -- 连接到 demo 数据库
\\c "host=remote user=app dbname=shop"  -- 用连接字符串切换
\\conninfo             -- 查看当前连接信息
\`\`\`

### 表与对象相关

\`\`\`sql
\\dt                   -- 列出当前库的表
\\dt+                  -- 含大小、描述
\\dt public.*          -- 列出 public schema 下的表
\\di                   -- 列出索引
\\dv                   -- 列出视图
\\ds                   -- 列出序列
\\df                   -- 列出函数
\\dn                   -- 列出 schema
\\du                   -- 列出角色/用户
\\dx                   -- 列出已安装的扩展
\\dB                   -- 列出表空间

\\d users              -- 查看 users 表结构（列、类型、约束、索引）
\\d+ users             -- 更详细（含描述、存储、统计）
\\d                    -- 列出所有表、视图、序列
\`\`\`

### 表结构详解示例

\`\`\`text
demo=# \\d users
                                          Table "public.users"
   Column   |          Type          | Collation | Nullable |             Default
------------+------------------------+-----------+----------+---------------------------------
 id         | bigint                 |           | not null | generated always as identity
 username   | character varying(50)  |           | not null |
 email      | character varying(100) |           | not null |
 age        | smallint               |           |          |
 status     | smallint               |           | not null | 1
 created_at | timestamp with time zone |         | not null | now()
Indexes:
    "users_pkey" PRIMARY KEY, btree (id)
    "uk_users_email" UNIQUE CONSTRAINT, btree (email)
\`\`\`

> 经验：\`\\d\` 是 psql 最高频命令，记住它。看到不熟悉的表，第一步永远是 \`\\d 表名\`。

## 2.3 信息显示与格式化

### 扩展显示 \\x

当列很多时，表格会被挤乱。用 \`\\x\` 切换"扩展显示"（每行变纵向展示）：

\`\`\`sql
\\x
SELECT * FROM users WHERE id = 1;
\`\`\`

输出变为：
\`\`\`text
-[ Record 1 ]---+---------------------
id          | 1
username    | alice
email       | alice@example.com
age         | 28
status      | 1
created_at  | 2024-01-15 10:23:45+08
\`\`\`

\`\\x\` 是开关，再输一次切回。也可 \`\\x auto\` 让 psql 自动判断。

### 计时 \\timing

\`\`\`sql
\\timing on            -- 开启执行计时
SELECT count(*) FROM big_table;
-- Time: 1234.567 ms

\\timing off           -- 关闭
\`\`\`

> 调优必备！开发时永远开着 \`\\timing\`，每条 SQL 都看耗时。

### 输出格式 \\pset

\`\`\`sql
\\pset border 0        -- 无边框
\\pset border 1        -- 内边框（默认）
\\pset border 2        -- 全边框
\\pset format aligned  -- 对齐（默认）
\\pset format html     -- HTML 表格
\\pset format csv      -- CSV 格式
\\pset format latex    -- LaTeX 表格
\\pset pager off       -- 关闭分页器
\\pset null 'NULL'     -- NULL 显示为字符串 NULL（默认是空）
\`\`\`

### 只输出数据 \\t 和 \\A

\`\`\`sql
\\t                    -- 只显示数据行（无表头、无行数统计）
\\A                    -- 无边框对齐（tab 分隔）

-- 组合：适合脚本处理
\\t \\A
SELECT id FROM users;
-- 输出：
-- 1
-- 2
-- 3
\`\`\`

### 输出到文件 \\o

\`\`\`sql
\\o /tmp/result.txt    -- 后续所有输出写到文件
SELECT * FROM users;
\\o                    -- 关闭，恢复 stdout
\`\`\`

## 2.4 执行 SQL 文件

### \\i 执行文件

\`\`\`sql
-- 在 psql 内执行
\\i /path/to/schema.sql

-- 多个文件
\\i 01_create_tables.sql
\\i 02_seed_data.sql
\`\`\`

### 命令行 -f 执行

\`\`\`bash
psql -U postgres -d demo -f schema.sql

# 出错即停
psql -U postgres -d demo -1 -f schema.sql   -- 在单事务中执行

# 显示每条 SQL
psql -U postgres -d demo -e -f schema.sql
\`\`\`

### \\\\echo 和 \\\\set 在脚本中

\`\`\`sql
-- schema.sql
\\\\echo '=== 创建 users 表 ==='
CREATE TABLE users (...);

\\\\echo '=== 插入初始数据 ==='
INSERT INTO users ...;

\\\\echo '完成！'
\`\`\`

## 2.5 变量与条件执行

### \\set 设置变量

\`\`\`sql
\\set table_name 'users'
SELECT * FROM :table_name LIMIT 5;

\\set limit 10
SELECT * FROM users LIMIT :limit;
\`\`\`

### 读取 SQL 结果到变量 \\\\gset

\`\`\`sql
-- 把查询结果存为变量
SELECT current_database() AS db_name \\\\gset
\\\\echo :db_name
-- 输出当前数据库名

-- 配合使用
SELECT max(id) AS max_id FROM users \\\\gset
SELECT * FROM users WHERE id > :max_id - 10;
\`\`\`

### 条件执行 \\\\if

\`\`\`sql
\\set table_exists false
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='users') AS table_exists \\\\gset

\\\\if :table_exists
  \\\\echo '表已存在，跳过创建'
\\\\else
  \\\\echo '创建表...'
  CREATE TABLE users (id INT, name TEXT);
\\\\endif
\`\`\`

> 这是 psql 13+ 新增的脚本编程能力，可在 SQL 文件里做流程控制。

## 2.6 帮助系统

### 元命令帮助 \\?

\`\`\`sql
\\?                    -- 查看所有元命令
\\? variables          -- 查看所有 psql 变量
\`\`\`

### SQL 语法帮助 \\h

\`\`\`sql
\\h                    -- 列出所有 SQL 命令分类
\\h SELECT             -- 查看 SELECT 语法
\\h CREATE TABLE       -- 查看 CREATE TABLE 语法
\\h INSERT             -- 查看 INSERT 语法
\`\`\`

输出示例：
\`\`\`text
Command:     CREATE TABLE
Description: define a new table
Syntax:
CREATE [ TEMPORARY | TEMP | UNLOGGED ] TABLE [ IF NOT EXISTS ] table_name ( [
  { column_name data_type [ STORAGE { PLAIN | EXTERNAL | EXTENDED | MAIN } ]
  [ COMPRESSION compression_method ] [ COLLATE collation ] [ column_constraint [ ... ] ]
  | table_constraint
  | LIKE source_table [ like_option ... ] }
  [, ... ]
] )
...
\`\`\`

> 经验：忘了语法直接 \`\\h 命令名\`，比翻文档快。这是 psql 内置的"官方文档"。

## 2.7 实用元命令速查表

| 命令 | 作用 |
| --- | --- |
| \\\\q | 退出 psql |
| \\\\l / \\\\l+ | 列出数据库 |
| \\\\c db | 切换数据库 |
| \\\\dt / \\\\dt+ | 列出表 |
| \\\\d name | 查看表/视图/索引结构 |
| \\\\du | 列出角色 |
| \\\\dx | 列出扩展 |
| \\\\df | 列出函数 |
| \\\\dv | 列出视图 |
| \\\\dn | 列出 schema |
| \\\\db | 列出表空间 |
| \\\\conninfo | 当前连接信息 |
| \\\\x | 切换扩展显示 |
| \\\\timing | 切换计时 |
| \\\\i file | 执行 SQL 文件 |
| \\\\o file | 输出到文件 |
| \\\\echo text | 打印文本 |
| \\\\set var val | 设置变量 |
| \\\\unset var | 删除变量 |
| \\\\pset opt val | 设置输出格式 |
| \\\\? | 元命令帮助 |
| \\\\h cmd | SQL 语法帮助 |
| \\\\! cmd | 执行 shell 命令 |
| \\\\cd dir | 切换目录 |
| \\\\encoding | 显示/设置编码 |
| \\\\password user | 修改用户密码 |
| \\\\copy | 客户端导入导出 |
| \\\\watch sec | 周期执行上一条 SQL |

## 2.8 COPY 与 \\\\copy 数据导入导出

### 服务器端 COPY（需超级用户或文件权限）

\`\`\`sql
-- 导出表数据到服务器文件
COPY users TO '/tmp/users.csv' WITH CSV HEADER;

-- 从文件导入
COPY users (username, email, age) FROM '/tmp/users.csv' WITH CSV HEADER;

-- 导出查询结果
COPY (SELECT username, email FROM users WHERE status=1) TO '/tmp/active.csv' WITH CSV HEADER;
\`\`\`

### 客户端 \\\\copy（普通用户可用，文件在客户端）

\`\`\`sql
-- 导出到本地（psql 运行的机器）
\\\\copy users TO '/tmp/users.csv' WITH CSV HEADER;

-- 从本地导入
\\\\copy users(username, email, age) FROM '/tmp/users.csv' WITH CSV HEADER;
\`\`\`

> 区别：\`COPY\` 是 SQL 命令，文件在**服务器**；\`\\\\copy\` 是 psql 元命令，文件在**客户端**。远程连接时只能用 \`\\\\copy\`。

## 2.9 \\\\watch 周期执行

\`\`\`sql
-- 每 2 秒执行一次，监控活动连接
SELECT pid, usename, application_name, state, query
FROM pg_stat_activity
WHERE state != 'idle';
\\\\watch 2
\`\`\`

\`\\\\watch\` 会循环执行上一条 SQL，按 Ctrl+C 退出。适合监控长查询、活动连接、复制延迟。

## 2.10 编辑器与历史

### \\e 调用编辑器

\`\`\`sql
\\e                    -- 编辑上一条查询
\\e users_query.sql    -- 编辑指定文件
\`\`\`

默认调 \`vi\`（或 \$EDITOR 环境变量），保存退出后执行。

### \\s 查看历史

\`\`\`sql
\\s                    -- 显示历史命令
\\s /tmp/psql_history  -- 保存到文件
\`\`\`

历史记录默认存在 \`~/.psql_history\`。

## 2.11 踩坑提示

**坑 1：元命令不要加分号**
\`\`\`sql
\\dt;       -- 错误！分号会被当成命令一部分报错
\\dt        -- 正确
\`\`\`

**坑 2：\\d 看不到序列**
\`\`\`sql
\\d users   -- 看表，但看不到独立的序列
\\ds        -- 单独看序列
\`\`\`

**坑 3：\\c 切换库后变量丢失**
\`\\c\` 会重置会话状态，包括事务、临时表、SET 变量。慎用。

**坑 4：COPY 文件权限**
\`COPY\` 是服务器端命令，文件必须 PG 服务进程可读写，且路径要允许（\`pg_read_server_files\` 角色）。

**坑 5：\\\\copy 与 COPY 字段映射**
\`\\\\copy\` 必须显式列出列名（如果不导全部列），否则 CSV 列顺序要对得上表定义。

**坑 6：扩展显示影响脚本**
\`\\x\` 开启后输出格式变化，脚本解析会失败。脚本里用 \`\\x off\` 显式关闭，或用 \`\\pset format csv\` + \`\\t\` + \`\\A\` 保证格式稳定。

## 2.12 本章小结

- psql 是 PG 最强客户端，老 DBA 离不开它
- 连接方式：\`-h -p -U -d\` 或 URI 或环境变量或 \`~/.pgpass\`
- 核心元命令：\`\\l \\c \\dt \\d \\du \\x \\timing \\conninfo \\q\`
- 格式化：\`\\x\` 扩展显示、\`\\pset\` 调格式、\`\\t \\A\` 纯数据输出
- 执行文件：\`\\i\` 或 \`psql -f\`，\`-1\` 单事务
- 变量：\`\\set\`、\`\\\\gset\`、\`\\\\if\` 实现脚本编程
- 帮助：\`\\?\` 看元命令，\`\\h\` 看 SQL 语法
- 数据导入导出：服务器 \`COPY\` vs 客户端 \`\\\\copy\`
- 监控：\`\\watch N\` 周期执行

下一章我们系统学习数据库、schema、表的 DDL 操作。`
  },

  {
    id: "pg-ch03",
    group: "第一部分 入门与基础",
    icon: "📋",
    title: "第 3 章 数据库与表的管理",
    content: `# 第 3 章 数据库与表的管理

第 1、2 章我们建了第一张表、熟悉了 psql。本章系统讲透 PostgreSQL 的**数据库、schema、表的 DDL 操作**：建库、schema 管理、建表、改表、删表、复制表。这些是后端开发每天都会写的 SQL。

## 3.1 数据库管理（CREATE/DROP DATABASE）

### 创建数据库

\`\`\`sql
-- 基本语法
CREATE DATABASE [IF NOT EXISTS] 库名
  [OWNER 用户名]
  [TEMPLATE 模板库]
  [ENCODING 编码]
  [LC_COLLATE 排序规则]
  [LC_CTYPE 字符分类]
  [TABLESPACE 表空间]
  [CONNECTION LIMIT 数量];

-- 推荐写法：明确编码和排序规则
CREATE DATABASE shop
  WITH ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8'
  TEMPLATE template0;

-- 指定所有者
CREATE DATABASE shop OWNER app_user;
\`\`\`

**关键参数说明**：

| 参数 | 说明 |
| --- | --- |
| \`OWNER\` | 数据库所有者（默认是创建者） |
| \`TEMPLATE\` | 模板库（默认 \`template1\`，纯净用 \`template0\`） |
| \`ENCODING\` | 字符集（推荐 \`UTF8\`） |
| \`LC_COLLATE\` | 排序规则（影响 ORDER BY 字符串顺序） |
| \`LC_CTYPE\` | 字符分类（影响大小写、字符类） |
| \`CONNECTION LIMIT\` | 最大连接数（-1 表示无限） |

> 踩坑：LC_COLLATE 一旦建库就**不能改**！中文场景常用 \`en_US.UTF-8\` 或 \`zh_CN.UTF-8\`。如果需要大小写敏感的精确排序，建库时选 \`C\`（按字节排序）。

### 模板库机制

PostgreSQL 用"模板库"复制新库：

\`\`\`sql
-- template0：纯净模板，不能改，用于跨编码建库
-- template1：默认模板，可改，新库默认从这里复制

-- 自定义模板（如建一个预装了扩展的模板库）
CREATE DATABASE my_template;
\\c my_template
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- 装扩展
\\c postgres
CREATE DATABASE new_db TEMPLATE my_template;  -- 新库自带 pgcrypto
\`\`\`

### 查看与切换

\`\`\`sql
-- psql 元命令
\\l                                  -- 看所有库
\\l+                                 -- 含大小

-- SQL 方式
SELECT datname, pg_encoding_to_char(encoding) AS encoding, owner
FROM pg_database
ORDER BY datname;

SELECT current_database();           -- 当前库名
\`\`\`

### 删除数据库

\`\`\`sql
-- 极度危险！库下所有对象都会一起删
DROP DATABASE IF EXISTS shop;

-- 如果还有连接，会报错。强制终止连接再删（PG 13+）
DROP DATABASE IF EXISTS shop WITH (FORCE);
\`\`\`

> 经验：生产环境永远不要手敲 \`DROP DATABASE\`。要删先备份，并且必须经过审批流程。\`WITH (FORCE)\` 会断开所有连接，慎用。

### 修改数据库

\`\`\`sql
-- 改名（库不能有活动连接）
ALTER DATABASE shop RENAME TO shop_v2;

-- 改所有者
ALTER DATABASE shop OWNER TO new_owner;

-- 改连接限制
ALTER DATABASE shop CONNECTION LIMIT 100;

-- 设置库级参数（影响所有新会话）
ALTER DATABASE shop SET work_mem = '64MB';
ALTER DATABASE shop SET log_min_duration_statement = 1000;
\`\`\`

## 3.2 Schema（模式）管理

PostgreSQL 的"数据库"下还有一层 **Schema**，这是 PG 和 MySQL 的重大区别。

### 什么是 Schema

\`\`\`text
PostgreSQL 集群
├── 数据库 A
│   ├── public schema       -- 默认 schema
│   ├── sales schema        -- 业务隔离
│   └── audit schema        -- 审计专用
└── 数据库 B
    └── public schema
\`\`\`

- 一个数据库下可有多个 schema
- 同库内 schema 之间共享连接、权限
- 用 schema 做"逻辑隔离"（多租户、模块化）

### 创建与管理 Schema

\`\`\`sql
-- 创建 schema
CREATE SCHEMA sales;
CREATE SCHEMA IF NOT EXISTS audit AUTHORIZATION app_user;

-- 在 schema 下建表
CREATE TABLE sales.orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  amount NUMERIC(10,2)
);

-- 完整引用：schema.table
SELECT * FROM sales.orders;

-- 设置搜索路径（默认查找哪些 schema）
SHOW search_path;                   -- 默认 "\$user", public
SET search_path TO sales, public;   -- 先找 sales 再找 public
SELECT * FROM orders;               -- 实际查 sales.orders
\`\`\`

### 删除 Schema

\`\`\`sql
-- 空 schema 才能删
DROP SCHEMA IF EXISTS audit;

-- 连同对象一起删（危险）
DROP SCHEMA IF EXISTS audit CASCADE;
\`\`\`

> 经验：多租户系统常用 schema 隔离——每个租户一个 schema，结构相同，权限独立。比"MySQL 一库一租户"省资源。

## 3.3 CREATE TABLE 完整语法

\`\`\`sql
CREATE TABLE [IF NOT EXISTS] [schema.]表名 (
  列名1 数据类型 [列级约束],
  列名2 数据类型 [列级约束],
  ...
  [表级约束],
  [LIKE 源表 [like选项]]
) [WITH (存储参数)];
\`\`\`

### 一个完整的例子

\`\`\`sql
CREATE TABLE orders (
  id            BIGINT GENERATED ALWAYS AS IDENTITY,
  order_no      VARCHAR(32)  NOT NULL,
  user_id       BIGINT       NOT NULL REFERENCES users(id),
  total_amount  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  status        SMALLINT     NOT NULL DEFAULT 0,
  paid_at       TIMESTAMPTZ  DEFAULT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id),
  UNIQUE (order_no),
  CHECK (total_amount >= 0),
  CHECK (status IN (0,1,2,3,4))
);

-- 表注释和列注释
COMMENT ON TABLE orders IS '订单表';
COMMENT ON COLUMN orders.status IS '状态:0待付款 1已付款 2已发货 3已完成 4已取消';

-- 创建索引（PG 索引不在 CREATE TABLE 里）
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status_created ON orders(status, created_at);

-- 自动维护 updated_at（需触发器）
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_updated
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
\`\`\`

**PG vs MySQL 建表差异**：

| 特性 | PostgreSQL | MySQL |
| --- | --- | --- |
| 自增 | \`GENERATED ALWAYS AS IDENTITY\` 或 \`SERIAL\` | \`AUTO_INCREMENT\` |
| 注释 | \`COMMENT ON\` 单独语句 | 内嵌 \`COMMENT '...'\` |
| 索引 | \`CREATE INDEX\` 单独语句 | 内嵌 \`KEY/INDEX\` |
| 字符集 | 库级设定，表不指定 | 表级 \`CHARSET=\` |
| 引擎 | 无可选（就一种） | \`ENGINE=InnoDB\` |
| 更新时间 | 需触发器 | \`ON UPDATE CURRENT_TIMESTAMP\` |
| 外键 | 支持 \`REFERENCES\` | 支持（但默认 MyISAM 不支持） |

> 经验：PG 的 \`updated_at\` 不会自动更新，必须用触发器（见上面例子）或应用层维护。这是从 MySQL 迁移最不习惯的一点。

### 临时表 TEMPORARY / TEMP

\`\`\`sql
-- 临时表只在当前会话可见，断开自动删
CREATE TEMP TABLE tmp_calc (
  user_id BIGINT,
  total NUMERIC(10,2)
);

-- 也可基于查询建临时表
CREATE TEMP TABLE tmp_active AS
  SELECT id, username FROM users WHERE status = 1;

-- ON COMMIT 选项（事务结束时行为）
CREATE TEMP TABLE tmp_x (id INT) ON COMMIT DROP;        -- 提交后删
CREATE TEMP TABLE tmp_y (id INT) ON COMMIT DELETE ROWS; -- 提交后清空
\`\`\`

> 临时表适合多步计算的中间结果暂存。PG 的临时表比 MySQL 强大——支持索引、约束、甚至可以 \`ON COMMIT\` 控制。

### UNLOGGED 表

\`\`\`sql
-- UNLOGGED 表不写 WAL，崩溃可能丢数据，但写入快 2-5 倍
CREATE UNLOGGED TABLE cache_data (
  key TEXT PRIMARY KEY,
  value JSONB,
  expires_at TIMESTAMPTZ
);
\`\`\`

适合缓存、临时数据、ETL 中间表。崩溃后 PG 会自动清空重建。

## 3.4 ALTER TABLE 修改表

表不会一成不变，业务迭代时经常要改结构。ALTER 是必备技能。

### 加列

\`\`\`sql
-- 加在最后（PG 不支持指定位置，没有 AFTER）
ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL;
ALTER TABLE users ADD COLUMN nickname VARCHAR(50) NOT NULL DEFAULT '';

-- 加多列
ALTER TABLE users
  ADD COLUMN province VARCHAR(20),
  ADD COLUMN city VARCHAR(20),
  ADD COLUMN address VARCHAR(200);
\`\`\`

> PG 不支持 \`AFTER xxx\` 控制列位置。要"改顺序"只能重建表。但**列顺序对应用透明**，不必纠结。

### 改列定义

\`\`\`sql
-- 改类型（可能需要 USING 转换）
ALTER TABLE users ALTER COLUMN phone TYPE VARCHAR(30);

-- 改类型 + 转换（如 VARCHAR 改 INTEGER）
ALTER TABLE users ALTER COLUMN age_str TYPE INTEGER USING age_str::INTEGER;

-- 改默认值
ALTER TABLE users ALTER COLUMN status SET DEFAULT 1;
ALTER TABLE users ALTER COLUMN status DROP DEFAULT;

-- 改可空性
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
\`\`\`

### 改列名

\`\`\`sql
-- PG 用 RENAME COLUMN，简单直接
ALTER TABLE users RENAME COLUMN phone TO mobile;
\`\`\`

### 删列

\`\`\`sql
ALTER TABLE users DROP COLUMN address;
ALTER TABLE users DROP COLUMN address, DROP COLUMN city;  -- 删多列
ALTER TABLE users DROP COLUMN address CASCADE;  -- 连带依赖对象一起删
\`\`\`

### 改表名

\`\`\`sql
ALTER TABLE old_users RENAME TO users;
\`\`\`

### 加 / 删约束

\`\`\`sql
-- 加约束（可命名）
ALTER TABLE users ADD CONSTRAINT uk_users_mobile UNIQUE (mobile);
ALTER TABLE users ADD CONSTRAINT chk_users_age CHECK (age >= 0 AND age <= 150);
ALTER TABLE users ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id);

-- 删约束（按名删）
ALTER TABLE users DROP CONSTRAINT uk_users_mobile;
ALTER TABLE users DROP CONSTRAINT uk_users_mobile CASCADE;
\`\`\`

> 经验：PG 的 ALTER TABLE 大部分操作**会锁表**！线上大表 ALTER 要用 \`pg_repack\` 或 \`CREATE INDEX CONCURRENTLY\`（仅索引）。

## 3.5 DROP / TRUNCATE / DELETE 区别

| 操作 | 作用 | 速度 | 序列 | 事务 | 触发器 | DDL/DML |
| --- | --- | --- | --- | --- | --- | --- |
| \`DELETE FROM t WHERE ...\` | 按条件删行 | 慢（逐行） | 保留 | 是 | 触发 | DML |
| \`TRUNCATE TABLE t\` | 清空整表 | 快（重建） | **默认重置** | 特殊* | 不触发 | DDL |
| \`DROP TABLE t\` | 删表（结构+数据） | 快 | 删 | 否 | - | DDL |

\`\`\`sql
-- DELETE：可带 WHERE，可回滚
BEGIN;
DELETE FROM users WHERE age < 18;
ROLLBACK;  -- 数据回来了

-- TRUNCATE：清空，快但默认不可回滚（除非在事务内）
TRUNCATE TABLE users;

-- TRUNCATE 在事务内可以回滚（PG 特性，MySQL 不行）
BEGIN;
TRUNCATE TABLE users;
ROLLBACK;  -- PG 数据回来了，MySQL 不行

-- TRUNCATE 选项
TRUNCATE TABLE users
  RESTART IDENTITY      -- 重置自增序列
  CASCADE;              -- 连带外键引用表一起清空

-- DROP：连表结构一起删
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS users CASCADE;  -- 连依赖对象一起删
\`\`\`

> 经验：清空表用 \`TRUNCATE\` 比 \`DELETE FROM t\` 快几个数量级。PG 的 \`TRUNCATE\` 在事务内**可以回滚**（这点比 MySQL 友好），但建议还是谨慎。

## 3.6 表的复制（CREATE TABLE LIKE / AS）

### 复制表结构（LIKE）

\`\`\`sql
-- LIKE 复制结构（不含数据）
-- 默认只复制列定义、NOT NULL，不复制索引、约束、默认值
CREATE TABLE users_backup (LIKE users);

-- 完整复制（含索引、约束、默认值、注释）
CREATE TABLE users_backup (LIKE users INCLUDING ALL);

-- 单独指定
CREATE TABLE users_backup (LIKE users
  INCLUDING DEFAULTS
  INCLUDING CONSTRAINTS
  INCLUDING INDEXES
  INCLUDING COMMENTS
);
\`\`\`

**INCLUDING 选项**：

| 选项 | 复制内容 |
| --- | --- |
| \`DEFAULTS\` | 默认值表达式 |
| \`CONSTRAINTS\` | CHECK 约束（不含主键、唯一） |
| \`IDENTITY\` | 标识列（自增） |
| \`INDEXES\` | 索引、唯一约束、主键 |
| \`COMMENTS\` | 列/表注释 |
| \`STATISTICS\` | 统计信息 |
| \`STORAGE\` | 存储策略 |
| \`ALL\` | 以上全部 |

### 复制表结构 + 数据（AS SELECT）

\`\`\`sql
-- 复制全部
CREATE TABLE users_2024 AS SELECT * FROM users;

-- 复制部分列
CREATE TABLE users_simple AS
  SELECT id, username, email FROM users;

-- 只复制结构（用 WHERE FALSE 不插数据）
CREATE TABLE users_empty AS SELECT * FROM users WHERE FALSE;

-- 配合 LIKE + INSERT
CREATE TABLE users_backup (LIKE users INCLUDING ALL);
INSERT INTO users_backup SELECT * FROM users;
\`\`\`

> 注意：\`AS SELECT\` 方式**不会复制索引、约束、注释、默认值**。需要完整复制用 \`LIKE INCLUDING ALL\` + \`INSERT INTO ... SELECT\`。

### 把查询结果插入已有表

\`\`\`sql
INSERT INTO users_backup (username, email, age)
SELECT username, email, age FROM users WHERE status = 1;
\`\`\`

## 3.7 命名约定

PostgreSQL 推荐命名规范：

| 对象 | 约定 | 示例 |
| --- | --- | --- |
| 表名 | 小写 + 下划线，复数或单数均可 | \`users\`、\`order_items\` |
| 列名 | 小写 + 下划线 | \`user_id\`、\`created_at\` |
| 索引 | \`idx_表_列\` 或 \`idx_表_用途\` | \`idx_users_email\` |
| 唯一约束 | \`uk_表_列\` | \`uk_users_email\` |
| 外键 | \`fk_从表_主表\` | \`fk_orders_users\` |
| 主键 | \`表_pkey\`（PG 自动生成） | \`users_pkey\` |
| 检查约束 | \`chk_表_描述\` | \`chk_users_age\` |
| 序列 | \`表_列_seq\`（PG 自动生成） | \`users_id_seq\` |
| 触发器 | \`trg_表_动作\` | \`trg_users_updated\` |
| 函数 | 小写 + 下划线，动词开头 | \`calc_total()\` |

**避免的命名**：
- 保留字（\`order\`、\`user\`、\`type\`、\`desc\`、\`key\`）
- 大写字母（PG 默认转小写，用双引号才保留，混乱）
- 中文（兼容性问题）
- 数字开头

## 3.8 踩坑提示

**坑 1：列名大小写**

\`\`\`sql
-- 这两个是同一张表（PG 默认转小写）
CREATE TABLE Users (ID INT, Name TEXT);
-- 实际创建为 users (id INT, name TEXT)

-- 双引号强制保留大小写（混乱之源）
CREATE TABLE "Users" ("ID" INT, "Name" TEXT);
SELECT * FROM Users;        -- 报错，找不到 Users 表
SELECT * FROM "Users";      -- 必须"双引号"
\`\`\`
最佳实践：**永远用小写 + 下划线**，不用双引号。

**坑 2：改列类型锁表**
\`\`\`sql
-- 1000 万行表改 VARCHAR 长度（变长），PG 也要全表重写
ALTER TABLE big_table ALTER COLUMN name TYPE VARCHAR(200);
\`\`\`
变长类型改长通常 OK，但**改类型本身（如 VARCHAR→INTEGER）必然锁表全表重写**。线上用 \`pg_repack\` 或建新表迁数据。

**坑 3：IDENTITY 列迁移**
从 SERIAL 改 IDENTITY 较复杂，新表直接用 IDENTITY。已有 SERIAL 表不必强改。

**坑 4：CASCADE 删约束的连锁反应**
\`\`\`sql
ALTER TABLE users DROP CONSTRAINT users_pkey CASCADE;
-- 会连带删除所有依赖主键的索引、外键！
\`\`\`
\`CASCADE\` 是把双刃剑，删之前先 \`\\d 表名\` 看依赖。

**坑 5：CREATE TABLE AS SELECT 不复制约束**
新手常以为复制了表就万事大吉，结果发现主键没了、唯一约束没了。务必用 \`LIKE INCLUDING ALL\` 复制结构，再 \`INSERT ... SELECT\` 插数据。

**坑 6：TRUNCATE 与外键**
\`\`\`sql
-- orders 引用 users，直接 TRUNCATE users 会失败
TRUNCATE users;
-- ERROR: cannot truncate a table referenced in a foreign-key constraint

-- 用 CASCADE 连带清空（危险）
TRUNCATE users CASCADE;  -- orders 也被清空！
\`\`\`

## 3.9 本章小结

- 建库需指定 \`ENCODING\`、\`LC_COLLATE\`，建后不可改
- PG 有 **schema 层**，用 \`search_path\` 控制查找顺序
- 自增用 \`GENERATED ALWAYS AS IDENTITY\`（替代 SERIAL）
- 注释用 \`COMMENT ON\`，索引用 \`CREATE INDEX\`，外键用 \`REFERENCES\`
- \`updated_at\` 自动维护需触发器（PG 没有 \`ON UPDATE\`）
- 临时表 \`TEMP\`，缓存表 \`UNLOGGED\`
- \`ALTER TABLE\` 改列用 \`ALTER COLUMN\`，改类型可能锁表
- \`DELETE\` 慢但安全可回滚，\`TRUNCATE\` 快且 PG 中可事务回滚
- 复制表用 \`LIKE INCLUDING ALL\` + \`INSERT SELECT\`
- 命名一律小写 + 下划线，避免保留字和双引号

下一章我们深入学习 PostgreSQL 的丰富数据类型。`
  },

  {
    id: "pg-ch04",
    group: "第一部分 入门与基础",
    icon: "🔢",
    title: "第 4 章 数据类型详解",
    content: `# 第 4 章 数据类型详解

PostgreSQL 拥有所有数据库中**最丰富的数据类型**——从数值、文本、时间，到 UUID、JSONB、数组、范围、地理、自定义类型。这是 PG 相比 MySQL 最大的优势之一。本章系统讲透常用类型与选型。

## 4.1 数值类型

### 整数类型

| 类型 | 字节 | 范围 | 用途 |
| --- | --- | --- | --- |
| \`SMALLINT\` / \`INT2\` | 2 | -32768~32767 | 小计数、状态 |
| \`INTEGER\` / \`INT\` / \`INT4\` | 4 | ±21亿 | 通用整数 |
| \`BIGINT\` / \`INT8\` | 8 | ±922亿亿 | 主键、大计数 |
| \`SERIAL\` | 4 | 同 INT | 自增（旧语法） |
| \`BIGSERIAL\` | 8 | 同 BIGINT | 自增（旧语法） |

\`\`\`sql
CREATE TABLE num_demo (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  age       SMALLINT,              -- 年龄用 SMALLINT 够用
  view_count INTEGER DEFAULT 0,   -- 通用计数
  total_count BIGINT DEFAULT 0    -- 大计数
);

-- SERAIL 旧语法（仍可用，但推荐 IDENTITY）
CREATE TABLE old_style (
  id SERIAL PRIMARY KEY,         -- 等价于 INTEGER + 序列 + 默认值
  bid BIGSERIAL PRIMARY KEY      -- 等价于 BIGINT + 序列 + 默认值
);
\`\`\`

> **PG 没有 UNSIGNED**！需要无符号请用 CHECK 约束：\`CHECK (col >= 0)\`。

### 序列与 IDENTITY

\`\`\`sql
-- IDENTITY 列（PG 10+ 推荐）
CREATE TABLE t1 (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
  -- ALWAYS: 永远由 PG 生成，插入指定值会报错（除非 OVERRIDING SYSTEM VALUE）
);

CREATE TABLE t2 (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY
  -- BY DEFAULT: 默认生成，但可手动指定值
);

-- 查看序列当前值
SELECT * FROM t1_id_seq;

-- 手动设置序列值
SELECT setval('t1_id_seq', 1000);

-- 重置序列（如 TRUNCATE 后）
TRUNCATE t1 RESTART IDENTITY;
\`\`\`

**IDENTITY vs SERIAL 区别**：

| 维度 | GENERATED AS IDENTITY | SERIAL |
| --- | --- | --- |
| 标准 | SQL 标准 | PG 扩展 |
| 序列归属 | 表的内部对象 | 独立序列对象 |
| 删表行为 | 序列一起删 | 序列可能残留 |
| 权限 | 跟随表 | 序列需单独授权 |
| 复制 | 兼容性好 | 可能有坑 |

> 经验：新表一律用 \`GENERATED ALWAYS AS IDENTITY\`。

### 定点数 NUMERIC / DECIMAL

\`\`\`sql
-- NUMERIC(precision, scale)
-- precision: 总位数, scale: 小数位数
CREATE TABLE products (
  price NUMERIC(10,2) NOT NULL,    -- 总 10 位，小数 2 位
  weight NUMERIC(6,3)               -- 总 6 位，小数 3 位
);

-- NUMERIC 不限精度（无限精度）
CREATE TABLE sci_data (
  value NUMERIC                     -- 任意精度
);

-- 计算精确
SELECT 0.1::NUMERIC + 0.2::NUMERIC;  -- 0.3（精确）
SELECT 0.1::FLOAT8 + 0.2::FLOAT8;    -- 0.30000000000000004（不精确）
\`\`\`

**NUMERIC vs DECIMAL**：PG 中两者完全等价。

### 浮点数 FLOAT / DOUBLE

| 类型 | 字节 | 精度 | 别名 |
| --- | --- | --- | --- |
| \`REAL\` | 4 | 6 位十进制 | \`FLOAT4\`、\`FLOAT(p<=24)\` |
| \`DOUBLE PRECISION\` | 8 | 15 位十进制 | \`FLOAT8\`、\`FLOAT(p>=25)\` |

> 经验：**金额必须用 NUMERIC**，禁用 FLOAT。FLOAT 是浮点数，\`0.1+0.2 != 0.3\`。NUMERIC 是精确十进制。

### 货币类型 MONEY

\`\`\`sql
-- MONEY：8 字节，带区域货币符号
CREATE TABLE accounts (balance MONEY);
INSERT INTO accounts VALUES (1234.56);
-- 显示受 lc_monetary 影响，如 "$1,234.56"
\`\`\`

不推荐用 MONEY，建议用 \`NUMERIC(10,2)\` + 应用层格式化。

## 4.2 文本类型

| 类型 | 说明 |
| --- | --- |
| \`CHAR(n)\` / \`CHARACTER(n)\` | 定长，不足补空格 |
| \`VARCHAR(n)\` / \`CHARACTER VARYING(n)\` | 可变长，有上限 |
| \`VARCHAR\` / \`TEXT\` | 可变长，无上限（实际 1GB） |

\`\`\`sql
CREATE TABLE str_demo (
  code CHAR(6) NOT NULL,          -- 验证码 6 位定长
  username VARCHAR(50) NOT NULL,  -- 用户名
  bio TEXT,                       -- 简介（不限长）
  content TEXT                    -- 文章正文
);
\`\`\`

**PG 重大特性：VARCHAR、TEXT 性能完全相同**！三者底层都用 varlena 存储，没有性能差异。区别仅在是否做长度检查。

> 经验：PG 中**统一用 TEXT 或 VARCHAR 无长度限制**即可，长度校验放应用层。这是 PG 和 MySQL 最大区别——MySQL 中 VARCHAR/TEXT 性能不同。

### 字符串引号

\`\`\`sql
-- 单引号：字符串字面量
SELECT 'hello';
SELECT 'it''s me';              -- 转义单引号用两个
SELECT E'it\\'s me';             -- E'' 转义字符串

-- 双引号：标识符（表名、列名）
SELECT "username" FROM users;   -- 列名 username
\`\`\`

## 4.3 日期时间类型

| 类型 | 字节 | 范围 | 用途 |
| --- | --- | --- | --- |
| \`DATE\` | 4 | 4713 BC~5874896 AD | 仅日期 |
| \`TIME\` / \`TIME WITHOUT TIME ZONE\` | 8 | 一天内 | 仅时间 |
| \`TIMETZ\` / \`TIME WITH TIME ZONE\` | 12 | 一天内 | 带时区时间 |
| \`TIMESTAMP\` | 8 | 4713 BC~294276 AD | 日期+时间 |
| \`TIMESTAMPTZ\` | 8 | 4713 BC~294276 AD | 带时区时间戳 |
| \`INTERVAL\` | 16 | ±178000000 年 | 时间间隔 |

\`\`\`sql
CREATE TABLE time_demo (
  birthday DATE,
  work_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  login_ts TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 插入
INSERT INTO time_demo (birthday, work_time) VALUES
  ('1990-05-20', '09:00:00'),
  (DATE '1985-11-03', TIME '18:30:00');
\`\`\`

### TIMESTAMP vs TIMESTAMPTZ

这是 PG 时间类型的**关键选择**：

\`\`\`sql
-- TIMESTAMP：不带时区，存什么读什么
CREATE TABLE t1 (ts TIMESTAMP);
INSERT INTO t1 VALUES ('2024-01-01 12:00:00');
-- 不管会话时区怎么变，读出来都是 12:00:00

-- TIMESTAMPTZ：带时区，存储为 UTC，读取按会话时区显示
CREATE TABLE t2 (ts TIMESTAMPTZ);
INSERT INTO t2 VALUES ('2024-01-01 12:00:00+08');
SET timezone = 'Asia/Shanghai';
SELECT ts FROM t2;  -- 2024-01-01 12:00:00+08
SET timezone = 'UTC';
SELECT ts FROM t2;  -- 2024-01-01 04:00:00+00
\`\`\`

| 维度 | TIMESTAMP | TIMESTAMPTZ |
| --- | --- | --- |
| 存储 | 输入原样 | 转 UTC 存储 |
| 读取 | 原样返回 | 按会话时区转换 |
| 适用 | 与时区无关（如生日） | 与时区相关（创建时间、订单时间） |

> 经验：**业务时间一律用 TIMESTAMPTZ**（创建时间、更新时间、订单时间）。只有"与时区无关"的日期（如生日）用 DATE 或 TIMESTAMP。

### INTERVAL 时间间隔

PG 独有的强大类型，表示一段时间：

\`\`\`sql
-- 字面量
SELECT INTERVAL '1 day';
SELECT INTERVAL '1 year 2 months 3 days 4 hours';
SELECT INTERVAL '30 minutes';

-- 运算
SELECT NOW() + INTERVAL '7 days';           -- 一周后
SELECT NOW() - INTERVAL '1 month';          -- 一个月前
SELECT age(TIMESTAMP '2000-01-01', NOW());  -- 计算年龄

-- 提取
SELECT EXTRACT(YEAR FROM INTERVAL '1 year 2 months');  -- 1
\`\`\`

### 时间函数

\`\`\`sql
-- 当前
SELECT NOW(), CURRENT_TIMESTAMP, CURRENT_DATE, CURRENT_TIME;

-- 提取部分
SELECT EXTRACT(YEAR FROM NOW());
SELECT EXTRACT(MONTH FROM created_at) FROM orders;
SELECT date_part('hour', NOW());
SELECT date_trunc('month', NOW());  -- 截断到月初

-- 格式化
SELECT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS');
SELECT to_timestamp('2024-01-15 10:30:00', 'YYYY-MM-DD HH24:MI:SS');

-- 计算
SELECT NOW() - created_at AS elapsed FROM orders;
SELECT date_add(NOW(), INTERVAL '1 day');  -- PG 13+
\`\`\`

## 4.4 布尔类型 BOOLEAN

\`\`\`sql
CREATE TABLE bool_demo (
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

-- PG 真正的 BOOLEAN（MySQL 没有，用 TINYINT(1) 模拟）
INSERT INTO bool_demo VALUES (TRUE, FALSE);
INSERT INTO bool_demo VALUES ('t', 'f');     -- 文本表示
INSERT INTO bool_demo VALUES (1, 0);          -- 数字（会转）

-- 布尔字面量
TRUE / FALSE / NULL
't' / 'f' / 'true' / 'false' / 'yes' / 'no' / 'y' / 'n'
\`\`\`

## 4.5 UUID 类型

\`\`\`sql
-- 需要扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id BIGINT NOT NULL,
  token TEXT
);

INSERT INTO sessions (user_id) VALUES (1);
-- id 自动生成如 "550e8400-e29b-41d4-a716-446655440000"
\`\`\`

PG 13+ 也可用 \`gen_random_uuid()\`（pgcrypto 扩展或 PG 13 内置）：
\`\`\`sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
SELECT gen_random_uuid();
\`\`\`

> 经验：分布式系统主键首选 UUID（避免自增 ID 的冲突问题）。但 UUID 索引性能略差于 BIGINT，可考虑 UUIDv7（时序有序）。

## 4.6 JSON 与 JSONB（PG 杀手锏）

PostgreSQL 的 **JSONB** 是行业标杆，存储为解析后的二进制，支持索引、高效查询。

| 类型 | 说明 |
| --- | --- |
| \`JSON\` | 原始文本存储，保留输入格式（空格、顺序、重复键） |
| \`JSONB\` | 二进制存储，去重键、不保留空格，**支持索引、更快** |

\`\`\`sql
CREATE TABLE events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100),
  data JSONB
);

INSERT INTO events (name, data) VALUES
  ('login', '{"user_id": 1, "ip": "1.2.3.4", "device": "mobile"}'),
  ('purchase', '{"user_id": 2, "amount": 99.5, "items": ["a","b"]}');

-- 提取字段（-> 返回 JSONB，->> 返回 TEXT）
SELECT name, data->'user_id' AS uid, data->>'ip' AS ip FROM events;

-- 按字段查询
SELECT * FROM events WHERE data->>'user_id' = '1';

-- 包含查询（@>）
SELECT * FROM events WHERE data @> '{"user_id": 1}';

-- 修改
UPDATE events SET data = data || '{"ip":"5.6.7.8"}'::JSONB WHERE id = 1;
UPDATE events SET data = jsonb_set(data, '{device}', '"desktop"') WHERE id = 1;
UPDATE events SET data = data - 'ip' WHERE id = 1;  -- 删键
\`\`\`

### JSONB 索引（GIN）

\`\`\`sql
-- 建 GIN 索引，让 JSONB 查询飞起来
CREATE INDEX idx_events_data ON events USING GIN (data);

-- 现在查询飞快
SELECT * FROM events WHERE data @> '{"user_id": 1}';
SELECT * FROM events WHERE data ? 'ip';  -- 是否有 ip 键
\`\`\`

> 经验：JSONB 适合存"半结构化"数据（配置、扩展属性、日志），配合 GIN 索引可高效查询。但**经常查的字段应拆出来做正常列**。

### JSON 路径查询（PG 12+）

\`\`\`sql
-- SQL/JSON 路径语言
SELECT jsonb_path_query(data, '$.user_id') FROM events;
SELECT * FROM events WHERE jsonb_path_exists(data, '$.user_id ? (@ == 1)');

-- 复杂路径
SELECT jsonb_path_query('[{"a":1},{"a":2}]'::JSONB, '$[*].a');
\`\`\`

## 4.7 枚举类型 ENUM

\`\`\`sql
-- 自定义枚举类型
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'done', 'canceled');

CREATE TABLE orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  status order_status NOT NULL DEFAULT 'pending'
);

INSERT INTO orders (status) VALUES ('paid');
INSERT INTO orders (status) VALUES ('unknown');  -- 报错

-- 增加枚举值（需 ALTER TYPE）
ALTER TYPE order_status ADD VALUE 'refunded' AFTER 'done';
-- 注意：ALTER TYPE ADD VALUE 不能在事务块内执行

-- 重命名枚举值（PG 10+）
ALTER TYPE order_status RENAME VALUE 'pending' TO 'unpaid';
\`\`\`

> 经验：PG 的 ENUM 比 MySQL 灵活，但仍不推荐多用。改用 \`TEXT\` + CHECK 约束，或 \`SMALLINT\` + 业务层映射，更易扩展。

## 4.8 数组类型（PG 独有）

PostgreSQL 支持**数组类型**，这是 MySQL 完全没有的特性：

\`\`\`sql
CREATE TABLE posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT,
  tags TEXT[]                  -- 文本数组
);

INSERT INTO posts (title, tags) VALUES
  ('PG 入门', ARRAY['db','postgres','tutorial']),
  ('MySQL 入门', ARRAY['db','mysql']),
  ('Java 基础', '{"java","basic"}');     -- 字面量语法

-- 查询
SELECT title, tags FROM posts;

-- 数组包含（@>）
SELECT * FROM posts WHERE tags @> ARRAY['postgres'];

-- 数组元素（ANY）
SELECT * FROM posts WHERE 'postgres' = ANY(tags);

-- 数组操作
SELECT array_length(tags, 1) FROM posts;          -- 数组长度
SELECT tags[1] FROM posts;                        -- 第一个元素（PG 数组从 1 开始！）
SELECT unnest(tags) FROM posts WHERE id = 1;      -- 展开为多行
SELECT array_agg(tag) FROM (SELECT unnest(tags) tag FROM posts) t;  -- 聚合回数组
\`\`\`

> 经验：数组适合"标签"、"多选值"。但**关系数据应建关联表**，数组不利于 JOIN 和外键约束。

## 4.9 其他类型

### BYTEA 二进制

\`\`\`sql
-- 存二进制（图片、文件）
CREATE TABLE files (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT,
  content BYTEA
);

INSERT INTO files (name, content) VALUES ('test', '\\\\x' || encode('hello','hex'));
SELECT encode(content, 'escape') FROM files;
\`\`\`

> 经验：大文件不建议存数据库，用对象存储 + DB 存 URL。

### 范围类型（PG 独有）

\`\`\`sql
-- 内置范围类型
SELECT int4range(1, 10);         -- [1, 10)
SELECT daterange('2024-01-01'::DATE, '2024-12-31'::DATE);
SELECT tstzrange('2024-01-01'::TIMESTAMPTZ, '2024-12-31'::TIMESTAMPTZ);

-- 应用：预订系统（防时间冲突）
CREATE TABLE bookings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id INT,
  during tstzrange,
  EXCLUDE USING GIST (room_id WITH =, during WITH &&)  -- 防重叠约束
);

INSERT INTO bookings (room_id, during) VALUES
  (1, tstzrange('2024-01-01 10:00', '2024-01-01 12:00'));
INSERT INTO bookings (room_id, during) VALUES
  (1, tstzrange('2024-01-01 11:00', '2024-01-01 13:00'));  -- 报错！时间冲突
\`\`\`

### 位图类型 BIT

\`\`\`sql
CREATE TABLE flags (
  status BIT(3)          -- 固定 3 位
);
INSERT INTO flags VALUES (B'101');
\`\`\`

## 4.10 类型转换

PG 用 \`::\` 做类型转换（SQL 标准是 \`CAST(x AS type)\`）：

\`\`\`sql
SELECT '123'::INTEGER;
SELECT 123::TEXT;
SELECT NOW()::DATE;
SELECT '2024-01-01'::TIMESTAMPTZ;

-- 等价标准语法
SELECT CAST('123' AS INTEGER);

-- 函数语法
SELECT to_char(1234.56, 'FM9999.00');
SELECT to_number('1234.56', '9999.99');
SELECT to_date('2024-01-15', 'YYYY-MM-DD');
\`\`\`

## 4.11 类型选择建议

| 业务场景 | 推荐类型 |
| --- | --- |
| 主键 | \`BIGINT GENERATED ALWAYS AS IDENTITY\` 或 \`UUID\` |
| 状态/类型 | \`SMALLINT\` + 业务枚举 或 \`TEXT\` + CHECK |
| 金额 | \`NUMERIC(10,2)\` 或更大 |
| 用户名/标题 | \`TEXT\` 或 \`VARCHAR(N)\` |
| 文章正文 | \`TEXT\` |
| 创建/更新时间 | \`TIMESTAMPTZ\` |
| 是/否 | \`BOOLEAN\` |
| 半结构化扩展字段 | \`JSONB\` + GIN 索引 |
| 标签 | 关联表 或 \`TEXT[]\` |
| 分布式 ID | \`UUID\`（v7 更佳） |
| IP 地址 | \`INET\`（PG 内置） |

**选型三原则**：
1. **够用就好**：年龄用 SMALLINT 不用 BIGINT，省空间
2. **精确优先**：钱用 NUMERIC，时间用 TIMESTAMPTZ
3. **未来扩展**：主键用 BIGINT，TEXT 留余量

## 4.12 踩坑提示

**坑 1：VARCHAR/TEXT 长度**
PG 中 \`VARCHAR(100)\` 和 \`TEXT\` 性能无差，长度限制只是约束。不必纠结长度。

**坑 2：TIMESTAMP 没时区**
用 \`TIMESTAMP\` 存"创建时间"，国际化时所有时间都"原样"显示，混乱。一律用 \`TIMESTAMPTZ\`。

**坑 3：SERIAL 残留序列**
\`SERIAL\` 删表后序列可能残留（PG 9.1 之前）。用 IDENTITY 避免。

**坑 4：JSON vs JSONB**
\`JSON\` 不支持索引、查询慢。生产用 \`JSONB\`。

**坑 5：数组索引从 1 开始**
\`\`\`sql
SELECT tags[0] FROM posts;  -- NULL！PG 数组从 1 开始
SELECT tags[1] FROM posts;  -- 第一个元素
\`\`\`

**坑 6：ENUM 不能删值**
\`ALTER TYPE\` 只能加值、改名，**不能删值**。要删需重建类型。

**坑 7：NUMERIC 计算慢**
NUMERIC 精确但比 DOUBLE 慢。统计展示可先转 DOUBLE。

## 4.13 本章小结

- 整数按范围选，主键用 \`BIGINT GENERATED ALWAYS AS IDENTITY\`
- 金额必用 \`NUMERIC\`，禁用 FLOAT
- **VARCHAR / TEXT 性能无差**，统一用 TEXT 即可（PG 优势）
- 时间一律用 \`TIMESTAMPTZ\`，配 \`INTERVAL\` 做运算
- JSONB 是 PG 杀手锏，配 GIN 索引高效查询半结构化数据
- UUID 适合分布式主键，PG 内置 \`gen_random_uuid()\`
- 数组类型适合标签，但关系数据用关联表
- 类型转换用 \`::\` 简洁语法
- 选型三原则：够用、精确、可扩展

下一章讲数据增删改查 CRUD，把 DML 操作彻底搞透。`
  },

  {
    id: "pg-ch05",
    group: "第一部分 入门与基础",
    icon: "✏️",
    title: "第 5 章 数据增删改查 CRUD",
    content: `# 第 5 章 数据增删改查 CRUD

CRUD（Create/Read/Update/Delete）是后端开发每天写最多的 SQL。本章讲透 PostgreSQL 的 INSERT、SELECT、UPDATE、DELETE，以及 PG 独有的 \`RETURNING\` 子句和 \`ON CONFLICT\` UPSERT。

## 5.1 INSERT 插入

### 单行插入

\`\`\`sql
-- 推荐写法：明确列出列名
INSERT INTO users (username, email, age)
VALUES ('alice', 'alice@example.com', 28);

-- 不推荐：省略列名，依赖表定义顺序，结构一改就崩
INSERT INTO users VALUES (DEFAULT, 'alice', 'alice@example.com', 28, 1, NOW());

-- 用 DEFAULT 关键字显式取默认值
INSERT INTO users (id, username, email, status)
VALUES (DEFAULT, 'alice', 'alice@example.com', DEFAULT);
\`\`\`

### 多行批量插入

\`\`\`sql
INSERT INTO users (username, email, age) VALUES
  ('alice', 'alice@example.com', 28),
  ('bob',   'bob@example.com',   34),
  ('carol', 'carol@example.com', 22);
\`\`\`

> **性能要点**：批量插入比循环单条快 10-100 倍。每条 INSERT 都是一次事务往返，批量只需一次。批量大小建议 500-1000 行一批。

### INSERT ... RETURNING（PG 独有神器）

PostgreSQL 独有的 \`RETURNING\` 子句，让 INSERT 直接返回插入的数据，省去二次 SELECT：

\`\`\`sql
-- 插入并返回自动生成的 id
INSERT INTO users (username, email, age)
VALUES ('dave', 'dave@example.com', 40)
RETURNING id, username, created_at;

-- 返回所有列
INSERT INTO users (username, email)
VALUES ('eve', 'eve@example.com')
RETURNING *;

-- 批量插入返回所有生成的 id
INSERT INTO users (username, email) VALUES
  ('frank', 'frank@example.com'),
  ('grace', 'grace@example.com')
RETURNING id, username;
\`\`\`

> 经验：\`RETURNING\` 是 PG 杀手特性！MySQL 8.0 才支持 \`INSERT ... RETURNING\`（实际是 MariaDB 先支持）。应用层拿到自增 ID 不用再查一次。

### 插入查询结果

\`\`\`sql
-- 把活跃用户复制到 users_active 表
INSERT INTO users_active (username, email)
SELECT username, email FROM users WHERE status = 1;

-- 去重插入
INSERT INTO users_dedup (username, email)
SELECT DISTINCT username, email FROM users;
\`\`\`

### INSERT ... ON CONFLICT（UPSERT）

PG 的 UPSERT 神器，比 MySQL 的 \`ON DUPLICATE KEY UPDATE\` 更优雅、更标准：

\`\`\`sql
-- 冲突时什么都不做
INSERT INTO users (id, username, email)
VALUES (1, 'alice', 'alice@new.com')
ON CONFLICT (id) DO NOTHING;

-- 冲突时更新
INSERT INTO users (id, username, email, age)
VALUES (1, 'alice', 'alice@new.com', 29)
ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      age = EXCLUDED.age;

-- 冲突时更新（用 EXCLUDED 引用待插入的行）
INSERT INTO users (username, email, age)
VALUES ('alice', 'alice@new.com', 29)
ON CONFLICT (email) DO UPDATE
  SET age = EXCLUDED.age,
      updated_at = NOW();

-- 按约束名指定冲突目标
INSERT INTO users (username, email)
VALUES ('alice', 'alice@new.com')
ON CONFLICT ON CONSTRAINT uk_users_email DO UPDATE
  SET username = EXCLUDED.username;
\`\`\`

**EXCLUDED 关键字**：表示"本应插入但因冲突被排除的行"，等价于 MySQL 的 \`VALUES()\` 函数。

### 经典应用：计数器

\`\`\`sql
CREATE TABLE daily_stats (
  user_id BIGINT,
  stat_date DATE,
  visit_count INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, stat_date)
);

-- 第一次插入，后续累加
INSERT INTO daily_stats (user_id, stat_date, visit_count)
VALUES (1, '2024-01-01', 1)
ON CONFLICT (user_id, stat_date) DO UPDATE
  SET visit_count = daily_stats.visit_count + EXCLUDED.visit_count;
\`\`\`

### ON CONFLICT 三种粒度

\`\`\`sql
-- 1. 指定列冲突
ON CONFLICT (email) DO ...

-- 2. 指定约束名冲突
ON CONFLICT ON CONSTRAINT uk_users_email DO ...

-- 3. 任意冲突都处理（不指定目标）
ON CONFLICT DO NOTHING
ON CONFLICT DO UPDATE SET ...
\`\`\`

## 5.2 SELECT 查询

### 基本语法

\`\`\`sql
SELECT
  [DISTINCT]              -- 去重
  列1, 列2, ...           -- 选择列
FROM 表名
[WHERE 条件]              -- 过滤行
[GROUP BY 列]            -- 分组
[HAVING 条件]            -- 分组后过滤
[ORDER BY 列 [ASC|DESC]] -- 排序
[LIMIT N [OFFSET M]]     -- 分页
[FOR UPDATE]             -- 行锁
;
\`\`\`

**执行顺序**：\`FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT\`

### 选择列

\`\`\`sql
-- 选择所有列（生产环境避免 *，效率低且耦合）
SELECT * FROM users;

-- 选择指定列（推荐）
SELECT id, username, email FROM users;

-- 列别名（AS 可省略）
SELECT username AS name, email AS mail FROM users;
SELECT username name, email mail FROM users;

-- 表别名
SELECT u.id, u.username FROM users u;
\`\`\`

### WHERE 条件过滤

\`\`\`sql
-- 比较运算符
SELECT * FROM products WHERE price = 99.9;
SELECT * FROM products WHERE price != 99.9;
SELECT * FROM products WHERE price > 100;
SELECT * FROM products WHERE price BETWEEN 100 AND 500;

-- 逻辑运算符（AND / OR / NOT）
SELECT * FROM users WHERE age >= 18 AND status = 1;
SELECT * FROM users WHERE age < 18 OR age > 65;
SELECT * FROM users WHERE NOT (age < 18);

-- IN / NOT IN
SELECT * FROM users WHERE city IN ('北京','上海','广州');
SELECT * FROM users WHERE city NOT IN ('北京','上海');

-- BETWEEN（闭区间）
SELECT * FROM orders WHERE created_at BETWEEN '2024-01-01' AND '2024-01-31';

-- IS NULL / IS NOT NULL（PG 严格区分）
SELECT * FROM users WHERE age IS NULL;
SELECT * FROM users WHERE age IS NOT NULL;
\`\`\`

### DISTINCT 去重

\`\`\`sql
SELECT DISTINCT city FROM users;
SELECT DISTINCT province, city FROM users;     -- 多列组合去重
SELECT COUNT(DISTINCT city) FROM users;        -- 去重计数
\`\`\`

### LIKE 与 ILIKE

\`\`\`sql
-- LIKE 大小写敏感
SELECT * FROM users WHERE username LIKE 'ali%';
SELECT * FROM users WHERE username LIKE '%ce';
SELECT * FROM users WHERE username LIKE '_lice';

-- ILIKE 大小写不敏感（PG 独有）
SELECT * FROM users WHERE username ILIKE 'ALI%';

-- SIMILAR TO（正则增强）
SELECT * FROM users WHERE username SIMILAR TO '(ali|bob)%';

-- ~ 正则匹配（PG 独有，强推！）
SELECT * FROM users WHERE username ~ '^ali';       -- 以 ali 开头
SELECT * FROM users WHERE username ~ 'ce$';        -- 以 ce 结尾
SELECT * FROM users WHERE username ~ '[0-9]+';     -- 包含数字
-- ~* 不区分大小写，!~ 不匹配
\`\`\`

> 经验：PG 的 \`~\` 正则比 \`LIKE\` 强大得多，复杂匹配用正则。但**正则不走索引**，大数据量仍需建专门索引（\`text_pattern_ops\` 或 trigram）。

### ORDER BY 排序

\`\`\`sql
-- 升序（默认）
SELECT * FROM users ORDER BY age ASC;

-- 降序
SELECT * FROM users ORDER BY age DESC;

-- 多列排序
SELECT * FROM users ORDER BY status DESC, age ASC;

-- 用列别名
SELECT username, age * 2 AS double_age FROM users ORDER BY double_age DESC;

-- NULL 处理（PG 独有语法）
SELECT * FROM users ORDER BY age ASC NULLS FIRST;   -- NULL 在前
SELECT * FROM users ORDER BY age ASC NULLS LAST;    -- NULL 在后
\`\`\`

> 经验：PG 默认 \`NULLS LAST\`（升序）或 \`NULLS FIRST\`（降序）。可显式 \`NULLS FIRST/LAST\` 控制。

### LIMIT / OFFSET / FETCH

\`\`\`sql
-- 取前 10 条
SELECT * FROM users LIMIT 10;

-- 取第 21-30 条
SELECT * FROM users LIMIT 10 OFFSET 20;

-- SQL 标准语法（PG 推荐）
SELECT * FROM users ORDER BY id FETCH FIRST 10 ROWS ONLY;
SELECT * FROM users ORDER BY id OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY;
\`\`\`

### 深分页问题

\`\`\`sql
-- 第 10000 页（OFFSET = 99990）很慢
SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 99990;
\`\`\`

PG 要**扫描并丢弃前 99990 条**，越往后越慢。优化方法：

\`\`\`sql
-- 方法 1：游标分页（基于主键）
SELECT * FROM users WHERE id > 99990 ORDER BY id LIMIT 10;

-- 方法 2：子查询 + 主键定位
SELECT * FROM users
WHERE id IN (
  SELECT id FROM users ORDER BY id LIMIT 10 OFFSET 99990
)
ORDER BY id;
\`\`\`

### FOR UPDATE 行锁

\`\`\`sql
-- 查询并加行锁，防止并发修改（如扣库存）
BEGIN;
SELECT * FROM products WHERE id = 1 FOR UPDATE;
-- 应用层计算后更新
UPDATE products SET stock = stock - 1 WHERE id = 1;
COMMIT;

-- FOR UPDATE 行为
SELECT * FROM orders WHERE status=0 FOR UPDATE;          -- 锁行
SELECT * FROM orders WHERE status=0 FOR UPDATE NOWAIT;   -- 锁不住立即报错
SELECT * FROM orders WHERE status=0 FOR UPDATE SKIP LOCKED;  -- 跳过已锁行
\`\`\`

> \`SKIP LOCKED\` 是 PG 独有特性，做任务队列、并发消费的神器。

## 5.3 UPDATE 更新

### 单表更新

\`\`\`sql
-- 改单条
UPDATE users SET age = 29 WHERE id = 1;

-- 改多列
UPDATE users SET age = 29, status = 1 WHERE id = 1;

-- 用表达式
UPDATE products SET price = price * 1.1 WHERE category = '电子';

-- 用 CASE 分情况
UPDATE products SET price = CASE
  WHEN price < 100 THEN price * 1.1
  WHEN price < 1000 THEN price * 1.05
  ELSE price
END;

-- 用子查询
UPDATE users SET city = (
  SELECT city FROM user_profiles WHERE user_profiles.user_id = users.id
) WHERE city IS NULL;
\`\`\`

### UPDATE ... RETURNING

\`\`\`sql
-- 更新并返回更新后的行（PG 独有）
UPDATE users SET age = 30 WHERE id = 1
RETURNING id, username, age;

-- 扣库存并返回剩余库存
UPDATE products SET stock = stock - 1 WHERE id = 1
RETURNING stock;

-- 应用层判断：如果 stock < 0 则回滚
\`\`\`

### UPDATE FROM（PG 跨表更新）

\`\`\`sql
-- 用另一张表的值更新（PG 语法）
UPDATE orders o
SET status = 4
FROM users u
WHERE o.user_id = u.id AND u.status = 0;
-- 用户被禁用，订单标记取消

-- 把每个用户的订单数回填到 users 表
UPDATE users u
SET order_count = sub.cnt
FROM (SELECT user_id, COUNT(*) AS cnt FROM orders GROUP BY user_id) sub
WHERE u.id = sub.user_id;
\`\`\`

> 经验：PG 的 \`UPDATE ... FROM\` 比 MySQL 的 \`UPDATE ... JOIN\` 语义更清晰（PG 不允许目标表出现在 FROM 中重复）。

## 5.4 DELETE 删除

### 单表删除

\`\`\`sql
-- 删单条
DELETE FROM users WHERE id = 1;

-- 删多条
DELETE FROM users WHERE age < 18;

-- 删全部（保留表结构，PG 中 IDENTITY 序列保留）
DELETE FROM users;
\`\`\`

### DELETE ... RETURNING

\`\`\`sql
-- 删除并返回被删的行（PG 独有）
DELETE FROM users WHERE status = 0
RETURNING id, username;

-- 应用层拿被删用户做后续清理（如删关联数据）
\`\`\`

### DELETE USING（PG 跨表删除）

\`\`\`sql
-- 删用户的同时删其订单（需配合外键 ON DELETE CASCADE，或显式删）
DELETE FROM orders
USING users
WHERE orders.user_id = users.id AND users.status = 0;
\`\`\`

### 用 LIMIT 限制删除量（PG 语法不同）

PG 不支持 \`DELETE ... LIMIT\`，需用子查询：

\`\`\`sql
-- 每次只删 1000 条，避免大事务
DELETE FROM logs
WHERE id IN (
  SELECT id FROM logs WHERE created_at < '2024-01-01' LIMIT 1000
);
\`\`\`

> 经验：删大表数据**分批删**，每次 1000-5000 条 + 短暂停顿。一次删百万行会撑爆 WAL、锁表、复制延迟。

## 5.5 UPSERT 完整指南

\`\`ON CONFLICT\` 是 PG 标准的 UPSERT，前面已介绍，这里再深入：

### 三种冲突处理

\`\`\`sql
-- 1. DO NOTHING：忽略
INSERT INTO users (id, username, email)
VALUES (1, 'alice', 'alice@new.com')
ON CONFLICT (id) DO NOTHING;

-- 2. DO UPDATE：更新
INSERT INTO users (id, username, email, age)
VALUES (1, 'alice', 'alice@new.com', 29)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  age = EXCLUDED.age;

-- 3. DO UPDATE + WHERE 条件：仅特定情况更新
INSERT INTO users (id, username, email, version)
VALUES (1, 'alice', 'alice@new.com', 2)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  version = EXCLUDED.version
WHERE users.version < EXCLUDED.version;  -- 乐观锁
\`\`\`

### 多列冲突目标

\`\`\`sql
-- 复合唯一约束
CREATE TABLE daily_stats (
  user_id BIGINT,
  stat_date DATE,
  visit_count INT DEFAULT 0,
  PRIMARY KEY (user_id, stat_date)
);

INSERT INTO daily_stats (user_id, stat_date, visit_count)
VALUES (1, '2024-01-01', 1)
ON CONFLICT (user_id, stat_date) DO UPDATE
  SET visit_count = daily_stats.visit_count + EXCLUDED.visit_count;
\`\`\`

## 5.6 CRUD 事务安全

\`\`\`sql
-- 开启事务
BEGIN;

-- 一组操作
UPDATE accounts SET balance = balance - 100 WHERE user_id = 1;
UPDATE accounts SET balance = balance + 100 WHERE user_id = 2;

-- 检查无误后提交
COMMIT;

-- 出错回滚
-- ROLLBACK;
\`\`\`

### SAVEPOINT 部分回滚

\`\`\`sql
BEGIN;
INSERT INTO orders (user_id, amount) VALUES (1, 100);
SAVEPOINT sp1;
INSERT INTO order_items (order_id, product_id) VALUES (1, 999);  -- 假设失败
ROLLBACK TO sp1;  -- 只回滚到 sp1，前面的 INSERT 保留
INSERT INTO order_items (order_id, product_id) VALUES (1, 100);
COMMIT;
\`\`\`

## 5.7 踩坑提示

**坑 1：忘加 WHERE 全表更新/删除**
\`\`\`sql
-- 灾难！全员年龄变 30
UPDATE users SET age = 30;

-- 灾难！全表删除
DELETE FROM users;
\`\`\`
防护：操作前先 \`SELECT\` 确认；重要操作开事务 \`BEGIN\`，确认无误再 \`COMMIT\`。

**坑 2：UPDATE 大事务锁表**
\`\`\`sql
-- 1000 万行表一次性更新，事务超大、WAL 暴涨
UPDATE big_table SET col = col + 1 WHERE status = 0;
\`\`\`
分批更新：
\`\`\`sql
UPDATE big_table SET col = col + 1
WHERE id IN (SELECT id FROM big_table WHERE status = 0 LIMIT 1000);
\`\`\`

**坑 3：DELETE 不释放空间**
PG 的 \`DELETE\` 只是标记死元组，**不会缩小表文件**。要回收空间：
\`\`\`sql
VACUUM big_table;            -- 标记空间可复用（不归还 OS）
VACUUM FULL big_table;       -- 重建表，归还空间（锁表！）
-- 或用 pg_repack 在线重建
\`\`\`

**坑 4：RETURNING 误用**
\`\`\`sql
-- RETURNING 是返回"操作后"的数据
DELETE FROM users WHERE id = 1 RETURNING *;
-- 返回被删的行（删之前的数据）

UPDATE users SET age = 30 RETURNING age;
-- 返回更新后的 age（30，不是旧值）
\`\`\`

**坑 5：ON CONFLICT 必须有唯一约束**
\`\`\`sql
-- 没有 UNIQUE/PRIMARY KEY 的列不能用 ON CONFLICT
CREATE TABLE t (id INT, name TEXT);
INSERT INTO t VALUES (1,'a')
ON CONFLICT (id) DO NOTHING;  -- 报错：没有 id 的唯一约束

-- 必须先加约束
ALTER TABLE t ADD CONSTRAINT pk_t PRIMARY KEY (id);
\`\`\`

**坑 6：批量 INSERT 太大导致超时**
单条 INSERT 太大（如 10 万行）会让事务过大、WAL 暴涨、可能超时。建议每批 500-1000 行。

**坑 7：SELECT FOR UPDATE 锁范围**
\`\`\`sql
-- 锁住查询到的行
SELECT * FROM orders WHERE status=0 FOR UPDATE;
-- 如果没 LIMIT，可能锁住几百万行，长事务阻塞其他操作
\`\`\`
配合 \`LIMIT\` 或 \`SKIP LOCKED\` 控制锁范围。

## 5.8 综合示例：电商订单流程

\`\`\`sql
-- 1. 用户下单（事务）
BEGIN;

-- 扣库存（FOR UPDATE 锁行，防超卖）
SELECT stock FROM products WHERE id = 100 FOR UPDATE;
-- 应用层判断 stock >= 1
UPDATE products SET stock = stock - 1 WHERE id = 100;

-- 创建订单（RETURNING 拿到 order_id）
INSERT INTO orders (user_id, total_amount, status)
VALUES (1, 99.90, 1)
RETURNING id;

-- 假设返回 order_id = 5001
-- 创建订单项
INSERT INTO order_items (order_id, product_id, price, qty)
VALUES (5001, 100, 99.90, 1);

COMMIT;

-- 2. 用户取消订单
BEGIN;
UPDATE orders SET status = 4, updated_at = NOW()
WHERE id = 5001 AND status = 1
RETURNING id;  -- 返回说明取消成功

-- 还库存
UPDATE products SET stock = stock + 1 WHERE id = 100;
COMMIT;

-- 3. 统计用户消费
SELECT
  user_id,
  COUNT(*) AS order_count,
  SUM(total_amount) AS total_spent,
  MAX(created_at) AS last_order
FROM orders
WHERE status IN (1,2,3)
GROUP BY user_id
ORDER BY total_spent DESC
LIMIT 10;
\`\`\`

## 5.9 本章小结

- 批量 INSERT 比循环单条快 10-100 倍，每批 500-1000 行
- **\`RETURNING\` 是 PG 杀手特性**：INSERT/UPDATE/DELETE 直接返回操作后的数据
- **\`ON CONFLICT\` 是 PG 标准 UPSERT**：\`DO NOTHING\` 或 \`DO UPDATE SET col = EXCLUDED.col\`
- 跨表更新用 \`UPDATE ... FROM\`，跨表删除用 \`DELETE ... USING\`
- PG 正则匹配用 \`~\`，大小写不敏感用 \`~*\`
- \`ORDER BY\` 支持 \`NULLS FIRST/LAST\` 控制 NULL 位置
- 深分页用游标分页（\`WHERE id > last_id\`）优化
- \`FOR UPDATE SKIP LOCKED\` 做并发任务队列
- 删大表数据分批 + \`VACUUM\` 回收空间
- 重要 CRUD 开事务 \`BEGIN/COMMIT\`，配合 \`SAVEPOINT\` 部分回滚

下一章讲数据完整性与约束，让数据库帮你守护数据正确性。`
  },

  {
    id: "pg-ch06",
    group: "第一部分 入门与基础",
    icon: "🛡️",
    title: "第 6 章 数据完整性与约束",
    content: `# 第 6 章 数据完整性与约束

约束（Constraint）是数据库帮我们守护数据正确性的"警察"。在应用层校验之外，数据库层约束是最后一道防线。PostgreSQL 拥有所有数据库中最完整的约束体系，包括独有的 \`EXCLUDE\` 约束。本章系统讲透各种约束。

## 6.1 约束全景

PostgreSQL 支持的约束类型：

| 约束 | 作用 | 关键字 |
| --- | --- | --- |
| 主键 | 唯一标识一行，非空 | \`PRIMARY KEY\` |
| 外键 | 引用其他表的主键/唯一键 | \`FOREIGN KEY\` / \`REFERENCES\` |
| 唯一 | 列值不重复 | \`UNIQUE\` |
| 检查 | 满足条件表达式 | \`CHECK\` |
| 非空 | 不允许 NULL | \`NOT NULL\` |
| 默认值 | 未指定时取默认 | \`DEFAULT\` |
| 排除 | 防止特定关系重叠（PG 独有） | \`EXCLUDE\` |
| 标识 | 自增列 | \`GENERATED AS IDENTITY\` |
| 生成 | 计算列 | \`GENERATED ALWAYS AS\` |

> 经验：**能加约束就加约束**。应用层校验可能被绕过（多入口、Bug），数据库约束是铁律。生产数据出错往往是因为"应该加约束却没加"。

## 6.2 PRIMARY KEY 主键

主键 = UNIQUE + NOT NULL，每表只能一个（可复合主键）。

\`\`\`sql
-- 列级
CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username TEXT
);

-- 表级（推荐，便于命名）
CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY,
  username TEXT,
  CONSTRAINT pk_users PRIMARY KEY (id)
);

-- 复合主键
CREATE TABLE order_items (
  order_id BIGINT,
  product_id BIGINT,
  qty INTEGER,
  PRIMARY KEY (order_id, product_id)
);
\`\`\`

### 添加 / 删除主键

\`\`\`sql
-- 加主键（表已有数据时，列必须 NOT NULL 且无重复）
ALTER TABLE users ADD CONSTRAINT pk_users PRIMARY KEY (id);

-- 删主键
ALTER TABLE users DROP CONSTRAINT pk_users;
\`\`\`

> 经验：主键建议用 \`BIGINT GENERATED ALWAYS AS IDENTITY\`，避免 UUID 索引性能问题（除非分布式必需）。

## 6.3 FOREIGN KEY 外键

外键保证"引用完整性"——子表的引用列必须在父表存在。

### 基本语法

\`\`\`sql
CREATE TABLE orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL,
  total_amount NUMERIC(10,2),
  CONSTRAINT fk_orders_users
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 列级简写
CREATE TABLE orders (
  user_id BIGINT NOT NULL REFERENCES users(id)
);
\`\`\`

### ON DELETE / ON UPDATE 行为

外键的核心是"父表数据变动时，子表怎么办"：

\`\`\`sql
CREATE TABLE orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL,
  CONSTRAINT fk_orders_users
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE        -- 父删，子也删
    ON UPDATE CASCADE        -- 父改，子也改
);
\`\`\`

**5 种引用动作**：

| 动作 | 含义 | 适用场景 |
| --- | --- | --- |
| \`NO ACTION\` | 默认，阻止操作（事务结束检查） | 通用 |
| \`RESTRICT\` | 阻止操作（立即检查） | 不允许删除有引用的父行 |
| \`CASCADE\` | 级联操作（父删子删 / 父改子改） | 强归属关系 |
| \`SET NULL\` | 子表引用列设 NULL | 弱关联（如"可选分类"） |
| \`SET DEFAULT\` | 子表引用列设默认值 | 较少用 |

\`\`\`sql
-- 删用户时，订单的 user_id 设为 NULL
CREATE TABLE orders (
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL
);

-- 删分类时，商品的 category_id 设为默认值 1（"未分类"）
CREATE TABLE products (
  category_id INT NOT NULL DEFAULT 1 REFERENCES categories(id) ON DELETE SET DEFAULT
);
\`\`\`

### NO ACTION vs RESTRICT

\`\`\`sql
-- NO ACTION（默认）：事务结束时检查，可用 deferred 推迟
BEGIN;
DELETE FROM users WHERE id = 1;     -- 不立即报错
DELETE FROM orders WHERE user_id = 1;  -- 清理引用
COMMIT;  -- 提交时检查，OK

-- RESTRICT：立即检查
BEGIN;
DELETE FROM users WHERE id = 1;     -- 立即报错
\`\`\`

> 经验：默认 \`NO ACTION\` 已够用。需要"先删子后删父"的流程用 \`NO ACTION\` + 事务；要"立即拒绝"用 \`RESTRICT\`。

### 自引用外键

\`\`\`sql
-- 树形结构（如分类、评论）
CREATE TABLE categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id BIGINT,
  CONSTRAINT fk_categories_parent
    FOREIGN KEY (parent_id) REFERENCES categories(id)
    ON DELETE SET NULL
);
\`\`\`

### 外键性能

- 外键会**自动创建索引在父表**（主键/唯一键已有索引）
- **子表外键列需手动加索引**（PG 不会自动建）
- 每次插入/更新子表会查父表，开销存在但可接受

\`\`\`sql
-- 子表外键列务必加索引！
CREATE INDEX idx_orders_user_id ON orders(user_id);
\`\`\`

> 踩坑：忘加子表索引会导致父表更新/删除时全表锁子表！这是 PG 外键最常见的性能坑。

## 6.4 UNIQUE 唯一约束

\`\`\`sql
-- 列级
CREATE TABLE users (
  email VARCHAR(100) UNIQUE
);

-- 表级（推荐，便于命名）
CREATE TABLE users (
  email VARCHAR(100),
  CONSTRAINT uk_users_email UNIQUE (email)
);

-- 多列组合唯一
CREATE TABLE user_courses (
  user_id BIGINT,
  course_id BIGINT,
  UNIQUE (user_id, course_id)
);

-- 添加 / 删除
ALTER TABLE users ADD CONSTRAINT uk_users_phone UNIQUE (phone);
ALTER TABLE users DROP CONSTRAINT uk_users_phone;
\`\`\`

### UNIQUE 与 NULL

**PG 中 NULL 不参与唯一性检查**——多个 NULL 不算冲突：

\`\`\`sql
CREATE TABLE t (email TEXT UNIQUE);
INSERT INTO t VALUES (NULL);  -- OK
INSERT INTO t VALUES (NULL);  -- OK（PG 允许多个 NULL）

-- 如果要"NULL 也唯一"，加部分索引
CREATE UNIQUE INDEX uk_t_email ON t (email) WHERE email IS NOT NULL;
\`\`\`

### UNIQUE INDEX vs UNIQUE CONSTRAINT

\`\`\`sql
-- 约束（推荐，语义清晰）
ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (email);

-- 唯一索引（功能等价，可加 WHERE 条件）
CREATE UNIQUE INDEX idx_users_email ON users (email);

-- 部分唯一索引（约束做不到）
CREATE UNIQUE INDEX idx_users_active_email ON users (email) WHERE status = 1;
-- 只在 status=1 的行中保证 email 唯一
\`\`\`

## 6.5 CHECK 检查约束

CHECK 让你用任意表达式约束列值：

\`\`\`sql
CREATE TABLE products (
  price NUMERIC(10,2) CHECK (price >= 0),
  stock INTEGER CHECK (stock >= 0),
  discount NUMERIC(4,2) CHECK (discount >= 0 AND discount <= 1),
  status SMALLINT CHECK (status IN (0,1,2,3,4))
);

-- 表级（多列约束，推荐命名）
CREATE TABLE orders (
  total_amount NUMERIC(10,2),
  paid_amount NUMERIC(10,2),
  CONSTRAINT chk_orders_paid
    CHECK (paid_amount >= 0 AND paid_amount <= total_amount)
);

-- 添加 / 删除
ALTER TABLE users ADD CONSTRAINT chk_users_age CHECK (age >= 0 AND age <= 150);
ALTER TABLE users DROP CONSTRAINT chk_users_age;
\`\`\`

### CHECK 注意事项

- 表达式必须返回 BOOLEAN
- **可以包含 NULL**：NULL 时约束视为"通过"（三值逻辑）
- 不能包含子查询、聚合函数、当前时间（\`NOW()\` 等）
- PG 9+ 起 CHECK 是**不可延迟的**（插入时立即检查）

\`\`\`sql
-- 这条会通过！因为 NULL >= 0 的结果是 NULL，CHECK 视为通过
INSERT INTO products (price) VALUES (NULL);
\`\`\`

> 经验：CHECK 约束配合 NOT NULL 一起用，才能彻底防住非法值。

## 6.6 NOT NULL 与 DEFAULT

### NOT NULL

\`\`\`sql
CREATE TABLE users (
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  age INTEGER           -- 允许 NULL
);

-- 添加 / 删除
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
\`\`\`

> 经验：**字段能 NOT NULL 就 NOT NULL**。NULL 让查询、索引、聚合都变复杂。

### DEFAULT

\`\`\`sql
CREATE TABLE users (
  status SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data JSONB DEFAULT '{}'::JSONB
);

-- 修改默认值
ALTER TABLE users ALTER COLUMN status SET DEFAULT 0;
ALTER TABLE users ALTER COLUMN status DROP DEFAULT;
\`\`\`

### 生成列 GENERATED（PG 12+）

\`\`\`sql
-- 计算列：自动从其他列计算
CREATE TABLE products (
  price NUMERIC(10,2),
  qty INTEGER,
  total NUMERIC(10,2) GENERATED ALWAYS AS (price * qty) STORED
);

INSERT INTO products (price, qty) VALUES (10.00, 5);
-- total 自动为 50.00
\`\`\`

> 生成列 STORED（存储）是 PG 12+ 特性。VIRTUAL（虚拟）尚未支持。

## 6.7 EXCLUDE 排除约束（PG 独有）

EXCLUDE 是 PG 独有的强大约束，确保"没有两行在指定列上满足特定关系"。最经典应用是**防止时间范围重叠**。

### 防止预订时间冲突

\`\`\`sql
-- 需先启用 btree_gist 扩展（让 GIST 索引支持标量类型）
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE bookings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id INTEGER NOT NULL,
  during tstzrange NOT NULL,
  EXCLUDE USING GIST (
    room_id WITH =,         -- 同一房间
    during WITH &&          -- 时间重叠
  )
);

-- 插入第一条预订
INSERT INTO bookings (room_id, during) VALUES
  (1, tstzrange('2024-01-01 10:00+08', '2024-01-01 12:00+08'));
-- OK

-- 插入冲突预订（同房间，时间重叠）
INSERT INTO bookings (room_id, during) VALUES
  (1, tstzrange('2024-01-01 11:00+08', '2024-01-01 13:00+08'));
-- 报错：conflicting key value violates exclusion constraint
\`\`\`

### EXCLUDE 应用场景

- 防止会议室/酒店预订时间冲突
- 防止员工在同一时段被排多个班
- 防止价格区间重叠
- 任何"不能重叠"的业务规则

\`\`\`sql
-- 价格区间不重叠
CREATE TABLE price_ranges (
  product_id BIGINT,
  qty_range int4range,      -- 数量区间
  price NUMERIC(10,2),
  EXCLUDE USING GIST (
    product_id WITH =,
    qty_range WITH &&
  )
);

-- 同一商品的 [1,10) 和 [5,20) 不能同时存在
\`\`\`

> 经验：EXCLUDE + 范围类型是 PG 独门绝技，做"防冲突"业务比应用层校验可靠得多。

## 6.8 约束命名规范

**显式命名约束**是好习惯，方便后续管理：

\`\`\`sql
-- 命名规则
PRIMARY KEY     →  pk_表名
FOREIGN KEY     →  fk_从表_主表
UNIQUE          →  uk_表名_列名
CHECK           →  chk_表名_描述
EXCLUDE         →  excl_表名_描述
\`\`\`

### 不命名（PG 自动生成）

\`\`\`sql
CREATE TABLE t (x INT UNIQUE);
-- PG 自动命名为 t_x_key，难以识别
\`\`\`

### 显式命名（推荐）

\`\`\`sql
CREATE TABLE t (
  x INT,
  CONSTRAINT uk_t_x UNIQUE (x)
);
\`\`\`

## 6.9 延迟约束（DEFERRABLE）

默认约束是**立即检查**（IMMEDIATE）。某些场景需要"事务结束时才检查"——比如循环引用的两张表互为外键。

\`\`\`sql
-- 树形结构：节点引用父节点，但插入时顺序可能颠倒
CREATE TABLE nodes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  parent_id BIGINT,
  CONSTRAINT fk_nodes_parent
    FOREIGN KEY (parent_id) REFERENCES nodes(id)
    DEFERRABLE INITIALLY DEFERRED
);

-- 现在可以"先插子节点，再插父节点"（在事务内）
BEGIN;
INSERT INTO nodes (id, parent_id) VALUES (2, 1);  -- 父节点 1 还不存在
INSERT INTO nodes (id, parent_id) VALUES (1, NULL);  -- 现在插父节点
COMMIT;  -- 提交时才检查外键，OK
\`\`\`

**两种模式**：

| 模式 | 含义 |
| --- | --- |
| \`DEFERRABLE INITIALLY IMMEDIATE\` | 可延迟，但默认每条语句后检查 |
| \`DEFERRABLE INITIALLY DEFERRED\` | 可延迟，默认事务结束时检查 |

\`\`\`sql
-- 运行时切换
SET CONSTRAINTS fk_nodes_parent IMMEDIATE;
SET CONSTRAINTS fk_nodes_parent DEFERRED;
SET CONSTRAINTS ALL DEFERRED;
\`\`\`

> 注意：只有外键、唯一约束可以 DEFERRABLE。CHECK、NOT NULL 不能延迟。

## 6.10 查看与管理约束

### 查看表的所有约束

\`\`\`sql
-- psql 元命令
\\d users

-- SQL 查询
SELECT
  conname AS constraint_name,
  contype AS type,        -- p=主键 f=外键 u=唯一 c=CHECK x=排除
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass
ORDER BY contype, conname;
\`\`\`

### 查看所有外键

\`\`\`sql
SELECT
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage ccu ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
\`\`\`

## 6.11 约束的常见组合模式

### 模式 1：完整的用户表

\`\`\`sql
CREATE TABLE users (
  id          BIGINT GENERATED ALWAYS AS IDENTITY,
  username    VARCHAR(50)  NOT NULL,
  email       VARCHAR(100) NOT NULL,
  phone       VARCHAR(20),
  age         SMALLINT,
  status      SMALLINT     NOT NULL DEFAULT 1,
  balance     NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT pk_users PRIMARY KEY (id),
  CONSTRAINT uk_users_email UNIQUE (email),
  CONSTRAINT uk_users_username UNIQUE (username),
  CONSTRAINT chk_users_age CHECK (age IS NULL OR (age >= 0 AND age <= 150)),
  CONSTRAINT chk_users_status CHECK (status IN (0, 1)),
  CONSTRAINT chk_users_balance CHECK (balance >= 0)
);

CREATE INDEX idx_users_phone ON users(phone);
\`\`\`

### 模式 2：订单表（外键 + 状态机）

\`\`\`sql
CREATE TABLE orders (
  id           BIGINT GENERATED ALWAYS AS IDENTITY,
  order_no     VARCHAR(32)  NOT NULL,
  user_id      BIGINT       NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  status       SMALLINT     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  paid_at      TIMESTAMPTZ,
  CONSTRAINT pk_orders PRIMARY KEY (id),
  CONSTRAINT uk_orders_no UNIQUE (order_no),
  CONSTRAINT fk_orders_users FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_orders_amount CHECK (total_amount >= 0),
  CONSTRAINT chk_orders_status CHECK (status IN (0,1,2,3,4)),
  CONSTRAINT chk_orders_paid CHECK (
    (status = 0 AND paid_at IS NULL) OR
    (status IN (1,2,3) AND paid_at IS NOT NULL) OR
    (status = 4)
  )
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
\`\`\`

> 经验：上面 \`chk_orders_paid\` 用 CHECK 实现了简单的"状态机"——已付款状态必须有 paid_at，未付款必须没有。这种"业务规则上数据库"的做法非常稳。

## 6.12 踩坑提示

**坑 1：外键子表忘加索引**
\`\`\`sql
CREATE TABLE orders (user_id BIGINT REFERENCES users(id));
-- 没建 idx_orders_user_id
-- 删 users 时，PG 要锁 orders 全表检查
\`\`\`
**必加子表外键索引！**

**坑 2：CHECK 约束可被 NULL 绕过**
\`\`\`sql
CREATE TABLE t (age INT CHECK (age >= 0));
INSERT INTO t VALUES (NULL);  -- 通过！
\`\`\`
要彻底防住：\`age INT NOT NULL CHECK (age >= 0)\`。

**坑 3：ON DELETE CASCADE 误删**
\`\`\`sql
DELETE FROM users WHERE id = 1;
-- 如果 orders 配了 CASCADE，所有订单被连带删除！
\`\`\`
生产环境慎用 CASCADE，重要数据用 RESTRICT 或 SET NULL。

**坑 4：UNIQUE 约束与 NULL**
PG 允许多个 NULL（不冲突）。要"NULL 也唯一"用部分唯一索引。

**坑 5：DEFERRABLE 滥用**
延迟约束让错误晚暴露，调试困难。只在循环引用等必要场景用。

**坑 6：EXCLUDE 需要扩展**
\`EXCLUDE USING GIST\` 涉及标量类型时需 \`CREATE EXTENSION btree_gist\`。

**坑 7：约束名冲突**
不同表可以有同名约束（PG 允许），但建议全局唯一，便于管理。

**坑 8：删约束 CASCADE**
\`\`\`sql
ALTER TABLE users DROP CONSTRAINT uk_users_email CASCADE;
-- 如果有索引依赖，会连带删除
\`\`\`
删前 \`\\d 表名\` 看依赖。

## 6.13 本章小结

- 约束是数据库守护数据正确性的最后防线，**能加就加**
- 主键用 \`BIGINT GENERATED ALWAYS AS IDENTITY\`，复合主键用表级定义
- 外键 5 种动作：\`NO ACTION\`（默认）/ \`RESTRICT\` / \`CASCADE\` / \`SET NULL\` / \`SET DEFAULT\`
- **外键子表列必须手动加索引**，否则父表更新/删除会锁子表
- UNIQUE 约束允许 NULL（多个 NULL 不冲突），要"NULL 唯一"用部分索引
- CHECK 约束可被 NULL 绕过，配合 NOT NULL 才彻底
- **EXCLUDE 是 PG 独有约束**，配范围类型防止"重叠"业务
- DEFERRABLE 延迟约束处理循环引用
- 显式命名约束：\`pk_/fk_/uk_/chk_/excl_\` 前缀
- 用 CHECK 实现简单状态机，把业务规则下沉到数据库

至此，第一部分入门与基础结束。你已经能用 PostgreSQL 完成绝大多数日常 DDL/DML 操作。下一部分进入查询进阶：JOIN、子查询、窗口函数、CTE、聚合。`
  }
];

export { chapters };
