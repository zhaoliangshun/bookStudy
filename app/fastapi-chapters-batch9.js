// =============================================================
// FastAPI 应用开发实战教程 - 第 9 批章节（数据库集成篇，共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   33. db-sqlalchemy : SQLAlchemy 2.0 ORM
//   34. db-session    : 数据库连接与 Session
//   35. db-crud       : CRUD 实战
//   36. db-migrate    : Alembic 数据库迁移
//
// 技术栈：Python 3.11+ / FastAPI 0.110+ / SQLAlchemy 2.0+ / Alembic
//
// 格式约定：
//   - content 是反引号模板字符串
//   - content 内部三反引号转义为 \`\`\`，内联反引号转义为 \`
//   - 涉及 ${ 形式（shell/docker 变量）统一转义为 \$\{，避免与 JS 模板字符串冲突
//   - group 统一为"数据库集成"
// =============================================================

export const chapters = [
  // =========================================================
  // 第三十三章：SQLAlchemy 2.0 ORM
  // =========================================================
  {
    id: "db-sqlalchemy",
    group: "数据库集成",
    icon: "🗃️",
    title: "SQLAlchemy 2.0 ORM",
    content: `

# SQLAlchemy 2.0 ORM

## 一、为什么 Web 应用离不开数据库

到目前为止，我们写的 FastAPI 应用里所有数据都活在内存里：进程一重启，用户、文章、订单全部消失。真实业务可不能这样——你下单买了一本书，第二天再打开网站，订单必须还在。数据库（Database）就是用来**持久化**数据的：把数据按结构写到磁盘，应用重启后还能读回来。

一个 Web 后端 80% 的工作可以归结为：**接收请求 → 校验 → 读写数据库 → 返回结果**。所以"如何用 Python 优雅地操作数据库"是后端开发的核心技能。SQLAlchemy 就是 Python 生态里最成熟、最强大的数据库工具包，FastAPI 官方教程也用它做示例。

## 二、SQLAlchemy 是什么

**SQLAlchemy** 是 Python 的一个 ORM（Object-Relational Mapping，对象关系映射）库。它在你定义的 Python 类和数据库表之间建立映射：你写 \`User\` 类，它对应 \`users\` 表；你给 \`user.name\` 赋值，最终变成 \`UPDATE users SET name=...\`。

SQLAlchemy 把"操作数据库"这件事分成两层：

\`\`\`txt filename="SQLAlchemy 两层架构"
┌─────────────────────────────────────────────┐
│  ORM 层（高层）：User / Post 等 Python 类        │
│      ↕  自动翻译                              │
│  Core 层（底层）：SQL 表达式 / 连接 / 事务       │
│      ↕  驱动                                  │
│  数据库（MySQL / PostgreSQL / SQLite）          │
└─────────────────────────────────────────────┘
\`\`\`

- **Core**：提供 SQL 表达式语言，贴近 SQL 本身，适合写复杂查询。
- **ORM**：建立在 Core 之上，用类和对象封装表和行，更面向对象。

你可以只用 Core，也可以只用 ORM，多数 Web 项目用 ORM 即可，复杂查询再下沉到 Core。

## 三、1.x vs 2.0：一次重要的范式切换

SQLAlchemy 2.0 在 2023 年发布，是一次重大升级。如果你看的教程还在用 \`Column(String)\`、\`query = session.query(User)\`，那是 1.x 老写法。现代项目应该用 2.0 新风格。

| 维度 | SQLAlchemy 1.x | SQLAlchemy 2.0 |
|------|----------------|----------------|
| 列定义 | \`Column(String, primary_key=True)\` | \`mapped_column(primary_key=True)\` + 类型注解 |
| 字段类型 | 在 Column 里写 | 用 \`Mapped[str]\` 注解声明 |
| 查询写法 | \`session.query(User).filter(...)\` | \`session.execute(select(User).where(...))\` |
| 关系访问 | 懒加载，隐式 | 显式 \`Mapped["Post"]\`，类型更清晰 |
| 异步支持 | 实验性 | 一等公民（AsyncSession） |
| 风格 | 命令式、魔法多 | 类型驱动、显式、与 mypy 友好 |

2.0 的核心思想是**用类型注解驱动模型定义**。借助 \`Mapped[T]\`，IDE 和类型检查器能知道 \`user.name\` 是 \`str\`，减少运行时错误。

> **学习建议**：新项目直接上 2.0。读老代码时认识 1.x 写法即可，不必迁移。本文档统一采用 2.0 风格。

## 四、为什么用 ORM 而不是裸写 SQL

初学者常问："我自己拼 SQL 字符串不行吗？"能跑，但代价大。对比一下：

\`\`\`python filename="裸 SQL 写法（反面教材）"
import sqlite3

# 拼接 SQL 字符串——危险！
def get_user(name):
    conn = sqlite3.connect("app.db")
    cursor = conn.execute(f"SELECT * FROM users WHERE name = '{name}'")
    # ❌ 如果 name 是 "'; DROP TABLE users; --"，表就没了（SQL 注入）
    return cursor.fetchone()
\`\`\`

\`\`\`python filename="ORM 写法（推荐）"
from sqlalchemy import select
from sqlalchemy.orm import Session

def get_user(session: Session, name: str):
    # ✅ 参数化查询，自动防 SQL 注入
    stmt = select(User).where(User.name == name)
    return session.execute(stmt).scalar_one_or_none()
\`\`\`

ORM 的核心价值：

1. **防 SQL 注入**：所有参数都走参数化绑定，从机制上杜绝拼接漏洞。
2. **面向对象**：操作 \`user.posts\` 而不是 \`JOIN posts ON ...\`，业务代码更易读。
3. **数据库无关**：换数据库（SQLite → PostgreSQL）几乎只改连接字符串，模型不变。
4. **类型安全**：2.0 配合类型注解，编辑器能自动补全 \`User.\` 后的列名。
5. **迁移联动**：Alembic 能根据模型变化自动生成迁移脚本。

当然 ORM 也有代价：极复杂的统计查询（多表聚合、窗口函数）用 ORM 表达反而啰嗦，这时可以下沉到 Core 的 \`text()\` 写原生 SQL。**ORM 不是银弹，是默认选择**。

## 五、声明式模型定义

SQLAlchemy 2.0 用"声明式"定义模型：写一个 Python 类，继承 \`DeclarativeBase\`，类属性就是表字段。

\`\`\`python filename="models.py - 模型定义"
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, ForeignKey, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

# 1. 所有模型的基类：自定义一个 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    """所有模型的根基类，被 Alembic 和 Session 共享。"""
    pass

# 2. User 模型 → 对应 users 表
class User(Base):
    __tablename__ = "users"  # 显式指定表名（不写则用类名小写）

    # Mapped[类型] 声明字段的 Python 类型；mapped_column() 配置列属性
    id: Mapped[int] = mapped_column(primary_key=True)  # 主键，自增整数
    name: Mapped[str] = mapped_column(String(50))      # 名字，VARCHAR(50)
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True)  # 唯一+索引
    hashed_password: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)  # 可空
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())  # 数据库默认值

    # relationship：声明"用户拥有的文章"，不是表字段，是对象关联
    posts: Mapped[List["Post"]] = relationship(back_populates="author", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User id={self.id} name={self.name!r}>"

# 3. Post 模型 → 对应 posts 表
class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(String(5000))
    # 外键：指向 users.id
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    published: Mapped[bool] = mapped_column(default=False)  # Python 端默认值

    # relationship 的另一端，back_populates 让两边互相引用
    author: Mapped["User"] = relationship(back_populates="posts")

    def __repr__(self) -> str:
        return f"<Post id={self.id} title={self.title!r}>"
\`\`\`

### 关键概念逐个拆

**① \`DeclarativeBase\`**：所有模型的根基类。SQLAlchemy 2.0 推荐自定义一个 \`Base\`，整个应用共享这一个 \`Base.metadata\`（它收集所有表的定义，建表/迁移时要用）。

**② \`Mapped[T]\`**：这是**类型注解**，告诉 SQLAlchemy（和 IDE）这个字段的 Python 类型。常见映射：
- \`Mapped[int]\` → INTEGER
- \`Mapped[str]\` → VARCHAR（长度由 \`mapped_column(String(n))\` 指定）
- \`Mapped[bool]\` → BOOLEAN
- \`Mapped[datetime]\` → DATETIME
- \`Mapped[Optional[str]]\` → 可空（等价于 \`nullable=True\`）

**③ \`mapped_column(...)\`**：配置列的数据库属性。常用参数：
- \`primary_key=True\`：主键
- \`unique=True\`：唯一约束
- \`index=True\`：建索引，加速等值查询
- \`nullable=False\`：不允许 NULL（默认 \`Mapped[str]\` 就是不允许 NULL）
- \`default=...\`：Python 端默认值（插入时若没给，ORM 填充）
- \`server_default=func.now()\`：数据库端默认值（建表时写进 DDL）

**④ \`relationship()\`**：声明对象之间的关系，**不是表字段**，不会出现在 \`CREATE TABLE\` 里。它让你能写 \`user.posts\` 直接拿到这个用户的所有文章。\`back_populates\` 让双向关系生效：\`user.posts\` 和 \`post.author\` 互相引用，修改一边另一边同步。

**⑤ \`cascade="all, delete-orphan"\`**：级联规则。删用户时，自动删掉其所有文章（孤立的 post 也删）。慎用，确保符合业务语义。

## 六、一对一 / 一对多 / 多对多关系速览

\`\`\`python filename="relationship 三种基数"
# 一对多：一个 User 有多个 Post（上面已演示）
posts: Mapped[List["Post"]] = relationship(back_populates="author")

# 一对一：在"多"的一方加 uselist=False
profile: Mapped["Profile"] = relationship(back_populates="user", uselist=False)

# 多对多：需要中间关联表
from sqlalchemy import Table, Column

# 中间表：posts 和 tags 的多对多关系
post_tags = Table(
    "post_tags", Base.metadata,
    Column("post_id", ForeignKey("posts.id"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id"), primary_key=True),
)

class Tag(Base):
    __tablename__ = "tags"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(30), unique=True)
    # secondary 指向中间表
    posts: Mapped[List["Post"]] = relationship(secondary=post_tags, back_populates="tags")

class Post(Base):
    # ... 其他字段省略
    tags: Mapped[List["Tag"]] = relationship(secondary=post_tags, back_populates="posts")
\`\`\`

| 关系类型 | 哪边有外键 | relationship 写法 | 访问示例 |
|----------|------------|-------------------|----------|
| 一对多 | "多"的一方 | "一"方用 \`List\` | \`user.posts\` |
| 一对一 | 任意一方 | 加 \`uselist=False\` | \`user.profile\` |
| 多对多 | 中间表 | 双方都加 \`secondary\` | \`post.tags\` |

## 七、把模型用起来：最小可运行示例

定义好模型后，需要一个 \`engine\` 和 \`Session\` 才能真正读写。这里给一个最小骨架（下一章会展开讲 Session 的细节）：

\`\`\`python filename="最小模型骨架"
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

# 1. 创建 engine（连接工厂），sqlite 内存库适合演示
engine = create_engine("sqlite:///:memory:", echo=True)  # echo=True 打印执行的 SQL

# 2. 建表：根据所有模型定义生成 DDL
Base.metadata.create_all(engine)

# 3. 开一个 Session，做增删改查
with Session(engine) as session:
    alice = User(name="alice", email="alice@example.com")
    session.add(alice)            # 加入 Session（还没入库）
    session.commit()              # 提交事务，真正写库
    print(alice.id)               # 提交后 id 被自动回填，比如 1
\`\`\`

## 八、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|----------|
| 忘了 \`__tablename__\` | 部分场景下表名推断异常 | 显式写 \`__tablename__ = "users"\` |
| \`Mapped[Optional[X]]\` vs \`Mapped[X]\` | 想可空却报 NOT NULL | 可空必须用 \`Optional[X]\` |
| \`default\` vs \`server_default\` | 数据库直插数据时默认值不生效 | 需 DB 端默认用 \`server_default\` |
| \`relationship\` 没加 \`back_populates\` | 双向访问一边为 None | 两边都配 \`back_populates\` |
| 字符串字段没指定长度 | SQLite 不报错，MySQL 报错 | \`mapped_column(String(n))\` 显式长度 |
| 1.x 的 \`session.query()\` 混用 | 2.0 里部分行为已变 | 统一用 \`session.execute(select(...))\` |
| 模型类没继承 \`Base\` | 表不会出现在 metadata 里 | 所有模型继承同一个 \`Base\` |

## 九、小结

本章建立起了"模型"的概念：用 \`DeclarativeBase\` + \`Mapped\` + \`mapped_column\` 声明表结构，用 \`relationship\` 描述对象关联。SQLAlchemy 2.0 的类型驱动风格让模型既是数据库 schema 又是类型契约。但模型本身不会自己连数据库——下一章我们讲 \`engine\`、\`Session\` 和 FastAPI 里如何用依赖注入管理会话。
`
  },

  // =========================================================
  // 第三十四章：数据库连接与 Session
  // =========================================================
  {
    id: "db-session",
    group: "数据库集成",
    icon: "🔌",
    title: "数据库连接与 Session",
    content: `

# 数据库连接与 Session

## 一、从模型到真实数据库，中间差什么

上一章我们定义了 \`User\`、\`Post\` 模型，但模型只是"图纸"。要让图纸变成可读写的数据，需要三样东西：

1. **数据库本身**：一个跑起来的 MySQL/PostgreSQL/SQLite 实例。
2. **engine（引擎）**：SQLAlchemy 的"连接工厂"，知道怎么连数据库、怎么开连接。
3. **Session（会话）**：一次工作单元的容器，承载增删改查和事务。

理解 \`engine\` 和 \`Session\` 的关系是本章核心，也是 FastAPI 集成数据库的关键。

## 二、数据库连接 URL

engine 需要一个连接字符串（URL）告诉它：用哪个驱动、连哪个库、用户名密码是什么。格式是 \`dialect+driver://user:password@host:port/dbname\`。

\`\`\`txt filename="常见数据库 URL 格式"
# SQLite（文件）
sqlite:///./app.db              # 相对路径，生成 app.db 文件
sqlite:///:memory:              # 内存库，进程结束即消失（测试用）

# MySQL（驱动 pymysql）
mysql+pymysql://user:pass@localhost:3306/mydb

# PostgreSQL（驱动 psycopg2，同步）
postgresql+psycopg2://user:pass@localhost:5432/mydb

# PostgreSQL 异步（驱动 asyncpg，配合 create_async_engine）
postgresql+asyncpg://user:pass@localhost:5432/mydb
\`\`\`

**关键点**：URL 前缀的 \`dialect+driver\` 决定了 SQLAlchemy 用哪个驱动包。你必须先 \`pip install\` 对应的驱动（如 \`pymysql\`、\`psycopg2-binary\`、\`asyncpg\`），否则连接时报"找不到驱动"。

| 数据库 | 同步驱动 | 异步驱动 | 安装命令 |
|--------|----------|----------|----------|
| SQLite | 内置 | \`aiosqlite\` | \`pip install aiosqlite\` |
| MySQL | \`pymysql\` | \`aiomysql\` | \`pip install pymysql\` |
| PostgreSQL | \`psycopg2\` | \`asyncpg\` | \`pip install psycopg2-binary\` |

## 三、engine：连接工厂

\`\`\`python filename="database.py - engine 配置"
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# 实际项目从配置/环境变量读，避免硬编码
DATABASE_URL = "postgresql+psycopg2://postgres:secret@localhost:5432/blog"

# create_engine 返回一个 engine，它本身不立刻建连接，而是按需创建
engine = create_engine(
    DATABASE_URL,
    pool_size=5,         # 连接池常驻连接数（默认 5）
    max_overflow=10,     # 超出 pool_size 后还能临时开的连接数（默认 10）
    pool_recycle=3600,   # 连接存活秒数，超过就回收重建（防 MySQL 8h 断连）
    pool_pre_ping=True,  # 取连接前先 ping 一下，断了就重建（强烈建议开）
    echo=False,          # True 时打印执行的 SQL，调试用，生产关掉
)

# Base：所有模型的根基类
class Base(DeclarativeBase):
    pass

# SessionLocal：Session 工厂，调用一次生成一个新 Session
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
\`\`\`

### 连接池原理

数据库连接的建立（TCP 握手 + 认证）很贵。如果每个请求都新建连接再关闭，高并发下数据库会被握手压垮。**连接池**预先建好一批连接放在池子里，请求来了借一个、用完还回去，复用连接。

\`\`\`txt filename="连接池工作模型"
应用启动 → engine 创建连接池（pool_size=5 个连接就绪）
        │
请求1 来了 → 从池子借一个连接 → 执行 SQL → 还回池子（不真断开）
请求2 来了 → 借另一个连接 → ...
请求6 来了（池子空了）→ 临时新建一个（最多到 pool_size + max_overflow）
请求结束 → 多余的连接被关闭，恢复到 pool_size 个
\`\`\`

参数解读：
- **\`pool_size\`**：池子常驻连接数。太小不够用（请求排队），太大占数据库连接数。
- **\`max_overflow\`**：突发流量时能临时多开的连接数。允许"峰值弹性"。
- **\`pool_recycle\`**：连接活多久就强制重建。MySQL 默认 8 小时无活动会主动断连，设 \`3600\` 提前回收，避免用到已断的连接。
- **\`pool_pre_ping\`**：借出连接前先发个 ping，断了直接换。**生产必开**，省去很多"连接已关闭"的诡异错误。

## 四、Session：一次工作单元

engine 是"工厂"，Session 是"产品"。一个 Session 对应一次业务工作单元（通常是一个请求的生命周期），它：

- 持有一个数据库连接（从 engine 的池子里借的）。
- 跟踪你 add/修改/删除的对象（identity map）。
- 把这些改动攒在内存，\`commit()\` 时一次性发给数据库（一个事务）。
- \`commit()\` 或 \`rollback()\` 后，连接还回池子。

\`\`\`python filename="Session 生命周期"
from sqlalchemy.orm import Session

# 1. 创建 Session（向 engine 借连接）
session = SessionLocal()

try:
    # 2. 在 Session 里干活
    user = User(name="bob", email="bob@example.com")
    session.add(user)        # 攒着，还没入库
    # 此时 SELECT 还查不到 bob（未提交）

    session.commit()         # 3. 提交事务，真正写库，连接还回池子
except Exception:
    session.rollback()       # 出错回滚，撤销所有未提交改动
    raise
finally:
    session.close()          # 4. 关闭 Session，释放资源
\`\`\`

> **心智模型**：Session 像一个"草稿箱"。你往里加东西、改东西，都只是草稿；\`commit()\` 才是把草稿誊抄到正式档案；\`rollback()\` 是把草稿撕掉。

## 五、为什么 FastAPI 要用 yield 依赖管理 Session

如果每个路由都手动写 \`session = SessionLocal() ... try/finally close\`，代码会又长又容易忘关。FastAPI 的**依赖注入 + yield** 正好解决：在依赖里开 Session，请求结束自动关。

\`\`\`python filename="依赖 get_db"
from typing import Generator
from fastapi import Depends
from sqlalchemy.orm import Session

def get_db() -> Generator[Session, None, None]:
    """每个请求开一个独立 Session，请求结束自动关闭。"""
    db = SessionLocal()      # 请求开始：借连接、建 Session
    try:
        yield db             # 把 db 注入路由函数；路由执行期间，db 保持打开
    finally:
        db.close()           # 路由返回后：关 Session，连接还回池子
\`\`\`

**为什么用 \`yield\` 而不是 \`return\`？**
- \`return\` 后函数就结束了，没法在路由执行后再做清理。
- \`yield\` 把 \`db\` 暂时交给路由，路由执行完，控制权回到 \`yield\` 之后，执行 \`finally\` 里的 \`db.close()\`。

**为什么每个请求要一个独立 Session？**
- Session 不是线程安全的，并发请求共享一个 Session 会数据错乱。
- 每请求一个 Session = 每请求一个事务边界，互不干扰，符合 HTTP 无状态语义。
- 连接池保证了"多 Session"不会真的开很多数据库连接（借出/归还复用）。

\`\`\`python filename="路由里用 get_db"
from fastapi import FastAPI, Depends, HTTPException

app = FastAPI()

@app.get("/users/{user_id}")
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)   # 按主键查
    if user is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user
\`\`\`

## 六、建表：Base.metadata.create_all

开发初期，可以直接用模型定义生成表结构（DDL），不用手写 \`CREATE TABLE\`：

\`\`\`python filename="启动时建表"
# 注意：create_all 只建"不存在的表"，不会修改已有表结构
# 也不会删除已不存在的模型对应的表（不做迁移）
Base.metadata.create_all(bind=engine)
\`\`\`

\`\`\`txt filename="create_all 的局限"
✅ 适合：开发/测试时快速建表
❌ 不适合：
   - 改了模型（加列、改类型）→ create_all 不会 ALTER 已有表
   - 删了模型 → create_all 不会 DROP 废弃的表
   → 这些场景要用 Alembic 做迁移（下一章讲）
\`\`\`

> **生产环境不要用 create_all 管理表结构**。用 Alembic 做版本化迁移，能追溯、能回滚、能团队协作。

## 七、完整的最小集成示例

把 engine、Session、依赖、模型、路由串起来：

\`\`\`python filename="完整最小集成 main.py"
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session, sessionmaker

DATABASE_URL = "sqlite:///./app.db"   # 用 SQLite 演示，无需装数据库
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
# check_same_thread=False：SQLite 默认禁止跨线程用连接，FastAPI 多线程依赖里要关掉
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column()

# 启动时建表（仅演示用，生产用 Alembic）
Base.metadata.create_all(engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

@app.post("/users/")
def create_user(name: str, db: Session = Depends(get_db)):
    user = User(name=name)
    db.add(user)
    db.commit()
    db.refresh(user)   # 刷新，让 user.id 等数据库生成的字段回填
    return user

@app.get("/users/{user_id}")
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "用户不存在")
    return user
\`\`\`

## 八、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|----------|
| 忘了 \`db.commit()\` | 数据没存进去，重启就丢 | 写操作后必须 commit |
| 忘了 \`db.close()\` | 连接泄漏，池子耗尽 | 用 \`yield\` 依赖或 \`with\` 自动关 |
| 多请求共用一个全局 Session | 数据错乱、并发踩踏 | 每请求独立 Session |
| SQLite 跨线程报错 | "SQLite objects created in a thread" | 加 \`check_same_thread=False\` |
| 改了模型跑 \`create_all\` 不生效 | 新列没出现 | 用 Alembic 迁移，不要指望 create_all ALTER |
| \`expire_on_commit=True\`（默认） | commit 后访问属性触发再次 SELECT | 设 \`expire_on_commit=False\` 避免意外查询 |
| 连接池耗尽 | "QueuePool limit reached" | 检查 Session 是否都关了，调大 pool_size |
| MySQL 长时间空闲后报 "MySQL server has gone" | 连接已断却被复用 | 开 \`pool_pre_ping=True\`，设 \`pool_recycle\` |

## 九、小结

本章打通了"模型 → engine → Session → 路由"的链路：engine 是连接工厂，Session 是每请求的工作单元，\`get_db\` 用 yield 依赖把 Session 优雅地注入路由并在请求结束自动关闭。连接池让并发请求复用少量连接。下一章我们把这套基础设施用起来，做完整的增删改查 API。
`
  },

  // =========================================================
  // 第三十五章：CRUD 实战
  // =========================================================
  {
    id: "db-crud",
    group: "数据库集成",
    icon: "📝",
    title: "CRUD 实战",
    content: `

# CRUD 实战

## 一、CRUD 是什么

**CRUD** 是四个数据操作的缩写，覆盖了绝大多数业务 API 的本质：

| 字母 | 英文 | HTTP 方法 | SQL | 语义 |
|------|------|-----------|-----|------|
| **C**reate | create | POST | INSERT | 新建一条数据 |
| **R**ead | read | GET | SELECT | 查询数据 |
| **U**pdate | update | PUT/PATCH | UPDATE | 修改已有数据 |
| **D**elete | delete | DELETE | DELETE | 删除数据 |

一个"用户管理"API 80% 就是这四个操作的排列组合。本章我们用 SQLAlchemy 2.0 + FastAPI 实现一套完整的用户 CRUD，把上一章的 \`get_db\` 真正用起来。

## 二、Pydantic Schema：和模型解耦

直接把 ORM 模型返回给客户端有三个问题：① 暴露 \`hashed_password\` 等敏感字段；② 客户端传参时不知道哪些字段能传；③ 模型变化会直接破坏 API 契约。所以要用 **Pydantic schema** 把"内部模型"和"外部接口"分开：

- **创建 schema**（\`UserCreate\`）：客户端 POST 时能传什么。
- **更新 schema**（\`UserUpdate\`）：PUT 时能改什么，字段都可选。
- **响应 schema**（\`UserRead\`）：返回给客户端时展示什么，绝不含密码。

\`\`\`python filename="schemas.py - Pydantic 模型"
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime

# 创建用户的入参
class UserCreate(BaseModel):
    name: str
    email: EmailStr            # 自动校验邮箱格式
    password: str              # 明文密码，进来后哈希存储

# 更新用户的入参（所有字段可选，PATCH 语义）
class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None

# 返回给客户端的响应（绝不含 password）
class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # 允许从 ORM 对象读属性
    id: int
    name: str
    email: str
    created_at: datetime
\`\`\`

> \`from_attributes=True\`（Pydantic v2，对应 v1 的 \`orm_mode=True\`）让 Pydantic 能从 ORM 对象 \`user.id\` 这种属性访问读取，从而 \`UserRead.model_validate(user)\` 直接可用。

## 三、Create：新建用户

\`\`\`python filename="crud.py - create_user"
from sqlalchemy.orm import Session
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def create_user(db: Session, user_in: UserCreate) -> User:
    # 1. 把入参转成 ORM 对象（密码先哈希）
    user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
    )
    db.add(user)              # 加入 Session（暂存）
    db.commit()              # 提交事务，写库
    db.refresh(user)         # 刷新，让 id/created_at 等数据库生成字段回填
    return user
\`\`\`

\`\`\`python filename="路由 - POST /users/"
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/users", tags=["用户"])

@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user_endpoint(user_in: UserCreate, db: Session = Depends(get_db)):
    # 业务校验：邮箱不能重复
    existing = db.execute(select(User).where(User.email == user_in.email)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="邮箱已被注册")
    user = create_user(db, user_in)
    return user   # response_model=UserRead 会自动转换（含敏感字段过滤）
\`\`\`

关键点：
- \`db.add()\` 只是登记，\`db.commit()\` 才真正写库。
- \`db.refresh(user)\` 重新 SELECT 把数据库生成的字段（\`id\`、\`created_at\`）填回对象。
- \`response_model=UserRead\` 自动过滤掉 \`hashed_password\`，绝不出现在响应里。

## 四、Read：查询用户

SQLAlchemy 2.0 用 \`select()\` + \`session.execute()\` 取代了 1.x 的 \`session.query()\`。

\`\`\`python filename="按主键查 / 按 ID 查 / 列表 / 分页"
from sqlalchemy import select, func

# 1. 按主键查：最常用，db.get() 一步到位
def get_user(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)

# 2. 按条件查（单个）
def get_user_by_email(db: Session, email: str) -> User | None:
    stmt = select(User).where(User.email == email)
    return db.execute(stmt).scalar_one_or_none()
    # scalar_one_or_none：恰好一个返回对象，没有返回 None，多个抛异常

# 3. 查全部
def list_users(db: Session) -> list[User]:
    stmt = select(User).order_by(User.id)
    return list(db.execute(stmt).scalars())   # scalars() 把行拆成对象

# 4. 分页查询：limit/offset
def list_users_paged(db: Session, skip: int = 0, limit: int = 20) -> list[User]:
    stmt = select(User).order_by(User.id).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars())

# 5. 统计总数（分页页码要用）
def count_users(db: Session) -> int:
    stmt = select(func.count()).select_from(User)
    return db.execute(stmt).scalar_one()
\`\`\`

\`\`\`python filename="路由 - GET 列表分页"
@router.get("/", response_model=list[UserRead])
def list_users_endpoint(
    skip: int = 0,
    limit: int = Query(default=20, le=100),   # 限制每页最多 100 条
    db: Session = Depends(get_db),
):
    return list_users_paged(db, skip, limit)

@router.get("/{user_id}", response_model=UserRead)
def read_user_endpoint(user_id: int, db: Session = Depends(get_db)):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user
\`\`\`

### \`scalar_one_or_none\` vs \`one_or_none\` vs \`first\` vs \`all\`

| 方法 | 返回 | 没有 | 多个 | 适用 |
|------|------|------|------|------|
| \`scalar_one()\` | 单对象 | 抛异常 | 抛异常 | 确信恰好一条 |
| \`scalar_one_or_none()\` | 单对象或 None | None | 抛异常 | 按唯一键查 |
| \`one_or_none()\` | Row 或 None | None | 抛异常 | 要整行（多列） |
| \`first()\` | 第一个或 None | None | 取首条 | 任意一条即可 |
| \`scalars().all()\` | 列表 | 空列表 | 全返回 | 列表查询 |

## 五、Update：修改用户

\`\`\`python filename="crud.py - update_user"
def update_user(db: Session, user: User, user_in: UserUpdate) -> User:
    # 用 model_dump(exclude_unset=True) 只取客户端实际传入的字段
    # 避免把没传的字段误置为 None
    data = user_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(user, field, value)   # 等价于 user.field = value，但字段名是动态的
    db.commit()
    db.refresh(user)
    return user
\`\`\`

\`\`\`python filename="路由 - PUT 更新"
@router.put("/{user_id}", response_model=UserRead)
def update_user_endpoint(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db)):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(404, "用户不存在")
    return update_user(db, user, user_in)
\`\`\`

> **\`exclude_unset=True\` 是关键**：\`UserUpdate\` 的字段都有默认值 \`None\`。如果客户端只传了 \`{"name": "new"}\`，不带 \`exclude_unset\`，\`email\` 会被当成 \`None\` 覆盖。带上后只更新真正传了的字段。这是 PATCH/PUT 局部更新的标准做法。

## 六、Delete：删除用户

\`\`\`python filename="crud.py - delete_user"
def delete_user(db: Session, user: User) -> None:
    db.delete(user)     # 标记删除
    db.commit()         # 提交，真正执行 DELETE
\`\`\`

\`\`\`python filename="路由 - DELETE"
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_endpoint(user_id: int, db: Session = Depends(get_db)):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(404, "用户不存在")
    db.delete(user)
    db.commit()
    return None   # 204 无响应体
\`\`\`

## 七、404 处理的统一姿势

每个写操作前都要先查对象存不存在。可以用依赖把这个逻辑复用：

\`\`\`python filename="用依赖复用 404 校验"
def get_user_or_404(user_id: int, db: Session = Depends(get_db)) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user

@router.get("/{user_id}")
def read_user(user: User = Depends(get_user_or_404)):
    return user   # 依赖已经保证 user 一定存在

@router.put("/{user_id}")
def update_user(user_in: UserUpdate, user: User = Depends(get_user_or_404), db: Session = Depends(get_db)):
    return update_user(db, user, user_in)
\`\`\`

## 八、完整 CRUD 速查表

| 操作 | 方法 | 路径 | 入参 | 出参 | 状态码 |
|------|------|------|------|------|--------|
| 创建 | POST | \`/users/\` | UserCreate | UserRead | 201 |
| 列表 | GET | \`/users/\` | skip, limit | list[UserRead] | 200 |
| 单查 | GET | \`/users/{id}\` | id | UserRead | 200/404 |
| 更新 | PUT | \`/users/{id}\` | UserUpdate | UserRead | 200/404 |
| 删除 | DELETE | \`/users/{id}\` | id | 无 | 204/404 |

## 九、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|----------|
| 写完忘 \`commit()\` | 数据没存 | create/update/delete 后 commit |
| \`refresh()\` 前就 return | id 为 None | 先 commit+refresh 再返回 |
| 更新用 \`model_dump()\` 不带 \`exclude_unset\` | 没传的字段被置 None | 加 \`exclude_unset=True\` |
| 响应里泄露密码 | \`hashed_password\` 出现在 JSON | 用 \`response_model=UserRead\` 过滤 |
| 列表查询忘了 \`order_by\` | 顺序不稳定（分页乱序） | 分页必须固定排序字段 |
| 分页 limit 没上限 | 客户端传 limit=999999 拖垮 DB | \`Query(le=100)\` 限制 |
| 用 \`scalar_one()\` 查可能多条的列 | 偶尔多条时报错 | 用 \`scalar_one_or_none()\` 或 \`first()\` |
| 邮箱重复没校验 | 唯一约束报 500 | 先查重，转成 400 业务错误 |

## 十、小结

CRUD 是 Web 后端的"基本功"：\`db.add+commit\` 创建、\`select+where\` 查询、\`setattr+commit\` 更新、\`db.delete+commit\` 删除。配合 Pydantic schema 把入参出参和 ORM 模型解耦，用 \`response_model\` 自动过滤敏感字段。分页用 \`offset/limit\` 配 \`order_by\` 保证顺序稳定。但这套流程有个短板：改了模型结构，生产数据库不会自动跟随。下一章我们用 Alembic 做版本化迁移解决这个问题。
`
  },

  // =========================================================
  // 第三十六章：Alembic 数据库迁移
  // =========================================================
  {
    id: "db-migrate",
    group: "数据库集成",
    icon: "🚀",
    title: "Alembic 数据库迁移",
    content: `

# Alembic 数据库迁移

## 一、为什么需要数据库迁移

项目演进中，表结构一定会变：给 \`users\` 加个 \`phone\` 列、把 \`posts.body\` 长度从 5000 改成 10000、给 \`email\` 加唯一索引……问题来了：

- **开发环境**：删表重建无所谓。
- **生产环境**：表里有真实用户数据，删表重建 = 删库跑路。

直接在数据库里手动 \`ALTER TABLE\` 也有问题：谁加了什么？什么时候加的？回滚到哪一步？多人协作时本地和线上的 schema 不一致怎么办？

**数据库迁移（Migration）** 就是解决这些问题的方案：把每一次表结构变化记录成一个**版本文件**，像 Git 管代码一样管 schema——可追溯、可回滚、可协作、可部署。

\`\`\`txt filename="迁移的版本链"
版本 001 (初始)        → 创建 users 表
版本 002 (+phone 列)   → ALTER TABLE users ADD COLUMN phone
版本 003 (+posts 表)   → CREATE TABLE posts
        ↑
当前数据库处于版本 003
要回滚到 002？执行 003 的 downgrade 即可
\`\`\`

## 二、Alembic 是什么

**Alembic** 是 SQLAlchemy 官方的迁移工具（同作者 Mike Bayer）。它的核心能力：

1. **对比模型与数据库**：读取你的 SQLAlchemy 模型，和数据库当前 schema 对比，自动算出差异。
2. **生成迁移脚本**：把差异写成 \`upgrade()\`（升）和 \`downgrade()\`（降）两个函数。
3. **版本管理**：在数据库里建一张 \`alembic_version\` 表，记录当前处于哪个版本。
4. **升级/回滚**：一条命令把数据库升到最新，或回滚到任意历史版本。

## 三、初始化 Alembic

\`\`\`bash filename="安装与初始化"
# 1. 安装
pip install alembic

# 2. 在项目根目录初始化（生成 alembic.ini 和 alembic/ 目录）
alembic init alembic
\`\`\`

初始化后的目录结构：

\`\`\`txt filename="Alembic 目录结构"
myproject/
├── alembic.ini          # Alembic 主配置（数据库 URL、脚本位置）
├── alembic/
│   ├── env.py           # 迁移环境配置（关键：连模型、连数据库）
│   ├── script.py.mako   # 迁移文件模板
│   └── versions/        # 存放所有迁移版本脚本（自动生成）
│       ├── 001_init.py
│       └── 002_add_phone.py
└── models.py           # 你的 SQLAlchemy 模型
\`\`\`

## 四、配置：连接与模型

### 1. 配置数据库 URL

编辑 \`alembic.ini\`，找到 \`sqlalchemy.url\`：

\`\`\`ini filename="alembic.ini"
# 开发环境可硬编码（生产不要！）
sqlalchemy.url = postgresql+psycopg2://postgres:secret@localhost:5432/blog
\`\`\`

\`\`\`txt filename="生产环境的安全做法"
❌ 把密码写进 alembic.ini 提交到 Git → 泄露！
✅ 在 env.py 里用环境变量覆盖：
   import os
   url = os.getenv("DATABASE_URL")
   if url:
       config.set_main_option("sqlalchemy.url", url)
\`\`\`

### 2. 让 Alembic 认识你的模型（env.py）

默认的 \`env.py\` 不知道你的 \`models.py\`，autogenerate 就检测不到模型变化。需要改 \`env.py\`，引入你的 \`Base.metadata\`：

\`\`\`python filename="alembic/env.py - 关键片段"
from models import Base   # 引入你的模型基类（确保模型被导入，metadata 才有表定义）

target_metadata = Base.metadata   # ★ 告诉 Alembic：这是我的"目标 schema"

def run_migrations_online():
    # ... 省略，Alembic 默认实现会用 target_metadata 做对比
    pass
\`\`\`

> **关键**：必须让 \`models.py\` 被导入，里面的 \`class User(Base)\` 才会注册到 \`Base.metadata\`。如果 env.py 只 \`import Base\` 而不 import 模型类，metadata 是空的，autogenerate 会以为"没有表"，生成"删除所有表"的灾难性脚本。

\`\`\`python filename="env.py 安全写法"
# 显式导入所有模型，确保 metadata 完整
from models import Base, User, Post   # 列举，或用 models 模块整体导入
import models   # 触发所有 @declarative 注册

target_metadata = models.Base.metadata
\`\`\`

## 五、生成迁移脚本：autogenerate

\`\`\`bash filename="自动生成迁移"
# 对比模型和数据库，生成差异脚本
alembic revision --autogenerate -m "add phone column to users"
\`\`\`

Alembic 会生成一个文件 \`alembic/versions/<hash>_add_phone_column_to_users.py\`：

\`\`\`python filename="迁移脚本示例"
"""add phone column to users

Revision ID: a1b2c3d4
Revises: 9z8y7x6
Create Date: 2025-01-15 10:30:00
"""
from alembic import op
import sqlalchemy as sa

# 修订 ID 和父修订 ID（构成版本链）
revision = "a1b2c3d4"
down_revision = "9z8y7x6"   # 上一个版本

def upgrade() -> None:
    # 升级：加一列
    op.add_column("users", sa.Column("phone", sa.String(20), nullable=True))

def downgrade() -> None:
    # 回滚：删这一列
    op.drop_column("users", "phone")
\`\`\`

> **务必人工 review 生成的脚本**。autogenerate 不是万能的：
> - 检测不到"列改名"（会变成删旧列+加新列，数据丢失）。
> - 检测不到"约束改名"。
> - 复杂的数据迁移（把某列拆成两列并搬运数据）必须手写。

## 六、执行迁移：upgrade / downgrade

\`\`\`bash filename="升降级命令"
# 升到最新版本
alembic upgrade head

# 升级到指定版本
alembic upgrade a1b2c3d4

# 前进一步
alembic upgrade +1

# 回退一步
alembic downgrade -1

# 回退到指定版本
alembic downgrade 9z8y7x6

# 回退到初始（清空所有迁移）
alembic downgrade base

# 查看当前版本
alembic current

# 查看迁移历史
alembic history --verbose
\`\`\`

\`\`\`txt filename="数据库里的版本记录"
执行 upgrade 时，Alembic 在数据库建一张 alembic_version 表：
┌────────────┐
│ version    │
├────────────┤
│ a1b2c3d4   │   ← 当前数据库处于这个版本
└────────────┘
下次 upgrade head 时，Alembic 读取当前版本，找出后续链，依次执行。
\`\`\`

## 七、迁移脚本解读

每个迁移脚本最关键的三个东西：

\`\`\`python
revision = "a1b2c3d4"      # 当前修订 ID（全局唯一）
down_revision = "9z8y7x6"  # 父修订 ID（构成链表）
# branch_labels / depends_on：分支用，普通项目用不到

def upgrade():
    # 往"前进"时执行的 DDL/DML
    op.add_column(...)

def downgrade():
    # 往"后退"时执行，应严格反操作 upgrade
    op.drop_column(...)
\`\`\`

**\`op\` 常用操作速查**：

| 操作 | upgrade | downgrade |
|------|---------|-----------|
| 建表 | \`op.create_table("users", ...)\` | \`op.drop_table("users")\` |
| 加列 | \`op.add_column("users", sa.Column(...))\` | \`op.drop_column("users", "name")\` |
| 改列类型 | \`op.alter_column("users", "age", type_=sa.Float())\` | 反向 alter |
| 加索引 | \`op.create_index("ix_users_email", "users", ["email"])\` | \`op.drop_index(...)\` |
| 加外键 | \`op.create_foreign_key(...)\` | \`op.drop_constraint(...)\` |
| 改列名 | \`op.alter_column("t", "old", new_column_name="new")\` | 反向改名 |

> **\`downgrade\` 必须是 \`upgrade\` 的严格逆操作**，否则回滚会留下垃圾。autogenerate 生成的 downgrade 通常靠谱，但手写 upgrade 时要同步手写 downgrade。

## 八、数据迁移（DML）而不只是 DDL

迁移不只是改表结构，还可能要搬数据。比如把 \`users.fullname\` 拆成 \`first_name\` 和 \`last_name\`：

\`\`\`python filename="带数据搬运的迁移"
def upgrade():
    # 1. 加两列
    op.add_column("users", sa.Column("first_name", sa.String(50)))
    op.add_column("users", sa.Column("last_name", sa.String(50)))

    # 2. 用 op.get_bind() 拿到连接，做数据搬运
    conn = op.get_bind()
    users = conn.execute(sa.text("SELECT id, fullname FROM users")).fetchall()
    for uid, fullname in users:
        parts = fullname.split(" ", 1) if fullname else ["", ""]
        first = parts[0]
        last = parts[1] if len(parts) > 1 else ""
        conn.execute(
            sa.text("UPDATE users SET first_name=:f, last_name=:l WHERE id=:id"),
            {"f": first, "l": last, "id": uid},
        )

    # 3. 删旧列
    op.drop_column("users", "fullname")

def downgrade():
    # 逆操作：合并回去，删新列，加回旧列
    op.add_column("users", sa.Column("fullname", sa.String(100)))
    conn = op.get_bind()
    users = conn.execute(sa.text("SELECT id, first_name, last_name FROM users")).fetchall()
    for uid, first, last in users:
        conn.execute(
            sa.text("UPDATE users SET fullname=:n WHERE id=:id"),
            {"n": f"{first} {last}".strip(), "id": uid},
        )
    op.drop_column("users", "first_name")
    op.drop_column("users", "last_name")
\`\`\`

## 九、团队协作：迁移文件要进 Git

迁移脚本是项目代码的一部分，必须提交到 Git。协作规则：

\`\`\`txt filename="团队迁移协作流程"
1. A 同学改了模型 → autogenerate 生成 005_xxx.py → 提交 PR → 合并到 main
2. B 同学 pull 最新代码 → 拿到 005_xxx.py → alembic upgrade head → 本地 schema 同步
3. 生产部署时：CI/CD 跑 alembic upgrade head → 线上 schema 同步
\`\`\`

**冲突处理**：两人同时基于 004 各自生成 005，合并时 \`down_revision\` 都指向 004，形成"分叉"。Alembic 支持 merge：

\`\`\`bash filename="合并分叉"
alembic merge -m "merge 005a and 005b" 005a 005b
# 生成一个 merge revision，down_revision 指向两个父节点
\`\`\`

为避免分叉：约定一次只允许一个 PR 改模型；或每次 autogenerate 前先 pull 最新代码。

## 十、生产环境迁移流程

\`\`\`txt filename="生产部署迁移流程"
1. CI 跑测试（含迁移的 upgrade/downgrade 双向测试）
2. 备份数据库（mysqldump / pg_dump）—— 迁移前必做！
3. 部署新代码前，先执行迁移：alembic upgrade head
   顺序很重要：先迁库，再上代码（新代码依赖新 schema）
4. 如果迁移涉及大表加列（很慢），分多次：
   - 加可空列 → 不锁表
   - 分批回填数据
   - 改成 NOT NULL
5. 部署应用代码
6. 观察：alembic current 确认版本正确，业务验证
\`\`\`

**零停机迁移原则**：
- 加列用 \`nullable=True\`，老代码不写这列也不会报错。
- 删列前，先发版让代码不再读写这列，下个版本再真正 DROP。
- 改列类型往往需要"加新列→搬数据→切流量→删旧列"多步走。

## 十一、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|----------|
| env.py 没导入模型 | autogenerate 生成"删全部表" | 显式 import 所有模型类 |
| 不 review 直接 upgrade | 数据丢失/结构错乱 | 必须人工看 upgrade/downgrade |
| 改列名被当成删+加 | 列数据丢失 | 手写 \`alter_column(new_column_name=)\` |
| 迁移前没备份 | 出错无法恢复 | 生产迁移前 dump 数据库 |
| 不提交迁移文件到 Git | 同事本地 schema 不对 | 迁移脚本必须进版本库 |
| 自动生成空迁移 | 模型没变化却生成了空文件 | 删掉空迁移，避免噪音 |
| 多人同时生成 revision | down_revision 分叉 | 用 \`alembic merge\` 或约定顺序 |
| 生产直接 \`downgrade base\` | 清空全部迁移记录 | 回滚要小心，确认数据安全 |
| 迁移和代码部署顺序反 | 新代码查不到新列报错 | 先迁库后上代码 |

## 十二、小结

Alembic 把"表结构变化"变成可版本化管理的代码：\`alembic init\` 建环境，\`env.py\` 挂载模型，\`revision --autogenerate\` 生成迁移，\`upgrade/downgrade\` 执行升降级。迁移文件进 Git，团队共享同一份 schema 历史。生产迁移前备份、先迁库后上代码、大表分步走。至此，数据库集成的"建模—连接—CRUD—迁移"四步闭环完成，下一章我们进入认证与安全领域。
`
  },
];
