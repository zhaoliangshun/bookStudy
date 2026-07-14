// =============================================================
// FastAPI 应用开发实战教程 - 第 16 批章节（实战项目 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-project-rest         : 实战:RESTful API 完整项目
//   fa-project-graphql      : 实战:GraphQL 集成
//   fa-project-microservice : 实战:微服务架构
//   fa-project-perf         : 实战:性能优化
// ============================================================

export const chapters = [
  // =============================================================
  // 第六十一章：实战:RESTful API 完整项目
  // =============================================================
  {
    id: "fa-project-rest",
    group: "实战项目",
    icon: "🎯",
    title: "实战:RESTful API 完整项目",
    content: `## 第六十一章　实战:RESTful API 完整项目

前面十五章我们学了 FastAPI 的各种零碎知识点：路由、依赖注入、Pydantic、SQLAlchemy、JWT、中间件、测试……这一章把所有东西串起来，从零做一个**完整的博客系统 API**。这是整个教程最重要的"验收章"——能独立写出来，就算 FastAPI 入门毕业了。

> 🏠 **生活类比：从零盖一栋楼**。写完整项目就像盖一栋楼——需求分析是画图纸（户型几室几厅），项目结构是搭脚手架（哪里是承重墙、哪里是隔断），数据模型是打地基（钢筋水泥的桩基），业务逻辑是水电布线（管子走哪儿、开关在哪儿），路由是门窗楼梯（从哪个门进哪个房间），认证是门禁卡（谁有权限进），测试是验收质检（漏水不漏水、通电不通电），部署是交钥匙入住。盖楼不能先装窗户再打地基，写项目也不能先写路由再定模型——**顺序很重要**。

### 61.1 为什么要有"完整项目"这一章

学单车时拆开练"蹬踏板""扶把""刹车"是一回事，真骑上路是另一回事。完整项目这一章解决三个问题：

1. **怎么把零碎知识组织成一个能跑的整体**——文件怎么分、模块怎么拆、依赖怎么注入；
2. **真实项目的"决策点"怎么想**——为什么这样分层、为什么用 JWT 而不是 session、为什么权限要写在依赖里；
3. **新手最容易踩的坑**——循环导入、N+1 查询、权限漏洞、事务没回滚。

> 本项目代码可以直接拿来当脚手架。理解之后，换成"电商""论坛""TODO"都是同一套骨架。

### 61.2 需求分析（博客系统 API）

先把需求列清楚，再动手。**没有需求就写代码，等于没地图就出门。**

**功能清单：**

| 模块 | 功能 | 说明 |
| --- | --- | --- |
| 用户 | 注册、登录、改资料 | 注册要校验邮箱唯一，登录发 JWT |
| 文章 | 发布、编辑、删除、列表、详情 | 列表要分页+搜索+按标签筛 |
| 评论 | 发评论、回复评论、删除 | 评论支持两级嵌套（回复+回复的回复） |
| 标签 | 创建标签、文章打标签、按标签查 | 文章和标签是多对多 |
| 权限 | 作者才能改自己的文章，管理员能删任何文章 | 用依赖注入统一控制 |

**接口清单（RESTful 风格）：**

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| POST | /auth/register | 注册 | 公开 |
| POST | /auth/login | 登录拿 token | 公开 |
| GET | /users/me | 当前用户信息 | 已登录 |
| PUT | /users/me | 修改资料 | 已登录 |
| GET | /posts | 文章列表（分页+搜索） | 公开 |
| POST | /posts | 发布文章 | 已登录 |
| GET | /posts/{id} | 文章详情 | 公开 |
| PUT | /posts/{id} | 编辑文章 | 作者本人 |
| DELETE | /posts/{id} | 删除文章 | 作者或管理员 |
| GET | /posts/{id}/comments | 文章评论列表 | 公开 |
| POST | /posts/{id}/comments | 发评论 | 已登录 |
| GET | /tags | 标签列表 | 公开 |

> **RESTful 怎么想**：用 HTTP 方法表示动作（GET 查、POST 增、PUT 改、DELETE 删），用 URL 表示资源（名词复数 /posts、/users）。状态码用 201 表示创建、204 表示删除成功、401 表示没登录、403 表示没权限。一套约定下来，前端看 URL 就知道是干嘛的。

### 61.3 项目结构搭建（Demo 1：项目骨架）

**怎么想的**：新手最容易犯的错是把所有代码塞进 main.py。一旦代码超过 500 行，改一个字段要在文件里上下翻找。正确的做法是**按职责分层**：

- api 层：只管"接请求、调 service、返响应"；
- service 层：管业务逻辑（如"发文章前要校验标签存在"）；
- crud 层：只管数据库增删改查；
- models 层：只管表结构；
- schemas 层：只管入参出参的校验。

\`\`\`
blog/
├── app/
│   ├── main.py                  # 入口：创建 app、挂路由、加中间件
│   ├── core/
│   │   ├── config.py            # 配置（从 .env 读）
│   │   ├── security.py          # JWT 生成/校验、密码哈希
│   │   ├── database.py          # 引擎、SessionLocal
│   │   └── deps.py              # 通用依赖：get_db、get_current_user
│   ├── api/v1/
│   │   ├── router.py            # 汇总所有子路由
│   │   ├── auth.py              # /auth/*
│   │   ├── users.py             # /users/*
│   │   ├── posts.py             # /posts/*
│   │   ├── comments.py          # /posts/{id}/comments
│   │   └── tags.py              # /tags
│   ├── crud/
│   │   ├── base.py              # CRUDBase 泛型基类
│   │   ├── user.py
│   │   ├── post.py
│   │   ├── comment.py
│   │   └── tag.py
│   ├── models/
│   │   ├── base.py              # DeclarativeBase
│   │   ├── user.py
│   │   ├── post.py
│   │   ├── comment.py
│   │   └── tag.py
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── post.py
│   │   ├── comment.py
│   │   └── tag.py
│   └── utils/
│       └── pagination.py        # 分页工具
├── tests/
│   ├── conftest.py              # pytest 夹具：测试库、测试 client
│   ├── test_auth.py
│   └── test_posts.py
├── .env
└── requirements.txt
\`\`\`

**配置文件**——为什么用 pydantic-settings 而不是直接读 os.environ？因为带类型校验、带默认值、能从 .env 读，少写一堆 try/except。

\`\`\`python
# app/core/config.py
# 从 pydantic_settings 导入 BaseSettings（Pydantic v2 的配置基类）
from pydantic_settings import BaseSettings, SettingsConfigDict

# 定义配置类 Settings，继承 BaseSettings
class Settings(BaseSettings):
    # 数据库连接串，默认用 SQLite（开发方便，生产换 Postgres）
    database_url: str = "sqlite:///./blog.db"
    # JWT 密钥，生产环境必须改！这里给个默认值方便开发
    secret_key: str = "dev-secret-change-me-in-production"
    # JWT 算法
    algorithm: str = "HS256"
    # token 过期时间（分钟），默认 60 分钟=1 小时
    access_token_expire_minutes: int = 60

    # 告诉 pydantic 从 .env 文件读配置
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

# 实例化一个全局 settings，其他模块直接 from app.core.config import settings
settings = Settings()
\`\`\`

> **避坑**：\`secret_key\` 千万别硬编码进代码仓库。生产环境用 \`openssl rand -hex 32\` 生成一个，放 .env 里，.env 加进 .gitignore。

**数据库引擎**：

\`\`\`python
# app/core/database.py
# 从 sqlalchemy 导入引擎工厂、会话工厂
# create_engine 创建数据库连接引擎
from sqlalchemy import create_engine
# sessionmaker 是会话工厂，DeclarativeBase 是 ORM 模型基类
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# 从 config 拿连接串
from app.core.config import settings

# 创建引擎。check_same_thread=False 是 SQLite 专用，允许多线程访问
# echo=True 会打印 SQL，开发时开着看执行了啥，生产必须关掉（泄露数据+慢）
# connect_args 只在用 SQLite 时加，PostgreSQL/MySQL 不需要
engine = create_engine(
    settings.database_url,
    # 三元表达式：如果是 SQLite 就加 check_same_thread=False，否则空字典
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
    echo=False,
)

# SessionLocal 是会话工厂，每个请求开一个 session，用完关掉
# autocommit=False: 不自动提交，要手动 db.commit()
# autoflush=False: 不自动刷新，避免查询前自动 flush 产生意外 SQL
# bind=engine: 绑定到上面创建的引擎
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 定义 Base，所有 model 继承它
# DeclarativeBase 是 SQLAlchemy 2.0 的基类（旧版用 declarative_base()）
class Base(DeclarativeBase):
    pass
\`\`\`

### 61.4 数据模型设计（Demo 2：四个模型）

**怎么想的**：先把表关系画清楚再写代码。博客系统的关系是：

- User 1—N Post（一个用户发多篇文章）
- User 1—N Comment（一个用户发多条评论）
- Post 1—N Comment（一篇文章有多条评论）
- Comment 1—N Comment（评论可以回复评论，自引用）
- Post N—N Tag（文章和标签多对多，需中间表）

\`\`\`python
# app/models/user.py
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class User(Base):
    # 表名
    __tablename__ = "users"

    # 主键 id，自增
    id: Mapped[int] = mapped_column(primary_key=True)
    # 邮箱，唯一+加索引（登录时按邮箱查，索引能加速）
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    # 哈希后的密码，绝不存明文
    hashed_password: Mapped[str] = mapped_column(String(255))
    # 昵称
    nickname: Mapped[str] = mapped_column(String(50))
    # 是否管理员
    is_admin: Mapped[bool] = mapped_column(default=False)

    # 关系：一个用户有多篇文章。back_populates 双向关联
    # cascade="all, delete-orphan"：删用户时连带删他的文章
    posts: Mapped[list["Post"]] = relationship(back_populates="author", cascade="all, delete-orphan")
    comments: Mapped[list["Comment"]] = relationship(back_populates="author", cascade="all, delete-orphan")
\`\`\`

\`\`\`python
# app/models/post.py
import datetime
from sqlalchemy import String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Column, Table
from app.models.base import Base

# 多对多中间表：post_tags。文章和标签的关联
post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    # 标题
    title: Mapped[str] = mapped_column(String(200))
    # 正文
    content: Mapped[str] = mapped_column(Text)
    # 作者 id，外键指向 users.id。ondelete="CASCADE"：删作者连带删文章
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    # 创建时间，server_default 用数据库的 now()
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())
    # 更新时间，更新时自动改
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # 关系：文章→作者（多对一）
    author: Mapped["User"] = relationship(back_populates="posts")
    # 关系：文章→评论（一对多），cascade 删文章连带删评论
    comments: Mapped[list["Comment"]] = relationship(back_populates="post", cascade="all, delete-orphan")
    # 关系：文章→标签（多对多），secondary 指向中间表
    tags: Mapped[list["Tag"]] = relationship(secondary=post_tags, back_populates="posts")
\`\`\`

\`\`\`python
# app/models/comment.py
from sqlalchemy import String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base
import datetime

class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True)
    # 评论内容
    content: Mapped[str] = mapped_column(Text)
    # 评论者 id
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    # 所属文章 id
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"))
    # 父评论 id，可空。为空说明是顶级评论，有值说明是回复
    # self-referencing：自己引用自己，实现"评论的回复"
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())

    # 关系
    author: Mapped["User"] = relationship(back_populates="comments")
    post: Mapped["Post"] = relationship(back_populates="comments")
    # 回复：一个评论有多条回复。remote_side=[id] 告诉 SQLAlchemy 父端是 id
    replies: Mapped[list["Comment"]] = relationship(back_populates="parent", cascade="all, delete-orphan")
    parent: Mapped["Comment | None"] = relationship(back_populates="replies", remote_side=[id])
\`\`\`

\`\`\`python
# app/models/tag.py
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    # 标签名，唯一
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True)

    # 关系：标签→文章（多对多）
    posts: Mapped[list["Post"]] = relationship(secondary="post_tags", back_populates="tags")
\`\`\`

> **避坑**：自引用关系（Comment 回复 Comment）必须写 \`remote_side=[id]\`，否则 SQLAlchemy 分不清谁是父谁是子，会报错 "Could not determine join condition"。

### 61.5 用户认证：JWT（Demo 3：注册+登录）

**为什么用 JWT 不用 session**：session 要服务端存（内存或 Redis），扩容时还要共享 session，麻烦。JWT 是无状态的——服务端签发后不存，客户端每次请求带在 header 里，服务端只管校验签名。适合前后端分离、微服务、移动端。

**密码哈希**：用 passlib 的 bcrypt。**绝对不能存明文**，也不能用 MD5/SHA1（能被彩虹表破解）。bcrypt 自带盐，同一个密码每次哈希结果都不一样。

\`\`\`python
# app/core/security.py
# 从 datetime 模块导入 datetime（时间点）、timedelta（时间差）、timezone（时区）
from datetime import datetime, timedelta, timezone
# 从 jose 库导入 jwt 和 JWTError
# jose 是 Python 的 JWT 库，jwt 是编解码函数，JWTError 是异常类
from jose import jwt, JWTError
# 从 passlib.context 导入 CryptContext，用于密码哈希
# passlib 支持多种哈希算法，CryptContext 是统一接口
from passlib.context import CryptContext
# 从 config 导入 settings，里面有密钥、算法、过期时间
from app.core.config import settings

# 密码上下文，指定用 bcrypt
# schemes=["bcrypt"] 表示用 bcrypt 算法（自带盐，抗彩虹表）
# deprecated="auto" 表示旧算法自动迁移到新算法
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 哈希密码
def hash_password(password: str) -> str:
    # pwd_context.hash 会自动加盐
    # 同一个密码每次哈希结果都不同（因为盐不同），但 verify 能正确校验
    return pwd_context.hash(password)

# 校验密码：明文 vs 哈希值
def verify_password(plain: str, hashed: str) -> bool:
    # verify 内部会用同样的盐对 plain 哈希，再和 hashed 比对
    return pwd_context.verify(plain, hashed)

# 生成 JWT
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    # 拷贝一份，避免改原 dict
    to_encode = data.copy()
    # 过期时间
    # datetime.now(timezone.utc) 获取当前 UTC 时间（带时区）
    # expires_delta 优先用传入的，没传就用配置的默认值
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    # 把 exp（expiration）字段加进去，JWT 标准字段
    to_encode.update({"exp": expire})
    # 用密钥签名
    # jwt.encode 会把 data 编码成 header.payload.signature 三段
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

# 解析 JWT
def decode_token(token: str) -> dict | None:
    try:
        # jwt.decode 会校验签名和过期时间，失败抛 JWTError
        # algorithms 必须是列表（即使只有一个）
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        # token 过期、签名不对、格式错都会抛 JWTError
        return None
\`\`\`

**通用依赖**：把"获取数据库 session"和"获取当前用户"写成依赖，到处复用。

\`\`\`python
# app/core/deps.py
# 从 fastapi 导入 Depends（依赖注入）、HTTPException（HTTP 异常）、status（状态码常量）
from fastapi import Depends, HTTPException, status
# 从 fastapi.security 导入 OAuth2PasswordBearer
# 它是一个依赖类，自动从请求头 Authorization: Bearer xxx 提取 token
from fastapi.security import OAuth2PasswordBearer
# 从 sqlalchemy.orm 导入 Session，用于类型注解
from sqlalchemy.orm import Session

# 从 database 导入 SessionLocal 会话工厂
from app.core.database import SessionLocal
# 从 security 导入 decode_token 解析 JWT
from app.core.security import decode_token
# 从 models 导入 User 模型
from app.models.user import User

# OAuth2PasswordBearer 自动从 Authorization: Bearer xxx 读 token
# tokenUrl 是 Swagger 文档里登录接口的 URL（Swagger 会在 /docs 页面显示登录按钮）
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# 依赖：每个请求拿一个 db session
# 用 yield 语法，FastAPI 会在请求结束后执行 finally 关闭 session
def get_db():
    db = SessionLocal()
    try:
        # yield 把 db 交给路由用，路由执行完后才继续往下
        yield db
    finally:
        # 无论路由是否抛异常，都会关闭 session（防止连接泄漏）
        db.close()

# 依赖：拿当前登录用户
# token: str = Depends(oauth2_scheme) 自动提取并校验 token
# db: Session = Depends(get_db) 嵌套依赖，FastAPI 会先执行 get_db
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    # 解析 token
    payload = decode_token(token)
    if payload is None:
        # 401 = 没认证（没 token、token 无效、token 过期）
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="无效的认证凭证")
    # 从 payload 取 user_id（登录时塞进去的）
    # "sub" 是 JWT 标准字段，表示 subject（主体），这里存 user_id
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="token 缺少用户信息")
    # 查用户
    # db.get(User, int(user_id)) 按主键查，比 query.filter 更高效
    user = db.get(User, int(user_id))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户不存在")
    return user
\`\`\`

> **怎么想的**：为什么把 get_current_user 写成依赖而不是函数？因为 FastAPI 的依赖注入会自动缓存——一个请求里多个路由参数都依赖 get_current_user，只执行一次。而且依赖能层层嵌套，写权限校验时直接 Depends(get_current_user)。

**注册+登录路由**：

\`\`\`python
# app/api/v1/auth.py
# 从 fastapi 导入 APIRouter（路由容器）、Depends（依赖注入）、HTTPException、status
from fastapi import APIRouter, Depends, HTTPException, status
# 从 sqlalchemy.orm 导入 Session，用于类型注解
from sqlalchemy.orm import Session
# 从 deps 导入 get_db 和 get_current_user 依赖
from app.core.deps import get_db, get_current_user
# 从 security 导入密码哈希、校验、token 生成函数
from app.core.security import hash_password, verify_password, create_access_token
# 从 models 导入 User ORM 模型
from app.models.user import User
# 从 schemas 导入请求/响应模型（Pydantic）
from app.schemas.auth import RegisterIn, LoginIn, TokenOut, UserOut

# 创建路由器，prefix="/auth" 表示所有路径自动加 /auth 前缀
# tags=["认证"] 用于 Swagger 文档分组
router = APIRouter(prefix="/auth", tags=["认证"])

# 注册
# @router.post 注册 POST 路由，完整路径是 /auth/register
# response_model=UserOut 指定响应模型，FastAPI 会按 UserOut 过滤输出字段
# status_code=201 表示创建成功（默认是 200）
@router.post("/register", response_model=UserOut, status_code=201)
# body: RegisterIn 自动从请求体解析并校验
# db: Session = Depends(get_db) 通过依赖注入获取数据库会话
def register(body: RegisterIn, db: Session = Depends(get_db)):
    # 先查邮箱有没有被注册
    # db.query(User) 创建查询，.filter 加条件，.first() 取第一条
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        # 409 = 冲突（资源已存在）
        raise HTTPException(status_code=409, detail="该邮箱已被注册")
    # 创建用户
    # 密码要哈希后存储，绝不存明文
    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        nickname=body.nickname,
    )
    db.add(user)        # 加到会话
    db.commit()         # 提交到数据库
    db.refresh(user)    # 刷新，获取数据库生成的 id
    return user

# 登录
# @router.post 注册 POST 路由，完整路径是 /auth/login
@router.post("/login", response_model=TokenOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    # 按邮箱查用户
    user = db.query(User).filter(User.email == body.email).first()
    # 用户不存在 或 密码错
    # 注意：不要分开报"用户不存在"和"密码错"，会被枚举攻击
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    # 生成 token，sub（subject）放 user_id
    # str(user.id) 因为 JWT payload 的值必须是字符串
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}
\`\`\`

\`\`\`python
# app/schemas/auth.py
# 从 pydantic 导入 BaseModel（模型基类）、EmailStr（邮箱类型）、Field（字段约束）
from pydantic import BaseModel, EmailStr, Field

# 注册请求模型
class RegisterIn(BaseModel):
    # EmailStr 会自动校验邮箱格式，不合法返回 422
    email: EmailStr
    # Field(min_length=6, max_length=64) 限制密码长度
    password: str = Field(min_length=6, max_length=64)
    nickname: str = Field(min_length=2, max_length=50)

# 登录请求模型
class LoginIn(BaseModel):
    email: EmailStr
    password: str  # 登录不做长度校验，因为注册时已经校验过

# 登录响应模型（返回 token）
class TokenOut(BaseModel):
    access_token: str   # JWT token
    token_type: str     # token 类型，OAuth2 标准是 "bearer"

# 用户信息响应模型（返回给前端，不含密码）
class UserOut(BaseModel):
    id: int
    email: EmailStr
    nickname: str
    is_admin: bool
    # from_attributes=True 允许从 ORM 对象的属性自动构造
    # 这样 return user（ORM 对象）会被自动转成 UserOut
    model_config = {"from_attributes": True}
\`\`\`

> **避坑**：\`EmailStr\` 需要 \`pip install pydantic[email]\`，没装会报 "email-validator is not installed"。

### 61.6 文章 CRUD + 分页 + 搜索（Demo 4）

**分页怎么想**：列表接口必须分页，否则数据一多内存炸、响应慢。用 \`?page=1&size=20\` 这种 query 参数，返回时要带 total 让前端显示总页数。

\`\`\`python
# app/utils/pagination.py
# 从 fastapi 导入 Query，用于声明查询参数并加约束
from fastapi import Query
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 分页参数依赖：复用，每个列表接口都 Depends(pagination_params)
# 写成依赖而不是函数，这样 FastAPI 能自动从 query string 提取参数
def pagination_params(
    # Query(1, ge=1, ...) 表示默认值 1，必须 >= 1
    # ge=1: greater than or equal（>=1）
    # description 显示在 Swagger 文档
    page: int = Query(1, ge=1, description="页码，从1开始"),
    # le=100: less than or equal（<=100），防止一次查太多
    size: int = Query(20, ge=1, le=100, description="每页数量，最多100"),
):
    return {"page": page, "size": size}

# 分页响应
class Page(BaseModel):
    items: list      # 当前页的数据列表
    total: int       # 总记录数
    page: int        # 当前页码
    size: int        # 每页数量
    pages: int       # 总页数（前端用来显示分页器）
\`\`\`

**CRUD 基类**——为什么写泛型基类？因为 User/Post/Comment 的增删改查套路一样，写一遍复用，少写重复代码。

\`\`\`python
# app/crud/base.py
# 从 typing 导入泛型相关：Generic（泛型基类）、TypeVar（类型变量）、Type（类型本身）
from typing import Generic, TypeVar, Type
# 从 sqlalchemy.orm 导入 Session
from sqlalchemy.orm import Session

# 定义类型变量 ModelT，代表任意 ORM 模型类型
# 这样 CRUDBase[User] 里 ModelT 就等于 User
ModelT = TypeVar("ModelT")

# Generic[ModelT] 让 CRUDBase 支持泛型，子类可以指定具体模型
class CRUDBase(Generic[ModelT]):
    def __init__(self, model: Type[ModelT]):
        # model 是 ORM 模型类（如 User、Post）
        self.model = model

    # 按主键查
    def get(self, db: Session, id: int) -> ModelT | None:
        # db.get(模型, 主键) 是按主键查的最高效方式
        return db.get(self.model, id)

    # 查多条
    def get_multi(self, db: Session, skip: int = 0, limit: int = 20) -> list[ModelT]:
        # offset(skip) 跳过前 skip 条，limit(limit) 取 limit 条
        return db.query(self.model).offset(skip).limit(limit).all()

    # 创建
    def create(self, db: Session, obj: ModelT) -> ModelT:
        db.add(obj)        # 加到会话（还没入库）
        db.commit()        # 提交到数据库
        db.refresh(obj)    # 刷新，获取数据库生成的字段（如自增 id）
        return obj

    # 删除
    def delete(self, db: Session, obj: ModelT) -> None:
        db.delete(obj)     # 标记删除
        db.commit()        # 提交，真正执行 DELETE
\`\`\`

**文章 CRUD**（带搜索）：

\`\`\`python
# app/crud/post.py
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.crud.base import CRUDBase
from app.models.post import Post

class CRUDPost(CRUDBase[Post]):
    def __init__(self):
        super().__init__(Post)

    # 带搜索的分页查询
    def search(
        self,
        db: Session,
        keyword: str | None = None,
        tag_id: int | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Post], int]:
        # 基础 query
        q = db.query(Post)
        # 关键词搜标题或正文。ilike 是不区分大小写的 LIKE
        if keyword:
            q = q.filter(or_(Post.title.ilike(f"%{keyword}%"), Post.content.ilike(f"%{keyword}%")))
        # 按标签筛
        if tag_id:
            q = q.filter(Post.tags.any(id=tag_id))
        # 按创建时间倒序
        q = q.order_by(Post.created_at.desc())
        # total 要在分页前 count
        total = q.count()
        items = q.offset(skip).limit(limit).all()
        return items, total

post_crud = CRUDPost()
\`\`\`

**文章路由**（含权限控制）：

\`\`\`python
# app/api/v1/posts.py
# 从 fastapi 导入 APIRouter（路由容器）、Depends（依赖注入）、HTTPException（HTTP 异常）、status（状态码常量）
from fastapi import APIRouter, Depends, HTTPException, status
# 从 sqlalchemy.orm 导入 Session，用于类型注解
from sqlalchemy.orm import Session

# 从 deps 导入 get_db 和 get_current_user 依赖
from app.core.deps import get_db, get_current_user
# 导入 crud 层（数据访问），把 SQL 操作封装在 crud 里，路由不直接写 SQL
from app.crud.post import post_crud
# 导入 User 和 Post ORM 模型
from app.models.user import User
from app.models.post import Post
# 导入 Pydantic 模型（请求体/响应体）
from app.schemas.post import PostCreate, PostOut, PostList
# 导入分页参数依赖
from app.utils.pagination import pagination_params

# 创建路由器，prefix="/posts" 表示所有路径自动加 /posts 前缀
# tags=["文章"] 用于 Swagger 文档分组
router = APIRouter(prefix="/posts", tags=["文章"])

# 文章列表（公开，分页+搜索）
# @router.get 注册 GET 路由，路径是 ""（空字符串，配合 prefix 就是 /posts）
# response_model=PostList 指定响应模型，FastAPI 会按 PostList 过滤输出
@router.get("", response_model=PostList)
# keyword/tag_id 是查询参数，str | None 表示可选（默认 None）
# paging: dict = Depends(pagination_params) 通过依赖注入拿分页参数
# db: Session = Depends(get_db) 通过依赖注入拿数据库会话
def list_posts(
    keyword: str | None = None,
    tag_id: int | None = None,
    paging: dict = Depends(pagination_params),
    db: Session = Depends(get_db),
):
    # 计算跳过多少条（分页公式：第 n 页跳过 (n-1)*size 条）
    skip = (paging["page"] - 1) * paging["size"]
    # 调 crud 层查询，返回 (items, total) 元组
    items, total = post_crud.search(db, keyword=keyword, tag_id=tag_id, skip=skip, limit=paging["size"])
    # 计算总页数：(total + size - 1) // size 是向上取整的写法
    # 例如 total=21, size=20 → (21+19)//20 = 2 页
    pages = (total + paging["size"] - 1) // paging["size"]
    return {"items": items, "total": total, "page": paging["page"], "size": paging["size"], "pages": pages}

# 发布文章（需登录）
# @router.post 注册 POST 路由，status_code=201 表示创建成功
@router.post("", response_model=PostOut, status_code=201)
# current_user: User = Depends(get_current_user) 强制登录
# get_current_user 内部会校验 token，没登录直接抛 401
def create_post(
    body: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 创建文章 ORM 对象，author_id 从当前登录用户拿
    post = Post(title=body.title, content=body.content, author_id=current_user.id)
    db.add(post)        # 加到会话
    db.commit()         # 提交到数据库
    db.refresh(post)    # 刷新，获取数据库生成的 id 和默认值
    return post

# 文章详情（公开）
@router.get("/{post_id}", response_model=PostOut)
# post_id: int 路径参数，FastAPI 自动从 URL 提取并转成 int
def get_post(post_id: int, db: Session = Depends(get_db)):
    # db.get(Post, post_id) 按主键查，比 query.filter 更简洁
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")
    return post

# 编辑文章（权限：作者本人）
@router.put("/{post_id}", response_model=PostOut)
def update_post(
    post_id: int,
    body: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")
    # 权限校验：只有作者本人能改
    # 不校验的话，任何人都能改别人的文章，严重安全漏洞
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="只能修改自己的文章")
    # 直接修改 ORM 对象的属性，SQLAlchemy 会跟踪变化
    post.title = body.title
    post.content = body.content
    db.commit()         # 提交，SQLAlchemy 自动生成 UPDATE SQL
    db.refresh(post)    # 刷新，确保返回最新数据
    return post

# 删除文章（权限：作者本人 或 管理员）
# status_code=204 表示无内容返回（DELETE 成功通常不返回 body）
@router.delete("/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")
    # 权限：作者本人 或 管理员
    # and not 的优先级：先算 and，再算 not
    # 即：如果（不是作者）并且（不是管理员），才拒绝
    if post.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="没有权限删除此文")
    db.delete(post)     # 标记删除
    db.commit()         # 提交，生成 DELETE SQL
\`\`\`

> **权限怎么想**：权限校验写在路由里而不是 crud 里，因为 crud 不知道"当前用户是谁"。路由层拿到 current_user 才能判断。如果权限规则复杂（比如"作者或编辑或管理员"），可以抽成依赖工厂，下一节演示。

### 61.7 评论系统 + 权限依赖（Demo 5）

**两级评论怎么想**：用 parent_id 实现自引用。顶级评论 parent_id 为空，回复有 parent_id。查文章评论时先查顶级评论，再查每条的回复。**不要无限嵌套**——前端渲染麻烦，性能也差，两级足够。

**权限依赖工厂**——把权限规则抽成可复用的依赖：

\`\`\`python
# app/core/deps.py（追加）
from app.models.post import Post

# 依赖工厂：校验"当前用户是某文章的作者"
def require_post_author(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Post:
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")
    if post.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="权限不足")
    return post
\`\`\`

**评论路由**：

\`\`\`python
# app/api/v1/comments.py
# 从 fastapi 导入 APIRouter（路由容器）、Depends（依赖注入）、HTTPException（HTTP 异常）
from fastapi import APIRouter, Depends, HTTPException
# 从 sqlalchemy.orm 导入 Session，用于类型注解
from sqlalchemy.orm import Session

# 从 deps 导入 get_db 和 get_current_user 依赖
from app.core.deps import get_db, get_current_user
# 导入 ORM 模型
from app.models.user import User
from app.models.post import Post
from app.models.comment import Comment
# 导入 Pydantic 模型
from app.schemas.comment import CommentCreate, CommentOut

# 创建路由器，prefix 里带路径参数 {post_id}
# 这样评论路由天然挂在某篇文章下，完整路径如 /posts/1/comments
router = APIRouter(prefix="/posts/{post_id}/comments", tags=["评论"])

# 文章评论列表（公开，只返顶级评论，回复嵌套在里面）
# response_model=list[CommentOut] 表示返回 CommentOut 列表
@router.get("", response_model=list[CommentOut])
def list_comments(post_id: int, db: Session = Depends(get_db)):
    # 先确认文章存在
    # 避免对不存在的文章查评论，浪费资源
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")
    # 查顶级评论（parent_id 为空），预加载 replies 避免 N+1
    # N+1 问题：查 N 条评论后再逐条查回复，共 N+1 次 SQL
    # 解决：用 relationship 的 joinedload/selectinload 一次性查完
    comments = (
        db.query(Comment)
        .filter(Comment.post_id == post_id, Comment.parent_id.is_(None))
        # .asc() 升序（早发的在前），.desc() 降序
        .order_by(Comment.created_at.asc())
        .all()
    )
    return comments

# 发评论（需登录）
@router.post("", response_model=CommentOut, status_code=201)
def create_comment(
    post_id: int,
    body: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")
    comment = Comment(
        content=body.content,
        author_id=current_user.id,
        post_id=post_id,
        parent_id=body.parent_id,  # 如果是回复，传父评论 id
    )
    # 校验 parent_id 有效
    # 防止客户端伪造 parent_id，把回复挂到别的文章的评论上
    if body.parent_id:
        parent = db.get(Comment, body.parent_id)
        # 父评论必须存在，且必须属于同一篇文章
        if not parent or parent.post_id != post_id:
            raise HTTPException(status_code=400, detail="父评论不存在或不属于该文章")
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

# 删除评论（作者本人 或 文章作者 或 管理员）
@router.delete("/{comment_id}", status_code=204)
def delete_comment(
    post_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = db.get(Comment, comment_id)
    # 同时校验 comment 存在 且 属于该文章（防止跨文章删评论）
    if not comment or comment.post_id != post_id:
        raise HTTPException(status_code=404, detail="评论不存在")
    post = db.get(Post, post_id)
    # 评论作者 / 文章作者 / 管理员 都能删
    # 三个条件用 and 连接，意思是"三个都不是"才拒绝
    # 文章作者能删任何人在他文章下的评论（管理自己文章的言论）
    if comment.author_id != current_user.id and post.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="没有权限删除此评论")
    db.delete(comment)
    db.commit()
\`\`\`

### 61.8 主入口 + 路由汇总 + 测试（Demo 6 & 7）

**主入口**——把所有路由挂上来：

\`\`\`python
# app/main.py
# 从 fastapi 导入 FastAPI 应用入口类
from fastapi import FastAPI
# 从 fastapi.middleware.cors 导入 CORSMiddleware（跨域中间件）
# CORS = Cross-Origin Resource Sharing，跨域资源共享
# 浏览器有同源策略，前端域名和后端不同时会被拦截，CORS 中间件解决这个
from fastapi.middleware.cors import CORSMiddleware

# 从 database 导入 Base（模型基类）和 engine（数据库引擎）
from app.core.database import Base, engine
# 从 router 导入聚合后的 api_router（包含所有子路由）
from app.api.v1.router import api_router

# 建表（开发用。生产用 Alembic 迁移）
# Base.metadata.create_all 会根据所有继承 Base 的模型创建表
# 生产环境不用这个，因为：1) 不能改表结构 2) 没有版本管理
# 生产用 Alembic 做 schema 迁移，能升级/回滚
Base.metadata.create_all(bind=engine)

# 创建应用实例，title 和 version 显示在 Swagger 文档 (/docs)
app = FastAPI(title="博客系统 API", version="1.0.0")

# CORS：允许前端跨域。生产环境别写 allow_origins=["*"]
# allow_origins=["*"] + allow_credentials=True 是无效组合（浏览器规范禁止）
# 生产环境应明确列出前端域名，如 ["https://blog.example.com"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 允许的前端域名
    allow_credentials=True,   # 允许带 cookie（登录态需要）
    allow_methods=["*"],      # 允许所有 HTTP 方法
    allow_headers=["*"],      # 允许所有请求头
)

# 挂载所有 v1 路由
# prefix="/api/v1" 给所有接口加统一前缀，方便未来版本升级
# 比如未来出 v2，可以同时挂 /api/v1 和 /api/v2，平滑过渡
app.include_router(api_router, prefix="/api/v1")

# 根路由，用作欢迎页或健康检查
@app.get("/")
def root():
    return {"msg": "博客系统 API 运行中"}
\`\`\`

\`\`\`python
# app/api/v1/router.py
# 从 fastapi 导入 APIRouter（路由容器）
from fastapi import APIRouter
# 导入所有子路由模块
# 每个模块里都有一个 router 变量（APIRouter 实例）
from app.api.v1 import auth, users, posts, comments, tags

# 创建聚合路由器
# 这个路由器本身不定义路由，只负责把各模块的 router 挂上来
api_router = APIRouter()
# 逐个挂载子路由
# 各子路由已自带 prefix（如 auth.router 有 prefix="/auth"）
# 挂载后完整路径如：/api/v1/auth/login（main.py 里还会加 /api/v1 前缀）
api_router.include_router(auth.router)       # /auth/*
api_router.include_router(users.router)     # /users/*
api_router.include_router(posts.router)     # /posts/*
api_router.include_router(comments.router)  # /posts/{post_id}/comments/*
api_router.include_router(tags.router)      # /tags/*
\`\`\`

**测试**——为什么用 pytest + httpx？因为 FastAPI 的 TestClient 底层就是 httpx，能跑异步，也能测 WebSocket。

\`\`\`python
# tests/conftest.py
# 导入 pytest
import pytest
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 sqlalchemy 导入 create_engine 和 sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 从 app.main 导入 app（被测对象）
from app.main import app
# 从 database 导入 Base（模型基类）和 get_db（要覆盖的依赖）
from app.core.database import Base, get_db
# 从 deps 导入 get_current_user
from app.core.deps import get_current_user
# 从 models 导入 User
from app.models.user import User

# 测试用内存 SQLite，跑完即弃，不污染开发库
# sqlite:///:memory: 是内存数据库，进程结束就消失
TEST_ENGINE = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
# 测试用会话工厂
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=TEST_ENGINE)

# 每个测试函数前后建表/删表
# @pytest.fixture() 把函数变成夹具，测试函数参数名匹配夹具名就自动注入
@pytest.fixture()
def db():
    # 测试前建表
    Base.metadata.create_all(bind=TEST_ENGINE)
    session = TestingSession()
    try:
        # yield 把 session 交给测试函数用
        yield session
    finally:
        # 测试后关闭 session 并删表（保证测试之间隔离）
        session.close()
        Base.metadata.drop_all(bind=TEST_ENGINE)

# 覆盖 get_db 依赖，让它用测试 session
@pytest.fixture()
def client(db):
    # 定义替代函数，返回测试用的 db
    def override_get_db():
        try:
            yield db
        finally:
            pass
    # dependency_overrides 是 FastAPI 的依赖覆盖机制
    # 把原来的 get_db 换成 override_get_db，这样路由拿到的 db 就是测试 session
    app.dependency_overrides[get_db] = override_get_db
    # yield 把 TestClient 交给测试函数
    yield TestClient(app)
    # 测试完清空覆盖，避免影响其他测试
    app.dependency_overrides.clear()

# 注册+登录拿 token（给需要认证的测试用）
@pytest.fixture()
def auth_token(client):
    # 先注册
    client.post("/api/v1/auth/register", json={"email": "a@b.com", "password": "123456", "nickname": "A"})
    # 再登录，拿 token
    r = client.post("/api/v1/auth/login", json={"email": "a@b.com", "password": "123456"})
    return r.json()["access_token"]
\`\`\`

\`\`\`python
# tests/test_posts.py
def test_create_post_requires_auth(client):
    # 没带 token，应该 401
    r = client.post("/api/v1/posts", json={"title": "t", "content": "c"})
    assert r.status_code == 401

def test_create_post_with_token(client, auth_token):
    r = client.post(
        "/api/v1/posts",
        json={"title": "我的文章", "content": "内容"},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert r.status_code == 201
    assert r.json()["title"] == "我的文章"

def test_update_post_only_author(client, auth_token):
    # 作者发文章
    r = client.post(
        "/api/v1/posts",
        json={"title": "t", "content": "c"},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    post_id = r.json()["id"]
    # 另一个用户登录
    client.post("/api/v1/auth/register", json={"email": "b@b.com", "password": "123456", "nickname": "B"})
    r2 = client.post("/api/v1/auth/login", json={"email": "b@b.com", "password": "123456"})
    token_b = r2.json()["access_token"]
    # B 想改 A 的文章，应该 403
    r3 = client.put(
        f"/api/v1/posts/{post_id}",
        json={"title": "hack", "content": "hack"},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert r3.status_code == 403
\`\`\`

### 61.9 生活类比：盖楼工种对照表

把博客系统的各层映射到盖楼的工种，理解起来更直观：

| 盖楼工种 | 项目分层 | 职责 | 不能越界 |
| --- | --- | --- | --- |
| 设计师画图纸 | 需求分析 + Schemas | 定字段、定类型、定校验 | 不能在图纸上砌墙 |
| 打桩工打地基 | Models（表结构） | 定义表、字段、关系、索引 | 地基里不能埋电线 |
| 水电工布管 | CRUD 层 | 数据库增删改查的原子操作 | 水电工不管室内装修 |
| 装修工精装 | Service / 路由 | 业务逻辑、权限校验、组装数据 | 装修工不改承重墙 |
| 门禁系统 | 认证（JWT） | 谁能进、谁能改 | 门禁不管你房间里干嘛 |
| 质检员验收 | 测试（pytest） | 接口对不对、权限严不严 | 质检不参与施工 |
| 交钥匙入住 | 部署上线 | 让用户能用上 | 交付前要全检一遍 |

> **怎么想的**：分层 = 分工。一层出问题不影响其他层。比如换数据库（地基换了），只要 CRUD 层接口不变，路由层完全无感。这就是"高内聚低耦合"在工程上的体现。

### 61.10 完整电商 API 实现（Demo 8：路由/业务/数据三层完整代码）

**怎么想的**：博客系统是"读多写少"的典型，电商系统是"写多事务复杂"的典型。电商比博客多了：库存扣减、订单状态机、支付回调、并发扣库存。下面是一个**最小可用的电商 API**，展示三层架构（路由/业务/数据）的完整代码。

> 🏠 **生活类比**：电商 API 像开一家超市——商品模型是货架上的货（SKU），购物车是顾客提的篮子，订单是收银台打的小票，库存是仓库管理员记的账本，支付是收银员扫码收钱。**扣库存和收钱必须绑在一起**——不能收了钱没货，也不能发了货没收到钱。

**项目结构（电商版）**：

\`\`\`
shop/
├── app/
│   ├── main.py                  # 入口
│   ├── core/
│   │   ├── config.py            # 配置
│   │   ├── database.py          # 引擎+会话
│   │   ├── security.py          # JWT
│   │   └── deps.py              # 通用依赖
│   ├── models/                  # ORM 模型（数据层）
│   │   ├── user.py
│   │   ├── product.py           # 商品 + SKU
│   │   ├── cart.py              # 购物车
│   │   └── order.py             # 订单 + 订单项
│   ├── schemas/                 # Pydantic 模型（入参出参）
│   ├── crud/                    # 数据访问层（只管 SQL）
│   ├── services/                # 业务逻辑层（事务、状态机）
│   │   ├── order_service.py     # 下单、取消、支付回调
│   │   └── stock_service.py     # 库存扣减、回滚
│   ├── api/v1/
│   │   ├── products.py          # 商品路由
│   │   ├── cart.py              # 购物车路由
│   │   └── orders.py            # 订单路由
│   └── utils/
└── tests/
\`\`\`

**1. 数据层：商品和 SKU 模型**

\`\`\`python
# app/models/product.py
# 电商核心：商品（SPU）+ 规格（SKU）。一个商品有多个 SKU
# 例如：商品"iPhone 15"有 SKU"iPhone 15 128G 黑色""iPhone 15 256G 白色"
import datetime
from sqlalchemy import String, Integer, Text, ForeignKey, DateTime, func, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

# 商品 SPU（Standard Product Unit）
class Product(Base):
    __tablename__ = "products"
    # 主键
    id: Mapped[int] = mapped_column(primary_key=True)
    # 商品名
    name: Mapped[str] = mapped_column(String(200), index=True)
    # 商品描述
    description: Mapped[str] = mapped_column(Text, default="")
    # 是否上架
    is_active: Mapped[bool] = mapped_column(default=True)
    # 创建时间
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())
    # 关联 SKU 列表（一对多）
    skus: Mapped[list["SKU"]] = relationship(back_populates="product", cascade="all, delete-orphan")

# 商品 SKU（Stock Keeping Unit）—— 最小库存单位
class SKU(Base):
    __tablename__ = "skus"
    id: Mapped[int] = mapped_column(primary_key=True)
    # 所属商品
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    # 规格名，如 "128G 黑色"
    spec: Mapped[str] = mapped_column(String(100))
    # 价格，用 Numeric 而不是 Float（浮点数有精度问题，金额必须用 Decimal）
    price: Mapped[float] = mapped_column(Numeric(10, 2))  # 10 位总长，2 位小数
    # 库存数。with_for_update 时要锁这一行
    stock: Mapped[int] = mapped_column(Integer, default=0)
    # 关联商品
    product: Mapped["Product"] = relationship(back_populates="skus")
\`\`\`

> **避坑**：金额字段**绝对不能用 Float**！Float 有精度丢失（0.1+0.2 != 0.3）。必须用 \`Numeric(10, 2)\` 或整数分（price_cents）。

**2. 数据层：订单和订单项模型**

\`\`\`python
# app/models/order.py
# 订单 = 一次购买行为。一个订单有多个订单项（买了哪些 SKU、各几个）
import datetime
import enum
from sqlalchemy import String, Integer, Text, ForeignKey, DateTime, func, Numeric, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

# 订单状态枚举。用 enum 而不是字符串，防止写入非法状态
class OrderStatus(str, enum.Enum):
    pending = "pending"      # 待支付
    paid = "paid"            # 已支付，待发货
    shipped = "shipped"      # 已发货
    completed = "completed"  # 已完成
    cancelled = "cancelled"  # 已取消

# 订单主表
class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    # 订单号，唯一。用时间戳+随机数生成，对外暴露用订单号不用自增 id
    order_no: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    # 下单用户
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    # 订单总金额（冗余字段，下单时算好存下来，避免商品改价后历史订单金额错乱）
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2))
    # 订单状态
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.pending)
    # 创建时间
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())
    # 关联订单项
    items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")

# 订单项：订单里的每一行（买了哪个 SKU、几个、单价）
class OrderItem(Base):
    __tablename__ = "order_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    # 所属订单
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"))
    # 买的哪个 SKU
    sku_id: Mapped[int] = mapped_column(ForeignKey("skus.id"))
    # 买几个
    quantity: Mapped[int] = mapped_column(Integer)
    # 下单时的单价（快照）。商品后续改价不影响这个值
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2))
    # 关联订单
    order: Mapped["Order"] = relationship(back_populates="items")
\`\`\`

> **怎么想的**：为什么 \`unit_price\` 存在订单项里而不是关联 SKU 取？因为**价格是时点数据**——今天下单 99 元，明天改成 109 元，历史订单应该还是 99。这就是"数据快照"思想。

**3. 业务层：库存扣减服务（核心！）**

\`\`\`python
# app/services/stock_service.py
# 库存服务：电商最容易出 bug 的地方
# 核心问题：并发下单时库存不能超卖
from sqlalchemy.orm import Session
from app.models.product import SKU
from app.models.order import Order, OrderItem
from fastapi import HTTPException

def deduct_stock(db: Session, items: list[dict]) -> None:
    """
    扣库存。items 是 [{"sku_id": 1, "quantity": 2}, ...]
    关键：用 SELECT ... FOR UPDATE 锁行，防止并发超卖
    """
    for item in items:
        # with_for_update() 加行锁：其他事务读到这一行会等待
        # 这是防止超卖的核心：锁住 SKU 行，扣完库存再提交
        sku = (
            db.query(SKU)
            .filter(SKU.id == item["sku_id"])
            .with_for_update()  # SELECT ... FOR UPDATE
            .first()
        )
        if not sku:
            raise HTTPException(404, f"SKU {item['sku_id']} 不存在")
        # 检查库存够不够
        if sku.stock < item["quantity"]:
            raise HTTPException(400, f"库存不足：{sku.spec} 仅剩 {sku.stock}")
        # 扣库存
        sku.stock -= item["quantity"]
    # 注意：这里不 commit，由调用方控制事务（保证扣库存和建订单原子）

def restore_stock(db: Session, order: Order) -> None:
    """取消订单时回滚库存"""
    for item in order.items:
        sku = db.get(SKU, item.sku_id)
        if sku:
            sku.stock += item.quantity
\`\`\`

> **避坑**：超卖是电商的经典事故。假设库存只剩 1 件，A 和 B 同时下单：
> - 没 FOR UPDATE：A 查到 stock=1，B 也查到 stock=1，A 扣成 0，B 也扣成 0——超卖了！
> - 有 FOR UPDATE：A 查时锁住行，B 查时等待，A 提交后 B 查到 stock=0，B 报"库存不足"。
>
> 代价：FOR UPDATE 会降低并发度。高并发场景用 Redis 预扣库存 + 异步落库。

**4. 业务层：下单服务（事务+状态机）**

\`\`\`python
# app/services/order_service.py
# 下单服务：把"扣库存 + 建订单"包成一个事务，要么全成功，要么全失败
import time
import random
from sqlalchemy.orm import Session
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import SKU
from app.services.stock_service import deduct_stock
from fastapi import HTTPException

def create_order(db: Session, user_id: int, items: list[dict]) -> Order:
    """
    下单。items = [{"sku_id": 1, "quantity": 2}, ...]
    事务边界在这里：扣库存 + 算总价 + 建订单 + 建订单项，任一步失败全部回滚
    """
    # 算总价（先查 SKU 拿单价）
    total = 0
    order_items = []
    for item in items:
        sku = db.get(SKU, item["sku_id"])
        if not sku:
            raise HTTPException(404, f"SKU {item['sku_id']} 不存在")
        # 算这一行的小计
        line_total = float(sku.price) * item["quantity"]
        total += line_total
        # 构造订单项（快照单价）
        order_items.append(OrderItem(
            sku_id=item["sku_id"],
            quantity=item["quantity"],
            unit_price=sku.price,  # 快照当前价格
        ))

    # 扣库存（在同一个事务里）
    deduct_stock(db, items)

    # 生成订单号：时间戳 + 随机数，避免重复
    order_no = f"{int(time.time())}{random.randint(1000, 9999)}"
    # 建订单
    order = Order(
        order_no=order_no,
        user_id=user_id,
        total_amount=total,
        status=OrderStatus.pending,  # 新订单默认待支付
        items=order_items,
    )
    db.add(order)
    db.commit()       # 提交事务：库存扣减 + 订单创建 一起生效
    db.refresh(order)
    return order

def pay_order(db: Session, order: Order) -> Order:
    """支付订单：状态从 pending → paid"""
    # 状态机校验：只有 pending 订单能支付
    if order.status != OrderStatus.pending:
        raise HTTPException(400, f"订单状态 {order.status} 不可支付")
    # 真实项目这里调支付网关（支付宝/微信）
    order.status = OrderStatus.paid
    db.commit()
    db.refresh(order)
    return order

def cancel_order(db: Session, order: Order) -> Order:
    """取消订单：回滚库存 + 改状态"""
    if order.status not in (OrderStatus.pending, OrderStatus.paid):
        raise HTTPException(400, "订单不可取消")
    # 回滚库存
    from app.services.stock_service import restore_stock
    restore_stock(db, order)
    order.status = OrderStatus.cancelled
    db.commit()
    db.refresh(order)
    return order
\`\`\`

> **怎么想的**：为什么下单逻辑放 service 层不放路由？因为路由只管"接请求、返响应"，业务逻辑（算价、扣库存、状态机）是核心，要能被路由、后台任务、定时任务复用。**路由薄、service 厚**是好架构的标志。

**5. 路由层：订单路由（薄薄一层）**

\`\`\`python
# app/api/v1/orders.py
# 路由层只做：参数校验 → 调 service → 返响应。不写业务逻辑
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.order import Order
from app.services import order_service
from app.schemas.order import OrderCreate, OrderOut

router = APIRouter(prefix="/orders", tags=["订单"])

# 下单
@router.post("", response_model=OrderOut, status_code=201)
def create_order(
    body: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 路由只调 service，业务逻辑全在 service 里
    order = order_service.create_order(db, current_user.id, body.items)
    return order

# 支付订单
@router.post("/{order_id}/pay", response_model=OrderOut)
def pay_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(404, "订单不存在")
    # 权限：只能支付自己的订单
    if order.user_id != current_user.id:
        raise HTTPException(403, "无权操作他人订单")
    return order_service.pay_order(db, order)

# 取消订单
@router.post("/{order_id}/cancel", response_model=OrderOut)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(404, "订单不存在")
    if order.user_id != current_user.id:
        raise HTTPException(403, "无权操作他人订单")
    return order_service.cancel_order(db, order)

# 查我的订单
@router.get("", response_model=list[OrderOut])
def list_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Order).filter(Order.user_id == current_user.id).all()
\`\`\`

\`\`\`python
# app/schemas/order.py
from pydantic import BaseModel
from app.models.order import OrderStatus

class OrderItemCreate(BaseModel):
    sku_id: int
    quantity: int  # 至少买 1 个

class OrderCreate(BaseModel):
    items: list[OrderItemCreate]

class OrderItemOut(BaseModel):
    id: int
    sku_id: int
    quantity: int
    unit_price: float
    model_config = {"from_attributes": True}

class OrderOut(BaseModel):
    id: int
    order_no: str
    total_amount: float
    status: OrderStatus
    items: list[OrderItemOut]
    model_config = {"from_attributes": True}
\`\`\`

> **完整流程**：注册登录 → 浏览商品 → 加购物车 → 下单（扣库存+建订单）→ 支付（改状态）→ 发货 → 完成。每一步都是独立接口，状态机驱动。**取消订单必须回滚库存**，否则库存对不上。

### 61.11 项目部署上线完整流程（Demo 9）

**怎么想的**：代码写完只是 30% 的工作，70% 在部署运维。部署流程要可重复、可回滚、可监控。

> 🏠 **生活类比**：部署上线像新店开张——代码是装修好的店面，Gunicorn 是店长（管几个店员），Nginx 是保安（指挥客人走哪个门），Docker 是集装箱（把整个店面打包），CI/CD 是自动开门系统（一按按钮就开张）。

**1. 生产配置**

\`\`\`python
# app/core/config.py（生产版）
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # 生产用 PostgreSQL，不用 SQLite
    database_url: str = "postgresql://user:pass@localhost:5432/blog"
    # 密钥从环境变量读，不给默认值（强制配置）
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    # CORS 允许的前端域名
    cors_origins: list[str] = ["https://blog.example.com"]
    # 调试模式，生产必须 False
    debug: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
\`\`\`

**2. Gunicorn 配置文件**

\`\`\`python
# gunicorn.conf.py
# Gunicorn 配置：用 Uvicorn worker 跑 ASGI 应用
import multiprocessing

# 绑定地址
bind = "0.0.0.0:8000"
# worker 数量：CPU 核数 * 2 + 1 是经验值
workers = multiprocessing.cpu_count() * 2 + 1
# worker 类：用 UvicornWorker 支持 ASGI
worker_class = "uvicorn.workers.UvicornWorker"
# 超时：处理慢请求的容忍时间
timeout = 120
# 优雅重启超时
graceful_timeout = 30
# 预加载：worker 启动前先加载代码，省内存+启动快
preload_app = True
# 日志
accesslog = "/var/log/gunicorn/access.log"
errorlog = "/var/log/gunicorn/error.log"
loglevel = "warning"
\`\`\`

**3. Dockerfile**

\`\`\`dockerfile
# Dockerfile —— 多阶段构建，镜像更小
# 第一阶段：安装依赖
FROM python:3.11-slim AS builder
WORKDIR /app
# 先拷 requirements.txt，利用 Docker 缓存层
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 第二阶段：运行
FROM python:3.11-slim
WORKDIR /app
# 从 builder 拷已装的依赖
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
# 拷代码
COPY . .
# 非 root 用户跑，安全
RUN useradd -m appuser
USER appuser
# 启动命令
CMD ["gunicorn", "app.main:app", "-c", "gunicorn.conf.py"]
\`\`\`

**4. docker-compose.yml（含 Nginx + Postgres）**

\`\`\`yaml
version: "3.9"
services:
  # PostgreSQL 数据库
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: blog
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_DB: blog
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U blog"]
      interval: 10s

  # Redis（缓存+任务队列）
  redis:
    image: redis:7-alpine

  # FastAPI 应用
  app:
    build: .
    environment:
      - DATABASE_URL=postgresql://blog:\${DB_PASSWORD}@db:5432/blog
      - SECRET_KEY=\${SECRET_KEY}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    expose: ["8000"]  # 只暴露给内网，Nginx 转发

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on: [app]

volumes:
  pgdata:
\`\`\`

**5. Nginx 配置**

\`\`\`nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        # FastAPI 应用
        server app:8000;
    }

    server {
        listen 80;
        server_name api.example.com;
        # HTTP 跳 HTTPS
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl;
        server_name api.example.com;

        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;

        # 反向代理到 FastAPI
        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # 静态文件直接 Nginx 处理，不走应用
        location /static/ {
            alias /app/static/;
            expires 30d;
        }
    }
}
\`\`\`

**6. 部署脚本**

\`\`\`bash
#!/bin/bash
# deploy.sh —— 一键部署
set -e  # 任一步失败就停

echo "==> 拉最新代码"
git pull origin main

echo "==> 构建镜像"
docker-compose build

echo "==> 跑数据库迁移"
docker-compose run --rm app alembic upgrade head

echo "==> 重启服务"
docker-compose up -d

echo "==> 健康检查"
sleep 5
curl -f http://localhost/ || exit 1

echo "==> 部署完成"
\`\`\`

> **回滚怎么做**：部署出问题要能快速回滚。方案：1) 保留上一个 Docker 镜像 tag，出问题切回去；2) Alembic 迁移要写 downgrade，能回滚表结构；3) 数据库备份每天自动跑。

### 61.12 常见错误与避坑指南

1. **循环导入**：models 之间互相 import 会报错。解决：用字符串引用（\`relationship("Post")\`）或在 \`TYPE_CHECKING\` 下 import。
2. **N+1 查询**：列表接口返文章时顺带返作者名，默认会每篇文章查一次作者。解决：用 \`joinedload\` 或 \`selectinload\` 预加载。
3. **事务没回滚**：crud 里抛异常但没 rollback，session 会卡住。解决：用 FastAPI 的依赖 + try/finally 关 session，或用中间件统一处理。
4. **权限漏洞**：忘了校验 author_id，导致 A 能改 B 的文章。**每个写操作都要校验归属**。
5. **JWT 密钥泄露**：把密钥写进代码仓库。解决：放 .env，.env 进 .gitignore。
6. **CORS 配太宽**：\`allow_origins=["*"]\` 加 \`allow_credentials=True\` 会导致 cookie 不生效。生产环境必须指定具体域名。
7. **密码用 MD5**：MD5 能被彩虹表秒破。必须用 bcrypt/argon2。
8. **分页没上限**：\`?size=10000\` 直接把库查爆。用 \`Field(le=100)\` 限制。
9. **金额用 Float**：浮点数精度丢失导致对账错误。必须用 \`Numeric(10, 2)\` 或整数分。
10. **超卖**：并发下单没加行锁，库存扣成负数。用 \`SELECT ... FOR UPDATE\`。
11. **订单状态乱跳**：没状态机校验，pending 直接变 completed。每次改状态前 if 校验。
12. **生产开 echo=True**：SQL 日志打爆磁盘。生产必须 False。
13. **配置硬编码**：数据库密码、密钥写代码里。必须走环境变量。
14. **没健康检查**：服务挂了没人知道。加 \`/health\` 接口 + 监控告警。

### 61.13 动手实验

**实验 1（基础）：完成博客系统的标签模块**
- 创建 Tag 模型、TagSchema、tag_crud
- 实现标签 CRUD 接口（GET /tags、POST /tags）
- 实现"给文章打标签"接口（POST /posts/{id}/tags）
- 写测试：创建标签、按标签筛文章

**实验 2（进阶）：给电商系统加购物车**
- 设计 Cart 模型（user_id + sku_id + quantity）
- 实现"加购物车""改数量""清空购物车"接口
- 实现"从购物车下单"接口（把购物车转成订单）
- 思考：购物车数据存数据库还是 Redis？各有什么优缺点？

**实验 3（挑战）：实现支付回调**
- 模拟支付网关：POST /payments/callback 接收 {order_no, status, paid_at}
- 回调里校验签名（用 HMAC）
- 更新订单状态：pending → paid
- 处理重复回调（幂等：同一个 order_no 只处理一次）
- 思考：回调失败怎么重试？怎么保证最终一致？

**实验 4（部署）：把博客系统部署到云服务器**
- 买一台云服务器（或用本地虚拟机）
- 装 Docker + Docker Compose
- 用本章的 Dockerfile + docker-compose.yml 部署
- 配 Nginx + HTTPS（用 Let's Encrypt 免费证书）
- 写一个 GitHub Actions 自动部署脚本

> **完成标志**：实验 1 能跑通标签筛选；实验 2 能从购物车下单；实验 3 能处理重复回调；实验 4 能从浏览器访问 https://你的域名/docs 看到 Swagger。

### 61.14 小结

这一章我们搭了一个完整的博客 API 骨架：分层架构（api/service/crud/models/schemas）、JWT 认证、权限控制、分页搜索、两级评论、测试。又用电商系统展示了三层架构（路由/业务/数据）的完整代码——库存扣减、订单状态机、事务边界是电商的核心难点。最后给了部署上线的完整流程：Gunicorn + Docker + Nginx + CI/CD。这套结构可以直接套到任何 CRUD 项目上。下一章我们给这个博客加 GraphQL 接口，看看另一种 API 风格。`,
  },

  // =============================================================
  // 第六十二章：实战:GraphQL 集成
  // =============================================================
  {
    id: "fa-project-graphql",
    group: "实战项目",
    icon: "🔮",
    title: "实战:GraphQL 集成",
    content: `## 第六十二章　实战:GraphQL 集成

上一章我们用 REST 做了博客 API。这一章换一种风格——GraphQL。GraphQL 不是 REST 的替代品，而是另一种"怎么设计 API"的思路。学完你会发现：有些场景 GraphQL 真比 REST 顺手，有些场景 REST 更合适。**知道两边的好，才能选对工具。**

> 🏠 **生活类比：自助餐 vs 套餐**。REST 像"套餐"——你点一个套餐，店家给你配好几个菜，你想吃的有，不想吃的也塞给你（Over-fetching）；你想加个菜得另点（Under-fetching，多次请求）。GraphQL 像"自助餐"——你端个盘子，想拿什么拿什么，想拿多少拿多少，一个盘子装完（一个请求搞定）。但自助餐的代价是：店家备菜更麻烦（resolver 要写）、容易浪费（深度查询拖垮服务端）。

### 62.1 GraphQL vs REST：到底差在哪

**REST 的痛点**：

1. **过度获取（Over-fetching）**：前端只要文章标题，但 \`GET /posts/{id}\` 返回了标题+正文+作者+评论……正文可能几万字，白白浪费带宽；
2. **获取不足（Under-fetching）**：前端要"文章+作者信息+作者的其他文章"，REST 得发 3 个请求：\`/posts/1\` → \`/users/2\` → \`/users/2/posts\`，来回 3 趟；
3. **接口维护成本**：每加一个前端需求就要后端加一个接口，接口越堆越多。

**GraphQL 怎么解决**：

- **客户端要什么，服务端给什么**：前端写查询语句，精确指定要哪些字段。要标题就只返标题，要作者就一起返作者；
- **一个端点**：所有请求都发到 \`/graphql\`，不用维护一堆 URL；
- **强类型 Schema**：GraphQL 自带类型系统，前端能自动生成 TypeScript 类型，前后端契约清晰。

**举例对比**：

REST 风格：
\`\`\`
GET /posts/1
→ { "id": 1, "title": "...", "content": "很长很长的正文...", "author_id": 2 }
// 前端只要 title，但 content 也被返回了
\`\`\`

GraphQL 风格：
\`\`\`graphql
query {
  post(id: 1) {
    title          # 只要标题，不返正文
    author {
      nickname     # 顺带拿作者昵称，一个请求搞定
    }
  }
}
→ { "data": { "post": { "title": "...", "author": { "nickname": "张三" } } } }
\`\`\`

> **怎么选**：移动端、复杂前端页面、多端共用后端 → GraphQL 优势大。简单的内部工具、文件上传为主、缓存要求高 → REST 更省心。两者也能共存，主 API 用 REST，复杂查询页用 GraphQL。

### 62.2 GraphQL 基本概念

三个核心操作：

| 操作 | 作用 | 类比 REST |
| --- | --- | --- |
| Query | 查数据 | GET |
| Mutation | 改数据 | POST/PUT/DELETE |
| Subscription | 实时推送（WebSocket） | WebSocket |

**类型系统**：GraphQL 用 Schema 定义类型。每个类型有字段，字段有类型。

\`\`\`graphql
type Post {
  id: ID!          # ! 表示非空
  title: String!
  content: String!
  author: User!    # 可以嵌套对象
  comments: [Comment!]!  # 列表
}
\`\`\`

**解析器（Resolver）**：每个字段对应一个函数，告诉 GraphQL 怎么拿这个字段的值。这是 GraphQL 和数据库之间的桥梁。

> **怎么想的**：GraphQL 本身不碰数据库，它只是个"查询语言+执行引擎"。你要写 resolver 告诉它"post.title 怎么拿""post.author 怎么拿"。这种解耦让它能接任何数据源。

### 62.3 Strawberry 库基础（Demo 1：第一个 GraphQL）

Python 生态有三个 GraphQL 库：Graphene（老牌，但语法啰嗦）、Strawberry（新，基于 dataclass，类型友好）、Ariadne（schema-first）。**推荐 Strawberry**，因为它的类型写法和 Pydantic 很像，FastAPI 集成也最好。

\`\`\`bash
# 安装 Strawberry 的 FastAPI 集成
pip install strawberry-graphql[fastapi]
\`\`\`

**最小例子**：

\`\`\`python
# hello_graphql.py
# 导入 strawberry 库（GraphQL 库）
import strawberry
# 从 strawberry.fastapi 导入 GraphQLRouter，用于把 GraphQL 挂到 FastAPI
from strawberry.fastapi import GraphQLRouter

# 定义类型：用 @strawberry.type 装饰的类
# @strawberry.type 类似 Pydantic 的 BaseModel，但是用于 GraphQL 输出
@strawberry.type
class Book:
    # 字段，带类型注解（和 Pydantic 写法一样）
    title: str
    author: str
    year: int

# 模拟数据（真实项目从数据库查）
books = [
    Book(title="三体", author="刘慈欣", year=2008),
    Book(title="活着", author="余华", year=1993),
]

# 定义 Query：所有"查"的入口
# @strawberry.type 装饰的 Query 类是 GraphQL 查询的根
@strawberry.type
class Query:
    # 一个字段就是一个查询入口。return 类型告诉 GraphQL 返回啥
    # @strawberry.field 装饰器把方法变成 GraphQL 字段
    @strawberry.field
    def books(self) -> list[Book]:
        return books

    # 带参数的查询
    # 参数 title 会出现在 GraphQL 查询里：book(title: "三体") { ... }
    @strawberry.field
    def book(self, title: str) -> Book | None:
        for b in books:
            if b.title == title:
                return b
        return None

# 创建 schema
# query=Query 告诉 Strawberry 查询入口是 Query 类
schema = strawberry.Schema(query=Query)

# FastAPI 集成
from fastapi import FastAPI
app = FastAPI()
# GraphQLRouter 把 schema 挂到 /graphql
# 访问 /graphql 会出现 GraphQL Playground 调试界面
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")
\`\`\`

启动后访问 \`http://localhost:8000/graphql\`，会看到 GraphQL Playground（交互式查询界面）。试一下：

\`\`\`graphql
# 查所有书，只要 title 和 author
query {
  books {
    title
    author
  }
}

# 按标题查
query {
  book(title: "三体") {
    title
    year
  }
}
\`\`\`

> **避坑**：\`@strawberry.type\` 装饰的是"输出类型"（返给客户端的），\`@strawberry.input\` 装饰的是"输入类型"（客户端传进来的）。搞混了会报 "X is not a valid input type"。

### 62.4 定义 Type、Query、Mutation（Demo 2）

把上一章的博客模型用 GraphQL 表达。

\`\`\`python
# app/gql/types.py
import strawberry
from typing import Optional
import datetime

# 用户类型
@strawberry.type
class UserType:
    id: strawberry.ID
    email: str
    nickname: str
    is_admin: bool

# 文章类型
@strawberry.type
class PostType:
    id: strawberry.ID
    title: str
    content: str
    author_id: int
    created_at: datetime.datetime
    # 关联字段：作者。resolver 在下面定义
    author: Optional["UserType"] = None
    # 关联字段：评论列表
    comments: list["CommentType"] = strawberry.field(default_factory=list)

    # 用 resolver 指定怎么拿 author
    # name 参数对应 GraphQL 字段名
    @strawberry.field
    def author(self, info) -> Optional["UserType"]:
        # info.context 能拿到 request、db 等
        db = info.context["db"]
        from app.models.user import User
        user = db.get(User, self.author_id)
        if user:
            return UserType(id=user.id, email=user.email, nickname=user.nickname, is_admin=user.is_admin)
        return None

# 评论类型
@strawberry.type
class CommentType:
    id: strawberry.ID
    content: str
    author_id: int
    post_id: int
    created_at: datetime.datetime

# 输入类型：发文章用的
@strawberry.input
class PostInput:
    title: str
    content: str

# 输入类型：发评论用的
@strawberry.input
class CommentInput:
    content: str
    parent_id: Optional[int] = None
\`\`\`

> **怎么想的**：\`author\` 字段为什么用 resolver 而不是直接赋值？因为 PostType 是个"瘦"对象，它只有自己的字段。作者信息要从数据库查，所以写成 resolver，让 GraphQL 在客户端"真的要 author"时才去查——这就是按需加载。

**Query 和 Mutation**：

\`\`\`python
# app/gql/schema.py
# 导入 strawberry（GraphQL 库）
import strawberry
# 从 typing 导入 Optional（Python 3.9 以下用 Optional[X]，3.10+ 可用 X | None）
from typing import Optional
# 从 sqlalchemy.orm 导入 Session，用于类型注解
from sqlalchemy.orm import Session

# 导入 GraphQL 类型定义
from app.gql.types import UserType, PostType, CommentType, PostInput, CommentInput
# 导入 ORM 模型
from app.models.post import Post
from app.models.comment import Comment
from app.models.user import User

# @strawberry.type 装饰的 Query 类是 GraphQL 查询的根
# GraphQL 规范要求一个 schema 必须有一个 Query 类型，可选有一个 Mutation 类型
@strawberry.type
class Query:
    # 查所有文章，带分页
    # @strawberry.field 把方法变成 GraphQL 字段
    # info 参数是 Strawberry 注入的上下文对象，含 context、root 等
    @strawberry.field
    def posts(self, info, page: int = 1, size: int = 20) -> list[PostType]:
        # info.context["db"] 从上下文拿数据库会话
        # context 是在 GraphQLRouter 的 context_getter 里构造的
        db = info.context["db"]
        # 分页公式：跳过 (page-1)*size 条
        skip = (page - 1) * size
        # order_by 排序，offset 跳过，limit 限制数量
        posts = db.query(Post).order_by(Post.created_at.desc()).offset(skip).limit(size).all()
        # 把 ORM 对象转成 GraphQL 类型对象
        # 必须手动转，因为 PostType 不是 ORM 模型
        return [PostType(
            id=p.id, title=p.title, content=p.content,
            author_id=p.author_id, created_at=p.created_at
        ) for p in posts]

    # 查单篇文章
    @strawberry.field
    def post(self, info, id: int) -> Optional[PostType]:
        db = info.context["db"]
        p = db.get(Post, id)
        if not p:
            return None
        return PostType(id=p.id, title=p.title, content=p.content, author_id=p.author_id, created_at=p.created_at)

    # 搜文章
    @strawberry.field
    def search_posts(self, info, keyword: str) -> list[PostType]:
        db = info.context["db"]
        # 延迟导入 or_，避免模块加载时就把 sqlalchemy 的 or_ 拉进来
        from sqlalchemy import or_
        # ilike 是不区分大小写的 LIKE
        # %{keyword}% 是 SQL 通配符，% 匹配任意字符
        posts = db.query(Post).filter(
            or_(Post.title.ilike(f"%{keyword}%"), Post.content.ilike(f"%{keyword}%"))
        ).all()
        return [PostType(id=p.id, title=p.title, content=p.content, author_id=p.author_id, created_at=p.created_at) for p in posts]

# Mutation 类型：所有"写"操作的入口
# GraphQL 规范：Query 只读，Mutation 写
@strawberry.type
class Mutation:
    # 发文章（需要登录）
    # @strawberry.mutation 把方法变成 GraphQL mutation 字段
    @strawberry.mutation
    def create_post(self, info, input: PostInput) -> PostType:
        # 从 context 拿当前用户
        # context["user"] 在 context_getter 里设置，未登录时为 None
        user = info.context.get("user")
        if not user:
            raise Exception("未登录")
        db = info.context["db"]
        post = Post(title=input.title, content=input.content, author_id=user.id)
        db.add(post)
        db.commit()
        db.refresh(post)
        return PostType(id=post.id, title=post.title, content=post.content, author_id=post.author_id, created_at=post.created_at)

    # 发评论
    @strawberry.mutation
    def create_comment(self, info, post_id: int, input: CommentInput) -> CommentType:
        user = info.context.get("user")
        if not user:
            raise Exception("未登录")
        db = info.context["db"]
        comment = Comment(
            content=input.content,
            author_id=user.id,
            post_id=post_id,
            parent_id=input.parent_id,
        )
        db.add(comment)
        db.commit()
        db.refresh(comment)
        return CommentType(id=comment.id, content=comment.content, author_id=comment.author_id, post_id=comment.post_id, created_at=comment.created_at)

# 组装 schema
# query=Query 告诉 Strawberry 查询入口
# mutation=Mutation 告诉 Strawberry 写入入口
schema = strawberry.Schema(query=Query, mutation=Mutation)
\`\`\`

### 62.5 GraphQL 与 FastAPI 集成 + 认证（Demo 3）

**怎么集成**：用 GraphQLRouter，但要自定义 context，把 db 和当前用户塞进去。

\`\`\`python
# app/gql/router.py
# 从 strawberry.fastapi 导入 GraphQLRouter，用于把 GraphQL 挂到 FastAPI
from strawberry.fastapi import GraphQLRouter
# 从 fastapi 导入 Depends（依赖注入）、Request（请求对象）
from fastapi import Depends, Request
# 从 sqlalchemy.orm 导入 Session，用于类型注解
from sqlalchemy.orm import Session
# 从 deps 导入 get_db 和 get_current_user_optional
# get_current_user_optional 是可选认证：未登录返回 None 而不是抛 401
from app.core.deps import get_db, get_current_user_optional
# 导入 User ORM 模型
from app.models.user import User
# 导入组装好的 schema
from app.gql.schema import schema

# 自定义 context_getter：每个请求执行一次，把东西塞进 context
# context 是 GraphQL resolver 里 info.context 能拿到的字典
# 这是 FastAPI 依赖注入和 GraphQL 世界的桥梁
async def get_context(
    request: Request,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    # 返回的字典会作为 info.context 传给所有 resolver
    # 把 db 和 user 放进去，resolver 就能拿到数据库会话和当前用户
    return {
        "request": request,  # 原始请求对象，需要时可读 headers 等
        "db": db,            # 数据库会话
        "user": user,  # 可能为 None（未登录）
    }

# 创建 router。graphiql=True 开启浏览器调试界面
# context_getter=get_context 告诉 GraphQLRouter 用我们的函数构造 context
# graphiql=True 会在 /graphql 路径提供交互式调试界面（GraphiQL）
graphql_app = GraphQLRouter(schema, context_getter=get_context, graphiql=True)
\`\`\`

\`\`\`python
# app/core/deps.py（追加：可选认证）
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status

# 不强制登录的版本：没 token 也不报错，返回 None
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def get_current_user_optional(
    token: str | None = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db),
) -> User | None:
    if not token:
        return None
    payload = decode_token(token)
    if payload is None:
        return None
    user_id = payload.get("sub")
    if user_id is None:
        return None
    return db.get(User, int(user_id))
\`\`\`

\`\`\`python
# app/main.py（追加）
from app.gql.router import graphql_app
app.include_router(graphql_app, prefix="/graphql")
\`\`\`

> **认证怎么想**：GraphQL 通常用一个端点，没法像 REST 那样"这个接口要登录，那个不要"。做法是：所有请求都尝试解析 token，解析出来就放进 context，resolver 里自己判断"这个操作要不要登录"。

**带 token 调用**：

\`\`\`graphql
# 在 Playground 的 HTTP Headers 里加：
# { "Authorization": "Bearer <your-token>" }

mutation {
  createPost(input: { title: "GraphQL 真香", content: "内容" }) {
    id
    title
    author {
      nickname
    }
  }
}
\`\`\`

### 62.6 DataLoader 解决 N+1（Demo 4）

**N+1 问题**：GraphQL 最经典的坑。查询 20 篇文章 + 每篇的作者：

\`\`\`graphql
query {
  posts {
    title
    author { nickname }  # 每篇文章触发一次 author resolver
  }
}
\`\`\`

如果 resolver 是 \`db.get(User, self.author_id)\`，那就是 1（查 posts）+ 20（每个 post 查 author）= 21 次查询。文章一多直接慢死。

**DataLoader 怎么解决**：把"查单个 author"的请求攒一批，合并成一次"查 20 个 author"的查询。

\`\`\`python
# app/gql/dataloaders.py
from collections import defaultdict
from strawberry.dataloader import DataLoader

# 批量查用户的函数
async def batch_load_users(keys: list[int]) -> list:
    # keys 是 [1, 2, 3, 4] 这样一批 user_id
    # 这里用同步 DB，实际项目用 async 或者跑线程池
    from app.core.database import SessionLocal
    from app.models.user import User
    db = SessionLocal()
    try:
        # 一次查回所有用户
        users = db.query(User).filter(User.id.in_(keys)).all()
        # 按 id 索引
        user_map = {u.id: u for u in users}
        # 必须按 keys 顺序返回，没找到的给 None
        return [user_map.get(k) for k in keys]
    finally:
        db.close()

# 创建 DataLoader 实例
user_loader = DataLoader(load_fn=batch_load_users)
\`\`\`

**改 resolver 用 DataLoader**：

\`\`\`python
# app/gql/types.py（修改 author resolver）
@strawberry.field
async def author(self, info) -> Optional["UserType"]:
    # 从 context 拿 user_loader
    loader = info.context["user_loader"]
    # 调 loader.load，它会自动批量
    user = await loader.load(self.author_id)
    if user:
        return UserType(id=user.id, email=user.email, nickname=user.nickname, is_admin=user.is_admin)
    return None
\`\`\`

\`\`\`python
# context 里加 user_loader
async def get_context(...):
    return {
        "request": request,
        "db": db,
        "user": user,
        "user_loader": DataLoader(load_fn=batch_load_users),
    }
\`\`\`

> **怎么想的**：DataLoader 的核心是"延迟+批量"。一个请求里所有 \`loader.load(id)\` 调用会被攒到事件循环下一个 tick，然后一次性执行 \`batch_load_users([1,2,3,...])\`。20 个 author 从 20 次查询变成 1 次 \`WHERE id IN (1,2,3,...)\`。

### 62.7 完整博客 GraphQL API（Demo 5：带权限的增删改）

把删除文章、删除评论也加上，演示权限在 GraphQL 里怎么写：

\`\`\`python
# app/gql/schema.py（Mutation 追加）
@strawberry.type
class Mutation:
    # ... 前面的 create_post、create_comment ...

    # 删除文章（权限：作者本人 或 管理员）
    @strawberry.mutation
    def delete_post(self, info, id: int) -> bool:
        user = info.context.get("user")
        if not user:
            raise Exception("未登录")
        db = info.context["db"]
        post = db.get(Post, id)
        if not post:
            raise Exception("文章不存在")
        # 权限校验
        if post.author_id != user.id and not user.is_admin:
            raise Exception("只能删除自己的文章")
        db.delete(post)
        db.commit()
        return True

    # 修改文章（权限：作者本人）
    @strawberry.mutation
    def update_post(self, info, id: int, input: PostInput) -> PostType:
        user = info.context.get("user")
        if not user:
            raise Exception("未登录")
        db = info.context["db"]
        post = db.get(Post, id)
        if not post:
            raise Exception("文章不存在")
        if post.author_id != user.id:
            raise Exception("只能修改自己的文章")
        post.title = input.title
        post.content = input.content
        db.commit()
        db.refresh(post)
        return PostType(id=post.id, title=post.title, content=post.content, author_id=post.author_id, created_at=post.created_at)
\`\`\`

**测试查询**：

\`\`\`graphql
# 查文章列表（只要标题和作者昵称，不要正文——省带宽）
query {
  posts(page: 1, size: 5) {
    title
    author {
      nickname
    }
  }
}

# 搜文章
query {
  searchPosts(keyword: "GraphQL") {
    title
    createdAt
  }
}

# 发文章
mutation {
  createPost(input: {title: "测试", content: "内容"}) {
    id
    title
  }
}

# 删文章
mutation {
  deletePost(id: 1)
}
\`\`\`

### 62.8 生活类比：GraphQL 像图书馆管理员

> 🏠 **生活类比**：REST 像去图书馆借书——你要"红楼梦"，图书管理员给你整本书（你只想要其中一章也给你整本）。GraphQL 像有个私人图书管理员——你递一张清单"要红楼梦第 5 回+作者简介+同作者其他书名"，管理员按清单精确整理好给你。**DataLoader** 像管理员一次拿 20 本书而不是跑 20 趟。**Resolver** 是管理员脑子里的"去哪个书架拿哪本书"的知识。**Schema** 是图书馆的目录索引——告诉你这里有什么书能借。

| REST 概念 | GraphQL 对应 | 图书馆类比 |
| --- | --- | --- |
| URL 路径 | Query 字段 | 借书单上的一项 |
| HTTP 方法 | Query/Mutation | 借（Query）vs 还/捐赠（Mutation） |
| 响应体 | 字段选择 | 清单上勾选要哪些 |
| 接口文档 | Schema | 图书馆目录卡 |
| N+1 查询 | DataLoader | 一次取一批书 |

### 62.9 电商系统 GraphQL API（Demo 6：商品+订单查询）

**怎么想的**：电商前端最痛苦的是"商品列表页"——要商品名、价格、缩略图、库存状态、评分、促销标签……REST 要么过度获取（返一堆用不上的字段），要么发好几个请求拼。GraphQL 一个查询全搞定。

\`\`\`python
# app/gql/ecom_types.py
# 电商 GraphQL 类型定义
import strawberry
from typing import Optional
import datetime

# 商品类型
@strawberry.type
class ProductType:
    id: strawberry.ID
    name: str
    description: str
    is_active: bool
    # 关联 SKU 列表
    @strawberry.field
    def skus(self, info) -> list["SKUType"]:
        db = info.context["db"]
        from app.models.product import Product, SKU
        skus = db.query(SKU).filter(SKU.product_id == self.id).all()
        return [SKUType(id=s.id, spec=s.spec, price=float(s.price), stock=s.stock) for s in skus]
    # 最低价（聚合字段，GraphQL 能算"虚拟字段"）
    @strawberry.field
    def min_price(self, info) -> float:
        db = info.context["db"]
        from app.models.product import SKU
        from sqlalchemy import func
        # 查这个商品下最便宜的 SKU
        result = db.query(func.min(SKU.price)).filter(SKU.product_id == self.id).scalar()
        return float(result) if result else 0.0

# SKU 类型
@strawberry.type
class SKUType:
    id: strawberry.ID
    spec: str
    price: float
    stock: int

# 订单类型
@strawberry.type
class OrderType:
    id: strawberry.ID
    order_no: str
    total_amount: float
    status: str
    created_at: datetime.datetime
    # 订单项
    @strawberry.field
    def items(self, info) -> list["OrderItemType"]:
        db = info.context["db"]
        from app.models.order import OrderItem
        items = db.query(OrderItem).filter(OrderItem.order_id == self.id).all()
        return [OrderItemType(
            id=i.id, sku_id=i.sku_id, quantity=i.quantity, unit_price=float(i.unit_price)
        ) for i in items]

@strawberry.type
class OrderItemType:
    id: strawberry.ID
    sku_id: int
    quantity: int
    unit_price: float

# 输入类型
@strawberry.input
class CartItemInput:
    sku_id: int
    quantity: int
\`\`\`

\`\`\`python
# app/gql/ecom_schema.py
# 电商 Query 和 Mutation
import strawberry
from typing import Optional
from app.gql.ecom_types import ProductType, SKUType, OrderType, CartItemInput

@strawberry.type
class EcomQuery:
    # 商品列表（带筛选）
    @strawberry.field
    def products(self, info, keyword: Optional[str] = None, min_price: Optional[float] = None) -> list[ProductType]:
        db = info.context["db"]
        from app.models.product import Product
        q = db.query(Product).filter(Product.is_active == True)
        if keyword:
            q = q.filter(Product.name.ilike(f"%{keyword}%"))
        products = q.all()
        return [ProductType(id=p.id, name=p.name, description=p.description, is_active=p.is_active) for p in products]

    # 商品详情
    @strawberry.field
    def product(self, info, id: int) -> Optional[ProductType]:
        db = info.context["db"]
        from app.models.product import Product
        p = db.get(Product, id)
        if not p:
            return None
        return ProductType(id=p.id, name=p.name, description=p.description, is_active=p.is_active)

    # 我的订单
    @strawberry.field
    def my_orders(self, info) -> list[OrderType]:
        user = info.context.get("user")
        if not user:
            raise Exception("未登录")
        db = info.context["db"]
        from app.models.order import Order
        orders = db.query(Order).filter(Order.user_id == user.id).all()
        return [OrderType(
            id=o.id, order_no=o.order_no,
            total_amount=float(o.total_amount),
            status=o.status.value, created_at=o.created_at
        ) for o in orders]

@strawberry.type
class EcomMutation:
    # 下单
    @strawberry.mutation
    def create_order(self, info, items: list[CartItemInput]) -> OrderType:
        user = info.context.get("user")
        if not user:
            raise Exception("未登录")
        db = info.context["db"]
        from app.services.order_service import create_order
        item_dicts = [{"sku_id": i.sku_id, "quantity": i.quantity} for i in items]
        order = create_order(db, user.id, item_dicts)
        return OrderType(
            id=order.id, order_no=order.order_no,
            total_amount=float(order.total_amount),
            status=order.status.value, created_at=order.created_at
        )

# 组装电商 schema
ecom_schema = strawberry.Schema(query=EcomQuery, mutation=EcomMutation)
\`\`\`

**前端怎么用**：

\`\`\`graphql
# 商品列表页：只要名字和最低价，一个请求搞定
query {
  products(keyword: "手机") {
    name
    minPrice
    skus {
      spec
      price
      stock
    }
  }
}

# 订单详情页：订单+订单项+SKU 信息
query {
  myOrders {
    orderNo
    status
    totalAmount
    items {
      quantity
      unitPrice
    }
  }
}

# 下单
mutation {
  createOrder(items: [{skuId: 1, quantity: 2}]) {
    orderNo
    totalAmount
    status
  }
}
\`\`\`

> **对比 REST**：同样这个商品列表页，REST 要么 \`GET /products?keyword=手机\` 返回一堆字段（含冗长的描述），要么前端再发 \`GET /products/{id}/skus\` 拿规格——20 个商品 = 21 个请求。GraphQL 一个请求全搞定。

### 62.10 GraphQL 部署上线（Demo 7）

GraphQL 部署和 REST 几乎一样，但有几个特殊点：

\`\`\`python
# app/gql/router.py（生产版）
from strawberry.fastapi import GraphQLRouter
from strawberry.schema.config import StrawberryConfig

# 生产环境关掉 GraphiQL 调试界面
graphql_app = GraphQLRouter(
    schema,
    context_getter=get_context,
    graphiql=False,  # 生产关调试界面，防止泄露 schema
)

# 在 schema 里加深度限制（防止恶意深查询）
# 需要安装：pip install strawberry-graphql[extensions]
from strawberry.extensions import QueryDepthLimiter

schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    extensions=[
        # 限制查询深度不超过 10 层，防止 {posts{author{posts{author{...}}}}} 拖垮服务
        QueryDepthLimiter(max_depth=10),
    ],
)
\`\`\`

**生产环境 Nginx 配置（GraphQL 单端点）**：

\`\`\`nginx
# GraphQL 只有一个端点 /graphql，Nginx 配置更简单
location /graphql {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    # GraphQL 查询可能比较大，放宽 body 大小限制
    client_max_body_size 1m;
}

# REST 接口照常
location /api/ {
    proxy_pass http://backend;
}
\`\`\`

> **怎么想的**：GraphQL 生产部署的特别之处：1) 关调试界面（防泄露）；2) 限查询深度（防 DoS）；3) 限查询复杂度（防一次查太多数据）；4) 加持久化查询（前端只发 query hash，服务端预存 query，防注入+省带宽）。

### 62.11 常见错误与避坑指南

1. **N+1 查询**：这是 GraphQL 最容易踩的坑。文章列表+作者+评论，没 DataLoader 能查几百次。**所有关联字段都要上 DataLoader**。
2. **同步 resolver 阻塞事件循环**：resolver 里直接用同步 SQLAlchemy，会阻塞 asyncio。解决：用 \`sqlalchemy[asyncio]\` 或用 \`run_in_threadpool\` 包一层。
3. **权限校验写在 schema 里**：每个 mutation 都要 if not user: raise。建议写个装饰器统一处理。
4. **错误信息泄露**：raise Exception("文章不存在") 会把堆栈返给客户端。生产环境要包装错误，只返友好信息。
5. **Mutation 返回类型混乱**：有人 mutation 返 Boolean，有人返对象。约定：增改返对象，删返 Boolean，保持一致。
6. **Subscription 滥用**：Subscription 走 WebSocket，连接多了服务端扛不住。只用于"真正实时"的场景（聊天、通知），别拿来替代轮询查列表。
7. **没做查询深度限制**：恶意客户端能发嵌套极深的查询 \`{ posts { author { posts { author { ... } } } } }\` 拖垮服务端。用 \`QueryDepthLimiter\` 防护。
8. **input 和 type 混用**：\`@strawberry.type\` 不能当 input 用，反之亦然。要分清。
9. **生产开 GraphiQL**：调试界面会暴露完整 schema，攻击者能看所有字段。生产必须关。
10. **没做持久化查询**：复杂查询字符串很大，浪费带宽。生产环境用"持久化查询"——前端发 hash，服务端查预存的 query。
11. **Mutation 不做事务**：一个 mutation 改多张表没包事务，部分失败导致数据不一致。用 \`db.begin()\` 包起来。

### 62.12 动手实验

**实验 1（基础）：给博客 GraphQL 加标签查询**
- 定义 \`TagType\`（id, name）
- 在 \`PostType\` 加 \`tags\` 字段（resolver 查标签）
- 在 Query 加 \`tags\` 查询（返所有标签）
- 在 Mutation 加 \`createTag\`、\`addTagToPost\`

**实验 2（进阶）：给电商 GraphQL 加 DataLoader**
- 写 \`product_loader\`：批量查商品
- 写 \`sku_loader\`：批量查 SKU
- 改 \`ProductType.skus\` resolver 用 DataLoader
- 用 \`echo=True\` 看 SQL，验证从 N+1 变成 2 条查询

**实验 3（挑战）：实现实时订阅**
- 用 \`@strawberry.subscription\` 实现"新评论推送"
- 当文章有新评论时，所有订阅该文章的客户端实时收到
- 用 Redis pubsub 跨 worker 同步（多个 uvicorn worker 之间）
- 思考：怎么处理订阅的权限？怎么清理断开的连接？

**实验 4（部署）：把 GraphQL + REST 混合部署**
- 同一个 FastAPI 应用，REST 走 \`/api/v1/*\`，GraphQL 走 \`/graphql\`
- 配置 QueryDepthLimiter 限深度
- 关掉生产环境的 GraphiQL
- 写一个 GitHub Action 自动部署

> **完成标志**：实验 1 能按标签查文章；实验 2 的 SQL 日志只剩 2 条；实验 3 能在两个浏览器窗口实时看到新评论；实验 4 部署后生产环境访问 /graphql 返 404（调试界面已关）。

### 62.13 小结

GraphQL 的核心价值是"按需取数据"和"一个端点"。Strawberry 让 Python 写 GraphQL 很优雅，和 FastAPI 集成也顺。但要警惕 N+1——DataLoader 是 GraphQL 项目的标配。电商系统展示了 GraphQL 在"复杂前端聚合查询"场景的巨大优势。下一章我们跳出单体，看看怎么把博客拆成微服务。`,
  },

  // =============================================================
  // 第六十三章：实战:微服务架构
  // =============================================================
  {
    id: "fa-project-microservice",
    group: "实战项目",
    icon: "🏗️",
    title: "实战:微服务架构",
    content: `## 第六十三章　实战:微服务架构

前两章都是"一个 app 一个库"的单体架构。这一章我们拆——把系统拆成多个独立的服务，每个服务自己跑、自己部署、自己扩容。但**微服务不是银弹**，它用"复杂度"换"灵活性"。学这章前先记住一句话：**没有痛到一定程度，别上微服务。**

> 🏠 **生活类比：大饭店 vs 小吃街**。单体架构像一家大饭店——所有部门（厨房、洗碗、收银、保洁）在一栋楼里，喊一嗓子就能协作，但楼里挤、改一处装修要停业。微服务架构像一条小吃街——每家店独立经营（独立部署）、各有各的厨房（独立数据库）、通过走道传递订单（网络通信）。好处是一家着火不烧整条街（故障隔离），坏处是协调麻烦（分布式事务难）、要付多份房租（运维成本飙升）。

### 63.1 微服务 vs 单体架构

**单体架构**：所有代码在一个项目里，一个进程跑。

优点：简单、好调试、本地能跑全、事务好做。缺点：代码越堆越臃肿、改一处要整体重新部署、技术栈被锁死、团队互相踩。

**微服务架构**：按业务拆成多个服务，独立部署，通过网络通信。

优点：独立部署、独立扩容、技术栈自由、故障隔离。缺点：分布式事务难、调试困难、网络开销、运维成本飙升。

**什么时候该拆**：

- 团队 > 10 人，互相踩代码；
- 不同模块负载差异大（比如视频转码要扩容，但用户管理不需要）；
- 不同模块技术栈需求不同（比如 AI 用 Python，实时通信用 Go）；
- 需要独立部署节奏（A 模块每周发，B 模块每月发）。

> **怎么想的**：微服务不是"先进"，而是"被迫"。单体扛不住了才拆。Martin Fowler 说："你应该从单体开始，等真正痛了再拆。"大多数项目，单体就够了。

### 63.2 服务拆分原则

**按业务能力拆，不按技术分层拆**。错误拆法：拆成"web 服务""db 服务""cache 服务"——这只是把分层变成远程调用，毫无好处还增加延迟。正确拆法：拆成"用户服务""订单服务""商品服务"——每个服务自治。

**拆分标准**：

1. **高内聚**：一个服务内的功能紧密相关（用户注册、登录、资料都在用户服务）；
2. **低耦合**：服务之间少依赖。改 A 服务不需要连带改 B；
3. **独立数据**：每个服务有自己的数据库，不共享。要通信走 API；
4. **合理粒度**：别太细（一个表一个服务，那是分布式单体，更惨）也别太粗（没拆等于没拆）。

**博客系统怎么拆**：

- 用户服务：注册、登录、用户资料（user_db）
- 文章服务：文章 CRUD、标签（post_db）
- 评论服务：评论 CRUD（comment_db）
- API 网关：聚合三个服务，对外统一入口

> **为什么各自有数据库**：共享数据库 = 没拆。服务之间通过 API 通信，数据所有权归各自。这样改用户表不影响文章服务。代价是"查文章+作者名"要跨服务调用——所以有 API 网关来聚合。

### 63.3 微服务通信（Demo 1：HTTP 调用）

服务间通信两种主流方式：HTTP（同步）和消息队列（异步）。

**HTTP 同步调用**：简单直接，但要处理超时、重试、熔断。

\`\`\`python
# user_service/main.py —— 用户服务
# 从 fastapi 导入 FastAPI 和 HTTPException
from fastapi import FastAPI, HTTPException
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 导入 hashlib（本例用哈希模拟密码加密，真实项目用 passlib）
import hashlib

# 创建应用实例
app = FastAPI(title="用户服务")

# 模拟数据库（真实项目用 PostgreSQL/MySQL）
users_db = {}

# 用户响应模型
class User(BaseModel):
    id: int
    email: str
    nickname: str

# 注册请求模型
class RegisterIn(BaseModel):
    email: str
    nickname: str
    password: str

# 注册接口
@app.post("/users", response_model=User)
def register(body: RegisterIn):
    # 检查邮箱是否已存在
    if body.email in users_db:
        raise HTTPException(409, "邮箱已存在")
    # 生成自增 id
    user_id = len(users_db) + 1
    user = User(id=user_id, email=body.email, nickname=body.nickname)
    # 存到"数据库"，{**body.dict(), "id": user_id} 合并字典
    users_db[body.email] = {**body.dict(), "id": user_id}
    return user

# 查用户接口（其他服务调这个拿作者信息）
@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: int):
    # 遍历查找（真实项目用主键查）
    for u in users_db.values():
        if u["id"] == user_id:
            return User(id=u["id"], email=u["email"], nickname=u["nickname"])
    raise HTTPException(404, "用户不存在")

# 健康检查（给网关/服务发现用）
@app.get("/health")
def health():
    return {"status": "ok"}
\`\`\`

\`\`\`python
# post_service/main.py —— 文章服务，需要调用户服务拿作者信息
# 从 fastapi 导入 FastAPI 和 HTTPException
from fastapi import FastAPI, HTTPException
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 导入 httpx：异步 HTTP 客户端，用于跨服务调用
import httpx

# 创建应用实例
app = FastAPI(title="文章服务")

# 模拟数据库
posts_db = {}
# 用户服务地址（真实项目从配置或服务发现拿）
USER_SERVICE_URL = "http://localhost:8001"  # 用户服务地址

# 文章模型（内部用）
class Post(BaseModel):
    id: int
    title: str
    content: str
    author_id: int

# 文章响应模型（返给客户端，含作者信息）
class PostOut(BaseModel):
    id: int
    title: str
    content: str
    author: dict | None  # 作者信息，从用户服务拿

# 查文章详情
@app.get("/posts/{post_id}", response_model=PostOut)
async def get_post(post_id: int):
    post = posts_db.get(post_id)
    if not post:
        raise HTTPException(404, "文章不存在")
    # 跨服务调用户服务拿作者信息
    author = None
    try:
        # httpx.AsyncClient 是异步 HTTP 客户端
        # timeout=2.0 是关键！不设超时会导致雪崩
        async with httpx.AsyncClient(timeout=2.0) as client:
            # 调用户服务的 /users/{id} 接口
            r = await client.get(f"{USER_SERVICE_URL}/users/{post['author_id']}")
            if r.status_code == 200:
                author = r.json()
    except httpx.RequestError:
        # 用户服务挂了，降级：返文章但作者为 null
        # 降级是微服务的重要策略——依赖挂了不能把自己也拖死
        author = None
    return {"id": post["id"], "title": post["title"], "content": post["content"], "author": author}

# 健康检查
@app.get("/health")
def health():
    return {"status": "ok"}
\`\`\`

> **避坑**：HTTP 调用一定要设超时！\`timeout=2.0\` 意味着 2 秒没响应就放弃。不设超时，被调服务挂了，调用方也跟着挂——这叫"雪崩"。

### 63.4 服务间通信：消息队列（Demo 2：异步）

**什么时候用消息队列**：不需要立即拿到结果的场景。比如"用户注册后发欢迎邮件"——发邮件慢且不重要，扔进消息队列，让邮件服务慢慢消费。

用 Redis 当消息队列（简单，够用）：

\`\`\`bash
pip install redis
\`\`\`

\`\`\`python
# post_service/events.py —— 文章服务发事件
import redis
import json

# 连 Redis
r = redis.Redis(host="localhost", port=6379, db=0)

def publish_post_created(post_id: int, title: str, author_id: int):
    # 往 "post_created" 频道发消息
    event = {"type": "post_created", "post_id": post_id, "title": title, "author_id": author_id}
    r.publish("post_created", json.dumps(event))
\`\`\`

\`\`\`python
# notification_service/main.py —— 通知服务订阅事件
import redis
import json
import threading

r = redis.Redis(host="localhost", port=6379, db=0)

def listen():
    pubsub = r.pubsub()
    pubsub.subscribe("post_created")
    for message in pubsub.listen():
        if message["type"] == "message":
            event = json.loads(message["data"])
            # 模拟发通知
            print(f"[通知] 用户 {event['author_id']} 发了新文章：{event['title']}")

# 后台线程监听
threading.Thread(target=listen, daemon=True).start()

from fastapi import FastAPI
app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}
\`\`\`

> **怎么想的**：消息队列让服务"解耦+削峰"。文章服务不用等通知服务，发完事件就返回，快；通知服务挂了也不影响发文章。生产环境用 RabbitMQ/Kafka 更专业，Redis pubsub 够小项目用。

### 63.5 API 网关（Demo 3：统一入口）

**为什么需要网关**：客户端不应该直接调各个服务（要记一堆地址、要处理认证、要聚合数据）。网关统一处理：认证、路由、限流、聚合。

\`\`\`python
# gateway/main.py —— API 网关
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import httpx

app = FastAPI(title="API 网关")

# 服务地址表
SERVICES = {
    "user": "http://localhost:8001",
    "post": "http://localhost:8002",
    "comment": "http://localhost:8003",
}

# 统一认证（网关层做，下游服务不用重复做）
async def verify_token(request: Request):
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        return None
    # 实际项目调用户服务校验 token
    return auth

# 代理请求到用户服务
@app.api_route("/api/users/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_users(path: str, request: Request):
    token = await verify_token(request)
    url = f"{SERVICES['user']}/{path}"
    async with httpx.AsyncClient(timeout=5.0) as client:
        headers = dict(request.headers)
        if token:
            headers["Authorization"] = token
        r = await client.request(request.method, url, headers=headers, content=await request.body())
        return JSONResponse(content=r.json(), status_code=r.status_code)

# 代理到文章服务
@app.api_route("/api/posts/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_posts(path: str, request: Request):
    url = f"{SERVICES['post']}/{path}"
    async with httpx.AsyncClient(timeout=5.0) as client:
        r = await client.request(request.method, url, content=await request.body())
        return JSONResponse(content=r.json(), status_code=r.status_code)

# 聚合接口：一次返文章+作者+评论（客户端不用发 3 个请求）
@app.get("/api/feed/{post_id}")
async def get_feed(post_id: int):
    async with httpx.AsyncClient(timeout=5.0) as client:
        # 并发调 3 个服务
        import asyncio
        post_task = client.get(f"{SERVICES['post']}/posts/{post_id}")
        comment_task = client.get(f"{SERVICES['comment']}/posts/{post_id}/comments")
        post_resp, comment_resp = await asyncio.gather(
            post_task, comment_task, return_exceptions=True
        )
        result = {}
        # 文章
        if isinstance(post_resp, httpx.Response) and post_resp.status_code == 200:
            post_data = post_resp.json()
            # 再查作者
            author_id = post_data.get("author_id")
            author_resp = await client.get(f"{SERVICES['user']}/users/{author_id}")
            post_data["author"] = author_resp.json() if author_resp.status_code == 200 else None
            result["post"] = post_data
        else:
            result["post"] = None
        # 评论
        if isinstance(comment_resp, httpx.Response) and comment_resp.status_code == 200:
            result["comments"] = comment_resp.json()
        else:
            result["comments"] = []
        return result
\`\`\`

> **怎么想的**：\`asyncio.gather\` 并发调用——3 个服务各查各的，总耗时 = 最慢的那个，而不是三个加起来。这是微服务聚合查询的性能关键。

### 63.6 服务发现（Demo 4：动态寻址）

**问题**：上面网关把服务地址写死了（\`http://localhost:8001\`）。服务多了、容器化了，地址会变。怎么办？

**服务发现**：服务启动时注册自己的地址，调用方动态查询。

简单版用 Redis 当注册中心：

\`\`\`python
# common/registry.py —— 服务注册与发现
import redis
import json
import time

r = redis.Redis(host="localhost", port=6379, db=0)

def register_service(name: str, url: str):
    """服务启动时注册"""
    # 用有序集合，score 存心跳时间戳
    r.zadd("services:" + name, {url: time.time()})

def heartbeat(name: str, url: str):
    """心跳：每 10 秒更新一次时间戳"""
    r.zadd("services:" + name, {url: time.time()})

def discover_service(name: str) -> str | None:
    """发现服务：返回一个可用的地址"""
    key = "services:" + name
    # 删掉 30 秒没心跳的（认为挂了）
    r.zremrangebyscore(key, 0, time.time() - 30)
    # 拿所有存活的
    members = r.zrange(key, 0, -1)
    if not members:
        return None
    # 简单轮询：返回第一个（生产环境用一致性哈希或随机）
    return members[0].decode()
\`\`\`

\`\`\`python
# user_service/main.py（启动时注册 + 心跳）
from common.registry import register_service, heartbeat
import threading
import time

register_service("user", "http://localhost:8001")

def keep_alive():
    while True:
        heartbeat("user", "http://localhost:8001")
        time.sleep(10)

threading.Thread(target=keep_alive, daemon=True).start()
\`\`\`

\`\`\`python
# gateway/main.py（动态发现）
from common.registry import discover_service

@app.get("/api/users/{path:path}")
async def proxy_users(path: str, request: Request):
    # 动态发现用户服务地址
    user_url = discover_service("user")
    if not user_url:
        raise HTTPException(503, "用户服务暂不可用")
    url = f"{user_url}/{path}"
    # ... 后续代理逻辑同上
\`\`\`

> **生产环境**：用 Consul / Nacos / etcd 做注册中心，功能更全（健康检查、KV 配置、多数据中心）。上面这个是原理演示。

### 63.7 分布式追踪（Demo 5：链路追踪）

**问题**：一个请求经过网关→文章服务→用户服务，其中用户服务慢了，怎么定位是哪一段慢？

**方案**：分布式追踪。每个请求一个 trace_id，每跨一个服务生成一个 span，全部上报到 Jaeger/Zipkin。

\`\`\`bash
pip install opentelemetry-api opentelemetry-sdk opentelemetry-instrumentation-fastapi opentelemetry-instrumentation-httpx
\`\`\`

\`\`\`python
# common/tracing.py —— 追踪配置
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

def setup_tracing(app, service_name: str):
    # 配置 tracer
    resource = Resource.create({"service.name": service_name})
    provider = TracerProvider(resource=resource)
    # 上报到 Jaeger（默认端口 4317）
    provider.add_span_processor(
        BatchSpanProcessor(OTLPSpanExporter(endpoint="localhost:4317"))
    )
    trace.set_tracer_provider(provider)
    # 自动埋点：FastAPI 和 httpx
    FastAPIInstrumentor.instrument_app(app)
    HTTPXClientInstrumentor().instrument()
\`\`\`

\`\`\`python
# 每个服务的 main.py 都加
from common.tracing import setup_tracing
setup_tracing(app, "user-service")
\`\`\`

启动 Jaeger（Docker）：

\`\`\`bash
docker run -d -p 4317:4317 -p 16686:16686 jaegertracing/all-in-one:latest
\`\`\`

访问 \`http://localhost:16686\`，能看到每个请求的完整调用链：哪个服务花了多久、哪个 span 慢。

### 63.8 容器化部署（Demo 6：Docker Compose）

微服务部署离不开容器。用 Docker Compose 一键拉起所有服务 + 依赖：

\`\`\`yaml
# docker-compose.yml
version: "3.9"
services:
  # Redis（消息队列+服务发现）
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  # Jaeger（追踪）
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "4317:4317"
      - "16686:16686"

  # 用户服务
  user-service:
    build: ./user_service
    ports: ["8001:8001"]
    environment:
      - REDIS_URL=redis://redis:6379/0
    depends_on: [redis, jaeger]

  # 文章服务
  post-service:
    build: ./post_service
    ports: ["8002:8002"]
    environment:
      - USER_SERVICE_URL=http://user-service:8001
      - REDIS_URL=redis://redis:6379/0
    depends_on: [redis, user-service]

  # 评论服务
  comment-service:
    build: ./comment_service
    ports: ["8003:8003"]
    depends_on: [redis]

  # API 网关
  gateway:
    build: ./gateway
    ports: ["8000:8000"]
    depends_on: [user-service, post-service, comment-service]
\`\`\`

\`\`\`dockerfile
# user_service/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
\`\`\`

启动：

\`\`\`bash
docker-compose up -d
# 所有服务一起跑起来
\`\`\`

> **怎么想的**：Docker Compose 把"装环境"这步省了。开发、测试、生产用同一套 compose 文件，环境一致。生产环境再换 K8s，但 compose 文件是基础。

### 63.9 生活类比：微服务工种对照表

> 🏠 **生活类比：微服务像一条小吃街**。每家店独立经营，但需要一套"公共设施"才能运转：

| 小吃街设施 | 微服务组件 | 职责 |
| --- | --- | --- |
| 街口总招牌 | API 网关 | 统一入口，指路 |
| 店铺地址簿 | 服务发现（注册中心） | 查哪家店在哪儿 |
| 对讲机 | 消息队列 | 异步喊话，不用当面等 |
| 监控探头 | 分布式追踪 | 谁家出问题一目了然 |
| 保安 | 熔断器 | 一家着火封锁整条街防蔓延 |
| 物业 | 配置中心 | 统一管水电费（配置） |
| 集装箱 | Docker | 把整家店打包搬走 |
| 街道办 | Kubernetes | 管所有店的开关、扩容、调度 |

> **关键洞察**：微服务的复杂度不在"写服务"，而在"管服务"。代码量和单体差不多，但运维成本是单体的 3-5 倍。**没有 K8s + 监控 + CI/CD，别上微服务。**

### 63.10 电商微服务完整实现（Demo 7：四服务拆分）

**怎么想的**：电商系统按业务能力拆成四个服务——用户、商品、订单、支付。每个服务独立数据库，通过 API 通信。

\`\`\`python
# order_service/main.py —— 订单服务
# 订单服务要调商品服务（查 SKU 价格+扣库存）和用户服务（校验用户）
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import httpx
import os

app = FastAPI(title="订单服务")

# 订单服务自己的数据库（独立，不和其他服务共享）
engine = create_engine(os.getenv("ORDER_DB_URL", "sqlite:///./orders.db"))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 订单模型（简化版）
from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import declarative_base
Base = declarative_base()

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True)
    order_no = Column(String(32), unique=True)
    user_id = Column(Integer)
    total_amount = Column(Float)
    status = Column(String(20), default="pending")

Base.metadata.create_all(engine)

# 商品服务地址（从服务发现拿，这里简化）
PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:8002")

class OrderItemIn(BaseModel):
    sku_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: list[OrderItemIn]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/orders", status_code=201)
async def create_order(body: OrderCreate, db: Session = Depends(get_db)):
    # 1. 调商品服务查价格 + 扣库存
    total = 0
    async with httpx.AsyncClient(timeout=3.0) as client:
        for item in body.items:
            # 查 SKU 价格
            r = await client.get(f"{PRODUCT_SERVICE_URL}/skus/{item.sku_id}")
            if r.status_code != 200:
                raise HTTPException(400, f"SKU {item.sku_id} 不存在")
            sku = r.json()
            # 扣库存（商品服务内部用 FOR UPDATE）
            deduct_r = await client.post(
                f"{PRODUCT_SERVICE_URL}/skus/{item.sku_id}/deduct",
                json={"quantity": item.quantity}
            )
            if deduct_r.status_code != 200:
                raise HTTPException(400, f"库存不足：{sku['spec']}")
            total += sku["price"] * item.quantity

    # 2. 建订单
    import time, random
    order_no = f"{int(time.time())}{random.randint(1000, 9999)}"
    order = Order(order_no=order_no, user_id=1, total_amount=total, status="pending")
    db.add(order)
    db.commit()
    db.refresh(order)
    return {"order_no": order.order_no, "total": order.total_amount}

# 订单服务发事件（支付成功后通知发货服务）
import redis, json
r = redis.Redis(host="localhost", port=6379, db=0)

@app.post("/orders/{order_no}/pay")
async def pay_order(order_no: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.order_no == order_no).first()
    if not order:
        raise HTTPException(404, "订单不存在")
    order.status = "paid"
    db.commit()
    # 发事件：订单已支付，发货服务来消费
    r.publish("order_paid", json.dumps({"order_no": order_no, "user_id": order.user_id}))
    return {"status": "paid"}
\`\`\`

> **怎么想的**：订单服务不直接调发货服务，而是发事件。这样发货服务挂了不影响支付，发货服务可以慢慢消费事件。这就是"事件驱动架构"。

### 63.11 K8s 部署上线（Demo 8）

生产环境微服务用 Kubernetes 编排。下面是电商系统的 K8s 部署文件：

\`\`\`yaml
# k8s/order-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  replicas: 3  # 3 个副本，高可用
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      containers:
      - name: order-service
        image: registry.example.com/order-service:v1
        ports:
        - containerPort: 8003
        env:
        - name: ORDER_DB_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: order-db-url
        - name: PRODUCT_SERVICE_URL
          value: "http://product-service:8002"
        # 健康检查：K8s 定期探活，挂了自动重启
        livenessProbe:
          httpGet:
            path: /health
            port: 8003
          initialDelaySeconds: 10
          periodSeconds: 30
        # 就绪检查：准备好才接流量
        readinessProbe:
          httpGet:
            path: /health
            port: 8003
          initialDelaySeconds: 5
          periodSeconds: 10
        # 资源限制：防止单个容器吃光资源
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
---
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector:
    app: order-service
  ports:
  - port: 8003
    targetPort: 8003
\`\`\`

> **怎么想的**：K8s 的核心价值是"声明式"——你告诉它"我要 3 个订单服务"，它自己管怎么调度、怎么重启、怎么扩容。服务挂了自动拉起，流量大了手动扩容到 5 个副本。

### 63.12 常见错误与避坑指南

1. **分布式事务**：跨服务改数据，没法用一个事务保证一致。方案：Saga 模式（补偿事务）或最终一致性。**别强求强一致**。
2. **同步调用链太长**：A→B→C→D，D 慢全链路慢。原则：同步调用不超过 2 层，再多用消息队列。
3. **没做熔断**：B 挂了 A 还在调，A 也被拖垮。用熔断器（如 \`circuitbreaker\` 库）——失败到阈值就停止调用，快速失败。
4. **共享数据库**：服务 A 直接查服务 B 的数据库。这是反模式，等于没拆。必须走 API。
5. **过度拆分**：一个表一个服务，跨服务 join 变成跨服务调用，慢且复杂。粒度要合理。
6. **日志没 trace_id**：排查问题要翻 N 个服务的日志。每个请求带 trace_id，所有服务日志都打这个 id。
7. **配置散落**：每个服务自己的 .env，改一次要改 N 处。用配置中心（Apollo/Nacos）统一管。
8. **本地开发困难**：跑全套要起 5 个服务。方案：用 docker-compose 本地起依赖，自己开发的服务本地跑。
9. **没做服务发现**：地址写死，扩容/迁移时改一堆配置。必须用注册中心。
10. **同步调用没降级**：依赖服务挂了直接 500。要 try/except 降级返默认值。
11. **事件丢失**：Redis pubsub 挂了消息就没了。重要事件用 RabbitMQ 的持久化队列。

### 63.13 动手实验

**实验 1（基础）：拆分博客系统**
- 把第六十一章的博客拆成三个服务：用户、文章、评论
- 每个服务独立 SQLite 数据库
- 写一个 API 网关聚合三个服务
- 用 docker-compose 跑起来

**实验 2（进阶）：加服务发现和熔断**
- 用 Redis 实现服务注册与发现
- 给文章服务的"调用户服务"加熔断器：连续失败 5 次就 30 秒内直接返降级
- 思考：熔断开后怎么半开试探恢复？

**实验 3（挑战）：实现 Saga 分布式事务**
- 下单要扣库存（商品服务）+ 建订单（订单服务）+ 扣余额（用户服务）
- 三个服务不能用一个事务
- 用 Saga 模式：成功正序执行，失败逆序补偿
- 思考：补偿操作失败了怎么办？

**实验 4（部署）：用 K8s 部署电商微服务**
- 写每个服务的 Deployment + Service
- 配 livenessProbe 和 readinessProbe
- 用 HPA（水平自动扩容）按 CPU 自动扩缩
- 思考：滚动更新时怎么保证零停机？

> **完成标志**：实验 1 的网关能聚合三服务数据；实验 2 熔断后用户服务挂了文章接口仍可用；实验 3 任一步失败数据能回滚一致；实验 4 \`kubectl get pods\` 看到所有服务 Running。

### 63.14 小结

微服务的核心是"用复杂度换灵活性"：拆服务、走网络、上注册中心、做追踪、容器化部署。这套东西运维成本很高，只有规模到了才值得。电商微服务展示了跨服务通信、事件驱动、K8s 编排的完整实践。下一章我们给前面做的系统做性能优化——不管是单体还是微服务，性能都是绕不开的话题。`,
  },

  // =============================================================
  // 第六十四章：实战:性能优化
  // =============================================================
  {
    id: "fa-project-perf",
    group: "实战项目",
    icon: "⚡",
    title: "实战:性能优化",
    content: `## 第六十四章　实战:性能优化

性能优化是 FastAPI 教程的最后一章。前面我们写"能跑"的代码，这一章让代码"跑得快"。**先测再优、定位瓶颈、对症下药**——这是性能优化的铁律。盲目优化是万恶之源。

> 🏠 **生活类比：性能优化像给汽车调校**。不能靠"感觉慢"就乱换零件——要先上诊断仪测哪里慢（cProfile/py-spy），再针对瓶颈换零件（加索引=换好轮胎，加缓存=装涡轮，并发=多气缸）。乱优化像给自行车装飞机引擎——花了大钱还跑不快。

### 64.1 性能优化的正确思路

**性能优化的三步法**：

1. **测量**：用工具测出哪里慢，别靠猜；
2. **定位**：找到瓶颈在哪（CPU？IO？数据库？网络？）；
3. **优化**：针对瓶颈优化，优化完再测，验证效果。

> **黄金法则**：先用工具找瓶颈，再优化瓶颈，每次只改一个地方，改完对比。不测量就优化，等于闭眼打靶。

### 64.2 性能分析工具（Demo 1：cProfile + py-spy）

**cProfile**：Python 自带的性能分析器，能统计每个函数被调多少次、花了多久。

\`\`\`python
# profile_app.py —— 用 cProfile 分析接口
import cProfile
import pstats
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_benchmark():
    """模拟发 100 个请求"""
    for i in range(100):
        client.get("/api/v1/posts")

profiler = cProfile.Profile()
profiler.enable()
run_benchmark()
profiler.disable()

stats = pstats.Stats(profiler)
stats.sort_stats("cumulative")
stats.print_stats(20)
\`\`\`

**py-spy**：不用改代码，直接 attach 到运行中的进程，生成火焰图。

\`\`\`bash
pip install py-spy
py-spy record -o profile.svg --pid $(pgrep -f uvicorn) --duration 30
\`\`\`

> **避坑**：cProfile 有性能开销，测出来的绝对时间不准，但"相对比例"是准的。py-spy 用采样，开销小，适合生产环境。

### 64.3 数据库优化（Demo 2：索引、N+1、查询优化）

**1. 加索引**：

\`\`\`python
# 错误：没索引，按 email 查要全表扫描
class User(Base):
    email: Mapped[str] = mapped_column(String(255))

# 正确：加 index=True
class User(Base):
    email: Mapped[str] = mapped_column(String(255), index=True)

# 复合索引
class Post(Base):
    __table_args__ = (
        Index("idx_author_created", "author_id", "created_at"),
    )
\`\`\`

**2. N+1 查询**：

\`\`\`python
# 错误：N+1
posts = db.query(Post).limit(20).all()
for p in posts:
    print(p.author.nickname)  # 每次访问 .author 触发查询

# 正确1：joinedload
from sqlalchemy.orm import joinedload
posts = db.query(Post).options(joinedload(Post.author)).limit(20).all()

# 正确2：selectinload（一对多）
from sqlalchemy.orm import selectinload
posts = db.query(Post).options(selectinload(Post.comments)).limit(20).all()
\`\`\`

**3. 只查需要的字段**：

\`\`\`python
# 错误：查回所有字段
posts = db.query(Post).all()

# 正确：只查需要的字段
posts = db.query(Post.id, Post.title, Post.created_at).all()
\`\`\`

### 64.4 缓存策略（Demo 3：Redis 缓存）

\`\`\`python
# app/core/cache.py
import redis
import json
from typing import Any

redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

def cache_get(key: str) -> Any | None:
    data = redis_client.get(key)
    if data:
        return json.loads(data)
    return None

def cache_set(key: str, value: Any, ttl: int = 300) -> None:
    redis_client.setex(key, ttl, json.dumps(value))

def cache_delete(key: str) -> None:
    redis_client.delete(key)
\`\`\`

> **缓存一致性**：数据改了缓存没更新会返脏数据。策略：写数据时主动删缓存（Cache Aside Pattern）。**删比更新安全**。

### 64.5 异步优化（Demo 4：并发查询）

\`\`\`python
import asyncio
from fastapi.concurrency import run_in_threadpool

async def get_dashboard_async(db):
    user_count, post_count, comment_count = await asyncio.gather(
        run_in_threadpool(db.query(User).count),
        run_in_threadpool(db.query(Post).count),
        run_in_threadpool(db.query(Comment).count),
    )
    return {"users": user_count, "posts": post_count, "comments": comment_count}
\`\`\`

### 64.6 响应压缩和连接池调优（Demo 5）

\`\`\`python
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

engine = create_engine(
    settings.database_url,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=1800,
    pool_pre_ping=True,
)
\`\`\`

### 64.7 压力测试（Demo 6：locust）

\`\`\`python
from locust import HttpUser, task, between

class BlogUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def list_posts(self):
        self.client.get("/api/v1/posts")

    @task(1)
    def get_post(self):
        self.client.get("/api/v1/posts/1")
\`\`\`

### 64.8 完整优化实战（Demo 7：综合优化）

\`\`\`python
@router.get("", response_model=PostList)
def list_posts(keyword=None, tag_id=None, paging=Depends(pagination_params), db=Depends(get_db)):
    cache_key = f"posts:list:{paging['page']}:{paging['size']}:{keyword}:{tag_id}"
    cached = cache_get(cache_key)
    if cached:
        return cached
    skip = (paging["page"] - 1) * paging["size"]
    q = db.query(Post).options(joinedload(Post.author), selectinload(Post.tags))
    if keyword:
        q = q.filter(Post.title.ilike(f"%{keyword}%"))
    total = q.count()
    items = q.offset(skip).limit(paging["size"]).all()
    pages = (total + paging["size"] - 1) // paging["size"]
    result = {"items": items, "total": total, "page": paging["page"], "size": paging["size"], "pages": pages}
    cache_set(cache_key, result, ttl=300)
    return result
\`\`\`

### 64.9 生活类比：性能优化像体检

> 🏠 **生活类比**：性能优化像给应用做体检——cProfile 是血液检查（看细胞分布），py-spy 是 CT 扫描（看内部结构），locust 是运动负荷测试（看极限表现）。**对症下药**：数据库慢=补血（加索引），网络慢=通血管（压缩+连接池），CPU 慢=健身（异步+并发）。

### 64.10 电商系统综合性能优化（Demo 8）

\`\`\`python
# 电商商品列表优化版
@router.get("/products", response_model=list[ProductOut])
def list_products(keyword=None, paging=Depends(pagination_params), db=Depends(get_db)):
    # 1. 缓存层
    cache_key = f"products:list:{paging['page']}:{paging['size']}:{keyword}"
    cached = cache_get(cache_key)
    if cached:
        return cached
    # 2. 数据库层：预加载 SKU 避免N+1
    q = db.query(Product).options(selectinload(Product.skus)).filter(Product.is_active == True)
    if keyword:
        q = q.filter(Product.name.ilike(f"%{keyword}%"))
    total = q.count()
    items = q.offset((paging["page"]-1)*paging["size"]).limit(paging["size"]).all()
    # 3. 写缓存，加随机抖动防雪崩
    import random
    cache_set(cache_key, items, ttl=300 + random.randint(0, 60))
    return items
\`\`\`

### 64.11 监控告警系统（Demo 9）

\`\`\`python
# app/core/monitoring.py —— Prometheus 监控
from prometheus_client import Counter, Histogram, generate_latest
from fastapi import Response
import time

# 请求计数器
request_count = Counter("http_requests_total", "Total requests", ["method", "endpoint", "status"])
# 请求耗时直方图
request_latency = Histogram("http_request_duration_seconds", "Request latency", ["endpoint"])

@app.middleware("http")
async def monitor_middleware(request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    # 记录指标
    request_count.labels(request.method, request.url.path, response.status_code).inc()
    request_latency.labels(request.url.path).observe(duration)
    return response

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type="text/plain")
\`\`\`

> **告警规则**：P99 延迟 > 1s 告警，错误率 > 1% 告警，QPS 突降 50% 告警。

### 64.12 常见错误与避坑指南

1. **盲目加缓存**：没测就加缓存，瓶颈在 CPU 不在 DB，白加。**先测再优化**。
2. **缓存没清**：写了新数据但缓存没删，用户看不到。
3. **缓存雪崩**：所有缓存同时过期。给 TTL 加随机抖动。
4. **缓存穿透**：查不存在的 key 每次打 DB。缓存空值或用布隆过滤器。
5. **N+1 没根治**：用 \`echo=True\` 看 SQL 确认。
6. **异步阻塞事件循环**：用 \`run_in_threadpool\` 或 AsyncSession。
7. **连接池配置不当**：监控 \`pool.checkedout\` 看使用率。
8. **过度优化**：QPS 才 10 的内部工具花一天优化到 1000 毫无意义。
9. **只看平均值**：看 P99/P95。
10. **生产开 echo=True**：SQL 日志打爆磁盘。

### 64.13 动手实验

**实验 1（基础）：用 cProfile 分析博客系统**
- 跑 cProfile 分析 \`/api/v1/posts\` 接口
- 找出耗时最多的 3 个函数
- 针对性优化后对比

**实验 2（进阶）：加 Redis 缓存**
- 给文章列表加缓存
- 写操作时清缓存
- 用 locust 压测对比优化前后 RPS

**实验 3（挑战）：全链路监控**
- 集成 Prometheus 指标
- 配 Grafana 仪表盘
- 设置告警规则
- 思考：怎么定位 P99 尖刺？

**实验 4（综合）：电商系统性能调优**
- 给商品列表加缓存+预加载
- 异步并发查 Dashboard
- 压测到 1000 RPS
- 思考：还能怎么优化？

> **完成标志**：实验 1 找出瓶颈并优化提升 2 倍；实验 2 缓存命中后 RPS 提升 10 倍；实验 3 Grafana 能看到实时指标；实验 4 压测达标。

### 64.14 小结与全教程结语

性能优化的核心是"测量→定位→优化→验证"循环。工具用 cProfile/py-spy 找瓶颈，数据库加索引+治 N+1，缓存用 Redis，并发用 asyncio.gather，压缩用 GZip，压测用 locust/wrk，监控用 Prometheus。**每一步都要数据说话**。

---

**全教程结语**：

到这里，FastAPI 应用开发实战教程就全部结束了。16 批共 64 章，从最基础的"FastAPI 是什么"到完整的实战项目，我们走过了基础篇、进阶篇、高级篇、部署篇、实战篇。FastAPI 的设计哲学是"用 Python 的类型注解做契约，让框架替你处理样板代码"。祝你写出又快又稳的 API。下个项目见！`,
  },
];