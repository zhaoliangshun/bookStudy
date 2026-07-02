// =============================================================
// py8-chapters-batch10.js
// 模块：数据库测试工程化（共 10 章）
// 全新制作，简单易懂，demo 多，难代码逐行讲解
// =============================================================

export const chapters = [
  {
    id: "py8-sqlite",
    group: "数据库测试工程化",
    icon: "🗄️",
    title: "sqlite3 数据库操作",
    content: `## sqlite3 是什么

SQLite 是一个**轻量级、零配置、嵌入式**的关系型数据库。它不需要安装服务器，整个数据库就是一个 \`.db\` 文件，非常适合小型应用、移动端、嵌入式系统。

Python 标准库自带 \`sqlite3\` 模块，无需额外安装。

### 核心概念速览

| 概念 | 说明 |
|------|------|
| 连接（Connection） | 与数据库文件的通道，\`sqlite3.connect()\` |
| 游标（Cursor） | 执行 SQL、获取结果的"手指" |
| execute | 执行一条 SQL 语句 |
| fetchone | 取一条结果 |
| fetchall | 取全部结果 |
| fetchmany(n) | 取 n 条结果 |
| commit | 提交事务（保存更改） |
| rollback | 回滚事务（撤销更改） |
| 参数化查询 | 用 \`?\` 占位，防止 SQL 注入 |

### 连接数据库

\`\`\`python
import sqlite3  # 导入模块 sqlite3

# 连接文件数据库（不存在则自动创建）
conn = sqlite3.connect("mydb.db")  # 赋值变量 conn

# 连接内存数据库（速度快，程序退出后消失）
conn = sqlite3.connect(":memory:")  # 赋值变量 conn
\`\`\`

### 游标与执行

\`\`\`python
cursor = conn.cursor()  # 赋值变量 cursor
cursor.execute("CREATE TABLE users (id INTEGER, name TEXT)")  # 调用 cursor.execute()
cursor.execute("INSERT INTO users VALUES (1, '小明')")  # 调用 cursor.execute()
conn.commit()  # 调用 conn.commit()
\`\`\`

### 参数化查询（防 SQL 注入）

\`\`\`python
# ❌ 危险：字符串拼接
name = "'; DROP TABLE users; --"  # 定义字符串 name
cursor.execute(f"SELECT * FROM users WHERE name='{name}'")  # 调用 cursor.execute()

# ✅ 安全：参数化查询，用 ? 占位
cursor.execute("SELECT * FROM users WHERE name=?", (name,))  # 调用 cursor.execute()
\`\`\`

### 使用 with 语句自动管理

\`\`\`python
# with 会帮你自动 commit 或 rollback
with sqlite3.connect(":memory:") as conn:  # 使用上下文管理器：sqlite3.connect(":memory:") as conn
    conn.execute("CREATE TABLE ...")  # 调用 conn.execute()
    # 如果出异常自动 rollback，正常则 commit
\`\`\`

### row_factory 自定义行格式

\`\`\`python
# 默认返回元组
conn.row_factory = sqlite3.Row  # 返回可按键访问的 Row 对象
row = cursor.fetchone()  # 赋值变量 row
print(row["name"])  # 像字典一样访问
\`\`\`

下面的 demo 用内存数据库完整演示 sqlite3 的所有核心操作。`,
    code: `# sqlite3 数据库操作完整演示
import sqlite3

print("=" * 50)
print("    sqlite3 数据库操作完整演示")
print("=" * 50)

# ============ 1. 连接内存数据库 ============
# :memory: 创建临时数据库，程序结束后自动销毁
conn = sqlite3.connect(":memory:")
print()
print("1. 已连接内存数据库 :memory:")

# ============ 2. 创建游标并建表 ============
cursor = conn.cursor()
cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER,
        score REAL,
        grade TEXT
    )
""")
conn.commit()
print("2. 表 students 已创建")

# ============ 3. 参数化插入数据（防注入） ============
# 用 ? 占位符，第二个参数是元组
students_data = [
    ("小明", 18, 95.5, "A"),
    ("小红", 17, 88.0, "B"),
    ("小刚", 19, 72.5, "C"),
    ("小丽", 17, 91.0, "A"),
    ("小强", 18, 65.0, "D"),
]
# executemany 批量执行同一个 SQL
cursor.executemany(
    "INSERT INTO students (name, age, score, grade) VALUES (?, ?, ?, ?)",
    students_data
)
conn.commit()
print(f"3. 已插入 {len(students_data)} 条记录")

# ============ 4. fetchone：取一条 ============
print()
print("--- fetchone 取一条 ---")
cursor.execute("SELECT * FROM students WHERE id = 1")
row = cursor.fetchone()
print(f"row 类型: {type(row).__name__}, 内容: {row}")

# ============ 5. fetchall：取全部 ============
print()
print("--- fetchall 取全部 ---")
cursor.execute("SELECT id, name, score FROM students")
all_rows = cursor.fetchall()
for row in all_rows:
    print(f"  ID={row[0]}, 姓名={row[1]}, 分数={row[2]}")

# ============ 6. fetchmany：取指定数量 ============
print()
print("--- fetchmany(2) 取2条 ---")
cursor.execute("SELECT * FROM students")
two_rows = cursor.fetchmany(2)
for row in two_rows:
    print(f"  {row}")

# ============ 7. row_factory 自定义行格式 ============
print()
print("--- row_factory = sqlite3.Row ---")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()
cursor.execute("SELECT id, name, score, grade FROM students WHERE id = 1")
row = cursor.fetchone()
# Row 对象支持按键名访问，像字典一样
print(f"键名访问: name={row['name']}, score={row['score']}")
print(f"索引访问: name={row[1]}, score={row[2]}")
# 可遍历键
print(f"所有键: {list(row.keys())}")

# 恢复默认 row_factory
conn.row_factory = None

# ============ 8. 事务：commit 与 rollback ============
print()
print("--- 事务：commit 与 rollback ---")
# 先插入一条，但不 commit
conn.execute("INSERT INTO students (name, age, score, grade) VALUES (?,?,?,?)",
             ("临时用户", 20, 50.0, "F"))
# 查询，在同一个事务内能看到
cursor = conn.cursor()
cursor.execute("SELECT COUNT(*) FROM students")
count_before = cursor.fetchone()[0]
print(f"未 commit 前，事务内可见: {count_before} 条")

# rollback 回滚，撤销未提交的修改
conn.rollback()
cursor.execute("SELECT COUNT(*) FROM students")
count_after = cursor.fetchone()[0]
print(f"rollback 后，数据回滚: {count_after} 条")

# 正式插入并 commit
conn.execute("INSERT INTO students (name, age, score, grade) VALUES (?,?,?,?)",
             ("正式用户", 20, 80.0, "B"))
conn.commit()
cursor.execute("SELECT COUNT(*) FROM students")
print(f"commit 后，数据持久化: {cursor.fetchone()[0]} 条")

# ============ 9. with 语句自动管理 ============
print()
print("--- with 自动连接管理 ---")
# with 语句块结束时自动 commit（无异常）或 rollback（有异常）
with sqlite3.connect(":memory:") as conn2:
    conn2.execute("""
        CREATE TABLE demo (
            id INTEGER,
            value TEXT
        )
    """)
    conn2.execute("INSERT INTO demo VALUES (1, 'with 测试')")
    # 这里不需要手动 commit，with 块结束时自动处理
    print("with 块内已插入数据，退出时自动 commit")
    # 验证：查询
    cur = conn2.cursor()
    cur.execute("SELECT * FROM demo")
    print(f"  with 内查询结果: {cur.fetchone()}")

# ============ 10. 查询聚合 ============
print()
print("--- 聚合查询 ---")
cursor = conn.cursor()
# 统计各分数段人数
cursor.execute("""
    SELECT grade, COUNT(*) as cnt, ROUND(AVG(score), 1) as avg_score
    FROM students
    GROUP BY grade
    ORDER BY grade
""")
print("成绩统计:")
for row in cursor.fetchall():
    print(f"  等级 {row[0]}: 人数={row[1]}, 平均分={row[2]}")

# 关闭连接
conn.close()
print()
print("✅ sqlite3 核心操作演示完成！")`
  },
  {
    id: "py8-sql-crud",
    group: "数据库测试工程化",
    icon: "📝",
    title: "SQL CRUD 完整实战",
    content: `## CRUD 是什么

CRUD 是数据库操作的四个基本动作：

- **C**reate（创建）→ INSERT
- **R**ead（读取）→ SELECT
- **U**pdate（更新）→ UPDATE
- **D**elete（删除）→ DELETE

### 建表与约束

\`\`\`sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- 主键，自增
    name TEXT NOT NULL,                     -- 不允许为空
    price REAL CHECK(price > 0),           -- 检查约束：价格>0
    category TEXT DEFAULT '未分类',         -- 默认值
    stock INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);
\`\`\`

### INSERT 插入

\`\`\`sql
-- 单条插入
INSERT INTO products (name, price, category, stock) VALUES ('鼠标', 99.9, '电子产品', 50);

-- 批量插入
INSERT INTO products (name, price, category, stock) VALUES
    ('键盘', 299.0, '电子产品', 30),
    ('水杯', 19.9, '日用品', 100);
\`\`\`

### SELECT 查询

\`\`\`sql
-- 基本查询
SELECT * FROM products;

-- 条件查询 WHERE
SELECT * FROM products WHERE price > 100;

-- 模糊查询 LIKE
SELECT * FROM products WHERE name LIKE '%鼠%';

-- 排序 ORDER BY
SELECT * FROM products ORDER BY price DESC;

-- 分组 GROUP BY
SELECT category, COUNT(*) FROM products GROUP BY category;

-- 聚合函数
SELECT MAX(price), MIN(price), AVG(price), SUM(stock) FROM products;
\`\`\`

### UPDATE 更新

\`\`\`sql
UPDATE products SET price = 89.9 WHERE id = 1;
UPDATE products SET stock = stock + 10 WHERE category = '电子产品';
\`\`\`

### DELETE 删除

\`\`\`sql
DELETE FROM products WHERE id = 5;
DELETE FROM products WHERE stock = 0;  -- 删除库存为0的商品
\`\`\`

### JOIN 连接查询

\`\`\`sql
-- INNER JOIN：只返回匹配的行
SELECT o.id, p.name, o.quantity
FROM orders o
INNER JOIN products p ON o.product_id = p.id;

-- LEFT JOIN：保留左表全部行
SELECT p.name, o.quantity
FROM products p
LEFT JOIN orders o ON p.id = o.product_id;
\`\`\`

### 索引与性能

\`\`\`sql
-- 创建索引加速查询
CREATE INDEX idx_product_name ON products(name);
CREATE INDEX idx_product_category ON products(category);

-- 查看查询计划（分析是否使用索引）
EXPLAIN QUERY PLAN SELECT * FROM products WHERE name = '鼠标';
\`\`\`

下面的 demo 用完整的电商场景演示所有 CRUD 操作。`,
    code: `# SQL CRUD 完整实战：电商场景
import sqlite3

print("=" * 50)
print("    SQL CRUD 完整实战演示（电商场景）")
print("=" * 50)

# 连接内存数据库
conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# ============ 1. CREATE TABLE 建表 ============
print()
print("=== 1. CREATE TABLE 建表 ===")

# 商品表：含多种约束
cursor.execute("""
    CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL CHECK(price > 0),
        category TEXT DEFAULT '未分类',
        stock INTEGER DEFAULT 0,
        description TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
""")
print("products 表已创建（含主键、非空、检查、默认值约束）")

# 订单表：含外键
cursor.execute("""
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        quantity INTEGER CHECK(quantity > 0),
        total_price REAL,
        order_date TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (product_id) REFERENCES products(id)
    )
""")
print("orders 表已创建（含外键约束）")

# ============ 2. INSERT 插入数据 ============
print()
print("=== 2. INSERT 插入数据 ===")

products = [
    ("机械键盘", 299.0, "电子产品", 50, "Cherry MX 轴体"),
    ("无线鼠标", 99.9, "电子产品", 80, "蓝牙5.0连接"),
    ("保温杯", 49.9, "日用品", 200, "304不锈钢"),
    ("笔记本", 15.0, "文具", 500, "A5大小"),
    ("台灯", 159.0, "电子产品", 30, "LED护眼"),
    ("数据线", 29.9, "电子产品", 150, "Type-C 1米"),
    ("文件夹", 8.0, "文具", 300, "A4标准"),
]
cursor.executemany(
    "INSERT INTO products (name, price, category, stock, description) VALUES (?,?,?,?,?)",
    products
)
conn.commit()
print(f"已插入 {len(products)} 个商品")

# 插入订单数据
orders = [
    (1, 2, 598.0),   # 2个机械键盘
    (2, 5, 499.5),   # 5个无线鼠标
    (3, 10, 499.0),  # 10个保温杯
    (1, 1, 299.0),   # 1个机械键盘
    (4, 20, 300.0),  # 20个笔记本
    (6, 3, 89.7),    # 3个数据线
]
cursor.executemany(
    "INSERT INTO orders (product_id, quantity, total_price) VALUES (?,?,?)",
    orders
)
conn.commit()
print(f"已插入 {len(orders)} 个订单")

# ============ 3. SELECT 查询 ============
print()
print("=== 3. SELECT 查询 ===")

# 3.1 基本查询
cursor.execute("SELECT id, name, price, category, stock FROM products")
print("--- 全部商品 ---")
for row in cursor.fetchall():
    print(f"  [{row['id']}] {row['name']:6} ¥{row['price']:6.1f} "
          f"分类={row['category']:4} 库存={row['stock']}")

# 3.2 WHERE 条件查询
print()
print("--- WHERE：价格 > 100 的商品 ---")
cursor.execute("SELECT name, price FROM products WHERE price > 100")
for row in cursor.fetchall():
    print(f"  {row['name']} ¥{row['price']}")

# 3.3 LIKE 模糊查询
print()
print("--- LIKE：名称含'鼠'的商品 ---")
cursor.execute("SELECT name, price FROM products WHERE name LIKE '%鼠%'")
for row in cursor.fetchall():
    print(f"  {row['name']} ¥{row['price']}")

# 3.4 ORDER BY 排序
print()
print("--- ORDER BY：按价格降序排列 ---")
cursor.execute("SELECT name, price FROM products ORDER BY price DESC")
for row in cursor.fetchall():
    print(f"  {row['name']:6} ¥{row['price']:6.1f}")

# 3.5 GROUP BY 分组 + 聚合函数
print()
print("--- GROUP BY：各分类商品统计 ---")
cursor.execute("""
    SELECT category,
           COUNT(*) AS cnt,
           ROUND(AVG(price), 2) AS avg_price,
           SUM(stock) AS total_stock,
           MAX(price) AS max_price,
           MIN(price) AS min_price
    FROM products
    GROUP BY category
    ORDER BY cnt DESC
""")
for row in cursor.fetchall():
    print(f"  {row['category']:4}: 数量={row['cnt']}, "
          f"均价={row['avg_price']}, 总库存={row['total_stock']}, "
          f"最高={row['max_price']}, 最低={row['min_price']}")

# 3.6 JOIN 连接查询
print()
print("--- JOIN：订单详情（商品名+数量+金额）---")
cursor.execute("""
    SELECT o.id AS order_id,
           p.name AS product_name,
           o.quantity,
           o.total_price,
           p.price AS unit_price
    FROM orders o
    INNER JOIN products p ON o.product_id = p.id
    ORDER BY o.id
""")
for row in cursor.fetchall():
    print(f"  订单#{row['order_id']}: {row['product_name']:6} "
          f"×{row['quantity']} 单价¥{row['unit_price']} 总价¥{row['total_price']}")

# 3.7 LEFT JOIN：所有商品及其订单汇总
print()
print("--- LEFT JOIN：所有商品订单汇总 ---")
cursor.execute("""
    SELECT p.name,
           p.stock,
           COALESCE(SUM(o.quantity), 0) AS sold,
           COALESCE(SUM(o.total_price), 0) AS revenue
    FROM products p
    LEFT JOIN orders o ON p.id = o.product_id
    GROUP BY p.id
    ORDER BY revenue DESC
""")
for row in cursor.fetchall():
    print(f"  {row['name']:6} 库存={row['stock']:3} "
          f"已售={row['sold']:3} 收入=¥{row['revenue']:.1f}")

# ============ 4. UPDATE 更新 ============
print()
print("=== 4. UPDATE 更新 ===")

# 更新单个商品价格
cursor.execute("UPDATE products SET price = ? WHERE id = ?", (279.0, 1))
print("机械键盘降价至 ¥279.0")

# 批量更新：电子产品库存+10
cursor.execute("UPDATE products SET stock = stock + 10 WHERE category = '电子产品'")
print("所有电子产品库存+10")

# 验证更新
cursor.execute("SELECT name, price, stock FROM products WHERE id = 1")
row = cursor.fetchone()
print(f"  更新后: {row['name']} 价格=¥{row['price']} 库存={row['stock']}")
conn.commit()

# ============ 5. DELETE 删除 ============
print()
print("=== 5. DELETE 删除 ===")

# 删除库存为0的商品（先创建一个0库存的）
cursor.execute(
    "INSERT INTO products (name, price, category, stock) VALUES (?,?,?,?)",
    ("过期商品", 1.0, "其他", 0)
)
conn.commit()
print("创建了一个0库存的'过期商品'用于演示删除")

cursor.execute("DELETE FROM products WHERE stock = 0")
print(f"已删除库存为0的商品，影响行数: {cursor.rowcount}")

# 验证
cursor.execute("SELECT COUNT(*) FROM products")
print(f"删除后剩余商品数: {cursor.fetchone()[0]}")
conn.commit()

# ============ 6. 索引 ============
print()
print("=== 6. 索引演示 ===")

# 创建索引
cursor.execute("CREATE INDEX IF NOT EXISTS idx_product_name ON products(name)")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_product_category ON products(category)")
print("已创建索引: idx_product_name, idx_product_category")

# 查看查询计划
cursor.execute("EXPLAIN QUERY PLAN SELECT * FROM products WHERE name = '台灯'")
plan = cursor.fetchall()
print("查询计划（使用索引）:")
for row in plan:
    print(f"  {dict(row)}")

# ============ 7. 统计汇总 ============
print()
print("=== 7. 最终统计 ===")
cursor.execute("SELECT COUNT(*) FROM products")
print(f"商品总数: {cursor.fetchone()[0]}")
cursor.execute("SELECT COUNT(*) FROM orders")
print(f"订单总数: {cursor.fetchone()[0]}")
cursor.execute("SELECT ROUND(SUM(total_price), 2) FROM orders")
print(f"总销售额: ¥{cursor.fetchone()[0]}")

conn.close()
print()
print("✅ SQL CRUD 完整实战演示完成！")`
  },
  {
    id: "py8-orm",
    group: "数据库测试工程化",
    icon: "🏛️",
    title: "ORM 概念与 sqlite3 实战",
    content: `## ORM 是什么

ORM（Object-Relational Mapping，对象关系映射）是一种**用面向对象方式操作数据库**的技术。它把数据库表映射为 Python 类，把行记录映射为对象，让你用方法调用代替写 SQL。

### 没有 ORM vs 有 ORM

\`\`\`python
# 没有 ORM：写 SQL 字符串
cursor.execute("SELECT * FROM users WHERE id = ?", (1,))  # 调用 cursor.execute()
user = cursor.fetchone()  # 赋值变量 user
print(user[1])  # 用索引访问字段，容易出错

# 有 ORM：用对象操作
user = User.get_by_id(1)   # 调用方法而不是写 SQL
print(user.name)            # 用属性访问，IDE 能补全
\`\`\`

### ORM 的核心思想

| 数据库概念 | 对应 Python |
|-----------|-------------|
| 表（Table） | 类（Class） |
| 行（Row） | 对象（Instance） |
| 列（Column） | 属性（Attribute） |
| 查询（Query） | 方法调用 |

### 主流 ORM 框架

- **SQLAlchemy**：Python 最强大的 ORM，功能全面
- **Django ORM**：Django 内置，简单易用
- **Peewee**：轻量级，适合小型项目
- **SQLObject**：较早的 ORM

### 手动实现简易 ORM

理解 ORM 的最好方式是自己写一个简单的。核心要素：

1. **表映射类**：继承自 BaseModel
2. **\`__tablename__\`**：指定对应数据库表名
3. **字段定义**：用描述符或类属性定义列
4. **CRUD 封装**：save()、get()、all()、delete() 等方法

### ORM 的优缺点

| 优点 | 缺点 |
|------|------|
| 不用写 SQL，开发效率高 | 复杂查询性能可能不如手写 SQL |
| 自动防注入 | 学习曲线陡峭 |
| 数据库切换成本低 | 可能生成低效 SQL（N+1 问题） |
| 代码更易读易维护 | 调试困难（看不到实际 SQL） |
| IDE 自动补全 | 对 DBA 不够友好 |

### 数据库迁移概念

数据库迁移（Migration）是**用代码管理数据库结构的版本变化**。每次结构变更（加表、加字段、改类型）都记录为一个迁移文件，可以前进（upgrade）或回退（downgrade）。

常用工具：Alembic（配合 SQLAlchemy）、Django Migrations。

下面的 demo 手动实现一个简易 ORM，通过 sqlite3 完成完整 CRUD。`,
    code: `# 手动实现简易 ORM，理解 ORM 核心原理
import sqlite3

print("=" * 50)
print("    手动实现简易 ORM 演示")
print("=" * 50)

# ============ 1. 定义基础模型类 ============
class Field:
    """字段描述符：定义列名和类型"""
    def __init__(self, column_type="TEXT", primary_key=False, default=None):
        self.column_type = column_type
        self.primary_key = primary_key
        self.default = default
        self.name = None  # 稍后绑定

    def __set_name__(self, owner, name):
        self.name = name


class IntegerField(Field):
    """整数字段"""
    def __init__(self, primary_key=False, default=None):
        super().__init__("INTEGER", primary_key, default)


class TextField(Field):
    """文本字段"""
    def __init__(self, default=None):
        super().__init__("TEXT", False, default)


class RealField(Field):
    """浮点数字段"""
    def __init__(self, default=None):
        super().__init__("REAL", False, default)


class BaseModel:
    """ORM 基础模型：提供 save/get/all/delete 等方法"""
    _connection = None

    @classmethod
    def set_connection(cls, conn):
        """设置数据库连接"""
        cls._connection = conn

    @classmethod
    def get_fields(cls):
        """获取所有 Field 字段定义"""
        fields = {}
        for name, value in cls.__dict__.items():
            if isinstance(value, Field):
                fields[name] = value
        return fields

    @classmethod
    def create_table(cls):
        """根据字段定义自动建表"""
        fields = cls.get_fields()
        columns = []
        pk = None
        for name, field in fields.items():
            col_def = f"{name} {field.column_type}"
            if field.primary_key:
                pk = name
            columns.append(col_def)
        if pk:
            columns.append(f"PRIMARY KEY ({pk})")
        sql = f"CREATE TABLE IF NOT EXISTS {cls.__tablename__} ({', '.join(columns)})"
        cls._connection.execute(sql)
        cls._connection.commit()

    def __init__(self, **kwargs):
        """初始化对象：把关键字参数赋值给对应字段"""
        fields = self.get_fields()
        for name in fields:
            setattr(self, name, kwargs.get(name, fields[name].default))
        self._id = None

    def save(self):
        """保存对象：INSERT 或 UPDATE"""
        fields = self.get_fields()
        cls = type(self)
        field_names = list(fields.keys())
        values = [getattr(self, f) for f in field_names]
        placeholders = ", ".join(["?" for _ in field_names])
        cols = ", ".join(field_names)
        sql = f"INSERT INTO {cls.__tablename__} ({cols}) VALUES ({placeholders})"
        cursor = cls._connection.execute(sql, values)
        cls._connection.commit()
        self._id = cursor.lastrowid
        return self

    @classmethod
    def all(cls):
        """查询所有记录"""
        cursor = cls._connection.execute(f"SELECT * FROM {cls.__tablename__}")
        rows = cursor.fetchall()
        fields = list(cls.get_fields().keys())
        result = []
        for row in rows:
            obj = cls()
            for i, f in enumerate(fields):
                setattr(obj, f, row[i])
            obj._id = row[0]
            result.append(obj)
        return result

    @classmethod
    def get_by_id(cls, record_id):
        """根据 ID 查询单条记录"""
        sql = f"SELECT * FROM {cls.__tablename__} WHERE id = ?"
        cursor = cls._connection.execute(sql, (record_id,))
        row = cursor.fetchone()
        if row is None:
            return None
        fields = list(cls.get_fields().keys())
        obj = cls()
        for i, f in enumerate(fields):
            setattr(obj, f, row[i])
        obj._id = row[0]
        return obj

    @classmethod
    def delete_by_id(cls, record_id):
        """根据 ID 删除记录"""
        sql = f"DELETE FROM {cls.__tablename__} WHERE id = ?"
        cls._connection.execute(sql, (record_id,))
        cls._connection.commit()

    @classmethod
    def filter(cls, **conditions):
        """简单条件查询"""
        where_parts = []
        values = []
        for key, val in conditions.items():
            where_parts.append(f"{key} = ?")
            values.append(val)
        where_clause = " AND ".join(where_parts)
        sql = f"SELECT * FROM {cls.__tablename__} WHERE {where_clause}"
        cursor = cls._connection.execute(sql, values)
        rows = cursor.fetchall()
        fields = list(cls.get_fields().keys())
        result = []
        for row in rows:
            obj = cls()
            for i, f in enumerate(fields):
                setattr(obj, f, row[i])
            obj._id = row[0]
            result.append(obj)
        return result

    def __repr__(self):
        """友好的打印输出"""
        fields = self.get_fields()
        parts = []
        for f in fields:
            parts.append(f"{f}={getattr(self, f, None)!r}")
        return f"{type(self).__name__}({', '.join(parts)})"


# ============ 2. 定义业务模型类 ============
class User(BaseModel):
    """用户模型"""
    __tablename__ = "users"
    id = IntegerField(primary_key=True)
    name = TextField(default="匿名")
    age = IntegerField(default=0)
    email = TextField(default="")


class Product(BaseModel):
    """商品模型"""
    __tablename__ = "products"
    id = IntegerField(primary_key=True)
    name = TextField(default="未命名")
    price = RealField(default=0.0)
    stock = IntegerField(default=0)


# ============ 3. 使用 ORM 操作数据库 ============
# 连接数据库并设置连接
conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
BaseModel.set_connection(conn)

# 自动建表
User.create_table()
Product.create_table()
print("1. 已自动建表 users 和 products")

# 创建用户
print()
print("=== 2. CRUD 操作 ===")
u1 = User(name="小明", age=18, email="xiaoming@test.com")
u1.save()
print(f"创建用户: {u1}")

u2 = User(name="小红", age=17, email="xiaohong@test.com")
u2.save()

u3 = User(name="小刚", age=19, email="xiaogang@test.com")
u3.save()

# 查询所有
print()
print("--- all() 查询所有用户 ---")
all_users = User.all()
for u in all_users:
    print(f"  {u}")

# 按 ID 查询
print()
print("--- get_by_id(1) 按ID查询 ---")
user = User.get_by_id(1)
print(f"  {user}")

# 条件过滤
print()
print("--- filter(age=18) 条件过滤 ---")
young_users = User.filter(age=18)
for u in young_users:
    print(f"  {u}")

# 删除
print()
print("--- 删除 ID=3 的用户 ---")
User.delete_by_id(3)
remaining = User.all()
print(f"删除后剩余 {len(remaining)} 个用户:")
for u in remaining:
    print(f"  {u}")

# 商品操作
print()
print("=== 3. 商品 CRUD ===")
p1 = Product(name="机械键盘", price=299.0, stock=50)
p1.save()
p2 = Product(name="无线鼠标", price=99.9, stock=80)
p2.save()
p3 = Product(name="保温杯", price=49.9, stock=200)
p3.save()

all_products = Product.all()
print("所有商品:")
for p in all_products:
    print(f"  {p}")

# 价格过滤
print()
print("价格 > 100 的商品:")
expensive = [p for p in all_products if p.price > 100]
for p in expensive:
    print(f"  {p}")

conn.close()
print()
print("✅ 简易 ORM 演示完成！")
print()
print("💡 总结：ORM 的核心是把表映射为类、行映射为对象、")
print("   SQL 操作映射为方法调用，让数据库操作更 Pythonic。")`
  },
  {
    id: "py8-unittest",
    group: "数据库测试工程化",
    icon: "🧪",
    title: "unittest 单元测试框架",
    content: `## 为什么需要单元测试

单元测试（Unit Test）是对**最小可测试单元**（通常是一个函数或方法）进行验证的代码。它确保每个单元在修改后仍按预期工作。

### 单元测试的价值

- **回归保护**：修改代码后自动检查是否破坏了原有功能
- **文档作用**：测试用例本身就是最好的使用示例
- **重构信心**：有测试覆盖，改代码不怕出错
- **提前发现问题**：在开发阶段就发现 bug

### unittest 核心组件

| 组件 | 作用 |
|------|------|
| TestCase | 测试用例类，每个测试方法就是一个用例 |
| assertEqual | 断言相等（还有 assertTrue、assertRaises 等） |
| setUp / tearDown | 每个测试方法前后执行 |
| setUpClass / tearDownClass | 整个测试类前后执行一次 |
| skip / skipIf | 跳过某些测试 |
| expectedFailure | 预期会失败的测试 |
| TestSuite | 测试集合，组合多个测试 |
| TextTestRunner | 运行测试并输出文本结果 |

### 测试方法命名

必须以 \`test_\` 开头，unittest 才会自动发现：

\`\`\`python
class TestMath(unittest.TestCase):  # 定义类 TestMath
    def test_add(self):        # ✅ 会被执行
        self.assertEqual(1+2, 3)  # 调用 self.assertEqual()

    def helper_method(self):   # ❌ 不会被执行（没有 test_ 前缀）
        pass  # 空操作，占位符
\`\`\`

### 断言方法一览

| 方法 | 说明 |
|------|------|
| assertEqual(a, b) | a == b |
| assertNotEqual(a, b) | a != b |
| assertTrue(x) | x 为 True |
| assertFalse(x) | x 为 False |
| assertIs(a, b) | a is b |
| assertIsNone(x) | x is None |
| assertIn(a, b) | a in b |
| assertRaises(Error) | 预期抛出异常 |
| assertAlmostEqual(a, b) | 浮点数近似相等 |

### setUp 与 tearDown

- **setUp**：每个测试方法执行前调用，用于准备测试数据
- **tearDown**：每个测试方法执行后调用，用于清理
- **setUpClass**：类级别，所有测试前执行一次
- **tearDownClass**：类级别，所有测试后执行一次

下面的 demo 用 unittest 测试一个计算器模块，完整演示所有核心特性。`,
    code: `# unittest 完整演示：测试一个计算器模块
import unittest
import sys

# ============ 被测试的代码：一个简单计算器 ============
class Calculator:
    """简单的计算器类"""

    def add(self, a, b):
        return a + b

    def subtract(self, a, b):
        return a - b

    def multiply(self, a, b):
        return a * b

    def divide(self, a, b):
        if b == 0:
            raise ValueError("除数不能为零")
        return a / b

    def average(self, numbers):
        """计算平均值"""
        if not numbers:
            raise ValueError("列表不能为空")
        return sum(numbers) / len(numbers)


# ============ 测试类 ============
class TestCalculator(unittest.TestCase):
    """计算器的单元测试"""

    @classmethod
    def setUpClass(cls):
        """所有测试执行前调用一次"""
        print("\\n[setUpClass] 初始化测试环境...")
        cls.calc = Calculator()
        cls.setup_count = 0

    @classmethod
    def tearDownClass(cls):
        """所有测试执行后调用一次"""
        print(f"[tearDownClass] 共执行了 {cls.setup_count} 次 setUp")

    def setUp(self):
        """每个测试方法执行前调用"""
        type(self).setup_count += 1
        # 每个测试都使用全新的计算器实例
        self.calc = Calculator()

    def tearDown(self):
        """每个测试方法执行后调用（可用于清理）"""
        pass

    # ---- 测试用例 ----
    def test_add_positive(self):
        """测试正数加法"""
        result = self.calc.add(2, 3)
        self.assertEqual(result, 5)
        self.assertIsInstance(result, int)

    def test_add_negative(self):
        """测试负数加法"""
        self.assertEqual(self.calc.add(-2, -3), -5)
        self.assertEqual(self.calc.add(-2, 5), 3)

    def test_add_float(self):
        """测试浮点数加法"""
        # assertAlmostEqual 用于浮点数比较（避免精度问题）
        self.assertAlmostEqual(self.calc.add(0.1, 0.2), 0.3, places=7)

    def test_subtract(self):
        """测试减法"""
        self.assertEqual(self.calc.subtract(10, 4), 6)
        self.assertEqual(self.calc.subtract(0, 5), -5)

    def test_multiply(self):
        """测试乘法"""
        self.assertEqual(self.calc.multiply(3, 7), 21)
        self.assertEqual(self.calc.multiply(0, 100), 0)
        self.assertEqual(self.calc.multiply(-3, 4), -12)

    def test_divide_normal(self):
        """测试正常除法"""
        self.assertEqual(self.calc.divide(10, 2), 5)
        self.assertAlmostEqual(self.calc.divide(7, 3), 2.333333, places=5)

    def test_divide_by_zero(self):
        """测试除以零应抛出异常"""
        # assertRaises：验证是否抛出指定异常
        with self.assertRaises(ValueError):
            self.calc.divide(10, 0)
        # 也可以检查异常消息
        with self.assertRaises(ValueError) as ctx:
            self.calc.divide(5, 0)
        self.assertIn("除数不能为零", str(ctx.exception))

    def test_average(self):
        """测试平均值"""
        self.assertEqual(self.calc.average([1, 2, 3, 4, 5]), 3.0)
        self.assertEqual(self.calc.average([10]), 10.0)
        self.assertEqual(self.calc.average([0, 0, 0]), 0.0)

    def test_average_empty(self):
        """测试空列表平均值应抛异常"""
        with self.assertRaises(ValueError):
            self.calc.average([])

    # 断言方法大全
    def test_assert_methods(self):
        """演示各种断言方法"""
        self.assertTrue(1 + 1 == 2)
        self.assertFalse(1 + 1 == 3)
        self.assertIsNotNone(self.calc)
        self.assertIn("abc", "abcdef")
        self.assertNotIn("xyz", "abcdef")
        self.assertIsInstance(self.calc, Calculator)
        self.assertGreater(10, 5)       # 大于
        self.assertLess(3, 5)           # 小于
        self.assertGreaterEqual(10, 10) # 大于等于
        self.assertLessEqual(3, 5)      # 小于等于

    # 跳过测试
    @unittest.skip("这个测试暂时跳过")
    def test_skip_demo(self):
        self.fail("这个测试不会被执行")

    # 条件跳过
    @unittest.skipIf(sys.version_info < (3, 8), "需要 Python 3.8+")
    def test_skip_if_old_python(self):
        self.assertTrue(True)

    # 预期失败
    @unittest.expectedFailure
    def test_expected_failure(self):
        """这个测试预期会失败（演示用）"""
        self.assertEqual(1 + 1, 3)  # 故意写错


# ============ 运行测试 ============
if __name__ == "__main__":
    print("=" * 50)
    print("    unittest 单元测试框架演示")
    print("=" * 50)

    # 方式1：创建 TestSuite 并运行
    suite = unittest.TestSuite()

    # 只添加部分测试（演示 TestSuite）
    suite.addTest(TestCalculator("test_add_positive"))
    suite.addTest(TestCalculator("test_divide_by_zero"))
    suite.addTest(TestCalculator("test_assert_methods"))

    print()
    print("--- 方式1: TestSuite 运行部分测试 ---")
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)

    # 方式2：运行全部测试
    print()
    print("--- 方式2: unittest.main 运行全部测试 ---")
    # 用 argv 控制，避免真的读取命令行
    unittest.main(argv=[""], verbosity=2, exit=False)`
  },
  {
    id: "py8-pytest",
    group: "数据库测试工程化",
    icon: "🧪",
    title: "pytest 测试框架入门",
    content: `## pytest 是什么

pytest 是 Python 社区最流行的测试框架，比 unittest 更简洁、更灵活。它让你用**纯函数**写测试，不需要继承 TestCase。

### pytest vs unittest 对比

| 对比项 | unittest | pytest |
|--------|----------|--------|
| 测试写法 | 继承 TestCase | 普通函数，test_ 前缀 |
| 断言 | self.assertEqual() | 原生 assert |
| 固件 | setUp/tearDown | fixture 装饰器 |
| 参数化 | 手动循环 | @pytest.mark.parametrize |
| 插件生态 | 有限 | 丰富（pytest-cov 等） |
| 输出信息 | 简单 | 详细的失败信息 |
| 发现规则 | 类 + test_ 方法 | 任何 test_*.py 文件 |

### 基本用法

\`\`\`python
# 不需要 import unittest！
def test_addition():  # 定义函数 test_addition
    assert 1 + 2 == 3                    # 原生 assert 即可

def test_string():  # 定义函数 test_string
    assert "hello".upper() == "HELLO"  # 断言："hello".upper() == "HELLO"
\`\`\`

### fixture 固件

fixture 是 pytest 中最强大的概念，用于**准备测试数据和环境**：

\`\`\`python
import pytest  # 导入模块 pytest

@pytest.fixture  # 应用装饰器 pytest
def db():  # 定义函数 db
    """创建测试数据库"""  # 执行操作
    conn = sqlite3.connect(":memory:")  # 赋值变量 conn
    # 创建表...
    yield conn          # 提供给测试
    conn.close()        # 测试后清理
\`\`\`

### conftest.py 共享配置

把 fixture 放在 \`conftest.py\` 中，同目录下所有测试文件都能使用，无需导入。

### parametrize 参数化

一条测试逻辑，多组数据：

\`\`\`python
@pytest.mark.parametrize("a,b,expected", [  # 应用装饰器 pytest
    (1, 2, 3),  # 执行操作
    (0, 0, 0),  # 执行操作
    (-1, 1, 0),  # 执行操作
])
def test_add(a, b, expected):  # 定义函数 test_add，参数：a, b, expected
    assert a + b == expected  # 断言：a + b == expected
\`\`\`

### mark 标记

\`\`\`python
@pytest.mark.slow     # 自定义标记
@pytest.mark.skip(reason="暂不测试")  # 应用装饰器 pytest
@pytest.mark.xfail(reason="已知bug")  # 应用装饰器 pytest
\`\`\`

### pytest.raises 异常测试

\`\`\`python
def test_zero_division():  # 定义函数 test_zero_division
    with pytest.raises(ZeroDivisionError):  # 使用上下文管理器：pytest.raises(ZeroDivisionError)
        1 / 0  # 执行操作
\`\`\`

### 测试覆盖率

覆盖率（Coverage）衡量**测试代码执行了多少行源码**。覆盖率越高，代码越可靠。常用工具：pytest-cov 插件。

> ⚠️ 本教程在沙箱中运行，pytest 可能未安装。下面的 demo **模拟 pytest 的运行逻辑**，用纯 Python 展示 pytest 的核心概念和等价实现，让你彻底理解 pytest 背后的原理。实际使用只需 \`pip install pytest\` 然后 \`pytest test_*.py\`。`,
    code: `# pytest 核心概念模拟演示
# 实际使用：pip install pytest && pytest test_*.py

import sys
import traceback

print("=" * 50)
print("    pytest 测试框架核心概念模拟")
print("=" * 50)

# ============ 1. 模拟 fixture 固件机制 ============
print()
print("=== 1. fixture 固件 ===")

class FixtureRegistry:
    """模拟 pytest 的 fixture 注册表"""
    def __init__(self):
        self._fixtures = {}
        self._results = {}

    def fixture(self, func):
        """注册 fixture（模拟 @pytest.fixture）"""
        self._fixtures[func.__name__] = func
        return func

    def get(self, name):
        """获取 fixture 的值（缓存单次结果）"""
        if name not in self._results:
            self._results[name] = self._fixtures[name]()
        return self._results[name]

    def cleanup(self):
        """清理所有 fixture"""
        self._results.clear()


registry = FixtureRegistry()

# 定义 fixture（模拟数据库连接）
@registry.fixture
def database():
    """模拟创建测试数据库连接"""
    import sqlite3
    print("    [fixture] 创建数据库连接...")
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE test (id INTEGER, val TEXT)")
    conn.execute("INSERT INTO test VALUES (1, 'hello')")
    conn.execute("INSERT INTO test VALUES (2, 'world')")
    conn.commit()
    print("    [fixture] 数据库已就绪，数据已插入")
    return conn

# 使用 fixture
print("获取 fixture 'database':")
db = registry.get("database")
cursor = db.cursor()
cursor.execute("SELECT * FROM test")
rows = cursor.fetchall()
print(f"查询结果: {rows}")
db.close()
registry.cleanup()

# ============ 2. 模拟 parametrize 参数化 ============
print()
print("=== 2. parametrize 参数化 ===")

# 模拟 @pytest.mark.parametrize 的行为
def run_parametrized(test_func, param_name, test_cases):
    """模拟参数化测试运行"""
    passed = 0
    failed = 0
    for i, case in enumerate(test_cases):
        try:
            test_func(*case) if isinstance(case, tuple) else test_func(case)
            print(f"  [{i+1}] params={case} ... PASS")
            passed += 1
        except AssertionError as e:
            print(f"  [{i+1}] params={case} ... FAIL: {e}")
            failed += 1
    return passed, failed

# 定义测试函数
def test_addition(a, b, expected):
    """参数化测试：加法"""
    assert a + b == expected, f"{a} + {b} 应该等于 {expected}，实际是 {a + b}"

def test_division(a, b, expected):
    """参数化测试：除法"""
    assert a / b == expected, f"{a} / {b} 应该等于 {expected}"

# 运行参数化测试
add_cases = [(1, 2, 3), (0, 0, 0), (-1, 1, 0), (100, 200, 300), (3, 7, 10)]
print("加法参数化测试:")
run_parametrized(test_addition, "a,b,expected", add_cases)

div_cases = [(10, 2, 5), (9, 3, 3), (100, 4, 25)]
print("除法参数化测试:")
run_parametrized(test_division, "a,b,expected", div_cases)

# ============ 3. 模拟 pytest.raises 异常断言 ============
print()
print("=== 3. pytest.raises 异常断言 ===")

def assert_raises(exc_type, func, *args, **kwargs):
    """模拟 pytest.raises"""
    try:
        func(*args, **kwargs)
        print(f"  FAIL: 期望 {exc_type.__name__} 异常，但没有抛出")
        return False
    except exc_type as e:
        print(f"  PASS: 捕获到预期的 {exc_type.__name__}: {e}")
        return True
    except Exception as e:
        print(f"  FAIL: 期望 {exc_type.__name__}，但捕获到 {type(e).__name__}: {e}")
        return False

def divide(a, b):
    return a / b

def validate_age(age):
    if age < 0:
        raise ValueError("年龄不能为负数")
    if age > 150:
        raise ValueError("年龄超出合理范围")
    return age

print("除法零异常测试:")
assert_raises(ZeroDivisionError, divide, 10, 0)

print("年龄验证异常测试:")
assert_raises(ValueError, validate_age, -5)
assert_raises(ValueError, validate_age, 200)

# 正常情况不会抛异常
print("正常年龄测试:")
try:
    result = validate_age(25)
    print(f"  年龄 {result} 验证通过，无异常")
except:
    print(f"  FAIL")

# ============ 4. 模拟 mark 标记 ============
print()
print("=== 4. mark 标记模拟 ===")

class TestMarker:
    """模拟 pytest 标记系统"""
    def __init__(self):
        self.marks = {}

    def mark(self, name):
        """装饰器：给测试打标记"""
        def decorator(func):
            self.marks[func.__name__] = name
            return func
        return decorator

    def run_tests(self, funcs, include_mark=None, exclude_mark=None):
        """根据标记选择性运行测试"""
        for func in funcs:
            mark = self.marks.get(func.__name__, "")
            skip = False
            if include_mark and mark != include_mark:
                skip = True
            if exclude_mark and mark == exclude_mark:
                skip = True
            if skip:
                print(f"  SKIP {func.__name__} (标记={mark})")
                continue
            try:
                func()
                print(f"  PASS {func.__name__} (标记={mark})")
            except Exception as e:
                print(f"  FAIL {func.__name__}: {e}")


marker = TestMarker()

@marker.mark("slow")
def test_slow_operation():
    """模拟耗时操作"""
    assert sum(range(1000)) == 499500

@marker.mark("fast")
def test_fast_check():
    assert 1 + 1 == 2

@marker.mark("slow")
def test_another_slow():
    assert len("hello world") == 11

print("运行所有测试:")
marker.run_tests([test_slow_operation, test_fast_check, test_another_slow])

print()
print("只运行 slow 标记的测试:")
marker.run_tests([test_slow_operation, test_fast_check, test_another_slow],
                 include_mark="slow")

# ============ 5. 模拟 conftest.py 共享 fixture ============
print()
print("=== 5. conftest.py 共享机制 ===")

# 模拟：conftest.py 中的 fixture 被同目录测试自动发现
shared_fixtures = {
    "base_url": "http://localhost:8000",
    "api_key": "test-api-key-12345",
    "admin_user": {"name": "admin", "role": "superuser"},
}

print("conftest.py 共享的 fixture:")
for k, v in shared_fixtures.items():
    print(f"  {k} = {v}")

# 模拟测试函数使用这些 fixture
def test_api_call(base_url, api_key):
    print(f"  使用 {base_url} 和 {api_key} 进行 API 测试")
    assert base_url.startswith("http")

def test_admin_access(admin_user):
    print(f"  管理员 {admin_user['name']} 角色={admin_user['role']}")
    assert admin_user["role"] == "superuser"

print()
print("使用共享 fixture 运行测试:")
test_api_call(shared_fixtures["base_url"], shared_fixtures["api_key"])
test_admin_access(shared_fixtures["admin_user"])

# ============ 6. 覆盖率概念 ============
print()
print("=== 6. 测试覆盖率概念 ===")
print("覆盖率 = 被测试执行的代码行数 / 总代码行数 × 100%")
print()
print("覆盖率等级建议:")
print("  80%+ : 良好")
print("  90%+ : 优秀")
print("  100% : 理想（但不必强求）")
print()
print("命令行使用: pip install pytest-cov")
print("  pytest --cov=my_module tests/")
print("  pytest --cov=my_module --cov-report=html tests/")

print()
print("✅ pytest 核心概念模拟演示完成！")
print()
print("💡 pytest vs unittest 总结:")
print("  pytest: 更简洁（原生 assert），更灵活（fixture），")
print("          更强大（参数化 + 插件生态）")
print("  unittest: 标准库自带，无需安装，xUnit 风格")`
  },
  {
    id: "py8-mock",
    group: "数据库测试工程化",
    icon: "🎭",
    title: "mock 与 patch 测试替身",
    content: `## mock 是什么

mock（测试替身）是单元测试中**模拟外部依赖**的技术。当被测试的代码依赖数据库、网络、文件系统等外部资源时，用 mock 对象替代真实依赖，让测试**快速、确定、隔离**。

### 什么是测试替身

| 类型 | 说明 |
|------|------|
| Mock | 能记录调用、验证行为的替身 |
| Stub | 只返回预设值，不验证行为 |
| Fake | 轻量级实现（如内存数据库替代真实数据库） |
| Spy | 记录真实调用，同时保留原功能 |

### unittest.mock 核心组件

| 组件 | 作用 |
|------|------|
| Mock | 万能替身对象，任何属性访问都返回新 Mock |
| MagicMock | Mock 的子类，支持魔术方法（\`__len__\` 等） |
| patch | 装饰器/上下文管理器，临时替换对象 |
| patch.object | 替换对象的指定属性 |
| return_value | 设置 Mock 被调用时的返回值 |
| side_effect | 设置 Mock 被调用时的行为（抛异常、返回序列等） |
| assert_called_with | 断言 Mock 被以特定参数调用 |
| assert_called_once | 断言 Mock 只被调用一次 |

### patch 用法

\`\`\`python
# 装饰器方式
@patch("module.requests.get")  # 应用装饰器 patch
def test_fetch(mock_get):  # 定义函数 test_fetch，参数：mock_get
    mock_get.return_value.json.return_value = {"key": "value"}  # 执行操作
    result = fetch_data()  # 赋值变量 result
    mock_get.assert_called_once()  # 调用 mock_get.assert_called_once()

# 上下文管理器方式
def test_fetch():  # 定义函数 test_fetch
    with patch("module.requests.get") as mock_get:  # 使用上下文管理器：patch("module.requests.get") as mock_get
        mock_get.return_value.status_code = 200  # 执行操作
        result = fetch_data()  # 赋值变量 result
\`\`\`

### 常见 mock 场景

1. **mock 网络请求**：避免真实 HTTP 调用
2. **mock 文件操作**：避免创建真实文件
3. **mock 环境变量**：测试不同环境配置
4. **mock 时间**：控制时间流逝
5. **mock 数据库**：用内存数据库替代
6. **mock 外部 API**：返回固定响应

### side_effect 的妙用

\`\`\`python
# 每次调用返回不同值
mock.side_effect = [1, 2, 3]  # 执行操作

# 抛出异常
mock.side_effect = ValueError("出错了")  # 执行操作

# 执行函数
mock.side_effect = lambda x: x * 2  # 执行操作
\`\`\`

下面的 demo 完整演示 mock 的各种用法，包括 mock 网络请求、文件操作、环境变量等。`,
    code: `# mock 与 patch 完整演示：外部依赖隔离
from unittest.mock import Mock, MagicMock, patch, PropertyMock
import os

print("=" * 50)
print("    mock 与 patch 测试替身演示")
print("=" * 50)

# ============ 1. Mock 基本用法 ============
print()
print("=== 1. Mock 基本用法 ===")

# Mock 是万能对象，任何属性访问都返回新 Mock
m = Mock()
m.any_attribute        # 不会报错
m.any_method()         # 也不会报错
print("Mock 属性访问返回: ", type(m.any_attribute).__name__)
print("Mock 方法调用返回: ", type(m.any_method()).__name__)

# 设置 return_value：调用时返回固定值
m.get_user.return_value = {"id": 1, "name": "小明"}
result = m.get_user()
print(f"get_user 返回: {result}")

# 验证调用
m.get_user("arg1", key="val")
print(f"get_user 是否被调用过: {m.get_user.called}")

# ============ 2. MagicMock 支持魔术方法 ============
print()
print("=== 2. MagicMock 魔术方法 ===")

mm = MagicMock()

# len() 调用
mm.__len__.return_value = 5
print(f"len(mm) = {len(mm)}")

# 迭代器
mm.__iter__.return_value = iter([1, 2, 3])
print(f"list(mm) = {list(mm)}")

# 上下文管理器
mm.__enter__.return_value = "上下文中的值"
mm.__exit__.return_value = False
with mm as ctx:
    print(f"with 上下文值: {ctx}")

# ============ 3. side_effect 模拟行为 ============
print()
print("=== 3. side_effect 模拟行为 ===")

# 3.1 每次调用返回不同值
mock_seq = Mock()
mock_seq.side_effect = [10, 20, 30]
print(f"第1次: {mock_seq()}, 第2次: {mock_seq()}, 第3次: {mock_seq()}")

# 3.2 抛出异常
mock_err = Mock()
mock_err.side_effect = ValueError("模拟的错误")
try:
    mock_err()
except ValueError as e:
    print(f"捕获到异常: {e}")

# 3.3 执行函数
mock_func = Mock()
mock_func.side_effect = lambda x: x * 2
print(f"side_effect 函数: mock_func(5) = {mock_func(5)}")
print(f"side_effect 函数: mock_func(10) = {mock_func(10)}")

# ============ 4. 断言调用 ============
print()
print("=== 4. 断言调用验证 ===")

service = Mock()
service.send("hello", user_id=1)
service.send("world", user_id=2)

# 验证被调用过
service.send.assert_called()  # 不会报错
print("assert_called() 通过")

# 验证最后一次调用参数
service.send.assert_called_with("world", user_id=2)
print("assert_called_with('world', user_id=2) 通过")

# 验证调用次数
print(f"send 被调用 {service.send.call_count} 次")

# 查看所有调用记录
print(f"所有调用: {service.send.call_args_list}")

# ============ 5. 模拟被测试代码 ============
print()
print("=== 5. 模拟真实场景：HTTP 请求 ===")

# 被测试的函数：获取用户数据
def fetch_user_data(http_client, user_id):
    """通过 HTTP 客户端获取用户数据"""
    response = http_client.get(f"https://api.example.com/users/{user_id}")
    if response.status_code != 200:
        raise ConnectionError(f"请求失败: {response.status_code}")
    return response.json()

# 创建 mock HTTP 客户端
mock_http = Mock()

# 场景1：模拟成功响应
mock_response = Mock()
mock_response.status_code = 200
mock_response.json.return_value = {"id": 1, "name": "小明", "email": "xm@test.com"}
mock_http.get.return_value = mock_response

result = fetch_user_data(mock_http, 1)
print(f"场景1-成功: {result}")

# 验证调用
mock_http.get.assert_called_with("https://api.example.com/users/1")
print("验证URL正确 ✓")

# 场景2：模拟失败响应
mock_response.status_code = 404
try:
    fetch_user_data(mock_http, 999)
    print("场景2-失败: 应该抛异常但没有")
except ConnectionError as e:
    print(f"场景2-失败: {e}")

# ============ 6. patch 装饰器模拟 ============
print()
print("=== 6. patch 模拟演示 ===")

# 被测试的函数：读取配置文件
def read_config():
    """读取数据库配置（依赖环境变量）"""
    host = os.environ.get("DB_HOST", "localhost")
    port = os.environ.get("DB_PORT", "5432")
    return {"host": host, "port": int(port)}

# 模拟 patch.dict 修改环境变量
with patch.dict("os.environ", {"DB_HOST": "prod-server", "DB_PORT": "3306"}):
    config = read_config()
    print(f"环境变量被 mock 后: {config}")

# 环境变量被恢复
print(f"环境变量恢复后 DB_HOST: {os.environ.get('DB_HOST', '未设置')}")

# ============ 7. patch 模拟文件操作 ============
print()
print("=== 7. patch 模拟文件操作 ===")

# 被测试的函数：读取文件并统计行数
def count_file_lines(filepath):
    """统计文件行数"""
    with open(filepath, "r", encoding="utf-8") as f:
        return len(f.readlines())

# 使用 mock_open 模拟文件内容
mock_file_content = "第一行\\n第二行\\n第三行\\n"
with patch("builtins.open", create=True) as mock_open_func:
    # 模拟 open 返回的文件对象
    mock_file = mock_open_func.return_value.__enter__.return_value
    mock_file.readlines.return_value = ["第一行\\n", "第二行\\n", "第三行\\n"]

    line_count = count_file_lines("fake_file.txt")
    print(f"模拟文件行数: {line_count}")
    mock_open_func.assert_called_with("fake_file.txt", "r", encoding="utf-8")

# ============ 8. PropertyMock 模拟属性 ============
print()
print("=== 8. PropertyMock 模拟属性 ===")

class User:
    @property
    def is_admin(self):
        # 实际环境会查询数据库
        return self._check_permission()

    def _check_permission(self):
        # 模拟复杂逻辑
        return False

# 用 PropertyMock 模拟属性值
user = User()
with patch.object(User, "is_admin", new_callable=PropertyMock) as mock_prop:
    mock_prop.return_value = True
    print(f"is_admin 被 mock 为: {user.is_admin}")
    # 验证属性被访问过
    mock_prop.assert_called_once()

# ============ 9. 综合示例：mock 时间 ============
print()
print("=== 9. mock 时间综合示例 ===")

import time
from datetime import datetime

def get_greeting():
    """根据当前时间返回问候语"""
    hour = datetime.now().hour
    if hour < 12:
        return "早上好"
    elif hour < 18:
        return "下午好"
    else:
        return "晚上好"

# 模拟不同时间
class MockDatetime:
    """模拟 datetime 类"""
    @staticmethod
    def now():
        return MockNow()

class MockNow:
    hour = 10  # 模拟上午10点

with patch("datetime.datetime", MockDatetime):
    greeting = get_greeting()
    print(f"模拟上午10点: {greeting}")

# 模拟晚上
MockNow.hour = 20
with patch("datetime.datetime", MockDatetime):
    greeting = get_greeting()
    print(f"模拟晚上8点: {greeting}")

print()
print("✅ mock 与 patch 完整演示完成！")
print()
print("💡 mock 核心原则:")
print("  1. 只 mock 外部依赖，不 mock 被测试代码本身")
print("  2. 验证行为和调用，而不仅仅是返回值")
print("  3. mock 后记得检查调用次数和参数")
print("  4. 过度 mock 是测试坏味道，考虑重构代码")`
  },
  {
    id: "py8-typing",
    group: "数据库测试工程化",
    icon: "🔤",
    title: "typing 类型提示深入",
    content: `## 类型提示是什么

类型提示（Type Hints）是 Python 3.5+ 引入的语法，让你在代码中标明变量、参数、返回值的类型。它**不影响运行时**，但能帮助 IDE 提供更好的自动补全、类型检查和文档。

### 基本类型注解

\`\`\`python
name: str = "小明"  # 执行操作
age: int = 18  # 执行操作
score: float = 95.5  # 执行操作
is_active: bool = True  # 执行操作
\`\`\`

### 函数类型注解

\`\`\`python
def greet(name: str) -> str:  # 定义函数 greet，参数：name: str
    return f"你好，{name}！"  # 返回 f"你好，{name}！"

def add(a: int, b: int) -> int:  # 定义函数 add，参数：a: int, b: int
    return a + b  # 返回 a + b
\`\`\`

### 泛型容器类型

\`\`\`python
from typing import List, Dict, Tuple, Set, Optional, Union  # 从 typing 导入 List, Dict, Tuple, Set, Optional, Union

names: List[str] = ["小明", "小红"]  # 执行操作
scores: Dict[str, int] = {"小明": 95, "小红": 88}  # 执行操作
point: Tuple[int, int] = (10, 20)  # 执行操作
tags: Set[str] = {"Python", "TypeScript"}  # 执行操作

# Optional[X] = Union[X, None]
user: Optional[str] = None  # 可能为 None

# Union：多种类型之一
value: Union[int, str] = "hello"  # 执行操作
value = 42  # 也可以
\`\`\`

### 高级类型

| 类型 | 说明 | 示例 |
|------|------|------|
| Any | 任意类型，关闭检查 | \`x: Any = anything\` |
| Callable | 可调用对象 | \`Callable[[int, int], int]\` |
| Iterable | 可迭代 | \`Iterable[str]\` |
| Sequence | 序列（有下标） | \`Sequence[int]\` |
| TypedDict | 字典结构 | \`class User(TypedDict): name: str\` |
| Literal | 字面量值 | \`Literal["a", "b"]\` |
| Final | 不可修改 | \`PI: Final = 3.14\` |
| TypeVar | 泛型变量 | \`T = TypeVar("T")\` |
| TypeGuard | 类型收窄 | \`TypeGuard[str]\` |

### 泛型函数

\`\`\`python
from typing import TypeVar  # 从 typing 导入 TypeVar

T = TypeVar("T")  # 赋值变量 T

def first(items: List[T]) -> T:  # 定义函数 first，参数：items: List[T]
    """返回列表第一个元素，类型不变"""  # 执行操作
    return items[0]  # 返回 items[0]

x = first([1, 2, 3])     # x 类型推断为 int
y = first(["a", "b"])     # y 类型推断为 str
\`\`\`

### 类型检查工具

- **mypy**：最流行的静态类型检查器
- **pyright**：微软出品，VS Code Pylance 使用
- **pytype**：Google 出品

\`\`\`bash
pip install mypy
mypy my_script.py  # 检查类型错误
\`\`\`

下面的 demo 用实例演示各种类型提示的用法和价值。`,
    code: `# typing 类型提示深入演示
# Python 3.5+ 引入的类型注解系统

from typing import (
    List, Dict, Tuple, Set, Optional, Union, Any,
    Callable, Iterable, Sequence, TypedDict, Literal,
    Final, TypeVar, TypeGuard, get_type_hints
)
import sys

print("=" * 50)
print("    typing 类型提示深入演示")
print("=" * 50)

# ============ 1. 基本类型注解 ============
print()
print("=== 1. 基本类型注解 ===")

name: str = "小明"
age: int = 18
score: float = 95.5
is_active: bool = True

print(f"name: {name} (类型: {type(name).__name__})")
print(f"age: {age} (类型: {type(age).__name__})")
print(f"score: {score} (类型: {type(score).__name__})")
print(f"is_active: {is_active} (类型: {type(is_active).__name__})")

# ============ 2. 函数类型注解 ============
print()
print("=== 2. 函数类型注解 ===")

def greet(name: str) -> str:
    """带有类型注解的问候函数"""
    return f"你好，{name}！"

def calculate(a: int, b: int) -> int:
    return a + b

def safe_divide(a: float, b: float) -> Optional[float]:
    """可能返回 None 的除法"""
    if b == 0:
        return None
    return a / b

print(greet("Python学习者"))
print(f"calculate(10, 20) = {calculate(10, 20)}")
print(f"safe_divide(10, 2) = {safe_divide(10.0, 2.0)}")
print(f"safe_divide(10, 0) = {safe_divide(10.0, 0.0)}")

# 查看函数的类型提示
print(f"greet 的类型提示: {get_type_hints(greet)}")
print(f"calculate 的类型提示: {get_type_hints(calculate)}")

# ============ 3. 泛型容器类型 ============
print()
print("=== 3. 泛型容器类型 ===")

# List
students: List[str] = ["小明", "小红", "小刚", "小丽"]
print(f"List[str]: {students}")

# Dict
scores: Dict[str, float] = {"小明": 95.5, "小红": 88.0, "小刚": 72.5}
print(f"Dict[str, float]: {scores}")

# Tuple（固定长度）
point: Tuple[int, int] = (10, 20)
rgb: Tuple[int, int, int] = (255, 128, 0)
print(f"Tuple[int, int]: {point}")
print(f"Tuple[int, int, int]: {rgb}")

# Set
tags: Set[str] = {"Python", "TypeScript", "Docker"}
print(f"Set[str]: {tags}")

# Optional
def find_user(user_id: int) -> Optional[Dict[str, Any]]:
    """模拟查找用户，可能返回 None"""
    users = {1: {"name": "小明", "age": 18}, 2: {"name": "小红", "age": 17}}
    return users.get(user_id)

user = find_user(1)
print(f"Optional[Dict]: 找到用户 = {user}")
user = find_user(999)
print(f"Optional[Dict]: 未找到用户 = {user}")

# Union
def process(value: Union[int, str]) -> str:
    """接受 int 或 str 类型"""
    if isinstance(value, int):
        return f"数字: {value}"
    return f"字符串: {value}"

print(f"Union[int, str]: {process(42)}")
print(f"Union[int, str]: {process('hello')}")

# ============ 4. TypedDict 定义结构 ============
print()
print("=== 4. TypedDict 结构化字典 ===")

class UserInfo(TypedDict):
    """用户信息结构定义"""
    name: str
    age: int
    email: str

# 创建符合结构的字典
user: UserInfo = {
    "name": "小明",
    "age": 18,
    "email": "xiaoming@test.com",
}
print(f"UserInfo: {user}")
print(f"  姓名: {user['name']}")
print(f"  年龄: {user['age']}")
print(f"  邮箱: {user['email']}")

# ============ 5. Literal 字面量类型 ============
print()
print("=== 5. Literal 字面量类型 ===")

def set_log_level(level: Literal["debug", "info", "warn", "error"]) -> str:
    """参数只能是这几个值之一"""
    return f"日志级别设置为: {level}"

print(set_log_level("info"))
print(set_log_level("error"))
# set_log_level("critical")  # mypy 会报错

# ============ 6. Callable 可调用对象 ============
print()
print("=== 6. Callable 可调用对象 ===")

def apply_operation(
    func: Callable[[int, int], int],
    a: int,
    b: int
) -> int:
    """接受一个可调用对象作为参数"""
    return func(a, b)

def add(x: int, y: int) -> int:
    return x + y

def multiply(x: int, y: int) -> int:
    return x * y

print(f"apply_operation(add, 3, 5) = {apply_operation(add, 3, 5)}")
print(f"apply_operation(multiply, 3, 5) = {apply_operation(multiply, 3, 5)}")

# ============ 7. TypeVar 泛型变量 ============
print()
print("=== 7. TypeVar 泛型变量 ===")

T = TypeVar("T")

def first_item(items: List[T]) -> T:
    """返回列表第一个元素，保持类型"""
    return items[0]

def last_item(items: Sequence[T]) -> Optional[T]:
    """返回最后一个元素，可能为 None"""
    if not items:
        return None
    return items[-1]

# 类型推断：int 列表 -> int 返回值
a = first_item([1, 2, 3])
print(f"first_item([1,2,3]) = {a} (类型: {type(a).__name__})")

# 类型推断：str 列表 -> str 返回值
b = first_item(["a", "b", "c"])
print(f"first_item(['a','b','c']) = {b} (类型: {type(b).__name__})")

print(f"last_item([1,2,3]) = {last_item([1, 2, 3])}")
print(f"last_item([]) = {last_item([])}")

# ============ 8. Final 常量 ============
print()
print("=== 8. Final 常量 ===")

PI: Final = 3.14159265358979
MAX_USERS: Final[int] = 1000
DEFAULT_TIMEOUT: Final[float] = 30.0

print(f"PI = {PI}")
print(f"MAX_USERS = {MAX_USERS}")
print(f"DEFAULT_TIMEOUT = {DEFAULT_TIMEOUT}")
# PI = 3.15  # mypy 会报错：不能重新赋值 Final 变量

# ============ 9. TypeGuard 类型收窄 ============
print()
print("=== 9. TypeGuard 类型收窄 ===")

def is_string_list(value: List[Any]) -> "TypeGuard[List[str]]":
    """检查列表是否全是字符串"""
    return all(isinstance(item, str) for item in value)

def process_items(items: List[Any]) -> str:
    """根据类型收窄处理"""
    if is_string_list(items):
        # 这里类型检查器知道 items 是 List[str]
        return "全部是字符串: " + ", ".join(items)
    else:
        return "包含非字符串元素"

print(process_items(["a", "b", "c"]))
print(process_items([1, "b", 3]))

# ============ 10. Any 与类型检查 ============
print()
print("=== 10. Any 与类型检查 ===")

any_value: Any = "可以是任何类型"
print(f"Any 变量: {any_value}")

# mypy 概念说明
print()
print("--- 类型检查工具 ---")
print("mypy 是 Python 最流行的静态类型检查器:")
print(f"  当前 Python 版本: {sys.version_info.major}.{sys.version_info.minor}")
print("  安装: pip install mypy")
print("  使用: mypy your_script.py")
print("  mypy 会检查类型注解是否一致，但不影响运行时")
print()
print("常用 mypy 配置 (pyproject.toml):")
print("  [tool.mypy]")
print("  strict = true        # 严格模式")
print("  warn_return_any = true")
print("  disallow_untyped_defs = true")

print()
print("✅ typing 类型提示深入演示完成！")
print()
print("💡 类型提示的好处:")
print("  1. IDE 自动补全更准确")
print("  2. 重构时更安全（IDE 能追踪类型）")
print("  3. 代码即文档（类型就是最好的文档）")
print("  4. 静态检查提前发现 bug（mypy/pyright）")`
  },
  {
    id: "py8-performance",
    group: "数据库测试工程化",
    icon: "⏱️",
    title: "性能分析与优化",
    content: `## 为什么要做性能分析

Python 以开发效率高著称，但运行速度可能不如 C/Java。当你需要处理大量数据或追求低延迟时，**性能分析**帮你找到瓶颈，**优化策略**帮你提升速度。

### 性能分析工具链

| 工具 | 作用 | 使用方式 |
|------|------|----------|
| timeit | 精确计时 | \`timeit.timeit()\` |
| cProfile | 函数级性能分析 | \`cProfile.run()\` |
| pstats | 分析统计数据 | 排序/过滤 cProfile 输出 |
| line_profiler | 逐行计时 | \`@profile\` 装饰器 |
| memory_profiler | 内存分析 | \`@profile\` 装饰器 |
| sys.getsizeof | 对象大小 | \`sys.getsizeof(obj)\` |

### 常用优化策略

| 策略 | 原理 | 效果 |
|------|------|------|
| 列表推导式 | C 语言级循环 | 比 for 循环快 2-3 倍 |
| \`__slots__\` | 固定属性槽 | 节省 40-50% 内存 |
| \`lru_cache\` | 缓存函数结果 | 重复计算场景提速数倍 |
| 生成器 | 惰性计算 | 节省大量内存 |
| 字符串 join | 避免中间字符串 | 拼接快 10-100 倍 |
| 局部变量 | 减少查找开销 | 微优化 |
| 集合/字典 | O(1) 查找 | 代替列表 O(n) 查找 |

### timeit 精确计时

\`\`\`python
import timeit  # 导入模块 timeit

# 计时一段代码
t = timeit.timeit("sum(range(1000))", number=10000)  # 赋值变量 t
print(f"执行 10000 次，总耗时 {t:.4f} 秒")  # 打印输出到屏幕

# 计时函数
t = timeit.timeit(lambda: my_func(), number=1000)  # 赋值变量 t
\`\`\`

### cProfile 性能分析

\`\`\`python
import cProfile  # 导入模块 cProfile
cProfile.run("my_function()", sort="cumtime")  # 调用 cProfile.run()：运行
\`\`\`

### lru_cache 缓存

\`\`\`python
from functools import lru_cache  # 从 functools 导入 lru_cache

@lru_cache(maxsize=128)  # 应用装饰器 lru_cache
def fib(n):  # 定义函数 fib，参数：n
    if n < 2:  # 如果 n < 2
        return n  # 返回 n
    return fib(n-1) + fib(n-2)  # 返回 fib(n-1) + fib(n-2)
\`\`\`

下面的 demo 用多种工具对比不同写法的性能，直观展示优化效果。`,
    code: `# 性能分析与优化完整演示
import timeit
import cProfile
import pstats
import sys
import io
from functools import lru_cache

print("=" * 50)
print("    性能分析与优化演示")
print("=" * 50)

# ============ 1. timeit 精确计时 ============
print()
print("=== 1. timeit 精确计时 ===")

# 1.1 字符串方式
t1 = timeit.timeit("sum(range(1000))", number=10000)
print(f"sum(range(1000)) 执行10000次: {t1:.4f} 秒")

# 1.2 函数方式
def slow_sum(n):
    """慢速求和：for 循环逐个加"""
    total = 0
    for i in range(n):
        total += i
    return total

def fast_sum(n):
    """快速求和：内置 sum + range"""
    return sum(range(n))

t_slow = timeit.timeit(lambda: slow_sum(1000), number=10000)
t_fast = timeit.timeit(lambda: fast_sum(1000), number=10000)
print(f"slow_sum(1000) 10000次: {t_slow:.4f} 秒")
print(f"fast_sum(1000) 10000次: {t_fast:.4f} 秒")
print(f"内置 sum 快了 {t_slow/t_fast:.1f} 倍")

# ============ 2. 列表推导式 vs for 循环 ============
print()
print("=== 2. 列表推导式 vs for 循环 ===")

def square_list_for(n):
    """for 循环创建平方数列表"""
    result = []
    for i in range(n):
        result.append(i * i)
    return result

def square_list_comprehension(n):
    """列表推导式创建平方数列表"""
    return [i * i for i in range(n)]

n = 10000
t_for = timeit.timeit(lambda: square_list_for(n), number=1000)
t_comp = timeit.timeit(lambda: square_list_comprehension(n), number=1000)
print(f"for 循环 1000次: {t_for:.4f} 秒")
print(f"列表推导 1000次: {t_comp:.4f} 秒")
print(f"列表推导快 {t_for/t_comp:.1f} 倍")

# ============ 3. 字符串拼接优化 ============
print()
print("=== 3. 字符串拼接优化 ===")

def concat_plus(strings):
    """字符串 + 拼接（慢，每次创建新字符串）"""
    result = ""
    for s in strings:
        result += s
    return result

def concat_join(strings):
    """join 拼接（快，一次分配内存）"""
    return "".join(strings)

test_strings = ["hello"] * 1000
t_plus = timeit.timeit(lambda: concat_plus(test_strings), number=1000)
t_join = timeit.timeit(lambda: concat_join(test_strings), number=1000)
print(f"累加拼接 1000次: {t_plus:.4f} 秒")
print(f"join 拼接 1000次: {t_join:.4f} 秒")
print(f"join 快了 {t_plus/t_join:.1f} 倍")

# ============ 4. lru_cache 缓存 ============
print()
print("=== 4. lru_cache 缓存 ===")

# 无缓存版本
def fib_no_cache(n):
    """递归斐波那契（无缓存，指数级时间复杂度）"""
    if n < 2:
        return n
    return fib_no_cache(n - 1) + fib_no_cache(n - 2)

# 有缓存版本
@lru_cache(maxsize=None)
def fib_cached(n):
    """递归斐波那契（有缓存，线性时间复杂度）"""
    if n < 2:
        return n
    return fib_cached(n - 1) + fib_cached(n - 2)

# 测试小 n 值（大 n 值无缓存版本会非常慢）
n_val = 30
t_no_cache = timeit.timeit(lambda: fib_no_cache(n_val), number=1)
t_cached = timeit.timeit(lambda: fib_cached(n_val), number=1)
print(f"fib({n_val}) 无缓存: {t_no_cache:.4f} 秒")
print(f"fib({n_val}) 有缓存: {t_cached:.6f} 秒")
print(f"缓存加速了 {t_no_cache/t_cached:.0f} 倍!")

# 查看缓存信息
print(f"缓存命中: {fib_cached.cache_info().hits} 次")
print(f"缓存未命中: {fib_cached.cache_info().misses} 次")

# ============ 5. 生成器 vs 列表 内存对比 ============
print()
print("=== 5. 生成器 vs 列表 内存对比 ===")

# 列表方式：一次性创建所有元素
list_comp = [i * 2 for i in range(100000)]
list_size = sys.getsizeof(list_comp)
# 加上元素大小
total_list_size = list_size + sum(sys.getsizeof(x) for x in list_comp[:100]) * 1000
print(f"列表 [0..99999] 对象大小: {list_size:,} bytes")
print(f"列表含元素估算总大小: {total_list_size:,} bytes")

# 生成器方式：惰性计算，不存储全部元素
gen = (i * 2 for i in range(100000))
gen_size = sys.getsizeof(gen)
print(f"生成器对象大小: {gen_size} bytes")
print(f"内存节省: {total_list_size / gen_size:.0f} 倍")

# 验证生成器正常工作
print(f"生成器前5个元素: {[next(gen) for _ in range(5)]}")

# ============ 6. __slots__ 内存优化 ============
print()
print("=== 6. __slots__ 内存优化 ===")

class UserNormal:
    """普通类：使用 __dict__"""
    def __init__(self, name, age, email):
        self.name = name
        self.age = age
        self.email = email

class UserSlots:
    """使用 __slots__：固定属性槽"""
    __slots__ = ("name", "age", "email")
    def __init__(self, name, age, email):
        self.name = name
        self.age = age
        self.email = email

u_normal = UserNormal("小明", 18, "xm@test.com")
u_slots = UserSlots("小明", 18, "xm@test.com")

print(f"普通类实例大小: {sys.getsizeof(u_normal)} bytes")
print(f"普通类 __dict__ 大小: {sys.getsizeof(u_normal.__dict__)} bytes")
print(f"__slots__ 类实例大小: {sys.getsizeof(u_slots)} bytes")
print(f"节省: {sys.getsizeof(u_normal) + sys.getsizeof(u_normal.__dict__) - sys.getsizeof(u_slots)} bytes/实例")

# 批量创建对比
normal_list = [UserNormal("u", i, "e@t.com") for i in range(10000)]
slots_list = [UserSlots("u", i, "e@t.com") for i in range(10000)]
print(f"10000个普通对象总内存: {sys.getsizeof(normal_list) + sum(sys.getsizeof(u.__dict__) for u in normal_list):,} bytes")
print(f"10000个slots对象总内存: {sys.getsizeof(slots_list):,} bytes")

# ============ 7. 集合查找 vs 列表查找 ============
print()
print("=== 7. 集合查找 vs 列表查找 ===")

def list_lookup(items, target):
    """列表查找：O(n)"""
    return target in items

def set_lookup(items, target):
    """集合查找：O(1)"""
    return target in items

test_list = list(range(10000))
test_set = set(range(10000))
target = 9999

t_list = timeit.timeit(lambda: list_lookup(test_list, target), number=10000)
t_set = timeit.timeit(lambda: set_lookup(test_set, target), number=10000)
print(f"列表查找(最坏情况) 10000次: {t_list:.4f} 秒")
print(f"集合查找 10000次: {t_set:.4f} 秒")
print(f"集合查找快 {t_list/t_set:.0f} 倍")

# ============ 8. cProfile 性能分析 ============
print()
print("=== 8. cProfile 性能分析 ===")

def heavy_computation():
    """模拟复杂计算"""
    result = 0
    for i in range(10000):
        result += i * i
    return result

def cpu_bound_task():
    """CPU 密集型任务"""
    for _ in range(100):
        heavy_computation()
    return "完成"

def io_bound_task():
    """模拟 IO 密集型任务"""
    data = []
    for i in range(1000):
        data.append(str(i))
    return ",".join(data)

def main_task():
    """主任务：组合多个子任务"""
    cpu_bound_task()
    io_bound_task()
    return "全部完成"

# 运行 cProfile 分析
print("正在运行 cProfile 分析...")
profiler = cProfile.Profile()
profiler.enable()
main_task()
profiler.disable()

# 用 pstats 分析结果
print()
print("--- cProfile 分析结果（按累计时间排序）---")
s = io.StringIO()
ps = pstats.Stats(profiler, stream=s).sort_stats("cumulative")
ps.print_stats(10)  # 只打印前10条
print(s.getvalue())

# ============ 9. 优化建议总结 ============
print("=== 9. 性能优化原则 ===")
print("1. 先测量，再优化（不要盲目优化）")
print("2. 优化瓶颈（20%的代码消耗80%的时间）")
print("3. 使用内置函数和标准库（C语言实现）")
print("4. 选择合适的算法和数据结构")
print("5. 用缓存避免重复计算")
print("6. 用生成器节省内存")

print()
print("✅ 性能分析与优化演示完成！")`
  },
  {
    id: "py8-debug-prof",
    group: "数据库测试工程化",
    icon: "🐛",
    title: "调试技巧与 pdb",
    content: `## 调试的层次

| 层次 | 方法 | 适用场景 |
|------|------|----------|
| print 调试 | 打印变量值 | 快速定位简单问题 |
| logging 调试 | 分级日志 | 生产环境排错 |
| pdb 调试 | 交互式断点 | 复杂逻辑分析 |
| IDE 调试 | 图形化断点 | 日常开发 |
| traceback | 异常回溯分析 | 崩溃后定位 |

### pdb 常用命令

| 命令 | 简写 | 作用 |
|------|------|------|
| break | b | 设置断点 |
| continue | c | 继续执行到下一断点 |
| next | n | 下一行（不进入函数） |
| step | s | 进入函数内部 |
| return | r | 执行到当前函数返回 |
| print | p | 打印变量值 |
| pp | pp | 美化打印 |
| list | l | 显示当前代码上下文 |
| where | w | 查看调用栈 |
| up / down | u / d | 在调用栈中上下移动 |
| quit | q | 退出调试 |

### pdb.set_trace() 设置断点

\`\`\`python
import pdb  # 导入模块 pdb

def buggy_function(x):  # 定义函数 buggy_function，参数：x
    result = x * 2  # 赋值变量 result
    pdb.set_trace()  # 程序停在这里，进入交互模式
    result += 10  # result 累加
    return result  # 返回 result
\`\`\`

### traceback 模块

\`\`\`python
import traceback  # 导入模块 traceback

try:  # 尝试执行可能出错的代码
    1 / 0  # 执行操作
except:  # 捕获异常
    traceback.print_exc()  # 打印完整异常回溯
    # 或获取字符串
    info = traceback.format_exc()  # 赋值变量 info
\`\`\`

### logging 分级调试

\`\`\`python
import logging  # 导入模块 logging
logging.basicConfig(level=logging.DEBUG)  # 调用 logging.basicConfig()

logging.debug("详细调试信息")  # 调用 logging.debug()
logging.info("一般信息")  # 调用 logging.info()
logging.warning("警告信息")  # 调用 logging.warning()
logging.error("错误信息")  # 调用 logging.error()
logging.critical("严重错误")  # 调用 logging.critical()
\`\`\`

### sys.excepthook 全局异常捕获

\`\`\`python
import sys  # 导入模块 sys

def my_excepthook(type, value, tb):  # 定义函数 my_excepthook，参数：type, value, tb
    print(f"捕获到未处理异常: {type.__name__}: {value}")  # 打印输出到屏幕
    traceback.print_tb(tb)  # 调用 traceback.print_tb()

sys.excepthook = my_excepthook  # 执行操作
\`\`\`

> ⚠️ pdb 是交互式工具，在沙箱中无法真正交互。下面的 demo 用 Python 模拟 pdb 的核心功能，并展示 traceback、logging 等调试技巧的实际用法。`,
    code: `# 调试技巧与 pdb 模拟演示
import sys
import traceback
import logging
import pprint

print("=" * 50)
print("    调试技巧与 pdb 模拟演示")
print("=" * 50)

# ============ 1. print 调试技巧 ============
print()
print("=== 1. print 调试技巧 ===")

def calculate_discount(price, user_type):
    """计算折扣价（故意有点复杂的逻辑）"""
    # 调试技巧：在关键位置打印中间变量
    print(f"  [DEBUG] 输入: price={price}, user_type={user_type}")

    if user_type == "vip":
        discount = 0.8
    elif user_type == "regular":
        discount = 0.9
    else:
        discount = 1.0

    print(f"  [DEBUG] 折扣: {discount}")

    final_price = price * discount

    # 用 f-string 的 {x=} 调试（Python 3.8+）
    print(f"  [DEBUG] {final_price=}")

    return round(final_price, 2)

print("VIP用户价格:")
calculate_discount(100, "vip")
print("普通用户价格:")
calculate_discount(100, "regular")
print("新用户价格:")
calculate_discount(100, "new")

# ============ 2. pprint 美化输出 ============
print()
print("=== 2. pprint 美化输出 ===")

complex_data = {
    "users": [
        {"id": 1, "name": "小明", "scores": {"math": 95, "english": 88}},
        {"id": 2, "name": "小红", "scores": {"math": 78, "english": 92}},
        {"id": 3, "name": "小刚", "scores": {"math": 85, "english": 76}},
    ],
    "settings": {
        "theme": "dark",
        "language": "zh-CN",
        "notifications": {"email": True, "sms": False, "push": True},
    },
    "metadata": {"version": "2.1.0", "created": "2024-01-15", "tags": ["prod", "stable"]},
}

print("普通 print 输出:")
print(complex_data)
print()
print("pprint 美化输出:")
pprint.pprint(complex_data, width=60, sort_dicts=True)

# ============ 3. traceback 异常回溯 ============
print()
print("=== 3. traceback 异常回溯 ===")

def level3():
    """最底层函数，故意抛异常"""
    x = 0
    return 10 / x  # 除零错误

def level2():
    """中间层函数"""
    return level3()

def level1():
    """顶层函数"""
    return level2()

print("--- 捕获并打印完整回溯 ---")
try:
    level1()
except ZeroDivisionError as e:
    print(f"异常类型: {type(e).__name__}")
    print(f"异常信息: {e}")
    print()
    print("完整调用栈:")
    traceback.print_exc(limit=5)

# 获取回溯字符串
print()
print("--- traceback.format_exc() 获取字符串 ---")
try:
    level1()
except:
    tb_str = traceback.format_exc()
    # 只打印关键行
    lines = tb_str.strip().split("\\n")
    for line in lines:
        print(f"  {line}")

# ============ 4. sys.excepthook 全局异常处理 ============
print()
print("=== 4. sys.excepthook 全局异常处理 ===")

# 保存原始 hook
original_hook = sys.excepthook

def custom_excepthook(exc_type, exc_value, exc_tb):
    """自定义全局异常处理器"""
    print()
    print("=" * 40)
    print("  [全局异常处理器] 捕获到未处理异常!")
    print("=" * 40)
    print(f"  类型: {exc_type.__name__}")
    print(f"  信息: {exc_value}")
    print(f"  文件: {exc_tb.tb_frame.f_code.co_filename}")
    print(f"  行号: {exc_tb.tb_lineno}")
    print("=" * 40)

# 设置自定义 hook
sys.excepthook = custom_excepthook

# 模拟未处理异常（在 try 外触发）
print("触发未处理异常演示:")
try:
    # 触发一个异常然后立即捕获，避免程序崩溃
    raise ValueError("这是一条会被全局hook捕获的异常")
except ValueError:
    # 手动调用 excepthook 演示效果
    exc_type, exc_value, exc_tb = sys.exc_info()
    custom_excepthook(exc_type, exc_value, exc_tb)

# 恢复原始 hook
sys.excepthook = original_hook

# ============ 5. logging 分级调试 ============
print()
print("=== 5. logging 分级调试 ===")

# 配置 logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)

logger = logging.getLogger("MyApp")

def process_order(order_id, items):
    """模拟处理订单，用 logging 记录流程"""
    logger.debug(f"开始处理订单 #{order_id}")
    logger.info(f"订单 #{order_id} 包含 {len(items)} 个商品")

    total = 0
    for item, price in items:
        logger.debug(f"  处理商品: {item}, 价格: {price}")
        if price < 0:
            logger.warning(f"商品 {item} 价格为负数: {price}")
        total += price

    if total > 1000:
        logger.info(f"订单 #{order_id} 为大额订单，总价: {total}")
    elif total <= 0:
        logger.error(f"订单 #{order_id} 总价为0，可能异常!")

    logger.debug(f"订单 #{order_id} 处理完成，总价: {total}")
    return total

# 正常订单
print("正常订单处理:")
process_order(1001, [("键盘", 299), ("鼠标", 99), ("鼠标垫", 29)])

# 异常订单（价格为负）
print()
print("异常订单处理:")
process_order(1002, [("测试商品", -10), ("正常商品", 50)])

# ============ 6. 模拟 pdb 核心功能 ============
print()
print("=== 6. 模拟 pdb 核心功能 ===")

class SimpleDebugger:
    """简化的 pdb 模拟器，展示核心概念"""

    def __init__(self):
        self.breakpoints = set()
        self.variables = {}

    def set_break(self, line_no):
        """设置断点（模拟 pdb 的 break 命令）"""
        self.breakpoints.add(line_no)
        print(f"  断点已设置在行 {line_no}")

    def trace_function(self, func, *args, **kwargs):
        """模拟单步跟踪一个函数"""
        print(f"  [跟踪] 进入函数: {func.__name__}")
        print(f"  [跟踪] 参数: args={args}, kwargs={kwargs}")
        result = func(*args, **kwargs)
        print(f"  [跟踪] 返回值: {result}")
        print(f"  [跟踪] 退出函数: {func.__name__}")
        return result

    def inspect_variables(self):
        """查看当前变量（模拟 pdb 的 p 命令）"""
        print("  [查看] 当前变量:")
        for name, val in self.variables.items():
            print(f"    {name} = {val!r}")

    def show_stack(self):
        """查看调用栈（模拟 pdb 的 w 命令）"""
        print("  [调用栈] 当前帧链:")
        for i, frame_info in enumerate(traceback.extract_stack()[:-1]):
            print(f"    #{i}: {frame_info.filename}:{frame_info.lineno} "
                  f"in {frame_info.name}")

    def where_am_i(self, func_name, line_no):
        """显示当前位置（模拟 pdb 的 l 命令）"""
        print(f"  [位置] 当前在 {func_name} 的第 {line_no} 行")


debugger = SimpleDebugger()

# 模拟 pdb 调试流程
print("模拟 pdb 调试流程:")
print()

# 1. 设置断点
print("1. 设置断点 (b 命令):")
debugger.set_break(10)
debugger.set_break(25)

# 2. 跟踪函数
print()
print("2. 跟踪函数 (s 命令):")
def add_and_multiply(a, b):
    """被调试的函数"""
    debugger.variables["a"] = a
    debugger.variables["b"] = b
    added = a + b
    debugger.variables["added"] = added
    multiplied = a * b
    debugger.variables["multiplied"] = multiplied
    return added, multiplied

result = debugger.trace_function(add_and_multiply, 3, 5)

# 3. 查看变量
print()
print("3. 查看变量 (p 命令):")
debugger.inspect_variables()

# 4. 查看调用栈
print()
print("4. 查看调用栈 (w 命令):")
debugger.show_stack()

# 5. 显示位置
print()
print("5. 显示当前位置 (l 命令):")
debugger.where_am_i("add_and_multiply", 15)

# ============ 7. 常见调试技巧总结 ============
print()
print("=== 7. 调试技巧总结 ===")
print("pdb 实际使用方式:")
print("  方式1: 代码中插入 import pdb; pdb.set_trace()")
print("  方式2: python3 -m pdb script.py  (从开头调试)")
print("  方式3: python3 -m pdb -c continue script.py (遇异常中断)")
print()
print("常用 pdb 命令速记:")
print("  n = 下一行, s = 进入函数, c = 继续")
print("  p var = 打印变量, pp var = 美化打印")
print("  l = 看代码, w = 调用栈, q = 退出")
print("  b 行号 = 设断点, cl = 清断点")
print()
print("调试哲学:")
print("  1. 先理解问题，再动手调试")
print("  2. 二分法定位：不断缩小问题范围")
print("  3. 橡皮鸭调试法：向别人解释代码")
print("  4. 写测试来复现 bug")

print()
print("✅ 调试技巧与 pdb 演示完成！")`
  },
  {
    id: "py8-proj-structure",
    group: "数据库测试工程化",
    icon: "🏗️",
    title: "项目结构与工程最佳实践",
    content: `## 为什么需要规范的项目结构

一个规范的项目结构让团队协作更顺畅，新人上手更快，工具链（打包、测试、CI/CD）更容易配置。混乱的项目结构是技术债务的主要来源。

### 推荐目录结构（src 布局）

\`\`\`
my_project/
├── src/                    # 源代码（src 布局）
│   └── my_package/
│       ├── __init__.py
│       ├── main.py
│       ├── core/
│       │   ├── __init__.py
│       │   └── engine.py
│       └── utils/
│           ├── __init__.py
│           └── helpers.py
├── tests/                  # 测试代码
│   ├── __init__.py
│   ├── test_main.py
│   └── conftest.py
├── docs/                   # 文档
├── scripts/                # 辅助脚本
├── pyproject.toml          # 项目配置（统一入口）
├── README.md
├── LICENSE
└── .gitignore
\`\`\`

### src-layout vs flat-layout

| 布局 | 结构 | 优点 | 缺点 |
|------|------|------|------|
| src-layout | 源码在 src/ 下 | 避免意外导入本地代码 | 需要 pip install -e . |
| flat-layout | 源码在项目根目录 | 简单直接 | 容易导入错误 |

### pyproject.toml 统一配置

\`\`\`toml
[build-system]
requires = ["setuptools>=64"]
build-backend = "setuptools.backends._legacy:_Backend"

[project]
name = "my_project"
version = "0.1.0"
requires-python = ">=3.10"

[project.optional-dependencies]
dev = ["pytest", "black", "flake8"]

[tool.black]
line-length = 88

[tool.pytest.ini_options]
testpaths = ["tests"]
\`\`\`

### 虚拟环境与依赖管理

1. **python3 -m venv .venv**：创建虚拟环境
2. **pip install -e .**：开发模式安装（修改代码立即生效）
3. **pip freeze > requirements.txt**：锁定依赖版本

### 代码风格工具

| 工具 | 作用 | 使用 |
|------|------|------|
| Black | 自动格式化 | \`black src/\` |
| Flake8 | 代码检查（PEP 8） | \`flake8 src/\` |
| isort | 导入排序 | \`isort src/\` |
| mypy | 类型检查 | \`mypy src/\` |
| pre-commit | Git 提交前自动检查 | 配置文件 |

### pre-commit 配置示例

\`\`\`yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.1.0
    hooks:
      - id: black
  - repo: https://github.com/PyCQA/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
\`\`\`

### CI/CD 概念

- **CI（持续集成）**：每次代码提交自动运行测试、检查
- **CD（持续交付/部署）**：自动构建、测试、部署到生产环境
- 常用平台：GitHub Actions、GitLab CI、Jenkins

### Git 分支策略

| 策略 | 说明 |
|------|------|
| Git Flow | main + develop + feature + release + hotfix |
| GitHub Flow | main + feature 分支，PR 合并 |
| Trunk-Based | 所有人直接提交到 main，短分支 |

### 项目从零到发布完整流程

1. 创建项目目录结构和虚拟环境
2. 编写 pyproject.toml
3. 开发核心代码
4. 编写测试
5. 配置 pre-commit 和 CI
6. 编写 README 和文档
7. 发布到 PyPI

下面的 demo 用 Python 代码模拟一个完整的项目初始化流程，展示所有关键配置。`,
    code: `# 项目结构与工程最佳实践完整演示
# 模拟项目初始化、配置生成、检查流程

import os
import sys
import json
from pathlib import Path

print("=" * 50)
print("  项目结构与工程最佳实践演示")
print("=" * 50)

# ============ 1. 项目目录结构 ============
print()
print("=== 1. 推荐项目目录结构 ===")

project_structure = {
    "src": {
        "my_package": {
            "__init__.py": None,
            "main.py": None,
            "core": {
                "__init__.py": None,
                "engine.py": None,
            },
            "utils": {
                "__init__.py": None,
                "helpers.py": None,
            },
        },
    },
    "tests": {
        "__init__.py": None,
        "test_main.py": None,
        "conftest.py": None,
    },
    "docs": {},
    "scripts": {},
    "pyproject.toml": None,
    "README.md": None,
    "LICENSE": None,
    ".gitignore": None,
    ".pre-commit-config.yaml": None,
}

def print_tree(structure, prefix="", is_last=True):
    """打印目录树结构"""
    for i, (name, children) in enumerate(structure.items()):
        connector = "└── " if i == len(structure) - 1 else "├── "
        print(f"{prefix}{connector}{name}")
        if isinstance(children, dict):
            extension = "    " if i == len(structure) - 1 else "│   "
            print_tree(children, prefix + extension,
                       i == len(structure) - 1)

print("my_project/")
print_tree(project_structure)

# ============ 2. pyproject.toml 配置 ============
print()
print("=== 2. pyproject.toml 配置示例 ===")

pyproject_content = """[build-system]
requires = ["setuptools>=64", "wheel"]
build-backend = "setuptools.backends._legacy:_Backend"

[project]
name = "my_project"
version = "0.1.0"
description = "一个示例项目"
readme = "README.md"
requires-python = ">=3.10"
license = {text = "MIT"}
authors = [
    {name = "小明", email = "xiaoming@example.com"},
]
keywords = ["example", "demo"]
classifiers = [
    "Development Status :: 3 - Alpha",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4",
    "pytest-cov>=4.1",
    "black>=23.0",
    "flake8>=6.0",
    "mypy>=1.5",
    "isort>=5.12",
]

[tool.black]
line-length = 88
target-version = ["py310"]

[tool.isort]
profile = "black"

[tool.mypy]
strict = true
warn_return_any = true
disallow_untyped_defs = true

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-v --tb=short"
"""

print(pyproject_content)

# ============ 3. .gitignore 内容 ============
print("=== 3. .gitignore 推荐内容 ===")

gitignore_content = """# Python
__pycache__/
*.py[cod]
*.so
*.egg-info/
dist/
build/
.eggs/

# 虚拟环境
venv/
.venv/
env/

# IDE
.vscode/
.idea/
*.swp
*.swo

# 环境变量
.env
.env.local

# 测试覆盖率
htmlcov/
.coverage
.coverage.*

# 操作系统
.DS_Store
Thumbs.db
"""

print(gitignore_content)

# ============ 4. pre-commit 配置 ============
print("=== 4. .pre-commit-config.yaml ===")

precommit_content = """repos:
  - repo: https://github.com/psf/black
    rev: 23.9.1
    hooks:
      - id: black
        language_version: python3.10

  - repo: https://github.com/PyCQA/flake8
    rev: 6.1.0
    hooks:
      - id: flake8
        args: [--max-line-length=88]

  - repo: https://github.com/PyCQA/isort
    rev: 5.12.0
    hooks:
      - id: isort
        args: [--profile=black]

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-toml
"""

print(precommit_content)

# ============ 5. src-layout 优势演示 ============
print("=== 5. src-layout 优势演示 ===")

print("src-layout 的好处:")
print("  1. 避免意外导入项目根目录的代码")
print("  2. 强制使用 pip install -e . 安装（模拟真实安装）")
print("  3. 测试时导入路径与用户安装后一致")
print("  4. 目录结构更清晰，源码与配置分离")

print()
print("flat-layout vs src-layout 对比:")
layout_comparison = [
    ("根目录清晰度", "混杂", "清晰"),
    ("导入安全性", "可能误导入", "强制安装后才能导入"),
    ("测试可靠性", "可能测的是本地代码", "测试真实安装路径"),
    ("打包正确性", "容易漏文件", "明确只打包 src/"),
    ("推荐度", "小型脚本", "正式项目 ✓"),
]
for item in layout_comparison:
    print(f"  {item[0]:12} | flat: {item[1]:12} | src: {item[2]:12}")

# ============ 6. 虚拟环境管理 ============
print()
print("=== 6. 虚拟环境管理 ===")

print("创建虚拟环境:")
print("  python3 -m venv .venv")
print("  source .venv/bin/activate  # macOS/Linux")
print("  .venv\\\\Scripts\\\\activate     # Windows")
print()
print("开发模式安装:")
print("  pip install -e .            # 安装当前项目（可编辑模式）")
print("  pip install -e '.[dev]'     # 安装含开发依赖")
print()
print("依赖管理:")
print("  pip freeze > requirements.txt        # 导出依赖")
print("  pip install -r requirements.txt      # 安装依赖")
print()
print("poetry 方式（推荐）:")
print("  poetry new my_project       # 创建项目")
print("  poetry add requests         # 添加依赖")
print("  poetry add -D pytest        # 添加开发依赖")
print("  poetry install              # 安装所有依赖")

# ============ 7. Git 分支策略 ============
print()
print("=== 7. Git 分支策略 ===")

print("GitHub Flow（推荐）:")
print("  main  ← 始终保持可部署状态")
print("    └── feature/xxx  ← 从 main 拉出")
print("          └── PR → main  ← 合并回去")
print()
print("分支命名规范:")
print("  feature/用户登录       # 新功能")
print("  fix/修复支付bug        # 修复")
print("  docs/更新API文档       # 文档")
print("  refactor/重构用户模块   # 重构")
print("  release/1.0.0          # 发布")

# ============ 8. CI/CD 概念 ============
print()
print("=== 8. CI/CD 概念 ===")

print("CI（持续集成）- GitHub Actions 示例:")
actions_example = """name: Python CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: pip install -e '.[dev]'
      - run: pytest --cov=src
      - run: black --check src/
      - run: flake8 src/
      - run: mypy src/
"""
print(actions_example)

print("CD（持续部署）:")
print("  1. 代码合并到 main")
print("  2. CI 自动运行测试")
print("  3. 测试通过后自动构建")
print("  4. 自动部署到测试环境")
print("  5. 审批后部署到生产环境")

# ============ 9. 项目从零到发布完整流程 ============
print("=== 9. 项目从零到发布完整流程 ===")

steps = [
    ("1. 初始化", "创建项目目录, git init, python3 -m venv .venv"),
    ("2. 配置", "编写 pyproject.toml, .gitignore, pre-commit"),
    ("3. 开发", "编写 src/ 下的核心代码, 遵循 PEP 8"),
    ("4. 测试", "编写 tests/, 覆盖率 > 80%"),
    ("5. 质量", "pre-commit, black, flake8, mypy"),
    ("6. 文档", "README.md, docstrings, API 文档"),
    ("7. CI/CD", "GitHub Actions 自动测试检查"),
    ("8. 发布", "git tag v1.0.0, 发布到 PyPI"),
]

for step, detail in steps:
    print(f"  {step}: {detail}")

# ============ 10. 编码规范总结 ============
print()
print("=== 10. Python 编码规范总结 ===")

print("PEP 8 核心规范:")
rules = [
    ("缩进", "4个空格，不用Tab"),
    ("行宽", "不超过79字符（文档72字符）"),
    ("空行", "顶级函数/类之间空2行，方法间空1行"),
    ("导入", "标准库 → 第三方 → 本地，分行导入"),
    ("命名", "变量/函数用 snake_case，类用 PascalCase"),
    ("常量", "UPPER_CASE 全大写"),
    ("私有", "前缀一个下划线 _private"),
    ("注释", "说明为什么，不重复代码"),
    ("类型", "使用类型提示 Type Hints"),
    ("文档", "公共API用 docstring (三引号)"),
]
for rule, desc in rules:
    print(f"  {rule:6}: {desc}")

print()
print("✅ 项目结构与工程最佳实践演示完成！")
print()
print("💡 记住：好的工程实践让开发过程更可控、更高效、")
print("   更愉快。花时间建立规范，长期收益远超投入。")`
  }
];