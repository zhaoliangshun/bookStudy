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

### 61.9 常见错误与避坑指南

1. **循环导入**：models 之间互相 import 会报错。解决：用字符串引用（\`relationship("Post")\`）或在 \`TYPE_CHECKING\` 下 import。
2. **N+1 查询**：列表接口返文章时顺带返作者名，默认会每篇文章查一次作者。解决：用 \`joinedload\` 或 \`selectinload\` 预加载。
3. **事务没回滚**：crud 里抛异常但没 rollback，session 会卡住。解决：用 FastAPI 的依赖 + try/finally 关 session，或用中间件统一处理。
4. **权限漏洞**：忘了校验 author_id，导致 A 能改 B 的文章。**每个写操作都要校验归属**。
5. **JWT 密钥泄露**：把密钥写进代码仓库。解决：放 .env，.env 进 .gitignore。
6. **CORS 配太宽**：\`allow_origins=["*"]\` 加 \`allow_credentials=True\` 会导致 cookie 不生效。生产环境必须指定具体域名。
7. **密码用 MD5**：MD5 能被彩虹表秒破。必须用 bcrypt/argon2。
8. **分页没上限**：\`?size=10000\` 直接把库查爆。用 \`Field(le=100)\` 限制。

### 61.10 小结

这一章我们搭了一个完整的博客 API 骨架：分层架构（api/service/crud/models/schemas）、JWT 认证、权限控制、分页搜索、两级评论、测试。这套结构可以直接套到任何 CRUD 项目上。下一章我们给这个博客加 GraphQL 接口，看看另一种 API 风格。
`,
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

### 62.8 常见错误与避坑指南

1. **N+1 查询**：这是 GraphQL 最容易踩的坑。文章列表+作者+评论，没 DataLoader 能查几百次。**所有关联字段都要上 DataLoader**。
2. **同步 resolver 阻塞事件循环**：resolver 里直接用同步 SQLAlchemy，会阻塞 asyncio。解决：用 \`sqlalchemy[asyncio]\` 或用 \`run_in_threadpool\` 包一层。
3. **权限校验写在 schema 里**：每个 mutation 都要 if not user: raise。建议写个装饰器统一处理。
4. **错误信息泄露**：raise Exception("文章不存在") 会把堆栈返给客户端。生产环境要包装错误，只返友好信息。
5. **Mutation 返回类型混乱**：有人 mutation 返 Boolean，有人返对象。约定：增改返对象，删返 Boolean，保持一致。
6. **Subscription 滥用**：Subscription 走 WebSocket，连接多了服务端扛不住。只用于"真正实时"的场景（聊天、通知），别拿来替代轮询查列表。
7. **没做查询深度限制**：恶意客户端能发嵌套极深的查询 \`{ posts { author { posts { author { ... } } } } }\` 拖垮服务端。用 \`graphql-core\` 的深度限制插件防护。
8. **input 和 type 混用**：\`@strawberry.type\` 不能当 input 用，反之亦然。要分清。

### 62.9 小结

GraphQL 的核心价值是"按需取数据"和"一个端点"。Strawberry 让 Python 写 GraphQL 很优雅，和 FastAPI 集成也顺。但要警惕 N+1——DataLoader 是 GraphQL 项目的标配。下一章我们跳出单体，看看怎么把博客拆成微服务。
`,
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

### 63.9 常见错误与避坑指南

1. **分布式事务**：跨服务改数据，没法用一个事务保证一致。方案：Saga 模式（补偿事务）或最终一致性。**别强求强一致**。
2. **同步调用链太长**：A→B→C→D，D 慢全链路慢。原则：同步调用不超过 2 层，再多用消息队列。
3. **没做熔断**：B 挂了 A 还在调，A 也被拖垮。用熔断器（如 \`circuitbreaker\` 库）——失败到阈值就停止调用，快速失败。
4. **共享数据库**：服务 A 直接查服务 B 的数据库。这是反模式，等于没拆。必须走 API。
5. **过度拆分**：一个表一个服务，跨服务 join 变成跨服务调用，慢且复杂。粒度要合理。
6. **日志没 trace_id**：排查问题要翻 N 个服务的日志。每个请求带 trace_id，所有服务日志都打这个 id。
7. **配置散落**：每个服务自己的 .env，改一次要改 N 处。用配置中心（Apollo/Nacos）统一管。
8. **本地开发困难**：跑全套要起 5 个服务。方案：用 docker-compose 本地起依赖，自己开发的服务本地跑。

### 63.10 小结

微服务的核心是"用复杂度换灵活性"：拆服务、走网络、上注册中心、做追踪、容器化部署。这套东西运维成本很高，只有规模到了才值得。下一章我们给前面做的系统做性能优化——不管是单体还是微服务，性能都是绕不开的话题。
`,
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

### 64.1 性能优化的正确思路

**性能优化的三步法**：

1. **测量**：用工具测出哪里慢，别靠猜；
2. **定位**：找到瓶颈在哪（CPU？IO？数据库？网络？）；
3. **优化**：针对瓶颈优化，优化完再测，验证效果。

**常见误区**：

- "我觉得这里慢" → 没数据支撑的优化都是耍流氓；
- "加缓存就好了" → 缓存不是万能药，缓存一致性很头疼；
- "用异步就快" → 异步只对 IO 密集型有用，CPU 密集型反而更慢；
- "优化到极致" → 性能足够就好，过度优化损害可读性。

> **黄金法则**：先用工具找瓶颈，再优化瓶颈，每次只改一个地方，改完对比。不测量就优化，等于闭眼打靶。

### 64.2 性能分析工具（Demo 1：cProfile + py-spy）

**cProfile**：Python 自带的性能分析器，能统计每个函数被调多少次、花了多久。

\`\`\`python
# profile_app.py —— 用 cProfile 分析接口
# 导入 cProfile：Python 自带的性能分析器
import cProfile
# 导入 pstats：分析结果的统计和输出
import pstats
# 从 fastapi.testclient 导入 TestClient，用于模拟请求
from fastapi.testclient import TestClient
# 从 app.main 导入 app 实例
from app.main import app

# 创建测试客户端
client = TestClient(app)

# 模拟发 100 个请求的基准测试
def run_benchmark():
    """模拟发 100 个请求"""
    for i in range(100):
        client.get("/api/v1/posts")

# 用 cProfile 跑
# 创建 Profile 对象
profiler = cProfile.Profile()
# 开始记录每个函数的调用次数和耗时
profiler.enable()
# 执行要分析的代码
run_benchmark()
# 停止记录
profiler.disable()

# 输出统计：按累计时间排序
# pstats.Stats 把 Profile 数据转成可读统计
stats = pstats.Stats(profiler)
# sort_stats("cumulative") 按累计耗时排序（含子调用）
stats.sort_stats("cumulative")
# print_stats(20) 只看前 20 个最慢的函数
stats.print_stats(20)
\`\`\`

输出类似：
\`\`\`
   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
      100    0.020    0.000    2.500    0.025 app/api/v1/posts.py:15(list_posts)
      200    1.200    0.006    1.800    0.009 sqlalchemy/orm/query.py:300(all)
\`\`\`

- \`ncalls\`：调用次数
- \`tottime\`：函数本身耗时（不含子调用）
- \`cumtime\`：累计耗时（含子调用）

**怎么读**：找 cumtime 最大的那几个函数，那就是瓶颈。上面例子里 \`query.all()\` 花了 1.8 秒，说明数据库查询是瓶颈。

**py-spy**：不用改代码，直接 attach 到运行中的进程，生成火焰图。

\`\`\`bash
# 安装
pip install py-spy

# 启动你的 FastAPI
uvicorn app.main:app --port 8000

# 另一个终端，采样 30 秒生成火焰图
py-spy record -o profile.svg --pid $(pgrep -f uvicorn) --duration 30
\`\`\`

生成的 \`profile.svg\` 用浏览器打开，能看到每个函数的调用栈和耗时占比。**火焰图怎么读**：横轴是耗时占比，越宽越慢；纵轴是调用栈。找最宽的那块，就是优化目标。

> **避坑**：cProfile 有性能开销，测出来的绝对时间不准，但"相对比例"是准的。py-spy 用采样，开销小，适合生产环境。

### 64.3 数据库优化（Demo 2：索引、N+1、查询优化）

数据库通常是 Web 应用的第一瓶颈。

**1. 加索引**：

\`\`\`python
# 错误：没索引，按 email 查要全表扫描
class User(Base):
    email: Mapped[str] = mapped_column(String(255))

# 正确：加 index=True，按 email 查走索引，O(log n) 而不是 O(n)
class User(Base):
    email: Mapped[str] = mapped_column(String(255), index=True)

# 复合索引：经常按 (author_id, created_at) 查
class Post(Base):
    __table_args__ = (
        Index("idx_author_created", "author_id", "created_at"),
    )
\`\`\`

> **怎么想**：索引像书的目录——没目录找某个词要翻全书，有目录直接翻到对应页。但索引不是越多越好：写数据时要更新索引，索引太多写入变慢。**只给常查的字段加索引**。

**2. N+1 查询**：列表接口返文章+作者，默认每篇文章查一次作者。

\`\`\`python
# 错误：N+1。查 20 篇文章 = 1 次查 post + 20 次查 author = 21 次查询
posts = db.query(Post).limit(20).all()
for p in posts:
    print(p.author.nickname)  # 每次访问 .author 触发一次查询

# 正确1：joinedload，用 JOIN 一次查回
from sqlalchemy.orm import joinedload
posts = db.query(Post).options(joinedload(Post.author)).limit(20).all()
# 只发 1 条 SQL：SELECT ... FROM posts JOIN users ON ...

# 正确2：selectinload，用 IN 子查询（适合一对多）
from sqlalchemy.orm import selectinload
posts = db.query(Post).options(selectinload(Post.comments)).limit(20).all()
# 发 2 条 SQL：先查 posts，再 SELECT ... FROM comments WHERE post_id IN (1,2,3,...)
\`\`\`

> **joinedload vs selectinload**：多对一用 joinedload（JOIN 不膨胀）；一对多用 selectinload（JOIN 会让父行重复，selectinload 用 IN 更干净）。

**3. 只查需要的字段**：

\`\`\`python
# 错误：查回所有字段，包括几万字的正文
posts = db.query(Post).all()  # SELECT *

# 正确：只查需要的字段
posts = db.query(Post.id, Post.title, Post.created_at).all()
# SELECT id, title, created_at FROM posts
\`\`\`

**4. 用 EXPLAIN 看执行计划**：

\`\`\`python
# 打印 SQL 执行计划
from sqlalchemy import text
result = db.execute(text("EXPLAIN QUERY PLAN SELECT * FROM posts WHERE title LIKE '%python%'"))
for row in result:
    print(row)
\`\`\`

如果看到 \`SCAN TABLE posts\`（全表扫描）说明没走索引；\`SEARCH posts USING INDEX\` 说明走了。

### 64.4 缓存策略（Demo 3：Redis 缓存）

**缓存怎么想**：同一个查询反复执行，结果不变，那就把结果存起来，下次直接返。**缓存的本质是用空间换时间**。

**什么适合缓存**：读多写少、对实时性要求不高的数据。比如文章列表、热门文章、用户资料。

**什么不适合缓存**：频繁变化的数据、对一致性要求高的数据（如余额）。

\`\`\`python
# app/core/cache.py —— Redis 缓存工具
# 导入 redis 库
import redis
# 导入 json，用于序列化/反序列化（Redis 只能存字符串/字节）
import json
# 从 typing 导入 Any，表示任意类型
from typing import Any

# 连接 Redis
# decode_responses=True 让 redis 返回 str 而不是 bytes，省去手动 decode
redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

# 从缓存取
def cache_get(key: str) -> Any | None:
    """从缓存取，取不到返回 None"""
    # redis_client.get 返回 None 表示 key 不存在
    data = redis_client.get(key)
    if data:
        # json.loads 把 JSON 字符串转回 Python 对象
        return json.loads(data)
    return None

# 写缓存
def cache_set(key: str, value: Any, ttl: int = 300) -> None:
    """写缓存，ttl 是过期秒数"""
    # setex(key, 过期秒数, 值)：写入并设置过期时间
    # ttl=300 表示 5 分钟后自动删除（防止缓存数据过旧）
    # json.dumps 把 Python 对象转成 JSON 字符串
    redis_client.setex(key, ttl, json.dumps(value))

# 删缓存
def cache_delete(key: str) -> None:
    """删缓存"""
    # 数据变更时调用，防止返脏数据
    redis_client.delete(key)
\`\`\`

**在文章列表接口加缓存**：

\`\`\`python
# app/api/v1/posts.py（改造列表接口）
from app.core.cache import cache_get, cache_set, cache_delete

@router.get("", response_model=PostList)
def list_posts(
    keyword: str | None = None,
    tag_id: int | None = None,
    paging: dict = Depends(pagination_params),
    db: Session = Depends(get_db),
):
    # 构造缓存 key：包含所有查询参数
    cache_key = f"posts:list:{paging['page']}:{paging['size']}:{keyword}:{tag_id}"
    # 先查缓存
    cached = cache_get(cache_key)
    if cached:
        return cached  # 命中缓存，直接返
    # 没命中，查数据库
    skip = (paging["page"] - 1) * paging["size"]
    items, total = post_crud.search(db, keyword=keyword, tag_id=tag_id, skip=skip, limit=paging["size"])
    pages = (total + paging["size"] - 1) // paging["size"]
    result = {"items": items, "total": total, "page": paging["page"], "size": paging["size"], "pages": pages}
    # 写缓存，5 分钟过期
    cache_set(cache_key, result, ttl=300)
    return result

# 发文章、改文章、删文章时，要清缓存
@router.post("", response_model=PostOut, status_code=201)
def create_post(...):
    post = ...
    # 清缓存（列表变了）
    cache_delete("posts:list:*")  # 实际要用 redis 的 SCAN 批量删
    return post
\`\`\`

> **缓存一致性怎么想**：数据改了缓存没更新，就会返脏数据。策略：写数据时主动删缓存（Cache Aside Pattern）。不要"更新缓存"——并发下会写脏。**删比更新安全**。

**内存缓存（小项目用）**：

\`\`\`python
# 不想装 Redis？用 functools.lru_cache 做进程内缓存
from functools import lru_cache

@lru_cache(maxsize=128)
def get_hot_posts():
    """热门文章，5 分钟内复用结果"""
    # 注意：lru_cache 按参数缓存，参数必须是可哈希的
    db = SessionLocal()
    try:
        return db.query(Post).order_by(Post.views.desc()).limit(10).all()
    finally:
        db.close()
\`\`\`

> **避坑**：\`lru_cache\` 是进程内的，多 worker 之间不共享。而且缓存的对象是 Python 对象，改了会污染。适合只读、变化少的数据。

### 64.5 异步优化（Demo 4：并发查询）

**怎么想**：如果接口里要调多个独立的数据源（比如查 3 个无关的表，或者调 3 个外部 API），串行执行要 3 倍时间，并行只要 1 倍。

**串行 vs 并发**：

\`\`\`python
# 串行：3 个查询依次执行，总耗时 = t1 + t2 + t3
def get_dashboard(db):
    user_count = db.query(User).count()         # 0.1s
    post_count = db.query(Post).count()         # 0.1s
    comment_count = db.query(Comment).count()   # 0.1s
    return {"users": user_count, "posts": post_count, "comments": comment_count}
    # 总耗时 0.3s（三个查询一个等一个）

# 并发：3 个查询同时跑，总耗时 = max(t1, t2, t3)
# 导入 asyncio，用于并发执行
import asyncio
# 从 fastapi.concurrency 导入 run_in_threadpool
# 它把同步函数放到线程池里跑，避免阻塞事件循环
from fastapi.concurrency import run_in_threadpool

async def get_dashboard_async(db):
    # SQLAlchemy 同步操作要放线程池里跑，否则阻塞事件循环
    # asyncio.gather 并发执行多个协程，等全部完成
    # 每个查询独立在线程里跑，互不阻塞
    user_count, post_count, comment_count = await asyncio.gather(
        run_in_threadpool(db.query(User).count),
        run_in_threadpool(db.query(Post).count),
        run_in_threadpool(db.query(Comment).count),
    )
    return {"users": user_count, "posts": post_count, "comments": comment_count}
    # 总耗时 0.1s（三个查询同时跑，取最慢的那个）
\`\`\`

> **避坑**：同步的 SQLAlchemy session 不能在多个线程并发用！上面例子要给每个查询开独立 session，或者用 \`async def\` + \`AsyncSession\`。否则会报 "Session is already in use"。

**用 AsyncSession（推荐）**：

\`\`\`python
# app/core/database.py（异步版）
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

# 异步引擎，用 aiosqlite 驱动
async_engine = create_async_engine("sqlite+aiosqlite:///./blog.db")
AsyncSessionLocal = async_sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)

# 依赖
async def get_async_db():
    async with AsyncSessionLocal() as db:
        yield db
\`\`\`

\`\`\`python
# 异步路由
from sqlalchemy import select

@router.get("/dashboard")
async def dashboard(db: AsyncSession = Depends(get_async_db)):
    # 三个查询并发执行
    user_q = select(User).offset(0).limit(0)  # 只 count
    post_q = select(Post)
    comment_q = select(Comment)
    # gather 并发
    import asyncio
    user_count, post_count = await asyncio.gather(
        db.scalar(select(func.count()).select_from(User)),
        db.scalar(select(func.count()).select_from(Post)),
    )
    return {"users": user_count, "posts": post_count}
\`\`\`

### 64.6 响应压缩和连接池调优（Demo 5）

**1. Gzip 压缩**：响应体大时，压缩能省 70% 带宽。

\`\`\`python
# app/main.py
from fastapi.middleware.gzip import GZipMiddleware

# 响应超过 1000 字节就压缩
app.add_middleware(GZipMiddleware, minimum_size=1000)
\`\`\`

> **怎么想**：压缩用 CPU 换带宽。CPU 够、带宽紧就开。文本类（JSON/HTML）压缩效果好（70%+），图片/视频已经压缩过，再压效果差。

**2. 连接池调优**：

\`\`\`python
# app/core/database.py
from sqlalchemy import create_engine

engine = create_engine(
    settings.database_url,
    # 连接池大小：常驻连接数。太小请求要排队等连接，太大数据库扛不住
    pool_size=10,
    # 连接池最大上限：突发流量时能临时扩到这个数
    max_overflow=20,
    # 连接超时：从池子拿连接等多久就报错（秒）
    pool_timeout=30,
    # 连接回收：连接活多久自动重建（秒）。防止数据库踢掉旧连接
    pool_recycle=1800,
    # 预执行 ping：每次拿连接前 ping 一下，避免拿到死连接
    pool_pre_ping=True,
)
\`\`\`

**怎么定 pool_size**：经验值 \`2 * CPU 核数 + 1\`。但实际要看数据库能扛多少连接（Postgres 默认 100，MySQL 默认 151），所有服务的 pool_size 加起来不能超过数据库上限。

> **避坑**：连接池满了会报 \`TimeoutError: QueuePool limit of size X overflow Y reached\`。原因通常是：连接没释放（session 没 close）、慢查询占着连接、并发太高。用 \`pool_pre_ping=True\` 避免死连接。

**3. HTTP 客户端连接池**（调外部 API 时）：

\`\`\`python
# 错误：每次请求新建 client，每次都要 TCP 握手
@app.get("/proxy")
async def proxy():
    # 每次请求都新建 AsyncClient，相当于每次都 TCP 握手，慢
    async with httpx.AsyncClient() as client:  # 每次新建
        r = await client.get("http://api.example.com/data")
    return r.json()

# 正确：复用 client，连接池保持长连接
# 全局创建一次（在模块加载时创建，所有请求复用）
# httpx.Timeout(5.0) 设置超时 5 秒
# httpx.Limits(max_connections=100, max_keepalive_connections=20) 配置连接池
#   max_connections: 最大连接数
#   max_keepalive_connections: 最大保活连接数（长连接）
http_client = httpx.AsyncClient(
    timeout=httpx.Timeout(5.0),
    limits=httpx.Limits(max_connections=100, max_keepalive_connections=20),
)

# 应用关闭时关闭客户端，释放连接
@app.on_event("shutdown")
async def close_client():
    await http_client.aclose()

@app.get("/proxy")
async def proxy():
    # 复用全局 client，连接池里的长连接直接发请求，省掉握手
    r = await http_client.get("http://api.example.com/data")
    return r.json()
\`\`\`

### 64.7 压力测试（Demo 6：locust + wrk）

**优化前先测，优化后对比**——没有数据就是瞎优化。

**wrk**（简单快速）：

\`\`\`bash
# 装 wrk（Linux/Mac：brew install wrk；Windows 用 WSL）
# 4 线程，100 连接，跑 30 秒
wrk -t4 -c100 -d30s http://localhost:8000/api/v1/posts

# 输出：
# Requests/sec:  1500.32   ← 每秒处理 1500 个请求
# Latency:        8.32ms    ← 平均延迟
\`\`\`

**locust**（Python 写脚本，灵活）：

\`\`\`bash
pip install locust
\`\`\`

\`\`\`python
# locustfile.py
# 从 locust 导入 HttpUser（虚拟用户基类）、task（任务装饰器）、between（随机等待）
from locust import HttpUser, task, between

# BlogUser 继承 HttpUser，表示一个虚拟用户
class BlogUser(HttpUser):
    # 每个请求间隔 1-3 秒（模拟真实用户思考时间）
    wait_time = between(1, 3)

    # @task(3) 权重 3：这个任务被执行的概率最高
    @task(3)  # 权重 3：最常做
    def list_posts(self):
        # self.client 类似 requests.Session，自动带 cookie
        self.client.get("/api/v1/posts")

    @task(1)  # 权重 1
    def get_post(self):
        self.client.get("/api/v1/posts/1")

    @task(2)
    def search(self):
        self.client.get("/api/v1/posts?keyword=python")

    # on_start 在每个虚拟用户启动时执行一次（类似 setup）
    def on_start(self):
        # 模拟登录，拿 token
        r = self.client.post("/api/v1/auth/login", json={
            "email": "a@b.com", "password": "123456"
        })
        self.token = r.json()["access_token"]
        # 把 token 加到后续请求的 header 里
        self.client.headers.update({"Authorization": f"Bearer {self.token}"})
\`\`\`

\`\`\`bash
# 启动 locust Web 界面
locust -f locustfile.py
# 访问 http://localhost:8089，设置并发用户数和每秒启动数
\`\`\`

**怎么读结果**：

- **RPS（Requests/sec）**：越高越好；
- **P50/P95/P99 延迟**：P99 = 99% 的请求在多少 ms 内完成。看 P99 比看平均值有意义（平均值会被掩盖尖刺）；
- **失败率**：> 0% 说明服务扛不住了。

**优化前后对比示例**：

| 场景 | 优化前 | 优化后 | 提升 |
| --- | --- | --- | --- |
| 文章列表（无缓存） | 500 RPS | — | — |
| 文章列表（加缓存） | 500 RPS | 5000 RPS | 10x |
| Dashboard（串行） | 200 RPS | — | — |
| Dashboard（并发） | 200 RPS | 550 RPS | 2.7x |
| 文章详情（N+1） | 100 RPS | — | — |
| 文章详情（joinedload） | 100 RPS | 450 RPS | 4.5x |

### 64.8 完整优化实战（Demo 7：综合优化）

把前面的优化全用上，改造博客列表接口：

\`\`\`python
# app/api/v1/posts.py（优化版）
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload, joinedload
from app.core.deps import get_db, get_current_user
from app.core.cache import cache_get, cache_set, cache_delete
from app.crud.post import post_crud
from app.models.user import User
from app.models.post import Post
from app.schemas.post import PostCreate, PostOut, PostList
from app.utils.pagination import pagination_params

router = APIRouter(prefix="/posts", tags=["文章"])

@router.get("", response_model=PostList)
def list_posts(
    keyword: str | None = None,
    tag_id: int | None = None,
    paging: dict = Depends(pagination_params),
    db: Session = Depends(get_db),
):
    # 1. 缓存层：先查缓存
    cache_key = f"posts:list:{paging['page']}:{paging['size']}:{keyword}:{tag_id}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    # 2. 数据库层：用 selectinload 预加载作者和标签，避免 N+1
    skip = (paging["page"] - 1) * paging["size"]
    q = db.query(Post).options(
        joinedload(Post.author),       # 作者用 JOIN（多对一）
        selectinload(Post.tags),       # 标签用 IN（多对多）
    )
    if keyword:
        q = q.filter(Post.title.ilike(f"%{keyword}%"))
    if tag_id:
        q = q.filter(Post.tags.any(id=tag_id))
    q = q.order_by(Post.created_at.desc())

    total = q.count()
    # 3. 只查需要的字段（PostOut 里不要正文，就别查 content）
    items = q.offset(skip).limit(paging["size"]).all()
    pages = (total + paging["size"] - 1) // paging["size"]
    result = {"items": items, "total": total, "page": paging["page"], "size": paging["size"], "pages": pages}

    # 4. 写缓存
    cache_set(cache_key, result, ttl=300)
    return result

# 写操作要清缓存
@router.post("", response_model=PostOut, status_code=201)
def create_post(body: PostCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = Post(title=body.title, content=body.content, author_id=current_user.id)
    db.add(post)
    db.commit()
    db.refresh(post)
    # 清列表缓存（用 SCAN 批量删 key）
    from app.core.cache import redis_client
    for key in redis_client.scan_iter("posts:list:*"):
        redis_client.delete(key)
    return post
\`\`\`

**main.py 加压缩中间件**：

\`\`\`python
# app/main.py
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
\`\`\`

**连接池调优**：

\`\`\`python
engine = create_engine(
    settings.database_url,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=1800,
)
\`\`\`

### 64.9 常见错误与避坑指南

1. **盲目加缓存**：没测就加缓存，结果瓶颈在 CPU 不在 DB，缓存白加。**先测再优化**。
2. **缓存没清**：写了新数据但缓存没删，用户看不到。写操作必须配套清缓存。
3. **缓存雪崩**：所有缓存同时过期，请求全打到 DB。给 TTL 加随机抖动（\`ttl + random(0, 60)\`）。
4. **缓存穿透**：查一个不存在的 key，每次都打 DB。用布隆过滤器或缓存空值。
5. **N+1 没根治**：以为用了 joinedload 就没事，结果某个关联字段忘了加，还是 N+1。用 \`echo=True\` 看 SQL 日志确认。
6. **异步阻塞事件循环**：异步路由里调同步 DB 操作，整个服务卡住。用 \`run_in_threadpool\` 或换 AsyncSession。
7. **连接池配置不当**：pool_size 太小请求排队，太大数据库拒绝连接。监控 \`pool.checkedout\` 看使用率。
8. **过度优化**：一个内部工具 QPS 才 10，花一天优化到 1000，毫无意义。**优化要算投入产出比**。
9. **只看平均值**：平均延迟 50ms，但 P99 是 2s，说明有 1% 的用户等 2 秒。**看 P99/P95**。
10. **生产环境开 echo=True**：SQL 日志打满磁盘，还拖慢性能。生产必须关。

### 64.10 小结与全教程结语

性能优化的核心是"测量→定位→优化→验证"循环。工具用 cProfile/py-spy 找瓶颈，数据库加索引+治 N+1，缓存用 Redis，并发用 asyncio.gather，压缩用 GZip，压测用 locust/wrk。**每一步都要数据说话**。

---

**全教程结语**：

到这里，FastAPI 应用开发实战教程就全部结束了。16 批共 64 章，从最基础的"FastAPI 是什么"到完整的实战项目，我们走过了：

- **基础篇**：路由、请求响应、Pydantic 校验、依赖注入
- **进阶篇**：数据库、认证、中间件、异常处理
- **高级篇**：WebSocket、后台任务、生命周期、测试
- **部署篇**：Gunicorn、Docker、Nginx、CI/CD
- **实战篇**：REST 项目、GraphQL、微服务、性能优化

FastAPI 的设计哲学是"用 Python 的类型注解做契约，让框架替你处理样板代码"。掌握它之后，你会发现写 API 从"体力活"变成"声明式表达"——你描述"接口长什么样"，框架负责"怎么实现"。

**接下来怎么继续提升**：

1. **读源码**：FastAPI 源码不长，Starlette + Pydantic 的组合，读完对 ASGI 有更深理解；
2. **做项目**：教程只是入门，真正成长靠做真实项目。把博客系统扩展成能上线的产品；
3. **学生态**：Alembic（数据库迁移）、Celery（任务队列）、Sentry（错误监控）这些是生产标配；
4. **看社区**：FastAPI 作者 Sebastián Ramírez 在 GitHub Discussions 很活跃，很多最佳实践在那讨论。

祝你写出又快又稳的 API。下个项目见！
`,
  },
];
