// =============================================================
// Python 数据库编程教程（pydb）—— 第一批章节
// -------------------------------------------------------------
// 本教程系统讲解 Python 数据库编程，从基础概念到 SQLite 实战。
// 共 8 章，分两组：
//   数据库基础组（3 章）：
//     1. py-db-intro          — 数据库编程入门
//     2. py-db-api            — Python DB-API 2.0 规范
//     3. py-db-compare        — 数据库选型对比
//   SQLite 组（5 章）：
//     4. py-sqlite-intro      — SQLite 入门
//     5. py-sqlite-connect    — 连接与建表
//     6. py-sqlite-crud       — 增删改查
//     7. py-sqlite-transaction— 事务与高级查询
//     8. py-sqlite-practice   — 实战练习
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名（数据库基础 / SQLite）
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（含表格、代码块、列表）
//   code    : 可运行、带详细中文注释的 Python 示例代码
//
// 代码运行环境约束：
//   - 用 python3 直接运行，10 秒超时
//   - 仅使用 Python 标准库（sqlite3），不依赖第三方数据库驱动
//   - 通过 print 输出结果
//   - 代码必须是单文件可独立运行的脚本
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：数据库编程入门
  // =========================================================
  {
    id: "py-db-intro",
    group: "数据库基础",
    icon: "🗄️",
    title: "数据库编程入门",
    content: `## 一、为什么需要数据库

程序运行时，数据如果只放在内存里，进程一退出就全丢了。把数据写到普通文件里虽然能持久化，但当数据量变大、查询变复杂、多个用户同时操作时，普通文件会力不从心。**数据库**正是为解决这些问题而生的。

### 文件存储的痛点

假设你用 CSV 文件存用户数据，会遇到这些麻烦：

1. **查询低效**：想找"年龄大于 30 的所有用户"，得把整个文件读进内存逐行过滤，数据量一大就慢得无法接受。
2. **并发冲突**：两个进程同时写同一个文件，后写的会覆盖先写的，数据就损坏了。自己加锁又容易死锁。
3. **数据完整性**：没有任何机制阻止你写入非法数据（比如年龄写成负数、邮箱重复），脏数据越积越多。
4. **恢复困难**：写到一半程序崩溃了，文件可能只写了一半，处于不一致状态，很难恢复。
5. **无法表达关系**：用户、订单、商品之间的关联关系，用扁平文件几乎无法表达。

### 数据库的五大核心价值

数据库用一个引擎集中解决上述所有问题：

| 价值 | 说明 | 对应特性 |
|------|------|----------|
| **持久化** | 数据写入磁盘，程序重启后仍然存在 | 文件存储 |
| **高效查询** | 索引、查询优化让海量数据检索毫秒级返回 | B+树索引 |
| **并发安全** | 事务、锁机制保证多用户同时操作不冲突 | MVCC / 锁 |
| **完整性约束** | 主键、外键、唯一、CHECK 约束保证数据质量 | 约束 |
| **故障恢复** | 日志（WAL/redo log）保证崩溃后能恢复到一致状态 | 事务日志 |

其中最关键的是 **ACID** 特性，它是数据库区别于普通文件的根本：

- **A（Atomicity 原子性）**：一个事务里的操作要么全做，要么全不做。转账时扣款和加款必须同时成功或同时失败。
- **C（Consistency 一致性）**：事务前后数据库始终处于一致状态，不会出现钱凭空消失。
- **I（Isolation 隔离性）**：并发事务互不干扰，一个事务中间状态对其他事务不可见。
- **D（Durability 持久性）**：事务提交后数据永久保存，即使断电也不会丢失。

## 二、SQL vs NoSQL

数据库世界分两大阵营：**关系型数据库（SQL）**和**非关系型数据库（NoSQL）**。

### 关系型数据库（SQL）

用**表（table）**组织数据，表有行和列，表之间用外键关联。用 SQL（结构化查询语言）操作。

\`\`\`text
users 表            orders 表
+----+------+      +----+---------+-------+
| id | name |      | id | user_id | amount|
+----+------+      +----+---------+-------+
| 1  | 张三 |      | 1  |    1    | 100.0 |
| 2  | 李四 |      | 2  |    1    | 50.0  |
+----+------+      | 3  |    2    | 200.0 |
                   +----+---------+-------+
\`\`\`

特点：**强一致性、复杂查询能力、事务支持、结构化 schema**。

代表：SQLite、MySQL、PostgreSQL、Oracle、SQL Server。

### 非关系型数据库（NoSQL）

不用表和 SQL，数据模型更灵活，常见四类：

| 类型 | 数据模型 | 代表 | 适用场景 |
|------|----------|------|----------|
| **键值型** | key-value | Redis、Memcached | 缓存、会话、排行榜 |
| **文档型** | JSON 文档 | MongoDB、CouchDB | 内容管理、灵活 schema |
| **列族型** | 列族 | Cassandra、HBase | 大数据、高吞吐写入 |
| **图型** | 节点和边 | Neo4j、ArangoDB | 社交网络、推荐系统 |

特点：**灵活 schema、易扩展、高性能、最终一致性**。

### 该选哪个？

| 需求 | 推荐 |
|------|------|
| 强事务、复杂查询、数据关系复杂 | 关系型（SQL） |
| 数据结构多变、快速迭代 | 文档型（MongoDB） |
| 极高读写速度、可接受数据丢失 | 键值型（Redis） |
| 海量数据写入、水平扩展 | 列族型（Cassandra） |

实际上很多系统是**混合使用**：用 MySQL 存核心业务数据，Redis 做缓存，Elasticsearch 做搜索，各取所长。

## 三、Python 数据库编程的通用流程

无论用哪种数据库，Python 编程的流程都大同小异，遵循 **DB-API** 规范：

\`\`\`text
1. 建立连接（Connection）—— 连到数据库
2. 创建游标（Cursor）—— 创建执行上下文
3. 执行 SQL（execute）—— 跑 SQL 语句
4. 获取结果（fetch）—— 读取查询结果
5. 提交事务（commit）或回滚（rollback）—— 确认或撤销修改
6. 关闭游标和连接（close）—— 释放资源
\`\`\`

用代码表示：

\`\`\`python
import sqlite3

conn = sqlite3.connect("example.db")   # 1. 建立连接
cursor = conn.cursor()                  # 2. 创建游标
cursor.execute("CREATE TABLE t (id, name)")  # 3. 执行 SQL
cursor.execute("INSERT INTO t VALUES (?, ?)", (1, "张三"))
conn.commit()                           # 5. 提交事务
cursor.close()                          # 6. 关闭游标
conn.close()                            # 6. 关闭连接
\`\`\`

这个流程对 MySQL、PostgreSQL 同样适用，只是 \`connect()\` 换成对应驱动的连接函数。

## 四、Python 常用数据库驱动一览

| 数据库 | 驱动 | 安装方式 | 占位符 |
|--------|------|----------|--------|
| SQLite | \`sqlite3\` | 标准库自带 | \`?\` |
| MySQL | \`pymysql\` | pip install pymysql | \`%s\` |
| PostgreSQL | \`psycopg2\` | pip install psycopg2 | \`%s\` |
| Redis | \`redis\` | pip install redis | - |
| MongoDB | \`pymongo\` | pip install pymongo | - |

注意占位符的差异：SQLite 用 \`?\`，MySQL/PostgreSQL 用 \`%s\`。**永远用参数化查询，不要拼接 SQL 字符串**，否则会有 SQL 注入风险。

## 五、本章代码说明

下面的代码只用 \`sqlite3\` 标准库（无需安装任何第三方库），在内存数据库中演示完整的增删改查流程：建表、插入、查询、更新、删除，最后统计数据库信息。`,
    code: `# -*- coding: utf-8 -*-
# 第一章演示代码：数据库编程入门
# 用 sqlite3 标准库演示数据库编程的通用流程：建表/插入/查询/更新/删除/统计
import sqlite3

print("=" * 60)
print("数据库编程入门演示")
print("=" * 60)

# 1. 建立连接：使用内存数据库（不需要服务器，进程结束即销毁）
conn = sqlite3.connect(":memory:")
print("\\n[1] 已建立数据库连接（sqlite3 :memory: 内存数据库）")

# 2. 创建游标：用于执行 SQL
cursor = conn.cursor()
print("[2] 已创建游标 cursor")

# 3. 执行 DDL：创建 users 表
cursor.execute("""
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    email TEXT UNIQUE
)
""")
print("[3] 已执行 CREATE TABLE 创建 users 表")

# 4. 执行 DML：插入数据（参数化查询，防止 SQL 注入）
users = [
    ("张三", 25, "zhangsan@example.com"),
    ("李四", 30, "lisi@example.com"),
    ("王五", 28, "wangwu@example.com"),
    ("赵六", 35, "zhaoliu@example.com"),
]
cursor.executemany(
    "INSERT INTO users (name, age, email) VALUES (?, ?, ?)",
    users,
)
conn.commit()
print(f"[4] 已用 executemany 插入 {len(users)} 条用户记录并提交事务")

# 5. 查询数据：SELECT
print("\\n[5] 查询所有用户：")
cursor.execute("SELECT id, name, age, email FROM users ORDER BY age")
for row in cursor.fetchall():
    print(f"    id={row[0]}, 姓名={row[1]}, 年龄={row[2]}, 邮箱={row[3]}")

# 6. 更新数据：UPDATE
cursor.execute("UPDATE users SET age = ? WHERE name = ?", (26, "张三"))
conn.commit()
print(f"\\n[6] 更新 {cursor.rowcount} 条记录：张三的年龄改为 26")

# 验证更新
cursor.execute("SELECT name, age FROM users WHERE name = ?", ("张三",))
row = cursor.fetchone()
print(f"    更新后：{row[0]} 的年龄是 {row[1]}")

# 7. 删除数据：DELETE
cursor.execute("DELETE FROM users WHERE name = ?", ("李四",))
conn.commit()
print(f"\\n[7] 删除 {cursor.rowcount} 条记录：李四")

# 8. 统计信息
print("\\n[8] 数据库统计信息：")
cursor.execute("SELECT COUNT(*) FROM users")
print(f"    当前用户总数：{cursor.fetchone()[0]}")
cursor.execute("SELECT AVG(age) FROM users")
avg_age = cursor.fetchone()[0]
print(f"    平均年龄：{avg_age:.1f}")
cursor.execute("SELECT MAX(age), MIN(age) FROM users")
row = cursor.fetchone()
print(f"    最大年龄：{row[0]}，最小年龄：{row[1]}")

# 9. 关闭游标和连接
cursor.close()
conn.close()
print("\\n[9] 已关闭游标和连接")

print("\\n" + "=" * 60)
print("核心流程总结：连接 → 游标 → 执行 → 提交 → 查询 → 关闭")
print("=" * 60)
`,
  },

  // =========================================================
  // 第二章：Python DB-API 2.0 规范
  // =========================================================
  {
    id: "py-db-api",
    group: "数据库基础",
    icon: "📋",
    title: "Python DB-API 2.0 规范",
    content: `## 一、什么是 DB-API 2.0

**DB-API 2.0** 是 Python 官方定义的数据库访问接口规范，记录在 **PEP 249** 中。它的核心目标是：**不管底层是 MySQL、PostgreSQL 还是 SQLite，连接、执行、获取结果的代码写法都保持一致**。

这样带来的好处是：

1. **可移植性**：换数据库时，业务代码几乎不用改，只换驱动和连接参数。
2. **学习成本低**：学会一套 API，所有关系型数据库都能用。
3. **生态统一**：第三方工具（如 SQLAlchemy）可以基于这套规范适配所有驱动。

## 二、核心对象

DB-API 2.0 定义了三个核心对象：

### 1. Connection（连接对象）

代表与数据库的一次会话。常用方法：

| 方法 | 说明 |
|------|------|
| \`cursor()\` | 创建一个游标对象 |
| \`commit()\` | 提交当前事务 |
| \`rollback()\` | 回滚当前事务 |
| \`close()\` | 关闭连接 |
| \`execute(sql)\` | 直接执行 SQL（快捷方式，内部创建游标） |

### 2. Cursor（游标对象）

游标是执行 SQL 和获取结果的上下文。一个连接可以创建多个游标。常用方法：

| 方法 | 说明 |
|------|------|
| \`execute(sql, params)\` | 执行一条 SQL |
| \`executemany(sql, seq)\` | 批量执行同一条 SQL |
| \`fetchone()\` | 取下一条结果，没有则返回 \`None\` |
| \`fetchall()\` | 取所有剩余结果，返回列表 |
| \`fetchmany(size)\` | 取最多 size 条结果 |
| \`close()\` | 关闭游标 |

游标的常用属性：

| 属性 | 说明 |
|------|------|
| \`rowcount\` | 最近一次操作影响的行数 |
| \`lastrowid\` | 最近插入行的自增 ID |
| \`description\` | 结果列的描述信息（列名、类型等） |

### 3. Row（行对象）

代表一行查询结果。默认是元组，sqlite3 的 \`Row\` 工厂支持按列名访问。

\`\`\`python
# 默认：元组访问
row = cursor.fetchone()
print(row[0], row[1])     # 按索引

# Row 工厂：按列名访问
conn.row_factory = sqlite3.Row
row = cursor.fetchone()
print(row["name"], row["age"])  # 按列名
\`\`\`

## 三、参数化查询：防止 SQL 注入

**SQL 注入**是网络安全最常见的攻击之一。攻击者通过在输入里嵌入 SQL 片段，篡改查询逻辑。

\`\`\`text
// 危险！字符串拼接
sql = "SELECT * FROM users WHERE name = '" + name + "'"

// 如果 name = "admin' OR '1'='1"
// 拼出来的 SQL 变成：
// SELECT * FROM users WHERE name = 'admin' OR '1'='1'
// 结果：返回所有用户！
\`\`\`

**正确做法**是用参数化查询，把数据和 SQL 分离：

\`\`\`python
# ? 占位符（sqlite3 风格）
cursor.execute("SELECT * FROM users WHERE name = ?", (name,))

# %s 占位符（pymysql/psycopg2 风格）
cursor.execute("SELECT * FROM users WHERE name = %s", (name,))

# %(name)s 命名占位符（psycopg2 风格）
cursor.execute("SELECT * FROM users WHERE name = %(name)s", {"name": name})
\`\`\`

驱动会自动对参数做转义，从根本上杜绝注入。**记住：任何来自用户输入的数据，都必须用参数化查询。**

## 四、事务控制

关系型数据库默认在事务中执行 DML（INSERT/UPDATE/DELETE）。关键规则：

- \`commit()\`：把未提交的修改持久化到磁盘。
- \`rollback()\`：撤销所有未提交的修改。
- **不 commit 的修改在连接关闭后会丢失**（或回滚）。
- DDL（CREATE/DROP/ALTER）通常会自动提交。

\`\`\`python
conn = sqlite3.connect(":memory:")
conn.execute("INSERT INTO t VALUES (1)")
conn.rollback()   # 撤销上面的插入
\`\`\`

## 五、with 语句自动管理事务

Connection 对象支持 \`with\` 语句，它会在代码块正常结束时**自动 commit**，发生异常时**自动 rollback**：

\`\`\`python
with conn:
    conn.execute("INSERT INTO t VALUES (1)")
    conn.execute("INSERT INTO t VALUES (2)")
# 离开 with 块时自动 commit
\`\`\`

如果中间抛异常，整个块的操作全部回滚，保证原子性。

## 六、Row Factory：让结果更好用

sqlite3 默认返回元组，用索引访问可读性差。设置 \`row_factory = sqlite3.Row\` 后，可以按列名访问，代码更清晰：

\`\`\`python
conn.row_factory = sqlite3.Row
row = cursor.execute("SELECT * FROM users").fetchone()
print(row["name"])       # 按列名
print(dict(row))         # 转成字典
print(row.keys())        # 所有列名
\`\`\`

## 七、异常层次

DB-API 定义了异常类层次，方便精确捕获：

\`\`\`text
Warning                          非严重警告
Error                            所有错误的基类
  ├── InterfaceError            数据库连接相关错误
  └── DatabaseError             数据库相关错误
        ├── DataError           数据本身错误（如除零）
        ├── OperationalError    运行时错误（如连接断开）
        ├── IntegrityError      完整性约束违反（如唯一键冲突）
        ├── InternalError       数据库内部错误
        ├── ProgrammingError    SQL 语法错误
        └── NotSupportedError   不支持的特性
\`\`\`

## 八、本章代码说明

下面的代码演示 DB-API 2.0 的全部核心功能：Connection/Cursor 方法、fetchone/fetchall/fetchmany、rowcount/lastrowid/description、Row 工厂、事务回滚、with 语句、以及 SQL 注入防护对比。`,
    code: `# -*- coding: utf-8 -*-
# 第二章演示代码：Python DB-API 2.0 规范
# 演示 Connection/Cursor 方法、各种 fetch、Row 工厂、事务、with 语句、SQL 注入对比
import sqlite3

print("=" * 60)
print("Python DB-API 2.0 规范演示")
print("=" * 60)

conn = sqlite3.connect(":memory:")
cursor = conn.cursor()

# 建表
cursor.execute("""
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL CHECK(price > 0),
    stock INTEGER DEFAULT 0
)
""")

# executemany 批量插入
products = [
    ("苹果", 5.5, 100),
    ("香蕉", 3.0, 200),
    ("橙子", 4.2, 150),
    ("葡萄", 8.0, 80),
]
cursor.executemany("INSERT INTO products (name, price, stock) VALUES (?, ?, ?)", products)
conn.commit()
print(f"\\n[1] 用 executemany 插入 {len(products)} 条商品记录")

# fetchone - 取一条
print("\\n[2] fetchone 演示（取最贵的商品）：")
cursor.execute("SELECT * FROM products ORDER BY price DESC")
row = cursor.fetchone()
print(f"    结果: {row}")
print(f"    lastrowid: {cursor.lastrowid}, rowcount: {cursor.rowcount}")

# fetchmany - 取指定数量
print("\\n[3] fetchmany(2) 演示（取前 2 条）：")
cursor.execute("SELECT * FROM products ORDER BY price")
for r in cursor.fetchmany(2):
    print(f"    {r}")

# fetchall - 取全部
print("\\n[4] fetchall 演示（取全部商品）：")
cursor.execute("SELECT * FROM products ORDER BY price DESC")
for r in cursor.fetchall():
    print(f"    {r}")

# description - 列描述
print("\\n[5] cursor.description（列描述信息）：")
cursor.execute("SELECT id, name, price FROM products LIMIT 1")
for col in cursor.description:
    print(f"    列名={col[0]}, 类型={col[1]}")

# Row Factory - 按列名访问
print("\\n[6] Row Factory 演示（按列名访问）：")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()
cursor.execute("SELECT name, price FROM products WHERE stock > ?", (40,))
for row in cursor.fetchall():
    print(f"    商品={row['name']}, 价格={row['price']}")
print(f"    Row 可转字典: {dict(cursor.execute('SELECT * FROM products').fetchone())}")
print(f"    Row 列名列表: {list(cursor.execute('SELECT * FROM products').fetchone().keys())}")

# 事务回滚演示
print("\\n[7] 事务回滚演示：")
conn.row_factory = None   # 临时切回元组方便计数
cursor = conn.cursor()
cursor.execute("INSERT INTO products (name, price, stock) VALUES (?, ?, ?)", ("临时商品", 1.0, 1))
cursor.execute("SELECT COUNT(*) FROM products")
count_before = cursor.fetchone()[0]
print(f"    插入临时商品后数量: {count_before}")
conn.rollback()   # 回滚，临时商品消失
cursor.execute("SELECT COUNT(*) FROM products")
count_after = cursor.fetchone()[0]
print(f"    回滚后数量: {count_after}（临时商品已撤销）")

# with 语句自动回滚
print("\\n[8] with 语句演示（异常时自动回滚）：")
try:
    with conn:
        conn.execute("INSERT INTO products (name, price, stock) VALUES (?, ?, ?)", ("芒果", 7.0, 30))
        cursor.execute("SELECT COUNT(*) FROM products")
        count_mid = cursor.fetchone()[0]
        print(f"    with 块内插入芒果后数量: {count_mid}")
        # 故意违反 CHECK 约束（price 必须 > 0）
        conn.execute("INSERT INTO products (name, price, stock) VALUES (?, ?, ?)", ("错误商品", -1.0, 10))
except sqlite3.IntegrityError as e:
    print(f"    捕获到约束错误: {e}")
cursor.execute("SELECT COUNT(*) FROM products")
count_end = cursor.fetchone()[0]
print(f"    with 块结束后的数量: {count_end}（芒果也因回滚而未保留）")

# SQL 注入对比
print("\\n[9] SQL 注入防护对比：")
cursor.execute("CREATE TABLE accounts (id INTEGER PRIMARY KEY, name TEXT, password TEXT)")
cursor.executemany("INSERT INTO accounts (name, password) VALUES (?, ?)",
                   [("admin", "admin123"), ("guest", "guest456")])
conn.commit()

# 模拟恶意输入：admin' OR '1'='1
malicious_input = "admin' OR '1'='1"

# 危险写法（拼接字符串，会被注入）
dangerous_sql = f"SELECT * FROM accounts WHERE name = '{malicious_input}'"
cursor.execute(dangerous_sql)
leaked = cursor.fetchall()
print(f"    危险拼接查询结果: {len(leaked)} 条（注入成功，泄露了所有账号！）")

# 安全写法（参数化查询，注入被当作普通字符串）
cursor.execute("SELECT * FROM accounts WHERE name = ?", (malicious_input,))
safe_result = cursor.fetchall()
print(f"    参数化查询结果: {len(safe_result)} 条（注入被当作普通字符串，查不到）")

# 异常层次演示
print("\\n[10] DB-API 异常层次演示：")
try:
    cursor.execute("SELECT * FROM not_exist_table")
except sqlite3.OperationalError as e:
    print(f"    OperationalError（运行时错误）: {e}")
try:
    cursor.execute("INSERT INTO products (name, price) VALUES (?, ?)", ("重复", -1.0))
except sqlite3.IntegrityError as e:
    print(f"    IntegrityError（约束违反）: {e}")
print(f"    OperationalError 是 DatabaseError 子类: {issubclass(sqlite3.OperationalError, sqlite3.DatabaseError)}")

cursor.close()
conn.close()
print("\\n[11] 已关闭连接，DB-API 2.0 演示完成")
`,
  },

  // =========================================================
  // 第三章：数据库选型对比
  // =========================================================
  {
    id: "py-db-compare",
    group: "数据库基础",
    icon: "⚖️",
    title: "数据库选型对比",
    content: `## 一、选型没有银弹

软件工程有句名言："没有银弹"——没有任何一种数据库能完美解决所有问题。不同数据库是为不同场景设计的，选型时要综合考虑多个维度。

### 选型考虑的六大维度

1. **数据模型**：数据是关系型的、文档型的、还是键值对？表结构固定吗？
2. **数据规模**：单机能放下，还是需要分布式？百万级还是 PB 级？
3. **读写特征**：读多写少（如内容站点）还是写多读少（如日志采集）？
4. **一致性要求**：银行系统要强一致性，社交动态可以最终一致性。
5. **运维成本**：是否需要专门 DBA？备份、监控、扩展的成本？
6. **团队熟悉度**：学习成本和招聘成本，团队会用什么？

## 二、五大主流数据库对比

| 维度 | SQLite | MySQL | PostgreSQL | Redis | MongoDB |
|------|--------|-------|------------|-------|---------|
| **类型** | 嵌入式关系型 | 关系型 | 关系型 | 键值内存型 | 文档型 |
| **是否需服务器** | 否 | 是 | 是 | 是 | 是 |
| **存储** | 单文件 | 文件+日志 | 文件+WAL | 内存为主 | BSON 文件 |
| **并发模型** | 数据库级锁 | 行锁 | MVCC | 单线程 | 文档锁 |
| **事务** | ACID | ACID | ACID + MVCC | 有限事务 | 多文档事务 |
| **Schema** | 固定 | 固定 | 固定 | 无 | 灵活 |
| **Python 驱动** | sqlite3 | pymysql | psycopg2 | redis | pymongo |
| **典型场景** | 移动端/测试/桌面 | Web 应用 | 复杂查询/GIS | 缓存/会话 | 内容管理/日志 |

### 各数据库详解

#### 1. SQLite —— 轻量嵌入式

- **特点**：零配置、单文件、无需服务器、Python 标准库内置。
- **优点**：部署简单、体积小、可靠性高。
- **缺点**：不支持高并发写入（写锁是数据库级的）、不支持用户权限管理。
- **适用**：移动 App 本地存储、桌面软件、小型网站、单元测试、配置存储。
- **不适用**：高并发写入、大规模分布式。

#### 2. MySQL —— Web 应用之王

- **特点**：成熟稳定、生态丰富、运维资料多。
- **优点**：性能好、支持主从复制、社区活跃、工具链完善。
- **缺点**：复杂查询能力不如 PostgreSQL、部分 SQL 标准支持不完整。
- **适用**：Web 应用（LAMP 架构核心）、电商、内容管理。
- **不适用**：超复杂分析查询、强 GIS 需求。

#### 3. PostgreSQL —— 功能强大的关系型

- **特点**：严格遵循 SQL 标准、功能最全的开源关系型数据库。
- **优点**：MVCC 并发好、复杂查询强、支持 JSON/数组/GIS/全文检索、扩展性强。
- **缺点**：运维比 MySQL 略复杂、存储略大。
- **适用**：复杂业务系统、地理信息（PostGIS）、数据仓库、金融系统。
- **不适用**：简单缓存场景（杀鸡用牛刀）。

#### 4. Redis —— 极速内存数据库

- **特点**：纯内存存储、单线程模型、读写极快（10 万+ QPS）。
- **优点**：性能极高、数据结构丰富（字符串/列表/集合/有序集合/哈希）、支持持久化。
- **缺点**：内存昂贵、不适合存大量数据、事务能力有限。
- **适用**：缓存、会话存储、排行榜、消息队列、实时计数。
- **不适用**：持久化大量数据、复杂关系查询。

#### 5. MongoDB —— 灵活文档数据库

- **特点**：用 JSON 风格文档存储、schema 灵活、水平扩展容易。
- **优点**：开发快、schema 随时变、适合敏捷迭代、内置分片。
- **缺点**：事务支持较弱（4.0+ 才有多文档事务）、内存占用大。
- **适用**：内容管理、日志分析、用户画像、物联网数据、原型开发。
- **不适用**：强事务、复杂 JOIN 查询。

## 三、选型决策树

\`\`\`text
需要数据库？
  │
  ├─ 数据量小、无需服务器？ ──── 是 ──→ SQLite
  │
  ├─ 主要做缓存、要求极速？ ──── 是 ──→ Redis
  │
  ├─ 数据结构多变、schema 不固定？ ── 是 ──→ MongoDB
  │
  ├─ 需要关系型数据库？
  │     │
  │     ├─ 复杂查询/GIS/金融？ ── 是 ──→ PostgreSQL
  │     │
  │     └─ 通用 Web 应用？ ───── 是 ──→ MySQL
  │
  └─ 大数据高吞吐写入？ ──────── 是 ──→ Cassandra / HBase
\`\`\`

## 四、性能特征对比

| 指标 | SQLite | MySQL | PostgreSQL | Redis | MongoDB |
|------|--------|-------|------------|-------|---------|
| 单机读 QPS | 中 | 高 | 高 | 极高 | 高 |
| 单机写 QPS | 低 | 中 | 中 | 极高 | 中 |
| 事务延迟 | 微秒 | 毫秒 | 毫秒 | 微秒 | 毫秒 |
| 大数据查询 | 慢 | 中 | 强 | 不支持 | 中 |
| 内存占用 | 极低 | 中 | 中 | 高 | 中 |

注意：实际性能受硬件、数据量、索引、查询复杂度影响很大，上表只是量级参考。

## 五、混合架构

实际生产中很少只用一种数据库，常见组合：

- **MySQL + Redis**：MySQL 存核心数据，Redis 做缓存减轻数据库压力。
- **PostgreSQL + Elasticsearch**：PG 存结构化数据，ES 做全文搜索。
- **MySQL + MongoDB**：MySQL 存交易数据，MongoDB 存日志和用户行为。

## 六、本章代码说明

下面的代码先用 sqlite3 演示基本操作，然后尝试连接 MySQL/PostgreSQL/Redis/MongoDB（这些驱动通常未安装，会优雅地捕获 ImportError），接着用 sqlite3 实现一个 FakeRedis 类模拟键值存储，最后做性能基准测试对比逐条插入和批量插入的差异。`,
    code: `# -*- coding: utf-8 -*-
# 第三章演示代码：数据库选型对比
# 1. SQLite 演示  2. 尝试连接其他数据库（优雅失败）  3. FakeRedis  4. 性能基准
import sqlite3
import time

print("=" * 60)
print("数据库选型对比演示")
print("=" * 60)

# ===== 1. SQLite 基本操作 =====
print("\\n[1] SQLite 数据库演示：")
conn = sqlite3.connect(":memory:")
cursor = conn.cursor()
cursor.execute("CREATE TABLE cache (key TEXT PRIMARY KEY, value TEXT)")
cursor.execute("INSERT INTO cache VALUES (?, ?)", ("name", "SQLite"))
cursor.execute("INSERT INTO cache VALUES (?, ?)", ("version", sqlite3.sqlite_version))
conn.commit()
cursor.execute("SELECT value FROM cache WHERE key = ?", ("name",))
print(f"    SQLite 查询: {cursor.fetchone()[0]}")
print(f"    SQLite 版本: {sqlite3.sqlite_version}")
conn.close()

# ===== 2. 尝试连接其他数据库（优雅失败）=====
print("\\n[2] 尝试连接其他数据库（驱动未安装是正常情况）：")

# MySQL (pymysql)
try:
    import pymysql
    pymysql.connect(host="localhost", user="root", password="", connect_timeout=2)
    print("    MySQL (pymysql): 连接成功")
except ImportError:
    print("    MySQL (pymysql): 驱动未安装 —— 这是沙箱中的正常情况")
except Exception as e:
    print(f"    MySQL: 驱动已安装但连接失败 - {type(e).__name__}")

# PostgreSQL (psycopg2)
try:
    import psycopg2
    psycopg2.connect(host="localhost", connect_timeout=2)
    print("    PostgreSQL (psycopg2): 连接成功")
except ImportError:
    print("    PostgreSQL (psycopg2): 驱动未安装 —— 这是沙箱中的正常情况")
except Exception as e:
    print(f"    PostgreSQL: 驱动已安装但连接失败 - {type(e).__name__}")

# Redis
try:
    import redis
    r = redis.Redis(host="localhost", port=6379, socket_timeout=2)
    r.ping()
    print("    Redis (redis-py): 连接成功")
except ImportError:
    print("    Redis (redis-py): 驱动未安装 —— 这是沙箱中的正常情况")
except Exception as e:
    print(f"    Redis: 驱动已安装但连接失败 - {type(e).__name__}")

# MongoDB
try:
    import pymongo
    pymongo.MongoClient(host="localhost", port=27017, serverSelectionTimeoutMS=2000)
    print("    MongoDB (pymongo): 连接成功")
except ImportError:
    print("    MongoDB (pymongo): 驱动未安装 —— 这是沙箱中的正常情况")
except Exception as e:
    print(f"    MongoDB: 驱动已安装但连接失败 - {type(e).__name__}")

# ===== 3. FakeRedis：用 SQLite 模拟 Redis 键值存储 =====
print("\\n[3] FakeRedis：用 SQLite 模拟 Redis 键值存储：")


class FakeRedis:
    """用 sqlite3 模拟 Redis 的基本键值操作。"""

    def __init__(self):
        self.conn = sqlite3.connect(":memory:")
        self.conn.execute("CREATE TABLE kv (key TEXT PRIMARY KEY, value TEXT)")

    def set(self, key, value):
        self.conn.execute("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)", (key, str(value)))
        self.conn.commit()
        return True

    def get(self, key):
        row = self.conn.execute("SELECT value FROM kv WHERE key = ?", (key,)).fetchone()
        return row[0] if row else None

    def delete(self, key):
        self.conn.execute("DELETE FROM kv WHERE key = ?", (key,))
        self.conn.commit()

    def exists(self, key):
        return self.conn.execute("SELECT 1 FROM kv WHERE key = ?", (key,)).fetchone() is not None

    def keys(self, pattern=None):
        if pattern:
            like_pattern = pattern.replace("*", "%")
            rows = self.conn.execute("SELECT key FROM kv WHERE key LIKE ?", (like_pattern,)).fetchall()
        else:
            rows = self.conn.execute("SELECT key FROM kv").fetchall()
        return [r[0] for r in rows]

    def incr(self, key):
        val = self.get(key)
        new_val = int(val) + 1 if val else 1
        self.set(key, new_val)
        return new_val


fr = FakeRedis()
fr.set("counter", 100)
fr.set("name", "张三")
fr.set("user:1", "Alice")
fr.set("user:2", "Bob")
print(f"    get('counter') = {fr.get('counter')}")
print(f"    get('name') = {fr.get('name')}")
print(f"    exists('name') = {fr.exists('name')}")
print(f"    exists('missing') = {fr.exists('missing')}")
print(f"    incr('counter') = {fr.incr('counter')}  （自增后）")
print(f"    keys('user:*') = {fr.keys('user:*')}")
fr.delete("name")
print(f"    delete('name') 后 get('name') = {fr.get('name')}")

# ===== 4. 性能基准测试 =====
print("\\n[4] 性能基准测试（逐条插入 vs 批量插入）：")


def benchmark(title, func, n=2000):
    """运行基准测试并打印耗时。"""
    start = time.time()
    func(n)
    elapsed = time.time() - start
    print(f"    {title}: {n} 条记录耗时 {elapsed:.4f} 秒")


# 方式1：逐条插入并逐条 commit（最慢）
def insert_one_by_one_commit(n):
    c = sqlite3.connect(":memory:")
    c.execute("CREATE TABLE t (id INTEGER, val TEXT)")
    for i in range(n):
        c.execute("INSERT INTO t VALUES (?, ?)", (i, f"val{i}"))
        c.commit()   # 每条都提交，磁盘 I/O 开销巨大
    c.close()


# 方式2：逐条插入，最后一次 commit
def insert_one_by_one_batch_commit(n):
    c = sqlite3.connect(":memory:")
    c.execute("CREATE TABLE t (id INTEGER, val TEXT)")
    for i in range(n):
        c.execute("INSERT INTO t VALUES (?, ?)", (i, f"val{i}"))
    c.commit()   # 只提交一次
    c.close()


# 方式3：executemany 批量插入（最快）
def insert_executemany(n):
    c = sqlite3.connect(":memory:")
    c.execute("CREATE TABLE t (id INTEGER, val TEXT)")
    c.executemany("INSERT INTO t VALUES (?, ?)", [(i, f"val{i}") for i in range(n)])
    c.commit()
    c.close()


benchmark("逐条插入+逐条commit", insert_one_by_one_commit, 2000)
benchmark("逐条插入+一次commit ", insert_one_by_one_batch_commit, 2000)
benchmark("executemany 批量插入", insert_executemany, 2000)
print("    → 结论：批量提交远快于逐条提交，executemany 最快")

print("\\n" + "=" * 60)
print("选型口诀：")
print("  单机/测试/嵌入式  → SQLite")
print("  通用 Web 应用     → MySQL")
print("  复杂查询/地理信息 → PostgreSQL")
print("  缓存/会话/实时    → Redis")
print("  灵活文档/快速迭代 → MongoDB")
print("=" * 60)
`,
  },

  // =========================================================
  // 第四章：SQLite 入门
  // =========================================================
  {
    id: "py-sqlite-intro",
    group: "SQLite",
    icon: "📦",
    title: "SQLite 入门",
    content: `## 一、SQLite 是什么

**SQLite** 是一个**嵌入式**的关系型数据库引擎。它不需要独立的服务器进程，整个数据库就是一个文件，程序通过函数库直接读写。它的核心特点：

- **零配置**：不需要安装、不需要启动服务、不需要配置用户权限。
- **单文件存储**：整个数据库就是一个 \`.db\` 文件，拷贝即备份。
- **标准库内置**：Python 自带 \`sqlite3\` 模块，开箱即用。
- **跨平台**：数据库文件在不同操作系统间可直接复制使用。
- **体积小**：核心库几百 KB，是世界上部署最广的数据库。
- **支持 ACID 事务**：原子性、一致性、隔离性、持久性都有保障。
- **支持大部分 SQL 标准**：视图、触发器、外键、子查询、CTE 等。

\`\`\`text
传统数据库：         SQLite：
应用程序              应用程序
   ↓                     ↓
驱动/网络             sqlite3 库（直接函数调用）
   ↓                     ↓
数据库服务器          .db 文件
   ↓
数据文件
\`\`\`

SQLite 省去了"客户端-服务器"这一层，直接在进程内读写文件，所以又快又简单。

## 二、SQLite 的适用场景

SQLite 适合"嵌入式"场景：

| 场景 | 例子 |
|------|------|
| **移动应用** | iOS/Android 本地数据存储 |
| **桌面软件** | 浏览器历史记录、邮件客户端 |
| **小型网站** | 日访问量几千的小站 |
| **嵌入式设备** | 路由器、IoT 设备 |
| **数据交换格式** | 用 .db 文件代替复杂 XML |
| **单元测试** | 用内存数据库做测试，无需外部依赖 |
| **原型开发** | 快速验证想法，后期再换 MySQL |

**不适合**的场景：高并发写入（写锁是数据库级的）、客户端/服务器架构、海量数据分布式存储。

## 三、三种连接方式

sqlite3 提供三种连接方式：

### 1. 内存数据库 \`:memory:\`

\`\`\`python
conn = sqlite3.connect(":memory:")
\`\`\`

数据只存在内存中，连接关闭即消失。适合测试和演示。

### 2. 文件数据库

\`\`\`python
conn = sqlite3.connect("mydata.db")
\`\`\`

数据保存在 \`mydata.db\` 文件中，持久化。文件不存在会自动创建。

### 3. 临时数据库

\`\`\`python
conn = sqlite3.connect("")   # 空字符串
\`\`\`

创建一个临时文件数据库，连接关闭后自动删除。

## 四、数据类型与类型亲和性

SQLite 与传统数据库不同，它使用**动态类型系统**。虽然建表时声明列类型，但实际存储由"类型亲和性"决定。

### 五种基本存储类型

| 存储类型 | Python 类型 | 说明 |
|----------|-------------|------|
| \`INTEGER\` | \`int\` | 整数 |
| \`REAL\` | \`float\` | 浮点数 |
| \`TEXT\` | \`str\` | 文本字符串 |
| \`BLOB\` | \`bytes\` | 二进制数据 |
| \`NULL\` | \`None\` | 空值 |

### 类型亲和性（Type Affinity）

SQLite 的列有"亲和性"概念：建表时声明的类型会被映射到亲和性类别。亲和性决定了 SQLite 如何处理插入的数据：

| 声明类型包含 | 亲和性 | 行为 |
|--------------|--------|------|
| INT | INTEGER | 整数字符串会转成整数 |
| CHAR/CLOB/TEXT | TEXT | 数字会转成文本存储 |
| REAL/FLOA/DOUB | REAL | 保持浮点 |
| BLOB | BLOB | 不做任何转换 |
| 其他/无 | NUMERIC | 视情况而定 |

例如：往声明为 \`INTEGER\` 的列插字符串 \`'123'\`，SQLite 会自动转成整数 \`123\` 存储。

## 五、PRAGMA 设置

PRAGMA 是 SQLite 特有的配置命令，用于调整数据库行为：

| PRAGMA | 说明 |
|--------|------|
| \`PRAGMA journal_mode\` | 日志模式（DELETE/TRUNCATE/WAL/MEMORY） |
| \`PRAGMA foreign_keys\` | 是否开启外键约束（默认关闭！） |
| \`PRAGMA table_info(表名)\` | 查看表结构 |
| \`PRAGMA compile_options\` | 编译选项 |
| \`PRAGMA cache_size\` | 内存缓存大小 |

### WAL 模式

WAL（Write-Ahead Logging）是 SQLite 的高性能日志模式：

- 写操作先写到 WAL 文件，不直接改主数据库文件。
- 读操作可以和写操作并发（读不阻塞写，写不阻塞读）。
- 适合"读多写少"场景。

\`\`\`python
conn.execute("PRAGMA journal_mode = WAL")
\`\`\`

注意：内存数据库不支持 WAL，只有文件数据库才能用。

## 六、isolation_level 隔离级别

Python sqlite3 的 \`isolation_level\` 参数控制事务行为：

| 值 | 行为 |
|----|------|
| \`""\`（默认） | 自动开始事务，DML 需手动 commit |
| \`None\` | 自动提交模式，每条 SQL 立即生效 |

\`\`\`python
conn = sqlite3.connect(":memory:", isolation_level=None)  # 自动提交
\`\`\`

## 七、本章代码说明

下面演示：三种连接方式、数据类型映射（用 typeof() 查看）、类型亲和性、PRAGMA 设置、table_info 查看表结构、isolation_level。`,
    code: `# -*- coding: utf-8 -*-
# 第四章演示代码：SQLite 入门
# 演示三种连接方式、数据类型映射、类型亲和性、PRAGMA、table_info、isolation_level
import sqlite3
import os

print("=" * 60)
print("SQLite 入门演示")
print("=" * 60)

# ===== 1. 三种连接方式 =====
print("\\n[1] 三种连接方式：")

# 方式1：内存数据库
conn1 = sqlite3.connect(":memory:")
print(f"    内存数据库: {conn1}")

# 方式2：文件数据库
file_path = "/tmp/pydb_sqlite_intro_demo.db"
if os.path.exists(file_path):
    os.remove(file_path)
conn2 = sqlite3.connect(file_path)
print(f"    文件数据库: {file_path}（文件大小 {os.path.getsize(file_path)} 字节）")
conn2.close()

# 方式3：临时数据库（空字符串）
conn3 = sqlite3.connect("")
print(f"    临时数据库已创建（关闭后自动删除）")
conn3.close()

# ===== 2. 数据类型映射 =====
print("\\n[2] 数据类型映射（Python 类型 → SQLite 存储类型）：")
conn = sqlite3.connect(":memory:")
cursor = conn.cursor()
cursor.execute("CREATE TABLE type_demo (val)")

# 插入不同类型的数据
test_values = [
    (42,),               # int -> INTEGER
    (3.14,),             # float -> REAL
    ("文本",),            # str -> TEXT
    (bytes([0, 1, 2]),), # bytes -> BLOB
    (None,),             # None -> NULL
]
for val in test_values:
    cursor.execute("INSERT INTO type_demo VALUES (?)", val)

# 用 typeof() 查看实际存储类型
print(f"    {'Python 值':<20}{'Python 类型':<15}{'SQLite typeof'}")
print(f"    {'-' * 55}")
cursor.execute("SELECT val, typeof(val) FROM type_demo")
for row in cursor.fetchall():
    py_val = row[0]
    py_type = type(py_val).__name__ if py_val is not None else "None"
    sqlite_type = row[1]
    print(f"    {repr(py_val):<20}{py_type:<15}{sqlite_type}")

print(f"    → sqlite3 版本: {sqlite3.sqlite_version}")

# ===== 3. 类型亲和性 =====
print("\\n[3] 类型亲和性演示：")
cursor.execute("""
CREATE TABLE affinity_test (
    a INTEGER,       -- 亲和性 INTEGER
    b TEXT,          -- 亲和性 TEXT
    c REAL,          -- 亲和性 REAL
    d BLOB,          -- 亲和性 BLOB（不做转换）
    e VARCHAR(10)   -- 亲和性 TEXT（声明含 CHAR）
)
""")

# 往 INTEGER 列插字符串 '123'，会被转成整数
cursor.execute("INSERT INTO affinity_test (a) VALUES (?)", ("123",))
row = cursor.execute("SELECT a, typeof(a) FROM affinity_test").fetchone()
print(f"    字符串 '123' 插入 INTEGER 列 → 值={row[0]}, 类型={row[1]}（已转成整数）")

# 往 TEXT 列插数字 456，会被转成文本
cursor.execute("INSERT INTO affinity_test (b) VALUES (?)", (456,))
row = cursor.execute("SELECT b, typeof(b) FROM affinity_test WHERE b IS NOT NULL").fetchone()
print(f"    数字 456 插入 TEXT 列 → 值={row[0]}, 类型={row[1]}（已转成文本）")

# 往 REAL 列插整数 7，会保持浮点
cursor.execute("INSERT INTO affinity_test (c) VALUES (?)", (7,))
row = cursor.execute("SELECT c, typeof(c) FROM affinity_test WHERE c IS NOT NULL").fetchone()
print(f"    整数 7 插入 REAL 列 → 值={row[0]}, 类型={row[1]}（保持浮点）")

# ===== 4. PRAGMA 设置 =====
print("\\n[4] PRAGMA 设置演示：")
print(f"    SQLite 版本号: {sqlite3.sqlite_version}")
print(f"    默认日志模式: {cursor.execute('PRAGMA journal_mode').fetchone()[0]}")
print(f"    默认外键状态: {cursor.execute('PRAGMA foreign_keys').fetchone()[0]}（0=关闭）")
cursor.execute("PRAGMA foreign_keys = ON")
print(f"    开启后外键状态: {cursor.execute('PRAGMA foreign_keys').fetchone()[0]}（1=开启）")

# 内存数据库不支持 WAL，演示一下
print(f"    内存数据库尝试设 WAL: {cursor.execute('PRAGMA journal_mode = WAL').fetchone()[0]}（仍是 memory）")

# ===== 5. table_info 查看表结构 =====
print("\\n[5] PRAGMA table_info 查看表结构：")
cursor.execute("""
CREATE TABLE sample (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER DEFAULT 0,
    email TEXT UNIQUE
)
""")
print(f"    {'列名':<12}{'类型':<10}{'非空':<6}{'默认值':<10}{'主键'}")
print(f"    {'-' * 50}")
for col in cursor.execute("PRAGMA table_info(sample)"):
    cid, name, col_type, notnull, default, pk = col
    default_str = repr(default) if default is not None else "(无)"
    print(f"    {name:<12}{(col_type or ''):<10}{notnull:<6}{default_str:<10}{pk}")

# ===== 6. isolation_level 隔离级别 =====
print("\\n[6] isolation_level 隔离级别：")
conn_iso = sqlite3.connect(":memory:", isolation_level=None)  # 自动提交模式
print(f"    isolation_level=None (自动提交): {conn_iso.isolation_level!r}")
conn_iso.execute("CREATE TABLE t (x)")
conn_iso.execute("INSERT INTO t VALUES (1)")
# 自动提交模式下，无需 commit 即可查到
print(f"    自动提交后查询（无需 commit）: {conn_iso.execute('SELECT * FROM t').fetchone()}")

conn_default = sqlite3.connect(":memory:")
print(f"    默认 isolation_level: {conn_default.isolation_level!r}（需手动 commit）")

conn_iso.close()
conn_default.close()
cursor.close()
conn.close()

# 清理文件
if os.path.exists(file_path):
    os.remove(file_path)

print("\\nSQLite 入门演示完成！")
`,
  },

  // =========================================================
  // 第五章：连接与建表
  // =========================================================
  {
    id: "py-sqlite-connect",
    group: "SQLite",
    icon: "🔗",
    title: "连接与建表",
    content: `## 一、URI 连接字符串

sqlite3 支持 URI 格式的连接字符串，提供更精细的访问控制：

\`\`\`python
conn = sqlite3.connect("file:path/to/db?mode=ro", uri=True)
\`\`\`

| 参数 | 值 | 说明 |
|------|----|------|
| \`mode\` | \`ro\` | 只读模式，不能写入 |
| \`mode\` | \`rw\` | 读写模式（默认） |
| \`mode\` | \`rwc\` | 读写+创建（不存在则建） |
| \`cache\` | \`shared\` | 共享缓存模式 |
| \`immutable\` | \`1\` | 不可变模式（只读，不加锁） |

### 只读模式

\`\`\`python
# 以只读方式打开，任何写操作都会报错
conn = sqlite3.connect("file:mydata.db?mode=ro", uri=True)
conn.execute("INSERT ...")  # 报错：attempt to write a readonly database
\`\`\`

只读模式适合查看备份文件、分析数据时不小心改坏数据。

## 二、CREATE TABLE 语法

\`\`\`sql
CREATE TABLE 表名 (
    列名1 类型 约束,
    列名2 类型 约束,
    ...
    表级约束
);
\`\`\`

### 列约束

| 约束 | 说明 | 例子 |
|------|------|------|
| \`PRIMARY KEY\` | 主键，唯一标识一行 | \`id INTEGER PRIMARY KEY\` |
| \`NOT NULL\` | 不能为空 | \`name TEXT NOT NULL\` |
| \`UNIQUE\` | 值唯一 | \`email TEXT UNIQUE\` |
| \`CHECK\` | 自定义检查条件 | \`CHECK(age >= 0)\` |
| \`DEFAULT\` | 默认值 | \`status DEFAULT 'active'\` |
| \`AUTOINCREMENT\` | 自增（仅 INTEGER PRIMARY KEY） | \`id INTEGER PRIMARY KEY AUTOINCREMENT\` |

### PRIMARY KEY vs AUTOINCREMENT

\`\`\`sql
-- 方式1：普通 INTEGER PRIMARY KEY
-- 删除最大 id 后，新插入会复用该 id
id INTEGER PRIMARY KEY

-- 方式2：AUTOINCREMENT
-- id 永不复用，单调递增（记录最大值到 sqlite_sequence 表）
id INTEGER PRIMARY KEY AUTOINCREMENT
\`\`\`

\`\`\`python
# 演示 AUTOINCREMENT 的不复用特性
cursor.execute("INSERT INTO t (name) VALUES ('A')")  # id=1
cursor.execute("DELETE FROM t WHERE id=1")
cursor.execute("INSERT INTO t (name) VALUES ('B')")  # id=2（不复用1）
\`\`\`

## 三、外键与级联操作

外键建立表与表之间的引用关系。使用外键前要开启：

\`\`\`python
conn.execute("PRAGMA foreign_keys = ON")
\`\`\`

外键可以定义级联行为：

| 行为 | 说明 |
|------|------|
| \`ON DELETE CASCADE\` | 父行删除时，子行也删除 |
| \`ON DELETE SET NULL\` | 父行删除时，子行外键设为 NULL |
| \`ON DELETE RESTRICT\` | 有子行时禁止删除父行 |
| \`ON DELETE NO ACTION\` | 默认，同 RESTRICT |
| \`ON UPDATE CASCADE\` | 父行主键更新时，子行外键同步更新 |

\`\`\`sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
\`\`\`

## 四、索引

索引是提升查询速度的关键。没有索引时查询要全表扫描；有索引时用 B+树快速定位。

### 索引类型

| 类型 | 语法 | 说明 |
|------|------|------|
| 单列索引 | \`CREATE INDEX idx ON t(col)\` | 加速单列查询 |
| 唯一索引 | \`CREATE UNIQUE INDEX idx ON t(col)\` | 索引列值唯一 |
| 复合索引 | \`CREATE INDEX idx ON t(a, b)\` | 多列组合 |
| 表达式索引 | \`CREATE INDEX idx ON t(lower(name))\` | 对表达式建索引 |

### 最左前缀原则

复合索引 \`(a, b, c)\` 可用于：

- \`WHERE a = ?\` —— 用到索引
- \`WHERE a = ? AND b = ?\` —— 用到索引
- \`WHERE a = ? AND b = ? AND c = ?\` —— 用到索引
- \`WHERE b = ?\` —— **用不到**索引（缺最左列 a）
- \`WHERE a = ? AND c = ?\` —— 只用到 a 部分

### 索引的代价

- 占用额外磁盘空间。
- 写入时要同时更新索引，写入变慢。
- 数据量大时才明显，小表全表扫描反而更快。

## 五、ALTER TABLE 与 DROP TABLE

SQLite 的 ALTER TABLE 支持有限操作：

| 操作 | 语法 |
|------|------|
| 加列 | \`ALTER TABLE t ADD COLUMN new_col TYPE\` |
| 重命名表 | \`ALTER TABLE t RENAME TO t2\` |
| 重命名列 | \`ALTER TABLE t RENAME COLUMN old TO new\`（3.25+） |

\`\`\`sql
-- SQLite 不支持直接删列、改列类型，要重建表
DROP TABLE IF EXISTS old_table;
\`\`\`

## 六、本章代码说明

下面演示：URI 只读模式、带全部约束的建表、约束违反测试、AUTOINCREMENT 行为、外键 ON DELETE SET NULL、索引创建及性能对比、ALTER TABLE。`,
    code: `# -*- coding: utf-8 -*-
# 第五章演示代码：连接与建表
# 演示 URI 只读模式、约束、外键级联、索引性能、ALTER TABLE
import sqlite3
import os
import time

print("=" * 60)
print("SQLite 连接与建表演示")
print("=" * 60)

# ===== 1. URI 只读模式 =====
print("\\n[1] URI 连接字符串（只读模式）：")
file_path = "/tmp/pydb_connect_demo.db"
if os.path.exists(file_path):
    os.remove(file_path)

# 先用读写模式创建并写入数据
conn = sqlite3.connect(file_path)
conn.execute("CREATE TABLE config (key TEXT PRIMARY KEY, value TEXT)")
conn.execute("INSERT INTO config VALUES (?, ?)", ("app_name", "我的应用"))
conn.execute("INSERT INTO config VALUES (?, ?)", ("version", "1.0"))
conn.commit()
conn.close()

# 用只读模式打开
conn_ro = sqlite3.connect(f"file:{file_path}?mode=ro", uri=True)
cursor = conn_ro.cursor()
cursor.execute("SELECT * FROM config")
print(f"    只读查询: {cursor.fetchall()}")

# 尝试写入（会报错）
try:
    cursor.execute("INSERT INTO config VALUES (?, ?)", ("hack", "data"))
except sqlite3.OperationalError as e:
    print(f"    只读模式写入报错: {e}")
conn_ro.close()

# ===== 2. CREATE TABLE 带全部约束 =====
print("\\n[2] CREATE TABLE 带全部约束：")
conn = sqlite3.connect(":memory:")
conn.execute("PRAGMA foreign_keys = ON")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    age INTEGER CHECK(age >= 0 AND age <= 150),
    balance REAL DEFAULT 0.0 CHECK(balance >= 0),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'banned'))
)
""")
print("    已创建 users 表（含 NOT NULL/UNIQUE/CHECK/DEFAULT/AUTOINCREMENT）")

# ===== 3. 约束违反测试 =====
print("\\n[3] 约束违反测试：")

# NOT NULL 违反
try:
    cursor.execute("INSERT INTO users (username, email) VALUES (?, ?)", (None, "a@b.com"))
except sqlite3.IntegrityError as e:
    print(f"    NOT NULL 违反: {e}")

# UNIQUE 违反
cursor.execute("INSERT INTO users (username, email, age) VALUES (?, ?, ?)", ("alice", "a@b.com", 20))
try:
    cursor.execute("INSERT INTO users (username, email, age) VALUES (?, ?, ?)", ("alice", "c@d.com", 25))
except sqlite3.IntegrityError as e:
    print(f"    UNIQUE 违反（用户名重复）: {e}")

# CHECK 违反（年龄超出范围）
try:
    cursor.execute("INSERT INTO users (username, email, age) VALUES (?, ?, ?)", ("bob", "b@c.com", 200))
except sqlite3.IntegrityError as e:
    print(f"    CHECK 违反（年龄 200）: {e}")

# CHECK 违反（余额为负）
try:
    cursor.execute("INSERT INTO users (username, email, balance) VALUES (?, ?, ?)", ("bob", "b@c.com", -100))
except sqlite3.IntegrityError as e:
    print(f"    CHECK 违反（余额 -100）: {e}")

# DEFAULT 生效
cursor.execute("INSERT INTO users (username, email, age) VALUES (?, ?, ?)", ("bob", "b@c.com", 25))
row = cursor.execute("SELECT balance, status FROM users WHERE username = ?", ("bob",)).fetchone()
print(f"    DEFAULT 生效: bob 的 balance={row[0]}, status={row[1]}")

# ===== 4. AUTOINCREMENT 行为 =====
print("\\n[4] AUTOINCREMENT 行为（id 不复用）：")
cursor.execute("CREATE TABLE seq_test (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)")
cursor.execute("INSERT INTO seq_test (name) VALUES (?)", ("第一条",))
cursor.execute("INSERT INTO seq_test (name) VALUES (?)", ("第二条",))
print(f"    插入两条后最大 id: {cursor.execute('SELECT MAX(id) FROM seq_test').fetchone()[0]}")
cursor.execute("DELETE FROM seq_test WHERE id = ?", (2,))
cursor.execute("INSERT INTO seq_test (name) VALUES (?)", ("第三条",))
new_id = cursor.execute("SELECT id FROM seq_test ORDER BY id DESC LIMIT 1").fetchone()[0]
print(f"    删除 id=2 后再插入，新 id={new_id}（不复用 2，符合 AUTOINCREMENT）")

# ===== 5. 外键 ON DELETE SET NULL =====
print("\\n[5] 外键 ON DELETE SET NULL：")
cursor.execute("""
CREATE TABLE departments (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
)
""")
cursor.execute("""
CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    dept_id INTEGER,
    FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL
)
""")
cursor.execute("INSERT INTO departments VALUES (?, ?)", (1, "技术部"))
cursor.execute("INSERT INTO departments VALUES (?, ?)", (2, "市场部"))
cursor.execute("INSERT INTO employees VALUES (?, ?, ?)", (101, "张三", 1))
cursor.execute("INSERT INTO employees VALUES (?, ?, ?)", (102, "李四", 1))
cursor.execute("INSERT INTO employees VALUES (?, ?, ?)", (103, "王五", 2))
conn.commit()

print(f"    删除前员工: {cursor.execute('SELECT * FROM employees').fetchall()}")
cursor.execute("DELETE FROM departments WHERE id = ?", (1,))  # 删除技术部
conn.commit()
print(f"    删除技术部后员工: {cursor.execute('SELECT * FROM employees').fetchall()}")
print("    → 技术部的员工 dept_id 被设为 NULL（SET NULL 生效）")

# ===== 6. 索引性能对比 =====
print("\\n[6] 索引性能对比：")
cursor.execute("CREATE TABLE big_table (id INTEGER, name TEXT, age INTEGER)")
# 插入 50000 条数据
import random
random.seed(42)
data = [(i, f"user{i}", random.randint(1, 100)) for i in range(50000)]
cursor.executemany("INSERT INTO big_table VALUES (?, ?, ?)", data)
conn.commit()

# 无索引查询
start = time.time()
cursor.execute("SELECT * FROM big_table WHERE name = ?", ("user49999",))
cursor.fetchone()
no_index_time = time.time() - start

# 创建索引
cursor.execute("CREATE INDEX idx_name ON big_table(name)")
conn.commit()

# 有索引查询
start = time.time()
cursor.execute("SELECT * FROM big_table WHERE name = ?", ("user49999",))
cursor.fetchone()
with_index_time = time.time() - start

print(f"    无索引查询 50000 条耗时: {no_index_time:.4f} 秒")
print(f"    有索引查询 50000 条耗时: {with_index_time:.4f} 秒")
print(f"    提速约 {no_index_time / max(with_index_time, 0.0001):.1f} 倍")

# 复合索引与最左前缀
cursor.execute("CREATE INDEX idx_name_age ON big_table(name, age)")
print("    创建复合索引 (name, age)")
print(f"    WHERE name=? 用到索引: {cursor.execute('EXPLAIN QUERY PLAN SELECT * FROM big_table WHERE name=?', ('user1',)).fetchall()}")
print(f"    WHERE age=? 用不到索引: {cursor.execute('EXPLAIN QUERY PLAN SELECT * FROM big_table WHERE age=?', (50,)).fetchall()}")

# ===== 7. ALTER TABLE =====
print("\\n[7] ALTER TABLE 演示：")
cursor.execute("CREATE TABLE old_table (id INTEGER, name TEXT)")
cursor.execute("INSERT INTO old_table VALUES (?, ?)", (1, "测试"))
# 加列
cursor.execute("ALTER TABLE old_table ADD COLUMN age INTEGER DEFAULT 0")
cursor.execute("SELECT * FROM old_table")
print(f"    ADD COLUMN 后: {cursor.fetchall()}（新列 age 默认 0）")
# 重命名表
cursor.execute("ALTER TABLE old_table RENAME TO renamed_table")
cursor.execute("SELECT * FROM renamed_table")
print(f"    RENAME TO 后查询 renamed_table: {cursor.fetchall()}")
# 重命名列（SQLite 3.25+）
cursor.execute("ALTER TABLE renamed_table RENAME COLUMN name TO username")
cursor.execute("PRAGMA table_info(renamed_table)")
print(f"    RENAME COLUMN name→username 后表结构已更新")

# DROP TABLE
cursor.execute("DROP TABLE IF EXISTS renamed_table")
print(f"    DROP TABLE 后表是否存在: {cursor.execute('SELECT name FROM sqlite_master WHERE name=?', ('renamed_table',)).fetchone()}")

cursor.close()
conn.close()
if os.path.exists(file_path):
    os.remove(file_path)
print("\\n连接与建表演示完成！")
`,
  },

  // =========================================================
  // 第六章：增删改查
  // =========================================================
  {
    id: "py-sqlite-crud",
    group: "SQLite",
    icon: "📝",
    title: "增删改查",
    content: `## 一、CRUD 概述

CRUD 是数据库操作的四个基本动作，对应四条 SQL 语句：

| 操作 | 含义 | SQL 关键字 | 说明 |
|------|------|------------|------|
| **C**reate | 创建 | \`INSERT\` | 插入新数据 |
| **R**ead | 读取 | \`SELECT\` | 查询数据 |
| **U**pdate | 更新 | \`UPDATE\` | 修改已有数据 |
| **D**elete | 删除 | \`DELETE\` | 删除数据 |

本章用 \`employees\`（员工）和 \`departments\`（部门）两张表演示完整的 CRUD。

## 二、INSERT 插入

### 单条插入

\`\`\`python
cursor.execute("INSERT INTO employees (name, salary) VALUES (?, ?)", ("张三", 8000))
last_id = cursor.lastrowid   # 获取自增 ID
\`\`\`

### 批量插入 executemany

\`\`\`python
employees = [("张三", 8000), ("李四", 9000), ("王五", 7500)]
cursor.executemany("INSERT INTO employees (name, salary) VALUES (?, ?)", employees)
\`\`\`

比循环 execute 快得多，因为只编译一次 SQL。

### INSERT OR REPLACE（替换冲突）

当唯一约束冲突时，删除旧行再插入新行：

\`\`\`python
cursor.execute("INSERT OR REPLACE INTO users (id, name) VALUES (?, ?)", (1, "新名字"))
\`\`\`

如果 id=1 已存在，先删除旧行再插入新行。

### UPSERT（存在则更新）

\`\`\`sql
-- SQLite 3.24+ 支持 ON CONFLICT
INSERT INTO users (id, name) VALUES (1, '张三')
ON CONFLICT(id) DO UPDATE SET name = excluded.name
\`\`\`

存在则更新，不存在则插入，比"先查再判断"更高效。

## 三、SELECT 查询

### 基本查询

\`\`\`python
cursor.execute("SELECT * FROM employees")
cursor.execute("SELECT name, salary FROM employees WHERE salary > ?", (5000,))
\`\`\`

### WHERE 条件

\`\`\`sql
WHERE age > 25 AND dept = 'tech'
WHERE name LIKE '张%'        -- 模糊匹配（以张开头的）
WHERE salary BETWEEN 5000 AND 10000
WHERE dept IN ('tech', 'hr', 'finance')
\`\`\`

### ORDER BY 排序

\`\`\`sql
ORDER BY salary DESC        -- 按薪资降序
ORDER BY dept, salary DESC   -- 先按部门，再按薪资降序
\`\`\`

### GROUP BY 分组与聚合

| 聚合函数 | 说明 |
|----------|------|
| \`COUNT(*)\` | 计数 |
| \`SUM(col)\` | 求和 |
| \`AVG(col)\` | 平均 |
| \`MAX(col)\` / \`MIN(col)\` | 最大/最小 |
| \`GROUP_CONCAT(col)\` | 拼接成字符串 |

\`\`\`sql
SELECT dept, COUNT(*), AVG(salary) FROM employees GROUP BY dept
\`\`\`

### JOIN 连接

\`\`\`sql
-- 内连接：只返回两表都匹配的行
SELECT e.name, d.name AS dept_name
FROM employees e
JOIN departments d ON e.dept_id = d.id
\`\`\`

### LIMIT / OFFSET 分页

\`\`\`sql
SELECT * FROM employees LIMIT 10 OFFSET 20   -- 第 3 页（每页 10 条）
\`\`\`

## 四、UPDATE 更新

\`\`\`python
# 条件更新
cursor.execute("UPDATE employees SET salary = ? WHERE name = ?", (9000, "张三"))

# 多列更新
cursor.execute("UPDATE employees SET salary = ?, dept_id = ? WHERE name = ?", (9000, 2, "张三"))

# 表达式更新
cursor.execute("UPDATE employees SET salary = salary * 1.1")  # 全员加薪 10%
\`\`\`

\`rowcount\` 属性返回受影响的行数。

## 五、DELETE 删除

\`\`\`python
cursor.execute("DELETE FROM employees WHERE id = ?", (5,))
deleted = cursor.rowcount   # 删除的行数
\`\`\`

**警告**：不带 WHERE 的 \`DELETE FROM t\` 会清空整张表，务必小心！

## 六、fetch 方法对比

| 方法 | 返回 | 适合场景 |
|------|------|----------|
| \`fetchone()\` | 一条或 \`None\` | 查单条记录 |
| \`fetchall()\` | 列表（可能很大） | 数据量小 |
| \`fetchmany(n)\` | 最多 n 条 | 分批读取大数据 |

## 七、高级查询

### 子查询

\`\`\`sql
SELECT * FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees)
\`\`\`

### CASE 表达式

\`\`\`sql
SELECT name,
    CASE WHEN salary > 10000 THEN '高薪'
         WHEN salary > 6000 THEN '中薪'
         ELSE '低薪'
    END AS level
FROM employees
\`\`\`

### DISTINCT 去重

\`\`\`sql
SELECT DISTINCT dept_id FROM employees
\`\`\`

## 八、本章代码说明

下面用 employees + departments 两张表演示完整 CRUD：各种 INSERT、SELECT（WHERE/LIKE/聚合/GROUP BY/JOIN/分页）、UPDATE、DELETE、子查询、CASE、DISTINCT、GROUP_CONCAT。`,
    code: `# -*- coding: utf-8 -*-
# 第六章演示代码：增删改查（CRUD）
# 用 employees + departments 两张表演示完整的增删改查操作
import sqlite3

print("=" * 60)
print("SQLite 增删改查（CRUD）演示")
print("=" * 60)

conn = sqlite3.connect(":memory:")
conn.execute("PRAGMA foreign_keys = ON")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# ===== 建表 =====
cursor.execute("""
CREATE TABLE departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    location TEXT
)
""")
cursor.execute("""
CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    salary REAL,
    dept_id INTEGER,
    hire_date TEXT DEFAULT (DATE('now')),
    FOREIGN KEY (dept_id) REFERENCES departments(id)
)
""")
print("\\n[建表] 已创建 departments 和 employees 表（含外键关联）")

# ===== CREATE：INSERT 各种方式 =====
print("\\n[CREATE] 插入数据：")

# 1. 插入部门
depts = [("技术部", "北京"), ("市场部", "上海"), ("人事部", "广州")]
cursor.executemany("INSERT INTO departments (name, location) VALUES (?, ?)", depts)
print(f"    批量插入 {cursor.rowcount} 个部门")

# 2. 单条插入员工
cursor.execute("INSERT INTO employees (name, salary, dept_id) VALUES (?, ?, ?)", ("张三", 12000, 1))
print(f"    单条插入张三，自增 id={cursor.lastrowid}")

# 3. 批量插入员工
emps = [
    ("李四", 9500, 1), ("王五", 11000, 1), ("赵六", 8000, 2),
    ("钱七", 7500, 2), ("孙八", 13000, 2), ("周九", 6500, 3),
    ("吴十", 7000, 3), ("郑十一", 10500, 1),
]
cursor.executemany("INSERT INTO employees (name, salary, dept_id) VALUES (?, ?, ?)", emps)
print(f"    批量插入 {cursor.rowcount} 名员工")

# 4. INSERT OR REPLACE 演示
cursor.execute("CREATE TABLE config (key TEXT PRIMARY KEY, value TEXT)")
cursor.execute("INSERT INTO config VALUES (?, ?)", ("theme", "dark"))
cursor.execute("INSERT OR REPLACE INTO config VALUES (?, ?)", ("theme", "light"))
print(f"    INSERT OR REPLACE: theme = {cursor.execute('SELECT value FROM config WHERE key=?', ('theme',)).fetchone()[0]}")

# 5. UPSERT 演示（ON CONFLICT）
cursor.execute("""
INSERT INTO config (key, value) VALUES (?, ?)
ON CONFLICT(key) DO UPDATE SET value = excluded.value
""", ("theme", "blue"))
print(f"    UPSERT 后 theme = {cursor.execute('SELECT value FROM config WHERE key=?', ('theme',)).fetchone()[0]}")
conn.commit()

# ===== READ：SELECT 各种查询 =====
print("\\n[READ] 查询数据：")

# 1. 基本查询
print("    1) 所有员工：")
cursor.execute("SELECT id, name, salary FROM employees ORDER BY id")
for r in cursor.fetchall():
    print(f"       id={r['id']}, 姓名={r['name']}, 薪资={r['salary']}")

# 2. WHERE + LIKE 模糊查询
print("    2) 姓张/姓李的员工（LIKE）：")
cursor.execute("SELECT name FROM employees WHERE name LIKE ?", ("张%",))
print(f"       姓张: {[r[0] for r in cursor.fetchall()]}")
cursor.execute("SELECT name FROM employees WHERE name LIKE ? OR name LIKE ?", ("张%", "李%"))
print(f"       姓张或姓李: {[r[0] for r in cursor.fetchall()]}")

# 3. 聚合函数
print("    3) 聚合统计：")
stats = cursor.execute("SELECT COUNT(*), AVG(salary), MAX(salary), MIN(salary), SUM(salary) FROM employees").fetchone()
print(f"       总数={stats[0]}, 平均薪资={stats[1]:.0f}, 最高={stats[2]}, 最低={stats[3]}, 总和={stats[4]}")

# 4. GROUP BY 分组
print("    4) 按部门分组统计：")
print(f"       {'部门':<10}{'人数':<6}{'平均薪资':<10}{'最高薪资'}")
cursor.execute("""
SELECT d.name, COUNT(*), AVG(e.salary), MAX(e.salary)
FROM employees e JOIN departments d ON e.dept_id = d.id
GROUP BY d.name ORDER BY AVG(e.salary) DESC
""")
for r in cursor.fetchall():
    print(f"       {r[0]:<10}{r[1]:<6}{r[2]:<10.0f}{r[3]}")

# 5. JOIN 连接查询
print("    5) JOIN 查询（员工+部门）：")
cursor.execute("""
SELECT e.name, e.salary, d.name AS dept_name, d.location
FROM employees e JOIN departments d ON e.dept_id = d.id
ORDER BY e.salary DESC LIMIT 3
""")
print(f"       薪资最高的 3 名员工：")
for r in cursor.fetchall():
    print(f"         {r['name']} - 薪资{r['salary']} - {r['dept_name']}({r['location']})")

# 6. LIMIT/OFFSET 分页
print("    6) 分页查询（每页 3 条，第 2 页）：")
cursor.execute("SELECT id, name FROM employees ORDER BY id LIMIT 3 OFFSET 3")
print(f"       第 2 页: {[r[1] for r in cursor.fetchall()]}")

# 7. 子查询
print("    7) 子查询（薪资高于平均的员工）：")
cursor.execute("""
SELECT name, salary FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees)
ORDER BY salary DESC
""")
for r in cursor.fetchall():
    print(f"       {r['name']}: {r['salary']}")

# 8. CASE 表达式
print("    8) CASE 表达式（薪资分级）：")
cursor.execute("""
SELECT name,
    CASE WHEN salary >= 10000 THEN '高薪'
         WHEN salary >= 8000 THEN '中薪'
         ELSE '低薪'
    END AS level
FROM employees ORDER BY salary DESC
""")
for r in cursor.fetchall():
    print(f"       {r['name']}: {r['level']}")

# 9. DISTINCT 去重
cursor.execute("SELECT DISTINCT dept_id FROM employees")
print(f"    9) DISTINCT 去重（员工涉及的部门id）: {[r[0] for r in cursor.fetchall()]}")

# 10. GROUP_CONCAT 拼接
cursor.execute("""
SELECT d.name, GROUP_CONCAT(e.name, '、') AS members
FROM employees e JOIN departments d ON e.dept_id = d.id
GROUP BY d.name
""")
print("    10) GROUP_CONCAT（部门成员拼接）：")
for r in cursor.fetchall():
    print(f"        {r['name']}: {r['members']}")

# ===== UPDATE：更新 =====
print("\\n[UPDATE] 更新数据：")
cursor.execute("UPDATE employees SET salary = ? WHERE name = ?", (12500, "张三"))
print(f"    条件更新：张三薪资改为 12500，影响 {cursor.rowcount} 行")
cursor.execute("UPDATE employees SET salary = salary * 1.1 WHERE dept_id = ?", (3,))
print(f"    表达式更新：人事部全员加薪 10%，影响 {cursor.rowcount} 行")
# 验证
cursor.execute("SELECT name, salary FROM employees WHERE dept_id = 3")
for r in cursor.fetchall():
    print(f"       {r['name']}: {r['salary']}")
conn.commit()

# ===== DELETE：删除 =====
print("\\n[DELETE] 删除数据：")
cursor.execute("SELECT COUNT(*) FROM employees")
before = cursor.fetchone()[0]
cursor.execute("DELETE FROM employees WHERE salary < ?", (7000,))
print(f"    删除薪资低于 7000 的员工，删除 {cursor.rowcount} 行")
cursor.execute("SELECT COUNT(*) FROM employees")
after = cursor.fetchone()[0]
print(f"    删除前 {before} 人，删除后 {after} 人")
conn.commit()

cursor.close()
conn.close()
print("\\n增删改查演示完成！")
`,
  },

  // =========================================================
  // 第七章：事务与高级查询
  // =========================================================
  {
    id: "py-sqlite-transaction",
    group: "SQLite",
    icon: "🔒",
    title: "事务与高级查询",
    content: `## 一、ACID 特性详解

事务是数据库操作的基本单位，有四大特性：

| 特性 | 含义 | 例子 |
|------|------|------|
| **A**tomicity 原子性 | 事务里的操作要么全做，要么全不做 | 转账：扣款+加款必须同时成功或同时失败 |
| **C**onsistency 一致性 | 事务前后数据库保持一致状态 | 转账前后总金额不变 |
| **I**solation 隔离性 | 并发事务互不干扰 | A 转账时 B 看不到中间状态 |
| **D**urability 持久性 | 提交后数据永久保存 | 提交后即使断电也不丢 |

### 原子性的意义

没有原子性，转账时如果扣款成功但加款失败，钱就凭空消失了。事务保证这种情况发生时，扣款也会被撤销。

## 二、事务控制语句

\`\`\`sql
BEGIN;          -- 开始事务
-- SQL 操作
COMMIT;         -- 提交（确认所有操作）
ROLLBACK;       -- 回滚（撤销所有操作）
\`\`\`

### Python 中的事务

\`\`\`python
conn = sqlite3.connect(":memory:")
try:
    conn.execute("BEGIN")
    conn.execute("UPDATE accounts SET balance = balance - 100 WHERE name = 'A'")
    conn.execute("UPDATE accounts SET balance = balance + 100 WHERE name = 'B'")
    conn.commit()   # 提交
except Exception:
    conn.rollback()  # 回滚
\`\`\`

### with 语句

\`\`\`python
with conn:
    conn.execute("UPDATE ...")
    conn.execute("UPDATE ...")
# 正常结束自动 commit，异常自动 rollback
\`\`\`

## 三、SAVEPOINT 保存点

SAVEPOINT 允许在事务内部设置"存档点"，可以部分回滚而不撤销整个事务：

\`\`\`sql
BEGIN;
INSERT INTO log VALUES ('step1');
SAVEPOINT sp1;          -- 设置存档点
INSERT INTO log VALUES ('step2');
ROLLBACK TO sp1;        -- 回滚到 sp1，step2 被撤销，step1 保留
COMMIT;
\`\`\`

适合"先尝试，不行就退回某一步"的场景。

## 四、WAL 模式与并发

### 日志模式对比

| 模式 | 说明 | 并发 |
|------|------|------|
| \`DELETE\`（默认） | 回滚日志，写时锁全库 | 写阻塞读 |
| \`WAL\` | 预写日志，写到单独 WAL 文件 | 读写可并发 |
| \`MEMORY\` | 日志在内存 | 最快但崩溃易丢 |

### WAL 的优势

- **读不阻塞写，写不阻塞读**：读操作读主库文件，写操作写 WAL 文件。
- 适合"读多写少"的并发场景。

\`\`\`python
conn.execute("PRAGMA journal_mode = WAL")
conn.execute("PRAGMA wal_autocheckpoint = 1000")  # WAL 满 1000 页自动 checkpoint
\`\`\`

注意：WAL 只能用于文件数据库，内存数据库不支持。

### busy_timeout

多个连接同时写时，后到的会等待锁释放。\`busy_timeout\` 设置等待时间：

\`\`\`python
conn = sqlite3.connect("my.db", timeout=5.0)   # 等 5 秒
conn.execute("PRAGMA busy_timeout = 5000")       # 毫秒
\`\`\`

超时仍拿不到锁会抛 \`OperationalError: database is locked\`。

## 五、窗口函数（Window Functions）

SQLite 3.25+ 支持窗口函数，可以在不聚合行的情况下做"跨行计算"。

| 函数 | 说明 |
|------|------|
| \`ROW_NUMBER()\` | 行号 |
| \`RANK()\` | 排名（同分并列） |
| \`DENSE_RANK()\` | 紧凑排名 |
| \`SUM(col) OVER(...)\` | 累计求和 |
| \`LAG(col, n)\` | 取前 n 行的值 |
| \`LEAD(col, n)\` | 取后 n 行的值 |

\`\`\`sql
-- 按部门排名薪资
SELECT name, dept, salary,
    RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rank_in_dept,
    SUM(salary) OVER (PARTITION BY dept) AS dept_total
FROM employees
\`\`\`

## 六、CTE 公用表表达式

CTE（Common Table Expression）用 \`WITH\` 定义临时结果集，让复杂查询更清晰。

### 普通 CTE

\`\`\`sql
WITH dept_avg AS (
    SELECT dept_id, AVG(salary) AS avg_sal FROM employees GROUP BY dept_id
)
SELECT e.name FROM employees e
JOIN dept_avg d ON e.dept_id = d.dept_id
WHERE e.salary > d.avg_sal
\`\`\`

### 递归 CTE

递归 CTE 可以生成序列、遍历树形结构：

\`\`\`sql
WITH RECURSIVE fibo(n) AS (
    SELECT 0
    UNION ALL
    SELECT n + 1 FROM fibo WHERE n < 9
)
SELECT n FROM fibo
\`\`\`

用递归 CTE 生成斐波那契数列：

\`\`\`sql
WITH RECURSIVE fibo(a, b) AS (
    SELECT 0, 1
    UNION ALL
    SELECT b, a + b FROM fibo WHERE b < 100
)
SELECT a FROM fibo
\`\`\`

## 七、UPSERT（ON CONFLICT）

UPSERT = INSERT + UPDATE，存在则更新，不存在则插入：

\`\`\`sql
INSERT INTO products (id, name, stock) VALUES (1, '苹果', 100)
ON CONFLICT(id) DO UPDATE SET stock = stock + excluded.stock
\`\`\`

\`excluded\` 是特殊表，指代"试图插入的新行"。常用于计数器累加。

## 八、JSON 操作

SQLite 内置 JSON1 扩展，支持 JSON 数据的存取：

| 函数 | 说明 |
|------|------|
| \`json_extract(json, path)\` | 提取 JSON 字段 |
| \`json_set(json, path, value)\` | 修改 JSON 字段 |
| \`json_insert()\` | 插入 JSON 字段 |
| \`json_array()\` | 构造 JSON 数组 |
| \`json_object()\` | 构造 JSON 对象 |

\`\`\`sql
-- 存 JSON 数据
CREATE TABLE config (id INTEGER, data TEXT);
INSERT INTO config VALUES (1, '{"name":"张三","age":25,"tags":["a","b"]}');
-- 查询
SELECT json_extract(data, '$.name') FROM config;
SELECT json_extract(data, '$.tags[0]') FROM config;
\`\`\`

## 九、批量插入性能

| 方式 | 说明 | 速度 |
|------|------|------|
| 逐条 execute + 逐条 commit | 每条都提交 | 最慢 |
| 逐条 execute + 一次 commit | 一个事务 | 中等 |
| executemany + 一次 commit | 批量+事务 | 最快 |

**关键**：把多次写入放在一个事务里，能减少 90% 以上的磁盘 I/O。

## 十、本章代码说明

下面演示：带 CHECK 约束的银行转账事务、with 语句、SAVEPOINT、批量插入性能对比（三种方式）、窗口函数 RANK/SUM OVER、递归 CTE 斐波那契、UPSERT、JSON 提取与修改。`,
    code: `# -*- coding: utf-8 -*-
# 第七章演示代码：事务与高级查询
# 演示事务、SAVEPOINT、批量性能、窗口函数、CTE、UPSERT、JSON 操作
import sqlite3
import time

print("=" * 60)
print("SQLite 事务与高级查询演示")
print("=" * 60)

conn = sqlite3.connect(":memory:")
conn.execute("PRAGMA foreign_keys = ON")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# ===== 1. 银行转账事务（带 CHECK 约束）=====
print("\\n[1] 银行转账事务（带 CHECK 约束）：")
cursor.execute("""
CREATE TABLE accounts (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    balance REAL CHECK(balance >= 0)
)
""")
cursor.executemany("INSERT INTO accounts (name, balance) VALUES (?, ?)",
                   [("张三", 1000.0), ("李四", 500.0), ("王五", 200.0)])
conn.commit()
print("    初始账户：")
for r in cursor.execute("SELECT name, balance FROM accounts"):
    print(f"      {r['name']}: {r['balance']}")


def transfer(from_name, to_name, amount):
    """转账事务：失败则回滚。"""
    try:
        with conn:   # with 语句自动管理事务
            cur = conn.cursor()
            cur.execute("SELECT balance FROM accounts WHERE name = ?", (from_name,))
            row = cur.fetchone()
            if not row or row[0] < amount:
                raise ValueError(f"{from_name} 余额不足")
            cur.execute("UPDATE accounts SET balance = balance - ? WHERE name = ?", (amount, from_name))
            cur.execute("UPDATE accounts SET balance = balance + ? WHERE name = ?", (amount, to_name))
        print(f"    ✓ {from_name} → {to_name}: {amount} 元（成功）")
    except (ValueError, sqlite3.IntegrityError) as e:
        print(f"    ✗ {from_name} → {to_name}: {amount} 元（失败: {e}，已回滚）")


transfer("张三", "李四", 200.0)    # 成功
transfer("李四", "王五", 10000.0)  # 余额不足
transfer("王五", "张三", -50.0)     # CHECK 约束？余额够但金额负
print("    转账后账户：")
for r in cursor.execute("SELECT name, balance FROM accounts"):
    print(f"      {r['name']}: {r['balance']}")

# ===== 2. SAVEPOINT 保存点 =====
print("\\n[2] SAVEPOINT 保存点（部分回滚）：")
cursor.execute("CREATE TABLE log (step TEXT)")
conn.commit()
cursor.execute("BEGIN")
cursor.execute("INSERT INTO log VALUES (?)", ("step1",))
cursor.execute("SAVEPOINT sp1")
cursor.execute("INSERT INTO log VALUES (?)", ("step2",))
cursor.execute("ROLLBACK TO sp1")   # 回滚到 sp1，step2 撤销
cursor.execute("INSERT INTO log VALUES (?)", ("step3",))
conn.commit()
print(f"    事务后日志: {[r[0] for r in cursor.execute('SELECT step FROM log')]}")
print("    → step2 被回滚，step1 和 step3 保留")

# ===== 3. 批量插入性能对比 =====
print("\\n[3] 批量插入性能对比（5000 条）：")
cursor.execute("CREATE TABLE perf_test (id INTEGER, val TEXT)")


def bench(title, func, n=5000):
    start = time.time()
    func(n)
    elapsed = time.time() - start
    print(f"    {title}: {elapsed:.4f} 秒")


# 方式1：逐条 execute + 逐条 commit（最慢）
def way1(n):
    c = sqlite3.connect(":memory:")
    c.execute("CREATE TABLE t (id INTEGER, val TEXT)")
    for i in range(n):
        c.execute("INSERT INTO t VALUES (?, ?)", (i, f"v{i}"))
        c.commit()
    c.close()


# 方式2：逐条 execute + 一次 commit
def way2(n):
    c = sqlite3.connect(":memory:")
    c.execute("CREATE TABLE t (id INTEGER, val TEXT)")
    for i in range(n):
        c.execute("INSERT INTO t VALUES (?, ?)", (i, f"v{i}"))
    c.commit()
    c.close()


# 方式3：executemany + 一次 commit（最快）
def way3(n):
    c = sqlite3.connect(":memory:")
    c.execute("CREATE TABLE t (id INTEGER, val TEXT)")
    c.executemany("INSERT INTO t VALUES (?, ?)", [(i, f"v{i}") for i in range(n)])
    c.commit()
    c.close()


bench("逐条execute+逐条commit", way1)
bench("逐条execute+一次commit ", way2)
bench("executemany+一次commit  ", way3)
print("    → 事务批量提交比逐条提交快几十倍")

# ===== 4. 窗口函数 =====
print("\\n[4] 窗口函数（RANK / SUM OVER / LAG）：")
cursor.execute("""
CREATE TABLE sales (id INTEGER PRIMARY KEY, rep TEXT, region TEXT, amount REAL)
""")
sales = [
    ("张三", "华北", 100), ("张三", "华北", 200), ("张三", "华北", 150),
    ("李四", "华北", 300), ("李四", "华北", 250),
    ("王五", "华南", 180), ("王五", "华南", 220),
]
cursor.executemany("INSERT INTO sales (rep, region, amount) VALUES (?, ?, ?)", sales)
conn.commit()

print("    按区域内的销售额排名：")
cursor.execute("""
SELECT rep, region, amount,
    RANK() OVER (PARTITION BY region ORDER BY amount DESC) AS rank_in_region,
    SUM(amount) OVER (PARTITION BY region) AS region_total
FROM sales ORDER BY region, rank_in_region
""")
for r in cursor.fetchall():
    print(f"      {r['rep']:<4} {r['region']} 金额={r['amount']:>6} 区内排名={r['rank_in_region']} 区总额={r['region_total']}")

print("    累计求和（SUM OVER ORDER BY）：")
cursor.execute("""
SELECT rep, amount,
    SUM(amount) OVER (ORDER BY id) AS running_total
FROM sales ORDER BY id LIMIT 5
""")
for r in cursor.fetchall():
    print(f"      {r['rep']:<4} 金额={r['amount']:>6} 累计={r['running_total']:>7}")

# ===== 5. 递归 CTE：斐波那契数列 =====
print("\\n[5] 递归 CTE 生成斐波那契数列：")
cursor.execute("""
WITH RECURSIVE fibo(a, b) AS (
    SELECT 0, 1
    UNION ALL
    SELECT b, a + b FROM fibo WHERE b < 1000
)
SELECT a FROM fibo
""")
fib = [r[0] for r in cursor.fetchall()]
print(f"    斐波那契数列（<1000）: {fib}")

print("    递归 CTE 生成 1-10 序列：")
cursor.execute("""
WITH RECURSIVE cnt(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM cnt WHERE n < 10
)
SELECT n FROM cnt
""")
print(f"    {[r[0] for r in cursor.fetchall()]}")

# ===== 6. UPSERT（ON CONFLICT）=====
print("\\n[6] UPSERT（ON CONFLICT）演示：")
cursor.execute("CREATE TABLE counters (id INTEGER PRIMARY KEY, count INTEGER DEFAULT 0)")
cursor.execute("INSERT INTO counters (id, count) VALUES (?, ?)", (1, 0))
conn.commit()

# 多次 UPSERT，存在则累加
for _ in range(5):
    cursor.execute("""
    INSERT INTO counters (id, count) VALUES (?, 1)
    ON CONFLICT(id) DO UPDATE SET count = count + excluded.count
    """, (1,))
conn.commit()
print(f"    UPSERT 累加 5 次后 count = {cursor.execute('SELECT count FROM counters WHERE id=1').fetchone()[0]}")

# ===== 7. JSON 操作 =====
print("\\n[7] JSON 操作（json_extract / json_set）：")
cursor.execute("CREATE TABLE settings (id INTEGER PRIMARY KEY, data TEXT)")
cursor.execute("""INSERT INTO settings (data) VALUES (?)""",
               ('{"name":"张三","age":25,"tags":["python","sql"],"addr":{"city":"北京"}}',))
conn.commit()

# 提取字段
cursor.execute("SELECT json_extract(data, '$.name'), json_extract(data, '$.age'), json_extract(data, '$.tags[0]') FROM settings")
r = cursor.fetchone()
print(f"    提取 name={r[0]}, age={r[1]}, tags[0]={r[2]}")
cursor.execute("SELECT json_extract(data, '$.addr.city') FROM settings")
print(f"    提取嵌套 city={cursor.fetchone()[0]}")

# 修改字段
cursor.execute("UPDATE settings SET data = json_set(data, '$.age', 26) WHERE id = 1")
cursor.execute("SELECT json_extract(data, '$.age') FROM settings")
print(f"    json_set 修改 age 后 = {cursor.fetchone()[0]}")

cursor.execute("UPDATE settings SET data = json_set(data, '$.addr.city', '上海') WHERE id = 1")
cursor.execute("SELECT json_extract(data, '$.addr.city') FROM settings")
print(f"    json_set 修改嵌套 city 后 = {cursor.fetchone()[0]}")

cursor.close()
conn.close()
print("\\n事务与高级查询演示完成！")
`,
  },

  // =========================================================
  // 第八章：实战练习
  // =========================================================
  {
    id: "py-sqlite-practice",
    group: "SQLite",
    icon: "🎯",
    title: "实战练习",
    content: `## 一、项目背景：图书管理系统

本章用一个完整的**图书管理系统**综合运用前几章所学。系统管理"作者-图书-借阅"三层数据，涉及建表、外键、事务、查询、统计等全部知识点。

### 数据模型

\`\`\`text
authors（作者）           books（图书）              borrowings（借阅）
+----+------+            +----+-------+---------+   +----+---------+---------+--------+
| id | name |            | id | title | author_id|   | id | book_id | reader  | date   |
+----+------+            +----+-------+---------+   +----+---------+---------+--------+
| 1  | 鲁迅 |            | 1  | 呐喊  |    1     |   | 1  |    1    | 小明    | 01-01  |
| 2  | 巴金 |            | 2  | 彷徨  |    1     |   | 2  |    3    | 小红    | 01-03  |
| 3  | 老舍 |            | 3  | 家    |    2     |   +----+---------+---------+--------+
+----+------+            | 4  | 茶馆  |    3     |
                         +----+-------+---------+
\`\`\`

三张表通过外键关联：

- \`books.author_id\` → \`authors.id\`（图书属于哪个作者）
- \`borrowings.book_id\` → \`books.id\`（借阅记录关联哪本书）

### 外键约束设计

\`\`\`sql
CREATE TABLE books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author_id INTEGER,
    stock INTEGER DEFAULT 1 CHECK(stock >= 0),
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL
);

CREATE TABLE borrowings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    reader TEXT NOT NULL,
    borrow_date TEXT DEFAULT (DATE('now')),
    return_date TEXT,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
\`\`\`

\`return_date\` 为 NULL 表示未归还，有值表示已归还。

## 二、LibraryDB 类设计

把所有数据库操作封装成一个类，对外提供清晰的 API：

| 方法 | 功能 | 事务 |
|------|------|------|
| \`add_author(name)\` | 添加作者 | 是 |
| \`add_book(title, author_name, stock)\` | 添加图书 | 是 |
| \`borrow_book(book_title, reader)\` | 借书（减库存+记录） | 是（多步操作） |
| \`return_book(book_title, reader)\` | 还书（加库存+更新记录） | 是（多步操作） |
| \`search_books(keyword)\` | 按书名/作者搜索 | 否 |
| \`get_statistics()\` | 统计信息 | 否 |

### 借书事务流程

借书涉及两步操作，必须用事务保证原子性：

\`\`\`text
1. 检查库存 > 0
2. 库存减 1
3. 插入借阅记录
→ 全部成功才 commit，任何一步失败则 rollback
\`\`\`

如果不用事务，可能出现"库存减了但记录没插入"的不一致状态。

### 还书事务流程

\`\`\`text
1. 查找未归还的借阅记录
2. 更新 return_date
3. 库存加 1
→ 全部成功才 commit
\`\`\`

## 三、统计查询

用 GROUP BY、JOIN、子查询做业务统计：

\`\`\`sql
-- 每位作者有几本书
SELECT a.name, COUNT(b.id) FROM authors a
LEFT JOIN books b ON b.author_id = a.id GROUP BY a.name;

-- 最受欢迎的书（被借次数最多）
SELECT b.title, COUNT(br.id) AS times
FROM books b JOIN borrowings br ON br.book_id = b.id
GROUP BY b.title ORDER BY times DESC LIMIT 5;

-- 当前借出未还的书
SELECT b.title, br.reader, br.borrow_date
FROM books b JOIN borrowings br ON br.book_id = b.id
WHERE br.return_date IS NULL;
\`\`\`

## 四、本章代码说明

下面实现完整的 \`LibraryDB\` 类，包含所有方法。然后用中国作家（鲁迅、巴金、老舍）的数据做演示：添加作者和图书、借书还书、搜索、统计，最后测试外键约束。`,
    code: `# -*- coding: utf-8 -*-
# 第八章演示代码：实战练习 —— 图书管理系统
# 用 LibraryDB 类封装作者/图书/借阅的完整 CRUD 与事务操作
import sqlite3

print("=" * 60)
print("图书管理系统实战演示")
print("=" * 60)


class LibraryDB:
    """图书管理系统：管理作者、图书、借阅记录。"""

    def __init__(self, db_path=":memory:"):
        self.conn = sqlite3.connect(db_path)
        self.conn.execute("PRAGMA foreign_keys = ON")
        self.conn.row_factory = sqlite3.Row
        self._init_tables()

    def _init_tables(self):
        """创建三张表及外键关联。"""
        self.conn.executescript("""
        CREATE TABLE IF NOT EXISTS authors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        );
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author_id INTEGER,
            stock INTEGER DEFAULT 1 CHECK(stock >= 0),
            FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL
        );
        CREATE TABLE IF NOT EXISTS borrowings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            reader TEXT NOT NULL,
            borrow_date TEXT DEFAULT (DATE('now')),
            return_date TEXT,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
        CREATE INDEX IF NOT EXISTS idx_borrowings_book ON borrowings(book_id);
        """)
        self.conn.commit()

    def add_author(self, name):
        """添加作者，返回作者 id（重名则返回已有的）。"""
        try:
            with self.conn:
                cur = self.conn.execute("INSERT INTO authors (name) VALUES (?)", (name,))
                return cur.lastrowid
        except sqlite3.IntegrityError:
            row = self.conn.execute("SELECT id FROM authors WHERE name = ?", (name,)).fetchone()
            return row[0]

    def add_book(self, title, author_name, stock=1):
        """添加图书，自动建立作者关联。"""
        author_id = self.add_author(author_name)
        with self.conn:
            self.conn.execute(
                "INSERT INTO books (title, author_id, stock) VALUES (?, ?, ?)",
                (title, author_id, stock),
            )
        return self.conn.execute("SELECT last_insert_rowid()").fetchone()[0]

    def borrow_book(self, book_title, reader):
        """借书事务：库存减 1 + 插入借阅记录。库存不足或不存在则失败。"""
        with self.conn:
            cur = self.conn.execute(
                "SELECT id, stock FROM books WHERE title = ?", (book_title,)
            )
            book = cur.fetchone()
            if not book:
                raise ValueError(f"图书《{book_title}》不存在")
            if book["stock"] <= 0:
                raise ValueError(f"《{book_title}》库存不足")
            self.conn.execute("UPDATE books SET stock = stock - 1 WHERE id = ?", (book["id"],))
            self.conn.execute(
                "INSERT INTO borrowings (book_id, reader) VALUES (?, ?)",
                (book["id"], reader),
            )
        return True

    def return_book(self, book_title, reader):
        """还书事务：更新归还日期 + 库存加 1。"""
        with self.conn:
            cur = self.conn.execute(
                "SELECT br.id, b.id AS book_id FROM borrowings br "
                "JOIN books b ON br.book_id = b.id "
                "WHERE b.title = ? AND br.reader = ? AND br.return_date IS NULL",
                (book_title, reader),
            )
            row = cur.fetchone()
            if not row:
                raise ValueError(f"未找到 {reader} 借阅《{book_title}》的未归还记录")
            self.conn.execute(
                "UPDATE borrowings SET return_date = DATE('now') WHERE id = ?", (row["id"],)
            )
            self.conn.execute("UPDATE books SET stock = stock + 1 WHERE id = ?", (row["book_id"],))
        return True

    def search_books(self, keyword):
        """按书名或作者名模糊搜索。"""
        like = f"%{keyword}%"
        return self.conn.execute(
            "SELECT b.title, a.name AS author, b.stock FROM books b "
            "LEFT JOIN authors a ON b.author_id = a.id "
            "WHERE b.title LIKE ? OR a.name LIKE ? ORDER BY b.title",
            (like, like),
        ).fetchall()

    def get_statistics(self):
        """返回统计信息字典。"""
        stats = {}
        stats["作者数"] = self.conn.execute("SELECT COUNT(*) FROM authors").fetchone()[0]
        stats["图书数"] = self.conn.execute("SELECT COUNT(*) FROM books").fetchone()[0]
        stats["总库存"] = self.conn.execute("SELECT SUM(stock) FROM books").fetchone()[0]
        stats["借阅记录数"] = self.conn.execute("SELECT COUNT(*) FROM borrowings").fetchone()[0]
        stats["当前借出"] = self.conn.execute(
            "SELECT COUNT(*) FROM borrowings WHERE return_date IS NULL"
        ).fetchone()[0]
        return stats

    def get_popular_books(self, limit=5):
        """最受欢迎的图书（按借阅次数）。"""
        return self.conn.execute(
            "SELECT b.title, COUNT(br.id) AS times FROM books b "
            "JOIN borrowings br ON br.book_id = b.id "
            "GROUP BY b.title ORDER BY times DESC LIMIT ?",
            (limit,),
        ).fetchall()

    def list_current_borrowed(self):
        """列出当前借出未还的图书。"""
        return self.conn.execute(
            "SELECT b.title, br.reader, br.borrow_date FROM books b "
            "JOIN borrowings br ON br.book_id = b.id "
            "WHERE br.return_date IS NULL ORDER BY br.borrow_date"
        ).fetchall()

    def close(self):
        self.conn.close()


# ===== 演示 LibraryDB =====
db = LibraryDB()

# 1. 添加作者和图书
print("\\n[1] 添加作者和图书：")
db.add_book("呐喊", "鲁迅", 3)
db.add_book("彷徨", "鲁迅", 2)
db.add_book("朝花夕拾", "鲁迅", 1)
db.add_book("家", "巴金", 2)
db.add_book("春", "巴金", 1)
db.add_book("秋", "巴金", 1)
db.add_book("茶馆", "老舍", 2)
db.add_book("骆驼祥子", "老舍", 2)
db.add_book("四世同堂", "老舍", 1)
print("    已添加 9 本图书（作者：鲁迅、巴金、老舍）")

# 2. 借书
print("\\n[2] 借书操作：")
borrow_ops = [
    ("呐喊", "小明"), ("呐喊", "小红"), ("茶馆", "小明"),
    ("家", "小红"), ("骆驼祥子", "小刚"), ("家", "小明"),
]
for title, reader in borrow_ops:
    try:
        db.borrow_book(title, reader)
        print(f"    ✓ {reader} 借阅《{title}》成功")
    except ValueError as e:
        print(f"    ✗ {reader} 借阅《{title}》失败: {e}")

# 借空库存测试
print("    库存测试：朝花夕拾只有 1 本")
db.borrow_book("朝花夕拾", "小张")
try:
    db.borrow_book("朝花夕拾", "小李")
except ValueError as e:
    print(f"    ✗ 小李借《朝花夕拾》: {e}")

# 3. 还书
print("\\n[3] 还书操作：")
try:
    db.return_book("呐喊", "小明")
    print("    ✓ 小明归还《呐喊》")
    db.return_book("茶馆", "小明")
    print("    ✓ 小明归还《茶馆》")
except ValueError as e:
    print(f"    ✗ {e}")

# 重复还书测试
try:
    db.return_book("呐喊", "小明")
except ValueError as e:
    print(f"    ✗ 重复还书测试: {e}")

# 4. 搜索图书
print("\\n[4] 搜索图书（关键词'家'）：")
for r in db.search_books("家"):
    print(f"    《{r['title']}》 作者:{r['author']} 库存:{r['stock']}")

print("\\n    搜索鲁迅的作品：")
for r in db.search_books("鲁迅"):
    print(f"    《{r['title']}》 库存:{r['stock']}")

# 5. 统计信息
print("\\n[5] 图书馆统计信息：")
stats = db.get_statistics()
for k, v in stats.items():
    print(f"    {k}: {v}")

# 6. 最受欢迎的图书
print("\\n[6] 最受欢迎的图书（按借阅次数）：")
for r in db.get_popular_books(5):
    print(f"    《{r['title']}》 被借 {r['times']} 次")

# 7. 当前借出未还
print("\\n[7] 当前借出未还的图书：")
for r in db.list_current_borrowed():
    print(f"    《{r['title']}》 借阅人:{r['reader']} 日期:{r['borrow_date']}")

# 8. 外键约束测试
print("\\n[8] 外键约束测试：")
print("    尝试插入 author_id 不存在的图书（应失败）：")
try:
    with db.conn:
        db.conn.execute("INSERT INTO books (title, author_id, stock) VALUES (?, ?, ?)", ("测试", 9999, 1))
except sqlite3.IntegrityError as e:
    print(f"    ✗ 外键约束生效: {e}")

# 9. 按作者统计图书数
print("\\n[9] 按作者统计图书数：")
for r in db.conn.execute(
    "SELECT a.name, COUNT(b.id) AS book_count FROM authors a "
    "LEFT JOIN books b ON b.author_id = a.id GROUP BY a.name ORDER BY book_count DESC"
):
    print(f"    {r['name']}: {r['book_count']} 本")

db.close()
print("\\n图书管理系统实战演示完成！")
`,
  },
];
