// =============================================================
// Python Web 后端开发教程 - 第 4 批章节（实战与部署篇，共 5 章）
// -------------------------------------------------------------
// 本文件是 Python Web 后端教程的最后 5 章，包含完整的"博客系统 API"
// 实战项目 + 测试 + 部署 + 进阶话题。
//
// 技术栈：Python 3.11+ / FastAPI 0.110+ / SQLAlchemy 2.0+ /
//         pytest / Docker / Uvicorn / PostgreSQL(asyncpg)
//
// 本批包含 5 章：
//   1. pyweb-blog-project : 博客系统实战-项目搭建与文章模块
//   2. pyweb-blog-user    : 博客系统实战-用户与评论模块
//   3. pyweb-testing      : 测试-pytest 与 TestClient
//   4. pyweb-deploy       : 部署-Docker 与生产环境
//   5. pyweb-advanced     : 进阶话题与学习路线
//
// 格式约定：
//   - content 是反引号模板字符串
//   - content 内部三反引号转义为 \`\`\`，内联反引号转义为 \`
//   - group 统一为"实战与部署"
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：博客系统实战-项目搭建与文章模块
  // =========================================================
  {
    id: "pyweb-blog-project",
    group: "实战与部署",
    icon: "📝",
    title: "博客系统实战：项目搭建与文章模块",
    content: `
# 博客系统实战：项目搭建与文章模块

经过前面章节的学习，我们已经掌握了 FastAPI、SQLAlchemy、Pydantic、认证等核心知识。从本章开始，我们将把这些知识整合起来，构建一个**完整的博客系统 API**。这个项目会贯穿接下来的两章，覆盖需求分析、数据库设计、项目分层、CRUD 实现、用户系统、评论系统、权限控制等真实业务场景。本章先完成项目骨架与文章模块。

## 一、项目需求分析

### 1.1 功能需求

我们要实现的博客系统包含以下核心功能模块：

| 模块 | 功能点 | 优先级 |
|------|--------|--------|
| 用户系统 | 注册、登录、获取/更新个人资料 | P0 |
| 文章系统 | 发布、编辑、删除、列表（分页+搜索）、详情 | P0 |
| 评论系统 | 发表评论、嵌套回复、删除评论、点赞 | P1 |
| 关注系统 | 关注用户、取关、关注列表、粉丝列表 | P1 |
| 标签系统 | 文章打标签、按标签筛选文章 | P2 |
| 权限控制 | 只能修改/删除自己的内容，管理员可管理全部 | P0 |

### 1.2 非功能需求

- **性能**：列表接口响应 < 200ms，支持分页避免全表扫描。
- **安全**：密码加密存储，JWT 鉴权，SQL 注入防护（ORM 参数化查询）。
- **可维护性**：router/service/model 三层分层，单一职责。
- **可测试性**：依赖注入便于 mock，测试数据库隔离。
- **可部署性**：Docker 化，环境变量配置，12-Factor App 规范。

### 1.3 技术选型

| 层次 | 技术选型 | 理由 |
|------|----------|------|
| Web 框架 | FastAPI 0.110+ | 异步高性能、自动文档、类型安全 |
| ORM | SQLAlchemy 2.0+ | 异步支持成熟、类型推断好 |
| 数据库 | PostgreSQL 15+ | 生产级关系型数据库 |
| 数据库驱动 | asyncpg | 异步高性能 PG 驱动 |
| 数据校验 | Pydantic v2 | 与 FastAPI 深度集成 |
| 认证 | python-jose + passlib | JWT + bcrypt 密码哈希 |
| 配置管理 | pydantic-settings | 类型安全的环境变量管理 |
| 迁移工具 | Alembic | SQLAlchemy 官方迁移工具 |
| 测试 | pytest + httpx | 异步测试支持好 |

## 二、数据库设计

### 2.1 ER 关系图

博客系统核心实体关系如下：

\`\`\`text
┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │     │  Article │     │   Tag    │
│──────────│     │──────────│     │──────────│
│ id (PK)  │◄──┐ │ id (PK)  │ ┌──►│ id (PK)  │
│ email    │   └─│ author_id│ │   │ name     │
│ username │     │ title    │ │   └──────────┘
│ password │     │ content  │ │        ▲
│ bio      │     │ status   │ │        │
│ created  │     │ created  │ │  article_tags
└──────────┘     └──────────┘ │  (多对多关联)
     ▲                ▲       │        │
     │                │       └────────┘
     │            ┌───┴────┐
     │            │Comment │
     │            │────────│
     └────────────│user_id │
                  │article_│
                  │  id    │
                  │parent_ │
                  │  id    │
                  │content │
                  └────────┘
\`\`\`

### 2.2 表结构详细设计

| 表名 | 主要字段 | 索引 | 说明 |
|------|----------|------|------|
| users | id, email, username, hashed_password, bio, avatar, is_active, created_at | email(唯一), username(唯一) | 用户表 |
| articles | id, author_id, title, summary, content, status, view_count, created_at, updated_at | author_id, created_at, status | 文章表 |
| comments | id, article_id, user_id, parent_id, content, like_count, created_at | article_id, user_id, parent_id | 评论表（自引用支持嵌套） |
| tags | id, name, created_at | name(唯一) | 标签表 |
| article_tags | article_id, tag_id | (article_id, tag_id)联合唯一 | 文章-标签多对多关联 |
| follows | follower_id, followed_id, created_at | (follower_id, followed_id)联合唯一 | 用户关注关系 |

## 三、项目目录结构

我们采用经典的**分层架构**，将路由、业务逻辑、数据访问分离：

\`\`\`text filename="项目目录结构"
blog-api/
├── app/                      # 应用主目录
│   ├── __init__.py
│   ├── main.py               # FastAPI 应用入口
│   ├── config.py             # 配置管理（pydantic-settings）
│   ├── database.py           # 数据库连接与 Session
│   ├── dependencies.py       # 全局依赖（认证、分页等）
│   ├── models/               # SQLAlchemy 数据模型
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── article.py
│   │   ├── comment.py
│   │   └── tag.py
│   ├── schemas/              # Pydantic 请求/响应模型
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── article.py
│   │   ├── comment.py
│   │   └── common.py         # 通用 schema（分页、响应包装）
│   ├── routers/              # API 路由
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── articles.py
│   │   ├── comments.py
│   │   └── tags.py
│   ├── services/             # 业务逻辑层
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   ├── article_service.py
│   │   └── comment_service.py
│   ├── core/                 # 核心工具
│   │   ├── __init__.py
│   │   ├── security.py       # 密码哈希、JWT 生成/验证
│   │   └── exceptions.py     # 自定义异常
│   └── utils/                # 辅助工具
│       ├── __init__.py
│       └── pagination.py
├── alembic/                  # 数据库迁移
│   ├── versions/
│   └── env.py
├── tests/                    # 测试目录
│   ├── __init__.py
│   ├── conftest.py           # pytest fixtures
│   ├── test_articles.py
│   └── test_auth.py
├── alembic.ini
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
\`\`\`

### 3.1 为什么要分层

| 分层方式 | 优点 | 缺点 |
|----------|------|------|
| 单文件（所有代码堆在一起） | 简单，适合 demo | 无法维护，无法测试 |
| Router 直接操作 Model | 减少一层 | 业务逻辑散落在路由中 |
| **Router → Service → Model** | 职责清晰，可测试 | 代码量稍多 |
| DDD（领域驱动） | 适合复杂业务 | 过度设计 |

对于中等规模项目，**Router → Service → Model** 三层是最务实的选择：Router 只做参数校验和响应组装，Service 处理业务逻辑，Model 负责数据持久化。

## 四、配置管理

使用 \`pydantic-settings\` 实现类型安全的配置管理，支持从环境变量和 \`.env\` 文件读取：

\`\`\`python filename="app/config.py"
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置，从环境变量和 .env 文件读取"""

    # 数据库配置
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/blog"
    DATABASE_ECHO: bool = False  # 是否打印 SQL 日志

    # JWT 配置
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # Token 有效期：1 天

    # 应用配置
    APP_NAME: str = "Blog API"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # 分页默认值
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    # CORS 配置
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# 全局配置单例
settings = Settings()
\`\`\`

\`\`\`bash filename=".env.example"
# 复制此文件为 .env 并修改配置
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/blog
SECRET_KEY=your-super-secret-key-here
DEBUG=True
\`\`\`

## 五、数据库连接与会话管理

使用 SQLAlchemy 2.0 的异步 API，通过依赖注入管理 Session 生命周期：

\`\`\`python filename="app/database.py"
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


# 声明式基类：所有 Model 继承自 Base
class Base(DeclarativeBase):
    pass


# 异步引擎：连接池大小根据并发量调整
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DATABASE_ECHO,
    pool_size=10,        # 连接池常驻连接数
    max_overflow=20,     # 超出 pool_size 后最多额外创建的连接
    pool_pre_ping=True,  # 使用连接前先 ping，防止使用已断开的连接
)

# 异步 Session 工厂
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # commit 后对象不过期，避免异步访问触发额外查询
)


async def get_db() -> AsyncSession:
    """数据库 Session 依赖，每个请求一个 Session"""
    async with async_session() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
\`\`\`

\`expire_on_commit=False\` 是异步 SQLAlchemy 的常见配置。默认情况下 commit 后对象会过期，下次访问属性会触发懒加载——但异步上下文中懒加载会报错，所以关闭它。

## 六、数据库模型定义

### 6.1 用户模型

\`\`\`python filename="app/models/user.py"
import uuid
from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    """用户表"""
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    bio: Mapped[str | None] = mapped_column(String(500), default=None)
    avatar: Mapped[str | None] = mapped_column(String(500), default=None)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # 关系：一个用户有多篇文章
    articles = relationship("Article", back_populates="author", cascade="all, delete-orphan")
    # 关系：一个用户有多条评论
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
\`\`\`

### 6.2 文章模型

\`\`\`python filename="app/models/article.py"
import uuid
from datetime import datetime

from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Article(Base):
    """文章表"""
    __tablename__ = "articles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    author_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    summary: Mapped[str | None] = mapped_column(String(500), default=None)
    content: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="draft")  # draft/published
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # 关系
    author = relationship("User", back_populates="articles")
    comments = relationship("Comment", back_populates="article", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary="article_tags", back_populates="articles")

    # 复合索引：按状态+创建时间查询（首页文章列表常用）
    __table_args__ = (
        Index("idx_status_created", "status", "created_at"),
    )
\`\`\`

### 6.3 标签模型与多对多关联

\`\`\`python filename="app/models/tag.py"
import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, Table, Column, ForeignKey, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# 文章-标签多对多关联表
article_tags = Table(
    "article_tags",
    Base.metadata,
    Column("article_id", ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
    UniqueConstraint("article_id", "tag_id", name="uq_article_tag"),
)


class Tag(Base):
    """标签表"""
    __tablename__ = "tags"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    articles = relationship("Article", secondary=article_tags, back_populates="tags")
\`\`\`

## 七、Schema 定义（Pydantic 模型）

Schema 用于请求参数校验和响应序列化，与数据库 Model 分离，避免内部字段（如密码）意外暴露：

\`\`\`python filename="app/schemas/article.py"
import uuid
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


# ---------- 基础 Schema ----------
class ArticleBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="文章标题")
    summary: str | None = Field(None, max_length=500, description="摘要")
    content: str = Field(..., min_length=1, description="正文")
    status: str = Field("draft", pattern="^(draft|published)$", description="状态")


# ---------- 创建文章 ----------
class ArticleCreate(ArticleBase):
    tag_ids: list[uuid.UUID] = Field(default=[], description="标签 ID 列表")


# ---------- 更新文章 ----------
class ArticleUpdate(BaseModel):
    """所有字段可选，支持部分更新"""
    title: str | None = Field(None, min_length=1, max_length=200)
    summary: str | None = None
    content: str | None = None
    status: str | None = Field(None, pattern="^(draft|published)$")
    tag_ids: list[uuid.UUID] | None = None


# ---------- 响应 Schema ----------
class ArticleResponse(ArticleBase):
    id: uuid.UUID
    author_id: uuid.UUID
    view_count: int
    created_at: datetime
    updated_at: datetime
    tags: list["TagBrief"] = []

    model_config = {"from_attributes": True}  # 允许从 ORM 对象读取


class TagBrief(BaseModel):
    id: uuid.UUID
    name: str

    model_config = {"from_attributes": True}


# 解决前向引用
ArticleResponse.model_rebuild()
\`\`\`

\`model_config = {"from_attributes": True}\` 是 Pydantic v2 的写法（v1 是 \`orm_mode = True\`），允许 \`ArticleResponse.model_validate(orm_obj)\` 从 SQLAlchemy 对象直接构建。

## 八、文章 CRUD 完整实现

### 8.1 Service 层：业务逻辑

\`\`\`python filename="app/services/article_service.py"
import uuid
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.article import Article
from app.models.tag import Tag, article_tags
from app.schemas.article import ArticleCreate, ArticleUpdate


async def get_article_list(
    db: AsyncSession,
    *,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    status: str | None = None,
    author_id: uuid.UUID | None = None,
) -> tuple[list[Article], int]:
    """
    获取文章列表（分页+搜索+过滤）
    返回 (文章列表, 总数)
    """
    # 构建查询条件
    query = select(Article).options(selectinload(Article.tags))
    count_query = select(func.count(Article.id))

    # 状态过滤
    if status:
        query = query.where(Article.status == status)
        count_query = count_query.where(Article.status == status)

    # 作者过滤
    if author_id:
        query = query.where(Article.author_id == author_id)
        count_query = count_query.where(Article.author_id == author_id)

    # 关键词搜索（标题或摘要）
    if search:
        keyword = f"%{search}%"
        condition = or_(
            Article.title.ilike(keyword),
            Article.summary.ilike(keyword),
        )
        query = query.where(condition)
        count_query = count_query.where(condition)

    # 按创建时间倒序
    query = query.order_by(Article.created_at.desc())

    # 分页
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    # 执行查询
    result = await db.execute(query)
    articles = result.scalars().unique().all()

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    return articles, total


async def get_article_by_id(db: AsyncSession, article_id: uuid.UUID) -> Article | None:
    """获取文章详情（含标签）"""
    query = (
        select(Article)
        .options(selectinload(Article.tags), selectinload(Article.author))
        .where(Article.id == article_id)
    )
    result = await db.execute(query)
    return result.scalars().unique().one_or_none()


async def create_article(
    db: AsyncSession, article_in: ArticleCreate, author_id: uuid.UUID
) -> Article:
    """创建文章"""
    article = Article(
        title=article_in.title,
        summary=article_in.summary,
        content=article_in.content,
        status=article_in.status,
        author_id=author_id,
    )

    # 关联标签
    if article_in.tag_ids:
        tags_result = await db.execute(
            select(Tag).where(Tag.id.in_(article_in.tag_ids))
        )
        article.tags = tags_result.scalars().all()

    db.add(article)
    await db.commit()
    await db.refresh(article)
    return article


async def update_article(
    db: AsyncSession, article: Article, article_in: ArticleUpdate
) -> Article:
    """更新文章（部分更新）"""
    update_data = article_in.model_dump(exclude_unset=True)

    # 单独处理标签
    tag_ids = update_data.pop("tag_ids", None)

    for field, value in update_data.items():
        setattr(article, field, value)

    # 更新标签关联
    if tag_ids is not None:
        tags_result = await db.execute(select(Tag).where(Tag.id.in_(tag_ids)))
        article.tags = tags_result.scalars().all()

    await db.commit()
    await db.refresh(article)
    return article


async def delete_article(db: AsyncSession, article: Article) -> None:
    """删除文章"""
    await db.delete(article)
    await db.commit()


async def increment_view_count(db: AsyncSession, article_id: uuid.UUID) -> None:
    """增加浏览量（用 UPDATE 避免 race condition）"""
    await db.execute(
        Article.__table__.update()
        .where(Article.id == article_id)
        .values(view_count=Article.view_count + 1)
    )
    await db.commit()
\`\`\`

### 8.2 Router 层：API 路由

\`\`\`python filename="app/routers/articles.py"
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, get_pagination_params
from app.models.user import User
from app.schemas.article import ArticleCreate, ArticleUpdate, ArticleResponse
from app.schemas.common import PageResponse
from app.services import article_service

router = APIRouter(prefix="/articles", tags=["文章"])


@router.get("", response_model=PageResponse[ArticleResponse])
async def list_articles(
    db: AsyncSession = Depends(get_db),
    pagination: dict = Depends(get_pagination_params),
    search: str | None = Query(None, description="搜索关键词"),
    status_filter: str | None = Query(None, alias="status", description="状态过滤"),
):
    """获取文章列表（分页+搜索）"""
    articles, total = await article_service.get_article_list(
        db,
        page=pagination["page"],
        page_size=pagination["page_size"],
        search=search,
        status=status_filter,
    )
    return PageResponse(items=articles, total=total, page=pagination["page"], page_size=pagination["page_size"])


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """获取文章详情"""
    article = await article_service.get_article_by_id(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="文章不存在")
    # 异步增加浏览量
    await article_service.increment_view_count(db, article_id)
    return article


@router.post("", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
async def create_article(
    article_in: ArticleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建文章（需要登录）"""
    return await article_service.create_article(db, article_in, current_user.id)


@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: uuid.UUID,
    article_in: ArticleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新文章（只能更新自己的文章）"""
    article = await article_service.get_article_by_id(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="文章不存在")
    # 权限校验：只有作者才能修改
    if article.author_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="无权修改他人的文章")
    return await article_service.update_article(db, article, article_in)


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除文章（只能删除自己的文章）"""
    article = await article_service.get_article_by_id(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="文章不存在")
    if article.author_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="无权删除他人的文章")
    await article_service.delete_article(db, article)
\`\`\`

### 8.3 通用分页 Schema 与依赖

\`\`\`python filename="app/schemas/common.py"
from typing import Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class PageResponse(BaseModel, Generic[T]):
    """分页响应包装"""
    items: list[T]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        return (self.total + self.page_size - 1) // self.page_size
\`\`\`

\`\`\`python filename="app/utils/pagination.py"
from fastapi import Query
from app.config import settings


def get_pagination_params(
    page: int = Query(1, ge=1, description="页码，从 1 开始"),
    page_size: int = Query(settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE, description="每页数量"),
) -> dict:
    """分页参数依赖"""
    return {"page": page, "page_size": page_size}
\`\`\`

## 九、应用入口与路由组织

\`\`\`python filename="app/main.py"
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers import auth, users, articles, comments, tags


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：启动时建表（生产环境用 Alembic 迁移）"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    description="博客系统 API - FastAPI 实战项目",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由（统一 API 前缀）
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(users.router, prefix=settings.API_V1_PREFIX)
app.include_router(articles.router, prefix=settings.API_V1_PREFIX)
app.include_router(comments.router, prefix=settings.API_V1_PREFIX)
app.include_router(tags.router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["系统"])
async def health_check():
    """健康检查端点"""
    return {"status": "ok"}
\`\`\`

## 十、本章小结

本章我们从零搭建了博客系统 API 的骨架，重点掌握了：

1. **需求分析与数据库设计**：根据功能需求设计表结构，合理设置索引和外键。
2. **项目分层**：Router → Service → Model 三层架构，职责清晰。
3. **配置管理**：用 \`pydantic-settings\` 实现类型安全的环境变量配置。
4. **异步数据库**：SQLAlchemy 2.0 异步 Session 与依赖注入。
5. **CRUD 完整实现**：分页、搜索、过滤、权限校验一气呵成。

下一章我们将实现用户系统（注册登录、关注关系）和评论系统（嵌套回复、点赞），让博客系统真正"活"起来。
`,
  },

  // =========================================================
  // 第二章：博客系统实战-用户与评论模块
  // =========================================================
  {
    id: "pyweb-blog-user",
    group: "实战与部署",
    icon: "👤",
    title: "博客系统实战：用户与评论模块",
    content: `
# 博客系统实战：用户与评论模块

本章是博客系统实战的下半部分，我们将实现用户系统（注册、登录、资料管理、关注关系）和评论系统（嵌套回复、点赞）。这两个模块涉及认证鉴权、多对多关系、自引用关联、权限控制等真实业务中的高频难点。

## 一、安全模块：密码哈希与 JWT

在实现用户系统前，先完成底层的安全基础设施。

### 1.1 密码哈希

**永远不要明文存储密码**。使用 \`passlib\` 的 bcrypt 算法对密码进行单向哈希。bcrypt 自带盐值（salt），且可以通过 cost factor 调整计算开销，抵御暴力破解。

| 哈希算法 | 特点 | 适用场景 |
|----------|------|----------|
| MD5/SHA1 | 速度快、不安全 | 已淘汰，不可用于密码 |
| SHA256 | 速度快 | 文件校验，不适合密码 |
| bcrypt | 自带盐、可调 cost、慢哈希 | **密码存储首选** |
| argon2 | 抗 GPU/ASIC、更现代 | 新项目可选，bcrypt 更通用 |

\`\`\`python filename="app/core/security.py"
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt, JWTError

from app.config import settings

# 密码哈希上下文：bcrypt 算法
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """对明文密码进行哈希"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证明文密码与哈希是否匹配"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    """生成 JWT Token"""
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> str | None:
    """解码 JWT Token，返回 subject（用户 ID）"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
\`\`\`

### 1.2 JWT 认证依赖

\`\`\`python filename="app/dependencies.py"
import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.security import decode_access_token
from app.database import get_db
from app.models.user import User
from app.utils.pagination import get_pagination_params

# OAuth2 密码模式，tokenUrl 指向登录接口
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """从 JWT Token 解析当前登录用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user_id = decode_access_token(token)
    if not user_id:
        raise credentials_exception

    user = await db.get(User, uuid.UUID(user_id))
    if not user or not user.is_active:
        raise credentials_exception
    return user


async def get_current_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """要求当前用户是管理员"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="权限不足，需要管理员权限")
    return current_user
\`\`\`

## 二、用户认证模块

### 2.1 认证 Schema

\`\`\`python filename="app/schemas/user.py"
import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    """注册请求"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50, pattern="^[a-zA-Z0-9_]+$")
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError("密码必须包含至少一个大写字母")
        if not any(c.isdigit() for c in v):
            raise ValueError("密码必须包含至少一个数字")
        return v


class UserLogin(BaseModel):
    """登录请求"""
    username: str  # 支持用户名或邮箱
    password: str


class UserUpdate(BaseModel):
    """更新资料"""
    bio: str | None = Field(None, max_length=500)
    avatar: str | None = Field(None, max_length=500)
    username: str | None = Field(None, min_length=3, max_length=50)


class UserResponse(BaseModel):
    """用户信息响应（不含密码）"""
    id: uuid.UUID
    email: EmailStr
    username: str
    bio: str | None
    avatar: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """登录成功返回的 Token"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
\`\`\`

### 2.2 认证路由

\`\`\`python filename="app/routers/auth.py"
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password, create_access_token
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, TokenResponse

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """用户注册"""
    # 检查邮箱和用户名是否已存在
    existing = await db.execute(
        select(User).where(
            (User.email == user_in.email) | (User.username == user_in.username)
        )
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="邮箱或用户名已被注册")

    # 创建用户
    user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=hash_password(user_in.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # 直接返回 Token，注册后自动登录
    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token, user=user)


@router.post("/login", response_model=TokenResponse)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    """用户登录（支持用户名或邮箱）"""
    # 查询用户
    result = await db.execute(
        select(User).where(
            (User.username == user_in.username) | (User.email == user_in.username)
        )
    )
    user = result.scalars().first()

    # 验证密码（统一返回"用户名或密码错误"避免信息泄露）
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="账号已被禁用")

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token, user=user)
\`\`\`

### 2.3 用户资料路由

\`\`\`python filename="app/routers/users.py"
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, Follow
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["用户"])


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """获取当前登录用户信息"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    profile_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新当前用户资料"""
    if profile_in.username and profile_in.username != current_user.username:
        # 检查新用户名是否被占用
        existing = await db.execute(
            select(User).where(User.username == profile_in.username)
        )
        if existing.scalars().first():
            raise HTTPException(status_code=400, detail="用户名已被占用")
        current_user.username = profile_in.username

    if profile_in.bio is not None:
        current_user.bio = profile_in.bio
    if profile_in.avatar is not None:
        current_user.avatar = profile_in.avatar

    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_profile(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """获取指定用户的公开资料"""
    user = await db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user
\`\`\`

## 三、关注关系（多对多）

用户之间的关注关系是典型的**多对多**关系，且是**单向的**：A 关注 B 不代表 B 关注 A。

### 3.1 关注模型

\`\`\`python filename="app/models/user.py（追加）"
import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Follow(Base):
    """关注关系表（多对多关联表）"""
    __tablename__ = "follows"

    follower_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    followed_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("follower_id", "followed_id", name="uq_follow"),
    )


# 在 User 模型中追加关系
# following = relationship("User", secondary="follows",
#     primaryjoin="User.id==Follow.follower_id",
#     secondaryjoin="User.id==Follow.followed_id",
#     backref="followers")
\`\`\`

### 3.2 关注/取关 API

\`\`\`python filename="app/routers/users.py（追加关注路由）"
@router.post("/{user_id}/follow", status_code=204)
async def follow_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """关注指定用户"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="不能关注自己")

    target_user = await db.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="用户不存在")

    # 检查是否已关注（幂等：已关注则直接返回成功）
    existing = await db.execute(
        select(Follow).where(
            Follow.follower_id == current_user.id,
            Follow.followed_id == user_id,
        )
    )
    if not existing.scalars().first():
        follow = Follow(follower_id=current_user.id, followed_id=user_id)
        db.add(follow)
        await db.commit()
    return None  # 204 No Content


@router.delete("/{user_id}/follow", status_code=204)
async def unfollow_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """取消关注"""
    result = await db.execute(
        select(Follow).where(
            Follow.follower_id == current_user.id,
            Follow.followed_id == user_id,
        )
    )
    follow = result.scalars().first()
    if follow:
        await db.delete(follow)
        await db.commit()
    return None  # 幂等：未关注也返回成功


@router.get("/{user_id}/followers")
async def get_followers(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """获取粉丝列表"""
    result = await db.execute(
        select(User)
        .join(Follow, Follow.follower_id == User.id)
        .where(Follow.followed_id == user_id)
    )
    followers = result.scalars().all()
    return {"followers": [{"id": str(f.id), "username": f.username} for f in followers], "count": len(followers)}


@router.get("/{user_id}/following")
async def get_following(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """获取关注列表"""
    result = await db.execute(
        select(User)
        .join(Follow, Follow.followed_id == User.id)
        .where(Follow.follower_id == user_id)
    )
    following = result.scalars().all()
    return {"following": [{"id": str(f.id), "username": f.username} for f in following], "count": len(following)}
\`\`\`

关注接口设计为**幂等**：重复关注不会报错，重复取关也不会报错。这符合 HTTP 语义，也提升用户体验。

## 四、评论模块

评论模块的难点在于**嵌套回复**。一篇博客文章下有评论，评论下面可以有回复，回复下面还能再回复——形成树状结构。

### 4.1 评论树设计方案对比

| 方案 | 实现 | 优点 | 缺点 |
|------|------|------|------|
| **邻接表** | 每条评论记录 parent_id | 实现简单、直观 | 查询深层嵌套需要递归 |
| **路径枚举** | 记录完整路径如 "1/4/7" | 查询子树方便 | 路径长度有限制 |
| **嵌套集** | 记录左右边界 | 查询子树高效 | 插入/删除成本高 |
| **闭包表** | 单独表记录所有祖先-后代关系 | 查询灵活 | 存储冗余大 |

对于博客评论（通常 2-3 层），**邻接表**是最务实的选择。

### 4.2 评论模型

\`\`\`python filename="app/models/comment.py"
import uuid
from datetime import datetime

from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Comment(Base):
    """评论表（自引用支持嵌套回复）"""
    __tablename__ = "comments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    article_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("articles.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("comments.id", ondelete="CASCADE"), default=None, nullable=True
    )
    content: Mapped[str] = mapped_column(Text)
    like_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # 关系
    article = relationship("Article", back_populates="comments")
    user = relationship("User", back_populates="comments")
    # 自引用：父评论与子评论
    parent = relationship("Comment", remote_side="Comment.id", back_populates="replies")
    replies = relationship(
        "Comment",
        back_populates="parent",
        cascade="all, delete-orphan",
        order_by="Comment.created_at",  # 回复按时间正序
    )
\`\`\`

### 4.3 评论 Schema

\`\`\`python filename="app/schemas/comment.py"
import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    """创建评论"""
    content: str = Field(..., min_length=1, max_length=2000)
    parent_id: uuid.UUID | None = Field(None, description="父评论 ID（回复时传入）")


class CommentResponse(BaseModel):
    """评论响应（含嵌套回复）"""
    id: uuid.UUID
    article_id: uuid.UUID
    user_id: uuid.UUID
    content: str
    like_count: int
    created_at: datetime
    replies: list["CommentResponse"] = []  # 嵌套回复

    model_config = {"from_attributes": True}


class CommentBrief(BaseModel):
    """评论简要信息（不含回复）"""
    id: uuid.UUID
    content: str
    like_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


CommentResponse.model_rebuild()
\`\`\`

### 4.4 评论 Service 与 Router

\`\`\`python filename="app/services/comment_service.py"
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.comment import Comment


async def get_article_comments(db: AsyncSession, article_id: uuid.UUID) -> list[Comment]:
    """
    获取文章的评论树。
    只查询顶层评论（parent_id 为空），eager-load 所有子回复。
    """
    query = (
        select(Comment)
        .where(Comment.article_id == article_id, Comment.parent_id.is_(None))
        .options(selectinload(Comment.replies).selectinload(Comment.replies))
        .order_by(Comment.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().unique().all()


async def create_comment(
    db: AsyncSession,
    article_id: uuid.UUID,
    user_id: uuid.UUID,
    content: str,
    parent_id: uuid.UUID | None = None,
) -> Comment:
    """创建评论或回复"""
    # 如果是回复，校验父评论存在且属于同一篇文章
    if parent_id:
        parent = await db.get(Comment, parent_id)
        if not parent or parent.article_id != article_id:
            raise ValueError("父评论不存在或不属于该文章")

    comment = Comment(
        article_id=article_id,
        user_id=user_id,
        content=content,
        parent_id=parent_id,
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return comment
\`\`\`

\`\`\`python filename="app/routers/comments.py"
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.article import Article
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentResponse, CommentBrief
from app.services import comment_service

router = APIRouter(prefix="/articles/{article_id}/comments", tags=["评论"])


@router.get("", response_model=list[CommentResponse])
async def list_comments(article_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """获取文章评论树（含嵌套回复）"""
    # 校验文章存在
    article = await db.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="文章不存在")
    return await comment_service.get_article_comments(db, article_id)


@router.post("", response_model=CommentBrief, status_code=status.HTTP_201_CREATED)
async def create_comment(
    article_id: uuid.UUID,
    comment_in: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """发表评论（需要登录）"""
    article = await db.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="文章不存在")
    try:
        return await comment_service.create_comment(
            db, article_id, current_user.id, comment_in.content, comment_in.parent_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    article_id: uuid.UUID,
    comment_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除评论（只能删除自己的评论）"""
    comment = await db.get(Comment, comment_id)
    if not comment or comment.article_id != article_id:
        raise HTTPException(status_code=404, detail="评论不存在")

    # 权限：评论作者 或 文章作者（文章作者可删除评论区的评论）
    article = await db.get(Article, article_id)
    if comment.user_id != current_user.id and article.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权删除此评论")

    await db.delete(comment)  # 级联删除子回复
    await db.commit()


@router.post("/{comment_id}/like")
async def like_comment(
    article_id: uuid.UUID,
    comment_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """点赞评论（简化版：直接增加 like_count）"""
    comment = await db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="评论不存在")
    comment.like_count += 1
    await db.commit()
    return {"like_count": comment.like_count}
\`\`\`

## 五、权限控制总结

| 操作 | 权限要求 | 实现方式 |
|------|----------|----------|
| 浏览文章列表 | 无需登录 | 公开接口 |
| 创建文章 | 已登录 | \`Depends(get_current_user)\` |
| 修改文章 | 文章作者 或 管理员 | 路由内校验 \`article.author_id == current_user.id\` |
| 删除评论 | 评论作者 或 文章作者 | 路由内校验 |
| 管理用户 | 管理员 | \`Depends(get_current_superuser)\` |

权限控制的核心原则是**在路由层（而非前端）做校验**——前端校验只是体验优化，后端校验才是安全防线。

## 六、本章小结

本章完成了博客系统的用户与评论模块，重点掌握：

1. **安全模块**：bcrypt 密码哈希、JWT 生成与验证、OAuth2 密码模式。
2. **用户系统**：注册、登录、资料管理、密码强度校验。
3. **多对多关系**：关注关系的建表与查询，幂等接口设计。
4. **嵌套评论**：自引用邻接表方案、\`selectinload\` 预加载子回复、级联删除。
5. **权限控制**：基于当前用户身份的资源所有权校验。

至此，博客系统的核心功能已完成。下一章我们将学习如何用 pytest 对这些 API 进行全面测试。
`,
  },

  // =========================================================
  // 第三章：测试-pytest 与 TestClient
  // =========================================================
  {
    id: "pyweb-testing",
    group: "实战与部署",
    icon: "🧪",
    title: "测试：pytest 与 TestClient",
    content: `
# 测试：pytest 与 TestClient

测试是软件工程的基石。未经测试的代码就像没有安全带的汽车——平时看不出问题，一出事就是大事。本章我们用 pytest 为博客系统编写自动化测试，覆盖单元测试、集成测试、认证测试、异步测试等真实场景。

## 一、测试金字塔

测试金字塔是测试策略的经典模型，从底到顶分为三层：

| 层级 | 占比 | 速度 | 成本 | 测试内容 |
|------|------|------|------|----------|
| **单元测试** | 70% | 极快（ms 级） | 低 | 单个函数/类的逻辑 |
| **集成测试** | 20% | 中等（秒级） | 中 | 多模块协作（如 API + DB） |
| **端到端测试** | 10% | 慢（分钟级） | 高 | 完整用户流程 |

\`\`\`text
          /\\
         /E2E\\        ← 少而精，覆盖关键路径
        /------\\
       /集成测试\\      ← 测 API + 数据库
      /----------\\
     /  单元测试  \\    ← 大量、快速、隔离
    /______________\\
\`\`\`

**核心原则**：底层测试要多、要快、要独立；顶层测试要少、要稳、覆盖核心路径。如果倒过来（测试冰激凌），测试会又慢又脆。

## 二、pytest 基础

### 2.1 安装与配置

\`\`\`bash filename="安装测试依赖"
pip install pytest pytest-asyncio httpx
\`\`\`

\`\`\`ini filename="pytest.ini"
[pytest]
# 测试文件发现规则
python_files = test_*.py
python_classes = Test*
python_functions = test_*

# 异步测试配置
asyncio_mode = auto

# 测试路径
testpaths = tests

# 输出格式
addopts = -v --tb=short --strict-markers

# 标记注册
markers =
    slow: 标记慢测试
    integration: 标记集成测试
\`\`\`

### 2.2 第一个 pytest 测试

\`\`\`python filename="tests/test_basic.py"
# pytest 的核心思想：用 assert 语句断言，无需记忆 API

def add(a: int, b: int) -> int:
    return a + b


def test_add():
    """最简单的测试函数"""
    assert add(1, 2) == 3
    assert add(-1, 1) == 0
    assert add(0, 0) == 0


def test_add_type_error():
    """测试异常"""
    import pytest
    with pytest.raises(TypeError):
        add("1", 2)  # 字符串 + 数字会抛 TypeError
\`\`\`

pytest 的魅力在于**零样板代码**：不需要继承 TestCase 类，不需要 setUp/tearDown，一个 \`assert\` 就够了。

## 三、Fixture：测试前置准备

Fixture 是 pytest 的核心特性，用于管理测试的**前置准备和后置清理**。可以理解为"依赖注入"——把测试需要的资源（数据库连接、测试用户、HTTP 客户端）作为参数注入测试函数。

### 3.1 Fixture 基础

\`\`\`python filename="tests/test_fixture_basic.py"
import pytest


@pytest.fixture
def sample_user():
    """提供一个测试用户"""
    return {"id": 1, "username": "alice", "email": "alice@test.com"}


def test_user_username(sample_user):
    """fixture 作为参数注入"""
    assert sample_user["username"] == "alice"


# fixture 可以有返回值，也可以 yield（用于清理）
@pytest.fixture
def db_connection():
    """yield 模式：yield 前是 setup，yield 后是 teardown"""
    print("\\n[Setup] 连接数据库")
    conn = {"connected": True}
    yield conn  # 把 conn 交给测试
    print("\\n[Teardown] 关闭数据库连接")
    conn["connected"] = False


def test_db_query(db_connection):
    assert db_connection["connected"] is True
\`\`\`

### 3.2 Fixture 作用域

| 作用域 | 生命周期 | 适用场景 |
|--------|----------|----------|
| \`function\`（默认） | 每个测试函数 | 需要完全隔离的资源 |
| \`class\` | 每个测试类 | 同类共享、跨类隔离 |
| \`module\` | 每个测试文件 | 文件内共享的昂贵资源 |
| \`session\` | 整个测试会话 | 全局共享资源（如数据库引擎） |

## 四、博客系统测试实战

### 4.1 测试数据库与 conftest.py

\`conftest.py\` 是 pytest 的特殊文件，其中的 fixture 对同目录下所有测试自动可见，无需 import。

\`\`\`python filename="tests/conftest.py"
import asyncio
import uuid
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.database import Base, get_db
from app.main import app
from app.core.security import hash_password
from app.models.user import User
from app.models.article import Article
from app.config import settings


# ---------- 测试数据库引擎（内存 SQLite，每个测试函数重建） ----------
@pytest_asyncio.fixture(scope="function")
async def test_engine():
    """每个测试函数创建全新的内存数据库"""
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """测试用数据库 Session"""
    async_session = async_sessionmaker(test_engine, expire_on_commit=False)
    async with async_session() as session:
        yield session


# ---------- 覆盖 get_db 依赖，使用测试数据库 ----------
@pytest_asyncio.fixture(scope="function")
async def client(test_engine) -> AsyncGenerator[AsyncClient, None]:
    """异步 HTTP 测试客户端"""
    async_session = async_sessionmaker(test_engine, expire_on_commit=False)

    async def override_get_db():
        async with async_session() as session:
            yield session

    # 用测试数据库替换真实数据库
    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


# ---------- 测试数据 fixture ----------
@pytest_asyncio.fixture
async def test_user(db_session) -> User:
    """创建测试用户"""
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password=hash_password("Test1234"),
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def auth_token(client, test_user) -> str:
    """获取认证 Token"""
    response = await client.post(
        "/api/v1/auth/login",
        json={"username": "testuser", "password": "Test1234"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest_asyncio.fixture
async def auth_headers(auth_token) -> dict:
    """认证请求头"""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest_asyncio.fixture
async def test_article(db_session, test_user) -> Article:
    """创建测试文章"""
    article = Article(
        author_id=test_user.id,
        title="测试文章标题",
        summary="这是测试摘要",
        content="这是测试正文内容",
        status="published",
    )
    db_session.add(article)
    await db_session.commit()
    await db_session.refresh(article)
    return article
\`\`\`

### 4.2 认证 API 测试

\`\`\`python filename="tests/test_auth.py"
import pytest


@pytest.mark.asyncio
class TestAuth:
    """认证模块测试"""

    async def test_register_success(self, client):
        """测试注册成功"""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "username": "newuser",
                "password": "Password123",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["token_type"] == "bearer"
        assert "access_token" in data
        assert data["user"]["username"] == "newuser"

    async def test_register_duplicate_email(self, client, test_user):
        """测试重复邮箱注册失败"""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",  # 已存在
                "username": "another",
                "password": "Password123",
            },
        )
        assert response.status_code == 400
        assert "已被注册" in response.json()["detail"]

    async def test_register_weak_password(self, client):
        """测试弱密码被拒绝"""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "weak@example.com",
                "username": "weakuser",
                "password": "weak",  # 太短
            },
        )
        assert response.status_code == 422  # Pydantic 校验失败

    async def test_login_success(self, client, test_user):
        """测试登录成功"""
        response = await client.post(
            "/api/v1/auth/login",
            json={"username": "testuser", "password": "Test1234"},
        )
        assert response.status_code == 200
        assert "access_token" in response.json()

    async def test_login_wrong_password(self, client, test_user):
        """测试密码错误"""
        response = await client.post(
            "/api/v1/auth/login",
            json={"username": "testuser", "password": "WrongPass"},
        )
        assert response.status_code == 401
        assert "用户名或密码错误" in response.json()["detail"]

    async def test_login_with_email(self, client, test_user):
        """测试用邮箱登录"""
        response = await client.post(
            "/api/v1/auth/login",
            json={"username": "test@example.com", "password": "Test1234"},
        )
        assert response.status_code == 200

    async def test_get_me_without_token(self, client):
        """测试未认证访问受保护接口"""
        response = await client.get("/api/v1/users/me")
        assert response.status_code == 401

    async def test_get_me_with_token(self, client, auth_headers):
        """测试带 Token 访问"""
        response = await client.get("/api/v1/users/me", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["username"] == "testuser"
\`\`\`

### 4.3 文章 API 测试

\`\`\`python filename="tests/test_articles.py"
import pytest


@pytest.mark.asyncio
class TestArticles:
    """文章模块测试"""

    async def test_create_article_without_auth(self, client):
        """未登录不能创建文章"""
        response = await client.post(
            "/api/v1/articles",
            json={"title": "test", "content": "content"},
        )
        assert response.status_code == 401

    async def test_create_article_success(self, client, auth_headers):
        """登录后创建文章"""
        response = await client.post(
            "/api/v1/articles",
            json={
                "title": "我的第一篇文章",
                "content": "这是正文内容",
                "status": "published",
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        assert response.json()["title"] == "我的第一篇文章"
        assert response.json()["status"] == "published"

    async def test_list_articles(self, client, test_article):
        """获取文章列表"""
        response = await client.get("/api/v1/articles")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert len(data["items"]) >= 1

    async def test_list_articles_pagination(self, client, test_article):
        """测试分页"""
        response = await client.get("/api/v1/articles?page=1&page_size=10")
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["page_size"] == 10

    async def test_search_articles(self, client, test_article):
        """测试搜索"""
        response = await client.get("/api/v1/articles?search=测试")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    async def test_get_article_detail(self, client, test_article):
        """获取文章详情"""
        response = await client.get(f"/api/v1/articles/{test_article.id}")
        assert response.status_code == 200
        assert response.json()["title"] == test_article.title

    async def test_get_nonexistent_article(self, client):
        """获取不存在的文章"""
        import uuid
        response = await client.get(f"/api/v1/articles/{uuid.uuid4()}")
        assert response.status_code == 404

    async def test_update_own_article(self, client, auth_headers, test_article):
        """更新自己的文章"""
        response = await client.put(
            f"/api/v1/articles/{test_article.id}",
            json={"title": "修改后的标题"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["title"] == "修改后的标题"

    async def test_update_article_without_auth(self, client, test_article):
        """未登录不能更新"""
        response = await client.put(
            f"/api/v1/articles/{test_article.id}",
            json={"title": "hack"},
        )
        assert response.status_code == 401

    async def test_delete_own_article(self, client, auth_headers, test_article):
        """删除自己的文章"""
        response = await client.delete(
            f"/api/v1/articles/{test_article.id}",
            headers=auth_headers,
        )
        assert response.status_code == 204

    async def test_delete_article_not_found(self, client, auth_headers):
        """删除不存在的文章"""
        import uuid
        response = await client.delete(
            f"/api/v1/articles/{uuid.uuid4()}",
            headers=auth_headers,
        )
        assert response.status_code == 404
\`\`\`

## 五、Mock 与外部依赖隔离

当 Service 依赖外部服务（邮件、支付、第三方 API）时，测试中需要 Mock 这些依赖，避免真实调用。

\`\`\`python filename="tests/test_mock.py"
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.email_service import send_welcome_email
from app.routers.auth import register


@pytest.mark.asyncio
async def test_register_with_mocked_email(client, monkeypatch):
    """注册时 Mock 邮件发送"""
    # 用 monkeypatch 替换发送邮件函数
    mock_send = AsyncMock(return_value=True)
    monkeypatch.setattr("app.services.email_service.send_welcome_email", mock_send)

    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "mock@example.com",
            "username": "mockuser",
            "password": "Password123",
        },
    )
    assert response.status_code == 201
    # 验证 mock 被调用
    mock_send.assert_called_once()
    call_args = mock_send.call_args[0][0]
    assert call_args == "mock@example.com"


@pytest.mark.asyncio
async def test_external_api_with_mock():
    """Mock 外部 HTTP 调用"""
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: {"data": "mocked"}
        )
        # 调用依赖外部 API 的函数
        async with AsyncClient() as client:
            response = await client.get("https://api.example.com/data")
            assert response.json()["data"] == "mocked"
        mock_get.assert_called_once()
\`\`\`

## 六、测试覆盖率

覆盖率（Coverage）衡量测试执行了多少代码。常用工具是 \`pytest-cov\`。

\`\`\`bash filename="安装覆盖率工具"
pip install pytest-cov
\`\`\`

\`\`\`bash filename="运行覆盖率报告"
# 终端报告
pytest --cov=app --cov-report=term-missing

# HTML 详细报告（生成 htmlcov/ 目录）
pytest --cov=app --cov-report=html

# 设置最低覆盖率门槛
pytest --cov=app --cov-fail-under=80
\`\`\`

\`\`\`ini filename=".coveragerc"
[run]
source = app
omit =
    app/tests/*
    app/alembic/*
    */__init__.py

[report]
# 排除不需要统计的代码行
exclude_lines =
    pragma: no cover
    def __repr__
    raise NotImplementedError
    if __name__ == .__main__.:
    if TYPE_CHECKING:

# 最低覆盖率要求
fail_under = 80
show_missing = True
\`\`\`

### 覆盖率指标解读

| 指标 | 含义 | 目标 |
|------|------|------|
| 行覆盖率（Line） | 执行的代码行占比 | > 80% |
| 分支覆盖率（Branch） | 执行的条件分支占比 | > 70% |
| 函数覆盖率 | 被调用的函数占比 | > 90% |

**注意**：高覆盖率不等于高质量。100% 覆盖率只代表每行代码都执行过，不代表所有边界情况都测到了。覆盖率是必要条件，不是充分条件。

## 七、CI 集成

### 7.1 GitHub Actions 配置

\`\`\`yaml filename=".github/workflows/test.yml"
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.11", "3.12"]

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-asyncio httpx pytest-cov

      - name: Run tests
        env:
          DATABASE_URL: "sqlite+aiosqlite:///test.db"
          SECRET_KEY: "ci-test-secret"
        run: |
          pytest --cov=app --cov-report=xml --cov-fail-under=80

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        if: always()
        with:
          file: ./coverage.xml
\`\`\`

### 7.2 测试最佳实践总结

| 原则 | 说明 |
|------|------|
| **隔离性** | 每个测试独立运行，不依赖其他测试的执行顺序 |
| **幂等性** | 测试可以重复执行，结果一致 |
| **快速** | 单元测试 ms 级，集成测试不超过几秒 |
| **AAA 模式** | Arrange（准备）、Act（执行）、Assert（断言） |
| **一个测试一个断言重点** | 测试失败时能快速定位原因 |
| **测试名表达意图** | \`test_login_with_wrong_password_returns_401\` 而非 \`test_1\` |
| **测行为不测实现** | 不要断言私有方法调用，测公开接口的输出 |

## 八、本章小结

本章我们系统学习了 pytest 测试体系：

1. **测试金字塔**：单元测试为主、集成测试为辅、E2E 测试补充。
2. **Fixture 机制**：管理测试前置/后置，支持作用域和依赖注入。
3. **异步测试**：用 \`httpx.AsyncClient\` + \`ASGITransport\` 测试 FastAPI 异步接口。
4. **测试数据库隔离**：内存 SQLite + 依赖覆盖，每个测试函数独立。
5. **Mock 外部依赖**：\`monkeypatch\` 和 \`unittest.mock\` 隔离外部服务。
6. **覆盖率与 CI**：pytest-cov 统计覆盖率，GitHub Actions 自动化。

测试不是负担，而是**安全网**——有了它，你才敢放心地重构和迭代。下一章我们将把博客系统打包成 Docker 镜像，部署到生产环境。
`,
  },

  // =========================================================
  // 第四章：部署-Docker 与生产环境
  // =========================================================
  {
    id: "pyweb-deploy",
    group: "实战与部署",
    icon: "🚀",
    title: "部署：Docker 与生产环境",
    content: `
# 部署：Docker 与生产环境

开发环境跑通只是第一步，把应用安全、稳定地部署到生产环境才是真正的考验。本章我们将把博客系统容器化，配置 PostgreSQL 生产数据库、Nginx 反向代理、HTTPS、日志收集、健康检查，最终交付一个生产级部署方案。

## 一、为什么用 Docker

### 1.1 传统部署 vs 容器化部署

| 维度 | 传统部署 | Docker 部署 |
|------|----------|------------|
| 环境一致性 | "在我机器上能跑" | 开发/测试/生产完全一致 |
| 隔离性 | 进程级隔离，依赖可能冲突 | 容器级隔离，依赖完全独立 |
| 启动速度 | 分钟级（虚拟机） | 秒级（容器共享内核） |
| 资源占用 | 重（每个虚拟机一个完整 OS） | 轻（共享宿主机内核） |
| 扩缩容 | 手动配置新机器 | docker-compose scale / K8s |
| 版本回滚 | 复杂、易错 | 切换镜像标签即可 |

### 1.2 Docker 核心概念

| 概念 | 类比 | 说明 |
|------|------|------|
| **镜像（Image）** | 类（Class） | 只读模板，包含代码+依赖+环境 |
| **容器（Container）** | 实例（Instance） | 镜像的运行实例，可启停 |
| **Dockerfile** | 装配图纸 | 描述如何构建镜像 |
| **docker-compose** | 乐队指挥 | 编排多个容器协同工作 |
| **Registry** | 应用商店 | 存储和分发镜像（Docker Hub / 私有仓库） |

## 二、Dockerfile 编写

### 2.1 多阶段构建

多阶段构建是生产级 Dockerfile 的核心技巧：用大镜像编译，用小镜像运行，最终镜像只包含运行所需文件。

\`\`\`dockerfile filename="Dockerfile"
# =============================================================
# 阶段 1：构建阶段（安装依赖）
# =============================================================
FROM python:3.12-slim AS builder

# 设置工作目录
WORKDIR /build

# 系统依赖（编译 asyncpg 等 C 扩展需要）
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# 先复制依赖文件（利用 Docker 缓存层）
COPY requirements.txt .

# 安装依赖到指定目录（便于后续复制）
RUN pip install --no-cache-dir --user -r requirements.txt


# =============================================================
# 阶段 2：运行阶段（最终镜像）
# =============================================================
FROM python:3.12-slim AS runtime

# 安装运行时依赖（PostgreSQL 客户端库，不需要 gcc）
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 curl && \
    rm -rf /var/lib/apt/lists/*

# 创建非 root 用户运行应用（安全最佳实践）
RUN groupadd -r appuser && useradd -r -g appuser appuser

# 从 builder 阶段复制已安装的 Python 包
COPY --from=builder /root/.local /home/appuser/.local

# 复制应用代码
WORKDIR /app
COPY --chown=appuser:appuser . /app

# 切换用户
USER appuser

# 设置 Python 路径
ENV PATH=/home/appuser/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# 暴露端口
EXPOSE 8000

# 健康检查（每 30 秒检查一次）
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
    CMD curl -f http://localhost:8000/health || exit 1

# 启动命令（Gunicorn + Uvicorn worker）
CMD ["gunicorn", "app.main:app", \\
     "-w", "4", \\
     "-k", "uvicorn.workers.UvicornWorker", \\
     "-b", "0.0.0.0:8000", \\
     "--access-logfile", "-", \\
     "--error-logfile", "-"]
\`\`\`

### 2.2 Dockerfile 最佳实践

| 实践 | 理由 |
|------|------|
| 用 \`slim\` 或 \`alpine\` 基础镜像 | 减小镜像体积 |
| 多阶段构建 | 最终镜像不含编译工具 |
| \`.dockerignore\` 排除无关文件 | 避免无效缓存失效 |
| 先 COPY 依赖文件再 COPY 代码 | 利用缓存层加速构建 |
| 非 root 用户运行 | 安全最小权限原则 |
| \`PYTHONUNBUFFERED=1\` | 日志实时输出，不缓冲 |
| 合并 RUN 指令 | 减少镜像层数 |

\`\`\`text filename=".dockerignore"
__pycache__
*.pyc
*.pyo
.git
.gitignore
.env
.env.local
*.md
tests/
htmlcov/
.pytest_cache/
.mypy_cache/
venv/
.venv/
node_modules/
\`\`\`

## 三、requirements.txt 管理

\`\`\`text filename="requirements.txt"
# Web 框架
fastapi==0.111.0
uvicorn[standard]==0.30.1
gunicorn==22.0.0

# 数据库
sqlalchemy[asyncio]==2.0.30
asyncpg==0.29.0
alembic==1.13.1

# 数据校验
pydantic==2.7.1
pydantic-settings==2.2.1
email-validator==2.1.1

# 认证
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

# HTTP 客户端（用于调用外部 API）
httpx==0.27.0

# 测试（开发依赖，生产可移除）
pytest==8.2.0
pytest-asyncio==0.23.7
pytest-cov==5.0.0
\`\`\`

**版本锁定**：生产环境必须用 \`==\` 锁定版本，避免 \`pip install\` 安装到不兼容的新版本。更严格的方案是用 \`pip-compile\` 生成 \`requirements.lock\`，锁定所有间接依赖。

## 四、docker-compose 编排

\`\`\`yaml filename="docker-compose.yml"
version: "3.9"

services:
  # ---------- FastAPI 应用 ----------
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: blog-api
    restart: unless-stopped
    env_file:
      - .env.production
    environment:
      - DATABASE_URL=postgresql+asyncpg://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/\${POSTGRES_DB}
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./logs:/app/logs
    networks:
      - blog-network

  # ---------- PostgreSQL 数据库 ----------
  db:
    image: postgres:16-alpine
    container_name: blog-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: \${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER} -d \${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    ports:
      - "5432:5432"  # 生产环境建议移除，仅内部网络访问
    networks:
      - blog-network

  # ---------- Redis 缓存 ----------
  redis:
    image: redis:7-alpine
    container_name: blog-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - blog-network

  # ---------- Nginx 反向代理 ----------
  nginx:
    image: nginx:alpine
    container_name: blog-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
      - ./static:/usr/share/nginx/html/static:ro
    depends_on:
      - api
    networks:
      - blog-network

volumes:
  postgres_data:
  redis_data:

networks:
  blog-network:
    driver: bridge
\`\`\`

## 五、生产环境配置

### 5.1 环境变量

\`\`\`bash filename=".env.production"
# ---------- 数据库 ----------
POSTGRES_USER=blog_user
POSTGRES_PASSWORD=CHANGE_ME_TO_A_STRONG_PASSWORD
POSTGRES_DB=blog
DATABASE_URL=postgresql+asyncpg://blog_user:CHANGE_ME@db:5432/blog

# ---------- 应用 ----------
SECRET_KEY=GENERATE_A_RANDOM_64_CHAR_STRING
DEBUG=False
API_V1_PREFIX=/api/v1

# ---------- CORS ----------
CORS_ORIGINS=["https://blog.example.com","https://www.blog.example.com"]

# ---------- Redis ----------
REDIS_URL=redis://redis:6379/0

# ---------- 日志 ----------
LOG_LEVEL=INFO
\`\`\`

**安全要点**：
- \`.env.production\` **绝不**提交到 Git，加入 \`.gitignore\`。
- \`SECRET_KEY\` 用 \`python -c "import secrets; print(secrets.token_hex(32))"\` 生成。
- 生产环境 \`DEBUG=False\`，避免暴露错误详情。

### 5.2 生成密钥

\`\`\`python filename="生成安全密钥"
import secrets

# 生成 JWT SECRET_KEY（64 字符十六进制）
print("SECRET_KEY=" + secrets.token_hex(32))

# 生成 PostgreSQL 密码
print("POSTGRES_PASSWORD=" + secrets.token_urlsafe(24))
\`\`\`

## 六、Nginx 反向代理配置

Nginx 在生产架构中扮演**入口网关**的角色：接收外部请求，转发给后端 API，同时处理 HTTPS、静态文件、限流、压缩等。

\`\`\`nginx filename="nginx/nginx.conf"
worker_processes auto;
events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    # 日志格式
    log_format main '\$remote_addr - \$remote_user [\$time_local] '
                    '"\$request" \$status \$body_bytes_sent '
                    '"\$http_referer" "\$http_user_agent" '
                    'rt=\$request_time uct="\$upstream_connect_time" '
                    'urt="\$upstream_response_time"';

    access_log /var/log/nginx/access.log main;
    error_log  /var/log/nginx/error.log warn;

    # 性能优化
    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    keepalive_timeout 65;
    client_max_body_size 10m;  # 限制上传大小

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript;

    # 限流区域（每 IP 每秒 10 请求）
    limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=10r/s;

    # 上游 API 服务
    upstream blog_api {
        server api:8000;
        # 多实例负载均衡
        # server api2:8000 weight=1;
        # server api3:8000 weight=1;
        keepalive 32;
    }

    # ---------- HTTP -> HTTPS 重定向 ----------
    server {
        listen 80;
        server_name blog.example.com;

        # 健康检查端点（不需要 HTTPS）
        location /health {
            proxy_pass http://blog_api;
        }

        # 其余请求重定向到 HTTPS
        location / {
            return 301 https://\$host\$request_uri;
        }
    }

    # ---------- HTTPS 主服务 ----------
    server {
        listen 443 ssl http2;
        server_name blog.example.com;

        # SSL 证书
        ssl_certificate     /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;
        ssl_protocols       TLSv1.2 TLSv1.3;
        ssl_ciphers         HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache   shared:SSL:10m;
        ssl_session_timeout 10m;

        # 安全响应头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # 静态文件直接由 Nginx 服务（不经过 API）
        location /static/ {
            alias /usr/share/nginx/html/static/;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

        # API 反向代理
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;

            proxy_pass http://blog_api;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;

            # WebSocket 支持
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";

            # 超时设置
            proxy_connect_timeout 5s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # API 文档（生产环境可关闭）
        location /docs {
            # allow 10.0.0.0/8;   # 内网访问
            # deny all;
            proxy_pass http://blog_api;
        }
    }
}
\`\`\`

## 七、Uvicorn 与 Gunicorn

### 7.1 为什么需要 Gunicorn

| 工具 | 角色 | 特点 |
|------|------|------|
| **Uvicorn** | ASGI 服务器 | 单进程，异步性能好 |
| **Gunicorn** | 进程管理器 | 多进程管理、优雅重启、信号处理 |

生产环境用 **Gunicorn 管理 Uvicorn Worker**：Gunicorn 负责进程管理（fork 多个 worker、处理信号、优雅重启），Uvicorn Worker 负责实际的异步请求处理。

### 7.2 Worker 数量计算

\`\`\`text
推荐 Worker 数 = (2 × CPU 核数) + 1

例如 4 核服务器：workers = 2 × 4 + 1 = 9
\`\`\`

\`\`\`bash filename="启动脚本 start.sh"
#!/bin/bash
# 应用启动脚本

# 等待数据库就绪
echo "等待数据库启动..."
until pg_isready -h db -p 5432 -U "\${POSTGRES_USER}"; do
  sleep 2
done
echo "数据库已就绪"

# 执行数据库迁移
echo "执行数据库迁移..."
alembic upgrade head

# 启动应用
# CPU 核数自动计算
WORKERS=\$(python -c "import multiprocessing; print(2 * multiprocessing.cpu_count() + 1)")

echo "启动 Gunicorn，worker 数量: \$WORKERS"
exec gunicorn app.main:app \\
    -w "\${WORKERS}" \\
    -k uvicorn.workers.UvicornWorker \\
    -b 0.0.0.0:8000 \\
    --timeout 120 \\
    --graceful-timeout 30 \\
    --keep-alive 5 \\
    --max-requests 1000 \\
    --max-requests-jitter 100 \\
    --access-logfile - \\
    --error-logfile -
\`\`\`

\`--max-requests 1000\` 让 worker 处理 1000 个请求后自动重启，防止内存泄漏累积。\`--max-requests-jitter\` 添加随机偏移，避免所有 worker 同时重启。

## 八、日志收集

### 8.1 Python 日志配置

\`\`\`python filename="app/core/logging.py"
import logging
import sys
from app.config import settings


def setup_logging():
    """配置应用日志"""
    log_format = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"

    logging.basicConfig(
        level=settings.LOG_LEVEL,
        format=log_format,
        datefmt=date_format,
        handlers=[
            logging.StreamHandler(sys.stdout),  # 输出到 stdout（Docker 收集）
        ],
    )

    # 第三方库日志级别调低
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.DATABASE_ECHO else logging.WARNING
    )

    # 禁止传播，避免重复日志
    logging.getLogger("uvicorn").propagate = False
\`\`\`

### 8.2 结构化日志（JSON 格式）

生产环境推荐 JSON 格式日志，便于 ELK/Loki 等日志系统解析：

\`\`\`python filename="结构化日志示例"
import json
import logging
from datetime import datetime, timezone


class JsonFormatter(logging.Formatter):
    """JSON 格式日志 formatter"""
    def format(self, record):
        log_obj = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "line": record.lineno,
        }
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_obj, ensure_ascii=False)
\`\`\`

## 九、健康检查与优雅关闭

### 9.1 健康检查端点

\`\`\`python filename="app/main.py（追加健康检查）"
from sqlalchemy import text

@app.get("/health", tags=["系统"])
async def health_check(db: AsyncSession = Depends(get_db)):
    """健康检查：检查应用和数据库连接"""
    try:
        # 检查数据库连接
        await db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": str(e)},
        )


@app.get("/ready", tags=["系统"])
async def readiness_check():
    """就绪检查：应用是否准备好接收流量"""
    return {"status": "ready"}
\`\`\`

| 端点 | 用途 | 检查内容 |
|------|------|----------|
| \`/health\` | 存活探针 | 应用进程是否正常，数据库是否连通 |
| \`/ready\` | 就绪探针 | 是否能接收流量（如迁移完成后才 ready） |

\`\`\`text
K8s 探针配置概念：
  livenessProbe  -> /health   （失败则重启容器）
  readinessProbe -> /ready    （失败则从负载均衡移除）
\`\`\`

### 9.2 优雅关闭

\`\`\`python filename="app/main.py（优雅关闭）"
from contextlib import asynccontextmanager
import signal
import logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期"""
    logger.info("应用启动中...")
    # 启动时初始化连接池等
    yield
    # 关闭时清理资源
    logger.info("应用关闭中，等待请求处理完成...")
    await engine.dispose()
    logger.info("资源已清理，应用已关闭")


app = FastAPI(lifespan=lifespan)
\`\`\`

Gunicorn 收到 \`SIGTERM\` 时会停止接收新请求，等待 worker 处理完当前请求后再退出，这就是"优雅关闭"。\`--graceful-timeout\` 控制最大等待时间，超时后强制 kill。

## 十、部署流程

### 10.1 完整部署命令

\`\`\`bash filename="deploy.sh"
#!/bin/bash
set -e

echo "===== 1. 拉取最新代码 ====="
git pull origin main

echo "===== 2. 构建新镜像 ====="
docker-compose build --no-cache api

echo "===== 3. 备份数据库 ====="
docker-compose exec db pg_dump -U "\${POSTGRES_USER}" "\${POSTGRES_DB}" > backup_\$(date +%Y%m%d_%H%M%S).sql

echo "===== 4. 启动新容器（滚动更新）====="
docker-compose up -d --no-deps api

echo "===== 5. 执行数据库迁移 ====="
docker-compose exec api alembic upgrade head

echo "===== 6. 健康检查 ====="
sleep 5
if curl -f http://localhost:8000/health; then
    echo "部署成功！"
else
    echo "健康检查失败，回滚..."
    docker-compose up -d --no-deps api  # 回滚到上一个镜像
    exit 1
fi

echo "===== 7. 清理旧镜像 ====="
docker image prune -f
\`\`\`

### 10.2 常用运维命令

\`\`\`bash filename="运维命令速查"
# 查看服务状态
docker-compose ps

# 查看实时日志
docker-compose logs -f api

# 进入容器调试
docker-compose exec api bash

# 重启单个服务
docker-compose restart api

# 查看资源占用
docker stats

# 执行数据库迁移
docker-compose exec api alembic revision --autogenerate -m "add new table"
docker-compose exec api alembic upgrade head

# 数据库备份与恢复
docker-compose exec db pg_dump -U blog_user blog > backup.sql
cat backup.sql | docker-compose exec -T db psql -U blog_user blog
\`\`\`

## 十一、部署检查清单

| 检查项 | 说明 |
|--------|------|
| ☐ \`.env.production\` 不在 Git 中 | 敏感信息隔离 |
| ☐ \`SECRET_KEY\` 已生成随机值 | 不能用默认值 |
| ☐ \`DEBUG=False\` | 关闭调试模式 |
| ☐ HTTPS 证书已配置 | TLS 加密传输 |
| ☐ 数据库定期备份 | 防止数据丢失 |
| ☐ 日志收集已配置 | 便于排查问题 |
| ☐ 健康检查通过 | 服务正常运行 |
| ☐ 非 root 用户运行 | 最小权限 |
| ☐ 防火墙只开 80/443 | 不暴露数据库端口 |
| ☐ 限流已配置 | 防御 DDoS |

## 十二、本章小结

本章我们完成了博客系统从开发到生产的完整部署：

1. **Docker 多阶段构建**：小镜像、高安全、快构建。
2. **docker-compose 编排**：API + DB + Redis + Nginx 一体化。
3. **Nginx 反向代理**：HTTPS、限流、静态文件、安全头。
4. **Gunicorn + Uvicorn**：多进程管理 + 异步 worker。
5. **生产配置**：环境变量、日志、健康检查、优雅关闭。
6. **运维流程**：备份、迁移、滚动更新、回滚。

下一章作为本教程的收官，我们将讨论 WebSocket、缓存、限流、监控等进阶话题，并给出 Python Web 后端的完整学习路线。
`,
  },

  // =========================================================
  // 第五章：进阶话题与学习路线
  // =========================================================
  {
    id: "pyweb-advanced",
    group: "实战与部署",
    icon: "🎓",
    title: "进阶话题与学习路线",
    content: `
# 进阶话题与学习路线

恭喜你坚持到了最后一章！前面我们学习了 FastAPI 基础、SQLAlchemy ORM、认证授权、实战项目、测试和部署。本章作为收官，我们将探讨 WebSocket 实时通信、Redis 缓存、后台任务、限流、监控等进阶主题，帮助你从"能用"迈向"精通"。最后会给出一份完整的 Python Web 后端学习路线图。

## 一、后台任务

很多场景下，请求处理和副作用是异步的——比如用户注册后发送欢迎邮件，不需要让用户等邮件发完才返回。FastAPI 提供了 \`BackgroundTasks\` 处理这类轻量级异步任务。

### 1.1 Background Tasks vs Celery 对比

| 方案 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| **FastAPI BackgroundTasks** | 轻量、短时任务（发邮件、写日志） | 零依赖、API 简单 | 进程重启会丢失任务、无重试 |
| **Celery** | 重量、长时任务（视频转码、批量处理） | 持久化、重试、定时任务、监控 | 需要消息队列（Redis/RabbitMQ） |
| **ARQ** | 中量、异步任务 | 轻量、原生 async | 生态不如 Celery 成熟 |

**选择原则**：能用 BackgroundTasks 就别上 Celery，简单是最大的优势。只有当任务需要持久化、重试、定时调度时才引入 Celery。

### 1.2 Background Tasks 发邮件示例

\`\`\`python filename="app/routers/auth.py（追加邮件任务）"
import logging
from fastapi import BackgroundTasks
from app.services.email_service import send_welcome_email

logger = logging.getLogger(__name__)


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    user_in: UserCreate,
    background_tasks: BackgroundTasks,  # 注入后台任务
    db: AsyncSession = Depends(get_db),
):
    """注册并异步发送欢迎邮件"""
    # ... 创建用户逻辑 ...

    # 把发邮件任务加入后台队列，立即返回响应
    background_tasks.add_task(send_welcome_email, user.email, user.username)

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token, user=user)
\`\`\`

\`\`\`python filename="app/services/email_service.py"
import asyncio
import logging

logger = logging.getLogger(__name__)


async def send_welcome_email(email: str, username: str) -> None:
    """发送欢迎邮件（后台任务）"""
    try:
        # 模拟异步发送邮件
        await asyncio.sleep(2)  # 模拟 SMTP 耗时
        logger.info(f"欢迎邮件已发送至 {email}，用户名：{username}")
        # 实际项目用 aiosmtplib 发送：
        # async with aiosmtplib.SMTP(...) as smtp:
        #     await smtp.send_message(msg)
    except Exception as e:
        # 后台任务异常不会影响已返回的响应，但要记录日志
        logger.error(f"发送邮件失败: {email}, 错误: {e}")
\`\`\`

**注意**：BackgroundTasks 在响应返回**后**执行，且与请求在同一进程内。如果任务执行时间超过几秒，或需要保证不丢失，应该用 Celery。

### 1.3 Celery 架构简介

\`\`\`text
[FastAPI 应用] --提交任务--> [消息队列 Redis/RabbitMQ] --消费--> [Celery Worker]
                                       |
                                       v
                                 [结果后端 Redis]
\`\`\`

\`\`\`python filename="celery_app.py"
from celery import Celery

# 创建 Celery 实例
celery_app = Celery(
    "blog",
    broker="redis://redis:6379/1",   # 任务队列
    backend="redis://redis:6379/2",  # 结果存储
)

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def process_video(self, video_path: str):
    """视频转码任务（带重试）"""
    try:
        # 转码逻辑...
        pass
    except Exception as exc:
        # 失败自动重试，最多 3 次，间隔 60 秒
        raise self.retry(exc=exc)
\`\`\`

## 二、WebSocket 实时通信

HTTP 是请求-响应模型，服务端无法主动推送。WebSocket 提供全双工通信，适合实时通知、聊天、在线协作等场景。

### 2.1 WebSocket vs HTTP 轮询

| 方案 | 实时性 | 资源消耗 | 复杂度 |
|------|--------|----------|--------|
| HTTP 短轮询 | 差（秒级延迟） | 高（大量空请求） | 低 |
| HTTP 长轮询 | 中 | 中 | 中 |
| SSE（Server-Sent Events） | 好（单向推送） | 低 | 低 |
| **WebSocket** | 最好（双向） | 低 | 中 |

### 2.2 WebSocket 实时通知

\`\`\`python filename="app/routers/ws.py"
import json
import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict

router = APIRouter(tags=["WebSocket"])


class ConnectionManager:
    """WebSocket 连接管理器（生产环境用 Redis Pub/Sub 支持多实例）"""

    def __init__(self):
        # user_id -> set[WebSocket]，一个用户可能有多个连接（多设备）
        self.active_connections: Dict[str, set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        """接受连接并登记"""
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        await self.send_to_user(user_id, {
            "type": "system",
            "message": "连接成功"
        })

    def disconnect(self, websocket: WebSocket, user_id: str):
        """移除断开的连接"""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_to_user(self, user_id: str, data: dict):
        """向指定用户的所有连接推送消息"""
        if user_id in self.active_connections:
            message = json.dumps(data, ensure_ascii=False)
            dead = []
            for ws in self.active_connections[user_id]:
                try:
                    await ws.send_text(message)
                except Exception:
                    dead.append(ws)
            # 清理已断开的连接
            for ws in dead:
                self.active_connections[user_id].discard(ws)

    async def broadcast(self, data: dict):
        """广播给所有在线用户"""
        for user_id in self.active_connections:
            await self.send_to_user(user_id, data)


# 全局连接管理器
manager = ConnectionManager()


@router.websocket("/ws/notifications/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    """WebSocket 通知端点"""
    # 从 token 解析用户 ID（简化版，生产环境要验证 JWT）
    from app.core.security import decode_access_token
    user_id = decode_access_token(token)
    if not user_id:
        await websocket.close(code=4001, reason="认证失败")
        return

    await manager.connect(websocket, user_id)
    try:
        while True:
            # 接收客户端心跳/消息
            data = await websocket.receive_text()
            # 处理客户端消息（如心跳包）
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)


# 在文章模块中触发通知
async def notify_new_comment(article_author_id: str, comment_data: dict):
    """文章有新评论时通知作者"""
    await manager.send_to_user(article_author_id, {
        "type": "new_comment",
        "data": comment_data
    })
\`\`\`

### 2.3 前端连接示例

\`\`\`javascript filename="前端 WebSocket 客户端"
const ws = new WebSocket("ws://localhost:8000/ws/notifications/" + token);

ws.onopen = () => console.log("已连接");

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "new_comment") {
        // 显示通知
        new Notification("新评论", { body: data.data.content });
    }
};

ws.onclose = () => {
    console.log("连接断开，3 秒后重连...");
    setTimeout(connectWebSocket, 3000);
};

// 心跳保活
setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send("ping");
    }
}, 30000);
\`\`\`

## 三、Redis 缓存

缓存是性能优化的第一利器。把频繁访问、低频变更的数据缓存到 Redis，可以大幅减少数据库压力。

### 3.1 缓存策略

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| **Cache-Aside** | 先查缓存，未命中查 DB 并回填 | 通用场景 |
| **Write-Through** | 写入时同时更新缓存 | 需要强一致 |
| **Write-Behind** | 先写缓存，异步写 DB | 写密集场景 |
| **TTL 过期** | 设置过期时间 | 数据有时效性 |

### 3.2 Redis 缓存装饰器

\`\`\`python filename="app/core/cache.py"
import json
import functools
import logging
from typing import Callable
import redis.asyncio as redis

from app.config import settings

logger = logging.getLogger(__name__)

# 异步 Redis 连接池
redis_client = redis.from_url(
    settings.REDIS_URL,
    encoding="utf-8",
    decode_responses=True,
    max_connections=20,
)


def cached(key_prefix: str, expire: int = 300):
    """
    缓存装饰器：自动缓存异步函数的返回值
    :param key_prefix: 缓存 key 前缀
    :param expire: 过期时间（秒）
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # 生成缓存 key：前缀 + 参数哈希
            import hashlib
            cache_key = f"{key_prefix}:{hashlib.md5(str(kwargs).encode()).hexdigest()}"

            # 1. 先查缓存
            try:
                cached_data = await redis_client.get(cache_key)
                if cached_data:
                    logger.debug(f"缓存命中: {cache_key}")
                    return json.loads(cached_data)
            except Exception as e:
                logger.warning(f"Redis 读取失败: {e}")

            # 2. 缓存未命中，执行函数
            result = await func(*args, **kwargs)

            # 3. 回填缓存（序列化为 JSON）
            try:
                await redis_client.setex(
                    cache_key,
                    expire,
                    json.dumps(result, default=str, ensure_ascii=False)
                )
            except Exception as e:
                logger.warning(f"Redis 写入失败: {e}")

            return result
        return wrapper
    return decorator


async def invalidate_cache(key_prefix: str, **kwargs) -> None:
    """删除指定前缀的缓存"""
    import hashlib
    cache_key = f"{key_prefix}:{hashlib.md5(str(kwargs).encode()).hexdigest()}"
    try:
        await redis_client.delete(cache_key)
    except Exception as e:
        logger.warning(f"缓存删除失败: {e}")
\`\`\`

### 3.3 在文章 Service 中使用缓存

\`\`\`python filename="app/services/article_service.py（使用缓存）"
from app.core.cache import cached, invalidate_cache


@cached(key_prefix="article:detail", expire=600)  # 缓存 10 分钟
async def get_article_by_id(db: AsyncSession, article_id: uuid.UUID) -> dict | None:
    """获取文章详情（带缓存）"""
    query = (
        select(Article)
        .options(selectinload(Article.tags), selectinload(Article.author))
        .where(Article.id == article_id)
    )
    result = await db.execute(query)
    article = result.scalars().unique().one_or_none()
    if not article:
        return None
    # 序列化为 dict（便于 JSON 缓存）
    return {
        "id": str(article.id),
        "title": article.title,
        "content": article.content,
        "author": {"id": str(article.author.id), "username": article.author.username},
        "view_count": article.view_count,
    }


async def update_article(db: AsyncSession, article: Article, article_in: ArticleUpdate) -> Article:
    """更新文章时清除缓存"""
    # ... 更新逻辑 ...
    await db.commit()

    # 清除该文章的缓存
    await invalidate_cache(key_prefix="article:detail", article_id=str(article.id))
    return article
\`\`\`

### 3.4 缓存常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| **缓存穿透** | 查询不存在的数据，每次都打到 DB | 缓存空值（短 TTL）、布隆过滤器 |
| **缓存击穿** | 热点 key 过期瞬间大量请求打到 DB | 互斥锁、热点 key 永不过期 |
| **缓存雪崩** | 大量 key 同时过期 | TTL 加随机偏移、多级缓存 |

## 四、API 版本控制

随着业务迭代，API 不可避免地需要升级。版本控制让旧客户端继续工作，同时支持新功能。

### 4.1 版本控制策略

| 策略 | 实现 | 优点 | 缺点 |
|------|------|------|------|
| **URL 路径** | \`/api/v1/articles\`、\`/api/v2/articles\` | 直观、易调试 | URL 变长 |
| **Header** | \`Api-Version: 2\` | URL 不变 | 不直观 |
| **Query 参数** | \`/articles?version=2\` | 简单 | 容易遗漏 |

\`\`\`python filename="API 版本控制实现"
from fastapi import APIRouter

# v1 路由
router_v1 = APIRouter(prefix="/api/v1")

@router_v1.get("/articles/{id}")
async def get_article_v1(id: str):
    """v1: 返回简要信息"""
    return {"id": id, "title": "old format"}


# v2 路由
router_v2 = APIRouter(prefix="/api/v2")

@router_v2.get("/articles/{id}")
async def get_article_v2(id: str):
    """v2: 返回详细信息（新增字段）"""
    return {
        "id": id,
        "title": "new format",
        "summary": "added in v2",
        "tags": [],
        "author": {"id": 1, "name": "author"}
    }

# 在 main.py 中注册
app.include_router(router_v1)
app.include_router(router_v2)
\`\`\`

## 五、限流

限流保护服务不被流量打垮。常见的限流算法：

| 算法 | 原理 | 特点 |
|------|------|------|
| **固定窗口** | 每个时间窗口内固定请求数 | 简单，有临界突刺 |
| **滑动窗口** | 窗口随时间滑动 | 平滑，实现稍复杂 |
| **令牌桶** | 按速率往桶里放令牌，请求消耗令牌 | 允许突发流量 |
| **漏桶** | 请求像水滴匀速漏出 | 严格匀速 |

\`\`\`python filename="app/core/rate_limit.py"
import time
from collections import defaultdict
from fastapi import Request, HTTPException


class RateLimiter:
    """滑动窗口限流器（简化版，生产环境用 Redis 实现）"""

    def __init__(self, requests: int = 100, window: int = 60):
        self.requests = requests  # 窗口内最大请求数
        self.window = window      # 窗口大小（秒）
        self.history: dict[str, list[float]] = defaultdict(list)

    async def __call__(self, request: Request):
        client_ip = request.client.host
        now = time.time()

        # 清理窗口外的记录
        self.history[client_ip] = [
            t for t in self.history[client_ip]
            if now - t < self.window
        ]

        if len(self.history[client_ip]) >= self.requests:
            raise HTTPException(
                status_code=429,
                detail=f"请求过于频繁，每 {self.window} 秒限 {self.requests} 次",
                headers={"Retry-After": str(self.window)}
            )

        self.history[client_ip].append(now)


# 使用：作为依赖注入
rate_limiter = RateLimiter(requests=100, window=60)

@router.post("/articles", dependencies=[Depends(rate_limiter)])
async def create_article(...):
    pass
\`\`\`

## 六、监控（Prometheus）

可观测性三支柱：**日志（Logs）、指标（Metrics）、链路追踪（Tracing）**。

\`\`\`python filename="app/core/metrics.py"
from prometheus_client import Counter, Histogram, make_asgi_app

# 定义指标
REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"]
)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency",
    ["method", "endpoint"],
    buckets=[0.01, 0.05, 0.1, 0.5, 1, 5]  # 延迟分桶
)

# 暴露 /metrics 端点
metrics_app = make_asgi_app()

# 在 main.py 中挂载
# app.mount("/metrics", metrics_app)
\`\`\`

\`\`\`python filename="app/middleware.py（指标采集中间件）"
import time
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.metrics import REQUEST_COUNT, REQUEST_LATENCY


class MetricsMiddleware(BaseHTTPMiddleware):
    """采集每个请求的指标"""

    async def dispatch(self, request, call_next):
        start_time = time.time()
        response = await call_next(request)

        duration = time.time() - start_time
        method = request.method
        endpoint = request.url.path
        status = response.status_code

        REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=status).inc()
        REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(duration)

        return response
\`\`\`

Prometheus + Grafana 配合可以可视化 QPS、延迟分位、错误率等核心指标，并设置告警。

## 七、性能优化清单

| 优化方向 | 手段 | 预期收益 |
|----------|------|----------|
| **数据库** | 添加索引、N+1 查询优化（selectinload）、读写分离 | 10-100x |
| **缓存** | Redis 缓存热点数据 | 10-100x |
| **异步** | async/await、异步驱动（asyncpg） | 2-10x |
| **并发** | Gunicorn 多 worker、横向扩展 | 线性增长 |
| **网络** | Gzip 压缩、HTTP/2、CDN 静态资源 | 2-5x |
| **查询** | 分页、只查需要的字段、避免 SELECT * | 2-10x |

## 八、FastAPI 生态

| 库 | 用途 | 说明 |
|----|------|------|
| **SQLModel** | ORM | FastAPI 作者出品，融合 SQLAlchemy + Pydantic |
| **FastAPI-Users** | 用户系统 | 开箱即用的注册/登录/OAuth |
| **FastAPI-Cache** | 缓存 | 与 FastAPI 深度集成的缓存装饰器 |
| **FastAPI-Limiter** | 限流 | 基于 Redis 的限流 |
| **FastAPI-Admin** | 后台管理 | 自动生成管理后台 |
| **sqladmin** | 管理后台 | SQLAlchemy 集成的后台 |
| **alembic** | 数据库迁移 | SQLAlchemy 官方迁移工具 |
| **orjson** | JSON 序列化 | 比 json 快 3-10 倍 |

## 九、结语：Python Web 后端学习路线

恭喜你完成了整个 Python Web 后端教程！让我们回顾一下学习路径，并展望未来方向。

### 9.1 本教程回顾

| 阶段 | 内容 | 掌握程度 |
|------|------|----------|
| **入门** | Python 基础、HTTP 协议、FastAPI 第一个 API | 能写 CRUD 接口 |
| **进阶** | 路由、Pydantic、依赖注入、中间件 | 能设计规范 API |
| **数据库** | SQLAlchemy 2.0、异步 ORM、关系映射 | 能建模复杂业务 |
| **认证** | JWT、OAuth2、密码哈希、权限控制 | 能实现安全鉴权 |
| **实战** | 博客系统完整项目、分层架构 | 能独立开发项目 |
| **测试** | pytest、异步测试、覆盖率、CI | 能保证代码质量 |
| **部署** | Docker、Nginx、生产配置 | 能上线运维 |

### 9.2 进阶学习路线图

\`\`\`text
                        ┌─────────────────────┐
                        │   你现在在这里 ✅    │
                        │  能独立开发 Web API  │
                        └──────────┬──────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                     ▼
     ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐
     │  深入后端架构   │  │  数据与中间件   │  │  云原生与 DevOps  │
     │────────────────│  │─────────────────│  │──────────────────│
     │ • 微服务架构   │  │ • Redis 高级    │  │ • Kubernetes     │
     │ • 消息队列     │  │ • Elasticsearch │  │ • CI/CD 流水线   │
     │ • 分布式事务   │  │ • RabbitMQ/Kafka│  │ • Terraform      │
     │ • 领域驱动设计 │  │ • 图数据库      │  │ • 可观测性体系   │
     └────────────────┘  └─────────────────┘  └──────────────────┘
              │                    │                     │
              └────────────────────┼────────────────────┘
                                   ▼
                        ┌─────────────────────┐
                        │    全栈工程师 🚀    │
                        │  架构设计 + 运维    │
                        └─────────────────────┘
\`\`\`

### 9.3 推荐进阶资源

**书籍**：
- 《架构整洁之道》—— Robert C. Martin，理解软件架构的本质
- 《数据密集型应用系统设计》—— Martin Kleppmann，分布式系统圣经
- 《领域驱动设计》—— Eric Evans，复杂业务建模方法论
- 《Python Cookbook》—— David Beazley，Python 进阶技巧

**官方文档**：
- FastAPI 官方文档（https://fastapi.tiangolo.com）—— 最权威的参考
- SQLAlchemy 2.0 文档（https://docs.sqlalchemy.org）—— ORM 深入
- asyncio 文档（https://docs.python.org/3/library/asyncio.html）—— 异步编程

**开源项目学习**：
- FastAPI 源码 —— 学习框架设计哲学
- Reddit / GitHub API —— 学习大型 API 设计
- Django REST Framework —— 对比不同框架的设计思路

### 9.4 给学习者的建议

1. **动手实践**：教程只是地图，真正的能力在"写"中成长。把博客系统扩展成自己的项目——加图片上传、全文搜索、邮件通知、数据分析。
2. **读源码**：FastAPI 的源码非常优雅，阅读它会让你的 Python 水平质的飞跃。
3. **关注社区**：Python Web 生态在快速演进，关注 FastAPI 的 Release Notes 和 PEP 提案。
4. **教是最好的学**：写博客、分享、回答问题，输出倒逼输入。
5. **工程思维**：技术只是工具，理解业务、权衡利弊、做出取舍才是工程师的核心能力。

### 9.5 技术浪潮与 Python 的未来

Web 开发正在经历范式变迁：Serverless、边缘计算、AI 原生应用。但**核心原理是稳定的**——HTTP、数据库、并发、安全、架构设计，这些知识不会过时。Python 在 AI/ML 领域的地位无可撼动，FastAPI 已经成为 AI 应用后端的首选框架（LangChain、LlamaIndex 等都基于 FastAPI）。掌握 Python Web 后端，你同时打开了通往 AI 应用开发的大门。

> "程序员的终极竞争力不是某门语言或框架，而是**快速学习、抽象思考、解决真实问题**的能力。"

## 十、全教程总结

从 Python 基础到 FastAPI 实战，从数据库设计到 Docker 部署，我们一起走完了 Python Web 后端开发的完整旅程。希望这个教程不仅教会你"怎么写代码"，更帮助你理解"为什么这样写"。

技术世界浩瀚无垠，教程的终点只是你探索的起点。保持好奇心，持续学习，Happy Coding！🎉
`,
  },
];
