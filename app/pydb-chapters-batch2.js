// =============================================================
// Python 数据库编程教程（pydb）—— 第二批章节
// -------------------------------------------------------------
// MySQL（4 章）+ PostgreSQL（3 章），共 7 章。
// 外部数据库服务器可能未运行，所有代码均做 try/except 降级处理。
// =============================================================

export const chapters = [
  {
    id: "py-mysql-intro",
    group: "MySQL",
    icon: "🐬",
    title: "MySQL 入门",
    content: `## 一、MySQL 是什么

**MySQL** 是世界上最流行的开源关系型数据库之一，由 Oracle 维护。它是 LAMP/LEMP 技术栈的核心组件，被广泛应用于 Web 应用。

## 二、MySQL 的特点

- **开源免费**：社区版完全免费。
- **性能优秀**：读性能出色，适合 Web 场景。
- **生态丰富**：文档、工具、ORM 支持齐全。
- **主从复制**：支持读写分离和高可用。

## 三、Python 连接 MySQL

最常用的驱动是 **PyMySQL**：

\`\`\`bash
pip install pymysql
\`\`\`

\`\`\`python
import pymysql

conn = pymysql.connect(
    host="localhost",
    user="root",
    password="secret",
    database="test",
    port=3306,
    charset="utf8mb4",
)
\`\`\`

## 四、关键参数

| 参数 | 说明 |
|------|------|
| \`host\` | 服务器地址 |
| \`port\` | 端口，默认 3306 |
| \`user\` / \`password\` | 用户名密码 |
| \`database\` | 默认数据库 |
| \`charset\` | 字符集，推荐 utf8mb4 |
| \`cursorclass\` | 游标类型，默认元组，可设 \`DictCursor\` |
| \`autocommit\` | 是否自动提交 |

## 五、本章 demo

下面的代码尝试连接本地 MySQL，如果未启动服务器则打印友好提示并继续演示 SQL 语句构建。`,
    code: `# ============================================================
# 第九章代码演示：MySQL 入门
# ------------------------------------------------------------
# 尝试连接本地 MySQL；无服务器时降级为打印 SQL 示例。
# ============================================================
import sys

print("=" * 60)
print("MySQL 入门演示")
print("=" * 60)

# 尝试导入 PyMySQL
try:
    import pymysql
except ImportError:
    print("\n[提示] 未安装 PyMySQL，请运行: pip install pymysql")
    sys.exit(0)

# 尝试连接本地 MySQL（超时 2 秒）
conn = None
try:
    conn = pymysql.connect(
        host="127.0.0.1",
        port=3306,
        user="root",
        password="",
        database="mysql",
        charset="utf8mb4",
        connect_timeout=2,
    )
    print("\n[1] 成功连接到本地 MySQL 服务器")
    with conn.cursor() as cursor:
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        print(f"[2] MySQL 版本: {version[0]}")
    conn.close()
except Exception as e:
    print(f"\n[1] 无法连接本地 MySQL: {e}")
    print("[提示] 请在本地启动 MySQL 服务器后再运行本示例。")

# 无论是否连接成功，都展示标准建表 SQL
print("\n[3] 典型 MySQL 建表 SQL：")
print("""
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
""")
`,
  },

  {
    id: "py-mysql-connect",
    group: "MySQL",
    icon: "🔌",
    title: "MySQL 连接与游标",
    content: `## 一、创建连接

PyMySQL 的 \`connect()\` 返回 Connection 对象，与 sqlite3 类似但参数更多。

## 二、DictCursor

默认游标返回元组，不便于按列名访问。使用 \`DictCursor\` 可返回字典：

\`\`\`python
from pymysql.cursors import DictCursor

conn = pymysql.connect(..., cursorclass=DictCursor)
with conn.cursor() as cursor:
    cursor.execute("SELECT * FROM users WHERE id = %s", (1,))
    row = cursor.fetchone()
    print(row["name"])
\`\`\`

## 三、上下文管理器

\`\`\`python
with pymysql.connect(...) as conn:
    with conn.cursor() as cursor:
        cursor.execute("INSERT ...")
    conn.commit()
\`\`\`

## 四、连接池

生产环境建议使用连接池，如 \`DBUtils.PooledDB\` 或 SQLAlchemy 的连接池。

## 五、本章 demo

下面的代码演示 PyMySQL 连接、DictCursor、异常处理和关闭。`,
    code: `# ============================================================
# 第十章代码演示：MySQL 连接与游标
# ------------------------------------------------------------
# 演示 PyMySQL 的连接、DictCursor、上下文管理器。
# ============================================================
import sys

try:
    import pymysql
    from pymysql.cursors import DictCursor
except ImportError:
    print("请先安装 PyMySQL: pip install pymysql")
    sys.exit(0)

print("=" * 60)
print("MySQL 连接与游标演示")
print("=" * 60)

# 尝试连接本地 MySQL
try:
    conn = pymysql.connect(
        host="127.0.0.1",
        port=3306,
        user="root",
        password="",
        database="test",
        charset="utf8mb4",
        cursorclass=DictCursor,
        connect_timeout=2,
    )
    print("\n[1] 已连接本地 MySQL（使用 DictCursor）")

    with conn.cursor() as cursor:
        # 确保测试表存在
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS demo_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)
        conn.commit()
        print("[2] 已创建/确认 demo_users 表")

        # 插入数据
        cursor.execute("INSERT INTO demo_users (name) VALUES (%s)", ("Alice",))
        conn.commit()
        print(f"[3] 插入记录，自增 ID: {cursor.lastrowid}")

        # 字典游标查询
        cursor.execute("SELECT * FROM demo_users WHERE name = %s", ("Alice",))
        row = cursor.fetchone()
        print(f"[4] DictCursor 查询结果: {row}")

    conn.close()
    print("[5] 连接已关闭")
except Exception as e:
    print(f"\n[错误] 无法连接 MySQL: {e}")
    print("[提示] 请在本地启动 MySQL 并创建 test 数据库后再运行。")
`,
  },

  {
    id: "py-mysql-crud",
    group: "MySQL",
    icon: "✏️",
    title: "MySQL CRUD 操作",
    content: `## 一、PyMySQL 的占位符

PyMySQL 使用 \`%s\` 作为占位符，无论参数类型是字符串还是数字：

\`\`\`python
cursor.execute("INSERT INTO users (name, age) VALUES (%s, %s)", ("Alice", 28))
\`\`\`

## 二、CRUD 示例

| 操作 | SQL |
|------|-----|
| 增 | \`INSERT INTO users (name) VALUES (%s)\` |
| 查 | \`SELECT * FROM users WHERE age > %s\` |
| 改 | \`UPDATE users SET age = %s WHERE name = %s\` |
| 删 | \`DELETE FROM users WHERE id = %s\` |

## 三、批量操作

\`\`\`python
users = [("Bob", 24), ("Carol", 30)]
cursor.executemany("INSERT INTO users (name, age) VALUES (%s, %s)", users)
\`\`\`

## 四、本章 demo

下面的代码完整演示 MySQL 的 CRUD 操作。`,
    code: `# ============================================================
# 第十一章代码演示：MySQL CRUD 操作
# ------------------------------------------------------------
# 完整演示 MySQL 的增删改查（使用 PyMySQL）。
# ============================================================
import sys

try:
    import pymysql
except ImportError:
    print("请先安装 PyMySQL: pip install pymysql")
    sys.exit(0)

print("=" * 60)
print("MySQL CRUD 操作演示")
print("=" * 60)

def run_mysql_demo():
    conn = pymysql.connect(
        host="127.0.0.1",
        port=3306,
        user="root",
        password="",
        database="test",
        charset="utf8mb4",
        connect_timeout=2,
    )
    cursor = conn.cursor()

    # Create：建表
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2),
        stock INT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)
    print("\n[Create] 已创建 products 表")

    # Create：批量插入
    products = [("iPhone", 5999.00, 10), ("MacBook", 12999.00, 5)]
    cursor.executemany(
        "INSERT INTO products (name, price, stock) VALUES (%s, %s, %s)",
        products,
    )
    conn.commit()
    print(f"[Create] 批量插入 {cursor.rowcount} 条记录")

    # Read：查询
    cursor.execute("SELECT * FROM products WHERE price > %s", (5000,))
    print("\n[Read] 价格高于 5000 的商品：")
    for row in cursor.fetchall():
        print(f"  {row}")

    # Update：更新
    cursor.execute("UPDATE products SET stock = stock - %s WHERE name = %s", (1, "iPhone"))
    conn.commit()
    print(f"\n[Update] 更新了 {cursor.rowcount} 条记录")

    # Delete：删除
    cursor.execute("DELETE FROM products WHERE stock = %s", (0,))
    conn.commit()
    print(f"[Delete] 删除了 {cursor.rowcount} 条记录")

    cursor.close()
    conn.close()
    print("\n[结束] 连接已关闭")


try:
    run_mysql_demo()
except Exception as e:
    print(f"\n[错误] {e}")
    print("[提示] 请确保本地 MySQL 已启动，且存在 test 数据库。")
`,
  },

  {
    id: "py-mysql-practice",
    group: "MySQL",
    icon: "🏋️",
    title: "MySQL 实战练习",
    content: `## 一、实战目标

通过一个「用户订单系统」练习 MySQL 的多表操作和事务。

## 二、表结构

\`\`\`sql
users(id, name, email)
orders(id, user_id, amount, status)
\`\`\`

## 三、涉及知识点

- 多表 JOIN
- 事务控制
- 聚合查询
- 子查询

## 四、本章 demo

下面的代码创建用户和订单表，插入示例数据，执行 JOIN 查询和事务下单。`,
    code: `# ============================================================
# 第十二章代码演示：MySQL 实战练习（用户订单系统）
# ------------------------------------------------------------
# 演示 MySQL 的多表 JOIN、事务、聚合查询。
# ============================================================
import sys

try:
    import pymysql
except ImportError:
    print("请先安装 PyMySQL: pip install pymysql")
    sys.exit(0)

print("=" * 60)
print("MySQL 实战：用户订单系统")
print("=" * 60)

def run_practice():
    conn = pymysql.connect(
        host="127.0.0.1",
        port=3306,
        user="root",
        password="",
        database="test",
        charset="utf8mb4",
        connect_timeout=2,
    )
    cursor = conn.cursor()

    # 建表
    cursor.executescript = None  # pymysql 不支持 executescript，逐条执行
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)
    print("\n[1] 已创建 users / orders 表")

    # 清空旧数据（避免重复运行冲突）
    cursor.execute("DELETE FROM orders")
    cursor.execute("DELETE FROM users")
    conn.commit()

    # 插入用户
    cursor.executemany(
        "INSERT INTO users (name, email) VALUES (%s, %s)",
        [("Alice", "alice@example.com"), ("Bob", "bob@example.com")],
    )
    conn.commit()
    print("[2] 已插入 2 个用户")

    # 获取用户 ID 并插入订单
    cursor.execute("SELECT id FROM users WHERE name = %s", ("Alice",))
    alice_id = cursor.fetchone()[0]
    cursor.executemany(
        "INSERT INTO orders (user_id, amount, status) VALUES (%s, %s, %s)",
        [
            (alice_id, 199.00, "paid"),
            (alice_id, 299.00, "pending"),
        ],
    )
    conn.commit()
    print("[3] 已为 Alice 插入 2 笔订单")

    # JOIN 查询：用户及其订单总金额
    cursor.execute("""
    SELECT u.name, COUNT(o.id) AS order_count, SUM(o.amount) AS total_amount
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    GROUP BY u.id
    """)
    print("\n[4] 用户订单统计：")
    for row in cursor.fetchall():
        print(f"  {row}")

    # 事务：更新订单状态
    try:
        conn.begin()
        cursor.execute("UPDATE orders SET status = %s WHERE status = %s", ("paid", "pending"))
        conn.commit()
        print(f"\n[5] 事务提交：更新了 {cursor.rowcount} 笔订单状态为 paid")
    except Exception as e:
        conn.rollback()
        print(f"\n[5] 事务回滚: {e}")

    cursor.close()
    conn.close()
    print("\n[6] 连接已关闭")


try:
    run_practice()
except Exception as e:
    print(f"\n[错误] {e}")
    print("[提示] 请确保本地 MySQL 已启动，且存在 test 数据库。")
`,
  },

  {
    id: "py-pg-intro",
    group: "PostgreSQL",
    icon: "🐘",
    title: "PostgreSQL 入门",
    content: `## 一、PostgreSQL 是什么

**PostgreSQL** 是一个功能强大的开源对象关系型数据库系统。它以其稳定性、扩展性和对 SQL 标准的严格遵循而闻名。

## 二、PostgreSQL 的特点

- **高度兼容 SQL 标准**：支持窗口函数、CTE、复杂查询。
- **丰富的数据类型**：JSON/JSONB、数组、范围类型、地理信息（PostGIS）。
- **MVCC 并发控制**：读写不互相阻塞。
- **强大的扩展性**：可自定义数据类型、函数、索引。

## 三、Python 连接 PostgreSQL

最常用的驱动是 **psycopg2**：

\`\`\`bash
pip install psycopg2-binary
\`\`\`

\`\`\`python
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    dbname="test",
    user="postgres",
    password="secret",
    port=5432,
)
\`\`\`

## 四、本章 demo

下面的代码尝试连接本地 PostgreSQL，无服务器时降级演示。`,
    code: `# ============================================================
# 第十三章代码演示：PostgreSQL 入门
# ------------------------------------------------------------
# 尝试连接本地 PostgreSQL；无服务器时降级为打印提示。
# ============================================================
import sys

print("=" * 60)
print("PostgreSQL 入门演示")
print("=" * 60)

try:
    import psycopg2
except ImportError:
    print("\n[提示] 未安装 psycopg2，请运行: pip install psycopg2-binary")
    sys.exit(0)

try:
    conn = psycopg2.connect(
        host="127.0.0.1",
        port=5432,
        dbname="postgres",
        user="postgres",
        password="",
        connect_timeout=2,
    )
    cursor = conn.cursor()
    cursor.execute("SELECT version()")
    version = cursor.fetchone()
    print(f"\n[1] 成功连接 PostgreSQL: {version[0]}")
    cursor.close()
    conn.close()
except Exception as e:
    print(f"\n[1] 无法连接本地 PostgreSQL: {e}")
    print("[提示] 请在本地启动 PostgreSQL 后再运行本示例。")

print("\n[2] 典型 PostgreSQL 建表 SQL：")
print("""
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
""")
`,
  },

  {
    id: "py-pg-connect",
    group: "PostgreSQL",
    icon: "🔌",
    title: "PostgreSQL 连接与游标",
    content: `## 一、psycopg2 连接参数

| 参数 | 说明 |
|------|------|
| \`host\` | 服务器地址 |
| \`port\` | 端口，默认 5432 |
| \`dbname\` | 数据库名 |
| \`user\` / \`password\` | 用户名密码 |
| \`sslmode\` | SSL 模式 |

## 二、RealDictCursor

使用 \`RealDictCursor\` 可以让查询结果返回字典：

\`\`\`python
from psycopg2.extras import RealDictCursor

conn = psycopg2.connect(..., cursor_factory=RealDictCursor)
\`\`\`

## 三、上下文管理器

psycopg2 的 Connection 和 Cursor 同样支持 \`with\` 语句，\`with conn:\` 会在退出时自动提交或回滚。

## 四、本章 demo

下面的代码演示 psycopg2 连接、RealDictCursor 和事务。`,
    code: `# ============================================================
# 第十四章代码演示：PostgreSQL 连接与游标
# ------------------------------------------------------------
# 演示 psycopg2 的连接、RealDictCursor、上下文管理器。
# ============================================================
import sys

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    print("请先安装 psycopg2: pip install psycopg2-binary")
    sys.exit(0)

print("=" * 60)
print("PostgreSQL 连接与游标演示")
print("=" * 60)

try:
    conn = psycopg2.connect(
        host="127.0.0.1",
        port=5432,
        dbname="test",
        user="postgres",
        password="",
        connect_timeout=2,
        cursor_factory=RealDictCursor,
    )
    print("\n[1] 已连接本地 PostgreSQL（使用 RealDictCursor）")

    with conn.cursor() as cursor:
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS demo_users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL
        )
        """)
        conn.commit()
        print("[2] 已创建/确认 demo_users 表")

        cursor.execute("INSERT INTO demo_users (name) VALUES (%s)", ("Alice",))
        conn.commit()
        print(f"[3] 插入记录，自增 ID: {cursor.fetchone()['id'] if cursor.rowcount else 'N/A'}")

        cursor.execute("SELECT * FROM demo_users WHERE name = %s", ("Alice",))
        row = cursor.fetchone()
        print(f"[4] RealDictCursor 查询结果: {dict(row) if row else '无'}")

    conn.close()
    print("[5] 连接已关闭")
except Exception as e:
    print(f"\n[错误] 无法连接 PostgreSQL: {e}")
    print("[提示] 请在本地启动 PostgreSQL 并创建 test 数据库后再运行。")
`,
  },

  {
    id: "py-pg-features",
    group: "PostgreSQL",
    icon: "✨",
    title: "PostgreSQL 特色功能",
    content: `## 一、JSON/JSONB 支持

PostgreSQL 原生支持 JSON 和 JSONB 类型。JSONB 是二进制存储，支持索引和更高效查询。

\`\`\`sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    data JSONB
);

INSERT INTO events (data) VALUES ('{"user": "alice", "action": "login"}');
SELECT data->>'user' FROM events WHERE data->>'action' = 'login';
\`\`\`

## 二、数组类型

\`\`\`sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    tags TEXT[]
);
INSERT INTO posts (tags) VALUES (ARRAY['python', 'database']);
\`\`\`

## 三、窗口函数

\`\`\`sql
SELECT name, salary,
       RANK() OVER (ORDER BY salary DESC) AS rank
FROM employees;
\`\`\`

## 四、CTE（公共表表达式）

\`\`\`sql
WITH high_earners AS (
    SELECT * FROM employees WHERE salary > 10000
)
SELECT * FROM high_earners;
\`\`\`

## 五、本章 demo

下面的代码演示 JSONB、数组和窗口函数的用法（在有 PostgreSQL 连接时）。`,
    code: `# ============================================================
# 第十五章代码演示：PostgreSQL 特色功能
# ------------------------------------------------------------
# 演示 JSONB、数组、窗口函数（连接失败时降级为 SQL 展示）。
# ============================================================
import sys

try:
    import psycopg2
except ImportError:
    print("请先安装 psycopg2: pip install psycopg2-binary")
    sys.exit(0)

print("=" * 60)
print("PostgreSQL 特色功能演示")
print("=" * 60)


def run_features_demo():
    conn = psycopg2.connect(
        host="127.0.0.1",
        port=5432,
        dbname="test",
        user="postgres",
        password="",
        connect_timeout=2,
    )
    cursor = conn.cursor()

    # JSONB 演示
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        data JSONB
    )
    """)
    cursor.execute("DELETE FROM events")
    cursor.execute(
        "INSERT INTO events (data) VALUES (%s)",
        ('{"user": "alice", "action": "login"}',),
    )
    cursor.execute("SELECT data->>'user' AS user_name FROM events")
    print("\n[1] JSONB 查询结果：")
    for row in cursor.fetchall():
        print(f"  {row}")

    # 数组演示
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        tags TEXT[]
    )
    """)
    cursor.execute("DELETE FROM posts")
    cursor.execute("INSERT INTO posts (tags) VALUES (%s)", (['python', 'database'],))
    cursor.execute("SELECT * FROM posts WHERE 'python' = ANY(tags)")
    print("\n[2] 数组查询结果：")
    for row in cursor.fetchall():
        print(f"  {row}")

    # 窗口函数演示
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        salary NUMERIC
    )
    """)
    cursor.execute("DELETE FROM employees")
    cursor.executemany(
        "INSERT INTO employees (name, salary) VALUES (%s, %s)",
        [("Alice", 12000), ("Bob", 9000), ("Carol", 15000)],
    )
    cursor.execute("""
    SELECT name, salary,
           RANK() OVER (ORDER BY salary DESC) AS rank
    FROM employees
    """)
    print("\n[3] 窗口函数 RANK() 结果：")
    for row in cursor.fetchall():
        print(f"  {row}")

    conn.commit()
    cursor.close()
    conn.close()
    print("\n[4] 连接已关闭")


try:
    run_features_demo()
except Exception as e:
    print(f"\n[错误] {e}")
    print("[提示] 请确保本地 PostgreSQL 已启动，且存在 test 数据库。")
    print("\n以下为本章涉及的 SQL 示例：")
    print("""
-- JSONB
SELECT data->>'user' FROM events WHERE data->>'action' = 'login';

-- 数组
SELECT * FROM posts WHERE 'python' = ANY(tags);

-- 窗口函数
SELECT name, salary, RANK() OVER (ORDER BY salary DESC) FROM employees;
    """)
`,
  },
];
