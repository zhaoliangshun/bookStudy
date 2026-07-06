// =============================================================
// 《MySQL 实战教程》- 章节批次 1
// -------------------------------------------------------------
// 内容：第一部分 入门与基础（第 1-6 章）
// =============================================================

const chapters = [
  {
    id: "mysql-ch01",
    group: "第一部分 入门与基础",
    icon: "🐬",
    title: "第 1 章 MySQL 简介与环境搭建",
    content: `# 第 1 章 MySQL 简介与环境搭建

MySQL 是全球使用最广泛的开源关系型数据库之一，从个人博客到阿里、Facebook 等顶级互联网公司都在用。本章带你认识 MySQL、搞清版本差异、搭建本地环境、写出第一条 SQL。

## 1.1 什么是 MySQL

**MySQL** 是一个**开源、关系型、客户端/服务器架构**的数据库管理系统（RDBMS），由瑞典 MySQL AB 公司开发，现归 Oracle 所有。

它有三个核心标签：

- **开源**：社区版免费，企业版收费（额外提供监控、备份等工具）
- **关系型**：数据以二维表形式存储，表与表之间通过外键等建立关系
- **C/S 架构**：服务端 \`mysqld\` 长驻运行，客户端通过 TCP 协议连接（默认端口 3306）

> 一句话总结：MySQL 就是"存数据、查数据、管数据"的服务，你的程序通过 SQL 语言跟它对话。

**MySQL 的核心组件**：

| 组件 | 作用 |
| --- | --- |
| \`mysqld\` | 服务端守护进程，负责所有数据操作 |
| 连接池 | 管理客户端连接、线程复用 |
| SQL 接口 | 接收 SQL、返回结果 |
| 解析器 | 词法/语法分析，生成解析树 |
| 优化器 | 选择执行计划（选索引、决定 JOIN 顺序） |
| 存储引擎 | 真正存取数据的插件（InnoDB、MyISAM 等） |

## 1.2 MySQL 的版本演进（5.7 / 8.0 / 8.4）

版本选择直接决定你能用哪些特性。生产环境目前**强烈推荐 8.0 LTS 或 8.4 LTS**。

| 版本 | 发布年份 | 关键特性 | 状态 |
| --- | --- | --- | --- |
| **5.7** | 2015 | JSON 类型、Generated Column、性能优化 | 2023 年停止支持 |
| **8.0** | 2018 | 窗口函数、CTE、降序索引、原子 DDL、角色权限 | LTS 长期支持 |
| **8.4** | 2024 | 8.0 的下一个 LTS，改进 InnoDB、向量索引等 | 当前 LTS |

**8.0 相比 5.7 的重大升级**：

1. **窗口函数**（\`ROW_NUMBER()\`、\`RANK()\`、\`LAG()\` 等）—— 终于不用写变量 hack 了
2. **CTE 公用表表达式**（\`WITH\` 子句）—— 递归查询变得优雅
3. **降序索引** —— \`INDEX(col DESC)\` 真正生效（5.7 解析但忽略）
4. **原子 DDL** —— 表结构变更不再有"半完成"状态
5. **默认字符集改为 \`utf8mb4\`** —— 直接支持 emoji，告别乱码
6. **角色管理** —— 权限模型更现代

> 经验：新项目直接上 8.0/8.4。老项目从 5.7 升 8.0 时，重点检查 \`GROUP BY\` 的严格模式、保留字（\`RANK\`、\`ROW_NUMBER\` 等成了关键字）。

## 1.3 安装与配置（Docker / macOS / Linux）

### 方案一：Docker（最推荐，干净快捷）

\`\`\`bash
# 拉取 MySQL 8.0 镜像
docker pull mysql:8.0

# 启动一个容器
docker run -d \\
  --name mysql8 \\
  -p 3306:3306 \\
  -e MYSQL_ROOT_PASSWORD=123456 \\
  -e MYSQL_DATABASE=demo \\
  -v /Users/yourname/mysql-data:/var/lib/mysql \\
  mysql:8.0

# 进入容器执行 mysql 命令
docker exec -it mysql8 mysql -uroot -p123456
\`\`\`

**参数说明**：
- \`-p 3306:3306\`：把容器 3306 映射到宿主机
- \`-e MYSQL_ROOT_PASSWORD\`：设置 root 密码（必填）
- \`-e MYSQL_DATABASE=demo\`：启动时自动创建 demo 库
- \`-v ...\`：把数据目录挂出来，容器删了数据还在

### 方案二：macOS（Homebrew）

\`\`\`bash
# 安装
brew install mysql@8.0

# 启动服务（后台常驻）
brew services start mysql@8.0

# 首次登录（无密码）
mysql -uroot

# 设置 root 密码
ALTER USER 'root'@'localhost' IDENTIFIED BY '123456';
\`\`\`

### 方案三：Linux（Ubuntu/Debian）

\`\`\`bash
# 更新源并安装
sudo apt update
sudo apt install mysql-server-8.0

# 启动 & 设置开机自启
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全初始化（设密码、删匿名用户、禁远程 root）
sudo mysql_secure_installation
\`\`\`

> 踩坑：Ubuntu 装完默认 root 用 \`auth_socket\` 插件，应用连不上。需改成 \`mysql_native_password\` 或 \`caching_sha2_password\`：
> \`\`\`sql
> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456';
> FLUSH PRIVILEGES;
> \`\`\`

## 1.4 连接 MySQL（mysql cli / GUI 工具）

### 命令行客户端

\`\`\`bash
# 基本连接
mysql -h 127.0.0.1 -P 3306 -u root -p

# 指定数据库
mysql -uroot -p demo

# 执行单条 SQL 后退出
mysql -uroot -p -e "SELECT VERSION();"

# 导入 SQL 文件
mysql -uroot -p demo < schema.sql
\`\`\`

**常用 cli 命令**（进入 mysql 后）：

\`\`\`sql
SHOW DATABASES;            -- 查看所有库
USE demo;                  -- 切换库
SHOW TABLES;               -- 查看当前库的表
STATUS;                    -- 查看连接信息
EXIT;                      -- 退出
\`\`\`

### 主流 GUI 工具

| 工具 | 特点 | 适合 |
| --- | --- | --- |
| **DBeaver** | 免费、跨平台、支持几十种数据库 | 通用首选 |
| **Navicat** | 老牌强大、收费 | 团队付费 |
| **MySQL Workbench** | 官方出品、免费 | 仅 MySQL |
| **TablePlus** | 轻量美观、Mac 友好 | 个人开发 |
| **DataGrip** | JetBrains 出品、智能 | 重度使用 |

## 1.5 第一个数据库和表

让我们用经典的"用户-订单"场景，建立第一张表并插入数据。

\`\`\`sql
-- 1. 创建数据库（指定字符集，8.0 默认就是 utf8mb4）
CREATE DATABASE IF NOT EXISTS demo
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

-- 2. 使用数据库
USE demo;

-- 3. 创建用户表
CREATE TABLE users (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  username    VARCHAR(50)  NOT NULL COMMENT '用户名',
  email       VARCHAR(100) NOT NULL COMMENT '邮箱',
  age         TINYINT UNSIGNED DEFAULT NULL COMMENT '年龄',
  status      TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1正常 0禁用',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 4. 插入数据
INSERT INTO users (username, email, age) VALUES
  ('alice', 'alice@example.com', 28),
  ('bob',   'bob@example.com',   34),
  ('carol', 'carol@example.com', 22);

-- 5. 查询
SELECT id, username, email, age FROM users;

-- 6. 看表结构
DESC users;
-- 或
SHOW CREATE TABLE users\\G
\`\`\`

**关键字段解释**：
- \`BIGINT UNSIGNED\`：无符号大整数，主键用这个能撑很久
- \`AUTO_INCREMENT\`：自增，插入时不指定 id 会自动 +1
- \`COMMENT\`：给字段加注释，后续 \`SHOW FULL COLUMNS\` 能看到
- \`ENGINE=InnoDB\`：选 InnoDB 引擎（支持事务、行锁），不要用 MyISAM
- \`utf8mb4\`：4 字节 UTF-8，能存 emoji；千万别用 \`utf8\`（它是 3 字节，存不下 emoji）

> 经验：每张表都要有主键、created_at、注释。这是基本工程素养。

## 1.6 踩坑提示

**坑 1：字符集乱码**
\`\`\`sql
-- 错误：用 utf8 存 emoji 会报错
CREATE TABLE t (s VARCHAR(10) CHARSET=utf8);
INSERT INTO t VALUES ('😀');  -- Incorrect string value

-- 正确：必须用 utf8mb4
CREATE TABLE t (s VARCHAR(10) CHARSET=utf8mb4);
INSERT INTO t VALUES ('😀');  -- OK
\`\`\`

**坑 2：root 远程连不上**
默认 root 只允许 \`localhost\` 登录。要远程连接需创建新用户：
\`\`\`sql
CREATE USER 'app'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON demo.* TO 'app'@'%';
FLUSH PRIVILEGES;
\`\`\`
\`%\` 表示任意 IP，生产环境应限制为应用服务器 IP。

**坑 3：8.0 密码插件兼容性**
MySQL 8.0 默认用 \`caching_sha2_password\`，老版本驱动（如 PHP 5、老 Java 驱动）连不上。要么升级驱动，要么降级：
\`\`\`sql
ALTER USER 'app'@'%' IDENTIFIED WITH mysql_native_password BY 'your_password';
\`\`\`

**坑 4：Docker 容器删了数据没了**
忘了挂 \`-v\` 卷就重启容器，数据全丢。务必挂载 \`/var/lib/mysql\`。

## 1.7 本章小结

- MySQL 是开源关系型数据库，C/S 架构，默认端口 3306
- 新项目直接用 **8.0 或 8.4 LTS**，享受窗口函数、CTE、降序索引
- 本地开发首选 **Docker 安装**，生产环境用包管理器 + 配置文件
- 建库建表必须用 \`utf8mb4\` 字符集、\`InnoDB\` 引擎
- 每张表都要有自增主键、时间字段、注释
- 远程访问要单独建用户，不要直接用 root

下一章我们将系统学习数据库和表的 DDL 操作。`
  },

  {
    id: "mysql-ch02",
    group: "第一部分 入门与基础",
    icon: "📋",
    title: "第 2 章 数据库与表的操作",
    content: `# 第 2 章 数据库与表的操作

第 1 章我们建了第一张表，本章系统讲透**数据库和表的 DDL 操作**：建库、改表、删表、复制表。这些是后端开发每天都会写的 SQL。

## 2.1 CREATE / DROP / USE DATABASE

### 创建数据库

\`\`\`sql
-- 基本语法
CREATE DATABASE [IF NOT EXISTS] 库名
  [DEFAULT CHARACTER SET 字符集]
  [DEFAULT COLLATE 排序规则];

-- 推荐写法：明确字符集和排序规则
CREATE DATABASE IF NOT EXISTS shop
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
\`\`\`

**排序规则选择**：

| 排序规则 | 大小写 | 重音敏感 | 推荐场景 |
| --- | --- | --- | --- |
| \`utf8mb4_general_ci\` | 不敏感 | 不敏感 | 老项目、性能略好 |
| \`utf8mb4_unicode_ci\` | 不敏感 | 不敏感 | 通用推荐，遵循 Unicode 标准 |
| \`utf8mb4_0900_ai_ci\` | 不敏感 | 不敏感 | 8.0 默认，更现代 |
| \`utf8mb4_bin\` | 敏感 | 敏感 | 需要精确二进制比较 |

> 踩坑：\`ci\` = case insensitive（大小写不敏感），意味着 \`WHERE name = 'ABC'\` 能匹配 \`abc\`。需要区分大小写时用 \`utf8mb4_bin\`。

### 查看与切换

\`\`\`sql
SHOW DATABASES;                          -- 看所有库
SHOW CREATE DATABASE shop;               -- 看建库语句
USE shop;                                -- 切换库
SELECT DATABASE();                       -- 看当前库
\`\`\`

### 删除数据库

\`\`\`sql
-- 极度危险！库下所有表都会一起删
DROP DATABASE [IF EXISTS] shop;
\`\`\`

> 经验：生产环境永远不要手敲 \`DROP DATABASE\`。要删先备份，并且必须经过审批流程。

## 2.2 CREATE TABLE 完整语法

\`\`\`sql
CREATE TABLE [IF NOT EXISTS] 表名 (
  列名1 数据类型 [列级约束] [COMMENT '注释'],
  列名2 数据类型 [列级约束] [COMMENT '注释'],
  ...
  [表级约束],
  [索引]
) [表选项];
\`\`\`

### 一个完整的例子

\`\`\`sql
CREATE TABLE orders (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_no      VARCHAR(32)  NOT NULL,
  user_id       BIGINT UNSIGNED NOT NULL,
  total_amount  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status        TINYINT NOT NULL DEFAULT 0 COMMENT '0待付款 1已付款 2已发货 3已完成 4已取消',
  paid_at       DATETIME DEFAULT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_order_no (order_no),
  KEY idx_user_id (user_id),
  KEY idx_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';
\`\`\`

**关键约束**：

| 约束 | 说明 |
| --- | --- |
| \`NOT NULL\` | 非空，能填就填 |
| \`DEFAULT\` | 默认值 |
| \`AUTO_INCREMENT\` | 自增（每表只能一个，且必须是索引列） |
| \`PRIMARY KEY\` | 主键，唯一标识一行 |
| \`UNIQUE\` | 唯一约束 |
| \`COMMENT\` | 字段/表注释 |

**两个好用的时间默认值**：
- \`DEFAULT CURRENT_TIMESTAMP\`：插入时自动填当前时间
- \`ON UPDATE CURRENT_TIMESTAMP\`：更新行时自动刷新时间

这样 \`created_at\` 和 \`updated_at\` 完全自动维护，应用层不用管。

### 临时表 TEMPORARY

\`\`\`sql
-- 临时表只在当前连接可见，断开自动删
CREATE TEMPORARY TABLE tmp_calc (
  user_id BIGINT,
  total DECIMAL(10,2)
);
\`\`\`

适合中间结果暂存，多步计算用。

## 2.3 ALTER TABLE 修改表

表不会一成不变，业务迭代时经常要改结构。ALTER 是必备技能。

### 加列

\`\`\`sql
-- 加在最后
ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL COMMENT '手机号';

-- 加在指定位置
ALTER TABLE users ADD COLUMN nickname VARCHAR(50) AFTER username;
ALTER TABLE users ADD COLUMN id_card VARCHAR(18) FIRST;
\`\`\`

### 加多列

\`\`\`sql
ALTER TABLE users
  ADD COLUMN province VARCHAR(20) AFTER phone,
  ADD COLUMN city     VARCHAR(20) AFTER province,
  ADD COLUMN address  VARCHAR(200) AFTER city;
\`\`\`

### 改列定义

\`\`\`sql
-- 改类型 / 改默认值 / 改注释（用 MODIFY，不改列名）
ALTER TABLE users MODIFY COLUMN phone VARCHAR(30) NOT NULL COMMENT '手机号';

-- 改列名（用 CHANGE，新名在前旧名在后）
ALTER TABLE users CHANGE COLUMN phone mobile VARCHAR(30) NOT NULL COMMENT '手机号';
\`\`\`

> \`MODIFY\` 和 \`CHANGE\` 区别：\`MODIFY\` 不改列名，\`CHANGE\` 改列名。

### 删列

\`\`\`sql
ALTER TABLE users DROP COLUMN address;
\`\`\`

### 改表名

\`\`\`sql
ALTER TABLE old_users RENAME TO users;
-- 等价于
RENAME TABLE old_users TO users;
\`\`\`

### 改字符集 / 引擎

\`\`\`sql
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE users ENGINE=InnoDB;
\`\`\`

### 加 / 删索引

\`\`\`sql
ALTER TABLE users ADD INDEX idx_phone (phone);
ALTER TABLE users ADD UNIQUE KEY uk_email (email);
ALTER TABLE users DROP INDEX idx_phone;
\`\`\`

> 大表 ALTER 是高危操作！MySQL 8.0 大部分 ALTER 是 INSTANT（瞬时）或 INPLACE（在线），但仍有少数需要复制整张表。线上变更务必用 \`pt-online-schema-change\` 或 \`gh-ost\`。

## 2.4 DROP / TRUNCATE / DELETE 区别

这三个都能"清数据"，但本质不同，是面试必考题。

| 操作 | 作用 | 速度 | 自增列 | 事务 | 触发器 | DDL/DML |
| --- | --- | --- | --- | --- | --- | --- |
| \`DELETE FROM t WHERE ...\` | 按条件删行 | 慢（逐行） | 保留 | 是 | 触发 | DML |
| \`TRUNCATE TABLE t\` | 清空整表 | 快（重建表） | 重置为 1 | 否 | 不触发 | DDL |
| \`DROP TABLE t\` | 删表（结构+数据） | 快 | - | 否 | - | DDL |

\`\`\`sql
-- DELETE：可带 WHERE，可回滚
BEGIN;
DELETE FROM users WHERE age < 18;
ROLLBACK;  -- 数据回来了

-- TRUNCATE：清空，不能回滚，自增 ID 重置
TRUNCATE TABLE users;

-- DROP：连表结构一起删
DROP TABLE users;
\`\`\`

> 经验：清空表用 \`TRUNCATE\`，比 \`DELETE FROM t\` 快几个数量级。但务必确认表可以清空，因为不可回滚！

## 2.5 表的复制与重命名

### 复制表结构（不含数据）

\`\`\`sql
-- 方法 1：LIKE（推荐，连索引一起复制）
CREATE TABLE users_backup LIKE users;

-- 方法 2：AS SELECT（不复制索引）
CREATE TABLE users_copy AS SELECT * FROM users WHERE 1=0;
\`\`\`

### 复制表结构 + 数据

\`\`\`sql
-- 复制全部
CREATE TABLE users_2024 AS SELECT * FROM users;

-- 复制部分列
CREATE TABLE users_simple AS
  SELECT id, username, email FROM users;
\`\`\`

> 注意：\`AS SELECT\` 方式**不会复制主键、索引、自增属性**。需要手动 ALTER 补上。

### 把查询结果插入已有表

\`\`\`sql
INSERT INTO users_backup (username, email, age)
SELECT username, email, age FROM users WHERE status = 1;
\`\`\`

### 重命名表

\`\`\`sql
RENAME TABLE old_users TO users;
-- 一次重命名多个
RENAME TABLE t1 TO tmp, t2 TO t1, tmp TO t2;
\`\`\`

## 2.6 踩坑提示

**坑 1：大表加字段锁表**
\`\`\`sql
-- 在 1000 万行表上执行，老版本 MySQL 会锁很久
ALTER TABLE big_table ADD COLUMN new_col INT;
\`\`\`
MySQL 8.0 加列在最后是 INSTANT 操作（瞬间完成），但加在中间（\`AFTER xxx\`）仍可能很慢。线上请用 \`pt-online-schema-change\`。

**坑 2：改列类型导致数据丢失**
\`\`\`sql
-- VARCHAR(100) → VARCHAR(50) 可能截断数据
ALTER TABLE users MODIFY COLUMN email VARCHAR(50);
\`\`\`
改类型前先 \`SELECT MAX(LENGTH(email)) FROM users\` 检查最大长度。

**坑 3：TRUNCATE 不能回滚**
\`\`\`sql
BEGIN;
TRUNCATE TABLE users;  -- 即使在事务里，也无法 ROLLBACK
COMMIT;
\`\`\`
\`TRUNCATE\` 是 DDL，自动提交，不能用事务保护。要"清空且可回滚"必须用 \`DELETE FROM t\`。

**坑 4：CREATE TABLE AS SELECT 不复制索引**
新手常误以为复制了表就万事大吉，结果发现主键没了、唯一约束没了。务必用 \`LIKE\` 复制结构，再 \`INSERT INTO ... SELECT\` 插数据。

**坑 5：保留字做表名/列名**
\`\`\`sql
-- order、desc、key 都是保留字
CREATE TABLE order (id INT);  -- 报错
CREATE TABLE \`order\` (id INT); -- 用反引号包裹
\`\`\`
最佳实践：避免用保留字命名。

## 2.7 本章小结

- 建库必指定 \`utf8mb4\` 字符集
- 建表必带：自增主键、\`created_at\`、\`updated_at\`、注释
- \`ALTER TABLE\` 是日常 DDL 主力：\`ADD/MODIFY/CHANGE/DROP COLUMN\`
- \`DELETE\` 慢但安全可回滚，\`TRUNCATE\` 快但不可逆，\`DROP\` 直接删表
- 复制表结构用 \`CREATE TABLE ... LIKE\`，复制数据用 \`INSERT ... SELECT\`
- 线上大表 ALTER 用 \`pt-osc\` 或 \`gh-ost\`，不要直接 ALTER

下一章我们深入学习 MySQL 的数据类型，搞清每种类型的取舍。`
  },

  {
    id: "mysql-ch03",
    group: "第一部分 入门与基础",
    icon: "🔢",
    title: "第 3 章 数据类型详解",
    content: `# 第 3 章 数据类型详解

数据类型决定**存储空间、取值范围、查询性能**。选错类型轻则浪费空间，重则数据丢失或查询慢。本章系统讲透 MySQL 所有常用类型。

## 3.1 整数类型（TINYINT/SMALLINT/INT/BIGINT）

| 类型 | 字节 | 有符号范围 | 无符号范围 | 用途 |
| --- | --- | --- | --- | --- |
| \`TINYINT\` | 1 | -128~127 | 0~255 | 状态、布尔 |
| \`SMALLINT\` | 2 | -32768~32767 | 0~65535 | 小计数 |
| \`MEDIUMINT\` | 3 | ±838万 | 0~1677万 | 中等范围 |
| \`INT\` | 4 | ±21亿 | 0~42亿 | 通用整数 |
| \`BIGINT\` | 8 | ±922亿亿 | 0~1844亿亿 | 主键、大计数 |

\`\`\`sql
CREATE TABLE int_demo (
  id BIGINT UNSIGNED AUTO_INCREMENT,
  age TINYINT UNSIGNED,           -- 年龄 0-255 够用
  status TINYINT DEFAULT 0,       -- 状态枚举
  view_count INT UNSIGNED DEFAULT 0,
  PRIMARY KEY (id)
);
\`\`\`

**关键点**：
- 加 \`UNSIGNED\` 让范围翻倍，且更适合"计数"语义
- 主键推荐 \`BIGINT UNSIGNED\`，避免未来溢出
- \`TINYINT(1)\` 常被当作布尔用（0=false，非 0=true），MySQL 没有真正的 BOOL

> 关于显示宽度：MySQL 8.0 已经**废弃** \`INT(11)\` 这种写法中的括号数字（它只是显示宽度，不影响存储）。直接写 \`INT\` 即可。

## 3.2 浮点与定点（FLOAT/DOUBLE/DECIMAL）

| 类型 | 字节 | 精度 | 用途 |
| --- | --- | --- | --- |
| \`FLOAT\` | 4 | 单精度 ~7 位 | 不推荐存钱 |
| \`DOUBLE\` | 8 | 双精度 ~15 位 | 科学计算 |
| \`DECIMAL(M,D)\` | M+2 | 精确 | **存钱必用** |

\`\`\`sql
-- 金额必须用 DECIMAL
CREATE TABLE products (
  price DECIMAL(10,2) NOT NULL,  -- 总长 10 位，小数 2 位
  weight DECIMAL(6,3)             -- 总长 6 位，小数 3 位
);

-- FLOAT/DOUBLE 会丢精度
INSERT INTO t VALUES (0.1 + 0.2);  -- FLOAT 可能得到 0.30000001
\`\`\`

**DECIMAL 参数**：
- \`M\`：总位数（含小数），最大 65
- \`D\`：小数位数

> 经验：**任何涉及钱的字段必须用 DECIMAL**。\`FLOAT/DOUBLE\` 是浮点数，有精度损失，0.1+0.2 可能不等于 0.3。DECIMAL 是精确的十进制存储。

## 3.3 字符串（CHAR/VARCHAR/TEXT/BLOB）

| 类型 | 长度 | 用途 |
| --- | --- | --- |
| \`CHAR(N)\` | 固定 N 字符 | 短且定长（如 md5、状态码） |
| \`VARCHAR(N)\` | 可变 N 字符 | 通用字符串 |
| \`TINYTEXT\` | 255 字节 | 短文本 |
| \`TEXT\` | 64KB | 文章正文 |
| \`MEDIUMTEXT\` | 16MB | 长文 |
| \`LONGTEXT\` | 4GB | 超长文 |
| \`BLOB\` 系列 | 同 TEXT | 二进制（图片、序列化对象） |

\`\`\`sql
CREATE TABLE str_demo (
  code CHAR(6) NOT NULL,           -- 验证码 6 位定长
  username VARCHAR(50) NOT NULL,   -- 用户名
  bio VARCHAR(200) DEFAULT NULL,   -- 个人简介
  content TEXT                     -- 文章正文
);
\`\`\`

**CHAR vs VARCHAR**：

| 维度 | CHAR(10) | VARCHAR(10) |
| --- | --- | --- |
| 存储 | 固定 10 字符空间 | 实际长度 + 1-2 字节前缀 |
| 性能 | 定长，访问快 | 可变，需读前缀 |
| 末尾空格 | 填充/截断 | 保留 |
| 适用 | 定长短串 | 不定长串 |

> 经验：99% 场景用 \`VARCHAR\`。只有真正定长（如 32 位 UUID、6 位验证码）才用 \`CHAR\`。

**VARCHAR 长度选择**：
- MySQL 行最大 65535 字节，VARCHAR 太长会触发"行溢出"
- 不要无脑 VARCHAR(10000)，按业务实际长度定（如邮箱 VARCHAR(100)）
- 超长文本用 \`TEXT\`，但 TEXT 不能设默认值、索引必须前缀

## 3.4 日期时间（DATE/TIME/DATETIME/TIMESTAMP）

| 类型 | 字节 | 范围 | 用途 |
| --- | --- | --- | --- |
| \`DATE\` | 3 | 1000-01-01 ~ 9999-12-31 | 仅日期 |
| \`TIME\` | 3 | -838:59:59 ~ 838:59:59 | 仅时间 |
| \`DATETIME\` | 8 | 1000-01-01 ~ 9999-12-31 | 日期+时间 |
| \`TIMESTAMP\` | 4 | 1970-01-01 ~ 2038-01-19 | 时间戳 |

\`\`\`sql
CREATE TABLE time_demo (
  birthday DATE,
  work_time TIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  login_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

**DATETIME vs TIMESTAMP**：

| 维度 | DATETIME | TIMESTAMP |
| --- | --- | --- |
| 范围 | 大（到 9999 年） | 小（到 2038 年） |
| 存储 | 8 字节 | 4 字节 |
| 时区 | 存什么显示什么（不带时区） | 自动转 UTC 存储，查询按会话时区显示 |
| 默认值 | 8.0 支持 \`CURRENT_TIMESTAMP\` | 支持 \`CURRENT_TIMESTAMP\` |

> 经验：
> - 业务时间（创建时间、订单时间）用 \`DATETIME\`，范围大、无 2038 问题
> - 需要时区感知（如国际化）用 \`TIMESTAMP\`
> - 永远不要用 \`INT\` 存时间戳，查询和可读性都很差

## 3.5 JSON 类型（MySQL 8.0+）

8.0 起原生支持 JSON，存储为二进制格式（不是字符串），可用函数查询修改。

\`\`\`sql
CREATE TABLE events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  data JSON
);

INSERT INTO events (name, data) VALUES
  ('login', '{"user_id": 1, "ip": "1.2.3.4", "device": "mobile"}'),
  ('purchase', '{"user_id": 2, "amount": 99.5, "items": ["a","b"]}');

-- 提取字段
SELECT name, data->'$.user_id' AS user_id, data->'$.ip' AS ip
FROM events;

-- ->> 提取并去掉引号
SELECT data->>'$.device' AS device FROM events;

-- 按字段查询
SELECT * FROM events WHERE data->'$.user_id' = 1;

-- 修改字段
UPDATE events SET data = JSON_SET(data, '$.ip', '5.6.7.8') WHERE id = 1;
\`\`\`

**JSON 常用函数**：
- \`JSON_EXTRACT(j, '$.path')\` 等价于 \`j->'$.path'\`
- \`JSON_SET(j, '$.k', v)\` 设置字段
- \`JSON_REMOVE(j, '$.k')\` 删除字段
- \`JSON_CONTAINS(j, val)\` 是否包含

> 经验：JSON 适合存"半结构化"数据（如配置、扩展属性），不要滥用。经常查询的字段应该拆出来做正常列 + 索引。

## 3.6 ENUM 与 SET

### ENUM 枚举

\`\`\`sql
CREATE TABLE users (
  gender ENUM('male','female','other') DEFAULT 'other',
  role ENUM('admin','editor','viewer') NOT NULL
);

INSERT INTO users (gender, role) VALUES ('male', 'admin');
INSERT INTO users (gender, role) VALUES ('unknown', 'admin');  -- 报错
\`\`\`

ENUM 实际用 **TINYINT/SMALLINT** 存储（按定义顺序 1、2、3...），省空间。但**修改枚举值需要 ALTER 表**，不灵活。

### SET 集合

\`\`\`sql
CREATE TABLE articles (
  tags SET('tech','life','travel','food') DEFAULT 'tech'
);

INSERT INTO articles (tags) VALUES ('tech,life');
SELECT * FROM articles WHERE FIND_IN_SET('life', tags);
\`\`\`

SET 用位图存储，一个字段可存多个值。但同样不灵活，**新加选项要 ALTER**。

> 经验：现代实践**不推荐 ENUM/SET**。改用 \`TINYINT\` + 业务层枚举映射，或单独建关联表，更易扩展。

## 3.7 类型选择建议

| 业务场景 | 推荐类型 |
| --- | --- |
| 主键 | \`BIGINT UNSIGNED AUTO_INCREMENT\` |
| 状态/类型 | \`TINYINT UNSIGNED\` + 业务枚举 |
| 金额 | \`DECIMAL(10,2)\` 或更大 |
| 用户名/标题 | \`VARCHAR(50)\` / \`VARCHAR(200)\` |
| 文章正文 | \`TEXT\` 或 \`MEDIUMTEXT\` |
| 创建/更新时间 | \`DATETIME\` + 默认值 |
| 是/否 | \`TINYINT(1)\` 或 \`BOOLEAN\` |
| 半结构化扩展字段 | \`JSON\` |
| 大数据计数（PV） | \`BIGINT UNSIGNED\` |
| IP 地址 | \`VARCHAR(45)\` 或 \`INET_ATON\` 转 INT |

**选型三原则**：
1. **够用就好**：年龄用 TINYINT 不用 INT，省空间
2. **精确优先**：钱用 DECIMAL，时间用 DATETIME
3. **未来扩展**：主键用 BIGINT，VARCHAR 留 20% 余量

## 3.8 踩坑提示

**坑 1：VARCHAR 长度按字符还是字节？**
MySQL 中 \`VARCHAR(N)\` 的 N 是**字符数**，不是字节数。\`utf8mb4\` 下每个字符最多 4 字节，所以 \`VARCHAR(100)\` 实际可能占 400+ 字节。行总长度限制是 65535 字节，要注意。

**坑 2：TIMESTAMP 2038 问题**
\`TIMESTAMP\` 用 4 字节存秒数，到 2038-01-19 03:14:07 UTC 会溢出。长期项目用 \`DATETIME\`。

**坑 3：DECIMAL 计算慢**
DECIMAL 精确但比 DOUBLE 慢。如果只是统计展示（非金额结算），可先转 DOUBLE 计算再展示。

**坑 4：ENUM 改值要 ALTER**
\`\`\`sql
ALTER TABLE users MODIFY gender ENUM('male','female','other','unknown');
\`\`\`
生产大表 ALTER 是噩梦。所以别用 ENUM。

**坑 5：FLOAT 存钱出大问题**
\`\`\`sql
CREATE TABLE accounts (balance FLOAT);
-- 累加 0.1 一万次，结果可能是 999.9999 而非 1000
\`\`\`
任何金额字段一律 DECIMAL。

## 3.9 本章小结

- 整数按范围选，主键用 \`BIGINT UNSIGNED\`
- 金额必用 \`DECIMAL\`，禁用 FLOAT/DOUBLE
- 字符串通用 \`VARCHAR\`，定长才用 \`CHAR\`，长文用 \`TEXT\`
- 时间用 \`DATETIME\`，避免 \`TIMESTAMP\` 的 2038 问题
- JSON 适合半结构化扩展字段，但常查字段应拆列
- 慎用 ENUM/SET，改用 TINYINT + 业务枚举
- 选型三原则：够用、精确、可扩展

下一章讲数据增删改，把 DML 操作彻底搞透。`
  },

  {
    id: "mysql-ch04",
    group: "第一部分 入门与基础",
    icon: "✏️",
    title: "第 4 章 数据增删改",
    content: `# 第 4 章 数据增删改

DML（Data Manipulation Language）包括 INSERT、UPDATE、DELETE，是后端开发每天写最多的 SQL。本章讲透各种写法和陷阱。

## 4.1 INSERT 单行/多行/插入查询结果

### 单行插入

\`\`\`sql
-- 推荐写法：明确列出列名
INSERT INTO users (username, email, age)
VALUES ('alice', 'alice@example.com', 28);

-- 不推荐：省略列名，依赖表定义顺序，结构一改就崩
INSERT INTO users VALUES (NULL, 'alice', 'alice@example.com', 28, 1, NOW());
\`\`\`

### 多行批量插入

\`\`\`sql
INSERT INTO users (username, email, age) VALUES
  ('alice', 'alice@example.com', 28),
  ('bob',   'bob@example.com',   34),
  ('carol', 'carol@example.com', 22);
\`\`\`

> **性能要点**：批量插入比循环单条快 10-100 倍。每条 INSERT 都是一次事务往返，批量只需一次。批量大小建议 500-1000 行一批。

### 插入查询结果

\`\`\`sql
-- 把活跃用户复制到 users_active 表
INSERT INTO users_active (username, email)
SELECT username, email FROM users WHERE status = 1;
\`\`\`

### INSERT ... SELECT 用于去重

\`\`\`sql
-- 备份并去重
INSERT INTO users_dedup (username, email)
SELECT DISTINCT username, email FROM users;
\`\`\`

### INSERT IGNORE 忽略冲突

\`\`\`sql
-- 唯一键冲突时静默跳过，不报错
INSERT IGNORE INTO users (username, email) VALUES ('alice', 'alice@example.com');
\`\`\`

返回 \`1 row affected, 1 warning\` 表示跳过。可用 \`SHOW WARNINGS\` 看具体原因。

## 4.2 UPDATE 单表/多表更新

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
\`\`\`

### 多表更新（JOIN 更新）

\`\`\`sql
-- 用另一张表的值更新
UPDATE orders o
JOIN users u ON o.user_id = u.id
SET o.status = 4
WHERE u.status = 0;  -- 用户被禁用，订单标记取消
\`\`\`

\`\`\`sql
-- 把每个用户的订单数回填到 users 表
UPDATE users u
JOIN (SELECT user_id, COUNT(*) AS cnt FROM orders GROUP BY user_id) o
  ON u.id = o.user_id
SET u.order_count = o.cnt;
\`\`\`

> 经验：跨表更新用 \`UPDATE ... JOIN ...\` 比子查询效率高。

## 4.3 DELETE 单表/多表删除

### 单表删除

\`\`\`sql
-- 删单条
DELETE FROM users WHERE id = 1;

-- 删多条
DELETE FROM users WHERE age < 18;

-- 删全部（保留表结构，自增 ID 保留）
DELETE FROM users;
\`\`\`

### 多表删除

\`\`\`sql
-- 同时删两张表的相关数据
DELETE u, o
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.id = 1;
\`\`\`

### 用 LIMIT 限制删除量

\`\`\`sql
-- 每次只删 1000 条，避免大事务锁表
DELETE FROM logs WHERE created_at < '2024-01-01' LIMIT 1000;
\`\`\`

> 经验：删大表数据**分批删**，每次 1000-5000 条 + 短暂停顿。一次删百万行会撑爆 binlog、锁表、主从延迟。

## 4.4 REPLACE INTO 的妙用

\`REPLACE INTO\` 是 MySQL 特有语法：**主键/唯一键冲突时先删后插**。

\`\`\`sql
-- 如果 id=1 已存在，先 DELETE 再 INSERT
REPLACE INTO users (id, username, email, age)
VALUES (1, 'alice', 'alice@new.com', 29);
\`\`\`

**与 INSERT IGNORE 区别**：

| 操作 | 冲突时行为 | 自增 ID | 触发器 |
| --- | --- | --- | --- |
| \`INSERT IGNORE\` | 跳过 | 保留 | INSERT 触发器不触发 |
| \`REPLACE INTO\` | 删后插 | **可能变化**（新 ID） | 触发 DELETE + INSERT |
| \`ON DUPLICATE KEY UPDATE\` | 更新 | 保留 | 触发 INSERT（before/after） |

> 踩坑：\`REPLACE INTO\` 会**改变自增 ID**（如果主键冲突会生成新 ID），导致外键引用断裂。慎用！优先用 \`ON DUPLICATE KEY UPDATE\`。

## 4.5 ON DUPLICATE KEY UPDATE

这是 MySQL 的"upsert"神器：冲突时更新，不冲突时插入。

\`\`\`sql
INSERT INTO users (id, username, email, age)
VALUES (1, 'alice', 'alice@new.com', 29)
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  age = VALUES(age);
\`\`\`

**8.0 新语法**：用 \`AS 别名\` 引用待插入的值，更清晰：

\`\`\`sql
INSERT INTO users (id, username, email, age)
VALUES (1, 'alice', 'alice@new.com', 29) AS new
ON DUPLICATE KEY UPDATE
  email = new.email,
  age = new.age;
\`\`\`

### 经典应用：计数器

\`\`\`sql
-- 记录每个用户每天的访问次数
CREATE TABLE daily_stats (
  user_id BIGINT,
  stat_date DATE,
  visit_count INT DEFAULT 0,
  PRIMARY KEY (user_id, stat_date)
);

-- 第一次插入，后续累加
INSERT INTO daily_stats (user_id, stat_date, visit_count)
VALUES (1, '2024-01-01', 1)
ON DUPLICATE KEY UPDATE
  visit_count = visit_count + 1;
\`\`\`

## 4.6 安全更新模式（sql_safe_updates）

MySQL 客户端可开启 \`--safe-updates\`，强制 UPDATE/DELETE 带 WHERE：

\`\`\`sql
-- 开启
SET sql_safe_updates = 1;

-- 这个会报错：没 WHERE 或 WHERE 用了非索引列
DELETE FROM users;
UPDATE users SET age = 30;

-- 这个 OK：WHERE 用了索引列
DELETE FROM users WHERE id = 1;
UPDATE users SET age = 30 WHERE id > 10;
\`\`\`

**命令行启动时开启**：
\`\`\`bash
mysql -uroot -p --safe-updates
\`\`\`

> 经验：**生产环境 cli 必开 safe-updates**。无数次删库事故都是因为忘加 WHERE。

## 4.7 踩坑提示

**坑 1：忘加 WHERE 全表更新**
\`\`\`sql
-- 灾难！全员年龄变 30
UPDATE users SET age = 30;

-- 灾难！全表删除
DELETE FROM users;
\`\`\`
防护：开 \`sql_safe_updates\`，操作前先 \`SELECT\` 确认。

**坑 2：UPDATE 大事务锁表**
\`\`\`sql
-- 1000 万行表一次性更新，锁表几小时
UPDATE big_table SET col = col + 1 WHERE status = 0;
\`\`\`
分批更新：
\`\`\`sql
UPDATE big_table SET col = col + 1
WHERE status = 0 LIMIT 1000;
-- 反复执行直到 affected_rows = 0
\`\`\`

**坑 3：ON DUPLICATE KEY UPDATE 的 VALUES() 函数**
8.0.20 起 \`VALUES()\` 函数被**废弃**，推荐用别名语法：
\`\`\`sql
-- 旧（8.0.20 起废弃）
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- 新（推荐）
INSERT INTO users (...) VALUES (...) AS new
ON DUPLICATE KEY UPDATE email = new.email;
\`\`\`

**坑 4：DELETE 不释放磁盘**
\`DELETE\` 后表文件不会缩小，只是标记可复用。要回收空间：
\`\`\`sql
OPTIMIZE TABLE big_table;  -- 重建表，锁表，慎用
\`\`\`
或用 \`pt-online-schema-change\` 在线重建。

**坑 5：REPLACE 改了自增 ID**
\`\`\`sql
CREATE TABLE t (id INT AUTO_INCREMENT PRIMARY KEY, code VARCHAR(10) UNIQUE);
INSERT INTO t (code) VALUES ('a');   -- id=1
REPLACE INTO t (id, code) VALUES (1, 'a');  -- 实际是删了 id=1，又插了新的 id=2
\`\`\`
如果其他表用 \`t.id\` 做外键，引用就断了。永远用 \`ON DUPLICATE KEY UPDATE\` 替代 \`REPLACE\`。

**坑 6：批量 INSERT 太大导致超时**
单条 INSERT 太大（如 10 万行）会让事务过大、binlog 暴涨、可能超时。建议每批 500-1000 行。

## 4.8 本章小结

- 批量 INSERT 比循环单条快 10-100 倍，每批 500-1000 行
- \`UPDATE ... JOIN ...\` 用于跨表更新，比子查询高效
- 删大数据务必**分批 + LIMIT**，避免大事务
- \`ON DUPLICATE KEY UPDATE\` 是 upsert 首选，避免 \`REPLACE\`（会改 ID）
- 计数器场景用 \`ON DUPLICATE KEY UPDATE\` + 累加表达式
- 生产环境必开 \`sql_safe_updates\`，防忘加 WHERE
- UPDATE/DELETE 前先 SELECT 确认，重要操作开事务

下一章进入查询世界，从最基础的 SELECT 开始。`
  },

  {
    id: "mysql-ch05",
    group: "第一部分 入门与基础",
    icon: "🔍",
    title: "第 5 章 基础查询 SELECT",
    content: `# 第 5 章 基础查询 SELECT

SELECT 是 SQL 中最常用的语句，也是最有学问的。本章讲透基础查询：列选择、过滤、排序、分页、去重、NULL 处理。掌握这些，日常 80% 查询场景都能搞定。

## 5.1 SELECT 基本语法

\`\`\`sql
SELECT
  [DISTINCT]              -- 去重
  列1, 列2, ...           -- 选择列
FROM 表名
[WHERE 条件]              -- 过滤行
[GROUP BY 列]            -- 分组
[HAVING 条件]            -- 分组后过滤
[ORDER BY 列 [ASC|DESC]] -- 排序
[LIMIT N [OFFSET M]];    -- 分页
\`\`\`

**执行顺序**（重要！面试常考）：

\`FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT\`

> 理解执行顺序能解释很多现象：比如 \`WHERE\` 不能用 \`SELECT\` 中的别名（因为 WHERE 先执行，别名还没生成），而 \`ORDER BY\` 可以用别名。

### SELECT 字面量

\`\`\`sql
SELECT 1;                       -- 当计算器
SELECT 1 + 1 AS sum;
SELECT NOW();                   -- 当前时间
SELECT VERSION();               -- MySQL 版本
SELECT 'Hello' AS greeting;
\`\`\`

### 选择列

\`\`\`sql
-- 选择所有列（生产环境避免 *，效率低且耦合）
SELECT * FROM users;

-- 选择指定列（推荐）
SELECT id, username, email FROM users;

-- 列别名
SELECT username AS name, email AS mail FROM users;
SELECT username name, email mail FROM users;  -- AS 可省略
\`\`\`

## 5.2 WHERE 条件过滤

### 比较运算符

\`\`\`sql
SELECT * FROM products WHERE price = 99.9;
SELECT * FROM products WHERE price != 99.9;
SELECT * FROM products WHERE price > 100;
SELECT * FROM products WHERE price >= 100 AND price <= 500;
SELECT * FROM products WHERE price BETWEEN 100 AND 500;  -- 等价
\`\`\`

### 逻辑运算符

\`\`\`sql
-- AND / OR
SELECT * FROM users WHERE age >= 18 AND status = 1;
SELECT * FROM users WHERE age < 18 OR age > 65;

-- NOT
SELECT * FROM users WHERE NOT (age < 18);

-- 用括号控制优先级
SELECT * FROM users
WHERE (age < 18 OR age > 65) AND status = 1;
\`\`\`

### IN / NOT IN

\`\`\`sql
SELECT * FROM users WHERE city IN ('北京','上海','广州');
SELECT * FROM users WHERE city NOT IN ('北京','上海');

-- IN 可带子查询
SELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE status = 1);
\`\`\`

### BETWEEN

\`\`\`sql
-- BETWEEN 是闭区间 [a, b]
SELECT * FROM orders WHERE created_at BETWEEN '2024-01-01' AND '2024-01-31';
\`\`\`

> 踩坑：\`BETWEEN '2024-01-01' AND '2024-01-31'\` 包含两端。如果列是 DATETIME，1 月 31 日 00:00:00 之后的数据查不到！正确写法：\`BETWEEN '2024-01-01' AND '2024-02-01'\` 或 \`>= '2024-01-01' AND < '2024-02-01'\`。

## 5.3 ORDER BY 排序

\`\`\`sql
-- 升序（默认）
SELECT * FROM users ORDER BY age ASC;

-- 降序
SELECT * FROM users ORDER BY age DESC;

-- 多列排序
SELECT * FROM users ORDER BY status DESC, age ASC;
-- 先按 status 降序，status 相同的按 age 升序

-- 用列位置（不推荐，可读性差）
SELECT id, username, age FROM users ORDER BY 3 DESC;  -- 按 age 排
\`\`\`

### 用 SELECT 别名排序

\`\`\`sql
-- ORDER BY 可以用 SELECT 中的别名
SELECT username, age * 2 AS double_age
FROM users
ORDER BY double_age DESC;
\`\`\`

### NULL 在排序中的位置

\`\`\`sql
-- MySQL 中 NULL 被认为是最小值
-- 升序时 NULL 在最前，降序时 NULL 在最后
SELECT * FROM users ORDER BY age ASC;

-- 8.0+ 可强制 NULL 在前/后
SELECT * FROM users ORDER BY age ASC NULLS FIRST;
SELECT * FROM users ORDER BY age ASC NULLS LAST;
\`\`\`

> 经验：\`ORDER BY\` 是高开销操作，能避免就避免。在排序列上加索引，可以让 MySQL 利用索引的天然有序性避免排序。

## 5.4 LIMIT 分页

\`\`\`sql
-- 取前 10 条
SELECT * FROM users LIMIT 10;

-- 取第 21-30 条（偏移 20，取 10 条）
SELECT * FROM users LIMIT 20, 10;
-- 等价写法
SELECT * FROM users LIMIT 10 OFFSET 20;
\`\`\`

### 经典分页模式

\`\`\`sql
-- 前端传 page 和 pageSize，后端这样算
-- page=3, pageSize=10 → OFFSET = (3-1)*10 = 20
SELECT id, username, email
FROM users
WHERE status = 1
ORDER BY id ASC
LIMIT 10 OFFSET 20;
\`\`\`

### 深分页问题

\`\`\`sql
-- 第 10000 页（OFFSET = 99990）
SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 99990;
\`\`\`

> 这个查询虽然只返回 10 条，但 MySQL 要**扫描并丢弃前 99990 条**，越往后越慢。优化方法见第 16 章（用游标分页 / 子查询 + 主键定位）。

### LIMIT 用于去重 Top N

\`\`\`sql
-- 找最贵的 3 个商品
SELECT * FROM products ORDER BY price DESC LIMIT 3;
\`\`\`

## 5.5 DISTINCT 去重

\`\`\`sql
-- 查所有用户的城市（去重）
SELECT DISTINCT city FROM users;

-- 多列去重（city + province 组合去重）
SELECT DISTINCT province, city FROM users;

-- DISTINCT + COUNT
SELECT COUNT(DISTINCT city) FROM users;
\`\`\`

> \`DISTINCT\` 实际是分组操作，开销不小。如果要经常查"用户来自多少城市"，应该单独维护一张 \`cities\` 表，或加索引。

## 5.6 LIKE 与通配符

\`\`\`sql
-- % 匹配任意多个字符（包括 0 个）
SELECT * FROM users WHERE username LIKE 'ali%';     -- 以 ali 开头
SELECT * FROM users WHERE username LIKE '%ce';      -- 以 ce 结尾
SELECT * FROM users WHERE username LIKE '%li%';     -- 包含 li

-- _ 匹配单个字符
SELECT * FROM users WHERE username LIKE 'al_ce';    -- alice、alyce

-- 转义特殊字符
SELECT * FROM users WHERE username LIKE '%\\\\%%';  -- 包含 % 字符
\`\`\`

**LIKE 性能要点**：

| 模式 | 是否走索引 |
| --- | --- |
| \`LIKE 'ali%'\`（前缀匹配） | ✅ 走索引 |
| \`LIKE '%li'\`（后缀匹配） | ❌ 全表扫描 |
| \`LIKE '%li%'\`（中间匹配） | ❌ 全表扫描 |

> 经验：前缀匹配能走索引，全模糊匹配慢。如果业务必须全模糊搜索，考虑：
> - 数据量小（< 10 万行）：直接 LIKE
> - 数据量大：用全文索引 \`FULLTEXT\` 或 Elasticsearch

## 5.7 NULL 的处理

NULL 是 SQL 中最特殊的存在，必须专门讲。

### NULL 不等于任何值

\`\`\`sql
SELECT NULL = NULL;   -- 结果是 NULL，不是 true
SELECT NULL != NULL;  -- 结果也是 NULL
SELECT NULL IS NULL;  -- true
\`\`\`

### 比较时用 IS NULL / IS NOT NULL

\`\`\`sql
-- 错误：永远查不到 age 为 NULL 的行
SELECT * FROM users WHERE age = NULL;

-- 正确
SELECT * FROM users WHERE age IS NULL;
SELECT * FROM users WHERE age IS NOT NULL;
\`\`\`

### <=> 安全等于

\`\`\`sql
-- <=> 是 NULL 安全的等于
SELECT * FROM users WHERE age <=> NULL;  -- 能查到 age 为 NULL 的行
SELECT NULL <=> NULL;  -- true
\`\`\`

### 聚合函数忽略 NULL

\`\`\`sql
-- 假设有 5 行，其中 2 行 age 为 NULL
SELECT COUNT(*) FROM users;      -- 5（所有行）
SELECT COUNT(age) FROM users;    -- 3（非 NULL 的行）
SELECT AVG(age) FROM users;      -- 平均值只算 3 行
\`\`\`

### IFNULL / COALESCE

\`\`\`sql
-- age 为 NULL 时返回 0
SELECT IFNULL(age, 0) FROM users;

-- COALESCE 返回第一个非 NULL 值（更通用）
SELECT COALESCE(age, 0) FROM users;
SELECT COALESCE(nickname, username, email) FROM users;  -- 优先级回退
\`\`\`

> 经验：**字段能 NOT NULL 就 NOT NULL**。NULL 让查询、索引、聚合都变复杂。如果业务上"未知"，用 0、空字符串、'unknown' 等默认值代替。

## 5.8 踩坑提示

**坑 1：WHERE 用 SELECT 别名报错**
\`\`\`sql
SELECT age * 2 AS double_age FROM users WHERE double_age > 50;
-- 报错：Unknown column 'double_age'

-- 因为执行顺序：WHERE 先于 SELECT 执行
-- 解决：用 HAVING 或重复表达式
SELECT age * 2 AS double_age FROM users HAVING double_age > 50;
SELECT age * 2 AS double_age FROM users WHERE age * 2 > 50;
\`\`\`

**坑 2：BETWEEN 的右边界**
\`\`\`sql
-- 1 月数据
SELECT * FROM orders WHERE created_at BETWEEN '2024-01-01' AND '2024-01-31';
-- 漏了 1 月 31 日 00:00:01 之后的数据
\`\`\`
正确写法：\`>= '2024-01-01' AND < '2024-02-01'\`。

**坑 3：SELECT * 的危害**
- 占用更多内存和网络带宽
- 改表加列后 ORM 映射可能错位
- 无法利用覆盖索引
- 显式列名才能让代码可读、可维护

**坑 4：LIMIT 没加 ORDER BY**
\`\`\`sql
SELECT * FROM users LIMIT 10;  -- 结果顺序不确定
\`\`\`
没有 ORDER BY 时，MySQL 不保证返回顺序。分页必须配合 ORDER BY + 唯一列（如主键）。

**坑 5：NULL 比较陷阱**
\`\`\`sql
SELECT * FROM users WHERE age != 18;
-- age 为 NULL 的行**不会**返回！因为 NULL != 18 的结果是 NULL，不是 true
\`\`\`
要包含 NULL：\`WHERE age != 18 OR age IS NULL\`。

**坑 6：LIKE 大小写**
\`utf8mb4_general_ci\` / \`unicode_ci\` 下 LIKE 不区分大小写：
\`\`\`sql
SELECT 'ABC' LIKE 'abc';  -- 1 (true)
\`\`\`
需要区分大小写用 \`BINARY\`：
\`\`\`sql
SELECT 'ABC' LIKE BINARY 'abc';  -- 0
\`\`\`

## 5.9 本章小结

- SELECT 执行顺序：FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
- 永远显式列名，避免 \`SELECT *\`
- WHERE 不能用 SELECT 别名，HAVING 可以
- BETWEEN 是闭区间，DATETIME 范围查询要小心右边界
- ORDER BY 必须配合 LIMIT 分页，且最好基于唯一列
- 深分页（OFFSET 大）很慢，后续章节讲优化
- LIKE 前缀匹配走索引，全模糊走全表
- NULL 三定律：不等于任何值、聚合忽略、用 IS NULL 比较

下一章讲聚合函数和分组，进入数据分析的大门。`
  },

  {
    id: "mysql-ch06",
    group: "第一部分 入门与基础",
    icon: "🧮",
    title: "第 6 章 聚合函数与分组",
    content: `# 第 6 章 聚合函数与分组

聚合函数把多行数据"压缩"成一个值（如总数、平均值），\`GROUP BY\` 把数据分组后分别聚合。这是数据分析的基础，也是面试必考。

## 6.1 COUNT / SUM / AVG / MIN / MAX

### COUNT 计数

\`\`\`sql
-- COUNT(*)：统计行数（包含 NULL）
SELECT COUNT(*) FROM users;

-- COUNT(列)：统计该列非 NULL 的行数
SELECT COUNT(email) FROM users;

-- COUNT(DISTINCT 列)：去重计数
SELECT COUNT(DISTINCT city) FROM users;
\`\`\`

**COUNT 的三种写法对比**：

| 写法 | 统计什么 | 是否忽略 NULL | 性能 |
| --- | --- | --- | --- |
| \`COUNT(*)\` | 所有行 | 不忽略 | 最快（优化器直接读行数） |
| \`COUNT(1)\` | 所有行 | 不忽略 | 和 * 等价 |
| \`COUNT(列)\` | 该列非 NULL | 忽略 | 稍慢（要逐行判断） |

> 经验：\`COUNT(*)\` 和 \`COUNT(1)\` 完全等价，性能无差异。InnoDB 8.0+ 对 \`COUNT(*)\` 有并行优化。

### SUM 求和

\`\`\`sql
-- 所有订单总金额
SELECT SUM(total_amount) FROM orders;

-- 按状态分组求和
SELECT status, SUM(total_amount) AS total
FROM orders
GROUP BY status;
\`\`\`

### AVG 平均值

\`\`\`sql
-- 平均订单金额（忽略 NULL 行）
SELECT AVG(total_amount) FROM orders;

-- 等价于 SUM / COUNT
SELECT SUM(total_amount) / COUNT(total_amount) FROM orders;
\`\`\`

> 注意：AVG 自动忽略 NULL 行。如果想把 NULL 当 0，用 \`AVG(IFNULL(col, 0))\`。

### MIN / MAX

\`\`\`sql
SELECT MIN(price), MAX(price) FROM products;

-- 配合 GROUP BY
SELECT category, MIN(price) AS min_price, MAX(price) AS max_price
FROM products
GROUP BY category;
\`\`\`

### GROUP_CONCAT 字符串聚合

\`\`\`sql
-- 把同组的字段拼成字符串
SELECT user_id, GROUP_CONCAT(order_no SEPARATOR ',') AS orders
FROM orders
GROUP BY user_id;

-- 去重 + 排序
SELECT user_id, GROUP_CONCAT(DISTINCT status ORDER BY status) AS statuses
FROM orders
GROUP BY user_id;
\`\`\`

> \`GROUP_CONCAT\` 默认长度上限 1024 字节，超过会截断。需要更长时：
> \`\`\`sql
> SET SESSION group_concat_max_len = 102400;
> \`\`\`

## 6.2 GROUP BY 分组

\`\`\`sql
-- 按城市统计用户数
SELECT city, COUNT(*) AS user_count
FROM users
GROUP BY city;

-- 多列分组
SELECT province, city, COUNT(*) AS user_count
FROM users
GROUP BY province, city;
\`\`\`

**执行逻辑**：
1. 按 GROUP BY 列对数据排序/分组
2. 每组应用聚合函数
3. 返回每组一行结果

### 单列 vs 多列分组

\`\`\`sql
-- 单列：每个城市多少用户
SELECT city, COUNT(*) FROM users GROUP BY city;

-- 多列：每个省-城市组合多少用户
SELECT province, city, COUNT(*) FROM users GROUP BY province, city;
\`\`\`

### GROUP BY 与 SELECT 列

> **重要规则**：SELECT 中出现的非聚合列，必须出现在 GROUP BY 中（除非开了 \`ONLY_FULL_GROUP_BY\` 模式且使用函数依赖）。

\`\`\`sql
-- 错误：username 没在 GROUP BY 中
SELECT city, username, COUNT(*) FROM users GROUP BY city;

-- 正确
SELECT city, COUNT(*) FROM users GROUP BY city;
\`\`\`

MySQL 8.0 默认开 \`ONLY_FULL_GROUP_BY\`，违反规则会报错。可以临时关闭：
\`\`\`sql
SET sql_mode = 'STRICT_TRANS_TABLES';  -- 去掉 ONLY_FULL_GROUP_BY
\`\`\`

> 不推荐关闭！这是 SQL 标准，关闭后结果不确定。

## 6.3 HAVING 分组后过滤

\`WHERE\` 在分组前过滤行，\`HAVING\` 在分组后过滤组。

\`\`\`sql
-- 找订单数 > 5 的用户
SELECT user_id, COUNT(*) AS order_count
FROM orders
GROUP BY user_id
HAVING COUNT(*) > 5;

-- WHERE + HAVING 组合
SELECT user_id, COUNT(*) AS cnt, SUM(total_amount) AS total
FROM orders
WHERE status = 3            -- 先过滤：只看已完成订单
GROUP BY user_id
HAVING SUM(total_amount) > 1000;  -- 再过滤：总金额 > 1000 的用户
\`\`\`

**WHERE vs HAVING**：

| 维度 | WHERE | HAVING |
| --- | --- | --- |
| 时机 | 分组前 | 分组后 |
| 能用聚合函数 | ❌ | ✅ |
| 用索引 | ✅ | ❌ |
| 过滤对象 | 行 | 组 |

> 经验：能放在 WHERE 的条件就放 WHERE（能用索引、减少分组数据量），只有聚合后的过滤才用 HAVING。

## 6.4 GROUP BY 与 WITH ROLLUP

\`WITH ROLLUP\` 在分组结果末尾追加"汇总行"。

\`\`\`sql
-- 按城市统计订单数，并显示总计
SELECT
  COALESCE(city, '总计') AS city,
  COUNT(*) AS order_count,
  SUM(total_amount) AS total
FROM orders
GROUP BY city WITH ROLLUP;
\`\`\`

结果示例：

| city | order_count | total |
| --- | --- | --- |
| 北京 | 100 | 50000 |
| 上海 | 150 | 80000 |
| **总计** | **250** | **130000** |

### 多列 ROLLUP

\`\`\`sql
-- 按 省份 + 城市 双层分组 + ROLLUP
SELECT province, city, COUNT(*) AS cnt
FROM users
GROUP BY province, city WITH ROLLUP;
\`\`\`

会产出每省小计 + 总计行。

## 6.5 聚合函数的坑

**坑 1：COUNT(列) vs COUNT(\*)**
\`\`\`sql
SELECT COUNT(*) FROM users;      -- 1000
SELECT COUNT(phone) FROM users;  -- 800（phone 为 NULL 的 200 行被忽略）
\`\`\`
误用会导致统计结果偏差。

**坑 2：AVG 忽略 NULL**
\`\`\`sql
-- 5 个用户，1 个 age=NULL
SELECT AVG(age) FROM users;  -- 实际是 SUM(age)/4，不是 /5
\`\`\`
如果业务要"未知年龄当 0"：\`AVG(IFNULL(age, 0))\`。

**坑 3：GROUP BY 选非聚合列**
\`\`\`sql
SELECT city, username, COUNT(*) FROM users GROUP BY city;
-- MySQL 8.0 报错（ONLY_FULL_GROUP_BY）
\`\`\`
解决：要么 username 加聚合（\`MAX(username)\`、\`GROUP_CONCAT(username)\`），要么放 GROUP BY。

**坑 4：HAVING 用 SELECT 别名**
\`\`\`sql
SELECT city, COUNT(*) AS cnt FROM users GROUP BY city HAVING cnt > 10;
-- MySQL 中可以！HAVING 能用 SELECT 别名（MySQL 扩展）
-- 但其他数据库不一定支持，跨库迁移要注意
\`\`\`

**坑 5：GROUP_CONCAT 截断**
\`\`\`sql
SELECT user_id, GROUP_CONCAT(order_no) FROM orders GROUP BY user_id;
-- 如果用户订单很多，结果可能被截断到 1024 字节
\`\`\`
要调大 \`group_concat_max_len\`。

**坑 6：分组后 ORDER BY 失效**
\`\`\`sql
SELECT city, COUNT(*) AS cnt FROM users GROUP BY city ORDER BY cnt DESC;
-- 必须显式 ORDER BY，不能依赖 GROUP BY 的隐式排序
\`\`\`
MySQL 8.0 不再保证 GROUP BY 的隐式排序（5.7 之前默认按分组列排序）。

## 6.6 综合示例：订单分析

\`\`\`sql
-- 每个用户：订单数、总金额、平均金额、最大订单、最近下单时间
SELECT
  user_id,
  COUNT(*)             AS order_count,
  SUM(total_amount)    AS total_amount,
  AVG(total_amount)    AS avg_amount,
  MAX(total_amount)    AS max_amount,
  MAX(created_at)      AS last_order_time
FROM orders
WHERE status IN (1, 2, 3)  -- 排除已取消
GROUP BY user_id
HAVING SUM(total_amount) > 1000
ORDER BY total_amount DESC
LIMIT 20;
\`\`\`

\`\`\`sql
-- 月度销售报表
SELECT
  DATE_FORMAT(created_at, '%Y-%m') AS month,
  COUNT(*)                         AS order_count,
  SUM(total_amount)                AS revenue,
  AVG(total_amount)                AS avg_order_value,
  COUNT(DISTINCT user_id)          AS active_users
FROM orders
WHERE created_at >= '2024-01-01'
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
WITH ROLLUP;
\`\`\`

## 6.7 踩坑提示

**坑 1：分组列与 SELECT 列不匹配**
开 \`ONLY_FULL_GROUP_BY\` 后严格检查，养成好习惯。

**坑 2：大表 GROUP BY 性能差**
\`\`\`sql
-- 1000 万行表按 city 分组，临时表巨大
SELECT city, COUNT(*) FROM big_users GROUP BY city;
\`\`\`
优化：在 \`city\` 加索引；如果只要前 N，考虑 \`LIMIT\` 或预聚合表。

**坑 3：COUNT(DISTINCT) 很慢**
\`\`\`sql
SELECT COUNT(DISTINCT city) FROM users;  -- 需要去重，慢
\`\`\`
如果经常查，考虑维护城市字典表。

**坑 4：FLOAT/DOUBLE 聚合精度**
\`\`\`sql
SELECT SUM(price) FROM products;  -- FLOAT 可能 0.1+0.2=0.30000001
\`\`\`
金额字段必须 DECIMAL。

## 6.8 本章小结

- 五大聚合：\`COUNT\`、\`SUM\`、\`AVG\`、\`MIN\`、\`MAX\`，都忽略 NULL（COUNT(*) 例外）
- \`COUNT(*)\` 和 \`COUNT(1)\` 等价且最快
- \`GROUP BY\` 分组，SELECT 非聚合列必须出现在 GROUP BY 中
- \`WHERE\` 分组前过滤（能用索引），\`HAVING\` 分组后过滤（可用聚合函数）
- \`WITH ROLLUP\` 自动追加小计/总计行
- \`GROUP_CONCAT\` 拼接字符串，注意长度上限
- AVG/SUM 忽略 NULL，要"当 0 处理"用 \`IFNULL\`
- 大表 GROUP BY 要在分组列加索引

至此，第一部分入门与基础结束。你已经能用 SELECT 完成绝大多数日常查询。下一部分进入查询进阶：JOIN、子查询、窗口函数、CTE。`
  }
];

export { chapters };
