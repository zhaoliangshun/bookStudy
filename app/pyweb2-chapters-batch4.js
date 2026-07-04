// =============================================================
// Python Web 后端开发实战教程（全新版）—— 第 4 批章节
// 主题：ORM 与 SQLAlchemy（共 7 章）
// -------------------------------------------------------------
// 本批包含 7 章：
//   pyweb2-orm-concepts        : ORM 概念与设计模式
//   pyweb2-sqlalchemy-core     : SQLAlchemy Core 与引擎
//   pyweb2-sqlalchemy-orm      : SQLAlchemy ORM 模型定义
//   pyweb2-sqlalchemy-session  : Session 与事务管理
//   pyweb2-sqlalchemy-relations: 关系映射（一对多/多对多/一对一）
//   pyweb2-sqlalchemy-query    : 查询、过滤、排序与聚合
//   pyweb2-alembic             : Alembic 数据库迁移
//
// 教程定位：纯阅读型，代码示例在 content 的 markdown 代码块中展示。
// 统一采用 SQLAlchemy 2.0 风格 API（select() 而非 query()）。
// 重点讲清「为什么」和「怎么想」，框架会变，ORM 原理长存。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：ORM 概念与设计模式
  // ============================================================
  {
    id: "pyweb2-orm-concepts",
    group: "ORM 与 SQLAlchemy",
    icon: "🗃️",
    title: "ORM 概念与设计模式",
    content: `# ORM 概念与设计模式

## 一句话定义

ORM（Object-Relational Mapping，对象关系映射）是一种把**关系型数据库里的表**和**面向对象编程语言里的类**自动对应起来的技术。简单说：你写 Python 类，ORM 帮你把它翻译成 SQL 语句去操作数据库；你拿到查询结果，ORM 帮你把它组装成 Python 对象。

把名字拆开看：
- **Object（对象）**：面向对象语言里的对象（Python 里的类实例）。
- **Relational（关系）**：关系型数据库（MySQL、PostgreSQL、SQLite），数据存在二维表里，表和表之间有关系。
- **Mapping（映射）**：在两者之间架一座桥，自动转换。

ORM 干的事就是：**类 → 表，对象 → 行，属性 → 列**。一个 \`User\` 类对应一张 \`users\` 表，一个 \`User(name="Tom")\` 对象对应表里一行数据，\`user.name\` 对应 \`name\` 列。

## 为什么需要 ORM

直接用数据库驱动（比如 \`psycopg2\`、\`pymysql\`）写 SQL 也能干活，为什么要多一层 ORM？主要有四个原因：

### 1. 防 SQL 注入

SQL 注入是 Web 安全的头号杀手。攻击者在输入框里塞一段 SQL，如果你的代码直接拼接字符串，这段 SQL 就会被执行。

**错误的纯 SQL 写法：**

\`\`\`python
# 危险！直接拼接字符串，会被注入
# 定义变量 username，赋值为 request.form.get("username")
username = request.form.get("username")
# 定义变量 sql，赋值为拼接的 SQL 字符串
sql = f"SELECT * FROM users WHERE name = '{username}'"
# 攻击者输入 username = "tom' OR '1'='1"
# 最终 SQL 变成：SELECT * FROM users WHERE name = 'tom' OR '1'='1'
# '1'='1' 永远为真，整个表都被查出来了
# 调用 cursor.execute()
cursor.execute(sql)
\`\`\`

**ORM 的写法：** ORM 内部使用**参数化查询**，自动把用户输入当数据而不是代码，从根本上杜绝注入。

\`\`\`python
# ORM 会自动参数化，安全
# 定义变量 stmt，赋值为 select(User).where(User.name == username)
stmt = select(User).where(User.name == username)
# 调用 session.execute()
result = session.execute(stmt)
# 不管 username 里塞什么，都只当字符串值处理
\`\`\`

### 2. 类型安全

SQL 返回的是元组，你得记着第几列是什么：

\`\`\`python
# 纯 SQL：返回元组，靠下标取值，容易记错
# 定义变量 row，赋值为 cursor.fetchone()
row = cursor.fetchone()
# row[0] 是 id？row[1] 是 name？全靠记忆，一改表结构就崩
# 定义变量 name，赋值为 row[1]
name = row[1]
\`\`\`

ORM 返回的是对象，用属性访问，IDE 能补全，改了字段名编译期就报错：

\`\`\`python
# ORM：返回对象，用属性访问
# 定义变量 user，赋值为 session.scalars(...).first()
user = session.scalars(select(User)).first()
# user.name 清晰明确，IDE 能自动补全
# 定义变量 name，赋值为 user.name
name = user.name
\`\`\`

### 3. 可维护性

纯 SQL 散落在代码各处，改表结构要全局搜索 SQL 字符串。ORM 把表结构定义集中在模型类里，改一处全局生效。而且 ORM 代码是 Python，能用重构工具改名、提取方法。

### 4. 数据库可移植性

不同数据库的 SQL 方言有差异（自增主键写法、分页语法、日期函数）。ORM 帮你屏蔽这些差异，换数据库只改连接字符串，业务代码基本不动。

## 两种主流模式：Active Record vs Data Mapper

ORM 世界有两个主要设计模式，理解它们能帮你快速上手不同的 ORM 框架。

### Active Record 模式

**核心思想**：数据和行为绑定在同一个对象上。模型对象既存数据，也负责自己的增删改查。

代表：Django ORM、Ruby on Rails 的 ActiveRecord、SQLAlchemy 的旧式 Active Record 扩展。

\`\`\`python
# Active Record 风格（Django ORM 示例）
# 创建对象 = 一行数据
# 定义变量 user，赋值为 User(name="Tom", email="tom@a.com")
user = User(name="Tom", email="tom@a.com")
# 对象自己负责保存，调用 save() 方法
# 调用 user.save()
user.save()

# 查询也是类方法
# 定义变量 users，赋值为 User.objects.filter(name="Tom")
users = User.objects.filter(name="Tom")
\`\`\`

优点：简单直观，一行代码搞定 CRUD，上手快。
缺点：模型类承担太多职责（既是数据容器又是数据访问层），违反单一职责原则，业务复杂后模型越来越胖。

### Data Mapper 模式

**核心思想**：数据和操作分离。模型对象只是纯粹的数据容器（POPO - Plain Old Python Object），所有数据库操作由独立的 Mapper（在 SQLAlchemy 里叫 Session）负责。

代表：SQLAlchemy、Java 的 Hibernate/JPA。

\`\`\`python
# Data Mapper 风格（SQLAlchemy 示例）
# 创建对象 = 只是创建一个普通 Python 对象，不碰数据库
# 定义变量 user，赋值为 User(name="Tom", email="tom@a.com")
user = User(name="Tom", email="tom@a.com")

# 由独立的 Session 负责保存
# 调用 session.add(user)
session.add(user)
# 调用 session.commit()
session.commit()

# 查询也通过 Session
# 定义变量 stmt，赋值为 select(User).where(User.name == "Tom")
stmt = select(User).where(User.name == "Tom")
# 定义变量 users，赋值为 session.scalars(stmt).all()
users = session.scalars(stmt).all()
\`\`\`

优点：职责分离清晰，模型类纯粹，方便测试和演进。
缺点：多了一个 Session 概念，初学者要理解多一层抽象。

**记忆口诀**：Active Record 是「对象自己存自己」，Data Mapper 是「仓库管理员（Session）帮你存对象」。

## ORM 优缺点对比

### 优点

| 优点 | 说明 |
|------|------|
| 提高开发效率 | 不用写重复的 SQL 模板代码，专注业务逻辑 |
| 防 SQL 注入 | 默认参数化查询，安全性有保障 |
| 类型安全 | IDE 补全、静态检查，减少低级错误 |
| 数据库抽象 | 换数据库成本低，SQL 方言被屏蔽 |
| 关系映射 | 一对多、多对多等关系自动处理 JOIN |
| 迁移工具 | 配合 Alembic 等工具，数据库结构版本化 |

### 缺点

| 缺点 | 说明 |
|------|------|
| 性能损耗 | 多一层对象映射，比手写 SQL 慢一些 |
| 学习曲线 | 要理解 Session、懒加载、级联等概念 |
| 复杂查询难写 | 多表联合、窗口函数用 ORM 写起来别扭 |
| 隐藏细节 | 生成的 SQL 可能低效，新手不知道优化 |
| N+1 问题 | 不小心就会触发大量小查询 |

**关键认知**：ORM 不是「替代 SQL」，而是「让你少写 80% 的 CRUD SQL」。剩下 20% 的复杂查询，该手写 SQL 还得手写（ORM 都支持原生 SQL）。

## N+1 查询问题简介

这是 ORM 最经典的性能陷阱，必须提早认识。

**场景**：查询 100 个用户，再取每个用户的文章数。

**错误写法（N+1 查询）**：

\`\`\`python
# 第 1 次查询：取 100 个用户
# 定义变量 users，赋值为 session.scalars(select(User)).all()
users = session.scalars(select(User)).all()

# 遍历每个用户
# 循环：for user in users
for user in users:
    # 每次访问 user.posts 都触发一次 SQL 查询！
    # 这就是 N+1：1 次查用户 + N 次查文章
    # 定义变量 count，赋值为 len(user.posts)
    count = len(user.posts)
    # 打印
    print(user.name, count)
# 一共 101 次 SQL 查询，性能灾难
\`\`\`

**正确写法（预加载，2 次查询）**：

\`\`\`python
# 从 sqlalchemy.orm 导入 selectinload
from sqlalchemy.orm import selectinload

# 用 selectinload 预加载 posts，一次把所有用户的文章都查出来
# 定义变量 stmt，赋值为 select(User).options(selectinload(User.posts))
stmt = select(User).options(selectinload(User.posts))
# 定义变量 users，赋值为 session.scalars(stmt).all()
users = session.scalars(stmt).all()

# 循环：for user in users
for user in users:
    # user.posts 已经在内存里，不再发 SQL
    # 定义变量 count，赋值为 len(user.posts)
    count = len(user.posts)
    # 打印
    print(user.name, count)
# 一共 2 次 SQL 查询，性能正常
\`\`\`

记住：**凡是循环里访问关系属性（如 \`user.posts\`），就要警惕 N+1**。后面章节会详细讲预加载策略。

## 纯 SQL vs ORM 对比示例

用同一个需求「查询年龄大于 18 的用户并按名字排序」，对比两种写法。

### 纯 SQL 写法（用 sqlite3 标准库）

\`\`\`python
# 导入 sqlite3
import sqlite3

# 连接数据库
# 定义变量 conn，赋值为 sqlite3.connect("app.db")
conn = sqlite3.connect("app.db")
# 定义变量 cursor，赋值为 conn.cursor()
cursor = conn.cursor()

# 手写 SQL，注意参数化（用 ? 占位符防注入）
# 定义变量 sql，赋值为 SQL 字符串
sql = "SELECT id, name, age, email FROM users WHERE age > ? ORDER BY name"
# 调用 cursor.execute()，传入参数元组
cursor.execute(sql, (18,))

# 把结果行手动组装成字典列表
# 定义变量 users，赋值为列表推导式
users = [
    {"id": row[0], "name": row[1], "age": row[2], "email": row[3]}
    # 循环：for row in cursor.fetchall()
    for row in cursor.fetchall()
]

# 调用 conn.close()
conn.close()
# 打印
print(users)
\`\`\`

### ORM 写法（用 SQLAlchemy）

\`\`\`python
# 从 sqlalchemy 导入 create_engine, select
from sqlalchemy import create_engine, select
# 从 sqlalchemy.orm 导入 Session
from sqlalchemy.orm import Session

# 定义变量 engine，赋值为 create_engine("sqlite:///app.db")
engine = create_engine("sqlite:///app.db")

# 用上下文管理器创建 Session
# with Session() as session:
with Session(engine) as session:
    # 构造查询语句，类型安全
    # 定义变量 stmt，赋值为 select(User).where(User.age > 18).order_by(User.name)
    stmt = select(User).where(User.age > 18).order_by(User.name)
    # 执行查询，自动组装成 User 对象列表
    # 定义变量 users，赋值为 session.scalars(stmt).all()
    users = session.scalars(stmt).all()

# 遍历：for user in users
for user in users:
    # 直接用属性访问，类型安全
    # 打印
    print(user.name, user.age, user.email)
\`\`\`

### 对比总结

| 维度 | 纯 SQL | ORM |
|------|--------|-----|
| 代码量 | 多（手写 SQL + 手动组装对象） | 少（声明式） |
| 类型安全 | 无（靠下标，易错） | 有（靠属性，IDE 补全） |
| SQL 注入 | 要自己记得参数化 | 默认参数化 |
| 可读性 | SQL 和 Python 混在一起 | 纯 Python 风格 |
| 灵活性 | 最高（SQL 想怎么写怎么写） | 复杂查询受限 |
| 性能 | 最优（直接执行） | 略有损耗（对象映射开销） |

**实践建议**：日常 CRUD 用 ORM 提效，复杂报表查询用原生 SQL（ORM 都支持 \`text()\` 执行原生 SQL）。两者混用是常态，不是非此即彼。

## ORM 的适用边界

ORM 不是银弹，有些场景不适合：

1. **超高性能场景**：高频小查询、批量 ETL，手写 SQL 更可控。
2. **复杂报表**：多表 JOIN + 窗口函数 + 子查询，ORM 写出来又长又难懂，不如直接 SQL。
3. **数据库特定功能**：存储过程、触发器、全文搜索的高级用法，ORM 覆盖不全。

反过来，这些场景 ORM 特别合适：

1. **Web 应用 CRUD**：增删改查是主旋律，ORM 大幅提效。
2. **领域模型复杂**：对象之间关系多，ORM 帮你管理关系。
3. **多人协作**：统一模型定义，减少 SQL 风格不一致。
4. **快速原型**：快速把想法变成能跑的代码。

## ORM 在 Python 生态中的位置

| ORM | 特点 | 典型搭配 |
|-----|------|----------|
| SQLAlchemy | 功能最全，Data Mapper，事实标准 | FastAPI / Flask / 自研 |
| Django ORM | Active Record，和 Django 深度绑定 | Django |
| Peewee | 轻量，API 简洁 | 小项目 |
| Tortoise ORM | 异步原生，类似 Django ORM 风格 | FastAPI 异步 |
| SQLModel | SQLAlchemy + Pydantic，FastAPI 作者出品 | FastAPI |

本教程主推 **SQLAlchemy**，因为它是 Python ORM 的事实标准，FastAPI、Flask 生态都默认用它，学一套通用。

## 小结

| 概念 | 一句话 |
|------|--------|
| ORM | 把数据库表映射成类，自动翻译 SQL |
| Active Record | 对象自己存自己（Django） |
| Data Mapper | 独立 Session 帮对象存自己（SQLAlchemy） |
| N+1 问题 | 循环里访问关系属性导致大量小查询 |
| ORM 不是替代 SQL | 是让你少写 80% CRUD，复杂查询还是 SQL |

下一章我们正式上手 SQLAlchemy，从架构和 Core 层开始。`
  },

  // ============================================================
  // 第 2 章：SQLAlchemy Core 与引擎
  // ============================================================
  {
    id: "pyweb2-sqlalchemy-core",
    group: "ORM 与 SQLAlchemy",
    icon: "🔧",
    title: "SQLAlchemy Core 与引擎",
    content: `# SQLAlchemy Core 与引擎

## SQLAlchemy 架构总览

SQLAlchemy 是 Python 生态最强大的数据库工具包，分**两层**：

\`\`\`
┌─────────────────────────────────────┐
│  ORM 层（Object-Relational Mapper）   │  ← 你定义类，操作对象
│  - declarative / DeclarativeBase    │
│  - Session / relationship           │
├─────────────────────────────────────┤
│  Core 层（SQL Expression Language）  │  ← 你操作表结构，写 SQL 表达式
│  - Engine / Connection / Pool       │
│  - Table / Column / MetaData        │
│  - select / insert / update / delete│
├─────────────────────────────────────┤
│  DBAPI 驱动（psycopg2 / pymysql ...）│  ← 真正连数据库的底层驱动
├─────────────────────────────────────┤
│  数据库（PostgreSQL / MySQL / SQLite）│
└─────────────────────────────────────┘
\`\`\`

**两层的关系**：

- **Core** 是基础，负责和数据库打交道：建连接、管连接池、执行 SQL、处理事务。Core 提供了一套「SQL 表达式语言」，让你用 Python 对象拼 SQL，但不涉及业务对象。
- **ORM** 建立在 Core 之上，把 Core 的表映射成类，把行映射成对象。ORM 内部所有 SQL 操作最终都走 Core。

**什么时候用哪层？**

| 场景 | 用 Core | 用 ORM |
|------|---------|--------|
| 写脚本批量导数据 | ✅ 直接拼 SQL 表达式，轻量 | 也能用，但对象映射有开销 |
| Web 业务 CRUD | 能用但繁琐 | ✅ 模型类清晰，关系自动处理 |
| 复杂报表查询 | ✅ 灵活控制 SQL | ORM 写起来累 |
| 日常增删改查 | ✅ | ✅ 更舒服 |

实际项目里**两层混用**很常见：模型用 ORM 定义，个别复杂查询直接用 Core 的 \`text()\` 或表表达式。

## 创建引擎（create_engine）

引擎（Engine）是 SQLAlchemy 的核心入口，它管理连接池、方言（dialect）、DBAPI 驱动。整个应用通常只有一个 Engine（单例）。

### 连接字符串格式

\`\`\`
dialect+driver://user:password@host:port/database
\`\`\`

- **dialect**：数据库类型（sqlite、postgresql、mysql）。
- **driver**：DBAPI 驱动名（可省，用默认）。
- **user:password**：账号密码。
- **host:port**：地址端口。
- **database**：库名或文件路径。

### 各种数据库连接示例

\`\`\`python
# 从 sqlalchemy 导入 create_engine
from sqlalchemy import create_engine

# === SQLite ===
# 三斜杠是相对路径，四斜杠是绝对路径
# 定义变量 engine_sqlite，赋值为 create_engine("sqlite:///app.db")
engine_sqlite = create_engine("sqlite:///app.db")
# 内存数据库（测试用，进程结束就没了）
# 定义变量 engine_memory，赋值为 create_engine("sqlite://")
engine_memory = create_engine("sqlite://")

# === PostgreSQL ===
# 驱动用 psycopg2（最常见）
# 定义变量 engine_pg，赋值为 create_engine("postgresql+psycopg2://user:pass@localhost:5432/mydb")
engine_pg = create_engine("postgresql+psycopg2://user:pass@localhost:5432/mydb")
# 或者用 psycopg3（新版，异步友好）
# engine_pg3 = create_engine("postgresql+psycopg://user:pass@localhost/mydb")

# === MySQL ===
# 驱动用 pymysql（纯 Python，好装）
# 定义变量 engine_mysql，赋值为 create_engine("mysql+pymysql://user:pass@localhost:3306/mydb")
engine_mysql = create_engine("mysql+pymysql://user:pass@localhost:3306/mydb")
# 也可以用 mysqlclient（C 扩展，快但要编译）
# engine_mysql2 = create_engine("mysql+mysqldb://user:pass@localhost/mydb")
\`\`\`

### create_engine 的重要参数

\`\`\`python
# 从 sqlalchemy 导入 create_engine
from sqlalchemy import create_engine

# 定义变量 engine，赋值为 create_engine() 带详细参数
engine = create_engine(
    "postgresql+psycopg2://user:pass@localhost/mydb",
    # echo=True 会打印生成的 SQL，调试时有用，生产关掉
    echo=False,
    # 连接池大小：常驻 5 个连接
    pool_size=5,
    # 超出 pool_size 后还能临时开 10 个连接，共最多 15 个
    max_overflow=10,
    # 连接超过 30 秒没获取到就报错（防雪崩）
    pool_timeout=30,
    # 连接回收周期：3600 秒后强制重建（防数据库端超时断开）
    pool_recycle=3600,
    # 预执行语句（ping）：每次取连接前测一下是否活着
    pool_pre_ping=True,
    # 编码（MySQL 老版本要显式指定 utf8mb4 支持完整 emoji）
    connect_args={"charset": "utf8mb4"},
)
\`\`\`

## 连接池配置详解

数据库连接很贵（要 TCP 握手、要认证），频繁创建销毁会拖垮性能。连接池预先建好一批连接循环使用。

### 关键参数

| 参数 | 默认 | 说明 |
|------|------|------|
| pool_size | 5 | 常驻连接数 |
| max_overflow | 10 | 超出常驻后还能临时开的连接数 |
| pool_timeout | 30 | 等待连接的超时秒数 |
| pool_recycle | -1（不回收） | 连接多久后强制重建 |
| pool_pre_ping | False | 取连接前是否 ping 一下 |

### 理解 pool_size 和 max_overflow

- 正常情况：池里有 \`pool_size\` 个连接（默认 5），请求来取一个，用完还回去。
- 高峰期：5 个不够用，会临时开新的，最多再开 \`max_overflow\` 个（默认 10），所以总数最多 \`pool_size + max_overflow = 15\`。
- 超过 15：新请求得等，等到 \`pool_timeout\`（30 秒）还没拿到就报错。

### 为什么需要 pool_recycle

数据库服务器和中间的防火墙会主动断开「空闲太久」的连接（MySQL 默认 8 小时，但有些云数据库更短）。如果池里的连接被断了你还不知道，下次用就报错。

设 \`pool_recycle=3600\` 表示连接活满 1 小时就主动重建，比被动等服务器断开更稳。

### 为什么需要 pool_pre_ping

\`pool_recycle\` 是按时间猜，\`pool_pre_ping\` 是按需测。开启后每次取连接前发个轻量 ping，连接坏了就丢弃换新的。代价是每次多一次往返，但对稳定性提升明显。**生产环境建议开启**。

\`\`\`python
# 生产推荐的连接池配置
# 定义变量 engine，赋值为 create_engine() 生产配置
engine = create_engine(
    "postgresql+psycopg2://user:pass@localhost/mydb",
    pool_size=10,        # 中等流量
    max_overflow=20,     # 应对突发
    pool_timeout=30,
    pool_recycle=1800,   # 30 分钟回收
    pool_pre_ping=True,  # 开启 ping
)
\`\`\`

## 元数据与表定义（Core 风格）

Core 层用 \`MetaData\` 容器管理所有表定义，用 \`Table\` 定义表，用 \`Column\` 定义列。

\`\`\`python
# 从 sqlalchemy 导入 MetaData, Table, Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy import (
    MetaData, Table, Column, Integer, String, Text, DateTime, Boolean
)
# 从 sqlalchemy 导入 func
from sqlalchemy import func

# 创建元数据容器（所有表都注册到这里）
# 定义变量 metadata，赋值为 MetaData()
metadata = MetaData()

# 定义 users 表
# 定义变量 users，赋值为 Table()
users = Table(
    "users",                       # 表名
    metadata,                      # 所属元数据
    # 定义主键列，自增
    Column("id", Integer, primary_key=True),
    # 名字，字符串，不为空
    Column("name", String(50), nullable=False),
    # 邮箱，字符串，唯一
    Column("email", String(120), unique=True),
    # 年龄，整数，默认 0
    Column("age", Integer, default=0),
    # 是否激活，布尔，默认 True
    Column("active", Boolean, default=True),
    # 简介，长文本，可为空
    Column("bio", Text, nullable=True),
    # 创建时间，默认当前时间
    Column("created_at", DateTime, server_default=func.now()),
)

# 定义 posts 表
# 定义变量 posts，赋值为 Table()
posts = Table(
    "posts",
    metadata,
    Column("id", Integer, primary_key=True),
    # 外键，关联 users.id
    Column("user_id", Integer, nullable=False),
    Column("title", String(200), nullable=False),
    Column("content", Text),
    Column("published", Boolean, default=False),
)
\`\`\`

### 创建表

\`\`\`python
# 一次性创建 metadata 里所有表（已存在的会跳过，不加 checkfirst 会报错）
# 调用 metadata.create_all()，传入 engine
metadata.create_all(engine)
# 注意：Core 的 create_all 不会修改已存在的表结构，那要靠 Alembic 迁移
\`\`\`

## Core 查询（select / where / join / insert / update / delete）

### select 查询

\`\`\`python
# 从 sqlalchemy 导入 select
from sqlalchemy import select

# 用 with 块获取连接，自动归还连接池
# with engine.connect() as conn:
with engine.connect() as conn:
    # 查询所有列
    # 定义变量 stmt，赋值为 select(users)
    stmt = select(users)
    # 执行查询，返回 Result 对象
    # 定义变量 result，赋值为 conn.execute(stmt)
    result = conn.execute(stmt)
    # 遍历每一行，row 是 Row 对象，支持点号访问和下标访问
    # 循环：for row in result
    for row in result:
        # row.id 或 row[0] 都行
        # 打印
        print(row.id, row.name, row.email)
\`\`\`

### where 过滤

\`\`\`python
# with engine.connect() as conn:
with engine.connect() as conn:
    # 查询年龄大于 18 且激活的用户
    # 定义变量 stmt，赋值为 select(users).where(users.c.age > 18, users.c.active == True)
    stmt = select(users).where(
        users.c.age > 18,            # 注意 Core 用 users.c.age 访问列
        users.c.active == True
    )
    # 定义变量 result，赋值为 conn.execute(stmt)
    result = conn.execute(stmt)
    # 循环：for row in result
    for row in result:
        # 打印
        print(row.name, row.age)
\`\`\`

注意 Core 里访问列要写成 \`users.c.age\`（\`.c\` 是 columns 的缩写），ORM 里直接写 \`User.age\`。

### join 连接

\`\`\`python
# 从 sqlalchemy 导入 select
from sqlalchemy import select

# with engine.connect() as conn:
with engine.connect() as conn:
    # 联合 users 和 posts，取用户名和文章标题
    # 定义变量 stmt，赋值为 select(users.c.name, posts.c.title)
    stmt = select(users.c.name, posts.c.title).join(
        posts,                              # 要 join 的表
        users.c.id == posts.c.user_id       # join 条件
    )
    # 定义变量 result，赋值为 conn.execute(stmt)
    result = conn.execute(stmt)
    # 循环：for row in result
    for row in result:
        # 打印
        print(row.name, row.title)
\`\`\`

### insert 插入

\`\`\`python
# 从 sqlalchemy 导入 insert
from sqlalchemy import insert

# with engine.connect() as conn:
with engine.connect() as conn:
    # 插入单行
    # 定义变量 stmt，赋值为 insert(users).values(name="Tom", email="tom@a.com", age=20)
    stmt = insert(users).values(name="Tom", email="tom@a.com", age=20)
    # 执行并提交（Core 默认不自动提交，要显式 commit）
    # 调用 conn.execute(stmt)
    conn.execute(stmt)
    # 调用 conn.commit()
    conn.commit()

    # 批量插入
    # 定义变量 stmt2，赋值为 insert(users)
    stmt2 = insert(users)
    # 调用 conn.execute()，传入列表
    conn.execute(stmt2, [
        {"name": "Jerry", "email": "j@b.com", "age": 22},
        {"name": "Alice", "email": "a@c.com", "age": 25},
    ])
    # 调用 conn.commit()
    conn.commit()
\`\`\`

### update 更新

\`\`\`python
# 从 sqlalchemy 导入 update
from sqlalchemy import update

# with engine.connect() as conn:
with engine.connect() as conn:
    # 把 id=1 的用户年龄改成 21
    # 定义变量 stmt，赋值为 update(users).where(users.c.id == 1).values(age=21)
    stmt = update(users).where(users.c.id == 1).values(age=21)
    # 调用 conn.execute(stmt)
    result = conn.execute(stmt)
    # 调用 conn.commit()
    conn.commit()
    # result.rowcount 是受影响的行数
    # 打印
    print(f"更新了 {result.rowcount} 行")
\`\`\`

### delete 删除

\`\`\`python
# 从 sqlalchemy 导入 delete
from sqlalchemy import delete

# with engine.connect() as conn:
with engine.connect() as conn:
    # 删除 id=1 的用户
    # 定义变量 stmt，赋值为 delete(users).where(users.c.id == 1)
    stmt = delete(users).where(users.c.id == 1)
    # 调用 conn.execute(stmt)
    result = conn.execute(stmt)
    # 调用 conn.commit()
    conn.commit()
    # 打印
    print(f"删除了 {result.rowcount} 行")
\`\`\`

## 事务管理（begin / commit / rollback）

事务（Transaction）是「要么全成功，要么全回滚」的一组操作。Core 默认开启事务，但不自动提交，必须显式 \`commit\`。

### 基础事务

\`\`\`python
# with engine.connect() as conn:
with engine.connect() as conn:
    # 转账：A 减 100，B 加 100，必须在同一事务
    # 调用 conn.execute()，扣 A 的钱
    conn.execute(
        update(accounts).where(accounts.c.id == 1).values(balance=accounts.c.balance - 100)
    )
    # 模拟中间出错
    # 条件判断：如果 something_wrong
    if something_wrong:
        # 回滚，A 的扣款也撤销
        # 调用 conn.rollback()
        conn.rollback()
        # 返回
        return
    # 调用 conn.execute()，给 B 加钱
    conn.execute(
        update(accounts).where(accounts.c.id == 2).values(balance=accounts.c.balance + 100)
    )
    # 都成功才提交
    # 调用 conn.commit()
    conn.commit()
\`\`\`

### 用 begin() 自动提交或回滚

\`\`\`python
# engine.begin() 会在退出 with 块时自动 commit，出错自动 rollback
# with engine.begin() as conn:
with engine.begin() as conn:
    # 这里的代码全在一个事务里
    # 调用 conn.execute()
    conn.execute(update(accounts).where(accounts.c.id == 1).values(balance=accounts.c.balance - 100))
    # 调用 conn.execute()
    conn.execute(update(accounts).where(accounts.c.id == 2).values(balance=accounts.c.balance + 100))
    # 退出块时无异常就 commit，有异常就 rollback
\`\`\`

\`engine.begin()\` 比 \`engine.connect()\` 更推荐用于「一个事务干完」的场景，不用手动 commit/rollback。

## SQLite / PostgreSQL / MySQL 连接示例对比

\`\`\`python
# 从 sqlalchemy 导入 create_engine
from sqlalchemy import create_engine

# === SQLite：最简单，无需服务，文件即数据库 ===
# 适合：开发、测试、小工具
# 定义变量 engine，赋值为 create_engine("sqlite:///dev.db", echo=True)
engine = create_engine("sqlite:///dev.db", echo=True)
# SQLite 默认是「文件级锁」，并发写性能差，正式项目少用

# === PostgreSQL：功能最强的开源数据库 ===
# 适合：中大型 Web 应用，支持 JSON、全文搜索、地理数据
# 定义变量 engine，赋值为 create_engine("postgresql+psycopg2://postgres:123456@localhost:5432/myapp")
engine = create_engine("postgresql+psycopg2://postgres:123456@localhost:5432/myapp")

# === MySQL：使用最广的开源数据库 ===
# 适合：传统 Web 项目，生态成熟
# 定义变量 engine，赋值为 create_engine("mysql+pymysql://root:123456@localhost:3306/myapp?charset=utf8mb4")
engine = create_engine("mysql+pymysql://root:123456@localhost:3306/myapp?charset=utf8mb4")
\`\`\`

### 数据库方言差异举例

不同数据库的 SQL 语法有差异，SQLAlchemy 用「方言（Dialect）」帮你屏蔽：

| 特性 | SQLite | PostgreSQL | MySQL |
|------|--------|------------|-------|
| 自增主键 | INTEGER PRIMARY KEY | SERIAL | AUTO_INCREMENT |
| 布尔 | 用 0/1 | 真 BOOLEAN | TINYINT(1) |
| 分页 | LIMIT ? OFFSET ? | LIMIT ? OFFSET ? | LIMIT ?, ? |
| 字符串拼接 | \|\| | \|\| | CONCAT() |

你写 \`User.age > 18\`，SQLAlchemy 会根据当前 engine 自动翻译成对应方言的 SQL。

## Core 与 ORM 的协作

实际项目里，你通常用 ORM 定义模型（下一章讲），但 Core 的能力依然可用：

\`\`\`python
# ORM 模型定义（后面章节详讲）
# 定义类 User(Base)
class User(Base):
    # 定义 __tablename__，赋值为 "users"
    __tablename__ = "users"
    # 定义列
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    age = Column(Integer)

# ORM 模型类的 .__table__ 就是 Core 的 Table 对象
# 可以混用 Core 风格操作 ORM 模型的表
# 定义变量 stmt，赋值为 select(User.__table__).where(User.__table__.c.age > 18)
stmt = select(User.__table__).where(User.__table__.c.age > 18)
# 这和 ORM 的 select(User).where(User.age > 18) 等价，但风格不同
\`\`\`

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 忘记 commit | 写完不 commit，数据没持久化 | 显式 commit 或用 begin() |
| 连接不释放 | 不用 with，连接泄漏 | 用 with engine.connect() |
| 不开 pool_pre_ping | 连接断了报错 | 生产开 pool_pre_ping |
| 拼接 SQL 字符串 | 用 f-string 拼 SQL | 用参数化（ORM 默认参数化） |
| echo 开着上生产 | echo=True 打印所有 SQL | 生产关 echo |
| 单例 Engine 乱建 | 每次请求 new 一个 Engine | 全局单例 Engine |

## 小结

| 概念 | 一句话 |
|------|--------|
| Engine | 应用入口，管连接池和方言，全局单例 |
| 连接池 | 预建连接循环用，pool_size + max_overflow |
| MetaData / Table | Core 层的表定义，不涉及业务对象 |
| Core CRUD | insert/update/delete/select 是 SQL 表达式 |
| 事务 | Core 默认不自动提交，要显式 commit 或用 begin() |

下一章我们用 ORM 方式定义模型类，写起来比 Core 的 Table 更舒服。`
  },

  // ============================================================
  // 第 3 章：SQLAlchemy ORM 模型定义
  // ============================================================
  {
    id: "pyweb2-sqlalchemy-orm",
    group: "ORM 与 SQLAlchemy",
    icon: "🏗️",
    title: "SQLAlchemy ORM 模型定义",
    content: `# SQLAlchemy ORM 模型定义

## 声明式映射（DeclarativeBase）

ORM 的核心是「模型类」：一个类对应一张表，类的属性对应列。SQLAlchemy 用「声明式映射」让这件事变得直观——你写一个普通的 Python 类，继承基类，SQLAlchemy 自动把它注册成表。

### SQLAlchemy 2.0 的新写法（推荐）

\`\`\`python
# 从 sqlalchemy.orm 导入 DeclarativeBase, Mapped, mapped_column
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
# 从 sqlalchemy 导入 Integer, String, Text, DateTime, Boolean
from sqlalchemy import Integer, String, Text, DateTime, Boolean
# 从 sqlalchemy 导入 func
from sqlalchemy import func
# 导入 datetime
from datetime import datetime

# 定义基类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    # 2.0 风格：继承 DeclarativeBase，所有模型类都继承它
    # 基类本身不对应表，只是统一管理 metadata
    # 定义 pass
    pass

# 定义 User 模型类，继承 Base
class User(Base):
    # __tablename__ 指定表名（必须）
    # 定义 __tablename__，赋值为 "users"
    __tablename__ = "users"

    # 2.0 风格：用 Mapped[类型] 声明 Python 端类型，mapped_column 声明数据库端配置
    # Mapped[int] 表示这个属性是 int 类型（IDE 和 mypy 能识别）
    # 定义 id，赋值为 mapped_column()
    id: Mapped[int] = mapped_column(primary_key=True)
    # Mapped[str] 表示字符串，String(50) 限制长度
    # 定义 name，赋值为 mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(50))
    # 可空字段用 Mapped[str | None] 或 Optional[str]
    # 定义 email，赋值为 mapped_column(String(120), unique=True)
    email: Mapped[str] = mapped_column(String(120), unique=True)
    # 有默认值的字段
    # 定义 age，赋值为 mapped_column(Integer, default=0)
    age: Mapped[int] = mapped_column(Integer, default=0)

    # __repr__ 方便调试时打印
    # 定义 __repr__，参数: self
    def __repr__(self):
        # 返回 f"<User id={self.id} name={self.name!r}>"
        return f"<User id={self.id} name={self.name!r}>"
\`\`\`

### 旧式写法（1.x 风格，仍支持）

\`\`\`python
# 从 sqlalchemy.orm 导入 declarative_base
from sqlalchemy.orm import declarative_base
# 从 sqlalchemy 导入 Column, Integer, String
from sqlalchemy import Column, Integer, String

# 旧式：用 declarative_base() 工厂函数创建基类
# 定义变量 Base，赋值为 declarative_base()
Base = declarative_base()

# 定义 User 模型类，继承 Base
class User(Base):
    # 定义 __tablename__，赋值为 "users"
    __tablename__ = "users"

    # 旧式：直接用 Column() 定义列
    # 定义 id，赋值为 Column(Integer, primary_key=True)
    id = Column(Integer, primary_key=True)
    # 定义 name，赋值为 Column(String(50), nullable=False)
    name = Column(String(50), nullable=False)
    # 定义 email，赋值为 Column(String(120), unique=True)
    email = Column(String(120), unique=True)
\`\`\`

**新旧区别**：
- 旧式：\`Column(类型, ...)\`，没有 Python 端类型注解，IDE 提示弱。
- 新式：\`Mapped[类型] = mapped_column(...)\`，有类型注解，mypy/Pyright 能静态检查，IDE 补全更好。

本教程统一用**新式 2.0 风格**，旧式只做了解。

## 列类型详解

SQLAlchemy 提供丰富的列类型，对应不同数据库的实际类型：

\`\`\`python
# 从 sqlalchemy 导入 各种类型
from sqlalchemy import (
    Integer, BigInteger, SmallInteger, Numeric, Float,
    String, Text, Unicode, UnicodeText,
    Boolean, Date, DateTime, Time,
    JSON, LargeBinary, Enum,
)
# 从 sqlalchemy.orm 导入 Mapped, mapped_column
from sqlalchemy.orm import Mapped, mapped_column
# 导入 datetime, Decimal
from datetime import datetime, date, time
from decimal import Decimal

# 定义 Product 模型类，继承 Base
class Product(Base):
    # 定义 __tablename__，赋值为 "products"
    __tablename__ = "products"

    # === 数值类型 ===
    # 整数（4 字节）
    # 定义 id，赋值为 mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 大整数（8 字节，存雪花 ID、时间戳）
    # 定义 big_id，赋值为 mapped_column(BigInteger)
    big_id: Mapped[int] = mapped_column(BigInteger)
    # 定点数：金额必用 Numeric，Float 会有精度问题
    # Numeric(10, 2) 表示共 10 位，小数 2 位
    # 定义 price，赋值为 mapped_column(Numeric(10, 2))
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))

    # === 字符串类型 ===
    # 变长字符串，50 是最大长度
    # 定义 name，赋值为 mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(50))
    # 长文本（不限长度，对应 TEXT）
    # 定义 description，赋值为 mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # === 布尔类型 ===
    # 布尔（不同数据库实现不同，SQLite 用 0/1，PG 用 bool）
    # 定义 in_stock，赋值为 mapped_column(Boolean, default=True)
    in_stock: Mapped[bool] = mapped_column(Boolean, default=True)

    # === 时间类型 ===
    # 日期（只到天）
    # 定义 mfg_date，赋值为 mapped_column(Date)
    mfg_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    # 日期时间（到秒/微秒）
    # 定义 created_at，赋值为 mapped_column(DateTime, default=datetime.now)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    # === JSON 类型 ===
    # JSON 类型，存任意 JSON 结构（PG/MySQL 原生支持，SQLite 用 TEXT 模拟）
    # 定义 attrs，赋值为 mapped_column(JSON, default=dict)
    attrs: Mapped[dict] = mapped_column(JSON, default=dict)

    # === 二进制类型 ===
    # 二进制大对象（存图片、文件，但通常不建议存数据库，用对象存储）
    # 定义 image，赋值为 mapped_column(LargeBinary)
    image: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
\`\`\`

### 类型选择建议

| 场景 | 推荐类型 | 原因 |
|------|----------|------|
| 金额 | Numeric / Decimal | Float 有精度丢失 |
| 主键 | Integer 或 BigInteger | 自增，简单 |
| UUID | String(36) 或 Uuid | 2.0 新增 Uuid 类型 |
| 短文本 | String(n) | 有长度限制 |
| 长文本（文章） | Text | 不限长度 |
| 半结构化数据 | JSON | 灵活，但要谨慎查性能 |
| 时间戳 | DateTime | 配合 server_default=func.now() |
| 布尔 | Boolean | 语义清晰 |

## 主键与自增

\`\`\`python
# 从 sqlalchemy 导入 Integer, BigInteger, String
from sqlalchemy import Integer, BigInteger, String
# 从 sqlalchemy.orm 导入 Mapped, mapped_column
from sqlalchemy.orm import Mapped, mapped_column

# 定义 User 模型类
class User(Base):
    # 定义 __tablename__，赋值为 "users"
    __tablename__ = "users"

    # 方式1：Integer 主键，默认自增（autoincrement=True 是隐含的）
    # 定义 id，赋值为 mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)

    # 方式2：显式指定自增
    # id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # 方式3：BigInteger 主键（适合分布式，配合雪花算法）
    # id: Mapped[int] = mapped_column(BigInteger, primary_key=True)

    # 方式4：字符串主键（不推荐自增，要自己生成，如 UUID）
    # id: Mapped[str] = mapped_column(String(36), primary_key=True)

    # 定义 name，赋值为 mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(50))
\`\`\`

**自增的隐含规则**：
- 如果主键是 \`Integer\` 或 \`BigInteger\`，且是单列主键，默认 \`autoincrement=True\`。
- 插入时不传 id，数据库自动生成。
- 复合主键、字符串主键不会自增。

\`\`\`python
# 插入时不传 id，数据库自动生成
# 定义变量 user，赋值为 User(name="Tom")
user = User(name="Tom")
# 调用 session.add(user)
session.add(user)
# 调用 session.commit()
session.commit()
# commit 之后 user.id 自动填充了数据库生成的值
# 打印
print(user.id)  # 比如 1
\`\`\`

## 约束（nullable / unique / default / check）

### nullable（是否可空）

\`\`\`python
# nullable=False 表示 NOT NULL（必填）
# 定义 name，赋值为 mapped_column(String(50), nullable=False)
name: Mapped[str] = mapped_column(String(50), nullable=False)
# nullable=True（默认）表示允许 NULL
# 定义 bio，赋值为 mapped_column(Text, nullable=True)
bio: Mapped[str | None] = mapped_column(Text, nullable=True)
\`\`\`

**2.0 类型注解的妙处**：\`Mapped[str]\` 自动推导为 NOT NULL，\`Mapped[str | None]\` 自动推导为可空。不用手写 nullable。

\`\`\`python
# Mapped[str] → 自动 nullable=False
# 定义 name，赋值为 mapped_column(String(50))
name: Mapped[str] = mapped_column(String(50))
# 等价于 name: Mapped[str] = mapped_column(String(50), nullable=False)

# Mapped[str | None] → 自动 nullable=True
# 定义 bio，赋值为 mapped_column(Text)
bio: Mapped[str | None] = mapped_column(Text)
# 等价于 bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
\`\`\`

### unique（唯一约束）

\`\`\`python
# 单列唯一：邮箱不能重复
# 定义 email，赋值为 mapped_column(String(120), unique=True)
email: Mapped[str] = mapped_column(String(120), unique=True)
\`\`\`

### default（默认值）

default 有两种：Python 端默认 和 数据库端默认。

\`\`\`python
# 导入 datetime
from datetime import datetime
# 从 sqlalchemy 导入 func
from sqlalchemy import func

class Article(Base):
    # 定义 __tablename__，赋值为 "articles"
    __tablename__ = "articles"

    # Python 端默认：插入时如果没传值，ORM 用这个默认值
    # 注意：default=datetime.now 传函数引用，每次插入时调用（推荐）
    # default=datetime.now() 传具体值，所有行都一样（错误！）
    # 定义 view_count，赋值为 mapped_column(default=0)
    view_count: Mapped[int] = mapped_column(default=0)

    # 数据库端默认：server_default 是数据库层的 DEFAULT
    # 用 func.now() 让数据库自己生成当前时间
    # 优点：即使绕过 ORM 直接写 SQL 也有默认值
    # 定义 created_at，赋值为 mapped_column(server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    # server_default 还能写字符串
    # 定义 role，赋值为 mapped_column(server_default="user")
    role: Mapped[str] = mapped_column(String(20), server_default="user")
\`\`\`

**default vs server_default 区别**：
- \`default\`：ORM 层默认值，INSERT 时如果没传，ORM 帮你填上。绕过 ORM 直接 SQL 插入就没有。
- \`server_default\`：数据库层 DEFAULT，写在表结构里，任何方式插入都生效。

### check 约束

\`\`\`python
# 从 sqlalchemy 导入 CheckConstraint
from sqlalchemy import CheckConstraint, String, Integer
# 从 sqlalchemy.orm 导入 Mapped, mapped_column
from sqlalchemy.orm import Mapped, mapped_column

class User(Base):
    # 定义 __tablename__，赋值为 "users"
    __tablename__ = "users"
    # 表级 check 约束：年龄必须 >= 0
    # 定义 __table_args__，赋值为元组
    __table_args__ = (
        CheckConstraint("age >= 0", name="check_age_positive"),
    )

    # 定义 id，赋值为 mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 定义 age，赋值为 mapped_column(Integer)
    age: Mapped[int] = mapped_column(Integer)
\`\`\`

## 索引（Index / unique=True）

索引加速查询，但拖慢写入。给**经常查询、排序、JOIN 的列**加索引。

\`\`\`python
# 从 sqlalchemy 导入 Index
from sqlalchemy import Index, String
# 从 sqlalchemy.orm 导入 Mapped, mapped_column
from sqlalchemy.orm import Mapped, mapped_column

class User(Base):
    # 定义 __tablename__，赋值为 "users"
    __tablename__ = "users"

    # 单列索引：直接在列上加 index=True
    # 定义 email，赋值为 mapped_column(String(120), index=True)
    email: Mapped[str] = mapped_column(String(120), index=True)
    # 唯一索引：unique=True（既是约束也是索引）
    # 定义 phone，赋值为 mapped_column(String(20), unique=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True)

    # 定义 id，赋值为 mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 定义 name，赋值为 mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(50))

    # 复合索引：在 __table_args__ 里定义
    # 定义 __table_args__，赋值为元组
    __table_args__ = (
        # 联合索引：先按 name 再按 age 查询快
        Index("idx_name_age", "name", "age"),
    )
\`\`\`

**索引设计原则**：
1. 给 WHERE、ORDER BY、JOIN、GROUP BY 涉及的列加索引。
2. 区分度低的列（如性别）加索引意义不大。
3. 不要滥用，每个索引都拖慢写入。
4. 复合索引的列顺序：等值查询的列在前，范围查询的列在后。

## 模型方法（__repr__ / __str__ / 属性）

\`\`\`python
# 从 sqlalchemy 导入 String, Integer, Boolean
from sqlalchemy import String, Integer, Boolean
# 从 sqlalchemy.orm 导入 Mapped, mapped_column, computed
from sqlalchemy.orm import Mapped, mapped_column, computed

class User(Base):
    # 定义 __tablename__，赋值为 "users"
    __tablename__ = "users"

    # 定义 id，赋值为 mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 定义 name，赋值为 mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(50))
    # 定义 age，赋值为 mapped_column(Integer)
    age: Mapped[int] = mapped_column(Integer)
    # 定义 is_admin，赋值为 mapped_column(Boolean, default=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)

    # __repr__：开发者看，调试用（建议必须）
    # 定义 __repr__，参数: self
    def __repr__(self):
        # 返回格式化字符串
        return f"<User#{self.id} {self.name}>"

    # __str__：用户看，print(user) 时显示
    # 定义 __str__，参数: self
    def __str__(self):
        # 返回格式化字符串
        return f"用户：{self.name}（{self.age}岁）"

    # 普通方法：业务逻辑
    # 定义 can_drink，参数: self
    def can_drink(self) -> bool:
        # 返回 self.age >= 18
        return self.age >= 18

    # @property：只读计算属性，不存数据库
    # 装饰器：@property
    @property
    def display_name(self) -> str:
        # 返回 self.name.upper()
        return self.name.upper()

    # @hybrid_property：既能 Python 端用，又能 SQL 查询用（高级）
    # from sqlalchemy.ext.hybrid import hybrid_property
    # @hybrid_property
    # def is_adult(self):
    #     return self.age >= 18
    # 查询时：session.query(User).filter(User.is_adult) 会翻译成 age >= 18
\`\`\`

## 模型继承

SQLAlchemy 支持三种继承模式，按「表怎么存」分：

### 1. 单表继承（Single Table Inheritance）

所有子类共享一张表，用「鉴别列」区分类型。

\`\`\`python
# 从 sqlalchemy 导入 String, Integer
from sqlalchemy import String, Integer
# 从 sqlalchemy.orm 导入 Mapped, mapped_column
from sqlalchemy.orm import Mapped, mapped_column

# 父类：员工
class Employee(Base):
    # 定义 __tablename__，赋值为 "employees"
    __tablename__ = "employees"

    # 定义 id，赋值为 mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 定义 name，赋值为 mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(50))
    # 鉴别列：type 决定这条记录是哪种子类
    # 定义 type，赋值为 mapped_column(String(20))
    type: Mapped[str] = mapped_column(String(20))

    # __mapper_args__ 配置多态
    # 定义 __mapper_args__，赋值为字典
    __mapper_args__ = {
        "polymorphic_on": type,      # 用 type 列区分
        "polymorphic_identity": "employee",  # 父类对应的 type 值
    }

# 子类：工程师，共享 employees 表
# 定义类 Engineer(Employee)
class Engineer(Employee):
    # 子类特有字段（在数据库里和父类共享同一张表）
    # 定义 programming_language，赋值为 mapped_column(String(50))
    programming_language: Mapped[str] = mapped_column(String(50))

    # 定义 __mapper_args__，赋值为字典
    __mapper_args__ = {
        "polymorphic_identity": "engineer",  # 工程师的 type 值
    }

# 子类：经理
# 定义类 Manager(Employee)
class Manager(Employee):
    # 定义 department，赋值为 mapped_column(String(50))
    department: Mapped[str] = mapped_column(String(50))

    # 定义 __mapper_args__，赋值为字典
    __mapper_args__ = {
        "polymorphic_identity": "manager",
    }
\`\`\`

特点：一张表存所有子类，子类特有字段在父类表里（其他子类的行这些列是 NULL）。查询简单，但字段多了会有很多空列。

### 2. 联合继承（Joined Table Inheritance）

父类一张表，每个子类各一张表，用外键关联。

\`\`\`python
# 父类表 employees
class Employee(Base):
    # 定义 __tablename__，赋值为 "employees"
    __tablename__ = "employees"
    # 定义 id，赋值为 mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 定义 name，赋值为 mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(50))
    # 定义 type，赋值为 mapped_column(String(20))
    type: Mapped[str] = mapped_column(String(20))
    # 定义 __mapper_args__，赋值为字典
    __mapper_args__ = {
        "polymorphic_on": type,
        "polymorphic_identity": "employee",
    }

# 子类表 engineers，id 既是主键又是外键（关联 employees.id）
# 定义类 Engineer(Employee)
class Engineer(Employee):
    # 定义 __tablename__，赋值为 "engineers"
    __tablename__ = "engineers"
    # id 既是主键又是外键
    # 定义 id，赋值为 mapped_column(ForeignKey("employees.id"), primary_key=True)
    id: Mapped[int] = mapped_column(ForeignKey("employees.id"), primary_key=True)
    # 定义 programming_language，赋值为 mapped_column(String(50))
    programming_language: Mapped[str] = mapped_column(String(50))
    # 定义 __mapper_args__，赋值为字典
    __mapper_args__ = {"polymorphic_identity": "engineer"}
\`\`\`

特点：数据规范化好（没有空列），但查询要 JOIN，性能稍差。

### 3. 具体表继承（Concrete Table Inheritance）

每个子类一张完整表（包含父类字段），无共享表。

这种模式 SQLAlchemy 支持但配置复杂，实际用得少，了解即可。

**选择建议**：子类字段少且差异不大 → 单表；子类字段多 → 联合；基本不查询只用子类 → 具体表。

## 完整模型示例：博客系统

把前面的知识组合起来，定义一个博客系统的模型：

\`\`\`python
# 从 sqlalchemy 导入 String, Integer, Text, Boolean, DateTime, ForeignKey
from sqlalchemy import (
    String, Integer, Text, Boolean, DateTime, ForeignKey, func
)
# 从 sqlalchemy.orm 导入 DeclarativeBase, Mapped, mapped_column
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
# 导入 datetime
from datetime import datetime

# 定义 Base
class Base(DeclarativeBase):
    # 定义 pass
    pass

# 用户表
# 定义类 User(Base)
class User(Base):
    # 定义 __tablename__，赋值为 "users"
    __tablename__ = "users"

    # 定义 id，赋值为 mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 定义 username，赋值为 mapped_column(String(50), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    # 定义 email，赋值为 mapped_column(String(120), unique=True)
    email: Mapped[str] = mapped_column(String(120), unique=True)
    # 定义 password_hash，赋值为 mapped_column(String(128))
    password_hash: Mapped[str] = mapped_column(String(128))
    # 定义 is_active，赋值为 mapped_column(Boolean, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    # 定义 created_at，赋值为 mapped_column(server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    # 定义 __repr__，参数: self
    def __repr__(self):
        # 返回 f"<User {self.username}>"
        return f"<User {self.username}>"

# 文章表
# 定义类 Post(Base)
class Post(Base):
    # 定义 __tablename__，赋值为 "posts"
    __tablename__ = "posts"

    # 定义 id，赋值为 mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 外键关联 users.id
    # 定义 user_id，赋值为 mapped_column(ForeignKey("users.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    # 定义 title，赋值为 mapped_column(String(200))
    title: Mapped[str] = mapped_column(String(200))
    # 定义 content，赋值为 mapped_column(Text)
    content: Mapped[str] = mapped_column(Text)
    # 定义 published，赋值为 mapped_column(Boolean, default=False)
    published: Mapped[bool] = mapped_column(Boolean, default=False)
    # 定义 view_count，赋值为 mapped_column(default=0)
    view_count: Mapped[int] = mapped_column(default=0)
    # 定义 created_at，赋值为 mapped_column(server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    # 定义 updated_at，赋值为 mapped_column(server_default=func.now(), onupdate=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),       # 插入时默认当前时间
        onupdate=func.now()              # 更新时自动改时间
    )

    # 定义 __repr__，参数: self
    def __repr__(self):
        # 返回 f"<Post {self.title}>"
        return f"<Post {self.title}>"
\`\`\`

## 创建表

\`\`\`python
# 从 sqlalchemy 导入 create_engine
from sqlalchemy import create_engine

# 定义变量 engine，赋值为 create_engine("sqlite:///blog.db")
engine = create_engine("sqlite:///blog.db")

# 创建所有模型对应的表（已存在则跳过）
# 调用 Base.metadata.create_all(engine)
Base.metadata.create_all(engine)
\`\`\`

注意：\`create_all\` 只创建不修改，表结构变更要用 Alembic 迁移（后面章节讲）。

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 忘记 __tablename__ | 不写表名报错 | 每个模型必写 __tablename__ |
| default 传值 | default=datetime.now() | default=datetime.now（传函数） |
| 金额用 Float | 浮点有精度问题 | 用 Numeric/Decimal |
| 索引乱加 | 所有列都加索引 | 只给查询列加 |
| 忘记 __repr__ | 调试打印一串对象地址 | 写 __repr__ 方便调试 |
| nullable 注解错 | Mapped[str] 却允许 None | Mapped[str \| None] 才允许 |

## 小结

| 概念 | 一句话 |
|------|--------|
| DeclarativeBase | 2.0 风格基类，所有模型继承它 |
| Mapped[类型] | Python 端类型注解，nullable 自动推导 |
| mapped_column() | 数据库端列配置 |
| default vs server_default | ORM 层 vs 数据库层默认值 |
| 单表/联合/具体继承 | 三种多态表存储方式 |

下一章我们看怎么用 Session 操作这些模型对象。`
  },

  // ============================================================
  // 第 4 章：Session 与事务管理
  // ============================================================
  {
    id: "pyweb2-sqlalchemy-session",
    group: "ORM 与 SQLAlchemy",
    icon: "💼",
    title: "Session 与事务管理",
    content: `# Session 与事务管理

## Session 是什么（Unit of Work 模式）

Session 是 SQLAlchemy ORM 的核心，它实现了 **Unit of Work（工作单元）** 模式。

**Unit of Work 的核心思想**：你把一堆对象操作（增删改）丢给 Session，它帮你「记账」——记录哪些对象是新的、哪些改了、哪些要删。等你喊「提交」，它一次性把所有改动翻译成对应的 SQL 发给数据库，包在一个事务里。

打个比方：Session 像购物车，你往里放商品（add）、改数量（修改属性）、删商品（delete），最后结账（commit）才真正扣库存。结账前可以反悔（rollback）。

### Session 与 Connection 的关系

- **Connection**（Core 层）：一个真实的数据库连接，对应一条 TCP 连接。
- **Session**（ORM 层）：包装了 Connection，加上对象跟踪、事务管理、懒加载等 ORM 能力。

一个 Session 同一时刻只用一个 Connection（除非它需要访问多个数据库）。

\`\`\`
Session  ──包装──▶  Connection  ──对应──▶  数据库 TCP 连接
（ORM）            （Core）            （池里借的）
\`\`\`

## 创建 Session（sessionmaker / scoped_session）

### 基础：sessionmaker

不要直接 \`Session(engine)\`，应该用 \`sessionmaker\` 工厂创建 Session 类，统一配置。

\`\`\`python
# 从 sqlalchemy 导入 create_engine
from sqlalchemy import create_engine
# 从 sqlalchemy.orm 导入 sessionmaker, DeclarativeBase
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# 定义变量 engine，赋值为 create_engine("sqlite:///app.db")
engine = create_engine("sqlite:///app.db")

# 创建 Session 工厂，统一配置
# 定义变量 SessionLocal，赋值为 sessionmaker()
SessionLocal = sessionmaker(
    bind=engine,           # 绑定引擎
    autoflush=False,       # 不自动 flush（手动控制更安全）
    expire_on_commit=False, # commit 后不自动过期对象（避免 commit 后访问属性触发查询）
)

# 用工厂创建 Session 实例
# 定义变量 session，赋值为 SessionLocal()
session = SessionLocal()
\`\`\`

参数解释：
- **autoflush**：每次查询前是否自动把 pending 对象 flush 到数据库。设 False 避免「查之前被意外写入」。
- **expire_on_commit**：commit 后是否让对象「过期」（下次访问属性重新查库）。设 False 避免 commit 后访问属性又触发查询，性能更好但对象可能不是最新。

### scoped_session（线程安全）

Web 应用是多线程的，每个请求要独立的 Session（不能共享，否则数据串了）。\`scoped_session\` 基于 threading.local 实现「每个线程一个 Session」。

\`\`\`python
# 从 sqlalchemy.orm 导入 scoped_session, sessionmaker
from sqlalchemy.orm import scoped_session, sessionmaker

# 创建 scoped_session，自动按线程隔离
# 定义变量 db_session，赋值为 scoped_session(sessionmaker(bind=engine))
db_session = scoped_session(sessionmaker(bind=engine))

# 任何地方用 db_session 都拿到当前线程的 Session
# 定义变量 users，赋值为 db_session.scalars(select(User)).all()
users = db_session.scalars(select(User)).all()

# 请求结束要移除当前线程的 Session，防泄漏
# 调用 db_session.remove()
db_session.remove()
\`\`\`

但 SQLAlchemy 2.0 更推荐用**上下文管理器**（with 块）而不是 scoped_session，下一节讲。

## Session 生命周期（add / commit / rollback / close）

一个 Session 的完整生命周期：

\`\`\`python
# 1. 创建 Session
# 定义变量 session，赋值为 SessionLocal()
session = SessionLocal()

# 条件判断：try
try:
    # 2. add：把对象加入 Session（此时还没写库，只是标记为 pending）
    # 定义变量 user，赋值为 User(name="Tom", email="tom@a.com")
    user = User(name="Tom", email="tom@a.com")
    # 调用 session.add(user)
    session.add(user)

    # 3. 修改对象属性（Session 跟踪到改动）
    # 定义变量 u，赋值为 session.scalars(select(User)).first()
    u = session.scalars(select(User)).first()
    # u.name = "Tom2"
    u.name = "Tom2"

    # 4. flush：把 pending 改动写到数据库（但不提交，可回滚）
    # 调用 session.flush()
    session.flush()

    # 5. commit：真正提交事务，持久化
    # 调用 session.commit()
    session.commit()
# 条件判断：except Exception
except Exception:
    # 6. rollback：出错回滚，撤销所有改动
    # 调用 session.rollback()
    session.rollback()
    # 重新抛出异常
    # 调用 raise
    raise
# finally
finally:
    # 7. close：关闭 Session，归还连接
    # 调用 session.close()
    session.close()
\`\`\`

### add / add_all

\`\`\`python
# add 单个对象
# 定义变量 user，赋值为 User(name="Tom")
user = User(name="Tom")
# 调用 session.add(user)
session.add(user)

# add_all 批量
# 定义变量 users，赋值为列表
users = [User(name="A"), User(name="B"), User(name="C")]
# 调用 session.add_all(users)
session.add_all(users)
\`\`\`

### flush vs commit

新手最容易混淆：

| 操作 | 作用 | 事务 | 能回滚吗 |
|------|------|------|----------|
| flush | 把内存改动写到数据库 | 不提交 | 能（rollback 撤销） |
| commit | 提交事务，持久化 | 提交 | 不能（已落盘） |

\`\`\`python
# 调用 session.add(user)
session.add(user)
# 调用 session.flush()
session.flush()
# 此时数据库已有这条记录（同事务可见），但事务没提交
# 别的事务查不到（隔离性）
# 如果出错
# 调用 session.rollback()
session.rollback()
# flush 写的数据被撤销

# 调用 session.commit()
session.commit()
# 真正持久化，别的事务也能看到了
\`\`\`

## 对象状态（transient / pending / persistent / detached / deleted）

理解对象状态是掌握 Session 的关键。一个模型对象在生命周期里有 5 种状态：

\`\`\`python
# 状态1：transient（瞬态）—— 刚创建，不在 Session 里，数据库也没
# 定义变量 user，赋值为 User(name="Tom")
user = User(name="Tom")
# 此时 user 是 transient

# 状态2：pending（待定）—— 加入 Session，但还没写库
# 调用 session.add(user)
session.add(user)
# 此时 user 是 pending，还没 id

# 状态3：persistent（持久）—— flush/commit 后，数据库有，Session 也跟踪
# 调用 session.flush()
session.flush()
# 此时 user 有 id 了，是 persistent

# 状态4：detached（游离）—— Session 关了或 expunge，对象和 Session 脱钩
# 调用 session.close()
session.close()
# user 还在内存，但和 Session 脱钩，是 detached
# 访问 user.id 还行，但访问关系属性 user.posts 会报错（要 Session）

# 状态5：deleted（已删除）—— 标记删除但还没 commit
# 定义变量 session2，赋值为 SessionLocal()
session2 = SessionLocal()
# 调用 session2.add(user)  # 重新关联
# 调用 session2.delete(user2)
# 此时 user2 是 deleted，commit 后真正删
\`\`\`

### 状态转换图

\`\`\`
            add()
transient ─────────▶ pending
                       │
                       │ flush/commit
                       ▼
                   persistent
                    │   ▲
        delete()    │   │ 重新 add()
                    ▼   │
                   deleted
                    │
                    │ commit
                    ▼
                  (对象被删除)

persistent ──expunge/close──▶ detached ──add──▶ persistent
\`\`\`

### 检测对象状态

\`\`\`python
# 从 sqlalchemy import inspect
from sqlalchemy import inspect

# 定义变量 state，赋值为 inspect(user)
state = inspect(user)
# 打印 state.pending / state.persistent / state.detached / state.transient
print(state.pending)      # True/False
print(state.persistent)   # True/False
print(state.detached)     # True/False
print(state.transient)    # True/False
\`\`\`

## 上下文管理器用法（with session_scope()）

每个请求要创建和关闭 Session，手动 try/finally 太啰嗦。封装成上下文管理器：

### 自定义 session_scope

\`\`\`python
# 导入 contextlib
from contextlib import contextmanager

# 定义函数 session_scope，参数:
@contextmanager
def session_scope():
    """自动管理 Session 事务的上下文管理器"""
    # 定义变量 session，赋值为 SessionLocal()
    session = SessionLocal()
    # 条件判断：try
    try:
        # yield session
        yield session
        # 正常退出 with 块，提交
        # 调用 session.commit()
        session.commit()
    # 条件判断：except Exception
    except Exception:
        # 出错回滚
        # 调用 session.rollback()
        session.rollback()
        # 重新抛出
        # 调用 raise
        raise
    # finally
    finally:
        # 无论成败都关闭
        # 调用 session.close()
        session.close()

# 使用
# with session_scope() as session:
with session_scope() as session:
    # 定义变量 user，赋值为 User(name="Tom")
    user = User(name="Tom")
    # 调用 session.add(user)
    session.add(user)
    # 退出 with 自动 commit；出错自动 rollback
\`\`\`

### SQLAlchemy 2.0 内置写法

2.0 推荐直接用 \`Session(engine)\` 当上下文管理器：

\`\`\`python
# 从 sqlalchemy.orm 导入 Session
from sqlalchemy.orm import Session

# Session 本身支持 with 块（但不会自动 commit，要手动）
# with Session(engine) as session:
with Session(engine) as session:
    # 调用 session.add(user)
    session.add(user)
    # 调用 session.commit()
    session.commit()
    # 退出自动 close
\`\`\`

### FastAPI 里的依赖注入写法

\`\`\`python
# 从 fastapi 导入 FastAPI, Depends
from fastapi import FastAPI, Depends
# 从 sqlalchemy.orm 导入 Session
from sqlalchemy.orm import Session

# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义函数 get_db，参数:
def get_db():
    # 定义变量 db，赋值为 SessionLocal()
    db = SessionLocal()
    # 条件判断：try
    try:
        # yield db
        yield db
    # finally
    finally:
        # 调用 db.close()
        db.close()

# 装饰器：app.get("/users")
@app.get("/users")
# 定义函数 list_users，参数: db
def list_users(db: Session = Depends(get_db)):
    # 定义变量 stmt，赋值为 select(User)
    stmt = select(User)
    # 定义变量 users，赋值为 db.scalars(stmt).all()
    users = db.scalars(stmt).all()
    # 返回 users
    return users
\`\`\`

每个请求一个 Session，请求结束自动 close。这是 FastAPI + SQLAlchemy 的标准模式。

## 事务隔离级别

数据库事务有隔离级别，决定「一个事务能看到别的事务的什么数据」。

### 四种隔离级别

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 性能 |
|----------|------|-----------|------|------|
| READ UNCOMMITTED | 可能 | 可能 | 可能 | 最高 |
| READ COMMITTED | 不可能 | 可能 | 可能 | 高 |
| REPEATABLE READ | 不可能 | 不可能 | 可能 | 中 |
| SERIALIZABLE | 不可能 | 不可能 | 不可能 | 最低 |

- **脏读**：读到别的事务没提交的数据（它可能回滚）。
- **不可重复读**：同一事务里两次读同一行结果不同（别人改了提交了）。
- **幻读**：同一事务里两次范围查询结果集不同（别人新增了行）。

### SQLAlchemy 设置隔离级别

\`\`\`python
# 从 sqlalchemy 导入 create_engine
from sqlalchemy import create_engine

# 方式1：在 create_engine 时设
# 定义变量 engine，赋值为 create_engine() 带隔离级别
engine = create_engine(
    "postgresql+psycopg2://user:pass@localhost/db",
    isolation_level="REPEATABLE READ",   # 全局默认隔离级别
)

# 方式2：在连接时设（更灵活，不同操作不同级别）
# with engine.connect().execution_options(isolation_level="SERIALIZABLE") as conn:
with engine.connect().execution_options(isolation_level="SERIALIZABLE") as conn:
    # 这个连接用 SERIALIZABLE
    # 定义变量 result，赋值为 conn.execute(stmt)
    result = conn.execute(stmt)
\`\`\`

### PostgreSQL 和 MySQL 的默认级别

| 数据库 | 默认隔离级别 |
|--------|-------------|
| PostgreSQL | READ COMMITTED |
| MySQL (InnoDB) | REPEATABLE READ |
| Oracle | READ COMMITTED |
| SQL Server | READ COMMITTED |

大多数场景用默认就行，只有特殊需求（如金融转账）才调高。

## 常见陷阱

### 1. 脏读

\`\`\`python
# 事务 A 读到了事务 B 没提交的数据
# 事务 B：
# with engine.begin() as conn_b:
with engine.begin() as conn_b:
    # 调用 conn_b.execute()，改余额但没提交
    conn_b.execute(update(Account).where(Account.id == 1).values(balance=999))
    # 事务 A 在此刻读到了 999（脏读）
    # 如果事务 B 回滚，999 就不存在
\`\`\`

防范：用 READ COMMITTED 及以上级别，自然就不会脏读。

### 2. 丢失更新

\`\`\`python
# 两个事务同时读、同时改、同时提交，后提交的覆盖前一个
# 事务 A：读 balance=100，改成 100+50=150
# 事务 B：读 balance=100，改成 100-30=70
# 都提交后，balance 是 70，A 的 +50 丢了

# 防范1：用 SELECT ... FOR UPDATE 加行锁
# 定义变量 stmt，赋值为 select(Account).where(Account.id == 1).with_for_update()
stmt = select(Account).where(Account.id == 1).with_for_update()
# 事务 A 读时锁住这行，事务 B 等到 A 提交才能读

# 防范2：用乐观锁（version 字段）
# update Account set balance=150, version=version+1 where id=1 and version=原version
# 如果 version 变了，更新影响 0 行，说明被别人改过，重试
\`\`\`

### 3. 长事务

\`\`\`python
# 危险：事务里夹着慢操作
# with engine.begin() as conn:
with engine.begin() as conn:
    # 调用 conn.execute(update1)
    conn.execute(update1)
    # 发邮件（慢，5 秒）
    # 调用 send_email()
    send_email()
    # 调用 conn.execute(update2)
    conn.execute(update2)
    # 整个事务持续 5+ 秒，锁住相关行，阻塞别人
\`\`\`

防范：**事务里只做数据库操作**，慢操作（发邮件、调 API）放事务外面。

\`\`\`python
# 正确：先在事务里改库，提交后再发邮件
# 定义变量 email_sent，赋值为 False
email_sent = False
# with engine.begin() as conn:
with engine.begin() as conn:
    # 调用 conn.execute(update1)
    conn.execute(update1)
    # 调用 conn.execute(update2)
    conn.execute(update2)
    # email_sent = True
    email_sent = True
# 事务已提交，再发邮件
# 条件判断：if email_sent
if email_sent:
    # 调用 send_email()
    send_email()
\`\`\`

### 4. Session 跨请求共享

\`\`\`python
# 错误：全局 Session，多请求共享
# global_session = SessionLocal()  # 千万别这样

# 正确：每个请求独立 Session
# 装饰器：app.get("/x")
@app.get("/x")
# 定义函数 handler，参数: db
def handler(db: Session = Depends(get_db)):
    # db 是当前请求独享的
    # 返回 "ok"
    return "ok"
\`\`\`

### 5. commit 后访问对象报错

\`\`\`python
# expire_on_commit=True（默认）时，commit 后对象过期
# 调用 session.commit()
session.commit()
# 访问属性会触发重新查询
# 打印 user.name
print(user.name)   # 如果 Session 还活着会查库，关了就报 DetachedInstanceError

# 防范：设 expire_on_commit=False，或在 commit 前取出需要的数据
\`\`\`

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 不关闭 Session | 忘记 close，连接泄漏 | 用 with 或依赖注入 |
| 跨请求共享 Session | 全局 Session | 每请求独立 |
| 事务里发邮件 | 慢操作锁库 | 慢操作放事务外 |
| 忘记 commit | 改了不提交 | 显式 commit |
| 不处理异常 | 出错不 rollback | try/except/rollback |
| 共享 Session 多线程 | 同一 Session 多线程用 | scoped_session 或每线程独立 |

## 小结

| 概念 | 一句话 |
|------|--------|
| Session | Unit of Work，跟踪对象改动，统一提交 |
| sessionmaker | Session 工厂，统一配置 |
| 对象状态 | transient/pending/persistent/detached/deleted |
| flush vs commit | flush 写库不提交，commit 提交 |
| session_scope | 上下文管理器，自动 commit/rollback/close |
| 隔离级别 | 控制事务间可见性，默认 READ COMMITTED 够用 |

下一章我们给模型加关系，让对象之间能互相引用。`
  },

  // ============================================================
  // 第 5 章：关系映射
  // ============================================================
  {
    id: "pyweb2-sqlalchemy-relations",
    group: "ORM 与 SQLAlchemy",
    icon: "🔗",
    title: "关系映射（一对多/多对多/一对一）",
    content: `# 关系映射（一对多/多对多/一对一）

## relationship() 与 foreign_key()

关系映射是 ORM 最强大的能力：你定义好模型之间的关系，ORM 帮你处理外键、JOIN、懒加载，让你像操作普通对象一样操作关联数据。

核心 API 是 \`relationship()\`，它定义「Python 对象之间怎么互相访问」，和数据库的外键配合工作。

**关键认知**：
- **外键（ForeignKey）**：数据库层面的关联，定义在「多」的一方。
- **relationship()**：Python 层面的关联，定义访问方向，让 \`user.posts\` 能直接拿到关联对象。

两者配合：外键管数据库结构，relationship 管 Python 对象导航。

## 一对多关系（User → Posts）完整示例

一个用户有多篇文章，这是最经典的一对多。

\`\`\`python
# 从 sqlalchemy 导入 Integer, String, Text, ForeignKey
from sqlalchemy import Integer, String, Text, ForeignKey
# 从 sqlalchemy.orm 导入 DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
# 导入 typing.List
from typing import List

# 定义 Base
class Base(DeclarativeBase):
    # 定义 pass
    pass

# 用户表（「一」的一方）
# 定义类 User(Base)
class User(Base):
    # 定义 __tablename__，赋值为 "users"
    __tablename__ = "users"

    # 定义 id，赋值为 mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 定义 name，赋值为 mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(50))

    # relationship 定义关联：一个用户有多个文章
    # Mapped[List[Post]] 表示这是 Post 对象列表
    # back_populates="author" 指向对方的关系属性，双向绑定
    # 定义 posts，赋值为 relationship()
    posts: Mapped[List["Post"]] = relationship(back_populates="author")

    # 定义 __repr__，参数: self
    def __repr__(self):
        # 返回 f"<User {self.name}>"
        return f"<User {self.name}>"

# 文章表（「多」的一方）
# 定义类 Post(Base)
class Post(Base):
    # 定义 __tablename__，赋值为 "posts"
    __tablename__ = "posts"

    # 定义 id，赋值为 mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 定义 title，赋值为 mapped_column(String(200))
    title: Mapped[str] = mapped_column(String(200))
    # 外键：关联 users.id
    # 定义 user_id，赋值为 mapped_column(ForeignKey("users.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # 反向关系：多对一，back_populates 指向 User.posts
    # 定义 author，赋值为 relationship()
    author: Mapped["User"] = relationship(back_populates="posts")

    # 定义 __repr__，参数: self
    def __repr__(self):
        # 返回 f"<Post {self.title}>"
        return f"<Post {self.title}>"
\`\`\`

### 使用一对多关系

\`\`\`python
# 从 sqlalchemy 导入 create_engine, select
from sqlalchemy import create_engine, select
# 从 sqlalchemy.orm 导入 Session
from sqlalchemy.orm import Session

# 定义变量 engine，赋值为 create_engine("sqlite:///blog.db")
engine = create_engine("sqlite:///blog.db")
# 调用 Base.metadata.create_all(engine)
Base.metadata.create_all(engine)

# with Session(engine) as session:
with Session(engine) as session:
    # 创建用户和文章，自动关联
    # 定义变量 user，赋值为 User(name="Tom")
    user = User(name="Tom")
    # 定义变量 post1，赋值为 Post(title="文章1")
    post1 = Post(title="文章1")
    # 定义变量 post2，赋值为 Post(title="文章2")
    post2 = Post(title="文章2")

    # 通过关系属性关联，ORM 自动设置外键
    # user.posts = [post1, post2]
    user.posts = [post1, post2]
    # 调用 session.add(user)
    session.add(user)
    # 调用 session.commit()
    session.commit()

    # 查询用户的文章
    # 定义变量 u，赋值为 session.scalars(select(User)).first()
    u = session.scalars(select(User)).first()
    # 访问 u.posts 会自动查询（懒加载）
    # 打印
    print(u.posts)         # [<Post 文章1>, <Post 文章2>]
    # 反向访问
    # 打印
    print(u.posts[0].author.name)  # Tom，反向也能拿到
\`\`\`

## 多对一关系（Post → User）反向引用 back_populates

上面的例子其实已经包含了多对一：从 Post 看，多个 Post 属于一个 User，这是多对一。

\`back_populates\` 的作用是让两边的关系属性同步更新：

\`\`\`python
# 设了 back_populates 后，改一边另一边自动更新
# 定义变量 post，赋值为 Post(title="新文章")
post = Post(title="新文章")
# 定义变量 user，赋值为 User(name="Tom")
user = User(name="Tom")

# 设置正向关系
# post.author = user
post.author = user
# 反向自动更新
# 打印
print(post in user.posts)  # True，不用手动加

# 反过来也行
# 定义变量 post2，赋值为 Post(title="文章2")
post2 = Post(title="文章2")
# user.posts.append(post2)
user.posts.append(post2)
# 反向自动更新
# 打印
print(post2.author is user)  # True
\`\`\`

### back_populates vs backref

\`\`\`python
# 方式1：back_populates（推荐，显式双向，清晰）
# 两边都写 relationship，用 back_populates 互相指向
# user.posts = relationship(back_populates="author")
# post.author = relationship(back_populates="posts")

# 方式2：backref（旧式，只写一边，自动生成另一边）
# user.posts = relationship("Post", backref="author")
# 等价于自动给 Post 加了 author 关系属性
# 不推荐：隐藏了反向关系的定义，不直观
\`\`\`

**推荐用 back_populates**，显式比隐式好维护。

## 一对一关系（uselist=False）

一对一就是一对多的特例，把「多」的一方限制成只能有一个。设 \`uselist=False\`。

\`\`\`python
# 从 sqlalchemy 导入 String, Integer, ForeignKey
from sqlalchemy import String, Integer, ForeignKey
# 从 sqlalchemy.orm 导入 Mapped, mapped_column, relationship
from sqlalchemy.orm import Mapped, mapped_column, relationship

# 用户表
# 定义类 User(Base)
class User(Base):
    # 定义 __tablename__，赋值为 "users"
    __tablename__ = "users"
    # 定义 id，赋值为 mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 定义 name，赋值为 mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(50))

    # uselist=False 表示一对一（返回单个对象而不是列表）
    # 定义 profile，赋值为 relationship()
    profile: Mapped["Profile"] = relationship(back_populates="user", uselist=False)

# 资料表（一对一）
# 定义类 Profile(Base)
class Profile(Base):
    # 定义 __tablename__，赋值为 "profiles"
    __tablename__ = "profiles"
    # 定义 id，赋值为 mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 定义 bio，赋值为 mapped_column(String(200))
    bio: Mapped[str] = mapped_column(String(200))
    # 外键关联 users.id，加 unique=True 保证一对一
    # 定义 user_id，赋值为 mapped_column(ForeignKey("users.id"), unique=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)

    # 定义 user，赋值为 relationship()
    user: Mapped["User"] = relationship(back_populates="profile")

# 使用
# with Session(engine) as session:
with Session(engine) as session:
    # 定义变量 user，赋值为 User(name="Tom")
    user = User(name="Tom")
    # 定义变量 profile，赋值为 Profile(bio="我是 Tom")
    profile = Profile(bio="我是 Tom")
    # user.profile = profile
    user.profile = profile
    # 调用 session.add(user)
    session.add(user)
    # 调用 session.commit()
    session.commit()

    # 访问：一对一返回单个对象，不是列表
    # 定义变量 u，赋值为 session.get(User, 1)
    u = session.get(User, 1)
    # 打印 u.profile.bio
    print(u.profile.bio)   # 我是 Tom
\`\`\`

## 多对多关系（secondary / association_table）

多对多需要一个**关联表（association table）**来连接两边的表。比如学生和课程：一个学生选多门课，一门课有多个学生。

\`\`\`python
# 从 sqlalchemy 导入 Table, Column, Integer, String, ForeignKey
from sqlalchemy import Table, Column, Integer, String, ForeignKey
# 从 sqlalchemy.orm 导入 Mapped, mapped_column, relationship
from sqlalchemy.orm import Mapped, mapped_column, relationship
# 导入 typing.List
from typing import List

# 关联表：只有外键，没有独立模型类（用 Table 定义）
# 定义变量 student_course，赋值为 Table()
student_course = Table(
    "student_course",
    Base.metadata,
    # 关联 student.id
    # Column("student_id", ForeignKey("students.id"), primary_key=True)
    Column("student_id", ForeignKey("students.id"), primary_key=True),
    # 关联 course.id
    # Column("course_id", ForeignKey("courses.id"), primary_key=True)
    Column("course_id", ForeignKey("courses.id"), primary_key=True),
)

# 学生表
# 定义类 Student(Base)
class Student(Base):
    # 定义 __tablename__，赋值为 "students"
    __tablename__ = "students"
    # 定义 id，赋值为 mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 定义 name，赋值为 mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(50))

    # secondary 指定关联表
    # 定义 courses，赋值为 relationship()
    courses: Mapped[List["Course"]] = relationship(
        secondary=student_course,        # 关联表
        back_populates="students",       # 双向
    )

# 课程表
# 定义类 Course(Base)
class Course(Base):
    # 定义 __tablename__，赋值为 "courses"
    __tablename__ = "courses"
    # 定义 id，赋值为 mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 定义 name，赋值为 mapped_column(String(100))
    name: Mapped[str] = mapped_column(String(100))

    # 定义 students，赋值为 relationship()
    students: Mapped[List["Student"]] = relationship(
        secondary=student_course,
        back_populates="courses",
    )

# 使用
# with Session(engine) as session:
with Session(engine) as session:
    # 创建学生和课程
    # 定义变量 tom，赋值为 Student(name="Tom")
    tom = Student(name="Tom")
    # 定义变量 math，赋值为 Course(name="数学")
    math = Course(name="数学")
    # 定义变量 physics，赋值为 Course(name="物理")
    physics = Course(name="物理")

    # Tom 选了数学和物理
    # tom.courses = [math, physics]
    tom.courses = [math, physics]
    # 调用 session.add(tom)
    session.add(tom)
    # 调用 session.commit()
    session.commit()

    # 查询：Tom 选了哪些课
    # 定义变量 s，赋值为 session.get(Student, 1)
    s = session.get(Student, 1)
    # 打印 [c.name for c in s.courses]
    print([c.name for c in s.courses])  # ['数学', '物理']

    # 反向：数学课有哪些学生
    # 定义变量 c，赋值为 session.get(Course, 1)
    c = session.get(Course, 1)
    # 打印 [s.name for s in c.students]
    print([s.name for s in c.students])  # ['Tom']

    # Tom 退选数学（从关联表删一行）
    # s.courses.remove(c)
    s.courses.remove(c)
    # 调用 session.commit()
    session.commit()
    # 关联表里对应行被删，但 Student 和 Course 记录还在
\`\`\`

### 带额外字段的多对多

如果关联表要存额外信息（如选课时间、成绩），就要给关联表建独立模型：

\`\`\`python
# 关联表用模型类定义，带额外字段
# 定义类 Enrollment(Base)
class Enrollment(Base):
    # 定义 __tablename__，赋值为 "enrollments"
    __tablename__ = "enrollments"
    # 定义 student_id，赋值为 mapped_column(ForeignKey("students.id"), primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), primary_key=True)
    # 定义 course_id，赋值为 mapped_column(ForeignKey("courses.id"), primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), primary_key=True)
    # 额外字段：选课时间、成绩
    # 定义 enrolled_at，赋值为 mapped_column(server_default=func.now())
    enrolled_at: Mapped[datetime] = mapped_column(server_default=func.now())
    # 定义 grade，赋值为 mapped_column(String(2), nullable=True)
    grade: Mapped[str | None] = mapped_column(String(2), nullable=True)

    # 定义 student，赋值为 relationship()
    student: Mapped["Student"] = relationship(back_populates="enrollments")
    # 定义 course，赋值为 relationship()
    course: Mapped["Course"] = relationship(back_populates="enrollments")

# Student 和 Course 改成关联 Enrollment
# 定义类 Student(Base)
class Student(Base):
    # 定义 __tablename__，赋值为 "students"
    __tablename__ = "students"
    # 定义 id，赋值为 mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 通过 Enrollment 间接关联 Course
    # 定义 enrollments，赋值为 relationship()
    enrollments: Mapped[List["Enrollment"]] = relationship(back_populates="student")
\`\`\`

## 级联删除（cascade="all, delete-orphan"）

删除父对象时，子对象怎么办？用 \`cascade\` 配置。

\`\`\`python
# 定义类 User(Base)
class User(Base):
    # 定义 __tablename__，赋值为 "users"
    __tablename__ = "users"
    # 定义 id，赋值为 mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # cascade="all, delete-orphan" 表示：
    # all: 所有操作（save-update, merge, refresh-expire, expunge, delete）都级联
    # delete-orphan: 删父对象时，没父对象的子对象也删（孤儿删除）
    # 定义 posts，赋值为 relationship()
    posts: Mapped[List["Post"]] = relationship(
        back_populates="author",
        cascade="all, delete-orphan",   # 关键配置
    )

# with Session(engine) as session:
with Session(engine) as session:
    # 定义变量 user，赋值为 session.get(User, 1)
    user = session.get(User, 1)
    # 删除用户
    # 调用 session.delete(user)
    session.delete(user)
    # 调用 session.commit()
    session.commit()
    # user 的所有 posts 也被级联删除了

# 如果不设 delete-orphan，只设 cascade="all"
# 删 user 时 posts 也会被删（因为 delete 在 all 里）
# 但「移除关系」（user.posts.remove(post)）不会删 post，post 的 user_id 被设成 NULL
# 设了 delete-orphan，移除关系会让 post 变孤儿，自动删除
\`\`\`

### 常用 cascade 选项

| 选项 | 含义 |
|------|------|
| save-update | add 父对象时子对象也 add |
| delete | 删父对象时子对象也删 |
| delete-orphan | 子对象失去父对象时删（孤儿删除） |
| merge | merge 父对象时子对象也 merge |
| all | 上面除 delete-orphan 外的所有 |
| all, delete-orphan | 最常用，删父删子，断关系删子 |

**典型选择**：
- 父子强依赖（用户和资料）：\`all, delete-orphan\`，删父删子。
- 父子弱依赖（文章和标签）：\`save-update, merge\`，删文章不删标签。

## 懒加载 vs 预加载

默认 \`relationship()\` 是**懒加载（lazy loading）**：访问 \`user.posts\` 时才发 SQL 查询。方便但容易 N+1。

\`\`\`python
# 默认 lazy="select"（懒加载）
# 定义 posts，赋值为 relationship()
posts: Mapped[List["Post"]] = relationship()  # 等价于 lazy="select"

# 访问 user.posts 才查库
# 定义变量 users，赋值为 session.scalars(select(User)).all()
users = session.scalars(select(User)).all()
# 循环：for u in users
for u in users:
    # 每次访问 u.posts 都发一条 SQL（N+1）
    # 打印 len(u.posts)
    print(len(u.posts))
\`\`\`

### 预加载策略

预加载在查询主对象时就把关联数据一起查出来。

#### joinedload（JOIN 预加载）

\`\`\`python
# 从 sqlalchemy.orm 导入 joinedload
from sqlalchemy.orm import joinedload

# joinedload 用一条 JOIN SQL 把关联数据查出来
# 定义变量 stmt，赋值为 select(User).options(joinedload(User.posts))
stmt = select(User).options(joinedload(User.posts))
# 定义变量 users，赋值为 session.scalars(stmt).unique().all()
users = session.scalars(stmt).unique().all()
# 1 条 SQL，访问 user.posts 不再查库
# 循环：for u in users
for u in users:
    # 打印 len(u.posts)
    print(len(u.posts))
\`\`\`

适用：关联数据量小、一对一关系。一对多用 JOIN 可能笛卡尔积膨胀，要小心。

#### selectinload（IN 预加载，推荐一对多）

\`\`\`python
# 从 sqlalchemy.orm 导入 selectinload
from sqlalchemy.orm import selectinload

# selectinload 用两条 SQL：先查主表，再用 IN 查关联表
# 定义变量 stmt，赋值为 select(User).options(selectinload(User.posts))
stmt = select(User).options(selectinload(User.posts))
# 定义变量 users，赋值为 session.scalars(stmt).all()
users = session.scalars(stmt).all()
# 2 条 SQL：1 条查 users，1 条查 posts WHERE user_id IN (...)
# 循环：for u in users
for u in users:
    # 打印 len(u.posts)
    print(len(u.posts))
\`\`\`

适用：一对多、多对多，避免 JOIN 笛卡尔积。**这是最推荐的预加载方式**。

#### raiseload（禁止懒加载）

\`\`\`python
# 从 sqlalchemy.orm 导入 raiseload
from sqlalchemy.orm import raiseload

# raiseload 让懒加载直接报错，强迫你显式预加载
# 定义变量 stmt，赋值为 select(User).options(raiseload(User.posts))
stmt = select(User).options(raiseload(User.posts))
# 定义变量 users，赋值为 session.scalars(stmt).all()
users = session.scalars(stmt).all()
# 循环：for u in users
for u in users:
    # 访问 u.posts 会抛异常，提醒你忘了预加载
    # 打印 u.posts
    print(u.posts)  # raise InvalidRequestError
\`\`\`

适用：性能敏感场景，强制开发者显式预加载。

### 在模型定义里设默认加载策略

\`\`\`python
# 定义 posts，赋值为 relationship()
posts: Mapped[List["Post"]] = relationship(
    back_populates="author",
    lazy="selectin",      # 默认就用 selectinload 预加载
)
# 这样查询时不用每次写 .options()，但所有查询都预加载，可能浪费
\`\`\`

### 加载策略对比

| 策略 | SQL 数 | 适用 | 注意 |
|------|--------|------|------|
| lazy="select"（默认） | N+1 | 关联偶尔访问 | 易 N+1 |
| joinedload | 1（JOIN） | 一对一、关联小 | 一对多笛卡尔积 |
| selectinload | 2（IN） | 一对多、多对多 | 推荐 |
| raiseload | - | 强制预加载 | 调试用 |
| subqueryload | 2（子查询） | 老版本兼容 | 2.0 后少用 |

## 关系映射速查表

| 关系类型 | 外键位置 | relationship 配置 |
|----------|----------|-------------------|
| 一对多 | 多的一方 | 一方 uselist=True（默认），多方反向 |
| 多对一 | 多的一方 | 多方 relationship，一方反向 |
| 一对一 | 任意一方 + unique | uselist=False |
| 多对多 | 关联表 | secondary=关联表 |

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| N+1 查询 | 循环访问关系属性 | 用 selectinload 预加载 |
| 忘 back_populates | 单向关系，反向访问报错 | 双向都写 back_populates |
| 一对多用 joinedload | 笛卡尔积膨胀 | 一对多用 selectinload |
| 级联删错 | cascade 配错删了不该删的 | 父子强依赖才 delete-orphan |
| 多对多忘 secondary | 关系建不起来 | 多对多必加 secondary |
| 关联表用模型 | 简单多对多建模型类多此一举 | 无额外字段用 Table，有则用模型 |

## 小结

| 概念 | 一句话 |
|------|--------|
| relationship | Python 层关联，让对象互相访问 |
| back_populates | 双向绑定，改一边另一边自动更新 |
| uselist=False | 一对一 |
| secondary | 多对多的关联表 |
| cascade="all, delete-orphan" | 删父删子，断关系删子 |
| selectinload | 一对多预加载首选 |

下一章深入查询，看怎么过滤、排序、聚合。`
  },

  // ============================================================
  // 第 6 章：查询、过滤、排序与聚合
  // ============================================================
  {
    id: "pyweb2-sqlalchemy-query",
    group: "ORM 与 SQLAlchemy",
    icon: "🔍",
    title: "查询、过滤、排序与聚合",
    content: `# 查询、过滤、排序与聚合

## select() 语句（SQLAlchemy 2.0 风格）

SQLAlchemy 2.0 全面采用 \`select()\` 构造查询，取代 1.x 的 \`session.query()\`。\`select()\` 返回一个 \`Select\` 对象，可以链式配置，最后交给 \`session.execute()\` 或 \`session.scalars()\` 执行。

\`\`\`python
# 从 sqlalchemy 导入 select
from sqlalchemy import select
# 从 sqlalchemy.orm 导入 Session
from sqlalchemy.orm import Session

# 基础查询：查所有用户
# 定义变量 stmt，赋值为 select(User)
stmt = select(User)
# execute 返回 Result，scalars 返回 ScalarResult（直接是对象不是 Row）
# 定义变量 users，赋值为 session.scalars(stmt).all()
users = session.scalars(stmt).all()
# users 是 User 对象列表

# 查询单个：first() 取第一个，没数据返回 None
# 定义变量 u，赋值为 session.scalars(stmt).first()
u = session.scalars(stmt).first()

# 查询单个：one() 取唯一一个，没有或多于一个都报错
# 定义变量 stmt2，赋值为 select(User).where(User.id == 1)
stmt2 = select(User).where(User.id == 1)
# 定义变量 u2，赋值为 session.scalars(stmt2).one()
u2 = session.scalars(stmt2).one()

# 按主键查：session.get() 最快（带缓存）
# 定义变量 u3，赋值为 session.get(User, 1)
u3 = session.get(User, 1)
\`\`\`

### execute vs scalars

\`\`\`python
# execute 返回 Result，每行是 Row 对象（即使只查一个模型）
# 定义变量 result，赋值为 session.execute(select(User))
result = session.execute(select(User))
# 循环：for row in result
for row in result:
    # row 是 Row，row[0] 或 row.User 才是 User 对象
    # 定义变量 user，赋值为 row[0]
    user = row[0]

# scalars 返回 ScalarResult，直接是对象（解包了 Row）
# 定义变量 users，赋值为 session.scalars(select(User)).all()
users = session.scalars(select(User)).all()
# 循环：for user in users
for user in users:
    # user 直接是 User 对象
    # 打印 user.name
    print(user.name)
\`\`\`

**经验法则**：查单个模型用 \`scalars()\`，查多列/多表用 \`execute()\` 然后手动取。

## 过滤（where / filter_by / and_ / or_ / not_）

### where（2.0 推荐）

\`\`\`python
# 单条件
# 定义变量 stmt，赋值为 select(User).where(User.age > 18)
stmt = select(User).where(User.age > 18)

# 多个 where 自动 AND
# 定义变量 stmt2，赋值为 select(User).where(User.age > 18, User.active == True)
stmt2 = select(User).where(User.age > 18, User.active == True)

# 链式 where 也是 AND
# 定义变量 stmt3，赋值为 select(User).where(User.age > 18).where(User.active == True)
stmt3 = select(User).where(User.age > 18).where(User.active == True)
\`\`\`

### filter_by（按关键字过滤）

\`\`\`python
# filter_by 用关键字参数，简洁但只能等值比较
# 定义变量 stmt，赋值为 select(User).filter_by(active=True, name="Tom")
stmt = select(User).filter_by(active=True, name="Tom")
# 等价于 where(User.active == True, User.name == "Tom")
\`\`\`

### and_ / or_ / not_

\`\`\`python
# 从 sqlalchemy 导入 and_, or_, not_
from sqlalchemy import and_, or_, not_

# AND
# 定义变量 stmt，赋值为 select(User).where(and_(User.age > 18, User.active == True))
stmt = select(User).where(and_(User.age > 18, User.active == True))

# OR：年龄大于 60 或者是管理员
# 定义变量 stmt2，赋值为 select(User).where(or_(User.age > 60, User.is_admin == True))
stmt2 = select(User).where(or_(User.age > 60, User.is_admin == True))

# NOT：不是管理员的用户
# 定义变量 stmt3，赋值为 select(User).where(not_(User.is_admin == True))
stmt3 = select(User).where(not_(User.is_admin == True))

# 混合：年龄 > 18 且（是管理员 或 邮箱以 @admin.com 结尾）
# 定义变量 stmt4，赋值为 select(User).where()
stmt4 = select(User).where(
    and_(
        User.age > 18,
        or_(User.is_admin == True, User.email.like("%@admin.com"))
    )
)
\`\`\`

## 运算符（==、!=、>、<、like、in_、between、is_）

\`\`\`python
# 从 sqlalchemy 导入 select
from sqlalchemy import select

# 等于
# 定义变量 stmt，赋值为 select(User).where(User.name == "Tom")
stmt = select(User).where(User.name == "Tom")

# 不等于
# 定义变量 stmt2，赋值为 select(User).where(User.name != "Tom")
stmt2 = select(User).where(User.name != "Tom")

# 大于 / 小于 / 大于等于 / 小于等于
# 定义变量 stmt3，赋值为 select(User).where(User.age > 18)
stmt3 = select(User).where(User.age > 18)
# 定义变量 stmt4，赋值为 select(User).where(User.age >= 18)
stmt4 = select(User).where(User.age >= 18)
# 定义变量 stmt5，赋值为 select(User).where(User.age < 60)
stmt5 = select(User).where(User.age < 60)

# like：模糊匹配（% 任意多字符，_ 单个字符）
# 定义变量 stmt6，赋值为 select(User).where(User.name.like("T%"))
stmt6 = select(User).where(User.name.like("T%"))   # 以 T 开头
# 定义变量 stmt7，赋值为 select(User).where(User.email.like("%@gmail.com"))
stmt7 = select(User).where(User.email.like("%@gmail.com"))  # gmail 邮箱

# ilike：不区分大小写的 like（推荐）
# 定义变量 stmt8，赋值为 select(User).where(User.name.ilike("t%"))
stmt8 = select(User).where(User.name.ilike("t%"))  # t 或 T 开头都行

# in_：在列表里
# 定义变量 stmt9，赋值为 select(User).where(User.id.in_([1, 2, 3]))
stmt9 = select(User).where(User.id.in_([1, 2, 3]))

# notin_：不在列表里
# 定义变量 stmt10，赋值为 select(User).where(User.id.notin_([1, 2, 3]))
stmt10 = select(User).where(User.id.notin_([1, 2, 3]))

# between：在范围内（含端点）
# 定义变量 stmt11，赋值为 select(User).where(User.age.between(18, 60))
stmt11 = select(User).where(User.age.between(18, 60))

# is_：判断 NULL（不能用 == None）
# 定义变量 stmt12，赋值为 select(User).where(User.bio.is_(None))
stmt12 = select(User).where(User.bio.is_(None))   # bio 是 NULL

# is not：判断非 NULL
# 定义变量 stmt13，赋值为 select(User).where(User.bio.isnot(None))
stmt13 = select(User).where(User.bio.isnot(None))

# contains / startswith / endswith：字符串快捷方法
# 定义变量 stmt14，赋值为 select(User).where(User.name.contains("om"))
stmt14 = select(User).where(User.name.contains("om"))     # 包含 om
# 定义变量 stmt15，赋值为 select(User).where(User.name.startswith("T"))
stmt15 = select(User).where(User.name.startswith("T"))    # 以 T 开头
# 定义变量 stmt16，赋值为 select(User).where(User.name.endswith("m"))
stmt16 = select(User).where(User.name.endswith("m"))      # 以 m 结尾
\`\`\`

### 运算符速查表

| 运算符 | 含义 | 示例 |
|--------|------|------|
| == | 等于 | User.name == "Tom" |
| != | 不等于 | User.name != "Tom" |
| >, <, >=, <= | 比较 | User.age > 18 |
| like | 模糊（区分大小写） | User.name.like("T%") |
| ilike | 模糊（不区分） | User.name.ilike("t%") |
| in_ | 在列表 | User.id.in_([1,2]) |
| notin_ | 不在列表 | User.id.notin_([1,2]) |
| between | 范围 | User.age.between(18,60) |
| is_ / isnot | NULL 判断 | User.bio.is_(None) |
| contains | 包含子串 | User.name.contains("om") |
| startswith | 以...开头 | User.name.startswith("T") |
| endswith | 以...结尾 | User.name.endswith("m") |

## 排序（order_by / asc / desc）

\`\`\`python
# 从 sqlalchemy 导入 select, asc, desc
from sqlalchemy import select, asc, desc

# 升序（默认）
# 定义变量 stmt，赋值为 select(User).order_by(User.name)
stmt = select(User).order_by(User.name)              # 默认升序
# 定义变量 stmt2，赋值为 select(User).order_by(asc(User.name))
stmt2 = select(User).order_by(asc(User.name))        # 显式升序

# 降序
# 定义变量 stmt3，赋值为 select(User).order_by(desc(User.age))
stmt3 = select(User).order_by(desc(User.age))        # 年龄降序

# 多字段排序：先按年龄降序，年龄相同按名字升序
# 定义变量 stmt4，赋值为 select(User).order_by(desc(User.age), asc(User.name))
stmt4 = select(User).order_by(desc(User.age), asc(User.name))

# NULL 处理：nullsfirst / nullslast
# 从 sqlalchemy 导入 nullsfirst, nullslast
from sqlalchemy import nullsfirst, nullslast
# 定义变量 stmt5，赋值为 select(User).order_by(User.age.desc().nullsfirst())
stmt5 = select(User).order_by(User.age.desc().nullsfirst())  # NULL 排最前
\`\`\`

## 限制与分页（limit / offset / slice）

\`\`\`python
# 从 sqlalchemy 导入 select
from sqlalchemy import select

# limit：取前 10 条
# 定义变量 stmt，赋值为 select(User).limit(10)
stmt = select(User).limit(10)

# offset：跳过前 20 条
# 定义变量 stmt2，赋值为 select(User).offset(20)
stmt2 = select(User).offset(20)

# 分页：第 3 页，每页 10 条（跳过 20，取 10）
# 定义变量 page，赋值为 3
page = 3
# 定义变量 per_page，赋值为 10
per_page = 10
# 定义变量 stmt3，赋值为 select(User).offset((page-1)*per_page).limit(per_page)
stmt3 = select(User).offset((page - 1) * per_page).limit(per_page)

# slice：用切片语法（等价 offset + limit）
# 定义变量 stmt4，赋值为 select(User).slice(20, 30)
stmt4 = select(User).slice(20, 30)   # 跳过 20 取到 30（不含）

# 执行
# 定义变量 users，赋值为 session.scalars(stmt3).all()
users = session.scalars(stmt3).all()
\`\`\`

### 分页完整封装

\`\`\`python
# 定义函数 paginate，参数: session, model, page, per_page, filters=None
def paginate(session, model, page: int, per_page: int, filters=None):
    """通用分页函数"""
    # 定义变量 stmt，赋值为 select(model)
    stmt = select(model)
    # 条件判断：if filters
    if filters:
        # stmt = stmt.where(*filters)
        stmt = stmt.where(*filters)

    # 计算总数（用 func.count）
    # 从 sqlalchemy 导入 func, select
    from sqlalchemy import func, select
    # 定义变量 count_stmt，赋值为 select(func.count()).select_from(model).where(*filters if filters else True)
    count_stmt = select(func.count()).select_from(model)
    # 条件判断：if filters
    if filters:
        # count_stmt = count_stmt.where(*filters)
        count_stmt = count_stmt.where(*filters)
    # 定义变量 total，赋值为 session.scalar(count_stmt)
    total = session.scalar(count_stmt)

    # 分页查询
    # 定义变量 stmt2，赋值为 stmt.offset((page-1)*per_page).limit(per_page)
    stmt2 = stmt.offset((page - 1) * per_page).limit(per_page)
    # 定义变量 items，赋值为 session.scalars(stmt2).all()
    items = session.scalars(stmt2).all()

    # 返回字典
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,   # 总页数（向上取整）
    }
\`\`\`

## 聚合函数（func.count / func.sum / func.avg）

\`\`\`python
# 从 sqlalchemy 导入 select, func
from sqlalchemy import select, func

# count：统计数量
# 定义变量 stmt，赋值为 select(func.count(User.id))
stmt = select(func.count(User.id))
# 定义变量 total，赋值为 session.scalar(stmt)
total = session.scalar(stmt)   # 返回单个数字

# sum：求和
# 定义变量 stmt2，赋值为 select(func.sum(Order.amount))
stmt2 = select(func.sum(Order.amount))
# 定义变量 total_amount，赋值为 session.scalar(stmt2)
total_amount = session.scalar(stmt2)

# avg：平均
# 定义变量 stmt3，赋值为 select(func.avg(User.age))
stmt3 = select(func.avg(User.age))
# 定义变量 avg_age，赋值为 session.scalar(stmt3)
avg_age = session.scalar(stmt3)

# min / max：最小最大
# 定义变量 stmt4，赋值为 select(func.min(User.age), func.max(User.age))
stmt4 = select(func.min(User.age), func.max(User.age))
# 定义变量 row，赋值为 session.execute(stmt4).one()
row = session.execute(stmt4).one()
# 打印 row
print(row[0], row[1])   # 最小年龄，最大年龄

# 常用聚合：count distinct
# 定义变量 stmt5，赋值为 select(func.count(distinct(User.email)))
stmt5 = select(func.count(func.distinct(User.email)))
\`\`\`

## 分组（group_by / having）

\`\`\`python
# 从 sqlalchemy 导入 select, func
from sqlalchemy import select, func

# 按用户分组，统计每个用户的文章数
# 定义变量 stmt，赋值为 select(Post.user_id, func.count(Post.id).label("post_count"))
stmt = select(
    Post.user_id,
    func.count(Post.id).label("post_count")   # label 给结果列起别名
).group_by(Post.user_id)
# 定义变量 rows，赋值为 session.execute(stmt).all()
rows = session.execute(stmt).all()
# 循环：for row in rows
for row in rows:
    # 打印
    print(row.user_id, row.post_count)

# having：分组后过滤（类似 where 但作用在分组结果上）
# 找出发文数超过 5 篇的用户
# 定义变量 stmt2，赋值为 select(Post.user_id, func.count(Post.id))
stmt2 = select(
    Post.user_id,
    func.count(Post.id)
).group_by(Post.user_id).having(func.count(Post.id) > 5)
# 定义变量 rows2，赋值为 session.execute(stmt2).all()
rows2 = session.execute(stmt2).all()

# 多字段分组：每个用户每年发文数
# 定义变量 stmt3，赋值为 select()
stmt3 = select(
    Post.user_id,
    func.extract("year", Post.created_at).label("year"),  # 提取年份
    func.count(Post.id).label("count")
).group_by(Post.user_id, func.extract("year", Post.created_at))
\`\`\`

### where vs having

- **where**：分组前过滤行（过滤原始数据）。
- **having**：分组后过滤组（过滤聚合结果）。

\`\`\`python
# 找出 2024 年发文超过 5 篇的用户
# 定义变量 stmt，赋值为 select(Post.user_id, func.count(Post.id))
stmt = select(Post.user_id, func.count(Post.id)).where(
    func.extract("year", Post.created_at) == 2024   # where：先过滤 2024 的文章
).group_by(Post.user_id).having(
    func.count(Post.id) > 5                          # having：再过滤组
)
\`\`\`

## 连接查询（join / outerjoin）

\`\`\`python
# 从 sqlalchemy 导入 select
from sqlalchemy import select

# join：内连接
# 查用户和他们的文章（只查有文章的用户）
# 定义变量 stmt，赋值为 select(User.name, Post.title)
stmt = select(User.name, Post.title).join(
    Post, User.id == Post.user_id     # join 表 + 条件
)
# 定义变量 rows，赋值为 session.execute(stmt).all()
rows = session.execute(stmt).all()

# 简写：如果模型定义了 relationship，join 可以自动推断条件
# 定义变量 stmt2，赋值为 select(User.name, Post.title).join(User.posts)
stmt2 = select(User.name, Post.title).join(User.posts)

# outerjoin：左外连接（左表全保留，右表没有的填 NULL）
# 查所有用户及其文章（没文章的用户也出现）
# 定义变量 stmt3，赋值为 select(User.name, Post.title).outerjoin(Post, User.id == Post.user_id)
stmt3 = select(User.name, Post.title).outerjoin(Post, User.id == Post.user_id)

# 多表 join
# 定义变量 stmt4，赋值为 select(User.name, Post.title, Comment.content)
stmt4 = select(User.name, Post.title, Comment.content).join(
    Post, User.id == Post.user_id
).join(
    Comment, Post.id == Comment.post_id
)
\`\`\`

### 用 relationship 简化 join

如果模型定义了 relationship，join 可以更简洁：

\`\`\`python
# 模型定义了 User.posts 和 Post.author
# join 自动用关系的外键
# 定义变量 stmt，赋值为 select(User.name, Post.title).join(User.posts)
stmt = select(User.name, Post.title).join(User.posts)

# 从 Post 视角 join author
# 定义变量 stmt2，赋值为 select(Post.title, User.name).join(Post.author)
stmt2 = select(Post.title, User.name).join(Post.author)

# selectinload 配合 join 查询
# 从 sqlalchemy.orm 导入 selectinload, joinedload
from sqlalchemy.orm import selectinload, joinedload
# 定义变量 stmt3，赋值为 select(User).options(selectinload(User.posts)).join(User.posts)
stmt3 = select(User).options(selectinload(User.posts)).join(User.posts).where(Post.title.like("T%"))
\`\`\`

## 子查询与 EXISTS

### 子查询（subquery）

\`\`\`python
# 从 sqlalchemy 导入 select, func
from sqlalchemy import select, func

# 子查询：发文数超过 5 的用户 ID
# 定义变量 subq，赋值为 select(Post.user_id).group_by(Post.user_id).having(func.count(Post.id) > 5).subquery()
subq = select(Post.user_id).group_by(Post.user_id).having(
    func.count(Post.id) > 5
).subquery()   # subquery() 把 select 变成可被外部引用的子查询

# 用子查询过滤
# 定义变量 stmt，赋值为 select(User).where(User.id.in_(select(subq.c.user_id)))
stmt = select(User).where(User.id.in_(select(subq.c.user_id)))
# 定义变量 users，赋值为 session.scalars(stmt).all()
users = session.scalars(stmt).all()
\`\`\`

### EXISTS

\`\`\`python
# 从 sqlalchemy 导入 exists, select
from sqlalchemy import exists, select

# 查有文章的用户（用 EXISTS）
# 定义变量 stmt，赋值为 select(User).where(exists().where(Post.user_id == User.id))
stmt = select(User).where(
    exists().where(Post.user_id == User.id)
)

# 等价的 NOT EXISTS：没有文章的用户
# 定义变量 stmt2，赋值为 select(User).where(~exists().where(Post.user_id == User.id))
stmt2 = select(User).where(
    ~exists().where(Post.user_id == User.id)
)
\`\`\`

## 原生 SQL（text()）

复杂查询 ORM 写起来别扭时，直接用原生 SQL。

\`\`\`python
# 从 sqlalchemy 导入 text
from sqlalchemy import text

# 执行原生 SQL
# 定义变量 sql，赋值为 text("SELECT id, name, age FROM users WHERE age > :min_age")
sql = text("SELECT id, name, age FROM users WHERE age > :min_age")
# 定义变量 result，赋值为 session.execute(sql, {"min_age": 18})
result = session.execute(sql, {"min_age": 18})   # 用命名参数防注入
# 循环：for row in result
for row in result:
    # 打印
    print(row.name, row.age)

# 原生 SQL 映射到模型
# 定义变量 sql2，赋值为 text("SELECT * FROM users WHERE active = true")
sql2 = text("SELECT * FROM users WHERE active = true")
# 定义变量 users，赋值为 session.scalars(sql2).all()
users = session.scalars(sql2).all()   # 返回 User 对象

# 复杂报表：直接 SQL 更清晰
# 定义变量 report_sql，赋值为 text("""
report_sql = text("""
    SELECT
        u.name,
        COUNT(p.id) as post_count,
        SUM(p.view_count) as total_views
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    GROUP BY u.id, u.name
    HAVING COUNT(p.id) > :min_posts
    ORDER BY total_views DESC
""")
# 定义变量 rows，赋值为 session.execute(report_sql, {"min_posts": 5}).all()
rows = session.execute(report_sql, {"min_posts": 5}).all()
\`\`\`

### text() 的安全要点

\`\`\`python
# ✅ 安全：用命名参数
# 定义变量 sql，赋值为 text("SELECT * FROM users WHERE name = :name")
sql = text("SELECT * FROM users WHERE name = :name")
# 调用 session.execute()，传参数
session.execute(sql, {"name": username})

# ❌ 危险：用 f-string 拼接（会被注入！）
# sql = text(f"SELECT * FROM users WHERE name = '{username}'")  # 千万别这样
\`\`\`

## 综合示例：博客后台查询

\`\`\`python
# 从 sqlalchemy 导入 select, func, desc, and_, or_
from sqlalchemy import select, func, desc, and_, or_
# 从 sqlalchemy.orm 导入 Session, selectinload, joinedload
from sqlalchemy.orm import Session, selectinload, joinedload

# 定义函数 get_dashboard_stats，参数: session
def get_dashboard_stats(session: Session):
    """后台首页统计：用户数、文章数、总浏览量"""
    # 定义变量 user_count，赋值为 session.scalar(select(func.count(User.id)))
    user_count = session.scalar(select(func.count(User.id)))
    # 定义变量 post_count，赋值为 session.scalar(select(func.count(Post.id)))
    post_count = session.scalar(select(func.count(Post.id)))
    # 定义变量 total_views，赋值为 session.scalar(select(func.sum(Post.view_count)))
    total_views = session.scalar(select(func.sum(Post.view_count)))
    # 返回字典
    return {"users": user_count, "posts": post_count, "views": total_views or 0}

# 定义函数 get_top_authors，参数: session, limit=10
def get_top_authors(session: Session, limit: int = 10):
    """发文最多的作者榜"""
    # 定义变量 stmt，赋值为 select()
    stmt = select(
        User.name,
        func.count(Post.id).label("post_count"),
        func.sum(Post.view_count).label("total_views"),
    ).join(User.posts).group_by(User.id).order_by(desc("post_count")).limit(limit)
    # 返回 session.execute(stmt).all()
    return session.execute(stmt).all()

# 定义函数 search_posts，参数: session, keyword, page=1, per_page=20
def search_posts(session: Session, keyword: str, page: int = 1, per_page: int = 20):
    """搜索文章（标题或内容含关键词）"""
    # 定义变量 stmt，赋值为 select(Post).options(joinedload(Post.author))
    stmt = select(Post).options(joinedload(Post.author)).where(
        or_(
            Post.title.ilike(f"%{keyword}%"),
            Post.content.ilike(f"%{keyword}%"),
        )
    ).order_by(desc(Post.created_at))
    # 定义变量 offset，赋值为 (page - 1) * per_page
    offset = (page - 1) * per_page
    # 返回 session.scalars(stmt.offset(offset).limit(per_page)).unique().all()
    return session.scalars(stmt.offset(offset).limit(per_page)).unique().all()
\`\`\`

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 用 == None | User.bio == None | User.bio.is_(None) |
| N+1 查询 | 循环访问关系属性 | 用 selectinload/joinedload |
| 忘 .unique() | joinedload 一对多重复行 | 一对多 join 后加 .unique() |
| where vs having 混 | where 用聚合函数 | 聚合过滤用 having |
| 拼接 SQL | text(f"...{x}...") | text 用命名参数 |
| count 返回 None | 空表 count 返回 None | 用 \`total or 0\` |

## 小结

| 概念 | 一句话 |
|------|--------|
| select() | 2.0 查询入口，链式配置 |
| scalars() | 取对象，execute() 取 Row |
| where/filter_by | 过滤，多条件默认 AND |
| 运算符 | like/ilike/in_/between/is_ |
| order_by + limit/offset | 排序分页 |
| func.count/sum/avg | 聚合 |
| group_by + having | 分组过滤 |
| join/outerjoin | 连接查询 |
| text() | 原生 SQL，必用参数化 |

下一章我们学 Alembic，让数据库结构变更可版本化、可回滚。`
  },

  // ============================================================
  // 第 7 章：Alembic 数据库迁移
  // ============================================================
  {
    id: "pyweb2-alembic",
    group: "ORM 与 SQLAlchemy",
    icon: "📜",
    title: "Alembic 数据库迁移",
    content: `# Alembic 数据库迁移

## 为什么需要迁移（版本控制数据库结构）

代码有 Git 做版本控制，数据库结构（schema）也需要。原因：

1. **结构会变**：项目演进，加表、加列、改类型是常态。直接改库会丢数据、会出错。
2. **多环境同步**：开发、测试、生产环境的库结构要一致。手动改容易漏。
3. **可回滚**：上线后发现结构改错了，要能回退到上一版。
4. **团队协作**：同事加了个字段，你 pull 代码后要能一键把库结构更新。
5. **可审计**：谁在什么时候改了什么结构，有记录。

**Alembic** 是 SQLAlchemy 官方的迁移工具，相当于「数据库结构的 Git」。它生成迁移脚本，每个脚本是一次结构变更，可以前进（upgrade）和后退（downgrade）。

### 不用迁移工具的痛苦

\`\`\`text
场景：开发加了 email 列，上线要手动执行
1. SSH 到生产服务器
2. mysql -u root -p
3. ALTER TABLE users ADD COLUMN email VARCHAR(120);
4. 完了，忘了测试环境也要加
5. 同事 pull 代码，运行报错：unknown column email
6. 同事问你：你改了啥？你说：加了个 email。同事：怎么加？
\`\`\`

用 Alembic 后：

\`\`\`text
1. alembic revision --autogenerate -m "add email to users"
2. alembic upgrade head   # 一键应用到任何环境
3. 同事 pull 代码后 alembic upgrade head 就同步了
4. 出错 alembic downgrade -1 一键回滚
\`\`\`

## Alembic 初始化（alembic init / alembic.ini）

### 安装

\`\`\`bash
# 安装 alembic
# pip install alembic
pip install alembic
\`\`\`

### 初始化

\`\`\`bash
# 在项目根目录执行
# alembic init migrations
alembic init migrations
# 这会创建：
# alembic.ini          - 配置文件
# migrations/          - 迁移目录
#   env.py             - 迁移环境配置（核心）
#   script.py.mako     - 迁移脚本模板
#   versions/          - 迁移版本文件存放处
\`\`\`

### 目录结构

\`\`\`text
myapp/
├── alembic.ini          # Alembic 配置
├── migrations/          # 迁移目录（名字可改）
│   ├── env.py           # 迁移环境，配置 target_metadata 等
│   ├── script.py.mako   # 模板
│   └── versions/        # 每次迁移生成的脚本在这
│       ├── 001_add_users.py
│       └── 002_add_posts.py
└── app/
    └── models.py        # 你的模型定义
\`\`\`

### alembic.ini 关键配置

\`\`\`ini
# alembic.ini 是 INI 格式

[alembic]
# 数据库连接字符串（生产环境建议从环境变量读，别写死在 ini 里）
sqlalchemy.url = postgresql+psycopg2://user:pass@localhost/myapp

# 迁移脚本目录
script_location = migrations

# 模板（默认 generic）
# template = generic
\`\`\`

**安全实践**：不要把数据库密码写进 alembic.ini 提交到 Git！应该从环境变量读：

\`\`\`ini
# alembic.ini 留空或占位
sqlalchemy.url = driver://user:pass@localhost/dbname
\`\`\`

\`\`\`python
# env.py 里覆盖，从环境变量读
# 导入 os
import os
# 定义变量 database_url，赋值为 os.getenv("DATABASE_URL")
database_url = os.getenv("DATABASE_URL", "sqlite:///dev.db")
# config.set_main_option("sqlalchemy.url", database_url)
config.set_main_option("sqlalchemy.url", database_url)
\`\`\`

## 配置 autogenerate（target_metadata）

autogenerate 是 Alembic 最爽的功能：它对比「模型定义」和「当前数据库」，自动生成迁移脚本。但要让 autogenerate 工作，必须在 \`env.py\` 里配置 \`target_metadata\`。

### 修改 env.py

\`\`\`python
# migrations/env.py 关键部分

# 导入 os, sys
import os
import sys
# 把项目根目录加到 path，这样能 import 你的模型
# sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# 从 sqlalchemy 导入 engine_from_config, pool
from sqlalchemy import engine_from_config, pool
# 从 alembic 导入 context
from alembic import context

# 导入你的 Base 和所有模型（关键！要让 Alembic 看到模型）
# from app.models import Base
from app.models import Base
# from app.models import User, Post, Comment  # 显式导入确保模型被加载
from app.models import User, Post, Comment

# 配置对象
# 定义变量 config，赋值为 context.config
config = context.config

# 从环境变量覆盖数据库 URL
# 定义变量 database_url，赋值为 os.getenv("DATABASE_URL")
database_url = os.getenv("DATABASE_URL", "sqlite:///dev.db")
# 调用 config.set_main_option()
config.set_main_option("sqlalchemy.url", database_url)

# 关键：把 Base.metadata 设为 target_metadata
# autogenerate 会对比这个 metadata 和数据库的差异
# 定义变量 target_metadata，赋值为 Base.metadata
target_metadata = Base.metadata

# 其他配置保持默认...
\`\`\`

### 注意：必须导入所有模型

\`\`\`python
# ❌ 错误：只导入 Base，模型没被加载，autogenerate 发现不了表
# from app.models import Base
# target_metadata = Base.metadata
# 此时 Base.metadata 是空的，因为模型类没被实例化

# ✅ 正确：导入 Base 同时导入所有模型
# from app.models import Base
# from app.models import User, Post, Comment  # 触发模型类定义
\`\`\`

技巧：在 \`app/models/__init__.py\` 里集中导入所有模型，env.py 只 import 这个包：

\`\`\`python
# app/models/__init__.py
# 从 .user 导入 User
from .user import User
# 从 .post 导入 Post
from .post import Post
# 从 .comment 导入 Comment
from .comment import Comment
# 这样 import app.models 就加载了所有模型
\`\`\`

\`\`\`python
# env.py
# 导入 app.models
import app.models  # 触发所有模型加载
# 从 app.models 导入 Base
from app.models import Base
# 定义变量 target_metadata，赋值为 Base.metadata
target_metadata = Base.metadata
\`\`\`

## 生成迁移脚本（alembic revision --autogenerate）

### autogenerate

\`\`\`bash
# 自动对比模型和数据库，生成迁移脚本
# alembic revision --autogenerate -m "add email to users"
alembic revision --autogenerate -m "add email to users"
# 会在 migrations/versions/ 生成一个 xxx_add_email_to_users.py 文件
# xxx 是一串哈希作为版本号
\`\`\`

**autogenerate 的工作原理**：
1. 读取你配置的 \`target_metadata\`（即模型定义的表结构）。
2. 连接数据库，读取当前实际表结构。
3. 对比两者差异，生成对应的 \`upgrade()\` 和 \`downgrade()\` 函数。

### autogenerate 能检测什么

| 变更类型 | 能自动检测 |
|----------|-----------|
| 新增表 | ✅ |
| 删除表 | ✅ |
| 新增列 | ✅ |
| 删除列 | ✅ |
| 改列类型 | ✅（部分） |
| 改 nullable | ✅ |
| 新增索引 | ✅ |
| 新增外键 | ✅ |
| 改列默认值 | ✅（部分） |
| 改约束名 | ❌ |
| 数据迁移 | ❌（要手写） |

**注意**：autogenerate 不是万能的，复杂的结构变更（如改约束、数据迁移）要手动编辑脚本。

## 应用与回滚（alembic upgrade / downgrade）

### 查看当前状态

\`\`\`bash
# 查看当前迁移到哪个版本
# alembic current
alembic current

# 查看所有迁移历史
# alembic history
alembic history
# 输出类似：
# xxx -> yyy (head), add posts table
# None -> xxx, add users table
\`\`\`

### 应用迁移（upgrade）

\`\`\`bash
# 应用所有未执行的迁移（到最新）
# alembic upgrade head
alembic upgrade head

# 应用到指定版本
# alembic upgrade abc123
alembic upgrade abc123

# 前进 N 步
# alembic upgrade +2
alembic upgrade +2
\`\`\`

### 回滚迁移（downgrade）

\`\`\`bash
# 回滚一步（撤销最近一次迁移）
# alembic downgrade -1
alembic downgrade -1

# 回滚到指定版本
# alembic downgrade abc123
alembic downgrade abc123

# 回滚到最初（撤销所有迁移）
# alembic downgrade base
alembic downgrade base
\`\`\`

**重要**：\`downgrade\` 依赖迁移脚本里的 \`downgrade()\` 函数。如果脚本没写好 downgrade，回滚会失败。所以生成迁移后要检查 downgrade 是否正确。

## 迁移脚本结构

生成的迁移脚本是一个 Python 文件，结构固定：

\`\`\`python
# migrations/versions/a1b2c3_add_email_to_users.py

# 从 alembic 导入 op
from alembic import op
# 从 sqlalchemy 导入 sa (类型和操作)
import sqlalchemy as sa

# revision 标识当前版本
# 定义变量 revision，赋值为 'a1b2c3'
revision = 'a1b2c3'
# down_revision 标识上一个版本（None 表示第一个迁移）
# 定义变量 down_revision，赋值为 'previous_revision_id'
down_revision = 'previous_revision_id'
# branch_labels 用于多分支迁移，一般不用
# 定义变量 branch_labels，赋值为 None
branch_labels = None
# depends_on 依赖的其他迁移，一般不用
# 定义变量 depends_on，赋值为 None
depends_on = None

# upgrade：前进时执行（alembic upgrade）
# 定义函数 upgrade，参数:
def upgrade():
    # op 是 Alembic 的操作 API，翻译成数据库 DDL
    # 给 users 表加 email 列
    # op.add_column('users', sa.Column('email', sa.String(120), nullable=True))
    op.add_column('users', sa.Column('email', sa.String(120), nullable=True))
    # 创建索引
    # op.create_index('ix_users_email', 'users', ['email'], unique=False)
    op.create_index('ix_users_email', 'users', ['email'], unique=False)

# downgrade：后退时执行（alembic downgrade）
# 定义函数 downgrade，参数:
def downgrade():
    # 删索引
    # op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_users_email', table_name='users')
    # 删列（要和 upgrade 完全相反的顺序）
    # op.drop_column('users', 'email')
    op.drop_column('users', 'email')
\`\`\`

### 常用 op 操作

\`\`\`python
# 创建表
# op.create_table('users', sa.Column('id', sa.Integer, primary_key=True), sa.Column('name', sa.String(50)))
op.create_table(
    'users',
    sa.Column('id', sa.Integer, primary_key=True),
    sa.Column('name', sa.String(50)),
)

# 删表
# op.drop_table('users')
op.drop_table('users')

# 加列
# op.add_column('users', sa.Column('email', sa.String(120)))
op.add_column('users', sa.Column('email', sa.String(120)))

# 删列
# op.drop_column('users', 'email')
op.drop_column('users', 'email')

# 改列类型（用 alter_column，不同数据库支持度不同）
# op.alter_column('users', 'age', existing_type=sa.Integer, type_=sa.Numeric(5, 2))
op.alter_column('users', 'age', existing_type=sa.Integer, type_=sa.Numeric(5, 2))

# 改列名
# op.alter_column('users', 'name', new_column_name='username')
op.alter_column('users', 'name', new_column_name='username')

# 创建索引
# op.create_index('idx_name', 'users', ['name'])
op.create_index('idx_name', 'users', ['name'])

# 删索引
# op.drop_index('idx_name', table_name='users')
op.drop_index('idx_name', table_name='users')

# 执行原生 SQL（数据迁移用）
# op.execute("UPDATE users SET active = 1")
op.execute("UPDATE users SET active = 1")
\`\`\`

## 数据迁移示例

结构迁移改表结构，数据迁移改数据。autogenerate 只做结构迁移，数据迁移要手写。

**场景**：给 users 表加 status 列，并根据现有 active 列填充初始值。

\`\`\`python
# migrations/versions/b2c3d4_add_status_to_users.py

# 从 alembic 导入 op
from alembic import op
# 从 sqlalchemy 导入 sa
import sqlalchemy as sa

# 定义变量 revision，赋值为 'b2c3d4'
revision = 'b2c3d4'
# 定义变量 down_revision，赋值为 'a1b2c3'
down_revision = 'a1b2c3'
# 定义变量 branch_labels，赋值为 None
branch_labels = None
# 定义变量 depends_on，赋值为 None
depends_on = None

# 定义函数 upgrade，参数:
def upgrade():
    # 步骤1：加列，允许 NULL（否则已有数据没法填）
    # op.add_column('users', sa.Column('status', sa.String(20), nullable=True))
    op.add_column('users', sa.Column('status', sa.String(20), nullable=True))

    # 步骤2：数据迁移，根据 active 列填充 status
    # active=True 的设为 'active'，active=False 的设为 'inactive'
    # op.execute("UPDATE users SET status = 'active' WHERE active = 1")
    op.execute("UPDATE users SET status = 'active' WHERE active = 1")
    # op.execute("UPDATE users SET status = 'inactive' WHERE active = 0")
    op.execute("UPDATE users SET status = 'inactive' WHERE active = 0")

    # 步骤3：把列改成 NOT NULL（数据已填满，可以加约束）
    # op.alter_column('users', 'status', nullable=False)
    op.alter_column('users', 'status', nullable=False)

    # 步骤4：删掉旧的 active 列（可选，看是否还需要）
    # op.drop_column('users', 'active')
    op.drop_column('users', 'active')

# 定义函数 downgrade，参数:
def downgrade():
    # 回滚：相反顺序，先加回 active 列
    # op.add_column('users', sa.Column('active', sa.Boolean(), nullable=True))
    op.add_column('users', sa.Column('active', sa.Boolean(), nullable=True))
    # 根据 status 填充 active
    # op.execute("UPDATE users SET active = 1 WHERE status = 'active'")
    op.execute("UPDATE users SET active = 1 WHERE status = 'active'")
    # op.execute("UPDATE users SET active = 0 WHERE status = 'inactive'")
    op.execute("UPDATE users SET active = 0 WHERE status = 'inactive'")
    # active 改 NOT NULL
    # op.alter_column('users', 'active', nullable=False)
    op.alter_column('users', 'active', nullable=False)
    # 删 status 列
    # op.drop_column('users', 'status')
    op.drop_column('users', 'status')
\`\`\`

**数据迁移的要点**：
1. 先加可空列，再填数据，再加 NOT NULL 约束（三步走）。
2. 数据迁移用 \`op.execute()\` 写原生 SQL，简单直接。
3. downgrade 也要写数据回滚，否则回滚后数据丢失。

## 迁移最佳实践（小步迁移、数据迁移、测试）

### 1. 小步迁移

每次迁移只做一件小事，别把一堆改动塞一个迁移里。

\`\`\`text
✅ 好：3 个迁移，每个加一张表
❌ 坏：1 个迁移加了 3 张表 + 改了 5 列 + 建了 2 个索引
\`\`\`

小步迁移的好处：
- 出问题容易定位是哪步。
- 回滚可以只回滚有问题的那步。
- 代码审查更清晰。

### 2. 先 review 再执行

autogenerate 生成的脚本**必须人工检查**，常见问题：
- 把删除表/列也生成了（你可能只是改了模型，不想删库）。
- downgrade 写得不完整。
- 改列类型的迁移在某些数据库不支持。

\`\`\`bash
# 生成后先看脚本内容
# cat migrations/versions/xxx_add_email.py
cat migrations/versions/xxx_add_email.py
# 检查 upgrade 和 downgrade 都合理
# 确认无误再 alembic upgrade head
\`\`\`

### 3. 测试迁移

迁移也要测试，特别是 downgrade：

\`\`\`bash
# 测试流程
# alembic upgrade head
alembic upgrade head
# alembic downgrade -1
alembic downgrade -1
# alembic upgrade head
alembic upgrade head
# 能来回切换不报错，说明迁移写对了
\`\`\`

### 4. 别改已提交的迁移

已提交（push 到 Git）的迁移脚本**不要改**，因为别人可能已经执行过。要改就新写一个迁移。

### 5. 数据迁移和结构迁移分开

复杂的数据迁移单独写一个迁移，和结构迁移分开。这样结构错了回滚结构，数据错了回滚数据，互不影响。

## 生产环境迁移策略

### 1. 备份

生产环境迁移前**必须备份**：

\`\`\`bash
# PostgreSQL 备份
# pg_dump myapp > backup_$(date +%Y%m%d).sql
pg_dump myapp > backup_$(date +%Y%m%d).sql

# MySQL 备份
# mysqldump -u root -p myapp > backup_$(date +%Y%m%d).sql
mysqldump -u root -p myapp > backup_$(date +%Y%m%d).sql
\`\`\`

### 2. 零停机迁移原则

加列、加索引不影响线上服务；删列、改列类型可能锁表。

**危险操作及对策**：

| 操作 | 风险 | 对策 |
|------|------|------|
| 加列（可空） | 低 | 直接加 |
| 加列（NOT NULL） | 高（锁表填默认值） | 先加可空，填数据，再改 NOT NULL |
| 加索引 | 中（锁表建索引） | 用 CREATE INDEX CONCURRENTLY（PG） |
| 删列 | 高（依赖此列的代码报错） | 先发版停用此列，再删 |
| 改列类型 | 高（锁表重写） | 加新列，双写，迁移，删旧列 |

**加索引的零停机技巧（PostgreSQL）**：

\`\`\`python
# 普通加索引会锁表
# op.create_index('idx_name', 'users', ['name'])

# 零停机加索引（PostgreSQL 的 CONCURRENTLY）
# 在迁移脚本里手动写
# op.execute("CREATE INDEX CONCURRENTLY idx_name ON users (name)")
op.execute("CREATE INDEX CONCURRENTLY idx_name ON users (name)")
# 注意：CONCURRENTLY 不能在事务里，env.py 要配 transaction_per_migration=True
\`\`\`

### 3. 灰度发布

大表结构变更先在从库测试，确认不锁表、不卡，再上主库。

### 4. 迁移和代码发布顺序

\`\`\`text
向后兼容的流程：
1. 先发迁移（加列、加表）—— 老代码不认识新列，但不报错
2. 再发新代码 —— 用上新列
3. 过一段时间，发迁移删旧列

❌ 错误顺序：先发代码（用新列）再发迁移（加列）—— 代码报错 unknown column
\`\`\`

## 自动化：在代码里执行迁移

除了命令行，也可以在 Python 代码里执行迁移（如应用启动时）：

\`\`\`python
# 从 alembic.config 导入 Config
from alembic.config import Config
# 从 alembic 导入 command
from alembic import command

# 定义函数 run_migrations，参数: database_url
def run_migrations(database_url: str):
    """在代码里执行迁移（如应用启动时）"""
    # 创建 Alembic 配置
    # 定义变量 alembic_cfg，赋值为 Config("alembic.ini")
    alembic_cfg = Config("alembic.ini")
    # 设置数据库 URL
    # alembic_cfg.set_main_option("sqlalchemy.url", database_url)
    alembic_cfg.set_main_option("sqlalchemy.url", database_url)
    # 执行到最新版本
    # command.upgrade(alembic_cfg, "head")
    command.upgrade(alembic_cfg, "head")

# 应用启动时调用
# run_migrations(os.getenv("DATABASE_URL"))
run_migrations(os.getenv("DATABASE_URL"))
\`\`\`

**注意**：生产环境不推荐应用启动时自动迁移，因为多实例同时启动会冲突。应该用独立的部署步骤手动执行迁移。

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 忘配 target_metadata | autogenerate 生成空脚本 | env.py 设 target_metadata |
| 忘导入模型 | Base.metadata 是空的 | 显式 import 所有模型 |
| 改已提交迁移 | 改了别人执行过的脚本 | 新写一个迁移 |
| 不检查 downgrade | 回滚失败 | 生成后检查 downgrade |
| NOT NULL 直接加 | 锁表填值，卡住 | 三步走：可空→填数据→NOT NULL |
| 密码写 ini 提交 | 泄露数据库密码 | 从环境变量读 |
| 生产不备份 | 迁移失败没法恢复 | 迁移前 pg_dump/mysqldump |
| 删列不先发版 | 依赖此列的代码报错 | 先发版停用，再删列 |

## 小结

| 概念 | 一句话 |
|------|--------|
| Alembic | 数据库结构的版本控制工具 |
| autogenerate | 对比模型和库自动生成迁移脚本 |
| upgrade / downgrade | 前进和回滚迁移 |
| target_metadata | env.py 里告诉 Alembic 模型结构 |
| op | 迁移脚本里的操作 API |
| 数据迁移 | 用 op.execute 手写 SQL 改数据 |
| 零停机 | 加列可空→填数据→改 NOT NULL |

---

至此，ORM 与 SQLAlchemy 专题结束。你已经掌握了从概念到 Core、ORM 模型、Session 事务、关系映射、查询聚合、数据库迁移的完整知识链。下一批章节我们将进入 FastAPI 核心，用这些 ORM 知识搭建真正的 Web 后端。`
  },

  // ============================================================
  // 第 4 批章节结束
  // ============================================================
];
