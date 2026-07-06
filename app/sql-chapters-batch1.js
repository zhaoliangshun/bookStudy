// =============================================================
// 数据库开发教程 —— 第一批章节（SQL 基础篇，共 6 章）
// -------------------------------------------------------------
// 本批聚焦"从零上手 SQL"：数据库概念、建表与数据类型、增删改查、约束。
// 所有 code 字段均可在 sqlite3 内存数据库中直接运行。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：数据库与 SQL 简介
  // =========================================================
  {
    id: "sql-intro",
    group: "SQL 基础",
    icon: "🗄️",
    title: "数据库与 SQL 简介",
    content: `## 数据库与 SQL 简介

数据库是"按某种结构组织、可被程序高效查询的数据集合"。本章先建立全局认知：数据库分哪些类、SQL 在其中扮演什么角色、关系型数据库的核心概念。

### 一、数据库的四大流派

| 流派 | 代表产品 | 数据模型 | 典型场景 |
| --- | --- | --- | --- |
| **关系型（RDBMS）** | MySQL / PostgreSQL / Oracle / SQLite | 二维表 + 关系代数 | 事务型业务、强一致性 |
| **文档型（NoSQL）** | MongoDB / CouchDB | JSON 文档 | 内容管理、灵活 schema |
| **键值型（NoSQL）** | Redis / DynamoDB | key → value | 缓存、会话、计数器 |
| **列族型（NoSQL）** | Cassandra / HBase | 行键 + 列族 | 海量写入、时序数据 |
| **图数据库** | Neo4j / JanusGraph | 节点 + 边 | 社交关系、知识图谱 |
| **NewSQL** | TiDB / CockroachDB / Spanner | 关系表 + 分布式 | HTAP、全球部署 |

**核心权衡**：关系型强一致但扩展性弱；NoSQL 高扩展但弱一致；NewSQL 试图兼得。

### 二、SQL 是什么

SQL（Structured Query Language，结构化查询语言）是关系型数据库的"标准语言"，分为五大子语言：

| 子语言 | 作用 | 关键字 |
| --- | --- | --- |
| **DDL**（数据定义） | 建表、改结构 | \`CREATE / ALTER / DROP\` |
| **DML**（数据操作） | 增删改 | \`INSERT / UPDATE / DELETE\` |
| **DQL**（数据查询） | 查 | \`SELECT\` |
| **DCL**（数据控制） | 权限 | \`GRANT / REVOKE\` |
| **TCL**（事务控制） | 事务 | \`BEGIN / COMMIT / ROLLBACK\` |

### 三、关系型数据库的核心概念

**表（Table）**：类似 Excel 工作表，有行有列。每张表存一类实体（users、orders）。

**行（Row / Record）**：一条记录，代表一个实体实例。

**列（Column / Field）**：实体的一个属性，有固定数据类型。

**主键（Primary Key）**：唯一标识一行的列，非空且唯一。

**外键（Foreign Key）**：引用其他表主键的列，建立表间关系。

**模式（Schema）**：表结构的定义（列名、类型、约束）。

### 四、SQLite：本教程的运行环境

本教程使用 **SQLite** 执行所有 SQL 示例。SQLite 是嵌入式关系型数据库，特点：

- **零配置**：无需服务端，单文件即可运行
- **内存模式**：\`sqlite3 :memory:\` 在内存中建库，进程结束即销毁
- **标准 SQL**：支持 SQL-92 大部分，并支持 SQL:1999 CTE、SQL:2003 窗口函数(3.25+)、RETURNING(3.35+)等
- **轻量**：整个数据库就是一个文件

**适合**：学习、原型、小型应用、嵌入式设备。
**不适合**：高并发写入、海量数据、分布式场景。

### 五、第一个 SQL 程序

\`\`\`sql
-- 创建表
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER
);

-- 插入数据
INSERT INTO users (name, age) VALUES ('Alice', 28);
INSERT INTO users (name, age) VALUES ('Bob', 34);

-- 查询
SELECT * FROM users;
\`\`\`

### 六、学习心法

1. **SQL 是声明式语言**：你描述"要什么"，不描述"怎么拿"，数据库自己优化执行路径
2. **先建表后插数据**：关系型数据库严格按 schema 执行
3. **大小写不敏感**：\`SELECT\` 和 \`select\` 等价（但建议关键字大写，便于阅读）
4. **语句用分号结尾**：\`;\` 是 SQL 语句的结束符

下面代码演示建表、插数据、查询的完整流程。`,
    code: `-- ============================================================
-- 第一章演示：数据库与 SQL 简介
-- ============================================================

-- 1. 创建用户表
CREATE TABLE users (
  id INTEGER PRIMARY KEY,           -- 主键，自增
  name TEXT NOT NULL,              -- 姓名，非空
  age INTEGER,                     -- 年龄
  email TEXT                       -- 邮箱
);

-- 2. 插入数据
INSERT INTO users (name, age, email) VALUES ('Alice', 28, 'alice@example.com');
INSERT INTO users (name, age, email) VALUES ('Bob', 34, 'bob@example.com');
INSERT INTO users (name, age, email) VALUES ('Charlie', 22, 'charlie@example.com');

-- 3. 查询所有数据
SELECT '全部用户:' AS info;
SELECT * FROM users;

-- 4. 条件查询
SELECT '年龄大于25:' AS info;
SELECT * FROM users WHERE age > 25;

-- 5. 查询特定列
SELECT '只看姓名和年龄:' AS info;
SELECT name, age FROM users;

-- 6. 统计
SELECT '用户总数:' AS info;
SELECT COUNT(*) AS total FROM users;`,
  },

  // =========================================================
  // 第二章：建表与数据类型
  // =========================================================
  {
    id: "sql-create-table",
    group: "SQL 基础",
    icon: "📋",
    title: "建表与数据类型",
    content: `## 建表与数据类型

\`CREATE TABLE\` 是数据库设计的起点。本章讲透**数据类型选择**和**建表语法**——选错类型会导致存储浪费、查询低效、甚至数据丢失。

### 一、CREATE TABLE 完整语法

\`\`\`sql
CREATE TABLE 表名 (
  列名1 数据类型 [约束],
  列名2 数据类型 [约束],
  ...,
  [表级约束]
);
\`\`\`

### 二、SQLite 的数据类型（5 大存储类）

SQLite 采用**动态类型系统**，只有 5 种存储类：

| 存储类 | 说明 | 示例 |
| --- | --- | --- |
| \`INTEGER\` | 整数，1-8 字节 | \`42\`、\`-7\` |
| \`REAL\` | 浮点数，8 字节 IEEE 754 | \`3.14\`、\`-0.5\` |
| \`TEXT\` | 字符串，UTF-8/16 | \`'hello'\`、\`'数据库'\` |
| \`BLOB\` | 二进制数据，原样存储 | 图片、序列化对象 |
| \`NULL\` | 空值 | \`NULL\` |

**类型亲和性（Type Affinity）**：SQLite 会根据声明的类型名推断亲和性：
- 含 \`INT\` → INTEGER 亲和性
- 含 \`CHAR\`/\`CLOB\`/\`TEXT\` → TEXT 亲和性
- 含 \`BLOB\` 或无类型 → BLOB 亲和性
- 含 \`REAL\`/\`FLOA\`/\`DOUB\` → REAL 亲和性
- 含其他 → NUMERIC 亲和性（自动转 INTEGER 或 REAL）

### 三、其他数据库的常见类型（对照）

| 类型 | MySQL | PostgreSQL | SQLite | 用途 |
| --- | --- | --- | --- | --- |
| 整数 | \`INT\`/\`BIGINT\` | \`INTEGER\`/\`BIGINT\` | \`INTEGER\` | 计数、ID |
| 浮点 | \`FLOAT\`/\`DOUBLE\` | \`REAL\`/\`DOUBLE PRECISION\` | \`REAL\` | 小数 |
| 定点数 | \`DECIMAL(10,2)\` | \`NUMERIC(10,2)\` | \`NUMERIC\` | 金额（精确） |
| 定长字符串 | \`CHAR(10)\` | \`CHAR(10)\` | \`TEXT\` | 固定长度编码 |
| 变长字符串 | \`VARCHAR(255)\` | \`VARCHAR(255)\` | \`TEXT\` | 姓名、标题 |
| 长文本 | \`TEXT\`/\`LONGTEXT\` | \`TEXT\` | \`TEXT\` | 文章、描述 |
| 日期 | \`DATE\` | \`DATE\` | \`TEXT\`（ISO 格式） | 日期 |
| 时间戳 | \`DATETIME\`/\`TIMESTAMP\` | \`TIMESTAMP\` | \`TEXT\`/\`INTEGER\` | 创建时间 |
| 布尔 | \`TINYINT(1)\` | \`BOOLEAN\` | \`INTEGER\`(0/1) | 是/否 |
| 二进制 | \`BLOB\` | \`BYTEA\` | \`BLOB\` | 文件、图片 |

### 四、类型选择的踩坑点

**坑 1：金额用 FLOAT**
\`\`\`sql
-- ❌ 精度丢失
CREATE TABLE bad (price FLOAT);
INSERT INTO bad VALUES (0.1 + 0.2);  -- 0.30000000000000004

-- ✅ 用 DECIMAL/NUMERIC
CREATE TABLE good (price DECIMAL(10,2));
\`\`\`

**坑 2：IP 地址存成 VARCHAR**
\`\`\`sql
-- ❌ 浪费空间，无法范围查询
ip VARCHAR(15)  -- '192.168.1.1' 占 15 字节

-- ✅ 存成 INTEGER（用 INET_ATON 转换）
ip UNSIGNED INT  -- 占 4 字节
\`\`\`

**坑 3：时间存成字符串**
\`\`\`sql
-- ❌ 无法做日期运算，无法校验格式
created_at VARCHAR(20)

-- ✅ 用专用类型（SQLite 用 TEXT 存 ISO 格式）
created_at TEXT  -- '2026-06-29 14:30:00'
\`\`\`

### 五、PRIMARY KEY 的两种写法

\`\`\`sql
-- 写法 1：列级约束
CREATE TABLE t1 (
  id INTEGER PRIMARY KEY,  -- SQLite 中 INTEGER PRIMARY KEY 自动自增
  name TEXT
);

-- 写法 2：表级约束
CREATE TABLE t2 (
  id INTEGER,
  name TEXT,
  PRIMARY KEY (id)
);

-- 复合主键（多列联合唯一）
CREATE TABLE t3 (
  user_id INTEGER,
  role_id INTEGER,
  PRIMARY KEY (user_id, role_id)
);
\`\`\`

**SQLite 特性**：\`INTEGER PRIMARY KEY\` 是 \`rowid\` 的别名，自动从 1 自增，插入 NULL 时自动分配新值。

### 六、IF NOT EXISTS 防重复建表

\`\`\`sql
CREATE TABLE IF NOT EXISTS users (...);
\`\`\`

防止表已存在时报错，常用于脚本初始化。

### 七、DROP 与 ALTER

\`\`\`sql
-- 删表（不可逆，慎用）
DROP TABLE users;

-- 改表名
ALTER TABLE users RENAME TO members;

-- 加列（SQLite 3.35+ 支持 DROP COLUMN，但不支持改列类型）
ALTER TABLE users ADD COLUMN created_at TEXT;
\`\`\`

**踩坑点**：SQLite 的 ALTER TABLE 功能受限，DROP COLUMN 需 3.35+ 版本支持、不支持改列类型。生产数据库迁移要小心。

下面代码演示各种数据类型和建表方式。`,
    code: `-- ============================================================
-- 第二章演示：建表与数据类型
-- ============================================================

-- 1. 基本建表（各种类型）
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL,                      -- 浮点
  stock INTEGER DEFAULT 0,         -- 默认值
  description TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

INSERT INTO products (name, price, stock, description) VALUES
  ('笔记本电脑', 6999.00, 50, '16寸轻薄本'),
  ('机械键盘', 599.50, 200, '红轴静音'),
  ('鼠标垫', 49.99, 500, '大尺寸');

SELECT '产品表:' AS info;
SELECT * FROM products;

-- 2. 复合主键（用户-角色关联表）
CREATE TABLE user_roles (
  user_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  granted_at TEXT DEFAULT (datetime('now', 'localtime')),
  PRIMARY KEY (user_id, role_id)
);

INSERT INTO user_roles (user_id, role_id) VALUES (1, 1), (1, 2), (2, 1);

SELECT '用户-角色关联:' AS info;
SELECT * FROM user_roles;

-- 3. 定点数演示（避免浮点精度问题）
CREATE TABLE accounts (
  id INTEGER PRIMARY KEY,
  holder TEXT,
  balance NUMERIC(10, 2)   -- 10位数字，2位小数
);

INSERT INTO accounts (holder, balance) VALUES ('张三', 1000.00);
INSERT INTO accounts (holder, balance) VALUES ('李四', 0.1 + 0.2);  -- 0.3 还是 0.30?

SELECT '账户表（注意余额精度）:' AS info;
SELECT * FROM accounts;

-- 4. IF NOT EXISTS
CREATE TABLE IF NOT EXISTS demo_exists (id INTEGER);
CREATE TABLE IF NOT EXISTS demo_exists (id INTEGER);  -- 不报错
SELECT 'IF NOT EXISTS 演示完成' AS info;

-- 5. ALTER TABLE 加列
ALTER TABLE products ADD COLUMN tags TEXT;
UPDATE products SET tags = '热销' WHERE id = 1;
SELECT '加列后的产品表:' AS info;
SELECT id, name, tags FROM products;`,
  },

  // =========================================================
  // 第三章：插入数据 INSERT
  // =========================================================
  {
    id: "sql-insert",
    group: "SQL 基础",
    icon: "➕",
    title: "插入数据 INSERT",
    content: `## 插入数据 INSERT

\`INSERT\` 是把数据写进表的唯一方式。看似简单，实则有**批量插入、默认值、冲突处理**等不少门道。

### 一、INSERT 的三种写法

\`\`\`sql
-- 1. 完整写法（推荐，明确列名）
INSERT INTO users (name, age, email)
VALUES ('Alice', 28, 'alice@example.com');

-- 2. 省略列名（按表定义顺序，不推荐）
INSERT INTO users VALUES (1, 'Alice', 28, 'alice@example.com');

-- 3. 多行批量插入（高效）
INSERT INTO users (name, age) VALUES
  ('Alice', 28),
  ('Bob', 34),
  ('Charlie', 22);
\`\`\`

**性能要点**：批量插入比循环单条插入快 10-100 倍。每条 INSERT 都是一次事务，批量插入只一次事务。

### 二、默认值与自动生成

\`\`\`sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  status TEXT DEFAULT 'pending',
  total REAL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 用默认值
INSERT INTO orders (id) VALUES (1);
-- 等价于
INSERT INTO orders DEFAULT VALUES;
\`\`\`

**DEFAULT 表达式**：SQLite 支持函数作为默认值，如 \`datetime('now')\`、\`random()\`。

### 三、NULL 与缺省列

\`\`\`sql
-- 不指定的列会填 NULL（除非有 DEFAULT）
INSERT INTO users (name) VALUES ('Dave');
-- age 和 email 为 NULL

-- 显式插入 NULL
INSERT INTO users (name, age, email) VALUES ('Eve', NULL, NULL);
\`\`\`

**NULL 的含义**：未知、不适用、缺失。注意 NULL 不等于任何值（包括另一个 NULL）。

### 四、INSERT ... SELECT（从查询结果插入）

\`\`\`sql
-- 把老用户表的数据复制到新表
INSERT INTO new_users (name, age)
SELECT name, age FROM old_users WHERE age > 18;

-- 建表 + 复制一步到位
CREATE TABLE adults AS
SELECT * FROM users WHERE age >= 18;
\`\`\`

### 五、UPSERT：插入或更新（SQLite 3.24+）

当主键/唯一约束冲突时，\`ON CONFLICT\` 决定如何处理：

\`\`\`sql
INSERT INTO users (id, name, age) VALUES (1, 'Alice', 29)
ON CONFLICT(id) DO UPDATE SET age = excluded.age, name = excluded.name;

-- 冲突时忽略
INSERT INTO users (id, name) VALUES (1, 'Alice')
ON CONFLICT(id) DO NOTHING;
\`\`\`

**\`excluded\`** 是关键字，指"试图插入的新值"。

### 六、踩坑点

**坑 1：字符串用双引号**
\`\`\`sql
-- ❌ 双引号在 SQL 标准里是"标识符引用"
INSERT INTO users (name) VALUES ("Alice");  -- 可能被当成列名

-- ✅ 字符串用单引号
INSERT INTO users (name) VALUES ('Alice');
\`\`\`

SQLite 默认兼容双引号字符串，但其他数据库严格遵循标准会报错。

**坑 2：忘记事务**
\`\`\`sql
-- ❌ 批量插入未包事务，中途失败会留下半截数据
INSERT INTO orders ...;
INSERT INTO order_items ...;  -- 失败，orders 已插入但 order_items 没有

-- ✅ 包在事务里
BEGIN;
INSERT INTO orders ...;
INSERT INTO order_items ...;
COMMIT;
\`\`\`

**坑 3：自增 ID 不连续**
\`\`\`sql
-- 删除后 ID 不会回填
INSERT INTO t VALUES (1);  -- id=1
INSERT INTO t VALUES (2);  -- id=2
DELETE FROM t WHERE id = 2;
INSERT INTO t VALUES (NULL);  -- id=3（不是 2）
\`\`\`

### 七、生产建议

1. **永远指定列名**：\`INSERT INTO t (a, b) VALUES (...)\`，避免加列时语句失效
2. **批量插入用多行 VALUES**：\`VALUES (...), (...), (...)\`
3. **导入大量数据先关索引**：\`DROP INDEX\` → 插数据 → \`CREATE INDEX\`，快 10 倍
4. **用事务包裹批量插入**：\`BEGIN; ... INSERT ...; COMMIT;\`

下面代码演示各种 INSERT 方式。`,
    code: `-- ============================================================
-- 第三章演示：插入数据 INSERT
-- ============================================================

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  email TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 1. 单条插入
INSERT INTO users (name, age, email) VALUES ('Alice', 28, 'alice@example.com');

-- 2. 多行批量插入
INSERT INTO users (name, age, email) VALUES
  ('Bob', 34, 'bob@example.com'),
  ('Charlie', 22, 'charlie@example.com'),
  ('Dave', 45, 'dave@example.com');

SELECT '插入结果:' AS info;
SELECT * FROM users;

-- 3. 默认值（不指定列）
INSERT INTO users (name, email) VALUES ('Eve', 'eve@example.com');
SELECT 'Eve 的 status 用默认值:' AS info;
SELECT name, status, created_at FROM users WHERE name = 'Eve';

-- 4. INSERT ... SELECT
CREATE TABLE young_users AS
  SELECT id, name, age FROM users WHERE age < 30;

SELECT '年轻用户（age < 30）:' AS info;
SELECT * FROM young_users;

-- 5. UPSERT：冲突时更新
INSERT INTO users (id, name, age, email) VALUES (1, 'Alice', 29, 'alice@example.com')
ON CONFLICT(id) DO UPDATE SET age = excluded.age;

SELECT 'UPSERT 后的 Alice（age 应为 29）:' AS info;
SELECT id, name, age FROM users WHERE id = 1;

-- 6. 冲突时忽略
INSERT INTO users (id, name, email) VALUES (1, 'Alice2', 'alice2@example.com')
ON CONFLICT(id) DO NOTHING;

SELECT '冲突忽略后（id=1 仍为 Alice）:' AS info;
SELECT id, name FROM users WHERE id = 1;

-- 7. 显式插入 NULL
INSERT INTO users (name, age, email) VALUES ('Frank', NULL, NULL);
SELECT '含 NULL 的记录:' AS info;
SELECT id, name, age, email FROM users WHERE name = 'Frank';`,
  },

  // =========================================================
  // 第四章：SELECT 基础查询
  // =========================================================
  {
    id: "sql-select",
    group: "SQL 基础",
    icon: "🔍",
    title: "SELECT 基础查询",
    content: `## SELECT 基础查询

\`SELECT\` 是 SQL 的核心，也是用得最多的语句。本章讲清楚 SELECT 的执行顺序、列选择、表达式、别名。

### 一、SELECT 的执行顺序（重点）

SQL 的**书写顺序**和**执行顺序**不同，这是理解查询行为的关键：

| 书写顺序 | 执行顺序 | 说明 |
| --- | --- | --- |
| \`SELECT\` | 5 | 选择列、计算表达式 |
| \`FROM\` | 1 | 确定数据源（表） |
| \`JOIN\` | 2 | 连接其他表 |
| \`WHERE\` | 3 | 行过滤 |
| \`GROUP BY\` | 4 | 分组 |
| \`HAVING\` | 5 | 分组后过滤 |
| \`ORDER BY\` | 6 | 排序 |
| \`LIMIT\` | 7 | 限制行数 |

**关键结论**：
- \`WHERE\` 在 \`GROUP BY\` 之前，**不能用聚合函数**（\`WHERE COUNT(*) > 1\` 是错的）
- \`SELECT\` 的别名在 \`WHERE\` 中**不可用**（因为 WHERE 先执行）
- \`ORDER BY\` 可以用 SELECT 的别名（因为它最后执行）

### 二、查询所有列 vs 指定列

\`\`\`sql
-- 查所有列（开发调试用，生产禁用）
SELECT * FROM users;

-- 查指定列（生产推荐）
SELECT id, name, age FROM users;
\`\`\`

**为什么禁止 \`SELECT *\`**：
1. **传输浪费**：表有 50 列只用 3 列，浪费 47 列的带宽
2. **顺序不稳定**：加列后结果顺序变化，破坏依赖
3. **索引失效**：覆盖索引无法优化 \`SELECT *\`
4. **安全风险**：可能泄露敏感字段（password、token）

### 三、列别名 AS

\`\`\`sql
-- 用 AS 起别名（AS 可省略）
SELECT name AS 用户名, age AS 年龄 FROM users;
SELECT name 用户名, age 年龄 FROM users;

-- 给计算结果起名
SELECT price * quantity AS total FROM orders;
\`\`\`

**注意**：别名在 WHERE 中不可用，在 ORDER BY / HAVING 中可用。

### 四、表达式与运算

\`\`\`sql
-- 算术运算
SELECT price * 0.9 AS 折扣价 FROM products;

-- 字符串拼接（SQLite 用 ||）
SELECT '用户:' || name AS info FROM users;

-- 条件表达式（用 CASE，见后续章节）
SELECT name, CASE WHEN age >= 18 THEN '成年' ELSE '未成年' END AS 状态 FROM users;
\`\`\`

### 五、DISTINCT 去重

\`\`\`sql
-- 查所有不同的城市
SELECT DISTINCT city FROM users;

-- 多列组合去重
SELECT DISTINCT city, age FROM users;
\`\`\`

**性能提示**：\`DISTINCT\` 需要排序去重，大数据量时慢。如果已知数据唯一，不要加。

### 六、LIMIT 与 OFFSET 分页

\`\`\`sql
-- 取前 10 条
SELECT * FROM users LIMIT 10;

-- 第 2 页（每页 10 条）
SELECT * FROM users LIMIT 10 OFFSET 10;

-- 简写
SELECT * FROM users LIMIT 10, 10;  -- LIMIT 偏移, 数量
\`\`\`

**大表分页的坑**：\`OFFSET 100000 LIMIT 10\` 要先扫描前 10 万行再丢弃，极慢。生产用"游标分页"（\`WHERE id > ? LIMIT 10\`）。

### 七、字面量与伪列

\`\`\`sql
-- 输出固定值
SELECT 1 AS num, 'hello' AS msg;

-- SQLite 的伪列 rowid
SELECT rowid, name FROM users;
\`\`\`

### 八、SELECT 的特殊用途

\`\`\`sql
-- 当计算器
SELECT 1 + 1;
SELECT 3.14 * 2 AS circumference;

-- 调用函数
SELECT datetime('now', 'localtime') AS now;
SELECT LENGTH('hello') AS len;
\`\`\`

### 九、查询性能心法

1. **只查需要的列**：不用 \`SELECT *\`
2. **尽早过滤**：\`WHERE\` 减少后续处理量
3. **索引覆盖**：查询的列都在索引里，无需回表
4. **分页用游标**：避免大 OFFSET
5. **预估结果集**：\`SELECT COUNT(*)\` 先看大小

下面代码演示 SELECT 的各种用法。`,
    code: `-- ============================================================
-- 第四章演示：SELECT 基础查询
-- ============================================================

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  salary REAL,
  city TEXT,
  hire_date TEXT
);

INSERT INTO employees (name, department, salary, city, hire_date) VALUES
  ('张三', '技术部', 25000, '北京', '2023-03-15'),
  ('李四', '市场部', 18000, '上海', '2022-08-20'),
  ('王五', '技术部', 30000, '北京', '2021-01-10'),
  ('赵六', '人事部', 15000, '广州', '2024-02-01'),
  ('孙七', '市场部', 22000, '上海', '2023-11-05'),
  ('周八', '技术部', 28000, '深圳', '2022-06-18'),
  ('吴九', '人事部', 16000, '广州', '2023-09-12');

-- 1. 查指定列
SELECT '1. 指定列:' AS info;
SELECT name, department, salary FROM employees;

-- 2. 列别名 + 表达式
SELECT '2. 别名与表达式:' AS info;
SELECT name AS 姓名, salary AS 基本工资, salary * 12 AS 年薪 FROM employees;

-- 3. 字符串拼接
SELECT '3. 字符串拼接:' AS info;
SELECT name || ' - ' || department || ' - ' || city AS 员工信息 FROM employees;

-- 4. DISTINCT 去重
SELECT '4. 不同的部门:' AS info;
SELECT DISTINCT department FROM employees;

SELECT '4. 不同的城市+部门组合:' AS info;
SELECT DISTINCT city, department FROM employees;

-- 5. LIMIT 分页
SELECT '5. 前 3 条:' AS info;
SELECT * FROM employees LIMIT 3;

SELECT '5. 第 2 页（每页 2 条）:' AS info;
SELECT * FROM employees LIMIT 2 OFFSET 2;

-- 6. WHERE 条件
SELECT '6. 技术部员工:' AS info;
SELECT name, salary FROM employees WHERE department = '技术部';

SELECT '6. 高薪员工（>20000）:' AS info;
SELECT name, salary FROM employees WHERE salary > 20000 ORDER BY salary DESC;

-- 7. 当计算器
SELECT '7. 计算器:' AS info;
SELECT 3.14 * 2 AS circumference, 100 / 7 AS division;

-- 8. 当前时间
SELECT '8. 当前时间:' AS info;
SELECT datetime('now', 'localtime') AS 当前时间;`,
  },

  // =========================================================
  // 第五章：UPDATE 与 DELETE
  // =========================================================
  {
    id: "sql-update-delete",
    group: "SQL 基础",
    icon: "✏️",
    title: "UPDATE 与 DELETE",
    content: `## UPDATE 与 DELETE

\`UPDATE\` 改数据，\`DELETE\` 删数据。两者都是危险操作——**忘记 WHERE 会改/删全表**。本章讲清楚安全用法和常见坑。

### 一、UPDATE 基础

\`\`\`sql
-- 改单条
UPDATE users SET age = 29 WHERE id = 1;

-- 改多列
UPDATE users SET age = 29, email = 'new@example.com' WHERE id = 1;

-- 改全部（危险！）
UPDATE users SET status = 'inactive';  -- 所有用户都变成 inactive
\`\`\`

### 二、UPDATE 用表达式

\`\`\`sql
-- 全员涨薪 10%
UPDATE employees SET salary = salary * 1.1;

-- 按条件涨薪
UPDATE employees SET salary = salary * 1.2 WHERE department = '技术部';

-- 用 CASE 分情况
UPDATE products SET price = CASE
  WHEN price < 100 THEN price * 1.1
  WHEN price < 1000 THEN price * 1.05
  ELSE price
END;
\`\`\`

### 三、UPDATE ... FROM（跨表更新）

\`\`\`sql
-- 用另一张表的值更新（PostgreSQL 语法，SQLite 3.33+ 支持）
UPDATE orders SET status = 'shipped'
FROM shipments
WHERE orders.id = shipments.order_id;
\`\`\`

SQLite 用子查询替代：
\`\`\`sql
UPDATE orders SET status = (
  SELECT 'shipped' FROM shipments WHERE shipments.order_id = orders.id
) WHERE id IN (SELECT order_id FROM shipments);
\`\`\`

### 四、DELETE 基础

\`\`\`sql
-- 删单条
DELETE FROM users WHERE id = 1;

-- 删多条
DELETE FROM users WHERE age < 18;

-- 删全部（危险！）
DELETE FROM users;  -- 清空表数据，但表结构和自增 ID 保留
\`\`\`

### 五、DELETE vs TRUNCATE vs DROP

| 操作 | 作用 | 速度 | 自增 ID | 可回滚 | 触发器 |
| --- | --- | --- | --- | --- | --- |
| \`DELETE FROM t\` | 删行 | 慢（逐行） | 保留 | 是（在事务内） | 触发 |
| \`TRUNCATE TABLE t\` | 清空表 | 快（重置指针） | 重置 | 否（DDL） | 不触发 |
| \`DROP TABLE t\` | 删表 | 快 | - | 否（DDL） | - |

**注意**：SQLite 不支持 \`TRUNCATE\`，用 \`DELETE FROM t;\` 代替。要重置自增 ID：\`DELETE FROM sqlite_sequence WHERE name='t';\`

### 六、软删除 vs 硬删除

\`\`\`sql
-- 硬删除：数据真的没了
DELETE FROM users WHERE id = 1;

-- 软删除：标记为已删除，数据还在
UPDATE users SET deleted_at = datetime('now') WHERE id = 1;

-- 查询时过滤已删除
SELECT * FROM users WHERE deleted_at IS NULL;
\`\`\`

**软删除的好处**：
1. 可恢复（误删能找回）
2. 审计需要（保留历史）
3. 外键完整性（关联记录不会悬空）

**软删除的代价**：每个查询都要加 \`WHERE deleted_at IS NULL\`，容易漏。可用视图封装。

### 七、安全更新 Checklist

**操作前三查**：
1. \`SELECT\` 先查要改/删的行，确认范围
2. \`WHERE\` 条件是否唯一（最好用主键）
3. 是否在事务里（可回滚）

\`\`\`sql
-- ✅ 安全流程
BEGIN;
SELECT * FROM users WHERE id = 1;  -- 先确认
UPDATE users SET age = 29 WHERE id = 1;
SELECT * FROM users WHERE id = 1;  -- 验证
COMMIT;  -- 确认无误再提交（不对就 ROLLBACK）
\`\`\`

### 八、踩坑点

**坑 1：忘加 WHERE**
\`\`\`sql
-- 灾难性操作
UPDATE users SET status = 'banned';  -- 全员封禁！
DELETE FROM orders;  -- 订单全没了！
\`\`\`

**防护**：MySQL 可开 \`--safe-updates\`，强制 UPDATE/DELETE 带 WHERE。

**坑 2：DELETE 不释放空间**
\`\`\`sql
DELETE FROM big_table;  -- 数据没了，但磁盘空间不还
\`\`\`

DELETE 删行后，数据库文件不会缩小，只是标记为可复用。要真正回收：\`VACUUM\`（SQLite/PostgreSQL）或 \`OPTIMIZE TABLE\`（MySQL）。

**坑 3：UPDATE 子查询引用自身**
\`\`\`sql
-- ❌ 在 MySQL 中可能锁表
UPDATE t SET cnt = (SELECT COUNT(*) FROM t WHERE ...);

-- ✅ 用 JOIN 写法或临时表
\`\`\`

### 九、生产建议

1. **危险操作先 SELECT**：确认 WHERE 命中的行
2. **开事务**：\`BEGIN\` → 操作 → 验证 → \`COMMIT\`/\`ROLLBACK\`
3. **限流批量更新**：一次更新 10 万行会锁表，分批每次 1000
4. **重要数据软删除**：保留审计能力
5. **定期 VACUUM**：回收已删除数据的空间

下面代码演示 UPDATE 和 DELETE 的各种用法。`,
    code: `-- ============================================================
-- 第五章演示：UPDATE 与 DELETE
-- ============================================================

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price REAL,
  stock INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active'
);

INSERT INTO products (name, category, price, stock) VALUES
  ('手机', '电子', 2999, 100),
  ('耳机', '电子', 299, 500),
  ('T恤', '服装', 89, 1000),
  ('外套', '服装', 599, 200),
  ('笔记本电脑', '电子', 6999, 50),
  ('袜子', '服装', 19, 2000);

SELECT '初始数据:' AS info;
SELECT * FROM products;

-- 1. UPDATE 改单条
UPDATE products SET price = 2799 WHERE id = 1;
SELECT '1. 手机降价后:' AS info;
SELECT id, name, price FROM products WHERE id = 1;

-- 2. UPDATE 改多列
UPDATE products SET price = 549, stock = 150 WHERE id = 4;
SELECT '2. 外套改价改库存:' AS info;
SELECT id, name, price, stock FROM products WHERE id = 4;

-- 3. UPDATE 用表达式（电子类涨价 10%）
UPDATE products SET price = price * 1.1 WHERE category = '电子';
SELECT '3. 电子类涨价 10%:' AS info;
SELECT name, price FROM products WHERE category = '电子';

-- 4. UPDATE 用 CASE 分情况
UPDATE products SET status = CASE
  WHEN stock < 100 THEN 'low_stock'
  WHEN stock < 500 THEN 'normal'
  ELSE 'overstocked'
END;
SELECT '4. 按库存分级:' AS info;
SELECT name, stock, status FROM products;

-- 5. DELETE 删单条
DELETE FROM products WHERE id = 6;
SELECT '5. 删除袜子后:' AS info;
SELECT id, name FROM products;

-- 6. DELETE 按条件
DELETE FROM products WHERE price > 5000;
SELECT '6. 删除高价商品后:' AS info;
SELECT id, name, price FROM products;

-- 7. 软删除演示
ALTER TABLE products ADD COLUMN deleted_at TEXT;
UPDATE products SET deleted_at = datetime('now', 'localtime') WHERE id = 2;
SELECT '7. 软删除耳机后（查未删除的）:' AS info;
SELECT id, name, deleted_at FROM products WHERE deleted_at IS NULL;

-- 8. 事务演示
BEGIN;
UPDATE products SET stock = stock - 10 WHERE id = 1;
SELECT '8. 事务内（未提交）:' AS info;
SELECT id, name, stock FROM products WHERE id = 1;
ROLLBACK;
SELECT '8. 回滚后（恢复）:' AS info;
SELECT id, name, stock FROM products WHERE id = 1;`,
  },

  // =========================================================
  // 第六章：约束 Constraints
  // =========================================================
  {
    id: "sql-constraints",
    group: "SQL 基础",
    icon: "🔒",
    title: "约束 Constraints",
    content: `## 约束 Constraints

约束是数据库帮你**强制保证数据正确**的规则。没有约束的数据库就是个"共享 Excel"，谁都能写脏数据。本章讲透 6 大约束。

### 一、六大约束一览

| 约束 | 作用 | 关键字 |
| --- | --- | --- |
| **NOT NULL** | 列不能为空 | \`NOT NULL\` |
| **DEFAULT** | 默认值 | \`DEFAULT\` |
| **UNIQUE** | 值唯一 | \`UNIQUE\` |
| **PRIMARY KEY** | 主键（非空+唯一） | \`PRIMARY KEY\` |
| **CHECK** | 满足条件 | \`CHECK\` |
| **FOREIGN KEY** | 外键引用 | \`FOREIGN KEY\` |

### 二、NOT NULL：禁止空值

\`\`\`sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,      -- 必填
  email TEXT               -- 可空
);

INSERT INTO users (name) VALUES ('Alice');  -- OK
INSERT INTO users (email) VALUES ('x@y.com');  -- 报错：name 不能为空
\`\`\`

**心法**：能 NOT NULL 就 NOT NULL。NULL 是"万恶之源"，查询、聚合、索引都会出问题。

### 三、DEFAULT：默认值

\`\`\`sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

INSERT INTO orders (id) VALUES (1);  -- status='pending', created_at=当前时间
\`\`\`

### 四、UNIQUE：值唯一

\`\`\`sql
-- 列级
CREATE TABLE users (
  email TEXT UNIQUE
);

-- 表级（可多列组合唯一）
CREATE TABLE users (
  first_name TEXT,
  last_name TEXT,
  UNIQUE (first_name, last_name)
);
\`\`\`

**NULL 的特殊处理**：SQL 标准中多个 NULL 不算重复（SQLite/PostgreSQL 遵循，MySQL 视为重复）。

### 五、PRIMARY KEY：主键

主键 = NOT NULL + UNIQUE，用于唯一标识一行。

\`\`\`sql
-- 单列主键
CREATE TABLE t1 (id INTEGER PRIMARY KEY, name TEXT);

-- 复合主键
CREATE TABLE t2 (
  user_id INTEGER,
  role_id INTEGER,
  PRIMARY KEY (user_id, role_id)
);
\`\`\`

**主键选型**：
- **自增整数**：\`INTEGER PRIMARY KEY\`（SQLite 自动自增），简单高效
- **UUID**：\`TEXT\`，适合分布式（无中心 ID 生成）
- **雪花算法**：有序长整型，分布式友好
- **业务主键**：用身份证号、手机号，不推荐（业务规则会变）

### 六、CHECK：条件约束

\`\`\`sql
CREATE TABLE products (
  price REAL CHECK(price > 0),
  stock INTEGER CHECK(stock >= 0),
  status TEXT CHECK(status IN ('active', 'inactive', 'draft'))
);

-- 表级 CHECK（跨列条件）
CREATE TABLE events (
  start_time TEXT,
  end_time TEXT,
  CHECK(end_time > start_time)
);
\`\`\`

**CHECK 的作用**：在 INSERT/UPDATE 时校验，不满足则报错。

### 七、FOREIGN KEY：外键

外键建立表间引用关系，保证"引用完整性"。

\`\`\`sql
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT,
  dept_id INTEGER,
  FOREIGN KEY (dept_id) REFERENCES departments(id)
);
\`\`\`

**外键的作用**：
- 插入 employee 时，dept_id 必须在 departments 中存在
- 删除 department 时，如果有 employee 引用，会阻止（或级联处理）

**外键的 ON DELETE / ON UPDATE 行为**：

| 行为 | 说明 |
| --- | --- |
| \`RESTRICT\`（默认） | 拒绝删除（有引用就报错） |
| \`CASCADE\` | 级联删除（删部门时，把员工也删了） |
| \`SET NULL\` | 置空（删部门时，员工 dept_id 变 NULL） |
| \`SET DEFAULT\` | 设为默认值 |

\`\`\`sql
CREATE TABLE employees (
  dept_id INTEGER,
  FOREIGN KEY (dept_id) REFERENCES departments(id)
    ON DELETE CASCADE      -- 删部门时级联删员工
    ON UPDATE CASCADE      -- 改部门 ID 时同步更新
);
\`\`\`

### 八、SQLite 外键需手动开启

**重要**：SQLite 默认**关闭**外键约束！必须手动开启：

\`\`\`sql
PRAGMA foreign_keys = ON;  -- 当前连接开启
\`\`\`

不开启时，外键声明只是"摆设"，不校验。

### 九、约束的踩坑点

**坑 1：外键拖慢写入**
外键每次 INSERT/UPDATE/DELETE 都要查引用表，高并发写入时成为瓶颈。部分团队选择"应用层保证"，关外键换性能。

**坑 2：CASCADE 级联删除误删**
\`\`\`sql
-- ON DELETE CASCADE：删父记录会删子记录
-- 误删一个部门 → 所有员工被删
\`\`\`
慎用 CASCADE，建议用 \`RESTRICT\` + 软删除。

**坑 3：CHECK 不校验已有数据**
\`\`\`sql
-- 已有违规数据时加 CHECK 可能失败
ALTER TABLE t ADD CHECK(price > 0);  -- 如果有 price <= 0 的行会报错
\`\`\`

**坑 4：复合 UNIQUE 与单列 UNIQUE 区别**
\`\`\`sql
UNIQUE (a, b)    -- (1,2) 和 (1,3) 不冲突（a 相同但 b 不同）
UNIQUE (a), UNIQUE (b)  -- (1,2) 和 (1,3) 冲突（a 都为 1）
\`\`\`

### 十、生产建议

1. **核心字段必 NOT NULL**：name、created_at、status 等
2. **业务唯一字段加 UNIQUE**：邮箱、手机号
3. **外键看场景**：强一致性用，高并发可关
4. **CHECK 保数据质量**：金额非负、状态枚举
5. **主键不要用业务字段**：身份证号会改、手机号会换

下面代码演示各种约束。`,
    code: `-- ============================================================
-- 第六章演示：约束 Constraints
-- ============================================================

-- 开启外键约束（SQLite 必须）
PRAGMA foreign_keys = ON;

-- 1. NOT NULL + DEFAULT + UNIQUE
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  age INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active'
);

INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');
INSERT INTO users (name, email) VALUES ('Bob', 'bob@example.com');

SELECT '1. 用户表:' AS info;
SELECT * FROM users;

-- 2. UNIQUE 约束测试（重复邮箱会被忽略）
INSERT OR IGNORE INTO users (name, email) VALUES ('Charlie', 'alice@example.com');
-- 用 INSERT OR IGNORE：违反 UNIQUE 时静默跳过（不报错）

SELECT '2. UNIQUE 阻止重复邮箱（仍只有 2 条）:' AS info;
SELECT COUNT(*) AS 用户数 FROM users;

-- 3. CHECK 约束
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL CHECK(price > 0),
  stock INTEGER DEFAULT 0 CHECK(stock >= 0),
  category TEXT CHECK(category IN ('电子', '服装', '食品'))
);

INSERT INTO products (name, price, stock, category) VALUES ('手机', 2999, 100, '电子');
INSERT INTO products (name, price, stock, category) VALUES ('T恤', 89, 50, '服装');

-- 用 INSERT OR IGNORE 演示 CHECK 失败（价格 <= 0 会被跳过）
INSERT OR IGNORE INTO products (name, price, stock, category) VALUES ('赠品', 0, 10, '电子');
-- 赠品 price=0 违反 CHECK(price > 0)，被 OR IGNORE 静默跳过

SELECT '3. CHECK 约束（价格>0 才能插入，赠品被跳过）:' AS info;
SELECT id, name, price FROM products;

-- 4. 外键 + 级联
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  dept_id INTEGER,
  FOREIGN KEY (dept_id) REFERENCES departments(id)
    ON DELETE SET NULL
);

INSERT INTO departments (name) VALUES ('技术部'), ('市场部');
INSERT INTO employees (name, dept_id) VALUES
  ('张三', 1),
  ('李四', 1),
  ('王五', 2);

SELECT '4. 员工表（含部门）:' AS info;
SELECT e.name AS 员工, d.name AS 部门
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;

-- 5. 外键阻止无效引用
-- 直接 INSERT dept_id=999 会被外键约束拒绝：FOREIGN KEY constraint failed
-- 注意：INSERT OR IGNORE 无法忽略外键冲突（外键不走 ON CONFLICT 机制）
-- 安全写法：用 INSERT ... SELECT ... WHERE EXISTS 先检查引用是否存在
INSERT INTO employees (name, dept_id)
  SELECT '赵六', 999
  WHERE EXISTS (SELECT 1 FROM departments WHERE id = 999);
-- 部门 999 不存在，WHERE EXISTS 返回 false，所以不会插入任何行

SELECT '5. 外键阻止无效引用（赵六未插入）:' AS info;
SELECT COUNT(*) AS 员工数 FROM employees;

-- 6. 级联删除测试（ON DELETE SET NULL）
DELETE FROM departments WHERE id = 1;
SELECT '6. 删技术部后，员工 dept_id 变 NULL:' AS info;
SELECT e.name, e.dept_id FROM employees e;

-- 7. 复合唯一约束
CREATE TABLE enrollments (
  student_id INTEGER,
  course_id INTEGER,
  PRIMARY KEY (student_id, course_id)
);

INSERT INTO enrollments VALUES (1, 1), (1, 2), (2, 1);
-- 重复插入用 INSERT OR IGNORE 演示（复合主键冲突时跳过）
INSERT OR IGNORE INTO enrollments VALUES (1, 1);  -- (1,1) 已存在，被跳过

SELECT '7. 复合主键（1,1 重复被阻止）:' AS info;
SELECT * FROM enrollments;`,
  },
];
