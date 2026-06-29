// =============================================================
// Python Web 后端开发教程 —— 第二批章节（数据库篇，共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. pyweb-sqlalchemy   — SQLAlchemy 2.0 核心概念
//   2. pyweb-db-integration — FastAPI 数据库集成
//   3. pyweb-alembic      — Alembic 数据库迁移
//   4. pyweb-async-db     — 异步数据库实战
//   5. pyweb-structure    — 项目结构与分层架构
//
// 技术栈：Python 3.11+ / FastAPI 0.110+ / SQLAlchemy 2.0+ /
//         Alembic / Pydantic v2 / aiosqlite
//
// 格式约定：
//   - content 为反引号模板字符串
//   - content 内部所有反引号必须转义为 \`
//   - 代码块围栏写作 \`\`\`
//   - 围绕"博客系统 API"项目展开
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：SQLAlchemy 2.0 核心概念
  // =========================================================
  {
    id: "pyweb-sqlalchemy",
    group: "数据库",
    icon: "🗄️",
    title: "SQLAlchemy 2.0 核心概念",
    content: `
## 为什么需要 ORM

在传统的数据库开发中，我们需要手写 SQL 语句，然后把结果集手动映射成对象。这种方式有几个明显的痛点：**SQL 字符串与业务代码混杂**导致维护困难；**字段映射重复枯燥**，每张表都要写一遍近乎相同的转换逻辑；**SQL 注入风险**始终存在，稍有不慎就会拼接出危险语句；**数据库方言不统一**，切换数据库时几乎要重写所有 SQL。

**ORM（Object-Relational Mapping，对象关系映射）** 的核心思想是：把数据库里的**表**映射成程序里的**类**，把**行**映射成**对象**，把**列**映射成**属性**。这样你只需要操作 Python 对象，ORM 会自动帮你生成对应的 SQL 并执行。使用 ORM 后，业务代码不再混杂 SQL 字符串，字段映射由框架自动完成，参数化查询天然防止注入，而且不同数据库的方言差异被 ORM 抽象层吸收。

当然 ORM 不是银弹。对于极其复杂的统计查询、需要极致性能的批量操作，手写 SQL 往往更直接高效。SQLAlchemy 提供了**核心层（Core）**和**ORM 层**两个层次，你可以在 ORM 中随时下沉到 Core 甚至原生 SQL，做到"该抽象时抽象，该下沉时下沉"。

| 对比维度 | 原生 SQL | ORM（SQLAlchemy） |
| --- | --- | --- |
| **开发效率** | 低，手写映射 | 高，对象操作 |
| **可维护性** | SQL 散落各处 | 模型集中定义 |
| **SQL 注入** | 需手动防护 | 参数化查询天然安全 |
| **数据库迁移** | 改 SQL | 改模型 + 迁移工具 |
| **性能** | 极致可控 | 有额外开销，可优化 |
| **学习曲线** | SQL 本身 | ORM API + SQL |
| **复杂查询** | 灵活直接 | 复杂时需下沉 |

## SQLAlchemy 2.0 的新特性

SQLAlchemy 2.0 是一次重大升级，它在**类型提示、API 一致性、异步支持**等方面做了全面革新。最直观的变化是模型定义方式和查询 API 都全面现代化了。

### 1. DeclarativeBase 取代 declarative_base

在 1.x 时代，我们用 \`declarative_base()\` 工厂函数生成基类：

\`\`\`python
# 旧写法（1.x，已不推荐）
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
\`\`\`

2.0 推荐直接继承 \`DeclarativeBase\`，这与 Pydantic、dataclass 的风格一致，也方便类型检查器推断：

\`\`\`python
# 新写法（2.0，推荐）
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    # 下面用 Mapped + mapped_column 定义列
\`\`\`

### 2. Mapped 与 mapped_column

2.0 引入了 \`Mapped[T]\` 类型注解和 \`mapped_column()\` 配置函数。**类型即文档**：一眼就能看出 \`name\` 是 \`str\`、\`age\` 是 \`int\`、\`created_at\` 是 \`datetime\`。类型检查器（mypy / pyright）也能据此做静态检查。

\`\`\`python
from datetime import datetime
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    age: Mapped[int | None] = mapped_column(default=None)  # 可空整型
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)
\`\`\`

\`Mapped[int | None]\` 表示该列可空（对应数据库 \`NULL\`），\`Mapped[int]\` 表示非空（\`NOT NULL\`）。这比旧的 \`nullable=True\` 更直观。

### 3. select() 语句取代 query()

1.x 的 \`session.query(User).filter(...)\` 风格已被标记为 legacy。2.0 统一使用 \`select()\` 构造查询，无论 ORM 还是 Core 都用同一套 API：

\`\`\`python
# 旧写法（legacy）
users = session.query(User).filter(User.age > 18).all()

# 新写法（2.0）
from sqlalchemy import select
stmt = select(User).where(User.age > 18)
users = session.scalars(stmt).all()
\`\`\`

\`select()\` 风格的好处是：返回的是语句对象，可以灵活组合、打印调试、传递给其他函数，符合"声明式"编程思想。

## Engine：数据库连接的引擎

**Engine** 是 SQLAlchemy 与数据库通信的入口。它内部维护一个**连接池**，负责创建、复用、回收数据库连接。一个 Engine 由三部分组成：**URL（数据库地址）**、**Dialect（方言）**、**Pool（连接池）**。

\`\`\`python
from sqlalchemy import create_engine

# 同步引擎（SQLite）
engine = create_engine(
    "sqlite:///blog.db",
    echo=True,           # 打印执行的 SQL，调试时很有用
    pool_size=5,         # 连接池大小（SQLite 不真正用连接池，但其他库会用到）
    pool_pre_ping=True,  # 取连接前先 ping 一下，避免拿到已断开的连接
)
\`\`\`

URL 的格式决定了使用哪个驱动：\`sqlite:///blog.db\` 是同步 SQLite，\`sqlite+aiosqlite:///blog.db\` 是异步 SQLite，\`postgresql+asyncpg://user:pass@host/db\` 是异步 PostgreSQL。Engine 是**进程级单例**，整个应用共享一个即可，不要每次查询都新建。

## Session：与数据库对话的工作单元

**Session** 是 ORM 操作的载体。你可以把它理解成"工作单元（Unit of Work）"：你在 Session 上对对象做的增删改，并不会立即落到数据库，而是先暂存在内存中；调用 \`session.commit()\` 时，Session 会把所有变更**一次性**提交，出错则 \`rollback()\` 回滚。这种"批处理"模式既减少了数据库往返次数，又保证了事务的原子性。

\`\`\`python
from sqlalchemy.orm import Session

# 同步 Session 的基本用法
with Session(engine) as session:
    # 1. 创建：把对象加入 Session
    user = User(name="张三", age=25)
    session.add(user)
    # 此时还没写库，user.id 还是 None

    # 2. 查询
    stmt = select(User).where(User.name == "张三")
    found = session.scalars(stmt).first()

    # 3. 修改：直接改对象属性
    found.age = 26

    # 4. 删除
    # session.delete(found)

    # 5. 提交：增、改、删一次性落库
    session.commit()
\`\`\`

Session **不是线程安全**的，多线程环境下每个线程要用独立的 Session。在 FastAPI 中，我们通常用依赖注入为每个请求创建一个 Session。

## 模型定义：博客三表模型

下面定义博客系统的三张核心表：**User（用户）**、**Post（文章）**、**Comment（评论）**。它们构成一对多关系：一个用户有多篇文章，一篇文章有多条评论。

\`\`\`python filename="models.py"
from datetime import datetime
from typing import Optional
from sqlalchemy import String, ForeignKey, Text, func
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column, relationship,
)


class Base(DeclarativeBase):
    """所有模型的基类，继承 DeclarativeBase 即可启用 2.0 风格。"""
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    # String(50) 限制长度，索引加速按用户名查询
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(120), unique=True)
    # 可空字段用 Optional / None 标注
    bio: Mapped[Optional[str]] = mapped_column(Text, default=None)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),  # 数据库端默认值
    )

    # 一对多：一个用户有多篇文章
    # back_populates 双向绑定，posts 属性访问文章列表
    posts: Mapped[list["Post"]] = relationship(
        back_populates="author", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User {self.username}>"


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), index=True)
    content: Mapped[str] = mapped_column(Text)
    # 外键指向 users.id；ON DELETE CASCADE 由数据库处理
    author_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    published: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    # 多对一：文章归属某用户
    author: Mapped["User"] = relationship(back_populates="posts")
    # 一对多：文章有多条评论
    comments: Mapped[list["Comment"]] = relationship(
        back_populates="post", cascade="all, delete-orphan"
    )
    # 多对多：文章与标签（见下方 association_table）
    tags: Mapped[list["Tag"]] = relationship(
        secondary="post_tags", back_populates="posts"
    )

    def __repr__(self) -> str:
        return f"<Post {self.title}>"


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    body: Mapped[str] = mapped_column(Text)
    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE")
    )
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    post: Mapped["Post"] = relationship(back_populates="comments")

    def __repr__(self) -> str:
        return f"<Comment {self.body[:20]}>"


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(30), unique=True)

    posts: Mapped[list["Post"]] = relationship(
        secondary="post_tags", back_populates="tags"
    )
\`\`\`

## 多对多关系：文章与标签

多对多需要一张**关联表（association table）**。下面的 \`post_tags\` 表只有两个外键列，没有自己的业务字段。在 2.0 中推荐用 \`Table\` 直接定义关联表，然后在 relationship 里用 \`secondary\` 指向它。

\`\`\`python
from sqlalchemy import Table, Column, ForeignKey

# 关联表：文章 <-> 标签（多对多）
post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)
\`\`\`

定义好关系后，操作就非常自然：\`post.tags.append(tag)\` 会自动在关联表插入一行；\`user.posts\` 会自动查出该用户的所有文章。

## 懒加载 vs Eager Loading

默认情况下，\`relationship\` 是**懒加载（lazy）**的：访问 \`user.posts\` 时才发起 SQL 查询。这很方便，但有两个隐患：**N+1 查询问题**——循环遍历 N 个用户访问各自的 posts，会触发 N 次额外查询；**游离会话问题**——Session 关闭后再访问关系属性会报错。

| 加载策略 | 关键字 | 何时发 SQL | 适用场景 |
| --- | --- | --- | --- |
| **懒加载** | lazy="select"（默认） | 访问属性时 | 不一定用到关系 |
| **selectinload** | lazy="selectin" | 一次 IN 查询加载所有 | 一对多，集合 |
| **joinedload** | lazy="joined" | JOIN 一次查全 | 多对一，单值 |
| **subqueryload** | lazy="subquery" | 子查询加载 | 一对多，集合 |
| **raise** | lazy="raise" | 访问即抛错 | 强制显式加载 |

下面演示如何在查询时**显式指定**加载策略，避免 N+1：

\`\`\`python
from sqlalchemy.orm import selectinload, joinedload

# ❌ 危险：N+1 查询
users = session.scalars(select(User)).all()
for u in users:
    print(u.username, len(u.posts))  # 每个用户都触发一次 posts 查询

# ✅ selectinload：用 IN 查询一次性加载所有 posts
stmt = select(User).options(selectinload(User.posts))
users = session.scalars(stmt).unique().all()
for u in users:
    print(u.username, len(u.posts))  # 不再额外查询

# ✅ 嵌套加载：同时加载 posts 和 posts 的 comments
stmt = (
    select(User)
    .options(selectinload(User.posts).selectinload(Post.comments))
)
users = session.scalars(stmt).unique().all()

# ✅ joinedload：多对一关系用 JOIN 更高效
stmt = select(Post).options(joinedload(Post.author))
posts = session.scalars(stmt).unique().all()
for p in posts:
    print(p.title, p.author.username)  # 不再额外查询
\`\`\`

经验法则：**一对多/集合关系用 selectinload**（IN 查询不会产生笛卡尔积），**多对一/单值关系用 joinedload**（JOIN 不会行数膨胀）。在 API 层返回嵌套数据时，务必显式指定 eager loading，否则前端拿到的可能是残缺数据或触发延迟查询报错。

## 小结

本章建立了 SQLAlchemy 2.0 的心智模型：**Engine 管连接、Session 管事务、Model 映射表、relationship 描述关系、select 构造查询**。2.0 的 \`DeclarativeBase\` + \`Mapped\` + \`mapped_column\` 让模型定义类型安全且现代；\`select()\` 语句让查询构造统一且可组合。理解了懒加载的代价，才能在 API 层正确选择 \`selectinload\` / \`joinedload\` 避免 N+1。下一章我们把这套模型接到 FastAPI 上，做成完整的数据库集成。
`
  },

  // =========================================================
  // 第二章：FastAPI 数据库集成
  // =========================================================
  {
    id: "pyweb-db-integration",
    group: "数据库",
    icon: "🔗",
    title: "FastAPI 数据库集成",
    content: `
## 同步 vs 异步数据库

FastAPI 本身是异步框架，但数据库访问可以是同步也可以是异步。两种方式各有取舍：

| 维度 | 同步数据库 | 异步数据库 |
| --- | --- | --- |
| **驱动** | sqlite3 / psycopg2 | aiosqlite / asyncpg |
| **引擎** | create_engine | create_async_engine |
| **会话** | Session | AsyncSession |
| **函数** | 普通 def | async def + await |
| **阻塞** | 会阻塞事件循环 | 不阻塞 |
| **吞吐** | 低（线程池兜底） | 高（真并发） |
| **生态** | 成熟稳定 | 主流库已支持 |
| **调试** | 简单 | 需注意异步上下文 |

在 FastAPI 中，即便路由是 \`async def\`，如果用同步数据库驱动，SQL 执行时仍会阻塞事件循环（FastAPI 会把同步 \`def\` 路由丢到线程池，但 \`async def\` 里调同步 DB 不会）。**对于 I/O 密集的 Web API，推荐异步数据库**，让一个事件循环能同时处理大量并发请求。本章用 \`aiosqlite\`（异步 SQLite 驱动）做演示，生产环境可换成 \`asyncpg\`（PostgreSQL）。

## 数据库配置模块

把数据库相关的"基础设施"集中到一个模块，避免到处散落引擎和会话工厂。下面是博客项目的 \`database.py\`：

\`\`\`python filename="database.py"
from sqlalchemy.ext.asyncio import (
    AsyncSession, create_async_engine, async_sessionmaker,
)
from sqlalchemy.orm import DeclarativeBase


# 1. 异步引擎：进程级单例
# sqlite+aiosqlite 指定异步驱动；echo=False 关闭 SQL 日志（生产环境）
engine = create_async_engine(
    "sqlite+aiosqlite:///./blog.db",
    echo=False,
    future=True,
)

# 2. 异步会话工厂：每次调用生成一个新 AsyncSession
# expire_on_commit=False 让提交后对象仍可用（异步下避免二次查询）
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# 3. 模型基类：所有 ORM 模型继承它
class Base(DeclarativeBase):
    pass


# 4. 建表辅助函数（开发期用，生产用 Alembic）
async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
\`\`\`

几个关键点：\`create_async_engine\` 的 URL 必须带异步驱动前缀（\`sqlite+aiosqlite\`）；\`async_sessionmaker\` 是 2.0 推荐的会话工厂写法；\`expire_on_commit=False\` 在异步场景下很重要——默认情况下 commit 后对象会"过期"，下次访问属性会触发懒加载查询，但异步下没有活动的事务上下文会报错，关闭过期可避免这个坑。

## 会话依赖：每个请求一个 Session

FastAPI 的依赖注入系统非常适合管理 Session 生命周期。我们写一个 \`get_db\` 依赖，用 \`yield\` 保证请求结束后 Session 一定被关闭：

\`\`\`python filename="deps.py"
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from database import async_session_factory


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """每个请求获取一个独立的 AsyncSession，请求结束自动关闭。"""
    async with async_session_factory() as session:
        try:
            yield session
            # 路由函数正常返回后，统一提交
            await session.commit()
        except Exception:
            # 出错回滚，保证事务原子性
            await session.rollback()
            raise
        finally:
            # finally 确保会话关闭，归还连接
            await session.close()
\`\`\`

\`yield\` 依赖的妙处在于：\`yield\` 之前是请求前置逻辑，\`yield\` 之后是请求后置逻辑（无论成功失败都会执行）。这样事务的"提交或回滚"被集中管理，路由函数只管业务，不用操心事务边界。

## CRUD 操作封装

把对单张表的增删改查封装成函数，路由层只调用这些函数，不直接写 SQL。下面是文章（Post）的完整 CRUD：

\`\`\`python filename="crud/post.py"
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from models import Post


async def create_post(
    db: AsyncSession, title: str, content: str, author_id: int
) -> Post:
    """新增文章。add 后 flush 让 id 生成，但不提交（由依赖负责）。"""
    post = Post(title=title, content=content, author_id=author_id)
    db.add(post)
    await db.flush()        # 让 post.id 可用，但不落库
    await db.refresh(post)  # 加载服务端默认值（created_at 等）
    return post


async def get_post(db: AsyncSession, post_id: int) -> Post | None:
    """按主键查单条，同时用 joinedload 预加载 author 避免 N+1。"""
    stmt = (
        select(Post)
        .where(Post.id == post_id)
        .options(joinedload(Post.author))
    )
    return (await db.execute(stmt)).scalar_one_or_none()


async def list_posts(
    db: AsyncSession, skip: int = 0, limit: int = 20
) -> list[Post]:
    """分页查询文章列表，按创建时间倒序。"""
    stmt = (
        select(Post)
        .order_by(Post.created_at.desc())
        .offset(skip)
        .limit(limit)
        .options(selectinload(Post.author))
    )
    return list((await db.execute(stmt)).scalars().all())


async def update_post(
    db: AsyncSession, post_id: int, **fields
) -> Post | None:
    """按字段更新文章；只更新 fields 里出现的列。"""
    post = await db.get(Post, post_id)
    if post is None:
        return None
    for key, value in fields.items():
        # 只更新显式传入且确实属于模型的字段
        if hasattr(post, key) and value is not None:
            setattr(post, key, value)
    await db.flush()
    return post


async def delete_post(db: AsyncSession, post_id: int) -> bool:
    """删除文章，返回是否删除成功。"""
    post = await db.get(Post, post_id)
    if post is None:
        return False
    await db.delete(post)
    await db.flush()
    return True


async def count_posts(db: AsyncSession) -> int:
    """统计文章总数，用于分页元信息。"""
    stmt = select(func.count()).select_from(Post)
    return (await db.execute(stmt)).scalar_one()
\`\`\`

注意几个异步特有的细节：\`await db.execute(stmt)\` 返回 \`Result\` 对象，要用 \`.scalars()\` 取标量、\`.scalar_one()\` 取唯一值；\`db.get(Model, pk)\` 是按主键查的快捷方法；\`flush\` 把变更发到数据库但**不提交**，方便在事务中拿到自增 id；\`refresh\` 重新加载对象的服务端默认值。

## 路由层：把 CRUD 接到 HTTP

有了 CRUD 函数，路由层就非常薄，只做"参数解析 + 调用 + 响应序列化"：

\`\`\`python filename="routers/post.py"
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from deps import get_db
import crud.post as post_crud

router = APIRouter(prefix="/posts", tags=["文章"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_post(
    title: str, content: str, author_id: int,
    db: AsyncSession = Depends(get_db),
):
    post = await post_crud.create_post(db, title, content, author_id)
    return {"id": post.id, "title": post.title}


@router.get("/")
async def list_posts(
    skip: int = 0, limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    posts = await post_crud.list_posts(db, skip, limit)
    total = await post_crud.count_posts(db)
    return {"items": [p.id for p in posts], "total": total}


@router.get("/{post_id}")
async def get_post(post_id: int, db: AsyncSession = Depends(get_db)):
    post = await post_crud.get_post(db, post_id)
    if post is None:
        raise HTTPException(404, "文章不存在")
    return {"id": post.id, "title": post.title, "author": post.author.username}


@router.put("/{post_id}")
async def update_post(
    post_id: int, title: str | None = None, content: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    post = await post_crud.update_post(
        db, post_id, title=title, content=content
    )
    if post is None:
        raise HTTPException(404, "文章不存在")
    return {"id": post.id, "title": post.title}


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: int, db: AsyncSession = Depends(get_db)):
    ok = await post_crud.delete_post(db, post_id)
    if not ok:
        raise HTTPException(404, "文章不存在")
    return None
\`\`\`

## 分页查询

分页是列表 API 的标配。常用的有两种风格：**offset/limit 偏移分页**简单直观但深翻性能差；**游标分页（cursor）** 用上一页最后一条的排序值作为锚点，深翻稳定但不支持跳页。

\`\`\`python filename="crud/page.py"
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import Post


async def paginate_offset(
    db: AsyncSession, page: int = 1, size: int = 20
) -> dict:
    """offset/limit 偏移分页：page 从 1 开始。"""
    if page < 1 or size < 1 or size > 100:
        raise ValueError("分页参数非法")
    skip = (page - 1) * size
    stmt = (
        select(Post)
        .order_by(Post.id.desc())
        .offset(skip)
        .limit(size)
    )
    items = list((await db.execute(stmt)).scalars().all())
    return {
        "items": items,
        "page": page,
        "size": size,
        "has_next": len(items) == size,  # 够一页说明可能有下一页
    }


async def paginate_cursor(
    db: AsyncSession, cursor: int | None = None, size: int = 20
) -> dict:
    """游标分页：cursor 是上一页最后一条的 id。"""
    stmt = select(Post).order_by(Post.id.desc()).limit(size)
    if cursor is not None:
        # 取 id 小于 cursor 的（按 id 倒序，所以是"下一页"）
        stmt = stmt.where(Post.id < cursor)
    items = list((await db.execute(stmt)).scalars().all())
    next_cursor = items[-1].id if items else None
    return {
        "items": items,
        "next_cursor": next_cursor,
        "has_next": len(items) == size,
    }
\`\`\`

| 分页方式 | 优点 | 缺点 | 适用 |
| --- | --- | --- | --- |
| **offset/limit** | 可跳页，实现简单 | 深翻慢（需跳过 N 行） | 后台管理 |
| **游标分页** | 深翻稳定，性能好 | 不能跳页 | 信息流、无限滚动 |

## 错误处理与连接池

数据库操作可能抛出多种异常：\`IntegrityError\`（唯一约束冲突）、\`OperationalError\`（连接断开）、\`TimeoutError\`（连接池耗尽）。建议用 FastAPI 的异常处理器统一捕获，把 ORM 异常翻译成合适的 HTTP 状态码：

\`\`\`python filename="main.py"
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, OperationalError

app = FastAPI()


@app.exception_handler(IntegrityError)
async def integrity_handler(request: Request, exc: IntegrityError):
    # 唯一约束、外键冲突 → 409
    return JSONResponse(
        status_code=409,
        content={"detail": "数据冲突：唯一约束或外键约束被违反"},
    )


@app.exception_handler(OperationalError)
async def operational_handler(request: Request, exc: OperationalError):
    # 连接断开、超时 → 503
    return JSONResponse(
        status_code=503,
        content={"detail": "数据库暂时不可用，请稍后重试"},
    )


@app.on_event("startup")
async def startup():
    # 启动时建表（仅演示，生产用 Alembic）
    from database import init_db
    await init_db()


@app.on_event("shutdown")
async def shutdown():
    # 关闭引擎，释放连接池
    from database import engine
    await engine.dispose()
\`\`\`

连接池配置对生产环境很关键。对 PostgreSQL/MySQL 这类有真正连接池的数据库，要合理设置 \`pool_size\`（常驻连接数）、\`max_overflow\`（溢出连接数）、\`pool_timeout\`（获取连接等待秒数）、\`pool_recycle\`（连接最长存活时间，避免被数据库端踢掉）：

\`\`\`python
from sqlalchemy.ext.asyncio import create_async_engine

engine = create_async_engine(
    "postgresql+asyncpg://user:pass@localhost/blog",
    pool_size=10,        # 常驻 10 个连接
    max_overflow=20,     # 高峰可临时扩到 30
    pool_timeout=30,     # 等 30 秒还拿不到连接就抛错
    pool_recycle=1800,   # 30 分钟回收一次，避免 MySQL 8 小时空闲断开
    pool_pre_ping=True,  # 取连接前 ping，避免拿到死连接
)
\`\`\`

## 小结

本章把 SQLAlchemy 2.0 接到了 FastAPI 上：\`create_async_engine\` + \`async_sessionmaker\` 搭建异步基础设施；\`get_db\` 用 \`yield\` 依赖管理"每请求一会话 + 统一事务"；CRUD 函数封装单表操作，路由层保持轻薄；分页要按场景选 offset 或 cursor；异常处理器把 ORM 错误翻译成 HTTP 状态码；连接池参数决定生产吞吐与稳定性。下一章我们解决"表结构变更如何安全推进"这个运维难题——用 Alembic 做数据库迁移。
`
  },

  // =========================================================
  // 第三章：Alembic 数据库迁移
  // =========================================================
  {
    id: "pyweb-alembic",
    group: "数据库",
    icon: "🔄",
    title: "Alembic 数据库迁移",
    content: `
## 为什么需要数据库迁移

项目演进中，表结构几乎必然变化：加字段、改类型、加索引、拆表合并。如果靠手动改库，会出现几个问题：**多环境不一致**——开发、测试、生产环境的表结构慢慢对不上；**改动不可追溯**——谁在什么时候改了什么，全靠口头沟通；**回滚困难**——改错了想退回去，却记不清改之前是什么样；**部署风险高**——发版时要手动执行一堆 SQL，漏一条就出事。

**数据库迁移工具**把表结构的每一次变更都记录成**版本化的脚本**，像 Git 管代码一样管表结构：每个版本有唯一的 revision id，版本之间用 \`down_revision\` 串成链；可以一键升级（upgrade）到新版本，也可以降级（downgrade）回退；脚本随代码一起进版本库，团队共享同一份表结构历史。

| 对比维度 | 手动改表 | Alembic 迁移 |
| --- | --- | --- |
| **可追溯** | 靠记忆 | 版本链清晰 |
| **多环境同步** | 易漂移 | 跑同样脚本即可 |
| **回滚** | 难 | downgrade 脚本 |
| **团队协作** | 口口相传 | 脚本入库共享 |
| **CI/CD** | 人工干预 | 自动执行 upgrade |

Alembic 是 SQLAlchemy 官方的迁移工具，与 ORM 模型深度集成，支持 **autogenerate** 自动对比模型与数据库差异生成迁移脚本。

## 初始化 Alembic

在项目根目录执行初始化命令，会生成 \`alembic.ini\` 配置文件和 \`alembic/\` 迁移目录：

\`\`\`bash
# 安装
pip install alembic

# 在项目根目录初始化
alembic init alembic
\`\`\`

生成的目录结构如下：

\`\`\`
project/
├── alembic.ini          # 配置文件（数据库 URL 等）
├── alembic/
│   ├── env.py           # 运行环境，每次迁移时执行
│   ├── script.py.mako   # 迁移脚本模板
│   └── versions/        # 存放各个版本的迁移脚本
└── models.py            # 你的 ORM 模型
\`\`\`

## 配置 alembic.ini

\`alembic.ini\` 里最关键的是 \`sqlalchemy.url\`，它告诉 Alembic 连哪个库。但把连接串硬编码进 ini 文件有两个问题：**敏感信息（密码）会进版本库**；**多环境（开发/测试/生产）需要不同 URL**。更好的做法是 \`env.py\` 里从环境变量读取，覆盖 ini 的配置。

\`\`\`ini
# alembic.ini 片段
[alembic]
# 这里只放一个占位，真实 URL 在 env.py 里从环境变量读
sqlalchemy.url = sqlite:///./blog.db
script_location = alembic
\`\`\`

## 配置 env.py：异步支持与 autogenerate

\`env.py\` 是 Alembic 的"运行时入口"，每次执行迁移命令都会跑它。我们需要做三件事：**导入模型让 autogenerate 能看到元数据**；**从环境变量读真实 URL**；**配置异步引擎执行迁移**。下面是适配异步 + autogenerate 的完整 \`env.py\`：

\`\`\`python filename="alembic/env.py"
import asyncio
import os
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# 1. 加载配置
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 2. 从环境变量覆盖 URL，避免硬编码
db_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./blog.db")
config.set_main_option("sqlalchemy.url", db_url)

# 3. 导入所有模型，让 autogenerate 能感知到表
#    关键：import 触发模型类定义，Base.metadata 才会被填充
import models  # noqa: F401  （你的模型模块）
target_metadata = models.Base.metadata


def run_migrations_offline() -> None:
    """离线模式：只生成 SQL 不执行（用于审查或交给 DBA）。"""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,   # 比较列类型（默认 False 会漏掉类型变更）
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """在给定连接上执行迁移。"""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """异步模式：用异步引擎跑迁移。"""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,  # 迁移不需要连接池
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    """在线模式的入口：根据 URL 判断走同步还是异步。"""
    url = config.get_main_option("sqlalchemy.url")
    if "asyncpg" in url or "aiosqlite" in url:
        # 异步驱动走异步分支
        asyncio.run(run_async_migrations())
    else:
        # 同步驱动走 Alembic 默认逻辑
        from sqlalchemy import engine_from_config
        connectable = engine_from_config(
            config.get_section(config.config_ini_section, {}),
            prefix="sqlalchemy.",
            poolclass=pool.NullPool,
        )
        with connectable.connect() as connection:
            do_run_migrations(connection)
    # connectable 在同步分支未显式 dispose，进程退出时回收


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
\`\`\`

两个关键配置：\`compare_type=True\` 让 autogenerate 检测列类型变更（如 \`String(50)\` → \`String(100)\`），否则会漏掉；\`target_metadata = models.Base.metadata\` 把模型的元数据交给 Alembic 做对比。异步分支里用 \`connection.run_sync(do_run_migrations)\` 把同步的迁移逻辑包进异步上下文——这是 SQLAlchemy 异步 API 的标准用法。

## 生成迁移脚本

改完 \`models.py\` 后，用 \`autogenerate\` 生成迁移脚本：

\`\`\`bash
# -m 给迁移起个有意义的名字
alembic revision --autogenerate -m "create posts table"

# 生成的脚本在 alembic/versions/ 下，文件名形如：
# a1b2c3d4e5f6_create_posts_table.py
\`\`\`

生成的脚本长这样，包含 upgrade 和 downgrade 两部分：

\`\`\`python filename="alembic/versions/a1b2c3_create_posts.py"
"""create posts table

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2025-01-01 12:00:00
"""
from alembic import op
import sqlalchemy as sa


# 迁移版本号
revision = "a1b2c3d4e5f6"
down_revision = None   # 第一个迁移，没有前驱
branch_labels = None
depends_on = None


def upgrade() -> None:
    """升级：创建 posts 表。"""
    op.create_table(
        "posts",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("author_id", sa.Integer(), nullable=False),
        sa.Column("published", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    # 加索引加速常用查询
    op.create_index("ix_posts_title", "posts", ["title"])


def downgrade() -> None:
    """降级：回滚到没有 posts 表的状态。"""
    op.drop_index("ix_posts_title", table_name="posts")
    op.drop_table("posts")
\`\`\`

**重要：autogenerate 生成的脚本一定要人工审查！** 它只能检测"模型和数据库的差异"，但有些变更它发现不了或会处理不当：

- **列类型变更**：需要 \`compare_type=True\` 才检测，且某些方言下不准
- **server_default 变更**：默认值改动可能漏检
- **数据迁移**：autogenerate 只管结构，不管数据；需要手动写数据搬迁逻辑
- **重命名**：它会把"改名列"识别成"删旧列 + 加新列"，会丢数据，需要手动改成 \`op.alter_column(...)\`

## 升级、降级与查看历史

\`\`\`bash
# 升级到最新版本
alembic upgrade head

# 升级到指定版本
alembic upgrade a1b2c3d4e5f6

# 升级 1 个版本
alembic upgrade +1

# 降级到上一个版本
alembic downgrade -1

# 降级到最初（清空所有迁移）
alembic downgrade base

# 查看迁移历史
alembic history

# 查看当前版本
alembic current

# 查看待执行的迁移（还没跑的）
alembic heads
\`\`\`

| 命令 | 作用 | 典型场景 |
| --- | --- | --- |
| \`upgrade head\` | 升到最新 | 部署发版 |
| \`upgrade +1\` | 升一级 | 逐步验证 |
| \`downgrade -1\` | 退一级 | 发版出问题回滚 |
| \`downgrade base\` | 退到最初 | 销毁重建 |
| \`current\` | 当前版本 | 排查环境 |
| \`history\` | 版本链 | 代码审查 |

## 加字段的迁移示例

假设博客文章要加一个 \`summary\` 摘要字段。先改模型：

\`\`\`python
# models.py 给 Post 加字段
class Post(Base):
    ...
    summary: Mapped[str | None] = mapped_column(String(500), default=None)
\`\`\`

然后生成并审查迁移：

\`\`\`bash
alembic revision --autogenerate -m "add summary to posts"
\`\`\`

审查生成的脚本，确认是 \`add_column\` 而非误判的 drop+add：

\`\`\`python
def upgrade() -> None:
    op.add_column("posts", sa.Column("summary", sa.String(500), nullable=True))

def downgrade() -> None:
    op.drop_column("posts", "summary")
\`\`\`

如果新字段需要给存量数据填默认值，要在 \`add_column\` 后手动加一段数据更新：

\`\`\`python
def upgrade() -> None:
    op.add_column("posts", sa.Column("summary", sa.String(500), nullable=True))
    # 给存量文章填摘要（取正文前 100 字）
    op.execute("UPDATE posts SET summary = SUBSTR(content, 1, 100) WHERE summary IS NULL")
\`\`\`

## 生产环境迁移策略

生产环境的迁移要遵循几条原则：**小步快跑**——一次迁移只做一件事，别把加字段、改类型、搬数据混在一起；**先加后删**——删字段要分两次：先发版让代码不再写旧字段（但表里还留着），下个迭代再发迁移删掉，给回滚留余地；**可逆**——每个 upgrade 都要写出能回滚的 downgrade，删表删字段的 downgrade 要想清楚能否恢复数据；**备份**——执行迁移前先备份数据库，迁移脚本再严谨也可能有意外；**CI 验证**——在 CI 里对空库跑一遍 upgrade + downgrade，确保脚本可执行且可回滚。

\`\`\`bash
# CI 里的迁移自检脚本示例
alembic upgrade head           # 升到最新
alembic downgrade -1           # 退一级
alembic upgrade head           # 再升回去
# 任何一步失败都说明迁移脚本有问题
\`\`\`

## 小结

Alembic 让表结构变更像代码一样版本化、可追溯、可回滚。\`env.py\` 是核心枢纽：导入模型让 autogenerate 看到元数据，从环境变量读 URL 适配多环境，异步分支让迁移与运行时一致。autogenerate 是省力工具但不是"自动驾驶"——生成的脚本必须人工审查，尤其警惕"改名被误判为删+加"导致的数据丢失。生产迁移要小步、可逆、有备份。下一章我们深入异步数据库，看看 \`async/await\` 如何提升并发吞吐。
`
  },

  // =========================================================
  // 第四章：异步数据库实战
  // =========================================================
  {
    id: "pyweb-async-db",
    group: "数据库",
    icon: "⚡",
    title: "异步数据库实战",
    content: `
## 异步 IO 原理

要理解异步数据库的价值，先得理解**异步 IO** 的本质。传统的同步 IO 在执行 \`socket.recv()\` 时，如果数据没到，线程会**阻塞**——操作系统把它挂起，让出 CPU，直到数据到达才唤醒。这意味着一个线程同一时刻只能处理一个连接。如果用"一个连接一个线程"的模型，1000 个并发连接就要 1000 个线程，线程切换和内存开销吃不消。

异步 IO 的思路是：**单线程 + 事件循环**。线程不阻塞等待，而是注册一个"我关心这个 socket 可读"的事件，然后去处理别的连接；事件循环（epoll/kqueue）负责监听所有 socket，哪个就绪了就回来通知。这样**一个线程就能同时管理成千上万个连接**，线程数与连接数解耦。

| 模型 | 线程数 | 并发连接数 | 上下文切换 | 适用 |
| --- | --- | --- | --- | --- |
| **同步阻塞** | = 连接数 | 受线程数限制 | 频繁 | 简单业务 |
| **多线程池** | 固定（如 10） | 受池大小限制 | 中等 | CPU/IO 混合 |
| **异步 IO** | 1（事件循环） | 上万 | 极少 | I/O 密集 |

\`asyncio\` 是 Python 的异步 IO 标准库。 \`async def\` 定义协程函数， \`await\` 把控制权交还事件循环。在 Web API 场景，一个请求的大部分时间花在等数据库、等下游服务——这正是异步 IO 的主场。

## aiosqlite 与 asyncpg：异步驱动

异步数据库需要**异步驱动**：驱动把"发 SQL / 收结果"做成非阻塞的，遇到 socket 未就绪就 await，让事件循环去处理别的请求。

| 数据库 | 同步驱动 | 异步驱动 | 备注 |
| --- | --- | --- | --- |
| **SQLite** | sqlite3（内置） | aiosqlite | 单文件库，无网络 |
| **PostgreSQL** | psycopg2 | asyncpg | 性能极佳 |
| **MySQL** | mysqlclient | aiomysql | 兼容性好 |
| **PostgreSQL** | psycopg（v3） | psycopg（async 模式） | 新版本原生支持异步 |

\`aiosqlite\` 的 URL 是 \`sqlite+aiosqlite:///./blog.db\`，\`asyncpg\` 是 \`postgresql+asyncpg://user:pass@host/db\`。换了 URL 前缀，引擎和会话代码几乎不用动——这是 SQLAlchemy 抽象层的好处。

## 异步 CRUD 完整示例

下面是异步版的博客文章 CRUD，注意所有数据库调用都要 \`await\`：

\`\`\`python filename="async_crud.py"
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from models import Post, User, Comment


async def async_create_post(
    db: AsyncSession, title: str, content: str, author_id: int
) -> Post:
    """异步新增文章。"""
    post = Post(title=title, content=content, author_id=author_id)
    db.add(post)
    await db.flush()         # 等待 INSERT，拿到 id
    await db.refresh(post)   # 加载服务端默认值
    return post


async def async_get_post_with_relations(db: AsyncSession, post_id: int) -> Post | None:
    """异步查单条，并用 selectinload 一次加载 author 和 comments。"""
    stmt = (
        select(Post)
        .where(Post.id == post_id)
        .options(
            selectinload(Post.author),
            selectinload(Post.comments),
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def async_search_posts(
    db: AsyncSession, keyword: str, limit: int = 10
) -> list[Post]:
    """异步模糊搜索文章标题。"""
    stmt = (
        select(Post)
        .where(Post.title.like(f"%{keyword}%"))
        .order_by(Post.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def async_delete_unpublished(db: AsyncSession) -> int:
    """异步批量删除未发布文章，返回删除条数。"""
    stmt = delete(Post).where(Post.published == False)  # noqa: E712
    result = await db.execute(stmt)
    await db.flush()
    # rowcount 是底层驱动报告的影响行数
    return result.rowcount or 0
\`\`\`

几个异步特有的注意点：\`db.execute(stmt)\` 返回的是 \`Result\` 对象，要 \`.scalars()\` / \`.scalar_one()\` 取值，**不能**像同步那样直接 \`session.scalars(stmt).all()\`（虽然 2.0 也提供了 \`session.scalars\`，但异步下推荐显式 execute 再取）；\`flush\` 也要 await；commit 由依赖注入统一处理。

## 并发查询：asyncio.gather

异步最大的优势是**并发等待**：如果一次请求要查好几个无依赖的东西，可以并发发起，总耗时约等于最慢的那个，而不是累加。场景：博客首页要同时拿"最新文章列表"和"热门标签"和"本周评论数"，三者互不依赖。

\`\`\`python filename="concurrent_query.py"
import asyncio
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from models import Post, Tag, Comment


async def fetch_recent_posts(db: AsyncSession, limit: int = 10):
    stmt = select(Post).order_by(Post.created_at.desc()).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def fetch_popular_tags(db: AsyncSession, limit: int = 10):
    stmt = select(Tag).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def fetch_weekly_comment_count(db: AsyncSession):
    stmt = select(func.count()).select_from(Comment)
    result = await db.execute(stmt)
    return result.scalar_one()


async def get_home_data(db: AsyncSession) -> dict:
    """并发获取首页所需的三个数据集。"""
    # asyncio.gather 并发执行三个协程
    posts, tags, comment_count = await asyncio.gather(
        fetch_recent_posts(db),
        fetch_popular_tags(db),
        fetch_weekly_comment_count(db),
    )
    return {
        "recent_posts": [p.id for p in posts],
        "popular_tags": [t.name for t in tags],
        "comment_count": comment_count,
    }
\`\`\`

**重要警告**：\`AsyncSession\` 不是并发安全的！上面的 \`asyncio.gather\` 共享同一个 \`db\`，在 SQLite 这种单连接的数据库上可能出问题。安全做法是给每个并发任务开独立的 Session：

\`\`\`python
from database import async_session_factory


async def get_home_data_safe() -> dict:
    """每个并发任务用独立 Session，避免并发冲突。"""
    async def with_session(coro_func):
        async with async_session_factory() as session:
            return await coro_func(session)

    posts, tags, count = await asyncio.gather(
        with_session(fetch_recent_posts),
        with_session(fetch_popular_tags),
        with_session(fetch_weekly_comment_count),
    )
    return {"posts": posts, "tags": tags, "count": count}
\`\`\`

## 批量插入

插入大量数据时，逐条 \`add + flush\` 性能很差——每条都触发一次 SQL 往返。批量插入有几种方式：

\`\`\`python filename="bulk_insert.py"
from sqlalchemy import insert
from sqlalchemy.ext.asyncio import AsyncSession
from models import Post


async def bulk_insert_loop(db: AsyncSession, posts: list[dict]) -> None:
    """❌ 慢：逐条 add，N 次 SQL 往返。"""
    for p in posts:
        db.add(Post(**p))
    await db.flush()


async def bulk_insert_add_all(db: AsyncSession, posts: list[dict]) -> None:
    """✅ 较快：add_all 仍走 ORM，但一次 flush。"""
    db.add_all([Post(**p) for p in posts])
    await db.flush()


async def bulk_insert_core(db: AsyncSession, posts: list[dict]) -> None:
    """✅ 最快：Core insert + executemany，绕过 ORM 实例化开销。"""
    stmt = insert(Post).values(posts)
    await db.execute(stmt)
    await db.flush()


async def bulk_insert_returning(db: AsyncSession, posts: list[dict]) -> list[int]:
    """✅ 批量插入并拿回自增 id（PostgreSQL 支持 RETURNING）。"""
    stmt = insert(Post).values(posts).returning(Post.id)
    result = await db.execute(stmt)
    return [row[0] for row in result.all()]
\`\`\`

| 方式 | SQL 往返 | ORM 开销 | 能拿 id | 速度 |
| --- | --- | --- | --- | --- |
| 逐条 add | N 次 | 高 | ✅ | 慢 |
| add_all | 1 次 | 中 | ✅ | 较快 |
| Core insert | 1 次 | 低 | ❌ | 快 |
| insert+RETURNING | 1 次 | 低 | ✅ | 快（限 PG） |

## 性能对比：同步 vs 异步

下面用一个可运行的对比脚本直观感受差异。模拟"并发查 20 次单条文章"，看同步和异步的总耗时：

\`\`\`python filename="perf_compare.py"
import asyncio
import time
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from database import engine, async_session_factory, init_db
from models import Post


async def setup_data():
    """先造一些测试数据。"""
    await init_db()
    async with async_session_factory() as db:
        for i in range(100):
            db.add(Post(title=f"标题{i}", content=f"内容{i}", author_id=1))
        await db.commit()


async def async_query_one(db: AsyncSession, pid: int) -> Post | None:
    stmt = select(Post).where(Post.id == pid)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def async_benchmark(n: int = 20) -> float:
    """异步并发查 n 次。"""
    start = time.perf_counter()
    # 每个查询独立 session，避免并发冲突
    async def one_query(pid: int):
        async with async_session_factory() as db:
            await async_query_one(db, pid)
    await asyncio.gather(*[one_query(i + 1) for i in range(n)])
    return time.perf_counter() - start


def sync_benchmark(n: int = 20) -> float:
    """同步串行查 n 次（用同步引擎）。"""
    from sqlalchemy import create_engine
    sync_engine = create_engine("sqlite:///./blog.db")
    start = time.perf_counter()
    with Session(sync_engine) as db:
        for i in range(n):
            stmt = select(Post).where(Post.id == i + 1)
            db.scalars(stmt).first()
    elapsed = time.perf_counter() - start
    sync_engine.dispose()
    return elapsed


async def main():
    await setup_data()
    t_async = await async_benchmark(20)
    t_sync = sync_benchmark(20)
    print(f"异步并发 20 次查询: {t_async:.3f}s")
    print(f"同步串行 20 次查询: {t_sync:.3f}s")
    print(f"加速比: {t_sync / t_async:.1f}x")


if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

注意：SQLite 由于写锁是全局的，读并发收益有限；真正的异步收益在 PostgreSQL/MySQL 这类支持多连接并发的数据库上更明显。且异步的优势在"I/O 等待时间占比高"的场景——如果查询本身极快（如本地 SQLite 命中缓存），异步的协程调度开销可能反而让它略慢。**异步不是银弹，要结合具体场景测了再下结论。**

## 连接池与并发控制

异步场景下连接池配置更关键——并发请求多，连接消耗也快。要避免两个极端：池太小，请求排队等连接；池太大，数据库端连接数被打满。

\`\`\`python
from sqlalchemy.ext.asyncio import create_async_engine

# PostgreSQL 生产配置示例
engine = create_async_engine(
    "postgresql+asyncpg://user:pass@localhost/blog",
    pool_size=20,        # 常驻 20 连接
    max_overflow=10,     # 峰值 30
    pool_timeout=60,     # 等 60 秒
    pool_recycle=1800,   # 30 分钟回收
    pool_pre_ping=True,
)

# 限制并发查询数，防止数据库被打垮
import asyncio
semaphore = asyncio.Semaphore(50)  # 最多 50 个并发查询

async def limited_query(db: AsyncSession, stmt):
    async with semaphore:
        return await db.execute(stmt)
\`\`\`

## 小结

异步数据库把"等 I/O"的时间用来处理别的请求，单进程能扛更多并发。\`aiosqlite\`/\`asyncpg\` 提供非阻塞驱动，\`AsyncSession\` + \`await\` 让代码读起来像同步却获得并发收益。\`asyncio.gather\` 是并发查询的利器，但要记住 \`AsyncSession\` 不并发安全——并发任务要开独立 Session。批量插入用 Core \`insert().values(list)\` 性能最佳。异步不是万能——本地 SQLite、CPU 密集场景可能反而更慢，要测了再选。下一章我们把前面学的一切组织进一个分层的、可维护的项目结构。
`
  },

  // =========================================================
  // 第五章：项目结构与分层架构
  // =========================================================
  {
    id: "pyweb-structure",
    group: "数据库",
    icon: "🏗️",
    title: "项目结构与分层架构",
    content: `
## 为什么需要分层

初学时把所有代码塞进一个 \`main.py\` 很爽——一个文件搞定路由、查库、返回。但项目一旦长大，这种"意大利面"结构会迅速失控：**改一个字段要在十处搜索替换**，因为 SQL 散落在各个路由里；**测试难写**，路由函数直接连着数据库，没法单独测；**职责模糊**，路由里既有 HTTP 参数解析又有业务规则又有 SQL，每段都长几十行；**多人协作冲突**，大家都在改同一个文件。

分层架构的核心思想是**关注点分离**：把不同职责的代码放到不同层级，每层只与相邻层对话。这样改动的影响面可控，每层可独立测试，新人理解一块就能改一块。

| 层 | 职责 | 知道什么 | 不知道什么 |
| --- | --- | --- | --- |
| **Router 路由层** | HTTP 参数解析、响应序列化 | 请求/响应、Service 接口 | 数据库、SQL |
| **Service 业务层** | 业务规则、事务编排 | 业务逻辑、CRUD 接口 | HTTP、框架 |
| **Model/CRUD 数据层** | 数据存取、SQL | 表结构、SQL | 业务规则 |

## 经典三层架构

博客项目采用 **Router → Service → Model/CRUD** 三层结构：

- **Router 层**：只做"接收请求 → 调 Service → 返回响应"，不含任何业务规则和 SQL。用 Pydantic Schema 校验入参、序列化出参。
- **Service 层**：编排业务逻辑，如"创建文章时先校验作者存在、再插入文章、再发通知"。它调 CRUD 做数据操作，但不知道 HTTP 的存在。
- **CRUD/Model 层**：纯粹的数据库操作，封装单表的增删改查。Model 定义表结构，CRUD 函数操作 Model。

调用方向永远是 **Router → Service → CRUD**，绝不反向。Service 不 import FastAPI，CRUD 不 import Service——这样依赖关系是单向的、可测的。

## 完整目录结构

\`\`\`
blog-api/
├── alembic/                  # 数据库迁移
│   ├── versions/
│   └── env.py
├── alembic.ini
├── app/
│   ├── __init__.py
│   ├── main.py               # FastAPI 应用入口
│   ├── config.py             # 配置管理（pydantic-settings）
│   ├── database.py           # 引擎、会话工厂、Base
│   ├── deps.py               # 公共依赖（get_db 等）
│   ├── models/               # ORM 模型（数据层）
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── post.py
│   │   └── comment.py
│   ├── schemas/              # Pydantic Schema（DTO）
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── post.py
│   │   └── comment.py
│   ├── crud/                 # 数据库操作（数据层）
│   │   ├── __init__.py
│   │   ├── base.py           # CRUDBase 通用基类
│   │   ├── user.py
│   │   └── post.py
│   ├── services/             # 业务逻辑（业务层）
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   └── post_service.py
│   └── routers/              # 路由分组（路由层）
│       ├── __init__.py
│       ├── user.py
│       └── post.py
├── tests/
│   ├── conftest.py
│   ├── test_post_service.py
│   └── test_post_router.py
├── .env                      # 环境变量（不进版本库）
├── .env.example              # 环境变量样例
├── requirements.txt
└── README.md
\`\`\`

## Schema（Pydantic）vs Model（ORM）分离

一个常见困惑：为什么既要 ORM Model 又要 Pydantic Schema？因为它们职责不同：

| 维度 | ORM Model | Pydantic Schema |
| --- | --- | --- |
| **职责** | 映射数据库表 | 定义 API 入参/出参 |
| **基类** | DeclarativeBase | BaseModel |
| **位置** | models/ | schemas/ |
| **例子** | User（含密码哈希） | UserCreate / UserRead / UserUpdate |
| **生命周期** | 与表共存亡 | 随 API 演进 |

同一张表通常对应**多个 Schema**：\`UserCreate\`（注册时入参，含密码）、\`UserRead\`（响应出参，**不含密码**）、\`UserUpdate\`（改资料，所有字段可选）。这种"一表多 Schema"能精确控制每个接口暴露哪些字段，避免把密码哈希等敏感字段序列化出去。

\`\`\`python filename="app/schemas/post.py"
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# ---- 入参 Schema ----
class PostCreate(BaseModel):
    """创建文章的入参。客户端不传 id、created_at（服务端生成）。"""
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    published: bool = False


class PostUpdate(BaseModel):
    """更新文章的入参。所有字段可选，只更新传入的字段。"""
    title: str | None = Field(None, max_length=200)
    content: str | None = None
    published: bool | None = None


# ---- 出参 Schema ----
class PostRead(BaseModel):
    """文章响应出参。用 from_attributes 把 ORM 对象转成 Schema。"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    published: bool
    created_at: datetime
    author_id: int


class PostListResponse(BaseModel):
    """列表响应，带分页元信息。"""
    items: list[PostRead]
    total: int
    page: int
    size: int
\`\`\`

\`model_config = ConfigDict(from_attributes=True)\` 让 Pydantic v2 能直接从 ORM 对象的属性读值（v1 是 \`class Config: orm_mode = True\`）。这样路由层可以 \`PostRead.model_validate(post_orm_obj)\` 一行完成"ORM → Schema"转换。

## 通用 CRUD 基类

每张表的 CRUD 都长得差不多（增删改查 + 分页），抽象成一个泛型基类避免重复：

\`\`\`python filename="app/crud/base.py"
from typing import Generic, TypeVar, Type, Any
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase

ModelT = TypeVar("ModelT", bound=DeclarativeBase)


class CRUDBase(Generic[ModelT]):
    """通用 CRUD 基类，子类指定 model 即可复用增删改查。"""

    def __init__(self, model: Type[ModelT]):
        self.model = model

    async def get(self, db: AsyncSession, id: int) -> ModelT | None:
        """按主键查单条。"""
        return await db.get(self.model, id)

    async def list(
        self, db: AsyncSession, skip: int = 0, limit: int = 20
    ) -> list[ModelT]:
        """分页列表。"""
        stmt = select(self.model).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, obj_in: dict) -> ModelT:
        """新增。"""
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        await db.flush()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self, db: AsyncSession, db_obj: ModelT, obj_in: dict
    ) -> ModelT:
        """按字段更新。"""
        for key, value in obj_in.items():
            if hasattr(db_obj, key) and value is not None:
                setattr(db_obj, key, value)
        await db.flush()
        return db_obj

    async def remove(self, db: AsyncSession, id: int) -> bool:
        """按主键删除。"""
        obj = await self.get(db, id)
        if obj is None:
            return False
        await db.delete(obj)
        await db.flush()
        return True

    async def count(self, db: AsyncSession) -> int:
        """总数。"""
        stmt = select(func.count()).select_from(self.model)
        result = await db.execute(stmt)
        return result.scalar_one()
\`\`\`

子类只需声明 model，必要时覆写或追加专属方法：

\`\`\`python filename="app/crud/post.py"
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.crud.base import CRUDBase
from app.models.post import Post


class CRUDPost(CRUDBase[Post]):
    """文章 CRUD，继承通用基类后追加文章专属查询。"""

    async def get_with_author(
        self, db: AsyncSession, post_id: int
    ) -> Post | None:
        """查文章并预加载作者，避免 N+1。"""
        stmt = (
            select(Post)
            .where(Post.id == post_id)
            .options(selectinload(Post.author))
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def search_by_title(
        self, db: AsyncSession, keyword: str, limit: int = 10
    ) -> list[Post]:
        """按标题模糊搜索。"""
        stmt = (
            select(Post)
            .where(Post.title.like(f"%{keyword}%"))
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())


post_crud = CRUDPost(Post)  # 单例，到处复用
\`\`\`

## Service 业务层

Service 编排业务规则。它调 CRUD，但不知道 HTTP；它管事务边界，处理跨表操作：

\`\`\`python filename="app/services/post_service.py"
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.post import post_crud
from app.crud.user import user_crud
from app.schemas.post import PostCreate, PostUpdate


async def create_post(
    db: AsyncSession, post_in: PostCreate, author_id: int
):
    """创建文章的业务流程：先校验作者存在，再创建。"""
    author = await user_crud.get(db, author_id)
    if author is None:
        raise HTTPException(404, "作者不存在")
    post = await post_crud.create(
        db, {
            "title": post_in.title,
            "content": post_in.content,
            "published": post_in.published,
            "author_id": author_id,
        }
    )
    return post


async def update_post(
    db: AsyncSession, post_id: int, post_in: PostUpdate
):
    """更新文章：先查存在，再按非空字段更新。"""
    post = await post_crud.get(db, post_id)
    if post is None:
        raise HTTPException(404, "文章不存在")
    # 只把客户端实际传入的字段传给 update
    update_data = post_in.model_dump(exclude_unset=True)
    updated = await post_crud.update(db, post, update_data)
    return updated


async def get_post_detail(db: AsyncSession, post_id: int):
    """获取文章详情（含作者）。"""
    post = await post_crud.get_with_author(db, post_id)
    if post is None:
        raise HTTPException(404, "文章不存在")
    return post
\`\`\`

\`model_dump(exclude_unset=True)\` 是 Pydantic v2 的关键方法：只返回客户端**实际传入**的字段，没传的不在内。这样 \`PUT\` 接口才能正确实现"部分更新"——客户端只传 title 就只改 title，不会把 content 误置为 None。

## Router 路由层

Router 极薄，只做"参数 → 调 Service → 响应"：

\`\`\`python filename="app/routers/post.py"
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.deps import get_db
from app.schemas.post import (
    PostCreate, PostUpdate, PostRead, PostListResponse,
)
from app.services import post_service

router = APIRouter(prefix="/posts", tags=["文章"])


@router.post(
    "/",
    response_model=PostRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_post(
    post_in: PostCreate,
    author_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """创建文章。"""
    post = await post_service.create_post(db, post_in, author_id)
    return post  # response_model=PostRead 自动用 Schema 序列化


@router.get("/", response_model=PostListResponse)
async def list_posts(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """文章列表（分页）。"""
    skip = (page - 1) * size
    items = await post_service.list_posts(db, skip=skip, limit=size)
    total = await post_service.count_posts(db)
    return {"items": items, "total": total, "page": page, "size": size}


@router.get("/{post_id}", response_model=PostRead)
async def get_post(post_id: int, db: AsyncSession = Depends(get_db)):
    """文章详情。"""
    return await post_service.get_post_detail(db, post_id)


@router.put("/{post_id}", response_model=PostRead)
async def update_post(
    post_id: int,
    post_in: PostUpdate,
    db: AsyncSession = Depends(get_db),
):
    """更新文章。"""
    return await post_service.update_post(db, post_id, post_in)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: int, db: AsyncSession = Depends(get_db)):
    """删除文章。"""
    ok = await post_service.delete_post(db, post_id)
    if not ok:
        raise HTTPException(404, "文章不存在")
    return None
\`\`\`

\`response_model=PostRead\` 让 FastAPI 自动把返回的 ORM 对象按 Schema 序列化，**自动剔除 Schema 里没有的字段**（如密码哈希），还自动生成 OpenAPI 文档。

## 配置管理：pydantic-settings

把所有配置（数据库 URL、密钥、调试开关）集中到一个 Settings 类，从环境变量读取，类型安全：

\`\`\`python filename="app/config.py"
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置，从 .env 文件和环境变量读取。"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # 应用
    APP_NAME: str = "博客 API"
    DEBUG: bool = False

    # 数据库
    DATABASE_URL: str = "sqlite+aiosqlite:///./blog.db"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    # 安全
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60


@lru_cache  # 单例：整个进程只读一次 .env
def get_settings() -> Settings:
    return Settings()
\`\`\`

\`.env\` 文件（不进版本库，每人本地维护）：

\`\`\`
DATABASE_URL=sqlite+aiosqlite:///./blog.db
DEBUG=True
SECRET_KEY=dev-secret-please-change
\`\`\`

\`.env.example\`（进版本库，作为模板）：

\`\`\`
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/blog
DEBUG=False
SECRET_KEY=please-generate-a-strong-key
\`\`\`

\`@lru_cache\` 让 Settings 只初始化一次，避免反复读文件。在依赖注入里用 \`Depends(get_settings)\` 注入，方便测试时覆写。

## APIRouter 分组与主应用

每个资源一个 Router 文件，在 \`main.py\` 里统一挂载：

\`\`\`python filename="app/main.py"
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.config import get_settings
from app.database import engine, init_db
from app.routers import post, user


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动：建表（演示用，生产用 Alembic）
    await init_db()
    yield
    # 关闭：释放连接池
    await engine.dispose()


settings = get_settings()
app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

# 挂载路由分组
app.include_router(user.router, prefix="/api/v1")
app.include_router(post.router, prefix="/api/v1")


@app.get("/health", tags=["运维"])
async def health():
    """健康检查。"""
    return {"status": "ok"}
\`\`\`

\`prefix="/api/v1"\` 给所有路由加版本前缀，方便未来发布 v2 不影响 v1。\`lifespan\` 取代了旧的 \`on_event\`，把启动和关闭逻辑写在一起更清晰。

## 小结

分层让项目可维护、可测试、可协作。Router 层薄、Service 层厚、CRUD 层纯；Pydantic Schema 与 ORM Model 分离，精确控制 API 暴露的字段；\`CRUDBase\` 泛型基类消除单表 CRUD 的重复；\`pydantic-settings\` 让配置类型安全地从环境变量加载；\`APIRouter\` 让路由按资源分组、按版本挂载。这套结构是几乎所有现代 FastAPI 项目的骨架——掌握它，你写的就是"工程"而非"脚本"。至此，数据库篇五章完毕，你已经具备用 SQLAlchemy 2.0 + Alembic + FastAPI 搭建一个结构清晰、可演进、可维护的博客后端的能力。
`
  },
];
