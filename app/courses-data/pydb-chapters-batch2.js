// =============================================================
// Python 数据库编程教程（pydb）—— 第二批章节
// -------------------------------------------------------------
// MySQL（4 章）+ PostgreSQL（3 章），共 7 章。
// 代码使用 pymysql / psycopg2 驱动，无服务器时优雅降级到 sqlite3，
// 单文件可独立运行，10 秒超时。
// =============================================================

export const chapters = [
  {
    id: "py-mysql-intro",
    group: "MySQL",
    icon: "🐬",
    title: "MySQL 入门",
    content: `## 一、MySQL 是什么

**MySQL** 是全球最流行的开源关系型数据库，由瑞典 MySQL AB 公司开发，现归 Oracle 旗下。它以**高性能、高可靠、易使用**著称，是 Web 应用（LAMP 架构）的事实标准。

MySQL 的核心特点：

1. **客户端/服务器架构**： mysqld 守护进程监听 3306 端口，客户端通过 TCP 连接。
2. **插件式存储引擎**：同一张表可以选择不同的存储引擎，各有优劣。
3. **跨平台**：Linux / macOS / Windows 全平台支持，Docker 一键启动。
4. **生态成熟**：Navicat、DBeaver、phpMyAdmin 等工具齐全。
5. **社区活跃**：遇到问题搜索引擎一搜就有答案。

## 二、MySQL 架构

\`\`\`text
客户端（pymysql / mysql / Navicat）
        │  TCP 3306
        ▼
┌─────────────────────────┐
│   连接管理层（认证/线程池）  │
├─────────────────────────┤
│   SQL 层（解析/优化/执行）   │
├─────────────────────────┤
│   存储引擎层（插件式）       │
│   InnoDB │ MyISAM │ Memory │
└─────────────────────────┘
        │
        ▼
      磁盘文件（.ibd / .MYD / .MYI）
\`\`\`

- **mysqld**：MySQL 服务器主进程，负责接收连接、解析 SQL、调度存储引擎。
- **连接层**：每个客户端连接对应一个线程，负责认证与权限校验。
- **SQL 层**：解析 SQL → 生成执行计划 → 调用存储引擎接口。
- **存储引擎层**：负责数据的实际读写，不同引擎特性不同。

## 三、存储引擎：InnoDB vs MyISAM

| 特性 | InnoDB（默认） | MyISAM |
|------|---------------|--------|
| 事务 | ✅ 支持 ACID | ❌ 不支持 |
| 行级锁 | ✅ 支持 | ❌ 只有表锁 |
| 外键 | ✅ 支持 | ❌ 不支持 |
| 崩溃恢复 | ✅ redo log 恢复 | ❌ 易损坏 |
| 全文索引 | ✅ 5.6+ 支持 | ✅ 支持 |
| 聚簇索引 | ✅ 主键聚簇 | ❌ 非聚簇 |
| 适用场景 | OLTP 事务型业务 | 只读/统计报表 |

> MySQL 5.5 起 **InnoDB 成为默认引擎**，绝大多数场景都应使用 InnoDB。

## 四、安装 MySQL（Docker 推荐）

最简单的方式是用 Docker：

\`\`\`bash
docker run -d --name mysql \\
  -e MYSQL_ROOT_PASSWORD=123456 \\
  -p 3306:3306 \\
  mysql:8
\`\`\`

启动后即可用 \`mysql -h127.0.0.1 -uroot -p123456\` 连接。

非 Docker 方式：

- macOS：\`brew install mysql\`
- Ubuntu：\`sudo apt install mysql-server\`
- Windows：官网下载 MSI 安装包

## 五、字符集与排序规则

MySQL 的字符集坑很多，务必注意：

| 字符集 | 说明 | 是否支持 emoji |
|--------|------|---------------|
| \`latin1\` | 默认（老版本）西欧编码 | ❌ |
| \`utf8\` | MySQL 的 utf8 是**截断版**（最多 3 字节） | ❌ |
| \`utf8mb4\` | 真正的 UTF-8（最多 4 字节） | ✅ |

> **强烈建议**：建库建表一律使用 \`utf8mb4\`，否则 emoji 和部分汉字会报错或丢失。

\`\`\`sql
CREATE DATABASE shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
\`\`\`

## 六、MySQL 常用数据类型

| 类型 | 说明 | 示例 |
|------|------|------|
| \`INT\` / \`BIGINT\` | 整型（4/8 字节） | \`id INT\` |
| \`VARCHAR(n)\` | 变长字符串 | \`name VARCHAR(50)\` |
| \`TEXT\` / \`LONGTEXT\` | 长文本（64KB / 4GB） | \`content TEXT\` |
| \`DATETIME\` | 日期时间 | \`created_at DATETIME\` |
| \`TIMESTAMP\` | 时间戳（自动更新） | \`updated_at TIMESTAMP\` |
| \`DECIMAL(p,s)\` | 精确小数（用于金额） | \`price DECIMAL(10,2)\` |
| \`JSON\` | JSON 文档类型（5.7+） | \`config JSON\` |
| \`ENUM\` | 枚举 | \`status ENUM('active','disabled')\` |
| \`BOOLEAN\` | 布尔（实为 TINYINT(1)） | \`is_active BOOLEAN\` |

## 七、本章代码说明

下面的代码尝试用 \`pymysql\` 连接本地 MySQL。如果服务器未启动，会自动降级到 \`sqlite3\` 演示相同的 SQL 概念，确保代码**在任何环境下都能运行**。`,
    code: `# ============================================================
# 第一章代码演示：MySQL 入门
# ------------------------------------------------------------
# 尝试用 pymysql 连接本地 MySQL，连接失败则降级到 sqlite3。
# ============================================================
import pymysql
import sqlite3

print("=" * 60)
print("MySQL 入门演示")
print("=" * 60)

# ---- 尝试连接 MySQL ----
def try_mysql():
    """尝试连接 MySQL，成功返回连接，失败返回 None"""
    try:
        conn = pymysql.connect(
            host="127.0.0.1",
            port=3306,
            user="root",
            password="123456",
            connect_timeout=2,
            charset="utf8mb4",
        )
        return conn
    except Exception as e:
        print(f"MySQL 连接失败: {type(e).__name__}")
        print("将使用 sqlite3 演示相同的 SQL 概念\\n")
        return None

mysql_conn = try_mysql()

if mysql_conn:
    # ===== MySQL 模式 =====
    print("[MySQL] 连接成功！服务器版本:", mysql_conn.get_server_info())
    cur = mysql_conn.cursor()
    # 创建临时演示数据库并切换
    cur.execute("CREATE DATABASE IF NOT EXISTS pydb_demo CHARSET utf8mb4")
    cur.execute("USE pydb_demo")
    # 建表（MySQL 特有语法：ENGINE 和 CHARSET）
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            age INT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)
    print("[MySQL] 已创建 users 表（InnoDB 引擎）")
    # 插入数据
    cur.execute("INSERT INTO users (name, age) VALUES (%s, %s)", ("张三", 28))
    cur.execute("INSERT INTO users (name, age) VALUES (%s, %s)", ("李四", 24))
    mysql_conn.commit()
    print("[MySQL] 已插入 2 条记录")
    # 查询
    cur.execute("SELECT id, name, age FROM users")
    print("[MySQL] 查询结果:")
    for row in cur.fetchall():
        print(f"  id={row[0]}, name={row[1]}, age={row[2]}")
    # 清理
    cur.close()
    mysql_conn.close()
    # 删除临时数据库
    conn2 = try_mysql()
    if conn2:
        conn2.cursor().execute("DROP DATABASE IF EXISTS pydb_demo")
        conn2.close()
        print("[MySQL] 已清理临时数据库 pydb_demo")
else:
    # ===== sqlite3 降级模式 =====
    print("[sqlite3] 使用内存数据库演示 SQL 概念")
    conn = sqlite3.connect(":memory:")
    cur = conn.cursor()
    # 建表（sqlite3 不支持 ENGINE/CHARSET，但 SQL 逻辑一致）
    cur.execute("""
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("[sqlite3] 已创建 users 表")
    # sqlite3 使用 ? 占位符（MySQL 用 %s）
    cur.execute("INSERT INTO users (name, age) VALUES (?, ?)", ("张三", 28))
    cur.execute("INSERT INTO users (name, age) VALUES (?, ?)", ("李四", 24))
    conn.commit()
    print("[sqlite3] 已插入 2 条记录")
    # 查询
    cur.execute("SELECT id, name, age FROM users")
    print("[sqlite3] 查询结果:")
    for row in cur.fetchall():
        print(f"  id={row[0]}, name={row[1]}, age={row[2]}")
    cur.close()
    conn.close()

print("\\n" + "=" * 60)
print("要点：MySQL 使用 %s 占位符，推荐 InnoDB + utf8mb4")
print("=" * 60)
`,
  },

  {
    id: "py-mysql-connect",
    group: "MySQL",
    icon: "🔌",
    title: "PyMySQL 连接与操作",
    content: `## 一、Python 操作 MySQL 的驱动对比

| 驱动 | 说明 | 优缺点 |
|------|------|--------|
| **PyMySQL** | 纯 Python 实现 | 安装简单、无系统依赖；性能中等 |
| mysql-connector-python | Oracle 官方驱动 | 功能全；体积大、速度一般 |
| mysqlclient | C 扩展（MySQLdb 续作） | 性能最高；编译安装可能报错 |
| asyncmy | 异步驱动 | 配合 asyncio 高并发；生态较新 |
| aiomysql | 异步驱动 | 老牌异步方案；维护趋缓 |

> 本教程使用 **PyMySQL**，因为它纯 Python 实现，\`pip install pymysql\` 即可，无需编译。

## 二、PyMySQL 连接参数

\`\`\`python
import pymysql

conn = pymysql.connect(
    host="127.0.0.1",     # 主机地址
    port=3306,            # 端口（int 类型）
    user="root",          # 用户名
    password="123456",    # 密码
    database="shop",      # 默认数据库
    charset="utf8mb4",    # 字符集
    autocommit=False,     # 是否自动提交
    connect_timeout=5,    # 连接超时（秒）
    read_timeout=30,      # 读超时
    write_timeout=30,     # 写超时
    cursorclass=...,      # 游标类型
)
\`\`\`

| 参数 | 默认值 | 说明 |
|------|--------|------|
| \`host\` | localhost | 服务器地址 |
| \`port\` | 3306 | 端口号 |
| \`autocommit\` | False | False 时需手动 \`commit()\` |
| \`charset\` | latin1 | 建议设为 utf8mb4 |
| \`connect_timeout\` | 10 | 连接超时秒数 |

## 三、游标类型

PyMySQL 提供多种游标，影响结果行的返回格式：

| 游标类 | 返回格式 | 适用场景 |
|--------|----------|----------|
| \`Cursor\`（默认） | 元组 \` (1, 'Alice')\` | 通用 |
| \`DictCursor\` | 字典 \`{'id': 1, 'name': 'Alice'}\` | 按列名访问 |
| \`SSCursor\` | 元组，服务端游标 | 大结果集省内存 |
| \`SSDictCursor\` | 字典，服务端游标 | 大结果集 + 按列名 |

\`\`\`python
from pymysql.cursors import DictCursor

conn = pymysql.connect(..., cursorclass=DictCursor)
cur = conn.cursor()
cur.execute("SELECT * FROM users")
row = cur.fetchone()
print(row["name"])  # 用列名访问，不用记位置
\`\`\`

## 四、占位符：%s（不是 ?）

**MySQL 驱动统一使用 \`%s\` 占位符**，与 sqlite3 的 \`?\` 不同：

\`\`\`python
# PyMySQL 用 %s
cur.execute("SELECT * FROM users WHERE age > %s AND name LIKE %s", (18, "张%"))

# sqlite3 用 ?
# cur.execute("SELECT * FROM users WHERE age > ? AND name LIKE ?", (18, "张%"))
\`\`\`

> ⚠️ **绝对不要**用 Python 字符串拼接 SQL，否则有 SQL 注入风险。始终用占位符。

## 五、autocommit 模式

| 模式 | 说明 |
|------|------|
| \`autocommit=False\`（默认） | 每条 SQL 在事务中，需手动 \`commit()\` |
| \`autocommit=True\` | 每条 SQL 自动提交，无需 \`commit()\` |

生产环境推荐 \`autocommit=False\` + 手动事务控制，保证原子性。

## 六、连接池概念

PyMySQL 本身不提供连接池，常用第三方库：

- **DBUtils**：经典的 \`PooledDB\`，线程安全连接池。
- **SQLAlchemy**：内置连接池，ORM 场景首选。
- **aiomysql.Pool**：异步连接池。

\`\`\`python
from dbutils.pooled_db import PooledDB

pool = PooledDB(
    creator=pymysql,
    maxconnections=10,
    host="127.0.0.1", user="root", password="123456",
    database="shop", charset="utf8mb4",
)
conn = pool.connection()  # 从池中借连接
try:
    # 使用连接...
    pass
finally:
    conn.close()  # 归还到池中，而非真正关闭
\`\`\`

## 七、本章代码说明

代码尝试连接 MySQL 并使用 \`DictCursor\`。若连接失败，降级到 sqlite3 并模拟字典游标效果。`,
    code: `# ============================================================
# 第二章代码演示：PyMySQL 连接与操作
# ------------------------------------------------------------
# 演示 DictCursor、%s 占位符、autocommit 模式。
# MySQL 不可用时降级到 sqlite3 并模拟字典游标。
# ============================================================
import pymysql
import sqlite3

print("=" * 60)
print("PyMySQL 连接与操作演示")
print("=" * 60)

# ---- 尝试连接 MySQL（使用 DictCursor） ----
def try_mysql():
    try:
        from pymysql.cursors import DictCursor
        conn = pymysql.connect(
            host="127.0.0.1", port=3306, user="root",
            password="123456", connect_timeout=2,
            charset="utf8mb4", cursorclass=DictCursor,
        )
        return conn
    except Exception as e:
        print(f"MySQL 连接失败: {type(e).__name__}")
        print("降级到 sqlite3 演示相同概念\\n")
        return None

mysql_conn = try_mysql()

if mysql_conn:
    # ===== MySQL + DictCursor 模式 =====
    print("[MySQL] 连接成功，使用 DictCursor")
    cur = mysql_conn.cursor()
    # 创建临时数据库
    cur.execute("CREATE DATABASE IF NOT EXISTS pydb_demo CHARSET utf8mb4")
    cur.execute("USE pydb_demo")
    # 建表
    cur.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            price DECIMAL(10,2)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)
    # %s 占位符演示（MySQL 专用）
    cur.execute("INSERT INTO products (name, price) VALUES (%s, %s)",
                ("Python 书", 59.00))
    cur.execute("INSERT INTO products (name, price) VALUES (%s, %s)",
                ("数据库书", 89.50))
    mysql_conn.commit()
    print("[MySQL] 插入 2 条记录（使用 %s 占位符）")
    # DictCursor 查询：按列名访问
    cur.execute("SELECT * FROM products WHERE price > %s", (50,))
    print("[MySQL] DictCursor 查询结果（按列名访问）:")
    for row in cur.fetchall():
        print(f"  id={row['id']}, name={row['name']}, price={row['price']}")
    # autocommit 演示
    mysql_conn.autocommit(True)
    cur.execute("INSERT INTO products (name, price) VALUES (%s, %s)",
                ("临时书", 9.90))
    print("[MySQL] autocommit=True，无需 commit 即已写入")
    mysql_conn.autocommit(False)
    # 清理
    cur.close()
    mysql_conn.close()
    conn2 = try_mysql()
    if conn2:
        conn2.cursor().execute("DROP DATABASE IF EXISTS pydb_demo")
        conn2.close()
        print("[MySQL] 已清理临时数据库")
else:
    # ===== sqlite3 降级 + 模拟 DictCursor =====
    print("[sqlite3] 使用 Row factory 模拟 DictCursor")
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row  # 关键：让结果支持按列名访问
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL
        )
    """)
    # sqlite3 用 ? 占位符（对应 MySQL 的 %s）
    cur.execute("INSERT INTO products (name, price) VALUES (?, ?)", ("Python 书", 59.00))
    cur.execute("INSERT INTO products (name, price) VALUES (?, ?)", ("数据库书", 89.50))
    conn.commit()
    print("[sqlite3] 插入 2 条记录（使用 ? 占位符，等价于 MySQL 的 %s）")
    # sqlite3.Row 按列名访问（等价于 DictCursor）
    cur.execute("SELECT * FROM products WHERE price > ?", (50,))
    print("[sqlite3] Row factory 查询结果（按列名访问，等价 DictCursor）:")
    for row in cur.fetchall():
        print(f"  id={row['id']}, name={row['name']}, price={row['price']}")
    # autocommit 演示：sqlite3 通过 isolation_level 控制
    conn.isolation_level = None  # 等价于 autocommit=True
    cur.execute("INSERT INTO products (name, price) VALUES (?, ?)", ("临时书", 9.90))
    print("[sqlite3] isolation_level=None（等价 autocommit=True），无需 commit")
    conn.isolation_level = ""  # 恢复默认
    cur.close()
    conn.close()

print("\\n" + "=" * 60)
print("要点：MySQL 用 %s 占位符，DictCursor 按列名访问")
print("=" * 60)
`,
  },

  {
    id: "py-mysql-crud",
    group: "MySQL",
    icon: "📝",
    title: "MySQL 增删改查",
    content: `## 一、MySQL 建表语法

MySQL 建表有自己的专属语法：

\`\`\`sql
CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,        -- 自增主键
    title VARCHAR(200) NOT NULL,
    author_id INT,
    views INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,          -- 自动更新时间
    FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;      -- 指定引擎和字符集
\`\`\`

与 sqlite3 的差异：

| 特性 | MySQL | sqlite3 |
|------|-------|---------|
| 自增 | \`AUTO_INCREMENT\` | \`AUTOINCREMENT\` |
| 引擎 | \`ENGINE=InnoDB\` | 不支持 |
| 字符集 | \`DEFAULT CHARSET=utf8mb4\` | 不支持 |
| 占位符 | \`%s\` | \`?\` |
| 获取自增 ID | \`LAST_INSERT_ID()\` | \`cursor.lastrowid\` |

## 二、INSERT 与自增 ID

\`\`\`python
cur.execute("INSERT INTO articles (title) VALUES (%s)", ("标题",))
article_id = cur.lastrowid  # 获取自增 ID
# 或者用 SQL 函数
cur.execute("SELECT LAST_INSERT_ID()")
\`\`\`

## 三、MySQL 特有插入语法

### 3.1 REPLACE INTO

遇到主键/唯一键冲突时，**先删后插**：

\`\`\`sql
REPLACE INTO users (id, name) VALUES (1, '新名字');
-- 如果 id=1 已存在，删除旧行再插入新行
\`\`\`

### 3.2 INSERT ... ON DUPLICATE KEY UPDATE

冲突时**更新**而非删除（更安全）：

\`\`\`sql
INSERT INTO counters (id, count) VALUES (1, 1)
ON DUPLICATE KEY UPDATE count = count + 1;
-- id=1 已存在则 count 自增，不存在则插入
\`\`\`

### 3.3 INSERT IGNORE

冲突时**静默忽略**，不报错：

\`\`\`sql
INSERT IGNORE INTO users (email) VALUES ('a@b.com');
-- 如果 email 有唯一约束且已存在，跳过不报错
\`\`\`

## 四、UPDATE 和 DELETE 的 LIMIT

MySQL 允许在 UPDATE/DELETE 中使用 \`LIMIT\`（标准 SQL 不支持）：

\`\`\`sql
-- 只更新前 10 条
UPDATE articles SET views = views + 1 ORDER BY created_at LIMIT 10;
-- 分批删除，避免锁表
DELETE FROM logs WHERE created_at < '2024-01-01' LIMIT 1000;
\`\`\`

## 五、事务与隔离级别

### 5.1 事务控制

\`\`\`python
cur.execute("START TRANSACTION")
try:
    cur.execute("UPDATE accounts SET balance = balance - 100 WHERE id = 1")
    cur.execute("UPDATE accounts SET balance = balance + 100 WHERE id = 2")
    conn.commit()  # 提交
except:
    conn.rollback()  # 回滚
\`\`\`

### 5.2 MySQL 隔离级别

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 说明 |
|----------|------|-----------|------|------|
| READ UNCOMMITTED | ✅ | ✅ | ✅ | 最低，几乎不用 |
| READ COMMITTED | ❌ | ✅ | ✅ | Oracle 默认 |
| **REPEATABLE READ** | ❌ | ❌ | ❌* | **MySQL 默认** |
| SERIALIZABLE | ❌ | ❌ | ❌ | 最高，性能差 |

> MySQL 的 REPEATABLE READ 通过 MVCC + 间隙锁，**几乎消除了幻读**（标 * 处），这是 MySQL 比标准 SQL 更强的地方。

设置隔离级别：

\`\`\`sql
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
\`\`\`

## 六、本章代码说明

代码完整演示 CRUD + 事务回滚。MySQL 不可用时降级到 sqlite3，MySQL 专属语法在注释中标出。`,
    code: `# ============================================================
# 第三章代码演示：MySQL 增删改查
# ------------------------------------------------------------
# 完整 CRUD + REPLACE/UPSERT 概念 + 事务回滚。
# MySQL 不可用时降级到 sqlite3，MySQL 语法在注释中说明。
# ============================================================
import pymysql
import sqlite3

print("=" * 60)
print("MySQL 增删改查演示")
print("=" * 60)

def try_mysql():
    try:
        conn = pymysql.connect(
            host="127.0.0.1", port=3306, user="root",
            password="123456", connect_timeout=2, charset="utf8mb4",
        )
        return conn
    except Exception as e:
        print(f"MySQL 连接失败: {type(e).__name__}，降级到 sqlite3\\n")
        return None

mysql_conn = try_mysql()

if mysql_conn:
    # ===== MySQL 模式 =====
    cur = mysql_conn.cursor()
    cur.execute("CREATE DATABASE IF NOT EXISTS pydb_demo CHARSET utf8mb4")
    cur.execute("USE pydb_demo")
    # 建表（MySQL 专属语法）
    cur.execute("""
        CREATE TABLE IF NOT EXISTS articles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            views INT DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)
    # Create：插入
    cur.execute("INSERT INTO articles (title, views) VALUES (%s, %s)", ("Python", 10))
    cur.execute("INSERT INTO articles (title, views) VALUES (%s, %s)", ("MySQL", 20))
    mysql_conn.commit()
    print("[MySQL] 已插入 2 篇文章")
    # 获取自增 ID（MySQL 专属）
    print(f"[MySQL] 上一条自增 ID: {cur.lastrowid}")
    # Read：查询
    cur.execute("SELECT id, title, views FROM articles ORDER BY views DESC")
    print("[MySQL] 查询全部:")
    for row in cur.fetchall():
        print(f"  {row}")
    # Update：更新
    cur.execute("UPDATE articles SET views = views + %s WHERE title = %s", (5, "Python"))
    mysql_conn.commit()
    print("[MySQL] 已更新 Python 文章浏览量 +5")
    # INSERT ... ON DUPLICATE KEY UPDATE（MySQL 专属）
    cur.execute("""
        INSERT INTO articles (id, title, views) VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE views = views + %s
    """, (1, "Python", 1, 1))
    mysql_conn.commit()
    print("[MySQL] ON DUPLICATE KEY UPDATE: id=1 浏览量 +1")
    # DELETE
    cur.execute("DELETE FROM articles WHERE title = %s", ("MySQL",))
    mysql_conn.commit()
    print("[MySQL] 已删除 MySQL 文章")
    # 事务回滚演示
    print("\\n[MySQL] 事务回滚演示:")
    cur.execute("START TRANSACTION")
    cur.execute("INSERT INTO articles (title) VALUES (%s)", ("临时文章",))
    cur.execute("SELECT COUNT(*) FROM articles")
    before = cur.fetchone()[0]
    print(f"  回滚前文章数: {before}")
    mysql_conn.rollback()  # 回滚
    cur.execute("SELECT COUNT(*) FROM articles")
    after = cur.fetchone()[0]
    print(f"  回滚后文章数: {after}（临时文章已撤销）")
    # 清理
    cur.close()
    mysql_conn.close()
    conn2 = try_mysql()
    if conn2:
        conn2.cursor().execute("DROP DATABASE IF EXISTS pydb_demo")
        conn2.close()
        print("[MySQL] 已清理临时数据库")
else:
    # ===== sqlite3 降级模式 =====
    conn = sqlite3.connect(":memory:")
    cur = conn.cursor()
    # 建表（sqlite3 用 AUTOINCREMENT，无 ENGINE/CHARSET）
    # MySQL 等价：ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    cur.execute("""
        CREATE TABLE articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            views INTEGER DEFAULT 0
        )
    """)
    # Create：插入（sqlite3 用 ? 占位符，MySQL 用 %s）
    cur.execute("INSERT INTO articles (title, views) VALUES (?, ?)", ("Python", 10))
    cur.execute("INSERT INTO articles (title, views) VALUES (?, ?)", ("MySQL", 20))
    conn.commit()
    print("[sqlite3] 已插入 2 篇文章")
    print(f"[sqlite3] 上一条自增 ID: {cur.lastrowid}")
    # Read：查询
    cur.execute("SELECT id, title, views FROM articles ORDER BY views DESC")
    print("[sqlite3] 查询全部:")
    for row in cur.fetchall():
        print(f"  {row}")
    # Update
    cur.execute("UPDATE articles SET views = views + ? WHERE title = ?", (5, "Python"))
    conn.commit()
    print("[sqlite3] 已更新 Python 文章浏览量 +5")
    # UPSERT 演示（sqlite3 语法，MySQL 用 ON DUPLICATE KEY UPDATE）
    # MySQL: INSERT INTO articles (id,title,views) VALUES(1,'Python',1)
    #        ON DUPLICATE KEY UPDATE views = views + 1
    cur.execute("""
        INSERT INTO articles (id, title, views) VALUES (?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET views = views + ?
    """, (1, "Python", 1, 1))
    conn.commit()
    print("[sqlite3] UPSERT: id=1 浏览量 +1（MySQL 用 ON DUPLICATE KEY UPDATE）")
    # DELETE
    cur.execute("DELETE FROM articles WHERE title = ?", ("MySQL",))
    conn.commit()
    print("[sqlite3] 已删除 MySQL 文章")
    # 事务回滚演示
    print("\\n[sqlite3] 事务回滚演示:")
    conn.isolation_level = None
    conn.execute("BEGIN")
    conn.execute("INSERT INTO articles (title) VALUES (?)", ("临时文章",))
    cur.execute("SELECT COUNT(*) FROM articles")
    before = cur.fetchone()[0]
    print(f"  回滚前文章数: {before}")
    conn.rollback()
    cur.execute("SELECT COUNT(*) FROM articles")
    after = cur.fetchone()[0]
    print(f"  回滚后文章数: {after}（临时文章已撤销）")
    conn.isolation_level = ""
    cur.close()
    conn.close()

print("\\n" + "=" * 60)
print("要点：REPLACE/UPSERT 是 MySQL 特色，事务保证原子性")
print("=" * 60)
`,
  },

  {
    id: "py-mysql-practice",
    group: "MySQL",
    icon: "🏪",
    title: "MySQL 实战：电商订单系统",
    content: `## 一、需求分析

电商系统的核心业务：用户下单购买商品。涉及的核心操作：

1. **创建订单**：用户选择商品，生成订单。
2. **扣减库存**：下单时扣减商品库存，**不能超卖**。
3. **订单查询**：查询订单详情（含商品列表）。
4. **并发安全**：多个用户同时下单，库存不能出错。

## 二、表设计

\`\`\`text
┌──────────┐     ┌──────────────┐     ┌─────────────┐
│  users   │     │   orders     │     │ order_items │
│──────────│     │──────────────│     │─────────────│
│ id (PK)  │◄──┐ │ id (PK)      │◄──┐ │ id (PK)     │
│ name     │   └─│ user_id (FK)  │   └─│ order_id(FK)│
│ phone    │     │ total_amount  │     │ product_id  │
└──────────┘     │ status        │     │ quantity    │
                 │ created_at    │     │ unit_price  │
                 └──────────────┘     └─────────────┘
                                          │
                     ┌──────────────┐     │
                     │   products   │◄────┘
                     │──────────────│
                     │ id (PK)      │
                     │ name         │
                     │ price        │
                     │ stock        │
                     └──────────────┘
\`\`\`

### 关键设计要点

- **DECIMAL** 存金额：\`DECIMAL(10,2)\` 精确到分，不用 FLOAT（浮点误差）。
- **TIMESTAMP** 默认值：\`DEFAULT CURRENT_TIMESTAMP\` 自动记录创建时间。
- **外键约束**：保证 order_items 的 order_id 和 product_id 必须存在。
- **库存字段**：\`stock INT NOT NULL DEFAULT 0\`，不能为负。

## 三、库存扣减的并发问题

多个用户同时购买同一商品时，\`stock = stock - 1\` 可能出错：

\`\`\`text
时间线  线程A               线程B
  T1    读取 stock=1
  T2                        读取 stock=1
  T3    stock-1=0 写入
  T4                        stock-1=0 写入 ← 超卖！
\`\`\`

### 解决方案：UPDATE 带条件 + 事务

\`\`\`python
cur.execute("START TRANSACTION")
# 用 WHERE stock >= ? 保证不超卖
cur.execute(
    "UPDATE products SET stock = stock - %s WHERE id = %s AND stock >= %s",
    (qty, product_id, qty)
)
if cur.rowcount == 0:
    conn.rollback()
    raise Exception("库存不足")
conn.commit()
\`\`\`

> \`UPDATE ... WHERE stock >= ?\` 是**原子操作**，数据库会用行锁保证安全。

## 四、连接池模式

生产环境中，每次请求都新建连接开销很大。使用连接池复用连接：

\`\`\`python
from dbutils.pooled_db import PooledDB

pool = PooledDB(pymysql, maxconnections=10, ...)

def get_conn():
    return pool.connection()  # 借出
def return_conn(conn):
    conn.close()  # 归还（非真正关闭）
\`\`\`

## 五、订单系统类设计

\`\`\`text
class OrderSystem:
    ├── create_user(name, phone)     → 注册用户
    ├── add_product(name, price, stock) → 上架商品
    ├── create_order(user_id, items)    → 下单（含扣库存）
    └── get_order(order_id)             → 查询订单详情
\`\`\`

\`create_order\` 是核心方法，在**一个事务**中完成：
1. 检查用户是否存在
2. 遍历商品，检查并扣减库存
3. 计算总金额
4. 创建订单记录
5. 创建订单明细记录

任何一步失败，整个事务回滚。

## 六、本章代码说明

代码实现 \`OrderSystem\` 类，完整演示电商核心流程。MySQL 不可用时降级到 sqlite3。`,
    code: `# ============================================================
# 第四章代码演示：MySQL 实战——电商订单系统
# ------------------------------------------------------------
# OrderSystem 类：用户/商品/订单的完整流程。
# 核心演示事务中的库存扣减，防止超卖。
# MySQL 不可用时降级到 sqlite3。
# ============================================================
import pymysql
import sqlite3

print("=" * 60)
print("MySQL 实战：电商订单系统")
print("=" * 60)

def try_mysql():
    try:
        conn = pymysql.connect(
            host="127.0.0.1", port=3306, user="root",
            password="123456", connect_timeout=2, charset="utf8mb4",
        )
        return conn
    except Exception:
        return None

mysql_conn = try_mysql()

class OrderSystem:
    """电商订单系统，支持 MySQL 和 sqlite3"""

    def __init__(self, conn, is_mysql):
        self.conn = conn
        self.is_mysql = is_mysql
        self.placeholder = "%s" if is_mysql else "?"
        self._init_schema()

    def _ph(self, n):
        """生成 n 个占位符"""
        p = self.placeholder
        return ", ".join([p] * n)

    def _init_schema(self):
        """建表"""
        cur = self.conn.cursor()
        # MySQL: ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        # sqlite3: 不支持 ENGINE/CHARSET
        engine = "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4" if self.is_mysql else ""
        cur.execute(f"""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY {'AUTO_INCREMENT' if self.is_mysql else 'AUTOINCREMENT'},
                name VARCHAR(50) NOT NULL,
                phone VARCHAR(20)
            ) {engine}
        """)
        cur.execute(f"""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY {'AUTO_INCREMENT' if self.is_mysql else 'AUTOINCREMENT'},
                name VARCHAR(100) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                stock INT NOT NULL DEFAULT 0
            ) {engine}
        """)
        cur.execute(f"""
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY {'AUTO_INCREMENT' if self.is_mysql else 'AUTOINCREMENT'},
                user_id INT NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending'
            ) {engine}
        """)
        cur.execute(f"""
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY {'AUTO_INCREMENT' if self.is_mysql else 'AUTOINCREMENT'},
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL
            ) {engine}
        """)
        self.conn.commit()
        cur.close()

    def create_user(self, name, phone):
        """注册用户"""
        cur = self.conn.cursor()
        cur.execute(f"INSERT INTO users (name, phone) VALUES ({self._ph(2)})",
                    (name, phone))
        self.conn.commit()
        uid = cur.lastrowid
        cur.close()
        return uid

    def add_product(self, name, price, stock):
        """上架商品"""
        cur = self.conn.cursor()
        cur.execute(f"INSERT INTO products (name, price, stock) VALUES ({self._ph(3)})",
                    (name, price, stock))
        self.conn.commit()
        pid = cur.lastrowid
        cur.close()
        return pid

    def create_order(self, user_id, items):
        """下单：在事务中扣减库存，防止超卖"""
        cur = self.conn.cursor()
        try:
            if self.is_mysql:
                cur.execute("START TRANSACTION")
            else:
                self.conn.isolation_level = None
                cur.execute("BEGIN")
            total = 0
            # 遍历商品，检查库存并扣减
            for pid, qty in items:
                cur.execute(f"SELECT price, stock FROM products WHERE id = {self.placeholder}",
                            (pid,))
                row = cur.fetchone()
                if not row:
                    raise ValueError(f"商品 {pid} 不存在")
                price, stock = row[0], row[1]
                if stock < qty:
                    raise ValueError(f"商品 {pid} 库存不足: 需要 {qty}, 剩余 {stock}")
                # 原子扣减库存（WHERE stock >= ? 防止超卖）
                cur.execute(
                    f"UPDATE products SET stock = stock - {self.placeholder} "
                    f"WHERE id = {self.placeholder} AND stock >= {self.placeholder}",
                    (qty, pid, qty)
                )
                if cur.rowcount == 0:
                    raise ValueError(f"商品 {pid} 扣减库存失败")
                total += float(price) * qty
            # 创建订单
            cur.execute(f"INSERT INTO orders (user_id, total_amount) VALUES ({self._ph(2)})",
                        (user_id, total))
            order_id = cur.lastrowid
            # 创建订单明细
            for pid, qty in items:
                cur.execute(f"SELECT price FROM products WHERE id = {self.placeholder}", (pid,))
                price = cur.fetchone()[0]
                cur.execute(
                    f"INSERT INTO order_items (order_id, product_id, quantity, unit_price) "
                    f"VALUES ({self._ph(4)})",
                    (order_id, pid, qty, price)
                )
            self.conn.commit()
            tag = "MySQL" if self.is_mysql else "sqlite3"
            print(f"[{tag}] 订单创建成功: order_id={order_id}, 总金额={total:.2f}")
            return order_id
        except Exception as e:
            self.conn.rollback()
            tag = "MySQL" if self.is_mysql else "sqlite3"
            print(f"[{tag}] 订单创建失败（已回滚）: {e}")
            return None
        finally:
            cur.close()
            if not self.is_mysql:
                self.conn.isolation_level = ""

    def get_order(self, order_id):
        """查询订单详情（JOIN 查询）"""
        cur = self.conn.cursor()
        cur.execute(f"""
            SELECT o.id, u.name, o.total_amount, o.status,
                   p.name, oi.quantity, oi.unit_price
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE o.id = {self.placeholder}
        """, (order_id,))
        rows = cur.fetchall()
        cur.close()
        if not rows:
            print("  订单不存在")
            return
        print(f"  订单号: {rows[0][0]}")
        print(f"  用户: {rows[0][1]}")
        print(f"  总金额: {rows[0][2]}")
        print(f"  状态: {rows[0][3]}")
        print("  商品明细:")
        for r in rows:
            print(f"    {r[4]} x{r[5]} = {float(r[6]) * r[5]:.2f}")


if mysql_conn:
    # ===== MySQL 模式 =====
    print("[MySQL] 使用真实 MySQL 数据库")
    cur = mysql_conn.cursor()
    cur.execute("CREATE DATABASE IF NOT EXISTS pydb_demo CHARSET utf8mb4")
    cur.execute("USE pydb_demo")
    cur.close()
    sys = OrderSystem(mysql_conn, is_mysql=True)
else:
    # ===== sqlite3 降级模式 =====
    print("[sqlite3] MySQL 不可用，使用 sqlite3 演示")
    conn = sqlite3.connect(":memory:")
    sys = OrderSystem(conn, is_mysql=False)

# ---- 运行电商演示 ----
print("\\n--- 电商订单系统演示 ---")
# 注册用户
uid = sys.create_user("张三", "13800000001")
print(f"注册用户: id={uid}, name=张三")
# 上架商品
pid1 = sys.add_product("Python 编程", 59.00, 10)
pid2 = sys.add_product("数据库入门", 89.50, 5)
print(f"上架商品: Python 编程(id={pid1}, 库存10), 数据库入门(id={pid2}, 库存5)")
# 下单（正常）
print("\\n下单 1: Python 编程 x2 + 数据库入门 x1")
oid = sys.create_order(uid, [(pid1, 2), (pid2, 1)])
# 查询订单
if oid:
    print("\\n查询订单详情:")
    sys.get_order(oid)
# 尝试超卖（库存不足）
print("\\n下单 2: 数据库入门 x10（库存不足，应失败）")
sys.create_order(uid, [(pid2, 10)])
# 清理
if mysql_conn:
    mysql_conn.close()
    conn2 = try_mysql()
    if conn2:
        conn2.cursor().execute("DROP DATABASE IF EXISTS pydb_demo")
        conn2.close()
        print("\\n[MySQL] 已清理临时数据库")

print("\\n" + "=" * 60)
print("要点：事务 + WHERE stock >= ? 保证不超卖")
print("=" * 60)
`,
  },

  {
    id: "py-pg-intro",
    group: "PostgreSQL",
    icon: "🐘",
    title: "PostgreSQL 入门",
    content: `## 一、PostgreSQL 是什么

**PostgreSQL**（简称 PG）是功能最强大的开源关系型数据库，号称"开源界的 Oracle"。它诞生于 1986 年加州大学伯克利分校，比 MySQL 历史更长。

与 MySQL 相比，PostgreSQL 更**注重标准合规性和功能丰富度**：

| 对比维度 | MySQL | PostgreSQL |
|----------|-------|------------|
| 设计哲学 | 简单、快速 | 严谨、功能全 |
| SQL 标准 | 部分扩展 | 高度合规 |
| 数据类型 | 基础 + JSON | JSONB/数组/UUID/INET/几何 |
| 复杂查询 | 一般 | 更强优化器 |
| 事务隔离 | REPEATABLE READ 默认 | READ COMMITTED 默认 |
| 全文搜索 | 基础 | 内置 tsvector/tsquery |
| GIS | 需插件 | PostGIS 原生支持 |
| 许可证 | GPL | PostgreSQL License（更宽松）|

## 二、安装 PostgreSQL（Docker 推荐）

\`\`\`bash
docker run -d --name pg \\
  -e POSTGRES_PASSWORD=123456 \\
  -p 5432:5432 \\
  postgres:16
\`\`\`

连接方式：

\`\`\`bash
psql -h 127.0.0.1 -U postgres -d postgres
# 密码: 123456
\`\`\`

非 Docker 方式：

- macOS：\`brew install postgresql@16\`
- Ubuntu：\`sudo apt install postgresql\`

## 三、PostgreSQL 的丰富数据类型

PostgreSQL 最强大的特性之一是**丰富的内置数据类型**：

### 3.1 JSONB —— 二进制 JSON

\`\`\`sql
CREATE TABLE configs (id INT, data JSONB);
INSERT INTO configs VALUES (1, '{"name":"张三","tags":["a","b"],"age":28}');

-- 用 -> 取 JSON 对象（返回 JSONB）
SELECT data->'name' FROM configs;        -- "张三"（带引号）
-- 用 ->> 取 JSON 值（返回文本）
SELECT data->>'name' FROM configs;       -- 张三（不带引号）
-- 用 @> 包含查询
SELECT * FROM configs WHERE data @> '{"age":28}';
\`\`\`

> JSONB 支持**索引**（GIN 索引），查询极快。MySQL 的 JSON 类型功能较弱。

### 3.2 数组类型

\`\`\`sql
CREATE TABLE posts (id INT, tags TEXT[]);
INSERT INTO posts VALUES (1, ARRAY['python', 'db']);

-- 查询包含某元素的记录
SELECT * FROM posts WHERE 'python' = ANY(tags);
-- 数组包含
SELECT * FROM posts WHERE tags @> ARRAY['python'];
\`\`\`

### 3.3 其他特色类型

| 类型 | 说明 | 示例 |
|------|------|------|
| \`UUID\` | 通用唯一标识 | \`gen_random_uuid()\` |
| \`INET\` | IP 地址 | \`192.168.1.1\` |
| \`CIDR\` | 网络段 | \`192.168.0.0/24\` |
| \`POINT\` | 几何点 | \`(1.5, 2.5)\` |
| \`INTERVAL\` | 时间间隔 | \`'1 day'::interval\` |
| \`BYTEA\` | 二进制数据 | 存储 图片/文件 |
| \`HSTORE\` | 键值对 | 扩展模块 |
| \`tsvector\` | 全文搜索向量 | 用于 MATCH 搜索 |

## 四、Schema（模式）

PostgreSQL 的 \`Schema\` 是数据库内的命名空间，类似"目录"：

\`\`\`text
数据库 (database)
  ├── schema: public（默认）
  │     ├── users 表
  │     └── orders 表
  ├── schema: admin
  │     └── logs 表
  └── schema: report
        └── stats 表
\`\`\`

- 不同 schema 下可以有同名表，互不冲突。
- \`public\` 是默认 schema。
- 常用于**多租户**场景：每个租户一个 schema。

\`\`\`sql
CREATE SCHEMA tenant_a;
CREATE TABLE tenant_a.users (id INT, name TEXT);
\`\`\`

## 五、表空间（Tablespace）

表空间定义数据**物理存储位置**，可将热数据放 SSD、冷数据放 HDD：

\`\`\`sql
CREATE TABLESPACE fast_space LOCATION '/data/ssd';
CREATE TABLE big_table (...) TABLESPACE fast_space;
\`\`\`

## 六、本章代码说明

代码尝试用 \`psycopg2\` 连接 PostgreSQL。若连接失败，降级到 sqlite3 并用 JSON 函数模拟 JSONB 概念。`,
    code: `# ============================================================
# 第五章代码演示：PostgreSQL 入门
# ------------------------------------------------------------
# 尝试用 psycopg2 连接 PostgreSQL，失败则降级到 sqlite3。
# 演示 JSONB 概念、丰富数据类型说明。
# ============================================================
import psycopg2
import psycopg2.extras
import sqlite3
import json

print("=" * 60)
print("PostgreSQL 入门演示")
print("=" * 60)

def try_pg():
    """尝试连接 PostgreSQL"""
    try:
        conn = psycopg2.connect(
            host="127.0.0.1", port=5432,
            user="postgres", password="123456",
            dbname="postgres", connect_timeout=2,
        )
        return conn
    except Exception as e:
        print(f"PostgreSQL 连接失败: {type(e).__name__}")
        print("降级到 sqlite3 演示相同概念\\n")
        return None

pg_conn = try_pg()

if pg_conn:
    # ===== PostgreSQL 模式 =====
    print("[PostgreSQL] 连接成功！版本:", pg_conn.server_version)
    cur = pg_conn.cursor()
    # 创建临时表演示 JSONB
    cur.execute("DROP TABLE IF EXISTS configs")
    cur.execute("CREATE TABLE configs (id INT, data JSONB)")
    # 插入 JSONB 数据
    cur.execute("INSERT INTO configs VALUES (%s, %s)",
                (1, json.dumps({"name": "张三", "age": 28, "tags": ["python", "db"]})))
    cur.execute("INSERT INTO configs VALUES (%s, %s)",
                (2, json.dumps({"name": "李四", "age": 35, "tags": ["java"]})))
    pg_conn.commit()
    print("[PostgreSQL] 已插入 2 条 JSONB 数据")
    # JSONB 查询：-> 取对象, ->> 取文本
    cur.execute("SELECT data->>'name', data->'age' FROM configs ORDER BY id")
    print("[PostgreSQL] JSONB 查询（->> 取文本, -> 取 JSONB）:")
    for row in cur.fetchall():
        print(f"  name={row[0]}, age(JSONB)={row[1]}")
    # JSONB 包含查询：@>
    cur.execute("SELECT data->>'name' FROM configs WHERE data @> %s",
               (json.dumps({"age": 28}),))
    print("[PostgreSQL] @> 包含查询 age=28:")
    for row in cur.fetchall():
        print(f"  {row[0]}")
    # 数组类型演示
    cur.execute("DROP TABLE IF EXISTS posts")
    cur.execute("CREATE TABLE posts (id INT, tags TEXT[])")
    cur.execute("INSERT INTO posts VALUES (%s, %s)", (1, ["python", "db"]))
    cur.execute("SELECT * FROM posts WHERE %s = ANY(tags)", ("python",))
    print("[PostgreSQL] 数组查询（ANY）:", cur.fetchall())
    cur.close()
    pg_conn.close()
else:
    # ===== sqlite3 降级 + JSON 模拟 JSONB =====
    print("[sqlite3] 用 JSON 函数模拟 PostgreSQL JSONB 概念")
    conn = sqlite3.connect(":memory:")
    cur = conn.cursor()
    # sqlite3 支持 JSON1 扩展（Python 3.9+ 内置）
    cur.execute("CREATE TABLE configs (id INT, data TEXT)")  # TEXT 存 JSON
    cur.execute("INSERT INTO configs VALUES (?, ?)",
                (1, json.dumps({"name": "张三", "age": 28, "tags": ["python", "db"]})))
    cur.execute("INSERT INTO configs VALUES (?, ?)",
                (2, json.dumps({"name": "李四", "age": 35, "tags": ["java"]})))
    conn.commit()
    print("[sqlite3] 已插入 2 条 JSON 数据")
    # json_extract 模拟 ->> （取文本）
    # PostgreSQL: data->>'name'  sqlite3: json_extract(data, '$.name')
    cur.execute("SELECT json_extract(data, '$.name'), json_extract(data, '$.age') FROM configs ORDER BY id")
    print("[sqlite3] json_extract 查询（模拟 PG 的 ->>）:")
    for row in cur.fetchall():
        print(f"  name={row[0]}, age={row[1]}")
    # JSON 包含查询模拟 @>
    # PostgreSQL: WHERE data @> '{"age":28}'
    # sqlite3: 用 json_extract 等价模拟
    cur.execute("SELECT json_extract(data, '$.name') FROM configs WHERE json_extract(data, '$.age') = 28")
    print("[sqlite3] 模拟 @> 包含查询 age=28:")
    for row in cur.fetchall():
        print(f"  {row[0]}")
    # 数组概念说明
    print("\\n[说明] PostgreSQL 原生支持数组类型 TEXT[]:")
    print("  PG:   SELECT * FROM posts WHERE 'python' = ANY(tags)")
    print("  sqlite3 不支持数组类型，通常用 JSON 存储或关联表")
    cur.close()
    conn.close()

print("\\n" + "=" * 60)
print("要点：JSONB、数组、UUID 是 PostgreSQL 的特色类型")
print("=" * 60)
`,
  },

  {
    id: "py-pg-connect",
    group: "PostgreSQL",
    icon: "🔗",
    title: "psycopg2 连接与操作",
    content: `## 一、psycopg2 版本对比

| 包名 | 说明 | 安装 |
|------|------|------|
| **psycopg2-binary** | 预编译二进制包 | \`pip install psycopg2-binary\` |
| psycopg2 | 需编译安装（需 pg_config） | \`pip install psycopg2\` |
| **psycopg3** | 新一代（psycopg） | \`pip install psycopg\` |

> \`psycopg2-binary\` 最方便，无需系统依赖。生产环境建议用源码编译的 \`psycopg2\`。psycopg3 是未来趋势，API 与 psycopg2 基本兼容。

## 二、连接字符串格式

### 2.1 DSN 字符串

\`\`\`python
# 关键字=值 格式
conn = psycopg2.connect(
    "host=127.0.0.1 port=5432 dbname=mydb user=postgres password=123456"
)

# URI 格式
conn = psycopg2.connect(
    "postgresql://postgres:123456@127.0.0.1:5432/mydb"
)
\`\`\`

### 2.2 关键字参数

\`\`\`python
conn = psycopg2.connect(
    host="127.0.0.1",
    port=5432,
    dbname="mydb",
    user="postgres",
    password="123456",
    connect_timeout=5,
)
\`\`\`

两种方式等价，DSN 字符串更适合配置文件。

## 三、占位符：%s 与 %(name)s

psycopg2 支持两种占位符：

### 3.1 位置占位符 %s

\`\`\`python
cur.execute("SELECT * FROM users WHERE age > %s AND name LIKE %s", (18, "张%"))
\`\`\`

### 3.2 命名占位符 %(name)s

\`\`\`python
cur.execute(
    "SELECT * FROM users WHERE age > %(min_age)s AND name LIKE %(pattern)s",
    {"min_age": 18, "pattern": "张%"}
)
\`\`\`

> 命名占位符更适合复杂查询，参数顺序不易出错。

### 3.3 注意：psycopg2 自动处理类型

\`\`\`python
# 不需要手动加引号，psycopg2 自动处理
cur.execute("INSERT INTO logs (msg) VALUES (%s)", ("hello world",))
# 自动变成: INSERT INTO logs (msg) VALUES ('hello world')
\`\`\`

## 四、RealDictCursor

类似 MySQL 的 DictCursor，按列名返回字典：

\`\`\`python
from psycopg2.extras import RealDictCursor

cur = conn.cursor(cursor_factory=RealDictCursor)
cur.execute("SELECT * FROM users")
row = cur.fetchone()
print(row["name"])  # 按列名访问
\`\`\`

## 五、服务端游标（Named Cursor）

处理**百万级**结果集时，\`fetchall()\` 会把所有数据加载到内存。用命名游标分批读取：

\`\`\`python
cur = conn.cursor("my_cursor")  # 给游标起名 → 服务端游标
cur.execute("SELECT * FROM big_table")
while True:
    rows = cur.fetchmany(1000)  # 每次取 1000 行
    if not rows:
        break
    for row in rows:
        process(row)
\`\`\`

> 服务端游标在数据库端维护结果集，Python 端只取需要的行，内存占用极低。

## 六、COPY 命令（批量导入/导出）

\`\COPY\` 是 PostgreSQL 的高速批量导入导出工具，比 INSERT 快 10 倍以上：

\`\`\`python
# 导出：表 → CSV 文件
with open("users.csv", "w") as f:
    cur.copy_expert("COPY users TO STDOUT WITH CSV HEADER", f)

# 导入：CSV → 表
with open("data.csv", "r") as f:
    cur.copy_expert("COPY users FROM STDIN WITH CSV HEADER", f)
\`\`\`

## 七、autocommit 模式

psycopg2 默认开启事务（autocommit=False）：

\`\`\`python
conn.autocommit = False  # 默认：需手动 commit()
conn.autocommit = True   # 每条 SQL 自动提交

# DDL（CREATE/DROP）在 autocommit=False 时也会自动提交
\`\`\`

> 执行 DDL（建表/删表）或维护命令（VACUUM）时，需设 \`autocommit=True\`。

## 八、本章代码说明

代码尝试连接 PostgreSQL，失败则降级到 sqlite3。演示命名占位符、RealDictCursor、COPY 概念。`,
    code: `# ============================================================
# 第六章代码演示：psycopg2 连接与操作
# ------------------------------------------------------------
# 演示 DSN 连接、%(name)s 命名占位符、RealDictCursor、COPY 概念。
# PostgreSQL 不可用时降级到 sqlite3。
# ============================================================
import psycopg2
import psycopg2.extras
import sqlite3
import json

print("=" * 60)
print("psycopg2 连接与操作演示")
print("=" * 60)

def try_pg():
    """尝试连接 PostgreSQL"""
    try:
        conn = psycopg2.connect(
            host="127.0.0.1", port=5432,
            user="postgres", password="123456",
            dbname="postgres", connect_timeout=2,
        )
        return conn
    except Exception:
        print("PostgreSQL 连接失败，降级到 sqlite3 演示\\n")
        return None

pg_conn = try_pg()

if pg_conn:
    # ===== PostgreSQL 模式 =====
    print("[PostgreSQL] 连接成功")
    cur = pg_conn.cursor()
    # 建表
    cur.execute("DROP TABLE IF EXISTS users")
    cur.execute("CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT, age INT)")
    # 位置占位符 %s
    cur.execute("INSERT INTO users (name, age) VALUES (%s, %s)", ("张三", 28))
    # 命名占位符 %(name)s
    cur.execute(
        "INSERT INTO users (name, age) VALUES (%(name)s, %(age)s)",
        {"name": "李四", "age": 35}
    )
    pg_conn.commit()
    print("[PostgreSQL] 用 %s 和 %(name)s 两种占位符各插入一条")
    # RealDictCursor：按列名访问
    cur.close()
    cur = pg_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM users ORDER BY age")
    print("[PostgreSQL] RealDictCursor 查询结果:")
    for row in cur.fetchall():
        print(f"  {dict(row)}")
    # 服务端游标概念演示
    cur.close()
    named_cur = pg_conn.cursor("batch_cursor")
    named_cur.execute("SELECT * FROM users")
    batch = named_cur.fetchmany(10)
    print(f"[PostgreSQL] 命名游标 fetchmany(10): {len(batch)} 行")
    named_cur.close()
    # COPY 概念说明
    print("\\n[PostgreSQL] COPY 命令说明:")
    print("  导出: cur.copy_expert('COPY users TO STDOUT WITH CSV', open('out.csv','w'))")
    print("  导入: cur.copy_expert('COPY users FROM STDIN WITH CSV', open('in.csv','r'))")
    cur.close()
    pg_conn.close()
else:
    # ===== sqlite3 降级模式 =====
    print("[sqlite3] 演示相同概念")
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, age INT)")
    # sqlite3 用 ? 占位符（对应 PG 的 %s）
    cur.execute("INSERT INTO users (name, age) VALUES (?, ?)", ("张三", 28))
    # sqlite3 用 :name 命名占位符（对应 PG 的 %(name)s）
    cur.execute(
        "INSERT INTO users (name, age) VALUES (:name, :age)",
        {"name": "李四", "age": 35}
    )
    conn.commit()
    print("[sqlite3] 用 ? 和 :name 两种占位符各插入一条")
    print("  （对应 PostgreSQL 的 %s 和 %(name)s）")
    # sqlite3.Row 模拟 RealDictCursor
    cur.execute("SELECT * FROM users ORDER BY age")
    print("[sqlite3] Row factory 查询结果（模拟 RealDictCursor）:")
    for row in cur.fetchall():
        print(f"  id={row['id']}, name={row['name']}, age={row['age']}")
    # 服务端游标概念
    print("\\n[说明] PostgreSQL 命名游标（服务端游标）:")
    print("  cur = conn.cursor('batch_cursor')  # 命名")
    print("  cur.execute('SELECT * FROM big_table')")
    print("  rows = cur.fetchmany(1000)  # 分批读取，省内存")
    print("  sqlite3 无此功能，但可用 LIMIT/OFFSET 模拟分页")
    # 分页模拟
    cur.execute("SELECT * FROM users LIMIT 1 OFFSET 0")
    print(f"  sqlite3 分页模拟 LIMIT 1 OFFSET 0: {dict(cur.fetchone())}")
    # COPY 概念说明
    print("\\n[说明] PostgreSQL COPY 命令:")
    print("  导出: cur.copy_expert('COPY users TO STDOUT WITH CSV', file)")
    print("  导入: cur.copy_expert('COPY users FROM STDIN WITH CSV', file)")
    print("  sqlite3 可用 .iterdump() 模拟导出:")
    dump_lines = list(conn.iterdump())
    print(f"  conn.iterdump() 生成 {len(dump_lines)} 行 SQL")
    cur.close()
    conn.close()

print("\\n" + "=" * 60)
print("要点：%s / %(name)s 占位符，RealDictCursor，COPY 批量")
print("=" * 60)
`,
  },

  {
    id: "py-pg-features",
    group: "PostgreSQL",
    icon: "✨",
    title: "PostgreSQL 高级特性",
    content: `## 一、JSONB 操作符大全

PostgreSQL 的 JSONB 是最强 JSON 存储方案，支持丰富的操作符：

| 操作符 | 说明 | 示例 |
|--------|------|------|
| \`->\` | 取键/索引，返回 JSONB | \`data->'name'\` → \`\\"张三\\"\` |
| \`->>\` | 取键/索引，返回文本 | \`data->>'name'\` → \`张三\` |
| \`#>\` | 路径取值，返回 JSONB | \`data#>'{addr,city}'\` |
| \`#>>\` | 路径取值，返回文本 | \`data#>>'{addr,city}'\` |
| \`@>\` | 包含查询 | \`data @> '{"age":28}'\` |
| \`<@\` | 被包含 | \`'{"a":1}' <@ data\` |
| \`?\` | 键存在 | \`data ? 'name'\` |
| \`?|\` | 任一键存在 | \`data ?| array['a','b']\` |
| \`?&\` | 所有键存在 | \`data ?& array['a','b']\` |
| \`||\` | 合并 JSONB | \`'{"a":1}' || '{"b":2}'\` |

### jsonb_set 修改 JSONB

\`\`\`sql
-- 修改嵌套字段
UPDATE configs SET data = jsonb_set(data, '{age}', '29');
-- 不存在时才设置
SELECT jsonb_set('{"a":1}', '{b}', '2', true);
-- 结果: {"a":1,"b":2}
\`\`\`

## 二、数组类型与操作

\`\`\`sql
CREATE TABLE posts (id INT, tags TEXT[]);

-- 插入数组
INSERT INTO posts VALUES (1, ARRAY['python', 'db', 'sql']);

-- 数组操作符
SELECT tags[1] FROM posts;             -- 取第 1 个元素（下标从 1 开始）
SELECT * FROM posts WHERE 'python' = ANY(tags);    -- 包含元素
SELECT * FROM posts WHERE tags @> ARRAY['python']; -- 包含子数组
SELECT array_length(tags, 1) FROM posts;           -- 数组长度
SELECT unnest(tags) FROM posts WHERE id = 1;       -- 展开为多行
\`\`\`

## 三、RETURNING 子句

\`INSERT/UPDATE/DELETE\` 后直接返回受影响的数据，**无需二次查询**：

\`\`\`sql
-- 插入并返回自增 ID
INSERT INTO users (name) VALUES ('王五') RETURNING id, name;

-- 更新并返回新值
UPDATE users SET age = 30 WHERE id = 1 RETURNING *;

-- 删除并返回被删的记录
DELETE FROM users WHERE id = 2 RETURNING name;
\`\`\`

> MySQL 8.0 才支持 RETURNING，而 PostgreSQL 早就支持了。

## 四、UPSERT（ON CONFLICT）

冲突时更新或跳过，比 MySQL 的 ON DUPLICATE KEY 更灵活：

\`\`\`sql
-- 冲突时更新
INSERT INTO counters (id, count) VALUES (1, 1)
ON CONFLICT (id) DO UPDATE SET count = counters.count + 1;

-- 冲突时什么都不做
INSERT INTO users (email, name) VALUES ('a@b.com', '张三')
ON CONFLICT (email) DO NOTHING;

-- 用 EXCLUDED 引用待插入的值
INSERT INTO products (id, stock) VALUES (1, 10)
ON CONFLICT (id) DO UPDATE SET stock = products.stock + EXCLUDED.stock;
\`\`\`

## 五、CTE（公共表表达式）

PostgreSQL 的 CTE（WITH 子句）功能强大：

\`\`\`sql
-- 普通 CTE
WITH active_users AS (
    SELECT * FROM users WHERE status = 'active'
),
order_stats AS (
    SELECT user_id, COUNT(*) AS order_count
    FROM orders GROUP BY user_id
)
SELECT au.name, COALESCE(os.order_count, 0) AS cnt
FROM active_users au
LEFT JOIN order_stats os ON au.id = os.user_id;

-- 递归 CTE：查询树形结构
WITH RECURSIVE tree AS (
    SELECT id, parent_id, name, 1 AS level FROM categories WHERE parent_id IS NULL
    UNION ALL
    SELECT c.id, c.parent_id, c.name, t.level + 1
    FROM categories c JOIN tree t ON c.parent_id = t.id
)
SELECT * FROM tree ORDER BY level;
\`\`\`

## 六、窗口函数

\`\`\`sql
-- 排名：相同值同排名，跳号
SELECT name, salary, RANK() OVER (ORDER BY salary DESC) AS rank
FROM employees;

-- 分组排名：每个部门内排名
SELECT name, dept, salary,
       ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS rn
FROM employees;

-- 累计求和
SELECT date, revenue,
       SUM(revenue) OVER (ORDER BY date) AS running_total
FROM daily_sales;
\`\`\`

## 七、全文搜索

\`\`\`sql
-- 创建全文搜索向量
SELECT to_tsvector('chinese', 'PostgreSQL 是强大的数据库');

-- 搜索匹配
SELECT * FROM articles
WHERE to_tsvector('chinese', content) @@ to_tsquery('数据库 & 强大');
\`\`\`

## 八、物化视图

普通视图每次查询都重新计算，物化视图**缓存结果**：

\`\`\`sql
CREATE MATERIALIZED VIEW sales_summary AS
SELECT product_id, SUM(amount) AS total FROM sales GROUP BY product_id;

-- 刷新（手动或定时）
REFRESH MATERIALIZED VIEW sales_summary;

-- 支持索引
CREATE INDEX ON sales_summary (total);
\`\`\`

## 九、本章代码说明

代码演示 JSONB、RETURNING、UPSERT、CTE 等高级特性。PostgreSQL 不可用时降级到 sqlite3（用 JSON 函数模拟）。`,
    code: `# ============================================================
# 第七章代码演示：PostgreSQL 高级特性
# ------------------------------------------------------------
# 演示 JSONB 操作、RETURNING、UPSERT、CTE、数组查询。
# PostgreSQL 不可用时降级到 sqlite3（用 JSON 模拟）。
# ============================================================
import psycopg2
import psycopg2.extras
import sqlite3
import json

print("=" * 60)
print("PostgreSQL 高级特性演示")
print("=" * 60)

def try_pg():
    try:
        conn = psycopg2.connect(
            host="127.0.0.1", port=5432,
            user="postgres", password="123456",
            dbname="postgres", connect_timeout=2,
        )
        return conn
    except Exception:
        print("PostgreSQL 连接失败，降级到 sqlite3 演示\\n")
        return None

pg_conn = try_pg()

if pg_conn:
    # ===== PostgreSQL 模式 =====
    print("[PostgreSQL] 连接成功，演示高级特性")
    cur = pg_conn.cursor()
    # ---- JSONB 操作 ----
    cur.execute("DROP TABLE IF EXISTS configs")
    cur.execute("CREATE TABLE configs (id SERIAL PRIMARY KEY, data JSONB)")
    cur.execute("INSERT INTO configs (data) VALUES (%s) RETURNING id, data",
                (json.dumps({"name": "张三", "age": 28, "addr": {"city": "北京"}}),))
    row = cur.fetchone()
    print(f"[PostgreSQL] RETURNING 插入结果: id={row[0]}, data={row[1]}")
    # JSONB ->> 取文本
    cur.execute("SELECT data->>'name', data->'addr'->>'city' FROM configs")
    r = cur.fetchone()
    print(f"[PostgreSQL] JSONB ->> 取值: name={r[0]}, city={r[1]}")
    # JSONB @> 包含查询
    cur.execute("SELECT data->>'name' FROM configs WHERE data @> %s",
                (json.dumps({"age": 28}),))
    print(f"[PostgreSQL] @> 包含查询 age=28: {cur.fetchone()[0]}")
    # ---- UPSERT ----
    cur.execute("DROP TABLE IF EXISTS counters")
    cur.execute("CREATE TABLE counters (id INT PRIMARY KEY, count INT)")
    cur.execute("INSERT INTO counters VALUES (1, 1)")
    cur.execute("""
        INSERT INTO counters (id, count) VALUES (1, 1)
        ON CONFLICT (id) DO UPDATE SET count = counters.count + 1
        RETURNING id, count
    """)
    r = cur.fetchone()
    print(f"[PostgreSQL] UPSERT ON CONFLICT: id={r[0]}, count={r[1]}")
    # ---- CTE ----
    cur.execute("DROP TABLE IF EXISTS departments")
    cur.execute("DROP TABLE IF EXISTS employees")
    cur.execute("CREATE TABLE departments (id INT PRIMARY KEY, name TEXT)")
    cur.execute("CREATE TABLE employees (id INT PRIMARY KEY, dept_id INT, salary INT)")
    cur.execute("INSERT INTO departments VALUES (1, '工程部'), (2, '销售部')")
    cur.execute("INSERT INTO employees VALUES (1, 1, 20000), (2, 1, 25000), (3, 2, 15000)")
    cur.execute("""
        WITH dept_avg AS (
            SELECT dept_id, AVG(salary) as avg_salary FROM employees GROUP BY dept_id
        )
        SELECT d.name, da.avg_salary FROM dept_avg da
        JOIN departments d ON da.dept_id = d.id
    """)
    print("[PostgreSQL] CTE 部门平均薪资:")
    for r in cur.fetchall():
        print(f"  {r[0]}: {float(r[1]):.0f}")
    # ---- 数组类型 ----
    cur.execute("DROP TABLE IF EXISTS posts")
    cur.execute("CREATE TABLE posts (id INT, tags TEXT[])")
    cur.execute("INSERT INTO posts VALUES (1, %s)", (["python", "db", "sql"],))
    cur.execute("SELECT * FROM posts WHERE %s = ANY(tags)", ("python",))
    print(f"[PostgreSQL] 数组 ANY 查询: {cur.fetchall()}")
    pg_conn.commit()
    cur.close()
    pg_conn.close()
else:
    # ===== sqlite3 降级模式 =====
    print("[sqlite3] 用 JSON 函数模拟 PostgreSQL 高级特性")
    conn = sqlite3.connect(":memory:")
    cur = conn.cursor()
    # ---- JSON 模拟 JSONB ----
    # PostgreSQL: CREATE TABLE configs (id SERIAL, data JSONB)
    # sqlite3:    CREATE TABLE configs (id INTEGER, data TEXT) -- TEXT 存 JSON
    cur.execute("CREATE TABLE configs (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)")
    cur.execute("INSERT INTO configs (data) VALUES (?)",
                (json.dumps({"name": "张三", "age": 28, "addr": {"city": "北京"}}),))
    conn.commit()
    # RETURNING 模拟（sqlite3 3.35+ 支持 RETURNING）
    cur.execute("INSERT INTO configs (data) VALUES (?) RETURNING id, data",
                (json.dumps({"name": "李四", "age": 35}),))
    row = cur.fetchone()
    print(f"[sqlite3] RETURNING 插入结果: id={row[0]}, data={row[1]}")
    print("  （PostgreSQL: INSERT ... RETURNING id, data）")
    # JSON 取值模拟 ->> （json_extract）
    # PostgreSQL: data->>'name'  sqlite3: json_extract(data, '$.name')
    cur.execute("SELECT json_extract(data, '$.name'), json_extract(data, '$.addr.city') FROM configs")
    for r in cur.fetchall():
        print(f"[sqlite3] json_extract 模拟 ->>: name={r[0]}, city={r[1]}")
    # JSON 包含查询模拟 @>
    # PostgreSQL: WHERE data @> '{"age":28}'
    cur.execute("SELECT json_extract(data, '$.name') FROM configs WHERE json_extract(data, '$.age') = 28")
    print(f"[sqlite3] 模拟 @> 包含查询 age=28: {cur.fetchone()[0]}")
    # ---- UPSERT 模拟 ----
    # PostgreSQL: ON CONFLICT (id) DO UPDATE SET count = count + 1
    # sqlite3:    ON CONFLICT(id) DO UPDATE SET count = count + 1
    cur.execute("CREATE TABLE counters (id INT PRIMARY KEY, count INT)")
    cur.execute("INSERT INTO counters VALUES (1, 1)")
    cur.execute("""
        INSERT INTO counters (id, count) VALUES (1, 1)
        ON CONFLICT(id) DO UPDATE SET count = counters.count + 1
    """)
    cur.execute("SELECT count FROM counters WHERE id = 1")
    print(f"[sqlite3] UPSERT ON CONFLICT: count={cur.fetchone()[0]}")
    print("  （PostgreSQL: ON CONFLICT (id) DO UPDATE）")
    # ---- CTE 演示 ----
    # CTE 语法 PostgreSQL 和 sqlite3 完全相同
    cur.execute("CREATE TABLE departments (id INT PRIMARY KEY, name TEXT)")
    cur.execute("CREATE TABLE employees (id INT PRIMARY KEY, dept_id INT, salary INT)")
    cur.execute("INSERT INTO departments VALUES (1, '工程部'), (2, '销售部')")
    cur.execute("INSERT INTO employees VALUES (1, 1, 20000), (2, 1, 25000), (3, 2, 15000)")
    cur.execute("""
        WITH dept_avg AS (
            SELECT dept_id, AVG(salary) as avg_salary FROM employees GROUP BY dept_id
        )
        SELECT d.name, da.avg_salary FROM dept_avg da
        JOIN departments d ON da.dept_id = d.id
    """)
    print("[sqlite3] CTE 部门平均薪资（PG 语法相同）:")
    for r in cur.fetchall():
        print(f"  {r[0]}: {r[1]:.0f}")
    # ---- 数组概念说明 ----
    print("\\n[说明] PostgreSQL 数组类型 TEXT[]:")
    print("  PG: CREATE TABLE posts (id INT, tags TEXT[])")
    print("  PG: SELECT * FROM posts WHERE 'python' = ANY(tags)")
    print("  sqlite3 不支持数组，用 JSON 模拟:")
    cur.execute("CREATE TABLE posts (id INT, tags TEXT)")  # JSON 存数组
    cur.execute("INSERT INTO posts VALUES (1, ?)", (json.dumps(["python", "db", "sql"]),))
    cur.execute("SELECT * FROM posts WHERE EXISTS (SELECT 1 FROM json_each(tags) WHERE value = 'python')")
    print(f"  sqlite3 json_each 模拟 ANY: {cur.fetchall()}")
    # ---- 窗口函数（sqlite3 3.25+ 支持）----
    cur.execute("""
        SELECT id, dept_id, salary,
               ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rn
        FROM employees
    """)
    print("[sqlite3] 窗口函数 ROW_NUMBER（PG 语法相同）:")
    for r in cur.fetchall():
        print(f"  id={r[0]}, 部门={r[1]}, 薪资={r[2]}, 部门内排名={r[3]}")
    cur.close()
    conn.close()

print("\\n" + "=" * 60)
print("要点：JSONB/RETURNING/UPSERT/CTE 是 PG 的杀手锏")
print("=" * 60)
`,
  },
];
