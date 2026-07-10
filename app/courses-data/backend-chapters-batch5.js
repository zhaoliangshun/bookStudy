// =============================================================
// 后端开发综合教程 —— 第五批章节（数据存储，共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. backend-sql           — 关系型数据库与 SQL
//   2. backend-index         — 索引原理与优化
//   3. backend-transaction   — 事务与隔离级别
//   4. backend-sql-tuning    — SQL 调优与执行计划
//   5. backend-nosql         — NoSQL 与 CAP 理论
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名（数据存储）
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（语言无关原理 + 多语言对照）
//   code    : 可直接运行的 Node.js 代码（沙箱内执行，用内存结构模拟数据库）
//
// 代码运行环境约束（沙箱）：
//   - 仅可 require: fs, path, os, url, crypto, util, events, stream,
//     buffer, querystring, string_decoder, zlib, assert, timers
//   - 没有 http / net / child_process / dns / mysql / pg，数据库概念用内存结构模拟
//   - 全局: console, process, Buffer, setTimeout, Promise, URL 等
//   - 支持 top-level await，用 console.log 输出结果
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：关系型数据库与 SQL
  // =========================================================
  {
    id: "backend-sql",
    group: "数据存储",
    icon: "🗄",
    title: "关系型数据库与 SQL",
    content: `## 关系型数据库与 SQL

**关系型数据库（Relational Database, RDBMS）** 是后端系统最核心、最持久的数据存储基础设施。从 1970 年 E.F.Codd 提出关系模型至今，半个多世纪过去，关系型数据库依然是绝大多数业务系统的数据底座。**SQL（Structured Query Language，结构化查询语言）** 则是与之配套的标准查询语言。

可以说，不理解关系型数据库与 SQL，就无法胜任后端开发。本章将从关系模型底层原理出发，系统讲解 RDBMS 架构、SQL 全分类语法、JOIN 连接、聚合分组、子查询、数据库范式、主流数据库对比、窗口函数以及 SQL 编写规范，力求让你建立起完整、扎实的关系数据库知识体系。

### 一、关系模型基础

#### 1.1 什么是关系模型

关系模型的核心思想是：**把数据组织成二维表（Table），表与表之间通过"关系"（公共列）关联**。这个看似简单的模型，却具备坚实的数学基础——关系代数。一张表在数学上就是一个"关系（Relation）"，是若干元组（Tuple）的集合。

一张表的结构如下：

\`\`\`
┌────────┬──────────┬─────┬───────────┐
│ id (列)│ name(列) │ age │ dept_id   │
├────────┼──────────┼─────┼───────────┤
│ 1      │ 张三     │ 28  │ 100       │ ← 行(元组/记录)
│ 2      │ 李四     │ 35  │ 100       │
│ 3      │ 王五     │ 22  │ 200       │
└────────┴──────────┴─────┴───────────┘
   ↑                              ↑
 主键列                        外键列(关联 dept 表)
\`\`\`

#### 1.2 表、行、列的精确定义

- **表（Table / Relation）**：数据的逻辑容器，由列定义和行数据组成。一张表对应一个"实体"（如用户、订单）或一个"关系"（如用户-角色映射表）。
- **列（Column / Attribute / 字段）**：表的结构单元，每列有名称和数据类型。列的定义决定了数据的"模式（Schema）"。例如 \`users\` 表有 \`id INT\`、\`name VARCHAR(50)\`、\`created_at DATETIME\` 等列。
- **行（Row / Tuple / Record / 记录）**：表中的一条数据实例。每行是各列取值的一个组合。关系模型要求"行的无序性"——表中行的顺序不影响语义。

\`\`\`sql
-- 建表时定义"列"，插入时填充"行"
CREATE TABLE users (
  id          INT          PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(50)  NOT NULL,
  email       VARCHAR(100) UNIQUE,
  age         INT          CHECK (age >= 0 AND age <= 150),
  dept_id     INT,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, age, dept_id) VALUES
  ('张三', 'zs@example.com', 28, 100),
  ('李四', 'ls@example.com', 35, 100),
  ('王五', 'ww@example.com', 22, 200);
\`\`\`

#### 1.3 主键（Primary Key）

**主键**是表中唯一标识每一行的列（或列组合），必须满足两个约束：

1. **唯一性（UNIQUE）**：任意两行的主键值不能相同。
2. **非空性（NOT NULL）**：主键值不能为 NULL。

主键的作用有三：
- **标识行**：通过主键精确定位一行数据（\`WHERE id = 5\`）。
- **聚簇索引**：在 InnoDB 中，主键决定了数据在磁盘上的物理存储顺序（详见索引章节）。
- **外键引用**：其他表通过外键引用本表主键来建立关系。

**主键选型原则**：

| 主键类型 | 优点 | 缺点 | 适用场景 |
|---------|------|------|---------|
| 自增整数 (AUTO_INCREMENT) | 占用小、插入快、有序（利于 B+ 树写入） | 单库自增、易猜测、分库困难 | 单体应用、中小规模 |
| UUID | 全局唯一、无中心、适合分布式 | 36 字节大、无序导致 B+ 树页分裂、索引性能差 | 分布式系统（需配合有序 UUID） |
| 雪花算法 Snowflake | 趋势递增、全局唯一、可分布式生成 | 需要时钟回拨处理 | 分布式高并发 |
| 业务主键（如身份证号） | 业务可读 | 一旦业务变更极痛苦、可能泄露隐私 | 不推荐作为技术主键 |

\`\`\`sql
-- 推荐做法：技术主键用自增 id，业务唯一键用 UNIQUE 约束
CREATE TABLE orders (
  id           BIGINT       PRIMARY KEY AUTO_INCREMENT,
  order_no     VARCHAR(32)  UNIQUE NOT NULL,  -- 业务订单号
  user_id      BIGINT       NOT NULL,
  amount       DECIMAL(10,2) NOT NULL,
  INDEX idx_user (user_id)
);
\`\`\`

#### 1.4 外键（Foreign Key）

**外键**用于建立表与表之间的引用关系。外键列的值必须引用另一张表（父表）的主键或唯一键，或为 NULL。

\`\`\`sql
CREATE TABLE departments (
  id    INT PRIMARY KEY,
  name  VARCHAR(50) NOT NULL
);

CREATE TABLE employees (
  id       INT PRIMARY KEY,
  name     VARCHAR(50) NOT NULL,
  dept_id  INT,
  CONSTRAINT fk_dept FOREIGN KEY (dept_id) REFERENCES departments(id)
    ON DELETE CASCADE       -- 删除部门时级联删除员工
    ON UPDATE RESTRICT      -- 不允许修改被引用的部门 id
);
\`\`\`

外键的 **参照动作（Referential Action）** 决定了父表数据变更时子表如何处理：

| 动作 | 含义 |
|------|------|
| RESTRICT / NO ACTION | 拒绝父表操作（默认） |
| CASCADE | 级联操作（父删则子删，父改则子改） |
| SET NULL | 子表外键置 NULL（要求该列允许 NULL） |
| SET DEFAULT | 子表外键置默认值（很少用） |

> **生产实践提示**：在互联网高并发场景中，**外键约束经常被禁用**。原因有二：①每次写入都要检查外键，影响性能；②级联删除在大表上极其危险。取而代之的是在**应用层保证数据一致性**，并定期跑对账脚本校验。但外键在传统企业应用、强一致性要求的系统中仍然重要。

#### 1.5 约束（Constraint）

约束是数据库层面保证数据正确性的规则。常见的约束有六种：

| 约束 | 作用 | 关键字 |
|------|------|--------|
| 主键约束 | 唯一+非空标识行 | PRIMARY KEY |
| 唯一约束 | 列值唯一（允许 NULL） | UNIQUE |
| 非空约束 | 列值不能为空 | NOT NULL |
| 默认值约束 | 未指定时填充默认值 | DEFAULT |
| 检查约束 | 自定义条件校验 | CHECK |
| 外键约束 | 引用完整性 | FOREIGN KEY |

\`\`\`sql
CREATE TABLE products (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  price       DECIMAL(10,2) NOT NULL CHECK (price > 0),
  stock       INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku         VARCHAR(20) UNIQUE,
  category_id INT NOT NULL
);
\`\`\`

约束的价值在于：**即使应用代码有 bug，数据库也不会写入脏数据**。这是"纵深防御"思想在数据层的体现。很多团队只依赖应用层校验，一旦有遗漏的写入路径（如数据迁移脚本、后台直接改库），就会产生脏数据。

#### 1.6 索引（Index）概览

索引是提升查询性能的关键数据结构。没有索引时，查询必须**全表扫描**（逐行检查），数据量大时性能灾难。有了索引，数据库可以快速定位到目标行。

\`\`\`sql
-- 在常用查询条件列上建索引
CREATE INDEX idx_email ON users(email);          -- 普通索引
CREATE UNIQUE INDEX idx_sku ON products(sku);    -- 唯一索引
CREATE INDEX idx_dept_age ON employees(dept_id, age); -- 联合索引
\`\`\`

索引是双刃剑：**加速读，但拖慢写**（每次 INSERT/UPDATE/DELETE 都要同步维护索引）。索引的深入原理（B+ 树、回表、覆盖索引、最左前缀等）将在下一章详述。

### 二、RDBMS 架构详解

理解 RDBMS 的内部架构，有助于你理解 SQL 是如何被执行的，以及为什么有些 SQL 快、有些慢。一个典型的关系型数据库（以 MySQL 为例）从上到下分为以下几层：

\`\`\`
客户端 (JDBC / driver / cli)
        │
        ▼
┌──────────────────────────────────────┐
│ 1. 连接管理器 (Connection Manager)    │  ← 连接池、权限校验
├──────────────────────────────────────┤
│ 2. SQL 接口 (SQL Interface)           │  ← 接收 SQL、返回结果
├──────────────────────────────────────┤
│ 3. 解析器 (Parser)                    │  ← 词法/语法分析 → 解析树
├──────────────────────────────────────┤
│ 4. 优化器 (Optimizer)                 │  ← 基于成本选择执行计划
├──────────────────────────────────────┤
│ 5. 执行器 (Executor)                  │  ← 调用存储引擎接口
├──────────────────────────────────────┤
│ 6. 存储引擎 (Storage Engine)          │  ← InnoDB/MyISAM 真正读写数据
├──────────────────────────────────────┤
│ 7. 文件系统 / 磁盘                     │  ← 数据文件、日志文件
└──────────────────────────────────────┘
\`\`\`

#### 2.1 连接管理器

每个客户端连接在服务器端对应一个**线程**（线程池复用）。连接建立时做两件事：
1. **身份认证**：校验用户名、密码、来源 IP。
2. **权限加载**：将该用户的权限读入内存，后续 SQL 校验权限用。

连接是稀缺资源：MySQL 默认 max_connections=151，生产通常调到 500-2000。应用端用**连接池**（HikariCP、Druid）复用连接，避免频繁建立/断开。

#### 2.2 SQL 接口

接收客户端发来的 SQL 文本，返回结果集或执行状态。它处理的不只是 SELECT/INSERT/UPDATE/DELETE，还包括：DDL（建表改表）、DCL（权限）、存储过程调用、预处理语句（Prepared Statement）等。

#### 2.3 解析器（Parser）

解析器做两步：

1. **词法分析（Lexical Analysis）**：把 SQL 字符串拆成 token。例如 \`SELECT id FROM users WHERE age > 18\` 被拆成 \`SELECT\`、\`id\`、\`FROM\`、\`users\`、\`WHERE\`、\`age\`、\`>\`、\`18\`。
2. **语法分析（Syntax Analysis）**：按 SQL 语法规则把 token 组织成**解析树（Parse Tree）**。如果 SQL 语法错误，在这一步就报错（如 \`ERROR 1064: You have an error in your SQL syntax\`）。

解析器只关心语法是否正确，不关心表是否存在、列是否存在。

#### 2.4 优化器（Optimizer）

优化器是数据库的"大脑"。它接收解析树，生成**执行计划（Execution Plan）**——即"用什么顺序、用什么索引、用什么 JOIN 算法来执行这条 SQL"。优化器分为两类：

- **基于规则的优化（RBO, Rule-Based Optimization）**：按预设规则改写 SQL，如"有索引就用索引"。早期 Oracle 用这种方式，简单但不一定最优。
- **基于成本的优化（CBO, Cost-Based Optimization）**：估算每种执行方案的"成本"（CPU + IO），选成本最低的。现代数据库（MySQL 5.7+、PostgreSQL、Oracle）都用 CBO。

成本估算依赖**统计信息**（表的行数、索引的基数 cardinality、数据分布）。统计信息不准会导致优化器选错计划——这是很多"突然变慢"问题的根源。

\`\`\`sql
-- 查看优化器选择的执行计划
EXPLAIN SELECT * FROM users WHERE age > 18;
EXPLAIN ANALYZE SELECT * FROM users u JOIN orders o ON u.id = o.user_id; -- PostgreSQL
\`\`\`

#### 2.5 执行器（Executor）

执行器按执行计划调用存储引擎的接口，逐行获取数据、应用 WHERE 过滤、做 JOIN、排序、聚合等。执行器是"调用方"，存储引擎是"实现方"。同一个执行计划，换不同的存储引擎，执行器代码不变，但底层读写方式不同。

#### 2.6 存储引擎（Storage Engine）

存储引擎负责数据在磁盘上的**存储格式**和**读写方式**。MySQL 的插件式存储引擎架构是其特色：

| 存储引擎 | 事务 | 行锁 | 外键 | 索引结构 | 适用场景 |
|---------|------|------|------|---------|---------|
| InnoDB | ✅ | ✅ | ✅ | B+ 树（聚簇） | 默认引擎，OLTP 通用 |
| MyISAM | ❌ | ❌(表锁) | ❌ | B+ 树（非聚簇） | 只读/读多写少（已淘汰） |
| Memory | ❌ | ❌(表锁) | ❌ | 哈希/B 树 | 临时表、缓存 |
| TokuDB | ✅ | ✅ | ❌ | Fractal Tree | 压缩、写多 |

**InnoDB 是绝对主流**，后续章节默认讨论 InnoDB。InnoDB 的关键特性：聚簇索引、MVCC 多版本并发控制、崩溃恢复（redo log）、缓冲池（buffer pool）。

### 三、SQL 分类详解

SQL 按功能分为五大类，初学者常混淆，这里逐一明确：

#### 3.1 DDL（Data Definition Language，数据定义语言）

用于定义和修改**数据库结构**（表、视图、索引、数据库本身）。

\`\`\`sql
-- 建库
CREATE DATABASE shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 建表
CREATE TABLE users (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(50) NOT NULL,
  email       VARCHAR(100) UNIQUE,
  age         INT DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 改表（加列、改列、删列、改索引）
ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER email;
ALTER TABLE users MODIFY COLUMN name VARCHAR(100) NOT NULL;
ALTER TABLE users DROP COLUMN age;
ALTER TABLE users ADD INDEX idx_name (name);

-- 删表（谨慎！删表删数据和结构）
DROP TABLE users;

-- 清空表（保留结构，删所有数据，比 DELETE 快，不可回滚）
TRUNCATE TABLE users;

-- 删库
DROP DATABASE shop;
\`\`\`

> **ALTER TABLE 的代价**：加列在 MySQL 8.0 之前可能需要重建整张表（锁表），8.0 支持 INSTANT ADD COLUMN（瞬时加列）。生产环境改大表结构要特别小心，常用工具：pt-online-schema-change、gh-ost。

#### 3.2 DML（Data Manipulation Language，数据操作语言）

用于操作表中的**数据行**——增、删、改。

\`\`\`sql
-- 插入单行
INSERT INTO users (name, email) VALUES ('张三', 'zs@example.com');

-- 插入多行（批量插入，比循环单条插入快得多）
INSERT INTO users (name, email) VALUES
  ('李四', 'ls@example.com'),
  ('王五', 'ww@example.com'),
  ('赵六', 'zl@example.com');

-- 插入时若唯一键冲突则更新（upsert）
INSERT INTO users (id, name, email) VALUES (1, '张三', 'new@example.com')
  ON DUPLICATE KEY UPDATE email = VALUES(email), name = VALUES(name);

-- 更新（务必带 WHERE！否则全表更新）
UPDATE users SET age = age + 1 WHERE id = 1;

-- 删除（务必带 WHERE！否则清空全表）
DELETE FROM users WHERE id = 1;

-- MySQL 安全模式：不带 WHERE 的 UPDATE/DELETE 直接报错
SET sql_safe_updates = 1;
\`\`\`

**DELETE vs TRUNCATE vs DROP 对比**：

| 操作 | 作用 | 速度 | 可回滚 | 触发器 | 自增重置 |
|------|------|------|--------|--------|---------|
| DELETE | 按条件删行 | 慢（逐行删，记日志） | ✅ | ✅ | ❌ |
| TRUNCATE | 清空整表 | 快（直接释放数据页） | ❌ | ❌ | ✅ |
| DROP | 删表结构+数据 | 最快 | ❌ | - | - |

#### 3.3 DQL（Data Query Language，数据查询语言）

DQL 核心是 SELECT，是 SQL 中最复杂、最高频的语句。SELECT 的**逻辑执行顺序**与书写顺序不同，理解这点对写 SQL 至关重要：

\`\`\`
书写顺序:  SELECT → FROM → JOIN → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT
执行顺序:  FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
\`\`\`

也就是说：先确定数据来源（FROM/JOIN），再过滤（WHERE），再分组（GROUP BY），再过滤分组（HAVING），然后选择列（SELECT），最后排序（ORDER BY）和分页（LIMIT）。

这就是为什么 \`SELECT name AS n ... ORDER BY n\` 可以用别名排序（ORDER BY 在 SELECT 之后），而 \`WHERE n = 'x'\` 不行（WHERE 在 SELECT 之前，别名还没产生）。

#### 3.4 DCL（Data Control Language，数据控制语言）

管理**用户权限**。

\`\`\`sql
-- 创建用户
CREATE USER 'appuser'@'10.0.%.%' IDENTIFIED BY 'StrongPwd!23';

-- 授权（最小权限原则）
GRANT SELECT, INSERT, UPDATE ON shop.* TO 'appuser'@'10.0.%.%';

-- 收回权限
REVOKE DELETE ON shop.* FROM 'appuser'@'10.0.%.%';

-- 查看权限
SHOW GRANTS FOR 'appuser'@'10.0.%.%';

-- 刷新权限
FLUSH PRIVILEGES;
\`\`\`

#### 3.5 TCL（Transaction Control Language，事务控制语言）

\`\`\`sql
BEGIN;        -- 或 START TRANSACTION，开启事务
-- ... 一组 DML ...
COMMIT;       -- 提交，永久生效
-- 或
ROLLBACK;     -- 回滚，撤销事务内所有操作

SAVEPOINT sp1;  -- 设置保存点
-- ... 一些操作 ...
ROLLBACK TO sp1; -- 回滚到保存点（不是全部回滚）
\`\`\`

事务的 ACID 特性将在第三章详述。

### 四、SELECT 完整语法

SELECT 是 SQL 的核心，这里完整拆解其语法。

#### 4.1 基础查询

\`\`\`sql
-- 查询所有列（生产环境避免 SELECT *，原因：①传输冗余数据 ②表结构变化影响 ③无法用覆盖索引）
SELECT * FROM users;

-- 查询指定列
SELECT id, name, email FROM users;

-- 去重
SELECT DISTINCT dept_id FROM employees;

-- 别名
SELECT id AS user_id, name AS username FROM users;
SELECT id user_id, name username FROM users; -- AS 可省略
\`\`\`

#### 4.2 WHERE 条件过滤

WHERE 支持丰富的条件运算符：

\`\`\`sql
-- 比较运算符
SELECT * FROM products WHERE price > 100;
SELECT * FROM products WHERE price >= 50 AND price <= 200;
SELECT * FROM products WHERE price BETWEEN 50 AND 200;  -- 等价上一行

-- 集合判断
SELECT * FROM users WHERE dept_id IN (100, 200, 300);
SELECT * FROM users WHERE dept_id NOT IN (100, 200);

-- 模糊匹配（LIKE 支持 % 任意多字符 _ 单个字符）
SELECT * FROM users WHERE name LIKE '张%';   -- 以张开头的名字
SELECT * FROM users WHERE name LIKE '_三';    -- 两个字且第二个是三

-- NULL 判断（必须用 IS NULL，不能用 = NULL）
SELECT * FROM users WHERE email IS NULL;
SELECT * FROM users WHERE email IS NOT NULL;

-- 逻辑组合
SELECT * FROM users WHERE (age > 18 AND age < 60) OR dept_id = 100;
\`\`\`

> **NULL 的陷阱**：NULL 表示"未知值"，不等于任何值（包括另一个 NULL）。\`NULL = NULL\` 的结果是 NULL（不是 true），\`NULL != NULL\` 也是 NULL。聚合函数（COUNT/SUM/AVG）自动忽略 NULL，但 COUNT(*) 会计入所有行。

#### 4.3 ORDER BY 排序

\`\`\`sql
-- 升序（默认 ASC）
SELECT * FROM users ORDER BY age ASC;

-- 降序
SELECT * FROM users ORDER BY age DESC;

-- 多列排序（先按 dept_id 升序，dept_id 相同的再按 age 降序）
SELECT * FROM users ORDER BY dept_id ASC, age DESC;

-- 按表达式排序
SELECT name, price * stock AS total_value FROM products ORDER BY total_value DESC;
\`\`\`

> **排序的性能**：如果 ORDER BY 的列有索引，数据库可直接利用索引的有序性避免 filesort（内存/磁盘排序）。否则需要对结果集排序，数据量大时性能差。详见索引与调优章节。

#### 4.4 GROUP BY 分组与 HAVING

\`\`\`sql
-- 按部门分组，统计每个部门人数和平均年龄
SELECT
  dept_id,
  COUNT(*)       AS emp_count,
  AVG(age)       AS avg_age,
  MAX(age)       AS max_age,
  MIN(age)       AS min_age,
  SUM(salary)    AS total_salary
FROM employees
GROUP BY dept_id;

-- HAVING 过滤分组（where 过滤行，having 过滤分组）
SELECT dept_id, COUNT(*) AS cnt
FROM employees
GROUP BY dept_id
HAVING COUNT(*) > 5;       -- 只要人数超过 5 的部门
\`\`\`

**WHERE vs HAVING 的区别**（高频面试题）：

| 维度 | WHERE | HAVING |
|------|-------|--------|
| 作用对象 | 行（过滤单行数据） | 分组（过滤聚合结果） |
| 执行时机 | GROUP BY 之前 | GROUP BY 之后 |
| 能否用聚合函数 | ❌ 不能 | ✅ 能 |
| 能否用列别名 | ❌ 不能 | 看数据库（MySQL 可以） |

记忆口诀：**WHERE 过滤行，HAVING 过滤组；WHERE 先执行，HAVING 后执行**。

#### 4.5 LIMIT 分页

\`\`\`sql
-- MySQL / PostgreSQL / SQLite 语法
SELECT * FROM users ORDER BY id LIMIT 10;            -- 前 10 条
SELECT * FROM users ORDER BY id LIMIT 20, 10;        -- 跳过 20 条取 10 条（第 3 页）
SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 20;  -- 等价写法

-- Oracle 语法（用 ROWNUM 或 FETCH）
SELECT * FROM users WHERE ROWNUM <= 10;

-- SQL Server 语法
SELECT TOP 10 * FROM users;
\`\`\`

**深分页问题**：\`LIMIT 1000000, 10\` 看似只取 10 条，但数据库要**先扫描前 1000010 行再丢弃前 100 万行**，极慢。优化方案在调优章节详述。

### 五、JOIN 连接详解

JOIN 是关系型数据库的精髓——把分散在多张表中的数据按关系"拼"起来。

#### 5.1 笛卡尔积与连接的数学基础

JOIN 的数学基础是**笛卡尔积（Cartesian Product）**：A 表 m 行、B 表 n 行，笛卡尔积是 m×n 行（A 的每行配 B 的每行）。JOIN 就是在笛卡尔积上加"连接条件"做过滤。

我们用两张示例表贯穿讲解：

\`\`\`sql
-- 员工表
SELECT * FROM employees;
-- | id | name  | dept_id |
-- |----|-------|---------|
-- |  1 | 张三  |    1    |
-- |  2 | 李四  |    1    |
-- |  3 | 王五  |    2    |
-- |  4 | 赵六  |   NULL  |

-- 部门表
SELECT * FROM departments;
-- | id | name   |
-- |----|--------|
-- |  1 | 技术部 |
-- |  2 | 市场部 |
-- |  3 | 财务部 |   ← 没有员工的部门
\`\`\`

#### 5.2 INNER JOIN（内连接）

只返回**两表都匹配**的行。用 Venn 图理解就是两集合的**交集**。

\`\`\`sql
SELECT e.name AS emp, d.name AS dept
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id;

-- 结果：
-- | emp  | dept    |
-- |------|---------|
-- | 张三 | 技术部  |
-- | 李四 | 技术部  |
-- | 王五 | 市场部  |
-- 赵六(dept_id=NULL)不出现，财务部(无员工)不出现
\`\`\`

Venn 图：

\`\`\`
    员工表           部门表
   ┌──────┐        ┌──────┐
   │      │        │      │
   │  张三 │═══════│ 技术部│
   │  李四 │═══════│ 市场部│  ← INNER JOIN 取交集
   │  王五 │        │      │
   │  赵六 │        │ 财务部│
   └──────┘        └──────┘
\`\`\`

#### 5.3 LEFT JOIN（左连接）

返回**左表所有行**，右表不匹配的列填 NULL。以左表为准。

\`\`\`sql
SELECT e.name AS emp, d.name AS dept
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;

-- 结果：
-- | emp  | dept    |
-- |------|---------|
-- | 张三 | 技术部  |
-- | 李四 | 技术部  |
-- | 王五 | 市场部  |
-- | 赵六 | NULL    |  ← 左表全保留，右表无匹配填 NULL
\`\`\`

LEFT JOIN 的常见用法是"找出左表中**没有**匹配右表的行"：

\`\`\`sql
-- 找出没有部门的员工
SELECT e.name FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id
WHERE d.id IS NULL;
-- 结果：赵六
\`\`\`

#### 5.4 RIGHT JOIN（右连接）

与 LEFT JOIN 对称，返回**右表所有行**。实际开发中较少用（习惯上把主表放左边用 LEFT JOIN）。

\`\`\`sql
SELECT e.name AS emp, d.name AS dept
FROM employees e
RIGHT JOIN departments d ON e.dept_id = d.id;

-- 结果：
-- | emp  | dept    |
-- |------|---------|
-- | 张三 | 技术部  |
-- | 李四 | 技术部  |
-- | 王五 | 市场部  |
-- | NULL | 财务部  |  ← 右表全保留
\`\`\`

#### 5.5 FULL JOIN（全外连接）

返回**左右表所有行**，不匹配的填 NULL。相当于 LEFT JOIN 和 RIGHT JOIN 的并集。

\`\`\`sql
-- PostgreSQL / Oracle / SQL Server 原生支持
SELECT e.name AS emp, d.name AS dept
FROM employees e
FULL OUTER JOIN departments d ON e.dept_id = d.id;

-- MySQL 不支持 FULL JOIN，用 UNION 模拟
SELECT e.name AS emp, d.name AS dept
FROM employees e LEFT JOIN departments d ON e.dept_id = d.id
UNION
SELECT e.name AS emp, d.name AS dept
FROM employees e RIGHT JOIN departments d ON e.dept_id = d.id;

-- 结果：
-- | emp  | dept    |
-- |------|---------|
-- | 张三 | 技术部  |
-- | 李四 | 技术部  |
-- | 王五 | 市场部  |
-- | 赵六 | NULL    |
-- | NULL | 财务部  |
\`\`\`

#### 5.6 CROSS JOIN（交叉连接）

产生**笛卡尔积**，不加连接条件。慎用——m 行 × n 行可能产生海量结果。

\`\`\`sql
-- 显式写法
SELECT e.name, d.name FROM employees e CROSS JOIN departments d;

-- 隐式写法（逗号连接，老式写法）
SELECT e.name, d.name FROM employees e, departments d;

-- 合理用途：生成组合（如 3 个颜色 × 4 个尺寸 = 12 个 SKU）
SELECT c.color, s.size FROM colors c CROSS JOIN sizes s;
\`\`\`

#### 5.7 SELF JOIN（自连接）

表与自身连接，常用于**层级关系**（员工-经理、分类-父分类）。

\`\`\`sql
-- 员工表中有 manager_id 自引用
CREATE TABLE employees (
  id         INT PRIMARY KEY,
  name       VARCHAR(50),
  manager_id INT,   -- 指向本表 id
  FOREIGN KEY (manager_id) REFERENCES employees(id)
);

-- 查询每个员工及其直接上级
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;

-- 查询所有下属及其"向上两级"的领导
SELECT e.name, m1.name AS direct_mgr, m2.name AS grand_mgr
FROM employees e
LEFT JOIN employees m1 ON e.manager_id = m1.id
LEFT JOIN employees m2 ON m1.manager_id = m2.id;
\`\`\`

#### 5.8 JOIN 的多语言对照

\`\`\`java
// Java + JDBC
String sql = "SELECT u.name, o.amount FROM users u " +
             "LEFT JOIN orders o ON u.id = o.user_id WHERE u.id = ?";
PreparedStatement ps = conn.prepareStatement(sql);
ps.setLong(1, userId);
ResultSet rs = ps.executeQuery();
while (rs.next()) {
    System.out.println(rs.getString("name") + " " + rs.getBigDecimal("amount"));
}
\`\`\`

\`\`\`go
// Go + database/sql
rows, err := db.Query("SELECT u.name, o.amount FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.id = ?", userID)
if err != nil { log.Fatal(err) }
defer rows.Close()
for rows.Next() {
    var name string
    var amount sql.NullFloat64
    rows.Scan(&name, &amount)
}
\`\`\`

\`\`\`python
# Python + SQLAlchemy
result = db.session.execute(
    text("SELECT u.name, o.amount FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.id = :uid"),
    {"uid": user_id}
)
for row in result:
    print(row.name, row.amount)
\`\`\`

\`\`\`javascript
// Node.js + mysql2
const [rows] = await pool.execute(
  'SELECT u.name, o.amount FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.id = ?',
  [userId]
);
rows.forEach(r => console.log(r.name, r.amount));
\`\`\`

### 六、聚合函数与分组

#### 6.1 常用聚合函数

| 函数 | 作用 | 示例 |
|------|------|------|
| COUNT(*) | 统计行数（含 NULL 行） | COUNT(*) |
| COUNT(列) | 统计该列非 NULL 行数 | COUNT(email) |
| COUNT(DISTINCT 列) | 统计去重后的非 NULL 值数 | COUNT(DISTINCT dept_id) |
| SUM(列) | 求和（忽略 NULL） | SUM(amount) |
| AVG(列) | 平均值（忽略 NULL） | AVG(price) |
| MAX(列) | 最大值 | MAX(created_at) |
| MIN(列) | 最小值 | MIN(price) |
| GROUP_CONCAT(列) | 拼接成字符串（MySQL） | GROUP_CONCAT(name) |

\`\`\`sql
-- COUNT 的坑
SELECT COUNT(*) FROM users;       -- 总行数（包括 email 为 NULL 的行）
SELECT COUNT(email) FROM users;   -- email 非 NULL 的行数（可能小于上面）
SELECT AVG(age) FROM users;       -- 等于 SUM(age)/COUNT(age)，分母是非 NULL 的 age 数

-- GROUP_CONCAT：把分组内的值拼成一个字符串
SELECT dept_id, GROUP_CONCAT(name ORDER BY name SEPARATOR ', ') AS members
FROM employees GROUP BY dept_id;
-- | dept_id | members        |
-- |---------|----------------|
-- |    1    | 张三, 李四     |
-- |    2    | 王五           |
\`\`\`

#### 6.2 GROUP BY 详解

GROUP BY 把数据按指定列的值分组，每组产生一行聚合结果。**SELECT 中出现的非聚合列必须出现在 GROUP BY 中**（MySQL 的 ONLY_FULL_GROUP_BY 模式强制此规则）。

\`\`\`sql
-- 错误（name 不在 GROUP BY 中，也不在聚合函数中）
SELECT dept_id, name, COUNT(*) FROM employees GROUP BY dept_id;

-- 正确
SELECT dept_id, COUNT(*) FROM employees GROUP BY dept_id;
SELECT dept_id, MAX(salary), MIN(salary), AVG(salary) FROM employees GROUP BY dept_id;

-- 多列分组
SELECT dept_id, gender, COUNT(*) FROM employees GROUP BY dept_id, gender;
-- 按"部门+性别"分组，如技术部-男 10 人、技术部-女 5 人...
\`\`\`

#### 6.3 WITH ROLLUP 汇总

\`\`\`sql
-- 在分组结果末尾追加汇总行
SELECT dept_id, COUNT(*) AS cnt FROM employees
GROUP BY dept_id WITH ROLLUP;
-- | dept_id | cnt |
-- |---------|-----|
-- |    1    |  10 |
-- |    2    |   8 |
-- |  NULL   |  18 |  ← ROLLUP 汇总行（所有部门合计）
\`\`\`

### 七、子查询

子查询是嵌套在另一个 SQL 中的查询，按返回结果分为三类：

#### 7.1 标量子查询（返回单行单列）

\`\`\`sql
-- 查询年龄大于平均年龄的员工
SELECT * FROM employees
WHERE age > (SELECT AVG(age) FROM employees);

-- SELECT 子句中使用标量子查询
SELECT name, (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
FROM users u;
\`\`\`

#### 7.2 行子查询（返回单行多列）

\`\`\`sql
-- 查询和"张三"同部门同岗位的员工
SELECT * FROM employees
WHERE (dept_id, position) = (SELECT dept_id, position FROM employees WHERE name = '张三');
\`\`\`

#### 7.3 表子查询（返回多行多列）

\`\`\`sql
-- IN 子查询
SELECT * FROM orders
WHERE user_id IN (SELECT id FROM users WHERE age > 18);

-- FROM 子查询（派生表）
SELECT t.dept_id, t.cnt FROM
  (SELECT dept_id, COUNT(*) AS cnt FROM employees GROUP BY dept_id) t
WHERE t.cnt > 5;
\`\`\`

#### 7.4 EXISTS / NOT EXISTS

EXISTS 判断子查询是否返回行，返回 true/false。比 IN 更适合"关联子查询"（子查询引用外层表）。

\`\`\`sql
-- 查询有下单的用户
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- 等价于
SELECT * FROM users u WHERE u.id IN (SELECT DISTINCT user_id FROM orders);

-- NOT EXISTS：查询从未下单的用户（比 LEFT JOIN ... IS NULL 更直观）
SELECT * FROM users u
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
\`\`\`

**IN vs EXISTS 的选择**：驱动表大的用 IN（先执行子查询），驱动表小的用 EXISTS。现代优化器通常自动改写，差异不大。

#### 7.5 ANY / ALL

\`\`\`sql
-- 查询比"技术部"任意一人工资高的员工（> ANY = > MIN）
SELECT * FROM employees
WHERE salary > ANY (SELECT salary FROM employees WHERE dept_id = 1);

-- 查询比"技术部"所有人工资都高的员工（> ALL = > MAX）
SELECT * FROM employees
WHERE salary > ALL (SELECT salary FROM employees WHERE dept_id = 1);
\`\`\`

### 八、数据库范式

范式（Normal Form, NF）是关系数据库设计的规范化规则，目的是**减少数据冗余、消除异常**。常见的有 1NF、2NF、3NF、BCNF。

#### 8.1 第一范式 1NF（原子性）

**每一列的值是不可分割的原子值**。即一列不能存集合、数组、逗号分隔的多个值。

\`\`\`sql
-- 违反 1NF（联系方式存了多个值）
CREATE TABLE bad_users (
  id INT,
  name VARCHAR(50),
  contacts VARCHAR(200)  -- "手机:138, 邮箱:a@b.com, 微信:xxx"
);

-- 符合 1NF
CREATE TABLE users (id INT, name VARCHAR(50), phone VARCHAR(20), email VARCHAR(100));
-- 或拆成关联表
CREATE TABLE user_contacts (user_id INT, type VARCHAR(10), value VARCHAR(100));
\`\`\`

#### 8.2 第二范式 2NF（消除部分依赖）

在 1NF 基础上，**非主键列必须完全依赖整个主键**（不能只依赖主键的一部分）。主要针对复合主键。

\`\`\`sql
-- 违反 2NF：订单明细表用 (order_id, product_id) 做复合主键
CREATE TABLE bad_order_items (
  order_id    INT,
  product_id  INT,
  quantity    INT,
  product_name VARCHAR(100),  -- 只依赖 product_id，不依赖 order_id
  PRIMARY KEY (order_id, product_id)
);
-- 问题：product_name 冗余存储，产品改名要改多行

-- 符合 2NF：拆表
CREATE TABLE order_items (order_id INT, product_id INT, quantity INT, PRIMARY KEY(order_id, product_id));
CREATE TABLE products (id INT PRIMARY KEY, name VARCHAR(100));
\`\`\`

#### 8.3 第三范式 3NF（消除传递依赖）

在 2NF 基础上，**非主键列之间不能有传递依赖**。即非主键列必须直接依赖主键，不能依赖其他非主键列。

\`\`\`sql
-- 违反 3NF
CREATE TABLE bad_employees (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  dept_id INT,
  dept_name VARCHAR(50)  -- 依赖 dept_id，dept_id 依赖 id → 传递依赖
);
-- 问题：部门改名要改所有该部门员工行

-- 符合 3NF：拆表
CREATE TABLE employees (id INT PRIMARY KEY, name VARCHAR(50), dept_id INT);
CREATE TABLE departments (id INT PRIMARY KEY, name VARCHAR(50));
\`\`\`

#### 8.4 BCNF（Boyce-Codd 范式）

3NF 的加强版：**所有依赖的左侧都必须是候选键**。3NF 允许非键属性决定键的子集，BCNF 不允许。

#### 8.5 反范式设计

范式消除冗余但也带来大量 JOIN，**读性能下降**。在高读、低写场景，常常**故意违反范式**——把冗余字段"拍平"到一张表，用空间换时间。

\`\`\`sql
-- 订单表冗余存储用户名和商品名（下单时的快照）
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  user_id BIGINT,
  user_name VARCHAR(50),     -- 冗余（反范式）
  product_name VARCHAR(100), -- 冗余快照
  amount DECIMAL(10,2),
  created_at DATETIME
);
\`\`\`

反范式的典型场景：
- **订单快照**：用户改名后历史订单仍显示下单时的名字（业务需要）。
- **统计表**：预计算好聚合结果，定时刷新。
- **宽表**：分析场景把多张表 JOIN 成一张大宽表，避免实时 JOIN。

> **设计原则**：先按 3NF 设计，再针对热点查询做针对性反范式。不要一开始就搞大宽表，否则维护噩梦。

### 九、窗口函数

窗口函数（Window Function）是 SQL 的高级特性，能在不聚合（不减少行数）的前提下做"分组计算"。MySQL 8.0+ 支持。

#### 9.1 基本语法

\`\`\`sql
函数() OVER (
  PARTITION BY 分组列    -- 类似 GROUP BY 但不合并行
  ORDER BY 排序列        -- 窗口内排序
  ROWS BETWEEN ...       -- 窗口帧范围
)
\`\`\`

#### 9.2 排名函数

\`\`\`sql
-- 按部门分组，按工资降序排名
SELECT
  name, dept_id, salary,
  ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rn,
  RANK()       OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rk,
  DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS drk
FROM employees;

-- ROW_NUMBER: 1,2,3,4...（不重复）
-- RANK:       1,2,2,4（并列后跳过）
-- DENSE_RANK: 1,2,2,3（并列不跳过）
\`\`\`

| 函数 | 说明 | 示例（并列第 2） |
|------|------|----------------|
| ROW_NUMBER | 行号，永不重复 | 1, 2, 3, 4 |
| RANK | 并列后跳号 | 1, 2, 2, 4 |
| DENSE_RANK | 并列不跳号 | 1, 2, 2, 3 |

#### 9.3 聚合窗口函数

\`\`\`sql
-- 累计求和
SELECT
  date, sales,
  SUM(sales) OVER (ORDER BY date) AS cumulative_sales
FROM daily_sales;

-- 移动平均（最近 3 天）
SELECT
  date, sales,
  AVG(sales) OVER (ORDER BY date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS ma3
FROM daily_sales;

-- 每个员工工资占部门总工资的比例
SELECT
  name, dept_id, salary,
  salary * 1.0 / SUM(salary) OVER (PARTITION BY dept_id) AS pct
FROM employees;
\`\`\`

#### 9.4 LAG / LEAD

\`\`\`sql
-- 与上一行/下一行比较（环比、同比）
SELECT
  date, sales,
  LAG(sales, 1)  OVER (ORDER BY date) AS prev_sales,  -- 上一行
  sales - LAG(sales, 1) OVER (ORDER BY date) AS diff,  -- 与上期差值
  LEAD(sales, 1) OVER (ORDER BY date) AS next_sales   -- 下一行
FROM daily_sales;
\`\`\`

### 十、常用 SQL 函数

#### 10.1 字符串函数

\`\`\`sql
SELECT
  LENGTH('hello'),              -- 5（字节数，中文在 utf8mb4 下是 3 字节）
  CHAR_LENGTH('你好'),           -- 2（字符数）
  UPPER('hello'),                -- HELLO
  LOWER('HELLO'),                -- hello
  CONCAT('a', 'b', 'c'),         -- 'abc'
  CONCAT_WS('-', '2024', '01', '01'),  -- '2024-01-01'
  SUBSTRING('hello', 2, 3),      -- 'ell'（从第 2 位取 3 个字符）
  REPLACE('hello world', 'world', 'sql'),  -- 'hello sql'
  TRIM('  hello  '),             -- 'hello'
  LPAD('5', 3, '0'),             -- '005'（左填充到 3 位）
  INSTR('hello', 'll'),          -- 3（子串位置）
  FORMAT(1234567.891, 2);        -- '1,234,567.89'
\`\`\`

#### 10.2 日期函数

\`\`\`sql
SELECT
  NOW(),                        -- 2024-01-15 14:30:00（当前日期时间）
  CURDATE(),                    -- 2024-01-15
  CURTIME(),                    -- 14:30:00
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i'),  -- '2024-01-15 14:30'
  DATE_ADD(NOW(), INTERVAL 1 DAY),       -- 明天
  DATE_SUB(NOW(), INTERVAL 1 MONTH),     -- 上月
  DATEDIFF('2024-01-15', '2024-01-01'),  -- 14（天数差）
  YEAR(NOW()), MONTH(NOW()), DAY(NOW()),
  UNIX_TIMESTAMP(NOW()),        -- 时间戳
  FROM_UNIXTIME(1705286400);    -- 时间戳转日期
\`\`\`

#### 10.3 数值函数

\`\`\`sql
SELECT
  ROUND(3.14159, 2),    -- 3.14
  CEIL(3.2),            -- 4（向上取整）
  FLOOR(3.8),           -- 3（向下取整）
  ABS(-5),              -- 5
  MOD(10, 3),           -- 1（取模）
  POWER(2, 10),         -- 1024
  RAND();               -- 0~1 随机数
\`\`\`

#### 10.4 条件函数

\`\`\`sql
-- CASE WHEN（通用条件表达式）
SELECT name,
  CASE
    WHEN age < 18 THEN '未成年'
    WHEN age < 60 THEN '成年'
    ELSE '老年'
  END AS age_group
FROM users;

-- IF（MySQL 简化版）
SELECT name, IF(age >= 18, '成年', '未成年') FROM users;

-- IFNULL / COALESCE（处理 NULL）
SELECT IFNULL(email, '未填写') FROM users;
SELECT COALESCE(nickname, realname, '匿名') FROM users;  -- 取第一个非 NULL

-- NULLIF（两值相等返回 NULL）
SELECT NULLIF(score, 0);  -- score 为 0 时返回 NULL（避免除零）
\`\`\`

### 十一、主流关系型数据库对比

| 特性 | MySQL | PostgreSQL | SQLite | Oracle |
|------|-------|-----------|--------|--------|
| 许可 | 开源(GPL/商业) | 开源(BSD) | 公有领域 | 商业(昂贵) |
| 事务 | InnoDB 强 | 非常强(MVCC) | 有限(WAL) | 非常强 |
| JSON 支持 | 一般(5.7+) | 极强(原生 JSONB) | 一般 | 一般 |
| 窗口函数 | 8.0+ | 早就有 | 3.25+ | 早就有 |
| CTE 递归 | 8.0+ | 早就有 | 3.8+ | 早就有 |
| 数据类型 | 较少 | 极丰富(数组/枚举/地理) | 较少 | 丰富 |
| 扩展性 | 插件式引擎 | 极强(扩展机制) | 嵌入式 | 强 |
| 全文搜索 | 一般(FULLTEXT) | 强(tsvector) | FTS5 | 强(Oracle Text) |
| 适用 | Web 应用首选 | 复杂查询/GIS | 嵌入/测试 | 企业级 |

**选型建议**：
- **MySQL**：互联网 Web 应用绝对主流，生态成熟，运维资料多。
- **PostgreSQL**：需要复杂查询、JSON 存储、地理数据（PostGIS）、强一致性时优选，"最先进的开源数据库"。
- **SQLite**：移动端、嵌入式、测试、单机工具。零配置，单文件。
- **Oracle**：金融、电信等对一致性、稳定性要求极高且预算充足的企业。

### 十二、SQL 编写规范与性能注意

#### 12.1 编码规范

1. **关键字大写**：\`SELECT id FROM users WHERE age > 18\`，可读性好。部分团队统一小写也可，关键是统一。
2. **表名小写复数或单数**：选一种统一（如 \`users\`、\`orders\`）。蛇形命名 \`user_id\`。
3. **避免缩写**：\`emp_name\` 不如 \`employee_name\` 清晰。
4. **长 SQL 格式化**：每个字段、每个 JOIN 换行，对齐缩进。
5. **禁用 SELECT \***：明确列出所需列。

\`\`\`sql
-- 推荐
SELECT
  u.id,
  u.name,
  u.email,
  o.id      AS order_id,
  o.amount,
  o.created_at
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE u.status = 1
  AND o.created_at >= '2024-01-01'
ORDER BY o.created_at DESC
LIMIT 20;
\`\`\`

#### 12.2 性能注意要点

1. **WHERE 中避免对列做函数运算**：\`WHERE YEAR(created_at) = 2024\` 会让索引失效，改为 \`WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'\`。
2. **避免隐式类型转换**：\`WHERE phone = 13800138000\`（phone 是 VARCHAR）会让索引失效，应 \`WHERE phone = '13800138000'\`。
3. **LIKE 左侧不要 %**：\`WHERE name LIKE '%张'\` 索引失效，\`WHERE name LIKE '张%'\` 可以用索引。
4. **OR 慎用**：\`WHERE a = 1 OR b = 2\` 如果 a、b 都有索引，MySQL 5.0+ 可用 index_merge，否则可能全表扫描。可改用 UNION ALL。
5. **避免大 IN 列表**：\`WHERE id IN (1,2,...,10000)\` 性能差，改用 JOIN 临时表或 BETWEEN。
6. **分页优化**：深分页用游标分页 \`WHERE id > last_id ORDER BY id LIMIT 10\`。
7. **JOIN 时小表驱动大表**：让行数少的表做驱动表（LEFT JOIN 左边是驱动表）。

### 十三、多语言 ORM 对照

不同语言生态有不同的数据库访问方式：

| 语言 | 原生驱动 | ORM | Query Builder |
|------|---------|-----|--------------|
| Java | JDBC | Hibernate/MyBatis | jOOQ |
| Go | database/sql | GORM | sqlx/squirrel |
| Python | psycopg2/mysqlclient | SQLAlchemy/Django ORM | - |
| Node.js | mysql2/pg | TypeORM/Prisma/Sequelize | Knex |

\`\`\`python
# Python SQLAlchemy ORM 示例
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    orders = relationship("Order", back_populates="user")

# 查询：ORM 自动生成 JOIN
users = session.query(User).join(Order).filter(Order.amount > 100).all()
\`\`\`

\`\`\`typescript
// Node.js Prisma 示例
const users = await prisma.user.findMany({
  where: { orders: { some: { amount: { gt: 100 } } } },
  include: { orders: true }
});
\`\`\`

> **ORM 的权衡**：ORM 提高开发效率、防 SQL 注入、有类型安全，但生成的 SQL 可能低效、复杂查询难表达、有 N+1 查询问题。最佳实践：简单 CRUD 用 ORM，复杂查询和性能敏感场景用原生 SQL。

### 十四、SQL 注入与防御

SQL 注入是最常见、最危险的 Web 安全漏洞之一。根源是**把用户输入直接拼接进 SQL**。

\`\`\`java
// 危险！用户输入 ' OR '1'='1 可绕过登录
String sql = "SELECT * FROM users WHERE name = '" + username + "' AND pwd = '" + password + "'";
// 输入 username = admin' -- 后，SQL 变成：
// SELECT * FROM users WHERE name = 'admin' --' AND pwd = 'xxx'
\`\`\`

**防御方法**：

1. **参数化查询（Prepared Statement）**——最根本的防御：

\`\`\`java
// Java 安全写法
PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE name = ? AND pwd = ?");
ps.setString(1, username);
ps.setString(2, password);
\`\`\`

\`\`\`python
# Python 安全写法
cursor.execute("SELECT * FROM users WHERE name = %s AND pwd = %s", (username, password))
\`\`\`

2. **ORM 默认参数化**：使用 ORM 时只要用其查询接口（不写原生拼接），就自动防注入。
3. **输入校验**：白名单校验（如 id 只允许数字），但不能替代参数化。
4. **最小权限**：应用数据库账号只给 SELECT/INSERT/UPDATE/DELETE，不给 DROP/ALTER。

### 十五、实战要点总结

1. **建表先想清楚**：表名、列名、类型、主键、索引、约束，一次设计到位。线上改表代价大。
2. **主键用自增整数**：除非分布式，否则自增 BIGINT 最省心。
3. **金额用 DECIMAL**：绝不用 FLOAT/DOUBLE（浮点精度问题），\`DECIMAL(10,2)\` 存 2 位小数。
4. **时间用 DATETIME/TIMESTAMP**：TIMESTAMP 范围小(1970-2038)但自动时区转换，DATETIME 范围大存原值。
5. **VARCHAR 长度合理**：不要无脑 VARCHAR(255)，按业务实际长度设，影响索引和存储。
6. **CHAR vs VARCHAR**：定长用 CHAR（如 CHAR(36) 存 UUID），变长用 VARCHAR。
7. **TEXT/BLOB 慎用**：大字段单独存表或对象存储，不要和主表放一起（影响行格式和性能）。
8. **枚举用枚举表或 TINYINT**：不要用 VARCHAR 存 '男'/'女'，用 TINYINT(1/2) 或独立的枚举表。
9. **软删除要谨慎**：\`is_deleted\` 字段会让唯一约束失效（两个同名的"已删除"行），需配合删除时间戳或唯一索引设计。
10. **写 SQL 先 EXPLAIN**：上线前的 SQL 必须看执行计划，避免全表扫描。

### 十六、常见坑汇总

| 坑 | 现象 | 解决 |
|----|------|------|
| NULL 比较 | \`WHERE col = NULL\` 查不出数据 | 用 \`IS NULL\` |
| COUNT(列) vs COUNT(*) | 统计少行 | 明确需求选对函数 |
| 隐式类型转换 | 索引失效变慢 | 类型对齐 |
| GROUP BY 漏列 | ONLY_FULL_GROUP_BY 报错 | 非聚合列都加进 GROUP BY |
| 深分页 | LIMIT 100000,10 极慢 | 游标分页 |
| OR 索引失效 | 查询变慢 | UNION ALL |
| 日期函数索引失效 | YEAR(col)=2024 慢 | 范围查询 |
| 大事务 | 锁多、回滚慢 | 拆小事务 |
| 字符集不一致 | 中文乱码、JOIN 失败 | 统一 utf8mb4 |
| 时区问题 | 时间差 8 小时 | 统一 UTC 存储 |

### 十七、视图（View）

**视图**是一张"虚拟表"，由一条 SELECT 语句定义，本身不存储数据（除物化视图外），只在查询时动态执行底层 SQL。

\`\`\`sql
-- 创建视图：简化复杂查询
CREATE VIEW v_order_summary AS
SELECT
  u.id        AS user_id,
  u.name      AS user_name,
  COUNT(o.id) AS order_count,
  SUM(o.amount) AS total_amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;

-- 使用视图就像查表一样简单
SELECT * FROM v_order_summary WHERE total_amount > 1000;

-- 修改视图
ALTER VIEW v_order_summary AS SELECT ...;

-- 删除视图
DROP VIEW v_order_summary;
\`\`\`

**视图的用途**：
1. **简化查询**：把复杂 JOIN 封装成视图，上层只 SELECT 视图。
2. **权限隔离**：只暴露部分列给某些用户（行级/列级权限）。
3. **抽象层**：底层表结构变化时，视图可屏蔽变化。

**视图的限制**：
- 视图不存数据，每次查询都执行底层 SQL，性能不会提升。
- 包含聚合、DISTINCT、GROUP BY 的视图通常**不可更新**（不能 INSERT/UPDATE/DELETE）。
- 嵌套视图（视图套视图）性能差、难调试，生产慎用。

**物化视图（Materialized View）**：把视图结果**实际存储**到磁盘，定期刷新。Oracle/PostgreSQL 原生支持，MySQL 需用定时任务+表模拟。适合"数据不要求实时、但查询频繁"的统计场景。

### 十八、存储过程与触发器

#### 18.1 存储过程

存储过程是预编译并存储在数据库中的一组 SQL 语句，可被反复调用。

\`\`\`sql
-- MySQL 存储过程示例：转账
DELIMITER //
CREATE PROCEDURE transfer(IN from_id INT, IN to_id INT, IN amount DECIMAL(10,2))
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SELECT '转账失败' AS result;
  END;
  
  START TRANSACTION;
  UPDATE accounts SET balance = balance - amount WHERE id = from_id;
  UPDATE accounts SET balance = balance + amount WHERE id = to_id;
  COMMIT;
  SELECT '转账成功' AS result;
END //
DELIMITER ;

CALL transfer(1, 2, 100.00);
\`\`\`

**存储过程的优缺点**：

| 优点 | 缺点 |
|------|------|
| 减少网络往返（一次调用执行多步） | 难调试、难版本管理 |
| 预编译，执行计划可复用 | 业务逻辑分散到数据库，架构耦合 |
| 可控制权限 | 数据库厂商方言，可移植性差 |
| 保证数据一致性（原子操作） | 数据库服务器 CPU 压力大 |

**现代架构趋势**：互联网应用普遍**弃用存储过程**，把业务逻辑放在应用层（微服务），数据库只做存储。原因：存储过程难以水平扩展、难以用 Git 管理、难以做单元测试。但传统企业应用中仍广泛使用。

#### 18.2 触发器

触发器是在 INSERT/UPDATE/DELETE 事件发生时**自动执行**的数据库代码。

\`\`\`sql
-- 订单插入后自动扣减库存
CREATE TRIGGER trg_after_order
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
  UPDATE products SET stock = stock - NEW.qty WHERE id = NEW.product_id;
END;
\`\`\`

**触发器的隐患**：
- **隐藏副作用**：开发者看不到触发器，排查问题时容易遗漏。
- **性能**：每行触发一次，批量操作时性能灾难。
- **级联**：触发器可能触发另一个触发器，形成链式反应，难以追踪。
- **无法回滚部分**：触发器与主语句在同一事务中，出错会回滚整个事务。

**建议**：能用应用层实现的，就不要用触发器。触发器只用于审计日志、强制约束等"必须数据库层做"的场景。

### 十九、数据库设计实战：电商订单系统

把前面学的知识综合起来，设计一个电商订单系统的核心表结构。

#### 19.1 实体识别

从业务用例出发，识别实体：用户、商品、分类、订单、订单明细、收货地址、购物车、支付记录。

#### 19.2 表结构设计

\`\`\`sql
-- 用户表
CREATE TABLE users (
  id           BIGINT PRIMARY KEY AUTO_INCREMENT,
  username     VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(64) NOT NULL,
  nickname     VARCHAR(50),
  phone        VARCHAR(20)  UNIQUE,
  email        VARCHAR(100) UNIQUE,
  status       TINYINT      NOT NULL DEFAULT 1 COMMENT '1正常 0禁用',
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 商品分类表（自引用树形结构）
CREATE TABLE categories (
  id        BIGINT PRIMARY KEY AUTO_INCREMENT,
  parent_id BIGINT DEFAULT NULL,
  name      VARCHAR(50) NOT NULL,
  sort      INT DEFAULT 0,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- 商品表
CREATE TABLE products (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  category_id   BIGINT       NOT NULL,
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  price         DECIMAL(10,2) NOT NULL,
  stock         INT          NOT NULL DEFAULT 0,
  status        TINYINT      NOT NULL DEFAULT 1 COMMENT '1上架 0下架',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category_id),
  INDEX idx_status_created (status, created_at),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 收货地址表
CREATE TABLE addresses (
  id        BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id   BIGINT       NOT NULL,
  receiver  VARCHAR(50)  NOT NULL,
  phone     VARCHAR(20)  NOT NULL,
  province  VARCHAR(20)  NOT NULL,
  city      VARCHAR(20)  NOT NULL,
  detail    VARCHAR(200) NOT NULL,
  is_default TINYINT    NOT NULL DEFAULT 0,
  INDEX idx_user (user_id)
);

-- 订单主表（冗余收货信息快照）
CREATE TABLE orders (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_no      VARCHAR(32)  NOT NULL UNIQUE,
  user_id       BIGINT       NOT NULL,
  receiver      VARCHAR(50)  NOT NULL,
  receiver_phone VARCHAR(20) NOT NULL,
  address       VARCHAR(300) NOT NULL,
  total_amount  DECIMAL(10,2) NOT NULL,
  status        TINYINT      NOT NULL DEFAULT 0 COMMENT '0待付款 1已付款 2已发货 3已完成 4已取消',
  pay_time      DATETIME,
  ship_time     DATETIME,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_status (user_id, status),
  INDEX idx_created (created_at)
);

-- 订单明细表
CREATE TABLE order_items (
  id           BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id     BIGINT       NOT NULL,
  product_id   BIGINT       NOT NULL,
  product_name VARCHAR(200) NOT NULL,  -- 冗余快照
  unit_price   DECIMAL(10,2) NOT NULL, -- 冗余快照
  quantity     INT          NOT NULL,
  subtotal     DECIMAL(10,2) NOT NULL,
  INDEX idx_order (order_id),
  INDEX idx_product (product_id)
);

-- 支付记录表
CREATE TABLE payments (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id      BIGINT       NOT NULL UNIQUE,
  pay_method    TINYINT      NOT NULL COMMENT '1微信 2支付宝 3银行卡',
  trade_no      VARCHAR(64)  NOT NULL UNIQUE, -- 第三方交易号
  amount        DECIMAL(10,2) NOT NULL,
  status        TINYINT      NOT NULL DEFAULT 0 COMMENT '0处理中 1成功 2失败',
  paid_at       DATETIME,
  INDEX idx_order (order_id)
);
\`\`\`

#### 19.3 设计要点解析

1. **金额全用 DECIMAL(10,2)**：避免浮点精度问题，2 位小数够用。如果涉及高精度（如加密货币），用 DECIMAL(20,8)。
2. **订单冗余商品快照**：\`order_items\` 里存了 \`product_name\` 和 \`unit_price\`。因为商品可能改名/改价，但历史订单必须保留下单时的信息。这是"反范式"的合理应用。
3. **订单冗余收货信息**：同理，用户可能改地址，但订单的收货地址不能变。
4. **order_no 业务订单号**：用 UNIQUE 约束，格式如 \`yyyyMMdd + 雪花ID\`，对人可读、防猜测。
5. **status 用 TINYINT**：不用 VARCHAR 存状态名，节省空间、利于索引。
6. **created_at / updated_at**：几乎所有表都要有，运维排查必备。\`ON UPDATE CURRENT_TIMESTAMP\` 自动更新。
7. **联合索引设计**：\`idx_user_status (user_id, status)\` 支持"查某用户某状态的订单"这种高频查询。
8. **没有用外键**：互联网高并发场景通常禁用外键，由应用层保证一致性。这里保留了 categories 的自引用外键（树结构强约束）。

#### 19.4 典型查询

\`\`\`sql
-- 查询用户最近的订单（含明细）
SELECT o.order_no, o.total_amount, o.status, o.created_at,
       oi.product_name, oi.quantity, oi.subtotal
FROM orders o
INNER JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = 10086
ORDER BY o.created_at DESC
LIMIT 20;

-- 统计各状态订单数
SELECT status, COUNT(*) AS cnt, SUM(total_amount) AS total
FROM orders
WHERE created_at >= CURDATE() - INTERVAL 7 DAY
GROUP BY status;

-- 热销商品 TOP10
SELECT product_name, SUM(quantity) AS sold_qty, SUM(subtotal) AS revenue
FROM order_items
WHERE order_id IN (SELECT id FROM orders WHERE status = 3 AND created_at >= '2024-01-01')
GROUP BY product_id, product_name
ORDER BY sold_qty DESC
LIMIT 10;
\`\`\`

### 二十、CTE 递归查询

公用表表达式（CTE, Common Table Expression）用 WITH 定义临时结果集，可自引用实现递归——处理树形/图结构数据利器。

\`\`\`sql
-- 递归查询分类树的所有子孙
WITH RECURSIVE category_tree AS (
  -- 锚点：根节点
  SELECT id, name, parent_id, 0 AS level, CAST(name AS CHAR(1000)) AS path
  FROM categories WHERE parent_id IS NULL
  UNION ALL
  -- 递归：找子节点
  SELECT c.id, c.name, c.parent_id, ct.level + 1, CONCAT(ct.path, ' > ', c.name)
  FROM categories c
  INNER JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY path;
\`\`\`

递归 CTE 的执行逻辑：
1. 先执行锚点查询（根节点），得到初始结果集。
2. 用初始结果集 JOIN 原表，找到下一层。
3. 重复步骤 2，直到没有新数据。
4. 把所有层 UNION ALL 起来。

适用场景：组织架构树、评论楼中楼、菜单树、物料 BOM 展开。

### 二十一、数据类型选择指南

选对数据类型既节省存储又提升性能。**原则：能小不小、能定长不变长、能整型不字符串**。

| 数据 | 推荐类型 | 说明 |
|------|---------|------|
| 自增主键 | BIGINT | INT(21亿)可能不够，直接 BIGINT |
| 金额 | DECIMAL(10,2) | 绝不用 FLOAT/DOUBLE |
| 布尔值 | TINYINT(1) | MySQL 无真正 BOOL |
| 短文本 | VARCHAR(50~255) | 按实际长度设 |
| 长文本 | TEXT | 超过 255 字符 |
| 超长文本 | MEDIUMTEXT/LONGTEXT | 文章正文 |
| 日期 | DATE | 只有日期 |
| 时间 | DATETIME | 日期+时间，范围大 |
| 时间戳 | TIMESTAMP | 自动时区，2038 问题 |
| 二进制 | BLOB | 图片/文件（建议存对象存储） |
| 枚举 | TINYINT + 注释 | 不用 ENUM（难扩展） |
| IP 地址 | INT UNSIGNED | inet_aton 转换，比 VARCHAR 省 |
| JSON | JSON (8.0+) | 半结构化数据 |

\`\`\`sql
-- IP 存整数：省空间、利于范围查询
INSERT INTO logs (ip) VALUES (INET_ATON('192.168.1.1'));
SELECT INET_NTOA(ip) FROM logs;
\`\`\`

### 二十二、字符集与排序规则

**字符集（Character Set）** 决定字符如何编码存储，**排序规则（Collation）** 决定字符如何比较排序。

\`\`\`sql
-- MySQL 必须用 utf8mb4（支持 4 字节 emoji），utf8 是阉割版（3 字节）
CREATE TABLE t (name VARCHAR(50)) CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- _ci 后缀 = case insensitive（大小写不敏感）
-- _cs 后缀 = case sensitive
-- _bin 后缀 = 二进制比较（大小写敏感）
SELECT * FROM users WHERE name = 'Zhang';  -- ci 下能匹配 'zhang'
\`\`\`

**常见坑**：
- **utf8 vs utf8mb4**：MySQL 的 utf8 最多 3 字节，存不了 emoji（4 字节）。**一律用 utf8mb4**。
- **字符集不一致**：两张表 JOIN 时如果字符集不同，索引会失效，全表扫描。建库建表统一 utf8mb4。
- **排序规则不一致**：UNION 或 JOIN 时 collation 不同会报错或性能差。
- **emoji 入库失败**：Incorrect string value 错误，基本是字符集不是 utf8mb4。

### 二十三、本章小结

关系型数据库以**二维表 + 关系**建模，通过 SQL 进行操作。理解 RDBMS 的分层架构（连接→解析→优化→执行→存储）有助于诊断性能问题。SQL 五大类（DDL/DML/DQL/DCL/TCL）覆盖了从建表到权限的全部操作。SELECT 的逻辑执行顺序（FROM→WHERE→GROUP BY→HAVING→SELECT→ORDER BY→LIMIT）是写好 SQL 的基础。JOIN 是关系数据库的核心能力，七种 JOIN 各有用途。范式设计减少冗余，反范式用空间换时间。窗口函数扩展了 SQL 的分析能力。视图、存储过程、触发器、CTE 递归是 SQL 的进阶能力。数据类型选择和字符集配置是建表的基本功。最后，SQL 注入防御、性能规范、编码规范是工程实践必备。

下一章我们将深入索引原理——B+ 树、聚簇索引、回表、覆盖索引、最左前缀，理解了索引，才能真正写出高性能 SQL。
`,
    code: `// ============================================================
// 关系型数据库与 SQL —— 内存版 SQL 引擎
// 实现 Table/Database/SELECT/INSERT/UPDATE/DELETE/JOIN/GROUP BY
// ============================================================

// ---------- 表类：存储行 + 主键自增 + schema ----------
class Table {
  constructor(name, schema) {
    this.name = name;
    this.schema = schema;        // { 列名: 类型 }
    this.rows = [];              // 行数组
    this.pk = schema._pk || 'id';// 主键列名
    this.autoInc = 0;            // 自增计数器
    this.indexes = {};           // 索引：{ 列名: Map(值 -> [行索引]) }
  }
  // 建索引
  createIndex(col) {
    const map = new Map();
    this.rows.forEach((r, i) => {
      const k = r[col];
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(i);
    });
    this.indexes[col] = map;
  }
  // 插入行
  insert(row) {
    if (row[this.pk] === undefined) {
      row[this.pk] = ++this.autoInc;  // 主键自增
    } else {
      this.autoInc = Math.max(this.autoInc, row[this.pk]);
    }
    this.rows.push(row);
    const idx = this.rows.length - 1;
    // 维护索引
    for (const col in this.indexes) {
      const k = row[col];
      if (!this.indexes[col].has(k)) this.indexes[col].set(k, []);
      this.indexes[col].get(k).push(idx);
    }
    return row[this.pk];
  }
  // 按主键查
  findById(id) {
    return this.rows.find(r => r[this.pk] === id);
  }
}

// ---------- 数据库类：管理多表 ----------
class Database {
  constructor() { this.tables = {}; }
  createTable(name, schema) {
    this.tables[name] = new Table(name, schema);
    return this.tables[name];
  }
  get(name) { return this.tables[name]; }
}

// ---------- SQL 执行器 ----------
// WHERE 条件求值（支持简单表达式对象）
function matchWhere(row, where) {
  if (!where) return true;
  for (const key in where) {
    const cond = where[key];
    const val = row[key];
    if (cond === null) { if (val !== null) return false; continue; }
    if (typeof cond === 'object' && !Array.isArray(cond)) {
      if ('$gt' in cond && !(val > cond.$gt)) return false;
      if ('$lt' in cond && !(val < cond.$lt)) return false;
      if ('$gte' in cond && !(val >= cond.$gte)) return false;
      if ('$lte' in cond && !(val <= cond.$lte)) return false;
      if ('$ne' in cond && !(val !== cond.$ne)) return false;
      if ('$in' in cond && !cond.$in.includes(val)) return false;
      if ('$like' in cond) {
        const re = new RegExp('^' + cond.$like.replace(/%/g, '.*').replace(/_/g, '.') + '$');
        if (!re.test(String(val))) return false;
      }
    } else {
      if (val !== cond) return false;
    }
  }
  return true;
}

// SELECT：投影 + 过滤 + 排序 + 分页
function select(table, { where, fields, orderBy, limit, offset } = {}) {
  let result = table.rows.filter(r => matchWhere(r, where));
  if (orderBy) {
    const [col, dir = 'asc'] = Object.entries(orderBy)[0];
    result.sort((a, b) => {
      if (a[col] < b[col]) return dir === 'asc' ? -1 : 1;
      if (a[col] > b[col]) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  }
  if (fields && fields !== '*') {
    result = result.map(r => {
      const o = {}; fields.forEach(f => o[f] = r[f]); return o;
    });
  }
  const off = offset || 0;
  if (limit !== undefined) result = result.slice(off, off + limit);
  return result;
}

// INSERT
function insert(table, row) { return table.insert(row); }

// UPDATE
function update(table, where, set) {
  let count = 0;
  table.rows.forEach(r => {
    if (matchWhere(r, where)) { Object.assign(r, set); count++; }
  });
  return count;
}

// DELETE
function del(table, where) {
  const before = table.rows.length;
  table.rows = table.rows.filter(r => !matchWhere(r, where));
  return before - table.rows.length;
}

// INNER JOIN（嵌套循环）
function innerJoin(left, right, leftKey, rightKey, fields) {
  const result = [];
  for (const l of left.rows) {
    for (const r of right.rows) {
      if (l[leftKey] === r[rightKey]) {
        const merged = { ...l, ...prefix(r, right.name) };
        result.push(project(merged, fields));
      }
    }
  }
  return result;
}

// LEFT JOIN
function leftJoin(left, right, leftKey, rightKey, fields) {
  const result = [];
  for (const l of left.rows) {
    let matched = false;
    for (const r of right.rows) {
      if (l[leftKey] === r[rightKey]) {
        matched = true;
        result.push(project({ ...l, ...prefix(r, right.name) }, fields));
      }
    }
    if (!matched) result.push(project({ ...l, ...prefix(null, right.name) }, fields));
  }
  return result;
}

function prefix(obj, p) {
  const o = {};
  if (obj) for (const k in obj) o[p + '.' + k] = obj[k];
  return o;
}
function project(obj, fields) {
  if (!fields || fields === '*') return obj;
  const o = {}; fields.forEach(f => o[f] = obj[f]); return o;
}

// GROUP BY + 聚合
function groupBy(table, { where, groupBy: gcols, aggs }) {
  let rows = table.rows.filter(r => matchWhere(r, where));
  const groups = new Map();
  for (const r of rows) {
    const key = gcols.map(c => r[c]).join('|');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  const result = [];
  for (const [key, grp] of groups) {
    const row = {};
    const keys = key.split('|');
    gcols.forEach((c, i) => row[c] = keys[i]);
    for (const alias in aggs) {
      const [fn, col] = aggs[alias];
      const vals = grp.map(r => r[col]).filter(v => v != null);
      if (fn === 'COUNT') row[alias] = grp.length;
      else if (fn === 'SUM') row[alias] = vals.reduce((a, b) => a + b, 0);
      else if (fn === 'AVG') row[alias] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      else if (fn === 'MAX') row[alias] = vals.length ? Math.max(...vals) : null;
      else if (fn === 'MIN') row[alias] = vals.length ? Math.min(...vals) : null;
    }
    result.push(row);
  }
  return result;
}

// ============================================================
// 建库建表 + 预置数据
// ============================================================
const db = new Database();
const users = db.createTable('users', { _pk: 'id', id: 'int', name: 'str', age: 'int', city: 'str' });
const products = db.createTable('products', { _pk: 'id', id: 'int', name: 'str', price: 'num', stock: 'int' });
const orders = db.createTable('orders', { _pk: 'id', id: 'int', user_id: 'int', product_id: 'int', qty: 'int', amount: 'num' });

// 预置用户
['张三', '李四', '王五', '赵六', '钱七'].forEach((name, i) => {
  users.insert({ name, age: 20 + i * 5, city: ['北京', '上海', '北京', '深圳', '上海'][i] });
});
// 预置商品
[['笔记本', 5999, 50], ['鼠标', 99, 200], ['键盘', 299, 100], ['显示器', 1599, 30]].forEach(([name, price, stock]) => {
  products.insert({ name, price, stock });
});
// 预置订单
orders.insert({ user_id: 1, product_id: 1, qty: 1, amount: 5999 });
orders.insert({ user_id: 1, product_id: 2, qty: 2, amount: 198 });
orders.insert({ user_id: 2, product_id: 3, qty: 1, amount: 299 });
orders.insert({ user_id: 3, product_id: 1, qty: 1, amount: 5999 });
orders.insert({ user_id: 3, product_id: 4, qty: 2, amount: 3198 });

users.createIndex('city');  // 建 city 索引

// ============================================================
// 演示查询
// ============================================================
console.log('===== 1. 全表查询 =====');
console.table(select(users));

console.log('\\n===== 2. WHERE 过滤 + 字段投影 =====');
console.table(select(users, { where: { age: { $gte: 25 } }, fields: ['id', 'name', 'age'] }));

console.log('\\n===== 3. ORDER BY 排序 + LIMIT 分页 =====');
console.table(select(users, { orderBy: { age: 'desc' }, limit: 2, offset: 1 }));

console.log('\\n===== 4. LIKE 模糊查询 =====');
console.table(select(users, { where: { city: { $like: '上%' } }, fields: ['name', 'city'] }));

console.log('\\n===== 5. INNER JOIN（用户+订单） =====');
console.table(innerJoin(users, orders, 'id', 'user_id', ['users.name', 'orders.product_id', 'orders.amount']));

console.log('\\n===== 6. LEFT JOIN（所有用户含无订单的） =====');
console.table(leftJoin(users, orders, 'id', 'user_id', ['users.name', 'orders.amount']));

console.log('\\n===== 7. GROUP BY 按城市分组聚合 =====');
console.table(groupBy(users, { groupBy: ['city'], aggs: { 人数: ['COUNT', 'id'], 平均年龄: ['AVG', 'age'], 最大年龄: ['MAX', 'age'] } }));

console.log('\\n===== 8. GROUP BY 按用户分组统计订单总额 =====');
console.table(groupBy(orders, { groupBy: ['user_id'], aggs: { 订单数: ['COUNT', 'id'], 总金额: ['SUM', 'amount'] } }));

console.log('\\n===== 9. UPDATE =====');
const updated = update(users, { id: 1 }, { age: 30 });
console.log('更新行数:', updated, '→ 张三新年龄:', users.findById(1).age);

console.log('\\n===== 10. DELETE =====');
const deleted = del(orders, { user_id: 2 });
console.log('删除订单数:', deleted, '→ 剩余订单数:', orders.rows.length);

console.log('\\n===== 11. 索引加速查询演示 =====');
const idxMap = users.indexes['city'];
console.log('city 索引:', [...idxMap.keys()].map(k => k + ' -> ' + idxMap.get(k).length + '行'));

console.log('\\n===== 演示结束 =====');
`,
  },
  // =========================================================
  // 第二章：索引原理与优化
  // =========================================================
  {
    id: "backend-index",
    group: "数据存储",
    icon: "📇",
    title: "索引原理与优化",
    content: `## 索引原理与优化

**索引（Index）** 是数据库性能优化的第一利器。一条查询从"全表扫描 10 秒"到"索引查找 1 毫秒"的飞跃，往往就差一个索引。但索引也是双刃剑——用得好如虎添翼，用不好反而拖累系统。理解索引的**底层数据结构**、**存储方式**、**失效场景**，是写出高性能 SQL 的前提。

本章将从"为什么需要索引"出发，深入讲解哈希索引、B 树、B+ 树、跳表四种数据结构，剖析 MySQL InnoDB 的聚簇索引与二级索引实现，详解联合索引最左前缀原则、索引失效场景、EXPLAIN 执行计划解读，以及索引优化的实战技巧。

### 一、为什么需要索引

#### 1.1 全表扫描的代价

假设 \`users\` 表有 1000 万行数据，查询 \`WHERE id = 12345\`：

- **没有索引**：数据库必须从第 1 行开始，逐行检查 \`id\` 是否等于 12345，最坏要扫描 1000 万行才能找到（或确认不存在）。这叫**全表扫描（Full Table Scan）**。磁盘 IO 是瓶颈——如果每行 200 字节，1000 万行约 2GB，全部读一遍可能要几秒到几十秒。
- **有索引**：通过索引数据结构（如 B+ 树），只需 3-4 次磁盘 IO 就能定位到目标行。从秒级到毫秒级，性能提升成千上万倍。

索引的本质是：**用空间换时间，用额外的数据结构加速查找**。

#### 1.2 索引的代价

索引不是免费的，它的成本体现在三方面：

1. **空间成本**：每个索引是一棵独立的 B+ 树，占用磁盘空间。一个表建 5 个索引，可能让数据总大小翻倍。
2. **写入成本**：每次 INSERT/UPDATE/DELETE 都要同步维护所有索引的 B+ 树结构，写性能随索引数量线性下降。这叫**写放大（Write Amplification）**。
3. **维护成本**：索引需要定期维护（统计信息更新、碎片整理），否则优化器可能选错执行计划。

所以索引不是越多越好，**只为高频查询条件建索引**，一般单表索引不超过 5-6 个。

### 二、索引数据结构详解

数据库索引的底层数据结构有多种，各有优劣，适用于不同场景。

#### 2.1 哈希索引（Hash Index）

**原理**：用哈希表存储。对索引列的值做哈希运算，得到哈希值，映射到哈希桶。查找时 O(1)。

\`\`\`
hash("zhangsan") = 37 → 桶[37] → [行指针]
hash("lisi") = 52 → 桶[52] → [行指针]
\`\`\`

**优点**：
- 等值查询极快，O(1)。
- 结构简单，内存占用小。

**缺点**：
- **不支持范围查询**：\`WHERE age > 18\` 无法用哈希索引，因为哈希值无大小关系。
- **不支持排序**：哈希值无序，ORDER BY 用不上。
- **不支持最左前缀**：联合哈希索引必须所有列一起查。
- **哈希冲突**：不同键可能哈希到同一桶，冲突多时退化。

**适用场景**：只做等值查询的场景，如键值缓存。MySQL 的 Memory 引擎默认用哈希索引，InnoDB 的"自适应哈希索引（Adaptive Hash Index）"会对热点页自动建哈希索引加速。

#### 2.2 二叉搜索树（BST）与平衡二叉树（AVL）

在讲 B 树前，先回顾二叉搜索树。BST 的性质：左子树 < 根 < 右子树。查找 O(log n)。

但 BST 的问题是：**数据有序插入时会退化成链表**（每个节点只有右子树），查找退化到 O(n)。平衡二叉树（AVL、红黑树）通过旋转保持平衡，保证 O(log n)。

然而平衡二叉树在数据库场景下**不够好**，原因：

1. **树太高**：二叉树每个节点最多 2 个子节点，1000 万数据需要约 24 层（log2(10^7)≈23.25）。每层一次磁盘 IO，24 次 IO 太多。
2. **磁盘 IO 效率低**：数据库数据在磁盘上以"页（Page，默认 16KB）"为单位读取。二叉树一个节点存一个键，读取一个页只获得一个键，浪费了页的容量。

数据库需要一种**矮胖**的树——每个节点有大量子节点，树高很低。这就是 B 树。

#### 2.3 B 树（B-Tree，平衡多路查找树）

**B 树**是一种自平衡的多路搜索树。m 阶 B 树的每个节点最多有 m 个子节点。

**B 树的特点**：
- 每个节点存储**多个键和多个子节点指针**。
- 键在节点内有序排列。
- 所有叶子节点在**同一层**（平衡）。
- **数据存储在所有节点中**（包括内部节点和叶子节点）。

一棵 4 阶 B 树的结构（简化）：

\`\`\`
              [10 | 20 | 30]               ← 内部节点（也存数据）
             /    |    |    \\
        [1,5]  [12,15] [22,25] [35,40]     ← 叶子节点
\`\`\`

**查找过程**（查找 22）：
1. 从根节点 [10|20|30] 开始，22 > 20 且 < 30，走第 3 个子指针。
2. 到达 [22,25] 节点，找到 22。

**B 树的优势**：
- **矮**：m 阶 B 树每个节点 m 个子节点，1000 万数据用 200 阶 B 树只需 3 层。
- **磁盘友好**：一个节点正好对应一个磁盘页（16KB），一次 IO 读取一页获得多个键。

**B 树的不足**：
- 内部节点也存数据，导致一个页能放的键数减少，树会比 B+ 树高。
- 范围查询不便：找到起点后要在树中中序遍历，回溯上下层，IO 多。

#### 2.4 B+ 树（B+ Tree）——MySQL InnoDB 的选择

**B+ 树**是 B 树的变体，也是关系型数据库索引的**主流结构**（MySQL InnoDB、PostgreSQL 都用 B+ 树）。

**B+ 树与 B 树的关键区别**：

| 特性 | B 树 | B+ 树 |
|------|------|-------|
| 数据存储位置 | 所有节点都存数据 | **只有叶子节点存数据** |
| 内部节点 | 存键 + 数据 + 指针 | **只存键 + 指针**（索引） |
| 叶子节点 | 无链表 | **叶子节点用双向链表连接** |
| 范围查询 | 需中序遍历整棵树 | **顺着叶子链表顺序遍历即可** |
| 树高 | 较高 | **更矮**（内部节点不存数据，能放更多键） |

B+ 树的结构：

\`\`\`
              [10 | 20 | 30]              ← 内部节点：只存键(索引)
             /     |      |     \\
        [1→5]  [10→15]  [20→25]  [30→40]  ← 叶子节点：存键+数据
          ⇄        ⇄        ⇄        ⇄    ← 双向链表连接
\`\`\`

**为什么 MySQL InnoDB 选 B+ 树而不是 B 树**？

1. **范围查询极快**：B+ 树叶子节点有链表，\`WHERE age BETWEEN 20 AND 30\` 找到 20 后顺着链表走到 30 即可，连续 IO 效率高。B 树要在树中反复回溯。
2. **树更矮**：内部节点不存数据，同样大小的页能放更多键。1000 万数据 3 层 B+ 树就够（根节点常驻内存，实际只需 2 次 IO）。
3. **查询稳定**：所有数据都在叶子节点，每次查询都要走到叶子，查询时间稳定（不会像 B 树那样有时在根节点就命中、有时要走到最底层）。

**B+ 树的查找过程**（查找 age=25）：
1. 根节点 [10|20|30] 在内存中，25 > 20 且 < 30，走第 3 个子指针（1 次 IO 读页）。
2. 叶子节点 [20,21,22,23,24,25,26,27,28,29,30]，二分查找定位 25。

**B+ 树的插入过程**（插入 18，假设每个叶子最多 4 个键）：
1. 找到目标叶子节点 [15,16,17,19]（假设）。
2. 插入 18 → [15,16,17,18,19]，超过 4 个键，**分裂**。
3. 分裂为 [15,16] 和 [17,18,19]，中间键 17 上提至父节点。
4. 父节点加入 17。

**B+ 树的删除过程**（删除 18）：
1. 找到叶子节点 [17,18,19]。
2. 删除 18 → [17,19]。
3. 若节点键数低于下限（通常 m/2），向兄弟节点**借键**，或与兄弟**合并**，并更新父节点。

#### 2.5 跳表（Skip List）——Redis 的选择

**跳表**是一种基于有序链表的概率平衡结构。通过在链表上建立多级索引，实现 O(log n) 查找。

\`\`\`
Level 3:   1 ─────────────────────────────→ 9
Level 2:   1 ────────→ 5 ───────────────→ 9
Level 1:   1 ──→ 3 ──→ 5 ──→ 7 ────────→ 9
Level 0:   1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9   ← 原始链表
\`\`\`

**查找过程**（查找 6）：
1. 从 Level 3 出发：1 → 9（9>6，下降）。
2. Level 2：1 → 5（5<6，继续）→ 9（9>6，下降）。
3. Level 1：5 → 7（7>6，下降）。
4. Level 0：5 → 6，找到。

**跳表 vs B+ 树**：

| 维度 | 跳表 | B+ 树 |
|------|------|-------|
| 实现复杂度 | 简单（链表+随机层数） | 复杂（节点分裂合并） |
| 范围查询 | 好（链表） | 好（叶子链表） |
| 内存/磁盘 | 内存友好 | 磁盘友好（页对齐） |
| 并发 | 易加锁（局部） | 锁复杂 |
| 代表应用 | Redis 有序集合 | MySQL/PostgreSQL |

Redis 用跳表而不是 B+ 树，因为 Redis 是纯内存数据库，跳表实现简单、并发友好、内存够用。数据库面向磁盘，B+ 树的页对齐设计对 IO 更友好。

### 三、MySQL InnoDB 索引实现

理解 InnoDB 的索引实现，是理解"回表""覆盖索引""最左前缀"的前提。

#### 3.1 聚簇索引（Clustered Index，主键索引）

**聚簇索引**是 InnoDB 的核心设计：**数据和主键索引存储在同一棵 B+ 树中**。叶子节点直接存储**完整的行数据**。

\`\`\`
聚簇索引（按主键 id 组织）：
              [10 | 20 | 30]              ← 内部节点：主键值
             /     |      |     \\
   [id=1..9行数据] [id=10..19行数据] [...]  ← 叶子节点：存完整行
\`\`\`

**关键点**：
- 一张表**只有一个聚簇索引**（因为数据只能按一种物理顺序存储）。
- 默认用主键作为聚簇索引。如果没有主键，InnoDB 选第一个唯一非空索引；如果没有，InnoDB 生成隐藏的 ROWID 列做聚簇索引。
- **聚簇索引决定了行的物理存储顺序**。按主键顺序插入最快（顺序写），随机主键（如 UUID）插入会频繁页分裂。

**主键查询走聚簇索引，一次 B+ 树查找就能拿到完整行**：
\`\`\`sql
SELECT * FROM users WHERE id = 100;  -- 聚簇索引查找，1 次
\`\`\`

#### 3.2 二级索引（Secondary Index，非聚簇索引）

除聚簇索引外的其他索引（如 \`idx_email\`、\`idx_name\`）都是**二级索引**。二级索引的叶子节点**不存完整行数据，而是存索引列值 + 主键值**。

\`\`\`
二级索引 idx_email：
              [a@b.com | m@n.com | x@y.com]
             /          |            \\
  [email, 主键id]   [email, 主键id]   [email, 主键id]  ← 叶子节点：存 email + id
\`\`\`

**查 email='zhang@xx.com'**：
1. 在 idx_email 的 B+ 树中查找，找到对应的主键 id=42。
2. 拿着 id=42 去**聚簇索引**中查找完整行。

这个"二级索引→聚簇索引"的二次查找过程叫**回表（Table Lookup / Bookmark Lookup）**。

\`\`\`sql
-- 需要回表
SELECT * FROM users WHERE email = 'zhang@xx.com';
-- 1. 查 idx_email 得到 id=42
-- 2. 回表查聚簇索引得到完整行
\`\`\`

回表意味着**两次 B+ 树查找**，比聚簇索引查询多一次 IO。如果查询只需要索引列，可以避免回表（见覆盖索引）。

#### 3.3 覆盖索引（Covering Index）

如果查询的**所有列都包含在索引中**，就不需要回表——直接从索引的 B+ 树就能拿到全部数据。这叫**覆盖索引**。

\`\`\`sql
-- 假设有索引 idx_name (name)
SELECT name FROM users WHERE name LIKE '张%';  -- 覆盖索引，不回表

-- 但这个需要回表（要查 age，age 不在 idx_name 中）
SELECT name, age FROM users WHERE name LIKE '张%';
\`\`\`

**如何利用覆盖索引**：把 SELECT 的字段都放进联合索引。例如高频查询 \`SELECT user_id, name, age FROM users WHERE name = ?\`，建联合索引 \`idx_name_age (name, age)\`，并把 user_id（主键，二级索引叶子自带）算上，就覆盖了。

\`\`\`sql
-- EXPLAIN 中 Extra 显示 "Using index" 表示用到了覆盖索引
EXPLAIN SELECT name, age FROM users WHERE name = '张三';
-- Extra: Using index  ← 覆盖索引，不回表，快
\`\`\`

覆盖索引是索引优化中最有效的手段之一，能将 2 次 B+ 树查找降为 1 次。

#### 3.4 索引下推（Index Condition Pushdown, ICP）

ICP 是 MySQL 5.6 引入的优化。在联合索引中，**把 WHERE 条件的一部分下推到存储引擎层，在索引遍历时就过滤**，减少回表次数。

\`\`\`sql
-- 联合索引 idx_name_age (name, age)
SELECT * FROM users WHERE name LIKE '张%' AND age > 18;
\`\`\`

**无 ICP**：
1. 在 idx_name_age 中找到所有 name LIKE '张%' 的记录的主键（假设 1000 条）。
2. 对每条记录**回表**取完整行（1000 次回表）。
3. 在 Server 层过滤 age > 18（剩 100 条）。

**有 ICP**：
1. 在 idx_name_age 中找到 name LIKE '张%' 的记录，**同时在索引中判断 age > 18**（索引含 age 列）。
2. 只对满足 age > 18 的记录（100 条）**回表**。
3. 回表次数从 1000 降到 100。

\`\`\`sql
-- EXPLAIN 中 Extra 显示 "Using index condition" 表示用了 ICP
\`\`\`

ICP 利用了联合索引中"非最左列"的条件，减少回表。LIKE 的右模糊 + 其他索引列条件是最典型的 ICP 受益场景。

### 四、索引类型

#### 4.1 主键索引

即聚簇索引，前面详述。一张表一个，主键列唯一非空。

#### 4.2 唯一索引（Unique Index）

索引列值必须唯一（允许 NULL）。兼具"索引"和"约束"双重作用。

\`\`\`sql
CREATE UNIQUE INDEX idx_email ON users(email);
\`\`\`

**唯一索引 vs 普通索引的性能差异**：
- 查找：几乎相同（都走 B+ 树）。
- 插入：唯一索引插入时要检查唯一性，多一次查找。InnoDB 中唯一索引的插入**不能使用 Change Buffer**（必须立即检查），而普通索引可以。所以写多场景，普通索引略快。

#### 4.3 普通索引（Normal Index）

最基本的索引，无约束。

\`\`\`sql
CREATE INDEX idx_age ON users(age);
\`\`\`

#### 4.4 联合索引（Composite Index）

多列组合的索引。**列的顺序至关重要**，受最左前缀原则约束（详见下节）。

\`\`\`sql
CREATE INDEX idx_dept_age_name ON employees(dept_id, age, name);
\`\`\`

#### 4.5 全文索引（Fulltext Index）

用于全文搜索（如搜索文章内容中的关键词）。

\`\`\`sql
CREATE FULLTEXT INDEX ft_content ON articles(content);
SELECT * FROM articles WHERE MATCH(content) AGAINST('数据库 索引' IN NATURAL LANGUAGE MODE);
\`\`\`

MySQL 的全文索引对中文支持一般（需 ngram 分词插件），生产场景通常用 Elasticsearch 做全文搜索。

#### 4.6 前缀索引

对长字符串列（如 URL），只索引前 N 个字符，节省空间。

\`\`\`sql
CREATE INDEX idx_url ON logs(url(20));  -- 只索引 url 前 20 个字符
\`\`\`

代价：不能用覆盖索引（因为索引只有前缀），也不能做 ORDER BY。

### 五、联合索引与最左前缀原则

**最左前缀原则**是联合索引最重要的规则：联合索引 (a, b, c) 的 B+ 树先按 a 排序，a 相同按 b 排序，b 相同按 c 排序。因此**只能从最左列开始连续使用**。

#### 5.1 哪些查询能用联合索引

索引 \`idx_abc (a, b, c)\`：

\`\`\`sql
-- ✅ 能用索引
WHERE a = 1                       -- 用到 a
WHERE a = 1 AND b = 2             -- 用到 a, b
WHERE a = 1 AND b = 2 AND c = 3   -- 用到 a, b, c
WHERE a = 1 AND b > 2             -- 用到 a, b（b 走范围）
WHERE a = 1 AND c = 3             -- 只用到 a（c 无法跳过 b 使用）
WHERE a > 1 AND b = 2             -- 只用到 a（a 走范围后 b 失效）

-- ❌ 不能用索引
WHERE b = 2                       -- 缺少最左列 a
WHERE b = 2 AND c = 3             -- 缺少最左列 a
WHERE c = 3                       -- 缺少最左列 a
\`\`\`

#### 5.2 范围查询会"断"索引

联合索引中，**遇到范围查询（>、<、BETWEEN、LIKE 'x%'），其后的列无法使用索引**。

\`\`\`sql
-- idx_abc (a, b, c)
WHERE a = 1 AND b > 5 AND c = 3
-- a 用索引（等值）
-- b 用索引（范围）
-- c 不用索引（b 是范围，c 无法继续用）
\`\`\`

原因：B+ 树中 b 是范围时，匹配的 b 值有多个，每个 b 值下 c 的排列不同，无法直接定位 c。此时 c 的过滤要回表后进行（可用 ICP 优化）。

**优化技巧**：把范围查询列放在联合索引最后。

\`\`\`sql
-- 差：范围列在中间
idx (a, b_range, c)  -- c 用不上

-- 好：范围列在最后
idx (a, c, b_range)  -- a, c 都能用
\`\`\`

#### 5.3 索引列顺序设计原则

设计联合索引列顺序时考虑：

1. **等值查询优先放前面**：等值条件能精确缩小范围。
2. **范围查询放最后**：避免"断"后面的列。
3. **高区分度（基数）列优先**：区分度高的列放前面能更快缩小范围。区分度 = 不同值数 / 总行数。
4. **排序列考虑**：如果 ORDER BY 的列和索引列一致，可避免 filesort。

\`\`\`sql
-- 评估区分度
SELECT COUNT(DISTINCT dept_id) / COUNT(*) FROM employees;  -- 0.01 说明 dept_id 区分度低
SELECT COUNT(DISTINCT email) / COUNT(*) FROM users;        -- 1.0 说明 email 区分度高
\`\`\`

> **注意**：区分度只是参考之一，不是绝对。高频查询的列即使区分度低也值得放前面。

### 六、索引失效场景

以下场景会让索引"失效"（优化器放弃使用索引，改为全表扫描）：

#### 6.1 对索引列做函数/表达式运算

\`\`\`sql
-- ❌ 索引失效
WHERE YEAR(created_at) = 2024
WHERE LEFT(name, 1) = '张'
WHERE age + 1 = 18
WHERE UPPER(name) = 'ZHANG'

-- ✅ 改写
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'
WHERE name LIKE '张%'
WHERE age = 17
\`\`\`

原因：B+ 树是按列**原值**排序的，函数运算后值变了，无法用索引的有序性。

#### 6.2 隐式类型转换

\`\`\`sql
-- phone 是 VARCHAR，但传了数字
WHERE phone = 13800138000        -- ❌ 索引失效（MySQL 把 phone 转成数字比较 = CAST(phone AS SIGNED)）

-- ✅ 改写
WHERE phone = '13800138000'
\`\`\`

MySQL 的规则是"把字符串转成数字"，相当于对 phone 列做了 CAST 函数，触发了 6.1 的失效。

#### 6.3 LIKE 左侧通配符

\`\`\`sql
WHERE name LIKE '%张'   -- ❌ 索引失效（左侧 % 无法定位）
WHERE name LIKE '%张%'  -- ❌ 索引失效
WHERE name LIKE '张%'   -- ✅ 可用索引（前缀匹配）
\`\`\`

原因：B+ 树按前缀排序，'张%' 能定位到"张"开头的区间；'%张' 无法定位区间。

> 全文搜索场景用 Elasticsearch 或 MySQL 全文索引，不要用 LIKE '%xxx%'。

#### 6.4 OR 条件

\`\`\`sql
-- 如果 a 和 b 都有索引，MySQL 5.0+ 可用 index_merge 合并
WHERE a = 1 OR b = 2

-- 如果 b 没有索引，整个查询放弃索引，全表扫描
WHERE a = 1 OR b = 2   -- b 无索引 → 全表扫描
\`\`\`

优化：改用 UNION ALL。

\`\`\`sql
SELECT * FROM t WHERE a = 1
UNION ALL
SELECT * FROM t WHERE b = 2 AND a <> 1
\`\`\`

#### 6.5 != / <> / NOT IN / IS NOT NULL

\`\`\`sql
WHERE status != 1       -- 通常索引失效（需扫描大部分数据，优化器认为全表扫描更划算）
WHERE status NOT IN (1,2)
\`\`\`

原因：!= 意味着"除了 1 以外的所有值"，匹配范围太大，优化器倾向于全表扫描。这不是绝对的——如果 != 排除的值占大多数（如 status != 99，99 占 99% 的行），优化器可能仍用索引。

#### 6.6 ORDER BY 与索引

\`\`\`sql
-- idx_abc (a, b, c)
WHERE a = 1 ORDER BY b, c          -- ✅ 索引有序，避免 filesort
WHERE a = 1 ORDER BY b             -- ✅
WHERE a = 1 ORDER BY c             -- ❌ 跳过 b，filesort
WHERE a = 1 ORDER BY b DESC, c ASC -- ❌ 排序方向不一致，filesort
ORDER BY a, b                      -- ✅ 但无 WHERE 时需扫描整个索引
\`\`\`

### 七、EXPLAIN 执行计划详解

EXPLAIN 是 SQL 调优的核心工具，展示优化器选择的执行计划。

\`\`\`sql
EXPLAIN SELECT * FROM users WHERE age > 18;
\`\`\`

输出字段（MySQL）：

#### 7.1 id

查询的序号。数字越大越先执行。相同 id 从上往下执行。子查询会有不同 id。

#### 7.2 select_type

查询类型：SIMPLE（简单查询）、PRIMARY（复杂查询最外层）、SUBQUERY（子查询）、DERIVED（派生表/FROM 子查询）、UNION（UNION 中的后续查询）。

#### 7.3 table

涉及的表名。

#### 7.4 type（最重要）——访问类型

从好到差排列：

| type | 含义 | 性能 |
|------|------|------|
| system | 表只有一行 | 极好 |
| const | 主键或唯一索引等值查询 | 极好 |
| eq_ref | JOIN 时被驱动表用主键/唯一索引等值匹配 | 极好 |
| ref | 普通索引等值查询 | 好 |
| range | 索引范围扫描（>, <, BETWEEN, IN） | 较好 |
| index | 扫描整个索引树（比 ALL 好因为索引比数据小） | 一般 |
| ALL | **全表扫描** | 差 |

**生产要求**：type 至少达到 range，禁止 ALL（除非表很小）。

#### 7.5 possible_keys

可能使用的索引。如果有值但 key 为 NULL，说明优化器认为全表扫描更划算（可能统计信息不准）。

#### 7.6 key

实际使用的索引。NULL 表示没用索引。

#### 7.7 key_len

使用的索引长度（字节）。可判断联合索引用了几列：

\`\`\`
idx_abc (a INT, b INT, c INT)
key_len = 4  → 只用了 a（INT 4 字节）
key_len = 8  → 用了 a, b
key_len = 12 → 用了 a, b, c
\`\`\`

（注意字符集和是否可空会影响 key_len 计算）

#### 7.8 ref

显示索引比较的来源：const（常量）、列名（如 db.t1.id）、func（函数）、NULL。

#### 7.9 rows

**预估扫描行数**。这是判断 SQL 性能的关键指标。越小越好。注意这是**预估值**，可能不准。

#### 7.10 filtered

过滤后剩余比例（0-100）。rows × filtered / 100 = 最终结果行数估计。

#### 7.11 Extra（重要）——额外信息

| Extra | 含义 | 好坏 |
|-------|------|------|
| Using index | 覆盖索引，不回表 | ✅ 好 |
| Using where | Server 层过滤 | 中性 |
| Using index condition | 索引下推 ICP | ✅ 好 |
| Using filesort | 额外排序（内存或磁盘） | ❌ 差，需优化 |
| Using temporary | 使用临时表（GROUP BY/DISTINCT 常见） | ❌ 差，需优化 |
| Using join buffer | JOIN 用了 BNL/BKA 缓冲 | 较差 |
| Impossible WHERE | WHERE 条件恒假 | 中性 |

**重点关注的坏信号**：Using filesort、Using temporary、Using join buffer，出现这些通常需要优化。

### 八、索引优化实战

#### 8.1 覆盖索引优化

\`\`\`sql
-- 优化前：需要回表
SELECT id, name, age FROM users WHERE name = '张三';
-- 索引 idx_name(name)，查到 id 后回表取 age

-- 优化后：覆盖索引
ALTER TABLE users ADD INDEX idx_name_age (name, age);
SELECT id, name, age FROM users WHERE name = '张三';
-- name 和 age 都在索引中，id 是主键也在索引叶子中 → 覆盖索引，不回表
\`\`\`

#### 8.2 联合索引优化排序

\`\`\`sql
-- 优化前：filesort
SELECT * FROM orders WHERE user_id = 100 ORDER BY created_at DESC LIMIT 10;
-- 索引 idx_user(user_id)，找到 user_id=100 的所有订单后按 created_at 排序

-- 优化后：索引天然有序
ALTER TABLE orders ADD INDEX idx_user_created (user_id, created_at);
SELECT * FROM orders WHERE user_id = 100 ORDER BY created_at DESC LIMIT 10;
-- idx_user_created 中 user_id=100 的记录已按 created_at 排序，直接取前 10，无 filesort
\`\`\`

#### 8.3 避免 SELECT *

SELECT * 会导致：
1. 无法用覆盖索引（必须回表取所有列）。
2. 传输冗余数据（如 TEXT 大字段）。
3. 表结构变化时影响应用。

**永远明确列出所需列**。

#### 8.4 分页优化：延迟关联

\`\`\`sql
-- 优化前：深分页慢
SELECT * FROM orders ORDER BY id LIMIT 100000, 10;
-- 扫描 100010 行，丢弃前 100000 行

-- 优化后：延迟关联（先查主键再关联）
SELECT * FROM orders o
INNER JOIN (SELECT id FROM orders ORDER BY id LIMIT 100000, 10) t
ON o.id = t.id;
-- 子查询走覆盖索引（SELECT id 只用主键），快速拿到 10 个 id，再回表 10 次
\`\`\`

#### 8.5 分页优化：游标分页

\`\`\`sql
-- 优化前
SELECT * FROM orders WHERE user_id = 100 ORDER BY id DESC LIMIT 10 OFFSET 100000;

-- 优化后：记住上一页最后一条的 id
SELECT * FROM orders WHERE user_id = 100 AND id < ?last_id ORDER BY id DESC LIMIT 10;
-- 直接定位，扫描行数恒定为 10
\`\`\`

游标分页的缺点：不支持跳页（只能上一页/下一页）。适合无限滚动、消息列表等场景。

### 九、索引维护成本

#### 9.1 写放大

每次 INSERT/UPDATE/DELETE 都要维护所有索引的 B+ 树。假设表有 5 个索引，一次 INSERT 实际要写 6 棵 B+ 树（1 聚簇 + 5 二级）。

\`\`\`
INSERT 一行 → 维护聚簇索引 B+ 树
            → 维护 idx_name B+ 树
            → 维护 idx_email B+ 树
            → 维护 idx_age B+ 树
            → 维护 idx_created B+ 树
            → 维护 idx_status B+ 树
\`\`\`

写多场景索引不宜过多。

#### 9.2 存储空间

每个索引是一棵 B+ 树。索引越多，磁盘占用越大。一个 10GB 的表建 5 个索引，总空间可能达 30-40GB。

#### 9.3 统计信息

优化器依赖统计信息选择执行计划。统计信息过时会导致选错索引。MySQL 用 \`ANALYZE TABLE\` 手动更新统计信息（一般自动维护）。

\`\`\`sql
ANALYZE TABLE users;  -- 更新统计信息
\`\`\`

### 十、索引创建的 Checklist

建索引前问自己：

1. 这个查询频率高吗？（低频查询不值得建索引）
2. 这个列的区分度够吗？（如 status 只有 0/1，区分度极低，索引意义不大）
3. 会不会和已有索引重复？（如已有 idx_abc(a,b,c)，再建 idx_a 就是冗余）
4. 写入频率高吗？（写多读少的表少建索引）
5. 是否能用联合索引替代多个单列索引？
6. 是否考虑了最左前缀？
7. 范围查询列是否放在联合索引最后？
8. 是否需要覆盖索引？

### 十一、多语言索引使用对照

\`\`\`java
// Java JPA 自动建索引
@Entity @Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_name_age", columnList = "name, age")
})
public class User { ... }
\`\`\`

\`\`\`go
// Go GORM 标签
type User struct {
    ID    int64  \`gorm:"primaryKey;autoIncrement"\`
    Email string \`gorm:"uniqueIndex"\`
    Name  string \`gorm:"index:idx_name_age,priority:1"\`
    Age   int    \`gorm:"index:idx_name_age,priority:2"\`
}
\`\`\`

\`\`\`python
# Python SQLAlchemy
class User(Base):
    __tablename__ = 'users'
    __table_args__ = (
        Index('idx_name_age', 'name', 'age'),
    )
    id = Column(Integer, primary_key=True)
    email = Column(String(100), unique=True)
\`\`\`

\`\`\`javascript
// Node.js Prisma schema
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String
  age   Int
  @@index([name, age], name: "idx_name_age")
}
\`\`\`

### 十二、生产案例

#### 案例 1：慢查询导致 CPU 飙升

**现象**：某接口偶发响应慢，MySQL CPU 飙到 90%。

**排查**：慢查询日志发现 \`SELECT * FROM orders WHERE DATE(created_at) = '2024-01-15'\`。created_at 上有索引，但 DATE() 函数导致索引失效，全表扫描 1000 万行。

**解决**：改写为范围查询 \`WHERE created_at >= '2024-01-15' AND created_at < '2024-01-16'\`，命中索引，从 8 秒降到 2 毫秒。

#### 案例 2：索引列顺序不当

**现象**：\`SELECT * FROM orders WHERE user_id = ? AND status = 1 AND created_at > ? ORDER BY created_at LIMIT 10\` 慢。

**排查**：索引是 (user_id, created_at, status)。created_at 是范围查询，status 在其后用不上索引，导致回表后过滤大量数据。

**解决**：调整索引顺序为 (user_id, status, created_at)。user_id 等值、status 等值、created_at 范围，三列都用上索引，且 created_at 有序避免 filesort。

#### 案例 3：隐式类型转换

**现象**：\`WHERE phone = 13800138000\` 偶发慢。

**排查**：phone 是 VARCHAR，传入数字导致隐式转换，索引失效。

**解决**：应用层确保传字符串 \`WHERE phone = '13800138000'\`。

### 十三、InnoDB 页结构深度解析

InnoDB 以**页（Page）**为最小磁盘 IO 单位，默认 16KB。理解页结构有助于理解索引的存储和性能。

#### 13.1 页的类型

InnoDB 有多种页类型：数据页（存放聚簇索引的行数据）、索引页（存放二级索引）、undo 页、redo 页、系统页等。我们关注数据页和索引页。

#### 13.2 数据页的内部结构

一个 16KB 的数据页分为 7 部分：

\`\`\`
┌─────────────────────────────────┐  ← 高地址
│ File Header (38 字节)            │  页头：页号、前后页指针、页类型
├─────────────────────────────────┤
│ Page Header (56 字节)            │  记录数、槽位数等
├─────────────────────────────────┤
│ Infimum + Supremum (26 字节)     │  最小/最大虚拟记录
├─────────────────────────────────┤
│ User Records (变长)              │  ← 实际行数据，从低地址向高地址增长
├─────────────────────────────────┤
│ Free Space (变长)                │  ← 空闲空间
├─────────────────────────────────┤
│ Page Directory (变长)            │  槽位目录，用于二分查找
├─────────────────────────────────┤
│ File Trailer (8 字节)            │  校验和、LSN
└─────────────────────────────────┘  ← 低地址
\`\`\`

**关键点**：
- 行记录在页内通过**单向链表**连接（按主键顺序）。
- **Page Directory** 把页内的记录分组，每组最后一个记录的地址存入"槽位"。查找时先在槽位上二分查找定位到组，再在组内遍历。这让页内查找从 O(n) 降到 O(log n)。
- 页的**前驱/后继指针**把数据页连成双向链表——这就是 B+ 树叶子节点链表的物理实现。

#### 13.3 页分裂与页合并

**页分裂**：当一个页写满后插入新记录，InnoDB 把该页一分为二：
1. 创建一个新页。
2. 把原页约一半记录移到新页。
3. 调整前后页的链表指针。
4. 在父节点中插入新页的最小键。

页分裂是**昂贵的**：涉及数据移动、链表调整、父节点更新，且产生大量 redo log。**自增主键**能避免页分裂（新记录总追加到最后一页），**随机主键（UUID）**会导致频繁页分裂。

**页合并**：当删除记录使页的填充率低于 MERGE_THRESHOLD（默认 50%）时，InnoDB 把该页与兄弟页合并，释放空页。

\`\`\`sql
-- 查看页分裂情况
SHOW ENGINE INNODB STATUS;
-- 关注 "page operations" 部分的 inserts、updates、deletes
\`\`\`

#### 13.4 Buffer Pool（缓冲池）

InnoDB 的**缓冲池**是内存区域，缓存热点数据页和索引页。所有读写都先经过 Buffer Pool：

- **读**：先查 Buffer Pool，命中则直接返回；未命中则从磁盘读入 Buffer Pool。
- **写**：先修改 Buffer Pool 中的页（变为"脏页"），由后台线程异步刷盘。

\`\`\`sql
-- 查看 Buffer Pool 配置
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';
-- 生产建议：物理内存的 50-70%
\`\`\`

Buffer Pool 用**改进的 LRU 算法**管理：
- LRU 链表分为**young 区（热数据，前 5/8）**和 **old 区（冷数据，后 3/8）**。
- 新读入的页放入 old 区头部。
- old 区的页若在 \`innodb_old_blocks_time\`（默认 1 秒）后再次被访问，才提升到 young 区。
- 这避免了全表扫描刷掉热数据（全表扫描的页只短暂停留在 old 区）。

### 十四、Change Buffer（写缓冲）

**Change Buffer** 是 Buffer Pool 的一部分，用于优化**二级索引的写入**。

**原理**：聚簇索引是唯一的，插入时必须立即检查唯一性。但二级索引不需要立即检查，可以把修改**先缓存**在 Change Buffer 中，等后续该页被读到内存时再**合并（merge）**。

**收益**：减少随机 IO。如果一个二级索引页不在 Buffer Pool 中，普通插入需要先从磁盘读页（1 次随机 IO）再修改。有 Change Buffer 则直接缓存修改，省掉这次随机 IO。

**限制**：
- 只对**普通索引**有效，唯一索引不能用（必须立即检查唯一性）。
- 只对**写多读少**的场景收益大。如果写完马上读，Change Buffer 的缓存还没合并就要被读，反而多一步合并。
- 适合"写后不立即读"的场景，如日志表。

### 十五、索引基数与统计信息

#### 15.1 基数（Cardinality）

索引的**基数**是索引列不同值的数量。基数 / 总行数 = **区分度**。

- 区分度接近 1：如 email、手机号，索引效率高。
- 区分度低：如 status（0/1）、gender（男/女），索引效率低，优化器可能放弃使用。

\`\`\`sql
-- 查看索引基数
SHOW INDEX FROM users;
-- Cardinality 列显示每个索引的基数估计值
\`\`\`

#### 15.2 统计信息收集

InnoDB 通过**采样**估计基数（不是全表扫描），默认采 20 个数据页。采样估计可能不准，导致优化器选错索引。

\`\`\`sql
-- 手动更新统计信息
ANALYZE TABLE users;

-- 调整采样页数（永久生效需写配置文件）
SET GLOBAL innodb_stats_sample_pages = 100;
\`\`\`

统计信息不准的典型表现：EXPLAIN 显示 rows 估计值与实际相差很大，优化器选了全表扫描而不走索引。

### 十六、Index Merge（索引合并）

MySQL 5.0+ 支持 Index Merge：当 WHERE 中有多个条件分别能用不同索引时，优化器可以**分别查多个索引，再合并结果**。

\`\`\`sql
-- 假设有 idx_a(a) 和 idx_b(b)
SELECT * FROM t WHERE a = 1 OR b = 2;
-- 优化器可能：
-- 1. 查 idx_a 得到 a=1 的行 → 集合 A
-- 2. 查 idx_b 得到 b=2 的行 → 集合 B
-- 3. 合并 A ∪ B（去重）

-- EXPLAIN 中 type 显示 index_merge，Extra 显示 Using union(idx_a,idx_b)
\`\`\`

Index Merge 的三种类型：
- **Intersection**：多个条件的交集（AND）。
- **Union**：多个条件的并集（OR）。
- **Sort-Union**：Union 的变体，先排序再合并。

但 Index Merge 不是万能的，通常不如建一个合适的联合索引。它更多是"没有合适联合索引时的兜底"。

### 十七、Hash Join（MySQL 8.0+）

MySQL 8.0.18 引入了 **Hash Join**，替代了之前的 **Nested Loop Join**（嵌套循环连接）作为无索引 JOIN 的默认算法。

**Nested Loop Join**：对驱动表的每一行，遍历被驱动表找匹配。时间复杂度 O(m×n)。有索引时被驱动表查找快（O(log n)），无索引时退化到 O(m×n)。

**Hash Join**：
1. 用小表构建**哈希表**（键为 JOIN 列）。
2. 遍历大表，对每行在哈希表中查找匹配。
3. 时间复杂度 O(m+n)，远优于 Nested Loop 的 O(m×n)。

\`\`\`sql
-- MySQL 8.0 中，无索引的 JOIN 自动用 Hash Join
EXPLAIN SELECT * FROM t1 JOIN t2 ON t1.name = t2.name;
-- Extra: Using join hash (Block Nested Loop replaced by hash join)
\`\`\`

Hash Join 让无索引 JOIN 不再是灾难，但仍不如有索引的 Nested Loop（有索引时 O(m log n)）。

### 十八、函数索引与虚拟列（MySQL 8.0+）

MySQL 8.0+ 支持**函数索引**——对表达式结果建索引。

\`\`\`sql
-- 8.0 前：WHERE LOWER(name) = 'zhang' 索引失效
-- 8.0+：建函数索引
CREATE INDEX idx_lower_name ON users ((LOWER(name)));
SELECT * FROM users WHERE LOWER(name) = 'zhang';  -- 现在能用索引
\`\`\`

**虚拟列（Generated Column）**：列值由表达式计算得出，不实际存储（VIRTUAL）或存储（STORED）。

\`\`\`sql
-- 添加虚拟列 + 索引
ALTER TABLE users ADD COLUMN name_lower VARCHAR(50) 
  GENERATED ALWAYS AS (LOWER(name)) VIRTUAL;
CREATE INDEX idx_name_lower ON users(name_lower);

-- 查询用虚拟列
SELECT * FROM users WHERE name_lower = 'zhang';
\`\`\`

适用场景：JSON 字段提取、大小写不敏感查询、计算列查询。

### 十九、不可见索引（Invisible Index）

MySQL 8.0+ 支持**不可见索引**：索引对优化器"隐藏"，但仍然维护。用于安全地测试索引删除的影响。

\`\`\`sql
-- 让索引不可见
ALTER TABLE users ALTER INDEX idx_age INVISIBLE;

-- 如果查询性能没变化，说明这个索引没被用到，可以安全删除
ALTER TABLE users DROP INDEX idx_age;

-- 如果性能变差，恢复可见
ALTER TABLE users ALTER INDEX idx_age VISIBLE;
\`\`\`

这是线上索引治理的利器——不用真正删索引就能测试"没有这个索引会怎样"。

### 二十、索引监控与治理

#### 20.1 查看索引使用情况

\`\`\`sql
-- MySQL 8.0: 查看索引使用统计
SELECT * FROM sys.schema_unused_indexes;
SELECT * FROM sys.schema_redundant_indexes;

-- performance_schema 统计
SELECT * FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = 'your_db' ORDER BY COUNT_STAR DESC;
\`\`\`

#### 20.2 冗余索引检测

冗余索引：已有 (a, b) 又建 (a)，或已有 (a) 又建 (a, b) 但查询只用 a。

\`\`\`sql
-- pt-toolkit 工具
pt-duplicate-key-checker --user=root --password=xxx your_db
\`\`\`

冗余索引浪费空间和写入性能，应定期清理。

#### 20.3 索引上线流程

1. **分析**：用 EXPLAIN 验证索引能被用到。
2. **测试**：在测试环境建索引，压测验证性能。
3. **上线**：生产用 \`ALTER TABLE ... ALGORITHM=INPLACE, LOCK=NONE\` 在线建索引（不锁表）。大表用 pt-online-schema-change / gh-ost。
4. **监控**：观察索引使用率、慢查询变化。
5. **治理**：定期清理无用/冗余索引。

### 二十一、索引与锁的关系

InnoDB 的锁与索引密切相关——**锁是加在索引上的**。

- **行锁**：通过索引定位到行，在索引记录上加锁。如果没有索引，UPDATE/DELETE 不得不锁住所有扫描过的行（退化为表锁）。
- **间隙锁（Gap Lock）**：在索引的"间隙"上加锁，防止幻读。只在 Repeatable Read 隔离级别下出现。
- **临键锁（Next-Key Lock）**：记录锁 + 间隙锁，锁住一个左开右闭区间。

\`\`\`sql
-- 有索引：只锁匹配的行
DELETE FROM users WHERE id = 5;  -- 锁 id=5 这一行

-- 无索引：锁住所有扫描的行（相当于表锁）
DELETE FROM users WHERE nickname = '张三';  -- nickname 无索引，全表加锁！
\`\`\`

> **重要**：DELETE/UPDATE 的 WHERE 条件如果没有索引，会导致大量行被锁甚至表锁，是并发问题的常见根源。**删改操作的 WHERE 条件列必须有索引**。

### 二十二、聚簇索引主键选择的深层影响

#### 22.1 自增主键

自增主键（AUTO_INCREMENT）是 InnoDB 的最佳选择：
- **顺序插入**：新行总是追加到最后一页，不触发页分裂。
- **紧凑存储**：数据在磁盘上连续，范围查询 IO 效率高。
- **二级索引小**：二级索引叶子存主键值，BIGINT 自增只 8 字节。

#### 22.2 UUID 主键的问题

UUID 作为主键有三个严重问题：
1. **随机插入**：UUID 无序，每次插入可能落到中间某页，触发页分裂，数据碎片化。
2. **空间浪费**：UUID 36 字符（128 bit），二级索引叶子存主键，膨胀严重。
3. **缓存效率低**：随机 UUID 导致 Buffer Pool 命中率下降（热数据被冷数据挤出）。

**解决方案**：如果必须用 UUID，用**有序 UUID**（如 UUID v7、ULID）或把 UUID 存为 BINARY(16) 而非 VARCHAR(36)。

#### 22.3 没有主键的后果

InnoDB 要求每张表有聚簇索引。如果没有显式主键：
1. InnoDB 选第一个 UNIQUE NOT NULL 索引做聚簇索引。
2. 如果也没有，InnoDB 生成一个隐藏的 6 字节 ROWID 做聚簇索引。

隐藏 ROWID 的问题：不可见、不可引用、所有无主键表共享同一个全局 ROWID 计数器（竞争点）。**生产环境每张表必须有显式主键**。

### 二十三、跨数据库索引实现对比

| 特性 | MySQL InnoDB | PostgreSQL | Oracle | SQL Server |
|------|-------------|-----------|--------|------------|
| 索引结构 | B+ 树 | B 树（非 B+） | B+ 树 | B+ 树 |
| 聚簇索引 | 有（主键） | 无（用 IOT 模拟） | 有（IOT） | 有 |
| 二级索引存 | 主键值 | 行指针（CTID） | ROWID | 聚簇键 |
| 哈希索引 | 自适应哈希 | 原生支持 | 有 | 有 |
| 部分索引 | 无 | 有(WHERE) | 有 | 有(筛选索引) |
| 表达式索引 | 8.0+ 函数索引 | 有 | 有 | 计算列 |
| 位图索引 | 无 | 无 | 有 | 无 |

**PostgreSQL 的 B 树**：PG 用 B 树（非 B+ 树），数据存在所有节点中，但 PG 的 B 树叶子节点也有双向链表，范围查询同样高效。PG 没有聚簇索引概念，二级索引存的是行物理位置（CTID），不需要回表（直接定位行）。

**Oracle 的 IOT（Index-Organized Table）**：相当于 MySQL 的聚簇索引表，整张表按主键 B+ 树组织。

### 二十四、索引设计模式与反模式

#### 24.1 好的索引设计模式

**模式 1：高频查询全覆盖**
\`\`\`sql
-- 高频查询：SELECT user_id, name, avatar FROM users WHERE email = ?
-- 建联合索引覆盖查询
CREATE INDEX idx_email_cover ON users(email, user_id, name, avatar);
-- 覆盖索引，不回表，极快
\`\`\`

**模式 2：排序+分页优化**
\`\`\`sql
-- 高频查询：SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 10
CREATE INDEX idx_user_created ON orders(user_id, created_at);
-- 索引天然有序，无 filesort，直接取前 10
\`\`\`

**模式 3：范围+排序分离**
\`\`\`sql
-- WHERE status=1 AND created_at > ? ORDER BY created_at
CREATE INDEX idx_status_created ON orders(status, created_at);
-- status 等值过滤后，created_at 在索引中已排序
\`\`\`

#### 24.2 索引反模式

**反模式 1：索引泛滥**
\`\`\`sql
-- 每个查询条件都建单列索引
CREATE INDEX idx_a ON t(a);
CREATE INDEX idx_b ON t(b);
CREATE INDEX idx_c ON t(c);
CREATE INDEX idx_d ON t(d);
-- 问题：写入维护成本高，且 OR/多条件查询用不上多个单列索引（除非 index_merge）
-- 应该分析查询模式，用联合索引替代
\`\`\`

**反模式 2：低区分度索引**
\`\`\`sql
CREATE INDEX idx_status ON orders(status);  -- status 只有 0/1/2/3
-- 问题：区分度极低，优化器倾向于全表扫描，索引白建
\`\`\`

**反模式 3：冗余索引**
\`\`\`sql
CREATE INDEX idx_a ON t(a);
CREATE INDEX idx_ab ON t(a, b);  -- idx_a 完全冗余，因为 idx_ab 的最左前缀已覆盖 a
\`\`\`

**反模式 4：长字符串全索引**
\`\`\`sql
CREATE INDEX idx_url ON logs(url);  -- URL 可能几百字符，索引巨大
-- 应该用前缀索引
CREATE INDEX idx_url ON logs(url(30));
\`\`\`

### 二十五、索引性能基准测试方法

#### 25.1 EXPLAIN 分析

\`\`\`sql
EXPLAIN SELECT ...;
-- 重点看 type, key, rows, Extra
\`\`\`

#### 25.2 实际执行时间

\`\`\`sql
-- 开启 profiling
SET profiling = 1;
SELECT ...;
SHOW PROFILES;  -- 查看执行时间
\`\`\`

#### 25.3 慢查询日志

\`\`\`sql
-- 开启慢查询日志
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 0.1;  -- 超过 100ms 记录
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';
\`\`\`

#### 25.4 performance_schema

\`\`\`sql
-- 查看执行最多的 SQL
SELECT DIGEST_TEXT, COUNT_STAR, AVG_TIMER_WAIT/1000000000 AS avg_ms
FROM performance_schema.events_statements_summary_by_digest
ORDER BY COUNT_STAR DESC LIMIT 10;
\`\`\`

### 二十六、综合生产案例

#### 案例 4：联合索引拯救慢查询

**场景**：订单列表页，查询 \`WHERE user_id=? AND status IN (1,2) ORDER BY created_at DESC LIMIT 20\`，表 5000 万行。

**优化前**：索引 \`idx_user(user_id)\`。EXPLAIN 显示 type=ref, rows=50000, Extra=Using filesort。查一次 1.2 秒。

**分析**：user_id 过滤后还有 5 万行，要在这 5 万行中按 created_at 排序，filesort 慢。

**优化后**：建 \`idx_user_status_created(user_id, status, created_at)\`。user_id 等值、status IN 范围、created_at 排序。EXPLAIN 显示 type=range, rows=20, Extra=Using index condition。查一次 3 毫秒。

**提升**：400 倍。

#### 案例 5：覆盖索引消除回表

**场景**：商品搜索 \`SELECT id, name, price FROM products WHERE category_id=? AND status=1 ORDER BY price LIMIT 20\`。

**优化前**：索引 \`idx_category(category_id)\`。回表 5000 次取 name, price, status。

**优化后**：建 \`idx_cat_status_price_name(category_id, status, price, name)\`。覆盖索引，直接从索引取数据，不回表。从 50ms 降到 2ms。

### 二十七、JSON 索引（MySQL 8.0+）

MySQL 5.7 开始支持 JSON 类型，8.0 增强了 JSON 索引能力。

#### 27.1 虚拟列 + 索引

\`\`\`sql
-- products 表有 JSON 列 attrs
CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  attrs JSON  -- {"color":"red","size":"L","brand":"Nike"}
);

-- 提取 JSON 字段为虚拟列并建索引
ALTER TABLE products ADD COLUMN color VARCHAR(20)
  GENERATED ALWAYS AS (attrs->>'$.color') VIRTUAL;
CREATE INDEX idx_color ON products(color);

-- 查询用虚拟列（走索引）
SELECT * FROM products WHERE color = 'red';
\`\`\`

#### 27.2 多值索引（MySQL 8.0.17+）

对 JSON 数组建索引，数组每个元素都是索引项。

\`\`\`sql
-- tags 是 JSON 数组 ["new","hot","sale"]
ALTER TABLE products ADD COLUMN tags JSON;
CREATE INDEX idx_tags ON products ((CAST(tags AS CHAR(20) ARRAY)));

-- 查询数组中包含某值的记录
SELECT * FROM products WHERE 'hot' MEMBER OF (tags);
\`\`\`

### 二十八、全文索引详解

#### 28.1 全文索引原理

全文索引基于**倒排索引（Inverted Index）**：对文本分词，建立"词→文档列表"的映射。

\`\`\`
文档1: "数据库索引优化" → 分词: [数据库, 索引, 优化]
文档2: "数据库事务"     → 分词: [数据库, 事务]

倒排索引:
  数据库 → [文档1, 文档2]
  索引   → [文档1]
  优化   → [文档1]
  事务   → [文档2]
\`\`\`

#### 28.2 MySQL 全文索引使用

\`\`\`sql
-- 建全文索引
CREATE FULLTEXT INDEX ft_content ON articles(title, content);

-- 自然语言搜索（按相关性排序）
SELECT * FROM articles WHERE MATCH(title, content) AGAINST('数据库 索引');

-- 布尔搜索（支持 +/- 修饰符）
SELECT * FROM articles WHERE MATCH(title, content) AGAINST('+数据库 -事务' IN BOOLEAN MODE);

-- 查询扩展（先搜，再用结果扩展搜索）
SELECT * FROM articles WHERE MATCH(content) AGAINST('数据库' WITH QUERY EXPANSION);
\`\`\`

#### 28.3 中文全文搜索

MySQL 全文索引默认按空格分词，对中文不友好。8.0 提供 **ngram 分词器**：

\`\`\`sql
-- 建表时指定 ngram 分词器
CREATE TABLE articles (
  id INT PRIMARY KEY,
  content TEXT,
  FULLTEXT INDEX ft_content (content) WITH PARSER ngram
) ENGINE=InnoDB;

-- ngram 把中文按 n-gram（默认 2）切分
-- "数据库索引" → ["数据","据库","库索","索引"]
\`\`\`

生产场景的全文搜索通常用 **Elasticsearch**，它有更强大的分词（IK 分词器）、相关性打分、聚合分析能力。MySQL 全文索引适合简单场景。

### 二十九、索引与执行计划的深度关系

理解 EXPLAIN 输出与索引的关系，是调优的核心能力。

#### 29.1 从 EXPLAIN 判断索引使用情况

\`\`\`sql
EXPLAIN SELECT * FROM users WHERE email = 'test@xx.com';
\`\`\`

\`\`\`
+----+--------+-------+---------+-------+--------+----------+-------+------+
| id | table  | type  | key     | key_len| ref    | rows     | Extra |
+----+--------+-------+---------+-------+--------+----------+-------+------+
|  1 | users  | const | idx_email| 102   | const  | 1        | NULL  |
+----+--------+-------+---------+-------+--------+----------+-------+------+
\`\`\`

分析：
- type=const：唯一索引等值查询，最高效。
- key=idx_email：用了这个索引。
- key_len=102：索引长度 102 字节（VARCHAR(100) utf8mb4 = 100*3+2 = 302... 实际计算复杂）。
- rows=1：预估只扫描 1 行。
- Extra=NULL：没有额外操作，完美。

#### 29.2 判断联合索引用了几列

\`\`\`sql
-- 索引 idx_abc (a INT, b INT, c INT)，每个 INT 4 字节
EXPLAIN SELECT * FROM t WHERE a = 1 AND b = 2 AND c = 3;
-- key_len = 12 → 三列都用上了

EXPLAIN SELECT * FROM t WHERE a = 1 AND b = 2;
-- key_len = 8 → 用了 a, b

EXPLAIN SELECT * FROM t WHERE a = 1 AND c = 3;
-- key_len = 4 → 只用了 a（c 跳过 b 用不上）
\`\`\`

#### 29.3 识别坏执行计划

\`\`\`sql
-- 坏计划 1：全表扫描
EXPLAIN SELECT * FROM big_table WHERE unindexed_col = 1;
-- type=ALL, key=NULL, rows=10000000 → 全表扫描 1000 万行

-- 坏计划 2：filesort
EXPLAIN SELECT * FROM orders WHERE user_id=1 ORDER BY random_col;
-- Extra: Using filesort → 排序没走索引

-- 坏计划 3：temporary
EXPLAIN SELECT dept_id, COUNT(*) FROM employees GROUP BY dept_id;
-- Extra: Using temporary → GROUP BY 用了临时表
\`\`\`

### 三十、索引常见问题 FAQ

**Q1：建了索引为什么查询还是慢？**

可能原因：
1. 索引未被使用（EXPLAIN 看 key 是否为 NULL）——统计信息不准、索引失效。
2. 索引被使用但回表太多——用覆盖索引优化。
3. 数据量太大，即使走索引也慢——考虑分库分表。
4. 锁等待——被其他事务阻塞。

**Q2：索引建多了有什么坏处？**

1. 写入变慢（维护多棵 B+ 树）。
2. 磁盘占用增大。
3. 优化器选择困难（索引越多，优化器越可能选错）。

**Q3：联合索引 (a,b,c) 和三个单列索引哪个好？**

联合索引好。三个单列索引：
- OR 查询可能用 index_merge，但 AND 查询只能用一个。
- 空间浪费更多。
- 联合索引 (a,b,c) 能覆盖 a、(a,b)、(a,b,c) 三种查询模式。

**Q4：LIKE 查询怎么优化？**

1. 右模糊 \`LIKE 'x%'\` 能用索引。
2. 左模糊/全模糊用全文索引或 Elasticsearch。
3. 如果只是几个固定后缀，可建"反转列"索引。

**Q5：COUNT(*) 慢怎么办？**

1. InnoDB 的 COUNT(*) 要扫描（不像 MyISAM 有计数器）。
2. 用缓存（Redis 计数器）或汇总表。
3. 近似值：\`SHOW TABLE STATUS\` 的 Rows 字段（估计值）。

**Q6：怎么看一个索引有没有被使用？**

\`\`\`sql
-- MySQL 8.0
SELECT * FROM sys.schema_unused_indexes WHERE object_schema = 'your_db';
\`\`\`

如果长期未使用，考虑删除（先用 invisible index 测试）。

### 三十一、索引优化的系统性方法论

建立系统化的索引优化流程：

#### 第一步：识别慢查询
- 开启慢查询日志，设定阈值（如 100ms）。
- 用 pt-query-digest 分析慢查询 TOP N。
- 优先优化"高频 + 慢"的查询（影响最大）。

#### 第二步：分析执行计划
- 对每条慢查询跑 EXPLAIN。
- 重点关注：type 是否 ALL？key 是否 NULL？rows 是否过大？Extra 是否有 filesort/temporary？

#### 第三步：诊断根因
- 全表扫描 → 缺索引。
- 索引未使用 → 索引失效（函数/类型转换/左 LIKE 等）。
- filesort → ORDER BY 列无索引或方向不一致。
- 回表多 → 缺覆盖索引。
- 深分页 → LIMIT OFFSET 太大。

#### 第四步：设计索引
- 按查询模式设计联合索引（等值在前、范围在后）。
- 考虑覆盖索引（把 SELECT 列纳入索引）。
- 考虑排序优化（ORDER BY 列纳入索引）。
- 检查是否与已有索引冗余。

#### 第五步：验证与上线
- 测试环境 EXPLAIN 验证索引被使用。
- 压测对比优化前后性能。
- 线上在线建索引（不锁表）。
- 监控慢查询变化。

#### 第六步：持续治理
- 定期检查未使用索引。
- 定期检查冗余索引。
- 表结构变化时重新评估索引。
- 统计信息定期更新。

### 三十二、索引统计信息与直方图

优化器选择索引依赖统计信息。**基数（cardinality）** 是索引列不同值的数量，基数越高选择性越好。MySQL 通过 \`ANALYZE TABLE\` 采集统计信息，存储在 \`mysql.innodb_index_stats\` 和 \`mysql.innodb_table_stats\` 系统表中。

#### 基数估算算法

InnoDB 默认采样 8 个叶子页（可配置 \`innodb_stats_sample_pages\`）估算基数，因此可能不准。采样算法：

1. 随机选 N 个叶子页。
2. 统计这些页内不同索引键数量。
3. 按比例外推到全表。

**坑**：数据分布不均时，采样估算的基数可能严重偏离实际值，导致优化器选错索引。这时可手动 \`ANALYZE TABLE\` 重采样，或调大 \`innodb_stats_sample_pages\`。

#### 直方图统计（MySQL 8.0+）

直方图（histogram）描述列值分布，弥补基数估算不足。MySQL 8.0 支持两种：

- **等高直方图（equi-height）**：把数据按频率分到 N 个桶，每桶行数相近，记录桶边界与累计频率。适合基数高、分布不均的列。
- **等宽直方图（equi-width）**：按值域等宽分桶。适合基数低的列。

创建直方图：

\`\`\`sql
ANALYZE TABLE orders UPDATE HISTOGRAM ON amount WITH 100 BUCKETS;
ANALYZE TABLE orders UPDATE HISTOGRAM ON status WITH 20 BUCKETS;
\`\`\`

查看：

\`\`\`sql
SELECT column_name, histogram->>'$."number-of-buckets-specified"' AS buckets
FROM information_schema.column_statistics WHERE table_name='orders';
\`\`\`

删除：

\`\`\`sql
ANALYZE TABLE orders DROP HISTOGRAM ON amount;
\`\`\`

**使用场景**：当某列不在索引上但查询选择性依赖值分布时，直方图帮助优化器估算返回行数。例如 \`WHERE status='shipped'\`，若 90% 行是 shipped，全表扫描更快；若 1% 是 shipped，走索引更快。直方图让优化器知道分布，做出正确选择。

#### 持久化统计信息

\`innodb_stats_persistent=ON\` 时统计信息持久化到磁盘，重启不丢失；\`OFF\` 时在内存中，重启重新采样。生产建议开启持久化，避免重启后执行计划抖动。还可设 \`innodb_stats_auto_recalc=ON\` 让表数据变化超过 1/16 时自动重新采样。

### 三十三、函数索引与表达式索引

**函数索引（functional index）** 对列经过函数变换后的值建索引。MySQL 8.0.13+ 支持。

场景：查询 \`WHERE YEAR(create_time)=2024\`，普通索引失效。建函数索引：

\`\`\`sql
CREATE INDEX idx_year ON orders ((YEAR(create_time)));
\`\`\`

则 \`WHERE YEAR(create_time)=2024\` 可走索引。

**前缀函数索引**示例：

\`\`\`sql
CREATE INDEX idx_lower_name ON users ((LOWER(name)));
\`\`\`

查询 \`WHERE LOWER(name)='alice'\` 走索引。

#### 多语言对照

- **PostgreSQL**：\`CREATE INDEX ON orders (YEAR(create_time));\`（直接表达式索引）
- **Oracle**：\`CREATE INDEX idx_year ON orders (EXTRACT(YEAR FROM create_time));\`
- **SQL Server**：使用计算列 + 索引：\`ALTER TABLE orders ADD year_col AS YEAR(create_time); CREATE INDEX idx_year ON orders(year_col);\`
- **MySQL 5.7**：不支持函数索引，需用生成列模拟。

#### 生成列（Generated Column）

生成列分两种：

- **VIRTUAL**（虚拟）：不存值，读取时计算。不占存储，InnoDB 允许在虚拟列上建索引（索引里存计算值）。
- **STORED**（存储）：写入时计算并存储。占存储，可建普通索引。

\`\`\`sql
ALTER TABLE orders
  ADD full_name VARCHAR(200)
  GENERATED ALWAYS AS (CONCAT(last_name, ' ', first_name)) VIRTUAL;
CREATE INDEX idx_full ON orders(full_name);
\`\`\`

### 三十四、索引合并 Index Merge

**Index Merge** 是 MySQL 优化器在单表查询时同时使用多个索引，合并结果。三种合并方式：

1. **intersection（交集）**：对多个索引各自取主键，求交集。WHERE 条件用 AND 连接，每个条件可走不同索引。例：\`WHERE user_id=100 AND status=1\`。
2. **union（并集）**：对多个索引各自取主键，求并集并去重。WHERE 条件用 OR 连接。例：\`WHERE user_id=100 OR status=1\`。
3. **sort-union（排序并集）**：当索引返回行数多无法直接 union 时，先对各自主键排序再去重合并。

EXPLAIN 中 type 显示 \`index_merge\`，Extra 显示 \`Using intersect(idx_user,idx_status)\` 或 \`Using union(...)\`。

**优化开关**：

\`\`\`sql
SET optimizer_switch='index_merge=on,index_merge_union=on,index_merge_sort_union=on,index_merge_intersection=on';
\`\`\`

**注意**：Index Merge 不一定比单索引快——若某索引选择性很高，单索引更优。优化器会基于成本选择。一般推荐用联合索引替代 Index Merge，因为联合索引在 B+ 树上一次定位，而 Index Merge 需多次扫描再合并。

### 三十五、InnoDB vs MyISAM 索引实现对比

#### InnoDB

- **聚簇索引**：数据按主键 B+ 树存储，叶子节点存完整行。
- **二级索引**：叶子节点存主键值，需回表。
- **主键选择**：显式主键 > 第一个 NOT NULL UNIQUE > 隐藏 6 字节 ROWID。
- **建议**：用自增整型主键，保证插入顺序连续，页分裂少。

#### MyISAM

- **非聚簇**：数据存独立 \`.MYD\` 文件，索引存 \`.MYI\` 文件。
- **主键索引和二级索引结构相同**：叶子节点存行指针（数据文件偏移量），无回表概念。
- **查询**：主键和二级索引都是先查索引得行地址，再到数据文件读行。

#### 对比表

| 维度 | InnoDB | MyISAM |
|------|--------|--------|
| 数据存储 | 主键索引叶子节点 | 独立数据文件 |
| 二级索引叶子 | 存主键值 | 存行指针 |
| 二级索引查询 | 回表（用主键再查主键索引） | 直接按指针读数据 |
| 主键范围扫描 | 顺序读叶子（数据就在叶子） | 索引与数据分离，随机 IO |
| 写入开销 | 维护聚簇索引，主键乱序致页分裂 | 仅追加数据 + 更新索引指针 |
| 适用场景 | OLTP，主键查询多 | 只读/统计，OLAP（已不推荐） |

**结论**：InnoDB 聚簇索引对主键查询和主键范围扫描友好（顺序 IO），但二级索引需回表、写入维护成本高。MyISAM 二级索引不回表但无事务、无崩溃恢复，MySQL 5.5 后默认 InnoDB，MyISAM 已边缘化。

### 三十六、索引监控与碎片整理

#### 监控索引使用情况

MySQL 8.0 \`sys.schema_unused_indexes\` 视图列出未使用索引：

\`\`\`sql
SELECT * FROM sys.schema_unused_indexes WHERE object_schema='mydb';
\`\`\`

\`performance_schema.table_io_waits_summary_by_index_usage\` 记录每个索引的读写次数，可判断索引负载。

#### 冗余索引检测

\`sys.schema_redundant_indexes\` 视图列出冗余索引：

\`\`\`sql
SELECT * FROM sys.schema_redundant_indexes WHERE table_schema='mydb';
\`\`\`

冗余示例：已有 \`idx(a,b)\`，又建 \`idx(a)\`，后者冗余。

#### 索引碎片

B+ 树频繁删改产生碎片——页内空闲空间无法利用，页分裂后页填充率低。\`ANALYZE TABLE\` 仅更新统计，不解碎片。

碎片整理：

- \`OPTIMIZE TABLE t\`：重建表和索引，回收碎片。会锁表，在线做需谨慎。
- \`ALTER TABLE t ENGINE=InnoDB\`：重建表，效果同 OPTIMIZE。
- 在线 DDL（MySQL 8.0）：\`ALTER TABLE t ... ALGORITHM=INPLACE, LOCK=NONE\` 部分操作可在线执行。

\`SHOW TABLE STATUS LIKE 't'\` 看 \`Data_free\` 字段估算碎片空间。

### 三十七、索引设计反模式

1. **索引列上做运算**：\`WHERE id+1=10\` 失效，应 \`WHERE id=9\`。
2. **隐式类型转换**：\`WHERE phone=13800000000\`（phone 是 varchar），MySQL 把字符串转数字比较，索引失效。应 \`WHERE phone='13800000000'\`。
3. **左模糊**：\`WHERE name LIKE '%张'\` 失效；\`LIKE '张%'\` 走索引。
4. **OR 连接非索引列**：\`WHERE a=1 OR b=2\`，若 b 无索引则全表扫描；可用 UNION ALL 改写。
5. **联合索引顺序不当**：高频查询条件未放最左，索引利用率低。
6. **过度索引**：每个查询一个索引，写入成本爆炸。一般单表 5 个索引以内。
7. **长字符串全列索引**：对 VARCHAR(500) 建全列索引浪费空间，用前缀索引 \`idx(name(20))\`。
8. **选择低基数列建索引**：性别只有两值，选择性极低，索引不如全表扫描。
9. **忽略排序方向**：\`ORDER BY a DESC, b ASC\` 若索引是 \`(a,b)\` 升序，无法完全消除 filesort；MySQL 8.0 支持降序索引 \`INDEX(a DESC, b ASC)\`。
10. **外键无索引**：外键列默认建索引，但若手动删除则父子表 JOIN 性能差。

### 三十八、本章小结

索引是数据库性能的核心。**B+ 树**因其矮矮的树高、叶子链表对范围查询友好，成为关系型数据库的主流索引结构。InnoDB 的**聚簇索引**把数据和主键索引合一，**二级索引**通过主键回表取数据。**覆盖索引**避免回表，**索引下推**减少回表次数，是两大优化利器。**联合索引的最左前缀原则**和**范围查询断索引**是设计索引时必须牢记的规则。**索引失效**（函数运算、隐式转换、左 LIKE、OR 等）是慢查询的常见原因。**EXPLAIN** 是诊断工具，重点关注 type、key、rows、Extra 四个字段。索引优化要从覆盖索引、排序优化、分页优化入手，同时权衡写入成本。

下一章我们将学习事务与隔离级别——ACID、并发问题、四种隔离级别、MVCC 多版本并发控制。
`,
    code: `// ============================================================
// 索引原理与优化 —— B+ 树索引模拟 + 执行计划生成
// ============================================================

// ---------- B+ 树实现（简化版）----------
class BPlusTreeNode {
  constructor(isLeaf = false) {
    this.isLeaf = isLeaf;
    this.keys = [];       // 键数组
    this.children = [];   // 内部节点：子节点指针；叶子节点：数据
    this.next = null;     // 叶子节点的下一个（链表）
    this.prev = null;     // 叶子节点的上一个
  }
}

class BPlusTree {
  constructor(order = 4) {
    this.order = order;          // 阶数（每个节点最多 order 个键）
    this.root = new BPlusTreeNode(true);
    this.leafHead = this.root;   // 叶子链表头
  }
  // 查找：返回所在的叶子节点和键的索引
  find(key) {
    let node = this.root;
    while (!node.isLeaf) {
      let i = 0;
      while (i < node.keys.length && key >= node.keys[i]) i++;
      node = node.children[i];
    }
    let i = 0;
    while (i < node.keys.length && node.keys[i] < key) i++;
    return { node, index: i, found: i < node.keys.length && node.keys[i] === key };
  }
  // 插入
  insert(key, value) {
    const { node } = this.find(key);
    const pos = node.keys.findIndex(k => k > key);
    const idx = pos === -1 ? node.keys.length : pos;
    node.keys.splice(idx, 0, key);
    node.children.splice(idx, 0, value);  // 叶子节点 children 存数据
    if (node.keys.length >= this.order) this.split(node);
  }
  // 分裂
  split(node) {
    const mid = Math.floor(node.keys.length / 2);
    const midKey = node.keys[mid];
    const right = new BPlusTreeNode(node.isLeaf);
    right.keys = node.keys.splice(mid + (node.isLeaf ? 0 : 1));
    right.children = node.children.splice(mid + (node.isLeaf ? 0 : 1));
    if (node.isLeaf) {
      right.next = node.next;
      if (node.next) node.next.prev = right;
      node.next = right;
      right.prev = node;
    }
    if (node === this.root) {
      const newRoot = new BPlusTreeNode(false);
      newRoot.keys = [midKey];
      newRoot.children = [node, right];
      this.root = newRoot;
    } else {
      // 简化：不处理内部节点分裂的递归（演示足够）
    }
  }
  // 范围查询：从 key1 到 key2
  rangeQuery(key1, key2) {
    const { node, index } = this.find(key1);
    const result = [];
    let cur = node, i = index;
    while (cur) {
      while (i < cur.keys.length) {
        if (cur.keys[i] > key2) return result;
        result.push({ key: cur.keys[i], value: cur.children[i] });
        i++;
      }
      cur = cur.next;
      i = 0;
    }
    return result;
  }
}

// ---------- 模拟表 + 索引 ----------
class IndexedTable {
  constructor(name) {
    this.name = name;
    this.rows = [];
    this.indexes = {};  // { 索引名: { cols: [], tree: BPlusTree } }
  }
  addIndex(name, cols) {
    const tree = new BPlusTree(4);
    this.indexes[name] = { cols, tree };
    // 重建索引
    this.rows.forEach((r, i) => {
      const key = cols.map(c => r[c]).join('|');
      tree.insert(key, i);
    });
  }
  insert(row) {
    const idx = this.rows.length;
    this.rows.push(row);
    for (const name in this.indexes) {
      const { cols, tree } = this.indexes[name];
      const key = cols.map(c => row[c]).join('|');
      tree.insert(key, idx);
    }
  }
}

// ---------- 全表扫描 vs 索引查找对比 ----------
function fullScan(table, predicate) {
  let scanned = 0;
  const result = [];
  for (const row of table.rows) {
    scanned++;
    if (predicate(row)) result.push(row);
  }
  return { result, scanned };
}

function indexLookup(table, indexName, keyVals) {
  const { cols, tree } = table.indexes[indexName];
  const key = keyVals.join('|');
  const { found, node, index } = tree.find(key);
  let scanned = 1; // 索引查找的 IO 次数
  if (!found) return { result: [], scanned };
  const rowIndex = node.children[index];
  return { result: [table.rows[rowIndex]], scanned };
}

// ---------- EXPLAIN 风格执行计划 ----------
function explain(table, whereCols, hasIndex) {
  const plan = {
    table: table.name,
    type: hasIndex ? 'ref' : 'ALL',
    possible_keys: hasIndex ? [Object.keys(table.indexes)] : ['NULL'],
    key: hasIndex ? Object.keys(table.indexes)[0] : 'NULL',
    rows: hasIndex ? 1 : table.rows.length,
    Extra: hasIndex ? 'Using index' : 'Using where; 全表扫描',
  };
  return plan;
}

// ============================================================
// 演示
// ============================================================
console.log('===== 1. B+ 树基本操作 =====');
const tree = new BPlusTree(4);
[10, 20, 5, 15, 30, 25, 6, 8, 12, 18].forEach(k => tree.insert(k, \`value-\${k}\`));
console.log('查找 15:', tree.find(15).found);
console.log('查找 99:', tree.find(99).found);
console.log('范围查询 [10, 20]:', tree.rangeQuery(10, 20).map(r => r.key));

console.log('\\n===== 2. 全表扫描 vs 索引查找 =====');
const users = new IndexedTable('users');
for (let i = 1; i <= 10000; i++) {
  users.insert({ id: i, name: \`user_\${i}\`, age: 18 + (i % 50), city: ['北京','上海','深圳'][i % 3] });
}
users.addIndex('idx_id', ['id']);

// 全表扫描查 id=9999
const fs = fullScan(users, r => r.id === 9999);
console.log('全表扫描: 扫描行数 =', fs.scanned, '→ 找到:', fs.result.length > 0);

// 索引查找 id=9999
const il = indexLookup(users, 'idx_id', [9999]);
console.log('索引查找: 扫描行数 =', il.scanned, '→ 找到:', il.result.length > 0);

console.log('\\n===== 3. 联合索引最左前缀演示 =====');
const emp = new IndexedTable('employees');
for (let i = 1; i <= 5000; i++) {
  emp.insert({ id: i, dept_id: i % 10, age: 20 + (i % 40), name: \`emp_\${i}\` });
}
emp.addIndex('idx_dept_age', ['dept_id', 'age']);  // 联合索引

// 符合最左前缀：dept_id=5 AND age=30
const m1 = indexLookup(emp, 'idx_dept_age', [5, 30]);
console.log('dept_id=5 AND age=30 → 索引命中, 扫描', m1.scanned);

// 不符合最左前缀（跳过 dept_id）：只有 age=30 → 无法用联合索引
console.log('仅 age=30 → 联合索引失效，需全表扫描');
const m2 = fullScan(emp, r => r.age === 30);
console.log('  全表扫描行数 =', m2.scanned);

console.log('\\n===== 4. 索引失效场景演示 =====');
// 函数运算：WHERE age + 1 = 31 等价 age = 30，但索引失效
console.log('场景: WHERE age + 1 = 31 (函数运算)');
console.log('  → 索引失效，全表扫描', emp.rows.length, '行');
console.log('  改写: WHERE age = 30 → 索引可用');

// 隐式类型转换
console.log('\\n场景: WHERE dept_id = "5" (字符串传给整型列)');
console.log('  → MySQL 隐式转换，索引失效');

// LIKE 左 %
console.log('\\n场景: WHERE name LIKE "%emp_1%" (左通配)');
console.log('  → 索引失效，全表扫描');

console.log('\\n===== 5. EXPLAIN 风格执行计划 =====');
console.log('无索引查询 age > 50:');
console.table(explain(users, ['age'], false));
console.log('有索引查询 id = 100:');
console.table(explain(users, ['id'], true));

console.log('\\n===== 6. 覆盖索引 vs 回表 =====');
console.log('索引 idx_id(id) 查询 SELECT id FROM users WHERE id = 100:');
console.log('  → id 在索引叶子中，覆盖索引，不回表');
console.log('索引 idx_id(id) 查询 SELECT * FROM users WHERE id = 100:');
console.log('  → 需要回表（取 name, age, city 等非索引列）');

console.log('\\n===== 演示结束 =====');
`,
  },
  // ==================== 第三章：事务与隔离级别 ====================
  {
    id: 'backend-transaction',
    group: '数据存储',
    icon: '⚖',
    title: '事务与隔离级别',
    content: `
# 事务与隔离级别

## 一、事务的本质：把多步操作变成"原子"的一步

### 1.1 为什么需要事务

考虑一个银行转账场景：账户 A 向账户 B 转 100 元。这在数据库层面至少包含两步：

\`\`\`sql
UPDATE accounts SET balance = balance - 100 WHERE id = 'A';  -- 第一步
UPDATE accounts SET balance = balance + 100 WHERE id = 'B';  -- 第二步
\`\`\`

如果第一步成功、第二步失败（例如机器断电、磁盘满、违反约束），就会出现"钱凭空消失"的灾难。事务要解决的就是这类问题：**把一组操作打包成一个不可分割的逻辑单元**，要么全部成功，要么全部回滚，从而保证数据一致性。

事务并非数据库独有。操作系统中的文件系统日志、消息队列的 ack 机制、分布式系统的两阶段提交，本质上都是事务思想的不同实现。理解数据库事务，是理解一切"需要原子性"的系统的基石。

### 1.2 事务的边界

一个事务由明确的开始与结束界定：

| 操作 | SQL 语句 | 说明 |
|------|---------|------|
| 显式开启 | \`BEGIN\` / \`START TRANSACTION\` | 标记事务起点 |
| 提交 | \`COMMIT\` | 持久化所有修改 |
| 回滚 | \`ROLLBACK\` | 撤销所有修改 |
| 保存点 | \`SAVEPOINT name\` | 在事务内部设置回滚点 |
| 回滚到保存点 | \`ROLLBACK TO name\` | 部分回滚 |
| 自动提交 | \`SET autocommit = 0\` | 关闭隐式提交 |

在 MySQL 中默认 \`autocommit = 1\`，即每条 DML 都是一个独立事务并自动提交。在 PostgreSQL、Oracle 中也类似。需要注意：**DDL 语句（CREATE/ALTER/DROP）通常无法回滚**，且会隐式提交前一个事务。

### 1.3 多语言对照：事务 API

不同语言/库操作事务的 API 形态各异，但模型一致：

\`\`\`java
// Java JDBC
Connection conn = dataSource.getConnection();
conn.setAutoCommit(false);
try {
    // ... SQL 操作
    conn.commit();
} catch (SQLException e) {
    conn.rollback();
} finally {
    conn.close();
}
\`\`\`

\`\`\`go
// Go database/sql
tx, err := db.Begin()
defer func() {
    if err != nil { tx.Rollback() }
}()
// ... tx.Exec(...)
err = tx.Commit()
\`\`\`

\`\`\`python
# Python SQLAlchemy
with engine.begin() as conn:   # 自动 commit / rollback
    conn.execute(text("UPDATE ..."))
\`\`\`

\`\`\`javascript
// Node.js mysql2
const conn = await pool.getConnection();
await conn.beginTransaction();
try {
    await conn.query('UPDATE ...');
    await conn.commit();
} catch (e) {
    await conn.rollback();
} finally {
    conn.release();
}
\`\`\`

可以看到，无论语言如何，事务的核心都是"开启—操作—提交/回滚"的三段式。

---

## 二、ACID 四大特性深入剖析

ACID 是事务的四大基本特性，理解它们背后的实现机制远比记住四个字母重要。

### 2.1 原子性（Atomicity）

**含义**：事务中的所有操作要么全部成功，要么全部失败回滚，不存在"部分成功"的中间状态。

**实现机制**：InnoDB 通过 **undo log（回滚日志）** 实现原子性。每条修改在执行前，先把"旧值"写入 undo log。如果事务需要回滚，引擎根据 undo log 把数据反向恢复到事务开始前的状态。

\`\`\`
事务修改流程：
  1. 读取旧值 -> 写入 undo log
  2. 修改 buffer pool 中的数据页（内存）
  3. 写入 redo log（顺序写，保证持久性）
  4. 后台异步刷新脏页到磁盘

回滚流程：
  根据 undo log 中的旧值，逐条反向操作
\`\`\`

undo log 不仅用于回滚，还用于 MVCC（多版本并发控制）。一个 undo log 在事务提交后不会立即删除，而是要等没有任何活跃事务还需要它时才能清理。

### 2.2 一致性（Consistency）

**含义**：事务执行前后，数据库从一个一致性状态转变为另一个一致性状态。例如转账前后，A 和 B 的总金额不变。

**关键点**：一致性是"目标"，原子性、隔离性、持久性是"手段"。一致性还要依赖应用层的约束（主键、外键、唯一键、CHECK 约束、触发器、业务规则）。数据库只能保证"结构上的一致性"，业务语义的一致性需要应用代码负责。

\`\`\`sql
-- 数据库层面的一致性约束
CREATE TABLE accounts (
  id BIGINT PRIMARY KEY,
  balance DECIMAL(18,2) NOT NULL,
  CONSTRAINT chk_balance CHECK (balance >= 0)  -- 余额不能为负
);
\`\`\`

### 2.3 隔离性（Isolation）

**含义**：多个并发事务之间相互隔离，一个事务的中间状态对其他事务不可见。

**实现机制**：这是 ACID 中最复杂的特性。InnoDB 通过 **锁机制 + MVCC** 共同实现：

- 写写冲突：用锁（行锁、间隙锁）串行化
- 读写冲突：用 MVCC 让读操作不阻塞写、写不阻塞读

隔离性是性能与正确性的权衡点。完全隔离（可串行化）性能差，所以数据库提供多种"隔离级别"让用户在正确性与性能间选择。

### 2.4 持久性（Durability）

**含义**：事务一旦提交，对数据的修改就是永久的，即使系统崩溃也不会丢失。

**实现机制**：InnoDB 通过 **redo log（重做日志）** 实现持久性。redo log 采用 WAL（Write-Ahead Logging）策略：

1. 修改数据时，先写 redo log（顺序写，很快）
2. 再修改内存中的 buffer pool（不立即写磁盘）
3. 提交时确保 redo log 刷盘
4. 崩溃恢复时，根据 redo log 重做未落盘的修改

\`\`\`
redo log 与 binlog 的区别：
  - redo log: 引擎层（InnoDB）的物理日志，记录"某页某偏移改成了什么"
  - binlog:   Server 层的逻辑日志，记录"执行了什么 SQL"
  - 两阶段提交：redo log prepare -> binlog write -> redo log commit
\`\`\`

### 2.5 ACID 之间的张力

ACID 并非孤立，它们之间存在张力：

- 强隔离性（可串行化）会降低并发度，影响性能
- 强持久性（每次提交都 fsync）会降低吞吐
- 一致性是最终目标，A/I/D 是保障 C 的手段

工程实践中，常常在隔离级别和刷盘策略上做取舍：金融系统倾向可串行化 + 双 fsync；互联网业务多用 RC + 异步刷盘。

---

## 三、事务生命周期与控制

### 3.1 事务状态机

事务从创建到结束经历若干状态：

\`\`\`
                ┌──────────┐
                │  Active  │ ← 事务正在执行
                └────┬─────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │Partially │ │Committed │ │  Failed  │
  │ Committed│ │          │ │          │
  └────┬─────┘ └────┬─────┘ └────┬─────┘
       │            │            │
       ▼            ▼            ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │  Failed  │ │ucceeded  │ │RolledBack│
  └────┬─────┘ └──────────┘ └────┬─────┘
       │                         │
       └──────────┬──────────────┘
                  ▼
            ┌──────────┐
            │Terminated│
            └──────────┘
\`\`\`

### 3.2 隐式提交与陷阱

某些语句会"隐式提交"当前事务，这是非常隐蔽的陷阱：

\`\`\`sql
BEGIN;
INSERT INTO t1 VALUES(1);
CREATE TABLE t2(id INT);  -- 这条 DDL 会隐式提交前面的事务！
INSERT INTO t1 VALUES(2);  -- 这条已经在新事务中
ROLLBACK;  -- 只能回滚第二条 INSERT
\`\`\`

会触发隐式提交的语句包括：DDL、\`LOCK TABLES\`、\`START REPLICATION\`、\`SET autocommit=1\` 等。在生产代码中要避免在事务中混入 DDL。

### 3.3 保存点与部分回滚

\`\`\`sql
BEGIN;
INSERT INTO orders VALUES(1, ...);
SAVEPOINT sp1;
INSERT INTO order_items VALUES(1, ...);
-- 发现某条明细有误
ROLLBACK TO sp1;  -- 只回滚到 sp1，orders 仍保留
INSERT INTO order_items VALUES(2, ...);
COMMIT;
\`\`\`

保存点让我们在长事务中实现"分支撤销"，但要谨慎使用：过多的保存点会占用 undo log 空间。

### 3.4 只读事务

\`\`\`sql
START TRANSACTION READ ONLY;
SELECT ...;
COMMIT;
\`\`\`

声明只读事务有两个好处：引擎可以优化（如不分配事务 ID、跳过 undo log）、便于读写分离中间件路由到从库。在只读事务中执行写操作会报错。

---

## 四、并发事务的三种异常

理解并发问题，是理解隔离级别的前提。并发事务相互干扰会产生三种典型异常。

### 4.1 脏读（Dirty Read）

事务 A 读到了事务 B **尚未提交**的修改，如果 B 之后回滚，A 读到的就是"无效数据"。

\`\`\`
时刻  事务A                  事务B
T1    BEGIN;
T2                          BEGIN;
T3                          UPDATE balance SET b=b-100;  -- 未提交
T4    SELECT balance;       -- 读到 B 修改后的值（脏数据）
T5                          ROLLBACK;   -- B 回滚
T6    -- A 基于"错误数据"做了决策 → 脏读危害
\`\`\`

脏读危害最大，主流数据库默认都不允许脏读。

### 4.2 不可重复读（Non-Repeatable Read）

事务 A 两次读取**同一行**，结果不同，因为中间事务 B 提交了对该行的修改/删除。

\`\`\`
时刻  事务A                  事务B
T1    BEGIN;
T2    SELECT balance WHERE id=1;  -- 1000
T3                          BEGIN;
T4                          UPDATE balance SET b=b+500 WHERE id=1;
T5                          COMMIT;
T6    SELECT balance WHERE id=1;  -- 1500  ← 不可重复读
\`\`\`

不可重复读关注的是"同一行的值变了"。它对"先查后判再改"的逻辑破坏严重。

### 4.3 幻读（Phantom Read）

事务 A 两次执行**同一范围查询**，结果集行数不同，因为中间事务 B 提交了新插入（或删除）。

\`\`\`
时刻  事务A                       事务B
T1    BEGIN;
T2    SELECT COUNT(*) WHERE age>18;  -- 100 行
T3                               BEGIN;
T4                               INSERT INTO users(age) VALUES(20);
T5                               COMMIT;
T6    SELECT COUNT(*) WHERE age>18;  -- 101 行  ← 幻读
\`\`\`

幻读关注的是"行数变了"。它与不可重复读的区别：前者是已有行被改，后者是新行出现。InnoDB 在 RR 级别通过间隙锁 + MVCC 基本解决幻读。

### 4.4 三种异常的对比表

| 异常 | 操作类型 | 关注点 | 危害程度 |
|------|---------|--------|---------|
| 脏读 | 读未提交 | 读到无效数据 | 极高 |
| 不可重复读 | 读已提交 | 同一行值变化 | 中 |
| 幻读 | 读已提交 | 范围查询行数变化 | 中 |

---

## 五、四种隔离级别

SQL 标准定义了四种隔离级别，从弱到强依次解决上述异常。

### 5.1 隔离级别对照表

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 性能 |
|---------|------|-----------|------|------|
| READ UNCOMMITTED（读未提交） | 可能 | 可能 | 可能 | 最高 |
| READ COMMITTED（读已提交，RC） | 避免 | 可能 | 可能 | 高 |
| REPEATABLE READ（可重复读，RR） | 避免 | 避免 | 基本避免 | 中 |
| SERIALIZABLE（可串行化） | 避免 | 避免 | 避免 | 最低 |

### 5.2 各级别实现原理

**READ UNCOMMITTED**：直接读最新数据，不加锁、不用 MVCC。基本没有数据库默认使用。

**READ COMMITTED（RC）**：每次 SELECT 都生成新的 Read View，所以能读到其他事务已提交的最新数据。Oracle、PostgreSQL 默认级别。

**REPEATABLE READ（RR）**：事务开始时生成一个 Read View，整个事务期间复用，所以多次读结果一致。MySQL InnoDB 默认级别。

**SERIALIZABLE**：所有读加共享锁、写加排他锁，事务完全串行执行。极少在生产使用。

### 5.3 MySQL InnoDB 的特殊之处

SQL 标准中 RR 不能避免幻读，但 InnoDB 在 RR 级别通过两种机制基本解决幻读：

1. **快照读**（普通 SELECT）：用 MVCC 读快照，看不到新插入的行
2. **当前读**（SELECT ... FOR UPDATE / LOCK IN SHARE MODE / UPDATE / DELETE）：用间隙锁/临键锁阻止其他事务在范围内插入

\`\`\`sql
-- 当前读示例（会加间隙锁）
SELECT * FROM users WHERE age > 18 FOR UPDATE;
-- 其他事务无法 INSERT age>18 的新行，直到当前事务提交
\`\`\`

### 5.4 隔离级别选择

| 场景 | 推荐级别 | 理由 |
|------|---------|------|
| 互联网高并发业务 | RC | 并发好，幻读危害可控 |
| 金融核心账务 | RR / SERIALIZABLE | 强一致性 |
| 报表统计 | RR | 数据快照稳定 |
| 简单配置表读写 | RC | 简单 |

注意：在 RC 级别下，\`SELECT ... FOR UPDATE\` 只锁命中的行，不锁间隙，所以仍可能有"幻读"。这是 RC 与 RR 的关键差异。

---

## 六、InnoDB 锁机制详解

锁是实现隔离性的核心机制。InnoDB 的锁体系相当复杂，需要分类理解。

### 6.1 锁的基本类型

**共享锁（S 锁）**：读锁，多个事务可同时持有。
\`\`\`sql
SELECT * FROM t WHERE id=1 LOCK IN SHARE MODE;  -- 加 S 锁
\`\`\`

**排他锁（X 锁）**：写锁，独占。与任何锁互斥。
\`\`\`sql
UPDATE t SET ... WHERE id=1;  -- 自动加 X 锁
SELECT * FROM t WHERE id=1 FOR UPDATE;  -- 显式加 X 锁
\`\`\`

兼容矩阵：

|  | S | X |
|--|---|---|
| S | ✓ | ✗ |
| X | ✗ | ✗ |

### 6.2 锁的粒度

**记录锁（Record Lock）**：锁住索引上的一条记录。
\`\`\`
索引: [10, 20, 30]
WHERE id=20 → 锁住 20 这条记录
\`\`\`

**间隙锁（Gap Lock）**：锁住索引记录之间的"间隙"，防止插入。只在 RR 级别生效。
\`\`\`
索引: [10, 20, 30]
WHERE id BETWEEN 10 AND 20 FOR UPDATE
→ 锁住 (10,20) 和 20 这条记录
间隙锁防止其他事务 INSERT id=15
\`\`\`

**临键锁（Next-Key Lock）**：记录锁 + 间隙锁，锁住一条记录及其前面的间隙。InnoDB 在 RR 级别默认使用临键锁。
\`\`\`
索引: [10, 20, 30]
临键锁区间: (-∞,10], (10,20], (20,30], (30,+∞)
\`\`\`

### 6.3 意向锁（Intention Lock）

表级锁，用于快速判断"表上是否有行锁"，避免逐行检查。

- IS（意向共享锁）：事务打算给行加 S 锁前，先给表加 IS
- IX（意向排他锁）：事务打算给行加 X 锁前，先给表加 IX

\`\`\`
事务A: 表加 IX，行 id=10 加 X 锁
事务B: 想给表加 S 锁（如 LOCK TABLES t READ）
  → 检测到 IX 不兼容 S → 阻塞
\`\`\`

意向锁之间互相兼容，只与表级锁冲突。

### 6.4 插入意向锁

一种特殊间隙锁，表示"事务打算在某间隙插入"。多个事务在同一间隙不同位置插入互不阻塞。

\`\`\`
间隙 (10, 20)
事务A: INSERT 15 → 加插入意向锁
事务B: INSERT 18 → 加插入意向锁
→ 不冲突，可并行
\`\`\`

但如果间隙已被间隙锁锁定，插入意向锁会等待。

### 6.5 锁的查看

\`\`\`sql
-- MySQL 8.0+
SELECT * FROM performance_schema.data_locks;
SELECT * FROM performance_schema.data_lock_waits;

-- MySQL 5.7
SHOW ENGINE INNODB STATUS;
\`\`\`

### 6.6 死锁

两个事务互相等待对方持有的锁，形成循环。

\`\`\`
时刻  事务A                  事务B
T1    UPDATE t SET x=1 WHERE id=1;  -- 持有 id=1 的 X 锁
T2                          UPDATE t SET x=2 WHERE id=2;  -- 持有 id=2 的 X 锁
T3    UPDATE t SET x=3 WHERE id=2;  -- 等待 id=2 的锁
T4                          UPDATE t SET x=4 WHERE id=1;  -- 等待 id=1 的锁 → 死锁
\`\`\`

InnoDB 有死锁检测机制（\`innodb_deadlock_detect\`），检测到死锁后会回滚代价较小的事务。也可设置 \`innodb_lock_wait_timeout\` 超时回滚。

**避免死锁的方法**：
1. 固定加锁顺序（如按主键升序）
2. 大事务拆小事务，缩短锁持有时间
3. 必要时降低隔离级别
4. 合理使用索引，避免锁升级

---

## 七、MVCC 多版本并发控制

MVCC（Multi-Version Concurrency Control）是 InnoDB 实现 RC/RR 隔离级别的核心，让"读写不互相阻塞"。

### 7.1 为什么需要 MVCC

纯锁方案下：读加 S 锁、写加 X 锁，读写互斥。在高并发读场景下，写操作会被频繁阻塞，性能差。MVCC 让普通读（快照读）不加锁，读的是历史版本，写的是新版本，两者并行。

### 7.2 版本链（Undo Log Chain）

每行数据除了实际字段，还有两个隐藏列：

- \`trx_id\`：最后一次修改该行的事务 ID
- \`roll_pointer\`：指向 undo log 中该行的上一版本

每次 UPDATE 都会：
1. 把旧值写入 undo log
2. 修改行的 \`trx_id\` 为当前事务 ID
3. 修改 \`roll_pointer\` 指向新 undo log

这样形成一条版本链：

\`\`\`
当前行(trx_id=100) → undo v2(trx_id=80) → undo v1(trx_id=50) → NULL
\`\`\`

### 7.3 Read View（读视图）

Read View 是事务在某时刻"可见性"的快照，包含：

- \`m_ids\`：生成 Read View 时活跃事务 ID 列表
- \`min_trx_id\`：m_ids 中最小值
- \`max_trx_id\`：下一个将分配的事务 ID
- \`creator_trx_id\`：创建该 Read View 的事务 ID

### 7.4 可见性判断规则

对于版本链上某个版本（trx_id 为 T）：

1. **T == creator_trx_id**：自己修改的，可见
2. **T < min_trx_id**：在 Read View 生成前已提交，可见
3. **T >= max_trx_id**：在 Read View 生成后才开始，不可见
4. **min_trx_id <= T < max_trx_id**：
   - 若 T 在 m_ids 中：未提交，不可见
   - 若 T 不在 m_ids 中：已提交，可见

如果当前版本不可见，沿 \`roll_pointer\` 找上一版本，直到找到可见版本或链尾。

### 7.5 RC 与 RR 的差异

| 级别 | Read View 生成时机 | 效果 |
|------|------------------|------|
| RC | 每次 SELECT 都生成新的 | 能读到最新已提交数据 → 不可重复读 |
| RR | 事务第一次 SELECT 时生成，复用 | 整个事务读同一快照 → 可重复读 |

这就是为什么 RR 能解决不可重复读：它"冻结"了可见性快照。

### 7.6 MVCC 的代价

- undo log 占用空间，需要后台 purge 线程清理
- 长事务会阻碍 undo log 清理，导致表空间膨胀（著名坑）
- 长事务 + 大量更新 → 历史版本堆积 → 性能下降

生产中应避免长事务，定期监控 \`information_schema.innodb_trx\`。

---

## 八、乐观锁与悲观锁

这是应用层的并发控制思想，与数据库锁相对。

### 8.1 悲观锁

"假设一定会冲突，先加锁再操作"。

\`\`\`sql
BEGIN;
SELECT balance FROM accounts WHERE id=1 FOR UPDATE;  -- 加 X 锁
-- 应用计算新余额
UPDATE accounts SET balance=? WHERE id=1;
COMMIT;
\`\`\`

适用：冲突频繁、临界区短。缺点：锁等待开销大、易死锁。

### 8.2 乐观锁

"假设冲突少见，提交时再校验"。常用 version 字段。

\`\`\`sql
-- 表结构
CREATE TABLE products(
  id BIGINT PRIMARY KEY,
  name VARCHAR(100),
  stock INT,
  version INT DEFAULT 0
);

-- 更新时校验版本
UPDATE products SET stock=stock-1, version=version+1
WHERE id=1 AND version=5;  -- 期望 version=5
-- affected_rows=0 说明被其他事务抢先 → 重试
\`\`\`

适用：读多写少、冲突稀少。优点：无锁等待、无死锁。缺点：冲突时需重试，高冲突场景性能差。

### 8.3 对比

| 维度 | 悲观锁 | 乐观锁 |
|------|--------|--------|
| 冲突假设 | 频繁 | 稀少 |
| 加锁时机 | 操作前 | 提交时 |
| 死锁风险 | 有 | 无 |
| 重试开销 | 无 | 有 |
| 适用场景 | 写多冲突多 | 读多写少 |

---

## 九、分布式事务

单机事务由数据库 ACID 保证，但跨库/跨服务时，需要分布式事务方案。

### 9.1 两阶段提交（2PC）

协调者 + 多个参与者：

\`\`\`
阶段一（Prepare）:
  协调者 → 各参与者: "准备提交"
  参与者执行操作、写 redo/undo、回复 yes/no

阶段二（Commit/Rollback）:
  若全部 yes → 协调者发 commit
  若有 no → 协调者发 rollback
\`\`\`

缺点：协调者单点、参与者阻塞、不一致风险。XA 协议是 2PC 的工业实现。

### 9.2 TCC（Try-Confirm-Cancel）

业务层面的两阶段：

- **Try**：预留资源（如冻结余额）
- **Confirm**：真正扣减
- **Cancel**：解冻回滚

\`\`\`
Try:   冻结账户A 100元（可用余额-100，冻结+100）
Confirm: 冻结-100，账户B +100
Cancel:  冻结-100，可用+100
\`\`\`

侵入性强但灵活，互联网公司常用。

### 9.3 Saga

把长事务拆成一系列短事务，每个短事务有对应的补偿操作：

\`\`\`
T1(扣库存) → T2(创订单) → T3(扣款)
若 T3 失败: C3(退款) → C2(删订单) → C1(回库存)
\`\`\`

最终一致性，无锁等待，适合长流程。

### 9.4 本地消息表

\`\`\`
服务A:
  1. 本地事务: 业务操作 + 写消息表
  2. 提交后异步发 MQ
服务B:
  3. 消费 MQ，幂等处理
\`\`\`

利用本地事务保证"业务+消息"原子性，MQ 保证最终送达。简单可靠，应用最广。

### 9.5 方案选型

| 方案 | 一致性 | 性能 | 侵入性 | 适用 |
|------|--------|------|--------|------|
| 2PC/XA | 强 | 差 | 低 | 传统金融 |
| TCC | 强 | 中 | 高 | 互联网核心 |
| Saga | 最终 | 高 | 中 | 长流程 |
| 本地消息表 | 最终 | 高 | 中 | 异步解耦 |

---

## 十、多语言对照

### 10.1 事务使用

\`\`\`java
// Java Spring @Transactional
@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
public void transfer(Long from, Long to, BigDecimal amount) {
    accountDao.debit(from, amount);
    accountDao.credit(to, amount);
}
\`\`\`

\`\`\`go
// Go sqlx + context
func Transfer(ctx context.Context, db *sqlx.DB, from, to int64, amount int) error {
    tx, err := db.BeginTxx(ctx, nil)
    // ... Exec
    return tx.Commit()
}
\`\`\`

\`\`\`python
# Python Django
from django.db import transaction
with transaction.atomic():
    a.balance -= amount
    a.save()
    b.balance += amount
    b.save()
\`\`\`

### 10.2 隔离级别设置

\`\`\`sql
-- 通用
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET GLOBAL TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- PostgreSQL
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Oracle (只有 RC/Serializable/RO)
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
\`\`\`

---

## 十一、最佳实践与陷阱

### 11.1 事务设计原则

1. **短小**：事务越短，锁持有时间越短，并发越好
2. **避免长事务**：会阻塞 undo log 清理、占用连接、增加死锁概率
3. **避免事务中调用外部接口**：网络不可控，易致长事务
4. **批量操作分批提交**：避免单事务过大
5. **明确提交/回滚**：不要依赖连接关闭时的隐式行为

### 11.2 常见陷阱

**陷阱1：在事务中调用 RPC**
\`\`\`java
@Transactional
public void placeOrder(...) {
    saveOrder();
    httpClient.notifyWarehouse();  // 网络慢 → 事务长持有锁
    deductStock();
}
\`\`\`
改为：本地事务只做 DB 操作，通知异步化。

**陷阱2：事务方法自调用**
\`\`\`java
@Service
class OrderService {
    @Transactional
    public void a() { ... }

    public void b() { a(); }  // a 的事务不生效！（Spring AOP 限制）
}
\`\`\`

**陷阱3：长事务导致 undo 膨胀**
\`\`\`
BEGIN;
-- 执行大量查询（耗时 10 分钟）
UPDATE ...;
COMMIT;
\`\`\`
期间所有被修改行的 undo log 都不能 purge，表空间暴涨。

### 11.3 监控指标

- \`innodb_trx\`：当前活跃事务数、运行时间
- \`innodb_lock_waits\`：锁等待情况
- \`Com_commit / Com_rollback\`：提交/回滚次数
- \`Threads_connected\`：连接数（长事务占用连接）

---

## 十二、面试高频题

**Q1：RR 级别如何解决幻读？**
快照读用 MVCC（Read View 整个事务复用）；当前读用间隙锁/临键锁阻止其他事务插入。但完全解决需要全程使用当前读或加锁，混合使用仍有幻读可能。

**Q2：MVCC 为什么不能完全代替锁？**
MVCC 只解决"读-写"冲突，让读不加锁。"写-写"冲突仍必须用锁串行化。MVCC 是无锁读，不是无锁写。

**Q3：RC 与 RR 怎么选？**
互联网业务多用 RC：并发好、死锁少、间隙锁开销小。金融等强一致场景用 RR。MySQL 默认 RR 是历史原因，许多大厂改成 RC。

**Q4：乐观锁的 ABA 问题？**
纯 version 字段无法识别"A→B→A"。加 version 解决，但若业务关心"中间是否变过"，需要额外字段（如修改时间戳）。

**Q5：分布式事务为什么难？**
网络不可靠（消息丢失/延迟）、节点可能宕机、时钟不同步，CAP 决定了强一致与可用性无法兼得。

---

## 十三、InnoDB 事务实现源码级剖析

### 13.1 事务对象与 trx_t

InnoDB 内部用 \`trx_t\` 结构体表示一个事务，关键字段包括：

\`\`\`c
struct trx_t {
    trx_id_t      id;           // 事务 ID
    trx_state_t   state;        // TRX_STATE_ACTIVE / COMMITTED / ROLLING_BACK
    ulint         isolation;    // 隔离级别
    ReadView*     read_view;    // MVCC 快照
    undo_alloc_t  undo;         // undo log 信息
    lock_t*       lock;         // 持有的锁链表
    time_t        start_time;   // 开始时间
    // ...
};
\`\`\`

每个连接对应一个 \`trx_t\`，在执行第一条 SQL 时惰性创建。

### 13.2 undo log 的物理结构

undo log 存放在 undo tablespace（独立表空间）中，以 rollback segment → undo log segment → undo log record 的层级组织：

\`\`\`
undo tablespace
  └── rollback segment (128 个)
        └── undo log segment
              └── undo log record (INSERT / UPDATE / DELETE 各有格式)
\`\`\`

- INSERT undo log：事务提交后即可删除（不需要 MVCC）
- UPDATE undo log：需要等 MVCC 不再需要时才能 purge

### 13.3 redo log 的物理结构

redo log 是环形写入的固定大小文件组：

\`\`\`
ib_logfile0  ib_logfile1  (循环写入)
  [......已写入......|......待写入......]
        ↑                    ↑
     write pos            check point

write pos 追着 check point 跑，追上时需等待刷盘推进 check point
\`\`\`

### 13.4 两阶段提交（2PC）详细流程

InnoDB 的 redo log 与 MySQL Server 的 binlog 通过两阶段提交保证一致性：

\`\`\`
T1: 写 redo log (prepare 状态)
T2: 写 binlog 到文件系统 cache
T3: fsync binlog 到磁盘
T4: 写 redo log (commit 状态)

崩溃恢复规则：
  - redo log 有 prepare 但无 commit：
    - 检查对应 binlog 是否完整
    - 完整 → 提交（binlog 已可能被从库消费）
    - 不完整 → 回滚
\`\`\`

### 13.5 ReadView 的创建时机再辨析

\`\`\`
RC 级别：
  每次一致性读（快照读）都创建新的 ReadView
  → 能看到在此之前提交的所有事务的修改

RR 级别：
  事务中第一条一致性读时创建 ReadView，后续复用
  → 整个事务看到一致的快照

注意：当前读（UPDATE/DELETE/SELECT FOR UPDATE）不使用 ReadView
      它们读最新数据并加锁
\`\`\`

### 13.6 purge 线程与 undo 清理

\`\`\`
purge 线程负责：
  1. 清理已提交事务的 INSERT undo log
  2. 清理不再被任何 ReadView 需要的 UPDATE undo log

purge 滞后的危害：
  - undo 表空间膨胀
  - 历史 version 链变长 → MVCC 读变慢
  - ibdata1 膨胀（共享表空间模式下）

长事务是 purge 滞后的主要原因
\`\`\`

---

## 十四、锁等待与超时机制

### 14.1 innodb_lock_wait_timeout

\`\`\`sql
-- 设置行锁等待超时（默认 50 秒）
SET innodb_lock_wait_timeout = 10;

-- 超过 10 秒还未获取到锁，报错：
-- ERROR 1205 (HY000): Lock wait timeout exceeded
\`\`\`

该参数只对**行锁**等待生效，表锁等待由 \`lock_wait_timeout\` 控制。

### 14.2 死锁检测 innodb_deadlock_detect

\`\`\`sql
-- MySQL 8.0+ 默认开启
SET GLOBAL innodb_deadlock_detect = ON;

-- 检测到死锁后，InnoDB 回滚 undo 量较少的事务
-- 报错：ERROR 1213 (40001): Deadlock found
\`\`\`

高并发场景下，死锁检测本身有 CPU 开销。如果确认业务不会死锁，可关闭检测并依赖超时机制。

### 14.3 锁等待分析

\`\`\`sql
-- 查看当前锁等待
SELECT * FROM information_schema.innodb_lock_waits;

-- MySQL 8.0 performance_schema
SELECT * FROM performance_schema.data_lock_waits;
SELECT * FROM performance_schema.data_locks;

-- 查看正在运行的事务
SELECT trx_id, trx_state, trx_started, trx_mysql_thread_id
FROM information_schema.innodb_trx;
\`\`\`

### 14.4 锁等待案例

\`\`\`
场景：订单系统，事务 A 更新订单状态，事务 B 也想更新同一订单

T1  事务A: UPDATE orders SET status='paid' WHERE id=100; -- 持有 X 锁
T2  事务B: UPDATE orders SET status='shipped' WHERE id=100; -- 等待
T3  事务A: 执行耗时操作（如调用外部接口）... -- 迟迟不提交
T4  事务B: 等待 50 秒后超时 → ERROR 1205

解决方案：
  1. 缩短事务 A 的执行时间
  2. 降低 innodb_lock_wait_timeout
  3. 优化 SQL 让锁只锁定必要行
\`\`\`

---

## 十五、MVCC 完整示例推演

### 15.1 初始状态

\`\`\`
表 t(id=1, value=100)
当前 trx_id = 100, value=100, committed

活跃事务列表：无
\`\`\`

### 15.2 事务 A（RR）开始

\`\`\`
T1: 事务 A (trx_id=200) 开始，创建 ReadView
    ReadView: { m_ids: [], min_trx_id: 200, max_trx_id: 200, creator: 200 }
    → 当前无活跃事务

T2: 事务 A 执行 SELECT * FROM t WHERE id=1
    版本链: [v1(trx_id=100, committed)]
    100 < 200 (max_trx_id) 且 100 不在 m_ids → 可见
    读到 value=100
\`\`\`

### 15.3 事务 B 修改并提交

\`\`\`
T3: 事务 B (trx_id=300) 开始
T4: 事务 B 执行 UPDATE t SET value=200 WHERE id=1
    → 写 undo log: (trx_id=100, value=100)
    → 当前行: trx_id=300, value=200 (未提交)

T5: 事务 B COMMIT
    → 当前行: trx_id=300, value=200 (committed)
\`\`\`

### 15.4 事务 A 再次读取（RR）

\`\`\`
T6: 事务 A 再次 SELECT * FROM t WHERE id=1
    使用同一个 ReadView: { m_ids: [], min_trx_id: 200, max_trx_id: 200, creator: 200 }
    版本链: [v1(trx_id=100), v2(trx_id=300)]
    
    检查 v2(trx_id=300):
      300 >= 200 (max_trx_id) → 不可见
    
    检查 v1(trx_id=100):
      100 < 200 → 可见
    
    读到 value=100（可重复读！）
\`\`\`

### 15.5 同场景在 RC 级别

\`\`\`
T6': 事务 A 再次 SELECT
     创建新 ReadView: { m_ids: [], min_trx_id: 400, max_trx_id: 400, creator: 200 }
     
     检查 v2(trx_id=300):
       300 < 400 且 300 不在 m_ids → 可见
     
     读到 value=200（不可重复读！）
\`\`\`

### 15.6 事务 C 修改未提交时事务 A 读取

\`\`\`
T7: 事务 C (trx_id=400) 执行 UPDATE t SET value=300 WHERE id=1
    版本链: [v1(100), v2(300), v3(400, 未提交)]

T8: 事务 A (RR) 读取
    ReadView: { m_ids: [400], min_trx_id: 400, max_trx_id: 500, creator: 200 }
    
    检查 v3(trx_id=400):
      400 在 m_ids → 不可见
    
    检查 v2(trx_id=300):
      300 < 400 → 可见
    
    读到 value=200（跳过未提交版本）
\`\`\`

---

## 十六、事务性能调优

### 16.1 减少锁持有时间

\`\`\`java
// 差：事务内包含远程调用
@Transactional
public void process(Order order) {
    saveOrder(order);              // DB 操作，获取锁
    callPaymentService(order);     // 远程调用，耗时 500ms
    updateInventory(order);        // DB 操作
    notifyLogistics(order);        // 远程调用，耗时 300ms
}
// 锁持有时间 = 800ms+，高并发下大量锁等待

// 好：拆分事务，远程调用移到事务外
@Transactional
public void process(Order order) {
    saveOrder(order);
    updateInventory(order);
}
// 锁持有时间 = 10ms，远程调用在事务外异步执行
\`\`\`

### 16.2 控制事务大小

\`\`\`
差：一个事务处理 10000 条订单
  → 长时间持有锁、大量 undo log、binlog 暴涨

好：每 100 条订单一个事务
  → 锁持有时间短、undo 可及时清理、失败回滚代价小
\`\`\`

### 16.3 合理使用只读事务

\`\`\`sql
-- 只读事务不分配 trx_id，减少开销
SET TRANSACTION READ ONLY;
SELECT ...;
\`\`\`

\`\`\`java
// Spring
@Transactional(readOnly = true)
public Order getOrder(Long id) {
    return orderDao.findById(id);
}
\`\`\`

### 16.4 事务隔离级别调优

\`\`\`
互联网业务（读多写少）：
  隔离级别: READ COMMITTED
  优势: 无间隙锁开销、死锁概率低、并发好

金融核心（写多强一致）：
  隔离级别: REPEATABLE READ
  优势: 可重复读、间隙锁防幻读

注意: MySQL 默认 RR，许多大厂改为 RC
\`\`\`

### 16.5 连接池与事务

\`\`\`
事务持有数据库连接 → 事务越长，连接占用越久

HikariCP 配置建议：
  maximumPoolSize = (CPU 核数 * 2 + 磁盘数)
  connectionTimeout = 30s
  maxLifetime = 30min
  
长事务会导致连接池耗尽 → 接口超时
\`\`\`

---

## 十七、不同数据库的事务实现对比

### 17.1 InnoDB vs PostgreSQL

| 维度 | InnoDB | PostgreSQL |
|------|--------|------------|
| 默认隔离级别 | RR | RC |
| MVCC 实现 | undo log 版本链 | 多版本元组（旧版本留在表中，VACUUM 清理） |
| 间隙锁 | 有 | 无 |
| 死锁检测 | 自动 | 自动 |
| 事务 ID | 递增 | 递增 |

PostgreSQL 的 MVCC 实现不同：UPDATE 实际上是 INSERT 新版本 + 标记旧版本为 dead，需要 VACUUM 清理。

### 17.2 InnoDB vs Oracle

| 维度 | InnoDB | Oracle |
|------|--------|--------|
| 默认隔离级别 | RR | RC |
| Undo 管理 | undo tablespace | undo tablespace |
| Redo | ib_logfile | redo log |
| 多版本 | undo chain | undo chain |
| 闪回查询 | 无原生支持 | Flashback Query |

### 17.3 InnoDB vs SQL Server

| 维度 | InnoDB | SQL Server |
|------|--------|------------|
| 默认隔离级别 | RR | RC (Read Committed Snapshot) |
| MVCC | 基于 undo | 基于行版本（tempdb） |
| 乐观并发 | 无 | RCSI / SNAPSHOT ISOLATION |

SQL Server 的 SNAPSHOT ISOLATION 类似 RR，但需要在 tempdb 中存储版本。

---

## 十八、真实案例分析

### 18.1 案例：电商扣库存死锁

\`\`\`
表: products(id, stock, version)
索引: PRIMARY(id)

事务 A: UPDATE products SET stock=stock-1 WHERE id=1;
事务 B: UPDATE products SET stock=stock-1 WHERE id=2;
事务 A: UPDATE products SET stock=stock-1 WHERE id=2; -- 等待 B
事务 B: UPDATE products SET stock=stock-1 WHERE id=1; -- 等待 A → 死锁

解决: 统一按 id 升序加锁
  事务 A: 先更新 id=1，再更新 id=2
  事务 B: 先更新 id=1，再更新 id=2
\`\`\`

### 18.2 案例：长事务导致表空间膨胀

\`\`\`
现象: ibdata1 从 10G 涨到 200G
排查: SELECT * FROM information_schema.innodb_trx WHERE TIME_TO_SEC(TIMEDIFF(NOW(), trx_started)) > 60
发现: 一个报表事务运行了 3 小时未提交
影响: undo log 无法 purge，大量历史版本堆积
解决: 杀掉长事务，添加事务超时监控
\`\`\`

### 18.3 案例：RC 改 RR 后死锁激增

\`\`\`
现象: 将隔离级别从 RC 改为 RR 后，死锁频率从 0.01% 涨到 0.5%
原因: RR 引入间隙锁，范围查询锁住间隙，并发插入冲突增多
解决: 
  1. 缩小事务范围
  2. 避免范围 FOR UPDATE
  3. 或保持 RC，业务层处理幻读
\`\`\`

### 18.4 案例：乐观锁重试风暴

\`\`\`
现象: 秒杀场景下乐观锁重试率 > 90%，TPS 极低
原因: 大量请求同时读 version，同时写失败重试，形成重试风暴
解决: 
  1. 改用悲观锁（SELECT FOR UPDATE）
  2. 或引入分布式锁（Redis）前置过滤
  3. 或排队 + 异步处理
\`\`\`

---

## 十九、更多面试题精选

**Q6：InnoDB 的 RR 真的完全解决幻读吗？**
不完全。快照读用 MVCC 解决了，但当前读和快照读混用仍可能幻读：
\`\`\`sql
BEGIN;
SELECT * FROM t WHERE id > 10;          -- 快照读，假设 5 行
INSERT INTO t SELECT * FROM t WHERE id > 10;  -- 当前读，可能读到 6 行（幻读）
COMMIT;
\`\`\`

**Q7：为什么 MySQL 选 RR 作为默认而不是 RC？**
历史原因：早期 MySQL binlog 只有 statement 格式，RC 下主从复制会有不一致问题。RR 配合 statement binlog 能保证主从一致。现在 row 格式 binlog 下 RC 也没问题，所以很多公司改用 RC。

**Q8：undo log 和 redo log 能合并吗？**
理论上 ARIES 协议用单一日志记录 undo + redo 信息。但 InnoDB 分开是因为：undo log 用于回滚和 MVCC，生命周期长；redo log 用于崩溃恢复，可循环覆盖。职责不同，分开更高效。

**Q9：事务 ID 为什么会耗尽？**
InnoDB 的 trx_id 是 6 字节无符号整数（最大 ~2.8×10^14）。长年运行且读写频繁的系统理论上可能耗尽，但实际几乎不会。如果真的接近耗尽，InnoDB 会做 trx_id 重置。

**Q10：分布式事务为什么选择最终一致性更多？**
强一致分布式事务（2PC/XA）性能差、可用性低、实现复杂。互联网业务对短暂不一致容忍度高，最终一致性（Saga/本地消息表）更实用。金融核心仍用强一致。

---

## 二十、事务监控运维清单

### 20.1 关键监控指标

| 指标 | 查询方式 | 告警阈值 |
|------|---------|---------|
| 活跃事务数 | innodb_trx COUNT | > 100 |
| 长事务 | trx_started > 60s | > 60 秒 |
| 锁等待 | innodb_lock_waits | > 10 |
| 死锁次数 | SHOW STATUS LIKE 'Innodb_deadlocks' | > 10/分钟 |
| undo 大小 | innodb_metrics | 持续增长 |
| 回滚率 | Com_rollback / (Com_commit+Com_rollback) | > 5% |

### 20.2 运维脚本示例

\`\`\`sql
-- 查找运行超过 60 秒的事务
SELECT 
    trx_id,
    trx_state,
    trx_started,
    TIMESTAMPDIFF(SECOND, trx_started, NOW()) AS duration_sec,
    trx_query
FROM information_schema.innodb_trx
WHERE TIMESTAMPDIFF(SECOND, trx_started, NOW()) > 60
ORDER BY duration_sec DESC;

-- 查找锁等待链
SELECT 
    r.trx_id AS waiting_trx,
    r.trx_mysql_thread_id AS waiting_thread,
    b.trx_id AS blocking_trx,
    b.trx_mysql_thread_id AS blocking_thread,
    TIMESTAMPDIFF(SECOND, r.trx_wait_started, NOW()) AS wait_sec
FROM information_schema.innodb_lock_waits w
JOIN information_schema.innodb_trx b ON b.trx_id = w.blocking_trx_id
JOIN information_schema.innodb_trx r ON r.trx_id = w.requesting_trx_id;
\`\`\`

### 20.3 事务规范建议

1. 事务最大执行时间 < 5 秒
2. 单事务 SQL 数 < 20
3. 禁止事务内 RPC 调用
4. 禁止事务内用户交互等待
5. 批量操作分批提交
6. 只读查询不加事务（或标记只读）
7. 明确 commit/rollback，不依赖连接关闭

---

## 二十一、MVCC 深度剖析：ReadView 与版本可见性

**多版本并发控制（MVCC，Multi-Version Concurrency Control）** 是 InnoDB 实现 RC/RR 隔离级别的核心机制，让读操作不加锁也能保持一致性视图，极大提升并发读性能。

### 21.1 版本链（Undo Log Version Chain）

每行数据除了最新值，还有两个隐藏列：

- **trx_id**：最后修改该行的事务 ID。
- **roll_pointer**：指向 undo log 中该行的上一版本。

每次 UPDATE/DELETE 旧行被写入 undo log，新行的 roll_pointer 指向 undo log 中的旧版本。多次修改形成一条版本链：

\`\`\`
最新行(trx_id=200) → undo: 旧版本(trx_id=150) → undo: 更旧版本(trx_id=100) → ...
\`\`\`

### 21.2 ReadView 结构

事务在 RC/RR 下执行**快照读**（普通 SELECT）时生成 ReadView，包含：

- **m_ids**：生成 ReadView 时当前活跃（未提交）事务 ID 列表。
- **min_trx_id**：m_ids 中最小值。
- **max_trx_id**：下一个将分配的事务 ID（系统全局递增计数器）。
- **creator_trx_id**：创建该 ReadView 的事务 ID。

### 21.3 可见性判断算法

对版本链上某一版本（其 trx_id 记为 T）：

1. **T == creator_trx_id**：自己修改的，可见。
2. **T < min_trx_id**：修改在 ReadView 之前已提交，可见。
3. **T >= max_trx_id**：修改在 ReadView 之后才开始，不可见。
4. **min_trx_id <= T < max_trx_id**：查 T 是否在 m_ids 中。在则不可见（该事务活跃未提交）；不在则可见（已提交）。

不可见时，沿 roll_pointer 找上一版本，重复判断，直到可见或链尾（链尾返回 NULL）。

### 21.4 RC 与 RR 的 ReadView 差异

- **RC（读已提交）**：每次快照读都生成新 ReadView，因此能看到此后提交的事务——不可重复读。
- **RR（可重复读）**：事务内第一次快照读生成 ReadView 并复用，因此看不到后续提交——可重复读。

\`\`\`
事务 A (RR):                事务 B:
BEGIN;                       BEGIN;
SELECT * FROM t;  -- RV1
                             UPDATE t SET x=2; COMMIT;
SELECT * FROM t;  -- 仍 RV1，看不到 B 的修改
\`\`\`

### 21.5 当前读 vs 快照读

- **快照读**：普通 SELECT，走 MVCC 读历史版本。
- **当前读**：\`SELECT ... FOR UPDATE\`、\`SELECT ... LOCK IN SHARE MODE\`、UPDATE/DELETE/INSERT，读最新版本并加锁。

RR 下当前读可能读到快照读看不到的行——这就是幻读的来源。InnoDB 用 **Next-Key Lock**（行锁 + 间隙锁）在当前读时锁住范围，防止其他事务在间隙插入，从而消除幻读。

## 二十二、InnoDB 锁的内存结构

### 22.1 锁不是每行一个对象

若每行加一把锁，100 万行加锁需 100 万个对象，内存爆炸。InnoDB 把**同一页内、同一事务、同一模式（S/X）的锁**合并为一个 \`lock_rec_t\` 结构，内部用**位图**记录哪些行被锁（bit 位对应页内 slot）。

\`\`\`
lock_rec_t {
  space, page_no,       // 锁在哪个页
  n_bits,                // 位图位数
  heap_no→bit map        // 哪些行被锁
}
\`\`\`

这样一页内 100 行加锁只需一个 lock_rec_t，极大节省内存。

### 22.2 锁的类型

- **记录锁（Record Lock）**：锁单行。
- **间隙锁（Gap Lock）**：锁两行之间的间隙，防止插入。仅 RR 生效。
- **Next-Key Lock**：记录锁 + 前面的间隙锁，左开右闭 \`(a, b]\`。
- **插入意向锁（Insert Intention Lock）**：INSERT 前申请，与间隙锁冲突但相互间不冲突。

### 22.3 锁的兼容矩阵

| 请求\持有 | GAP | Insert Intention | Record S | Record X |
|----------|-----|------------------|----------|----------|
| GAP      | 兼容 | 兼容              | 兼容     | 兼容     |
| Insert Intention | 冲突 | 兼容        | 兼容     | 兼容     |
| Record S | 兼容 | 兼容              | 兼容     | 冲突     |
| Record X | 兼容 | 兼容              | 冲突     | 冲突     |

注意：间隙锁之间互不冲突（多个事务可同时持间隙锁），但间隙锁阻塞插入意向锁。

## 二十三、死锁检测与预防

### 23.1 死锁产生条件

经典四条件：互斥、持有并等待、不可剥夺、循环等待。数据库中常见场景：两个事务以相反顺序锁多行。

\`\`\`
事务A: UPDATE t SET .. WHERE id=1;  -- 锁 id=1
事务B: UPDATE t SET .. WHERE id=2;  -- 锁 id=2
事务A: UPDATE t SET .. WHERE id=2;  -- 等 B 释放 id=2
事务B: UPDATE t SET .. WHERE id=1;  -- 等 A 释放 id=1  ← 死锁
\`\`\`

### 23.2 InnoDB 死锁检测

\`innodb_deadlock_detect=ON\`（默认）时，事务等待锁会触发检测：构建等待图，发现环则回滚回滚成本最低的事务（victim）。检测复杂度 O(n²)，高并发下成为瓶颈，可关检测改用超时 \`innodb_lock_wait_timeout\`。

### 23.3 死锁预防

1. **统一加锁顺序**：多表/多行操作按固定顺序。
2. **缩短事务**：快速提交减少锁持有时间。
3. **降低隔离级别**：RC 无间隙锁，死锁概率低。
4. **大事务拆小**：批量操作分批。
5. **按主键访问**：避免二级索引回表产生额外锁。

## 二十四、Redo Log 与 Binlog 的两阶段提交

### 24.1 两种日志的职责

- **redo log（重做日志）**：InnoDB 引擎层，物理日志（页号 + 偏移 + 变更），保证崩溃恢复时已提交事务不丢。循环写，覆盖旧内容。
- **binlog（二进制日志）**：Server 层，逻辑日志（SQL 语句或行变更），用于主从复制与时间点恢复。追加写，不覆盖。

### 24.2 两阶段提交（2PC）

为保证 redo log 与 binlog 一致，MySQL 采用内部 2PC：

\`\`\`
1. InnoDB 写 redo log（prepare 状态）
2. Server 写 binlog
3. InnoDB 写 redo log（commit 状态）
\`\`\`

崩溃恢复时：

- redo log 有 prepare 但无 commit：查 binlog 是否完整。
  - binlog 完整：提交事务（认为已写完 binlog，commit 丢失）。
  - binlog 不完整：回滚事务。

### 24.3 为什么不用一阶段

若先写 redo log 后崩溃，binlog 未写，从库按 binlog 同步会丢该事务，主从不一致。若先写 binlog 后崩溃，redo 未写，主库回滚但从库执行了——不一致。两阶段提交 + 崩溃恢复规则保证两边一致。

## 二十五、分布式事务详解

### 25.1 2PC（两阶段提交）

协调者（Coordinator）+ 多个参与者（Participant）：

- **阶段一 prepare**：协调者发 prepare，参与者执行不提交，写 undo/redo，回复 yes/no。
- **阶段二 commit/abort**：全 yes 则 commit，任一 no 则 abort。

**问题**：协调者单点故障、同步阻塞、参与者超时不确定。XA 协议即 2PC 的标准实现。

### 25.2 3PC

引入 CanCommit + PreCommit + DoCommit 三阶段，加超时机制减少阻塞。但仍有一致性风险，且更复杂，实际少用。

### 25.3 TCC（Try-Confirm-Cancel）

业务层补偿事务：

- **Try**：预留资源（如冻结库存）。
- **Confirm**：确认执行（扣减库存）。
- **Cancel**：取消（解冻）。

每个分支需实现三个方法，侵入性强但性能好、最终一致。适合金融场景。

### 25.4 Saga

长事务拆成多个本地事务 T1..Tn，每个配补偿 C1..Cn。失败时反向执行已完成事务的补偿。无锁，适合长流程，但补偿逻辑复杂、不隔离（中间状态可见）。

### 25.5 本地消息表

主流最终一致方案：

1. 本地事务执行 + 写消息表（同一事务，原子）。
2. 后台轮询消息表，发 MQ。
3. 消费方执行业务 + ACK。
4. 失败重试，幂等消费。

**最大努力通知**：发方尽最大努力通知（如发短信），不强求一致，用于对一致性要求低的场景。

### 25.6 多语言对照

| 方案 | Java | Go | Python | Node.js |
|------|------|----|--------|---------|
| XA/2PC | Atomikos/Narayana | dtm | zaqar | node-xa |
| TCC | Hmily/Seata-TCC | dtm | - | - |
| Saga | Seata-Saga | dtm | - | - |
| 本地消息表 | RocketMQ事务消息 | 自实现 | 自实现 | 自实现 |

**Seata**（阿里开源）是 Java 生态最流行的分布式事务框架，支持 AT（自动生成补偿）/TCC/Saga/XA 四种模式。

## 二十六、Spring 事务管理

### 26.1 声明式事务

\`\`\`java
@Service
public class OrderService {
    @Transactional(rollbackFor = Exception.class,
                    isolation = Isolation.REPEATABLE_READ,
                    propagation = Propagation.REQUIRED,
                    timeout = 5,
                    readOnly = false)
    public void createOrder(Order order) {
        orderRepo.insert(order);
        stockRepo.decrease(order.getProductId());
    }
}
\`\`\`

### 26.2 七种传播行为

| 传播行为 | 含义 |
|---------|------|
| REQUIRED（默认） | 有事务加入，无则新建 |
| REQUIRES_NEW | 总新建，挂起当前事务 |
| NESTED | 嵌套事务（savepoint） |
| SUPPORTS | 有事务加入，无则非事务 |
| NOT_SUPPORTED | 非事务执行，挂起当前 |
| MANDATORY | 必须在事务中，否则异常 |
| NEVER | 必须非事务，否则异常 |

### 26.3 常见坑

1. **自调用失效**：同类内方法 A 调 B，B 的 \`@Transactional\` 不生效（代理绕过）。解法：拆到另一类或注入自身代理。
2. **rollbackFor 默认只回滚 RuntimeException**：受检异常不回滚，需 \`rollbackFor=Exception.class\`。
3. **try-catch 吞异常**：catch 住异常不抛，事务不回滚。
4. **final/static 方法**：代理无法重写，事务失效。
5. **数据库引擎不支持**：MyISAM 无事务。

## 二十七、事务最佳实践与生产坑

1. **事务尽量短小**：长事务持锁久、undo log 膨胀、MVCC 版本链变长影响查询。
2. **避免事务内远程调用**：RPC 超时导致事务长时间挂起。改用本地消息表异步。
3. **批量操作分批提交**：一次 10 万行 UPDATE 锁表，分批每批 1000 行。
4. **只读事务标记 \`@Transactional(readOnly=true)\`**：优化器可做只读优化，且语义清晰。
5. **大事务监控**：\`information_schema.innodb_trx\` 查活跃事务及其执行时间，超阈值告警。
6. **避免热点行**：多事务争抢同一行致锁等待。可用乐观锁（version 字段）或队列串行化。
7. **幂等设计**：重试场景下，业务接口必须幂等（唯一键、状态机、token），否则重复扣款。

---

## 本章小结

事务是数据库区别于文件系统的核心特征，是构建可靠应用的基础。本章系统讲解了：

- ACID 四特性及其底层实现（undo log、redo log、锁、MVCC）
- 三种并发异常（脏读、不可重复读、幻读）的本质
- 四种隔离级别的取舍与 InnoDB 的特殊实现
- InnoDB 丰富的锁体系（记录锁、间隙锁、临键锁、意向锁）
- MVCC 版本链与 Read View 可见性算法
- 乐观锁/悲观锁的应用层选择
- 分布式事务的四种主流方案
- 工程实践中的陷阱与监控

掌握事务，是从"会写 SQL"到"能设计高可靠数据系统"的关键跃迁。下一章我们将进入 SQL 调优领域，学习如何让事务里的 SQL 跑得更快。
`,
    code: `
// ============================================================
// 第三章演示：事务隔离级别与 MVCC 模拟
// 在内存中模拟 InnoDB 的 MVCC 版本链 + Read View 可见性
// ============================================================

let nextTrxId = 1;

// 简化的 MVCC 存储引擎：每行维护版本链
class MVCCStore {
  constructor() {
    // key -> 版本链数组（每个元素 { trxId, value, committed }）
    this.rows = new Map();
  }

  // 写入/更新一行（当前事务视角）
  write(key, value, trxId) {
    if (!this.rows.has(key)) this.rows.set(key, []);
    const chain = this.rows.get(key);
    chain.push({ trxId, value, committed: false });
  }

  // 提交某事务的所有修改：标记版本为 committed
  commit(trxId) {
    for (const chain of this.rows.values()) {
      for (const v of chain) {
        if (v.trxId === trxId) v.committed = true;
      }
    }
  }

  // 回滚：删除某事务的所有未提交版本
  rollback(trxId) {
    for (const chain of this.rows.values()) {
      for (let i = chain.length - 1; i >= 0; i--) {
        if (chain[i].trxId === trxId && !chain[i].committed) {
          chain.splice(i, 1);
        }
      }
    }
  }

  // 根据 Read View 读取可见版本
  // RC: 每次读都生成新 view（看到最新已提交）
  // RR: 复用事务开始时的 view（看不到之后提交的）
  read(key, view) {
    const chain = this.rows.get(key);
    if (!chain || chain.length === 0) return undefined;
    // 从最新版本向前查找可见版本
    for (let i = chain.length - 1; i >= 0; i--) {
      const v = chain[i];
      if (this._visible(v, view)) return v.value;
    }
    return undefined;
  }

  _visible(v, view) {
    // 自己改的可见
    if (v.trxId === view.creatorTrxId) return true;
    // 未提交不可见
    if (!v.committed) return false;
    // 在 view 生成之后提交的不可见
    if (v.commitOrder > view.snapshotOrder) return false;
    return true;
  }
}

// 事务管理器
class TransactionManager {
  constructor(store) {
    this.store = store;
    this.commitCounter = 0;  // 全局提交顺序计数
    this.activeTrx = new Map();  // trxId -> { snapshotOrder }
  }

  begin(isolationLevel = 'RR') {
    const trxId = nextTrxId++;
    // RR: snapshot 在 begin 时固定；RC: 每次读重新生成
    const snapshotOrder = isolationLevel === 'RR' ? this.commitCounter : -1;
    this.activeTrx.set(trxId, { isolationLevel, snapshotOrder });
    return trxId;
  }

  // 生成 Read View
  _getView(trxId) {
    const trx = this.activeTrx.get(trxId);
    const snapshotOrder = trx.isolationLevel === 'RR'
      ? trx.snapshotOrder
      : this.commitCounter;  // RC: 实时
    return { creatorTrxId: trxId, snapshotOrder };
  }

  read(trxId, key) {
    return this.store.read(key, this._getView(trxId));
  }

  write(trxId, key, value) {
    this.store.write(key, value, trxId);
  }

  commit(trxId) {
    this.store.commit(trxId);
    this.commitCounter++;
    // 给该事务的所有版本打上 commitOrder
    for (const chain of this.store.rows.values()) {
      for (const v of chain) {
        if (v.trxId === trxId && v.committed) v.commitOrder = this.commitCounter;
      }
    }
    this.activeTrx.delete(trxId);
  }

  rollback(trxId) {
    this.store.rollback(trxId);
    this.activeTrx.delete(trxId);
  }
}

// ============================================================
// 演示 1：脏读（读未提交）
// ============================================================
function demoDirtyRead() {
  console.log('\\n===== 演示 1：脏读模拟 =====');
  const store = new MVCCStore();
  const tm = new TransactionManager(store);
  store.rows.set('balance', [{ trxId: 0, value: 1000, committed: true, commitOrder: 0 }]);

  const a = tm.begin();
  const b = tm.begin();
  tm.write(b, 'balance', 600);  // B 未提交
  console.log('事务 B 写入 balance=600（未提交）');
  console.log('事务 A 读取 balance =', store.rows.get('balance').slice(-1)[0].value, '（脏读：读到未提交值）');
  tm.rollback(b);
  console.log('事务 B 回滚');
  console.log('实际 balance =', tm.read(a, 'balance'), '（A 之前读的 600 是脏数据）');
}

// ============================================================
// 演示 2：RC vs RR 的不可重复读
// ============================================================
function demoNonRepeatableRead() {
  console.log('\\n===== 演示 2：RC vs RR 不可重复读 =====');
  // RC 场景
  const store1 = new MVCCStore();
  const tm1 = new TransactionManager(store1);
  store1.rows.set('x', [{ trxId: 0, value: 10, committed: true, commitOrder: 0 }]);

  const a1 = tm1.begin('RC');
  console.log('[RC] 事务 A 第一次读 x =', tm1.read(a1, 'x'));
  const b1 = tm1.begin('RC');
  tm1.write(b1, 'x', 20);
  tm1.commit(b1);
  console.log('[RC] 事务 B 修改并提交 x=20');
  console.log('[RC] 事务 A 第二次读 x =', tm1.read(a1, 'x'), '（不可重复读！）');

  // RR 场景
  const store2 = new MVCCStore();
  const tm2 = new TransactionManager(store2);
  store2.rows.set('x', [{ trxId: 0, value: 10, committed: true, commitOrder: 0 }]);

  const a2 = tm2.begin('RR');
  console.log('[RR] 事务 A 第一次读 x =', tm2.read(a2, 'x'));
  const b2 = tm2.begin('RR');
  tm2.write(b2, 'x', 20);
  tm2.commit(b2);
  console.log('[RR] 事务 B 修改并提交 x=20');
  console.log('[RR] 事务 A 第二次读 x =', tm2.read(a2, 'x'), '（可重复读：始终看到旧值）');
}

// ============================================================
// 演示 3：原子性与回滚
// ============================================================
function demoAtomicity() {
  console.log('\\n===== 演示 3：原子性（回滚恢复） =====');
  const store = new MVCCStore();
  const tm = new TransactionManager(store);
  store.rows.set('a', [{ trxId: 0, value: 100, committed: true, commitOrder: 0 }]);
  store.rows.set('b', [{ trxId: 0, value: 50, committed: true, commitOrder: 0 }]);

  const tx = tm.begin('RR');
  tm.write(tx, 'a', 60);   // a - 40
  tm.write(tx, 'b', 90);   // b + 40
  console.log('事务内读 a =', tm.read(tx, 'a'), ', b =', tm.read(tx, 'b'));
  console.log('假设第三步失败 → 回滚');
  tm.rollback(tx);
  const reader = tm.begin('RR');
  console.log('回滚后 a =', tm.read(reader, 'a'), ', b =', tm.read(reader, 'b'), '（恢复原值）');
}

// ============================================================
// 演示 4：乐观锁
// ============================================================
function demoOptimisticLock() {
  console.log('\\n===== 演示 4：乐观锁（version 校验） =====');
  const data = { stock: 10, version: 1 };

  function buy(reqVersion, qty) {
    if (data.version !== reqVersion) {
      console.log('  version 不匹配，需重试');
      return false;
    }
    if (data.stock < qty) {
      console.log('  库存不足');
      return false;
    }
    data.stock -= qty;
    data.version += 1;
    console.log('  购买成功，剩余库存', data.stock, '，新 version', data.version);
    return true;
  }

  console.log('初始 stock=10, version=1');
  console.log('用户1 基于 version=1 购买 3:');
  buy(1, 3);
  console.log('用户2 也基于 version=1 购买 3:');
  buy(1, 3);  // 失败，需重新读
  console.log('用户2 重新读取 version=2 后购买 2:');
  buy(2, 2);
}

// ============================================================
// 演示 5：死锁检测
// ============================================================
function demoDeadlock() {
  console.log('\\n===== 演示 5：死锁检测 =====');
  // 简化的等待图：edge (a→b) 表示 a 等待 b 持有的锁
  function hasCycle(graph) {
    const visited = new Set();
    const stack = new Set();
    function dfs(node) {
      visited.add(node); stack.add(node);
      for (const next of (graph[node] || [])) {
        if (!visited.has(next)) {
          if (dfs(next)) return true;
        } else if (stack.has(next)) {
          return true;
        }
      }
      stack.delete(node);
      return false;
    }
    for (const n of Object.keys(graph)) {
      if (!visited.has(n) && dfs(n)) return true;
    }
    return false;
  }

  // 事务A 等B，事务B 等A → 死锁
  const graph1 = { A: ['B'], B: ['A'] };
  console.log('等待图 A→B, B→A：', hasCycle(graph1) ? '检测到死锁，回滚一方' : '无死锁');

  // 事务A 等B，事务B 等C，事务C 等D
  const graph2 = { A: ['B'], B: ['C'], C: ['D'] };
  console.log('等待图 A→B→C→D：', hasCycle(graph2) ? '死锁' : '无死锁（链式等待）');
}

// 执行所有演示
demoDirtyRead();
demoNonRepeatableRead();
demoAtomicity();
demoOptimisticLock();
demoDeadlock();

console.log('\\n===== 演示结束 =====');
`,
  },
  // ==================== 第四章：SQL 调优与执行计划 ====================
  {
    id: 'backend-sql-tuning',
    group: '数据存储',
    icon: '⚡',
    title: 'SQL 调优与执行计划',
    content: `
# SQL 调优与执行计划

## 一、SQL 调优的本质：让数据库用最小代价拿到结果

### 1.1 为什么需要调优

同一条 SQL，写法不同性能可能相差数千倍。一个经典例子：

\`\`\`sql
-- 写法 A：全表扫描 100 万行
SELECT * FROM orders WHERE DATE(create_time) = '2024-01-01';

-- 写法 B：走索引，扫描几百行
SELECT * FROM orders
WHERE create_time >= '2024-01-01' AND create_time < '2024-01-02';
\`\`\`

写法 A 对索引列套了函数，导致索引失效；写法 B 用范围查询，索引可用。两者结果相同，但 A 可能要 2 秒，B 只要 2 毫秒。SQL 调优就是**理解数据库如何执行 SQL，并引导它选择更优的执行路径**。

调优不是"玄学"，而是基于代价的理性分析。理解执行计划，是调优的入口。

### 1.2 调优的目标层次

| 层次 | 目标 | 手段 |
|------|------|------|
| SQL 写法 | 避免明显低效 | 不在索引列套函数、避免 SELECT * |
| 索引设计 | 让查询走索引 | 建立合适索引、覆盖索引 |
| 执行计划 | 选择最优路径 | EXPLAIN 分析、hint 引导 |
| 表结构 | 减少扫描量 | 分表、冗余字段、反范式 |
| 架构 | 减少数据库压力 | 读写分离、缓存、异构索引 |

本章聚焦前三个层次，后两个层次属于架构设计范畴。

### 1.3 多语言对照：调优入口

不同数据库查看执行计划的命令：

\`\`\`sql
-- MySQL
EXPLAIN SELECT ...;
EXPLAIN FORMAT=JSON SELECT ...;  -- 详细版
EXPLAIN ANALYZE SELECT ...;       -- MySQL 8.0 真实执行

-- PostgreSQL
EXPLAIN SELECT ...;
EXPLAIN ANALYZE SELECT ...;       -- 真实执行+统计
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;

-- Oracle
EXPLAIN PLAN FOR SELECT ...;
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY());

-- SQL Server
SET SHOWPLAN_TEXT ON;
SELECT ...;
\`\`\`

---

## 二、查询处理流程

理解 SQL 从输入到结果返回经历了什么，是调优的基础。

### 2.1 整体流程

\`\`\`
客户端
  │  SQL 文本
  ▼
┌─────────────┐
│  解析器      │  词法/语法分析 → AST（抽象语法树）
└──────┬──────┘
       │  AST
       ▼
┌─────────────┐
│  预处理器    │  语义检查：表/列是否存在、权限
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  优化器      │  生成执行计划（基于代价）
└──────┬──────┘
       │  执行计划
       ▼
┌─────────────┐
│  执行器      │  调用存储引擎接口，获取数据
└──────┬──────┘
       │  行数据
       ▼
   结果集返回客户端
\`\`\`

### 2.2 优化器：CBO 与 RBO

**RBO（Rule-Based Optimizer，基于规则）**：按固定规则选择执行计划。如"有索引就用索引"。早期 Oracle 使用，现已淘汰。

**CBO（Cost-Based Optimizer，基于代价）**：估算多种执行计划的代价，选最优。MySQL、PostgreSQL、Oracle 现在都用 CBO。

代价 = IO 代价 + CPU 代价。CBO 依赖**统计信息**估算行数和代价，所以统计信息不准确会导致执行计划走偏。

### 2.3 逻辑优化与物理优化

**逻辑优化**：基于关系代数的等价改写，不改变语义。
- 谓词下推：\`SELECT * FROM A JOIN B ON A.id=B.id WHERE A.x>10\` → 先过滤 A 再 JOIN
- 投影下推：只取需要的列
- 子查询展开：把子查询改写为 JOIN

**物理优化**：选择具体的访问路径和连接算法。
- 表访问：全表扫描 vs 索引扫描 vs 范围扫描
- JOIN 算法：Nested Loop vs Hash Join vs Merge Join

---

## 三、EXPLAIN 执行计划详解

EXPLAIN 是 SQL 调优的核心工具。读懂它的每一列，就读懂了数据库的执行意图。

### 3.1 EXPLAIN 输出列

\`\`\`sql
EXPLAIN SELECT * FROM users WHERE id = 1;
\`\`\`

| 列 | 含义 |
|----|------|
| id | 查询序号，越大越先执行 |
| select_type | 查询类型（SIMPLE/PRIMARY/SUBQUERY/DERIVED） |
| table | 涉及的表 |
| partitions | 分区 |
| type | 访问类型（关键！） |
| possible_keys | 可能用到的索引 |
| key | 实际使用的索引 |
| key_len | 索引使用长度（判断复合索引用了几列） |
| ref | 索引比较来源 |
| rows | 估算扫描行数 |
| filtered | 过滤后剩余比例 |
| Extra | 额外信息（关键！） |

### 3.2 type 列：访问类型

从好到坏排列：

| type | 含义 | 示例 |
|------|------|------|
| system | 表只有一行 | 系统表 |
| const | 主键/唯一索引等值查询 | WHERE id=1 |
| eq_ref | JOIN 时被驱动表用主键/唯一索引 | JOIN ON a.id=b.id |
| ref | 非唯一索引等值查询 | WHERE name='tom' |
| range | 索引范围扫描 | WHERE id BETWEEN 1 AND 10 |
| index | 扫描整个索引 | 只查索引列时 |
| ALL | 全表扫描 | 无索引或索引失效 |

**调优红线**：生产中 \`ALL\`（全表扫描）和 \`index\`（全索引扫描）在大表上通常需要优化。目标至少达到 \`range\` 或 \`ref\`。

### 3.3 Extra 列：额外信息

| Extra | 含义 | 是否需关注 |
|-------|------|-----------|
| Using index | 覆盖索引，不回表 | 好 |
| Using where | 用 WHERE 过滤 | 正常 |
| Using index condition | 索引下推 ICP | 好 |
| Using filesort | 额外排序 | 需优化 |
| Using temporary | 用临时表 | 需优化 |
| Using join buffer | 用 BNL JOIN | 需关注 |
| Impossible WHERE | 条件恒假 | 检查逻辑 |

**重点关注**：\`Using filesort\` 和 \`Using temporary\` 通常意味着性能隐患。

### 3.4 key_len 计算

key_len 反映复合索引用了几个字段。计算规则：

- INT：4 字节
- BIGINT：8 字节
- CHAR(n)：n × 字符集字节数（utf8mb4 为 4）
- VARCHAR(n)：n × 字符集字节数 + 2（长度标识）
- 允许 NULL：额外 1 字节

\`\`\`
索引 idx(a INT, b VARCHAR(20), c BIGINT)
WHERE a=1 AND b='x'  → key_len = 4 + (20*4+2) = 86
WHERE a=1            → key_len = 4
\`\`\`

通过 key_len 可以判断复合索引是否被充分使用。

---

## 四、统计信息与成本估算

CBO 依赖统计信息做决策。统计信息不准，执行计划必然走偏。

### 4.1 关键统计信息

| 信息 | 含义 |
|------|------|
| 表行数 | 基数估算基础 |
| 列基数 | 不同值数量（决定选择性） |
| 直方图 | 值分布（MySQL 8.0+） |
| 索引高度 | B+树层级 |
| 数据页数 | IO 估算 |

### 4.2 选择性

选择性 = 不同值数量 / 总行数。选择性越高，索引越有效。

\`\`\`
表 100 万行
列 gender（男/女）：选择性 = 2/1000000 ≈ 0.0002% → 差，不适合建索引
列 phone（手机号）：选择性 = 100/100 ≈ 100% → 好，适合建索引
列 status（0-99）：选择性 = 100/1000000 = 0.01% → 一般
\`\`\`

经验法则：选择性 < 30% 的列，单列索引意义不大。

### 4.3 统计信息收集

\`\`\`sql
-- MySQL
ANALYZE TABLE users;  -- 手动更新
-- 自动：innodb_stats_auto_recalc = ON（默认）

-- PostgreSQL
ANALYZE users;
VACUUM ANALYZE users;  -- 清理+统计

-- Oracle
DBMS_STATS.GATHER_TABLE_STATS(...);
\`\`\`

**坑**：大量 UPDATE/DELETE 后统计信息可能滞后，导致执行计划突变。可在低峰期手动 ANALYZE。

### 4.4 直方图

MySQL 8.0 引入直方图，解决"统计信息不够细"的问题：

\`\`\`sql
ANALYZE TABLE users UPDATE HISTOGRAM ON age WITH 100 BUCKETS;
\`\`\`

直方图让优化器知道值的分布，例如知道 age=25 的行占 30%，age=80 的行占 0.1%，从而选择不同计划。

---

## 五、访问路径详解

### 5.1 const 访问

主键或唯一索引等值查询，最多匹配一行。

\`\`\`sql
SELECT * FROM users WHERE id = 1;  -- id 是主键
\`\`\`

这是最快的访问方式，复杂度 O(1)。

### 5.2 eq_ref

JOIN 时被驱动表通过主键/唯一索引关联，每行驱动表对应一行被驱动表。

\`\`\`sql
SELECT * FROM orders o JOIN users u ON o.user_id = u.id;
-- users.id 是主键，每个 order 关联一个 user
\`\`\`

### 5.3 ref

非唯一索引等值查询，可能匹配多行。

\`\`\`sql
SELECT * FROM users WHERE dept_id = 5;  -- dept_id 有普通索引
\`\`\`

### 5.4 range

索引范围扫描。

\`\`\`sql
SELECT * FROM users WHERE id BETWEEN 1 AND 100;
SELECT * FROM users WHERE id IN (1,2,3);
SELECT * FROM users WHERE name LIKE 'tom%';  -- 注意：右通配才走索引
\`\`\`

### 5.5 index

扫描整个索引（不回表）。比 ALL 快，因为索引比表小。

\`\`\`sql
SELECT COUNT(*) FROM users;  -- 可能走二级索引（比聚簇索引小）
SELECT id FROM users;         -- id 在二级索引叶子中
\`\`\`

### 5.6 ALL

全表扫描，逐行读取。大表上是性能杀手。

\`\`\`sql
SELECT * FROM users WHERE age + 1 = 30;  -- 索引列运算 → ALL
\`\`\`

---

## 六、JOIN 优化

### 6.1 JOIN 算法

**Nested Loop Join（嵌套循环）**：对驱动表每行，遍历被驱动表。
\`\`\`
for r in 驱动表:
    for s in 被驱动表:
        if match(r, s): output
\`\`\`
被驱动表有索引时效率可接受，否则是 O(N×M)。

**Block Nested Loop（BNL）**：把驱动表一批数据放入 join_buffer，减少被驱动表扫描次数。

**Hash Join（哈希连接）**：MySQL 8.0.18+ 支持。对被驱动表建哈希表，驱动表探测。
\`\`\`
build: 对小表建哈希表（key=JOIN列）
probe: 遍历大表，查哈希表匹配
\`\`\`
适合等值 JOIN 且无索引的场景，复杂度 O(N+M)。

**Merge Join（归并连接）**：两表按 JOIN 列排序后归并。要求输入有序。

### 6.2 驱动表选择

\`\`\`sql
SELECT * FROM small_table s JOIN big_table b ON s.id = b.sid WHERE s.x = 1;
\`\`\`

优化器通常选**小表**做驱动表（小表驱动大表），因为：
- Nested Loop 中驱动表全表扫描，被驱动表走索引
- 驱动表越小，被驱动表被扫描次数越少

可以用 \`STRAIGHT_JOIN\`（MySQL）强制指定驱动表顺序：
\`\`\`sql
SELECT /*+ JOIN_ORDER(s,b) */ * FROM small_table s JOIN big_table b ...;
\`\`\`

### 6.3 JOIN 优化要点

1. 被驱动表 JOIN 列要有索引
2. 小表驱动大表
3. ON 子句字段类型要一致（避免隐式转换）
4. 减少 JOIN 的表数量（超过 3 张表考虑拆分）
5. 只 SELECT 需要的列（可能触发覆盖索引）

### 6.4 JOIN 与子查询

\`\`\`sql
-- 子查询写法（可能低效）
SELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE vip=1);

-- JOIN 写法（通常更优）
SELECT o.* FROM orders o JOIN users u ON o.user_id = u.id WHERE u.vip = 1;
\`\`\`

MySQL 5.6+ 对子查询有半连接优化，但 JOIN 语义更清晰，仍推荐。

---

## 七、子查询优化

### 7.1 子查询类型

| 类型 | 示例 | 特点 |
|------|------|------|
| 标量子查询 | SELECT (SELECT COUNT(*)...) | 返回单值 |
| 行子查询 | WHERE (a,b) = (SELECT...) | 返回一行 |
| 列子查询 | WHERE id IN (SELECT...) | 返回一列 |
| 表子查询 | FROM (SELECT...) | 作为表 |
| 相关子查询 | WHERE EXISTS(SELECT...WHERE 外表.id=...) | 依赖外层 |

### 7.2 半连接优化（Semi-Join）

\`\`\`sql
SELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE vip=1);
\`\`\`

MySQL 5.6+ 把 IN 子查询优化为半连接，避免对每个 order 都执行一次子查询。优化策略：
- Table Pullout：子查询表唯一，直接 JOIN
- FirstMatch：找到第一个匹配就跳过
- LooseScan：用索引去重

### 7.3 EXISTS vs IN

\`\`\`sql
-- IN：先执行子查询，再外层过滤
SELECT * FROM A WHERE id IN (SELECT a_id FROM B);

-- EXISTS：外层驱动，对每行检查子查询
SELECT * FROM A WHERE EXISTS (SELECT 1 FROM B WHERE B.a_id = A.id);
\`\`\`

经验：**小表驱动大表用 IN，大表驱动小表用 EXISTS**。但现代优化器通常会自动改写，差异不大。

---

## 八、排序优化

### 8.1 filesort vs index

\`\`\`sql
-- 索引 idx_age，能利用索引有序性，Using index
SELECT * FROM users WHERE age > 18 ORDER BY age;

-- 索引 idx_age，但 ORDER BY name，需额外排序，Using filesort
SELECT * FROM users WHERE age > 18 ORDER BY name;
\`\`\`

索引本身有序，ORDER BY 列与索引顺序一致时可避免排序。

### 8.2 filesort 算法

- **单路排序**：取出所有字段在内存排序。占用内存大。
- **双路排序**：只取排序字段+行指针排序，再回表取数据。

\`sort_buffer_size\` 控制内存，不够则用临时文件（性能骤降）。

### 8.3 优化排序

1. ORDER BY 列加索引，且与 WHERE 列组合成复合索引
2. ORDER BY 方向与索引一致（都 ASC 或都 DESC）
3. 限制结果集（LIMIT）
4. 只 SELECT 需要列（减少 sort_buffer 压力）

\`\`\`sql
-- 好的设计：复合索引 (age, create_time)
SELECT id, age FROM users WHERE age = 20 ORDER BY create_time LIMIT 10;
-- age 等值 + create_time 有序 → Using index
\`\`\`

---

## 九、分页优化

### 9.1 深分页问题

\`\`\`sql
SELECT * FROM orders ORDER BY id LIMIT 1000000, 10;
\`\`\`

MySQL 需要扫描前 100 万行再丢弃，非常慢。

### 9.2 优化方案

**方案1：子查询延迟关联**
\`\`\`sql
SELECT * FROM orders o
JOIN (SELECT id FROM orders ORDER BY id LIMIT 1000000, 10) t
ON o.id = t.id;
-- 子查询走覆盖索引，快；再回表 10 行
\`\`\`

**方案2：游标分页（记住上一页最后一个 id）**
\`\`\`sql
SELECT * FROM orders WHERE id > 上一页最后id ORDER BY id LIMIT 10;
-- 索引定位，O(1) 起步
\`\`\`
缺点：不能跳页。

**方案3：业务限制**：限制最大页数（如搜索引擎只显示前 100 页）。

---

## 十、聚合与分组优化

### 10.1 GROUP BY 优化

\`\`\`sql
-- 索引 idx(dept, age)
SELECT dept, COUNT(*) FROM users GROUP BY dept;
-- 利用索引有序，避免临时表排序

SELECT dept, age, COUNT(*) FROM users GROUP BY dept, age;
-- 复合索引前缀匹配，仍可利用索引
\`\`\`

如果 GROUP BY 列无索引，会产生 \`Using temporary; Using filesort\`。

### 10.2 DISTINCT 优化

\`\`\`sql
SELECT DISTINCT dept FROM users;
-- 等价于 GROUP BY dept，优化方式相同
\`\`\`

### 10.3 聚合函数陷阱

\`\`\`sql
-- COUNT(*) vs COUNT(col)
SELECT COUNT(*) FROM users;      -- 统计行数（含 NULL）
SELECT COUNT(phone) FROM users;  -- 统计 phone 非 NULL 行数

-- AVG 忽略 NULL，可能导致误解
SELECT AVG(score) FROM students;  -- 是 sum/count 非 NULL，不是 sum/总行数
\`\`\`

---

## 十一、DML 优化

### 11.1 批量 INSERT

\`\`\`sql
-- 慢：逐条插入
INSERT INTO t VALUES(1);
INSERT INTO t VALUES(2);

-- 快：批量插入
INSERT INTO t VALUES(1),(2),(3);

-- 更快：LOAD DATA INFILE
LOAD DATA INFILE 'data.csv' INTO TABLE t;
\`\`\`

批量 INSERT 减少事务次数、网络往返、日志写入。

### 11.2 大批量 UPDATE 分批

\`\`\`sql
-- 一次性更新 100 万行：长事务、锁冲突、binlog 暴涨
UPDATE orders SET status=1 WHERE status=0;

-- 分批更新
UPDATE orders SET status=1 WHERE status=0 LIMIT 1000;
-- 循环执行直到 affected_rows=0
\`\`\`

### 11.3 DELETE 优化

\`\`\`sql
-- 大表 DELETE：产生大量 undo log
DELETE FROM logs WHERE create_time < '2023-01-01';

-- 分区表更优：直接 DROP 分区
ALTER TABLE logs DROP PARTITION p2022;
\`\`\`

### 11.4 INSERT ... ON DUPLICATE KEY UPDATE

\`\`\`sql
INSERT INTO counters(id, count) VALUES(1, 1)
ON DUPLICATE KEY UPDATE count = count + 1;
\`\`\`

实现 upsert（存在则更新、不存在则插入），避免先查后判断的竞态。但有死锁风险，需注意。

---

## 十二、表设计优化

### 12.1 字段类型选择

| 场景 | 推荐 | 避免 |
|------|------|------|
| 主键 | BIGINT | VARCHAR |
| 状态 | TINYINT | VARCHAR |
| 金额 | DECIMAL | FLOAT/DOUBLE |
| 时间 | DATETIME/TIMESTAMP | VARCHAR |
| 布尔 | TINYINT(1) | CHAR(1) |

更小的类型 = 更少的 IO、更多的内存缓存、更小的索引。

### 12.2 反范式设计

范式要求消除冗余，但 JOIN 多了性能差。适当冗余可减少 JOIN：

\`\`\`sql
-- 订单表冗余用户名，避免每次查订单都 JOIN 用户表
CREATE TABLE orders(
  id BIGINT PRIMARY KEY,
  user_id BIGINT,
  user_name VARCHAR(50),  -- 冗余字段
  amount DECIMAL(18,2)
);
\`\`\`

代价：更新用户名要同步更新订单表。适合"读多写少"且"冗余字段稳定"的场景。

### 12.3 垂直拆分与水平拆分

**垂直拆分**：按字段拆分。热字段一张表、冷字段一张表。
**水平拆分**：按行拆分。如按 user_id 取模分到多张表。

\`\`\`
users 表 100 列 → 拆为
  users_base(id, name, phone)  -- 高频
  users_ext(id, bio, avatar, ...)  -- 低频
\`\`\`

---

## 十三、慢查询排查流程

### 13.1 开启慢查询日志

\`\`\`sql
-- MySQL
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;  -- 超过 1 秒记录
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';

-- 也可用 pt-query-digest 分析慢日志
\`\`\`

### 13.2 排查步骤

1. **找慢 SQL**：从慢日志/监控系统获取
2. **EXPLAIN**：看 type、key、rows、Extra
3. **定位问题**：
   - type=ALL → 缺索引或索引失效
   - Using filesort → 排序问题
   - Using temporary → 临时表问题
   - rows 远大于实际 → 统计信息过时
4. **优化**：加索引/改写 SQL/改表结构
5. **验证**：重新 EXPLAIN + 实测耗时

### 13.3 常见慢 SQL 模式

| 模式 | 原因 | 方案 |
|------|------|------|
| 全表扫描 | 无索引/索引失效 | 加合适索引 |
| 深分页 | LIMIT 偏移大 | 游标分页/延迟关联 |
| 大量排序 | ORDER BY 无索引 | 排序列建索引 |
| 多表 JOIN | 被驱动表无索引 | JOIN 列建索引 |
| 函数运算 | 索引列套函数 | 改写避免运算 |
| 隐式转换 | 类型不匹配 | 统一类型 |

---

## 十四、多语言对照

### 14.1 慢查询分析工具

\`\`\`java
// Java：使用 p6spy 监控 SQL
// 配置后日志会输出每条 SQL 的耗时
// 也可用 Druid 的 StatFilter
\`\`\`

\`\`\`go
// Go：gorm 开启慢查询日志
db.Debug().SlowThreshold(time.Second).Auto()
\`\`\`

\`\`\`python
# Python：Django Debug Toolbar / django-silk
# 展示每条 SQL 的耗时和 EXPLAIN
\`\`\`

### 14.2 Hint 强制执行计划

\`\`\`sql
-- MySQL
SELECT /*+ INDEX(users idx_age) */ * FROM users WHERE age > 20;
SELECT /*+ NO_INDEX(users idx_age) */ * FROM users WHERE age > 20;
SELECT /*+ JOIN_ORDER(a,b,c) */ * FROM a JOIN b ... JOIN c ...;

-- Oracle
SELECT /*+ INDEX(t idx_name) */ * FROM t WHERE ...;
SELECT /*+ FULL(t) */ * FROM t WHERE ...;
\`\`\`

Hint 是"告诉优化器我知道得比你多"。慎用，因为数据变化后 hint 可能反而变差。

---

## 十五、最佳实践与陷阱

### 15.1 SQL 编写规范

1. 只 SELECT 需要的列，避免 \`SELECT *\`
2. WHERE 条件中索引列不做运算/函数
3. LIKE 避免 \`%xxx\` 左通配
4. OR 条件两侧都要有索引，否则用 UNION ALL
5. IN 列表不宜过长（建议 < 1000）
6. 避免在大表上 DISTINCT
7. 用 EXPLAIN 验证关键 SQL

### 15.2 索引设计规范

1. 单表索引数建议 < 5 个
2. 复合索引字段数建议 < 5
3. 区分度低的列不单独建索引
4. 频繁查询的列建索引
5. ORDER BY / GROUP BY 列考虑建索引
6. 定期清理无用索引

### 15.3 常见陷阱

**陷阱1：OR 导致全表扫描**
\`\`\`sql
-- 假设 name 有索引，age 无索引
SELECT * FROM users WHERE name='tom' OR age=20;
-- → 全表扫描（必须全表才能满足 OR）
-- 改用 UNION ALL
SELECT * FROM users WHERE name='tom'
UNION ALL
SELECT * FROM users WHERE age=20 AND name<>'tom';
\`\`\`

**陷阱2：NOT IN 不走索引**
\`\`\`sql
SELECT * FROM users WHERE id NOT IN (1,2,3);
-- 改用 LEFT JOIN ... IS NULL 或 NOT EXISTS
\`\`\`

**陷阱3：COUNT(*) 的误解**
\`\`\`sql
SELECT COUNT(*) FROM big_table;
-- InnoDB 需要扫描，不像 MyISAM 有元数据计数
-- 估算用 SHOW TABLE STATUS 或 information_schema
\`\`\`

---

## 十六、面试高频题

**Q1：EXPLAIN 中 type 列从好到坏？**
system > const > eq_ref > ref > range > index > ALL。生产中至少要 range，最好 ref 及以上。

**Q2：Using filesort 一定慢吗？**
不一定。数据量小（在 sort_buffer 内）时很快。但大表 + filesort 通常需要优化（加索引或限制结果集）。

**Q3：如何判断索引是否生效？**
EXPLAIN 看 key 列是否使用了预期索引，key_len 是否符合预期，rows 是否大幅减少。

**Q4：SQL 突然变慢怎么办？**
1. 检查统计信息是否过时（ANALYZE TABLE）
2. 检查是否有锁等待（SHOW PROCESSLIST）
3. 检查数据量是否突变
4. 检查执行计划是否改变（CBO 选错）
5. 考虑用 hint 固定执行计划

**Q5：深度分页如何优化？**
游标分页（记住上一页 id）最优；或子查询延迟关联（先走覆盖索引取 id 再回表）。

---

## 十七、EXPLAIN 实战案例集

### 17.1 案例：范围查询 + 排序

\`\`\`sql
-- 表结构
CREATE TABLE orders(
  id BIGINT PRIMARY KEY,
  user_id BIGINT,
  status TINYINT,
  create_time DATETIME,
  amount DECIMAL(18,2),
  INDEX idx_user_status(user_id, status),
  INDEX idx_create_time(create_time)
);

-- 查询：某用户的已支付订单，按时间倒序
EXPLAIN SELECT * FROM orders
WHERE user_id = 1001 AND status = 1
ORDER BY create_time DESC
LIMIT 20;

-- 理想执行计划:
-- type: ref
-- key: idx_user_status
-- rows: ~50
-- Extra: Using filesort (因为 create_time 不在索引中)

-- 优化：建立复合索引
ALTER TABLE orders ADD INDEX idx_user_status_time(user_id, status, create_time);
-- 优化后:
-- type: ref
-- key: idx_user_status_time
-- Extra: Using index condition (无 filesort！)
\`\`\`

### 17.2 案例：多条件查询的索引选择

\`\`\`sql
-- 查询
SELECT * FROM products WHERE category_id = 5 AND brand_id = 10 AND price > 100;

-- 索引选择问题：
-- 方案A: idx_category(category_id, brand_id, price) → 完美匹配
-- 方案B: idx_category(category_id) + idx_brand(brand_id) → Index Merge
-- 方案C: idx_price(price) → 只过滤 price，效果差

-- 用 EXPLAIN 验证优化器选择了哪个
EXPLAIN SELECT ...;
-- 如果 type=ref, key=idx_category → 方案A（最优）
-- 如果 type=index_merge → 方案B（可接受）
-- 如果 type=ALL → 无索引或统计信息有误
\`\`\`

### 17.3 案例：子查询改写优化

\`\`\`sql
-- 原始（低效）：相关子查询
SELECT * FROM orders o
WHERE o.amount > (
    SELECT AVG(amount) FROM orders o2
    WHERE o2.user_id = o.user_id
);

-- 改写（高效）：JOIN + 派生表
SELECT o.*
FROM orders o
JOIN (
    SELECT user_id, AVG(amount) AS avg_amt
    FROM orders
    GROUP BY user_id
) avg_t ON o.user_id = avg_t.user_id
WHERE o.amount > avg_t.avg_amt;

-- 改写后只需一次全表扫描 + 一次 JOIN，而非每行都执行子查询
\`\`\`

### 17.4 案例：OR 条件优化

\`\`\`sql
-- 假设 name 和 email 都有索引
-- 低效：OR 可能导致全表扫描
SELECT * FROM users WHERE name = 'tom' OR email = 'tom@test.com';

-- 优化方案1：UNION ALL
SELECT * FROM users WHERE name = 'tom'
UNION
SELECT * FROM users WHERE email = 'tom@test.com' AND name != 'tom';

-- 优化方案2：Index Merge（MySQL 5.0+）
-- 如果 index_merge=on，优化器可能自动合并两个索引
-- EXPLAIN 中 type=index_merge, Extra=Using union(...)
\`\`\`

### 17.5 案例：COUNT 优化

\`\`\`sql
-- 慢：InnoDB COUNT(*) 需要扫描
SELECT COUNT(*) FROM big_table WHERE status = 1;

-- 优化方案1：维护计数表
CREATE TABLE counts(table_name VARCHAR(50), status INT, cnt BIGINT);
-- 触发器维护 cnt，查询时直接读计数表

-- 优化方案2：估算
SELECT table_rows FROM information_schema.tables
WHERE table_name = 'big_table';

-- 优化方案3：缓存
-- Redis 维护计数，INCR/DECR 更新
\`\`\`

---

## 十八、查询改写技巧

### 18.1 谓词下推

\`\`\`sql
-- 原始
SELECT * FROM (
    SELECT * FROM orders JOIN items ON orders.id = items.order_id
) t WHERE t.user_id = 1001;

-- 优化：条件下推到子查询内部
SELECT * FROM (
    SELECT * FROM orders JOIN items ON orders.id = items.order_id
    WHERE orders.user_id = 1001
) t;
\`\`\`

### 18.2 消除 DISTINCT

\`\`\`sql
-- DISTINCT 通常需要排序或哈希
SELECT DISTINCT user_id FROM orders;

-- 如果只需要唯一值，用 GROUP BY 更明确
SELECT user_id FROM orders GROUP BY user_id;

-- 更好：如果只关心是否存在，用 EXISTS
SELECT u.* FROM users u WHERE EXISTS(SELECT 1 FROM orders o WHERE o.user_id = u.id);
\`\`\`

### 18.3 用 JOIN 替代 IN 子查询

\`\`\`sql
-- IN 子查询
SELECT * FROM orders WHERE user_id IN (SELECT id FROM vip_users);

-- JOIN 改写
SELECT o.* FROM orders o
INNER JOIN vip_users v ON o.user_id = v.id;
\`\`\`

### 18.4 用窗口函数替代自连接

\`\`\`sql
-- 原始：自连接找每个部门工资最高的人
SELECT e1.* FROM employees e1
WHERE e1.salary = (
    SELECT MAX(e2.salary) FROM employees e2
    WHERE e2.dept_id = e1.dept_id
);

-- 优化：窗口函数
SELECT * FROM (
    SELECT e.*, ROW_NUMBER() OVER(PARTITION BY dept_id ORDER BY salary DESC) AS rn
    FROM employees e
) t WHERE rn = 1;
\`\`\`

### 18.5 避免 SELECT *

\`\`\`sql
-- 差：SELECT * 会取所有列
-- 1. 传输更多数据
-- 2. 无法利用覆盖索引
-- 3. 如果表结构变化可能出错

SELECT * FROM users WHERE id = 1;

-- 好：只取需要的列
SELECT id, name, email FROM users WHERE id = 1;
-- 如果有 idx(id, name, email) → Using index（覆盖索引，不回表）
\`\`\`

---

## 十九、分区表优化

### 19.1 分区类型

\`\`\`sql
-- RANGE 分区：按范围
CREATE TABLE logs (
    id BIGINT,
    create_time DATETIME,
    content TEXT
) PARTITION BY RANGE (TO_DAYS(create_time)) (
    PARTITION p202301 VALUES LESS THAN (TO_DAYS('2023-02-01')),
    PARTITION p202302 VALUES LESS THAN (TO_DAYS('2023-03-01')),
    PARTITION p202303 VALUES LESS THAN (TO_DAYS('2023-04-01')),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);

-- LIST 分区：按枚举值
CREATE TABLE users (
    id BIGINT,
    region VARCHAR(20)
) PARTITION BY LIST (region) (
    PARTITION p_north VALUES IN ('beijing', 'tianjin'),
    PARTITION p_south VALUES IN ('shanghai', 'guangzhou')
);

-- HASH 分区：均匀分散
CREATE TABLE orders (
    id BIGINT,
    user_id BIGINT
) PARTITION BY HASH(user_id) PARTITIONS 16;
\`\`\`

### 19.2 分区裁剪

\`\`\`sql
-- 查询只扫描相关分区（分区裁剪）
SELECT * FROM logs WHERE create_time >= '2023-03-01' AND create_time < '2023-04-01';
-- 只扫描 p202303 分区

-- 但如果用了函数，分区裁剪失效！
SELECT * FROM logs WHERE DATE(create_time) = '2023-03-15';
-- 扫描所有分区！
\`\`\`

### 19.3 分区适用场景

| 场景 | 分区策略 | 优势 |
|------|---------|------|
| 日志按日期 | RANGE | 快速删除旧数据（DROP PARTITION） |
| 用户按地区 | LIST | 地区查询只扫描相关分区 |
| 订单按用户 | HASH | 均匀分散，避免热点 |

### 19.4 分区的限制

1. 分区键必须是主键/唯一键的一部分
2. 跨分区查询性能可能不如预期
3. 分区数不宜过多（建议 < 100）
4. 外键不支持分区表

---

## 二十、物化视图与预计算

### 20.1 物化视图

\`\`\`sql
-- Oracle 原生物化视图
CREATE MATERIALIZED VIEW mv_order_stats
REFRESH COMPLETE ON DEMAND
AS
SELECT user_id, COUNT(*) AS order_count, SUM(amount) AS total
FROM orders
GROUP BY user_id;

-- MySQL 无原生物化视图，用表 + 定时任务模拟
CREATE TABLE mv_order_stats (
    user_id BIGINT PRIMARY KEY,
    order_count INT,
    total DECIMAL(18,2),
    updated_at DATETIME
);

-- 定时刷新
TRUNCATE TABLE mv_order_stats;
INSERT INTO mv_order_stats
SELECT user_id, COUNT(*), SUM(amount), NOW()
FROM orders GROUP BY user_id;
\`\`\`

### 20.2 增量更新

\`\`\`sql
-- 每次下单时增量更新
INSERT INTO mv_order_stats(user_id, order_count, total, updated_at)
VALUES(?, 1, ?, NOW())
ON DUPLICATE KEY UPDATE
    order_count = order_count + 1,
    total = total + VALUES(total),
    updated_at = NOW();
\`\`\`

### 20.3 应用场景

- 报表统计（COUNT/SUM/AVG 预计算）
- 排行榜（定时排序写入）
- 首页推荐（定时计算写入）

---

## 二十一、数据库配置调优

### 21.1 InnoDB 关键参数

\`\`\`ini
[mysqld]
# Buffer Pool：越大越好，建议物理内存的 50-70%
innodb_buffer_pool_size = 8G

# 日志文件大小：影响恢复时间和写入性能
innodb_log_file_size = 1G
innodb_log_files_in_group = 2

# 刷盘策略：0=不刷, 1=每次提交刷(最安全), 2=每秒刷
innodb_flush_log_at_trx_commit = 1

# 双写缓冲：防止页损坏
innodb_doublewrite = 1

# IO 容量：影响刷新脏页速度
innodb_io_capacity = 2000
innodb_io_capacity_max = 4000

# 并发线程限制
innodb_thread_concurrency = 0  # 0=不限制
\`\`\`

### 21.2 连接管理

\`\`\`ini
# 最大连接数
max_connections = 500

# 空闲连接超时
wait_timeout = 28800
interactive_timeout = 28800

# 连接缓冲
thread_cache_size = 100
\`\`\`

### 21.3 查询缓存（MySQL 8.0 已移除）

\`\`\`ini
# MySQL 5.7 及以下
query_cache_type = 0  # 建议关闭，高并发下成为瓶颈
query_cache_size = 0
\`\`\`

MySQL 8.0 移除了查询缓存，因为它在高并发下锁竞争严重，且缓存命中率通常很低。

---

## 二十二、真实优化案例

### 22.1 案例：报表查询从 30 秒优化到 0.5 秒

\`\`\`
原始 SQL:
  SELECT dept, COUNT(*), SUM(amount) FROM orders
  WHERE create_time BETWEEN '2023-01-01' AND '2023-12-31'
  GROUP BY dept;
  
问题: 1 亿行全表扫描 + 临时表排序
优化:
  1. 加分区（按月）→ 只扫描 12 个分区
  2. 加索引 idx_dept_time(dept, create_time)
  3. 建物化视图预计算月统计
结果: 0.5 秒
\`\`\`

### 22.2 案例：深分页从 5 秒优化到 10 毫秒

\`\`\`
原始 SQL:
  SELECT * FROM orders ORDER BY id LIMIT 1000000, 10;
  → 5 秒
  
优化:
  SELECT * FROM orders o
  JOIN (SELECT id FROM orders ORDER BY id LIMIT 1000000, 10) t
  ON o.id = t.id;
  → 10 毫秒（子查询走覆盖索引）
\`\`\`

### 22.3 案例：JOIN 从 10 秒优化到 0.2 秒

\`\`\`
原始 SQL:
  SELECT * FROM orders o JOIN users u ON o.user_id = u.id
  WHERE u.city = 'beijing';
  → 10 秒（users 全表扫描后 JOIN）
  
优化:
  1. users.city 加索引
  2. 改用小表驱动: 先查 city='beijing' 的用户，再 JOIN orders
  → 0.2 秒
\`\`\`

### 22.4 案例：OR 查询从全表扫描到索引扫描

\`\`\`
原始 SQL:
  SELECT * FROM products WHERE category = 'A' OR tag = 'hot';
  → 8 秒（全表扫描）
  
优化:
  SELECT * FROM products WHERE category = 'A'
  UNION
  SELECT * FROM products WHERE tag = 'hot' AND category != 'A';
  → 0.1 秒（两个索引分别扫描）
\`\`\`

---

## 二十三、更多面试题

**Q6：EXPLAIN 中 rows 列准确吗？**
不完全准确。rows 是优化器的估算值，基于统计信息。如果统计信息过时，rows 可能偏差很大。可用 \`EXPLAIN ANALYZE\`（MySQL 8.0）获取实际行数。

**Q7：什么时候用 hint？**
当优化器选错执行计划时（统计信息偏差、索引选择错误、JOIN 顺序不当）。但 hint 是"硬编码"，数据变化后可能变差。应优先更新统计信息、调整索引。

**Q8：如何判断 SQL 是否需要优化？**
1. 响应时间 > 预期阈值
2. EXPLAIN 出现 ALL/index/Using filesort/Using temporary
3. rows 远大于实际结果集
4. 慢查询日志中有记录

**Q9：分区表和分表的区别？**
分区表是单表的逻辑分区，对应用透明，适合中等数据量。分表是物理拆分到多张表，需要应用层路由，适合海量数据。分区表上限约 TB 级，分表可达 PB 级。

**Q10：为什么 SELECT COUNT(*) 慢？**
InnoDB 的 COUNT(*) 需要实际扫描（不像 MyISAM 有元数据计数），因为 MVCC 下不同事务看到的行数不同。优化：维护计数表、估算、缓存。

---

## 二十四、SQL 调优方法论

### 24.1 调优流程图

\`\`\`
发现问题（慢日志/监控/用户反馈）
    ↓
定位 SQL
    ↓
EXPLAIN 分析
    ↓
┌─ type=ALL → 缺索引 → 建索引
├─ Using filesort → 排序列建索引
├─ Using temporary → 优化 GROUP BY/DISTINCT
├─ rows 过大 → 统计信息/索引/分区
└─ JOIN 低效 → 小表驱动/JOIN列索引
    ↓
改写 SQL / 调整索引 / 修改表结构
    ↓
验证（EXPLAIN + 实测）
    ↓
上线 + 监控
\`\`\`

### 24.2 调优优先级

\`\`\`
1. SQL 写法优化（零成本，立竿见影）
2. 索引优化（低成本，效果显著）
3. 表结构优化（中等成本，需评估）
4. 分区/分表（高成本，最后手段）
5. 架构优化（缓存/读写分离/异构索引）
\`\`\`

### 24.3 常见反模式

| 反模式 | 问题 | 改进 |
|--------|------|------|
| SELECT * | 传输冗余、无法覆盖索引 | 明确列名 |
| 索引列运算 | 索引失效 | 改写条件 |
| OR 全表扫描 | 无法走单索引 | UNION ALL |
| 深分页 | 扫描大量行 | 游标分页 |
| 大 IN 列表 | 解析慢、可能走全表 | 临时表 JOIN |
| 隐式转换 | 索引失效 | 类型一致 |
| 函数包裹列 | 索引失效 | 改写条件 |

---

## 二十五、优化器深度剖析：CBO 与连接顺序

### 25.1 RBO vs CBO

- **RBO（Rule-Based Optimizer，基于规则）**：按固定规则集（如"有索引就走索引"）选执行计划，简单但僵化。Oracle 10g 后废弃。
- **CBO（Cost-Based Optimizer，基于成本）**：估算各候选计划的成本（CPU + IO），选最低者。现代数据库主流。

### 25.2 成本模型

InnoDB 成本 = **IO 成本** + **CPU 成本**：

\`\`\`
cost = pages_read * io_cost_per_page + rows_examined * cpu_cost_per_row
\`\`\`

- \`io_cost_per_page\` 默认 1.0（读一个页的成本）。
- \`cpu_cost_per_row\` 默认 0.2（处理一行的成本）。
- 走索引时，还需估算回表成本（二级索引行数 * 1.0）。

优化器用统计信息（基数、行数、页数）估算各步骤 \`rows_examined\`，进而算成本。

### 25.3 连接顺序选择

多表 JOIN 时，连接顺序组合呈阶乘增长（n!）。优化器用**动态规划**（表少时）或**贪心**（表多时）选最优顺序。一般小表驱动大表——小表结果集先扫，再到大表里查匹配。

\`\`\`
A(100行) JOIN B(10000行) JOIN C(1000000行)
最优顺序往往是 A→B→C：先扫 A 100 行，每行到 B 查（走索引 1 次），再扫结果到 C 查。
\`\`\`

### 25.4 优化器Hints

强制走某索引或连接方式：

\`\`\`sql
-- 强制索引
SELECT * FROM t USE INDEX(idx_a) WHERE a=1;
SELECT * FROM t FORCE INDEX(idx_a) WHERE a=1;
-- 忽略索引
SELECT * FROM t IGNORE INDEX(idx_a) WHERE a=1;
-- MySQL 8.0 Hint
SELECT /*+ NO_INDEX_MERGE(t) */ * FROM t WHERE ...;
SELECT /*+ JOIN_ORDER(a,b,c) */ * FROM a JOIN b ... JOIN c ...;
\`\`\`

**注意**：Hint 应作为最后手段，硬编码后表结构变化时计划僵化。优先靠统计信息和索引设计。

## 二十六、JOIN 算法详解

### 26.1 Nested Loop Join（NLJ）

最基础算法：外层表每行去内层表找匹配。

\`\`\`
for r in 驱动表:
    for s in 被驱动表:
        if match(r, s): output
\`\`\`

- 被驱动表有索引时，内层走索引（**Index Nested Loop Join**），复杂度 O(N * log M)，高效。
- 被驱动表无索引时，每次内层全表扫描（**Simple NLJ**），复杂度 O(N * M)，慢。

### 26.2 Block Nested Loop Join（BNL）

被驱动表无索引时，Simple NLJ 太慢。BNL 把驱动表的一批行（放入 join_buffer）一次性与被驱动表整表比较，减少被驱动表扫描次数：

\`\`\`
while 驱动表还有行:
    读一批行到 join_buffer
    for s in 被驱动表(全表扫一次):
        for r in join_buffer:
            if match(r, s): output
\`\`\`

被驱动表扫描次数 = 驱动表行数 / join_buffer 能放的行数。join_buffer 越大，扫描次数越少。

### 26.3 Hash Join（MySQL 8.0.18+）

构建哈希表再探测：

1. **Build 阶段**：扫小表，对连接键建内存哈希表。
2. **Probe 阶段**：扫大表，对连接键哈希查表。

\`\`\`
hashTable = build(小表, 连接键)
for r in 大表:
    for s in hashTable.get(hash(r.连接键)):
        if match(r, s): output
\`\`\`

复杂度 O(N + M)，远快于 BNL。MySQL 8.0.18 起默认用 Hash Join 替代 BNL（无索引 JOIN 场景）。

### 26.4 三种算法对比

| 算法 | 适用场景 | 复杂度 | 要点 |
|------|---------|--------|------|
| Index NLJ | 被驱动表有索引 | O(N log M) | 最优，走索引 |
| BNL | 无索引，join_buffer 够 | O(N*M/buffer) | 分批减少扫描 |
| Hash Join | 无索引，等值连接 | O(N+M) | 8.0+首选 |

### 26.5 多语言对照

- **PostgreSQL**：默认 Hash Join / Merge Join（已排序时），自动选最优。
- **Oracle**：支持 NLJ / Hash Join / Sort-Merge Join，CBO 选择。
- **SQL Server**：Nested Loops / Hash Match / Merge Join 三种。
- **Java/MyBatis**：通过 \`resultMap\` 的 \`association\`/\`collection\` 在应用层做"JOIN"，避免 SQL 复杂 JOIN——注意 N+1 问题。

## 二十七、子查询优化

### 27.1 子查询类型

- **标量子查询**：返回单值，可在 SELECT 列表或 WHERE 中。
- **行子查询**：返回一行多列。
- **表子查询**：返回多行多列，用于 IN/EXISTS/FROM。
- **相关子查询**：子查询引用外层列，每行执行一次。
- **非相关子查询**：独立执行一次。

### 27.2 优化策略

1. **Semi-Join（半连接）**：\`WHERE id IN (SELECT id FROM t2)\` 优化为半连接——只关心 t2 是否有匹配，不关心有几条。MySQL 5.6+ 自动转。
2. **Anti-Join（反连接）**：\`WHERE id NOT IN (SELECT id FROM t2)\` 优化为反连接。
3. **Materialization（物化）**：把子查询结果存为临时表，避免重复执行。
4. **EXISTS 改写**：相关子查询 \`WHERE EXISTS(SELECT 1 FROM t2 WHERE t2.id=t1.id)\` 有时比 IN 快（索引利用）。

### 27.3 NOT IN 的坑

\`NOT IN (SELECT ...)\` 若子查询含 NULL，整个查询返回空（NULL 与任何值比较都是 UNKNOWN）。应改用 \`NOT EXISTS\`：

\`\`\`sql
-- 危险：若 t2.id 有 NULL，结果为空
SELECT * FROM t1 WHERE id NOT IN (SELECT id FROM t2);
-- 安全
SELECT * FROM t1 WHERE NOT EXISTS (SELECT 1 FROM t2 WHERE t2.id=t1.id);
\`\`\`

## 二十八、分区表深度

### 28.1 分区类型

- **RANGE 分区**：按值域。如 \`PARTITION BY RANGE(YEAR(create_time))\`，按年分区。
- **LIST 分区**：按离散值。如 \`PARTITION BY LIST(region)\`，每个地区一区。
- **HASH 分区**：对列哈希取模。如 \`PARTITION BY HASH(id) PARTITIONS 4\`。
- **KEY 分区**：类似 HASH 但用 MySQL 内部哈希函数，支持非整型。

\`\`\`sql
CREATE TABLE orders (
  id BIGINT,
  amount DECIMAL(10,2),
  create_time DATETIME
) PARTITION BY RANGE (TO_DAYS(create_time)) (
  PARTITION p2023 VALUES LESS THAN (TO_DAYS('2024-01-01')),
  PARTITION p2024 VALUES LESS THAN (TO_DAYS('2025-01-01')),
  PARTITION p2025 VALUES LESS THAN (TO_DAYS('2026-01-01')),
  PARTITION pmax VALUES LESS THAN MAXVALUE
);
\`\`\`

### 28.2 分区裁剪（Partition Pruning）

查询条件命中分区键时，优化器只扫相关分区。如 \`WHERE create_time BETWEEN '2024-06-01' AND '2024-06-30'\` 只扫 p2024。

**坑**：分区键在函数内 (\`WHERE YEAR(create_time)=2024\`) 会导致裁剪失效，应改 \`WHERE create_time >= '2024-01-01' AND create_time < '2025-01-01'\`。

### 28.3 分区适用场景与局限

**适合**：时间序列数据、日志表、按地域分片。

**局限**：

- 分区键必须是主键/唯一键的一部分（MySQL 限制）。
- 跨分区 JOIN 性能差。
- 分区数不宜过多（建议 < 1000），过多致元数据膨胀。
- 分区不解决单机写入瓶颈——那是分库分表的事。

## 二十九、物化视图与视图优化

### 29.1 视图（View）

视图是**虚拟表**，存储 SQL 定义不存数据，查询时展开执行。用途：简化复杂查询、权限控制（隐藏列）。

\`\`\`sql
CREATE VIEW order_summary AS
SELECT u.name, COUNT(o.id) AS order_cnt, SUM(o.amount) AS total
FROM users u LEFT JOIN orders o ON o.user_id=u.id
GROUP BY u.id;
\`\`\`

**坑**：视图不提升性能，复杂视图嵌套可能生成低效 SQL。MySQL 视图用 merge（合并）或 temptable（临时表）算法，merge 可优化，temptable 不可下推条件。

### 29.2 物化视图（Materialized View）

物化视图**预先计算并存储结果**，查询直接读物化表，快。

- **Oracle**：原生支持 \`CREATE MATERIALIZED VIEW\`，可同步或按需刷新。
- **PostgreSQL**：支持，\`REFRESH MATERIALIZED VIEW\` 刷新。
- **MySQL**：不原生支持，用**汇总表 + 触发器/定时任务**模拟。

\`\`\`sql
-- MySQL 模拟物化视图：定时刷新汇总表
CREATE TABLE order_summary_cache (
  user_id INT PRIMARY KEY,
  order_cnt INT,
  total DECIMAL(12,2),
  updated_at DATETIME
);
-- 定时任务（事件）每小时刷新
CREATE EVENT refresh_summary ON SCHEDULE EVERY 1 HOUR DO
  REPLACE INTO order_summary_cache
  SELECT user_id, COUNT(*), SUM(amount), NOW() FROM orders
  WHERE create_time >= NOW() - INTERVAL 1 HOUR
  GROUP BY user_id;
\`\`\`

### 29.3 列存与预聚合

OLAP 场景（如 ClickHouse、Doris）用**列存 + 预聚合**替代物化视图：数据按列存储，压缩比高；预聚合表（rollup）自动维护。ClickHouse 的 \`AggregatingMergeTree\` 引擎专为预聚合设计。

## 三十、SQL 改写技巧大全

### 30.1 OR → UNION ALL

\`\`\`sql
-- 慢：OR 致无法走单索引
SELECT * FROM t WHERE a=1 OR b=2;
-- 快：UNION ALL 各走索引（注意去重用 UNION）
SELECT * FROM t WHERE a=1
UNION
SELECT * FROM t WHERE b=2;
\`\`\`

### 30.2 子查询 → JOIN

\`\`\`sql
-- 慢：相关子查询每行执行
SELECT * FROM orders o
WHERE EXISTS(SELECT 1 FROM users u WHERE u.id=o.user_id AND u.vip=1);
-- 快：JOIN
SELECT o.* FROM orders o JOIN users u ON u.id=o.user_id WHERE u.vip=1;
\`\`\`

### 30.3 NOT IN → LEFT JOIN ... IS NULL

\`\`\`sql
-- 慢且有 NULL 坑
SELECT * FROM t1 WHERE id NOT IN (SELECT id FROM t2);
-- 快
SELECT t1.* FROM t1 LEFT JOIN t2 ON t2.id=t1.id WHERE t2.id IS NULL;
\`\`\`

### 30.4 深分页 → 游标分页

\`\`\`sql
-- 慢：LIMIT 1000000,20 扫 1000020 行
SELECT * FROM orders ORDER BY id LIMIT 1000000,20;
-- 快：记住上一页末尾 id
SELECT * FROM orders WHERE id > 1000000 ORDER BY id LIMIT 20;
\`\`\`

### 30.5 COUNT 优化

\`\`\`sql
-- 慢：COUNT(*) 全表扫
SELECT COUNT(*) FROM orders WHERE status=1;
-- 快：维护计数表
SELECT cnt FROM order_count WHERE status=1;
\`\`\`

### 30.6 批量插入

\`\`\`sql
-- 慢：1000 次 INSERT
INSERT INTO t VALUES(1);
INSERT INTO t VALUES(2);
...
-- 快：1 次批量
INSERT INTO t VALUES(1),(2),...,(1000);
\`\`\`

## 三十一、数据库参数调优

### 31.1 InnoDB Buffer Pool

\`innodb_buffer_pool_size\`：缓存数据页和索引页的内存。生产建议设物理内存 50%-70%。这是对 InnoDB 性能影响最大的参数。

\`\`\`ini
[mysqld]
innodb_buffer_pool_size = 16G
innodb_buffer_pool_instances = 8   # 多实例减少锁竞争
\`\`\`

### 31.2 排序与连接缓冲

- \`sort_buffer_size\`：每个连接的排序缓冲。ORDER BY 数据超过此值则落临时表（filesort）。设 1-4M 即可，过大致内存浪费（每连接独立分配）。
- \`join_buffer_size\`：BNL 用的缓冲。设 1-4M。
- \`read_buffer_size\`：全表扫描缓冲。
- \`tmp_table_size\` / \`max_heap_table_size\`：内存临时表上限，超过则落磁盘。

### 31.3 日志相关

- \`innodb_flush_log_at_trx_commit\`：0=每秒刷盘（性能高，可能丢 1 秒数据）；1=每次提交刷盘（最安全，默认）；2=每次提交写 OS 缓存每秒刷盘（折中）。
- \`sync_binlog\`：0=OS 决定刷盘；1=每次提交刷盘（最安全，默认）；N=每 N 次提交刷盘。
- 双 1 配置（\`flush=1\` + \`sync_binlog=1\`）最安全但性能最低，生产核心库建议。

### 31.4 连接数

- \`max_connections\`：最大连接数。设 500-2000，过高耗内存。
- \`thread_cache_size\`：线程缓存，避免频繁创建销毁线程。

## 三十二、慢查询日志分析实战

### 32.1 开启慢查询日志

\`\`\`ini
[mysqld]
slow_query_log = ON
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1          # 超过 1 秒记录
log_queries_not_using_indexes = ON   # 未用索引的查询也记录
\`\`\`

### 32.2 mysqldumpslow 分析

\`\`\`bash
# 按总时间排序，取前 10
mysqldumpslow -s t -t 10 /var/log/mysql/slow.log
# 按次数排序
mysqldumpslow -s c -t 10 /var/log/mysql/slow.log
\`\`\`

### 32.3 pt-query-digest（Percona Toolkit）

更强大的分析工具：

\`\`\`bash
pt-query-digest /var/log/mysql/slow.log > report.txt
\`\`\`

输出每类查询的执行次数、总耗时、平均耗时、95% 分位、样本 SQL，便于定位 TOP N 慢查询。

### 32.4 performance_schema 与 sys 库

\`\`\`sql
-- 查看执行次数最多的 SQL
SELECT digest_text, count_star, sum_timer_wait/1e9 AS total_sec
FROM performance_schema.events_statements_summary_by_digest
ORDER BY sum_timer_wait DESC LIMIT 10;

-- sys 库视图更直观
SELECT * FROM sys.statements_with_runtimes_in_95th_percentile;
SELECT * FROM sys.statements_with_full_table_scans;
\`\`\`

## 三十三、真实生产调优案例

### 案例 1：深分页导致接口超时

**现象**：订单列表接口翻页到第 5000 页（LIMIT 100000,20）响应 8 秒。

**分析**：EXPLAIN 显示 \`LIMIT 100000,20\` 扫描 100020 行，filesort。

**优化**：改游标分页（\`WHERE id > last_id LIMIT 20\`），响应降至 20ms。

### 案例 2：隐式转换致全表扫描

**现象**：\`WHERE phone=13800000000\` 慢，phone 是 varchar。

**分析**：MySQL 把 phone 转 BIGINT 比较，索引失效，全表扫描 500 万行。

**优化**：\`WHERE phone='13800000000'\`，走索引，5ms。

### 案例 3：OR 查询走全表

**现象**：\`WHERE user_id=100 OR order_no='NO123'\` 慢，两列各有索引。

**分析**：OR 致优化器放弃索引合并，全表扫描。

**优化**：\`SELECT ... WHERE user_id=100 UNION SELECT ... WHERE order_no='NO123'\`，各走索引。

### 案例 4：统计信息过期致选错索引

**现象**：某查询突然变慢，EXPLAIN 显示走了低选择性索引。

**分析**：数据大量增删后统计信息过期，优化器估算行数偏差大。

**优化**：\`ANALYZE TABLE t\`，重新采样统计，执行计划恢复正常。

---

## 本章小结

SQL 调优是后端工程师的核心技能。本章系统讲解了：

- 查询处理的完整流程（解析→优化→执行）
- CBO 基于代价的优化原理
- EXPLAIN 各列含义与判断方法
- 统计信息与选择性对执行计划的影响
- 各种访问路径（const/eq_ref/ref/range/index/ALL）
- JOIN 算法与优化（Nested Loop/Hash Join）
- 子查询、排序、分页、聚合的优化技巧
- DML 批量操作优化
- 表结构设计优化（字段类型/反范式/拆分）
- 慢查询排查的完整流程
- 常见陷阱与最佳实践

调优的本质是"减少无效工作"：减少扫描行数、减少 IO、减少排序、减少临时表。下一章我们将跳出关系型数据库，探索 NoSQL 的世界与 CAP 理论。
`,
    code: `
// ============================================================
// 第四章演示：执行计划模拟与 SQL 调优
// 模拟 CBO 优化器生成执行计划，对比不同 SQL 的代价
// ============================================================

// 模拟表结构
class Table {
  constructor(name, rows, indexes = [], columns = []) {
    this.name = name;
    this.rowCount = rows;
    this.indexes = indexes;  // [{ name, columns: [...], unique }]
    this.columns = columns;  // [{ name, type, cardinality }]
  }

  // 估算某条件的过滤后行数
  estimateRows(condition) {
    if (!condition) return this.rowCount;
    let rows = this.rowCount;
    for (const col of Object.keys(condition)) {
      const colDef = this.columns.find(c => c.name === col);
      if (colDef) {
        // 选择性 = 1 / cardinality
        rows = Math.max(1, Math.floor(rows / colDef.cardinality));
      }
    }
    return rows;
  }

  // 是否有索引覆盖某列
  findIndex(columns) {
    return this.indexes.find(idx =>
      columns.every(c => idx.columns.includes(c))
    );
  }
}

// 模拟优化器：生成执行计划
class Optimizer {
  constructor(tables) {
    this.tables = new Map(tables.map(t => [t.name, t]));
  }

  // 分析单表查询
  explain(sql) {
    console.log('SQL:', sql);
    const plan = this._parseAndPlan(sql);
    this._printPlan(plan);
    return plan;
  }

  _parseAndPlan(sql) {
    // 简化的 SQL 解析（演示用）
    const tableMatch = sql.match(/FROM\\s+(\\w+)/i);
    const whereMatch = sql.match(/WHERE\\s+(.+?)(?:ORDER BY|LIMIT|GROUP BY|$)/i);
    const orderMatch = sql.match(/ORDER BY\\s+(.+?)(?:LIMIT|$)/i);
    const limitMatch = sql.match(/LIMIT\\s+(\\d+)/i);

    const tableName = tableMatch[1];
    const table = this.tables.get(tableName);
    if (!table) return { error: 'table not found' };

    // 解析 WHERE 条件列（简化：只取等值列）
    const whereCols = whereMatch ? this._parseWhereColumns(whereMatch[1]) : [];
    const index = table.findIndex(whereCols);

    // 决定访问类型
    let accessType, usedIndex, rowsScanned;
    if (whereCols.length === 0) {
      accessType = 'ALL';
      usedIndex = null;
      rowsScanned = table.rowCount;
    } else if (index) {
      if (index.unique && whereCols.length === index.columns.length) {
        accessType = 'const';
      } else if (whereCols.length === index.columns.length) {
        accessType = 'ref';
      } else {
        accessType = 'range';
      }
      usedIndex = index.name;
      rowsScanned = table.estimateRows(
        whereCols.reduce((acc, c) => { acc[c] = 1; return acc; }, {})
      );
    } else {
      accessType = 'ALL';
      usedIndex = null;
      rowsScanned = table.rowCount;
    }

    // 排序分析
    let extra = [];
    if (orderMatch) {
      const orderCols = orderMatch[1].split(',').map(s => s.trim().split(/\\s+/)[0]);
      const orderIndex = table.findIndex(orderCols);
      if (orderIndex && orderCols.every(c => whereCols.includes(c) || true)) {
        extra.push('Using index');
      } else {
        extra.push('Using filesort');
      }
    }
    if (accessType === 'ALL') extra.push('Using where');

    // 代价估算
    const ioCost = rowsScanned * (accessType === 'ALL' ? 1 : 0.01);
    const cpuCost = rowsScanned * 0.1;
    const totalCost = ioCost + cpuCost;

    return {
      table: tableName,
      type: accessType,
      key: usedIndex,
      rows: rowsScanned,
      Extra: extra.join('; '),
      cost: totalCost.toFixed(2),
      limit: limitMatch ? parseInt(limitMatch[1]) : null
    };
  }

  _parseWhereColumns(whereClause) {
    const cols = [];
    const matches = whereClause.matchAll(/(\\w+)\\s*(?:=|>|<|>=|<=|LIKE|IN)/gi);
    for (const m of matches) cols.push(m[1]);
    return [...new Set(cols)];
  }

  _printPlan(plan) {
    console.log('┌──────────────────────────────────────────┐');
    console.log('│ 执行计划                                 │');
    console.log('├──────────────┬───────────────────────────┤');
    console.log(\`│ table       │ \${plan.table.padEnd(25)} │\`);
    console.log(\`│ type        │ \${plan.type.padEnd(25)} │\`);
    console.log(\`│ key         │ \${(plan.key || 'NULL').padEnd(25)} │\`);
    console.log(\`│ rows        │ \${String(plan.rows).padEnd(25)} │\`);
    console.log(\`│ Extra       │ \${(plan.Extra || '').padEnd(25)} │\`);
    console.log(\`│ 估算代价    │ \${plan.cost.padEnd(25)} │\`);
    console.log('└──────────────┴───────────────────────────┘');
  }
}

// ============================================================
// 创建测试表
// ============================================================
const users = new Table('users', 1000000,
  [
    { name: 'PRIMARY', columns: ['id'], unique: true },
    { name: 'idx_phone', columns: ['phone'], unique: true },
    { name: 'idx_dept_age', columns: ['dept_id', 'age'], unique: false },
    { name: 'idx_create_time', columns: ['create_time'], unique: false }
  ],
  [
    { name: 'id', type: 'BIGINT', cardinality: 1000000 },
    { name: 'phone', type: 'VARCHAR', cardinality: 1000000 },
    { name: 'dept_id', type: 'INT', cardinality: 50 },
    { name: 'age', type: 'INT', cardinality: 100 },
    { name: 'create_time', type: 'DATETIME', cardinality: 500000 },
    { name: 'name', type: 'VARCHAR', cardinality: 800000 }
  ]
);

const opt = new Optimizer([users]);

// ============================================================
// 演示 1：不同查询的执行计划对比
// ============================================================
console.log('===== 演示 1：执行计划对比 =====');
console.log('\\n--- 场景 A：主键等值查询（最优）---');
opt.explain('SELECT * FROM users WHERE id = 12345');

console.log('\\n--- 场景 B：手机号查询（唯一索引）---');
opt.explain('SELECT * FROM users WHERE phone = 13800138000');

console.log('\\n--- 场景 C：复合索引最左前缀---');
opt.explain('SELECT * FROM users WHERE dept_id = 5');

console.log('\\n--- 场景 D：复合索引全列---');
opt.explain('SELECT * FROM users WHERE dept_id = 5 AND age = 30');

console.log('\\n--- 场景 E：无索引列查询（全表扫描）---');
opt.explain('SELECT * FROM users WHERE name = tom');

console.log('\\n--- 场景 F：无 WHERE（全表扫描）---');
opt.explain('SELECT * FROM users');

// ============================================================
// 演示 2：排序优化
// ============================================================
console.log('\\n===== 演示 2：排序分析 =====');
opt.explain('SELECT * FROM users WHERE dept_id = 5 ORDER BY age');
opt.explain('SELECT * FROM users WHERE dept_id = 5 ORDER BY name');

// ============================================================
// 演示 3：索引失效场景模拟
// ============================================================
console.log('\\n===== 演示 3：索引失效场景 =====');

function analyzeIndexUsage(scenario, sql, hasIndex) {
  console.log(\`\\n场景: \${scenario}\`);
  console.log(\`SQL: \${sql}\`);
  console.log(\`索引是否可用: \${hasIndex ? '是 ✓' : '否 ✗'}\`);
  if (!hasIndex) {
    console.log('  原因: 索引列被函数包裹');
    console.log('  优化: 改写为范围查询');
  }
}

analyzeIndexUsage('函数包裹索引列',
  'SELECT * FROM users WHERE YEAR(create_time) = 2024', false);
analyzeIndexUsage('改写后',
  'SELECT * FROM users WHERE create_time >= 2024-01-01 AND create_time < 2025-01-01', true);

analyzeIndexUsage('隐式类型转换',
  'SELECT * FROM users WHERE phone = 13800138000 (字符串列传数字)', false);

analyzeIndexUsage('LIKE 左通配',
  'SELECT * FROM users WHERE name LIKE %tom%', false);
analyzeIndexUsage('LIKE 右通配',
  'SELECT * FROM users WHERE name LIKE tom%', true);

// ============================================================
// 演示 4：深分页优化对比
// ============================================================
console.log('\\n===== 演示 4：深分页代价对比 =====');

function deepPaginationCost(offset, limit) {
  // 普通分页：需要扫描 offset+limit 行
  const normalRows = offset + limit;
  const normalCost = normalRows * 1.0;

  // 游标分页：只扫描 limit 行
  const cursorRows = limit;
  const cursorCost = cursorRows * 1.0;

  return { normalCost, cursorCost, ratio: (normalCost / cursorCost).toFixed(1) };
}

console.log('LIMIT 10, 10:', deepPaginationCost(10, 10));
console.log('LIMIT 10000, 10:', deepPaginationCost(10000, 10));
console.log('LIMIT 1000000, 10:', deepPaginationCost(1000000, 10));
console.log('→ 深分页时游标分页优势巨大');

// ============================================================
// 演示 5：JOIN 驱动表选择
// ============================================================
console.log('\\n===== 演示 5：JOIN 驱动表选择 =====');

const smallTable = new Table('small', 100, [{ name: 'PRIMARY', columns: ['id'], unique: true }]);
const bigTable = new Table('big', 1000000,
  [{ name: 'PRIMARY', columns: ['id'], unique: true }, { name: 'idx_sid', columns: ['sid'], unique: false }],
  [{ name: 'id', type: 'BIGINT', cardinality: 1000000 }, { name: 'sid', type: 'BIGINT', cardinality: 100 }]
);

function joinCost(driverRows, drivenRowsPerQuery, drivenHasIndex) {
  // 驱动表全扫描 + 被驱动表每次走索引或全扫描
  const drivenPerRow = drivenHasIndex ? 1 : drivenRowsPerQuery;
  return driverRows + driverRows * drivenPerRow * 0.1;
}

console.log('小表驱动大表（big.sid 有索引）:');
console.log('  代价 =', joinCost(100, 1000, true), '（小表 100 行 × 大表索引查找）');
console.log('大表驱动小表（小表.id 有索引）:');
console.log('  代价 =', joinCost(1000000, 1, true), '（大表 100 万行扫描）');
console.log('→ 小表驱动大表明显更优');

console.log('\\n===== 演示结束 =====');
`,
  },
  // ==================== 第五章：NoSQL 与 CAP 理论 ====================
  {
    id: 'backend-nosql',
    group: '数据存储',
    icon: '🌐',
    title: 'NoSQL 与 CAP 理论',
    content: `
# NoSQL 与 CAP 理论

## 一、NoSQL 的兴起：关系型数据库并非万能

### 1.1 关系型数据库的局限

关系型数据库（RDBMS）统治数据存储领域数十年，但在互联网时代遇到了瓶颈：

1. **扩展性**：单机容量有限，分库分表复杂。RDBMS 天生为单机设计，水平扩展困难
2. **Schema 刚性**：表结构固定，修改成本高（ALTER TABLE 在大表上耗时）。互联网业务变化快，需要灵活 Schema
3. **大数据场景**：海量数据下 JOIN 性能急剧下降，关系模型的优势变成劣势
4. **高并发写入**：单机事务 ACID 保证在分布式环境下代价高昂

2000 年后，Google（BigTable）、Amazon（Dynamo）等公司面对超大规模数据，开始探索非关系型存储方案。2009 年，\`NoSQL\` 一词被正式提出，标志着 NoSQL 运动的兴起。

### 1.2 NoSQL 的核心特征

| 特征 | 说明 |
|------|------|
| 非关系型 | 不使用表/行/列的二维模型 |
| 无 Schema 或弱 Schema | 数据结构灵活 |
| 水平可扩展 | 设计上支持分布式 |
| BASE 语义 | 最终一致性而非强一致 |
| 高并发 | 简化的事务模型，高吞吐 |

### 1.3 NoSQL 四大分类

| 类型 | 代表 | 数据模型 | 适用场景 |
|------|------|---------|---------|
| 键值（Key-Value） | Redis、DynamoDB、Memcached | key→value | 缓存、会话、计数器 |
| 文档（Document） | MongoDB、CouchDB | JSON/BSON 文档 | 内容管理、用户画像 |
| 列族（Column-Family） | Cassandra、HBase | 行键→列族→列 | 时序数据、日志、宽表 |
| 图（Graph） | Neo4j、JanusGraph | 节点+边+属性 | 社交网络、推荐、知识图谱 |

此外还有 **NewSQL**（TiDB、CockroachDB、Spanner），试图融合 RDBMS 的 ACID 与 NoSQL 的扩展性。

### 1.4 SQL vs NoSQL：不是替代，而是互补

\`\`\`
关系型数据库          NoSQL
  ├ 事务强一致         ├ 高扩展
  ├ 复杂查询           ├ 高并发
  ├ 固定结构           ├ 灵活结构
  └ 单机为主           └ 分布式为主
\`\`\`

实际架构中常常混合使用：核心交易用 RDBMS，缓存用 Redis，日志用 Elasticsearch，社交关系用 Neo4j，大文件用对象存储。**选型不是"哪个更好"，而是"哪个更适合这个场景"**。

---

## 二、CAP 理论：分布式系统的根本性权衡

### 2.1 CAP 三要素

CAP 是分布式系统设计的基石理论，由 Eric Brewer 于 2000 年提出：

- **C（Consistency，一致性）**：所有节点同一时刻看到相同数据。读操作总能返回最新写入值
- **A（Availability，可用性）**：系统持续可用，每个请求都能收到非错误响应（不保证是最新数据）
- **P（Partition tolerance，分区容错性）**：网络分区时系统仍能运作

### 2.2 CAP 的选择

Brewer 定理指出：**在网络分区发生时，只能在 C 和 A 之间选一个**。

\`\`\`
网络正常时：C + A + P 可以同时满足
网络分区时：必须放弃 C 或 A

  ┌─────────────┐
  │  CP 系统    │  放弃 A：分区时拒绝服务，保证一致
  │ (一致性优先) │  例：Zookeeper、etcd、HBase、MongoDB(主从)
  └─────────────┘

  ┌─────────────┐
  │  AP 系统    │  放弃 C：分区时继续服务，可能返回旧数据
  │ (可用性优先) │  例：Cassandra、DynamoDB、Eureka、Redis集群
  └─────────────┘

  ┌─────────────┐
  │  CA 系统    │  不允许分区 → 实际是单机系统
  │ (传统RDBMS)  │  例：单机 MySQL
  └─────────────┘
\`\`\`

因为网络分区在分布式系统中**不可避免**，所以 P 是必须的。真正的选择是 CP 还是 AP。

### 2.3 CP vs AP 的决策

| 维度 | CP | AP |
|------|----|----|
| 一致性 | 强一致 | 最终一致 |
| 分区时 | 拒绝服务 | 继续服务（可能旧数据） |
| 适用 | 配置中心、金融主库 | 缓存、社交feed、计数 |
| 代表 | Zookeeper、etcd | Cassandra、DynamoDB |

**金融场景**：宁可不可用也不能数据不一致 → CP
**社交场景**：暂时不一致可接受，不能不可用 → AP

### 2.4 CAP 的常见误解

1. **"三选二"是误导**：不是任意选两个，而是 P 必选，再在 C/A 间权衡
2. **C 不是"永远一致"**：是无分区时一致，分区时才需要抉择
3. **A 不是"100%可用"**：是"非分区时尽量可用"
4. **现代系统可调**：如 Cassandra 可调一致性级别，在 C/A 间滑动

---

## 三、BASE 理论：最终一致性

CAP 选择了 AP 后，需要一种实践哲学，BASE 应运而生。

- **B（Basically Available，基本可用）**：允许损失部分可用性（响应时间增加、降级服务）
- **S（Soft State，软状态）**：允许数据存在中间状态（如"同步中"），不要求每刻都一致
- **E（Eventually Consistent，最终一致性）**：系统保证最终数据会一致，但中间时刻可能不一致

### 3.1 最终一致性的变体

| 类型 | 含义 | 示例 |
|------|------|------|
| 因果一致性 | 有因果关系的写按序可见 | A 发帖→B 评论，B 的评论一定在 A 之后可见 |
| 读己之写 | 自己能读到自己的写 | 用户改头像后自己立即看到新头像 |
| 会话一致性 | 同一会话内一致 | 同一用户登录期间读一致 |
| 单调读 | 后续读不会看到更旧的值 | 不会"今天看到10条，明天变5条" |
| 单调写 | 同一来源的写按序 | 不会乱序 |

### 3.2 一致性级别（以 Cassandra 为例）

\`\`\`
ONE:        只等 1 个副本响应 → 最快，最弱
QUORUM:     等多数副本响应 → 平衡
ALL:        等所有副本响应 → 最慢，最强
LOCAL_ONE:  本数据中心 1 个 → 多 DC 优化
\`\`\`

读写都用 QUORUM 时，可保证强一致（R + W > N）。

---

## 四、键值数据库

### 4.1 Redis

Redis 是最流行的内存键值数据库，单线程模型（6.0 后 IO 多线程）、丰富数据结构。

**数据结构**：
- String：缓存、计数器、分布式锁
- Hash：对象存储
- List：消息队列、最新列表
- Set：标签、共同好友
- ZSet（有序集合）：排行榜、延迟队列
- Stream：消息流（5.0+）

**持久化**：
- RDB：快照，恢复快，可能丢数据
- AOF：追加日志，更安全，文件大
- 混合：RDB + AOF 增量

**集群**：
- 主从复制：读写分离
- Sentinel：哨兵自动故障转移
- Cluster：分片集群（16384 槽位）

\`\`\`bash
# Redis 基本操作
SET user:1001:name "tom"           # String
HSET user:1001 name "tom" age 20   # Hash
LPUSH messages "hello"             # List
ZADD rank 100 "player1"            # ZSet
\`\`\`

### 4.2 DynamoDB

AWS 的托管键值/文档数据库，AP 系统。
- 自动分片、自动扩缩容
- 单毫秒级延迟
- 最终一致读（默认）vs 强一致读（可选，更贵）
- DAX 加速层提供微秒级读

### 4.3 应用场景

| 场景 | 数据结构 | 理由 |
|------|---------|------|
| 缓存 | String | 内存快，减少 DB 压力 |
| 会话 | String/Hash | 短期、高频访问 |
| 排行榜 | ZSet | 天然有序 |
| 分布式锁 | String + 过期 | 原子 SETNX |
| 计数器 | String + INCR | 原子自增 |
| 限流 | List/ZSet | 滑动窗口 |

---

## 五、文档数据库

### 5.1 MongoDB

最流行的文档数据库，BSON（Binary JSON）格式存储。

**特点**：
- 无 Schema（可选验证）
- 丰富的查询语言（支持聚合管道）
- 二级索引
- 内置分片和副本集
- 支持事务（4.0+，副本集；4.2+ 分片）

**数据模型**：
\`\`\`javascript
// 用户文档
{
  _id: ObjectId("..."),
  name: "tom",
  age: 20,
  address: {
    city: "beijing",
    street: "zhongguancun"
  },
  tags: ["vip", "active"],
  orders: [
    { id: 1, amount: 100 },
    { id: 2, amount: 200 }
  ]
}
\`\`\`

嵌套文档减少了 JOIN，适合"聚合根"模式的数据。

**聚合管道**：
\`\`\`javascript
db.orders.aggregate([
  { $match: { status: "paid" } },
  { $group: { _id: "$user_id", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } },
  { $limit: 10 }
]);
\`\`\`

### 5.2 模式设计

文档数据库虽然无 Schema，但仍有设计模式：

**嵌入 vs 引用**：
\`\`\`javascript
// 嵌入：适合"一起读"、1对少
{
  user: "tom",
  addresses: [{ city: "bj" }, { city: "sh" }]
}

// 引用：适合"多对多"、独立更新
{ user: "tom", address_ids: [1, 2] }
// addresses 集合单独存
\`\`\`

**原则**：
- 一起读的数据 → 嵌入
- 频繁独立更新 → 引用
- 无限增长的数组 → 引用（避免文档膨胀）

---

## 六、列族数据库

### 6.1 数据模型

列族数据库把数据按"行键→列族→列"组织，适合宽表和稀疏数据。

\`\`\`
行键       列族: info        列族: stats
user:1     name="tom"        login_count=100
           age=20            last_login="2024-01-01"
           (无 city，稀疏)    (无 score，稀疏)

user:2     name="jerry"      login_count=50
           city="sh"          score=95
\`\`\`

同一列族的数据物理上连续存储，适合按列族查询。

### 6.2 Cassandra

Dynamo（AP）+ BigTable（数据模型）的融合。

**特点**：
- AP 系统，最终一致
- 无主架构（去中心化），任何节点都可读写
- 一致性可调（ONE/QUORUM/ALL）
- 用一致性哈希分区
- LSM-Tree 存储（写优化）

**CQL（Cassandra Query Language）**：
\`\`\`sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  name TEXT,
  age INT
);
INSERT INTO users (user_id, name, age) VALUES (uuid(), 'tom', 20);
SELECT * FROM users WHERE user_id = ?;
\`\`\`

### 6.3 HBase

基于 HDFS 的列族数据库，CP 系统。

**特点**：
- 强一致（单行事务）
- 适合海量数据（PB 级）
- 依赖 Hadoop 生态
- 行级 ACID

**适用**：时序数据、日志、海量宽表。

---

## 七、图数据库

### 7.1 数据模型

图数据库用"节点 + 边 + 属性"建模，天然适合关系密集型数据。

\`\`\`
节点: (user:tom), (user:jerry), (movie:matrix)
边:   (tom)-[:KNOWS]->(jerry)
      (tom)-[:LIKES {rating:5}]->(matrix)
\`\`\`

### 7.2 Neo4j Cypher

\`\`\`cypher
// 创建
CREATE (tom:Person {name: "tom"})
CREATE (matrix:Movie {title: "Matrix"})
CREATE (tom)-[:LIKES {rating: 5}]->(matrix)

// 查询：tom 的朋友喜欢的电影
MATCH (tom:Person {name: "tom"})-[:KNOWS]-(friend)-[:LIKES]->(movie)
RETURN movie.title, count(friend) AS likeCount
ORDER BY likeCount DESC
\`\`\`

### 7.3 适用场景

- 社交网络（好友推荐、关系链）
- 推荐系统（"喜欢这个的人也喜欢"）
- 欺诈检测（关联分析）
- 知识图谱
- 路径规划（最短路径）

图数据库在多跳关系查询上比关系型数据库快几个数量级，因为不需要 JOIN。

---

## 八、NewSQL：鱼与熊掌兼得

NewSQL 试图同时获得 RDBMS 的 ACID 和 NoSQL 的水平扩展。

### 8.1 代表系统

| 系统 | 公司 | 特点 |
|------|------|------|
| Google Spanner | Google | 全球分布式，强一致（TrueTime） |
| TiDB | PingCAP | 兼容 MySQL，HTAP（行列混合） |
| CockroachDB | Cockroach Labs | 兼容 PostgreSQL，强一致 |
| OceanBase | 蚂蚁 | 金融级， Paxos 复制 |

### 8.2 TiDB 架构

\`\`\`
TiDB Server (SQL 层，无状态)
    │
    ├── TiKV (存储层，分布式 KV，Raft 复制)
    │
    └── TiFlash (列存，HTAP 分析)
\`\`\`

- 计算与存储分离
- 自动分片（Region）
- Raft 多副本强一致
- 兼容 MySQL 协议

### 8.3 何时用 NewSQL

- 需要水平扩展 + 强一致事务
- 数据量超过单机 RDBMS 容量
- 不想引入分库分表中间件的复杂性
- 有 HTAP（事务+分析）需求

代价：运维复杂、资源开销大、延迟比单机 RDBMS 高。

---

## 九、多语言对照

### 9.1 Redis 客户端

\`\`\`java
// Java Jedis
Jedis jedis = new Jedis("localhost");
jedis.set("key", "value");
String val = jedis.get("key");
\`\`\`

\`\`\`go
// Go go-redis
rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
val, err := rdb.Get(ctx, "key").Result()
\`\`\`

\`\`\`python
# Python redis-py
r = redis.Redis(host='localhost')
r.set('key', 'value')
val = r.get('key')
\`\`\`

\`\`\`javascript
// Node.js ioredis
const Redis = require('ioredis');
const redis = new Redis();
await redis.set('key', 'value');
const val = await redis.get('key');
\`\`\`

### 9.2 MongoDB 客户端

\`\`\`java
// Java
MongoClient client = new MongoClient("localhost");
MongoCollection<Document> col = client.getDatabase("test").getCollection("users");
col.insertOne(new Document("name", "tom"));
\`\`\`

\`\`\`python
# Python PyMongo
client = pymongo.MongoClient("localhost")
col = client.test.users
col.insert_one({"name": "tom"})
\`\`\`

---

## 十、选型指南

### 10.1 决策树

\`\`\`
是否需要强一致事务？
  ├ 是 → 数据量？
  │      ├ 单机可承载 → MySQL/PostgreSQL
  │      └ 需要扩展 → TiDB/CockroachDB (NewSQL)
  └ 否 → 数据模型？
         ├ 简单键值 → Redis/DynamoDB
         ├ 文档/嵌套 → MongoDB/CouchDB
         ├ 海量宽表/时序 → Cassandra/HBase
         └ 关系密集 → Neo4j
\`\`\`

### 10.2 常见场景对照

| 场景 | 推荐选型 | 理由 |
|------|---------|------|
| 电商核心交易 | MySQL/TiDB | 强一致事务 |
| 商品详情缓存 | Redis | 高性能 |
| 用户行为日志 | Cassandra/Elasticsearch | 海量写 |
| 社交关系链 | Neo4j | 关系查询 |
| 商品目录 | MongoDB | 灵活属性 |
| 实时排行榜 | Redis ZSet | 有序+高性能 |
| 时序监控 | InfluxDB/TDengine | 时序优化 |
| 全文搜索 | Elasticsearch | 倒排索引 |

### 10.3 避免的坑

1. **不要用 Redis 当主库**：内存贵、持久化不如磁盘可靠
2. **不要用 MongoDB 做强事务**：事务支持有限，性能有损耗
3. **不要盲目 NoSQL**：RDBMS 仍是大多数业务的最优解
4. **注意数据建模**：NoSQL 不是"不用设计"，反而更需要针对查询建模
5. **关注运维成本**：分布式系统运维远比单机复杂

---

## 十一、CAP 实践：一致性 vs 可用性的真实权衡

### 11.1 注册中心的选择

**Zookeeper（CP）**：选举期间不可用。服务发现场景下，宁可返回旧列表也不要拒绝服务 → AP 更合适。

**Eureka（AP）**：分区时各节点独立服务，可能列表不一致，但可用性高。Netflix 选择 Eureka 正是因为服务发现场景 AP 优于 CP。

**Nacos**：同时支持 AP 和 CP 模式，可切换。

### 11.2 分布式锁的选择

**Redis（AP 倾向）**：Redlock 算法在极端情况下可能失效（时钟漂移）。性能高但非绝对可靠。

**Zookeeper/etcd（CP）**：基于 ZAB/Raft，更可靠但性能较低。适合"宁慢勿错"的场景。

### 11.3 订单系统的选择

核心交易必须强一致 → CP（关系型数据库 + 分布式事务）。
订单查询、商品展示可最终一致 → AP（缓存 + 异步同步）。

---

## 十二、一致性哈希：分布式存储的基础

NoSQL 普遍用一致性哈希做数据分片。

### 12.1 为什么不用取模

\`\`\`
N 个节点，key % N 分片
节点数变化（N→N+1）时，几乎所有 key 需要迁移！
\`\`\`

### 12.2 一致性哈希

\`\`\`
把哈希空间组织成环（0 ~ 2^32-1）
节点和 key 都映射到环上
key 顺时针找到的第一个节点即归属

节点变化时，只影响相邻区间的 key
\`\`\`

引入**虚拟节点**解决数据倾斜：每个物理节点对应多个虚拟节点，让分布更均匀。

### 12.3 多语言伪代码

\`\`\`python
# Python
import hashlib
class ConsistentHash:
    def __init__(self, nodes, virtual=150):
        self.ring = {}
        for node in nodes:
            for i in range(virtual):
                key = f"{node}:{i}"
                h = int(hashlib.md5(key.encode()).hexdigest(), 16)
                self.ring[h] = node
        self.sorted_keys = sorted(self.ring.keys())

    def get_node(self, key):
        h = int(hashlib.md5(key.encode()).hexdigest(), 16)
        for k in self.sorted_keys:
            if k >= h:
                return self.ring[k]
        return self.ring[self.sorted_keys[0]]
\`\`\`

---

## 十三、最佳实践与陷阱

### 13.1 NoSQL 设计原则

1. **面向查询建模**：先想清楚查询，再设计数据结构
2. **适当冗余**：用空间换时间，减少跨节点查询
3. **控制文档大小**：MongoDB 文档建议 < 16MB
4. **合理设置 TTL**：避免数据无限增长
5. **监控热点**：分片键选择不当会导致热点

### 13.2 常见陷阱

**陷阱1：用 Redis 存大对象**
\`\`\`
存 1MB 的 JSON → 网络传输慢、阻塞其他请求
→ 拆分或用 Hash 分字段
\`\`\`

**陷阱2：MongoDB 无限制嵌套**
\`\`\`
用户文档内嵌百万订单 → 文档膨胀，查询慢
→ 改用引用，订单独立集合
\`\`\`

**陷阱3：Cassandra 主键设计不当**
\`\`\`
PRIMARY KEY (user_id)  → user_id 基数低时数据倾斜
→ 加 clustering key 分散
\`\`\`

**陷阱4：忽视最终一致性的业务影响**
\`\`\`
用户改头像 → 缓存未及时更新 → 用户困惑
→ 用"读己之写"一致性或主动刷新
\`\`\`

### 13.3 混合架构

现代系统很少只用一种存储，典型组合：

\`\`\`
用户请求 → CDN → 负载均衡 → 应用层
                              ├ MySQL（核心交易）
                              ├ Redis（缓存/会话）
                              ├ MongoDB（商品/内容）
                              ├ Elasticsearch（搜索）
                              ├ Cassandra（日志/时序）
                              └ Kafka（异步解耦）
\`\`\`

数据在不同存储间同步是难点，常用 CDC（Change Data Capture，如 Debezium）+ Kafka 实现。

---

## 十四、面试高频题

**Q1：CAP 怎么选？**
看业务：金融/配置选 CP，社交/缓存选 AP。因为网络分区不可避免，P 必选，在 C/A 间权衡。

**Q2：最终一致性多久能一致？**
取决于复制延迟，通常毫秒到秒级。可用读己之写一致性保证用户立即看到自己的修改。

**Q3：Redis 为什么快？**
内存操作 + 单线程避免锁竞争 + IO 多路复用 + 高效数据结构。

**Q4：MongoDB 什么时候用嵌入，什么时候用引用？**
一起读、1对少、不频繁独立更新 → 嵌入；多对多、无限增长、独立更新 → 引用。

**Q5：NewSQL 能替代 RDBMS 吗？**
在需要水平扩展的场景可以。但单机性能、运维成本、延迟方面，RDBMS 仍有优势。大多数业务 RDBMS 足够。

**Q6：一致性哈希为什么需要虚拟节点？**
解决数据倾斜。节点少时，环上分布不均，虚拟节点让每个物理节点对应多个位置，分布更均匀。

---

## 十五、Redis 深度剖析

### 15.1 Redis 为什么快

\`\`\`
1. 纯内存操作：数据在内存中，读写速度纳秒级
2. 单线程模型：避免多线程上下文切换和锁竞争
3. IO 多路复用：epoll 实现高并发连接处理
4. 高效数据结构：SDS、ziplist、skiplist 等专为性能设计
5. 6.0 后 IO 多线程：网络读写多线程，命令执行仍单线程
\`\`\`

### 15.2 Redis 数据结构内部实现

| 类型 | 编码 | 说明 |
|------|------|------|
| String | int/embstr/raw | 整数用 int，短字符串 embstr，长字符串 raw |
| Hash | ziplist/hashtable | 小且少元素用 ziplist（省内存），大用 hashtable |
| List | quicklist | ziplist 组成的双向链表 |
| Set | intset/hashtable | 全整数用 intset，否则 hashtable |
| ZSet | ziplist/skiplist+hashtable | 小用 ziplist，大用 skiplist（有序）+ hashtable（查找） |

### 15.3 Redis 持久化详解

**RDB（快照）**：
\`\`\`
触发方式:
  - 手动: SAVE / BGSAVE
  - 自动: save 900 1 (900秒内1次修改则快照)

流程:
  1. fork 子进程（写时复制 COW）
  2. 子进程遍历所有数据写入临时 RDB 文件
  3. 替换旧 RDB 文件

优点: 恢复快、文件小
缺点: 可能丢失最近一次快照后的数据
\`\`\`

**AOF（追加日志）**：
\`\`\`
触发策略:
  - always: 每条命令都 fsync（最安全，最慢）
  - everysec: 每秒 fsync（默认，平衡）
  - no: 由 OS 决定（最快，可能丢更多）

AOF 重写:
  - 后台整理 AOF 文件，消除冗余命令
  - 如 INCR 100 次 → 一条 SET final_value

优点: 数据安全性高
缺点: 文件大、恢复慢
\`\`\`

**混合持久化（4.0+）**：
\`\`\`
AOF 重写时，先写 RDB 格式的全量数据，再追加增量 AOF
兼顾恢复速度和数据安全
\`\`\`

### 15.4 Redis 集群

**主从复制**：
\`\`\`
全量同步:
  1. 从节点发送 PSYNC 命令
  2. 主节点执行 BGSAVE 生成 RDB
  3. 主节点发送 RDB 给从节点
  4. 从节点加载 RDB
  5. 主节点发送缓冲区中的增量命令

增量同步:
  1. 从节点断线重连
  2. 如果 offset 在 backlog 中 → 只传缺失部分
  3. 否则全量同步
\`\`\`

**Sentinel 哨兵**：
\`\`\`
功能:
  - 监控主从节点状态
  - 自动故障转移
  - 通知客户端新主节点

故障转移流程:
  1. 哨兵 ping 主节点超时 → 标记主观下线
  2. 多数哨兵同意 → 标记客观下线
  3. 选举 leader 哨兵
  4. 选最优从节点提升为主
  5. 通知其他从节点跟随新主
  6. 通知客户端
\`\`\`

**Cluster 分片**：
\`\`\`
架构:
  - 16384 个哈希槽（hash slot）
  - 每个节点负责一部分槽
  - key → CRC16(key) % 16384 → 槽号 → 节点

特点:
  - 去中心化（无 Sentinel）
  - 节点间 Gossip 协议通信
  - 支持自动故障转移
  - 客户端缓存槽位映射

限制:
  - 不支持跨槽事务
  - multi-key 操作需在同一槽（hash tag）
  - 最大 1000 个节点
\`\`\`

### 15.5 Redis 常见问题

**缓存穿透**：查询不存在的 key，直接打到 DB。
\`\`\`
解决: 布隆过滤器 / 缓存空值
\`\`\`

**缓存击穿**：热点 key 过期瞬间，大量请求打到 DB。
\`\`\`
解决: 互斥锁重建 / 热点 key 永不过期
\`\`\`

**缓存雪崩**：大量 key 同时过期。
\`\`\`
解决: 过期时间加随机值 / 多级缓存
\`\`\`

---

## 十六、MongoDB 深度剖析

### 16.1 MongoDB 分片

\`\`\`
组件:
  - mongos: 路由进程，接收请求并路由到分片
  - config server: 存储元数据（分片信息）
  - shard: 实际数据存储（每个是一个 replica set）

分片键:
  - 范围分片：适合范围查询，但可能热点
  - 哈希分片：均匀分散，但不支持范围查询
  - 复合分片：多列组合

chunk 迁移:
  - 当 chunk 大小超过阈值（默认 64MB）
  - balancer 自动迁移 chunk 到其他分片
  - 迁移过程对应用透明
\`\`\`

### 16.2 MongoDB 副本集

\`\`\`
角色:
  - Primary: 接受读写
  - Secondary: 同步 Primary 数据，可接受读
  - Arbiter: 只参与选举，不存数据

选举:
  - Primary 宕机 → Secondary 发起选举
  - 多数派同意 → 提升为 Primary
  - 少数派则继续等待

写关注（Write Concern）:
  - w=0: 不等待确认（最快，可能丢）
  - w=1: 等待 Primary 确认（默认）
  - w=majority: 等待多数节点确认（最安全）
\`\`\`

### 16.3 MongoDB 索引

\`\`\`
索引类型:
  - 单字段索引
  - 复合索引
  - 多键索引（数组字段）
  - 文本索引（全文搜索）
  - 地理空间索引
  - TTL 索引（自动过期）
  - 哈希索引（分片用）

explain:
  db.col.find({...}).explain("executionStats")
  - winningPlan: 选中的执行计划
  - executionStats.totalDocsExamined: 扫描文档数
  - 理想: totalDocsExamined ≈ 返回行数
\`\`\`

---

## 十七、Cassandra 深度剖析

### 17.1 架构特点

\`\`\`
去中心化:
  - 无主节点，所有节点平等
  - 任何节点都可接收读写请求
  - Gossip 协议传播集群状态

数据分布:
  - 一致性哈希分区
  - 每个节点负责一段 token 范围
  - 虚拟节点（vnode）解决数据倾斜

复制:
  - SimpleStrategy: 简单顺序复制
  - NetworkTopologyStrategy: 按 DC/Rack 拓扑复制
  - replication_factor=3 → 每行存 3 个副本
\`\`\`

### 17.2 读写流程

**写流程**：
\`\`\`
1. 客户端发送写请求到任意节点（Coordinator）
2. Coordinator 根据分区键确定目标节点
3. 写入目标节点的 MemTable + CommitLog
4. 根据 consistency level 等待 N 个副本确认
5. MemTable 满后 flush 到 SSTable

写速度快的秘密:
  - 顺序写 CommitLog
  - 内存写 MemTable
  - 后台异步 flush
\`\`\`

**读流程**：
\`\`\`
1. Coordinator 确定目标副本
2. 根据 consistency level 选择副本数
3. 读多个副本（或读 + 修复）
4. 返回最新版本

读修复:
  - 发现副本间数据不一致
  - 触发后台修复
  - 保证最终一致
\`\`\`

### 17.3 LSM-Tree

\`\`\`
Cassandra 使用 LSM-Tree（Log-Structured Merge-Tree）:
  MemTable(内存) → SSTable(磁盘)

写入:
  → 写 MemTable + CommitLog
  → MemTable 满 → flush 成 SSTable

读取:
  → 先查 MemTable
  → 再查各层 SSTable（从新到旧）
  → 布隆过滤器加速判断

Compaction:
  - 多个 SSTable 合并
  - 清理已删除数据（tombstone）
  - 减少读放大
  - STCS / LCS / TWCS 策略
\`\`\`

---

## 十八、分布式共识算法

### 18.1 Paxos

\`\`\`
角色:
  - Proposer: 提出提案
  - Acceptor: 接受/拒绝提案
  - Learner: 学习已确定的值

两阶段:
  1. Prepare: Proposer 发提案编号，Acceptor 承诺不再接受更小编号
  2. Accept: Proposer 发提案内容，Acceptor 接受

特点:
  - 理论完备但实现复杂
  - 多数派达成一致
  - 可容忍少数节点故障
\`\`\`

### 18.2 Raft

\`\`\`
角色:
  - Leader: 处理所有写请求
  - Follower: 被动接收 Leader 日志
  - Candidate: 选举中的 Follower

选举:
  1. Follower 超时未收到心跳 → 变 Candidate
  2. Candidate 请求投票
  3. 获多数票 → 成为 Leader
  4. Leader 定期发心跳维持地位

日志复制:
  1. Leader 收到写请求
  2. 写入本地日志
  3. 复制到 Follower
  4. 多数确认后 commit
  5. 通知 Follower commit

优势（相比 Paxos）:
  - 更易理解和实现
  - 强 Leader 模型
  - etcd / TiKV / CockroachDB 都用 Raft
\`\`\`

### 18.3 共识算法对比

| 维度 | Paxos | Raft | ZAB |
|------|-------|------|-----|
| 理解难度 | 高 | 中 | 中 |
| Leader | 可选 | 必须 | 必须 |
| 应用 | 理论基础 | etcd/TiKV | Zookeeper |
| 日志 | 无序 | 有序 | 有序 |

---

## 十九、一致性模式详解

### 19.1 读己之写（Read Your Writes）

\`\`\`
用户 A 写入数据 → 同步到副本可能有延迟 → 用户 A 立即读取可能读到旧值

解决:
  - 粘性会话：始终路由到同一节点
  - 读主库：用户自己的写后读走主库
  - 会话级别一致性
\`\`\`

### 19.2 单调读（Monotonic Reads）

\`\`\`
用户第一次读到新值（从副本1），第二次读到旧值（从副本2）
→ 用户感觉"时间倒流"

解决:
  - 粘性会话：始终从同一副本读
  - 记录已读时间戳：只读 >= 该时间戳的数据
\`\`\`

### 19.3 单调写（Monotonic Writes）

\`\`\`
用户 A 先写 x=1 再写 x=2
如果两个写到了不同副本且复制顺序不一致 → 可能最终 x=1

解决:
  - 同一用户的写路由到同一节点
  - 序列号保证顺序
\`\`\`

### 19.4 Quorum 机制

\`\`\`
N 个副本，写 W 个，读 R 个
如果 W + R > N → 读到的副本中必有一个有最新写入 → 强一致

常见配置:
  N=3, W=2, R=2 → 强一致（QUORUM）
  N=3, W=1, R=1 → 最终一致（ONE）
  N=3, W=3, R=1 → 写慢读快（ALL/ONE）
  N=3, W=1, R=3 → 写快读慢（ONE/ALL）
\`\`\`

---

## 二十、数据建模模式

### 20.1 键值数据库建模

\`\`\`
原则: key 设计要支持高效查询

模式1: 对象存储
  key: user:1001 → value: JSON string
  key: user:1001:name → value: "tom" (精细控制)

模式2: 计数器
  key: counter:page:home → value: 整数 (INCR)

模式3: 时间序列
  key: metric:cpu:202401011200 → value: 85
  key: metric:cpu:202401011201 → value: 87

模式4: 标签
  key: tag:tech → SET of item_ids
  key: tag:design → SET of item_ids
  SINTER tag:tech tag:design → 交集
\`\`\`

### 20.2 文档数据库建模

\`\`\`
模式1: 聚合根嵌入
  {
    _id: "order:1001",
    user: { name: "tom", phone: "..." },
    items: [{ sku: "A", qty: 2 }, ...],
    address: { city: "bj", ... }
  }
  → 一次读取出完整订单，无需 JOIN

模式2: 引用
  {
    _id: "order:1001",
    user_id: "user:1001",
    item_ids: ["item:1", "item:2"]
  }
  → 独立更新，但需要多次查询

模式3: 预计算
  {
    _id: "user:1001",
    name: "tom",
    order_count: 5,        // 预计算字段
    total_amount: 1500     // 预计算字段
  }
  → 避免实时聚合
\`\`\`

### 20.3 列族数据库建模

\`\`\`
原则: 查询驱动的建模

模式1: 宽行
  RowKey: user:1001
    info:name = "tom"
    info:age = "20"
    stats:login_count = "100"
    stats:order_count = "5"
  → 一次查询获取用户全部信息

模式2: 时间序列
  RowKey: user:1001:20240101
    h00 = "active"
    h01 = "active"
    h02 = "idle"
  → 按天分区，高效范围查询

模式3: 反转时间戳
  RowKey: user:1001 + (Long.MAX - timestamp)
  → 最新数据排在最前
\`\`\`

### 20.4 图数据库建模

\`\`\`
模式1: 直接映射
  (User:tom)-[:FRIENDS_WITH]->(User:jerry)
  (User:tom)-[:LIKES]->(Movie:matrix)

模式2: 属性图
  (User {name:"tom", age:20})-[:KNOWS {since:2020}]->(User {name:"jerry"})

查询示例: 推荐朋友的朋友
  MATCH (me:User {name:"tom"})-[:FRIENDS_WITH*2]-(fof)
  WHERE NOT (me)-[:FRIENDS_WITH]-(fof)
  RETURN fof.name
\`\`\`

---

## 二十一、真实架构案例

### 21.1 电商系统混合存储

\`\`\`
商品详情:
  MySQL: 商品基本信息（强一致）
  MongoDB: 商品详情/评价（灵活结构）
  Redis: 商品详情缓存（高性能）
  Elasticsearch: 商品搜索（全文检索）

订单系统:
  MySQL: 核心交易（强一致）
  Redis: 库存预扣（高性能）
  Kafka: 异步通知/日志

用户系统:
  MySQL: 用户基本信息
  Redis: 会话/Token
  Neo4j: 社交关系链

日志系统:
  Kafka: 日志采集
  Cassandra: 日志存储
  Elasticsearch: 日志搜索
\`\`\`

### 21.2 Netflix 架构（Cassandra 应用）

\`\`\`
Netflix 使用 Cassandra 存储用户观看历史:
  - 全球部署，多 DC
  - 99.99% 可用性
  - 每天写入 1000 亿+
  - 最终一致性满足需求
  - LOCAL_QUORUM 一致性级别

为什么不用 MySQL?
  - 全球部署成本高
  - 写入扩展性差
  - 最终一致性可接受
\`\`\`

### 21.3 微博热搜架构

\`\`\`
实时计算:
  Kafka: 接收用户行为流
  Flink: 实时统计话题频次
  Redis ZSet: 热搜排行榜

缓存层:
  Redis: 热搜列表缓存
  本地缓存: L1 缓存

存储层:
  MySQL: 热搜历史记录
  HBase: 原始数据归档
\`\`\`

---

## 二十二、性能基准测试

### 22.1 基准测试工具

| 工具 | 适用 | 说明 |
|------|------|------|
| redis-benchmark | Redis | Redis 自带基准测试 |
| mongoperf | MongoDB | MongoDB 性能测试 |
| YCSB | 通用 | Yahoo! 云服务基准测试 |
| sysbench | MySQL | MySQL 综合测试 |

### 22.2 典型性能数据

\`\`\`
Redis (单节点):
  - GET/SET: 10万+ QPS
  - Pipeline: 50万+ QPS
  - 内存限制: 受物理内存约束

MongoDB (单节点):
  - 读: 1-5万 QPS
  - 写: 5000-2万 QPS
  - 范围查询: 视索引而定

Cassandra (3节点):
  - 写: 5-20万 QPS
  - 读: 3-10万 QPS
  - 线性扩展

MySQL (单节点):
  - 简单查询: 1-5万 QPS
  - 复杂查询: 视索引/数据量
  - 写: 5000-2万 QPS
\`\`\`

---

## 二十三、运维与监控

### 23.1 Redis 监控

\`\`\`bash
# 关键指标
redis-cli INFO
  - used_memory: 内存使用
  - connected_clients: 连接数
  - keyspace_hits/misses: 缓存命中率
  - replication: 主从状态
  - slowlog: 慢查询

# 大 key 扫描
redis-cli --bigkeys

# 内存碎片率
redis-cli INFO memory | grep mem_fragmentation_ratio
\`\`\`

### 23.2 MongoDB 监控

\`\`\`bash
mongostat  # 实时统计
mongotop   # 集合级耗时

# 关键指标
- connections: 连接数
- opcounters: 操作计数
- metrics.document: 文档读写
- indexCounters: 索引命中率
\`\`\`

### 23.3 备份策略

\`\`\`
Redis:
  - RDB 定时备份（如每小时）
  - AOF 实时备份
  - 主从复制作为热备

MongoDB:
  - mongodump 逻辑备份
  - 文件系统快照（LVM）
  - oplog 连续备份

Cassandra:
  - nodetool snapshot 快照
  - 增量备份
\`\`\`

---

## 二十四、更多面试题

**Q7：Redis 的过期策略？**
惰性删除 + 定期删除。惰性删除：访问时检查是否过期。定期删除：后台定期扫描部分 key 删除过期项。内存满时触发淘汰策略（LRU/LFU/random）。

**Q8：MongoDB 分片键如何选择？**
高基数（值多）、低频率（分布均匀）、非单调递增（避免热点）。常用：用户 ID 哈希、复合键。

**Q9：Cassandra 为什么写快？**
LSM-Tree 顺序写、内存 MemTable、无随机写、后台异步 compaction。写只需追加日志和内存写入。

**Q10：Raft 和 Paxos 的区别？**
Raft 强 Leader，所有写经过 Leader；Paxos 可多 Proposer。Raft 日志连续有序；Paxos 日志可空洞。Raft 更易理解和实现。

**Q11：如何保证缓存与数据库一致性？**
1. Cache Aside：先更新 DB，再删缓存（最常用）
2. Write Through：写缓存同时写 DB（缓存层负责）
3. Write Behind：写缓存，异步写 DB（高性能但有风险）
4. 双删策略：更新前删缓存，更新后再删一次

**Q12：NoSQL 完全不需要 Schema 设计吗？**
错。NoSQL 虽然不强制 Schema，但数据模型设计同样重要，甚至更关键。因为 NoSQL 没有 JOIN，数据结构必须直接支持查询模式。错误的模型会导致查询低效或无法查询。

---

## 二十五、NewSQL：兼顾 SQL 与水平扩展

**NewSQL** 是新一代数据库，既保留关系模型的 ACID 与 SQL 接口，又具备 NoSQL 的水平扩展能力。

### 25.1 代表产品

| 产品 | 公司 | 特点 |
|------|------|------|
| Google Spanner | Google | 全球分布式，TrueTime API，外部一致性 |
| TiDB | PingCAP | 兼容 MySQL 协议，HTAP（行列混合） |
| CockroachDB | Cockroach Labs | 兼容 PostgreSQL，强一致，自愈 |
| OceanBase | 蚂蚁 | 金融级， Paxos，兼容 MySQL/Oracle |
| YugabyteDB | Yugabyte | 兼容 PostgreSQL/Cassandra |

### 25.2 架构原理

NewSQL 普遍采用 **计算-存储分离** 架构：

- **计算层（SQL 节点）**：无状态，解析 SQL、执行计划、可水平扩展。
- **存储层（数据节点）**：数据按 Region/Range 分片，每片 Raft 多副本。
- **调度层（PD/Zookeeper）**：管理分片位置、负载均衡、元数据。

\`\`\`
客户端 → SQL 节点(无状态,可扩) → PD(调度) → 数据节点(Raft多副本)
\`\`\`

### 25.3 TiDB 架构详解

- **TiDB Server**：SQL 层，无状态，可任意扩缩。解析 SQL、生成执行计划、下推计算到 TiKV。
- **TiKV**：分布式 KV 存储，数据按 Range 分片，每片 Raft 3 副本。事务用 Percolator 模型（两阶段，基于单点 TSO 时间戳）。
- **PD（Placement Driver）**：集群大脑，分配 Region、时间戳（TSO）、负载均衡。
- **TiFlash**：列存副本，实时同步 TiKV 行存，支持 HTAP（OLTP + OLAP 同库）。

### 25.4 vs 传统分库分表

| 维度 | 分库分表（Sharding） | NewSQL |
|------|---------------------|--------|
| 应用侵入 | 需改 SQL/路由 | 透明，无侵入 |
| 跨分片事务 | 弱/难 | 原生支持 |
| 弹性扩容 | 需迁移数据 | 自动 Region 分裂迁移 |
| 一致性 | 最终一致 | 强一致（Raft） |
| 运维 | 中间件 + 多库 | 一套集群 |

**结论**：NewSQL 适合需要强一致 + 水平扩展的场景。分库分表成熟稳定、可控性强，老系统迁移成本高时仍主流。

## 二十六、缓存架构模式深度

### 26.1 Cache Aside（旁路缓存）

最常用模式：应用同时操作缓存和 DB。

\`\`\`
读: 先查缓存 → 命中返回; 未命中查 DB → 写缓存 → 返回
写: 更新 DB → 删除缓存(非更新缓存)
\`\`\`

**为什么删缓存而非更新缓存**？

1. 避免并发更新导致缓存与 DB 不一致。
2. 懒加载，避免频繁更新未读取的数据（浪费）。
3. 缓存可能是复杂计算结果，每次更新重算代价高。

### 26.2 Read/Write Through

应用只操作缓存，缓存层负责同步读写 DB。

- **Read Through**：缓存未命中时，缓存层自己查 DB 并回填，应用无感。
- **Write Through**：写缓存时同步写 DB，操作返回即一致。

实现复杂（缓存需支持 DB 回源），Redis 本身不直接支持，需封装。

### 26.3 Write Behind（Write Back）

写缓存立即返回，异步刷 DB。性能最高但数据可能丢（缓存宕机未刷盘）。适合写量大、容忍丢失的场景（如计数、日志）。

### 26.4 缓存一致性策略对比

| 策略 | 一致性 | 性能 | 复杂度 | 适用 |
|------|--------|------|--------|------|
| Cache Aside | 最终一致 | 高 | 低 | 通用 |
| Write Through | 强一致 | 中 | 高 | 金融 |
| Write Behind | 最弱 | 最高 | 中 | 日志/计数 |

## 二十七、缓存三大问题与解决

### 27.1 缓存穿透

**现象**：查询不存在的数据（如恶意攻击 id=-1），缓存和 DB 都没有，每次穿透到 DB。

**解决**：

1. **缓存空值**：DB 查不到也缓存 \`null\`（设短 TTL 如 60s），下次直接返回。
2. **布隆过滤器**：在缓存前加布隆过滤器，请求先过过滤器，不存在直接拒绝。
3. **接口限流/参数校验**：拦截非法请求。

### 27.2 缓存击穿

**现象**：热点 key 过期瞬间，大量并发请求同时查 DB。

**解决**：

1. **互斥锁**：缓存未命中时加分布式锁，只允许一个请求查 DB 回填，其他等待。
2. **热点 key 永不过期**：逻辑过期（值内含过期时间），后台异步刷新。
3. **提前刷新**：监控 key 接近过期时主动续期。

### 27.3 缓存雪崩

**现象**：大量 key 同时过期，或缓存宕机，请求全部打到 DB。

**解决**：

1. **TTL 加随机数**：\`expire = base + random(0, 300)\`，避免同时过期。
2. **多级缓存**：本地缓存（Caffeine）+ Redis，本地缓存兜底。
3. **熔断降级**：DB 压力大时返回默认值/降级页。
4. **集群高可用**：Redis Sentinel/Cluster，避免单点宕机。

## 二十八、布隆过滤器与布谷鸟过滤器

### 28.1 布隆过滤器（Bloom Filter）

概率型数据结构，判断元素**可能存在**或**一定不存在**，有假阳性无假阴性。

**原理**：k 个哈希函数把元素映射到位数组的 k 个位置，置 1。查询时检查 k 个位是否全 1。

\`\`\`
插入: 对 x 算 k 个哈希，对应位置 1
查询: 对 x 算 k 个哈希，全 1 → 可能在；任一 0 → 一定不在
\`\`\`

**特点**：

- 空间极省（1 亿元素，1% 误判率约 114MB）。
- 不支持删除（位被多个元素共享，删 1 影响其他）。
- 假阳性率随元素增多上升。

**应用**：缓存穿透防护、爬虫 URL 去重、邮件垃圾过滤。

### 28.2 布谷鸟过滤器（Cuckoo Filter）

布隆过滤器的改进版，**支持删除**，查询更快。

**原理**：用布谷鸟哈希——每个元素有两个候选桶，插入时若两桶满则踢出已有元素到其另一候选桶（可能连锁）。每个桶存指纹（fingerprint）而非位。

**对比**：

| 维度 | 布隆 | 布谷鸟 |
|------|------|--------|
| 删除 | 不支持 | 支持 |
| 查询效率 | k 次哈希 | 2 次查找 |
| 空间 | 较省 | 略大 |
| 装载因子 | 高 | 满了会踢链，有上限 |

## 二十九、一致性哈希与虚拟节点

### 29.1 问题

N 台缓存节点，用 \`hash(key) % N\` 路由。节点增减时 N 变化，几乎所有 key 重新映射——缓存大面积失效。

### 29.2 一致性哈希

把哈希值空间组织成环（0 ~ 2^32-1），节点和 key 都映射到环上。key 顺时针找到的第一个节点即归属。

\`\`\`
节点A hash=100
节点B hash=300
节点C hash=800
key hash=150 → 归 B（顺时针下一个）
key hash=500 → 归 C
\`\`\`

**增删节点只影响相邻区间**：加节点 D(400)，只影响 (300,400] 区间的 key，其他不变。

### 29.3 虚拟节点

问题：节点少时环上分布不均，数据倾斜。

解法：每个物理节点对应 **V 个虚拟节点**（如 V=150），虚拟节点均匀散布环上。key 先到虚拟节点再到物理节点。V 越大越均匀，元数据越多。

\`\`\`
物理节点 A → 虚拟节点 A#1, A#2, ..., A#150（各自哈希散布环上）
\`\`\`

### 29.4 多语言对照

- **Java**：TreeMap 实现一致性哈希环；Guava \`Hashing.consistentHash()\`。
- **Go**：\`github.com/stathat/consistent\` 库。
- **Redis Cluster**：用 16384 个哈希槽（slot）替代环，\`CRC16(key) % 16384\` 定位槽，槽手动分配到节点。

## 三十、分库分表中间件

### 30.1 何时分库分表

- 单表数据 > 1000 万或 > 50GB，查询明显变慢。
- 单库写入 QPS > 5000，连接数/锁竞争成瓶颈。
- 单机磁盘/内存不足。

### 30.2 分片策略

- **垂直分库**：按业务拆库（用户库、订单库、商品库）。
- **垂直分表**：按列拆（热列冷列分表）。
- **水平分表**：按行拆（按 user_id 取模、按时间范围、按 hash）。

### 30.3 主流中间件

| 中间件 | 语言 | 模式 | 特点 |
|--------|------|------|------|
| ShardingSphere-JDBC | Java | Client | JDBC 增强，无额外部署 |
| ShardingSphere-Proxy | Java | Proxy | 透明代理，多语言支持 |
| MyCat | Java | Proxy | 老牌，社区活跃下降 |
| Vitess | Go | Proxy | YouTube 出品，云原生 |
| TDDL | Java | Client | 阿里内部，未开源 |

### 30.4 分库分表的坑

1. **跨库 JOIN**：无法直接 JOIN，需应用层组装或冗余字段。
2. **分布式事务**：跨库事务弱，用最终一致。
3. **全局唯一 ID**：不能用自增，用雪花算法/号段模式。
4. **分页**：\`LIMIT offset, n\` 跨分片需各分片取 offset+n 再合并，深分页灾难。
5. **聚合**：COUNT/SUM 需各分片聚合再汇总，不能直接。
6. **路由**：查询条件必须含分片键，否则全分片扫描。

## 三十一、数据库选型决策树

\`\`\`
数据量 < 1TB 且关系强 → MySQL/PostgreSQL
数据量 > 10TB 且需水平扩展 → NewSQL(TiDB) 或 分库分表
高频 KV 读写 → Redis
文档/JSON 存储 → MongoDB
时序数据 → InfluxDB/TDengine
宽列/高写入 → Cassandra/HBase
关系复杂(社交/推荐) → Neo4j
全文搜索 → Elasticsearch
\`\`\`

**复合场景**：电商常用 MySQL（核心交易）+ Redis（缓存/库存）+ ES（搜索）+ MongoDB（日志/商品详情）+ HBase（历史订单）。

## 三十二、多语言 NoSQL 客户端对比

### Redis 客户端

| 语言 | 客户端 | 特点 |
|------|--------|------|
| Java | Jedis / Lettuce / Redisson | Lettuce 异步非阻塞；Redisson 分布式锁/对象 |
| Go | go-redis | 性能高，集群支持好 |
| Python | redis-py | 异步支持 aioredis |
| Node.js | ioredis / node-redis | ioredis 功能全，Pipeline/Cluster |

### MongoDB 驱动

\`\`\`javascript
// Node.js
const { MongoClient } = require('mongodb');
const client = new MongoClient('mongodb://localhost:27017');
await client.connect();
const db = client.db('test');
const users = db.collection('users');
await users.insertOne({ name: '张三', age: 28 });
const r = await users.find({ age: { $gte: 20 } }).toArray();
\`\`\`

\`\`\`java
// Java
MongoClient mongo = MongoClients.create("mongodb://localhost:27017");
MongoDatabase db = mongo.getDatabase("test");
MongoCollection<Document> users = db.getCollection("users");
users.insertOne(new Document("name", "张三").append("age", 28));
\`\`\`

## 三十三、性能压测方法论

### 33.1 压测指标

- **QPS/TPS**：每秒查询/事务数。
- **延迟（Latency）**：P50/P95/P99 分位响应时间。P99 比 AVG 更有意义。
- **吞吐量**：单位时间处理数据量。
- **并发数**：同时在线/请求连接数。
- **错误率**：失败请求占比。

### 33.2 压测工具

| 工具 | 适用 | 特点 |
|------|------|------|
| sysbench | MySQL/PG | 标准 OLTP 基准 |
| YCSB | NoSQL | Yahoo 通用 NoSQL 基准 |
| JMeter | 通用 | 图形化，协议全 |
| wrk | HTTP | 轻量高性能 |
| redis-benchmark | Redis | 自带 |

### 33.3 压测步骤

1. **准备**：生产级配置，隔离环境，代表性数据量。
2. **预热**：先跑一轮填缓存，避免冷启动数据偏差。
3. **阶梯加压**：从低并发逐步加压，找拐点。
4. **持续稳定性**：在目标 QPS 下跑 1+ 小时，观察内存/延迟漂移。
5. **分析**：瓶颈定位（CPU/IO/网络/锁/连接数）。

### 33.4 常见瓶颈与优化

| 瓶颈 | 表现 | 优化 |
|------|------|------|
| CPU 高 | QPS 上不去 | 优化查询/索引，加节点 |
| IO 高 | 磁盘 util 100% | 加内存缓存，SSD，读写分离 |
| 连接数满 | 连接拒绝 | 连接池，调 max_connections |
| 锁等待 | 延迟抖动 | 缩短事务，降隔离级别 |
| 网络 | 带宽满 | 压缩，本地化，万兆网卡 |

---

## 本章小结

NoSQL 不是关系型数据库的"替代品"，而是"补充品"。本章系统讲解了：

- NoSQL 兴起的背景与四大分类（键值/文档/列族/图）
- CAP 理论：分布式系统在 C/A 间的根本权衡
- BASE 理论：最终一致性的实践哲学
- 一致性的多种级别（因果/读己之写/会话/单调）
- 各类 NoSQL 的代表系统与适用场景
- NewSQL 的融合之道（TiDB/Spanner）
- 选型决策树与混合架构
- 一致性哈希等分布式基础
- 常见陷阱与最佳实践

数据存储的世界广阔而精彩：关系型数据库追求 ACID 的严谨，NoSQL 追求扩展与灵活，NewSQL 试图兼得。理解每种存储的设计哲学与权衡，才能在工程中做出正确选型。至此，"数据存储"专题告一段落，希望这些知识能成为你架构设计的有力武器。
`,
    code: `
// ============================================================
// 第五章演示：NoSQL 文档存储 + CAP 分区模拟
// 实现一个简化的文档数据库与分布式节点一致性模拟
// ============================================================

// ============================================================
// 1. 简化文档数据库（类 MongoDB）
// ============================================================
class DocumentDB {
  constructor(name) {
    this.name = name;
    this.collections = new Map();
  }

  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Collection(name));
    }
    return this.collections.get(name);
  }
}

class Collection {
  constructor(name) {
    this.name = name;
    this.docs = new Map();  // _id -> document
    this.indexes = new Map();  // field -> Map(value -> Set of _id)
  }

  insert(doc) {
    const id = doc._id || Date.now() + Math.random();
    doc._id = id;
    this.docs.set(id, doc);
    // 更新索引
    for (const [field, idx] of this.indexes) {
      if (doc[field] !== undefined) {
        const val = doc[field];
        if (!idx.has(val)) idx.set(val, new Set());
        idx.get(val).add(id);
      }
    }
    return id;
  }

  findById(id) {
    return this.docs.get(id) || null;
  }

  // 简化查询：支持等值匹配
  find(query) {
    // 检查是否有索引可用
    const indexedField = Object.keys(query).find(f => this.indexes.has(f));
    if (indexedField) {
      const idx = this.indexes.get(indexedField);
      const ids = idx.get(query[indexedField]);
      if (!ids) return [];
      return [...ids].map(id => this.docs.get(id)).filter(doc =>
        this._match(doc, query)
      );
    }
    // 全表扫描
    return [...this.docs.values()].filter(doc => this._match(doc, query));
  }

  _match(doc, query) {
    for (const [k, v] of Object.entries(query)) {
      if (doc[k] !== v) return false;
    }
    return true;
  }

  createIndex(field) {
    this.indexes.set(field, new Map());
    // 对已有数据建索引
    for (const [id, doc] of this.docs) {
      if (doc[field] !== undefined) {
        const val = doc[field];
        if (!this.indexes.get(field).has(val)) {
          this.indexes.get(field).set(val, new Set());
        }
        this.indexes.get(field).get(val).add(id);
      }
    }
    console.log(\`  [索引] \${this.name}.\${field} 已建立，覆盖 \${this.docs.size} 条文档\`);
  }

  // 聚合管道（简化）
  aggregate(pipeline) {
    let result = [...this.docs.values()];
    for (const stage of pipeline) {
      if (stage.$match) {
        result = result.filter(doc => this._match(doc, stage.$match));
      } else if (stage.$group) {
        const groups = new Map();
        const groupId = stage.$group._id.substring(1); // 去掉 $
        for (const doc of result) {
          const key = doc[groupId];
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(doc);
        }
        result = [...groups.entries()].map(([key, docs]) => {
          const out = { _id: key };
          for (const [field, op] of Object.entries(stage.$group)) {
            if (field === '_id') continue;
            if (op.$sum) {
              const sumField = op.$sum === 1 ? null : op.$sum.substring(1);
              out[field] = sumField
                ? docs.reduce((s, d) => s + (d[sumField] || 0), 0)
                : docs.length;
            }
          }
          return out;
        });
      } else if (stage.$sort) {
        const [field, order] = Object.entries(stage.$sort)[0];
        result.sort((a, b) => (a[field] > b[field] ? order : -order));
      } else if (stage.$limit) {
        result = result.slice(0, stage.$limit);
      }
    }
    return result;
  }
}

// ============================================================
// 2. 分布式节点与 CAP 分区模拟
// ============================================================
class DistributedNode {
  constructor(name) {
    this.name = name;
    this.data = new Map();
    this.peers = new Set();
    this.partitioned = new Set();  // 被隔离的 peer
  }

  connect(peer) {
    this.peers.add(peer);
    peer.peers.add(this);
  }

  partition(peer) {
    this.partitioned.add(peer);
    peer.partitioned.add(this);
  }

  heal(peer) {
    this.partitioned.delete(peer);
    peer.partitioned.delete(this);
  }

  canReach(peer) {
    return this.peers.has(peer) && !this.partitioned.has(peer);
  }

  // 写入并同步
  write(key, value, consistency = 'AP') {
    this.data.set(key, value);
    const results = { local: true, replicated: [] };

    for (const peer of this.peers) {
      if (this.canReach(peer)) {
        peer.data.set(key, value);
        results.replicated.push({ peer: peer.name, success: true });
      } else {
        results.replicated.push({
          peer: peer.name, success: false, reason: 'partitioned'
        });
      }
    }

    // CP 模式：如果有副本未同步，拒绝本次写入
    if (consistency === 'CP') {
      const failed = results.replicated.filter(r => !r.success);
      if (failed.length > 0) {
        return { success: false, reason: 'CP: 部分副本不可达，拒绝写入', results };
      }
    }
    return { success: true, results };
  }

  read(key) {
    return this.data.get(key);
  }
}

// ============================================================
// 演示 1：文档数据库操作
// ============================================================
function demoDocumentDB() {
  console.log('\\n===== 演示 1：文档数据库操作 =====');
  const db = new DocumentDB('shop');
  const users = db.collection('users');

  console.log('插入文档...');
  users.insert({ name: 'tom', age: 20, city: 'beijing', vip: true });
  users.insert({ name: 'jerry', age: 25, city: 'shanghai', vip: false });
  users.insert({ name: 'lucy', age: 30, city: 'beijing', vip: true });
  users.insert({ name: 'bob', age: 22, city: 'beijing', vip: false });

  console.log('\\n建索引...');
  users.createIndex('city');
  users.createIndex('vip');

  console.log('\\n查询 city=beijing（走索引）:');
  const bjUsers = users.find({ city: 'beijing' });
  console.table(bjUsers.map(u => ({ name: u.name, age: u.age, vip: u.vip })));

  console.log('\\n查询 vip=true（走索引）:');
  const vips = users.find({ vip: true });
  console.log(\`找到 \${vips.length} 个 VIP 用户\`);

  console.log('\\n聚合：按城市分组统计人数和平均年龄');
  const agg = users.aggregate([
    { $group: { _id: '$city', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  console.table(agg);
}

// ============================================================
// 演示 2：CAP 分区模拟
// ============================================================
function demoCAP() {
  console.log('\\n===== 演示 2：CAP 分区模拟 =====');
  const nodeA = new DistributedNode('NodeA');
  const nodeB = new DistributedNode('NodeB');
  const nodeC = new DistributedNode('NodeC');
  nodeA.connect(nodeB);
  nodeB.connect(nodeC);
  nodeA.connect(nodeC);

  console.log('初始状态：三节点互通');
  console.log('  NodeA 写入 x=1:', nodeA.write('x', 1).success ? '成功' : '失败');
  console.log('  NodeB 读取 x =', nodeB.read('x'), '(已同步)');

  console.log('\\n--- 模拟网络分区：A 与 B/C 断开 ---');
  nodeA.partition(nodeB);
  nodeA.partition(nodeC);

  console.log('\\n[AP 模式] NodeA 写入 x=2:');
  const apResult = nodeA.write('x', 2, 'AP');
  console.log('  结果:', apResult.success ? '成功' : '失败',
    apResult.success ? '(允许，但 B/C 看到旧值)' : '');
  console.log('  NodeA 读 x =', nodeA.read('x'), '(新值)');
  console.log('  NodeB 读 x =', nodeB.read('x'), '(旧值，最终一致)');

  console.log('\\n[CP 模式] NodeA 写入 x=3:');
  // 重置分区，先恢复
  nodeA.heal(nodeB);
  nodeA.heal(nodeC);
  nodeA.partition(nodeB);
  nodeA.partition(nodeC);
  const cpResult = nodeA.write('x', 3, 'CP');
  console.log('  结果:', cpResult.success ? '成功' : '失败',
    !cpResult.success ? '(拒绝写入以保证一致性)' : '');
  console.log('  原因:', cpResult.reason || '无');

  console.log('\\n--- 恢复网络 ---');
  nodeA.heal(nodeB);
  nodeA.heal(nodeC);
  console.log('  NodeA 写入 x=4:', nodeA.write('x', 4).success ? '成功' : '失败');
  console.log('  所有节点读 x =', nodeA.read('x'), '(一致)');
}

// ============================================================
// 演示 3：一致性哈希
// ============================================================
function demoConsistentHashing() {
  console.log('\\n===== 演示 3：一致性哈希 =====');
  const crypto = require('crypto');

  class ConsistentHash {
    constructor(virtual = 100) {
      this.ring = new Map();  // hash -> node
      this.sortedHashes = [];
      this.virtual = virtual;
    }

    addNode(node) {
      for (let i = 0; i < this.virtual; i++) {
        const h = this._hash(\`\${node}:\${i}\`);
        this.ring.set(h, node);
      }
      this.sortedHashes = [...this.ring.keys()].sort((a, b) => a - b);
    }

    removeNode(node) {
      for (let i = 0; i < this.virtual; i++) {
        const h = this._hash(\`\${node}:\${i}\`);
        this.ring.delete(h);
      }
      this.sortedHashes = [...this.ring.keys()].sort((a, b) => a - b);
    }

    getNode(key) {
      const h = this._hash(key);
      for (const hash of this.sortedHashes) {
        if (hash >= h) return this.ring.get(hash);
      }
      return this.ring.get(this.sortedHashes[0]);
    }

    _hash(s) {
      return parseInt(crypto.createHash('md5').update(s).digest('hex').substring(0, 8), 16);
    }
  }

  const ch = new ConsistentHash(50);
  ch.addNode('Node1');
  ch.addNode('Node2');
  ch.addNode('Node3');

  // 分配 1000 个 key
  const distribution = {};
  for (let i = 0; i < 1000; i++) {
    const node = ch.getNode(\`user:\${i}\`);
    distribution[node] = (distribution[node] || 0) + 1;
  }
  console.log('3 节点时 key 分布:');
  console.table(distribution);

  // 增加 Node4，看迁移量
  ch.addNode('Node4');
  let migrated = 0;
  for (let i = 0; i < 1000; i++) {
    const node = ch.getNode(\`user:\${i}\`);
    const oldNode = distribution; // 简化：对比之前
  }
  const newDist = {};
  for (let i = 0; i < 1000; i++) {
    const node = ch.getNode(\`user:\${i}\`);
    newDist[node] = (newDist[node] || 0) + 1;
  }
  console.log('增加 Node4 后 key 分布:');
  console.table(newDist);
  console.log('→ 只有约 1/4 的 key 需要迁移（vs 取模法的几乎全部）');
}

// ============================================================
// 演示 4：键值缓存模拟
// ============================================================
function demoKeyValueCache() {
  console.log('\\n===== 演示 4：键值缓存（类 Redis） =====');

  class KeyValueStore {
    constructor() {
      this.store = new Map();
      this.expiry = new Map();
      this.dataStructures = {
        string: new Map(),
        hash: new Map(),
        list: new Map(),
        set: new Map(),
        zset: new Map()
      };
    }

    // String 操作
    set(key, val, ttl = null) {
      this.dataStructures.string.set(key, val);
      if (ttl) this.expiry.set(key, Date.now() + ttl);
      return 'OK';
    }
    get(key) {
      if (this._expired(key)) return null;
      return this.dataStructures.string.get(key) || null;
    }
    incr(key) {
      const v = parseInt(this.get(key) || '0') + 1;
      this.set(key, String(v));
      return v;
    }

    // Hash 操作
    hset(key, field, val) {
      if (!this.dataStructures.hash.has(key)) this.dataStructures.hash.set(key, new Map());
      this.dataStructures.hash.get(key).set(field, val);
    }
    hget(key, field) {
      return this.dataStructures.hash.get(key)?.get(field) || null;
    }
    hgetall(key) {
      const h = this.dataStructures.hash.get(key);
      return h ? Object.fromEntries(h) : {};
    }

    // ZSet 操作（排行榜）
    zadd(key, score, member) {
      if (!this.dataStructures.zset.has(key)) this.dataStructures.zset.set(key, new Map());
      this.dataStructures.zset.get(key).set(member, score);
    }
    zrevrange(key, start, end) {
      const z = this.dataStructures.zset.get(key);
      if (!z) return [];
      return [...z.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(start, end + 1);
    }

    _expired(key) {
      const exp = this.expiry.get(key);
      if (exp && Date.now() > exp) {
        this.dataStructures.string.delete(key);
        this.expiry.delete(key);
        return true;
      }
      return false;
    }
  }

  const kv = new KeyValueStore();

  console.log('--- String 计数器 ---');
  kv.set('page:home:views', '0');
  for (let i = 0; i < 5; i++) kv.incr('page:home:views');
  console.log('首页浏览量:', kv.get('page:home:views'));

  console.log('\\n--- Hash 对象存储 ---');
  kv.hset('user:1001', 'name', 'tom');
  kv.hset('user:1001', 'age', '20');
  kv.hset('user:1001', 'city', 'beijing');
  console.log('用户信息:', kv.hgetall('user:1001'));

  console.log('\\n--- ZSet 排行榜 ---');
  kv.zadd('rank:score', 100, 'player1');
  kv.zadd('rank:score', 200, 'player2');
  kv.zadd('rank:score', 150, 'player3');
  kv.zadd('rank:score', 300, 'player4');
  console.log('积分排行榜 Top3:');
  kv.zrevrange('rank:score', 0, 2).forEach(([m, s], i) =>
    console.log(\`  \${i + 1}. \${m}: \${s} 分\`)
  );

  console.log('\\n--- TTL 过期 ---');
  kv.set('session:abc', 'active', 10);
  console.log('设置 session TTL=10ms');
  setTimeout(() => {
    console.log('10ms 后读取:', kv.get('session:abc'), '(已过期)');
  }, 20);
}

// ============================================================
// 演示 5：AP vs CP 写入对比
// ============================================================
function demoAPvsCP() {
  console.log('\\n===== 演示 5：AP vs CP 写入对比 =====');
  const node1 = new DistributedNode('N1');
  const node2 = new DistributedNode('N2');
  const node3 = new DistributedNode('N3');
  node1.connect(node2);
  node2.connect(node3);
  node1.connect(node3);

  console.log('场景：N1 与 N2/N3 分区，客户端连 N1');
  node1.partition(node2);
  node1.partition(node3);

  console.log('\\nAP 模式（如 Cassandra）:');
  for (const key of ['data1', 'data2', 'data3']) {
    const r = node1.write(key, 'value', 'AP');
    console.log(\`  写入 \${key}: \${r.success ? '成功（接受最终一致）' : '失败'}\`);
  }
  console.log('  N1 数据:', [...node1.data.keys()].length, '条');
  console.log('  N2 数据:', [...node2.data.keys()].length, '条（分区期间未同步）');

  console.log('\\nCP 模式（如 HBase）:');
  // 新节点模拟
  const cp1 = new DistributedNode('CP1');
  const cp2 = new DistributedNode('CP2');
  cp1.connect(cp2);
  cp1.partition(cp2);
  for (const key of ['data1', 'data2', 'data3']) {
    const r = cp1.write(key, 'value', 'CP');
    console.log(\`  写入 \${key}: \${r.success ? '成功' : '失败（拒绝，保证一致）'}\`);
  }
  console.log('  → CP 在分区时拒绝写入，保证数据一致');
  console.log('  → AP 在分区时继续写入，牺牲一致换可用');
}

// 执行所有演示
demoDocumentDB();
demoCAP();
demoConsistentHashing();
demoKeyValueCache();

// demoAPvsCP 需要稍后执行（因为 demoKeyValueCache 有 setTimeout）
setTimeout(() => {
  demoAPvsCP();
  console.log('\\n===== 演示结束 =====');
}, 50);
`,
  },
];
