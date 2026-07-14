// =============================================================
// FastAPI 全栈实战 - 第 2 批章节（数据持久化与 SQLAlchemy 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   ff-sqlite:     SQLite 数据库入门
//   ff-sqlalchemy: SQLAlchemy ORM 基础
//   ff-models:     模型设计与关系
//   ff-session:    数据库会话管理
//   ff-di:         依赖注入实战
// =============================================================

export const chapters = [
  // ============================================================
  // 第 6 章：SQLite 数据库入门
  // ============================================================
  {
    id: "ff-sqlite",
    group: "数据持久化与 SQLAlchemy",
    icon: "💾",
    title: "SQLite 数据库入门",
    content: `# SQLite 数据库入门

## 一、为什么选 SQLite

我们要给 TaskBoard 加上数据持久化——重启服务后数据还在。市面上数据库很多，本教程选 **SQLite**，原因：

| 维度 | SQLite | MySQL / PostgreSQL |
|------|--------|-------------------|
| 安装 | Python 自带，零配置 | 需单独安装服务 |
| 存储 | 单文件（如 \`taskboard.db\`） | 独立服务进程 |
| 并发 | 单写多读，适合教学 | 高并发 |
| 适用场景 | 学习、原型、小型应用 | 生产环境 |

**学习友好**：不用装服务、不用配密码、文件即数据库。学完原理后，把连接字符串改一下就能切到 PostgreSQL，**代码几乎不用动**。

## 二、Python 自带的 sqlite3 模块

Python 标准库自带 \`sqlite3\`，连 import 都不用装：

\`\`\`python
import sqlite3

# 连接数据库（文件不存在会自动创建）
conn = sqlite3.connect("taskboard.db")

# 创建一个游标，用来执行 SQL
cursor = conn.cursor()

# 建表
cursor.execute("""
    CREATE TABLE IF NOT EXISTS boards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        color TEXT DEFAULT 'blue',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")

# 插入数据
cursor.execute(
    "INSERT INTO boards (title, color) VALUES (?, ?)",
    ("工作", "green"),
)

# 提交事务（不提交的话修改不生效）
conn.commit()

# 查询
cursor.execute("SELECT id, title, color FROM boards")
for row in cursor.fetchall():
    print(row)

# 关闭连接
conn.close()
\`\`\`

注意 SQL 里的 \`?\` 占位符——**永远不要用字符串拼接 SQL**，会有 SQL 注入风险：

\`\`\`python
# ❌ 危险！SQL 注入
title = "'; DROP TABLE boards; --"
cursor.execute(f"INSERT INTO boards (title) VALUES ('{title}')")

# ✅ 安全：用参数化查询
cursor.execute("INSERT INTO boards (title) VALUES (?)", (title,))
\`\`\`

## 三、内存数据库：测试的好帮手

SQLite 支持"内存数据库"——把数据库整个放在 RAM 里，连接断开就消失：

\`\`\`python
# :memory: 表示内存数据库
conn = sqlite3.connect(":memory:")
\`\`\`

**用途**：写测试时不想留下文件，用内存数据库最干净。每个连接是独立的内存库，互不干扰。

## 四、Demo：原生 sqlite3 完整流程

\`\`\`python
# Demo：用原生 sqlite3 模拟看板的增删改查
import sqlite3

# 用内存数据库，跑完即销毁，适合 demo
conn = sqlite3.connect(":memory:")
# row_factory 让查询结果返回 dict-like 对象，按字段名取值更直观
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# ===== 1. 建表 =====
cursor.execute("""
    CREATE TABLE boards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        color TEXT DEFAULT 'blue',
        archived INTEGER DEFAULT 0,  -- SQLite 用 0/1 表示 bool
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")

# ===== 2. 插入数据 =====
# executemany 一次插入多条
boards = [
    ("工作看板", "green"),
    ("学习看板", "blue"),
    ("生活看板", "yellow"),
]
cursor.executemany(
    "INSERT INTO boards (title, color) VALUES (?, ?)",
    boards,
)
conn.commit()
print(f"插入 {cursor.rowcount} 条记录")

# ===== 3. 查询所有 =====
print("\\n=== 所有看板 ===")
cursor.execute("SELECT * FROM boards")
for row in cursor.fetchall():
    print(f"  id={row['id']}, title={row['title']}, color={row['color']}")

# ===== 4. 条件查询 =====
print("\\n=== 颜色为 green 的看板 ===")
cursor.execute("SELECT * FROM boards WHERE color = ?", ("green",))
for row in cursor.fetchall():
    print(f"  {row['title']}")

# ===== 5. 更新 =====
cursor.execute(
    "UPDATE boards SET color = ? WHERE title = ?",
    ("red", "工作看板"),
)
conn.commit()
print("\\n=== 更新后 ===")
cursor.execute("SELECT title, color FROM boards WHERE title = ?", ("工作看板",))
print(f"  {dict(cursor.fetchone())}")

# ===== 6. 删除 =====
cursor.execute("DELETE FROM boards WHERE title = ?", ("生活看板",))
conn.commit()
print(f"\\n删除后剩余 {cursor.execute('SELECT COUNT(*) FROM boards').fetchone()[0]} 条")

# ===== 7. 事务回滚示例 =====
print("\\n=== 事务回滚演示 ===")
try:
    cursor.execute("INSERT INTO boards (title) VALUES (?)", ("测试1",))
    cursor.execute("INSERT INTO boards (title) VALUES (?)", ("测试2",))
    # 故意制造一个错误：插入重复 id
    cursor.execute("INSERT INTO boards (id, title) VALUES (1, '冲突')")
    conn.commit()
except sqlite3.IntegrityError as e:
    print(f"  发生错误：{e}")
    print("  执行 ROLLBACK，本次事务的所有修改撤销")
    conn.rollback()

# 验证：测试1、测试2 应该都没有插入成功
count = cursor.execute("SELECT COUNT(*) FROM boards").fetchone()[0]
print(f"  当前总数：{count}（说明回滚成功）")

conn.close()
\`\`\`

运行这个 demo，重点理解：

1. **参数化查询**：\`?\` 占位符防注入
2. **事务**：\`commit()\` 提交，\`rollback()\` 回滚
3. **row_factory**：让查询结果可以按字段名取值

## 五、原生 SQL 的痛点

写多了你会发现原生 SQL 有这些问题：

| 痛点 | 例子 |
|------|------|
| SQL 字符串易错 | 拼接复杂 SQL 时容易少空格、少引号 |
| 手动映射字段 | \`row["title"]\` 这种取值不直观，没有 IDE 提示 |
| 跨数据库不兼容 | SQLite 用 \`?\`，MySQL 用 \`%s\`，PostgreSQL 用 \`%s\` |
| 没有类型安全 | \`row["age"]\` 是 int 还是 str？不知道 |
| 关联查询麻烦 | 多表 JOIN 写起来又长又乱 |

**解决方案：ORM（对象关系映射）**。下一章我们学 SQLAlchemy，把数据库表映射成 Python 类，把 SQL 操作变成方法调用。

## 六、SQLite 的限制（提前知道）

| 限制 | 说明 |
|------|------|
| 单写并发 | 同时只能有一个写操作，高并发写场景不适用 |
| 无用户管理 | 没有账号密码，靠文件权限保护 |
| 类型松散 | 类型声明更像"建议"，存错类型不会报错（除非用 STRICT 模式） |

教学项目完全够用。生产环境切到 PostgreSQL，把 \`DATABASE_URL\` 改一下即可。

## 七、本章小结

- SQLite 是文件型数据库，Python 自带，零配置
- \`sqlite3\` 模块提供原生访问，用 \`?\` 占位符防注入
- 事务用 \`commit\` / \`rollback\` 控制原子性
- 原生 SQL 写起来繁琐、易错，下章用 SQLAlchemy ORM 解决`,
  },

  // ============================================================
  // 第 7 章：SQLAlchemy ORM 基础
  // ============================================================
  {
    id: "ff-sqlalchemy",
    group: "数据持久化与 SQLAlchemy",
    icon: "🏛️",
    title: "SQLAlchemy ORM 基础",
    content: `# SQLAlchemy ORM 基础

## 一、什么是 ORM

**ORM（Object-Relational Mapping，对象关系映射）** 把数据库表映射成 Python 类：

\`\`\`
数据库表 boards       ←→    Python 类 Board
表里的字段            ←→    类的属性
表里的一行数据        ←→    类的一个实例
SQL 查询              ←→    方法调用
\`\`\`

对比一下：

\`\`\`python
# 原生 SQL：手动拼字符串，手动取字段
cursor.execute("SELECT id, title FROM boards WHERE id = ?", (1,))
row = cursor.fetchone()
board_title = row["title"]

# ORM：操作对象，IDE 有提示，类型安全
board = session.get(Board, 1)
board_title = board.title
\`\`\`

## 二、SQLAlchemy 2.0 架构

SQLAlchemy 2.0 是 2023 年发布的大版本，引入了**类型注解**支持，与 FastAPI 风格一致：

\`\`\`
SQLAlchemy 2.0
├── Core        底层 SQL 表达式层（连接池、SQL 构造）
├── ORM         对象关系映射（本教程重点）
└── Mapped 注解  2.0 新特性，类型即字段定义
\`\`\`

安装：

\`\`\`bash
pip install "sqlalchemy>=2.0"
\`\`\`

## 三、核心组件

### 3.1 Engine（引擎）

引擎是数据库连接的"工厂"，管理连接池：

\`\`\`python
from sqlalchemy import create_engine

# 创建引擎：sqlite:///路径 表示相对路径，sqlite:////绝对路径
# echo=True 会打印执行的 SQL，方便学习
engine = create_engine(
    "sqlite:///taskboard.db",
    echo=True,                # 打印 SQL（生产环境关掉）
    connect_args={"check_same_thread": False},  # SQLite 多线程必须
)
\`\`\`

### 3.2 Base（基类）

所有模型继承 \`Base\`，\`Base\` 维护着"所有表的元数据"：

\`\`\`python
from sqlalchemy.orm import DeclarativeBase

# SQLAlchemy 2.0 推荐用 DeclarativeBase
class Base(DeclarativeBase):
    pass
\`\`\`

### 3.3 Model（模型）

用 \`Mapped\` 注解定义字段：

\`\`\`python
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer

class Board(Base):
    __tablename__ = "boards"  # 数据库表名

    # Mapped[int] 是类型注解，mapped_column(...) 是字段配置
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100))
\`\`\`

### 3.4 Session（会话）

Session 是"工作单元"，所有数据库操作都通过它：

\`\`\`python
from sqlalchemy.orm import Session

with Session(engine) as session:
    board = session.get(Board, 1)  # 查询
    session.add(new_board)          # 添加
    session.commit()                # 提交
\`\`\`

## 四、Demo：完整的 ORM 流程

\`\`\`python
# Demo：用 SQLAlchemy 2.0 操作看板表
from sqlalchemy import create_engine, String, Integer, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

# ===== 1. 定义 Base 与模型 =====

class Base(DeclarativeBase):
    pass

class Board(Base):
    __tablename__ = "boards"

    # primary_key=True 表示主键
    # autoincrement=True 自增（SQLite 默认主键就自增）
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # String(100) 限制字符串长度
    # nullable=False 表示 NOT NULL（Mapped[str] 默认就是 nullable=False）
    title: Mapped[str] = mapped_column(String(100))

    # Mapped[str | None] 表示可选字段（nullable=True）
    description: Mapped[str | None] = mapped_column(String(500), default=None)

    # 默认值用 default 参数
    color: Mapped[str] = mapped_column(String(20), default="blue")

    # archived: Mapped[bool] = mapped_column(default=False)
    # SQLite 没有 bool，SQLAlchemy 会用 INTEGER (0/1) 模拟
    archived: Mapped[bool] = mapped_column(default=False)

    def __repr__(self):
        return f"<Board id={self.id} title={self.title!r}>"

# ===== 2. 创建引擎 + 建表 =====

# 用内存数据库，demo 跑完就销毁
engine = create_engine(
    "sqlite:///:memory:",
    echo=False,  # 学习时可以改成 True 看执行的 SQL
    connect_args={"check_same_thread": False},
)

# Base.metadata.create_all 会创建所有继承 Base 的表
Base.metadata.create_all(engine)

# ===== 3. 增（Create）=====

with Session(engine) as session:
    # 创建对象 = 准备一行数据
    b1 = Board(title="工作", color="green")
    b2 = Board(title="学习", description="学习计划", color="blue")
    b3 = Board(title="生活")

    # add_all 一次添加多个
    session.add_all([b1, b2, b3])

    # commit 后才会真正写入数据库
    # commit 时 SQLAlchemy 会自动获取自增 id 赋值给对象
    session.commit()

    # 现在 b1.id 已经有值了（之前是 None）
    print(f"插入后 b1.id = {b1.id}, b2.id = {b2.id}, b3.id = {b3.id}")

# ===== 4. 查（Read）=====

with Session(engine) as session:
    # 4.1 按主键查：session.get(模型, id)
    board = session.get(Board, 1)
    print(f"\\n按 id 查：{board}")

    # 4.2 条件查询：select + where
    # SQLAlchemy 2.0 推荐用 select() 风格（v1 是 query()）
    stmt = select(Board).where(Board.color == "blue")
    blue_boards = session.scalars(stmt).all()  # .scalars() 取第一列
    print(f"蓝色看板：{blue_boards}")

    # 4.3 多条件查询：where 链式
    stmt = select(Board).where(
        Board.archived == False,
        Board.color.in_(["green", "blue"]),
    )
    results = session.scalars(stmt).all()
    print(f"未归档且颜色为 green/blue：{results}")

    # 4.4 排序 + 限制
    stmt = select(Board).order_by(Board.id.desc()).limit(2)
    recent = session.scalars(stmt).all()
    print(f"按 id 倒序前 2：{recent}")

# ===== 5. 改（Update）=====

with Session(engine) as session:
    # 先查出来，改属性，commit 自动同步
    board = session.get(Board, 1)
    print(f"\\n改之前：title={board.title}, color={board.color}")

    board.title = "工作-改名"
    board.color = "red"
    session.commit()  # commit 时自动 UPDATE

    # 验证
    board = session.get(Board, 1)
    print(f"改之后：title={board.title}, color={board.color}")

# ===== 6. 删（Delete）=====

with Session(engine) as session:
    board = session.get(Board, 3)
    print(f"\\n删除：{board}")
    session.delete(board)
    session.commit()

    # 验证
    count = session.scalar(select(Board).where(Board.id == 3))
    print(f"删除后再查 id=3：{count}")  # None

    total = session.scalar(
        select(Board).where()  # 空 where 返回所有
        # 这里其实想查总数，正确写法见下
    )
    # 查总数用 func.count()
    from sqlalchemy import func
    total = session.scalar(select(func.count()).select_from(Board))
    print(f"剩余总数：{total}")
\`\`\`

运行这个 demo，对比上一章的原生 SQL 写法。重点感受：

1. **对象化操作**：\`board.title\` 比 \`row["title"]\` 直观
2. **类型安全**：\`Mapped[int]\` 让 IDE 知道 id 是 int
3. **链式查询**：\`select().where().order_by()\` 比 SQL 字符串清晰

## 五、查询语法速查

\`\`\`python
# 基础查询
session.scalars(select(Board)).all()                   # 所有
session.scalars(select(Board).where(Board.color == "blue")).all()  # 条件
session.get(Board, 1)                                   # 按主键

# 比较运算
Board.age == 18              # 等于
Board.age != 18              # 不等于
Board.age > 18               # 大于
Board.age.in_([18, 19, 20])  # 在列表中
Board.name.like("%工作%")     # 模糊匹配
Board.name.ilike("%工作%")    # 不区分大小写模糊匹配
Board.description.is_(None)  # IS NULL
Board.description.is_not(None)  # IS NOT NULL

# 逻辑运算（注意：用 & | ! 而不是 and or not，且要加括号）
(Board.age > 18) & (Board.age < 30)   # AND
(Board.color == "blue") | (Board.color == "green")  # OR
~Board.archived                        # NOT

# 排序、分页
select(Board).order_by(Board.id.desc())      # 倒序
select(Board).order_by(Board.id.asc())       # 正序
select(Board).offset(10).limit(5)            # 分页：跳过 10 取 5

# 聚合
from sqlalchemy import func
select(func.count()).select_from(Board)       # 总数
select(func.avg(Board.age))                   # 平均值
select(Board.color, func.count()).group_by(Board.color)  # 分组统计
\`\`\`

## 六、Mapped 注解的奥秘

SQLAlchemy 2.0 的核心特性：用 Python 类型注解定义字段。

\`\`\`python
class Board(Base):
    # Mapped[int] 决定了：
    #   1. 数据库字段类型（INTEGER）
    #   2. Python 属性类型（int）
    #   3. 是否允许 NULL（int 不允许，int | None 允许）
    id: Mapped[int] = mapped_column(primary_key=True)

    # Mapped[str | None] 表示可选字段，自动 nullable=True
    description: Mapped[str | None] = mapped_column(String(500))
\`\`\`

| 类型注解 | 数据库类型 | 是否允许 NULL |
|---------|----------|--------------|
| \`Mapped[int]\` | INTEGER | NOT NULL |
| \`Mapped[int \| None]\` | INTEGER | NULL |
| \`Mapped[str]\` | VARCHAR | NOT NULL |
| \`Mapped[str \| None]\` | VARCHAR | NULL |
| \`Mapped[bool]\` | BOOLEAN | NOT NULL |
| \`Mapped[datetime]\` | DATETIME | NOT NULL |

## 七、本章小结

- ORM 把表映射成类，把 SQL 操作变成对象方法
- SQLAlchemy 2.0 用 \`Mapped\` 注解定义字段，类型安全
- \`Engine\` 管连接，\`Session\` 管事务，\`Base\` 管元数据
- 增删改查：\`session.add\` / \`session.get\` / 改属性 / \`session.delete\`
- 下章我们设计 TaskBoard 的完整数据模型，包括表之间的关系`,
  },

  // ============================================================
  // 第 8 章：模型设计与关系
  // ============================================================
  {
    id: "ff-models",
    group: "数据持久化与 SQLAlchemy",
    icon: "🔗",
    title: "模型设计与关系",
    content: `# 模型设计与关系

## 一、TaskBoard 数据模型设计

先想清楚整个应用需要哪些表。看板系统的核心实体：

\`\`\`
User（用户）
  └─ Board（看板，属于某个用户）
       └─ Column（列，属于某个看板）
            └─ Card（卡片，属于某个列）
\`\`\`

关系类型：

| 关系 | 类型 | 例子 |
|------|------|------|
| User → Board | 一对多 | 一个用户有多个看板 |
| Board → Column | 一对多 | 一个看板有多个列 |
| Column → Card | 一对多 | 一个列有多个卡片 |

\`\`\`
┌────────┐ 1   N ┌────────┐ 1   N ┌────────┐ 1   N ┌──────┐
│  User  │───────│ Board  │───────│ Column │───────│ Card │
└────────┘       └────────┘       └────────┘       └──────┘
   ↑                ↑
   └── creator_id   └── owner_id（外键）
\`\`\`

## 二、外键：建立关系的"线"

外键（Foreign Key）是一张表里指向另一张表主键的字段：

\`\`\`python
from sqlalchemy import ForeignKey

class Board(Base):
    __tablename__ = "boards"
    id: Mapped[int] = mapped_column(primary_key=True)
    # owner_id 是外键，指向 users.id
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
\`\`\`

- \`ForeignKey("users.id")\` 表示这个字段的值必须是 \`users\` 表里某个 \`id\`
- 删 user 时，他名下的 boards 怎么办？用 \`ondelete\` 指定：

| ondelete | 行为 |
|----------|------|
| \`CASCADE\` | 删用户时连带删除其看板 |
| \`SET NULL\` | 删用户时把 owner_id 设为 NULL（字段必须可空） |
| \`RESTRICT\` | 拒绝删除（必须先删看板才能删用户） |
| \`NO ACTION\` | 默认行为，等同 RESTRICT |

## 三、relationship：Python 层的"桥梁"

外键是数据库层的约束，\`relationship\` 是 ORM 层的便利方法：

\`\`\`python
from sqlalchemy.orm import relationship, Mapped

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    # relationship 不创建数据库字段，只在 Python 层建立关联
    # 通过 user.boards 就能直接拿到这个用户的所有看板
    boards: Mapped[list["Board"]] = relationship(back_populates="owner")

class Board(Base):
    __tablename__ = "boards"
    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    # back_populates 双向关联：board.owner 拿到用户对象
    owner: Mapped["User"] = relationship(back_populates="boards")
\`\`\`

- \`user.boards\` → 返回这个用户的所有看板列表
- \`board.owner\` → 返回这个看板的所有者用户对象
- \`back_populates\` 是双向绑定的"对端"字段名

## 四、Demo：完整的 TaskBoard 数据模型

\`\`\`python
# Demo：TaskBoard 完整数据模型与关系操作
from datetime import datetime
from sqlalchemy import create_engine, String, ForeignKey, Text, select
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column,
    relationship, Session, cascading_backref,
)

# ===== 1. 定义 Base =====
class Base(DeclarativeBase):
    pass

# ===== 2. 定义模型（注意定义顺序：先被引用的先定义）=====

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    # 密码哈希（不存明文！下章讲怎么生成）
    password_hash: Mapped[str] = mapped_column(String(255))
    avatar: Mapped[str | None] = mapped_column(String(500), default=None)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    # 一对多：一个用户有多个看板
    # cascade="all, delete-orphan" 表示删用户时连带删看板
    boards: Mapped[list["Board"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<User id={self.id} email={self.email!r}>"


class Board(Base):
    __tablename__ = "boards"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(500), default=None)
    color: Mapped[str] = mapped_column(String(20), default="blue")
    # 外键：owner_id 指向 users.id
    # ondelete="CASCADE" 删用户时连带删看板（数据库层）
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    # 多对一：看板属于一个用户
    owner: Mapped["User"] = relationship(back_populates="boards")
    # 一对多：看板有多个列
    columns: Mapped[list["Column"]] = relationship(
        back_populates="board",
        cascade="all, delete-orphan",
        # order_by 让 columns 默认按 position 排序
        order_by="Column.position",
    )

    def __repr__(self):
        return f"<Board id={self.id} title={self.title!r}>"


class Column(Base):
    __tablename__ = "columns"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100))
    # position 用于拖拽排序
    position: Mapped[int] = mapped_column(default=0)
    board_id: Mapped[int] = mapped_column(ForeignKey("boards.id", ondelete="CASCADE"))

    board: Mapped["Board"] = relationship(back_populates="columns")
    cards: Mapped[list["Card"]] = relationship(
        back_populates="column",
        cascade="all, delete-orphan",
        order_by="Card.position",
    )

    def __repr__(self):
        return f"<Column id={self.id} title={self.title!r} pos={self.position}>"


class Card(Base):
    __tablename__ = "cards"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, default=None)
    position: Mapped[int] = mapped_column(default=0)
    column_id: Mapped[int] = mapped_column(ForeignKey("columns.id", ondelete="CASCADE"))

    column: Mapped["Column"] = relationship(back_populates="cards")

    def __repr__(self):
        return f"<Card id={self.id} title={self.title!r} pos={self.position}>"


# ===== 3. 建表 + 测试 =====

engine = create_engine("sqlite:///:memory:", echo=False, connect_args={"check_same_thread": False})
Base.metadata.create_all(engine)

with Session(engine) as session:
    # ===== 创建用户 + 看板 + 列 + 卡片 =====
    user = User(
        email="alice@example.com",
        username="alice",
        password_hash="fake_hash_xxx",
    )

    board = Board(title="工作看板", color="green", owner=user)
    # 注意：通过 owner=user 关联，不用手动写 owner_id

    # 创建 3 个列
    col_todo = Column(title="待办", position=0, board=board)
    col_doing = Column(title="进行中", position=1, board=board)
    col_done = Column(title="已完成", position=2, board=board)

    # 创建几张卡片
    Card(title="写文档", position=0, column=col_todo)
    Card(title="开会", position=1, column=col_todo)
    Card(title="写代码", position=0, column=col_doing)
    Card(title="上线", position=0, column=col_done)

    # 只 add 最顶层的 user，SQLAlchemy 会级联 add 所有关联对象
    session.add(user)
    session.commit()

    print(f"用户 {user.username} 的 id = {user.id}")
    print(f"看板 {board.title} 的 id = {board.id}, owner_id = {board.owner_id}")

    # ===== 关系查询：通过关系属性直接访问 =====
    print("\\n=== 通过关系属性访问 ===")
    # 用户的看板
    print(f"{user.username} 的看板：{user.boards}")
    # 看板的列
    print(f"{board.title} 的列：{board.columns}")
    # 看板的所有者
    print(f"{board.title} 的所有者：{board.owner.username}")

    # ===== 级联删除测试 =====
    print("\\n=== 级联删除：删用户 ===")
    session.delete(user)
    session.commit()

    # 验证：看板、列、卡片都应该被连带删除
    board_count = session.scalar(select(Board).where(Board.owner_id == user.id))
    print(f"删用户后，该用户的看板：{board_count}")  # None
\`\`\`

运行这个 demo，重点理解：

### 4.1 \`cascade="all, delete-orphan"\`

\`\`\`python
boards: Mapped[list["Board"]] = relationship(
    back_populates="owner",
    cascade="all, delete-orphan",  # 关键！
)
\`\`\`

- \`all\`：所有操作（add, delete, update）都级联
- \`delete-orphan\`：删父对象时连带删子对象

没这个配置，删用户时看板会变成"孤儿"（owner_id 指向不存在的用户）。

### 4.2 \`back_populates\` 双向同步

\`\`\`python
board.owner = user       # 设置后
print(user.boards)       # 自动包含这个 board，无需手动添加
\`\`\`

SQLAlchemy 会自动保持双向关系一致。

### 4.3 \`order_by\` 自动排序

\`\`\`python
columns: Mapped[list["Column"]] = relationship(
    back_populates="board",
    order_by="Column.position",  # 查出来的 columns 自动按 position 排序
)
\`\`\`

拖拽排序时，只要改 position 字段，关系查询自动按新顺序返回。

## 五、relationship 的 lazy 加载

默认情况下，访问关系属性会**懒加载**——第一次访问时才查数据库：

\`\`\`python
board = session.get(Board, 1)
# 此时还没查 columns
print(board.columns)  # 这一刻才发 SQL 查询
\`\`\`

⚠️ **N+1 查询陷阱**：

\`\`\`python
# 假设有 10 个看板
boards = session.scalars(select(Board)).all()
for b in boards:
    print(b.owner.username)  # 每次循环都发一次 SQL 查 owner
# 总共 1（查 boards）+ 10（查 owner）= 11 次 SQL！
\`\`\`

解决方案：\`selectinload\` 一次性加载所有关联：

\`\`\`python
from sqlalchemy.orm import selectinload

stmt = select(Board).options(selectinload(Board.owner))
boards = session.scalars(stmt).all()
# 只发 2 次 SQL：一次查 boards，一次查所有 owner
\`\`\`

## 六、本章小结

- 外键建立数据库层的关系约束
- \`relationship\` 提供 Python 层的便利访问
- \`back_populates\` 实现双向同步
- \`cascade="all, delete-orphan"\` 实现级联删除
- \`order_by\` 让关系查询自动排序
- 警惕 N+1 查询，用 \`selectinload\` 优化
- 下章学习如何管理数据库会话`,
  },

  // ============================================================
  // 第 9 章：数据库会话管理
  // ============================================================
  {
    id: "ff-session",
    group: "数据持久化与 SQLAlchemy",
    icon: "🔄",
    title: "数据库会话管理",
    content: `# 数据库会话管理

## 一、为什么需要会话管理

Web 应用是**并发**的——同时有 100 个用户在请求。如果大家共用一个 Session：

\`\`\`python
# ❌ 危险：全局共享 Session
global_session = Session(engine)

@app.get("/boards/{id}")
def get_board(id: int):
    board = global_session.get(Board, id)
    return board
\`\`\`

会发生：
- A 用户改了一半，B 用户读到中间状态
- A 用户出错 rollback，B 用户的修改也丢了
- 多线程并发访问同一个 Session 直接崩

**正确做法**：每个请求一个 Session，请求结束就关掉。

\`\`\`python
# ✅ 每个请求独立 Session
@app.get("/boards/{id}")
def get_board(id: int):
    with Session(engine) as session:
        board = session.get(Board, id)
        return board
\`\`\`

但每个路由都写 \`with Session\` 太啰嗦。FastAPI 的**依赖注入**完美解决这个问题——下章详细讲，这章先把基础设施搭好。

## 二、封装数据库模块

创建 \`backend/app/database.py\`：

\`\`\`python
# 文件：backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session

# ===== 1. 引擎 =====
# 生产环境应该从配置读 URL，这里简化
engine = create_engine(
    "sqlite:///taskboard.db",
    # SQLite 多线程必须加这个参数
    connect_args={"check_same_thread": False},
    # echo=True 打印 SQL，生产关掉
    echo=False,
)

# ===== 2. SessionLocal：Session 工厂 =====
# sessionmaker 是 Session 的"工厂"，每次调用返回一个新 Session
# autocommit=False：手动控制提交（推荐）
# autoflush=False：手动控制 flush（避免意外的 SQL 发出）
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)

# ===== 3. Base：所有模型的基类 =====
class Base(DeclarativeBase):
    pass
\`\`\`

## 三、配置管理（Pydantic Settings）

真实项目的配置应该从环境变量读，不写死在代码里。用 \`pydantic-settings\`：

\`\`\`bash
pip install pydantic-settings
\`\`\`

\`\`\`python
# 文件：backend/app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # 模型配置：从 .env 文件读环境变量
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # 应用配置
    APP_NAME: str = "TaskBoard"
    DEBUG: bool = True

    # 数据库配置：默认用 SQLite，可改成 PostgreSQL URL
    DATABASE_URL: str = "sqlite:///taskboard.db"

    # JWT 配置（下章用）
    SECRET_KEY: str = "dev-secret-key-change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 小时

    # CORS 配置
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

# 全局单例
settings = Settings()
\`\`\`

配套 \`.env\` 文件：

\`\`\`env
# .env
DEBUG=True
DATABASE_URL=sqlite:///taskboard.db
SECRET_KEY=change-me-in-production
\`\`\`

⚠️ **\`.env\` 必须加入 \`.gitignore\`**，不要把密钥提交到 git！

## 四、更新 database.py 使用配置

\`\`\`python
# 文件：backend/app/database.py（更新版）
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.config import settings

# 从配置读 URL
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {},
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass
\`\`\`

## 五、Demo：会话管理的最佳实践

\`\`\`python
# Demo：模拟 FastAPI 的会话管理流程
from sqlalchemy import create_engine, String, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker, Session

# ===== 1. 模拟 database.py =====
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass

class Board(Base):
    __tablename__ = "boards"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100))

Base.metadata.create_all(engine)

# ===== 2. 模拟 get_db 依赖（下章详细讲）=====
def get_db():
    """每个请求创建一个 Session，请求结束关闭。"""
    db = SessionLocal()
    try:
        yield db  # yield 让 FastAPI 在请求处理完后回来执行 finally
    finally:
        db.close()

# ===== 3. 模拟路由函数 =====
def create_board_use_case(title: str):
    """模拟路由调用：使用 get_db 拿 session。"""
    # 模拟 FastAPI 的依赖注入：手动迭代 generator
    gen = get_db()
    db = next(gen)
    try:
        # 业务逻辑开始
        board = Board(title=title)
        db.add(board)
        db.commit()
        db.refresh(board)  # refresh 重新从数据库加载，获取自增 id 等
        return board
    except Exception as e:
        db.rollback()
        raise
    finally:
        # 关闭 session
        next(gen, None)

# ===== 4. 测试 =====
print("=== 创建看板 ===")
b1 = create_board_use_case("工作")
b2 = create_board_use_case("学习")
print(f"  b1: id={b1.id}, title={b1.title}")
print(f"  b2: id={b2.id}, title={b2.title}")

# 验证：每个 use case 用的是独立 session
print("\\n=== 用新 session 查询验证 ===")
with SessionLocal() as db:
    boards = db.scalars(select(Board)).all()
    print(f"  数据库中共 {len(boards)} 个看板")
    for b in boards:
        print(f"    {b}")

# ===== 5. 演示事务回滚 =====
print("\\n=== 事务回滚演示 ===")
with SessionLocal() as db:
    try:
        db.add(Board(title="将成功"))
        db.add(Board(title="将失败"))
        db.commit()
        # 故意制造错误（重复 id）
        db.add(Board(id=1, title="冲突"))
        db.commit()  # 这里会抛异常
    except Exception as e:
        print(f"  发生错误：{e}")
        db.rollback()
        print("  已回滚")

# 验证：第二个事务的"将成功""将失败"都应该没插入
with SessionLocal() as db:
    count = db.scalar(select(Board).where())
    from sqlalchemy import func
    total = db.scalar(select(func.count()).select_from(Board))
    print(f"  当前总数：{total}（说明事务回滚成功）")
\`\`\`

运行这个 demo，重点理解：

### 5.1 \`yield\` 模式

\`\`\`python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
\`\`\`

- \`yield db\`：把 session 给路由用
- 路由处理完后，FastAPI 自动回到 \`finally\` 关闭 session
- 这是 FastAPI 依赖注入的标准模式

### 5.2 \`refresh\` 的作用

\`\`\`python
db.add(board)
db.commit()
db.refresh(board)  # 重新查一次，获取数据库生成的字段（如自增 id、默认值）
\`\`\`

commit 后 \`board.id\` 在 SQLite 通常是有的，但建议 refresh 一下，确保所有默认值（如 created_at）都同步。

## 六、连接池

每次请求都新建数据库连接很慢。SQLAlchemy 自带连接池：

\`\`\`python
engine = create_engine(
    "postgresql://user:pass@localhost/db",
    pool_size=5,          # 持久连接数
    max_overflow=10,      # 临时连接数
    pool_timeout=30,      # 等待连接超时（秒）
    pool_recycle=3600,    # 连接最大存活时间（秒）
)
\`\`\`

⚠️ **SQLite 不支持连接池**，因为它是文件型，多连接写入会锁冲突。SQLite 默认用 \`SingletonThreadPool\`（每个线程一个连接）。

## 七、建表脚本：alembic（生产必备）

开发时用 \`Base.metadata.create_all(engine)\` 建表很方便，但**生产环境**不能这么干——会覆盖已有数据。

生产用 **Alembic**（SQLAlchemy 配套的迁移工具）：

\`\`\`bash
pip install alembic
alembic init alembic        # 初始化
alembic revision --autogenerate -m "create boards"  # 生成迁移脚本
alembic upgrade head        # 执行迁移
\`\`\`

本教程为简化，开发阶段用 \`create_all\`，部署章节再讲 Alembic。

## 八、本章小结

- 每个请求一个 Session，避免并发冲突
- \`sessionmaker\` 是 Session 工厂，\`yield\` 模式让 FastAPI 自动关闭
- 配置用 \`pydantic-settings\` 从 \`.env\` 读，环境隔离
- 生产用 Alembic 管理表结构变更
- 下章我们把会话管理和 FastAPI 依赖注入结合起来`,
  },

  // ============================================================
  // 第 10 章：依赖注入实战
  // ============================================================
  {
    id: "ff-di",
    group: "数据持久化与 SQLAlchemy",
    icon: "💉",
    title: "依赖注入实战",
    content: `# 依赖注入实战

## 一、什么是依赖注入

**依赖注入（Dependency Injection, DI）** 是一种设计模式：把"我需要的东西"声明出来，由框架负责提供。

生活类比：你去餐厅点餐，菜单上写"番茄炒蛋"，后厨就给你做。你不用关心鸡蛋是从哪买的、番茄怎么切——餐厅（框架）负责整个供应链。

\`\`\`python
# 没有依赖注入：路由里自己造一切
@app.get("/boards")
def list_boards():
    db = SessionLocal()  # 自己创建 session
    try:
        boards = db.scalars(select(Board)).all()
        return boards
    finally:
        db.close()  # 自己关闭

# 有依赖注入：声明"我需要 db"，框架给你
@app.get("/boards")
def list_boards(db: Session = Depends(get_db)):  # 框架注入
    return db.scalars(select(Board)).all()
\`\`\`

## 二、FastAPI 的 Depends

\`Depends\` 是 FastAPI 依赖注入的核心：

\`\`\`python
from fastapi import Depends

# 1. 定义一个"依赖"——任意可调用对象（函数、类、方法）
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 2. 在路由参数里用 Depends(get_db) 声明依赖
@app.get("/boards")
def list_boards(db: Session = Depends(get_db)):
    # db 已经是 get_db yield 出来的 Session 实例
    return db.scalars(select(Board)).all()
\`\`\`

FastAPI 看到参数默认值是 \`Depends(get_db)\`，会：

1. 调用 \`get_db()\`
2. 拿 \`yield\` 出来的值赋给 \`db\`
3. 路由函数执行完毕后，回到 \`get_db\` 的 \`finally\` 关闭 session

## 三、依赖注入的三大价值

### 3.1 复用：写一次，到处用

\`\`\`python
# 10 个路由都依赖 get_db，不用每个都写 with Session
@app.get("/boards")
def list_boards(db: Session = Depends(get_db)): ...

@app.post("/boards")
def create_board(db: Session = Depends(get_db)): ...

@app.get("/boards/{id}")
def get_board(id: int, db: Session = Depends(get_db)): ...
\`\`\`

### 3.2 测试：可替换

\`\`\`python
# 测试时用内存数据库
def override_get_db():
    db = SessionLocal()  # 这里指向 :memory: 的 SessionLocal
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
# 现在所有路由的 db 都是内存版，不影响真实数据库
\`\`\`

### 3.3 组合：依赖可嵌套

\`\`\`python
# get_current_user 依赖 get_db
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    user = decode_token_and_query_user(token, db)
    return user

# 路由只依赖 get_current_user，FastAPI 自动级联解析
@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
\`\`\`

## 四、Demo：完整的依赖注入体系

\`\`\`python
# ===================================================================
# Demo：用依赖注入搭一个迷你看板系统
# -------------------------------------------------------------------
# 本 demo 完整演示 FastAPI 依赖注入的五大核心能力：
#   1. 基础设施层  —— SQLAlchemy 引擎、Session 工厂、ORM 模型
#   2. 核心依赖    —— get_db：每个请求一个 Session，请求结束自动关闭
#   3. 嵌套依赖    —— get_db_and_user：依赖其他依赖，FastAPI 自动级联解析
#   4. 路由使用    —— 业务路由通过 Depends 声明所需资源，代码极简
#   5. 类作为依赖  —— BoardQueryParams：封装分页/过滤参数
#   6. 依赖覆盖    —— dependency_overrides：测试时替换真实依赖
# ===================================================================
from fastapi import FastAPI, Depends, HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, String, select
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column,
    sessionmaker, Session,
)

# ===== 1. 基础设施：SQLAlchemy 引擎 + ORM 模型 =====
# create_engine：建立到数据库的"连接工厂"。这里用 SQLite 内存库，
# connect_args={"check_same_thread": False} 是因为 FastAPI 路由可能
# 在不同线程被调用，而 SQLite 默认只允许创建它的线程访问。
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})

# sessionmaker：Session 工厂。每个请求来时调一次 SessionLocal() 得到独立 session。
# autocommit=False：不自动提交，需手动 db.commit()
# autoflush=False：不在查询前自动 flush，避免意外写入
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# DeclarativeBase：SQLAlchemy 2.0 风格的 ORM 基类，所有模型继承它
class Base(DeclarativeBase):
    pass

# Board：看板模型，对应数据库里的 boards 表
class Board(Base):
    __tablename__ = "boards"
    # Mapped[int]：类型注解告诉 SQLAlchemy 这列是 int
    # mapped_column：声明列属性，primary_key=True 主键，autoincrement=True 自增
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100))           # 标题，最长 100
    color: Mapped[str] = mapped_column(String(20), default="blue")  # 颜色，默认 blue

# 在 engine 上创建所有表（开发演示用；生产环境用 Alembic 做迁移）
Base.metadata.create_all(engine)

app = FastAPI()

# ===== 2. 核心依赖：get_db（每个请求一个 Session）=====
# FastAPI 依赖最常见的写法：用 yield 的生成器函数。
# 关键点：yield 之前是"请求开始"做的事，yield 之后是"请求结束"做的事。
def get_db():
    """数据库会话依赖。每个请求一个 session，请求结束自动关闭。"""
    # —— 请求开始：创建一个全新的 Session ——
    # 每个请求独立 session，互不干扰；session 内部有一层 identity map 缓存
    db = SessionLocal()
    try:
        # —— yield 把 db 交给路由函数使用 ——
        # 路由函数执行期间，这个 yield 一直"挂起"在这里
        yield db
    finally:
        # —— 请求结束（无论成功还是异常）：关闭 session ——
        # finally 保证即使路由抛异常也会执行，避免连接泄漏
        # close() 会把 session 里的所有对象变成 detached 状态
        db.close()

# ===== 3. 嵌套依赖：模拟"当前用户" =====
# 这是依赖注入最强大的能力之一：依赖可以依赖其他依赖，
# FastAPI 会按依赖图自动级联解析、按需注入。
# 场景：通过 token 找到 user_id，再拿到 db，最后把两个资源打包给路由。

# 模拟 token → user_id 的映射表（真实项目用 JWT 签发 token）
FAKE_TOKENS = {"token-alice": 1, "token-bob": 2}  # token -> user_id

# 注意：这个依赖没有任何 Depends，它只是"声明了 token 参数"，
# FastAPI 看到它没被显式 Depends，就当作"查询参数"从 URL ?token=xxx 解析
def get_current_user_id(token: str):
    """从 token 解析 user_id（演示用，真实用 JWT）。"""
    if token not in FAKE_TOKENS:
        # 依赖里抛 HTTPException，FastAPI 会把它原样作为响应返回
        # 不会变成 500，而是 401，自动中断后续依赖与路由执行
        raise HTTPException(401, "无效 token")
    return FAKE_TOKENS[token]

# 组合依赖：把"拿 db"和"拿 user_id"两件事打包成一个 dict 返回
# 这个函数依赖 get_db（Depends(get_db)），FastAPI 会先解析 get_db
# 再把结果注入进来 —— 这就是"依赖嵌套/级联解析"
def get_db_and_user(
    token: str,
    db: Session = Depends(get_db),  # ← 嵌套依赖，FastAPI 先解析 get_db
):
    """组合依赖：同时拿到 db 和 user_id。"""
    user_id = get_current_user_id(token)  # 拿到 user_id
    return {"db": db, "user_id": user_id}  # 打包成上下文 dict 给路由

# ===== 4. 路由：用依赖注入（业务代码极简）=====
# 对比：没有 DI 时，每个路由都要自己 SessionLocal() + try/finally + close()
#       有了 DI，只需声明 db: Session = Depends(get_db)，其余交给框架

@app.get("/boards")
def list_boards(db: Session = Depends(get_db)):
    """列出所有看板。"""
    # db 是 FastAPI 调用 get_db() 后注入进来的 Session 实例
    # select(Board) 是 SQLAlchemy 2.0 风格的查询
    # db.scalars(...) 返回的是 ScalarResult，.all() 转成 list
    boards = db.scalars(select(Board)).all()
    # ORM 对象不能直接 JSON 序列化，手动转成 dict 返回给前端
    return [{"id": b.id, "title": b.title, "color": b.color} for b in boards]

@app.post("/boards")
def create_board(
    title: str,                            # 查询参数 ?title=xxx
    db: Session = Depends(get_db),         # 数据库会话依赖
):
    """创建看板。"""
    board = Board(title=title)  # 1. 创建 ORM 对象（transient 状态）
    db.add(board)               # 2. 加入 session（pending 状态，尚未入库）
    db.commit()                 # 3. 提交事务，真正写入数据库
    db.refresh(board)           # 4. 刷新，拿到数据库生成的 id（自增主键）
    return {"id": board.id, "title": board.title, "color": board.color}

@app.get("/me/boards")
def list_my_boards(ctx: dict = Depends(get_db_and_user)):
    """列出"我的"看板（演示嵌套依赖）。"""
    # ctx 是 get_db_and_user 返回的 dict，里面同时有 db 和 user_id
    # —— 这里把多个资源通过一个依赖打包传进来，路由签名很干净 ——
    db = ctx["db"]
    user_id = ctx["user_id"]
    # 演示用：实际项目应按 owner_id 过滤，这里简化为返回所有看板
    boards = db.scalars(select(Board)).all()
    return {
        "user_id": user_id,
        "boards": [{"id": b.id, "title": b.title} for b in boards],
    }

# ===== 5. 类作为依赖 =====
# 另一种写法：把一组相关参数封装成类的实例。
# FastAPI 会用 __init__ 的参数作为查询参数来源，
# 自动构造一个 BoardQueryParams 实例注入给路由。
class BoardQueryParams:
    """用类封装查询参数依赖。"""
    def __init__(
        self,
        skip: int = 0,               # 分页：跳过前 N 条
        limit: int = 10,             # 分页：最多返回 N 条
        color: str | None = None,    # 过滤：按颜色筛选（None 表示不过滤）
    ):
        self.skip = skip
        self.limit = limit
        self.color = color

@app.get("/boards/search")
def search_boards(
    # Depends() 不传参数时，FastAPI 用类型注解 BoardQueryParams 本身作为依赖
    # 它会自动从 URL ?skip=0&limit=5&color=blue 解析，构造实例
    params: BoardQueryParams = Depends(),
    db: Session = Depends(get_db),
):
    """演示用类作为依赖：自动从查询参数解析。"""
    # 构造查询：select(Board) 相当于 SELECT * FROM boards
    stmt = select(Board)
    # 动态拼接过滤条件：只有传入 color 才过滤
    if params.color:
        stmt = stmt.where(Board.color == params.color)
    # 分页：offset 跳过、limit 限制条数
    stmt = stmt.offset(params.skip).limit(params.limit)
    boards = db.scalars(stmt).all()
    return {
        "filters": {"skip": params.skip, "limit": params.limit, "color": params.color},
        "items": [{"id": b.id, "title": b.title, "color": b.color} for b in boards],
    }

# ===== 6. 测试：用 TestClient 模拟 HTTP 请求 + 依赖覆盖 =====
# TestClient 包装 app，可以直接用 .get / .post 发请求，无需启动真实服务
client = TestClient(app)

print("=== 1. 创建几个看板 ===")
# params= 会作为查询参数拼到 URL 上：POST /boards?title=工作
client.post("/boards", params={"title": "工作"})
client.post("/boards", params={"title": "学习"})
r = client.get("/boards")
print(f"  创建后列表：{r.json()}")

print("\\n=== 2. 嵌套依赖：用 token 获取『我的看板』 ===")
# 这里会触发依赖链：get_db_and_user → get_db + get_current_user_id
# FastAPI 按 token 解析出 user_id，再把 db 一起注入到路由
r = client.get("/me/boards", params={"token": "token-alice"})
print(f"  {r.json()}")

print("\\n=== 3. 嵌套依赖：错误 token ===")
# 错误 token 会触发依赖里的 HTTPException(401)，
# FastAPI 自动把异常转成 401 响应，路由函数根本不会执行
r = client.get("/me/boards", params={"token": "wrong"})
print(f"  状态码：{r.status_code}, 错误：{r.json()['detail']}")

print("\\n=== 4. 类依赖：分页+过滤 ===")
# ?skip=0&limit=5 会自动解析成 BoardQueryParams 实例
r = client.get("/boards/search", params={"skip": 0, "limit": 5})
print(f"  {r.json()}")

print("\\n=== 5. 依赖覆盖（用于测试）===")
# dependency_overrides 是 FastAPI 的测试神器：
# 把真实依赖（get_db）替换成测试专用版本（override_get_db），
# 这样路由代码完全不变，但底层资源换成了测试数据库。
test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(bind=test_engine, autocommit=False, autoflush=False)
Base.metadata.create_all(test_engine)

# 覆盖版 get_db：用 TestSessionLocal 创建 session，逻辑结构与原版一致
def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()

# 注册覆盖：key 是原依赖函数，value 是替代函数
# 之后所有路由遇到 Depends(get_db) 都会改用 override_get_db
app.dependency_overrides[get_db] = override_get_db

# 再请求 /boards —— 路由代码完全没变，但拿到的是空的测试数据库
r = client.get("/boards")
print(f"  替换后列表（应该是空的）：{r.json()}")

# 清除覆盖，恢复原 get_db（避免影响后续逻辑）
app.dependency_overrides.clear()
\`\`\`

运行这个 demo，重点理解：

### 6.1 yield 依赖 vs return 依赖

\`\`\`python
# yield 版：可以做清理工作（关闭 session）
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# return 版：没有清理时机
def get_db_simple():
    return SessionLocal()  # ❌ 永远不会关闭
\`\`\`

需要清理的资源（session、文件、连接）用 \`yield\`。

### 6.2 类作为依赖

\`\`\`python
class BoardQueryParams:
    def __init__(self, skip: int = 0, limit: int = 10):
        self.skip = skip
        self.limit = limit

@app.get("/boards")
def list_boards(params: BoardQueryParams = Depends()):
    # FastAPI 会自动从查询参数解析 skip/limit，构造 BoardQueryParams 实例
    use(params.skip, params.limit)
\`\`\`

\`Depends()\` 不传参数时，FastAPI 用类型注解的类自己作为依赖。

### 6.3 \`dependency_overrides\`：测试神器

\`\`\`python
app.dependency_overrides[get_db] = override_get_db
\`\`\`

测试时把真实数据库依赖替换成内存版，不污染真实数据。后面测试章节会大量用。

## 五、依赖注入的应用场景

| 场景 | 依赖函数 | 作用 |
|------|---------|------|
| 数据库会话 | \`get_db\` | 提供数据库连接 |
| 当前用户 | \`get_current_user\` | 解析 token，返回 User 对象 |
| 分页参数 | \`PaginationParams\` | 解析 skip/limit |
| 权限校验 | \`require_admin\` | 检查当前用户是否是管理员 |
| 限流 | \`rate_limiter\` | 限制请求频率 |
| 配置 | \`get_settings\` | 注入全局配置 |

## 六、本章小结

- 依赖注入：声明需要什么，框架负责提供
- \`Depends\` + \`yield\` 是资源管理的标准模式
- 依赖可嵌套，FastAPI 自动级联解析
- \`dependency_overrides\` 用于测试替换
- 至此，FastAPI + SQLAlchemy 的基础设施都搭好了
- 下章我们进入用户认证系统，实现注册登录`,
  },
];
