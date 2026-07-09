export const chapters = [
  {
    id: "pyb-6-1",
    group: "数据库基础与SQL",
    icon: "🗄️",
    title: "关系型数据库基础 - 数据库概念、表/行/列/主键/外键、数据类型、MySQL/PostgreSQL/SQLite对比",
    content: `

# 关系型数据库基础

## 一、数据库基础概念

### 1.1 什么是数据库

数据库（Database）是按照数据结构来组织、存储和管理数据的仓库。关系型数据库（RDBMS）是基于关系模型的数据库，使用表格来存储数据，表与表之间可以建立关联关系。

### 1.2 核心术语

| 术语 | 英文 | 说明 | 类比Excel |
|------|------|------|-----------|
| 数据库 | Database | 数据的集合，包含多个表 | 整个Excel文件 |
| 表 | Table | 二维结构存储同类数据 | 一个工作表 |
| 行 | Row/Record | 一条记录 | 一行数据 |
| 列 | Column/Field | 一个属性字段 | 一列 |
| 主键 | Primary Key | 唯一标识一条记录 | 行号 |
| 外键 | Foreign Key | 关联其他表的主键 | 引用其他表的列 |
| 索引 | Index | 加速查询的数据结构 | 目录 |
| 视图 | View | 虚拟表，基于查询结果 | 筛选后的视图 |
| 约束 | Constraint | 数据完整性规则 | 数据验证规则 |

---

## 二、表结构设计基础

### 2.1 主键（Primary Key）

主键是表中记录的唯一标识符：
- 必须唯一且非空（NOT NULL + UNIQUE）
- 一个表只能有一个主键
- 主键可以由一列或多列组成（复合主键）
- 主键值不应修改，不应包含业务含义（建议使用自增ID或UUID）

\`\`\`sql
-- 自增主键（MySQL）
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL
);

-- UUID主键（PostgreSQL）
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL
);

-- 复合主键
CREATE TABLE order_items (
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    PRIMARY KEY (order_id, product_id)
);
\`\`\`

### 2.2 外键（Foreign Key）

外键用于建立表与表之间的关联关系，保证引用完整性：

\`\`\`sql
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    dept_id INT,
    -- 外键约束，引用departments表的id
    FOREIGN KEY (dept_id) REFERENCES departments(id)
        ON DELETE SET NULL  -- 部门删除时，员工的dept_id设为NULL
        ON UPDATE CASCADE   -- 部门id更新时，员工的dept_id也更新
);
\`\`\`

外键约束策略：
- CASCADE：删除/更新父表记录时，自动删除/更新子表记录
- SET NULL：设置为NULL（子表外键列允许NULL）
- SET DEFAULT：设置为默认值
- RESTRICT/NO ACTION：拒绝父表的删除/更新操作（默认）

### 2.3 常用约束类型

| 约束 | 作用 |
|------|------|
| PRIMARY KEY | 主键，唯一且非空 |
| FOREIGN KEY | 外键，引用完整性 |
| UNIQUE | 唯一约束，值不能重复 |
| NOT NULL | 非空约束，不能为NULL |
| DEFAULT | 默认值 |
| CHECK | 自定义检查约束（MySQL 8.0.16+支持） |

\`\`\`sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,  -- SKU唯一
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
\`\`\`

---

## 三、数据类型详解

### 3.1 数值类型

| 类型 | MySQL | PostgreSQL | SQLite | 说明 |
|------|-------|------------|--------|------|
| 小整数 | TINYINT (1字节) | SMALLINT (2字节) | INTEGER | -128~127 |
| 整数 | INT/INTEGER (4字节) | INTEGER (4字节) | INTEGER | -21亿~21亿 |
| 大整数 | BIGINT (8字节) | BIGINT (8字节) | INTEGER | 超大数 |
| 小数 | DECIMAL/NUMERIC | DECIMAL/NUMERIC | REAL | 精确小数 |
| 浮点数 | FLOAT/DOUBLE | REAL/DOUBLE PRECISION | REAL | 近似值，不要存金额 |
| 布尔 | BOOL/TINYINT(1) | BOOLEAN | INTEGER(0/1) | PostgreSQL原生支持BOOL |

\`\`\`sql
-- 金额必须用DECIMAL
price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,  -- 总共10位，小数2位：最大99999999.99
tax_rate DECIMAL(5, 4) DEFAULT 0.1300,       -- 税率：0.0000~0.9999

-- ❌ 错误：用FLOAT存金额会有精度问题
-- price FLOAT  -- 可能出现0.1+0.2=0.30000000000000004的问题
\`\`\`

### 3.2 字符串类型

| 类型 | MySQL | PostgreSQL | SQLite | 说明 |
|------|-------|------------|--------|------|
| 短文本 | VARCHAR(n) | VARCHAR(n) | TEXT | 变长字符串 |
| 长文本 | TEXT | TEXT | TEXT | 最大64KB(MySQL TEXT) |
| 定长字符串 | CHAR(n) | CHAR(n) | TEXT | 固定长度，如邮编 |
| 超大文本 | LONGTEXT | - | TEXT | MySQL特有，4GB |
| 二进制 | BLOB | BYTEA | BLOB | 存储二进制数据 |

\`\`\`sql
name VARCHAR(100) NOT NULL,       -- 用户名，变长
phone CHAR(11),                   -- 手机号固定11位
description TEXT,                 -- 商品描述
avatar BLOB,                      -- 头像二进制数据（不推荐，通常存文件路径）
\`\`\`

### 3.3 日期时间类型

| 类型 | MySQL | PostgreSQL | SQLite | 说明 |
|------|-------|------------|--------|------|
| 日期 | DATE | DATE | TEXT | YYYY-MM-DD |
| 时间 | TIME | TIME | TEXT | HH:MM:SS |
| 日期时间 | DATETIME | TIMESTAMP | TEXT | YYYY-MM-DD HH:MM:SS |
| 时间戳 | TIMESTAMP | TIMESTAMPTZ | INTEGER | 自动时区转换 |

\`\`\`sql
-- 推荐使用方式
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- MySQL自动更新
birth_date DATE,
login_time TIME,

-- PostgreSQL推荐TIMESTAMPTZ（带时区）
created_at TIMESTAMPTZ DEFAULT NOW(),
\`\`\`

---

## 四、三大关系型数据库对比

### 4.1 特性对比

| 特性 | MySQL | PostgreSQL | SQLite |
|------|-------|------------|--------|
| 开发公司 | Oracle | PostgreSQL全球开发组 | D. Richard Hipp |
| 开源协议 | GPL/商业双协议 | PostgreSQL License（类MIT） | 公有领域 |
| 架构 | C/S（客户端/服务器） | C/S | 嵌入式（文件级） |
| 安装配置 | 需要安装服务 | 需要安装服务 | 无需安装，单文件 |
| 并发性能 | 高 | 极高（MVCC更好） | 写操作锁库 |
| 适用场景 | Web应用、互联网业务 | 复杂查询、企业级、GIS | 移动App、小型项目、测试 |
| JSON支持 | JSON类型（5.7+） | JSONB（极强大） | JSON1扩展 |
| 全文搜索 | FULLTEXT索引 | 内置全文搜索 | FTS5扩展 |
| 扩展性 | 一般 | 极强（自定义类型、函数、扩展） | 一般 |

### 4.2 选择建议

| 场景 | 推荐数据库 | 理由 |
|------|-----------|------|
| 互联网Web应用 | MySQL | 生态成熟、运维工具丰富、开发者众多 |
| 复杂查询、数据仓库 | PostgreSQL | 查询优化器更强、支持复杂SQL、窗口函数 |
| GIS地理信息 | PostgreSQL + PostGIS | 最强大的开源GIS支持 |
| 移动App/桌面软件 | SQLite | 零配置、单文件、轻量 |
| 原型开发/单元测试 | SQLite | 无需安装，快速启动 |
| 高并发电商/金融 | PostgreSQL/MySQL | 事务支持完善 |
| 需要存储大量JSON | PostgreSQL(JSONB) | 可以对JSON建索引，查询性能好 |

---

## 五、数据库设计范式

关系数据库设计有几个经典范式（NF）：

### 5.1 第一范式（1NF）- 列不可再分
- 每列都是原子值，不可再拆分
- ❌ 错误：address字段存"北京市海淀区中关村大街1号"（应该拆分为省、市、区、街道）
- ❌ 错误：一个字段存多个值如"篮球,足球,乒乓球"（应该用关联表）

### 5.2 第二范式（2NF）- 消除部分依赖
- 在1NF基础上，非主键列必须完全依赖于整个主键
- 适用于复合主键的情况，非主键字段不能只依赖主键的一部分

### 5.3 第三范式（3NF）- 消除传递依赖
- 在2NF基础上，非主键列之间不能有依赖关系
- 不常查询的属性可以分离到其他表

\`\`\`sql
-- ❌ 不符合3NF（部门名依赖dept_id，不直接依赖emp_id）
CREATE TABLE employees (
    emp_id INT PRIMARY KEY,
    emp_name VARCHAR(100),
    dept_id INT,
    dept_name VARCHAR(100),  -- 传递依赖：dept_name -> dept_id -> emp_id
    dept_manager VARCHAR(100)
);

-- ✅ 符合3NF
CREATE TABLE departments (
    dept_id INT PRIMARY KEY,
    dept_name VARCHAR(100),
    dept_manager VARCHAR(100)
);
CREATE TABLE employees (
    emp_id INT PRIMARY KEY,
    emp_name VARCHAR(100),
    dept_id INT REFERENCES departments(dept_id)
);
\`\`\`

### 5.4 反范式化

实际项目中不必严格遵循范式，适当冗余可以提升查询性能：
- 适当冗余一些经常需要联表查询的字段
- 统计字段（如订单表冗余商品数量、总金额）
- 日志/报表类数据可以高度反范式

---

## 六、面试常见问题

**Q: 主键和唯一索引的区别？**
A: 1. 一个表只能有一个主键，可以有多个唯一索引；2. 主键不能为NULL，唯一索引可以有一个NULL；3. 主键默认是聚簇索引（InnoDB），唯一索引默认是非聚簇索引。

**Q: CHAR和VARCHAR的区别？**
A: CHAR是定长，存储时会用空格填充到指定长度，检索效率高但浪费空间；VARCHAR是变长，按实际长度存储，节省空间但需要额外字节记录长度。适合存储长度固定的值（如手机号、邮编）。

**Q: 为什么金额要用DECIMAL而不是FLOAT/DOUBLE？**
A: FLOAT/DOUBLE是浮点数，存储的是近似值，会有精度丢失问题（如0.1+0.2≠0.3）。DECIMAL是精确小数类型，以字符串形式存储，适合金融场景。
`
  },
  {
    id: "pyb-6-2",
    group: "数据库基础与SQL",
    icon: "🗄️",
    title: "SQL基础语法 - DDL(建表/改表)、DML(增删改查)、WHERE条件、ORDER BY/LIMIT、基本SELECT查询",
    content: `

# SQL基础语法

## 一、SQL分类

SQL（Structured Query Language）结构化查询语言，按功能分为几类：

| 分类 | 全称 | 命令 | 作用 |
|------|------|------|------|
| DDL | Data Definition Language | CREATE, ALTER, DROP, TRUNCATE | 定义/修改表结构 |
| DML | Data Manipulation Language | INSERT, UPDATE, DELETE | 增删改数据 |
| DQL | Data Query Language | SELECT | 查询数据 |
| DCL | Data Control Language | GRANT, REVOKE | 权限控制 |
| TCL | Transaction Control Language | COMMIT, ROLLBACK, SAVEPOINT | 事务控制 |

---

## 二、DDL - 数据定义语言

### 2.1 CREATE TABLE - 建表

\`\`\`sql
-- 基础建表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    phone VARCHAR(20) COMMENT '手机号',
    age TINYINT UNSIGNED COMMENT '年龄',
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT '账户余额',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0禁用1正常',
    bio TEXT COMMENT '个人简介',
    avatar_url VARCHAR(500) COMMENT '头像URL',
    last_login_at DATETIME COMMENT '最后登录时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
\`\`\`

### 2.2 ALTER TABLE - 修改表结构

\`\`\`sql
-- 添加列
ALTER TABLE users ADD COLUMN gender TINYINT DEFAULT 0 COMMENT '性别' AFTER phone;

-- 修改列
ALTER TABLE users MODIFY COLUMN username VARCHAR(80) NOT NULL COMMENT '用户名';

-- 重命名列（MySQL 8.0+）
ALTER TABLE users RENAME COLUMN avatar_url TO avatar;

-- 删除列
ALTER TABLE users DROP COLUMN bio;

-- 添加索引
ALTER TABLE users ADD INDEX idx_phone (phone);
ALTER TABLE users ADD UNIQUE INDEX uk_phone (phone);

-- 删除索引
ALTER TABLE users DROP INDEX idx_phone;

-- 添加外键
ALTER TABLE orders ADD CONSTRAINT fk_orders_user 
    FOREIGN KEY (user_id) REFERENCES users(id);

-- 重命名表
ALTER TABLE users RENAME TO app_users;
\`\`\`

### 2.3 DROP & TRUNCATE

\`\`\`sql
-- 删除表（结构和数据都删除，不可回滚）
DROP TABLE IF EXISTS users;

-- 清空表（保留表结构，删除所有数据，不可回滚，速度快）
TRUNCATE TABLE users;

-- DELETE也可以清空数据，但可以回滚，速度慢（逐行删除）
DELETE FROM users;
\`\`\`

| 操作 | 删除内容 | 能否回滚 | 速度 | 自增ID重置 |
|------|----------|----------|------|------------|
| DROP | 表结构+数据 | 否 | 最快 | - |
| TRUNCATE | 数据 | 否 | 快 | 是 |
| DELETE | 数据 | 可以（在事务中） | 慢 | 否 |

---

## 三、DML - 数据操作语言

### 3.1 INSERT - 插入数据

\`\`\`sql
-- 插入单条
INSERT INTO users (username, email, password_hash, age)
VALUES ('alice', 'alice@example.com', 'hashed_password', 25);

-- 插入多条
INSERT INTO users (username, email, password_hash, age)
VALUES 
    ('bob', 'bob@example.com', 'hash1', 30),
    ('charlie', 'charlie@example.com', 'hash2', 28),
    ('diana', 'diana@example.com', 'hash3', 35);

-- 插入时忽略重复键错误
INSERT IGNORE INTO users (username, email) VALUES ('alice', 'new@example.com');

-- 插入时更新（UPSERT）
INSERT INTO users (username, email, age)
VALUES ('alice', 'alice@example.com', 26)
ON DUPLICATE KEY UPDATE age = VALUES(age), updated_at = NOW();  -- MySQL

-- PostgreSQL的UPSERT
INSERT INTO users (username, email, age)
VALUES ('alice', 'alice@example.com', 26)
ON CONFLICT (username) DO UPDATE SET age = EXCLUDED.age;
\`\`\`

### 3.2 UPDATE - 更新数据

\`\`\`sql
-- 更新单表
UPDATE users 
SET age = 26, phone = '13800138000'
WHERE id = 1;

-- 更新多列
UPDATE users 
SET 
    balance = balance + 100,
    status = 1,
    updated_at = NOW()
WHERE status = 0 AND created_at < '2023-01-01';

-- 多表关联更新（MySQL）
UPDATE orders o
JOIN users u ON o.user_id = u.id
SET o.status = 'cancelled'
WHERE u.status = 0;

-- ⚠️ 危险：没有WHERE会更新全表！
-- UPDATE users SET status = 0;  -- 所有用户都变成禁用！
-- 安全模式：MySQL可以开启sql_safe_updates
SET sql_safe_updates = 1;  -- 禁止没有WHERE或LIMIT的UPDATE/DELETE
\`\`\`

### 3.3 DELETE - 删除数据

\`\`\`sql
-- 删除指定记录
DELETE FROM users WHERE id = 100;

-- 条件删除
DELETE FROM users WHERE status = 0 AND last_login_at < '2022-01-01';

-- 限制删除数量（分批删除，避免长事务）
DELETE FROM logs WHERE created_at < '2023-01-01' LIMIT 1000;

-- 多表删除
DELETE o FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE u.id IS NULL;  -- 删除没有对应用户的订单

-- ⚠️ 极度危险：没有WHERE删除全表！
-- DELETE FROM users;
\`\`\`

---

## 四、DQL - 数据查询语言

### 4.1 基础SELECT

\`\`\`sql
-- 查询所有列（生产环境不推荐，只查需要的列）
SELECT * FROM users;

-- 查询指定列
SELECT id, username, email FROM users;

-- 别名
SELECT 
    id AS user_id,
    username,
    email AS user_email
FROM users;

-- 去重
SELECT DISTINCT status FROM users;

-- 计算列
SELECT 
    username,
    age,
    balance,
    balance * 1.05 AS balance_with_interest  -- 计算
FROM users;

-- 常量列
SELECT id, username, 'active' AS account_status FROM users WHERE status = 1;
\`\`\`

### 4.2 WHERE条件

\`\`\`sql
-- 比较运算符
SELECT * FROM users WHERE age >= 18 AND age <= 60;
SELECT * FROM users WHERE status <> 0;  -- 不等于
SELECT * FROM users WHERE status != 0;  -- 不等于

-- BETWEEN
SELECT * FROM users WHERE age BETWEEN 18 AND 30;
SELECT * FROM users WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';

-- IN
SELECT * FROM users WHERE id IN (1, 2, 3, 5, 8);
SELECT * FROM users WHERE status IN (0, 1);

-- IS NULL / IS NOT NULL
SELECT * FROM users WHERE phone IS NULL;
SELECT * FROM users WHERE phone IS NOT NULL;
SELECT * FROM users WHERE avatar_url IS NOT NULL;

-- LIKE模糊查询
SELECT * FROM users WHERE username LIKE 'a%';    -- a开头
SELECT * FROM users WHERE username LIKE '%a';    -- a结尾
SELECT * FROM users WHERE username LIKE '%admin%';  -- 包含admin
SELECT * FROM users WHERE username LIKE 'a_c_e'; -- a开头，中间任意一个字符，c，任意一个字符，e结尾
-- NOT LIKE
SELECT * FROM users WHERE username NOT LIKE '%test%';

-- 逻辑运算
SELECT * FROM users 
WHERE (age > 18 OR status = 1) 
  AND created_at >= '2024-01-01'
  AND phone IS NOT NULL;
\`\`\`

### 4.3 ORDER BY排序

\`\`\`sql
-- 单列排序
SELECT * FROM users ORDER BY created_at DESC;  -- 按创建时间倒序
SELECT * FROM users ORDER BY age ASC;  -- 按年龄正序（默认ASC）

-- 多列排序
SELECT * FROM users ORDER BY status ASC, created_at DESC;
-- 先按status正序，status相同的按创建时间倒序

-- 按表达式排序
SELECT *, (balance * 10) AS score FROM users ORDER BY score DESC;

-- NULL值排序处理
SELECT * FROM users ORDER BY phone ASC;  -- MySQL中NULL排在最前
SELECT * FROM users ORDER BY phone IS NULL ASC, phone ASC;  -- NULL排最后
\`\`\`

### 4.4 LIMIT分页

\`\`\`sql
-- 取前N条
SELECT * FROM users LIMIT 10;

-- 分页：跳过M条，取N条
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 0;   -- 第1页
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 20;  -- 第2页
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 40;  -- 第3页

-- MySQL简写
SELECT * FROM users LIMIT 0, 20;    -- OFFSET, LIMIT
SELECT * FROM users LIMIT 20, 20;

-- ⚠️ 深分页问题：OFFSET越大越慢
-- 优化深分页：用id>
SELECT * FROM users WHERE id > 1000 ORDER BY id LIMIT 20;  -- 比OFFSET快得多
\`\`\`

---

## 五、聚合函数与GROUP BY

### 5.1 常用聚合函数

| 函数 | 作用 |
|------|------|
| COUNT() | 计数 |
| SUM() | 求和 |
| AVG() | 平均值 |
| MAX() | 最大值 |
| MIN() | 最小值 |

\`\`\`sql
-- 统计用户数
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(phone) AS users_with_phone FROM users;  -- 排除NULL

-- 统计金额
SELECT 
    COUNT(*) AS order_count,
    SUM(amount) AS total_amount,
    AVG(amount) AS avg_amount,
    MAX(amount) AS max_amount,
    MIN(amount) AS min_amount
FROM orders
WHERE status = 'paid';

-- 结合DISTINCT
SELECT COUNT(DISTINCT user_id) AS paying_users FROM orders WHERE status = 'paid';
\`\`\`

### 5.2 GROUP BY分组

\`\`\`sql
-- 按状态统计用户数
SELECT 
    status,
    COUNT(*) AS user_count,
    AVG(age) AS avg_age
FROM users
GROUP BY status;

-- 按日期统计注册人数
SELECT 
    DATE(created_at) AS register_date,
    COUNT(*) AS daily_new_users
FROM users
GROUP BY DATE(created_at)
ORDER BY register_date DESC;

-- HAVING：分组后过滤（WHERE是分组前过滤）
SELECT 
    status,
    COUNT(*) AS user_count
FROM users
WHERE created_at >= '2024-01-01'  -- 先过滤2024年的用户
GROUP BY status
HAVING COUNT(*) > 10;  -- 只显示数量大于10的分组
\`\`\`

WHERE vs HAVING区别：
- WHERE在分组前过滤行，不能用聚合函数
- HAVING在分组后过滤分组，可以用聚合函数

---

## 六、SQL编写顺序与执行顺序

SQL语句的书写顺序和执行顺序是不同的：

\`\`\`sql
-- 书写顺序
SELECT columns
FROM table
WHERE condition
GROUP BY columns
HAVING group_condition
ORDER BY columns
LIMIT offset, count;

-- 执行顺序
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
\`\`\`

理解执行顺序有助于理解为什么WHERE不能用SELECT中的别名，而ORDER BY可以。

---

## 七、常见坑点

1. **忘记写WHERE条件**：UPDATE/DELETE会更新/删除全表！先用SELECT测试
2. **SELECT * 滥用**：查询不需要的列，增加网络传输和内存消耗
3. **LIKE以%开头**：会导致索引失效，全表扫描
4. **OFFSET深分页**：OFFSET越大性能越差，用主键id>方式优化
5. **在WHERE中对列做函数运算**：WHERE YEAR(created_at) = 2024 无法使用索引
6. **数据类型不匹配**：字符串类型传数字，可能导致索引失效
7. **NULL判断错误**：不能用=NULL或!=NULL，必须用IS NULL/IS NOT NULL
`
  },
  {
    id: "pyb-6-3",
    group: "数据库基础与SQL",
    icon: "🗄️",
    title: "Python数据库连接 - DB-API 2.0规范(PEP249)、pymysql/mysql-connector、psycopg2、sqlite3内置模块",
    content: `

# Python数据库连接

## 一、DB-API 2.0规范（PEP 249）

Python数据库API规范（PEP 249）定义了Python访问数据库的统一接口，所有主流数据库驱动都遵循这个规范。

### 1.1 DB-API核心概念

| 概念 | 说明 |
|------|------|
| 连接(Connection) | 数据库连接对象，负责建立和管理与数据库的连接 |
| 游标(Cursor) | 执行SQL语句、获取结果的对象 |
| 事务(Transaction) | 一组SQL操作的原子单元 |
| 异常体系 | 统一的异常类层次结构 |

### 1.2 DB-API 2.0 核心方法

| 模块级函数 | 作用 |
|-----------|------|
| connect(...) | 建立数据库连接，返回Connection对象 |

| Connection方法 | 作用 |
|----------------|------|
| cursor() | 创建新的游标对象 |
| commit() | 提交当前事务 |
| rollback() | 回滚当前事务 |
| close() | 关闭连接 |

| Cursor方法 | 作用 |
|------------|------|
| execute(sql, params) | 执行单条SQL语句 |
| executemany(sql, seq) | 批量执行SQL |
| fetchone() | 获取下一行结果 |
| fetchmany(size) | 获取多行结果 |
| fetchall() | 获取所有结果 |
| close() | 关闭游标 |

| Cursor属性 | 作用 |
|------------|------|
| description | 结果列的描述信息 |
| rowcount | 上一次操作影响的行数 |
| lastrowid | 最后插入行的ID |

\`\`\`python
# DB-API使用的通用模式（伪代码）
import db_driver  # 如pymysql, psycopg2, sqlite3

# 1. 建立连接
conn = db_driver.connect(
    host='localhost',
    user='user',
    password='pass',
    database='dbname'
)

try:
    # 2. 创建游标
    cursor = conn.cursor()
    
    # 3. 执行SQL
    cursor.execute("SELECT * FROM users WHERE id = %s", (1,))
    
    # 4. 获取结果
    user = cursor.fetchone()
    
    # 5. 提交事务
    conn.commit()
finally:
    # 6. 关闭连接
    conn.close()
\`\`\`

### 1.3 参数化查询（防止SQL注入）

DB-API要求支持参数化查询，但参数占位符有不同风格：

| 数据库 | 占位符风格 | 示例 |
|--------|-----------|------|
| SQLite | qmark | WHERE id = ? |
| MySQL (pymysql) | format | WHERE id = %s |
| PostgreSQL (psycopg2) | pyformat | WHERE id = %(id)s 或 format WHERE id = %s |

\`\`\`python
# ❌ 危险：字符串拼接，SQL注入风险
sql = f"SELECT * FROM users WHERE username = '{username}'"

# ✅ 正确：参数化查询
# SQLite
cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
# MySQL/PostgreSQL
cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
# PostgreSQL命名参数
cursor.execute("SELECT * FROM users WHERE username = %(name)s", {'name': username})
\`\`\`

---

## 二、sqlite3 - Python内置SQLite模块

SQLite是Python自带的轻量级数据库，无需安装任何服务，单文件存储。

### 2.1 sqlite3基础使用

\`\`\`python
import sqlite3
from pathlib import Path

# 连接数据库（文件不存在会自动创建）
# 使用:memory:创建内存数据库
conn = sqlite3.connect('example.db')
# conn = sqlite3.connect(':memory:')  # 内存数据库，程序结束数据丢失

try:
    cursor = conn.cursor()
    
    # 创建表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            age INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 插入数据
    cursor.execute(
        'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
        ('Alice', 'alice@example.com', 25)
    )
    
    # 插入后获取自增ID
    print(f"Inserted user ID: {cursor.lastrowid}")
    
    # 批量插入
    users = [
        ('Bob', 'bob@example.com', 30),
        ('Charlie', 'charlie@example.com', 28),
    ]
    cursor.executemany(
        'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
        users
    )
    print(f"Inserted {cursor.rowcount} users")
    
    # 提交事务
    conn.commit()
    
    # 查询数据
    cursor.execute('SELECT * FROM users WHERE age > ?', (25,))
    
    # 获取列名
    columns = [desc[0] for desc in cursor.description]
    print(f"Columns: {columns}")
    
    # 获取所有结果
    all_users = cursor.fetchall()
    for row in all_users:
        print(row)  # 元组形式
    
    # 获取字典形式的结果
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users')
    for row in cursor.fetchall():
        print(dict(row))  # 字典形式
        print(f"Name: {row['name']}, Email: {row['email']}")
    
finally:
    conn.close()
\`\`\`

### 2.2 sqlite3上下文管理器

\`\`\`python
import sqlite3

# 使用with语句自动管理事务
with sqlite3.connect('example.db') as conn:
    cursor = conn.cursor()
    
    # 上下文管理器会自动commit（无异常时）或rollback（有异常时）
    cursor.execute(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        ('David', 'david@example.com')
    )
# 连接也会自动关闭
\`\`\`

---

## 三、pymysql - MySQL驱动

pymysql是纯Python实现的MySQL客户端，使用广泛。

### 3.1 安装与基础使用

\`\`\`bash
pip install pymysql
# 或使用mysql-connector-python（Oracle官方）
pip install mysql-connector-python
\`\`\`

\`\`\`python
import pymysql
from pymysql.cursors import DictCursor

# 建立连接
conn = pymysql.connect(
    host='localhost',
    port=3306,
    user='root',
    password='password',
    database='testdb',
    charset='utf8mb4',
    cursorclass=DictCursor,  # 返回字典而不是元组
    autocommit=False,  # 手动提交事务
    connect_timeout=10,
)

try:
    with conn.cursor() as cursor:
        # 查询
        cursor.execute("SELECT * FROM users WHERE id = %s", (1,))
        user = cursor.fetchone()
        print(f"User: {user}")
        
        # 插入
        cursor.execute(
            "INSERT INTO users (name, email, age) VALUES (%s, %s, %s)",
            ('Alice', 'alice@example.com', 25)
        )
        print(f"Last insert ID: {cursor.lastrowid}")
        
        # 更新
        cursor.execute(
            "UPDATE users SET age = %s WHERE id = %s",
            (26, cursor.lastrowid)
        )
        print(f"Updated {cursor.rowcount} rows")
        
        # 批量插入
        users = [
            ('Bob', 'bob@example.com', 30),
            ('Charlie', 'charlie@example.com', 28),
        ]
        cursor.executemany(
            "INSERT INTO users (name, email, age) VALUES (%s, %s, %s)",
            users
        )
        
        # 事务提交
        conn.commit()
        
        # 查询列表
        cursor.execute("SELECT * FROM users WHERE age > %s LIMIT 10", (20,))
        users = cursor.fetchall()
        for u in users:
            print(u)

except Exception as e:
    conn.rollback()
    print(f"Error: {e}")
    raise
finally:
    conn.close()
\`\`\`

---

## 四、psycopg2 - PostgreSQL驱动

psycopg2是Python最流行的PostgreSQL驱动，底层用C实现，性能优秀。

### 4.1 安装与基础使用

\`\`\`bash
pip install psycopg2-binary  # 二进制版本，安装快
# pip install psycopg2  # 需要编译，生产环境推荐
\`\`\`

\`\`\`python
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from psycopg2 import sql

# 连接PostgreSQL
conn = psycopg2.connect(
    host='localhost',
    port=5432,
    user='postgres',
    password='password',
    dbname='testdb',
    cursor_factory=RealDictCursor,  # 返回字典
)

try:
    with conn.cursor() as cur:
        # 查询
        cur.execute("SELECT * FROM users WHERE id = %s", (1,))
        user = cur.fetchone()
        print(dict(user))
        
        # 使用命名参数
        cur.execute(
            "SELECT * FROM users WHERE age > %(min_age)s AND status = %(status)s",
            {'min_age': 20, 'status': 'active'}
        )
        
        # JSONB支持
        cur.execute(
            "INSERT INTO events (data) VALUES (%s)",
            (Json({'event': 'login', 'user_id': 1}),)
        )
        
        # 动态SQL（使用psycopg2.sql防止注入）
        table_name = 'users'
        cur.execute(
            sql.SQL("SELECT * FROM {} WHERE id = %s").format(sql.Identifier(table_name)),
            (1,)
        )
        
        conn.commit()
        
        # 批量插入高效方法：execute_values
        from psycopg2.extras import execute_values
        
        users = [
            ('Bob', 'bob@example.com', 30),
            ('Charlie', 'charlie@example.com', 28),
        ]
        execute_values(
            cur,
            "INSERT INTO users (name, email, age) VALUES %s",
            users,
            template="(%s, %s, %s)",
            page_size=1000
        )
        conn.commit()

finally:
    conn.close()
\`\`\`

---

## 五、数据库连接最佳实践

### 5.1 连接管理最佳实践

\`\`\`python
import pymysql
from contextlib import contextmanager

@contextmanager
def get_connection():
    """上下文管理器管理数据库连接"""
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='password',
        database='testdb',
        charset='utf8mb4',
        cursorclass=DictCursor,
    )
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

# 使用
with get_connection() as conn:
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM users WHERE id = %s", (1,))
        user = cursor.fetchone()
\`\`\`

### 5.2 常见坑点

1. **忘记commit**：INSERT/UPDATE/DELETE默认不自动提交
2. **SQL注入**：永远不要字符串拼接SQL，必须用参数化
3. **连接泄漏**：确保连接在finally中关闭
4. **游标未关闭**：用完及时关闭游标
5. **字符集问题**：MySQL连接必须指定charset='utf8mb4'
6. **长连接断开**：使用连接池而不是手动管理长连接
7. **autocommit=True的坑**：自动提交会丢失事务控制，DML语句立即生效
`
  },
  {
    id: "pyb-6-4",
    group: "数据库基础与SQL",
    icon: "🗄️",
    title: "数据库连接池 - 连接池原理、DBUtils/dbutils、SQLAlchemy连接池、连接泄漏排查、池大小调优",
    content: `

# 数据库连接池

## 一、为什么需要连接池

每次数据库操作都创建新连接会带来巨大开销：
1. TCP三次握手
2. 数据库认证
3. 连接权限检查
4. 会话初始化
5. 关闭时的四次挥手

连接池预先创建一组连接，复用连接，显著提升性能。

### 1.1 无连接池vs有连接池性能对比

| 操作 | 无连接池 | 有连接池 |
|------|----------|----------|
| TCP连接建立 | 每次都要 | 首次建立后复用 |
| 认证 | 每次都要 | 首次一次 |
| 延迟 | 高（几十毫秒） | 低（几毫秒） |
| 资源消耗 | 高（连接创建销毁） | 低（连接复用） |
| 数据库压力 | 连接风暴风险 | 连接数可控 |

---

## 二、DBUtils - Python连接池库

DBUtils是Python经典的数据库连接池库，支持两种连接池模式：
- PersistentDB：线程/协程专用连接，持久化
- PooledDB：线程间共享连接池，通常使用这个

### 2.1 DBUtils基础使用

\`\`\`bash
pip install DBUtils
pip install pymysql  # 需要对应的驱动
\`\`\`

\`\`\`python
import pymysql
from dbutils.pooled_db import PooledDB
from pymysql.cursors import DictCursor

# 创建连接池
pool = PooledDB(
    creator=pymysql,           # 使用pymysql驱动
    maxconnections=20,         # 最大连接数
    mincached=5,               # 初始化时预创建的连接数
    maxcached=10,              # 连接池中空闲连接的最大数量
    maxshared=0,               # 最大共享连接数（0表示不共享）
    blocking=True,             # 连接数满时是否等待（False则报错）
    maxusage=None,             # 单个连接最大复用次数（None不限制）
    setsession=[],             # 连接创建后执行的会话命令
    ping=1,                    # 检查连接是否可用：0=不检查,1=每次获取时检查
    
    # pymysql连接参数
    host='localhost',
    port=3306,
    user='root',
    password='password',
    database='testdb',
    charset='utf8mb4',
    cursorclass=DictCursor,
)

def query_one(sql, params=None):
    """查询单条记录"""
    conn = pool.connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql, params)
            return cursor.fetchone()
    finally:
        conn.close()  # 不是真正关闭，而是归还到连接池

def query_all(sql, params=None):
    """查询所有记录"""
    conn = pool.connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql, params)
            return cursor.fetchall()
    finally:
        conn.close()

def execute(sql, params=None):
    """执行插入/更新/删除"""
    conn = pool.connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql, params)
            conn.commit()
            return cursor.lastrowid, cursor.rowcount
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

# 使用示例
user = query_one("SELECT * FROM users WHERE id = %s", (1,))
users = query_all("SELECT * FROM users LIMIT 10")
new_id, affected = execute(
    "INSERT INTO users (name, email) VALUES (%s, %s)",
    ('Alice', 'alice@example.com')
)
\`\`\`

---

## 三、SQLAlchemy连接池

SQLAlchemy内置了强大的连接池实现，被许多框架使用（Flask-SQLAlchemy、FastAPI SQLAlchemy）。

### 3.1 SQLAlchemy连接池配置

\`\`\`python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool, NullPool, SingletonThreadPool

# SQLAlchemy引擎默认使用QueuePool
engine = create_engine(
    'mysql+pymysql://root:password@localhost/testdb?charset=utf8mb4',
    
    # 连接池配置
    pool_size=10,               # 连接池大小
    max_overflow=20,            # 超出pool_size的最大连接数
    pool_recycle=3600,          # 连接回收时间（秒），防止MySQL 8小时断开
    pool_pre_ping=True,         # 获取连接前检查是否有效
    pool_timeout=30,            # 获取连接超时时间（秒）
    pool_use_lifo=True,         # 使用LIFO（后进先出）提高连接复用率
    
    echo=False,                 # 打印SQL
    echo_pool=False,            # 打印连接池日志
)

# 不使用连接池（NullPool）
# engine = create_engine('sqlite:///db.sqlite', poolclass=NullPool)
\`\`\`

### 3.2 连接池状态监控

\`\`\`python
def get_pool_status(engine):
    """获取连接池状态"""
    pool = engine.pool
    return {
        'pool_size': pool.size(),           # 当前池大小
        'checked_in': pool.checkedin(),     # 可用连接数
        'checked_out': pool.checkedout(),   # 正在使用的连接数
        'overflow': pool.overflow(),        # 超出pool_size的连接数
        'invalidated': pool._invalidate_time,  # 失效连接数
    }

# 使用上下文管理器
from contextlib import contextmanager
from sqlalchemy.orm import sessionmaker

Session = sessionmaker(bind=engine)

@contextmanager
def get_session():
    session = Session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

# 使用
with get_session() as session:
    result = session.execute("SELECT * FROM users WHERE id = :id", {"id": 1})
    user = result.fetchone()
\`\`\`

### 3.3 SQLAlchemy连接池工作原理

\`\`\`
                          pool_size=5, max_overflow=3
                          ┌─────────────────────┐
    请求连接 ───────────▶│    连接池(空闲)      │───────▶ 检查pool_pre_ping
                          │  [conn1][conn2]     │         连接有效则使用
                          │  [conn3]            │         无效则重新创建
                          └──────────┬──────────┘
                                     │ pool空了?
                          ┌──────────▼──────────┐
                          │  创建overflow连接    │
                          │  [conn6][conn7]     │  最多max_overflow个
                          │  [conn8]            │
                          └──────────┬──────────┘
                                     │ 也满了?
                          ┌──────────▼──────────┐
                          │ 等待pool_timeout秒  │
                          │  等待其他连接归还    │
                          └─────────────────────┘
\`\`\`

---

## 四、连接池大小调优

### 4.1 连接数计算公式

连接池大小不是越大越好！连接数过多会导致数据库压力增大。

**经典公式（HikariCP作者推荐）**：
\`\`\`
connections = ((core_count * 2) + effective_spindle_count)
\`\`\`

对于Web应用的经验公式：
- 服务端应用：连接数 = CPU核心数 * 2 + 有效磁盘数
- 一般IO密集型：连接池大小 = CPU核心数 * 2 ~ 4
- 不要盲目设置很大的连接池！

### 4.2 不同场景推荐配置

| 场景 | pool_size | max_overflow | 说明 |
|------|-----------|--------------|------|
| 开发环境 | 2 | 3 | 节省资源 |
| 小流量应用 | 5 | 10 | 默认够用 |
| 中等流量 | 10 | 20 | 大部分Web应用 |
| 高并发API | 20~30 | 30~50 | 需要压测调优 |
| 批处理任务 | 5~10 | 5~10 | 批量任务不需要太多连接 |

### 4.3 MySQL vs PostgreSQL连接数差异

| 因素 | MySQL | PostgreSQL |
|------|-------|------------|
| 每个连接内存 | ~256KB | ~2-5MB |
| 推荐最大连接数 | 几百 | 几百（通常100-300） |
| 连接开销 | 较小 | 较大 |
| 推荐pool_size | CPU*2~4 | CPU*1.5~3 |

---

## 五、连接泄漏排查

连接泄漏是指应用从池中获取连接后没有正确归还，导致池耗尽。

### 5.1 连接泄漏症状

1. 获取连接超时（pool_timeout后报错）
2. 数据库连接数持续增长不释放
3. 应用响应越来越慢，最终卡死
4. 重启后暂时恢复，过一段时间又出问题

### 5.2 排查方法

\`\`\`python
import pymysql
import traceback
from dbutils.pooled_db import PooledDB

# 1. 开启SQLAlchemy连接池日志
import logging
logging.basicConfig()
logging.getLogger('sqlalchemy.pool').setLevel(logging.DEBUG)

# 2. 连接泄漏检测（SQLAlchemy）
from sqlalchemy import event
from sqlalchemy.pool import Pool

@event.listens_for(Pool, "checkout")
def on_checkout(dbapi_connection, connection_record, connection_proxy):
    connection_record.info['checkout_trace'] = ''.join(traceback.format_stack())

@event.listens_for(Pool, "checkin")
def on_checkin(dbapi_connection, connection_record):
    connection_record.info.pop('checkout_trace', None)

@event.listens_for(Pool, "close")
def on_close(dbapi_connection, connection_record):
    if 'checkout_trace' in connection_record.info:
        print("=" * 60)
        print("CONNECTION LEAK DETECTED! Connection closed without checkin.")
        print("Checkout traceback:")
        print(connection_record.info['checkout_trace'])
        print("=" * 60)

# 3. 定期检查连接池状态
def monitor_pool(engine):
    status = {
        'checked_out': engine.pool.checkedout(),
        'checked_in': engine.pool.checkedin(),
        'overflow': engine.pool.overflow(),
    }
    print(f"Pool status: {status}")
    if status['checked_out'] > 20:  # 阈值告警
        print("WARNING: High connection usage!")

# 4. 设置maxusage防止连接泄漏拖垮
# 单个连接最多使用1000次就回收
pool = PooledDB(
    creator=pymysql,
    maxconnections=20,
    maxusage=1000,  # 每个连接最多复用1000次
    ...
)
\`\`\`

### 5.3 常见泄漏原因

\`\`\`python
# ❌ 错误1: 没有关闭连接
def bad_query():
    conn = pool.connection()
    cursor = conn.cursor()
    cursor.execute("SELECT ...")
    return cursor.fetchall()
    # conn没有关闭，连接泄漏！

# ✅ 正确: 使用try/finally或contextmanager
def good_query():
    conn = pool.connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT ...")
            return cursor.fetchall()
    finally:
        conn.close()  # 归还连接

# ❌ 错误2: 异常时没有归还连接
def bad_execute():
    conn = pool.connection()
    with conn.cursor() as cursor:
        cursor.execute("INSERT ...")  # 如果这里报错...
        conn.commit()
    conn.close()  # ...这行不会执行，泄漏！

# ✅ 正确: try/finally
def good_execute():
    conn = pool.connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("INSERT ...")
            conn.commit()
    except:
        conn.rollback()
        raise
    finally:
        conn.close()
\`\`\`

---

## 六、连接池最佳实践

1. **必须设置pool_pre_ping=True**：防止使用已断开的连接
2. **设置pool_recycle**：MySQL默认8小时断开空闲连接，设置3600秒以下
3. **连接池大小不要太大**：遵循公式，不是越大越好
4. **必须正确关闭连接**：使用try/finally或contextmanager
5. **监控连接池状态**：checked_out持续增长就是泄漏
6. **设置合理的超时**：pool_timeout避免无限等待
7. **事务尽量短**：获取连接后尽快执行完释放
8. **不要在事务中做外部调用**：HTTP请求、文件IO等不要在持有连接时做
`
  },
  {
    id: "pyb-6-5",
    group: "数据库基础与SQL",
    icon: "🗄️",
    title: "事务与ACID - 事务四大特性、隔离级别(读未提交/读提交/可重复读/串行化)、脏读/不可重复读/幻读、Python事务管理",
    content: `

# 数据库事务与ACID

## 一、什么是事务

事务（Transaction）是数据库操作的最小工作单元，是作为单个逻辑工作单元执行的一系列操作。这些操作要么全部执行成功，要么全部不执行。

经典例子：转账操作
- A给B转账100元
- A账户减100
- B账户加100
- 这两步必须都成功或都失败，不能只执行一步

## 二、ACID四大特性

| 特性 | 英文 | 说明 |
|------|------|------|
| 原子性 | Atomicity | 事务是不可分割的最小单元，要么全部成功，要么全部失败回滚 |
| 一致性 | Consistency | 事务执行前后，数据从一个一致性状态变到另一个一致性状态 |
| 隔离性 | Isolation | 多个并发事务之间相互隔离，一个事务的执行不能被其他事务干扰 |
| 持久性 | Durability | 一个事务一旦提交，它对数据的改变就永久性地保存下来了 |

### 2.1 原子性（Atomicity）

通过undo log（回滚日志）实现。事务执行过程中如果出错或用户主动回滚，数据库会使用undo log回滚到事务开始前的状态。

\`\`\`sql
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;  -- A减100
-- 如果这一步出错，前面的UPDATE会被回滚，不会出现钱扣了对方没收到的情况
UPDATE accounts SET balance = balance + 100 WHERE id = 2;  -- B加100
COMMIT;
\`\`\`

### 2.2 一致性（Consistency）

一致性是事务的最终目标，通过原子性、隔离性、持久性来共同保证。数据库的约束（主键、外键、CHECK约束等）也会保证一致性。

例子：
- 转账前后两个账户总金额不变
- 字段类型约束保证数据合法
- 外键约束保证引用完整性

### 2.3 隔离性（Isolation）

通过MVCC（多版本并发控制）或锁机制实现。隔离性是最复杂的特性，后面隔离级别详解。

### 2.4 持久性（Durability）

通过redo log（重做日志）实现。事务提交时，先写redo log，再修改数据页。即使数据库宕机，重启后可以通过redo log恢复已提交的数据。

\`\`\`
事务提交流程：
1. 写入undo log（用于回滚）
2. 修改内存中的数据页
3. 写入redo log（WAL - Write Ahead Log）
4. 事务commit成功返回
5. 后续异步刷盘到数据文件
\`\`\`

---

## 三、并发事务问题

如果没有隔离性控制，并发执行事务会出现以下问题：

| 问题 | 现象 | 危害 |
|------|------|------|
| 脏读（Dirty Read） | 读到了其他事务未提交的数据 | 数据可能被回滚，读到无效数据 |
| 不可重复读（Non-Repeatable Read） | 同一事务内两次读同一行，结果不同（被其他事务UPDATE并提交） | 数据不一致 |
| 幻读（Phantom Read） | 同一事务内两次查询同一范围，行数不同（其他事务INSERT/DELETE了行） | 数据范围不一致 |

### 3.1 脏读示例

\`\`\`sql
-- 事务A
BEGIN;
UPDATE users SET balance = balance + 100 WHERE id = 1;  -- balance变成200，但未提交

-- 事务B（此时读到了未提交的200，这就是脏读）
SELECT balance FROM users WHERE id = 1;  -- 结果: 200

-- 事务A回滚
ROLLBACK;  -- balance变回100

-- 事务B基于错误的200做了操作，出问题！
\`\`\`

### 3.2 不可重复读示例

\`\`\`sql
-- 事务A
BEGIN;
SELECT balance FROM users WHERE id = 1;  -- 结果: 100

-- 事务B
UPDATE users SET balance = 200 WHERE id = 1;
COMMIT;

-- 事务A再读
SELECT balance FROM users WHERE id = 1;  -- 结果: 200
-- 同一事务内两次读取结果不同，这就是不可重复读
COMMIT;
\`\`\`

### 3.3 幻读示例

\`\`\`sql
-- 事务A
BEGIN;
SELECT COUNT(*) FROM orders WHERE user_id = 1;  -- 结果: 5

-- 事务B
INSERT INTO orders (user_id, amount) VALUES (1, 99);
COMMIT;

-- 事务A再查
SELECT COUNT(*) FROM orders WHERE user_id = 1;  -- 结果: 6
-- 同一条件查询，行数变了，像出现了幻觉，这就是幻读
COMMIT;
\`\`\`

不可重复读重点在于UPDATE/DELETE同一行数据的修改，幻读重点在于INSERT/DELETE导致行数变化。

---

## 四、事务隔离级别

SQL标准定义了4种隔离级别，级别越高，隔离性越强，但并发性能越差：

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 实现 |
|----------|------|-----------|------|------|
| 读未提交（READ UNCOMMITTED） | ❌可能 | ❌可能 | ❌可能 | 基本没用 |
| 读提交（READ COMMITTED） | ✅避免 | ❌可能 | ❌可能 | 语句级快照 |
| 可重复读（REPEATABLE READ） | ✅避免 | ✅避免 | MySQL避免✅/PG可能❌ | 事务级快照 |
| 串行化（SERIALIZABLE） | ✅避免 | ✅避免 | ✅避免 | 完全串行执行 |

| 数据库 | 默认隔离级别 |
|--------|-------------|
| MySQL/InnoDB | REPEATABLE READ（可重复读） |
| PostgreSQL | READ COMMITTED（读提交） |
| Oracle | READ COMMITTED（读提交） |
| SQL Server | READ COMMITTED（读提交） |

### 4.1 设置隔离级别

\`\`\`sql
-- MySQL
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET GLOBAL TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- 查询当前隔离级别
SELECT @@transaction_isolation;

-- PostgreSQL
SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL READ COMMITTED;
SHOW default_transaction_isolation;

-- 也可以在事务开始时指定
BEGIN;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
-- ...SQL操作
COMMIT;
\`\`\`

### 4.2 MySQL InnoDB可重复读如何解决幻读

MySQL InnoDB在REPEATABLE READ级别通过Next-Key Lock（临键锁）解决幻读问题：
- Record Lock：锁住索引记录
- Gap Lock：锁住索引间隙
- Next-Key Lock：Record Lock + Gap Lock组合，锁住记录和前面的间隙

### 4.3 各隔离级别适用场景

| 隔离级别 | 适用场景 |
|----------|----------|
| READ UNCOMMITTED | 几乎不用，没有实际意义 |
| READ COMMITTED | 大多数OLTP场景，Oracle/PG默认，性能好 |
| REPEATABLE READ | MySQL默认，需要事务内一致读的场景 |
| SERIALIZABLE | 金融等高一致性要求场景，性能差 |

---

## 五、Python事务管理

### 5.1 sqlite3事务管理

\`\`\`python
import sqlite3

conn = sqlite3.connect('example.db')
cursor = conn.cursor()

try:
    # sqlite3默认自动开启事务
    cursor.execute("UPDATE accounts SET balance = balance - 100 WHERE id = 1")
    cursor.execute("UPDATE accounts SET balance = balance + 100 WHERE id = 2")
    
    # 手动提交
    conn.commit()
    print("Transaction committed")
except Exception as e:
    # 出错回滚
    conn.rollback()
    print(f"Transaction rolled back: {e}")
finally:
    conn.close()

# autocommit模式（自动提交，每条语句独立事务）
conn = sqlite3.connect('example.db', isolation_level=None)
\`\`\`

### 5.2 pymysql事务管理

\`\`\`python
import pymysql

conn = pymysql.connect(
    host='localhost',
    user='root',
    password='password',
    database='testdb',
    autocommit=False  # 关闭自动提交，手动管理事务
)

try:
    with conn.cursor() as cursor:
        # 转账操作
        cursor.execute(
            "UPDATE accounts SET balance = balance - %s WHERE id = %s",
            (100, 1)
        )
        # 模拟异常
        # raise ValueError("Something went wrong")
        cursor.execute(
            "UPDATE accounts SET balance = balance + %s WHERE id = %s",
            (100, 2)
        )
    
    conn.commit()
    print("Transfer successful")
except Exception as e:
    conn.rollback()
    print(f"Transfer failed, rolled back: {e}")
finally:
    conn.close()
\`\`\`

### 5.3 psycopg2事务管理

\`\`\`python
import psycopg2

conn = psycopg2.connect(
    host='localhost',
    user='postgres',
    password='password',
    dbname='testdb'
)

try:
    with conn.cursor() as cur:
        cur.execute("BEGIN;")  # psycopg2自动开启，可以省略
        cur.execute("UPDATE accounts SET balance = balance - 100 WHERE id = 1")
        cur.execute("UPDATE accounts SET balance = balance + 100 WHERE id = 2")
    
    conn.commit()
except Exception as e:
    conn.rollback()
    raise
finally:
    conn.close()

# 使用with语句自动管理事务（psycopg2的connection支持with）
with psycopg2.connect("dbname=testdb") as conn:
    with conn.cursor() as cur:
        cur.execute("UPDATE accounts SET balance = balance - 100 WHERE id = 1")
        cur.execute("UPDATE accounts SET balance = balance + 100 WHERE id = 2")
    # with块结束时没有异常自动commit，有异常自动rollback
\`\`\`

---

## 六、事务最佳实践

1. **事务尽量短小**：不要在事务中做HTTP请求、文件IO等耗时操作
2. **避免长事务**：长事务会占用连接、锁资源，影响并发
3. **正确处理回滚**：异常时必须rollback
4. **选择合适的隔离级别**：大部分场景READ COMMITTED足够
5. **避免死锁**：固定表访问顺序，按主键顺序更新
6. **不要用autocommit=True**：除非你明确知道为什么需要
7. **批量操作分批提交**：大量数据操作时每N条提交一次，避免大事务
`
  },
  {
    id: "pyb-6-6",
    group: "数据库基础与SQL",
    icon: "🗄️",
    title: "索引原理 - B+树索引、聚簇索引/非聚簇索引、唯一索引/联合索引/全文索引、索引失效场景",
    content: `

# 数据库索引原理与优化

## 一、为什么需要索引

索引是数据库中用于加速查询的数据结构，类似书籍的目录。没有索引时，数据库查询需要做全表扫描（逐行检查），数据量大时极慢。

### 1.1 索引性能对比示例

假设有1000万用户数据：

| 查询方式 | 扫描行数 | 时间复杂度 | 实际耗时 |
|----------|----------|------------|----------|
| 无索引全表扫描 | 1000万行 | O(n) | 几秒~几十秒 |
| 有B+树索引 | ~23层*1 | O(log n) | 几毫秒 |

---

## 二、B+树索引原理

MySQL InnoDB和大多数关系数据库使用B+树作为索引结构。

### 2.1 B树 vs B+树

| 特性 | B树 | B+树 |
|------|-----|------|
| 数据存储 | 每个节点都存数据 | 只有叶子节点存数据 |
| 叶子节点 | 不相连 | 双向链表连接，范围查询快 |
| 非叶子节点 | 存key+data | 只存key，可以放更多索引项 |
| 查询稳定性 | 查询可能在非叶子节点结束，不稳定 | 每次查询都走到叶子节点，稳定 |
| 范围查询 | 需要中序遍历整棵树 | 直接遍历叶子链表，极快 |

### 2.2 B+树结构示意

\`\`\`
                     [30 | 50]
                    /    |    \\
           [10|20]      [40]    [60|70|80]
           /  |  \\       |      /  |  |  \\
          ...  ...  ...  ...  ... ... ...  ...
          ↓链表连接↓
  [10]<->[20]<->[30]<->[40]<->[50]<->[60]<->[70]<->[80]
\`\`\`

B+树特点：
1. 非叶子节点只存储索引key，不存储数据
2. 所有数据都在叶子节点
3. 叶子节点之间用双向链表连接
4. 每个节点大小是一个磁盘页（通常16KB）
5. 树高度通常是3-4层，就能存千万级数据

### 2.3 为什么不用红黑树/二叉树

二叉树/红黑树：
- 树太高（1000万数据约24层）
- 每层一次磁盘IO，24次IO太慢
- 不能有效利用磁盘预读

B+树：
- 矮胖：3-4层就能存大量数据
- 每层一次IO，3次左右就能找到数据
- 节点大小匹配磁盘页大小
- 范围查询方便（叶子链表）

---

## 三、聚簇索引与非聚簇索引

### 3.1 聚簇索引（Clustered Index）

聚簇索引的叶子节点直接存储整行数据。InnoDB中，主键就是聚簇索引。

| 特性 | 说明 |
|------|------|
| 一个表只能有一个 | 数据物理存储顺序只能有一种 |
| 主键默认是聚簇索引 | 没有主键选第一个非空唯一索引，都没有用隐藏row_id |
| 查询主键极快 | 找到叶子节点就是数据 |
| 插入依赖主键顺序 | 自增主键不会页分裂，UUID主键会导致频繁页分裂 |

### 3.2 非聚簇索引（二级索引/Secondary Index）

非聚簇索引（二级索引）的叶子节点存储的是主键值，而不是整行数据。

\`\`\`sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,  -- 聚簇索引
    name VARCHAR(50),
    email VARCHAR(100),
    age INT,
    INDEX idx_name (name),  -- 非聚簇索引，叶子存(name, id)
    INDEX idx_age (age)
);
\`\`\`

查询流程：
1. 通过二级索引idx_name找到name='Alice'的叶子节点
2. 叶子节点存的是主键id=123
3. 再用id=123去聚簇索引查找整行数据（这个过程叫回表）

### 3.3 覆盖索引（Covering Index）

如果查询的列都在索引中，不需要回表，就是覆盖索引，性能极高。

\`\`\`sql
-- 有联合索引 idx_name_email (name, email)
SELECT name, email FROM users WHERE name = 'Alice';
-- 不需要回表，直接从索引就能拿到name和email，覆盖索引

SELECT * FROM users WHERE name = 'Alice';
-- 需要回表拿其他列（age, id等）
\`\`\`

---

## 四、索引类型

### 4.1 主键索引（Primary Key）

- 聚簇索引，唯一且非空
- 每个表必须有一个
- 建议用自增INT/BIGINT

### 4.2 唯一索引（Unique Index）

- 列值不能重复，但可以有一个NULL
- 除了唯一性约束，和普通索引查询性能一样

\`\`\`sql
CREATE UNIQUE INDEX idx_uk_email ON users(email);
ALTER TABLE users ADD UNIQUE INDEX idx_uk_phone (phone);
\`\`\`

### 4.3 普通索引（Normal Index）

- 最基础的索引，加速查询
- 没有唯一性约束

\`\`\`sql
CREATE INDEX idx_age ON users(age);
CREATE INDEX idx_created_at ON users(created_at);
\`\`\`

### 4.4 联合索引（Composite Index）

- 在多个列上创建的索引
- 遵循最左前缀匹配原则

\`\`\`sql
-- 联合索引: (a, b, c)
CREATE INDEX idx_abc ON table_name(a, b, c);
-- 相当于创建了三个索引:
-- (a)
-- (a, b)
-- (a, b, c)
-- 注意: (b), (c), (b,c) 用不到这个索引
\`\`\`

联合索引列顺序原则：
1. 等值查询的列放前面
2. 区分度高的列放前面
3. 范围查询的列放后面
4. 尽量覆盖常用查询

### 4.5 全文索引（Fulltext Index）

- 用于文本内容的关键词搜索
- MySQL 5.6+支持InnoDB全文索引
- PostgreSQL内置全文搜索（更强大）
- 简单场景用数据库，复杂搜索用Elasticsearch

\`\`\`sql
-- MySQL全文索引
CREATE FULLTEXT INDEX ft_content ON articles(content);
SELECT * FROM articles WHERE MATCH(content) AGAINST('数据库 优化');

-- PostgreSQL全文搜索（更推荐）
CREATE INDEX idx_fts_content ON articles USING GIN(to_tsvector('chinese', content));
SELECT * FROM articles WHERE to_tsvector('chinese', content) @@ to_tsquery('数据库 & 优化');
\`\`\`

### 4.6 其他索引类型

| 索引类型 | 适用场景 |
|----------|----------|
| 前缀索引 | 长字符串列，索引前N个字符 |
| 哈希索引 | Memory引擎，等值查询快，不支持范围 |
| GIN索引 | PostgreSQL数组、JSONB、全文搜索 |
| GIST索引 | PostgreSQL地理信息、范围类型 |
| 空间索引 | GIS地理数据（MySQL SPATIAL, PostGIS GIST） |

---

## 五、索引创建原则

### 5.1 适合建索引的列

1. **WHERE条件列**：经常出现在WHERE子句中的列
2. **JOIN关联列**：外键列一定要建索引
3. **ORDER BY/GROUP BY列**：排序分组的列
4. **DISTINCT列**：去重的列
5. **高区分度列**：列值重复率低（如手机号、邮箱）
6. **小表不需要索引**：全表扫描比走索引快

### 5.2 不适合建索引的列

1. **区分度低的列**：如性别只有男/女，索引效果不大
2. **频繁更新的列**：索引维护开销大
3. **大字段**：TEXT/BLOB单独建索引代价大，用前缀索引
4. **很少出现在WHERE中的列**：索引会降低写入性能
5. **数据量小的表**：比如字典表几十条数据，全表扫描更快

---

## 六、索引失效场景（重点！）

以下情况会导致索引失效，查询变成全表扫描：

### 6.1 对索引列使用函数或运算

\`\`\`sql
-- ❌ 失效：对列使用函数
SELECT * FROM users WHERE YEAR(created_at) = 2024;
-- ✅ 改成范围查询
SELECT * FROM users WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

-- ❌ 失效：对列做运算
SELECT * FROM users WHERE age + 1 = 20;
-- ✅ 改写成
SELECT * FROM users WHERE age = 19;
\`\`\`

### 6.2 隐式类型转换

\`\`\`sql
-- phone是VARCHAR类型
-- ❌ 失效：字符串列传数字
SELECT * FROM users WHERE phone = 13800138000;
-- ✅ 正确
SELECT * FROM users WHERE phone = '13800138000';
\`\`\`

### 6.3 LIKE以%开头

\`\`\`sql
-- ❌ 失效：前缀模糊匹配
SELECT * FROM users WHERE name LIKE '%张%';
-- ✅ 可以用到索引：后缀匹配
SELECT * FROM users WHERE name LIKE '张%';

-- 前缀模糊解决方案：
-- 1. 全文索引
-- 2. Elasticsearch等搜索引擎
-- 3. 冗余一个反转字段建索引（很少用）
\`\`\`

### 6.4 OR条件有非索引列

\`\`\`sql
-- age有索引，bio没有索引
-- ❌ 失效：OR连接的列有一个没索引，整体索引失效
SELECT * FROM users WHERE age = 20 OR bio = 'developer';
-- ✅ 改成UNION
SELECT * FROM users WHERE age = 20 UNION SELECT * FROM users WHERE bio = 'developer';
\`\`\`

### 6.5 联合索引不满足最左前缀

\`\`\`sql
-- 索引: (a, b, c)
WHERE a = 1;              -- ✅ 用到索引
WHERE a = 1 AND b = 2;    -- ✅ 用到索引
WHERE a = 1 AND b = 2 AND c = 3;  -- ✅ 用到索引
WHERE b = 2;              -- ❌ 没有a，失效
WHERE c = 3;              -- ❌ 失效
WHERE a = 1 AND c = 3;    -- ⚠️ 只用到a列，c列没用
WHERE b = 2 AND c = 3;    -- ❌ 失效
\`\`\`

### 6.6 NOT IN / NOT EXISTS / != 某些情况

\`\`\`sql
-- ❌ 通常索引失效（优化器认为走全表更快）
SELECT * FROM users WHERE status != 1;
SELECT * FROM users WHERE id NOT IN (1, 2, 3);
-- ✅ 考虑改成IN范围查询或其他方式
SELECT * FROM users WHERE status IN (0, 2, 3);
\`\`\`

---

## 七、EXPLAIN分析查询

使用EXPLAIN查看SQL执行计划，判断是否用到索引：

\`\`\`sql
EXPLAIN SELECT * FROM users WHERE name = 'Alice';

-- 重点关注字段：
-- type: 访问类型（const > eq_ref > ref > range > index > ALL）
--       ALL是全表扫描，必须优化
-- key: 实际用到的索引（NULL表示没用索引）
-- rows: 预估扫描行数
-- Extra: 额外信息
--    Using index: 覆盖索引，很好
--    Using where: 回表查询
--    Using filesort: 额外排序，需要优化
--    Using temporary: 用了临时表，需要优化
\`\`\`

---

## 八、索引最佳实践

1. **主键用自增BIGINT**：避免UUID导致页分裂
2. **优先考虑联合索引**：一个联合索引可以覆盖多个查询
3. **遵循最左前缀**：设计联合索引注意列顺序
4. **避免冗余索引**：有了(a,b)就不需要单独建(a)
5. **控制索引数量**：不是越多越好，每个索引增加写入开销
6. **字符串用前缀索引**：长VARCHAR字段考虑前缀索引
7. **定期用EXPLAIN检查慢查询**：慢查询日志是优化依据
8. **不要过度索引**：写多读少的表少建索引
`
  },
  {
    id: "pyb-6-7",
    group: "数据库基础与SQL",
    icon: "🗄️",
    title: "Python操作MySQL实战 - 用pymysql执行CRUD、批量操作、事务处理、游标类型选择、防止SQL注入",
    content: `

# Python操作MySQL实战

## 一、pymysql完整CRUD实战

### 1.1 数据库初始化与表准备

首先创建示例表结构：

\`\`\`sql
CREATE DATABASE IF NOT EXISTS py_demo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE py_demo;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    password VARCHAR(128) NOT NULL COMMENT '密码哈希',
    age TINYINT UNSIGNED COMMENT '年龄',
    gender TINYINT DEFAULT 0 COMMENT '性别:0未知1男2女',
    balance DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '账户余额',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0禁用1正常',
    phone VARCHAR(20),
    register_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    last_login DATETIME COMMENT '最后登录时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_age (age),
    INDEX idx_status_register (status, register_time),
    INDEX idx_balance (balance)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(64) NOT NULL UNIQUE COMMENT '订单号',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '订单总金额',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending/paid/shipped/completed/cancelled',
    address TEXT COMMENT '收货地址',
    remark TEXT COMMENT '备注',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';
\`\`\`

### 1.2 封装数据库操作类

\`\`\`python
import pymysql
from pymysql.cursors import DictCursor, SSDictCursor
from contextlib import contextmanager
from datetime import datetime
from typing import List, Dict, Optional, Any, Tuple
import uuid
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MySQLClient:
    """MySQL操作客户端"""

    def __init__(self, host='localhost', port=3306, user='root',
                 password='password', database='py_demo', charset='utf8mb4',
                 cursorclass=DictCursor, autocommit=False, **kwargs):
        self.db_config = {
            'host': host,
            'port': port,
            'user': user,
            'password': password,
            'database': database,
            'charset': charset,
            'cursorclass': cursorclass,
            'autocommit': autocommit,
            'connect_timeout': 10,
            **kwargs
        }
        self._conn = None

    @contextmanager
    def get_connection(self):
        """获取数据库连接的上下文管理器"""
        conn = pymysql.connect(**self.db_config)
        try:
            yield conn
            if not self.db_config['autocommit']:
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @contextmanager
    def get_cursor(self, conn, cursorclass=None):
        """获取游标的上下文管理器"""
        cursor = conn.cursor(cursorclass or self.db_config['cursorclass'])
        try:
            yield cursor
        finally:
            cursor.close()

    # ========== CREATE 插入 ==========

    def create_user(self, username: str, email: str, password: str,
                    age: int = None, phone: str = None) -> int:
        """创建单个用户"""
        sql = """
            INSERT INTO users (username, email, password, age, phone)
            VALUES (%s, %s, %s, %s, %s)
        """
        with self.get_connection() as conn:
            with self.get_cursor(conn) as cursor:
                cursor.execute(sql, (username, email, password, age, phone))
                user_id = cursor.lastrowid
                logger.info(f"Created user: id={user_id}, username={username}")
                return user_id

    def create_users_batch(self, users: List[Dict]) -> int:
        """批量创建用户"""
        if not users:
            return 0
        sql = """
            INSERT INTO users (username, email, password, age, phone)
            VALUES (%s, %s, %s, %s, %s)
        """
        params = [(u['username'], u['email'], u['password'],
                   u.get('age'), u.get('phone')) for u in users]
        with self.get_connection() as conn:
            with self.get_cursor(conn) as cursor:
                affected = cursor.executemany(sql, params)
                logger.info(f"Batch created {affected} users")
                return affected

    # ========== READ 查询 ==========

    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """根据ID查询用户"""
        sql = "SELECT * FROM users WHERE id = %s"
        with self.get_connection() as conn:
            with self.get_cursor(conn) as cursor:
                cursor.execute(sql, (user_id,))
                return cursor.fetchone()

    def get_user_by_username(self, username: str) -> Optional[Dict]:
        """根据用户名查询用户"""
        sql = "SELECT * FROM users WHERE username = %s"
        with self.get_connection() as conn:
            with self.get_cursor(conn) as cursor:
                cursor.execute(sql, (username,))
                return cursor.fetchone()

    def list_users(self, page: int = 1, page_size: int = 20,
                   status: int = None, min_age: int = None,
                   max_age: int = None) -> Tuple[List[Dict], int]:
        """
        分页查询用户列表
        返回: (用户列表, 总数)
        """
        conditions = []
        params = []

        if status is not None:
            conditions.append("status = %s")
            params.append(status)
        if min_age is not None:
            conditions.append("age >= %s")
            params.append(min_age)
        if max_age is not None:
            conditions.append("age <= %s")
            params.append(max_age)

        where_clause = " AND ".join(conditions) if conditions else "1=1"

        # 查询总数
        count_sql = f"SELECT COUNT(*) as total FROM users WHERE {where_clause}"

        # 查询分页数据
        offset = (page - 1) * page_size
        data_sql = f"""
            SELECT id, username, email, age, gender, balance, status,
                   register_time, last_login, created_at
            FROM users
            WHERE {where_clause}
            ORDER BY id DESC
            LIMIT %s OFFSET %s
        """

        with self.get_connection() as conn:
            with self.get_cursor(conn) as cursor:
                cursor.execute(count_sql, params)
                total = cursor.fetchone()['total']

                cursor.execute(data_sql, params + [page_size, offset])
                users = cursor.fetchall()
                return users, total

    def get_user_orders(self, user_id: int) -> List[Dict]:
        """查询用户的所有订单"""
        sql = """
            SELECT o.*, u.username
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.user_id = %s
            ORDER BY o.created_at DESC
        """
        with self.get_connection() as conn:
            with self.get_cursor(conn) as cursor:
                cursor.execute(sql, (user_id,))
                return cursor.fetchall()

    # ========== UPDATE 更新 ==========

    def update_user(self, user_id: int, **kwargs) -> int:
        """更新用户信息"""
        if not kwargs:
            return 0
        allowed_fields = {'email', 'age', 'phone', 'gender', 'status', 'password'}
        updates = []
        params = []
        for key, value in kwargs.items():
            if key in allowed_fields:
                updates.append(f"{key} = %s")
                params.append(value)
        if not updates:
            return 0
        updates.append("updated_at = NOW()")
        params.append(user_id)

        sql = f"UPDATE users SET {', '.join(updates)} WHERE id = %s"
        with self.get_connection() as conn:
            with self.get_cursor(conn) as cursor:
                affected = cursor.execute(sql, params)
                logger.info(f"Updated user {user_id}, affected rows: {affected}")
                return affected

    def update_balance(self, user_id: int, amount: Decimal) -> bool:
        """更新账户余额（充值/消费）"""
        # 余额不能为负
        sql = """
            UPDATE users
            SET balance = balance + %s, updated_at = NOW()
            WHERE id = %s AND balance + %s >= 0
        """
        with self.get_connection() as conn:
            with self.get_cursor(conn) as cursor:
                affected = cursor.execute(sql, (amount, user_id, amount))
                return affected > 0

    # ========== DELETE 删除 ==========

    def delete_user(self, user_id: int) -> int:
        """删除用户（物理删除，不推荐）"""
        sql = "DELETE FROM users WHERE id = %s"
        with self.get_connection() as conn:
            with self.get_cursor(conn) as cursor:
                affected = cursor.execute(sql, (user_id,))
                logger.info(f"Deleted user {user_id}")
                return affected

    def soft_delete_user(self, user_id: int) -> int:
        """软删除用户（推荐，只是标记为禁用）"""
        return self.update_user(user_id, status=0)


# 使用示例
if __name__ == '__main__':
    db = MySQLClient(password='your_password')

    # 创建用户
    user_id = db.create_user(
        username='alice',
        email='alice@example.com',
        password='hashed_password',
        age=25,
        phone='138******00'
    )
    print(f"Created user: {user_id}")

    # 批量创建
    batch_users = [
        {'username': 'bob', 'email': 'b**@***********', 'password': 'hash1', 'age': 30},
        {'username': 'charlie', 'email': 'c*******@***********', 'password': 'hash2', 'age': 28},
        {'username': 'diana', 'email': 'd****@***********', 'password': 'hash3', 'age': 35},
    ]
    db.create_users_batch(batch_users)

    # 查询用户
    user = db.get_user_by_id(1)
    print(f"User 1: {user}")

    # 分页查询
    users, total = db.list_users(page=1, page_size=10, min_age=20)
    print(f"Total users: {total}, page 1 count: {len(users)}")

    # 更新
    db.update_user(1, age=26, phone='139******00')

    # 充值
    db.update_balance(1, Decimal('1000.00'))
\`\`\`

---

## 二、事务处理实战

### 2.1 转账事务（经典案例）

\`\`\`python
import pymysql
from pymysql.cursors import DictCursor
from decimal import Decimal

class TransferError(Exception):
    """转账异常"""
    pass

def transfer_money(conn, from_user_id: int, to_user_id: int,
                   amount: Decimal) -> bool:
    """
    转账操作（必须在同一个事务中）
    原子性：要么都成功，要么都失败
    """
    if amount <= 0:
        raise TransferError("转账金额必须大于0")
    if from_user_id == to_user_id:
        raise TransferError("不能给自己转账")

    with conn.cursor() as cursor:
        try:
            # 1. 查询付款人余额（加行锁FOR UPDATE防止并发修改）
            cursor.execute(
                "SELECT id, balance FROM users WHERE id = %s FOR UPDATE",
                (from_user_id,)
            )
            from_user = cursor.fetchone()
            if not from_user:
                raise TransferError(f"付款人{from_user_id}不存在")
            if from_user['balance'] < amount:
                raise TransferError("余额不足")

            # 2. 查询收款人
            cursor.execute(
                "SELECT id FROM users WHERE id = %s FOR UPDATE",
                (to_user_id,)
            )
            to_user = cursor.fetchone()
            if not to_user:
                raise TransferError(f"收款人{to_user_id}不存在")

            # 3. 扣减付款人余额
            cursor.execute(
                "UPDATE users SET balance = balance - %s WHERE id = %s",
                (amount, from_user_id)
            )

            # 模拟异常（测试回滚）
            # raise ValueError("Simulated error")

            # 4. 增加收款人余额
            cursor.execute(
                "UPDATE users SET balance = balance + %s WHERE id = %s",
                (amount, to_user_id)
            )

            # 5. 记录转账日志
            order_no = f"TRF{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO transfer_logs
                (order_no, from_user, to_user, amount, status)
                VALUES (%s, %s, %s, %s, 'success')
            """, (order_no, from_user_id, to_user_id, amount))

            return True

        except Exception as e:
            logger.error(f"Transfer failed: {e}")
            raise


# 使用事务
conn = pymysql.connect(
    host='localhost', user='root', password='password',
    database='py_demo', cursorclass=DictCursor, autocommit=False
)

try:
    transfer_money(conn, 1, 2, Decimal('100.00'))
    conn.commit()
    print("Transfer successful")
except Exception as e:
    conn.rollback()
    print(f"Transfer failed: {e}")
finally:
    conn.close()
\`\`\`

### 2.2 批量导入事务控制

\`\`\`python
def batch_import_users(db: MySQLClient, users: List[Dict],
                       batch_size: int = 1000) -> Dict:
    """
    批量导入用户，分批提交
    - 每batch_size条提交一次，避免大事务
    - 记录成功失败数量
    """
    success = 0
    failed = 0
    errors = []

    for i in range(0, len(users), batch_size):
        batch = users[i:i+batch_size]
        try:
            db.create_users_batch(batch)
            success += len(batch)
            logger.info(f"Imported batch {i//batch_size + 1}, success: {len(batch)}")
        except Exception as e:
            # 批量失败，逐条重试找出错误数据
            for user in batch:
                try:
                    db.create_user(**user)
                    success += 1
                except Exception as e2:
                    failed += 1
                    errors.append({'user': user, 'error': str(e2)})

    return {'success': success, 'failed': failed, 'errors': errors}
\`\`\`

---

## 三、游标类型详解

### 3.1 pymysql支持的游标类型

| 游标类型 | 说明 | 适用场景 | 内存占用 |
|----------|------|----------|----------|
| Cursor | 默认，返回元组 | 只需要值不需要列名 | 低 |
| DictCursor | 返回字典 | 需要列名访问 | 中 |
| SSCursor | 服务端游标，元组 | 超大量数据，不一次性加载 | 极低 |
| SSDictCursor | 服务端游标，字典 | 超大量数据+字典访问 | 低 |

### 3.2 默认游标 vs DictCursor

\`\`\`python
# 默认游标（元组）
conn = pymysql.connect(..., cursorclass=pymysql.cursors.Cursor)
with conn.cursor() as cursor:
    cursor.execute("SELECT id, username, email FROM users WHERE id = 1")
    row = cursor.fetchone()
    print(row)  # (1, 'alice', 'a****@***********')
    print(row[1])  # 通过索引访问: 'alice'

# DictCursor（字典）
conn = pymysql.connect(..., cursorclass=DictCursor)
with conn.cursor() as cursor:
    cursor.execute("SELECT id, username, email FROM users WHERE id = 1")
    row = cursor.fetchone()
    print(row)  # {'id': 1, 'username': 'alice', 'email': 'a****@***********'}
    print(row['username'])  # 通过列名访问: 'alice'
\`\`\`

### 3.3 服务端游标处理大数据

当查询结果有几万甚至几十万行时，用普通游标会把所有数据加载到内存，可能OOM。这时候使用SSCursor/SSDictCursor服务端游标：

\`\`\`python
from pymysql.cursors import SSDictCursor

def process_large_data():
    """处理超大量数据"""
    conn = pymysql.connect(
        host='localhost', user='root', password='password',
        database='py_demo', cursorclass=SSDictCursor
    )
    try:
        with conn.cursor() as cursor:
            # 不会一次性加载所有数据
            cursor.execute("SELECT * FROM large_table")

            # 逐行获取，每次只在内存保留一行
            batch = []
            for idx, row in enumerate(cursor, 1):
                batch.append(row)
                if len(batch) >= 1000:
                    process_batch(batch)  # 处理1000条
                    batch = []

                # 注意：服务端游标时不要做其他耗时操作
                # 否则长时间占用数据库连接

            if batch:
                process_batch(batch)
    finally:
        conn.close()

def process_batch(batch):
    """处理一批数据"""
    pass
\`\`\`

---

## 四、防止SQL注入

### 4.1 SQL注入示例

\`\`\`python
# ❌ 极度危险：字符串拼接SQL
def bad_login(username, password):
    sql = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    # 如果输入: username = "admin' --"
    # SQL变成: SELECT * FROM users WHERE username = 'admin' --' AND password = '...'
    # -- 是注释，后面的密码验证被绕过！
    cursor.execute(sql)
    return cursor.fetchone()

# 如果输入: username = "' OR 1=1 --"
# SQL变成: SELECT * FROM users WHERE username = '' OR 1=1 --'
# 返回所有用户！

# 更危险的注入：
# username = "'; DROP TABLE users; --"
# SQL变成: SELECT ...; DROP TABLE users; -- ...
# 表被删除！
\`\`\`

### 4.2 正确使用参数化查询

\`\`\`python
# ✅ 正确：永远使用参数化查询
def safe_login(username, password):
    sql = "SELECT * FROM users WHERE username = %s AND password = %s"
    cursor.execute(sql, (username, password))
    return cursor.fetchone()

# 参数化查询原理：
# 1. SQL语句和参数分开发送给数据库
# 2. 数据库先编译SQL模板
# 3. 参数会被当作纯数据处理，不会被解析为SQL
# 4. 完全避免SQL注入
\`\`\`

### 4.3 动态表名/列名的处理

参数化只能用于值，不能用于表名、列名、SQL关键字。动态表名/列名需要白名单校验：

\`\`\`python
from pymysql import err

# ❌ 错误：表名不能用参数化
# cursor.execute("SELECT * FROM %s", (table_name,))

# ✅ 正确：白名单校验
ALLOWED_TABLES = {'users', 'orders', 'products'}
ALLOWED_ORDER_FIELDS = {'id', 'created_at', 'username', 'price'}
ALLOWED_ORDER_DIR = {'ASC', 'DESC'}

def query_table(table_name: str, order_by: str = 'id',
                order_dir: str = 'DESC'):
    # 白名单校验
    if table_name not in ALLOWED_TABLES:
        raise ValueError(f"Invalid table: {table_name}")
    if order_by not in ALLOWED_ORDER_FIELDS:
        raise ValueError(f"Invalid order field: {order_by}")
    if order_dir not in ALLOWED_ORDER_DIR:
        raise ValueError(f"Invalid order direction: {order_dir}")

    # 使用sql.Identifier安全标识（psycopg2）或手动拼接（pymysql白名单后）
    sql = f"SELECT * FROM {table_name} ORDER BY {order_by} {order_dir} LIMIT 100"
    cursor.execute(sql)
    return cursor.fetchall()

# psycopg2有更安全的方式
from psycopg2 import sql
cur.execute(
    sql.SQL("SELECT * FROM {} ORDER BY {} {} LIMIT 100").format(
        sql.Identifier(table_name),
        sql.Identifier(order_by),
        sql.SQL(order_dir)
    )
)
\`\`\`

### 4.4 LIKE查询参数化

\`\`\`python
# ❌ 错误：
# keyword = "%alice%"
# cursor.execute("SELECT * FROM users WHERE username LIKE %s", (keyword,))
# 虽然可以工作，但通配符应该在业务代码中拼接

# ✅ 推荐方式
def search_users(keyword: str, page: int = 1, page_size: int = 20):
    search_term = f"%{keyword}%"
    sql = """
        SELECT * FROM users
        WHERE username LIKE %s OR email LIKE %s
        LIMIT %s OFFSET %s
    """
    offset = (page - 1) * page_size
    cursor.execute(sql, (search_term, search_term, page_size, offset))
    return cursor.fetchall()
\`\`\`

---

## 五、常见坑点与最佳实践

### 5.1 常见坑点

1. **忘记提交事务**：INSERT/UPDATE/DELETE后必须commit
2. **SQL注入**：永远不要字符串拼接，用参数化
3. **连接泄漏**：必须try/finally关闭连接
4. **游标类型选择错误**：大数据量用SSCursor避免OOM
5. **autocommit=True的陷阱**：每个语句独立事务，回滚困难
6. **大事务问题**：批量操作分批提交
7. **字符集问题**：必须指定charset='utf8mb4'才能存emoji
8. **时区问题**：Python和MySQL时区不一致导致时间错误
9. **like查询中的%/_未转义**：用户输入通配符导致结果不符合预期
10. **datetime直接传字符串**：应该传Python datetime对象

\`\`\`python
# ❌ 错误：like未转义
def bad_search(keyword):
    # 如果用户输入"a%"，会匹配a开头的所有，可能不是预期
    cursor.execute("SELECT * FROM users WHERE username LIKE %s", (f"%{keyword}%",))

# ✅ 正确：转义like特殊字符
def escape_like(s: str) -> str:
    return s.replace('\\\\', '\\\\\\\\').replace('%', '\\\\%').replace('_', '\\\\_')

def good_search(keyword):
    escaped = escape_like(keyword)
    cursor.execute(
        "SELECT * FROM users WHERE username LIKE %s ESCAPE '\\\\'",
        (f"%{escaped}%",)
    )
\`\`\`

### 5.2 最佳实践总结

1. **封装数据库操作类**：不要到处重复写connect/close
2. **使用连接池**：不要每次都新建连接
3. **始终使用DictCursor**：通过列名访问更易维护
4. **参数化查询是铁律**：没有例外
5. **正确的事务管理**：autocommit=False，手动commit/rollback
6. **处理大数据用SSCursor**：避免内存溢出
7. **SQL关键字/表名/列名白名单校验**：不能参数化的必须校验
8. **日志记录SQL**：开发环境打印SQL便于调试
9. **设置合理的超时**：connect_timeout、read_timeout
10. **异常处理**：区分数据库异常和业务异常
`
  },
  {
    id: "pyb-6-8",
    group: "数据库基础与SQL",
    icon: "🗄️",
    title: "PostgreSQL与Python - psycopg2/asyncpg、JSONB类型、数组类型、全文搜索、PostgreSQL特有功能",
    content: `

# PostgreSQL与Python

PostgreSQL是功能最强大的开源关系型数据库，支持JSONB、数组、全文搜索、窗口函数、CTE等高级特性。

---

## 一、PostgreSQL vs MySQL对比

| 特性 | PostgreSQL | MySQL |
|------|-----------|-------|
| 开发 | PostgreSQL全球开发组 | Oracle |
| 协议 | PostgreSQL License（类MIT，更宽松） | GPL/商业双协议 |
| JSON支持 | JSONB（极强大，支持索引） | JSON类型 |
| 数组类型 | 原生支持 | 不支持（用JSON或逗号分隔） |
| 全文搜索 | 强大，内置支持 | FULLTEXT索引（功能较弱） |
| 窗口函数 | 完善 | 8.0开始支持 |
| CTE递归 | 支持 | 8.0开始支持 |
| 扩展系统 | 极强（PostGIS等） | 弱 |
| 并发控制 | MVCC更优 | MVCC（有一些问题） |
| 数据类型 | 极丰富 | 相对较少 |
| 适用场景 | 复杂查询、企业级、GIS、JSON多 | Web应用、互联网业务 |

---

## 二、psycopg2基础使用

### 2.1 安装与连接

\`\`\`bash
pip install psycopg2-binary  # 快速安装（开发环境）
pip install psycopg2          # 编译安装（生产环境）
\`\`\`

\`\`\`python
import psycopg2
from psycopg2.extras import RealDictCursor, Json, execute_values
from psycopg2 import sql
from datetime import datetime
from typing import List, Dict, Optional, Any
import uuid

class PostgreSQLClient:
    """PostgreSQL客户端"""

    def __init__(self, host='localhost', port=5432, user='postgres',
                 password='password', dbname='py_demo', **kwargs):
        self.conn_params = {
            'host': host,
            'port': port,
            'user': user,
            'password': password,
            'dbname': dbname,
            'cursor_factory': RealDictCursor,
            **kwargs
        }

    def get_connection(self):
        return psycopg2.connect(**self.conn_params)

    # ========== 基础CRUD ==========

    def create_user(self, username: str, email: str, password: str,
                    profile: Dict = None, tags: List[str] = None) -> uuid.UUID:
        """
        创建用户（PostgreSQL推荐用UUID主键）
        演示JSONB和数组类型
        """
        user_id = uuid.uuid4()
        sql = """
            INSERT INTO users (id, username, email, password, profile, tags)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """
        # Json()自动处理Python dict -> JSONB
        # 数组直接传Python list
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (
                    user_id,
                    username,
                    email,
                    password,
                    Json(profile) if profile else None,
                    tags or []
                ))
                result = cur.fetchone()
                return result['id']

    def get_user(self, user_id: uuid.UUID) -> Optional[Dict]:
        sql = "SELECT * FROM users WHERE id = %s"
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (user_id,))
                return cur.fetchone()

    def list_users(self, page: int = 1, page_size: int = 20) -> List[Dict]:
        offset = (page - 1) * page_size
        sql = """
            SELECT id, username, email, profile, tags, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (page_size, offset))
                return cur.fetchall()

    def update_user_profile(self, user_id: uuid.UUID, profile: Dict) -> bool:
        """更新JSONB字段"""
        sql = """
            UPDATE users
            SET profile = profile || %s,  -- ||是JSONB合并操作符
                updated_at = NOW()
            WHERE id = %s
        """
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (Json(profile), user_id))
                return cur.rowcount > 0
\`\`\`

### 2.2 建表语句（PostgreSQL特有类型）

\`\`\`sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- UUID生成函数

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(128) NOT NULL,
    age SMALLINT,
    balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    profile JSONB,              -- JSONB类型！
    tags TEXT[],                -- 数组类型！
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- GIN索引用于JSONB和数组
    INDEX idx_profile_gin ON users USING GIN(profile),
    INDEX idx_tags_gin ON users USING GIN(tags)
);

-- 文章表（全文搜索示例）
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id),
    tags TEXT[],
    metadata JSONB,
    search_vector TSVECTOR,  -- 全文搜索向量
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建全文搜索触发器，自动更新search_vector
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);

CREATE OR REPLACE FUNCTION articles_search_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('chinese', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('chinese', COALESCE(NEW.content, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_articles_search_update
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION articles_search_update();
\`\`\`

---

## 三、JSONB类型使用

JSONB是PostgreSQL最强大的特性之一，支持索引和丰富的查询操作符。

### 3.1 JSONB操作符

| 操作符 | 说明 | 示例 |
|--------|------|------|
| -> | 获取JSON对象字段（返回JSON） | profile->'city' |
| ->> | 获取JSON对象字段（返回文本） | profile->>'city' |
| #> | 获取指定路径（JSON） | profile#>'{address, city}' |
| #>> | 获取指定路径（文本） | profile#>>'{address, city}' |
| @> | 包含（左边包含右边） | profile @> '{"city": "Beijing"}' |
| <@ | 被包含 | '{"city": "Beijing"}' <@ profile |
| ? | 是否包含key | profile ? 'phone' |
| ?| | 包含任意一个key | profile ?\\| array['phone', 'email'] |
| ?& | 包含所有key | profile ?& array['name', 'age'] |
| || | 合并两个JSONB | profile || '{"verified": true}' |
| - | 删除key | profile - 'old_field' |

### 3.2 JSONB查询示例

\`\`\`python
def query_jsonb_examples():
    conn = psycopg2.connect(...)

    with conn.cursor() as cur:
        # 1. 查询JSONB字段
        cur.execute("""
            SELECT
                username,
                profile->>'city' as city,
                profile->>'age' as age,
                profile->'address'->>'street' as street
            FROM users
            WHERE profile->>'city' = 'Beijing'
        """)

        # 2. 包含查询（可以走GIN索引！）
        # 查询profile中city为Beijing且verified为true的用户
        cur.execute("""
            SELECT username, profile
            FROM users
            WHERE profile @> %s
        """, (Json({'city': 'Beijing', 'verified': True}),))

        # 3. 检查key是否存在
        cur.execute("""
            SELECT username FROM users WHERE profile ? 'phone'
        """)

        # 4. JSONB数组查询
        # 查询tags包含"python"的用户
        cur.execute("""
            SELECT username FROM users WHERE profile->'interests' ? 'python'
        """)

        # 5. 更新JSONB字段（部分更新）
        # 新增字段
        cur.execute("""
            UPDATE users
            SET profile = profile || %s
            WHERE id = %s
        """, (Json({'last_login_ip': '192.168.1.1'}), user_id))

        # 删除字段
        cur.execute("""
            UPDATE users SET profile = profile - %s WHERE id = %s
        """, ('old_key', user_id))

        # 深度更新（9.5+）
        cur.execute("""
            UPDATE users
            SET profile = jsonb_set(profile, %s, %s)
            WHERE id = %s
        """, ('{address, city}', '"Shanghai"', user_id))

    conn.close()
\`\`\`

---

## 四、数组类型使用

### 4.1 数组操作

\`\`\`python
def array_examples():
    conn = psycopg2.connect(...)

    with conn.cursor() as cur:
        # 1. 创建带数组的记录
        cur.execute("""
            INSERT INTO articles (title, content, tags)
            VALUES (%s, %s, %s)
        """, ('Python入门', 'Python是一门...', ['python', 'tutorial', 'beginner']))

        # 2. 查询数组包含（ANY）
        # 查询tags包含python的文章
        cur.execute("""
            SELECT title, tags FROM articles WHERE %s = ANY(tags)
        """, ('python',))

        # 3. 数组包含（@>）
        # 查询同时包含python和tutorial的文章
        cur.execute("""
            SELECT title FROM articles WHERE tags @> ARRAY['python', 'tutorial']
        """)

        # 4. 数组重叠（&&）：有任意一个匹配
        # 查询包含python或java的文章
        cur.execute("""
            SELECT title FROM articles WHERE tags && ARRAY['python', 'java']
        """)

        # 5. 数组长度
        cur.execute("""
            SELECT title, array_length(tags, 1) as tag_count
            FROM articles
            WHERE array_length(tags, 1) > 3
        """)

        # 6. 数组追加元素
        cur.execute("""
            UPDATE articles
            SET tags = array_append(tags, %s)
            WHERE id = %s
        """, ('featured', article_id))

        # 7. 数组删除元素
        cur.execute("""
            UPDATE articles
            SET tags = array_remove(tags, %s)
            WHERE id = %s
        """, ('obsolete', article_id))

        # 8. unnest数组转成行
        cur.execute("""
            SELECT title, unnest(tags) as tag
            FROM articles
        """)
        # 每个tag返回一行

    conn.close()
\`\`\`

---

## 五、全文搜索

### 5.1 全文搜索基础

\`\`\`python
def fulltext_search(keyword: str, limit: int = 20):
    """PostgreSQL全文搜索"""
    conn = psycopg2.connect(...)

    with conn.cursor() as cur:
        # 基本全文搜索
        cur.execute("""
            SELECT
                title,
                ts_headline('chinese', content, q, 'MaxWords=30, MinWords=10') as snippet,
                ts_rank(search_vector, q) as rank
            FROM articles, to_tsquery('chinese', %s) q
            WHERE search_vector @@ q
            ORDER BY rank DESC
            LIMIT %s
        """, (keyword, limit))

        results = cur.fetchall()
        for r in results:
            print(f"Title: {r['title']}")
            print(f"Snippet: {r['snippet']}")
            print(f"Rank: {r['rank']}")
            print("---")

    conn.close()


# 使用示例
fulltext_search("Python & 数据库")
# &是AND, |是OR, !是NOT
# "Python & 数据库" 搜索同时包含Python和数据库
\`\`\`

### 5.2 中文全文搜索配置

默认的PostgreSQL中文分词效果一般，推荐安装zhparser或jieba分词扩展：

\`\`\`sql
-- 安装zhparser（需要编译）
CREATE EXTENSION zhparser;
CREATE TEXT SEARCH CONFIGURATION chinese (PARSER = zhparser);
ALTER TEXT SEARCH CONFIGURATION chinese ADD MAPPING FOR n,v,a,i,e,l WITH simple;
\`\`\`

---

## 六、asyncpg异步驱动

asyncpg是PostgreSQL的高性能异步驱动，性能比psycopg2快很多。

### 6.1 asyncpg基础使用

\`\`\`bash
pip install asyncpg
\`\`\`

\`\`\`python
import asyncio
import asyncpg
from typing import List, Dict, Optional
import uuid
from datetime import datetime

class AsyncPostgresClient:
    """异步PostgreSQL客户端"""

    def __init__(self, dsn: str = None, **kwargs):
        self.dsn = dsn or "postgresql://postgres:password@localhost/py_demo"
        self.pool: Optional[asyncpg.Pool] = None
        self.connect_kwargs = kwargs

    async def init_pool(self, min_size: int = 5, max_size: int = 20):
        """初始化连接池"""
        self.pool = await asyncpg.create_pool(
            dsn=self.dsn,
            min_size=min_size,
            max_size=max_size,
            **self.connect_kwargs
        )

    async def close(self):
        """关闭连接池"""
        if self.pool:
            await self.pool.close()

    async def create_user(self, username: str, email: str,
                          password: str) -> Dict:
        """创建用户"""
        async with self.pool.acquire() as conn:
            user = await conn.fetchrow("""
                INSERT INTO users (id, username, email, password)
                VALUES ($1, $2, $3, $4)
                RETURNING id, username, email, created_at
            """, uuid.uuid4(), username, email, password)
            return dict(user)

    async def get_user(self, user_id: uuid.UUID) -> Optional[Dict]:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM users WHERE id = $1", user_id
            )
            return dict(row) if row else None

    async def list_users(self, page: int = 1, page_size: int = 20) -> List[Dict]:
        offset = (page - 1) * page_size
        async with self.pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, username, email, created_at
                FROM users
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2
            """, page_size, offset)
            return [dict(r) for r in rows]

    async def batch_create_users(self, users: List[Dict]):
        """批量插入（asyncpg的copy_records极快）"""
        async with self.pool.acquire() as conn:
            # 使用copy_records比executemany快得多
            records = [
                (uuid.uuid4(), u['username'], u['email'], u['password'])
                for u in users
            ]
            await conn.copy_records_to_table(
                'users',
                records=records,
                columns=('id', 'username', 'email', 'password')
            )

    async def jsonb_query_example(self, city: str):
        """JSONB查询"""
        async with self.pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT username, profile
                FROM users
                WHERE profile @> $1::jsonb
            """, {'city': city})
            return [dict(r) for r in rows]

    async def concurrent_queries(self):
        """并发查询示例"""
        async with self.pool.acquire() as conn:
            # 并发执行多个查询
            results = await asyncio.gather(
                conn.fetch("SELECT COUNT(*) FROM users"),
                conn.fetch("SELECT COUNT(*) FROM orders"),
                conn.fetch("SELECT AVG(balance) FROM users"),
            )
            return {
                'user_count': results[0][0]['count'],
                'order_count': results[1][0]['count'],
                'avg_balance': results[2][0]['avg'],
            }


# 使用示例
async def main():
    db = AsyncPostgresClient()
    await db.init_pool()

    try:
        # 创建用户
        user = await db.create_user('async_user', 'a****@***********', 'hash')
        print(f"Created: {user}")

        # 并发查询
        stats = await db.concurrent_queries()
        print(f"Stats: {stats}")

    finally:
        await db.close()

if __name__ == '__main__':
    asyncio.run(main())
\`\`\`

### 6.2 asyncpg vs psycopg2性能对比

| 特性 | asyncpg | psycopg2 |
|------|---------|----------|
| 异步支持 | ✅原生async/await | ❌同步 |
| 性能 | 极快（约快2-3倍） | 快 |
| 批量插入 | copy_records极快 | executemany一般 |
| 类型转换 | 自动转换Python类型 | 需要手动处理部分类型 |
| 语句缓存 | 自动prepared statement | 需手动 |
| JSONB支持 | 自动dict映射 | 需要Json()包装 |

---

## 七、PostgreSQL特有功能

### 7.1 RETURNING子句

PostgreSQL支持INSERT/UPDATE/DELETE后RETURNING返回修改的数据，不需要额外SELECT：

\`\`\`python
# INSERT后获取创建的数据
cur.execute("""
    INSERT INTO users (username, email)
    VALUES (%s, %s)
    RETURNING id, created_at
""", ('newuser', 'n**@***********'))
new_user = cur.fetchone()

# UPDATE后返回更新前/后的数据
cur.execute("""
    UPDATE users SET balance = balance + 100
    WHERE id = %s
    RETURNING balance as new_balance, balance - 100 as old_balance
""", (user_id,))
result = cur.fetchone()

# DELETE后返回被删除的数据
cur.execute("""
    DELETE FROM users WHERE status = 0
    RETURNING id, username, email
""")
deleted_users = cur.fetchall()
\`\`\`

### 7.2 UPSERT（INSERT ON CONFLICT）

\`\`\`python
def upsert_user(username: str, email: str, age: int):
    """存在则更新，不存在则插入"""
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO users (username, email, age)
            VALUES (%s, %s, %s)
            ON CONFLICT (username)
            DO UPDATE SET
                email = EXCLUDED.email,
                age = EXCLUDED.age,
                updated_at = NOW()
            RETURNING id, (xmax = 0) as inserted  -- xmax=0表示是新插入
        """, (username, email, age))
        result = cur.fetchone()
        return result
\`\`\`

### 7.3 CTE（通用表表达式）

\`\`\`python
# 递归CTE：查询树形结构（评论、分类等）
def get_comment_tree(article_id):
    cur.execute("""
        WITH RECURSIVE comment_tree AS (
            -- 基础查询：顶级评论
            SELECT id, parent_id, content, author_id, created_at, 1 as depth
            FROM comments
            WHERE article_id = %s AND parent_id IS NULL

            UNION ALL

            -- 递归：子评论
            SELECT c.id, c.parent_id, c.content, c.author_id, c.created_at, ct.depth + 1
            FROM comments c
            JOIN comment_tree ct ON c.parent_id = ct.id
        )
        SELECT * FROM comment_tree ORDER BY created_at
    """, (article_id,))
    return cur.fetchall()

# DML CTE：一个语句完成多个操作
def move_balance(from_id, to_id, amount):
    cur.execute("""
        WITH deducted AS (
            UPDATE users SET balance = balance - %s
            WHERE id = %s AND balance >= %s
            RETURNING id
        ),
        added AS (
            UPDATE users SET balance = balance + %s
            WHERE id = %s AND EXISTS (SELECT 1 FROM deducted)
            RETURNING id
        )
        INSERT INTO transfer_logs (from_user, to_user, amount)
        SELECT %s, %s, %s WHERE EXISTS (SELECT 1 FROM added)
        RETURNING id
    """, (amount, from_id, amount, amount, to_id, from_id, to_id, amount))
\`\`\`

---

## 八、最佳实践与常见坑点

### 8.1 最佳实践

1. **使用TIMESTAMPTZ带时区的时间**：避免时区问题
2. **UUID主键**：分布式环境友好，用uuid_generate_v4()
3. **JSONB用于灵活Schema**：但不要过度使用，结构化数据还是用普通列
4. **数组类型**：标签、多值字段用数组比关联表方便
5. **GIN索引**：JSONB和数组字段必须建GIN索引
6. **连接池**：用asyncpg.Pool或pgbouncer
7. **RETURNING**：避免INSERT后再SELECT
8. **批量操作用copy_records**：asyncpg的copy性能极高
9. **全文搜索**：简单场景用数据库，复杂用Elasticsearch
10. **使用schema管理**：Alembic做数据库迁移

### 8.2 常见坑点

1. **public schema权限问题**：生产环境不要用public schema
2. **索引类型选错**：JSONB/数组需要GIN索引，不是B-tree
3. **大事务问题**：和MySQL一样，避免大事务
4. **连接数过多**：每个连接占用内存大，一定要用连接池
5. **序列化异常**：高并发下SERIALIZABLE隔离级别会有重试
6. **VARCHAR长度不是性能问题**：PostgreSQL中VARCHAR(50)和TEXT性能一样
7. **不要用串行（SEQUENCE）做主键有gap**：正常现象，不要指望连续
8. **NOT NULL vs DEFAULT**：注意默认值和非空约束
9. **JSONB != JSON**：JSONB是二进制存储，有索引；JSON是文本，不要用JSON类型
10. **自动提交问题**：psycopg2默认autocommit=False，和MySQL一样需要commit
`
  }
]


