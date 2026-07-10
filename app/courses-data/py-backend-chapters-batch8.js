// =============================================================
// Python后端面试指南 - 第8批章节（ORM框架深度）
// =============================================================

export const chapters = [
  {
    id: "pyb-8-1",
    group: "ORM框架深度",
    icon: "🏗️",
    title: "ORM原理与概念 - 对象关系映射、Active Record vs Data Mapper、ORM优缺点、N+1查询问题",
    content: `

# ORM原理与概念

## 一、什么是ORM

ORM（Object-Relational Mapping，对象关系映射）是一种程序设计技术，用于实现面向对象编程语言中对象与关系数据库之间数据的自动转换。

### 核心思想
将数据库表中的记录映射为程序中的对象，开发者操作对象就像操作普通的Python类实例，由ORM负责生成SQL语句、处理参数绑定、结果集转换等。

\`\`\`python
# 原生SQL操作
import sqlite3
conn = sqlite3.connect('test.db')
cursor = conn.cursor()
cursor.execute("SELECT id, name, email FROM users WHERE id = ?", (1,))
user = cursor.fetchone()
# user是元组：(1, '张三', 'z@e.com')

# ORM操作（SQLAlchemy示例）
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User

engine = create_engine('sqlite:///test.db')
Session = sessionmaker(bind=engine)
session = Session()

user = session.query(User).get(1)
# user是User对象，可以用user.name, user.email访问属性
\`\`\`

### ORM映射关系

| 面向对象概念 | 关系数据库概念 |
|------------|-------------|
| 类（Class） | 表（Table） |
| 对象/实例（Object） | 记录/行（Row） |
| 属性（Attribute） | 字段/列（Column） |
| 类之间的关系（关联/继承） | 表之间的关系（外键） |

## 二、两种主要ORM模式

### Active Record模式

**特点**：一个模型类对应一张表，模型实例对应一行记录，模型本身包含CRUD方法和数据访问逻辑。

**代表框架**：Django ORM、Ruby on Rails Active Record、SQLAlchemy的declarative（简化使用）

\`\`\`python
# Django ORM（Active Record风格）
class User(models.Model):
    name = models.CharField(max_length=50)
    email = models.EmailField()

# 直接在模型类上调用查询方法
user = User.objects.get(id=1)  # 查询
user.name = "新名字"
user.save()  # 保存
User.objects.filter(age__gt=18).delete()  # 批量删除
\`\`\`

**优点**：
1. 简单直观，入门快
2. 模型自带CRUD，代码量少
3. 适合快速开发

**缺点**：
1. 模型类职责过重（既承载数据又负责持久化）
2. 复杂查询时灵活性受限
3. 业务逻辑和数据访问耦合较紧

### Data Mapper模式

**特点**：使用独立的Mapper层负责对象与数据库之间的映射，模型类只关心业务逻辑，不知道数据库的存在。

**代表框架**：SQLAlchemy Core/经典映射、Hibernate（Java）、MyBatis（半自动）

\`\`\`python
# SQLAlchemy Core + Mapper（Data Mapper风格）
from sqlalchemy import Table, MetaData, Column, Integer, String, create_engine
from sqlalchemy.orm import mapper, sessionmaker

metadata = MetaData()

# 表定义（独立于模型）
user_table = Table('user', metadata,
    Column('id', Integer, primary_key=True),
    Column('name', String(50)),
    Column('email', String(100))
)

# 纯业务对象，不继承任何基类
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email
    
    def send_email(self, content):
        # 业务方法
        print(f"发送邮件给{self.name}: {content}")

# Mapper层负责映射
mapper(User, user_table)

# 使用session操作（由mapper桥接）
engine = create_engine('sqlite:///test.db')
Session = sessionmaker(bind=engine)
session = Session()

user = User("张三", "z@e.com")
session.add(user)  # Mapper负责生成INSERT
session.commit()
\`\`\`

**优点**：
1. **单一职责**：模型专注业务，Mapper负责持久化
2. **灵活**：复杂查询、自定义SQL更方便
3. **可测试性好**：业务对象不依赖数据库，单元测试方便

**缺点**：
1. 学习曲线陡峭
2. 代码量大，需要分别定义表、类、映射
3. 简单CRUD场景不如Active Record便捷

### 两种模式对比

| 对比项 | Active Record | Data Mapper |
|-------|--------------|------------|
| 代表 | Django ORM | SQLAlchemy经典映射 |
| 模型职责 | 数据+持久化 | 仅数据/业务 |
| 入门难度 | 简单 | 较难 |
| 灵活性 | 中等 | 高 |
| 适合场景 | 简单CRUD、快速开发 | 复杂业务、企业级应用 |
| 耦合度 | 高（业务与DB耦合） | 低（解耦） |
| 代码量 | 少 | 多 |

## 三、ORM的优点

### 1. 提高开发效率
- 不需要手写重复的CRUD SQL
- 面向对象思维，符合开发者直觉
- 自动处理参数绑定、结果转换
- 数据库迁移工具（Alembic、Django migrations）

### 2. 数据库无关性
- 切换数据库只需改连接配置（MySQL→PostgreSQL→SQLite）
- ORM会生成对应数据库方言的SQL
- 不需要记忆不同数据库的语法差异

\`\`\`python
# SQLAlchemy切换数据库
# SQLite
engine = create_engine('sqlite:///app.db')
# MySQL
engine = create_engine('mysql+pymysql://root:password@localhost/db')
# PostgreSQL
engine = create_engine('postgresql://user:pass@localhost/db')
# 其他代码不需要改！
\`\`\`

### 3. 一定程度防止SQL注入
ORM使用参数化查询，自动处理特殊字符转义。

\`\`\`python
# ❌ 危险：字符串拼接SQL（SQL注入）
username = request.args.get('username')
sql = f"SELECT * FROM users WHERE username = '{username}'"
# 如果username传入 ' OR 1=1 -- 就会被注入

# ✅ 安全：ORM自动参数化
user = session.query(User).filter(User.username == username).first()
# 生成参数化查询：SELECT * FROM users WHERE username = ?
\`\`\`

### 4. 模型定义集中管理
字段类型、约束、关系都在模型中定义，一目了然。

\`\`\`python
class Order(Base):
    __tablename__ = 'orders'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), default='pending')
    create_time = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="orders")
\`\`\`

## 四、ORM的缺点与问题

### 1. 性能问题
ORM生成的SQL可能不是最优的，复杂查询性能不如手写优化过的SQL。

\`\`\`python
# ORM生成的SQL可能不够优化
session.query(User).filter(User.age > 18).all()
# 可能生成：SELECT * FROM users WHERE age > 18（应该只查需要的列）

# 优化：指定查询列
session.query(User.id, User.name).filter(User.age > 18).all()
\`\`\`

### 2. 学习成本
掌握ORM高级特性（关联查询、延迟加载、事件监听等）需要时间，而且不同ORM的API差异很大。

### 3. 复杂查询不灵活
多表关联、复杂聚合、窗口函数、特殊SQL语法用ORM写起来很别扭。

\`\`\`python
# 复杂统计用ORM写比较繁琐
# SQLAlchemy复杂示例
subq = session.query(
    Order.user_id,
    func.sum(Order.amount).label('total')
).group_by(Order.user_id).subquery()

result = session.query(
    User.name,
    subq.c.total
).outerjoin(subq, User.id == subq.c.user_id).all()

# 有时候直接写SQL更清晰
result = session.execute("""
    SELECT u.name, s.total
    FROM users u
    LEFT JOIN (SELECT user_id, SUM(amount) total FROM orders GROUP BY user_id) s
    ON u.id = s.user_id
""").fetchall()
\`\`\`

### 4. 黑盒效应
不了解ORM原理时很难排查性能问题，不知道背后执行了什么SQL。

## 五、N+1查询问题（经典ORM坑）

### 什么是N+1问题
查询列表时先查1次主表得到N条记录，然后遍历关联对象时触发N次额外查询，总共执行1+N次SQL。

\`\`\`python
# N+1问题示例（SQLAlchemy）
# 假设有User和Order，一对多关系

# 1次SQL：查询所有用户
users = session.query(User).all()

for user in users:
    # 每个用户访问orders时触发一次SQL！N个用户N次查询
    print(f"用户{user.name}有{len(user.orders)}个订单")

# 总SQL：1 + N次！如果有1000个用户就执行1001次SQL！
# SQL日志：
# SELECT * FROM users
# SELECT * FROM orders WHERE user_id = 1
# SELECT * FROM orders WHERE user_id = 2
# SELECT * FROM orders WHERE user_id = 3
# ...
\`\`\`

### 如何解决N+1问题

**方案1：JOIN加载（eager loading）**

SQLAlchemy使用\`joinedload\`，Django使用\`select_related\`：

\`\`\`python
# SQLAlchemy joinedload：用LEFT JOIN一次性查出所有数据
from sqlalchemy.orm import joinedload

users = session.query(User).options(
    joinedload(User.orders)
).all()

for user in users:
    print(f"用户{user.name}有{len(user.orders)}个订单")
# 只执行1次SQL！LEFT JOIN预加载
# SELECT users.*, orders.* FROM users LEFT JOIN orders ON ...
\`\`\`

\`\`\`python
# Django select_related
users = User.objects.select_related('profile').all()  # FK/O2O用select_related
for user in users:
    print(user.profile.bio)  # 不会再查数据库
\`\`\`

**方案2：分两次查询（in查询）**

SQLAlchemy使用\`subqueryload\`，Django使用\`prefetch_related\`：

\`\`\`python
# SQLAlchemy subqueryload：两次查询，第二次用IN
from sqlalchemy.orm import subqueryload

users = session.query(User).options(
    subqueryload(User.orders)
).all()
# SQL:
# 1. SELECT * FROM users
# 2. SELECT * FROM orders WHERE user_id IN (1,2,3,...)
\`\`\`

\`\`\`python
# Django prefetch_related：用于多对多、反向外键
users = User.objects.prefetch_related('orders').all()
for user in users:
    for order in user.orders.all():  # 不会触发额外查询
        print(order.amount)
\`\`\`

### joinedload vs subqueryload对比

| 策略 | SQL次数 | JOIN | 适用场景 |
|-----|--------|------|---------|
| joinedload | 1次 | LEFT JOIN | 一对一、多对一；数据量不大 |
| subqueryload | 2次 | 无（用IN） | 一对多、多对多；数据量较大 |

\`\`\`python
# 多表预加载
users = session.query(User).options(
    joinedload(User.profile),      # 一对一用join
    subqueryload(User.orders)      # 一对多用subquery
).all()
\`\`\`

### 如何发现N+1问题
1. 开启SQL日志，看是否有重复的相似查询
2. Django Debug Toolbar显示查询次数
3. SQLAlchemy可以开启事件监听记录慢查询
4. 使用性能分析工具

\`\`\`python
# SQLAlchemy打印SQL（调试用）
import logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
# 运行时可以看到所有生成的SQL
\`\`\`

## 六、使用ORM的最佳实践

1. **了解生成的SQL**：开启SQL日志，知道ORM在做什么
2. **避免查询所有列**：不要用\`SELECT *\`，只查需要的字段
3. **解决N+1问题**：用joinedload/subqueryload或select_related/prefetch_related
4. **批量操作**：用bulk_insert/bulk_update而非循环单条操作
5. **复杂查询用原生SQL**：ORM不是万能的，复杂报表/统计直接写SQL更清晰
6. **合理使用缓存**：热点查询结果缓存到Redis
7. **分页查询**：大数据集一定分页，避免\`.all()\`加载全部
8. **事务管理**：正确使用事务，避免长事务

\`\`\`python
# 不好的做法：循环插入
for item in items:
    obj = Model(name=item['name'])
    session.add(obj)
session.commit()  # 还是会一条条INSERT

# 好的做法：批量插入
session.bulk_insert_mappings(Model, items)
session.commit()
\`\`\`

## 常见坑点
1. **N+1查询**：遍历关联对象忘记预加载，导致性能雪崩
2. **隐式延迟加载**：在模板或序列化中访问关联字段触发额外查询
3. **内存溢出**：\`.all()\`加载大量数据到内存
4. **循环中提交事务**：每次循环commit性能极差
5. **更新全表**：忘记filter导致\`UPDATE/DELETE\`作用于全表
6. **时区问题**：ORM的DateTime时区处理不当导致时间错乱
7. **会话泄漏**：Session没有正确关闭导致连接泄漏
`
  },
  {
    id: "pyb-8-2",
    group: "ORM框架深度",
    icon: "🏗️",
    title: "SQLAlchemy Core - SQL表达式语言、Table对象、select/insert/update/delete构建、引擎Engine与连接",
    content: `

# SQLAlchemy Core

SQLAlchemy分为两个核心部分：**Core**（SQL表达式语言）和**ORM**（对象关系映射）。Core是SQLAlchemy的基础，提供了schema定义、SQL生成、执行引擎等功能，ORM构建在Core之上。

## 一、Engine引擎与连接

### Engine是SQLAlchemy的核心
Engine负责连接数据库、管理连接池、执行SQL。它是数据库的入口，通过\`create_engine\`创建。

\`\`\`python
from sqlalchemy import create_engine

# 连接字符串格式：dialect+driver://user:password@host:port/dbname
# SQLite（文件）
engine = create_engine('sqlite:///example.db', echo=True)  # echo=True打印SQL

# SQLite（内存）
engine = create_engine('sqlite:///:memory:')

# MySQL
engine = create_engine('mysql+pymysql://root:password@localhost:3306/mydb?charset=utf8mb4')

# PostgreSQL
engine = create_engine('postgresql+psycopg2://user:pass@localhost/mydb')
\`\`\`

### 连接池配置
Engine默认使用连接池（SQLite内存除外），生产环境应合理配置：

\`\`\`python
engine = create_engine(
    'mysql+pymysql://root:password@localhost/mydb',
    pool_size=10,           # 连接池大小
    max_overflow=20,        # 最大溢出连接数
    pool_recycle=3600,      # 连接回收时间（秒），避免MySQL 8小时断开
    pool_pre_ping=True,     # 连接前检测，避免使用失效连接
    echo=False              # 生产关闭SQL日志
)
\`\`\`

### 获取连接执行SQL
Engine提供\`connect()\`方法获取连接：

\`\`\`python
from sqlalchemy import text

with engine.connect() as conn:
    # text()包装原生SQL
    result = conn.execute(text("SELECT * FROM users WHERE id = :id"), {"id": 1})
    
    # 获取单行
    user = result.fetchone()
    print(user)  # Row对象，可像元组或字典访问
    
    # 遍历结果
    result = conn.execute(text("SELECT id, name FROM users"))
    for row in result:
        print(f"id={row.id}, name={row.name}")
        # 或 row[0], row['name']
    
    # INSERT/UPDATE/DELETE需要显式commit（默认事务）
    conn.execute(
        text("INSERT INTO users (name, email) VALUES (:name, :email)"),
        {"name": "张三", "email": "z@e.com"}
    )
    conn.commit()  # 提交事务
\`\`\`

## 二、MetaData与Table定义

### MetaData
MetaData是表结构的容器，保存所有定义的Table对象。

\`\`\`python
from sqlalchemy import MetaData, Table, Column, Integer, String, Numeric, DateTime, ForeignKey
from datetime import datetime

metadata = MetaData()

# 定义表
users = Table('users', metadata,
    Column('id', Integer, primary_key=True, autoincrement=True),
    Column('name', String(50), nullable=False),
    Column('email', String(100), unique=True),
    Column('age', Integer),
    Column('create_time', DateTime, default=datetime.utcnow)
)

orders = Table('orders', metadata,
    Column('id', Integer, primary_key=True),
    Column('user_id', Integer, ForeignKey('users.id'), nullable=False),
    Column('amount', Numeric(10, 2), nullable=False),
    Column('status', String(20), default='pending')
)

# 创建所有表（生产通常用迁移工具，不用create_all）
metadata.create_all(engine)
\`\`\`

### 常用Column类型

| SQLAlchemy类型 | Python类型 | SQL类型 |
|---------------|-----------|---------|
| Integer | int | INT |
| SmallInteger | int | SMALLINT |
| BigInteger | int | BIGINT |
| Float | float | FLOAT/REAL |
| Numeric(precision, scale) | Decimal | DECIMAL/NUMERIC（金额用这个！） |
| String(length) | str | VARCHAR |
| Text | str | TEXT |
| Boolean | bool | BOOLEAN/TINYINT |
| Date | datetime.date | DATE |
| DateTime | datetime.datetime | DATETIME |
| Enum | str | ENUM |
| JSON | dict/list | JSON |

### Column常用约束

| 参数 | 说明 |
|-----|------|
| primary_key=True | 主键 |
| autoincrement=True | 自增 |
| nullable=False | 非空 |
| unique=True | 唯一约束 |
| default=value | 默认值（Python侧生成） |
| server_default=text("...") | 数据库侧默认值 |
| index=True | 创建索引 |
| ForeignKey('table.column') | 外键 |
| comment='注释' | 字段注释 |

## 三、SQL表达式语言

SQLAlchemy Core使用Python表达式构建SQL，无需拼接字符串。

### INSERT插入

\`\`\`python
# 单条插入
ins = users.insert().values(name="张三", email="z@e.com", age=25)
print(ins)  # 打印生成的SQL

with engine.connect() as conn:
    result = conn.execute(ins)
    print(f"插入ID: {result.inserted_primary_key[0]}")
    conn.commit()

# 批量插入
conn.execute(users.insert(), [
    {"name": "李四", "email": "l@e.com", "age": 30},
    {"name": "王五", "email": "w@e.com", "age": 28},
    {"name": "赵六", "email": "zl@e.com", "age": 35}
])
conn.commit()
\`\`\`

### SELECT查询

\`\`\`python
from sqlalchemy import select, and_, or_, func, desc

# 基础查询
query = select(users).where(users.c.age > 25)
print(query)  # SELECT * FROM users WHERE age > ?

result = conn.execute(query)
for row in result:
    print(row.name, row.age)

# 查询指定列
query = select(users.c.id, users.c.name, users.c.email)

# 条件查询
query = select(users).where(
    and_(
        users.c.age >= 20,
        users.c.age <= 30,
        users.c.name.like("张%")
    )
)
# 对应SQL：WHERE age >= ? AND age <= ? AND name LIKE ?

# OR条件
query = select(users).where(
    or_(users.c.age < 20, users.c.age > 60)
)

# IN/NOT IN
query = select(users).where(users.c.id.in_([1, 2, 3]))
query = select(users).where(users.c.id.notin_([4, 5]))

# IS NULL / IS NOT NULL
query = select(users).where(users.c.email.is_(None))
query = select(users).where(users.c.email.isnot(None))

# BETWEEN
query = select(users).where(users.c.age.between(20, 30))

# 排序
query = select(users).order_by(desc(users.c.age))  # 降序
query = select(users).order_by(users.c.age.desc(), users.c.name.asc())

# 分页
query = select(users).limit(10).offset(20)  # LIMIT 10 OFFSET 20（第3页）

# 去重
query = select(users.c.age).distinct()
\`\`\`

### 聚合函数

\`\`\`python
import select
# COUNT/SUM/AVG/MAX/MIN
query = select(
    func.count().label('total'),
    func.avg(users.c.age).label('avg_age'),
    func.max(users.c.age).label('max_age'),
    func.min(users.c.age).label('min_age')
).select_from(users)

result = conn.execute(query).first()
print(f"总人数: {result.total}, 平均年龄: {result.avg_age}")

# GROUP BY + HAVING
query = select(
    users.c.age,
    func.count().label('cnt')
).group_by(users.c.age).having(func.count() > 1)
\`\`\`

### JOIN关联查询

\`\`\`python
import select
# INNER JOIN
query = select(
    users.c.name,
    orders.c.amount,
    orders.c.status
).select_from(
    users.join(orders, users.c.id == orders.c.user_id)
)
# SELECT users.name, orders.amount ... FROM users INNER JOIN orders ON users.id = orders.user_id

# LEFT JOIN
query = select(users.c.name, orders.c.amount).select_from(
    users.outerjoin(orders, users.c.id == orders.c.user_id)
)

result = conn.execute(query)
for row in result:
    print(row.name, row.amount)  # 没有订单的用户amount为None
\`\`\`

### UPDATE更新

\`\`\`python
from sqlalchemy import update

# 更新单条
query = update(users).where(users.c.id == 1).values(name="新名字", age=26)
conn.execute(query)
conn.commit()

# 批量更新（条件更新）
query = update(users).where(users.c.age < 18).values(status="minor")

# 注意：没有where会更新全表！
# conn.execute(update(users).values(status="active"))  # 危险！更新所有记录
\`\`\`

### DELETE删除

\`\`\`python
from sqlalchemy import delete

# 删除指定记录
query = delete(users).where(users.c.id == 1)
conn.execute(query)
conn.commit()

# 注意：没有where会删除全表！
# conn.execute(delete(users))  # 危险！清空表

# 带条件删除
query = delete(users).where(users.c.create_time < "2020-01-01")
\`\`\`

## 四、事务管理

SQLAlchemy的connect()默认开启事务，需要显式commit：

\`\`\`python
# 手动事务
with engine.connect() as conn:
    trans = conn.begin()
    try:
        conn.execute(users.insert().values(name="测试", email="test@e.com"))
        conn.execute(orders.insert().values(user_id=1, amount=100))
        trans.commit()
    except:
        trans.rollback()
        raise

# 更简洁：begin()自动commit/rollback
with engine.begin() as conn:
    conn.execute(users.insert().values(name="测试2", email="test2@e.com"))
    # 退出with块时如果没有异常自动commit，有异常自动rollback
\`\`\`

## 五、Core vs ORM选择

| 场景 | 推荐使用 |
|-----|---------|
| 简单CRUD，快速开发 | ORM |
| 需要操作对象关系 | ORM |
| 复杂SQL、批量操作 | Core / 原生SQL |
| 数据导入导出、ETL | Core |
| 对性能极致要求 | Core / 原生SQL |
| 业务逻辑复杂 | ORM + Core/原生SQL混合 |

**混合使用是最佳实践**：日常CRUD用ORM，复杂查询、批量操作用Core或原生SQL。

## 常见坑点
1. **忘记commit**：Core默认事务，INSERT/UPDATE/DELETE必须commit
2. **全表更新/删除**：UPDATE/DELETE忘记加where条件
3. **echo=True生产环境开启**：打印大量SQL影响性能
4. **连接池耗尽**：没有正确释放连接，使用with语句管理连接
5. **Float存金额**：浮点数精度丢失，金额必须用Numeric/Decimal
`
  },
  {
    id: "pyb-8-3",
    group: "ORM框架深度",
    icon: "🏗️",
    title: "SQLAlchemy ORM基础 - declarative_base声明式映射、Session会话管理、CRUD操作、查询Query API",
    content: `

# SQLAlchemy ORM基础

SQLAlchemy ORM建立在Core之上，提供以面向对象方式操作数据库的能力。声明式映射（Declarative）是最常用的ORM使用方式。

## 一、声明式映射基础

### 创建基类与模型定义

\`\`\`python
from sqlalchemy import create_engine, Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

# 创建声明基类
Base = declarative_base()

# 定义模型类
class User(Base):
    __tablename__ = 'users'  # 表名
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True)
    age = Column(Integer)
    create_time = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}')>"

class Order(Base):
    __tablename__ = 'orders'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), default='pending')
    create_time = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", backref="orders")

# 创建引擎和表
engine = create_engine('sqlite:///orm_demo.db', echo=True)
Base.metadata.create_all(engine)
\`\`\`

### declarative_base做了什么
1. 创建一个DeclarativeMeta元类
2. 模型类继承Base时自动完成表映射
3. 根据类名和字段生成Table对象
4. 提供query属性用于查询

## 二、Session会话管理

Session是ORM与数据库交互的入口，负责管理对象状态、事务、连接。

### 创建Session工厂

\`\`\`python
# Session是工厂类，不是会话本身
Session = sessionmaker(bind=engine)

# 创建会话实例
session = Session()

# 或者在创建后绑定engine
Session = sessionmaker()
Session.configure(bind=engine)
session = Session()
\`\`\`

### Session的生命周期

\`\`\`python
# 正确的使用方式：with上下文管理器自动关闭
from contextlib import contextmanager

@contextmanager
def session_scope():
    session = Session()
    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()

# 使用
with session_scope() as session:
    user = User(name="张三", email="z@e.com")
    session.add(user)
    # with块结束时自动commit，异常时rollback
\`\`\`

### 对象的四种状态

| 状态 | 说明 | 触发场景 |
|-----|------|---------|
| Transient（临时） | 不在session中，数据库无记录 | User(name="张三")刚创建 |
| Pending（待持久） | add()后，还没flush | session.add(user) |
| Persistent（持久） | session中，数据库有记录 | flush/commit后或查询出来 |
| Detached（游离） | 不在session中，但数据库有记录 | session.close()/expunge()后 |

\`\`\`python
user = User(name="张三", email="z@e.com")  # Transient
print(session.is_modified(user))  # False (还没加入session)

session.add(user)  # Pending
print(session.new)  # IdentitySet([<User ...>])

session.flush()  # Persistent（发送INSERT但不提交）
print(user.id)  # 可以获取自增ID了

session.commit()  # 提交事务，还是Persistent

session.close()  # Detached
print(user.name)  # 还能访问属性（属性已加载）
# session.refresh(user)  # 这会报错，因为session已关闭
\`\`\`

## 三、CRUD操作

### Create创建

\`\`\`python
# 单条添加
user = User(name="张三", email="z@e.com", age=25)
session.add(user)
session.flush()  # 可选，提前生成ID
print(user.id)  # flush后就能拿到ID

# 批量添加
session.add_all([
    User(name="李四", email="l@e.com", age=30),
    User(name="王五", email="w@e.com", age=28),
    User(name="赵六", email="zl@e.com", age=35)
])

session.commit()
\`\`\`

### Read查询

\`\`\`python
# 按主键查询
user = session.query(User).get(1)  # 主键为1
user = session.query(User).get({"id": 1})  # 复合主键用字典

# 查询所有
users = session.query(User).all()

# 查询第一条
user = session.query(User).first()

# 条件查询 - filter_by（关键字参数，简单条件）
user = session.query(User).filter_by(name="张三").first()
users = session.query(User).filter_by(age=25, status="active").all()

# 条件查询 - filter（SQL表达式，更灵活）
users = session.query(User).filter(User.age > 25).all()
users = session.query(User).filter(User.name.like("张%")).all()
users = session.query(User).filter(User.age.in_([25, 30, 35])).all()
users = session.query(User).filter(User.email.isnot(None)).all()

# 多条件AND
users = session.query(User).filter(
    User.age >= 20,
    User.age <= 30
).all()
# 或
from sqlalchemy import and_, or_
users = session.query(User).filter(
    and_(User.age >= 20, User.name.like("张%"))
).all()

# OR条件
users = session.query(User).filter(
    or_(User.age < 20, User.age > 60)
).all()

# NOT
from sqlalchemy import not_
users = session.query(User).filter(
    not_(User.name.like("张%"))
).all()
\`\`\`

### Query API常用方法

\`\`\`python
# 指定查询列
result = session.query(User.name, User.email).all()
for name, email in result:
    print(name, email)

# 去重
ages = session.query(User.age).distinct().all()

# 排序
users = session.query(User).order_by(User.age.desc()).all()
users = session.query(User).order_by(User.age.asc(), User.name.desc()).all()

# 分页（LIMIT/OFFSET）
users = session.query(User).limit(10).offset(0).all()  # 第1页
users = session.query(User).limit(10).offset(10).all()  # 第2页

# 分页工具函数
def paginate(page, per_page=10):
    return session.query(User).limit(per_page).offset((page-1)*per_page).all()

# 计数
count = session.query(User).filter(User.age > 25).count()

# 是否存在
exists = session.query(User).filter_by(email="z@e.com").count() > 0
from sqlalchemy import exists
stmt = exists().where(User.email == "z@e.com")
exists_bool = session.query(stmt).scalar()

# 标量查询（单个值）
avg_age = session.query(func.avg(User.age)).scalar()
max_age = session.query(func.max(User.age)).scalar()
\`\`\`

### Update更新

\`\`\`python
# 方式1：修改对象属性，session自动跟踪变化
user = session.query(User).get(1)
user.name = "新名字"
user.age = 26
session.commit()  # 自动检测变化生成UPDATE

# 方式2：批量更新（不加载对象，直接UPDATE）
session.query(User).filter(User.age < 18).update({"status": "minor"})
session.query(User).filter(User.id == 1).update({"age": User.age + 1})
session.commit()

# 方式3：update支持同步更新到已加载对象
session.query(User).filter(User.age > 30).update(
    {"status": "senior"},
    synchronize_session='fetch'  # 或 'evaluate' / False
)
\`\`\`

### Delete删除

\`\`\`python
# 方式1：删除对象
user = session.query(User).get(1)
session.delete(user)
session.commit()

# 方式2：批量删除
session.query(User).filter(User.create_time < "2020-01-01").delete()
session.commit()

# ⚠️ 注意：没有filter就是删全表！
# session.query(User).delete()  # 清空表！
\`\`\`

## 四、aggregate聚合查询

\`\`\`python
from sqlalchemy import func

# 简单聚合
count = session.query(func.count(User.id)).scalar()
avg_age = session.query(func.avg(User.age)).scalar()
max_age = session.query(func.max(User.age)).scalar()
min_age = session.query(func.min(User.age)).scalar()
sum_age = session.query(func.sum(User.age)).scalar()

# 分组聚合
result = session.query(
    User.age,
    func.count(User.id).label('count')
).group_by(User.age).all()
for age, cnt in result:
    print(f"{age}岁有{cnt}人")

# GROUP BY + HAVING
result = session.query(
    User.age,
    func.count(User.id).label('count')
).group_by(User.age).having(func.count(User.id) > 1).all()

# 多字段分组
result = session.query(
    User.age,
    User.status,
    func.count(User.id).label('count')
).group_by(User.age, User.status).all()
\`\`\`

## 五、刷新与过期

\`\`\`python
# expire：标记对象属性过期，下次访问时重新从数据库加载
session.expire(user)
print(user.name)  # 触发SELECT重新加载

# refresh：立即重新加载所有属性
session.refresh(user)

# flush：将所有待处理的变更发送到数据库（INSERT/UPDATE/DELETE）但不提交
session.flush()

# commit()会自动先flush()
\`\`\`

## 最佳实践

1. **使用上下文管理器管理Session**：确保正确commit/rollback/close
2. **短会话原则**：一个请求一个会话，用完即关，不要长时间持有session
3. **批量操作用Core或bulk方法**：bulk_insert_mappings/bulk_update_mappings性能远好于循环add
4. **生产关闭echo**：echo=True仅用于开发调试
5. **用filter_by处理简单等值条件，filter处理复杂条件**
6. **始终指定limit**：查询列表时分页，避免.all()加载大量数据
7. **避免在循环中commit/flush**：批量操作最后一次性commit

\`\`\`python
# ❌ 不好：循环单条add+commit
for item in large_list:
    session.add(User(**item))
    session.commit()  # 每次都提交，性能极差

# ✅ 好：批量添加一次commit
session.add_all([User(**item) for item in large_list])
session.commit()

# ✅ 更好：用bulk_insert_mappings（绕过ORM状态跟踪，更快）
session.bulk_insert_mappings(User, large_list)
session.commit()
\`\`\`

## 常见坑点

1. **Session线程不安全**：多线程环境必须每个线程创建自己的session，不要共享session
2. **detached对象访问**：session关闭后访问未加载的属性会触发DetachedInstanceError
3. **意外的隐式查询**：在commit后访问对象属性可能触发额外查询
4. **update/delete全表**：忘记写filter条件
5. **long session内存泄漏**：长时间持有的session会缓存大量对象
6. **add后不flush直接拿id**：Transient/Pending状态id为None，需要flush后才能获取
7. **浮点类型存金额**：用Numeric/DECIMAL类型，不要用Float
`
  },
  {
    id: "pyb-8-4",
    group: "ORM框架深度",
    icon: "🏗️",
    title: "SQLAlchemy关系映射 - relationship/backref/ForeignKey、一对多/多对多/一对一关系、cascade级联操作、lazy参数",
    content: `

# SQLAlchemy关系映射

SQLAlchemy ORM最强大的特性之一是关系映射，可以通过对象属性直接访问关联数据，而不需要手写JOIN。

## 一、外键与关系定义

### ForeignKey外键约束

\`\`\`python
from sqlalchemy import Column, Integer, String, ForeignKey, Table, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    
    # backref在对方定义反向引用

class Order(Base):
    __tablename__ = 'orders'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    amount = Column(Numeric(10, 2))
    
    # 定义关系：Order对象可以通过order.user访问User对象
    user = relationship("User", backref="orders")

# 有了backref="orders"，User对象自动有orders属性
# user.orders可以访问该用户的所有订单
\`\`\`

### relationship常用参数

| 参数 | 说明 |
|-----|------|
| backref | 在反向模型上添加的属性名 |
| back_populates | 显式指定双向关系（新版推荐替代backref） |
| lazy | 加载策略：select/joined/subquery/dynamic/selectin/noload |
| cascade | 级联操作：save-update, merge, delete, delete-orphan等 |
| uselist | 多对一/一对一设为False（返回单个对象而非列表） |
| foreign_keys | 多个外键时指定使用哪个 |
| primaryjoin | 自定义连接条件 |
| order_by | 关联集合的排序方式 |

## 二、三种基础关系映射

### 1. 一对多（One-to-Many）- 最常用

一个用户有多个订单，一个订单属于一个用户。

\`\`\`python
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    
    # 一对多：一个用户多个订单
    orders = relationship("Order", back_populates="user")

class Order(Base):
    __tablename__ = 'orders'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    amount = Column(Numeric(10, 2))
    
    # 多对一：多个订单属于一个用户
    user = relationship("User", back_populates="orders")

# 使用
user = session.query(User).get(1)
print(user.orders)  # 该用户所有订单列表

order = session.query(Order).get(1)
print(order.user)  # 订单所属用户
\`\`\`

### 2. 多对多（Many-to-Many）

一个学生选多门课，一门课有多个学生。需要中间关联表。

\`\`\`python
# 中间关联表（不映射为模型，直接用Table）
student_course = Table('student_course', Base.metadata,
    Column('student_id', Integer, ForeignKey('students.id'), primary_key=True),
    Column('course_id', Integer, ForeignKey('courses.id'), primary_key=True)
)

class Student(Base):
    __tablename__ = 'students'
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    
    courses = relationship(
        "Course",
        secondary=student_course,  # 指定中间表
        back_populates="students"
    )

class Course(Base):
    __tablename__ = 'courses'
    id = Column(Integer, primary_key=True)
    title = Column(String(100))
    
    students = relationship(
        "Student",
        secondary=student_course,
        back_populates="courses"
    )

# 使用
student = session.query(Student).get(1)
print(student.courses)  # 该学生选的所有课程

course = session.query(Course).get(1)
print(course.students)  # 选这门课的所有学生

# 添加关联
math = Course(title="高等数学")
student.courses.append(math)
session.commit()

# 移除关联
student.courses.remove(math)
session.commit()
\`\`\`

### 3. 一对一（One-to-One）

一个用户有一个用户详情，一个详情属于一个用户。

\`\`\`python
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    
    profile = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False  # uselist=False表示一对一（返回单个对象，不是列表）
    )

class UserProfile(Base):
    __tablename__ = 'user_profiles'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True)  # unique=True保证一对一
    bio = Column(Text)
    avatar = Column(String(200))
    
    user = relationship("User", back_populates="profile")

# 使用
user = session.query(User).get(1)
print(user.profile)  # 用户详情对象（不是列表）
print(user.profile.bio)
\`\`\`

## 三、lazy加载策略详解

lazy参数控制关联对象的加载时机和方式，是影响ORM性能的关键配置。

| lazy值 | 加载时机 | SQL次数 | 适用场景 |
|-------|---------|--------|---------|
| 'select'（默认） | 首次访问时加载 | 1+N（容易N+1） | 偶尔访问关联数据 |
| 'joined' | JOIN预加载，查询主表时一起加载 | 1次LEFT JOIN | 每次都要访问关联数据；多对一 |
| 'subquery' | 第二次查询用IN加载 | 2次 | 一对多、多对多 |
| 'selectin' | SQLAlchemy 1.2+，类似subquery但用SELECT IN | 2次 | 一对多/多对多（推荐） |
| 'dynamic' | 返回AppenderQuery，不直接加载 | 访问时才查询 | 集合可能很大，需要追加过滤条件 |
| 'noload' | 不加载，返回None/空集合 | 0次 | 不需要关联数据时 |
| 'raise' | 访问时抛异常（防止意外lazy加载） | - | 调试N+1问题 |

\`\`\`python
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    
    # 默认lazy='select'：访问时才查
    orders = relationship("Order", back_populates="user", lazy='select')
    
    # lazy='joined'：总是JOIN加载
    profile = relationship("UserProfile", back_populates="user", lazy='joined', uselist=False)

# dynamic：返回可查询对象，支持进一步过滤
class Author(Base):
    __tablename__ = 'authors'
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    
    books = relationship("Book", back_populates="author", lazy='dynamic')

author = session.query(Author).get(1)
# books不是列表，是查询对象，可以追加过滤
recent_books = author.books.filter(Book.publish_time > "2024-01-01").all()
count = author.books.count()
\`\`\`

### 动态覆盖lazy策略

定义时用默认lazy，查询时可以用options临时指定加载策略：

\`\`\`python
from sqlalchemy.orm import joinedload, subqueryload, selectinload, lazyload

# 查询时临时指定用joinedload覆盖默认lazy
users = session.query(User).options(
    joinedload(User.orders)  # 这次查询用JOIN预加载orders
).all()

# 多级预加载
users = session.query(User).options(
    joinedload(User.profile),
    selectinload(User.orders).joinedload(Order.items)  # 嵌套预加载
).all()

# noload：这次不加载某个关联
users = session.query(User).options(
    noload(User.orders)
).all()
\`\`\`

## 四、cascade级联操作

cascade控制主对象操作时如何级联到关联对象。

### 常用cascade选项

| 选项 | 说明 |
|-----|------|
| save-update（默认开启） | session.add主对象时，自动add关联的临时对象 |
| merge | merge主对象时级联merge关联对象 |
| delete | 删除主对象时，删除关联的对象（注意与数据库外键ON DELETE的区别） |
| delete-orphan | 关联对象从集合移除时自动删除 |
| all | 包含save-update, merge, refresh-expire, expunge, delete |
| all, delete-orphan | 包含所有+delete-orphan（最常见的级联删除） |

\`\`\`python
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    
    # 删除用户时，级联删除其所有订单；订单从集合移除也删除
    orders = relationship(
        "Order",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    # 只是级联保存更新，不级联删除（默认行为等价于cascade="save-update, merge"）
    # orders = relationship("Order", back_populates="user")

# 级联保存：add用户时自动add其订单
user = User(name="张三")
user.orders.append(Order(amount=100))
user.orders.append(Order(amount=200))
session.add(user)  # 只add用户，订单也会被级联add
session.commit()

# 级联删除：删除用户时自动删除所有订单
user = session.query(User).get(1)
session.delete(user)
session.commit()  # 用户和其所有订单都被删除

# delete-orphan：从集合移除即删除
user.orders.remove(order)  # order会被自动删除
session.commit()
\`\`\`

⚠️ **注意**：ORM级联和数据库外键级联是两回事！SQLAlchemy的cascade是在Python层面发出额外的DELETE语句，数据库外键ON DELETE CASCADE是数据库层面执行。两者不要同时开，否则可能冲突。

## 五、自引用关系

表引用自身，如分类树、评论回复。

\`\`\`python
class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    parent_id = Column(Integer, ForeignKey('categories.id'))
    
    # 子分类：一对多
    children = relationship(
        "Category",
        back_populates="parent",
        lazy='joined'
    )
    
    # 父分类：多对一
    parent = relationship(
        "Category",
        back_populates="children",
        remote_side=[id]  # 指定"远程"端的列
    )

# 使用
root = Category(name="电子产品")
child1 = Category(name="手机")
child2 = Category(name="电脑")
root.children.append(child1)
root.children.append(child2)
session.add(root)
session.commit()

print(child1.parent.name)  # 电子产品
print(root.children)  # [手机, 电脑]
\`\`\`

## 六、关系查询

\`\`\`python
# 通过关系过滤（EXISTS/JOIN）
# 查询有订单的用户
users = session.query(User).filter(User.orders.any()).all()

# 查询有大于100元订单的用户
users = session.query(User).filter(
    User.orders.any(Order.amount > 100)
).all()

# 查询属于某个用户的订单
orders = session.query(Order).filter(
    Order.user.has(name="张三")
).all()

# JOIN查询
result = session.query(User, Order).join(Order).all()
for user, order in result:
    print(user.name, order.amount)

# 显式指定JOIN条件
result = session.query(User.name, Order.amount).join(
    Order, User.id == Order.user_id
).all()
\`\`\`

## 最佳实践

1. **双向关系用back_populates而非backref**：更显式，代码更易读
2. **多对一/一对一默认用lazy='joined'**，一对多/多对多用lazy='selectin'
3. **大集合用lazy='dynamic'**：可以追加过滤，避免加载全部
4. **cascade谨慎使用delete/delete-orphan**：防止误删数据
5. **数据库层面加外键约束**：即使ORM配置了关系，数据库也应加外键保证数据一致性
6. **查询时用options指定加载策略**：而不是依赖全局lazy配置，根据场景选择最优策略
7. **用any()/has()做关系过滤**：比手写join更简洁

## 常见坑点

1. **N+1查询**：默认lazy='select'遍历集合触发N+1，必须用options预加载
2. **循环引用问题**：模型互相import时用字符串类名而非直接引用（relationship("Order")）
3. **cascade配置错误导致误删**：delete-orphan只对"附属"对象使用（如订单明细属于订单）
4. **多对多中间表漏写primary_key**：两个外键都要设为primary_key形成复合主键
5. **自引用忘写remote_side**：自引用关系必须指定remote_side
6. **dynamic关系不能直接遍历**：.dynamic返回AppenderQuery，需要.all()才能拿到列表
7. **外键字段命名不一致**：外键列名和relationship名不要混淆
`
  },
  {
    id: "pyb-8-5",
    group: "ORM框架深度",
    icon: "🏗️",
    title: "SQLAlchemy高级查询 - 子查询、join查询、混合属性hybrid_property、column_property、查询事件监听",
    content: `

# SQLAlchemy高级查询

## 一、子查询（Subquery）

### 关联子查询与非关联子查询

\`\`\`python
from sqlalchemy import select, func

# 子查询：查询每个用户的订单总额
subq = select(
    Order.user_id,
    func.sum(Order.amount).label('total_amount'),
    func.count(Order.id).label('order_count')
).group_by(Order.user_id).subquery()

# 主查询关联子查询
result = session.query(
    User.name,
    subq.c.total_amount,
    subq.c.order_count
).outerjoin(subq, User.id == subq.c.user_id).all()

for name, total, count in result:
    print(f"{name}: 总额{total}, 订单数{count}")
\`\`\`

### 关联子查询（Correlated Subquery）

子查询引用外层查询的列：

\`\`\`python
import select
# 查询每个用户最新的订单
latest_order = select(Order.id).where(
    Order.user_id == User.id
).order_by(Order.create_time.desc()).limit(1).scalar_subquery()

result = session.query(
    User.name,
    Order.amount
).outerjoin(Order, Order.id == latest_order).all()
\`\`\`

### EXISTS子查询

\`\`\`python
from sqlalchemy import exists

# 查询有订单的用户
stmt = exists().where(Order.user_id == User.id)
users_with_orders = session.query(User).filter(stmt).all()

# 查询没有订单的用户
users_without_orders = session.query(User).filter(~stmt).all()
\`\`\`

## 二、JOIN查询深入

### 各种JOIN类型

\`\`\`python
# INNER JOIN（默认）
result = session.query(User, Order).join(Order).all()

# 指定JOIN条件
result = session.query(User, Order).join(
    Order, User.id == Order.user_id
).all()

# LEFT OUTER JOIN
result = session.query(User, Order).outerjoin(Order).all()

# 多个JOIN
result = session.query(User, Order, OrderItem).join(
    Order
).join(
    OrderItem, Order.id == OrderItem.order_id
).all()

# 从关系定义自动JOIN
result = session.query(User).join(User.orders).all()  # 自动通过外键JOIN

# 别名（自连接时必须）
from sqlalchemy.orm import aliased

Order1 = aliased(Order)
Order2 = aliased(Order)

result = session.query(User).join(
    Order1, User.orders
).filter(Order1.amount > 100).all()
\`\`\`

### contains_eager：加载已JOIN的数据

如果已经手写JOIN查询，用contains_eager告诉ORM这部分数据已经加载了，不要重复查询：

\`\`\`python
from sqlalchemy.orm import contains_eager

# 自己写JOIN，用contains_eager填充关系属性
result = session.query(User).join(
    User.orders
).options(
    contains_eager(User.orders)
).filter(Order.amount > 100).all()

# 每个user.orders已经包含数据，不会触发额外查询
for user in result:
    print(user.name, len(user.orders))
\`\`\`

## 三、窗口函数

\`\`\`python
from sqlalchemy import over

# ROW_NUMBER() 按用户分区，按金额排序
row_num = func.row_number().over(
    partition_by=Order.user_id,
    order_by=Order.amount.desc()
).label('rn')

result = session.query(
    User.name,
    Order.amount,
    row_num
).join(Order).all()

# RANK/DENSE_RANK
rank = func.rank().over(
    partition_by=Order.user_id,
    order_by=Order.amount.desc()
).label('rank')

# 取每个用户金额最高的订单（子查询+窗口函数）
subq = session.query(
    Order,
    func.row_number().over(
        partition_by=Order.user_id,
        order_by=Order.amount.desc()
    ).label('rn')
).subquery()

result = session.query(subq).filter(subq.c.rn == 1).all()
\`\`\`

## 四、混合属性 hybrid_property

hybrid_property是SQLAlchemy强大的特性，可以在Python对象层面和SQL表达式层面同时使用同一个"属性"。

\`\`\`python
from sqlalchemy.ext.hybrid import hybrid_property, hybrid_method

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    birth_year = Column(Integer)
    
    orders = relationship("Order", back_populates="user")
    
    # Python层面：拼接全名
    @hybrid_property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    # SQL层面：在SQL表达式中使用时的实现
    @full_name.expression
    def full_name(cls):
        return func.concat(cls.first_name, ' ', cls.last_name)
    
    # Python层面：计算年龄
    @hybrid_property
    def age(self):
        import datetime
        return datetime.date.today().year - self.birth_year
    
    # SQL层面：数据库计算年龄
    @age.expression
    def age(cls):
        import datetime
        return datetime.date.today().year - cls.birth_year
    
    # 混合方法
    @hybrid_method
    def is_adult(self, threshold=18):
        return self.age >= threshold
    
    @is_adult.expression
    def is_adult(cls, threshold=18):
        return cls.age >= threshold

# 使用
# 1. 实例访问（Python层面）
user = session.query(User).first()
print(user.full_name)  # 直接返回Python计算的值
print(user.age)        # Python计算的年龄
print(user.is_adult()) # True/False

# 2. 查询中使用（SQL层面）
users = session.query(User).filter(User.full_name.like("张%")).all()
adults = session.query(User).filter(User.age >= 18).all()
adults = session.query(User).filter(User.is_adult()).all()
adults = session.query(User).filter(User.is_adult(21)).all()  # 带参数
\`\`\`

### column_property：映射到SQL表达式的列

column_property是映射到SQL表达式（而非实际表列）的属性，查询时自动计算：

\`\`\`python
from sqlalchemy.orm import column_property

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    
    # 关联计数：每个用户的订单数（查询时自动用子查询计算）
    order_count = column_property(
        select(func.count(Order.id)).where(Order.user_id == id).scalar_subquery()
    )
    
    # 关联求和：订单总额
    total_amount = column_property(
        select(func.coalesce(func.sum(Order.amount), 0)).where(Order.user_id == id).scalar_subquery()
    )

# 查询时自动带出order_count和total_amount
users = session.query(User).all()
for user in users:
    print(f"{user.name}: {user.order_count}单, 总额{user.total_amount}")
\`\`\`

⚠️ 注意：column_property每次查询User都会带出子查询，如果只在某些场景需要，不要用column_property，应该在需要时显式查询。

## 五、事件监听

SQLAlchemy提供丰富的事件钩子，可以在模型生命周期、SQL执行、Session操作等节点插入自定义逻辑。

### 属性事件

\`\`\`python
from sqlalchemy import event

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    email = Column(String(100))

# 监听set事件：设置属性时触发
@event.listens_for(User.email, 'set')
def receive_set(target, value, oldvalue, initiator):
    print(f"email变更：{oldvalue} -> {value}")
    if value:
        target.email = value.lower()  # 自动转小写

user = User(name="张三")
user.email = "Z@E.COM"  # 触发事件，自动转为z@e.com
\`\`\`

### Session事件

\`\`\`python
from sqlalchemy.orm import Session

# before_flush：flush之前触发
@event.listens_for(Session, 'before_flush')
def before_flush(session, flush_context, instances):
    for obj in session.new:
        if isinstance(obj, User):
            print(f"新增用户: {obj.name}")
    for obj in session.dirty:
        print(f"更新对象: {obj}")
    for obj in session.deleted:
        print(f"删除对象: {obj}")

# after_commit：提交后触发
@event.listens_for(Session, 'after_commit')
def after_commit(session):
    print("事务已提交")

# after_rollback：回滚后触发
@event.listens_for(Session, 'after_rollback')
def after_rollback(session):
    print("事务已回滚")
\`\`\`

### Mapper事件（模型生命周期）

\`\`\`python
# before_insert：INSERT之前
@event.listens_for(User, 'before_insert')
def before_insert(mapper, connection, target):
    if not target.create_time:
        target.create_time = datetime.utcnow()

# after_insert：INSERT之后
@event.listens_for(User, 'after_insert')
def after_insert(mapper, connection, target):
    print(f"用户{target.id}已插入")

# before_update / after_update
@event.listens_for(User, 'before_update')
def before_update(mapper, connection, target):
    target.update_time = datetime.utcnow()

# before_delete / after_delete
@event.listens_for(User, 'before_delete')
def before_delete(mapper, connection, target):
    print(f"准备删除用户{target.id}")
\`\`\`

### 记录慢SQL（实用！）

\`\`\`python
from sqlalchemy.engine import Engine
import time
import logging

logging.basicConfig()
logger = logging.getLogger('sqlalchemy.slow')
logger.setLevel(logging.WARNING)

@event.listens_for(Engine, 'before_cursor_execute')
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    conn.info.setdefault('query_start_time', []).append(time.time())

@event.listens_for(Engine, 'after_cursor_execute')
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total = time.time() - conn.info['query_start_time'].pop()
    if total > 0.1:  # 超过100ms的慢查询
        logger.warning(f"慢查询({total:.3f}s): {statement}")
\`\`\`

## 六、Common Table Expressions (CTE)

\`\`\`python
# WITH RECURSIVE CTE查询树形结构
from sqlalchemy import literal_column

# 递归CTE查询分类树
cte = session.query(
    Category.id,
    Category.name,
    Category.parent_id,
    literal_column("0", type_=Integer).label('depth')
).filter(Category.parent_id.is_(None)).cte(name='category_cte', recursive=True)

alias = cte.alias()
cte = cte.union_all(
    session.query(
        Category.id,
        Category.name,
        Category.parent_id,
        (cte.c.depth + 1).label('depth')
    ).join(alias, Category.parent_id == alias.c.id)
)

result = session.query(cte).all()
for row in result:
    print(f"{'  '*row.depth}{row.name}")
\`\`\`

## 最佳实践

1. **复杂报表查询优先用Core或原生SQL**：ORM表达式写复杂统计可读性差
2. **hybrid_property封装计算逻辑**：统一Python和SQL层面的计算
3. **column_property不要滥用**：每次查询都会带出，只在频繁使用时添加
4. **事件监听用于审计和自动填充**：create_time/update_time适合用事件自动维护
5. **添加慢SQL监听**：开发/测试环境开启慢SQL日志及时发现性能问题
6. **contains_eager配合手写JOIN**：自定义JOIN时避免重复查询
7. **调试用echo=True或自定义事件记录SQL**

## 常见坑点

1. **hybrid_property在实例和查询行为不一致**：忘记写.expression版本导致过滤不生效
2. **column_property导致性能问题**：每个查询都额外带子查询
3. **事件中做复杂操作**：事件中抛出异常可能导致事务状态异常
4. **subquery() vs scalar_subquery()**：返回单列用scalar_subquery，多行多列用subquery
5. **别名使用错误**：自连接不用aliased会产生重复的表名
6. **recursive CTE忘设recursive=True**：递归CTE需要显式指定recursive
7. **事件监听器重复注册**：模块多次导入导致同一个事件绑定多次
`
  },
  {
    id: "pyb-8-6",
    group: "ORM框架深度",
    icon: "🏗️",
    title: "SQLAlchemy会话与事务 - Session生命周期、事务隔离级别、autoflush/autocommit、嵌套事务savepoint",
    content: `

# SQLAlchemy会话与事务

事务是数据库操作的核心，SQLAlchemy通过Session提供强大的事务管理能力。

## 一、Session生命周期深入

### Session的正确使用模式

\`\`\`python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager

engine = create_engine('sqlite:///test.db', echo=False)
Session = sessionmaker(bind=engine)

# Web应用中：每个请求一个session（推荐模式）
@contextmanager
def session_scope():
    """提供事务范围的Session"""
    session = Session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

# 使用示例
def create_user(name, email):
    with session_scope() as session:
        user = User(name=name, email=email)
        session.add(user)
        return user.id  # commit前flush后id可用
\`\`\`

### Session的关键配置参数

\`\`\`python
Session = sessionmaker(
    bind=engine,
    autoflush=True,      # 查询前自动flush（默认True）
    autocommit=False,    # 自动提交事务（默认False，推荐保持False）
    expire_on_commit=True,  # commit后过期所有对象（默认True）
    twophase=False       # 两阶段提交（跨数据库事务用）
)
\`\`\`

### autoflush详解

autoflush=True（默认）时，执行查询前会自动flush pending的变更：

\`\`\`python
session = Session()
user = User(name="新用户")
session.add(user)  # Pending状态，还没INSERT

# autoflush=True时，执行查询前自动flush
# 所以新用户会被INSERT，查询结果能查到
existing = session.query(User).filter_by(name="新用户").first()
print(existing is not None)  # True

# 如果autoflush=False
session2 = Session()
session2.autoflush = False
user2 = User(name="用户2")
session2.add(user2)
existing2 = session2.query(User).filter_by(name="用户2").first()
print(existing2 is None)  # True（因为没flush，数据库还没有）
session2.flush()  # 手动flush
existing2 = session2.query(User).filter_by(name="用户2").first()
print(existing2 is not None)  # True
\`\`\`

⚠️ **最佳实践**：保持autoflush=True，需要批量操作临时关闭时记得手动flush。

### expire_on_commit详解

commit后是否过期已加载的对象属性：

\`\`\`python
session = Session()
user = session.query(User).get(1)
print(user.name)  # 触发SELECT

session.commit()  # expire_on_commit=True（默认）：user所有属性标记为过期

# 下次访问属性时触发SELECT重新加载
print(user.name)  # 又查一次数据库！

# 如果不想过期重新加载
session2 = Session(expire_on_commit=False)
user2 = session2.query(User).get(1)
session2.commit()
print(user2.name)  # 直接用内存中的值，不查询数据库
\`\`\`

## 二、事务基础

### 事务ACID特性

| 特性 | 含义 |
|-----|------|
| 原子性（Atomicity） | 事务内操作要么全部成功，要么全部回滚 |
| 一致性（Consistency） | 事务前后数据满足完整性约束 |
| 隔离性（Isolation） | 并发事务之间互不干扰 |
| 持久性（Durability） | 事务提交后永久保存 |

### SQLAlchemy默认事务行为

SQLAlchemy默认行为：
1. 从连接池取出连接后立即BEGIN（隐式）
2. 需要写操作时才真正开始事务
3. session.commit()提交事务
4. 下一次操作自动开启新事务

\`\`\`python
session = Session()
try:
    # 这里开始隐式事务
    user = User(name="张三")
    session.add(user)
    order = Order(user_id=user.id, amount=100)
    session.add(order)
    
    session.commit()  # 提交
except:
    session.rollback()  # 回滚
    raise
finally:
    session.close()
\`\`\`

## 三、事务隔离级别

### 四种标准隔离级别

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 说明 |
|---------|-----|----------|-----|------|
| READ UNCOMMITTED | 可能 | 可能 | 可能 | 最低，几乎不用 |
| READ COMMITTED | 不可能 | 可能 | 可能 | Oracle/PostgreSQL默认 |
| REPEATABLE READ | 不可能 | 不可能 | 可能 | MySQL InnoDB默认 |
| SERIALIZABLE | 不可能 | 不可能 | 不可能 | 最高，性能差 |

### 设置隔离级别

\`\`\`python
from sqlalchemy import create_engine

# MySQL InnoDB默认REPEATABLE READ
engine = create_engine('mysql+pymysql://root:pass@localhost/db')

# 设置为READ COMMITTED
engine = create_engine(
    'mysql+pymysql://root:pass@localhost/db',
    isolation_level="READ COMMITTED"
)

# PostgreSQL
engine = create_engine(
    'postgresql://user:pass@localhost/db',
    isolation_level="AUTOCOMMIT"  # 或 READ COMMITTED 等
)

# SQLite只支持SERIALIZABLE
\`\`\`

### 隔离级别导致的问题

**1. 脏读（Dirty Read）**：一个事务读取了另一个未提交事务的数据。

**2. 不可重复读（Non-repeatable Read）**：同一事务内两次读取同一行，结果不同（被其他事务修改并提交）。

**3. 幻读（Phantom Read）**：同一事务内两次查询同一范围，行数不同（其他事务插入/删除了行）。

\`\`\`python
# MySQL InnoDB在REPEATABLE READ下通过MVCC防止不可重复读
# 演示：
# session1: 开始事务，SELECT id=1得到name='张三'
# session2: UPDATE users SET name='李四' WHERE id=1; COMMIT;
# session1: 再SELECT id=1还是得到name='张三'（快照读）
# session1 COMMIT后再查就是李四
\`\`\`

## 四、嵌套事务与Savepoint

### savepoint保存点

可以在事务中创建保存点，回滚到保存点而不回滚整个事务：

\`\`\`python
session = Session()
session.begin()

try:
    session.add(User(name="用户1"))
    session.flush()
    
    # 创建保存点
    savepoint = session.begin_nested()
    
    try:
        session.add(User(name="用户2"))
        raise Exception("出错了！")  # 模拟错误
        session.commit()
    except:
        # 回滚到保存点，"用户1"还在，"用户2"被回滚
        savepoint.rollback()
    
    # 继续操作，提交外层事务（只保存了"用户1"）
    session.add(User(name="用户3"))
    session.commit()
except:
    session.rollback()
\`\`\`

### begin_nested上下文管理器

\`\`\`python
session = Session()
session.begin()

session.add(User(name="用户1"))
session.flush()

# with begin_nested()自动处理保存点
with session.begin_nested():
    session.add(User(name="用户2"))
    # 如果这里抛出异常，自动回滚到保存点

session.add(User(name="用户3"))
session.commit()
\`\`\`

## 五、显式事务控制

### begin()显式开启事务

\`\`\`python
# 使用engine.begin()自动提交/回滚
with engine.begin() as conn:
    conn.execute(text("INSERT INTO users (name) VALUES ('张三')"))
    # with块结束自动commit，异常自动rollback

# 使用session.begin()
session = Session()
session.begin()
try:
    session.add(User(name="张三"))
    session.commit()
except:
    session.rollback()
    raise
\`\`\`

### 事务事件监听

\`\`\`python
from sqlalchemy import event
from sqlalchemy.orm import Session

@event.listens_for(Session, 'after_begin')
def after_begin(session, transaction, connection):
    print("事务开始")

@event.listens_for(Session, 'after_commit')
def after_commit(session):
    print("事务提交")

@event.listens_for(Session, 'after_rollback')
def after_rollback(session):
    print("事务回滚")
\`\`\`

## 六、autocommit模式（不推荐）

autocommit=True时，每次操作自动提交，没有隐式事务：

\`\`\`python
Session = sessionmaker(bind=engine, autocommit=True)
session = Session()

# autocommit模式下需要手动begin
session.begin()
try:
    user = User(name="张三")
    session.add(user)
    session.commit()
except:
    session.rollback()

# 或者
session.autocommit = True
user = User(name="李四")
session.add(user)
session.flush()  # autocommit下flush就提交了！
\`\`\`

⚠️ **强烈不建议使用autocommit=True**，默认False的显式事务更安全。

## 七、跨数据库事务（两阶段提交）

\`\`\`python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine1 = create_engine('mysql://db1')
engine2 = create_engine('postgresql://db2')

Session = sessionmaker(binds={
    User: engine1,
    Order: engine2
}, twophase=True)

session = Session()
session.begin()
try:
    user = User(name="张三")
    session.add(user)
    session.flush()
    
    order = Order(user_id=user.id, amount=100)
    session.add(order)
    
    session.commit()  # 两阶段提交
except:
    session.rollback()
\`\`\`

## 最佳实践

1. **一个请求一个Session，一个事务**：短会话，短事务
2. **始终使用上下文管理器或try/finally**：确保session正确关闭和事务处理
3. **保持autocommit=False（默认）**：显式事务更安全可控
4. **保持expire_on_commit=True（默认）**：防止读取到陈旧数据，除非有特殊性能考虑
5. **长事务拆分成小事务**：长事务占用连接、锁资源，影响并发
6. **批量操作分批提交**：每1000-5000条commit一次，避免事务过大
7. **只读事务用只读连接**：可以配置从库连接执行只读查询
8. **正确处理rollback**：异常发生时必须rollback，否则session状态异常

\`\`\`python
# ❌ 不好：超大事务一次性提交
session = Session()
for i in range(100000):
    session.add(User(name=f"用户{i}"))
session.commit()  # 可能导致锁等待、回滚段溢出

# ✅ 好：分批提交
BATCH_SIZE = 1000
session = Session()
try:
    for i in range(100000):
        session.add(User(name=f"用户{i}"))
        if i % BATCH_SIZE == 0:
            session.flush()
            session.commit()
            session.begin()
    session.commit()
except:
    session.rollback()
    raise
finally:
    session.close()
\`\`\`

## 常见坑点

1. **忘记rollback**：异常后session里的对象还在pending状态，后续操作混乱
2. **DetachedInstanceError**：session关闭后访问懒加载属性
3. **长事务导致锁等待**：事务中包含耗时的非数据库操作（如网络请求）
4. **autoflush=False导致查询不一致**：关闭autoflush后忘记手动flush
5. **expire_on_commit=False读取旧数据**：其他进程修改数据后当前session看不到
6. **嵌套事务使用不当**：begin_nested只有在支持SAVEPOINT的数据库才行
7. **跨session操作对象**：在一个session查询的对象，加到另一个session需要merge
8. **rollback后继续使用session**：rollback后session可以继续用，但pending的add都被回滚了
`
  },
  {
    id: "pyb-8-7",
    group: "ORM框架深度",
    icon: "🏗️",
    title: "Django ORM深度 - QuerySet惰性求值、annotate/aggregate、select_related/prefetch_related解决N+1、F/Q表达式",
    content: `

# Django ORM深度

Django ORM是典型的Active Record模式ORM，与Django框架深度集成，使用简单但功能强大。

## 一、Django模型基础回顾

\`\`\`python
# models.py
from django.db import models
from datetime import datetime

class User(models.Model):
    GENDER_CHOICES = (
        ('M', '男'),
        ('F', '女'),
    )
    
    name = models.CharField(max_length=50, verbose_name='姓名')
    email = models.EmailField(unique=True, verbose_name='邮箱')
    age = models.IntegerField(default=0, verbose_name='年龄')
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='M')
    is_active = models.BooleanField(default=True)
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = '用户'
        verbose_name_plural = verbose_name
        ordering = ['-create_time']
    
    def __str__(self):
        return self.name

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', '待支付'),
        ('paid', '已支付'),
        ('shipped', '已发货'),
        ('completed', '已完成'),
        ('cancelled', '已取消'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    order_no = models.CharField(max_length=32, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    create_time = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'orders'
\`\`\`

## 二、QuerySet惰性求值

### QuerySet是惰性的

Django的QuerySet不会立即访问数据库，只有真正需要数据时才执行查询：

\`\`\`python
# 以下操作都不执行数据库查询
queryset = User.objects.all()           # 不查询
queryset = queryset.filter(is_active=True)  # 不查询
queryset = queryset.filter(age__gte=18)     # 不查询
queryset = queryset.order_by('-create_time') # 不查询

# 真正执行查询的操作（触发数据库访问）：
# 1. 迭代
for user in queryset:
    print(user.name)  # 这里才执行SQL

# 2. 切片（带step时不惰性）
users = queryset[0:10]  # LIMIT 10，执行查询
user = queryset[0]      # 执行查询

# 3. repr/len/list
print(queryset)         # 执行查询打印
len(queryset)           # SELECT COUNT(*)
list(queryset)          # 执行查询转为列表

# 4. bool判断
if queryset:  # 执行查询判断是否存在
    pass

# 5. first()/last()/get()/exists()/count()
user = queryset.first()
exists = queryset.exists()
cnt = queryset.count()
\`\`\`

### QuerySet可以链式调用，组合条件

\`\`\`python
# 链式调用，最后才执行查询
active_adults = User.objects.filter(
    is_active=True,
    age__gte=18
).exclude(
    gender='M'
).order_by('-create_time')
# SELECT * FROM users WHERE is_active=True AND age >= 18 AND NOT gender='M' ORDER BY create_time DESC

# filter可以多次调用，相当于AND
queryset = User.objects.filter(is_active=True)
if min_age:
    queryset = queryset.filter(age__gte=min_age)
if gender:
    queryset = queryset.filter(gender=gender)
\`\`\`

## 三、常用字段查询（Field Lookups）

\`\`\`python
# 精确匹配
User.objects.get(id=1)
User.objects.filter(name__exact='张三')

# 不区分大小写匹配
User.objects.filter(name__iexact='zhang san')

# 包含/开头/结尾
User.objects.filter(name__contains='张')       # LIKE '%张%'
User.objects.filter(name__icontains='zhang')   # 不区分大小写
User.objects.filter(name__startswith='张')     # LIKE '张%'
User.objects.filter(name__endswith='三')       # LIKE '%三'

# 比较
User.objects.filter(age__gt=18)       # > 18
User.objects.filter(age__gte=18)      # >= 18
User.objects.filter(age__lt=60)       # < 60
User.objects.filter(age__lte=60)      # <= 60

# IN/BETWEEN
User.objects.filter(age__in=[20, 25, 30])     # IN (20,25,30)
User.objects.filter(age__range=(18, 30))      # BETWEEN 18 AND 30

# NULL判断
User.objects.filter(email__isnull=True)       # IS NULL

# 时间查询
from datetime import date
Order.objects.filter(create_time__date=date.today())
Order.objects.filter(create_time__year=2024)
Order.objects.filter(create_time__month=1)
Order.objects.filter(create_time__gt='2024-01-01')

# 反向关联查询：查询有订单的用户
User.objects.filter(orders__isnull=False)
User.objects.filter(orders__amount__gt=100)  # 有订单金额>100的用户
\`\`\`

## 四、aggregate与annotate

### aggregate：聚合计算（返回字典）

对整个QuerySet计算聚合值，不返回原始对象：

\`\`\`python
from django.db.models import Count, Sum, Avg, Max, Min, Q

# 整体统计
result = User.objects.aggregate(
    total=Count('id'),
    avg_age=Avg('age'),
    max_age=Max('age'),
    min_age=Min('age')
)
print(result)
# {'total': 100, 'avg_age': 28.5, 'max_age': 60, 'min_age': 18}

# 过滤后聚合
result = User.objects.filter(is_active=True).aggregate(
    active_count=Count('id'),
    active_avg_age=Avg('age')
)
\`\`\`

### annotate：分组聚合（给每个对象加聚合字段）

给QuerySet中每个对象添加聚合注释，类似SQL GROUP BY：

\`\`\`python
# 给每个用户注解订单数量和订单总额
users = User.objects.annotate(
    order_count=Count('orders'),
    total_amount=Sum('orders__amount')
)

for user in users:
    print(f"{user.name}: {user.order_count}单, 总额{user.total_amount}")

# annotate后可以过滤聚合结果（相当于HAVING）
users = User.objects.annotate(
    order_count=Count('orders')
).filter(order_count__gte=3)  # HAVING COUNT(*) >= 3

# values+annotate：按字段分组
from django.db.models import Count
result = User.objects.values('gender').annotate(
    count=Count('id'),
    avg_age=Avg('age')
)
# SELECT gender, COUNT(*) as count, AVG(age) FROM users GROUP BY gender
for row in result:
    print(f"{row['gender']}: {row['count']}人, 平均年龄{row['avg_age']}")

# 多字段分组
result = Order.objects.values('status', 'user__gender').annotate(
    count=Count('id'),
    total=Sum('amount')
)
\`\`\`

## 五、F表达式与Q表达式

### F表达式：引用字段值

F()让你在数据库层面引用模型字段值，不需要加载到Python：

\`\`\`python
from django.db.models import F

# 给所有用户年龄+1（不用先select再update）
User.objects.all().update(age=F('age') + 1)
# UPDATE users SET age = age + 1

# 比较两个字段
# 假设有Product模型有price和original_price
from django.db.models import F
Product.objects.filter(price__lt=F('original_price') * 0.5)

# 原子更新库存（防止并发问题！）
Product.objects.filter(id=1).update(stock=F('stock') - 1)
# ❌ 危险（非原子）：
product = Product.objects.get(id=1)
product.stock -= 1
product.save()  # 并发时可能超卖！
# ✅ 安全：用F表达式在数据库层面原子更新
\`\`\`

### Q表达式：复杂查询条件

Q()用于构建复杂的OR/AND/NOT查询条件：

\`\`\`python
from django.db.models import Q

# OR条件：年龄<18或年龄>60
users = User.objects.filter(Q(age__lt=18) | Q(age__gt=60))

# AND条件：可以用逗号或&
users = User.objects.filter(Q(is_active=True) & Q(age__gte=18))
users = User.objects.filter(Q(is_active=True), Q(age__gte=18))  # 等价

# NOT条件
users = User.objects.filter(~Q(name__startswith='张'))

# 复杂组合
users = User.objects.filter(
    (Q(age__lt=18) | Q(age__gt=60)) &
    Q(is_active=True) &
    ~Q(name__icontains='test')
).order_by('-create_time')

# Q对象可以嵌套
q1 = Q(name__startswith='张')
q2 = Q(age__gte=25)
q3 = Q(is_active=True)
combined = q1 & (q2 | q3)
users = User.objects.filter(combined)
\`\`\`

## 六、解决N+1查询问题

### select_related：一对一/多对一（JOIN加载）

select_related用LEFT JOIN在一次查询中加载关联对象，适用于ForeignKey和OneToOneField：

\`\`\`python
# ❌ N+1问题：查询100个订单，每个订单访问user又查一次
orders = Order.objects.all()[:100]
for order in orders:
    print(order.user.name)  # 每个order触发一次SELECT user！

# ✅ select_related：一次JOIN查询全部
orders = Order.objects.select_related('user')[:100]
for order in orders:
    print(order.user.name)  # 不触发额外查询！

# 多层select_related：order -> user -> profile（假设profile是OneToOne）
orders = Order.objects.select_related('user__profile')[:100]
for order in orders:
    print(order.user.profile.avatar)  # 不触发额外查询
\`\`\`

### prefetch_related：一对多/多对多（两次查询）

prefetch_related分开查询，然后用IN在Python层关联，适用于ManyToManyField和反向ForeignKey：

\`\`\`python
# ❌ N+1：查100个用户，每个用户访问orders触发一次
users = User.objects.all()[:100]
for user in users:
    print(user.orders.count())  # 每个用户触发一次查询！

# ✅ prefetch_related：两次查询
users = User.objects.prefetch_related('orders')[:100]
for user in users:
    print(user.orders.all())  # 不触发额外查询！
# SQL:
# 1. SELECT * FROM users LIMIT 100
# 2. SELECT * FROM orders WHERE user_id IN (1,2,3,...,100)

# 多层prefetch：用户 -> 订单 -> 订单项
users = User.objects.prefetch_related('orders__items')[:100]

# prefetch可以加过滤条件：用Prefetch对象
from django.db.models import Prefetch

# 只预加载已支付的订单
paid_prefetch = Prefetch(
    'orders',
    queryset=Order.objects.filter(status='paid'),
    to_attr='paid_orders'
)
users = User.objects.prefetch_related(paid_prefetch)
for user in users:
    print(user.paid_orders)  # 只有已支付订单
\`\`\`

### select_related vs prefetch_related对比

| 方法 | SQL次数 | 实现方式 | 适用关系 |
|-----|--------|---------|---------|
| select_related | 1次 | LEFT JOIN | ForeignKey, OneToOneField（多对一、一对一） |
| prefetch_related | 2+次 | IN查询 | ManyToManyField, 反向ForeignKey（一对多、多对多） |

## 七、CRUD操作

### Create创建

\`\`\`python
# 方式1：create()直接创建并保存
user = User.objects.create(name='张三', email='z@e.com', age=25)

# 方式2：实例化后save()
user = User(name='李四', email='l@e.com', age=30)
user.save()

# 批量创建：bulk_create（高效！）
users = [
    User(name=f'用户{i}', email=f'user{i}@e.com', age=20+i)
    for i in range(1000)
]
User.objects.bulk_create(users)  # 一次INSERT多条，性能好
# ⚠️ bulk_create不会调用save()方法，不会发送信号，自增ID可能拿不到（看数据库）
\`\`\`

### Update更新

\`\`\`python
# 方式1：先查询再修改save()
user = User.objects.get(id=1)
user.name = '新名字'
user.age = 26
user.save()  # 会UPDATE所有字段！

# 方式2：update()批量更新（更高效，只更新指定字段）
User.objects.filter(id=1).update(name='新名字', age=26)
# 批量更新
User.objects.filter(age__lt=18).update(is_active=False)
# 用F表达式
User.objects.filter(id=1).update(age=F('age') + 1)

# bulk_update：批量更新多条不同数据
users = list(User.objects.filter(age__lt=20)[:100])
for user in users:
    user.age += 1
User.objects.bulk_update(users, ['age'])  # 只更新age字段
\`\`\`

### Delete删除

\`\`\`python
# 删除单条
user = User.objects.get(id=1)
user.delete()

# 批量删除
User.objects.filter(is_active=False).delete()
Order.objects.filter(create_time__lt='2020-01-01').delete()

# ⚠️ Django默认级联删除（on_delete=CASCADE）
# 删除用户会删除其所有订单！（除非设置on_delete=SET_NULL等）
\`\`\`

## 最佳实践

1. **记住QuerySet惰性**：只在需要时求值，避免重复查询
2. **总是用select_related/prefetch_related解决N+1**：遍历关联对象前必须预加载
3. **F表达式做原子更新**：计数器、库存等场景必须用F()防止并发问题
4. **Q对象组合复杂条件**：OR/NOT查询必须用Q()
5. **批量操作用bulk_create/bulk_update**：比循环单条操作快10-100倍
6. **update()比先查后save高效**：只更新需要的字段，不加载对象到内存
7. **exists()/count()用对场景**：判断存在用exists()不要用count()或len()
8. **values()/values_list()只取需要的字段**：避免SELECT *

\`\`\`python
# ❌ 不好：判断存在用count
if User.objects.filter(email='z@e.com').count() > 0:
    pass

# ✅ 好：用exists()（SELECT 1 ... LIMIT 1，更快）
if User.objects.filter(email='z@e.com').exists():
    pass

# ❌ 不好：查全表只取name
for user in User.objects.all():
    print(user.name)

# ✅ 好：values_list只取name
for name in User.objects.values_list('name', flat=True):
    print(name)
\`\`\`

## 常见坑点

1. **N+1查询**：Django Debug Toolbar可以看到重复查询
2. **bulk_create不调用save()和信号**：需要save()逻辑的不能用bulk_create
3. **on_delete=CASCADE误删数据**：删除主对象级联删除关联对象，生产环境谨慎使用
4. **DateTimeField的auto_now不可编辑**：auto_now_add=True创建时设置，auto_now=True每次save更新
5. **get()抛MultipleObjectsReturned/DoesNotExist**：get()期望返回0或1条，多条会报错
6. **QuerySet切片后还能链式调用吗？**：可以，但如果用了step（如[::2]）会执行查询不能再filter
7. **DateTimeField时区问题**：USE_TZ=True时存UTC时间，显示时转本地时区
8. **filter的坑：跨关系查询重复**：annotate跨多对多关系时可能产生重复行，需要distinct()
`
  },
  {
    id: "pyb-8-8",
    group: "ORM框架深度",
    icon: "🏗️",
    title: "ORM最佳实践 - 避免N+1问题、批量操作bulk_create/bulk_update、原生SQL兜底、数据库迁移",
    content: `

# ORM最佳实践

正确使用ORM可以极大提升开发效率，错误使用则会导致严重性能问题。本章节总结ORM（SQLAlchemy和Django ORM）的通用最佳实践。

## 一、避免N+1查询问题（最重要！）

N+1是ORM最常见也是影响最大的性能问题，必须时刻警惕。

### 如何发现N+1问题

\`\`\`python
# SQLAlchemy：开启echo或事件监听查看SQL
import logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# Django：安装django-debug-toolbar，它会显示每个页面的SQL查询次数和耗时
# 或者在settings中配置LOGGING记录SQL
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'loggers': {
        'django.db.backends': {'level': 'DEBUG', 'handlers': ['console']},
    }
}

# 代码审计点：
# 1. 任何for循环遍历queryset后访问关联属性，大概率N+1
# 2. 序列化器输出关联字段时容易N+1
# 3. 模板中访问关联对象容易N+1
\`\`\`

### SQLAlchemy解决N+1

\`\`\`python
from sqlalchemy.orm import joinedload, selectinload, subqueryload

# ❌ N+1
users = session.query(User).all()
for user in users:
    for order in user.orders:  # 每个用户触发一次查询
        print(order.amount)

# ✅ joinedload：1次JOIN查询（适合多对一、一对一）
users = session.query(User).options(
    joinedload(User.orders)
).all()

# ✅ selectinload：2次查询（推荐用于一对多、多对多）
users = session.query(User).options(
    selectinload(User.orders)
).all()

# 多级预加载
users = session.query(User).options(
    selectinload(User.orders).joinedload(Order.items),  # orders用selectin，items用join
    joinedload(User.profile)
).all()

# 预防忘记预加载：lazy='raise'
class User(Base):
    orders = relationship("Order", lazy='raise')  # 访问未预加载的orders直接抛错！
# 开发环境设置lazy='raise'，强制你显式预加载
\`\`\`

### Django ORM解决N+1

\`\`\`python
# ❌ N+1
orders = Order.objects.all()
for order in orders:
    print(order.user.name)  # 每个order触发查询

# ✅ select_related（ForeignKey/OneToOne）
orders = Order.objects.select_related('user').all()
for order in orders:
    print(order.user.name)  # 无额外查询

# ❌ N+1
users = User.objects.all()
for user in users:
    for order in user.orders.all():  # 每个用户触发查询
        print(order.amount)

# ✅ prefetch_related（一对多/多对多）
users = User.objects.prefetch_related('orders').all()
for user in users:
    for order in user.orders.all():  # 无额外查询
        print(order.amount)

# 多层预加载
users = User.objects.select_related('profile').prefetch_related('orders__items')
\`\`\`

## 二、批量操作优化

单条循环add/save性能极差，必须用批量方法。

### SQLAlchemy批量操作

\`\`\`python
# ❌ 性能极差：循环add+commit
for data in large_data:
    obj = User(**data)
    session.add(obj)
    session.commit()

# ✅ add_all一次add，最后commit
session.add_all([User(**data) for data in large_data])
session.commit()

# ✅ 更好：bulk_insert_mappings（绕过ORM状态管理，性能最好）
session.bulk_insert_mappings(User, large_data)
session.commit()
# 注意：bulk_insert_mappings不会触发事件、不会维护关系、不会获取自增ID
# 性能：比循环add快约50-100倍

# ✅ bulk_update_mappings
session.bulk_update_mappings(User, [
    {'id': 1, 'name': '张三', 'age': 26},
    {'id': 2, 'name': '李四', 'age': 31},
])
session.commit()

# ✅ Core批量插入（性能最高）
session.execute(
    User.__table__.insert(),
    large_data  # 字典列表
)
session.commit()
\`\`\`

### Django ORM批量操作

\`\`\`python
# ❌ 慢：循环create
for data in large_data:
    User.objects.create(**data)

# ✅ bulk_create（快）
User.objects.bulk_create([
    User(**data) for data in large_data
], batch_size=1000)  # 分批插入避免SQL过长

# ✅ bulk_update（批量更新不同值）
users = []
for data in update_data:
    user = User(id=data['id'], name=data['name'], age=data['age'])
    users.append(user)
User.objects.bulk_update(users, ['name', 'age'], batch_size=1000)

# ✅ update批量更新（相同值）
User.objects.filter(is_active=False).update(is_active=True)

# bulk_create注意事项：
# 1. 不会调用模型的save()方法
# 2. 不会发送pre_save/post_save信号
# 3. 多对多关系不会保存
# 4. 自增ID在PostgreSQL可以获取，MySQL/ SQLite不一定
# 5. batch_size参数控制每次插入条数
\`\`\`

### 批量操作性能对比（插入10000条记录）

| 方法 | 耗时（近似） | SQL次数 |
|-----|------------|--------|
| 循环add+commit | 10-30秒 | 10000次INSERT + 10000次COMMIT |
| add_all一次commit | 2-5秒 | 10000次INSERT + 1次COMMIT |
| bulk_insert_mappings | 0.3-1秒 | 少量批量INSERT + 1次COMMIT |
| Core insert | 0.2-0.8秒 | 最少SQL |

## 三、只查询需要的字段

避免SELECT *，只取业务需要的字段，减少数据传输和内存占用。

### SQLAlchemy

\`\`\`python
# ❌ 查所有列
users = session.query(User).all()

# ✅ 查询指定列
users = session.query(User.id, User.name, User.email).all()
for id, name, email in users:
    print(id, name, email)

# ✅ 加载部分列到对象（load_only）
from sqlalchemy.orm import load_only
users = session.query(User).options(load_only('id', 'name')).all()
\`\`\`

### Django ORM

\`\`\`python
# ❌ SELECT *
users = User.objects.all()

# ✅ values：返回字典列表
users = User.objects.values('id', 'name', 'email')
for user in users:
    print(user['name'])

# ✅ values_list：返回元组列表
names = User.objects.values_list('name', flat=True)  # flat=True返回单值列表
for name in names:
    print(name)

# ✅ only()/defer()：加载部分字段到模型实例
users = User.objects.only('id', 'name')  # 只加载id和name
users = User.objects.defer('create_time', 'update_time')  # 排除大字段
\`\`\`

## 四、分页查询

大数据集绝对不能.all()全部加载到内存！

\`\`\`python
# SQLAlchemy分页
def paginate(page=1, per_page=20):
    return session.query(User).limit(per_page).offset((page-1)*per_page).all()

# 大数据集用keyset分页（比OFFSET高效）
# 避免OFFSET大时扫描前面所有行
last_id = 0
page_size = 100
while True:
    batch = session.query(User).filter(
        User.id > last_id
    ).order_by(User.id).limit(page_size).all()
    if not batch:
        break
    for user in batch:
        process(user)
    last_id = batch[-1].id

# Django分页
from django.core.paginator import Paginator

paginator = Paginator(User.objects.all(), 20)
page = paginator.page(1)  # 第1页
print(page.object_list)  # 当前页数据
print(page.has_next())
print(page.next_page_number())

# Django keyset分页
def get_users(last_id=None, page_size=100):
    qs = User.objects.all().order_by('id')
    if last_id:
        qs = qs.filter(id__gt=last_id)
    return qs[:page_size]
\`\`\`

## 五、原生SQL兜底

ORM不是万能的，复杂查询、报表统计、性能敏感场景直接用原生SQL。

### SQLAlchemy原生SQL

\`\`\`python
from sqlalchemy import text

# 方式1：text()执行原生SQL
result = session.execute(text("""
    SELECT u.name, 
           COUNT(o.id) as order_count,
           COALESCE(SUM(o.amount), 0) as total_amount
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.create_time >= :start_date
    GROUP BY u.id, u.name
    HAVING COUNT(o.id) >= :min_orders
    ORDER BY total_amount DESC
    LIMIT :limit
"""), {
    'start_date': '2024-01-01',
    'min_orders': 3,
    'limit': 100
})

for row in result:
    print(row.name, row.order_count, row.total_amount)

# 方式2：Core表达式（推荐，类型安全、参数绑定）
from sqlalchemy import func
subq = select(
    Order.user_id,
    func.count(Order.id).label('order_count'),
    func.sum(Order.amount).label('total_amount')
).where(Order.create_time >= '2024-01-01').group_by(Order.user_id).having(
    func.count(Order.id) >= 3
).subquery()

result = session.query(User.name, subq.c.order_count, subq.c.total_amount).join(
    subq, User.id == subq.c.user_id
).order_by(subq.c.total_amount.desc()).limit(100).all()

# 注意：永远用参数绑定！不要字符串拼接SQL！
# ❌ 危险（SQL注入）
session.execute(text(f"SELECT * FROM users WHERE name = '{name}'"))
# ✅ 安全
session.execute(text("SELECT * FROM users WHERE name = :name"), {'name': name})
\`\`\`

### Django ORM原生SQL

\`\`\`python
from django.db import connection

# 方式1：raw()（返回模型实例）
users = User.objects.raw("""
    SELECT id, name, email FROM users 
    WHERE create_time >= %s AND is_active = %s
""", ['2024-01-01', True])
for user in users:
    print(user.name)

# 方式2：connection.cursor()（完全原生）
with connection.cursor() as cursor:
    cursor.execute("""
        SELECT u.name, COUNT(o.id), COALESCE(SUM(o.amount), 0)
        FROM users u LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.create_time >= %s
        GROUP BY u.id, u.name
    """, ['2024-01-01'])
    for row in cursor.fetchall():
        print(row)

# Django 3.2+：RawSQL注解
from django.db.models.expressions import RawSQL
users = User.objects.annotate(
    order_count=RawSQL("SELECT COUNT(*) FROM orders WHERE user_id = users.id", [])
)
\`\`\`

## 六、数据库迁移

### SQLAlchemy：Alembic

Alembic是SQLAlchemy官方迁移工具：

\`\`\`bash
# 安装
pip install alembic

# 初始化
alembic init alembic

# 修改alembic.ini配置数据库连接
# sqlalchemy.url = sqlite:///app.db

# 修改env.py导入Base
from models import Base
target_metadata = Base.metadata

# 创建迁移脚本（自动检测模型变化）
alembic revision --autogenerate -m "add users and orders tables"

# 检查生成的迁移脚本！autogenerate不是100%准确！

# 执行迁移
alembic upgrade head

# 回滚一个版本
alembic downgrade -1

# 查看当前版本
alembic current

# 查看历史
alembic history
\`\`\`

### Django ORM：内置Migrations

\`\`\`bash
# 创建迁移文件（根据模型变化自动生成）
python manage.py makemigrations

# 查看迁移SQL（不执行，先检查！）
python manage.py sqlmigrate app_name 0001

# 执行迁移
python manage.py migrate

# 回滚到指定版本
python manage.py migrate app_name 0001

# 创建空迁移（自定义SQL用）
python manage.py makemigrations --empty app_name
\`\`\`

### 迁移最佳实践

1. **永远检查自动生成的迁移**：autogenerate可能漏掉重命名、索引、特殊约束
2. **迁移文件纳入版本控制**：和代码一起提交
3. **生产环境迁移前备份**：特别是涉及删表、删字段、大表更新
4. **大表加索引用CONCURRENTLY**：避免锁表（PostgreSQL）
5. **不要修改已提交的迁移**：新建迁移修正错误
6. **批量数据迁移分批处理**：避免锁表太久
7. **测试迁移回滚**：确保downgrade正确

## 七、其他通用最佳实践

### 1. 事务管理

\`\`\`python
# 事务尽量短，不要在事务中做网络请求、文件IO等耗时操作
# ❌ 不好：
with transaction.atomic():
    user = User.objects.create(name='张三')
    send_email(user.email)  # 网络请求！事务一直持有
    order = Order.objects.create(user=user)

# ✅ 好：事务外发送邮件（或者用事务提交后信号）
from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

user = User.objects.create(name='张三')
order = None
with transaction.atomic():
    order = Order.objects.create(user=user)
send_email(user.email)  # 事务提交后再发邮件
\`\`\`

### 2. 数据库索引

\`\`\`python
# SQLAlchemy：常用查询字段加索引
class User(Base):
    name = Column(String(50), index=True)
    email = Column(String(100), unique=True, index=True)
    create_time = Column(DateTime, index=True)

# Django：db_index=True
class User(models.Model):
    name = models.CharField(max_length=50, db_index=True)
    email = models.EmailField(unique=True)
    create_time = models.DateTimeField(auto_now_add=True, db_index=True)
    
    # 联合索引
    class Meta:
        indexes = [
            models.Index(fields=['is_active', 'create_time']),
        ]
\`\`\`

### 3. 读写分离（进阶）

\`\`\`python
# Django多数据库配置
DATABASES = {
    'default': {},  # 主库（写）
    'replica': {},  # 从库（读）
}

class PrimaryReplicaRouter:
    def db_for_read(self, model, **hints):
        return 'replica'
    def db_for_write(self, model, **hints):
        return 'default'
\`\`\`

## 常见坑点总结

1. **N+1查询**：遍历关联对象前必须预加载
2. **循环单条操作**：批量操作必须用bulk方法
3. **SELECT * 查询**：只取需要的字段
4. **大表全表扫描**：没有索引、查询条件没用到索引
5. **大事务**：事务中包含耗时操作，占用锁资源
6. **SQL注入**：原生SQL不要拼接字符串，用参数绑定
7. **bulk操作不触发信号/save**：需要这些逻辑时不能用bulk
8. **迁移不检查就执行**：生产迁移必须先在测试环境验证
9. **Float存金额**：金额必须用Decimal/Numeric
10. **时区问题**：统一用UTC存储，显示时转本地时区
`
  }
]
