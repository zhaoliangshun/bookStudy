// =============================================================
// Python Web 应用开发实战教程 - 第 10 批章节（SQLAlchemy ORM 篇，共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   37. sa-core       : SQLAlchemy Core 基础
//   38. sa-orm        : SQLAlchemy ORM 模型
//   39. sa-query      : SQLAlchemy 查询
//   40. sa-relationship: SQLAlchemy 关系
//
// 技术栈：Python 3.11+ / SQLAlchemy 2.0+
//
// 格式约定：
//   - content 是反引号模板字符串
//   - content 内部三反引号转义为 \`\`\`，内联反引号转义为 \`
//   - 涉及 ${ 形式（shell/docker 变量）统一转义为 \$\{，避免与 JS 模板字符串冲突
//   - group 统一为"SQLAlchemy ORM"
// =============================================================

export const chapters = [
  // =========================================================
  // 第三十七章：SQLAlchemy Core 基础
  // =========================================================
  {
    id: "sa-core",
    group: "SQLAlchemy ORM",
    icon: "🗄️",
    title: "SQLAlchemy Core 基础",
    content: `

# SQLAlchemy Core 基础

## 一、SQLAlchemy 是什么

前面我们用 Flask/Django 写视图、用 Jinja2 渲染模板，但数据还活在内存里——进程一重启全没了。真实业务必须把数据存到**数据库**里。SQLAlchemy 就是 Python 生态里最强大的数据库工具包。

**SQLAlchemy** 分成两层架构：

\`\`\`txt filename="SQLAlchemy 两层架构"
┌───────────────────────────────────────────┐
│  ORM 层（高层）                            │
│  User / Post 等 Python 类 ↔ 数据库表        │
│      ↕  自动翻译                            │
│  Core 层（底层）                            │
│  SQL 表达式 / 连接 / 事务                    │
│      ↕  驱动                                │
│  数据库（MySQL / PostgreSQL / SQLite）       │
└───────────────────────────────────────────┘
\`\`\`

- **Core**：SQL 表达式层，把 SQL 语句变成 Python 对象，贴近 SQL 本身。适合写复杂查询、性能敏感场景。
- **ORM**：建立在 Core 之上，用类和对象封装表和行，更面向对象。日常增删改查用 ORM 更顺手。

本章先讲 Core，因为它直接对应 SQL 概念，学懂 Core 再上 ORM 会非常顺——ORM 的每个操作背后都是 Core 的 SQL 表达式。

## 二、为什么先学 Core

很多人直接跳到 ORM，结果"魔法太多"看不懂。先学 Core 的好处：

1. **理解底层 SQL**：ORM 把 SQL 藏起来了，但出 bug 时你还得看生成的 SQL。Core 让你直观看到"这行代码对应什么 SQL"。
2. **复杂查询不绕路**：报表、统计、多表 join 用 ORM 表达反而啰嗦，Core 直接写 SQL 表达式更清晰。
3. **打基础**：ORM 的 \`session.execute(select(...))\` 本质就是 Core 的查询。

## 三、安装与连接：engine

\`\`\`bash filename="安装 SQLAlchemy"
# 装核心库
# 安装 Python 包: sqlalchemy
pip install sqlalchemy

# 装数据库驱动（按你用的数据库选一个）
pip install psycopg2-binary  # PostgreSQL
pip install pymysql            # MySQL
# SQLite 不用装驱动，Python 标准库自带 sqlite3
\`\`\`

\`\`\`python filename="创建 engine - 数据库连接入口"
# 从 sqlalchemy 导入 create_engine
from sqlalchemy import create_engine

# engine 是数据库连接的"工厂"，所有操作都从它开始
# URL 格式：方言+驱动://用户:密码@主机:端口/数据库名

# SQLite（开发最方便，单文件）
# 定义变量 engine，赋值为 create_engine("sqlite:///blog.db", echo=True)
engine = create_engine("sqlite:///blog.db", echo=True)
# echo=True 会打印生成的 SQL，学习阶段强烈推荐

# PostgreSQL
# 定义变量 engine，赋值为 create_engine("postgresql+psycopg2://user:pas...
engine = create_engine("postgresql+psycopg2://user:pass@localhost:5432/blog")

# MySQL
# 定义变量 engine，赋值为 create_engine("mysql+pymysql://user:pass@loca...
engine = create_engine("mysql+pymysql://user:pass@localhost:3306/blog")

# 内存 SQLite（测试用，进程结束就没了）
# 定义变量 engine，赋值为 create_engine("sqlite:///:memory:")
engine = create_engine("sqlite:///:memory:")
\`\`\`

\`\`\`txt filename="常用数据库 URL 速查"
SQLite      sqlite:///path/to.db        （相对路径）
SQLite 绝对  sqlite:////abs/path/to.db   （四个斜杠）
SQLite 内存  sqlite:///:memory:
PostgreSQL  postgresql+psycopg2://user:pwd@host:5432/db
MySQL       mysql+pymysql://user:pwd@host:3306/db
\`\`\`

> **\`echo=True\` 是学习神器**：开启后控制台会打印每条 SQL，你能直观看到"我写的 Python 对应什么 SQL"。生产环境要关掉（日志太多）。

## 四、engine 的连接池

engine 不是单个连接，而是**连接池**：预先建好一批连接复用，避免每次请求都握手建连。

\`\`\`python filename="连接池参数"
# 定义变量 engine，赋值为 create_engine(
engine = create_engine(
    # "postgresql+psycopg2://user:pass@localhost/blog",
    "postgresql+psycopg2://user:pass@localhost/blog",
    pool_size=5,          # 池里常驻连接数（默认 5）
    max_overflow=10,      # 超出 pool_size 还能临时建多少（默认 10）
    pool_timeout=30,       # 等连接超时秒数（默认 30）
    pool_recycle=3600,    # 连接多久回收（防数据库踢掉闲置连接）
    pool_pre_ping=True,    # 用前先 ping 一下，失效的连接重建
# )
)
\`\`\`

> **\`pool_pre_ping=True\` 重要**：数据库会主动断开长时间空闲的连接（如 MySQL 的 wait_timeout）。不开 pre_ping，拿到失效连接会报错。生产环境建议开。

## 五、MetaData 与 Table：定义表结构

Core 用 \`Table\` 对象描述表结构，所有 \`Table\` 收集在 \`MetaData\` 里。

\`\`\`python filename="用 Core 定义表"
# 从 sqlalchemy 导入（多行）
from sqlalchemy import (
    # MetaData, Table, Column,
    MetaData, Table, Column,
    # Integer, String, DateTime, Text, Boolean,
    Integer, String, DateTime, Text, Boolean,
    # ForeignKey,
    ForeignKey,
# )
)
# 从 datetime 导入 datetime
from datetime import datetime

# 1. 创建 MetaData 容器（收集所有表定义）
# 定义变量 metadata，赋值为 MetaData()
metadata = MetaData()

# 2. 定义 users 表
# 定义变量 users，赋值为 Table(
users = Table(
    # "users", metadata,
    "users", metadata,
    Column("id", Integer, primary_key=True),       # 主键自增
    Column("name", String(50), nullable=False),    # 不允许 NULL
    Column("email", String(120), unique=True),     # 唯一约束
    Column("created_at", DateTime, default=datetime.now),  # 插入时默认值
# )
)

# 3. 定义 posts 表
# 定义变量 posts，赋值为 Table(
posts = Table(
    # "posts", metadata,
    "posts", metadata,
    # 调用 Column()
    Column("id", Integer, primary_key=True),
    # 调用 Column()
    Column("title", String(200), nullable=False),
    # 调用 Column()
    Column("body", Text),
    # 调用 Column()
    Column("published", Boolean, default=False),
    Column("author_id", Integer, ForeignKey("users.id")),  # 外键指向 users.id
# )
)

# 4. 在数据库里真正建表（用 engine 执行 DDL）
# 调用 metadata.create_all()
metadata.create_all(engine)
# 生成 SQL：CREATE TABLE users (...); CREATE TABLE posts (...);
\`\`\`

### Column 常用类型

\`\`\`txt filename="常用列类型"
类型               对应 SQL                    Python 类型
Integer            INT                          int
String(n)          VARCHAR(n)                   str
Text               TEXT（不限长）                 str
Boolean            BOOLEAN                      bool
DateTime          DATETIME                     datetime
Float              FLOAT                        float
Numeric(p, s)      DECIMAL(p, s)（精确小数）       Decimal
JSON               JSON                         dict/list
LargeBinary        BLOB                         bytes
\`\`\`

### Column 常用参数

| 参数 | 作用 | 示例 |
|------|------|------|
| \`primary_key=True\` | 主键 | \`Column("id", Integer, primary_key=True)\` |
| \`nullable=False\` | 不允许 NULL | \`Column("name", String, nullable=False)\` |
| \`unique=True\` | 唯一约束 | \`Column("email", String, unique=True)\` |
| \`index=True\` | 建索引加速查询 | \`Column("email", String, index=True)\` |
| \`default=\` | Python 端默认值 | \`default=datetime.now\` |
| \`server_default=\` | 数据库端默认值 | \`server_default=text("now()")\` |

## 六、插入数据：insert

\`\`\`python filename="用 Core 插入数据"
# 从 sqlalchemy 导入 insert
from sqlalchemy import insert

# 1. 构造 insert 语句
# 定义变量 stmt，赋值为 insert(users).values(name="小明", email="xm@exa...
stmt = insert(users).values(name="小明", email="xm@example.com")
# 对应 SQL：INSERT INTO users (name, email) VALUES (?, ?)

# 2. 用 engine.connect() 拿连接，执行
# 使用上下文管理器 engine.connect()，赋值为 conn
with engine.connect() as conn:
    # 定义变量 result，赋值为 conn.execute(stmt)
    result = conn.execute(stmt)
    conn.commit()  # ★ 写操作必须 commit 才真正写入
    print("新用户 id：", result.lastrowid)  # 拿到自增 id

# 3. 批量插入
# 使用上下文管理器 engine.connect()，赋值为 conn
with engine.connect() as conn:
    # 调用 conn.execute()
    conn.execute(insert(users), [
        # {"name": "小红", "email": "xh@example.com"},
        {"name": "小红", "email": "xh@example.com"},
        # {"name": "小刚", "email": "xg@example.com"},
        {"name": "小刚", "email": "xg@example.com"},
    # ])
    ])
    # 调用 conn.commit()
    conn.commit()
\`\`\`

## 七、查询数据：select

\`\`\`python filename="用 Core 查询数据"
# 从 sqlalchemy 导入 select
from sqlalchemy import select

# 1. 查所有列
# 定义变量 stmt，赋值为 select(users)
stmt = select(users)
# SQL：SELECT * FROM users

# 2. 查指定列
# 定义变量 stmt，赋值为 select(users.c.name, users.c.email)
stmt = select(users.c.name, users.c.email)
# SQL：SELECT name, email FROM users
# users.c 是列的访问入口

# 3. where 过滤
# 定义变量 stmt，赋值为 select(users).where(users.c.name == "小明")
stmt = select(users).where(users.c.name == "小明")
# SQL：SELECT * FROM users WHERE name = ?

# 4. 多条件
# 定义变量 stmt，赋值为 select(users).where(
stmt = select(users).where(
    # users.c.name == "小明",
    users.c.name == "小明",
    # 调用 users.c.email.like()
    users.c.email.like("%@example.com"),
# )
)
# SQL：WHERE name = ? AND email LIKE ?

# 5. 执行并取结果
# 使用上下文管理器 engine.connect()，赋值为 conn
with engine.connect() as conn:
    # 定义变量 result，赋值为 conn.execute(stmt)
    result = conn.execute(stmt)
    # 方式一：取所有行，每行是 Row 对象（可像字典/元组访问）
    # 遍历 result，取 row
    for row in result:
        print(row.name, row["email"])   # 两种访问方式都行
    # 方式二：取一行
    # row = result.fetchone()
    # 方式三：取所有成列表
    # rows = result.fetchall()
\`\`\`

## 八、更新和删除

\`\`\`python filename="用 Core 更新和删除"
# 从 sqlalchemy 导入 update, delete
from sqlalchemy import update, delete

# 更新
# 使用上下文管理器 engine.connect()，赋值为 conn
with engine.connect() as conn:
    # 定义变量 stmt，赋值为 update(users).where(users.c.name == "小明").val...
    stmt = update(users).where(users.c.name == "小明").values(name="小明改")
    # 调用 conn.execute()
    conn.execute(stmt)
    # 调用 conn.commit()
    conn.commit()
# SQL：UPDATE users SET name=? WHERE name=?

# 删除
# 使用上下文管理器 engine.connect()，赋值为 conn
with engine.connect() as conn:
    # 定义变量 stmt，赋值为 delete(users).where(users.c.id == 5)
    stmt = delete(users).where(users.c.id == 5)
    # 调用 conn.execute()
    conn.execute(stmt)
    # 调用 conn.commit()
    conn.commit()
# SQL：DELETE FROM users WHERE id=?
\`\`\`

> **where 条件一定要写**！忘写 where 的 \`update(users).values(...)\` 会更新全表，\`delete(users)\` 会清空整张表——灾难性事故。

## 九、事务

数据库操作要么"提交生效"，要么"回滚撤销"。事务保证一组操作的原子性。

\`\`\`python filename="用 Core 控制事务"
# 从 sqlalchemy.exc 导入 IntegrityError
from sqlalchemy.exc import IntegrityError

# 方式一：用 with 自动提交/回滚
# 使用上下文管理器 engine.begin()，赋值为 conn
with engine.begin() as conn:
    # 这个块里所有操作要么全成功（自动 commit），要么全回滚（异常）
    # 调用 conn.execute()
    conn.execute(insert(users).values(name="小华", email="xh2@example.com"))
    # 调用 conn.execute()
    conn.execute(insert(posts).values(title="第一篇", author_id=1))
    # 抛异常会自动 rollback

# 方式二：手动控制
# 定义变量 conn，赋值为 engine.connect()
conn = engine.connect()
# 定义变量 trans，赋值为 conn.begin()
trans = conn.begin()
# 尝试执行，捕获异常
try:
    # 调用 conn.execute()
    conn.execute(update(users).where(...).values(...))
    # 调用 conn.execute()
    conn.execute(delete(posts).where(...))
    trans.commit()   # 提交
# 捕获 Exception 异常
except Exception:
    trans.rollback()  # 回滚
    # raise
    raise
# 无论是否异常都执行
finally:
    # 调用 conn.close()
    conn.close()
\`\`\`

\`\`\`python filename="事务的典型场景：转账"
# 转账：A 扣钱 + B 加钱，必须同时成功或同时失败
# 定义函数 transfer，参数: conn, from_id, to_id, amount
def transfer(conn, from_id, to_id, amount):
    # conn.execute(
    conn.execute(
        # 调用 update()
        update(accounts).where(accounts.c.id == from_id)
        # .values(balance=accounts.c.balance - amount)
        .values(balance=accounts.c.balance - amount)
    # )
    )
    # conn.execute(
    conn.execute(
        # 调用 update()
        update(accounts).where(accounts.c.id == to_id)
        # .values(balance=accounts.c.balance + amount)
        .values(balance=accounts.c.balance + amount)
    # )
    )
    # 如果中间抛异常，外层 with engine.begin() 会自动回滚
\`\`\`

## 十、完整示例：Core 建表与查询

\`\`\`python filename="core_demo.py - 完整 Core 演示"
# 从 sqlalchemy 导入（多行）
from sqlalchemy import (
    # create_engine, MetaData, Table, Column,
    create_engine, MetaData, Table, Column,
    # Integer, String, Text, ForeignKey, select, insert,
    Integer, String, Text, ForeignKey, select, insert,
# )
)

# 1. 连接（开发用内存 SQLite，echo 看生成的 SQL）
# 定义变量 engine，赋值为 create_engine("sqlite:///:memory:", echo=True...
engine = create_engine("sqlite:///:memory:", echo=True)

# 2. 定义表
# 定义变量 metadata，赋值为 MetaData()
metadata = MetaData()
# 定义变量 users，赋值为 Table("users", metadata,
users = Table("users", metadata,
    # 调用 Column()
    Column("id", Integer, primary_key=True),
    # 调用 Column()
    Column("name", String(50), nullable=False),
# )
)
# 定义变量 posts，赋值为 Table("posts", metadata,
posts = Table("posts", metadata,
    # 调用 Column()
    Column("id", Integer, primary_key=True),
    # 调用 Column()
    Column("title", String(200)),
    # 调用 Column()
    Column("author_id", ForeignKey("users.id")),
# )
)

# 3. 建表
# 调用 metadata.create_all()
metadata.create_all(engine)

# 4. 插入数据
with engine.begin() as conn:  # begin 自动提交
    # 调用 conn.execute()
    conn.execute(insert(users), [
        # {"name": "小明"}, {"name": "小红"},
        {"name": "小明"}, {"name": "小红"},
    # ])
    ])
    # 调用 conn.execute()
    conn.execute(insert(posts), [
        # {"title": "Core 入门", "author_id": 1},
        {"title": "Core 入门", "author_id": 1},
        # {"title": "ORM 进阶", "author_id": 1},
        {"title": "ORM 进阶", "author_id": 1},
        # {"title": "查询技巧", "author_id": 2},
        {"title": "查询技巧", "author_id": 2},
    # ])
    ])

# 5. 查询：小明写的所有文章
# 使用上下文管理器 engine.connect()，赋值为 conn
with engine.connect() as conn:
    # 定义变量 stmt，赋值为 (
    stmt = (
        # 调用 select()
        select(posts.c.title, users.c.name)
        # .select_from(posts.join(users, posts.c.author_id =
        .select_from(posts.join(users, posts.c.author_id == users.c.id))
        # .where(users.c.name == "小明")
        .where(users.c.name == "小明")
    # )
    )
    # 遍历 conn.execute(stmt)，取 row
    for row in conn.execute(stmt):
        # 调用 print()
        print(f"{row.name} 写了《{row.title}》")
# SQL：SELECT posts.title, users.name FROM posts JOIN users ON ... WHERE users.name = ?
\`\`\`

## 十一、易错点小结

| 易错点 | 现象 | 正确做法 |
|--------|------|----------|
| 写完忘 \`commit()\` | 数据没存 | 用 \`with engine.begin()\` 自动提交 |
| \`delete(users)\` 漏 where | 清空整张表 | 删改必带 where |
| 用 \`select * \` 不安全 | 列顺序变就错 | 显式列出 \`select(users.c.name)\` |
| 连接不释放 | 连接池耗尽 | 用 \`with engine.connect()\` 自动归还 |
| SQLite 并发写 | \`database is locked\` | SQLite 写串行，生产用 PostgreSQL |
| \`default\` vs \`server_default\` 混淆 | 默认值时有时无 | Python 端用 default，DB 端用 server_default |
| 拿到失效连接 | 报错 Connection refused | 开 \`pool_pre_ping=True\` |
| \`echo=True\` 上生产 | 日志爆炸 | 生产关 echo |

## 十二、小结

Core 是 SQLAlchemy 的底层：\`create_engine\` 建连接工厂，\`MetaData+Table+Column\` 描述表结构，\`insert/select/update/delete\` 构造 SQL 表达式，\`conn.execute()\` 执行，\`commit()\` 提交事务。它贴近 SQL，适合复杂查询和理解底层。但日常增删改查用 Core 写还是啰嗦——下一章进入 ORM，用 Python 类和对象封装这些操作，代码会优雅得多。
`
  },

  // =========================================================
  // 第三十八章：SQLAlchemy ORM 模型
  // =========================================================
  {
    id: "sa-orm",
    group: "SQLAlchemy ORM",
    icon: "🏗️",
    title: "SQLAlchemy ORM 模型",
    content: `

# SQLAlchemy ORM 模型

## 一、ORM 是什么

**ORM**（Object-Relational Mapping，对象关系映射）在 Python 对象和数据库表之间建立映射：你写一个 \`User\` 类，它对应 \`users\` 表；创建 \`user = User(name="小明")\` 等于 \`INSERT\`；读 \`user.name\` 等于从行里取列。

\`\`\`txt filename="ORM 的映射关系"
Python 对象          数据库
─────────────       ─────────
User 类         ↔    users 表
user 实例       ↔    一行数据
user.name 属性  ↔    name 列
user.posts      ↔    JOIN 查询（关联数据）
\`\`\`

为什么用 ORM 而不是裸写 SQL：

1. **防 SQL 注入**：所有参数自动参数化绑定。
2. **面向对象**：操作 \`user.posts\` 而非 \`JOIN posts ON ...\`。
3. **数据库无关**：换数据库（SQLite → PostgreSQL）几乎只改连接串。
4. **类型安全**：2.0 配合类型注解，IDE 能补全列名。

## 二、1.x vs 2.0：重要范式切换

SQLAlchemy 2.0 在 2023 年发布，是重大升级。如果你看的教程还在用 \`Column(String)\`、\`session.query(User)\`，那是 1.x 老写法。

| 维度 | 1.x | 2.0 |
|------|-----|-----|
| 列定义 | \`Column(String, primary_key=True)\` | \`mapped_column(primary_key=True)\` + 类型注解 |
| 字段类型 | 在 Column 里写 | 用 \`Mapped[str]\` 注解声明 |
| 查询 | \`session.query(User).filter(...)\` | \`session.execute(select(User).where(...))\` |
| 关系 | 隐式懒加载 | 显式 \`Mapped["Post"]\` |
| 异步 | 实验性 | 一等公民（AsyncSession） |
| 风格 | 命令式 | 类型驱动、显式 |

> **学习建议**：新项目直接上 2.0。本章统一用 2.0 风格。

## 三、声明式基类与模型定义

\`\`\`python filename="models.py - 2.0 风格模型定义"
# 从 datetime 导入 datetime
from datetime import datetime
# 从 typing 导入 Optional, List
from typing import Optional, List
# 从 sqlalchemy 导入 String, ForeignKey, func
from sqlalchemy import String, ForeignKey, func
# 从 sqlalchemy.orm 导入 DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

# 1. 所有模型的基类：自定义一个 Base
# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    # """所有模型的根基类，被 Session 和迁移工具共享。"""
    """所有模型的根基类，被 Session 和迁移工具共享。"""
    # 空操作占位
    pass

# 2. User 模型 → 对应 users 表
# 定义类 User，继承 Base
class User(Base):
    __tablename__ = "users"  # 显式指定表名

    # Mapped[类型] 声明 Python 类型；mapped_column() 配置列属性
    id: Mapped[int] = mapped_column(primary_key=True)                    # 主键，自增整数
    name: Mapped[str] = mapped_column(String(50))                       # VARCHAR(50)，NOT NULL
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True)  # 唯一+索引
    hashed_password: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)  # 可空
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())  # 数据库端默认值

    # relationship：声明关联对象，不是表字段
    # 字段 posts，类型: Mapped[List["Post"]]，默认值: relationship(back_populates="author", cascade="all, delete-orphan")
    posts: Mapped[List["Post"]] = relationship(back_populates="author", cascade="all, delete-orphan")

    # 定义函数 __repr__，返回: str
    def __repr__(self) -> str:
        # 返回 f"<User id={self.id} name={self.name!r}>"
        return f"<User id={self.id} name={self.name!r}>"

# 3. Post 模型 → 对应 posts 表
# 定义类 Post，继承 Base
class Post(Base):
    # 定义变量 __tablename__，赋值为 "posts"
    __tablename__ = "posts"

    # 字段 id，类型: Mapped[int]，默认值: mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 字段 title，类型: Mapped[str]，默认值: mapped_column(String(200))
    title: Mapped[str] = mapped_column(String(200))
    # 字段 body，类型: Mapped[str]，默认值: mapped_column(String(5000))
    body: Mapped[str] = mapped_column(String(5000))
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))  # 外键
    published: Mapped[bool] = mapped_column(default=False)  # Python 端默认值

    # 字段 author，类型: Mapped["User"]，默认值: relationship(back_populates="posts")
    author: Mapped["User"] = relationship(back_populates="posts")

    # 定义函数 __repr__，返回: str
    def __repr__(self) -> str:
        # 返回 f"<Post id={self.id} title={self.title!r}>"
        return f"<Post id={self.id} title={self.title!r}>"
\`\`\`

### 关键概念逐个拆

**① \`DeclarativeBase\`**：所有模型的根基类。整个应用共享一个 \`Base.metadata\`，它收集所有表定义，建表/迁移时要用。

**② \`Mapped[T]\`**：类型注解，告诉 SQLAlchemy（和 IDE）字段的 Python 类型。常见映射：

\`\`\`txt filename="Mapped 类型 → SQL 类型映射"
Mapped[int]              → INTEGER
Mapped[str]              → VARCHAR（长度由 mapped_column(String(n)) 指定）
Mapped[bool]             → BOOLEAN
Mapped[datetime]         → DATETIME
Mapped[Optional[str]]    → 可空（等价 nullable=True）
Mapped[bytes]             → BLOB
\`\`\`

**③ \`mapped_column(...)\`**：配置列的数据库属性。常用参数：

| 参数 | 作用 |
|------|------|
| \`primary_key=True\` | 主键 |
| \`unique=True\` | 唯一约束 |
| \`index=True\` | 建索引 |
| \`nullable=False\` | 不允许 NULL |
| \`default=\` | Python 端默认值（插入时填） |
| \`server_default=func.now()\` | 数据库端默认值（写进 DDL） |

**④ \`__tablename__\`**：显式指定表名。不写则用类名小写，但显式写更清晰，推荐养成习惯。

**⑤ \`__repr__\`**：调试时打印对象会显示这个，方便排查。不是必须，但强烈建议写。

**⑥ \`relationship()\`**：声明对象间的关系，**不是表字段**，不会出现在 \`CREATE TABLE\` 里。它让你能写 \`user.posts\` 直接拿到关联数据。

## 四、engine 与建表

\`\`\`python filename="创建 engine 并建表"
# 从 sqlalchemy 导入 create_engine
from sqlalchemy import create_engine
# 从 models 导入 Base, User, Post
from models import Base, User, Post

# 开发用 SQLite
# 定义变量 engine，赋值为 create_engine("sqlite:///blog.db", echo=True)
engine = create_engine("sqlite:///blog.db", echo=True)

# 用 Base.metadata 一次性建所有表
# 调用 Base.metadata.create_all()
Base.metadata.create_all(engine)
# 生成 SQL：
# CREATE TABLE users (...);
# CREATE TABLE posts (...);
# 注意：只建不存在的表，已存在的不会动（不会改结构）
\`\`\`

> **\`create_all\` 不适合生产做表结构演进**。它只能建新表，不能改已有表（加列、改类型）。生产用 Alembic 做迁移。这里只是开发期快速建表。

## 五、Session：ORM 的工作入口

ORM 通过 **Session** 操作数据库。Session 是"工作区"：你创建对象、修改对象，Session 跟踪这些变化，\`commit()\` 时统一写入数据库。

\`\`\`python filename="创建 Session"
# 从 sqlalchemy.orm 导入 sessionmaker, Session
from sqlalchemy.orm import sessionmaker, Session

# 方式一：sessionmaker 工厂（推荐）
# 定义变量 SessionLocal，赋值为 sessionmaker(bind=engine, expire_on_commit=Fa...
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)

# 用时创建一个 session
# 定义变量 session，赋值为 SessionLocal()
session = SessionLocal()

# 方式二：直接用 Session
# 定义变量 session，赋值为 Session(engine)
session = Session(engine)
\`\`\`

\`\`\`python filename="Session 的基本工作流"
# 从 models 导入 User, Post
from models import User, Post

# 创建 session
# 定义变量 session，赋值为 SessionLocal()
session = SessionLocal()

# 尝试执行，捕获异常
try:
    # 1. 创建对象（还没入库）
    # 定义变量 user，赋值为 User(name="小明", email="xm@example.com")
    user = User(name="小明", email="xm@example.com")
    # 2. add 到 session（进入"待写入"区）
    # 调用 session.add()
    session.add(user)
    # 3. flush：把 INSERT 发到数据库（拿到 user.id），但未提交
    # 调用 session.flush()
    session.flush()
    print(user.id)  # 现在有值了
    # 4. 创建关联对象
    # 定义变量 post，赋值为 Post(title="第一篇", body="...", author_id=user....
    post = Post(title="第一篇", body="...", author_id=user.id)
    # 调用 session.add()
    session.add(post)
    # 5. commit：真正写入，事务结束
    # 调用 session.commit()
    session.commit()
# 捕获 Exception 异常
except Exception:
    session.rollback()  # 出错回滚
    # raise
    raise
# 无论是否异常都执行
finally:
    session.close()     # 用完关掉
\`\`\`

\`\`\`txt filename="Session 的几个关键动作"
add()      把对象加入"待写入区"
flush()    把变更发到数据库（执行 SQL），但未提交（可回滚）
commit()   flush + 提交事务，变更持久化
rollback() 回滚，撤销自上次 commit 以来的所有变更
close()    关闭 session，释放连接
\`\`\`

> **\`expire_on_commit=False\`**：默认 commit 后对象会"过期"，下次访问属性会重新查库。设为 False 后 commit 不重新查，对象保持可用。Web 应用通常设 False，避免 commit 后访问属性又触发查询。

## 六、在 Flask 里管理 Session

Web 应用每个请求用一个独立 Session，请求结束关闭。用依赖注入或上下文管理。

\`\`\`python filename="Flask 里管理 Session"
# 从 flask 导入 Flask, g
from flask import Flask, g
# 从 sqlalchemy 导入 create_engine
from sqlalchemy import create_engine
# 从 sqlalchemy.orm 导入 sessionmaker, declarative_base
from sqlalchemy.orm import sessionmaker, declarative_base

# 定义变量 engine，赋值为 create_engine("sqlite:///blog.db")
engine = create_engine("sqlite:///blog.db")
# 定义变量 SessionLocal，赋值为 sessionmaker(bind=engine, expire_on_commit=Fa...
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)
Base = declarative_base()  # 等价 DeclarativeBase 的旧式快捷写法

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 每个请求前建 session
# 装饰器：app.before_request
@app.before_request
# 定义函数 before_request，参数: 
def before_request():
    # g.db = SessionLocal()
    g.db = SessionLocal()

# 请求结束关闭
# 装饰器：app.teardown_request
@app.teardown_request
# 定义函数 teardown_request，参数: exc
def teardown_request(exc):
    # 定义变量 db，赋值为 g.pop("db", None)
    db = g.pop("db", None)
    # 条件判断：如果 db is not None
    if db is not None:
        # 调用 db.close()
        db.close()

# 视图里用 g.db
# 装饰器：app.route
@app.route("/users")
# 定义函数 list_users，参数: 
def list_users():
    users = g.db.query(User).all()  # 1.x 风格；2.0 用 select
    # 返回 {"users": [{"id": u.id, "name": u.name} for u in users]}
    return {"users": [{"id": u.id, "name": u.name} for u in users]}
\`\`\`

\`\`\`python filename="Flask-SQLAlchemy 扩展（更省心）"
# 从 flask 导入 Flask
from flask import Flask
# 从 flask_sqlalchemy 导入 SQLAlchemy
from flask_sqlalchemy import SQLAlchemy

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
# app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite://
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///blog.db"
# app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = Fal
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)  # db.session 自动管理，请求结束自动关

# 定义类 User，继承 db.Model
class User(db.Model):
    # 定义变量 id，赋值为 db.Column(db.Integer, primary_key=True)
    id = db.Column(db.Integer, primary_key=True)
    # 定义变量 name，赋值为 db.Column(db.String(50))
    name = db.Column(db.String(50))

# 装饰器：app.route
@app.route("/users")
# 定义函数 list_users，参数: 
def list_users():
    # 定义变量 users，赋值为 db.session.execute(db.select(User)).scalars()...
    users = db.session.execute(db.select(User)).scalars().all()
    # 返回 {"users": [{"id": u.id, "name": u.name} for u in users]}
    return {"users": [{"id": u.id, "name": u.name} for u in users]}
\`\`\`

## 七、易错点小结

| 易错点 | 现象 | 正确做法 |
|--------|------|----------|
| 忘 \`commit()\` | 数据没存 | 写操作后 commit |
| 一个 session 跨请求共享 | 数据错乱 | 每请求独立 session |
| 忘 \`close()\` | 连接泄漏 | 用 try/finally 或上下文 |
| \`Mapped[Optional[str]]\` 写成 \`Mapped[str]\` 又插 NULL | 报错 NOT NULL | 可空用 Optional |
| \`__tablename__\` 漏写 | 表名不可控 | 显式写表名 |
| \`relationship\` 写成 \`Column\` | 报错或建出列 | 关系用 relationship，不是列 |
| 多个 \`Base\` 混用 | metadata 找不到表 | 全应用一个 Base |
| \`expire_on_commit=True\` 又 commit 后访问 | 触发意外查询 | 设 False 或 aware 这个行为 |
| 用 1.x \`session.query\` 又看 2.0 文档 | 困惑 | 项目统一一种风格 |

## 八、小结

ORM 用 \`DeclarativeBase\` + \`Mapped[T]\` + \`mapped_column()\` 声明模型，\`__tablename__\` 指定表名，\`relationship()\` 声明关联。操作入口是 Session：\`add\` 进工作区，\`commit\` 持久化，\`rollback\` 撤销。Web 应用每请求一个独立 Session，请求结束关闭。下一章深入查询——select、where、order_by、join、聚合、防 N+1。
`
  },

  // =========================================================
  // 第三十九章：SQLAlchemy 查询
  // =========================================================
  {
    id: "sa-query",
    group: "SQLAlchemy ORM",
    icon: "🔍",
    title: "SQLAlchemy 查询",
    content: `

# SQLAlchemy 查询

## 一、查询的入口：select

2.0 风格用 \`select()\` 构造查询语句，\`session.execute()\` 执行。这是和 1.x \`session.query()\` 最大的区别。

\`\`\`python filename="select 基本用法"
# 从 sqlalchemy 导入 select
from sqlalchemy import select
# 从 sqlalchemy.orm 导入 Session
from sqlalchemy.orm import Session
# 从 models 导入 User, Post
from models import User, Post

session = SessionLocal()  # 假设已建好

# 1. 查所有 User
# 定义变量 stmt，赋值为 select(User)
stmt = select(User)
result = session.execute(stmt)         # 执行，返回 Result 对象
users = result.scalars().all()         # scalars() 取出每行的第一个元素（User 对象）
# users 是 list[User]

# 2. 查单个（按主键）
user = session.get(User, 1)            # 最快的方式，直接按主键查
# 等价 select(User).where(User.id == 1)

# 3. 查指定列
# 定义变量 stmt，赋值为 select(User.name, User.email)
stmt = select(User.name, User.email)
rows = session.execute(stmt).all()    # 每行是 Row，不是 User 对象
# 遍历 rows，取 row
for row in rows:
    # 调用 print()
    print(row.name, row.email)

# 4. 取一条
# 定义变量 stmt，赋值为 select(User).where(User.name == "小明")
stmt = select(User).where(User.name == "小明")
user = session.execute(stmt).scalar_one_or_none()  # 没有返回 None，多个报错
# 或 .first() 取第一条（多个不报错）
\`\`\`

\`\`\`txt filename="取结果的方法速查"
.scalars().all()      取所有，返回 list[对象]
.scalars().first()    取第一条，没有返回 None
.scalars().one()      必须恰好一条，没有或多个都报错
.scalars().one_or_none()  有一条返回，没有 None，多个报错
.scalar_one_or_none() 同上（直接对 execute 结果用）
.all()                不加 scalars，返回 list[Row]
\`\`\`

> **\`one()\` vs \`first()\` vs \`scalar_one()\`**：\`one\` 严格一条（多或无都报错，适合查唯一值如按 email 查用户）；\`first\` 取首条（适合列表）；\`scalar_one\` 严格一条且取第一列（适合 \`select(func.count())\`）。

## 二、where：过滤条件

\`\`\`python filename="where 条件"
# 1. 等值
# 调用 select()
select(User).where(User.name == "小明")
# WHERE name = ?

# 2. 不等
# 调用 select()
select(User).where(User.age != 18)
# 调用 select()
select(User).where(User.age > 18)

# 3. 多条件（默认 AND）
# 调用 select()
select(User).where(
    # User.age > 18,
    User.age > 18,
    # 调用 User.name.like()
    User.name.like("%明%"),
# )
)
# WHERE age > ? AND name LIKE ?

# 4. 显式 and_ / or_
# 从 sqlalchemy 导入 and_, or_
from sqlalchemy import and_, or_
# 调用 select()
select(User).where(
    # or_(
    or_(
        # User.name == "小明",
        User.name == "小明",
        # 调用 User.email.like()
        User.email.like("%example%"),
    # )
    )
# )
)

# 5. in / not in
# 调用 select()
select(User).where(User.id.in_([1, 2, 3]))
# 调用 select()
select(User).where(User.name.notin_(["admin", "root"]))

# 6. like / ilike（大小写不敏感）
# 调用 select()
select(Post).where(Post.title.like("%Jinja%"))
# 调用 select()
select(Post).where(Post.title.ilike("%jinja%"))

# 7. is null / is not null
# 调用 select()
select(User).where(User.email.is_(None))
# 调用 select()
select(User).where(User.email.is_not(None))

# 8. between
# 调用 select()
select(User).where(User.age.between(18, 60))

# 9. 字符串方法
# 调用 select()
select(User).where(User.name.startswith("小"))
# 调用 select()
select(User).where(User.name.endswith("明"))
# 调用 select()
select(User).where(User.name.contains("明"))
\`\`\`

## 三、order_by、limit、offset：排序与分页

\`\`\`python filename="排序与分页"
# 升序
# 调用 select()
select(User).order_by(User.name)
# 降序
# 从 sqlalchemy 导入 desc
from sqlalchemy import desc
# 调用 select()
select(User).order_by(desc(User.created_at))
# 多字段
# 调用 select()
select(User).order_by(User.age.desc(), User.name.asc())

# 分页：limit + offset
# 定义变量 page，赋值为 2
page = 2
# 定义变量 per_page，赋值为 10
per_page = 10
# 调用 select()
select(User).offset((page - 1) * per_page).limit(per_page)
# SQL：LIMIT 10 OFFSET 10
\`\`\`

> **分页必须固定排序**！不写 \`order_by\`，数据库返回顺序不保证（尤其分页时第二页可能和第一页重叠或漏数据）。分页前一定加 \`order_by\`。

## 四、聚合：func.count / sum / avg

\`\`\`python filename="聚合查询"
# 从 sqlalchemy 导入 func
from sqlalchemy import func

# 1. 计数
# 定义变量 stmt，赋值为 select(func.count()).select_from(User)
stmt = select(func.count()).select_from(User)
total = session.execute(stmt).scalar()  # 返回整数

# 2. 按字段分组聚合
# 定义变量 stmt，赋值为 (
stmt = (
    # 调用 select()
    select(Post.author_id, func.count().label("post_count"))
    # .group_by(Post.author_id)
    .group_by(Post.author_id)
# )
)
# 遍历 session.execute(stmt)，取 row
for row in session.execute(stmt):
    # 调用 print()
    print(f"作者 {row.author_id} 有 {row.post_count} 篇")
# SQL：SELECT author_id, COUNT(*) AS post_count FROM posts GROUP BY author_id

# 3. 多聚合
# 定义变量 stmt，赋值为 (
stmt = (
    # select(
    select(
        # Post.author_id,
        Post.author_id,
        # 调用 func.count()
        func.count().label("count"),
        # 调用 func.max()
        func.max(Post.id).label("max_id"),
        # 调用 func.avg()
        func.avg(func.char_length(Post.title)).label("avg_title_len"),
    # )
    )
    # .group_by(Post.author_id)
    .group_by(Post.author_id)
    .having(func.count() > 5)   # having 过滤分组
# )
)
\`\`\`

\`\`\`txt filename="常用聚合函数"
func.count()       COUNT(*)
func.count(User.id) COUNT(users.id)
func.sum(User.age)  SUM(age)
func.avg(User.age)  AVG(age)
func.max(User.age)  MAX(age)
func.min(User.age)  MIN(age)
\`\`\`

## 五、关联查询：join 与 selectinload

### 1. join：手写关联

\`\`\`python filename="join 查询"
# 查所有发布了文章的用户
# 定义变量 stmt，赋值为 (
stmt = (
    # 调用 select()
    select(User)
    .join(Post, Post.author_id == User.id)  # join 条件
    # .where(Post.published == True)
    .where(Post.published == True)
    .distinct()  # 去重，一个用户多篇文章别重复
# )
)
# 定义变量 users，赋值为 session.execute(stmt).scalars().all()
users = session.execute(stmt).scalars().all()

# 查文章同时带作者名
# 定义变量 stmt，赋值为 (
stmt = (
    # 调用 select()
    select(Post, User.name)
    # .join(User, Post.author_id == User.id)
    .join(User, Post.author_id == User.id)
# )
)
# 遍历 session.execute(stmt)，取 post, author_name
for post, author_name in session.execute(stmt):
    # 调用 print()
    print(f"{author_name} 写了《{post.title}》")
\`\`\`

### 2. 关系预加载：防止 N+1

\`\`\`txt filename="N+1 问题"
现象：查 10 篇文章，每篇显示作者名
  → 1 次查文章 + 10 次查每篇的作者 = 11 次查询（N+1）
原因：访问 user.posts 或 post.author 时，lazy 加载每次单独发 SQL
\`\`\`

\`\`\`python filename="lazy vs eager 加载"
# 从 sqlalchemy.orm 导入 selectinload, joinedload
from sqlalchemy.orm import selectinload, joinedload

# ❌ N+1：先查所有文章，循环里访问 author 触发逐条查
# 定义变量 posts，赋值为 session.execute(select(Post)).scalars().all()
posts = session.execute(select(Post)).scalars().all()
# 遍历 posts，取 p
for p in posts:
    print(p.author.name)  # 每次都发一次 SQL 查 author

# ✅ selectinload：用第二条 IN 查询一次性加载所有关联
# 定义变量 stmt，赋值为 select(Post).options(selectinload(Post.author...
stmt = select(Post).options(selectinload(Post.author))
# 定义变量 posts，赋值为 session.execute(stmt).scalars().all()
posts = session.execute(stmt).scalars().all()
# 遍历 posts，取 p
for p in posts:
    print(p.author.name)  # 不再发 SQL，已预加载
# SQL：SELECT * FROM posts; SELECT * FROM users WHERE id IN (1,2,3...)

# ✅ joinedload：用 JOIN 一次查回
# 定义变量 stmt，赋值为 select(Post).options(joinedload(Post.author))
stmt = select(Post).options(joinedload(Post.author))
# SQL：SELECT posts.*, users.* FROM posts JOIN users ON ...
\`\`\`

\`\`\`txt filename="selectinload vs joinedload"
selectinload  发额外一条 IN 查询，适合一对多（避免笛卡尔积爆炸）
joinedload    一条 JOIN 搞定，适合多对一/一对一
两者可链式      .options(selectinload(User.posts), joinedload(User.profile))
\`\`\`

## 六、insert / update / delete 语句

ORM 也能直接写语句（批量操作时比循环 \`add\` 高效）：

\`\`\`python filename="用 ORM 批量写"
# 从 sqlalchemy 导入 insert, update, delete
from sqlalchemy import insert, update, delete

# 批量插入
# 调用 session.execute()
session.execute(insert(User), [
    # {"name": "小华", "email": "xh@example.com"},
    {"name": "小华", "email": "xh@example.com"},
    # {"name": "小强", "email": "xq@example.com"},
    {"name": "小强", "email": "xq@example.com"},
# ])
])

# 批量更新
# session.execute(
session.execute(
    # 调用 update()
    update(User)
    # .where(User.name == "小华")
    .where(User.name == "小华")
    # .values(name="小华改")
    .values(name="小华改")
# )
)

# 批量删除
# 调用 session.execute()
session.execute(delete(Post).where(Post.published == False))

# 调用 session.commit()
session.commit()
\`\`\`

> **ORM 对象操作 vs 语句操作**：单个对象的增删改用 \`session.add(user)\` + 修改属性 + \`commit\`；批量操作用 \`insert/update/delete\` 语句更高效（不走 ORM 实例化）。

## 七、事务与回滚

\`\`\`python filename="ORM 事务控制"
# 定义变量 session，赋值为 SessionLocal()
session = SessionLocal()
# 尝试执行，捕获异常
try:
    # 定义变量 user，赋值为 User(name="小测试", email="test@example.com")
    user = User(name="小测试", email="test@example.com")
    # 调用 session.add()
    session.add(user)
    session.flush()       # 发 INSERT，拿到 id，但未提交
    # 这里如果出错
    # 抛出 ValueError 异常: "故意出错"
    raise ValueError("故意出错")
    # 调用 session.commit()
    session.commit()
# 捕获 Exception 异常
except Exception:
    session.rollback()    # 回滚，user 不会入库
    # raise
    raise
# 无论是否异常都执行
finally:
    # 调用 session.close()
    session.close()
\`\`\`

\`\`\`python filename="用 session 当上下文管理器"
# 自动提交/回滚（2.0 推荐写法）
# 使用上下文管理器 SessionLocal()，赋值为 session
with SessionLocal() as session:
    # 定义变量 user，赋值为 User(name="小测试", email="test@example.com")
    user = User(name="小测试", email="test@example.com")
    # 调用 session.add()
    session.add(user)
    # 调用 session.commit()
    session.commit()
# 出异常自动 rollback，结束自动 close
\`\`\`

## 八、完整 CRUD 示例

\`\`\`python filename="完整 CRUD 演示"
# 从 sqlalchemy 导入 create_engine, select, func, desc
from sqlalchemy import create_engine, select, func, desc
# 从 sqlalchemy.orm 导入 Session, sessionmaker
from sqlalchemy.orm import Session, sessionmaker
# 从 models 导入 Base, User, Post
from models import Base, User, Post

# 定义变量 engine，赋值为 create_engine("sqlite:///blog.db", echo=True)
engine = create_engine("sqlite:///blog.db", echo=True)
# 调用 Base.metadata.create_all()
Base.metadata.create_all(engine)
# 定义变量 SessionLocal，赋值为 sessionmaker(bind=engine, expire_on_commit=Fa...
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)

# === Create ===
# 使用上下文管理器 SessionLocal()，赋值为 session
with SessionLocal() as session:
    # 定义变量 alice，赋值为 User(name="Alice", email="alice@x.com")
    alice = User(name="Alice", email="alice@x.com")
    # 定义变量 bob，赋值为 User(name="Bob", email="bob@x.com")
    bob = User(name="Bob", email="bob@x.com")
    # 调用 session.add_all()
    session.add_all([alice, bob])
    session.flush()  # 拿到 id
    # session.add_all([
    session.add_all([
        # 调用 Post()
        Post(title="Py 入门", body="...", author_id=alice.id, published=True),
        # 调用 Post()
        Post(title="Web 实战", body="...", author_id=alice.id, published=True),
        # 调用 Post()
        Post(title="草稿", body="...", author_id=bob.id, published=False),
    # ])
    ])
    # 调用 session.commit()
    session.commit()

# === Read ===
# 使用上下文管理器 SessionLocal()，赋值为 session
with SessionLocal() as session:
    # 1. 查 Alice 的已发布文章（按时间降序）
    # 定义变量 stmt，赋值为 (
    stmt = (
        # 调用 select()
        select(Post)
        # .join(User)
        .join(User)
        # .where(User.name == "Alice", Post.published == Tru
        .where(User.name == "Alice", Post.published == True)
        # .order_by(desc(Post.id))
        .order_by(desc(Post.id))
    # )
    )
    # 定义变量 posts，赋值为 session.execute(stmt).scalars().all()
    posts = session.execute(stmt).scalars().all()

    # 2. 每个作者的文章数（防 N+1）
    # 定义变量 stmt，赋值为 (
    stmt = (
        # 调用 select()
        select(User)
        # .options(selectinload(User.posts))
        .options(selectinload(User.posts))
    # )
    )
    # 定义变量 users，赋值为 session.execute(stmt).scalars().all()
    users = session.execute(stmt).scalars().all()
    # 遍历 users，取 u
    for u in users:
        # 调用 print()
        print(f"{u.name} 有 {len(u.posts)} 篇")

    # 3. 文章总数
    # 定义变量 total，赋值为 session.execute(select(func.count()).select_f...
    total = session.execute(select(func.count()).select_from(Post)).scalar()

# === Update ===
# 使用上下文管理器 SessionLocal()，赋值为 session
with SessionLocal() as session:
    # 定义变量 post，赋值为 session.execute(select(Post).where(Post.id ==...
    post = session.execute(select(Post).where(Post.id == 1)).scalar_one()
    # post.title = "Python 入门（更新版）"
    post.title = "Python 入门（更新版）"
    # post.published = True
    post.published = True
    session.commit()  # 自动 UPDATE

# === Delete ===
# 使用上下文管理器 SessionLocal()，赋值为 session
with SessionLocal() as session:
    # 定义变量 post，赋值为 session.get(Post, 3)
    post = session.get(Post, 3)
    # 调用 session.delete()
    session.delete(post)
    # 调用 session.commit()
    session.commit()
\`\`\`

## 九、易错点小结

| 易错点 | 现象 | 正确做法 |
|--------|------|----------|
| 忘 \`commit()\` | 数据没存 | 写操作后 commit |
| 用 \`query()\` 又看 2.0 文档 | 困惑 | 项目统一 \`select\` |
| N+1 查询 | 列表页慢 | 用 \`selectinload\` 预加载 |
| \`scalar_one()\` 查可能多条的列 | 偶尔报错 | 用 \`one_or_none\` 或 \`first\` |
| 分页不 \`order_by\` | 顺序乱 | 分页前固定排序字段 |
| \`limit\` 没上限 | limit=99999 拖垮 DB | \`Query(le=100)\` 限制 |
| 用 \`==\` 比较时传 None | 不生效 | 用 \`is_(None)\` |
| 修改对象后不 commit | 改了没存 | 改完 commit |
| \`select(User.name)\` 后当 User 用 | 属性访问错 | 取多列返回 Row 不是对象 |
| 在循环里逐条 \`session.get\` | 慢 | 改用 \`where(id.in_([...]))\` |

## 十、小结

查询用 \`select\` + \`where\` + \`order_by\` + \`limit/offset\` + \`func\` 聚合，\`session.execute().scalars()\` 取结果。关联数据预加载用 \`selectinload\`（一对多）和 \`joinedload\`（多对一）防 N+1。写操作走 \`session.add/delete\` + \`commit\`，批量用 \`insert/update/delete\` 语句。事务用 \`with Session()\` 自动管理。下一章深入关系：一对多、多对多、cascade、加载策略。
`
  },

  // =========================================================
  // 第四十章：SQLAlchemy 关系
  // =========================================================
  {
    id: "sa-relationship",
    group: "SQLAlchemy ORM",
    icon: "🔗",
    title: "SQLAlchemy 关系",
    content: `

# SQLAlchemy 关系

## 一、关系建模回顾

真实业务的数据不是孤立的：用户有文章、文章有标签、订单有商品。数据库用**外键**表达"属于"关系，ORM 在外键之上用 \`relationship()\` 封装成 Python 属性，让你写 \`user.posts\` 而非手写 JOIN。

\`\`\`txt filename="三种基本关系基数"
一对多（1:N）  一个用户有多篇文章      用户是"一"，文章是"多"，外键在"多"方
一对一（1:1）  一个用户有一个资料      外键任一方，加唯一约束
多对多（M:N）  文章和标签互相属于      需要中间关联表
\`\`\`

## 二、一对多关系

最常见的关系：一个 User 有多个 Post。外键 \`author_id\` 在"多"的一方（posts 表）。

\`\`\`python filename="一对多关系定义"
# 从 sqlalchemy 导入 String, ForeignKey
from sqlalchemy import String, ForeignKey
# 从 sqlalchemy.orm 导入 Mapped, mapped_column, relationship, DeclarativeBase
from sqlalchemy.orm import Mapped, mapped_column, relationship, DeclarativeBase
# 从 typing 导入 List, Optional
from typing import List, Optional

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    # 空操作占位
    pass

# 定义类 User，继承 Base
class User(Base):
    # 定义变量 __tablename__，赋值为 "users"
    __tablename__ = "users"
    # 字段 id，类型: Mapped[int]，默认值: mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 字段 name，类型: Mapped[str]，默认值: mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(50))

    # "一"方：声明拥有的多个 Post
    # back_populates 让双向同步：user.posts 和 post.author 互相引用
    # 字段 posts，类型: Mapped[List["Post"]]，默认值: relationship(back_populates="author")
    posts: Mapped[List["Post"]] = relationship(back_populates="author")

# 定义类 Post，继承 Base
class Post(Base):
    # 定义变量 __tablename__，赋值为 "posts"
    __tablename__ = "posts"
    # 字段 id，类型: Mapped[int]，默认值: mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 字段 title，类型: Mapped[str]，默认值: mapped_column(String(200))
    title: Mapped[str] = mapped_column(String(200))
    # 外键指向 users.id
    # 字段 author_id，类型: Mapped[int]，默认值: mapped_column(ForeignKey("users.id"))
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # "多"方：声明属于哪个 User
    # 字段 author，类型: Mapped["User"]，默认值: relationship(back_populates="posts")
    author: Mapped["User"] = relationship(back_populates="posts")
\`\`\`

\`\`\`python filename="一对多关系使用"
# 使用上下文管理器 SessionLocal()，赋值为 session
with SessionLocal() as session:
    # 定义变量 alice，赋值为 User(name="Alice")
    alice = User(name="Alice")
    alice.posts = [  # 直接赋值关联对象，外键自动设
        # 调用 Post()
        Post(title="第一篇"),
        # 调用 Post()
        Post(title="第二篇"),
    # ]
    ]
    # 调用 session.add()
    session.add(alice)
    session.commit()  # 用户和两篇文章一起入库，author_id 自动填

    # 访问：user.posts 直接拿到列表
    # 定义变量 user，赋值为 session.get(User, 1)
    user = session.get(User, 1)
    # 遍历 user.posts，取 p
    for p in user.posts:
        # 调用 print()
        print(p.title)
    # 反向：post.author 拿到作者
    # 定义变量 post，赋值为 session.get(Post, 1)
    post = session.get(Post, 1)
    # 调用 print()
    print(post.author.name)
\`\`\`

> **\`back_populates\` 的作用**：让双向关系同步。设 \`alice.posts = [post1]\`，自动 \`post1.author = alice\`；反之亦然。不写就只能单向访问。

## 三、一对一关系

在一对多的"多"方加 \`uselist=False\`，就变成一对一。

\`\`\`python filename="一对一关系"
# 定义类 User，继承 Base
class User(Base):
    # 定义变量 __tablename__，赋值为 "users"
    __tablename__ = "users"
    # 字段 id，类型: Mapped[int]，默认值: mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 字段 name，类型: Mapped[str]，默认值: mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(50))
    # uselist=False：返回单个对象而非列表
    # 字段 profile，类型: Mapped["Profile"]，默认值: relationship(back_populates="user", uselist=False)
    profile: Mapped["Profile"] = relationship(back_populates="user", uselist=False)

# 定义类 Profile，继承 Base
class Profile(Base):
    # 定义变量 __tablename__，赋值为 "profiles"
    __tablename__ = "profiles"
    # 字段 id，类型: Mapped[int]，默认值: mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 字段 bio，类型: Mapped[str]，默认值: mapped_column(String(200))
    bio: Mapped[str] = mapped_column(String(200))
    # 外键 + 唯一约束保证一对一
    # 字段 user_id，类型: Mapped[int]，默认值: mapped_column(ForeignKey("users.id"), unique=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    # 字段 user，类型: Mapped["User"]，默认值: relationship(back_populates="profile")
    user: Mapped["User"] = relationship(back_populates="profile")

# 使用
# 定义变量 user，赋值为 User(name="Alice", profile=Profile(bio="爱编程")...
user = User(name="Alice", profile=Profile(bio="爱编程"))
# 调用 session.add()
session.add(user)
# 调用 session.commit()
session.commit()
print(user.profile.bio)  # 单个对象，不是列表
\`\`\`

## 四、多对多关系

文章和标签：一篇文章有多个标签，一个标签属于多篇文章。需要**中间关联表**。

\`\`\`python filename="多对多关系"
# 从 sqlalchemy 导入 Table, Column
from sqlalchemy import Table, Column

# 1. 中间表（用 Core 的 Table 定义，不是 ORM 类）
# 定义变量 post_tags，赋值为 Table(
post_tags = Table(
    # "post_tags", Base.metadata,
    "post_tags", Base.metadata,
    # 调用 Column()
    Column("post_id", ForeignKey("posts.id"), primary_key=True),
    # 调用 Column()
    Column("tag_id", ForeignKey("tags.id"), primary_key=True),
# )
)

# 定义类 Tag，继承 Base
class Tag(Base):
    # 定义变量 __tablename__，赋值为 "tags"
    __tablename__ = "tags"
    # 字段 id，类型: Mapped[int]，默认值: mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 字段 name，类型: Mapped[str]，默认值: mapped_column(String(30), unique=True)
    name: Mapped[str] = mapped_column(String(30), unique=True)
    # secondary 指向中间表
    # 字段 posts，类型: Mapped[List["Post"]]，默认值: relationship(secondary=post_tags, back_populates="tags")
    posts: Mapped[List["Post"]] = relationship(secondary=post_tags, back_populates="tags")

# 定义类 Post，继承 Base
class Post(Base):
    # 定义变量 __tablename__，赋值为 "posts"
    __tablename__ = "posts"
    # 字段 id，类型: Mapped[int]，默认值: mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 字段 title，类型: Mapped[str]，默认值: mapped_column(String(200))
    title: Mapped[str] = mapped_column(String(200))
    # 字段 tags，类型: Mapped[List["Tag"]]，默认值: relationship(secondary=post_tags, back_populates="posts")
    tags: Mapped[List["Tag"]] = relationship(secondary=post_tags, back_populates="posts")

# 使用
# 定义变量 py_tag，赋值为 Tag(name="Python")
py_tag = Tag(name="Python")
# 定义变量 web_tag，赋值为 Tag(name="Web")
web_tag = Tag(name="Web")
# 定义变量 post，赋值为 Post(title="Flask 入门", tags=[py_tag, web_tag]...
post = Post(title="Flask 入门", tags=[py_tag, web_tag])
# 调用 session.add_all()
session.add_all([py_tag, web_tag, post])
# 调用 session.commit()
session.commit()

# 查文章的所有标签
# 遍历 post.tags，取 t
for t in post.tags:
    # 调用 print()
    print(t.name)
# 反向：查标签下的所有文章
# 遍历 py_tag.posts，取 p
for p in py_tag.posts:
    # 调用 print()
    print(p.title)
\`\`\`

\`\`\`txt filename="多对多中间表设计要点"
- 中间表只放两个外键（联合主键），不放业务字段
- 用 Core 的 Table 定义，不用 ORM 类（除非中间表要额外字段）
- 双方都写 secondary 指向同一中间表
- 添加/删除关联：操作任意一方的列表，中间表自动同步
\`\`\`

## 五、cascade：级联操作

删一个用户时，他的文章怎么办？\`cascade\` 控制级联行为。

\`\`\`python filename="cascade 配置"
# 定义类 User，继承 Base
class User(Base):
    # ...
    # 字段 posts，类型: Mapped[List["Post"]]，默认值: relationship(
    posts: Mapped[List["Post"]] = relationship(
        # 定义变量 back_populates，赋值为 "author",
        back_populates="author",
        cascade="all, delete-orphan",  # ★ 关键配置
    # )
    )

# cascade 选项：
# save-update    默认，add/commit 时同步关联对象
# merge          默认，merge 时同步
# delete         删父时连子一起删
# delete-orphan  父解除关联时，孤儿子对象也删（重要！）
# all            = save-update + merge + delete + ...
\`\`\`

\`\`\`python filename="cascade 效果"
# cascade="all, delete-orphan"
session.delete(alice)  # 删 alice，她的所有 post 自动删
# 调用 session.commit()
session.commit()

# 解除关联也删孤儿
alice.posts.remove(post1)  # post1 不再属于 alice → 自动删 post1
# 调用 session.commit()
session.commit()
\`\`\`

> **\`delete-orphan\` 慎用**：只在"子对象的生命周期完全依附父对象"时用。比如用户的文章可以删。但"订单-商品"不行——删订单不该删商品（商品是共享资源）。这时用 \`cascade="save-update, merge"\`，删订单时商品留着。

## 六、加载策略：lazy vs eager

访问 \`user.posts\` 时，SQL 什么时候发？由 \`lazy\` 参数控制。

\`\`\`python filename="加载策略对比"
# 1. lazy="select"（默认）：访问时才发一条 SQL
# 字段 posts，类型: Mapped[...]，默认值: relationship(lazy="select")
posts: Mapped[...] = relationship(lazy="select")

# 2. lazy="joined"：JOIN 一次性查回（eager）
# 字段 posts，类型: Mapped[...]，默认值: relationship(lazy="joined")
posts: Mapped[...] = relationship(lazy="joined")

# 3. lazy="selectin"：发第二条 IN 查询（eager，推荐一对多）
# 字段 posts，类型: Mapped[...]，默认值: relationship(lazy="selectin")
posts: Mapped[...] = relationship(lazy="selectin")

# 4. lazy="subquery"：子查询（少用）

# 5. lazy="raise"：访问就报错（强制你显式预加载，防 N+1）
# 字段 posts，类型: Mapped[...]，默认值: relationship(lazy="raise")
posts: Mapped[...] = relationship(lazy="raise")

# 6. lazy="noload"：永远返回空（权限控制）
# 字段 posts，类型: Mapped[...]，默认值: relationship(lazy="noload")
posts: Mapped[...] = relationship(lazy="noload")
\`\`\`

\`\`\`txt filename="lazy vs selectin vs joined 选型"
默认 lazy="select"   简单，但易 N+1
lazy="selectin"       一对多首选（避免 JOIN 笛卡尔积）
lazy="joined"         多对一/一对一首选（一条 JOIN 搞定）
lazy="raise"          开发期强制显式预加载，杜绝 N+1
\`\`\`

\`\`\`python filename="运行时按需切换加载策略"
# 从 sqlalchemy.orm 导入 selectinload, joinedload, raiseload
from sqlalchemy.orm import selectinload, joinedload, raiseload

# 这次查询要预加载 posts
# 定义变量 stmt，赋值为 select(User).options(selectinload(User.posts)...
stmt = select(User).options(selectinload(User.posts))

# 这次查询不要 posts（提速）
# 定义变量 stmt，赋值为 select(User).options(raiseload(User.posts))
stmt = select(User).options(raiseload(User.posts))

# 同时预加载 posts 和 posts 的 tags（多层）
# 定义变量 stmt，赋值为 select(User).options(selectinload(User.posts)...
stmt = select(User).options(selectinload(User.posts).selectinload(Post.tags))
\`\`\`

## 七、N+1 问题详解

\`\`\`txt filename="N+1 问题"
场景：列表页显示 10 篇文章 + 每篇的作者名
代码：
  posts = session.execute(select(Post)).scalars().all()   # 1 次
  for p in posts:
      print(p.author.name)                                  # 每次发 1 次
后果：1 + 10 = 11 次 SQL，页面慢
\`\`\`

\`\`\`python filename="解决 N+1 的几种方式"
# 方式一：joinedload（多对一推荐）
# 定义变量 posts，赋值为 session.execute(
posts = session.execute(
    # 调用 select()
    select(Post).options(joinedload(Post.author))
# ).scalars().all()
).scalars().all()
# SQL：SELECT posts.*, users.* FROM posts JOIN users ON ...

# 方式二：selectinload（一对多推荐，避免笛卡尔积）
# 定义变量 users，赋值为 session.execute(
users = session.execute(
    # 调用 select()
    select(User).options(selectinload(User.posts))
# ).scalars().all()
).scalars().all()
# SQL：SELECT * FROM users; SELECT * FROM posts WHERE user_id IN (1,2,3...)

# 方式三：开发期强制暴露 N+1
# 把 lazy 设成 "raise"，访问关系就报错，逼你显式预加载
# 字段 posts，类型: Mapped[...]，默认值: relationship(lazy="raise")
posts: Mapped[...] = relationship(lazy="raise")
\`\`\`

\`\`\`txt filename="N+1 自查方法"
开启 echo=True，看控制台 SQL 数量
列表页只该 1-3 条 SQL，超过就要查 N+1
SQLAlchemy 有个 SQL 日志统计工具，能数出每次请求的查询数
\`\`\`

## 八、完整示例：博客三表关系

\`\`\`python filename="博客三表模型 - User / Post / Tag"
# 从 datetime 导入 datetime
from datetime import datetime
# 从 typing 导入 List, Optional
from typing import List, Optional
# 从 sqlalchemy 导入 String, Text, DateTime, ForeignKey, Table, Column, func
from sqlalchemy import String, Text, DateTime, ForeignKey, Table, Column, func
# 从 sqlalchemy.orm 导入 DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    # 空操作占位
    pass

# 多对多中间表
# 定义变量 post_tags，赋值为 Table(
post_tags = Table(
    # "post_tags", Base.metadata,
    "post_tags", Base.metadata,
    # 调用 Column()
    Column("post_id", ForeignKey("posts.id"), primary_key=True),
    # 调用 Column()
    Column("tag_id", ForeignKey("tags.id"), primary_key=True),
# )
)

# 定义类 User，继承 Base
class User(Base):
    # 定义变量 __tablename__，赋值为 "users"
    __tablename__ = "users"
    # 字段 id，类型: Mapped[int]，默认值: mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 字段 name，类型: Mapped[str]，默认值: mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(50))
    # 字段 email，类型: Mapped[str]，默认值: mapped_column(String(120), unique=True)
    email: Mapped[str] = mapped_column(String(120), unique=True)
    # 字段 created_at，类型: Mapped[datetime]，默认值: mapped_column(server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    # 一对多：用户拥有多篇文章
    # 字段 posts，类型: Mapped[List["Post"]]，默认值: relationship(
    posts: Mapped[List["Post"]] = relationship(
        # 定义变量 back_populates，赋值为 "author",
        back_populates="author",
        cascade="all, delete-orphan",  # 删用户连文章一起删
    # )
    )

    # 定义函数 __repr__，参数: self
    def __repr__(self):
        # 返回 f"<User {self.name}>"
        return f"<User {self.name}>"

# 定义类 Post，继承 Base
class Post(Base):
    # 定义变量 __tablename__，赋值为 "posts"
    __tablename__ = "posts"
    # 字段 id，类型: Mapped[int]，默认值: mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 字段 title，类型: Mapped[str]，默认值: mapped_column(String(200))
    title: Mapped[str] = mapped_column(String(200))
    # 字段 body，类型: Mapped[Optional[str]]，默认值: mapped_column(Text)
    body: Mapped[Optional[str]] = mapped_column(Text)
    # 字段 published，类型: Mapped[bool]，默认值: mapped_column(default=False)
    published: Mapped[bool] = mapped_column(default=False)
    # 字段 created_at，类型: Mapped[datetime]，默认值: mapped_column(server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    # 字段 author_id，类型: Mapped[int]，默认值: mapped_column(ForeignKey("users.id"))
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # 多对一：文章属于一个作者
    # 字段 author，类型: Mapped["User"]，默认值: relationship(back_populates="posts")
    author: Mapped["User"] = relationship(back_populates="posts")
    # 多对多：文章有多个标签
    # 字段 tags，类型: Mapped[List["Tag"]]，默认值: relationship(
    tags: Mapped[List["Tag"]] = relationship(
        # 定义变量 secondary，赋值为 post_tags, back_populates="posts"
        secondary=post_tags, back_populates="posts"
    # )
    )

    # 定义函数 __repr__，参数: self
    def __repr__(self):
        # 返回 f"<Post {self.title}>"
        return f"<Post {self.title}>"

# 定义类 Tag，继承 Base
class Tag(Base):
    # 定义变量 __tablename__，赋值为 "tags"
    __tablename__ = "tags"
    # 字段 id，类型: Mapped[int]，默认值: mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 字段 name，类型: Mapped[str]，默认值: mapped_column(String(30), unique=True)
    name: Mapped[str] = mapped_column(String(30), unique=True)
    # 多对多的另一端
    # 字段 posts，类型: Mapped[List["Post"]]，默认值: relationship(
    posts: Mapped[List["Post"]] = relationship(
        # 定义变量 secondary，赋值为 post_tags, back_populates="tags"
        secondary=post_tags, back_populates="tags"
    # )
    )

    # 定义函数 __repr__，参数: self
    def __repr__(self):
        # 返回 f"<Tag {self.name}>"
        return f"<Tag {self.name}>"
\`\`\`

\`\`\`python filename="使用三表关系"
# 从 sqlalchemy 导入 create_engine, select
from sqlalchemy import create_engine, select
# 从 sqlalchemy.orm 导入 sessionmaker, selectinload, joinedload
from sqlalchemy.orm import sessionmaker, selectinload, joinedload

# 定义变量 engine，赋值为 create_engine("sqlite:///blog.db", echo=True)
engine = create_engine("sqlite:///blog.db", echo=True)
# 调用 Base.metadata.create_all()
Base.metadata.create_all(engine)
# 定义变量 SessionLocal，赋值为 sessionmaker(bind=engine, expire_on_commit=Fa...
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)

# 使用上下文管理器 SessionLocal()，赋值为 session
with SessionLocal() as session:
    # 建数据
    # 定义变量 alice，赋值为 User(name="Alice", email="a@x.com")
    alice = User(name="Alice", email="a@x.com")
    # 定义变量 py，赋值为 Tag(name="Python")
    py = Tag(name="Python")
    # 定义变量 web，赋值为 Tag(name="Web")
    web = Tag(name="Web")
    # alice.posts = [
    alice.posts = [
        # 调用 Post()
        Post(title="Jinja2", tags=[py, web], published=True),
        # 调用 Post()
        Post(title="ORM", tags=[py], published=False),
    # ]
    ]
    # 调用 session.add()
    session.add(alice)
    # 调用 session.commit()
    session.commit()

    # 查询：列表页要显示作者和标签（防 N+1）
    # 定义变量 stmt，赋值为 (
    stmt = (
        # 调用 select()
        select(Post)
        # .where(Post.published == True)
        .where(Post.published == True)
        # .options(
        .options(
            joinedload(Post.author),        # 多对一用 joined
            selectinload(Post.tags),         # 多对多用 selectin
        # )
        )
        # .order_by(Post.created_at.desc())
        .order_by(Post.created_at.desc())
    # )
    )
    # 定义变量 posts，赋值为 session.execute(stmt).scalars().all()
    posts = session.execute(stmt).scalars().all()
    # 遍历 posts，取 p
    for p in posts:
        # 调用 print()
        print(f"{p.title} by {p.author.name}")
        # 调用 print()
        print("  标签：", ", ".join(t.name for t in p.tags))
    # 只发 2 条 SQL：一条 JOIN 查 post+user，一条 IN 查 tags

    # 查 Alice 的所有文章（通过关系访问）
    # 定义变量 alice，赋值为 session.get(User, 1)
    alice = session.get(User, 1)
    print(f"{alice.name} 有 {len(alice.posts)} 篇")  # 触发查询

    # 删 Alice：cascade 连文章一起删
    # 调用 session.delete()
    session.delete(alice)
    # 调用 session.commit()
    session.commit()
\`\`\`

## 九、易错点小结

| 易错点 | 现象 | 正确做法 |
|--------|------|----------|
| N+1 查询 | 列表页慢 | 用 \`selectinload\`/\`joinedload\` 预加载 |
| \`back_populates\` 名字写错 | 双向访问失败 | 严格对应对方的关系名 |
| \`cascade="delete-orphan"\` 误用 | 共享资源被删 | 只在子完全依附父时用 |
| 多对多忘写 \`secondary\` | 报错或变成一对多 | 双方都指向中间表 |
| 中间表用 ORM 类定义 | 难管理 | 用 Core 的 \`Table\` |
| 一对一忘 \`uselist=False\` | 返回列表 | 加 \`uselist=False\` |
| 改外键不通过关系 | 双向不同步 | 用 \`post.author = user\` 而非 \`post.author_id = id\` |
| \`lazy="joined"\` 用在一对多 | 笛卡尔积爆炸 | 一对多用 \`selectin\` |
| 删父未配 cascade | 孤儿子对象残留 | 按业务配 \`cascade\` |
| 预加载多层关系漏写 | 第二层 N+1 | 链式 \`.options(selectinload(...).selectinload(...))\` |

## 十、小结

关系建模三种基数：一对多（外键在多方）、一对一（加 \`uselist=False\`）、多对多（中间表 + \`secondary\`）。\`back_populates\` 实现双向同步，\`cascade\` 控制级联删除。\`lazy\` 控制加载时机：默认 \`select\` 易 N+1，\`selectin\` 适合一对多，\`joined\` 适合多对一，\`raise\` 开发期强制预加载。核心技能是识别 N+1 并用合适的预加载策略消除。至此 SQLAlchemy 篇闭环：Core → 模型 → 查询 → 关系，下一章进入表单与文件上传。
`
  },
];
