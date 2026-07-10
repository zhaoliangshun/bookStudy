// =============================================================
// 《MySQL 实战教程》- 章节批次 4
// -------------------------------------------------------------
// 内容：第四部分 事务与锁（第 17-21 章）
// =============================================================

const chapters = [
  {
    id: "mysql-ch17",
    group: "第四部分 事务与锁",
    icon: "🔒",
    title: "第 17 章 事务基础与 ACID",
    content: `# 第 17 章 事务基础与 ACID

转账场景大家都熟悉：A 给 B 转 100 元，需要从 A 扣 100、给 B 加 100，两步必须**要么全做，要么全不做**。这就是事务要解决的问题。本章带你彻底搞懂 MySQL 事务的基础概念与日常用法。

## 17.1 什么是事务

**事务（Transaction）** 是一组不可再分的 SQL 操作序列，要么全部成功提交，要么全部回滚撤销。它是数据库保证数据一致性的核心机制。

一个典型的事务场景：

\`\`\`sql
-- 转账事务：A 扣钱 + B 加钱
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE user_id = 1; -- A 扣 100
UPDATE accounts SET balance = balance + 100 WHERE user_id = 2; -- B 加 100
COMMIT;
\`\`\`

> 如果中间任何一步失败，整个事务都可以 ROLLBACK，钱不会凭空消失。

## 17.2 ACID 四大特性

事务有四大特性，合称 **ACID**：

| 特性 | 全称 | 含义 | 体现 |
| --- | --- | --- | --- |
| **A 原子性** | Atomicity | 事务是一个不可分割的整体 | 全做或全不做，靠 Undo Log 实现 |
| **C 一致性** | Consistency | 事务执行前后数据合法 | 由 A、I、D 共同保证 |
| **I 隔离性** | Isolation | 并发事务互不干扰 | 靠锁 + MVCC 实现 |
| **D 持久性** | Durability | 提交后数据永久保存 | 靠 Redo Log 实现 |

**一致性是目的，其它三个是手段**。例如转账前后，A 和 B 的总金额应该不变，这就是一致性。

\`\`\`sql
-- 一致性示例：转账前后总额不变
SELECT SUM(balance) FROM accounts WHERE user_id IN (1, 2); -- 转账前 1000
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE user_id = 1;
UPDATE accounts SET balance = balance + 100 WHERE user_id = 2;
COMMIT;
SELECT SUM(balance) FROM accounts WHERE user_id IN (1, 2); -- 转账后仍为 1000
\`\`\`

## 17.3 事务的生命周期（BEGIN/COMMIT/ROLLBACK）

事务的标准生命周期：

\`\`\`
BEGIN / START TRANSACTION  ->  执行 SQL  ->  COMMIT 或 ROLLBACK
\`\`\`

**开启事务**：

\`\`\`sql
-- 方式 1：标准语法
BEGIN;

-- 方式 2：等价写法
START TRANSACTION;

-- 方式 3：带读写选项（推荐显式指定）
START TRANSACTION READ WRITE; -- 读写事务
START TRANSACTION READ ONLY;  -- 只读事务，可优化
\`\`\`

**提交事务**：

\`\`\`sql
COMMIT; -- 永久写入磁盘
\`\`\`

**回滚事务**：

\`\`\`sql
ROLLBACK; -- 撤销自 BEGIN 以来所有修改
\`\`\`

> 注意：MySQL 中 \`BEGIN\` 是 \`START TRANSACTION\` 的别名，但官方推荐使用 \`START TRANSACTION\`。

实战演示：

\`\`\`sql
CREATE TABLE t_demo (id INT PRIMARY KEY, val INT);
BEGIN;
INSERT INTO t_demo VALUES (1, 100);
INSERT INTO t_demo VALUES (2, 200);
-- 此时事务未提交，本会话能查到，其它会话查不到
SELECT * FROM t_demo;
-- 发现有问题，回滚
ROLLBACK;
SELECT * FROM t_demo; -- 空表
\`\`\`

## 17.4 SAVEPOINT 部分回滚

事务不一定要"全部回滚"，可以用 **SAVEPOINT** 实现部分回滚，只撤销事务中某一段操作。

\`\`\`sql
BEGIN;
INSERT INTO t_demo VALUES (1, 10);
SAVEPOINT sp1;          -- 设置保存点 sp1
INSERT INTO t_demo VALUES (2, 20);
SAVEPOINT sp2;          -- 设置保存点 sp2
INSERT INTO t_demo VALUES (3, 30);

-- 发现第三条不该插，回滚到 sp2
ROLLBACK TO SAVEPOINT sp2;
SELECT * FROM t_demo;   -- 只剩 id=1, id=2

-- 删除保存点
RELEASE SAVEPOINT sp1;
COMMIT;
\`\`\`

| 操作 | 作用 |
| --- | --- |
| \`SAVEPOINT name\` | 创建保存点 |
| \`ROLLBACK TO SAVEPOINT name\` | 回滚到指定保存点 |
| \`RELEASE SAVEPOINT name\` | 删除保存点 |

> SAVEPOINT 常用于"长事务中尝试性操作失败后回退某一步，而非整体重做"的场景。

## 17.5 自动提交模式

MySQL 默认开启 **autocommit** 模式，每条 SQL 都会被自动包裹成一个事务并立即提交。

\`\`\`sql
-- 查看自动提交状态
SHOW VARIABLES LIKE 'autocommit';
-- +---------------+-------+
-- | Variable_name | Value |
-- +---------------+-------+
-- | autocommit    | ON    |
-- +---------------+-------+

-- 关闭自动提交
SET autocommit = 0;  -- 或 SET autocommit = OFF;

-- 之后每条 DML 都需要手动 COMMIT
UPDATE t_demo SET val = 999 WHERE id = 1;
COMMIT;
\`\`\`

**关键理解**：

- 即使 \`autocommit=ON\`，使用 \`BEGIN\` 显式开启事务后，也要 \`COMMIT\` 才生效。
- DDL 语句（CREATE/ALTER/DROP）**无法回滚**，无论是否在事务中。

## 17.6 隐式提交的坑

MySQL 有个"暗坑"：在事务中执行某些语句会**隐式触发 COMMIT**，导致前面未提交的修改被自动提交，无法回滚。

**会触发隐式提交的语句**：

- DDL 语句：\`CREATE/ALTER/DROP TABLE\`、\`CREATE INDEX\`、\`TRUNCATE\` 等
- 所有 DCL：\`GRANT\`、\`REVOKE\`、\`SET PASSWORD\`
- 锁表：\`LOCK TABLES\`、\`UNLOCK TABLES\`
- 加载：\`LOAD DATA\`

踩坑示例：

\`\`\`sql
BEGIN;
INSERT INTO t_demo VALUES (10, 100);
ALTER TABLE t_demo ADD COLUMN note VARCHAR(50); -- 隐式提交！
ROLLBACK;                                        -- 已经晚了
SELECT * FROM t_demo WHERE id = 10;              -- 数据还在！
\`\`\`

**避坑指南**：

1. 事务中**只做 DML**，绝不在事务中执行 DDL。
2. DDL 操作单独执行，事务边界清晰。
3. 上线脚本中 DDL 与 DML 分开。

## 17.7 本章小结

- **事务**：一组不可分割的 SQL 操作，保证数据一致性。
- **ACID**：原子性、一致性、隔离性、持久性，C 是目标，AID 是手段。
- **生命周期**：\`BEGIN\` → SQL → \`COMMIT\`/\`ROLLBACK\`。
- **SAVEPOINT**：支持事务内的部分回滚。
- **autocommit**：默认 ON，每条 SQL 自动提交；显式 \`BEGIN\` 后需手动 \`COMMIT\`。
- **隐式提交**：DDL/DCL 会偷偷提交事务，事务中只做 DML。

> 事务是数据库区别于文件系统的核心能力，下一章我们看并发事务会带来什么问题，以及隔离级别如何应对。`
  },
  {
    id: "mysql-ch18",
    group: "第四部分 事务与锁",
    icon: "🏗️",
    title: "第 18 章 隔离级别",
    content: `# 第 18 章 隔离级别

并发事务如果不加隔离，会互相干扰导致数据错乱。MySQL 通过四种**隔离级别**来平衡"隔离性"与"并发性能"。本章详细讲解每种级别的现象、SQL 复现以及底层 MVCC 原理。

## 18.1 并发事务的问题（脏读/不可重复读/幻读）

三个经典并发问题：

| 问题 | 描述 | 后果 |
| --- | --- | --- |
| **脏读** | 事务 A 读到了事务 B **未提交**的修改 | B 回滚后 A 读到的是脏数据 |
| **不可重复读** | 事务 A 两次读同一行，结果不同（被 B 修改并提交） | 同一事务内读不一致 |
| **幻读** | 事务 A 两次范围查询，结果集行数不同（被 B 插入/删除并提交） | 同一事务内范围查询不一致 |

**脏读复现**：

\`\`\`sql
-- 会话 A
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
BEGIN;
SELECT balance FROM accounts WHERE id = 1; -- 假设为 1000

-- 会话 B（未提交）
BEGIN;
UPDATE accounts SET balance = 500 WHERE id = 1;
-- 不 COMMIT

-- 会话 A 再读
SELECT balance FROM accounts WHERE id = 1; -- 读到 500（脏读！）
\`\`\`

**不可重复读复现**：

\`\`\`sql
-- 会话 A
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN;
SELECT balance FROM accounts WHERE id = 1; -- 1000

-- 会话 B
UPDATE accounts SET balance = 800 WHERE id = 1; -- 自动提交

-- 会话 A 再读
SELECT balance FROM accounts WHERE id = 1; -- 800（不可重复读！）
\`\`\`

**幻读复现**：

\`\`\`sql
-- 会话 A
BEGIN;
SELECT COUNT(*) FROM accounts WHERE balance > 500; -- 假设 5 行

-- 会话 B
INSERT INTO accounts (id, balance) VALUES (99, 800); -- 提交

-- 会话 A 再查
SELECT COUNT(*) FROM accounts WHERE balance > 500; -- 6 行（幻读！）
\`\`\`

## 18.2 四种隔离级别

SQL 标准定义了四种隔离级别，隔离性依次增强，并发性依次降低：

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
| --- | --- | --- | --- |
| **READ UNCOMMITTED** 读未提交 | 可能 | 可能 | 可能 |
| **READ COMMITTED** 读已提交 | 避免 | 可能 | 可能 |
| **REPEATABLE READ** 可重复读 | 避免 | 避免 | 可能（SQL 标准） |
| **SERIALIZABLE** 串行化 | 避免 | 避免 | 避免 |

**查看与设置隔离级别**：

\`\`\`sql
-- 全局隔离级别
SELECT @@global.transaction_isolation;
-- 会话隔离级别
SELECT @@transaction_isolation;

-- 设置全局（影响新连接）
SET GLOBAL transaction_isolation = 'REPEATABLE-READ';

-- 设置会话
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
\`\`\`

> MySQL 默认隔离级别是 **REPEATABLE READ**，且通过 MVCC + 间隙锁在 RR 级别下也基本解决了幻读问题。

## 18.3 READ UNCOMMITTED

**读未提交**：可以读到其他事务未提交的数据，几乎没有隔离性。生产环境基本不用，仅作演示。

\`\`\`sql
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
\`\`\`

适用场景：对一致性无要求的统计、监控场景（容忍脏读换最大并发）。

## 18.4 READ COMMITTED

**读已提交**：只能读到其他事务已提交的数据，避免脏读，但会出现不可重复读和幻读。Oracle、PostgreSQL 默认就是 RC。

\`\`\`sql
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
\`\`\`

**特点**：

- 每条 SELECT 都会生成新的 read view，看到最新已提交数据。
- 不可重复读、幻读会发生。
- 加锁粒度小，并发性能好，**互联网公司常切换到此级别**。

## 18.5 REPEATABLE READ（MySQL 默认）

**可重复读**：同一事务内多次读同一行结果一致，避免不可重复读。MySQL 的 RR 通过 MVCC 在事务开始时建立 read view，整个事务用同一份快照。

\`\`\`sql
-- MySQL 默认就是 RR
SELECT @@transaction_isolation; -- REPEATABLE-READ
\`\`\`

**MySQL RR 对幻读的处理**：

- **快照读**（普通 SELECT）：用 MVCC 看快照，不会幻读。
- **当前读**（SELECT ... FOR UPDATE / LOCK IN SHARE MODE / INSERT / UPDATE / DELETE）：通过 **临键锁（Next-Key Lock）** 防止其他事务插入，避免幻读。

\`\`\`sql
-- 当前读示例：加锁防止幻读
BEGIN;
SELECT * FROM accounts WHERE balance > 500 FOR UPDATE;
-- 其他事务无法在 balance > 500 区间插入新行
COMMIT;
\`\`\`

## 18.6 SERIALIZABLE

**串行化**：最高隔离级别，所有事务串行执行。彻底避免脏读、不可重复读、幻读，但**并发性能极差**，生产极少使用。

\`\`\`sql
SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;
\`\`\`

> 在 SERIALIZABLE 下，所有 SELECT 都会自动加共享锁，写事务会被阻塞，慎用。

## 18.7 MVCC 简介与实现原理

**MVCC（Multi-Version Concurrency Control，多版本并发控制）** 是 InnoDB 实现 RC、RR 隔离级别的核心机制，让"读不阻塞写、写不阻塞读"成为可能。

**三大组件**：

1. **隐藏字段**：每行有 \`DB_TRX_ID\`（最后修改的事务 ID）、\`DB_ROLL_PTR\`（指向 undo log 的指针）、\`DB_ROW_ID\`。
2. **Undo Log**：保存数据的旧版本，形成版本链。
3. **Read View**：事务执行 SELECT 时生成的"可见性快照"。

**Read View 的可见性判断规则**：

- 行的 \`DB_TRX_ID < min_trx_id\`：可见（事务已提交）。
- 行的 \`DB_TRX_ID >= max_trx_id\`：不可见（将来的事务）。
- \`DB_TRX_ID\` 在 [min, max) 之间且在活跃事务列表中：不可见（事务未提交）。
- \`DB_TRX_ID\` 在 [min, max) 之间但不在活跃列表中：可见（已提交）。

**RC vs RR 的 read view 区别**：

| 级别 | read view 生成时机 |
| --- | --- |
| **RC** | 每次 SELECT 都生成新的 read view |
| **RR** | 事务第一次 SELECT 时生成，整个事务复用 |

\`\`\`sql
-- 查看 InnoDB 隐藏字段（需直接查）
SELECT 
  id, balance,
  DB_TRX_ID, DB_ROLL_PTR
FROM accounts;
\`\`\`

> 这就是 RR 中"快照读始终看到事务开始时数据"的原因——它复用了第一次的 read view。

## 18.8 本章小结

- **三个并发问题**：脏读（读到未提交）、不可重复读（同行被改）、幻读（范围被插）。
- **四种隔离级别**：RU、RC、RR、SERIALIZABLE，隔离性递增、并发性递减。
- **MySQL 默认 RR**，通过 MVCC + 间隙锁基本解决幻读。
- **互联网公司常用 RC**：并发好、加锁少，业务层加乐观锁防幻读。
- **MVCC**：靠隐藏字段 + Undo Log + Read View 实现"读写不互锁"。

> 隔离级别是事务并发行为的总开关，理解了它，下一步就要看 MySQL 用什么"锁"来落实这些隔离级别。`
  },
  {
    id: "mysql-ch19",
    group: "第四部分 事务与锁",
    icon: "🔐",
    title: "第 19 章 锁机制详解",
    content: `# 第 19 章 锁机制详解

锁是 MySQL 实现隔离级别、保证并发安全的底层手段。理解锁的分类、粒度、兼容性，才能写出高并发不卡顿的业务代码。本章系统梳理 InnoDB 的锁机制。

## 19.1 锁的分类（共享锁/排他锁/意向锁）

按**兼容性**分两类：

| 锁类型 | 简称 | 加锁方式 | 兼容性 |
| --- | --- | --- | --- |
| **共享锁**（S Lock / 读锁） | S | \`SELECT ... LOCK IN SHARE MODE\` 或 \`FOR SHARE\`(8.0) | 与 S 兼容，与 X 互斥 |
| **排他锁**（X Lock / 写锁） | X | \`SELECT ... FOR UPDATE\`、UPDATE、DELETE | 与所有锁互斥 |

**演示读锁与写锁**：

\`\`\`sql
-- 会话 A：加共享锁
BEGIN;
SELECT * FROM accounts WHERE id = 1 LOCK IN SHARE MODE;

-- 会话 B：可以读，也可以加共享锁
SELECT * FROM accounts WHERE id = 1 LOCK IN SHARE MODE; -- OK

-- 会话 B：尝试加排他锁，会阻塞
UPDATE accounts SET balance = balance + 1 WHERE id = 1; -- 阻塞！

-- 会话 A 提交后，会话 B 才能继续
COMMIT;
\`\`\`

**意向锁（Intention Lock）** 是**表级锁**，用于快速判断"表里是否有行被加了锁"，避免逐行扫描：

| 意向锁 | 含义 |
| --- | --- |
| **IS（意向共享）** | 事务打算给某些行加 S 锁前，先给表加 IS |
| **IX（意向排他）** | 事务打算给某些行加 X 锁前，先给表加 IX |

意向锁之间互相兼容，主要与表锁互斥。

## 19.2 行锁 / 间隙锁 / 临键锁

InnoDB 的行锁实际上是给**索引**加锁，不是给数据行本身加锁。三种行级锁：

| 锁 | 锁定范围 | 隔离级别 |
| --- | --- | --- |
| **Record Lock 记录锁** | 单条索引记录 | RC、RR |
| **Gap Lock 间隙锁** | 索引区间，不含记录本身 | RR |
| **Next-Key Lock 临键锁** | 记录锁 + 前面的间隙锁 | RR |

**Record Lock 示例**：

\`\`\`sql
-- 表数据：id = 5, 10, 15
-- 会话 A
BEGIN;
SELECT * FROM t WHERE id = 10 FOR UPDATE; -- 仅锁 id=10 这一行

-- 会话 B：可以插入 id=7、id=12
INSERT INTO t (id) VALUES (7); -- OK（RR 下若 id 是唯一索引，不会加间隙锁）
\`\`\`

**Gap Lock 示例**：

\`\`\`sql
-- 表数据：id = 5, 10, 15
-- 会话 A 锁一个不存在的等值
BEGIN;
SELECT * FROM t WHERE id = 7 FOR UPDATE; -- 退化成 Gap Lock (5, 10)

-- 会话 B：尝试在 (5, 10) 间隙插入
INSERT INTO t (id) VALUES (6); -- 阻塞！
\`\`\`

**Next-Key Lock 示例**：

\`\`\`sql
-- 表数据：id = 5, 10, 15
-- 会话 A
BEGIN;
SELECT * FROM t WHERE id BETWEEN 8 AND 12 FOR UPDATE;
-- 锁住 (5, 10]、(10, 15] —— 即 Next-Key Lock

-- 会话 B
INSERT INTO t (id) VALUES (6);  -- 阻塞
INSERT INTO t (id) VALUES (11); -- 阻塞
INSERT INTO t (id) VALUES (20); -- OK
\`\`\`

> **重要**：行锁加在索引上。如果 UPDATE/DELETE 的 WHERE 条件没走索引，会**逐行扫描并加锁**，相当于锁表！

## 19.3 表锁 / 元数据锁

**表锁**（Table Lock）：

\`\`\`sql
LOCK TABLES t WRITE;        -- 加表级写锁
LOCK TABLES t READ;         -- 加表级读锁
UNLOCK TABLES;              -- 释放
\`\`\`

InnoDB 极少手动用表锁，更多使用行锁。表锁主要用于 MyISAM 引擎或特殊运维场景。

**元数据锁（MDL，Metadata Lock）**：MySQL 5.5+ 引入，保护表结构不被并发修改。

- 任何 SELECT 会加 **MDL 共享读锁**。
- 任何 ALTER/CREATE/DROP 会加 **MDL 排他写锁**。

**典型踩坑**：

\`\`\`sql
-- 会话 A：长事务持有 MDL 读锁
BEGIN;
SELECT * FROM accounts WHERE id = 1; -- 持有 MDL 读锁
-- 未提交...

-- 会话 B：尝试 ALTER
ALTER TABLE accounts ADD COLUMN note VARCHAR(50); -- 阻塞！等待 MDL 写锁

-- 会话 C：再来一个 SELECT，也会阻塞（等 MDL 读锁队列）
SELECT * FROM accounts WHERE id = 1; -- 阻塞！连接被耗尽
\`\`\`

> 这是线上事故的常见诱因：长事务 + DDL = 雪崩。处理 DDL 前先 kill 长事务。

## 19.4 乐观锁与悲观锁

两种**应用层**的并发控制思想，不是 MySQL 内置锁：

**悲观锁**：先锁再操作，假设冲突必发生。

\`\`\`sql
-- 转账：先锁账户行
BEGIN;
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE; -- 加 X 锁
-- 业务校验、计算
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;
\`\`\`

适用：写多读少、冲突频繁、强一致。

**乐观锁**：不加锁，提交时校验版本号。

\`\`\`sql
-- 表加 version 字段
ALTER TABLE accounts ADD COLUMN version INT DEFAULT 0;

-- 更新时校验版本
UPDATE accounts 
SET balance = balance - 100, version = version + 1
WHERE id = 1 AND version = 5; -- 若 affected_rows = 0，说明被别人改过，重试
\`\`\`

适用：读多写少、冲突少、追求吞吐。

| 对比 | 悲观锁 | 乐观锁 |
| --- | --- | --- |
| 实现方式 | FOR UPDATE | version 字段 |
| 性能 | 冲突多时优 | 冲突少时优 |
| 复杂度 | 简单 | 需重试逻辑 |
| 死锁风险 | 有 | 无 |

## 19.5 死锁的产生与排查

**死锁**：两个或多个事务互相持有对方需要的锁，导致永久等待。

经典场景——**交叉更新**：

\`\`\`sql
-- 会话 A
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1; -- 锁住 id=1

-- 会话 B（同时）
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 2; -- 锁住 id=2

-- 会话 A 继续
UPDATE accounts SET balance = balance + 100 WHERE id = 2; -- 等 id=2 的锁

-- 会话 B 继续
UPDATE accounts SET balance = balance + 100 WHERE id = 1; -- 等 id=1 的锁
-- 死锁！InnoDB 检测到后回滚其中一个
\`\`\`

**查看锁等待**：

\`\`\`sql
-- 查看正在等待锁的事务
SELECT * FROM information_schema.INNODB_TRX WHERE trx_state = 'LOCK WAIT';

-- 查看锁信息（8.0）
SELECT * FROM performance_schema.data_locks;
SELECT * FROM performance_schema.data_lock_waits;
\`\`\`

**避免死锁的策略**：

1. **统一加锁顺序**：所有事务按主键升序更新。
2. **缩短事务**：尽快 COMMIT，减少锁持有时间。
3. **降低隔离级别**：RR 改 RC 可减少间隙锁。
4. **批量改单条**：大事务拆小。
5. **加合适的索引**：避免行锁升级成表锁。

## 19.6 本章小结

- **读锁/写锁**：S 兼容 S，X 与所有锁互斥。
- **意向锁**：表级，标记"表内有行锁"，加速判断。
- **行锁三兄弟**：Record Lock（单行）、Gap Lock（间隙）、Next-Key Lock（行+前间隙）。
- **MDL 元数据锁**：SELECT 加读锁，ALTER 加写锁，长事务+DDL 易雪崩。
- **乐观锁/悲观锁**：业务层并发控制，写多用悲观，读多用乐观。
- **死锁**：交叉更新最常见，靠"统一加锁顺序 + 短事务 + 合适索引"避免。

> 锁是事务隔离的执行者，下一章我们专门用案例剖析死锁的排查实战。`
  },
  {
    id: "mysql-ch20",
    group: "第四部分 事务与锁",
    icon: "🛡️",
    title: "第 20 章 死锁分析与排查",
    content: `# 第 20 章 死锁分析与排查

死锁是高并发系统的"常客"，一旦发生轻则业务报错重则雪崩。本章带你从死锁日志入手，一步步定位死锁根因，并给出可落地的避免策略与实战案例。

## 20.1 死锁的常见场景

死锁本质是**事务之间形成锁的循环等待**。生产中常见四类场景：

**场景 1：交叉更新（最常见）**

\`\`\`sql
-- 事务 A：先改 1 再改 2
-- 事务 B：先改 2 再改 1
\`\`\`

**场景 2：唯一索引冲突**

\`\`\`sql
-- 两个事务同时 INSERT 同一个唯一键值
-- 一个成功持锁，另一个等待，又各自依赖对方 → 死锁
\`\`\`

**场景 3：间隙锁互锁（RR 级别高发）**

\`\`\`sql
-- 事务 A 锁 (5, 10)
-- 事务 B 锁 (10, 15)
-- A 想 INSERT id=12（落入 B 的间隙）→ 等 B
-- B 想 INSERT id=7（落入 A 的间隙）→ 等 A
\`\`\`

**场景 4：锁升级 + 顺序不一致**

事务 A 用索引 1 批量更新，事务 B 用索引 2 批量更新，加锁顺序交叉。

## 20.2 查看死锁日志（SHOW ENGINE INNODB STATUS）

InnoDB 默认开启死锁检测，发生死锁会自动回滚代价较小的事务，并将死锁信息记入日志。

\`\`\`sql
SHOW ENGINE INNODB STATUS\\G
\`\`\`

关注输出中的 \`LATEST DETECTED DEADLOCK\` 段：

\`\`\`
========================
LATEST DETECTED DEADLOCK
========================
*** (1) TRANSACTION:
TRANSACTION 12345, ACTIVE 2 sec starting index read
mysql tables in use 1, locked 1
LOCK WAIT 3 lock struct(s), heap size 1136, 2 row lock(s)
UPDATE accounts SET balance = balance - 100 WHERE id = 2

*** (1) WAITING FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS space id 50 page no 3 n bits 72 index PRIMARY of table \`test\`.\`accounts\`
trx id 12345 lock_mode X locks rec but not gap waiting

*** (2) TRANSACTION:
TRANSACTION 12346, ACTIVE 1 sec starting index read
UPDATE accounts SET balance = balance + 100 WHERE id = 1

*** (2) HOLDS THE LOCK(S):
RECORD LOCKS ... index PRIMARY ... lock_mode X locks rec but not gap

*** (2) WAITING FOR THIS LOCK TO BE GRANTED:
... lock_mode X locks rec but not gap waiting

*** WE ROLL BACK TRANSACTION (2)
\`\`\`

**日志解读三步法**：

1. 看 **两个事务各自执行的 SQL**（在 TRANSACTION 段）。
2. 看 **HOLDS THE LOCK(S)**：事务 2 持有什么锁（通常是死锁的源头）。
3. 看 **WAITING FOR**：两个事务分别等什么锁。
4. **WE ROLL BACK TRANSACTION**：哪一方被回滚。

**开启完整死锁日志**：

\`\`\`sql
-- 默认只保留最后一次死锁
SET GLOBAL innodb_print_all_deadlocks = ON;
-- 之后所有死锁都会写入 error log
\`\`\`

## 20.3 information_schema.INNODB_TRX

\`INNODB_TRX\` 视图展示当前所有活跃事务，是排查锁等待的利器：

\`\`\`sql
SELECT 
  trx_id,                  -- 事务 ID
  trx_state,               -- RUNNING / LOCK WAIT / ROLLING BACK
  trx_started,             -- 开始时间
  trx_wait_started,        -- 开始等待时间
  trx_mysql_thread_id,     -- 连接 ID（用于 KILL）
  trx_query,               -- 当前执行的 SQL
  trx_rows_locked,         -- 锁住的行数
  trx_rows_modified        -- 修改的行数
FROM information_schema.INNODB_TRX
ORDER BY trx_started;
\`\`\`

**找最长事务**：

\`\`\`sql
SELECT 
  trx_id,
  TIMESTAMPDIFF(SECOND, trx_started, NOW()) AS run_seconds,
  trx_query
FROM information_schema.INNODB_TRX
ORDER BY run_seconds DESC
LIMIT 5;
\`\`\`

**MySQL 8.0 推荐用 performance_schema**：

\`\`\`sql
-- 查看所有锁
SELECT * FROM performance_schema.data_locks;

-- 查看锁等待关系
SELECT 
  ENGINE_LOCK_ID,
  OBJECT_SCHEMA, OBJECT_NAME,
  LOCK_TYPE, LOCK_MODE, LOCK_STATUS,
  LOCK_DATA
FROM performance_schema.data_locks
WHERE LOCK_STATUS = 'PENDING';

-- 查看谁阻塞谁
SELECT 
  r.ENGINE_TRANSACTION_ID AS waiting_trx,
  r.PROCESSLIST_ID AS waiting_thread,
  b.ENGINE_TRANSACTION_ID AS blocking_trx,
  b.PROCESSLIST_ID AS blocking_thread
FROM performance_schema.data_lock_waits w
JOIN performance_schema.data_locks r ON w.REQUESTING_ENGINE_LOCK_ID = r.ENGINE_LOCK_ID
JOIN performance_schema.data_locks b ON w.BLOCKING_ENGINE_LOCK_ID = b.ENGINE_LOCK_ID;
\`\`\`

**KILL 阻塞源**：

\`\`\`sql
-- 找到 blocking_thread 后
KILL <blocking_thread_id>;
\`\`\`

## 20.4 死锁的避免策略

1. **统一加锁顺序**：所有事务按主键升序访问资源。
2. **缩短事务**：BEGIN 后立即做完业务并 COMMIT，不要在事务里发 HTTP 请求。
3. **降低隔离级别**：RR → RC，减少间隙锁。
4. **走索引访问**：避免无索引 UPDATE 导致全表加锁。
5. **大事务拆小**：批量拆分批次。
6. **合理使用唯一索引**：避免插入冲突型死锁。
7. **业务层加分布式锁**：跨多个资源操作时先抢锁。

**统一加锁顺序的代码示例**：

\`\`\`sql
-- 转账：永远先锁 src，再锁 dst
-- 但若 src > dst，需调整顺序
DELIMITER $$
CREATE PROCEDURE transfer(IN src INT, IN dst INT, IN amt DECIMAL(10,2))
BEGIN
  DECLARE v1 INT;
  DECLARE v2 INT;
  -- 排序，确保加锁顺序固定
  IF src < dst THEN
    SET v1 = src; SET v2 = dst;
  ELSE
    SET v1 = dst; SET v2 = src;
  END IF;
  
  START TRANSACTION;
  SELECT balance FROM accounts WHERE id = v1 FOR UPDATE;
  SELECT balance FROM accounts WHERE id = v2 FOR UPDATE;
  
  UPDATE accounts SET balance = balance - amt WHERE id = src;
  UPDATE accounts SET balance = balance + amt WHERE id = dst;
  COMMIT;
END$$
DELIMITER ;
\`\`\`

## 20.5 死锁案例实战

**案例：批量更新订单状态导致间隙锁死锁**

表结构：

\`\`\`sql
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  status TINYINT,
  user_id INT,
  KEY idx_status (status)
);
-- 数据：status 取值 0/1/2
\`\`\`

死锁复现：

\`\`\`sql
-- 事务 A
BEGIN;
UPDATE orders SET status = 1 WHERE status = 0 AND user_id = 100 LIMIT 10;

-- 事务 B（同时）
BEGIN;
UPDATE orders SET status = 1 WHERE status = 0 AND user_id = 200 LIMIT 10;
-- 死锁！
\`\`\`

**根因分析**：\`status\` 列只有 3 个值，区分度极低，\`idx_status\` 是"假索引"，扫描大量行并加 Next-Key Lock，覆盖到对方的 user_id 范围。

**解决方案**：

\`\`\`sql
-- 1. 改用复合索引（区分度高的列在前）
ALTER TABLE orders DROP INDEX idx_status;
ALTER TABLE orders ADD INDEX idx_user_status (user_id, status);

-- 2. WHERE 调整为先 user_id 后 status
UPDATE orders SET status = 1 
WHERE user_id = 100 AND status = 0 LIMIT 10;
\`\`\`

**案例：唯一索引插入死锁**

\`\`\`sql
CREATE TABLE t (id INT PRIMARY KEY, uk INT UNIQUE KEY);

-- 事务 A：INSERT uk=100 失败（违反唯一约束）但仍持有 S 锁
INSERT INTO t VALUES (1, 100); -- Duplicate entry

-- 事务 B：INSERT uk=100 也失败，持 S 锁
INSERT INTO t VALUES (2, 100); -- 阻塞

-- 事务 A：再 INSERT uk=100，等 B 的 S 锁
-- 事务 B：再 INSERT uk=100，等 A 的 S 锁
-- → 死锁
\`\`\`

**解决**：插入前用 \`SELECT ... FOR UPDATE\` 显式锁定，统一入口。

## 20.6 本章小结

- **死锁场景**：交叉更新、唯一键冲突、间隙锁互锁、锁升级。
- **死锁日志**：\`SHOW ENGINE INNODB STATUS\\G\` 看 \`LATEST DETECTED DEADLOCK\`。
- **完整日志**：\`SET GLOBAL innodb_print_all_deadlocks = ON\` 写入 error log。
- **排查视图**：\`INNODB_TRX\`（事务）、\`data_locks\`（锁）、\`data_lock_waits\`（等待关系）。
- **避免策略**：统一加锁顺序、短事务、走索引、降隔离级别、拆大事务。
- **实战要点**：低区分度索引会放大间隙锁范围，是死锁高发原因。

> 死锁不可怕，可怕的是看不到日志。把 \`innodb_print_all_deadlocks=ON\` 写进 my.cnf，是线上 MySQL 的标配。`
  },
  {
    id: "mysql-ch21",
    group: "第四部分 事务与锁",
    icon: "📝",
    title: "第 21 章 SQL 模式与约束",
    content: `# 第 21 章 SQL 模式与约束

sql_mode 决定了 MySQL "宽松还是严格"，约束决定了"数据能否写入"。这两个看似不起眼的配置，往往是生产事故的源头。本章系统讲解 sql_mode 与各类约束。

## 21.1 sql_mode 简介

**sql_mode** 是一组语法校验规则的开关集合，控制 MySQL 对"不规范 SQL"的容忍度。

**查看当前 sql_mode**：

\`\`\`sql
SELECT @@sql_mode;
-- 例如：ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
\`\`\`

**MySQL 8.0 默认 sql_mode**：

\`\`\`
ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
\`\`\`

**设置 sql_mode**：

\`\`\`sql
-- 全局（影响新连接）
SET GLOBAL sql_mode = 'STRICT_TRANS_TABLES,ONLY_FULL_GROUP_BY';

-- 会话（仅当前连接）
SET SESSION sql_mode = 'STRICT_TRANS_TABLES';

-- 持久化到 my.cnf
-- [mysqld]
-- sql_mode=STRICT_TRANS_TABLES,ONLY_FULL_GROUP_BY
\`\`\`

## 21.2 常用的 sql_mode

| 模式 | 作用 |
| --- | --- |
| **STRICT_TRANS_TABLES** | 严格模式：插入数据不符合类型/长度直接报错，不截断 |
| **ONLY_FULL_GROUP_BY** | SELECT 中非聚合列必须出现在 GROUP BY 中 |
| **NO_ZERO_DATE** | 不允许 '0000-00-00' 日期 |
| **NO_ZERO_IN_DATE** | 不允许月/日为 0（如 '2024-00-15'） |
| **ERROR_FOR_DIVISION_BY_ZERO** | 除以 0 报错而非返回 NULL |
| **NO_ENGINE_SUBSTITUTION** | CREATE TABLE 指定不存在的引擎时报错而非替换 |
| **TRADITIONAL** | 等价于 STRICT_TRANS_TABLES + NO_ZERO_DATE + NO_ZERO_IN_DATE + ERROR_FOR_DIVISION_BY_ZERO + NO_ENGINE_SUBSTITUTION |

**STRICT_TRANS TABLES 对比**：

\`\`\`sql
-- 宽松模式下
SET sql_mode = '';
CREATE TABLE t (name VARCHAR(5));
INSERT INTO t VALUES ('hello world'); -- 截断成 'hello'，仅 warning

-- 严格模式下
SET sql_mode = 'STRICT_TRANS_TABLES';
INSERT INTO t VALUES ('hello world'); 
-- ERROR 1406 (22001): Data too long for column 'name' at row 1
\`\`\`

**ONLY_FULL_GROUP_BY 的坑**：

\`\`\`sql
-- MySQL 5.7+ 默认开启
SELECT user_id, MAX(amount)
FROM orders
GROUP BY user_id; -- OK，user_id 在 GROUP BY 中

SELECT user_id, status, MAX(amount)
FROM orders
GROUP BY user_id;
-- ERROR 1055: 'status' isn't in GROUP BY
\`\`\`

> 不少老项目升级到 5.7/8.0 后报错，多源于此。临时关闭 \`SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));\`，但**强烈建议改造 SQL** 而非关闭。

## 21.3 主键 / 外键 / 唯一约束

**主键（PRIMARY KEY）**：唯一且非空，一张表只能有一个。

\`\`\`sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY,                 -- 单列主键
  email VARCHAR(100)
);

-- 复合主键
CREATE TABLE order_items (
  order_id BIGINT,
  item_id BIGINT,
  qty INT,
  PRIMARY KEY (order_id, item_id)        -- 复合主键
);

-- 自增主键
CREATE TABLE t (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50)
);
\`\`\`

**唯一约束（UNIQUE）**：值唯一，但允许 NULL（多个 NULL 也允许）。

\`\`\`sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  email VARCHAR(100) UNIQUE,             -- 单列唯一
  phone VARCHAR(20),
  UNIQUE KEY uk_phone (phone)            -- 命名唯一约束
);
\`\`\`

**外键（FOREIGN KEY）**：维护跨表参照完整性。

\`\`\`sql
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  user_id BIGINT,
  amount DECIMAL(10,2),
  CONSTRAINT fk_order_user 
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT                   -- 删用户时若被引用则拒绝
    ON UPDATE CASCADE                    -- 改用户 id 则级联更新
);
\`\`\`

外键的 ON DELETE/UPDATE 选项：

| 选项 | 含义 |
| --- | --- |
| \`RESTRICT\` / \`NO ACTION\` | 拒绝删除/更新（默认） |
| \`CASCADE\` | 级联删除/更新子表 |
| \`SET NULL\` | 子表外键设为 NULL |
| \`SET DEFAULT\` | 设为默认值（InnoDB 不支持） |

> **互联网架构慎用外键**：性能开销大、分库分表困难，一般在应用层保证一致性。

## 21.4 CHECK 约束（MySQL 8.0+）

MySQL 8.0.16 起**真正支持** CHECK 约束（之前语法接受但不生效）。

\`\`\`sql
CREATE TABLE products (
  id BIGINT PRIMARY KEY,
  price DECIMAL(10,2),
  stock INT,
  CONSTRAINT chk_price CHECK (price > 0),
  CONSTRAINT chk_stock CHECK (stock >= 0 AND stock <= 9999)
);

-- 插入违反约束的数据
INSERT INTO products VALUES (1, -10, 5);
-- ERROR 3819: Check constraint 'chk_price' is violated.
\`\`\`

**8.0.16 之前的 workaround**：用触发器或 ENUM。

\`\`\`sql
-- 旧版本用触发器模拟
DELIMITER $$
CREATE TRIGGER trg_product_before_insert
BEFORE INSERT ON products
FOR EACH ROW
BEGIN
  IF NEW.price <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'price must > 0';
  END IF;
END$$
DELIMITER ;
\`\`\`

**查看 CHECK 约束**：

\`\`\`sql
SELECT * FROM information_schema.CHECK_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'test';
\`\`\`

## 21.5 DEFAULT 与 NOT NULL

**NOT NULL**：列不允许 NULL，是数据质量的第一道防线。

**DEFAULT**：插入时未指定则取默认值。

\`\`\`sql
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO users (name) VALUES ('Tom');
-- id=1, name='Tom', status=1, created_at=now(), updated_at=now()
\`\`\`

**MySQL 8.0 新特性**：DEFAULT 支持表达式。

\`\`\`sql
CREATE TABLE t (
  id BIGINT PRIMARY KEY,
  a INT DEFAULT (RAND() * 100),                 -- 表达式默认值
  b DATETIME DEFAULT (CURRENT_TIMESTAMP),
  c JSON DEFAULT (JSON_OBJECT('k', 'v'))
);
\`\`\`

**踩坑：NULL 的诡异行为**：

\`\`\`sql
SELECT NULL = NULL;   -- NULL（不是 true！）
SELECT NULL <> NULL;  -- NULL
SELECT NULL IS NULL;  -- 1（true）

-- 所以判断 NULL 必须用 IS NULL / IS NOT NULL
SELECT * FROM users WHERE email IS NULL;
\`\`\`

> **强烈建议**：所有字段显式声明 NOT NULL，并设默认值。NULL 处理麻烦且影响索引。

## 21.6 本章小结

- **sql_mode**：控制 SQL 校验严格度，8.0 默认严格模式，**升级时务必检查**。
- **STRICT_TRANS_TABLES**：数据不符合类型/长度直接报错。
- **ONLY_FULL_GROUP_BY**：GROUP BY 校验非聚合列，老 SQL 易踩坑。
- **主键**：唯一非空，一张表一个，推荐自增 BIGINT。
- **外键**：维护参照完整性，但生产架构慎用。
- **CHECK 约束**：8.0.16+ 真正生效，老版本需触发器模拟。
- **DEFAULT**：8.0 支持表达式默认值。
- **NOT NULL**：所有字段建议显式声明，避免 NULL 的诡异性。

> 约束是数据库的"最后一道防线"，但不是越多越好——合理的主键、唯一约束、NOT NULL 就能覆盖 90% 的数据质量需求。`
  }
];

export { chapters };
