// =============================================================
// FastAPI 全栈实战 - 第 8 批章节（进阶与生产实践 7 章）
// -------------------------------------------------------------
// 本批包含 7 章：
//   ff-alembic:          Alembic 数据库迁移
//   ff-async-sqlalchemy: 异步 SQLAlchemy (async/await)
//   ff-rbac:             RBAC 角色权限控制
//   ff-ratelimit:        API 限流 (slowapi)
//   ff-redis:            Redis 缓存集成
//   ff-openapi:          OpenAPI 文档定制
//   ff-perf:             性能优化与压测
// =============================================================

export const chapters = [
  // ============================================================
  // 第 38 章：Alembic 数据库迁移
  // ============================================================
  {
    id: "ff-alembic",
    group: "进阶与生产实践",
    icon: "📈",
    title: "Alembic 数据库迁移",
    content: `# Alembic 数据库迁移

## 一、为什么需要迁移工具

前面我们用 \`Base.metadata.create_all(engine)\` 建表——它只能**创建不存在的表**，一旦表建好后想加字段、改类型，它就无能为力了。

手动改表结构的痛苦：

\`\`\`python
# ❌ 手动改表的危险做法
import sqlite3

conn = sqlite3.connect("taskboard.db")
# 直接执行 ALTER TABLE：没有版本记录、没有回滚、团队协作会打架
conn.execute("ALTER TABLE users ADD COLUMN email TEXT")
conn.close()

# 问题来了：
# 1. 同事拉代码后，他的数据库没有 email 字段，代码直接报错
# 2. 上线时忘了在生产库执行 ALTER，线上炸了
# 3. 改错了想回退？没有记录，回不去
\`\`\`

**迁移工具**就是解决这些问题的：它把每一次表结构变更写成一个个「迁移脚本」，按顺序执行，并能回滚。

| 维度 | 手动改表 | 迁移工具（Alembic）|
|------|---------|-------------------|
| 版本记录 | 无 | 有，每次变更一个版本号 |
| 团队协作 | 互相覆盖 | 按顺序应用，人人一致 |
| 回滚 | 几乎不可能 | \`downgrade\` 一键回退 |
| 生产上线 | 靠记性 | \`alembic upgrade head\` 一条命令 |

Alembic 是 SQLAlchemy 官方推荐的迁移工具，和 ORM 模型天然配合。

## 二、安装与初始化

\`\`\`bash
# 安装 alembic
pip install alembic

# 在项目根目录初始化，会生成 alembic.ini 和 alembic/ 目录
alembic init alembic
\`\`\`

初始化后的目录结构：

\`\`\`
project/
├── alembic.ini          # 配置文件（数据库连接地址等）
└── alembic/
    ├── env.py           # 迁移环境脚本（关键！要改这里导入模型）
    ├── script.py.mako   # 迁移脚本模板
    └── versions/        # 存放所有迁移脚本（一开始是空的）
\`\`\`

## 三、配置 alembic.ini 与 env.py

### 3.1 改 alembic.ini 的数据库连接

\`\`\`ini
# alembic.ini 里找到这一行，改成你的 SQLite 路径
sqlalchemy.url = sqlite:///./taskboard.db

# 注意：生产环境不要把密码写死在 ini 里
# 推荐在 env.py 里从环境变量读取（下面会讲）
\`\`\`

### 3.2 改 env.py 导入模型的 metadata

这是**最关键的一步**——env.py 默认不知道你的模型，autogenerate 会生成空迁移。

\`\`\`python
# alembic/env.py 关键改动
from alembic import context
from sqlalchemy import engine_from_config, pool
import os
import sys

# 把项目根目录加进 sys.path，这样才能 import 到你的 app 包
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# ★ 导入你的 Base 和所有模型（必须 import 模型文件，模型才会注册到 metadata）
from app.database import Base
from app.models import User, Board, Column, Card  # noqa: F401

# 把 target_metadata 指向你的 Base.metadata
# autogenerate 就是对比它和数据库现状来生成迁移的
target_metadata = Base.metadata


def run_migrations_online():
    # 从环境变量读数据库地址，避免把生产密码写进 ini 文件
    db_url = os.getenv("DATABASE_URL", "sqlite:///./taskboard.db")
    config = context.config
    config.set_main_option("sqlalchemy.url", db_url)

    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            # compare_type=True：让 autogenerate 检测字段类型变更
            # 不加的话，把 String(50) 改成 String(100) 不会被识别
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


run_migrations_online()
\`\`\`

## 四、创建第一个迁移

\`\`\`bash
# --autogenerate：自动对比模型和数据库，生成迁移脚本
# -m "create users table"：迁移的描述信息
alembic revision --autogenerate -m "create users table"
\`\`\`

生成的脚本在 \`alembic/versions/xxxx_create_users_table.py\`：

\`\`\`python
"""create users table

Revision ID: a1b2c3d4
Revises:
Create Date: 2025-01-01 10:00:00
"""
from alembic import op
import sqlalchemy as sa


def upgrade():
    # upgrade：往前执行（升级）
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('username', sa.String(50), nullable=False),
        sa.Column('hashed_password', sa.String(128), nullable=False),
    )
    # op.create_index：创建索引，提升按 username 查询的速度
    op.create_index('ix_users_username', 'users', ['username'], unique=True)


def downgrade():
    # downgrade：往回执行（回滚），必须和 upgrade 完全对称
    op.drop_index('ix_users_username', table_name='users')
    op.drop_table('users')
\`\`\`

**重要**：autogenerate 生成的脚本一定要**人工审查**！它可能漏检一些变更（如改了 server_default），不能盲目信任。

## 五、升级与回滚

\`\`\`bash
# 升级到最新版本
alembic upgrade head

# 回退一个版本
alembic downgrade -1

# 回退到指定版本
alembic downgrade a1b2c3d4

# 查看当前版本
alembic current

# 查看所有迁移历史
alembic history
\`\`\`

迁移版本是一条链表：每个脚本有 \`down_revision\` 指向上一个版本，\`head\` 就是链表尾部。

## 六、实战：给 users 表添加 email 字段

完整流程：**改模型 → autogenerate → 审查 → upgrade**。

\`\`\`python
# 第 1 步：修改模型，加 email 字段
# app/models.py
from sqlalchemy import Column, Integer, String
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    hashed_password = Column(String(128), nullable=False)
    # ★ 新增 email 字段
    email = Column(String(120), unique=True, nullable=True)  # 一开始允许为空，兼容老数据
\`\`\`

\`\`\`bash
# 第 2 步：生成迁移
alembic revision --autogenerate -m "add email to users"

# 第 3 步：检查生成的 versions/xxx_add_email_to_users.py
# 确认 upgrade 里有 op.add_column('users', sa.Column('email', ...))

# 第 4 步：执行升级
alembic upgrade head
\`\`\`

给**已有数据的表**加字段，要特别小心 \`nullable\`：

\`\`\`python
def upgrade():
    # 加非空字段到已有数据的表：要分两步
    # 1. 先加 nullable=True 的字段
    op.add_column('users', sa.Column('email', sa.String(120), nullable=True))
    # 2. 给老数据填默认值（用 op.execute 跑裸 SQL）
    op.execute("UPDATE users SET email = username || '@example.com' WHERE email IS NULL")
    # 3. （可选）再改成非空
    op.alter_column('users', 'email', nullable=False)


def downgrade():
    op.drop_column('users', 'email')
\`\`\`

## 七、迁移最佳实践

| 原则 | 说明 |
|------|------|
| 不要删除已提交的迁移 | 团队成员可能已经应用了它，删除会导致版本链断裂 |
| 迁移要可回滚 | 每个 upgrade 都要有对应的 downgrade，且都要测试 |
| 一次迁移只做一件事 | 方便回滚，别把建表、改字段、加索引混在一个文件 |
| autogenerate 必须人工审查 | 它会漏检类型变更、server_default 等 |
| 生产环境先备份 | \`upgrade\` 前先备份数据库，万一翻车能恢复 |
| 不要在迁移里写业务逻辑 | 迁移只管表结构，数据迁移另写脚本 |
| 命名要清晰 | \`\`-m "add email to users"\`\` 比 \`\`-m "update1"\`\` 强一百倍 |

## 八、Demo：用代码模拟迁移流程

下面这个 demo 用纯 Python 模拟 Alembic 的迁移链机制，不依赖 alembic 也能跑，帮你理解「版本链 + 升级/回滚」的本质：

\`\`\`python
# Demo：模拟 Alembic 迁移链的核心机制
# 运行：python main.py
import sqlite3

# ===== 迁移脚本注册表：每个迁移是一个 (id, upgrade_fn, downgrade_fn) =====
# 用列表模拟 Alembic 的 versions/ 目录，按顺序排列
MIGRATIONS = []

def migration(revision, down_revision):
    """装饰器：注册一个迁移脚本，记录前后版本号形成链表。"""
    def decorator(fn):
        # 把 upgrade/downgrade 都挂到函数上
        fn.revision = revision
        fn.down_revision = down_revision
        MIGRATIONS.append(fn)
        return fn
    return decorator


# ===== 迁移 1：建 users 表 =====
@migration(revision="0001", down_revision=None)
def m0001(conn):
    """upgrade: 建 users 表；downgrade: 删 users 表。"""
    def upgrade():
        conn.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                hashed_password TEXT NOT NULL
            )
        """)
        print("  [upgrade 0001] 创建 users 表")
    def downgrade():
        conn.execute("DROP TABLE users")
        print("  [downgrade 0001] 删除 users 表")
    return upgrade, downgrade


# ===== 迁移 2：给 users 加 email 字段 =====
@migration(revision="0002", down_revision="0001")
def m0002(conn):
    def upgrade():
        conn.execute("ALTER TABLE users ADD COLUMN email TEXT")
        print("  [upgrade 0002] 添加 email 字段")
    def downgrade():
        # SQLite 老版本不支持 DROP COLUMN，这里用模拟说明概念
        print("  [downgrade 0002] 移除 email 字段（模拟）")
    return upgrade, downgrade


# ===== 迁移管理器：记录当前版本，执行升级/回滚 =====
class MigrationRunner:
    def __init__(self, conn):
        self.conn = conn
        # alembic_version 表：只存一行，记录当前版本号
        conn.execute("CREATE TABLE IF NOT EXISTS alembic_version (version_num TEXT)")
        if not conn.execute("SELECT version_num FROM alembic_version").fetchone():
            conn.execute("INSERT INTO alembic_version (version_num) VALUES (NULL)")
        conn.commit()

    @property
    def current(self):
        row = self.conn.execute("SELECT version_num FROM alembic_version").fetchone()
        return row[0] if row else None

    def _set_version(self, version):
        self.conn.execute("UPDATE alembic_version SET version_num = ?", (version,))
        self.conn.commit()

    def upgrade(self, target="head"):
        """从当前版本升级到目标版本。"""
        # 找出当前版本之后的所有迁移
        start = False if self.current else True
        for m in MIGRATIONS:
            if self.current is None:
                start = True
            if start and m.revision != self.current:
                upgrade, _ = m(self.conn)
                upgrade()
                self._set_version(m.revision)
        print(f"当前版本: {self.current}")

    def downgrade(self, steps=1):
        """回退 N 个版本。"""
        # 倒序遍历，执行 downgrade
        applied = [m for m in MIGRATIONS]
        for m in reversed(applied):
            if steps <= 0:
                break
            if m.revision == self.current:
                _, downgrade = m(self.conn)
                downgrade()
                self._set_version(m.down_revision)
                steps -= 1
        print(f"当前版本: {self.current or '(空)'}")


# ===== 运行演示 =====
if __name__ == "__main__":
    conn = sqlite3.connect(":memory:")
    runner = MigrationRunner(conn)

    print("== 升级到最新 ==")
    runner.upgrade()
    # 往表里插一条数据，验证结构
    conn.execute("INSERT INTO users (username, hashed_password, email) VALUES (?, ?, ?)",
                 ("tom", "xxx", "tom@example.com"))
    conn.commit()
    print("  插入用户成功，说明 email 字段已存在")

    print("\n== 回退一步 ==")
    runner.downgrade(1)

    print("\n== 再升级到最新 ==")
    runner.upgrade()

    conn.close()
\`\`\`

## 九、本章小结

| 概念 | 一句话 |
|------|-------|
| Alembic | SQLAlchemy 官方迁移工具，管理表结构变更 |
| autogenerate | 自动对比模型与数据库生成迁移，但需人工审查 |
| upgrade / downgrade | 升级与回滚，必须对称可逆 |
| env.py | 迁移环境配置，要导入模型的 Base.metadata |
| head | 迁移链的最新版本 |
| 迁移链 | 每个迁移记录 down_revision，形成有序链表 |
| nullable 过渡 | 给老表加非空字段要先加 nullable=True 再填数据 |

下章我们学异步 SQLAlchemy，让数据库操作不阻塞事件循环。`,
  },

  // ============================================================
  // 第 39 章：异步 SQLAlchemy (async/await)
  // ============================================================
  {
    id: "ff-async-sqlalchemy",
    group: "进阶与生产实践",
    icon: "⚡",
    title: "异步 SQLAlchemy (async/await)",
    content: `# 异步 SQLAlchemy (async/await)

## 一、同步 vs 异步 SQLAlchemy 的差异

FastAPI 是异步框架，但如果你用**同步的 SQLAlchemy**（\`create_engine\` + \`Session\`），数据库操作会**阻塞整个事件循环**——一个慢查询拖累所有请求。

| 维度 | 同步 SQLAlchemy | 异步 SQLAlchemy |
|------|----------------|-----------------|
| 引擎 | \`create_engine\` | \`create_async_engine\` |
| 会话 | \`Session\` / \`sessionmaker\` | \`AsyncSession\` / \`async_sessionmaker\` |
| 驱动 | \`sqlite3\` / \`psycopg2\` | \`aiosqlite\` / \`asyncpg\` |
| 查询 | \`db.query(User).all()\` | \`await db.execute(select(User))\` |
| 阻塞 | 是，慢查询卡住事件循环 | 否，等待 IO 时让出给其他请求 |
| FastAPI 依赖 | \`def get_db()\` | \`async def get_db()\` |

**关键认知**：把 \`def\` 改成 \`async def\` 不等于异步——必须用异步驱动 + 异步引擎，否则只是表面异步、实际阻塞。

## 二、安装

\`\`\`bash
# 异步 SQLAlchemy（SQLAlchemy 1.4+ 内置 async 支持）
pip install sqlalchemy[asyncio]

# 异步 SQLite 驱动（SQLite 的异步版）
pip install aiosqlite

# 生产用 PostgreSQL 异步驱动
pip install asyncpg
\`\`\`

## 三、创建异步引擎与异步会话

\`\`\`python
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# 异步引擎：注意连接串前缀是 sqlite+aiosqlite
# echo=True 打印 SQL，方便学习时观察
engine = create_async_engine(
    "sqlite+aiosqlite:///./test.db",
    echo=False,
)

# 异步会话工厂：async_sessionmaker 是 sessionmaker 的异步版
# expire_on_commit=False：commit 后对象不过期，避免再次访问时触发隐式查询（异步下会报错）
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# 模型基类（SQLAlchemy 2.0 风格）
class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(unique=True)
    email: Mapped[str | None] = None  # 可空字段用 | None
\`\`\`

## 四、异步建表与异步依赖注入

\`\`\`python
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends

# 异步建表：run_sync 让同步的 metadata.create_all 在异步里跑
async def init_db():
    async with engine.begin() as conn:
        # create_all 是同步函数，用 run_sync 包装
        await conn.run_sync(Base.metadata.create_all)

# 异步依赖注入：用 async with 管理会话生命周期
async def get_db():
    async with AsyncSessionLocal() as db:
        try:
            yield db  # yield 让请求结束后自动 close
            await db.commit()
        except Exception:
            await db.rollback()  # 出错回滚，保证数据一致
            raise

app = FastAPI()

@app.on_event("startup")
async def startup():
    await init_db()

@app.get("/users/{user_id}")
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    # 异步查询：必须 await db.execute
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()  # 取单条，没有返回 None
    if user is None:
        raise HTTPException(404, "用户不存在")
    return {"id": user.id, "username": user.username}
\`\`\`

## 五、异步查询示例

\`\`\`python
from sqlalchemy import select, update, delete

# ===== 查询所有 =====
async def list_users(db: AsyncSession):
    # select() 是 2.0 风格查询，替代老的 db.query()
    result = await db.execute(select(User))
    # scalars().all()：取出 ORM 对象列表
    # 不加 scalars() 拿到的是 Row 元组
    users = result.scalars().all()
    return users

# ===== 条件查询 =====
async def find_by_name(db: AsyncSession, name: str):
    result = await db.execute(select(User).where(User.username == name))
    return result.scalar_one_or_none()

# ===== 新增 =====
async def create_user(db: AsyncSession, username: str, email: str):
    user = User(username=username, email=email)
    db.add(user)  # add 是同步的，不需要 await
    await db.flush()  # flush 让 user 拿到自增 id，但不提交事务
    return user

# ===== 批量更新 =====
async def update_emails(db: AsyncSession, new_domain: str):
    # update() 构造 UPDATE 语句，比循环改对象高效得多
    result = await db.execute(
        update(User).where(User.email.is_(None)).values(email=f"none@{new_domain}")
    )
    return result.rowcount  # 受影响行数

# ===== 删除 =====
async def delete_user(db: AsyncSession, user_id: int):
    result = await db.execute(delete(User).where(User.id == user_id))
    return result.rowcount
\`\`\`

## 六、异步关系加载：避免 N+1

N+1 问题是 ORM 的经典坑：查 1 个看板列表，再循环查每个看板的 owner，N 个看板就是 1+N 次查询。

\`\`\`python
from sqlalchemy.orm import relationship, selectinload

class Board(Base):
    __tablename__ = "boards"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    # relationship 定义关系，lazy="raise" 防止隐式加载（异步下会报错）
    owner: Mapped["User"] = relationship(lazy="raise")

# ❌ N+1：先查所有 board，再逐个查 owner（异步下还会因 lazy 报错）
async def bad_example(db: AsyncSession):
    boards = (await db.execute(select(Board))).scalars().all()
    for b in boards:
        # 异步下访问 lazy 关系会抛 MissingGreenlet 异常
        print(b.owner.username)  # 炸！

# ✅ selectinload：用 IN 子查询一次性把所有 owner 查回来，2 次 SQL 搞定
async def good_example(db: AsyncSession):
    result = await db.execute(
        select(Board).options(selectinload(Board.owner))
    )
    boards = result.scalars().all()
    for b in boards:
        print(b.owner.username)  # 安全，owner 已加载到内存
\`\`\`

| 加载策略 | SQL 次数 | 说明 |
|---------|---------|------|
| lazy（默认） | N+1 | 异步下直接报错，不能用 |
| selectinload | 2 | 推荐，IN 子查询批量加载 |
| joinedload | 1 | JOIN 一次查回，适合一对一 |
| subqueryload | 2 | 子查询加载，selectinload 的老版本 |

## 七、同步代码迁移到异步的注意事项

\`\`\`python
# 1. run_sync：把同步操作塞进异步上下文
async def raw_query(db: AsyncSession):
    async with db.begin():
        # run_sync 用来执行需要同步 Connection 的操作
        await db.run_sync(lambda sync_conn: sync_conn.execute(text("VACUUM")))

# 2. 别在异步函数里调用同步阻塞 API
async def bad_sleep():
    import time
    time.sleep(1)  # ❌ 阻塞整个事件循环！
    # 应该用 asyncio.sleep(1)

# 3. expire_on_commit=False 很重要
# 默认 commit 后对象过期，下次访问属性会触发隐式查询
# 异步下隐式查询没有 await，直接报 MissingGreenlet
# 所以创建 async_sessionmaker 时一定要 expire_on_commit=False
\`\`\`

## 八、Demo：完整异步 CRUD（可运行）

\`\`\`python
# Demo：异步 SQLAlchemy 完整 CRUD，用 asyncio.run 包装
# 运行：python main.py
import asyncio
from sqlalchemy import select, update, delete, ForeignKey
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, selectinload

# ===== 模型定义 =====
class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(unique=True)
    boards: Mapped[list["Board"]] = relationship(back_populates="owner")

class Board(Base):
    __tablename__ = "boards"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    owner: Mapped["User"] = relationship(back_populates="boards")

# ===== 引擎与会话 =====
# 用内存库 + aiosqlite，跑完即销毁，不产生文件
engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)

# ===== 异步 CRUD 函数 =====
async def create_user(db: AsyncSession, username: str) -> User:
    user = User(username=username)
    db.add(user)
    await db.flush()  # 拿到自增 id
    return user

async def create_board(db: AsyncSession, title: str, owner_id: int) -> Board:
    board = Board(title=title, owner_id=owner_id)
    db.add(board)
    await db.flush()
    return board

async def list_boards_with_owner(db: AsyncSession) -> list[Board]:
    # selectinload 一次性加载 owner，避免 N+1
    result = await db.execute(select(Board).options(selectinload(Board.owner)))
    return list(result.scalars().all())

async def rename_user(db: AsyncSession, user_id: int, new_name: str) -> int:
    result = await db.execute(
        update(User).where(User.id == user_id).values(username=new_name)
    )
    return result.rowcount

# ===== 主流程 =====
async def main():
    # 建表
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 创建 2 个用户
        u1 = await create_user(db, "tom")
        u2 = await create_user(db, "jerry")
        await db.flush()

        # 给 tom 建 2 个看板
        await create_board(db, "工作", u1.id)
        await create_board(db, "生活", u1.id)
        await create_board(db, "学习", u2.id)
        await db.commit()  # 提交所有变更

        # 查询看板 + owner（selectinload 避免 N+1）
        boards = await list_boards_with_owner(db)
        print("== 看板列表 ==")
        for b in boards:
            print(f"  {b.title} - owner: {b.owner.username}")

        # 改名
        n = await rename_user(db, u1.id, "tom_new")
        await db.commit()
        print(f"\n改名影响 {n} 行")

        # 验证
        boards = await list_boards_with_owner(db)
        print("== 改名后 ==")
        for b in boards:
            if b.owner_id == u1.id:
                print(f"  {b.title} - owner: {b.owner.username}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

## 九、本章小结

| 概念 | 一句话 |
|------|-------|
| create_async_engine | 异步引擎，连接串要带 +aiosqlite / +asyncpg |
| AsyncSession | 异步会话，查询都要 await |
| async_sessionmaker | 异步会话工厂，记得 expire_on_commit=False |
| select + await execute | 2.0 风格异步查询 |
| selectinload | 异步加载关系的推荐方式，避免 N+1 |
| run_sync | 在异步上下文里跑同步操作 |
| lazy=raise | 显式禁止隐式加载，防止异步下报错 |

下章我们用 RBAC 实现细粒度的角色权限控制。`,
  },

  // ============================================================
  // 第 40 章：RBAC 角色权限控制
  // ============================================================
  {
    id: "ff-rbac",
    group: "进阶与生产实践",
    icon: "🎭",
    title: "RBAC 角色权限控制",
    content: `# RBAC 角色权限控制

## 一、RBAC 概念：用户、角色、权限三层模型

前面的认证只区分「登录 / 未登录」。但真实系统里，管理员能删任意看板，普通用户只能删自己的——这就需要**授权**（authorization）。

RBAC（Role-Based Access Control）= 基于角色的访问控制，三层结构：

\`\`\`
用户(User) ──N:M── 角色(Role) ──N:M── 权限(Permission)
  tom            admin              board:delete:any
  jerry          editor             board:delete:own
                                  card:create
\`\`\`

为什么是三层而不是「用户—权限」直接挂钩？

| 方案 | 改一个权限要动多少 | 适合 |
|------|------------------|------|
| 用户—权限直接关联 | 每个用户都改一遍 | 2-3 人的小系统 |
| RBAC（用户—角色—权限）| 只改角色一次 | 几十上百人的系统 |

角色是**权限的集合**，用户通过角色间接获得权限，改权限只改角色。

## 二、数据库设计：五张表

\`\`\`python
from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base

# 关联表 1：user_role（用户与角色的多对多）
# Table 直接定义，不需要模型类，因为它只存两个外键
user_role = Table(
    "user_role",
    Base.metadata,
    Column("user_id", ForeignKey("users.id"), primary_key=True),
    Column("role_id", ForeignKey("roles.id"), primary_key=True),
    # 复合主键防止同一个用户被赋同一个角色两次
)

# 关联表 2：role_permission（角色与权限的多对多）
role_permission = Table(
    "role_permission",
    Base.metadata,
    Column("role_id", ForeignKey("roles.id"), primary_key=True),
    Column("permission_id", ForeignKey("permissions.id"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True)
    # secondary 指向关联表，back_populates 双向导航
    roles: list["Role"] = relationship(secondary=user_role, back_populates="users")

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True)  # admin / editor / viewer
    users: list["User"] = relationship(secondary=user_role, back_populates="roles")
    permissions: list["Permission"] = relationship(secondary=role_permission, back_populates="roles")

class Permission(Base):
    __tablename__ = "permissions"
    id = Column(Integer, primary_key=True)
    # 权限用「资源:动作」格式，一目了然
    code = Column(String(50), unique=True)  # board:delete:any / card:create
    roles: list["Role"] = relationship(secondary=role_permission, back_populates="permissions")
\`\`\`

## 三、权限检查依赖：require_permission

\`\`\`python
from fastapi import Depends, HTTPException, Request
from functools import wraps

# 权限缓存：避免每个请求都查数据库
# key=user_id, value=权限集合。实际项目用 Redis 缓存
_permission_cache: dict[int, set[str]] = {}

async def get_user_permissions(user_id: int, db) -> set[str]:
    """查用户的所有权限（通过角色聚合）。"""
    if user_id in _permission_cache:
        return _permission_cache[user_id]
    # 查 user -> roles -> permissions，一次 JOIN 查全
    result = await db.execute(
        select(Permission.code)
        .join(role_permission, role_permission.c.permission_id == Permission.id)
        .join(Role, Role.id == role_permission.c.role_id)
        .join(user_role, user_role.c.role_id == Role.id)
        .where(user_role.c.user_id == user_id)
    )
    perms = set(result.scalars().all())
    _permission_cache[user_id] = perms
    return perms

def require_permission(code: str):
    """权限检查依赖工厂：require_permission("board:delete:any")"""
    async def checker(current_user = Depends(get_current_user), db = Depends(get_db)):
        perms = await get_user_permissions(current_user.id, db)
        if code not in perms:
            # 403 而不是 401：401 是未登录，403 是登录了但没权限
            raise HTTPException(403, detail=f"需要权限: {code}")
        return current_user
    return checker

# 用法：路由上挂依赖，简洁清晰
@app.delete("/boards/{board_id}")
async def delete_board(board_id: int, user = Depends(require_permission("board:delete:any"))):
    ...
\`\`\`

## 四、JWT 中携带角色信息

\`\`\`python
import jwt
from datetime import datetime, timedelta

SECRET = "your-secret"

def create_token(user_id: int, role_names: list[str]) -> str:
    # 把角色塞进 JWT，这样不用每次查库就知道用户的角色
    payload = {
        "sub": user_id,
        "roles": role_names,  # ["admin", "editor"]
        "exp": datetime.utcnow() + timedelta(hours=2),
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

def decode_roles(token: str) -> list[str]:
    payload = jwt.decode(token, SECRET, algorithms=["HS256"])
    return payload.get("roles", [])

# 注意：JWT 里的角色是「签发时」的快照
# 用户被撤销角色后，旧 token 里的角色还在 → 需要短过期时间 + 黑名单机制
\`\`\`

## 五、实战：管理员删任意看板，普通用户删自己的

\`\`\`python
from fastapi import Depends, HTTPException

@app.delete("/boards/{board_id}")
async def delete_board(
    board_id: int,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    perms = await get_user_permissions(current_user.id, db)
    # 查看板是否存在
    board = await db.get(Board, board_id)
    if board is None:
        raise HTTPException(404, "看板不存在")

    # 权限判断：有 board:delete:any 可删任意，有 board:delete:own 只能删自己的
    if "board:delete:any" in perms:
        pass  # 管理员，放行
    elif "board:delete:own" in perms:
        if board.owner_id != current_user.id:  # 不是自己的
            raise HTTPException(403, "只能删除自己的看板")
    else:
        raise HTTPException(403, "无删除权限")

    await db.delete(board)
    await db.commit()
    return {"msg": "已删除"}
\`\`\`

## 六、权限缓存优化

每个请求都查权限表会拖慢接口。两种缓存策略：

\`\`\`python
# 策略 1：进程内缓存（简单，适合单实例）
import time
_cache: dict[int, tuple[set[str], float]] = {}  # user_id -> (perms, expire_at)
CACHE_TTL = 60  # 60 秒过期

def get_perms_cached(user_id, db):
    if user_id in _cache and _cache[user_id][1] > time.time():
        return _cache[user_id][0]
    perms = query_perms(user_id, db)
    _cache[user_id] = (perms, time.time() + CACHE_TTL)
    return perms

# 策略 2：Redis 缓存（适合多实例，见下章）
# 权限变更时主动删 key（DEL user:1:perms），保证一致性
\`\`\`

**缓存失效时机**：给用户加/减角色时，**必须**删除该用户的缓存，否则权限变更不生效。

## 七、Demo：完整 RBAC（内存模拟）

\`\`\`python
# Demo：用内存模拟数据库的 RBAC，展示三层权限模型
# 运行：python main.py
from fastapi import FastAPI, HTTPException, Header

app = FastAPI()

# ===== 内存"数据库" =====
# 用户表
users = {
    1: {"username": "admin", "role_ids": [1]},
    2: {"username": "tom",   "role_ids": [2]},   # 普通用户
    3: {"username": "jerry", "role_ids": [2, 3]}, # 有编辑角色的普通用户
}
# 角色表
roles = {
    1: {"name": "admin",  "permission_ids": [1, 2, 3, 4]},
    2: {"name": "user",   "permission_ids": [4]},          # 只能删自己的看板
    3: {"name": "editor", "permission_ids": [3, 4]},       # 能建卡片 + 删自己的看板
}
# 权限表
permissions = {
    1: "board:delete:any",   # 删任意看板
    2: "board:create",       # 建看板
    3: "card:create",        # 建卡片
    4: "board:delete:own",   # 删自己的看板
}
# 看板表
boards = {
    10: {"title": "工作", "owner_id": 2},
    11: {"title": "学习", "owner_id": 1},
}

# ===== 权限查询（带缓存） =====
_perm_cache: dict[int, set[str]] = {}

def get_user_permissions(user_id: int) -> set[str]:
    # 命中缓存直接返回，避免重复计算
    if user_id in _perm_cache:
        return _perm_cache[user_id]
    user = users.get(user_id)
    if not user:
        return set()
    perms = set()
    for rid in user["role_ids"]:
        for pid in roles[rid]["permission_ids"]:
            perms.add(permissions[pid])
    _perm_cache[user_id] = perms  # 写缓存
    return perms

# ===== 模拟认证：用 X-User-Id 头代替 JWT =====
def get_current_user(x_user_id: int = Header(...)):
    if x_user_id not in users:
        raise HTTPException(401, "未登录")
    return {"id": x_user_id, **users[x_user_id]}

def require_permission(code: str):
    """权限依赖工厂。"""
    def checker(user = Depends(get_current_user)):
        perms = get_user_permissions(user["id"])
        if code not in perms:
            raise HTTPException(403, f"需要权限: {code}")
        return user
    return checker

# ===== 路由 =====
@app.delete("/boards/{board_id}")
async def delete_board(board_id: int, user = Depends(get_current_user)):
    board = boards.get(board_id)
    if board is None:
        raise HTTPException(404, "看板不存在")
    perms = get_user_permissions(user["id"])
    # 分层判断：先看有没有"删任意"，再看"删自己的"
    if "board:delete:any" in perms:
        pass
    elif "board:delete:own" in perms:
        if board["owner_id"] != user["id"]:
            raise HTTPException(403, "只能删除自己的看板")
    else:
        raise HTTPException(403, "无删除权限")
    del boards[board_id]
    return {"msg": f"已删除看板 {board_id}"}

@app.post("/cards")
async def create_card(user = Depends(require_permission("card:create"))):
    # require_permission 已拦截无权限用户，这里直接放行
    return {"msg": f"{user['username']} 创建了卡片"}

# ===== 自测 =====
if __name__ == "__main__":
    from fastapi.testclient import TestClient
    client = TestClient(app)
    # admin 删任意看板
    r = client.delete("/boards/11", headers={"X-User-Id": "1"})
    print("admin 删别人的看板:", r.status_code, r.json())
    # tom 删自己的看板
    r = client.delete("/boards/10", headers={"X-User-Id": "2"})
    print("tom 删自己的看板:", r.status_code, r.json())
    # tom 删别人的看板
    boards[10] = {"title": "工作", "owner_id": 2}  # 重建测试数据
    r = client.delete("/boards/11", headers={"X-User-Id": "2"})
    print("tom 删别人的看板:", r.status_code, r.json())
    # tom 建卡片（无权限）
    r = client.post("/cards", headers={"X-User-Id": "2"})
    print("tom 建卡片:", r.status_code, r.json())
    # jerry 建卡片（有 editor 角色）
    r = client.post("/cards", headers={"X-User-Id": "3"})
    print("jerry 建卡片:", r.status_code, r.json())
\`\`\`

## 八、本章小结

| 概念 | 一句话 |
|------|-------|
| RBAC | 用户—角色—权限三层模型，改权限只改角色 |
| 关联表 | 多对多关系用 Table 定义中间表 |
| 权限码 | 「资源:动作」格式，如 board:delete:any |
| require_permission | 权限依赖工厂，复用性强 |
| 403 vs 401 | 401 未登录，403 登录了但没权限 |
| 权限缓存 | 避免每请求查库，变更时要主动失效 |
| JWT 角色 | 角色写进 token，注意是快照、需短过期 |

下章我们学 API 限流，保护接口不被刷爆。`,
  },

  // ============================================================
  // 第 41 章：API 限流 (slowapi)
  // ============================================================
  {
    id: "ff-ratelimit",
    group: "进阶与生产实践",
    icon: "🚦",
    title: "API 限流 (slowapi)",
    content: `# API 限流 (slowapi)

## 一、为什么需要限流

不限流的接口就像不设闸的水库，迟早被冲垮：

| 场景 | 不限流的后果 |
|------|-------------|
| 恶意爬虫 | 数据被批量抓走，服务器被拖慢 |
| 暴力破解登录 | 密码被穷举破解 |
| 下游服务限流 | 上游无节制调用，下游被打挂 |
| 促销秒杀 | 瞬间流量打垮数据库 |

限流就是在流量和系统承载力之间装一个「闸门」，超量请求返回 429（Too Many Requests）。

## 二、安装 slowapi

\`\`\`bash
# slowapi 是 FastAPI 最常用的限流库，基于 limits 库
pip install slowapi
\`\`\`

## 三、基本用法

\`\`\`python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request

# key_func 决定"按什么限流"——get_remote_address 按客户端 IP
limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
# 把限流状态对象和异常处理器挂到 app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/hello")
# @limiter.limit 装饰器：1 分钟最多 5 次
# 注意：路由函数必须带 request 参数，slowapi 要从 request 取 key
@limiter.limit("5/minute")
async def hello(request: Request):
    return {"msg": "hello"}
\`\`\`

限流表达式语法：

| 写法 | 含义 |
|------|------|
| \`"5/minute"\` | 每分钟 5 次 |
| \`"100/hour"\` | 每小时 100 次 |
| \`"10/second"\` | 每秒 10 次 |
| \`"5/minute;10/hour"\` | 分钟和小时双限制，同时满足 |

## 四、全局默认限流 vs 单接口限流

\`\`\`python
from slowapi.middleware import SlowAPIMiddleware

# 全局默认限流：所有接口都套一个兜底限制
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
app.state.limiter = limiter
# SlowAPIMiddleware 让未显式标注的接口也走默认限流
app.add_middleware(SlowAPIMiddleware)

@app.get("/public")
# 不标注 → 走默认 100/minute
async def public(request: Request):
    return {"msg": "公开接口"}

@app.post("/login")
# 显式标注覆盖默认值
@limiter.limit("5/minute")
async def login(request: Request):
    return {"msg": "登录"}
\`\`\`

## 五、基于 IP / 用户 / API Key 的限流策略

\`\`\`python
# key_func 决定了"按谁限流"，这是限流策略的核心
def get_remote_address(request: Request) -> str:
    """按 IP 限流（默认）。"""
    # 注意：如果前面有 nginx 反代，要用 X-Forwarded-For 取真实 IP
    return request.client.host if request.client else "unknown"

def user_id_key(request: Request) -> str:
    """按用户 ID 限流：登录用户按账号限，更精准。"""
    # 从 JWT 解析 user_id（伪代码）
    token = request.headers.get("Authorization", "")
    user_id = parse_jwt_user(token) or "anonymous"
    return str(user_id)

def api_key_func(request: Request) -> str:
    """按 API Key 限流：第三方接入按 key 限流。"""
    return request.headers.get("X-API-Key", "anonymous")

# 不同接口用不同策略
limiter = Limiter(key_func=get_remote_address)

@app.get("/search")
@limiter.limit("10/minute", key_func=get_remote_address)  # 按 IP
async def search(request: Request):
    ...

@app.post("/api/import")
@limiter.limit("3/hour", key_func=api_key_func)  # 按 API Key
async def import_data(request: Request):
    ...
\`\`\`

## 六、自定义限流响应（429 + Retry-After）

默认的 429 响应比较简陋，生产环境要返回友好的 JSON 和 \`Retry-After\` 头：

\`\`\`python
from slowapi.errors import RateLimitExceeded
from fastapi import Request, JSONResponse
import time

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    # exc.limit.amount / exc.limit.unit：触发限流的额度信息
    retry_after = 60  # 建议客户端多久后重试（秒）
    return JSONResponse(
        status_code=429,
        content={
            "error": "too_many_requests",
            "message": "请求太频繁，请稍后再试",
            "retry_after": retry_after,
        },
        headers={
            # Retry-After 是标准 HTTP 头，客户端会据此退避
            "Retry-After": str(retry_after),
        },
    )
\`\`\`

## 七、分布式限流：Redis 作为存储后端

默认 slowapi 用内存存储计数器，**多进程/多实例下计数不共享**，限流会失效。生产环境要用 Redis：

\`\`\`python
from slowapi import Limiter
from slowapi.util import get_remote_address

# storage_uri 指向 Redis，所有 worker 共享计数
# 这样 4 个 gunicorn worker 也能正确统计总请求数
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri="redis://localhost:6379",
    # 还可以配 storage_options={"socket_timeout": 0.5} 防止 Redis 卡住拖慢请求
)

# 默认策略：固定窗口（fixed window）
# 还可用 sliding window：strategy="sliding-window"，更平滑
\`\`\`

## 八、Demo：模拟登录限流（可运行）

\`\`\`python
# Demo：用字典模拟 slowapi 的固定窗口限流，演示登录接口 1 分钟最多 5 次
# 运行：python main.py
import time
from fastapi import FastAPI, Request, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

# ===== 简易限流器：固定窗口算法 =====
# 计数器：key -> (count, window_start_time)
_rate_store: dict[str, tuple[int, float]] = {}
WINDOW = 60  # 窗口 60 秒
LIMIT = 5    # 每窗口 5 次

def rate_limit(key: str):
    """固定窗口限流：在窗口内计数，超限拒绝。"""
    now = time.time()
    if key in _rate_store:
        count, start = _rate_store[key]
        # 窗口未过期：计数 +1
        if now - start < WINDOW:
            if count >= LIMIT:
                return False  # 超限
            _rate_store[key] = (count + 1, start)
            return True
    # 窗口过期或新 key：开新窗口
    _rate_store[key] = (1, now)
    return True

def get_client_ip(request: Request) -> str:
    # 优先取 X-Forwarded-For（反代场景），否则取直连 IP
    xff = request.headers.get("X-Forwarded-For")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

# ===== 模拟登录接口 =====
@app.post("/login")
async def login(request: Request):
    ip = get_client_ip(request)
    if not rate_limit(ip):
        # 429 + Retry-After：告诉客户端多久后重试
        raise HTTPException(
            status_code=429,
            detail="登录尝试过于频繁，请 1 分钟后再试",
            headers={"Retry-After": str(WINDOW)},
        )
    return {"msg": "登录成功（模拟）"}

# ===== 自测 =====
if __name__ == "__main__":
    client = TestClient(app)
    print("== 同一 IP 连续请求 7 次 ==")
    for i in range(7):
        r = client.post("/login")
        status = "✅通过" if r.status_code == 200 else "❌限流"
        print(f"  第 {i+1} 次: {r.status_code} {status}  {r.json().get('msg', r.json().get('detail', ''))}")

    print("\n== 模拟窗口过期后重试（手动调时间）==")
    # 把窗口起始时间往前调 61 秒，模拟窗口过期
    for k in list(_rate_store.keys()):
        _rate_store[k] = (0, time.time() - 61)
    r = client.post("/login")
    print(f"  重新请求: {r.status_code} {r.json()}")
\`\`\`

## 九、限流算法对比

| 算法 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| 固定窗口 | 时间窗口内计数 | 简单 | 窗口边界突刺（59 秒和 01 秒各 5 次 = 1 秒内 10 次）|
| 滑动窗口 | 按时间滑动的窗口 | 平滑 | 实现稍复杂 |
| 令牌桶 | 匀速发令牌，桶满丢弃 | 允许突发 | 需维护令牌 |
| 漏桶 | 匀速漏水，溢出丢弃 | 严格匀速 | 不允许突发 |

slowapi 默认用固定窗口，配 \`strategy="sliding-window"\` 可切换滑动窗口。

## 十、本章小结

| 概念 | 一句话 |
|------|-------|
| slowapi | FastAPI 常用限流库 |
| key_func | 决定按谁限流（IP/用户/API Key）|
| @limiter.limit | 装饰器标注单接口限流 |
| default_limits | 全局默认兜底限流 |
| 429 + Retry-After | 限流标准响应 |
| Redis 存储 | 多实例共享计数，生产必用 |
| 固定窗口 | 简单但有边界突刺 |
| 滑动窗口 | 平滑但实现稍复杂 |

下章我们用 Redis 给接口加缓存。`,
  },

  // ============================================================
  // 第 42 章：Redis 缓存集成
  // ============================================================
  {
    id: "ff-redis",
    group: "进阶与生产实践",
    icon: "⚡",
    title: "Redis 缓存集成",
    content: `# Redis 缓存集成

## 一、为什么需要缓存

每查一次看板列表都要走数据库，数据库是系统里最慢的一环。缓存把热点数据放内存，命中时直接返回，跳过数据库：

| 维度 | 查数据库 | 查缓存（Redis）|
|------|---------|---------------|
| 延迟 | 10-50ms | 0.1-1ms |
| 数据库压力 | 高 | 低 |
| 数据新鲜度 | 最新 | 可能有延迟 |
| 适用场景 | 写多读少 | 读多写少 |

**核心权衡**：缓存用「一致性」换「性能」——缓存数据可能不是最新，但够快。

## 二、安装

\`\`\`bash
# redis-py 内置异步支持（redis.asyncio），不需要单独的 aioredis
pip install redis

# 异步客户端在 redis.asyncio 包里
# 连接：redis.asyncio.Redis(host='localhost', port=6379)
\`\`\`

## 三、连接 Redis

\`\`\`python
import redis.asyncio as aioredis
from contextlib import asynccontextmanager

# 全局连接池：复用连接，避免每次请求都新建 TCP 连接
redis_client = aioredis.Redis(
    host="localhost",
    port=6379,
    db=0,
    decode_responses=True,  # 自动把 bytes 解码成 str，省去手动 decode
    # socket_timeout=0.5：超时快速失败，避免 Redis 卡住拖垮整个请求
    socket_timeout=0.5,
)

# 健康检查：启动时确认连得上
async def check_redis():
    try:
        await redis_client.ping()
        print("Redis 连接正常")
    except Exception as e:
        print(f"Redis 连接失败: {e}")
\`\`\`

## 四、缓存模式：Cache-Aside

Cache-Aside（旁路缓存）是最常用的模式：**读时查缓存，未命中查 DB 并回填缓存**。

\`\`\`python
import json

async def get_board_cached(db, board_id: int):
    cache_key = f"board:{board_id}"
    # 1. 先查缓存
    raw = await redis_client.get(cache_key)
    if raw:
        # 命中缓存：直接返回，跳过数据库
        return json.loads(raw)
    # 2. 未命中：查数据库
    board = await db.get(Board, board_id)
    if board is None:
        return None
    data = {"id": board.id, "title": board.title}
    # 3. 回填缓存：TTL 60 秒，到期自动失效
    await redis_client.setex(cache_key, 60, json.dumps(data))
    return data
\`\`\`

为什么先查缓存再查 DB？因为缓存快（内存）而 DB 慢（磁盘），优先走快路。

## 五、缓存失效策略

| 策略 | 原理 | 适用 |
|------|------|------|
| TTL 过期 | setex 设过期时间，到期 Redis 自动删 | 兜底方案，所有缓存都该设 |
| 主动失效 | 数据更新时主动删缓存 key | 需要强一致性的场景 |
| LRU 淘汰 | Redis 内存满时按最少使用淘汰 | 兜底，依赖 maxmemory 配置 |

\`\`\`python
# 主动失效：更新看板时删除缓存
async def update_board(db, board_id: int, new_title: str):
    board = await db.get(Board, board_id)
    board.title = new_title
    await db.commit()
    # 数据库改完后，删缓存（不是更新缓存！）
    # 删比更新安全：避免并发下「旧值覆盖新值」
    await redis_client.delete(f"board:{board_id}")
\`\`\`

**为什么删缓存而不是更新缓存？** 并发场景下，更新缓存可能出现：A 读到旧值准备回填 → B 改 DB 并更新缓存为新值 → A 回填旧值覆盖新值。删缓存则没这个问题——下次读自然 miss 再查 DB。

## 六、用 FastAPI 依赖注入封装缓存层

\`\`\`python
from fastapi import Depends

# 缓存依赖：注入一个 cache 对象，方便测试时替换成假实现
async def get_cache():
    return redis_client

@app.get("/boards/{board_id}")
async def read_board(
    board_id: int,
    db: AsyncSession = Depends(get_db),
    cache = Depends(get_cache),
):
    key = f"board:{board_id}"
    # 查缓存
    raw = await cache.get(key)
    if raw:
        return json.loads(raw)
    # miss 查 DB
    board = await db.get(Board, board_id)
    if not board:
        raise HTTPException(404, "看板不存在")
    data = {"id": board.id, "title": board.title}
    await cache.setex(key, 60, json.dumps(data))
    return data
\`\`\`

## 七、缓存穿透与雪崩

\`\`\`python
# ===== 缓存穿透：查不存在的 key，每次都打到 DB =====
# 攻击者疯狂查 board:99999（不存在），缓存永远 miss，DB 被打爆
# 解决：把"不存在"也缓存起来（空值缓存），短 TTL

async def get_board_safe(db, board_id):
    key = f"board:{board_id}"
    raw = await redis_client.get(key)
    if raw == "NULL":
        return None  # 缓存了"不存在"，直接返回
    if raw:
        return json.loads(raw)
    board = await db.get(Board, board_id)
    if board is None:
        # 缓存空值，30 秒后过期（比正常 TTL 短，避免占内存）
        await redis_client.setex(key, 30, "NULL")
        return None
    await redis_client.setex(key, 60, json.dumps({"id": board.id, "title": board.title}))
    return board

# ===== 缓存雪崩：大量 key 同时过期，瞬间全打到 DB =====
# 解决：TTL 加随机抖动，让过期时间分散

import random
async def set_cache_with_jitter(key, value, base_ttl=60):
    # TTL 在 60~90 秒间随机，避免集中过期
    jitter = random.randint(0, 30)
    await redis_client.setex(key, base_ttl + jitter, value)
\`\`\`

## 八、Demo：Cache-Aside 模式（字典模拟 Redis）

\`\`\`python
# Demo：用字典模拟 Redis，演示 Cache-Aside 缓存模式
# 运行：python main.py
import json
import time

# ===== 字典模拟的 Redis =====
class FakeRedis:
    def __init__(self):
        self._store: dict[str, tuple[str, float]] = {}  # key -> (value, expire_at)

    async def get(self, key: str):
        if key in self._store:
            value, expire_at = self._store[key]
            if expire_at > time.time():  # 未过期
                return value
            del self._store[key]  # 过期清理
        return None

    async def setex(self, key: str, ttl: int, value: str):
        self._store[key] = (value, time.time() + ttl)

    async def delete(self, key: str):
        self._store.pop(key, None)

# ===== 模拟数据库 =====
db_data = {
    1: {"id": 1, "title": "工作看板"},
    2: {"id": 2, "title": "学习看板"},
}
db_query_count = 0  # 统计 DB 查询次数，验证缓存效果

async def db_get_board(board_id: int):
    global db_query_count
    db_query_count += 1
    print(f"    [DB] 查询看板 {board_id}（第 {db_query_count} 次查库）")
    return db_data.get(board_id)

# ===== Cache-Aside 实现 =====
cache = FakeRedis()

async def get_board(board_id: int):
    key = f"board:{board_id}"
    # 1. 查缓存
    raw = await cache.get(key)
    if raw is not None:
        print(f"  [缓存命中] board:{board_id}")
        return json.loads(raw)
    # 2. miss 查 DB
    print(f"  [缓存未命中] board:{board_id}")
    board = await db_get_board(board_id)
    if board is None:
        await cache.setex(key, 3, "NULL")  # 空值缓存，3 秒过期
        return None
    # 3. 回填缓存
    await cache.setex(key, 3, json.dumps(board))
    return board

async def update_board(board_id: int, new_title: str):
    db_data[board_id]["title"] = new_title
    # 主动失效：改完数据删缓存
    await cache.delete(f"board:{board_id}")
    print(f"  [主动失效] 删除 board:{board_id} 缓存")

# ===== 演示 =====
if __name__ == "__main__":
    import asyncio

    async def main():
        print("== 第 1 次查 board:1（应 miss，查 DB）==")
        await get_board(1)

        print("\n== 第 2 次查 board:1（应命中缓存）==")
        await get_board(1)

        print("\n== 更新 board:1（删除缓存）==")
        await update_board(1, "新工作看板")

        print("\n== 第 3 次查 board:1（缓存被删，应 miss 查 DB）==")
        await get_board(1)

        print("\n== 等 4 秒让缓存过期 ==")
        await asyncio.sleep(4)

        print("\n== 第 4 次查 board:1（过期，应 miss 查 DB）==")
        await get_board(1)

        print(f"\n总共查 DB 次数: {db_query_count}")

    asyncio.run(main())
\`\`\`

## 九、本章小结

| 概念 | 一句话 |
|------|-------|
| Cache-Aside | 读时查缓存，miss 查 DB 并回填 |
| TTL 过期 | setex 设过期时间，兜底失效 |
| 主动失效 | 改数据时删缓存（删优于更新）|
| 缓存穿透 | 查不存在的 key，用空值缓存解决 |
| 缓存雪崩 | key 同时过期，TTL 加随机抖动 |
| redis.asyncio | 异步 Redis 客户端 |
| decode_responses | 自动解码 bytes 为 str |

下章我们定制 OpenAPI 文档，让接口文档更好用。`,
  },

  // ============================================================
  // 第 43 章：OpenAPI 文档定制
  // ============================================================
  {
    id: "ff-openapi",
    group: "进阶与生产实践",
    icon: "📚",
    title: "OpenAPI 文档定制",
    content: `# OpenAPI 文档定制

## 一、FastAPI 自动生成 OpenAPI 的原理

FastAPI 根据你的路由、Pydantic 模型、类型注解，自动生成一份 OpenAPI 规范的 JSON，再用 Swagger UI / ReDoc 渲染成可视化文档。

\`\`\`
路由 + 类型注解  →  OpenAPI JSON  →  Swagger UI / ReDoc
  (你的代码)        (/openapi.json)     (/docs, /redoc)
\`\`\`

访问 \`/openapi.json\` 就能看到原始 JSON，这是定制的基础。

## 二、自定义 metadata

\`\`\`python
from fastapi import FastAPI

app = FastAPI(
    title="TaskBoard API",
    description="""
## 任务看板系统 API

提供看板、列表、卡片的增删改查能力。

### 主要功能
- 用户认证（JWT）
- 看板管理
- 卡片拖拽

文档里的 Markdown 会被渲染，支持标题、列表、代码块。
""",
    version="1.0.0",
    # 联系方式：显示在文档页脚
    contact={
        "name": "技术支持",
        "email": "support@taskboard.com",
        "url": "https://taskboard.com/support",
    },
    # 开源协议
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    # 文档地址自定义（默认 /docs 和 /redoc）
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)
\`\`\`

## 三、路由标签分组

\`\`\`python
from fastapi import APIRouter

@app.get("/boards", tags=["看板管理"])
async def list_boards():
    """获取所有看板。"""  # docstring 会变成接口描述
    ...

@app.post("/boards", tags=["看板管理"])
async def create_board():
    ...

@app.get("/users/me", tags=["用户"])
async def me():
    ...

# tags 在文档里会自动分组，用户一眼就能找到接口
# 还可以在 app 里定义 tags 元数据，加描述和顺序
app = FastAPI(
    openapi_tags=[
        {"name": "看板管理", "description": "看板的增删改查"},
        {"name": "用户", "description": "用户信息与认证"},
    ]
)
\`\`\`

## 四、接口描述与文档

\`\`\`python
from pydantic import BaseModel, Field
from typing import Optional

class BoardCreate(BaseModel):
    # Field 的 description 会显示在文档的请求体示例里
    title: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="看板标题，不能为空",
        examples=["工作看板"],
    )
    color: Optional[str] = Field(
        default="blue",
        description="看板颜色：blue/green/red",
        examples=["green"],
    )

class BoardResponse(BaseModel):
    id: int = Field(..., description="看板 ID")
    title: str
    color: str

@app.post(
    "/boards",
    tags=["看板管理"],
    status_code=201,
    response_model=BoardResponse,  # response_model 让文档显示响应结构
    summary="创建看板",            # 一句话摘要
    description="创建一个新的看板，每个用户最多 10 个。",  # 详细描述
    responses={
        400: {"description": "超过看板上限"},
        401: {"description": "未认证"},
    },
)
async def create_board(board: BoardCreate):
    """
    docstring 也会作为描述，和 description 参数二选一即可。

    支持 Markdown：
    - 列表项 1
    - 列表项 2
    """
    ...
\`\`\`

## 五、自定义 OpenAPI schema

有时你想过滤掉内部接口，或加自定义字段：

\`\`\`python
from fastapi.openapi.utils import get_openapi

def custom_openapi():
    # 缓存：避免每次请求都重新生成 schema
    if app.openapi_schema:
        return app.openapi_schema
    # 生成默认 schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    # 过滤掉标记为 internal 的路由（不在文档暴露）
    openapi_schema["paths"] = {
        path: methods
        for path, methods in openapi_schema["paths"].items()
        if "/internal" not in path
    }
    # 加自定义字段（如服务端点信息）
    openapi_schema["info"]["x-logo"] = {"url": "https://example.com/logo.png"}
    app.openapi_schema = openapi_schema
    return openapi_schema

# 覆盖 app.openapi，让 /openapi.json 返回自定义版
app.openapi = custom_openapi
\`\`\`

## 六、生成离线文档

\`\`\`python
import json

@app.get("/export-openapi")
async def export_openapi():
    """导出 OpenAPI JSON，方便离线存档或交给前端。"""
    return app.openapi()

# 命令行导出：python -c "import json; from app.main import app; print(json.dumps(app.openapi()))" > openapi.json
# 再用 redoc-cli 生成静态 HTML：redoc-cli bundle openapi.json -o docs.html
\`\`\`

## 七、集成 Swagger UI / ReDoc 自定义主题

\`\`\`python
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html

# 关闭默认文档，自己接管 /docs 路由
app = FastAPI(docs_url=None, redoc_url=None)

@app.get("/docs", include_in_schema=False)  # 不让文档接口自己出现在文档里
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=f"{app.title} - API 文档",
        # 自定义 Swagger UI 参数
        swagger_ui_parameters={
            "defaultModelsExpandDepth": -1,  # 默认折叠 Models
            "docExpansion": "none",          # 默认折叠接口
            "persistAuthorization": True,    # 刷新后保留认证 token
        },
    )

# persistAuthorization 很实用：调试时不用每次重新填 token
\`\`\`

## 八、Demo：完整 API 文档配置

\`\`\`python
# Demo：展示完整的 OpenAPI 文档配置，启动后访问 /docs 查看效果
# 运行：python main.py （然后浏览器打开 http://localhost:8000/docs）
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

app = FastAPI(
    title="TaskBoard API",
    description="""
## 任务看板系统

- 用户认证
- 看板管理
- 卡片管理
""",
    version="1.0.0",
    contact={"name": "技术支持", "email": "support@example.com"},
    license_info={"name": "MIT"},
    openapi_tags=[
        {"name": "看板管理", "description": "看板的增删改查"},
        {"name": "用户", "description": "用户信息"},
    ],
)

# ===== 模型 =====
class BoardCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=50, description="看板标题", examples=["工作"])
    color: Optional[str] = Field("blue", description="颜色", examples=["green"])

class BoardResponse(BaseModel):
    id: int
    title: str
    color: str

# ===== 内存存储 =====
_boards: dict[int, dict] = {}
_next_id = 1

# ===== 路由 =====
@app.get("/boards", tags=["看板管理"], response_model=list[BoardResponse], summary="获取看板列表")
async def list_boards():
    """返回当前所有看板。"""
    return list(_boards.values())

@app.post("/boards", tags=["看板管理"], response_model=BoardResponse, status_code=201, summary="创建看板")
async def create_board(board: BoardCreate):
    """创建新看板，标题不能为空。"""
    global _next_id
    b = {"id": _next_id, "title": board.title, "color": board.color}
    _boards[_next_id] = b
    _next_id += 1
    return b

@app.get("/boards/{board_id}", tags=["看板管理"], response_model=BoardResponse, summary="获取单个看板")
async def get_board(board_id: int):
    b = _boards.get(board_id)
    if not b:
        raise HTTPException(404, "看板不存在")
    return b

@app.get("/users/me", tags=["用户"], summary="获取当前用户")
async def me():
    return {"username": "demo_user"}

# ===== 自测：打印生成的 OpenAPI schema 片段 =====
if __name__ == "__main__":
    import json
    schema = app.openapi()
    print("== 接口路径 ==")
    for path in schema["paths"]:
        print(f"  {path}")
    print("\n== 标签 ==")
    for tag in schema["tags"]:
        print(f"  {tag['name']}: {tag.get('description', '')}")
    print(f"\n== 版本: {schema['info']['version']} ==")
\`\`\`

## 九、本章小结

| 概念 | 一句话 |
|------|-------|
| OpenAPI | 接口规范 JSON，FastAPI 自动生成 |
| metadata | title/description/version 等元信息 |
| tags | 路由分组，文档里按组展示 |
| Field description | 字段说明，显示在请求体示例 |
| response_model | 声明响应结构，文档更清晰 |
| custom_openapi | 覆盖 app.openapi 过滤/扩展 schema |
| 离线文档 | 导出 JSON 用 redoc-cli 生成静态 HTML |
| persistAuthorization | 调试时刷新保留 token |

下章我们学性能优化与压测。`,
  },

  // ============================================================
  // 第 44 章：性能优化与压测
  // ============================================================
  {
    id: "ff-perf",
    group: "进阶与生产实践",
    icon: "🚀",
    title: "性能优化与压测",
    content: `# 性能优化与压测

## 一、性能优化的原则：先测量再优化

> "过早优化是万恶之源。" —— Donald Knuth

性能优化最大的坑是**凭感觉优化**。正确的流程是：

\`\`\`
测量（找到瓶颈）→ 分析（定位原因）→ 优化（只改瓶颈）→ 复测（验证效果）
\`\`\`

| 反面做法 | 正面做法 |
|---------|---------|
| "我觉得数据库慢，加个缓存" | 先压测，发现 80% 时间在某个查询 |
| 优化了 10 处，每处快 1ms | 找到最慢的 1 处，让它快 100ms |
| 改完不测，上线才发现没效果 | 改完复测，有数据对比 |

## 二、性能分析工具

\`\`\`bash
# ===== cProfile：Python 自带，看每个函数耗时 =====
python -m cProfile -s cumtime main.py
# -s cumtime 按累计时间排序，快速找到最耗时的函数
# 输出示例：
# ncalls  tottime  percall  cumtime  percall filename:lineno(function)
#      1    0.001    0.001    2.500    2.500 main.py:10(handler)
#    100    2.400    0.024    2.400    0.024 db.py:5(query)

# ===== py-spy：采样分析，不用改代码，适合线上 =====
pip install py-spy
py-spy top --pid 12345          # 实时看进程的函数调用火焰图
py-spy record -o profile.svg --pid 12345  # 生成火焰图 SVG

# ===== line_profiler：逐行分析某个函数 =====
pip install line_profiler
# 在函数上加 @profile，然后：
kernprof -l -v main.py
# 输出每行执行次数和耗时，精确定位慢在哪一行
\`\`\`

## 三、数据库优化

### 3.1 索引

\`\`\`python
# 索引让 WHERE 查询从"全表扫描"变成"查字典"，快几个数量级
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), index=True)   # 经常按 username 查，加索引
    email = Column(String(120), unique=True)     # unique 自带索引

# 索引不是越多越好：索引加快查询但减慢写入（每次写都要更新索引）
# 只给"经常查"和"排序"的字段加索引
\`\`\`

### 3.2 N+1 问题与 selectinload

\`\`\`python
# ❌ N+1：100 个看板 = 1 + 100 次查询
boards = db.query(Board).all()
for b in boards:
    print(b.owner.name)  # 每次循环触发一次 owner 查询

# ✅ selectinload：2 次查询搞定
boards = db.query(Board).options(selectinload(Board.owner)).all()
for b in boards:
    print(b.owner.name)  # owner 已加载到内存
\`\`\`

### 3.3 只查需要的列

\`\`\`python
# ❌ 查整行，包含不用的长文本字段
users = db.query(User).all()  # SELECT * 取了所有列

# ✅ 只查需要的列，减少网络传输和内存
users = db.execute(
    select(User.id, User.username)  # 只取 id 和 username
).all()
\`\`\`

## 四、异步并发优化：asyncio.gather

\`\`\`python
import asyncio
import httpx

# ❌ 串行：3 个请求各 1 秒，总共 3 秒
async def slow():
    async with httpx.AsyncClient() as client:
        r1 = await client.get("https://api.a.com")  # 1s
        r2 = await client.get("https://api.b.com")  # 1s
        r3 = await client.get("https://api.c.com")  # 1s
        return [r1, r2, r3]  # 共 3s

# ✅ 并发：3 个请求同时发，总共 1 秒
async def fast():
    async with httpx.AsyncClient() as client:
        # gather 并发执行多个协程，等最慢的那个完成
        r1, r2, r3 = await asyncio.gather(
            client.get("https://api.a.com"),
            client.get("https://api.b.com"),
            client.get("https://api.c.com"),
        )
        return [r1, r2, r3]  # 共 1s

# 注意：gather 只对 IO 密集型有用，CPU 密集型还是串行（GIL）
\`\`\`

## 五、缓存优化

\`\`\`python
# 热点数据（如首页看板列表）加 Redis 缓存，详见上上章
# 缓存命中后跳过数据库，响应从 50ms 降到 1ms

# 还可以多级缓存：
# L1 进程内缓存（functools.lru_cache）→ L2 Redis → DB
from functools import lru_cache

@lru_cache(maxsize=1000)  # 进程内 LRU 缓存，最快
def get_config(key):
    return redis.get(key)  # 未命中再查 Redis
\`\`\`

## 六、压测工具

### 6.1 wrk：快速压测

\`\`\`bash
# 安装：brew install wrk
# -t12: 12 线程, -c400: 400 并发连接, -d30s: 持续 30 秒
wrk -t12 -c400 -d30s http://localhost:8000/boards

# 输出示例：
# Requests/sec:  15000.50    ← 每秒处理请求数（QPS）
# Latency:       8.50ms      ← 平均延迟
\`\`\`

### 6.2 locust：Python 写压测脚本

\`\`\`python
# locustfile.py —— 完整 locust 压测脚本
# 安装：pip install locust
# 运行：locust -f locustfile.py --host http://localhost:8000
# 然后浏览器打开 http://localhost:8089 设置并发数开始压测
from locust import HttpUser, task, between

class BoardUser(HttpUser):
    # 每个虚拟用户每次请求间隔 1-3 秒（模拟真实用户）
    wait_time = between(1, 3)

    @task(3)  # 权重 3：执行频率更高
    def list_boards(self):
        # 模拟用户查看看板列表
        self.client.get("/boards")

    @task(1)  # 权重 1：执行频率较低
    def create_board(self):
        # 模拟用户创建看板
        self.client.post("/boards", json={"title": "压测看板"})

    @task(2)
    def get_one_board(self):
        self.client.get("/boards/1")

    def on_start(self):
        # 用户启动时先登录，拿 token
        r = self.client.post("/login", json={"username": "test", "password": "test"})
        self.token = r.json().get("access_token")
        # 后续请求带上认证头
        self.client.headers.update({"Authorization": f"Bearer {self.token}"})
\`\`\`

## 七、Gunicorn worker 数量调优

\`\`\`bash
# gunicorn 启动命令
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000

# -w worker 数量怎么定？
# 经验公式：CPU 核数 * 2 + 1
# 但要分场景：
\`\`\`

| 场景 | worker 数量 | 原因 |
|------|-----------|------|
| CPU 密集型 | = CPU 核数 | 多了反而因 GIL 争抢变慢 |
| IO 密集型 | CPU 核数 * 2 + 1 | IO 等待时让出 GIL，多 worker 提升吞吐 |
| 异步（uvicorn worker）| CPU 核数 * 2 + 1 | 每个 worker 内部用事件循环，少量 worker 即可高并发 |

\`\`\`bash
# 看机器 CPU 核数
nproc   # Linux
sysctl -n hw.ncpu  # macOS

# 还可以配 --max-requests 1000：每个 worker 处理 1000 请求后重启
# 防止内存泄漏积累（FastAPI 应用较少用，但保险起见可配）
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --max-requests 1000
\`\`\`

## 八、常见性能瓶颈与解决方案

| 瓶颈 | 症状 | 解决方案 |
|------|------|---------|
| 慢查询 | 接口偶发卡顿 | 加索引、优化 SQL、explain 分析 |
| N+1 查询 | 接口越用越慢 | selectinload / joinedload |
| 未命中缓存 | 数据库 CPU 飙高 | Redis 缓存热点数据 |
| 串行 IO | 响应慢但 CPU 不忙 | asyncio.gather 并发 |
| GIL 争抢 | CPU 密集型多线程无效 | 改多进程 / 用 uvicorn worker |
| 连接池耗尽 | 偶发 502 | 调大 pool_size / 缩短请求耗时 |
| 内存泄漏 | 内存持续增长 | --max-requests 定期重启 worker |

## 九、Demo：性能对比（可运行）

\`\`\`python
# Demo：对比串行 vs 并发 vs 缓存的性能差异
# 运行：python main.py
import asyncio
import time

# ===== 模拟一个慢查询（耗时 0.1 秒）=====
async def slow_db_query(item_id: int):
    await asyncio.sleep(0.1)  # 模拟数据库 IO
    return {"id": item_id, "data": f"result-{item_id}"}

# ===== 串行：一个一个查 =====
async def fetch_serial(ids: list[int]):
    results = []
    for i in ids:
        results.append(await slow_db_query(i))  # 逐个等待
    return results

# ===== 并发：asyncio.gather 同时查 =====
async def fetch_concurrent(ids: list[int]):
    # gather 把多个协程丢给事件循环，IO 等待时切换执行
    return await asyncio.gather(*[slow_db_query(i) for i in ids])

# ===== 缓存：命中就不查 DB =====
_cache: dict[int, dict] = {}

async def fetch_cached(ids: list[int]):
    results = []
    for i in ids:
        if i in _cache:
            results.append(_cache[i])  # 命中缓存，0 耗时
        else:
            r = await slow_db_query(i)
            _cache[i] = r
            results.append(r)
    return results

async def main():
    ids = list(range(10))  # 10 个查询

    # 串行
    t0 = time.time()
    await fetch_serial(ids)
    t1 = time.time()
    print(f"串行:   {t1 - t0:.3f}s （预期 ~1.0s）")

    # 并发
    t0 = time.time()
    await fetch_concurrent(ids)
    t1 = time.time()
    print(f"并发:   {t1 - t0:.3f}s （预期 ~0.1s）")

    # 缓存（第二次全命中）
    t0 = time.time()
    await fetch_cached(ids)  # 第一次 miss，填充缓存
    t1 = time.time()
    print(f"缓存首次: {t1 - t0:.3f}s")

    t0 = time.time()
    await fetch_cached(ids)  # 第二次全命中
    t1 = time.time()
    print(f"缓存命中: {t1 - t0:.3f}s （预期 ~0.0s）")

if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

## 十、本章小结

| 概念 | 一句话 |
|------|-------|
| 先测量再优化 | 不凭感觉，用数据找瓶颈 |
| cProfile / py-spy | 性能分析工具，找最慢的函数 |
| 索引 | 加速 WHERE 查询，但减慢写入 |
| selectinload | 解决 N+1 查询问题 |
| asyncio.gather | 并发多个 IO 操作，提升吞吐 |
| Redis 缓存 | 热点数据缓存，降低延迟和 DB 压力 |
| wrk / locust | 压测工具，测 QPS 和延迟 |
| worker 数量 | IO 密集型 = CPU*2+1，CPU 密集型 = CPU 核数 |
| --max-requests | 定期重启 worker，防内存泄漏 |

恭喜你完成整个进阶与生产实践批次！把这些知识用起来，你的 FastAPI 应用就能上生产了。`,
  },
];
