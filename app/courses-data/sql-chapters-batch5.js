// =============================================================
// 数据库开发教程 —— 第五批章节（事务与设计篇，共 5 章）
// -------------------------------------------------------------
// 本批聚焦"事务与数据库设计"：ACID 事务、隔离级别与并发问题、
// 锁机制与死锁、设计范式、ER 建模与设计实战。
// 所有 code 字段均可在 sqlite3 内存数据库中直接运行。
// 注意：SQLite 默认自动提交，需用 BEGIN 显式开启事务。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：事务与 ACID
  // =========================================================
  {
    id: "sql-transaction",
    group: "事务与设计",
    icon: "💼",
    title: "事务与 ACID",
    content: `## 事务与 ACID

事务（Transaction）是数据库操作的**最小执行单元**——要么全部成功，要么全部失败回滚。没有事务，转账时就可能出现"扣了钱没加到对方账户"的灾难。

### 一、事务是什么

事务是**一组操作的逻辑单元**，具有 ACID 四大特性。经典例子是转账：

\`\`\`sql
-- 张三 → 李四 转 100 元
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE user = '张三';
-- 如果这里崩溃了，没有事务的话张三的钱就丢了
UPDATE accounts SET balance = balance + 100 WHERE user = '李四';
COMMIT;
\`\`\`

事务保证：要么两条都成功，要么两条都回滚，**不会出现中间状态**。

### 二、ACID 四大特性

| 特性 | 英文 | 含义 | 通俗理解 |
| --- | --- | --- | --- |
| **原子性** | Atomicity | 事务内操作要么全做，要么全不做 | "要么全做要么全不做" |
| **一致性** | Consistency | 事务前后，数据满足所有约束 | "钱的总数不变" |
| **隔离性** | Isolation | 并发事务互不干扰 | "你转账时我看不见中间状态" |
| **持久性** | Durability | 事务提交后，数据永久保存 | "提交了就别想反悔" |

**四者的关系**：
- **A** 是基础（要么全做要么不做）
- **C** 是目标（保证数据正确）
- **I** 是手段（并发时互不干扰）
- **D** 是承诺（落盘不丢）

### 三、事务控制语句

\`\`\`sql
BEGIN;         -- 开启事务（也可写 BEGIN TRANSACTION）
-- 一组 SQL 操作
COMMIT;        -- 提交（确认所有更改）
-- 或
ROLLBACK;      -- 回滚（撤销所有更改）
\`\`\`

**自动提交模式**：默认情况下，每条 SQL 都是独立事务，执行完立即提交。要开启显式事务，必须用 \`BEGIN\`。

\`\`\`sql
-- 自动提交模式（默认）
INSERT INTO t VALUES (1);  -- 立即生效，不可回滚

-- 显式事务
BEGIN;
INSERT INTO t VALUES (2);  -- 未提交
ROLLBACK;                   -- 撤销上面的 INSERT
\`\`\`

### 四、SAVEPOINT：部分回滚

事务内可以设置**保存点**，回滚到指定位置而非整个事务回滚：

\`\`\`sql
BEGIN;
INSERT INTO orders VALUES (1);
SAVEPOINT sp1;
INSERT INTO orders VALUES (2);
ROLLBACK TO sp1;   -- 只回滚到 sp1，撤销 id=2 的插入
INSERT INTO orders VALUES (3);
COMMIT;
-- 最终 orders 表里只有 id=1 和 id=3
\`\`\`

**应用场景**：批量操作中部分失败时，回滚失败部分而保留成功部分。

### 五、事务的使用场景

| 场景 | 为什么需要事务 |
| --- | --- |
| **转账** | 扣款+加款必须同时成功 |
| **订单创建** | 写订单+写订单详情+扣库存 |
| **用户注册** | 写用户表+写用户配置+写积分表 |
| **数据迁移** | 多张表批量更新，要么全成要么全回滚 |
| **状态机更新** | 当前状态校验+状态切换 |

**反例（不需要事务）**：
- 单表单条 INSERT
- 只读查询（\`SELECT\`）
- 日志记录（容忍部分丢失）

### 六、事务最佳实践

**1. 短事务原则**
\`\`\`sql
-- ❌ 长事务（持有锁太久，阻塞其他事务）
BEGIN;
SELECT ... -- 处理业务逻辑（耗时 10 秒）
UPDATE ...;
COMMIT;

-- ✅ 短事务（快速提交）
-- 业务逻辑放在事务外
SELECT ...;
-- 处理逻辑...
BEGIN;
UPDATE ...;
COMMIT;
\`\`\`

**2. 先读后写避免竞态**
\`\`\`sql
-- ❌ 可能丢失更新
SELECT balance FROM accounts WHERE id = 1;  -- 读到 100
-- 别人同时改成了 200
UPDATE accounts SET balance = 100 - 50 WHERE id = 1;  -- 覆盖成 50，丢了 200

-- ✅ 用事务 + 行锁（SELECT ... FOR UPDATE）
BEGIN;
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;  -- 加行锁
UPDATE accounts SET balance = balance - 50 WHERE id = 1;
COMMIT;
\`\`\`

**3. 重试机制**
事务可能因死锁、超时失败，应用层应重试：
\`\`\`
重试 3 次，间隔 100ms / 200ms / 400ms（指数退避）
\`\`\`

**4. 异常处理流程**
\`\`\`
try:
  BEGIN
  ...
  COMMIT
catch:
  ROLLBACK
  log + 重试或抛出
\`\`\`

### 七、踩坑点

**坑 1：DDL 隐式提交**
\`\`\`sql
BEGIN;
INSERT INTO t VALUES (1);
CREATE TABLE x (...);  -- DDL 会隐式 COMMIT！上面的 INSERT 已提交
ROLLBACK;              -- 回滚不了 INSERT
\`\`\`
MySQL/PostgreSQL 中 DDL 会触发隐式提交，SQLite 不会。

**坑 2：忘记 COMMIT/ROLLBACK**
\`\`\`sql
BEGIN;
UPDATE ...;
-- 连接断开，事务自动回滚（但不一定）
\`\`\`
长时间不提交的事务会持有锁，阻塞其他操作。

**坑 3：嵌套事务的假象**
SQLite/MySQL 不支持真正的嵌套事务，内层 \`BEGIN\` 会报错。用 \`SAVEPOINT\` 模拟嵌套。

**坑 4：自动提交踩坑**
\`\`\`sql
-- SQLite 默认自动提交，每条语句独立事务
INSERT INTO a ...;
INSERT INTO b ...;  -- 第一条已提交，无法回滚
\`\`\`
要保证多语句原子性，必须 \`BEGIN\` 显式开事务。

### 八、生产建议

1. **关键业务必包事务**：转账、订单、支付
2. **事务越短越好**：避免事务内做网络调用、文件 IO
3. **失败必回滚**：异常处理中先 ROLLBACK
4. **重试可恢复错误**：死锁、超时可重试，约束冲突不可重试
5. **监控长事务**：超过 5 秒的事务要告警

下面代码演示事务的提交、回滚、保存点。`,
    code: `-- ============================================================
-- 第一章演示：事务与 ACID
-- ============================================================

-- 1. 建表
CREATE TABLE accounts (
  id INTEGER PRIMARY KEY,
  holder TEXT NOT NULL,
  balance NUMERIC(10, 2) CHECK(balance >= 0)
);

INSERT INTO accounts (holder, balance) VALUES ('张三', 1000.00);
INSERT INTO accounts (holder, balance) VALUES ('李四', 500.00);

SELECT '1. 初始账户:' AS info;
SELECT * FROM accounts;

-- 2. 成功事务：转账 200
BEGIN;
UPDATE accounts SET balance = balance - 200 WHERE holder = '张三';
UPDATE accounts SET balance = balance + 200 WHERE holder = '李四';
COMMIT;

SELECT '2. 转账 200 后:' AS info;
SELECT * FROM accounts;

-- 3. 业务取消：手动回滚演示
-- 场景：开始扣款，但业务逻辑发现需要取消，用 ROLLBACK 撤销
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE holder = '张三';  -- 先扣 100
SELECT '3. 事务内（张三余额减少 100，未提交）:' AS info;
SELECT holder, balance FROM accounts WHERE holder = '张三';
-- 业务判断后取消操作
ROLLBACK;

SELECT '3. 回滚后（张三余额恢复）:' AS info;
SELECT * FROM accounts WHERE holder = '张三';

-- 3.1 演示 CHECK 约束如何保护数据
-- 尝试让余额为负会被 CHECK 约束直接拒绝
-- 这里用一个不会触发的查询演示安全扣款
SELECT '3.1 安全扣款（余额足够才扣）:' AS info;
BEGIN;
-- 先检查余额再扣款，避免约束冲突
UPDATE accounts
  SET balance = balance - 50
  WHERE holder = '张三' AND balance >= 50;
COMMIT;
SELECT holder, balance FROM accounts WHERE holder = '张三';

-- 4. SAVEPOINT 部分回滚
BEGIN;
INSERT INTO accounts (holder, balance) VALUES ('王五', 300.00);
SAVEPOINT sp1;
INSERT INTO accounts (holder, balance) VALUES ('赵六', 800.00);
ROLLBACK TO sp1;   -- 撤销赵六的插入
INSERT INTO accounts (holder, balance) VALUES ('孙七', 600.00);
COMMIT;

SELECT '4. SAVEPOINT 后（赵六未插入，王五和孙七在）:' AS info;
SELECT * FROM accounts;

-- 5. 自动提交模式演示（每条语句独立）
INSERT INTO accounts (holder, balance) VALUES ('周八', 100.00);
-- 这条已经自动提交，无法回滚
SELECT '5. 自动提交插入周八:' AS info;
SELECT * FROM accounts WHERE holder = '周八';

-- 6. 事务内的多表操作
CREATE TABLE transfer_log (
  id INTEGER PRIMARY KEY,
  from_user TEXT,
  to_user TEXT,
  amount NUMERIC(10, 2),
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE holder = '张三';
UPDATE accounts SET balance = balance + 100 WHERE holder = '李四';
INSERT INTO transfer_log (from_user, to_user, amount) VALUES ('张三', '李四', 100.00);
COMMIT;

SELECT '6. 转账 + 日志（事务内一起成功）:' AS info;
SELECT holder, balance FROM accounts WHERE holder IN ('张三', '李四');
SELECT * FROM transfer_log;

-- 7. 演示事务回滚不影响其他连接
-- （单连接内只能模拟，此处展示 ROLLBACK 完全撤销）
BEGIN;
UPDATE accounts SET balance = 0 WHERE holder = '张三';
SELECT '7. 事务内（张三余额变为 0，未提交）:' AS info;
SELECT holder, balance FROM accounts WHERE holder = '张三';
ROLLBACK;
SELECT '7. 回滚后（张三余额恢复）:' AS info;
SELECT holder, balance FROM accounts WHERE holder = '张三';`,
  },

  // =========================================================
  // 第二章：隔离级别与并发问题
  // =========================================================
  {
    id: "sql-isolation",
    group: "事务与设计",
    icon: "🚧",
    title: "隔离级别与并发问题",
    content: `## 隔离级别与并发问题

并发事务如果不隔离，会出现**脏读、不可重复读、幻读、丢失更新**等问题。隔离级别就是数据库提供的"并发控制开关"，级别越高越安全但并发越低。

### 一、四个并发问题

| 问题 | 描述 | 例子 |
| --- | --- | --- |
| **脏读（Dirty Read）** | 读到别的事务**未提交**的数据 | A 改了余额未提交，B 读到新余额，A 回滚后 B 拿到的是脏数据 |
| **不可重复读（Non-repeatable Read）** | 同一事务内两次读**同一行**结果不同 | A 第一次读余额 100，B 改成 200 并提交，A 第二次读变成 200 |
| **幻读（Phantom Read）** | 同一事务内两次查询**结果集行数**不同 | A 查 age>20 有 5 条，B 插入一条 age=25 并提交，A 再查变 6 条 |
| **丢失更新（Lost Update）** | 后提交的事务覆盖了前者的更新 | A、B 都读到 100，A 改成 150，B 改成 80，B 提交覆盖了 A 的 150 |

**脏读 vs 不可重复读**：
- 脏读读到的是**未提交**的数据（可能被回滚）
- 不可重复读读到的是**已提交**的数据（数据确实变了）

**不可重复读 vs 幻读**：
- 不可重复读针对**同一行**被修改/删除
- 幻读针对**新插入**的行（WHERE 条件匹配的行数变了）

### 二、四个隔离级别

SQL 标准定义了 4 个隔离级别，从低到高：

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 丢失更新 |
| --- | --- | --- | --- | --- |
| **读未提交（Read Uncommitted）** | ❌ 可能 | ❌ 可能 | ❌ 可能 | ❌ 可能 |
| **读已提交（Read Committed）** | ✅ 避免 | ❌ 可能 | ❌ 可能 | ❌ 可能 |
| **可重复读（Repeatable Read）** | ✅ 避免 | ✅ 避免 | ❌ 可能（MySQL RR 用间隙锁避免） | ❌ 可能 |
| **串行化（Serializable）** | ✅ 避免 | ✅ 避免 | ✅ 避免 | ✅ 避免 |

**级别越高，隔离越强，但并发性能越低**。

### 三、各级别能解决什么问题

**读未提交（RU）**：几乎不隔离，可以读到未提交的数据（脏读）。基本不用。

**读已提交（RC）**：
- 只读到已提交的数据，避免脏读
- 但同一事务内两次读同一行可能不同
- **PostgreSQL / Oracle / SQL Server 默认**

**可重复读（RR）**：
- 同一事务内多次读同一行结果一致
- 但仍可能出现幻读（新插入的行）
- **MySQL InnoDB 默认**（用间隙锁 Next-Key Lock 解决了幻读）

**串行化（S）**：
- 事务串行执行，完全隔离
- 性能最差，几乎不用
- **SQLite 默认**（用表锁实现）

### 四、MVCC 多版本并发控制

现代数据库（PostgreSQL、MySQL InnoDB、Oracle）用 **MVCC（Multi-Version Concurrency Control）** 实现高并发：

**核心思想**：每行数据保留多个版本，读操作读旧版本，写操作创建新版本。

\`\`\`
事务 A 读：读 row 的版本 v1
事务 B 写：创建 row 的版本 v2（不覆盖 v1）
事务 A 再读：仍读 v1（看到的是事务开始时的快照）
\`\`\`

**MVCC 的好处**：
- **读不阻塞写**：读旧版本，写新版本
- **写不阻塞读**：读看到的是历史快照
- **提升并发**：只有写-写冲突才阻塞

**MVCC 的代价**：
- 旧版本需要清理（VACUUM / purge）
- 写放大（每次更新都创建新版本）
- 长事务会阻碍旧版本回收

### 五、各数据库默认隔离级别

| 数据库 | 默认级别 | 备注 |
| --- | --- | --- |
| **SQLite** | SERIALIZABLE | 用表锁，单写多读 |
| **PostgreSQL** | READ COMMITTED | MVCC，可改 RR |
| **MySQL InnoDB** | REPEATABLE READ | MVCC + 间隙锁，RR 下也无幻读 |
| **Oracle** | READ COMMITTED | 不支持 RU |
| **SQL Server** | READ COMMITTED | 默认悲观，可改乐观 |

### 六、如何选择隔离级别

**1. 默认 RC（推荐大多数场景）**
- 平衡了隔离性和性能
- 适合读多写少的 Web 应用

**2. 关键业务用 RR**
- 转账、库存等需要可重复读的场景
- 配合 \`SELECT ... FOR UPDATE\` 避免丢失更新

**3. 几乎不用 Serializable**
- 性能太差
- 除非业务要求严格串行（如金融对账）

**4. 不用 RU**
- 脏读不可接受

### 七、SQLite 的并发模型

SQLite 用**表级锁 + WAL 模式**实现并发：

| 模式 | 读并发 | 写并发 | 适用 |
| --- | --- | --- | --- |
| **DELETE 模式（默认）** | 多读 + 单写 | 写时全库锁 | 短事务 |
| **WAL 模式** | 多读 + 单写 | 写不阻塞读 | 读多写少 |

\`\`\`sql
PRAGMA journal_mode = WAL;   -- 开启 WAL
\`\`\`

**WAL 的优势**：
- 写操作不阻塞读
- 读操作不阻塞写
- 但同时只能有一个写事务

### 八、踩坑点

**坑 1：RC 下不可重复读导致业务错误**
\`\`\`sql
-- 事务 A
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- 100
-- 事务 B 改成 200 并提交
SELECT balance FROM accounts WHERE id = 1;  -- 200（变了！）
COMMIT;
\`\`\`
如果业务依赖两次读一致，用 RR。

**坑 2：RR 下幻读导致统计错误**
\`\`\`sql
-- 事务 A
BEGIN;
SELECT COUNT(*) FROM orders WHERE status = 'pending';  -- 10
-- 事务 B 插入 5 条 pending 订单
SELECT COUNT(*) FROM orders WHERE status = 'pending';  -- 15（幻读）
COMMIT;
\`\`\`
MySQL InnoDB 的 RR 用间隙锁避免了，但 SQLite/PostgreSQL 仍有。

**坑 3：丢失更新**
\`\`\`sql
-- 两个事务都读到 100，都计算 100-50，最终提交 50
-- 实际上应该扣两次：100-50-50=0
\`\`\`
解决：用 \`SELECT ... FOR UPDATE\` 加行锁，或乐观锁版本号。

**坑 4：长事务导致 MVCC 膨胀**
长事务持有旧版本快照，数据库不能回收旧版本，导致表膨胀。**避免长事务**。

### 九、生产建议

1. **默认用 RC**：够用且性能好
2. **关键路径加锁**：\`SELECT ... FOR UPDATE\` 避免丢失更新
3. **避免长事务**：影响 MVCC 回收
4. **监控锁等待**：长锁等待要告警
5. **测试并发场景**：用并发测试覆盖竞态

下面代码模拟 SQLite 中的隔离行为（单连接演示事务隔离的基本概念）。`,
    code: `-- ============================================================
-- 第二章演示：隔离级别与并发问题
-- ============================================================
-- 注：SQLite 默认 SERIALIZABLE，单连接无法真正演示多事务并发。
-- 这里通过事务行为演示隔离概念。

-- 1. 演示事务内的可见性
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  stock INTEGER DEFAULT 0
);

INSERT INTO products (name, stock) VALUES ('手机', 100);

SELECT '1. 初始库存:' AS info;
SELECT * FROM products;

-- 2. 事务内的修改对外不可见（直到提交）
BEGIN;
UPDATE products SET stock = 80 WHERE id = 1;
SELECT '2. 事务内（库存改为 80，未提交）:' AS info;
SELECT * FROM products WHERE id = 1;
-- 在另一个连接查 stock 仍然是 100（此处同连接看不到差异）
COMMIT;
SELECT '2. 提交后:' AS info;
SELECT * FROM products WHERE id = 1;

-- 3. 事务回滚的隔离效果
BEGIN;
UPDATE products SET stock = 50 WHERE id = 1;
SELECT '3. 事务内（改为 50）:' AS info;
SELECT * FROM products WHERE id = 1;
ROLLBACK;
SELECT '3. 回滚后（恢复 80）:' AS info;
SELECT * FROM products WHERE id = 1;

-- 4. 演示 SAVEPOINT 模拟部分隔离
BEGIN;
INSERT INTO products (name, stock) VALUES ('耳机', 200);
SAVEPOINT before_temp;
INSERT INTO products (name, stock) VALUES ('临时', 999);
ROLLBACK TO before_temp;
COMMIT;

SELECT '4. SAVEPOINT 后（临时未保留）:' AS info;
SELECT * FROM products;

-- 5. 模拟不可重复读（同事务内两次读，中间被其他事务修改）
-- SQLite 单连接演示：提交后再读会看到新值
BEGIN;
SELECT '5a. 事务内第一次读:' AS info;
SELECT stock FROM products WHERE id = 1;
-- 假设此时另一个连接更新了 stock=60 并提交
-- 这里同连接模拟：在事务内 SQLite 看到的是事务开始时的快照
COMMIT;

-- 模拟外部更新
UPDATE products SET stock = 60 WHERE id = 1;
SELECT '5b. 外部更新后（已提交事务外读到 60）:' AS info;
SELECT stock FROM products WHERE id = 1;

-- 6. 演示 WAL 模式（提升读并发）
PRAGMA journal_mode = WAL;
SELECT '6. 当前 journal_mode:' AS info;
PRAGMA journal_mode;

-- 7. 隔离级别概念演示表
CREATE TABLE isolation_levels (
  level TEXT PRIMARY KEY,
  dirty_read TEXT,
  non_repeatable_read TEXT,
  phantom_read TEXT
);

INSERT INTO isolation_levels VALUES
  ('READ UNCOMMITTED', '可能', '可能', '可能'),
  ('READ COMMITTED',   '避免', '可能', '可能'),
  ('REPEATABLE READ',  '避免', '避免', '可能'),
  ('SERIALIZABLE',     '避免', '避免', '避免');

SELECT '7. 四个隔离级别 vs 并发问题:' AS info;
SELECT * FROM isolation_levels;

-- 8. 各数据库默认级别
CREATE TABLE db_defaults (
  db TEXT PRIMARY KEY,
  default_level TEXT,
  note TEXT
);

INSERT INTO db_defaults VALUES
  ('SQLite',     'SERIALIZABLE',  '表锁实现'),
  ('PostgreSQL', 'READ COMMITTED', 'MVCC'),
  ('MySQL',      'REPEATABLE READ', 'MVCC + 间隙锁'),
  ('Oracle',     'READ COMMITTED', '不支持 RU');

SELECT '8. 各数据库默认隔离级别:' AS info;
SELECT * FROM db_defaults;`,
  },

  // =========================================================
  // 第三章：锁机制与死锁
  // =========================================================
  {
    id: "sql-lock",
    group: "事务与设计",
    icon: "🔐",
    title: "锁机制与死锁",
    content: `## 锁机制与死锁

锁是数据库实现**并发控制**的核心机制。理解锁才能写出高并发又不死锁的代码。

### 一、锁的分类

**1. 共享锁（S 锁，读锁）**
- \`SELECT\` 时加
- 多个事务可同时持有同一行的 S 锁
- **读读不互斥**

**2. 排他锁（X 锁，写锁）**
- \`INSERT/UPDATE/DELETE\` 时加
- 同一行的 X 锁只能被一个事务持有
- **写写互斥、读写互斥**

| | S 锁 | X 锁 |
| --- | --- | --- |
| S 锁 | ✅ 兼容 | ❌ 不兼容 |
| X 锁 | ❌ 不兼容 | ❌ 不兼容 |

\`\`\`sql
-- 共享锁（PostgreSQL/MySQL）
SELECT * FROM users WHERE id = 1 FOR SHARE;

-- 排他锁（行锁）
SELECT * FROM users WHERE id = 1 FOR UPDATE;
\`\`\`

### 二、锁粒度

| 粒度 | 说明 | 优点 | 缺点 |
| --- | --- | --- | --- |
| **表锁** | 锁整张表 | 开销小，实现简单 | 并发低 |
| **页锁** | 锁一个数据页 | 折中 | 较少用 |
| **行锁** | 锁单行 | 并发高 | 开销大，易死锁 |

**SQLite 的锁**：表级锁（默认）/ WAL 模式下读写不互斥。
**MySQL InnoDB**：行锁（默认）。
**PostgreSQL**：行锁 + 表锁。

### 三、意向锁（Intent Lock）

**表锁 + 行锁共存**时，需要意向锁协调：

- **意向共享锁（IS）**：事务准备给行加 S 锁前，先给表加 IS 锁
- **意向排他锁（IX）**：事务准备给行加 X 锁前，先给表加 IX 锁

**作用**：快速判断表上是否有行锁，避免逐行检查。

\`\`\`
事务 A：SELECT * FROM users WHERE id = 1 FOR UPDATE;
  → 表 users 加 IX 锁，行 id=1 加 X 锁

事务 B：LOCK TABLE users IN EXCLUSIVE MODE;
  → 想加表 X 锁，发现 IS/IX 锁冲突，等待
\`\`\`

### 四、悲观锁 vs 乐观锁

**悲观锁**：假设会冲突，先加锁再操作。
\`\`\`sql
BEGIN;
SELECT stock FROM products WHERE id = 1 FOR UPDATE;  -- 加行锁
-- 其他事务想改这一行会被阻塞
UPDATE products SET stock = stock - 1 WHERE id = 1;
COMMIT;
\`\`\`

**适用**：写多读少、冲突频繁。

**乐观锁**：假设不冲突，提交时检查版本。
\`\`\`sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  stock INTEGER,
  version INTEGER DEFAULT 0
);

-- 读取时拿到 version
SELECT stock, version FROM products WHERE id = 1;  -- stock=100, version=5

-- 更新时校验 version
UPDATE products
SET stock = stock - 1, version = version + 1
WHERE id = 1 AND version = 5;
-- 如果 affected_rows == 0，说明被别人改了，重试
\`\`\`

**适用**：读多写少、冲突少。

**对比**：

| 维度 | 悲观锁 | 乐观锁 |
| --- | --- | --- |
| 思路 | 先锁后操作 | 先操作后校验 |
| 性能 | 冲突多时好 | 冲突少时好 |
| 死锁 | 可能 | 不可能 |
| 实现 | 数据库锁 | 版本号/CAS |

### 五、死锁

**死锁条件**：两个或多个事务**循环等待**对方释放锁。

\`\`\`
事务 A：锁了行 1，等行 2
事务 B：锁了行 2，等行 1
→ 互相等待，永远不结束
\`\`\`

**死锁四条件**（操作系统经典）：
1. 互斥：锁不能共享
2. 持有并等待：持有锁的同时等别的锁
3. 不可剥夺：锁不能被强制抢走
4. 循环等待：形成等待环

### 六、死锁的检测与避免

**1. 死锁检测**
- 数据库自动检测（InnoDB 用**等待图**算法）
- 检测到死锁后，回滚代价较小的事务
- 报错：\`ERROR 1213 (40001): Deadlock found\`

**2. 死锁避免**
- **固定加锁顺序**：所有事务按相同顺序加锁
- **缩短事务**：减少锁持有时间
- **降低隔离级别**：用 RC 而非 RR
- **大事务拆小**：减少锁范围

\`\`\`sql
-- ❌ 死锁风险（不同顺序加锁）
-- 事务 A
UPDATE accounts SET ... WHERE id = 1;
UPDATE accounts SET ... WHERE id = 2;

-- 事务 B
UPDATE accounts SET ... WHERE id = 2;
UPDATE accounts SET ... WHERE id = 1;

-- ✅ 固定顺序（都按 id 升序）
-- 事务 A 和 B 都先锁 id=1，再锁 id=2
\`\`\`

**3. 锁超时**
\`\`\`sql
-- 设置锁等待超时（MySQL）
SET innodb_lock_wait_timeout = 50;  -- 50 秒

-- PostgreSQL
SET lock_timeout = '5s';
\`\`\`
超时后事务报错回滚，避免无限等待。

### 七、SQLite 的锁机制

SQLite 用 **5 种锁状态**（DELETE 模式）：

| 状态 | 说明 |
| --- | --- |
| UNLOCKED | 无锁 |
| SHARED | 读锁，可多读 |
| RESERVED | 准备写，保留写意图 |
| PENDING | 即将写，阻塞新读 |
| EXCLUSIVE | 写锁，独占 |

**WAL 模式**下，读和写分离：
- 读操作读 WAL 文件
- 写操作追加到 WAL
- **读不阻塞写，写不阻塞读**
- 但同时只能有一个写事务

\`\`\`sql
PRAGMA journal_mode = WAL;   -- 开启 WAL
PRAGMA busy_timeout = 5000;  -- 锁等待 5 秒
\`\`\`

### 八、实战：库存扣减的并发安全

**问题**：高并发下扣库存，可能出现超卖。

\`\`\`sql
-- 方案 1：悲观锁
BEGIN;
SELECT stock FROM products WHERE id = 1 FOR UPDATE;  -- 加行锁
-- 此时其他事务想锁这行会被阻塞
UPDATE products SET stock = stock - 1 WHERE id = 1 AND stock > 0;
COMMIT;

-- 方案 2：乐观锁
UPDATE products
SET stock = stock - 1, version = version + 1
WHERE id = 1 AND version = ? AND stock > 0;
-- 看 affected_rows，0 则重试

-- 方案 3：原子更新 + 条件
UPDATE products SET stock = stock - 1
WHERE id = 1 AND stock > 0;
-- 0 行受影响说明库存不足
\`\`\`

**性能对比**：
- 悲观锁：冲突多时好，但持锁久
- 乐观锁：冲突少时好，但重试开销
- 原子更新：最简单，但只能做简单扣减

### 九、踩坑点

**坑 1：行锁变表锁**
\`\`\`sql
-- MySQL 中如果 WHERE 列无索引，行锁会升级为表锁
UPDATE t SET ... WHERE non_indexed_col = 1;  -- 锁全表
\`\`\`
**解决**：WHERE 条件的列必须有索引。

**坑 2：间隙锁导致插入阻塞**
MySQL RR 级别下，\`SELECT ... FOR UPDATE\` 会锁住"间隙"，导致插入阻塞。
\`\`\`sql
SELECT * FROM orders WHERE id > 100 FOR UPDATE;  -- 锁住 id>100 的所有间隙
-- 其他事务想插入 id=101 会被阻塞
\`\`\`

**坑 3：死锁后未处理**
死锁后数据库回滚一个事务，应用必须捕获错误并重试或返回错误。

**坑 4：长事务持锁**
事务持有锁的时间越长，死锁概率越高。**避免事务内有耗时操作**。

### 十、生产建议

1. **固定加锁顺序**：避免死锁
2. **行锁必须有索引**：避免升级为表锁
3. **短事务**：减少锁持有时间
4. **重试死锁错误**：error code 1213 可重试
5. **监控锁等待**：长锁等待告警
6. **WAL 模式**：SQLite 高并发场景必开

下面代码演示锁、版本控制和库存扣减。`,
    code: `-- ============================================================
-- 第三章演示：锁机制与死锁
-- ============================================================

-- 1. 悲观锁演示（SQLite 不支持 FOR UPDATE，用事务模拟）
CREATE TABLE inventory (
  id INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL,
  stock INTEGER NOT NULL CHECK(stock >= 0)
);

INSERT INTO inventory (product_name, stock) VALUES ('手机', 100);
INSERT INTO inventory (product_name, stock) VALUES ('耳机', 200);

SELECT '1. 初始库存:' AS info;
SELECT * FROM inventory;

-- 2. 事务内的"行锁"效果（SQLite 用 SERIALIZABLE 隔离）
BEGIN;
-- 模拟读取并锁定（实际 FOR UPDATE 在 MySQL/PG 中才有）
SELECT stock FROM inventory WHERE id = 1;
-- 在此期间其他连接想改这一行会被阻塞
UPDATE inventory SET stock = stock - 1 WHERE id = 1 AND stock > 0;
SELECT '2. 扣减后:' AS info;
SELECT * FROM inventory WHERE id = 1;
COMMIT;

-- 3. 乐观锁演示（版本号）
ALTER TABLE inventory ADD COLUMN version INTEGER DEFAULT 0;

SELECT '3. 乐观锁演示:' AS info;
SELECT id, product_name, stock, version FROM inventory WHERE id = 2;

-- 模拟应用层读到的 version
-- 读取: stock=200, version=0
-- 尝试更新（version 匹配则成功）
UPDATE inventory
SET stock = stock - 1, version = version + 1
WHERE id = 2 AND version = 0;
SELECT '3a. 第一次扣减（version 0 → 1）:' AS info;
SELECT id, product_name, stock, version FROM inventory WHERE id = 2;

-- 模拟并发冲突：用旧 version 更新（应该失败）
UPDATE inventory
SET stock = stock - 1, version = version + 1
WHERE id = 2 AND version = 0;
SELECT '3b. 用旧 version 更新（受影响行数应为 0）:' AS info;
SELECT changes() AS 受影响行数;
SELECT id, product_name, stock, version FROM inventory WHERE id = 2;

-- 4. 原子更新（最简单的扣减）
UPDATE inventory SET stock = stock - 1 WHERE id = 1 AND stock > 0;
SELECT '4. 原子扣减（手机库存减 1）:' AS info;
SELECT * FROM inventory WHERE id = 1;

-- 5. 库存不足时拒绝扣减
SELECT '5. 库存不足时（库存 0 时不扣减）:' AS info;
UPDATE inventory SET stock = 0 WHERE id = 1;
SELECT changes() AS 受影响行数;
UPDATE inventory SET stock = stock - 1 WHERE id = 1 AND stock > 0;
SELECT changes() AS 扣减受影响行数;
SELECT * FROM inventory WHERE id = 1;

-- 6. WAL 模式演示
PRAGMA journal_mode = WAL;
SELECT '6. 开启 WAL 模式:' AS info;
PRAGMA journal_mode;

-- 7. 锁等待超时
PRAGMA busy_timeout = 5000;  -- 5 秒
SELECT '7. 设置 busy_timeout = 5000ms' AS info;
PRAGMA busy_timeout;

-- 8. 死锁模拟（概念演示）
-- 实际死锁需要两个连接，这里演示避免死锁的固定顺序
CREATE TABLE accounts (
  id INTEGER PRIMARY KEY,
  holder TEXT,
  balance NUMERIC(10, 2)
);

INSERT INTO accounts (holder, balance) VALUES ('A', 1000), ('B', 2000);

-- 模拟转账：固定按 id 升序加锁
BEGIN;
-- 先锁 id=1，再锁 id=2（所有事务都按此顺序）
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

SELECT '8. 转账后（固定顺序避免死锁）:' AS info;
SELECT * FROM accounts;

-- 9. 锁分类参考表
CREATE TABLE lock_types (
  lock TEXT PRIMARY KEY,
  symbol TEXT,
  description TEXT
);

INSERT INTO lock_types VALUES
  ('共享锁 S 锁', '读锁', 'SELECT 时加，多读可共享'),
  ('排他锁 X 锁', '写锁', 'INSERT/UPDATE/DELETE 时加，独占'),
  ('意向共享锁 IS', '表级', '准备加行 S 锁前先加表 IS'),
  ('意向排他锁 IX', '表级', '准备加行 X 锁前先加表 IX'),
  ('间隙锁 Gap', '范围', 'MySQL RR 锁住索引间隙'),
  ('Next-Key', '行+间隙', 'MySQL RR 行锁 + 间隙锁');

SELECT '9. 锁类型一览:' AS info;
SELECT * FROM lock_types;`,
  },

  // =========================================================
  // 第四章：数据库设计范式
  // =========================================================
  {
    id: "sql-normalization",
    group: "事务与设计",
    icon: "📐",
    title: "数据库设计范式",
    content: `## 数据库设计范式

范式（Normal Form）是关系型数据库**设计规范**——遵循范式能减少数据冗余、避免异常。但过度范式化也会损害性能，需要权衡。

### 一、为什么需要范式

**反例（无范式）**：把所有数据塞一张表。

\`\`\`
订单表（反范式）:
  order_id | customer_name | customer_city | product_name | product_price
  1        | 张三          | 北京          | 手机          | 2999
  2        | 张三          | 北京          | 耳机          | 299
  3        | 李四          | 上海          | 手机          | 2999
\`\`\`

**问题**：
1. **数据冗余**：张三的"北京"重复存
2. **更新异常**：改张三的 city 要改多行
3. **插入异常**：没订单时插不进客户
4. **删除异常**：删了订单，客户信息也没了

**范式解决**：拆表，用外键关联。

### 二、第一范式 1NF：原子性

**定义**：每列不可再分，每行有唯一标识。

\`\`\`
❌ 违反 1NF
  user_id | name  | phone
  1       | 张三  | 138xxx, 139xxx    -- phone 可分

✅ 满足 1NF
  user_id | name  | phone
  1       | 张三  | 138xxx
  1       | 张三  | 139xxx
\`\`\`

**核心**：每列只存一个值，不能是数组、列表、JSON 嵌套。

**例外**：现代数据库支持 JSON 列，有时为了灵活会破坏 1NF（如存标签数组）。但要权衡。

### 三、第二范式 2NF：完全依赖主键

**定义**：非主键列必须**完全依赖**整个主键（不能只依赖主键的一部分）。

针对**复合主键**的表。

\`\`\`
❌ 违反 2NF
  order_id | product_id | product_name | quantity
  (order_id, product_id) 是复合主键
  product_name 只依赖 product_id，不依赖 order_id → 部分依赖

✅ 满足 2NF
  order_items 表: (order_id, product_id) → quantity
  products 表: product_id → product_name
\`\`\`

**核心**：复合主键的表中，所有非主键列必须依赖整个主键，不能只依赖一部分。

### 四、第三范式 3NF：消除传递依赖

**定义**：非主键列必须**直接依赖**主键，不能通过其他列间接依赖（消除传递依赖）。

\`\`\`
❌ 违反 3NF
  employee_id | dept_id | dept_name
  dept_name 依赖 dept_id，dept_id 依赖 employee_id → 传递依赖

✅ 满足 3NF
  employees 表: employee_id → dept_id
  departments 表: dept_id → dept_name
\`\`\`

**核心**：非主键列之间不能有依赖关系。

### 五、BCNF：更严格的 3NF

**定义**：每个决定因素都必须是候选键。

\`\`\`
❌ 违反 BCNF
  student | course | teacher
  (student, course) → teacher
  teacher → course（一个老师只教一门课）
  teacher 是决定因素但不是候选键 → 违反 BCNF

✅ 满足 BCNF
  (student, teacher) → course
  teacher → course
\`\`\`

**实际**：BCNF 比较少见，3NF 已满足大多数场景。

### 六、范式总结

| 范式 | 核心要求 | 解决的问题 |
| --- | --- | --- |
| **1NF** | 列不可分 | 数组、嵌套结构 |
| **2NF** | 完全依赖主键 | 部分依赖（复合主键） |
| **3NF** | 直接依赖主键 | 传递依赖 |
| **BCNF** | 决定因素必为候选键 | 主键外的决定因素 |

**记忆口诀**：
- 1NF：**字段不能再分**
- 2NF：**不能部分依赖**
- 3NF：**不能传递依赖**

### 七、反范式（Denormalization）

**反范式**：故意违反范式，用冗余换性能。

**场景**：
\`\`\`sql
-- 范式设计（3NF）
SELECT o.id, c.name, c.city, p.name, oi.quantity
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.id = 1;
-- 4 表 JOIN，查询慢

-- 反范式设计（冗余字段）
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  customer_name TEXT,    -- 冗余
  customer_city TEXT,    -- 冗余
  ...
);
-- 查询只需 1-2 表 JOIN
\`\`\`

**何时反范式**：
1. **读远多于写**：冗余字段读快，但写时要同步更新多表
2. **历史快照**：订单需要记录下单时的商品价格（不能因为商品改价而变）
3. **统计报表**：预计算汇总数据
4. **缓存层**：把频繁 JOIN 的字段冗余

**反范式的代价**：
- **数据冗余**：存储翻倍
- **更新成本**：改一处要同步多处
- **一致性风险**：冗余字段可能不一致

### 八、范式与性能权衡

| 维度 | 范式化 | 反范式 |
| --- | --- | --- |
| **存储** | 节省 | 冗余 |
| **写入** | 简单（写一张表） | 复杂（写多表） |
| **读取** | 慢（多 JOIN） | 快（少 JOIN） |
| **一致性** | 强 | 弱（需同步） |
| **适用** | OLTP 写多 | OLAP 读多 |

**建议**：
- **核心业务表严格范式**：保证一致性
- **报表/统计表反范式**：提升查询性能
- **历史快照表冗余**：保留当时的值

### 九、实战示例：订单系统

**3NF 设计**：
\`\`\`sql
-- 客户表
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT,
  city TEXT
);

-- 商品表
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT,
  price NUMERIC(10, 2)
);

-- 订单表
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  created_at TEXT
);

-- 订单详情表（2NF：完全依赖复合主键）
CREATE TABLE order_items (
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER,
  PRIMARY KEY (order_id, product_id)
);
\`\`\`

**反范式后**（订单详情冗余商品名和单价，保留历史快照）：
\`\`\`sql
CREATE TABLE order_items (
  order_id INTEGER,
  product_id INTEGER,
  product_name TEXT,      -- 冗余（保留下单时的名字）
  unit_price NUMERIC(10, 2),  -- 冗余（保留下单时的价格）
  quantity INTEGER,
  PRIMARY KEY (order_id, product_id)
);
\`\`\`

### 十、踩坑点

**坑 1：过度范式化**
把所有字段拆到极致，查询要 JOIN 8 张表，性能崩盘。**3NF 足够**。

**坑 2：反范式忘记同步**
冗余字段更新时漏改，导致数据不一致。**用触发器或应用层保证同步**。

**坑 3：业务变化破坏范式**
"客户只有一个地址" → 后来变成"多地址"，原本的字段需要拆表。**设计时考虑扩展性**。

**坑 4：用 JSON 列破坏 1NF**
\`\`\`sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT,
  tags JSON  -- 灵活但难查询、难索引
);
\`\`\`
JSON 列方便但牺牲了关系模型的优点（约束、索引、JOIN）。**核心数据用关系，附加数据用 JSON**。

### 十一、生产建议

1. **默认遵循 3NF**：保证数据一致性
2. **读多写少场景适度反范式**：冗余高频读字段
3. **历史数据冗余**：订单保留下单时的价格
4. **避免过度设计**：3NF 满足 99% 场景
5. **JSON 谨慎使用**：附加字段可以，核心字段不行

下面代码演示范式与反范式设计。`,
    code: `-- ============================================================
-- 第四章演示：数据库设计范式
-- ============================================================

-- 1. 反例：违反 1NF（数组存在一个字段里）
CREATE TABLE bad_users (
  id INTEGER PRIMARY KEY,
  name TEXT,
  phones TEXT  -- "138xxx,139xxx" 违反 1NF
);

INSERT INTO bad_users VALUES (1, '张三', '138xxx,139xxx');

SELECT '1. 违反 1NF（phones 含多个值）:' AS info;
SELECT * FROM bad_users;

-- 修正：满足 1NF
CREATE TABLE user_phones (
  user_id INTEGER,
  phone TEXT,
  PRIMARY KEY (user_id, phone)
);

INSERT INTO user_phones VALUES (1, '138xxx'), (1, '139xxx');

SELECT '1. 满足 1NF（一行一个手机号）:' AS info;
SELECT * FROM user_phones;

-- 2. 违反 2NF（部分依赖）
CREATE TABLE bad_order_items (
  order_id INTEGER,
  product_id INTEGER,
  product_name TEXT,    -- 只依赖 product_id
  quantity INTEGER,
  PRIMARY KEY (order_id, product_id)
);

INSERT INTO bad_order_items VALUES (1, 100, '手机', 2);
INSERT INTO bad_order_items VALUES (2, 100, '手机', 1);  -- product_name 重复

SELECT '2. 违反 2NF（product_name 重复存）:' AS info;
SELECT * FROM bad_order_items;

-- 修正：拆表
CREATE TABLE products_norm (
  id INTEGER PRIMARY KEY,
  name TEXT
);
CREATE TABLE order_items_norm (
  order_id INTEGER,
  product_id INTEGER REFERENCES products_norm(id),
  quantity INTEGER,
  PRIMARY KEY (order_id, product_id)
);

INSERT INTO products_norm VALUES (100, '手机');
INSERT INTO order_items_norm VALUES (1, 100, 2);
INSERT INTO order_items_norm VALUES (2, 100, 1);

SELECT '2. 满足 2NF（product_name 只存一次）:' AS info;
SELECT oi.order_id, p.name, oi.quantity
FROM order_items_norm oi
JOIN products_norm p ON oi.product_id = p.id;

-- 3. 违反 3NF（传递依赖）
CREATE TABLE bad_employees (
  id INTEGER PRIMARY KEY,
  name TEXT,
  dept_id INTEGER,
  dept_name TEXT,    -- 依赖 dept_id，传递依赖 employee_id
  dept_location TEXT  -- 同上
);

INSERT INTO bad_employees VALUES (1, '张三', 10, '技术部', '北京');
INSERT INTO bad_employees VALUES (2, '李四', 10, '技术部', '北京');  -- 重复

SELECT '3. 违反 3NF（dept_name 重复）:' AS info;
SELECT * FROM bad_employees;

-- 修正：拆表
CREATE TABLE departments_norm (
  id INTEGER PRIMARY KEY,
  name TEXT,
  location TEXT
);
CREATE TABLE employees_norm (
  id INTEGER PRIMARY KEY,
  name TEXT,
  dept_id INTEGER REFERENCES departments_norm(id)
);

INSERT INTO departments_norm VALUES (10, '技术部', '北京');
INSERT INTO employees_norm VALUES (1, '张三', 10);
INSERT INTO employees_norm VALUES (2, '李四', 10);

SELECT '3. 满足 3NF（部门信息只存一次）:' AS info;
SELECT e.id, e.name AS 员工, d.name AS 部门, d.location AS 地点
FROM employees_norm e
JOIN departments_norm d ON e.dept_id = d.id;

-- 4. 反范式：订单系统（冗余历史快照）
CREATE TABLE customers_dn (
  id INTEGER PRIMARY KEY,
  name TEXT,
  city TEXT
);
CREATE TABLE products_dn (
  id INTEGER PRIMARY KEY,
  name TEXT,
  price NUMERIC(10, 2)
);
CREATE TABLE orders_dn (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);
-- 反范式：order_items 冗余 product_name 和 unit_price
CREATE TABLE order_items_dn (
  order_id INTEGER,
  product_id INTEGER,
  product_name TEXT,        -- 冗余：保留下单时的名字
  unit_price NUMERIC(10, 2), -- 冗余：保留下单时的价格
  quantity INTEGER,
  PRIMARY KEY (order_id, product_id)
);

INSERT INTO customers_dn VALUES (1, '张三', '北京');
INSERT INTO products_dn VALUES (100, '手机', 2999.00);
INSERT INTO orders_dn (id, customer_id) VALUES (1, 1);
INSERT INTO order_items_dn VALUES (1, 100, '手机', 2999.00, 2);

SELECT '4. 反范式（订单保留历史价格）:' AS info;
SELECT o.id AS 订单, c.name AS 客户, oi.product_name AS 商品, oi.unit_price AS 单价, oi.quantity AS 数量
FROM orders_dn o
JOIN customers_dn c ON o.customer_id = c.id
JOIN order_items_dn oi ON o.id = oi.order_id;

-- 演示冗余的价值：商品改价后，旧订单价格不变
UPDATE products_dn SET price = 3999.00 WHERE id = 100;
SELECT '4. 商品改价后，旧订单仍保留下单时价格:' AS info;
SELECT '当前商品价:' AS info;
SELECT * FROM products_dn WHERE id = 100;
SELECT '历史订单价:' AS info;
SELECT order_id, product_name, unit_price FROM order_items_dn WHERE order_id = 1;

-- 5. 范式总结表
CREATE TABLE normal_forms (
  level TEXT PRIMARY KEY,
  requirement TEXT,
  solves TEXT
);

INSERT INTO normal_forms VALUES
  ('1NF',  '列不可分',          '数组、嵌套结构'),
  ('2NF',  '完全依赖主键',       '部分依赖（复合主键）'),
  ('3NF',  '直接依赖主键',       '传递依赖'),
  ('BCNF', '决定因素必为候选键', '主键外的决定因素');

SELECT '5. 范式总结:' AS info;
SELECT * FROM normal_forms;`,
  },

  // =========================================================
  // 第五章：ER 建模与设计实战
  // =========================================================
  {
    id: "sql-er-modeling",
    group: "事务与设计",
    icon: "🗺️",
    title: "ER 建模与设计实战",
    content: `## ER 建模与设计实战

ER 建模（Entity-Relationship Modeling）是数据库设计的**核心方法**——把现实世界抽象成实体、关系、属性，再映射成表结构。

### 一、ER 三要素

**1. 实体（Entity）**：现实世界中可区分的对象。
- 强实体：独立存在（用户、订单）
- 弱实体：依赖其他实体（订单详情依赖订单）

**2. 关系（Relationship）**：实体之间的关联。
- 一对一（1:1）：用户 ↔ 用户详情
- 一对多（1:N）：部门 ↔ 员工
- 多对多（M:N）：学生 ↔ 课程

**3. 属性（Attribute）**：实体的特征。
- 简单属性：不可分（年龄）
- 复合属性：可分（地址=省+市+街道）
- 单值属性：只有一个值
- 多值属性：多个值（电话号码列表）
- 派生属性：可计算（年龄=当前年份-出生年份）

### 二、关系建模

**1. 一对一（1:1）**
\`\`\`sql
-- 用户表
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT
);

-- 用户详情表（一对一）
CREATE TABLE user_profiles (
  user_id INTEGER PRIMARY KEY,  -- 主键 + 外键
  bio TEXT,
  avatar TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
\`\`\`
**实现**：从表的主键同时是外键，引用主表。

**2. 一对多（1:N）**
\`\`\`sql
-- 部门表
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT
);

-- 员工表（多对一）
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT,
  dept_id INTEGER,  -- 外键在"多"的一方
  FOREIGN KEY (dept_id) REFERENCES departments(id)
);
\`\`\`
**实现**：外键放在"多"的一方（员工表）。

**3. 多对多（M:N）**
\`\`\`sql
-- 学生表
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT
);

-- 课程表
CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  name TEXT
);

-- 选课关联表（中间表）
CREATE TABLE enrollments (
  student_id INTEGER,
  course_id INTEGER,
  enrolled_at TEXT,
  PRIMARY KEY (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
\`\`\`
**实现**：用一张**关联表**，主键是两个外键的组合。

### 三、外键实现关系

| 关系类型 | 实现方式 |
| --- | --- |
| 1:1 | 从表主键 = 外键 |
| 1:N | 外键在 N 方 |
| M:N | 关联表（两外键 + 复合主键） |

**外键的 ON DELETE 行为**：
- \`RESTRICT\`：有引用就拒绝删除
- \`CASCADE\`：级联删除
- \`SET NULL\`：置空
- \`SET DEFAULT\`：设默认值

\`\`\`sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
    ON DELETE RESTRICT     -- 有订单的客户不能删
    ON UPDATE CASCADE
);
\`\`\`

### 四、ER 图（ERD）绘制

**ER 图符号**：
- 矩形：实体
- 菱形：关系
- 椭圆：属性
- 连线：连接实体与关系

**常用工具**：
- **dbdiagram.io**：在线绘制
- **MySQL Workbench**：可视化设计
- **DBeaver**：ER 图生成
- **draw.io / Lucidchart**：通用绘图

**绘制流程**：
1. 识别实体
2. 识别关系（1:1 / 1:N / M:N）
3. 添加属性
4. 标注主键、外键
5. 转成 SQL 表结构

### 五、主键设计

| 方案 | 类型 | 优点 | 缺点 | 适用 |
| --- | --- | --- | --- | --- |
| **自增整数** | INTEGER | 简单、紧凑、有序 | 单机生成、易枚举 | 单库 |
| **UUID** | TEXT/CHAR | 全局唯一、分布式 | 体积大、无序、索引慢 | 分布式 |
| **雪花算法** | BIGINT | 全局唯一、有序、紧凑 | 实现复杂 | 分布式 |
| **业务主键** | - | 业务可读 | 易变、规则可能改 | 不推荐 |

**选型建议**：
- 单库小项目：自增整数
- 分布式：雪花算法（短有序）/ UUID（全局唯一）
- **不要用业务字段**（身份证号、手机号）作主键

### 六、时间戳字段

\`\`\`sql
CREATE TABLE base_table (
  id INTEGER PRIMARY KEY,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),  -- 创建时间
  updated_at TEXT DEFAULT (datetime('now', 'localtime')),  -- 更新时间
  created_by INTEGER,  -- 创建人
  updated_by INTEGER   -- 更新人
);
\`\`\`

**字段说明**：
- \`created_at\`：记录创建时间，**不变**
- \`updated_at\`：记录最后更新时间，**每次更新都改**
- \`created_by\` / \`updated_by\`：操作人（审计）

**更新 updated_at 的触发器**：
\`\`\`sql
CREATE TRIGGER trg_update_time
AFTER UPDATE ON base_table
FOR EACH ROW
BEGIN
  UPDATE base_table SET updated_at = datetime('now', 'localtime')
  WHERE id = OLD.id;
END;
\`\`\`

### 七、软删除字段

\`\`\`sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT,
  deleted_at TEXT,  -- NULL 表示未删除，非 NULL 表示删除时间
  ...
);

-- 软删除
UPDATE users SET deleted_at = datetime('now', 'localtime') WHERE id = 1;

-- 查询时过滤已删除
SELECT * FROM users WHERE deleted_at IS NULL;
\`\`\`

**软删除的优劣**：
- ✅ 可恢复、可审计
- ✅ 保持外键完整性
- ❌ 数据膨胀，需定期清理
- ❌ 每个查询都要加 \`WHERE deleted_at IS NULL\`（易漏）

### 八、设计 Checklist

**1. 命名规范**
- 表名：复数或单数（统一即可），如 \`users\`、\`orders\`
- 列名：小写 + 下划线，如 \`created_at\`、\`user_id\`
- 外键：\`表名单数_id\`，如 \`user_id\`、\`order_id\`
- 索引：\`idx_表_列\`，如 \`idx_users_email\`
- 约束：\`pk_\`、\`fk_\`、\`uq_\`、\`ck_\`

**2. 数据类型选择**
- ID：\`INTEGER PRIMARY KEY\` / \`BIGINT\`
- 金额：\`NUMERIC(10, 2)\`
- 时间：\`TEXT\`（SQLite ISO 格式）/ \`TIMESTAMP\`
- 状态：\`TEXT\`（枚举值）/ \`INTEGER\`（0/1/2）
- 长文本：\`TEXT\`

**3. 约束**
- 主键：每表必有
- NOT NULL：核心字段必加
- UNIQUE：业务唯一字段（邮箱、手机号）
- CHECK：枚举值、范围约束
- 外键：根据一致性需求决定

**4. 索引**
- 外键列建索引
- 常用 WHERE 条件建索引
- 排序列建索引
- 唯一约束自动建索引

**5. 时间戳**
- 必有 \`created_at\` 和 \`updated_at\`

**6. 软删除**
- 核心表加 \`deleted_at\`

### 九、实战：电商系统表设计

\`\`\`sql
-- 1. 用户表
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'banned', 'deleted')),
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime')),
  deleted_at TEXT
);

-- 2. 商品分类表（自关联，树形结构）
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id INTEGER,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- 3. 商品表
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  category_id INTEGER,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK(price > 0),
  stock INTEGER DEFAULT 0 CHECK(stock >= 0),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'draft')),
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 4. 订单表
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending'
    CHECK(status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  shipping_address TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 5. 订单详情表（一对多）
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,        -- 冗余：保留下单时商品名
  unit_price NUMERIC(10, 2) NOT NULL, -- 冗余：保留下单时价格
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  subtotal NUMERIC(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 6. 购物车表（一对多）
CREATE TABLE cart_items (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE (user_id, product_id)  -- 同一用户同一商品只一条记录
);
\`\`\`

### 十、踩坑点

**坑 1：用业务字段作主键**
身份证号、手机号会变。一旦变了，所有外键都要改，灾难。

**坑 2：外键不加索引**
\`\`\`sql
-- 外键列 dept_id 没索引
SELECT * FROM employees WHERE dept_id = 1;  -- 全表扫描
\`\`\`
**解决**：外键列必加索引。

**坑 3：忘记时间戳**
没有 \`created_at\` 无法追溯，没有 \`updated_at\` 不知道数据新鲜度。

**坑 4：软删除查询漏条件**
\`\`\`sql
-- ❌ 漏了 deleted_at IS NULL
SELECT * FROM users;
-- ✅ 每次都要加
SELECT * FROM users WHERE deleted_at IS NULL;
\`\`\`
用视图封装：\`CREATE VIEW active_users AS SELECT ... WHERE deleted_at IS NULL\`。

**坑 5：多对多忘记关联表**
直接在学生表加 \`course_ids\` 字段存数组 → 违反 1NF，无法 JOIN。

### 十一、生产建议

1. **先画 ER 图再建表**：磨刀不误砍柴工
2. **主键用自增整数或雪花 ID**：不要用业务字段
3. **核心表加时间戳和软删除**：可追溯、可恢复
4. **外键必加索引**：避免全表扫描
5. **命名统一规范**：团队协作必需
6. **大表设计预留扩展**：分表、分区考虑

下面代码演示 ER 建模与电商系统设计。`,
    code: `-- ============================================================
-- 第五章演示：ER 建模与设计实战
-- ============================================================

PRAGMA foreign_keys = ON;

-- 1. 一对一关系：用户 ↔ 用户详情
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE user_profiles (
  user_id INTEGER PRIMARY KEY,  -- 主键 = 外键
  bio TEXT,
  avatar TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (username, email) VALUES ('alice', 'alice@example.com');
INSERT INTO user_profiles (user_id, bio, avatar) VALUES (1, '热爱编程', 'avatar1.png');

SELECT '1. 一对一关系:' AS info;
SELECT u.username, up.bio, up.avatar
FROM users u
JOIN user_profiles up ON u.id = up.user_id;

-- 2. 一对多关系：部门 ↔ 员工
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  dept_id INTEGER,  -- 外键在"多"的一方
  FOREIGN KEY (dept_id) REFERENCES departments(id)
);

INSERT INTO departments (name) VALUES ('技术部'), ('市场部');
INSERT INTO employees (name, dept_id) VALUES ('张三', 1), ('李四', 1), ('王五', 2);

SELECT '2. 一对多关系（部门 → 员工）:' AS info;
SELECT d.name AS 部门, e.name AS 员工
FROM departments d
LEFT JOIN employees e ON e.dept_id = d.id
ORDER BY d.id, e.id;

-- 3. 多对多关系：学生 ↔ 课程
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE enrollments (
  student_id INTEGER,
  course_id INTEGER,
  enrolled_at TEXT DEFAULT (datetime('now', 'localtime')),
  PRIMARY KEY (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

INSERT INTO students (name) VALUES ('小明'), ('小红');
INSERT INTO courses (name) VALUES ('数学'), ('英语'), ('物理');
INSERT INTO enrollments (student_id, course_id) VALUES (1, 1), (1, 2), (2, 1), (2, 3);

SELECT '3. 多对多关系（学生 ↔ 课程）:' AS info;
SELECT s.name AS 学生, c.name AS 课程
FROM students s
JOIN enrollments e ON e.student_id = s.id
JOIN courses c ON e.course_id = c.id
ORDER BY s.id, c.id;

-- 4. 电商系统核心表
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK(price > 0),
  stock INTEGER DEFAULT 0 CHECK(stock >= 0),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'draft')),
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime')),
  deleted_at TEXT
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending'
    CHECK(status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,        -- 冗余
  unit_price NUMERIC(10, 2) NOT NULL, -- 冗余
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  subtotal NUMERIC(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 插入数据
INSERT INTO products (name, price, stock) VALUES
  ('手机', 2999.00, 100),
  ('耳机', 299.00, 200),
  ('键盘', 599.00, 150);

INSERT INTO orders (user_id, total_amount, status) VALUES (1, 3598.00, 'paid');
INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
  (1, 1, '手机', 2999.00, 1, 2999.00),
  (1, 2, '耳机', 299.00, 2, 598.00);

SELECT '4. 电商系统 - 订单详情:' AS info;
SELECT o.id AS 订单号, o.status AS 状态, o.total_amount AS 总额,
       oi.product_name AS 商品, oi.unit_price AS 单价, oi.quantity AS 数量, oi.subtotal AS 小计
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
ORDER BY o.id, oi.id;

-- 5. 树形结构（分类自关联）
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id INTEGER,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

INSERT INTO categories (name, parent_id) VALUES
  ('电子产品', NULL),
  ('服装', NULL),
  ('手机', 1),
  ('电脑', 1),
  ('男装', 2),
  ('女装', 2);

SELECT '5. 树形结构（分类层级）:' AS info;
SELECT c1.name AS 一级分类, c2.name AS 二级分类
FROM categories c1
LEFT JOIN categories c2 ON c2.parent_id = c1.id
WHERE c1.parent_id IS NULL
ORDER BY c1.id, c2.id;

-- 6. 软删除演示
UPDATE products SET deleted_at = datetime('now', 'localtime') WHERE id = 3;
SELECT '6. 软删除后（耳机已"删除"，查询未删除商品）:' AS info;
SELECT id, name, deleted_at FROM products WHERE deleted_at IS NULL;

-- 7. updated_at 自动更新触发器
CREATE TRIGGER trg_products_update_time
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
  UPDATE products SET updated_at = datetime('now', 'localtime') WHERE id = OLD.id;
END;

UPDATE products SET price = 2899.00 WHERE id = 1;
SELECT '7. 触发器自动更新 updated_at:' AS info;
SELECT id, name, price, created_at, updated_at FROM products WHERE id = 1;

-- 8. 设计 Checklist 参考表
CREATE TABLE design_checklist (
  item TEXT PRIMARY KEY,
  description TEXT
);

INSERT INTO design_checklist VALUES
  ('命名规范', '表名复数、列名下划线、外键表名单数_id'),
  ('主键设计', '自增整数或雪花ID，不用业务字段'),
  ('时间戳', '必有 created_at 和 updated_at'),
  ('软删除', '核心表加 deleted_at 字段'),
  ('约束', 'NOT NULL / UNIQUE / CHECK 按需添加'),
  ('外键索引', '外键列必加索引'),
  ('数据类型', '金额用 NUMERIC，时间用 TEXT/ISO'),
  ('枚举值', '状态字段用 CHECK 约束枚举');

SELECT '8. 设计 Checklist:' AS info;
SELECT * FROM design_checklist;`,
  },
];
