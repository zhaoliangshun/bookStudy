// =============================================================
// FastAPI 现代开发全书 - 第 7 批章节（数据库集成 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fp-sqlalchemy-sync     : SQLAlchemy 同步集成
//   fp-sqlalchemy-async    : SQLAlchemy 异步集成
//   fp-alembic             : 数据库迁移与 Alembic
//   fp-db-optimization     : 连接池与性能优化
// ============================================================

export const chapters = [
  // ============================================================
  // 第 23 章：SQLAlchemy 同步集成
  // ============================================================
  {
    id: "fp-sqlalchemy-sync",
    group: "数据库集成",
    icon: "🗄️",
    title: "SQLAlchemy 同步集成",
    content: `# SQLAlchemy 同步集成

## 为什么 Web 应用离不开数据库

到目前为止我们写的所有 FastAPI 应用都活在"内存里"——数据存在 Python 字典里，进程一重启就什么都没了。这种程序演示没问题，但真实业务必须把数据持久化到磁盘上，而**关系型数据库**（RDBMS）是最主流的持久化方案。

为什么是关系型数据库而不是文件或者 NoSQL？因为绝大多数业务的核心数据都是**结构化、有关系的**：用户与订单是一对多，订单与商品是多对多，文章与评论是一对多。关系型数据库用"表 + 外键 + SQL"完美刻画这种结构，而且经过四十多年发展，ACID 事务、索引、查询优化都极其成熟。

但直接写 SQL 字符串有三大痛点：

1. **SQL 注入风险**：手动拼接字符串很容易留下安全漏洞。
2. **结果映射繁琐**：从 cursor 取出来的元组要手动转成对象。
3. **数据库方言差异**：MySQL 写法跟 PostgreSQL 不完全一样，迁移成本高。

**ORM（对象关系映射）** 就是为解决这些问题而生的。你在 Python 里定义一个类就对应一张表，类的属性对应字段，操作对象等于操作数据行。ORM 帮你生成 SQL、防注入、做结果映射，还能切换方言。

Python 生态里最强大的 ORM 就是 **SQLAlchemy**。它不仅是 ORM，还是一套完整的数据库工具集，FastAPI 官方文档里所有数据库示例都基于它。本章我们从零开始，把 SQLAlchemy 同步集成到 FastAPI 里。

## SQLAlchemy 的架构：Core 与 ORM

很多人第一次接触 SQLAlchemy 会觉得"乱"——文档分两部分，一部分讲 Core，一部分讲 ORM。这种设计不是历史包袱，而是有意识的分层。

**SQLAlchemy Core** 是底层，负责：

- 数据库连接管理（Engine、连接池）
- SQL 表达式语言（用 Python 对象拼 SQL）
- 结果集处理

**SQLAlchemy ORM** 是上层，在 Core 之上提供：

- 类与表的映射（declarative_base）
- 对象关系查询（Query、Session）
- 关系加载（一对多、多对多的懒加载/预加载）

类比一下：Core 像是变速箱和底盘，ORM 像是车身和座椅。你可以只用 Core 写高性能批处理脚本，也可以用 ORM 享受"对象即行"的开发体验。Web 应用里我们 99% 用 ORM，但理解 Core 能帮你调试慢查询和连接问题。

下面这张概念图请记牢，后面所有代码都围绕它：

\`\`\`text
+---------------------------------------------------+
|  应用层（FastAPI 路由 / 业务逻辑）                  |
+---------------------------------------------------+
|  ORM 层（declarative_base / Session / relationship）|
+---------------------------------------------------+
|  Core 层（Engine / Connection / 连接池 / 方言）     |
+---------------------------------------------------+
|  DBAPI 驱动（psycopg2 / pymysql / aiosqlite）       |
+---------------------------------------------------+
|  数据库服务器（PostgreSQL / MySQL / SQLite）        |
+---------------------------------------------------+
\`\`\`

## Engine 与 Session：两个最核心的对象

### Engine——数据库的"连接工厂"

Engine 是 SQLAlchemy 与数据库通信的入口，理解它要把握三点：

1. **一个进程通常只创建一个 Engine**（单例），它内部维护连接池，所有请求共享。
2. **Engine 不是连接**，而是"连接工厂"。每次需要干活时调用 \`engine.connect()\` 才真正拿一条连接。
3. **Engine 由 URL 描述**：\`dialect+driver://user:password@host:port/dbname\`。

URL 的格式非常重要，记住几个常见例子：

- SQLite：\`sqlite:///./app.db\`（相对路径，文件在当前目录）
- PostgreSQL：\`postgresql+psycopg2://user:pwd@localhost:5432/mydb\`
- MySQL：\`mysql+pymysql://user:pwd@localhost:3306/mydb\`

注意 \`+\` 后面是驱动名，SQLAlchemy 会按这个名去 import 对应的 DBAPI 模块。

### Session——一次"工作单元"

Session 是 ORM 的核心，可以把它理解成"一次对话"。你拿到一个 Session，在里面增删改对象，最后调用 \`commit()\` 一次性提交，或者 \`rollback()\` 撤销。

Session 与 Connection 的关系：

- Session 内部持有一个 Connection
- Session 跟踪所有"脏对象"（被修改但还没 flush 的对象）
- commit 会把所有改动一次性写入数据库

**最重要的一句话**：Session **不是线程安全**的。多线程环境下每个线程要用自己的 Session。在 FastAPI 里我们用依赖注入让每个请求拿一个独立 Session，请求结束就关闭。

## Demo 1：创建 Engine 与声明 Base

\`\`\`python
# 文件：database.py
# 这个文件负责所有"基础设施"：Engine、Session 工厂、Base

# 从 sqlalchemy 导入创建 Engine 的函数
from sqlalchemy import create_engine
# 从 sqlalchemy.orm 导入声明式基类的工厂
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# 1. 数据库 URL
# 这里用 SQLite，方便演示。真实项目用 PostgreSQL
# echo=True 会把生成的 SQL 打印到控制台，方便调试，生产环境关掉
SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"

# 2. 创建 Engine
# connect_args 只对 SQLite 需要：SQLite 不允许多线程共享连接
# 其他数据库不需要这个参数
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,  # 调试时改成 True 看 SQL
    pool_size=5,  # 连接池大小（SQLite 不生效，但 PostgreSQL 生效）
    max_overflow=10,  # 连接池满了之后还能临时开多少
    pool_pre_ping=True,  # 每次取连接前 ping 一下，避免拿到死连接
)

# 3. 创建 Session 工厂
# sessionmaker 是个"工厂"，调用它才会生成真正的 Session 实例
# autocommit=False 表示需要手动 commit
# autoflush=False 表示不要在查询前自动 flush，让开发者掌控节奏
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)

# 4. 声明式基类
# 所有 ORM 模型都继承 Base，Base.metadata 收集所有表结构
Base = declarative_base()
\`\`\`

要点解释：

- \`echo=True\` 是学习阶段的宝贝，能看到每条 SQL，但生产环境关掉，否则日志爆炸。
- \`pool_pre_ping=True\` 解决的是"数据库重启后连接失效"的问题，强烈建议开启。
- \`autoflush=False\` 是个好习惯，避免你还没准备好就被 flush 到数据库。

## Demo 2：定义 ORM 模型（declarative_base）

\`\`\`python
# 文件：models.py
# 定义所有表结构

# 从 datetime 导入 datetime 类型，用于时间戳
from datetime import datetime
# 从 sqlalchemy 导入列类型
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
# 从 sqlalchemy.orm 导入关系定义
from sqlalchemy.orm import relationship

# 从 database.py 导入 Base
from database import Base

# User 类对应数据库里的 users 表
class User(Base):
    __tablename__ = "users"  # 表名

    # 主键，自增
    id = Column(Integer, primary_key=True, index=True)
    # 用户名，建索引，唯一
    username = Column(String(50), unique=True, index=True, nullable=False)
    # 邮箱
    email = Column(String(120), unique=True, nullable=False)
    # 哈希后的密码，真实项目里绝不存明文
    hashed_password = Column(String(255), nullable=False)
    # 是否激活
    is_active = Column(Boolean, default=True)
    # 创建时间，默认是当前 UTC 时间
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关系：一个用户有多篇文章
    # back_populates 让双向引用生效
    # cascade="all, delete-orphan" 表示删用户时连带删他的文章
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")

    # __repr__ 方便调试时打印
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username!r})>"


# Post 类对应 articles / posts 表
class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    body = Column(Text, default="")
    # 外键：指向 users.id
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # 是否发布
    published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 反向关系
    author = relationship("User", back_populates="posts")

    def __repr__(self):
        return f"<Post(id={self.id}, title={self.title!r})>"
\`\`\`

几个关键点：

- \`Column(Integer, primary_key=True)\` 是主键，自增由数据库处理。
- \`index=True\` 给这一列建索引，加速查询，代价是写入慢一点。
- \`unique=True\` 加唯一约束。
- \`nullable=False\` 等价于 SQL 的 NOT NULL。
- \`relationship\` 不是列，是 ORM 提供的"对象导航"，不存数据库。
- \`back_populates\` 让两端互相引用，是 SQLAlchemy 2.0 风格的写法（取代旧的 backref）。

## Demo 3：建表与第一个 CRUD 测试

\`\`\`python
# 文件：seed.py
# 建表 + 插入测试数据

# 导入 Base 和所有模型（必须 import 才会被 Base.metadata 收集）
from database import engine, SessionLocal, Base
from models import User, Post

# 1. 建表
# Base.metadata.create_all 会扫描所有继承 Base 的模型，自动建表
# 注意：这是开发期用的，生产环境用 Alembic（下一章讲）
Base.metadata.create_all(bind=engine)

# 2. 创建一个 Session 来干活
db = SessionLocal()

try:
    # 创建一个用户对象——此时还没写进数据库
    new_user = User(
        username="alice",
        email="alice@example.com",
        hashed_password="fakehash123",
    )

    # add 把对象加到 Session 的"待写入列表"
    db.add(new_user)

    # flush 不 commit，但会把 INSERT 发到数据库，从而拿到 new_user.id
    # 这是 SQLAlchemy 的"延迟写入"机制
    db.flush()
    print(f"用户已分配 id={new_user.id}")

    # 给 alice 创建两篇文章
    post1 = Post(title="FastAPI 入门", body="第一篇...", author_id=new_user.id)
    post2 = Post(title="SQLAlchemy 实战", body="第二篇...", author_id=new_user.id)
    db.add_all([post1, post2])

    # 一次性提交所有改动
    db.commit()
    print("提交成功")
finally:
    # 无论成功失败都要关闭 Session
    db.close()
\`\`\`

注意 \`add\` 与 \`commit\` 的区别：

- \`add\` 只是把对象标记为"待处理"，SQL 还没发。
- \`flush\` 把待处理的 SQL 发到数据库（在事务内），可以拿到自增 id。
- \`commit\` 隐式 flush + 提交事务，让其他连接能看到改动。
- \`rollback\` 撤销当前事务里所有未提交的改动。

## Demo 4：查询数据（多种姿势）

\`\`\`python
# 文件：query_demo.py

from database import SessionLocal
from models import User, Post
from sqlalchemy import select

db = SessionLocal()
try:
    # 姿势 1：按主键查（最快）
    # get 返回 None 如果找不到
    user = db.get(User, 1)
    print(f"按主键查到：{user}")

    # 姿势 2：filter_by 简单等值过滤
    alice = db.query(User).filter_by(username="alice").first()
    print(f"filter_by 查到：{alice}")

    # 姿势 3：filter 用表达式（更灵活，支持 >、<、like 等）
    active_users = (
        db.query(User)
        .filter(User.is_active == True)        # 等值
        .filter(User.email.like("%@example.com"))  # 模糊
        .order_by(User.created_at.desc())      # 倒序
        .limit(10)                             # 取 10 条
        .all()                                 # 触发查询
    )
    print(f"找到 {len(active_users)} 个活跃用户")

    # 姿势 4：只查特定列（性能更好，避免加载整行）
    rows = db.query(User.id, User.username).all()
    for row in rows:
        print(row.id, row.username)

    # 姿势 5：count
    total = db.query(User).count()
    print(f"总用户数：{total}")

    # 姿势 6：用 2.0 风格的 select（推荐）
    # select 返回 Select 对象，再交给 db.execute 执行
    stmt = select(User).where(User.is_active.is_(True)).order_by(User.id)
    for u in db.execute(stmt).scalars():
        print(u)

finally:
    db.close()
\`\`\`

关于 \`first()\` / \`all()\` / \`one()\` / \`scalars()\` 的区别：

- \`first()\` 加 LIMIT 1，返回第一条或 None。
- \`all()\` 返回列表，立刻执行。
- \`one()\` 期望恰好一条，多了抛 MultipleResultsFound，少了抛 NoResultFound。
- \`scalars()\` 把"行"解包成"对象"，因为 execute 默认返回 Row 元组。

## Demo 5：更新与删除

\`\`\`python
# 文件：update_demo.py

from database import SessionLocal
from models import User

db = SessionLocal()
try:
    # === 更新方式 1：修改对象属性 ===
    alice = db.query(User).filter_by(username="alice").first()
    if alice:
        alice.email = "new_alice@example.com"
        alice.is_active = False
        # 此时 alice 是"脏对象"，commit 时自动 UPDATE
        db.commit()

    # === 更新方式 2：批量更新（不加载对象，直接发 UPDATE） ===
    # 适合大量数据，性能比循环改属性高得多
    updated = (
        db.query(User)
        .filter(User.is_active == False)
        .update({User.is_active: True}, synchronize_session=False)
    )
    db.commit()
    print(f"批量激活了 {updated} 个用户")

    # === 删除方式 1：delete 对象 ===
    bad_user = db.query(User).filter_by(username="spammer").first()
    if bad_user:
        db.delete(bad_user)
        db.commit()

    # === 删除方式 2：批量删除 ===
    deleted = (
        db.query(User)
        .filter(User.is_active == False)
        .delete(synchronize_session=False)
    )
    db.commit()
    print(f"删除了 {deleted} 个用户")

finally:
    db.close()
\`\`\`

注意 \`synchronize_session\`：

- \`fetch\`（默认）：删除前先 select 出来，保证 Session 里的对象同步。
- \`False\`：不同步，性能好但 Session 里的对象可能还残留——只用在你确定不再用 Session 里这些对象时。
- \`evaluate\`：用 Python 表达式评估，介于两者之间。

## Demo 6：一对多关系操作

\`\`\`python
# 文件：relation_demo.py

from database import SessionLocal
from models import User, Post

db = SessionLocal()
try:
    alice = db.query(User).filter_by(username="alice").first()

    # === 关系导航：直接通过 .posts 访问关联对象 ===
    # 第一次访问会触发一次 SQL 查询（懒加载）
    for post in alice.posts:
        print(post.title)

    # === 通过关系直接添加 Post（不用手动写 author_id） ===
    new_post = Post(title="第三章：关系映射", body="...")
    alice.posts.append(new_post)  # SQLAlchemy 自动设 author_id
    db.commit()
    print(f"新文章 id={new_post.id}, author_id={new_post.author_id}")

    # === 反向导航：从 Post 找 Author ===
    p = db.get(Post, new_post.id)
    print(f"文章 {p.title} 的作者是 {p.author.username}")

    # === 级联删除测试 ===
    # 因为 User.posts 配置了 cascade="all, delete-orphan"
    # 删除用户会连带删除他所有文章
    db.delete(alice)
    db.commit()
    print("alice 及其所有文章已删除")

finally:
    db.close()
\`\`\`

懒加载（Lazy Loading）的坑要小心：

- 默认情况下 \`alice.posts\` 第一次访问才发 SQL。
- 这意味着如果你在循环里访问 100 个用户的 posts，会发 100 条 SQL，这就是著名的 **N+1 问题**。
- 解决方法在第 26 章详细讲，这里先知道：用 \`joinedload\` 或 \`selectinload\` 一次性把关联数据捞回来。

## Demo 7：在 FastAPI 中用 yield 依赖管理 Session

这是本章的重头戏。FastAPI 推荐的写法是用 **yield 依赖** 自动管理 Session 生命周期。

\`\`\`python
# 文件：main.py
# 完整可运行的 FastAPI 应用

from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

# 从我们前面写的模块导入
from database import engine, SessionLocal, Base
from models import User, Post

# 建表（开发期，生产用 Alembic）
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SQLAlchemy 同步集成示例")

# ---- Pydantic 响应模型 ----
class UserOut(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool

    class Config:
        from_attributes = True  # 允许从 ORM 对象读取属性


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class PostOut(BaseModel):
    id: int
    title: str
    author_id: int

    class Config:
        from_attributes = True


class PostCreate(BaseModel):
    title: str
    body: str = ""


# ---- 依赖：每个请求一个 Session ----
# 用 yield 语法，yield 之前是"进入请求"的代码，之后是"离开请求"的代码
def get_db():
    # 创建一个新 Session
    db = SessionLocal()
    try:
        # 把 db 交给路由函数用
        yield db
    finally:
        # 路由返回后（无论成功失败）都会执行这里
        # 这保证了 Session 一定会被关闭
        db.close()


# ---- 路由：用户 ----
@app.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    # 检查用户名是否已存在
    exists = db.query(User).filter_by(username=payload.username).first()
    if exists:
        raise HTTPException(status_code=400, detail="用户名已存在")

    # 创建用户（密码这里简化，真实项目要哈希）
    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password="fakehash_" + payload.password,
    )
    db.add(user)
    db.commit()
    db.refresh(user)  # 刷新，拿到数据库生成的字段（如 id, created_at）
    return user


@app.get("/users", response_model=List[UserOut])
def list_users(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    # 分页查询
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@app.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user


# ---- 路由：文章 ----
@app.post("/users/{user_id}/posts", response_model=PostOut, status_code=status.HTTP_201_CREATED)
def create_post(user_id: int, payload: PostCreate, db: Session = Depends(get_db)):
    # 检查用户是否存在
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    post = Post(title=payload.title, body=payload.body, author_id=user_id)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@app.get("/users/{user_id}/posts", response_model=List[PostOut])
def list_user_posts(user_id: int, db: Session = Depends(get_db)):
    # 通过关系一次性拿到所有文章
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user.posts
\`\`\`

为什么要用 yield 而不是 try/finally？因为 yield 依赖有几个独特优势：

1. **请求失败也能清理**：路由抛异常时，FastAPI 仍会执行 yield 之后的代码，确保 Session 关闭。
2. **统一封装**：所有路由通过 \`Depends(get_db)\` 拿 Session，不写重复代码。
3. **可测试**：测试时可以 override 这个依赖，注入一个测试数据库的 Session。

\`db.refresh(user)\` 的作用：commit 之后对象在某些字段上是"过期"的（比如数据库默认值生成的字段），refresh 重新从数据库拉一次最新数据。

## 多对多关系（association table）

最后补一个多对多的完整例子，因为业务里很常见。

\`\`\`python
# 多对多需要一个"中间表"
from sqlalchemy import Table

# 中间表：post 与 tag 的关联
post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", ForeignKey("posts.id"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id"), primary_key=True),
)


class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)

    # secondary 指向中间表
    posts = relationship("Post", secondary=post_tags, back_populates="tags")


# 修改 Post，加上 tags 关系
# posts = relationship("Post", secondary=post_tags, back_populates="tags")


# 使用：
# tag = Tag(name="python")
# post.tags.append(tag)
# db.commit()
\`\`\`

## 本章小结

- SQLAlchemy 分 Core（底层）和 ORM（上层），Web 应用主要用 ORM。
- Engine 是单例的连接工厂，Session 是请求级的工作单元。
- 用 \`declarative_base\` 定义模型，\`relationship\` 描述关系。
- 在 FastAPI 中用 \`yield\` 依赖自动管理 Session 生命周期。
- 一对多用 \`ForeignKey + relationship\`，多对多用 \`Table + secondary\`。

下一章我们看异步版本——它能在高并发场景下显著提升吞吐量。
`
  },

  // ============================================================
  // 第 24 章：SQLAlchemy 异步集成
  // ============================================================
  {
    id: "fp-sqlalchemy-async",
    group: "数据库集成",
    icon: "⚡",
    title: "SQLAlchemy 异步集成",
    content: `# SQLAlchemy 异步集成

## 为什么需要异步数据库

回顾一下 FastAPI 的异步特性：当一个请求需要等待外部资源（数据库、HTTP API、Redis）时，同步代码会"卡住"整个线程，而异步代码可以让出执行权给其他请求，从而**单线程处理大量并发**。

但这里有个关键点：异步框架配上同步数据库驱动等于白搭。如果路由是 \`async def\` 但里面调用了同步的 \`db.query().all()\`，那么数据库在等 IO 的时候，整个事件循环还是被阻塞了——其他请求只能排队。

要真正享受异步的好处，必须做到"端到端异步"：

- FastAPI 路由是 \`async def\`
- 数据库驱动是异步的（如 \`asyncpg\`、\`aiomysql\`、\`aiosqlite\`）
- SQLAlchemy 使用 \`AsyncEngine\` 和 \`AsyncSession\`

这就是 SQLAlchemy 在 1.4 版本引入的 **AsyncIO 支持**。本章我们从零搭一套异步数据库栈。

### 同步 vs 异步的直观对比

假设一个请求要做 3 次数据库查询，每次 50ms：

- **同步**：3 次查询顺序执行，总耗时 150ms。期间这个 worker 线程被占住。
- **异步**：3 次查询可以并发 \`asyncio.gather\`，总耗时约 50ms。期间事件循环可以服务其他请求。

在低并发场景，异步的开销（协程切换、await）可能反而让单请求变慢。但在**高并发 + IO 密集**场景，异步吞吐量是同步的 5-10 倍。

### 哪些场景适合异步

- **适合**：API 网关、聚合多个上游服务、聊天室、实时推送、爬虫。
- **不适合**：CPU 密集任务（图像处理、机器学习推理）——这些应该扔到线程池或进程池。

## Demo 1：创建 AsyncEngine 与 AsyncSession

\`\`\`python
# 文件：async_database.py

# 从 sqlalchemy.ext.asyncio 导入异步相关类
# 这是 SQLAlchemy 1.4+ 引入的异步扩展
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
)

# 异步驱动的 URL 与同步不同：
# - SQLite 用 aiosqlite：sqlite+aiosqlite:///./app.db
# - PostgreSQL 用 asyncpg：postgresql+asyncpg://user:pwd@host/db
# - MySQL 用 aiomysql：mysql+aiomysql://user:pwd@host/db
ASYNC_DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/mydb"

# 1. 创建 AsyncEngine
# 注意：asyncpg 不需要 pool_pre_ping（它内部已有类似机制）
# echo=True 会用 logging 输出 SQL，调试时开启
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,  # 取连接超时
)

# 2. 创建 AsyncSession 工厂
# async_sessionmaker 是 sessionmaker 的异步版本
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,  # 异步下强烈建议 False，下面解释
    autoflush=False,
)
\`\`\`

\`expire_on_commit=False\` 是异步开发的关键配置，必须理解：

- 默认 \`expire_on_commit=True\`：commit 后所有对象属性被标记为"过期"，下次访问会自动从数据库重新加载。
- 但异步代码里，自动重新加载会触发隐式的 await，而 ORM 无法在同步上下文里 await，会抛 \`MissingGreenlet\` 错误。
- 解决：commit 后不自动过期，对象保持内存中的值。需要最新数据时手动 \`await session.refresh(obj)\`。

## Demo 2：异步模型定义与建表

\`\`\`python
# 文件：async_models.py
# 异步模型定义与同步几乎一样，但建表要用异步方式

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship, DeclarativeBase

# SQLAlchemy 2.0 推荐用 DeclarativeBase 替代 declarative_base
class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(120), unique=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")


class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    body = Column(String, default="")
    author_id = Column(Integer, ForeignKey("users.id"))
    author = relationship("User", back_populates="posts")


# 异步建表函数
async def init_models():
    # run_sync 是关键：在异步上下文里运行同步的 create_all
    async with async_engine.begin() as conn:
        # begin() 返回 AsyncConnection，自动在事务里执行
        # run_sync 接收一个同步函数，把它"包装"成异步
        await conn.run_sync(Base.metadata.create_all)
\`\`\`

为什么 \`create_all\` 要用 \`run_sync\`？因为 DDL 操作（CREATE TABLE 等）在 SQLAlchemy 内部还是同步实现，\`run_sync\` 是一个桥接，把同步函数放到线程池执行，避免阻塞事件循环。

## Demo 3：异步 CRUD 基本流程

\`\`\`python
# 文件：async_crud.py

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from async_models import User, Post


# === 创建用户 ===
async def create_user(db: AsyncSession, username: str, email: str) -> User:
    # 创建对象，加到 session
    user = User(username=username, email=email)
    db.add(user)
    # 注意：异步下用 await db.commit()
    await db.commit()
    # 刷新，拿到数据库生成的字段
    await db.refresh(user)
    return user


# === 按主键查询 ===
async def get_user(db: AsyncSession, user_id: int) -> User | None:
    # 异步下推荐用 select + execute（而不是 db.get）
    # db.get 在异步下也是 await db.get(...)，但 select 更灵活
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    # scalar_one_or_none：期望 0 或 1 条，多了会抛异常
    return result.scalar_one_or_none()


# === 列表查询 ===
async def list_users(db: AsyncSession, skip: int = 0, limit: int = 20) -> list[User]:
    stmt = select(User).offset(skip).limit(limit).order_by(User.id.desc())
    result = await db.execute(stmt)
    # scalars().all() 把 Row 元组解包成对象列表
    return result.scalars().all()


# === 更新 ===
async def update_email(db: AsyncSession, user_id: int, new_email: str) -> User | None:
    # 异步下也可以用 update() 语句做批量更新
    from sqlalchemy import update
    stmt = (
        update(User)
        .where(User.id == user_id)
        .values(email=new_email)
        .returning(User)  # 返回更新后的行（PostgreSQL 支持）
    )
    result = await db.execute(stmt)
    await db.commit()
    return result.scalar_one_or_none()


# === 删除 ===
async def delete_user(db: AsyncSession, user_id: int) -> bool:
    from sqlalchemy import delete
    stmt = delete(User).where(User.id == user_id)
    result = await db.execute(stmt)
    await db.commit()
    # rowcount 是受影响的行数
    return result.rowcount > 0
\`\`\`

异步查询的心智模型：

- 同步：\`db.query(User).filter(...).all()\` —— 链式调用直接返回结果。
- 异步：\`select(User).where(...)\` 构造 SQL，\`await db.execute(stmt)\` 执行，\`result.scalars().all()\` 解包结果。

链式调用消失了，因为 \`await\` 必须在表达式末尾，无法做成链式。这是异步 API 设计的必然代价。

## Demo 4：异步关系加载（selectinload）

异步下懒加载是个大坑——因为懒加载是同步触发的，在异步上下文里会抛 \`MissingGreenlet\`。解决方法是用 **预加载策略**（eager loading）。

\`\`\`python
# 文件：async_relation.py

from sqlalchemy import select
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from async_models import User, Post


# === 错误写法：会触发懒加载异常 ===
async def bad_example(db: AsyncSession, user_id: int):
    stmt = select(User).where(User.id == user_id)
    user = (await db.execute(stmt)).scalar_one()
    # 下一行抛 MissingGreenlet！因为 user.posts 触发同步懒加载
    # print(user.posts[0].title)


# === 正确写法 1：selectinload（推荐） ===
async def get_user_with_posts_selectin(db: AsyncSession, user_id: int):
    # selectinload 会发第二条 SELECT IN 查询，一次加载所有关联
    stmt = (
        select(User)
        .options(selectinload(User.posts))
        .where(User.id == user_id)
    )
    user = (await db.execute(stmt)).scalar_one()
    # 此时 user.posts 已经在内存里，访问不再发 SQL
    for p in user.posts:
        print(p.title)


# === 正确写法 2：joinedload（用 JOIN 一次查完） ===
async def get_user_with_posts_joined(db: AsyncSession, user_id: int):
    # joinedload 用 LEFT OUTER JOIN，一条 SQL 拿到所有数据
    # 适合一对一、或者一对多但关联数据少的情况
    stmt = (
        select(User)
        .options(joinedload(User.posts))
        .where(User.id == user_id)
    )
    user = (await db.execute(stmt)).unique().scalar_one()
    # unique() 很关键！joinedload 一对多会产生重复行
    for p in user.posts:
        print(p.title)


# === 批量查多个用户带文章（selectinload 优势在此） ===
async def list_users_with_posts(db: AsyncSession):
    stmt = select(User).options(selectinload(User.posts)).limit(100)
    users = (await db.execute(stmt)).scalars().all()
    # selectinload 会发一条 SELECT * FROM posts WHERE author_id IN (...) 一次拿全
    for u in users:
        print(u.username, len(u.posts))
\`\`\`

三种加载策略对比：

- **lazy（默认）**：第一次访问属性才发 SQL。同步下方便，异步下不能用。
- **selectinload**：额外发一条 SELECT IN 查询。适合一对多、多对多。
- **joinedload**：用 JOIN 一次拿全。适合一对一，或者只查一个父对象。
- **subqueryload**：类似 selectinload 但用子查询。性能比 selectinload 略差，已不常用。

经验法则：**异步场景一律用 selectinload，必要时用 joinedload**。

## Demo 5：异步事务管理

事务是数据库的核心保证。SQLAlchemy 异步下事务管理有几种方式：

\`\`\`python
# 文件：async_transaction.py

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from async_models import User, Post


# === 方式 1：手动 begin / commit / rollback ===
async def transfer_posts_manual(db: AsyncSession, from_id: int, to_id: int):
    try:
        # 把 from_id 的所有文章转给 to_id
        stmt = select(Post).where(Post.author_id == from_id)
        posts = (await db.execute(stmt)).scalars().all()
        for p in posts:
            p.author_id = to_id
        await db.commit()
    except Exception:
        # 出错就回滚，保证数据库一致性
        await db.rollback()
        raise


# === 方式 2：用 session.begin() 上下文管理器（推荐） ===
async def transfer_posts_ctx(db: AsyncSession, from_id: int, to_id: int):
    # begin() 进入事务，退出时自动 commit（成功）或 rollback（异常）
    async with db.begin():
        stmt = select(Post).where(Post.author_id == from_id)
        posts = (await db.execute(stmt)).scalars().all()
        for p in posts:
            p.author_id = to_id
    # 出 with 块时已自动 commit


# === 方式 3：嵌套事务（SAVEPOINT） ===
async def create_with_savepoint(db: AsyncSession, user_data: dict):
    # begin_nested 创建一个 SAVEPOINT
    async with db.begin_nested():
        user = User(**user_data)
        db.add(user)
        # 出 with 块时 SAVEPOINT 提交或回滚
    # 外层事务仍然进行中，需要后续 commit
    await db.commit()


# === 方式 4：用 engine.begin() 独立事务（不依赖 Session） ===
from async_database import async_engine

async def raw_update_stats():
    # 适合简单的、不需要 ORM 的批量操作
    async with async_engine.begin() as conn:
        await conn.execute(
            User.__table__.update()
            .where(User.is_active == True)
            .values(last_seen=datetime.utcnow())
        )
    # 出 with 块自动 commit
\`\`\`

事务的几个原则：

1. **事务尽量短**：长事务会锁住资源，影响并发。
2. **不要在事务里做慢操作**：比如调外部 API、发邮件——这些应该挪到事务外。
3. **失败要回滚**：忘记 rollback 会导致 Session 状态混乱，下一个 commit 会带上错误的改动。
4. **嵌套用 SAVEPOINT**：复杂业务可以分阶段提交，部分失败不影响整体。

## Demo 6：完整的异步 FastAPI 应用

把前面所有知识点串起来，写一个完整可运行的应用：

\`\`\`python
# 文件：async_main.py

from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from async_database import async_engine, AsyncSessionLocal
from async_models import Base, User, Post


# ---- Lifespan：应用启动/关闭时执行 ----
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动：建表（开发期用，生产用 Alembic）
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # 关闭：释放连接池
    await async_engine.dispose()


app = FastAPI(title="SQLAlchemy 异步示例", lifespan=lifespan)


# ---- Pydantic 模型 ----
class UserCreate(BaseModel):
    username: str
    email: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool

    class Config:
        from_attributes = True


class PostCreate(BaseModel):
    title: str
    body: str = ""


class PostOut(BaseModel):
    id: int
    title: str
    author_id: int

    class Config:
        from_attributes = True


# ---- 异步依赖：每请求一个 AsyncSession ----
async def get_db():
    async with AsyncSessionLocal() as db:
        # async with 自动在退出时关闭 Session
        # 用 try/except 保证出错时也能 rollback
        try:
            yield db
        except Exception:
            await db.rollback()
            raise
        # 正常退出不需要显式 commit，由路由决定


# ---- 路由 ----
@app.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    # 检查用户名唯一
    stmt = select(User).where(User.username == payload.username)
    exists = (await db.execute(stmt)).scalar_one_or_none()
    if exists:
        raise HTTPException(400, "用户名已存在")

    user = User(username=payload.username, email=payload.email)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@app.get("/users", response_model=List[UserOut])
async def list_users(db: AsyncSession = Depends(get_db)):
    stmt = select(User).order_by(User.id).limit(50)
    return (await db.execute(stmt)).scalars().all()


@app.get("/users/{user_id}", response_model=UserOut)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "用户不存在")
    return user


@app.post("/users/{user_id}/posts", response_model=PostOut, status_code=status.HTTP_201_CREATED)
async def create_post(user_id: int, payload: PostCreate, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "用户不存在")

    post = Post(title=payload.title, body=payload.body, author_id=user_id)
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post


# 关键：带文章一起返回
@app.get("/users/{user_id}/posts", response_model=List[PostOut])
async def list_user_posts(user_id: int, db: AsyncSession = Depends(get_db)):
    # 用 selectinload 预加载文章，避免懒加载
    stmt = (
        select(User)
        .options(selectinload(User.posts))
        .where(User.id == user_id)
    )
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user:
        raise HTTPException(404, "用户不存在")
    return user.posts
\`\`\`

## 异步开发的几个坑

### 坑 1：在 async 路由里调同步代码

\`\`\`python
# 错误：会阻塞事件循环
@app.get("/bad")
async def bad(db: AsyncSession = Depends(get_db)):
    # 同步的 requests 库会卡住事件循环
    import requests
    r = requests.get("https://slow-api.example.com")  # 阻塞！
    return r.json()

# 正确：用 httpx 异步
@app.get("/good")
async def good(db: AsyncSession = Depends(get_db)):
    import httpx
    async with httpx.AsyncClient() as client:
        r = await client.get("https://slow-api.example.com")
    return r.json()
\`\`\`

### 坑 2：忘了 await

\`\`\`python
# 错误：忘了 await，result 是个协程对象，不是数据
result = db.execute(stmt)  # 缺 await
print(result)  # <coroutine object>

# 正确
result = await db.execute(stmt)
\`\`\`

### 坑 3：commit 后访问关联对象

\`\`\`python
# 配置 expire_on_commit=False 之后，commit 不会让对象过期
# 但如果对象某些字段是从数据库默认值来的，仍然需要 refresh
user = User(username="bob")
db.add(user)
await db.commit()
# 此时 user.id 已经赋值（commit 时 flush 了）
# 但 user.created_at 可能没有——需要 refresh
await db.refresh(user)
\`\`\`

## 性能对比小实验

为了让大家有直观感受，给一组典型数据（来自真实压测）：

| 场景 | 同步 QPS | 异步 QPS |
|------|---------|---------|
| 纯内存计算 | 8000 | 7500（开销略大） |
| 单次数据库查询 | 3000 | 3500 |
| 3 次串行数据库查询 | 1200 | 3000（并发执行） |
| 调用外部 API（100ms） | 200 | 2500 |

可以看到：**IO 越多，异步收益越大**。CPU 密集任务异步反而稍慢（协程切换开销）。

## 本章小结

- 异步数据库用 \`create_async_engine\` + \`AsyncSession\` + \`async_sessionmaker\`。
- \`expire_on_commit=False\` 是异步标配，避免隐式重载。
- 异步下必须用预加载（selectinload / joinedload），不能用懒加载。
- 事务用 \`async with db.begin()\` 上下文管理器，自动 commit/rollback。
- FastAPI 用 \`async with AsyncSessionLocal()\` 依赖注入管理 Session。

下一章我们解决一个工程问题：当模型改了，怎么不丢数据地把数据库结构升级？这就是 Alembic。
`
  },

  // ============================================================
  // 第 25 章：数据库迁移与 Alembic
  // ============================================================
  {
    id: "fp-alembic",
    group: "数据库集成",
    icon: "🛤️",
    title: "数据库迁移与 Alembic",
    content: `# 数据库迁移与 Alembic

## 为什么需要迁移工具

到目前为止我们用 \`Base.metadata.create_all\` 建表，但这套方法有个致命问题：**它只能建表，不能改表**。

实际开发中，模型会一直变：

- 加字段：\`User\` 加一个 \`avatar_url\`。
- 改字段类型：\`Post.body\` 从 \`String(500)\` 改成 \`Text\`。
- 加索引：给 \`Post.title\` 加索引。
- 删字段：废弃 \`User.legacy_field\`。

如果用 \`create_all\`，它只看哪些表不存在就建，已经存在的表完全不动。结果就是：你改了模型，但数据库结构没变，运行时报"列不存在"错误。

那能不能 \`drop_all\` 再 \`create_all\`？可以——但数据全没了。生产环境这么干就是事故。

**数据库迁移工具** 解决的就是这个问题：它跟踪每次结构变更，生成可执行的"迁移脚本"，让你能**改结构不丢数据**。Alembic 是 SQLAlchemy 生态的标准迁移工具，由 SQLAlchemy 作者亲自维护。

### 类比：版本控制

把迁移工具类比成 Git：

- **Git**：跟踪代码变更，每次提交是一个 snapshot，可以前进/后退。
- **Alembic**：跟踪数据库结构变更，每次迁移是一个版本，可以 upgrade/downgrade。

你的数据库有一张 \`alembic_version\` 表，记录当前在哪个版本。Alembic 比较这个版本和最新版本，按顺序执行中间的迁移脚本，把数据库推到目标版本。

### 迁移工具能做什么

- **autogenerate**：扫描你的 ORM 模型，与数据库现状对比，自动生成迁移脚本。
- **upgrade**：把数据库升级到新版本。
- **downgrade**：把数据库降级到旧版本（重要！回滚时用）。
- **历史记录**：所有迁移版本按顺序保存，可以查看演变过程。
- **多人协作**：每个开发者生成的迁移脚本提交到 Git，团队共享同一份演变历史。

## Demo 1：安装与初始化

\`\`\`bash
# 1. 安装 alembic
pip install alembic

# 2. 在项目根目录初始化 Alembic
# 这会在当前目录创建 alembic.ini 和 alembic/ 目录
alembic init alembic

# 执行后会生成这样的结构：
# project/
# ├── alembic.ini         # Alembic 配置文件
# ├── alembic/
# │   ├── env.py          # 迁移环境配置（核心）
# │   ├── script.py.mako  # 迁移脚本模板
# │   └── versions/       # 迁移脚本存放目录（空）
# └── app/
#     └── models.py       # 你的 ORM 模型
\`\`\`

\`alembic.ini\` 里最关键的一行是 \`sqlalchemy.url\`，它告诉 Alembic 连哪个数据库。

\`\`\`ini
# alembic.ini 节选
[alembic]
# 数据库连接字符串
sqlalchemy.url = postgresql+psycopg2://user:pwd@localhost:5432/mydb
# 迁移脚本目录
script_location = alembic
\`\`\`

但**把数据库 URL 写死在 ini 里是坏实践**——密码会进 Git。生产中常用环境变量。

## Demo 2：配置 env.py 关联模型

Alembic 默认不知道你的 ORM 模型在哪——它需要一个"目标元数据"来对比。\`env.py\` 就是干这个的。

\`\`\`python
# 文件：alembic/env.py
# 这是 Alembic 自动生成的，我们需要修改几处

from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# === 关键修改 1：导入你的 Base 和模型 ===
# 必须导入所有模型，否则 autogenerate 检测不到
import os
import sys

# 把项目根目录加到 sys.path，方便 import
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# 从你的项目导入 Base 和所有模型
from app.database import Base
# 注意：必须 import 所有模型文件，即使看起来没用
# 因为只有 import 了，模型才会注册到 Base.metadata
from app.models import User, Post, Comment  # noqa: F401

# Alembic 配置对象
config = context.config

# === 关键修改 2：用环境变量覆盖数据库 URL ===
# 这样密码不会进 Git
database_url = os.getenv("DATABASE_URL")
if database_url:
    config.set_main_option("sqlalchemy.url", database_url)

# 日志配置
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 把你的 Base.metadata 给 Alembic
target_metadata = Base.metadata


# 下面是 Alembic 生成的 run_migrations_offline / run_migrations_online 函数
# 通常不需要改
def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
\`\`\`

几个关键点：

1. **必须 import 所有模型**：否则 autogenerate 不知道这些表存在，会以为要删表。
2. **target_metadata** 是 Alembic 的"目标"，它对比 \`target_metadata\` 和数据库现状，生成差异脚本。
3. **环境变量** 替代硬编码 URL，生产环境的标配。

## Demo 3：autogenerate 生成迁移脚本

\`\`\`bash
# 假设你刚给 User 加了一个 avatar_url 字段
# class User(Base):
#     ...
#     avatar_url = Column(String(500))  # 新增

# 生成迁移脚本
alembic revision --autogenerate -m "add avatar_url to user"

# 输出大概是这样：
# Generating /project/alembic/versions/a1b2c3d4_add_avatar_url_to_user.py ... done
\`\`\`

打开生成的脚本看看：

\`\`\`python
# 文件：alembic/versions/a1b2c3d4_add_avatar_url_to_user.py
# 这是 Alembic 自动生成的迁移脚本

"""add avatar_url to user

Revision ID: a1b2c3d4e5f6
Revises: 9z8y7x6w5v4u
Create Date: 2026-07-13 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# 修订 ID，每个迁移脚本唯一
revision = "a1b2c3d4e5f6"
# 上一个版本（构成链表）
down_revision = "9z8y7x6w5v4u"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # upgrade：怎么从旧版本变到新版本
    # op.alter_column / op.add_column / op.create_table 是 Alembic 的操作 API
    op.add_column("users", sa.Column("avatar_url", sa.String(500), nullable=True))


def downgrade() -> None:
    # downgrade：怎么回滚
    # 必须有 downgrade！否则不能回退
    op.drop_column("users", "avatar_url")
\`\`\`

**重要：autogenerate 不是万能的**，下面这些情况它检测不到：

1. **改字段类型**：把 \`String(50)\` 改成 \`String(100)\`，它能看到长度变化，但 \`String\` 改 \`Text\` 在某些数据库下检测不到。
2. **数据迁移**：autogenerate 只管结构，不管数据。如果你要把 \`is_active=False\` 的用户都删掉，需要手写 SQL。
3. **重命名**：把列 \`name\` 改成 \`username\`，autogenerate 会以为是"删 name 加 username"，数据会丢！需要手动改成 \`op.alter_column\`。
4. **检查约束变化**：CHECK 约束、外键约束的某些变化检测不到。

所以**生成的脚本必须人工审查**，不能盲目执行。

## Demo 4：upgrade 与 downgrade 操作

\`\`\`bash
# 升级到最新版本
alembic upgrade head

# 升级到指定版本
alembic upgrade a1b2c3d4e5f6

# 升级 +N 个版本
alembic upgrade +2

# 降级一个版本
alembic downgrade -1

# 降级到指定版本
alembic downgrade 9z8y7x6w5v4u

# 降级到最初（删除所有表）
alembic downgrade base

# 查看当前版本
alembic current

# 查看历史
alembic history

# 查看待执行的迁移
alembic history -r current:head
\`\`\`

注意几点：

- **生产环境升级前必须备份**：迁移脚本可能误删数据，备份是最后一道保险。
- **不要在生产用 downgrade**：downgrade 会丢数据，生产回滚应该用"前向修复"——写一个新的迁移脚本纠正问题，而不是倒回去。
- **head 是当前最新版本**，base 是初始状态。

## Demo 5：手写复杂迁移（带数据）

autogenerate 只能搞结构，数据迁移要手写。下面是个典型例子：把 \`User.status\` 字段从字符串改成枚举，并迁移数据。

\`\`\`python
# 文件：alembic/versions/b2c3d4e5f6g7_migrate_user_status.py
# 这个迁移把 status 从 String 改成 Integer，并转换数据

"""migrate user status from string to int

Revision ID: b2c3d4e5f6g7
Revises: a1b2c3d4e5f6
Create Date: 2026-07-13 13:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "b2c3d4e5f6g7"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. 加一个临时列 status_int
    op.add_column("users", sa.Column("status_int", sa.Integer(), nullable=True))

    # 2. 用 raw SQL 迁移数据
    # op.get_bind() 拿到当前 Connection，可以执行原生 SQL
    op.execute(
        """
        UPDATE users SET status_int = CASE
            WHEN status = 'active' THEN 1
            WHEN status = 'inactive' THEN 2
            WHEN status = 'banned' THEN 3
            ELSE 0
        END
        """
    )

    # 3. 删除旧列
    op.drop_column("users", "status")

    # 4. 把临时列改名成 status
    op.alter_column("users", "status_int", new_column_name="status",
                    nullable=False, server_default="1")


def downgrade() -> None:
    # 反向操作
    op.add_column("users", sa.Column("status_str", sa.String(20), nullable=True))
    op.execute(
        """
        UPDATE users SET status_str = CASE status
            WHEN 1 THEN 'active'
            WHEN 2 THEN 'inactive'
            WHEN 3 THEN 'banned'
            ELSE 'unknown'
        END
        """
    )
    op.drop_column("users", "status")
    op.alter_column("users", "status_str", new_column_name="status",
                    nullable=False, server_default="active")
\`\`\`

写迁移脚本的几条原则：

1. **每个迁移必须可逆**：upgrade 做的事，downgrade 必须能撤销。
2. **数据迁移用 op.execute + SQL**：直接执行 SQL 比 ORM 操作更可靠。
3. **大表加列要小心**：MySQL 给大表加 NOT NULL 列会锁表，可以分多步：先加 nullable 列、填数据、改 NOT NULL。
4. **一次只做一件事**：一个迁移脚本只改一处结构，不要把多个不相关的改动塞一起。

## Demo 6：常用 op API 速查

\`\`\`python
from alembic import op
import sqlalchemy as sa


def upgrade():
    # === 建表 ===
    op.create_table(
        "comments",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("body", sa.Text, nullable=False),
        sa.Column("post_id", sa.Integer, sa.ForeignKey("posts.id")),
    )

    # === 加列 ===
    op.add_column("users", sa.Column("bio", sa.Text))

    # === 删列 ===
    op.drop_column("users", "legacy_field")

    # === 改列（重命名 / 类型 / 约束） ===
    # 改列名
    op.alter_column("users", "name", new_column_name="full_name")
    # 改类型
    op.alter_column("users", "age",
                    existing_type=sa.String(10),
                    type_=sa.Integer(),
                    postgresql_using="age::integer")  # PG 专用 cast
    # 改可空
    op.alter_column("users", "email", nullable=False)

    # === 加索引 ===
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # === 删索引 ===
    op.drop_index("ix_users_email", table_name="users")

    # === 加外键 ===
    op.create_foreign_key(
        "fk_comments_post_id",      # 约束名
        "comments",                  # 子表
        "posts",                     # 父表
        ["post_id"],                 # 子表列
        ["id"],                      # 父表列
        ondelete="CASCADE",
    )

    # === 删表 ===
    op.drop_table("old_table")

    # === 执行原生 SQL ===
    op.execute("UPDATE users SET is_active = true WHERE is_active IS NULL")
\`\`\`

## Demo 7：在 FastAPI 项目里集成 Alembic

实际项目里，我们通常把数据库 URL 放在配置里，让 \`env.py\` 从配置读取，而不是 ini 文件。

\`\`\`python
# 文件：app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://user:pwd@localhost:5432/mydb"
    # Alembic 用同步 URL（即使应用是异步的）
    # 因为 Alembic 默认是同步的

    class Config:
        env_file = ".env"


settings = Settings()
\`\`\`

\`\`\`python
# 修改 alembic/env.py，从配置读取 URL
import os
from app.config import settings

# 覆盖配置
config.set_main_option("sqlalchemy.url", settings.database_url)
\`\`\`

\`\`\`bash
# 项目目录结构（推荐）
project/
├── alembic.ini
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       ├── 001_initial.py
│       ├── 002_add_avatar.py
│       └── 003_add_comments.py
├── app/
│   ├── __init__.py
│   ├── config.py          # 配置
│   ├── database.py        # Engine、Session
│   ├── models.py          # ORM 模型
│   └── main.py            # FastAPI 应用
├── tests/
├── pyproject.toml
└── README.md
\`\`\`

## 迁移最佳实践

### 1. 提交前先测一遍

每个迁移脚本在本地测试 \`upgrade\` + \`downgrade\` + \`upgrade\`，确保三个步骤都能正常执行。

### 2. 团队协作：合并冲突

两个开发者各自生成迁移，可能产生分叉。解决方法：

\`\`\`bash
# 假设你 pull 了远端，发现有新的迁移 m1
# 你本地生成的迁移 m2 基于旧的 head
# 这时需要 rebase：

# 1. 先 downgrade 到 m1
alembic downgrade m1

# 2. 删除你的 m2 脚本（或者修改 down_revision）
# 3. 重新 autogenerate
alembic revision --autogenerate -m "your change"
# 这次生成的脚本 down_revision 会是 m1

# 4. upgrade
alembic upgrade head
\`\`\`

### 3. 生产部署流程

\`\`\`bash
# CI/CD 流程里，部署新版本时
# 1. 拉新代码
git pull

# 2. 备份数据库（必须！）
pg_dump mydb > backup_$(date +%Y%m%d).sql

# 3. 跑迁移
alembic upgrade head

# 4. 重启应用
systemctl restart myapp

# 如果出问题，回滚：
# 1. 停应用
# 2. 恢复备份（不推荐 downgrade，因为可能丢数据）
# 3. 启动旧版本应用
\`\`\`

### 4. 标记迁移为"已应用"（不实际执行）

有时你的数据库已经手动改了结构，但 Alembic 不知道。这时可以"标记"为已应用：

\`\`\`bash
# 标记当前数据库为某个版本，但不执行迁移脚本
alembic stamp a1b2c3d4e5f6
\`\`\`

### 5. 命名规范

迁移脚本命名建议：

- \`001_initial_schema.py\`
- \`002_add_user_avatar.py\`
- \`003_create_comments_table.py\`
- \`004_migrate_user_status.py\`

用编号前缀便于排序，描述性名字便于理解。

## 本章小结

- 迁移工具让数据库结构变更可追踪、可回滚、不丢数据。
- Alembic 是 SQLAlchemy 标准迁移工具，由作者维护。
- 工作流：改模型 → \`alembic revision --autogenerate\` → 审查脚本 → \`alembic upgrade head\`。
- autogenerate 不是万能，复杂变更（重命名、数据迁移）要手写。
- 生产部署：备份 → 迁移 → 重启，出问题恢复备份而非 downgrade。

下一章我们关注性能——连接池调优、N+1 问题、索引优化。
`
  },

  // ============================================================
  // 第 26 章：连接池与性能优化
  // ============================================================
  {
    id: "fp-db-optimization",
    group: "数据库集成",
    icon: "🚀",
    title: "连接池与性能优化",
    content: `# 连接池与性能优化

## 性能问题的三大来源

Web 应用的数据库性能问题，几乎都来自这三类：

1. **连接管理**：连接太少不够用，太多压垮数据库。
2. **查询效率**：N+1 问题、缺少索引、扫全表。
3. **批量处理**：循环里发 SQL、一次取太多数据撑爆内存。

本章我们逐个攻克。先讲为什么需要连接池——这是理解后续所有调优的基础。

## 连接池：为什么需要它

每次建立数据库连接的代价是惊人的：

- **TCP 三次握手**：1 个 RTT（约 1ms 局域网，几十 ms 跨机房）。
- **TLS 握手**（如果用 HTTPS 到 DB）：2-4 个 RTT。
- **数据库认证**：1-2 个 RTT。
- **会话初始化**：分配后端进程（PostgreSQL 是 fork，MySQL 是线程）。

加起来建一次连接可能要 50-200ms。如果每个请求都新建连接，那 1000 QPS 的应用光建连接就要 50-200 秒/秒——根本不可能。

**连接池** 就是解决方案：预先建好一批连接放在池子里，请求来了借一条用完还回去。建连接的成本被摊薄到首次建池，后续只有"借/还"的开销（纳秒级）。

SQLAlchemy 内置连接池（\`QueuePool\`），关键参数有：

- \`pool_size\`：常驻连接数。
- \`max_overflow\`：超出 pool_size 后还能临时开多少。
- \`pool_timeout\`：池子满时等待多久才报错。
- \`pool_recycle\`：连接多久自动重建（避免数据库踢掉空闲连接）。
- \`pool_pre_ping\`：用前 ping 一下，避免拿到死连接。

## Demo 1：连接池参数调优

\`\`\`python
# 文件：pool_config.py

from sqlalchemy import create_engine

# === 默认配置（不推荐生产用） ===
# pool_size=5, max_overflow=10, pool_timeout=30
# 这意味着最多同时 15 个连接，等 30 秒拿不到就报错

# === 开发环境配置 ===
dev_engine = create_engine(
    "postgresql+psycopg2://user:pwd@localhost/dev",
    pool_size=5,
    max_overflow=5,
    pool_timeout=10,
    echo=False,
)

# === 生产环境配置（要算账） ===
# 计算思路：
# 1. 数据库能承受多少连接？PostgreSQL 默认 max_connections=100
# 2. 有几个应用实例？4 个 worker 各开一个池
# 3. 留出连接给 DBA、监控、迁移工具
# 4. 假设 PG 能给 60，4 个实例，每个实例 pool_size + max_overflow <= 15
prod_engine = create_engine(
    "postgresql+psycopg2://user:pwd@db.example.com/prod",
    pool_size=10,           # 常驻 10 个连接
    max_overflow=5,         # 高峰期临时加 5 个
    pool_timeout=30,        # 等连接超时
    pool_recycle=1800,      # 30 分钟回收一次，避免 MySQL 8 小时空闲断开
    pool_pre_ping=True,     # 用前 ping，避免拿到被防火墙杀掉的连接
    echo=False,
)

# === 极端场景：批处理脚本 ===
# 批处理不需要高并发，但要避免连接泄漏
batch_engine = create_engine(
    "postgresql+psycopg2://user:pwd@localhost/batch",
    pool_size=2,            # 2 个就够
    max_overflow=0,         # 不要临时开
    pool_timeout=60,        # 等久一点
    pool_recycle=600,       # 10 分钟回收
)
\`\`\`

几个调优心法：

1. **不是连接越多越快**：连接多了数据库反而要花精力调度，单连接吞吐下降。经验值：单实例 10-20 个连接。
2. **pool_recycle 比 max_idle_time 重要**：MySQL 默认 8 小时断开空闲连接，防火墙可能更短。设 30 分钟回收一次基本安全。
3. **pool_pre_ping 几乎没有代价**：每次借连接发一个 \`SELECT 1\`，1ms 不到，但能避免 99% 的"死连接"问题。
4. **max_overflow 是双刃剑**：高峰期能临时加连接，但如果设太大，数据库会被打爆。

## Demo 2：N+1 查询问题（最经典坑）

N+1 是 ORM 最经典的坑：你以为查一次，结果发了 N+1 次 SQL。

\`\`\`python
# 文件：n_plus_one.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, relationship, declarative_base
from sqlalchemy import Column, Integer, String, ForeignKey

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    posts = relationship("Post", back_populates="author")

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True)
    title = Column(String(200))
    author_id = Column(Integer, ForeignKey("users.id"))
    author = relationship("User", back_populates="posts")


engine = create_engine("sqlite:///n_plus_one.db")
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

# 准备测试数据
db = Session()
for i in range(10):
    u = User(name=f"user_{i}")
    u.posts = [Post(title=f"post_{i}_{j}") for j in range(3)]
    db.add(u)
db.commit()
db.close()

# === 错误写法：N+1 ===
db = Session()
users = db.query(User).all()  # 1 次 SQL：SELECT * FROM users
for u in users:               # 10 个用户
    print(u.name, len(u.posts))  # 每次访问 u.posts 触发 1 次 SQL
# 总共 1 + 10 = 11 次 SQL！
db.close()

# === 解决方案 1：joinedload ===
from sqlalchemy.orm import joinedload
db = Session()
users = (
    db.query(User)
    .options(joinedload(User.posts))
    .all()
)  # 1 次 SQL：SELECT * FROM users LEFT OUTER JOIN posts ON ...
for u in users:
    print(u.name, len(u.posts))  # 0 次额外 SQL
# 总共 1 次 SQL
db.close()

# === 解决方案 2：selectinload ===
from sqlalchemy.orm import selectinload
db = Session()
users = (
    db.query(User)
    .options(selectinload(User.posts))
    .all()
)  # 1 次 SQL：SELECT * FROM users
# 然后立即触发：SELECT * FROM posts WHERE author_id IN (1,2,3,...)
for u in users:
    print(u.name, len(u.posts))
# 总共 2 次 SQL
db.close()
\`\`\`

joinedload vs selectinload 怎么选？

- **joinedload**：1 次 SQL，但用 JOIN，结果集行数 = 父行 × 子行。子记录多时浪费带宽。
- **selectinload**：2 次 SQL，第二次用 IN 一次性拿所有子记录。结果集小，适合子记录多的场景。
- **多条一对多关系同时加载**：用 joinedload 会产生笛卡尔积（行数爆炸），必须用 selectinload。

经验：**默认 selectinload，一对一用 joinedload**。

## Demo 3：eager loading vs lazy loading

\`\`\`python
# 文件：loading_strategies.py

from sqlalchemy.orm import (
    relationship, joinedload, selectinload, subqueryload, lazyload, defaultload
)

# === 在模型定义时指定默认加载策略 ===
class User(Base):
    __tablename__ = "users_v2"
    id = Column(Integer, primary_key=True)
    name = Column(String(50))

    # lazy= 等价于 defaultload 的默认策略
    # "select" / True：懒加载（默认）
    # "joined"：每次查 User 自动 JOIN posts
    # "selectin"：每次查 User 自动发第二条 IN 查询
    # "subquery"：用子查询
    # "raise"：访问时抛异常（防止意外懒加载）
    # "noload"：永远不加载（返回空）
    posts = relationship(
        "Post",
        lazy="selectin",  # 默认 selectin 预加载
        back_populates="author",
    )


# === 在查询时覆盖默认策略 ===
# 即便模型默认 selectin，单次查询可以覆盖
db = Session()

# 强制懒加载（不推荐，但有时调试用）
users = db.query(User).options(lazyload(User.posts)).all()

# 强制 joinedload
users = db.query(User).options(joinedload(User.posts)).all()

# 强制不加载（提高性能，只查 User）
users = db.query(User).options(noload(User.posts)).all()

# 异步环境用 raise 防止意外懒加载
# 一旦访问 .posts 而没预加载，立刻报错
users = db.query(User).options(lazyload(User.posts)).all()
# print(users[0].posts)  # 抛异常

db.close()
\`\`\`

\`lazy="raise"\` 是异步开发的"安全带"——强制你显式预加载，避免运行时才发现懒加载问题。

## Demo 4：索引优化

索引是数据库性能的关键。没有索引的查询要扫全表，1 亿行数据可能要几秒；有索引只要毫秒。

\`\`\`python
# 文件：index_demo.py

from sqlalchemy import Column, Integer, String, DateTime, Index, func
from datetime import datetime

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True)
    title = Column(String(200))
    # 单列索引：加速 WHERE author_id = ?
    author_id = Column(Integer, index=True)
    # 唯一索引：加速 WHERE slug = ?，并保证唯一
    slug = Column(String(200), unique=True, index=True)
    # 不索引的字段：正文（太长，索引意义不大）
    body = Column(String)
    status = Column(String(20), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)

    # 复合索引：加速 WHERE author_id = ? AND status = ?
    # 顺序很重要：高选择性列在前
    __table_args__ = (
        Index("ix_articles_author_status", "author_id", "status"),
        # 函数索引（PostgreSQL）：加速 WHERE LOWER(slug) = ?
        Index("ix_articles_slug_lower", func.lower(slug)),
    )


# 什么时候建索引？
# 1. 经常出现在 WHERE 里的列
# 2. 经常用于 JOIN 的列（外键）
# 3. 经常用于 ORDER BY 的列
# 4. 经常用于 GROUP BY 的列

# 什么时候不要建索引？
# 1. 写多读少的表（每次写都要更新索引）
# 2. 区分度低的列（如性别，只有"男/女"）
# 3. 表很小（几百行的表，全表扫描也快）

# 查看查询是否用了索引（PostgreSQL）
# EXPLAIN ANALYZE SELECT * FROM articles WHERE author_id = 1;
# 如果看到 Seq Scan，说明没用索引
# 如果看到 Index Scan，说明用了索引
\`\`\`

复合索引的列顺序是个大学问，记住这条规则：**高选择性在前，等值查询在前，范围查询在后**。

例如查询 \`WHERE author_id = ? AND created_at > ?\`，索引应该是 \`(author_id, created_at)\`。如果反过来 \`(created_at, author_id)\`，因为 created_at 是范围查询，后面的 author_id 部分就用不上索引了。

## Demo 5：查询批量处理

当要处理大量数据时（比如导出 100 万行），一次性 \`all()\` 会撑爆内存。批量处理有几种方式：

\`\`\`python
# 文件：batch_processing.py

from sqlalchemy import select
from database import SessionLocal, engine
from models import User

# === 方式 1：分页（limit + offset） ===
def batch_by_pagination(batch_size=1000):
    db = SessionLocal()
    try:
        offset = 0
        while True:
            # 每次 LIMIT 1000 OFFSET N
            # 注意：offset 大了会很慢（数据库要扫过前面所有行）
            batch = (
                db.query(User)
                .order_by(User.id)
                .offset(offset)
                .limit(batch_size)
                .all()
            )
            if not batch:
                break
            for user in batch:
                process(user)
            offset += batch_size
    finally:
        db.close()


# === 方式 2：键集分页（推荐） ===
# 用上一批最后一条的 id 作为下一次的起点
# 比 offset 高效得多，因为不需要扫前面的行
def batch_by_keyset(batch_size=1000):
    db = SessionLocal()
    try:
        last_id = 0
        while True:
            # WHERE id > last_id ORDER BY id LIMIT N
            # 这能利用主键索引，O(log N) 定位起点
            batch = (
                db.query(User)
                .filter(User.id > last_id)
                .order_by(User.id)
                .limit(batch_size)
                .all()
            )
            if not batch:
                break
            for user in batch:
                process(user)
            last_id = batch[-1].id  # 记下最后一条
    finally:
        db.close()


# === 方式 3：yield_per（流式加载） ===
# SQLAlchemy 提供 yield_per，每次从数据库取 N 条
def batch_by_yield_per(batch_size=1000):
    db = SessionLocal()
    try:
        # yield_per 内部用 server-side cursor
        # 不会一次性把所有结果加载到内存
        query = db.query(User).yield_per(batch_size)
        for user in query:
            process(user)
    finally:
        db.close()


# === 方式 4：批量更新（用 update 语句） ===
from sqlalchemy import update

def batch_update():
    db = SessionLocal()
    try:
        # 一条 UPDATE 语句搞定，比循环快得多
        stmt = (
            update(User)
            .where(User.is_active == False)
            .values(is_active=True)
            .execution_options(synchronize_session=False)
        )
        result = db.execute(stmt)
        db.commit()
        print(f"更新了 {result.rowcount} 行")
    finally:
        db.close()


# === 方式 5：批量插入（用 bulk_insert_mappings） ===
def bulk_insert():
    db = SessionLocal()
    try:
        # 适合大批量初始数据导入
        # 比 add + commit 快 10 倍以上
        users = [
            {"username": f"user_{i}", "email": f"u{i}@e.com"}
            for i in range(10000)
        ]
        db.bulk_insert_mappings(User, users)
        db.commit()
    finally:
        db.close()


def process(user):
    # 模拟处理逻辑
    pass
\`\`\`

几个性能对比（10 万行 User）：

| 方法 | 耗时 | 内存 |
|------|------|------|
| \`all()\` 一次加载 | 5s | 800MB |
| offset 分页 | 8s（offset 大了慢） | 50MB |
| 键集分页 | 3s | 50MB |
| yield_per | 3s | 50MB |
| bulk_insert | 0.5s | 50MB |

经验：**生产环境用键集分页或 yield_per，初始化数据用 bulk_insert**。

## Demo 6：数据库健康检查与监控

部署到生产后，要能监控数据库状态，及时发现问题。

\`\`\`python
# 文件：health_check.py

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.pool import QueuePool
from datetime import datetime

app = FastAPI()

def get_db():
    from database import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# === 健康检查端点 ===
@app.get("/health/db")
def db_health(db: Session = Depends(get_db)):
    """检查数据库连接是否正常"""
    try:
        # 发一条简单的 SQL，能执行就说明连接正常
        result = db.execute(text("SELECT 1")).scalar()
        return {
            "status": "healthy",
            "database": "reachable",
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        # 连不上数据库
        raise HTTPException(
            status_code=503,
            detail=f"Database unreachable: {str(e)}"
        )


# === 连接池监控端点 ===
@app.get("/health/pool")
def pool_stats():
    """查看连接池状态"""
    from database import engine

    # 只对 QueuePool 有效
    if not isinstance(engine.pool, QueuePool):
        return {"error": "engine.pool is not a QueuePool"}

    pool = engine.pool
    return {
        "pool_size": pool.size(),         # 配置的 pool_size
        "checked_in": pool.checkedin(),    # 当前池里空闲连接数
        "checked_out": pool.checkedout(),  # 当前被借出的连接数
        "overflow": pool.overflow(),       # 当前临时连接数
        "checked_out_total": pool.checkedout() + pool.overflow(),
    }


# === 慢查询日志（用 SQLAlchemy 事件） ===
from sqlalchemy import event
import logging
import time

logger = logging.getLogger("sqlalchemy.slow")
logger.setLevel(logging.WARNING)


def setup_slow_query_log(engine, threshold_ms=100):
    """记录超过阈值的慢查询"""
    @event.listens_for(engine, "before_cursor_execute")
    def before_execute(conn, cursor, statement, parameters, context, executemany):
        context._start_time = time.time()

    @event.listens_for(engine, "after_cursor_execute")
    def after_execute(conn, cursor, statement, parameters, context, executemany):
        duration = (time.time() - context._start_time) * 1000
        if duration > threshold_ms:
            logger.warning(
                f"Slow query ({duration:.1f}ms): {statement[:200]}..."
            )


# 在应用启动时调用
# from database import engine
# setup_slow_query_log(engine, threshold_ms=200)


# === 数据库统计信息端点 ===
@app.get("/health/stats")
def db_stats(db: Session = Depends(get_db)):
    """获取关键表的行数（PostgreSQL）"""
    try:
        stats = {}
        # 查询各表行数
        tables = ["users", "posts", "comments"]
        for table in tables:
            result = db.execute(text(f"SELECT count(*) FROM {table}"))
            stats[table] = result.scalar()
        # 查询数据库大小
        result = db.execute(text("SELECT pg_size_pretty(pg_database_size(current_database()))"))
        stats["db_size"] = result.scalar()
        return stats
    except Exception as e:
        raise HTTPException(500, detail=str(e))
\`\`\`

监控的关键指标：

1. **连接池使用率**：\`checked_out / (pool_size + max_overflow)\`。接近 1 说明池快满了，要么加 pool_size，要么排查慢查询。
2. **慢查询数**：超过 200ms 的查询都要审查。
3. **数据库 CPU/内存**：用 PostgreSQL 的 \`pg_stat_activity\` 看活跃连接数。
4. **错误率**：连接超时、死锁、约束冲突的频率。

## Demo 7：完整的性能优化清单

把前面所有优化整合到一个示例：

\`\`\`python
# 文件：optimized_app.py

from typing import List
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import select, Index, func
from sqlalchemy.orm import Session, selectinload, joinedload
from pydantic import BaseModel

from database import engine, SessionLocal, Base
from models import User, Post


app = FastAPI(title="性能优化示例")


# 1. 配置连接池（在 database.py 里）
# engine = create_engine(
#     DATABASE_URL,
#     pool_size=10,
#     max_overflow=5,
#     pool_recycle=1800,
#     pool_pre_ping=True,
# )


# 2. 模型层面优化：建索引
class Article(Base):
    __tablename__ = "articles_v2"
    id = Column(Integer, primary_key=True)
    author_id = Column(Integer, ForeignKey("users.id"), index=True)  # 外键索引
    title = Column(String(200))
    status = Column(String(20), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    __table_args__ = (
        # 复合索引：常用 WHERE + ORDER BY
        Index("ix_author_status_created", "author_id", "status", "created_at"),
    )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Pydantic 响应模型
class UserWithPosts(BaseModel):
    id: int
    username: str
    post_count: int
    recent_posts: List[dict]

    class Config:
        from_attributes = True


# 3. 路由层面：避免 N+1
@app.get("/users/{user_id}/summary", response_model=UserWithPosts)
def user_summary(user_id: int, db: Session = Depends(get_db)):
    # 用 selectinload 一次拿到用户和文章
    stmt = (
        select(User)
        .options(selectinload(User.posts))
        .where(User.id == user_id)
    )
    user = db.execute(stmt).scalar_one_or_none()
    if not user:
        raise HTTPException(404, "用户不存在")

    # 文章已在内存，不再发 SQL
    recent = sorted(user.posts, key=lambda p: p.id, reverse=True)[:5]
    return {
        "id": user.id,
        "username": user.username,
        "post_count": len(user.posts),
        "recent_posts": [{"id": p.id, "title": p.title} for p in recent],
    }


# 4. 批量端点：用聚合查询而不是加载对象
@app.get("/stats/users")
def users_stats(db: Session = Depends(get_db)):
    # 用 SQL 聚合，不在 Python 里循环
    stmt = select(
        func.count(User.id).label("total"),
        func.count(User.id).filter(User.is_active == True).label("active"),
    )
    result = db.execute(stmt).one()
    return {
        "total": result.total,
        "active": result.active,
        "inactive": result.total - result.active,
    }


# 5. 分页：用键集分页
@app.get("/users")
def list_users(after_id: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    # WHERE id > after_id ORDER BY id LIMIT N
    # 比 offset 高效
    stmt = (
        select(User)
        .where(User.id > after_id)
        .order_by(User.id)
        .limit(limit)
    )
    users = db.execute(stmt).scalars().all()
    return [
        {"id": u.id, "username": u.username, "email": u.email}
        for u in users
    ]


# 6. 批量操作端点
@app.post("/admin/activate-all")
def activate_all(db: Session = Depends(get_db)):
    # 一条 UPDATE，不加载任何对象
    from sqlalchemy import update
    stmt = (
        update(User)
        .where(User.is_active == False)
        .values(is_active=True)
        .execution_options(synchronize_session=False)
    )
    result = db.execute(stmt)
    db.commit()
    return {"activated": result.rowcount}
\`\`\`

## 性能优化决策树

遇到性能问题时按这个顺序排查：

1. **是不是 N+1？** 用 \`echo=True\` 看 SQL 日志，如果一次请求产生几十条 SQL，多半是 N+1。解决：用 selectinload / joinedload。
2. **有没有索引？** 用 EXPLAIN 看执行计划，如果 Seq Scan 就加索引。
3. **是不是扫太多行？** 查询返回 100 万行肯定慢。解决：分页、限制 limit、用聚合查询。
4. **连接池够不够？** 看监控的 checked_out，如果经常等于 pool_size + max_overflow，就要调大池子。
5. **数据库本身慢吗？** CPU 100%？磁盘 IO 满了？这是数据库层面的问题，可能要扩容、加从库。

## 本章小结

- 连接池调优：\`pool_size\` 按数据库容量算，\`pool_pre_ping=True\`、\`pool_recycle=1800\` 是标配。
- N+1 是 ORM 最经典的坑，用 \`selectinload\` / \`joinedload\` 解决。
- 索引要建在高选择性、经常 WHERE/JOIN/ORDER 的列上，复合索引顺序很重要。
- 批量处理用键集分页或 yield_per，不要一次性 all()。
- 监控连接池、慢查询、错误率，是发现问题的眼睛。

至此数据库集成 4 章结束。下一批我们进入认证与安全——OAuth2、JWT、RBAC、API Key，让你的 API 既开放又安全。
`
  }
];
